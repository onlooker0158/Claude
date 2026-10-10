// 格（第 37–67 行）：三个作用、事实与叙事、主观、跳出别人的叙事、总结与收束
(() => {
const { clamp, lerp } = U;
const C = BOARD.C, A = BOARD.at, cell = BOARD.cell;
const L0 = (i) => VO.lines[i].t0;

// 三把钥匙（第 37 行）
cell('keys', (K, t) => {
  const t0 = L0(37) + 0.1;
  K.ln(K.ell(960, 300, 90, 90, -1.6, -1.6 + Math.PI * 2.03), t0, 0.4, { w: 7, seed: 3000 });
  [-1, 0, 1].forEach((k, i) => { const x = 960 + k * 260, at = A(37, '三个') + i * 0.25;
    K.ln([[960 + k * 60, 380], [x, 470]], at, 0.15, { w: 5, seed: 3010 + i });
    K.ln(K.ell(x, 520, 50, 50), at + 0.1, 0.2, { w: 7, seed: 3020 + i });
    K.ln([[x, 570], [x, 820], [x + 50, 820], [x, 780], [x + 40, 760], [x, 740]], at + 0.25, 0.3, { w: 7, seed: 3030 + i });
    K.txt(['①', '②', '③'][i], x, 520, at + 0.3, { size: 54, col: C.yel, instant: true }); });
  K.txt('三个作用', 960, 130, A(37, '关键作用'), { size: 70, col: C.yel });
});

// 杯子：预测 → 洒了（第 38、39 行）
cell('cup', (K, t) => {
  const t0 = L0(38) + 0.1, pr = A(38, '我伸手'), sp = A(39, '惊讶') - 0.2, tq = MO.backOut(clamp((t - sp) / 0.35), 1.2);
  K.txt('① 预测', 400, 180, t0, { size: 72, col: C.yel });
  K.ln([[300, 820], [1700, 820]], t0 + 0.3, 0.4, { w: 6, col: C.sub, seed: 3100 });
  PR.cup(K, 800, 820, 1.2, t0 + 0.5, { water: 0.65, tilt: tq * 1.45 });
  // 预测：虚线画的杯子举起、水流向一滴「喝到」
  K.at(1150, 520, -0.6, 1.0, () => { K.ln([[-62, -170], [-50, 0], [50, 0], [62, -170]], pr, 0.4, { w: 5, col: C.sub, dash: [10, 10], seed: 3110, off: [sp, 0.2] }); });
  K.arrow(K.arc3([880, 600], [1080, 420], -0.3), pr + 0.2, 0.4, { w: 5, col: C.sub, dash: [10, 10], seed: 3111, off: [sp, 0.2] });
  K.ln(K.smooth([[1230, 400], [1300, 360], [1360, 420], [1330, 470]]), A(38, '喝到水'), 0.3, { w: 6, col: C.yel, seed: 3112, off: [sp, 0.2] });
  K.check(1440, 360, 34, A(38, '喝到水') + 0.3, { off: [sp, 0.2] });
  if (t > sp + 0.2) { const r = U.rng(2), k = MO.expoOut(clamp((t - sp - 0.2) / 0.5)); for (let i = 0; i < 12; i++) { const a = -0.2 - r() * 1.3, d = (120 + r() * 260) * k; K.fill(K.ell(1010 + Math.cos(a) * d * 1.4, 810 - Math.abs(Math.sin(a)) * d * 0.5, 8 + r() * 14, 6 + r() * 8), sp + 0.2, { col: C.ink, a: 0.6 }); }
    K.ln(K.smooth([[960, 812], [1150, 800], [1420, 815], [1600, 806]]), sp + 0.25, 0.4, { w: 5, col: C.ink, seed: 3120, nopen: true }); }
  if (t > sp + 0.25) { const k = MO.slam(t, sp + 0.25); K.at(1300, 420, 0.08, k, () => K.txt('！', 0, 0, sp + 0.25, { size: 280, col: C.red, instant: true })); }
});

// 大脑和自由能表（第 40 行）
cell('brain', (K, t) => {
  const t0 = L0(40) + 0.1, sur = A(40, '每一次惊讶'), fix = A(40, '修改叙事');
  const br = [[-210, 60], [-226, -60], [-150, -160], [-30, -190], [110, -170], [210, -80], [200, 60], [100, 120], [-80, 124], [-210, 60]];
  K.ln(K.smooth(br.map(([x, y]) => [560 + x, 480 + y]), 4), t0, 0.7, { w: 8, seed: 3200 });
  K.ln(K.smooth([[560, 300], [530, 400], [580, 480], [550, 590]]), t0 + 0.6, 0.3, { w: 5, seed: 3201 });
  K.ln(K.smooth([[400, 420], [470, 440], [430, 500], [480, 540]]), t0 + 0.8, 0.2, { w: 5, seed: 3202 }); K.ln(K.smooth([[650, 380], [700, 420], [660, 470], [720, 520]]), t0 + 0.9, 0.2, { w: 5, seed: 3203 });
  // 预测的虚线；惊讶后擦掉，重画一条
  K.ln(K.smooth([[760, 420], [900, 360], [1020, 400]]), A(40, '预测机器'), 0.4, { w: 5, col: C.sub, dash: [10, 10], seed: 3210, off: [sur + 0.6, 0.3] });
  K.ln(K.smooth([[760, 440], [900, 470], [1020, 560]]), fix, 0.4, { w: 6, col: C.yel, seed: 3211 });
  // 表
  const gx = 1360, gy = 600;
  K.ln(K.ell(gx, gy, 260, 260, Math.PI, Math.PI * 2, 30), t0 + 0.4, 0.5, { w: 7, seed: 3220 });
  for (let i = 0; i <= 6; i++) { const a = Math.PI + i / 6 * Math.PI; K.ln([[gx + Math.cos(a) * 225, gy + Math.sin(a) * 225], [gx + Math.cos(a) * 255, gy + Math.sin(a) * 255]], t0 + 0.8, 0.05, { w: 5, col: i > 4 ? C.red : C.ink, seed: 3230 + i, nopen: true }); }
  K.ln([[gx - 280, gy], [gx + 280, gy]], t0 + 0.6, 0.2, { w: 6, seed: 3240 });
  const up = MO.backOut(clamp((t - sur) / 0.3)), dn = MO.cubicInOut(clamp((t - fix - 0.2) / 0.6)), v = 0.15 + up * 0.75 - dn * 0.72;
  const a = Math.PI + v * Math.PI;
  K.ln([[gx, gy], [gx + Math.cos(a) * 200, gy + Math.sin(a) * 200]], t0 + 0.9, 0.1, { w: 8, col: v > 0.6 ? C.red : C.yel, seed: 3250, nopen: true, amp: 0.4 });
  K.txt('自由能原理', gx, 760, A(40, '自由能原理'), { size: 66, col: C.yel });
  K.txt('修改叙事', 900, 700, fix + 0.1, { size: 56, col: C.yel });
});

// 两本书：说理文章 vs 小说（第 41 行）
cell('books', (K, t) => {
  const t0 = L0(41) + 0.1;
  K.txt('② 意义', 960, 140, t0, { size: 72, col: C.yel });
  PR.book(K, 540, 560, 1.15, A(41, '说理文章') - 0.4, 'text');
  K.txt('费劲', 540, 850, A(41, '费劲'), { size: 56, col: C.sub });
  PR.book(K, 1380, 560, 1.15, A(41, '读小说') - 0.3, 'story');
  K.txt('入戏', 1380, 850, A(41, '入戏'), { size: 56, col: C.yel });
});

// 小说里的路：主人公走向山顶的旗；中间一道缺口（第 42、43 行）
const ROAD = [[180, 800], [420, 760], [640, 660], [820, 640], [1040, 540], [1240, 470], [1460, 340], [1600, 260]];
cell('novel', (K, t) => {
  const t0 = L0(42) + 0.1, gap = A(42, '只要听说了');
  K.ln(K.smooth([[100, 860], [600, 700], [1000, 560], [1400, 360], [1640, 240], [1800, 300], [1900, 420]]), t0, 0.8, { w: 6, col: C.sub, seed: 3300 });
  K.ln(K.smooth(ROAD.slice(0, 5)), t0 + 0.3, 0.6, { w: 5, col: C.yel, dash: [14, 10], seed: 3301 });
  K.ln(K.smooth(ROAD.slice(5)), t0 + 0.6, 0.4, { w: 5, col: C.yel, dash: [14, 10], seed: 3302 });
  K.ln([[1600, 260], [1600, 80]], A(42, '有意图') - 0.3, 0.2, { w: 6, seed: 3303 }); K.ln([[1600, 80], [1720, 110], [1600, 150]], A(42, '有意图'), 0.2, { w: 6, col: C.red, seed: 3304 });
  K.hatch([[1600, 80], [1720, 110], [1600, 150]], A(42, '有意图') + 0.2, 0.2, { col: C.red, a: 0.7 });
  K.txt('意图', 1720, 200, A(42, '有意图'), { size: 56, col: C.red });
  // 主人公棋子沿路走
  const wq = MO.sineInOut(clamp((t - t0 - 0.6) / (gap - t0 - 0.6)));
  const pts = K.smooth(ROAD.slice(0, 5)), cum = DG.cum(pts), Lw = cum[cum.length - 1] * wq * 0.97; let k = 0; while (k < cum.length - 1 && cum[k + 1] < Lw) k++;
  const px = pts[k][0], py = pts[k][1];
  PR.pawn(K, px, py - 6, 0.7, A(42, '主人公') - 0.2, { fill: true, nopen: true });
  // 缺口：路断开，问号
  if (t > gap) { K.ln([[1080, 560], [1140, 680], [1160, 820]], gap, 0.25, { w: 6, col: C.red, seed: 3310 }); K.ln([[1200, 520], [1230, 650], [1250, 820]], gap + 0.1, 0.25, { w: 6, col: C.red, seed: 3311 }); K.txt('能否实现？', 1170, 400, A(42, '能否实现'), { size: 60, col: C.yel }); }
  // 第 43 行：指南针指向旗子
  const cp = L0(43) + 0.1;
  K.ln(K.ell(360, 330, 120, 120, -1.6, -1.6 + Math.PI * 2.03), cp, 0.4, { w: 7, seed: 3320 });
  const ang = Math.atan2(80 - 330, 1600 - 360), nq = MO.backOut(clamp((t - cp - 0.4) / 0.5)), aa = lerp(ang + 1.6, ang, nq);
  K.ln([[360 - Math.cos(aa) * 90, 330 - Math.sin(aa) * 90], [360 + Math.cos(aa) * 100, 330 + Math.sin(aa) * 100]], cp + 0.4, 0.1, { w: 8, col: C.red, seed: 3321, nopen: true, amp: 0.4 });
  K.txt('人生意义', 360, 520, A(43, '人生意义'), { size: 60, col: C.yel });
});

// 一群点排成队：大规模合作；头顶的五样虚构之物（第 44 行）
const DOTS = (() => { const r = U.rng(90), o = []; for (let i = 0; i < 64; i++) o.push({ x: 160 + r() * 1600, y: 300 + r() * 560, tx: 560 + (i % 16) * 53, ty: 560 + Math.floor(i / 16) * 48 }); return o; })();
cell('crowd', (K, t) => {
  const t0 = L0(44) + 0.1, co = A(44, '大规模合作') - 0.2, q = MO.cubicInOut(clamp((t - co) / 0.9));
  K.txt('③ 协调', 960, 130, t0, { size: 72, col: C.yel });
  DOTS.forEach((d, i) => K.fill(K.ell(lerp(d.x, d.tx, q), lerp(d.y, d.ty, q), 12, 12), t0 + 0.3 + i * 0.012, { col: i % 9 ? C.ink : C.yel }));
  const ic = A(44, '神话') - 0.2, xs = [520, 740, 960, 1180, 1400], y = 420;
  // 神话：云和闪电
  K.ln(K.smooth([[460, 410], [470, 370], [510, 360], [540, 330], [590, 350], [600, 400], [560, 420], [470, 420]]), ic, 0.3, { w: 5, seed: 3400 }); K.ln([[520, 430], [500, 480], [530, 480], [510, 530]], ic + 0.25, 0.12, { w: 5, col: C.yel, seed: 3401 });
  // 国家：旗
  K.ln([[700, 520], [700, 330]], A(44, '国家'), 0.15, { w: 6, seed: 3402 }); K.ln([[700, 335], [800, 360], [700, 400]], A(44, '国家') + 0.12, 0.15, { w: 5, col: C.red, seed: 3403 });
  // 货币：钱币
  K.ln(K.ell(960, 420, 60, 60), A(44, '货币'), 0.2, { w: 6, seed: 3404 }); K.txt('¥', 960, 422, A(44, '货币') + 0.15, { size: 66, col: C.yel, instant: true });
  // 公司：楼
  K.ln([[1130, 500], [1130, 340], [1230, 340], [1230, 500]], A(44, '公司'), 0.25, { w: 6, seed: 3405 }); for (let i = 0; i < 3; i++) K.ln([[1150, 370 + i * 40], [1210, 370 + i * 40]], A(44, '公司') + 0.2, 0.05, { w: 4, col: C.sub, seed: 3406 + i, nopen: true });
  // 法律：天平
  const lw = A(44, '法律');
  K.ln([[1400, 500], [1400, 340]], lw, 0.12, { w: 6, seed: 3410 }); K.ln([[1320, 360], [1480, 360]], lw + 0.1, 0.1, { w: 6, seed: 3411 }); K.ln(K.ell(1320, 420, 40, 14, 0, Math.PI, 8), lw + 0.18, 0.08, { w: 5, seed: 3412 }); K.ln(K.ell(1480, 420, 40, 14, 0, Math.PI, 8), lw + 0.22, 0.08, { w: 5, seed: 3413 });
  K.txt('虚构的东西', 960, 250, A(44, '虚构'), { size: 56, col: C.sub });
  for (let i = 0; i < 5; i++) K.ln([[xs[i], 540], [lerp(xs[i], 960, 0.5), 610]], A(44, '法律') + 0.4 + i * 0.05, 0.12, { w: 3, col: C.yel, dash: [8, 8], seed: 3420 + i, nopen: true });
});

// 钞票（第 45 行）
cell('money', (K, t) => {
  const t0 = L0(45) + 0.1, bl = A(45, '只是一张纸') - 0.3;
  PR.banknote(K, 960, 500, 1.2, t0, { blankAt: bl });
  K.txt('价值', 960, 820, A(45, '有价值'), { size: 70, col: C.yel, off: [bl, 0.3] });
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2, x = 960 + Math.cos(a) * 640, y = 500 + Math.sin(a) * 400; K.arrow([[x, y], [lerp(x, 960, 0.38), lerp(y, 500, 0.38)]], A(45, '别人都相信') + i * 0.06, 0.15, { w: 5, col: C.sub, head: 18, seed: 3500 + i, off: [bl, 0.3] }); }
  K.txt('一张纸', 960, 820, A(45, '一张纸'), { size: 70 });
});

// 齿轮：叙事驱动行动（第 46 行）
cell('gears', (K, t) => {
  const t0 = L0(46) + 0.1, rot = Math.max(0, t - A(46, '驱动') - 0.6) * 1.4;
  PR.gear(K, 620, 480, 190, t0, rot, { seed: 3600, teeth: 12 }); PR.gear(K, 960, 360, 130, t0 + 0.3, -rot * 1.46 + 0.13, { seed: 3610, teeth: 8 }); PR.gear(K, 1240, 520, 160, t0 + 0.5, rot * 1.19 + 0.2, { seed: 3620, teeth: 10 });
  K.txt('叙事', 620, 480, A(46, '叙事构成'), { size: 72, col: C.yel });
  PR.steps(K, [[1420, 780], [1510, 760], [1600, 784], [1690, 762], [1780, 786]], A(46, '行动的方向'), 0.14, { col: C.yel });
  K.txt('行动', 1600, 670, A(46, '行动本身'), { size: 56, col: C.sub });
});

// 多米诺：把事实串起来才能触发行动（第 47 行）
cell('domino', (K, t) => {
  const t0 = L0(47) + 0.1, sr = A(47, '串起来'), go = A(47, '触发行动') - 0.2;
  for (let i = 0; i < 3; i++) { K.fill(K.ell(260, 260 + i * 80, 10, 10), t0 + i * 0.12, {}); K.ln([[300, 260 + i * 80], [520 - i * 40, 260 + i * 80]], t0 + 0.05 + i * 0.12, 0.15, { w: 5, col: C.sub, seed: 3700 + i }); }
  K.cross(390, 340, 120, A(47, '不要列举') + 0.3, { seed: 3705 });
  K.ln([[620, 820], [1800, 820]], t0 + 0.4, 0.4, { w: 6, col: C.sub, seed: 3710 });
  for (let i = 0; i < 8; i++) { const x = 700 + i * 140, f = clamp((t - go - i * 0.16) / 0.25); PR.domino(K, x, 820, 240, A(47, '事实串') - 0.2 + i * 0.08, MO.cubicIn(f) * 0.86, { seed: 3720 + i * 3 }); }
  K.ln(K.smooth(Array.from({ length: 8 }, (_, i) => [700 + i * 140 + 38, 600 - (i % 2) * 14])), sr, 0.5, { w: 4, col: C.yel, seed: 3760, off: [go, 0.2] });
  K.txt('串起来', 1250, 470, sr + 0.2, { size: 64, col: C.yel });
});

// 战场地图：事实一大堆 → 一句话的叙事（第 48、49 行）
cell('battle', (K, t) => {
  const t0 = L0(48) + 0.1, clr = A(49, '可你只要') + 0.1, off = [clr, 0.3];
  K.ln(K.rect(200, 120, 1520, 760), t0, 0.5, { w: 6, seed: 3800 });
  K.ln(K.smooth([[200, 600], [500, 560], [760, 640], [1000, 560], [1300, 600], [1720, 520]]), t0 + 0.4, 0.5, { w: 5, col: C.sub, seed: 3801 });
  for (let i = 0; i < 4; i++) K.ln([[340 + i * 120, 320], [400 + i * 120, 220], [460 + i * 120, 320]], t0 + 0.6 + i * 0.08, 0.15, { w: 5, seed: 3810 + i });
  // 敌军
  for (let i = 0; i < 6; i++) { const x = 1220 + (i % 3) * 110, y = 260 + Math.floor(i / 3) * 110; K.ln([[x, y + 50], [x, y - 20], [x + 50, y - 5], [x, y + 10]], A(48, '敌军人数') + i * 0.06, 0.12, { w: 5, col: C.red, seed: 3820 + i, off }); }
  // 天气
  K.ln(K.smooth([[700, 260], [720, 220], [780, 210], [820, 180], [880, 210], [890, 260], [700, 260]]), A(48, '天气'), 0.3, { w: 5, seed: 3830, off });
  for (let i = 0; i < 5; i++) K.ln([[720 + i * 35, 290], [705 + i * 35, 330]], A(48, '天气') + 0.3, 0.05, { w: 4, col: C.sub, seed: 3831 + i, nopen: true, off });
  // 一头雾水
  const fg = A(48, '一头雾水') - 0.3;
  for (let i = 0; i < 7; i++) { const cx = 360 + i * 210, cy = 470 + (i % 2) * 120; K.ln(Array.from({ length: 26 }, (_, j) => { const a = j * 0.55, rr = 10 + j * 3.6; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7]; }), fg + i * 0.06, 0.2, { w: 4, col: C.sub, seed: 3840 + i, nopen: true, off }); }
  K.txt('？？？', 960, 480, fg + 0.4, { size: 120, col: C.yel, instant: true, off });
  // 第 49 行：日落、补给线、封锁
  if (t > clr) K.smudge(960, 500, 1300, 600, clr);
  const sun = A(49, '日落');
  K.ln(K.ell(1500, 240, 80, 80, Math.PI, Math.PI * 2, 16), sun, 0.25, { w: 6, col: C.yel, seed: 3850 }); K.ln([[1380, 240], [1620, 240]], sun + 0.2, 0.1, { w: 5, col: C.yel, seed: 3851 });
  for (let i = 0; i < 5; i++) { const a = Math.PI + (i + 0.5) / 5 * Math.PI; K.ln([[1500 + Math.cos(a) * 105, 240 + Math.sin(a) * 105], [1500 + Math.cos(a) * 135, 240 + Math.sin(a) * 135]], sun + 0.3 + i * 0.04, 0.06, { w: 4, col: C.yel, seed: 3852 + i, nopen: true }); }
  K.txt('日落之前', 1500, 340, sun + 0.3, { size: 46, col: C.yel });
  K.ln(K.smooth([[1300, 800], [1150, 700], [1000, 740], [820, 680], [600, 720], [300, 700]]), A(49, '补给线') - 0.3, 0.6, { w: 6, col: C.ink, dash: [16, 12], seed: 3860 });
  K.cross(900, 700, 55, A(49, '封锁') + 0.1, { seed: 3861 });
  const mv = A(49, '大家立刻明白');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = 900 + Math.cos(a) * 420, y = 690 + Math.sin(a) * 200; K.arrow([[x, y], [lerp(x, 900, 0.62), lerp(y, 700, 0.62)]], mv + i * 0.07, 0.18, { w: 5, col: C.yel, head: 18, seed: 3870 + i }); }
  for (let i = 0; i < 3; i++) K.ln(K.rect(780 + i * 90, 600, 40, 30), A(49, '查漏补缺') + i * 0.12, 0.12, { w: 5, col: C.red, seed: 3880 + i });
});

// 一堆数据 vs 指针指向故事（第 50 行）
cell('react', (K, t) => {
  const t0 = L0(50) + 0.1;
  const r = U.rng(14); const bits = ['0110', '%', '3.14', '∑', '101', '‰', '42', '∆']; for (let i = 0; i < 22; i++) K.txt(bits[i % bits.length], 300 + r() * 520, 820 - Math.pow(r(), 0.7) * 380 - (i % 5) * 20, t0 + i * 0.05, { size: 40 + r() * 30, col: C.sub, instant: true, rot: (r() - 0.5) * 0.8, font: '"CMU-rm"' });
  for (let i = 0; i < 5; i++) K.ln(K.rect(320 + i * 90, 820 - 60 - i * 30, 50, 60 + i * 30), t0 + 0.6 + i * 0.05, 0.12, { w: 4, col: C.sub, seed: 3900 + i, nopen: true });
  PR.chain(K, 1460, 300, 0.75, A(50, '对叙事'));
  const nq = MO.backOut(clamp((t - A(50, '对叙事') - 0.6) / 0.4)), aa = lerp(Math.PI * 0.85, Math.atan2(300 - 620, 1460 - 1160), nq);
  K.ln(K.ell(1160, 620, 110, 110, -1.6, -1.6 + Math.PI * 2.03), t0 + 0.4, 0.4, { w: 7, seed: 3910 });
  K.ln([[1160 - Math.cos(aa) * 70, 620 - Math.sin(aa) * 70], [1160 + Math.cos(aa) * 90, 620 + Math.sin(aa) * 90]], t0 + 0.7, 0.1, { w: 8, col: C.red, seed: 3911, nopen: true, amp: 0.4 });
  K.txt('对叙事做反应', 1300, 830, A(50, '叙事做反应'), { size: 64, col: C.yel });
});

// 席勒：叙事经济学；叙事像病毒一样传开（第 51 行）
const NODES = (() => { const r = U.rng(51), o = []; for (let i = 0; i < 70; i++) o.push([820 + r() * 900, 200 + r() * 600]); const d = o.map(p => Math.hypot(p[0] - 1270, p[1] - 500)); return o.map((p, i) => ({ p, d: d[i] })); })();
cell('shiller', (K, t) => {
  const t0 = L0(51) + 0.1, vr = A(51, '像病毒');
  K.ln(K.ell(420, 500, 150, 150, -1.6, -1.6 + Math.PI * 2.03), t0, 0.5, { w: 8, col: C.yel, seed: 4000 });
  K.ln([[340, 640], [300, 860], [380, 820], [420, 880], [420, 650]], t0 + 0.4, 0.3, { w: 6, col: C.red, seed: 4001 }); K.ln([[500, 640], [540, 860], [460, 820], [420, 880]], t0 + 0.5, 0.3, { w: 6, col: C.red, seed: 4002 });
  K.txt('诺贝尔', 420, 500, t0 + 0.5, { size: 54, col: C.yel });
  K.txt('叙事经济学', 1270, 140, A(51, '叙事经济学'), { size: 72, col: C.yel });
  NODES.forEach(({ p, d }, i) => { const inf = t > vr + d / 480; K.fill(K.ell(p[0], p[1], 10, 10), A(51, '叙事经济学') + 0.3 + i * 0.008, { col: inf ? C.red : C.sub, a: inf ? 1 : 0.7 }); });
  NODES.forEach(({ p, d }, i) => { if (i % 2) return; const q = NODES[(i * 7 + 3) % NODES.length]; if (q.d > d) K.ln([p, q.p], vr + q.d / 480, 0.15, { w: 3, col: C.red, a: 0.6, seed: 4010 + i, nopen: true }); });
  K.txt('传播', 1270, 870, A(51, '传播'), { size: 60, col: C.red });
});

// 插头和插座：接口（第 52 行）
cell('plug', (K, t) => {
  const t0 = L0(52) + 0.1, pin = A(52, '接口') - 0.3, q = MO.expoIn(clamp((t - pin) / 0.25)), px = lerp(620, 860, q);
  K.ln(K.rect(1000, 330, 300, 340), t0, 0.4, { w: 8, seed: 4100 }); K.ln(K.ell(1150, 440, 22, 22), t0 + 0.35, 0.1, { w: 6, seed: 4101 }); K.ln(K.ell(1150, 560, 22, 22), t0 + 0.4, 0.1, { w: 6, seed: 4102 });
  K.txt('世界', 1150, 740, t0 + 0.4, { size: 60 });
  K.at(px - 620, 0, 0, 1, () => { K.ln(K.rect(480, 400, 180, 200), t0 + 0.2, 0.3, { w: 8, seed: 4110 }); K.ln([[660, 450], [760, 450]], t0 + 0.45, 0.1, { w: 8, seed: 4111 }); K.ln([[660, 550], [760, 550]], t0 + 0.5, 0.1, { w: 8, seed: 4112 }); K.txt('我们', 570, 500, t0 + 0.5, { size: 50, instant: true }); });
  const cx = px - 620 + 480;
  K.ln(K.smooth([[cx, 500], [cx - 120, 520], [cx - 220, 640], [cx - 330, 700], [cx - 420, 760]]), t0 + 0.3, 0.4, { w: 5, col: C.yel, seed: 4120 });
  for (let i = 0; i < 4; i++) K.ln(K.ell(cx - 100 - i * 100, 540 + i * 70, 22, 22), t0 + 0.5 + i * 0.08, 0.08, { w: 5, col: C.yel, seed: 4130 + i, nopen: true });
  if (t > pin + 0.25) { for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; K.ln([[1000 + Math.cos(a) * 340 - 360, 500 + Math.sin(a) * 340 - 0], [1000 + Math.cos(a) * 400 - 360, 500 + Math.sin(a) * 400]], pin + 0.27, 0.06, { w: 5, col: C.yel, seed: 4140 + i, nopen: true }); } K.txt('接口', 960, 180, pin + 0.3, { size: 90, col: C.yel, instant: true }); }
});

// 手电：一切叙事都是主观的；周围无数剧情（第 53、54 行）
cell('flash', (K, t) => {
  const t0 = L0(53) + 0.1, sw = A(54, '只关注这一个') - 0.1, q = MO.cubicInOut(clamp((t - sw) / 0.5));
  const ang = lerp(-0.62, -0.2, q), ox = 260, oy = 820;
  K.at(ox, oy, ang, 1, () => { K.ln([[-120, -40], [60, -40], [110, -70], [110, 70], [60, 40], [-120, 40], [-120, -40]], t0, 0.4, { w: 7, seed: 4200 }); });
  const L = 1500, sp = 0.17;
  K.hatch([[ox + Math.cos(ang) * 110, oy + Math.sin(ang) * 110], [ox + Math.cos(ang - sp) * L, oy + Math.sin(ang - sp) * L], [ox + Math.cos(ang + sp) * L, oy + Math.sin(ang + sp) * L]], t0 + 0.3, 0.4, { col: C.yel, a: 0.2, gap: 16 });
  K.ln([[ox + Math.cos(ang - sp) * 130, oy + Math.sin(ang - sp) * 130], [ox + Math.cos(ang - sp) * L, oy + Math.sin(ang - sp) * L]], t0 + 0.3, 0, { w: 4, col: C.yel, seed: 4201, nopen: true, a: 0.7 });
  K.ln([[ox + Math.cos(ang + sp) * 130, oy + Math.sin(ang + sp) * 130], [ox + Math.cos(ang + sp) * L, oy + Math.sin(ang + sp) * L]], t0 + 0.3, 0, { w: 4, col: C.yel, seed: 4202, nopen: true, a: 0.7 });
  if (t > A(53, '主观') - 0.05) { const k = MO.slam(t, A(53, '主观')); K.at(1460, 160, 0, k, () => K.txt('主观', 0, 0, A(53, '主观'), { size: 110, col: C.yel, instant: true })); }
  // 无数剧情
  const s0 = A(54, '无数剧情') - 0.3, dim = q > 0.5 ? 0.35 : 1;
  K.ln(K.ell(700, 220, 50, 50), s0, 0.15, { w: 5, seed: 4210, a: dim }); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; K.ln([[700 + Math.cos(a) * 70, 220 + Math.sin(a) * 70], [700 + Math.cos(a) * 95, 220 + Math.sin(a) * 95]], s0 + 0.1, 0.05, { w: 4, seed: 4211 + i, nopen: true, a: dim }); }
  for (let i = 0; i < 3; i++) K.ln(K.smooth([[960, 200 + i * 40], [1040, 185 + i * 40], [1120, 205 + i * 40], [1180, 190 + i * 40]]), s0 + 0.2 + i * 0.05, 0.15, { w: 4, col: C.sub, seed: 4220 + i, nopen: true, a: dim });
  for (let i = 0; i < 9; i++) K.fill(K.ell(1300 + i * 40, 700 + Math.sin(i) * 10, 7, 5), s0 + 0.4 + i * 0.03, { a: 0.8 * dim });
  K.ln([[1600, 520], [1660, 460], [1700, 500], [1760, 400], [1820, 430]], s0 + 0.5, 0.2, { w: 5, col: C.red, seed: 4230, a: dim });
  K.ln(K.rect(560, 560, 110, 190), s0 + 0.6, 0.2, { w: 5, seed: 4231, a: dim }); K.ln([[600, 730], [630, 730]], s0 + 0.7, 0.05, { w: 4, seed: 4232, nopen: true, a: dim });
  // 被照亮的那个：一棵发芽的小苗
  const spx = 1380, spy = 470, g = MO.cubicOut(clamp((t - s0 - 0.3) / 1.2));
  K.ln([[spx - 80, spy + 60], [spx + 80, spy + 60]], s0 + 0.2, 0.1, { w: 5, seed: 4240 });
  K.ln([[spx, spy + 60], [spx, spy + 60 - 120 * g]], s0 + 0.3, 0, { w: 6, seed: 4241, nopen: true, amp: 0.5 });
  if (g > 0.5) { K.ln(K.ell(spx - 34, spy + 60 - 110 * g, 34, 16), s0 + 0.9, 0.12, { w: 5, col: C.yel, seed: 4242, nopen: true }); K.ln(K.ell(spx + 34, spy + 60 - 120 * g, 34, 16), s0 + 1.0, 0.12, { w: 5, col: C.yel, seed: 4243, nopen: true }); }
  K.txt('只关注这一个', 1380, 820, sw + 0.3, { size: 56, col: C.yel });
});

// 半瓶水（第 55 行）
cell('bottle', (K, t) => {
  const t0 = L0(55) + 0.1, wv = Math.sin(t * 2.2) * 10;
  K.ln([[860, 160], [860, 240], [780, 320], [780, 840], [1140, 840], [1140, 320], [1060, 240], [1060, 160]], t0, 0.7, { w: 8, seed: 4300 });
  K.ln(K.rect(850, 120, 220, 40), t0 + 0.6, 0.2, { w: 7, seed: 4301 });
  const lvl = 580;
  K.hatch([[782, lvl + wv], [960, lvl - wv * 0.5], [1138, lvl - wv], [1138, 838], [782, 838]], t0 + 0.6, 0.5, { col: C.ink, a: 0.5, gap: 12 });
  K.ln(Array.from({ length: 20 }, (_, i) => [782 + i * 18.7, lvl + lerp(wv, -wv, i / 19) + Math.sin(i * 0.9 + t * 3) * 3]), t0 + 0.6, 0.3, { w: 5, seed: 4302, nopen: true, amp: 0.6 });
  K.arrow([[1200, 710], [1300, 710]].reverse(), A(55, '满了一半'), 0.2, { w: 6, col: C.yel, seed: 4310 }); K.txt('满一半', 1430, 710, A(55, '满了一半'), { size: 66, col: C.yel });
  K.arrow([[1200, 450], [1300, 450]].reverse(), A(55, '空着一半'), 0.2, { w: 6, col: C.red, seed: 4311 }); K.txt('空一半', 1430, 450, A(55, '空着一半'), { size: 66, col: C.red });
});

// 同一份报表（第 56 行）
cell('report', (K, t) => {
  const t0 = L0(56) + 0.1, two = A(56, '也可以讲成') - 0.1;
  K.ln(K.rect(520, 160, 640, 700), t0, 0.5, { w: 7, seed: 4400 });
  for (let i = 0; i < 2; i++) K.ln([[580, 220 + i * 40], [i ? 900 : 1080, 220 + i * 40]], t0 + 0.4, 0.15, { w: 4, col: C.sub, seed: 4401 + i, nopen: true });
  [180, 260, 330, 420, 500].forEach((h, i) => { K.ln(K.rect(600 + i * 105, 800 - h, 70, h), t0 + 0.6 + i * 0.1, 0.2, { w: 6, seed: 4410 + i }); K.hatch([[600 + i * 105, 800 - h], [670 + i * 105, 800 - h], [670 + i * 105, 800], [600 + i * 105, 800]], t0 + 0.7 + i * 0.1, 0.2, { a: 0.3 }); });
  K.arrow(K.arc3([1220, 700], [1500, 300], -0.2), A(56, '扩张') - 0.6, 0.4, { w: 9, col: C.yel, seed: 4420, head: 36 });
  K.txt('扩张', 1560, 420, A(56, '扩张'), { size: 70, col: C.yel });
  K.ln([[560, 300], [1700, 300]], two, 0.4, { w: 5, col: C.red, dash: [16, 12], seed: 4430 });
  K.txt('股价已经很高', 1460, 250, A(56, '股价'), { size: 44, col: C.red });
  K.arrow([[1620, 400], [1620, 640]], A(56, '别再加仓') - 0.3, 0.3, { w: 9, col: C.red, seed: 4431, head: 36 });
  K.txt('别再加仓', 1620, 720, A(56, '别再加仓'), { size: 60, col: C.red });
});

// 靶子：目标函数（第 57 行）
cell('target', (K, t) => {
  const t0 = L0(57) + 0.1, hit = A(57, '目标函数') - 0.1, q = MO.expoIn(clamp((t - hit + 0.35) / 0.35));
  PR.target(K, 1300, 480, 260, t0);
  K.ln(K.smooth([[200, 700], [380, 640], [520, 680]]), t0 + 0.2, 0.3, { w: 5, col: C.yel, seed: 4500 });
  const ax = lerp(520, 1290, q), ay = lerp(660, 480, q);
  K.at(ax, ay, Math.atan2(480 - 660, 1290 - 520), 1, () => { K.ln([[-220, 0], [0, 0]], t0 + 0.3, 0.2, { w: 7, seed: 4501 }); K.ln([[-30, -20], [0, 0], [-30, 20]], t0 + 0.45, 0.1, { w: 7, seed: 4502 }); K.ln([[-220, 0], [-250, -24]], t0 + 0.5, 0.05, { w: 5, col: C.red, seed: 4503 }); K.ln([[-220, 0], [-250, 24]], t0 + 0.52, 0.05, { w: 5, col: C.red, seed: 4504 }); });
  K.txt('叙事', 370, 760, t0 + 0.3, { size: 56, col: C.yel });
  K.txt('目标函数', 1300, 850, hit + 0.2, { size: 72, col: C.yel });
});

// 别人画的框；跳出来，经验值涨（第 58、60 行）
cell('box', (K, t) => {
  const t0 = L0(58) + 0.1, jp = A(60, '跳出来') - 0.1, q = clamp((t - jp) / 0.6);
  const px = lerp(620, 1180, MO.cubicInOut(q)), py = 640 - Math.sin(q * Math.PI) * 380 + (q >= 1 ? 120 : 0) * 0;
  K.ln(K.rect(380, 300, 480, 420), t0 + 0.4, 0.6, { w: 8, col: C.sub, seed: 4600 });
  for (let i = 0; i < 5; i++) K.ln([[440 + i * 90, 300], [440 + i * 90, 720]], t0 + 0.8 + i * 0.06, 0.15, { w: 5, col: C.sub, seed: 4610 + i, a: 0.8 });
  K.txt('别人的叙事', 620, 220, A(58, '别人设定好的叙事'), { size: 60, col: C.sub });
  PR.pawn(K, px, (q > 0 ? py : 640) + 60, 1.1, t0, { fill: true, nopen: q > 0 });
  // 经验值条
  const xp = A(60, '经验值') - 0.2, xq = MO.cubicOut(clamp((t - xp - 0.3) / 0.9));
  K.ln(K.rect(1000, 820, 600, 50), xp, 0.3, { w: 6, seed: 4620 });
  if (t > xp + 0.3) K.fill([[1004, 824], [1004 + 592 * xq * 0.8, 824], [1004 + 592 * xq * 0.8, 866], [1004, 866]], xp + 0.3, { col: C.yel, a: 0.8 });
  K.txt('经验值', 1300, 760, xp + 0.1, { size: 60, col: C.yel });
});

// 画饼（第 59 行）
cell('pie', (K, t) => {
  const t0 = L0(59) + 0.1;
  K.ln(K.ell(1100, 480, 330, 200, -1.6, -1.6 + Math.PI * 2.03), t0, 0.5, { w: 8, col: C.yel, seed: 4700 });
  K.ln(K.ell(1100, 480, 270, 150), t0 + 0.4, 0.4, { w: 5, col: C.yel, seed: 4701 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; K.ln([[1100, 480], [1100 + Math.cos(a) * 270, 480 + Math.sin(a) * 150]], t0 + 0.7 + i * 0.05, 0.1, { w: 4, col: C.yel, seed: 4710 + i, nopen: true }); }
  for (let k = 0; k < 3; k++) { const ph = t * 1.6 + k * 2; K.ln([0, 1, 2, 3, 4].map(i => [1000 + k * 100 + Math.sin(ph + i) * 12, 260 - i * 28]), t0 + 1.0 + k * 0.1, 0.3, { w: 4, col: C.sub, seed: 4720 + k, nopen: true }); }
  K.txt('画饼', 1100, 820, A(59, '画饼'), { size: 90, col: C.yel });
  // 加班的月亮
  const ov = A(59, '天天加班') - 0.2;
  for (let i = 0; i < 5; i++) { const x = 220 + (i % 3) * 140, y = 330 + Math.floor(i / 3) * 160; K.ln(K.ell(x, y, 46, 46, -1.1, 2.4, 14), ov + i * 0.12, 0.15, { w: 5, seed: 4730 + i }); K.ln(K.ell(x + 24, y - 12, 36, 36, 2.6, 0.2 + Math.PI * 2, 14).filter(p => Math.hypot(p[0] - x, p[1] - y) < 46), ov + i * 0.12 + 0.1, 0.12, { w: 5, seed: 4740 + i, nopen: true }); }
  K.txt('赚大钱', 1100, 480, A(59, '赚大钱'), { size: 76, col: C.yel });
});

// 墙上的门：跳出来（第 61 行）
cell('exit', (K, t) => {
  const t0 = L0(61) + 0.1;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { const x = 160 + c * 180 + (r % 2) * 90, y = 200 + r * 110; if (x > 760 && x < 1160 && y > 250) continue; K.ln(K.rect(x, y, 170, 100), t0 + (r * 9 + c) * 0.008, 0.06, { w: 4, col: C.sub, seed: 4800 + r * 9 + c, nopen: true }); }
  PR.door(K, 820, 330, 280, 430, t0 + 0.4, A(61, '觉醒') - 0.6);
  PR.steps(K, [[980, 820], [1080, 800], [1180, 822], [1280, 800], [1380, 822], [1480, 800]], A(61, '觉醒') - 0.3, 0.12, { col: C.yel });
  K.txt('觉醒', 1560, 140, A(61, '觉醒'), { size: 90, col: C.yel });
});

// 裁判是谁？不玩他们的游戏（第 62 行）
cell('referee', (K, t) => {
  const t0 = L0(62) + 0.1, wp = A(62, '那我们不要玩') - 0.05;
  K.ln(K.rect(260, 220, 560, 300), t0, 0.4, { w: 8, seed: 4900 }); K.txt('？ : ？', 540, 370, A(62, '算好'), { size: 110, col: C.yel, instant: true });
  K.ln(K.smooth([[640, 650], [720, 610], [800, 640], [790, 700], [700, 710], [640, 650]]), A(62, '裁判'), 0.3, { w: 7, seed: 4901 }); K.ln([[790, 640], [880, 620]], A(62, '裁判') + 0.3, 0.1, { w: 7, seed: 4902 });
  K.txt('裁判是谁？', 540, 820, A(62, '裁判'), { size: 60, col: C.yel });
  // 棋盘
  const bx = 1100, by = 240, s = 70;
  for (let i = 0; i <= 8; i++) { K.ln([[bx, by + i * s], [bx + 8 * s, by + i * s]], t0 + 0.4 + i * 0.03, 0.1, { w: 3, col: C.sub, seed: 4910 + i, nopen: true }); K.ln([[bx + i * s, by], [bx + i * s, by + 8 * s]], t0 + 0.45 + i * 0.03, 0.1, { w: 3, col: C.sub, seed: 4920 + i, nopen: true }); }
  const fly = MO.expoOut(clamp((t - wp - 0.3) / 0.7));
  for (let i = 0; i < 6; i++) { const x0 = bx + (1 + i) * s, y0 = by + (i % 2 ? 2 : 6) * s, a = -1.2 + i * 0.5; K.at(x0 + Math.cos(a) * 400 * fly, y0 + Math.sin(a) * 300 * fly - 120 * fly, fly * (i - 2), 0.5, () => PR.pawn(K, 0, 0, 1, t0 + 0.7 + i * 0.05, { nopen: true, seed: 4930 + i * 3, col: i % 2 ? C.red : C.ink })); }
  K.wipe(K.rect(bx - 10, by - 10, 8 * s + 20, 8 * s + 20), wp, { dur: 0.4 });
  K.txt('不玩了', bx + 4 * s, 870, wp + 0.3, { size: 76, col: C.red });
});

// 一支粉笔：叙事权（第 63 行）
cell('chalkpow', (K, t) => {
  const t0 = L0(63) + 0.1;
  K.at(560, 520, -0.5, 1, () => { K.ln(K.rect(-60, -240, 120, 480), t0, 0.5, { w: 8, seed: 5000 }); K.ln(K.ell(0, -240, 60, 18), t0 + 0.4, 0.15, { w: 6, seed: 5001 }); K.hatch([[-56, -236], [56, -236], [56, 236], [-56, 236]], t0 + 0.5, 0.4, { a: 0.25 }); });
  K.txt('设定叙事', 1260, 360, A(63, '设定叙事'), { size: 70 });
  K.txt('叙事权', 1260, 600, A(63, '叙事权'), { size: 150, col: C.yel });
  K.under(1260, 700, 420, A(63, '叙事权') + 0.5);
});

// 线索结构：真实和虚构的珠子串在一根线上；可验证的因果（第 64、65 行）
const BB = [[300, 520], [560, 470], [820, 530], [1080, 470], [1340, 530], [1600, 480]];
cell('beads2', (K, t) => {
  const t0 = L0(64) + 0.1;
  K.ln(K.smooth([[160, 540], ...BB, [1780, 510]]), t0 + 0.2, 1.2, { w: 5, col: C.yel, seed: 5100 });
  BB.forEach(([x, y], i) => { const real = i % 2 === 0; K.ln(K.ell(x, y, 60, 60), t0 + 0.4 + i * 0.25, 0.2, { w: 7, dash: real ? null : [12, 10], seed: 5110 + i }); if (real) K.hatch(K.ell(x, y, 58, 58, 0, Math.PI * 2, 20), A(64, '真实') + 0.2 + (i >> 1) * 0.12, 0.2, { a: 0.25 }); });
  K.txt('真实', 300, 380, A(64, '真实'), { size: 46, col: C.sub }); K.txt('虚构', 560, 330, A(64, '虚构'), { size: 46, col: C.sub });
  K.txt('线索结构', 960, 200, A(64, '线索结构'), { size: 80, col: C.yel });
  const cz = A(65, '因果关系') - 0.4;
  for (let i = 0; i < 5; i++) { const a = BB[i], b = BB[i + 1]; K.arrow([[a[0] + 70, a[1] - 90], [b[0] - 70, b[1] - 90]], cz + i * 0.1, 0.15, { w: 5, col: C.red, head: 16, seed: 5130 + i }); }
  K.ln(K.ell(1340, 530, 110, 110), A(65, '可验证') - 0.2, 0.3, { w: 6, col: C.ink, seed: 5140 }); K.ln([[1420, 610], [1540, 740]], A(65, '可验证'), 0.15, { w: 12, seed: 5141 });
  K.check(1340, 530, 40, A(65, '可验证') + 0.3);
  // 水平仪：校准情绪
  const lv = A(65, '校准情绪') - 0.4, bq = MO.backOut(clamp((t - lv - 0.4) / 0.6));
  K.ln(K.rect(560, 760, 520, 90), lv, 0.3, { w: 6, seed: 5150 }); K.ln([[790, 760], [790, 850]], lv + 0.25, 0.06, { w: 4, seed: 5151 }); K.ln([[850, 760], [850, 850]], lv + 0.28, 0.06, { w: 4, seed: 5152 });
  K.ln(K.ell(lerp(620, 820, bq), 805, 26, 22), lv + 0.3, 0.1, { w: 5, col: C.yel, seed: 5153, nopen: true, amp: 0.3 });
  K.txt('校准', 1200, 805, A(65, '校准'), { size: 56, col: C.yel });
  K.txt('引导行动', 1520, 805, A(65, '引导行动'), { size: 52, col: C.sub });
});

// 住于故事、不囚于故事；以因果织网，以证据收绳（第 66 行）
cell('house', (K, t) => {
  const t0 = L0(66) + 0.1, wv = A(66, '以因果织网') - 0.1, pull = A(66, '收绳') - 0.2, pq = MO.cubicInOut(clamp((t - pull) / 0.5));
  K.ln([[260, 800], [260, 460], [520, 260], [780, 460], [780, 800]], t0, 0.7, { w: 6, col: C.yel, seed: 5200 });
  K.ln([[430, 800], [430, 600], [610, 600], [610, 800]], t0 + 0.5, 0.3, { w: 6, seed: 5201 });
  PR.steps(K, [[640, 820], [720, 800], [800, 822]], A(66, '不囚'), 0.12, { col: C.ink });
  K.txt('住于故事', 520, 180, A(66, '住于故事'), { size: 56, col: C.yel });
  // 网：横竖线织起来，收绳时整张网收紧
  const nx = 1360, ny = 520, S = lerp(1, 0.78, pq);
  for (let i = 0; i < 6; i++) { const y = ny - 250 + i * 100; K.ln([[nx - 260 * S, ny + (y - ny) * S], [nx + 260 * S, ny + (y - ny) * S]], wv + i * 0.06, 0.15, { w: 4, col: C.ink, seed: 5210 + i, nopen: i > 0 }); }
  for (let i = 0; i < 6; i++) { const x = nx - 250 + i * 100; K.ln([[nx + (x - nx) * S, ny - 260 * S], [nx + (x - nx) * S, ny + 260 * S]], wv + 0.35 + i * 0.06, 0.15, { w: 4, col: C.red, seed: 5220 + i, nopen: true }); }
  K.ln(K.smooth([[nx + 260 * S, ny + 260 * S], [nx + 360, ny + 330], [nx + 440, ny + 320]]), pull - 0.1, 0.25, { w: 6, col: C.yel, seed: 5230 });
  K.txt('织网', nx, 180, wv, { size: 56, col: C.red }); K.txt('收绳', nx + 380, 400, pull + 0.1, { size: 56, col: C.yel });
});

// 结尾：横格写字线（语法），粉笔写下「由我选择」，放下粉笔（第 67 行）
cell('end', (K, t) => {
  const t0 = L0(67) + 0.1;
  for (let i = 0; i < 5; i++) K.ln([[260, 280 + i * 120], [1660, 280 + i * 120]], t0 + i * 0.1, 0.4, { w: 3, col: C.sub, seed: 5300 + i, nopen: true });
  K.txt('语法', 360, 230, A(67, '语法'), { size: 56, col: C.sub });
  const wr = A(67, '由我选择') - 0.5;
  K.txt('由我选择', 960, 470, wr, { size: 190, col: C.yel, cps: 5 });
  // 放下的粉笔
  const dn = wr + 1.1, q = MO.cubicOut(clamp((t - dn) / 0.5));
  if (t > dn) K.at(lerp(1400, 1500, q), lerp(470, 800, q), lerp(-0.75, -0.1, q), 1, () => { K.ln(K.rect(-80, -18, 160, 36), dn, 0, { w: 6, seed: 5320, nopen: true }); K.hatch([[-78, -16], [78, -16], [78, 16], [-78, 16]], dn, 0, { a: 0.5 }); });
  K.ln([[200, 840], [1720, 840]], t0 + 0.4, 0.5, { w: 8, seed: 5330 });
});
})();
