#!/usr/bin/env node
/* ===== LE JUGE DU TEST B, A FENETRES DE TEMPS EGALES (28/11/2026, etude « l'echelle de bots », le mesureur du test B) =====
   La RECOPIE de ml/bot/discerner.js (fenetres, apprend, auc, juge, temoin a etiquettes melangees, mesures seules et leur z : le meme code, rien
   n'est change dans ml/bot), avec trois choses en plus, qui ne servent que si on les demande :
     --thum T   ne garder des JOUEURS que les fenetres qui finissent avant T secondes de partie (le « meme temps » que des courses mortes tot) ;
     --tbot T   pareil pour le bot (non utilise par le test B, il est la pour le dire) ;
     --humhum N le temoin HUMAINS CONTRE HUMAINS : N partages au hasard (graine fixe) des parties de joueurs en deux moities, chaque moitie jugee
                contre l'autre par le meme juge (une partie entiere de cote) ; rend la moyenne, l'ecart-type et les quantiles 5 et 95 % de l'AUC.
   Controle : sans --thum ni --tbot, ce script doit rendre l'AUC et le temoin de discerner.js au millieme pres (verifie dans resultats.md).
   usage : node ml/ecurie/etude/echelle-de-bots/tri/juger.js <parties.json | dossier> [--thum 109.5] [--humhum 200] [--sortie f.json] [--nom x]
   Ecrit seulement dans ce dossier (tri/). */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const BOT_ML=path.join(__dirname,'..','..','..','..','bot');
const {partiesDe,partiesJoueurs,finVraie}=require(path.join(BOT_ML,'mesures'));
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const FEN=+opt('fenetre',10),QUI=opt('humains','clavier'),THUM=opt('thum',null)!=null?+opt('thum'):null,TBOT=opt('tbot',null)!=null?+opt('tbot'):null,HH=+opt('humhum',0);

function lis(f){const b=fs.readFileSync(f);return JSON.parse(/\.gz$/i.test(f)?zlib.gunzipSync(b).toString('utf8'):b.toString('utf8'));}
function partiesDuFichier(f){
  const j=lis(f);
  if(j&&Array.isArray(j.courses)&&j.courses[0]&&j.courses[0].partie)return j.courses.map(c=>c.partie);
  if(j&&Array.isArray(j.parties)&&j.parties[0]&&j.parties[0].partie)return j.parties.map(c=>c.partie);
  if(j&&j.partie&&j.partie.ech)return [j.partie];                                     /* une course de course-tri.js */
  return partiesDe(j);}
function fichiersDe(a){if(!fs.existsSync(a))return [];if(fs.statSync(a).isDirectory())return fs.readdirSync(a).filter(f=>/\.json(\.gz)?$/i.test(f)&&!/toutes/.test(f)).sort().map(f=>path.join(a,f));return [a];}

const NOMS=['ecart au milieu (part de la demi-route)','ecart-type de l\'ecart','ondulation (ecart-type de la vitesse laterale / vitesse au sol)','changements de cote par seconde',
  'vitesse : ecart-type / moyenne','part du temps en l\'air','decollages par 10 s','vol moyen (s)','hauteur max (m)','part du temps nitro','bascules de nitro par 10 s',
  'part du temps en drift','figures par 10 s','pieces par seconde','part du temps pres du bord (> 80 %)','acceleration laterale (ecart-type, / vitesse au sol, 1/s)'];
const V_MIN=10;
/* la recopie exacte de fenetres() de discerner.js ; tLim (en plus) : une fenetre dont la fin depasse tLim secondes de partie n'est pas gardee */
function fenetres(c,tLim){
  c=finVraie(c);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const E=c.ech||[],ev=c.ev||[],g=(e,n)=>e[col[n]],F=[];
  if(E.length<FEN*10)return F;
  const rh=r=>((c.routes||[])[r]||{}).rh||28;
  const tDeb=E.length?g(E[0],'t'):0;
  for(let a=0;a+FEN*10<=E.length;a+=FEN*10){
    const W=E.slice(a,a+FEN*10),t0=g(W[0],'t'),t1=g(W[W.length-1],'t'),dur=Math.max(1e-6,(t1-t0)*W.length/Math.max(1,W.length-1));
    if(tLim!=null&&t1-tDeb>tLim)break;
    const sol=W.filter(e=>g(e,'m')===0);if(sol.length<20)continue;
    const lat=sol.map(e=>g(e,'lat')/rh(g(e,'r'))),moy=x=>x.reduce((s,v)=>s+v,0)/Math.max(1,x.length),et=x=>{const m=moy(x);return Math.sqrt(moy(x.map(v=>(v-m)*(v-m))));};
    const vl=[],al=[];let vPrec=null,sens=0,bascules=0;
    for(let i=1;i<W.length;i++){const p=W[i-1],q=W[i],dt=g(q,'t')-g(p,'t');if(g(p,'m')!==0||g(q,'m')!==0||g(p,'r')!==g(q,'r')||!(dt>0&&dt<.25)){vPrec=null;continue;}
      const v=(g(q,'lat')-g(p,'lat'))/dt,vs=Math.max(V_MIN,(g(q,'kmh')||0)/3.6);vl.push(v/vs);if(vPrec!=null)al.push((v-vPrec)/dt/vs);vPrec=v;
      const s=v>1.5?1:v<-1.5?-1:0;if(s&&sens&&s!==sens)bascules++;if(s)sens=s;}
    const kmh=W.map(e=>g(e,'kmh')),air=W.filter(e=>g(e,'m')===1||g(e,'m')===2).length/W.length;
    const evW=ev.filter(e=>e[0]>=t0&&e[0]<=t1),poses=evW.filter(e=>e[1]==='pose');
    let nit=0,bn=0;for(let i=0;i<W.length;i++){const n=g(W[i],'nit')?1:0;nit+=n;if(i&&n!==(g(W[i-1],'nit')?1:0))bn++;}
    F.push([moy(lat.map(Math.abs)),et(lat),et(vl),bascules/dur,et(kmh)/Math.max(1,moy(kmh)),air,evW.filter(e=>e[1]==='decol').length*10/dur,
      poses.length?moy(poses.map(e=>e[5])):0,poses.length?Math.max(...poses.map(e=>e[6]||0)):0,nit/W.length,bn*10/dur,
      sol.filter(e=>g(e,'drift')).length/sol.length,evW.filter(e=>e[1]==='fig').length*10/dur,evW.filter(e=>e[1]==='piece').reduce((s,e)=>s+(e[2]|0),0)/dur,
      lat.filter(v=>Math.abs(v)>.8).length/lat.length,et(al)]);}
  return F;}
function apprend(X,y){
  const n=X.length,d=X[0].length,mu=new Array(d).fill(0),sg=new Array(d).fill(0);
  for(const x of X)for(let j=0;j<d;j++)mu[j]+=x[j]/n;for(const x of X)for(let j=0;j<d;j++)sg[j]+=(x[j]-mu[j])*(x[j]-mu[j])/n;
  for(let j=0;j<d;j++)sg[j]=Math.sqrt(sg[j])||1;
  const Z=X.map(x=>x.map((v,j)=>(v-mu[j])/sg[j])),w=new Array(d).fill(0);let b=0;
  const pos=y.reduce((s,v)=>s+v,0),p1=n/(2*Math.max(1,pos)),p0=n/(2*Math.max(1,n-pos));
  for(let it=0;it<400;it++){const gw=new Array(d).fill(0);let gb=0;
    for(let i=0;i<n;i++){let z=b;for(let j=0;j<d;j++)z+=w[j]*Z[i][j];const e=(1/(1+Math.exp(-z))-y[i])*(y[i]?p1:p0);gb+=e;for(let j=0;j<d;j++)gw[j]+=e*Z[i][j];}
    for(let j=0;j<d;j++)w[j]-=.3*(gw[j]/n+.02*w[j]);b-=.3*gb/n;}
  return x=>{let z=b;for(let j=0;j<d;j++)z+=w[j]*(x[j]-mu[j])/sg[j];return 1/(1+Math.exp(-z));};}
function auc(S){const P=S.filter(s=>s[1]===1).map(s=>s[0]),N=S.filter(s=>s[1]===0).map(s=>s[0]);if(!P.length||!N.length)return null;
  let k=0;for(const p of P)for(const q of N)k+=p>q?1:p===q?.5:0;return k/(P.length*N.length);}
function juge(G){const S=[];
  for(let k=0;k<G.length;k++){const X=[],y=[];G.forEach((g,i)=>{if(i!==k)for(const f of g.F){X.push(f);y.push(g.y);}});
    if(!y.some(v=>v===1)||!y.some(v=>v===0))continue;const f=apprend(X,y);for(const x of G[k].F)S.push([f(x),G[k].y]);}
  return auc(S);}
function generateur(a9){return ()=>{a9|=0;a9=a9+0x6D2B79F5|0;let t=Math.imul(a9^a9>>>15,1|a9);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

const PJ=partiesJoueurs(fichiersDe(path.join(BOT_ML,'etalon')).map(f=>({nom:path.basename(f),j:lis(f)})));
const HUM=[];for(const c of PJ.parties){const E=c.ech,i=(c.cols||[]).indexOf('doigt'),clavier=i>=0?!E.some(e=>e[i]):null;
  if(QUI==='clavier'&&!clavier)continue;if(QUI==='doigt'&&clavier)continue;HUM.push({c:c});}
const sources=A.filter((a,i)=>!a.startsWith('--')&&!(i&&A[i-1].startsWith('--')));
const BOT=[];for(const s of sources)for(const f of fichiersDe(s))for(const c of partiesDuFichier(f))if(c&&c.ech&&c.fin&&finVraie(c).fin.t>=10)BOT.push({c:c,f:path.basename(f)});
const GH=HUM.map(h=>({y:1,F:fenetres(h.c,THUM)})).filter(g=>g.F.length),GB=BOT.map(b=>({y:0,F:fenetres(b.c,TBOT),f:b.f})).filter(g=>g.F.length);
const nH=GH.reduce((s,g)=>s+g.F.length,0),nB=GB.reduce((s,g)=>s+g.F.length,0);
const r3=x=>x==null?null:+x.toFixed(3);
const sortieJ={date:new Date().toISOString(),fenetre_s:FEN,thum:THUM,tbot:TBOT,humains:{qui:QUI,parties:GH.length,fenetres:nH,etalon:PJ.parties.length,recollees:PJ.recollees,doublons:PJ.doublons,
  fenetresParPartie:GH.map(g=>g.F.length)},bot:{sources:sources.map(s=>path.basename(s)),parties:GB.length,fenetres:nB}};
console.log(`humains (${QUI}) : ${GH.length} parties, ${nH} fenetres de ${FEN} s${THUM!=null?' (seulement celles finies avant '+THUM+' s)':''} · bot : ${GB.length} parties, ${nB} fenetres`);

/* le temoin humains contre humains (sans bot) */
if(HH>0){const rnd=generateur(20261128),V=[];
  for(let k=0;k<HH;k++){const idx=GH.map((g,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=idx[i];idx[i]=idx[j];idx[j]=x;}
    const un=new Set(idx.slice(0,Math.floor(idx.length/2)));const a=juge(GH.map((g,i)=>({y:un.has(i)?1:0,F:g.F})));if(a!=null)V.push(a);}
  V.sort((a,b)=>a-b);const m=V.reduce((s,v)=>s+v,0)/V.length,sd=Math.sqrt(V.reduce((s,v)=>s+(v-m)*(v-m),0)/V.length),q=p=>V[Math.min(V.length-1,Math.floor(p*V.length))];
  const ecarts=V.map(v=>Math.abs(v-.5)).sort((a,b)=>a-b);
  sortieJ.humhum={partages:V.length,moyenne:r3(m),ecart_type:r3(sd),q05:r3(q(.05)),q50:r3(q(.5)),q95:r3(q(.95)),max:r3(V[V.length-1]),ecart95:r3(ecarts[Math.min(ecarts.length-1,Math.floor(ecarts.length*.95))])};
  console.log(`TEMOIN HUMAINS CONTRE HUMAINS (${V.length} partages en deux moities) : AUC moyenne ${r3(m)}, ecart-type ${r3(sd)}, q05 ${r3(q(.05))}, q50 ${r3(q(.5))}, q95 ${r3(q(.95))}, max ${r3(V[V.length-1])} ; 95 % a moins de ${sortieJ.humhum.ecart95} de 0,50`);}

if(GB.length>=2&&GH.length>=2){
  const A1=juge(GH.concat(GB));
  const tem=[];{const rnd=generateur(20261124);const tous=GH.concat(GB),nb1=GH.length;
    for(let k=0;k<30;k++){const idx=tous.map((g,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=idx[i];idx[i]=idx[j];idx[j]=x;}
      const un=new Set(idx.slice(0,nb1));const a=juge(tous.map((g,i)=>({y:un.has(i)?1:0,F:g.F})));if(a!=null)tem.push(a);}}
  const ecarts=tem.map(v=>Math.abs(v-.5)).sort((a,b)=>a-b);
  const temMoy=tem.length?tem.reduce((s,v)=>s+v,0)/tem.length:null,temEc=ecarts.length?ecarts[Math.min(ecarts.length-1,Math.floor(ecarts.length*.95))]:null;
  const moyDe=(G,j)=>{let s=0,n=0;for(const g of G)for(const f of g.F){s+=f[j];n++;}return s/Math.max(1,n);};
  const parPartie=(g,j)=>g.F.reduce((s,f)=>s+f[j],0)/g.F.length;
  const seules=NOMS.map((nom,j)=>{const S=[];for(const g of GH)for(const f of g.F)S.push([f[j],1]);for(const g of GB)for(const f of g.F)S.push([f[j],0]);const a=auc(S);
    const H=GH.map(g=>parPartie(g,j)),mh=H.reduce((s,v)=>s+v,0)/H.length,sh=Math.sqrt(H.reduce((s,v)=>s+(v-mh)*(v-mh),0)/H.length)||1e-9;
    const B=GB.map(g=>parPartie(g,j)),mb=B.reduce((s,v)=>s+v,0)/B.length;
    return {mesure:nom,auc:+a.toFixed(3),ecart:+Math.abs(a-.5).toFixed(3),z:+((mb-mh)/sh).toFixed(2),humains:+moyDe(GH,j).toFixed(3),bot:+moyDe(GB,j).toFixed(3)};}).sort((a,b)=>Math.abs(b.z)-Math.abs(a.z));
  /* (en plus) l'AUC de chaque mesure seule, triee par ecart a 0,50 : « la plus bavarde » au sens de l'AUC */
  const parAuc=seules.slice().sort((a,b)=>b.ecart-a.ecart).map(s=>s.mesure);
  Object.assign(sortieJ,{auc:r3(A1),temoin:{auc:tem.map(r3),moyenne:r3(temMoy),ecart_max:r3(temEc)},mesures:seules,ordreParAuc:parAuc});
  console.log(`LE JUGE : AUC ${r3(A1)}`);
  console.log(`le temoin (etiquettes melangees, ${tem.length} fois) : AUC ${r3(temMoy)} en moyenne ; 95 % des melanges restent a moins de ${r3(temEc)} de 0,50`);
  for(const s of seules)console.log(`  z ${String(s.z).padStart(6)} · AUC ${String(s.auc).padEnd(5)} ${s.mesure.padEnd(52)} humains ${String(s.humains).padStart(7)} · bot ${String(s.bot).padStart(7)}`);
}
const sortie=opt('sortie',null);
if(sortie){fs.mkdirSync(path.dirname(path.resolve(sortie)),{recursive:true});fs.writeFileSync(sortie,JSON.stringify(sortieJ,null,1));console.log('ecrit : '+sortie);}
