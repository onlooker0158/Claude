// 帕金森病 · 夜里睡得好吗？——竖屏科普短片段落表。段长按口播时间轴切（镜头表.md），镜与镜硬切。
window.FILM_SIZE = [1080, 1920];
window.PUNCH = 0;
window.SCENE_LIBS = ['pd/timeline.js', 'pd/pd.js', 'pd/shots.js', 'pd/curve.js'];
window.EXTRA_ASSETS = ['pd/page1.png', 'pd/page2.png'];
window.FILM_DURATION = 64.44;
const CUT = { type: 'cut', dur: 1 / 30 };
const B = [0, 3.65, 7.55, 9.6, 14.0, 17.2, 22.07, 27.14, 32.36, 36.0, 39.37, 42.6, 45.9, 50.37, 54.48, 58.57, 64.44];
const IDS = ['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12','p13','p14','p15','p16'];
window.ERAS = IDS.map((id, i) => ({ id, dur: +(B[i + 1] - B[i]).toFixed(3), ...(i ? { transition: CUT } : {}) }));
