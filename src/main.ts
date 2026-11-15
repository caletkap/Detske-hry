import './styles.css';
import { unlockAudio } from './audio';
import { go, init, register } from './router';
import { game } from './screens/game';
import { gate } from './screens/gate';
import { helper } from './screens/helper';
import { home } from './screens/home';
import { parent } from './screens/parent';
import { results } from './screens/results';
import { tree } from './screens/tree';
import { loadState } from './state';
import { requestPersistence } from './storage';

register('home', home);
register('helper', helper);
register('game', game);
register('results', results);
register('tree', tree);
register('gate', gate);
register('parent', parent);

// Zvuk smí začít až po prvním dotyku.
window.addEventListener('pointerdown', unlockAudio, { capture: true });

// Zabránit nechtěnému přiblížení dvojitým klepnutím / gestem (iOS).
document.addEventListener('gesturestart', (e) => e.preventDefault());

async function boot() {
  await loadState();
  requestPersistence();
  init(document.getElementById('app')!);
  go('home');
}
boot();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service worker', e));
  });
}
