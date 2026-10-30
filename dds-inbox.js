(function (w) {
  var KEY = "dds_ticket";
  var LOCK = "dds_lock_until";
  var BUSY = "She is busy. She should be free in the next 2 to 3 hours.";
  var DECLINED = "Your request has been declined.";
  function cfg() { return w.DDS_SUPABASE || {}; }
  function base() { return String(cfg().url || "").replace(/\/$/, ""); }
  function headers(json) {
    var h = { apikey: cfg().anon, Authorization: "Bearer " + cfg().anon };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }
  function saveTicket(id) {
    try { localStorage.setItem(KEY, id); } catch (e) {}
  }
  function clearTicket() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  function ticket() {
    try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }
  function setLocalLock(until) {
    try { localStorage.setItem(LOCK, until); } catch (e) {}
  }
  function clearLocalLock() {
    try { localStorage.removeItem(LOCK); } catch (e) {}
  }
  function localLockUntil() {
    try { return localStorage.getItem(LOCK) || ""; } catch (e) { return ""; }
  }
  function plus20() {
    return new Date(Date.now() + 20 * 60 * 1000).toISOString();
  }
  var CHAT = "https://desireclubchat.netlify.app";
  function chatUrl(path) {
    var q = String(path || "");
    if (/^https?:\/\//i.test(q)) {
      try {
        var u = new URL(q);
        if (/chat-room\.html/i.test(u.pathname)) return CHAT + "/chat-room.html" + u.search + u.hash;
      } catch (e) {}
    }
    if (q.indexOf("chat-room.html") === -1) {
      q = "/chat-room.html" + (q.indexOf("?") === 0 ? q : (q ? "?r=" + encodeURIComponent(q) : ""));
    }
    var cut = q.indexOf("chat-room.html");
    q = cut >= 0 ? q.slice(cut) : "chat-room.html";
    if (q.charAt(0) !== "/") q = "/" + q;
    return CHAT + q;
  }
  function roomLive(url) {
    var raw = String(url || "");
    if (!/[?&]r=/.test(raw)) return Promise.resolve(false);
    return fetch(base() + "/rest/v1/rpc/room_link_live", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ p_url: raw })
    }).then(function (r) { return r.ok ? r.json() : false; }).then(function (j) {
      return j === true;
    }).catch(function () { return false; });
  }
  function releaseDead(hit) {
    if (!hit || !hit.locked) return Promise.resolve(hit || { locked: false });
    if (hit.pending) return Promise.resolve(hit);
    if (!hit.room_url) {
      clearTicket();
      clearLocalLock();
      return Promise.resolve({ locked: false });
    }
    return roomLive(hit.room_url).then(function (ok) {
      if (ok) return hit;
      clearTicket();
      clearLocalLock();
      return { locked: false };
    });
  }
  var MODEL_META = {
    preethi: { name: "Preethi", origin: "Chennai Tamil" },
    diya: { name: "Diya", origin: "Madurai" },
    meghana: { name: "Meghana", origin: "Kannadiga" },
    kiara: { name: "Kiara", origin: "Delhi" },
    sravani: { name: "Sravani", origin: "Telugu village" },
    meenakshi: { name: "Meenakshi", origin: "Tamil" },
    ayesha: { name: "Ayesha", origin: "Tamil Muslim" },
    esther: { name: "Esther", origin: "Tamil Christian" },
    natasha: { name: "Natasha", origin: "Goa" },
    tharini: { name: "Tharini", origin: "Mumbai" },
    kavya: { name: "Kavya", origin: "Tamil Iyengar" },
    lahari: { name: "Lahari", origin: "Hyderabad Telugu" },
    navya: { name: "Navya", origin: "Kochi Malayali" },
    simran: { name: "Simran", origin: "Rajasthan" },
    anu: { name: "Anu Nair", origin: "Kerala Nair" }
  };
  function bumpSessions(slug, roomSlug) {
    if (!slug) return Promise.resolve();
    var root = base();
    var h = headers(true);
    function rpc() {
      return fetch(root + "/rest/v1/rpc/bump_sessions", {
        method: "POST",
        headers: h,
        body: JSON.stringify({ p_slut: slug, p_room: roomSlug || null })
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }
    function plusOne(table) {
      return fetch(root + "/rest/v1/" + table + "?slut=eq." + encodeURIComponent(slug) + "&select=slut,sessions,desire_score", {
        headers: headers(false)
      }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        var row = rows && rows[0];
        if (!row) return false;
        var next = Number(row.sessions || 0) + 1;
        var body = { sessions: next, updated_at: new Date().toISOString() };
        return fetch(root + "/rest/v1/" + table + "?slut=eq." + encodeURIComponent(slug), {
          method: "PATCH",
          headers: Object.assign(h, { Prefer: "return=minimal" }),
          body: JSON.stringify(body)
        }).then(function (r) { return r.ok; });
      }).catch(function () { return false; });
    }
    function logOpen() {
      return fetch(root + "/rest/v1/session_opens", {
        method: "POST",
        headers: Object.assign(h, { Prefer: "return=minimal" }),
        body: JSON.stringify({ slut: slug, room_slug: roomSlug || null })
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }
    return rpc().then(function (ok) {
      if (ok) return true;
      return logOpen();
    }).catch(function () { return logOpen(); });
  }
  function randSlug() {
    var a = "abcdefghjkmnpqrstuvwxyz23456789";
    var s = "";
    for (var i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function patch(id, body) {
    return fetch(base() + "/rest/v1/room_requests?id=eq." + encodeURIComponent(id), {
      method: "PATCH",
      headers: Object.assign(headers(true), { Prefer: "return=minimal" }),
      body: JSON.stringify(body)
    });
  }
  function ip() {
    return fetch("https://api.ipify.org?format=json")
      .then(function (r) { return r.json(); })
      .then(function (j) { return String(j.ip || ""); })
      .catch(function () { return ""; });
  }

  w.DDS_INBOX = {
    BUSY: BUSY,
    DECLINED: DECLINED,
    ticket: ticket,
    saveTicket: saveTicket,
    clearTicket: clearTicket,
    roomLive: roomLive,
    ip: ip,
    localLockUntil: localLockUntil,
    clearLocalLock: clearLocalLock,
    create: function (row) {
      return fetch(base() + "/rest/v1/room_requests", {
        method: "POST",
        headers: Object.assign(headers(true), { Prefer: "return=representation" }),
        body: JSON.stringify(row)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); }).then(function (res) {
        var rows = res.body;
        if (!res.ok) {
          var msg = (rows && (rows.message || rows.hint)) || "room failed";
          if (/cool off/i.test(String(msg))) throw new Error("You are on a cool-off. The desk paused your rooms for a few hours. Try later.");
          if (/ONE_ROOM/i.test(String(msg))) {
            var slug = String((row && row.slut) || "").toLowerCase();
            if (slug === "anu") { /* Anu ask is never blocked by a model night */ }
            else throw new Error("Finish the model room you are in before opening another.");
          }
          if (/WAIT_PENDING/i.test(String(msg))) throw new Error("You already have a room waiting. Stay on that request until the desk answers (busy, decline, or delete).");
          if (/WAIT_OFFERED/i.test(String(msg))) throw new Error("A room was already sent. Wait 20 minutes before asking again.");
          throw new Error(msg);
        }
        var item = Array.isArray(rows) ? rows[0] : rows;
        if (item && item.id) saveTicket(item.id);
        return item;
      });
    },
    get: function (id) {
      return fetch(base() + "/rest/v1/room_requests?id=eq." + encodeURIComponent(id) + "&select=*", {
        headers: headers()
      }).then(function (r) { return r.json(); }).then(function (rows) {
        return (rows && rows[0]) || null;
      });
    },
    list: function () {
      return fetch(base() + "/rest/v1/room_requests?select=*&order=created_at.desc&limit=200", {
        headers: headers()
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error((res.body && (res.body.message || res.body.hint)) || "room_requests read failed");
          return Array.isArray(res.body) ? res.body : [];
        });
    },
    locked: function (clientIp, playerId, wantSlut) {
      wantSlut = String(wantSlut || "").toLowerCase();
      function sameWoman(row) {
        if (!wantSlut) return true;
        return String((row && row.slut) || "").toLowerCase() === wantSlut;
      }
      function active(until) {
        return until && Date.parse(until) > Date.now();
      }
      function fromRow(row, source) {
        if (!row) return { locked: false };
        if (row.status === "declined" || row.status === "busy" || row.status === "deleted") {
          if (row.id && row.id === ticket()) clearTicket();
          return { locked: false };
        }
        if (row.status === "open") {
          if (sameWoman(row) && row.id) saveTicket(row.id);
          return {
            locked: true,
            pending: true,
            until: "",
            slut: row.slut,
            id: row.id,
            room_url: sameWoman(row) ? "" : "",
            foreign: !sameWoman(row),
            source: source || "pending"
          };
        }
        if (row.status === "sent" && active(row.lock_until)) {
          if (sameWoman(row)) setLocalLock(row.lock_until);
          if (sameWoman(row) && row.id) saveTicket(row.id);
          return {
            locked: true,
            until: row.lock_until,
            slut: row.slut,
            id: row.id,
            room_url: sameWoman(row) ? (row.room_url || "") : "",
            foreign: !sameWoman(row),
            source: source
          };
        }
        return { locked: false, id: row.id || "", row: row };
      }
      function getById(id) {
        return fetch(base() + "/rest/v1/room_requests?id=eq." + encodeURIComponent(id) + "&select=id,status,lock_until,slut,reset_asked,admin_note,room_url", {
          headers: headers()
        }).then(function (r) { return r.json(); }).then(function (rows) { return (rows && rows[0]) || null; });
      }
      function pick(rows) {
        rows = rows || [];
        if (wantSlut) {
          var mine = rows.filter(function (r) { return sameWoman(r); });
          for (var i = 0; i < mine.length; i++) {
            if (mine[i].status === "open") return mine[i];
          }
          for (var j = 0; j < mine.length; j++) {
            if (mine[j].status === "sent" && active(mine[j].lock_until)) return mine[j];
          }
          return null;
        }
        for (var a = 0; a < rows.length; a++) {
          if (rows[a].status === "open") return rows[a];
        }
        for (var b = 0; b < rows.length; b++) {
          if (active(rows[b].lock_until)) return rows[b];
        }
        return null;
      }
      var tid = ticket();
      var q = tid ? getById(tid) : Promise.resolve(null);
      function byIp() {
        if (!clientIp) return Promise.resolve(null);
        return fetch(
          base() + "/rest/v1/room_requests?client_ip=eq." + encodeURIComponent(clientIp) +
          "&status=in.(open,sent)&select=id,status,lock_until,slut,reset_asked,room_url,player_id&order=created_at.desc&limit=8",
          { headers: headers() }
        ).then(function (r) { return r.json(); }).then(pick);
      }
      function byPlayer() {
        if (!playerId) return Promise.resolve(null);
        return fetch(
          base() + "/rest/v1/room_requests?player_id=eq." + encodeURIComponent(playerId) +
          "&status=in.(open,sent)&select=id,status,lock_until,slut,reset_asked,room_url,player_id&order=created_at.desc&limit=8",
          { headers: headers() }
        ).then(function (r) { return r.json(); }).then(pick);
      }
      return q.then(function (ticketRow) {
        if (ticketRow && wantSlut && !sameWoman(ticketRow)) {
          clearTicket();
          ticketRow = null;
        }
        var hit = fromRow(ticketRow, "ticket");
        return releaseDead(hit).then(function (liveHit) {
          if (liveHit.locked && !liveHit.foreign) return liveHit;
          return byPlayer().then(function (own) {
            return releaseDead(fromRow(own, "player")).then(function (ownHit) {
              if (ownHit.locked) return ownHit;
              return byIp().then(function (ipRow) {
                return releaseDead(fromRow(ipRow, "ip")).then(function (ipHit) {
                  if (ipHit.locked) return ipHit;
                  clearLocalLock();
                  return { locked: false };
                });
              });
            });
          });
        });
      }).catch(function () {
        return { locked: false };
      });
    },
    createRoom: function (row) {
      var slug = String((row && row.slut) || "").toLowerCase();
      var meta = MODEL_META[slug] || { name: slug.replace(/^\w/, function (c) { return c.toUpperCase(); }), origin: "" };
      var room = randSlug();
      var who = (row && row.player_name) || "";
      if (who && row && row.player_age) who = who + " · " + row.player_age;
      var payload = {
        slug: room,
        model_slug: slug,
        slut_name: meta.name,
        version_name: "Main",
        display_name: meta.name,
        origin: meta.origin,
        player_name: who || null,
        player_id: (row && row.player_id) || null,
        status: "open"
      };
      function post(body) {
        return fetch(base() + "/rest/v1/rooms", {
          method: "POST",
          headers: Object.assign(headers(true), { Prefer: "return=representation" }),
          body: JSON.stringify(body)
        }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); });
      }
      function clip(v, n) {
        return String(v || "").replace(/\|/g, "/").replace(/\s+/g, " ").trim().slice(0, n || 80);
      }
      function ageFromDob(dob) {
        if (!dob) return "";
        var d = new Date(dob);
        if (isNaN(d.getTime())) return "";
        var now = new Date();
        var a = now.getFullYear() - d.getFullYear();
        var m = now.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
        return a >= 18 && a < 100 ? String(a) : "";
      }
      function toffCap(status) {
        var s = String(status || "");
        if (/platinum/i.test(s)) return "none";
        if (/elite/i.test(s)) return "10";
        if (/gold/i.test(s)) return "5";
        if (/silver/i.test(s)) return "3";
        return "2";
      }
      function timeCap(status) {
        var s = String(status || "");
        if (/platinum/i.test(s)) return { tmax: "120", ext: "unlim", bump: "15" };
        if (/elite/i.test(s)) return { tmax: "90", ext: "5", bump: "15" };
        if (/gold/i.test(s)) return { tmax: "60", ext: "3", bump: "15" };
        if (/silver/i.test(s)) return { tmax: "45", ext: "2", bump: "15" };
        return { tmax: "30", ext: "1", bump: "15" };
      }
      function guestLine() {
        return [
          "DDS1",
          "GUEST",
          "m=" + slug,
          "nick=Guest",
          "age=?",
          "about=",
          "likes=",
          "fav=none",
          "owns=none",
          "dps=0",
          "st=Guest",
          "toff=2",
          "tmax=30",
          "ext=0",
          "bump=0",
          "last=none",
          "n=0",
          "own=0",
          "broken=0",
          "usual=0",
          "p=guest"
        ].join("|");
      }
      function isGuestAsk() {
        return /(?:^|\b)GUEST(?:\b|$)/i.test(String((row && row.admin_note) || "")) ||
          String((row && row.player_name) || "").toLowerCase() === "guest";
      }
      function scoutLine(card, pid, dps, ownedCard, isFan) {
        if (isGuestAsk()) return guestLine();
        var pr = (card && card.profile) || {};
        var hist = (card && card.sessions) || [];
        var prior = (card && card.last_on_model) || (card && card.last) || null;
        if (!prior) {
          hist.forEach(function (h) {
            if (!prior && String(h.model_slug || "").toLowerCase() === slug) prior = h;
          });
        }
        if (!prior) prior = hist[0] || null;
        var nights = Number((card && (card.nights != null ? card.nights : card.session_count)) || 0);
        if (!nights && prior && String(prior.model_slug || "").toLowerCase() === slug) nights = 1;
        var isNew = nights < 1;
        var favs = [pr.fav1, pr.fav2].filter(Boolean).join(",");
        if (!favs && card && card.fav) favs = Array.isArray(card.fav) ? card.fav.join(",") : String(card.fav);
        var owns = "";
        var ownHit = null;
        function modelSlug(m) {
          if (!m) return "";
          if (typeof m === "string") return m.toLowerCase();
          return String(m.slug || m.model_slug || m.model || m.slut || "").toLowerCase();
        }
        if (ownedCard && ownedCard.models && ownedCard.models.length) {
          owns = ownedCard.models.map(modelSlug).filter(Boolean).join(",");
          ownedCard.models.forEach(function (m) {
            if (modelSlug(m) === slug) ownHit = m;
          });
        } else if (card && card.owns) {
          owns = Array.isArray(card.owns) ? card.owns.join(",") : String(card.owns);
        }
        if (ownHit && Number(ownHit.sessions || 0) > nights) nights = Number(ownHit.sessions);
        isNew = nights < 1;
        var pts = (dps && dps.points != null) ? Number(dps.points) : Number((card && card.dps) || 0);
        var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
        function statusFromPts(n) {
          if (n >= Number(sl.platinum || 1000)) return "Desire Platinum";
          if (n >= Number(sl.elite || 650)) return "Desire Elite";
          if (n >= Number(sl.gold || 300)) return "Desire Gold";
          if (n >= Number(sl.silver || 100)) return "Desire Silver";
          if (n >= Number(sl.bronze || 50)) return "Desire Bronze";
          return "DesireMember";
        }
        var st = (dps && dps.status) || (card && card.status) || statusFromPts(pts);
        var gold = /gold|elite|platinum/i.test(String(st));
        var silver = /silver/i.test(String(st));
        var need = gold ? 3 : (silver ? 5 : 99);
        var ownsThis = nights >= need;
        if (card && card.owned === true) ownsThis = true;
        if (ownHit && Number(ownHit.sessions || ownHit.owned_nights || 0) >= need) ownsThis = true;
        // Bought ownership counts even with no nights.
        if (ownHit && (ownHit.bought === true || ownHit.owned === true || ownHit.bought === "true" || Number(ownHit.owned_nights || 0) > 0)) ownsThis = true;
        if (!ownsThis && owns) {
          var ownList = String(owns).toLowerCase().split(/[,|\s]+/).filter(Boolean);
          if (ownList.indexOf(slug) !== -1) ownsThis = true;
        }
        // A direct owner_prefs hit from the room create overrides everything.
        if (ownedCard && ownedCard.boughtRow) ownsThis = true;
        var usual = !!(card && card.start_usual) || !!(ownHit && ownHit.usual);
        var broken = ownsThis && !usual;
        var ownn = 0;
        if (ownsThis) {
          ownn = Number((card && card.owned_nights) || 0);
          if (!ownn) ownn = Math.max(1, nights - (need - 1));
        }
        if (slug === "anu" || slug === "meenakshi") {
          var tmT = timeCap(st);
          var partsT = [
            "TRAIN",
            slug,
            "role=trainer",
            "nick=" + clip(pr.nickname || pr.username || who, 24),
            "age=" + (ageFromDob(pr.dob) || "?"),
            "about=" + clip(pr.bio, 90),
            "likes=" + clip(pr.likes, 70),
            "skill=" + clip(pr.hobbies, 50),
            "fav=" + clip(favs || "none", 48),
            "owns=" + clip(owns || "none", 60),
            "dps=" + String(pts),
            "st=" + clip(st, 24),
            "toff=" + toffCap(st),
            "tmax=" + tmT.tmax,
            "ext=" + tmT.ext,
            "bump=" + tmT.bump,
            "last=" + (prior ? clip(prior.created_at, 19) + "/" + clip(prior.model_slug, 12) : "none"),
            "n=" + String(nights),
            "own=" + (ownsThis ? "1" : "0")
          ];
          if (ownsThis) partsT.push("ownn=" + String(ownn));
          partsT.push("broken=" + (broken ? "1" : "0"));
          partsT.push("usual=" + (usual ? "1" : "0"));
          partsT.push("fan=" + (isFan ? "1" : "0"));
          partsT.push("door=none");
          partsT.push("drill=");
          partsT.push("clothes=covered");
          partsT.push("p=" + (pid || ""));
          return partsT.join("|");
        }
        var tm = timeCap(st);
        var parts = [
          "DDS1",
          isNew ? "NEW" : "BACK",
          "m=" + slug,
          "nick=" + clip(pr.nickname || pr.username || who, 24),
          "age=" + (ageFromDob(pr.dob) || "?"),
          "about=" + clip(pr.bio, 90),
          "likes=" + clip(pr.likes, 70),
          "skill=" + clip(pr.hobbies, 50),
          "fav=" + clip(favs || "none", 48),
          "owns=" + clip(owns || "none", 60),
          "dps=" + String(pts),
          "st=" + clip(st, 24),
          "toff=" + toffCap(st),
          "tmax=" + tm.tmax,
          "ext=" + tm.ext,
          "bump=" + tm.bump,
          "last=" + (prior ? clip(prior.created_at, 19) + "/" + clip(prior.model_slug, 12) : "none"),
          "n=" + String(nights),
          "own=" + (ownsThis ? "1" : "0")
        ];
        if (ownsThis) parts.push("ownn=" + String(ownn));
        parts.push("broken=" + (broken ? "1" : "0"));
        parts.push("usual=" + (usual ? "1" : "0"));
        parts.push("fan=" + (isFan ? "1" : "0"));
        parts.push("p=" + (pid || ""));
        return parts.join("|");
      }
      return post(payload).then(function (res) {
        if (!res.ok) {
          var slim = { slug: room, model_slug: slug, display_name: meta.name, status: "open" };
          return post(slim).then(function (res2) {
            if (!res2.ok) throw new Error((res.body && res.body.message) || (res2.body && res2.body.message) || "Room create failed");
            return res2;
          });
        }
        return res;
      }).then(function (res) {
        function confirmRoom() {
          return fetch(base() + "/rest/v1/rooms?slug=eq." + encodeURIComponent(room) + "&select=id,slug,status", { headers: headers(false) })
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (rows) {
              var hit = Array.isArray(rows) ? rows[0] : rows;
              if (hit && hit.id) return hit;
              return post(payload).then(function (again) {
                if (!again.ok) throw new Error((again.body && again.body.message) || "Room create failed");
                return fetch(base() + "/rest/v1/rooms?slug=eq." + encodeURIComponent(room) + "&select=id,slug,status", { headers: headers(false) })
                  .then(function (r) { return r.ok ? r.json() : []; })
                  .then(function (rows2) {
                    var hit2 = Array.isArray(rows2) ? rows2[0] : rows2;
                    if (!hit2 || !hit2.id) throw new Error("Room was not saved. Create again.");
                    return hit2;
                  });
              });
            });
        }
        return confirmRoom().then(function (roomRow) {
            var pid = row && row.player_id;
            var guest = isGuestAsk();
            var cardP = (!guest && pid)
              ? fetch(base() + "/rest/v1/rpc/player_card", {
                  method: "POST",
                  headers: headers(true),
                  body: JSON.stringify({ p_id: pid, p_model: slug })
                }).then(function (r) { return r.json(); }).then(function (card) {
                  if (card && card.owned && pid) {
                    fetch(base() + "/rest/v1/rpc/touch_own_desire", {
                      method: "POST",
                      headers: headers(true),
                      body: JSON.stringify({ p_id: pid, p_model: slug, p_kind: "claim" })
                    }).catch(function () {});
                    fetch(base() + "/rest/v1/rpc/touch_own_desire", {
                      method: "POST",
                      headers: headers(true),
                      body: JSON.stringify({ p_id: pid, p_model: slug, p_kind: "call" })
                    }).catch(function () {});
                  }
                  return card;
                }).catch(function () { return null; })
              : Promise.resolve(null);
            var dpsP = (!guest && pid)
              ? fetch(base() + "/rest/v1/rpc/player_dps_card", {
                  method: "POST",
                  headers: headers(true),
                  body: JSON.stringify({ p_id: pid })
                }).then(function (r) { return r.json(); }).catch(function () { return null; })
              : Promise.resolve(null);
            var ownP = (!guest && pid)
              ? fetch(base() + "/rest/v1/rpc/player_owned", {
                  method: "POST",
                  headers: headers(true),
                  body: JSON.stringify({ p_id: pid })
                }).then(function (r) { return r.json(); }).catch(function () { return null; })
              : Promise.resolve(null);
            var fanP = (!guest && pid)
              ? fetch(base() + "/rest/v1/rpc/is_fan_of", {
                  method: "POST",
                  headers: headers(true),
                  body: JSON.stringify({ p_id: pid, p_model: slug })
                }).then(function (r) { return r.json(); }).then(function (v) { return v === true || v === "true"; }).catch(function () { return false; })
              : Promise.resolve(false);
            var boughtP = (!guest && pid)
              ? fetch(base() + "/rest/v1/owner_prefs?player_id=eq." + encodeURIComponent(pid) + "&model_slug=eq." + encodeURIComponent(slug) + "&select=bought,owned_nights,start_usual", {
                  headers: headers(false)
                }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
                  var row = Array.isArray(rows) ? rows[0] : null;
                  if (!row) return false;
                  return row.bought === true || row.bought === "true" || Number(row.owned_nights || 0) > 0;
                }).catch(function () { return false; })
              : Promise.resolve(false);
            return Promise.all([cardP, dpsP, ownP, fanP, boughtP]).then(function (pair) {
              var card = pair[0];
              var dps = pair[1];
              var ownedCard = pair[2];
              var isFan = !!pair[3];
              var isBought = !!pair[4];
              if (isBought) {
                if (!card) card = {};
                card.owned = true;
                if (!ownedCard) ownedCard = { models: [] };
                if (!ownedCard.models) ownedCard.models = [];
                ownedCard.boughtRow = true;
                var has = ownedCard.models.some(function (m) { return String(m.slug || m.model_slug || "").toLowerCase() === slug; });
                if (!has) ownedCard.models.push({ slug: slug, bought: true, owned: true, owned_nights: 1 });
              }
              var line = guest ? guestLine() : scoutLine(card, pid, dps, ownedCard, isFan);
              function quiet(p) { return Promise.resolve(p).catch(function () { return null; }); }
              var ready = slug
                ? ("\nMODELREADY https://desireclubhouse.netlify.app/modelready/k/mready-4k9p/" + slug + ".html\nLOOK UP. Open base first: https://desireclubhouse.netlify.app/modelready/k/mready-4k9p/base.html\nbase.html wins on the open. Read it every DDS.")
                : "";
              var ddsBody = "DESIRE SCOUT\n" + line + ready;
              var jobs = [
                quiet(bumpSessions(slug, room)),
                fetch(base() + "/rest/v1/rooms?slug=eq." + encodeURIComponent(room), {
                  method: "PATCH",
                  headers: Object.assign(headers(true), { Prefer: "return=representation" }),
                  body: JSON.stringify({ scout_line: line, player_id: guest ? null : (pid || null), model_slug: slug })
                }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); }),
                fetch(base() + "/rest/v1/messages", {
                  method: "POST",
                  headers: Object.assign(headers(true), { Prefer: "return=representation" }),
                  body: JSON.stringify({ room_id: roomRow.id, sender: "model", body: ddsBody })
                }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
              ];
              if (!guest && pid) {
                jobs.push(quiet(fetch(base() + "/rest/v1/player_sessions", {
                  method: "POST",
                  headers: headers(true),
                  body: JSON.stringify({ player_id: pid, model_slug: slug, room_slug: room })
                })));
              }
              var q = (guest || !pid ? "" : "&p=" + encodeURIComponent(pid)) + "&scout=1";
              return Promise.all(jobs).then(function (done) {
                var patched = done[1];
                var wrote = done[2];
                if (!patched || !patched.ok) throw new Error("DDS was not saved on the room.");
                if (!wrote || !wrote.ok) throw new Error("DDS was not written into the chat.");
                var playerUrl = chatUrl("/chat-room.html?r=" + room + q);
                return {
                  slug: room,
                  scout_line: line,
                  playerUrl: playerUrl,
                  modelUrl: playerUrl + (playerUrl.indexOf("desk=1") === -1 ? "&desk=1" : "")
                };
              });
            });
          });
      });
    },
    reply: function (id, url, note) {
      var until = plus20();
      var clean = String(url || "");
      if (/anu(-chat)?\.html/i.test(clean) || /[?&]door=/.test(clean)) {
        return Promise.reject(new Error("Do not send anu.html. Create the model room and store chat-room.html?r=ROOM&p=PLAYER&scout=1."));
      }
      return patch(id, {
        status: "sent",
        room_url: clean,
        admin_note: note || "",
        answered_at: new Date().toISOString(),
        lock_until: until
      });
    },
    busy: function (id) {
      return patch(id, {
        status: "busy",
        room_url: null,
        admin_note: BUSY,
        answered_at: new Date().toISOString()
      });
    },
    decline: function (id) {
      return patch(id, {
        status: "declined",
        room_url: null,
        admin_note: DECLINED,
        answered_at: new Date().toISOString()
      });
    },
    askReset: function (id, reason) {
      return patch(id, { reset_reason: reason, reset_asked: true }).then(function (r) {
        if (!r.ok) throw new Error("reset failed " + r.status);
        return r;
      });
    },
    resetLock: function (id) {
      clearLocalLock();
      return patch(id, {
        lock_until: "1970-01-01T00:00:00Z",
        reset_asked: false,
        reset_reason: "",
        admin_note: "WAIT_CLEARED"
      }).then(function (r) {
        if (!r.ok) throw new Error("reset failed " + r.status);
        return r;
      });
    },
    remove: function (id) {
      return fetch(base() + "/rest/v1/room_requests?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: headers()
      });
    },
    removeIds: function (ids) {
      if (!ids.length) return Promise.resolve({ ok: true, n: 0 });
      var self = this;
      var i = 0;
      var failed = 0;
      function next() {
        if (i >= ids.length) return Promise.resolve({ ok: failed === 0, n: ids.length - failed, failed: failed });
        var id = ids[i++];
        return self.remove(id).then(function (r) {
          if (!r || !r.ok) failed++;
          return next();
        }).catch(function () {
          failed++;
          return next();
        });
      }
      return next();
    }
  };
})(window);
