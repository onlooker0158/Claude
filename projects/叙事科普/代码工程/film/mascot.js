// 账号形象：三个方向（粉笔君 / 馒博士 / 板板），都从《叙事》那支片子里长出来。1080×1080 画布。
(() => {
const { clamp, lerp } = U;
const C = { bg: '#23302B', surface: '#2E3D37', ink: '#F1EFE6', sub: '#A9B3AA', yel: '#F4D35E', red: '#E87D5A', dark: '#1B1A17', wood: '#B98A5A', woodD: '#8E6440', paper: '#EDE3D1' };
const S = 1080;
const P = (pts) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
const sm = (pts, per = 8) => KIT.densify(pts.concat([pts[0]]), per);
const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const wob = (pts, seed, amp = 1.6) => KIT.resample(pts, 5).map(([x, y], i) => [x + PAINT.noise(i * 0.19 + seed, 3.1) * amp, y + PAINT.noise(i * 0.19 + 70 + seed, 8.7) * amp]);
// 粉笔描边：两道，像笔压不匀
const chalk = (c, pts, col = C.ink, w = 6, seed = 1, closed = false) => {
  const Q = wob(closed ? pts.concat([pts[0]]) : pts, seed);
  c.save(); c.strokeStyle = col; c.lineCap = c.lineJoin = 'round'; c.lineWidth = w; c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
  c.globalAlpha = 0.45; c.lineWidth = w * 0.5; c.translate(1.2, -1); c.stroke(); c.restore();
};
// 平涂＋暗面＋高光（暗面＝把形状平移后与原形状求交）
const body = (c, path, fill, shadeCol, dx, dy, hi) => {
  c.save(); c.fillStyle = fill; c.fill(path); c.clip(path);
  c.translate(dx, dy); c.fillStyle = shadeCol; c.globalCompositeOperation = 'source-atop';
  c.restore();
  c.save(); c.clip(path); c.fillStyle = shadeCol; c.translate(dx, dy); c.fill(new Path2D(path)); c.restore();
  c.save(); c.clip(path); c.globalCompositeOperation = 'source-over'; c.fillStyle = fill; c.translate(-dx * 0.0, 0); c.restore();
  if (hi) { c.save(); c.clip(path); c.fillStyle = hi.col; c.globalAlpha = hi.a ?? 0.8; c.beginPath(); c.ellipse(hi.x, hi.y, hi.rx, hi.ry, hi.r || 0, 0, 7); c.fill(); c.restore(); }
};
// 一块形状：底色 fill，按 (sx,sy) 方向留出亮面，其余压一层暗色
const shaded = (c, path, fill, dark, sx, sy) => {
  c.save(); c.clip(path); c.fillStyle = dark; c.fillRect(-2000, -2000, 6000, 6000);
  c.translate(sx, sy); c.fillStyle = fill; c.fill(path); c.restore();
};
// 粉笔颗粒：在给定区域里打细小的孔（材质）
const grain = (c, path, a = 0.22, seed = 3) => { const r = U.rng(seed); c.save(); c.clip(path); c.fillStyle = `rgba(35,48,43,${a})`; for (let i = 0; i < 2600; i++) { const x = r() * S, y = r() * S; c.fillRect(x, y, 1 + r() * 2, 1 + r() * 1.5); } c.restore(); };
const ghost = (c, col = C.sub, a = 0.08) => { const r = U.rng(41), w = ['E = mc²', '∫ f dx', 'Δt', 'sin θ', 'a + b = c', 'λ', 'π r²', 'dy/dx', '∞', '√2']; c.save(); c.fillStyle = col; c.textAlign = 'center'; for (let i = 0; i < 26; i++) { c.globalAlpha = a + r() * 0.05; c.font = `${36 + r() * 46 | 0}px "CMU-it"`; c.fillText(w[(r() * w.length) | 0], r() * S, r() * S); } c.restore(); };
const boardBg = (c) => { c.fillStyle = C.bg; c.fillRect(0, 0, S, S); const t = CL.paperTile('mascot_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(t, 'repeat'); c.fillRect(0, 0, S, S); ghost(c);
  const r = U.rng(5); c.save(); c.strokeStyle = C.sub; for (let i = 0; i < 160; i++) { c.globalAlpha = 0.1 + r() * 0.2; c.lineWidth = 2 + r() * 2; const x = r() * S, y = r() * S, a = r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); c.stroke(); } c.restore(); };
// 眼睛：杏仁眼＋瞳孔＋两点高光；look 往哪看；lid 上眼皮压下比例
const eye = (c, x, y, rx, ry, look = [0, 0], lid = 0, col = C.dark) => {
  const E = P(ell(x, y, rx, ry, 0, Math.PI * 2, 40));
  c.save(); c.fillStyle = '#FFFDF7'; c.fill(E); c.clip(E);
  c.fillStyle = col; c.beginPath(); c.ellipse(x + look[0] * rx * 0.35, y + look[1] * ry * 0.3 + ry * 0.08, rx * 0.62, ry * 0.7, 0, 0, 7); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + look[0] * rx * 0.35 - rx * 0.22, y - ry * 0.2, rx * 0.2, 0, 7); c.fill(); c.beginPath(); c.arc(x + look[0] * rx * 0.35 + rx * 0.18, y + ry * 0.22, rx * 0.09, 0, 7); c.fill();
  if (lid > 0) { c.fillStyle = 'rgba(0,0,0,0)'; }
  c.restore();
  c.save(); c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.restore();
};

// ===================== A 粉笔君：一截立着的粉笔，正在往空中写一支黄箭头 =====================
SCENES.mascotA = { draw(c) {
  boardBg(c);
  // 板槽
  c.fillStyle = C.woodD; c.fillRect(0, 930, S, 150); c.fillStyle = C.wood; c.fillRect(0, 918, S, 26); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 944, S, 8);
  c.fillStyle = 'rgba(241,239,230,.25)'; for (let i = 0; i < 40; i++) { const x = 120 + i * 22; c.fillRect(x, 924 + (i % 3) * 4, 6, 3); }
  // 地上的影子
  c.save(); c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(560, 925, 210, 18, 0, 0, 7); c.fill(); c.restore();
  c.save(); c.translate(540, 560); c.rotate(-0.07);
  // 腿和鞋
  for (const sx of [-60, 60]) { c.fillStyle = '#E6E1D3'; c.fillRect(sx - 20, 300, 40, 50); c.strokeStyle = C.dark; c.lineWidth = 5; c.strokeRect(sx - 20, 300, 40, 50);
    const shoe = P(sm([[sx - 44, 395], [sx - 40, 352], [sx + 30, 346], [sx + 62, 372], [sx + 58, 395]], 6)); c.fillStyle = C.red; c.fill(shoe); shaded(c, shoe, C.red, '#B4553C', -6, -8); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(shoe); c.fillStyle = '#FFFDF7'; c.fillRect(sx - 40, 384, 96, 9); chalk(c, [[sx - 6, 360], [sx + 18, 366]], C.dark, 3, 9 + sx); }
  // 身体：圆柱
  const B = new Path2D(); B.roundRect(-150, -330, 300, 650, [150, 150, 40, 40]);
  shaded(c, B, '#F7F4EB', '#D8D2C2', -40, 0);
  c.save(); c.clip(B); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-112, -250, 26, 520); c.restore();
  // 磨秃的头顶：一个斜面＋黄粉
  c.save(); c.clip(B); c.fillStyle = '#E9E4D6'; c.beginPath(); c.ellipse(-10, -300, 140, 46, -0.25, 0, 7); c.fill(); c.fillStyle = 'rgba(244,211,94,.55)'; c.beginPath(); c.ellipse(20, -306, 70, 20, -0.25, 0, 7); c.fill(); c.restore();
  // 圆柱上的细横纹（粉笔压出来的棱）
  c.save(); c.clip(B); c.strokeStyle = 'rgba(160,150,130,.35)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = -200 + i * 58; c.beginPath(); c.ellipse(0, y, 150, 10, 0, 0.1, Math.PI - 0.1); c.stroke(); } c.restore();
  grain(c, B, 0.18, 4);
  // 纸套：黄色，撕边，写着「叙事」
  const sleeve = P(wob([[-152, 120], [152, 108], [154, 280], [-154, 292]], 7, 4).concat([]));
  c.save(); c.clip(B); c.fillStyle = C.yel; c.fill(sleeve); shaded(c, sleeve, C.yel, '#C9A842', -40, 0); c.restore();
  c.save(); c.clip(B); c.strokeStyle = C.dark; c.lineWidth = 5; c.stroke(sleeve); c.restore();
  c.save(); c.translate(0, 205); c.rotate(-0.04); c.fillStyle = C.dark; c.font = '88px "PuHui-Black"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('叙事', 0, 0); c.restore();
  c.lineWidth = 7; c.strokeStyle = C.dark; c.stroke(B);
  // 脸
  eye(c, -58, -120, 40, 52, [0.6, -0.5]); eye(c, 62, -124, 40, 52, [0.6, -0.5]);
  chalk(c, [[-96, -196], [-60, -206], [-26, -196]], C.dark, 8, 21); chalk(c, [[30, -212], [66, -226], [100, -210]], C.dark, 8, 22);
  const M = P(sm([[-30, -38], [34, -44], [24, -6], [0, 6], [-22, -6]], 6)); c.fillStyle = '#3A2420'; c.fill(M); c.save(); c.clip(M); c.fillStyle = C.red; c.beginPath(); c.ellipse(4, 6, 22, 14, 0, 0, 7); c.fill(); c.restore(); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(M);
  // 左手叉腰
  const armL = [[-150, 30], [-210, 60], [-178, 120], [-150, 110]];
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.dark; c.lineWidth = 34; c.beginPath(); c.moveTo(...armL[0]); c.lineTo(...armL[1]); c.lineTo(...armL[2]); c.stroke(); c.strokeStyle = '#EDE9DD'; c.lineWidth = 24; c.stroke();
  // 右手高举，食指指向空中
  c.strokeStyle = C.dark; c.lineWidth = 34; c.beginPath(); c.moveTo(150, -20); c.lineTo(250, -110); c.lineTo(300, -250); c.stroke(); c.strokeStyle = '#EDE9DD'; c.lineWidth = 24; c.stroke();
  const hand = P(sm([[278, -258], [300, -300], [318, -330], [336, -318], [326, -282], [344, -270], [336, -238], [296, -226]], 5)); c.fillStyle = '#EDE9DD'; c.fill(hand); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(hand);
  c.restore();
  // 指尖写出的黄箭头（世界坐标）
  const trail = KIT.densify([[930, 190], [860, 110], [760, 90], [640, 120], [560, 110]], 8);
  chalk(c, trail, C.yel, 12, 31); chalk(c, [[592, 86], [556, 110], [594, 140]], C.yel, 12, 32);
  // 粉笔灰
  const r = U.rng(11); c.fillStyle = 'rgba(241,239,230,.7)'; for (let i = 0; i < 26; i++) { const a = r() * 7, d = 20 + r() * 60; c.globalAlpha = 0.3 + r() * 0.5; c.beginPath(); c.arc(870 + Math.cos(a) * d, 200 + Math.sin(a) * d, 2 + r() * 4, 0, 7); c.fill(); } c.globalAlpha = 1;
} };

// ===================== B 馒博士：咬过一口的馒头，戴圆眼镜，捧着一本故事书 =====================
SCENES.mascotB = { draw(c) {
  boardBg(c);
  // 地上的故事链：门 → （他自己）→ 饱
  chalk(c, [[90, 930], [990, 930]], C.sub, 5, 2);
  chalk(c, [[110, 900], [110, 760], [190, 760], [190, 900]], C.ink, 6, 3); c.fillStyle = C.ink; c.beginPath(); c.arc(172, 830, 6, 0, 7); c.fill();
  chalk(c, [[215, 830], [290, 830]], C.yel, 7, 4); chalk(c, [[272, 814], [292, 830], [272, 846]], C.yel, 7, 5);
  chalk(c, [[800, 830], [870, 830]], C.yel, 7, 6); chalk(c, [[852, 814], [872, 830], [852, 846]], C.yel, 7, 7);
  c.save(); c.fillStyle = C.ink; c.font = '110px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('饱', 945, 830); c.restore();
  // 影子
  c.save(); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(545, 905, 250, 22, 0, 0, 7); c.fill(); c.restore();
  // 脚
  for (const sx of [-80, 80]) { const f = P(sm([[530 + sx - 46, 900], [530 + sx - 40, 868], [530 + sx + 34, 864], [530 + sx + 56, 900]], 6)); c.fillStyle = C.red; c.fill(f); shaded(c, f, C.red, '#B4553C', 0, -8); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(f); }
  // 身体：馒头穹顶
  const dome = []; for (let i = 0; i <= 60; i++) { const a = Math.PI + i / 60 * Math.PI; dome.push([540 + Math.cos(a) * 290, 870 + Math.sin(a) * 360 * (1 - 0.05 * Math.cos(a * 2))]); }
  dome.push([830, 870], [250, 870]);
  // 咬掉一口（右肩）
  const biteC = [[812, 610, 70], [836, 700, 62]];
  const Bd = new Path2D(); dome.forEach((p, i) => i ? Bd.lineTo(...p) : Bd.moveTo(...p)); Bd.closePath();
  const off = PAINT.canvas(S, S), g = off.getContext('2d');
  shaded(g, Bd, '#FBF6EA', '#E0D0B4', -50, -30);
  g.save(); g.clip(Bd); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(430, 610, 80, 44, -0.5, 0, 7); g.fill(); g.restore();
  grain(g, Bd, 0.12, 6);
  g.lineWidth = 7; g.strokeStyle = C.dark; g.stroke(Bd);
  g.save(); g.globalCompositeOperation = 'destination-out'; for (const [x, y, r] of biteC) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore();
  g.save(); g.clip(Bd); g.strokeStyle = C.dark; g.lineWidth = 7; for (const [x, y, r] of biteC) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); } g.restore();
  // 咬口里的面心（浅色、带气孔）
  g.save(); g.clip(Bd); g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#EFE3C8'; for (const [x, y, r] of biteC) { g.beginPath(); g.arc(x - 6, y, r - 2, 0, 7); g.fill(); } g.restore();
  c.drawImage(off, 0, 0);
  c.fillStyle = 'rgba(160,130,90,.55)'; [[768, 618], [780, 650], [796, 690], [772, 676]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
  // 头顶的褶：一个旋儿
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.32; chalk(c, KIT.densify([[540 + Math.cos(a) * 18, 530 + Math.sin(a) * 14], [540 + Math.cos(a + 0.4) * 50, 530 + Math.sin(a + 0.4) * 34], [540 + Math.cos(a + 0.8) * 80, 540 + Math.sin(a + 0.8) * 46]], 4), '#A99677', 5, 40 + k); }
  // 眼镜＋眼睛
  eye(c, 455, 680, 36, 44, [0.2, 0.3]); eye(c, 625, 680, 36, 44, [0.2, 0.3]);
  c.save(); c.strokeStyle = C.dark; c.lineWidth = 9; for (const x of [455, 625]) { c.beginPath(); c.arc(x, 682, 66, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(521, 676); c.quadraticCurveTo(540, 662, 559, 676); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; for (const x of [455, 625]) { c.beginPath(); c.arc(x, 682, 50, -2.4, -1.7); c.stroke(); } c.restore();
  chalk(c, [[405, 596], [455, 586], [500, 600]], C.dark, 7, 51); chalk(c, [[580, 600], [625, 586], [672, 596]], C.dark, 7, 52);
  // 嘴：微笑
  chalk(c, [[505, 770], [540, 790], [578, 768]], C.dark, 7, 53);
  // 手里的故事书（翻开，书页上画着那条小路）
  const bk = P([[400, 790], [540, 770], [680, 790], [680, 880], [540, 862], [400, 880]]); c.fillStyle = '#FFFDF6'; c.fill(bk); shaded(c, bk, '#FFFDF6', '#E8DFCC', 0, -10); c.lineWidth = 6; c.strokeStyle = C.dark; c.stroke(bk);
  chalk(c, [[540, 772], [540, 862]], C.dark, 5, 61);
  chalk(c, KIT.densify([[420, 850], [460, 820], [500, 836], [520, 806]], 5), C.red, 4, 62); chalk(c, KIT.densify([[560, 840], [600, 812], [640, 826], [662, 796]], 5), C.red, 4, 63);
  chalk(c, [[662, 796], [662, 768], [684, 776], [662, 784]], C.red, 4, 64);
  for (const sx of [-1, 1]) { const hx = 540 + sx * 150; const h = P(sm([[hx - 30, 830], [hx - 20, 800], [hx + 22, 800], [hx + 32, 834], [hx + 10, 860], [hx - 20, 858]], 5)); c.fillStyle = '#F4ECDA'; c.fill(h); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(h); }
  // 热气
  for (let k = 0; k < 3; k++) chalk(c, KIT.densify(Array.from({ length: 6 }, (_, i) => [470 + k * 70 + Math.sin(i * 1.1 + k) * 14, 470 - i * 34]), 3), C.sub, 5, 70 + k);
} };

// ===================== C 板板：一块小黑板，脸用粉笔画在板面上，可以随时擦了重画 =====================
SCENES.mascotC = { draw(c) {
  // 墙：暖纸色
  c.fillStyle = C.paper; c.fillRect(0, 0, S, S); const t = CL.paperTile('mascot_wall', C.paper, { size: 512, amt: 8, fibers: 160, grain: 8, seed: 3 }); c.fillStyle = c.createPattern(t, 'repeat'); c.fillRect(0, 0, S, S);
  c.fillStyle = 'rgba(120,90,60,.10)'; c.fillRect(0, 900, S, 180);
  // 影子
  c.save(); c.fillStyle = 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(540, 1000, 330, 24, 0, 0, 7); c.fill(); c.restore();
  // 画架腿
  const leg = (pts, col) => { const p = P(pts); c.fillStyle = col; c.fill(p); c.lineWidth = 6; c.strokeStyle = C.dark; c.stroke(p); };
  leg([[300, 760], [336, 760], [262, 1000], [226, 1000]], C.woodD); leg([[744, 760], [780, 760], [854, 1000], [818, 1000]], C.woodD); leg([[524, 760], [556, 760], [560, 980], [522, 980]], C.wood);
  // 鞋
  for (const [x, f] of [[244, -1], [836, 1]]) { const s = P(sm([[x - 46, 1004], [x - 36, 976], [x + 30, 974], [x + 52, 1004]], 5)); c.fillStyle = C.red; c.fill(s); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(s); }
  // 木框
  const F = new Path2D(); F.roundRect(190, 170, 700, 560, 26);
  shaded(c, F, C.wood, C.woodD, -10, -10); c.lineWidth = 7; c.strokeStyle = C.dark; c.stroke(F);
  c.save(); c.clip(F); c.strokeStyle = 'rgba(90,55,25,.35)'; c.lineWidth = 3; for (let i = 0; i < 14; i++) { c.beginPath(); const y = 180 + i * 40; c.moveTo(190, y); c.bezierCurveTo(400, y + 10, 600, y - 12, 890, y + 6); c.stroke(); } c.restore();
  // 板面
  const Bd = new Path2D(); Bd.rect(232, 212, 616, 476);
  c.save(); c.fillStyle = C.bg; c.fill(Bd); c.clip(Bd); const bt = CL.paperTile('mascot_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(bt, 'repeat'); c.fillRect(232, 212, 616, 476);
  c.fillStyle = 'rgba(169,179,170,.07)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(300 + i * 100, 300 + (i % 3) * 120, 140, 30, 0.2, 0, 7); c.fill(); }
  c.restore(); c.lineWidth = 6; c.strokeStyle = C.dark; c.stroke(Bd);
  // 板面上的脸（粉笔画）
  c.save(); c.clip(Bd);
  const cEye = (x, y) => { chalk(c, ell(x, y, 46, 58, 0, Math.PI * 2, 40), C.ink, 8, x, true); c.fillStyle = C.ink; c.beginPath(); c.ellipse(x + 12, y + 8, 22, 28, 0, 0, 7); c.fill(); c.fillStyle = C.bg; c.beginPath(); c.arc(x + 4, y - 4, 7, 0, 7); c.fill(); };
  cEye(450, 420); cEye(630, 420);
  chalk(c, [[392, 330], [446, 318], [496, 334]], C.ink, 9, 81); chalk(c, [[584, 330], [634, 316], [690, 326]], C.ink, 9, 82);
  chalk(c, KIT.densify([[470, 540], [540, 590], [612, 538]], 6), C.ink, 9, 83);
  chalk(c, [[540, 470], [528, 506], [550, 506]], C.ink, 6, 84);
  // 角落里的那条故事链和 ⊕
  c.globalAlpha = 0.9; chalk(c, [[270, 640], [270, 600], [298, 600], [298, 640]], C.yel, 4, 85); chalk(c, [[310, 622], [340, 622]], C.yel, 4, 86); chalk(c, ell(372, 630, 24, 22, Math.PI, Math.PI * 2, 14).concat([[348, 630]]), C.yel, 4, 87); chalk(c, [[404, 622], [434, 622]], C.yel, 4, 88);
  c.fillStyle = C.yel; c.font = '40px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('饱', 462, 624);
  chalk(c, ell(790, 268, 26, 26, 0, Math.PI * 2, 30), C.yel, 5, 89, true); c.globalAlpha = 1;
  c.restore();
  // 粉笔槽：一截粉笔、一块板擦
  const tray = P([[210, 730], [870, 730], [880, 764], [200, 764]]); c.fillStyle = C.woodD; c.fill(tray); c.lineWidth = 6; c.strokeStyle = C.dark; c.stroke(tray);
  const er = new Path2D(); er.roundRect(640, 694, 150, 40, 8); c.fillStyle = '#2F5D62'; c.fill(er); c.fillStyle = '#C9C4B6'; c.fillRect(640, 722, 150, 12); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(er);
  // 手臂：从木框两侧伸出；右手捏着粉笔举起
  c.lineCap = 'round'; c.lineJoin = 'round';
  const arm = (pts) => { c.strokeStyle = C.dark; c.lineWidth = 32; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); c.strokeStyle = C.wood; c.lineWidth = 22; c.stroke(); };
  arm([[190, 520], [120, 600], [140, 690]]); arm([[890, 470], [980, 380], [970, 270]]);
  const mitt = (x, y, r) => { const m = P(sm([[x - 30, y + 10], [x - 26, y - 26], [x + 6, y - 38], [x + 30, y - 18], [x + 30, y + 16], [x, y + 32]], 5)); c.save(); c.translate(x, y); c.rotate(r); c.translate(-x, -y); c.fillStyle = '#F4ECDA'; c.fill(m); c.lineWidth = 5; c.strokeStyle = C.dark; c.stroke(m); c.restore(); };
  mitt(142, 700, 0.3);
  c.save(); c.translate(968, 230); c.rotate(0.35); c.fillStyle = '#F7F4EB'; c.fillRect(-12, -70, 24, 74); c.lineWidth = 4; c.strokeStyle = C.dark; c.strokeRect(-12, -70, 24, 74); c.fillStyle = C.yel; c.fillRect(-12, -70, 24, 10); c.restore();
  mitt(968, 262, -0.2);
} };
})();
