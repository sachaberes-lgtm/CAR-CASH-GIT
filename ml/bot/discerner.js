#!/usr/bin/env node
/* ===== DISCERNER : UN BOT SE DISTINGUE-T-IL D'UN VRAI JOUEUR ? (2026-11-24, Sacha : « qu'on ne puisse pas faire la difference entre eux et
   des vrais joueurs ») =====
   Un juge automatique, entraine a separer les parties des JOUEURS (ml/bot/etalon/) de celles d'un BOT, sur ce qui se VOIT d'une course :
   la trajectoire, la vitesse, les vols, la nitro — pas les touches (un adversaire ne les voit pas).
   usage : node discerner.js <parties-du-bot.json | .json.gz | dossier> … [--fenetre 10] [--humains clavier|doigt|tous] [--nom x] [--sortie f.json]
     les parties du bot : une note de noter.js faite avec --parties, un tampon du labo (tampon/<id>.json.gz), une trajectoire gardee,
     ou un dossier de ces fichiers. Par defaut les humains « clavier » (le bot joue au clavier).
   CE QU'IL FAIT
     1. coupe chaque partie en FENETRES de 10 s et mesure chacune (voir MESURES plus bas) ;
     2. entraine une regression logistique (humain = 1, bot = 0) en laissant UNE PARTIE ENTIERE de cote a chaque tour (jamais deux fenetres de
        la meme partie des deux cotes) et note l'AUC : 0,50 = le juge tire a pile ou face (indiscernable), 1,00 = il ne se trompe jamais ;
     3. donne le TEMOIN : le meme juge, humains contre humains (une partie sur deux) — ce que vaut 0,50 avec si peu de parties ;
     4. dit CE QUI TRAHIT le bot : l'AUC de chaque mesure prise seule, la plus bavarde d'abord, avec la valeur humaine et la valeur du bot.
   LIMITE, a dire a chaque fois : 14 parties de 2 joueurs. Le juge apprend « Sacha et Leo », pas « un humain ».
   (2026-11-24, defaut 28 : « le juge ne compte pas les parties comme l'etalon ») LES PARTIES DES JOUEURS sont celles d'etalon.js, comptees par
   la MEME fonction (partiesJoueurs de mesures.js) : doublons ecartes, seconde chance recollee, fin a la mort et a la pause, moins de 10 s
   ecartees. Avant : 11 parties « clavier » ici contre 10 a l'etalon (une reprise comptee comme une partie). Une partie du bot aussi s'arrete
   a sa mort (finVraie) : l'explosion n'entre dans aucune fenetre.
   CE QUE VAUT LE VERDICT : il depend de l'echantillon du bot. Les 4 courses de ml/labo/trajectoires sont les courses EXTREMES qu'a gardees
   clore.js (la meilleure, la plus courte, le plus long vol…) : un verdict sur elles n'est pas celui du bot ordinaire. Pour juger un bot :
   une note complete, node noter.js <cerveau> --parties --graines 20, puis node discerner.js results/note-<…>.json. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const {partiesDe,partiesJoueurs,finVraie}=require('./mesures');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const FEN=+opt('fenetre',10),QUI=opt('humains','clavier');

/* ----- lire des parties, d'ou qu'elles viennent ----- */
function lis(f){const b=fs.readFileSync(f);return JSON.parse(/\.gz$/i.test(f)?zlib.gunzipSync(b).toString('utf8'):b.toString('utf8'));}
function partiesDuFichier(f){
  const j=lis(f);
  if(j&&Array.isArray(j.courses)&&j.courses[0]&&j.courses[0].partie)return j.courses.map(c=>c.partie);          /* un tampon du labo */
  if(j&&Array.isArray(j.parties)&&j.parties[0]&&j.parties[0].partie)return j.parties.map(c=>c.partie);          /* une note de noter.js --parties */
  return partiesDe(j);}
function fichiersDe(a){if(!fs.existsSync(a))return [];if(fs.statSync(a).isDirectory())return fs.readdirSync(a).filter(f=>/\.json(\.gz)?$/i.test(f)&&!/toutes/.test(f)).sort().map(f=>path.join(a,f));return [a];}

/* ----- LES MESURES D'UNE FENETRE : ce qu'un spectateur voit. Rien d'absolu qui depende du palier (la vitesse monte avec le moteur) : des rapports. ----- */
const NOMS=['ecart au milieu (part de la demi-route)','ecart-type de l\'ecart','ondulation (ecart-type de la vitesse laterale, m/s)','changements de cote par seconde',
  'vitesse : ecart-type / moyenne','part du temps en l\'air','decollages par 10 s','vol moyen (s)','hauteur max (m)','part du temps nitro','bascules de nitro par 10 s',
  'part du temps en drift','figures par 10 s','pieces par seconde','part du temps pres du bord (> 80 %)','acceleration laterale (ecart-type, m/s2)'];
function fenetres(c){
  c=finVraie(c);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const E=c.ech||[],ev=c.ev||[],g=(e,n)=>e[col[n]],F=[];
  if(E.length<FEN*10)return F;
  const rh=r=>((c.routes||[])[r]||{}).rh||28;
  for(let a=0;a+FEN*10<=E.length;a+=FEN*10){
    const W=E.slice(a,a+FEN*10),t0=g(W[0],'t'),t1=g(W[W.length-1],'t'),dt=.1;
    const sol=W.filter(e=>g(e,'m')===0);if(sol.length<20)continue;                      /* une fenetre presque toute en vol ou en explosion : pas de conduite a lire */
    const lat=sol.map(e=>g(e,'lat')/rh(g(e,'r'))),moy=x=>x.reduce((s,v)=>s+v,0)/Math.max(1,x.length),et=x=>{const m=moy(x);return Math.sqrt(moy(x.map(v=>(v-m)*(v-m))));};
    /* la vitesse laterale et son acceleration : seulement entre deux echantillons au sol qui se suivent sur la meme route */
    const vl=[],al=[];let vPrec=null,sens=0,bascules=0;
    for(let i=1;i<W.length;i++){const p=W[i-1],q=W[i];if(g(p,'m')!==0||g(q,'m')!==0||g(p,'r')!==g(q,'r')){vPrec=null;continue;}
      const v=(g(q,'lat')-g(p,'lat'))/dt;vl.push(v);if(vPrec!=null)al.push((v-vPrec)/dt);vPrec=v;
      const s=v>1.5?1:v<-1.5?-1:0;if(s&&sens&&s!==sens)bascules++;if(s)sens=s;}
    const kmh=W.map(e=>g(e,'kmh')),air=W.filter(e=>g(e,'m')===1||g(e,'m')===2).length/W.length;
    const evW=ev.filter(e=>e[0]>=t0&&e[0]<=t1),poses=evW.filter(e=>e[1]==='pose');
    let nit=0,bn=0;for(let i=0;i<W.length;i++){const n=g(W[i],'nit')?1:0;nit+=n;if(i&&n!==(g(W[i-1],'nit')?1:0))bn++;}
    F.push([moy(lat.map(Math.abs)),et(lat),et(vl),bascules/FEN,et(kmh)/Math.max(1,moy(kmh)),air,evW.filter(e=>e[1]==='decol').length*10/FEN,
      poses.length?moy(poses.map(e=>e[5])):0,poses.length?Math.max(...poses.map(e=>e[6]||0)):0,nit/W.length,bn*10/FEN,
      sol.filter(e=>g(e,'drift')).length/sol.length,evW.filter(e=>e[1]==='fig').length*10/FEN,evW.filter(e=>e[1]==='piece').reduce((s,e)=>s+(e[2]|0),0)/FEN,
      lat.filter(v=>Math.abs(v)>.8).length/lat.length,et(al)]);}
  return F;}

/* ----- le juge : regression logistique, mesures centrees et reduites sur l'entrainement seulement ----- */
function apprend(X,y){
  const n=X.length,d=X[0].length,mu=new Array(d).fill(0),sg=new Array(d).fill(0);
  for(const x of X)for(let j=0;j<d;j++)mu[j]+=x[j]/n;for(const x of X)for(let j=0;j<d;j++)sg[j]+=(x[j]-mu[j])*(x[j]-mu[j])/n;
  for(let j=0;j<d;j++)sg[j]=Math.sqrt(sg[j])||1;
  const Z=X.map(x=>x.map((v,j)=>(v-mu[j])/sg[j])),w=new Array(d).fill(0);let b=0;
  const pos=y.reduce((s,v)=>s+v,0),p1=n/(2*Math.max(1,pos)),p0=n/(2*Math.max(1,n-pos));                 /* les deux camps pesent autant */
  for(let it=0;it<400;it++){const gw=new Array(d).fill(0);let gb=0;
    for(let i=0;i<n;i++){let z=b;for(let j=0;j<d;j++)z+=w[j]*Z[i][j];const e=(1/(1+Math.exp(-z))-y[i])*(y[i]?p1:p0);gb+=e;for(let j=0;j<d;j++)gw[j]+=e*Z[i][j];}
    for(let j=0;j<d;j++)w[j]-=.3*(gw[j]/n+.02*w[j]);b-=.3*gb/n;}
  return x=>{let z=b;for(let j=0;j<d;j++)z+=w[j]*(x[j]-mu[j])/sg[j];return 1/(1+Math.exp(-z));};}
function auc(S){ /* S : [score, etiquette] — la part des couples (humain, bot) ou l'humain a le plus gros score */
  const P=S.filter(s=>s[1]===1).map(s=>s[0]),N=S.filter(s=>s[1]===0).map(s=>s[0]);if(!P.length||!N.length)return null;
  let k=0;for(const p of P)for(const q of N)k+=p>q?1:p===q?.5:0;return k/(P.length*N.length);}
/* une partie entiere de cote a chaque tour */
function juge(G){ /* G : [{y, F:[fenetres]}] */
  const S=[];
  for(let k=0;k<G.length;k++){const X=[],y=[];G.forEach((g,i)=>{if(i!==k)for(const f of g.F){X.push(f);y.push(g.y);}});
    if(!y.some(v=>v===1)||!y.some(v=>v===0))continue;const f=apprend(X,y);for(const x of G[k].F)S.push([f(x),G[k].y]);}
  return auc(S);}

/* ----- les parties ----- */
const PJ=partiesJoueurs(fichiersDe(path.join(__dirname,'etalon')).map(f=>({nom:path.basename(f),j:lis(f)})));
const HUM=[];for(const c of PJ.parties){const E=c.ech,i=(c.cols||[]).indexOf('doigt'),clavier=i>=0?!E.some(e=>e[i]):null;
  if(QUI==='clavier'&&!clavier)continue;if(QUI==='doigt'&&clavier)continue;HUM.push({c:c,clavier:clavier});}
const sources=A.filter((a,i)=>!a.startsWith('--')&&!(i&&A[i-1].startsWith('--')));
const BOT=[];for(const s of sources)for(const f of fichiersDe(s))for(const c of partiesDuFichier(f))if(c&&c.ech&&c.fin&&finVraie(c).fin.t>=10)BOT.push({c:c}); /* le meme seuil que les joueurs */
if(!sources.length||!BOT.length){console.log('usage : node discerner.js <parties-du-bot.json | .json.gz | dossier> [--fenetre 10] [--humains clavier|doigt|tous]\n(aucune partie de bot lue)');process.exit(1);}
const GH=HUM.map(h=>({y:1,F:fenetres(h.c)})).filter(g=>g.F.length),GB=BOT.map(b=>({y:0,F:fenetres(b.c)})).filter(g=>g.F.length);
const nH=GH.reduce((s,g)=>s+g.F.length,0),nB=GB.reduce((s,g)=>s+g.F.length,0);
if(GH.length<2||GB.length<2){console.log(`pas assez de parties : ${GH.length} d'humains, ${GB.length} de bot (il en faut 2 de chaque)`);process.exit(1);}
const A1=juge(GH.concat(GB));
/* LE TEMOIN : le meme juge, les memes parties, mais les etiquettes « humain / bot » MELANGEES entre les parties (30 melanges, toujours les memes :
   un generateur a graine). C'est ce que le juge trouve quand il n'y a RIEN a trouver : le bot est indiscernable si son ecart a 0,50 ne depasse pas
   celui de 95 % des melanges. (Un premier temoin « une partie d'humain sur deux » donnait 0,39 ± 0,24 : trop peu de parties pour s'y fier.) */
const tem=[];{let a9=20261124;const rnd=()=>{a9|=0;a9=a9+0x6D2B79F5|0;let t=Math.imul(a9^a9>>>15,1|a9);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const tous=GH.concat(GB),nb1=GH.length;
  for(let k=0;k<30;k++){const idx=tous.map((g,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=idx[i];idx[i]=idx[j];idx[j]=x;}
    const un=new Set(idx.slice(0,nb1));const a=juge(tous.map((g,i)=>({y:un.has(i)?1:0,F:g.F})));if(a!=null)tem.push(a);}}
const ecarts=tem.map(v=>Math.abs(v-.5)).sort((a,b)=>a-b);
const temMoy=tem.length?tem.reduce((s,v)=>s+v,0)/tem.length:null,temEc=ecarts.length?ecarts[Math.min(ecarts.length-1,Math.floor(ecarts.length*.95))]:null;
/* ce qui trahit : chaque mesure seule */
const moyDe=(G,j)=>{let s=0,n=0;for(const g of G)for(const f of g.F){s+=f[j];n++;}return s/Math.max(1,n);};
/* …et LA DISTANCE AUX JOUEURS, mesure par mesure : de combien d'ecarts-types « d'une partie de joueur a l'autre » le bot est-il loin des joueurs ?
   (z = (moyenne du bot − moyenne des parties humaines) / ecart-type des parties humaines). |z| < 1 : le bot est une partie de joueur ordinaire sur ce point. */
const parPartie=(g,j)=>g.F.reduce((s,f)=>s+f[j],0)/g.F.length;
const seules=NOMS.map((nom,j)=>{const S=[];for(const g of GH)for(const f of g.F)S.push([f[j],1]);for(const g of GB)for(const f of g.F)S.push([f[j],0]);const a=auc(S);
  const H=GH.map(g=>parPartie(g,j)),mh=H.reduce((s,v)=>s+v,0)/H.length,sh=Math.sqrt(H.reduce((s,v)=>s+(v-mh)*(v-mh),0)/H.length)||1e-9;
  const B=GB.map(g=>parPartie(g,j)),mb=B.reduce((s,v)=>s+v,0)/B.length;
  return {mesure:nom,auc:+a.toFixed(3),ecart:+Math.abs(a-.5).toFixed(3),z:+((mb-mh)/sh).toFixed(2),humains:+moyDe(GH,j).toFixed(3),bot:+moyDe(GB,j).toFixed(3)};}).sort((a,b)=>Math.abs(b.z)-Math.abs(a.z));
const r3=x=>x==null?null:+x.toFixed(3);
/* LE VERDICT est severe expres : avec ~10 parties de joueurs, le temoin a etiquettes melangees s'ecarte lui-meme beaucoup de 0,50 (peu de parties =
   un juge peu sur). « Indiscernable » exige donc DEUX choses : un juge proche de pile ou face (ecart ≤ 0,10) ET aucune mesure a plus de 1,5 ecart-type
   des joueurs. Entre les deux : « pas de preuve », ce qui n'est pas une reussite. */
const zMax=Math.max(...seules.map(s=>Math.abs(s.z))),eA=A1==null?1:Math.abs(A1-.5);
const verdict=eA<=.10&&zMax<=1.5?'INDISCERNABLE (juge a pile ou face, aucune mesure hors des joueurs)'
  :eA>.4?'DISCERNABLE A COUP SUR':eA>.25?'DISCERNABLE':(temEc!=null&&eA<=temEc&&zMax<=2.5)?'PAS DE PREUVE (trop peu de parties pour trancher) — pas encore une reussite':'PLUTOT DISCERNABLE';
console.log(`humains (${QUI}) : ${GH.length} parties, ${nH} fenetres de ${FEN} s (l'etalon : ${PJ.parties.length} parties, ${PJ.recollees} reprise(s) recollee(s), ${PJ.doublons} doublon(s)) · bot : ${GB.length} parties, ${nB} fenetres`);
console.log(`LE JUGE : AUC ${r3(A1)} — ${verdict}`);
console.log(`le temoin (etiquettes melangees, ${tem.length} fois) : AUC ${r3(temMoy)} en moyenne ; 95 % des melanges restent a moins de ${r3(temEc)} de 0,50`);
console.log('CE QUI TRAHIT LE BOT (z = distance aux joueurs en ecarts-types d\'une partie a l\'autre ; AUC de la mesure seule : 0,50 = rien) :');
for(const s of seules)console.log(`  z ${String(s.z).padStart(6)} · AUC ${String(s.auc).padEnd(5)} ${s.mesure.padEnd(52)} humains ${String(s.humains).padStart(7)} · bot ${String(s.bot).padStart(7)}`);
console.log('⚠ '+GH.length+' parties de joueurs seulement (2 joueurs en tout) : ce juge connait Sacha et Leo, pas « les humains ».');
if(sources.some(s=>/trajectoires/.test(s)))console.log('⚠ ml/labo/trajectoires = les courses EXTREMES gardees par clore.js, pas un echantillon du bot : pour un verdict, une note complete (noter.js --parties).');
const sortie=opt('sortie',path.join(__dirname,'results','discerner-'+(opt('nom',null)||path.basename(sources[0]).replace(/\.json(\.gz)?$/,''))+'.json'));
fs.mkdirSync(path.dirname(sortie),{recursive:true});
fs.writeFileSync(sortie,JSON.stringify({date:new Date().toISOString(),fenetre_s:FEN,humains:{qui:QUI,parties:GH.length,fenetres:nH,etalon:PJ.parties.length,recollees:PJ.recollees,doublons:PJ.doublons},bot:{sources:sources.map(s=>path.basename(s)),parties:GB.length,fenetres:nB},
  auc:r3(A1),verdict:verdict,temoin:{auc:tem.map(r3),moyenne:r3(temMoy),ecart_max:r3(temEc)},mesures:seules},null,1));
console.log('ecrit : '+path.relative(process.cwd(),sortie));
