(function () {
  function $(id) { return document.getElementById(id); }
  function acc() {
    try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; }
  }
  function rpc(name, body) {
    var c = window.DDS_SUPABASE || {};
    return fetch(String(c.url || "").replace(/\/$/, "") + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: { apikey: c.anon, Authorization: "Bearer " + c.anon, "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.code && d.ok !== true) {
        d.ok = false;
        d.error = d.error || d.message || d.code;
      }
      return d;
    });
  }
  function say(id, t, bad) {
    var el = $(id);
    if (!el) return;
    el.textContent = t || "";
    el.style.color = bad ? "#f5b5b5" : "";
  }
  var otherId = "";
  var HOUSE = "00000000-0000-0000-0000-000000000001";
  var mailFolder = "inbox";
  function sendAdmin() {
    var me = acc();
    if (!me || !me.id) { say("mailNote", "Login first.", true); return; }
    var body = (($("mailBody") && $("mailBody").value) || "").trim();
    if (!body) { say("mailNote", "Write the note to the desk first.", true); return; }
    say("mailNote", "Sending…");
    rpc("player_mail_to_admin", {
      p_id: me.id,
      p_subject: ($("mailSubject") && $("mailSubject").value) || "To the desk",
      p_body: body
    }).then(function (d) {
      if (!d || d.ok === false) { say("mailNote", (d && d.error) || "Could not send.", true); return; }
      $("mailBody").value = "";
      if ($("mailCount")) $("mailCount").textContent = "0 / 400";
      say("mailNote", "Sent to the desk. They reply in this House thread.");
      openThread(HOUSE, "House");
    });
  }
  function openAdminCompose() {
    otherId = HOUSE;
    if ($("mailSubject") && !$("mailSubject").value) $("mailSubject").value = "To the desk";
    openPlayerCompose("House", HOUSE);
  }
  function showPane(which) {
    var card = which === "card";
    var inbox = which === "inbox";
    var fb = which === "feedback";
    [["homeTabCard", card], ["homeTabInbox", inbox], ["homeTabFeedback", fb]].forEach(function (pair) {
      var el = $(pair[0]);
      if (!el) return;
      el.classList.toggle("on", pair[1]);
      el.classList.toggle("ghost", !pair[1]);
    });
    if ($("homeCardCol")) $("homeCardCol").classList.toggle("hidden", !card);
    if ($("loungeBox")) $("loungeBox").classList.toggle("hidden", !inbox);
    if ($("feedbackBox")) $("feedbackBox").classList.toggle("hidden", !fb);
    if (inbox) loadInbox();
  }
  function showInbox(on) { showPane(on ? "inbox" : "card"); }
  function loadInbox() {
    var me = acc();
    if (!$("mailInbox")) return;
    if (!me || !me.id) { $("mailInbox").textContent = "Login first."; return; }
    $("mailInbox").textContent = "Loading…";
    rpc("player_mail_mark_read", { p_id: me.id }).catch(function () {});
    try {
      var seen = JSON.parse(localStorage.getItem("dds_mail_read") || "{}");
      rpc("player_mail_folder", { p_id: me.id, p_folder: "inbox" }).then(function (box) {
        var newest = localStorage.getItem("dds_inbox_opened") || "";
        ((box && box.threads) || []).forEach(function (row) {
          if (!row) return;
          if (row.id) seen[String(row.id)] = 1;
          if (row.other_id) seen[String(row.other_id)] = 1;
          if (row.at && String(row.at) > newest) newest = String(row.at);
        });
        localStorage.setItem("dds_mail_read", JSON.stringify(seen));
        if (newest) localStorage.setItem("dds_inbox_opened", newest);
      }).catch(function () {});
    } catch (e) {}
    rpc("player_mail_folder", { p_id: me.id, p_folder: mailFolder }).then(function (d) {
      var rows = (d && d.threads) || [];
      var seen = {};
      rows = rows.filter(function (t) {
        var k = String(t.other_id || t.id || "") + "|" + String(t.at || "");
        if (seen[k]) return false;
        seen[k] = 1;
        return true;
      });
      if (!rows.length) { $("mailInbox").textContent = "No mail in this folder."; return; }
      $("mailInbox").innerHTML = rows.map(function (t) {
        var when = t.at ? new Date(t.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
        var sub = String(t.subject || t.preview || "No subject").replace(/</g, "");
        var prev = String(t.preview || "").replace(/<[^>]+>/g, " ").replace(/</g, "");
        if (prev && t.subject && prev.indexOf(t.subject) !== 0) sub += " — " + prev;
      var oid = t.other_id || HOUSE;
        return "<label class='pmail-line" + (t.unread ? " unread" : "") + "'>" +
          "<input type='checkbox' data-mid='" + (t.id || "") + "' onclick='event.stopPropagation()'/>" +
          "<button type='button' class='pmail-open' data-oid='" + oid + "' data-name='" + String(t.name || "House").replace(/"/g, "") + "'>" +
          "<span class='from'>" + String(t.name || t.username || "member").replace(/</g, "") + "</span>" +
          "<span class='sub'>" + sub + "</span>" +
          "<span class='when'>" + when + "</span></button></label>";
      }).join("");
    }).catch(function () { $("mailInbox").textContent = "Could not load inbox."; });
  }
  function showList() {
    if ($("mailCompose")) $("mailCompose").classList.add("hidden");
    if ($("mailRead")) $("mailRead").classList.add("hidden");
    if ($("mailInbox")) $("mailInbox").style.display = "";
    if ($("mailTools")) $("mailTools").classList.remove("hidden");
  }
  function showCompose(on, presetName) {
    if ($("mailCompose")) $("mailCompose").classList.toggle("hidden", !on);
    if ($("mailRead")) $("mailRead").classList.add("hidden");
    if ($("mailInbox")) $("mailInbox").style.display = on ? "none" : "";
    if ($("mailTools")) $("mailTools").classList.toggle("hidden", !!on);
    if (on && presetName && $("mailTo")) $("mailTo").value = presetName;
    if ($("mailToHint")) {
      $("mailToHint").textContent = (/^house$/i.test(($("mailTo") && $("mailTo").value) || "") || otherId === HOUSE)
        ? "This note goes to the desk."
        : "Write to this player. Send to admin if you want the desk instead.";
    }
  }
  function openPlayerCompose(name, id) {
    showPane("inbox");
    otherId = id || "";
    if ($("mailSubject")) $("mailSubject").value = $("mailSubject").value || "";
    showCompose(true, name || "");
    if ($("mailBody")) $("mailBody").focus();
  }
  
  function letterBody(m) {
    var raw = String((m && m.body) || "");
    if (m && m.admin && raw.indexOf("house-letter") !== -1) {
      return raw
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+\s*=/gi, " data-x=");
    }
    return raw.replace(/</g, "").replace(/\n/g, "<br>");
  }

  function openThread(id, name) {
    var me = acc();
    if (!id || id === "null") id = HOUSE;
    otherId = id;
    showCompose(false);
    if ($("mailRead")) $("mailRead").classList.remove("hidden");
    if ($("mailInbox")) $("mailInbox").style.display = "none";
    if ($("mailTools")) $("mailTools").classList.add("hidden");
    if ($("mailWho")) $("mailWho").textContent = name || "thread";
    if ($("mailTo") && name) $("mailTo").value = name;
    if (!$("mailThread") || !me) return;
    $("mailThread").textContent = "Opening…";
    rpc("player_mail_thread", { p_id: me.id, p_other: id }).then(function (d) {
      var msgs = (d && d.messages) || [];
      if ($("mailWho")) $("mailWho").textContent = (d && d.name) || name || "thread";
      $("mailThread").innerHTML = msgs.length ? msgs.map(function (m) {
        var who = m.admin ? "House" : (m.mine ? "You" : (name || "member"));
        var when = m.at ? new Date(m.at).toLocaleString() : "";
        return "<article class='pmail-letter'>" +
          (m.id ? "<button type='button' class='del' data-mdel='" + m.id + "'>Delete</button>" : "") +
          "<div class='who'>" + who + "</div>" +
          "<div class='meta'>" + when + "</div>" +
          (m.subject && String(m.body || "").indexOf("house-letter") === -1 ? "<div class='subj'>" + String(m.subject).replace(/</g, "") + "</div>" : "") +
          "<div class='body'>" + letterBody(m) + "</div>" +
          "</article>";
      }).join("") : "<p class='hint'>No messages yet.</p>";
      $("mailThread").scrollTop = $("mailThread").scrollHeight;
    });
  }
  function boot() {
    if (!$("mailSend") && !$("homeTabInbox") && !$("homeTabFeedback")) return;
    if ($("homeTabInbox")) $("homeTabInbox").onclick = function () { showPane("inbox"); };
    if ($("homeTabCard")) $("homeTabCard").onclick = function () { showPane("card"); };
    if ($("homeTabFeedback")) $("homeTabFeedback").onclick = function () { showPane("feedback"); };
    function setFold(name) {
      mailFolder = name;
      [["pFoldInbox", "inbox"], ["pFoldSent", "sent"], ["pFoldDeleted", "deleted"]].forEach(function (pair) {
        var el = $(pair[0]);
        if (!el) return;
        el.classList.toggle("on", pair[1] === name);
        el.classList.toggle("ghost", pair[1] !== name);
      });
      showList();
      loadInbox();
    }
    if ($("pFoldInbox")) $("pFoldInbox").onclick = function () { setFold("inbox"); };
    if ($("pFoldSent")) $("pFoldSent").onclick = function () { setFold("sent"); };
    if ($("pFoldDeleted")) $("pFoldDeleted").onclick = function () { setFold("deleted"); };
    if ($("mailComposeBtn")) $("mailComposeBtn").onclick = function () {
      otherId = "";
      openPlayerCompose("", "");
    };
    if ($("mailCancel")) $("mailCancel").onclick = function () { showList(); };
    if ($("mailSelAll")) $("mailSelAll").onchange = function () {
      document.querySelectorAll("#mailInbox [data-mid]").forEach(function (c) { c.checked = $("mailSelAll").checked; });
    };
    if ($("mailDelSel")) $("mailDelSel").onclick = function () {
      var me = acc();
      if (!me || !me.id) return;
      var ids = [];
      document.querySelectorAll("#mailInbox [data-mid]:checked").forEach(function (c) {
        if (c.getAttribute("data-mid")) ids.push(c.getAttribute("data-mid"));
      });
      if (!ids.length) { say("mailNote", "Tick a line first.", true); return; }
      if (!confirm("Delete " + ids.length + " message(s)?")) return;
      var i = 0;
      function next() {
        if (i >= ids.length) { loadInbox(); return; }
        rpc("player_mail_delete", { p_id: me.id, p_mid: ids[i++] }).then(next).catch(next);
      }
      next();
    };
    if ($("mailBack")) $("mailBack").onclick = function () {
      showList();
      loadInbox();
    };
    if ($("mailAdmin")) $("mailAdmin").onclick = openAdminCompose;
    if ($("mailSendAdmin")) $("mailSendAdmin").onclick = sendAdmin;
    if ($("mailInbox")) $("mailInbox").addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-oid]");
      if (!btn) return;
      openThread(btn.getAttribute("data-oid"), btn.getAttribute("data-name") || "");
    });
    if ($("mailThread")) $("mailThread").addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-mdel]");
      if (!b) return;
      var me = acc();
      if (!me || !me.id) return;
      if (!confirm("Delete this message?")) return;
      rpc("player_mail_delete", { p_id: me.id, p_mid: b.getAttribute("data-mdel") }).then(function () {
        openThread(otherId, ($("mailWho") && $("mailWho").textContent) || "");
      });
    });
    var suggestTimer = 0;
    if ($("mailTo")) $("mailTo").addEventListener("input", function () {
      clearTimeout(suggestTimer);
      var q = $("mailTo").value.trim();
      suggestTimer = setTimeout(function () {
        if (q.length < 2) { if ($("mailSuggest")) $("mailSuggest").innerHTML = ""; return; }
        rpc("player_find", { p_q: q }).then(function (d) {
          var people = (d && d.people) || [];
          if (!$("mailSuggest")) return;
          $("mailSuggest").innerHTML = people.map(function (p) {
            return "<button type='button' class='lounge-row' data-pick='" + p.id + "' data-name='" + String(p.name || p.username || "").replace(/"/g, "") + "'>" +
              String(p.name || p.username || "").replace(/</g, "") +
              " <span class='hint'>@" + String(p.username || "").replace(/</g, "") + "</span></button>";
          }).join("");
        });
      }, 200);
    });
    if ($("mailSuggest")) $("mailSuggest").addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-pick]");
      if (!b) return;
      otherId = b.getAttribute("data-pick");
      $("mailTo").value = b.getAttribute("data-name") || "";
      $("mailSuggest").innerHTML = "";
      showCompose(true, $("mailTo").value);
    });
    if ($("mailBody")) $("mailBody").addEventListener("input", function () {
      if ($("mailCount")) $("mailCount").textContent = ($("mailBody").value || "").length + " / 400";
    });
    if ($("mailSend")) $("mailSend").onclick = function () {
      var me = acc();
      if (!me || !me.id) { say("mailNote", "Login first.", true); return; }
      var to = otherId || ($("mailTo").value || "").trim();
      var body = ($("mailBody").value || "").trim();
      if (!to || !body) { say("mailNote", "Pick a member and write a line.", true); return; }
      if (/^house$|^admin$|^desk$/i.test(String(to)) || String(to) === HOUSE) {
        sendAdmin();
        return;
      }
      say("mailNote", "Sending…");
      rpc("player_mail_send", {
        p_id: me.id,
        p_to: to,
        p_subject: ($("mailSubject") && $("mailSubject").value || "").trim(),
        p_body: body
      }).then(function (d) {
        if (!d || d.ok === false) { say("mailNote", (d && d.error) || "Could not send.", true); return; }
        $("mailBody").value = "";
        if ($("mailCount")) $("mailCount").textContent = "0 / 400";
        say("mailNote", "Sent.");
        if (d.other_id) openThread(d.other_id, d.name || $("mailTo").value);
        else loadInbox();
      });
    };
    if ($("fbSend")) $("fbSend").onclick = function () {
      var me = acc();
      if (!me || !me.id) { say("fbNote", "Login first.", true); return; }
      var body = (($("fbBody") && $("fbBody").value) || "").trim();
      if (body.length < 4) { say("fbNote", "Write a bit more.", true); return; }
      say("fbNote", "Sending…");
      rpc("player_mail_to_admin", {
        p_id: me.id,
        p_subject: (($("fbKind") && $("fbKind").value) || "feedback") + " · " + (($("fbPage") && $("fbPage").value) || "house"),
        p_body: body
      }).then(function (d) {
        if (!d || d.ok === false) { say("fbNote", (d && d.error) || "Could not send. Ask the desk to run FIX_player_to_desk.sql.", true); return; }
        if ($("fbBody")) $("fbBody").value = "";
        say("fbNote", "Sent to the desk. Opening the House thread.");
        showPane("inbox");
        mailFolder = "sent";
        openThread(HOUSE, "House");
      });
    };
    if (/[?&]inbox=1/.test(location.search)) setTimeout(function () { showPane("inbox"); }, 500);
    if (/[?&]feedback=1/.test(location.search)) setTimeout(function () { showPane("feedback"); }, 500);
    if (/[?&]admin=1/.test(location.search)) setTimeout(function () { openAdminCompose(); }, 500);
    var toUser = new URLSearchParams(location.search).get("to") || "";
    var toName = new URLSearchParams(location.search).get("name") || toUser;
    if (toUser) {
      setTimeout(function () {
        openPlayerCompose(toName || toUser, "");
        rpc("player_find", { p_q: toUser }).then(function (d) {
          var people = (d && d.people) || [];
          var hit = people.filter(function (p) {
            return String(p.username) === toUser || String(p.name) === toUser || String(p.nickname) === toUser;
          })[0] || people[0];
          if (hit) openPlayerCompose(hit.name || hit.nickname || hit.username || toName, hit.id);
        });
      }, 400);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
