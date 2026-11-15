import { stopVoice } from './audio';

export type Cleanup = (() => void) | void;
export type Screen = (root: HTMLElement, params: Record<string, string>) => Cleanup;

const screens = new Map<string, Screen>();
let cleanup: Cleanup;
let root: HTMLElement;

export function register(name: string, screen: Screen) {
  screens.set(name, screen);
}

export function init(el: HTMLElement) {
  root = el;
}

export function go(name: string, params: Record<string, string> = {}) {
  if (cleanup) cleanup();
  stopVoice();
  root.innerHTML = '';
  root.className = `screen screen-${name}`;
  const s = screens.get(name);
  if (!s) throw new Error(`Neznámá obrazovka ${name}`);
  cleanup = s(root, params);
  window.scrollTo(0, 0);
}
