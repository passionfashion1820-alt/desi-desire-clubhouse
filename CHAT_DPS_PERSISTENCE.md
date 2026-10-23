# Chat app — DPS must stick

DPS added in the room is vanishing on refresh. The chat app is only updating localStorage. The house reads from `player_dps` in the database.

## Rule

Every DPS change in the chat app must call the house RPC. Do not only write to localStorage.

## Add DPS

```js
// After a level win, review, heart, or spin payout
fetch(SUPABASE_URL + "/rest/v1/rpc/add_dps", {
  method: "POST",
  headers: {
    apikey: SUPABASE_ANON,
    Authorization: "Bearer " + SUPABASE_ANON,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    p_player: playerId,      // UUID from DDS1 p=
    p_points: 15,            // positive number
    p_reason: "level-3",     // or "review-mid", "heart", "spin"
    p_model: "preethi"       // slug, or null
  })
}).then(r => r.json()).then(j => {
  if (!j || !j.ok) console.error("add_dps failed", j);
  // Now update localStorage so the room UI matches
  var acc = JSON.parse(localStorage.getItem("dds_account") || "{}");
  acc.dps = (acc.dps || 0) + 15;
  localStorage.setItem("dds_account", JSON.stringify(acc));
});
```

## Cut DPS

```js
// Room entry, spin cost, still cost
fetch(SUPABASE_URL + "/rest/v1/rpc/desk_adjust_dps", {
  method: "POST",
  headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON, "Content-Type": "application/json" },
  body: JSON.stringify({
    p_name: playerId,
    p_player: playerId,
    p_delta: -10,           // negative
    p_reason: "room-entry"
  })
}).then(r => r.json()).then(j => {
  if (!j || !j.ok) console.error("cut failed", j);
  var acc = JSON.parse(localStorage.getItem("dds_account") || "{}");
  acc.dps = Math.max(0, (acc.dps || 0) - 10);
  localStorage.setItem("dds_account", JSON.stringify(acc));
});
```

## On room open

Read the real DPS from the house before showing the brace:

```js
fetch(SUPABASE_URL + "/rest/v1/rpc/player_dps_card", {
  method: "POST",
  headers: { apikey: SUPABASE_ANON, Authorization: "Bearer " + SUPABASE_ANON, "Content-Type": "application/json" },
  body: JSON.stringify({ p_player: playerId })
}).then(r => r.json()).then(card => {
  var acc = JSON.parse(localStorage.getItem("dds_account") || "{}");
  acc.dps = card.points || 0;
  acc.status = card.status || acc.status;
  localStorage.setItem("dds_account", JSON.stringify(acc));
  // Now paint the brace with the real number
});
```

## Why it vanishes

localStorage is only a cache. The house profile and board read from `player_dps`. If the chat app never calls `add_dps`, the database stays at the old number. Refresh pulls the old number back.

## House side

No change needed. `player_dps_card` already returns the real number. The house profile already reads it on load.

## Do not

- Do not only update localStorage.
- Do not invent a local DPS counter that the house never sees.
- Do not call `add_dps` with a name string. Use the UUID from the DDS1 `p=` field.
