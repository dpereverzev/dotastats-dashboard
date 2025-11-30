import { PlayerStats } from "@/types/match";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, ArrowUpDown, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  playerStats: Map<string, PlayerStats>;
  onPlayerSelect: (playerId: string) => void;
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}

type SortField = 'winRate' | 'wins' | 'losses' | 'mmr';
type SortDirection = 'asc' | 'desc';

export const StatsOverview = ({ 
  playerStats, 
  onPlayerSelect, 
  dateFrom, 
  dateTo, 
  onDateFromChange, 
  onDateToChange 
}: StatsOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minGames, setMinGames] = useState<number>(0);
  const [sortField, setSortField] = useState<SortField>('mmr');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = useMemo(() => {
    return Array.from(playerStats.values())
      .filter(player => 
        player.playerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        player.totalMatches >= minGames
      )
      .sort((a, b) => {
        const multiplier = sortDirection === 'desc' ? 1 : -1;
        return (b[sortField] - a[sortField]) * multiplier;
      });
  }, [playerStats, searchQuery, minGames, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-[150px]">
          <Input
            type="number"
            min="0"
            placeholder="Min games (0)"
            value={minGames || ''}
            onChange={(e) => setMinGames(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : "Date from"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={onDateFromChange} initialFocus />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : "Date to"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={onDateToChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 items-center justify-end text-sm text-muted-foreground">
        <span>Sort by:</span>
        <button
          onClick={() => handleSort('winRate')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        >
          Win Rate
          {sortField === 'winRate' && <ArrowUpDown className="h-3 w-3" />}
        </button>
        <button
          onClick={() => handleSort('wins')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        >
          Wins
          {sortField === 'wins' && <ArrowUpDown className="h-3 w-3" />}
        </button>
        <button
          onClick={() => handleSort('losses')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        >
          Losses
          {sortField === 'losses' && <ArrowUpDown className="h-3 w-3" />}
        </button>
        <button
          onClick={() => handleSort('mmr')}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        >
          MMR
          {sortField === 'mmr' && <ArrowUpDown className="h-3 w-3" />}
        </button>
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
