import { sfx, speak } from '../audio';
import { DECORATIONS, decoById, unlockedCount } from '../data';
import { go, type Screen } from '../router';
import { session, sessionProfile, startSession } from '../session';
import { save } from '../state';
import { decorIcon, decorInner, lightsSVG, TREE_TOP, TREE_VIEWBOX, treeSVG } from '../svg';
import { $, esc, onAction } from '../ui';

const SCALE = { ornament: 0.75, top: 1, lights: 1, under: 1.15 } as const;

export const tree: Screen = (root) => {
  const s = session();
  const p = sessionProfile();
  if (!s || !p) return go('home');

  const unlocked = unlockedCount(p.stars);
  const newFrom = p.seenUnlocked;
  p.seenUnlocked = Math.max(p.seenUnlocked, unlocked);
  save();
  const midSession = s.round > 0 && s.round < s.total;
  let selected: string | null = null;

  root.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-action="back" aria-label="Zpět">${midSession || s.round === 0 ? '⬅️' : '🏠'}</button>
      <h2 class="tree-title">${p.avatar} ${esc(p.name)}</h2>
      <span class="star-count">★ ${p.stars}</span>
    </header>
    <div class="tree-area">
      <svg class="tree-svg" viewBox="${TREE_VIEWBOX}" role="img" aria-label="Stromeček">
        ${treeSVG()}<g class="lights-layer"></g><g class="placed"></g>
      </svg>
    </div>
    <div class="tray"></div>
    ${s.round >= s.total ? `<button class="big-btn play" data-action="again">▶ Hrát</button>` : ''}`;

  const svg = $(root, '.tree-svg') as unknown as SVGSVGElement;
  const tray = $(root, '.tray');

  function render() {
    const placed = Object.entries(p!.decor);
    $(root, '.lights-layer').innerHTML = p!.decor.lights ? lightsSVG() : '';
    $(root, '.placed').innerHTML = placed
      .filter(([id]) => id !== 'lights')
      .map(([id, pos]) => {
        const d = decoById(id);
        if (!d) return '';
        return `<g data-deco="${id}" transform="translate(${pos.x} ${pos.y}) scale(${SCALE[d.kind]})"><g class="deco">${decorInner(id)}</g></g>`;
      })
      .join('');
    tray.innerHTML = DECORATIONS.map((d, i) => {
      if (i >= unlocked)
        return `<span class="tray-item locked" aria-label="${d.name}, zamčeno">${decorIcon(d.id)}<small>★${d.cost}</small></span>`;
      if (p!.decor[d.id]) return '';
      return `<button class="tray-item ${selected === d.id ? 'selected' : ''} ${i >= newFrom ? 'new' : ''}" data-action="select" data-id="${d.id}" aria-label="${d.name}">${decorIcon(d.id)}</button>`;
    }).join('');
  }

  function place(id: string, x: number, y: number) {
    const d = decoById(id)!;
    if (d.kind === 'top') ({ x, y } = TREE_TOP);
    if (d.kind === 'under') y = Math.max(y, 340);
    p!.decor[id] = { x: Math.round(x), y: Math.round(y) };
    selected = null;
    sfx('place');
    save();
    render();
  }

  const onSvgTap = (ev: PointerEvent) => {
    const hit = (ev.target as Element).closest('[data-deco], .lights');
    if (hit && !selected) {
      const id = hit.classList.contains('lights') ? 'lights' : (hit as SVGElement).dataset.deco!;
      delete p!.decor[id];
      sfx('pop');
      save();
      render();
      return;
    }
    if (!selected) return;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    place(selected, loc.x, loc.y);
  };
  svg.addEventListener('pointerup', onSvgTap);

  const off = onAction(root, (action, el) => {
    if (action === 'back') return go(midSession || s.round === 0 ? 'helper' : 'home');
    if (action === 'again') {
      startSession(p);
      return go('helper');
    }
    if (action === 'select') {
      const id = el.dataset.id!;
      const d = decoById(id)!;
      sfx('pop');
      if (d.kind === 'top' || d.kind === 'lights') return place(id, TREE_TOP.x, TREE_TOP.y);
      selected = selected === id ? null : id;
      render();
    }
  });

  render();
  speak(['tree']);

  return () => {
    off();
    svg.removeEventListener('pointerup', onSvgTap);
  };
};
