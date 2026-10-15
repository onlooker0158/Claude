import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";
import { RECEPTORS, DRUGS, activation, receptorLine, drugLine } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 640;
const HEIGHT = 400;

// ---- world -------------------------------------------------------------
const PLATE = { x: -246, y: -78, w: 470, d: 150, r: 10 };
const PLATE_H = 12;
const FOOT_H = 5;
const TRAY_H = 6;
const TRAYS = [
  { x: -232, y: -58, w: 152, d: 114, r: 6 },
  { x: -64, y: -58, w: 274, d: 114, r: 6 },
];
const XS = { D1: -196, D5: -118, D2: -28, D3: 56, D4: 140 };
const LOCK_Y = 6;
const LOCK_R = 15;
const LOCK_TOP = 40;
const PLUG_R = 9;
const PLUG_TOP = LOCK_TOP + 0.8;
const GAUGE_DX = 30;
const GAUGE_Y = -22;
const GAUGE_TOP = 118;
const BASAL = 64;
const CAMP_UP = 38;
const CAMP_DOWN = 34;
const FRONT_DX = 24;
const FRONT_Y = 30;
const BEAM_Z = 146;
const KEY_OUT = 54; // blade bottom when withdrawn
const KEY_DEEP = 14; // how far below the plug face a level-4 key sinks
const BLADE = 24;
const TURN_MAX = (80 * Math.PI) / 180;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners({ x: -246, y: 2, w: 470, d: 10, r: 0 }, BEAM_Z, BEAM_Z + 9)],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 62 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));

// rotated rectangle on the floor (for the key blade and keyway)
function slot(cx, cy, hw, hd, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]);
}

// ---- static parts ------------------------------------------------------
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge
  const strip = { x: -226, y: PLATE.y + PLATE.d - 13, w: 340, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }));
  // maker's plate at the front right
  const tag = { x: 130, y: PLATE.y + PLATE.d - 17, w: 70, d: 10, r: 1.5 };
  out.push(S(k.slabOf(tag, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(tag, 1.4), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([tag.x + 5, tag.y + 6.6], 0.8, P, "x"), "DOPAMINE RECEPTOR BENCH", { size: 2.9, tone: "lo" }));
  out.push(D([at([tag.x + 2.4, tag.y + 5, 0.8]), at([tag.x + tag.w - 2.4, tag.y + 5, 0.8])], { size: 0.4 }));
  return out.join("");
}

function trays() {
  return TRAYS.map((tray, index) => {
    const out = [];
    out.push(S(k.slabOf(tray, 0, TRAY_H, P, 6, 0.8), { tone: index === 0 ? "mid" : "mid", inner: L(k.sideSeam(tray, 2.4, P, 6), { tone: "faint" }) }));
    out.push(L(k.planOutline(k.insetPlan(tray, 3.5), TRAY_H, P, 6), { tone: "faint" }));
    const screws = k.corners(tray, 7);
    out.push(D(screws.map(([x, y]) => at([x, y, TRAY_H])), { size: 0.5 }));
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, TRAY_H, P, 14)).join(""), { tone: "lo" }));
    // family mark: one notch for D1-like, two for D2-like, cut into the tray's front-left corner
    for (let n = 0; n <= index; n++) {
      const notch = { x: tray.x + 10 + n * 6, y: tray.y + tray.d - 10, w: 3, d: 6, r: 1 };
      out.push(L(k.planOutline(notch, TRAY_H, P, 3), { tone: "lo" }));
    }
    return out.join("");
  });
}

function labelPlate(id, x) {
  const plan = { x: x - 32, y: FRONT_Y + 3, w: 22, d: 13, r: 1.5 };
  return [
    S(k.slabOf(plan, TRAY_H, 0.8, P, 4), { tone: "lo", crease: "none" }),
    L(k.planOutline(k.insetPlan(plan, 1.3), TRAY_H + 0.8, P, 4), { tone: "faint" }),
    k.faceTextSvg(k.topMatrix([x - 21, FRONT_Y + 12.4], TRAY_H + 0.8, P, "x"), id, { size: 7.4, tone: "hi", anchor: "middle" }),
  ].join("");
}

function lockBody(x) {
  const y = LOCK_Y;
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - LOCK_R, y: y - LOCK_R, w: LOCK_R * 2, d: LOCK_R * 2, r: LOCK_R }, TRAY_H, 2, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.cylinder(x, y, LOCK_R + 2.5, TRAY_H, 3, P, 48, 0.5), { tone: "mid" }));
  out.push(D(Array.from({ length: 6 }, (_, i) => at([x + Math.cos((i / 6) * Math.PI * 2 + 0.3) * (LOCK_R + 1.2), y + Math.sin((i / 6) * Math.PI * 2 + 0.3) * (LOCK_R + 1.2), TRAY_H + 3])).filter((_, i) => true), { size: 0.4 }));
  out.push(
    S(k.cylinder(x, y, LOCK_R, TRAY_H + 3, LOCK_TOP - TRAY_H - 3, P, 56, 0.6), {
      tone: "hi",
      crease: "lo",
      inner: L([16, 22, 28].map((z) => k.sideArc(x, y, LOCK_R, z, P, 40)).join(""), { tone: "faint" }),
    }),
  );
  out.push(L(k.knurl(x, y, LOCK_R, LOCK_TOP - 6, LOCK_TOP - 0.6, 48, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, LOCK_R, LOCK_TOP - 6, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, LOCK_R - 2, LOCK_TOP, P, 56), { tone: "lo" }));
  // pin chambers across the top: five tumbler holes in a row behind the plug
  const pins = Array.from({ length: 5 }, (_, i) => [x - 6 + i * 3, y - PLUG_R - 2.6]);
  out.push(L(pins.map(([px, py]) => k.ring(px, py, 0.9, LOCK_TOP, P, 10)).join(""), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, PLUG_R, LOCK_TOP, 0.8, P, 40), { tone: "mid", crease: "lo" }));
  return out.join("");
}

function gauge(x, family) {
  const gx = x + GAUGE_DX;
  const out = [];
  const foot = { x: gx - 9, y: GAUGE_Y - 7, w: 18, d: 14, r: 2 };
  out.push(S(k.slabOf(foot, TRAY_H, 6, P, 3, 0.5), { tone: "mid" }));
  out.push(D(k.corners(foot, 2.6).map(([px, py]) => at([px, py, TRAY_H + 6])), { size: 0.4 }));
  const post = { x: gx - 4, y: GAUGE_Y - 3, w: 8, d: 6, r: 1 };
  out.push(S(k.slabOf(post, TRAY_H + 6, GAUGE_TOP - TRAY_H - 6, P, 3, 0.4), { tone: "mid", crease: "faint" }));
  // scale ticks on the post's +y face, rooted on its left edge
  const face = post.y + post.d;
  const minor = [], major = [];
  for (let z = BASAL - CAMP_DOWN; z <= BASAL + CAMP_UP + 0.01; z += 4) {
    const big = Math.round(z - BASAL) % 16 === 0;
    (big ? major : minor).push(k.segment([post.x, face, z], [post.x + (big ? 4 : 2.4), face, z], P));
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(L(k.sideSeam(post, BASAL, P, 3), { tone: "hi" }));
  // arrow of the family's direction on the cap: up for D1-like, down for D2-like (engraved chevron)
  const cap = { x: gx - 6, y: GAUGE_Y - 5, w: 12, d: 10, r: 1.6 };
  out.push(S(k.slabOf(cap, GAUGE_TOP, 4, P, 3, 0.5), { tone: "mid" }));
  const cz = GAUGE_TOP + 4;
  const chevron = family === 1 ? [[gx - 3, GAUGE_Y + 2], [gx, GAUGE_Y - 2], [gx + 3, GAUGE_Y + 2]] : [[gx - 3, GAUGE_Y - 2], [gx, GAUGE_Y + 2], [gx + 3, GAUGE_Y - 2]];
  out.push(L(k.onTop(chevron, cz, P), { tone: "lo", free: true }));
  return out.join("");
}

function slider(x) {
  const gx = x + GAUGE_DX;
  const plan = { x: gx - 5.6, y: GAUGE_Y - 4.6, w: 11.2, d: 9.2, r: 1.4 };
  return [
    S(k.slabOf(plan, -4, 8, P, 3, 0.5), { tone: "hi", lit: true }),
    D([at([plan.x + plan.w - 1.6, plan.y + plan.d, 2.4])], { size: 0.4 }),
  ].join("");
}

function frontBase(x, family) {
  const fx = x + FRONT_DX;
  const body = { x: fx - 7, y: FRONT_Y - 6, w: 14, d: 12, r: 2 };
  const out = [S(k.slabOf(body, TRAY_H, 10, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(body, TRAY_H + 4, P, 3), { tone: "faint" }) })];
  out.push(D(k.corners(body, 2.2).map(([px, py]) => at([px, py, TRAY_H + 10])), { size: 0.4 }));
  if (family === 1) {
    out.push(S(k.cylinder(fx, FRONT_Y, 3.6, TRAY_H + 10, 4, P, 24), { tone: "mid" }));
    out.push(L(k.ring(fx, FRONT_Y, 2.3, TRAY_H + 14, P, 16), { tone: "faint" }));
  } else {
    out.push(S(k.cylinder(fx, FRONT_Y, 1.6, TRAY_H + 10, 5, P, 16), { tone: "mid", crease: "none" }));
  }
  return out.join("");
}

// ---- live part builders (also shipped to the page) ---------------------
const build = {
  plugTop(x, angle) {
    const pts = slot(x, LOCK_Y, 1.4, 5.2, angle);
    return k.lineSvg(k.onTop(pts, PLUG_TOP, P, true), { tone: "lo" }) + k.lineSvg(k.ring(x, LOCK_Y, PLUG_R - 1.6, PLUG_TOP, P, 32), { tone: "faint" });
  },
  key(x, bottom, angle, engaged) {
    const out = [];
    const top = bottom + BLADE;
    const low = Math.max(bottom, PLUG_TOP);
    const blade = slot(x, LOCK_Y, 1.2, 4.6, angle);
    const style = engaged ? { tone: "hi", lit: true } : { tone: "hi" };
    if (top - low > 0.2) out.push(k.solidSvg(k.extrude(blade, low, top - low, P), { ...style, crease: "lo" }));
    const shoulder = slot(x, LOCK_Y, 2.2, 6.4, angle);
    out.push(k.solidSvg(k.extrude(shoulder, top, 3, P), { ...style, crease: "lo" }));
    out.push(k.solidSvg(k.cylinder(x, LOCK_Y, 6.6, top + 3, 2.6, P, 32, 0.4), { ...style, crease: "lo" }));
    out.push(k.lineSvg(k.ring(x, LOCK_Y, 2.2, top + 5.6, P, 16), { tone: "lo" }));
    const c = Math.cos(angle), s = Math.sin(angle);
    out.push(k.lineSvg(k.lineOnTop([x - s * 3.4, LOCK_Y + c * 3.4], [x - s * 5.6, LOCK_Y + c * 5.6], top + 5.6, P), { tone: engaged ? "lit" : "mid", free: true }));
    out.push(k.solidSvg(k.cylinder(x, LOCK_Y, 1.5, top + 5.6, BEAM_Z - 6 - top - 5.6, P, 16), { tone: "mid", crease: "none" }));
    return out.join("");
  },
  front(x, family, a) {
    const fx = x + FRONT_DX;
    if (family === 1) {
      const z0 = TRAY_H + 14;
      const h = 3 + 16 * a;
      return (
        k.solidSvg(k.cylinder(fx, FRONT_Y, 1.8, z0, h, P, 16), { tone: "hi", crease: "none", lit: a > 0.02 }) +
        k.solidSvg(k.cylinder(fx, FRONT_Y, 3, z0 + h, 1.6, P, 20), { tone: "hi", lit: a > 0.02 })
      );
    }
    const z0 = TRAY_H + 15;
    const turn = a * Math.PI * 1.5;
    const spokes = [0, 1, 2].map((i) => {
      const t = turn + (i * Math.PI * 2) / 3;
      return k.lineOnTop([fx, FRONT_Y], [fx + Math.cos(t) * 6.4, FRONT_Y + Math.sin(t) * 6.4], z0 + 1.2, P);
    });
    return (
      k.solidSvg(k.cylinder(fx, FRONT_Y, 7.2, z0, 1.2, P, 40), { tone: "hi", crease: "lo", lit: a > 0.02 }) +
      k.lineSvg(k.ring(fx, FRONT_Y, 6.4, z0 + 1.2, P, 40), { tone: "lo" }) +
      k.lineSvg(spokes.join(""), { tone: a > 0.02 ? "lit" : "mid" }) +
      k.solidSvg(k.cylinder(fx, FRONT_Y, 1.6, z0 + 1.2, 1.4, P, 14), { tone: "mid" }) +
      k.lineSvg(k.ring(fx + Math.cos(turn) * 5, FRONT_Y + Math.sin(turn) * 5, 0.8, z0 + 1.2, P, 10), { tone: "lo" })
    );
  },
};

function gantry() {
  const out = [];
  const posts = [-238, 216];
  for (const x of posts) {
    out.push(S(k.cylinder(x, 7, 7, 0, 3, P, 28), { tone: "mid" }));
    out.push(S(k.cylinder(x, 7, 4.2, 3, BEAM_Z - 3, P, 28), { tone: "mid", crease: "none", inner: L([40, 80, 120].map((z) => k.sideArc(x, 7, 4.2, z, P, 16)).join(""), { tone: "faint" }) }));
  }
  return out;
}

function beam() {
  const plan = { x: -246, y: 2, w: 470, d: 10, r: 1.5 };
  const out = [S(k.slabOf(plan, BEAM_Z, 8, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, BEAM_Z + 3, P, 3), { tone: "faint" }) })];
  out.push(L(k.lineOnTop([plan.x, 7], [plan.x + plan.w, 7], BEAM_Z + 8, P), { tone: "faint" }));
  for (const id of Object.keys(XS)) {
    const x = XS[id];
    const block = { x: x - 7, y: 0, w: 14, d: 14, r: 2 };
    out.push(S(k.slabOf(block, BEAM_Z - 6, 16, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x - 4, 12.5, BEAM_Z + 10]), at([x + 4, 12.5, BEAM_Z + 10])], { size: 0.4 }));
    out.push(L(k.ring(x, 7, 2, BEAM_Z + 10, P, 14), { tone: "lo" }));
  }
  for (const x of [-238, 216]) out.push(S(k.cylinder(x, 7, 5, BEAM_Z + 8, 2, P, 24), { tone: "mid" }));
  return out.join("");
}

// ---- assemble in depth order -----------------------------------------
const items = [];
const put = (key, svg) => items.push({ key, svg });
for (const r of RECEPTORS) {
  const x = XS[r.id];
  put(depth(x + GAUGE_DX, GAUGE_Y), gauge(x, r.family) + `<g data-part="slider" data-id="${r.id}" transform="${k.translateAlong(P, [0, 0, BASAL])}">${slider(x)}</g>`);
  put(depth(x, LOCK_Y), lockBody(x) + `<g data-part="plug" data-id="${r.id}">${build.plugTop(x, 0)}</g><g data-part="key" data-id="${r.id}">${build.key(x, KEY_OUT, 0, false)}</g>`);
  put(depth(x + FRONT_DX, FRONT_Y), frontBase(x, r.family) + `<g data-part="front" data-id="${r.id}">${build.front(x, r.family, 0)}</g>`);
  put(depth(x - 21, FRONT_Y + 9) - 0.5, labelPlate(r.id, x));
}
items.sort((a, b) => a.key - b.key);

const [postBack, postBackTop, postFront, postFrontTop] = gantry();
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "多巴胺受体试验台：底板上两块托盘，左边托盘装 D1、D5 两个 D1 类受体锁芯，右边托盘装 D2、D3、D4 三个 D2 类受体锁芯。上方横梁挂着五把钥匙，代表所选药物；钥匙插入越深代表亲和力越强，转得越多代表激活越充分。每个锁芯后面的标尺滑块显示 cAMP：D1 类向上，D2 类向下。D1 类锁芯前方的推杆代表 PKA/DARPP-32 被推动，D2 类锁芯前方的手轮代表 GIRK 钾通道被打开。",
  body: [
    plate(),
    postBack + postBackTop,
    ...trays(),
    ...items.map((item) => item.svg),
    `<g data-part="beam">${beam()}</g>`,
    postFront + postFrontTop,
  ],
});

// ---- page --------------------------------------------------------------
const picks = DRUGS.map((d, i) => `<button type="button" class="dr-pick" data-drug="${i}" aria-pressed="${i === 0}">${d.name}</button>`).join("");

const live = `
const P = ${JSON.stringify(P)};
const RECEPTORS = ${JSON.stringify(RECEPTORS)};
const DRUGS = ${JSON.stringify(DRUGS)};
const XS = ${JSON.stringify(XS)};
const LOCK_Y = ${LOCK_Y}, PLUG_R = ${PLUG_R}, PLUG_TOP = ${PLUG_TOP}, BLADE = ${BLADE}, BEAM_Z = ${BEAM_Z}, FRONT_DX = ${FRONT_DX}, FRONT_Y = ${FRONT_Y}, TRAY_H = ${TRAY_H};
const KEY_OUT = ${KEY_OUT}, KEY_DEEP = ${KEY_DEEP}, TURN_MAX = ${TURN_MAX}, BASAL = ${BASAL}, CAMP_UP = ${CAMP_UP}, CAMP_DOWN = ${CAMP_DOWN};
const slot = ${slot.toString()};
const activation = ${activation.toString()};
const receptorLine = ${receptorLine.toString()};
const drugLine = ${drugLine.toString()};
const k = { solidSvg, lineSvg, extrude, cylinder, ring, onTop, lineOnTop };
const build = {
  plugTop: ${build.plugTop.toString().replace(/^plugTop/, "function")},
  key: ${build.key.toString().replace(/^key/, "function")},
  front: ${build.front.toString().replace(/^front/, "function")},
};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const note = document.querySelector("[data-note]");
const picks = [...document.querySelectorAll(".dr-pick")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const parts = Object.fromEntries(RECEPTORS.map((r) => [r.id, {
  r, x: XS[r.id],
  plug: svg.querySelector('[data-part="plug"][data-id="' + r.id + '"]'),
  key: svg.querySelector('[data-part="key"][data-id="' + r.id + '"]'),
  slider: svg.querySelector('[data-part="slider"][data-id="' + r.id + '"]'),
  front: svg.querySelector('[data-part="front"][data-id="' + r.id + '"]'),
  ins: 0, turn: 0, camp: 0, drawn: "",
}]));
let drug = 0, changedAt = -10, clock = 0, last = 0, frame = 0, visible = false, touring = true, idle = 0, focus = null;
const follow = (v, t, dt, tau, calm) => calm ? t : v + (t - v) * (1 - Math.exp(-dt / tau));
const near = (a, b) => Math.abs(a - b) < 0.0015;
function targets(p) {
  const d = DRUGS[drug];
  const level = d.level[p.r.id];
  const age = clock - changedAt;
  const calm = still.matches;
  const deep = level ? (KEY_OUT - PLUG_TOP + KEY_DEEP * level / 4) / (KEY_OUT - PLUG_TOP + KEY_DEEP) : 0;
  if (!calm && age < 0.75) return { ins: 0, turn: 0 };
  if (!calm && age < 1.6) return { ins: deep, turn: 0 };
  return { ins: deep, turn: activation(d, p.r.id) };
}
function draw(p) {
  const bottom = KEY_OUT - p.ins * (KEY_OUT - PLUG_TOP + KEY_DEEP);
  const angle = p.turn * TURN_MAX;
  const engaged = bottom < PLUG_TOP + 0.5;
  const sign = (bottom.toFixed(2)) + "|" + angle.toFixed(4) + "|" + p.camp.toFixed(4) + "|" + engaged;
  if (sign === p.drawn) return;
  p.drawn = sign;
  p.key.innerHTML = build.key(p.x, bottom, angle, engaged);
  p.plug.innerHTML = build.plugTop(p.x, angle);
  p.front.innerHTML = build.front(p.x, p.r.family, p.camp);
  const z = p.r.family === 1 ? BASAL + CAMP_UP * p.camp : BASAL - CAMP_DOWN * p.camp;
  p.slider.setAttribute("transform", translateAlong(P, [0, 0, z]));
}
function say() {
  const d = DRUGS[drug];
  const text = focus ? receptorLine(d, parts[focus].r) : drugLine(d);
  if (readout.textContent !== text) readout.textContent = text;
  if (note.textContent !== d.note) note.textContent = d.note;
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  const calm = still.matches;
  if (touring && !calm && clock - changedAt > 6.2) choose((drug + 1) % DRUGS.length, true);
  let moving = false;
  for (const p of Object.values(parts)) {
    const t = targets(p);
    p.ins = follow(p.ins, t.ins, dt, 0.24, calm);
    p.turn = follow(p.turn, t.turn, dt, 0.3, calm);
    p.camp = follow(p.camp, p.turn, dt, 0.45, calm);
    for (const name of ["ins", "turn", "camp"]) if (near(p[name], name === "camp" ? p.turn : t[name])) p[name] = name === "camp" ? p.turn : t[name]; else moving = true;
    draw(p);
  }
  say();
  const pending = !calm && clock - changedAt < 1.7;
  frame = visible && (touring || moving || pending) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function choose(index, byTour) {
  drug = index;
  changedAt = clock;
  picks.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
  if (!byTour) {
    touring = false;
    clearTimeout(idle);
    idle = setTimeout(() => { touring = !still.matches; run(); }, 14000);
  }
  run();
}
picks.forEach((b, i) => b.addEventListener("click", () => choose(i, false)));
stage.addEventListener("keydown", (e) => {
  let to = null;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (drug + 1) % DRUGS.length;
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (drug + DRUGS.length - 1) % DRUGS.length;
  if (e.key === "Home") to = 0;
  if (e.key === "End") to = DRUGS.length - 1;
  if (/^[1-5]$/.test(e.key)) { focus = RECEPTORS[+e.key - 1].id; say(); e.preventDefault(); return; }
  if (e.key === "Escape") { focus = null; say(); return; }
  if (to === null) return;
  e.preventDefault();
  choose(to, false);
});
const xsScreen = () => {
  const box = svg.getBoundingClientRect();
  return RECEPTORS.map((r) => {
    const [sx] = iso([XS[r.id], LOCK_Y, 40], P);
    return { id: r.id, px: box.left + (sx / ${WIDTH}) * box.width };
  });
};
stage.addEventListener("pointermove", (e) => {
  const list = xsScreen();
  const best = list.reduce((a, b) => (Math.abs(b.px - e.clientX) < Math.abs(a.px - e.clientX) ? b : a));
  const box = svg.getBoundingClientRect();
  const next = Math.abs(best.px - e.clientX) < box.width * 0.075 ? best.id : null;
  if (next !== focus) { focus = next; say(); }
});
stage.addEventListener("pointerleave", () => { focus = null; say(); });
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
for (const p of Object.values(parts)) { p.ins = 0; p.turn = 0; }
changedAt = 0;
say();
`;

const EXTRA_CSS = `
<style>
.dr-picks{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:14px 0 0}
.dr-pick{font:inherit;font-size:13px;padding:5px 12px;border-radius:999px;border:1px solid var(--anatomy-mid, #444);background:transparent;color:var(--anatomy-text);cursor:pointer}
.dr-pick[aria-pressed="true"]{background:var(--anatomy-strong);color:var(--anatomy-card);border-color:var(--anatomy-strong)}
.dr-pick:focus-visible{outline:2px solid var(--anatomy-strong);outline-offset:2px}
.dr-note{text-align:center;margin:10px 0 0;color:var(--anatomy-text);font-size:13px;min-height:1.6em}
.iso-plate-corner[data-corner="title"]{text-transform:none;letter-spacing:.04em}
.iso-plate-corner[data-corner="hint"]{text-transform:none;letter-spacing:.04em}
.dr-doc{margin-top:40px;color:var(--anatomy-text)}
.dr-doc h2{color:var(--anatomy-strong);font-size:17px;margin:34px 0 10px}
.dr-doc h3{color:var(--anatomy-strong);font-size:14.5px;margin:20px 0 6px}
.dr-doc p,.dr-doc li{font-size:14px;line-height:1.75}
.dr-doc table{border-collapse:collapse;width:100%;font-size:13px;margin:10px 0}
.dr-doc th,.dr-doc td{border-bottom:1px solid var(--anatomy-mid, #333);padding:7px 6px;text-align:left;vertical-align:top}
.dr-doc th{color:var(--anatomy-strong);font-weight:600}
.dr-doc .wrap{overflow-x:auto}
.dr-doc small{color:var(--anatomy-muted)}
.dr-doc a{color:var(--anatomy-strong)}
</style>`;

const LV = ["—", "弱", "中", "强", "很强"];
const tableRows = DRUGS.map((d) => `<tr><td>${d.name}</td>${RECEPTORS.map((r) => `<td>${LV[d.level[r.id]]}${d.eff[r.id] > 0 && d.eff[r.id] < 1 ? "（部分）" : ""}${d.id === "pir" && r.id === "D4" ? "拮抗" : ""}</td>`).join("")}</tr>`).join("");

const doc = `
<section class="dr-doc">
<h2>1. 多巴胺受体激动剂的主要作用机制</h2>
<p>帕金森病的核心病变是黑质致密部多巴胺能神经元进行性丢失，纹状体里的多巴胺随之减少；出现运动症状时，纹状体多巴胺通常已下降约 70%–80%。左旋多巴要先被残存的多巴胺能神经元摄取、经多巴脱羧酶转成多巴胺再释放，<b>多巴胺受体激动剂则绕开这一步</b>：它本身就像一把“钥匙”，直接结合并激活纹状体中型多棘神经元（MSN）上的突触后多巴胺受体，模拟多巴胺的作用，从而改善运动迟缓、僵直等症状。</p>
<p>它不依赖残存神经元合成和储存多巴胺，多数药物半衰期较长（或做成缓释片、透皮贴剂），对受体的刺激更平稳，所以在早期患者中可推迟使用左旋多巴、减少运动并发症；在中晚期可与左旋多巴合用，缩短“关”期。目前国内常用的都是<b>非麦角类</b>：普拉克索（普通片、缓释片）、罗匹尼罗（普通片、缓释片）、罗替高汀（透皮贴剂）、吡贝地尔（缓释片）。麦角类（如溴隐亭）因心脏瓣膜和肺纤维化风险，已很少用于帕金森病；阿扑吗啡皮下注射目前未在中国大陆上市用于帕金森病。</p>
<p><small>中国情况依据：《中国帕金森病治疗指南（第四版）》（中华医学会神经病学分会帕金森病及运动障碍学组，2020）推荐非麦角类激动剂用于早发型患者的初始治疗；在华上市剂型与受体选择性参考国内六种非麦角类激动剂快速卫生技术评估（2025）。</small></p>

<h2>2. D1–D5 五种受体各自如何被激动</h2>
<p>五种多巴胺受体都是 G 蛋白偶联受体，按偶联的 G 蛋白分成两类：</p>
<h3>D1 类：D1、D5（偶联 Gs/Golf，“踩油门”）</h3>
<ul>
<li>激动剂结合后，Gαs/olf 激活腺苷酸环化酶，<b>cAMP 升高</b>，激活蛋白激酶 A（PKA）。</li>
<li>PKA 磷酸化 DARPP-32 的 Thr34 位点，后者抑制蛋白磷酸酶-1，使 NMDA、AMPA 受体等的磷酸化保持在较高水平，神经元更容易兴奋。</li>
<li><b>D1</b> 主要分布在纹状体<b>直接通路</b> MSN（投射到苍白球内侧部/黑质网状部）上，兴奋直接通路，相当于“松开刹车、允许动作”。<b>D5</b> 信号与 D1 相同、对多巴胺亲和力更高，但主要分布在海马、丘脑等处，纹状体中较少。</li>
</ul>
<h3>D2 类：D2、D3、D4（偶联 Gi/o，“踩刹车”）</h3>
<ul>
<li>Gαi/o 抑制腺苷酸环化酶，<b>cAMP 下降</b>，PKA 活性减弱。</li>
<li>释放出的 Gβγ 亚基打开<b>GIRK 内向整流钾通道</b>（K⁺ 外流、细胞膜超极化），并抑制电压门控 Ca²⁺ 通道，神经元更难兴奋、递质释放减少。</li>
<li><b>D2</b> 是抗帕金森病作用最主要的靶点：位于<b>间接通路</b> MSN 上，激动后抑制间接通路，减少它对运动的“刹车”；D2 也作为突触前自身受体存在于多巴胺能末梢上。</li>
<li><b>D3</b> 集中在伏隔核等边缘系统和纹状体腹侧，普拉克索、罗匹尼罗、罗替高汀对它亲和力最高；一般认为它与情绪、动机有关，也和冲动控制障碍等不良反应有关。</li>
<li><b>D4</b> 主要在前额叶皮层，纹状体中极少，与运动症状关系不大。</li>
</ul>
<p>帕金森病缺多巴胺时，直接通路兴奋不足、间接通路过度活跃，丘脑—皮层的运动驱动被压低。激动剂通过激动 D1 增强直接通路、激动 D2 抑制间接通路（多数国内常用药主要靠后者），让两条通路重新平衡。</p>
<h3>各药相对亲和力（示意分级）</h3>
<div class="wrap"><table><thead><tr><th>药物</th>${RECEPTORS.map((r) => `<th>${r.id}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></div>
<p><small>分级综合体外受体结合与功能研究（Millan 等 2002，JPET；Scheller 等 2009，罗替高汀受体谱：D3 Ki≈0.71 nM、D5≈5.4、D2≈13.5、D1≈83 nM），只表示排序和量级。不同实验体系测得的 Ki 可差几十倍，不能当作精确数值。吡贝地尔另有 α2 肾上腺素受体拮抗作用，未在图中表示。</small></p>

<h2>3. 动画里每个部件代表什么</h2>
<div class="wrap"><table><thead><tr><th>动画里的部件</th><th>代表的药理学含义</th></tr></thead><tbody>
<tr><td>底板上的五个锁芯</td><td>五种受体。左边托盘（一道刻槽）是 D1 类：D1、D5；右边托盘（两道刻槽）是 D2 类：D2、D3、D4。</td></tr>
<tr><td>横梁上挂下的五把钥匙</td><td>所选药物的分子。切换药物时，钥匙先全部拔出，再按该药的结合情况插回去。</td></tr>
<tr><td>钥匙插入的深度</td><td>亲和力：插得越深，结合越强；悬在锁芯上方不进去，表示几乎不结合（例如普拉克索对 D1/D5）。</td></tr>
<tr><td>钥匙转动的角度</td><td>激活程度（亲和力 × 内在活性）。吡贝地尔在 D2/D3 上插得进去但转不满，表示部分激动。</td></tr>
<tr><td>锁芯后方标尺上的滑块</td><td>细胞内 cAMP 水平。中间的亮线是基础水平：D1 类锁芯转动后滑块上升（Gs→腺苷酸环化酶↑），D2 类锁芯转动后滑块下降（Gi/o→腺苷酸环化酶↓）。标尺顶盖上刻着向上或向下的箭头。</td></tr>
<tr><td>D1 类锁芯前方升起的推杆</td><td>PKA 被激活，进而磷酸化 DARPP-32，神经元兴奋性增加。</td></tr>
<tr><td>D2 类锁芯前方转开的手轮</td><td>Gβγ 打开 GIRK 钾通道（同时抑制 Ca²⁺ 通道），神经元超极化。</td></tr>
<tr><td>右下角读数</td><td>该药按亲和力从强到弱排列的受体；鼠标移到某个锁芯上（或按数字键 1–5），显示这个受体的信号通路和激活百分比。</td></tr>
</tbody></table></div>
<p><b>怎么看：</b>点上方的药物按钮，或在图上按 ← →。先看“多巴胺”作参照，五把钥匙都插入、都转满；再看普拉克索、罗匹尼罗：只有右边托盘的锁被转开，D1/D5 的钥匙悬在半空，说明它们几乎只走 D2 类通路；罗替高汀五把都能插入，最接近多巴胺；吡贝地尔在 D2/D3 上只转一半，D4 的钥匙不进去。</p>
<p><small>本页为科普示意，不构成用药建议。具体用药请遵医嘱。</small></p>
</section>`;

const body = k.plateHtml({
  fig: "图 1",
  title: "多巴胺受体激动剂 · D1–D5",
  hint: "点选药物 · 悬停锁芯看通路",
  readout: drugLine(DRUGS[0]),
  keys: [
    { mark: "lit", label: "钥匙＝药物：插入深度＝亲和力，转动角度＝激活程度" },
    { mark: "raised", label: "锁芯＝受体：左托盘 D1 类（D1、D5），右托盘 D2 类（D2、D3、D4）" },
    { mark: "edge", label: "滑块＝cAMP：D1 类向上、D2 类向下；推杆＝PKA，手轮＝GIRK 钾通道" },
  ],
  caption:
    "激动剂不需要残存的黑质神经元合成多巴胺，直接作用于纹状体神经元上的多巴胺受体。D1 类偶联 Gs/Golf，使 cAMP 升高、兴奋直接通路；D2 类偶联 Gi/o，使 cAMP 降低、打开 GIRK 钾通道、抑制间接通路。国内常用的非麦角类激动剂主要作用于 D2/D3。",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="多巴胺受体试验台：左右方向键切换药物，数字键 1 到 5 查看单个受体">${svg}</div><div class="dr-picks" role="group" aria-label="选择药物">${picks}</div><p class="dr-note" data-note>${DRUGS[0].note}</p>`,
});

const name = theme === "light" ? "dopamine-agonists-light.html" : "dopamine-agonists.html";
const html = k
  .pageHtml({ title: "多巴胺受体激动剂", theme, body: body + doc, script: kitScript() + live, width: 720 })
  .replace('<html lang="en">', '<html lang="zh-CN">')
  .replace("</head>", `${EXTRA_CSS}</head>`);
writeFileSync(join(HERE, name), html);
console.log("wrote", name);
