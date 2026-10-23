-- DPS must stick. Unlock the functions and make add_dps write to player_dps.
-- Paste once. Chat app must call these RPCs. Do not only write localStorage.

-- Drop existing add_dps if the signature differs, then recreate
drop function if exists public.add_dps(uuid, int, text, text);
drop function if exists public.add_dps(uuid, int, text);

-- Recreate add_dps (4-arg) so it upserts into player_dps
create function public.add_dps(
  p_player uuid,
  p_points int,
  p_reason text default 'earn',
  p_model text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new int;
begin
  if p_player is null or p_points is null or p_points = 0 then
    return jsonb_build_object('ok', false, 'error', 'no points');
  end if;
  insert into public.player_dps (player_id, points, updated_at)
  values (p_player, greatest(0, p_points), now())
  on conflict (player_id) do update
    set points = greatest(0, player_dps.points + p_points),
        updated_at = now()
  returning points into v_new;
  insert into public.dps_ledger (player_id, amount, reason)
  values (p_player, p_points, coalesce(nullif(btrim(p_reason), ''), 'earn'));
  return jsonb_build_object('ok', true, 'points', v_new, 'delta', p_points);
end;
$$;

-- Unlock for players
grant execute on function public.add_dps(uuid, int, text, text) to anon, authenticated;

-- Unlock desk_adjust_dps for admin grants and room cuts
grant execute on function public.desk_adjust_dps(text, uuid, int, text) to anon, authenticated;

-- Unlock refund_dps
grant execute on function public.refund_dps(uuid, int, text) to anon, authenticated;

notify pgrst, 'reload schema';
