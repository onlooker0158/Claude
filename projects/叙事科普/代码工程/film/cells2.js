// 格（第 18–36 行）：时间、因果、观察者、光锥、记账、电影、原子、双缝、引力、死局、塔、灯、AI、自我
(() => {
const { clamp, lerp } = U;
const C = BOARD.C, A = BOARD.at, cell = BOARD.cell;

// 一团乱麻被拉直成时间轴，尽头一只钟（第 18 行）
const MESS = (() => { const r = U.rng(41), o = []; let x = 900, y = 520, a = 0; for (let i = 0; i < 140; i++) { a += (r() - 0.5) * 2.2; x += Math.cos(a) * 34; y += Math.sin(a) * 30; x = clamp(x, 620, 1240); y = clamp(y, 300, 760); o.push([x, y]); } return o; })();
cell('order', (K, t) => {
  const t0 = VO.lines[18].t0 + 0.1, st = A(18, '这就意味着') - 0.2, q = MO.cubicInOut(clamp((t - st) / 0.8));
  const P = MESS.map((p, i) => [lerp(p[0], 260 + i * (1180 / 139), q), lerp(p[1], 560, q)]);
  K.ln(P, t0, 1.2, { w: 6, seed: 1001, amp: q > 0.99 ? 0.6 : 1.8 });
  if (q >= 1) { for (let i = 0; i <= 8; i++) K.ln([[260 + i * 147, 540], [260 + i * 147, 580]], st + 0.8 + i * 0.04, 0.06, { w: 5, seed: 1010 + i, nopen: true }); K.arrow([[1420, 560], [1470, 560]], st + 0.9, 0.1, { w: 6, seed: 1020 }); }
  K.txt('先', 260, 640, st + 1.0, { size: 56, col: C.sub }); K.txt('后', 1420, 640, st + 1.1, { size: 56, col: C.sub });
  const ck = A(18, '时间') - 0.5;
  K.ln(K.ell(1640, 560, 130, 130, -1.6, -1.6 + Math.PI * 2.03), ck, 0.4, { w: 7, seed: 1030 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; K.ln([[1640 + Math.cos(a) * 108, 560 + Math.sin(a) * 108], [1640 + Math.cos(a) * 122, 560 + Math.sin(a) * 122]], ck + 0.3, 0.05, { w: 4, seed: 1040 + i, nopen: true }); }
  const sp = t > ck + 0.5 ? (t - ck - 0.5) : 0;
  K.ln([[1640, 560], [1640 + Math.cos(-1.57 + sp * 6) * 95, 560 + Math.sin(-1.57 + sp * 6) * 95]], ck + 0.45, 0.1, { w: 6, col: C.yel, seed: 1060, nopen: true });
  K.ln([[1640, 560], [1640 + Math.cos(0.5 + sp * 0.5) * 62, 560 + Math.sin(0.5 + sp * 0.5) * 62]], ck + 0.5, 0.1, { w: 7, seed: 1061, nopen: true });
  K.txt('时间', 1640, 770, A(18, '时间'), { size: 72, col: C.yel });
});

// 因果：吃馒头 → 饱；倒过来不行（第 19 行）
cell('cause', (K, t) => {
  const t0 = A(19, '是因为') - 0.3;
  PR.mantou(K, 480, 520, 0.95, VO.lines[19].t0 + 0.2, { bites: [t0 + 0.4] });
  K.arrow([[700, 440], [1180, 440]], A(19, '才饱') - 0.3, 0.35, { w: 8, col: C.yel, seed: 1100, head: 34 });
  K.txt('因', 940, 370, A(19, '才饱') - 0.1, { size: 64, col: C.yel });
  K.txt('饱', 1400, 440, A(19, '才饱'), { size: 200, instant: true });
  const nb = A(19, '而不是');
  K.arrow(K.arc3([1400, 600], [520, 640], 0.18), nb + 0.1, 0.5, { w: 6, col: C.sub, seed: 1101, head: 28 });
  K.cross(960, 720, 60, A(19, '饱了才吃') + 0.2, { seed: 1102 });
});

// 所有观察者：三台望远镜看同一条链（第 20 行前半）
const scope = (K, x, y, ang, at, sd) => { K.at(x, y, ang, 1, () => { K.ln([[-90, -26], [70, -38], [70, 38], [-90, 26], [-90, -26]], at, 0.3, { w: 6, seed: sd }); K.ln([[70, -46], [96, -46], [96, 46], [70, 46]], at + 0.25, 0.15, { w: 6, seed: sd + 1 }); }); K.ln([[x, y + 24], [x - 50, y + 130]], at + 0.35, 0.12, { w: 5, seed: sd + 2 }); K.ln([[x, y + 24], [x + 50, y + 130]], at + 0.4, 0.12, { w: 5, seed: sd + 3 }); };
cell('observers', (K, t) => {
  const t0 = VO.lines[20].t0 + 0.1;
  PR.chain(K, 960, 470, 0.9, t0);
  K.txt('①', 789, 370, t0 + 0.5, { size: 54, col: C.red, instant: true }); K.txt('②', 960, 350, t0 + 0.6, { size: 54, col: C.red, instant: true });
  const ob = A(20, '所有观察者');
  [[300, 260, 0.35], [1640, 250, Math.PI - 0.3], [960, 780, -Math.PI / 2]].forEach(([x, y, a], i) => {
    scope(K, x, y, a, ob + i * 0.35, 1120 + i * 10);
    K.ln([[x + Math.cos(a) * 110, y + Math.sin(a) * 110], [lerp(x, 960, 0.62), lerp(y, 470, 0.62)]], ob + 0.4 + i * 0.35, 0.3, { w: 4, col: C.yel, dash: [10, 12], seed: 1150 + i, nopen: true });
  });
  K.check(1250, 700, 50, A(20, '一致'));
  K.txt('一致', 1390, 712, A(20, '一致') + 0.1, { size: 64, col: C.yel });
});

// 天平乱晃：没法讲理（第 20 行后半）
cell('scale', (K, t) => {
  const t0 = A(20, '不然') - 0.15, sw = t > t0 + 0.7 ? Math.sin((t - t0 - 0.7) * 7) * 0.28 * Math.exp(-(t - t0 - 0.7) * 0.15) : 0;
  K.ln([[960, 860], [960, 330]], t0, 0.3, { w: 8, seed: 1200 }); K.ln([[820, 860], [1100, 860]], t0 + 0.25, 0.12, { w: 8, seed: 1201 });
  K.at(960, 330, sw, 1, () => {
    K.ln([[-420, 0], [420, 0]], t0 + 0.35, 0.25, { w: 8, seed: 1202 });
    for (const sd of [-1, 1]) { const x = sd * 400; K.ln([[x, 0], [x - 90, 220]], t0 + 0.5, 0.12, { w: 4, seed: 1210 + sd }); K.ln([[x, 0], [x + 90, 220]], t0 + 0.5, 0.12, { w: 4, seed: 1220 + sd }); }
  });
  for (const sd of [-1, 1]) { const px = 960 + Math.cos(sw) * sd * 400, py = 330 + Math.sin(sw) * sd * 400 + 220;
    K.ln(K.ell(px, py, 120, 30, 0, Math.PI, 14), t0 + 0.6, 0.15, { w: 6, seed: 1230 + sd });
    K.txt(sd < 0 ? '①②' : '②①', px, py - 40, t0 + 0.75, { size: 60, col: sd < 0 ? C.ink : C.red, instant: true }); }
  K.txt('？！', 960, 180, A(20, '没法讲理'), { size: 120, col: C.yel, instant: true });
});

// 光锥：狭义相对论（第 21 行）
cell('cone', (K, t) => {
  const t0 = VO.lines[21].t0 + 0.1;
  K.arrow([[960, 880], [960, 130]], t0, 0.4, { w: 5, col: C.sub, seed: 1300 }); K.arrow([[460, 520], [1500, 520]], t0 + 0.2, 0.4, { w: 5, col: C.sub, seed: 1301 });
  K.txt('时间', 1040, 140, t0 + 0.4, { size: 46, col: C.sub, instant: true });
  K.ln([[620, 180], [960, 520], [1300, 180]], t0 + 0.5, 0.5, { w: 7, col: C.yel, seed: 1302 }); K.ln([[620, 860], [960, 520], [1300, 860]], t0 + 0.7, 0.5, { w: 7, col: C.yel, seed: 1303 });
  K.ln(K.ell(960, 180, 340, 40), t0 + 0.9, 0.4, { w: 4, col: C.yel, a: 0.7, seed: 1304 });
  PR.iconDoor(K, 960, 720, 0.8, A(21, '因果不变'));
  PR.iconMantou(K, 960, 320, 0.9, A(21, '因果不变') + 0.4);
  K.ln(K.smooth([[960, 790], [940, 640], [975, 520], [950, 400], [960, 330]]), A(21, '因果不变') + 0.6, 0.5, { w: 6, col: C.red, seed: 1305 });
  K.txt('狭义相对论', 1500, 780, A(21, '狭义相对论'), { size: 74, col: C.yel });
});

// 账本：过去确定才能记账、追责；散点里画出规律（第 22 行）
cell('ledger', (K, t) => {
  const t0 = VO.lines[22].t0 + 0.1;
  K.ln(K.rect(220, 180, 560, 640), t0, 0.5, { w: 7, seed: 1400 }); K.ln([[300, 180], [300, 820]], t0 + 0.4, 0.15, { w: 5, col: C.red, seed: 1401 });
  K.txt('过去', 500, 120, A(22, '过去'), { size: 64, col: C.yel });
  const jz = A(22, '记账');
  for (let i = 0; i < 8; i++) { K.ln([[330, 250 + i * 68], [680 - (i * 37 % 120), 250 + i * 68]], jz + i * 0.1, 0.12, { w: 4, col: C.sub, seed: 1410 + i, nopen: true }); K.check(720, 245 + i * 68, 16, jz + 0.15 + i * 0.1, { w: 5 }); }
  K.circle(500, 590, 220, 40, A(22, '追责'), { col: C.red });
  // 规律：散点＋趋势线
  const gx = 1000, gy = 820;
  K.ln([[gx, 200], [gx, gy], [1720, gy]], A(22, '总结规律') - 0.6, 0.4, { w: 6, seed: 1450 });
  const r = U.rng(8); for (let i = 0; i < 14; i++) { const x = gx + 50 + i * 45, y = gy - 60 - i * 34 + (r() - 0.5) * 90; K.fill(K.ell(x, y, 9, 9), A(22, '总结规律') - 0.3 + i * 0.04, { col: C.ink }); }
  K.ln([[gx + 30, gy - 40], [1700, 260]], A(22, '规律'), 0.4, { w: 7, col: C.yel, seed: 1451 });
  K.txt('规律', 1560, 400, A(22, '建立模型'), { size: 64, col: C.yel });
});

// 电影胶片：未来确定的话，生活就是放电影（第 23 行）
cell('film', (K, t) => {
  const t0 = VO.lines[23].t0 + 0.1, roll = t > t0 + 1 ? (t - t0 - 1) * 120 : 0;
  K.ln(K.ell(330, 420, 160, 160), t0, 0.4, { w: 7, seed: 1500 }); K.ln(K.ell(330, 420, 40, 40), t0 + 0.3, 0.1, { w: 6, seed: 1501 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + roll / 160; K.ln(K.ell(330 + Math.cos(a) * 95, 420 + Math.sin(a) * 95, 30, 30), t0 + 0.35 + i * 0.05, 0.08, { w: 5, seed: 1510 + i, nopen: true, amp: 0.3 }); }
  K.ln([[470, 330], [1800, 330]], t0 + 0.5, 0.4, { w: 6, seed: 1520 }); K.ln([[470, 610], [1800, 610]], t0 + 0.55, 0.4, { w: 6, seed: 1521 });
  for (let i = 0; i < 6; i++) { const x = 520 + ((i * 240 - roll) % 1440 + 1440) % 1440; if (x > 1760) continue;
    K.ln(K.rect(x, 360, 200, 220), t0 + 0.8, 0, { w: 5, seed: 1530 + i, nopen: true, amp: 0.5 });
    PR.iconMantou(K, x + 100, 480, 0.7, t0 + 0.8, { nopen: true }); K.txt(String(i + 1), x + 20, 385, t0 + 0.8, { size: 30, col: C.sub, instant: true }); }
  K.txt('毫无悬念', 1100, 760, A(23, '毫无悬念'), { size: 84, col: C.red });
});

// 原子衰变：什么时候？（第 24 行前半）
cell('atom', (K, t) => {
  const t0 = VO.lines[24].t0 + 0.1, dk = A(24, '衰变');
  const r = U.rng(12); for (let i = 0; i < 16; i++) { const a = r() * 7, d = r() * 70; K.ln(K.ell(760 + Math.cos(a) * d, 540 + Math.sin(a) * d, 34, 34), t0 + i * 0.05, 0.12, { w: 5, col: i % 2 ? C.ink : C.red, seed: 1600 + i, nopen: i > 0 }); }
  K.txt('量子力学', 760, 220, A(24, '量子力学'), { size: 70, col: C.yel });
  K.txt('？', 1100, 330, A(24, '什么时候'), { size: 140, col: C.yel, instant: true });
  if (t > dk) { const q = MO.expoOut(clamp((t - dk) / 0.8)); const x = 860 + q * 760, y = 520 - q * 200; K.fill(K.ell(x, y, 22, 22), dk, { col: C.yel }); for (let i = 0; i < 4; i++) K.ln([[x - 40 - i * 50, y + 10 + i * 13], [x - 70 - i * 50, y + 18 + i * 13]], dk, 0, { w: 4, col: C.yel, a: 1 - i * 0.2, nopen: true, seed: 1620 + i }); }
});

// 双缝：光子从哪条缝穿过？发生之后就确定了（第 24 行后半、第 25 行）
cell('slit', (K, t) => {
  const t0 = A(24, '那个光子') - 0.1, hit = A(25, '已经发生');
  K.ln([[1000, 150], [1000, 410]], t0, 0.2, { w: 10, seed: 1700 }); K.ln([[1000, 470], [1000, 610]], t0 + 0.1, 0.12, { w: 10, seed: 1701 }); K.ln([[1000, 670], [1000, 900]], t0 + 0.15, 0.2, { w: 10, seed: 1702 });
  K.ln([[1560, 150], [1560, 900]], t0 + 0.3, 0.3, { w: 6, col: C.sub, seed: 1703 });
  const px = lerp(300, 820, MO.cubicOut(clamp((t - t0 - 0.3) / 0.8)));
  K.fill(K.ell(px, 540, 18, 18), t0 + 0.3, { col: C.yel });
  const off = [hit + 0.1, 0.3];
  K.ln(K.smooth([[840, 540], [1000, 440], [1300, 350], [1550, 330]]), t0 + 1.0, 0.5, { w: 5, col: C.yel, dash: [12, 12], seed: 1710, off });
  K.ln(K.smooth([[840, 540], [1000, 640], [1300, 700], [1550, 720]]), t0 + 1.2, 0.5, { w: 5, col: C.yel, dash: [12, 12], seed: 1711, off });
  K.txt('？', 1660, 330, t0 + 1.6, { size: 90, col: C.yel, instant: true, off }); K.txt('？', 1660, 720, t0 + 1.7, { size: 90, col: C.yel, instant: true, off });
  if (t > hit) { const k = MO.slam(t, hit + 0.15); K.at(1560, 360, 0, Math.max(0.001, k), () => { K.fill(K.ell(0, 0, 30, 30), hit + 0.15, { col: C.yel, a: 1 }); }); K.check(1700, 360, 46, hit + 0.45); K.txt('确定', 1720, 470, A(25, '确定'), { size: 64, col: C.yel }); }
});

// 引力：乱飞的粒子聚成星球，星球上放得住一张桌子和一个馒头（第 26、27 行）
const PARTS = (() => { const r = U.rng(66), o = []; for (let i = 0; i < 90; i++) { const a = r() * 7, d = Math.sqrt(r()) * 190; o.push({ x: 200 + r() * 1520, y: 140 + r() * 700, vx: (r() - 0.5) * 260, vy: (r() - 0.5) * 200, tx: 960 + Math.cos(a) * d, ty: 600 + Math.sin(a) * d }); } return o; })();
const wrap = (v, a, b) => a + (((v - a) % (b - a)) + (b - a)) % (b - a);
cell('gravity', (K, t) => {
  const t0 = VO.lines[26].t0 + 0.1, gq = MO.cubicInOut(clamp((t - A(27, '聚成星球') + 0.3) / 1.0));
  PARTS.forEach((p, i) => { const tt = Math.max(0, t - t0); const fx = wrap(p.x + p.vx * tt, 140, 1780), fy = wrap(p.y + p.vy * tt, 120, 860);
    const x = lerp(fx, p.tx, gq), y = lerp(fy, p.ty, gq);
    K.fill(K.ell(x, y, 7, 7), t0 + i * 0.012, { col: i % 7 ? C.ink : C.yel, a: 0.9 });
    if (gq < 0.05 && t > A(26, '乱飞') - 0.6) K.ln([[x, y], [x - p.vx * 0.12, y - p.vy * 0.12]], t0, 0, { w: 3, col: C.sub, nopen: true, seed: 1800 + i }); });
  K.txt('乱飞', 1560, 200, A(26, '乱飞'), { size: 72, col: C.yel, off: [A(27, '聚成星球'), 0.3] });
  const pl = A(27, '聚成星球') + 0.6;
  K.ln(K.ell(960, 600, 210, 210, -1.8, -1.8 + Math.PI * 2.03), pl, 0.5, { w: 8, seed: 1850 });
  K.hatch(K.ell(960, 600, 205, 205, 0, Math.PI * 2, 40), pl + 0.3, 0.5, { a: 0.18 });
  const sb = A(27, '稳定地存在') - 0.2;
  K.ln([[840, 330], [1080, 330]], sb, 0.15, { w: 6, seed: 1851 }); K.ln([[865, 330], [858, 392]], sb + 0.1, 0.06, { w: 5, seed: 1852 }); K.ln([[1055, 330], [1062, 392]], sb + 0.12, 0.06, { w: 5, seed: 1853 });
  PR.mantou(K, 960, 328, 0.55, sb + 0.2, { w: 5 });
  const gr = A(27, '广义相对论') - 0.4;
  for (let j = 0; j < 3; j++) K.ln(Array.from({ length: 30 }, (_, i) => { const x = 360 + i * 41.4; return [x, 830 + j * 22 - 70 * Math.exp(-((x - 960) ** 2) / 90000) * (1 - j * 0.25) * -1 - 0]; }).map(([x, y]) => [x, y - 0]), gr + j * 0.1, 0.4, { w: 4, col: C.sub, seed: 1860 + j, nopen: true });
  K.txt('广义相对论', 1500, 700, A(27, '广义相对论'), { size: 66, col: C.yel });
});

// 别的宇宙：没有因果的、未来是死局的（第 29 行）
cell('deadend', (K, t) => {
  const t0 = VO.lines[29].t0 + 0.1, nc = A(29, '没有明确的因果'), dd = A(29, '过去不确定');
  K.ln(K.ell(520, 470, 280, 280, -1.6, -1.6 + Math.PI * 2.03), t0, 0.5, { w: 7, seed: 1900 });
  const r = U.rng(4); for (let i = 0; i < 9; i++) { const x = 520 + (r() - 0.5) * 300, y = 470 + (r() - 0.5) * 300, a = r() * 7; K.arrow([[x, y], [x + Math.cos(a) * 110, y + Math.sin(a) * 110]], nc + i * 0.08, 0.12, { w: 5, col: C.sub, head: 18, seed: 1910 + i }); }
  K.txt('没有因果', 520, 820, nc + 0.4, { size: 60, col: C.red });
  K.ln(K.ell(1400, 470, 280, 280, -1.6, -1.6 + Math.PI * 2.03), dd - 0.3, 0.5, { w: 7, seed: 1950 });
  // 迷宫走进死胡同，尽头一把锁
  K.ln([[1220, 600], [1220, 380], [1460, 380], [1460, 540], [1320, 540], [1320, 460]], dd, 0.6, { w: 6, seed: 1951 });
  K.ln([[1580, 300], [1580, 640], [1260, 640]], dd + 0.2, 0.5, { w: 6, seed: 1952 });
  const lk = A(29, '死局');
  K.ln(K.rect(1360, 420, 80, 64), lk, 0.2, { w: 6, col: C.red, seed: 1953 }); K.ln(K.ell(1400, 420, 26, 30, Math.PI, Math.PI * 2, 10), lk + 0.15, 0.1, { w: 6, col: C.red, seed: 1954 });
  K.txt('死局', 1400, 820, lk + 0.2, { size: 60, col: C.red });
});

// 我们这个允许叙事的宇宙（第 30 行）
cell('lucky', (K, t) => {
  const t0 = VO.lines[30].t0 + 0.1;
  K.ln(K.ell(960, 500, 300, 300, -1.6, -1.6 + Math.PI * 2.03), t0, 0.5, { w: 9, col: C.yel, seed: 2000 });
  K.hatch(K.ell(960, 500, 290, 290, 0, Math.PI * 2, 40), t0 + 0.4, 0.5, { col: C.yel, a: 0.16 });
  PR.chain(K, 960, 510, 0.85, t0 + 0.5);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, x = 960 + Math.cos(a) * 400, y = 500 + Math.sin(a) * 340, s = 30; K.ln([[x - s, y], [x + s, y]], A(30, '幸运') + i * 0.06, 0.08, { w: 5, col: C.yel, seed: 2010 + i, nopen: true }); K.ln([[x, y - s], [x, y + s]], A(30, '幸运') + 0.04 + i * 0.06, 0.08, { w: 5, col: C.yel, seed: 2020 + i, nopen: true }); }
  K.txt('允许叙事', 960, 870, A(30, '允许叙事'), { size: 72, col: C.yel });
});

// 塔：叙事垫到物理学下面（第 31 行）
cell('tower', (K, t) => {
  const t0 = VO.lines[31].t0 + 0.1, lift = A(31, '更基本') - 0.2, q = MO.cubicInOut(clamp((t - lift) / 0.6));
  K.ln([[460, 860], [1460, 860]], t0, 0.3, { w: 6, col: C.sub, seed: 2100 });
  const up = q * 170;
  [['生物', 0], ['化学', 1], ['物理', 2]].forEach(([s, i]) => { const y = 860 - 170 - (2 - i) * 170 - up; K.ln(K.rect(760, y, 400, 150), t0 + i * 0.2, 0.35, { w: 7, seed: 2110 + i }); K.txt(s, 960, y + 75, t0 + 0.2 + i * 0.2, { size: 64 }); });
  if (t > lift + 0.4) { const sx = lerp(-500, 0, MO.cubicOut(clamp((t - lift - 0.4) / 0.4))); K.at(sx, 0, 0, 1, () => { K.ln(K.rect(700, 700, 520, 150), lift + 0.4, 0.2, { w: 9, col: C.yel, seed: 2130 }); K.hatch([[700, 700], [1220, 700], [1220, 850], [700, 850]], lift + 0.5, 0.3, { col: C.yel, a: 0.3 }); K.txt('叙事', 960, 775, lift + 0.5, { size: 80, col: C.yel, instant: true }); }); }
  K.txt('第一性原理', 1550, 760, A(31, '第一性原理'), { size: 56, col: C.yel });
  K.arrow([[1420, 760], [1250, 770]], A(31, '第一性原理') + 0.4, 0.2, { w: 5, col: C.yel, seed: 2131 });
});

// 灯：故事绕成一圈，灯就亮了（第 32 行）
cell('lamp', (K, t) => {
  const t0 = VO.lines[32].t0 + 0.1;
  const ring = Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + i / 7 * Math.PI * 2; return [960 + Math.cos(a) * 380, 500 + Math.sin(a) * 300]; });
  K.ln(K.ell(960, 500, 380, 300, -Math.PI / 2, Math.PI * 1.5, 50), t0 + 0.6, 1.4, { w: 5, col: C.yel, seed: 2200 });
  ring.forEach(([x, y], i) => K.ln(K.ell(x, y, 40, 40), t0 + i * 0.12, 0.15, { w: 6, seed: 2210 + i }));
  PR.lamp(K, 960, 640, 1.0, t0 + 0.3, A(32, '你才有意识'));
  K.txt('意识', 960, 380, A(32, '意识') + 0.3, { size: 76, col: C.yel });
});

// AI：训练好就上线，没有经历（第 33 行）
cell('ai', (K, t) => {
  const t0 = VO.lines[33].t0 + 0.1;
  K.ln(K.rect(320, 300, 380, 380), t0, 0.5, { w: 8, seed: 2300 });
  for (let i = 0; i < 5; i++) for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const p = 360 + i * 75; const [x, y] = dx ? [dx < 0 ? 320 : 700, p - 60 + 60] : [p - 60 + 60, dy < 0 ? 300 : 680]; K.ln(dx ? [[x, y], [x + dx * 40, y]] : [[x, y], [x, y + dy * 40]], t0 + 0.4, 0.05, { w: 5, seed: 2310 + i * 4 + dx + dy * 2, nopen: true }); }
  K.txt('AI', 510, 490, t0 + 0.6, { size: 140, font: '"PuHui-Bold"', instant: true });
  const sx = A(33, '上线');
  if (t > sx) { const k = MO.slam(t, sx); K.at(510, 760, -0.08, k, () => { K.ln(K.rect(-120, -40, 240, 80), sx, 0, { w: 6, col: C.red, seed: 2340, nopen: true }); K.txt('上线', 0, 0, sx, { size: 56, col: C.red, instant: true }); }); }
  // 空白日记本
  const dj = A(33, '没有自己的经历');
  K.ln([[1000, 300], [1250, 270], [1250, 680], [1000, 710], [1000, 300]], dj, 0.4, { w: 7, seed: 2350 }); K.ln([[1000, 300], [1500, 330], [1500, 740], [1000, 710]], dj + 0.25, 0.4, { w: 7, seed: 2351 });
  K.txt('？', 1250, 500, A(33, '历史叙事'), { size: 120, col: C.sub, instant: true });
  PR.lamp(K, 1640, 820, 0.6, A(33, '所以') - 0.1, null);
  K.txt('没有意识', 1640, 600, A(33, '没有意识'), { size: 54, col: C.yel });
});

// 自我：故事里的主人公棋子，其实只是一个叙事重心（第 34、35 行）
const PATH = [[260, 640], [480, 560], [720, 610], [960, 520], [1200, 600], [1440, 530], [1660, 600]];
cell('self', (K, t) => {
  const t0 = VO.lines[34].t0 + 0.1, ent = A(35, '实体');
  K.ln(K.smooth(PATH), t0 + 0.2, 0.9, { w: 5, col: C.yel, seed: 2400 });
  PATH.forEach(([x, y], i) => { if (i % 2 === 0) K.ln(K.ell(x, y, 36, 36), t0 + 0.1 + i * 0.1, 0.12, { w: 6, seed: 2410 + i }); });
  K.txt('自我', 960, 160, A(34, '自我'), { size: 80, col: C.yel });
  const pw = A(34, '主人公') - 0.3;
  K.txt('讲述者', 560, 380, A(34, '讲述者'), { size: 50, col: C.sub }); K.txt('主人公', 1360, 380, A(34, '主人公'), { size: 50, col: C.sub });
  PR.pawn(K, 960, 500, 1.3, pw, { fill: true, off: [ent, 0.4] });
  if (t > ent) PR.pawn(K, 960, 500, 1.3, ent, { dash: [10, 12], col: C.sub, dur: 0 });
  // 重心符号 ⊕
  const cg = A(35, '叙事重心') - 0.3;
  K.ln(K.ell(960, 380, 40, 40), cg, 0.2, { w: 6, col: C.yel, seed: 2450 });
  K.hatch([[960, 340], [1000, 380], [960, 380]].concat(K.ell(960, 380, 40, 40, -Math.PI / 2, 0, 8)), cg + 0.2, 0.15, { col: C.yel, a: 0.9, gap: 6 });
  K.hatch([[960, 420], [920, 380], [960, 380]].concat(K.ell(960, 380, 40, 40, Math.PI / 2, Math.PI, 8)), cg + 0.3, 0.15, { col: C.yel, a: 0.9, gap: 6 });
  K.txt('叙事重心', 1400, 250, A(35, '叙事重心'), { size: 76, col: C.yel }); K.arrow(K.arc3([1260, 280], [1010, 370], 0.2), A(35, '叙事重心') + 0.4, 0.25, { w: 5, col: C.yel, seed: 2460 });
});
// 不是「我」→叙事，是叙事→「我」（第 36 行）
cell('arrowme', (K, t) => {
  const t0 = VO.lines[36].t0 + 0.1, b = A(36, '我"是因为') - 0.2;
  K.txt('我', 620, 360, t0, { size: 130, instant: true }); K.arrow([[720, 360], [1080, 360]], t0 + 0.3, 0.3, { w: 7, seed: 2500 }); K.txt('叙事', 1260, 360, t0 + 0.6, { size: 110, instant: true });
  K.cross(900, 360, 70, A(36, '而存在') - 0.1, { seed: 2501 });
  K.txt('叙事', 620, 660, b, { size: 110, col: C.yel, instant: true }); K.arrow([[760, 660], [1100, 660]], b + 0.3, 0.3, { w: 8, col: C.yel, seed: 2502 }); K.txt('我', 1260, 660, b + 0.6, { size: 140, col: C.yel, instant: true });
  K.check(1440, 680, 50, b + 0.9);
});
})();
