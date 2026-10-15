// 图 1：结合口袋的球棍模型（罗替高汀 + 关键残基侧链 + 七根跨膜螺旋）
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import { HELICES, HELIX_R, ATOMS, BONDS, LIG, RESIDUES, residue, add, sub, mul, len, unit } from "./pocket.mjs";

export const WIDTH = 640;
export const HEIGHT = 460;
export const SC = 10; // 每 Å 的世界单位
export const ZP = 140; // 口袋中心高度
const ROD_TOP = ZP + 10 * SC;
const BEAM_Z = 360;
export const LIFT = 115; // 未结合时配体抬高的距离
const BASE_R = 150;
const PLATE = { x: -BASE_R, y: -BASE_R, w: BASE_R * 2, d: BASE_R * 2, r: BASE_R };
const EL = 42;
const AZ = 45;

export const W = (p) => [p[0] * SC, p[1] * SC, ZP + p[2] * SC];
const HOOK0 = W(ATOMS.reduce((best, a) => (a.at[2] > best.at[2] ? a : best)).at);
const RADIUS = { C: 0.5, N: 0.58, O: 0.58, S: 0.74, CA: 0.5 };
const RES_SCALE = 0.62;
const STICK = 0.21;

export const P = k.fitProjection(
  [
    ...HELICES.flatMap((h) => [[h.at[0] * SC, h.at[1] * SC, ZP - 7.5 * SC], [h.at[0] * SC, h.at[1] * SC, ZP + 10 * SC + 6]]),
    [0, 0, ZP - 7.5 * SC],
    [HOOK0[0], HOOK0[1], BEAM_Z + 10],
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: AZ, elevation: EL },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const depth = (p) => k.depthOf(p, P);
const flatDepth = (x, y) => k.depthOf([x, y, 0], P);

const ball = (p, el, style, extra = "", scale = 1) => {
  const r = RADIUS[el] * SC * scale;
  const paths = G.sphereOf(p, r, P, { steps: 40 });
  const tint = el === "O" || el === "N" || el === "S" ? `<path class="mol-tint" data-el="${el}" d="${paths.fill}"/>` : "";
  return `<g${extra}>${S(paths, style)}${tint}</g>`;
};
const stick = (a, b, style, scale = 1) => {
  const d = sub(b, a);
  const F = G.frameAlong(a, d);
  return S(G.disc(0, len(d), STICK * SC * scale, F, P, { steps: 16 }), { crease: "none", ...style });
};

export function residueSvg(res, toggle) {
  const r = residue(res, toggle);
  const items = [];
  const pts = r.atoms.map((a) => W(a.at));
  r.bonds.forEach(([i, j]) => items.push({ key: depth(mul(add(pts[i], pts[j]), 0.5)) - 4, svg: stick(pts[i], pts[j], { tone: "mid" }, 0.6) }));
  r.atoms.forEach((a, i) => items.push({ key: depth(pts[i]), svg: ball(pts[i], a.el, { tone: "mid" }, "", a.el === "CA" ? 1 : RES_SCALE) }));
  return { items, r, pts };
}

function ligandItems() {
  const items = [];
  const pts = Object.fromEntries(ATOMS.map((a) => [a.n, W(a.at)]));
  BONDS.forEach(([a, b]) => items.push({ key: depth(mul(add(pts[a], pts[b]), 0.5)) - 4, svg: stick(pts[a], pts[b], { tone: "hi", lit: true }) }));
  ATOMS.forEach((a) => items.push({ key: depth(pts[a.n]), svg: ball(pts[a.n], a.el, { tone: "hi", lit: true }) }));
  return items.map((it) => ({ ...it, key: it.key + 30, lig: true }));
}

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -18, 14, P)}"/>`];
  const feet = Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2 + 0.26) * (BASE_R - 30), Math.sin((i / 6) * Math.PI * 2 + 0.26) * (BASE_R - 30)]);
  for (const [x, y] of feet.sort((a, b) => flatDepth(...a) - flatDepth(...b))) {
    out.push(S(k.cylinder(x, y, 9, -18, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -16.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.cylinder(0, 0, BASE_R, -14, 14, P, 160, 1.6), { tone: "mid", inner: L(k.sideArc(0, 0, BASE_R, -6, P, 120), { tone: "faint" }) }));
  out.push(L(k.ring(0, 0, BASE_R - 8, 0, P, 160), { tone: "lo" }));
  const screws = Array.from({ length: 12 }, (_, i) => [Math.cos((i / 12) * Math.PI * 2) * (BASE_R - 15), Math.sin((i / 12) * Math.PI * 2) * (BASE_R - 15)]);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(k.dotsSvg(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // degree ring around the bundle footprint
  const ticks = k.radialTicks(0, 0, BASE_R - 26, 72, 6, 0, [2, 4.4], P);
  out.push(L(ticks.minor, { tone: "faint" }), L(ticks.major, { tone: "lo" }));
  out.push(L(k.ring(0, 0, BASE_R - 26, 0, P, 160), { tone: "faint" }));
  return out.join("");
}

// Ki 刻度盘（对数），放在底板前角
export const DIAL = { x: -20, y: 142, r: 22, z: 0, h: 8 };
export const KI_RANGE = [0.1, 1000];
export const kiAngle = (ki) => {
  const t = (Math.log10(ki) - Math.log10(KI_RANGE[0])) / (Math.log10(KI_RANGE[1]) - Math.log10(KI_RANGE[0]));
  return (-120 + 240 * t) * (Math.PI / 180);
};
function dial() {
  const { x, y, r, z, h } = DIAL;
  const top = z + h;
  const out = [];
  out.push(S(k.cylinder(x, y, r + 3, z, 3, P, 64, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, r, z + 3, h - 3, P, 64, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, r, top - 4, top - 0.5, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, r - 2.4, top, P, 64), { tone: "lo" }));
  // log ticks: minor at 2..9 of each decade, major at each decade
  const minor = [], major = [];
  for (let e = -1; e <= 3; e++) {
    for (let m = 1; m <= 9; m++) {
      const v = m * 10 ** e;
      if (v < KI_RANGE[0] - 1e-9 || v > KI_RANGE[1] + 1e-9) continue;
      const a = kiAngle(v);
      const big = m === 1;
      const r0 = r - 3.2, r1 = r0 - (big ? 4.4 : 2.2);
      (big ? major : minor).push(k.lineOnTop([x + Math.sin(a) * r0, y - Math.cos(a) * r0], [x + Math.sin(a) * r1, y - Math.cos(a) * r1], top, P));
    }
  }
  out.push(L(k.onTop(Array.from({ length: 49 }, (_, i) => { const a = kiAngle(0.1 * 10 ** (i / 12)); return [x + Math.sin(a) * (r - 3.2), y - Math.cos(a) * (r - 3.2)]; }), top, P), { tone: "lo" }));
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 13], top, P, "x"), "Ki · nM", { size: 4.2, tone: "lo", anchor: "middle" }));
  out.push(L(k.ring(x, y, 2, top, P, 16), { tone: "mid" }));
  return out.join("");
}
export const needle = (ki) => {
  const { x, y, r, z, h } = DIAL;
  const a = kiAngle(ki);
  return k.lineOnTop([x - Math.sin(a) * 4, y + Math.cos(a) * 4], [x + Math.sin(a) * (r - 5), y - Math.cos(a) * (r - 5)], z + h + 0.2, P);
};

function rod(h) {
  const [x, y] = h.at.map((v) => v * SC);
  const r = HELIX_R * SC;
  const top = h.cut !== undefined ? ZP + h.cut * SC : ROD_TOP;
  const out = [];
  out.push(S(k.cylinder(x, y, r + 5, 0, 8, P, 40, 0.5), { tone: "mid" }));
  const bands = [];
  for (let z = 30; z < top - 6; z += 5.4 * SC) bands.push(k.sideArc(x, y, r, z, P, 40));
  out.push(S(k.cylinder(x, y, r, 8, top - 8, P, 48, h.cut !== undefined ? 0.8 : 0), { tone: "mid", crease: h.cut !== undefined ? "lo" : "faint", inner: L(bands.join(""), { tone: "faint" }) }));
  if (h.cut !== undefined) {
    out.push(L(k.ring(x, y, r - 3, top, P, 40), { tone: "faint" }));
    out.push(k.faceTextSvg(k.topMatrix([x, y + 4], top, P, "x"), h.id, { size: 5, tone: "mid", anchor: "middle" }));
  } else {
    out.push(S(k.cylinder(x, y, r + 3, top, 5, P, 40, 0.5), { tone: "mid" }));
    out.push(k.faceTextSvg(k.topMatrix([x, y + 4], top + 6, P, "x"), h.id, { size: 5, tone: "mid", anchor: "middle" }));
  }
  return out.join("");
}

const HOOK = W(ATOMS.reduce((best, a) => (a.at[2] > best.at[2] ? a : best)).at);
const POSTS = [[HOOK[0] - 98, HOOK[1] + 98], [HOOK[0] + 98, HOOK[1] - 98]];
function gantry() {
  const back = [], front = [];
  for (const [x, y] of POSTS) {
    const part = [S(k.cylinder(x, y, 8, 0, 4, P, 32), { tone: "mid" }), S(k.cylinder(x, y, 4.6, 4, BEAM_Z - 4, P, 28), { tone: "mid", crease: "none" })];
    (back).push(part.join(""));
  }
  return { back: back.join(""), front: front.join("") };
}
function beam() {
  const out = [];
  const [a, b] = POSTS;
  const F = G.frameAlong([a[0], a[1], BEAM_Z + 4], [1, -1, 0]);
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  out.push(S(G.prismOf(F, [[-5, -4], [5, -4], [5, 4], [-5, 4]], -6, length + 6, P), { tone: "mid" }));
  for (const [x, y] of [a, b]) out.push(S(k.cylinder(x, y, 6, BEAM_Z + 8, 2.4, P, 24), { tone: "mid" }));
  return out.join("");
}

export const TOP_ATOM = ATOMS.reduce((best, a) => (a.at[2] > best.at[2] ? a : best));
export const hangerSvg = (lift) => {
  const p = W(TOP_ATOM.at);
  const z0 = p[2] + RADIUS[TOP_ATOM.el] * SC * 0.6 + lift;
  // hanger hangs from the beam at the point above the atom: the beam runs along x = y, so offset the hook to it
  return k.solidSvg(k.cylinder(p[0], p[1], 1.1, z0, BEAM_Z - z0, P, 14), { tone: "mid", crease: "none" });
};

export function buildA() {
  const backIds = new Set(["TM3", "TM4", "TM5", "TM2", "TM6"]);
  const rods = HELICES.map((h) => ({ h, key: flatDepth(h.at[0] * SC, h.at[1] * SC), svg: rod(h) }));
  const back = rods.filter((r) => backIds.has(r.h.id)).sort((a, b) => a.key - b.key);
  const front = rods.filter((r) => !backIds.has(r.h.id)).sort((a, b) => a.key - b.key);

  const items = [];
  const res = RESIDUES.map((r) => {
    const built = residueSvg(r, 0);
    built.items.forEach((it) => items.push({ ...it, res: r.id }));
    return built;
  });
  items.push(...ligandItems());
  items.sort((a, b) => a.key - b.key);

  // W6.48 is rebuilt live as one group, so collect its items into one slot
  const trpIndex = items.findIndex((it) => it.res === "W6.48");
  const body = [];
  let trpPlaced = false;
  for (const it of items) {
    if (it.res === "W6.48") {
      if (!trpPlaced) body.push(`<g data-part="trp">${items.filter((x) => x.res === "W6.48").map((x) => x.svg).join("")}</g>`);
      trpPlaced = true;
      continue;
    }
    body.push(it.lig ? `<g data-lig>${it.svg}</g>` : it.svg);
  }

  // contacts: dashed for salt bridge and H-bonds, dotted for aromatic and van der Waals
  const lig = Object.fromEntries(ATOMS.map((a) => [a.n, W(a.at)]));
  const contacts = RESIDUES.filter((r) => r.bond !== "none").map((r, i) => {
    const built = res[RESIDUES.indexOf(r)];
    const from = r.target === "RA" || r.target === "Tc" ? W(LIG[r.target]) : lig[r.target];
    const toIndex = built.r.contact[0];
    const to = built.pts[toIndex];
    const fromR = r.target === "RA" || r.target === "Tc" ? 0 : RADIUS[ATOMS.find((a) => a.n === r.target).el] * SC * k.cameraOf(P).k;
    const toR = RADIUS[built.r.atoms[toIndex].el] * SC * RES_SCALE * k.cameraOf(P).k;
    const sa = at(from), sb = at(to);
    const dl = Math.hypot(sb[0] - sa[0], sb[1] - sa[1]) || 1;
    const ux = (sb[0] - sa[0]) / dl, uy = (sb[1] - sa[1]) / dl;
    const seg = `M${(sa[0] + ux * (fromR - 0.3)).toFixed(1)} ${(sa[1] + uy * (fromR - 0.3)).toFixed(1)}L${(sb[0] - ux * (toR - 0.3)).toFixed(1)} ${(sb[1] - uy * (toR - 0.3)).toFixed(1)}`;
    const strong = r.bond === "salt" || r.bond === "hbond";
    const dots = r.target === "RA" || r.target === "Tc" ? [at(from)] : [];
    return `<g class="mol-contact" data-bond="${r.bond}" data-res="${r.id}">${L(seg, { tone: strong ? "lit" : "mid", dashed: strong, dotted: !strong })}${dots.length ? k.dotsSvg(dots, { size: 0.9, tone: "mid" }) : ""}</g>`;
  });

  const g = gantry();
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    className: "rt-pocket",
    label:
      "罗替高汀与多巴胺受体结合口袋的球棍模型：七根代表跨膜螺旋 TM1–TM7 的立柱围成口袋，前方的 TM1 截短以便观察。罗替高汀悬在横梁下，下降进入口袋后：带正电的胺与 TM3 上的天冬氨酸 D3.32 形成盐桥，酚羟基与 TM5 上的丝氨酸 S5.42、S5.46 形成氢键，四氢萘环夹在 TM6 的苯丙氨酸 F6.51、F6.52 之间，噻吩乙基伸入 TM2、TM3、TM7 顶部的延伸口袋。随后 TM6 上的色氨酸 W6.48 转动，这是受体激活的“开关”。前角的刻度盘显示所选受体对罗替高汀的 Ki。",
    body: [
      plate(),
      dial(),
      `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needle(0.71)}" style="stroke-width:1.2"/>`,
      g.back,
      ...back.map((r) => r.svg),
      ...body,
      `<g data-part="contacts">${contacts.join("")}</g>`,
      `<g data-part="hanger">${hangerSvg(0)}</g>`,
      ...front.map((r) => r.svg),
      g.front,
      beam(),
    ],
  });
  return { svg };
}
