// 黑板世界：整片是一整块大黑板。每个「格」(cell) 是板上的一块区域，镜头在格之间移动；
// 格里的粉笔画按口播时间一笔笔写出来，写完留在板上（回到旧格时还看得见），最后拉远看全板。
// 时间一律用全片时间 t（秒）；口播词的时刻由 VO（film/timing.js）给。
(() => {
const { clamp, lerp } = U;
const W = 1920, H = 1080;
const B = window.BOARD = {};
// 色板 chalk：#23302B #2E3D37 #F1EFE6 #A9B3AA #F4D35E #E87D5A
const C = B.C = { bg: '#23302B', surface: '#2E3D37', ink: '#F1EFE6', sub: '#A9B3AA', yel: '#F4D35E', red: '#E87D5A' };
const FONT = '"LXGWWenKai-500"';
const CW = 2120, CH = 1250, COLS = 8;            // 格间距、每行格数（蛇形排）

// ---------- 口播时间 ----------
// VO.at(行号, '原文子串', nth=0) → 这个子串第一个字被念到的时刻（秒）
B.at = (li, s, nth = 0) => {
  const L = VO.lines[li]; if (!L) throw new Error('没有第 ' + li + ' 行');
  if (s == null || s === '') return L.t0;
  let k = -1; for (let n = 0; n <= nth; n++) { k = L.text.indexOf(s, k + 1); if (k < 0) throw new Error(`第 ${li} 行找不到「${s}」：${L.text}`); }
  const sp = L.spans.find(a => a[1] > k) || L.spans[L.spans.length - 1];
  return sp[0] <= k ? sp[2] + (sp[3] - sp[2]) * clamp((k - sp[0]) / Math.max(1, sp[1] - sp[0])) : sp[2];
};
B.end = (li) => { const L = VO.lines[li]; return L.t0 + L.dur; };

// ---------- 格 ----------
B.CELLS = {}; B.ORDER = [];
B.cell = (id, draw) => { B.CELLS[id] = { id, draw }; };
B.place = () => {           // 按首次出场顺序蛇形排
  B.ORDER.forEach((id, i) => { const r = Math.floor(i / COLS), q = i % COLS, col = r % 2 ? COLS - 1 - q : q; const c = B.CELLS[id]; c.x = col * CW; c.y = r * CH; });
};

// ---------- 笔：画笔状态（每帧重置；谁在写谁登记笔尖） ----------
let PEN = null, T = 0, G = null, OX = 0, OY = 0, CELL = null;
const tip = (x, y) => { const m = G.getTransform(); PEN = { sx: m.a * x + m.c * y + m.e, sy: m.b * x + m.d * y + m.f, cell: CELL }; };

// ---------- 点列工具 ----------
const K = B.K = {};
K.ell = (cx, cy, rx, ry = rx, a0 = 0, a1 = Math.PI * 2, n) => { n = n || Math.max(12, Math.round(Math.abs(a1 - a0) * Math.max(rx, ry) / 14)); const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
K.rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
K.tf = (pts, x, y, s = 1, r = 0) => { const cs = Math.cos(r), sn = Math.sin(r); return pts.map(([a, b]) => [x + (a * cs - b * sn) * s, y + (a * sn + b * cs) * s]); };
K.smooth = (pts, per = 6) => KIT.densify(pts, per);
K.arc3 = (a, b, bend = 0.2) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; const c = [mx - dy * bend, my + dx * bend]; const o = []; for (let i = 0; i <= 24; i++) { const q = i / 24, u = 1 - q; o.push([u * u * a[0] + 2 * u * q * c[0] + q * q * b[0], u * u * a[1] + 2 * u * q * c[1] + q * q * b[1]]); } return o; };
const wobCache = new Map();
const wob = (pts, seed, amp = 1.8) => {
  const key = seed + ':' + pts.length + ':' + (pts[0][0] | 0) + ':' + (pts[0][1] | 0) + ':' + (pts[pts.length - 1][0] | 0);
  let r = wobCache.get(key); if (r && r.src === pts.length) return r.pts;
  const rs = KIT.resample(pts, 6);
  const out = rs.map(([x, y], i) => [x + PAINT.noise(i * 0.17 + seed * 3.1, seed) * amp, y + PAINT.noise(i * 0.17 + 40 + seed * 1.7, seed + 9) * amp]);
  if (wobCache.size > 6000) wobCache.clear();
  wobCache.set(key, { src: pts.length, pts: out }); return out;
};
const partial = (pts, q) => { if (q >= 1) return pts; const cum = DG.cum(pts), L = cum[cum.length - 1] * q, o = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (cum[i] <= L) o.push(pts[i]); else { const a = pts[i - 1], b = pts[i], k = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); o.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); break; } } return o; };
const strokePts = (g, P) => { g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
let SEED = 1;
// 可见度：at 之前不画；o.off = [t0, dur] 擦掉（淡出）
const vis = (at, o) => { if (T < at) return 0; if (o && o.off) { const [t0, d = 0.35] = o.off; return 1 - clamp((T - t0) / d); } return 1; };

// ---------- 粉笔笔画 ----------
// pts 局部坐标；at 起笔时刻；dur 写完用时（0 = 立刻）；o: {col, w, a, seed, off, dash}
K.ln = (pts, at, dur = 0.5, o = {}) => {
  const v = vis(at, o); if (v <= 0) return 0;
  const seed = o.seed ?? (SEED++), q = dur > 0 ? clamp((T - at) / dur) : 1;
  const P = partial(wob(pts, seed, o.amp ?? 1.8), MO.sineInOut(q)); if (P.length < 2) return q;
  const g = G; g.save(); g.globalAlpha *= v * (o.a ?? 1); g.strokeStyle = o.col || C.ink; g.lineCap = g.lineJoin = 'round';
  if (o.dash) g.setLineDash(o.dash);
  const w = o.w || 7; g.lineWidth = w; strokePts(g, P);
  g.globalAlpha *= 0.45; g.lineWidth = w * 0.55; g.translate(1.2, -1); strokePts(g, P);
  g.restore();
  if (q > 0 && q < 1 && !o.nopen) tip(...P[P.length - 1]);
  return q;
};
// 箭头（最后一段画箭头头）
K.arrow = (pts, at, dur = 0.45, o = {}) => {
  const q = K.ln(pts, at, dur, o); if (q < 1) return q;
  const n = pts.length, a = pts[n - 2], b = pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = o.head || 30;
  K.ln([[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b, [b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L]], at + dur, 0.12, { ...o, seed: (o.seed ?? 77) + 1 });
  return 1;
};
// 斜线排线填色（粉笔侧锋涂抹）：poly 闭合点列；o: {col, gap, ang, a}
K.hatch = (poly, at, dur = 0.5, o = {}) => {
  const v = vis(at, o); if (v <= 0) return;
  const q = dur > 0 ? clamp((T - at) / dur) : 1, g = G;
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  g.save(); g.beginPath(); poly.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  g.globalAlpha *= v * (o.a ?? 0.55); g.strokeStyle = o.col || C.ink; g.lineWidth = o.lw || 5; g.lineCap = 'round';
  const gap = o.gap || 13, ang = o.ang ?? -0.9, dx = Math.cos(ang), dy = Math.sin(ang), Lh = (x1 - x0) + (y1 - y0);
  const n = Math.ceil(Lh * 2 / gap), m = Math.floor(n * q);
  for (let i = 0; i < m; i++) { const s = -Lh + i * gap, cx = x0 + s, cy = y1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - dx * Lh * 2, cy - dy * Lh * 2); g.stroke(); }
  g.restore();
  if (q > 0 && q < 1) tip(lerp(x0, x1, q), lerp(y1, y0, q));
};
// 实心粉笔块（压得很实的涂抹）
K.fill = (poly, at, o = {}) => {
  const v = vis(at, o); if (v <= 0) return; const g = G;
  const k = o.dur ? clamp((T - at) / o.dur) : 1;
  g.save(); g.globalAlpha *= v * (o.a ?? 0.8) * k; g.fillStyle = o.col || C.ink;
  g.beginPath(); wob(poly, o.seed ?? 5, 1.5).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.restore();
};
// 写字：逐字写出（cps 字/秒）；o: {size, col, align, cps, a, rot, off}
K.txt = (s, x, y, at, o = {}) => {
  const v = vis(at, o); if (v <= 0) return 0;
  const chars = [...s], cps = o.cps || 11, n = o.instant ? chars.length : Math.min(chars.length, Math.floor((T - at) * cps) + 1);
  const g = G, size = o.size || 64; g.save(); g.globalAlpha *= v * (o.a ?? 1); g.font = `${size}px ${o.font || FONT}`; g.fillStyle = o.col || C.ink; g.textBaseline = 'middle';
  g.translate(x, y); if (o.rot) g.rotate(o.rot);
  const full = g.measureText(s).width, align = o.align || 'center', x0 = align === 'center' ? -full / 2 : align === 'right' ? -full : 0;
  const shown = chars.slice(0, n).join(''); g.textAlign = 'left'; g.fillText(shown, x0, 0);
  // 粉笔字再描一圈细边，像笔压不匀
  g.globalAlpha *= 0.35; g.lineWidth = 1.4; g.strokeStyle = o.col || C.ink; g.strokeText(shown, x0 + 1, -1);
  const w = g.measureText(shown).width; g.restore();
  if (n < chars.length) { const cs = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0), px = x0 + w, py = size * 0.3; tip(x + px * cs - py * sn, y + px * sn + py * cs); }
  return n / chars.length;
};
K.txtDur = (s, o = {}) => [...s].length / (o.cps || 11);
// 下划线 / 圈 / 叉
K.under = (x, y, w, at, o = {}) => K.ln([[x - w / 2, y], [x - w / 6, y + 4], [x + w / 2, y - 2]], at, o.dur ?? 0.3, { col: C.yel, w: 6, ...o });
K.circle = (cx, cy, rx, ry, at, o = {}) => K.ln(K.ell(cx, cy, rx, ry, -2.2, -2.2 + Math.PI * 2.15), at, o.dur ?? 0.45, { col: C.yel, w: 6, ...o });
K.cross = (cx, cy, r, at, o = {}) => { K.ln([[cx - r, cy - r], [cx + r, cy + r]], at, 0.16, { col: C.red, w: 10, ...o }); K.ln([[cx + r, cy - r], [cx - r, cy + r]], at + 0.18, 0.16, { col: C.red, w: 10, ...o, seed: (o.seed ?? 3) + 1 }); };
K.check = (cx, cy, r, at, o = {}) => K.ln([[cx - r, cy], [cx - r * 0.3, cy + r * 0.7], [cx + r, cy - r * 0.8]], at, o.dur ?? 0.25, { col: C.yel, w: 9, ...o });
// 局部变换：在 (x,y) 处旋转缩放画 fn
K.at = (x, y, r, s, fn) => { const g = G; g.save(); const ox = OX, oy = OY; g.translate(x, y); g.rotate(r || 0); g.scale(s || 1, s || 1); fn(); g.restore(); };
// 擦黑板的痕迹（surface 色的一片糊）
K.smudge = (x, y, w, h, at, o = {}) => { if (T < at) return; const g = G; g.save(); g.globalAlpha = 0.5 * clamp((T - at) / 0.3); g.fillStyle = C.surface; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, o.rot || 0, 0, 7); g.fill(); g.restore(); };
// 擦掉一块（在粉笔层上打洞：咬馒头、擦掉错的线）
K.hole = (cx, cy, r, at, o = {}) => { if (T < at) return; const k = o.dur ? MO.cubicOut(clamp((T - at) / o.dur)) : 1; const g = G; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy, r * k, 0, 7); g.fill(); g.restore(); };
K.wipe = (poly, at, o = {}) => { if (T < at) return; const k = clamp((T - at) / (o.dur || 0.35)); const g = G; const xs = poly.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.save(); g.beginPath(); poly.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); g.globalCompositeOperation = 'destination-out'; g.fillRect(x0 - 10, -5000, (x1 - x0 + 20) * k, 10000); g.restore();
  if (k > 0 && k < 1) { g.save(); g.globalAlpha = 0.25; g.fillStyle = C.sub; const ys = poly.map(p => p[1]); g.fillRect(x0 + (x1 - x0) * k - 40, Math.min(...ys), 80, Math.max(...ys) - Math.min(...ys)); g.restore(); } };
K.now = () => T;
K.ph = (a, b) => clamp((T - a) / (b - a));       // 时间段进度
K.e = MO.cubicInOut;

// ---------- 镜头 ----------
// SHOTS（film/shots.js）：{cell, line, from, cam:{x,y,z}, ev:[{line?, w, kind, x?, y?, k?, z?, dur?}], fly}
B.camEvents = () => {
  if (B._ev) return B._ev;
  const ev = []; let prev = null;
  for (const s of SHOTS) {
    const c = B.CELLS[s.cell], cam = s.cam || {}, z = cam.z || 1, x = c.x + (cam.x ?? W / 2), y = c.y + (cam.y ?? H / 2);
    if (!prev) ev.push({ at: 0, kind: 'cut', x, y, z });
    else {
      const d = Math.hypot(x - prev.x, y - prev.y);
      if (s.cut) ev.push({ at: s.t0, kind: 'cut', x, y, z });
      else if (d > CW * 1.6) {          // 远处的格：先拉远、再推近（飞过去）
        const zm = Math.min(z, prev.z) * clamp(1.2 * W / (d + W), 0.18, 0.6), mx = (x + prev.x) / 2, my = (y + prev.y) / 2;
        ev.push({ at: s.t0 - 0.05, kind: 'to', x: mx, y: my, z: zm, dur: 0.42, ease: MO.cubicIn });
        ev.push({ at: s.t0 + 0.37, kind: 'to', x, y, z, dur: 0.42, ease: MO.cubicOut });
      } else ev.push({ at: s.t0 - (d > 10 ? 0.35 : 0.02), kind: 'to', x, y, z, dur: d > 10 ? 0.75 : 0.28, ease: d > 10 ? MO.sineInOut : undefined });
    }
    let cur = { x, y, z };
    // 没写镜内动作的镜头：在镜头中段的一个词上补一次快推（已推近的镜头改成快拉），动在事件上
    if (!(s.ev || []).some(e => e.kind === 'punch' || e.kind === 'pan' || e.kind === 'to') && s.t1 - s.t0 > 2.2) {
      const L = VO.lines[s.line], want = s.t0 + Math.min(2.4, (s.t1 - s.t0) * 0.5);
      const sp = L.spans.filter(a => a[2] > s.t0 + 0.9 && a[2] < s.t1 - 0.8).sort((a, b) => Math.abs(a[2] - want) - Math.abs(b[2] - want))[0];
      const at = sp ? sp[2] : want;
      s.ev = (s.ev || []).concat([{ t: at, kind: 'punch', k: z >= 1.25 ? -0.22 : 0.3, dur: 0.36 }]);
    }
    for (const e of s.ev || []) {
      const at = e.t ?? B.at(e.line ?? s.line, e.w) + (e.d || 0);
      const ex = e.x != null ? c.x + e.x : cur.x, ey = e.y != null ? c.y + e.y : cur.y;
      if (e.kind === 'punch') { cur = { x: ex, y: ey, z: cur.z * (1 + (e.k ?? 0.25)) }; ev.push({ at, kind: 'to', ...cur, dur: e.dur || 0.28 }); }
      else if (e.kind === 'pan') { cur = { x: ex, y: ey, z: cur.z }; ev.push({ at, kind: 'to', ...cur, dur: e.dur || 0.30 }); }
      else if (e.kind === 'to') { cur = { x: ex, y: ey, z: e.z ?? cur.z }; ev.push({ at, kind: 'to', ...cur, dur: e.dur || 0.28, ease: e.ease }); }
      else if (e.kind === 'slam' || e.kind === 'shake') ev.push({ at, kind: e.kind, amp: e.amp });
    }
    prev = cur;
  }
  // 片尾：拉远看全板
  const xs = B.ORDER.map(id => B.CELLS[id].x), ys = B.ORDER.map(id => B.CELLS[id].y);
  const bx0 = Math.min(...xs) - 200, bx1 = Math.max(...xs) + W + 200, by0 = Math.min(...ys) - 200, by1 = Math.max(...ys) + H + 200;
  B.FINAL = { x: (bx0 + bx1) / 2, y: (by0 + by1) / 2, z: Math.min(W / (bx1 - bx0), H / (by1 - by0)) };
  if (B.FINAL_AT) ev.push({ at: B.FINAL_AT, kind: 'to', ...B.FINAL, dur: B.FINAL_DUR || 2.4, ease: MO.cubicInOut });
  B._ev = ev; return ev;
};
B.camAt = (t) => CAM.track({ x: W / 2, y: H / 2, z: 1 }, B.camEvents(), t);

// ---------- 纹理 ----------
const grainTile = () => PAINT.cached('chalk_grain', 384, 384, (g) => {
  const img = g.createImageData(384, 384), d = img.data, r = U.rng(19);
  for (let i = 0; i < 384 * 384; i++) { const x = i % 384, y = (i / 384) | 0; const n = PAINT.fbm(x * 0.05, y * 0.05, 3) * 0.5 + 0.5; const a = r() < 0.22 + (1 - n) * 0.25 ? 255 * (0.35 + r() * 0.65) : 0; d[i * 4 + 3] = a; }
  g.putImageData(img, 0, 0);
});
const boardTile = () => PAINT.cached('chalk_board', 512, 512, (g) => {
  const img = g.createImageData(512, 512), d = img.data, b = PAINT.hex(C.bg), r = U.rng(7);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const ax = x / 512 * Math.PI * 2, ay = y / 512 * Math.PI * 2;
    const n = PAINT.fbm(Math.cos(ax) * 1.3 + 4, Math.sin(ax) * 1.3 + Math.cos(ay) * 1.1, 4), gr = (r() - .5) * 6, i = (y * 512 + x) * 4;
    d[i] = b[0] + n * 11 + gr; d[i + 1] = b[1] + n * 12 + gr; d[i + 2] = b[2] + n * 11 + gr; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
});
// 擦过的旧粉笔灰：大片极淡的弧形抹痕（世界坐标，固定）
const SMEARS = (() => { const r = U.rng(23), o = []; for (let i = 0; i < 420; i++) o.push({ x: r() * CW * COLS, y: r() * CH * 9 - 300, w: 500 + r() * 900, h: 60 + r() * 120, a: r() * 0.5 - 0.25, al: 0.025 + r() * 0.035 }); return o; })();

// 板面上零星的粉笔灰点和细擦痕（世界坐标，固定；真黑板上到处都是）
const DUST = (() => { const r = U.rng(29), o = []; for (let i = 0; i < 26000; i++) o.push({ x: -1500 + r() * (CW * COLS + 3000), y: -1500 + r() * (CH * 9 + 3000), l: 4 + r() * 16, a: r() * Math.PI, al: 0.10 + r() * 0.20, w: 2 + r() * 3 }); return o; })();
// 没擦干净的旧板书残影（世界坐标，固定，极淡）
const GHOST = (() => { const r = U.rng(37), words = ['x² + y²', '∫ f(x) dx', 'E = mc²', 'a + b = c', 'Δt', 'sin θ', '∑ n', 'p ∝ 1/V', 'F = G m₁m₂/r²', 'λ', 'v = s / t', '→', '√2', 'π r²', 'ΔS ≥ 0', 'H₂O', 'log x', '∞', 'dy/dx', 'P(A|B)'], o = [];
  for (let i = 0; i < 3400; i++) o.push({ x: -1500 + r() * (CW * COLS + 3000), y: -1500 + r() * (CH * 9 + 3000), s: words[(r() * words.length) | 0], z: 44 + r() * 60, rot: (r() - 0.5) * 0.3, al: 0.07 + r() * 0.07 }); return o; })();
// ---------- 渲染一帧 ----------
let layer = null;
B.draw = (c, t) => {
  T = t; PEN = null;
  const cam = B.camAt(t);
  // 板面
  c.save(); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
  CAM.apply(c, cam);
  const pat = c.createPattern(boardTile(), 'repeat'); c.fillStyle = pat;
  const v0 = CAM.toWorld(cam, 0, 0), v1 = CAM.toWorld(cam, W, H);
  c.fillRect(v0[0] - 10, v0[1] - 10, v1[0] - v0[0] + 20, v1[1] - v0[1] + 20);
  c.fillStyle = C.sub;
  for (const s of SMEARS) { if (s.x + s.w < v0[0] || s.x - s.w > v1[0] || s.y + s.w < v0[1] || s.y - s.w > v1[1]) continue; c.globalAlpha = s.al; c.beginPath(); c.ellipse(s.x, s.y, s.w / 2, s.h / 2, s.a, 0, 7); c.fill(); }
  c.strokeStyle = C.sub; c.lineCap = 'round';
  for (const s of DUST) { if (s.x < v0[0] - 20 || s.x > v1[0] + 20 || s.y < v0[1] - 20 || s.y > v1[1] + 20) continue; c.globalAlpha = s.al; c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + Math.cos(s.a) * s.l, s.y + Math.sin(s.a) * s.l); c.stroke(); }
  c.fillStyle = C.sub; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const s of GHOST) { if (s.x < v0[0] - 300 || s.x > v1[0] + 300 || s.y < v0[1] - 100 || s.y > v1[1] + 100) continue; c.save(); c.globalAlpha = s.al; c.translate(s.x, s.y); c.rotate(s.rot); c.font = `${s.z | 0}px "CMU-it"`; c.fillText(s.s, 0, 0); c.restore(); }
  c.globalAlpha = 1; c.restore();
  // 粉笔层：先画所有可见格，再用颗粒打孔
  if (!layer) layer = PAINT.canvas(W, H);
  const g = layer.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.save(); CAM.apply(g, cam); G = g;
  for (const id of B.ORDER) {
    const cl = B.CELLS[id]; if (cl.x > v1[0] || cl.x + W < v0[0] || cl.y > v1[1] || cl.y + H < v0[1]) continue;
    if (cl.t0 != null && t < cl.t0 - 1) continue;
    g.save(); g.translate(cl.x, cl.y); OX = cl.x; OY = cl.y; CELL = id; SEED = 1;
    try { cl.draw(K, t); } catch (e) { g.restore(); throw new Error(`格 ${id}：${e.message}`); }
    g.restore();
  }
  g.restore();
  g.save(); g.globalCompositeOperation = 'destination-out'; const gp = g.createPattern(grainTile(), 'repeat');
  const m = new DOMMatrix(); m.translateSelf(W / 2, H / 2); m.scaleSelf(cam.z, cam.z); m.translateSelf(-cam.x, -cam.y); gp.setTransform(m);
  g.globalAlpha = 0.55; g.fillStyle = gp; g.fillRect(0, 0, W, H); g.restore();
  c.drawImage(layer, 0, 0);
  // 笔：一截粉笔跟着笔尖（只在当前镜头的格里）
  if (PEN && PEN.cell === B.curCell(t)) {
    const sx = PEN.sx, sy = PEN.sy, s = Math.max(0.6, Math.min(1.4, cam.z));
    c.save(); c.translate(sx, sy); c.scale(s, s); c.rotate(-0.75);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(-6, 8, 26, 120);
    c.fillStyle = '#EDEAE0'; c.fillRect(-12, 0, 24, 118); c.fillStyle = '#D6D2C6'; c.fillRect(6, 0, 6, 118);
    c.fillStyle = '#F7F5EE'; c.beginPath(); c.ellipse(0, 0, 12, 5, 0, 0, 7); c.fill(); c.restore();
  }
};
B.curCell = (t) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].t0 - 0.05) k = i; return SHOTS[k].cell; };

// ---------- 字幕（屏幕空间，底部） ----------
B.subs = (c, t) => {
  const s = VO.subs.find(x => t >= x.t0 && t < x.t1); if (!s) return;
  c.save(); c.font = `46px "PuHui-Bold"`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(s.text).width;
  c.fillStyle = 'rgba(18,22,20,.62)'; c.beginPath(); c.roundRect(W / 2 - w / 2 - 26, 990 - 34, w + 52, 68, 10); c.fill();
  c.fillStyle = '#F1EFE6'; c.fillText(s.text, W / 2, 992); c.restore();
};

// ---------- 段落表：一镜一段（qa、抽帧按镜头分），画面都由同一个世界函数画 ----------
B.build = () => {
  for (const s of SHOTS) { s.t0 = s.t ?? (B.at(s.line, s.from) - (s.lead ?? 0.12)); if (!B.CELLS[s.cell]) throw new Error('没有这个格 ' + s.cell); if (!B.ORDER.includes(s.cell)) { B.ORDER.push(s.cell); B.CELLS[s.cell].t0 = s.t0; } }
  SHOTS[0].t0 = 0;
  SHOTS.forEach((s, i) => { s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : VO.total; });
  B.place();
  window.FILM_DURATION = VO.total;
  window.ERAS = SHOTS.map((s, i) => ({ id: 'shot' + String(i + 1).padStart(2, '0'), dur: (i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : VO.total) - s.t0, draw: (c, lt, t) => B.draw(c, t) }));
  window.GLOBAL_OVERLAY = (c, t) => B.subs(c, t);
};
})();
