// 能动：稳态生存的观念陷阱 —— 一整面黑板，粉笔边讲边画。
// 结构：世界坐标里一行一节、一块一个比喻（位置由 工具/shots.py 算好放在 window.NENG.pos）；
// 相机只由时间算（CAM.track，事件同样来自 shots.py）；每块的笔画按口播句子的起点定时（S(i) = 第 i 句开始）。
// 粉笔质感：笔画先画到离屏层，再用世界坐标里的颗粒图案 destination-out 打掉一部分，所以颗粒跟着黑板走、不跟着屏幕爬。
SCENES['neng_board'] = (() => {
  const W = 1920, H = 1080, { clamp, lerp, rng } = U, P = PAINT, N = window.NENG;
  const BG = '#23302B', INK = '#F1EFE6', SUB = '#A9B3AA', YEL = '#F4D35E', ORG = '#E87D5A';
  const HAND = '"LXGWWenKai-500"';
  const S = i => N.items[i][0], E = i => N.items[i][1];
  const st = t => MO.step(t, 24);                        // 粉笔笔画按 24fps 一顿一顿长出来
  const st12 = t => MO.step(t, 12);                      // 物件动作（骰子、小车、转轮）12fps
  const camAt = t => CAM.track({ x: N.pos.b_dice.x + 800, y: N.pos.b_dice.y + 450, z: 1.06 }, N.cam, t);

  // ---------- 黑板底：世界坐标里的平铺纹理 ----------
  const boardTile = () => P.cached('nb_tile', 1024, 1024, (g) => {
    g.fillStyle = BG; g.fillRect(0, 0, 1024, 1024);
    const r = rng(31); g.lineCap = 'round';
    for (let i = 0; i < 18; i++) { g.globalAlpha = .006 + r() * .01; g.strokeStyle = '#fff'; g.lineWidth = 50 + r() * 110; const x = r() * 1024, y = r() * 1024, rr = 160 + r() * 260, a0 = r() * 6; for (const ox of [-1024, 0, 1024]) for (const oy of [-1024, 0, 1024]) { g.beginPath(); g.arc(x + ox, y + oy, rr, a0, a0 + 1.1); g.stroke(); } }
    g.globalAlpha = 1;
    const id = g.getImageData(0, 0, 1024, 1024), d = id.data;
    for (let k = 0; k < d.length; k += 4) { const n = (r() - .5) * 10; d[k] += n; d[k + 1] += n; d[k + 2] += n; }
    g.putImageData(id, 0, 0);
  });
  const holesTile = () => P.cached('nb_holes', 512, 512, (h) => { const r = rng(4); h.fillStyle = '#000'; for (let i = 0; i < 26000; i++) { h.globalAlpha = .2 + r() * .65; h.fillRect(r() * 512, r() * 512, 1 + r() * 2.2, 1 + r() * 1.2); } });
  // 半擦掉的旧板书：板擦来回擦过的雾痕＋没擦干净的旧线（低透明度，世界坐标平铺，标记离开 tile 边缘，拼接无缝）
  const ghostTile = () => P.cached('nb_ghost', 2048, 2048, (g) => {
    const r = rng(77), T = 2048; g.filter = 'blur(5px)'; g.strokeStyle = '#e8ecdf'; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {            // 板擦擦痕：一把板擦来回擦出的一束平行细条纹，整束离开 tile 边缘
      const L = 140 + r() * 200, x = L + 80 + r() * (T - 2 * L - 160), y = 160 + r() * (T - 320), a = (r() - .5) * .35;
      g.save(); g.translate(x, y); g.rotate(a);
      for (let k = 0; k < 16; k++) { g.globalAlpha = .018 + r() * .03; g.lineWidth = 3 + r() * 5; const yy = k * 6 - 48, l = L * (.7 + r() * .3);
        g.beginPath(); g.moveTo(-l, yy); g.quadraticCurveTo(0, yy + (r() - .5) * 10, l, yy + (r() - .5) * 6); g.stroke(); }
      g.restore(); }
    g.filter = 'none'; g.globalAlpha = 1;
  });
  let PAT = null, HPAT = null, GPAT = null;

  // ---------- 粉笔笔画库 ----------
  // 每个图元：t0 起、dur 内画完；记录「正在画的笔尖」给粉笔头用
  function kit(g, t, ox, oy, tips) {
    const tip = (x, y, t0, dur) => { if (t >= t0 - 0.05 && t < t0 + dur + 0.35) { const q = g.getTransform().transformPoint(new DOMPoint(x, y)); tips.push({ sx: q.x, sy: q.y, t0, live: t < t0 + dur }); } };
    const resample = (pts) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } out.push(pts[pts.length - 1]); return out; };
    const K = {
      t,
      p: (t0, dur) => clamp((st(t) - t0) / dur),
      line(pts, t0, dur = 0.6, o = {}) {
        if (t < t0) return; const all = resample(pts), q = K.p(t0, dur), n = Math.max(2, Math.ceil(all.length * q));
        g.save(); g.strokeStyle = o.col || INK; g.lineWidth = (o.w || 6) * 1.25; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = o.a ?? 1;
        if (o.dash) g.setLineDash(o.dash);
        P.roughPath(g, all.slice(0, n), { amp: o.amp ?? 1.4, seed: o.seed || (pts.length * 7 + (pts[0][0] | 0)), step: 5 }); g.stroke(); g.restore();
        const e = all[n - 1]; tip(e[0], e[1], t0, dur);
      },
      ell(cx, cy, rx, ry, t0, dur = 0.6, o = {}) { const a0 = o.a0 ?? -2.2, sweep = o.sweep ?? 6.4, pts = []; for (let k = 0; k <= 48; k++) { const a = a0 + sweep * k / 48; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } K.line(pts, t0, dur, o); },
      rect(x, y, w, h, t0, dur = 0.7, o = {}) { K.line([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y - 2]], t0, dur, o); },
      arrow(a, b, t0, dur = 0.5, o = {}) {
        K.line([a, b], t0, dur, o); if (K.p(t0, dur) < 1) return;
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = o.head || 28;
        K.line([[b[0] - Math.cos(ang - .45) * L, b[1] - Math.sin(ang - .45) * L], b, [b[0] - Math.cos(ang + .45) * L, b[1] - Math.sin(ang + .45) * L]], t0 + dur, 0.15, o);
      },
      text(s, x, y, size, t0, o = {}) {
        if (t < t0) return; const cps = o.cps || 9, n = Math.min(s.length, Math.floor((st(t) - t0) * cps) + 1);
        g.save(); g.font = `${size}px ${o.font || HAND}`; g.fillStyle = o.col || INK; g.textBaseline = 'alphabetic';
        const full = g.measureText(s).width, x0 = o.align === 'center' ? x - full / 2 : o.align === 'right' ? x - full : x;
        const k = o.slam ? MO.slam(t, t0) : 1;
        if (k !== 1) { g.translate(x0 + full / 2, y - size * .35); g.scale(k, k); g.translate(-(x0 + full / 2), -(y - size * .35)); }
        g.fillText(s.slice(0, n), x0, y); const w = g.measureText(s.slice(0, n)).width; g.restore();
        tip(x0 + w, y - size * .3, t0, s.length / cps);
      },
      dot(x, y, r, t0, o = {}) { if (t < t0) return; g.save(); g.fillStyle = o.col || INK; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); tip(x, y, t0, 0.08); },
      cross(x, y, s, t0, dur = 0.5, o = {}) { K.line([[x - s, y - s], [x + s, y + s]], t0, dur / 2, { col: ORG, w: 9, ...o }); K.line([[x + s, y - s], [x - s, y + s]], t0 + dur / 2, dur / 2, { col: ORG, w: 9, ...o }); },
      check(x, y, s, t0, dur = 0.35, o = {}) { K.line([[x - s, y], [x - s * .3, y + s * .7], [x + s, y - s * .8]], t0, dur, { col: YEL, w: 7, ...o }); },
      hatch(x, y, w, h, t0, dur = 0.8, o = {}) { // 粉笔侧锋涂色：斜线排满一块
        if (t < t0) return; const q = K.p(t0, dur), n = Math.ceil((w + h) / 16 * q);
        g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = o.col || INK; g.globalAlpha = o.a ?? .45; g.lineWidth = 5;
        for (let i = 0; i < n; i++) { const d = i * 16; g.beginPath(); g.moveTo(x + d, y); g.lineTo(x + d - h, y + h); g.stroke(); } g.restore();
        tip(x + Math.min(w, n * 16), y + 4, t0, dur);
      },
      // 在物件自己的局部变换里画（物件会动：骰子跳、钥匙晃）
      at(x, y, rot, sc, fn) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); fn(); g.restore(); },
      g,
    };
    return K;
  }

  // ---------- 小物件 ----------
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(K, cx, cy, s, t0, face, hopFrom, hopTo, o = {}) {
    // hopFrom..hopTo：一跳一跳（12fps），每跳换一面；o.dx 一路滚过去的水平位移
    let y = 0, x = 0, rot = 0, f = face; const t = K.t;
    if (hopTo && t > hopFrom) { const u = st12(Math.min(t, hopTo)) - hopFrom, per = 0.42, k = Math.floor(u / per), ph = (u % per) / per, done = t >= hopTo;
      y = done ? 0 : -Math.sin(ph * Math.PI) * (o.h || 70); rot = done ? 0 : (ph - .5) * .5 * (k % 2 ? 1 : -1); f = ((face + k) % 6) + 1; x = (o.dx || 0) * clamp((Math.min(t, hopTo) - hopFrom) / (hopTo - hopFrom)); }
    K.at(cx + x, cy + y, rot, 1, () => {
      const h = s / 2; K.line([[-h, -h + 14], [-h + 14, -h], [h - 14, -h], [h, -h + 14], [h, h - 14], [h - 14, h], [-h + 14, h], [-h, h - 14], [-h, -h + 14]], t0, 0.8, { w: 7, seed: 3 });
      if (t > t0 + 0.8) PIPS[f].forEach(([a, b], i) => K.dot(a * s * .27, b * s * .27, s * .07, t0 + 0.85 + i * 0.06));
    });
  }
  const house = (K, x, y, s, t0, o = {}) => { K.rect(x - s / 2, y - s * .2, s, s * .7, t0, .5, o); K.line([[x - s * .62, y - s * .15], [x, y - s * .7], [x + s * .62, y - s * .15]], t0 + .5, .35, o); K.rect(x - s * .1, y + s * .2, s * .2, s * .3, t0 + .85, .25, o); };
  const smoke = (K, x, y, t0) => { if (K.t < t0) return; const ph = st12(K.t) * 2; for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 10; i++) { const q = i / 10; pts.push([x + Math.sin(q * 5 + ph + k * 2) * 10 + k * 6, y - q * 70 - k * 30]); } K.line(pts, t0 + k * .2, .4, { w: 4, col: SUB, seed: 50 + k }); } };
  const coinStack = (K, x, yb, n, t0, col = INK) => { for (let i = 0; i < n; i++) { const y = yb - i * 30; K.line([[x - 110, y], [x + 110, y], [x + 120, y - 24], [x - 100, y - 24], [x - 110, y]], t0 + i * .1, .12, { w: 5, col, seed: 300 + i }); } };
  const bird = (K, x, y, t0, tall = 0) => { const o = { w: 6, seed: 70 + (x | 0) };
    K.line([[x - 40, y], [x - 30, y - 30 - tall * .4], [x, y - 40 - tall * .6], [x + 30, y - 25], [x + 35, y], [x - 40, y]], t0, .3, o);
    K.line([[x + 6, y - 40 - tall * .6], [x + 10, y - 70 - tall], [x + 26, y - 80 - tall], [x + 34, y - 64 - tall], [x + 26, y - 45]], t0 + .3, .2, o);
    K.line([[x + 34, y - 74 - tall], [x + 52, y - 70 - tall], [x + 36, y - 64 - tall]], t0 + .5, .1, o);
    K.line([[x - 40, y], [x - 70, y + 10]], t0 + .55, .08, o); };

  // ---------- 30 块板书 ----------
  const B = {
    b_dice(K) {
      die(K, 520, 470, 300, S(0) + 0.05, 3, S(0) + 1.0, S(1) - 0.1);
      // 勋章
      K.line([[990, 120], [1050, 240], [1110, 120]], S(1) + .1, .4, { w: 7 });
      K.ell(1050, 310, 80, 80, S(1) + .45, .6, { w: 7 });
      const star = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 22 : 50; star.push([1050 + Math.cos(a) * r, 310 + Math.sin(a) * r]); } K.line(star, S(1) + 1.05, .5, { col: YEL, w: 6 });
      K.text('功成名就', 1050, 450, 60, S(1) + 1.4, { align: 'center' });
      // 沙漏：上半的沙一格格漏光
      const hx = 1360, hy = 560; K.line([[hx - 90, hy - 170], [hx + 90, hy - 170], [hx + 10, hy], [hx + 90, hy + 170], [hx - 90, hy + 170], [hx - 10, hy], [hx - 90, hy - 170]], S(2) - .25, .6, { w: 6 });
      if (K.t > S(2) + .4) { const q = clamp((st12(K.t) - S(2) - .4) / 2.2), g = K.g;
        g.save(); g.fillStyle = YEL; g.globalAlpha = .75; const top = 150 * (1 - q); g.beginPath(); g.moveTo(hx - 70 * (1 - q) - 8, hy - 10 - top); g.lineTo(hx + 70 * (1 - q) + 8, hy - 10 - top); g.lineTo(hx, hy - 10); g.fill();
        const b = 150 * q; g.beginPath(); g.moveTo(hx - 80, hy + 160); g.lineTo(hx + 80, hy + 160); g.lineTo(hx + 80 - b * .3, hy + 160 - b * .6); g.lineTo(hx - 80 + b * .3, hy + 160 - b * .6); g.fill();
        if (q < 1) { g.fillRect(hx - 2, hy - 10, 4, 160 - b * .6); } g.restore(); }
      K.text('垂垂老矣', 1180, 800, 52, S(2) + .9, { col: SUB });
    },
    b_reborn(K) {
      const cx = 260, cy = 400; K.ell(cx, cy, 150, 150, S(3) + .05, 1.2, { a0: -1.4, sweep: 5.4, w: 7, col: YEL });
      K.arrow([cx + Math.cos(4.0) * 150 - 2, cy + Math.sin(4.0) * 150 - 30], [cx + Math.cos(4.0) * 150 + 26, cy + Math.sin(4.0) * 150 - 2], S(3) + 1.2, .1, { col: YEL, w: 7 });
      K.text('下一世', cx, cy + 22, 64, S(3) + .6, { align: 'center' });
      die(K, 480, 640, 120, S(4) - .3, 5, S(4) + .1, S(5) - .1, { dx: 120, h: 90 });
      house(K, 790, 470, 230, S(5) + .05); smoke(K, 850, 300, S(5) + 1.1);
      K.text('普通家庭', 790, 690, 52, S(5) + 1.0, { align: 'center', col: SUB });
      // 宝箱，打叉
      K.rect(970, 420, 230, 150, S(6) + .05, .6); K.line([[970, 420], [990, 350], [1180, 350], [1200, 420]], S(6) + .6, .4); K.rect(1068, 410, 34, 40, S(6) + 1.0, .2, { col: YEL });
      K.cross(1085, 460, 140, S(6) + 1.4, .45);
      // 书：字被板擦一行行擦掉
      const bx = 1290, by = 330; K.rect(bx, by, 260, 330, S(7) - .5, .6); K.line([[bx + 130, by], [bx + 130, by + 330]], S(7) - .1, .2);
      const wipe = K.t > S(7) + .7 ? clamp((st12(K.t) - S(7) - .7) / 1.6) : 0;
      for (let i = 0; i < 7; i++) { const y = by + 50 + i * 40; if (i / 7 >= wipe) { K.line([[bx + 20, y], [bx + 112, y]], S(7) + .05 + i * .06, .1, { w: 4, col: SUB, seed: 400 + i }); K.line([[bx + 148, y], [bx + 240, y]], S(7) + .1 + i * .06, .1, { w: 4, col: SUB, seed: 420 + i }); } }
      if (wipe > 0 && wipe < 1) { const g = K.g, ey = by + 40 + wipe * 300; g.save(); g.fillStyle = '#6e5540'; g.fillRect(bx + 60, ey - 26, 150, 52); g.fillStyle = '#c9b48a'; g.fillRect(bx + 60, ey + 10, 150, 16); g.restore(); }
      K.text('被忘掉', 1420, 740, 52, S(7) + 1.6, { align: 'center', col: SUB });
    },
    b_door(K) {
      const x0 = 650, y0 = 170, w = 300, h = 520;
      K.rect(x0 - 20, y0 - 20, w + 40, h + 20, S(8) - .3, .9, { w: 7 });
      const open = K.t > S(9) + .2 ? clamp((st12(K.t) - S(9) - .2) / 1.0) : 0, dw = w * Math.cos(open * 1.25);
      if (open > 0) K.hatch(x0, y0, w, h, S(9) + .2, .4, { a: .28, col: SUB });
      K.line([[x0, y0], [x0 + dw, y0 + 30 * open], [x0 + dw, y0 + h - 30 * open], [x0, y0 + h], [x0, y0]], S(8) + .3, .6, { w: 7, seed: 9 });
      K.dot(x0 + dw - 34 * Math.cos(open * 1.25), y0 + h / 2, 10, S(8) + .9, { col: YEL });
      K.text('后门儿', 1130, 160, 56, S(8) + .7, { align: 'center', col: SUB });
      // 说明书从门里滑出来
      if (K.t > S(9) + 1.1) { const q = U.ease.out(clamp((st12(K.t) - S(9) - 1.1) / .7)); K.at(lerp(800, 1130, q), lerp(430, 470, q), lerp(.2, -.08, q), lerp(.4, 1, q), () => {
        K.rect(-120, -160, 240, 320, S(9) + 1.1, .4, { w: 7, col: YEL }); K.text('人生', 0, -40, 64, S(9) + 1.5, { align: 'center', col: YEL, cps: 14 }); K.text('说明书', 0, 50, 64, S(9) + 1.65, { align: 'center', col: YEL, cps: 14 }); }); }
      K.text('？', 1400, 520, 300, S(10), { col: ORG, slam: true, cps: 30 });
    },
    b_manual(K) {
      K.line([[160, 110], [790, 90], [800, 120], [810, 90], [1440, 110], [1440, 800], [810, 780], [800, 810], [790, 780], [160, 800], [160, 110]], S(11) - .5, .8, { w: 6 });
      K.text('人生说明书', 230, 210, 72, S(11) - .05, { col: YEL, cps: 12 });
      K.text('① 尽快去一个大城市', 230, 320, 48, S(11) + .5, { cps: 10 });
      [[880, 300, 60, 150], [950, 250, 60, 200], [1020, 320, 70, 130], [1100, 220, 55, 230], [1165, 290, 70, 160], [1245, 340, 60, 110]].forEach(([x, y, w, h], i) => K.rect(x, y, w, h, S(11) + 1.6 + i * .15, .2, { w: 5, seed: 500 + i }));
      K.text('② 掌握几项可迁移的技能', 230, 430, 48, S(12) - .05, { cps: 12 });
      K.line([[900, 500], [1080, 420]], S(12) + .4, .3, { w: 14 }); K.ell(1100, 410, 34, 34, S(12) + .7, .3, { w: 7, a0: 1.2, sweep: 5 });
      K.text('③ 理解「重尾分布」', 230, 540, 48, S(12) + 1.6, { cps: 12 });
      { const pts = []; for (let i = 0; i <= 40; i++) { const x = 900 + i * 12; pts.push([x, 680 - 150 * Math.exp(-i / 6) - (i > 30 ? 0 : 0)]); } K.line(pts, S(12) + 2.4, .7, { col: ORG, w: 6 }); K.line([[1280, 660], [1300, 600], [1320, 660]], S(12) + 3.1, .2, { col: ORG, w: 6 }); }
      K.text('④ 摆脱平庸观念的束缚', 230, 690, 56, S(13) + .6, { col: ORG, cps: 3.2 });
      K.line([[225, 712], [790, 706]], S(15) + .1, .6, { col: YEL, w: 7 });
      K.ell(500, 676, 300, 70, S(15) + .8, .9, { col: YEL, w: 6 });
    },
    b_ladder(K) {
      const lad = (x, base, top, t0, o = {}) => { K.line([[x, base], [x + 8, top]], t0, .3, o); K.line([[x + 100, base], [x + 108, top]], t0 + .1, .3, o); for (let y = base - 40, i = 0; y > top + 10; y -= 52, i++) K.line([[x + (base - y) / (base - top) * 8, y], [x + 100 + (base - y) / (base - top) * 8, y]], t0 + .35 + i * .04, .08, { ...o, seed: 600 + i + x }); };
      for (let i = 0; i < 5; i++) lad(150 + i * 170, 760, 440, S(16) - .35 + i * .55, { w: 5 });
      K.text('天经地义', 520, 380, 64, S(17) + .2, { align: 'center', col: SUB });
      const grow = K.t > S(18) + .1 ? clamp((st12(K.t) - S(18) - .1) / 1.8) : 0, top = lerp(440, 250, grow);
      K.line([[1100, 760], [1108, top]], S(16) + 2.9, .3); K.line([[1210, 760], [1218, top]], S(16) + 3.0, .3);
      for (let y = 720, i = 0; y > top + 10; y -= 52, i++) K.line([[1100, y], [1210, y]], S(16) + 3.3, .08, { w: 6, seed: 700 + i });
      for (let x = 80, i = 0; x < 1520; x += 50, i++) K.line([[x, 235], [x + 28, 235]], S(19) + i * .035, .05, { col: YEL, w: 7, seed: 800 + i });
      K.text('人人能到的高度', 1180, 200, 64, S(19) + .9, { col: YEL, slam: true, cps: 30, align: 'center' });
    },
    b_loop(K) {
      // 水平仪：气泡晃两下停在正中
      K.line([[260, 420], [860, 420], [880, 470], [860, 520], [260, 520], [240, 470], [260, 420]], S(20) - .3, .7, { w: 7 });
      K.line([[440, 445], [680, 445], [690, 470], [680, 495], [440, 495], [430, 470], [440, 445]], S(20) + .3, .5, { w: 5, col: SUB });
      K.line([[530, 440], [530, 500]], S(20) + .8, .1, { w: 4 }); K.line([[590, 440], [590, 500]], S(20) + .9, .1, { w: 4 });
      if (K.t > S(20) + .9) { const u = st12(K.t) - S(20) - .9, bx = 560 + 90 * Math.exp(-u * .9) * Math.cos(u * 4.2); K.ell(bx, 470, 26, 16, S(20) + .9, .15, { col: YEL, w: 6 }); }
      K.text('稳态生存逻辑', 560, 320, 72, S(20) + .2, { align: 'center', cps: 7 });
      K.text('追求稳定', 560, 640, 56, S(21) + 1.6, { align: 'center', col: YEL });
      // 环形轨道
      const cx = 1180, cy = 470, rx = 300, ry = 220; K.ell(cx, cy, rx, ry, S(22) + .05, 1.1, { w: 7 });
      [['一个地方', -1.57, 0], ['一项技能', .55, 1], ['一份工作', 2.6, 2]].forEach(([s, a, i]) => { const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; K.dot(x, y, 12, S(23) + i * .8, { col: YEL }); K.text(s, x + (i === 1 ? 30 : i === 2 ? -30 : 0), y + (i === 0 ? -30 : 60), 42, S(23) + .1 + i * .8, { align: i === 1 ? 'left' : i === 2 ? 'right' : 'center', col: SUB, cps: 12 }); });
      if (K.t > S(23) + .3) { const u = Math.min(st12(K.t), S(24) + .2) - S(23) - .3, a = -1.57 + u / 3.2 * 6.283; K.at(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, a + 1.57, 1, () => { K.rect(-30, -38, 60, 34, S(23) + .3, .2, { w: 5, col: YEL }); K.ell(-16, -2, 8, 8, S(23) + .4, .1, { w: 4, col: YEL }); K.ell(16, -2, 8, 8, S(23) + .4, .1, { w: 4, col: YEL }); }); }
      K.text('一辈子', cx, cy + 16, 60, S(23) + 2.2, { align: 'center' });
      K.line([[930, 180], [1010, 300], [960, 360], [1080, 470], [1020, 560], [1110, 720]], S(24) + .4, .5, { col: ORG, w: 10 });
      K.text('不一样了', 1500, 200, 56, S(25) + .3, { align: 'right', col: ORG });
    },
    b_lag(K) {
      K.arrow([300, 740], [300, 140], S(26) - .25, .5); K.arrow([300, 740], [1400, 740], S(26) + .2, .6);
      K.text('时间', 1380, 790, 44, S(26) + .8, { align: 'right', col: SUB });
      K.text('文化滞后', 800, 130, 64, S(26) + .5, { align: 'center', col: YEL });
      const curve = (dx) => { const pts = []; for (let i = 0; i <= 50; i++) { const x = 320 + i * 20 + dx; if (x > 1340) break; const s = 1 / (1 + Math.exp(-(i - 22) / 4)); pts.push([x, 710 - s * 480]); } return pts; };
      K.line(curve(0), S(27) + .1, 1.5, { w: 7 }); K.text('物质条件', 1080, 210, 46, S(27) + 1.2);
      K.line(curve(330), S(27) + 1.0, 1.6, { col: ORG, w: 7 }); K.text('观念', 1350, 470, 46, S(27) + 2.4, { col: ORG });
      K.arrow([780, 470], [1050, 470], S(27) + 2.6, .35, { col: YEL, w: 6 }); K.arrow([1050, 470], [780, 470], S(27) + 2.95, .3, { col: YEL, w: 6 });
      K.text('慢很多', 915, 540, 44, S(27) + 3.1, { align: 'center', col: YEL });
    },
    b_dna(K) {
      const ph = K.t > S(28) ? (st12(K.t) - S(28)) * .9 : 0, A = [], Bp = [];
      for (let i = 0; i <= 60; i++) { const x = 200 + i * 20, a = i * .3 + ph; A.push([x, 430 + Math.sin(a) * 150]); Bp.push([x, 430 + Math.sin(a + Math.PI) * 150]); }
      K.line(A, S(28) - .35, 1.6, { w: 7, seed: 11 }); K.line(Bp, S(28) - .2, 1.6, { w: 7, col: SUB, seed: 12 });
      for (let i = 0; i <= 60; i += 3) K.line([A[i], Bp[i]], S(28) + .3 + i * .025, .1, { w: 4, col: SUB, seed: 900 + i });
      K.text('三大基因', 800, 140, 64, S(28) + .9, { align: 'center' });
      [['资源匮乏', 220, YEL], ['强从众', 640, ORG], ['简单模型', 1060, INK]].forEach(([s, x, c], i) => { K.hatch(x, 270, 330, 320, S(29) + i * 1.05, .5, { col: c, a: .3 }); K.text(s, x + 165, 690, 58, S(29) + .2 + i * 1.05, { align: 'center', col: c, cps: 12 }); });
    },
    b_bowl(K) {
      K.line([[260, 480], [740, 480]], S(30) - .25, .3, { w: 7 }); K.line(P.bez([260, 480], [270, 700], [730, 700], [740, 480], 30), S(30) + .05, .6, { w: 7 }); K.line([[420, 690], [580, 690]], S(30) + .65, .2);
      [[440, 520], [520, 545], [590, 515]].forEach(([x, y], i) => K.dot(x, y, 9, S(30) + .9 + i * .25, { col: YEL }));
      K.arrow([500, 420], [500, 260], S(30) + 1.6, .3); K.text('求生存', 500, 230, 52, S(30) + 1.8, { align: 'center' });
      K.arrow([700, 400], [880, 270], S(31) + .05, .3, { dash: [14, 14], col: SUB }); K.text('求发展', 900, 250, 48, S(31) + .3, { col: SUB }); K.line([[890, 238], [1040, 238]], S(31) + .9, .25, { col: ORG, w: 6 });
      [['价值观', 820, 580], ['道德', 1020, 460], ['审美', 1220, 340]].forEach(([s, x, y], i) => { K.line([[x - 20, y + 120], [x - 20, y], [x + 180, y], [x + 180, y + 120]], S(32) + .5 + i * 1.2, .3, { w: 6, seed: 1000 + i }); K.text(s, x + 80, y + 70, 48, S(32) + .8 + i * 1.2, { align: 'center', col: YEL, cps: 10 }); });
    },
    b_food(K) {
      // 泡菜罐
      K.line([[250, 330], [410, 330], [430, 380], [430, 620], [400, 650], [260, 650], [230, 620], [230, 380], [250, 330]], S(33) + .05, .7, { w: 7 });
      K.line(P.bez([260, 450], [300, 400], [360, 520], [400, 450], 12), S(33) + .7, .3, { w: 5, col: ORG }); K.line(P.bez([260, 540], [300, 490], [360, 610], [400, 540], 12), S(33) + .9, .3, { w: 5, col: ORG });
      K.text('泡菜', 330, 730, 48, S(33) + .8, { align: 'center', col: SUB });
      // 炸鱼薯条
      K.line([[640, 470], [700, 420], [800, 420], [860, 470], [800, 520], [700, 520], [640, 470], [600, 430], [600, 510], [640, 470]], S(33) + 1.4, .7, { w: 7 });
      K.line([[880, 640], [930, 440], [1000, 640]], S(33) + 2.1, .3, { w: 6 }); for (let i = 0; i < 4; i++) K.line([[905 + i * 20, 470], [900 + i * 22, 400]], S(33) + 2.4 + i * .05, .08, { w: 5, col: YEL, seed: 1100 + i });
      K.text('炸鱼薯条', 800, 730, 48, S(33) + 2.2, { align: 'center', col: SUB });
      // potluck：一张桌，几道菜
      K.line([[1100, 560], [1480, 560]], S(33) + 3.0, .3, { w: 7 }); K.line([[1130, 560], [1130, 660]], S(33) + 3.3, .1); K.line([[1450, 560], [1450, 660]], S(33) + 3.35, .1);
      [[1160, 535], [1250, 530], [1340, 535], [1430, 530]].forEach(([x, y], i) => { K.ell(x, y, 38, 14, S(33) + 3.4 + i * .15, .15, { w: 5, seed: 1200 + i }); K.line(P.bez([x - 30, y - 6], [x - 20, y - 50], [x + 20, y - 50], [x + 30, y - 6], 8), S(33) + 3.45 + i * .15, .12, { w: 5, seed: 1210 + i }); });
      K.text('potluck', 1290, 730, 48, S(33) + 3.5, { align: 'center', col: SUB });
      // 价签挂在泡菜罐上晃
      if (K.t > S(34) + .2) { const a = .25 * Math.sin((st12(K.t) - S(34)) * 5) * Math.exp(-(K.t - S(34)) * .5); K.at(420, 335, a, 1, () => { K.line([[0, 0], [50, -40]], S(34) + .2, .2, { w: 4, col: SUB }); K.line([[40, -90], [220, -90], [240, -60], [220, -30], [40, -30], [40, -90]], S(34) + .4, .4, { w: 6, col: YEL }); K.text('廉价果腹', 130, -45, 38, S(34) + .8, { align: 'center', col: YEL, cps: 12 }); }); }
      // 横幅
      K.line([[180, 120], [300, 100], [700, 130], [900, 100], [1300, 130], [1420, 110], [1420, 220], [1300, 240], [900, 210], [700, 240], [300, 210], [180, 230], [180, 120]], S(35) + .1, .8, { w: 6, col: YEL });
      K.text('民族特色', 800, 196, 72, S(35) + .9, { align: 'center', col: YEL, cps: 10 });
    },
    b_wabi(K) {
      K.ell(760, 300, 330, 70, S(36) - .25, .6, { w: 7 }); K.line(P.bez([430, 300], [450, 640], [1070, 640], [1090, 300], 30), S(36) + .25, .6, { w: 7 }); K.line([[640, 620], [880, 620], [860, 680], [660, 680], [640, 620]], S(36) + .8, .3, { w: 6 });
      const crack = [[700, 232], [730, 320], [690, 400], [760, 470], [730, 560], [780, 625]];
      K.line(crack, S(36) + 1.0, .5, { w: 4, col: SUB }); K.text('侘寂', 300, 210, 72, S(36) - .1, { align: 'center' });
      K.line(crack, S(37) + 1.9, 1.2, { w: 10, col: YEL, seed: 77 });
      K.text('以此为荣', 1300, 470, 64, S(37) + 3.0, { align: 'center', col: YEL });
    },
    b_filial(K) {
      house(K, 230, 560, 200, S(38) - .25); house(K, 1370, 560, 200, S(38) - .1);
      const coinT = S(40) + .4, hit = coinT + .55, broken = K.t > hit;
      for (let i = 0; i < 8; i++) { const x = 400 + i * 105; if (broken && (i === 3 || i === 4)) continue; const sag = broken ? (i < 4 ? i * 14 : (7 - i) * 14) : 0; K.ell(x + 50, 560 + sag, 56, 26, S(38) + .2 + i * .14, .18, { w: 6, seed: 1300 + i, col: i % 2 ? SUB : INK }); }
      K.text('孝道', 520, 470, 64, S(38) + 1.2, { align: 'center' });
      K.rect(670, 150, 260, 240, S(39) + .3, .5, { w: 6 }); for (let i = 0; i < 4; i++) K.line([[700, 210 + i * 40], [900, 210 + i * 40]], S(39) + .8 + i * .08, .1, { w: 4, col: SUB, seed: 1400 + i });
      K.ell(860, 330, 70, 50, S(39) + 2.0, .3, { col: ORG, w: 6 }); K.text('养老保险', 800, 128, 52, S(39) + 2.2, { align: 'center', col: ORG, slam: true, cps: 30 });
      if (K.t > coinT && K.t < hit + 1.6) { const q = clamp((st12(K.t) - coinT) / .55), y = lerp(-80, 560, q * q); K.at(1110, y, 0, 1, () => { K.ell(0, 0, 60, 60, coinT, .2, { col: YEL, w: 7 }); K.text('¥', 0, 18, 56, coinT + .1, { align: 'center', col: YEL }); }); }
      if (broken) K.text('养老金', 1110, 720, 52, hit + .1, { align: 'center', col: YEL });
      const heart = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 2; heart.push([800 + 16 * Math.pow(Math.sin(a), 3) * 6, 600 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 6]); }
      K.line(heart, S(42) + .6, 1.3, { col: YEL, w: 7 });
      K.text('更纯粹', 800, 790, 56, S(43) + .2, { align: 'center', col: YEL });
    },
    b_risk(K) {
      K.text('风险厌恶', 800, 160, 72, S(44) + .1, { align: 'center' });
      coinStack(K, 450, 680, 12, S(44) + .9); coinStack(K, 1130, 680, 2, S(44) + 2.2, SUB);
      K.text('一百万', 450, 750, 52, S(45) + .2, { align: 'center' }); K.text('一千元', 1130, 750, 52, S(46) + .2, { align: 'center', col: SUB });
      die(K, 680, 620, 100, S(45) + .7, 2, S(45) + 1.2, S(46) - .3, { h: 60 });
      K.line(P.bez([1090, 600], [1090, 520], [1170, 520], [1170, 600], 12), S(46) + 1.1, .35, { col: YEL, w: 7 }); K.rect(1070, 600, 120, 90, S(46) + 1.45, .4, { col: YEL, w: 7 });
      K.text('俭 = 低风险', 800, 300, 80, S(47) + 2.6, { align: 'center', col: YEL, slam: true, cps: 30 });
      K.ell(640, 275, 58, 58, S(48) + .2, .5, { col: ORG, w: 6 });
    },
    b_bird(K) {
      const wire = []; for (let i = 0; i <= 30; i++) { const q = i / 30; wire.push([60 + q * 1000, 330 + Math.sin(q * Math.PI) * 30]); } K.line(wire, S(49) - .25, .6, { w: 5, col: SUB });
      [150, 280, 410, 560, 700, 840].forEach((x, i) => bird(K, x, 330 + Math.sin((x - 60) / 1000 * Math.PI) * 30 - 3, S(49) + .4 + i * .3, i === 3 ? 60 : 0));
      if (K.t > S(50) + .5) { const r = lerp(140, 80, clamp((st12(K.t) - S(50) - .5) / .8)); K.ell(590, 230, r, r, S(50) + .5, .4, { col: ORG, w: 6 }); K.line([[590, 230 - r - 30], [590, 230 - r + 30]], S(50) + .9, .1, { col: ORG, w: 5 }); K.line([[590 - r - 30, 230], [590 - r + 30, 230]], S(50) + 1.0, .1, { col: ORG, w: 5 }); K.line([[590 + r - 30, 230], [590 + r + 30, 230]], S(50) + 1.1, .1, { col: ORG, w: 5 }); }
      K.text('枪打出头鸟', 560, 470, 52, S(50) + 1.4, { align: 'center', col: ORG });
      // 最小可行产品：滑板 → 自行车 → 汽车
      K.line([[620, 600], [780, 600]], S(51) + .1, .2, { w: 6 }); K.ell(645, 622, 14, 14, S(51) + .3, .1, { w: 5 }); K.ell(755, 622, 14, 14, S(51) + .35, .1, { w: 5 });
      K.arrow([810, 600], [880, 600], S(51) + .6, .15, { col: SUB, w: 5 });
      K.ell(930, 610, 36, 36, S(51) + .8, .2, { w: 5 }); K.ell(1060, 610, 36, 36, S(51) + .9, .2, { w: 5 }); K.line([[930, 610], [980, 540], [1060, 610], [1000, 610], [980, 540], [1040, 540]], S(51) + 1.1, .3, { w: 5 });
      K.arrow([1110, 600], [1180, 600], S(51) + 1.4, .15, { col: SUB, w: 5 });
      K.line([[1200, 620], [1200, 570], [1260, 570], [1290, 520], [1400, 520], [1430, 570], [1470, 570], [1470, 620], [1200, 620]], S(51) + 1.6, .4, { w: 5 }); K.ell(1250, 625, 22, 22, S(51) + 2.0, .1, { w: 5 }); K.ell(1420, 625, 22, 22, S(51) + 2.05, .1, { w: 5 });
      K.text('最小可行产品', 1040, 470, 46, S(51) + .4, { align: 'center', col: YEL });
      // 图纸越画越长，打叉
      if (K.t > S(52) + .1) { const L = 120 + 330 * clamp((st12(K.t) - S(52) - .1) / 2); K.rect(1110, 120, L, 260, S(52) + .1, .3, { w: 5, col: SUB }); for (let i = 0; i < 5; i++) K.line([[1130, 170 + i * 45], [1110 + L - 20, 170 + i * 45]], S(52) + .3, .1, { w: 3, col: SUB, seed: 1500 + i, dash: [10, 8] }); }
      K.text('万事俱备', 1335, 100, 44, S(52) + .5, { align: 'center', col: SUB });
      K.cross(1335, 250, 110, S(53) - .1, .4); K.text('害怕失败', 1335, 440, 52, S(53) + .4, { align: 'center', col: ORG });
    },
    b_herd(K) {
      for (let i = 0, x = 140; x < 1480; x += 90, i++) { if ([4, 5, 10].includes(i)) continue; K.line([[x, 520], [x, 270], [x + 20, 245], [x + 40, 270], [x + 40, 520]], S(54) - .2 + i * .07, .1, { w: 5, seed: 1600 + i }); }
      K.line([[120, 330], [1480, 330]], S(54) + 1.2, .4, { w: 5, col: SUB }); K.line([[120, 460], [1480, 460]], S(54) + 1.4, .4, { w: 5, col: SUB });
      K.text('弱规则', 560, 220, 56, S(55) + .1, { align: 'center', col: YEL });
      [[530, 410], [860, 390], [1020, 420], [1250, 380], [1410, 410]].forEach(([x, y], i) => K.text('?', x, y, 64, S(56) + .2 + i * .4, { align: 'center', col: ORG }));
      const r = rng(5); for (let i = 0; i < 16; i++) { const x = 300 + (i % 8) * 130 + (r() - .5) * 50, y = 620 + Math.floor(i / 8) * 90 + (r() - .5) * 30; K.arrow([x, y], [x + 80, y], S(57) + .1 + i * .1, .1, { w: 5, head: 18, seed: 1700 + i }); }
      K.text('一窝蜂', 1400, 690, 56, S(57) + 1.9, { align: 'center', col: YEL });
    },
    b_obey(K) {
      K.rect(300, 130, 1000, 600, S(58) - .25, 1.0, { w: 7 }); K.rect(330, 160, 940, 540, S(58) + .6, .8, { w: 4, col: YEL });
      K.text('奖  状', 800, 245, 56, S(58) + 1.3, { align: 'center', col: YEL });
      K.text('听话', 800, 530, 200, S(59) + .3, { align: 'center', cps: 3 });
      K.text('？', 1450, 470, 260, S(60), { align: 'center', col: ORG, slam: true, cps: 30 });
      K.line([[560, 560], [1040, 380]], S(61) + .1, .4, { col: ORG, w: 12 });
      K.text('没主意', 800, 660, 52, S(61) + .9, { align: 'center', col: ORG });
      K.arrow([1150, 620], [1380, 760], S(61) + 1.6, .3, { col: ORG }); K.text('平庸', 1440, 820, 48, S(61) + 2.0, { align: 'center', col: ORG });
    },
    b_busy(K) {
      K.line([[560, 280], [560, 720]], S(62) - .25, .3, { w: 8 }); K.line([[440, 730], [680, 730]], S(62) + .05, .2, { w: 8 });
      let ang = 0; if (K.t > S(62) + 1.2) ang = -.22 * clamp((st12(K.t) - S(62) - 1.2) / .8); if (K.t > S(63) + .3) ang = -.22 - .16 * clamp((st12(K.t) - S(63) - .3) / .8);
      const ex = Math.cos(ang) * 300, ey = Math.sin(ang) * 300;
      K.line([[560 - ex, 280 - ey], [560 + ex, 280 + ey]], S(62) - .05, .3, { w: 8 });
      const pan = (x, y, s, t0, col) => { K.line([[x - 80, y + 150], [x, y], [x + 80, y + 150]], t0, .3, { w: 4, col: SUB }); K.line(P.bez([x - 100, y + 150], [x - 80, y + 200], [x + 80, y + 200], [x + 100, y + 150], 10), t0 + .3, .2, { w: 6 }); K.text(s, x, y + 260, 52, t0 + .4, { align: 'center', col }); };
      pan(560 - ex, 280 - ey, '态度', S(62) + .2, YEL); pan(560 + ex, 280 + ey, '结果', S(62) + .35, SUB);
      K.text('态度要好', 560, 140, 56, S(63) + .2, { align: 'center', col: YEL });
      // 空转轮
      const sp = K.t > S(64) ? (st12(K.t) - S(64)) : 0, rot = sp * sp * 2.2;
      K.at(1250, 430, rot, 1, () => { K.ell(0, 0, 170, 170, S(64) - .5, .5, { w: 7 }); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; K.line([[0, 0], [Math.cos(a) * 170, Math.sin(a) * 170]], S(64) - .1 + k * .03, .05, { w: 4, col: SUB, seed: 1800 + k }); } });
      K.line([[1150, 620], [1250, 430], [1350, 620]], S(64) - .4, .3, { w: 6 });
      if (sp > .5) [[1450, 330], [1460, 430], [1450, 530]].forEach(([x, y], i) => K.line([[x, y], [x + 60, y]], S(64) + .5 + i * .1, .1, { w: 5, col: YEL, seed: 1900 + i }));
      K.text('以忙碌为荣', 1250, 690, 52, S(64) + .05, { align: 'center', col: YEL });
    },
    b_study(K) {
      K.line([[250, 160], [790, 140], [800, 170], [810, 140], [1350, 160], [1350, 720], [810, 700], [800, 730], [790, 700], [250, 720], [250, 160]], S(65) - .25, .6, { w: 6 });
      const words = ['读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读', '读'];
      for (let row = 0; row < 7; row++) { const s1 = '读读读读读读读读'.slice(0, 8), s2 = row < 4 ? '抄抄抄抄抄抄抄抄' : '背背背背背背背背'; K.text(s1, 290, 230 + row * 70, 50, S(65) + .4 + row * .5, { cps: 18, col: row % 2 ? SUB : INK }); K.text(s2, 850, 230 + row * 70, 50, S(66) + .1 + row * .4, { cps: 22, col: row % 2 ? SUB : INK }); }
      K.text('学习的样子', 800, 110, 56, S(66) + .4, { align: 'center', col: YEL });
      if (K.t > S(67)) for (let k = 0; k < 3; k++) { const r = 60 + k * 50 + ((st12(K.t) * 60) % 50); K.ell(1360, 420, r, r * 1.3, S(67) + .1 + k * .2, .3, { a0: -.8, sweep: 1.6, w: 5, col: ORG, seed: 2000 + k }); }
      K.text('气势汹汹', 1590, 230, 52, S(67) + 1.2, { align: 'right', col: ORG });
    },
    b_equal(K) {
      K.text('服从 ＝ 业绩', 360, 270, 88, S(68) - .1, { cps: 8 });
      K.text('态度 → 能力', 360, 450, 88, S(68) + 1.4, { cps: 8 });
      K.text('姿势 → 成果', 360, 630, 100, S(69) - .05, { cps: 30, col: YEL, slam: true });
      K.line([[350, 660], [1000, 655]], S(69) + .5, .4, { col: YEL, w: 7 }); K.line([[350, 685], [1000, 680]], S(69) + .8, .4, { col: YEL, w: 7 });
    },
    b_loan(K) {
      K.text('简单模型', 1000, 150, 80, S(70) - .1, { align: 'center', cps: 7 });
      K.ell(1290, 110, 50, 50, S(70) + 1.1, .4, { w: 7 }); K.line([[1326, 146], [1380, 200]], S(70) + 1.5, .2, { w: 12 });
      // 你 —— 同事
      K.ell(450, 430, 110, 110, S(71) - .2, .4, { w: 7 }); K.text('你', 450, 455, 72, S(71) + .2, { align: 'center' });
      K.ell(1650, 430, 130, 130, S(71) + .3, .4, { w: 7 }); K.text('同事', 1650, 455, 64, S(71) + .7, { align: 'center' });
      K.arrow([580, 340], [1510, 340], S(71) + .9, .5); K.text('8000', 760, 310, 60, S(71) + 1.3, { align: 'center' });
      K.arrow([1510, 540], [580, 540], S(72) + .05, .5, { col: ORG }); K.text('7992', 1050, 660, 80, S(72) + .5, { align: 'center', col: ORG, slam: true, cps: 30 });
      K.text('少 8 元？', 1050, 770, 56, S(73) + .1, { align: 'center', col: YEL });
      // 微信方框盖在路上
      if (K.t > S(74) + .3) { const g = K.g; g.save(); g.fillStyle = BG; g.fillRect(940, 270, 220, 140); g.restore(); }
      K.rect(940, 270, 220, 140, S(74) + .3, .5, { col: YEL, w: 7 }); K.text('微信', 1050, 362, 60, S(74) + .8, { align: 'center', col: YEL });
      if (K.t > S(75) + .4) { const q = clamp((st12(K.t) - S(75) - .4) / .5), y = lerp(380, 440, q); K.rect(1190, y, 70, 36, S(75) + .4, .2, { col: ORG, w: 5 }); K.text('−8', 1275, y + 32, 46, S(75) + .5, { col: ORG }); }
      K.text('手续费', 1190, 515, 40, S(75) + 1.4, { col: ORG });
      K.text('拿到 7992', 1650, 640, 48, S(76) + .2, { align: 'center', col: SUB });
      K.line([[1510, 548], [580, 548]], S(77) + .3, .6, { col: ORG, w: 12, seed: 99 });
      K.ell(700, 405, 470, 160, S(78) + .3, 1.3, { col: YEL, w: 7, dash: [26, 14] }); K.text('外部世界', 330, 140, 64, S(78) + 1.4, { align: 'center', col: YEL });
      K.line([[620, 455], [1490, 455]], S(79) + .3, .6, { col: SUB, w: 5, dash: [16, 14] });
      K.text('信用关系', 1200, 615, 40, S(79) + 1.0, { col: ORG });
      K.text('微信的事', 1050, 240, 48, S(80) + .2, { align: 'center', col: YEL });
    },
    b_effort(K) {
      K.arrow([250, 720], [250, 150], S(81) - .25, .4); K.arrow([250, 720], [1000, 720], S(81) + .1, .4);
      K.text('努力', 1000, 790, 48, S(81) + .5, { align: 'right', col: SUB }); K.text('回报', 280, 160, 48, S(81) + .6, { col: SUB });
      K.line([[250, 720], [900, 220]], S(81) + 1.0, .9, { w: 8 }); K.text('线性思维', 640, 680, 48, S(81) + 1.6, { col: SUB });
      K.text('！', 960, 260, 220, S(82) + .1, { col: ORG, slam: true, cps: 30 });
      K.rect(1110, 450, 280, 220, S(83) + .2, .5, { w: 7 }); K.line([[1100, 450], [1130, 330], [1400, 300], [1400, 450]], S(83) + .7, .4, { w: 7 });
      K.line([[1250, 450], [1250, 670]], S(83) + 1.1, .2, { w: 5, col: YEL }); K.text('?', 1250, 600, 120, S(83) + 1.6, { align: 'center', col: YEL });
      K.text('没有神灵发奖励', 1250, 790, 46, S(83) + 2.2, { align: 'center', col: SUB });
    },
    b_metric(K) {
      K.rect(220, 200, 470, 290, S(84) - .25, .6, { w: 7 }); K.ell(220, 345, 26, 150, S(84) + .3, .3, { w: 6 }); K.ell(690, 345, 26, 150, S(84) + .5, .3, { w: 6 });
      K.text('指标主义', 455, 140, 56, S(84) + .6, { align: 'center' });
      K.text('985', 455, 400, 130, S(85) + .2, { align: 'center', col: YEL, cps: 6 });
      K.arrow([455, 510], [455, 610], S(85) + 1.0, .3); K.text('高薪', 455, 690, 64, S(85) + 1.3, { align: 'center' });
      K.at(1100, 360, -.06, 1, () => { K.rect(-210, -150, 420, 300, S(86) - .25, .5, { w: 6 }); K.text('欠  条', 0, -70, 48, S(86) + .2, { align: 'center', col: SUB }); K.text('世界欠我的', 0, 30, 60, S(86) + .6, { align: 'center' }); });
      K.text('我', 760, 690, 72, S(87) - .1, { align: 'center' });
      K.ell(1250, 660, 100, 100, S(87) + .1, .4, { w: 6 }); K.text('世界', 1250, 680, 52, S(87) + .4, { align: 'center' });
      K.arrow([820, 665], [1140, 665], S(87) + .8, .4, { col: YEL, w: 7 });
      K.text('能提供什么？', 990, 800, 52, S(87) + 1.4, { align: 'center', col: YEL });
    },
    b_poster(K) {
      K.rect(380, 110, 820, 700, S(88) - .25, .9, { w: 7 }); K.dot(400, 130, 12, S(88) + .5, { col: ORG }); K.dot(1180, 130, 12, S(88) + .55, { col: ORG });
      ['听话', '节俭', '努力', '随大流', '从不出头'].forEach((s, i) => { const y = 340 + i * 90; K.rect(450, y - 45, 50, 50, S(88) + .2 + i * .5, .2, { w: 5, seed: 2100 + i }); K.text(s, 530, y, 52, S(88) + .3 + i * .5, { cps: 14 }); K.check(475, y - 22, 26, S(88) + .5 + i * .5); });
      K.text('佃农招募', 790, 240, 80, S(89) + .4, { align: 'center', col: YEL, cps: 6 });
      ['省心', '肯干', '不闯祸'].forEach((s, i) => { K.text(s, 1260, 330 + i * 110, 52, S(90) + .1 + i * .6, { col: SUB, cps: 12 }); K.check(1440, 310 + i * 110, 26, S(90) + .4 + i * .6); });
      K.text('兴旺发达', 1260, 720, 52, S(91) - .1, { col: SUB, cps: 20 }); K.cross(1360, 700, 60, S(91) + .4, .3);
    },
    b_cage(K) {
      K.ell(800, 430, 70, 70, S(92) - .25, .4, { w: 6 }); K.check(800, 432, 34, S(92) + .3, .4);
      K.text('局部理性', 800, 560, 40, S(92) + .9, { align: 'center', col: SUB });
      for (let i = 0; i < 11; i++) { const x = 500 + i * 60, t0 = S(93) + .1 + i * .07, q = clamp((st12(K.t) - t0) / .25), dy = (1 - q) * -500; if (K.t > t0) K.line([[x, 160 + dy], [x, 760 + dy]], t0, .01, { w: 7, seed: 2200 + i }); }
      K.line([[480, 160], [1120, 160]], S(93) + 1.0, .3, { w: 8 }); K.line([[480, 760], [1120, 760]], S(93) + 1.2, .3, { w: 8 });
      K.text('枷锁', 1280, 300, 80, S(93) + 1.5, { align: 'center', col: YEL });
    },
    b_mountain(K) {
      K.line([[60, 760], [300, 480], [420, 560], [640, 200], [880, 520], [1000, 440], [1240, 760]], S(94) - .25, 1.2, { w: 8 });
      K.line([[560, 330], [600, 300], [640, 350], [690, 300], [720, 330]], S(94) + 1.0, .3, { w: 6, col: SUB });
      K.text('低波动生存', 640, 620, 56, S(94) + 1.2, { align: 'center', col: SUB });
      const r = rng(8), pts = []; for (let i = 0; i <= 70; i++) { const x = 760 + i * 11; let y = 640 + (r() - .5) * 70; if (i === 46) y = 130; if (i === 45 || i === 47) y = 470; if (i === 20) y = 470; pts.push([x, y]); }
      K.line(pts, S(95) + .1, 1.6, { col: ORG, w: 7 });
      K.text('高波动世界', 1300, 110, 64, S(95) + 1.0, { align: 'center', col: ORG });
    },
    b_agent(K) {
      K.text('能动者', 760, 220, 140, S(96) - .2, { align: 'center', col: YEL, slam: true, cps: 30 });
      K.text('agent', 1080, 220, 56, S(96) + .9, { col: SUB });
      K.at(760, 520, -.5, 1, () => { K.line([[-250, -20], [150, -20], [150, 20], [-250, 20], [-250, -20]], S(96) + .3, .4, { w: 7 }); K.line([[150, -20], [180, -60], [250, -60], [230, -20], [270, 0], [230, 20], [250, 60], [180, 60], [150, 20]], S(96) + .7, .4, { w: 7 }); });
      K.arrow([1350, 660], [1060, 560], S(96) + 1.8, .4, { col: YEL, w: 7 });
      K.text('你是调用工具的人', 1450, 420, 48, S(97) + .1, { align: 'right', col: YEL, cps: 10 });
      K.text('不能是别人的工具', 1450, 500, 48, S(97) + 1.5, { align: 'right', col: ORG, cps: 10 });
    },
    b_poem(K) {
      // 锁
      K.line(P.bez([420, 320], [420, 70], [700, 70], [700, 320], 24), S(98) - .3, .5, { w: 12 });
      K.rect(330, 310, 460, 360, S(98) + .1, .5, { w: 8 });
      K.text('古律', 560, 460, 96, S(98) + .5, { align: 'center' });
      K.text('饥寒', 470, 600, 52, S(99) + .1, { align: 'center', col: SUB }); K.text('不安', 650, 600, 52, S(99) + .6, { align: 'center', col: SUB });
      // 钥匙：挂起来轻轻晃
      const sw = K.t > S(101) ? .06 * Math.sin((st12(K.t) - S(101)) * 2.4) : 0;
      K.at(1150, 40, sw, 1, () => {
        K.line([[-130, 0], [0, 180], [130, 0]], S(101) + .1, .7, { col: ORG, w: 6 });
        K.ell(0, 250, 70, 70, S(100) - .2, .45, { w: 9 }); K.line([[0, 320], [0, 640]], S(100) + .3, .35, { w: 11 }); K.line([[0, 560], [60, 560], [60, 600]], S(100) + .65, .15, { w: 9 }); K.line([[0, 610], [45, 610], [45, 640]], S(100) + .8, .12, { w: 9 });
        const r = rng(3); for (let i = 0; i < 18; i++) { const a = r() * 6.28, d = r(); const x = i < 8 ? Math.cos(a) * 70 : (r() - .5) * 18, y = i < 8 ? 250 + Math.sin(a) * 70 : 340 + d * 290; K.dot(x, y, 4 + r() * 5, S(100) + 1.0 + i * .03, { col: ORG }); }
        K.ell(0, 250, 110, 110, S(102) + .2, .9, { col: YEL, w: 6 });
        [[-60, 340, -100, 470], [60, 340, 100, 470]].forEach(([a, b, c, d], i) => K.line([[a, b], [c, d], [c + (i ? -30 : 30), d - 30]], S(102) + 1.0 + i * .2, .25, { col: YEL, w: 6 }));
      });
          },
  };

  return {
    draw(c, lt) {
      const t = lt, cam = camAt(t), z = cam.z;
      // 视野对应的世界矩形
      const vw = W / z, vh = H / z, vx = cam.x - vw / 2, vy = cam.y - vh / 2;
      // 墙＋黑板（含木框和粉笔槽，拉远才看得见）
      c.fillStyle = '#2b241d'; c.fillRect(0, 0, W, H);
      if (!PAT) { PAT = c.createPattern(boardTile(), 'repeat'); HPAT = c.createPattern(holesTile(), 'repeat'); GPAT = c.createPattern(ghostTile(), 'repeat'); }
      const bx0 = -120, by0 = -120, bw = N.board.w + 240, bh = N.board.h + 240;
      CAM.with(c, cam, (g) => {
        g.fillStyle = '#5a4430'; g.fillRect(bx0 - 60, by0 - 60, bw + 120, bh + 220);
        g.fillStyle = PAT; g.fillRect(Math.max(bx0, vx - 10), Math.max(by0, vy - 10), Math.min(bw, vw + 20), Math.min(bh, vh + 20));
        g.fillStyle = GPAT; g.fillRect(Math.max(bx0, vx - 10), Math.max(by0, vy - 10), Math.min(bw, vw + 20), Math.min(bh, vh + 20));
        g.fillStyle = '#6e5540'; g.fillRect(bx0 - 60, by0 + bh, bw + 120, 40);
        if (z < 0.5) { g.fillStyle = YEL; g.fillRect(N.board.w * .7 + 300, by0 + bh + 8, 140, 28); g.fillStyle = '#2b2b2b'; g.fillRect(N.board.w * .3, by0 + bh + 4, 300, 34); }
      });
      // 粉笔层
      const L = P.scratch('nbChalk'), g = L.getContext('2d'); g.reset();
      const tips = [];
      g.save(); CAM.apply(g, cam);
      for (const id in B) { const p = N.pos[id]; if (p.x > vx + vw + 50 || p.x + p.w < vx - 50 || p.y > vy + vh + 50 || p.y + p.h < vy - 50) continue;
        g.save(); g.translate(p.x, p.y); B[id](kit(g, t, p.x, p.y, tips)); g.restore(); }
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = HPAT; g.fillRect(vx, vy, vw, vh);
      g.restore();
      c.drawImage(L, 0, 0);
      // 粉笔头：跟着正在画的那一笔走；停笔 0.35 秒后离开画面
      let tipW = null; if (tips.length) { tips.sort((a, b) => (b.live - a.live) || (b.t0 - a.t0)); tipW = tips[0]; }
      const endT = N.total - 2.2;
      if (t > endT) {                                         // 结尾：粉笔落进画面底部，躺平
        const [tx, ty] = CAM.toScreen(cam, N.board.w * .55, N.board.h + 120 + 18), q = clamp((st12(t) - endT) / .6), x = lerp(tx - 40, tx, q), y = lerp(ty - 420, ty, q * q), a = lerp(-.7, 0, q);
        chalk(c, x, y, a);
      } else if (tipW) { const sx = tipW.sx, sy = tipW.sy; if (sx > -100 && sx < W + 100 && sy > -100 && sy < H + 100) chalk(c, sx, sy, -.75); }
      // 字幕
      const sub = N.subs.find(s => t >= s.t0 && t < s.t1);
      if (sub) { c.save(); c.font = '48px "PuHui-Medium"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        let lines = [sub.text]; if (c.measureText(sub.text).width > 1500) { const m = Math.ceil(sub.text.length / 2); let cut = -1; for (const ch of '，、：；') { const k = sub.text.lastIndexOf(ch, m + 4); if (k > cut) cut = k; } if (cut < 6) cut = m - 1; lines = [sub.text.slice(0, cut + 1), sub.text.slice(cut + 1)]; }
        const bw = Math.max(...lines.map(l => c.measureText(l).width)) + 56, bh = lines.length * 62 + 18; c.fillStyle = 'rgba(14,20,17,.72)'; c.beginPath(); c.roundRect(W / 2 - bw / 2, 1058 - bh, bw, bh, 10); c.fill();
        lines.forEach((s, i) => { const y = 1040 - (lines.length - 1 - i) * 62; c.lineWidth = 8; c.strokeStyle = 'rgba(16,22,19,.85)'; c.lineJoin = 'round'; c.strokeText(s, W / 2, y); c.fillStyle = '#F7F5EE'; c.fillText(s, W / 2, y); });
        c.restore(); }
    },
  };
  function chalk(c, x, y, a) {   // 一支粉笔：笔尖在 (x, y)
    c.save(); c.translate(x, y); c.rotate(a);
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; c.shadowOffsetY = 6;
    c.fillStyle = '#f4f1e6'; c.beginPath(); c.moveTo(0, -9); c.lineTo(120, -12); c.lineTo(120, 12); c.lineTo(0, 9); c.quadraticCurveTo(-8, 0, 0, -9); c.fill();
    c.shadowColor = 'transparent'; c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(10, 3, 108, 8);
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(12, -10, 100, 3);
    c.restore();
  }
})();
