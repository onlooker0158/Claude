"""文稿.txt → 分句（字幕单元）→ Piper 逐句合成 → 拼成 音频/口播.wav，并写 音频/时间轴.json。
用法：uv run --with piper-tts python 工具/tts.py <piper模型.onnx>
"""
import json, re, subprocess, sys, wave, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = sys.argv[1]
SPEED = 1.05                       # length-scale：越大越慢
SR = 22050
# 字幕显示 → 念法（字幕保留原文写法，口播念中文）
SAY = [('8000', '八千'), ('7992', '七千九百九十二'), ('8 元', '八元'), ('985', '九八五'), ('Ta', '他'), ('（potluck）', ''), ('……', '，')]
src = (ROOT / '文稿.txt').read_text()
src = src.split('】', 1)[1]
src = re.sub(r'（压缩自.*?）', '', src, flags=re.S)
sections, cur = [], None
for line in src.splitlines():
    line = line.strip()
    if not line: continue
    m = re.match(r'〔(.+?)〕', line)
    if m: cur = {'name': m.group(1), 'paras': []}; sections.append(cur); continue
    cur['paras'].append(line)
def chunks(p):
    # 先按句末标点切，再把超过 22 字的句子按逗号再切
    out = []
    for s in re.findall(r'[^。！？]+[。！？]?[」”]?', p):
        s = s.strip()
        if not s: continue
        if len(s) <= 22: out.append(s); continue
        parts = re.findall(r'[^，：；——]+(?:[，：；]|——)?', s); buf = ''
        for q in parts:
            if len(buf) + len(q) > 22 and buf: out.append(buf); buf = q
            else: buf += q
        if buf: out.append(buf)
    return out
items = []
for si, sec in enumerate(sections):
    poem = sec['name'] == '六、收束'
    for pi, p in enumerate(sec['paras']):
        for ci, s in enumerate(chunks(p) if not (poem and len(p) <= 12) else [p]):
            end = s[-1]
            gap = 0.12 if end in '，：；' or s.endswith('——') else 0.38
            items.append({'sec': si, 'secName': sec['name'], 'para': pi, 'text': s, 'gap': gap})
        items[-1]['gap'] = 0.65
    items[-1]['gap'] = 1.2
# 诗句之间停久一点
for it in items:
    if it['text'] in ('古律如锁，', '锁住饥寒与不安；', '钥匙早已生锈——', '你却把它挂在胸前，', '当作信仰的徽章。'): it['gap'] = 0.7; it['poem'] = True
tmp = ROOT / '音频' / '_句'; tmp.mkdir(parents=True, exist_ok=True)
pcm, t = b'', 0.6
pcm += b'\x00\x00' * int(SR * 0.6)
for i, it in enumerate(items):
    say = it['text']
    for a, b in SAY: say = say.replace(a, b)
    say = say.replace('「', '').replace('」', '').replace('《', '').replace('》', '')
    f = tmp / f'{i:03d}.wav'
    if not f.exists():
        subprocess.run(['piper', '-m', MODEL, '--length-scale', str(SPEED), '--sentence-silence', '0', '-f', str(f)], input=say.encode(), check=True, capture_output=True)
    with wave.open(str(f)) as w:
        assert w.getframerate() == SR; data = w.readframes(w.getnframes())
    # 去掉首尾静音
    import array
    a = array.array('h', data); thr = 300
    s0 = next((k for k, v in enumerate(a) if abs(v) > thr), 0); s1 = len(a) - next((k for k, v in enumerate(reversed(a)) if abs(v) > thr), 0)
    a = a[max(0, s0 - 400):min(len(a), s1 + 800)]
    it['t0'] = round(t, 3); dur = len(a) / SR; it['t1'] = round(t + dur, 3)
    pcm += a.tobytes(); g = int(SR * it['gap']); pcm += b'\x00\x00' * g; t += dur + g / SR
with wave.open(str(ROOT / '音频' / '口播_22k.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)
(ROOT / '音频' / '时间轴.json').write_text(json.dumps({'total': round(t, 3), 'items': items}, ensure_ascii=False, indent=1))
print('句数', len(items), '总长', round(t, 1))
