/* ===== SACRE : LES PIECES COMMUNES DES SIMULATIONS (2026-11-27, l'etude « sacre ») =====
   1. eRapide : l'ecart E de note.js (eSimple), recode pour aller ~100 fois plus vite (les z arrondis a 2 decimales comme ressemblance.ecart,
      la borne 8, la zone morte 1, les poids 0,5, une mesure absente au pire, moins de 5 parties = 4). verifier.js controle qu'il rend le MEME
      nombre que note.ecartFoule.
   2. comparerRapide : note.comparer recode sur eRapide (meme bootstrap apparie, meme generateur rngDe('comparer|'+n) par defaut, memes criteres
      (a) (b) (c)) ; plus un decalage de E pour simuler un pilote qui ressemble plus ou moins aux joueurs. verifier.js controle l'egalite.
   3. Les reserves de courses : une course simulee = (residu de palier, mesures) d'une VRAIE course, tires ensemble (le lien entre une course
      longue et ses mesures est garde). Le palier simule = vrai niveau du pilote + residu. L'effet de graine est commun aux deux pilotes d'une
      comparaison appariee : il s'annule dans la difference, on ne le tire donc pas (supposition : pas d'interaction pilote x graine en plus du
      residu ; l'etude du bruit la mesure petite : ET de la difference sur graines communes 1,37 contre 1,31 attendu sans interaction).
      Les residus du modele pilote + graine sont rendus a leur taille vraie par sqrt(N/ddl).
      - 'evolution' : les courses d'entrainement de la VRAIE evolution du 27/11 (copie figee, 900 s, vraie config) ;
      - 'bruit'     : les 34 pilotes x 24 graines de l'etude du bruit (courses-0.json, 300 s), tous melanges ;
      - 'gabarit'   : un seul des 34 pilotes (ses 24 courses), tire au hasard a chaque essai. */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..');
const N=require(path.join(RAC,'ml','evolution','note.js'));
const Gr=require(path.join(RAC,'ml','evolution','graines.js'));
const CFG=require(path.join(RAC,'ml','evolution','config.json'));
const REF=N.referenceEpoque();
const CN=CFG.note;
const CLES=Object.keys(REF).filter(k=>REF[k]);
const POIDS=CLES.map(k=>CN.poidsMesures&&CN.poidsMesures[k]!=null?CN.poidsMesures[k]:1);
const RM=CLES.map(k=>REF[k].m),RS=CLES.map(k=>REF[k].s);
const BORNE=CN.borneZ,ZM=CN.zoneMorte,PIRE=CN.ePire,PMIN=CN.partiesMin,PE=CN.poidsEcart;

/* une course -> le vecteur de ses 15 mesures (null si la course n'a pas de mesures, moins de 60 s) */
function vecteur(m){if(!m)return null;return CLES.map(k=>{const x=m[k];return x!=null&&x===x?x:null;});}

/* E d'une liste de vecteurs (les null deja retires), comme note.js eSimple */
function eRapide(V){
  if(V.length<PMIN)return PIRE;
  let s=0,w=0;
  for(let k=0;k<CLES.length;k++){
    let t=0,c=0;for(let i=0;i<V.length;i++){const x=V[i][k];if(x!==null){t+=x;c++;}}
    if(c){const z=+(((t/c)-RM[k])/RS[k]).toFixed(2);s+=POIDS[k]*Math.max(0,Math.min(BORNE,Math.abs(z))-ZM);}
    else s+=POIDS[k]*Math.max(0,BORNE-ZM);
    w+=POIDS[k];}
  return w>0?s/w:PIRE;}

const etype=A=>{const n=A.length;if(n<2)return 0;let m=0;for(const x of A)m+=x;m/=n;let s=0;for(const x of A)s+=(x-m)*(x-m);return Math.sqrt(s/(n-1));};

/* la meme E, plus vite, pour un lot donne par des indices dans un tableau de courses (sans recopier les vecteurs) ; MODE_EXACT = l'arrondi
   toFixed(2) de ressemblance.ecart ; sinon Math.round(z*100)/100, qui n'en differe qu'aux demi-centiemes pile (verifie dans b-verifier.js) */
let MODE_EXACT=false;
const K=CLES.length,SOM=new Float64Array(K),CNT=new Int32Array(K);
function eIdx(X,idx){
  SOM.fill(0);CNT.fill(0);let parties=0;
  for(let j=0;j<idx.length;j++){const v=X[idx[j]].v;if(!v)continue;parties++;for(let k=0;k<K;k++){const x=v[k];if(x!==null){SOM[k]+=x;CNT[k]++;}}}
  if(parties<PMIN)return PIRE;
  let s=0,w=0;
  for(let k=0;k<K;k++){
    if(CNT[k]){const zz=((SOM[k]/CNT[k])-RM[k])/RS[k],z=MODE_EXACT?+zz.toFixed(2):Math.round(zz*100)/100;s+=POIDS[k]*Math.max(0,Math.min(BORNE,Math.abs(z))-ZM);}
    else s+=POIDS[k]*Math.max(0,BORNE-ZM);
    w+=POIDS[k];}
  return w>0?s/w:PIRE;}

/* A, B : tableaux alignes par graine de {p: palier, v: vecteur|null}. o : {tirages, rng, seuil, decalageE (ajoute a E_A), n (prefixe)} */
function comparerRapide(A,B,o){
  o=o||{};const n=o.n||A.length,T=o.tirages==null?CFG.validation.bootstrap:o.tirages,seuil=o.seuil==null?CFG.validation.seuilSacre:o.seuil,dec=o.decalageE||0;
  const un=idx=>{let s=0;for(let j=0;j<idx.length;j++){const i=idx[j];s+=A[i].p-B[i].p;}
    const dP=s/idx.length,dE=eIdx(A,idx)+dec-eIdx(B,idx);return {dP,dE,dF:dP-PE*dE};};
  const tous=[];for(let i=0;i<n;i++)tous.push(i);
  const p=un(tous),R=o.rng||Gr.rngDe('comparer|'+n),vP=[],vE=[],vF=[];
  for(let t=0;t<T;t++){const idx=new Array(n);for(let i=0;i<n;i++)idx[i]=R.entier(n);const x=un(idx);vP.push(x.dP);vE.push(x.dE);vF.push(x.dF);}
  const se_dF=etype(vF),se_dPalier=etype(vP),se_dE=etype(vE);
  const criteres={a:p.dF>seuil*se_dF,b:p.dP>-1*se_dPalier,c:p.dE<1*se_dE};
  return {graines:n,dF:p.dF,se_dF,dPalier:p.dP,se_dPalier,dE:p.dE,se_dE,criteres,sacre:criteres.a&&criteres.b&&criteres.c};}

/* ---------- les reserves ---------- */
function residus(lignes){
  const f=N.ajuster(lignes,{passes:30,retrecir:0});
  const ids=new Set(lignes.map(l=>l.id)),gr=new Set(lignes.map(l=>l.graine));
  const ddl=lignes.length-ids.size-gr.size+1,k=Math.sqrt(lignes.length/ddl);
  return lignes.map(l=>({r:(l.palier-f.a[l.id]-f.b[l.graine])*k,v:vecteur(l.mesures),id:l.id}));}
let CACHE={};
function reserveEvolution(){
  if(CACHE.evolution)return CACHE.evolution;
  const t=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
  const M=new Map();for(const l of t)if(l.usage==='entrainement'&&l.mesuree===true&&typeof l.palier==='number')M.set(l.id+'|'+l.graine,l);
  return (CACHE.evolution=residus([...M.values()]));}
function lignesBruit(){
  const X=require(path.join(RAC,'ml','ecurie','etude','selection-naturelle','bruit','courses-0.json'));
  const L=N.depuisEtude(X).filter(l=>l.tmax===300);
  /* les 34 pilotes qui ont les deux lots (24 graines) */
  const c={};for(const l of L)c[l.id]=(c[l.id]||new Set()).add(l.graine);
  const ok=new Set(Object.keys(c).filter(i=>c[i].size>=24));
  const M=new Map();for(const l of L)if(ok.has(l.id))M.set(l.id+'|'+l.graine,l);
  return [...M.values()];}
function reserveBruit(){if(CACHE.bruit)return CACHE.bruit;return (CACHE.bruit=residus(lignesBruit()));}
function gabarits(){
  if(CACHE.gabarits)return CACHE.gabarits;
  const R=reserveBruit(),G={};for(const x of R)(G[x.id]=G[x.id]||[]).push(x);
  return (CACHE.gabarits=Object.values(G));}
/* un tireur de courses : modele 'evolution' | 'bruit' | 'gabarit' ; rend une fonction (rng) -> reserve de l'essai */
function tireur(modele){
  if(modele==='evolution'){const R=reserveEvolution();return ()=>R;}
  if(modele==='bruit'){const R=reserveBruit();return ()=>R;}
  if(modele==='gabarit'){const G=gabarits();return rng=>G[rng.entier(G.length)];}
  throw new Error('modele inconnu '+modele);}
/* n courses d'un pilote de vrai niveau a (palier), tirees dans la reserve R */
function courses(R,a,n,rng){const out=new Array(n);for(let i=0;i<n;i++){const c=R[rng.entier(R.length)];out[i]={p:a+c.r,v:c.v};}return out;}

const fmt=(x,d)=>x==null||x!==x?'-':x.toFixed(d==null?1:d);
const pct=(k,n)=>(100*k/n).toFixed(1)+' %';
/* intervalle a 95 % d'une proportion (Wilson), en % */
function wilson(k,n){const z=1.96,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return '['+(100*Math.max(0,c-h)).toFixed(1)+' ; '+(100*Math.min(1,c+h)).toFixed(1)+']';}

module.exports={N,Gr,CFG,REF,CLES,PE,vecteur,eRapide,eIdx,exact:b=>{MODE_EXACT=!!b;},comparerRapide,etype,reserveEvolution,reserveBruit,lignesBruit,gabarits,tireur,courses,fmt,pct,wilson,rng:s=>Gr.mulberry32?Gr.mulberry32(s):null};
