# 计算一代的选择：证据底线、帕累托前沿、按 R+E+B 补足（按 子主题 原文去重，语义归组需调度者再判断）。
# 用法：python3 -I .claude/skills/evolve/select.py runs/evolve/<日期> <代数>
import json,sys,os
d=sys.argv[1]; g=sys.argv[2]; N=8
pop=json.load(open(f"{d}/gen{g}/population.json"))
S={}
for role,k in [("rational","R"),("emotional","E"),("blindspot","B")]:
    for s in json.load(open(f"{d}/gen{g}/scores-{role}.json")):
        S.setdefault(s["id"],{})[k]=s["score"]
rows=[]
for p in pop:
    s=S[p["id"]]; rows.append(dict(id=p["id"],sub=p.get("子主题",""),R=s["R"],E=s["E"],B=s["B"],T=s["R"]+s["E"]+s["B"]))
alive=[r for r in rows if r["R"]>=4]
dead=[r["id"] for r in rows if r["R"]<4]
def dom(a,b): return all(a[k]>=b[k] for k in "REB") and any(a[k]>b[k] for k in "REB")
front=[r for r in alive if not any(dom(o,r) for o in alive if o is not r)]
surv=list(front); cnt={}
for r in surv: cnt[r["sub"]]=cnt.get(r["sub"],0)+1
for r in sorted(alive,key=lambda r:-r["T"]):
    if len(surv)>=N: break
    if r in surv: continue
    if cnt.get(r["sub"],0)>=2: continue
    surv.append(r); cnt[r["sub"]]=cnt.get(r["sub"],0)+1
avg=lambda k: round(sum(r[k] for r in rows)/len(rows),2)
print("avg R/E/B:",avg("R"),avg("E"),avg("B"),"eliminated:",dead)
print("front:",[r["id"] for r in front])
for r in sorted(rows,key=lambda r:-r["T"]):
    tag="FRONT" if r in front else ("SURV" if r in surv else "")
    print(r["id"],r["R"],r["E"],r["B"],r["T"],tag,"|",r["sub"])
