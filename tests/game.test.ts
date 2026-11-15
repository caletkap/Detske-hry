import { describe, expect, it } from 'vitest';
import { PHRASE_TEXT } from '../src/data';
import { adapt, LEVELS, starsFor, type Progress } from '../src/difficulty';
import { makeRiddle, matches, riddleKeys, riddleText, seeded } from '../src/riddle';

describe('hádanky', () => {
  for (const level of LEVELS) {
    it(`úroveň ${level.name}: popisu odpovídá právě jeden dárek`, () => {
      for (let seed = 1; seed <= 500; seed++) {
        const r = makeRiddle(level, seeded(seed));
        const t = r.gifts[r.target];
        expect(r.gifts.length).toBeGreaterThanOrEqual(level.gifts[0]);
        expect(r.gifts.length).toBeLessThanOrEqual(level.gifts[1]);
        expect(r.attrs).toHaveLength(level.attrs);
        r.attrs.forEach((a) => expect(level.pool).toContain(a));
        const hits = r.gifts.filter((g) => matches(g, t, r.attrs));
        expect(hits).toHaveLength(1);
      }
    });
  }

  it('střední úroveň obsahuje chyták', () => {
    const level = LEVELS[2];
    for (let seed = 1; seed <= 100; seed++) {
      const r = makeRiddle(level, seeded(seed));
      const t = r.gifts[r.target];
      const near = r.gifts.filter((g) => g !== t && r.attrs.filter((a) => g[a] === t[a]).length === r.attrs.length - 1);
      expect(near.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('nejmenší: ostatní dárky mají jinou barvu', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const r = makeRiddle(LEVELS[0], seeded(seed));
      const t = r.gifts[r.target];
      r.gifts.filter((g) => g !== t).forEach((g) => expect(g.color).not.toBe(t.color));
    }
  });

  it('vzor v hádance nikdy není „bez vzoru“', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const r = makeRiddle(LEVELS[3], seeded(seed));
      if (r.attrs.includes('pattern')) expect(r.gifts[r.target].pattern).not.toBe('plain');
    }
  });

  it('věta hádanky má správný slovosled a všechny díly mají text', () => {
    const r = {
      gifts: [{ color: 'blue', shape: 'star', size: 'small', pattern: 'dots', bow: 'gold' } as const],
      target: 0,
      attrs: ['color', 'shape', 'size', 'pattern', 'bow'] as const,
    };
    const rr = { ...r, gifts: [...r.gifts], attrs: [...r.attrs] };
    expect(riddleText(rr)).toBe('Najdi malý modrý dárek ve tvaru hvězdy s puntíky se zlatou mašlí.');
    riddleKeys(rr).forEach((k) => expect(PHRASE_TEXT[k]).toBeTruthy());

    const box = { ...rr, gifts: [{ ...rr.gifts[0], shape: 'box' as const }], attrs: ['shape' as const, 'color' as const] };
    expect(riddleText(box)).toBe('Najdi modrý hranatý dárek.');
  });
});

describe('obtížnost', () => {
  const base: Progress = { level: 1, minLevel: 0, maxLevel: 2, locked: false, cleanStreak: 0, helpStreak: 0 };

  it('po 3 kolech bez nápovědy přitvrdí', () => {
    let p = base;
    p = adapt(p, false);
    p = adapt(p, false);
    expect(p.level).toBe(1);
    p = adapt(p, false);
    expect(p.level).toBe(2);
  });

  it('nepřekročí maximum', () => {
    let p = { ...base, level: 2 };
    for (let i = 0; i < 6; i++) p = adapt(p, false);
    expect(p.level).toBe(2);
  });

  it('po 2 kolech s nápovědou zjednoduší', () => {
    let p = adapt(base, true);
    expect(p.level).toBe(1);
    p = adapt(p, true);
    expect(p.level).toBe(0);
    p = adapt(adapt(p, true), true);
    expect(p.level).toBe(0);
  });

  it('kolo bez nápovědy přeruší řadu s nápovědou', () => {
    let p = adapt(base, true);
    p = adapt(p, false);
    p = adapt(p, true);
    expect(p.level).toBe(1);
  });

  it('zamčená obtížnost se nemění', () => {
    let p = { ...base, locked: true };
    for (let i = 0; i < 5; i++) p = adapt(p, false);
    expect(p.level).toBe(1);
  });

  it('hvězdičky: vždy aspoň jedna', () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(1)).toBe(2);
    expect(starsFor(2)).toBe(1);
  });
});
