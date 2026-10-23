-- Trace: does raja own esther?
-- Run these and paste the results.

-- 1. Find raja's id
select id, username, nickname, verified, created_at
  from public.profiles
 where lower(username) = 'raja' or lower(nickname) = 'raja'
 limit 5;

-- 2. Check owner_prefs for esther (replace the uuid after you see step 1)
select op.player_id, op.model_slug, op.bought, op.owned_nights, op.start_usual, op.updated_at,
       p.username
  from public.owner_prefs op
  join public.profiles p on p.id = op.player_id
 where lower(op.model_slug) = 'esther'
   and (lower(p.username) = 'raja' or lower(p.nickname) = 'raja');

-- 3. Check all esther owners
select p.username, op.bought, op.owned_nights, op.updated_at
  from public.owner_prefs op
  join public.profiles p on p.id = op.player_id
 where lower(op.model_slug) = 'esther'
 order by op.updated_at desc;

-- 4. Check raja's sessions with esther
select ps.player_id, ps.model_slug, ps.level_reached, ps.closed_at
  from public.player_sessions ps
  join public.profiles p on p.id = ps.player_id
 where lower(ps.model_slug) = 'esther'
   and (lower(p.username) = 'raja' or lower(p.nickname) = 'raja')
 order by ps.closed_at desc
 limit 10;
