import { sfx, speak } from '../audio';
import { DECORATIONS, unlockedCount } from '../data';
import { go, type Screen } from '../router';
import { session, sessionProfile, startSession } from '../session';
import { decorIcon, helperSVG } from '../svg';
import { $, burst, onAction } from '../ui';

export const results: Screen = (root) => {
  const s = session();
  const p = sessionProfile();
  if (!s || !p) return go('home');

  const fresh = DECORATIONS.slice(s.unlockedBefore, unlockedCount(p.stars));
  root.innerHTML = `
    <h2 class="screen-title">Hotovo!</h2>
    <div class="result-helper talking">${helperSVG(p.helper)}</div>
    <div class="gained"><span class="star on">★</span> +${s.starsGained}</div>
    ${
      fresh.length
        ? `<div class="fresh"><p>Nové ozdoby:</p><div class="fresh-list">${fresh
            .map((d) => `<span class="fresh-item" title="${d.name}">${decorIcon(d.id)}</span>`)
            .join('')}</div></div>`
        : ''
    }
    <div class="result-actions">
      <button class="big-btn" data-action="tree">🎄 Zdobit stromeček</button>
      <button class="big-btn secondary" data-action="again">▶ Hrát znovu</button>
      <button class="icon-btn" data-action="home" aria-label="Domů">🏠</button>
    </div>`;

  sfx('success');
  burst($(root, '.gained'), 30);
  speak(fresh.length ? ['end', 'newDeco'] : ['end']).finally(() =>
    $(root, '.result-helper')?.classList.remove('talking'),
  );

  return onAction(root, (action) => {
    if (action === 'tree') go('tree');
    else if (action === 'home') go('home');
    else if (action === 'again') {
      startSession(p);
      go('helper');
    }
  });
};
