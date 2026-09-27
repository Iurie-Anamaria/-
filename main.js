/* =========================================================
   MAIN — behaviour of the site (you normally don't need to edit this)
   ========================================================= */
(function () {
  const C = window.CONFIG, T = window.TEXTS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------- "&" sign in its own font ---------------- */
  const AMP_TARGETS = ".monogram, .brand-mini, .env-names, .s2-names, .script-lg, .gift-or";
  function ampify(el) {
    if (el.querySelector(".amp-sign") || !el.textContent.includes("&")) return;
    el.innerHTML = el.textContent.split("&")
      .map((s) => s.replace(/[<>]/g, "")).join('<span class="amp-sign">&amp;</span>');
  }

  /* ---------------- Language ---------------- */
  let lang;
  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && T[q]) return q;
    const saved = store.get("lang");
    if (saved && T[saved]) return saved;
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (nav === "ru") return "ru";
    return C.defaultLang || "ro";
  }
  const t = (k) => (T[lang] && T[lang][k]) || T.ro[k] || "";
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    store.set("lang", l);
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$(AMP_TARGETS).forEach(ampify);
    $$(".langbar button").forEach((b) => b.classList.toggle("active", b.dataset.lang === l));
  }
  $$(".langbar button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(pickLang());

  /* ---------------- Links & map ---------------- */
  $("#mapLink").href = C.venue.map;
  $("#siteLink").href = C.venue.site;
  $("#wazeLink").href = C.venue.waze;

  /* ---------------- Intro: wax seal (SVG) ---------------- */
  function rng(seed) { // small repeatable random generator
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const f1 = (v) => v.toFixed(1);
  const polar = (r, deg) => [100 + r * Math.cos(deg * Math.PI / 180), 100 + r * Math.sin(deg * Math.PI / 180)];
  function sealSVG() {
    const R = rng(7);
    // irregular wax edge
    const pts = [];
    for (let i = 0; i < 40; i++) pts.push(polar(96 + Math.sin(i / 40 * Math.PI * 10) * 1.2 + (R() - .5) * 2.2, i * 9));
    let blob = `M${f1((pts[39][0] + pts[0][0]) / 2)} ${f1((pts[39][1] + pts[0][1]) / 2)}`;
    pts.forEach((p, i) => { const n = pts[(i + 1) % 40]; blob += ` Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + n[0]) / 2)} ${f1((p[1] + n[1]) / 2)}`; });

    // laurel wreath hugging the rim (left half; the right is mirrored) — stays clear of the monogram
    const r = 63, a0 = 106, a1 = 226;
    const [sx, sy] = polar(r, a0), [ex, ey] = polar(r, a1);
    let wreath = `<path d="M${f1(sx)} ${f1(sy)} A${r} ${r} 0 0 1 ${f1(ex)} ${f1(ey)}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;
    let k = 0;
    for (let a = a0 + 6; a <= a1 - 4; a += 10.5, k++) {
      const [x, y] = polar(r, a), out = k % 2 === 0;
      const len = 9.5 - (a - a0) / (a1 - a0) * 2.5, ang = a + (out ? 50 : 128);
      wreath += `<path transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})" d="M0 0 C${f1(len*.3)} ${f1(-len*.32)} ${f1(len*.75)} ${f1(-len*.3)} ${f1(len)} 0 C${f1(len*.75)} ${f1(len*.3)} ${f1(len*.3)} ${f1(len*.32)} 0 0Z" fill="currentColor"/>`;
    }
    [140, 176, 208].forEach((a) => { const [x, y] = polar(r, a), [bx, by] = polar(r + 6.5, a + 5);
      wreath += `<path d="M${f1(x)} ${f1(y)} L${f1(bx)} ${f1(by)}" stroke="currentColor" stroke-width="1"/><circle cx="${f1(bx)}" cy="${f1(by)}" r="1.9" fill="currentColor"/>`; });
    wreath += `<path transform="translate(${f1(ex)} ${f1(ey)}) rotate(${a1 + 90})" d="M0 0 C3 -3 8 -3 11 0 C8 3 3 3 0 0Z" fill="currentColor"/>`;

    const mono = (C.monogram || "I&A").split("&");
    // monogram letters: I on the left, & in the centre, A on the right
    const MONO = { size: 46, amp: 22, lx: 65, ax: 95, rx: 125, y: 118 };
    const emb = `<g id="sealEmb">
        <circle cx="100" cy="100" r="71.5" fill="none" stroke="currentColor" stroke-width="1.1"/>
        ${wreath}<g transform="translate(200 0) scale(-1 1)">${wreath}</g>
        <g class="mono" fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round" text-anchor="middle">
          <text id="monoL" x="${MONO.lx}" y="${MONO.y}" style="font-family:var(--font-script);font-size:${MONO.size}px">${mono[0] || "I"}</text>
          <text id="monoAmp" x="${MONO.ax}" y="${MONO.y - 4}" style="font-family:var(--font-amp);font-style:italic;font-size:${MONO.amp}px">&amp;</text>
          <text id="monoR" x="${MONO.rx}" y="${MONO.y}" style="font-family:var(--font-script);font-size:${MONO.size}px">${mono[1] || "A"}</text>
        </g>
      </g>`;
    const arc = (rr, b0, b1) => { const p = polar(rr, b0), q = polar(rr, b1); return `M${f1(p[0])} ${f1(p[1])} A${rr} ${rr} 0 0 1 ${f1(q[0])} ${f1(q[1])}`; };
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="sealBase" cx="38%" cy="32%" r="75%"><stop offset="0" style="stop-color:var(--seal-hi)"/><stop offset=".5" style="stop-color:var(--seal)"/><stop offset="1" style="stop-color:var(--seal-lo)"/></radialGradient>
        <linearGradient id="sealRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--seal-hi)"/><stop offset=".5" style="stop-color:var(--seal)"/><stop offset="1" style="stop-color:var(--seal-lo)"/></linearGradient>
        <radialGradient id="sealWell" cx="56%" cy="60%" r="60%"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>
        <filter id="sealBlur"><feGaussianBlur stdDeviation="5"/></filter>
        ${emb}
      </defs>
      <path d="${blob}Z" fill="url(#sealBase)"/>
      <circle cx="100" cy="100" r="89" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="1"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="url(#sealRim)" stroke-width="12"/>
      <path d="${arc(84, 198, 262)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>
      <path d="${arc(84, 290, 312)}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="75.5" style="fill:var(--seal)"/>
      <circle cx="100" cy="100" r="75.5" fill="url(#sealWell)"/>
      <circle cx="100" cy="100" r="76" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.4"/>
      <use href="#sealEmb" transform="translate(1.1 1.6)" style="color:rgba(0,0,0,.6)"/>
      <use href="#sealEmb" transform="translate(-.7 -.7)" style="color:rgba(255,255,255,.45)"/>
      <use href="#sealEmb" style="color:var(--seal-emb)"/>
      <ellipse cx="70" cy="54" rx="34" ry="14" transform="rotate(-38 70 54)" fill="#fff" opacity=".14" filter="url(#sealBlur)"/>
    </svg>`;
  }
  $("#openBtn").innerHTML = sealSVG();

  /* ---------------- Intro: line-art drawings ---------------- */
  // each path draws itself: d = delay, t = duration (seconds)
  const P = (d, delay, dur, extra = "") => `<path pathLength="1" d="${d}" style="--d:${delay}s;--dur:${dur}s" ${extra}/>`;
  function lavender() {
    let s = P("M60 196 C61 150 59 100 60 38", 0, 1.8);
    [130, 110, 90, 70, 52].forEach((y, i) => {
      const k = 1.15 - i * .07, dl = 1 + i * .22;
      s += `<g transform="translate(60 ${y}) scale(${k}) translate(-60 ${-y})">` +
        P(`M60 ${y} C52 ${y-2} 49 ${y-10} 53 ${y-16} C57 ${y-12} 60 ${y-6} 60 ${y}`, dl, .9) +
        P(`M60 ${y} C68 ${y-2} 71 ${y-10} 67 ${y-16} C63 ${y-12} 60 ${y-6} 60 ${y}`, dl + .1, .9) +
        P(`M60 ${y-3} C57 ${y-9} 58 ${y-15} 60 ${y-19} C62 ${y-15} 63 ${y-9} 60 ${y-3}`, dl + .2, .8) + "</g>";
    });
    return s + `<circle pathLength="1" cx="60" cy="33" r="2.4" style="--d:2.2s;--dur:.5s"/>`;
  }
  function sprig() {
    return P("M60 4 C59 60 62 130 64 196", .2, 1.8) +
      P("M60 72 C50 60 38 50 27 42 C40 44 54 56 60 72", 1.1, 1.1) + P("M60 72 C50 61 40 52 30 44", 1.3, .9) +
      P("M61 60 C70 46 84 36 99 32 C88 44 74 54 61 60", 1.4, 1.1) + P("M61 60 C72 49 84 40 96 34", 1.6, .9);
  }
  function lily() {
    let s = P("M4 248 C60 205 130 165 188 128", 0, 1.9) +
      P("M16 250 C60 190 100 122 120 80", .2, 1.8) +
      P("M10 236 C80 205 150 190 206 150 C160 188 90 212 24 232", .5, 2);
    // bud
    s += `<g transform="translate(120 80) rotate(-6) scale(1.25)">` +
      P("M0 0 C-12 -12 -12 -36 -2 -50 C4 -38 6 -18 0 0", 1.4, 1) +
      P("M0 0 C12 -12 14 -34 6 -50 C0 -40 -2 -20 0 0", 1.55, 1) +
      P("M-2 -50 C0 -42 3 -42 6 -50", 2.3, .4) + P("M0 -2 C-6 -6 -11 -9 -16 -10", 2.3, .5) + "</g>";
    // lily
    s += `<g transform="translate(192 124)">`;
    [[-112, 76], [-58, 72], [-6, 78], [44, 68], [98, 60], [152, 62]].forEach(([a, L], i) => {
      const W = L * .22;
      s += `<g transform="rotate(${a})">` +
        P(`M0 0 C${f1(L*.25)} ${f1(-W)} ${f1(L*.7)} ${f1(-W*.9)} ${L} ${f1(-2)} C${f1(L*.7)} ${f1(W*.6)} ${f1(L*.25)} ${f1(W*.8)} 0 0`, 1.6 + i * .16, 1.1) +
        P(`M${f1(L*.12)} 0 C${f1(L*.4)} ${f1(-W*.2)} ${f1(L*.65)} ${f1(-W*.25)} ${f1(L*.85)} ${f1(-1.5)}`, 2 + i * .16, .8) + "</g>";
    });
    [-78, -46, -18, 10, 38].forEach((a, i) => {
      const l = 38 + (i % 2) * 6;
      s += `<g transform="rotate(${a})">` + P(`M0 0 C${f1(l*.3)} -4 ${f1(l*.7)} -4 ${l} 0`, 2.8 + i * .08, .6) +
        `<circle pathLength="1" cx="${l}" cy="0" r="2" style="--d:${(3.3 + i * .08).toFixed(2)}s;--dur:.3s"/></g>`;
    });
    return s + "</g>";
  }
  $("#artTop").innerHTML = lavender();
  $("#artBottom").innerHTML = sprig();
  $("#artFlower").innerHTML = `<g transform="translate(14 0)">${lily()}</g>`;

  /* ---------------- Intro: the sequence ---------------- */
  const intro = $("#intro"), step1 = $("#step1"), step2 = $("#step2"), tapHint = $("#tapHint");
  let timers = [], cardShown = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function openInvite() {
    if (intro.classList.contains("opening")) return;
    const seal = $("#openBtn");
    if (reduced) { leave(); return; }
    ["l", "r"].forEach((side) => {                   // 1) the seal cracks in two
      const half = seal.cloneNode(true);
      half.removeAttribute("id"); half.className = "seal seal-half " + side;
      half.setAttribute("aria-hidden", "true"); half.tabIndex = -1;
      intro.appendChild(half);
    });
    intro.classList.add("opening");                  // 2) top flap lifts, the others slide away
    later(() => { cardShown = true; step1.classList.add("on", "draw"); }, 2100);   // 3) "You are invited!" + drawing
    later(() => { $("#envelope").style.visibility = "hidden"; }, 2600);
    later(() => tapHint.classList.add("show"), 3400);
    later(() => step1.classList.remove("on"), 5600);                               // 4) save the date card
    later(() => step2.classList.add("on", "draw"), 6200);
    later(leave, 12200);                                                             // 5) fade into the site
  }
  function leave() {
    if (intro.classList.contains("leaving")) return;
    timers.forEach(clearTimeout); timers = [];
    intro.classList.add("leaving");
    setTimeout(finish, reduced ? 0 : 350);
    setTimeout(() => intro.classList.add("gone"), reduced ? 0 : 1150);
  }
  function finish() {
    document.body.classList.remove("locked");
    document.body.classList.add("opened");
  }
  $("#openBtn").addEventListener("click", openInvite);
  $("#cardScene").addEventListener("click", () => { if (cardShown) leave(); });
  // lets the ?design panel replay the opening
  window.replayIntro = () => {
    timers.forEach(clearTimeout); timers = []; cardShown = false;
    scrollTo(0, 0);
    $$(".seal-half", intro).forEach((h) => h.remove());
    intro.classList.remove("gone", "leaving", "opening");
    [step1, step2].forEach((s) => s.classList.remove("on", "draw"));
    tapHint.classList.remove("show");
    $("#envelope").style.visibility = "";
    document.body.classList.add("locked"); document.body.classList.remove("opened");
  };
  // ?skip or ?design in the address opens straight away (handy while editing)
  if (new URLSearchParams(location.search).has("skip") || new URLSearchParams(location.search).has("design")) {
    intro.classList.add("gone"); finish();
  }

  /* ---------------- Botanical branches (self-drawing) ---------------- */
  function branchSVG(seed) {
    const P = [[6, 112], [70, 100], [140, 70], [214, 14]]; // cubic bezier stem
    const pt = (u) => {
      const m = 1 - u;
      return [0, 1].map((i) => m*m*m*P[0][i] + 3*m*m*u*P[1][i] + 3*m*u*u*P[2][i] + u*u*u*P[3][i]);
    };
    const tan = (u) => {
      const m = 1 - u;
      const d = [0, 1].map((i) => 3*m*m*(P[1][i]-P[0][i]) + 6*m*u*(P[2][i]-P[1][i]) + 3*u*u*(P[3][i]-P[2][i]));
      return Math.atan2(d[1], d[0]) * 180 / Math.PI;
    };
    let out = `<path pathLength="1" d="M${P[0]} C${P[1]} ${P[2]} ${P[3]}"/>`;
    const n = 8;
    for (let k = 1; k <= n; k++) {
      const u = k / (n + 1) + (seed % 2 ? 0.02 : 0);
      const [x, y] = pt(u);
      const side = k % 2 ? -1 : 1;
      const ang = tan(u) + side * (42 + ((seed * 7 + k * 13) % 14));
      const s = 30 - k * 1.6;
      const leaf = `M0 0 C${s*.3} ${-s*.36} ${s*.78} ${-s*.34} ${s} 0 C${s*.78} ${s*.34} ${s*.3} ${s*.36} 0 0Z M0 0 L${s*.8} 0`;
      out += `<path pathLength="1" style="transition-delay:${(0.35 + k*0.12).toFixed(2)}s" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})" d="${leaf}"/>`;
    }
    const [ex, ey] = pt(1);
    out += `<path pathLength="1" style="transition-delay:1.4s" transform="translate(${ex} ${ey}) rotate(-35)" d="M0 0 C7 -9 20 -10 26 0 C20 10 7 9 0 0Z M0 0 L22 0"/>`;
    return `<svg viewBox="0 0 230 130" aria-hidden="true">${out}</svg>`;
  }
  $$(".branch").forEach((b) => { b.innerHTML = branchSVG(+b.dataset.seed || 1); });

  /* ---------------- Scroll reveal ---------------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal, .branch").forEach((el) => io.observe(el));

  /* ---------------- Scroll effects ---------------- */
  const progress = $("#progress"), mini = $("#brandMini");
  const timeline = $("#timeline"), tls = $$(".tl");
  const heroImg = $("#heroImg"), heroText = $("#heroText"), cd = $("#countdown"), cdImg = $("#cdImg");
  let ticking = false;
  function onScroll() {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    mini.classList.toggle("show", y > vh * 0.6);

    // timeline fills as you scroll
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
    timeline.style.setProperty("--p", p.toFixed(3));
    tls.forEach((li) => {
      const lr = li.getBoundingClientRect();
      li.classList.toggle("lit", lr.top + lr.height / 2 < vh * 0.6);
    });

    if (!reduced) {
      // hero text fades and slides down while scrolling (like the original site)
      if (y < vh * 1.2) {
        heroText.style.opacity = Math.max(0.06, 1 - y / 420).toFixed(3);
        heroText.style.transform = `translateY(${Math.min(90, y / 6).toFixed(1)}px)`;
        heroImg.parentElement.style.transform = `translateY(${(y * 0.25).toFixed(1)}px)`;
      }
      const cr = cd.getBoundingClientRect();
      if (cr.bottom > 0 && cr.top < vh) {
        const k = (cr.top + cr.height / 2 - vh / 2) / vh;
        cdImg.style.transform = `translateY(${(k * 12).toFixed(2)}%)`;
      }
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------------- Countdown ---------------- */
  const target = new Date(C.date).getTime();
  const els = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  }
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $(".cd-grid").hidden = true; $("#cdDone").hidden = false; return;
    }
    setNum(els.d, String(Math.floor(diff / 864e5)).padStart(2, "0"));
    setNum(els.h, String(Math.floor(diff % 864e5 / 36e5)).padStart(2, "0"));
    setNum(els.m, String(Math.floor(diff % 36e5 / 6e4)).padStart(2, "0"));
    setNum(els.s, String(Math.floor(diff % 6e4 / 1e3)).padStart(2, "0"));
  }
  tick(); setInterval(tick, 1000);

  /* ---------------- Add to calendar ---------------- */
  const utc = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = `Nunta ${C.couple}`;
  const where = `${C.venue.name}, ${C.venue.hall}, Dănceni`;
  $("#calGoogle").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}&dates=${utc(C.date)}/${utc(C.end)}` +
    `&location=${encodeURIComponent(where)}&details=${encodeURIComponent(location.href.split("?")[0])}`;
  $("#calIcs").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IA Wedding//EN", "BEGIN:VEVENT",
      `UID:ia-wedding-20270515@invite`, `DTSTAMP:${utc(Date.now())}`,
      `DTSTART:${utc(C.date)}`, `DTEND:${utc(C.end)}`,
      `SUMMARY:${title}`, `LOCATION:${where}`, `URL:${location.href.split("?")[0]}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${title}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "Iurie-Ana-Maria-15-05-2027.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------------- Forms (FormSubmit.co) ---------------- */
  const checkSVG = '<svg class="check" viewBox="0 0 52 52"><circle pathLength="1" cx="26" cy="26" r="24"/><path pathLength="1" d="M15 27l7 7 15-16"/></svg>';
  $$("form[data-kind]").forEach((form) => {
    const msg = $(".form-msg", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      // validation with gentle highlight
      let ok = true;
      $$("[required]", form).forEach((inp) => {
        const bad = inp.type === "radio" ? !form.querySelector(`[name="${inp.name}"]:checked`) : !inp.value.trim();
        (inp.closest(".field") || inp.closest(".choice")).classList.toggle("bad", bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      const kind = form.dataset.kind;
      const data = Object.fromEntries(new FormData(form));
      const btn = $("button[type=submit]", form);
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = t("form.sending"); msg.textContent = "";

      const payload = Object.assign({}, data, {
        _subject: kind === "rsvp"
          ? `RSVP: ${data.name} — ${data.attendance === "yes" ? "DA ✅" : "NU ❌"} (${data.guests})`
          : `🎵 Melodie: ${data.song}${data.artist ? " — " + data.artist : ""}`,
        _template: "table", _captcha: "false", limba: lang
      });
      if (kind === "rsvp") payload.attendance = data.attendance === "yes" ? "DA / YES" : "NU / NO";

      try {
        if (!C.email || C.email.includes("YOUR_EMAIL")) throw new Error("Set your email in config.js");
        const res = await fetch(`https://formsubmit.co/ajax/${C.email}`, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || String(j.success) === "false") throw new Error(j.message || res.status);

        const thanks = kind === "song" ? t("song.thanks") : t(data.attendance === "yes" ? "rsvp.thanksYes" : "rsvp.thanksNo");
        const done = document.createElement("div");
        done.className = "form-done";
        done.innerHTML = `${checkSVG}<p></p><button class="btn ghost" type="button"></button>`;
        done.querySelector("p").textContent = thanks;
        const again = done.querySelector("button");
        again.textContent = t("form.again");
        again.addEventListener("click", () => { done.remove(); form.hidden = false; form.reset(); });
        form.hidden = true; form.after(done);
        if (kind === "rsvp" && data.attendance === "yes") confetti();
      } catch (err) {
        console.warn("Form error:", err);
        msg.textContent = t("form.error");
      } finally {
        btn.disabled = false; btn.textContent = label;
      }
    });
    form.addEventListener("input", (e) => {
      const w = e.target.closest(".field") || e.target.closest(".choice");
      if (w) w.classList.remove("bad");
    });
  });

  /* ---------------- Confetti (theme colours) ---------------- */
  function confetti() {
    if (reduced) return;
    const cv = $("#confetti"), ctx = cv.getContext("2d");
    const dpr = devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const cols = ["--primary", "--accent", "--soft"].map((v) => cs.getPropertyValue(v).trim()).concat("#ffffff");
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .65,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 16 - 6,
      r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .3,
      c: cols[Math.floor(Math.random() * cols.length)], petal: Math.random() > .5
    }));
    let f = 0;
    (function frame() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - f / 170);
        if (p.petal) { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r / 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      });
      if (++f < 180) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }
})();