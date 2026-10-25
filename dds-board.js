(function () {
  var LIVE_ORDER = ["preethi","diya","meghana","kiara","sravani","natasha","ayesha","tharini","esther","kavya","lahari","navya","simran","chandana","aleena"];
  var TRAINER_ORDER = ["anu","meenakshi"];

  function applyLiveRanks(rows) {
    var pillMap = { "Desire Queen":"pill-sovereign", "Desire Crown":"pill-crown", "Desire Elite":"pill-super", Elite:"pill-elite", Top:"pill-top", Strong:"pill-strong", Good:"pill-good", New:"pill-new" };
    var have = {};
    (rows || []).forEach(function (r) { if (r && r.slut) have[r.slut] = r; });
    LIVE_ORDER.forEach(function (slug) {
      if (!have[slug]) have[slug] = { slut: slug, desire_score: 0, tier: "New", rank: 99 };
    });
    rows = LIVE_ORDER.map(function (slug) { return have[slug]; }).filter(Boolean);
    rows.sort(function (a, b) {
      var ds = Number(b.desire_score || 0) - Number(a.desire_score || 0);
      if (ds) return ds;
      return String(a.slut || "").localeCompare(String(b.slut || ""));
    });
    var lastRanks = {};
    var moves = {};
    var KEEP = 4 * 24 * 60 * 60 * 1000;
    var now = Date.now();
    var pack = {};
    try { pack = JSON.parse(localStorage.getItem("dds_lineup_rank") || "null") || {}; } catch (e) { pack = {}; }
    lastRanks = pack.map || {};
    try { moves = JSON.parse(localStorage.getItem("dds_rank_moves") || "{}") || {}; } catch (e) { moves = {}; }
    rows.forEach(function (r, i) {
      r.tier = badgeFor(r);
      r.rank = i + 1;
      var cards = document.querySelectorAll('a.poster-card[data-slut="' + r.slut + '"], a.poster-card[href="' + r.slut + '.html"]');
      var printed = 0;
      cards.forEach(function (card) {
        var badge = card.querySelector(".rank-badge");
        var m = badge && String(badge.textContent || "").match(/RANK\s*#\s*(\d+)/i);
        if (m) printed = Number(m[1]);
      });
      var was = Number(lastRanks[r.slut] || printed || 0);
      if (was && was !== r.rank) {
        var prev = moves[r.slut];
        var from = (prev && Number(prev.from)) || was;
        if (from !== r.rank) {
          moves[r.slut] = { from: from, to: r.rank, dir: r.rank < from ? "up" : "down", at: (prev && prev.at) || now };
        }
      }
      var rec = moves[r.slut];
      if (rec && Number(rec.to) === Number(rec.from)) {
        delete moves[r.slut];
        rec = null;
      } else if (rec && Number(rec.from) === r.rank) {
        delete moves[r.slut];
        rec = null;
      } else if (rec && now - Number(rec.at || 0) > KEEP) {
        delete moves[r.slut];
        rec = null;
      }
      var move = rec && rec.dir ? rec.dir : "";
      cards.forEach(function (card) {
        var frame = { "Desire Queen":"tier-queen", "Desire Crown":"tier-crown", "Desire Elite":"tier-desire", Elite:"tier-elite", Top:"tier-top", Strong:"tier-strong", Good:"tier-good", New:"tier-new" };
        card.className = card.className.replace(/\btier-\S+/g, "").replace(/\s+/g, " ").trim();
        card.classList.add(frame[r.tier] || "tier-new");
        card.classList.toggle("rank-1", r.rank === 1);
        card.classList.toggle("elite-card", /Elite|Crown|Sovereign/i.test(String(r.tier)) && r.rank !== 1);
        card.classList.toggle("super-card", /Desire Queen|Desire Crown|Desire Elite|Super Elite|Crown|Sovereign/i.test(String(r.tier)));
        var badge = card.querySelector(".rank-badge");
        if (badge) {
          var chev = '<svg class="rank-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.2 L12 12.2 L20 6.2"/><path d="M4 11.1 L12 17.1 L20 11.1"/><path d="M4 16 L12 22 L20 16"/></svg>';
          var arrow = move === "up" ? '<span class="rank-arrow up" title="moved up">' + chev + "</span> " : (move === "down" ? '<span class="rank-arrow down" title="moved down">' + chev + "</span> " : "");
          badge.innerHTML = arrow + "RANK #" + r.rank;
        }
        var pill = card.querySelector(".pill");
        if (pill) pill.remove();
      });
    });
    
    // You own + nights
    rows.forEach(function (r) {
      var cards = document.querySelectorAll('a.poster-card[data-slut="' + r.slut + '"]');
      cards.forEach(function (card) {
        var overlay = card.querySelector(".poster-overlay");
        if (!overlay) return;
        /* badges painted by paintMineBadges after owns/fans load */
        var nights = card.querySelector(".poster-nights");
        if (!nights) {
          nights = document.createElement("div");
          nights.className = "poster-nights";
          var meta = overlay.querySelector(".poster-meta");
          if (meta) overlay.insertBefore(nights, meta.nextSibling);
          else overlay.appendChild(nights);
        }
        var n = Number(r.sessions || 0);
        nights.textContent = n ? (n + " nights") : "";
        nights.style.display = n ? "block" : "none";
        var price = card.querySelector(".poster-price");
        if (!price) {
          price = document.createElement("div");
          price.className = "poster-price";
          price.style.cssText = "font-size:.72rem;color:#e8c45a;margin-top:.15rem";
          nights.parentNode.insertBefore(price, nights.nextSibling);
        }
        var doorPrice = (window.DDS_CFG && window.DDS_CFG.doorPrice && Number(window.DDS_CFG.doorPrice[r.slut])) || 0;
        var tier = String(r.tier || "New");
        var base = 10, prem = 0;
        if (/queen|sovereign/i.test(tier)) prem = 40;
        else if (/crown/i.test(tier)) prem = 30;
        else if (/desire elite|super elite/i.test(tier)) prem = 20;
        else if (/elite/i.test(tier)) prem = 15;
        else if (/top/i.test(tier)) prem = 10;
        else if (/strong/i.test(tier)) prem = 5;
        var rawPrice = doorPrice > 0 ? doorPrice : (base + prem);
        var owns = [];
        var st = "";
        try {
          var acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
          var rawOwn = acc.owns || acc.owned || localStorage.getItem("dds_owns") || "";
          if (rawOwn && rawOwn !== "none") owns = String(rawOwn).toLowerCase().split(/[,|\s]+/).filter(Boolean);
          if (typeof playerStatus === "function") st = playerStatus();
          else if (acc.dps != null) {
            var pts = Number(acc.dps || 0);
            var sl = (window.DDS_CFG && window.DDS_CFG.dpsSlabs) || {};
            if (pts >= Number(sl.platinum || 2500)) st = "platinum";
            else if (pts >= Number(sl.elite || 1500)) st = "elite";
            else if (pts >= Number(sl.gold || 700)) st = "gold";
            else if (pts >= Number(sl.silver || 150)) st = "silver";
            else if (pts >= Number(sl.bronze || 50)) st = "bronze";
          }
        } catch (e) {}
        var pct = 0;
        if (owns.indexOf(String(r.slut || "").toLowerCase()) !== -1) {
          rawPrice = 0;
        } else if (st === "bronze") pct = 10;
        else if (st === "silver") pct = 25;
        else if (st === "gold" || st === "elite" || st === "platinum") pct = 30;
        var show = rawPrice === 0 ? 0 : Math.max(0, Math.round(rawPrice * (100 + pct) / 100));
        price.textContent = show + " DPS";
      });
    });

    
    // Favorite heart + own progress
    (function paintMine() {
      var acc = {};
      try { acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {}; } catch (e) {}
      var favs = [];
      if (acc.fav1) favs.push(String(acc.fav1).toLowerCase());
      if (acc.fav2) favs.push(String(acc.fav2).toLowerCase());
      if (acc.fav && acc.fav !== "none") {
        String(acc.fav).toLowerCase().split(/[,|\s]+/).forEach(function (f) { if (f && favs.indexOf(f) === -1) favs.push(f); });
      }
      var st = String(acc.st || acc.status || "").toLowerCase();
      var canOwn = /silver|gold|elite|platinum/.test(st);
      var need = /gold|elite|platinum/.test(st) ? 3 : 5;
      rows.forEach(function (r) {
        var cards = document.querySelectorAll('a.poster-card[data-slut="' + r.slut + '"]');
        cards.forEach(function (card) {
          var overlay = card.querySelector(".poster-overlay");
          if (!overlay) return;
          var heart = card.querySelector(".fav-heart");
          if (favs.indexOf(r.slut) !== -1) {
            if (!heart) {
              heart = document.createElement("span");
              heart.className = "fav-heart";
              heart.textContent = "♥";
              var name = overlay.querySelector(".poster-name");
              if (name) name.parentNode.insertBefore(heart, name);
            }
          } else if (heart) heart.remove();
          var prog = card.querySelector(".own-prog");
          if (canOwn && !(window.DDS_playerOwns && window.DDS_playerOwns(r.slut))) {
            if (!prog) {
              prog = document.createElement("div");
              prog.className = "own-prog";
              var nightsEl = overlay.querySelector(".poster-nights");
              if (nightsEl) nightsEl.parentNode.insertBefore(prog, nightsEl.nextSibling);
              else overlay.appendChild(prog);
            }
            prog.textContent = "… of " + need;
            prog.style.display = "block";
          } else if (prog) prog.remove();
        });
      });
      // Fill nights if we can
      var cfg = window.DDS_SUPABASE || {};
      var id = acc.id || acc.player_id;
      if (!id || !cfg.url) return;
      var url = String(cfg.url).replace(/\/$/, "") + "/rest/v1/player_sessions?select=model_slug&player_id=eq." + encodeURIComponent(id) + "&level_reached=not.in.(0,L0)";
      fetch(url, { headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon } })
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (list) {
          var counts = {};
          (list || []).forEach(function (row) {
            var s = String(row.model_slug || "").toLowerCase();
            if (s) counts[s] = (counts[s] || 0) + 1;
          });
          document.querySelectorAll(".own-prog").forEach(function (el) {
            var card = el.closest("a.poster-card");
            if (!card) return;
            var slug = (card.getAttribute("data-slut") || "").toLowerCase();
            var n = counts[slug] || 0;
            el.textContent = n + " of " + need;
          });
        }).catch(function () {});
    })();

    loadMine();
    groupLineup(rows);
    try {
      var map = {};
      rows.forEach(function (r) { map[r.slut] = r.rank; });
      localStorage.setItem("dds_lineup_rank", JSON.stringify({ t: now, map: map }));
      localStorage.setItem("dds_rank_moves", JSON.stringify(moves));
    } catch (e) {}

    var grid = document.querySelector(".poster-grid");
    if (grid) {
      var WAVE2 = [];
      var liveOrder = rows.map(function (r) { return r.slut; });
      LIVE_ORDER.forEach(function (slug) {
        if (liveOrder.indexOf(slug) === -1) liveOrder.push(slug);
      });
      var next = liveOrder.concat(WAVE2);
      next.forEach(function (slug) {
        var card = grid.querySelector('a.poster-card[data-slut="' + slug + '"]') || grid.querySelector('a.poster-card[href="' + slug + '.html"]');
        if (card) grid.appendChild(card);
      });
      var trainer = grid.querySelector("a.trainer-card");
      if (trainer) grid.insertBefore(trainer, grid.firstChild);
    }
    var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
    var qslut = (new URLSearchParams(location.search).get("slut") || "").toLowerCase();
    var focus = qslut || page;
    var mine = rows.filter(function (r) { return r.slut === focus; })[0];
    if (mine) {
      document.querySelectorAll(".rank-pill").forEach(function (el) {
        el.textContent = "Ranked No." + mine.rank + " · " + mine.tier;
      });
      document.querySelectorAll(".glory-banner .g-t").forEach(function (el) {
        el.style.display = "none";
      });
      document.querySelectorAll(".glory-banner .g-k").forEach(function (el) {
        el.style.display = "none";
      });
      document.querySelectorAll(".rank-gold-pill").forEach(function (el) {
        el.textContent = "Rank No." + mine.rank;
      });
      document.querySelectorAll(".status-purple-pill").forEach(function (el) {
        el.textContent = mine.tier || "";
      });
      if (!document.querySelector(".rank-gold-pill")) {
        document.querySelectorAll(".glory-banner").forEach(function (banner) {
          var g = document.createElement("span");
          g.className = "rank-gold-pill";
          g.textContent = "Rank No." + mine.rank;
          banner.insertBefore(g, banner.firstChild);
          var s = document.createElement("span");
          s.className = "status-purple-pill";
          s.textContent = mine.tier || "";
          banner.insertBefore(s, g.nextSibling);
        });
      }
      document.querySelectorAll(".glory-banner").forEach(function (el) {
        el.classList.toggle("throne", mine.rank === 1);
        el.classList.toggle("super", /Desire Queen|Desire Crown|Desire Elite|Super Elite|Crown|Sovereign/.test(String(mine.tier)));
      });
      document.querySelectorAll(".rank-pill").forEach(function (el) {
        el.classList.toggle("super-pill", /Desire Queen|Desire Crown|Desire Elite|Super Elite|Crown|Sovereign/.test(String(mine.tier)));
      });
      document.querySelectorAll(".rank-boast").forEach(function (el) {
        var title = "";
        var parts = el.innerText.split("·");
        if (parts.length > 1) title = parts[1].trim();
        el.innerHTML = "Ranked <b>No." + mine.rank + "</b> · " + title + " · " + mine.tier;
      });
    }
    // Trainers ranked among themselves only
    rankTrainers();

    if (window.SLUTS) {
      if (Array.isArray(window.SLUTS)) {
        window.SLUTS.forEach(function (s) {
          var hit = rows.filter(function (r) { return r.slut === s.id; })[0];
          if (!hit) return;
          s.rank = hit.rank;
          s.tier = hit.tier;
          s.score = Math.round(Number(hit.desire_score));
          s.poll = hit.poll_votes;
          s.sess = hit.sessions;
          s.avg = Number(hit.avg_rating);
        });
        if (typeof window.renderCompare === "function") window.renderCompare();
      } else {
        Object.keys(window.SLUTS).forEach(function (id) {
          var hit = rows.filter(function (r) { return r.slut === id; })[0];
          if (!hit) return;
          window.SLUTS[id].rank = "No." + hit.rank;
          window.SLUTS[id].tier = hit.tier;
        });
      }
    }
  }


  var cfg = window.DDS_SUPABASE || {};
  if (!cfg.url || String(cfg.url).indexOf("YOUR-PROJECT") !== -1) return;

  var ALIAS = {
    preetha:"preethi", vaish:"diya", tejasvi:"meghana", shilpa:"kiara",
    selvi:"sravani", kavitha:"meenakshi", fouzi:"ayesha", vinaya:"esther",
    malini:"natasha", aparna:"tharini", vaishali:"kavya", suma:"lahari",
    suvi:"navya", sukanya:"simran",
    preethi:"preethi", diya:"diya", meghana:"meghana",
    kiara:"kiara", sravani:"sravani", meenakshi:"meenakshi", ayesha:"ayesha",
    esther:"esther", natasha:"natasha", tharini:"tharini", kavya:"kavya", lahari:"lahari", navya:"navya", simran:"simran"
  };
  var KEEP = ["preethi","diya","meghana","kiara","sravani","ayesha","esther","natasha","tharini","kavya","lahari","navya","simran","chandana","aleena"];
  var NAMES = {
    preethi:"Preethi Iyer", diya:"Diya Raj", meghana:"Meghana Gowda", kiara:"Kiara Sharma",
    sravani:"Sravani Reddy", meenakshi:"Meenakshi Pillai", ayesha:"Ayesha Khan", esther:"Esther Mathew",
    natasha:"Natasha Malhotra",
    preetha:"Preethi Iyer", vaish:"Diya Raj", tejasvi:"Meghana Gowda", shilpa:"Kiara Sharma",
    selvi:"Sravani Reddy", kavitha:"Meenakshi Pillai", fouzi:"Ayesha Khan", vinaya:"Esther Mathew",
    malini:"Natasha Malhotra",
    tharini:"Tharini Rao", kavya:"Kavya Iyengar", lahari:"Lahari Naidu", navya:"Navya Menon", simran:"Simran Kaur", chandana:"Chandana Reddy", aleena:"Aleena George",
    aparna:"Tharini Rao", vaishali:"Kavya Iyengar", suma:"Lahari Naidu", suvi:"Navya Menon", sukanya:"Simran Kaur"
  };

  function tierClass(t) {
    t = String(t || "New").toLowerCase();
    if (t === "desire queen" || t === "sovereign queen" || t === "sovereign") return "tier-sovereign";
    if (t === "desire crown" || t === "crown") return "tier-crown";
    if (t === "desire elite" || t === "super elite") return "tier-super";
    if (t === "elite") return "tier-elite";
    if (t === "top") return "tier-top";
    if (t === "strong") return "tier-strong";
    if (t === "good") return "tier-good";
    return "tier-new";
  }


  var TIER_RANK = {"New":1,"Good":2,"Strong":3,"Top":4,"Elite":5,"Desire Elite":6,"Desire Crown":7,"Desire Queen":8};
  function paintWire(rows, ticks, cap) {
    var host = document.getElementById("raceWireList");
    var when = document.getElementById("raceWireWhen");
    if (!host || !rows || !rows.length) return;
    var lined = rows.map(function (r, i) {
      return {
        slug: r.slut,
        name: NAMES[r.slut] || r.slut,
        rank: i + 1,
        score: Math.round(Number(r.desire_score || 0)),
        tier: r.tier || "New"
      };
    });
    var now = Date.now();
    var hour = {};
    try { hour = JSON.parse(localStorage.getItem("dds_race_hour") || "null") || {}; } catch (e) { hour = {}; }
    var oldMap = hour.map || {};
    var TAG = {
      preethi: "Preethi, the long sitting number one",
      diya: "Diya",
      meghana: "Meghana, Curve Queen",
      kiara: "Kiara",
      sravani: "Sravani",
      natasha: "Natasha, Pride Queen",
      ayesha: "Ayesha, the hijab beauty",
      meenakshi: "Meenakshi, Milf Definition",
      tharini: "Tharini, the new threat",
      esther: "Esther",
      kavya: "Kavya",
      lahari: "Lahari, Hyderabad queen",
      navya: "Navya, Kochi soft-expensive",
      simran: "Simran, Rajasthan grace"
    };
    function who(p) { return TAG[p.slug] || p.name; }
    function findSlug(slug) {
      for (var i = 0; i < lined.length; i++) if (lined[i].slug === slug) return lined[i];
      return null;
    }
    var lines = [];
    var lead = lined[0];
    var pre = findSlug("preethi");
    var tha = findSlug("tharini");
    if (lead && lead.slug === "preethi") {
      lines.push("Preethi has held the chair so long the house stopped looking for an opposition. Rank 1. " + lead.score + " Desire. Cute.");
    } else if (lead) {
      lines.push(who(lead) + " sits at rank 1 with " + lead.score + " Desire. The old court is coughing.");
    }
    if (pre && pre.rank === 1) {
      lines.push("Nobody has properly challenged Preethi. That is not loyalty. That is a lazy cabinet.");
    } else if (pre && pre.rank > 1) {
      lines.push("The long sitting number one is at rank " + pre.rank + ". Someone finally filed a motion.");
    }
    if (tha) {
      if (tha.rank <= 5) lines.push("Tharini is no longer a guest. She is a threat. Rank " + tha.rank + ". The polite Mumbai act is doing numbers.");
      else lines.push("Tharini is climbing the back benches. Pretend you do not see her. That worked for no one.");
      if (pre && tha.score < pre.score) {
        var g = pre.score - tha.score;
        if (g <= 250) lines.push("Tharini is " + g + " Desire off Preethi. The incumbent is smiling. The threat is taking notes.");
      }
    }
    lined.forEach(function (p) {
      var was = oldMap[p.slug];
      if (!was) return;
      if (p.rank === 1 && was.rank > 1) lines.push("Coup. " + who(p) + " took rank 1. The speeches will be short.");
      else if (p.rank < was.rank) lines.push(who(p) + " jumped to rank " + p.rank + ". Floor crossed. No apology.");
      if (TIER_RANK[p.tier] > TIER_RANK[was.tier]) lines.push(who(p) + " walked into " + p.tier + ". New office. Same saree.");
    });
    if (lined[1] && lead) {
      var gap1 = lead.score - lined[1].score;
      if (gap1 > 0 && gap1 <= 120) {
        lines.push("Will " + who(lined[1]) + " find " + gap1 + " Desire in ten hours and unseat " + who(lead) + "? Or will the chair keep the same name again?");
      }
    }
    lined.forEach(function (p, i) {
      if (i === 0) return;
      var ahead = lined[i - 1];
      var gap = ahead.score - p.score;
      if (gap <= 0 || gap > 80) return;
      if (gap === 1) lines.push(who(p) + " is 1 Desire from passing " + who(ahead) + ". One night. The house loves a cheap coup.");
      else lines.push(who(p) + " needs " + gap + " Desire to pass " + who(ahead) + ". Close enough to smell the seat.");
    });
    lined.forEach(function (p) {
      var next = null;
      (ticks || []).forEach(function (tk) {
        if (p.score < tk.n && (!next || tk.n < next.n)) next = tk;
      });
      if (!next) return;
      var need = next.n - p.score;
      if (need <= 40) lines.push(who(p) + " is " + need + " Desire from " + next.name + ". Campaign is over. Cast the vote.");
      else if (need <= 150) lines.push(who(p) + " needs " + need + " Desire for " + next.name + ". A week of rooms. Or another speech.");
    });
    var seen = {};
    lines = lines.filter(function (t) {
      if (seen[t]) return false;
      seen[t] = 1;
      return true;
    }).slice(0, 7);
    if (!lines.length) lines.push("Quiet hour. The throne did not move. Preethi will enjoy that.");
    host.innerHTML = lines.map(function (t) { return "<li>" + t.replace(/</g, "") + "</li>"; }).join("");
    if (when) {
      var d = new Date();
      when.textContent = "Desk copy · " + d.toLocaleString() + " · refreshes each hour.";
    }
    if (!hour.t || now - hour.t > 55 * 60 * 1000) {
      var map = {};
      lined.forEach(function (p) { map[p.slug] = { rank: p.rank, score: p.score, tier: p.tier }; });
      try { localStorage.setItem("dds_race_hour", JSON.stringify({ t: now, map: map, lines: lines })); } catch (e) {}
    }
  }
  function paintClubBoard(rows) {
    var body = document.getElementById("dds-live-board");
    if (!body) return;
    var prev = {};
    try { prev = JSON.parse(localStorage.getItem("dds_status_prev") || "{}") || {}; } catch (e) { prev = {}; }
    var off = window.DDS_UNAVAILABLE || [];
    var promoted = [];
    var sl = (window.DDS_CFG && window.DDS_CFG.slabs) || {};
    var cap = Number(sl.sovereign || 2500);
    if (cap < 100) cap = 2500;
    var tickPlan = [
      { n: Number(sl.good || 750), name: "Good" },
      { n: Number(sl.strong || 1000), name: "Strong" },
      { n: Number(sl.top || 1200), name: "Top" },
      { n: Number(sl.elite || 1500), name: "Elite" },
      { n: Number(sl.superElite || 2000), name: "D.Elite" },
      { n: Number(sl.crown || 2500), name: "Crown" },
      { n: Number(sl.sovereign || 3000), name: "Queen" }
    ];
    var seenTick = {};
    var ticks = tickPlan.filter(function (t) {
      if (!t.n || t.n > cap || seenTick[t.n]) return false;
      seenTick[t.n] = 1;
      return true;
    });
    var face = function (slug) {
      var m = (window.DDS_ART && window.DDS_ART[slug]) || {};
      return m.profile || m.lineup || m.session || (window.DDS_THUMBS && window.DDS_THUMBS[slug]) || ("/art/profile/" + slug + ".webp");
    };
    var scale = '<div class="race-scale">' + ticks.map(function (t) {
      return '<i style="left:' + (t.n / cap * 100) + '%"><b>' + t.name + "</b><em>" + t.n + "</em></i>";
    }).join("") + "</div>";
    var lead = document.getElementById("raceLead");
    if (lead) {
      lead.textContent = "Bars run to " + cap + ". " + ticks.map(function (t) { return t.name + " " + t.n; }).join(" · ") + ".";
    }
    body.innerHTML = scale + rows.map(function (r, i) {
      var rank = i + 1;
      var name = NAMES[r.slut] || r.slut;
      var was = prev[r.slut] || "";
      var up = was && TIER_RANK[r.tier] > TIER_RANK[was];
      if (up) promoted.push(name + " is now " + r.tier);
      var busy = off.indexOf(r.slut) !== -1 ? '<span class="status-busy">Busy</span>' : "";
      var score = Math.round(Number(r.desire_score || 0));
      var pct = Math.max(2, Math.min(100, score / cap * 100));
      var cls = "race-row" + (rank === 1 ? " race-1" : "") + (rank === 2 ? " race-2" : "") + (rank === 3 ? " race-3" : "") + (up ? " tier-up" : "");
      return '<a class="' + cls + '" data-slut="' + r.slut + '" href="' + r.slut + '.html">' +
        '<div class="race-face"><img src="' + face(r.slut) + '" alt=""/></div>' +
        '<div class="race-meta">' +
          '<div class="race-top"><span class="rank rank-' + Math.min(rank, 3) + '">#' + rank + "</span>" +
          '<strong>' + name + "</strong>" + busy +
          '<span class="tier ' + tierClass(r.tier) + '">' + (r.tier || "New") + "</span>" +
          '<em class="score">' + score + "</em></div>" +
          '<div class="race-track"><span class="race-fill" style="width:' + pct + '%"></span></div>' +
          '<div class="race-sub">' + (r.sessions || 0) + " sessions · " + Number(r.avg_rating || 0).toFixed(2) + " avg · " +
          (r.hearts || 0) + " hearts · " + (r.dps_earned || 0) + " DPS earned · " + (r.reviews || 0) + " reviews</div>" +
        "</div></a>";
    }).join("");
    var snap = {};
    rows.forEach(function (r) { snap[r.slut] = r.tier || "New"; });
    try { localStorage.setItem("dds_status_prev", JSON.stringify(snap)); } catch (e) {}
    paintWire(rows, ticks, cap);
    var promo = document.getElementById("promo");
    if (promo) {
      if (promoted.length) {
        promo.className = "on";
        promo.textContent = promoted.join(" · ");
      } else {
        promo.className = "";
        promo.textContent = "";
      }
    }
  }

  function paintTables(rows) {
    document.querySelectorAll("table").forEach(function (table) {
      var head = (table.tHead && table.tHead.innerText || "").toLowerCase();
      if (head.indexOf("desire") === -1 && head.indexOf("score") === -1 && head.indexOf("rank") === -1) return;
      var body = table.tBodies[0];
      if (!body) return;
      var thead = table.tHead && table.tHead.rows && table.tHead.rows[0];
      if (thead) thead.innerHTML = "<th>Rank</th><th>Model</th><th>ModelDesirePoints</th><th>Tier</th><th>Sessions</th><th>Rating</th><th>Hearts</th><th>DPS earned</th><th>Favorites</th><th>Owns</th>";
      body.innerHTML = rows.map(function (r, i) {
        var rank = i + 1;
        var name = NAMES[r.slut] || r.slut;
        var crown = rank === 1 ? ' <span class="crown">♛</span>' : "";
        if (/Desire Queen|Desire Crown|Desire Elite|Sovereign|Crown|Super Elite/.test(String(r.tier))) crown += ' <span class="tier ' + tierClass(r.tier) + '">' + String(r.tier).toUpperCase() + "</span>";
        var rowClass = /Desire Queen|Desire Crown|Desire Elite|Sovereign|Crown|Super Elite/.test(String(r.tier)) ? ' class="super-row"' : "";
        return "<tr" + rowClass + ">" +
          '<td class="rank' + (rank <= 3 ? " rank-" + rank : "") + '">' + rank + "</td>" +
          '<td class="model-name"><a href="' + r.slut + '.html">' + name + "</a>" + crown + "</td>" +
          '<td class="score">' + Math.round(Number(r.desire_score)) + "</td>" +
          '<td><span class="tier ' + tierClass(r.tier) + '">' + r.tier + "</span></td>" +
          "<td>" + (r.sessions || 0) + "</td>" +
          "<td>" + Number(r.avg_rating || 0).toFixed(2) + "</td>" +
          "<td>" + (r.hearts || 0) + "</td>" +
          "<td>" + (r.dps_earned || 0) + "</td>" +
          "<td>" + (r.favorites || 0) + "</td>" +
          "<td>" + (r.own_count || 0) + "</td>" +
          "</tr>";
      }).join("");
    });
  }



  function badgeStyle(kind) {
    var base = "position:absolute;z-index:6;padding:.22rem .55rem;border-radius:999px;font-size:.62rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.5);";
    if (kind === "own") return base + "right:.4rem;top:1.7rem;background:linear-gradient(135deg,#fff1b0,#c9a24a);color:#1a1008;";
    return base + "right:.4rem;top:.45rem;background:linear-gradient(135deg,#6b3fa0,#c084fc);color:#fff;";
  }
  function paintMineBadges() {
    var owns = [];
    try {
      var acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
      var raw = acc.owns || acc.owned || localStorage.getItem("dds_owns") || "";
      if (raw && raw !== "none") owns = String(raw).toLowerCase().split(/[,|\s]+/).filter(Boolean);
    } catch (e) {}
    var fans = window.DDS_FAN_OF || [];
    document.querySelectorAll("a.poster-card[data-slut]").forEach(function (card) {
      var slug = (card.getAttribute("data-slut") || "").toLowerCase();
      var own = card.querySelector(".you-own");
      if (owns.indexOf(slug) !== -1) {
        if (!own) {
          own = document.createElement("div");
          own.className = "you-own";
          own.textContent = "You own";
          card.appendChild(own);
        }
        own.setAttribute("style", badgeStyle("own"));
      } else if (own) own.remove();
      var fan = card.querySelector(".fan-badge");
      if (fans.indexOf(slug) !== -1) {
        if (!fan) {
          fan = document.createElement("div");
          fan.className = "fan-badge";
          fan.textContent = "Fan Club";
          card.appendChild(fan);
        }
        fan.setAttribute("style", badgeStyle("fan"));
      } else if (fan) fan.remove();
    });
  }
  window.DDS_paintMineBadges = paintMineBadges;
  function paintOwnBanner() {
    var hero = document.querySelector("article.profile-hero");
    if (!hero) return;
    var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "").toLowerCase();
    if (!slug) return;
    var owns = [];
    try {
      var acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {};
      var raw = acc.owns || acc.owned || localStorage.getItem("dds_owns") || "";
      if (raw && raw !== "none") owns = String(raw).toLowerCase().split(/[,|\s]+/).filter(Boolean);
    } catch (e) {}
    var old = document.getElementById("own-page-banner");
    if (owns.indexOf(slug) === -1) { if (old) old.remove(); return; }
    if (old) return;
    var name = slug.charAt(0).toUpperCase() + slug.slice(1);
    var bar = document.createElement("div");
    bar.id = "own-page-banner";
    bar.style.cssText = "background:linear-gradient(90deg,#8a6a1a,#fff1b0,#8a6a1a);background-size:200% 100%;animation:ownFlash 1.2s ease-in-out infinite;border-bottom:2px solid #fff1b0;color:#1a1008;text-align:center;padding:.6rem 1rem;font-size:1.05rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 0 8px #fff";
    bar.textContent = "OWN PAGE · " + name;
    if (hero.parentNode) hero.parentNode.insertBefore(bar, hero);
    else document.body.insertBefore(bar, document.body.firstChild);
    if (!document.getElementById("dds-own-flash")) {
      var s = document.createElement("style");
      s.id = "dds-own-flash";
      s.textContent = "@keyframes ownFlash{0%,100%{background-position:0% 50%;filter:brightness(1)}50%{background-position:100% 50%;filter:brightness(1.35)}}";
      document.head.appendChild(s);
    }
    var base = document.title.replace(/^(FAN PAGE|OWN PAGE) · /, "");
    var on = true;
    if (window._ddsOwnFlash) clearInterval(window._ddsOwnFlash);
    window._ddsOwnFlash = setInterval(function () {
      document.title = on ? ("OWN PAGE · " + base) : base;
      on = !on;
    }, 700);
  }
  window.DDS_paintOwnBanner = paintOwnBanner;
  window.DDS_playerFan = function (slug) {
    return (window.DDS_FAN_OF || []).indexOf(String(slug || "").toLowerCase()) !== -1;
  };
  function loadMine() {
    var acc = {};
    try { acc = JSON.parse(localStorage.getItem("dds_account") || "null") || {}; } catch (e) {}
    var id = acc.id || acc.player_id;
    paintMineBadges(); paintOwnBanner();
    if (!id) { window.DDS_FAN_OF = []; return; }
    var cfg = window.DDS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) return;
    var root = String(cfg.url).replace(/\/$/, "");
    var hdr = { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon, "Content-Type": "application/json" };
    // owns
    fetch(root + "/rest/v1/rpc/player_owned", { method: "POST", headers: hdr, body: JSON.stringify({ p_id: id }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        data = data || {};
        var models = data.models || [];
        var owns = models.map(function (m) { return String(m.slug || "").toLowerCase(); }).filter(Boolean).join(",");
        try { localStorage.setItem("dds_owns", owns); } catch (e) {}
        try { acc.owns = owns; localStorage.setItem("dds_account", JSON.stringify(acc)); } catch (e) {}
        paintMineBadges();
      }).catch(function () {});
    // fans
    function got(list) {
      window.DDS_FAN_OF = (list || []).map(function (s) { return String(s || "").toLowerCase(); }).filter(Boolean);
      paintMineBadges();
    }
    fetch(root + "/rest/v1/rpc/player_fan_of", { method: "POST", headers: hdr, body: JSON.stringify({ p_id: id }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (list) {
        if (Array.isArray(list) && list.length) return got(list);
        return fetch(root + "/rest/v1/model_fans?player_id=eq." + encodeURIComponent(id) + "&select=model", { headers: hdr })
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (rows) { got((rows || []).map(function (row) { return row.model; })); });
      }).catch(function () { paintMineBadges(); });
    setTimeout(paintMineBadges, 1500);
    setTimeout(paintMineBadges, 3000);
  }

  function groupLineup(rows) {
    var wrap = document.getElementById("modelLineup");
    if (!wrap) return;
    var pool = {};
    wrap.querySelectorAll("a.poster-card[data-slut]").forEach(function (card) {
      if (card.classList.contains("trainer-card")) return;
      var slug = (card.getAttribute("data-slut") || "").toLowerCase();
      if (slug) pool[slug] = card;
    });
    var order = ["Desire Queen", "Desire Crown", "Desire Elite", "Elite", "Top", "Strong", "Good", "New"];
    var groups = {};
    order.forEach(function (name) { groups[name] = []; });
    rows.forEach(function (r) {
      var name = r.tier || "New";
      if (!groups[name]) groups[name] = [];
      if (pool[r.slut]) groups[name].push(pool[r.slut]);
    });
    while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
    order.forEach(function (name) {
      var list = groups[name] || [];
      if (!list.length) return;
      var block = document.createElement("div");
      block.className = "slab-block";
      block.setAttribute("data-slab", name);
      var head = document.createElement("h3");
      head.className = "slab-head";
      var lines = {
        "Desire Queen": "She takes you to heaven you have never imagined.",
        "Desire Crown": "Long-standing favourite. Men book her when they want the night done right and without rush.",
        "Desire Elite": "Very high demand. She gives full attention, stays present, and does not leave the job unfinished.",
        "Elite": "Booked with intent and satisfaction guaranteed. She takes her time, watches what works for you, and finishes you cleanly.",
        "Top": "Steady and known. Reliable service. She knows how to get you there and does not cut it short.",
        "Strong": "Consistent door. Straightforward, attentive, and she makes sure the night ends the way you wanted.",
        "Good": "Established. She listens, works to your pace, and does not leave you hanging.",
        "New": "Recently opened. Still building her regulars. Same house standard once she is in the room."
      };
      head.innerHTML = '<span class="slab-name">' + name + '</span><span class="slab-line">' + (lines[name] || "") + '</span>';
      var grid = document.createElement("div");
      grid.className = "poster-grid";
      list.forEach(function (card) {
        var pill = card.querySelector(".pill");
        if (pill) pill.remove();
        grid.appendChild(card);
      });
      block.appendChild(head);
      block.appendChild(grid);
      wrap.appendChild(block);
    });
  }
  function badgeFor(r) {
    var sl = (window.DDS_CFG && window.DDS_CFG.slabs) || {};
    var sc = Number(r.desire_score || 0);
    var forced = (window.DDS_CFG && window.DDS_CFG.forceSuper) || [];
    if (forced.map(function (x) { return String(x).toLowerCase(); }).indexOf(r.slut) !== -1) return "Desire Queen";
    if (sc >= Number(sl.sovereign || 3000)) return "Desire Queen";
    if (sc >= Number(sl.crown || 2500)) return "Desire Crown";
    if (sc >= Number(sl.superElite || 2000)) return "Desire Elite";
    if (sc >= Number(sl.elite || 1500)) return "Elite";
    if (sc >= Number(sl.top || 1200)) return "Top";
    if (sc >= Number(sl.strong || 1000)) return "Strong";
    if (sc >= Number(sl.good || 750)) return "Good";
    return "New";
  }
  function applyTier(r) {
    r.tier = badgeFor(r);
    if (r.tier === "Super Elite") r.tier = "Desire Elite";
  }
  function refreshDue() {}
  function paintAll(rows) {
    applyLiveRanks(rows);
    paintTables(rows);
    paintClubBoard(rows);
    if (window.DDS_FLASH_BOARD) window.DDS_FLASH_BOARD(rows);
  }
  function loadBoard() {
  refreshDue();
  fetch(cfg.url.replace(/\/$/, "") + "/rest/v1/board?select=*&order=desire_score.desc", {
    headers: { apikey: cfg.anon, Authorization: "Bearer " + cfg.anon }
  })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      if (!rows || !rows.length) return;
      var best = {};
      rows.forEach(function (r) {
        r.slut = String(r.slut || "").toLowerCase();
        r.slut = ALIAS[r.slut] || r.slut;
        if (KEEP.indexOf(r.slut) === -1) return;
        var prev = best[r.slut];
        if (!prev || Number(r.desire_score) > Number(prev.desire_score)) best[r.slut] = r;
      });
      rows = KEEP.map(function (k) { return best[k]; }).filter(Boolean);
      rows.sort(function (a,b) { return Number(b.desire_score) - Number(a.desire_score); });
      rows.forEach(applyTier);
      window.DDS_BOARD = rows;
      paintAll(rows);
      var page = (location.pathname.split("/").pop() || "").replace(".html","").toLowerCase();
      var qSlut = (new URLSearchParams(location.search).get("slut") || "").toLowerCase();
      var mine = rows.filter(function (r) { return r.slut === page || r.slut === qSlut; })[0];
      if (mine) {
        var map = {
          "ModelDesirePoints": Math.round(Number(mine.desire_score)),
          "Sessions": mine.sessions,
          "Avg Rating": Number(mine.avg_rating).toFixed(2),
          "Poll Votes": mine.poll_votes,
          "Profile views": mine.poll_votes,
          "Hearts": mine.hearts || 0,
          "Cum Score": Number(mine.cum || 0).toFixed(2),
          "Cum Rate": (mine.cum_rate || 0) + "%",
          "Body Score": Number(mine.body || 0).toFixed(2),
          "Convo Score": Number(mine.convo || 0).toFixed(2),
          "Please Score": Number(mine.please || 0).toFixed(2),
          "Re-Attend": Number(mine.again || 0).toFixed(2),
          "Reviews": mine.reviews
        };
        document.querySelectorAll(".score-chip").forEach(function (chip) {
          var lab = (chip.querySelector(".l") || {}).textContent || "";
          var n = chip.querySelector(".n");
          if (!n) return;
          if (/profile views|poll votes/i.test(lab) && mine.poll_votes != null) {
            var fresh = window.DDS_FRESH_VIEWS && window.DDS_FRESH_VIEWS[mine.slut];
            n.textContent = String(fresh != null && Number(fresh) > Number(mine.poll_votes) ? fresh : mine.poll_votes);
            n.setAttribute("data-live-field", "views");
            return;
          }
          if (map[lab] != null && String(n.textContent) !== String(map[lab])) n.textContent = map[lab];
        });
      }
      var page = (location.pathname.split("/").pop() || "").replace(".html", "").toLowerCase();
      rows.forEach(function (r, i) {
        r.rank = i + 1;
        document.querySelectorAll("[data-live='" + r.slut + "']").forEach(function (el) {
          var key = el.getAttribute("data-live-field");
          if (key === "rank") el.textContent = "No." + r.rank;
          if (key === "score") el.textContent = Math.round(Number(r.desire_score));
          if (key === "sessions") el.textContent = r.sessions;
          if (key === "reviews") el.textContent = r.reviews;
          if (key === "avg") el.textContent = Number(r.avg_rating).toFixed(2);
          if (key === "hearts") el.textContent = r.hearts || 0;
          if (key === "tier") el.textContent = r.tier;
        });
      });
      var mine = rows.filter(function (r) { return r.slut === page; })[0];
      if (qSlut) {
        var her = rows.filter(function (r) { return r.slut === qSlut; })[0];
        if (her) {
          document.querySelectorAll("[data-live-field]").forEach(function (el) {
            var key = el.getAttribute("data-live-field");
            if (key === "rank") el.textContent = "No." + her.rank;
            if (key === "tier") el.textContent = her.tier;
            if (key === "reviews") el.textContent = her.reviews;
            if (key === "sessions") el.textContent = her.sessions;
          });
        }
      }
      if (mine && window.DDS_MODELS && window.DDS_MODELS[page]) {
        window.DDS_MODELS[page].rank = "No." + mine.rank;
        window.DDS_MODELS[page].tier = mine.tier;
      }
    })
    .catch(function () {});
  }
  loadBoard();
  window.DDS_reloadBoard = loadBoard;
  if (/club\.html|^board$/i.test(location.pathname.split("/").pop() || "")) {
    setInterval(loadBoard, 60 * 60 * 1000);
  }
  document.addEventListener("dds-cfg", function () {
    var rows = window.DDS_BOARD || [];
    if (!rows.length) { loadBoard(); return; }
    rows.forEach(applyTier);
    rows.sort(function (a,b) { return Number(b.desire_score) - Number(a.desire_score); });
    paintAll(rows);
  });
  function rankTrainers() {
    var trainerCards = document.querySelectorAll(".trainer-card[data-slut]");
    if (!trainerCards.length) return;
    var have = {};
    // Pull trainer scores from the same board if available
    var pack = {};
    try { pack = JSON.parse(localStorage.getItem("dds_trainer_rank") || "null") || {}; } catch (e) { pack = {}; }
    var scores = pack.scores || {};
    trainerCards.forEach(function (card) {
      var slug = (card.getAttribute("data-slut") || "").toLowerCase();
      if (!slug) return;
      have[slug] = { slut: slug, desire_score: Number(scores[slug] || 0), card: card };
    });
    var rows = Object.keys(have).map(function (k) { return have[k]; });
    rows.sort(function (a, b) {
      var ds = Number(b.desire_score || 0) - Number(a.desire_score || 0);
      if (ds) return ds;
      return String(a.slut).localeCompare(String(b.slut));
    });
    rows.forEach(function (r, i) {
      r.rank = i + 1;
      var badge = r.card.querySelector(".rank-badge");
      if (badge) badge.textContent = "TRAINER #" + r.rank;
    });
    try {
      var map = {};
      rows.forEach(function (r) { map[r.slut] = r.rank; });
      localStorage.setItem("dds_trainer_rank", JSON.stringify({ t: Date.now(), map: map, scores: scores }));
    } catch (e) {}
  }

})();