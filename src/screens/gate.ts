import { go, type Screen } from '../router';
import { $, onAction } from '../ui';

const HOLD_MS = 3000;

/** Zámek pro dospělé: podržet tlačítko 3 s a pak vyřešit příklad na násobení. */
export const gate: Screen = (root, params) => {
  const { next = 'parent', ...rest } = params;
  let a = 0;
  let b = 0;
  let input = '';
  let holdTimer: ReturnType<typeof setTimeout> | undefined;

  function stageHold() {
    root.innerHTML = `
      <header class="topbar"><button class="icon-btn" data-action="home" aria-label="Domů">🏠</button><span class="spacer"></span></header>
      <div class="gate">
        <h2>Pro rodiče</h2>
        <p>Podržte tlačítko 3 vteřiny.</p>
        <button class="hold-btn" aria-label="Podržet"><span class="hold-fill"></span><span>🔒</span></button>
      </div>`;
    const btn = $(root, '.hold-btn');
    const start = (e: Event) => {
      e.preventDefault();
      btn.classList.add('holding');
      holdTimer = setTimeout(stageMath, HOLD_MS);
    };
    const cancel = () => {
      btn.classList.remove('holding');
      clearTimeout(holdTimer);
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function newQuestion() {
    a = 6 + Math.floor(Math.random() * 4);
    b = 6 + Math.floor(Math.random() * 4);
    input = '';
  }

  function stageMath() {
    newQuestion();
    renderMath();
  }

  function renderMath(wrong = false) {
    root.innerHTML = `
      <header class="topbar"><button class="icon-btn" data-action="home" aria-label="Domů">🏠</button><span class="spacer"></span></header>
      <div class="gate">
        <h2>Kolik je ${a} × ${b}?</h2>
        <div class="answer ${wrong ? 'shake' : ''}" aria-live="polite">${input || '&nbsp;'}</div>
        <div class="keypad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-action="digit" data-n="${n}">${n}</button>`).join('')}
          <button data-action="clear" aria-label="Smazat">⌫</button>
          <button data-action="digit" data-n="0">0</button>
          <button data-action="ok" class="ok">OK</button>
        </div>
      </div>`;
  }

  const off = onAction(root, (action, el) => {
    if (action === 'home') return go('home');
    if (action === 'digit' && input.length < 3) input += el.dataset.n;
    if (action === 'clear') input = input.slice(0, -1);
    if (action === 'ok') {
      if (Number(input) === a * b) return go(next, rest);
      newQuestion();
      return renderMath(true);
    }
    renderMath();
  });

  stageHold();
  return () => {
    off();
    clearTimeout(holdTimer);
  };
};
