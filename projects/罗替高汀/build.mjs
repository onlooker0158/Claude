import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as FA from "./figA.mjs";
import * as FB from "./figB.mjs";
import { RESIDUES, residue, ATOMS, LIG } from "./pocket.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = join(HERE, "../../.claude/skills/anatomy");
const theme = process.argv.includes("--light") ? "light" : "dark";

// lathe.mjs inlined beside the kit (its two private helpers renamed so they don't clash)
const latheScript = () =>
  readFileSync(join(SKILL, "kit/lathe.mjs"), "utf8")
    .replace(/^import .*$/m, "")
    .replace(/^export /gm, "")
    .replace(/\bsignedArea\b/g, "lSignedArea")
    .replace(/\boriented\b/g, "lOriented")
    .replace(/\brunsOf\b/g, "lRunsOf");

// 受体数据：Ki 来自 Scheller 等 2009（罗替高汀体外受体谱）；功能数据来自 Wood 等 2015（Br J Pharmacol）
const RECEPTORS = [
  { id: "D1", family: "s", g: "Gαs/olf", ki: 83, kiText: "83", emax: 1, pec50: "9.6" },
  { id: "D2", family: "i", g: "Gαi/o", ki: 13.5, kiText: "13.5", emax: 1, pec50: "10.4" },
  { id: "D3", family: "i", g: "Gαi/o", ki: 0.71, kiText: "0.71", emax: 1, pec50: "8.2" },
  { id: "D4", family: "i", g: "Gαi/o", ki: 7.7, kiText: "3.9–15", emax: 0.62, pec50: "7.7" },
  { id: "D5", family: "s", g: "Gαs/olf", ki: 5.4, kiText: "5.4", emax: 0.64, pec50: "7.7" },
];

const A = FA.buildA();
const B = FB.buildB();

const trpParts = RESIDUES.find((r) => r.id === "W6.48");

const live = `
const PA = ${JSON.stringify(FA.P)};
const PB = ${JSON.stringify(FB.P)};
const RECEPTORS = ${JSON.stringify(RECEPTORS)};
const SC = ${FA.SC}, ZP = ${FA.ZP}, LIFT = ${FA.LIFT};
const DIAL = ${JSON.stringify(FA.DIAL)}, KI_RANGE = ${JSON.stringify(FA.KI_RANGE)};
const TRP = ${JSON.stringify(trpParts)};
const LIGAND = ${JSON.stringify(LIG)};
const HELICES_A = ${JSON.stringify((await import("./pocket.mjs")).HELICES)};
const HELIX_R = ${(await import("./pocket.mjs")).HELIX_R};
const TOP_ATOM = ${JSON.stringify(FA.TOP_ATOM)};
const RADIUS_TOP = ${{ C: 0.5, N: 0.58, O: 0.58, S: 0.74 }[FA.TOP_ATOM.el]};
const BEAM_Z = 360;
const TM6 = ${JSON.stringify(FB.TM6)}, TM6_DIR = ${JSON.stringify(FB.TM6_DIR)}, TM6_OUT = ${JSON.stringify(FB.TM6_OUT)};
const ROD_R = ${FB.ROD_R}, ROD_Z = ${JSON.stringify(FB.ROD_Z)}, KINK = ${FB.KINK};
const GA = ${JSON.stringify(FB.GA)}, GB = ${JSON.stringify(FB.GB)}, RAS = ${JSON.stringify(FB.RAS)}, AC = ${JSON.stringify(FB.AC)}, CUP = ${JSON.stringify(FB.CUP)}, FEED = ${JSON.stringify(FB.FEED)}, DROP = ${JSON.stringify(FB.DROP)}, GIRK = ${JSON.stringify(FB.GIRK)}, AH_PLAN = ${JSON.stringify(FB.AH_PLAN)};

// ---- pocket geometry helpers needed live (W6.48 rebuild) ----
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => mul(a, 1 / (len(a) || 1));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const Z = [0, 0, 1];
const H = Object.fromEntries(HELICES_A.map((h) => [h.id, h]));
const A = LIGAND;
${(await import("./pocket.mjs")).residue.toString().replace("function residue", "function residue")}
${"function ringAtoms(centre, normal, side, r, count, start = 0) { const other = unit(cross(normal, side)); return Array.from({ length: count }, (_, i) => { const phi = start + (i * TAU) / count; return add(centre, add(mul(side, Math.cos(phi) * r), mul(other, Math.sin(phi) * r))); }); }"}
const W = (p) => [p[0] * SC, p[1] * SC, ZP + p[2] * SC];
const RADIUS = { C: 0.5, N: 0.58, O: 0.58, S: 0.74, CA: 0.5 };
function trpSvg(toggle) {
  const r = residue(TRP, toggle);
  const pts = r.atoms.map((a) => W(a.at));
  const items = [];
  r.bonds.forEach(([i, j]) => {
    const d = sub(pts[j], pts[i]);
    items.push({ key: depthOf(mul(add(pts[i], pts[j]), 0.5), PA) - 4, svg: solidSvg(disc(0, len(d), 0.21 * SC * 0.6, frameAlong(pts[i], d), PA, { steps: 16 }), { tone: toggle > 0.05 ? "hi" : "mid", crease: "none", lit: toggle > 0.05 }) });
  });
  r.atoms.forEach((a, i) => {
    const rad = RADIUS[a.el] * SC * (a.el === "CA" ? 1 : 0.62);
    const paths = sphereOf(pts[i], rad, PA, { steps: 40 });
    const tint = a.el === "N" ? '<path class="mol-tint" data-el="N" d="' + paths.fill + '"/>' : "";
    items.push({ key: depthOf(pts[i], PA), svg: solidSvg(paths, { tone: toggle > 0.05 && a.el !== "CA" ? "hi" : "mid", lit: toggle > 0.05 && a.el !== "CA" }) + tint });
  });
  return items.sort((a, b) => a.key - b.key).map((x) => x.svg).join("");
}
const kiAngle = (ki) => (-120 + 240 * ((Math.log10(ki) - Math.log10(KI_RANGE[0])) / (Math.log10(KI_RANGE[1]) - Math.log10(KI_RANGE[0])))) * Math.PI / 180;
const needleD = (ki) => { const a = kiAngle(ki); const { x, y, r, z, h } = DIAL; return lineOnTop([x - Math.sin(a) * 4, y + Math.cos(a) * 4], [x + Math.sin(a) * (r - 5), y - Math.cos(a) * (r - 5)], z + h + 0.2, PA); };
const hangerD = (lift) => { const p = W(TOP_ATOM.at); const z0 = p[2] + RADIUS_TOP * SC * 0.6 + lift; return solidSvg(cylinder(p[0], p[1], 1.1, z0, BEAM_Z - z0, PA, 14), { tone: "mid", crease: "none" }); };

// ---- figure 2 builders needed live ----
const carriageCol = (bottom) => solidSvg(cylinder(0, 0, 4.4, 9, Math.max(1, bottom - 9), PB, 20), { tone: "mid", crease: "none" });
function tm6Low(out) {
  const top = [TM6.at[0], TM6.at[1], KINK];
  const end = [TM6.at[0] + TM6_DIR[0] * out, TM6.at[1] + TM6_DIR[1] * out, ROD_Z[0]];
  const d = sub(end, top);
  return solidSvg(disc(0, len(d), ROD_R, frameAlong(top, d), PB), { tone: out > 1 ? "hi" : "mid", lit: out > 1, crease: "none" });
}
function gAlphaSvg(label) {
  const out = [];
  out.push(solidSvg(slabOf(RAS, 0, RAS.h, PB, 4, 0.8), { tone: "hi", inner: lineSvg(sideSeam(RAS, 14, PB, 4), { tone: "faint" }) }));
  out.push(lineSvg(planOutline(insetPlan(RAS, 4), RAS.h, PB, 4), { tone: "faint" }));
  out.push(solidSvg(cylinder(-6, 0, 5, RAS.h, 34, PB, 24), { tone: "hi", crease: "lo", inner: lineSvg([RAS.h + 10, RAS.h + 22].map((z) => sideArc(-6, 0, 5, z, PB, 16)).join(""), { tone: "faint" }) }));
  out.push(solidSvg(cylinder(-6, 0, 5.6, RAS.h + 34, 1.4, PB, 24), { tone: "hi" }));
  out.push(faceTextSvg(topMatrix([-20, 14], RAS.h, PB, "x"), label, { size: 7, tone: "mid" }));
  out.push(lineSvg(ring(14, 0, 7, RAS.h, PB, 24), { tone: "lo" }));
  return out.join("");
}
const campSvg = () => solidSvg(cylinder(0, 0, 3.2, 0, 3.2, PB, 16), { tone: "hi", lit: true, crease: "none" });
function gateSvg(open) {
  const { x, y, r, z0 } = GIRK;
  const t = open * 1.1;
  const spokes = Array.from({ length: 4 }, (_, i) => { const a = t + (i * Math.PI) / 2; return lineOnTop([x + Math.cos(a) * 3, y + Math.sin(a) * 3], [x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)], z0, PB); });
  return lineSvg(spokes.join(""), { tone: open > 0.05 ? "lit" : "lo" }) + lineSvg(ring(x, y, r - 3, z0, PB, 40), { tone: "lo" }) + lineSvg(ring(x, y, 3 + open * 7, z0, PB, 24), { tone: open > 0.05 ? "lit" : "lo" });
}

// ---- timeline (12 s loop) ----
const CYCLE = 12;
const ease = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const ramp = (t, a, b) => ease((t - a) / (b - a));
const span = (t, a, b, c, d) => ramp(t, a, b) * (1 - ramp(t, c, d));
const lerp = (a, b, s) => a + (b - a) * s;
function state(t, rec) {
  const gi = rec.family === "i";
  const s = {};
  s.lift = 1 - span(t, 0.2, 1.6, 10.6, 11.6);           // 配体抬起量（1 = 在上方）
  s.bound = s.lift < 0.03 && t < 10.6;
  s.trp = span(t, 1.9, 2.7, 10.6, 11.2) * rec.emax;
  s.tm6 = span(t, 2.4, 3.4, 10.4, 11.2) * (gi ? TM6_OUT.i : TM6_OUT.s) * rec.emax;
  const dock = span(t, 3.3, 4.3, 10.6, 11.4);
  const split = span(t, 6.0, 7.2, 9.8, 10.6);
  s.gaX = lerp(GA.x.home, GA.x.ac, split);
  s.gaZ = lerp(lerp(GA.rest, GA.dock, dock), GA.ac, split);
  s.bgX = lerp(GB.x.home, gi ? GB.x.girk : -112, split);
  s.bgZ = lerp(lerp(GA.rest, GA.dock, dock) + GB.dz, gi ? GIRK.z0 - 22 : GA.rest + GB.dz, split);
  s.ah = span(t, 4.4, 4.9, 5.5, 6.0);
  s.gdpOut = ramp(t, 4.6, 5.3);                          // 旧 GDP 离开
  s.gtpIn = ramp(t, 5.0, 5.7);                           // 新 GTP 进入
  s.hydro = ramp(t, 9.4, 9.9);                           // GTP 水解为 GDP
  s.effect = span(t, 7.0, 7.4, 9.6, 10.0) * rec.emax;
  s.girk = gi ? span(t, 7.0, 7.6, 9.6, 10.2) : 0;
  return s;
}
function phaseText(t, rec) {
  const gi = rec.family === "i";
  if (t < 0.2 || t >= 11.6) return ["罗替高汀在受体外", "静息：G 蛋白结合 GDP"];
  if (t < 1.6) return ["罗替高汀进入正构口袋", "罗替高汀进入口袋"];
  if (t < 2.4) return ["盐桥 D3.32 · 氢键 S5.42/S5.46 · F6.51 芳香堆积", "配体就位"];
  if (t < 3.4) return ["W6.48 转动：激活开关", "TM6 胞内端外摆 " + Math.round((gi ? TM6_OUT.i : TM6_OUT.s) / 3 * rec.emax) + " Å（示意）"];
  if (t < 4.4) return ["受体处于激活构象", rec.g + " 的 α5 螺旋插入空腔"];
  if (t < 6.0) return ["受体处于激活构象", "GDP 释放 → GTP 结合"];
  if (t < 7.2) return ["受体处于激活构象", "Gα·GTP 与 Gβγ 分开"];
  if (t < 9.8) return ["受体处于激活构象", gi ? "Gαi 抑制腺苷酸环化酶 → cAMP↓ · Gβγ 打开 GIRK → K⁺ 外流" : "Gαs 激活腺苷酸环化酶 → cAMP↑"];
  if (t < 10.6) return ["受体处于激活构象", "GTP 水解为 GDP，Gα 回到 Gβγ"];
  return ["罗替高汀离开口袋", "复位"];
}

// ---- DOM ----
const figA = document.querySelector(".rt-pocket");
const figB = document.querySelector(".rt-cycle");
const ligA = [...figA.querySelectorAll("[data-lig]")];
const contacts = figA.querySelector('[data-part="contacts"]');
const hanger = figA.querySelector('[data-part="hanger"]');
const trp = figA.querySelector('[data-part="trp"]');
const needle = figA.querySelector('[data-part="needle"]');
const q = (name) => figB.querySelector('[data-part="' + name + '"]');
const parts = { ga: q("ga"), ah: q("ah"), gaCar: q("ga-car"), gaCol: q("ga-col"), bg: q("bg"), bgCar: q("bg-car"), bgCol: q("bg-col"), gdp: q("gdp"), gtp: q("gtp"), lig: q("lig"), tm6: q("tm6-low"), gate: q("gate"), kflow: q("kflow"), camp: q("camp") };
const readA = document.querySelector('[data-readout-a]');
const readB = document.querySelector('[data-readout-b]');
const picks = [...document.querySelectorAll(".rt-pick")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
let rec = RECEPTORS[2], clock = 0, last = 0, frame = 0, visible = false, paused = false;
const memo = {};
const once = (key, value, fn) => { if (memo[key] !== value) { memo[key] = value; fn(); } };
const tr = (P, v) => translateAlong(P, v);

function campPellets(t, s) {
  // 基础产量每 1.6 s 一粒；Gs 激活时每 0.3 s 一粒；Gi 激活时停止
  const out = [];
  const fall = 0.7;
  for (let k0 = Math.floor((t - fall) / 0.1); k0 <= Math.floor(t / 0.1); k0++) {
    const born = k0 * 0.1;
    if (born < 0) continue;
    const st = state(born, rec);
    const period = rec.family === "s" ? lerp(1.6, 0.3, st.effect) : (st.effect > 0.5 ? Infinity : 1.6);
    if (!isFinite(period)) continue;
    const slot = Math.round(born / 0.1);
    const every = Math.max(1, Math.round(period / 0.1));
    if (slot % every) continue;
    const age = t - born;
    if (age < 0 || age > fall) continue;
    const z = (AC.z0 + 4) - (AC.z0 + 4 - 12) * (age / fall) ** 2;
    out.push('<g transform="' + tr(PB, [CUP.x, AC.y + AC.d + 3, z]) + '">' + campSvg() + "</g>");
  }
  return out.join("");
}

function draw(t) {
  const s = state(t, rec);
  // figure 1
  const liftZ = s.lift * LIFT;
  once("liftA", liftZ.toFixed(2), () => {
    const v = tr(PA, [0, 0, liftZ]);
    ligA.forEach((g) => g.setAttribute("transform", v));
    hanger.innerHTML = hangerD(liftZ);
  });
  once("bound", s.bound, () => contacts.setAttribute("data-on", s.bound ? "1" : "0"));
  once("trp", s.trp.toFixed(3), () => (trp.innerHTML = trpSvg(s.trp * 0.95)));
  once("needle", rec.id, () => needle.setAttribute("d", needleD(rec.ki)));
  // figure 2
  once("ligB", s.lift.toFixed(3), () => parts.lig.setAttribute("transform", tr(PB, [0, 0, lerp(DROP.pocket, DROP.top - 6, s.lift)])));
  once("tm6", s.tm6.toFixed(2), () => (parts.tm6.innerHTML = tm6Low(s.tm6)));
  once("label", rec.g, () => (parts.ga.innerHTML = gAlphaSvg(rec.family === "s" ? "Gαs" : "Gαi")));
  once("ga", s.gaX.toFixed(2) + "|" + s.gaZ.toFixed(2) + "|" + s.ah.toFixed(3), () => {
    parts.ga.setAttribute("transform", tr(PB, [s.gaX, 0, s.gaZ]));
    parts.ah.setAttribute("transform", tr(PB, [s.gaX + s.ah * 12, 0, s.gaZ]));
    parts.gaCar.setAttribute("transform", tr(PB, [s.gaX, 0, 0]));
    parts.gaCol.innerHTML = carriageCol(s.gaZ);
  });
  once("bg", s.bgX.toFixed(2) + "|" + s.bgZ.toFixed(2), () => {
    parts.bg.setAttribute("transform", tr(PB, [s.bgX, 0, s.bgZ]));
    parts.bgCar.setAttribute("transform", tr(PB, [s.bgX, 0, 0]));
    parts.bgCol.innerHTML = carriageCol(s.bgZ);
  });
  const seat = [s.gaX + 14, 0, s.gaZ + RAS.h];
  // old GDP: leaves the seat toward the front and drops to the plate, fading
  const gdpOld = s.gdpOut;
  const gdpPos = gdpOld < 1 ? [seat[0] + gdpOld * 26, seat[1] + gdpOld * 60, seat[2] - gdpOld * seat[2] + Math.sin(gdpOld * Math.PI) * 20] : seat;
  const fresh = s.hydro; // after hydrolysis the seat holds GDP again (the GTP becomes GDP)
  const gdpShow = gdpOld < 1 ? 1 - ramp(gdpOld, 0.7, 1) : fresh;
  once("gdp", gdpPos.map((v) => v.toFixed(1)).join() + gdpShow.toFixed(2), () => {
    parts.gdp.setAttribute("transform", tr(PB, gdpOld < 1 ? gdpPos : seat));
    parts.gdp.setAttribute("opacity", gdpShow.toFixed(2));
  });
  const feedTop = [FEED.x, FEED.y, 26];
  const gtpPos = s.gtpIn < 1 ? [lerp(feedTop[0], seat[0], s.gtpIn), lerp(feedTop[1], seat[1], s.gtpIn), lerp(feedTop[2], seat[2], s.gtpIn) + Math.sin(s.gtpIn * Math.PI) * 40] : seat;
  const gtpShow = s.gtpIn <= 0 ? ramp(t % CYCLE, 4.6, 5.0) : 1 - fresh;
  once("gtp", gtpPos.map((v) => v.toFixed(1)).join() + gtpShow.toFixed(2), () => {
    parts.gtp.setAttribute("transform", tr(PB, gtpPos));
    parts.gtp.setAttribute("opacity", gtpShow.toFixed(2));
  });
  once("gate", s.girk.toFixed(3), () => {
    parts.gate.innerHTML = gateSvg(s.girk);
    parts.kflow.setAttribute("opacity", (s.girk * 0.9).toFixed(2));
  });
  parts.camp.innerHTML = campPellets(t, s);
  const [a, b] = phaseText(t, rec);
  const ta = rec.id + " · Ki " + rec.kiText + " nM · " + a;
  const tb = rec.id + " → " + rec.g + " · " + b;
  if (readA.textContent !== ta) readA.textContent = ta;
  if (readB.textContent !== tb) readB.textContent = tb;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (!paused) clock = (clock + dt) % CYCLE;
  draw(clock);
  frame = visible && !paused && !still.matches ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function choose(i) {
  rec = RECEPTORS[i];
  picks.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  if (still.matches) draw(8.5);
  run();
}
picks.forEach((b, i) => b.addEventListener("click", () => choose(i)));
document.querySelectorAll(".iso-stage").forEach((stage) => stage.addEventListener("keydown", (e) => {
  const i = RECEPTORS.indexOf(rec);
  if (e.key === "ArrowRight") choose((i + 1) % 5);
  else if (e.key === "ArrowLeft") choose((i + 4) % 5);
  else if (/^[1-5]$/.test(e.key)) choose(+e.key - 1);
  else if (e.key === " ") { paused = !paused; run(); }
  else return;
  e.preventDefault();
}));
new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); if (visible) run(); }, { rootMargin: "120px 0px" }).observe(document.querySelector(".rt-wrap"));
choose(2);
draw(still.matches ? 8.5 : 0);
`;

const CSS = `<style>
.mol-tint{pointer-events:none;mix-blend-mode:multiply;fill-opacity:.55}
.mol-tint[data-el="O"]{fill:#e5484d}.mol-tint[data-el="N"]{fill:#3e7bfa}.mol-tint[data-el="S"]{fill:#e2b203}
.iso[data-theme="dark"] .mol-tint{mix-blend-mode:screen;fill-opacity:.42}
.mol-contact{transition:opacity .5s var(--anatomy-ease, ease)}
[data-part="contacts"][data-on="0"] .mol-contact{opacity:0}
.rt-picks{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:18px 0 6px}
.rt-pick{font:inherit;font-size:13px;padding:5px 14px;border-radius:999px;border:1px solid var(--anatomy-mid);background:transparent;color:var(--anatomy-text);cursor:pointer}
.rt-pick[aria-pressed="true"]{background:var(--anatomy-strong);color:var(--anatomy-card);border-color:var(--anatomy-strong)}
.rt-pick:focus-visible{outline:2px solid var(--anatomy-strong);outline-offset:2px}
.rt-pick small{opacity:.7;margin-left:4px}
.iso-plate-corner[data-corner="title"],.iso-plate-corner[data-corner="hint"]{text-transform:none;letter-spacing:.04em}
.iso-figure+.iso-figure{margin-top:28px}
@media (max-width:560px){.iso-plate{padding-bottom:78px}.iso-plate-corner[data-corner="readout"]{white-space:normal;max-width:100%;text-align:right;line-height:1.45}.iso-plate-corner[data-corner="hint"]{bottom:auto;top:16px}}
.rt-doc{margin-top:40px;color:var(--anatomy-text)}
.rt-doc h2{color:var(--anatomy-strong);font-size:17px;margin:34px 0 10px}
.rt-doc h3{color:var(--anatomy-strong);font-size:14.5px;margin:20px 0 6px}
.rt-doc p,.rt-doc li{font-size:14px;line-height:1.75}
.rt-doc table{border-collapse:collapse;width:100%;font-size:13px;margin:10px 0}
.rt-doc th,.rt-doc td{border-bottom:1px solid var(--anatomy-mid);padding:7px 6px;text-align:left;vertical-align:top}
.rt-doc th{color:var(--anatomy-strong);font-weight:600}
.rt-doc .wrap{overflow-x:auto}
.rt-doc small{color:var(--anatomy-muted)}
.rt-doc code{font-family:var(--anatomy-mono);font-size:12.5px}
</style>`;

const picks = RECEPTORS.map((r, i) => `<button type="button" class="rt-pick" aria-pressed="${i === 2}">${r.id}<small>${r.family === "s" ? "Gs" : "Gi"}</small></button>`).join("");

const plateA = k
  .plateHtml({
    fig: "图 1",
    title: "分子层面 · 罗替高汀进入结合口袋",
    hint: "← → 切换受体 · 空格暂停",
    readout: "",
    keys: [
      { mark: "lit", label: "罗替高汀（球棍模型）：红＝酚羟基 O，蓝＝质子化的 N⁺，黄＝噻吩的 S" },
      { mark: "raised", label: "立柱＝跨膜螺旋 TM1–TM7（TM1 截短以露出口袋）；灰色小球棍＝口袋里的氨基酸侧链" },
      { mark: "dashed", label: "虚线＝盐桥/氢键；点线＝芳香堆积或疏水接触；前角刻度盘＝该受体的 Ki（对数刻度）" },
    ],
    caption:
      "残基用 Ballesteros–Weinstein 通用编号：每根螺旋最保守的残基记为 x.50，D3.32 即 TM3 上比它靠前 18 位的天冬氨酸，五种多巴胺受体都保守。原子按真实键长和环结构搭建；螺旋画得比真实细、间距略放大，配体姿态为示意。",
    body: `<div class="iso-stage" tabindex="0" role="group" aria-label="罗替高汀结合口袋：左右方向键切换受体，空格暂停">${A.svg}</div>`,
  })
  .replace('<span class="iso-plate-corner" data-corner="readout" data-readout>', '<span class="iso-plate-corner" data-corner="readout" data-readout-a>');
const plateB = k
  .plateHtml({
    fig: "图 2",
    title: "激活之后 · 受体—G 蛋白循环",
    hint: "与图 1 同步",
    readout: "",
    keys: [
      { mark: "raised", label: "左右两块平板＝细胞膜；中间立柱＝受体；TM6 下段会向外摆开" },
      { mark: "lit", label: "Gα（带 α5 螺旋）＋Gβγ（螺旋桨）＝G 蛋白；亮色药片＝GTP，灰色＝GDP" },
      { mark: "edge", label: "右侧悬挂的方盒＝腺苷酸环化酶，落下的小粒＝cAMP；左侧圆筒＝GIRK 钾通道" },
    ],
    caption: "G 蛋白按比例缩小绘制。D1/D5 偶联 Gαs/olf：cAMP 产量上升；D2/D3/D4 偶联 Gαi/o：腺苷酸环化酶被抑制，Gβγ 打开 GIRK 钾通道。D4、D5 上罗替高汀为部分激动（约 62–64%），TM6 摆幅和效应按比例减小。",
    body: `<div class="iso-stage" tabindex="0" role="group" aria-label="受体与 G 蛋白循环">${B.svg}</div>`,
  })
  .replace('<span class="iso-plate-corner" data-corner="readout" data-readout>', '<span class="iso-plate-corner" data-corner="readout" data-readout-b>');

const KI_ROWS = RECEPTORS.map((r) => `<tr><td>${r.id}</td><td>${r.g}</td><td>${r.kiText}</td><td>${r.pec50}</td><td>${r.emax === 1 ? "完全激动" : `部分激动（${Math.round(r.emax * 100)}%）`}</td></tr>`).join("");

const doc = `
<section class="rt-doc">
<h2>1. 罗替高汀是什么分子</h2>
<p>罗替高汀是非麦角类多巴胺受体激动剂，化学名为 (S)-6-[丙基[2-(2-噻吩基)乙基]氨基]-5,6,7,8-四氢-1-萘酚，分子式 C₁₉H₂₅NOS。它可以看成把多巴胺“折叠固定”后的样子，由四部分组成：</p>
<ul>
<li><b>四氢萘骨架上的一个酚羟基（–OH）</b>：相当于多巴胺儿茶酚上的一个羟基；</li>
<li><b>一个叔胺氮</b>：在体内 pH 下带正电（N⁺），相当于多巴胺的氨基；</li>
<li><b>氮上的丙基</b>：一个小的疏水“尾巴”；</li>
<li><b>氮上的 2-噻吩乙基</b>：一个较长的芳香“手臂”。</li>
</ul>
<p>前两部分构成和多巴胺相同的“药效团”，所以五种受体都能识别它；后两部分伸向口袋上方，决定它对不同受体的亲和力差异。国内有两种剂型：<b>透皮贴剂</b>（原研优普洛，每日一贴），以及绿叶制药 2024 年 6 月获批的<b>注射用罗替高汀微球</b>（金悠平，每周一次），两者都是为了让血药浓度更平稳，实现“持续多巴胺能刺激”。</p>

<h2>2. 它如何激动五种受体</h2>
<p>2023 年 Xu 等在 <i>Cell Research</i> 发表了 D1–D5 五种受体分别与罗替高汀、G 蛋白结合的冷冻电镜结构（PDB：8IRR、8IRS、8IRT、8IRU、8IRV）。这是目前从原子层面回答这个问题最直接的证据：罗替高汀在五种受体里结合的位置和方式基本相同。</p>
<h3>第一步：进入口袋，形成四类接触（图 1）</h3>
<ul>
<li><b>盐桥</b>：带正电的 N⁺ 与 TM3 上的天冬氨酸 <code>D3.32</code> 的羧基负电荷相吸。这是所有胺类递质受体的“锚点”，突变成丙氨酸后罗替高汀的效力明显下降。</li>
<li><b>氢键</b>：酚羟基与 TM5 上的丝氨酸（<code>S5.42</code>、<code>S5.46</code>）形成氢键，对应多巴胺儿茶酚羟基的结合位置。</li>
<li><b>芳香/疏水堆积</b>：四氢萘环夹在 TM6 的苯丙氨酸 <code>F6.51</code> 等芳香残基之间；丙基落在 <code>T7.39</code> 与 <code>F6.51</code> 之间的疏水小口袋里。</li>
<li><b>延伸口袋</b>：噻吩乙基向上伸入由 <code>V2.61</code>、<code>F3.28</code>、<code>T7.39</code>、<code>Y7.43</code> 与胞外环围成的延伸（次级）口袋。五种受体的正构口袋几乎一样，这一区域差异最大，所以亲和力的差别主要出在这里。</li>
</ul>
<h3>第二步：口袋底部的“开关”被拨动（图 1）</h3>
<p>配体压在 TM6 的色氨酸 <code>W6.48</code>（“拨动开关”）上方，使它的侧链转动，带动 TM6 在脯氨酸 P6.50 处弯折。这一变化经过 PIF、NPxxY 等保守结构单元传到胞内一侧。</p>
<h3>第三步：TM6 胞内端外摆，G 蛋白进入（图 2）</h3>
<p>TM6 下段向外摆开，TM7 向内移，胞内侧打开一个空腔。G 蛋白 α 亚基末端的 α5 螺旋插进去，受体就像“换挡器”一样把 Gα 里的 GDP 挤出，换上 GTP。Gα·GTP 随后与 Gβγ 分开，各自去作用下游。</p>
<h3>第四步：两类受体，两种下游（图 2）</h3>
<ul>
<li><b>D1、D5 → Gαs/olf</b>：激活腺苷酸环化酶，cAMP 增多，进而激活 PKA、磷酸化 DARPP-32。结构上，D1/D5 的 TM5 胞内端更长，适合与 Gs 结合。</li>
<li><b>D2、D3、D4 → Gαi/o</b>：抑制腺苷酸环化酶，cAMP 减少；释放出的 Gβγ 打开 GIRK 钾通道并抑制钙通道，使神经元超极化。</li>
</ul>
<h3>五种受体上的数据</h3>
<div class="wrap"><table><thead><tr><th>受体</th><th>G 蛋白</th><th>结合亲和力 Ki（nM）</th><th>功能效力 pEC50</th><th>内在活性</th></tr></thead><tbody>${KI_ROWS}</tbody></table></div>
<p><small>Ki：Scheller 等 2009（Naunyn-Schmiedeberg's Arch Pharmacol），D3 0.71、D5 5.4、D2 13.5、D1 83 nM，D4 因变体不同为 3.9–15 nM；Ki 越小结合越牢。pEC50 与内在活性：Wood 等 2015（Br J Pharmacol），D1–D3 为完全激动，D4、D5 为部分激动（相对多巴胺约 62%、64%）。结合实验和功能实验所用细胞与条件不同，两组数字不能直接换算，例如 D1 的 Ki 最大，功能实验中的效力却很高。D5 的胞外口袋带更多负电荷，对带正电的罗替高汀亲和力约为 D1 的 10 倍（Xu 等 2023 的结构分析）。</small></p>
<p><small>罗替高汀还作用于部分非多巴胺受体（文献报道有 5-HT1A 激动和 α2B 肾上腺素受体拮抗），本页未画出。</small></p>

<h2>3. 分子层面能画成动画吗？这两张图怎么看</h2>
<p>能，但要说明两点：一是真实的分子运动发生在纳秒到毫秒尺度，而且是热运动驱动的随机过程；动画把它放慢并排成一条固定的时间线，便于理解先后关系。二是图 1 的原子按真实键长和环结构搭建，但罗替高汀在口袋里的姿态、螺旋的粗细和间距是示意，不是直接从 PDB 文件读出的坐标。</p>
<div class="wrap"><table><thead><tr><th>时间（12 秒一轮）</th><th>图 1：结合口袋</th><th>图 2：受体与 G 蛋白</th></tr></thead><tbody>
<tr><td>0–1.6 s</td><td>罗替高汀从横梁下降进入口袋</td><td>药物从上方滴管落入受体</td></tr>
<tr><td>1.6–2.4 s</td><td>出现盐桥、氢键（虚线）和芳香/疏水接触（点线）</td><td>—</td></tr>
<tr><td>1.9–3.4 s</td><td>底部 W6.48 侧链转动并变亮（激活开关）</td><td>TM6 下段向外摆开</td></tr>
<tr><td>3.3–4.4 s</td><td>—</td><td>G 蛋白被升起，Gα 的 α5 螺旋插入空腔</td></tr>
<tr><td>4.4–6.0 s</td><td>—</td><td>Gα 的螺旋结构域张开，灰色 GDP 弹出，亮色 GTP 从供料器装入</td></tr>
<tr><td>6.0–9.8 s</td><td>—</td><td>Gα 去腺苷酸环化酶，Gβγ 去 GIRK：选 D1/D5 时 cAMP 小粒加快落下；选 D2/D3/D4 时 cAMP 停止、GIRK 闸门打开、K⁺ 流出</td></tr>
<tr><td>9.4–11.6 s</td><td>罗替高汀离开，开关复位</td><td>GTP 水解成 GDP，Gα 回到 Gβγ，TM6 回位</td></tr>
</tbody></table></div>
<p><b>怎么用：</b>点 D1–D5 切换受体。图 1 前角刻度盘的指针指向该受体的 Ki，图 2 的 G 蛋白会换成 Gαs 或 Gαi，下游效应随之改变。D4、D5 上 TM6 摆幅和效应会按部分激动的比例减小。</p>
<p><small>本页为科普示意，不构成用药建议。</small></p>
</section>`;

const page = k
  .pageHtml({
    title: "罗替高汀如何激动 D1–D5",
    theme,
    body: `<div class="rt-wrap">${plateA}<div class="rt-picks" role="group" aria-label="选择受体">${picks}</div>${plateB}</div>${doc}`,
    script: kitScript() + latheScript() + live,
    width: 720,
  })
  .replace('<html lang="en">', '<html lang="zh-CN">')
  .replace("</head>", CSS + "</head>");
const name = theme === "light" ? "rotigotine-light.html" : "rotigotine.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
