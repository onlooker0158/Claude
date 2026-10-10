// 格 c0–c12：开场的馒头故事 → 第一性原理 → 物理学三支柱 → 沃尔夫勒姆 → 答案是叙事 → 叙事的定义
(() => {
const { clamp, lerp } = U;
const C = BOARD.C, A = BOARD.at, cell = BOARD.cell;

// c0 开场：门 → 馒头 → 饱（第 0、1、17 行）
cell('c0', (K, t) => {
  PR.door(K, 200, 300, 230, 380, 0.05, 1.0);
  PR.steps(K, [[480, 720], [560, 700], [640, 724], [720, 702]], 1.2, 0.14);
  const tb = A(0, '拿起') + 0.1;
  K.ln([[760, 690], [1170, 690]], tb, 0.25, { w: 8, seed: 301 });
  K.ln([[800, 690], [790, 840]], tb + 0.2, 0.12, { w: 7, seed: 302 }); K.ln([[1130, 690], [1140, 840]], tb + 0.25, 0.12, { w: 7, seed: 303 });
  const eat = A(0, '吃了它');
  PR.mantou(K, 965, 680, 1.0, tb + 0.3, { bites: [eat + 0.05, eat + 0.3, eat + 0.55] });
  const full = A(0, '吃饱');
  K.txt('饱', 1560, 520, full, { size: 220, instant: true });
  K.check(1700, 640, 50, full + 0.3);
  // 第 1 行：箭头串起来，写「叙事」
  const l1 = VO.lines[1].t0;
  K.arrow(K.arc3([440, 260], [820, 300], -0.25), l1 + 0.5, 0.35, { col: C.yel, w: 7, seed: 304 });
  K.arrow(K.arc3([1130, 300], [1450, 330], -0.25), l1 + 1.0, 0.35, { col: C.yel, w: 7, seed: 305 });
  const nx = A(1, '叙事');
  K.txt('叙事', 960, 150, nx, { size: 120, col: C.yel, cps: 8 });
  K.under(960, 225, 300, nx + 0.3);
  // 第 17 行：编号
  K.txt('①', 315, 245, A(17, '先走进'), { size: 80, col: C.red, instant: true });
  K.txt('②', 965, 400, A(17, '再拿起'), { size: 80, col: C.red, instant: true });
});

// c1 宇宙：旋臂从故事链里转出来（第 2 行）
cell('c1', (K, t) => {
  const t0 = VO.lines[2].t0 + 0.15;
  PR.chain(K, 960, 520, 0.55, t0);
  for (let arm = 0; arm < 3; arm++) {
    const pts = Array.from({ length: 60 }, (_, i) => { const q = i / 59, a = arm * 2.094 + q * 4.2 + 0.4, r = 230 + q * 420; return [960 + Math.cos(a) * r * 1.25, 520 + Math.sin(a) * r * 0.62]; });
    K.ln(pts, t0 + 0.7 + arm * 0.2, 1.3, { w: 6, col: arm ? C.sub : C.ink, seed: 310 + arm });
  }
  const r = U.rng(9); for (let i = 0; i < 60; i++) { const a = r() * 7, d = 240 + r() * 520; K.ln(K.ell(960 + Math.cos(a) * d * 1.2, 520 + Math.sin(a) * d * 0.62, 3 + r() * 4, 3 + r() * 4), A(2, '宇宙') + r() * 1.2, 0.05, { w: 4, col: r() < 0.3 ? C.yel : C.ink, nopen: true, seed: 320 + i }); }
  const fp = A(2, '第一性原理');
  K.ln(K.rect(700, 760, 520, 110), fp - 0.1, 0.4, { w: 6, seed: 390 });
  K.txt('第一性原理', 960, 815, fp, { size: 74, col: C.yel });
});

// c2 基石：一切推演的出发点（第 3 行前半）
cell('c2', (K, t) => {
  const t0 = VO.lines[3].t0;
  const st = VO.lines[3].t0 + 0.2;
  K.ln(K.rect(700, 700, 520, 160), st, 0.5, { w: 8, seed: 401 });
  K.hatch([[700, 700], [1220, 700], [1220, 860], [700, 860]], st + 0.4, 0.5, { a: 0.3 });
  K.ln([[560, 860], [1360, 860]], t0 + 0.1, 0.3, { w: 6, col: C.sub, seed: 400 });
  const br = A(3, '推演');
  const tree = [[[960, 700], [960, 560]], [[960, 560], [760, 420]], [[960, 560], [1160, 420]], [[760, 420], [640, 280]], [[760, 420], [860, 270]], [[1160, 420], [1070, 270]], [[1160, 420], [1290, 280]]];
  tree.forEach((s, i) => K.arrow(s, br + i * 0.12, 0.2, { w: 6, col: i < 3 ? C.ink : C.sub, head: 18, seed: 410 + i }));
  [[640, 240], [860, 230], [1070, 230], [1290, 240]].forEach(([x, y], i) => K.ln(K.rect(x - 40, y - 34, 80, 50), br + 0.9 + i * 0.1, 0.15, { w: 5, seed: 420 + i }));
  K.txt('出发点', 960, 780, A(3, '推演'), { size: 72, col: C.yel });
});

// c3 印章盖下「设定」（第 3 行后半）
cell('c3', (K, t) => {
  const t0 = A(3, '无法辩驳') - 0.1, hit = A(3, '只能接受') + 0.15;
  K.ln(K.rect(560, 420, 800, 470), t0, 0.45, { w: 7, seed: 430 });
  for (let i = 0; i < 6; i++) K.ln([[620, 480 + i * 55], [i % 2 ? 1180 : 1290, 480 + i * 55]], t0 + 0.3 + i * 0.05, 0.12, { w: 4, col: C.sub, seed: 431 + i, nopen: true });
  const drop = 1 - MO.expoIn(clamp((t - (hit - 0.3)) / 0.3)), up = clamp((t - hit - 0.35) / 0.35);
  const sy = -340 * Math.max(drop, MO.cubicOut(up) * 0.8);
  if (t > t0 + 0.2) K.at(1050, 720 + sy, -0.05, 1, () => {
    K.ln([[-110, 0], [110, 0], [110, -60], [-110, -60], [-110, 0]], t0 + 0.2, 0.3, { w: 7, seed: 440 });
    K.ln([[-30, -60], [-40, -170], [40, -170], [30, -60]], t0 + 0.45, 0.25, { w: 7, seed: 441 });
    K.ln(K.ell(0, -200, 55, 32), t0 + 0.65, 0.2, { w: 7, seed: 442 });
  });
  if (t >= hit) { const k = MO.slam(t, hit); K.at(1050, 680, -0.05, k, () => { K.ln([[-105, -45], [105, -45], [105, 45], [-105, 45], [-105, -45]], hit, 0, { w: 8, col: C.red, seed: 443, nopen: true }); K.txt('设定', 0, 0, hit, { size: 80, col: C.red, instant: true }); }); }
});

// c4 苹果落下：物理定律（第 4 行）
cell('c4', (K, t) => {
  const t0 = VO.lines[4].t0 + 0.1;
  K.ln([[300, 200], [520, 230], [700, 220], [820, 260]], t0, 0.4, { w: 9, seed: 450 });
  K.ln([[520, 230], [560, 300]], t0 + 0.35, 0.1, { w: 6, seed: 451 });
  const fall = A(4, '物理定律') - 0.3, q = MO.cubicIn(clamp((t - fall) / 0.55)), ay = 340 + q * 430;
  K.at(560, ay, q * 0.5, 1, () => { K.ln(K.ell(0, 0, 46, 42), t0 + 0.4, 0.25, { w: 7, col: C.red, seed: 452 }); K.ln([[0, -42], [8, -66]], t0 + 0.6, 0.08, { w: 5, seed: 453 }); });
  if (t > fall) for (let i = 0; i < 6; i++) K.ln([[560, 340 + i * 70], [560, 370 + i * 70]], fall + i * 0.07, 0.04, { w: 4, col: C.sub, nopen: true, seed: 460 + i, a: q > i / 6 ? 1 : 0 });
  K.ln([[260, 830], [860, 830]], t0 + 0.2, 0.3, { w: 6, col: C.sub, seed: 454 });
  const fm = fall + 0.4;
  K.txt('F = ma', 1330, 420, fm, { size: 150, font: '"CMU-it"', cps: 9 });
  K.ln(K.rect(1040, 620, 580, 130), fm + 0.6, 0.35, { w: 6, seed: 455 });
  K.txt('物理定律', 1330, 686, fm + 0.8, { size: 72, col: C.yel });
});

// c5 学科台阶（第 5 行）
const STEP = (k) => [260 + k * 300, 900 - (k + 1) * 150];
const stepAt = [['物理', '物理学', 'atom'], ['化学', '化学', 'flask'], ['生物', '生物学', 'leaf'], ['心理', '心理学', 'brain'], ['社会', '社会学', 'house']];
const icon = (K, kind, x, y, at) => {
  if (kind === 'atom') { K.ln(K.ell(x, y, 70, 26), at, 0.2, { w: 5, seed: 470 }); K.ln(K.tf(K.ell(0, 0, 70, 26), x, y, 1, 1.05), at + 0.15, 0.2, { w: 5, seed: 471 }); K.ln(K.tf(K.ell(0, 0, 70, 26), x, y, 1, -1.05), at + 0.3, 0.2, { w: 5, seed: 472 }); K.fill(K.ell(x, y, 12, 12), at + 0.4, { col: C.yel }); }
  if (kind === 'flask') { K.ln([[x - 20, y - 70], [x - 20, y - 20], [x - 60, y + 50], [x + 60, y + 50], [x + 20, y - 20], [x + 20, y - 70]], at, 0.35, { w: 6, seed: 473 }); K.hatch([[x - 44, y + 22], [x + 44, y + 22], [x + 60, y + 50], [x - 60, y + 50]], at + 0.3, 0.2, { col: C.yel, a: 0.6 }); }
  if (kind === 'leaf') { K.ln(K.ell(x, y, 60, 30, 0, Math.PI * 2, 24).map(([a, b]) => [a + (b - y) * 0.6, b]), at, 0.3, { w: 6, seed: 474 }); K.ln([[x - 70, y + 30], [x + 60, y - 20]], at + 0.25, 0.15, { w: 4, seed: 475 }); }
  if (kind === 'brain') { K.ln([[x - 70, y + 20], [x - 76, y - 20], [x - 46, y - 56], [x - 6, y - 64], [x + 40, y - 56], [x + 72, y - 24], [x + 66, y + 22], [x + 30, y + 40], [x - 30, y + 42], [x - 70, y + 20]], at, 0.4, { w: 6, seed: 476 }); K.ln([[x, y - 60], [x - 8, y - 20], [x + 6, y + 10], [x, y + 40]], at + 0.35, 0.15, { w: 4, seed: 477 }); K.ln([[x - 50, y - 10], [x - 24, y - 2], [x - 40, y + 20]], at + 0.45, 0.1, { w: 4, seed: 478 }); }
  if (kind === 'house') { for (let i = 0; i < 2; i++) { const hx = x - 50 + i * 100; K.ln([[hx - 40, y + 50], [hx - 40, y - 10], [hx, y - 50], [hx + 40, y - 10], [hx + 40, y + 50]], at + i * 0.2, 0.3, { w: 6, seed: 479 + i }); } }
};
cell('c5', (K, t) => {
  stepAt.forEach(([lab, word, kind], k) => {
    const at = k === 0 ? A(5, '物理学') - 0.6 : k === 1 ? VO.lines[5].t0 + 0.15 : A(5, word);
    const [x, y] = STEP(k);
    K.ln([[x, y + 150], [x, y], [x + 300, y]], at, 0.35, { w: 8, seed: 480 + k });
    icon(K, kind, x + 150, y - 90, at + 0.25);
    K.txt(lab, x + 150, y + 75, at + 0.4, { size: 62, col: k === 0 ? C.yel : C.ink });
    if (k > 0) K.arrow(K.arc3([x + 70, y + 40], [x - 90, y + 150], 0.35), at + 0.7, 0.25, { w: 4, col: C.sub, head: 16, seed: 490 + k });
  });
  K.ln([[160, 900], [1820, 900]], VO.lines[5].t0, 0.4, { w: 6, col: C.sub, seed: 499 });
});

// c6 掀开「物理定律」这块石头，下面还有更深的洞（第 6 行）
cell('c6', (K, t) => {
  const t0 = VO.lines[6].t0 + 0.1, mv = A(6, '背后'), q = MO.cubicInOut(clamp((t - mv) / 0.5));
  K.ln([[180, 620], [1740, 620]], t0, 0.4, { w: 7, seed: 500 });
  if (t > mv) { K.ln([[700, 620], [720, 920], [1200, 930], [1220, 620]], mv + 0.1, 0.5, { w: 7, seed: 501 }); K.hatch([[700, 622], [1220, 622], [1200, 930], [720, 920]], mv + 0.3, 0.5, { a: 0.22, gap: 10 }); }
  K.at(960 + q * 560, 620 - q * 30, q * 0.12, 1, () => { K.ln(K.rect(-260, -170, 520, 170), t0 + 0.2, 0.5, { w: 8, seed: 502 }); K.txt('物理定律', 0, -85, t0 + 0.5, { size: 76 }); });
  K.txt('？', 960, 790, A(6, '更深'), { size: 200, col: C.yel, instant: true });
});

// c7 无穷多个宇宙泡（第 7、8 行）
const BUB = (() => { const r = U.rng(31), o = [[960, 520, 170]]; let n = 0; while (o.length < 26 && n++ < 4000) { const rr = 50 + r() * 120, x = 120 + r() * 1680, y = 110 + r() * 780; if (o.every(([a, b, c]) => Math.hypot(a - x, b - y) > c + rr + 18)) o.push([x, y, rr]); } return o; })();
cell('c7', (K, t) => {
  const t0 = A(7, '无穷多个') - 0.4;
  BUB.forEach(([x, y, r], i) => PR.bubble(K, x, y, r, i ? t0 + i * 0.09 : VO.lines[7].t0 + 0.1, i, { dur: i ? 0.3 : 0.8, patAt: i ? A(7, '每个宇宙') + i * 0.05 : VO.lines[7].t0 + 0.8, nopen: i > 0 }));
  const why = A(8, '为什么');
  K.circle(960, 520, 205, 205, why + 0.2, { w: 8, dur: 0.4 });
  K.txt('我们', 960, 280, A(8, '我们'), { size: 64, col: C.yel });
  K.txt('？', 1210, 380, A(8, '恰好'), { size: 150, col: C.yel, instant: true });
});

// c8 现代物理学的三根柱子（第 9、10、28 行）
cell('c8', (K, t) => {
  const t0 = VO.lines[9].t0 + 0.1, tp = A(9, '三个理论');
  K.ln([[260, 300], [1660, 300], [1600, 210], [320, 210], [260, 300]], t0, 0.6, { w: 8, seed: 520 });
  K.txt('现代物理学', 960, 258, t0 + 0.4, { size: 56 });
  [480, 960, 1440].forEach((x, i) => PR.pillar(K, x, 800, 500, 230, tp + i * 0.2, { seed: 530 + i * 10 }));
  // 狭义相对论：一枚飞快的火箭
  const a1 = A(10, '狭义相对论'), a2 = A(10, '量子力学'), a3 = A(10, '广义相对论');
  K.txt('狭义', 480, 380, a1 + 0.1, { size: 64, col: C.yel }); K.txt('相对论', 480, 450, a1 + 0.3, { size: 52, col: C.yel });
  { const q = MO.expoOut(clamp((t - a1 - 0.5) / 0.6)); K.at(420 + q * 90, 640, -0.35, 1, () => { K.ln([[-60, 20], [-60, -20], [30, -20], [70, 0], [30, 20], [-60, 20]], a1 + 0.5, 0.3, { w: 6, seed: 560 }); K.ln([[-60, -20], [-85, -42], [-60, -2]], a1 + 0.75, 0.1, { w: 5, seed: 561 }); }); for (let i = 0; i < 3; i++) K.ln([[300 + i * 8, 690 + i * 22 - 40], [380 + i * 8, 660 + i * 22 - 40]], a1 + 0.9 + i * 0.05, 0.08, { w: 4, col: C.sub, seed: 562 + i, nopen: true }); }
  // 量子力学：电子云
  K.txt('量子', 960, 380, a2 + 0.1, { size: 64, col: C.yel }); K.txt('力学', 960, 450, a2 + 0.3, { size: 52, col: C.yel });
  K.fill(K.ell(960, 640, 14, 14), a2 + 0.5, { col: C.yel });
  { const r = U.rng(5); for (let i = 0; i < 40; i++) { const a = r() * 7, d = 30 + r() * 70; K.ln(K.ell(960 + Math.cos(a) * d, 640 + Math.sin(a) * d * 0.9, 3, 3), a2 + 0.6 + i * 0.015, 0.03, { w: 4, col: C.ink, nopen: true, seed: 570 + i }); } }
  // 广义相对论：被压弯的网格
  K.txt('广义', 1440, 380, a3 + 0.1, { size: 64, col: C.yel }); K.txt('相对论', 1440, 450, a3 + 0.3, { size: 52, col: C.yel });
  for (let i = 0; i < 5; i++) { const x = 1350 + i * 45; K.ln(Array.from({ length: 9 }, (_, j) => { const y = 560 + j * 25, d = Math.hypot(x - 1440, y - 660); return [x + (1440 - x) * 0.4 * Math.exp(-d * d / 6000), y + 40 * Math.exp(-((x - 1440) ** 2) / 4000) * Math.sin(j / 8 * Math.PI)]; }), a3 + 0.5 + i * 0.06, 0.15, { w: 3, col: C.sub, seed: 590 + i, nopen: true }); }
  for (let j = 0; j < 5; j++) { const y = 570 + j * 45; K.ln(Array.from({ length: 9 }, (_, i) => { const x = 1350 + i * 22.5; return [x, y + 46 * Math.exp(-((x - 1440) ** 2 + (y - 660) ** 2) / 5000)]; }), a3 + 0.7 + j * 0.06, 0.15, { w: 3, col: C.sub, seed: 600 + j, nopen: true }); }
  K.fill(K.ell(1440, 690, 26, 26), a3 + 1.0, { col: C.red });
  // 第 28 行：因果 / 想象力 / 舞台
  K.txt('因果', 480, 868, A(28, '狭义相对论'), { size: 74, col: C.red });
  K.txt('想象力', 960, 868, A(28, '量子力学'), { size: 74, col: C.red });
  const sg = A(28, '广义相对论') + 0.1;
  K.ln([[300, 200], [300, 60], [1620, 60], [1620, 200]], sg - 0.1, 0.5, { w: 6, col: C.red, seed: 620 });
  for (let i = 0; i < 6; i++) K.ln([[320 + i * 40, 70], [340 + i * 34, 196]], sg + 0.3 + i * 0.03, 0.08, { w: 4, col: C.red, a: 0.7, nopen: true, seed: 621 + i });
  for (let i = 0; i < 6; i++) K.ln([[1600 - i * 40, 70], [1580 - i * 34, 196]], sg + 0.3 + i * 0.03, 0.08, { w: 4, col: C.red, a: 0.7, nopen: true, seed: 631 + i });
  K.txt('舞台', 1440, 130, sg + 0.4, { size: 64, col: C.red });
  PR.chain(K, 820, 140, 0.4, sg + 0.5);
});

// c9 2020：沃尔夫勒姆物理项目，从一个点长出一张网（第 11 行）
const NET = (() => { const r = U.rng(77), nodes = [[860, 540]], edges = []; for (let i = 1; i < 46; i++) { const p = Math.floor(r() * i), a = r() * 7, d = 60 + r() * 50; const n = [nodes[p][0] + Math.cos(a) * d, nodes[p][1] + Math.sin(a) * d * 0.8]; n[0] = clamp(n[0], 560, 1180); n[1] = clamp(n[1], 260, 820); nodes.push(n); edges.push([p, i]); if (i > 6 && r() < 0.35) edges.push([Math.floor(r() * i), i]); } return { nodes, edges }; })();
cell('c9', (K, t) => {
  const t0 = VO.lines[11].t0 + 0.1;
  K.ln(K.rect(150, 200, 300, 260), t0, 0.4, { w: 7, seed: 650 }); K.ln([[150, 270], [450, 270]], t0 + 0.3, 0.1, { w: 6, seed: 651 });
  K.ln(K.ell(220, 200, 10, 20), t0 + 0.35, 0.08, { w: 5, seed: 652 }); K.ln(K.ell(380, 200, 10, 20), t0 + 0.4, 0.08, { w: 5, seed: 653 });
  K.txt('2020', 300, 370, t0 + 0.3, { size: 100, col: C.yel, cps: 10 });
  const g0 = A(11, '发起');
  NET.edges.forEach(([a, b], i) => K.ln([NET.nodes[a], NET.nodes[b]], g0 + i * 0.06, 0.1, { w: 4, col: C.sub, nopen: true, seed: 660 + i }));
  NET.nodes.forEach(([x, y], i) => K.fill(K.ell(x, y, i ? 9 : 16, i ? 9 : 16), g0 + Math.max(0, i - 1) * 0.06, { col: i ? C.ink : C.yel }));
  const dv = A(11, '推导');
  K.arrow([[1200, 540], [1380, 540]], dv, 0.3, { w: 7, col: C.yel, seed: 700 });
  [1480, 1600, 1720].forEach((x, i) => PR.pillar(K, x, 700, 260, 80, dv + 0.3 + i * 0.15, { seed: 710 + i * 10 }));
  K.ln([[1420, 440], [1780, 440]], dv + 0.8, 0.2, { w: 7, seed: 740 });
  K.txt('物理学', 1600, 790, dv + 0.9, { size: 64 });
});

// c10 Ruliad：一团缠绕的线；切下一片就是我们的宇宙（第 12、13 行）
const BALL = (() => { const r = U.rng(101), o = []; for (let k = 0; k < 9; k++) { const pts = [], a0 = r() * 7, f1 = 1 + r() * 2.5, f2 = 1 + r() * 2.5; for (let i = 0; i <= 80; i++) { const q = i / 80 * Math.PI * 2; const rr = 330 * (0.55 + 0.45 * Math.sin(q * f2 + a0)); pts.push([Math.cos(q * f1 + a0) * rr, Math.sin(q * f1 * 1.1 + a0 * 2) * rr * 0.9]); } o.push(pts); } return o; })();
cell('c10', (K, t) => {
  const t0 = A(12, '叫') - 0.1, cutT = A(13, '只是'), q = MO.cubicInOut(clamp((t - cutT - 0.3) / 0.6));
  BALL.forEach((pts, k) => {
    const P = pts.map(([x, y]) => [860 + x, 520 + y]);
    K.ln(P, t0 + k * 0.18, 0.7, { w: 4, col: k % 3 ? C.ink : C.sub, seed: 750 + k, a: 0.85 });
  });
  K.txt('Ruliad', 860, 120, A(12, 'Ruliad'), { size: 96, col: C.yel, font: '"CMU-it"', cps: 9 });
  const sp = A(12, '总集合') - 0.6;
  const r = U.rng(3); for (let i = 0; i < 22; i++) { const a = r() * 7, d = r() * 280; PR.bubble(K, 860 + Math.cos(a) * d, 520 + Math.sin(a) * d * 0.85, 14 + r() * 16, sp + i * 0.04, i, { w: 3, dur: 0.1, nopen: true, patAt: 1e9, col: C.yel }); }
  K.txt('总集合', 860, 865, A(12, '总集合'), { size: 70 });
  // 刀切一片
  if (t > cutT) { K.ln([[1000, 150], [1000, 900]], cutT, 0.25, { w: 5, col: C.red, dash: [18, 12], seed: 790 }); K.ln([[1040, 150], [1040, 900]], cutT + 0.15, 0.25, { w: 5, col: C.red, dash: [18, 12], seed: 791 }); }
  if (t > cutT + 0.3) K.at(q * 560, -q * 40, 0, 1, () => {
    K.ln(K.rect(1000, 250, 40, 560), cutT + 0.3, 0.2, { w: 6, col: C.yel, seed: 792 });
    K.hatch([[1000, 250], [1040, 250], [1040, 810], [1000, 810]], cutT + 0.4, 0.2, { col: C.yel, a: 0.6, gap: 9 });
  });
  K.txt('我们的宇宙', 1600, 860, A(13, '小切片'), { size: 60, col: C.yel });
});

// c11 漏斗：注入什么？——叙事（第 14、15 行）
cell('c11', (K, t) => {
  const t0 = VO.lines[14].t0 + 0.1;
  K.ln([[700, 140], [1220, 140], [1000, 380], [1000, 470], [920, 470], [920, 380], [700, 140]], t0, 0.6, { w: 8, seed: 800 });
  K.ln(K.ell(960, 720, 190, 190, -1.2, -1.2 + Math.PI * 2.03), t0 + 0.5, 0.5, { w: 7, seed: 801 });
  K.txt('？', 960, 260, A(14, '什么样的要求'), { size: 130, col: C.yel, instant: true, off: [A(15, '叙事') - 0.4, 0.2] });
  const ans = A(15, '叙事'), dq = MO.cubicIn(clamp((t - ans + 0.5) / 0.5));
  if (t > ans - 0.5) K.at(960, 280 + dq * 440, 0, 0.42, () => PR.chain(K, 0, 0, 1, ans - 0.5, {}));
  if (t > ans) K.hatch(K.ell(960, 720, 180, 180, 0, Math.PI * 2, 40), ans, 0.4, { col: C.yel, a: 0.6, gap: 10 });
  if (t > ans) { const k = MO.slam(t, ans + 0.05); K.at(1440, 520, -0.06, k, () => K.txt('叙事', 0, 0, ans + 0.05, { size: 190, col: C.yel, instant: true }));
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; K.ln([[960 + Math.cos(a) * 205, 720 + Math.sin(a) * 205], [960 + Math.cos(a) * 250, 720 + Math.sin(a) * 250]], ans + 0.2 + i * 0.03, 0.08, { w: 5, col: C.yel, seed: 870 + i, nopen: true }); } }
});

// c12 珠子：散落的事实被一根线串起来（第 16 行）
const BEAD0 = [[380, 300], [820, 700], [1150, 260], [1500, 640], [600, 520]], BEAD1 = [[420, 520], [720, 470], [1000, 520], [1280, 470], [1560, 520]];
cell('c12', (K, t) => {
  const t0 = VO.lines[16].t0 + 0.1, lk = A(16, '互相关联'), q = MO.cubicInOut(clamp((t - lk) / 0.7));
  const P = BEAD0.map((p, i) => [lerp(p[0], BEAD1[i][0], q), lerp(p[1], BEAD1[i][1], q)]);
  if (t > lk + 0.6) K.ln(KIT.densify([[200, 540], ...P, [1720, 500]], 8), lk + 0.6, 0.8, { w: 5, col: C.yel, seed: 820 });
  P.forEach(([x, y], i) => { K.ln(K.ell(x, y, 58, 58), t0 + i * 0.12, 0.25, { w: 7, seed: 830 + i }); K.hatch(K.ell(x, y, 56, 56, 0, Math.PI * 2, 20), t0 + 0.2 + i * 0.12, 0.2, { a: 0.18 }); });
  K.txt('连贯描述', 960, 800, A(16, '连贯描述'), { size: 76 });
  const st = A(16, '小故事') - 0.6;
  PR.iconDoor(K, P[0][0], P[0][1], 0.55, st, { col: C.yel }); PR.iconMantou(K, P[2][0], P[2][1] + 4, 0.7, st + 0.3, { col: C.yel });
  K.txt('饱', P[4][0], P[4][1] + 4, st + 0.6, { size: 64, col: C.yel, instant: true });
  K.txt('小故事', 960, 200, A(16, '小故事'), { size: 84, col: C.yel });
});
})();
