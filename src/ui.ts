export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T;
export const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll(sel)) as T[];

/** Delegované klepnutí na prvky s data-action. */
export function onAction(root: HTMLElement, handler: (action: string, el: HTMLElement, ev: Event) => void) {
  const fn = (ev: Event) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (el && root.contains(el) && !el.hasAttribute('disabled')) handler(el.dataset.action!, el, ev);
  };
  root.addEventListener('click', fn);
  return () => root.removeEventListener('click', fn);
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function starRow(filled: number, total = 3) {
  let s = '';
  for (let i = 0; i < total; i++) s += `<span class="star ${i < filled ? 'on' : ''}" style="--i:${i}">★</span>`;
  return `<div class="stars">${s}</div>`;
}

/** Konfety / jiskřičky v daném prvku. */
export function burst(host: HTMLElement, n = 24) {
  const colors = ['#ffd23f', '#ff70a6', '#3a86ff', '#7fd59a', '#e63946', '#9b5de5'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    const a = Math.random() * Math.PI * 2;
    const d = 60 + Math.random() * 120;
    p.style.setProperty('--dx', `${Math.cos(a) * d}px`);
    p.style.setProperty('--dy', `${Math.sin(a) * d - 40}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    p.style.background = colors[i % colors.length];
    host.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}
