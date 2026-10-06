/* ============================================================
   for-mateen — shared app.js (Mateen <-> Saqib)
   pages: body[data-page] = home | dosti | khel | dil
   ============================================================ */
(function () {
  "use strict";

  var d = document, body = d.body;
  var page = body.getAttribute("data-page") || "home";
  var NAME = "Mateen", FROM = "Saqib";

  /* ---------- tiny helpers ---------- */
  function q(sel, root) { return (root || d).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var e = d.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toast(msg) {
    var t = q("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function buzz(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms || 12); } catch (e) {} } }

  /* ============ 1. loader ============ */
  window.addEventListener("load", function () {
    setTimeout(function () { var l = q("#loader"); if (l) l.classList.add("done"); }, 1900);
  });
  setTimeout(function () { var l = q("#loader"); if (l) l.classList.add("done"); }, 4500);

  /* ============ 2. petals canvas ============ */
  (function petals() {
    var c = q("#petals"); if (!c) return;
    var ctx = c.getContext("2d"), W, H, ps = [], COLORS = ["#ff6fa5", "#a06bff", "#f0c97a", "#ff8fb8"];
    function size() { W = c.width = innerWidth; H = c.height = innerHeight; }
    size(); addEventListener("resize", size);
    var N = Math.min(34, Math.max(14, Math.floor(innerWidth / 42)));
    for (var i = 0; i < N; i++) ps.push(mk(true));
    function mk(anywhere) {
      return {
        x: Math.random() * W, y: anywhere ? Math.random() * H : -20,
        r: 3 + Math.random() * 7, vy: .4 + Math.random() * .9, vx: (Math.random() - .5) * .5,
        a: Math.random() * Math.PI, va: (Math.random() - .5) * .02,
        col: COLORS[(Math.random() * COLORS.length) | 0], o: .25 + Math.random() * .4
      };
    }
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y += p.vy; p.x += p.vx + Math.sin(p.y / 60) * .3; p.a += p.va;
        if (p.y > H + 24) ps[i] = mk(false);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = p.o; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(loop);
    })();
  })();

  /* ============ 3. cursor glow ============ */
  (function glow() {
    var g = q("#cursor-glow"); if (!g) return;
    addEventListener("mousemove", function (e) {
      g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px";
    }, { passive: true });
  })();

  /* ============ 4. scroll progress + to-top + nav active ============ */
  (function scrollBits() {
    var bar = q("#progress i"), top = q("#to-top");
    function onScroll() {
      var h = d.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
      if (top) top.classList.toggle("show", scrollY > 500);
      var links = qa(".nav-links a");
      var cur = null;
      qa("section[id], header[id]").forEach(function (s) {
        if (s.getBoundingClientRect().top < innerHeight * .4) cur = "#" + s.id;
      });
      links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === cur); });
    }
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (top) top.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });
  })();

  /* ============ 5. mobile menu ============ */
  (function menu() {
    var btn = q("#menu-btn"), links = q(".nav-links"); if (!btn || !links) return;
    btn.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  })();

  /* ============ 6. reveal on scroll ============ */
  (function reveal() {
    var items = qa(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12 });
    items.forEach(function (e) { io.observe(e); });
  })();

  /* ============ 7. smooth scroll buttons ============ */
  qa("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = q(b.getAttribute("data-scroll"));
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============ 8. footer year + name fill ============ */
  (function fill() {
    qa(".yr").forEach(function (e) { e.textContent = new Date().getFullYear(); });
    qa("[data-name]").forEach(function (e) { e.textContent = NAME; });
  })();

  /* ============ 9. visit counter ============ */
  (function visits() {
    var n = (parseInt(store("fm_visits"), 10) || 0) + 1;
    store("fm_visits", String(n));
    var out = q("#visit-count");
    if (out) out.textContent = n + (n === 1 ? " martaba" : " martaba");
  })();

  /* ============ 10. days-of-dosti counter ============ */
  (function days() {
    var out = q("#days-count"); if (!out) return;
    var start = new Date(2023, 0, 1).getTime();
    var daysN = Math.max(1, Math.floor((Date.now() - start) / 86400000));
    var i = 0;
    var tm = setInterval(function () {
      i += Math.ceil(daysN / 40);
      if (i >= daysN) { i = daysN; clearInterval(tm); }
      out.textContent = i.toLocaleString("en-PK");
    }, 30);
  })();

  /* ============ 11. sound engine (WebAudio, no files) ============ */
  var SOUND = { on: store("fm_sound") !== "0", ctx: null };
  function beep(freq, dur, type, vol) {
    if (!SOUND.on) return;
    try {
      if (!SOUND.ctx) SOUND.ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = SOUND.ctx.createOscillator(), g = SOUND.ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || .06, SOUND.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, SOUND.ctx.currentTime + (dur || .18));
      o.connect(g); g.connect(SOUND.ctx.destination);
      o.start(); o.stop(SOUND.ctx.currentTime + (dur || .18));
    } catch (e) {}
  }
  function sfx(kind) {
    if (kind === "tap") beep(660, .12);
    else if (kind === "pop") { beep(520, .1); setTimeout(function () { beep(780, .14); }, 90); }
    else if (kind === "win") { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, .18, "triangle", .07); }, i * 120); }); }
    else if (kind === "sad") { beep(300, .3, "sine", .05); setTimeout(function () { beep(240, .35, "sine", .05); }, 160); }
  }
  qa(".snd-toggle").forEach(function (b) {
    function paint() { b.textContent = SOUND.on ? "\u266A" : "\u266A\u0338"; }
    paint();
    b.addEventListener("click", function () {
      SOUND.on = !SOUND.on; store("fm_sound", SOUND.on ? "1" : "0");
      paint(); toast(SOUND.on ? "Awalat: awaz on" : "Awalat: awaz off"); if (SOUND.on) sfx("pop");
    });
  });

  /* ============ 12. theme accent switcher ============ */
  (function theme() {
    var accents = ["#ff6fa5", "#f0c97a", "#a06bff"];
    var names = ["Rose", "Gold", "Violet"];
    qa(".theme-toggle").forEach(function (b) {
      function paint() {
        var cur = store("fm_accent") || accents[0];
        d.documentElement.style.setProperty("--rose", cur);
      }
      paint();
      b.addEventListener("click", function () {
        var cur = store("fm_accent") || accents[0];
        var i = (accents.indexOf(cur) + 1) % accents.length;
        store("fm_accent", accents[i]); paint();
        toast("Rang: " + names[i]); sfx("tap");
      });
    });
  })();

  /* ============ 13. easter egg: type "mateen" = heart rain ============ */
  (function egg() {
    var buf = "";
    addEventListener("keydown", function (e) {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-6);
      if (buf === "mateen") { heartRain(40); toast("Ye tumhare liye, " + NAME + "!"); sfx("win"); buf = ""; }
    });
  })();

  function heartRain(n) {
    for (var i = 0; i < (n || 20); i++) {
      (function (i) {
        setTimeout(function () {
          var h = el("span", "rain-heart", ["\uD83D\uDC99", "\uD83D\uDC9B", "\uD83D\uDC96", "\uD83D\uDC9C"][(Math.random() * 4) | 0]);
          h.style.left = Math.random() * 96 + "vw";
          h.style.animationDuration = 2.2 + Math.random() * 2.4 + "s";
          h.style.fontSize = .8 + Math.random() * 1.6 + "rem";
          body.appendChild(h);
          setTimeout(function () { h.remove(); }, 5200);
        }, i * 90);
      })(i);
    }
  }
  window.fmHeartRain = heartRain;

  /* ============ 14. document title animation ============ */
  (function titleAnim() {
    var titles = ["\uD83D\uDC9B " + NAME + ", ye dekho", "Saqib ne bheji hy", "\uD83D\uDC96 wapis aao na"];
    var i = 0;
    setInterval(function () {
      if (d.hidden) { d.title = titles[i++ % titles.length]; }
    }, 1400);
  })();

  /* ============ 15. toast on section view (subtle, once) ============ */
  (function sectionGreetings() {
    if (page !== "home") return;
    var said = {};
    var msgs = { letter: "Ye chitthi poora dil se likhi hy", vault: "Code ka hint neeche hy" };
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && !said[en.target.id] && msgs[en.target.id]) {
          said[en.target.id] = 1; toast(msgs[en.target.id]);
        }
      });
    }, { threshold: .3 });
    ["letter", "vault"].forEach(function (id) { var s = q("#" + id); if (s) io.observe(s); });
  })();

  /* ============ 16. confetti engine ============ */
  var confettiRun = null;
  function confetti(n) {
    var c = q("#confetti-canvas"); if (!c) return;
    c.style.display = "block";
    var ctx = c.getContext("2d");
    c.width = innerWidth; c.height = innerHeight;
    var cols = ["#ff6fa5", "#a06bff", "#f0c97a", "#5dd39e", "#fff"];
    var bits = [];
    for (var i = 0; i < (n || 160); i++) {
      bits.push({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
        vy: 2 + Math.random() * 4, vx: (Math.random() - .5) * 2,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .2,
        col: cols[(Math.random() * cols.length) | 0] });
    }
    var frames = 0;
    cancelAnimationFrame(confettiRun);
    (function loop() {
      ctx.clearRect(0, 0, c.width, c.height);
      bits.forEach(function (b) {
        b.y += b.vy; b.x += b.vx; b.rot += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.fillStyle = b.col; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
      });
      if (frames++ < 320) confettiRun = requestAnimationFrame(loop);
      else { ctx.clearRect(0, 0, c.width, c.height); c.style.display = "none"; }
    })();
  }
  window.fmConfetti = confetti;

  /* ============ 17. big heart (finale) ============ */
  (function bigHeart() {
    var h = q("#heart-big"), out = q(".hb-count"); if (!h) return;
    var count = parseInt(store("fm_heart_taps"), 10) || 0;
    function paint() { if (out) out.textContent = count ? "Tum ne " + count + " martaba dil dabaya" : ""; }
    paint();
    h.addEventListener("click", function () {
      count++; store("fm_heart_taps", String(count));
      h.classList.remove("beat"); void h.offsetWidth; h.classList.add("beat");
      buzz(15); sfx("pop"); paint();
      if (count % 10 === 0) { confetti(120); toast(count + " dabbay! " + FROM + " khush hy"); }
      if (count === 50) { heartRain(30); toast("50 dafa! Tumhara bhi dil saqib ke pass hy"); }
    });
  })();

  /* ============ 18. confetti button + final line cycle ============ */
  (function finale() {
    var btn = q("#confetti-btn");
    if (btn) btn.addEventListener("click", function () { confetti(220); sfx("win"); });
    var line = q("#final-line"); if (!line) return;
    var lines = ["I Love You, " + NAME, "Ye dosti #1 hy", "Saqib + " + NAME + " = kabhi nahi tut-tay", "Tum best ho, bas"];
    var i = 0;
    setInterval(function () {
      var l = q("#final-line"); if (!l) return;
      i = (i + 1) % lines.length;
      l.style.opacity = 0;
      setTimeout(function () { l.textContent = lines[i]; l.style.opacity = 1; }, 400);
    }, 3800);
    line.style.transition = "opacity .4s";
  })();

  /* ============ 19. hero: tap name ============ */
  (function heroName() {
    var n = q("#hero-name"); if (!n) return;
    var taps = 0;
    n.addEventListener("click", function () {
      taps++; buzz(); sfx("tap");
      if (taps === 3) { heartRain(24); toast(NAME + " ka naam 3 dafa! Ab barish hogi"); }
    });
  })();

  /* ============ 20. letter: copy + share ============ */
  (function letterActions() {
    var art = q(".letter"); if (!art) return;
    var cp = q("#copy-letter"), sh = q("#share-letter");
    function text() { return art ? art.innerText.replace(/Chitthi copy karo|Share karo/g, "").trim() : ""; }
    if (cp) cp.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(text()) : Promise.reject())
        .then(function () { toast("Chitthi copy ho gayi"); sfx("pop"); })
        .catch(function () { toast("Copy nahi hua, khud select kar lo"); });
    });
    if (sh) sh.addEventListener("click", function () {
      if (navigator.share) navigator.share({ title: NAME + " ke liye", text: "Ye parho, dil se likhi hy \u2192 " + location.href }).catch(function () {});
      else { toast("Link copy kar lo: " + location.href); }
    });
  })();

  /* ============ 21. flip cards (dosti) ============ */
  (function flips() {
    var grid = q("#flip-grid"); if (!grid) return;
    var cards = [
      { ico: "\uD83E\uDD1C", t: "Chai wali dosti", back: "Har chai tumhari wajah se achi lagti hy. Kabhi kabhi sirf chai peene ka bahana tum ho." },
      { ico: "\uD83D\uDC7B", t: "Raat ki baatein", back: "2 baje raat ko jo baatein hui, wo subah ki roshni tak zinda hain." },
      { ico: "\uD83C\uDFB2", t: "Wo purana kal", back: "Jo kal humne saath guzara, wo kisi sunehri cheez se kam nahi." },
      { ico: "\uD83E\uDD34", t: "Secrets", back: "Tumhare secrets mere paas amanat hain. Duniya kehti hy bhed na kholo, main kehta hon dost pakad laya." },
      { ico: "\uD83D\uDE4C", t: "Fight phir bhi", back: "Jhagray hue, raat gayi, magar dosti ki shakal kabhi nahi badli." },
      { ico: "\u261A", t: "Hamesha ka wada", back: "Bhale zamana badle, ye wada nahi badlega: main hoon, rahunga." }
    ];
    var opened = 0;
    cards.forEach(function (c) {
      var f = el("div", "flip");
      f.innerHTML = '<div class="flip-inner"><div class="face front"><span class="ico">' + c.ico + '</span><b>' + c.t + '</b><small>tap karo</small></div><div class="face back"><p>' + c.back + '</p></div></div>';
      f.addEventListener("click", function () {
        f.classList.toggle("on"); buzz(); sfx("tap");
        if (f.classList.contains("on") && !f._n) { f._n = 1; opened++; }
        var out = q("#flip-count-n");
        if (out) out.textContent = opened + " / " + cards.length;
        if (opened === cards.length) { confetti(140); toast("Sab khul gaye! Har card dil se hy"); }
      });
      grid.appendChild(f);
    });
  })();

  /* ============ 22. fight meter ============ */
  (function meter() {
    var btn = q("#meter-btn"), fill = q("#meter-fill"), txt = q("#meter-txt"); if (!btn) return;
    var lines = [
      [8, "Gussa: 8% \u2014 bas itni der ka gussa, phir dosti"],
      [3, "3%? Ye gussa nahi, ye to pyar ki misaal hy"],
      [0, "0% \u2014 hisaab barabar, dosti poori"],
      [12, "12% \u2014 chalo ek chai par hisaab barabar"],
      [5, "5% gussa, 95% dosti. Hisaab saaf."]
    ];
    btn.addEventListener("click", function () {
      var p = lines[(Math.random() * lines.length) | 0];
      fill.style.width = p[0] + "%"; txt.textContent = p[1]; sfx("tap");
    });
    fill.style.width = "6%"; txt.textContent = "6% \u2014 itna sa bhi gussa nahi hota zyada der";
  })();

  /* ============ 23. timeline ============ */
  (function timeline() {
    var t = q("#timeline"); if (!t) return;
    var items = [
      ["Shuruaat", "Pehli mulaqat", "Jis din ye shuru hua, us din se sab kuch alag hy."],
      ["Dosti", "Bhai ban gaye", "Naam ke saath ek lafz jud gaya: bhai."],
      ["Pehli jhagray", "Aur phir sulah", "Chhota jhagra, bara sabak: rishta nahi tutt-na."],
      ["Raat ki baatein", "2 baje tak", "Wo baatein jo sirf hum dono jaante hain."],
      ["Mushkil waqt", "Saath khade", "Jab waqt ne imtihaan liya, dosti ne jawab de diya."],
      ["Aaj", "Ye website", "Tumhare liye, raat bhar jag kar banai gayi."],
      ["Kal", "Aur bhi acha", "Jo aayega, wo bhi saath guzarega."],
      ["Hamesha", "Wada", "Dosti ka wada: koi khatam nahi hota."]
    ];
    items.forEach(function (it) {
      t.appendChild(el("div", "tl-item", '<span class="when">' + it[0] + '</span><h4>' + it[1] + '</h4><p>' + it[2] + '</p>'));
    });
  })();

  /* ============ 24. report card ============ */
  (function report() {
    var card = q("#report-card"); if (!card) return;
    var rows = [
      ["Dosti", "A+"], ["Wafadari", "A++"], ["Mazaak", "A+"], ["Sachai", "A+"],
      ["Time dena", "A"], ["Dil ka saaf hona", "A++"], ["Overall", "A+++"]
    ];
    var html = "";
    rows.forEach(function (r) {
      html += '<div class="rc-row"><b>' + r[0] + '</b><span class="rc-grade">' + r[1] + '</span></div>';
    });
    html += '<div class="rc-total"><b>Top of the class</b><p class="note">Ye result kisi teacher ne nahi, is dost ne diya hy.</p></div>';
    card.innerHTML = html;
  })();

  /* ============ 25. quiz ============ */
  (function quiz() {
    var box = q("#quiz-box"); if (!box) return;
    var Q = [
      { q: NAME + " ki sab se pyari aadat?", o: ["Baat karna", "Hansa dena", "Sabar karna", "Sab kuch"], a: 3 },
      { q: "Saqib aur " + NAME + " ka rishta?", o: ["Dost", "Bhai", "Ruh ka taalluq", "Sab kuch"], a: 3 },
      { q: "Jhagre ke baad kaun pehle haath barata hy?", o: [NAME, FROM, "Dono", "Koi nahi"], a: 2 },
      { q: "Dosti ki measurement unit?", o: ["Meter", "Saal", "Dil", "Infinite"], a: 3 },
      { q: NAME + " ke bina Saqib ka kya haal?", o: ["Adhoora", "Boring", "Ghamgeen", "Ye sab"], a: 3 },
      { q: "Ye website kis liye hy?", o: ["Show off", "Assignment", "Sirf tumhare liye", "Faltu"], a: 2 }
    ];
    var idx = 0, score = 0;
    function render() {
      if (idx >= Q.length) return result();
      var cur = Q[idx];
      box.innerHTML =
        '<div class="q-meta"><span>Sawal ' + (idx + 1) + ' / ' + Q.length + '</span><span>Score: ' + score + '</span></div>' +
        '<p class="q-q">' + cur.q + '</p><div class="q-opts"></div>';
      var opts = q(".q-opts", box);
      cur.o.forEach(function (o, i) {
        var b = el("button", "q-opt", o); b.type = "button";
        b.addEventListener("click", function () {
          if (box.dataset.locked) return; box.dataset.locked = "1";
          qa(".q-opt", opts).forEach(function (bb, j) {
            bb.disabled = true;
            if (j === cur.a) bb.classList.add("right");
            else if (bb === b) bb.classList.add("wrong");
          });
          var right = i === cur.a;
          if (right) { score++; sfx("win"); } else sfx("sad");
          setTimeout(function () { idx++; box.dataset.locked = ""; render(); }, 900);
        });
        opts.appendChild(b);
      });
    }
    function result() {
      var msg = score === Q.length
        ? "Full marks! Tum aur main, ek hi dil ke do tukray."
        : score >= 4 ? "Kamaal! Dosti ka imtihaan pass, distinctions ke saath."
        : "Score ka kya, dosti to full marks ki hy.";
      box.innerHTML = '<div class="q-res"><b>' + score + ' / ' + Q.length + '</b><p>' + msg + '</p><button class="btn primary" id="quiz-again" type="button">Dobara khelo</button></div>';
      confetti(score >= 4 ? 180 : 80); sfx("win");
      q("#quiz-again").addEventListener("click", function () { idx = 0; score = 0; render(); });
    }
    render();
  })();

  /* ============ 26. roast machine ============ */
  (function roast() {
    var btn = q("#roast-btn"), out = q("#roast-out"); if (!btn) return;
    var R = [
      "Tum itna sweet ho ke dentist bhi tumse jalta hoga.",
      "Tumhare bina meri 'last seen' ka koi matlab nahi rehta.",
      "Tum wo dost ho jisko replace karne ki soch bhi zameen nahi utha sakti.",
      "Tumhara 'chal bye' bhi 3 ghante baad 'yaar wapis aa' ban jata hy.",
      "Duniya ke 8 arab log, aur main tum hi pe atka hon.",
      "Tumhe itna pyar karta hon ke sahaba kehte: aaram se, yehi to humara bhi dost hy.",
      "Tum ho to charging 1% par bhi himmat hy.",
      "Teri dosti ne 'sorry' lafz ko bhi superior bana diya \u2014 isi site ki wajah se."
    ];
    var last = -1;
    btn.addEventListener("click", function () {
      var i; do { i = (Math.random() * R.length) | 0; } while (i === last && R.length > 1);
      last = i;
      out.style.opacity = 0;
      setTimeout(function () { out.textContent = R[i]; out.style.opacity = 1; }, 200);
      buzz(); sfx("tap");
    });
  })();

  /* ============ 27. mood picker ============ */
  (function mood() {
    var row = q("#mood-row"), out = q("#mood-out"); if (!row) return;
    var M = [
      { ico: "\uD83D\uDE0C", t: "Badhiya", r: "Tum badhiya ho to duniya badhiya hy." },
      { ico: "\uD83D\uDE22", t: "Udaas", r: "Kya hua batao. Udaasi ka hissa bhi main hon." },
      { ico: "\uD83D\uDE20", t: "Gussa", r: "Gussa karo, magar mujhse. Baqi duniya se nafrat ki zaroorat nahi." },
      { ico: "\uD83D\uDE34", t: "Thaka hua", r: "So jao, main yahin hon. Subah pehli baat meri hogi." },
      { ico: "\uD83E\uDD29", t: "Excited", r: "Ye energy humesha rakhna. Aadhi to mujhe de dena." },
      { ico: "\uD83E\uDD14", t: "Soch mein", r: "Jo soch rahe ho, us mein apna bhi dekh lena. Main hoon." }
    ];
    M.forEach(function (m) {
      var b = el("button", "mood-chip", '<span class="ico">' + m.ico + '</span><span>' + m.t + '</span>');
      b.type = "button";
      b.addEventListener("click", function () {
        qa(".mood-chip", row).forEach(function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        out.textContent = m.r; buzz(); sfx("tap");
      });
      row.appendChild(b);
    });
  })();

  /* ============ 28. star rating ============ */
  (function stars() {
    var box = q("#stars"), out = q("#star-out"); if (!box) return;
    var msgs = [
      "Ek star? Dosti mein tumhe bhi 5 chahiye, mujhe bhi.",
      "Do? Theek hy, thora aur push karunga agli dafa.",
      "Teen theek hai, magar dil to paanch maangta hy.",
      "Chaar! Dosti ka 90% hisaab pass.",
      "Paanch! Tum jaisa dost, aisi site. Dono top."
    ];
    for (var i = 1; i <= 5; i++) {
      (function (i) {
        var b = el("button", "", "\u2605"); b.type = "button";
        b.addEventListener("click", function () {
          qa("button", box).forEach(function (bb, j) { bb.classList.toggle("lit", j < i); });
          out.textContent = msgs[i - 1]; buzz(); sfx(i === 5 ? "win" : "tap");
          if (i === 5) confetti(120);
        });
        box.appendChild(b);
      })(i);
    }
  })();

  /* ============ 29. shayari rotator ============ */
  (function shayari() {
    var v = q("#verse"); if (!v) return;
    var V = [
      "Dosti wo nahi jo saath kheli,\ndosti wo hy jo saath khada rahe.",
      "Chand ko dekha to tera chehra yaad aya,\nphir chand se kehne laga: tu adhoora hy bhai.",
      "Log paisa jama karte hain,\nmain log \u2014 aur logon mein tum.",
      "Dosti ka pehla paisa tera,\naakhri bhi tera; beech ke sab is site ke.",
      "Galiyon mein teri yaad na bhejo,\nyahan se bhi tera hi naam nikalta hy.",
      "Teri har ada meri dua mein,\ntera har din meri duaa mein.",
      "Naa jafa ki, na wafa ki,\ndosti ki baat hi aur thi.",
      "Ye website bhi teri chamakti dosti ka ek shesha hy.",
      "Bhai tera, dil tera, ye raat bhi teri \u2014 bas chai ki dukan bata dena."
    ];
    var i = 0;
    function paint() { v.style.opacity = 0; setTimeout(function () { v.textContent = V[i]; v.style.opacity = 1; }, 220); }
    v.style.transition = "opacity .3s"; v.textContent = V[0];
    var nx = q("#next-verse");
    if (nx) nx.addEventListener("click", function () { i = (i + 1) % V.length; paint(); buzz(); sfx("tap"); });
    var cp = q("#copy-verse");
    if (cp) cp.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(V[i]) : Promise.reject())
        .then(function () { toast("Shayari copy ho gayi"); sfx("pop"); })
        .catch(function () { toast("Copy nahi hua"); });
    });
  })();

  /* ============ 30. badges ============ */
  (function badges() {
    var grid = q("#badge-grid"); if (!grid) return;
    var B = [
      ["\uD83E\uDD47", "Best dost", "Is duniya ka best dost. Official."],
      ["\uD83D\uDC8E", "Heere jaisa", "Sacha, kam milne wala, har roshni mein chamakta hua."],
      ["\uD83D\uDD12", "Secret keeper", "Jo bataya, gaya nahi. Kabhi nahi."],
      ["\uD83D\uDD25", "Loyalty", "100%. Koio percent nahi kam hua."],
      ["\uD83C\uDF1F", "Roshni", "Andhere waqt mein sab se pehle tum."],
      ["\uD83E\uDD1C", "Chai partner", "Har chai ka aadha hissa tumhara."],
      ["\uD83C\uDFC6", "Legend", "Log poochte hain: aisa dost kaise mila?"],
      ["\uD83D\uDC95", "Dil ka doctor", "Baat karte hi sab theek ho jata hy."],
      ["\uD83D\uDE80", "Growth partner", "Tumhare saath behtar bana."],
      ["\uD83D\uDC8A", "Dard ko healer", "Hansi ne aadha dukh udar de diya."],
      ["\uD83D\uDD4A", "Peace", "Tumhare paas aakar sab shant hota hy."],
      ["\u2665", "Bhai", "Yehi asal badge hy. Baqi sab iski details hain."]
    ];
    B.forEach(function (b) {
      grid.appendChild(el("div", "badge", '<span class="ico">' + b[0] + '</span><b>' + b[1] + '</b><small>' + b[2] + '</small>'));
    });
  })();

  /* ============ 31. secret vault ============ */
  (function vault() {
    var btn = q("#code-btn"), inp = q("#code-in"), out = q("#code-out"), secret = q("#vault-secret");
    if (!btn || !inp) return;
    var CODES = { "1234": 0, "2019": 1, "9999": 2, "MATEEN": 1 };
    var SECRETS = [
      "Ye site sirf ek tester nahi \u2014 ye wada hy. Har jagah jo sach likha hy, wo sach hy.",
      "Jo dafa maine tumhara dil dukhaya, us raat maine wada kiya tha: phir kabhi nahi. Ye site usi wade ki gawah hy.",
      NAME + ", agar kabhi lage main bhool gaya \u2014 ye site khol lena. Har section ek jawab hy."
    ];
    btn.addEventListener("click", unlock);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") unlock(); });
    function unlock() {
      var v = (inp.value || "").trim();
      if (CODES[v] !== undefined) {
        out.textContent = "Khul gaya!"; out.className = "code-out ok"; sfx("win");
        if (secret) {
          q("p", secret) ? (q("p", secret).textContent = SECRETS[CODES[v]]) : (secret.innerHTML = "<p>" + SECRETS[CODES[v]] + "</p>");
          secret.classList.add("show");
        }
        confetti(140); buzz(20);
      } else {
        out.textContent = "Code ghalat hy. Hint parho: dosti ke saal, ya " + NAME + " try karo.";
        out.className = "code-out bad"; sfx("sad");
      }
    }
  })();

  /* ============ 32. bucket list ============ */
  (function todo() {
    var list = q("#todo-list"), count = q("#todo-count"); if (!list) return;
    var items = [
      "Ek hi dukan par saath chai",
      "Wo trip jo baaton mein bani thi, asli bana dena",
      "Sitaron ke neeche baith kar wo baat karna jo kabhi nahi ki",
      "Ek dosti ka talaq dena nahi \u2014 ek mauka aur dena",
      "Purani photos wali raat, sab yaadein phir zinda karna",
      "Tumhari pasand ki dawaal, mere hisaab se chai",
      "Ek din sirf dosti ka, phone silent, duniya se pare",
      "Ye wada: kabhi khatam na hone wali dosti"
    ];
    var done = JSON.parse(store("fm_todo") || "[]");
    function paint() {
      var n = 0;
      qa("li", list).forEach(function (li, i) {
        li.classList.toggle("done", done.indexOf(i) !== -1);
        if (done.indexOf(i) !== -1) n++;
      });
      if (count) count.textContent = n + " / " + items.length + " poore \u2014 " + (n === items.length ? "sab poore! Zindagi safal." : "baqi bhi hain, zaroor honge.");
    }
    items.forEach(function (t, i) {
      var li = el("li", "", '<span class="tick">\u2713</span><span class="lbl">' + t + '</span>');
      li.addEventListener("click", function () {
        var at = done.indexOf(i);
        if (at === -1) { done.push(i); sfx("pop"); } else { done.splice(at, 1); sfx("tap"); }
        store("fm_todo", JSON.stringify(done)); paint(); buzz();
        if (done.length === items.length) { confetti(200); toast("Puri list poore! Ab asli mein bhi karna hai"); }
      });
      list.appendChild(li);
    });
    paint();
  })();

  /* ============ 33. envelope ============ */
  (function env() {
    var e = q("#envelope"); if (!e) return;
    function toggle() { e.classList.toggle("open"); sfx(e.classList.contains("open") ? "pop" : "tap"); buzz(); }
    e.addEventListener("click", toggle);
    e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggle(); } });
  })();

  /* ============ 34. VIP content ============ */
  (function vip() {
    var track = q("#vip-track"), grid = q("#vip-grid"); if (!grid) return;
    var words = ["bhai", "dil se", "hamesha", "wafadar", "yaad", "dosti", "zindagi", "sacha", "jaan", "pyar"];
    if (track) {
      var set = words.map(function (w) { return "<span>" + w + " \u2665</span>"; }).join("");
      track.innerHTML = set + set;
    }
    var G = [
      "Tum wo ho jiske liye main 'chalo milte hain' keh kar sach mein milta hon.",
      "Dost to bahut hain, magar 'bhai' sirf tum ho.",
      "Jitna bhi ho jao, mere liye tum wahi rahoge: pehla.",
      "Tumhari hansi meri sab se sasti dawa hy, aur sab se asar wali.",
      "Log kehte hain waqt ne sab badal diya; tum ne kabhi badla hi nahi.",
      "Maine dil se likha hy, aur tum ho \u2014 to dil se hi parhna."
    ];
    G.forEach(function (t, i) {
      grid.appendChild(el("div", "vip-card", '<span class="n">0' + (i + 1) + '</span><p>' + t + '</p>'));
    });
  })();

  /* ============ 35. reasons rotator (dosti page) ============ */
  (function reasons() {
    var out = q("#reason-txt"), nx = q("#reason-next"); if (!out) return;
    var R = [
      "Kyunki tumne kabhi mere saath wafa ka hisaab nahi kiya.",
      "Kyunki jab sab ne 'chhodo usay' kaha, tumne 'chalo suno' kaha.",
      "Kyunki tumhari baat karne ka andaaz hi ilaaj hy.",
      "Kyunki tum pe bharosa wo hy jo khud par kam hota hy.",
      "Kyunki tum ho to raat ke 3 baje bhi ghar jaisa lagta hy.",
      "Kyunki dosti mein tumne poora diya, hisaab nahi poocha."
    ];
    var i = 0;
    function paint() { out.style.opacity = 0; setTimeout(function () { out.textContent = R[i]; out.style.opacity = 1; }, 220); }
    out.style.transition = "opacity .3s"; out.textContent = R[0];
    if (nx) nx.addEventListener("click", function () { i = (i + 1) % R.length; paint(); sfx("tap"); });
  })();

  /* ============ 36. compliment generator (khel page) ============ */
  (function compliments() {
    var btn = q("#compliment-btn"), out = q("#compliment-out"); if (!btn) return;
    var C = [
      "Tumhari dosti wo chiz hy jo kisi bazar mein nahi milti.",
      "Tumhara ek 'kaisa hy?' poore din ka hisaab theek kar deta hy.",
      "Tum wo insaan ho jinke liye 'best' lafz chota lagta hy.",
      "Tumhari wafa par to duniya nayi duniya abad kar sakti hy.",
      "Tumhare hote hue adhoora koi khwab nahi poora ho jata.",
      "Tum pe garv hy, aur dosti pe to fatak hi fatak."
    ];
    btn.addEventListener("click", function () {
      out.textContent = C[(Math.random() * C.length) | 0]; buzz(); sfx("pop");
    });
  })();

  /* ============ 37. miss-you button ============ */
  (function missYou() {
    var btn = q("#missy-btn"), out = q("#missy-out"); if (!btn) return;
    var M = [
      "Main bhi. Aur ye site isi kammi ka ilaaj hy.",
      "Miss you ka jawab: milte hain, jaldi. Pakka.",
      "Aadat nahi tut rahi tumhari, acha hi hy.",
      "Agli mulaqat ke liye hisaab: bohot jaldi."
    ];
    var t = 0;
    btn.addEventListener("click", function () {
      out.textContent = M[t++ % M.length]; heartRain(8); buzz(); sfx("pop");
    });
  })();

  /* ============ 38. next-chai planner (fun) ============ */
  (function chai() {
    var btn = q("#chai-btn"), out = q("#chai-out"); if (!btn) return;
    var P = [
      "Kal, shaam 5 baje \u2014 wahi purani dukan.",
      "Jumma ke din, chai 2 cup, baatein 2 ghante.",
      "Jis din tum keh do, bas wahi sab se acha din.",
      "Aaj hi? Ky nahi. Main aa raha hon."
    ];
    btn.addEventListener("click", function () {
      out.textContent = P[(Math.random() * P.length) | 0]; sfx("tap");
    });
  })();

  /* ============ 39. konami-lite: 5 taps on hero bg = petals burst ============ */
  (function bgTaps() {
    var hero = q(".hero"); if (!hero) return;
    var t = 0;
    hero.addEventListener("dblclick", function () { heartRain(16); sfx("win"); });
  })();

  /* ============ 40. pager arrows keyboard nav ============ */
  (function pagerKeys() {
    var pager = qa(".pager a");
    if (pager.length !== 2) return;
    addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") location.href = pager[1].href;
      if (e.key === "ArrowLeft") location.href = pager[0].href;
    });
  })();

})();
