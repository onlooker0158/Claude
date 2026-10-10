// 第 1 期正式封面：整张黑板。标题「比物理定律更基本的，是叙事」＋片头那条故事链＋板板
(() => {
const C = BB.C, ch = BB.chalk, ell = BB.ell;
const board = (c, W, H) => {
  c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
  const t = CL.paperTile('bb_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(t, 'repeat'); c.fillRect(0, 0, W, H);
  const r = U.rng(41), w = ['E = mc²', '∫ f dx', 'Δt', 'sin θ', 'F = ma', 'λ', 'π r²', 'dy/dx', '∞', 'ψ']; c.save(); c.fillStyle = C.sub; c.textAlign = 'center';
  for (let i = 0; i < W * H / 40000; i++) { c.globalAlpha = 0.06 + r() * 0.05; c.font = `${40 + r() * 50 | 0}px "CMU-it"`; c.fillText(w[(r() * w.length) | 0], r() * W, r() * H); } c.restore();
  c.save(); c.fillStyle = C.sub; for (let i = 0; i < 14; i++) { c.globalAlpha = 0.04; c.beginPath(); c.ellipse(r() * W, r() * H, 300 + r() * 300, 50 + r() * 50, r() - 0.5, 0, 7); c.fill(); } c.restore();
};
// 粉笔字：先填字，再在字上打细孔（粉笔颗粒）
const chalkText = (c, s, x, y, size, col, font = '"PuHui-Black"', align = 'left') => {
  const L = PAINT.canvas(c.canvas.width, c.canvas.height), g = L.getContext('2d');
  g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y);
  g.globalCompositeOperation = 'destination-out'; const r = U.rng(s.length * 7 + (x | 0)); g.fillStyle = '#000';
  const w = g.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
  for (let i = 0; i < w * size / 18; i++) { g.globalAlpha = 0.3 + r() * 0.5; g.fillRect(x0 + r() * w, y - size + r() * size * 1.15, 1 + r() * 2.5, 1 + r() * 1.5); }
  c.drawImage(L, 0, 0);
};
const chain = (c, x, y, s) => {  // 门 → 馒头 → 饱
  ch(c, [[x - 40 * s, y + 60 * s], [x - 40 * s, y - 60 * s], [x + 40 * s, y - 60 * s], [x + 40 * s, y + 60 * s]], C.ink, 8 * s, 301); c.fillStyle = C.ink; c.beginPath(); c.arc(x + 22 * s, y, 6 * s, 0, 7); c.fill();
  const a = (x0) => { ch(c, [[x0, y], [x0 + 90 * s, y]], C.yel, 8 * s, 302 + x0 % 7); ch(c, [[x0 + 70 * s, y - 18 * s], [x0 + 92 * s, y], [x0 + 70 * s, y + 18 * s]], C.yel, 8 * s, 303 + x0 % 5); };
  a(x + 70 * s);
  const mx = x + 280 * s; ch(c, ell(mx, y + 50 * s, 78 * s, 82 * s, Math.PI, Math.PI * 2, 24).concat([[mx - 78 * s, y + 50 * s]]), C.ink, 8 * s, 304);
  ch(c, [[mx - 12 * s, y - 22 * s], [mx, y - 8 * s], [mx + 12 * s, y - 12 * s]], C.ink, 6 * s, 305);
  // 咬掉一口
  c.save(); c.fillStyle = C.bg; c.beginPath(); c.arc(mx + 66 * s, y - 2 * s, 26 * s, 0, 7); c.fill(); c.restore(); ch(c, ell(mx + 66 * s, y - 2 * s, 26 * s, 26 * s, Math.PI * 0.55, Math.PI * 1.45, 10), C.ink, 6 * s, 306);
  a(x + 390 * s);
  c.save(); c.fillStyle = C.ink; c.font = `${150 * s}px "LXGWWenKai-500"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('饱', x + 580 * s, y + 6 * s); c.restore();
};
const tag = (c, s, x, y, size) => { c.save(); c.font = `${size}px "PuHui-Bold"`; const w = c.measureText(s).width; c.fillStyle = C.yel; c.beginPath(); c.roundRect(x, y - size * 1.05, w + size * 0.9, size * 1.5, 8); c.fill(); c.fillStyle = C.dark; c.textBaseline = 'alphabetic'; c.fillText(s, x + size * 0.45, y); c.restore(); };

// 竖版 1080×1440
SCENES.cover_ep1_34 = { draw(c) {
  board(c, 1080, 1440);
  tag(c, '思维工具 · 读书笔记', 80, 150, 40);
  chalkText(c, '比物理定律', 80, 330, 132, C.ink);
  chalkText(c, '更基本的，是', 80, 490, 132, C.ink);
  chalkText(c, '叙事', 70, 720, 250, C.yel);
  ch(c, KIT.densify([[80, 770], [300, 758], [520, 772]], 6), C.yel, 12, 320);
  c.save(); c.fillStyle = C.sub; c.font = '40px "PuHui-Medium"'; c.fillText('这个宇宙的第一性原理', 560, 700); c.fillText('到底是什么？', 560, 756); c.restore();
  chain(c, 170, 930, 0.85);
  // 板槽
  c.fillStyle = C.woodD; c.fillRect(0, 1320, 1080, 120); c.fillStyle = C.wood; c.fillRect(0, 1306, 1080, 22); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 1328, 1080, 8);
  BB.draw(c, 830, 1130, 0.42, { expr: 'smart2a', armR: 'chalk', armL: 'down' });
  c.save(); c.fillStyle = 'rgba(241,239,230,.55)'; c.font = '30px "PuHui-Medium"'; c.fillText('万维钢《现代思维工具100讲》', 80, 1395); c.restore();
} };
// 横版 1920×1080
SCENES.cover_ep1_169 = { draw(c) {
  board(c, 1920, 1080);
  tag(c, '思维工具 · 读书笔记', 110, 170, 44);
  chalkText(c, '比物理定律更基本的，是', 110, 360, 112, C.ink);
  chalkText(c, '叙事', 96, 610, 270, C.yel);
  ch(c, KIT.densify([[110, 660], [340, 646], [580, 662]], 6), C.yel, 13, 320);
  c.save(); c.fillStyle = C.sub; c.font = '44px "PuHui-Medium"'; c.fillText('这个宇宙的第一性原理，到底是什么？', 110, 760); c.restore();
  chain(c, 170, 900, 0.62);
  c.fillStyle = C.woodD; c.fillRect(0, 1010, 1920, 70); c.fillStyle = C.wood; c.fillRect(0, 996, 1920, 20);
  BB.draw(c, 1530, 600, 0.62, { expr: 'smart3', armR: 'finger', armL: 'down' });
  c.save(); c.fillStyle = 'rgba(241,239,230,.55)'; c.font = '30px "PuHui-Medium"'; c.textAlign = 'right'; c.fillText('万维钢《现代思维工具100讲》', 1860, 1056); c.restore();
} };
})();
