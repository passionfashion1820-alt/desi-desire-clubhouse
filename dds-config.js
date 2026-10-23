(function () {
  var DEFAULTS = {
    pin: "desi-admin",
    formula: { rating: 120, sessions: 2, hearts: 5, views: 0, poll: 0, favorites: 18, owns: 50, softCap: 1600, softMid: 2000, softRate1: 0.5, softRate2: 0.25, decayPct: 0.02, decayGraceDays: 7, lowMax: 2, lowHit: 50 },
    slabs: { sovereign: 3000, crown: 2500, superElite: 2000, elite: 1500, top: 1200, strong: 1000, good: 750 },
    forceSuper: [],
    liveOffers: [],
    unavailable: [],
    busy: [],
    siteDown: false,
    siteDownMsg: "Currently the game is down.",
    mainAlertOn: false,
    mainAlertText: 'Models are closed right now\nWe open at 6:45 PM IST and stay open until 2:00 AM IST.\nYou can still browse profiles and check your account while you wait.',
    formulaName: "classic",
    recompute: false,
    autoBusy: false,
    doorAccess: {
      preethi: "members",
      diya: "members",
      meghana: "members",
      kiara: "members",
      sravani: "members",
      meenakshi: "members",
      ayesha: "members",
      esther: "guests",
      natasha: "members",
      tharini: "members",
      kavya: "owners",
      lahari: "members",
      navya: "members",
      simran: "members",
      chandana: "soon",
      aleena: "soon"
    },
    blurUnverified: true,
    blurAll: false,
    polls: { player: 15, playerWait: 180, rooms: 60, mail: 120, house: 1500, verify: 20 },
    dpsSlabs: { bronze: 50, silver: 150, gold: 700, elite: 1500, platinum: 2500 },
    dpsAwards: { open: 1, level1: 5, level: 3, mini: 12, soft: 8, spin: 10, review: 20, signup: 100 },
    toffCaps: { member: 2, bronze: 2, silver: 3, gold: 5, elite: 10, platinum: 0 },
    waveOpens: {
      meenakshi: "2026-10-04",
      kavya: "2026-11-01",
      lahari: "2026-09-29",
      navya: "2026-10-12",
      simran: "2026-10-20",
      sravani: "2026-10-30"
    },
    soonOverride: {},
    offerSpin: [
      { key: "T10", do: "+10 warmth and one teasing still at current clothes." },
      { key: "T25", do: "+25 warmth. Six lines on what it did to her." },
      { key: "TEASE", do: "One extra look at this Level. No extra strip." },
      { key: "POSE", do: "He names one pose at current clothes. She shoots it." },
      { key: "SHLD", do: "Ignore the next Turn-Off this session." },
      { key: "SPOT", do: "He names a soft/public place. One hint + one clothed still." },
      { key: "DARE", do: "One dare at current clothes. No extra strip." },
      { key: "HOLD", do: "Hold one filthy pose in text for six messages, then one still." },
      { key: "DBL", do: "Warmth hits twice for the rest of this session." },
      { key: "MISS", do: "No extra perk. Night continues. Do not mock him." },
      { key: "DROP", do: "Drop one small wall. No strip skip." },
      { key: "LING", do: "He names lingerie color + cut. She wears it at this Level." },
      { key: "HUE", do: "Only KEY that may jump clothes to L5. Then stay there." },
      { key: "BIKI", do: "Bikini / two-piece at this Level if the Level already allows it." },
      { key: "COST", do: "He names a cost / gift beat. She plays it in talk." },
      { key: "TOD", do: "Time of day he names. One still in that light. Current clothes." },
      { key: "PAST", do: "One line from a night they already had (BACK only). NEW = TEASE." },
      { key: "TOUCH", do: "He names where a hand may rest in text. Current clothes." },
      { key: "HEAT", do: "+ warmth and dirtier talk for six lines. No skip." },
      { key: "PEEK", do: "One peek still of what this Level already shows." },
      { key: "NAME", do: "He gives a private name for her tonight. She uses it." },
      { key: "SEAT", do: "He names where she sits. One still. Current clothes." }
    ],
    offerDead: ["LINE", "LOOK", "COLD", "CMD"],
    offerReview: [
      { type: "IPOFF", lane: "MID", do: "30-min IP lock off this session." },
      { type: "LING", lane: "MID", do: "He names lingerie. Wear it at this Level." },
      { type: "PIECE", lane: "MID", do: "He names one garment. Only that piece moves." },
      { type: "TALK", lane: "MID", do: "He names the voice. Openness one step. Warmth 2× from here." },
      { type: "TIME", lane: "MID", do: "+15 minutes." },
      { type: "STILL", lane: "MID", do: "One extra still at this Level." },
      { type: "CLOSE", lane: "MID", do: "He names a close-up already allowed at this Level." },
      { type: "SOFT", lane: "MID", do: "+1 warmth, warmer still, next small miss forgiven." },
      { type: "TON2", lane: "MID", do: "+2 warmth." },
      { type: "GRACE", lane: "END", do: "Clear one strike. Room may continue." },
      { type: "TEASE", lane: "END", do: "One teasing still. No level up. She decides next." },
      { type: "LAST", lane: "END", do: "One last still, then close unless GRACE was also paid." }
    ]
  };
  function clampPoll(n, min, fallback) {
    n = Number(n);
    if (!n || n < min) return fallback;
    return n;
  }
  function merge(raw) {
    raw = raw || {};
    var p = raw.polls || {};
    return {
      pin: raw.pin || DEFAULTS.pin,
      formula: Object.assign({}, DEFAULTS.formula, raw.formula || {}),
      slabs: Object.assign({}, DEFAULTS.slabs, raw.slabs || {}),
      forceSuper: Array.isArray(raw.forceSuper) ? raw.forceSuper : DEFAULTS.forceSuper.slice(),
      liveOffers: [],
      unavailable: Array.isArray(raw.unavailable) ? raw.unavailable.map(function (s) { return String(s || "").toLowerCase(); }).filter(Boolean) : [],
      busy: Array.isArray(raw.busy) ? raw.busy.map(function (s) { return String(s || "").toLowerCase(); }).filter(Boolean) : [],
      siteDown: !!raw.siteDown,
      siteDownMsg: raw.siteDownMsg || DEFAULTS.siteDownMsg,
      mainAlertOn: !!raw.mainAlertOn,
      mainAlertText: String(raw.mainAlertText || ""),
      formulaName: raw.formulaName || DEFAULTS.formulaName || "classic",
      recompute: typeof raw.recompute === "boolean" ? raw.recompute : DEFAULTS.recompute,
      autoBusy: typeof raw.autoBusy === "boolean" ? raw.autoBusy : DEFAULTS.autoBusy,
      blurUnverified: raw.blurUnverified !== false,
      blurAll: !!raw.blurAll,
      polls: {
        player: clampPoll(p.player, 10, DEFAULTS.polls.player),
        playerWait: clampPoll(p.playerWait, 30, DEFAULTS.polls.playerWait),
        rooms: clampPoll(p.rooms, 15, DEFAULTS.polls.rooms),
        mail: clampPoll(p.mail, 30, DEFAULTS.polls.mail),
        house: clampPoll(p.house, 60, DEFAULTS.polls.house),
        verify: clampPoll(p.verify, 10, DEFAULTS.polls.verify)
      },
      dpsSlabs: Object.assign({}, DEFAULTS.dpsSlabs, raw.dpsSlabs || {}),
      dpsAwards: Object.assign({}, DEFAULTS.dpsAwards, raw.dpsAwards || {}),
      toffCaps: Object.assign({}, DEFAULTS.toffCaps, raw.toffCaps || {}),
      waveOpens: Object.assign({}, DEFAULTS.waveOpens, raw.waveOpens || {}),
      soonOverride: Object.assign({}, DEFAULTS.soonOverride || {}, raw.soonOverride || {}),
      busyOverride: Object.assign({}, raw.busyOverride || {}),
      forceAvailable: Array.isArray(raw.forceAvailable) ? raw.forceAvailable : [],
      doorPrice: Object.assign({}, raw.doorPrice || {}),
      ownPrice: Object.assign({}, raw.ownPrice || {}),
      doorAccess: Object.assign({}, DEFAULTS.doorAccess || {}, raw.doorAccess || {}),
      offerSpin: Array.isArray(raw.offerSpin) && raw.offerSpin.length ? raw.offerSpin : DEFAULTS.offerSpin.slice(),
      offerDead: Array.isArray(raw.offerDead) ? raw.offerDead : DEFAULTS.offerDead.slice(),
      offerReview: Array.isArray(raw.offerReview) && raw.offerReview.length ? raw.offerReview : DEFAULTS.offerReview.slice(),
      fan_club: Object.assign({ dps: 200, nights: 2, show: 8, still: true, time: true, heart: false }, raw.fan_club || {})
    };
  }
  function desireFrom(r) {
    var f = (window.DDS_CFG || DEFAULTS).formula;
    var raw = (Number(r.avg_rating || 0) * Number(f.rating || 0))
      + (Number(r.sessions || 0) * Number(f.sessions || 0))
      + (Number(r.hearts || 0) * Number(f.hearts || 0))
      + (Number(r.favorites || 0) * Number(f.favorites || 0))
      + (Number(r.own_count || r.owns || 0) * Number(f.owns || 0))
      - (Number(r.low_reviews || 0) * Number(f.lowHit || 50));
    var cap1 = Number(f.softCap || 1600), cap2 = Number(f.softMid || 2000);
    var r1 = Number(f.softRate1 || 0.5), r2 = Number(f.softRate2 || 0.25);
    var out = raw;
    if (out > cap2) out = cap1 + (cap2 - cap1) * r1 + (out - cap2) * r2;
    else if (out > cap1) out = cap1 + (out - cap1) * r1;
    var last = r.last_played ? Date.parse(r.last_played) : 0;
    if (last) {
      var weeks = Math.floor((Date.now() - last) / 86400000 / 7) - Math.floor(Number(f.decayGraceDays || 7) / 7);
      var decay = Number(f.decayPct || 0.02);
      if (weeks > 0 && decay > 0) out = out * Math.pow(1 - Math.min(decay, 0.5), weeks);
    }
    return Math.max(0, Math.round(out * 10) / 10);
  }

  function dpsStatusFromPts(pts) {
    pts = Number(pts || 0);
    var sl = (window.DDS_CFG || DEFAULTS).dpsSlabs || DEFAULTS.dpsSlabs;
    if (pts >= Number(sl.platinum || 2500)) return { key: "platinum", label: "Desire Platinum", tag: "Platinum" };
    if (pts >= Number(sl.elite || 1500)) return { key: "elite", label: "Desire Elite", tag: "Elite" };
    if (pts >= Number(sl.gold || 700)) return { key: "gold", label: "Desire Gold", tag: "Gold" };
    if (pts >= Number(sl.silver || 150)) return { key: "silver", label: "Desire Silver", tag: "Silver" };
    if (pts >= Number(sl.bronze || 50)) return { key: "bronze", label: "Desire Bronze", tag: "Bronze" };
    return { key: "member", label: "DesireMember", tag: "Member" };
  }
  function tierFor(score, slug) {
    var cfg = window.DDS_CFG || DEFAULTS;
    var s = cfg.slabs;
    var sc = Number(score || 0);
    if ((cfg.forceSuper || []).indexOf(slug) !== -1) return "Desire Queen";
    if (sc >= Number(s.sovereign || 3000)) return "Desire Queen";
    if (sc >= Number(s.crown || 2500)) return "Desire Crown";
    if (sc >= Number(s.superElite || 2000)) return "Desire Elite";
    if (sc >= Number(s.elite || 1500)) return "Elite";
    if (sc >= Number(s.top || 1200)) return "Top";
    if (sc >= Number(s.strong || 1000)) return "Strong";
    if (sc >= Number(s.good || 750)) return "Good";
    return "New";
  }
  window.DDS_DEFAULTS = DEFAULTS;
  window.DDS_CFG = merge({});
  try {
    var local = JSON.parse(localStorage.getItem("dds_admin_cfg") || "null");
    if (local) window.DDS_CFG = merge(local);
  } catch (e) {}
  window.DDS_desireFrom = desireFrom;
  window.DDS_tierFor = tierFor;
  window.DDS_dpsStatusFromPts = dpsStatusFromPts;
  window.DDS_pollMs = function (key, fallbackSec) {
    var polls = (window.DDS_CFG || DEFAULTS).polls || DEFAULTS.polls;
    var n = Number(polls[key]);
    if (!n) n = Number(fallbackSec || DEFAULTS.polls[key] || 60);
    return n * 1000;
  };
  window.DDS_applyCfg = function (raw) {
    window.DDS_CFG = merge(raw);
    document.dispatchEvent(new CustomEvent("dds-cfg"));
    if (window.DDS_paintAccount) window.DDS_paintAccount();
    return window.DDS_CFG;
  };
  window.DDS_loadCfg = function () {
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) return Promise.resolve(window.DDS_CFG);
    return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/get_house_config", {
      method: "POST",
      headers: {
        apikey: cfg.anon,
        Authorization: "Bearer " + cfg.anon,
        "Content-Type": "application/json"
      },
      body: "{}"
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && typeof data === "object") {
          window.DDS_applyCfg(data);
          try { localStorage.setItem("dds_admin_cfg", JSON.stringify(window.DDS_CFG)); } catch (e) {}
        }
        return window.DDS_CFG;
      })
      .catch(function () { return window.DDS_CFG; });
  };
  window.DDS_CFG_READY = window.DDS_loadCfg();
  setInterval(function () {
    try {
      var page = (location.pathname.split("/").pop() || "").toLowerCase();
      if (/desirescoutadmin|admin\.html/.test(page)) return;
      window.DDS_loadCfg();
    } catch (e) {}
  }, 15000);
})();
