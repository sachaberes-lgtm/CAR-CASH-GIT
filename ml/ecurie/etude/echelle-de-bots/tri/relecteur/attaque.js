#!/usr/bin/env node
/* ===== LE RELECTEUR DU TEST B ATTAQUE LE JUGE (28/11/2026, etude « l'echelle de bots », le relecteur adverse du test B) =====
   Aucune course n'est jouee : ce script relit les parties deja ecrites. Il recopie le juge de ../juger.js (lui-meme recopie de ml/bot/discerner.js :
   memes 16 mesures, meme regression, meme « une partie entiere de cote ») et le fait tourner sous d'autres reglages :
     1. la grille : fenetres de 5, 10 et 20 s ; humains « clavier » (Sacha, 10 parties) ou « tous » (Sacha + Leo, 14) ; joueurs entiers ou coupes a T s ;
     2. le nombre de parties du bot : 5, 10, 20, toutes, tirees 20 fois au hasard (graine fixe) ;
     3. les temoins : etiquettes melangees a la taille du test (10 contre 40) ; Sacha contre Leo (un AUTRE joueur, un autre appareil, une autre version
        pour 4 parties sur 4) ; le bot contre lui-meme (deux lots de pilotes c0025, meme jeu) ;
   usage : node ml/ecurie/etude/echelle-de-bots/tri/relecteur/attaque.js <dossier ou note du bot> [--T 109.5] [--nom x]
   Ecrit seulement dans tri/relecteur/. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const BOT_ML=path.join(__dirname,'..','..','..','..','..','bot');
const {partiesDe,partiesJoueurs,finVraie}=require(path.join(BOT_ML,'mesures'));
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const T=+opt('T',109.5),NOM=opt('nom','test-b'),SOURCE=A.find((a,i)=>!a.startsWith('--')&&!(i&&A[i-1].startsWith('--')));
const AUTRE=opt('autre',null);
function lis(f){const b=fs.readFileSync(f);return JSON.parse(/\.gz$/i.test(f)?zlib.gunzipSync(b).toString('utf8'):b.toString('utf8'));}
function partiesDuFichier(f){const j=lis(f);
  if(j&&Array.isArray(j.parties)&&j.parties[0]&&j.parties[0].partie)return j.parties.map(c=>c.partie);
  if(j&&j.partie&&j.partie.ech)return [j.partie];return partiesDe(j);}
function fichiersDe(a){if(!fs.existsSync(a))return [];if(fs.statSync(a).isDirectory())return fs.readdirSync(a).filter(f=>/\.json(\.gz)?$/i.test(f)&&!/toutes/.test(f)).sort().map(f=>path.join(a,f));return [a];}
const V_MIN=10;
/* recopie de fenetres() de ../juger.js, la longueur de fenetre en parametre */
function fenetres(c,FEN,tLim){
  c=finVraie(c);const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const E=c.ech||[],ev=c.ev||[],g=(e,n)=>e[col[n]],F=[];
  if(E.length<FEN*10)return F;const rh=r=>((c.routes||[])[r]||{}).rh||28;const tDeb=E.length?g(E[0],'t'):0;
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
/* (en plus) l'AUC PAR PARTIE : la moyenne des scores d'une partie, une valeur par partie (l'effectif vrai, pas les fenetres) */
function jugeParPartie(G){const S=[];
  for(let k=0;k<G.length;k++){const X=[],y=[];G.forEach((g,i)=>{if(i!==k)for(const f of g.F){X.push(f);y.push(g.y);}});
    if(!y.some(v=>v===1)||!y.some(v=>v===0))continue;const f=apprend(X,y);const s=G[k].F.map(f);S.push([s.reduce((a,b)=>a+b,0)/s.length,G[k].y]);}
  return auc(S);}
function generateur(a9){return ()=>{a9|=0;a9=a9+0x6D2B79F5|0;let t=Math.imul(a9^a9>>>15,1|a9);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function melange(n,rnd){const idx=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=idx[i];idx[i]=idx[j];idx[j]=x;}return idx;}
const r3=x=>x==null?null:+x.toFixed(3);
const resume=V=>{V=V.filter(v=>v!=null).sort((a,b)=>a-b);const m=V.reduce((s,v)=>s+v,0)/V.length,q=p=>V[Math.min(V.length-1,Math.floor(p*V.length))];
  return {n:V.length,moyenne:r3(m),q05:r3(q(.05)),q50:r3(q(.5)),q95:r3(q(.95)),min:r3(V[0]),max:r3(V[V.length-1])};};

/* les joueurs */
const PJ=partiesJoueurs(fichiersDe(path.join(BOT_ML,'etalon')).map(f=>({nom:path.basename(f),j:lis(f)})));
const HUM=PJ.parties.map(c=>{const i=(c.cols||[]).indexOf('doigt');return {c,clavier:i>=0?!c.ech.some(e=>e[i]):null,ver:c.ver};});
/* le bot */
const BOT=[];for(const f of fichiersDe(SOURCE))for(const c of partiesDuFichier(f))if(c&&c.ech&&c.fin&&finVraie(c).fin.t>=10)BOT.push(c);
const BOT2=[];if(AUTRE)for(const f of fichiersDe(AUTRE))for(const c of partiesDuFichier(f))if(c&&c.ech&&c.fin&&finVraie(c).fin.t>=10)BOT2.push(c);
const S={date:new Date().toISOString(),source:SOURCE,autre:AUTRE,T,bot:BOT.length,humains:{clavier:HUM.filter(h=>h.clavier).length,tous:HUM.length}};
const log=s=>{console.log(s);};
log(`bot : ${BOT.length} parties (${SOURCE}) ; joueurs : ${HUM.length} (${S.humains.clavier} au clavier) ; T = ${T} s`);

/* 1. la grille */
S.grille=[];
for(const FEN of [5,10,20])for(const qui of ['clavier','tous'])for(const thum of [null,T]){
  const GH=HUM.filter(h=>qui==='tous'||h.clavier).map(h=>({y:1,F:fenetres(h.c,FEN,thum)})).filter(g=>g.F.length);
  const GB=BOT.map(c=>({y:0,F:fenetres(c,FEN,null)})).filter(g=>g.F.length);
  const a=juge(GH.concat(GB)),ap=jugeParPartie(GH.concat(GB));
  const ligne={fenetre:FEN,humains:qui,thum,partiesH:GH.length,fenH:GH.reduce((s,g)=>s+g.F.length,0),partiesB:GB.length,fenB:GB.reduce((s,g)=>s+g.F.length,0),auc:r3(a),aucParPartie:r3(ap)};
  S.grille.push(ligne);log(`grille ${FEN} s ${qui.padEnd(7)} ${thum==null?'entiers':'< '+thum+' s'} : joueurs ${ligne.partiesH}/${ligne.fenH}, bot ${ligne.partiesB}/${ligne.fenB} -> AUC ${ligne.auc} (par partie ${ligne.aucParPartie})`);}

/* 2. le nombre de parties du bot (fenetres de 10 s, clavier, joueurs coupes a T) */
{const GH=HUM.filter(h=>h.clavier).map(h=>({y:1,F:fenetres(h.c,10,T)})).filter(g=>g.F.length),GB=BOT.map(c=>({y:0,F:fenetres(c,10,null)})).filter(g=>g.F.length);
  S.taille=[];const rnd=generateur(20261128);
  for(const n of [5,10,20]){if(n>=GB.length)continue;const V=[];for(let k=0;k<20;k++){const idx=melange(GB.length,rnd).slice(0,n);V.push(juge(GH.concat(idx.map(i=>GB[i]))));}
    const r=resume(V);S.taille.push(Object.assign({partiesBot:n},r));log(`taille : ${n} parties du bot (20 tirages) -> AUC moyenne ${r.moyenne}, q05 ${r.q05}, q95 ${r.q95}`);}
  /* 3a. etiquettes melangees a la taille du test (comme le temoin de discerner.js, 30 fois) */
  const tous=GH.concat(GB),V=[];const rnd2=generateur(20261129);
  for(let k=0;k<30;k++){const idx=melange(tous.length,rnd2),un=new Set(idx.slice(0,GH.length));V.push(juge(tous.map((g,i)=>({y:un.has(i)?1:0,F:g.F}))));}
  S.melange=resume(V);log(`melange (${GH.length} contre ${GB.length}, 30 fois) -> AUC moyenne ${S.melange.moyenne}, q05 ${S.melange.q05}, q95 ${S.melange.q95}, max ${S.melange.max}`);}

/* 3b. Sacha (clavier) contre Leo (doigt) : un autre joueur, un autre appareil */
for(const thum of [null,T]){const GS=HUM.filter(h=>h.clavier).map(h=>({y:1,F:fenetres(h.c,10,thum)})).filter(g=>g.F.length),GL=HUM.filter(h=>!h.clavier).map(h=>({y:0,F:fenetres(h.c,10,thum)})).filter(g=>g.F.length);
  const a=juge(GS.concat(GL));(S.sachaLeo=S.sachaLeo||[]).push({thum,sacha:GS.length,leo:GL.length,auc:r3(a)});log(`Sacha (${GS.length}) contre Leo (${GL.length}) ${thum==null?'entiers':'< '+thum+' s'} -> AUC ${r3(a)}`);}
/* 3c. Sacha a la version 60aa15e contre Sacha a ccdca9b */
{const G=HUM.filter(h=>h.clavier).map(h=>({y:h.ver==='60aa15e'?1:0,F:fenetres(h.c,10,null)})).filter(g=>g.F.length);
  S.sachaVersions={a:G.filter(g=>g.y).length,b:G.filter(g=>!g.y).length,auc:r3(juge(G))};log(`Sacha 60aa15e (${S.sachaVersions.a}) contre Sacha ccdca9b (${S.sachaVersions.b}) -> AUC ${S.sachaVersions.auc}`);}
/* 3d. le bot contre un autre lot du bot */
if(BOT2.length){const G1=BOT.map(c=>({y:1,F:fenetres(c,10,T)})).filter(g=>g.F.length),G2=BOT2.map(c=>({y:0,F:fenetres(c,10,T)})).filter(g=>g.F.length);
  S.botBot={a:G1.length,b:G2.length,auc:r3(juge(G1.concat(G2)))};log(`bot (${G1.length}) contre l'autre lot du bot (${G2.length}), les deux coupes a ${T} s -> AUC ${S.botBot.auc}`);}
const sortie=path.join(__dirname,'attaque-'+NOM+'.json');fs.writeFileSync(sortie,JSON.stringify(S,null,1));log('ecrit : '+path.relative(process.cwd(),sortie));
