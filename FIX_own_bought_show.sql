-- Ownership display must include bought=true even without enough nights.
-- model_owned (Owned by section) and player_owned (player's owns list) both fixed.

-- model_owned: show bought owners AND night owners
create or replace function public.model_owned(p_model text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  slug text := lower(btrim(coalesce(p_model, '')));
  owners jsonb;
begin
  if slug = '' then
    return jsonb_build_object('count', 0, 'owners', '[]'::jsonb, 'need', jsonb_build_object('status', 'Desire Silver', 'sessions', 5));
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', x.player_id,
    'name', coalesce(nullif(x.nickname, ''), x.username, 'member'),
    'username', x.username,
    'dps', x.points,
    'status', x.status,
    'sessions', x.nights,
    'usual', x.usual,
    'bought', x.bought
  ) order by x.bought desc, x.nights desc), '[]'::jsonb)
    into owners
  from (
    select
      op.player_id,
      p.username,
      p.nickname,
      coalesce(s.nights, 0) as nights,
      coalesce(op.start_usual, false) as usual,
      coalesce(op.bought, false) as bought,
      coalesce((public.player_dps_card(op.player_id)->>'points')::int, 0) as points,
      coalesce(public.player_dps_card(op.player_id)->>'status', '') as status
    from public.owner_prefs op
    join public.profiles p on p.id = op.player_id
    left join (
      select player_id, count(*)::int as nights
        from public.player_sessions
       where lower(coalesce(model_slug, '')) = slug
         and coalesce(nullif(regexp_replace(coalesce(level_reached::text, '1'), '\D', '', 'g'), '')::int, 1) >= 1
       group by player_id
    ) s on s.player_id = op.player_id
    where lower(op.model_slug) = slug
      and coalesce(op.bought, false) = true
  ) x;

  return jsonb_build_object(
    'count', coalesce(jsonb_array_length(owners), 0),
    'owners', owners,
    'need', jsonb_build_object('status', 'Desire Silver', 'sessions', 5, 'gold_sessions', 3)
  );
end;
$$;

grant execute on function public.model_owned(text) to anon, authenticated;

-- player_owned: return bought models even without sessions
create or replace function public.player_owned(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pts int := 0;
  st text := '';
  need int := 0;
  dps_row jsonb;
  models jsonb;
begin
  if p_id is null then
    return jsonb_build_object('ok', false);
  end if;
  begin
    select public.player_dps_card(p_id) into dps_row;
  exception when others then
    dps_row := '{}'::jsonb;
  end;
  pts := coalesce((dps_row->>'points')::int, 0);
  st := coalesce(dps_row->>'status', '');
  need := public.own_need(st, pts);

  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', lower(op.model_slug),
    'sessions', coalesce(s.nights, 0),
    'usual', coalesce(op.start_usual, false),
    'owned_nights', greatest(coalesce(op.owned_nights, 0), 1),
    'bought', true
  )), '[]'::jsonb)
    into models
  from public.owner_prefs op
  left join (
    select lower(coalesce(model_slug, '')) as model_slug, count(*)::int as nights
      from public.player_sessions
     where player_id = p_id
       and coalesce(nullif(regexp_replace(coalesce(level_reached::text, '1'), '\D', '', 'g'), '')::int, 1) >= 1
     group by 1
  ) s on s.model_slug = lower(op.model_slug)
  where op.player_id = p_id
    and coalesce(op.bought, false) = true;

  return jsonb_build_object(
    'ok', true,
    'can_own', need > 0,
    'own_need', need,
    'status', st,
    'points', pts,
    'models', models
  );
end;
$$;

grant execute on function public.player_owned(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
