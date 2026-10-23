(function () {
  var sb = window.DDS_SUPABASE || {};
  function base() { return String(sb.url || "").replace(/\/$/, ""); }
  function headers(json) {
    var h = { apikey: sb.anon || "", Authorization: "Bearer " + (sb.anon || "") };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }
  function rpc(name, body) {
    return fetch(base() + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
  }
  function deskOn() {
    var until = Number(localStorage.getItem("dds_admin_until") || sessionStorage.getItem("dds_admin_until") || 0);
    return until > Date.now();
  }
  function deskPin() {
    try { return localStorage.getItem("dds_desk_pin") || ""; } catch (e) { return ""; }
  }
  function acc() {
    try { return JSON.parse(localStorage.getItem("dds_account") || "null"); } catch (e) { return null; }
  }
  function esc(s) { return String(s || "").replace(/</g, ""); }
  function when(iso) {
    try { return new Date(iso).toLocaleString(); } catch (e) { return ""; }
  }
  var listEl = document.getElementById("topicList");
  var note = document.getElementById("topicNote");
  var openId = "";

  function paintList(topics) {
    if (!listEl) return;
    if (!topics.length) {
      listEl.innerHTML = "<p class='hint'>No topics yet. Start one.</p>";
      return;
    }
    var rows = topics.map(function (t) {
      return "<tr class='line' data-tid='" + t.id + "'>" +
        "<td class='topic'>" + esc(t.title) + "</td>" +
        "<td class='who'>" + esc(t.name || t.username || "member") + "</td>" +
        "<td class='n'>" + (t.replies || 0) + "</td></tr>" +
        "<tr class='expand' data-ex='" + t.id + "'><td colspan='3'><div class='inner' id='th-" + t.id + "'></div></td></tr>";
    }).join("");
    listEl.innerHTML = "<table class='board'><thead><tr><th>Topic</th><th>By</th><th>Replies</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function loadList() {
    if (listEl) listEl.textContent = "Loading…";
    rpc("player_topic_list", {}).then(function (d) {
      paintList((d && d.topics) || []);
    }).catch(function () {
      if (listEl) listEl.textContent = "Lounge could not load. Refresh.";
    });
  }

  function replyHtml(r) {
    var who = String(r.name || r.username || "member");
    var house = /desire admin/i.test(who) || /desire admin/i.test(r.username || "");
    return "<div class='reply" + (house ? " house" : "") + "'><b>" + esc(house ? "Desire Admin" : who) + "</b> · " + when(r.at) +
      "<div>" + esc(r.body) + "</div></div>";
  }

  function paintThread(id, t, keepForm) {
    var box = document.getElementById("th-" + id);
    if (!box) return;
    if (!t || !t.ok) { box.textContent = "Gone."; return; }
    box.style.display = "block";
    var replies = (t.replies || []).map(replyHtml).join("") || "<p class='hint'>No replies yet.</p>";
    var existing = document.getElementById("replyBody");
    var draft = keepForm && existing ? existing.value : "";
    var me = acc();
    var desk = deskOn();
    var form = (me && me.verified) || desk
      ? "<p class='hint'>" + (desk ? "Reply as Desire Admin" : "Reply") + "</p><textarea id='replyBody' maxlength='400' placeholder='Keep it short.'></textarea>" +
        "<button type='button' id='replyGo'>Reply</button><p class='hint' id='replyNote'></p>"
      : "<p class='hint'><a href='account.html'>Login</a> as a verified member to reply.</p>";
    box.innerHTML = "<p class='thread-op'>" + esc(t.body) + "</p><div id='replyList'>" + replies + "</div>" + form;
    if (draft && document.getElementById("replyBody")) document.getElementById("replyBody").value = draft;
  }

  function openTopic(id) {
    openId = id;
    document.querySelectorAll(".board tr.line").forEach(function (tr) {
      tr.classList.toggle("open", tr.getAttribute("data-tid") === id);
    });
    var box = document.getElementById("th-" + id);
    if (!box) return;
    box.style.display = "block";
    box.textContent = "Opening…";
    rpc("player_topic_get", { p_topic: id }).then(function (t) { paintThread(id, t, false); });
  }

  setInterval(function () {
    if (!openId) return;
    var box = document.getElementById("th-" + openId);
    if (!box) return;
    rpc("player_topic_get", { p_topic: openId }).then(function (t) {
      if (!t || !t.ok) return;
      var have = box.querySelectorAll(".reply").length;
      var next = (t.replies || []).length;
      if (next !== have) paintThread(openId, t, true);
    });
  }, 8000);

  document.addEventListener("click", function (e) {
    var line = e.target.closest && e.target.closest("tr.line");
    if (line) openTopic(line.getAttribute("data-tid"));
  });

  var start = document.getElementById("startBox");
  var title = document.getElementById("topicTitle");
  if (title) title.addEventListener("focus", function () {
    if (start) start.classList.add("open");
  });
  var go = document.getElementById("topicGo");
  if (go) go.onclick = function () {
    var me = acc();
    if (!me || !me.id || !me.verified) {
      if (note) note.textContent = "Login and Activate first.";
      return;
    }
    var t = ((document.getElementById("topicTitle") || {}).value || "").trim();
    var b = ((document.getElementById("topicBody") || {}).value || "").trim();
    if (!t || !b) { if (note) note.textContent = "Subject and first post."; return; }
    if (note) note.textContent = "Posting…";
    rpc("player_topic_add", { p_id: me.id, p_title: t.slice(0, 80), p_body: b.slice(0, 400) }).then(function (row) {
      if (!row || row.ok === false) {
        if (note) note.textContent = (row && row.error) || "Could not post.";
        return;
      }
      if (note) note.textContent = "Posted.";
      document.getElementById("topicTitle").value = "";
      document.getElementById("topicBody").value = "";
      loadList();
    }).catch(function (err) {
      if (note) note.textContent = String(err.message || err);
    });
  };

  document.addEventListener("click", function (e) {
    if (e.target.id !== "replyGo") return;
    var me = acc();
    var desk = deskOn();
    if ((!me || !me.id || !me.verified) && !desk) return;
    var body = ((document.getElementById("replyBody") || {}).value || "").trim();
    if (!body || !openId) return;
    var note = document.getElementById("replyNote");
    if (note) note.textContent = "Sending…";
    var call = desk
      ? rpc("desk_topic_reply", { p_pin: deskPin(), p_topic: openId, p_body: body.slice(0, 400) })
      : rpc("player_reply_add", { p_id: me.id, p_topic: openId, p_body: body.slice(0, 400) });
    call.then(function (row) {
      if (row && row.ok === false) {
        if (note) note.textContent = row.error === "bad pin" ? "Unlock the desk again, then reply." : (row.error || "Could not reply.");
        return;
      }
      if (note) note.textContent = "";
      openTopic(openId);
      loadList();
    }).catch(function () {
      if (note) note.textContent = "Could not reply.";
    });
  });

  loadList();
})();
