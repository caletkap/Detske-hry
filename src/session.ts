import { getProfile, getState, type Profile } from './state';

export interface Session {
  profileId: string;
  round: number;
  total: number;
  starsGained: number;
  unlockedBefore: number;
}

let current: Session | null = null;

export function startSession(p: Profile) {
  current = {
    profileId: p.id,
    round: 0,
    total: getState().settings.rounds,
    starsGained: 0,
    unlockedBefore: p.seenUnlocked,
  };
  return current;
}

export const session = () => current;

export function sessionProfile(): Profile | undefined {
  return current ? getProfile(current.profileId) : undefined;
}

export function progressDots(s: Session) {
  let d = '';
  for (let i = 0; i < s.total; i++) d += `<i class="${i < s.round ? 'done' : i === s.round ? 'now' : ''}"></i>`;
  return `<div class="dots" aria-label="Kolo ${Math.min(s.round + 1, s.total)} z ${s.total}">${d}</div>`;
}
