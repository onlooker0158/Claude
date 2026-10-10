// 7–10 镜：一夜的药效曲线（折页「谷底」图的重画版，同一套色，白卡片放在同一张桌面上）。
// 世界坐标 = 1080×1920 的一张白卡；镜头用 PD.camAt，u/v 是世界 0..1，vw 是可见宽度比例。
(() => {
const { C } = PD, W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
const X = h => 130 + (h - 18) / 16 * 820;                     // 18:00 → 10:00（次日）
const conc = h => {                                             // 概念示意：18:00 一次口服，次日 7:00 再服
  const b = (td) => { const d = h - td; return d <= 0 ? 0 : (Math.exp(-0.15 * d) - Math.exp(-2.6 * d)); };
  return (b(18) + b(31)) / 0.83;
};
const Y = cv => 1250 - cv * 430, YC = Y(0.45), YS = Y(0.62);  // 控制线、平稳线
const moonPos = h => { const k = clamp((h - 18) / 16); return [lerp(170, 910, k), 560 - Math.sin(k * Math.PI) * 300]; };

let cardCv = null;
function card() {                                              // 静态底：白卡、窗、床、坐标轴（缓存）
  if (cardCv) return cardCv;
  cardCv = document.createElement('canvas'); cardCv.width = W; cardCv.height = H; const g = cardCv.getContext('2d');
  g.save(); g.shadowColor = 'rgba(20,40,70,.25)'; g.shadowBlur = 40; g.shadowOffsetY = 14; g.fillStyle = C.sf; g.beginPath(); g.roundRect(60, 150, 960, 1480, 28); g.fill(); g.restore();
  // 窗
  g.fillStyle = C.night; g.beginPath(); g.roundRect(110, 200, 860, 470, 18); g.fill();
  const r = U.rng(3); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${.25 + r() * .5})`; g.beginPath(); g.arc(130 + r() * 820, 220 + r() * 300, 1.5 + r() * 2.2, 0, 7); g.fill(); }
  // 床（剪影）
  g.fillStyle = '#2C5491'; g.beginPath(); g.roundRect(240, 560, 600, 110, [24, 24, 0, 0]); g.fill();
  g.beginPath(); g.roundRect(220, 500, 70, 170, [18, 18, 0, 0]); g.fill();
  g.fillStyle = '#4A70AA'; g.beginPath(); g.roundRect(310, 530, 170, 54, 27); g.fill();
  g.fillStyle = '#3A62A0'; g.beginPath(); g.moveTo(470, 590); g.bezierCurveTo(560, 520, 700, 530, 840, 570); g.lineTo(840, 600); g.lineTo(470, 600); g.fill();
  // 窗框
  g.strokeStyle = C.sf; g.lineWidth = 14; g.strokeRect(110, 200, 860, 470); g.beginPath(); g.moveTo(540, 200); g.lineTo(540, 470); g.stroke();
  // 夜间带
  g.fillStyle = 'rgba(27,63,122,.07)'; g.fillRect(X(22), 760, X(31) - X(22), 520);
  g.font = '34px "PuHui-Bold"'; g.fillStyle = C.sub; g.textAlign = 'center'; g.fillText('夜间 22:00 – 07:00', (X(22) + X(31)) / 2, 800);
  // 轴
  g.strokeStyle = '#C9D3D8'; g.lineWidth = 4; g.beginPath(); g.moveTo(110, 1282); g.lineTo(970, 1282); g.stroke();
  g.font = '32px "PuHui-Bold"'; g.fillStyle = C.sub; ['18:00', '22:00', '2:00', '6:00', '10:00'].forEach((s, i) => g.fillText(s, X(18 + i * 4), 1330));
  // 控制线
  g.setLineDash([22, 16]); g.strokeStyle = C.ac; g.lineWidth = 6; g.beginPath(); g.moveTo(110, YC); g.lineTo(970, YC); g.stroke(); g.setLineDash([]);
  g.font = '34px "PuHui-Black"'; g.fillStyle = C.ac; g.textAlign = 'left'; g.fillText('症状控制线', X(20), YC - 18);
  g.font = '28px "PuHui-Bold"'; g.fillStyle = C.sub; g.textAlign = 'center'; g.fillText('曲线为概念示意，不代表任何药物的实测数据', 540, 718);
  return cardCv;
}
function curvePath(c, h0, h1) { c.beginPath(); for (let h = h0; h <= h1 + 1e-6; h += 0.05) { const x = X(h), y = Y(conc(h)); h === h0 ? c.moveTo(x, y) : c.lineTo(x, y); } }

// 状态：给定全片时间 t，口服曲线画到几点、绿线画到几点、月亮在哪
function headAt(t) {
  if (t < 22.2) return 20.6;
  if (t < 27.0) return lerp(20.6, 27.0, (t - 22.2) / 4.8);
  if (t < 28.4) return lerp(27.0, 30.4, (t - 27.0) / 1.4);       // 后半夜加速往下滑，28.4 落进谷底
  if (t < 33.0) return 30.4;
  return Math.min(34, lerp(30.4, 34, (t - 33.0) / 0.9));
}
const greenAt = t => t < 33.85 ? 18 : Math.min(34, lerp(18, 34, (t - 33.85) / 1.5));

function draw(c, t, cam) {
  const V = PD.view({ width: W, height: H }, { ...cam, r: 0.006 });
  PD.desk(c);
  PD.withWorld(c, V, () => {
    c.drawImage(card(), 0, 0);
    // 月亮：沿弧走，跟曲线笔头同一个钟点
    const hm = t < 36 ? headAt(t) : lerp(18.5, 33.5, clamp((t - 36.0) / 3.0));
    const [mx, my] = moonPos(hm);
    c.save(); c.beginPath(); c.roundRect(110, 200, 860, 470, 18); c.clip();
    c.fillStyle = '#F2B33D'; c.beginPath(); c.arc(mx, my, 54, 0, 7); c.fill(); c.fillStyle = C.night; c.beginPath(); c.arc(mx - 22, my - 14, 48, 0, 7); c.fill();
    c.restore();
    // 口服曲线（灰）
    const h1 = headAt(t), dim = t > 33.6 ? 0.45 : 1;
    c.save(); c.globalAlpha = dim; c.strokeStyle = '#8E979C'; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round'; curvePath(c, 18, h1); c.stroke(); c.restore();
    // 笔头圆点
    if (t < 33.6) { const x = X(h1), y = Y(conc(h1)); c.fillStyle = C.ac; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); c.strokeStyle = C.sf; c.lineWidth = 6; c.stroke(); }
    // 平稳线（绿）
    const g1 = greenAt(t);
    if (g1 > 18) { c.strokeStyle = C.ac2; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); for (let h = 18; h <= g1; h += 0.05) { const y = YS + Math.sin(h * 2.2) * 4; h === 18 ? c.moveTo(X(h), y) : c.lineTo(X(h), y); } c.stroke(); }
  });
  // 标签（钉在世界坐标上）
  const L = (wx, wy, text, at, o) => PD.label(c, V, wx / W, wy / H, text, t, at, o);
  if (t < 29.2) PD.hand(c, V, X(26) / W, 960 / H, '后半夜', t, 24.70, { size: 84, r: -0.04 });
  if (t < 33.6) { L(590, 1225, '清晨谷底', 28.40, { size: 80 }); if (t < 32.6) L(900, 1106, '翻身难', 29.25, { size: 52, bg: C.ac, r: 0.03 }); if (t < 32.6) L(910, 1192, '早上僵硬', 30.70, { size: 52, bg: C.ac, r: -0.02 }); }
  L(X(22.5), YS - 90, '全夜平稳', 35.15, { size: 80, bg: C.ac2 });
  L(X(31), YS - 90, '和医生商量', 36.83, { size: 76 });
  PD.subtitle(c, t);
}
const shot = track => ({ draw(c, lt, t) { draw(c, t, PD.camAt(track, t)); } });
SCENES.p07 = shot([
  [0, { u: 0.50, v: 0.42, vw: 0.82 }],
  [24.65, { u: 0.56, v: 0.50, vw: 0.72 }, 0.30],
  [26.30, { u: 0.62, v: 0.55, vw: 0.60 }, 0.28],
]);
SCENES.p08 = shot([
  [0, { u: 0.62, v: 0.55, vw: 0.60 }],
  [28.35, { u: 0.66, v: 0.58, vw: 0.56 }, 0.2, k => k >= 1 ? 1 : k < .6 ? k / .6 * 1.07 : 1.07 - .07 * (k - .6) / .4],
  [30.60, { u: 0.66, v: 0.56, vw: 0.62 }, 0.28],
]);
SCENES.p09 = shot([
  [0, { u: 0.66, v: 0.56, vw: 0.62 }],
  [32.50, { u: 0.52, v: 0.52, vw: 0.78 }, 0.28],
  [35.05, { u: 0.42, v: 0.48, vw: 0.62 }, 0.28],
]);
SCENES.p10 = shot([
  [0, { u: 0.42, v: 0.48, vw: 0.62 }],
  [36.02, { u: 0.50, v: 0.40, vw: 1.0 }, 0.30],
]);
})();
