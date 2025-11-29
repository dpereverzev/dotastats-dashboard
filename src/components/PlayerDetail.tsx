import { PlayerStats, HeadToHeadStats } from "@/types/match";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Swords } from "lucide-react";

interface PlayerDetailProps {
  player: PlayerStats;
  h2hStats: Map<string, HeadToHeadStats>;
  allPlayers: Map<string, PlayerStats>;
  onBack: () => void;
}

export const PlayerDetail = ({ player, h2hStats, allPlayers, onBack }: PlayerDetailProps) => {
  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return "text-success";
    if (winRate >= 50) return "text-primary";
    return "text-destructive";
  };

  const sortedH2H = Array.from(h2hStats.entries())
    .map(([playerId, stats]) => ({
      player: allPlayers.get(playerId)!,
      stats,
    }))
    .filter(item => item.player)
    .sort((a, b) => {
      const totalA = a.stats.player1WinsAgainstPlayer2 + a.stats.player1LossesAgainstPlayer2;
      const totalB = b.stats.player1WinsAgainstPlayer2 + b.stats.player1LossesAgainstPlayer2;
      return totalB - totalA;
    });

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Overview
      </Button>

      <Card className="p-6">
        <h2 className="text-3xl font-bold mb-6 text-foreground">{player.playerName}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">{player.winRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-foreground">{player.totalMatches}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-success">{player.wins}W</div>
            <div className="text-sm text-muted-foreground mt-1">Wins</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-destructive">{player.losses}L</div>
            <div className="text-sm text-muted-foreground mt-1">Losses</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className={`text-2xl font-bold ${player.mmrChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {player.mmrChange > 0 ? '+' : ''}{player.mmrChange}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total MMR Change</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">{Math.round(player.averageMMR)}</div>
            <div className="text-sm text-muted-foreground mt-1">Average MMR</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Head-to-Head Performance
        </h3>
        
        <div className="space-y-2">
          {sortedH2H.map(({ player: opponent, stats }) => {
            const totalAgainst = stats.player1WinsAgainstPlayer2 + stats.player1LossesAgainstPlayer2;
            
            if (totalAgainst === 0) return null;

            return (
              <div key={opponent.playerId} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="font-medium text-foreground truncate max-w-[200px]">
                    {opponent.playerName}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-muted-foreground mb-1">Total matches:</div>
                    <div className="font-semibold text-foreground">
                      {stats.matchesWithBoth}
                    </div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-muted-foreground mb-1">With Teammate</div>
                    <div className={`text-lg font-bold ${getWinRateColor(stats.winRateWith)}`}>
                      {stats.winRateWith.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.player1WinsWithPlayer2}W - {stats.player1LosesWithPlayer2}L
                    </div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-muted-foreground mb-1">VS</div>
                    <div className={`text-lg font-bold ${getWinRateColor(stats.winRateAgainst)}`}>
                      {stats.winRateAgainst.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.player1WinsAgainstPlayer2}W - {stats.player1LossesAgainstPlayer2}L
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
