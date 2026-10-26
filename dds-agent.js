(function (w) {
  function liveSlabs() {
    var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
    return {
      bronze: Number(sl.bronze || 50),
      silver: Number(sl.silver || 150),
      gold: Number(sl.gold || 700),
      elite: Number(sl.elite || 1500),
      platinum: Number(sl.platinum || 2500),
      signup: Number(sl.signup || 100)
    };
  }
  function liveStatus() {
    var st = (window.DDS_CFG && window.DDS_CFG.status) || {};
    return {
      member: st.member || {min:30, slips:2},
      bronze: st.bronze || {min:30, slips:2},
      silver: st.silver || {min:45, slips:3},
      gold: st.gold || {min:60, slips:5},
      elite: st.elite || {min:90, slips:10},
      platinum: st.platinum || {min:120, slips:0}
    };
  }

  var MODELS = [
    { id: "preethi", name: "Preethi", title: "Ass Queen", age: 37, meas: "36C-34-44", origin: "Chennai Tamil", sf: "Moderate", df: "Very High after she opens", door: "middle", tags: "chennai ass slow dusk", blurb: "Soft Chennai body. The ass is the door. Not a five-minute strip." },
    { id: "diya", name: "Diya", title: "Bust Queen", age: 34, meas: "36DD-34-40", origin: "Madurai", sf: "Very Strict", df: "Low", door: "hard", tags: "madurai slow corrupt", blurb: "Innocent face. Slow corrupt. Madurai, not Saurashtra." },
    { id: "meghana", name: "Meghana", title: "Curve Queen", age: 36, meas: "36D-34-36", origin: "Kannadiga", sf: "Strict", df: "High after she opens", door: "hard", tags: "kannadiga pride estate curve", blurb: "Curve Queen. Kannadiga pride. Do not cheapen her." },
    { id: "kiara", name: "Kiara", title: "Luxury Queen", age: 40, meas: "34C-32-34", origin: "Delhi", sf: "Very Strict", df: "Low", door: "hard", tags: "delhi closed class luxury", blurb: "Closed class. Not filthy for free." },
    { id: "sravani", name: "Sravani", title: "Filthy Amma", age: 45, meas: "34C-34-36", origin: "Telugu village", sf: "Strictest", df: "Extreme only after she breaks", door: "hardest", tags: "village amma courtyard", blurb: "Village Amma face. Hardest door in the house." },
    { id: "natasha", name: "Natasha", title: "Pride Queen", age: 36, meas: "34D-34-38", origin: "Goa", sf: "Very Strict", df: "Very High under her control", door: "hard", tags: "goa control coast pride", blurb: "Pride Queen. Control. She likes you under her. Goa, not Bengaluru." },
    { id: "ayesha", name: "Ayesha", title: "Guilt Queen", age: 36, meas: "34D-34-34", origin: "Tamil Muslim", sf: "Moderate-Strict", df: "Very High after she opens", door: "hard", tags: "modest guilt faith hijab", blurb: "Guilt Queen. Modest. The door is not easy." },
    { id: "meenakshi", name: "Meenakshi Pillai", title: "Milf Definition · Most Erotic", age: 45, meas: "36C-34-44", origin: "Tamil", sf: "Extremely Accommodative", df: "Extreme after she claims you", door: "easy", tags: "older tamil kitchen warm milf erotic grand opening", blurb: "Most erotic door. Grand opening 4 Oct 2026. Traditional Tamil heat. Extreme once she claims you." },
    { id: "tharini", name: "Tharini", title: "Mumbai polish", age: 34, meas: "34D-34-36", origin: "Mumbai", sf: "Moderate", df: "High", door: "middle", tags: "mumbai polish city", blurb: "Mumbai polish. Live door." },
    { id: "esther", name: "Esther", title: "Soft Queen", age: 37, meas: "34C-34-38", origin: "Tamil Christian", sf: "Highly Accommodative", df: "High after she opens", door: "easy", tags: "soft guilty church", blurb: "Soft Queen. Tamil Christian, not Kerala." },
    { id: "kavya", name: "Kavya", title: "Iyengar composure", age: 36, meas: "34DD-34-42", origin: "Tamil Iyengar", sf: "Moderate-Strict", df: "High after she opens", door: "hard", tags: "iyengar composure respectable", blurb: "Iyengar composure. Live door." },
    { id: "lahari", name: "Lahari", title: "Hyderabad queen", age: 40, meas: "36C-34-34", origin: "Hyderabad Telugu", sf: "Moderate", df: "High", door: "middle", tags: "hyderabad queen telugu", blurb: "Hyderabad queen. Live door." },
    { id: "navya", name: "Navya", title: "Kochi soft-expensive", age: 38, meas: "34D-34-34", origin: "Kochi Malayali", sf: "Moderate", df: "High", door: "middle", tags: "kochi rain soft", blurb: "Kochi soft-expensive. Live." },
    { id: "simran", name: "Simran", title: "Rajasthan grace", age: 38, meas: "36DD-34-38", origin: "Rajasthan", sf: "Very Strict", df: "Low", door: "hard", soon: "20 Oct 2026", tags: "rajasthan grace closed", blurb: "Rajasthan grace. Very hard door. Profile open. Room 20 Oct 2026." }
  ];
  var COMING = [
    { name: "Meenakshi Pillai", when: "4 Oct 2026" },
    { name: "Navya", when: "12 Oct 2026" },
    { name: "Simran", when: "20 Oct 2026" }
  ];


  var BLOCK = /admin\.html|desirescoutadmin|admin_art|admin_slabs|adminpin|admin pin|password|passcode|staff url|secret key|anon key|service role|peaches1820|spin-check|review-check|supabase-config/i;
  var STAFF_ASK = /\b(admin page|admin url|admin link|staff login|desk password|admin password|unlock pin|what is the pin|tell me the pin|backend|supabase key)\b/i;
  function scrub(html) {
    return String(html || "")
      .replace(/admin(_art|_slabs)?\.html|desirescoutadmin\.html/gi, "[blocked]")
      .replace(/peaches1820/gi, "[blocked]")
      .replace(/sb_[a-z0-9_]+/gi, "[blocked]");
  }

  var FAQ = [
    { k: "what game purple chat strip desidesire syndicate brand", a: "<b>PURPLE</b> — Chat and Strip. Powered by DesiDesireSyndicate. Slow-burn text. One woman. Stay in a role. Clothes move when #tON hits the next mark. 21+.<br><a href=\"how_to_play.html\">How to Play</a> · <a href=\"index.html#lineup\">Lineup</a>" },
    { k: "how play start enter room click account login register guest", a: "Guests can read the lineup. To play, create an account, wait for Activate, then Click to Play on her page. Stay on the page until the room pops.<br><a href=\"account.html\">Account</a> · <a href=\"how_to_play.html\">How to Play</a>" },
    { k: "dps desire points silver gold elite platinum bronze member perks buy", a: function(){var s=liveSlabs();return "Signup starts at "+s.signup+" DPS. Bronze "+s.bronze+" · Silver "+s.silver+" · Gold "+s.gold+" · Elite "+s.elite+" · Platinum "+s.platinum+". Higher status: longer nights, more spins, more stills.<br><a href=\"account.html\">Your nights and status</a> · <a href=\"how_to_play.html\">How to Play</a>";} },
    { k: "time minutes clock pack plus 15 gold 75 session length", a: function(){var s=liveStatus();return "Night length follows Desire standing. Member "+s.member.min+" min / "+s.member.slips+" slips. Bronze "+s.bronze.min+"/"+s.bronze.slips+". Silver "+s.silver.min+"/"+s.silver.slips+". Gold "+s.gold.min+"/"+s.gold.slips+". Elite "+s.elite.min+"/"+s.elite.slips+". Platinum "+s.platinum.min+"/none.<br><a href=\"how_to_play.html\">How to Play</a>";} },
    { k: "levels strip pictures 10 ton affinity", a: "Level 0 is dressed. Ten levels. Affinity unlocks the next still. A spin, review, or offer does not skip a clothes level.<br><a href=\"how_to_play.html\">How to Play</a>" },
    { k: "ton toff strike slips help metrics", a: function(){ var t=(window.DDS_CFG||{}).toffCaps||{}; return "Turn-offs follow standing. Member and Bronze " + (t.member||2) + ". Silver " + (t.silver||3) + ". Gold " + (t.gold||5) + ". Elite " + (t.elite||10) + ". Platinum none. Type #HELP if you are stuck. Type #metrics for a plain read.<br><a href=\"how_to_play.html\">How to Play</a>"; } },
    { k: "board rank desire queen crown elite top strong good slab model status", a: function(){ var s=(window.DDS_CFG||{}).slabs||{}; return "Model Desire status is from the board. Queen " + (s.sovereign||3000) + " · Crown " + (s.crown||2500) + " · Desire Elite " + (s.superElite||2000) + " · Elite " + (s.elite||1500) + " · Top " + (s.top||1200) + " · Strong " + (s.strong||1000) + " · Good " + (s.good||750) + ". Scores come from rating, nights, hearts, favorites, and owns. Views add zero.<br><a href=\"club.html\">Board</a>"; } },
    { k: "lock 20 minutes another woman reset wait room", a: "One open request at a time. After a room is sent, wait 20 minutes before another woman.<br><a href=\"account.html\">Account</a>" },
    { k: "offer code spin review endreview mid spin3", a: "Three spins a day with her. Paste the full SPIN3 code. She reads it and tells you the win. ENDREVIEW works in a later room with her, one use. Old relationship codes are dead. Do not type review submitted.<br><a href=\"how_to_play.html\">How to Play</a>" },
    { k: "favorites owned by gold five nights hearts", a: "Two favorites, locked 20 days. Own by buying only. No nights path. Next room starts half-open unless you tick usual on Account. Hearts on her profile count toward her race.<br><a href=\"account.html\">Account</a>" },
    { k: "amazon buy rank gift card silver gold elite platinum", a: "Buy a rank from Account with an Amazon card in the exact amount. Silver $2 / ₹250 · Gold $5 / ₹500 · Elite $10 / ₹1000 · Platinum $20 / ₹2000. The desk grants the floor after the card clears. An invalid card is rejected and your rank does not move.<br><a href=\"account.html\">Account</a>" },
    { k: "relationship code rel retired dead", a: "Relationship codes are retired. Do not paste REL-. The house already knows you from your account. She reads your card when the room opens." },
    { k: "idle unverified activate reverify", a: "Five days with no login, no inbox check, and no model night puts the account back to unverified. Inbox and house letters still work. Tap Re-verify to play again. Rank stays.<br><a href=\"account.html\">Account</a>" },
    { k: "coming soon wave meenakshi navya simran open date", a: "Meenakshi grand opening 4 Oct, most erotic door. Navya opens 12 Oct. Simran opens 20 Oct. Click to Play on a future door only takes how badly you need her until that morning. Kavya and Lahari are live.<br><a href=\"index.html#lineup\">Lineup</a>" },
    { k: "demo try sample", a: "Open the Demo to see how a room talks.<br><a href=\"https://desireclubchat.netlify.app/desi_desire_chat_demo.html\">Open Demo</a>" },
    { k: "age 21 donate house rules disclaimer", a: "21+ only. House rules and disclaimer sit on The House page.<br><a href=\"house.html\">The House</a> · <a href=\"disclaimer.html\">Disclaimer</a>" },
    { k: "compare selector hints board lineup race sensational", a: "Board is the Desire race plus hourly desk copy. Selector filters doors. Compare puts two women on one page.<br><a href=\"club.html\">Board</a> · <a href=\"selector.html\">Selector</a> · <a href=\"compare.html\">Compare</a>" }
  ];

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9#+\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tokens(s) { return norm(s).split(" ").filter(function (w) { return w.length > 2; }); }
  function score(hay, qTokens) {
    var h = " " + norm(hay) + " ";
    var n = 0;
    qTokens.forEach(function (w) { if (h.indexOf(" " + w + " ") !== -1) n += 2; else if (h.indexOf(w) !== -1) n += 1; });
    return n;
  }
  function modelByName(q) {
    var n = norm(q);
    for (var i = 0; i < MODELS.length; i++) {
      if (n.indexOf(MODELS[i].id) !== -1 || n.indexOf(norm(MODELS[i].name)) !== -1) return MODELS[i];
    }
    return null;
  }
  function linksFor(m) {
    return '<a href="' + m.id + '.html">' + m.name + "</a> · <a href=\"contact_to_play.html?slut=" + m.id + "\">Click Here To Play</a>";
  }
  function card(m) {
    return "<b>" + m.name + "</b>" + (m.title ? " — " + m.title : "") + " · " + m.age + " · " + m.meas + " · " + m.origin +
      "<br>Wall: " + m.sf + " · Dirt: " + m.df +
      (m.soon ? "<br>Room opens " + m.soon + ". Click to Play only takes how badly you need her." : "") +
      "<br>" + m.blurb + "<br>" + linksFor(m);
  }
  function pick(door, dirty, body) {
    var pool = MODELS.filter(function (m) {
      if (door && m.door !== door) return false;
      if (dirty === "filthy" && /low/i.test(m.df)) return false;
      if (dirty === "classy" && /extreme|very high/i.test(m.df) && m.door === "easy") return false;
      if (body === "ass" && m.meas.indexOf("44") === -1) return false;
      if (body === "bust" && m.meas.indexOf("DD") === -1 && m.id !== "diya") return false;
      if (body === "luxury" && m.id !== "kiara") return false;
      if (body === "mother" && m.id !== "sravani" && m.id !== "meenakshi") return false;
      return true;
    });
    if (!pool.length) pool = MODELS.filter(function (m) { return !door || m.door === door; });
    if (!pool.length) pool = MODELS.slice();
    return pool.slice(0, 2);
  }

  function answer(raw) {
    var q = norm(raw);
    var qt = tokens(raw);
    if (!q) return { html: "Ask the desk a question, or say who you want.", chips: chipsHome() };
    if (STAFF_ASK.test(raw) || BLOCK.test(raw)) {
      return { html: "The desk does not give staff pages, passwords, or house keys. Ask about play, women, or the wait.", chips: chipsHome() };
    }

    if (/choose|pick|recommend|which (girl|woman|slut|model)|who should|best for me|help me choose/.test(q)) {
      return {
        html: "Tell the desk how you want the door.<br>Easy / middle / hard.<br>Soft talk or filthy.<br>Ass, bust, luxury, or motherly.",
        chips: ["Easy door", "Middle door", "Hard door", "Filthy talk", "Soft classy", "Ass", "Bust", "Luxury", "Motherly"]
      };
    }

    var door = /easy|beginner|first time/.test(q) ? "easy" : /middle|medium/.test(q) ? "middle" : /hardest|strictest/.test(q) ? "hardest" : /hard|strict/.test(q) ? "hard" : "";
    var dirty = /filth|dirty|nasty|degrad/.test(q) ? "filthy" : /classy|soft|refined|luxury|elegant/.test(q) ? "classy" : "";
    var body = /ass|44/.test(q) ? "ass" : /bust|dd|boob|chest/.test(q) ? "bust" : /luxury|queen|spoil/.test(q) ? "luxury" : /amma|akka|mother|aunty/.test(q) ? "mother" : "";
    if (door || (dirty && body) || (body && /want|like|into/.test(q))) {
      var rec = pick(door || "", dirty, body);
      return { html: "The desk would send you here:<br><br>" + rec.map(card).join("<br><br>"), chips: rec.map(function (m) { return m.name; }) };
    }

    var named = modelByName(q);
    if (named) {
      return { html: card(named) + "<br><br>Read her page before you enter. One woman per request.", chips: ["How to play", "Click Here To Play", named.name + " hints"] };
    }

    var best = { s: 0, a: "" };
    FAQ.forEach(function (f) {
      var ans = typeof f.a === "function" ? f.a() : f.a;
      var s = score(f.k + " " + ans, qt);
      if (s > best.s) best = { s: s, a: ans };
    });
    if (best.s >= 2) {
      return { html: best.a + moreLinks(q), chips: chipsHome() };
    }
    return {
      html: "The desk did not catch that. Use a link below, or name a woman.<br><a href=\"how_to_play.html\">How to Play</a> · <a href=\"selector.html\">Selector</a> · <a href=\"compare.html\">Compare</a> · <a href=\"contact_to_play.html\">Click Here To Play</a> · <a href=\"hints.html\">Hints</a>",
      chips: chipsHome()
    };
  }


  function moreLinks(q) {
    var extra = [];
    if (/offer|code|spin|review/.test(q)) extra.push('<a href="offer.html">Offers</a>');
    if (/choose|pick|select|compare/.test(q)) extra.push('<a href="selector.html">Selector</a>','<a href="compare.html">Compare</a>');
    if (/hint/.test(q)) extra.push('<a href="hints.html">Hints</a>');
    if (!extra.length) return "";
    return "<br>" + extra.join(" · ");
  }
  function chipsHome() {
    return ["How to play", "Desire Points", "Choose a model", "Kavya", "Board", "Account"];
  }

  function mount() {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (/session|admin|spin-check|review-check|admin_art|admin_slabs/.test(page)) return;
    if (document.getElementById("dds-desk-btn")) return;

    var css = document.createElement("style");
    css.textContent =
      "#dds-desk-btn{position:fixed;right:18px;bottom:96px;z-index:90;width:58px;height:58px;border-radius:50%;background:linear-gradient(180deg,#9a2f3c,#4c1d95);color:#f8e7b0;border:1px solid #b794f6;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0}" +
      "#dds-desk-btn svg{width:22px;height:22px;fill:none;stroke:#f8e7b0;stroke-width:1.8}" +
      "#dds-desk-btn .dds-desk-lab{font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;color:#f8e7b0;font-weight:700}" +
      "#dds-desk-btn:hover{filter:brightness(1.08)}" +
      "#dds-desk-panel{display:none;position:fixed;right:18px;bottom:164px;z-index:91;width:min(380px,calc(100vw - 24px));height:min(520px,70vh);background:#12080a;border:1px solid #b794f6;box-shadow:0 16px 40px rgba(0,0,0,.55);flex-direction:column}" +
      "#dds-desk-panel.on{display:flex}" +
      "#dds-desk-panel header{padding:.7rem .85rem;border-bottom:1px solid #4a2c2f;color:#e9d5ff;font-weight:700;display:flex;justify-content:space-between;align-items:center}" +
      "#dds-desk-log{flex:1;overflow:auto;padding:.8rem;display:flex;flex-direction:column;gap:.55rem}" +
      ".dds-bbl{padding:.65rem .7rem;border-radius:8px;font-size:.92rem;line-height:1.45;color:#f3e9d7}" +
      ".dds-bbl.desk{background:#1c1012;border:1px solid #4a2c2f}" +
      ".dds-bbl.you{background:#2a1810;border:1px solid #7a5a28;align-self:flex-end}" +
      ".dds-bbl a{color:#e9d5ff}" +
      "#dds-desk-chips{display:flex;flex-wrap:wrap;gap:.35rem;padding:0 .7rem .5rem}" +
      "#dds-desk-chips button{background:#1a1010;color:#f8e7b0;border:1px solid #5a3f28;padding:.28rem .5rem;font-size:.78rem;cursor:pointer}" +
      "#dds-desk-form{display:flex;gap:.4rem;padding:.65rem;border-top:1px solid #4a2c2f}" +
      "#dds-desk-form input{flex:1;background:#0a0809;border:1px solid #5a3f28;color:#f3e9d7;padding:.55rem}" +
      "#dds-desk-form button{background:#6a1c26;color:#f8e7b0;border:1px solid #b794f6;padding:.55rem .7rem;cursor:pointer}";
    document.head.appendChild(css);

    var btn = document.createElement("button");
    btn.id = "dds-desk-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Ask the Desk");
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H7l-3 3V5z"/></svg><span class="dds-desk-lab">Desk</span>';
    var panel = document.createElement("div");
    panel.id = "dds-desk-panel";
    panel.innerHTML =
      "<header>Desire Desk <button type='button' id='dds-desk-x' style='background:none;border:0;color:#f8e7b0;cursor:pointer'>✕</button></header>" +
      "<div id='dds-desk-log'></div>" +
      "<div id='dds-desk-chips'></div>" +
      "<form id='dds-desk-form'><input id='dds-desk-q' placeholder='Ask how to play or who to pick' autocomplete='off'/><button type='submit'>Send</button></form>";
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var log = panel.querySelector("#dds-desk-log");
    function add(who, html) {
      var d = document.createElement("div");
      d.className = "dds-bbl " + who;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }
    function setChips(list) {
      var box = panel.querySelector("#dds-desk-chips");
      box.innerHTML = (list || []).map(function (c) {
        return "<button type='button' data-q=\"" + String(c).replace(/\"/g, "") + "\">" + c + "</button>";
      }).join("");
    }
    function ask(text) {
      add("you", text.replace(/</g, "&lt;"));
      var out = answer(text);
      add("desk", out.html);
      setChips(out.chips);
    }
    add("desk", "Desire Desk. I know the house pages. Ask how the game works, or I will help you pick a woman.");
    setChips(chipsHome());

    btn.onclick = function () { panel.classList.toggle("on"); };
    panel.querySelector("#dds-desk-x").onclick = function () { panel.classList.remove("on"); };
    panel.querySelector("#dds-desk-chips").addEventListener("click", function (e) {
      var q = e.target.getAttribute("data-q");
      if (!q) return;
      if (q === "Click Here To Play") { location.href = "contact_to_play.html"; return; }
      if (/hints/i.test(q)) { location.href = "hints.html"; return; }
      ask(q);
    });
    panel.querySelector("#dds-desk-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = panel.querySelector("#dds-desk-q");
      var v = input.value.trim();
      if (!v) return;
      input.value = "";
      ask(v);
    });
  }

  function safeAnswer(raw) {
    var out = answer(raw) || { html: "", chips: chipsHome() };
    out.html = scrub(out.html);
    if (BLOCK.test(out.html)) out.html = "The desk can only talk about public house pages.";
    return out;
  }
  function loadExtraFaq() {
    var cfg = w.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) return;
    fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/desk_faq?select=q,a,tags&order=q.asc&limit=400", {
      headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      (rows || []).forEach(function (row) {
        if (!row || !row.a) return;
        if (BLOCK.test(row.q || "") || BLOCK.test(row.a)) return;
        FAQ.push({ k: String(row.q || "") + " " + String(row.tags || ""), a: String(row.a) });
      });
    }).catch(function () {});
  }
  w.DDS_AGENT = { answer: safeAnswer, models: MODELS, coming: COMING, mount: mount };
  loadExtraFaq();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window);
