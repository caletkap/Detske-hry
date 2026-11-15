import { go, type Screen } from '../router';
import { startSession } from '../session';
import { getProfile, getState } from '../state';
import { esc, onAction } from '../ui';

export const home: Screen = (root) => {
  const { profiles } = getState();
  const flakes = Array.from(
    { length: 28 },
    (_, i) =>
      `<i style="--x:${(i * 37) % 100}%;--d:${6 + (i % 7)}s;--delay:-${(i * 1.3) % 9}s;--s:${0.5 + (i % 4) * 0.25}"></i>`,
  ).join('');

  root.innerHTML = `
    <div class="snow" aria-hidden="true">${flakes}</div>
    <h1 class="title">Dárky pod<br>stromečkem</h1>
    <p class="subtitle">${profiles.length ? 'Kdo bude hrát?' : 'Vítejte! Nejdřív přidejte hráče.'}</p>
    <div class="profiles">
      ${profiles
        .map(
          (p) => `<button class="profile-card" data-action="play" data-id="${p.id}">
            <span class="avatar">${p.avatar}</span>
            <span class="pname">${esc(p.name)}</span>
            <span class="pstars">★ ${p.stars}</span>
          </button>`,
        )
        .join('')}
      ${
        profiles.length === 0
          ? `<button class="profile-card add" data-action="add"><span class="avatar">➕</span><span class="pname">Přidat hráče</span></button>`
          : ''
      }
    </div>
    <button class="parent-btn" data-action="parent">⚙️ Pro rodiče</button>`;

  return onAction(root, (action, el) => {
    if (action === 'play') {
      const p = getProfile(el.dataset.id!);
      if (!p) return;
      startSession(p);
      go('helper');
    } else if (action === 'add') {
      go('gate', { next: 'parent', edit: 'new' });
    } else if (action === 'parent') {
      go('gate', { next: 'parent' });
    }
  });
};
