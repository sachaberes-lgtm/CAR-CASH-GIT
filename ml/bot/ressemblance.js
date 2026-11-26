#!/usr/bin/env node
/* ===== LA RESSEMBLANCE : A QUELLE DISTANCE DES JOUEURS UN BOT JOUE-T-IL ? (2026-11-26, Sacha : « objectif : on ne peut pas du tout faire la
   difference entre un bot et un vrai joueur » ; l'enquete ml/ecurie/etude/realisme.md : « la boucle note sur le palier median : presque toutes
   les corrections coutent du palier au debut ; il faudra noter palier ET ressemblance, sinon elle refusera chaque pas vers un vrai joueur ») =====
   discerner.js dit si un juge SEPARE le bot des joueurs (une AUC : 0,97 pour tous les pilotes a ce jour — elle ne bouge pas tant que tout n'est pas
   bon). Ici, un nombre qui BOUGE a chaque pas : l'ECART, la distance moyenne aux joueurs sur quinze mesures de ce qui se voit d'une partie.
   usage : node ressemblance.js <note faite avec --parties> [--nom x] [--humains clavier|doigt|tous] [--json f]
           node ressemblance.js                       les joueurs contre eux-memes (chaque partie contre les autres : ce que vaut « zero »)
   LA METHODE
     1. chaque partie de plus de 60 s donne quinze mesures (MESURES plus bas) : des parts de temps, des taux par minute, des medianes ;
     2. les parties des joueurs (ml/bot/etalon/, comptees par partiesJoueurs comme partout) donnent pour chaque mesure une moyenne et un ecart-type
        D'UNE PARTIE A L'AUTRE (jamais moins de 15 % de la moyenne : huit parties d'un seul joueur donnent des ecarts-types trop serres) ;
     3. le bot : la moyenne de ses parties, mesure par mesure, puis z = (bot − joueurs) / ecart-type ;
     4. L'ECART = la moyenne des |z|, chacun borne a 4. 0 = au milieu des joueurs partout ; 1 = a un ecart-type en moyenne ; les joueurs entre eux
        (une partie contre les autres) : voir « node ressemblance.js » tout court.
   CE QUE CA NE DIT PAS : dix parties de deux joueurs ; un ecart nul ne prouve pas « indiscernable » (le juge discerner.js et un vrai spectateur
   restent les juges), il dit seulement dans quel sens va un changement. Les mesures viennent de l'enquete (§ 3 : celles que le juge ne regardait pas).
   `ecart(parties, {humains})` et `mesuresPartie` sont exportes : la boucle (ml/ecurie/boucle.js, --critere mixte) note avec. */
const fs=require('fs'),path=require('path');
const {partiesJoueurs,partiesDe,finVraie}=require('./mesures'),{volsDe}=require('./voltige');
const MIN_S=60,BORNE=4,PLANCHER=.15;
const med=A=>{A=A.filter(x=>x!=null&&x===x).slice().sort((a,b)=>a-b);const n=A.length;return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):null;};
const moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:null;

/* LES MESURES D'UNE PARTIE (null = pas mesurable sur cette partie : elle ne compte pas pour cette mesure) */
const MESURES=[
  ['nitro','nitro allumee (part du temps)'],['nitroSol','nitro allumee au sol (part du sol)'],['nitroDecol','nitro allumee au decollage (part des vols)'],
  ['air','en l\'air (part du temps)'],['vols','vols par minute'],['volDuree','duree mediane d\'un vol (s)'],['volHaut','hauteur mediane d\'un vol pose (m)'],
  ['volsCourts','vols de moins de 0,7 s (part des vols)'],['raccourcis','raccourcis par minute'],['figures','figures lancees par minute'],
  ['poseCentre','poses pres de l\'axe (part des poses)'],['dessous','sous la dalle (part du sol)'],['aller','duree mediane d\'un aller du slalom (s)'],
  ['ondulation','ondulation (vitesse laterale / vitesse au sol)'],['vitesse','vitesse moyenne des deux premieres minutes (km/h)']];
function mesuresPartie(c){
  c=finVraie(c);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const E=c.ech||[],g=(e,n)=>e[col[n]];
  const duree=(c.fin&&c.fin.t)||(E.length?g(E[E.length-1],'t'):0);
  if(!(duree>=MIN_S)||E.length<100)return null;
  const min=duree/60,sol=E.filter(e=>g(e,'m')===0),V=volsDe(c),poses=V.filter(v=>!v.mort),rh=r=>((c.routes||[])[r]||{}).rh||28;
  /* le slalom : la vitesse laterale entre deux echantillons au sol qui se suivent ; un « aller » = le temps entre deux changements de sens */
  const vl=[],allers=[];let sens=0,tSens=null;
  for(let i=1;i<E.length;i++){const p=E[i-1],q=E[i],dt=g(q,'t')-g(p,'t');
    if(g(p,'m')!==0||g(q,'m')!==0||g(p,'r')!==g(q,'r')||!(dt>0&&dt<.25)){sens=0;tSens=null;continue;}
    const v=(g(q,'lat')-g(p,'lat'))/dt;vl.push(v/Math.max(10,(g(q,'kmh')||0)/3.6));
    const s=v>1.5?1:v<-1.5?-1:0;if(s&&sens&&s!==sens){if(tSens!=null)allers.push(g(q,'t')-tSens);tSens=g(q,'t');}if(s){if(!sens)tSens=g(q,'t');sens=s;}}
  const mv=moy(vl)||0,ondul=vl.length>30?Math.sqrt(moy(vl.map(x=>(x-mv)*(x-mv)))):null;
  /* la nitro au decollage : l'echantillon le plus proche de chaque decollage (a moins de 0,2 s) */
  let nd=0,nv=0;for(const v of V){let b=null,bd=.2;for(const e of E){const d=Math.abs(g(e,'t')-v.t);if(d<bd){bd=d;b=e;}else if(g(e,'t')>v.t+.2)break;}if(b){nv++;if(g(b,'nit'))nd++;}}
  const debut=E.filter(e=>g(e,'t')<=120&&g(e,'m')===0);
  return {
    nitro:E.filter(e=>g(e,'nit')).length/E.length,nitroSol:sol.length?sol.filter(e=>g(e,'nit')).length/sol.length:null,nitroDecol:nv>=3?nd/nv:null,
    air:E.filter(e=>g(e,'m')===1||g(e,'m')===2).length/E.length,vols:V.length/min,volDuree:V.length>=3?med(V.map(v=>v.duree)):null,
    volHaut:poses.length>=3?med(poses.map(v=>v.hMax)):null,volsCourts:V.length>=3?V.filter(v=>v.duree<.7).length/V.length:null,
    raccourcis:poses.filter(v=>v.gain>=60).length/min,figures:V.reduce((a,v)=>a+v.figs.length,0)/min,
    poseCentre:poses.length>=3?poses.filter(v=>Math.abs(v.lat1)<.3*rh(v.r)).length/poses.length:null,
    dessous:sol.length&&col.dessous!=null?sol.filter(e=>g(e,'dessous')).length/sol.length:null,
    aller:allers.length>=10?med(allers):null,ondulation:ondul,vitesse:debut.length>=100?moy(debut.map(e=>g(e,'kmh')||0)):null};}

/* les joueurs de l'etalon, lus une fois */
let ETALON=null;
function joueurs(quels){
  quels=quels||'clavier';ETALON=ETALON||{};if(ETALON[quels])return ETALON[quels];
  const D=path.join(__dirname,'etalon'),lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
  const P=partiesJoueurs(lus).parties.filter(c=>{const k=(c.cols||[]).indexOf('doigt'),doigt=k>=0&&c.ech.some(e=>e[k]);return quels==='tous'||(quels==='doigt')===doigt;});
  return (ETALON[quels]=P.map(mesuresPartie).filter(Boolean));}
/* la reference : pour chaque mesure, la moyenne et l'ecart-type d'une partie a l'autre (plancher : 15 % de la moyenne, 0,02 au moins) */
function reference(M){
  const R={};for(const [k] of MESURES){const A=M.map(m=>m[k]).filter(x=>x!=null&&x===x);if(A.length<3){R[k]=null;continue;}
    const m=moy(A),s=Math.sqrt(moy(A.map(x=>(x-m)*(x-m))));R[k]={m:m,s:Math.max(s,PLANCHER*Math.abs(m),.02),n:A.length};}
  return R;}
/* L'ECART d'un lot de parties aux joueurs : { ecart, mesures:[{cle, nom, bot, joueurs, sigma, z}], parties } — null si aucune partie de plus de 60 s */
function ecart(parties,o){
  o=o||{};const M=(o.mesures||parties.map(mesuresPartie)).filter(Boolean);if(!M.length)return null;
  const R=o.reference||reference(joueurs(o.humains)),L=[];
  for(const [k,nom] of MESURES){if(!R[k])continue;const A=M.map(m=>m[k]).filter(x=>x!=null&&x===x);if(!A.length)continue;
    const b=moy(A),z=(b-R[k].m)/R[k].s;L.push({cle:k,nom:nom,bot:+b.toFixed(3),joueurs:+R[k].m.toFixed(3),sigma:+R[k].s.toFixed(3),z:+z.toFixed(2)});}
  if(!L.length)return null;
  return {ecart:+moy(L.map(x=>Math.min(BORNE,Math.abs(x.z)))).toFixed(3),mesures:L.sort((a,b)=>Math.abs(b.z)-Math.abs(a.z)),parties:M.length};}
function lignes(E,nom){
  return [`${nom} : ECART AUX JOUEURS ${E.ecart} (0 = au milieu des joueurs partout ; ${E.parties} parties de plus de ${MIN_S} s)`]
    .concat(E.mesures.map(x=>`  z ${(x.z>=0?'+':'')+x.z.toFixed(2).padStart(5)} · ${x.nom.padEnd(52)} bot ${String(x.bot).padStart(8)} · joueurs ${String(x.joueurs).padStart(8)} (± ${x.sigma})`));}

if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  const f=A.find((x,i)=>!x.startsWith('--')&&(i===0||!['--nom','--humains','--json'].includes(A[i-1]))),quels=opt('humains','clavier');
  if(f){const j=JSON.parse(fs.readFileSync(f,'utf8')),P=j.parties?j.parties.map(p=>p.partie||p):partiesDe(j);
    if(!P.length||!P[0].ev){console.log('pas de parties dans ce fichier : il faut une note faite avec --parties');process.exit(1);}
    const E=ecart(P,{humains:quels});if(!E){console.log('aucune partie de plus de '+MIN_S+' s');process.exit(1);}
    console.log(lignes(E,opt('nom',path.basename(f,'.json'))).join('\n'));if(opt('json',null))fs.writeFileSync(opt('json'),JSON.stringify(E,null,1));}
  else{ /* les joueurs entre eux : chaque partie contre la reference faite des AUTRES */
    const M=joueurs(quels),Z=[];
    for(let i=0;i<M.length;i++){const E=ecart(null,{mesures:[M[i]],reference:reference(M.filter((x,j)=>j!==i))});if(E)Z.push(E.ecart);}
    console.log(`les joueurs (${quels}) entre eux : ${M.length} parties de plus de ${MIN_S} s · l'ecart d'UNE partie aux autres : ${Z.map(x=>x.toFixed(2)).join(' ')} · median ${med(Z).toFixed(2)}`);
    console.log('(une partie seule s\'ecarte plus qu\'un lot : la moyenne de 20 parties d\'un bot se compare a la moyenne des joueurs, dont l\'ecart vaut 0)');
    const R=reference(M);for(const [k,nom] of MESURES)if(R[k])console.log(`  ${nom.padEnd(52)} ${R[k].m.toFixed(3).padStart(8)} ± ${R[k].s.toFixed(3)} (${R[k].n} parties)`);}
}
module.exports={ecart,mesuresPartie,reference,joueurs,lignes,MESURES};
