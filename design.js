/* =========================================================
   DESIGN EDITOR — only appears when the address ends with ?design
   Pick colours/fonts live, then "Copy CSS" and paste into theme.css.
   Guests never see this panel.
   ========================================================= */
(function () {
  if (!new URLSearchParams(location.search).has("design")) return;

  const PRESETS = {
    "Sicilia (navy & terracotta)": { bg: "#f8f5ef", surface: "#ffffff", ink: "#1d2a3f", muted: "#6b7182", primary: "#23426e", accent: "#c27a4e", soft: "#e6ecf4" },
    "Printed invitation (brown)":  { bg: "#fbf8f3", surface: "#ffffff", ink: "#3b2d22", muted: "#86796c", primary: "#6e5236", accent: "#b89a76", soft: "#f1e9df" },
    "Olive garden":                { bg: "#f6f4ec", surface: "#fffefa", ink: "#2e3226", muted: "#767a68", primary: "#5f6b43", accent: "#b8875a", soft: "#e8eadb" },
    "Dusty rose":                  { bg: "#fbf6f4", surface: "#ffffff", ink: "#3a2a2e", muted: "#8a7479", primary: "#8f5f68", accent: "#c9a27a", soft: "#f3e3e1" },
    "Sage & gold":                 { bg: "#f7f7f2", surface: "#ffffff", ink: "#2b3130", muted: "#737b78", primary: "#6f8a7c", accent: "#c3a36a", soft: "#e4ece6" },
    "Midnight (dark)":             { bg: "#121b2b", surface: "#1a2539", ink: "#f1ece2", muted: "#a7acba", primary: "#d9bd8c", accent: "#c27a4e", soft: "#223149" }
  };
  const SCRIPTS = ["Great Vibes", "Parisienne", "Alex Brush", "Marck Script", "Pinyon Script", "Allura"];
  const SERIFS = ["Cormorant Garamond", "Cormorant Infant", "Playfair Display", "Lora", "EB Garamond"];
  const AMPS = ["Playfair Display", "Cormorant Garamond", "Lora", "Great Vibes", "Parisienne"];
  const NAMES = { bg: "Background", surface: "Cards", ink: "Text", muted: "Soft text", primary: "Main colour", accent: "Accent", soft: "Light tint", paper: "Envelope paper", seal: "Wax seal" };

  // load every font option so they can be previewed
  const fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?" + [...new Set([...SCRIPTS, ...SERIFS, ...AMPS])].map(f => "family=" + f.replace(/ /g, "+") + (SERIFS.includes(f) ? ":ital,wght@0,400;0,500;0,600;1,400" : "")).join("&") + "&display=swap";
  document.head.appendChild(fl);

  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const state = {};
  Object.keys(NAMES).forEach(k => state[k] = cs.getPropertyValue("--" + k).trim());
  state.script = cs.getPropertyValue("--font-script").split(",")[0].replace(/"/g, "").trim();
  state.serif = cs.getPropertyValue("--font-serif").split(",")[0].replace(/"/g, "").trim();
  state.amp = (cs.getPropertyValue("--font-amp").split(",")[0].replace(/"/g, "").trim()) || state.serif;
  try { Object.assign(state, JSON.parse(localStorage.getItem("designDraft") || "{}")); } catch (e) {}

  const css = document.createElement("style");
  css.textContent = `
  .dz{position:fixed;left:16px;bottom:16px;z-index:5000;width:290px;max-height:calc(100svh - 32px);overflow:auto;background:#fff;color:#222;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);font:14px/1.4 system-ui,sans-serif;padding:16px}
  .dz h4{margin:0 0 10px;font-size:15px;display:flex;justify-content:space-between;align-items:center}
  .dz h4 button{border:0;background:#eee;border-radius:8px;padding:4px 8px;cursor:pointer}
  .dz label{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:6px 0}
  .dz input[type=color]{width:44px;height:30px;border:1px solid #ddd;border-radius:8px;padding:0;background:none;cursor:pointer}
  .dz select{width:100%;padding:7px;border-radius:8px;border:1px solid #ddd;font:inherit;margin-bottom:6px}
  .dz .b{display:flex;gap:8px;margin-top:12px}.dz .b button{flex:1;padding:9px;border-radius:10px;border:0;cursor:pointer;font:inherit}
  .dz .b .p{background:#222;color:#fff}.dz .b .s{background:#eee}
  .dz small{display:block;color:#777;margin-top:8px}
  .dz.min>*:not(h4){display:none}`;
  document.head.appendChild(css);

  const box = document.createElement("div");
  box.className = "dz";
  box.innerHTML = `<h4>🎨 Design <button type="button" data-min>–</button></h4>
    <select data-preset><option value="">— Presets —</option>${Object.keys(PRESETS).map(p => `<option>${p}</option>`).join("")}</select>
    ${Object.keys(NAMES).map(k => `<label>${NAMES[k]}<input type="color" data-k="${k}"></label>`).join("")}
    <div style="margin-top:10px">Script font (names, titles)</div>
    <select data-font="script">${SCRIPTS.map(f => `<option>${f}</option>`).join("")}</select>
    <div>Text font</div>
    <select data-font="serif">${SERIFS.map(f => `<option>${f}</option>`).join("")}</select>
    <div>"&amp;" sign font</div>
    <select data-font="amp">${AMPS.map(f => `<option>${f}</option>`).join("")}</select>
    <div class="b"><button class="s" data-replay>▶ Preview opening (envelope + seal)</button></div>
    <div class="b"><button class="s" data-reset>Reset</button><button class="p" data-copy>Copy CSS</button></div>
    <small>Paste the copied CSS over everything in <b>theme.css</b>, save and refresh. Russian letters automatically use Great Vibes when the script font has none.</small>`;
  document.body.appendChild(box);

  function apply() {
    Object.keys(NAMES).forEach(k => {
      root.style.setProperty("--" + k, state[k]);
      box.querySelector(`[data-k=${k}]`).value = state[k];
    });
    root.style.setProperty("--font-script", `"${state.script}", "Great Vibes", cursive`);
    root.style.setProperty("--font-serif", `"${state.serif}", Georgia, serif`);
    root.style.setProperty("--font-amp", `"${state.amp}", Georgia, serif`);
    box.querySelector("[data-font=amp]").value = state.amp;
    box.querySelector("[data-font=script]").value = state.script;
    box.querySelector("[data-font=serif]").value = state.serif;
    try { localStorage.setItem("designDraft", JSON.stringify(state)); } catch (e) {}
  }
  box.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.k) state[el.dataset.k] = el.value;
    if (el.dataset.font) state[el.dataset.font] = el.value;
    if (el.dataset.preset !== undefined && PRESETS[el.value]) Object.assign(state, PRESETS[el.value]);
    apply();
  });
  box.querySelector("[data-replay]").onclick = () => window.replayIntro && window.replayIntro();
  box.querySelector("[data-min]").onclick = () => box.classList.toggle("min");
  box.querySelector("[data-reset]").onclick = () => {
    try { localStorage.removeItem("designDraft"); } catch (e) {}
    location.reload();
  };
  box.querySelector("[data-copy]").onclick = async (e) => {
    const fam = f => f.replace(/ /g, "+");
    const out =
`/* THEME — generated with the ?design editor */
@import url("https://fonts.googleapis.com/css2?family=${fam(state.script)}&family=Great+Vibes&family=${fam(state.serif)}:ital,wght@0,400;0,500;0,600;1,400;1,500${state.amp !== state.serif ? "&family=" + fam(state.amp) + (SCRIPTS.includes(state.amp) ? "" : ":ital@0;1") : ""}&display=swap");

:root {
${Object.keys(NAMES).map(k => `  --${k}: ${state[k]};`).join("\n")}

  --font-script: "${state.script}", "Great Vibes", cursive;
  --font-serif: "${state.serif}", Georgia, serif;
  --font-amp: "${state.amp}", Georgia, serif;
}
`;
    try { await navigator.clipboard.writeText(out); e.target.textContent = "Copied ✓"; }
    catch (err) { prompt("Copy this CSS:", out); }
    setTimeout(() => e.target.textContent = "Copy CSS", 2000);
  };
  apply();
})();
