#!/bin/bash
# 整片分 4 段并行渲染 → 拼接 → 混口播 → 门禁
set -e
P=/home/user/Claude/能动科普视频; cd $P/代码工程
F=$(python3 -c "import json;s=open('neng_shots.js').read();print(round(json.loads(s[s.index('{'):s.rindex('}')+1])['total']*30))")
mkdir -p $P/渲染/段; rm -f $P/渲染/段/p*.mp4
C=$(( (F + 3) / 4 ))
for i in 0 1 2 3; do a=$(( C * i )); b=$(( C * (i + 1) )); [ $b -gt $F ] && b=$F
  uv run -q --with playwright==1.56.0 python render.py --film neng --fps 30 --from $(python3 -c "print($a/30)") --to $(python3 -c "print($b/30)") --out $P/渲染/段/p$i.mp4 > $P/渲染/段/p$i.log 2>&1 & done
wait
cd $P/渲染/段; for i in 0 1 2 3; do printf "file 'p%d.mp4'\n" $i; done > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy ../成片_无声.mp4
cd ..; ffmpeg -v error -y -i 成片_无声.mp4 -i ../音频/口播.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest 成片_口播.mp4
echo "帧数目标 $F"; ffprobe -v error -count_packets -show_entries stream=nb_read_packets -of csv=p=0 成片_无声.mp4
cd /home/user/Claude/.claude/skills/huashu-art-motion && uv run -q scripts/film_gate.py $P/渲染/成片_口播.mp4 2>&1 | grep -E "门禁|结论|最差|黄灯|  - "
