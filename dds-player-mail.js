(function () {
  var folder = "inbox";
  var HOUSE = "00000000-0000-0000-0000-000000000001";
  function $(id) { return document.getElementById(id); }
  function sb() { return window.dds || window.sb || null; }
  function me() {
    try {
      var a = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
      return a.id || null;
    } catch (e) { return null; }
  }
  function client() {
    if (window.dds && window.dds.rpc) return window.dds;
    if (window.sb && window.sb.rpc) return window.sb;
    return null;
  }
  var rowsById = {};
  function paintLines(rows) {
    var host = $("mailInbox");
    if (!host) return;
    rows = Array.isArray(rows) ? rows : [];
    rowsById = {};
    if (!rows.length) {
      host.innerHTML = folder === "sent" ? "No sent mail." : (folder === "deleted" ? "Deleted is empty." : "Inbox empty.");
      return;
    }
    host.innerHTML = rows.map(function (r) {
      var id = String(r.id || "");
      rowsById[id] = r;
      var when = r.at ? String(r.at).slice(0, 16).replace("T", " ") : "";
      var sub = String(r.subject || r.preview || "").replace(/</g, "");
      var who = String(r.name || "member").replace(/</g, "");
      return "<div class='pmail-line" + (r.unread ? " unread" : "") + "'>" +
        "<input type='checkbox' data-mid='" + id + "'/>" +
        "<button type='button' class='pmail-open' data-open='" + id + "'>" +
        "<span class='from'>" + who + "</span><span class='sub'>" + sub + "</span><span class='when'>" + when + "</span></button></div>";
    }).join("");
  }
  function houseLetter(body, when, subject) {
    var raw = String(body || "");
    if (raw.indexOf("HOUSELETTER:") === 0) raw = raw.slice(12);
    raw = raw.trim();
    var isHtml = /^\s*<[a-z]/i.test(raw) || raw.indexOf("<p>") >= 0 || raw.indexOf("<br") >= 0 || raw.indexOf("<div") >= 0 || raw.indexOf("<table") >= 0 || raw.indexOf("<h") >= 0;
    var paras;
    if (isHtml) {
      paras = raw;
    } else {
      var safe = raw.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
      var parts = safe.split(/\n\s*\n/).filter(function (p) { return p.trim(); });
      if (!parts.length) parts = [safe];
      paras = parts.map(function (p) {
        return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
      }).join("");
    }
    return "<article class='house-letter'>" +
      "<div class='mast'>Desire Clubhouse</div>" +
      "<div class='kicker'>House letter</div>" +
      "<h3>" + String(subject || "House letter").replace(/</g, "") + "</h3>" +
      "<div class='date'>" + String(when || "") + "</div>" +
      "<div class='rule'></div>" +
      paras +
      "<div class='sign'>The desk<br><span>Desire Clubhouse</span></div>" +
      "</article>";
  }
  function paintThread(name, messages, fallback) {
    var host = $("mailThread");
    if ($("mailWho")) $("mailWho").textContent = name || "message";
    if (!host) return;
    messages = Array.isArray(messages) ? messages : [];
    if (!messages.length && fallback) messages = [fallback];
    if (!messages.length) { host.innerHTML = "No message body."; return; }
    host.innerHTML = messages.map(function (m) {
      var who = m.mine ? "You" : (name || "Them");
      var when = m.at ? String(m.at).slice(0, 16).replace("T", " ") : "";
      var house = !m.mine && (who === "House" || String(m.body || "").indexOf("HOUSELETTER:") === 0);
      var body = house
        ? houseLetter(m.body, when, m.subject)
        : "<div class='body'>" + String(m.body || "").replace(/</g, "") + "</div>";
      return "<div class='pmail-letter'>" +
        (house ? "" : "<span class='who'>" + String(who).replace(/</g, "") + "</span>") +
        (house ? "" : "<div class='subj'>" + String(m.subject || "").replace(/</g, "") + "</div>") +
        body +
        (house ? "" : "<div class='meta'>" + when + "</div>") +
        "</div>";
    }).join("");
  }
  function openMessage(id) {
    var row = rowsById[String(id)] || {};
    if ($("mailCompose")) $("mailCompose").classList.add("hidden");
    if ($("mailInbox")) $("mailInbox").classList.add("hidden");
    if ($("mailTools")) $("mailTools").classList.add("hidden");
    if ($("mailRead")) $("mailRead").classList.remove("hidden");
    paintThread(row.name || "message", [], row);
    var c = client();
    var meId = me();
    if (c && meId) { try { c.rpc("player_mail_mark_read", { p_id: meId }).catch(function () {}); } catch (e) {} }
    try {
      sessionStorage.setItem("dds_inbox_open", "1");
      var seen = JSON.parse(localStorage.getItem("dds_mail_read") || "{}");
      seen[String(id)] = 1;
      if (row.other_id) seen[String(row.other_id)] = 1;
      localStorage.setItem("dds_mail_read", JSON.stringify(seen));
    } catch (e) {}
    if (!c || !meId || !id) return;
    c.rpc("player_mail_one", { p_id: meId, p_mid: id }).then(function (res) {
      var d = res && res.data;
      if (d && d.body) paintThread(row.name || "House", [{ body: d.body, subject: d.subject || row.subject, at: d.at || row.at }], null);
      else paintThread(row.name || "message", [], row);
    }).catch(function () {
      paintThread(row.name || "message", [], row);
    });
  }
  function loadFolder() {
    var host = $("mailInbox");
    if (!host) return;
    var id = me();
    var c = client();
    if (!id || !c) { host.textContent = "Log in to read mail."; return; }
    host.textContent = "Loading…";
    c.rpc("player_mail_folder", { p_id: id, p_folder: folder }).then(function (res) {
      if (res && res.error) throw res.error;
      var data = res && res.data;
      var rows = (data && data.threads) || [];
      if (typeof rows === "string") { try { rows = JSON.parse(rows); } catch (e) { rows = []; } }
      paintLines(rows);
      if (folder === "inbox") {
        try {
          var seen = JSON.parse(localStorage.getItem("dds_mail_read") || "{}");
          rows.forEach(function (r) {
            if (r && r.id) seen[String(r.id)] = 1;
            if (r && r.other_id) seen[String(r.other_id)] = 1;
          });
          localStorage.setItem("dds_mail_read", JSON.stringify(seen));
          sessionStorage.setItem("dds_inbox_open", "1");
        } catch (e) {}
        try { c.rpc("player_mail_mark_read", { p_id: id }).catch(function () {}); } catch (e) {}
        var pop = document.getElementById("dds-mail-pop");
        if (pop) pop.remove();
      }
    }).catch(function () {
      var cfg = window.DDS_SUPABASE || {};
      if (!cfg.url || !cfg.anon) { host.textContent = "Mail failed. Run FIX_mail_inbox_sent_only.sql."; return; }
      fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/player_mail_folder", {
        method: "POST",
        headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" },
        body: JSON.stringify({ p_id: id, p_folder: folder })
      }).then(function (r) { return r.json(); }).then(function (data) {
        var rows = (data && data.threads) || [];
        if (!Array.isArray(rows)) { host.textContent = "Mail failed. Run FIX_mail_inbox_sent_only.sql."; return; }
        paintLines(rows);
      }).catch(function () { host.textContent = "Mail failed. Run FIX_mail_inbox_sent_only.sql."; });
    });
  }
  function setFolder(name) {
    folder = name;
    ["pFoldInbox", "pFoldSent", "pFoldDeleted"].forEach(function (id) {
      if ($(id)) $(id).classList.toggle("on", id.toLowerCase().indexOf(name) !== -1 || (name === "inbox" && id === "pFoldInbox"));
    });
    if ($("pFoldInbox")) $("pFoldInbox").classList.toggle("on", name === "inbox");
    if ($("pFoldSent")) $("pFoldSent").classList.toggle("on", name === "sent");
    if ($("pFoldDeleted")) $("pFoldDeleted").classList.toggle("on", name === "deleted");
    if ($("mailCompose")) $("mailCompose").classList.add("hidden");
    if ($("mailRead")) $("mailRead").classList.add("hidden");
    if ($("mailInbox")) $("mailInbox").classList.remove("hidden");
    if ($("mailTools")) $("mailTools").classList.remove("hidden");
    loadFolder();
  }
  function send(toAdmin) {
    var c = client();
    var id = me();
    var typed = String(($("mailTo") && $("mailTo").value) || "").trim();
    if (!typed) toAdmin = true;
    var to = toAdmin ? "House" : typed;
    var sub = String(($("mailSubject") && $("mailSubject").value) || "").trim() || "Note";
    var body = String(($("mailBody") && $("mailBody").value) || "").trim();
    if (!c || !id) return;
    if (!body) { if ($("mailNote")) $("mailNote").textContent = "Write a line."; return; }
    if ($("mailNote")) $("mailNote").textContent = "Sending…";
    var call = toAdmin
      ? c.rpc("player_mail_to_admin", { p_id: id, p_subject: sub, p_body: body })
      : c.rpc("player_mail_send", { p_id: id, p_to: to, p_subject: sub, p_body: body });
    call.then(function (res) {
      var d = res && res.data;
      if (d && d.ok === false) { if ($("mailNote")) $("mailNote").textContent = d.error || "Not sent."; return; }
      if ($("mailNote")) $("mailNote").textContent = toAdmin ? "Sent to the desk." : "Sent.";
      if ($("mailBody")) $("mailBody").value = "";
      setFolder(toAdmin ? "sent" : "sent");
    }).catch(function () { if ($("mailNote")) $("mailNote").textContent = "Send failed."; });
  }
  function deleteSelected() {
    var c = client();
    var id = me();
    var ids = [];
    document.querySelectorAll("#mailInbox [data-mid]:checked").forEach(function (box) {
      ids.push(box.getAttribute("data-mid"));
    });
    if (!c || !id || !ids.length) { if ($("mailNote")) $("mailNote").textContent = "Tick a line first."; return; }
    var i = 0;
    function next() {
      if (i >= ids.length) { setFolder("inbox"); return; }
      c.rpc("player_mail_delete", { p_id: id, p_mid: ids[i++] }).then(next).catch(next);
    }
    next();
  }
  var findTimer = null;
  function paintSuggest(people) {
    var box = $("mailSuggest");
    if (!box) return;
    people = Array.isArray(people) ? people : [];
    if (!people.length) { box.innerHTML = ""; return; }
    box.innerHTML = people.map(function (p) {
      var user = String(p.username || "").replace(/</g, "");
      var name = String(p.name || user).replace(/</g, "");
      var extra = name && name.toLowerCase() !== user.toLowerCase() ? " · " + name : "";
      return "<button type='button' data-user='" + user + "'>" + user + extra + "</button>";
    }).join("");
    box.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        if ($("mailTo")) $("mailTo").value = btn.getAttribute("data-user") || "";
        box.innerHTML = "";
      };
    });
  }
  function findPlayers() {
    var box = $("mailSuggest");
    var c = client();
    var q = String(($("mailTo") && $("mailTo").value) || "").trim();
    if (!box || !c) return;
    if (q.length < 2) { box.innerHTML = ""; return; }
    c.rpc("player_find", { p_q: q }).then(function (res) {
      var d = res && res.data;
      var people = (d && d.people) || [];
      if (typeof people === "string") { try { people = JSON.parse(people); } catch (e) { people = []; } }
      paintSuggest(people);
    }).catch(function () { if (box) box.innerHTML = ""; });
  }
  if ($("mailTo")) $("mailTo").addEventListener("input", function () {
    clearTimeout(findTimer);
    findTimer = setTimeout(findPlayers, 180);
  });
  if ($("mailInbox")) $("mailInbox").addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".pmail-open");
    if (!btn) return;
    e.preventDefault();
    openMessage(btn.getAttribute("data-open"));
  });
  if ($("pFoldInbox")) $("pFoldInbox").onclick = function () { setFolder("inbox"); };
  if ($("pFoldSent")) $("pFoldSent").onclick = function () { setFolder("sent"); };
  if ($("pFoldDeleted")) $("pFoldDeleted").onclick = function () { setFolder("deleted"); };
  if ($("mailComposeBtn")) $("mailComposeBtn").onclick = function () {
    if ($("mailCompose")) $("mailCompose").classList.remove("hidden");
    if ($("mailInbox")) $("mailInbox").classList.add("hidden");
    if ($("mailRead")) $("mailRead").classList.add("hidden");
  };
  if ($("mailCancel")) $("mailCancel").onclick = function () { setFolder(folder); };
  if ($("mailSelAll")) $("mailSelAll").onchange = function () {
    document.querySelectorAll("#mailInbox [data-mid]").forEach(function (box) { box.checked = $("mailSelAll").checked; });
  };
  if ($("mailDelSel")) $("mailDelSel").onclick = deleteSelected;
  if ($("mailSend")) $("mailSend").onclick = function () { send(false); };
  if ($("mailSendAdmin")) $("mailSendAdmin").onclick = function () { send(true); };
  if ($("mailBack")) $("mailBack").onclick = function () { setFolder(folder); };
  if ($("homeTabInbox")) $("homeTabInbox").addEventListener("click", function () {
    if (window.DDS_showHomePane) window.DDS_showHomePane("inbox");
    setFolder("inbox");
  });
  document.addEventListener("dds-account-ready", function () { if ($("mailInbox")) loadFolder(); });
  if ($("mailInbox") && me()) loadFolder();
})();
