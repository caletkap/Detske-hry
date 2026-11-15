# Dárky pod stromečkem — zadání hry

Pracovní název. Hra pro dvě dcery (6 a 4 roky) na tablet a telefon.

## 1. Smysl hry

Dítě si s pomocníkem prohlíží vánoční pokoj se stromečkem a hledá **správný dárek**.
Pomocník řekne hádanku (např. *„Hledáme dárek pro tatínka. Je modrý a má zlatou mašli.“*)
a dítě vybírá podle barvy, tvaru, velikosti, vzoru, počtu nebo zvuku. Správný dárek se
rozbalí a dítě získá odměnu.

**Co se dítě učí:** barvy, tvary, porovnávání velikostí, počítání, paměť, pozornost,
předložky („pod“, „za“, „vedle“) a u starší dcery i čtení krátkých slov a vět.

## 2. Cílová zařízení

- Tablet a telefon (na výšku i na šířku), ovládání jen dotykem.
- Dotykové plochy alespoň 64 × 64 px, žádná gesta s více prsty, žádné tažení na přesnost
  (výjimka: volitelné „zatřes dárkem“ — klepnutí nebo skutečné zatřesení telefonem).
- Webová aplikace instalovatelná na plochu (PWA), plně funkční offline.

## 3. Pomocník

- Před začátkem každého kola dítě vybere pomocníka: **kočička Tlapička** (výchozí),
  **skřítek Cinkálek**, **sob Humpal**.
- Výběr je jedna obrazovka se třemi velkými obrázky; poslední volba je předvybraná,
  takže stačí klepnout na „Hrát“.
- Pomocníci se liší vzhledem, animacemi a vlastní sadou nahraných hlášek; herně jsou stejní.
- Všechny postavy a grafika jsou originální.

## 4. Pravidla

- **Žádné prohrávání, žádný časovač, žádné životy.**
- Po špatném výběru dárek zavrtí hlavou a pomocník řekne „Ten ne, zkus jiný“.
- **Nápověda** po 2 chybách nebo 15 s nečinnosti:
  1. stupeň — zvýrazní se jedna vlastnost z hádanky (např. modrá barva bliká v bublině),
  2. stupeň — správný dárek se lehce zatřese / zazáří.
- Hádanku lze kdykoliv přehrát znovu klepnutím na pomocníka.
- Kolo trvá 1–3 minuty, sezení 5–8 kol (nastavitelné rodičem).

## 5. Texty a hlas

- Všechny pokyny jsou **namluvené rodiči** (vlastní nahrávky).
- Starší dcera čte krátká slova a věty → hádanka se zobrazí i jako **krátký text**
  (velké písmo, slova zvýrazňovaná synchronně s hlasem). U mladší dcery text skrytý,
  jen obrázkové symboly vlastností (barevná tečka, tvar, velikost).
- Volitelný „čtecí režim“ pro starší dceru: hádanka se nejdřív jen zobrazí textem,
  hlas až po klepnutí na reproduktor (procvičení čtení).
- **Nahrávání v aplikaci:** rodičovská zóna obsahuje seznam hlášek (každá s textem
  k přečtení), u každé tlačítko Nahrát / Přehrát / Znovu. Nahrávky se ukládají
  v zařízení. Chybějící nahrávka → záložní syntetický hlas prohlížeče (cs-CZ),
  aby hra fungovala i před nahráním všeho.
- Hlášky se skládají z dílů (např. „Hledáme dárek…“ + „modrý“ + „s hvězdičkami“),
  aby počet nahrávek zůstal rozumný (odhad 80–120 krátkých nahrávek na pomocníka;
  rodič může nahrát jen jednu sadu sdílenou všemi pomocníky).

## 6. Typy kol (minihry)

| # | Název | Popis | MVP |
|---|---|---|---|
| 1 | Najdi podle popisu | Hádanka s 1–3 vlastnostmi. | ✅ |
| 2 | Schovávaná | Dárky schované v pokoji (za gaučem, pod dekou, v botě), dítě je odkrývá a hledá ten správný. | ✅ |
| 3 | Zatřes dárkem | Po klepnutí dárek zazní (zvonek, míček, pískátko), dítě pozná obsah. | |
| 4 | Pamatovák | Pomocník ukáže dárek, strom se zakryje, dárky se zamíchají. | |
| 5 | Spočítej | „Kolik dárků má hvězdičky?“ / „Dej pod stromeček 4 dárky.“ | |
| 6 | Komu patří | Přiřazení dárku k postavě podle indicie (prut → dědeček). | |

Vlastnosti dárků: barva (6), tvar (krabice, válec, koule, hvězda), velikost (malý/velký,
u těžší úrovně i střední), vzor (puntíky, proužky, hvězdičky, bez vzoru), barva mašle.

## 7. Úrovně obtížnosti

| Parametr | Nejmenší | Lehká | Střední | Těžší |
|---|---|---|---|---|
| Počet dárků | 2–3 | 3–4 | 5–7 | 8–12 |
| Vlastností v hádance | 1 (jen barva/velikost) | 1 | 2 | 3 + předložka |
| Podobné „chytáky“ | ne | ne | 1 | více |
| Pamatovák (dárků) | — | 1 | 2 | 3 |
| Počítání | — | do 5 | do 10 | porovnávání |
| Text hádanky | skrytý | volitelný | zobrazen | zobrazen / čtecí režim |

- Úroveň **Nejmenší** je výchozí pro mladší dceru (4 roky), **Lehká** pro starší (6 let).
- **Adaptivní obtížnost:** 3 kola v řadě bez nápovědy → přitvrdí se jeden parametr;
  2 kola s nápovědou → jeden se zjednoduší. Pohyb jen v rozsahu povoleném rodičem.
- Rodič může obtížnost pro profil zamknout.

## 8. Gamifikace

Pozitivní, bez nátlaku, bez nákupů, reklam a žebříčků.

- **Hvězdičky za kolo:** 1–3 (1 vždy, 2 = s jednou nápovědou, 3 = bez nápovědy).
- **Vlastní stromeček:** za hvězdičky se odemykají ozdoby, světýlka, špičky a zvířátka
  pod strom; dítě je samo rozmisťuje. Každá dcera má svůj stromeček.
- **Album samolepek:** obsah rozbalených dárků se sbírá do alba.
- **Adventní kalendář (1.–24. 12.):** každý den jedno okénko (nové kolo nebo ozdoba);
  slouží i jako přirozený denní limit. Mimo advent běží hra ve volném režimu.
- **Finále — skutečný dárek:** rodič v rodičovské zóně zadá pro každé dítě indicii
  ke skutečně schovanému dárku (fotka místa + namluvená věta, např. „Hledej u knihovny“).
  Odemkne se v nastavený den (výchozí 24. 12.) po dokončení kola.
  Může být více indicií za sebou (stopovačka po bytě).
- Žádné „ztratíš sérii“, žádné negativní zvuky.

## 9. Profily a rodičovská zóna

- **Profily dětí bez hesla:** obrázek/zvířátko + jméno (zadá rodič, jméno lze namluvit).
  Úvodní obrazovka = velké obrázky profilů.
- **Rodičovská zóna** chráněná zámkem pro dospělé (podržet tlačítko 3 s + jednoduchý
  příklad typu 7 × 8). Obsahuje:
  - správu profilů (přidat, upravit, smazat, resetovat postup),
  - obtížnost a její zámek, délku sezení, denní limit,
  - nahrávání hlášek (kap. 5),
  - zadání indicií pro finále (kap. 8),
  - přehled: kolik kol, které vlastnosti jdou dobře a které méně.
- **Data jen v zařízení** (IndexedDB), žádné osobní údaje mimo zařízení, žádný server.
  Export/import zálohy do souboru (přenos nahrávek a postupu mezi tabletem a telefonem).
  Cloudová synchronizace případně později.

## 10. Technické řešení (návrh)

- TypeScript + Vite, PWA (service worker, manifest), offline.
- Scéna jako SVG/DOM s CSS animacemi (jednoduché, dobře škálovatelné, ostré na všech
  displejích); herní engine zatím není potřeba.
- Audio: Web Audio / HTMLAudio, nahrávání přes MediaRecorder, úložiště IndexedDB.
- Testy: Vitest (logika generování hádanek a obtížnosti), Playwright (hlavní průchody
  na rozlišení tabletu a telefonu).
- Přístupnost: velké prvky, vysoký kontrast, respektování „omezit pohyb“.

### Hudba a zvuky

- Klidná vánoční hudba na pozadí (originální nebo s volnou licencí, ve smyčce).
- Při mluvení pomocníka se hudba automaticky ztiší.
- Rodičovská zóna: zvlášť hlasitost hudby, zvuků a hlasu; hudbu lze vypnout.

## 11. MVP (první verze) — ✅ hotovo

1. Výběr profilu (2 profily) a pomocníka (kočička Tlapička výchozí).
   Hudba na pozadí.
2. Minihry 1 (Najdi podle popisu) a 2 (Schovávaná), úrovně Nejmenší–Střední.
3. Nápověda, hvězdičky, zdobení vlastního stromečku.
4. Rodičovská zóna: profily, obtížnost, nahrávání hlášek, záložní syntetický hlas.
5. Instalace jako PWA, offline.

**Druhá verze:** finále se skutečným dárkem, adventní kalendář, album samolepek,
minihry 3–6, export/import zálohy, přehled pro rodiče.

## 12. Otevřené otázky

- Žádné.
