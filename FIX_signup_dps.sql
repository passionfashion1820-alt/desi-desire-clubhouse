-- New players get the signup DPS from house_config (default 100).
-- Called by the account page on signup. Works with anon key.

create or replace function public.grant_signup_dps(p_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  amt int := 100;
  cfg jsonb;
  existing int;
begin
  if p_id is null then return 0; end if;

  -- Already has points? Do not double-grant.
  select points into existing from public.player_dps where player_id = p_id;
  if existing is not null and existing > 0 then return existing; end if;

  -- Read signup credit from house_config
  select c.cfg into cfg from public.house_config c order by c.updated_at desc nulls last limit 1;
  if cfg is not null and cfg->'dpsAwards'->>'signup' is not null then
    amt := (cfg->'dpsAwards'->>'signup')::int;
  end if;
  if amt is null or amt < 0 then amt := 100; end if;

  insert into public.player_dps (player_id, points, updated_at)
  values (p_id, amt, now())
  on conflict (player_id) do update
    set points = public.player_dps.points + excluded.points,
        updated_at = now();

  -- Ledger if the table exists
  begin
    insert into public.dps_ledger (player_id, amount, reason, created_at)
    values (p_id, amt, 'signup', now());
  exception when others then null;
  end;

  return amt;
end;
$$;

grant execute on function public.grant_signup_dps(uuid) to authenticated, anon;

notify pgrst, 'reload schema';
