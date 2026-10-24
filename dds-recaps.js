(function () {
  var cfg = window.DDS_SUPABASE || {
    url: "https://axavugukoesqkfykprur.supabase.co",
    anon: "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I"
  };

  function pageSlug() {
    var q = (new URLSearchParams(location.search).get("slut") || "").toLowerCase().trim();
    if (q) return q;
    return (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
  }

  function restRpc(name, body) {
    return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
  }

  function hostBox() {
    var box = document.getElementById("last-rooms");
    if (!box) {
      box = document.createElement("section");
      box.id = "last-rooms";
    }
    box.hidden = false;
    box.className = "fav-pride";
    var hero = document.querySelector("article.profile-hero") || document.querySelector(".profile-hero");
    if (hero && hero.parentNode) {
      if (box.parentNode !== hero.parentNode || box.previousElementSibling !== hero) {
        hero.parentNode.insertBefore(box, hero.nextSibling);
      }
    } else if (!box.parentNode) {
      var main = document.querySelector("main");
      if (main) main.insertBefore(box, main.firstChild);
    }
    return box;
  }

  function claimChip(f, nights) {
    var st = String(f.status || "");
    var hasStatus = st && !/^\d+$/.test(st);
    var cls = hasStatus && window.DDS_statusClass ? window.DDS_statusClass(st) : "";
    var pretty = hasStatus ? st.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^Desire\s+/i, "") : "";
    var who = String(f.name || f.username || "Member").replace(/</g, "");
    var rank = pretty ? '<span class="status-flash ' + cls + '">' + pretty + "</span>" : "";
    var night = nights ? '<span class="fan-nights">' + (f.sessions || 0) + " nights</span>" : "";
    var inner = '<span class="fan-who">' + who + "</span>" + rank + night;
    if (f.username) return '<a class="fan-chip" data-player="' + String(f.username).replace(/"/g, "") + '" href="member.html?u=' + encodeURIComponent(f.username) + '">' + inner + "</a>";
    return '<span class="fan-chip">' + inner + "</span>";
  }

  function paint(fav, own) {
    var box = hostBox();
    if (!box) return;
    // model_favorites may return {count,fans} or a raw array of fans
    var fans = [];
    var n = 0;
    if (Array.isArray(fav)) {
      fans = fav;
      n = fav.length;
    } else if (fav && typeof fav === "object") {
      fans = fav.fans || [];
      n = Number(fav.count || fans.length || 0);
    }
    var names = fans.map(function (f) { return claimChip(f, false); }).join("");
    var owners = (own && own.owners) || [];
    box.innerHTML =
      '<div class="claim-grid">' +
        '<article class="claim-card">' +
          '<p class="section-label">Favorites</p>' +
          '<h2>House favorites <b>' + n + "</b></h2>" +
          "<p class='claim-rule'>Men waiting on her. A 20-day claim. She stays on his card.</p>" +
          (names ? '<p class="fan-list">' + names + "</p>" : "<p class='hint'>Nobody has locked her yet.</p>") +
        "</article>" +
        '<article class="claim-card">' +
          '<p class="section-label">Owned</p>' +
          "<h2>Owned by <b>" + owners.length + "</b></h2>" +
          "<p class='claim-rule'>Men who have had her. Silver five nights. Gold and above three.</p>" +
          (owners.length ? '<p class="fan-list">' + owners.map(function (f) { return claimChip(f, true); }).join("") + "</p>" : "<p class='hint'>Nobody holds her yet.</p>") +
        "</article>" +
        '<article class="claim-card" id="fanClubCard">' +
          '<p class="section-label">Fans</p>' +
          "<h2>Fans <b id='fanClubCount'>0</b></h2>" +
          "<p class='claim-rule'>Name on her profile. Extra still. +15 min. Heart counts as 2.</p>" +
          "<p class='fan-list' id='fanClubList'><span class='hint'>Nobody has joined yet.</span></p>" +
        "</article>" +
      "</div>";
    loadFans(pageSlug());
  }

  function loadFans(slug) {
    var card = document.getElementById("fanClubCard");
    if (!card) return;
    restRpc("model_fan_list", { p_model: slug }).then(function (rows) {
      rows = Array.isArray(rows) ? rows : [];
      var n = rows.length;
      var countEl = document.getElementById("fanClubCount");
      var listEl = document.getElementById("fanClubList");
      if (countEl) countEl.textContent = n;
      if (!listEl) return;
      if (!n) { listEl.innerHTML = "<span class='hint'>Nobody has joined yet.</span>"; return; }
      var max = 8;
      var show = rows.slice(0, max);
      var more = n > max ? " · +" + (n - max) + " more" : "";
      listEl.innerHTML = show.map(function (r) {
        var who = String(r.username || r.name || "Member").replace(/</g, "");
        var link = r.username ? '<a class="fan-chip" href="member.html?u=' + encodeURIComponent(r.username) + '">' + who + "</a>" : '<span class="fan-chip">' + who + "</span>";
        return link;
      }).join("") + (more ? "<span class='hint'>" + more + "</span>" : "");
    }).catch(function () {});
  }

  var slug = pageSlug();
  if (!slug || slug === "index") return;  // trainers also show favorites
  if (!document.querySelector(".profile-hero, .score-bar")) return;

  paint({ count: 0, fans: [] }, { owners: [] });
  Promise.all([
    restRpc("model_favorites", { p_model: slug }),
    restRpc("model_owned", { p_model: slug })
  ]).then(function (pair) {
    var fav = pair[0] || {};
    var own = pair[1] || {};
    // Fallback: if RPC returns empty, use board favorites count
    if (!fav.count && !fav.fans || (fav.fans && !fav.fans.length)) {
      var board = (window.DDS_BOARD || []).filter(function(r){ return String(r.slut||"").toLowerCase() === slug; })[0];
      if (board && board.favorites) {
        fav = { count: Number(board.favorites) || 0, fans: fav.fans || [] };
      }
    }
    paint(fav, own);
  }).catch(function(){
    // On error, still try board
    var board = (window.DDS_BOARD || []).filter(function(r){ return String(r.slut||"").toLowerCase() === slug; })[0];
    var n = board && board.favorites ? Number(board.favorites) : 0;
    paint({ count: n, fans: [] }, { owners: [] });
  });
})();
