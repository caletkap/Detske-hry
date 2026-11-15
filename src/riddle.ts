import { ATTR_VALUES, PHRASE_TEXT, SHAPE_BEFORE, type Attr, type Gift } from './data';
import type { Level } from './difficulty';

export type Rng = () => number;

export interface Riddle {
  gifts: Gift[];
  target: number;
  attrs: Attr[];
}

const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function otherValue<A extends Attr>(rng: Rng, attr: A, not: Gift[A]): Gift[A] {
  return pick(rng, ATTR_VALUES[attr].filter((v) => v !== not));
}

function randomGift(rng: Rng): Gift {
  return {
    color: pick(rng, ATTR_VALUES.color),
    shape: pick(rng, ATTR_VALUES.shape),
    size: pick(rng, ATTR_VALUES.size),
    pattern: pick(rng, ATTR_VALUES.pattern),
    bow: pick(rng, ATTR_VALUES.bow),
  };
}

export const matches = (g: Gift, t: Gift, attrs: Attr[]) => attrs.every((a) => g[a] === t[a]);

/** Vytvoří hádanku pro danou úroveň. Zaručuje, že popisu odpovídá právě jeden dárek. */
export function makeRiddle(level: Level, rng: Rng = Math.random): Riddle {
  const count = level.gifts[0] + Math.floor(rng() * (level.gifts[1] - level.gifts[0] + 1));
  const attrs = shuffle(rng, level.pool).slice(0, level.attrs);
  const target = randomGift(rng);
  if (attrs.includes('pattern') && target.pattern === 'plain') {
    target.pattern = pick(rng, ATTR_VALUES.pattern.filter((p) => p !== 'plain'));
  }

  const others: Gift[] = [];
  const decoys = attrs.length >= 2 ? Math.min(level.decoys, count - 1) : 0;
  for (let i = 0; i < count - 1; i++) {
    const g = randomGift(rng);
    if (i < decoys) {
      // Chyták: shoduje se ve všech vyřčených vlastnostech kromě jedné.
      const diff = attrs[i % attrs.length];
      for (const a of attrs) (g as Record<Attr, unknown>)[a] = target[a];
      (g as Record<Attr, unknown>)[diff] = otherValue(rng, diff, target[diff]);
    } else {
      // Ostatní se liší ve všech vyřčených vlastnostech.
      for (const a of attrs) (g as Record<Attr, unknown>)[a] = otherValue(rng, a, target[a]);
    }
    others.push(g);
  }

  // Pro nejmenší děti: ať se ostatní dárky liší i barvou, když se hledá velikost (lépe se rozlišují).
  if (level.id === 0) {
    for (const g of others) if (g.color === target.color) g.color = otherValue(rng, 'color', target.color);
  }

  const gifts = shuffle(rng, [target, ...others]);
  return { gifts, target: gifts.indexOf(target), attrs };
}

/** Klíče hlášek, ze kterých se hádanka skládá, ve správném pořadí. */
export function riddleKeys(r: Riddle): string[] {
  const t = r.gifts[r.target];
  const has = (a: Attr) => r.attrs.includes(a);
  const keys = ['find'];
  if (has('size')) keys.push(`size.${t.size}`);
  if (has('color')) keys.push(`color.${t.color}`);
  if (has('shape') && SHAPE_BEFORE.includes(t.shape)) keys.push(`shape.${t.shape}`);
  keys.push('gift');
  if (has('shape') && !SHAPE_BEFORE.includes(t.shape)) keys.push(`shape.${t.shape}`);
  if (has('pattern')) keys.push(`pattern.${t.pattern}`);
  if (has('bow')) keys.push(`bow.${t.bow}`);
  return keys;
}

export function riddleText(r: Riddle): string {
  const s = riddleKeys(r)
    .map((k) => PHRASE_TEXT[k])
    .join(' ');
  return s + '.';
}

/** Deterministický generátor náhodných čísel (pro testy). */
export function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
