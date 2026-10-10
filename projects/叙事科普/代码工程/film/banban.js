// 板板：账号形象。一块木框小黑板，脸用粉笔画在板面上（表情能擦了重画），画架当腿，木头胳膊。
// BB.draw(c, cx, cy, s, o)：(cx,cy) 是板面中心，s 缩放（1 = 板面 616×476）。
//   o.expr: smile | happy | think | surprise | wink | erase | story
//   o.armR: chalk（举粉笔）| point（指向右上）| wave（挥手）；o.armL: down | eraser（拿板擦）| hip
//   o.legs: false 不画画架腿（头像用）；o.t 时间（粉笔灰飘动用）
(() => {
const { clamp, lerp } = U;
const C = { bg: '#23302B', ink: '#F1EFE6', sub: '#A9B3AA', yel: '#F4D35E', red: '#E87D5A', dark: '#1B1A17', wood: '#B98A5A', woodD: '#8E6440', woodL: '#CFA174', glove: '#F4ECDA', teal: '#2F5D62', paper: '#EDE3D1' };
const BB = window.BB = { C };
const P = (pts) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
const sm = (pts, per = 6) => KIT.densify(pts.concat([pts[0]]), per);
const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const wob = (pts, seed, amp = 1.6) => KIT.resample(pts, 5).map(([x, y], i) => [x + PAINT.noise(i * 0.19 + seed, 3.1) * amp, y + PAINT.noise(i * 0.19 + 70 + seed, 8.7) * amp]);
const chalk = (c, pts, col = C.ink, w = 8, seed = 1, closed = false) => {
  const Q = wob(closed ? pts.concat([pts[0]]) : pts, seed);
  c.save(); c.strokeStyle = col; c.lineCap = c.lineJoin = 'round'; c.lineWidth = w; c.beginPath(); Q.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
  c.globalAlpha = 0.4; c.lineWidth = w * 0.5; c.translate(1.4, -1.2); c.stroke(); c.restore();
};
const shaded = (c, path, fill, dark, sx, sy) => { c.save(); c.clip(path); c.fillStyle = dark; c.fillRect(-3000, -3000, 9000, 9000); c.translate(sx, sy); c.fillStyle = fill; c.fill(path); c.restore(); };
const line = (c, path, w = 6) => { c.save(); c.lineWidth = w; c.strokeStyle = C.dark; c.lineJoin = 'round'; c.stroke(path); c.restore(); };
BB.chalk = chalk; BB.ell = ell; BB.P = P; BB.sm = sm;

// ---------- 板面上的脸 ----------
const face = (c, expr, t) => {
  // 聪明的眼：杏仁形外框，上眼睑压住瞳孔上沿（不是圆瞪着），目光对焦
  const sEye = (x, y, o = {}) => {
    const rx = o.rx || 60, ry = o.ry || 38, lid = o.lid ?? 0.3, [lx, ly] = o.look || [0, 0];
    const top = ell(x, y, rx, ry, Math.PI, Math.PI * 2, 24), bot = ell(x, y, rx, ry * 0.8, 0, Math.PI, 24);
    const E = P(top.concat(bot));
    c.save(); c.clip(E); c.beginPath(); c.rect(x - rx - 4, y - ry + ry * 2 * lid, rx * 2 + 8, ry * 3); c.clip();
    c.fillStyle = C.ink; c.beginPath(); c.arc(x + lx * rx * 0.4, y + ly * ry * 0.3 + 2, ry * 0.95, 0, 7); c.fill();
    c.fillStyle = C.bg; c.beginPath(); c.arc(x + lx * rx * 0.4, y + ly * ry * 0.3 + 2, ry * 0.42, 0, 7); c.fill();
    c.fillStyle = C.ink; c.beginPath(); c.arc(x + lx * rx * 0.4 - ry * 0.3, y + ly * ry * 0.3 - ry * 0.2, ry * 0.16, 0, 7); c.fill();
    c.restore();
    chalk(c, KIT.densify([[x - rx - 6, y + 2], [x - rx * 0.4, y - ry + ry * 2 * lid - 2], [x + rx * 0.5, y - ry + ry * 2 * lid - 4], [x + rx + 8, y - 4]], 6), C.ink, 10, x + 11);
    chalk(c, KIT.densify([[x - rx * 0.7, y + ry * 0.75], [x, y + ry * 0.85], [x + rx * 0.7, y + ry * 0.7]], 4), C.ink, 4, x + 12);
  };
  const glasses = (y = -20) => { for (const x of [-96, 96]) chalk(c, ell(x, y, 84, 64, 0, Math.PI * 2, 40), C.ink, 6, 200 + x, true); chalk(c, KIT.densify([[-22, y - 6], [0, y - 16], [22, y - 6]], 4), C.ink, 6, 210); chalk(c, [[-180, y - 10], [-300, y - 30]], C.ink, 5, 211); chalk(c, [[180, y - 10], [300, y - 30]], C.ink, 5, 212); };
  const smirk = (x0 = -40, flip = 1) => chalk(c, KIT.densify([[x0, 118], [x0 + 40, 128], [x0 + 82, 112], [x0 + 96, 96]].map(([x, y]) => [x * flip, y]), 6), C.ink, 8, 220);
  const cEye = (x, y, o = {}) => {
    if (o.closed) { chalk(c, ell(x, y + 6, 46, 30, Math.PI * 1.1, Math.PI * 1.9, 20), C.ink, 10, x + 3); return; }
    if (o.happy) { chalk(c, ell(x, y + 18, 44, 40, Math.PI * 1.08, Math.PI * 1.92, 20), C.ink, 10, x + 5); return; }
    const rx = o.rx || 46, ry = o.ry || 58;
    chalk(c, ell(x, y, rx, ry, 0, Math.PI * 2, 40), C.ink, 8, x, true);
    const [lx, ly] = o.look || [0.25, 0.15], pr = o.pupil || 1;
    c.fillStyle = C.ink; c.beginPath(); c.ellipse(x + lx * rx * 0.5, y + ly * ry * 0.5, 22 * pr, 28 * pr, 0, 0, 7); c.fill();
    c.fillStyle = C.bg; c.beginPath(); c.arc(x + lx * rx * 0.5 - 8 * pr, y + ly * ry * 0.5 - 10 * pr, 7 * pr, 0, 7); c.fill();
  };
  const brow = (x, y, tilt, seed) => chalk(c, [[x - 52, y + tilt], [x - 4, y - 12], [x + 50, y - tilt]], C.ink, 9, seed);
  const nose = () => chalk(c, [[0, 50], [-12, 86], [10, 86]], C.ink, 6, 84);
  if (expr === 'story') {
    // 脸缩到上半，下面写那条故事链
    c.save(); c.translate(0, -90); c.scale(0.62, 0.62); sEye(-96, -10, { lid: 0.3, look: [0, 0.8] }); sEye(96, -10, { lid: 0.3, look: [0, 0.8] }); chalk(c, KIT.densify([[-150, -96], [-96, -108], [-40, -98]], 6), C.ink, 10, 81); chalk(c, KIT.densify([[40, -98], [96, -108], [150, -96]], 6), C.ink, 10, 82); smirk(-30); c.restore();
    chalk(c, [[-230, 170], [-230, 90], [-180, 90], [-180, 170]], C.yel, 6, 90); c.fillStyle = C.yel; c.beginPath(); c.arc(-192, 132, 5, 0, 7); c.fill();
    chalk(c, [[-150, 132], [-90, 132]], C.yel, 6, 91); chalk(c, [[-104, 118], [-88, 132], [-104, 146]], C.yel, 6, 92);
    chalk(c, ell(-20, 160, 52, 50, Math.PI, Math.PI * 2, 18).concat([[-72, 160]]), C.yel, 6, 93);
    chalk(c, [[50, 132], [110, 132]], C.yel, 6, 94); chalk(c, [[96, 118], [112, 132], [96, 146]], C.yel, 6, 95);
    c.fillStyle = C.yel; c.font = '96px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('饱', 190, 136);
    return;
  }
  if (expr === 'smart1') {        // 学者：半框眼镜，眼皮微垂，嘴角一边扬——「我想明白了」
    glasses(); sEye(-96, -20, { lid: 0.36, look: [0.2, 0.1] }); sEye(96, -20, { lid: 0.36, look: [0.2, 0.1] });
    chalk(c, KIT.densify([[-156, -110], [-92, -122], [-30, -112]], 6), C.ink, 9, 230); chalk(c, KIT.densify([[30, -118], [92, -136], [156, -126]], 6), C.ink, 9, 231);
    smirk(-30);
    return;
  }
  if (expr === 'smart2a') {
    sEye(-96, -10, { lid: 0.28, look: [0.15, 0.05] }); sEye(96, -10, { lid: 0.28, look: [0.15, 0.05] });
    chalk(c, KIT.densify([[-150, -94], [-96, -104], [-40, -96]], 6), C.ink, 9, 230); chalk(c, KIT.densify([[34, -104], [96, -128], [150, -116]], 6), C.ink, 9, 231);
    smirk(-20);
    c.fillStyle = C.yel; c.font = '58px "CMU-it"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('因 → 果', 190, -170); chalk(c, [[250, -120], [266, -102], [296, -140]], C.yel, 7, 232);
    return;
  }
  if (expr === 'smart2') {        // 冷静讲解：眼睛斜看向旁边刚画的图，一边眉毛挑起
    sEye(-96, -10, { lid: 0.26, look: [1, -0.15] }); sEye(96, -10, { lid: 0.26, look: [1, -0.15] });
    chalk(c, [[-140, -84], [-88, -96], [-38, -92]], C.ink, 9, 230); chalk(c, KIT.densify([[34, -104], [90, -126], [146, -116]], 6), C.ink, 9, 231);
    smirk(-20);
    // 板面右上角：一个刚推出来的小式子，打了勾
    c.fillStyle = C.yel; c.font = '58px "CMU-it"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('因 → 果', 190, -170);
    chalk(c, [[250, -120], [266, -102], [296, -140]], C.yel, 7, 232);
    return;
  }
  if (expr === 'smart3') {        // 点拨：眼神笃定看着你，头顶亮起一个想法
    sEye(-96, -10, { lid: 0.32, look: [0, 0.1] }); sEye(96, -10, { lid: 0.32, look: [0, 0.1] });
    chalk(c, [[-140, -96], [-88, -102], [-36, -90]], C.ink, 9, 230); chalk(c, [[36, -90], [88, -104], [140, -98]], C.ink, 9, 231);
    chalk(c, KIT.densify([[-46, 112], [0, 132], [52, 110]], 6), C.ink, 8, 233); chalk(c, [[52, 110], [62, 100]], C.ink, 7, 234);
    // 灯泡
    chalk(c, ell(0, -178, 34, 34, Math.PI * 0.75, Math.PI * 2.25, 30), C.yel, 6, 235); chalk(c, [[-16, -150], [-14, -134], [14, -134], [16, -150]], C.yel, 6, 236);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; chalk(c, [[Math.cos(a) * 50, -178 + Math.sin(a) * 50], [Math.cos(a) * 70, -178 + Math.sin(a) * 70]], C.yel, 5, 237 + i); }
    return;
  }
  const L = -90, R = 90, Y = -10;
  if (expr === 'smile') { cEye(L, Y); cEye(R, Y); brow(L, -100, 4, 81); brow(R, -100, -4, 82); nose(); chalk(c, KIT.densify([[-70, 120], [0, 170], [72, 118]], 6), C.ink, 9, 83); }
  if (expr === 'happy') { cEye(L, Y, { happy: true }); cEye(R, Y, { happy: true }); brow(L, -96, 8, 81); brow(R, -96, -8, 82);
    const m = P(sm([[-86, 100], [86, 100], [60, 170], [0, 196], [-60, 170]], 6)); c.fillStyle = C.ink; c.globalAlpha = 0.9; c.fill(m); c.globalAlpha = 1; c.save(); c.clip(m); c.fillStyle = C.red; c.beginPath(); c.ellipse(0, 196, 52, 34, 0, 0, 7); c.fill(); c.restore(); chalk(c, sm([[-86, 100], [86, 100], [60, 170], [0, 196], [-60, 170]], 6), C.ink, 6, 85); }
  if (expr === 'think') { sEye(-96, -10, { lid: 0.2, look: [0.8, -0.9] }); sEye(96, -10, { lid: 0.2, look: [0.8, -0.9] }); chalk(c, KIT.densify([[-150, -100], [-96, -108], [-40, -100]], 6), C.ink, 9, 81); chalk(c, KIT.densify([[36, -112], [96, -142], [154, -124]], 6), C.ink, 9, 82);
    chalk(c, KIT.densify([[-20, 128], [30, 122], [60, 112]], 4), C.ink, 8, 83); c.fillStyle = C.yel; c.font = '150px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('？', 230, -150); }
  if (expr === 'surprise') { sEye(-96, -10, { lid: 0, ry: 46, look: [0, 0] }); sEye(96, -10, { lid: 0, ry: 46, look: [0, 0] }); chalk(c, KIT.densify([[-150, -116], [-96, -134], [-40, -122]], 6), C.ink, 9, 81); chalk(c, KIT.densify([[40, -122], [96, -134], [150, -116]], 6), C.ink, 9, 82);
    chalk(c, ell(0, 130, 22, 28, 0, Math.PI * 2, 30), C.ink, 8, 83, true); c.fillStyle = C.red; c.font = '160px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('！', 240, -140); }
  if (expr === 'wink') { cEye(L, Y); cEye(R, Y, { closed: true }); brow(L, -100, 4, 81); brow(R, -92, -2, 82); nose(); chalk(c, KIT.densify([[-60, 120], [10, 160], [80, 112]], 6), C.ink, 9, 83);
    for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.4; chalk(c, [[200 + Math.cos(a) * 30, -60 + Math.sin(a) * 30], [200 + Math.cos(a) * 60, -60 + Math.sin(a) * 60]], C.yel, 6, 86 + i); } }
  if (expr === 'erase') {
    // 左半张脸已经被擦掉（一片糊），右半张还在
    sEye(96, -10, { lid: 0.3, look: [-0.9, 0] }); chalk(c, KIT.densify([[40, -100], [96, -122], [152, -110]], 6), C.ink, 9, 82); chalk(c, KIT.densify([[20, 124], [60, 130], [92, 112]], 6), C.ink, 8, 83);
    c.save(); c.globalAlpha = 0.35; c.fillStyle = C.sub; c.beginPath(); c.ellipse(-110, 20, 190, 160, -0.1, 0, 7); c.fill(); c.globalAlpha = 0.18; c.beginPath(); c.ellipse(-40, -30, 120, 100, 0.3, 0, 7); c.fill(); c.restore();
    for (let i = 0; i < 7; i++) chalk(c, [[-280 + i * 12, -150 + i * 46], [40 - i * 10, -160 + i * 48]], 'rgba(169,179,170,.35)', 22, 100 + i);
  }
};

BB.draw = (c, cx, cy, s = 1, o = {}) => {
  const expr = o.expr || 'smile', t = o.t || 0;
  c.save(); c.translate(cx, cy); c.scale(s, s); if (o.tilt) c.rotate(o.tilt);
  // 影子
  if (o.legs !== false) { c.save(); c.fillStyle = 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(0, 466, 330, 24, 0, 0, 7); c.fill(); c.restore(); }
  // 画架腿＋鞋
  if (o.legs !== false) {
    const leg = (pts, col) => { const p = P(pts); c.fillStyle = col; c.fill(p); shaded(c, p, col, C.woodD, 6, 0); line(c, p); };
    leg([[-16, 230], [16, 230], [20, 440], [-18, 440]], C.wood);
    leg([[-240, 230], [-204, 230], [-278, 460], [-314, 460]], C.wood); leg([[204, 230], [240, 230], [314, 460], [278, 460]], C.wood);
    leg([[-290, 380], [290, 380], [290, 396], [-290, 396]], C.woodD);
    for (const x of [-296, 296]) { const sh = P(sm([[x - 50, 470], [x - 40, 440], [x + 28, 436], [x + 56, 470]], 5)); c.fillStyle = C.red; c.fill(sh); shaded(c, sh, C.red, '#B4553C', 0, -8); line(c, sh, 5); c.fillStyle = '#FFFDF7'; c.fillRect(x - 46, 462, 100, 8); }
  }
  // 左臂
  const arm = (pts) => { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.dark; c.lineWidth = 34; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); c.strokeStyle = C.wood; c.lineWidth = 24; c.stroke(); c.strokeStyle = C.woodL; c.lineWidth = 6; c.translate(-4, -4); c.stroke(); c.restore(); };
  const mitt = (x, y, r, closed = true) => { c.save(); c.translate(x, y); c.rotate(r); const m = P(sm(closed ? [[-30, 12], [-28, -24], [6, -36], [32, -16], [32, 18], [0, 34]] : [[-30, 12], [-36, -40], [-14, -56], [6, -40], [22, -60], [40, -40], [34, 18], [0, 34]], 5)); c.fillStyle = C.glove; c.fill(m); shaded(c, m, C.glove, '#D9CDB4', 0, -6); line(c, m, 5); c.restore(); };
  const arm2 = (pts) => { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.dark; c.lineWidth = 26; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); c.strokeStyle = C.wood; c.lineWidth = 17; c.stroke(); c.strokeStyle = C.woodL; c.lineWidth = 4; c.translate(-3, -3); c.stroke(); c.restore();
    const e = pts[1]; c.fillStyle = C.woodD; c.beginPath(); c.arc(e[0], e[1], 13, 0, 7); c.fill(); c.strokeStyle = C.dark; c.lineWidth = 4; c.stroke(); };
  const hand = (x, y, r, kind) => { c.save(); c.translate(x, y); c.rotate(r);
    const shapes = { fist: [[-26, 14], [-26, -18], [4, -28], [28, -14], [28, 16], [0, 28]], finger: [[-24, 16], [-24, -10], [-4, -14], [-6, -66], [8, -72], [14, -14], [28, -6], [26, 20], [0, 28]], open: [[-26, 16], [-30, -30], [-14, -44], [4, -30], [18, -48], [34, -34], [28, 18], [0, 28]] };
    const m = P(sm(shapes[kind] || shapes.fist, 4)); c.fillStyle = C.glove; c.fill(m); shaded(c, m, C.glove, '#D9CDB4', 0, -5); line(c, m, 4); c.restore(); };
  const armL = o.armL || 'down';
  if (armL === 'present') { arm2([[-350, 60], [-470, 150], [-560, 90]]); hand(-574, 80, -1.2, 'open'); }
  if (armL === 'down') { arm([[-350, 50], [-420, 130], [-400, 220]]); mitt(-398, 232, 0.3); }
  if (armL === 'hip') { arm([[-350, 40], [-450, 90], [-380, 170]]); mitt(-368, 170, 1.6); }
  if (armL === 'eraser') { arm([[-350, 0], [-430, -60], [-360, -150]]); c.save(); c.translate(-330, -170); c.rotate(-0.3); const er = new Path2D(); er.roundRect(-80, -26, 160, 52, 10); c.fillStyle = C.teal; c.fill(er); c.fillStyle = '#C9C4B6'; c.fillRect(-80, 8, 160, 18); line(c, er, 5); c.restore(); mitt(-352, -150, -0.4);
    const r = U.rng(3); c.fillStyle = 'rgba(241,239,230,.6)'; for (let i = 0; i < 18; i++) { c.globalAlpha = 0.3 + r() * 0.5; c.beginPath(); c.arc(-260 + r() * 120, -110 + r() * 160 + Math.sin(t * 2 + i) * 6, 2 + r() * 4, 0, 7); c.fill(); } c.globalAlpha = 1; }
  // 木框
  const F = new Path2D(); F.roundRect(-350, -280, 700, 560, 28);
  shaded(c, F, C.wood, C.woodD, -12, -12); line(c, F, 7);
  c.save(); c.clip(F); c.strokeStyle = 'rgba(90,55,25,.30)'; c.lineWidth = 3; for (let i = 0; i < 15; i++) { c.beginPath(); const y = -270 + i * 38; c.moveTo(-350, y); c.bezierCurveTo(-140, y + 10, 60, y - 12, 350, y + 6); c.stroke(); }
  c.fillStyle = 'rgba(255,230,190,.25)'; c.fillRect(-340, -272, 680, 10); c.restore();
  // 四角铜钉
  for (const [x, y] of [[-322, -252], [322, -252], [-322, 252], [322, 252]]) { c.fillStyle = '#C9A04A'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.strokeStyle = C.dark; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(x - 3, y - 3, 3, 0, 7); c.fill(); }
  // 板面
  const Bd = new Path2D(); Bd.rect(-308, -238, 616, 476);
  c.save(); c.fillStyle = C.bg; c.fill(Bd); c.clip(Bd); const bt = CL.paperTile('bb_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(bt, 'repeat'); c.fillRect(-308, -238, 616, 476);
  c.fillStyle = 'rgba(169,179,170,.07)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-240 + i * 100, -140 + (i % 3) * 120, 140, 30, 0.2, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-308, -238, 616, 14); c.fillRect(-308, -238, 12, 476);
  face(c, expr, t);
  c.restore(); line(c, Bd, 6);
  // 粉笔槽：一截粉笔（右手不拿时）、一块板擦（左手不拿时）
  const tray = P([[-330, 270], [330, 270], [340, 306], [-340, 306]]); c.fillStyle = C.woodD; c.fill(tray); line(c, tray);
  if (armL !== 'eraser') { const er = new Path2D(); er.roundRect(100, 234, 150, 40, 8); c.fillStyle = C.teal; c.fill(er); c.fillStyle = '#C9C4B6'; c.fillRect(100, 262, 150, 12); line(c, er, 5); }
  c.fillStyle = '#F7F4EB'; c.fillRect(-220, 254, 90, 18); c.strokeStyle = C.dark; c.lineWidth = 3; c.strokeRect(-220, 254, 90, 18);
  if (armL === 'chin') { arm2([[-350, 200], [-330, 360], [-170, 296]]); hand(-150, 284, -0.6, 'fist'); }
  // 右臂
  const armR = o.armR || 'chalk';
  if (armR === 'finger') { arm2([[350, 20], [470, -40], [470, -170]]); hand(472, -190, 0.1, 'finger'); }
  if (armR === 'write') { arm2([[350, 0], [480, 60], [560, -40]]); c.save(); c.translate(578, -70); c.rotate(0.6); c.fillStyle = '#F7F4EB'; c.fillRect(-10, -60, 20, 64); c.lineWidth = 4; c.strokeStyle = C.dark; c.strokeRect(-10, -60, 20, 64); c.fillStyle = C.yel; c.fillRect(-10, -60, 20, 9); c.restore(); hand(568, -50, 0.4, 'fist');
    chalk(c, KIT.densify([[600, -110], [640, -170], [700, -150], [720, -210]], 6), C.yel, 7, 240); }
  if (armR === 'chalk') { arm([[350, -10], [440, -100], [430, -210]]); c.save(); c.translate(428, -250); c.rotate(0.35); c.fillStyle = '#F7F4EB'; c.fillRect(-12, -70, 24, 74); c.lineWidth = 4; c.strokeStyle = C.dark; c.strokeRect(-12, -70, 24, 74); c.fillStyle = C.yel; c.fillRect(-12, -70, 24, 10); c.restore(); mitt(428, -218, -0.2); }
  if (armR === 'point') { arm([[350, -40], [450, -110], [540, -170]]); c.save(); c.translate(560, -184); c.rotate(-0.55); const h = P(sm([[-30, 14], [-30, -20], [10, -26], [60, -24], [64, -12], [20, -6], [28, 20], [0, 30]], 5)); c.fillStyle = C.glove; c.fill(h); line(c, h, 5); c.restore(); }
  if (armR === 'wave') { arm([[350, -30], [450, -90], [470, -220]]); mitt(474, -250, 0.2, false); for (let i = 0; i < 3; i++) { const a = -1.9 + i * 0.4; c.save(); c.strokeStyle = C.dark; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(474, -250, 90 + i * 0, a, a + 0.25); c.stroke(); c.restore(); } }
  c.restore();
};
})();
