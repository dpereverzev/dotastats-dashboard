import { useState, useMemo, useTransition, useDeferredValue } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StatsOverview } from "@/components/StatsOverview";
import { HeadToHeadMatrix } from "@/components/HeadToHeadMatrix";
import { PlayerDetail } from "@/components/PlayerDetail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { calculatePlayerStats, getHeadToHeadMatrix } from "@/utils/statsCalculator";
import { useMatchData } from "@/hooks/useMatchData";
import { Trophy, Target, Grid3x3, AlertCircle } from "lucide-react";
import { endOfDay, startOfDay } from 'date-fns';

const Index = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  
  // Defer the date values to prevent blocking UI updates
  const deferredDateFrom = useDeferredValue(dateFrom);
  const deferredDateTo = useDeferredValue(dateTo);
  
  const { data, loading, error } = useMatchData();

  // Use deferred values for expensive calculations
  const { playerStats, h2hMatrix } = useMemo(() => {
    if (!data) return { playerStats: new Map(), h2hMatrix: new Map() };
    const stats = calculatePlayerStats(data.data, deferredDateFrom ? startOfDay(deferredDateFrom) : undefined, deferredDateTo ? endOfDay(deferredDateTo) : undefined);
    const matrix = getHeadToHeadMatrix(data.data, Array.from(stats.keys()), deferredDateFrom, deferredDateTo);
    return { playerStats: stats, h2hMatrix: matrix };
  }, [data, deferredDateFrom, deferredDateTo]);

  const totalMatches = useMemo(() => {
    if (!data) return 0;
    let matches = data.data.filter(match => match.winner !== -1 && match.winner !== 2 && match.game === 'dota');
    if (deferredDateFrom || deferredDateTo) {
      matches = matches.filter(match => {
        const matchDate = new Date(match.time);
        if (deferredDateFrom && matchDate < deferredDateFrom) return false;
        if (deferredDateTo && matchDate > deferredDateTo) return false;
        return true;
      });
    }
    return matches.length;
  }, [data, deferredDateFrom, deferredDateTo]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Failed to Load Data</h2>
            <p className="text-muted-foreground">
              {error || "Could not fetch match data from the API. Please try again later."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const selectedPlayer = selectedPlayerId ? playerStats.get(selectedPlayerId) : null;
  const selectedH2H = selectedPlayerId ? h2hMatrix.get(selectedPlayerId) : null;

  // Wrap date changes in transitions to keep UI responsive
  const handleDateFromChange = (date: Date | undefined) => {
    startTransition(() => {
      setDateFrom(startOfDay(date));
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    startTransition(() => {
      setDateTo(endOfDay(date));
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Dota 2 Statistics</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive player analytics and head-to-head matchup data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <Card className="p-6 bg-gradient-to-br from-card to-muted border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Matches</p>
                <p className="text-3xl font-bold text-primary">{totalMatches}</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-card to-muted border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Players</p>
                <p className="text-3xl font-bold text-primary">{playerStats.size}</p>
              </div>
              <Grid3x3 className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {selectedPlayer && selectedH2H ? (
          <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <PlayerDetail
              player={selectedPlayer}
              h2hStats={selectedH2H}
              allPlayers={playerStats}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
              onBack={() => setSelectedPlayerId(null)}
            />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="overview">Player Overview</TabsTrigger>
              <TabsTrigger value="matrix">Head-to-Head Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <StatsOverview 
                playerStats={playerStats}
                onPlayerSelect={setSelectedPlayerId}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={handleDateFromChange}
                onDateToChange={handleDateToChange}
              />
            </TabsContent>

            <TabsContent value="matrix" className="space-y-6" style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <HeadToHeadMatrix 
                playerStats={playerStats}
                h2hMatrix={h2hMatrix}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={handleDateFromChange}
                onDateToChange={handleDateToChange}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
