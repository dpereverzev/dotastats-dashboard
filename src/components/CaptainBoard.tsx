import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2 } from "lucide-react";
import { PICKS_PER_CAPTAIN, Pick, Player } from "@/lib/draft";

interface Props {
  order: Player[];
  picks: Pick[];
  playerById: Map<string, Player>;
  currentCaptainId?: string;
  myCaptainId?: string;
}

export const CaptainBoard = ({ order, picks, playerById, currentCaptainId, myCaptainId }: Props) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {order.map((captain, i) => {
        const roster = picks
          .filter((p) => p.captain_id === captain.id)
          .sort((a, b) => a.pick_number - b.pick_number)
          .map((p) => playerById.get(p.player_id))
          .filter(Boolean) as Player[];
        const total = captain.mmr + roster.reduce((s, p) => s + p.mmr, 0);
        const isTurn = captain.id === currentCaptainId;

        return (
          <Card
            key={captain.id}
            className={`p-3 transition-shadow ${isTurn ? "border-primary ember-glow ember-panel" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <Crown className="h-4 w-4 shrink-0 text-accent" />
                  <span className="truncate font-semibold">{captain.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {captain.mmr} MMR · team {total.toLocaleString()}
                </p>
              </div>
              {captain.id === myCaptainId && (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  you
                </Badge>
              )}
            </div>

            {isTurn && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                picking now
              </div>
            )}

            <ol className="mt-3 space-y-1">
              {Array.from({ length: PICKS_PER_CAPTAIN }).map((_, slot) => {
                const p = roster[slot];
                return (
                  <li
                    key={slot}
                    className={`flex items-center justify-between rounded border px-2 py-1 text-sm ${
                      p ? "border-border bg-secondary" : "border-dashed border-border/60 text-muted-foreground"
                    }`}
                  >
                    <span className="truncate">{p ? p.name : `slot ${slot + 1}`}</span>
                    {p && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{p.mmr}</span>}
                  </li>
                );
              })}
            </ol>
          </Card>
        );
      })}
    </div>
  );
};
