// 帕金森病 · 夜里睡得好吗？——竖屏 1080×1920 科普短片
// 画风：真实折页满幅当主画面（微斜放在浅灰蓝桌面上），橙色马克笔圈画打勾、黑底撕边标签；
//      谷底曲线段用折页同款平涂图表重画。全片色板见 C。所有时间都是全片时间 t（秒），对齐 时间轴.json 的口播词。
(() => {
const W = 1080, H = 1920, FY = 0.36 * H;              // 焦点放在画面 36% 高处，给下方字幕让位
const C = { bg: '#EAF0F2', sf: '#FFFFFF', ink: '#1B3F7A', sub: '#5E6B72', ac: '#E8731C', ac2: '#5A9E2E', night: '#1B3F7A', dark: '#191817' };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const qOut = k => 1 - Math.pow(1 - clamp(k), 4);
const eIO = k => { k = clamp(k); return k < .5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2; };
const backOut = k => { k = clamp(k); const s = 1.9; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
const PD = window.PD = { C };

// ---------- 镜头：关键帧 [t, {u, v, vw}]，到点后 dur 秒内用 eIO 走过去，之后停住（脉冲节奏：停→快动→停）----------
// u,v 是素材上 0..1 的焦点，vw 是可见宽度占素材宽的比例（越小越近）。
function camAt(track, t) {
  let cur = { ...track[0][1] };
  for (let i = 1; i < track.length; i++) {
    const [ti, to, d = 0.3, ease = eIO] = track[i];
    if (t <= ti) break;
    const k = ease((t - ti) / d);
    cur = { u: lerp(cur.u, to.u ?? cur.u, k), v: lerp(cur.v, to.v ?? cur.v, k), vw: lerp(cur.vw, to.vw ?? cur.vw, k), r: lerp(cur.r ?? 0, to.r ?? cur.r ?? 0, k) };
  }
  return cur;
}
PD.camAt = camAt;
// 素材坐标 → 画面：返回变换参数
function view(img, cam) {
  const iw = img.width, ih = img.height, s = W / (cam.vw * iw);
  return { s, iw, ih, ox: W / 2 - cam.u * iw * s, oy: FY - cam.v * ih * s, r: cam.r ?? -0.012 };
}
PD.view = view;
const toScr = (V, u, v) => {   // 带旋转（绕焦点）
  const x = V.ox + u * V.iw * V.s, y = V.oy + v * V.ih * V.s, cx = W / 2, cy = FY, cs = Math.cos(V.r), sn = Math.sin(V.r);
  return [cx + (x - cx) * cs - (y - cy) * sn, cy + (x - cx) * sn + (y - cy) * cs];
};
PD.toScr = toScr;
function withWorld(c, V, fn) { c.save(); c.translate(W / 2, FY); c.rotate(V.r); c.translate(-W / 2, -FY); c.translate(V.ox, V.oy); c.scale(V.s, V.s); fn(); c.restore(); }
PD.withWorld = withWorld;

// ---------- 桌面＋纸 ----------
let deskTile = null;
function desk(c) {
  if (!deskTile) { deskTile = document.createElement('canvas'); deskTile.width = W; deskTile.height = H; const g = deskTile.getContext('2d');
    g.fillStyle = C.bg; g.fillRect(0, 0, W, H); const r = U.rng(11);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < .5 ? 'rgba(27,63,122,.035)' : 'rgba(255,255,255,.25)'; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); } }
  c.drawImage(deskTile, 0, 0);
}
PD.desk = desk;
function paper(c, img, V, crop) {          // crop：[u0,u1] 只画这一段竖条（折页合上用）
  withWorld(c, V, () => {
    c.save(); c.shadowColor = 'rgba(20,40,70,.28)'; c.shadowBlur = 40 / V.s; c.shadowOffsetY = 14 / V.s; c.fillStyle = '#fff'; c.fillRect(0, 0, img.width, img.height); c.restore();
    c.drawImage(img, 0, 0);
  });
}
PD.paper = paper;

// ---------- 马克笔笔画（素材坐标，跟着纸走）----------
// 每笔：{ at, dur, pts:[[u,v],...] (素材 0..1), w: 线宽(素材像素), col }
function polyLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
function partial(P, k) {
  const L = polyLen(P) * k; let acc = 0; const out = [P[0]];
  for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + d >= L) { const f = (L - acc) / (d || 1); out.push([lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]); return out; }
    acc += d; out.push(P[i]); }
  return out;
}
const px = (img, s) => s.pts.map(([u, v]) => [u * img.width, v * img.height]);
function strokes(c, img, V, list, t) {
  withWorld(c, V, () => {
    for (const s of list) { if (t < s.at) continue; const k = clamp((t - s.at) / s.dur); const P = partial(px(img, s), qOut(k));
      c.save(); c.strokeStyle = s.col || C.ac; c.globalAlpha = s.alpha ?? 0.9; c.lineWidth = s.w || 16; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore(); }
  });
}
PD.strokes = strokes;
// 笔尖位置（屏幕）：正在画的那一笔的笔头；画完停在终点 0.25s 后移出画外
function penAt(img, V, list, t) {
  let pos = null, vis = 0;
  for (const s of list) {
    if (s.noPen) continue;
    const a = s.at - 0.25, b = s.at + s.dur + 0.3;
    if (t >= a && t <= b) { const k = clamp((t - s.at) / s.dur); const P = partial(px(img, s), qOut(k)); const [x, y] = P[P.length - 1];
      pos = toScr(V, x / img.width, y / img.height); vis = Math.min(clamp((t - a) / 0.25), clamp((b - t) / 0.3)); }
  }
  return pos ? { x: pos[0], y: pos[1], vis } : null;
}
function pen(c, p) {        // 一支马克笔：深蓝笔杆、橙色笔头，从右下方伸进来
  if (!p || p.vis <= 0) return;
  const off = (1 - qOut(p.vis)) * 520;
  c.save(); c.translate(p.x + off * 0.7, p.y + off); c.rotate(-0.62);
  c.fillStyle = 'rgba(20,30,50,.18)'; c.beginPath(); c.roundRect(18, 26, 64, 560, 30); c.fill();   // 影子
  c.fillStyle = C.ac; c.beginPath(); c.moveTo(0, 0); c.lineTo(-14, 34); c.lineTo(14, 34); c.closePath(); c.fill();
  c.fillStyle = '#D9DEE2'; c.fillRect(-20, 34, 40, 36);
  c.fillStyle = C.ink; c.beginPath(); c.roundRect(-30, 68, 60, 520, 26); c.fill();
  c.fillStyle = C.ac; c.fillRect(-30, 150, 60, 26);
  c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(-18, 80, 8, 500);
  c.restore();
}
PD.pen = (c, img, V, list, t) => pen(c, penAt(img, V, list, t));

// 形状生成（素材坐标 0..1；ar = 素材宽高比，保证勾和圈不被拉扁）
PD.tick = (u, v, sz, ar) => [[u - sz * .55, v], [u - sz * .12, v + sz * .55 * ar], [u + sz * .75, v - sz * .85 * ar]];
PD.ul = (u0, u1, v, ar, wob = .0015) => { const P = []; for (let i = 0; i <= 12; i++) { const k = i / 12; P.push([lerp(u0, u1, k), v + Math.sin(k * 9.3 + u0 * 50) * wob * ar]); } return P; };
PD.ring = (u, v, ru, rv, ar, turns = 1.12, a0 = -2.4) => { const P = []; const n = 48; for (let i = 0; i <= n; i++) { const k = i / n, a = a0 + k * turns * Math.PI * 2, rr = 1 + 0.06 * Math.sin(k * 7) + (k > .85 ? (k - .85) * .5 : 0);
  P.push([u + Math.cos(a) * ru * rr, v + Math.sin(a) * rv * rr * ar]); } return P; };

// ---------- 黑底撕边标签：钉在素材上的一个点（随镜头走），at 时刻砸入 ----------
PD.label = (c, V, u, v, text, t, at, o = {}) => {
  if (t < at) return;
  const [x, y] = toScr(V, u, v), k = MO.slam(t, at, { dur: 0.17 });
  c.save(); c.translate(x, y); c.scale(k, k);
  MD.label(c, text, 0, 0, { size: o.size || 64, bg: o.bg || C.dark, fg: o.fg || '#FFFFFF', align: o.align || 'center', r: o.r ?? -0.03, fam: 'PuHui-Black' });
  c.restore();
};
// 手写字（霞鹜文楷，橙色），钉在素材点上
PD.hand = (c, V, u, v, text, t, at, o = {}) => {
  if (t < at) return;
  const [x, y] = toScr(V, u, v), n = Math.ceil((t - at) * 14 + 0.01);
  c.save(); c.translate(x, y); c.rotate(o.r ?? -0.05); c.font = `${o.size || 76}px "LXGWWenKai-500"`; c.fillStyle = o.col || C.ac; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  c.fillText([...text].slice(0, n).join(''), 0, 0); c.restore();
};

// ---------- 字幕（全片统一）：按口播词时间切成 ≤13 字的小句 ----------
const SUB = [];
(() => {
  for (const L of TL.lines) {
    const parts = L.text.split(/(?<=[，。？：、；])/).filter(Boolean); let chunks = [], cur = '';
    for (const p of parts) { if ((cur + p).replace(/[，。？：、；“”]/g, '').length > 13 && cur) { chunks.push(cur); cur = p; } else cur += p; }
    if (cur) chunks.push(cur);
    // 每块的开始时间：块里第一个词的时间
    let ci = 0, consumed = 0; const starts = []; const flat = L.text.replace(/[，。？：、；“”]/g, '');
    for (const ch of chunks) { const clean = ch.replace(/[，。？：、；“”]/g, ''); starts.push(consumed); consumed += clean.length; }
    const wordAt = idx => { let acc = 0; for (const w of L.words) { if (acc + w.w.length > idx) return w.t; acc += w.w.length; } return L.t0; };
    chunks.forEach((ch, i) => SUB.push({ text: ch.replace(/[，。；：、]$/, ''), t0: i ? wordAt(starts[i]) - 0.05 : L.t0 - 0.05, t1: i < chunks.length - 1 ? wordAt(starts[i + 1]) - 0.05 : L.t1 + 0.15 }));
  }
})();
PD.SUB = SUB;
PD.subtitle = (c, t) => {
  const s = SUB.find(x => t >= x.t0 && t < x.t1); if (!s) return;
  c.save(); c.font = '60px "PuHui-Black"'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(s.text).width, y = 1400;
  c.fillStyle = 'rgba(27,63,122,.92)'; c.beginPath(); c.roundRect(W / 2 - w / 2 - 34, y - 52, w + 68, 104, 18); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillText(s.text, W / 2, y + 3); c.restore();
};

// 小号说明字（屏幕空间，底部）
PD.note = (c, text, y = 1530) => { c.save(); c.font = '30px "PuHui-Bold"'; c.fillStyle = 'rgba(94,107,114,.95)'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W / 2, y); c.restore(); };

// ---------- 一个「折页镜头」：桌面＋纸＋笔画＋笔＋标签 ----------
// spec: { img:'pd/page1.png', cam:[...], strokes:[...], over(c,V,t) }
PD.paperShot = spec => ({
  draw(c, lt, t) {
    const img = IMG[spec.img]; const cam = camAt(spec.cam, t); const V = view(img, cam);
    desk(c); paper(c, img, V); strokes(c, img, V, spec.strokes || [], t);
    if (spec.over) spec.over(c, V, t, img);
    PD.pen(c, img, V, spec.strokes || [], t);
    PD.subtitle(c, t);
  }
});
})();
