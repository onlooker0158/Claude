// 方向 B · 皮影戏台：幕后油灯，牛皮镂空的「古律之锁」，胸前挂着一把生锈的钥匙。10fps 杆操步进。
SCENES['dirB_puppet'] = (() => {
  const W = 1920, H = 1080, { clamp, lerp, rng, ss } = U, P = PAINT, K = P.carve;
  const RED = '#b8402c', AMB = '#c98a2e', EDGE = '#3a160a', GRN = '#3f6b4c', RUST = '#8a4a22';
  const step = (t, fps = 10) => U.stepTime(t, fps);
  const piece = (g, path, col, carve, edge = 5) => P.piece(g, path, col, carve, { edge, line: EDGE });
  const rod = (c, A, B) => { c.save(); c.filter = 'blur(1.4px)'; c.globalCompositeOperation = 'multiply'; c.strokeStyle = 'rgba(60,30,12,.8)'; c.lineWidth = 5; c.beginPath(); c.moveTo(...A); c.lineTo(...B); c.stroke(); c.restore(); };
  const rivet = (c, x, y, r = 7) => { c.fillStyle = '#2a1006'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#b07a3a'; c.beginPath(); c.arc(x - 1, y - 1, r * .42, 0, 7); c.fill(); };
  function screen(c, t) {
    const ft = step(t, 15), fl = .5 * P.noise(ft * 3, 1) + .3 * P.noise(ft * 9, 4);
    const cx = 900 + fl * 24, cy = 430 + P.noise(ft * 2, 7) * 16;
    const g = c.createRadialGradient(cx, cy, 30, cx, cy + 40, 1150);
    g.addColorStop(0, '#fff3d4'); g.addColorStop(.38, '#f0d39a'); g.addColorStop(.72, '#c98f4e'); g.addColorStop(1, '#6e3f1a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(P.cached('b_weave', W, H, (w) => { w.fillStyle = '#fff'; w.fillRect(0, 0, W, H); w.strokeStyle = 'rgba(120,90,50,.08)'; w.lineWidth = 1; for (let x = 0; x < W; x += 3) { w.beginPath(); w.moveTo(x, 0); w.lineTo(x, H); w.stroke(); } for (let y = 0; y < H; y += 3) { w.beginPath(); w.moveTo(0, y); w.lineTo(W, y); w.stroke(); } w.drawImage(P.grain('bg', .06, [120, 80, 40], .3), 0, 0); }), 0, 0); c.restore();
  }
  // 锁：大锁身＋锁梁，锁身刻云纹和「古律」二字
  const lock = () => P.cached('b_lock', W, H, (g) => {
    const shackle = new Path2D(); shackle.moveTo(540, 470); shackle.lineTo(540, 330); shackle.arc(700, 330, 160, Math.PI, 0); shackle.lineTo(860, 470); shackle.lineTo(810, 470); shackle.lineTo(810, 330); shackle.arc(700, 330, 110, 0, Math.PI, true); shackle.lineTo(590, 470); shackle.closePath();
    piece(g, shackle, '#7a3a1a', (q) => K.dots(q, 520, 160, 880, 470, 22, 3.4));
    const body = new Path2D(); body.roundRect(440, 450, 520, 430, 40);
    piece(g, body, RED, (q) => { K.clouds(q, 470, 480, 940, 860, 46); q.clearRect && 0; });
    // 锁孔＋刻字（字整体镂空）
    g.save(); g.globalCompositeOperation = 'destination-out'; g.font = '150px "LXGWWenKai-500"'; g.textAlign = 'center'; g.fillText('古律', 700, 650);
    const kh = new Path2D(); kh.arc(700, 740, 30, 0, 7); kh.moveTo(686, 760); kh.lineTo(714, 760); kh.lineTo(724, 830); kh.lineTo(676, 830); kh.closePath(); g.fill(kh); g.restore();
    g.strokeStyle = EDGE; g.lineWidth = 2.4; g.save(); g.font = '150px "LXGWWenKai-500"'; g.textAlign = 'center'; g.strokeText('古律', 700, 650); g.restore();
    // 两侧锁链
    for (let i = 0; i < 6; i++) { const x = 440 - 60 - i * 62, y = 640 + i * 8; const l = new Path2D(); l.ellipse(x, y, 34, 20, 0.1, 0, 7); l.ellipse(x, y, 20, 8, 0.1, 0, 7, true); piece(g, l, '#5a2e14', null, 3); }
  });
  return {
    draw(c, lt, t) {
      screen(c, t);
      const ts = step(lt);
      // 锁随主杆一顿一顿轻晃
      const sway = .02 * Math.sin(ts * 3.2);
      c.save(); c.translate(700, 880); c.rotate(sway); c.translate(-700, -880); P.stamp(c, lock(), { dx: 8, dy: 6 }); c.restore();
      rod(c, [700, 880], [760, 1080]);
      // 钥匙：挂在胸前的红绳上，绳从右上垂下，钥匙绕绳结摆（10fps）
      const L = P.scratch('bKey'), g = L.getContext('2d'); g.reset();
      const knot = [1360, 250], ang = .22 * Math.sin(ts * 2.6) + .05;
      const kx = knot[0] + Math.sin(ang) * 330, ky = knot[1] + Math.cos(ang) * 330;
      // 胸前衣襟（只出一角：皮影人的前襟与绶带）
      const robe = new Path2D(); robe.moveTo(1120, 0); robe.lineTo(1600, 0); robe.lineTo(1640, 1080); robe.lineTo(1080, 1080); robe.bezierCurveTo(1140, 700, 1060, 300, 1120, 0);
      piece(g, robe, GRN, (q) => { K.flowers(q, 1160, 60, 1640, 1040, 64, 6); });
      piece(g, (() => { const p = new Path2D(); p.moveTo(1300, 0); p.lineTo(1380, 0); p.lineTo(1260, 1080); p.lineTo(1180, 1080); p.closePath(); return p; })(), AMB, (q) => K.dots(q, 1180, 10, 1380, 1070, 16, 3), 3);
      g.save(); g.translate(...knot); g.rotate(-ang); g.translate(-knot[0], -knot[1]);
      // 绳
      g.strokeStyle = RED; g.lineWidth = 7; g.beginPath(); g.moveTo(knot[0] - 70, knot[1] - 260); g.lineTo(knot[0], knot[1]); g.lineTo(knot[0] + 70, knot[1] - 260); g.stroke();
      g.beginPath(); g.moveTo(knot[0], knot[1]); g.lineTo(knot[0], knot[1] + 200); g.stroke();
      // 钥匙：圆环柄＋长杆＋齿；锈斑＝不规则镂空
      const key = new Path2D(); key.arc(knot[0], knot[1] + 250, 58, 0, 7); key.arc(knot[0], knot[1] + 250, 30, 0, 7, true);
      key.rect(knot[0] - 13, knot[1] + 300, 26, 300); key.rect(knot[0] + 13, knot[1] + 520, 54, 24); key.rect(knot[0] + 13, knot[1] + 568, 40, 24);
      piece(g, key, '#9a6a2a', (q) => { const r = rng(5); for (let i = 0; i < 40; i++) { q.beginPath(); q.ellipse(knot[0] + (r() - .5) * 110, knot[1] + 200 + r() * 400, 2 + r() * 6, 1.5 + r() * 4, r() * 3, 0, 7); q.fill(); } }, 3);
      // 锈：一层铁锈色斑点 multiply
      g.save(); g.clip(key); const r2 = rng(9); g.fillStyle = 'rgba(110,50,20,.55)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(knot[0] + (r2() - .5) * 120, knot[1] + 190 + r2() * 420, 3 + r2() * 9, 0, 7); g.fill(); } g.restore();
      g.restore();
      P.stamp(c, L, { dx: 7, dy: 5 });
      rivet(c, knot[0], knot[1]); rod(c, [knot[0], knot[1]], [1500, 1080]);
      // 诗句：右侧竖排刻在一条皮带上（10fps 逐字亮出）
      const verse = '钥匙早已生锈', vx = 1770; const n = Math.min(verse.length, Math.floor(clamp((lt - .4) / 1.6) * verse.length + .0001));
      const band = P.scratch('bBand'), bg = band.getContext('2d'); bg.reset();
      piece(bg, (() => { const p = new Path2D(); p.roundRect(vx - 62, 120, 124, 780, 18); return p; })(), '#7a3a1a', (q) => { q.font = '96px "LXGWWenKai-500"'; q.textAlign = 'center'; for (let i = 0; i < n; i++) q.fillText(verse[i], vx, 230 + i * 118); }, 6);
      P.stamp(c, band, { dx: 6, dy: 4 });
      // 木框
      c.drawImage(P.cached('b_frame', W, H, (g2) => { g2.fillStyle = '#2a140a'; g2.beginPath(); g2.rect(0, 0, W, H); g2.rect(28, 24, W - 56, H - 48); g2.fill('evenodd'); g2.strokeStyle = '#a8742e'; g2.lineWidth = 3; g2.strokeRect(34, 30, W - 68, H - 60); const vg = g2.createRadialGradient(960, 500, 500, 960, 540, 1150); vg.addColorStop(0, 'rgba(40,15,0,0)'); vg.addColorStop(1, 'rgba(40,15,0,.45)'); g2.fillStyle = vg; g2.fillRect(28, 24, W - 56, H - 48); }), 0, 0);
    },
  };
})();
