// 板板的成品：头像、6 个表情（透明底）、竖版封面模板、横版封面
(() => {
const C = BB.C;
const paperBg = (c, W, H) => { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); const t = CL.paperTile('bb_wall', C.paper, { size: 512, amt: 8, fibers: 160, grain: 8, seed: 3 }); c.fillStyle = c.createPattern(t, 'repeat'); c.fillRect(0, 0, W, H); };
SCENES.bb_s1 = { draw(c) { BB.draw(c, 560, 480, 0.8, { expr: 'smart1', armR: 'chalk', armL: 'hip', tilt: -0.05 }); } };
SCENES.bb_s2 = { draw(c) { BB.draw(c, 440, 480, 0.78, { expr: 'smart2', armR: 'write', armL: 'down', tilt: 0.04 }); } };
SCENES.bb_s3 = { draw(c) { BB.draw(c, 560, 480, 0.8, { expr: 'smart3', armR: 'finger', armL: 'present', tilt: -0.03 }); } };
// 头像：圆形裁切也完整（主体在中心 70% 的圆里）
SCENES.bb_avatar = { draw(c) { paperBg(c, 1080, 1080); c.fillStyle = 'rgba(47,93,98,.10)'; c.beginPath(); c.arc(540, 540, 470, 0, 7); c.fill(); BB.draw(c, 540, 520, 0.92, { expr: 'smart2a', armR: 'chalk', armL: 'down', legs: false }); } };
const EX = ['think', 'surprise', 'erase', 'story'];
const ARM = { smile: ['chalk', 'down'], happy: ['wave', 'hip'], think: ['chalk', 'hip'], surprise: ['wave', 'down'], wink: ['point', 'hip'], erase: ['chalk', 'eraser'], story: ['point', 'down'] };
EX.forEach(e => { SCENES['bb_' + e] = { draw(c, lt) { BB.draw(c, 540, 480, 0.8, { expr: e, armR: ARM[e][0], armL: ARM[e][1], t: lt }); } }; });
// 竖版封面 1080×1440：上半是标题区，板板在右下角指着标题
SCENES.bb_cover34 = { draw(c) {
  paperBg(c, 1080, 1440);
  c.fillStyle = C.bg; c.fillRect(0, 0, 1080, 760);
  const bt = CL.paperTile('bb_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(bt, 'repeat'); c.fillRect(0, 0, 1080, 760);
  c.fillStyle = C.yel; c.font = '44px "PuHui-Bold"'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('叙事 · 宇宙的第一性原理', 80, 140);
  c.fillStyle = C.ink; c.font = '112px "PuHui-Black"'; c.fillText('物理定律背后', 80, 330); c.fillText('还有更深的', 80, 470); c.fillStyle = C.yel; c.fillText('东西吗？', 80, 610);
  BB.chalk(c, [[80, 650], [520, 642], [600, 652]], C.yel, 10, 7);
  c.fillStyle = C.sub; c.font = '36px "PuHui-Medium"'; c.fillText('读书笔记 · 万维钢《现代思维工具100讲》', 80, 712);
  BB.draw(c, 640, 1060, 0.72, { expr: 'smart3', armR: 'finger', armL: 'down' });
} };
// 横版封面 1920×1080
SCENES.bb_cover169 = { draw(c) {
  paperBg(c, 1920, 1080);
  c.fillStyle = C.bg; c.fillRect(0, 0, 1180, 1080); const bt = CL.paperTile('bb_board', C.bg, { size: 512, amt: 10, fibers: 0, grain: 7, seed: 9 }); c.fillStyle = c.createPattern(bt, 'repeat'); c.fillRect(0, 0, 1180, 1080);
  c.fillStyle = C.yel; c.font = '48px "PuHui-Bold"'; c.textAlign = 'left'; c.fillText('叙事 · 宇宙的第一性原理', 100, 220);
  c.fillStyle = C.ink; c.font = '120px "PuHui-Black"'; c.fillText('物理定律背后', 100, 430); c.fillText('还有更深的', 100, 580); c.fillStyle = C.yel; c.fillText('东西吗？', 100, 730);
  BB.chalk(c, [[100, 780], [600, 770], [700, 782]], C.yel, 10, 7);
  c.fillStyle = C.sub; c.font = '40px "PuHui-Medium"'; c.fillText('读书笔记 · 万维钢《现代思维工具100讲》', 100, 880);
  BB.draw(c, 1500, 520, 0.8, { expr: 'story', armR: 'chalk', armL: 'hip' });
} };
})();
