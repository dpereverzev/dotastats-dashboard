export interface Player {
  name: string;
  id: string;
  mmr: number;
  role?: string | null;
  team_num: number;
  mmr_change: number;
  picked: boolean;
  [key: string]: any; // Allow additional properties
}

export interface Match {
  game: string;
  time: string;
  teams: Player[][];
  winner: number; // 0 = team 0 won, 1 = team 1 won, -1 = cancelled
  game_num?: number;
  [key: string]: any; // Allow additional properties
}

export interface MatchData {
  data: Match[];
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageMMR: number;
  mmrChange: number;
  mmr: number;
}

export interface HeadToHeadStats {
  player1Id: string;
  player2Id: string;
  matchesWithBoth: number;
  player1WinsWithPlayer2: number;
  player1LosesWithPlayer2: number;
  player1WinsAgainstPlayer2: number;
  player1LossesAgainstPlayer2: number;
  winRateWith: number;
  winRateAgainst: number;
}
