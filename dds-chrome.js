/* guests-skip 2026-10-12 */
(function () {
  function inject(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { if (cb) cb(); return; }
    var s = document.createElement("script");
    s.src = src;
    if (cb) s.onload = cb;
    document.head.appendChild(s);
  }

  function bumpPoll(slug, times) {
    try {
      slug = String(slug || "").toLowerCase();
      var TRAINERS = ["anu","meenakshi"];
    var NINE = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
      if (NINE.indexOf(slug) === -1) return;
      var cfg = window.DDS_SUPABASE || {};
      if (!cfg.url || !cfg.anon) return;
      var slot = Math.floor(Date.now() / 600000);
      var stamp = "dds-poll-v3:" + slug + ":" + slot;
      try { if (sessionStorage.getItem(stamp) === "ok") return; } catch (e) {}
      times = Math.min(3, times || 1);
      var viewer = "";
      try {
        viewer = localStorage.getItem("dds_viewer") || "";
        if (!viewer) {
          viewer = "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem("dds_viewer", viewer);
        }
      } catch (e) {}
      fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/bump_poll", {
        method: "POST",
        headers: {
          apikey: cfg.anon,
          Authorization: "Bearer " + cfg.anon,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ p_slut: slug, p_model: slug, p_viewer: viewer })
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || j.views == null) return;
        try { sessionStorage.setItem(stamp, "ok"); } catch (e) {}
        window.DDS_FRESH_VIEWS = window.DDS_FRESH_VIEWS || {};
        window.DDS_FRESH_VIEWS[slug] = j.views;
        document.querySelectorAll(".score-chip").forEach(function (chip) {
          var lab = chip.querySelector(".l");
          var num = chip.querySelector(".n");
          if (!lab || !num) return;
          if (/profile views|poll votes/i.test(lab.textContent || "")) {
            lab.textContent = "Profile views";
            num.textContent = String(j.views);
          }
        });
      }).catch(function () {});
    } catch (e) {}
  }
  function bumpProfilePoll() {
    var slug = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    bumpPoll(slug, 3);
  }

  inject("supabase-config.js", function () {
    bumpProfilePoll();
  
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.dds-play-mid, a[href*='contact_to_play']");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var slug = (a.getAttribute("data-slut") || (href.match(/[?&]slut=([a-z0-9-]+)/i) || [])[1] || (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase()).toLowerCase();
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    if (closed.indexOf(slug) !== -1) {
      if (!signed()) {
        e.preventDefault();
        e.stopPropagation();
        window.open("contact_to_play.html", "_blank", "noopener");
        return;
      }
      // signed-in players can still open the profile (black and white)
      return;
    }
    if (!signed() && access[slug] === "guests") {
      e.preventDefault();
      e.stopPropagation();
      location.href = "contact_to_play.html?slut=" + slug;
    }
  }, true);

  function playerStatus() {
    var acc = window.DDS_account && window.DDS_account();
    if (!acc) {
      try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
    }
    if (!acc || !(acc.id || acc.username)) return "";
    var pts = Number(acc.dps || 0);
    var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
    var bronze = Number(sl.bronze || 50);
    var silver = Number(sl.silver || 150);
    var gold = Number(sl.gold || 700);
    var elite = Number(sl.elite || 1500);
    var platinum = Number(sl.platinum || 2500);
    var st = "";
    if (pts >= platinum) st = "platinum";
    else if (pts >= elite) st = "elite";
    else if (pts >= gold) st = "gold";
    else if (pts >= silver) st = "silver";
    else if (pts >= bronze) st = "bronze";
    else st = "desiremember";
    var stored = String(acc.dpsStatus || acc.status || acc.desire_status || acc.tier || "").toLowerCase();
    var rank = { desiremember: 0, member: 0, bronze: 1, silver: 2, gold: 3, elite: 4, platinum: 5 };
    var live = rank[st] || 0;
    var held = 0;
    if (/platinum/.test(stored)) held = 5;
    else if (/elite/.test(stored)) held = 4;
    else if (/gold/.test(stored)) held = 3;
    else if (/silver/.test(stored)) held = 2;
    else if (/bronze/.test(stored)) held = 1;
    if (held > live) {
      if (held === 5) st = "platinum";
      else if (held === 4) st = "elite";
      else if (held === 3) st = "gold";
      else if (held === 2) st = "silver";
      else if (held === 1) st = "bronze";
    }
    return st;
  }
  
  function checkCool(cb) {
    var acc = null;
    try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
    if (!acc || !acc.id) { cb(null); return; }
    var cfg = window.DDS_SUPABASE || {};
    fetch(String(cfg.url || "").replace(/\/$/, "") + "/rest/v1/rpc/player_cool_status", {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_id: acc.id })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.cool) {
        var mins = Number(j.minutes || 0);
        var hrs = Math.floor(mins / 60);
        var rem = mins % 60;
        var label = hrs > 0 ? (hrs + " hr" + (hrs === 1 ? "" : "s") + (rem ? " " + rem + " min" : "")) : (mins + " min");
        cb("Purple Blocked for " + label + ". " + mins + " minute" + (mins === 1 ? "" : "s") + " left before you can play.");
      } else cb(null);
    }).catch(function () { cb(null); });
  }
  window.DDS_checkCool = checkCool;
function canAccess(slug) {
    slug = String(slug || "").toLowerCase();
    if (!slug) return true;
    // Owners always play their own doors (except Closed). Eligibility does not matter.
    // Fans still need to match the door status. Bronze fan of Silver+ door cannot play.
    if (typeof playerOwns === "function" && playerOwns(slug)) {
      var closedOnly = []
        .concat(window.DDS_CLOSED || [])
        .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
        .map(function (s) { return String(s || "").toLowerCase(); });
      var accessKey = String(((window.DDS_CFG && window.DDS_CFG.doorAccess) || {})[slug] || "").toLowerCase();
      if (closedOnly.indexOf(slug) === -1 && accessKey !== "closed") return true;
    }
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    if (closed.indexOf(slug) !== -1) return false;
    var busy = (window.DDS_CFG && window.DDS_CFG.busy) || [];
    var busyOverride = (window.DDS_CFG && window.DDS_CFG.busyOverride) || {};
    var st = playerStatus();
    if (busy.indexOf(slug) !== -1) {
      var stKey = String(st || "").toLowerCase();
      if (busyOverride[slug] === "silver" && /silver|gold|elite|platinum/.test(stKey)) return true;
      if (busyOverride[slug] === "gold" && /gold|elite|platinum/.test(stKey)) return true;
      if (busyOverride[slug] === "elite" && /elite|platinum/.test(stKey)) return true;
      if (busyOverride[slug] === "owners" && playerOwns(slug)) return true;
      return false;
    }
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var level = access[slug] || "members";
    var opens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
    var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
    if (level === "soon" || level === "imagesoon") {
      if (opens[slug] && cdtYmd() >= opens[slug]) return true;
      var stKey = String(st || "").toLowerCase();
      if (override[slug] === "bronze" && /bronze|silver|gold|elite|platinum/.test(stKey)) return true;
      if (override[slug] === "silver" && /silver|gold|elite|platinum/.test(stKey)) return true;
      if (override[slug] === "gold" && /gold|elite|platinum/.test(stKey)) return true;
      if (override[slug] === "elite" && /elite|platinum/.test(stKey)) return true;
      if (override[slug] === "owners" && playerOwns(slug)) return true;
      return false;
    }
    if (level === "guests") return true;
    if (playerOwns(slug)) return true;
    if (level === "owners") return false;
    if (!st) return false;
    var stKey = String(st || "").toLowerCase();
    if (level === "members") return true;
    if (level === "bronze") return /bronze|silver|gold|elite|platinum/.test(stKey);
    if (level === "silver") return /silver|gold|elite|platinum/.test(stKey);
    if (level === "gold") return /gold|elite|platinum/.test(stKey);
    if (level === "elite") return /elite|platinum/.test(stKey);
    return true;
  }
  window.DDS_canAccess = canAccess;
  window.DDS_stampAccessOnPlay = stampAccessOnPlay;
  function refreshStatus() {
    var acc = window.DDS_account && window.DDS_account();
    if (!acc || !acc.id) return;
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !window.supabase) return;
    var c = window.supabase.createClient(cfg.url, cfg.anon);
    c.auth.getSession().then(function (s) {
      var token = s && s.data && s.data.session && s.data.session.access_token;
      if (!token) return;
      fetch(cfg.url + "/rest/v1/rpc/player_dps_card", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.anon, Authorization: "Bearer " + token },
        body: JSON.stringify({ p_id: acc.id })
      }).then(function (r) { return r.json(); }).then(function (dps) {
        if (!dps || typeof dps !== "object") return;
        var pts = Number(dps.points || dps.dps || 0);
        if (pts && pts !== Number(acc.dps || 0)) {
          acc.dps = pts;
          try { localStorage.setItem("dds_account", JSON.stringify(acc)); } catch (e) {}
          stampAccessOnPlay();
        }
      }).catch(function () {});
    }).catch(function () {});
  }
  setTimeout(refreshStatus, 800);
  document.addEventListener("click", function (e) {
      var card = e.target.closest && e.target.closest("a.poster-card[data-slut], a[data-slut]");
      if (!card) return;
      bumpPoll(card.getAttribute("data-slut"), 3);
    }, true);
    inject("dds-art.js", function () {
      if (window.DDS_paintArt) window.DDS_paintArt();
    });
    inject("supabase-config.js");
    inject("dds-offers.js");
    inject("dds-config.js", function () {
      var ready = window.DDS_CFG_READY && window.DDS_CFG_READY.then ? window.DDS_CFG_READY : Promise.resolve();
      ready.finally(function () {
        inject("dds-auth.js", function () { if (window.DDS_paintAccount) window.DDS_paintAccount(); if (window.DDS_refreshOwns) window.DDS_refreshOwns(); });
        inject("dds-board.js?v=20261020own2", function () { inject("dds-reviews.js"); inject("dds-recaps.js"); });
      });
    });
  });

  var UNAVAILABLE = [];
  var OFFERS = [];
  window.DDS_UNAVAILABLE = window.DDS_UNAVAILABLE || [];
  window.DDS_OFFERS = OFFERS.filter(function (o) { return (window.DDS_UNAVAILABLE || []).indexOf(o.slug) === -1; });
  window.DDS_OFFER = OFFERS[0];
  function live(o) { return Date.now() < Date.parse(o.expiresAt); }
  window.DDS_LIVE_OFFERS = OFFERS.filter(live);
  window.DDS_OFFER_LIVE = window.DDS_LIVE_OFFERS.length > 0;

  function slugOfHref(raw) {
    raw = String(raw || "");
    var file = raw.split("?")[0].split("/").pop().replace(".html", "").toLowerCase();
    var q = (raw.split("slut=")[1] || "").split("&")[0].toLowerCase();
    return q || file;
  }
  function markBusyDoors(off) {
    if (window.DDS_memberSeesStatus && !window.DDS_memberSeesStatus()) {
      document.querySelectorAll(".dds-off-banner, .portrait .dds-off-tag").forEach(function (el) { el.remove(); });
      document.body.classList.remove("dds-model-off");
      return;
    }
    off = (off || []).map(function (s) { return String(s || "").toLowerCase(); });
    window.DDS_UNAVAILABLE = off;
    function isOff(id) { return off.indexOf(String(id || "").toLowerCase()) !== -1; }
    document.querySelectorAll(".dds-off-banner").forEach(function (el) { el.remove(); });
    document.querySelectorAll(".portrait .dds-off-tag").forEach(function (el) { el.remove(); });
    document.body.classList.remove("dds-model-off");
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (!isOff(page)) return;
    document.body.classList.add("dds-model-off");
    if (!document.querySelector(".dds-off-banner")) {
      var bar = document.createElement("div");
      bar.className = "dds-off-banner";
      bar.textContent = "She's being used. She'll take you in 2–3 hours.";
      var after = document.querySelector("nav");
      if (after && after.parentNode) after.parentNode.insertBefore(bar, after.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    var face = document.querySelector("article.profile-hero .portrait");
    if (face && !face.querySelector(".dds-off-tag")) {
      face.style.position = "relative";
      var imgs = face.querySelectorAll("img");
      imgs.forEach(function (img) { img.style.opacity = "1"; img.style.filter = "none"; img.style.visibility = "visible"; });
      var stamp = document.createElement("span");
      stamp.className = "dds-off-tag";
      stamp.textContent = "Being used · back in 2–3 hrs";
      face.appendChild(stamp);
    }
    document.querySelectorAll("a.dds-play-mid, a[href*='contact_to_play']").forEach(function (a) {
      a.classList.add("dds-want-play");
      a.classList.remove("dds-off", "dds-off-link", "dds-shut");
      var st = playerStatus();
      var ov = (window.DDS_CFG && window.DDS_CFG.busyOverride && window.DDS_CFG.busyOverride[page]) || "";
      var allowed = false;
      if (ov === "silver" && /silver|gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "gold" && /gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "elite" && /elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "owners" && playerOwns(page)) allowed = true;
      if (!allowed) {
        a.textContent = "In use";
        a.removeAttribute("href");
        a.style.pointerEvents = "none";
        a.style.opacity = "0.55";
      }
    });
  }
  function blurSoonProfile(slug) {
    slug = String(slug || (location.pathname.split("/").pop() || "").replace(/\.html$/i, "")).toLowerCase();
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var key = access[slug] || "";
    var hero = document.querySelector("article.profile-hero");
    if (!hero) return;
    var soon = key === "soon" || key === "imagesoon";
    var canSee = window.DDS_canAccess && window.DDS_canAccess(slug);
    hero.classList.toggle("dds-soon-blur", !!soon && !canSee);
    document.querySelectorAll("article.profile-hero .portrait img, .version-img, .gal img, img.dds-tease, .versions img").forEach(function (img) {
      if (soon && !canSee) img.style.setProperty("filter", "blur(12px) brightness(.88)", "important");
      else img.style.removeProperty("filter");
    });
  }
  window.DDS_blurSoonProfile = blurSoonProfile;
  function stampProfileHold(slug) {
    slug = String(slug || (location.pathname.split("/").pop() || "").replace(".html","")).toLowerCase();
    blurSoonProfile(slug);
    if (playerOwns(slug)) return;
    if (window.DDS_canAccess && window.DDS_canAccess(slug)) return;
    var until = playSoon(slug);
    var busy = (window.DDS_UNAVAILABLE || []).indexOf(slug) !== -1;
    if (!until && !busy) return;
    document.querySelectorAll("a.dds-play-mid, a.request-flash, a[href*='contact_to_play']").forEach(function (a) {
      a.classList.add("dds-want-play");
      a.classList.remove("dds-off", "dds-off-link", "dds-shut");
      a.textContent = until ? openOnLabel(until) : "In use";
      if (!a.getAttribute("href")) a.setAttribute("href", "contact_to_play.html?slut=" + slug);
    });
    var face = document.querySelector("article.profile-hero .portrait");
    if (face) {
      face.style.position = "relative";
      var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
      var key = access[slug] || "";
      var soonBlur = (key === "soon" || key === "imagesoon") && !(window.DDS_canAccess && window.DDS_canAccess(slug));
      face.querySelectorAll("img").forEach(function (img) {
        img.style.opacity = "1";
        if (!soonBlur) img.style.filter = "none";
        img.style.visibility = "visible";
      });
      if (soonBlur) blurSoonProfile(slug);
      var stamp = face.querySelector(".dds-off-tag, .dds-open-on");
      if (!stamp) {
        stamp = document.createElement("span");
        face.appendChild(stamp);
      }
      stamp.className = until ? "dds-off-tag dds-open-on" : "dds-off-tag";
      stamp.textContent = until ? openOnLabel(until) : "Being used · back in 2–3 hrs";
      stamp.style.position = "absolute";
      stamp.style.left = "50%";
      stamp.style.top = "50%";
      stamp.style.transform = "translate(-50%, -50%)";
      stamp.style.zIndex = "4";
      stamp.style.whiteSpace = "nowrap";
      stamp.style.padding = "4px 10px";
      stamp.style.fontSize = "12px";
    }
  }
  var LIVE_DOORS = ["preethi", "diya", "meghana", "kiara", "sravani", "ayesha", "esther", "natasha", "tharini", "kavya", "lahari", "navya", "simran", "chandana", "aleena"];
  var PLAY_OPEN_ON = {};
  var UNDATED_SOON = {};
  function waveRemind() {
    var base = Object.assign({}, (window.DDS_CFG && window.DDS_CFG.waveOpens) || {});
    return base;
  }
  function cdtYmd() {
    return new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  }
  function openOnLabel(ymd) {
    if (ymd === "soon") return "Coming soon";
    if (!ymd) return "";
    var p = String(ymd).split("-");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var mon = months[(Number(p[1]) || 1) - 1] || "";
    var day = String(Number(p[2]) || p[2] || "");
    return "Open for all " + day + " " + mon + ". Early access to Gold+ now";
  }
  function playerOwns(slug) {
    slug = String(slug || "").toLowerCase();
    if (!slug) return false;
    var raw = "";
    try {
      var acc = JSON.parse(localStorage.getItem("dds_account") || "null");
      if (acc) raw = acc.owns || acc.owned || "";
    } catch (e) {}
    if (!raw || raw === "none") {
      try { raw = localStorage.getItem("dds_owns") || ""; } catch (e) {}
    }
    if (!raw || raw === "none") return false;
    var list = Array.isArray(raw) ? raw : String(raw).toLowerCase().split(/[,|\s]+/);
    return list.indexOf(slug) !== -1;
  }
  window.DDS_playerOwns = playerOwns;
  function doorClosed(slug) {
    slug = String(slug || "").toLowerCase();
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || []);
    if (closed.map(function (s) { return String(s || "").toLowerCase(); }).indexOf(slug) !== -1) return true;
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var key = String(access[slug] || "").toLowerCase();
    if (key === "closed" || key === "soon" || key === "imagesoon") return true;
    if (typeof playSoon === "function" && playSoon(slug)) return true;
    return false;
  }
  function ownHerOpen(slug) {
    slug = String(slug || "").toLowerCase();
    if (!slug || slug === "anu" || slug === "meenakshi") return false;
    if (doorClosed(slug)) return false;
    if (playerOwns(slug)) return false;
    return true;
  }
  window.DDS_ownHerOpen = ownHerOpen;
  function ownHerLink(slug) {
    if (!ownHerOpen(slug) && !playerOwns(slug)) return "";
    var label = playerOwns(slug) ? "Own Perks" : "Own her";
    return '<a href="#" data-own-dps="' + slug + '">' + label + '</a>';
  }
  function ownHerBtn(slug) {
    if (!ownHerOpen(slug) && !playerOwns(slug)) return "";
    var label = playerOwns(slug) ? "Own Perks" : "Own her";
    var bg = playerOwns(slug) ? "#6b3fa0" : "#c9a24a";
    var fg = playerOwns(slug) ? "#fff" : "#1a1008";
    return '<a href="#" data-own-dps="' + slug + '" style="flex:1;min-width:100px;text-align:center;background:' + bg + ';color:' + fg + ';padding:.5rem .8rem;border-radius:8px;text-decoration:none;font-weight:700">' + label + '</a>';
  }
  
  function updateOwnButtons() {
    document.querySelectorAll("a[data-own-dps]").forEach(function (a) {
      var slug = String(a.getAttribute("data-own-dps") || "").toLowerCase();
      if (!slug) return;
      if (playerOwns(slug)) {
        a.textContent = "Own Perks";
        a.style.background = "#6b3fa0";
        a.style.color = "#fff";
      }
    });
  }
  window.DDS_updateOwnButtons = updateOwnButtons;

  function ownRankStep(slug) {
    slug = String(slug || "").toLowerCase();
    var board = window.DDS_BOARD || [];
    var model = null;
    for (var i = 0; i < board.length; i++) {
      if (String(board[i].slut || "").toLowerCase() === slug) { model = board[i]; break; }
    }
    var tier = String((model && model.tier) || "New").toLowerCase();
    var s = Number(model && model.desire_score || 0);
    if (/queen|sovereign/.test(tier) || s >= 3000) return { step: 7, label: "Queen" };
    if (/crown/.test(tier) || s >= 2500) return { step: 6, label: "Crown" };
    if (/desire elite|super elite/.test(tier) || s >= 2000) return { step: 5, label: "Desire Elite" };
    if (/elite/.test(tier) || s >= 1500) return { step: 4, label: "Elite" };
    if (/top/.test(tier) || s >= 1200) return { step: 3, label: "Top" };
    if (/strong/.test(tier) || s >= 1000) return { step: 2, label: "Strong" };
    if (/good/.test(tier) || s >= 750) return { step: 1, label: "Good" };
    return { step: 0, label: "New" };
  }
  function ownDpsCost(slug) {
    slug = String(slug || "").toLowerCase();
    var door = (window.DDS_CFG && window.DDS_CFG.ownPrice && Number(window.DDS_CFG.ownPrice[slug])) || 0;
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var key = String(access[slug] || "").toLowerCase();
    var soon = key === "soon" || key === "imagesoon" || (typeof playSoon === "function" && playSoon(slug));
    if (door > 0) return { cost: Math.round(door), label: "Door", step: 0, soon: !!soon, door: true };
    if (soon) return { cost: 1500, label: "Soon", step: 0, soon: true };
    var rs = ownRankStep(slug);
    return { cost: 1000 + rs.step * 150, label: rs.label, step: rs.step, soon: false };
  }
  window.DDS_ownDpsCost = ownDpsCost;
  function openEarnModal() {
    var old = document.getElementById("ddsEarnModal");
    if (old) old.remove();
    var box = document.createElement("div");
    box.id = "ddsEarnModal";
    box.style.cssText = "position:fixed;inset:0;z-index:96;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .5rem;font-size:1.05rem;color:#e9d5ff">DesirePoints (DPS)</p>' +
      '<p style="margin:0 0 .5rem;font-size:.88rem;color:#b9a892;line-height:1.45">Ways to earn:<br>' +
      '· Play nights and finish levels.<br>' +
      '· Leave a review after a room.<br>' +
      '· Win spins and offers.<br>' +
      '· Own a woman — Silver after five nights, Gold and above after three.<br>' +
      '· Or buy DPS with an Amazon gift card.</p>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem">' +
        '<button type="button" id="ddsEarnBuy" style="flex:1;min-width:120px;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Buy DPS</button>' +
        '<button type="button" id="ddsEarnClose" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</div></div>';
    document.body.appendChild(box);
    document.getElementById("ddsEarnBuy").onclick = function () {
      box.remove();
      if (typeof openBuyDpsModal === "function") openBuyDpsModal();
      else if (window.DDS_openBuyDps) window.DDS_openBuyDps();
    };
    document.getElementById("ddsEarnClose").onclick = function () { box.remove(); };
    box.onclick = function (ev) { if (ev.target === box) box.remove(); };
  }
  window.DDS_openEarn = openEarnModal;
  function openOwnModal(slug) {
    slug = String(slug || "").toLowerCase();
    if (!slug) return;
    var acc = null;
    try { acc = window.DDS_account && window.DDS_account(); } catch (e) {}
    if (!acc) { try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {} }
    var myPts = (acc && Number(acc.dps)) || 0;
    var info = ownDpsCost(slug);
    var cost = info.cost;
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var enough = myPts >= cost;
    var old = document.getElementById("ddsOwnModal");
    if (old) old.remove();
    var box = document.createElement("div");
    box.id = "ddsOwnModal";
    box.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    var line = enough
      ? (name + " charges <b>" + cost + "</b> DPS. You have <b>" + myPts + "</b>.")
      : ("Your DPS: <b>" + myPts + "</b>. You need <b>" + cost + "</b>.");
    var extra = info.door ? "Door price." : (info.soon ? "Soon door. Flat 1500." : (info.step ? (info.label + " · 1000 + " + info.step + " × 150.") : "Live base 1000."));
    var perks = '<div style="margin:.6rem 0 .7rem;padding:.55rem .7rem;background:#140a18;border:1px solid #4a2c5f;border-radius:10px;font-size:.8rem;line-height:1.35;color:#e8d5c0">' +
      '<p style="margin:0 0 .3rem;color:#e9d5ff;font-weight:700">What you get</p>' +
      '<p style="margin:0 0 .25rem"><b>Status Owned</b> — She treats the door as yours. One recognition line, then she is his.</p>' +
      '<p style="margin:0 0 .25rem"><b>Free use at current clothes</b> — Mouth, hands, poses, pace, where you put her. She follows at the clothes she has on. She does not refuse you on talk or acts at that level.</p>' +
      '<p style="margin:0 0 .25rem"><b>Higher start clothes</b> — 1–2 nights → L2, 3–5 → L3, 6–9 → L3 Softening, 10+ → L4. usual keeps her at L0.</p>' +
      '<p style="margin:0 0 .25rem"><b>Openness starts Opening</b> — Softening on long holds. She is not Closed with you.</p>' +
      '<p style="margin:0"><b>Tone multiplier has no cap</b> — Offers stack. No Combined cut.</p>' +
      '</div>';
    var btn = enough
      ? '<button type="button" id="ddsOwnBuy" style="flex:1;min-width:120px;background:#c9a24a;color:#1a1008;padding:.5rem .8rem;border-radius:8px;border:0;font-weight:700">Buy her</button>'
      : '<button type="button" id="ddsOwnEarn" style="flex:1;min-width:120px;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">DesirePoints (DPS)</button>';
    box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Own ' + name + '</p>' +
      '<p style="margin:0 0 .35rem;font-size:.95rem;color:#f3e9d7">' + line + '</p>' +
      '<p style="margin:0 0 .4rem;font-size:.82rem;color:#b9a892">' + extra + '</p>' +
      perks +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' + btn +
        '<button type="button" id="ddsOwnClose" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</div><p id="ddsOwnMsg" style="margin:.6rem 0 0;font-size:.82rem;color:#e8c4a8"></p></div>';
    document.body.appendChild(box);
    document.getElementById("ddsOwnClose").onclick = function () { box.remove(); };
    box.onclick = function (ev) { if (ev.target === box) box.remove(); };
    var earn = document.getElementById("ddsOwnEarn");
    if (earn) earn.onclick = function () { box.remove(); openEarnModal(); };
    var buy = document.getElementById("ddsOwnBuy");
    if (buy) buy.onclick = function () {
      var msg = document.getElementById("ddsOwnMsg");
      if (!acc || !acc.id) { msg.textContent = "Login first."; return; }
      msg.textContent = "Spending…";
      var cfg = window.DDS_SUPABASE || {};
      var base = String(cfg.url || "").replace(/\/$/, "");
      var headers = { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" };
      fetch(base + "/rest/v1/rpc/player_own", {
        method: "POST", headers: headers,
        body: JSON.stringify({ p_player: acc.id, p_model: slug, p_cost: cost })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && (j.error || j.message)) || "Could not own.");
        var g = j;
          try {
            var a = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
            var raw = a.owns || "";
            var list = String(raw).toLowerCase().split(/[,|\s]+/).filter(Boolean);
            if (list.indexOf(slug) === -1) list.push(slug);
            a.owns = list.join(",");
            a.dps = j.left;
            localStorage.setItem("dds_account", JSON.stringify(a));
            localStorage.setItem("dds_owns", a.owns);
          } catch (e) {}
          msg.textContent = "You own " + name + ". " + j.left + " DPS left.";
          box.remove();
          if (window.showCongrats) window.showCongrats("Own", name, "You own her. Free play at current clothes. Gold OWN PAGE is on.");
          setTimeout(function () { location.reload(); }, 1400);
      }).catch(function (err) {
        // grant failed after spend — put the DPS back
        fetch(base + "/rest/v1/rpc/refund_dps", {
          method: "POST", headers: headers,
          body: JSON.stringify({ p_player: acc.id, p_amount: cost, p_reason: "refund-own-" + slug })
        }).then(function (r) { return r.json(); }).then(function (rf) {
          if (rf && rf.left != null) {
            try {
              var a = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
              a.dps = rf.left;
              localStorage.setItem("dds_account", JSON.stringify(a));
            } catch (e) {}
          }
          msg.textContent = String(err.message || err) + " DPS returned.";
        }).catch(function () { msg.textContent = String(err.message || err); });
      });
    };
  }
  function openDisownModal(slug) {
    slug = String(slug || "").toLowerCase();
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var old = document.getElementById("ddsOwnModal");
    if (old) old.remove();
    var box = document.createElement("div");
    box.id = "ddsOwnModal";
    box.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .5rem;font-size:1.05rem;color:#e9d5ff">Own Perks — ' + name + '</p>' +
      '<p style="margin:0 0 .6rem;font-size:.88rem;color:#b9a892;line-height:1.45">You own her. Free use, higher start, no cap. Disown and you lose the perks. She goes back to a normal door.</p>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
        '<button type="button" id="ddsDisown" style="flex:1;min-width:140px;background:#a33;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0;font-weight:700">Disown and lose perk</button>' +
        '<button type="button" id="ddsOwnClose" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</div><p id="ddsOwnMsg" style="margin:.6rem 0 0;font-size:.82rem;color:#e8c4a8"></p></div>';
    document.body.appendChild(box);
    document.getElementById("ddsOwnClose").onclick = function () { box.remove(); };
    document.getElementById("ddsDisown").onclick = function () {
      var msg = document.getElementById("ddsOwnMsg");
      var acc = null;
      try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
      if (!acc || !acc.id) { msg.textContent = "Login first."; return; }
      msg.textContent = "Removing…";
      var cfg = window.DDS_SUPABASE || {};
      var base = String(cfg.url || "").replace(/\/$/, "");
      var headers = { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" };
      fetch(base + "/rest/v1/rpc/desk_disown", {
        method: "POST", headers: headers,
        body: JSON.stringify({ p_name: acc.id || acc.username || "", p_model: slug })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && (j.error || j.message)) || "Could not disown.");
        try {
          var a = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
          var list = String(a.owns || "").toLowerCase().split(/[,|\s]+/).filter(Boolean);
          a.owns = list.filter(function (s) { return s !== slug; }).join(",");
          localStorage.setItem("dds_account", JSON.stringify(a));
          localStorage.setItem("dds_owns", a.owns);
        } catch (e) {}
        msg.textContent = "Disowned. Perks gone.";
        setTimeout(function () { box.remove(); location.reload(); }, 900);
      }).catch(function (err) { msg.textContent = String(err.message || err); });
    };
  }
  window.DDS_openDisown = openDisownModal;
  window.DDS_openOwn = openOwnModal;
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[data-own-dps], a[href*='send_gift']");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var m = href.match(/slut=([^&#]+)/i);
    var slug = (a.getAttribute("data-own-dps") || (m && decodeURIComponent(m[1])) || "").toLowerCase();
    if (!slug) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (playerOwns(slug)) openDisownModal(slug);
    else openOwnModal(slug);
  }, true);
  function hideOwnHerLinks() {
    document.querySelectorAll("a[href*='send_gift.html']").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var m = href.match(/slut=([^&]+)/i);
      var slug = m ? decodeURIComponent(m[1]) : (location.pathname.split("/").pop() || "").replace(".html", "");
      if (!ownHerOpen(slug)) a.style.display = "none";
    });
  }
  window.DDS_hideOwnHerLinks = hideOwnHerLinks;
  function refreshOwns() {
    var acc = null;
    try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
    if (!acc || !acc.id) return;
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) return;
    var root = String(cfg.url).replace(/\/$/, "");
    fetch(root + "/rest/v1/rpc/player_owned", {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_id: acc.id })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      data = data || {};
      var models = data.models || [];
      var owns = models.map(function (m) { return String(m.slug || "").toLowerCase(); }).filter(Boolean).join(",");
      // Use server data as source of truth. Do not keep stale local owns.
      // Server confirms ownership per model.
      try { localStorage.setItem("dds_owns", owns); } catch (e) {}
      try {
        acc.owns = owns;
        localStorage.setItem("dds_account", JSON.stringify(acc));
      } catch (e) {}
      if (window.DDS_applyPlayGates) window.DDS_applyPlayGates();
      if (window.DDS_hideOwnHerLinks) window.DDS_hideOwnHerLinks();
      if (window.DDS_paintMineBadges) window.DDS_paintMineBadges();
      if (window.DDS_updateOwnButtons) window.DDS_updateOwnButtons();
      if (typeof paintOwnedHero === 'function') paintOwnedHero();
      // Re-paint banner. Check fan status so we do not wipe a fan strip.
      var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
      if (page && typeof paintFanBanner === "function") {
        var isFan = false;
        try {
          var acc = JSON.parse(localStorage.getItem("dds_account") || "null");
          var fans = JSON.parse(localStorage.getItem("dds_fans") || "[]");
          if (acc && Array.isArray(fans)) {
            isFan = fans.indexOf(page) !== -1;
          }
        } catch (e) {}
        paintFanBanner(page, isFan);
      }
    }).catch(function () {});
  }
  window.DDS_refreshOwns = refreshOwns;

  function playSoon(slug) {
    slug = String(slug || "").toLowerCase();
    if (UNDATED_SOON[slug]) return "soon";
    var d = waveRemind()[slug] || PLAY_OPEN_ON[slug];
    if (!d || d === "soon") return d === "soon" ? "soon" : "";
    return cdtYmd() < d ? d : "";
  }
  window.DDS_playSoon = playSoon;
  window.DDS_statusClass = function (st) {
    st = String(st || "");
    if (/platinum/i.test(st)) return "chip-platinum";
    if (/elite/i.test(st)) return "chip-elite";
    if (/gold/i.test(st)) return "chip-gold";
    if (/silver/i.test(st)) return "chip-silver";
    if (/bronze/i.test(st)) return "chip-bronze";
    return "chip-member";
  };
  window.DDS_statusMark = function (st) {
    var label = String(st || "DesireMember");
    var pretty = label.replace(/</g, "").replace(/([a-z])([A-Z])/g, "$1 $2");
    return '<span class="status-flash ' + window.DDS_statusClass(label) + '">' + pretty + "</span>";
  };
  function playerUserFrom(el) {
    if (!el) return "";
    var u = el.getAttribute("data-player") || "";
    if (u) return u;
    var href = el.getAttribute("href") || "";
    var m = href.match(/member\.html\?u=([^&]+)/i);
    return m ? decodeURIComponent(m[1]) : "";
  }
  function closePlayerMenu() {
    var m = document.getElementById("dds-pmenu");
    if (m) m.remove();
  }
  function openPlayerMenu(user, name, x, y) {
    closePlayerMenu();
    if (!user) return;
    var menu = document.createElement("div");
    menu.id = "dds-pmenu";
    menu.className = "dds-pmenu";
    menu.style.left = Math.max(8, Math.min(x, window.innerWidth - 220)) + "px";
    menu.style.top = Math.max(8, y + 8) + "px";
    menu.innerHTML =
      "<img class='dds-pphoto' alt='' src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23241612'/%3E%3Ccircle cx='100' cy='78' r='30' fill='%23e6d3b0'/%3E%3Cpath d='M46 176c6-36 26-52 54-52s48 16 54 52' fill='%23e6d3b0'/%3E%3C/svg%3E\"/>" +
      "<b>" + String(name || user).replace(/</g, "") + "</b>" +
      "<a href='member.html?u=" + encodeURIComponent(user) + "'>View profile</a>" +
      "<a href='account.html?to=" + encodeURIComponent(user) + "&name=" + encodeURIComponent(name || user) + "'>Message privately</a>";
    document.body.appendChild(menu);
    try {
      var me = JSON.parse(localStorage.getItem("dds_account") || "null");
      var cfg = window.DDS_SUPABASE || {};
      if (me && me.id && cfg.url && cfg.anon) {
        fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/public_player_photos", {
          method: "POST",
          headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
          body: JSON.stringify({ p_user: user, p_viewer: me.id })
        }).then(function (r) { return r.json(); }).then(function (p) {
          var img = menu.querySelector(".dds-pphoto");
          if (img && p && p.photo) img.src = String(p.photo);
        }).catch(function () {});
      }
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#dds-pmenu")) return;
    var hit = e.target.closest && e.target.closest("[data-player], a[href*='member.html?u=']");
    if (!hit) { closePlayerMenu(); return; }
    if ((hit.getAttribute("href") || "").indexOf("account.html?to=") === 0) return;
    var user = playerUserFrom(hit);
    if (!user) return;
    e.preventDefault();
    e.stopPropagation();
    var name = (hit.getAttribute("data-name") || hit.textContent || user).replace(/\s+/g, " ").trim();
    var r = hit.getBoundingClientRect();
    openPlayerMenu(user, name, r.left, r.bottom + window.scrollY);
  }, true);
  window.DDS_applyPlayGates = applyHouseGates;
  window.DDS_waveOpens = waveRemind;
  window.DDS_openWant = function (slug) { return openWantModal(slug); };
  var AUTO_BUSY_SKIP = LIVE_DOORS.slice();
  function busySlot() { return Math.floor(Date.now() / 600000); }
  function autoBusy() {
    var cfg = window.DDS_CFG || {};
    if (cfg.autoBusy === false) return [];
    var pool = LIVE_DOORS.filter(function (s) {
      return AUTO_BUSY_SKIP.indexOf(s) === -1;
    });
    if (!pool.length) return [];
    var slot = busySlot();
    var count = 2 + (slot % 2);
    var start = slot % pool.length;
    var step = 4;
    var out = [];
    var seen = {};
    var i = 0;
    while (out.length < Math.min(count, pool.length) && i < pool.length * 2) {
      var s = pool[(start + i * step) % pool.length];
      if (!seen[s]) {
        seen[s] = 1;
        out.push(s);
      }
      i += 1;
    }
    return out;
  }
  function markClosedDoors(off) {
    off = (off || []).map(function (s) { return String(s || "").toLowerCase(); });
    window.DDS_CLOSED = off;
    if (window.DDS_hideOwnHerLinks) window.DDS_hideOwnHerLinks();
    function isShut(id) { return off.indexOf(String(id || "").toLowerCase()) !== -1; }
    document.querySelectorAll(".dds-shut-tag, .dds-shut-banner").forEach(function (el) { el.remove(); });
    document.querySelectorAll(".dds-shut").forEach(function (el) { el.classList.remove("dds-shut"); });
    document.querySelectorAll("a.poster-card[data-slut], a[data-slut]").forEach(function (a) {
      var slug = (a.getAttribute("data-slut") || "").toLowerCase();
      if (!slug || !isShut(slug)) return;
      a.classList.add("dds-shut");
      var cta = a.querySelector(".poster-cta, .version-cta");
      if (cta) cta.textContent = "Not taking tonight";
    });
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (isShut(page)) {
      document.body.classList.add("dds-model-shut");
      if (!document.querySelector(".dds-shut-banner")) {
        var bar = document.createElement("div");
        bar.className = "dds-shut-banner";
        bar.textContent = "She is not taking anyone tonight.";
        document.body.insertBefore(bar, document.body.firstChild);
      }
      document.querySelectorAll("a[href*='contact_to_play'], a.dds-play-mid").forEach(function (a) {
        a.classList.add("dds-shut");
        a.removeAttribute("href");
        a.textContent = "Not receiving tonight";
      });
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href], a.dds-play-mid, a.request-flash");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (a.classList.contains("poster-card")) return;
    if (!/contact_to_play|dds-play-mid|request-flash/i.test(href + " " + a.className)) return;
    if (window.DDS_checkCool && !a.getAttribute("data-cool-ok")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.DDS_checkCool(function (msg) {
        if (msg) { alert(msg); return; }
        a.setAttribute("data-cool-ok", "1");
        a.click();
      });
      return;
    }
    var slug = (a.getAttribute("data-slut") || (href.match(/[?&]slut=([a-z0-9-]+)/i) || [])[1] || (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase()).toLowerCase();
    var NAMES = {preethi:"Preethi",diya:"Diya",meghana:"Meghana",kiara:"Kiara",sravani:"Sravani",meenakshi:"Meenakshi",ayesha:"Ayesha",esther:"Esther",natasha:"Natasha",tharini:"Tharini",kavya:"Kavya",lahari:"Lahari",navya:"Navya",simran:"Simran",chandana:"Chandana",aleena:"Aleena"};
    var her = NAMES[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "She");
    if (slug && window.DDS_canAccess && !window.DDS_canAccess(slug)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      // Show popup here, do not navigate
      var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
      var level = access[slug] || "members";
      var need = "Members";
      var floor = 20;
      if (level === "bronze") { need = "Bronze and above"; floor = 50; }
      else if (level === "silver") { need = "Silver and above"; floor = Number((window.DDS_CFG && window.DDS_CFG.dpsSlabs && window.DDS_CFG.dpsSlabs.silver) || 150); }
      else if (level === "gold") { need = "Gold and above"; floor = Number((window.DDS_CFG && window.DDS_CFG.dpsSlabs && window.DDS_CFG.dpsSlabs.gold) || 700); }
      else if (level === "elite") { need = "Elite and above"; floor = Number((window.DDS_CFG && window.DDS_CFG.dpsSlabs && window.DDS_CFG.dpsSlabs.elite) || 1500); }
      else if (level === "owners") { need = "owners"; floor = 0; }
      else if (level === "soon" || level === "imagesoon") {
        var ov = (window.DDS_CFG && window.DDS_CFG.soonOverride || {})[slug] || "";
        var ovLabel = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" }[ov] || "";
        var openDate = (window.DDS_CFG && window.DDS_CFG.waveOpens || {})[slug] || "";
        need = ovLabel ? (ovLabel + " for now") : "soon";
        floor = 0;
      }
      var pts = 0;
      try {
        var acc = window.DDS_account && window.DDS_account();
        pts = (acc && acc.dps) || 0;
        if (!pts && acc && acc.status) {
          var st = String(acc.status || "").toLowerCase();
          if (/platinum/.test(st)) pts = 1000;
          else if (/elite/.test(st)) pts = 650;
          else if (/gold/.test(st)) pts = 300;
          else if (/silver/.test(st)) pts = 100;
          else if (/bronze/.test(st)) pts = 50;
          else pts = 0;
        }
      } catch (err) {}
      var more = floor > 0 ? Math.max(0, floor - pts) : 0;
      var body = her + " is open for " + need + " only.";
      var opens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
      var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
      var openDate = opens[slug] || "";
      var ov = override[slug] || "";
      var ovLabel = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" }[ov] || "";
      if (level === "soon" || level === "imagesoon") {
        if (ovLabel && openDate) {
          body = her + " is for " + ovLabel + " for now. Public opens " + openDate + ".";
        } else if (ovLabel) {
          body = her + " is for " + ovLabel + " for now.";
        } else if (openDate) {
          body = her + " opens " + openDate + ".";
        } else {
          body = her + " is opening soon.";
        }
      } else if (level === "members") body = "Sign in to play " + her + ".";
      else if (level === "owners") body = "Play more nights to own her, or buy right away.";
      else if (floor > 0 && myPts < floor) body = her + " charges " + need + ". You have " + myPts + " DPS.";
      else body = her + " charges " + need + ".";
      var old = document.getElementById("ddsNeedRank");
      if (old) old.remove();
      var box = document.createElement("div");
      box.id = "ddsNeedRank";
      box.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
      var ways = '';
      if (more > 0) ways = '<p style="margin:0 0 .4rem;font-size:.86rem;color:#b9a892">Ways to get there:<br>· Play the models you can open and finish nights.<br>· Leave reviews after a room.<br>· Own a woman — Silver after five nights, Gold and above after three.<br>· Or buy a pack if you want the floor now.</p>';
      else ways = '<p style="margin:0 0 .6rem;font-size:.88rem;color:#b9a892">Play the models you can open. Finish nights. Leave reviews. Own a woman. All of these raise your Desire score.</p>';
      var acc = window.DDS_account && window.DDS_account();
      var myPts = (acc && acc.dps) || pts || 0;
      var st = "Member";
      if (myPts >= 1000) st = "Platinum";
      var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
      var bronze = Number(sl.bronze || 50);
      var silver = Number(sl.silver || 150);
      var gold = Number(sl.gold || 700);
      var elite = Number(sl.elite || 1500);
      var plat = Number(sl.platinum || 2500);
      if (myPts >= plat) st = "Platinum";
      else if (myPts >= elite) st = "Elite";
      else if (myPts >= gold) st = "Gold";
      else if (myPts >= silver) st = "Silver";
      else if (myPts >= bronze) st = "Bronze";
      var needLine = "";
      if (level === "soon" || level === "imagesoon") {
        if (ovLabel) needLine = her + " is for " + ovLabel + " for now.";
        else needLine = her + " is opening soon.";
      } else if (level === "gold") {
        needLine = her + " needs Gold or higher.";
      } else if (level === "silver") {
        needLine = her + " needs Silver or higher.";
      } else if (level === "elite") {
        needLine = her + " needs Elite or higher.";
      } else if (level === "bronze") {
        needLine = her + " needs Bronze or higher.";
      } else if (level === "owners") {
        needLine = "Play more nights to own or buy right away.";
      } else if (floor > 0) {
        needLine = her + " charges " + floor + " DPS.";
      } else {
        needLine = her + " is open for " + need + " only.";
      }
      var gap = (floor > 0 && myPts < floor) ? (floor - myPts) : (more || 0);
      var title = (level === "owners") ? "Play more nights to own or buy right away" :
                  (level === "gold") ? her + " is open for Gold and above only." :
                  (level === "silver") ? her + " is open for Silver and above only." :
                  (level === "elite") ? her + " is open for Elite and above only." :
                  her + " needs more Desire points.";
      box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
        '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Your status: <b>' + st + '</b></p>' +
        '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Your DPS: <b>' + myPts + '</b></p>' +
        '<p style="margin:0 0 .5rem;font-size:.95rem;color:#f3e9d7">' + (needLine || title) + '</p>' +
        (gap > 0 ? '<p style="margin:0 0 .6rem;font-size:.95rem;color:#e8c4a8">You need <b>' + gap + '</b> more Desire points.</p>' : '') +
        ways +
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem">' +
          '<a href="index.html#tips" style="flex:1;min-width:120px;text-align:center;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;text-decoration:none">How to earn DPS</a>' +
          ownHerBtn(slug) +
          '<button type="button" id="ddsBuyOpen" style="flex:1;min-width:100px;background:#3a1f4a;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Buy a pack</button>' +
        '</div>' +
        '<button type="button" id="ddsNeedClose" style="width:100%;margin-top:.5rem;background:#2a1a32;color:#fff;padding:.45rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
        '</div>';
      document.body.appendChild(box);
      box.addEventListener("click", function (ev) {
        if (ev.target === box || ev.target.id === "ddsNeedClose") box.remove();
      });
      var buy = document.getElementById("ddsBuyOpen");
      if (buy) buy.addEventListener("click", function () {
        box.remove();
        if (typeof openBuyModal === "function") openBuyModal();
        else if (window.DDS_openBuyRank) window.DDS_openBuyRank();
      });
      return;
    }
    // Eligible. Check DPS cost before creating the ticket.
    var accNow = null;
    try { accNow = window.DDS_account && window.DDS_account(); } catch (e) {}
    var isSigned = !!(accNow && (accNow.id || accNow.username) && accNow.verified);
    if (isSigned && slug && !a.getAttribute("data-dps-ok")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var acc = window.DDS_account && window.DDS_account();
      var myPts = (acc && Number(acc.dps)) || 0;
      var board = window.DDS_BOARD || [];
      var model = null;
      for (var i = 0; i < board.length; i++) {
        if (String(board[i].slut || "").toLowerCase() === slug) { model = board[i]; break; }
      }
      var tier = String((model && model.tier) || "New");
      var base = 20;
      var prem = 0;
      if (/queen|sovereign/i.test(tier)) prem = 40;
      else if (/crown/i.test(tier)) prem = 30;
      else if (/desire elite|super elite/i.test(tier)) prem = 20;
      else if (/elite/i.test(tier)) prem = 15;
      else if (/top/i.test(tier)) prem = 10;
      else if (/strong/i.test(tier)) prem = 5;
      var levelPrem = 0;
      if (/queen|sovereign/i.test(tier)) levelPrem = 20;
      else if (/crown/i.test(tier)) levelPrem = 14;
      else if (/desire elite|super elite/i.test(tier)) levelPrem = 10;
      else if (/elite/i.test(tier)) levelPrem = 6;
      else if (/top/i.test(tier)) levelPrem = 4;
      else if (/strong/i.test(tier)) levelPrem = 2;
      var fullPay = 220 + (levelPrem * 10);
      var doorPrice = (window.DDS_CFG && window.DDS_CFG.doorPrice && Number(window.DDS_CFG.doorPrice[slug])) || 0;
      var raw = doorPrice > 0 ? doorPrice : (base + prem);
      var owned = (typeof playerOwns === "function") && playerOwns(slug);
      var st = (typeof playerStatus === "function") ? playerStatus() : "";
      var pct = 0;
      if (owned) {
        raw = 0;
        pct = 100;
      } else {
        if (st === "silver") pct = 10;
        else if (st === "gold") pct = 20;
        else if (st === "elite") pct = 30;
        else if (st === "platinum") pct = 40;
      }
      var cost = owned ? 0 : Math.max(0, Math.round(raw * (100 - pct) / 100));
      var isBusy = ((window.DDS_UNAVAILABLE || []).indexOf(slug) !== -1) ||
                   ((window.DDS_IN_SESSION || []).indexOf(slug) !== -1) ||
                   ((window.DDS_CFG && window.DDS_CFG.busy || []).map(function(s){ return String(s||"").toLowerCase(); }).indexOf(slug) !== -1);
      var mult = 1;
      if (isBusy && !owned) {
        if (/queen|sovereign/i.test(tier)) mult = 5;
        else if (/crown/i.test(tier)) mult = 4;
        else if (/desire elite|super elite/i.test(tier)) mult = 3;
        else if (/elite/i.test(tier)) mult = 3;
        else mult = 2;
        cost = Math.round(cost * mult);
      }
      var name = slug ? (slug.charAt(0).toUpperCase() + slug.slice(1)) : "She";
      var disc = "";
      if (owned) disc = "You own her. Free entry. Status does not matter.";
      else if (isBusy) disc = "She is busy, so she charges " + mult + "×.";
      else if (doorPrice > 0) disc = "Door price." + (pct > 0 ? (" " + st.charAt(0).toUpperCase() + st.slice(1) + " " + pct + "% off. Was " + raw + ".") : "");
      else if (pct > 0) disc = st.charAt(0).toUpperCase() + st.slice(1) + " " + pct + "% off. Was " + raw + ".";
      var old = document.getElementById("ddsDpsConfirm");
      if (old) old.remove();
      var box = document.createElement("div");
      box.id = "ddsDpsConfirm";
      box.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
      if (myPts < cost) {
        box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
          '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Your DPS: <b>' + myPts + '</b></p>' +
          '<p style="margin:0 0 .5rem;font-size:.95rem;color:#f3e9d7">' + name + ' charges <b>' + cost + '</b> DPS.</p>' +
          (disc ? ('<p style="margin:0 0 .45rem;font-size:.82rem;color:#e8c45a">' + disc + '</p>') : '') +
          '<p style="margin:0 0 .8rem;font-size:.88rem;color:#b9a892">You do not have enough. Buy DPS to continue.</p>' +
          '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
            '<button type="button" id="ddsBuyNow" style="flex:1;min-width:120px;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Buy DPS</button>' +
            '<button type="button" id="ddsDpsClose" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
          '</div></div>';
        document.body.appendChild(box);
        document.getElementById("ddsBuyNow").onclick = function () {
          box.remove();
          if (typeof openBuyDpsModal === "function") openBuyDpsModal();
          else if (window.DDS_openBuyDps) window.DDS_openBuyDps();
        };
        document.getElementById("ddsDpsClose").onclick = function () { box.remove(); };
        box.onclick = function (ev) { if (ev.target === box) box.remove(); };
      } else {
        box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
          '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Your DPS: <b>' + myPts + '</b></p>' +
          '<p style="margin:0 0 .35rem;font-size:.95rem;color:#f3e9d7">' + name + ' charges <b>' + cost + '</b> DPS for the night.</p>' +
          (disc ? ('<p style="margin:0 0 .4rem;font-size:.82rem;color:#e8c45a">' + disc + '</p>') : '') +
          '<p style="margin:0 0 .55rem;font-size:.82rem;color:#b9a892;line-height:1.35">If you win levels you can earn up to <b>' + fullPay + '</b> DPS from ' + name + '. She gives it if she likes you.</p>' +
          '<p style="margin:0 0 .8rem;font-size:.88rem;color:#b9a892">Proceed?</p>' +
          '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
            '<button type="button" id="ddsDpsYes" style="flex:1;min-width:120px;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Yes, proceed</button>' +
            '<button type="button" id="ddsDpsNo" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Come back later</button>' +
          '</div></div>';
        document.body.appendChild(box);
        document.getElementById("ddsDpsYes").onclick = function () {
          box.remove();
          try { sessionStorage.setItem("dds_room_cost", String(cost)); } catch (e) {}
          a.setAttribute("data-dps-ok", "1");
          a.click();
        };
        document.getElementById("ddsDpsNo").onclick = function () { box.remove(); };
        box.onclick = function (ev) { if (ev.target === box) box.remove(); };
      }
      return;
    }
    // Force guest play
    var slug = (a.getAttribute("data-slut") || (href.match(/[?&]slut=([a-z0-9-]+)/i) || [])[1] || (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase()).toLowerCase();
    var NAMES = {preethi:"Preethi",diya:"Diya",meghana:"Meghana",kiara:"Kiara",sravani:"Sravani",meenakshi:"Meenakshi",ayesha:"Ayesha",esther:"Esther",natasha:"Natasha",tharini:"Tharini",kavya:"Kavya",lahari:"Lahari",navya:"Navya",simran:"Simran",chandana:"Chandana",aleena:"Aleena"};
    var her = NAMES[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "She");
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    if (closed.indexOf(slug) !== -1) {
      if (!signed()) {
        e.preventDefault();
        e.stopPropagation();
        window.open("contact_to_play.html", "_blank", "noopener");
        return;
      }
      // signed-in players can still open the profile (black and white)
      return;
    }
    if (!signed() && access[slug] === "guests") {
      e.preventDefault();
      e.stopPropagation();
      location.href = "contact_to_play.html?slut=" + slug;
      return;
    }
    var slug = (a.getAttribute("data-slut") || slugOfHref(href) || slugOfHref(location.href) || "").toLowerCase();
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    if (closed.indexOf(slug) !== -1) {
      if (!signed()) {
        e.preventDefault();
        e.stopPropagation();
        window.open("contact_to_play.html", "_blank", "noopener");
        return;
      }
      // signed-in players can still open the profile
      return;
    }
    var busy = ((window.DDS_CFG && window.DDS_CFG.busy) || []).map(function (s) { return String(s || "").toLowerCase(); });
    if (busy.indexOf(slug) !== -1) {
      var st = playerStatus();
      var ov = (window.DDS_CFG && window.DDS_CFG.busyOverride && window.DDS_CFG.busyOverride[slug]) || "";
      var allowed = false;
      if (ov === "silver" && /silver|gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "gold" && /gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "elite" && /elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "owners" && playerOwns(slug)) allowed = true;
      if (!allowed) {
        e.preventDefault();
        e.stopPropagation();
        alert("She is in use.");
        return;
      }
    }
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    if (access[slug] === "guests") return;
    if (slug && window.DDS_canAccess && !window.DDS_canAccess(slug)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      // Show popup immediately, no navigation
      var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
      var level = access[slug] || "members";
      var need = "Members";
      var floor = 20;
      if (level === "bronze") { need = "Bronze and above"; floor = 50; }
      else if (level === "silver") { need = "Silver and above"; floor = 100; }
      else if (level === "gold") { need = "Gold and above"; floor = 300; }
      else if (level === "elite") { need = "Elite and above"; floor = 650; }
      else if (level === "owners") { need = "owners"; floor = 0; }
      else if (level === "soon" || level === "imagesoon") {
        var ov = (window.DDS_CFG && window.DDS_CFG.soonOverride || {})[slug] || "";
        var ovLabel = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" }[ov] || "";
        var openDate = (window.DDS_CFG && window.DDS_CFG.waveOpens || {})[slug] || "";
        need = ovLabel ? (ovLabel + " for now") : "soon";
        floor = 0;
      }
      var pts = 0;
      try {
        var acc = window.DDS_account && window.DDS_account();
        pts = (acc && acc.dps) || 0;
        if (!pts && acc && acc.status) {
          var st = String(acc.status || "").toLowerCase();
          if (/platinum/.test(st)) pts = 1000;
          else if (/elite/.test(st)) pts = 650;
          else if (/gold/.test(st)) pts = 300;
          else if (/silver/.test(st)) pts = 100;
          else if (/bronze/.test(st)) pts = 50;
          else pts = 0;
        }
      } catch (err) {}
      var more = floor > 0 ? Math.max(0, floor - pts) : 0;
      var body = her + " is open for " + need + " only.";
      var opens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
      var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
      var openDate = opens[slug] || "";
      var ov = override[slug] || "";
      var ovLabel = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" }[ov] || "";
      if (level === "soon" || level === "imagesoon") {
        if (ovLabel && openDate) {
          body = her + " is for " + ovLabel + " for now. Public opens " + openDate + ".";
        } else if (ovLabel) {
          body = her + " is for " + ovLabel + " for now.";
        } else if (openDate) {
          body = her + " opens " + openDate + ".";
        } else {
          body = her + " is opening soon.";
        }
      } else if (level === "members") body = "Sign in to play " + her + ".";
      else if (level === "owners") body = "Play more nights to own her, or buy right away.";
      else if (more > 0) body = her + " is open for " + need + " only. You need " + more + " more Desire points.";
      else if (floor > 0 && pts < floor) body = her + " is open for " + need + " only. You need " + (floor - pts) + " more Desire points.";
      else body = her + " is open for " + need + " only.";
      var old = document.getElementById("ddsNeedRank");
      if (old) old.remove();
      var box = document.createElement("div");
      box.id = "ddsNeedRank";
      box.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
      var ways = '';
      if (more > 0) ways = '<p style="margin:0 0 .5rem;font-size:.86rem;color:#b9a892">You have ' + myPts + ' Desire points (' + st + '). ' + her + ' charges ' + floor + ' (' + need + ').</p>' +
        '<p style="margin:0 0 .8rem;font-size:.86rem;color:#b9a892">Ways to get there:<br>· Play the models you can open and finish nights.<br>· Leave reviews after a room.<br>· Own a woman — Silver after five nights, Gold and above after three.<br>· Or buy a pack if you want the floor now.</p>';
      else ways = '<p style="margin:0 0 .8rem;font-size:.88rem;color:#b9a892">Play the models you can open. Finish nights. Leave reviews. Own a woman. All of these raise your Desire score.</p>';
      var acc = window.DDS_account && window.DDS_account();
      var myPts = (acc && acc.dps) || pts || 0;
      var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
      var bronze = Number(sl.bronze || 50);
      var silver = Number(sl.silver || 150);
      var gold = Number(sl.gold || 700);
      var elite = Number(sl.elite || 1500);
      var plat = Number(sl.platinum || 2500);
      var st = "Member";
      if (myPts >= plat) st = "Platinum";
      else if (myPts >= elite) st = "Elite";
      else if (myPts >= gold) st = "Gold";
      else if (myPts >= silver) st = "Silver";
      else if (myPts >= bronze) st = "Bronze";
      var needLine = "";
      var title = "";
      if (level === "soon" || level === "imagesoon") {
        var openDate = (window.DDS_CFG && window.DDS_CFG.waveOpens && window.DDS_CFG.waveOpens[slug]) || "";
        if (ovLabel && openDate) {
          title = her + " is for " + ovLabel + " for now. Public opens " + openDate + ".";
          needLine = title;
        } else if (ovLabel) {
          title = her + " is for " + ovLabel + " for now.";
          needLine = title;
        } else if (openDate) {
          title = her + " opens " + openDate + ".";
          needLine = title;
        } else {
          title = her + " is opening soon.";
          needLine = title;
        }
      } else if (floor > 0) {
        title = her + " charges " + need + ".";
        needLine = her + " charges " + floor + " DPS (" + need + ").";
      } else {
        title = her + " is open for " + need + " only.";
        needLine = title;
      }
      box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
        '<p style="margin:0 0 .35rem;font-size:1.02rem;color:#e9d5ff">Your status: <b>' + (st || "") + '</b></p>' +
        '<p style="margin:0 0 .35rem;font-size:1.02rem;color:#e9d5ff">Your DPS: <b>' + pts + '</b></p>' +
        '<p style="margin:0 0 .5rem;font-size:.95rem;color:#f3e9d7">' + title + '</p>' +
        (floor > pts ? '<p style="margin:0 0 .5rem;font-size:.95rem;color:#e8c4a8">You need <b>' + (floor - pts) + '</b> more Desire points.</p>' : '') +
        '<p style="margin:0 0 .4rem;font-size:.86rem;color:#b9a892">Ways to get there:<br>· Play the models you can open and finish nights.<br>· Leave reviews after a room.<br>· Own a woman — Silver after five nights, Gold and above after three.<br>· Or buy a pack if you want the floor now.</p>' +
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem">' +
          '<a href="index.html#tips" style="flex:1;min-width:120px;text-align:center;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;text-decoration:none">How to earn DPS</a>' +
          ownHerBtn(slug) +
          '<button type="button" id="ddsBuyOpen" style="flex:1;min-width:100px;background:#3a1f4a;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Buy a pack</button>' +
        '</div>' +
        '<button type="button" id="ddsAccessClose" style="display:block;width:100%;margin-top:.6rem;background:transparent;border:1px solid #4a2c5f;color:#c4b5a0;padding:.45rem;border-radius:8px">Close</button>' +
      '</div>';
      document.body.appendChild(box);
      box.addEventListener("click", function (ev) {
        if (ev.target === box || ev.target.id === "ddsNeedClose") box.remove();
      });
      var buyBtn = document.getElementById("ddsBuyOpen");
      if (buyBtn) buyBtn.onclick = function () {
        box.remove();
        openBuyModal();
      };
      return false;
    }
  }, true);

  function fillBuyPacks() {
    var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
    var silver = Number(sl.silver || 150);
    var gold = Number(sl.gold || 700);
    var elite = Number(sl.elite || 1500);
    var plat = Number(sl.platinum || 2500);
    var packs = [
      { v: "silver", label: "Silver · $20 / ₹1250 · " + silver + " DPS" },
      { v: "gold", label: "Gold · $50 / ₹2500 · " + gold + " DPS" },
      { v: "elite", label: "Elite · $100 / ₹5000 · " + elite + " DPS" },
      { v: "platinum", label: "Platinum · $150 / ₹8000 · " + plat + " DPS" }
    ];
    var sel = document.getElementById("ddsBuyPack");
    if (!sel) return;
    sel.innerHTML = packs.map(function (p) { return '<option value="' + p.v + '">' + p.label + '</option>'; }).join("");
    var hint = document.getElementById("ddsBuyHint");
    if (hint) hint.textContent = "Amazon Giftcard Code in the exact amount. Desk grants the floor after the code clears. Silver $20 / ₹1250 · Gold $50 / ₹2500 · Elite $100 / ₹5000 · Platinum $150 / ₹8000.";
  }

  function openBuyDpsModal() {
    var old = document.getElementById("ddsBuyDpsModal");
    if (old) old.remove();
    var packs = [
      { n: 50, usd: 1, inr: 50 },
      { n: 100, usd: 2, inr: 100 },
      { n: 250, usd: 4, inr: 200 },
      { n: 500, usd: 7, inr: 350 },
      { n: 1000, usd: 12, inr: 600 }
    ];
    var chosen = 1000;
    function priceFor(n) {
      n = Math.max(0, Math.round(Number(n) || 0));
      if (n <= 0) return { usd: 0, inr: 0 };
      var hit = packs.filter(function (p) { return p.n === n; })[0];
      if (hit) return { usd: hit.usd, inr: hit.inr };
      var usd = Math.max(1, Math.round(n * 0.012));
      return { usd: usd, inr: usd * 50 };
    }
    var box = document.createElement("div");
    box.id = "ddsBuyDpsModal";
    box.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    box.innerHTML = '<div style="max-width:440px;width:100%;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Buy DPS</p>' +
      '<p style="margin:0 0 .6rem;font-size:.84rem;color:#b9a892">Pick a pack, or type any number. Amazon Giftcard Code in the exact amount. Desk adds the points after the code clears.</p>' +
      '<div id="ddsDpsChips" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.55rem"></div>' +
      '<div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.5rem">' +
        '<input id="ddsDpsCustom" type="number" min="1" step="1" value="1000" placeholder="Any number" style="flex:1;background:#120814;color:#f3e9d7;border:1px solid #4a2c5f;border-radius:8px;padding:.5rem"/>' +
        '<span id="ddsDpsPrice" style="color:#e8c45a;font-size:.9rem;white-space:nowrap"></span>' +
      '</div>' +
      '<input id="ddsDpsCode" placeholder="Amazon Giftcard Code" minlength="8" style="width:100%;background:#120814;color:#f3e9d7;border:1px solid #4a2c5f;border-radius:8px;padding:.5rem;margin-bottom:.5rem"/>' +
      '<p style="margin:.5rem 0;display:flex;gap:.5rem;flex-wrap:wrap">' +
        '<button type="button" id="ddsDpsSend" style="background:#6b3fa0;color:#fff;padding:.45rem .8rem;border-radius:8px;border:0">Submit</button>' +
        '<button type="button" id="ddsDpsClose" style="background:#2a1a32;color:#fff;padding:.45rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</p>' +
      '<p id="ddsDpsMsg" style="margin:.4rem 0 0;font-size:.85rem;color:#b9a892"></p>' +
    '</div>';
    document.body.appendChild(box);
    var chips = document.getElementById("ddsDpsChips");
    var custom = document.getElementById("ddsDpsCustom");
    var priceEl = document.getElementById("ddsDpsPrice");
    function paint() {
      var n = Math.max(0, Math.round(Number(custom.value) || 0));
      chosen = n;
      var pr = priceFor(n);
      priceEl.textContent = n > 0 ? ("$" + pr.usd + " / ₹" + pr.inr) : "";
      Array.prototype.forEach.call(chips.children, function (b) {
        var on = Number(b.getAttribute("data-n")) === n;
        b.style.background = on ? "#6b3fa0" : "#120814";
        b.style.borderColor = on ? "#c9a24a" : "#4a2c5f";
      });
    }
    packs.forEach(function (pk) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-n", String(pk.n));
      b.textContent = pk.n + " · $" + pk.usd;
      b.style.cssText = "background:#120814;color:#f3e9d7;border:1px solid #4a2c5f;border-radius:8px;padding:.35rem .6rem;font-size:.84rem";
      b.onclick = function () { custom.value = String(pk.n); paint(); };
      chips.appendChild(b);
    });
    custom.oninput = paint;
    paint();
    box.addEventListener("click", function (ev) {
      if (ev.target === box || ev.target.id === "ddsDpsClose") box.remove();
    });
    document.getElementById("ddsDpsSend").onclick = async function () {
      var n = Math.max(0, Math.round(Number(custom.value) || 0));
      var code = (document.getElementById("ddsDpsCode").value || "").trim();
      var msg = document.getElementById("ddsDpsMsg");
      if (n < 1) { msg.textContent = "Type how many DPS."; return; }
      if (code.length < 8) { msg.textContent = "Paste the full Amazon Giftcard Code."; return; }
      var acc = window.DDS_account && window.DDS_account();
      if (!acc || !acc.id) { msg.textContent = "Sign in first."; return; }
      var cfg = window.DDS_SUPABASE || {};
      if (!cfg.url || !cfg.anon) { msg.textContent = "Not ready. Try again."; return; }
      var pr = priceFor(n);
      try {
        var r = await fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/dps_orders", {
          method: "POST",
          headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            player_id: acc.id,
            pack: "dps" + n,
            label: n + " DPS · $" + pr.usd,
            amazon_code: code,
            player_name: acc.nickname || acc.username || "",
            player_email: acc.email || "",
            status: "open"
          })
        });
        if (!r.ok) throw new Error(await r.text());
        msg.textContent = "Sent to the desk. Once granted, the receipt will be in your inbox.";
        document.getElementById("ddsDpsCode").value = "";
      } catch (err) {
        msg.textContent = err.message || "Could not send.";
      }
    };
  }
  window.DDS_openBuyDps = openBuyDpsModal;
  function openBuyModal() {
    var old = document.getElementById("ddsBuyModal");
    if (old) old.remove();
    var box = document.createElement("div");
    box.id = "ddsBuyModal";
    box.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    box.innerHTML = '<div style="max-width:420px;width:100%;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .6rem;font-size:1.05rem;color:#e9d5ff">Buy a rank</p>' +
      '<p style="margin:0 0 .8rem;font-size:.88rem;color:#b9a892" id="ddsBuyHint">Amazon Giftcard Code in the exact amount. Desk grants the floor after the code clears.</p>' +
      '<select id="ddsBuyPack" style="width:100%;background:#120814;color:#f3e9d7;border:1px solid #4a2c5f;border-radius:8px;padding:.5rem;margin-bottom:.5rem"></select>' +
      '<input id="ddsBuyCode" placeholder="Amazon Giftcard Code" minlength="8" style="width:100%;background:#120814;color:#f3e9d7;border:1px solid #4a2c5f;border-radius:8px;padding:.5rem;margin-bottom:.5rem"/>' +
      '<p style="margin:.5rem 0;display:flex;gap:.5rem;flex-wrap:wrap">' +
        '<button type="button" id="ddsBuySend" style="background:#6b3fa0;color:#fff;padding:.45rem .8rem;border-radius:8px;border:0">Submit purchase</button>' +
        '<button type="button" id="ddsBuyClose" style="background:#2a1a32;color:#fff;padding:.45rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</p>' +
      '<p id="ddsBuyMsg" style="margin:.4rem 0 0;font-size:.85rem;color:#b9a892"></p>' +
    '</div>';
    document.body.appendChild(box);
    fillBuyPacks();
    box.addEventListener("click", function (ev) {
      if (ev.target === box || ev.target.id === "ddsBuyClose") box.remove();
    });
    document.getElementById("ddsBuySend").onclick = async function () {
      var msg = document.getElementById("ddsBuyMsg");
      var code = (document.getElementById("ddsBuyCode").value || "").trim();
      var pack = document.getElementById("ddsBuyPack").value;
      if (!code || code.length < 8) { msg.textContent = "Paste a valid Amazon Giftcard Code."; return; }
      var me = null;
      try { me = window.DDS_account && window.DDS_account(); } catch (e) {}
      if (!me || !me.id) { msg.textContent = "Login first."; return; }
      msg.textContent = "Sending…";
      var labels = { silver: "$20 / ₹1250", gold: "$50 / ₹2500", elite: "$100 / ₹5000", platinum: "$150 / ₹8000" };
      var cfg = window.DDS_SUPABASE || {};
      try {
        var r = await fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/dps_orders", {
          method: "POST",
          headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            player_id: me.id,
            pack: pack,
            label: labels[pack] || pack,
            amazon_code: code,
            player_name: me.nickname || me.username || "",
            player_email: me.email || "",
            status: "open"
          })
        });
        if (!r.ok) throw new Error(await r.text());
        msg.textContent = "Sent to the desk. Once granted, the receipt will be in your inbox.";
        document.getElementById("ddsBuyCode").value = "";
      } catch (err) {
        msg.textContent = err.message || "Could not send.";
      }
    };
  }
  function applyHouseGates() {
    var cfg = window.DDS_CFG || {};
    var closed = (cfg.unavailable || []).map(function (s) { return String(s || "").toLowerCase(); });
    var busy = (cfg.busy || []).map(function (s) { return String(s || "").toLowerCase(); });
    var seen = {};
    var off = [];
    busy.concat(autoBusy()).forEach(function (s) {
      if (s && closed.indexOf(s) === -1 && !seen[s]) { seen[s] = 1; off.push(s); }
    });
    window.DDS_CLOSED = closed;
    window.DDS_UNAVAILABLE = off;
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (/^(admin|desirescoutadmin)(\.html)?$/i.test(page)) return;
    var deskOn = false;
    try {
      deskOn = Number(localStorage.getItem("dds_admin_until") || sessionStorage.getItem("dds_admin_until") || 0) > Date.now();
    } catch (e) {}
    document.querySelectorAll(".dds-site-down, .dds-hold-bar").forEach(function (el) { el.remove(); });
    var signedIn = false;
    try {
      var acc = JSON.parse(localStorage.getItem("dds_account") || "null");
      signedIn = !!(acc && acc.id);
    } catch (e) {}
    var keepOpen = /^(account|session|reviews|rate|spin|spin_index|spin-check|review-check)(\.html)?$/i.test(page);
    if (cfg.siteDown && deskOn) {
      var note = document.createElement("div");
      note.className = "dds-hold-bar";
      note.innerHTML = "<b>Hold is ON for guests.</b> Logged-in men still see the house and follow Closed / Busy doors. Open a private window to see the guest lock.";
      document.body.insertBefore(note, document.body.firstChild);
    }
    if (cfg.siteDown && signedIn && !deskOn) {
      var barIn = document.createElement("div");
      barIn.className = "dds-hold-bar";
      barIn.innerHTML = "<b>House is quiet for guests.</b> You are in. Closed / Busy doors still apply.";
      document.body.insertBefore(barIn, document.body.firstChild);
    }
    if (cfg.siteDown && !deskOn && !signedIn) {
      var msg = String(cfg.siteDownMsg || "The clubhouse is on hold.").replace(/</g, "");
      var invite = "Rooms are closed until the models are back. Create an account or update your card now so you can play the minute the doors open.";
      if (keepOpen) {
        document.body.style.overflow = "";
        var bar = document.createElement("div");
        bar.className = "dds-hold-bar";
        bar.innerHTML = "<b>Rooms are on hold.</b> Session cards, reviews, and spin stay open. <a href='account.html' style='color:#edd8ff'>Finish your card</a> so you can play when the house opens.";
        document.body.insertBefore(bar, document.body.firstChild);
      } else {
        var cover = document.createElement("div");
        cover.className = "dds-site-down";
        cover.innerHTML = "<div class='dds-site-down-card'><p class='k'>PURPLE</p><h1>Game on hold</h1><p>" + msg +
          "</p><p>" + invite + "</p><p class='hold-actions'><a href='account.html'>Login</a><a href='account.html#create'>Create account</a></p>" +
          "<p class='muted'>Session cards, reviews, and spin stay open. Finish your profile while you wait.</p></div>";
        document.body.appendChild(cover);
        document.body.style.overflow = "hidden";
        markBusyDoors(LIVE_DOORS.slice());
        document.querySelectorAll("a[href*='contact_to_play'], a.request-flash, a.dds-play-mid").forEach(function (a) {
          a.setAttribute("href", "account.html");
          a.textContent = "Game on hold · finish your card";
        });
      }
      return;
    }
    document.body.style.overflow = "";
    markClosedDoors(closed);
    markBusyDoors(off);
    hideOwnHerLinks();
    if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
    stampProfileHold();
    blurSoonProfile();
    var allSoon = Object.keys(PLAY_OPEN_ON).concat(Object.keys(UNDATED_SOON));
    var cfgOpens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
    var cfgAccess = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    Object.keys(cfgOpens).concat(Object.keys(cfgAccess)).forEach(function (s) {
      if (allSoon.indexOf(s) === -1 && (cfgAccess[s] === "soon" || cfgAccess[s] === "imagesoon" || cfgOpens[s])) allSoon.push(s);
    });
    allSoon.forEach(function (slug) {
      var until = playerOwns(slug) ? "" : playSoon(slug);
      var isBusy = off.indexOf(slug) !== -1;
      document.querySelectorAll("a.poster-card[data-slut='" + slug + "']").forEach(function (card) {
        var key = (window.DDS_CFG && window.DDS_CFG.doorAccess && window.DDS_CFG.doorAccess[slug]) || "members";
        var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
        var key = access[slug] || "members";
        var isImageSoon = key === "imagesoon";
        var canSee = window.DDS_canAccess && window.DDS_canAccess(slug);
        card.classList.toggle("coming-soon", (!!until || isImageSoon) && !canSee);
        card.classList.toggle("undated-soon", (until === "soon" || isImageSoon) && !canSee);
        card.classList.toggle("dds-unblur", !!canSee && (key === "soon" || key === "imagesoon"));
        if (window.DDS_lureSoon) window.DDS_lureSoon();
        var isSoon = key === "soon" || key === "imagesoon";
        var cfgDate = ((window.DDS_CFG && window.DDS_CFG.waveOpens) || {})[slug];
        var showDate = isSoon ? (cfgDate || until) : "";
        if (showDate && showDate !== "soon" && cdtYmd() >= showDate) showDate = "";
        var cta = card.querySelector(".poster-cta");
        if (cta && !card.classList.contains("trainer-card")) {
          var inRoom = slug !== "anu" && (window.DDS_IN_SESSION || []).indexOf(slug) !== -1;
          var hold = ((window.DDS_CFG || {}).forceAvailable || []).indexOf(slug) !== -1;
          cta.textContent = (inRoom && !hold) ? "In use" : "Click to Play";
        }
        var stamp = card.querySelector(".soon-stamp, .dds-open-on");
        if (stamp) stamp.style.display = "none";
        var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
        if (isSoon && override[slug]) {
          var pill = card.querySelector(".dds-access");
          if (!pill) {
            pill = document.createElement("div");
            pill.className = "dds-access";
            pill.style.cssText = "position:absolute;right:.45rem;top:.45rem;z-index:6;font-size:.72rem;letter-spacing:.04em;padding:.22rem .55rem;border-radius:999px;font-weight:700";
            card.appendChild(pill);
          }
          var labels = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" };
          pill.textContent = labels[override[slug]] || pill.textContent;
          if (override[slug] === "bronze") pill.style.cssText += ";background:#3a2a18;color:#d4a574;border:1px solid #a06030";
          else if (override[slug] === "silver") pill.style.cssText += ";background:#2a2a32;color:#c8c8d0;border:1px solid #808090";
          else if (override[slug] === "gold") pill.style.cssText += ";background:#3a2a08;color:#f5c518;border:1px solid #f5c518";
          else if (override[slug] === "elite") pill.style.cssText += ";background:#2a1a40;color:#d4b8ff;border:1px solid #b08cff";
          else if (override[slug] === "owners") pill.style.cssText += ";background:#3a1020;color:#f0a0c0;border:1px solid #c04070";
        }
        // Owners can still play on a soon door
        var ownNote = card.querySelector(".dds-own-play");
        var hasOwners = false;
        try {
          var rows = window.DDS_BOARD || [];
          var hit = rows.filter(function (r) { return String(r.slut || "").toLowerCase() === slug; })[0];
          hasOwners = hit && Number(hit.own_count || 0) > 0;
        } catch (e) {}
        if (until && hasOwners) {
          if (!ownNote) {
            ownNote = document.createElement("div");
            ownNote.className = "dds-own-play";
            ownNote.style.cssText = "position:absolute;left:.45rem;bottom:.4rem;z-index:4;background:#1a1008;color:#f0d78a;border:1px solid #c9a227;border-radius:999px;font-size:.68rem;letter-spacing:.06em;padding:.18rem .5rem;font-weight:700";
            card.appendChild(ownNote);
          }
          ownNote.textContent = "Owners can still play";
          ownNote.style.display = "";
        } else if (ownNote) {
          ownNote.style.display = "none";
        }
      });
      document.querySelectorAll("img[data-slut='" + slug + "']").forEach(function (img) {
        var wrap = img.closest(".portrait, .poster-card, a.version") || img.parentNode;
        if (!wrap) return;
        var existing = wrap.querySelector(".soon-stamp, .dds-open-on");
        if (existing) existing.style.display = "none";
      });
      if ((location.pathname.split("/").pop() || "").replace(".html","").toLowerCase() === slug) {
        document.querySelectorAll("a.dds-play-mid, a[href*='contact_to_play']").forEach(function (el) {
          if (isBusy) {
            el.classList.add("dds-want-play");
            el.textContent = "Busy";
          } else if (until) {
            el.classList.add("dds-want-play");
            el.textContent = openOnLabel(until);
          } else if (el.classList.contains("dds-play-mid")) {
            if (slug === "anu") {
              el.remove();
            } else {
              el.setAttribute("href", "contact_to_play.html?slut=" + slug);
              el.textContent = "Click Here To Play";
            }
            el.classList.remove("dds-off");
          }
        });
      }
    });
    if (window.DDS_paintArt) window.DDS_paintArt();
    stampLineupLive();
    if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
  }
  function memberSeesStatus() {
    try {
      if (localStorage.getItem("dds_idle") === "1") return false;
      var a = JSON.parse(localStorage.getItem("dds_account") || "null");
      return !!(a && (a.id || a.username) && a.verified);
    } catch (e) { return false; }
  }
  window.DDS_memberSeesStatus = memberSeesStatus;

  function paintAccessLabels() {
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var labels = {
      guests: { text: "Guests", cls: "access-guests" },
      members: { text: "Members", cls: "access-members" },
      bronze: { text: "Bronze+", cls: "access-bronze" },
      silver: { text: "Silver+", cls: "access-silver" },
      gold: { text: "Gold+", cls: "access-gold" },
      elite: { text: "Elite+", cls: "access-elite" },
      owners: { text: "Owners", cls: "access-owners" },
      soon: { text: "Soon", cls: "access-soon" },
      imagesoon: { text: "Soon", cls: "access-soon" }
    };
    var opens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
    var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
    var overrideLabels = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" };
    document.querySelectorAll("a.poster-card").forEach(function (card) {
      var slug = (card.getAttribute("data-slut") || "").toLowerCase();
      if (!slug) {
        var href = (card.getAttribute("href") || "").split("?")[0].split("/").pop().replace(".html","").toLowerCase();
        slug = href;
      }
      if (!slug || card.classList.contains("trainer-card")) return;
      var closed = (window.DDS_CLOSED || (window.DDS_CFG && window.DDS_CFG.unavailable) || []).map(function (s) { return String(s || "").toLowerCase(); });
      if (closed.indexOf(slug) !== -1) {
        var oldPill = card.querySelector(".dds-access");
        if (oldPill) oldPill.remove();
        return;
      }
      var key = access[slug] || "members";
      var info = labels[key] || labels.members;
      var busy = (window.DDS_CFG && window.DDS_CFG.busy) || [];
      var busyOverride = (window.DDS_CFG && window.DDS_CFG.busyOverride) || {};
      var busyLabels = { silver: "Open for Silver+", gold: "Open for Gold+", elite: "Open for Elite+", owners: "Open for owners only" };
      if (busy.indexOf(slug) !== -1 && busyOverride[slug] && busyLabels[busyOverride[slug]]) {
        info = { text: busyLabels[busyOverride[slug]], cls: "access-" + busyOverride[slug] };
      } else if ((key === "soon" || key === "imagesoon") && override[slug] && overrideLabels[override[slug]]) {
        info = { text: overrideLabels[override[slug]], cls: "access-" + override[slug] };
      }
      var pill = card.querySelector(".dds-access");
      if (!pill) {
        pill = document.createElement("div");
        pill.className = "dds-access";
        pill.style.cssText = "position:absolute;right:.4rem;top:.4rem;z-index:4;border-radius:999px;font-size:.66rem;letter-spacing:.05em;padding:.16rem .48rem;font-weight:700;pointer-events:none";
        card.appendChild(pill);
      }
      pill.className = "dds-access " + info.cls;
      pill.textContent = info.text;
      if (info.cls === "access-guests") pill.style.cssText += ";background:#102018;color:#8fd9a8;border:1px solid #3dd68c";
      else if (info.cls === "access-members") pill.style.cssText += ";background:#2a1e10;color:#f0d78a;border:1px solid #c9a227";
      else if (info.cls === "access-bronze") pill.style.cssText += ";background:#2a1c10;color:#d4a574;border:1px solid #b87333";
      else if (info.cls === "access-silver") pill.style.cssText += ";background:#1a2030;color:#c0d0f0;border:1px solid #8aa4d8";
      else if (info.cls === "access-gold") pill.style.cssText += ";background:#3a2a08;color:#f5c518;border:1px solid #f5c518";
      else if (info.cls === "access-elite") pill.style.cssText += ";background:#2a1a40;color:#d4b8ff;border:1px solid #b08cff";
      else if (info.cls === "access-owners") pill.style.cssText += ";background:#3a1020;color:#f0a0c0;border:1px solid #c04070";
      else pill.style.cssText += ";background:#1a1028;color:#d8b4fe;border:1px solid #9b6bdb";
      // Purple strip for soon / imagesoon: Open for all on [date]
      var oldStrip = card.querySelector(".dds-soon-strip");
      if (oldStrip) oldStrip.remove();
      if (key === "soon" || key === "imagesoon") {
        var openDate = opens[slug] || "";
        if (openDate) {
          var strip = document.createElement("div");
          strip.className = "dds-soon-strip";
          strip.style.cssText = "position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);z-index:4;background:#6b3fa0;color:#fff;font-size:.68rem;letter-spacing:.04em;padding:.28rem .4rem;text-align:center;font-weight:700;pointer-events:none";
          var d = openDate;
          try {
            var parts = openDate.split("-");
            if (parts.length === 3) {
              var dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              d = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }
          } catch (e) {}
          var ovText = (override[slug] && overrideLabels[override[slug]]) ? (" · " + overrideLabels[override[slug]] + " can play") : "";
          strip.textContent = "Open for all " + d + ovText;
          card.appendChild(strip);
        }
      }
    });
  }
  window.DDS_paintAccess = paintAccessLabels;

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("contact_to_play") === -1 && !a.classList.contains("dds-play-mid") && !a.classList.contains("request-flash")) return;
    if (!signed()) return;
    var slug = slugFromHref(href) || slugFromHref(location.href);
    var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    if (!slug && SLUGS.indexOf(page) !== -1) slug = page;
    if (!slug) return;
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var level = access[slug] || "";
    if (!level || level === "guests" || level === "members") return;
    if (window.DDS_canAccess && window.DDS_canAccess(slug)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (window.DDS_showAccessPop) window.DDS_showAccessPop(slug, level);
  }, true);


  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    if (access[page] !== "guests") return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("contact_to_play") === -1 && !a.classList.contains("dds-play-mid") && !a.classList.contains("request-flash")) return;
    e.preventDefault();
    e.stopPropagation();
    location.href = "contact_to_play.html?slut=" + encodeURIComponent(page);
  }, true);


  function bindGuestPlay() {
    var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    if (access[page] !== "guests") return;
    // Hide Own her on guest doors
    document.querySelectorAll("a[href*='send_gift'], a[href*='own']").forEach(function (a) {
      a.style.display = "none";
    });
    // Only rewrite actual play links, keep one
    var plays = document.querySelectorAll("a.dds-play-mid, a.request-flash, a[href*='contact_to_play']");
    var seen = false;
    plays.forEach(function (a) {
      if (seen) { a.style.display = "none"; return; }
      seen = true;
      a.setAttribute("data-guest-bound", "1");
      a.style.pointerEvents = "auto";
      a.style.opacity = "1";
      a.removeAttribute("aria-disabled");
      a.href = "contact_to_play.html?slut=" + encodeURIComponent(page);
      a.textContent = "Click to Play";
      a.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        location.href = "contact_to_play.html?slut=" + encodeURIComponent(page);
        return false;
      };
    });
  }
  document.addEventListener("dds-cfg", bindGuestPlay);
  setTimeout(bindGuestPlay, 300);
  setTimeout(bindGuestPlay, 1000);
  setTimeout(bindGuestPlay, 2000);
  setTimeout(bindGuestPlay, 4000);

  document.addEventListener("click", function (e) {
    var h = e.target.closest && e.target.closest("a.heart-btn, a.dds-hearts");
    if (!h) return;
    e.preventDefault();
    e.stopPropagation();
    var slug = h.getAttribute("data-slut") || (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    if (slug && window.DDS_openHeart) window.DDS_openHeart(slug);
    else if (slug) openHeartModal(slug);
  }, true);
  window.DDS_openHeart = openHeartModal;

  document.addEventListener("dds-cfg", function () {
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 100);
    if (window.DDS_paintAccess) window.DDS_paintAccess();
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (window.DDS_paintAccess) window.DDS_paintAccess();
  });
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 400);
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 1200);

  function stampAccessOnPlay() {
    var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    if (page === "meenakshi" || page === "anu") return;
    if (!page || page === "index") return;
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    var busy = ((window.DDS_CFG && window.DDS_CFG.busy) || []).map(function (s) { return String(s || "").toLowerCase(); });
    var busyOverride = (window.DDS_CFG && window.DDS_CFG.busyOverride) || {};
    var buttons = document.querySelectorAll("a.dds-play-mid, a.request-flash, a[href*='contact_to_play'], button.dds-play-mid, .play-cta a[href*='contact_to_play'], .play-row a[href*='contact_to_play']");
    if (closed.indexOf(page) !== -1) {
      buttons.forEach(function (a) {
        a.textContent = "Not receiving tonight";
        a.classList.add("dds-access-blocked");
        if (a.tagName === "A") a.removeAttribute("href");
        a.style.pointerEvents = "none";
        a.style.opacity = "0.55";
        a.setAttribute("aria-disabled", "true");
      });
      return;
    }
    if (busy.indexOf(page) !== -1) {
      var st = playerStatus();
      var ov = busyOverride[page];
      var allowed = false;
      if (ov === "silver" && /silver|gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "gold" && /gold|elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "elite" && /elite|platinum/.test(st || "")) allowed = true;
      else if (ov === "owners" && playerOwns(page)) allowed = true;
      if (!allowed) {
        buttons.forEach(function (a) {
          a.textContent = "In use";
          a.classList.add("dds-access-blocked");
          if (a.tagName === "A") a.removeAttribute("href");
          a.style.pointerEvents = "none";
          a.style.opacity = "0.55";
          a.setAttribute("aria-disabled", "true");
        });
        return;
      }
    }
    if (!closed.length && !busy.length && !window.__ddsClosedRetry) {
      window.__ddsClosedRetry = 1;
      setTimeout(function () { window.__ddsClosedRetry = 0; stampAccessOnPlay(); }, 1500);
    }
    var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
    var level = access[page] || "members";
    var isGuestDoor = level === "guests";
    var ok = isGuestDoor || (window.DDS_canAccess && window.DDS_canAccess(page));
    buttons.forEach(function (a) {
      if (ok) {
        a.classList.remove("dds-access-blocked");
        a.style.pointerEvents = "";
        a.style.opacity = "";
        a.removeAttribute("aria-disabled");
        if (!a.getAttribute("href") || a.getAttribute("href") === "#") {
          a.setAttribute("href", "contact_to_play.html?slut=" + encodeURIComponent(page));
        }
        if (/sign in to play|members only|silver\+|gold\+|owners only|opening soon|not receiving|in use|coming soon|click to play/i.test(a.textContent || "")) {
          a.textContent = "Click to Play";
        }
        // live session wins
        if ((window.DDS_IN_SESSION || []).indexOf(page) !== -1 && ((window.DDS_CFG || {}).forceAvailable || []).indexOf(page) === -1) {
          a.textContent = "In use";
          a.classList.add("dds-access-blocked");
          a.style.pointerEvents = "none";
          a.style.opacity = "0.55";
        }
        return;
      }
      var msg = "Click to Play";
      a.textContent = msg;
      a.classList.add("dds-access-blocked");
      a.style.opacity = "0.55";
      a.setAttribute("aria-disabled", "true");
      a.style.pointerEvents = "";
      if (a.tagName === "A" && (!a.getAttribute("href") || a.getAttribute("href") === "#")) {
        a.setAttribute("href", "contact_to_play.html?slut=" + encodeURIComponent(page));
      }
    });
  }
  function stampLineupLive() {
    if (window.DDS_paintAccess) window.DDS_paintAccess();
    if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
    [400, 1200, 2500, 4000, 7000].forEach(function (ms) {
      setTimeout(function () {
        if (window.DDS_paintAccess) window.DDS_paintAccess();
        if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
      }, ms);
    });
    window.addEventListener("storage", function (e) {
      if (e.key === "dds_account") {
        if (window.DDS_paintAccess) window.DDS_paintAccess();
        if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
      }
    });
    if (!memberSeesStatus()) {
      document.querySelectorAll(".dds-live, .status-busy, .dds-off-tag, .dds-off-banner").forEach(function (el) { el.remove(); });
      document.querySelectorAll("a.poster-card").forEach(function (card) {
        card.classList.remove("dds-edge-free", "dds-edge-busy", "dds-edge-closed", "dds-edge-soon");
      });
      return;
    }
    var busy = window.DDS_UNAVAILABLE || [];
    var closed = window.DDS_CLOSED || [];
    document.querySelectorAll("a.poster-card[data-slut]").forEach(function (card) {
      var slug = (card.getAttribute("data-slut") || "").toLowerCase();
      if (!slug || card.classList.contains("trainer-card")) return;
      var soon = !playerOwns(slug) && (card.classList.contains("coming-soon") || (window.DDS_playSoon && window.DDS_playSoon(slug)));
      var holdOpen = ((window.DDS_CFG || {}).forceAvailable || []).indexOf(slug) !== -1;
      var inRoom = slug !== "anu" && (window.DDS_IN_SESSION || []).indexOf(slug) !== -1;
      var state = "free";
      var label = "Available";
      if (soon) { state = "soon"; label = "Soon"; }
      else if (closed.indexOf(slug) !== -1) {
        state = "closed";
        label = "Closed";
        var accessPill = card.querySelector(".dds-access");
        if (accessPill) accessPill.remove();
        card.classList.add("dds-closed");
        var img = card.querySelector("img");
        if (img) img.style.filter = "grayscale(1) brightness(.6)";
      }
      else if (busy.indexOf(slug) !== -1 || (inRoom && !holdOpen)) { state = "busy"; label = "Busy"; }
      var dot = card.querySelector(".dds-live");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "dds-live";
        card.appendChild(dot);
      }
      dot.className = "dds-live " + state;
      dot.innerHTML = "<i></i>" + label;
      card.classList.remove("dds-edge-free", "dds-edge-busy", "dds-edge-closed", "dds-edge-soon");
      card.classList.add("dds-edge-" + state);
    });
    // Profile portrait gets the same tint
    var hero = document.querySelector("article.profile-hero");
    if (hero) {
      var pageSlug = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
      if (pageSlug && pageSlug !== "index") {
        var soon = !playerOwns(pageSlug) && (window.DDS_playSoon && window.DDS_playSoon(pageSlug));
        var holdOpen = ((window.DDS_CFG || {}).forceAvailable || []).indexOf(pageSlug) !== -1;
        var inRoom = pageSlug !== "anu" && (window.DDS_IN_SESSION || []).indexOf(pageSlug) !== -1;
        var pState = "free";
        if (soon) pState = "soon";
        else if ((window.DDS_CLOSED || []).indexOf(pageSlug) !== -1) pState = "closed";
        else if ((window.DDS_UNAVAILABLE || []).indexOf(pageSlug) !== -1 || (inRoom && !holdOpen)) pState = "busy";
        hero.classList.remove("dds-edge-free", "dds-edge-busy", "dds-edge-closed", "dds-edge-soon");
        hero.classList.add("dds-edge-" + pState);
      }
    }
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    var hold = ((window.DDS_CFG || {}).forceAvailable || []).indexOf(page) !== -1;
    var live = page !== "anu" && (window.DDS_IN_SESSION || []).indexOf(page) !== -1;
    var manual = (window.DDS_UNAVAILABLE || []).indexOf(page) !== -1;
    if (live && !hold && !manual) {
      document.querySelectorAll("a.dds-play-mid, a[href*='contact_to_play']").forEach(function (a) {
        a.classList.add("dds-want-play");
        a.textContent = "In use";
      });
    }
  }
  function pullLiveSessions() {
    var cfg = window.DDS_SUPABASE || {};
    var urlBase = cfg.url || "https://axavugukoesqkfykprur.supabase.co";
    var anon = cfg.anon || "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I";
    var since = new Date(Date.now() - 120000).toISOString();
    var url = String(urlBase).replace(/\/$/, "") + "/rest/v1/rooms?select=model_slug,status,last_seen&status=in.(open,closing)&last_seen=gte." + encodeURIComponent(since);
    fetch(url, { headers: { apikey: anon, Authorization: "Bearer " + anon } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        var slugs = [];
        (rows || []).forEach(function (row) {
          var s = String(row.model_slug || "").toLowerCase();
          if (s === "anu") return;
          if (s && slugs.indexOf(s) === -1) slugs.push(s);
        });
        window.DDS_IN_SESSION = slugs;
        stampLineupLive();
      })
      .catch(function () {});
  }
  pullLiveSessions();
  setInterval(pullLiveSessions, 20000);
  document.addEventListener("dds-cfg", applyHouseGates);
  function whenCfg(fn) {
    var p = window.DDS_CFG_READY;
    if (p && p.then) p.then(fn);
    else fn();
  }
  ready(function () {


    (function unifyRibbon() {
      var nav = document.querySelector("nav");
      if (!nav) return;
      nav.classList.add("nav");
      var inner = nav.querySelector(".nav-inner");
      if (!inner) {
        inner = document.createElement("div");
        inner.className = "nav-inner";
        while (nav.firstChild && nav.firstChild !== inner) inner.appendChild(nav.firstChild);
        nav.insertBefore(inner, nav.firstChild);
      }
      var brand = inner.querySelector(".nav-brand") || inner.querySelector('a[href="index.html"]');
      if (brand) brand.classList.add("nav-brand");
      var links = inner.querySelector(".nav-links") || inner.querySelector(".flash-nav");
      if (!links) {
        links = document.createElement("div");
        links.className = "nav-links";
        inner.appendChild(links);
      }
      links.className = "nav-links";
      links.innerHTML =
        '<a href="index.html#lineup">Models</a>' +
        '<a href="forum.html">Lounge</a>' +
        '<a href="how_to_play.html">How to Play</a>' +
        '<a href="club.html">Board</a>' +
        (function () {
          try {
            var a = JSON.parse(localStorage.getItem("dds_account") || "null");
            if (a && a.id) return '<a href="account.html?feedback=1">Feedback / Queries</a><a href="account.html?admin=1">Desk</a>';
          } catch (e) {}
          return "";
        })();
      inner.querySelectorAll(".flash-nav").forEach(function (el) {
        if (el !== links) el.remove();
      });
    })();


    function openEarnDps() {
      var old = document.getElementById("ddsEarnPop");
      if (old) old.remove();
      var pop = document.createElement("div");
      pop.id = "ddsEarnPop";
      pop.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:80;display:flex;align-items:center;justify-content:center;padding:1rem";
      pop.innerHTML =
        '<div style="max-width:420px;width:100%;background:#1a0f1a;border:1px solid #4a2c5f;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e7ff">' +
        '<p style="margin:0 0 .6rem;font-size:1.05rem;color:#e9d5ff">DesirePoints (DPS)</p>' +
        '<ul style="margin:0;padding-left:1.1rem;font-size:.88rem;line-height:1.55;color:#d8c6b0">' +
        '<li>Play her, strip her, and she pays you DPS from her pocket. New doors start with 1000. Each level you earn takes points from her and adds them to yours.</li>' +
        '<li>Stay and talk. A real night, a real review, a spin she opens — those add points.</li>' +
        '<li>Send a heart on her profile. She notices.</li>' +
        '<li>Own her. The house marks it. That is separate from your wallet.</li>' +
        '</ul>' +
        '<div style="margin-top:.9rem"><button type="button" id="ddsEarnClose" style="background:#6b3fa0;color:#fff;border:0;border-radius:8px;padding:.45rem .9rem">Close</button></div>' +
        '</div>';
      document.body.appendChild(pop);
      pop.querySelector("#ddsEarnClose").onclick = function () { pop.remove(); };
      pop.onclick = function (e) { if (e.target === pop) pop.remove(); };
    }
    function packNav() {
      var nav = document.querySelector("nav");
      if (!nav) return;
      var inner = nav.querySelector(".nav-inner") || nav;
      var acc = inner.querySelector(".nav-account");
      if (!acc) {
        acc = document.createElement("div");
        acc.className = "nav-account";
        inner.appendChild(acc);
      }
      var logins = [];
      nav.querySelectorAll("a.dds-login").forEach(function (a) {
        if (a.closest(".dds-drawer")) return;
        logins.push(a);
      });
      if (!logins.length) return;
      var keep = logins[0];
      acc.appendChild(keep);
      logins.slice(1).forEach(function (a) { if (a.parentNode) a.parentNode.removeChild(a); });
      var outs = [];
      nav.querySelectorAll("a.dds-logout, a.dds-out").forEach(function (a) {
        if (a.closest(".dds-drawer")) return;
        outs.push(a);
      });
      if (outs.length) {
        acc.appendChild(outs[0]);
        outs.slice(1).forEach(function (a) { if (a.parentNode) a.parentNode.removeChild(a); });
      }
      if (!acc.querySelector(".dds-buy-dps")) {
        var earn = document.createElement("a");
        earn.className = "dds-earn-dps";
        earn.href = "#";
        earn.textContent = "DesirePoints (DPS)";
        earn.style.cssText = "margin-right:.35rem;padding:.35rem .7rem;border-radius:999px;background:#2a1c08;color:#e8c45a;font-size:.78rem;font-weight:700;text-decoration:none;letter-spacing:.03em;border:1px solid #e8c45a";
        earn.onclick = function (e) {
          e.preventDefault();
          openEarnDps();
        };
        acc.insertBefore(earn, acc.firstChild);
        /* Buy DPS hidden for now. Earn DPS stays. */
        var buy = document.createElement("a");
        buy.className = "dds-buy-dps";
        buy.href = "#";
        buy.textContent = "Buy DPS";
        buy.style.cssText = "display:none;margin-right:.5rem;padding:.35rem .7rem;border-radius:999px;background:#6b3fa0;color:#fff;font-size:.78rem;font-weight:700;text-decoration:none;letter-spacing:.03em";
        buy.onclick = function (e) {
          e.preventDefault();
          if (typeof openBuyDpsModal === "function") openBuyDpsModal();
          else if (window.DDS_openBuyDps) window.DDS_openBuyDps();
        };
        acc.insertBefore(buy, earn.nextSibling);
      }
    }
    packNav();
    setTimeout(packNav, 50);
    setTimeout(packNav, 400);
    document.addEventListener("dds-cfg", packNav);


    (function placeMeta() {
      var info = document.querySelector("article.profile-hero .info");
      if (!info) return;
      var name = info.querySelector("h1");
      var meta = info.querySelector(".meta-line");
      if (name && meta) name.insertAdjacentElement("afterend", meta);
    })();


    (function ensureRankBanner() {
      var info = document.querySelector("article.profile-hero .info");
      if (!info) return;
      var banner = info.querySelector(".glory-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.className = "glory-banner";
        banner.innerHTML = '<span class="rank-gold-pill">Rank No.—</span><span class="status-purple-pill">—</span><span class="g-s"></span>';
        var meta = info.querySelector(".meta-line");
        var name = info.querySelector("h1");
        if (meta && meta.nextSibling) info.insertBefore(banner, meta.nextSibling);
        else if (name && name.nextSibling) info.insertBefore(banner, name.nextSibling);
        else info.insertBefore(banner, info.firstChild);
      }
      if (!banner.querySelector(".rank-gold-pill")) {
        var g = document.createElement("span");
        g.className = "rank-gold-pill";
        g.textContent = "Rank No.—";
        banner.insertBefore(g, banner.firstChild);
      }
      if (!banner.querySelector(".status-purple-pill")) {
        var s = document.createElement("span");
        s.className = "status-purple-pill";
        s.textContent = "—";
        var gold = banner.querySelector(".rank-gold-pill");
        if (gold && gold.nextSibling) banner.insertBefore(s, gold.nextSibling);
        else banner.appendChild(s);
      }
      var oldT = banner.querySelector(".g-t");
      if (oldT) oldT.style.display = "none";
      var oldK = banner.querySelector(".g-k");
      if (oldK) oldK.style.display = "none";
    })();

    whenCfg(applyHouseGates);
    function tickBusy() {
      applyHouseGates();
      var wait = 600000 - (Date.now() % 600000) + 400;
      setTimeout(tickBusy, wait);
    }
    var wait = 600000 - (Date.now() % 600000) + 400;
    setTimeout(tickBusy, wait);
  });

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var here0 = (location.pathname.split("/").pop() || "").toLowerCase();
    if (here0.indexOf("demo") !== -1) return;
    if (!document.querySelector("link[rel='icon']")) {
      var ico = document.createElement("link");
      ico.rel = "icon";
      ico.type = "image/svg+xml";
      ico.href = "favicon.svg";
      document.head.appendChild(ico);
      var png = document.createElement("link");
      png.rel = "icon";
      png.type = "image/png";
      png.sizes = "32x32";
      png.href = "favicon-32.png";
      document.head.appendChild(png);
      var touch = document.createElement("link");
      touch.rel = "apple-touch-icon";
      touch.href = "favicon-180.png";
      document.head.appendChild(touch);
    }
    var theme = document.querySelector("meta[name='theme-color']");
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.content = "#2a1040";
      document.head.appendChild(theme);
    }
    var nav = document.querySelector("nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "nav";
      nav.innerHTML =
        '<div class="nav-inner">' +
          '<a class="nav-brand" href="index.html">PURPLE</a>' +
          '<div class="nav-links">' +
            '<a href="index.html#lineup">MODELS</a>' +
            '<a href="forum.html">LOUNGE</a>' +
            '<a href="how_to_play.html">How to Play</a>' +
            '<a href="club.html">Board</a>' +
            '<a class="dds-login" href="account.html">Login</a>' +
          '</div>' +
        '</div>';
      document.body.insertBefore(nav, document.body.firstChild);
    }
    if (nav) {
      nav.querySelectorAll('a[href*="selector"]').forEach(function (a) { a.remove(); });
    }
    if (nav && !nav.querySelector(".dds-login")) {
      var links = nav.querySelector(".nav-links") || nav;
      var login = document.createElement("a");
      login.className = "dds-login";
      login.href = "account.html";
      login.textContent = "Login";
      links.appendChild(login);
    }
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var group = {
      "how_to_play.html": "how_to_play.html",
      "selector.html": "how_to_play.html",
      "compare.html": "how_to_play.html",
      "game_features.html": "how_to_play.html",
      "hints.html": "how_to_play.html",
      "forum.html": "forum.html",
      "whats_new_private_edition.html": "how_to_play.html",
      "club.html": "club.html",
      "offer.html": "club.html",
      "rate.html": "club.html",
      "reviews.html": "how_to_play.html", "honor.html": "index.html",
      "desi_desire_leaderboard.html": "club.html",
      "house.html": "house.html",
      "contact_to_play.html": "house.html",
      "donate.html": "house.html",
      "send_gift.html": "house.html",
      "disclaimer.html": "house.html"
    };
    var mark = group[here] || here;
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (href && href === mark) a.setAttribute("aria-current", "page");
    });
    if (nav && !nav.querySelector(".dds-burger")) {
      var inner = nav.querySelector(".nav-inner") || nav.querySelector(".site-nav-inner") || nav;
      var btn = document.createElement("button");
      btn.className = "dds-burger";
      btn.type = "button";
      btn.setAttribute("aria-label", "Menu");
      btn.textContent = "Menu";
      inner.appendChild(btn);
      var drawer = document.createElement("div");
      drawer.className = "dds-drawer";
      drawer.innerHTML =
        '<a href="index.html#lineup">MODELS</a>' +
        
        '<a href="forum.html">LOUNGE</a>' +
        '<a href="how_to_play.html">How to Play</a>' +
        '<a href="how_to_play.html#features">Game features</a>' +
        '<a href="how_to_play.html#play">Selector</a>' +
        '<a href="club.html">Board</a>' +
        '<a class="dds-login" href="account.html">Login</a>';
      nav.appendChild(drawer);
      btn.addEventListener("click", function () {
        drawer.style.display = drawer.style.display === "block" ? "none" : "block";
      });
    }

    (function inboxPing() {
      var page = (location.pathname.split("/").pop() || "").toLowerCase();
      if (page === "account.html" && /[?&](to=|inbox=)/.test(location.search)) return;
      if (page === "account.html" && /inbox/i.test(location.hash || "")) return;
      var acc = null;
      try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
      if (!acc || !acc.id) return;
      var cfg = window.DDS_SUPABASE || {};
      if (!cfg.url) return;
      fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_mail_folder", {
        method: "POST",
        headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
        body: JSON.stringify({ p_id: acc.id, p_folder: "inbox" })
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        var rows = (d && d.threads) || [];
        var seen = {};
        var opened = "";
        try { seen = JSON.parse(localStorage.getItem("dds_mail_read") || "{}"); } catch (e) {}
        try { opened = localStorage.getItem("dds_inbox_opened") || ""; } catch (e) {}
        var n = 0;
        rows.forEach(function (t) {
          if (!t || !(t.unread === true || Number(t.unread) > 0)) return;
          if (seen[String(t.id || "")] || seen[String(t.other_id || "")]) return;
          if (opened && String(t.at || "") <= opened) return;
          n += 1;
        });
        if (!n) return;
        if (document.getElementById("dds-mail-pop")) return;
        var pop = document.createElement("div");
        pop.id = "dds-mail-pop";
        pop.className = "dds-mail-pop";
        pop.innerHTML = "<b>Inbox</b><p>You have " + n + " unread message" + (n === 1 ? "" : "s") + ".</p><a href='account.html?inbox=1'>Open inbox</a><button type='button' class='ghost' id='dds-mail-dismiss'>Later</button>";
        document.body.appendChild(pop);
        var link = pop.querySelector("a");
        if (link) link.onclick = function () {
          var seen = {};
          try { seen = JSON.parse(localStorage.getItem("dds_mail_read") || "{}"); } catch (e) {}
          rows.forEach(function (t) {
            if (!t) return;
            if (t.id) seen[String(t.id)] = 1;
            if (t.other_id) seen[String(t.other_id)] = 1;
          });
          try { localStorage.setItem("dds_mail_read", JSON.stringify(seen)); } catch (e) {}
          fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_mail_mark_read", {
            method: "POST",
            headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
            body: JSON.stringify({ p_id: acc.id })
          }).catch(function () {});
        };
        var btn = document.getElementById("dds-mail-dismiss");
        if (btn) btn.onclick = function () { pop.remove(); };
      }).catch(function () {});
    })();

    (function guestGate() {
      var SLUGS = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
      function account() {
        try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; }
      }
      function signed() {
        var a = account();
        try { if (localStorage.getItem("dds_idle") === "1") return false; } catch (e) {}
        return !!(a && (a.id || a.username) && a.verified);
      }
      function clearBack(a) {
        try { localStorage.removeItem("dds_idle"); } catch (e) {}
        if (a) {
          a.verified = true;
          a.idle_dropped = false;
          a.activate_asked = false;
          try { localStorage.setItem("dds_account", JSON.stringify(a)); } catch (e) {}
        }
        var lure = document.getElementById("dds-lure");
        if (lure) lure.remove();
        document.documentElement.classList.remove("dds-guest", "dds-locked");
        try { document.dispatchEvent(new Event("dds-verified")); } catch (e) {}
      }
      function markBackNote() {
        if (document.getElementById("dds-back-note")) return;
        var n = document.createElement("div");
        n.id = "dds-back-note";
        n.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:80;background:#1a1016;border:1px solid #e7c98a;color:#f6efe8;border-radius:12px;padding:.7rem .9rem;font:14px/1.4 Georgia,serif";
        n.innerHTML = "You are back. If a page still blurs, log out and log in once. <a href='account.html' style='color:#e7c98a'>Account</a>";
        document.body.appendChild(n);
        setTimeout(function () { if (n.parentNode) n.remove(); }, 12000);
      }
      window.DDS_pullVerified = function (done) {
        var a = account();
        if (!a || !a.id) { if (done) done(false); return; }
        if (a.verified && !idleFlag()) { if (done) done(true); return; }
        var cfg = window.DDS_SUPABASE || {};
        var token = sessionToken() || cfg.anon;
        if (!cfg.url || !token) { if (done) done(false); return; }
        fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/profiles?id=eq." + encodeURIComponent(a.id) + "&select=verified,idle_dropped,activate_asked&limit=1", {
          headers: { apikey: cfg.anon, Authorization: "Bearer " + token }
        }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
          var row = rows && rows[0];
          if (row && row.verified && !row.idle_dropped) {
            clearBack(a);
            markBackNote();
            if (done) done(true);
            return;
          }
          if (done) done(false);
        }).catch(function () { if (done) done(false); });
      };
      function sessionToken() {
        try {
          var keys = Object.keys(localStorage);
          for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf("auth-token") === -1) continue;
            var raw = JSON.parse(localStorage.getItem(keys[i]) || "null");
            if (raw && raw.access_token) return raw.access_token;
            if (raw && raw.currentSession && raw.currentSession.access_token) return raw.currentSession.access_token;
          }
        } catch (e) {}
        return "";
      }
      function askDesk(btn) {
        var card = btn.closest(".dds-lure-card") || btn.parentNode;
        var note = card.querySelector(".ask-note");
        if (!note) {
          note = document.createElement("p");
          note.className = "ask-note";
          card.appendChild(note);
        }
        var cfg = window.DDS_SUPABASE || {};
        var token = sessionToken();
        if (!token || !cfg.url || !cfg.anon) {
          note.textContent = "Log in, then tap Re-verify. The desk keeps your rank.";
          location.href = "account.html#reverify";
          return;
        }
        btn.disabled = true;
        note.textContent = "Sending the request…";
        fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/ask_activate", {
          method: "POST",
          headers: { apikey: cfg.anon, Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: "{}"
        }).then(function (r) { return r.json(); }).then(function (data) {
          btn.disabled = false;
          if (data && data.ok) note.textContent = "Request sent. Your rank stays. The desk turns you back on. Refresh after that.";
          else note.textContent = (data && (data.error || data.message)) || "Could not send. Open your account page and tap Re-verify.";
        }).catch(function () {
          btn.disabled = false;
          note.textContent = "Could not send. Open your account page and tap Re-verify.";
        });
      }
      if (!window._ddsAskClick) {
        window._ddsAskClick = 1;
        document.addEventListener("click", function (e) {
          var btn = e.target.closest && e.target.closest("[data-ask='1']");
          if (!btn) return;
          e.preventDefault();
          e.stopPropagation();
          askDesk(btn);
        }, true);
      }
      function stampDemoHref(href, ok) {
        href = String(href || "");
        if (href.indexOf("desi_desire_chat_demo") === -1 && href.indexOf("desireclubchat.netlify.app") === -1) return href;
        href = href.replace(/[?&]v=1\b/g, "").replace(/[?&]verified=1\b/g, "");
        href = href.replace(/[?&]$/, "");
        if (ok) href += (href.indexOf("?") >= 0 ? "&" : "?") + "v=1";
        return href;
      }
      function stampDemoLinks() {
        var ok = signed();
        document.querySelectorAll('a[href*="desi_desire_chat_demo"], a[href*="desireclubchat.netlify.app"]').forEach(function (a) {
          a.setAttribute("href", stampDemoHref(a.getAttribute("href") || "", ok));
        });
      }
      stampDemoLinks();
      document.addEventListener("DOMContentLoaded", stampDemoLinks);
      document.addEventListener("dds-cfg", stampDemoLinks);
      setTimeout(stampDemoLinks, 200);
      setTimeout(stampDemoLinks, 1200);
      document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        var href = a.getAttribute("href") || "";
        if (href.indexOf("desi_desire_chat_demo") === -1 && href.indexOf("desireclubchat.netlify.app") === -1) return;
        var next = stampDemoHref(href, signed());
        if (next !== href) a.setAttribute("href", next);
      }, true);
      function demoVerified() {
        try {
          var q = new URLSearchParams(location.search || "");
          if (q.get("v") === "1" || q.get("verified") === "1") return true;
          if (sessionStorage.getItem("demo_verified") === "1") return true;
        } catch (e) {}
        return false;
      }
      function openForGuests(slug) {
        var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
        var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
        var q = new URLSearchParams(location.search || "");
        var fromQ = (q.get("slut") || "").toLowerCase();
        var check = (slug || page || fromQ || "").toLowerCase();
        if (check && access[check] === "guests") return true;
        if (page && access[page] === "guests") return true;
        if (fromQ && access[fromQ] === "guests") return true;
        return false;
      }
      function clearGuestLure() {
        var lure = document.getElementById("dds-lure");
        if (lure) lure.remove();
        document.documentElement.classList.remove("dds-guest", "dds-locked");
        teaseBlur(false);
      }
      document.addEventListener("dds-cfg", function () {
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 100);
        if (window.DDS_paintAccess) window.DDS_paintAccess();

        if (openForGuests()) clearGuestLure();
      });
      if (window.DDS_CFG_READY && window.DDS_CFG_READY.then) {
        window.DDS_CFG_READY.then(function () {
          if (openForGuests()) clearGuestLure();
        });
      }
function soonBlur() {
        var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
        if (!page || page === "index") return false;
        var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
        var opens = (window.DDS_CFG && window.DDS_CFG.waveOpens) || {};
        var override = (window.DDS_CFG && window.DDS_CFG.soonOverride) || {};
        var level = access[page];
        // Image blur only when Image soon is selected
        if (level !== "imagesoon") return false;
        if (opens[page] && cdtYmd() >= opens[page]) return false;
        if (override[page]) {
          var st = String(playerStatus() || "").toLowerCase();
          if (override[page] === "bronze" && /bronze|silver|gold|elite|platinum/.test(st)) return false;
          if (override[page] === "silver" && /silver|gold|elite|platinum/.test(st)) return false;
          if (override[page] === "gold" && /gold|elite|platinum/.test(st)) return false;
          if (override[page] === "elite" && /elite|platinum/.test(st)) return false;
          if (override[page] === "owners" && playerOwns(page)) return false;
        }
        if (window.DDS_canAccess && window.DDS_canAccess(page)) return false;
        return true;
      }
      function unblurIfCanAccess() {
  var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
  if (!page || page === "index") return;
  if (!window.DDS_canAccess || !window.DDS_canAccess(page)) return;
  document.querySelectorAll(".portrait, .portrait img, .soon-portrait").forEach(function (el) {
    el.classList.add("dds-unblur");
    el.classList.remove("undated-soon");
    if (el.style) el.style.filter = "none";
  });
  document.querySelectorAll(".portrait img, .soon-portrait img").forEach(function (img) {
    img.style.filter = "none";
    img.style.transform = "none";
  });
}
function shouldBlur() {
        var file = (location.pathname.split("/").pop() || "").toLowerCase();
        if (file.indexOf("demo") !== -1) return false;
        if (location.hostname.indexOf("desireclubchat") !== -1) return !demoVerified();
        if (demoVerified()) return false;
        if (openForGuests()) return false;
        if (unblurIfCanAccess) unblurIfCanAccess();
        if (soonBlur()) return true;
        var c = window.DDS_CFG || {};
        if (c.blurAll) return true;
        if (c.blurUnverified === false) return false;
        return !signed();
      }
      function signupPop(title, body) {
        var wrap = document.getElementById("dds-lure");
        if (!wrap) {
          wrap = document.createElement("div");
          wrap.id = "dds-lure";
          document.body.appendChild(wrap);
        }
        wrap.innerHTML =
          "<div class='dds-lure-card'>" +
            "<p class='k'>PURPLE</p>" +
            "<h2>" + title + "</h2>" +
            "<p>" + body + "</p>" +
            (hasAccount() ? "" : "<p style='margin:.4rem 0 .6rem;padding:.45rem .6rem;background:#1a1028;border:1px solid #6b3fa0;border-radius:8px;font-size:.82rem;color:#e9d5ff'><b>Sign up today. Get 100 DPS free.</b><br>Invest on models. Returns up to 400 DPS.</p>") +
            "<p class='lure-actions'>" + (hasAccount()
              ? "<button type='button' class='go' data-ask='1'>Re-verify</button>"
              : "<a class='go' href='account.html#create'>Sign up</a><a class='ghost' href='account.html'>Login</a>") + "</p>" +
            (hasAccount() ? "" : "<a class='ghost' href='account.html'>Login</a>") + "</p>" +
            "<p><a class='home' href='index.html'>Home</a></p>" +
          "</div>";
      }
      function isBoardHref(href) {
        var h = String(href || "").toLowerCase().split("?")[0].split("#")[0];
        var path = h.replace(/^https?:\/\/[^/]+/, "");
        var leaf = path.split("/").pop();
        return leaf === "club" || leaf === "club.html";
      }
      function lockBoardNav() {
        document.querySelectorAll("a[href]").forEach(function (a) {
          if (isBoardHref(a.getAttribute("href"))) a.setAttribute("data-board-gate", "1");
        });
      }
      function teaseBlur(on) {
        if (on) document.documentElement.classList.add("dds-guest");
        else document.documentElement.classList.remove("dds-guest");
        document.querySelectorAll(".portrait img,.poster-card img,.pick img,img.thumb,.col-head img,#thumb,#gal img,img.dds-tease").forEach(function (img) {
          if (on) img.style.setProperty("filter", "blur(14px)", "important");
          else img.style.removeProperty("filter");
        });
        if (document.getElementById("dds-guest-blur-css")) return;
        var s = document.createElement("style");
        s.id = "dds-guest-blur-css";
        s.textContent =
          "html.dds-guest .poster-card img," +
          "html.dds-guest .portrait img," +
          "html.dds-guest article.profile-hero .portrait img," +
          "html.dds-guest .pick img," +
          "html.dds-guest img.thumb," +
          "html.dds-guest .col-head img," +
          "html.dds-guest #thumb," +
          "html.dds-guest #gal img," +
          "html.dds-guest .gal img," +
          "html.dds-guest img.dds-tease{" +
            "filter:blur(14px) saturate(1.15) brightness(1.05) !important;" +
            "transform:scale(1.12);" +
            "transform-origin:center center;" +
          "}" +
          "html.dds-guest .poster-card," +
          "html.dds-guest .portrait," +
          "html.dds-guest .pick," +
          "html.dds-guest .col-head," +
          "html.dds-guest #gal," +
          "html.dds-guest .gal{overflow:hidden;}";
        document.head.appendChild(s);
      }
      function hasAccount() {
        var a = account();
        return !!(a && (a.id || a.username));
      }
      function fileName() {
        return (location.pathname.split("/").pop() || "index.html").toLowerCase();
      }
      function slugFromHref(href) {
        var h = String(href || "");
        var q = (h.split("slut=")[1] || "").split("&")[0].toLowerCase();
        if (q === "anu" || SLUGS.indexOf(q) !== -1) return q;
        var base = h.split("?")[0].split("/").pop().replace(".html", "").toLowerCase();
        if (SLUGS.indexOf(base) !== -1) return base;
        return "";
      }
      function profileUrl(slug) {
        return slug ? slug + ".html" : "index.html#lineup";
      }
      function idleFlag() {
        try { return localStorage.getItem("dds_idle") === "1"; } catch (e) { return false; }
      }
      function lure(name) {
        window.DDS_lure = lure;
        if (document.getElementById("dds-lure")) return;
        document.documentElement.classList.add("dds-guest", "dds-locked");
        var held = hasAccount();
        var idle = held && idleFlag();
        var wrap = document.createElement("div");
        wrap.id = "dds-lure";
        wrap.innerHTML =
          "<div class='dds-lure-card'>" +
            "<p class='k'>PURPLE</p>" +
            "<h2>" + (held ? (idle ? "Re-verify to see her" : "Re-verify to see her") : "Sign up to see her") + "</h2>" +
            "<p>" + (held ? (idle ? "Five days with no login, inbox, or model night. Her page stays blurred until you re-verify. Inbox and house letters still work. Your rank stays." : "This account is not verified. Her page stays blurred until you re-verify.") : "Create an account. Thirty seconds. Then Activate. Available, Busy, and Closed open after that.") + "</p>" +
            (held ? "" : "<p style='margin:.4rem 0 .6rem;padding:.45rem .6rem;background:#1a1028;border:1px solid #6b3fa0;border-radius:8px;font-size:.82rem;color:#e9d5ff'><b>Sign up today. Get 100 DPS free.</b><br>Invest on models. Returns up to 400 DPS.</p>") +
            "<p class='lure-actions'>" + (held
              ? "<button type='button' class='go' data-ask='1'>Re-verify</button>"
              : "<a class='go' href='account.html#create'>Sign up</a><a class='ghost' href='account.html'>Login</a>") + "</p>" +
            "<p><a class='home' href='index.html'>Home</a></p>" +
          "</div>";
        document.body.appendChild(wrap);
      }
      var file = fileName();
      (function showDpsAd() {
        var ad = document.querySelector(".dps-ad-banner");
        if (!ad) return;
        if (hasAccount()) { ad.style.display = "none"; return; }
        ad.style.display = "block";
      })();
      if (/^(account|admin|desirescoutadmin)(\.html)?$/i.test(file)) {
        if (window.DDS_paintAccount) window.DDS_paintAccount();
        return;
      }
      var page0 = file.replace(".html", "");
      if (SLUGS.indexOf(page0) !== -1) {
        var ready0 = window.DDS_CFG_READY && window.DDS_CFG_READY.then ? window.DDS_CFG_READY : Promise.resolve();
        ready0.then(function () {
          if (openForGuests()) { clearGuestLure(); return; }
          teaseBlur(shouldBlur());
        });
      } else {
        teaseBlur(shouldBlur());
      }
      lockBoardNav();
      if (!window._ddsBlurWatch) {
        window._ddsBlurWatch = 1;
        if (window.MutationObserver) {
          new MutationObserver(function () { teaseBlur(shouldBlur()); }).observe(document.body, { childList: true, subtree: true });
        }
        document.addEventListener("dds-cfg", function () {
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 100); teaseBlur(shouldBlur()); });
        document.addEventListener("click", function (e) {
          var a = e.target.closest && e.target.closest("a[href]");
          if (!a) return;
          if (!isBoardHref(a.getAttribute("href") || "")) return;
          if (signed()) return;
          e.preventDefault();
          e.stopPropagation();
          signupPop(
            hasAccount() ? "Board is for verified members" : "Board is for members",
            hasAccount() ? "Activate this account, then the Desire race opens." : "Sign up. Thirty seconds. Then Activate and the board opens."
          );
        }, true);
        var f0 = fileName();
        if (/^(club|honor|desi_desire_leaderboard)(\.html)?$/i.test(f0) && !signed()) {
          signupPop(
            hasAccount() ? "Board is for verified members" : "Board is for members",
            hasAccount() ? "Activate this account, then the Desire race opens." : "Sign up. Thirty seconds. Then Activate and the board opens."
          );
        }
      }
      function anuTrainHref(door) {
        return "contact_to_play.html?slut=anu" + (door ? "&door=" + encodeURIComponent(door) : "");
      }
      function lockAnu() {
        document.querySelectorAll("a[data-anu-request='1'], a[href*='contact_to_play.html?slut=anu']").forEach(function (a) {
          if (signed()) {
            var door = "";
            try { door = new URL(a.href, location.href).searchParams.get("door") || ""; } catch (e) {}
            a.setAttribute("href", anuTrainHref(door));
            a.removeAttribute("data-anu-locked");
            return;
          }
          a.setAttribute("href", "account.html");
          a.setAttribute("data-anu-locked", "1");
        });
      }
      function rewritePlayLinks() {
        document.querySelectorAll("a[href*='contact_to_play'], a.request-flash, a.dds-play-mid").forEach(function (a) {
          if (a.classList.contains("anu-train") || (a.getAttribute("href") || "").indexOf("slut=anu") !== -1) return;
          var slug = slugFromHref(a.getAttribute("href") || "") || slugFromHref(location.href);
          var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
          if (!slug && SLUGS.indexOf(page) !== -1) slug = page;
          var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
          var isGuest = access[slug] === "guests" || access[page] === "guests";
          a.setAttribute("href", (signed() || isGuest) ? ("contact_to_play.html" + (slug ? "?slut=" + slug : "")) : "#reverify");
          a.setAttribute("data-play-rewritten", "1");
        });
        if (window.DDS_UNAVAILABLE) markBusyDoors(window.DDS_UNAVAILABLE);
      }
      rewritePlayLinks();
      lockAnu();
      document.addEventListener("dds-cfg", function () {
  setTimeout(function () { if (window.DDS_paintAccess) window.DDS_paintAccess(); }, 100);
        rewritePlayLinks();
      });
      if (window.DDS_CFG_READY && window.DDS_CFG_READY.then) {
        window.DDS_CFG_READY.then(function () { rewritePlayLinks(); });
      }
      document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[href], a.poster-card");
        if (!a) return;
        var href = a.getAttribute("href") || "";
        var card = a.classList.contains("poster-card") || SLUGS.indexOf(slugFromHref(href)) !== -1;
        var anu = a.getAttribute("data-anu-request") === "1" || href.indexOf("slut=anu") !== -1 || a.getAttribute("data-anu-locked") === "1";
        var trainerSlug = (a.getAttribute("data-slut") || "").toLowerCase();
        var isTrainerCard = a.classList.contains("trainer-card") || trainerSlug === "anu" || trainerSlug === "meenakshi" || href === "anu.html" || href === "meenakshi.html";
        var play = anu || isTrainerCard || href.indexOf("contact_to_play") !== -1 || a.classList.contains("request-flash") || a.classList.contains("dds-play-mid");
        if (!play && !card) return;
        if ((anu || isTrainerCard) && !signed()) {
          e.preventDefault();
          e.stopPropagation();
          lure(trainerSlug === "meenakshi" ? "Meenakshi" : "Anu");
          return;
        }
        if (card && !play && /index\.html$|^\/$|index\.html#/i.test(location.pathname) === false && SLUGS.indexOf(file.replace(".html", "")) === -1 && !a.classList.contains("poster-card")) return;
        if (signed()) return;
        var slug = slugFromHref(href) || slugFromHref(location.href);
        var page = file.replace(".html", "");
        if (!slug && SLUGS.indexOf(page) !== -1) slug = page;
        var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
        var isGuestDoor = access[slug] === "guests" || access[page] === "guests" || openForGuests(slug) || openForGuests(page);
        /* guests see the profile first; play from the profile page */
        if (card && !play) return;
        if (isGuestDoor && (play || a.classList.contains("dds-play-mid") || href.indexOf("contact_to_play") !== -1 || href === "#reverify")) {
          e.preventDefault();
          e.stopPropagation();
          clearGuestLure();
          var dest = "contact_to_play.html?slut=" + encodeURIComponent(slug || page);
          location.href = dest;
          return;
        }
        // Fallback: if the href is already a play link and we are on a profile, just go
        if (play && href.indexOf("contact_to_play") !== -1 && !signed()) {
          e.preventDefault();
          e.stopPropagation();
          location.href = href;
          return;
        }
        // Wait for config if not ready
        if (!window.DDS_CFG && window.DDS_loadCfg) {
          e.preventDefault();
          e.stopPropagation();
          window.DDS_loadCfg().then(function () {
            var access2 = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
            if (access2[slug] === "guests" || access2[page] === "guests") {
              location.href = "contact_to_play.html?slut=" + encodeURIComponent(slug || page);
            }
          });
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        var ready = window.DDS_CFG_READY && window.DDS_CFG_READY.then ? window.DDS_CFG_READY : Promise.resolve();
        ready.then(function () {
          if (openForGuests(slug) || openForGuests(page)) {
            clearGuestLure();
            location.href = "contact_to_play.html" + (slug ? "?slut=" + slug : (page ? "?slut=" + page : ""));
            return;
          }
          if (hasAccount() && window.DDS_pullVerified) {
            window.DDS_pullVerified(function (ok) {
              if (ok && !idleFlag()) {
                rewritePlayLinks();
                var dest = play ? ("contact_to_play.html" + (slug ? "?slut=" + slug : "")) : (href || profileUrl(slug));
                if (play) { window.open(dest, "_blank", "noopener"); }
                else { location.href = dest; }
                return;
              }
              afterUnverified(a, href);
            });
            return;
          }
          afterUnverified(a, href);
        });
      }, true);
      function afterUnverified(a, href) {
        if (signed()) return;
        var slug = slugFromHref(href) || slugFromHref(location.href);
        var page = file.replace(".html", "");
        if (!slug && SLUGS.indexOf(page) !== -1) slug = page;
        if (openForGuests(slug)) {
          clearGuestLure();
          if (href.indexOf("contact_to_play") !== -1 || (a && (a.classList.contains("dds-play-mid") || a.classList.contains("request-flash")))) {
            location.href = "contact_to_play.html" + (slug ? "?slut=" + slug : "");
          }
          return;
        }
        lure(slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Her");
      }
      function lockIfUnverified() {
        if (openForGuests()) {
          clearGuestLure();
          rewritePlayLinks();
          return;
        }
        teaseBlur(shouldBlur());
        rewritePlayLinks();
        if (signed()) return;
        var page = fileName().replace(".html", "");
        if (fileName().indexOf("contact_to_play") !== -1 || SLUGS.indexOf(page) !== -1) {
          // Wait for config before showing the signup card on a model page
          var ready = window.DDS_CFG_READY && window.DDS_CFG_READY.then ? window.DDS_CFG_READY : Promise.resolve();
          ready.then(function () {
            if (openForGuests()) { clearGuestLure(); return; }
            if (signed()) return;
            lure(SLUGS.indexOf(page) !== -1 ? page.charAt(0).toUpperCase() + page.slice(1) : "");
          });
        }
      }
      if (window.DDS_pullVerified) window.DDS_pullVerified(function () { lockIfUnverified(); });
      else lockIfUnverified();
      document.addEventListener("dds-verified", lockIfUnverified);
      if (window.DDS_paintAccount) window.DDS_paintAccount();
      
      // Force guest play navigation
      document.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest("a.dds-play-mid, a.request-flash, a[href*='contact_to_play'], .dds-play-mid, button.dds-play-mid");
        if (!btn) return;
        if (signed()) return;
        var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
        if (!page || page === "index") return;
        var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
        // Always try for potential guest doors; the request page will handle it
        if (access[page] === "guests" || openForGuests(page) || !window.DDS_CFG) {
          e.preventDefault();
          e.stopImmediatePropagation();
          location.href = "contact_to_play.html?slut=" + encodeURIComponent(page);
        }
      }, true);
setInterval(function () {
        var page = fileName().replace(".html", "");
        function paint() {
          teaseBlur(shouldBlur());
          lockBoardNav();
          if (openForGuests()) clearGuestLure();
          else if (!signed() && SLUGS.indexOf(page) !== -1) lure(page.charAt(0).toUpperCase() + page.slice(1));
          rewritePlayLinks();
          lockAnu();
        }
        if (!signed() && window.DDS_pullVerified) window.DDS_pullVerified(function () { paint(); });
        else paint();
      }, (window.DDS_pollMs ? window.DDS_pollMs("verify", 20) : 20000));
    })();

    document.querySelectorAll("[data-offer-state]").forEach(function (el) {
      el.textContent = window.DDS_OFFER_LIVE ? "LIVE" : "EXPIRED";
      el.style.color = window.DDS_OFFER_LIVE ? "#7dffb0" : "#c07070";
    });

    whenCfg(applyHouseGates);

        var pageSlug = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    var NINEP = ["anu","preethi","diya","meghana","kiara","sravani","meenakshi","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
    if (NINEP.indexOf(pageSlug) !== -1) try {
      if (!document.querySelector(".heart-btn")) document.querySelectorAll(".play-cta").forEach(function (el) { el.remove(); });
      var oldBar = document.querySelector(".dds-request-banner");
      if (oldBar) oldBar.remove();
      if (document.querySelector(".heart-btn")) throw "page owns buttons";
      var bar = document.createElement("div");
      bar.className = "dds-request-banner";
      bar.innerHTML =
        '<a class="dds-hearts" href="#hearts" data-slut="' + pageSlug + '"><span class="heart-wrap"><svg class="heart-gloss" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="hg" x1="18" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3e8ff"/><stop offset=".28" stop-color="#e9d5ff"/><stop offset=".55" stop-color="#c084fc"/><stop offset="1" stop-color="#6b21a8"/></linearGradient></defs><path fill="url(#hg)" d="M32 58s-22-13.6-22-28.2C10 20 16.4 14 24 14c4.4 0 6.9 2.2 8 5.2C33.1 16.2 35.6 14 40 14c7.6 0 14 6 14 15.8C54 44.4 32 58 32 58z"/><path fill="#fff" opacity=".55" d="M22 22c-3.2 3-4.2 7.4-2.6 11.2.4.9-.6 1.7-1.4 1.1C15.2 31.4 14 26.6 17.2 22.4 19.4 19.4 23 18 26.2 18.6c.9.2 1.1 1.4.3 1.8-1.5.8-3.2 1.4-4.5 1.6z"/></svg></span><span class="heart-cap">CLICK to send her hearts</span></a>' +
        (["anu","meenakshi"].indexOf(pageSlug) !== -1 ? "" : '<a class="dds-play-mid" href="contact_to_play.html?slut=' + pageSlug + '">Click Here To Play</a>') +
        ownHerLink(pageSlug) +
        (["anu","meenakshi"].indexOf(pageSlug) !== -1 ? "" : '<a href="#' + (document.getElementById("hints") ? "hints" : "about") + '">Hints</a>');
      var after = document.querySelector("nav");
      document.body.classList.add("has-request-banner");
      if (after && after.parentNode) after.parentNode.insertBefore(bar, after.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
      bar.addEventListener("click", function (ev) {
        var h = ev.target.closest && ev.target.closest("a.dds-hearts");
        if (h) {
          ev.preventDefault();
          openHeartModal(pageSlug);
          return;
        }
        var play = ev.target.closest && ev.target.closest("a.dds-play-mid");
        if (play && (pageSlug === "anu" || pageSlug === "meenakshi")) {
          ev.preventDefault();
          if (window.DDS_anuTrain) window.DDS_anuTrain();
          else {
            var btn = document.getElementById("trainBtn");
            if (btn) btn.click();
          }
          return;
        }
        if (play) {
          var access = (window.DDS_CFG && window.DDS_CFG.doorAccess) || {};
          if (access[pageSlug] === "guests") {
            ev.preventDefault();
            ev.stopPropagation();
            location.href = "contact_to_play.html?slut=" + pageSlug;
          }
        }
      });
      if (window.DDS_CLOSED) markClosedDoors(window.DDS_CLOSED);
      if (window.DDS_UNAVAILABLE) markBusyDoors(window.DDS_UNAVAILABLE);
      stampProfileHold(pageSlug);
      hideOwnHerLinks();
      if (window.DDS_CFG_READY && window.DDS_CFG_READY.then) window.DDS_CFG_READY.then(function () { blurSoonProfile(pageSlug); });
      else blurSoonProfile(pageSlug);
      whenCfg(applyHouseGates);
    } catch (e) {}


    if (location.pathname.indexOf("session") !== -1) {
      document.querySelectorAll(".slut-offer-list, .offer-hook, .dds-ratebar").forEach(function (el) { el.remove(); });
    }

    var known = window.DDS_THUMBS || {};
    if (known[pageSlug] && (window.DDS_UNAVAILABLE||[]).indexOf(pageSlug)===-1 && !document.querySelector(".dds-ratebar")) {
      var rate = document.createElement("div");
      rate.className = "dds-ratebar dds-ratebar-bottom";
      rate.innerHTML =
        "<p>If you had a session with her, submit a review. Better reviews win real perks — IP off, lingerie by wish, one piece, or a talk-style shift.</p>" +
        '<div><a href="' + (pageSlug === "anu" || pageSlug === "meenakshi" ? "#train" : "contact_to_play.html?slut=" + pageSlug) + '">' + (pageSlug === "anu" || pageSlug === "meenakshi" ? "Get trained" : "Click Here To Play") + '</a> · <a href="rate.html?slut=' + pageSlug + '">Submit review</a> · <a href="feedback.html?slut=' + pageSlug + '">Send feedback</a>' + ((ownHerOpen(pageSlug) || playerOwns(pageSlug)) ? ' · <a href="#" data-own-dps="' + pageSlug + '">' + (playerOwns(pageSlug) ? "Own Perks" : "Own her") + '</a>' : '') + '</div>';
      var rateHost = document.querySelector("main") || document.body;
      rateHost.appendChild(rate);
    }

    var pageOffers = [];
    if (pageOffers.length) {
      var hook = document.createElement("div");
      hook.className = "offer-hook show";
      hook.setAttribute("data-offer-slug", pageSlug);
      hook.innerHTML = pageOffers.map(function (o) {
        return '<div class="oh-k">Tonight — live offer</div>' +
          '<div><span class="oh-code">' + o.code + '</span> · ' + o.perks +
          ' · <a href="contact_to_play.html?slut=' + encodeURIComponent(o.slug) +
          '&code=' + encodeURIComponent(o.code) + '">CLAIM</a></div>';
      }).join("<hr style=\"border:0;border-top:1px solid #5a3f28;margin:.55rem 0;\">");
      var host = document.querySelector("main") || document.body;
      host.insertBefore(hook, host.firstChild);
      document.querySelectorAll(".offer-chip").forEach(function (el) {
        el.classList.add("flash");
      });
    }

    
    document.querySelectorAll("article.card[data-offer-slug]").forEach(function (card) {
      var slug = card.getAttribute("data-offer-slug");
      var src = window.DDS_THUMBS && window.DDS_THUMBS[slug];
      if (!src || card.querySelector(".offer-thumb")) return;
      var img = document.createElement("img");
      img.className = "offer-thumb";
      img.src = src;
      img.alt = slug;
      card.insertBefore(img, card.firstChild);
    });

    
    var liveCodes = OFFERS.filter(live).map(function (o) { return o.code; });
    document.querySelectorAll(".offer-chip, .offer-hook, article.card[data-offer-slug]").forEach(function (el) {
      var tx = el.textContent || "";
      var mentioned = tx.match(/[A-Z0-9]+(?:-[A-Z0-9]+)+/g) || [];
      var codes = mentioned.filter(function (c) { return /ONCE$|\d{2}SEP$/.test(c); });
      if (!codes.length) return;
      var anyLive = codes.some(function (c) { return liveCodes.indexOf(c) !== -1; });
      if (!anyLive) el.style.display = "none";
    });

    document.querySelectorAll(".offer-badge, .offer-chip, article.card[data-offer-slug]").forEach(function (el) {
      var slug = el.getAttribute("data-offer-slug");
      if (!slug) {
        var parent = el.closest("[data-offer-slug]");
        slug = parent ? parent.getAttribute("data-offer-slug") : "";
      }
      var hit = OFFERS.filter(function (o) { return o.slug === slug && live(o); })[0];
      if (slug && !hit) el.style.display = "none";
    });
  });

  ready(function bindImageWait() {
    function mark(img) {
      if (!img || img.getAttribute("data-dds-wait") === "1") return;
      if (img.closest("nav, .dds-drawer, .nav-links, main")) {
        if (location.pathname.indexOf("admin_art") !== -1) return;
      }
      if (img.closest("nav, .dds-drawer, .nav-links, #last-rooms, .recap-card, .recap-list")) return;
      if (img.classList && img.classList.contains("recap-still")) return;
      if (!img.getAttribute("src")) return;
      if (img.id === "prev") return;
      img.setAttribute("data-dds-wait", "1");
      var parent = img.parentElement;
      if (!parent) return;
      if (img.complete && img.naturalWidth > 0) {
        parent.classList.add("is-ready");
        return;
      }
      var cs = window.getComputedStyle(parent);
      if (cs.position === "static") parent.style.position = "relative";
      parent.classList.add("dds-img-slot");
      if (!parent.querySelector(":scope > .dds-loading")) {
        var tip = document.createElement("span");
        tip.className = "dds-loading";
        tip.innerHTML = "<i></i> Image loading";
        parent.insertBefore(tip, parent.firstChild);
      }
      img.classList.add("dds-wait");
      function ok() {
        img.classList.add("is-in");
        parent.classList.add("is-ready");
        parent.classList.remove("is-fail");
      }
      function fail() {
        img.classList.add("is-in");
        parent.classList.add("is-fail");
        var tip = parent.querySelector(":scope > .dds-loading");
        if (tip) tip.lastChild && (tip.innerHTML = "Image failed — refresh");
      }
      if (img.complete) {
        if (img.naturalWidth > 0) ok();
        else fail();
      } else {
        img.addEventListener("load", ok, { once: true });
        img.addEventListener("error", fail, { once: true });
        setTimeout(function () {
          if (!parent.classList.contains("is-ready")) ok();
        }, 8000);
      }
    }
    document.querySelectorAll("img").forEach(mark);
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === "IMG") mark(n);
          else if (n.querySelectorAll) n.querySelectorAll("img").forEach(mark);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  });

  var NAMES = {preethi:"Preethi Iyer",diya:"Diya Raj",meghana:"Meghana Gowda",kiara:"Kiara Sharma",sravani:"Sravani Reddy",meenakshi:"Meenakshi Pillai",ayesha:"Ayesha Khan",esther:"Esther Mathew",natasha:"Natasha Malhotra",tharini:"Tharini Rao",kavya:"Kavya Iyengar",lahari:"Lahari Naidu",navya:"Navya Menon",simran:"Simran Kaur",chandana:"Chandana Reddy",aleena:"Aleena George"};
  function currentOffers() {
    return ((window.DDS_CFG && window.DDS_CFG.liveOffers) || []).filter(function (o) {
      return o && o.slug && o.code;
    });
  }
  function nice(slug) { return NAMES[slug] || slug; }
  function newsItem(text, href) { return { text: text, href: href || "whats_new_private_edition.html" }; }
  function metricSteps(n) {
    n = Math.floor(Number(n) || 0);
    var out = [];
    for (var m = 50; m <= n; m += 25) out.push(m);
    return out;
  }
  function milestoneLines(rows) {
    var DAY = 24 * 60 * 60 * 1000;
    var prev = {};
    var hits = {};
    try { prev = JSON.parse(localStorage.getItem("dds_metric_prev") || "{}") || {}; } catch (e) { prev = {}; }
    try { hits = JSON.parse(localStorage.getItem("dds_metric_hits") || "{}") || {}; } catch (e) { hits = {}; }
    var now = Date.now();
    var seeded = Object.keys(prev).length > 0;
    var METRICS = [
      ["sessions", "Sessions"],
      ["poll_votes", "Poll votes"],
      ["reviews", "Reviews"],
      ["desire_score", "Desire score"]
    ];
    (rows || []).forEach(function (r) {
      if (!r || !r.slut) return;
      var slug = String(r.slut).toLowerCase();
      var p = prev[slug] || {};
      METRICS.forEach(function (pair) {
        var key = pair[0];
        var cur = Number(r[key] != null ? r[key] : r[key === "reviews" ? "review_count" : key] || 0);
        var old = seeded ? Number(p[key] || 0) : cur;
        metricSteps(cur).forEach(function (mark) {
          if (old < mark && cur >= mark) {
            var id = slug + ":" + key + ":" + mark;
            if (!hits[id]) hits[id] = now;
          }
        });
        p[key] = cur;
      });
      prev[slug] = p;
    });
    var labels = { sessions: "Sessions", poll_votes: "Poll votes", reviews: "Reviews", desire_score: "Desire score" };
    var live = [];
    Object.keys(hits).forEach(function (id) {
      if (now - Number(hits[id] || 0) > DAY) {
        delete hits[id];
        return;
      }
      var parts = id.split(":");
      live.push(newsItem(
        "MILESTONE · " + nice(parts[0]) + " hit " + (labels[parts[1]] || parts[1]) + " " + parts[2],
        parts[0] + ".html"
      ));
    });
    try { localStorage.setItem("dds_metric_prev", JSON.stringify(prev)); } catch (e) {}
    try { localStorage.setItem("dds_metric_hits", JSON.stringify(hits)); } catch (e) {}
    return live;
  }
  function flashLines(rows) {
    var se = Number((window.DDS_CFG && window.DDS_CFG.slabs && window.DDS_CFG.slabs.superElite) || 1500);
    var lines = milestoneLines(rows).concat([
      newsItem("NEWS · Affinity unlocks clothes. Strikes cut the climb.", "how_to_play.html")
    ]);
    var prev = {};
    try { prev = JSON.parse(localStorage.getItem("dds_board_prev") || "{}") || {}; } catch (e) { prev = {}; }
    if (rows[0]) {
      lines.push(newsItem(nice(rows[0].slut) + " sits at Rank 1 · " + (rows[0].tier || "") + ".", rows[0].slut + ".html"));
    }
    rows.forEach(function (r, i) {
      if (/Desire Queen|Desire Crown|Desire Elite|Sovereign|Crown|Super Elite/.test(String(r.tier))) {
        lines.push(newsItem(nice(r.slut) + " is " + r.tier + ".", r.slut + ".html"));
      }
      var was = prev[r.slut] || null;
      if (was && Number(was.rank) !== 1 && i === 0) lines.push(newsItem(nice(r.slut) + " just took Rank 1.", r.slut + ".html"));
      if (was && Number(was.score) < se && Number(r.desire_score || 0) >= se)
        lines.push(newsItem(nice(r.slut) + " is NOW Desire Elite.", r.slut + ".html"));
      if (was && was.tier && r.tier && was.tier !== r.tier)
        lines.push(newsItem(nice(r.slut) + " is now " + r.tier + ".", r.slut + ".html"));
    });
    var snap = {};
    rows.forEach(function (r, i) {
      snap[r.slut] = { rank: i + 1, tier: r.tier, score: Number(r.desire_score || 0) };
    });
    try { localStorage.setItem("dds_board_prev", JSON.stringify(snap)); } catch (e) {}
    return lines;
  }
  var flashHold = [];
  var flashIdx = 0;
  var flashTimer = null;
  var flashBound = false;
  var flashDrag = { on: false, x: 0, start: 0, moved: 0 };
  function isHomePage() {
    var p = (location.pathname.split("/").pop() || "").replace(/\/$/, "").toLowerCase();
    return !p || p === "index.html" || p === "index";
  }
  function injectFlashCss() {
    if (document.getElementById("dds-flash-css")) return;
    var s = document.createElement("style");
    s.id = "dds-flash-css";
    s.textContent =
      ".house-flash{display:flex;align-items:stretch;background:linear-gradient(90deg,#3a0a12 0%,#6b1220 18%,#9b6bdb 50%,#6b1220 82%,#3a0a12 100%);background-size:220% 100%;animation:hfBg 2.2s linear infinite;border-bottom:2px solid #ffe9a8;box-shadow:0 0 24px rgba(255,79,216,.45);min-height:48px;overflow:hidden;position:relative;z-index:40}" +
      ".house-flash::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:hfSweep 1.1s ease-in-out infinite;pointer-events:none}" +
      "@keyframes hfBg{0%{background-position:0 50%}100%{background-position:220% 50%}}" +
      "@keyframes hfSweep{0%{transform:translateX(-40%);opacity:.15}50%{opacity:.45}100%{transform:translateX(40%);opacity:.15}}" +
      ".hf-tag{flex:0 0 auto;background:#fff3c4;color:#4a0c18;font-weight:900;letter-spacing:.18em;font-size:.72rem;padding:0 .9rem;display:flex;align-items:center;animation:hfBlink .7s steps(2,end) infinite;z-index:2}" +
      "@keyframes hfBlink{0%,100%{background:#fff3c4;color:#4a0c18}50%{background:#ff2d6a;color:#fff}}" +
      ".hf-view{flex:1;overflow:hidden;position:relative;z-index:1}" +
      ".hf-rail{display:flex;height:48px;transition:transform .35s ease}" +
      ".hf-rail.is-drag{transition:none}" +
      ".hf-card{flex:0 0 100%;display:flex;align-items:center;justify-content:center;color:#fff8e4;font-weight:700;font-size:.92rem;text-decoration:none;padding:0 2.2rem;text-align:center;text-shadow:0 1px 2px #000}" +
      ".hf-btn{flex:0 0 36px;background:transparent;border:0;color:#fff8e4;font-size:1.4rem;cursor:pointer;z-index:2}" +
      ".hf-dots{display:none}";
    document.head.appendChild(s);
  }
  function ensureFlashBar() {
    document.querySelectorAll("#house-flash, .house-flash, .dds-flash").forEach(function (el) { el.remove(); });
    return null;
    if (!isHomePage()) {
      var stray = document.getElementById("house-flash");
      if (stray) stray.remove();
      return null;
    }
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (page.indexOf("admin") !== -1 || page.indexOf("session") !== -1) return null;
    injectFlashCss();
    var bar = document.getElementById("house-flash");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "house-flash";
      var nav = document.querySelector("nav");
      if (nav && nav.parentNode) nav.parentNode.insertBefore(bar, nav.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    if (!bar.querySelector("#house-flash-rail")) {
      bar.className = "house-flash dds-flash hf-carousel";
      bar.innerHTML =
        '<div class="hf-tag">NEWS</div>' +
        '<button class="hf-btn hf-prev" type="button" aria-label="Previous">‹</button>' +
        '<div class="hf-view" id="house-flash-view">' +
          '<div class="hf-rail" id="house-flash-rail"></div>' +
        '</div>' +
        '<button class="hf-btn hf-next" type="button" aria-label="Next">›</button>' +
        '<div class="hf-dots" id="house-flash-dots"></div>';
    }
    bar.classList.add("house-flash", "dds-flash", "hf-carousel");
    if (!flashBound) {
      flashBound = true;
      var view = document.getElementById("house-flash-view");
      bar.addEventListener("click", function (e) {
        if (flashDrag.moved > 12) { e.preventDefault(); e.stopPropagation(); return; }
        if (e.target.closest(".hf-next")) { e.preventDefault(); goFlash(1); return; }
        if (e.target.closest(".hf-prev")) { e.preventDefault(); goFlash(-1); return; }
        if (e.target.getAttribute && e.target.getAttribute("data-dot") != null) {
          flashIdx = Number(e.target.getAttribute("data-dot"));
          goFlash(0);
        }
      });
      function down(e) {
        flashDrag.on = true;
        flashDrag.x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        flashDrag.start = flashDrag.x;
        flashDrag.moved = 0;
        var rail = document.getElementById("house-flash-rail");
        if (rail) rail.classList.add("is-drag");
        if (flashTimer) clearInterval(flashTimer);
      }
      function move(e) {
        if (!flashDrag.on) return;
        var x = e.clientX || (e.touches && e.touches[0].clientX) || flashDrag.x;
        var dx = x - flashDrag.x;
        flashDrag.x = x;
        flashDrag.moved += Math.abs(dx);
        var rail = document.getElementById("house-flash-rail");
        if (!rail) return;
        var now = getRailX(rail) + dx;
        rail.style.transform = "translateX(" + now + "px)";
      }
      function up() {
        if (!flashDrag.on) return;
        flashDrag.on = false;
        var rail = document.getElementById("house-flash-rail");
        if (rail) rail.classList.remove("is-drag");
        var w = cardWidth();
        var dx = flashDrag.x - flashDrag.start;
        if (dx < -40) goFlash(1);
        else if (dx > 40) goFlash(-1);
        else goFlash(0);
        restartFlash();
      }
      view.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      view.addEventListener("touchstart", down, { passive: true });
      window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("touchend", up);
      bar.addEventListener("mouseenter", function () { if (flashTimer) clearInterval(flashTimer); });
      bar.addEventListener("mouseleave", restartFlash);
    }
    return document.getElementById("house-flash-rail");
  }
  function cardWidth() {
    var view = document.getElementById("house-flash-view");
    return view ? view.clientWidth : 320;
  }
  function getRailX(rail) {
    var m = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(rail.style.transform || "");
    return m ? Number(m[1]) : -flashIdx * cardWidth();
  }
  function renderRail() {
    var rail = ensureFlashBar();
    if (!rail || !flashHold.length) return;
    rail.innerHTML = flashHold.map(function (item) {
      var text = item.text || item;
      var href = item.href || "whats_new_private_edition.html";
      return '<a class="hf-card" href="' + href + '">' + text + "</a>";
    }).join("");
    var dots = document.getElementById("house-flash-dots");
    if (dots) {
      dots.innerHTML = flashHold.map(function (_, i) {
        return '<button type="button" data-dot="' + i + '" class="' + (i === flashIdx ? "on" : "") + '"></button>';
      }).join("");
    }
    snapRail(false);
  }
  function snapRail(animate) {
    var rail = document.getElementById("house-flash-rail");
    if (!rail) return;
    rail.classList.toggle("is-drag", !animate);
    rail.style.transform = "translateX(" + (-flashIdx * cardWidth()) + "px)";
    var dots = document.getElementById("house-flash-dots");
    if (dots) {
      Array.prototype.forEach.call(dots.querySelectorAll("button"), function (b, i) {
        b.classList.toggle("on", i === flashIdx);
      });
    }
  }
  function goFlash(dir) {
    if (!flashHold.length) return;
    flashIdx = (flashIdx + (dir || 0) + flashHold.length * 8) % flashHold.length;
    snapRail(true);
    restartFlash();
  }
  function restartFlash() {
    if (flashTimer) clearInterval(flashTimer);
    flashTimer = setInterval(function () { goFlash(1); }, 8000);
  }
  function paintFlash(lines) {
    if (!isHomePage()) return;
    if (!lines || !lines.length) return;
    var seen = {};
    flashHold = lines.filter(function (l) {
      var k = (l && l.text) || l;
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    });
    flashIdx = 0;
    renderRail();
    restartFlash();
    window.addEventListener("resize", function () { snapRail(false); });
  }
  var HOUSE_NEWS = [
    newsItem("Wave 2 doors: Tharini 19 Sep · Kavya 24 Sep · Lahari 29 Sep · Navya 12 Oct · Simran 20 Oct", "whats_new_private_edition.html"),
    newsItem("A real review can win a private code. Open Rate, then paste the thank-you code in her chat.", "rate.html"),
    newsItem("See a demo of how the room talks before you pick a door.", "https://desireclubchat.netlify.app/desi_desire_chat_demo.html")
  ];
  function offerLines(rows) {
    var out = [];
    currentOffers().forEach(function (o) {
      out.push(newsItem("FLASH OFFER " + nice(o.slug) + " · " + o.code + " · tap her page", o.slug + ".html"));
    });
    HOUSE_NEWS.forEach(function (n) { out.push(n); });
    return out;
  }

  function markOfferCards() {
    var by = {};
    currentOffers().forEach(function (o) { by[o.slug] = o; });
    document.querySelectorAll("a.poster-card[data-slut]").forEach(function (card) {
      var slug = card.getAttribute("data-slut");
      var existing = card.querySelector(".poster-offer");
      var o = by[slug];
      if (!o) {
        if (existing) existing.remove();
        return;
      }
      var label = (o.type ? String(o.type).toUpperCase() + " OFFER" : "LIVE OFFER");
      if (existing) { existing.textContent = label; return; }
      var tag = document.createElement("div");
      tag.className = "poster-offer";
      tag.textContent = label;
      card.appendChild(tag);
    });
  }
  window.DDS_FLASH_BOARD = function (rows) {
    window.DDS_BOARD = rows || window.DDS_BOARD || [];
    refreshHouseNews();
  };
  // show pinned offers even before the board returns
  function placeProfileOffer() {
    document.querySelectorAll(".profile-live-offer").forEach(function (el) { el.remove(); });
    var slug = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    var hit = currentOffers().filter(function (o) { return o.slug === slug; })[0];
    if (!hit) return;
    var info = document.querySelector(".info") || document.querySelector(".profile-hero .info");
    var rank = document.querySelector(".rank-pill, .glory-banner");
    var box = document.createElement("div");
    box.className = "profile-live-offer";
    box.innerHTML = "<div class='plo-k'>Tonight</div><div class='plo-t'>She is on offer</div><div class='plo-c'>" + hit.code + "</div><p>" + hit.perk + "</p>";
    if (rank && rank.parentNode) rank.parentNode.insertBefore(box, rank);
    else if (info) info.insertBefore(box, info.firstChild);
  }
  function placeSessionOffer() {
    var box = document.getElementById("session-offer");
    if (box) { box.style.display = "none"; box.innerHTML = ""; }
    return;
    if (!box) return;
    var slug = (box.getAttribute("data-slut") || new URLSearchParams(location.search).get("slut") || "").toLowerCase();
    var hits = currentOffers().filter(function (o) { return o && o.slug === slug && o.code; });
    if (!hits.length) { box.style.display = "none"; box.innerHTML = ""; return; }
    box.style.display = "block";
    box.innerHTML = hits.map(function (o) {
      var kind = (o.type ? String(o.type).toUpperCase() + " offer" : "Live offer");
      var perk = o.perk ? "<p>" + String(o.perk).replace(/</g, "") + "</p>" : "";
      return "<h4>Current offer</h4><div class='ocode'>" + String(o.code).replace(/</g, "") + "</div>" + perk + "<p class='muted'>" + kind + ". Paste this code in her chat when she asks.</p>";
    }).join("");
  }
  function refreshHouseNews() {
    if (location.pathname.indexOf("session") !== -1) { placeSessionOffer(); return; }
    placeProfileOffer();
    markOfferCards();
    paintFlash(flashLines(window.DDS_BOARD || []).concat(offerLines([])));
  }
  window.DDS_refreshHouseNews = refreshHouseNews;
  document.addEventListener("dds-cfg", refreshHouseNews);
  refreshHouseNews();
  var houseTimer = 0;
  function startHousePoll() {
    if (/admin|desirescoutadmin/i.test(location.pathname)) return;
    if (houseTimer) clearInterval(houseTimer);
    var ms = window.DDS_pollMs ? window.DDS_pollMs("house", 1500) : 1500000;
    houseTimer = setInterval(function () {
      if (document.hidden) return;
      if (window.DDS_loadCfg) {
        window.DDS_loadCfg().then(function () {
          if (window.DDS_reloadBoard) window.DDS_reloadBoard();
          placeSessionOffer();
        });
      } else {
        placeSessionOffer();
      }
    }, ms);
  }
  startHousePoll();
  document.addEventListener("dds-cfg", startHousePoll);




  inject("dds-agent.js?v=20260930d");

  document.addEventListener("contextmenu", function (e) {
    if (e.target && e.target.closest && e.target.closest("img")) e.preventDefault();
  });
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.closest && e.target.closest("img")) e.preventDefault();
  });
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("draggable", "false");
    });
  });

  function prettyDay(iso) {
    var p = String(iso || "").split("-");
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if (p.length < 3) return iso;
    return Number(p[2]) + " " + months[Number(p[1]) - 1] + " " + p[0];
  }
  function prettyName(slug) {
    slug = String(slug || "");
    return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Her";
  }
  function doorHold(slug) {
    slug = String(slug || "").toLowerCase();
    if (playerOwns(slug)) return null;
    if (window.DDS_canAccess && window.DDS_canAccess(slug)) return null;
    var until = playSoon(slug);
    var busy = (window.DDS_UNAVAILABLE || []).indexOf(slug) !== -1;
    if (!until && !busy) return null;
    return {
      slug: slug,
      until: until,
      busy: busy,
      title: prettyName(slug) + " cannot take you yet",
      reason: until
        ? prettyName(slug) + " opens " + prettyDay(until) + ". She is not taking rooms yet."
        : prettyName(slug) + " is being used right now. She should be free in 2–3 hours. Tell the house how badly you need her."
    };
  }
  function accountRow() {
    try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; }
  }
  function ensureWantModal() {
    if (document.getElementById("dds-want-mask")) return document.getElementById("dds-want-mask");
    var mask = document.createElement("div");
    mask.id = "dds-want-mask";
    mask.className = "dds-want-mask";
    mask.innerHTML =
      "<div class='dds-want-card'>" +
        "<p class='k'>Private request</p>" +
        "<h3 id='dds-want-title'>She is not open</h3>" +
        "<p id='dds-want-reason'></p>" +
        "<label for='dds-want-need'>How badly do you need her?</label>" +
        "<select id='dds-want-need'>" +
          "<option value='3'>3 — curious</option>" +
          "<option value='5' selected>5 — I want her tonight</option>" +
          "<option value='7'>7 — I need this room</option>" +
          "<option value='9'>9 — I cannot wait</option>" +
          "<option value='10'>10 — open her now</option>" +
        "</select>" +
        "<label for='dds-want-do'>What do you want to do to her?</label>" +
        "<textarea id='dds-want-do' placeholder='Tell the house exactly what you want from her.'></textarea>" +
        "<p class='dds-want-msg' id='dds-want-msg'></p>" +
        "<div class='dds-want-actions'>" +
          "<button type='button' id='dds-want-send'>Send to the desk</button>" +
          "<button type='button' class='ghost' id='dds-want-close'>Close</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) { if (e.target === mask) mask.classList.remove("on"); });
    document.getElementById("dds-want-close").onclick = function () { mask.classList.remove("on"); };
    document.getElementById("dds-want-send").onclick = function () {
      var slug = mask.getAttribute("data-slug") || "";
      var need = (document.getElementById("dds-want-need") || {}).value || "5";
      var want = ((document.getElementById("dds-want-do") || {}).value || "").trim();
      var msgEl = document.getElementById("dds-want-msg");
      if (!want) { msgEl.textContent = "Tell the house what you want to do to her."; return; }
      var acc = accountRow() || {};
      var hold = doorHold(slug) || {};
      var message = "[WANT HER]\nNeed: " + need + "/10\nWant: " + want + "\nState: " + (hold.until ? ("opens " + hold.until) : "busy");
      var row = {
        slut: slug,
        player_name: acc.nickname || acc.username || "player",
        player_email: acc.email || "",
        want_reply: false,
        message: message,
        status: "new"
      };
      msgEl.textContent = "Sending…";
      var send = window.DDS_FEEDBACK && window.DDS_FEEDBACK.send
        ? window.DDS_FEEDBACK.send(row)
        : fetch(((window.DDS_SUPABASE && window.DDS_SUPABASE.url) || "").replace(/\/$/, "") + "/rest/v1/player_feedback", {
            method: "POST",
            headers: {
              apikey: (window.DDS_SUPABASE && window.DDS_SUPABASE.anon) || "",
              Authorization: "Bearer " + ((window.DDS_SUPABASE && window.DDS_SUPABASE.anon) || ""),
              "Content-Type": "application/json",
              Prefer: "return=minimal"
            },
            body: JSON.stringify(row)
          }).then(function (r) {
            if (!r.ok) return r.text().then(function (x) { throw new Error(x || r.status); });
          });
      Promise.resolve(send).then(function () {
        var ticket = {
          slut: slug,
          player_name: acc.nickname || acc.username || "player",
          player_age: null,
          player_id: acc.id || null,
          status: "want",
          note: "COME IN · need " + need + "/10 · " + want
        };
        var extra = (window.DDS_INBOX && window.DDS_INBOX.create)
          ? window.DDS_INBOX.create(ticket)
          : Promise.resolve();
        return Promise.resolve(extra);
      }).then(function () {
        msgEl.textContent = "Sent. You are on her come-in list.";
        setTimeout(function () { mask.classList.remove("on"); }, 900);
      }).catch(function (err) {
        msgEl.textContent = String((err && err.message) || err || "Could not send.");
      });
    };
    return mask;
  }
  function openWantModal(slug) {
    var hold = doorHold(slug);
    if (!hold) return false;
    var mask = ensureWantModal();
    mask.setAttribute("data-slug", slug);
    document.getElementById("dds-want-title").textContent = hold.title;
    document.getElementById("dds-want-reason").textContent = hold.reason + " Tell the house how badly you need her.";
    document.getElementById("dds-want-do").value = "";
    document.getElementById("dds-want-msg").textContent = "";
    mask.classList.add("on");
    return true;
  }
  function openHeartModal(slug) {
    var acc = null;
    try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
    var name = (slug || "her").charAt(0).toUpperCase() + String(slug || "her").slice(1);
    var mask = document.getElementById("dds-heart-mask");
    if (!mask) {
      mask = document.createElement("div");
      mask.id = "dds-heart-mask";
      mask.innerHTML = "<div class='dds-heart-card'><p class='k'>CLICK to send her hearts</p><h2 id='dds-heart-title'></h2><p id='dds-heart-copy'></p><div class='dds-heart-row'><button type='button' data-n='1'>♡ 1</button><button type='button' data-n='5'>♡♡ 5</button><button type='button' data-n='10'>♡♡♡ 10</button></div><p class='hint' id='dds-heart-msg'></p><button type='button' class='ghost' id='dds-heart-x'>Close</button></div>";
      document.body.appendChild(mask);
      mask.addEventListener("click", function (e) {
        if (e.target === mask || e.target.id === "dds-heart-x") mask.classList.remove("on");
        var n = e.target.getAttribute && e.target.getAttribute("data-n");
        if (!n) return;
        var who = null;
        try { who = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (err) {}
        var msg = document.getElementById("dds-heart-msg");
        if (!who || !who.id || !who.verified) {
          if (msg) msg.textContent = "Login and Activate first. Then send her your heart.";
          return;
        }
        var cfg = window.DDS_SUPABASE || {};
        if (msg) msg.textContent = "Sending…";
        fetch(String(cfg.url || "").replace(/\/$/, "") + "/rest/v1/rpc/send_heart", {
          method: "POST",
          headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
          body: JSON.stringify({ p_id: who.id, p_model: mask.getAttribute("data-slug"), p_n: Number(n) })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.ok) {
            msg.textContent = "She felt that. +" + (j.dps || n * 5) + " DPS. " + (j.left != null ? j.left + " hearts left today." : "");
            var slug = String(mask.getAttribute("data-slug") || "").toLowerCase();
            if (slug === "anu" || slug === "meenakshi") {
              fetch(String(cfg.url || "").replace(/\/$/, "") + "/rest/v1/rpc/trainer_bump", {
                method: "POST",
                headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
                body: JSON.stringify({ p_slug: slug, p_asked: 0, p_opened: 0, p_hearts: Number(n) })
              }).catch(function () {});
            }
          } else msg.textContent = (j && j.error) || "Could not send.";
        }).catch(function () { msg.textContent = "Could not send."; });
      });
    }
    mask.setAttribute("data-slug", slug);
    document.getElementById("dds-heart-title").textContent = name;
    document.getElementById("dds-heart-copy").textContent = "Each heart is 5 Desire on her rank. Tell the house you want her. Cap 20 a day.";
    document.getElementById("dds-heart-msg").textContent = (!acc || !acc.verified) ? "Login and Activate to send hearts." : "";
    mask.classList.add("on");
  }
  function bumpView() {
    var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
    var live = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
    if (live.indexOf(page) === -1) return;
    var sb = window.DDS_SUPABASE || {};
    if (!sb.url || !sb.anon) return;
    var viewer = "";
    try {
      viewer = localStorage.getItem("dds_viewer") || "";
      if (!viewer) {
        viewer = "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("dds_viewer", viewer);
      }
    } catch (e) { viewer = ""; }
    var seen = "";
    try { seen = sessionStorage.getItem("dds_viewed") || ""; } catch (e) {}
    if (("," + seen + ",").indexOf("," + page + ",") !== -1) return;
    function paintViews(n) {
      if (n == null || n === "") return;
      document.querySelectorAll(".score-chip").forEach(function (chip) {
        var lab = (chip.querySelector(".l") || {}).textContent || "";
        if (!/profile views|poll votes/i.test(lab)) return;
        var num = chip.querySelector(".n");
        if (num) num.textContent = String(n);
      });
    }
    fetch(String(sb.url).replace(/\/$/, "") + "/rest/v1/rpc/bump_profile_view", {
      method: "POST",
      headers: { apikey: sb.anon, Authorization: "Bearer " + sb.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_model: page, p_slut: page, p_viewer: viewer })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || j.ok === false || j.views == null) return;
      try {
        var cur = sessionStorage.getItem("dds_viewed") || "";
        if (("," + cur + ",").indexOf("," + page + ",") === -1) {
          sessionStorage.setItem("dds_viewed", cur ? cur + "," + page : page);
        }
      } catch (e) {}
      window.DDS_FRESH_VIEWS = window.DDS_FRESH_VIEWS || {};
      window.DDS_FRESH_VIEWS[page] = j.views;
      paintViews(j.views);
    }).catch(function () {});
  }
  window.DDS_bumpView = bumpView;
  var bumpTries = 0;
  var bumpTimer = setInterval(function () {
    bumpTries += 1;
    var sb = window.DDS_SUPABASE || {};
    if (sb.url && sb.anon) {
      clearInterval(bumpTimer);
      bumpView();
    } else if (bumpTries > 20) clearInterval(bumpTimer);
  }, 200);


  (function miniHeroBoard() {
    return;
    var info = document.querySelector("article.profile-hero .info");
    if (!info || info.querySelector(".mini-score")) return;
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    var live = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
    if (live.indexOf(page) === -1) return;
    function seed(lab) {
      var n = "";
      document.querySelectorAll(".score-bar .score-chip").forEach(function (c) {
        var l = ((c.querySelector(".l") || {}).textContent || "").trim();
        if (l === lab) n = ((c.querySelector(".n") || {}).textContent || "").trim();
      });
      return n || "—";
    }
    var box = document.createElement("div");
    box.className = "mini-score";
    box.innerHTML =
      '<p class="mini-k">On the board</p>' +
      '<div class="mini-grid">' +
      '<div class="score-chip primary"><div class="n" data-live="'+page+'" data-live-field="score">'+seed("Desire Score")+'</div><div class="l">Desire Score</div></div>' +
      '<div class="score-chip primary"><div class="n" data-live="'+page+'" data-live-field="sessions">'+seed("Sessions")+'</div><div class="l">Sessions</div></div>' +
      '<div class="score-chip"><div class="n" data-live="'+page+'" data-live-field="avg">'+seed("Avg Rating")+'</div><div class="l">Avg Rating</div></div>' +
      '<div class="score-chip primary heart-chip"><div class="n" data-live="'+page+'" data-live-field="hearts">'+seed("Hearts")+'</div><div class="l">Hearts</div></div>' +
      '<div class="score-chip"><div class="n" data-live="'+page+'" data-live-field="pool">'+seed("Pool")+'</div><div class="l">Pool</div></div>' +
      '</div>';
    var cta = info.querySelector(".play-cta");
    if (cta && cta.nextSibling) info.insertBefore(box, cta.nextSibling);
    else info.appendChild(box);
  })();

  document.querySelectorAll(".score-bar").forEach(function (bar) {
    if (bar.querySelector(".l") && /Hearts/i.test(bar.textContent)) return;
    var chip = document.createElement("div");
    chip.className = "score-chip primary heart-chip";
        chip.innerHTML = '<div class="n" data-live-field="hearts">0</div><div class="l">Hearts</div>';
    var earned = document.createElement("div");
    earned.className = "score-chip";
    earned.innerHTML = '<div class="n" data-live-field="pool">0</div><div class="l">Pool</div>';
    var after = null;
    bar.querySelectorAll(".score-chip").forEach(function (c) {
      var lab = (c.querySelector(".l") || {}).textContent || "";
      if (/profile views|poll votes/i.test(lab)) after = c;
    });
    if (after && after.nextSibling) bar.insertBefore(chip, after.nextSibling);
    else bar.appendChild(chip);
    bar.appendChild(earned);
  });
  document.querySelectorAll(".score-chip .l").forEach(function (el) {
    if (/poll votes/i.test(el.textContent)) el.textContent = "Profile views";
    if (/profile views|poll votes/i.test(el.textContent)) {
      var num = el.parentNode && el.parentNode.querySelector(".n");
      if (num) num.setAttribute("data-live-field", "views");
    }
  });
  document.querySelectorAll(".score-explain-item b").forEach(function (el) {
    if (/poll votes/i.test(el.textContent)) {
      el.textContent = "Profile views";
      if (el.nextSibling) el.nextSibling.textContent = "How often men open her page. Views do not change rank. Hearts do.";
    }
  });
  inject("dds-feedback.js");

  var ANU_SOON = ["navya", "simran", "chandana", "aleena"];
  function anuPretty(slug) {
    slug = String(slug || "");
    return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "her";
  }
  function maybeAnuFirst(slug, go) {
    slug = String(slug || "").toLowerCase();
    var acc = accountRow();
    if (!acc || !acc.id || !acc.verified) { go(); return; }
    if (!slug || ANU_SOON.indexOf(slug) !== -1) { go(); return; }
    try { if (localStorage.getItem("dds_anu_skip") === "1") { go(); return; } } catch (e) {}
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) { go(); return; }
    fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_card", {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_id: acc.id, p_model: slug })
    }).then(function (r) { return r.json(); }).then(function (j) {
      var nights = Number(j && (j.n != null ? j.n : (j.nights != null ? j.nights : j.session_count)));
      if (!(nights > 0) && Array.isArray(j && j.sessions) && j.sessions.length) nights = j.sessions.length;
      if (nights > 0) { go(); return; }
      showAnuCard(slug, go);
    }).catch(function () { showAnuCard(slug, go); });
  }
  function assignTrainer() {
    try {
      var kept = localStorage.getItem("dds_trainer");
      if (kept === "anu" || kept === "meenakshi") return kept;
    } catch (e) {}
    var acc = accountRow() || {};
    var key = String(acc.id || acc.username || acc.nickname || "guest");
    var h = 0;
    for (var i = 0; i < key.length; i++) h = ((h * 33) + key.charCodeAt(i)) >>> 0;
    // 1 in 5 to Meenakshi, the rest to Anu. Stable for this account.
    var trainer = (h % 5 === 0) ? "meenakshi" : "anu";
    try { localStorage.setItem("dds_trainer", trainer); } catch (e) {}
    return trainer;
  }
  function showAnuCard(slug, go) {
    var name = anuPretty(slug);
    var trainer = assignTrainer();
    var trainerName = trainer === "meenakshi" ? "Meenakshi" : "Anu";
    var mask = document.getElementById("dds-anu-mask");
    if (!mask) {
      mask = document.createElement("div");
      mask.id = "dds-anu-mask";
      mask.style.cssText = "position:fixed;inset:0;z-index:84;background:rgba(8,4,6,.72);display:flex;align-items:center;justify-content:center;padding:1rem;";
      mask.innerHTML = "<div style='max-width:440px;background:#1a1016;color:#f4e8ef;border:1px solid #6b3a55;padding:1.2rem 1.3rem;border-radius:12px'>" +
        "<img id='dds-anu-face' data-slot='profile' alt='' style='width:72px;height:72px;object-fit:cover;border-radius:50%;border:2px solid #d7a1c0;display:block;margin:0 0 .7rem;background:#2a080c' />" +
        "<p style='letter-spacing:.14em;font-size:.72rem;color:#d7a1c0;margin:0 0 .4rem'>FIRST NIGHT</p>" +
        "<h2 id='dds-anu-title' style='margin:.2rem 0 .6rem;font-size:1.25rem'>Train first?</h2>" +
        "<p id='dds-anu-copy' style='margin:0 0 1rem;line-height:1.45'></p>" +
        "<p style='display:flex;gap:.5rem;flex-wrap:wrap;margin:0'>" +
          "<button type='button' id='dds-anu-train' style='background:#6b3a55;color:#fff;border:0;padding:.55rem 1rem;border-radius:8px;cursor:pointer'>Train</button>" +
          "<button type='button' id='dds-anu-go' style='background:transparent;color:#f4e8ef;border:1px solid #6b3a55;padding:.55rem 1rem;border-radius:8px;cursor:pointer'>Go to her</button>" +
        "</p></div>";
      document.body.appendChild(mask);
    }
    var face = document.getElementById("dds-anu-face");
    if (face) {
      face.setAttribute("data-slut", trainer);
      face.removeAttribute("src");
    }
    document.getElementById("dds-anu-title").textContent = "Train with " + trainerName + "?";
    document.getElementById("dds-anu-copy").textContent = "Optional. Not required. " + trainerName + " checks how you talk, then you open " + name + ". About ten minutes. You can skip and go straight to her.";
    document.getElementById("dds-anu-train").textContent = "Train with " + trainerName;
    document.getElementById("dds-anu-go").textContent = "Skip · go to " + name;
    function trainHref(t) {
      var acc = accountRow() || {};
      var st = acc.status || acc.desire_status || acc.tier || "DesireMember";
      var fav = acc.fav || acc.favorites || "none";
      var owns = acc.owns || "none";
      return "contact_to_play.html?slut=" + t + "&door=" + encodeURIComponent(slug) +
        "&st=" + encodeURIComponent(st) +
        "&n=0&fav=" + encodeURIComponent(fav || "none") +
        "&owns=" + encodeURIComponent(owns || "none") +
        "&name=" + encodeURIComponent(acc.username || acc.nickname || "");
    }
    document.getElementById("dds-anu-train").onclick = function () {
      mask.style.display = "none";
      location.href = trainHref(trainer);
    };
    document.getElementById("dds-anu-go").onclick = function () {
      try { localStorage.setItem("dds_anu_skip", "1"); } catch (e) {}
      mask.style.display = "none";
      go();
    };
    mask.style.display = "flex";
    if (window.DDS_paintArt) window.DDS_paintArt();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.dds-play-mid, a.request-flash, a[href*='contact_to_play']");
    if (!a) return;
    if (a.getAttribute("data-room-ok") === "1") {
      a.removeAttribute("data-room-ok");
      return;
    }
    var href = a.getAttribute("href") || "";
    var slug = slugOfHref(href) || slugOfHref(location.href);
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (!slug && ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"].indexOf(page) !== -1) slug = page;
    e.preventDefault();
    e.stopPropagation();
    playerOpenRoom().then(function (live) {
      if (live && live !== slug) {
        showSessionPop(live);
        return;
      }
      maybeAnuFirst(slug, function () {
        if (openWantModal(slug)) return;
        a.setAttribute("data-room-ok", "1");
        if (href && href !== "#") location.href = href;
        else a.click();
      });
    });
  }, true);
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.id !== "askForm") return;
    if (form.getAttribute("data-room-ok") === "1") {
      form.removeAttribute("data-room-ok");
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var slug = slugOfHref(location.href);
    playerOpenRoom().then(function (live) {
      if (live && live !== slug) {
        showSessionPop(live);
        return;
      }
      form.setAttribute("data-room-ok", "1");
      if (form.requestSubmit) form.requestSubmit();
      else form.submit();
    });
  }, true);

  function playerOpenRoom() {
    var acc = null;
    try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (err) {}
    var cfg = window.DDS_SUPABASE || {};
    if (!acc || !acc.id || !cfg.url) return Promise.resolve("");
    return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_open_room", {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_id: acc.id })
    }).then(function (r) { return r.json(); }).then(function (j) {
      return (j && j.slug) ? String(j.slug).toLowerCase() : "";
    }).catch(function () { return ""; });
  }
  function showSessionPop(live) {
    var name = live ? live.charAt(0).toUpperCase() + live.slice(1) : "her";
    var mask = document.getElementById("dds-session-mask");
    if (!mask) {
      mask = document.createElement("div");
      mask.id = "dds-session-mask";
      mask.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(8,4,6,.72);display:flex;align-items:center;justify-content:center;padding:1rem;";
      mask.innerHTML = "<div style='max-width:420px;background:#1a1016;color:#f4e8ef;border:1px solid #6b3a55;padding:1.2rem 1.3rem;border-radius:12px'><p style='letter-spacing:.14em;font-size:.72rem;color:#d7a1c0;margin:0 0 .4rem'>ONE SESSION</p><h2 id='dds-session-title' style='margin:.2rem 0 .6rem;font-size:1.25rem'>Finish this one first</h2><p id='dds-session-copy' style='margin:0 0 1rem;line-height:1.45'></p><button type='button' id='dds-session-x' style='background:#6b3a55;color:#fff;border:0;padding:.55rem 1rem;border-radius:8px;cursor:pointer'>Okay</button></div>";
      document.body.appendChild(mask);
      mask.addEventListener("click", function (ev) {
        if (ev.target === mask || ev.target.id === "dds-session-x") mask.style.display = "none";
      });
    }
    document.getElementById("dds-session-copy").textContent = "Finish your current session with " + name + " before opening another door. One model or trainer at a time.";
    mask.style.display = "flex";
  }


  function paintHeroStars() {
    var slugs = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
    var page = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
    if (["anu","meenakshi"].indexOf(page) !== -1) return;
    if (slugs.indexOf(page) === -1 || document.getElementById("dds-hero-stars")) return;
    var meta = document.querySelector(".meta-line");
    if (!meta) return;
    var scoreSec = document.querySelector(".score-bar");
    if (scoreSec && scoreSec.parentNode && !scoreSec.parentNode.id) scoreSec.parentNode.id = "desire-scoreboard";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "dds-hero-stars";
    btn.className = "dds-hero-stars";
    btn.title = "Desire score and last reviews";
    btn.style.cssText = "display:flex;flex-direction:column;align-items:flex-start;gap:6px;width:240px;max-width:100%;margin:12px 0 4px;padding:12px 14px;border:1px solid rgba(212,175,55,.45);border-radius:14px;background:#1a1416;color:#f6edd8;cursor:pointer;font:inherit;text-align:left;box-shadow:0 8px 22px rgba(0,0,0,.35);";
    function starRow(n) {
      var x = Math.max(0, Math.min(5, Number(n) || 0));
      var full = Math.floor(x + 0.001);
      var half = !full && x > 0 ? false : (x - full) >= 0.25 && (x - full) < 0.75;
      if ((x - full) >= 0.75) full += 1;
      var html = "<span class='rate-top'><span>Overall Rating</span><span class='up'>&#128077;</span></span><span class='rate-row'><span class='stars'>";
      for (var i = 1; i <= 5; i++) {
        if (i <= full) html += "<i class='on'>★</i>";
        else if (half && i === full + 1) html += "<i class='half'>★</i>";
        else html += "<i class='off'>★</i>";
      }
      var nights = arguments[1];
      var nightTxt = nights != null && nights !== "" ? "<em class='night-count' style='margin-left:10px;font-style:normal;font-size:.82rem;letter-spacing:.08em;text-transform:uppercase;color:#e8d5b0'>" + nights + " nights</em>" : "";
      return html + "</span><b style='color:#f0d78c;font-size:1.35rem'>" + (x ? x.toFixed(1) : "—") + "</b>" + nightTxt + "</span><span style='font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:#c9b896;margin-top:2px'>Tap for scoreboard</span>";
    }
    function dressBoard() {
      document.querySelectorAll(".score-chip").forEach(function (el) { el.removeAttribute("data-tip"); el.removeAttribute("title"); });
      var ringNames = /avg rating|cum score|body score|convo score|please score|re-attend|cum rate/i;
      document.querySelectorAll(".score-bar").forEach(function (bar) {
        if (bar.querySelector(".dds-group")) return;
        var counts = [], rings = [];
        Array.prototype.slice.call(bar.querySelectorAll(".score-chip")).forEach(function (el) {
          var name = ((el.querySelector(".l") || {}).textContent || "").trim();
          if (/^sessions$/i.test(name)) el.querySelector(".l").textContent = "Nights";
          (ringNames.test(name) ? rings : counts).push(el);
        });
        counts.forEach(function (el) { bar.appendChild(el); });
        if (rings.length) {
          var g = document.createElement("div");
          g.className = "dds-group";
          g.textContent = "Ratings";
          bar.appendChild(g);
          rings.forEach(function (el) { bar.appendChild(el); });
        }
      });
      document.querySelectorAll(".score-chip").forEach(function (el) {
        var lab = el.querySelector(".l");
        var num = el.querySelector(".n");
        if (!lab || !num || el.querySelector(".dds-ring")) return;
        var name = (lab.textContent || "").trim();
        if (/^sessions$/i.test(name)) lab.textContent = "Nights";
        if (!ringNames.test(name)) return;
        var raw = (num.getAttribute("data-raw") || num.textContent || "").trim();
        var v = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
        if (!isFinite(v)) return;
        var pct = /cum rate/i.test(name) ? Math.round(v) : Math.round((v / 5) * 100);
        pct = Math.max(0, Math.min(100, pct));
        num.setAttribute("data-raw", raw);
        el.classList.add("dds-ring-chip");
        var heat = pct >= 85 ? "#ff4fd8" : pct >= 70 ? "#d946ef" : pct >= 50 ? "#b06bdb" : "#7a4d96";
        var r = 16, c = 2 * Math.PI * r, dash = (pct / 100) * c;
        num.innerHTML = "<span class='dds-ring' style='--heat:"+heat+"'><svg viewBox='0 0 40 40' aria-hidden='true'><circle cx='20' cy='20' r='16' fill='none' stroke='rgba(255,79,216,.16)' stroke-width='3'/><circle cx='20' cy='20' r='16' fill='none' stroke='"+heat+"' stroke-width='3.4' stroke-linecap='round' stroke-dasharray='" + dash.toFixed(2) + " " + (c - dash).toFixed(2) + "' transform='rotate(-90 20 20)'/></svg><em>" + pct + "%</em></span>";
      });
    }
    dressBoard();
    setTimeout(dressBoard, 800);
    var chip = 0;
    document.querySelectorAll(".score-chip").forEach(function (el) {
      var lab = el.querySelector(".l");
      if (lab && /avg rating/i.test(lab.textContent || "")) {
        var num = el.querySelector(".n");
        chip = Number(num && num.textContent) || 0;
      }
    });
    btn.innerHTML = starRow(chip);
    var wrap = document.createElement("div");
    wrap.className = "dds-hero-row";
    wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;margin:12px 0 4px;";
    btn.style.margin = "0";
    wrap.appendChild(btn);
    var dpsBox = document.createElement("div");
    dpsBox.id = "dds-hero-dps";
    dpsBox.className = "dds-hero-dps";
    dpsBox.style.cssText = "display:flex;flex-direction:column;justify-content:center;min-width:140px;padding:12px 16px;border:1px solid rgba(192,132,252,.55);border-radius:14px;background:#1a1416;color:#f3e8ff;";
    var name = page.charAt(0).toUpperCase() + page.slice(1);
    dpsBox.innerHTML = "<div style='font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#c084fc;font-weight:600'>" + name + "'s DPS</div><div id='dds-hero-dps-num' style='font-size:1.35rem;font-weight:700;margin-top:2px'>—</div>";
    wrap.appendChild(dpsBox);
    meta.insertAdjacentElement("afterend", wrap);
    // Fill the number from the pool
    var cfg = window.DDS_SUPABASE || {};
    var base = String(cfg.url || "https://axavugukoesqkfykprur.supabase.co").replace(/\/$/, "");
    var anon = cfg.anon || "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I";
    fetch(base + "/rest/v1/model_dps_pool?select=pool&slug=eq." + encodeURIComponent(page) + "&limit=1", {
      headers: { apikey: anon, Authorization: "Bearer " + anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var row = rows && rows[0];
      var n = row ? Number(row.pool) : NaN;
      var el = document.getElementById("dds-hero-dps-num");
      if (!el) return;
      if (!isFinite(n)) { el.textContent = "—"; return; }
      el.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
    }).catch(function () {});
    var revBtn = document.createElement("button");
    revBtn.type = "button";
    revBtn.id = "dds-read-all-revs";
    revBtn.textContent = "Read All Reviews";
    revBtn.style.cssText = "display:block;width:100%;max-width:420px;margin:10px 0 6px;padding:12px 20px;border:2px solid #c084fc;border-radius:10px;background:linear-gradient(180deg,#2a1a3a 0%,#1a1024 100%);color:#f3e8ff;font:inherit;font-size:.92rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 18px rgba(192,132,252,.55), inset 0 0 12px rgba(192,132,252,.15);text-shadow:0 0 8px rgba(243,232,255,.6);transition:box-shadow .2s,transform .15s;";
    revBtn.onmouseover = function () { this.style.boxShadow = "0 0 28px rgba(192,132,252,.85), inset 0 0 16px rgba(192,132,252,.25)"; this.style.transform = "translateY(-1px)"; };
    revBtn.onmouseout = function () { this.style.boxShadow = "0 0 18px rgba(192,132,252,.55), inset 0 0 12px rgba(192,132,252,.15)"; this.style.transform = ""; };
    wrap.insertAdjacentElement("afterend", revBtn);
    revBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof openAll === "function") openAll();
      else if (window.DDS_openAllRevs) window.DDS_openAllRevs();
    });
    var cfg = window.DDS_SUPABASE || {};
    if (cfg.url && cfg.anon) {
      fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/board?select=avg_rating,desire_score,sessions&slut=eq." + encodeURIComponent(page) + "&limit=1", {
        headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon }
      }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        var row = rows && rows[0];
        if (!row) return;
        var n = Number(row.avg_rating);
        var nights = Number(row.sessions);
        if (n || nights) btn.innerHTML = starRow(n, isFinite(nights) ? nights : null);
        btn.style.width = "auto";
        btn.style.minWidth = "280px";
      }).catch(function () {});
    }
    btn.addEventListener("click", function () { openScoreSheet(page, btn); });
  }
  function openScoreSheet(slug) {
    var sheet = document.getElementById("dds-score-sheet");
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "dds-score-sheet";
      sheet.innerHTML = "<div class='sheet'><button type='button' class='x' id='dds-score-x'>×</button><h2>Desire scoreboard</h2><div id='dds-score-body'></div><h2>Last reviews</h2><div id='dds-score-revs'>Loading…</div></div>";
      document.body.appendChild(sheet);
      sheet.addEventListener("click", function (ev) {
        if (ev.target === sheet || ev.target.id === "dds-score-x") sheet.classList.remove("on");
      });
    }
    var body = document.getElementById("dds-score-body");
    var bar = document.querySelector(".score-bar");
    body.innerHTML = bar ? bar.outerHTML : "<p>No scoreboard on this page.</p>";
    var revs = document.getElementById("dds-score-revs");
    revs.textContent = "Loading…";
    sheet.classList.add("on");
    var cfg = window.DDS_SUPABASE || {};
    var base = String(cfg.url || "https://axavugukoesqkfykprur.supabase.co").replace(/\/$/, "");
    var anon = cfg.anon || "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I";
    // Fresh pool into the cloned scoreboard
    fetch(base + "/rest/v1/model_dps_pool?select=pool&slug=eq." + encodeURIComponent(slug) + "&limit=1", {
      headers: { apikey: anon, Authorization: "Bearer " + anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var row = rows && rows[0];
      if (!row) return;
      var pool = Number(row.pool);
      if (!isFinite(pool)) return;
      var chips = body.querySelectorAll(".score-chip");
      for (var i = 0; i < chips.length; i++) {
        var lab = chips[i].querySelector(".l");
        var num = chips[i].querySelector(".n");
        if (!lab || !num) continue;
        if (!/^pool$/i.test((lab.textContent || "").trim())) continue;
        var shown = pool >= 1000 ? (pool / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(pool);
        num.textContent = shown;
        break;
      }
    }).catch(function () {});
    fetch(base + "/rest/v1/desk_reviews?slut=eq." + encodeURIComponent(slug) + "&select=created_at,overall,feedback&order=created_at.desc&limit=8", {
      headers: { apikey: anon, Authorization: "Bearer " + anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      rows = Array.isArray(rows) ? rows : [];
      if (!rows.length) { revs.textContent = "No written reviews yet."; return; }
      revs.innerHTML = rows.map(function (r) {
        var n = Math.max(0, Math.min(5, Math.round(Number(r.overall) || 0)));
        var stars = "";
        for (var i = 1; i <= 5; i++) stars += "<i style='color:" + (i <= n ? "#f5c518" : "#6a625c") + ";font-style:normal'>★</i>";
        var day = String(r.created_at || "").slice(0, 10);
        return "<p class='pr'>" + stars + " " + String(r.feedback || "").replace(/</g, "") + " <span>" + day + "</span></p>";
      }).join("");
    }).catch(function () { revs.textContent = "Reviews could not load."; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paintHeroStars);
  else paintHeroStars();

})();

(function guestPing() {
  var cfg = window.DDS_SUPABASE || {};
  if (!cfg.url || !cfg.anon) return;
  var me = null;
  try { me = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
  if (me && me.id) {
    fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_touch", {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify({ p_id: me.id })
    }).catch(function () {});
    return;
  }
  var tok = "";
  try { tok = localStorage.getItem("dds_guest") || ""; } catch (e) {}
  if (!tok) {
    tok = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    try { localStorage.setItem("dds_guest", tok); } catch (e) {}
  }
  fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/house_guest_ping", {
    method: "POST",
    headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: tok })
  }).catch(function () {});
})();

window.DDS_showAccessPop = function (slug, level) {
  var box = document.getElementById("dds-access-pop");
  if (!box) {
    box = document.createElement("div");
    box.id = "dds-access-pop";
    box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem";
    document.body.appendChild(box);
  }
  var st = "DesireMember";
  var myPts = 0;
  try {
    var card = JSON.parse(localStorage.getItem("dds_player_card") || "{}");
    myPts = Number(card.points || card.dps || 0);
    st = card.status || card.st || "DesireMember";
  } catch (e) {}
  var need = "Members";
  var floor = 20;
  if (level === "bronze") { need = "Bronze and above"; floor = 50; }
  else if (level === "silver") { need = "Silver and above"; floor = 100; }
  else if (level === "gold") { need = "Gold and above"; floor = 300; }
  else if (level === "elite") { need = "Elite and above"; floor = 650; }
  else if (level === "owners") { need = "owners"; floor = 0; }
  var more = floor > 0 ? Math.max(0, floor - myPts) : 0;
  var title = her + " is open for " + need + " only.";
  if (level === "soon" || level === "imagesoon") {
    var ov = (window.DDS_CFG && window.DDS_CFG.soonOverride || {})[slug] || "";
    var ovLabel = { bronze: "Bronze+", silver: "Silver+", gold: "Gold+", elite: "Elite+", owners: "Owners" }[ov] || "";
    var openDate = (window.DDS_CFG && window.DDS_CFG.waveOpens || {})[slug] || "";
    if (ovLabel && openDate) title = her + " is for " + ovLabel + " for now. Public opens " + openDate + ".";
    else if (ovLabel) title = her + " is for " + ovLabel + " for now.";
    else if (openDate) title = her + " opens " + openDate + ".";
    else title = her + " is opening soon.";
  }
  var needLine = more > 0 ? "You need " + more + " more Desire points." : "";
  var rankHtml = "<b>Your status:</b> " + st + "<br><b>Your DPS:</b> " + myPts + (needLine ? "<br>" + needLine : "");
  box.innerHTML = '<div style="max-width:420px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
    '<p style="margin:0 0 .5rem;font-size:1.05rem;color:#e9d5ff">' + title + '</p>' +
    (more > 0 ? '<p style="margin:0 0 .6rem;font-size:.92rem;color:#f0d48a">' + needLine + '</p>' : '') +
    '<p style="margin:0 0 .5rem;font-size:.9rem;color:#b9a892">You have ' + myPts + ' Desire points.</p>' +
    '<div style="margin:.5rem 0 .7rem;padding:.6rem .7rem;background:#120814;border:1px solid #4a2c5f;border-radius:8px;font-size:.88rem;color:#d4c4b0">' + rankHtml + '</div>' +
    '<p style="margin:0 0 .6rem;font-size:.86rem;color:#b9a892">Ways to get there:<br>· Play the models you can open and finish nights.<br>· Leave reviews after a room.<br>· Own a woman — Silver after five nights, Gold and above after three.<br>· Or buy a pack if you want the floor now.</p>' +
    '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem">' +
      '<a href="index.html#tips" style="flex:1;min-width:120px;text-align:center;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;text-decoration:none">How to earn DPS</a>' +
      ownHerBtn(slug) +
          '<button type="button" id="ddsBuyOpen" style="flex:1;min-width:100px;background:#3a1f4a;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Buy a pack</button>' +
    '</div>' +
    '<button type="button" id="ddsAccessClose" style="display:block;width:100%;margin-top:.6rem;background:transparent;border:1px solid #4a2c5f;color:#c4b5a0;padding:.45rem;border-radius:8px">Close</button>' +
  '</div>';
  box.style.display = "flex";
  var close = document.getElementById("ddsAccessClose");
  if (close) close.onclick = function () { box.style.display = "none"; };
  var buy = document.getElementById("ddsBuyOpen");
  if (buy) buy.onclick = function () { if (window.DDS_openBuyRank) window.DDS_openBuyRank(); };
};

document.addEventListener("DOMContentLoaded", function () {
  [50, 200, 600, 1500].forEach(function (ms) {
    setTimeout(function () {
      if (window.DDS_paintAccess) window.DDS_paintAccess();
      if (window.DDS_stampAccessOnPlay) window.DDS_stampAccessOnPlay();
    }, ms);
  });
});


window.DDS_openBuyRank = function () {
  var old = document.getElementById("ddsBuyRankModal");
  if (old) old.remove();
  var box = document.createElement("div");
  box.id = "ddsBuyRankModal";
  box.style.cssText = "position:fixed;inset:0;z-index:120;background:rgba(8,4,12,.78);display:flex;align-items:center;justify-content:center;padding:1rem";
  box.innerHTML = '<div style="max-width:420px;width:100%;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
    '<p style="margin:0 0 .4rem;font-size:1.05rem;color:#e9d5ff">Buy a rank</p>' +
    '<p style="margin:0 0 .7rem;font-size:.86rem;color:#b9a892" id="ddsBuyHint">Amazon Giftcard Code in the exact amount. Desk grants the floor after the code clears.</p>' +
    '<label style="display:block;font-size:.82rem;color:#c4b5a0;margin:0 0 .25rem">Pack</label>' +
    '<select id="ddsBuyPack" style="width:100%;margin:0 0 .6rem;padding:.5rem;border-radius:8px;border:1px solid #4a2c5f;background:#120814;color:#f3e9d7"></select>' +
    '<label style="display:block;font-size:.82rem;color:#c4b5a0;margin:0 0 .25rem">Amazon Giftcard Code</label>' +
    '<input id="ddsBuyCode" placeholder="Amazon Giftcard Code" style="width:100%;box-sizing:border-box;margin:0 0 .7rem;padding:.5rem;border-radius:8px;border:1px solid #4a2c5f;background:#120814;color:#f3e9d7"/>' +
    '<button type="button" id="ddsBuySubmit" style="width:100%;background:#6b3fa0;color:#fff;padding:.55rem;border-radius:8px;border:0">Submit purchase</button>' +
    '<p id="ddsBuyMsg" style="margin:.5rem 0 0;font-size:.86rem;color:#e8c4a8;min-height:1.2em"></p>' +
    '<button type="button" id="ddsBuyClose" style="width:100%;margin-top:.5rem;background:#2a1a32;color:#fff;padding:.45rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
  '</div>';
  document.body.appendChild(box);
  fillBuyPacks();
  function close() { box.remove(); }
  box.addEventListener("click", function (ev) {
    if (ev.target === box || ev.target.id === "ddsBuyClose") close();
  });
  var msg = document.getElementById("ddsBuyMsg");
  document.getElementById("ddsBuySubmit").onclick = async function () {
    var acc = window.DDS_account && window.DDS_account();
    if (!acc || !acc.id) { msg.textContent = "Login first."; return; }
    var pack = document.getElementById("ddsBuyPack").value;
    var code = (document.getElementById("ddsBuyCode").value || "").trim();
    var labels = { silver: "$20 / ₹1250", gold: "$50 / ₹2500", elite: "$100 / ₹5000", platinum: "$150 / ₹8000" };
    if (!code || code.length < 8) { msg.textContent = "Paste a valid Amazon Giftcard Code."; return; }
    msg.textContent = "Sending…";
    var sb = window.DDS_sb || window.sb;
    if (!sb) { msg.textContent = "Not ready. Try again."; return; }
    var ins = await sb.from("dps_orders").insert({
      player_id: acc.id,
      pack: pack,
      label: labels[pack] || pack,
      amazon_code: code,
      player_name: acc.nickname || acc.username || "",
      player_email: acc.email || "",
      status: "open"
    }).select("id").maybeSingle();
    if (ins.error) { msg.textContent = ins.error.message; return; }
    msg.textContent = "Sent to the desk. Once granted, the receipt will be in your inbox.";
  };
};

window.DDS_dpsStatusFromPts = function (pts) {
  pts = Number(pts) || 0;
  var cfg = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
  var bronze = Number(cfg.bronze) || 50;
  var silver = Number(cfg.silver) || 150;
  var gold = Number(cfg.gold) || 700;
  var elite = Number(cfg.elite) || 1500;
  var platinum = Number(cfg.platinum) || 2500;
  if (pts >= platinum) return { key: "platinum", label: "Desire Platinum", floor: platinum };
  if (pts >= elite) return { key: "elite", label: "Desire Elite", floor: elite };
  if (pts >= gold) return { key: "gold", label: "Desire Gold", floor: gold };
  if (pts >= silver) return { key: "silver", label: "Desire Silver", floor: silver };
  if (pts >= bronze) return { key: "bronze", label: "Desire Bronze", floor: bronze };
  return { key: "member", label: "DesireMember", floor: 0 };
};

  function stampClosed() {
    var closed = []
      .concat(window.DDS_CLOSED || [])
      .concat((window.DDS_CFG && window.DDS_CFG.unavailable) || [])
      .map(function (s) { return String(s || "").toLowerCase(); });
    var soon = ((window.DDS_CFG && window.DDS_CFG.soon) || []).map(function (s) { return String(s || "").toLowerCase(); });
    document.querySelectorAll("[data-slug]").forEach(function (el) {
      var slug = (el.getAttribute("data-slug") || "").toLowerCase();
      if (closed.indexOf(slug) !== -1) el.classList.add("dds-closed");
      else el.classList.remove("dds-closed");
      if (soon.indexOf(slug) !== -1) el.classList.add("dds-soon");
      else el.classList.remove("dds-soon");
    });
  }
  setTimeout(stampClosed, 400);
  setTimeout(stampClosed, 1200);


  function kDen(n) {
    n = Math.round(Number(n) || 0);
    if (n >= 10000) return Math.round(n / 1000) + "k";
    if (n >= 5000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  function paintOwnedHero() {
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (!page || page === "index") return;
    var hero = document.querySelector(".profile-hero");
    if (!hero) return;
    if (typeof playerOwns === "function" && playerOwns(page)) {
      hero.classList.add("owned");
    } else {
      hero.classList.remove("owned");
    }
  }

  paintOwnedHero();
  // Force refresh owns from server on profile pages so bought ownership shows
  if (window.DDS_refreshOwns) {
    setTimeout(function () { window.DDS_refreshOwns(); }, 300);
  }
  (function paintProfileBoard() {
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (!page || page === "index" || !document.querySelector(".score-bar")) return;
    var cfg = window.DDS_SUPABASE || {};
    var url = cfg.url || "https://axavugukoesqkfykprur.supabase.co";
    var anon = cfg.anon || "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I";
    function setChip(labelRe, value) {
      if (value == null || value === "") return;
      document.querySelectorAll(".score-bar .score-chip").forEach(function (el) {
        var lab = el.querySelector(".l");
        var num = el.querySelector(".n");
        if (!lab || !num) return;
        if (!labelRe.test((lab.textContent || "").trim())) return;
        num.textContent = value;
        num.setAttribute("data-raw", value);
      });
    }
    function paint(row) {
      if (!row) return;
      var score = Number(row.desire_score);
      var nights = Number(row.sessions);
      var avg = Number(row.avg_rating);
      var hearts = Number(row.hearts);
      var polls = Number(row.poll_votes);
      var revs = Number(row.reviews);
      if (isFinite(score)) setChip(/^desire score$/i, score % 1 === 0 ? String(score) : score.toFixed(1));
      if (isFinite(nights)) setChip(/^(sessions|nights)$/i, String(nights));
      if (isFinite(avg) && avg) setChip(/^avg rating$/i, avg.toFixed(2));
      if (isFinite(hearts)) setChip(/^hearts$/i, String(hearts));
      if (isFinite(polls)) setChip(/^(poll votes|profile views)$/i, String(polls));
      if (isFinite(revs)) setChip(/^reviews$/i, String(revs));
    }
    function paintPool() {
      fetch(String(url).replace(/\/$/, "") + "/rest/v1/model_dps_pool?slug=eq." + encodeURIComponent(page) + "&select=pool&limit=1", {
        headers: { apikey: anon, Authorization: "Bearer " + anon }
      }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        var pool = (rows && rows[0] && rows[0].pool) || 0;
        setChip(/^desire score$/i, String(pool));
        document.querySelectorAll(".score-bar .score-chip .l").forEach(function (lab) {
          if (/^desire score$/i.test((lab.textContent || "").trim())) lab.textContent = "DPS Pool";
        });
      }).catch(function () {});
    }
    paintPool();
    fetch(String(url).replace(/\/$/, "") + "/rest/v1/board?select=sessions,desire_score,avg_rating,hearts,poll_votes,reviews&slut=eq." + encodeURIComponent(page) + "&limit=1", {
      headers: { apikey: anon, Authorization: "Bearer " + anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      paint(rows && rows[0]);
    }).catch(function () {});
    // Pool value in the metrics chip. Falls back to 20× nights if the table is empty.
    fetch(String(url).replace(/\/$/, "") + "/rest/v1/model_dps_pool?select=pool&slug=eq." + encodeURIComponent(page) + "&limit=1", {
      headers: { apikey: anon, Authorization: "Bearer " + anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var row = rows && rows[0];
      var pool = row ? Number(row.pool) : NaN;
      if (!isFinite(pool) || pool === 0) {
        // Fallback: read nights from the already-painted chip and compute 20×
        var nights = 0;
        document.querySelectorAll(".score-bar .score-chip").forEach(function (el) {
          var lab = ((el.querySelector(".l") || {}).textContent || "").trim();
          if (/^(sessions|nights)$/i.test(lab)) {
            nights = Number(((el.querySelector(".n") || {}).textContent || "0").replace(/[^0-9]/g, ""));
          }
        });
        pool = Math.max(2000, nights * 20);
      }
      setChip(/^pool$/i, kDen(pool));
      // Remove any leftover Earned / star chip from the hero
      var h1 = document.querySelector("article.profile-hero h1");
      if (h1) {
        Array.from(h1.querySelectorAll("span")).forEach(function (s) {
          if (/earned/i.test(s.textContent || "") || s.id === "dpsStarChip") s.remove();
        });
      }
      var oldStar = document.getElementById("dpsStarChip");
      if (oldStar) oldStar.remove();
    }).catch(function () {});
    document.querySelectorAll(".score-explain-item b").forEach(function (b) {
      if (!/^desire score$/i.test((b.textContent || "").trim())) return;
      var parent = b.parentElement;
      if (!parent) return;
      parent.innerHTML = "<b>DPS Pool</b> Her ranking number. Grows from player spend, hearts, reviews, and favorites.";
    });
    document.querySelectorAll(".score-explain-item b").forEach(function (b) {
      if (!/^(sessions|nights)$/i.test((b.textContent || "").trim())) return;
      var parent = b.parentElement;
      if (!parent) return;
      parent.innerHTML = "<b>Nights</b> Opened nights with her. This is the nights number in the score.";
    });
  })();

  (function paintTrainerRating() {
    var page = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
    if (page !== "anu" && page !== "meenakshi") return;
    var info = document.querySelector(".profile-hero .info");
    if (!info || document.getElementById("trainerRating")) return;
    var box = document.createElement("div");
    box.id = "trainerRating";
    box.style.cssText = "display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid rgba(215,161,192,.45);border-radius:14px;background:#1a1416;width:fit-content;";
    box.innerHTML = "<span style='color:#f0d78c;letter-spacing:.08em;font-size:.72rem;text-transform:uppercase'>Trainer rating</span><b id='trainerStars' style='color:#ffe6a0;font-size:1.2rem'>—</b><span id='trainerCount' style='color:#c9b896;font-size:.8rem'></span><a href='rate.html?slut=" + page + "' style='color:#e8d5ff;font-size:.78rem'>Rate her</a>";
    var actions = info.querySelector(".actions");
    if (actions) info.insertBefore(box, actions);
    else info.appendChild(box);
    var cfg = window.DDS_SUPABASE || {};
    var url = cfg.url || "https://axavugukoesqkfykprur.supabase.co";
    var anon = cfg.anon || "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I";
    var rpc = page === "anu" ? "anu_rating_card" : "meenakshi_rating_card";
    fetch(String(url).replace(/\/$/, "") + "/rest/v1/rpc/" + rpc, {
      method: "POST",
      headers: { apikey: anon, Authorization: "Bearer " + anon, "Content-Type": "application/json" },
      body: "{}"
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return;
      var avg = Number(j.avg);
      var n = Number(j.reviews || j.count || 0);
      var stars = document.getElementById("trainerStars");
      var count = document.getElementById("trainerCount");
      if (stars) stars.textContent = isFinite(avg) && avg ? ("★ " + avg.toFixed(1)) : "No rating yet";
      if (count) count.textContent = n ? (n + " rating" + (n === 1 ? "" : "s")) : "";
      var avgEl = document.getElementById("ratingAvg");
      if (avgEl) avgEl.textContent = isFinite(avg) && avg ? (avg.toFixed(1) + " from " + n + " rating" + (n === 1 ? "" : "s")) : "No rating yet";
    }).catch(function () {});
  })();

  (function showMainAlert() {
    function isHome() {
      var page = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
      return !page || page === "index";
    }
    if (!isHome()) return;
    function tryShow() {
      var cfg = window.DDS_CFG || {};
      if (!cfg.mainAlertOn) return;
      var msg = String(cfg.mainAlertText || "").trim();
      if (!msg) return;
      if (document.getElementById("ddsMainAlert")) return;
      var overlay = document.createElement("div");
      overlay.id = "ddsMainAlert";
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(8,4,10,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1.2rem";
      var card = document.createElement("div");
      card.style.cssText = "max-width:400px;width:100%;background:linear-gradient(180deg,#1c1026 0%,#140c1a 100%);border:1px solid rgba(168,85,247,.45);border-radius:18px;padding:0;color:#f5efe6;box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 0 1px rgba(168,85,247,.12);font-family:Inter,system-ui,sans-serif;overflow:hidden";
      var bar = document.createElement("div");
      bar.style.cssText = "height:4px;background:linear-gradient(90deg,#7c3aed,#c084fc,#7c3aed)";
      var inner = document.createElement("div");
      inner.style.cssText = "padding:1.5rem 1.4rem 1.3rem";
      var kicker = document.createElement("div");
      kicker.textContent = "HOUSE";
      kicker.style.cssText = "font-size:.68rem;letter-spacing:.18em;color:#c084fc;font-weight:600;margin-bottom:.35rem";
      var title = document.createElement("div");
      title.textContent = "Notice";
      title.style.cssText = "font-family:Playfair Display,serif;font-size:1.35rem;color:#f3e8ff;margin:0 0 .75rem;line-height:1.2";
      var body = document.createElement("div");
      body.textContent = msg;
      body.style.cssText = "white-space:pre-wrap;line-height:1.55;font-size:.98rem;color:#efe6d8;margin-bottom:1.15rem";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Got it";
      btn.style.cssText = "width:100%;background:#7c3aed;color:#fff;border:0;border-radius:12px;padding:.7rem 1rem;font-weight:600;font-size:.95rem;cursor:pointer;letter-spacing:.02em";
      btn.onmouseenter = function () { btn.style.background = "#6d28d9"; };
      btn.onmouseleave = function () { btn.style.background = "#7c3aed"; };
      btn.onclick = function () { overlay.remove(); };
      inner.appendChild(kicker);
      inner.appendChild(title);
      inner.appendChild(body);
      inner.appendChild(btn);
      card.appendChild(bar);
      card.appendChild(inner);
      overlay.appendChild(card);
      overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
      document.body.appendChild(overlay);
    }
    document.addEventListener("dds-cfg", tryShow);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tryShow);
    else setTimeout(tryShow, 200);
  })();

// Update own buttons after account is known
setTimeout(function () {
  if (typeof window.DDS_updateOwnButtons === "function") window.DDS_updateOwnButtons();
}, 400);
setTimeout(function () {
  if (typeof window.DDS_updateOwnButtons === "function") window.DDS_updateOwnButtons();
}, 1200);

// Force ownership view if player owns this model
function forceOwnedView() {
  var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
  if (!page || page === "index") return;
  
  // Check localStorage owns
  var owns = false;
  try {
    var acc = JSON.parse(localStorage.getItem("dds_account") || "null");
    if (acc && acc.owns) {
      var list = String(acc.owns).toLowerCase().split(/[,|\s]+/);
      owns = list.indexOf(page) !== -1;
    }
    if (!owns) {
      var raw = localStorage.getItem("dds_owns") || "";
      var list2 = String(raw).toLowerCase().split(/[,|\s]+/);
      owns = list2.indexOf(page) !== -1;
    }
  } catch (e) {}
  
  // Do not check DOM - ownership is per model from server data only
  
  if (!owns) return;
  
  // Apply owned view
  var hero = document.querySelector(".profile-hero");
  if (hero) hero.classList.add("owned");
  
  // Update buttons
  document.querySelectorAll("a[data-own-dps]").forEach(function(a) {
    var slug = (a.getAttribute("data-own-dps") || "").toLowerCase();
    if (slug === page) {
      a.textContent = "Own Perks";
      a.style.background = "#6b3fa0";
      a.style.color = "#fff";
    }
  });
  
  // Replace FAN PAGE banner with OWN PAGE
  var banner = document.getElementById("fan-page-banner");
  if (banner) {
    var name = page.charAt(0).toUpperCase() + page.slice(1);
    banner.style.background = "linear-gradient(90deg,#5a3a10,#e8c45a,#5a3a10)";
    banner.style.color = "#1a1008";
    banner.style.borderBottom = "2px solid #ffd700";
    banner.textContent = "OWN PAGE · " + name;
  }
}
window.forceOwnedView = forceOwnedView;

// Run on load and after delays
if (document.readyState === "complete") forceOwnedView();
else window.addEventListener("load", forceOwnedView);
setTimeout(forceOwnedView, 500);
setTimeout(forceOwnedView, 1500);
setTimeout(forceOwnedView, 3000);

// Own Perks modal
function openOwnPerks(slug) {
  var name = (slug || "").charAt(0).toUpperCase() + (slug || "").slice(1);
  var existing = document.getElementById("ownPerksModal");
  if (existing) existing.remove();
  
  var html = '<div id="ownPerksModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center">' +
    '<div style="background:#1a1028;border:2px solid #e8c45a;border-radius:16px;padding:24px;max-width:360px;width:90%;text-align:center">' +
    '<div style="font-size:18px;font-weight:bold;color:#e8c45a;margin-bottom:16px">OWN PERKS · ' + name + '</div>' +
    '<div style="text-align:left;color:#fff;font-size:14px;line-height:1.6;margin-bottom:20px">' +
    '<div style="margin-bottom:8px">✓ Free use at current clothes</div>' +
    '<div style="margin-bottom:8px">✓ Start higher (L2–L4 based on nights)</div>' +
    '<div style="margin-bottom:8px">✓ Golden neon on her page</div>' +
    '<div style="margin-bottom:8px">✓ No Combined cap</div>' +
    '<div style="margin-bottom:8px">✓ Request stills anytime</div>' +
    '<div>✓ Clock and strikes stay</div>' +
    '</div>' +
    '<div style="display:flex;gap:12px;justify-content:center">' +
    '<button id="ownPerksClose" style="padding:10px 20px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer">Close</button>' +
    '<button id="ownPerksDisown" style="padding:10px 20px;background:#c44;color:#fff;border:none;border-radius:8px;cursor:pointer">Disown</button>' +
    '</div></div></div>';
  
  document.body.insertAdjacentHTML("beforeend", html);
  
  document.getElementById("ownPerksClose").onclick = function() {
    document.getElementById("ownPerksModal").remove();
  };
  
  document.getElementById("ownPerksDisown").onclick = function() {
    if (confirm("Disown " + name + "? You will lose ownership benefits.")) {
      disownModel(slug);
    }
  };
  
  document.getElementById("ownPerksModal").onclick = function(e) {
    if (e.target.id === "ownPerksModal") e.target.remove();
  };
}
window.openOwnPerks = openOwnPerks;

function disownModel(slug) {
  var acc = null;
  try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
  if (!acc || !acc.id) return;
  var cfg = window.DDS_SUPABASE || {};
  if (!cfg.url || !cfg.anon) return;
  var root = String(cfg.url).replace(/\/$/, "");
  
  fetch(root + "/rest/v1/rpc/desk_disown", {
    method: "POST",
    headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
    body: JSON.stringify({ p_name: acc.username || acc.id, p_model: slug })
  }).then(function(r) { return r.json(); }).then(function(data) {
    document.getElementById("ownPerksModal").remove();
    // Clear local ownership
    try {
      var owns = (localStorage.getItem("dds_owns") || "").toLowerCase().split(/[,|\s]+/).filter(Boolean);
      owns = owns.filter(function(s) { return s !== slug.toLowerCase(); });
      localStorage.setItem("dds_owns", owns.join(","));
      if (acc.owns) {
        acc.owns = owns.join(",");
        localStorage.setItem("dds_account", JSON.stringify(acc));
      }
    } catch (e) {}
    location.reload();
  }).catch(function() {
    alert("Could not disown. Try again.");
  });
}
window.disownModel = disownModel;

// Own Perks click handler
document.addEventListener("click", function(e) {
  var a = e.target.closest("a[data-own-dps]");
  if (!a) return;
  var slug = (a.getAttribute("data-own-dps") || "").toLowerCase();
  if (!slug) return;
  if (a.textContent.toLowerCase().indexOf("perks") !== -1) {
    e.preventDefault();
    e.stopPropagation();
    openOwnPerks(slug);
  }
}, true);
