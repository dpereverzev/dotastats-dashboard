import { Match, PlayerStats, HeadToHeadStats } from "@/types/match";

export const calculatePlayerStats = (matches: Match[], dateFrom?: Date, dateTo?: Date): Map<string, PlayerStats> => {
  const playerStatsMap = new Map<string, PlayerStats>();

  // Filter out cancelled matches and apply date filter
  let validMatches = matches.filter(match => match.winner !== -1 && match.winner !== 2 && match.game === 'dota');
  
  if (dateFrom || dateTo) {
    validMatches = validMatches.filter(match => {
      const matchDate = new Date(match.time);
      if (dateFrom && matchDate < dateFrom) return false;
      if (dateTo && matchDate > dateTo) return false;
      return true;
    });
  }
  
  validMatches = validMatches.sort((a, b) => b.game_num - a.game_num);

  validMatches.forEach(match => {
    match.teams.forEach((team, teamIndex) => {
      team.forEach(player => {
        // if (!player.picked) return;

        const won = match.winner === teamIndex;

        if (!playerStatsMap.has(player.id)) {
          playerStatsMap.set(player.id, {
            playerId: player.id,
            playerName: player.name,
            totalMatches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            averageMMR: 0,
            mmrChange: 1000,
            mmr: player.mmr
          });
        }

        const stats = playerStatsMap.get(player.id)!;
        stats.totalMatches++;
        if (won) {
          stats.wins++;
        } else {
          stats.losses++;
        }
        stats.averageMMR = (stats.averageMMR * (stats.totalMatches - 1) + player.mmr) / stats.totalMatches;
        stats.mmrChange += player.mmr_change;
      });
    });
  });

  // Calculate win rates
  playerStatsMap.forEach(stats => {
    stats.winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0;
  });

  return playerStatsMap;
};

export const calculateHeadToHead = (
  matches: Match[],
  player1Id: string,
  player2Id: string,
  dateFrom?: Date,
  dateTo?: Date
): HeadToHeadStats => {
  let matchesWithBoth = 0;
  let player1WinsWithPlayer2 = 0;
  let player1LosesWithPlayer2 = 0;
  let player1WinsAgainstPlayer2 = 0;
  let player1LossesAgainstPlayer2 = 0;

  let validMatches = matches.filter(match => match.winner !== -1);
  
  if (dateFrom || dateTo) {
    validMatches = validMatches.filter(match => {
      const matchDate = new Date(match.time);
      if (dateFrom && matchDate < dateFrom) return false;
      if (dateTo && matchDate > dateTo) return false;
      return true;
    });
  }

  validMatches.forEach(match => {
    const team0 = match.teams[0];
    const team1 = match.teams[1];

    const player1InTeam0 = team0.some(p => p.id === player1Id);
    const player1InTeam1 = team1.some(p => p.id === player1Id);
    const player2InTeam0 = team0.some(p => p.id === player2Id);
    const player2InTeam1 = team1.some(p => p.id === player2Id);

    const player1Present = player1InTeam0 || player1InTeam1;
    const player2Present = player2InTeam0 || player2InTeam1;

    if (!player1Present || !player2Present) return;

    matchesWithBoth++;

    // Same team
    if ((player1InTeam0 && player2InTeam0) || (player1InTeam1 && player2InTeam1)) {
      const player1Team = player1InTeam0 ? 0 : 1;
      if (match.winner === player1Team) {
        player1WinsWithPlayer2++;
      } else {
        player1LosesWithPlayer2++;
      }
    }
    // Opposing teams
    else {
      const player1Team = player1InTeam0 ? 0 : 1;
      if (match.winner === player1Team) {
        player1WinsAgainstPlayer2++;
      } else {
        player1LossesAgainstPlayer2++;
      }
    }
  });

  const totalAgainstMatches = player1WinsAgainstPlayer2 + player1LossesAgainstPlayer2;

  return {
    player1Id,
    player2Id,
    matchesWithBoth,
    player1WinsWithPlayer2,
    player1LosesWithPlayer2,
    player1WinsAgainstPlayer2,
    player1LossesAgainstPlayer2,
    winRateWith: player1WinsWithPlayer2 + player1LosesWithPlayer2 > 0 ? (player1WinsWithPlayer2 / (player1WinsWithPlayer2 + player1LosesWithPlayer2)) * 100 : 0,
    winRateAgainst: totalAgainstMatches > 0 ? (player1WinsAgainstPlayer2 / totalAgainstMatches) * 100 : 0,
  };
};

export const getHeadToHeadMatrix = (
  matches: Match[],
  playerIds: string[],
  dateFrom?: Date,
  dateTo?: Date
): Map<string, Map<string, HeadToHeadStats>> => {
  const matrix = new Map<string, Map<string, HeadToHeadStats>>();

  playerIds.forEach(player1Id => {
    const row = new Map<string, HeadToHeadStats>();
    playerIds.forEach(player2Id => {
      if (player1Id !== player2Id) {
        row.set(player2Id, calculateHeadToHead(matches, player1Id, player2Id, dateFrom, dateTo));
      }
    });
    matrix.set(player1Id, row);
  });

  return matrix;
};
