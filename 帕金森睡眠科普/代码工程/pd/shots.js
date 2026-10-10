// 16 镜。时间全是全片时间（秒），取自 音频/时间轴.json 的词时间。镜头表：../镜头表.md
(() => {
const { C } = PD, AR = 3636 / 2573, P1 = 'pd/page1.png', P2 = 'pd/page2.png';
const W = 1080, H = 1920;
const OVER = k => k >= 1 ? 1 : k < .6 ? k / .6 * 1.07 : 1.07 - .07 * (k - .6) / .4;   // 砸入：冲过头 7% 再落定
const T = PD.tick, UL = PD.ul, RING = PD.ring;
const st = (at, dur, pts, o = {}) => ({ at, dur, pts, w: 15, ...o });

// ---- 第 1 页外侧（封面那一折）：1–4 镜共用一份笔画，前一镜画的留在纸上 ----
const COVER = [
  st(1.00, 0.34, T(0.714, 0.499, 0.012, AR), { w: 17 }),
  st(2.70, 0.32, UL(0.884, 0.924, 0.514, AR)),
  st(5.55, 0.34, T(0.714, 0.716, 0.012, AR), { w: 17 }),
  st(6.40, 0.40, UL(0.797, 0.870, 0.731, AR)),
  st(8.48, 0.22, [[0.900, 0.327], [0.955, 0.325]], { w: 13 }),
  st(8.72, 0.10, [[0.808, 0.351], [0.826, 0.351]], { w: 13, noPen: true }),
  st(9.90, 0.45, RING(0.745, 0.322, 0.054, 0.040, 1, 1.12)),
];
SCENES.p01 = PD.paperShot({ img: P1, strokes: COVER, cam: [
  [0, { u: 0.81, v: 0.235, vw: 0.30 }],
  [0.45, { u: 0.805, v: 0.505, vw: 0.215 }, 0.28],
  [2.60, { u: 0.86, v: 0.505, vw: 0.17 }, 0.28],
]});
SCENES.p02 = PD.paperShot({ img: P1, strokes: COVER, cam: [
  [0, { u: 0.86, v: 0.505, vw: 0.17 }],
  [3.70, { u: 0.805, v: 0.665, vw: 0.215 }, 0.30],
  [6.35, { u: 0.835, v: 0.69, vw: 0.17 }, 0.28],
]});
SCENES.p03 = PD.paperShot({ img: P1, strokes: COVER, cam: [
  [0, { u: 0.875, v: 0.35, vw: 0.25 }],
  [7.56, { vw: 0.165 }, 0.2, OVER],
], over: (c, V, t) => PD.hand(c, V, 0.88, 0.388, '不一定！', t, 7.95, { size: 88 }) });
SCENES.p04 = PD.paperShot({ img: P1, strokes: COVER, cam: [
  [0, { u: 0.80, v: 0.40, vw: 0.30 }],
  [9.65, { u: 0.765, v: 0.345, vw: 0.20 }, 0.28],
  [12.75, { u: 0.80, v: 0.33, vw: 0.26 }, 0.30],
], over: (c, V, t) => PD.label(c, V, 0.765, 0.418, '六到九成患者', t, 10.35, { size: 80 }) });

// ---- 第 2 页左折：原因 ----
const CAUSE = [
  st(16.10, 0.42, RING(0.045, 0.257, 0.022, 0.016, 1, 1.15)),
  st(16.55, 0.25, UL(0.067, 0.121, 0.266, AR)),
  st(17.35, 0.38, RING(0.045, 0.322, 0.022, 0.016, 1, 1.15)),
  st(17.85, 0.55, UL(0.067, 0.306, 0.352, AR)),
  st(19.20, 0.55, UL(0.067, 0.294, 0.416, AR)),
];
SCENES.p05 = PD.paperShot({ img: P2, strokes: CAUSE, cam: [
  [0, { u: 0.165, v: 0.24, vw: 0.30, r: 0.010 }],
  [15.95, { u: 0.165, v: 0.27, vw: 0.26 }, 0.28],
]});
SCENES.p06 = PD.paperShot({ img: P2, strokes: CAUSE, cam: [
  [0, { u: 0.165, v: 0.27, vw: 0.26, r: 0.010 }],
  [17.25, { v: 0.325 }, 0.30],
  [18.85, { v: 0.385 }, 0.30],
  [20.40, { u: 0.17, v: 0.40, vw: 0.25 }, 0.28],
]});

// ---- 第 1 页中折：五件事 ----
const HABIT = [
  st(40.55, 0.32, T(0.500, 0.410, 0.011, AR), { w: 16 }),
  st(41.60, 0.30, UL(0.380, 0.484, 0.428, AR)),
  st(42.85, 0.32, T(0.540, 0.482, 0.011, AR), { w: 16 }),
  st(44.35, 0.32, T(0.540, 0.556, 0.011, AR), { w: 16 }),
  st(47.70, 0.26, UL(0.466, 0.510, 0.641, AR)),
  st(49.05, 0.42, UL(0.509, 0.603, 0.668, AR)),
];
SCENES.p11 = PD.paperShot({ img: P1, strokes: HABIT, cam: [
  [0, { u: 0.49, v: 0.46, vw: 0.30 }],
  [39.60, { u: 0.46, v: 0.44, vw: 0.215 }, 0.28],
  [41.50, { u: 0.43, v: 0.43, vw: 0.17 }, 0.28],
]});
SCENES.p12 = PD.paperShot({ img: P1, strokes: HABIT, cam: [
  [0, { u: 0.43, v: 0.43, vw: 0.17 }],
  [42.62, { u: 0.46, v: 0.515, vw: 0.215 }, 0.30],
  [44.25, { u: 0.49, v: 0.55, vw: 0.18 }, 0.28],
]});
// 便签：钉在纸上（素材坐标），斜着拍下来
function sticky(c, V, t) {
  const at = 47.75; if (t < at) return;
  const k = clamp01((t - at) / 0.22), [x, y] = PD.toScr(V, 0.505, 0.745), s = V.s * 1.0;
  c.save(); c.translate(x + (1 - k) * 380, y + (1 - k) * 260); c.rotate(-0.07 + (1 - k) * 0.25); c.scale(s, s);
  const w = 260, h = 200;
  c.fillStyle = 'rgba(20,40,70,.22)'; c.fillRect(-w / 2 + 8, -h / 2 + 12, w, h);
  c.fillStyle = '#F6E08A'; c.fillRect(-w / 2, -h / 2, w, h);
  c.fillStyle = 'rgba(232,115,28,.55)'; c.fillRect(-45, -h / 2 - 14, 90, 30);
  c.font = '50px "LXGWWenKai-500"'; c.fillStyle = C.ink; c.textAlign = 'left'; c.textBaseline = 'middle';
  const n = Math.max(0, Math.ceil((t - at - 0.3) * 12));
  c.fillText([...'凌晨3点'].slice(0, n).join(''), -w / 2 + 26, -30);
  c.fillStyle = C.ac; c.fillText([...'翻身难'].slice(0, Math.max(0, n - 5)).join(''), -w / 2 + 26, 42);
  c.restore();
}
const clamp01 = x => Math.max(0, Math.min(1, x));
SCENES.p13 = PD.paperShot({ img: P1, strokes: HABIT, cam: [
  [0, { u: 0.48, v: 0.60, vw: 0.30 }],
  [45.95, { u: 0.49, v: 0.665, vw: 0.205 }, 0.2, OVER],
  [48.95, { u: 0.535, v: 0.69, vw: 0.18 }, 0.30],
], over: sticky });

// ---- 第 2 页中折：自测第 1 页，方框被快速打勾 ----
const COLS = [0.394, 0.449, 0.503, 0.557, 0.613], ROWS = [0.320, 0.404, 0.490, 0.575, 0.661, 0.746, 0.832, 0.917];
const QUIZ = (() => { const r = U.rng(5), out = []; ROWS.forEach((v, i) => { const col = COLS[[1, 3, 2, 0, 2, 1, 3, 2][i]];
  out.push(st(51.10 + i * 0.36, 0.2, T(col, v - 0.004, 0.0095, AR), { w: 15 })); }); return out; })();
SCENES.p14 = PD.paperShot({ img: P2, strokes: QUIZ, cam: [
  [0, { u: 0.50, v: 0.50, vw: 0.33, r: 0.010 }],
  [50.50, { u: 0.505, v: 0.47, vw: 0.275 }, 0.28],
  [52.40, { u: 0.505, v: 0.52, vw: 0.30 }, 0.30],
], over: (c, V, t) => PD.label(c, V, 0.52, 0.262, '15题 · 3分钟', t, 52.50, { size: 76, r: -0.04 }) });

// ---- 第 1 页左折：测完以后，18 分及以上 ----
const SCORE = [st(55.35, 0.45, RING(0.118, 0.452, 0.088, 0.026, 1, 1.1))];
SCENES.p15 = PD.paperShot({ img: P1, strokes: SCORE, cam: [
  [0, { u: 0.17, v: 0.40, vw: 0.33 }],
  [55.12, { u: 0.165, v: 0.465, vw: 0.27 }, 0.2, OVER],
  [57.35, { u: 0.165, v: 0.53, vw: 0.27 }, 0.30],
], over: (c, V, t) => PD.label(c, V, 0.20, 0.535, '交给医生', t, 57.48, { size: 84, bg: C.ac }) });

// ---- 第 16 镜：拉远看整张折页 → 左、中两折合上 → 推到封面，贴标签 ----
SCENES.p16 = { draw(c, lt, t) {
  const img = IMG[P1], cam = PD.camAt([
    [0, { u: 0.50, v: 0.50, vw: 0.72 }],
    [58.62, { vw: 1.10 }, 0.30],
    [59.55, { u: 0.832, v: 0.47, vw: 0.40 }, 0.30],
    [60.95, { u: 0.832, v: 0.58, vw: 0.36 }, 0.28],
  ], t), V = PD.view(img, cam);
  PD.desk(c);
  const f = clamp01((t - 59.0) / 0.5), th = f * Math.PI / 2;   // 折叠角
  const iw = img.width, ih = img.height, x1 = 0.665 * iw, pw = 0.335 * iw;
  PD.withWorld(c, V, () => {
    c.save(); c.shadowColor = 'rgba(20,40,70,.28)'; c.shadowBlur = 40 / V.s; c.shadowOffsetY = 14 / V.s;
    c.fillStyle = '#fff'; c.fillRect(x1, 0, iw - x1, ih); c.restore();
    c.drawImage(img, x1, 0, iw - x1, ih, x1, 0, iw - x1, ih);           // 封面不动
    if (f < 1) {                                                         // 中折绕 x1 折向封面背后，左折跟着折
      const sx = Math.cos(th), w2 = pw * sx;
      c.drawImage(img, 0.335 * iw, 0, pw, ih, x1 - w2, 0, w2, ih);
      c.fillStyle = `rgba(27,63,122,${0.35 * f})`; c.fillRect(x1 - w2, 0, w2, ih);
      const w1 = pw * Math.cos(Math.min(Math.PI / 2, th * 1.15));
      c.drawImage(img, 0, 0, pw, ih, x1 - w2 - w1, 0, w1, ih);
      c.fillStyle = `rgba(27,63,122,${0.2 * f})`; c.fillRect(x1 - w2 - w1, 0, w1, ih);
    }
  });
  PD.label(c, V, 0.832, 0.66, '用药请遵医嘱', t, 59.87, { size: 84 });
  if (t > 61.0) PD.note(c, '本视频仅供患者教育，不能替代医生的诊断和治疗', 1240);
  PD.subtitle(c, t);
}};
})();
