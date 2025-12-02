import { PlayerStats, HeadToHeadStats } from "@/types/match";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Users, Swords, ArrowUpDown, Search, CalendarIcon, X } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PlayerDetailProps {
  player: PlayerStats;
  h2hStats: Map<string, HeadToHeadStats>;
  allPlayers: Map<string, PlayerStats>;
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onBack: () => void;
}

type H2HSortField = 'matches' | 'winsW' | 'lossesW' | 'winsVs' | 'lossesVs' | 'winRateWith' | 'winRateAgainst';
type SortDirection = 'asc' | 'desc';

export const PlayerDetail = ({ player, h2hStats, allPlayers, dateFrom, dateTo, onDateFromChange, onDateToChange, onBack }: PlayerDetailProps) => {
  const [sortField, setSortField] = useState<H2HSortField>('matches');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (field: H2HSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return "text-success";
    if (winRate >= 50) return "text-primary";
    return "text-destructive";
  };

  const sortedH2H = useMemo(() => {
    return Array.from(h2hStats.entries())
      .map(([playerId, stats]) => ({
        player: allPlayers.get(playerId)!,
        stats,
      }))
      .filter(item => 
        item.player && 
        item.player.playerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const multiplier = sortDirection === 'desc' ? 1 : -1;
        
        if (sortField === 'matches') {
          return (b.stats.matchesWithBoth - a.stats.matchesWithBoth) * multiplier;
        } else if (sortField === 'winRateWith') {
          return (b.stats.winRateWith - a.stats.winRateWith) * multiplier;
        } else if (sortField === 'winRateAgainst') {
          return (b.stats.winRateAgainst - a.stats.winRateAgainst) * multiplier;
        } else if (sortField === 'winsW') {
          return (b.stats.player1WinsWithPlayer2 - a.stats.player1WinsWithPlayer2) * multiplier;
        } else if (sortField === 'lossesW') {
          return (b.stats.player1LosesWithPlayer2 - a.stats.player1LosesWithPlayer2) * multiplier;
        } else if (sortField === 'winsVs') {
          return (b.stats.player1WinsAgainstPlayer2 - a.stats.player1WinsAgainstPlayer2) * multiplier;
        } else {
          return (b.stats.player1LossesAgainstPlayer2 - a.stats.player1LossesAgainstPlayer2) * multiplier;
        }
      });
  }, [h2hStats, allPlayers, sortField, sortDirection, searchQuery]);

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

        <div className="flex gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opponents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Date from"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={onDateFromChange} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {dateFrom && (
              <Button variant="ghost" size="icon" onClick={() => onDateFromChange(undefined)} className="h-10 w-10">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Date to"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={onDateToChange} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {dateTo && (
              <Button variant="ghost" size="icon" onClick={() => onDateToChange(undefined)} className="h-10 w-10">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center justify-end text-sm text-muted-foreground mb-4">
          <span>Sort by:</span>
          <button
            onClick={() => handleSort('matches')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Total Matches
            {sortField === 'matches' && <ArrowUpDown className="h-3 w-3"/>}
          </button>

          <button
            onClick={() => handleSort('winRateWith')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Win Rate With
            {sortField === 'winRateWith' && <ArrowUpDown className="h-3 w-3"/>}
          </button>

          <button
            onClick={() => handleSort('winRateAgainst')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Win Rate VS
            {sortField === 'winRateAgainst' && <ArrowUpDown className="h-3 w-3"/>}
          </button>

          <button
            onClick={() => handleSort('winsW')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Wins With
            {sortField === 'winsW' && <ArrowUpDown className="h-3 w-3"/>}
          </button>
          <button
            onClick={() => handleSort('lossesW')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Losses With
            {sortField === 'lossesW' && <ArrowUpDown className="h-3 w-3"/>}
          </button>
          <button
            onClick={() => handleSort('winsVs')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Wins VS
            {sortField === 'winsVs' && <ArrowUpDown className="h-3 w-3"/>}
          </button>
          <button
            onClick={() => handleSort('lossesVs')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            Losses VS
            {sortField === 'lossesVs' && <ArrowUpDown className="h-3 w-3"/>}
          </button>
        </div>

        <div className="space-y-2">
          {sortedH2H.map(({player: opponent, stats}) => {
            const totalAgainst = stats.player1WinsAgainstPlayer2 + stats.player1LossesAgainstPlayer2;
            const totalTogether = stats.player1WinsWithPlayer2 + stats.player1LosesWithPlayer2;

            if (totalAgainst === 0 && totalTogether === 0) return null;

            return (
              <div key={opponent.playerId} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="font-medium text-foreground truncate max-w-[200px]">
                    {opponent.playerName}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-muted-foreground mb-1">Matches</div>
                    <div className="text-lg font-semibold text-foreground">
                      {stats.matchesWithBoth}
                    </div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-muted-foreground mb-1">With Teammate</div>
                    <div className={`text-lg font-bold ${getWinRateColor(stats.winRateWith)}`}>
                      {stats.winRateWith.toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <div className="text-xs text-muted-foreground mb-1">VS</div>
                    <div className={`text-lg font-bold ${getWinRateColor(stats.winRateAgainst)}`}>
                      {stats.winRateAgainst.toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-muted-foreground mb-1">Wins With</div>
                    <div className="text-lg font-bold text-success">
                      {stats.player1WinsWithPlayer2}
                    </div>
                  </div>

                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-muted-foreground mb-1">Losses With</div>
                    <div className="text-lg font-bold text-destructive">
                      {stats.player1LosesWithPlayer2}
                    </div>
                  </div>

                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-muted-foreground mb-1">Wins VS</div>
                    <div className="text-lg font-bold text-success">
                      {stats.player1WinsAgainstPlayer2}
                    </div>
                  </div>

                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-muted-foreground mb-1">Losses VS</div>
                    <div className="text-lg font-bold text-destructive">
                      {stats.player1LossesAgainstPlayer2}
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
