import { PlayerStats, Match } from "@/types/match";
import { Card } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Users, Swords } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamVsTeamBuilderProps {
  playerStats: Map<string, PlayerStats>;
  matches: Match[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface TeamVsTeamResult {
  totalGames: number;
  team1Wins: number;
  team2Wins: number;
}

const calculateTeamVsTeam = (
  matches: Match[],
  team1Ids: string[],
  team2Ids: string[],
  dateFrom?: Date,
  dateTo?: Date
): TeamVsTeamResult => {
  if (team1Ids.length === 0 || team2Ids.length === 0) {
    return { totalGames: 0, team1Wins: 0, team2Wins: 0 };
  }

  let validMatches = matches.filter(match => match.winner !== -1 && match.winner !== 2 && match.game === 'dota');
  
  if (dateFrom || dateTo) {
    validMatches = validMatches.filter(match => {
      const matchDate = new Date(match.time);
      if (dateFrom && matchDate < dateFrom) return false;
      if (dateTo && matchDate > dateTo) return false;
      return true;
    });
  }

  let totalGames = 0;
  let team1Wins = 0;
  let team2Wins = 0;

  validMatches.forEach(match => {
    const matchTeam0Ids = match.teams[0].map(p => p.id);
    const matchTeam1Ids = match.teams[1].map(p => p.id);

    // Check if all team1 players are in the same match team and all team2 players are in opposing team
    const team1InTeam0 = team1Ids.every(id => matchTeam0Ids.includes(id));
    const team1InTeam1 = team1Ids.every(id => matchTeam1Ids.includes(id));
    const team2InTeam0 = team2Ids.every(id => matchTeam0Ids.includes(id));
    const team2InTeam1 = team2Ids.every(id => matchTeam1Ids.includes(id));

    // Team1 vs Team2 scenario (opposing teams)
    if ((team1InTeam0 && team2InTeam1) || (team1InTeam1 && team2InTeam0)) {
      totalGames++;
      const team1MatchTeam = team1InTeam0 ? 0 : 1;
      if (match.winner === team1MatchTeam) {
        team1Wins++;
      } else {
        team2Wins++;
      }
    }
  });

  return { totalGames, team1Wins, team2Wins };
};

export const TeamVsTeamBuilder = ({ playerStats, matches, dateFrom, dateTo }: TeamVsTeamBuilderProps) => {
  const [team1, setTeam1] = useState<PlayerStats[]>([]);
  const [team2, setTeam2] = useState<PlayerStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);

  const allPlayers = useMemo(() => {
    return Array.from(playerStats.values()).sort((a, b) => b.mmr - a.mmr);
  }, [playerStats]);

  const filteredPlayers = useMemo(() => {
    const team1Ids = team1.map(p => p.playerId);
    const team2Ids = team2.map(p => p.playerId);
    return allPlayers.filter(p => 
      p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !team1Ids.includes(p.playerId) &&
      !team2Ids.includes(p.playerId)
    );
  }, [allPlayers, searchQuery, team1, team2]);

  const result = useMemo(() => {
    return calculateTeamVsTeam(
      matches,
      team1.map(p => p.playerId),
      team2.map(p => p.playerId),
      dateFrom,
      dateTo
    );
  }, [matches, team1, team2, dateFrom, dateTo]);

  const addToTeam = (player: PlayerStats) => {
    if (activeTeam === 1 && team1.length < 5) {
      setTeam1([...team1, player]);
    } else if (activeTeam === 2 && team2.length < 5) {
      setTeam2([...team2, player]);
    }
    setSearchQuery("");
  };

  const removeFromTeam1 = (playerId: string) => {
    setTeam1(team1.filter(p => p.playerId !== playerId));
  };

  const removeFromTeam2 = (playerId: string) => {
    setTeam2(team2.filter(p => p.playerId !== playerId));
  };

  const clearAll = () => {
    setTeam1([]);
    setTeam2([]);
  };

  const team1WinRate = result.totalGames > 0 ? (result.team1Wins / result.totalGames) * 100 : 0;

  // Calculate teammate suggestions
  const suggestions = useMemo(() => {
    if (team1.length === 0 || team2.length === 0 || team1.length >= 5) {
      return [];
    }

    const team1Ids = team1.map(p => p.playerId);
    const team2Ids = team2.map(p => p.playerId);
    const availablePlayers = allPlayers.filter(p => 
      !team1Ids.includes(p.playerId) && !team2Ids.includes(p.playerId)
    );

    const playerResults = availablePlayers.map(player => {
      const testTeam1 = [...team1Ids, player.playerId];
      const res = calculateTeamVsTeam(matches, testTeam1, team2Ids, dateFrom, dateTo);
      const winRate = res.totalGames > 0 ? (res.team1Wins / res.totalGames) * 100 : -1;
      return { player, ...res, winRate };
    }).filter(r => r.totalGames > 0);

    return playerResults.sort((a, b) => b.totalGames - a.totalGames);
  }, [team1, team2, allPlayers, matches, dateFrom, dateTo]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Swords className="h-5 w-5" />
          Team vs Team Builder
        </h3>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team 1 */}
        <div 
          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${activeTeam === 1 ? 'border-primary bg-primary/5' : 'border-border'}`}
          onClick={() => setActiveTeam(1)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">Team 1 ({team1.length}/5)</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[32px]">
            {team1.map(player => (
              <Badge key={player.playerId} variant="secondary" className="flex items-center gap-1">
                {player.playerName}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={(e) => { e.stopPropagation(); removeFromTeam1(player.playerId); }}
                />
              </Badge>
            ))}
            {team1.length === 0 && <span className="text-sm text-muted-foreground">Click to add players</span>}
          </div>
        </div>

        {/* Results */}
        <div className="p-3 rounded-lg bg-muted flex flex-col items-center justify-center">
          {result.totalGames > 0 ? (
            <>
              <div className="text-2xl font-bold">
                <span className="text-primary">{result.team1Wins}</span>
                <span className="text-muted-foreground mx-2">-</span>
                <span className="text-destructive">{result.team2Wins}</span>
              </div>
              <div className="text-sm text-muted-foreground">{result.totalGames} games</div>
              <div className={`text-sm font-medium mt-1 ${team1WinRate >= 50 ? 'text-success' : 'text-destructive'}`}>
                Team 1: {team1WinRate.toFixed(1)}%
              </div>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Select players to see results</span>
          )}
        </div>

        {/* Team 2 */}
        <div 
          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${activeTeam === 2 ? 'border-destructive bg-destructive/5' : 'border-border'}`}
          onClick={() => setActiveTeam(2)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-destructive" />
            <span className="font-medium">Team 2 ({team2.length}/5)</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[32px]">
            {team2.map(player => (
              <Badge key={player.playerId} variant="outline" className="flex items-center gap-1">
                {player.playerName}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={(e) => { e.stopPropagation(); removeFromTeam2(player.playerId); }}
                />
              </Badge>
            ))}
            {team2.length === 0 && <span className="text-sm text-muted-foreground">Click to add players</span>}
          </div>
        </div>
      </div>

      {/* Player Search */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search to add to Team ${activeTeam}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <ScrollArea className="h-[200px] mt-2 border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredPlayers.slice(0, 20).map(player => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => addToTeam(player)}
                >
                  <span className="font-medium">{player.playerName}</span>
                  <span className="text-sm text-muted-foreground">{player.mmr} MMR</span>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No players found</div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Teammate Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 p-3 rounded-lg border border-border">
          <h4 className="font-medium mb-2">Teammate Stats vs Team 2 (sorted by games played)</h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {suggestions.map((s) => (
                <div 
                  key={s.player.playerId} 
                  className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-muted cursor-pointer"
                  onClick={() => { if (team1.length < 5) addToTeam(s.player); }}
                >
                  <span className="font-medium">{s.player.playerName}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">{s.totalGames} games</span>
                    <span className={s.winRate >= 50 ? 'text-success' : 'text-destructive'}>
                      {s.winRate.toFixed(0)}% ({s.team1Wins}-{s.team2Wins})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
};
