// 方向 A · 纸本拼贴「人生说明书」：俯拍书桌，说明书＋剪报＋红线，红章砸在数字上。色板 paper。
SCENES['dirA_manual'] = (() => {
  const W = 1920, H = 1080, { clamp, lerp, rng, ss } = U, P = PAINT;
  const BG = '#F3EDE2', SUR = '#FBF8F2', INK = '#1B1A17', SUB = '#6B655B', RED = '#C8402F', TEAL = '#2F5D62';
  const HAND = '"LXGWWenKai-500"', HEI = '"PuHui-Bold"';
  const desk = () => P.cached('a_desk', W, H, (g) => {
    g.fillStyle = '#E7DCCB'; g.fillRect(0, 0, W, H);
    const r = rng(11); g.globalAlpha = 0.07;
    for (let i = 0; i < 120; i++) { g.strokeStyle = r() < .5 ? '#8a7356' : '#fff'; g.lineWidth = 1 + r() * 3; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(600, y + (r() - .5) * 40, 1300, y + (r() - .5) * 40, W, y + (r() - .5) * 30); g.stroke(); }
    g.globalAlpha = 1; g.drawImage(P.grain('a_g', 0.1, [90, 70, 40], 0.25), 0, 0);
  });
  const shadowed = (c, fn, blur = 18, dy = 10, a = .22) => { c.save(); c.shadowColor = `rgba(60,40,20,${a})`; c.shadowBlur = blur; c.shadowOffsetY = dy; fn(); c.restore(); };
  const lineText = (c, s, x, y, size, col, font = HAND) => { c.font = `${size}px ${font}`; c.fillStyle = col; c.fillText(s, x, y); return c.measureText(s).width; };
  return {
    draw(c, lt) {
      c.drawImage(desk(), 0, 0);
      // —— 说明书（左，微斜）——
      c.save(); c.translate(560, 560); c.rotate(-0.045);
      shadowed(c, () => { c.fillStyle = SUR; c.fillRect(-470, -400, 940, 790); });
      c.fillStyle = '#ece4d6'; c.fillRect(-4, -400, 8, 790);                 // 书脊
      c.strokeStyle = 'rgba(47,93,98,.18)'; c.lineWidth = 1.5; for (let y = -250; y < 360; y += 58) { c.beginPath(); c.moveTo(-430, y); c.lineTo(-30, y); c.moveTo(30, y); c.lineTo(430, y); c.stroke(); }
      lineText(c, '人生说明书', -420, -300, 74, INK);
      lineText(c, '给下一世的自己', -416, -238, 34, SUB);
      const items = ['① 尽快去一个大城市', '② 学几项可迁移的技能', '③ 理解「重尾分布」', '④ 摆脱平庸观念'];
      items.forEach((s, i) => lineText(c, s, -416, -136 + i * 116, 44, i === 3 ? RED : INK));
      // ④ 下划线：红笔 12fps 步进画出
      const u = ss(0.3, 1.1, MO.step(lt, 12)); c.strokeStyle = RED; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); P.roughPath(c, [[-416, 236], [lerp(-416, -40, u), 232 + 4 * u]], { amp: 1.5, seed: 3 }); c.stroke();
      // 右页：手写批注
      lineText(c, '你周围的人都认为', 40, -280, 38, INK);
      lineText(c, '这些观念天经地义。', 40, -222, 38, INK);
      lineText(c, '人人都在用的梯子，', 40, -110, 38, INK);
      lineText(c, '多半只能到达', 40, -52, 38, INK);
      lineText(c, '人人能到的高度。', 40, 6, 38, TEAL);
      c.restore();
      // —— 剪报：转账小票（右，胶带贴住）——
      const sx = 1420, sy = 470;
      c.save(); c.translate(sx, sy); c.rotate(0.06);
      shadowed(c, () => { c.fillStyle = '#fffdf8'; c.beginPath(); c.moveTo(-250, -330); c.lineTo(250, -330); for (let x = 250; x >= -250; x -= 25) c.lineTo(x, 330 + (((x / 25) | 0) % 2 ? 12 : 0)); c.closePath(); c.fill(); });
      lineText(c, '借款记录', -210, -250, 40, INK, HEI);
      c.fillStyle = SUB; c.fillRect(-210, -222, 420, 2);
      const rows = [['借出', '¥ 8,000.00', INK], ['提现手续费', '− ¥ 8.00', SUB], ['归还', '¥ 7,992.00', RED]];
      rows.forEach(([k, v, col], i) => { const y = -150 + i * 92; lineText(c, k, -210, y, 34, SUB, '"PuHui-Medium"'); c.font = `40px ${HEI}`; c.fillStyle = col; c.textAlign = 'right'; c.fillText(v, 210, y); c.textAlign = 'left'; });
      c.setLineDash([6, 8]); c.strokeStyle = SUB; c.lineWidth = 2; c.beginPath(); c.moveTo(-210, 150); c.lineTo(210, 150); c.stroke(); c.setLineDash([]);
      lineText(c, '“我只拿到 7992，', -210, 210, 32, INK);
      lineText(c, '  所以只能还你 7992。”', -210, 256, 32, INK);
      // 胶带
      c.save(); c.translate(0, -338); c.rotate(-0.08); c.fillStyle = 'rgba(214,196,150,.75)'; c.fillRect(-90, -22, 180, 44); c.restore();
      // 红章砸入（1.55→0.94→1）
      const k = MO.slam(lt, 1.0); if (lt >= 1.0) {
        c.save(); c.translate(40, 100); c.rotate(-0.12); c.scale(k * .8, k * .8); c.globalAlpha = 0.86; c.globalCompositeOperation = 'multiply';
        c.strokeStyle = RED; c.lineWidth = 7; c.strokeRect(-170, -58, 340, 116); c.lineWidth = 2.5; c.strokeRect(-158, -46, 316, 92);
        c.font = `62px ${HEI}`; c.fillStyle = RED; c.textAlign = 'center'; c.fillText('少还 8 元', 0, 22); c.restore(); }
      c.restore();
      // —— 红线：从小票连到便签 ——
      const nx = 1270, ny = 905;
      const q = ss(1.4, 2.2, MO.step(lt, 12));
      if (q > 0) { const pts = P.bez([1200, 780], [1150, 840], [1240, 860], [nx + 40, ny - 60], 30); const n = Math.max(2, (pts.length * q) | 0);
        c.strokeStyle = RED; c.lineWidth = 4; c.beginPath(); pts.slice(0, n).forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); }
      [[1200, 780]].forEach(([x, y]) => { c.fillStyle = RED; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); });
      // 便签
      c.save(); c.translate(nx + 90, ny + 30); c.rotate(-0.05);
      shadowed(c, () => { c.fillStyle = '#F2D98A'; c.fillRect(-190, -90, 380, 150); }, 12, 6, .2);
      lineText(c, '把外部世界', -160, -30, 38, INK); lineText(c, '当成一个整体', -160, 26, 38, INK);
      c.restore();
      // 钢笔
      c.save(); c.translate(1080, 930); c.rotate(-0.62); shadowed(c, () => { c.fillStyle = '#1f2a2b'; c.fillRect(-180, -13, 300, 26); c.fillStyle = '#b89a52'; c.fillRect(120, -13, 22, 26); c.fillStyle = '#2b2b2b'; c.beginPath(); c.moveTo(142, -11); c.lineTo(205, 0); c.lineTo(142, 11); c.fill(); }, 10, 8, .3); c.restore();
    },
  };
})();
