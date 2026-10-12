// 能动：稳态生存的观念陷阱 —— 整片一段（同一面黑板），相机和板书都在 scenes/neng_board.js 里按时间算
window.PUNCH = 0;
(() => { const x = new XMLHttpRequest(); x.open('GET', 'neng_shots.js', false); x.send(); (0, eval)(x.responseText); })();
window.ERAS = [{ id: 'neng_board', dur: window.NENG.total }];
