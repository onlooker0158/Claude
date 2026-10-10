// 《叙事：这个宇宙的第一性原理》科普片的共用画具：纸纹、铅笔线、平涂、手、馒头和桌面上的各种物。
// 约定：所有随机用种子；铅笔线按 8fps「沸腾」（boil），其余稳定。坐标都是 1920×1080 世界坐标。
(() => {
const { clamp, lerp, rng } = U;
const NK = window.NK = {};
const W = 1920, H = 1080;

// ---------- 色板（paper：#F3EDE2 #FBF8F2 #1B1A17 #6B655B #C8402F #2F5D62，加木色两档） ----------
NK.C = {
  bg: '#F3EDE2', surface: '#FBF8F2', ink: '#1B1A17', sub: '#6B655B', red: '#C8402F', teal: '#2F5D62',
  wood: '#B98A5A', woodD: '#8E6440', wall: '#E9DFCD', shade: 'rgba(60,40,20,.16)', skin: '#E8B48F', skinD: '#C98D6A', sleeve: '#2F5D62',
};
NK.FONT = '"LXGWWenKai-500"';
NK.HEI = '"PuHui-Bold"';

// ---------- 纸纹底 ----------
NK.paper = (c, col = NK.C.bg, key = 'p') => {
  const tile = CL.paperTile('nk_' + key + col, col, { size: 512, amt: 9, fibers: 220, grain: 9, seed: 11 });
  c.save(); c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(-4000, -4000, 12000, 12000); c.restore();
};
// 整帧最上面压一层纸纹颗粒（multiply），让平涂像印在纸上
NK.grainOver = (c, a = 0.5) => {
  const tile = CL.paperTile('nk_over', '#ffffff', { size: 512, amt: 22, fibers: 300, grain: 18, seed: 5 });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a;
  c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(0, 0, W, H); c.restore();
};

// ---------- 点列 ----------
NK.ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
NK.rr = (x, y, w, h, r, n = 6) => { const o = [], q = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  q(x + w - r, y + r, -Math.PI / 2); q(x + w - r, y + h - r, 0); q(x + r, y + h - r, Math.PI / 2); q(x + r, y + r, Math.PI); return o; };
NK.tf = (pts, x, y, s = 1, r = 0) => { const cs = Math.cos(r), sn = Math.sin(r); return pts.map(([a, b]) => [x + (a * cs - b * sn) * s, y + (a * sn + b * cs) * s]); };
// 铅笔抖动：按弧长重采样后加低频噪声，boil=true 时按 8fps 换相位
NK.wob = (pts, { amp = 1.6, seed = 1, t = 0, boil = true, step = 7, closed = false } = {}) => {
  const P0 = closed ? [...pts, pts[0]] : pts, rs = KIT.resample(P0, step), ph = boil ? Math.floor(t * 8) * 1.37 : 0;
  return rs.map(([x, y], i) => [x + PAINT.noise(i * 0.21 + seed * 3.1, ph) * amp, y + PAINT.noise(i * 0.21 + 50 + seed * 1.7, ph + 9) * amp]);
};
NK.pathOf = (pts, closed = true) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (closed) p.closePath(); return p; };
// 平涂＋铅笔描边。o: {fill, line, w, seed, t, amp, shade:[dx,dy] 内阴影偏移}
NK.shape = (c, pts, o = {}) => {
  const { fill, line = NK.C.ink, w = 3.2, seed = 1, t = 0, amp = 1.4, alpha = 1 } = o;
  c.save(); c.globalAlpha *= alpha;
  if (fill) { c.fillStyle = fill; c.fill(NK.pathOf(pts)); }
  if (o.shadeFill) { c.save(); c.clip(NK.pathOf(pts)); c.fillStyle = o.shadeFill; c.fill(NK.pathOf(NK.tf(pts, o.shade[0], o.shade[1]))); c.restore(); }
  if (line) { c.strokeStyle = line; c.lineWidth = w; c.lineJoin = c.lineCap = 'round'; c.stroke(NK.pathOf(NK.wob(pts, { amp, seed, t, closed: true }))); }
  c.restore();
};
NK.line = (c, pts, o = {}) => {
  const { line = NK.C.ink, w = 3.2, seed = 1, t = 0, amp = 1.2, alpha = 1, dash } = o;
  c.save(); c.globalAlpha *= alpha; c.strokeStyle = line; c.lineWidth = w; c.lineJoin = c.lineCap = 'round'; if (dash) c.setLineDash(dash);
  c.stroke(NK.pathOf(NK.wob(pts, { amp, seed, t }), false)); c.restore();
};
// 只描出前 q（0..1）比例的线（笔画写出）
NK.partial = (pts, q) => { if (q >= 1) return pts; if (q <= 0) return pts.slice(0, 1); const cum = DG.cum(pts), L = cum[cum.length - 1] * q, o = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (cum[i] <= L) o.push(pts[i]); else { const a = pts[i - 1], b = pts[i], k = (L - cum[i - 1]) / (cum[i] - cum[i - 1]); o.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); break; } } return o; };
NK.arrow = (c, pts, q = 1, o = {}) => {
  const P = NK.partial(pts, q); if (P.length < 2) return; NK.line(c, P, o);
  if (q >= 1) { const a = P[P.length - 2], b = P[P.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = o.head || 26;
    NK.line(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b, [b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L]], o); }
};
// 字：霞鹜文楷，写在物上
NK.text = (c, s, x, y, { size = 64, col = NK.C.ink, align = 'center', font = NK.FONT, alpha = 1, base = 'middle', rot = 0 } = {}) => {
  c.save(); c.globalAlpha *= alpha; c.translate(x, y); if (rot) c.rotate(rot); c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = base; c.fillText(s, 0, 0); c.restore();
};
// 逐字写出（16 字/秒左右）
NK.write = (c, s, x, y, lt, at, o = {}) => { const n = Math.floor(clamp((lt - at) * (o.cps || 14), 0, s.length)); if (n <= 0) return; NK.text(c, [...s].slice(0, n).join(''), x, y, o); };
// 投影
NK.drop = (c, fn, { col = 'rgba(70,45,20,.22)', blur = 0, x = 8, y = 10 } = {}) => { c.save(); c.shadowColor = col; c.shadowBlur = blur; c.shadowOffsetX = x; c.shadowOffsetY = y; fn(); c.restore(); };

// ---------- 物：馒头（侧视，底平顶圆；bite 0..1 被咬掉的量） ----------
NK.mantou = (c, x, y, s = 1, { t = 0, bite = 0, seed = 3, steam = 0 } = {}) => {
  const body = [];
  for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; body.push([Math.cos(a) * 150, Math.sin(a) * 118 * (1 - 0.08 * Math.cos(a * 2)) - 6]); }
  body.push([150, 0]); body.push([-150, 0]);
  let pts = NK.tf(body, x, y, s);
  c.save();
  if (bite > 0) { // 咬口：右上角挖掉几个圆
    const clip = new Path2D(); clip.rect(-4000, -4000, 12000, 12000);
    const r = 46 * s, n = Math.ceil(bite * 3);
    for (let k = 0; k < n; k++) { const a = -0.55 + k * 0.42; clip.moveTo(x + Math.cos(a) * 150 * s + r, y + Math.sin(a) * 118 * s); clip.arc(x + Math.cos(a) * 150 * s, y + Math.sin(a) * 118 * s - 6 * s, r * (k === n - 1 ? bite * 3 - k : 1), 0, Math.PI * 2, true); }
    c.clip(clip, 'evenodd');
  }
  NK.drop(c, () => { c.fillStyle = '#FBF6EA'; c.fill(NK.pathOf(pts)); }, { x: 6 * s, y: 8 * s });
  c.save(); c.clip(NK.pathOf(pts)); c.fillStyle = 'rgba(214,190,150,.55)'; c.beginPath(); c.ellipse(x + 40 * s, y + 20 * s, 190 * s, 70 * s, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(x - 50 * s, y - 80 * s, 50 * s, 22 * s, -0.4, 0, 7); c.fill(); c.restore();
  NK.shape(c, pts, { line: NK.C.ink, w: 3.4, seed, t });
  // 顶部褶子
  NK.line(c, NK.tf([[-20, -112], [-8, -96], [6, -90]], x, y, s), { w: 2.6, seed: seed + 1, t });
  NK.line(c, NK.tf([[22, -110], [12, -94]], x, y, s), { w: 2.6, seed: seed + 2, t });
  c.restore();
  if (steam > 0) U.steam(c, t, { x: x, y: y - 130 * s, h: 110 * s, n: 3, w: 4 * s, color: `rgba(107,101,91,${0.45 * steam})`, spread: 34 * s, wobble: 12 * s });
};

// ---------- 物：盘子、桌子、杯子、门 ----------
NK.plate = (c, x, y, s = 1, o = {}) => {
  const top = NK.ell(x, y, 260 * s, 46 * s);
  NK.drop(c, () => { c.fillStyle = NK.C.surface; c.fill(NK.pathOf(top)); }, { x: 0, y: 12 * s });
  NK.shape(c, top, { line: NK.C.ink, w: 3, seed: 7, t: o.t || 0 });
  NK.shape(c, NK.ell(x, y + 4 * s, 170 * s, 26 * s), { fill: 'rgba(200,64,47,.10)', line: NK.C.sub, w: 2, seed: 8, t: o.t || 0 });
};
NK.table = (c, y = 760, o = {}) => {
  const t = o.t || 0, x0 = o.x0 ?? -200, x1 = o.x1 ?? 2120;
  NK.shape(c, [[x0, y], [x1, y], [x1, y + 46], [x0, y + 46]], { fill: NK.C.wood, line: NK.C.ink, w: 3.4, seed: 21, t, amp: 1 });
  NK.shape(c, [[x0, y + 46], [x1, y + 46], [x1, y + 400], [x0, y + 400]], { fill: NK.C.woodD, line: null });
  c.save(); c.strokeStyle = 'rgba(60,35,15,.25)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); const yy = y + 10 + k * 8; c.moveTo(x0, yy); for (let xx = x0; xx <= x1; xx += 40) c.lineTo(xx, yy + Math.sin(xx * 0.01 + k) * 2); c.stroke(); } c.restore();
};
NK.cup = (c, x, y, s = 1, { t = 0, tilt = 0, water = 0.7, spill = 0 } = {}) => {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  const body = [[-62, -170], [62, -170], [50, 0], [-50, 0]];
  NK.drop(c, () => { c.fillStyle = 'rgba(251,248,242,.95)'; c.fill(NK.pathOf(body)); }, { x: 6, y: 8 });
  if (water > 0) { const wy = -170 * water; c.save(); c.clip(NK.pathOf(body)); c.fillStyle = 'rgba(47,93,98,.55)'; c.fillRect(-80, wy - Math.sin(tilt) * 40, 160, 400); c.restore(); }
  NK.shape(c, body, { line: NK.C.ink, w: 3.2, seed: 31, t });
  NK.shape(c, NK.ell(0, -170, 62, 12), { line: NK.C.ink, w: 2.6, seed: 32, t });
  c.restore();
};
NK.door = (c, x, y, w, h, open = 0, o = {}) => {   // x,y = 门框左上；open 0..1
  const t = o.t || 0;
  NK.shape(c, [[x - 18, y - 18], [x + w + 18, y - 18], [x + w + 18, y + h], [x - 18, y + h]], { fill: '#D9CBB2', line: NK.C.ink, w: 3.4, seed: 41, t });
  NK.shape(c, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill: '#3B342C', line: NK.C.ink, w: 3, seed: 42, t });
  c.save(); c.globalAlpha = 0.9 * open; c.fillStyle = '#F7E3B5'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w + 380 * open, y + h + 260); c.lineTo(x - 120 * open, y + h + 260); c.fill(); c.fillRect(x, y, w, h); c.restore();
  const dw = w * (1 - 0.82 * open);
  NK.shape(c, [[x, y], [x + dw, y + 12 * open], [x + dw, y + h - 12 * open], [x, y + h]], { fill: NK.C.teal, line: NK.C.ink, w: 3.2, seed: 43, t });
  c.save(); c.fillStyle = NK.C.ink; c.beginPath(); c.arc(x + dw - 26 * (1 - open * 0.6), y + h * 0.52, 9, 0, 7); c.fill(); c.restore();
};

// ---------- 手（右手，从画外伸进来；不画脸、不画人） ----------
// x,y = 手掌中心；ang = 手臂方向（手臂朝 ang+π 伸出画外）；grip 0..1 张开→握拢；s 缩放
NK.hand = (c, x, y, s = 1, { ang = Math.PI * 0.85, grip = 0, t = 0, seed = 51, sleeve = NK.C.sleeve, flip = false, mid = null } = {}) => {
  const T0 = c.getTransform(); c.save(); c.translate(x, y); c.rotate(ang - Math.PI); if (flip) c.scale(1, -1); c.scale(s, s);
  const sk = NK.C.skin, skd = NK.C.skinD;
  // 前臂＋袖子（向 -x 方向伸出画外）
  NK.shape(c, [[-1400, -70], [-120, -62], [-110, 62], [-1400, 76]], { fill: sk, line: NK.C.ink, w: 3.4, seed, t });
  NK.shape(c, [[-1400, -92], [-260, -86], [-240, 92], [-1400, 100]], { fill: sleeve, line: NK.C.ink, w: 3.4, seed: seed + 1, t });
  NK.line(c, [[-262, -80], [-246, 0], [-242, 88]], { w: 2.4, seed: seed + 2, t, line: 'rgba(0,0,0,.35)' });
  // 手掌
  const palm = [[-130, -64], [10, -78], [64, -60], [84, -10], [70, 48], [20, 74], [-120, 62]];
  NK.shape(c, palm, { fill: sk, line: NK.C.ink, w: 3.4, seed: seed + 3, t, shadeFill: 'rgba(160,95,60,.22)', shade: [0, 26] });
  // 握着的物画在掌和手指之间（世界坐标）
  if (mid) { const T1 = c.getTransform(); c.setTransform(T0); mid(c); c.setTransform(T1); }
  // 四指：从掌缘伸出，grip 越大越弯
  for (let k = 0; k < 4; k++) {
    const by = -54 + k * 34, L = [96, 106, 100, 82][k], bend = grip * 1.25 + k * 0.05;
    const p0 = [60 + (k === 0 ? 0 : 6), by], seg1 = L * 0.55, seg2 = L * 0.45;
    const a1 = -0.12 + bend * 0.7, a2 = a1 + bend * 0.9;
    const p1 = [p0[0] + Math.cos(a1) * seg1, p0[1] + Math.sin(a1) * seg1], p2 = [p1[0] + Math.cos(a2) * seg2, p1[1] + Math.sin(a2) * seg2];
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = NK.C.ink; c.lineWidth = 32; c.beginPath(); c.moveTo(...p0); c.lineTo(...p1); c.lineTo(...p2); c.stroke();
    c.strokeStyle = k % 2 ? sk : '#EDBC98'; c.lineWidth = 25; c.stroke();
    c.strokeStyle = 'rgba(160,95,60,.35)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(p1[0] - 6, p1[1] + 8); c.lineTo(p1[0] + 4, p1[1] + 12); c.stroke();
    c.restore();
  }
  // 拇指（在上方，朝前）
  const th = 0.3 + grip * 0.5;
  c.save(); c.lineCap = 'round'; c.strokeStyle = NK.C.ink; c.lineWidth = 36; c.beginPath(); c.moveTo(-40, -60); c.lineTo(10, -96); c.lineTo(10 + Math.cos(-0.4 + th) * 62, -96 + Math.sin(-0.4 + th) * 62); c.stroke();
  c.strokeStyle = '#EDBC98'; c.lineWidth = 29; c.stroke(); c.restore();
  NK.line(c, [[-60, -10], [-10, 14], [30, 10]], { w: 2.2, seed: seed + 5, t, line: 'rgba(150,85,55,.45)' });
  c.restore();
};

// ---------- 镜头 ----------
NK.cam = (c, base, events, lt) => { const cam = CAM.track(base, events, lt); CAM.apply(c, cam); return cam; };
})();
