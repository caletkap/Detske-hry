import type { HelperId } from './data';
import { LEVELS, type Progress } from './difficulty';
import { idbGet, idbSet } from './storage';

export type TextMode = 'hidden' | 'shown' | 'readFirst';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  helper: HelperId;
  textMode: TextMode;
  progress: Progress;
  stars: number;
  rounds: number;
  /** Umístěné ozdoby: id → pozice ve stromečku (souřadnice SVG). */
  decor: Record<string, { x: number; y: number }>;
  /** Kolik ozdob už dítě vidělo odemčených (kvůli oznámení „nová ozdoba“). */
  seenUnlocked: number;
}

export interface Settings {
  rounds: number;
  musicOn: boolean;
  musicVol: number;
  sfxVol: number;
  voiceVol: number;
}

export interface AppState {
  version: 1;
  profiles: Profile[];
  settings: Settings;
}

const KEY = 'state';

export const defaultSettings = (): Settings => ({
  rounds: 5,
  musicOn: true,
  musicVol: 0.5,
  sfxVol: 0.8,
  voiceVol: 1,
});

let state: AppState = { version: 1, profiles: [], settings: defaultSettings() };

export async function loadState() {
  try {
    const s = await idbGet<AppState>(KEY);
    if (s && s.version === 1) {
      state = { ...s, settings: { ...defaultSettings(), ...s.settings } };
    }
  } catch (e) {
    console.warn('Nelze načíst uložený stav', e);
  }
}

export const getState = () => state;

let saveTimer: ReturnType<typeof setTimeout> | undefined;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    idbSet(KEY, state).catch((e) => console.warn('Nelze uložit stav', e));
  }, 150);
}

export const getProfile = (id: string) => state.profiles.find((p) => p.id === id);

export function newProfile(name: string, avatar: string, level: number): Profile {
  const lvl = Math.max(0, Math.min(LEVELS.length - 1, level));
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    avatar,
    helper: 'cat',
    textMode: lvl === 0 ? 'hidden' : 'shown',
    progress: {
      level: lvl,
      minLevel: 0,
      maxLevel: Math.min(LEVELS.length - 1, 2),
      locked: false,
      cleanStreak: 0,
      helpStreak: 0,
    },
    stars: 0,
    rounds: 0,
    decor: {},
    seenUnlocked: 1,
  };
}

export function resetProgress(p: Profile) {
  p.stars = 0;
  p.rounds = 0;
  p.decor = {};
  p.seenUnlocked = 1;
  p.progress = { ...p.progress, cleanStreak: 0, helpStreak: 0 };
}
