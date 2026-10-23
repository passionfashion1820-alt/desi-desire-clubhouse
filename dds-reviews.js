(function () {
  var cfg = window.DDS_SUPABASE || {
    url: "https://axavugukoesqkfykprur.supabase.co",
    anon: "sb_publishable_lTzYnhvWF0JRNnAitqfszw_ctUL1t4I"
  };
  function slug() {
    var q = (new URLSearchParams(location.search).get("slut") || "").toLowerCase().trim();
    if (q) return q;
    return (location.pathname.split("/").pop() || "").replace(/\.html$/i, "").toLowerCase();
  }
  function stars(n) {
    var x = Math.max(0, Math.min(5, Number(n) || 0));
    return "*****".slice(0, x);
  }
  function when(iso) {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch (e) { return ""; }
  }
  function esc(s) {
    return String(s || "").replace(/[&<>]/g, function (ch) {
      if (ch === "&") return "and";
      if (ch === "<") return " ";
      return " ";
    });
  }
  function rest(path) {
    return fetch(String(cfg.url || "").replace(/\/$/, "") + "/rest/v1/" + path, {
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon }
    }).then(function (r) { return r.json(); });
  }
  function host() {
    var box = document.getElementById("profile-talk");
    if (!box) {
      box = document.createElement("section");
      box.id = "profile-talk";
    }
    var after = document.getElementById("last-rooms") || document.querySelector(".fav-pride") || document.querySelector(".score-bar");
    if (after && after.parentNode) after.parentNode.insertBefore(box, after.nextSibling);
    else if (!box.parentNode) {
      var main = document.querySelector("main");
      if (main) main.appendChild(box);
    }
    return box.parentNode ? box : null;
  }
  function paint(revs, wants, allRevs) {
    var box = host();
    if (!box) return;
    var revHtml = revs.length
      ? revs.map(function (r) {
          return "<p class='pr'>" + stars(r.overall) + " · " + esc(r.feedback) + " <span class='meta'>" + when(r.created_at) + "</span></p>";
        }).join("")
      : "<p class='hint'>No written reviews yet.</p>";
    var wantHtml = wants.length
      ? wants.map(function (w) {
          return "<p class='pr'>" + esc(w.need) + " · " + esc(w.want) + " <span class='meta'>" + esc(w.who) + "</span></p>";
        }).join("")
      : "<p class='hint'>No want-her notes yet.</p>";
    box.style.display = "block";
    box.style.margin = "1.2rem 0 1.6rem";
    var allBtn = revs.length > 3 ? "<p style='margin:.6rem 0'><button type='button' id='readAllRevs' style='background:none;border:1px solid var(--gold-dim);color:var(--gold);padding:.35rem .8rem;border-radius:6px;font-size:.78rem;cursor:pointer'>Read her reviews</button></p>" : "";
    box.innerHTML = "";
    box.style.display = "none";
    var btn = document.getElementById("readAllRevs");
    window.DDS_ALL_REVS = allRevs || revs;
    if (btn) btn.onclick = function () { openAll(allRevs || revs); };
  }
  window.DDS_openAllRevs = function () { openAll(window.DDS_ALL_REVS || []); };
  function openAll(revs) {
    var modal = document.getElementById("allRevsModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "allRevsModal";
      modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem";
      modal.innerHTML = "<div style='background:#1a1a1a;border:1px solid var(--gold-dim);border-radius:10px;max-width:640px;width:100%;max-height:80vh;display:flex;flex-direction:column'><div style='padding:.8rem 1rem;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center'><b style='color:var(--gold)'>Her reviews</b><button type='button' id='closeAllRevs' style='background:none;border:0;color:#aaa;font-size:1.2rem;cursor:pointer'>&times;</button></div><div id='allRevsBody' style='overflow-y:auto;padding:1rem'></div></div>";
      document.body.appendChild(modal);
      document.getElementById("closeAllRevs").onclick = function () { modal.style.display = "none"; };
      modal.onclick = function (e) { if (e.target === modal) modal.style.display = "none"; };
    }
    var body = document.getElementById("allRevsBody");
    body.innerHTML = revs.length ? revs.map(function (r) {
      return "<p style='margin:.4rem 0;padding:.5rem 0;border-bottom:1px solid #222'>" + stars(r.overall) + " · " + esc(r.feedback) + " <span style='color:#888;font-size:.75rem'>" + when(r.created_at) + "</span></p>";
    }).join("") : "<p class='hint'>No reviews.</p>";
    modal.style.display = "flex";
  }
  function uniqComments(rows, cap) {
    var seen = {};
    var out = [];
    (rows || []).forEach(function (r) {
      var tx = String(r.feedback || "").trim();
      if (tx.length < 3) return;
      var key = tx.toLowerCase();
      if (seen[key]) return;
      seen[key] = 1;
      out.push(r);
    });
    return cap ? out.slice(0, cap) : out;
  }
  function parseWant(row) {
    var msg = String(row.message || "");
    var need = (msg.match(/Need:\s*([0-9]+\/10)/i) || [])[1] || "";
    var want = (msg.match(/Want:\s*([\s\S]*?)(?:\nState:|$)/i) || [])[1] || "";
    want = String(want || "").replace(/\n+/g, " ").trim();
    if (want.length < 2) return null;
    return { need: need || "-", want: want, who: row.player_name || "member" };
  }

  function run() {
    var s = slug();
    if (!s || s === "index" || s === "anu" || !cfg.url) return;
    if (!document.querySelector(".score-bar, .profile-hero")) return;
    rest("desk_reviews?slut=eq." + encodeURIComponent(s) + "&select=created_at,overall,feedback&order=created_at.desc&limit=500")
      .then(function (rows) {
        if (!Array.isArray(rows) || rows.code) {
          return rest("approved_reviews?slut=eq." + encodeURIComponent(s) + "&select=created_at,overall,feedback&order=created_at.desc&limit=500");
        }
        return rows;
      })
      .then(function (rows) {
        var allRevs = uniqComments(Array.isArray(rows) ? rows : []);
        var revs = allRevs.slice(0, 5);
        return rest("player_feedback?slut=eq." + encodeURIComponent(s) + "&message=ilike.*WANT%20HER*&select=created_at,player_name,message&order=created_at.desc&limit=12")
          .then(function (wrows) {
            var wants = (Array.isArray(wrows) ? wrows : []).map(parseWant).filter(Boolean).slice(0, 5);
            paint(revs, wants, allRevs);
          }, function () { paint(revs, [], allRevs); });
      })
      .catch(function () {
        var box = host();
        if (box) box.innerHTML = "<h2 class='section-title'>Last reviews</h2><p class='hint'>Reviews could not load.</p>";
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 400); });
  else setTimeout(run, 400);
})();
