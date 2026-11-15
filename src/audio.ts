// Zvuk: hlas (nahrávky rodičů / záložní syntetický hlas), hudba na pozadí a zvukové efekty.

import { PHRASE_TEXT } from './data';
import { getState } from './state';
import { idbDel, idbGet, idbSet } from './storage';

let ctx: AudioContext | null = null;
let musicGain: GainNode, sfxGain: GainNode, voiceGain: GainNode, duckGain: GainNode;

function ac(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    musicGain = ctx.createGain();
    duckGain = ctx.createGain();
    sfxGain = ctx.createGain();
    voiceGain = ctx.createGain();
    musicGain.connect(duckGain).connect(ctx.destination);
    sfxGain.connect(ctx.destination);
    voiceGain.connect(ctx.destination);
    applyVolumes();
  }
  return ctx;
}

/** Musí se zavolat z uživatelské akce (klepnutí) — prohlížeče jinak zvuk nepustí. */
export function unlockAudio() {
  const c = ac();
  if (c.state === 'suspended') c.resume().catch(() => undefined);
  const st = getState().settings;
  if (st.musicOn && !musicTimer) startMusic();
}

export function applyVolumes() {
  if (!ctx) return;
  const s = getState().settings;
  musicGain.gain.value = s.musicOn ? s.musicVol * 0.35 : 0;
  sfxGain.gain.value = s.sfxVol * 0.6;
  voiceGain.gain.value = s.voiceVol;
  if (s.musicOn && !musicTimer) startMusic();
  if (!s.musicOn && musicTimer) stopMusic();
}

function duck(on: boolean) {
  if (!ctx) return;
  const t = ctx.currentTime;
  duckGain.gain.cancelScheduledValues(t);
  duckGain.gain.setTargetAtTime(on ? 0.25 : 1, t, 0.15);
}

// ---------- nahrávky ----------

const recKey = (key: string) => `rec:${key}`;
const bufferCache = new Map<string, AudioBuffer | null>();

export async function saveRecording(key: string, blob: Blob) {
  await idbSet(recKey(key), blob);
  bufferCache.delete(key);
}
export async function deleteRecording(key: string) {
  await idbDel(recKey(key));
  bufferCache.delete(key);
}
export async function hasRecording(key: string) {
  return !!(await idbGet<Blob>(recKey(key)));
}

async function loadBuffer(key: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(key)) return bufferCache.get(key)!;
  let buf: AudioBuffer | null = null;
  try {
    const blob = await idbGet<Blob>(recKey(key));
    if (blob) buf = await ac().decodeAudioData(await blob.arrayBuffer());
  } catch (e) {
    console.warn('Nahrávku nelze přehrát', key, e);
  }
  bufferCache.set(key, buf);
  return buf;
}

// ---------- mluvení ----------

let speakToken = 0;
let currentSource: AudioBufferSourceNode | null = null;
let czVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (czVoice !== undefined && czVoice !== null) return czVoice;
  const voices = typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : [];
  czVoice = voices.find((v) => v.lang.toLowerCase().startsWith('cs')) ?? null;
  return czVoice;
}
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => {
    czVoice = undefined;
    pickVoice();
  };
}

function playBuffer(buf: AudioBuffer): Promise<void> {
  return new Promise((resolve) => {
    const src = ac().createBufferSource();
    src.buffer = buf;
    src.connect(voiceGain);
    src.onended = () => resolve();
    currentSource = src;
    src.start();
  });
}

function tts(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined') return setTimeout(resolve, 400);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'cs-CZ';
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 0.9;
    u.pitch = 1.1;
    u.volume = getState().settings.voiceVol;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    // Pojistka: některé prohlížeče nevyšlou „end“.
    setTimeout(finish, 1500 + text.length * 110);
    speechSynthesis.speak(u);
  });
}

export function stopVoice() {
  speakToken++;
  try {
    currentSource?.stop();
  } catch {
    /* už dohrálo */
  }
  currentSource = null;
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  duck(false);
}

/**
 * Řekne posloupnost hlášek. Nahrané díly přehraje, nenahrané spojí a přečte syntetickým hlasem.
 * onPiece dostane indexy právě vyslovovaných dílů (kvůli zvýrazňování slov).
 */
export async function speak(keys: string[], onPiece?: (idx: number[]) => void): Promise<void> {
  stopVoice();
  const token = speakToken;
  const bufs = await Promise.all(keys.map(loadBuffer));
  if (token !== speakToken) return;

  type Seg = { buf?: AudioBuffer; text?: string; idx: number[] };
  const segs: Seg[] = [];
  keys.forEach((k, i) => {
    const b = bufs[i];
    const last = segs[segs.length - 1];
    if (b) segs.push({ buf: b, idx: [i] });
    else if (last && !last.buf) {
      last.text += ' ' + (PHRASE_TEXT[k] ?? k);
      last.idx.push(i);
    } else segs.push({ text: PHRASE_TEXT[k] ?? k, idx: [i] });
  });

  duck(true);
  for (const s of segs) {
    if (token !== speakToken) return;
    onPiece?.(s.idx);
    if (s.buf) await playBuffer(s.buf);
    else await tts(s.text!);
  }
  if (token !== speakToken) return;
  onPiece?.([]);
  duck(false);
}

// ---------- zvukové efekty ----------

function bell(freq: number, when: number, dur: number, vol: number, dest: AudioNode, type: OscillatorType = 'sine') {
  const c = ac();
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  g.connect(dest);
  for (const [mult, amp] of [
    [1, 1],
    [2.01, 0.3],
    [3.98, 0.08],
  ]) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = type;
    o.frequency.value = freq * mult;
    og.gain.value = amp;
    o.connect(og).connect(g);
    o.start(when);
    o.stop(when + dur + 0.05);
  }
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

export type Sfx = 'pop' | 'wrong' | 'success' | 'star' | 'sparkle' | 'place';

export function sfx(kind: Sfx) {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.01;
  switch (kind) {
    case 'pop':
      bell(midi(79), t, 0.18, 0.5, sfxGain);
      break;
    case 'place':
      bell(midi(84), t, 0.3, 0.4, sfxGain);
      bell(midi(91), t + 0.06, 0.3, 0.25, sfxGain);
      break;
    case 'wrong':
      bell(midi(67), t, 0.25, 0.35, sfxGain, 'triangle');
      bell(midi(64), t + 0.16, 0.35, 0.35, sfxGain, 'triangle');
      break;
    case 'success':
      [72, 76, 79, 84].forEach((n, i) => bell(midi(n), t + i * 0.1, 0.8, 0.45, sfxGain));
      break;
    case 'star':
      bell(midi(88), t, 0.6, 0.45, sfxGain);
      break;
    case 'sparkle':
      for (let i = 0; i < 6; i++) bell(midi(84 + Math.floor(Math.random() * 12)), t + i * 0.06, 0.4, 0.2, sfxGain);
      break;
  }
}

// ---------- hudba na pozadí (původní melodie generovaná v prohlížeči) ----------

let musicTimer: ReturnType<typeof setInterval> | null = null;
let nextBeat = 0;
let beatIndex = 0;

// Akordy C – Am – F – G, dvakrát; melodie je pevně daná, aby se smyčka dala poznat.
const CHORDS = [
  [48, 55, 64],
  [45, 52, 60],
  [41, 48, 57],
  [43, 50, 59],
];
const MELODY: (number | null)[] = [
  76, null, 79, 76, 72, null, 74, 76,
  72, null, 76, 72, 69, null, 71, 72,
  69, null, 72, 77, 76, null, 74, 72,
  71, null, 74, 79, 74, null, null, null,
  76, null, 79, 84, 83, null, 79, 76,
  72, null, 76, 81, 79, null, 76, 72,
  77, null, 76, 74, 72, null, 69, 72,
  74, null, 71, 67, 72, null, null, null,
];
const BEAT = 60 / 92 / 2; // osminy při 92 BPM

export function startMusic() {
  if (musicTimer || !ctx) return;
  nextBeat = ctx.currentTime + 0.2;
  musicTimer = setInterval(() => {
    if (!ctx) return;
    while (nextBeat < ctx.currentTime + 0.4) {
      const i = beatIndex % MELODY.length;
      const note = MELODY[i];
      if (note) bell(midi(note), nextBeat, 1.2, 0.22, musicGain);
      if (i % 8 === 0) {
        const chord = CHORDS[Math.floor(i / 8) % CHORDS.length];
        chord.forEach((n, k) => bell(midi(n), nextBeat + k * 0.04, 2.6, 0.12, musicGain, 'triangle'));
      }
      nextBeat += BEAT;
      beatIndex++;
    }
  }, 100);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- nahrávání (rodičovská zóna) ----------

export async function startRecording(): Promise<{ stop: () => Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const rec = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: rec.mimeType }));
        };
        rec.stop();
      }),
  };
}
