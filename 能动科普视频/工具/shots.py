"""一份镜头数据 → 镜头表.md（给 storyboard_lint）＋ 代码工程/neng_shots.js（给渲染：板块位置、时间轴、相机事件、字幕）。
用法：python3 工具/shots.py
"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / '音频' / '时间轴.json').read_text())
IT = TL['items']
S = lambda i: IT[i]['t0']
TAIL = 3.8                                   # 最后一句之后：拉远看全貌＋粉笔放下
TOTAL = round(TL['total'] + TAIL - 1.2, 2)

# ---------- 黑板上的板块：一行一节，块宽默认 1600，块间留 200 ----------
ROWS = [
    ['b_dice', 'b_reborn', 'b_door', 'b_manual', 'b_ladder'],
    ['b_loop', 'b_lag', 'b_dna'],
    ['b_bowl', 'b_food', 'b_wabi', 'b_filial', 'b_risk', 'b_bird'],
    ['b_herd', 'b_obey', 'b_busy', 'b_study', 'b_equal'],
    [('b_loan', 2600), 'b_effort', 'b_metric'],
    ['b_poster', 'b_cage', 'b_mountain', 'b_agent', 'b_poem'],
]
BH, GAP, ROWGAP = 860, 200, 360
POS = {}
for r, row in enumerate(ROWS):
    x = 0
    for b in row:
        name, w = (b if isinstance(b, tuple) else (b, 1600))
        POS[name] = {'x': x, 'y': r * (BH + ROWGAP), 'w': w, 'h': BH}
        x += w + GAP
ROWW = {}
for r, row in enumerate(ROWS):
    names = [b[0] if isinstance(b, tuple) else b for b in row]; ROWW[r] = POS[names[-1]]['x'] + POS[names[-1]]['w']
MAXW = max(ROWW.values())
for r, row in enumerate(ROWS):
    for b in row:
        POS[b[0] if isinstance(b, tuple) else b]['x'] += (MAXW - ROWW[r]) // 2
BOARD = {'w': max(p['x'] + p['w'] for p in POS.values()), 'h': len(ROWS) * (BH + ROWGAP) - ROWGAP}

# ---------- 镜头：(起点句号或秒, 板块, 相机, 物, 动作, 屏上字) ----------
# 相机：('pan',) 回到板块中心 z=1；('pan', fx, fy) 同倍率横移到板块内一点；('punch', fx, fy, k) 快推（k<0 快拉）；
#       ('slam',) 砸入；('stay',) 停；('pull',) 拉远看整面黑板
SHOTS = [
    (0, 'b_dice', ('stay',), '一枚粉笔骰子', '粉笔一笔笔描出骰子，骰子弹跳翻面', ''),
    (1, 'b_dice', ('punch', 1150, 360, .22), '一枚勋章', '粉笔画出挂着绶带的勋章', '功成名就'),
    (2, 'b_dice', ('pan', 1150, 520), '一只沙漏', '沙漏上半的沙一格格漏光', '垂垂老矣'),
    (3, 'b_reborn', ('pan',), '一个循环箭头', '箭头绕圈画满一周，指向下一世', '下一世'),
    (4, 'b_reborn', ('punch', 560, 470, .2), '那枚骰子', '骰子滚过黑板，停在一扇小房子前', '完全随机'),
    (5, 'b_reborn', ('pan', 760, 470), '一座小房子', '小房子一笔画成，烟囱冒出一缕烟', '普通家庭'),
    (6, 'b_reborn', ('pan', 1080, 470), '一只宝箱', '宝箱画好后被一个大叉划掉', ''),
    (7, 'b_reborn', ('punch', 1340, 470, .18), '一本书', '板擦来回擦，书上的字一行行消失', '被忘掉'),
    (8, 'b_door', ('pan',), '一扇门', '粉笔描出门框和门把手', '后门儿'),
    (9, 'b_door', ('punch', 800, 470, .24), '门后的说明书', '门一格格打开，一本小册子从门里滑出', '人生说明书'),
    (10, 'b_door', ('slam',), '一个大问号', '问号砸到小册子旁边', '写什么？'),
    (11, 'b_manual', ('pan',), '说明书的第一页', '粉笔写下第①条，旁边画一排楼', '大城市'),
    (12, 'b_manual', ('pan', 800, 520), '一把扳手和一条重尾曲线', '②③两条依次写上，曲线拖出长尾', '重尾分布'),
    (13, 'b_manual', ('punch', 620, 690, .24), '说明书的第④条', '粉笔一字一顿写下第④条', '摆脱平庸'),
    (15, 'b_manual', ('stay',), '第④条下面的线', '一道黄线划过第④条，再圈一圈', ''),
    (16, 'b_ladder', ('pan',), '一排一模一样的梯子', '梯子一架接一架画出来，长得完全一样', '天经地义'),
    (18, 'b_ladder', ('punch', 1150, 470, .2), '最右边那架梯子', '梯子往上长，顶端撞上一条虚线', ''),
    (19, 'b_ladder', ('slam',), '天花板虚线', '虚线一段段画满，标签砸上去', '人人能到的高度'),
    (20, 'b_loop', ('pan',), '一把水平仪', '水平仪里的气泡晃两下，停在正中', '稳态生存逻辑'),
    (21, 'b_loop', ('punch', 560, 470, .22), '水平仪的气泡', '气泡停在两道刻线正中', '追求稳定'),
    (22, 'b_loop', ('punch', 980, 470, .18), '一条环形轨道', '轨道画成一个圈，三站依次标上', '一辈子'),
    (23, 'b_loop', ('pan', 1080, 430), '轨道上的小车', '小车绕着圈一格格走，回到原点', ''),
    (24, 'b_loop', ('punch', 980, 470, -.15), '那条轨道', '一道裂纹折线劈开轨道', '不一样了'),
    (26, 'b_lag', ('pan',), '一张坐标图', '两根坐标轴画出来', '文化滞后'),
    (27, 'b_lag', ('punch', 900, 420, .22), '两条曲线', '物质曲线先冲上去，观念曲线拖在后面', '慢很多'),
    (28, 'b_dna', ('pan',), '一条双螺旋', '双螺旋一圈圈画出，跟着转', '三大基因'),
    (29, 'b_dna', ('punch', 800, 430, .2), '双螺旋上的三段', '三段依次涂色，各写一个名字', ''),
    (30, 'b_bowl', ('pan',), '一只空碗', '碗里只剩三粒米，粉笔点出来', '求生存'),
    (32, 'b_bowl', ('punch', 1100, 420, .2), '碗上的三级台阶', '台阶从碗沿往上长：价值观、道德、审美', '审美'),
    (33, 'b_food', ('pan',), '一罐泡菜、一份炸鱼薯条、一桌聚餐', '三样吃的依次画出来', ''),
    (34, 'b_food', ('punch', 330, 470, .22), '泡菜罐上的价签', '价签吊在罐子上晃', '廉价果腹'),
    (35, 'b_food', ('punch', 800, 420, -.18), '一条横幅', '横幅展开盖在三样吃的上方', '民族特色'),
    (36, 'b_wabi', ('pan',), '一只茶碗', '茶碗裂开一道缝', '侘寂'),
    (S(37) + 1.6, 'b_wabi', ('punch', 760, 450, .22), '茶碗的裂缝', '黄粉笔把裂缝描成一道金线', '以此为荣'),
    (38, 'b_filial', ('pan',), '两座房子之间的铁链', '铁链一环环连上两座房子', '孝道'),
    (39, 'b_filial', ('punch', 800, 330, .2), '一张保单', '保单盖上章，压在铁链上', '养老保险'),
    (40, 'b_filial', ('pan', 800, 480), '一枚硬币', '硬币落下，砸断铁链', '养老金'),
    (42, 'b_filial', ('punch', 800, 470, -.16), '两座房子之间', '断链处画出一颗心', ''),
    (43, 'b_filial', ('pan', 800, 600), '心下面的标签', '心底下写上两个字', '更纯粹'),
    (44, 'b_risk', ('pan',), '两摞钞票', '一摞高、一摞薄，并排画出', '风险厌恶'),
    (45, 'b_risk', ('punch', 480, 470, .2), '高的那摞钱和一枚骰子', '骰子在高摞旁边弹跳', '一百万'),
    (46, 'b_risk', ('pan', 1120, 470), '薄的那摞钱和一把锁', '锁扣上薄摞', '一千元'),
    (47, 'b_risk', ('slam',), '一行等式', '等式写出来，俭字被圈住', '俭 = 低风险'),
    (49, 'b_bird', ('pan',), '电线上的一排鸟', '一排鸟落在电线上，有一只站得高', '出头鸟'),
    (50, 'b_bird', ('punch', 560, 330, .24), '那只高的鸟', '准星圈住它，十字线收紧', ''),
    (51, 'b_bird', ('pan', 1050, 600), '滑板、自行车、汽车', '三样东西依次画出，箭头连起来', '最小可行产品'),
    (52, 'b_bird', ('punch', 1250, 330, .18), '一卷图纸', '图纸越画越长，被打上一个叉', '害怕失败'),
    (54, 'b_herd', ('pan',), '一道缺了板的篱笆', '篱笆一根根立起，中间缺几块', '弱规则'),
    (56, 'b_herd', ('pan', 1000, 430), '篱笆后面的问号', '问号一个个冒出来', ''),
    (57, 'b_herd', ('punch', 800, 600, .2), '一群箭头', '箭头全部朝同一个方向画出', '一窝蜂'),
    (58, 'b_obey', ('pan',), '一张奖状', '奖状的花边一圈圈画出来', '顺从'),
    (59, 'b_obey', ('punch', 800, 430, .22), '奖状上的两个字', '奖状中间写上大字', '听话'),
    (60, 'b_obey', ('slam',), '一个大问号', '问号砸在奖状旁边', '是优点吗'),
    (61, 'b_obey', ('punch', 900, 470, -.15), '奖状上的那两个字', '被一道斜线划掉，箭头指向平庸', '没主意'),
    (62, 'b_busy', ('pan',), '一架天平', '天平一头写态度、一头写结果，往态度那边沉', '态度'),
    (63, 'b_busy', ('punch', 560, 470, .2), '天平往下沉的那头', '托盘一格格压到底', '态度要好'),
    (64, 'b_busy', ('pan', 1200, 430), '一只空转轮', '转轮越转越快，转速线甩出来', '忙碌'),
    (65, 'b_study', ('pan',), '一本摊开的作业本', '本子上一行行写满同一个字', ''),
    (66, 'b_study', ('punch', 800, 450, .22), '作业本的那一页', '读、抄、背三个字越叠越密', '学习的样子'),
    (67, 'b_study', ('pan', 1000, 450), '作业本旁的喇叭线', '一圈圈声波从本子上冒出来', '气势汹汹'),
    (68, 'b_equal', ('pan',), '两行等式', '服从＝业绩，态度→能力，依次写出', ''),
    (69, 'b_equal', ('slam',), '第三行等式', '姿势→成果砸上去，下面画两道线', '姿势＝成果'),
    (70, 'b_loan', ('pan',), '一面写着题目的黑板', '粉笔写下题目，画一个放大镜', '简单模型'),
    (71, 'b_loan', ('pan', 1050, 430), '两个圆圈：你和同事', '两个圈画出来，一根箭头从你到同事', '8000'),
    (72, 'b_loan', ('slam',), '一根回来的箭头', '箭头从同事回到你，数字砸上去，差额被圈出一个问号', '少 8 元'),
    (74, 'b_loan', ('punch', 1050, 430, .2), '一个方框：微信', '方框画在路上，箭头穿过它', '微信转账'),
    (75, 'b_loan', ('pan', 1050, 470), '方框下面的一小截', '方框扣下一小截，写上 −8', '手续费'),
    (76, 'b_loan', ('pan', 1550, 430), '同事那个圈', '圈里写下拿到多少，箭头指回去', '7992'),
    (77, 'b_loan', ('pan', 1050, 560), '还钱那根箭头', '箭头被描粗一遍', ''),
    (78, 'b_loan', ('punch', 1000, 420, -.2), '一个大圆圈', '大圆圈把微信和你一起圈进去', '外部世界'),
    (79, 'b_loan', ('pan', 1050, 430), '一条竖虚线', '虚线把借钱和手续费分开', '信用关系'),
    (80, 'b_loan', ('stay',), '虚线另一边', '手续费那边写上「微信的事」', ''),
    (81, 'b_effort', ('pan',), '一条直线', '一条斜直线从努力画到回报', '线性思维'),
    (82, 'b_effort', ('slam',), '直线顶端', '感叹号砸在顶端', '回报！'),
    (83, 'b_effort', ('pan', 1150, 470), '一只礼盒', '礼盒打开，里面是空的', '没有神灵'),
    (84, 'b_metric', ('pan',), '一张文凭', '文凭卷轴展开', '指标主义'),
    (85, 'b_metric', ('punch', 560, 430, .2), '文凭上的数字', '985 写上去，箭头指向高薪', '985'),
    (86, 'b_metric', ('pan', 1080, 380), '一张欠条', '欠条上写「世界欠我」', '世界欠我的'),
    (87, 'b_metric', ('punch', 800, 600, -.15), '一根反过来的箭头', '箭头从你指回世界，画上问号', '能提供什么'),
    (88, 'b_poster', ('pan',), '一张告示', '告示上一格格打钩：听话、节俭、努力', ''),
    (89, 'b_poster', ('punch', 800, 400, .2), '告示的抬头', '抬头写上「佃农」', '佃农'),
    (90, 'b_poster', ('pan', 1100, 560), '三个小勾', '省心、肯干、不闯祸逐个打钩', '不闯祸'),
    (91, 'b_poster', ('slam',), '最后一格', '兴旺发达那格打上叉', '兴旺发达'),
    (92, 'b_cage', ('punch', 800, 430, .55), '一个小勾', '圆圈里一个勾，局部看很好', '局部理性'),
    (93, 'b_cage', ('pull',), '小勾外面的笼子', '镜头拉出来，笼子的栏杆一根根落下', '枷锁'),
    (94, 'b_mountain', ('pan',), '一座大山', '大山的轮廓一笔画出', '一座大山'),
    (95, 'b_mountain', ('punch', 1150, 360, .2), '一条高波动曲线', '曲线从山后窜出，冲出一个大尖峰', '高波动世界'),
    (96, 'b_agent', ('pan',), '一把扳手', '扳手画在中间，一根箭头从屏外的粉笔指向它', '能动者'),
    (97, 'b_agent', ('punch', 800, 500, .2), '扳手', '扳手转过来，变成被握着的那一头', '你不是工具'),
    (98, 'b_poem', ('pan', 560, 400), '一把锁', '锁身写上「古律」，锁里写下饥寒、不安', '古律如锁'),
    (100, 'b_poem', ('pan', 1150, 430), '一把钥匙', '钥匙画出来，布满锈点', '钥匙早已生锈'),
    (101, 'b_poem', ('punch', 1150, 380, .18), '挂钥匙的绳', '绳子绕上钥匙，挂成一枚徽章，钥匙轻轻晃', '信仰的徽章'),
    (TL['total'] - 0.8, 'b_poem', ('pull',), '整面黑板', '镜头拉远，整面黑板的板书都在，粉笔落进粉笔槽', ''),
]

# ---------- 相机事件 ----------
def world(b, fx, fy):
    p = POS[b]; return p['x'] + fx, p['y'] + fy
events, rows = [], []
cur_z = 1.0
for k, (start, b, cam, obj, act, txt) in enumerate(SHOTS):
    t = S(start) if isinstance(start, int) else start
    at = round(max(0, t - 0.32), 3)
    p = POS[b]; kind = cam[0]
    if kind == 'pan' and len(cam) == 1:
        cx, cy = world(b, min(p['w'], 1600) / 2 if p['w'] <= 1600 else 800, 450)
        events.append({'at': round(max(0, t - 0.62), 3), 'kind': 'to', 'x': cx, 'y': cy, 'z': 1.06, 'dur': 0.6}); cur_z = 1.06; lab = '横移'
    elif kind == 'pan':
        x, y = world(b, cam[1], cam[2]); events.append({'at': at, 'kind': 'pan', 'x': x, 'y': y}); lab = '横移'
    elif kind == 'punch':
        x, y = world(b, cam[1], cam[2]); kk = max(cam[3], .26) if cam[3] > 0 else min(cam[3], -.2); events.append({'at': at, 'kind': 'punch', 'k': kk, 'x': x, 'y': y + 20}); cur_z *= 1 + kk; lab = '快推'
    elif kind == 'slam':
        events.append({'at': round(t, 3), 'kind': 'slam'}); lab = '砸入'
    elif kind == 'stay':
        lab = '停'
    elif kind == 'pull':
        if k == len(SHOTS) - 1:
            events.append({'at': at, 'kind': 'to', 'x': BOARD['w'] / 2, 'y': BOARD['h'] / 2 + 120, 'z': round(min(1920 / (BOARD['w'] + 400), 1080 / (BOARD['h'] + 700)), 4), 'dur': 1.6})
        else:
            cx, cy = world(b, 800, 450); events.append({'at': at, 'kind': 'to', 'x': cx, 'y': cy, 'z': 1.06, 'dur': 0.36})
        lab = '快推'                              # 快拉也记作快推（lint 只认五种）
    rows.append([t, obj, act, lab, txt, f'scenes/neng_board.js · {b}'])
# 口播节点的脉冲：每句开头、长句里的逗号处各一次「快推/快拉」（离已有镜头动作不到 0.9 秒就跳过）。
# 推近和拉回按当前倍数交替，镜头在 1.06–1.45 倍之间来回，不越推越大。
def zoom_at(t):
    z = 1.06
    for e in sorted(events, key=lambda e: e['at']):
        if e['at'] > t: break
        if e['kind'] == 'to': z = e['z']
        elif e['kind'] == 'punch': z *= 1 + e['k']
    return z
nodes = []
for it in IT:
    nodes.append(it['t0'])
    dur, txt = it['t1'] - it['t0'], it['text']
    if dur > 2.8:
        for ci, ch in enumerate(txt[:-2]):
            if ch in '，、：' and 4 <= ci: nodes.append(it['t0'] + dur * (ci + 1) / len(txt))
last_shot = rows[-1][0]
extra = 0
for tm in sorted(nodes):
    at = round(tm - 0.08, 3)
    if at > last_shot - 1.0: continue
    if any(abs(e['at'] - at) < 0.9 for e in events): continue
    z = zoom_at(at)
    events.append({'at': at, 'kind': 'punch', 'k': 0.28 if z < 1.3 else -0.22}); extra += 1
print('补节点快推', extra)
fmt = lambda x: f'{x:.1f}'
md = ['# 镜头表 · 能动：稳态生存的观念陷阱', '',
      '画风：黑板粉笔板书，一整面深绿黑板，粉笔线带颗粒，镜头在同一面板上停住→横移/快推→停住，结尾拉远看整面黑板',
      '色板：chalk', '角色：无（主物是一支粉笔，在板上写和画；人不出画）', '',
      '| 时间段 | 画面里的物 | 它在做什么 | 镜头 | 屏上字 | 做法 |', '|---|---|---|---|---|---|']
for i, r in enumerate(rows):
    t1 = rows[i + 1][0] if i + 1 < len(rows) else TOTAL
    md.append(f'| {fmt(r[0] if i else 0)}–{fmt(t1)} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]} |')
(ROOT / '镜头表.md').write_text('\n'.join(md) + '\n')
subs = [{'t0': it['t0'], 't1': it['t1'] + min(it['gap'], 0.5), 'text': it['text']} for it in IT]
js = ('// 由 工具/shots.py 生成，别手改\n'
      f'window.NENG = {json.dumps({"total": TOTAL, "board": BOARD, "pos": POS, "items": [[it["t0"], it["t1"]] for it in IT], "cam": events, "subs": subs}, ensure_ascii=False)};\n')
(ROOT / '代码工程' / 'neng_shots.js').write_text(js)
durs = [((rows[i + 1][0] if i + 1 < len(rows) else TOTAL) - (rows[i][0] if i else 0)) for i in range(len(rows))]
print('镜头', len(rows), '全长', TOTAL, '最短', round(min(durs), 2), '最长', round(max(durs), 2))
for i, d in enumerate(durs):
    if d < 2 or d > 6: print('  超范围', i + 1, round(d, 2), rows[i][1])
