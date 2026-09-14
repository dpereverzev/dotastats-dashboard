export const TOTAL_CAPTAINS = 8;
export const PICKS_PER_CAPTAIN = 4;
export const TOTAL_PICKS = TOTAL_CAPTAINS * PICKS_PER_CAPTAIN;

export interface Player {
  id: string;
  name: string;
  steam_raw: string;
  mmr: number;
  roles: string;
  is_captain: boolean;
}

export interface Pick {
  id: string;
  pick_number: number;
  captain_id: string;
  player_id: string;
}

export interface DraftState {
  id: string;
  started: boolean;
  pick_order: string[];
  started_at: string | null;
}

/** Snake order: 1..8, then 8..1, then 1..8, then 8..1 */
export const captainIndexForPick = (pickIndex: number) => {
  const round = Math.floor(pickIndex / TOTAL_CAPTAINS);
  const slot = pickIndex % TOTAL_CAPTAINS;
  return round % 2 === 0 ? slot : TOTAL_CAPTAINS - 1 - slot;
};

export const normalizeSteam = (value: string) => {
  let v = value.trim().replace(/\/+$/, '');
  if (v.includes('steamcommunity.com')) v = v.split('/').pop() ?? v;
  return v.toLowerCase();
};
