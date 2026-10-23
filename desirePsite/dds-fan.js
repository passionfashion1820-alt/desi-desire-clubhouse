/* Fan Club — hero button + popup. Cost: base 100 + 25% per rank step. */
(function () {
  var SLUGS = ["preethi","meghana","esther","meenakshi","tharini","ayesha","diya","natasha","kiara","kavya","lahari","sravani","navya","simran","chandana","aleena"];
  function slugFromPage() {
    var m = (location.pathname || "").match(/\/([a-z0-9_-]+)\.html$/i) || (location.pathname || "").match(/\/([a-z0-9_-]+)$/i);
    var s = m ? m[1].toLowerCase() : "";
    return SLUGS.indexOf(s) !== -1 ? s : "";
  }
  function me() { try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; } }
  function cfg() { return window.DDS_SUPABASE || { url: "https://axavugukoesqkfykprur.supabase.co", anon: "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I" }; }
  function headers() { var c = cfg(); return { apikey: c.anon, Authorization: "Bearer " + c.anon, "Content-Type": "application/json" }; }
  function fanCfg() {
    var c = (window.DDS_CFG && window.DDS_CFG.fan_club) || {};
    return {
      dps: Number(c.dps != null ? c.dps : 100),
      nights: Number(c.nights != null ? c.nights : 0),
      show: Number(c.show != null ? c.show : 8),
      still: c.still !== false,
      time: c.time !== false,
      heart: c.heart !== false
    };
  }
  function rankStep(slug) {
    if (window.ownRankStep) return window.ownRankStep(slug);
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
  function fanCost(slug) {
    var fc = fanCfg();
    var rs = rankStep(slug);
    var base = Number(fc.dps) || 200;
    var premium = Math.round(base * 0.25 * rs.step);
    var cost = base + premium;
    return { cost: cost, base: base, premium: premium, step: rs.step, label: rs.label };
  }
  function paint(list, joined, nightsOnDoor) {
    var box = document.getElementById("fan-club");
    if (!box) return;
    var fc = fanCfg();
    var all = Array.isArray(list) ? list : [];
    var shown = all.slice(0, fc.show);
    var names = shown.map(function (r) { return r.username || "Member"; }).join(", ");
    var extra = all.length > fc.show ? " +" + (all.length - fc.show) + " more" : "";
    var perks = [
      "Starts at Level 1 every time as Known status",
      "1.5 times speed",
      "+15 minutes once per night with her",
      "Personalized profile page with more stills"
    ];
    var cost = fanCost(slugFromPage());
    var costLine = cost.cost + " DPS";
    if (fc.nights > 0) costLine += " or " + fc.nights + " nights on her door";
    var label = joined ? "Leave fan club" : ("Join · " + costLine);
    box.innerHTML =
      '<p class="section-label">Fan Club</p>' +
      '<h2 class="section-title">Her fans <b>' + all.length + '</b></h2>' +
      '<div class="card">' +
        '<p class="about-text">' + (names || "No fans yet.") + extra + '</p>' +
        (perks.length ? '<p class="hint" style="margin-top:.4rem">' + perks.join(" · ") + '</p>' : '') +
        '<p style="margin-top:.8rem"><button id="fan-btn" type="button" style="padding:.55rem 1.1rem;border:1px solid #b794f6;background:#2a1410;color:#edd8ff;border-radius:8px;cursor:pointer;font-weight:600">' +
          label +
        '</button> <span id="fan-msg" style="margin-left:.6rem;color:#b9a68a"></span></p>' +
        (nightsOnDoor != null ? '<p class="hint" style="margin-top:.4rem">You have ' + nightsOnDoor + ' nights on her door.</p>' : '') +
      '</div>';
  }
  function load() {
    var slug = slugFromPage();
    if (!slug) return;
    var c = cfg();
    var acc = me();
    fetch(c.url + "/rest/v1/rpc/model_fan_list", { method: "POST", headers: headers(), body: JSON.stringify({ p_model: slug }) })
      .then(function (r) { return r.json(); })
      .then(function (list) {
        list = Array.isArray(list) ? list : [];
        var joined = acc && list.some(function (r) { return (r.username || "").toLowerCase() === (acc.username || "").toLowerCase(); });
        var nights = 0;
        if (acc && acc.id) {
          fetch(c.url + "/rest/v1/player_sessions?player_id=eq." + acc.id + "&model=eq." + slug + "&select=id", { headers: headers() })
            .then(function (r) { return r.json(); })
            .then(function (rows) { nights = Array.isArray(rows) ? rows.length : 0; paint(list, joined, nights); bind(slug, joined, nights); themeFan(slug, joined); })
            .catch(function () { paint(list, joined, 0); bind(slug, joined, 0); });
        } else {
          paint(list, joined, null);
          bind(slug, joined, 0);
        }
      }).catch(function () { paint([], false, null); });
  }
  function bind(slug, joined, nights) {
    var btn = document.getElementById("fan-btn");
    if (btn) btn.onclick = function () { openFanModal(slug, joined); };
    document.querySelectorAll("[data-fan-club]").forEach(function (el) {
      var own = isOwner(slug);
      el.textContent = own ? "Fan perks open" : (joined ? "Leave fan club" : "Join her fan club");
      el.onclick = function (ev) { ev.preventDefault(); openFanModal(slug, joined); };
    });
    paintFanBanner(slug, joined);
  }
  function flashTitle(prefix) {
    var base = document.title.replace(/^(FAN PAGE|OWN PAGE) · /, "");
    var on = true;
    if (window._ddsTitleFlash) clearInterval(window._ddsTitleFlash);
    window._ddsTitleFlash = setInterval(function () {
      document.title = on ? (prefix + " · " + base) : base;
      on = !on;
    }, 700);
  }
  function paintFanBanner(slug, isFan) {
    var old = document.getElementById("fan-page-banner");
    if (old) old.remove();
    if (!isFan) return;
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var bar = document.createElement("div");
    bar.id = "fan-page-banner";
    bar.style.cssText = "background:linear-gradient(90deg,#4a1a6b,#c084fc,#4a1a6b);background-size:200% 100%;animation:fanFlash 1.4s ease-in-out infinite;border-bottom:2px solid #e9d5ff;color:#fff;text-align:center;padding:.6rem 1rem;font-size:1.05rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 0 12px #c084fc";
    bar.textContent = "FAN PAGE · " + name;
    var hero = document.querySelector(".profile-hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(bar, hero);
    else document.body.insertBefore(bar, document.body.firstChild);
    if (!document.getElementById("dds-flash-style")) {
      var s = document.createElement("style");
      s.id = "dds-flash-style";
      s.textContent = "@keyframes fanFlash{0%,100%{background-position:0% 50%;filter:brightness(1)}50%{background-position:100% 50%;filter:brightness(1.25)}}@keyframes ownFlash{0%,100%{background-position:0% 50%;filter:brightness(1)}50%{background-position:100% 50%;filter:brightness(1.3)}}";
      document.head.appendChild(s);
    }
    flashTitle("FAN PAGE");
  }
  function paintOwnBanner(slug) {
    var old = document.getElementById("own-page-banner");
    if (old) old.remove();
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var bar = document.createElement("div");
    bar.id = "own-page-banner";
    bar.style.cssText = "background:linear-gradient(90deg,#6b1a4a,#f472b6,#6b1a4a);background-size:200% 100%;animation:ownFlash 1.4s ease-in-out infinite;border-bottom:2px solid #fbcfe8;color:#fff;text-align:center;padding:.6rem 1rem;font-size:1.05rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 0 12px #f472b6";
    bar.textContent = "OWN PAGE · " + name;
    var hero = document.querySelector(".profile-hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(bar, hero);
    else document.body.insertBefore(bar, document.body.firstChild);
    if (!document.getElementById("dds-flash-style")) {
      var s = document.createElement("style");
      s.id = "dds-flash-style";
      s.textContent = "@keyframes fanFlash{0%,100%{background-position:0% 50%;filter:brightness(1)}50%{background-position:100% 50%;filter:brightness(1.25)}}@keyframes ownFlash{0%,100%{background-position:0% 50%;filter:brightness(1)}50%{background-position:100% 50%;filter:brightness(1.3)}}";
      document.head.appendChild(s);
    }
    document.title = "OWN PAGE · " + document.title.replace(/^(FAN PAGE|OWN PAGE) · /, "");
  }
  function openFanModal(slug, joined) {
    var acc = me();
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var cost = fanCost(slug);
    var myPts = (acc && Number(acc.dps)) || 0;
    var enough = myPts >= cost.cost;
    var old = document.getElementById("ddsFanModal");
    if (old) old.remove();
    var box = document.createElement("div");
    box.id = "ddsFanModal";
    box.style.cssText = "position:fixed;inset:0;z-index:95;background:rgba(8,4,12,.72);display:flex;align-items:center;justify-content:center;padding:1rem";
    var perks = [
      "Starts at Level 1 every time as Known status",
      "1.5 times speed",
      "+15 minutes once per night with her",
      "Personalized profile page with more stills"
    ];
    var start = "Starts at Level 1 every time as Known status and with 1.5 times speed.";
    var costLine = "Base <b>" + cost.base + "</b> DPS";
    if (cost.premium > 0) costLine += " + <b>" + cost.premium + "</b> (" + cost.label + " slab)";
    costLine += " = <b>" + cost.cost + "</b> DPS.";
    var ptsLine = enough
      ? ("You have <b>" + myPts + "</b> DPS.")
      : ("Your DPS: <b>" + myPts + "</b>. You need <b>" + cost.cost + "</b>.");
    var checks = perks.map(function (p) {
      return '<label style="display:block;margin:.35rem 0;font-size:.9rem"><input type="checkbox" checked disabled style="margin-right:.45rem">' + p + '</label>';
    }).join("");
    var btn = joined
      ? '<button type="button" id="ddsFanLeave" style="flex:1;min-width:120px;background:#4a2c5f;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Leave</button>'
      : (enough
        ? '<button type="button" id="ddsFanJoin" style="flex:1;min-width:120px;background:#b794f6;color:#1a0a0a;padding:.5rem .8rem;border-radius:8px;border:0;font-weight:700">Join · ' + cost.cost + ' DPS</button>'
        : '<button type="button" id="ddsFanEarn" style="flex:1;min-width:120px;background:#6b3fa0;color:#fff;padding:.5rem .8rem;border-radius:8px;border:0">Earn DPS</button>');
    box.innerHTML = '<div style="max-width:440px;background:#1a1020;border:1px solid #6b3fa0;border-radius:14px;padding:1.1rem 1.2rem;color:#f3e9d7">' +
      '<p style="margin:0 0 .4rem;font-size:1.1rem;color:#e9d5ff">Join ' + name + '\'s fan club</p>' +
      '<p style="margin:0 0 .5rem;font-size:.88rem;color:#b9a892">Perks</p>' +
      checks +
      '<p style="margin:.6rem 0 .4rem;font-size:.88rem;color:#e9d5ff">' + start + '</p>' +
      '<p style="margin:0 0 .3rem;font-size:.9rem">' + costLine + '</p>' +
      '<p style="margin:0 0 .7rem;font-size:.85rem;color:#b9a892">' + ptsLine + '</p>' +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' + btn +
        '<button type="button" id="ddsFanClose" style="flex:1;min-width:100px;background:#2a1a32;color:#fff;padding:.5rem .8rem;border-radius:8px;border:1px solid #4a2c5f">Close</button>' +
      '</div><p id="ddsFanMsg" style="margin:.6rem 0 0;font-size:.82rem;color:#e8c4a8"></p></div>';
    document.body.appendChild(box);
    document.getElementById("ddsFanClose").onclick = function () { box.remove(); };
    box.onclick = function (ev) { if (ev.target === box) box.remove(); };
    var join = document.getElementById("ddsFanJoin");
    if (join) join.onclick = function () { doJoin(slug, true); };
    var leave = document.getElementById("ddsFanLeave");
    if (leave) leave.onclick = function () { doJoin(slug, false); };
    var earn = document.getElementById("ddsFanEarn");
    if (earn) earn.onclick = function () { box.remove(); if (window.DDS_openEarn) window.DDS_openEarn(); };
  }
  function doJoin(slug, add) {
    var acc = me();
    var msg = document.getElementById("ddsFanMsg");
    if (!acc || !acc.id || !acc.username) { if (msg) msg.textContent = "Log in first."; return; }
    var cost = fanCost(slug);
    var c = cfg();
    if (add) {
      if (Number(acc.dps || 0) < cost.cost) { if (msg) msg.textContent = "Need " + cost.cost + " DPS."; return; }
      if (msg) msg.textContent = "Spending…";
      fetch(c.url + "/rest/v1/rpc/spend_dps", {
        method: "POST", headers: headers(),
        body: JSON.stringify({ p_player: acc.id, p_amount: cost.cost, p_reason: "fan-" + slug })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.error) || "Could not spend.");
        if (j.left != null) { acc.dps = j.left; localStorage.setItem("dds_account", JSON.stringify(acc)); }
        return fetch(c.url + "/rest/v1/rpc/desk_set_fan", {
          method: "POST", headers: headers(),
          body: JSON.stringify({ p_username: acc.username, p_model: slug, p_add: true })
        });
      }).then(function (r) { return r.json(); }).then(function (g) {
        if (!g || !g.ok) throw new Error((g && g.error) || "Could not join.");
        if (msg) msg.textContent = "Joined.";
        setTimeout(function () { document.getElementById("ddsFanModal") && document.getElementById("ddsFanModal").remove(); load(); }, 600);
      }).catch(function (e) {
        fetch(c.url + "/rest/v1/rpc/refund_dps", {
          method: "POST", headers: headers(),
          body: JSON.stringify({ p_player: acc.id, p_amount: cost.cost, p_reason: "refund-fan-" + slug })
        }).then(function (r) { return r.json(); }).then(function (rf) {
          if (rf && rf.left != null) { acc.dps = rf.left; localStorage.setItem("dds_account", JSON.stringify(acc)); }
          if (msg) msg.textContent = String(e.message || e) + " DPS returned.";
        }).catch(function () { if (msg) msg.textContent = String(e.message || e); });
      });
    } else {
      if (msg) msg.textContent = "Leaving…";
      fetch(c.url + "/rest/v1/rpc/desk_set_fan", {
        method: "POST", headers: headers(),
        body: JSON.stringify({ p_username: acc.username, p_model: slug, p_add: false })
      }).then(function () { if (msg) msg.textContent = "Left."; setTimeout(function () { document.getElementById("ddsFanModal") && document.getElementById("ddsFanModal").remove(); load(); }, 400); });
    }
  }

  function themeFan(slug, isFan) {
    var hero = document.querySelector(".profile-hero");
    if (!hero) return;
    if (isFan) {
      hero.classList.add("fan-theme");
      document.body.classList.add("is-fan");
      showFanStills(slug);
    } else {
      hero.classList.remove("fan-theme");
      document.body.classList.remove("is-fan");
      showLockedStills(slug);
    }
  }
  function placeFanBox(box) {
    var hero = document.querySelector(".profile-hero");
    if (hero && hero.parentNode) {
      hero.parentNode.insertBefore(box, hero.nextSibling);
      return;
    }
    var rooms = document.getElementById("last-rooms");
    if (rooms && rooms.parentNode) {
      rooms.parentNode.insertBefore(box, rooms);
      return;
    }
    document.querySelector("main") && document.querySelector("main").appendChild(box);
  }
  function showFanStills(slug) {
    var art = window.DDS_ART && window.DDS_ART[slug];
    if (!art) return;
    var urls = [art.fan1, art.fan2, art.fan3].filter(Boolean);
    if (!urls.length) return;
    var old = document.getElementById("fan-stills");
    if (old) old.remove();
    var box = document.createElement("section");
    box.id = "fan-stills";
    box.className = "fan-stills";
    box.innerHTML = '<p class="section-label">For fans</p><div class="fan-still-row">' +
      urls.map(function (u) { return '<img src="' + u + '" alt="Fan still" data-full="' + u + '"/>'; }).join("") +
      '</div>';
    placeFanBox(box);
    box.querySelectorAll(".fan-still-row img").forEach(function (img) {
      img.onclick = function () {
        var full = img.getAttribute("data-full") || img.src;
        var lb = document.createElement("div");
        lb.className = "fan-lightbox";
        lb.innerHTML = '<img src="' + full + '" alt=""/>';
        lb.onclick = function () { lb.remove(); };
        document.body.appendChild(lb);
      };
    });
  }
  function showLockedStills(slug) {
    var art = window.DDS_ART && window.DDS_ART[slug];
    if (!art) return;
    var urls = [art.fan1, art.fan2, art.fan3].filter(Boolean);
    if (!urls.length) return;
    var old = document.getElementById("fan-stills");
    if (old) old.remove();
    var box = document.createElement("section");
    box.id = "fan-stills";
    box.className = "fan-stills";
    box.innerHTML = '<p class="section-label">For fans</p>' +
      '<div class="fan-still-row locked" style="position:relative">' +
        urls.map(function (u) { return '<img src="' + u + '" alt="Fan still"/>'; }).join("") +
        '<div class="fan-lock-overlay" data-fan-club="' + slug + '">' +
          '<span>🔒 Join her fan club</span>' +
        '</div>' +
      '</div>';
    placeFanBox(box);
    var overlay = box.querySelector(".fan-lock-overlay");
    if (overlay) overlay.onclick = function (ev) { ev.preventDefault(); openFanModal(slug, false); };
  }
  function isOwner(slug) {
    slug = String(slug || "").toLowerCase();
    if (!slug) return false;
    try {
      var raw = "";
      var acc = null;
      try { acc = JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) {}
      if (acc && (acc.owns || acc.owned)) raw = acc.owns || acc.owned;
      if (!raw || raw === "none") raw = localStorage.getItem("dds_owns") || "";
      var list = String(raw).toLowerCase().split(/[,|\s]+/).filter(Boolean);
      if (list.indexOf(slug) !== -1) return true;
    } catch (e) {}
    return (window.DDS_OWN_OF || []).indexOf(slug) !== -1;
  }
  function pullOwn(slug) {
    var acc = me();
    if (!acc || !acc.id) return;
    var c = cfg();
    fetch(c.url + "/rest/v1/rpc/player_owned", {
      method: "POST", headers: headers(),
      body: JSON.stringify({ p_id: acc.id })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      data = data || {};
      var models = data.models || [];
      var owns = models.map(function (m) { return String(m.slug || "").toLowerCase(); }).filter(Boolean);
      window.DDS_OWN_OF = owns;
      try {
        localStorage.setItem("dds_owns", owns.join(","));
        acc.owns = owns.join(",");
        localStorage.setItem("dds_account", JSON.stringify(acc));
      } catch (e) {}
      if (owns.indexOf(slug) !== -1) {
        document.body.classList.add("is-owner");
        document.body.classList.add("is-fan");
        showFanStills(slug);
        showOwnerStills(slug);
        paintOwnBanner(slug);
        if (window.DDS_paintOwnBanner) window.DDS_paintOwnBanner();
        document.title = "OWN PAGE · " + document.title.replace(/^(FAN PAGE|OWN PAGE) · /, "");
        // Update Own button label to Own Perks
        document.querySelectorAll("a[data-own-dps]").forEach(function (a) {
          if (String(a.getAttribute("data-own-dps") || "").toLowerCase() === slug) {
            a.textContent = "Own Perks";
          }
        });
      }
    }).catch(function () {});
  }
  function showOwnedSection(slug) {
    if (!isOwner(slug)) return;
    var old = document.getElementById("owned-section");
    if (old) old.remove();
    var box = document.createElement("section");
    box.id = "owned-section";
    box.innerHTML =
      '<p class="section-label">Owned</p>' +
      '<h2 class="section-title">You own her</h2>' +
      '<div class="card"><p class="about-text">This door is yours. Free use at current clothes. Clock and strikes stay.</p></div>';
    var fan = document.getElementById("fan-club");
    if (fan && fan.parentNode) fan.parentNode.insertBefore(box, fan);
    else document.body.appendChild(box);
  }
  function showOwnerStills(slug) {
    var art = window.DDS_ART && window.DDS_ART[slug];
    if (!art || !isOwner(slug)) return;
    var urls = [art.own1, art.own2, art.own3, art.own4, art.own5].filter(Boolean);
    if (!urls.length) return;
    var old = document.getElementById("owner-stills");
    if (old) old.remove();
    var box = document.createElement("section");
    box.id = "owner-stills";
    box.className = "fan-stills";
    box.innerHTML = '<p class="section-label">For owner</p><div class="fan-still-row">' +
      urls.map(function (u) { return '<img src="' + u + '" alt="Owner still" data-full="' + u + '"/>'; }).join("") +
      '</div>';
    placeFanBox(box);
    box.querySelectorAll(".fan-still-row img").forEach(function (img) {
      img.onclick = function () {
        var full = img.getAttribute("data-full") || img.src;
        var lb = document.createElement("div");
        lb.className = "fan-lightbox";
        lb.innerHTML = '<img src="' + full + '" alt=""/>';
        lb.onclick = function () { lb.remove(); };
        document.body.appendChild(lb);
      };
    });
  }
  function paintStills() {
    var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
    var own = isOwner(slug);
    if (own) {
      document.body.classList.add("is-owner");
      document.body.classList.add("is-fan");
    }
    if (document.body.classList.contains("is-fan") || own) showFanStills(slug);
    else showLockedStills(slug);
    if (own) { showOwnedSection(slug); showOwnerStills(slug); }
    pullOwn(slug);
  }
  function start() {
    var ready = window.DDS_CFG_READY && window.DDS_CFG_READY.then ? window.DDS_CFG_READY : Promise.resolve();
    ready.then(load).catch(load);
    setTimeout(paintStills, 800);
    setTimeout(paintStills, 2200);
    document.addEventListener("dds-art-ready", paintStills);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
