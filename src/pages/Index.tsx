import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StatsOverview } from "@/components/StatsOverview";
import { HeadToHeadMatrix } from "@/components/HeadToHeadMatrix";
import { PlayerDetail } from "@/components/PlayerDetail";
import { calculatePlayerStats, getHeadToHeadMatrix } from "@/utils/statsCalculator";
import { MatchData } from "@/types/match";
import matchData from "@/data/all-stats.json";
import { Trophy, Target, Grid3x3 } from "lucide-react";

const Index = () => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const data = matchData as MatchData;

  const { playerStats, h2hMatrix } = useMemo(() => {
    const stats = calculatePlayerStats(data.data);
    const matrix = getHeadToHeadMatrix(data.data, Array.from(stats.keys()));
    return { playerStats: stats, h2hMatrix: matrix };
  }, [data]);

  const totalMatches = useMemo(() => {
    return data.data.filter(match => match.winner !== -1 && match.winner !== 2 && match.game === 'dota').length;
  }, [data]);

  const selectedPlayer = selectedPlayerId ? playerStats.get(selectedPlayerId) : null;
  const selectedH2H = selectedPlayerId ? h2hMatrix.get(selectedPlayerId) : null;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <PlayerDetail
            player={selectedPlayer}
            h2hStats={selectedH2H}
            allPlayers={playerStats}
            onBack={() => setSelectedPlayerId(null)}
          />
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="overview">Player Overview</TabsTrigger>
              <TabsTrigger value="matrix">Head-to-Head Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <StatsOverview 
                playerStats={playerStats}
                onPlayerSelect={setSelectedPlayerId}
              />
            </TabsContent>

            <TabsContent value="matrix" className="space-y-6">
              <HeadToHeadMatrix 
                playerStats={playerStats}
                h2hMatrix={h2hMatrix}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
