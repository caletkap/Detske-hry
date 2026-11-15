import { defineConfig, type Plugin } from 'vite';

/**
 * Vygeneruje jednoduchý service worker se seznamem všech souborů buildu,
 * aby hra po prvním načtení fungovala úplně offline.
 */
function offlineServiceWorker(): Plugin {
  return {
    name: 'offline-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const assets = ['./', ...files.map((f) => `./${f}`), './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
      const version = Date.now().toString(36);
      const source = `
const CACHE = 'darky-${version}';
const ASSETS = ${JSON.stringify([...new Set(assets)])};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).catch(() =>
        e.request.mode === 'navigate' ? caches.match('./') : Response.error(),
      );
    }),
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [offlineServiceWorker()],
  test: {
    include: ['tests/**/*.test.ts'],
  },
} as Parameters<typeof defineConfig>[0]);
