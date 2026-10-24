(function () {
  function page() {
    return (location.pathname.split("/").pop() || "").toLowerCase();
  }
  function readUser() {
    try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; }
  }
  function defaultFace(seed) {
    seed = encodeURIComponent(String(seed || "house").replace(/[^A-Za-z0-9_-]/g, "") || "house");
    return "https://api.dicebear.com/9.x/open-peeps/svg?seed=" + seed + "&gender=male&face=angryWithFamily,calm,cute,driven,oldie,smileLoved,serious";
  }
  function wipeSession() {
    try { localStorage.removeItem("dds_account"); } catch (err) {}
    try { localStorage.removeItem("dds_admin_until"); sessionStorage.removeItem("dds_admin_until"); } catch (err) {}
    try { localStorage.removeItem("dds_admin_ok"); sessionStorage.removeItem("dds_admin_ok"); } catch (err) {}
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (/^(sb-|supabase)|auth-token|dds_account|dds_admin/i.test(k)) localStorage.removeItem(k);
      });
    } catch (err) {}
    try { sessionStorage.removeItem("dds_admin_until"); sessionStorage.removeItem("dds_admin_ok"); } catch (err) {}
  }
  function loadSb(cb) {
    if (window.supabase) { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }
  function signOut(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    wipeSession();
    if (window.DDS_paintAccount) window.DDS_paintAccount();
    loadSb(function () {
      try {
        if (window.supabase && window.DDS_SUPABASE) {
          var c = window.supabase.createClient(window.DDS_SUPABASE.url, window.DDS_SUPABASE.anon);
          c.auth.signOut().catch(function () {}).finally(function () {
            wipeSession();
            location.href = "index.html?out=" + Date.now();
          });
          return;
        }
      } catch (err) {}
      location.href = "index.html?out=" + Date.now();
    });
  }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("a.dds-logout, button.dds-logout");
    if (!t) return;
    signOut(e);
  }, true);
  function ensureOut(login) {
    var next = login.nextElementSibling;
    if (next && next.classList.contains("dds-logout")) {
      next.setAttribute("href", "index.html");
      next.setAttribute("role", "button");
      return next;
    }
    var a = document.createElement("a");
    a.className = "dds-logout";
    a.href = "index.html";
    a.setAttribute("role", "button");
    a.className = (a.className || "") + " dds-out";
    a.textContent = "Sign out";
    login.parentNode.insertBefore(a, login.nextSibling);
    return a;
  }
  function paint() {
    var u = readUser();
    var inYes = !!(u && (u.id || u.username));
    var deskOn = false;
    try { deskOn = Number(localStorage.getItem("dds_admin_until") || sessionStorage.getItem("dds_admin_until") || 0) > Date.now(); } catch (e) {}
    document.querySelectorAll(".dds-login").forEach(function (a) {
      if (a.closest && a.closest(".dds-drawer")) return;
      if (a.getAttribute("data-dup") === "1") return;
      a.setAttribute("href", "account.html");
      a.classList.toggle("on", inYes);
      if (inYes) {
        var face = u.avatar_url || defaultFace(u.username || u.email || "house");
        var name = u.nickname || u.username || "Account";
        var pts = Number(u.dps || 0);
        var info = window.DDS_dpsStatusFromPts ? window.DDS_dpsStatusFromPts(pts) : { key: "", tag: "", label: "" };
        var key = info.key === "member" ? "" : info.key;
        var tag = info.key === "member" ? "" : info.tag;
        var st = info.label || "";
        var cls = key ? "dds-tier-" + key : "";
        a.className = ("dds-login on " + cls).trim();
        a.innerHTML = '<img class="dds-face" alt="" src="' + face + '" onerror="this.onerror=null;this.src=\'' + defaultFace(u.username || "house") + '\'"/> <span>Account</span>' +
          (tag ? ' <em class="dds-tier">' + tag + "</em>" : "");
        a.title = name + (st ? " · " + st : "");
      } else {
        a.textContent = "Login";
        a.removeAttribute("title");
      }
      var out = ensureOut(a);
      out.style.display = inYes ? "" : "none";
    });
  }
  function showIdlePop() {
    if (document.getElementById("dds-idle-pop")) return;
    var pop = document.createElement("div");
    pop.id = "dds-idle-pop";
    pop.className = "dds-mail-pop";
    pop.innerHTML = "<b>Re-verify to see her</b><p>Five days with no visit, or no room request. Her page stays closed until you re-verify. Same lock as a guest.</p><a href='account.html'>Re-verify</a>";
    document.body.appendChild(pop);
  }
  function markVerified(acc, ok) {
    acc.verified = !!ok;
    if (ok) {
      try { localStorage.removeItem("dds_idle"); } catch (e) {}
    }
    try { localStorage.setItem("dds_account", JSON.stringify(acc)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("dds-verified", { detail: { verified: !!ok } })); } catch (e) {}
    paint();
  }
  function pullVerified(cb) {
    var acc = readUser();
    if (!acc || !acc.id) { if (cb) cb(false); return; }
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url) { if (cb) cb(!!acc.verified); return; }
    loadSb(function () {
      try {
        if (!window.supabase) { if (cb) cb(!!acc.verified); return; }
        var c = window.supabase.createClient(cfg.url, cfg.anon);
        c.auth.getSession().then(function (s) {
          var token = s && s.data && s.data.session && s.data.session.access_token;
          var bearer = token || cfg.anon;
          return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_touch", {
            method: "POST",
            headers: { apikey: cfg.anon, Authorization: "Bearer " + bearer, "Content-Type": "application/json" },
            body: JSON.stringify({ p_id: acc.id })
          }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (touch) {
            if (touch && touch.idle) {
              acc.activate_asked = false;
              try { localStorage.setItem("dds_idle", "1"); } catch (e) {}
              markVerified(acc, false);
              showIdlePop();
            } else if (touch && touch.ok) {
              markVerified(acc, !!touch.verified);
            }
            return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/profiles?id=eq." + encodeURIComponent(acc.id) + "&select=verified,activate_asked,username,nickname,avatar_url", {
              headers: { apikey: cfg.anon, Authorization: "Bearer " + token }
            }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
              var row = (rows && rows[0]) || null;
              if (row) {
                acc.activate_asked = !!row.activate_asked;
                if (row.username) acc.username = row.username;
                if (row.nickname) acc.nickname = row.nickname;
                if (row.avatar_url) acc.avatar_url = row.avatar_url;
                if (!row.verified) {
                  try { localStorage.setItem("dds_idle", "1"); } catch (e) {}
                }
                markVerified(acc, !!row.verified);
              }
              if (cb) cb(!!acc.verified);
            });
          });
        }).catch(function () { if (cb) cb(!!acc.verified); });
      } catch (e) { if (cb) cb(!!acc.verified); }
    });
  }
  window.DDS_account = readUser;
  window.DDS_paintAccount = paint;
  document.addEventListener("dds-cfg", paint);
  if (window.DDS_CFG_READY && window.DDS_CFG_READY.then) window.DDS_CFG_READY.then(paint);
  window.DDS_signOut = signOut;
  window.DDS_defaultFace = defaultFace;
  window.DDS_pullVerified = pullVerified;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { paint(); pullVerified(); });
  else { paint(); pullVerified(); }
  setInterval(function () {
    var u = readUser();
    if (u && u.id && !u.verified) pullVerified();
  }, 8000);
})();
