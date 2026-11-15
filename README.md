# Dárky pod stromečkem

Vánoční hra pro děti (4–6 let) na tablet a telefon: pomocník (kočička Tlapička, skřítek
Cinkálek nebo sob Humpal) zadá hádanku a dítě hledá správný dárek. Za hvězdičky si zdobí
vlastní stromeček. Podrobné zadání je v [docs/ZADANI.md](docs/ZADANI.md).

## Spuštění

```bash
npm ci
npm run dev        # vývojový server (http://localhost:5173, --host pro tablet v síti)
npm run build      # produkční build do dist/ (PWA, funguje offline)
npm run preview    # náhled buildu
```

## Testy

```bash
npm test                          # logika hádanek a obtížnosti (Vitest)
npm run build && npm run e2e      # průchod celou hrou v prohlížeči (tablet + telefon)
```

E2E test používá Playwright, který je v cloudovém prostředí předinstalovaný
(`NODE_PATH=$(npm root -g) npm run e2e`). Snímky obrazovky uloží, když nastavíte `SHOTS=složka`.

## Instalace na tablet / telefon

Nahrajte obsah `dist/` na libovolný statický hosting (HTTPS), otevřete v prohlížeči
a zvolte „Přidat na plochu“. Hra pak běží celá offline; profily, postup i nahrávky
zůstávají jen v zařízení.

## Struktura

- `src/data.ts` — vlastnosti dárků, hlášky k namluvení, pomocníci, ozdoby
- `src/riddle.ts` — generování hádanek (vždy právě jedno správné řešení)
- `src/difficulty.ts` — úrovně a adaptivní obtížnost
- `src/audio.ts` — nahrávky rodičů, záložní syntetický hlas, hudba, efekty
- `src/svg.ts` — veškerá grafika (vlastní SVG)
- `src/screens/` — obrazovky: úvod, pomocník, hra, výsledky, stromeček, zámek, rodiče
