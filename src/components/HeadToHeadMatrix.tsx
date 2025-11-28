import { PlayerStats, HeadToHeadStats } from "@/types/match";
import { Card } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeadToHeadMatrixProps {
  playerStats: Map<string, PlayerStats>;
  h2hMatrix: Map<string, Map<string, HeadToHeadStats>>;
}

export const HeadToHeadMatrix = ({ playerStats, h2hMatrix }: HeadToHeadMatrixProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = useMemo(() => {
    return Array.from(playerStats.values())
      .filter(player => 
        player.playerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 15);
  }, [playerStats, searchQuery]);

  const getWinRateColor = (winRate: number, matches: number) => {
    if (matches === 0) return "bg-muted text-muted-foreground";
    if (winRate >= 60) return "bg-success/20 text-success font-semibold";
    if (winRate >= 50) return "bg-primary/20 text-primary font-semibold";
    return "bg-destructive/20 text-destructive font-semibold";
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="p-6 overflow-x-auto">
        <div className="text-sm text-muted-foreground mb-4">
          Win rate when playing <span className="text-primary font-semibold">against</span> each player
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card z-10 p-2 text-left border-b border-r border-border min-w-[150px]">
                <div className="font-semibold text-foreground">Player</div>
              </th>
              {filteredPlayers.map((player) => (
                <th key={player.playerId} className="p-2 border-b border-border min-w-[80px]">
                  <div className="text-xs font-medium text-foreground truncate max-w-[80px] transform -rotate-45 origin-left">
                    {player.playerName}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player1) => (
              <tr key={player1.playerId} className="hover:bg-muted/50">
                <td className="sticky left-0 bg-card z-10 p-2 border-r border-b border-border">
                  <div className="font-medium text-foreground truncate max-w-[150px]">
                    {player1.playerName}
                  </div>
                </td>
                {filteredPlayers.map((player2) => {
                  if (player1.playerId === player2.playerId) {
                    return (
                      <td key={player2.playerId} className="p-2 border-b border-border">
                        <div className="h-12 flex items-center justify-center bg-muted/50">
                          <span className="text-muted-foreground">—</span>
                        </div>
                      </td>
                    );
                  }

                  const h2h = h2hMatrix.get(player1.playerId)?.get(player2.playerId);
                  const totalAgainst = (h2h?.player1WinsAgainstPlayer2 || 0) + (h2h?.player1LossesAgainstPlayer2 || 0);
                  const winRate = h2h?.winRateAgainst || 0;

                  return (
                    <td key={player2.playerId} className="p-2 border-b border-border">
                      <div className={`h-12 rounded flex flex-col items-center justify-center ${getWinRateColor(winRate, totalAgainst)}`}>
                        {totalAgainst > 0 ? (
                          <>
                            <div className="text-sm font-bold">{winRate.toFixed(0)}%</div>
                            <div className="text-[10px] opacity-70">
                              {h2h?.player1WinsAgainstPlayer2}-{h2h?.player1LossesAgainstPlayer2}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
