import { sfx, speak } from '../audio';
import { PHRASE_TEXT, TOYS, type Attr } from '../data';
import { adapt, LEVELS, starsFor } from '../difficulty';
import { makeRiddle, riddleKeys } from '../riddle';
import { go, type Screen } from '../router';
import { progressDots, session, sessionProfile } from '../session';
import { save } from '../state';
import { attrIcon, giftSVG, helperSVG, spotSVG, treeSVG, TREE_VIEWBOX } from '../svg';
import { $, $$, burst, onAction, starRow, wait } from '../ui';

const ATTR_ORDER: Attr[] = ['size', 'color', 'shape', 'pattern', 'bow'];
const INACTIVITY_MS = 15000;

export const game: Screen = (root) => {
  const s = session();
  const p = sessionProfile();
  if (!s || !p) return go('home');

  const level = LEVELS[p.progress.level];
  const mode: 'find' | 'hide' = s.round % 2 === 0 ? 'find' : 'hide';
  const r = makeRiddle(level);
  const target = r.gifts[r.target];
  const rKeys = riddleKeys(r);
  const chipAttrs = ATTR_ORDER.filter((a) => r.attrs.includes(a));
  const spotOffset = Math.floor(Math.random() * 6);

  root.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-action="home" aria-label="Domů">🏠</button>
      ${progressDots(s)}
      <span class="spacer"></span>
    </header>
    <section class="talk">
      <button class="helper-btn" data-action="repeat" aria-label="Zopakovat hádanku">${helperSVG(p.helper)}</button>
      <div class="bubble">
        <div class="chips">${chipAttrs.map((a) => `<span class="chip" data-attr="${a}">${attrIcon(a, target)}</span>`).join('')}</div>
        ${
          p.textMode !== 'hidden'
            ? `<p class="riddle-text">${rKeys.map((k, i) => `<span data-i="${i}">${PHRASE_TEXT[k]}</span>`).join(' ')}.</p>`
            : ''
        }
        <button class="speak-btn ${p.textMode === 'readFirst' ? 'pulse' : ''}" data-action="repeat" aria-label="Přečíst nahlas">🔊</button>
      </div>
    </section>
    <section class="stage stage-${mode}">
      ${
        mode === 'find'
          ? `<svg class="backdrop-tree" viewBox="${TREE_VIEWBOX}" aria-hidden="true">${treeSVG()}</svg>`
          : `<div class="room-window" aria-hidden="true"></div>`
      }
      <div class="gifts count-${r.gifts.length}">
        ${r.gifts
          .map(
            (g, i) => `
          <button class="slot" data-action="pick" data-i="${i}" aria-label="${mode === 'hide' ? 'Schovávačka' : 'Dárek'} ${i + 1}">
            <span class="gift size-${g.size}">${giftSVG(g)}</span>
            ${mode === 'hide' ? `<span class="cover">${spotSVG(i + spotOffset)}</span>` : ''}
          </button>`,
          )
          .join('')}
      </div>
    </section>
    <div class="overlay hidden"></div>`;

  const helperEl = $(root, '.helper-btn');
  const slots = $$<HTMLButtonElement>(root, '.slot');
  const overlay = $(root, '.overlay');

  let talkN = 0;
  /** Řekne hlášky; `offset` = kolik dílů předchází hádance (kvůli zvýraznění slov). */
  const say = (keys: string[], offset = 0) => {
    const my = ++talkN;
    helperEl.classList.add('talking');
    return speak(keys, (idx) => {
      $$(root, '.riddle-text span').forEach((sp) =>
        sp.classList.toggle('hl', idx.some((i) => i - offset === Number(sp.dataset.i))),
      );
    }).finally(() => {
      if (my === talkN) helperEl.classList.remove('talking');
    });
  };

  let hint = 0;
  let mistakes = 0;
  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const resetTimer = () => {
    clearTimeout(timer);
    if (!done && hint < 2) timer = setTimeout(() => (raiseHint(), resetTimer()), INACTIVITY_MS);
  };

  const uncover = (el: HTMLElement) => el.classList.add('open');

  function raiseHint() {
    if (done || hint >= 2) return;
    hint++;
    if (hint === 1) {
      const a = r.attrs[0];
      if (mode === 'hide') slots.forEach(uncover);
      slots.forEach((el, i) => el.classList.toggle('dim', r.gifts[i][a] !== target[a]));
      $(root, `.chip[data-attr="${a}"]`)?.classList.add('pulse');
      say(['hint', ...rKeys], 1);
    } else {
      const el = slots[r.target];
      uncover(el);
      el.classList.remove('dim');
      el.classList.add('glow');
      say(['hint']);
    }
  }

  async function win(el: HTMLElement) {
    done = true;
    clearTimeout(timer);
    slots.forEach((x) => x !== el && x.classList.add('fade'));
    el.classList.remove('glow', 'dim');
    el.classList.add('win');
    const toy = TOYS[Math.floor(Math.random() * TOYS.length)];
    el.insertAdjacentHTML('beforeend', `<span class="toy">${toy}</span>`);
    sfx('success');
    burst(el);

    const stars = starsFor(hint);
    p!.stars += stars;
    p!.rounds += 1;
    p!.progress = adapt(p!.progress, hint > 0);
    s!.starsGained += stars;
    s!.round += 1;
    save();

    say([`praise.${1 + Math.floor(Math.random() * 3)}`]);
    await wait(1500);
    if (!root.isConnected) return;
    overlay.innerHTML = `
      <div class="reward">
        <div class="toy big">${toy}</div>
        ${starRow(stars)}
        <button class="big-btn" data-action="next">Dál ▶</button>
      </div>`;
    overlay.classList.remove('hidden');
    for (let i = 0; i < stars; i++) setTimeout(() => sfx('star'), 300 + i * 350);
  }

  const off = onAction(root, (action, el) => {
    switch (action) {
      case 'home':
        return go('home');
      case 'repeat':
        resetTimer();
        el.classList.remove('pulse');
        return void say(rKeys);
      case 'next':
        return go(s.round >= s.total ? 'results' : 'helper');
      case 'pick': {
        if (done) return;
        resetTimer();
        const i = Number(el.dataset.i);
        if (mode === 'hide' && !el.classList.contains('open')) {
          uncover(el);
          sfx('pop');
          return;
        }
        if (i === r.target) return void win(el);
        el.classList.remove('shake');
        void el.offsetWidth; // restart animace
        el.classList.add('shake');
        sfx('wrong');
        mistakes++;
        if (mistakes % 2 === 0 && hint < 2) raiseHint();
        else say(['wrong']);
      }
    }
  });

  // Úvod kola
  const intro = async () => {
    await wait(350);
    if (!root.isConnected) return;
    if (p.textMode === 'readFirst') {
      if (mode === 'hide') await say(['hide.intro']);
    } else {
      await say(mode === 'hide' ? ['hide.intro', ...rKeys] : rKeys, mode === 'hide' ? 1 : 0);
    }
    resetTimer();
  };
  intro();

  return () => {
    done = true;
    clearTimeout(timer);
    off();
  };
};
