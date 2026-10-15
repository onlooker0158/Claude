// 图 2：受体激活与 G 蛋白循环（示意比例：受体约 3 单位/Å，G 蛋白缩小绘制）
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";

export const WIDTH = 640;
export const HEIGHT = 400;
const AZ = 68;

export const PLATE = { x: -262, y: -84, w: 524, d: 168, r: 10 };
export const MEM = { z0: 122, z1: 206, gap: 98 };
const SLABS = [
  { x: -246, y: -58, w: 246 - MEM.gap, d: 74, r: 6 },
  { x: MEM.gap, y: -58, w: 246 - MEM.gap, d: 74, r: 6 },
];
export const ROD_R = 7;
export const RING = 30;
export const ROD_Z = [104, 224];
export const KINK = 166;
export const HELIX = [
  { id: "TM1", a: 160 }, { id: "TM2", a: 110 }, { id: "TM3", a: 220 }, { id: "TM4", a: 270 },
  { id: "TM5", a: 325 }, { id: "TM6", a: 20 }, { id: "TM7", a: 65 },
].map((h) => ({ ...h, at: [Math.cos((h.a * Math.PI) / 180) * (h.id === "TM3" ? 14 : RING), Math.sin((h.a * Math.PI) / 180) * (h.id === "TM3" ? 14 : RING)] }));
export const TM6 = HELIX.find((h) => h.id === "TM6");
export const TM6_DIR = [Math.cos((20 * Math.PI) / 180), Math.sin((20 * Math.PI) / 180)];
// TM6 胞内端外移：以 β2AR–Gs 为例约 14 Å；Gi 偶联受体通常较小（示意取 9 Å）
export const TM6_OUT = { s: 14 * 3, i: 9 * 3 };

export const GA = { rest: 30, dock: 52, ac: 40, x: { home: 0, ac: 156 } };
export const GB = { x: { home: -62, girk: -172 }, dz: 6 };
export const RAS = { x: -26, y: -22, w: 52, d: 44, r: 6, h: 34 };
export const AC = { x: 122, y: -34, w: 68, d: 70, r: 6, z0: 74, z1: 112 };
export const GIRK = { x: -172, y: 4, r: 22, z0: 80, z1: 122 };
export const CUP = { x: 156, y: 39 };
export const FEED = { x: 44, y: 60 };
export const DROP = { x: 0, y: 0, top: 286, pocket: 196 };

export const P = k.fitProjection([...k.boxCorners(PLATE, -16, 0), [0, -70, 316], [-246, -58, 206], [246, 16, 206]], WIDTH, HEIGHT, { pad: 20, azimuth: AZ });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -16, 12, P)}"/>`];
  for (const [x, y] of k.corners(PLATE, 24).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(S(k.cylinder(x, y, 7, -16, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -14.4, 2.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(k.dotsSvg(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // rails for the two carriages
  for (const y of [-24, 20]) {
    out.push(S(k.slabOf({ x: -236, y, w: 472, d: 4, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
  }
  for (const x of [-242, 236]) out.push(S(k.slabOf({ x, y: -28, w: 6, d: 56, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));
  return out.join("");
}

export function carriage() {
  const plan = { x: -22, y: -30, w: 44, d: 58, r: 3 };
  return S(k.slabOf(plan, 3, 6, P, 3, 0.5), { tone: "mid" }) + k.dotsSvg([at([-16, 25, 9]), at([16, 25, 9])], { size: 0.4 });
}
export const column = (bottom) => k.solidSvg(k.cylinder(0, 0, 4.4, 9, bottom - 9, P, 20), { tone: "mid", crease: "none" });

export function gAlpha(label) {
  const out = [];
  out.push(S(k.slabOf(RAS, 0, RAS.h, P, 4, 0.8), { tone: "hi", inner: L(k.sideSeam(RAS, 14, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(RAS, 4), RAS.h, P, 4), { tone: "faint" }));
  // α5 helix pointing up into the receptor
  out.push(S(k.cylinder(-6, 0, 5, RAS.h, 34, P, 24), { tone: "hi", crease: "lo", inner: L([RAS.h + 10, RAS.h + 22].map((z) => k.sideArc(-6, 0, 5, z, P, 16)).join(""), { tone: "faint" }) }));
  out.push(S(k.cylinder(-6, 0, 5.6, RAS.h + 34, 1.4, P, 24), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([-20, 14], RAS.h, P, "x"), label, { size: 7, tone: "mid" }));
  // nucleotide seat
  out.push(L(k.ring(14, 0, 7, RAS.h, P, 24), { tone: "lo" }));
  return out.join("");
}
export const AH_PLAN = { x: 26, y: -16, w: 16, d: 32, r: 4 };
export const gAH = () => S(k.slabOf(AH_PLAN, 6, 24, P, 3, 0.6), { tone: "hi", inner: L(k.sideSeam(AH_PLAN, 18, P, 3), { tone: "faint" }) }) + L(k.planOutline(k.insetPlan(AH_PLAN, 3), 30, P, 3), { tone: "faint" });

export function gBetaGamma() {
  const out = [];
  out.push(S(k.slabOf({ x: -26, y: 18, w: 46, d: 7, r: 2 }, 2, 26, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 22, 0, 22, P, 56, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideArc(0, 0, 22, 11, P, 40), { tone: "faint" }) }));
  const blades = Array.from({ length: 7 }, (_, i) => {
    const t = (i / 7) * Math.PI * 2;
    return k.lineOnTop([Math.cos(t) * 6, Math.sin(t) * 6], [Math.cos(t) * 19.6, Math.sin(t) * 19.6], 22, P);
  });
  out.push(L(k.ring(0, 0, 6, 22, P, 24), { tone: "lo" }), L(blades.join(""), { tone: "lo" }), L(k.ring(0, 0, 19.6, 22, P, 48), { tone: "lo" }));
  return out.join("");
}

export const pellet = (lit) => k.solidSvg(k.cylinder(0, 0, 6, 0, 8, P, 24, 0.4), { tone: "hi", lit, crease: "lo" });
export const cAMP = () => k.solidSvg(k.cylinder(0, 0, 3.2, 0, 3.2, P, 16), { tone: "hi", lit: true, crease: "none" });

function membrane() {
  return SLABS.map((plan) => {
    const out = [];
    out.push(S(k.slabOf(plan, MEM.z0, MEM.z1 - MEM.z0, P, 6, 0.8), { tone: "lo", inner: L(k.sideSeam(plan, (MEM.z0 + MEM.z1) / 2, P, 6), { tone: "faint" }) }));
    const grid = [];
    for (let x = plan.x + 8; x <= plan.x + plan.w - 6; x += 9) for (let y = plan.y + 8; y <= plan.y + plan.d - 6; y += 9) grid.push(at([x, y, MEM.z1]));
    out.push(k.dotsSvg(grid, { size: 0.9, tone: "lo" }));
    // lipid tails on the visible faces: short vertical rules from each leaflet's surface to the midplane
    const midZ = (MEM.z0 + MEM.z1) / 2;
    const front = plan.y + plan.d;
    const tails = [];
    for (let x = plan.x + plan.r + 4; x <= plan.x + plan.w - plan.r - 4; x += 6) {
      tails.push(k.segment([x, front, MEM.z1], [x, front, midZ], P), k.segment([x, front, midZ], [x, front, MEM.z0], P));
    }
    out.push(L(tails.join(""), { tone: "faint" }));
    return { key: depth(plan.x + plan.w / 2, 0), svg: out.join("") };
  });
}
function membranePosts() {
  const out = [];
  for (const plan of SLABS) for (const [x, y] of k.corners(plan, 14).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(S(k.cylinder(x, y, 6, 0, 3, P, 24), { tone: "mid" }), S(k.cylinder(x, y, 3.4, 3, MEM.z0 - 3, P, 20), { tone: "mid", crease: "none" }));
  }
  return out.join("");
}

function ac() {
  const out = [];
  for (const [x, y] of k.corners(AC, 10)) out.push(S(k.cylinder(x, y, 2.4, AC.z1, MEM.z0 - AC.z1, P, 14), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf(AC, AC.z0, AC.z1 - AC.z0, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(AC, (AC.z0 + AC.z1) / 2, P, 4), { tone: "faint" }) }));
  // outlet spout on the front face
  out.push(S(k.slabOf({ x: CUP.x - 5, y: AC.y + AC.d, w: 10, d: 6, r: 1.5 }, AC.z0 + 4, 10, P, 3), { tone: "mid" }));
  return out.join("");
}
function cup() {
  const plan = { x: CUP.x - 12, y: CUP.y - 12, w: 24, d: 24, r: 10 };
  return S(k.cylinder(CUP.x, CUP.y, 12, 0, 12, P, 40, 0.5), { tone: "mid" }) + L(k.ring(CUP.x, CUP.y, 9.6, 12, P, 40), { tone: "lo" });
}
function feeder() {
  return (
    S(k.cylinder(FEED.x, FEED.y, 9, 0, 4, P, 28), { tone: "mid" }) +
    S(k.cylinder(FEED.x, FEED.y, 7, 4, 22, P, 28, 0.5), { tone: "mid", inner: L([8, 14].map((z) => k.sideArc(FEED.x, FEED.y, 7, z, P, 20)).join(""), { tone: "faint" }) }) +
    L(k.ring(FEED.x, FEED.y, 5.4, 26, P, 24), { tone: "lo" })
  );
}
function girk() {
  const out = [];
  const { x, y, r, z0, z1 } = GIRK;
  out.push(S(k.cylinder(x, y, r, z0, z1 - z0, P, 48, 0.6), { tone: "mid", inner: L(k.sideArc(x, y, r, (z0 + z1) / 2, P, 32), { tone: "faint" }) }));
  return out.join("");
}
export const girkGate = (open) => {
  const { x, y, r, z0 } = GIRK;
  const t = open * 1.1;
  const spokes = Array.from({ length: 4 }, (_, i) => {
    const a = t + (i * Math.PI) / 2;
    return k.lineOnTop([x + Math.cos(a) * 3, y + Math.sin(a) * 3], [x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)], z0, P);
  });
  return k.lineSvg(spokes.join(""), { tone: open > 0.05 ? "lit" : "lo" }) + k.lineSvg(k.ring(x, y, r - 3, z0, P, 40), { tone: "lo" }) + k.lineSvg(k.ring(x, y, 3 + open * 7, z0, P, 24), { tone: open > 0.05 ? "lit" : "lo" });
};
export const kFlow = () => k.lineSvg(k.segment([GIRK.x, GIRK.y, GIRK.z0], [GIRK.x, GIRK.y, 12], P), { tone: "lit", dashed: true, flow: true });

function dropper() {
  const out = [];
  out.push(S(k.cylinder(0, -70, 8, 0, 4, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(0, -70, 4, 4, DROP.top + 22, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: -5, y: -74, w: 10, d: 74, r: 2 }, DROP.top + 26, 8, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 7, DROP.top + 14, 12, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 3.4, DROP.top + 2, 12, P, 20), { tone: "mid", crease: "none" }));
  return out.join("");
}

export const rodSvg = (h, z0 = ROD_Z[0], z1 = ROD_Z[1]) => {
  const [x, y] = h.at;
  const body = k.solidSvg(k.cylinder(x, y, ROD_R, z0, z1 - z0, P, 32), { tone: "mid", crease: "none", inner: k.lineSvg([140, 186].filter((z) => z > z0 && z < z1).map((z) => k.sideArc(x, y, ROD_R, z, P, 20)).join(""), { tone: "faint" }) });
  const cap = z1 === ROD_Z[1] ? k.solidSvg(k.cylinder(x, y, ROD_R + 1, z1, 3, P, 32), { tone: "mid" }) : "";
  return body + cap;
};

export function buildB() {
  const back = [], front = [];
  for (const h of HELIX) {
    const key = depth(h.at[0], h.at[1]);
    const svg = h.id === "TM6" ? `<g data-part="tm6-top">${rodSvg(h, KINK, ROD_Z[1])}${k.solidSvg(k.cylinder(h.at[0], h.at[1], ROD_R + 1.5, KINK - 2, 4, P, 32), { tone: "mid" })}</g><g data-part="tm6-low"></g>` : rodSvg(h);
    (key < depth(0, 0) ? back : front).push({ key, svg });
  }
  back.sort((a, b) => a.key - b.key);
  front.sort((a, b) => a.key - b.key);
  const mem = membrane();
  const left = mem[0], right = mem[1];
  const svg = k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    className: "rt-cycle",
    label:
      "受体激活与 G 蛋白循环：中间是七根跨膜螺旋围成的受体，左右两块平板代表细胞膜。罗替高汀从上方滴入口袋后，TM6 的胞内端向外摆开，下方的 G 蛋白三聚体被升起，Gα 的 α5 螺旋插入打开的空腔，GDP 被挤出、GTP 装入，随后 Gα 移向右侧的腺苷酸环化酶，Gβγ 移向左侧的 GIRK 钾通道。D1 类受体偶联 Gαs，使腺苷酸环化酶产生更多 cAMP；D2 类受体偶联 Gαi，抑制腺苷酸环化酶，Gβγ 打开 GIRK 钾通道。",
    body: [
      plate(),
      dropper(),
      membranePosts(),
      girk(),
      `<g data-part="gate">${girkGate(0)}</g>`,
      `<g data-part="kflow" opacity="0">${kFlow()}</g>`,
      left.svg,
      ...back.map((r) => r.svg),
      `<g data-part="bg-car">${carriage()}<g data-part="bg-col"></g></g>`,
      `<g data-part="bg">${gBetaGamma()}</g>`,
      `<g data-part="ga-car">${carriage()}<g data-part="ga-col"></g></g>`,
      `<g data-part="ga">${gAlpha("Gαs")}</g>`,
      `<g data-part="ah">${gAH()}</g>`,
      `<g data-part="gdp">${pellet(false)}</g>`,
      `<g data-part="lig">${k.solidSvg(k.cylinder(0, 0, 5, 0, 5, P, 24), { tone: "hi", lit: true })}</g>`,
      ...front.map((r) => r.svg),
      `<g data-part="gtp">${pellet(true)}</g>`,
      ac(),
      cup(),
      feeder(),
      `<g data-part="camp"></g>`,
      right.svg,
    ],
  });
  return { svg };
}
