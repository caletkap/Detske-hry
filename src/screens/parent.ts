import {
  applyVolumes,
  deleteRecording,
  saveRecording,
  speak,
  startRecording,
  stopVoice,
  unlockAudio,
} from '../audio';
import { AVATARS, PHRASES } from '../data';
import { LEVELS } from '../difficulty';
import { makeRiddle, riddleKeys } from '../riddle';
import { go, type Screen } from '../router';
import { getProfile, getState, newProfile, resetProgress, save, type Profile, type TextMode } from '../state';
import { idbKeys } from '../storage';
import { $, esc, onAction } from '../ui';

type Tab = 'profiles' | 'settings' | 'voice';

const TEXT_MODES: [TextMode, string][] = [
  ['hidden', 'Bez textu (jen obrázky)'],
  ['shown', 'Text i hlas'],
  ['readFirst', 'Čtecí režim (nejdřív číst, hlas na klepnutí)'],
];

const levelOptions = (sel: number) =>
  LEVELS.map((l) => `<option value="${l.id}" ${l.id === sel ? 'selected' : ''}>${l.name}</option>`).join('');

export const parent: Screen = (root, params) => {
  let tab: Tab = (params.tab as Tab) || 'profiles';
  let editing: string | null = params.edit ?? null;
  let recorded = new Set<string>();
  let recording: { key: string; stop: () => Promise<Blob> } | null = null;
  let message = '';

  const loadRecorded = async () => {
    const keys = await idbKeys();
    recorded = new Set(keys.filter((k) => k.startsWith('rec:')).map((k) => k.slice(4)));
  };

  function profilesTab(): string {
    const { profiles } = getState();
    if (editing) return profileForm(editing === 'new' ? null : getProfile(editing) ?? null);
    return `
      <div class="plist">
        ${profiles
          .map(
            (p) => `<div class="prow">
              <span class="avatar">${p.avatar}</span>
              <span class="pinfo"><b>${esc(p.name)}</b><br><small>${LEVELS[p.progress.level].name}${p.progress.locked ? ' (zamčeno)' : ''} · ★ ${p.stars} · odehráno kol: ${p.rounds}</small></span>
              <button class="btn" data-action="edit" data-id="${p.id}">Upravit</button>
            </div>`,
          )
          .join('')}
      </div>
      <button class="btn primary" data-action="edit" data-id="new">➕ Přidat hráče</button>`;
  }

  function profileForm(p: Profile | null): string {
    const pr = p?.progress;
    return `
      <form class="pform" onsubmit="return false">
        <h3>${p ? 'Upravit hráče' : 'Nový hráč'}</h3>
        <label>Jméno <input name="name" maxlength="20" required value="${esc(p?.name ?? '')}" autocomplete="off"></label>
        <fieldset class="avatars"><legend>Obrázek</legend>
          ${AVATARS.map(
            (a, i) =>
              `<label><input type="radio" name="avatar" value="${a}" ${(p ? p.avatar === a : i === 0) ? 'checked' : ''}><span>${a}</span></label>`,
          ).join('')}
        </fieldset>
        <label>Obtížnost (aktuální) <select name="level">${levelOptions(pr?.level ?? 0)}</select></label>
        <div class="row2">
          <label>Nejlehčí <select name="minLevel">${levelOptions(pr?.minLevel ?? 0)}</select></label>
          <label>Nejtěžší <select name="maxLevel">${levelOptions(pr?.maxLevel ?? 2)}</select></label>
        </div>
        <label class="check"><input type="checkbox" name="locked" ${pr?.locked ? 'checked' : ''}> Zamknout obtížnost (nepřizpůsobovat)</label>
        <label>Text hádanky <select name="textMode">${TEXT_MODES.map(
          ([v, t]) => `<option value="${v}" ${(p?.textMode ?? 'hidden') === v ? 'selected' : ''}>${t}</option>`,
        ).join('')}</select></label>
        <p class="hint-text">Tip: pro 4 roky „Nejmenší“ a bez textu, pro 6 let „Lehká“ a text i hlas.</p>
        <div class="form-actions">
          <button class="btn primary" data-action="saveProfile" data-id="${p?.id ?? ''}">Uložit</button>
          <button class="btn" data-action="cancel">Zpět</button>
        </div>
        ${
          p
            ? `<div class="danger">
              <button class="btn" data-action="resetProfile" data-id="${p.id}">Vynulovat hvězdičky a stromeček</button>
              <button class="btn danger-btn" data-action="deleteProfile" data-id="${p.id}">Smazat hráče</button>
            </div>`
            : ''
        }
      </form>`;
  }

  function settingsTab(): string {
    const s = getState().settings;
    const range = (name: string, val: number) =>
      `<input type="range" name="${name}" min="0" max="1" step="0.05" value="${val}">`;
    return `
      <form class="pform settings" onsubmit="return false">
        <label>Počet kol v jedné hře: <b class="rounds-val">${s.rounds}</b>
          <input type="range" name="rounds" min="3" max="8" step="1" value="${s.rounds}"></label>
        <label class="check"><input type="checkbox" name="musicOn" ${s.musicOn ? 'checked' : ''}> Hudba na pozadí</label>
        <label>Hlasitost hudby ${range('musicVol', s.musicVol)}</label>
        <label>Hlasitost zvuků ${range('sfxVol', s.sfxVol)}</label>
        <label>Hlasitost hlasu ${range('voiceVol', s.voiceVol)}</label>
      </form>`;
  }

  function voiceTab(): string {
    const groups = [...new Set(PHRASES.map((p) => p.group))];
    const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    return `
      <p class="hint-text">Namluvte hlášky vlastním hlasem. Co není nahrané, přečte syntetický hlas zařízení.
        Hádanky se skládají z kousků — mluvte přirozeně, krátce a bez pauzy na začátku.
        Nahráno ${recorded.size} z ${PHRASES.length}.</p>
      ${supported ? '' : '<p class="warn">Tento prohlížeč neumí nahrávat zvuk.</p>'}
      <button class="btn" data-action="sample">▶ Ukázka hádanky</button>
      ${groups
        .map(
          (g) => `<h3>${g}</h3>
        <div class="phrases">${PHRASES.filter((p) => p.group === g)
          .map((p) => {
            const isRec = recording?.key === p.key;
            const has = recorded.has(p.key);
            return `<div class="phrase ${has ? 'has' : ''}">
              <span class="ptext">${has ? '✅' : '⚪'} ${esc(p.text)}</span>
              <span class="pbtns">
                <button class="btn ${isRec ? 'rec' : ''}" data-action="${isRec ? 'stop' : 'record'}" data-key="${p.key}" ${
                  !supported || (recording && !isRec) ? 'disabled' : ''
                }>${isRec ? '■ Stop' : '● Nahrát'}</button>
                <button class="btn" data-action="play" data-key="${p.key}">▶</button>
                ${has ? `<button class="btn" data-action="delete" data-key="${p.key}" aria-label="Smazat nahrávku">🗑</button>` : ''}
              </span>
            </div>`;
          })
          .join('')}</div>`,
        )
        .join('')}`;
  }

  function render() {
    root.innerHTML = `
      <header class="topbar parent-top">
        <button class="btn" data-action="exit">⬅ Do hry</button>
        <h2>Pro rodiče</h2>
        <span class="spacer"></span>
      </header>
      <nav class="tabs">
        <button class="${tab === 'profiles' ? 'on' : ''}" data-action="tab" data-tab="profiles">Hráči</button>
        <button class="${tab === 'settings' ? 'on' : ''}" data-action="tab" data-tab="settings">Nastavení</button>
        <button class="${tab === 'voice' ? 'on' : ''}" data-action="tab" data-tab="voice">Nahrávky</button>
      </nav>
      ${message ? `<p class="msg">${esc(message)}</p>` : ''}
      <section class="parent-body">${tab === 'profiles' ? profilesTab() : tab === 'settings' ? settingsTab() : voiceTab()}</section>`;
    message = '';
  }

  function readForm(): Record<string, string | boolean> {
    const f = $(root, 'form') as HTMLFormElement;
    const out: Record<string, string | boolean> = {};
    for (const el of Array.from(f.elements) as HTMLInputElement[]) {
      if (!el.name) continue;
      if (el.type === 'checkbox') out[el.name] = el.checked;
      else if (el.type === 'radio') {
        if (el.checked) out[el.name] = el.value;
      } else out[el.name] = el.value;
    }
    return out;
  }

  const onInput = (e: Event) => {
    if (tab !== 'settings') return;
    const t = e.target as HTMLInputElement;
    const s = getState().settings;
    if (t.name === 'rounds') {
      s.rounds = Number(t.value);
      $(root, '.rounds-val').textContent = t.value;
    } else if (t.name === 'musicOn') s.musicOn = t.checked;
    else if (t.name in s) (s as unknown as Record<string, number>)[t.name] = Number(t.value);
    unlockAudio();
    applyVolumes();
    save();
  };
  root.addEventListener('input', onInput);

  const off = onAction(root, async (action, el) => {
    const { profiles } = getState();
    switch (action) {
      case 'exit':
        if (recording) await recording.stop();
        return go('home');
      case 'tab':
        tab = el.dataset.tab as Tab;
        editing = null;
        if (tab === 'voice') await loadRecorded();
        return render();
      case 'edit':
        editing = el.dataset.id!;
        return render();
      case 'cancel':
        editing = null;
        return render();
      case 'saveProfile': {
        const v = readForm();
        const name = String(v.name || '').trim();
        if (!name) {
          ($(root, 'input[name=name]') as HTMLInputElement).focus();
          return;
        }
        let p = el.dataset.id ? getProfile(el.dataset.id) : undefined;
        const level = Number(v.level);
        if (!p) {
          p = newProfile(name, String(v.avatar), level);
          profiles.push(p);
        }
        p.name = name;
        p.avatar = String(v.avatar);
        const min = Math.min(Number(v.minLevel), Number(v.maxLevel));
        const max = Math.max(Number(v.minLevel), Number(v.maxLevel));
        p.progress = {
          ...p.progress,
          minLevel: min,
          maxLevel: max,
          level: Math.max(min, Math.min(max, level)),
          locked: !!v.locked,
        };
        p.textMode = v.textMode as TextMode;
        save();
        editing = null;
        message = `Uloženo: ${name}`;
        return render();
      }
      case 'resetProfile': {
        const p = getProfile(el.dataset.id!);
        if (p && confirm(`Opravdu vynulovat hvězdičky a stromeček hráče ${p.name}?`)) {
          resetProgress(p);
          save();
          message = 'Postup vynulován.';
          editing = null;
          render();
        }
        return;
      }
      case 'deleteProfile': {
        const p = getProfile(el.dataset.id!);
        if (p && confirm(`Opravdu smazat hráče ${p.name}?`)) {
          getState().profiles = profiles.filter((x) => x.id !== p.id);
          save();
          editing = null;
          render();
        }
        return;
      }
      case 'record':
        try {
          unlockAudio();
          stopVoice();
          const r = await startRecording();
          recording = { key: el.dataset.key!, stop: r.stop };
        } catch {
          message = 'Mikrofon není dostupný. Povolte prosím přístup k mikrofonu.';
        }
        return render();
      case 'stop': {
        if (!recording) return;
        const { key, stop } = recording;
        recording = null;
        const blob = await stop();
        if (blob.size > 0) {
          await saveRecording(key, blob);
          recorded.add(key);
        }
        render();
        return void speak([key]);
      }
      case 'play':
        unlockAudio();
        return void speak([el.dataset.key!]);
      case 'delete':
        await deleteRecording(el.dataset.key!);
        recorded.delete(el.dataset.key!);
        return render();
      case 'sample': {
        unlockAudio();
        return void speak(riddleKeys(makeRiddle(LEVELS[2])));
      }
    }
  });

  (tab === 'voice' ? loadRecorded() : Promise.resolve()).then(render);

  return () => {
    off();
    root.removeEventListener('input', onInput);
    recording?.stop();
  };
};
