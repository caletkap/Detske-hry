import type { Attr } from './data';

export interface Level {
  id: number;
  name: string;
  /** Rozsah počtu dárků [min, max]. */
  gifts: [number, number];
  /** Kolik vlastností zazní v hádance. */
  attrs: number;
  /** Z jakých vlastností se hádanka skládá. */
  pool: Attr[];
  /** Počet „chytáků“ — dárků, které se od hledaného liší jen v jedné vyřčené vlastnosti. */
  decoys: number;
}

export const LEVELS: Level[] = [
  { id: 0, name: 'Nejmenší', gifts: [2, 3], attrs: 1, pool: ['color', 'size'], decoys: 0 },
  { id: 1, name: 'Lehká', gifts: [3, 4], attrs: 1, pool: ['color', 'size', 'shape', 'pattern'], decoys: 0 },
  { id: 2, name: 'Střední', gifts: [5, 7], attrs: 2, pool: ['color', 'size', 'shape', 'pattern', 'bow'], decoys: 1 },
  { id: 3, name: 'Těžší', gifts: [8, 10], attrs: 3, pool: ['color', 'size', 'shape', 'pattern', 'bow'], decoys: 3 },
];

export const MAX_LEVEL = LEVELS.length - 1;

export interface Progress {
  level: number;
  minLevel: number;
  maxLevel: number;
  locked: boolean;
  /** Kola v řadě bez nápovědy. */
  cleanStreak: number;
  /** Kola v řadě s nápovědou. */
  helpStreak: number;
}

/** Adaptivní obtížnost: 3 kola bez nápovědy → těžší, 2 kola s nápovědou → lehčí. */
export function adapt(p: Progress, usedHint: boolean): Progress {
  const n = { ...p };
  if (usedHint) {
    n.helpStreak += 1;
    n.cleanStreak = 0;
    if (!n.locked && n.helpStreak >= 2 && n.level > n.minLevel) {
      n.level -= 1;
      n.helpStreak = 0;
    }
  } else {
    n.cleanStreak += 1;
    n.helpStreak = 0;
    if (!n.locked && n.cleanStreak >= 3 && n.level < n.maxLevel) {
      n.level += 1;
      n.cleanStreak = 0;
    }
  }
  return n;
}

/** Hvězdičky za kolo: 3 bez nápovědy, 2 s jednou nápovědou, jinak 1 (vždy aspoň 1). */
export function starsFor(hintLevel: number): number {
  return hintLevel <= 0 ? 3 : hintLevel === 1 ? 2 : 1;
}
