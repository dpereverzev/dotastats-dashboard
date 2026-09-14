import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const TOTAL_CAPTAINS = 8;
const PICKS_PER_CAPTAIN = 4;
const TOTAL_PICKS = TOTAL_CAPTAINS * PICKS_PER_CAPTAIN;

const BodySchema = z.object({
  action: z.enum(['start', 'pick', 'reset']),
  steamId: z.string().trim().min(2).max(200),
  playerId: z.string().uuid().optional(),
});

const normalizeSteam = (value: string) => {
  let v = value.trim().replace(/\/+$/, '');
  if (v.includes('steamcommunity.com')) v = v.split('/').pop() ?? v;
  return v.toLowerCase();
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid request' }, 400);
    const { action, steamId, playerId } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: captain } = await supabase
      .from('players')
      .select('id, name, is_captain')
      .eq('steam_key', normalizeSteam(steamId))
      .maybeSingle();

    if (!captain || !captain.is_captain) {
      return json({ error: 'This Steam ID does not belong to one of the 8 captains.' }, 403);
    }

    const { data: draft } = await supabase.from('draft').select('*').eq('id', 'main').single();

    if (action === 'reset') {
      await supabase.from('picks').delete().neq('pick_number', -1);
      await supabase.from('draft').update({ started: false, pick_order: [], started_at: null }).eq('id', 'main');
      return json({ ok: true });
    }

    if (action === 'start') {
      if (draft?.started) return json({ error: 'The draft has already started.' }, 409);
      const { data: captains } = await supabase
        .from('players')
        .select('id')
        .eq('is_captain', true);
      if (!captains || captains.length !== TOTAL_CAPTAINS) {
        return json({ error: 'Captain list is incomplete.' }, 500);
      }
      const order = captains.map((c) => c.id);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const { error } = await supabase
        .from('draft')
        .update({ started: true, pick_order: order, started_at: new Date().toISOString() })
        .eq('id', 'main');
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, order });
    }

    // action === 'pick'
    if (!draft?.started) return json({ error: 'The draft has not started yet.' }, 409);
    if (!playerId) return json({ error: 'No player selected.' }, 400);

    const { data: picks } = await supabase.from('picks').select('pick_number').order('pick_number');
    const made = picks?.length ?? 0;
    if (made >= TOTAL_PICKS) return json({ error: 'The draft is already complete.' }, 409);

    const round = Math.floor(made / TOTAL_CAPTAINS);
    const slot = made % TOTAL_CAPTAINS;
    const index = round % 2 === 0 ? slot : TOTAL_CAPTAINS - 1 - slot;
    const currentCaptainId = (draft.pick_order as string[])[index];

    if (currentCaptainId !== captain.id) {
      return json({ error: 'It is not your turn to pick.' }, 409);
    }

    const { data: target } = await supabase
      .from('players')
      .select('id, is_captain')
      .eq('id', playerId)
      .maybeSingle();
    if (!target || target.is_captain) return json({ error: 'That player cannot be drafted.' }, 400);

    const { error } = await supabase
      .from('picks')
      .insert({ pick_number: made + 1, captain_id: captain.id, player_id: playerId });
    if (error) return json({ error: 'That player was just taken.' }, 409);

    return json({ ok: true });
  } catch (e) {
    console.error('draft-action failed', e);
    return json({ error: 'Unexpected error' }, 500);
  }
});
