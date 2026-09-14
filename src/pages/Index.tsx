import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { CaptainBoard } from "@/components/CaptainBoard";
import {
  DraftState,
  Pick,
  Player,
  TOTAL_PICKS,
  captainIndexForPick,
  normalizeSteam,
} from "@/lib/draft";
import { Search, Shuffle, ShieldCheck, LogOut, Swords, RotateCcw } from "lucide-react";

const STORAGE_KEY = "mixcup-steam-id";

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamInput, setSteamInput] = useState("");
  const [myCaptainId, setMyCaptainId] = useState<string | null>(null);
  const [mySteamId, setMySteamId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, pk, d] = await Promise.all([
      supabase.from("players").select("*").order("mmr", { ascending: false }),
      supabase.from("picks").select("*").order("pick_number"),
      supabase.from("draft").select("*").eq("id", "main").maybeSingle(),
    ]);
    if (p.data) setPlayers(p.data as Player[]);
    if (pk.data) setPicks(pk.data as Pick[]);
    if (d.data) setDraft(d.data as DraftState);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("draft-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "picks" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "draft" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const captains = useMemo(() => players.filter((p) => p.is_captain), [players]);
  const pickedIds = useMemo(() => new Set(picks.map((p) => p.player_id)), [picks]);

  // Restore identity once players load
  useEffect(() => {
    if (!mySteamId || players.length === 0) return;
    const key = normalizeSteam(mySteamId);
    const me = players.find((p) => normalizeSteam(p.steam_raw) === key && p.is_captain);
    setMyCaptainId(me ? me.id : null);
  }, [mySteamId, players]);

  const orderedCaptains = useMemo(() => {
    if (!draft?.started || draft.pick_order.length === 0) return captains;
    return draft.pick_order.map((id) => playerById.get(id)).filter(Boolean) as Player[];
  }, [draft, captains, playerById]);

  const currentCaptain = useMemo(() => {
    if (!draft?.started || picks.length >= TOTAL_PICKS) return undefined;
    const idx = captainIndexForPick(picks.length);
    return playerById.get(draft.pick_order[idx]);
  }, [draft, picks, playerById]);

  const available = useMemo(
    () =>
      players
        .filter((p) => !p.is_captain && !pickedIds.has(p.id))
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase().trim())),
    [players, pickedIds, search],
  );

  const isMyTurn = !!currentCaptain && currentCaptain.id === myCaptainId;
  const complete = draft?.started && picks.length >= TOTAL_PICKS;

  const verify = () => {
    const key = normalizeSteam(steamInput);
    if (!key) return;
    const me = players.find((p) => normalizeSteam(p.steam_raw) === key);
    if (!me || !me.is_captain) {
      toast({
        title: "Not a captain",
        description: "That Steam ID is not one of the 8 captains. Check it and try again.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem(STORAGE_KEY, steamInput.trim());
    setMySteamId(steamInput.trim());
    setSteamInput("");
    toast({ title: `Welcome, ${me.name}`, description: "You can pick when it is your turn." });
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMySteamId(null);
    setMyCaptainId(null);
  };

  const call = async (action: "start" | "pick" | "reset", playerId?: string) => {
    if (!mySteamId) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("draft-action", {
      body: { action, steamId: mySteamId, playerId },
    });
    setBusy(false);
    const message = (data as { error?: string } | null)?.error;
    if (error || message) {
      toast({
        title: "Could not do that",
        description: message ?? "Something went wrong, try again.",
        variant: "destructive",
      });
      return;
    }
    load();
  };

  const myCaptain = myCaptainId ? playerById.get(myCaptainId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Swords className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold sm:text-4xl">MixCup Draft</h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              8 captains, snake order, 4 picks each — live for everyone.
            </p>
          </div>

          {myCaptain ? (
            <div className="flex items-center gap-2">
              <Badge className="gap-1.5 py-1.5">
                <ShieldCheck className="h-4 w-4" />
                {myCaptain.name}
              </Badge>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex w-full max-w-sm items-center gap-2">
              <Input
                placeholder="Your Steam ID or profile link"
                value={steamInput}
                maxLength={200}
                onChange={(e) => setSteamInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              <Button onClick={verify}>Verify</Button>
            </div>
          )}
        </header>

        {loading ? (
          <p className="text-muted-foreground">Loading draft…</p>
        ) : (
          <>
            <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                {complete ? (
                  <p className="text-lg font-semibold text-success">Draft complete — all 8 teams are set.</p>
                ) : draft?.started ? (
                  <p className="text-lg font-semibold">
                    Pick {picks.length + 1} of {TOTAL_PICKS} ·{" "}
                    <span className="text-primary">{currentCaptain?.name}</span> is on the clock
                  </p>
                ) : (
                  <p className="text-lg font-semibold">
                    Draft not started — the pick order will be randomised.
                  </p>
                )}
                {!myCaptain && (
                  <p className="text-sm text-muted-foreground">
                    Verify your Steam ID above to pick. Anyone can watch.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {myCaptain && !draft?.started && (
                  <Button disabled={busy} onClick={() => call("start")}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Randomise order & start
                  </Button>
                )}
                {myCaptain && draft?.started && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      if (confirm("Reset the whole draft? All picks will be cleared.")) call("reset");
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset draft
                  </Button>
                )}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {draft?.started ? "Pick order" : "Captains (order hidden until start)"}
                </h2>
                <CaptainBoard
                  order={orderedCaptains}
                  picks={picks}
                  playerById={playerById}
                  currentCaptainId={currentCaptain?.id}
                  myCaptainId={myCaptainId ?? undefined}
                />
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Available players ({available.length})
                </h2>
                <Card className="p-3">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search player"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[540px] pr-2">
                    <ul className="space-y-1">
                      {available.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.roles}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-semibold text-accent">{p.mmr}</span>
                            {isMyTurn && (
                              <Button size="sm" disabled={busy} onClick={() => call("pick", p.id)}>
                                Pick
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                      {available.length === 0 && (
                        <li className="py-6 text-center text-sm text-muted-foreground">No players left</li>
                      )}
                    </ul>
                  </ScrollArea>
                </Card>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
