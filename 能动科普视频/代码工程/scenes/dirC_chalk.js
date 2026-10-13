// 方向 C · 黑板讲堂：一面大黑板，粉笔边讲边画。左：一架梯子撞到「人人能到的高度」；右：高波动世界的重尾曲线。色板 chalk。
SCENES['dirC_chalk'] = (() => {
  const W = 1920, H = 1080, { clamp, lerp, rng, ss } = U, P = PAINT;
  const BG = '#23302B', INK = '#F1EFE6', SUB = '#A9B3AA', YEL = '#F4D35E', ORG = '#E87D5A';
  const HAND = '"LXGWWenKai-500"';
  const board = () => P.cached('c_board', W, H, (g) => {
    g.fillStyle = BG; g.fillRect(0, 0, W, H);
    // 擦过的粉笔雾：几道大弧形的淡白
    const r = rng(21); g.globalAlpha = .022; g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { g.lineWidth = 60 + r() * 120; const x = r() * W, y = r() * H * .85; g.beginPath(); g.arc(x, y, 200 + r() * 300, r() * 6, r() * 6 + 1.2); g.stroke(); }
    g.globalAlpha = 1; g.drawImage(P.grain('c_g', .12, [255, 255, 255], .08), 0, 0);
    // 粉笔槽
    g.fillStyle = '#5a4430'; g.fillRect(0, 990, W, 90); g.fillStyle = '#6e5540'; g.fillRect(0, 990, W, 14);
    g.fillStyle = '#f4f1e6'; g.save(); g.translate(1540, 1012); g.rotate(-.06); g.fillRect(0, 0, 110, 18); g.restore();
    g.fillStyle = YEL; g.save(); g.translate(1690, 1016); g.rotate(.04); g.fillRect(0, 0, 70, 18); g.restore();
    g.fillStyle = '#2b2b2b'; g.fillRect(260, 1004, 200, 40); g.fillStyle = '#c9b48a'; g.fillRect(260, 1004, 200, 14);
  });
  // 粉笔质感：画到离屏层，再用噪点 destination-out 打出颗粒
  const chalkLayer = (key, fn) => { const L = P.scratch(key), g = L.getContext('2d'); g.reset(); fn(g);
    g.globalCompositeOperation = 'destination-out'; g.drawImage(P.cached('c_holes', W, H, (h) => { const r = rng(4); h.fillStyle = '#000'; for (let i = 0; i < 90000; i++) { h.globalAlpha = .25 + r() * .6; h.fillRect(r() * W, r() * H, 1 + r() * 2, 1); } }), 0, 0); return L; };
  const stroke = (g, pts, col, w, q = 1, seed = 1) => { if (q <= 0) return; const all = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 10; k++) all.push([lerp(pts[i][0], pts[i + 1][0], k / 10), lerp(pts[i][1], pts[i + 1][1], k / 10)]); all.push(pts[pts.length - 1]);
    const n = Math.max(2, Math.ceil(all.length * clamp(q))); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); P.roughPath(g, all.slice(0, n), { amp: 1.6, seed, step: 4 }); g.stroke(); };
  const write = (g, s, x, y, size, col, q = 1) => { const n = Math.ceil(s.length * clamp(q)); g.font = `${size}px ${HAND}`; g.fillStyle = col; g.fillText(s.slice(0, n), x, y); };
  return {
    draw(c, lt) {
      c.drawImage(board(), 0, 0);
      const t = MO.step(lt, 12);
      const L = chalkLayer('cL', (g) => {
        // 左：梯子
        const base = 860, top = 330, lx = 300, rx = 430, q1 = ss(0, .8, t);
        stroke(g, [[lx, base], [lx + 20, top]], INK, 7, q1, 1); stroke(g, [[rx, base], [rx + 20, top]], INK, 7, q1, 2);
        for (let i = 0; i < 9; i++) { const y = base - 30 - i * 58; const f = (base - y) / (base - top); stroke(g, [[lx + 20 * f, y], [rx + 20 * f, y]], INK, 6, ss(.2 + i * .06, .3 + i * .06, t), 10 + i); }
        // 天花板虚线：人人能到的高度
        const q2 = ss(.9, 1.4, t); for (let x = 120; x < 820; x += 46) stroke(g, [[x, 300], [x + 26, 300]], YEL, 6, q2 * 1.2 - (x - 120) / 800, 30 + x);
        write(g, '人人能到的高度', 470, 280, 46, YEL, ss(1.2, 1.7, t));
        write(g, '稳态', 250, 940, 58, INK, ss(.6, .9, t));
        // 中间分隔
        stroke(g, [[900, 200], [905, 930]], SUB, 3, ss(1.4, 1.8, t), 50);
        // 右：坐标轴＋高波动曲线（多数时候平，偶尔一次大跳——重尾）
        stroke(g, [[1000, 860], [1820, 860]], INK, 5, ss(1.5, 1.8, t), 60); stroke(g, [[1000, 860], [1000, 220]], INK, 5, ss(1.5, 1.8, t), 61);
        const r = rng(8), pts = []; for (let i = 0; i <= 80; i++) { const x = 1010 + i * 10; let y = 760 + (r() - .5) * 70; if (i === 52) y = 260; if (i === 51 || i === 53) y = 560; if (i === 24) y = 520; pts.push([x, y]); }
        stroke(g, pts, ORG, 6, ss(1.8, 2.6, t), 70);
        write(g, '高波动世界', 1040, 200, 58, INK, ss(2.4, 2.8, t));
        // 圈出那一次大跳
        const q3 = ss(2.7, 3.1, t); if (q3 > 0) { const e = []; for (let a = 0; a <= 6.6 * q3; a += .15) e.push([1530 + Math.cos(a - 1.4) * 70, 300 + Math.sin(a - 1.4) * 110]); if (e.length > 1) stroke(g, e, YEL, 5, 1, 80); }
      });
      c.drawImage(L, 0, 0);
      // 粉笔灰：刚写过的地方飘一点
    },
  };
})();
