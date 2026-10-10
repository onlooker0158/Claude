// 粉笔道具：馒头、门、脚印、故事链、宇宙泡、柱子、棋子、杯子……都用 BOARD.K 的笔画拼，按时间写出来。
// 坐标是格内局部坐标；at = 开始写的全片时刻；s = 缩放。
(() => {
const { clamp, lerp } = U;
const C = BOARD.C;
const PR = window.PR = {};
const sc = (pts, x, y, s = 1) => pts.map(([a, b]) => [x + a * s, y + b * s]);

// 馒头：底边中点 (x,y)；o.bites = [t...] 每个时刻咬一口（右上角）；o.fillAt 涂上淡淡的面色
PR.mantou = (K, x, y, s, at, o = {}) => {
  const dome = K.ell(0, 0, 150, 120, Math.PI, Math.PI * 2, 30).map(([a, b]) => [a, b * (1 - 0.06 * Math.cos(a / 30))]);
  const P = sc(dome, x, y, s);
  K.ln(P.concat([[x - 150 * s, y]]), at, o.dur ?? 0.55, { w: (o.w || 7) * Math.min(1.2, s + 0.3), seed: o.seed ?? 11, col: o.col, off: o.off });
  K.ln(sc([[-150, 0], [150, 0]], x, y, s), at + (o.dur ?? 0.55) * 0.8, 0.15, { w: 6 * Math.min(1.2, s + 0.3), seed: (o.seed ?? 11) + 1, off: o.off });
  K.hatch(sc([[-140, -8], [140, -8], [100, -70], [0, -95], [-110, -60]], x, y, s), at + 0.35, 0.4, { a: 0.18, gap: 16 * s, lw: 4 * s, off: o.off });
  // 顶上的褶
  K.ln(sc([[-26, -112], [-10, -92], [8, -86]], x, y, s), at + 0.45, 0.15, { w: 5 * s, seed: 21, off: o.off });
  K.ln(sc([[26, -110], [12, -90]], x, y, s), at + 0.55, 0.12, { w: 5 * s, seed: 22, off: o.off });
  (o.bites || []).forEach((bt, i) => {
    const bx = x + (110 - i * 52) * s, by = y - (78 + i * 22) * s, r = 52 * s;
    K.hole(bx, by, r, bt, { dur: 0.08 });
    if (K.now() >= bt + 0.06) K.ln(K.ell(bx, by, r, r, Math.PI * 0.45 + i * 0.2, Math.PI * 1.25 + i * 0.2, 12), bt + 0.06, 0.1, { w: 5 * s, seed: 30 + i, off: o.off });
  });
  if (o.steamAt) { const t = K.now(); for (let k = 0; k < 3; k++) { const ph = t * 1.6 + k * 2.1; K.ln([0, 1, 2, 3, 4, 5].map(i => [x + (k - 1) * 40 * s + Math.sin(ph + i * 0.9) * 10 * s, y - 140 * s - i * 18 * s]), o.steamAt + k * 0.1, 0.3, { w: 4 * s, a: 0.5, col: C.sub, seed: 40 + k, nopen: true, off: o.off }); } }
};
// 门：左上 (x,y) 宽 w 高 h；openAt 开门（门板往里转，门里亮）
PR.door = (K, x, y, w, h, at, openAt, o = {}) => {
  K.ln([[x, y + h], [x, y], [x + w, y], [x + w, y + h]], at, 0.5, { w: 8, seed: 51 });
  K.ln([[x - 40, y + h], [x + w + 40, y + h]], at + 0.45, 0.15, { w: 6, seed: 52 });
  const op = openAt != null ? MO.backOut(clamp((K.now() - openAt) / 0.45)) : 0;
  const dw = w * (1 - 0.72 * op);
  K.ln([[x, y], [x + dw, y + 18 * op], [x + dw, y + h - 18 * op], [x, y + h]], at + 0.3, 0.3, { w: 6, seed: 53 + (op > 0.5 ? 1 : 0) });
  K.ln(K.ell(x + dw - 24 * (1 - op * 0.5), y + h * 0.52, 9, 9), at + 0.55, 0.1, { w: 5, seed: 54 });
  if (op > 0) { for (let k = 0; k < 6; k++) { const yy = y + 40 + k * (h - 70) / 5; K.ln([[x + dw + 16, yy], [x + w - 14, yy - 6]], openAt + 0.1 + k * 0.04, 0.12, { w: 4, col: C.yel, a: 0.7, seed: 60 + k, nopen: true }); } }
};
// 脚印：沿点列一左一右，间隔 gap 秒出现
PR.steps = (K, pts, at, gap = 0.12, o = {}) => {
  pts.forEach(([px, py], i) => { const side = i % 2 ? 1 : -1; K.ln(K.ell(px, py + side * 16, 18, 10, 0, Math.PI * 2, 12), at + i * gap, 0.08, { w: 5, col: o.col || C.sub, seed: 70 + i, nopen: true }); });
};
// 小图标：门、馒头、「饱」，串成一条故事链（x,y 为链中心）
PR.iconDoor = (K, x, y, s, at, o = {}) => { K.ln(sc([[-40, 60], [-40, -60], [40, -60], [40, 60]], x, y, s), at, 0.3, { w: 6, seed: 81, ...o }); K.ln(K.ell(x + 22 * s, y, 5 * s, 5 * s), at + 0.25, 0.05, { w: 4, seed: 82, ...o }); };
PR.iconMantou = (K, x, y, s, at, o = {}) => { K.ln(sc(K.ell(0, 30, 52, 50, Math.PI, Math.PI * 2, 16).concat([[-52, 30]]), x, y, s), at, 0.3, { w: 6, seed: 83, ...o }); K.ln(sc([[-8, -14], [0, -4], [8, -6]], x, y, s), at + 0.25, 0.06, { w: 4, seed: 84, ...o }); };
PR.chain = (K, x, y, s, at, o = {}) => {
  const dx = 190 * s;
  PR.iconDoor(K, x - dx, y, s, at, o);
  K.arrow([[x - dx + 60 * s, y], [x - 70 * s, y]], at + 0.3, 0.2, { w: 5, col: C.yel, head: 18 * s, seed: 85, ...o });
  PR.iconMantou(K, x, y - 10 * s, s, at + 0.45, o);
  K.arrow([[x + 70 * s, y], [x + dx - 60 * s, y]], at + 0.75, 0.2, { w: 5, col: C.yel, head: 18 * s, seed: 86, ...o });
  K.txt('饱', x + dx + 10 * s, y + 4 * s, at + 0.95, { size: 92 * s, instant: true, ...o });
};
// 宇宙泡：圆＋里面一种花纹（每种宇宙的「定律」不同）
PR.bubble = (K, cx, cy, r, at, kind, o = {}) => {
  K.ln(K.ell(cx, cy, r, r, -1.4, -1.4 + Math.PI * 2.04), at, o.dur ?? 0.3, { w: o.w || 6, col: o.col || C.ink, seed: 90 + (kind | 0), nopen: o.nopen });
  const pat = o.patAt ?? at + 0.25, k = kind % 6, sd = 100 + kind * 7, cl = o.pcol || C.sub;
  if (k === 0) K.ln(Array.from({ length: 40 }, (_, i) => { const a = i * 0.42, rr = r * 0.08 + i * r * 0.018; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; }), pat, 0.3, { w: 4, col: cl, seed: sd, nopen: true });
  else if (k === 1) for (let i = -1; i <= 1; i++) { K.ln([[cx - r * 0.6, cy + i * r * 0.4], [cx + r * 0.6, cy + i * r * 0.4]], pat, 0.15, { w: 4, col: cl, seed: sd + i, nopen: true }); K.ln([[cx + i * r * 0.4, cy - r * 0.6], [cx + i * r * 0.4, cy + r * 0.6]], pat + 0.08, 0.15, { w: 4, col: cl, seed: sd + 5 + i, nopen: true }); }
  else if (k === 2) for (let i = 0; i < 7; i++) { const a = i * 2.4 + kind, rr = r * 0.5 * ((i * 37 % 10) / 10); K.ln(K.ell(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, r * 0.06, r * 0.06), pat + i * 0.03, 0.06, { w: 4, col: cl, seed: sd + i, nopen: true }); }
  else if (k === 3) K.ln(Array.from({ length: 30 }, (_, i) => [cx - r * 0.7 + i * r * 1.4 / 29, cy + Math.sin(i * 0.7) * r * 0.25]), pat, 0.3, { w: 4, col: cl, seed: sd, nopen: true });
  else if (k === 4) { K.ln([[cx - r * 0.5, cy - r * 0.5], [cx + r * 0.5, cy + r * 0.5]], pat, 0.12, { w: 4, col: cl, seed: sd, nopen: true }); K.ln([[cx + r * 0.5, cy - r * 0.5], [cx - r * 0.5, cy + r * 0.5]], pat + 0.1, 0.12, { w: 4, col: cl, seed: sd + 1, nopen: true }); }
  else { for (let i = 0; i < 3; i++) K.ln(K.ell(cx, cy, r * (0.2 + i * 0.2), r * (0.2 + i * 0.2)), pat + i * 0.06, 0.15, { w: 4, col: cl, seed: sd + i, nopen: true }); }
};
// 柱子：底 (x, yb)，高 h，宽 w
PR.pillar = (K, x, yb, h, w, at, o = {}) => {
  K.ln([[x - w / 2, yb], [x - w / 2, yb - h]], at, 0.3, { w: 7, seed: o.seed ?? 120 });
  K.ln([[x + w / 2, yb], [x + w / 2, yb - h]], at + 0.12, 0.3, { w: 7, seed: (o.seed ?? 120) + 1 });
  K.ln([[x - w / 2 - 24, yb], [x + w / 2 + 24, yb]], at + 0.3, 0.12, { w: 7, seed: (o.seed ?? 120) + 2 });
  K.ln([[x - w / 2 - 18, yb - h], [x + w / 2 + 18, yb - h]], at + 0.36, 0.12, { w: 7, seed: (o.seed ?? 120) + 3 });
  for (let i = 1; i <= 2; i++) K.ln([[x - w / 2 + i * w / 3, yb - 14], [x - w / 2 + i * w / 3, yb - h + 14]], at + 0.4, 0.25, { w: 3, col: C.sub, a: 0.7, seed: (o.seed ?? 120) + 4 + i, nopen: true });
};
// 棋子（主人公）：底中 (x,y)
PR.pawn = (K, x, y, s, at, o = {}) => {
  const body = [[-46, 0], [-38, -22], [-20, -40], [-14, -92], [-30, -104], [-22, -116]];
  const pts = sc(body.concat(body.slice().reverse().map(([a, b]) => [-a, b])), x, y, s);
  K.ln(pts, at, o.dur ?? 0.35, { w: 6, seed: o.seed ?? 140, col: o.col, dash: o.dash, off: o.off });
  K.ln(K.ell(x, y - 140 * s, 28 * s, 28 * s), at + 0.3, 0.15, { w: 6, seed: (o.seed ?? 140) + 1, col: o.col, dash: o.dash, off: o.off });
  if (o.fill) K.hatch(sc([[-40, -4], [40, -4], [16, -96], [-16, -96]], x, y, s), at + 0.4, 0.3, { col: o.col || C.ink, a: 0.35, gap: 12 * s, off: o.off });
};
// 杯子：底中 (x,y)；tilt 弧度（绕底右角）；water 0..1
PR.cup = (K, x, y, s, at, o = {}) => {
  K.at(x, y, o.tilt || 0, s, () => {
    K.ln([[-62, -170], [-50, 0], [50, 0], [62, -170]], at, 0.4, { w: 7, seed: 150 });
    K.ln(K.ell(0, -170, 62, 13), at + 0.35, 0.2, { w: 6, seed: 151 });
    if (o.water) K.hatch([[-60, -170 * o.water], [60, -170 * o.water], [50, -4], [-50, -4]], at + 0.5, 0.3, { col: C.ink, a: 0.4, gap: 12 });
  });
};
// 一本书：中心 (x,y)；kind 'text' 密密麻麻的字行，'story' 一条弯弯的小路
PR.book = (K, x, y, s, at, kind, o = {}) => {
  const L = sc([[0, -10], [-230, -40], [-230, 200], [0, 230]], x, y - 100 * s, s), R = sc([[0, -10], [230, -40], [230, 200], [0, 230]], x, y - 100 * s, s);
  K.ln(L, at, 0.35, { w: 7, seed: 160 }); K.ln(R, at + 0.2, 0.35, { w: 7, seed: 161 }); K.ln(sc([[0, -10], [0, 230]], x, y - 100 * s, s), at + 0.45, 0.15, { w: 6, seed: 162 });
  if (kind === 'text') for (let i = 0; i < 9; i++) for (const side of [-1, 1]) K.ln(sc([[side * 30, i * 24 - 0], [side * 205, i * 24 - 3 * side * 0]], x, y - 70 * s, s), at + 0.5 + i * 0.05, 0.1, { w: 3, col: C.sub, seed: 170 + i + side * 20, nopen: true });
  if (kind === 'story') { K.ln(sc([[-200, 180], [-140, 120], [-60, 150], [10, 70], [90, 100], [150, 20], [200, -10]], x, y - 90 * s, s), at + 0.55, 0.6, { w: 5, col: C.yel, seed: 190, dash: [12, 10] }); K.ln(sc([[200, -10], [200, -70], [240, -55], [200, -42]], x, y - 90 * s, s), at + 1.1, 0.25, { w: 5, col: C.red, seed: 191 }); }
};
// 钞票：中心 (x,y)；o.blankAt 字和花纹擦掉，只剩一张纸
PR.banknote = (K, x, y, s, at, o = {}) => {
  K.ln(sc([[-300, -150], [300, -150], [300, 150], [-300, 150], [-300, -150]], x, y, s), at, 0.6, { w: 7, seed: 200 });
  const off = o.blankAt != null ? [o.blankAt, 0.4] : null;
  K.ln(K.ell(x - 160 * s, y, 80 * s, 80 * s), at + 0.5, 0.3, { w: 5, col: C.sub, seed: 201, off });
  K.txt('¥', x - 160 * s, y + 4 * s, at + 0.7, { size: 110 * s, col: C.yel, instant: true, off });
  for (let i = 0; i < 3; i++) K.ln(sc([[-20, -60 + i * 50], [240, -60 + i * 50]], x, y, s), at + 0.75 + i * 0.08, 0.15, { w: 4, col: C.sub, seed: 202 + i, nopen: true, off });
  K.ln(sc([[-280, -130], [280, -130], [280, 130], [-280, 130], [-280, -130]], x, y, s), at + 0.6, 0.4, { w: 3, col: C.sub, seed: 206, nopen: true, off });
};
// 齿轮
PR.gear = (K, cx, cy, r, at, rot = 0, o = {}) => {
  const n = o.teeth || 10, pts = [];
  for (let i = 0; i <= n * 4; i++) { const a = rot + i / (n * 4) * Math.PI * 2, rr = (i % 4 < 2) ? r : r * 0.82; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  K.ln(pts, at, o.dur ?? 0.5, { w: 6, seed: o.seed ?? 210, col: o.col, amp: 0.8, nopen: o.nopen });
  K.ln(K.ell(cx, cy, r * 0.25, r * 0.25), at + 0.3, 0.1, { w: 5, seed: (o.seed ?? 210) + 1, col: o.col, nopen: o.nopen });
};
// 多米诺骨牌：x 处一块，fall 0..1 倒下角度
PR.domino = (K, x, yb, h, at, fall, o = {}) => {
  K.at(x, yb, fall * 1.25, 1, () => { K.ln([[0, 0], [0, -h], [h * 0.32, -h], [h * 0.32, 0], [0, 0]], at, 0.2, { w: 6, seed: (o.seed ?? 220), amp: 1 }); K.ln(K.ell(h * 0.16, -h * 0.72, 7, 7), at + 0.15, 0.05, { w: 5, seed: (o.seed ?? 220) + 1 }); K.ln(K.ell(h * 0.16, -h * 0.3, 7, 7), at + 0.18, 0.05, { w: 5, seed: (o.seed ?? 220) + 2 }); });
};
// 灯：油灯，lit 时刻点亮（火苗跳动）
PR.lamp = (K, x, y, s, at, litAt, o = {}) => {
  K.ln(sc([[-110, 0], [110, 0], [80, -60], [-80, -60], [-110, 0]], x, y, s), at, 0.4, { w: 7, seed: 230 });
  K.ln(sc([[-30, -60], [-14, -100], [14, -100], [30, -60]], x, y, s), at + 0.35, 0.2, { w: 6, seed: 231 });
  K.ln(sc([[110, -30], [170, -40], [180, -10]], x, y, s), at + 0.5, 0.15, { w: 6, seed: 232 });
  if (litAt != null && K.now() >= litAt) {
    const t = K.now(), k = MO.backOut(clamp((t - litAt) / 0.3)), fl = Math.sin(t * 9) * 6 + Math.sin(t * 13.7) * 4;
    const f = [[0, -100], [-30, -150], [-14, -210], [0 + fl * 0.5, -260 - fl], [16, -210], [30, -150], [0, -100]].map(([a, b]) => [a * k, -100 + (b + 100) * k]);
    K.fill(sc(f, x, y, s), litAt, { col: C.yel, a: 0.75, seed: 233 });
    K.ln(sc(f, x, y, s), litAt, 0, { w: 5, col: C.yel, seed: 234, nopen: true });
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.32; K.ln([[x + Math.cos(a) * 190 * s, y - 180 * s + Math.sin(a) * 190 * s], [x + Math.cos(a) * 240 * s, y - 180 * s + Math.sin(a) * 240 * s]], litAt + 0.15 + i * 0.03, 0.1, { w: 4, col: C.yel, a: 0.6, seed: 240 + i, nopen: true }); }
  }
};
// 靶子
PR.target = (K, cx, cy, r, at) => { for (let i = 0; i < 3; i++) K.ln(K.ell(cx, cy, r * (1 - i * 0.32), r * (1 - i * 0.32)), at + i * 0.15, 0.25, { w: 6, seed: 250 + i, col: i === 2 ? C.red : C.ink }); K.fill(K.ell(cx, cy, r * 0.12, r * 0.12), at + 0.5, { col: C.red, a: 0.8 }); };
})();
