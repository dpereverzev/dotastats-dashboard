import { PlayerStats } from "@/types/match";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface StatsOverviewProps {
  playerStats: Map<string, PlayerStats>;
  onPlayerSelect: (playerId: string) => void;
}

export const StatsOverview = ({ playerStats, onPlayerSelect }: StatsOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const sortedPlayers = useMemo(() => {
    return Array.from(playerStats.values())
      .filter(player => 
        player.playerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.mmr - a.mmr);
  }, [playerStats, searchQuery]);

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

      <div className="grid gap-4">
        {sortedPlayers.map((player, index) => (
          <Card
            key={player.playerId}
            className="p-4 cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
            onClick={() => onPlayerSelect(player.playerId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl font-bold text-primary w-16">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground truncate max-w-[200px]">
                    {player.playerName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {player.totalMatches} matches played
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {player.winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-success">
                    {player.wins}W
                  </div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-destructive">
                    {player.losses}L
                  </div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>

                <div className="text-center">
                  <div className={`text-lg font-semibold flex items-center gap-1 ${
                    player.mmrChange >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {player.mmrChange >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {player.mmrChange > 0 ? '+' : ''}{player.mmrChange}
                  </div>
                  <div className="text-xs text-muted-foreground">MMR</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
