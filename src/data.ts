// Herní data: vlastnosti dárků, slova hádanek, pomocníci, ozdoby, hlášky.

export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'] as const;
export const SHAPES = ['box', 'ball', 'star', 'heart'] as const;
export const SIZES = ['small', 'big'] as const;
export const PATTERNS = ['plain', 'dots', 'stripes', 'stars'] as const;
export const BOWS = ['gold', 'silver'] as const;

export type Color = (typeof COLORS)[number];
export type Shape = (typeof SHAPES)[number];
export type Size = (typeof SIZES)[number];
export type Pattern = (typeof PATTERNS)[number];
export type Bow = (typeof BOWS)[number];

export interface Gift {
  color: Color;
  shape: Shape;
  size: Size;
  pattern: Pattern;
  bow: Bow;
}

export type Attr = keyof Gift;
export const ATTR_VALUES: { [A in Attr]: readonly Gift[A][] } = {
  color: COLORS,
  shape: SHAPES,
  size: SIZES,
  pattern: PATTERNS,
  bow: BOWS,
};

export const COLOR_HEX: Record<Color, { base: string; dark: string; light: string }> = {
  red: { base: '#e63946', dark: '#a4161a', light: '#ff8a93' },
  blue: { base: '#3a86ff', dark: '#1d4ed8', light: '#9cc3ff' },
  green: { base: '#2a9d4b', dark: '#1b6b32', light: '#7fd59a' },
  yellow: { base: '#ffd23f', dark: '#d19b00', light: '#fff1a8' },
  purple: { base: '#9b5de5', dark: '#6a2bb8', light: '#cfb0f5' },
  pink: { base: '#ff70a6', dark: '#d63d7a', light: '#ffc2d9' },
};

export const BOW_HEX: Record<Bow, { base: string; dark: string }> = {
  gold: { base: '#f7b801', dark: '#a87400' },
  silver: { base: '#d6dde5', dark: '#7d8a99' },
};

/** Všechny hlášky, které lze namluvit. Klíč = id nahrávky. */
export interface Phrase {
  key: string;
  text: string;
  group: string;
}

const P = (group: string, list: [string, string][]): Phrase[] =>
  list.map(([key, text]) => ({ key, text, group }));

export const PHRASES: Phrase[] = [
  ...P('Hádanka', [
    ['find', 'Najdi'],
    ['gift', 'dárek'],
  ]),
  ...P('Velikost', [
    ['size.small', 'malý'],
    ['size.big', 'velký'],
  ]),
  ...P('Barva', [
    ['color.red', 'červený'],
    ['color.blue', 'modrý'],
    ['color.green', 'zelený'],
    ['color.yellow', 'žlutý'],
    ['color.purple', 'fialový'],
    ['color.pink', 'růžový'],
  ]),
  ...P('Tvar', [
    ['shape.box', 'hranatý'],
    ['shape.ball', 'kulatý'],
    ['shape.star', 've tvaru hvězdy'],
    ['shape.heart', 've tvaru srdce'],
  ]),
  ...P('Vzor', [
    ['pattern.dots', 's puntíky'],
    ['pattern.stripes', 's proužky'],
    ['pattern.stars', 's hvězdičkami'],
  ]),
  ...P('Mašle', [
    ['bow.gold', 'se zlatou mašlí'],
    ['bow.silver', 'se stříbrnou mašlí'],
  ]),
  ...P('Pomocníci', [
    ['helper.cat', 'Ahoj, já jsem Tlapička!'],
    ['helper.elf', 'Ahoj, já jsem skřítek Cinkálek!'],
    ['helper.deer', 'Ahoj, já jsem sob Humpal!'],
  ]),
  ...P('Hra', [
    ['who', 'Kdo bude hrát?'],
    ['pickHelper', 'Vyber si pomocníka.'],
    ['hide.intro', 'Dárky se schovaly. Ťukej na schovávačky!'],
    ['wrong', 'Ten ne, zkus jiný.'],
    ['hint', 'Podívej se pořádně.'],
    ['praise.1', 'Výborně!'],
    ['praise.2', 'Hurá, to je on!'],
    ['praise.3', 'Super, máš ho!'],
    ['newDeco', 'Máš novou ozdobu na stromeček!'],
    ['end', 'Všechny dárky jsou nalezené! Pojď zdobit stromeček.'],
    ['tree', 'Ťukni na ozdobu a pak na stromeček.'],
  ]),
];

export const PHRASE_TEXT: Record<string, string> = Object.fromEntries(
  PHRASES.map((p) => [p.key, p.text]),
);

/** Tvary, které se v hádance říkají před slovem „dárek“ (přídavné jméno). */
export const SHAPE_BEFORE: readonly Shape[] = ['box', 'ball'];

export type HelperId = 'cat' | 'elf' | 'deer';
export const HELPERS: { id: HelperId; name: string; title: string }[] = [
  { id: 'cat', name: 'Tlapička', title: 'kočička Tlapička' },
  { id: 'elf', name: 'Cinkálek', title: 'skřítek Cinkálek' },
  { id: 'deer', name: 'Humpal', title: 'sob Humpal' },
];

export const AVATARS = ['🦊', '🐰', '🐻', '🦉', '🐱', '🐶', '🦄', '🐧', '🐼', '🐸', '🐿️', '🦔'];

/** Hračky, které se objeví po rozbalení dárku. */
export const TOYS = ['🧸', '🚂', '🎨', '🪀', '🦖', '🎈', '🪁', '🧩', '🎺', '🛼', '🪆', '📚', '🦄', '⚽', '🎹', '🚁'];

export type DecoKind = 'ornament' | 'top' | 'lights' | 'under';
export interface Decoration {
  id: string;
  name: string;
  cost: number;
  kind: DecoKind;
}

export const DECORATIONS: Decoration[] = [
  { id: 'ball-red', name: 'Červená baňka', cost: 0, kind: 'ornament' },
  { id: 'star-top', name: 'Hvězda na špičku', cost: 3, kind: 'top' },
  { id: 'ball-blue', name: 'Modrá baňka', cost: 6, kind: 'ornament' },
  { id: 'bell', name: 'Zvoneček', cost: 9, kind: 'ornament' },
  { id: 'lights', name: 'Světýlka', cost: 12, kind: 'lights' },
  { id: 'cane', name: 'Cukrová hůlka', cost: 16, kind: 'ornament' },
  { id: 'ball-gold', name: 'Zlatá baňka', cost: 20, kind: 'ornament' },
  { id: 'snowflake', name: 'Vločka', cost: 25, kind: 'ornament' },
  { id: 'gingerbread', name: 'Perníček', cost: 30, kind: 'ornament' },
  { id: 'ball-purple', name: 'Fialová baňka', cost: 36, kind: 'ornament' },
  { id: 'heart', name: 'Srdíčko', cost: 42, kind: 'ornament' },
  { id: 'teddy', name: 'Medvídek', cost: 50, kind: 'under' },
  { id: 'ball-pink', name: 'Růžová baňka', cost: 58, kind: 'ornament' },
  { id: 'snowman', name: 'Sněhulák', cost: 66, kind: 'under' },
  { id: 'ball-green', name: 'Zelená baňka', cost: 75, kind: 'ornament' },
  { id: 'present', name: 'Dárek', cost: 85, kind: 'under' },
  { id: 'bird', name: 'Ptáček', cost: 95, kind: 'ornament' },
  { id: 'ball-silver', name: 'Stříbrná baňka', cost: 110, kind: 'ornament' },
];

export const decoById = (id: string) => DECORATIONS.find((d) => d.id === id);

export const unlockedCount = (stars: number) => DECORATIONS.filter((d) => d.cost <= stars).length;
