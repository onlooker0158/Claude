// 三方向样帧：同一句「因为吃了馒头才饱」，三种画风、三种构图。
(() => {
const { clamp, lerp } = U;
const C = NK.C;

// A 纸本插画：侧面平视桌面，手举着咬过的馒头，桌上便条写「吃 → 饱」
SCENES.dirA = { draw(c, lt) {
  const t = lt;
  NK.paper(c, C.wall, 'wall');
  // 窗光
  c.save(); c.fillStyle = 'rgba(255,240,205,.55)'; c.beginPath(); c.moveTo(220, 0); c.lineTo(720, 0); c.lineTo(1100, 760); c.lineTo(420, 760); c.fill(); c.restore();
  NK.table(c, 760, { t });
  NK.plate(c, 760, 742, 1.05, { t });
  NK.mantou(c, 700, 735, 0.9, { t, seed: 3 });
  // 便条
  c.save(); c.translate(1400, 800); c.rotate(-0.05);
  NK.drop(c, () => { c.fillStyle = C.surface; c.fillRect(-190, -60, 380, 150); }, { x: 4, y: 6 });
  NK.text(c, '吃', -110, 18, { size: 72 }); NK.text(c, '饱', 120, 18, { size: 72 });
  NK.arrow(c, [[-60, 18], [70, 18]], 1, { line: C.red, w: 5, head: 20 });
  c.restore();
  NK.hand(c, 1360, 470, 1.1, { ang: -0.45, grip: 0.7, t, mid: c => NK.mantou(c, 1215, 620, 0.85, { t, bite: 0.8, seed: 9 }) });
  NK.grainOver(c, 0.45);
} };

// B 黑板粉笔：一整块黑板，粉笔画馒头、箭头、肚子的轮廓线（不画脸），右下一只手捏着粉笔
const chalk = (c, pts, { col = '#F1EFE6', w = 7, seed = 1, q = 1, t = 0 } = {}) => {
  const P = NK.partial(pts, q); if (P.length < 2) return;
  for (let k = 0; k < 3; k++) NK.line(c, P, { line: col, w: w * (1 - k * 0.25), seed: seed + k * 7, t, amp: 2.2, alpha: 0.42 });
};
SCENES.dirB = { draw(c, lt) {
  const t = lt;
  c.fillStyle = '#23302B'; c.fillRect(0, 0, 1920, 1080);
  // 板面擦痕
  c.save(); c.globalAlpha = 0.08; c.strokeStyle = '#A9B3AA'; c.lineWidth = 60; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-100, 200 + k * 150); c.bezierCurveTo(600, 120 + k * 160, 1300, 300 + k * 120, 2000, 180 + k * 150); c.stroke(); } c.restore();
  // 木框与粉笔槽
  c.fillStyle = '#8E6440'; c.fillRect(0, 0, 1920, 28); c.fillRect(0, 1010, 1920, 70); c.fillStyle = '#6E4C30'; c.fillRect(0, 1000, 1920, 14);
  // 馒头（粉笔轮廓）
  const dome = NK.ell(520, 560, 210, 170, Math.PI, Math.PI * 2, 40).concat([[730, 560], [310, 560]]);
  chalk(c, dome.concat([dome[0]]), { seed: 2, t, w: 9 });
  for (let k = 0; k < 7; k++) chalk(c, [[360 + k * 50, 520 - Math.sin(k / 6 * Math.PI) * 90], [380 + k * 50, 540]], { col: '#F4D35E', w: 4, seed: 30 + k, t });
  NK.text(c, '吃了馒头', 520, 680, { size: 64, col: '#F1EFE6', alpha: 0.9 });
  // 箭头
  chalk(c, [[800, 480], [960, 450], [1110, 480]], { col: '#F4D35E', w: 10, seed: 5, t });
  chalk(c, [[1080, 445], [1112, 481], [1072, 510]], { col: '#F4D35E', w: 10, seed: 6, t });
  NK.text(c, '因', 955, 400, { size: 70, col: '#F4D35E' });
  // 饱：一个圆滚滚的肚皮轮廓＋腰带
  chalk(c, NK.ell(1420, 520, 190, 190, -Math.PI * 0.4, Math.PI * 1.4, 50), { seed: 9, t, w: 9 });
  chalk(c, [[1250, 600], [1590, 600]], { seed: 10, t, w: 8, col: '#E87D5A' });
  NK.text(c, '所以饱了', 1420, 790, { size: 64, col: '#F1EFE6', alpha: 0.9 });
  NK.text(c, '果', 1420, 300, { size: 70, col: '#F4D35E' });
  NK.text(c, '不能倒过来', 960, 930, { size: 46, col: '#A9B3AA' });
  // 手捏粉笔（右下入画）
  c.save(); c.translate(1500, 1004); c.rotate(-0.04); c.fillStyle = '#F1EFE6'; c.fillRect(-60, -16, 120, 22); c.fillStyle = '#F4D35E'; c.fillRect(90, -14, 90, 20); c.restore();
} };

// C 剪纸拼贴：俯拍，黄色海报底，剪纸馒头（俯视螺纹）、红线把「吃」「饱」两张标签串起来
const cut = (c, pts, fill, seed, dx = 7, dy = 9) => { c.save(); c.shadowColor = 'rgba(20,20,20,.35)'; c.shadowOffsetX = dx; c.shadowOffsetY = dy; c.fillStyle = fill; c.fill(NK.pathOf(NK.wob(pts, { amp: 3, seed, boil: false, step: 10, closed: true }))); c.restore(); };
SCENES.dirC = { draw(c, lt) {
  const t = lt;
  NK.paper(c, '#FFD23F', 'poster');
  // 深色盘子
  cut(c, NK.ell(640, 560, 330, 330), '#14213D', 1, 10, 14);
  cut(c, NK.ell(640, 560, 250, 250), '#FFF6D6', 2);
  // 俯视馒头：白圆＋顶上螺纹褶
  cut(c, NK.ell(600, 540, 170, 165), '#FFFDF6', 3);
  c.save(); c.strokeStyle = '#4A4433'; c.lineWidth = 5; c.lineCap = 'round';
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; c.beginPath(); c.moveTo(600 + Math.cos(a) * 14, 540 + Math.sin(a) * 14); c.quadraticCurveTo(600 + Math.cos(a + 0.5) * 40, 540 + Math.sin(a + 0.5) * 40, 600 + Math.cos(a + 0.9) * 62, 540 + Math.sin(a + 0.9) * 62); c.stroke(); }
  c.restore();
  // 第二个被咬过的馒头
  { const pts = NK.ell(800, 740, 110, 106, 0, Math.PI * 2, 60).filter(([x, y]) => Math.hypot(x - 880, y - 690) > 62); const bite = NK.ell(880, 690, 62, 62, Math.PI * 0.35, Math.PI * 1.15, 16).reverse(); cut(c, pts.slice(0, pts.length).concat(bite), '#FFFDF6', 4); }
  // 标签
  const tag = (x, y, r, s, col) => { c.save(); c.translate(x, y); c.rotate(r); cut(c, NK.rr(-120, -70, 240, 140, 10), col, 5); NK.text(c, s, 0, 6, { size: 88, col: '#111111', font: NK.HEI }); c.restore(); };
  // 红线
  c.save(); c.strokeStyle = '#FF5A36'; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowOffsetY = 6;
  c.beginPath(); c.moveTo(1180, 380); c.bezierCurveTo(1350, 560, 1450, 560, 1600, 700); c.stroke(); c.restore();
  tag(1180, 360, -0.08, '吃', '#FFF6D6'); tag(1610, 720, 0.06, '饱', '#FF5A36');
  CL.pin(c, 1180, 300); CL.pin(c, 1610, 660, '#14213D');
  NK.text(c, '先有因，后有果', 1400, 930, { size: 56, col: '#14213D', font: NK.HEI });
} };
})();
