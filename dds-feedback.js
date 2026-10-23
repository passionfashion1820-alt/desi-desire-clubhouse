(function (w) {
  var HOUSE = "desiremodel145@gmail.com";
  function cfg() { return w.DDS_SUPABASE || {}; }
  function base() { return String(cfg().url || "").replace(/\/$/, ""); }
  function headers(json) {
    var h = { apikey: cfg().anon, Authorization: "Bearer " + cfg().anon };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }
  w.DDS_FEEDBACK = {
    houseMail: HOUSE,
    send: function (row) {
      return fetch(base() + "/rest/v1/player_feedback", {
        method: "POST",
        headers: Object.assign(headers(true), { Prefer: "return=minimal" }),
        body: JSON.stringify(row)
      }).then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error(t || r.status); });
      });
    },
    list: function () {
      return fetch(base() + "/rest/v1/player_feedback?select=*&order=created_at.desc&limit=80", {
        headers: headers(false)
      }).then(function (r) { return r.ok ? r.json() : []; });
    },
    mark: function (id, status) {
      return fetch(base() + "/rest/v1/player_feedback?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: Object.assign(headers(true), { Prefer: "return=minimal" }),
        body: JSON.stringify({ status: status, answered_at: new Date().toISOString() })
      });
    },
    remove: function (id) {
      return fetch(base() + "/rest/v1/player_feedback?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: headers(false)
      });
    },
    gmailReply: function (row) {
      var to = row.want_reply && row.player_email ? row.player_email : HOUSE;
      var cc = row.want_reply && row.player_email ? HOUSE : "";
      var sub = "Desi Desire · " + (row.slut || "house") + " feedback";
      var body = "Player: " + (row.player_name || "anon") + "\nModel: " + (row.slut || "") +
        "\nWant reply: " + (row.want_reply ? "yes" : "no") +
        "\n\n" + (row.message || "");
      var url = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) +
        (cc ? "&cc=" + encodeURIComponent(cc) : "") +
        "&su=" + encodeURIComponent(sub) +
        "&body=" + encodeURIComponent(body);
      return url;
    }
  };
})(window);
