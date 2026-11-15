import { sfx, speak } from '../audio';
import { HELPERS, type HelperId } from '../data';
import { go, type Screen } from '../router';
import { progressDots, session, sessionProfile } from '../session';
import { save } from '../state';
import { helperSVG } from '../svg';
import { $$, onAction } from '../ui';

export const helper: Screen = (root) => {
  const s = session();
  const p = sessionProfile();
  if (!s || !p) return go('home');

  root.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-action="home" aria-label="Domů">🏠</button>
      ${progressDots(s)}
      ${s.round === 0 ? `<button class="icon-btn" data-action="tree" aria-label="Můj stromeček">🎄</button>` : '<span class="spacer"></span>'}
    </header>
    <h2 class="screen-title">Vyber si pomocníka</h2>
    <div class="helpers">
      ${HELPERS.map(
        (h) => `<button class="helper-card ${h.id === p.helper ? 'selected' : ''}" data-action="pick" data-id="${h.id}">
          ${helperSVG(h.id)}<span class="hname">${h.name}</span>
        </button>`,
      ).join('')}
    </div>
    <button class="big-btn play" data-action="play">Hrát ▶</button>`;

  const cards = $$(root, '.helper-card');
  let talkN = 0;

  const off = onAction(root, (action, el) => {
    if (action === 'home') return go('home');
    if (action === 'tree') return go('tree');
    if (action === 'play') {
      sfx('pop');
      return go('game');
    }
    if (action === 'pick') {
      const id = el.dataset.id as HelperId;
      p.helper = id;
      save();
      sfx('pop');
      cards.forEach((c) => c.classList.toggle('selected', c === el));
      const my = ++talkN;
      cards.forEach((c) => c.classList.remove('talking'));
      el.classList.add('talking');
      speak([`helper.${id}`]).finally(() => my === talkN && el.classList.remove('talking'));
    }
  });

  if (s.round === 0) speak(['pickHelper']);
  return off;
};
