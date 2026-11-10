// Same model as the page. Grid = 5 min, steady state (24 h periodic kernels).
const STAGES={early:{lHalf:3.5,endo:4},mid:{lHalf:2.2,endo:2},late:{lHalf:1.5,endo:0.5}};
const DR={ ir:{led:1,tp:1,half:'L'}, cr:{led:0.75,tp:2.5,half:'L'} };
function solveKa(tmax,ke){let lo=ke*1.0001,hi=400;for(let i=0;i<80;i++){const m=(lo+hi)/2;const t=Math.log(m/ke)/(m-ke);if(t>tmax)lo=m;else hi=m;}return(lo+hi)/2;}
const N=288, OFF=+process.env.OFF||14, DYS=+process.env.DYS||50, START=6, BED=22.5, WAKE=6.5;
function kernels(st){const K={};for(const [k,D] of Object.entries(DR)){const ke=Math.LN2/STAGES[st].lHalf,ka=solveKa(Math.min(D.tp,0.95/ke),ke);const a=new Float64Array(N);for(let i=0;i<N;i++){let v=0;for(let d=0;d<8;d++){const dt=i/12+24*d;if(dt>0)v+=ka*ke/(ka-ke)*(Math.exp(-ke*dt)-Math.exp(-ka*dt));}a[i]=v*D.led;}K[k]=a;}return K;}
const slotOf=t=>Math.round((t-START)*12);
// allowed dose times: awake 06:30..22:30 on 30-min grid
const TIMES=[];for(let t=WAKE;t<=BED+1e-9;t+=0.5)TIMES.push(t);
function level(st,K,plan){const e=STAGES[st].endo;const L=new Float64Array(N);for(let i=0;i<N;i++){const t=START+i/12;L[i]=e*(1+0.25*Math.cos(2*Math.PI*(t-14)/24))+plan.P*30/24;}
  for(const d of plan.doses){const s=slotOf(d.t);const k=K[d.k];for(let i=0;i<N;i++)L[i]+=d.amt*k[((i-s)%N+N)%N];}return L;}
const led=p=>p.P*30+p.doses.reduce((a,d)=>a+d.amt*DR[d.k].led,0);
function cost(st,K,p){const L=level(st,K,p);let def=0,over=0;for(const v of L){if(v<OFF)def+=OFF-v;if(v>DYS)over+=v-DYS;}
  if(!p.doses.some(d=>d.k==='cr'))def+=1e4; // 息宁 must be present
  return {c:led(p)+2000*(def+over)/12+4*p.doses.length,def,over,L};}
const AM={ir:[50,100,150,200],cr:[100,200]};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function mutate(p){const q={P:p.P,doses:p.doses.map(d=>({...d}))};const r=Math.random();
  if(r<0.15)q.P=Math.min(16,Math.max(2,q.P+rnd([-2,2])));
  else if(r<0.35&&q.doses.length<6)q.doses.push({k:rnd(['ir','cr']),t:rnd(TIMES),amt:0}),q.doses[q.doses.length-1].amt=rnd(AM[q.doses[q.doses.length-1].k]);
  else if(r<0.45&&q.doses.length>1)q.doses.splice(Math.floor(Math.random()*q.doses.length),1);
  else if(q.doses.length){const d=rnd(q.doses);const r2=Math.random();
    if(r2<0.5)d.t=Math.min(BED,Math.max(WAKE,d.t+rnd([-1,-0.5,0.5,1])));else if(r2<0.85)d.amt=rnd(AM[d.k]);else{d.k=d.k==='ir'?'cr':'ir';d.amt=rnd(AM[d.k]);}}
  return q;}
function search(st,fixP){const K=kernels(st);let best=null;
  for(let run=0;run<60;run++){let p={P:fixP||rnd([4,6,8,10,12]),doses:[{k:'cr',t:rnd(TIMES),amt:200},{k:'ir',t:6.5,amt:100}]};let c=cost(st,K,p).c;
    for(let it=0;it<6000;it++){const T=40*(1-it/6000)+0.5;const q=mutate(p);if(fixP)q.P=fixP;const cq=cost(st,K,q).c;if(cq<c||Math.random()<Math.exp((c-cq)/T)){p=q;c=cq;}
      if(!best||c<best.c)best={c,p:JSON.parse(JSON.stringify(p))};}}
  const r=cost(st,K,best.p);const L=r.L;let mn=1e9,mx=0;for(const v of L){mn=Math.min(mn,v);mx=Math.max(mx,v);}
  return {st,P:best.p.P,doses:best.p.doses.sort((a,b)=>a.t-b.t),led:led(best.p),def:r.def,over:r.over,min:mn,max:mx};}
const fmt=t=>String(Math.floor(t)).padStart(2,'0')+':'+(t%1?'30':'00');
for(const st of (process.env.ST||'early,mid,late').split(',')){
  for(const P of (process.env.PS||"0").split(",").map(Number)){const r=search(st,P||null);
  console.log(`${st} | 罗替高汀 ${r.P} mg (LED ${r.P*30}) | `+r.doses.map(d=>`${fmt(d.t)} ${d.k==='cr'?'息宁控释':'美多芭'} ${d.amt}`).join(', ')+` | LEDD ${r.led} | min ${r.min.toFixed(1)} max ${r.max.toFixed(1)} | 缺口 ${r.def.toFixed(2)} 超出 ${r.over.toFixed(2)}`);}}
