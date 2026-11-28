/* ===== LE COMPTEUR DU BOT, 2 : les causes mecaniques et les bras du banc (2026-11-28, etude « echelle de bots ») =====
   Lecture seule. (a) joueurs et c0025 (note-voltige4-t900) au MEME palier moteur et sur la MEME map : km/h au sol, km par minute, pieces de route
       par km (le palier de chaque echantillon est refait depuis la somme des evenements 'piece', seuils de ml/bot/mesures.js) ;
   (b) le banc des genes (courses-2026-48.jsonl) : pieces par minute de chaque bras, apparie graine par graine au bras « depart » (c0025) ;
   (c) les 40 courses vue par vue de l'etude « sortie preparee » : pieces par minute par map imposee, figures par vol (evenement 'pose').
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/compteur-bot/causes.js */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),M=require('../../../../../bot/mesures.js');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),out=[],f1=x=>x.toFixed(1),f0=x=>Math.round(x)+'';
const lus=fs.readdirSync(path.join(RAC,'ml/bot/etalon')).filter(f=>f.endsWith('.json')).map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml/bot/etalon',f),'utf8'))}));
const J=M.partiesJoueurs(lus).parties.map(M.finVraie);
const B=JSON.parse(fs.readFileSync(path.join(RAC,'ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json'),'utf8')).parties.map(p=>M.finVraie(p.partie));
/* (a) */
const GP=[[1,3],[4,6],[7,9],[10,12],[13,30]];
function parPalier(L){
  const A={};const cle=(gp,c)=>gp+'|'+c;
  for(const c of L){const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]];
    const fp=new Set(c.ev.filter(e=>e[1]==='figure_payee').map(e=>e[0]));
    const P=c.ev.filter(e=>e[1]==='piece');let ip=0,cum=0;
    const carte=r=>((c.routes||[])[r]||{}).carte||'?';
    for(let j=0;j<E.length;j++){const e=E[j],t=g(e,'t');let route=0;
      while(ip<P.length&&P[ip][0]<=t){cum+=P[ip][2]|0;if(!fp.has(P[ip][0])&&g(e,'m')===0)route+=P[ip][2]|0;ip++;}
      const pal=M.palierDe(cum),gi=GP.findIndex(x=>pal>=x[0]&&pal<=x[1]);
      for(const k of [cle(gi,'*'),cle(gi,carte(g(e,'r')))]){const a=A[k]||(A[k]={dt:0,km:0,route:0,kmh:0,nS:0,n:0,nit:0});
        const dt=j?Math.min(.25,t-g(E[j-1],'t')):0;a.dt+=dt;a.n++;if(g(e,'nit'))a.nit++;a.route+=route;
        if(g(e,'m')===0){a.kmh+=g(e,'kmh');a.nS++;}
        if(j&&g(e,'r')===g(E[j-1],'r')){const ds=g(e,'s')-g(E[j-1],'s');if(ds>0&&ds<400)a.km+=ds/1000;}}}}
  return A;}
const AJ=parPalier(J),AB=parPalier(B);
out.push('## (a) au meme palier moteur (toutes maps) : joueurs (14 parties) contre c0025 (20 parties)');
out.push('| paliers | min joueurs | min c0025 | km/h sol J | km/h sol c0025 | km/min J | km/min c0025 | route/km J | route/km c0025 | route/min J | route/min c0025 | nitro % J | nitro % c0025 |');
out.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
GP.forEach((x,i)=>{const a=AJ[i+'|*'],b=AB[i+'|*'];if(!a&&!b)return;const z={dt:0,km:0,route:0,kmh:0,nS:1,n:1,nit:0};const A=a||z,Bb=b||z;
  out.push(`| ${x[0]}–${x[1]} | ${f1(A.dt/60)} | ${f1(Bb.dt/60)} | ${f0(A.kmh/A.nS)} | ${f0(Bb.kmh/Bb.nS)} | ${f1(A.km/(A.dt/60||1))} | ${f1(Bb.km/(Bb.dt/60||1))} | ${f1(A.route/(A.km||1))} | ${f1(Bb.route/(Bb.km||1))} | ${f0(A.route/(A.dt/60||1))} | ${f0(Bb.route/(Bb.dt/60||1))} | ${f0(100*A.nit/A.n)} | ${f0(100*Bb.nit/Bb.n)} |`);});
out.push('\n## (a bis) par map, paliers 4 a 9 (la ou les deux ont du temps) : pieces de route par km et km/h au sol');
out.push('| map | min J | min c0025 | route/km J | route/km c0025 | km/h sol J | km/h sol c0025 |');out.push('|---|---|---|---|---|---|---|');
const cartes=new Set(Object.keys(AJ).concat(Object.keys(AB)).map(k=>k.split('|')[1]).filter(c=>c!=='*'));
for(const c of cartes){const s=(A,cc)=>{const r={dt:0,km:0,route:0,kmh:0,nS:0};for(const i of [1,2]){const a=A[i+'|'+cc];if(a)for(const k in r)r[k]+=a[k];}return r;};
  const a=s(AJ,c),b=s(AB,c);if(a.dt<30&&b.dt<30)continue;
  out.push(`| ${c} | ${f1(a.dt/60)} | ${f1(b.dt/60)} | ${a.km?f1(a.route/a.km):'-'} | ${b.km?f1(b.route/b.km):'-'} | ${a.nS?f0(a.kmh/a.nS):'-'} | ${b.nS?f0(b.kmh/b.nS):'-'} |`);}
/* (b) */
const L=fs.readFileSync(path.join(RAC,'ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse).filter(l=>l.usage==='banc');
const parBras={};for(const l of L)(parBras[l.id]=parBras[l.id]||new Map()).set(l.graine,l);
const dep=parBras.depart;function rnd(s){let x=s>>>0;return ()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
out.push('\n## (b) le banc des genes : pieces (sommet) par minute de course, chaque bras contre « depart » (c0025) sur les memes graines');
out.push('| bras | courses | pieces/min | ecart a depart | IC 95 % de l\'ecart (bootstrap apparie sur les graines) | figures/min (mesures) | vols/min | survie mediane s |');
out.push('|---|---|---|---|---|---|---|---|');
for(const [id,m] of Object.entries(parBras)){const G=[...m.keys()].filter(g=>dep.has(g));
  const rate=(GG,mm)=>GG.reduce((a,g)=>a+mm.get(g).pieces,0)/(GG.reduce((a,g)=>a+mm.get(g).survie_s,0)/60);
  const r=rate(G,m),r0=rate(G,dep),rr=rnd(11),V=[];
  for(let b=0;b<4000;b++){const S=G.map(()=>G[(rr()*G.length)|0]);V.push(rate(S,m)-rate(S,dep));}V.sort((a,b)=>a-b);
  const mes=k=>{const X=G.map(g=>m.get(g)).filter(l=>l.mesures&&l.mesures[k]!=null);const mn=X.reduce((a,l)=>a+l.survie_s/60,0);return mn?X.reduce((a,l)=>a+l.mesures[k]*l.survie_s/60,0)/mn:NaN;};
  const sv=G.map(g=>m.get(g).survie_s).sort((a,b)=>a-b);
  out.push(`| ${id} | ${G.length} | ${f1(r)} | ${id==='depart'?'—':(r-r0>=0?'+':'')+f1(r-r0)} | ${id==='depart'?'—':'['+f1(V[100])+' ; '+f1(V[3899])+']'} | ${mes('figures').toFixed(2)} | ${mes('vols').toFixed(2)} | ${f0(sv[sv.length>>1])} |`);}
/* (c) */
const D=path.join(RAC,'ml/ecurie/etude/sortie-preparee/sorties/lignes'),C={};let poses=0,posesFig=0,figs=0,vols=0;
for(const f of fs.readdirSync(D).filter(f=>f.endsWith('.json')&&!f.includes('-ref'))){const j=JSON.parse(fs.readFileSync(path.join(D,f),'utf8'));
  const k=f.split('-')[0],c=C[k]||(C[k]={n:0,p:0,s:0,v:0,fig:0,pos:0});c.n++;c.p+=j.pieces;c.s+=j.survie_s;
  for(const e of j.ev||[]){if(e[1]==='decol'){c.v++;vols++;}if(e[1]==='pose'){c.pos++;poses++;figs+=e[7]|0;c.fig+=e[7]|0;if((e[7]|0)>0)posesFig++;}}}
out.push('\n## (c) les 40 courses vue par vue (tmax 180 s, c0025 v:4 a la naissance) : par map imposee');
out.push('| map | courses | min | pieces (sommet)/min | vols/min | figures de la main par pose |');out.push('|---|---|---|---|---|---|');
for(const [k,c] of Object.entries(C))out.push(`| ${k} | ${c.n} | ${f1(c.s/60)} | ${f0(c.p/(c.s/60))} | ${f1(c.v/(c.s/60))} | ${(c.fig/Math.max(1,c.pos)).toFixed(2)} |`);
out.push(`total : ${vols} decollages, ${poses} poses, ${posesFig} poses avec au moins une figure de la main, ${figs} figures`);
fs.writeFileSync(path.join(__dirname,'sortie-causes.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
