-- One call: spend DPS and grant the own.
-- Replaces the two-step path that was failing.

drop function if exists public.player_own(uuid, text, int);

create or replace function public.player_own(p_player uuid, p_model text, p_cost int)
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

  insert into public.owner_prefs (player_id, model_slug, start_usual, owned_nights, bought)
  values (p_player, slug, false, 1, true)
  on conflict (player_id, model_slug)
  do update set bought = true,
                owned_nights = greatest(coalesce(public.owner_prefs.owned_nights, 0), 1),
                updated_at = now();

  begin
    perform public.recalc_one_board(slug);
  exception when undefined_function then
    null;
  end;

  begin
    insert into public.player_mail (from_id, to_id, subject, body, from_admin)
    values (
      null,
      p_player,
      'You own her',
      'You own ' || initcap(slug) || '. Her next room starts further in. Play stays free.',
      true
    );
  exception when others then
    null;
  end;

  return jsonb_build_object('ok', true, 'left', nxt, 'model', slug);
end;
$$;

grant execute on function public.player_own(uuid, text, int) to anon, authenticated;

notify pgrst, 'reload schema';
