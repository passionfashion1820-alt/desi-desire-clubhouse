(function (w) {
  var RANKS = {
    preethi: 1, diya: 2, meghana: 3, kiara: 4, sravani: 5,
    natasha: 7, ayesha: 8, meenakshi: 9, tharini: 9, esther: 13
  };
  var TIERS = {
    token: {
      label: "₹75",
      perk: "+50 Turn-Ons she must honor in the room. 1 use.",
      uses: 1,
      months: 0,
      gate: "any",
      tons: 4000000
    },
    spark: {
      label: "$5 / ₹250",
      perk: "+100 Turn-Ons. 2x–3x strip speed. Rank 5 and below. 3 uses.",
      uses: 3,
      months: 0,
      gate: "below",
      tons: 400000
    },
    pulse: {
      label: "$10 / ₹500",
      perk: "+150 Turn-Ons. 2x–3x strip speed. Rank 5 and above. 3 uses.",
      uses: 3,
      months: 0,
      gate: "above",
      tons: 40000
    },
    royal: {
      label: "₹1000",
      perk: "+250 Turn-Ons. She goes further the same night. 3 uses.",
      uses: 3,
      months: 0,
      gate: "any",
      tons: 4000
    },
    crown: {
      label: "$25 / ₹1000–1500",
      perk: "+400 Turn-Ons. Own her 3 months. Unlimited uses. Heavy images. Fully open.",
      uses: 0,
      months: 3,
      gate: "any",
      tons: 40000005
    }
  };
  function cfg() { return w.DDS_SUPABASE || {}; }
  function base() { return String(cfg().url || "").replace(/\/$/, ""); }
  function headers(json) {
    var h = { apikey: cfg().anon, Authorization: "Bearer " + cfg().anon };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }
  function allowed(slug, tier) {
    var rank = RANKS[slug] || 99;
    var t = TIERS[tier];
    if (!t) return false;
    if (t.gate === "any") return true;
    if (t.gate === "below") return rank >= 5;
    if (t.gate === "above") return rank <= 5;
    return false;
  }
  function mint(slug, tier) {
    var tag = { token: "TON50", spark: "TON100", pulse: "TON150", royal: "TON250", crown: "TON400" }[tier] || "GIFT";
    return String(slug || "GIFT").slice(0, 4).toUpperCase() + "-" + tag + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  w.DDS_GIFTS = {
    ranks: RANKS,
    tiers: TIERS,
    allowed: allowed,
    send: function (row) {
      return fetch(base() + "/rest/v1/player_gifts", {
        method: "POST",
        headers: Object.assign(headers(true), { Prefer: "return=minimal" }),
        body: JSON.stringify(row)
      }).then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(t || r.status); });
      });
    },
    list: function () {
      return fetch(base() + "/rest/v1/player_gifts?select=*&order=created_at.desc&limit=80", {
        headers: headers(false)
      }).then(function (r) { return r.ok ? r.json() : []; });
    },
    issue: function (id, slug, tier) {
      var t = TIERS[tier] || TIERS.spark;
      var exp = t.months ? new Date(Date.now() + t.months * 30 * 24 * 3600 * 1000).toISOString() : null;
      var code = mint(slug, tier);
      return fetch(base() + "/rest/v1/player_gifts?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: Object.assign(headers(true), { Prefer: "return=representation" }),
        body: JSON.stringify({
          status: "coded",
          code: code,
          uses_max: t.uses,
          uses_left: t.uses || null,
          expires_at: exp,
          answered_at: new Date().toISOString()
        })
      }).then(function (r) { return r.ok ? r.json() : []; });
    },
    mark: function (id, status) {
      return fetch(base() + "/rest/v1/player_gifts?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: Object.assign(headers(true), { Prefer: "return=minimal" }),
        body: JSON.stringify({ status: status, answered_at: new Date().toISOString() })
      });
    },
    remove: function (id) {
      return fetch(base() + "/rest/v1/player_gifts?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: headers(false)
      });
    }
  };
})(window);
