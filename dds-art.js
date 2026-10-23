(function () {
  var FALLBACK = {"diya": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/diya-1789819555639.jpg?v=1789819555987", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/diya-1789361329815.jpg", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/diya-1789487387146.png"}, "natasha": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/natasha-1789842439983.jpg?v=1789842440282", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/natasha-1789948514082.jpg?v=1789948514598", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/natasha-1789361211562.jpg"}, "esther": {"session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/esther-1789361170829.jpg", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/esther-1789820089101.jpg?v=1789820089367", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/esther-1789361158230.jpg"}, "preethi": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/preethi-1789819775762.jpg?v=1789819776031", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/preethi-1790030273128.jpg?v=1790030273599", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/preethi-1789360978861.jpg"}, "sravani": {"lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/sravani-1789610133523.jpg", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/sravani-1789361065661.jpg", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/sravani-1789361067661.jpg"}, "meghana": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/meghana-1789908996147.jpg?v=1789908996643", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/meghana-1789361030060.jpg", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/meghana-1790028914995.jpg?v=1790028915384"}, "kiara": {"session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/kiara-1789361044978.jpg", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/kiara-1789361047511.jpg", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/kiara-1789944895934.jpg?v=1789944896687"}, "navya": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/navya-1790134263897.jpg?v=1790134264164", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/navya-1790133902689.jpg?v=1790133902929"}, "tharini": {"lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/tharini-1789361196679.jpg", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/7863533c-0b80-4873-83cc-74e156b519c1-f9d780fa-78b8-4633-8a77-26f41ed8ee90.jpg", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/tharini-1789778455075.jpg?v=1789778455404"}, "kavya": {"lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/kavya-1789821946471.jpg?v=1789821946892", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/kavya-1789822097465.jpg?v=1789822097850"}, "simran": {"lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/simran-1790133808077.jpg?v=1790133808522", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/simran-1790134306195.jpg?v=1790134306543"}, "meenakshi": {"session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/meenakshi-1789361077578.jpg", "profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/meenakshi-1789361077578.jpg", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/meenakshi-1789361077578.jpg"}, "lahari": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/lahari-1790135973974.jpg?v=1790135974381", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/lahari-1790136266727.jpg?v=1790136266997"}, "ayesha": {"profile": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/profile/ayesha-1789361109812.jpg", "session": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/session/ayesha-1789361112096.jpg", "lineup": "https://axavugukoesqkfykprur.supabase.co/storage/v1/object/public/dds-art/lineup/ayesha-1790135360398.jpg?v=1790135360702"}};
  var OPEN_ON = { kavya: "2026-09-24", lahari: "2026-09-29", navya: "2026-10-18", simran: "2026-10-23", chandana: "2026-11-10" };
  function doorSoon(slug) {
    slug = String(slug || "").toLowerCase();
    var until = window.DDS_playSoon && window.DDS_playSoon(slug);
    return until === "soon";
  }
  function lureSoon() {
    document.querySelectorAll("img[data-slut]").forEach(function (img) {
      var slug = String(img.getAttribute("data-slut") || "").toLowerCase();
      var host = img.closest("a.poster-card, .portrait, article.profile-hero");
      if (!host) return;
      var stamp = host.querySelector(".art-lure");
      if (!doorSoon(slug) || !img.getAttribute("src")) {
        if (stamp) stamp.remove();
        img.style.filter = "";
        img.style.transform = "";
        return;
      }
      host.classList.remove("no-art");
      host.classList.add("undated-soon");
      host.querySelectorAll(".soon-stamp, .dds-open-on, .dds-live.soon").forEach(function (el) { el.remove(); });
      img.style.opacity = "1";
      img.style.visibility = "visible";
      img.style.filter = "blur(9px) saturate(1.12) brightness(1.05)";
      img.style.transform = "scale(1.08)";
      if (!stamp) {
        stamp = document.createElement("div");
        stamp.className = "art-lure";
        host.appendChild(stamp);
      }
      stamp.textContent = "Image coming soon";
    });
  }
  window.DDS_lureSoon = lureSoon;
  function openLabel(slug) {
    var d = OPEN_ON[slug];
    if (!d) return "";
    try {
      var dt = new Date(d + "T12:00:00");
      var mon = dt.toLocaleString("en-US", { month: "short" });
      return "Opens " + dt.getDate() + " " + mon;
    } catch (e) { return "Opens " + d; }
  }
  window.DDS_ART = FALLBACK;
  window.DDS_THUMBS = window.DDS_THUMBS || {};
  function pick(slug, slots) {
    var m = (window.DDS_ART && window.DDS_ART[slug]) || {};
    for (var i = 0; i < slots.length; i++) {
      var u = m[slots[i]];
      if (u && String(u).indexOf("/art/") === -1) return u;
    }
    for (var j = 0; j < slots.length; j++) if (m[slots[j]]) return m[slots[j]];
    return window.DDS_THUMBS[slug] || "";
  }
  function thumbs() {
    var o = {};
    Object.keys(window.DDS_ART || {}).forEach(function (slug) {
      o[slug] = pick(slug, ["profile", "lineup", "session"]);
    });
    window.DDS_THUMBS = o;
    return o;
  }
  function sameSrc(img, url) {
    if (!img || !url) return false;
    var cur = String(img.getAttribute("src") || img.src || "");
    if (cur.indexOf("/art/") !== -1 && String(url).indexOf("supabase") !== -1) return false;
    return cur === url || cur.split("?")[0] === String(url).split("?")[0];
  }
  function localOf(slug, slot) {
    var m = FALLBACK[slug] || {};
    return m[slot] || m.lineup || m.profile || m.session || "";
  }
  function bust(url) {
    if (!url) return url;
    if (url.indexOf("?v=") !== -1 || url.indexOf("&v=") !== -1) return url;
    return url + (url.indexOf("?") === -1 ? "?v=" : "&v=") + Date.now();
  }
  function setSrc(img, url, slug, slot) {
    if (!img || !url) return;
    var fallback = localOf(slug, slot || "lineup");
    img.onerror = function () {
      img.onerror = null;
      if (fallback && String(img.src).indexOf("/art/") === -1) {
        img.src = fallback;
        img.onerror = function () {
          img.onerror = null;
          var host = img.closest("a.poster-card, .portrait");
          if (!host || host.querySelector(".art-soon")) return;
          host.classList.add("no-art");
          var stamp = document.createElement("div");
          stamp.className = "art-soon";
          stamp.innerHTML = "Image coming soon" + (openLabel(slug) ? "<br><span class=\"art-open\">" + openLabel(slug) + "</span>" : "");
          host.appendChild(stamp);
        };
        return;
      }
      var host = img.closest("a.poster-card, .portrait");
      if (!host || host.querySelector(".art-soon")) return;
      host.classList.add("no-art");
      var stamp = document.createElement("div");
      stamp.className = "art-soon";
      stamp.innerHTML = "Image coming soon" + (openLabel(slug) ? "<br><span class=\"art-open\">" + openLabel(slug) + "</span>" : "");
      host.appendChild(stamp);
    };
    if (sameSrc(img, url) && String(url).indexOf("/art/") === -1) return;
    if (String(url).indexOf("/art/") !== -1) {
      img.onerror = img.onerror || function () {};
    }
    img.src = url;
  }
  function showImg(img, url) {
    if (!img || !url) return false;
    var host = img.closest(".portrait, a.poster-card, a.version");
    if (host) {
      host.classList.remove("no-art");
      host.querySelectorAll(".art-soon").forEach(function (el) { el.remove(); });
    }
    img.style.opacity = "1";
    img.style.visibility = "visible";
    img.onerror = function () {
      img.onerror = null;
      var slug = (img.getAttribute("data-slut") || "").toLowerCase();
      var other = pick(slug, ["profile", "lineup", "session"]);
      if (other && other !== url) {
        img.src = other;
        return;
      }
    };
    var final = bust(url);
    if (String(img.getAttribute("src") || "") !== final) img.src = final;
    return true;
  }
  function apply() {
    thumbs();
    document.querySelectorAll("a.poster-card[data-slut], a.poster-card[href$='.html']").forEach(function (card) {
      var slug = (card.getAttribute("data-slut") || (card.getAttribute("href") || "").replace(".html", "")).toLowerCase();
      var url = pick(slug, ["lineup", "profile", "session"]);
      var img = card.querySelector("img");
      if (url) showImg(img, url);
    });
    document.querySelectorAll("img[data-slut]").forEach(function (img) {
      var slug = String(img.getAttribute("data-slut") || "").toLowerCase();
      var slot = img.getAttribute("data-slot") || "profile";
      var order = [slot, "profile", "lineup", "session"];
      if (["anu","meenakshi"].indexOf(slug) !== -1) order = ["profile", "lineup", "session"];
      showImg(img, pick(slug, order));
    });
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    if (page) {
      var purl = pick(page, ["profile", "lineup", "session"]);
      document.querySelectorAll(".portrait img").forEach(function (img) {
        if (!img.getAttribute("data-slut")) img.setAttribute("data-slut", page);
        if (!img.getAttribute("data-slot")) img.setAttribute("data-slot", "profile");
        showImg(img, purl);
      });
    }
    document.querySelectorAll("img.thumb, img.offer-thumb").forEach(function (img) {
      var slug = (img.getAttribute("data-slut") || (img.alt || "")).toLowerCase();
      if (slug) showImg(img, pick(slug, ["profile", "lineup", "session"]));
    });
    if (window.SLUTS) {
      if (Array.isArray(window.SLUTS)) {
        window.SLUTS.forEach(function (s) {
          var u = pick(s.id, ["profile", "lineup", "session"]);
          if (u) s.img = u;
        });
        if (typeof window.renderCompare === "function") window.renderCompare();
      } else {
        Object.keys(window.SLUTS).forEach(function (id) {
          var u = pick(id, ["session", "profile", "lineup"]);
          if (u) window.SLUTS[id].img = u;
        });
      }
    }
    window.DDS_ART_READY = true;
    lureSoon();
    document.dispatchEvent(new Event("dds-art-ready"));
  }
  window.DDS_paintArt = apply;
  apply();
  function loadLive(tries) {
    tries = tries || 0;
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) {
      if (tries < 25) setTimeout(function () { loadLive(tries + 1); }, 200);
      return;
    }
    fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/site_images?select=slug,slot,url", {
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var map = JSON.parse(JSON.stringify(FALLBACK));
      (rows || []).forEach(function (r) {
        var url = String(r.url || "");
        if (!url || !r.slug) return;
        map[r.slug] = map[r.slug] || {};
        map[r.slug][r.slot || "profile"] = url;
      });
      window.DDS_ART = map;
      apply();
    }).catch(function () { apply(); });
  }
  loadLive();
})();
