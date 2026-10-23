(function () {
  var TYPES = [
    { id: "IPOFF", lane: "MID", label: "IPOFF · turn IP lock off",
      perk: "Turn the 30-minute IP lock off for this man this session. If he drops, he may re-enter her room. Room continues." },
    { id: "LING", lane: "MID", label: "LING · lingerie by wish",
      perk: "He names lingerie — color and cut. She changes into that set at the current strip level. No level skip. Room continues." },
    { id: "PIECE", lane: "MID", label: "PIECE · one-piece change",
      perk: "He names one garment. She changes that one piece only. The rest of the look stays. No level skip. Room continues." },
    { id: "TALK", lane: "MID", label: "TALK · talk style + warmth",
      perk: "He names a talk style: filthy, sweet, strict, obedient, or broken. Openness shifts one step that way. #tON from here counts 2×. Room continues." },
    { id: "TIME", lane: "MID", label: "TIME · extra minutes",
      perk: "She stays 15 minutes longer. Room continues." },
    { id: "STILL", lane: "MID", label: "STILL · extra still",
      perk: "One extra still at the current level. Room continues." },
    { id: "CLOSE", lane: "MID", label: "CLOSE · current-level close-up",
      perk: "He names one close-up allowed at this level: underarm, navel, feet, neck, back, waist, or another detail already on show. She sends that close-up. No extra strip. Room continues." },
    { id: "SOFT", lane: "MID", label: "SOFT · apology / extra affection",
      perk: "She slipped, or she felt him. +1 Ton. One warmer still at current clothes. Softer talk for the next few lines. Next small miss is forgiven. No level skip. Room continues." },
    { id: "TON2", lane: "MID", label: "TON2 · warmth twice",
      perk: "Her warmth moves two steps. Say the new Ton. Room continues." },
    { id: "GRACE", lane: "END", label: "GRACE · one more chance",
      perk: "The room was ending. Clear one strike and let the room continue." },
    { id: "TEASE", lane: "END", label: "TEASE · last tease",
      perk: "One teasing still. No level up. Then she decides." },
    { id: "LAST", lane: "END", label: "LAST · last still",
      perk: "One last still at the current level, then the room closes unless a GRACE was also paid." }
  ];
  var AUTO = {
    preethi: ["TALK", "LING", "SOFT"],
    diya: ["LING", "CLOSE", "STILL"],
    meghana: ["TALK", "IPOFF", "PIECE"],
    kiara: ["TIME", "LING", "CLOSE"],
    sravani: ["SOFT", "STILL", "GRACE"],
    meenakshi: ["TALK", "LING", "SOFT"],
    ayesha: ["PIECE", "CLOSE", "TEASE"],
    esther: ["SOFT", "STILL", "GRACE"],
    natasha: ["LING", "IPOFF", "CLOSE"],
    tharini: ["PIECE", "TIME", "TALK"]
  };
  function typeById(id) {
    var key = String(id || "").toUpperCase();
    if (key === "TON1" || key === "3X") key = "TALK";
    if (key === "LOOK") key = "PIECE";
    return TYPES.filter(function (t) { return t.id === key; })[0] || TYPES[0];
  }
  function codeFor(slug, typeId) {
    var t = typeById(typeId);
    var tail = Math.random().toString(36).slice(2, 6).toUpperCase();
    if (t.lane === "END") return "ENDREVIEW-" + String(slug || "HOUSE").toUpperCase() + "-" + t.id + "-" + tail;
    return String(slug || "HOUSE").toUpperCase() + "-" + t.lane + "-" + t.id + "-" + tail;
  }
  function autoType(slug) {
    var list = AUTO[slug] || ["TALK", "LING", "TIME"];
    return list[Math.floor(Math.random() * list.length)];
  }
  function inferType(text) {
    var s = String(text || "").toLowerCase();
    if (/ip\s*off|ip lock|turn.?off.?ip|reconnect|drop(ped)? out|30\s*-?\s*min/.test(s)) return "IPOFF";
    if (/lingerie|bra|panty|panties|thong|babydoll|teddy|set she wears/.test(s)) return "LING";
    if (/one[\s-]?piece|blouse|saree|garment|change (the )?look|outfit|dress only/.test(s)) return "PIECE";
    if (/talk style|filthy|obedient|broken|openness|dirty talk|how she talks|converse/.test(s)) return "TALK";
    if (/extra time|minutes|stay longer|more time/.test(s)) return "TIME";
    if (/close.?up|underarm|armpit|navel|belly button|feet|toes|neck|waist shot/.test(s)) return "CLOSE";
    if (/sorry|mistake|slipped|pity|affection|touched her|he touched|felt him|soft pack|apology/.test(s)) return "SOFT";
    if (/still|extra (pic|image|photo)|another still/.test(s)) return "STILL";
    if (/grace|second chance|one more chance|strike/.test(s)) return "GRACE";
    if (/tease|teasing/.test(s)) return "TEASE";
    if (/last still|then close|last image/.test(s)) return "LAST";
    if (/ton2|two steps|twice|double|2x/.test(s)) return "TON2";
    if (/3\s*x|three times|triple|ton1|warmth/.test(s)) return "TALK";
    if (/lock|look|clothes/.test(s)) return "PIECE";
    return "TALK";
  }
  function pack(slug, typeId, extra) {
    var t = typeById(typeId);
    var written = String(extra || "").trim();
    return {
      slug: slug,
      type: t.id,
      lane: t.lane,
      code: codeFor(slug, t.id),
      perk: written || t.perk,
      interest: "LIVE"
    };
  }
  function invent(slug) {
    var typeId = autoType(slug);
    var t = typeById(typeId);
    var name = String(slug || "she").replace(/^\w/, function (c) { return c.toUpperCase(); });
    var lines = {
      IPOFF: name + " turns the IP lock off for him this session if he pastes the code in chat.",
      LING: name + " wears the lingerie he names — color and cut — at this level if he pastes the code in chat.",
      PIECE: name + " changes one garment he names if he pastes the code in chat. The rest of the look stays.",
      TALK: name + " shifts her talk style one step and doubles warmth from here if he pastes the code in chat.",
      TIME: name + " stays 15 minutes longer if he pastes the code in chat.",
      STILL: name + " sends one extra still at this level if he pastes the code in chat.",
      CLOSE: name + " sends one close-up he names at this level — underarm, navel, feet, or another detail already on show.",
      SOFT: name + " softens after a slip or because she felt him: +1 Ton, warmer still, next small miss forgiven.",
      TON2: name + " lets warmth move two steps if he pastes the code in chat.",
      GRACE: name + " gives one more chance before the room ends if he pastes the code in chat.",
      TEASE: name + " sends one teasing still — no level up — if he pastes the code in chat.",
      LAST: name + " sends one last still and then closes if he pastes the code in chat."
    };
    return pack(slug, typeId, lines[typeId] || t.perk);
  }
  var MAKE = [
    { id: "SLIP", label: "SLIP · she made a mistake",
      perk: "She slipped in the room. +1 Ton. One warmer still at current clothes. Next small miss forgiven. No level skip.",
      say: "That one is on me. Stay." },
    { id: "PITY", label: "PITY · she feels for him",
      perk: "She feels for him. +1 Ton. Softer talk for the next few lines. One still at current clothes. No level skip.",
      say: "I felt that. I will not rush you." },
    { id: "PULL", label: "PULL · sudden attraction",
      perk: "Sudden pull. +2 Ton. One close-up he names at this level. Warmer voice for six lines. No extra strip.",
      say: "That hit me. Name one close-up this level already shows." },
    { id: "LIKE", label: "LIKE · she likes this man",
      perk: "She likes him. +1 Ton. One still at current clothes. Give a private return word he can use next time. Start warmer if he comes back.",
      say: "I like how you are with me. Keep this word." },
    { id: "WARM", label: "WARM · any other human feeling",
      perk: "A real feeling hit her — shy, jealous, protective, missed him. She names it in one line. +1 Ton. One still at current clothes. No level skip.",
      say: "Something moved. I will say it once. Then watch." }
  ];
  function makeById(id) {
    var key = String(id || "").toUpperCase();
    if (key === "SOFT" || key === "SORRY" || key === "MISTAKE") key = "SLIP";
    if (key === "ATTRACT" || key === "WANT") key = "PULL";
    return MAKE.filter(function (t) { return t.id === key; })[0] || MAKE[0];
  }
  function inferMake(text) {
    var s = String(text || "").toLowerCase();
    if (/mistak|slip|sorry|wrong|apology/.test(s)) return "SLIP";
    if (/pity|poor|sorry for|feel for/.test(s)) return "PITY";
    if (/attract|pull|sudden|want him|chemistry/.test(s)) return "PULL";
    if (/\blike\b|fond|favourite|favorite|this man/.test(s)) return "LIKE";
    return "WARM";
  }
  function makeCode(slug, feelId) {
    var t = makeById(feelId);
    var tail = Math.random().toString(36).slice(2, 6).toUpperCase();
    return String(slug || "HOUSE").toUpperCase() + "-MAKE-" + t.id + "-" + tail;
  }
  function inventMake(slug, feelId) {
    var t = makeById(feelId || inferMake(""));
    return {
      slug: slug,
      type: t.id,
      lane: "MAKE",
      code: makeCode(slug, t.id),
      perk: t.perk,
      say: t.say,
      interest: "MAKE-" + t.id
    };
  }
  window.DDS_OFFER_TYPES = TYPES;
  window.DDS_MAKE_TYPES = MAKE;
  window.DDS_offerType = typeById;
  window.DDS_offerCode = codeFor;
  window.DDS_offerAuto = autoType;
  window.DDS_offerInfer = inferType;
  window.DDS_offerPack = pack;
  window.DDS_offerInvent = invent;
  window.DDS_makeType = makeById;
  window.DDS_makeInfer = inferMake;
  window.DDS_makeCode = makeCode;
  window.DDS_offerInventMake = inventMake;
})();
