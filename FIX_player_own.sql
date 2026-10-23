-- Player Own her path.
-- Called after spend_dps succeeds. Grants the own. No desk pin.

drop function if exists public.player_own_grant(uuid, text);

create or replace function public.player_own_grant(p_player uuid, p_model text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  slug text := lower(btrim(coalesce(p_model, '')));
begin
  if p_player is null or slug = '' then
    return jsonb_build_object('ok', false, 'error', 'need player and model');
  end if;

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

  return jsonb_build_object('ok', true, 'player', p_player, 'model', slug, 'owned', true);
end;
$$;

grant execute on function public.player_own_grant(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
