# Fix ashish31m ownership display

## Database confirm

```sql
select p.username, op.model_slug, op.bought, op.owned_nights
  from public.owner_prefs op
  join public.profiles p on p.id = op.player_id
 where lower(p.username) = 'ashish31m'
 order by op.model_slug;
```

## Keep only Natasha

```sql
delete from public.owner_prefs
 where player_id = (select id from public.profiles where lower(username) = 'ashish31m')
   and model_slug <> 'natasha';
```

## Clear client cache (console)

```js
var acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
acc.owns = "natasha";
localStorage.setItem("dds_account", JSON.stringify(acc));
localStorage.setItem("dds_owns", "natasha");
location.reload();
```

After the SQL and the console clear, hard refresh. He should show as owning only Natasha.
