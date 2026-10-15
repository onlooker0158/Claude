// 罗替高汀在多巴胺受体正构口袋里的示意几何（单位 Å，口袋中心为原点，z 指向胞外）。
// 依据：Xu 等 2023 Cell Research（D1–D5 与罗替高汀的冷冻电镜结构，PDB 8IRR–8IRV）
// 与 D3R 结构比较研究（PMC10775388）的描述：质子化胺与 D3.32 成盐桥，酚羟基与 TM5 丝氨酸氢键，
// 四氢萘环夹在 TM6 芳香簇之间，丙基–噻吩乙基伸入由 V2.61、F3.28、T7.39、Y7.43 围成的次级/延伸口袋。
// 原子坐标按真实键长与环几何搭建，但姿态是示意，不是从 PDB 读出的坐标。

const TAU = Math.PI * 2;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => mul(a, 1 / (len(a) || 1));
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const deg = (d) => (d * Math.PI) / 180;

// 七根跨膜螺旋（显示时螺旋间距放大约 25%，以便看见口袋）
export const HELIX_R = 1.1;
export const HELICES = [
  { id: "TM1", angle: 40, r: 11.2, cut: -7 },
  { id: "TM2", angle: -25, r: 11.2 },
  { id: "TM3", angle: -80, r: 11.2 },
  { id: "TM4", angle: -135, r: 13 },
  { id: "TM5", angle: 175, r: 11.2 },
  { id: "TM6", angle: 140, r: 11.2 },
  { id: "TM7", angle: 108, r: 11.2 },
].map((h) => ({ ...h, at: [Math.cos(deg(h.angle)) * h.r, Math.sin(deg(h.angle)) * h.r] }));
const H = Object.fromEntries(HELICES.map((h) => [h.id, h]));

// ---- ligand -----------------------------------------------------------
const tm3 = H.TM3.at, tm5 = H.TM5.at;
const U = unit([tm3[0] - tm5[0], tm3[1] - tm5[1], 0]); // 酚羟基 → 胺 的方向（TM5 → TM3）
const W = [-U[1], U[0], 0]; // 环平面法向（水平）
const Z = [0, 0, 1];
const basis = (u, w, z) => add(add(mul(U, u), mul(W, w)), mul(Z, z));

// 1-萘酚骨架的平面坐标（Å），环 A 为芳香环（含 C1–OH），环 B 为饱和环（C6 连 N）
const flat = {
  C1: [0, 1.4], C2: [-1.21, 0.7], C3: [-1.21, -0.7], C4: [0, -1.4], C4a: [1.21, -0.7], C8a: [1.21, 0.7],
  C5: [2.42, -1.4], C6: [3.63, -0.7], C7: [3.63, 0.7], C8: [2.42, 1.4],
  O: [0, 2.76], N: [3.63 + 1.47 * 0.866, -0.7 - 1.47 * 0.5],
};
const theta = -Math.atan2(flat.N[1] - flat.O[1], flat.N[0] - flat.O[0]);
const mid = [(flat.O[0] + flat.N[0]) / 2, (flat.O[1] + flat.N[1]) / 2];
const inPlane = ([p, q]) => {
  const x = p - mid[0], y = q - mid[1];
  return basis(x * Math.cos(theta) - y * Math.sin(theta), 0, x * Math.sin(theta) + y * Math.cos(theta));
};
const A = Object.fromEntries(Object.entries(flat).map(([name, pq]) => [name, inPlane(pq)]));
const step = (from, dir, d = 1.53) => add(from, mul(unit(basis(...dir)), d));
const toward = (from, xy, lean, extra = [0, 0, 0]) => {
  const h = unit([xy[0] - from[0], xy[1] - from[1], 0]);
  return unit(add(add(mul(h, Math.cos(lean)), mul(Z, Math.sin(lean))), extra));
};
const go = (from, dir, d = 1.53) => add(from, mul(dir, d));
const mid2 = (a, b) => [(H[a].at[0] + H[b].at[0]) / 2, (H[a].at[1] + H[b].at[1]) / 2];
// 丙基伸向 TM6/TM7 之间的疏水口袋，噻吩乙基向上伸入 TM2/TM7/ECL2 一侧的延伸口袋
const propyl = toward(A.N, mid2("TM6", "TM7"), deg(-48), mul(W, 0.45));
A.Ca = go(A.N, propyl, 1.47);
A.Cb = go(A.Ca, unit(add(propyl, [0, 0, 0.5])));
A.Cc = go(A.Cb, propyl);
const up = toward(A.N, mid2("TM2", "TM7"), deg(62));
A.Ce1 = go(A.N, unit(add(up, mul(W, -0.3))), 1.47);
A.Ce2 = go(A.Ce1, unit(add(up, mul(W, 0.3))));
{
  const d = up;
  const R = 1.19;
  const centre = add(go(A.Ce2, d, 1.5), mul(d, R));
  const side = unit(cross(d, Z));
  ["T2", "T3", "T4", "S", "T5"].forEach((name, i) => {
    const phi = (i * TAU) / 5;
    A[name] = add(centre, add(mul(d, -Math.cos(phi) * R), mul(side, Math.sin(phi) * R)));
  });
  A.Tc = centre;
}
A.RA = mul(["C1", "C2", "C3", "C4", "C4a", "C8a"].reduce((sum, n) => add(sum, A[n]), [0, 0, 0]), 1 / 6); // 芳香环中心

export const ATOMS = [
  ...["C1", "C2", "C3", "C4", "C4a", "C8a", "C5", "C6", "C7", "C8", "Ca", "Cb", "Cc", "Ce1", "Ce2", "T2", "T3", "T4", "T5"].map((n) => ({ n, el: "C" })),
  { n: "O", el: "O" },
  { n: "N", el: "N" },
  { n: "S", el: "S" },
].map((a) => ({ ...a, at: A[a.n] }));
export const BONDS = [
  ["C1", "C2", 2], ["C2", "C3"], ["C3", "C4", 2], ["C4", "C4a"], ["C4a", "C8a", 2], ["C8a", "C1"],
  ["C4a", "C5"], ["C5", "C6"], ["C6", "C7"], ["C7", "C8"], ["C8", "C8a"],
  ["C1", "O"], ["C6", "N"], ["N", "Ca"], ["Ca", "Cb"], ["Cb", "Cc"], ["N", "Ce1"], ["Ce1", "Ce2"], ["Ce2", "T2"],
  ["T2", "T3", 2], ["T3", "T4"], ["T4", "S"], ["S", "T5"], ["T5", "T2", 2],
];
export const LIG = A;

// ---- residues --------------------------------------------------------
// 每个残基：所在螺旋、目标（配体原子或点）、接触距离、相对目标的高度偏移、侧链样式、作用类型
const RES = [
  { id: "D3.32", helix: "TM3", target: "N", d: 2.9, dz: 0, kind: "acid", bond: "salt" },
  { id: "S5.42", helix: "TM5", target: "O", d: 2.8, dz: 2.6, kind: "ser", bond: "hbond" },
  { id: "S5.46", helix: "TM5", target: "O", d: 3.0, dz: -2.6, kind: "ser", bond: "hbond" },
  { id: "F6.51", helix: "TM6", target: "RA", d: 5.0, dz: -0.6, kind: "phe", bond: "pi" },
  { id: "W6.48", helix: "TM6", target: "RA", d: 5.6, dz: -6.4, kind: "trp", bond: "none" },
  { id: "T7.39", helix: "TM7", target: "Cc", d: 4.0, dz: 0, kind: "thr", bond: "vdw" },
  { id: "V2.61", helix: "TM2", target: "Tc", d: 4.3, dz: 0.4, kind: "val", bond: "vdw" },
  { id: "F3.28", helix: "TM3", target: "Tc", d: 4.8, dz: 1.2, kind: "phe", bond: "vdw" },
];

function ringAtoms(centre, normal, side, r, count, start = 0) {
  const other = unit(cross(normal, side));
  return Array.from({ length: count }, (_, i) => {
    const phi = start + (i * TAU) / count;
    return add(centre, add(mul(side, Math.cos(phi) * r), mul(other, Math.sin(phi) * r)));
  });
}

// 侧链：从螺旋表面（Cα 位置）伸向目标。返回原子与键；toggle 为 W6.48 的转角（弧度）。
export function residue(res, toggle = 0) {
  const h = H[res.helix];
  const target = A[res.target];
  const z = target[2] + res.dz;
  const axis = [h.at[0], h.at[1], z];
  const toward = unit(sub([target[0], target[1], z], axis));
  const ca = add(axis, mul(toward, HELIX_R));
  const end = add(target, mul(unit(sub(ca, target)), res.d)); // 末端官能团中心
  const dir = unit(sub(end, ca));
  const side = unit(cross(dir, Z));
  const atoms = [{ at: ca, el: "CA" }];
  const bonds = [];
  const link = (i, j, order) => bonds.push([i, j, order]);
  const put = (at, el) => (atoms.push({ at, el }), atoms.length - 1);
  if (res.kind === "acid") {
    const cb = put(add(ca, mul(sub(end, ca), 0.45)), "C");
    const cg = put(add(end, mul(dir, -1.25)), "C");
    const o1 = put(add(add(end, mul(dir, -0.6)), mul(side, 1.1)), "O");
    const o2 = put(add(add(end, mul(dir, -0.6)), mul(side, -1.1)), "O");
    link(0, cb); link(cb, cg); link(cg, o1, 2); link(cg, o2);
    return { atoms, bonds, contact: [o1, o2] };
  }
  if (res.kind === "ser") {
    const cb = put(add(ca, mul(sub(end, ca), 0.5)), "C");
    const og = put(end, "O");
    link(0, cb); link(cb, og);
    return { atoms, bonds, contact: [og] };
  }
  if (res.kind === "thr" || res.kind === "val") {
    const cb = put(add(ca, mul(sub(end, ca), 0.55)), "C");
    const g1 = put(add(end, mul(side, 1.1)), res.kind === "thr" ? "O" : "C");
    const g2 = put(add(end, mul(side, -1.1)), "C");
    link(0, cb); link(cb, g1); link(cb, g2);
    return { atoms, bonds, contact: [g1, g2] };
  }
  // 芳香族：苯环（Phe/Tyr）或吲哚（Trp）。环平面含 dir 与 z 旋转 toggle 后的方向
  const cb = put(add(ca, mul(dir, 1.5)), "C");
  link(0, cb);
  const spin = (v) => add(mul(v, Math.cos(toggle)), mul(cross(dir, v), Math.sin(toggle)));
  const normal = spin(side);
  if (res.kind === "trp") {
    const c6 = add(end, mul(dir, -0.9));
    const five = ringAtoms(add(c6, mul(dir, -0.4)), normal, mul(dir, -1), 1.15, 5, 0).map((p) => put(p, "C"));
    const six = ringAtoms(add(c6, mul(dir, 1.6)), normal, dir, 1.4, 6, Math.PI / 6).map((p) => put(p, "C"));
    atoms[five[2]].el = "N";
    link(cb, five[0]);
    five.forEach((a, i) => link(a, five[(i + 1) % 5]));
    six.forEach((a, i) => link(a, six[(i + 1) % 6]));
    link(five[3], six[3]);
    return { atoms, bonds, contact: six };
  }
  const centre = add(end, mul(dir, 0.2));
  const ring = ringAtoms(centre, normal, dir, 1.4, 6, Math.PI).map((p) => put(p, "C"));
  ring.forEach((a, i) => link(a, ring[(i + 1) % 6], i % 2 ? 1 : 2));
  link(cb, ring[0]);
  if (res.kind === "tyr") {
    const oh = put(add(centre, mul(dir, 2.75)), "O");
    link(ring[3], oh);
  }
  return { atoms, bonds, contact: [ring[3]], centre };
}

export const RESIDUES = RES;
export const helixOf = (id) => H[id];
