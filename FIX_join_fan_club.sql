-- One call: spend DPS and join fan club.
-- Also grant spend_dps in case other paths use it.

drop function if exists public.join_fan_club(uuid, text, int);
drop function if exists public.player_join_fan(uuid, text);

-- Grant spend in case
grant execute on function public.spend_dps(uuid, int, text) to anon, authenticated;
grant execute on function public.refund_dps(uuid, int, text) to anon, authenticated;

create or replace function public.join_fan_club(p_player uuid, p_model text, p_cost int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  slug text := lower(btrim(coalesce(p_model, '')));
  cur int;
  nxt int;
begin
  if p_player is null or slug = '' or p_cost is null or p_cost < 1 then
    return jsonb_build_object('ok', false, 'error', 'bad args');
  end if;

  select coalesce(points, 0) into cur
    from public.player_dps
   where player_id = p_player
   for update;

  if cur is null then
    return jsonb_build_object('ok', false, 'error', 'no dps row');
  end if;
  if cur < p_cost then
    return jsonb_build_object('ok', false, 'error', 'not enough', 'have', cur, 'need', p_cost);
  end if;

  nxt := cur - p_cost;
  update public.player_dps
     set points = nxt, updated_at = now()
   where player_id = p_player;

  insert into public.model_fans (player_id, model, via)
  values (p_player, slug, 'dps')
  on conflict (player_id, model) do nothing;

  return jsonb_build_object('ok', true, 'model', slug, 'spent', p_cost, 'left', nxt);
end;
$$;

grant execute on function public.join_fan_club(uuid, text, int) to anon, authenticated;

notify pgrst, 'reload schema';
