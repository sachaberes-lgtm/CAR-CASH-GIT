#!/usr/bin/env node
/* ===== LE BANC DES GENES : DE QUOI EST FAIT E, ET D'OU VIENT LE PALIER (2026-11-28, l'agent analyste : « quelles composantes de E bougent
   vraiment, sur combien de courses E est calcule, d'ou vient la perte de palier des gestes ») =====
   Lit les courses deja ecrites (etat/courses-*.jsonl, etat/bras.json) : AUCUNE course n'est jouee, rien n'est ecrit dans etat/.
   1. LES COMPOSANTES DE E. Pour chaque bras, E se decompose en quinze termes c_k = w_k e_k / Σ w, avec e_k = max(0, min(8,|z_k|) − 1) et z_k
      rendu par le VRAI ml/bot/ressemblance.js (ecart, reference des joueurs de note.referenceEpoque) ; les poids, la borne, la zone morte, le pire
      et le minimum de parties sont ceux de ml/evolution/config.json (note) ; une mesure que la reference connait mais qu'aucune partie ne donne
      compte au pire (comme note.js, eSimple). Σ c_k est controle contre note.ecartFoule (egalite exacte) et note.noter (le E de resume.txt).
      Puis, pour chaque bras, la difference de chaque composante avec le depart et son erreur-type par bootstrap APPARIE sur les graines (les memes
      tirages de graines pour les 13 bras : 2 000 tirages, hasard de graines.rngDe). Une composante « bouge » si |z| depasse le seuil de Bonferroni
      corrige pour 12 bras × 15 composantes = 180 comparaisons.
   2. SUR QUELLES COURSES. E ne lit que les courses qui ont des mesures (ml/evolution/enfant.js : ressemblance.mesuresPartie, null sous 60 s de
      course ou sous 100 echantillons). Pour chaque bras : combien de courses comptent, combien de graines comptent chez les deux, chez un seul ;
      dE recalcule sur les seules graines qui comptent chez les deux (bootstrap apparie sur ces graines).
   3. LE PALIER DECOUPE : par cause de mort, par cause de mort du depart sur la meme graine, par duree du depart (sous 60 s ou non) ; sur les graines
      ou la course differe (empreinte), combien de mieux / pareil / moins bien et de combien. La ligne de course ne dit ni la map ni le biome.
   4. LES DEUX QUESTIONS : l'additivite (gestes5 contre la somme des cinq gestes seuls, c0101 contre c0026 + bordOn + largeOn + libreOn, slalomOn et
      bordOn composante par composante) et le prix en palier des gestes (slalomOn, gestes5 : causes, graines).
   Ecrit sorties/composantes.txt et sorties/composantes.json ; aucune date dedans : deux lancements donnent les memes octets.
   Usage : node ml/ecurie/etude/banc-des-genes/composantes.js [--etat etat] [--epoque id] [--sorties sorties] */
'use strict';
const fs=require('fs'),path=require('path');
const RACINE=path.resolve(__dirname,'..','..','..','..');
const EVO=path.join(RACINE,'ml','evolution');
const C=require(path.join(EVO,'commun'));
const K=require(path.join(EVO,'courses'));
const N=require(path.join(EVO,'note'));
const Gr=require(path.join(EVO,'graines'));
const RS=require(path.join(RACINE,'ml','bot','ressemblance.js'));

const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0&&A[i+1]!=null?A[i+1]:d;};
const dossierEtat=path.resolve(__dirname,opt('etat','etat'));
const dossierSorties=path.resolve(__dirname,opt('sorties','sorties'));
const TIRAGES=2000;
const finir=t=>{console.error('composantes : '+t);process.exit(1);};
const cfg=C.lireConfig(null),cn=cfg.note;
const REF=N.referenceEpoque();
const BORNE=cn.borneZ==null?8:cn.borneZ,ZM=cn.zoneMorte==null?1:cn.zoneMorte,PIRE=cn.ePire==null?4:cn.ePire,PMIN=cn.partiesMin==null?5:cn.partiesMin;
const poids=k=>{const P=cn.poidsMesures||{};return P[k]==null?1:P[k];};
const CLES=RS.MESURES.map(m=>m[0]).filter(k=>REF[k]);
const NOMS={};for(const [k,nom] of RS.MESURES)NOMS[k]=nom;

/* ---------- outils ---------- */
const moy=X=>X.reduce((s,x)=>s+x,0)/X.length;
const etype=X=>{if(X.length<2)return 0;const m=moy(X);return Math.sqrt(X.reduce((s,x)=>s+(x-m)**2,0)/(X.length-1));};
const quantile=(X,q)=>{const B=[...X].sort((x,y)=>x-y);const i=(B.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return B[lo]+(B[hi]-B[lo])*(i-lo);};
const rk=(x,k)=>x==null||x!==x?null:Math.round(x*Math.pow(10,k))/Math.pow(10,k);
const r3=x=>rk(x,3),r4=x=>rk(x,4);
function phi(z){const t=1/(1+.3275911*Math.abs(z)/Math.SQRT2),e=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-z*z/2);return z>=0?(1+e)/2:(1-e)/2;}
function zDe(p){let a=-10,b=10;for(let i=0;i<100;i++){const m=(a+b)/2;if(phi(m)<p)a=m;else b=m;}return (a+b)/2;}
function signe(mieux,moins){const n=mieux+moins;if(!n)return 1;const k=Math.min(mieux,moins);let c=1,s=0;
  for(let i=0;i<=n;i++){if(i>0)c=c*(n-i+1)/i;if(i<=k)s+=c;}return Math.min(1,2*s/Math.pow(2,n));}
const sg=(x,k)=>x==null?'-':(x>=0?'+':'')+x.toFixed(k==null?3:k);

/* ---------- LA DECOMPOSITION (z par ressemblance.ecart, la somme de note.js eSimple) ----------
   rend {E, c:{k:part de E}, z:{k}, bot:{k}, parties, pire} ; quand E vaut le pire (moins de partiesMin parties), c n'a pas de sens : null. */
function decomposer(M){
  M=M.filter(Boolean);
  const r=M.length?RS.ecart(null,{mesures:M,reference:REF}):null;
  const z={},bot={},e={};let s=0,w=0;
  if(r)for(const x of r.mesures){z[x.cle]=x.z;bot[x.cle]=x.bot;const wk=poids(x.cle);e[x.cle]=wk*Math.max(0,Math.min(BORNE,Math.abs(x.z))-ZM);s+=e[x.cle];w+=wk;}
  if(r)for(const k of Object.keys(REF)){if(!REF[k]||k in z)continue;const wk=poids(k);e[k]=wk*Math.max(0,BORNE-ZM);s+=e[k];w+=wk;z[k]=null;bot[k]=null;}
  const pire=M.length<PMIN||!r||!(w>0);
  const c={};for(const k of CLES)c[k]=pire?null:(e[k]||0)/w;
  return {E:pire?PIRE:s/w,c,z,bot,parties:M.length,pire};}

/* ---------- les bras, les courses (memes regles qu'analyser.js) ---------- */
const BJ=C.lireJson(path.join(dossierEtat,'bras.json'),null);
if(!BJ||!Array.isArray(BJ.bras))finir('pas de bras.json dans '+dossierEtat);
const BRAS=BJ.bras.map(b=>b.nom);
if(BRAS[0]!=='depart')finir('bras.json : le premier bras doit etre depart');
const brutes=K.lireCourses(dossierEtat).filter(Boolean);
const parEpoque={};for(const l of brutes)if(l.usage==='banc')parEpoque[l.epoque]=(parEpoque[l.epoque]||0)+1;
const EPOQUE=opt('epoque',null)||Object.entries(parEpoque).sort((x,y)=>y[1]-x[1]||(x[0]<y[0]?-1:1))[0][0];
const L={};
for(const b of BJ.bras){const M=new Map();
  for(const l of brutes)if(l.usage==='banc'&&l.epoque===EPOQUE&&l.id===b.nom&&l.mesuree===true&&l.pilote===b.shaPilote)M.set(l.graine,l);
  L[b.nom]=M;}
const G=[...L.depart.keys()].filter(g=>BRAS.every(n=>L[n].has(g))).sort((x,y)=>x-y);
if(G.length<10)finir('moins de 10 graines communes a tous les bras');
const AUTRES=BRAS.filter(n=>n!=='depart');
const KC=AUTRES.length*CLES.length,ALPHA=.05/KC,ZC=-zDe(ALPHA/2);
const ALPHA12=.05/AUTRES.length,ZC12=-zDe(ALPHA12/2);
const lig=(n,g)=>L[n].get(g);

/* ---------- les points (toutes les graines communes) et le controle contre le vrai code ---------- */
const lignesNote=[];for(const n of BRAS)for(const g of G)lignesNote.push(lig(n,g));
const note=N.noter(lignesNote,{REF,cfg:cfg.note,ids:BRAS});
let resultats=null;try{resultats=JSON.parse(fs.readFileSync(path.join(__dirname,'sorties','resultats.json'),'utf8'));}catch(e){}
const point={},controle={};
for(const n of BRAS){
  const M=G.map(g=>lig(n,g).mesures);
  const d=decomposer(M),ef=N.ecartFoule(M,REF,cn,Gr.rngDe('composantes|controle|'+n));
  const somme=d.pire?d.E:CLES.reduce((s,k)=>s+d.c[k],0);
  const eRes=resultats&&resultats.bras&&resultats.bras[n]&&resultats.bras[n].surCommunes?resultats.bras[n].surCommunes.E:null;
  controle[n]={sommeComposantes:r4(somme),ecartFoule:r4(ef.E),noter:r4(note.par[n].E),resultatsJson:eRes,
    egalExact:Math.abs(somme-ef.E)<1e-9&&Math.abs(ef.E-note.par[n].E)<1e-9,aMilliemePres:eRes!=null&&Math.abs(somme-eRes)<=0.001+1e-9};
  point[n]=d;}
const controlesOk=BRAS.every(n=>controle[n].egalExact&&controle[n].aMilliemePres);

/* ---------- le bootstrap apparie commun (memes graines tirees pour les 13 bras) ---------- */
const nG=G.length,RB=Gr.rngDe('banc-des-genes|composantes|'+nG),boot={};
for(const n of BRAS)boot[n]={E:[],c:{},palier:[]};
for(const n of BRAS)for(const k of CLES)boot[n].c[k]=[];
for(let t=0;t<TIRAGES;t++){
  const idx=new Array(nG);for(let i=0;i<nG;i++)idx[i]=RB.entier(nG);
  for(const n of BRAS){const M=[],P=[];for(const i of idx){const l=lig(n,G[i]);P.push(l.palier);if(l.mesures)M.push(l.mesures);}
    const d=decomposer(M);boot[n].E.push(d.E);boot[n].palier.push(moy(P));for(const k of CLES)boot[n].c[k].push(d.c[k]==null?NaN:d.c[k]);}}
const dif=(a,b)=>a.map((x,i)=>x-b[i]);
const resume=X=>{const Y=X.filter(x=>x===x);return {se:etype(Y),ic95:[quantile(Y,.025),quantile(Y,.975)],ok:Y.length===X.length};};

/* ===== 1. LES COMPOSANTES ===== */
const compo={};
for(const n of BRAS){
  const p=point[n],x={E:r4(p.E),parties:p.parties,composantes:{}};
  for(const k of CLES){const o={bot:p.bot[k],joueurs:r4(REF[k].m),sigma:r4(REF[k].s),z:p.z[k],poids:poids(k),part:r4(p.c[k])};
    if(n!=='depart'){const dc=p.c[k]-point.depart.c[k],b=resume(dif(boot[n].c[k],boot.depart.c[k]));
      o.dPart=r4(dc);o.se=r4(b.se);o.zScore=b.se>0?r3(dc/b.se):null;o.ic95=[r4(b.ic95[0]),r4(b.ic95[1])];
      o.bouge=b.se>0&&Math.abs(dc/b.se)>ZC;o.bouge12=b.se>0&&Math.abs(dc/b.se)>ZC12;}
    x.composantes[k]=o;}
  if(n!=='depart'){const dE=p.E-point.depart.E,b=resume(dif(boot[n].E,boot.depart.E));x.dE=r4(dE);x.se_dE=r4(b.se);x.ic95_dE=[r4(b.ic95[0]),r4(b.ic95[1])];}
  compo[n]=x;}

/* ===== 2. SUR QUELLES COURSES ===== */
const quelles={};
for(const n of AUTRES){
  const deux=G.filter(g=>lig(n,g).mesures&&lig('depart',g).mesures),bras=G.filter(g=>lig(n,g).mesures&&!lig('depart',g).mesures),
    dep=G.filter(g=>!lig(n,g).mesures&&lig('depart',g).mesures),aucun=G.filter(g=>!lig(n,g).mesures&&!lig('depart',g).mesures);
  const eB=decomposer(deux.map(g=>lig(n,g).mesures)),eD=decomposer(deux.map(g=>lig('depart',g).mesures));
  const R=Gr.rngDe('banc-des-genes|composantes|communes|'+n+'|'+deux.length),v=[];
  for(let t=0;t<TIRAGES;t++){const MB=[],MD=[];for(let i=0;i<deux.length;i++){const g=deux[R.entier(deux.length)];MB.push(lig(n,g).mesures);MD.push(lig('depart',g).mesures);}
    v.push(decomposer(MB).E-decomposer(MD).E);}
  const se=etype(v),dEc=eB.E-eD.E;
  /* les composantes de la difference sur les graines communes (les deux plus grandes en valeur absolue) */
  const parts=CLES.map(k=>[k,eB.c[k]-eD.c[k]]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])||(a[0]<b[0]?-1:1));
  quelles[n]={partiesBras:G.filter(g=>lig(n,g).mesures).length,partiesDepart:G.filter(g=>lig('depart',g).mesures).length,
    lesDeux:deux.length,brasSeul:bras.length,departSeul:dep.length,aucun:aucun.length,
    grainesBrasSeul:bras,grainesDepartSeul:dep,
    dE_toutes:compo[n].dE,se_toutes:compo[n].se_dE,E_bras_communes:r4(eB.E),E_depart_communes:r4(eD.E),dE_communes:r4(dEc),se_communes:r4(se),
    ic95_communes:[r4(quantile(v,.025)),r4(quantile(v,.975))],z_communes:se>0?r3(dEc/se):null,
    partDuChoixDesCourses:r4(compo[n].dE-dEc),
    E_depart_toutes:r4(point.depart.E),E_bras_toutes:r4(point[n].E),
    composantesCommunes:Object.fromEntries(parts.map(([k,d])=>[k,r4(d)]))};}

/* ===== 3. LE PALIER DECOUPE ===== */
const palier={};
const CAUSES=[...new Set([].concat(...BRAS.map(n=>G.map(g=>lig(n,g).cause))))].sort();
for(const n of BRAS){
  const parCause={};for(const c of CAUSES){const X=G.filter(g=>lig(n,g).cause===c);if(X.length)parCause[c]={courses:X.length,palierMoyen:r3(moy(X.map(g=>lig(n,g).palier))),
    survieMoyenne_s:r3(moy(X.map(g=>lig(n,g).survie_s)))};}
  const x={palierMoyen:r3(moy(G.map(g=>lig(n,g).palier))),parCause};
  if(n!=='depart'){
    const D=G.filter(g=>lig(n,g).empreinte!==lig('depart',g).empreinte),I=G.length-D.length;
    const dp=D.map(g=>lig(n,g).palier-lig('depart',g).palier);
    const mieux=dp.filter(d=>d>0),moins=dp.filter(d=>d<0);
    x.identiques=I;x.differentes=D.length;
    x.surDifferentes={mieux:mieux.length,pareil:dp.filter(d=>d===0).length,moins:moins.length,gainMieux:mieux.reduce((s,d)=>s+d,0),pertesMoins:moins.reduce((s,d)=>s+d,0),
      dMoyen:D.length?r3(moy(dp)):null,ecartType:D.length?r3(etype(dp)):null,pSigne:r3(signe(mieux.length,moins.length)),sommeSur96:dp.reduce((s,d)=>s+d,0),dSur96:r3(dp.reduce((s,d)=>s+d,0)/G.length)};
    /* la difference, rangee par la cause de mort du DEPART sur la meme graine (la graine ne change pas de bras a bras) */
    const pCD={};for(const g of D){const c=lig('depart',g).cause,d=lig(n,g).palier-lig('depart',g).palier;pCD[c]=pCD[c]||{graines:0,somme:0,mieux:0,moins:0};
      pCD[c].graines++;pCD[c].somme+=d;if(d>0)pCD[c].mieux++;if(d<0)pCD[c].moins++;}
    x.parCauseDuDepart=Object.fromEntries(Object.keys(pCD).sort().map(c=>[c,pCD[c]]));
    /* et par la cause de mort du BRAS sur ces graines */
    const pCB={};for(const g of D){const c=lig(n,g).cause,d=lig(n,g).palier-lig('depart',g).palier;pCB[c]=pCB[c]||{graines:0,somme:0,mieux:0,moins:0};
      pCB[c].graines++;pCB[c].somme+=d;if(d>0)pCB[c].mieux++;if(d<0)pCB[c].moins++;}
    x.parCauseDuBras=Object.fromEntries(Object.keys(pCB).sort().map(c=>[c,pCB[c]]));
    /* par la duree du depart : la graine ou le depart meurt sous 60 s (course courte, hors de E) ou non */
    const cl=g=>lig('depart',g).survie_s<60?'departSous60s':'departAuMoins60s',pD={};
    for(const g of D){const c=cl(g),d=lig(n,g).palier-lig('depart',g).palier;pD[c]=pD[c]||{graines:0,somme:0,mieux:0,moins:0};pD[c].graines++;pD[c].somme+=d;if(d>0)pD[c].mieux++;if(d<0)pD[c].moins++;}
    x.parDureeDuDepart=pD;
    x.lignes=D.map(g=>({graine:g,dPalier:lig(n,g).palier-lig('depart',g).palier,depart:[lig('depart',g).palier,lig('depart',g).cause,lig('depart',g).survie_s],
      bras:[lig(n,g).palier,lig(n,g).cause,lig(n,g).survie_s]}));}
  palier[n]=x;}

/* ===== 4. LES DEUX QUESTIONS ===== */
/* (a) l'additivite : contraste I = d(melange) − Σ d(seuls), sur les memes tirages de graines */
function contraste(melange,seuls){
  const dd=n=>({E:dif(boot[n].E,boot.depart.E),P:dif(boot[n].palier,boot.depart.palier)});
  const m=dd(melange),S=seuls.map(dd);
  const iE=m.E.map((x,t)=>x-S.reduce((s,y)=>s+y.E[t],0)),iP=m.P.map((x,t)=>x-S.reduce((s,y)=>s+y.P[t],0));
  const pE=compo[melange].dE-seuls.reduce((s,n)=>s+compo[n].dE,0);
  const dP=n=>moy(G.map(g=>lig(n,g).palier-lig('depart',g).palier));
  const pP=dP(melange)-seuls.reduce((s,n)=>s+dP(n),0);
  const parComposante={};for(const k of CLES){const pk=compo[melange].composantes[k].dPart-seuls.reduce((s,n)=>s+compo[n].composantes[k].dPart,0);
    const v=boot[melange].c[k].map((x,t)=>(x-boot.depart.c[k][t])-seuls.reduce((s,n)=>s+(boot[n].c[k][t]-boot.depart.c[k][t]),0));
    const b=resume(v);parComposante[k]={observe:r4(compo[melange].composantes[k].dPart),sommeDesSeuls:r4(seuls.reduce((s,n)=>s+compo[n].composantes[k].dPart,0)),interaction:r4(pk),se:r4(b.se)};}
  const bE=resume(iE),bP=resume(iP);
  return {melange,seuls,dE_observe:compo[melange].dE,dE_sommeDesSeuls:r4(seuls.reduce((s,n)=>s+compo[n].dE,0)),interactionE:r4(pE),se_interactionE:r4(bE.se),ic95_interactionE:[r4(bE.ic95[0]),r4(bE.ic95[1])],
    dPalier_observe:r3(dP(melange)),dPalier_sommeDesSeuls:r3(seuls.reduce((s,n)=>s+dP(n),0)),interactionPalier:r3(pP),se_interactionPalier:r3(bP.se),ic95_interactionPalier:[r3(bP.ic95[0]),r3(bP.ic95[1])],parComposante};}
const additivite={gestes5:contraste('gestes5',['lacheOn','slalomOn','coupOn','relacheOn','suitOn']),
  c0101:contraste('c0101',['c0026','bordOn','largeOn','libreOn'])};
/* slalomOn et bordOn : leurs composantes, et la somme qu'on predirait si elles s'additionnaient (une prediction, pas une mesure) */
const sb={};for(const k of CLES)sb[k]={slalomOn:compo.slalomOn.composantes[k].dPart,bordOn:compo.bordOn.composantes[k].dPart,
  somme:r4(compo.slalomOn.composantes[k].dPart+compo.bordOn.composantes[k].dPart),
  correlationBootstrap:null};
for(const k of CLES){const a=dif(boot.slalomOn.c[k],boot.depart.c[k]),b=dif(boot.bordOn.c[k],boot.depart.c[k]),ma=moy(a),mb=moy(b);
  let s=0,sa=0,sbb=0;for(let i=0;i<a.length;i++){s+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sbb+=(b[i]-mb)**2;}sb[k].correlationBootstrap=sa>0&&sbb>0?r3(s/Math.sqrt(sa*sbb)):null;}
/* la recouvrance graine par graine : les graines ou slalomOn et bordOn changent la course */
const chg=n=>new Set(G.filter(g=>lig(n,g).empreinte!==lig('depart',g).empreinte));
const cS=chg('slalomOn'),cB=chg('bordOn');
const recouvre={slalomOnChange:cS.size,bordOnChange:cB.size,lesDeuxChangent:[...cS].filter(g=>cB.has(g)).length};
/* la nitro au decollage et l'aller, course par course, sur les graines communes : la mediane des valeurs par bras */
const parCourse={};for(const n of ['depart','slalomOn','bordOn','gestes5','c0101'])for(const k of ['aller','nitroDecol']){
  const X=G.map(g=>lig(n,g).mesures&&lig(n,g).mesures[k]).filter(x=>x!=null);parCourse[n+'|'+k]={courses:X.length,moyenne:r4(X.length?moy(X):null),mediane:r4(X.length?quantile(X,.5):null)};}
/* (b) le prix en palier des gestes : les memes graines perdent-elles chez slalomOn et gestes5 ? */
const dpOf=n=>G.map(g=>lig(n,g).palier-lig('depart',g).palier);
const corr=(a,b)=>{const ma=moy(a),mb=moy(b);let s=0,sa=0,sbb=0;for(let i=0;i<a.length;i++){s+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sbb+=(b[i]-mb)**2;}return s/Math.sqrt(sa*sbb);};
const pS=dpOf('slalomOn'),pG=dpOf('gestes5');
const perteS=new Set(G.filter((g,i)=>pS[i]<0)),perteG=new Set(G.filter((g,i)=>pG[i]<0));
const prix={correlation_dPalier_slalomOn_gestes5:r3(corr(pS,pG)),slalomOnPerd:perteS.size,gestes5Perd:perteG.size,lesDeuxPerdent:[...perteS].filter(g=>perteG.has(g)).length,
  grossesPertes:{}};
for(const n of ['slalomOn','gestes5']){const X=palier[n].lignes.filter(x=>x.dPalier<=-5).sort((a,b)=>a.dPalier-b.dPalier||a.graine-b.graine);
  prix.grossesPertes[n]={graines:X.length,somme:X.reduce((s,x)=>s+x.dPalier,0),lignes:X};}
/* la perte sans les grosses pertes : que reste-t-il si on retire les graines ou le bras perd 5 paliers ou plus ? */
for(const n of ['slalomOn','gestes5']){const tot=dpOf(n).reduce((s,d)=>s+d,0);prix.grossesPertes[n].totalSur96=tot;prix.grossesPertes[n].resteSansGrossesPertes=tot-prix.grossesPertes[n].somme;}
/* le pendant des grosses pertes : les grosses gains (5 paliers ou plus), pour ne pas lire une seule queue de la distribution */
prix.grosGains={};for(const n of ['slalomOn','gestes5']){const X=palier[n].lignes.filter(x=>x.dPalier>=5);prix.grosGains[n]={graines:X.length,somme:X.reduce((s,x)=>s+x.dPalier,0)};}
/* la cause de mort du bras sur les graines differentes, avec l'erreur-type de la somme sous « aucun effet » (et-type des d × racine du nombre) */
prix.parCauseDuBras={};for(const n of ['slalomOn','gestes5']){const s=palier[n].surDifferentes.ecartType,P=palier[n].parCauseDuBras;
  prix.parCauseDuBras[n]=Object.fromEntries(Object.keys(P).map(c=>[c,{graines:P[c].graines,somme:P[c].somme,se:r3(s*Math.sqrt(P[c].graines)),z:r3(P[c].somme/(s*Math.sqrt(P[c].graines)))}]));}
/* LE RYTHME : un bras peut perdre du palier sans mourir plus tot, en avancant moins vite. Sur les graines ou les deux courses durent 60 s ou
   plus : la difference appariee de paliers par minute ; et la vitesse des deux premieres minutes (la mesure « vitesse » de ressemblance.js). */
const rythme={};
for(const n of AUTRES){
  const GG=G.filter(g=>lig(n,g).survie_s>=60&&lig('depart',g).survie_s>=60);
  const pm=(l)=>l.palier/(l.survie_s/60),d=GG.map(g=>pm(lig(n,g))-pm(lig('depart',g)));
  const R=Gr.rngDe('banc-des-genes|composantes|rythme|'+n+'|'+GG.length),v=[];
  for(let t=0;t<TIRAGES;t++){let s=0;for(let i=0;i<GG.length;i++)s+=d[R.entier(GG.length)];v.push(s/GG.length);}
  const dS=G.map(g=>lig(n,g).survie_s-lig('depart',g).survie_s);
  rythme[n]={graines:GG.length,paliersParMinuteDepart:r3(moy(GG.map(g=>pm(lig('depart',g))))),paliersParMinuteBras:r3(moy(GG.map(g=>pm(lig(n,g))))),
    dPaliersParMinute:r3(moy(d)),se:r3(etype(v)),z:etype(v)>0?r3(moy(d)/etype(v)):null,dSurvie_s:r3(moy(dS)),
    vitesseDepart_kmh:point.depart.bot.vitesse,vitesseBras_kmh:point[n].bot.vitesse};
  /* la vitesse appariee : graines ou les deux courses ont la mesure ; se = et-type / racine(n) */
  const GV=G.filter(g=>lig(n,g).mesures&&lig('depart',g).mesures&&lig(n,g).mesures.vitesse!=null&&lig('depart',g).mesures.vitesse!=null);
  const dv=GV.map(g=>lig(n,g).mesures.vitesse-lig('depart',g).mesures.vitesse),sev=GV.length>1?etype(dv)/Math.sqrt(GV.length):0;
  rythme[n].vitesseApparieeGraines=GV.length;rythme[n].dVitesse_kmh=r3(GV.length?moy(dv):null);rythme[n].se_dVitesse=r3(sev);rythme[n].z_dVitesse=sev>0?r3(moy(dv)/sev):null;}

/* ===== LES SORTIES ===== */
const res={format:'banc-des-genes-composantes-1',epoque:EPOQUE,graines:G.length,tirages:TIRAGES,
  comparaisons:KC,alphaCorrige:r4(ALPHA*1e4)/1e4,zCorrige:r3(ZC),zCorrige12:r3(ZC12),cles:CLES,
  poids:Object.fromEntries(CLES.map(k=>[k,poids(k)])),sommePoids:CLES.reduce((s,k)=>s+poids(k),0),
  controle,controlesOk,composantes:compo,quellesCourses:quelles,palier,additivite,slalomEtBord:{parComposante:sb,recouvre,parCourse},prixDesGestes:prix,rythme};

const o=[],f3=x=>x==null?'   -   ':((x>=0?'+':'')+x.toFixed(3)).padStart(7);
o.push('LE BANC DES GENES — LES COMPOSANTES DE E ET LE PALIER DECOUPE (composantes.js : aucune course jouee, lecture des lignes de etat/)');
o.push('');
o.push(`epoque ${EPOQUE} · ${G.length} graines communes aux 13 bras · bootstrap apparie : ${TIRAGES} tirages de graines, les memes pour tous les bras (graines.rngDe)`);
o.push(`E = Σ c_k, c_k = w_k · max(0, min(${BORNE}, |z_k|) − ${ZM}) / Σ w (Σ w = ${res.sommePoids} : poids 0,5 pour ${CLES.filter(k=>poids(k)!==1).join(', ')}) ; z_k par ml/bot/ressemblance.js`);
o.push('');
o.push('LE CONTROLE (Σ c_k contre note.ecartFoule et note.noter, egalite exacte ; contre resultats.json, a 0,001 pres) : '+(controlesOk?'TOUT PASSE':'ECHEC'));
o.push('  '+BRAS.map(n=>`${n} ${controle[n].sommeComposantes.toFixed(4)}/${controle[n].resultatsJson}${controle[n].egalExact&&controle[n].aMilliemePres?'':' ECHEC'}`).join(' · '));
o.push('');
o.push('1. LES COMPOSANTES DE E PAR BRAS (part de E ; la somme de la colonne = E)');
o.push('mesure      | '+BRAS.map(n=>n.padStart(9)).join(' | '));
for(const k of CLES)o.push(k.padEnd(11)+' | '+BRAS.map(n=>{const v=compo[n].composantes[k].part;return (v==null?'-':v.toFixed(3)).padStart(9);}).join(' | '));
o.push('E           | '+BRAS.map(n=>compo[n].E.toFixed(3).padStart(9)).join(' | '));
o.push('parties     | '+BRAS.map(n=>String(compo[n].parties).padStart(9)).join(' | '));
o.push('');
o.push('le z de chaque mesure (bot − joueurs) / sigma des joueurs ; zone morte |z| < 1, borne 8');
o.push('mesure      | '+BRAS.map(n=>n.padStart(9)).join(' | '));
for(const k of CLES)o.push(k.padEnd(11)+' | '+BRAS.map(n=>{const v=compo[n].composantes[k].z;return (v==null?'absent':(v>=0?'+':'')+v.toFixed(2)).padStart(9);}).join(' | '));
o.push('');
o.push(`LA DIFFERENCE DE CHAQUE COMPOSANTE AVEC LE DEPART (dc, se par bootstrap apparie) : ${KC} comparaisons (${AUTRES.length} bras × ${CLES.length} mesures),`);
o.push(`seuil de Bonferroni 5 % / ${KC} = ${(100*ALPHA).toFixed(4)} %, |z| > ${ZC.toFixed(2)} (marque **) ; |z| > ${ZC12.toFixed(2)} = seuil d'une seule famille de ${AUTRES.length} (marque *, une piste)`);
for(const n of AUTRES){const x=compo[n];
  o.push(`${n.padEnd(9)} dE ${sg(x.dE)} (se ${x.se_dE.toFixed(3)}) : `+CLES.map(k=>[k,x.composantes[k]]).filter(([,c])=>c.dPart!==0||c.se>0)
    .sort((a,b)=>Math.abs(b[1].dPart)-Math.abs(a[1].dPart)||(a[0]<b[0]?-1:1)).slice(0,6)
    .map(([k,c])=>`${k} ${sg(c.dPart)} (${c.se.toFixed(3)}, z ${c.zScore==null?'-':c.zScore.toFixed(1)})${c.bouge?'**':c.bouge12?'*':''}`).join(' · '));}
o.push('');
o.push('LES COMPOSANTES QUI BOUGENT AU SEUIL CORRIGE (|z| > '+ZC.toFixed(2)+')');
let nb=0;for(const n of AUTRES)for(const k of CLES){const c=compo[n].composantes[k];if(c.bouge){nb++;
  o.push(`  ${n.padEnd(9)} ${k.padEnd(11)} ${sg(c.dPart)} (se ${c.se.toFixed(3)}, z ${c.zScore.toFixed(2)}) : z joueurs ${point.depart.z[k]==null?'absent':point.depart.z[k].toFixed(2)} -> ${point[n].z[k]==null?'absent':point[n].z[k].toFixed(2)} ; bot ${point.depart.bot[k]} -> ${point[n].bot[k]} (joueurs ${r3(REF[k].m)})`);}}
if(!nb)o.push('  aucune');
o.push('');
o.push('2. SUR QUELLES COURSES E EST CALCULE');
o.push('E ne lit que les courses qui ont des mesures : ressemblance.mesuresPartie rend null sous 60 s de course (ou sous 100 echantillons), et enfant.js');
o.push('ecrit mesures:null. Ici les deux regles coincident : toute course de 60 s ou plus a ses mesures, aucune course plus courte n\'en a.');
o.push('bras      | parties bras/depart | les deux | bras seul | depart seul | aucun | dE toutes (se)   | dE graines communes (se) [IC 95 %]  | part due au choix des courses');
for(const n of AUTRES){const q=quelles[n];
  o.push(`${n.padEnd(9)} | ${(q.partiesBras+'/'+q.partiesDepart).padStart(19)} | ${String(q.lesDeux).padStart(8)} | ${String(q.brasSeul).padStart(9)} | ${String(q.departSeul).padStart(11)} | ${String(q.aucun).padStart(5)} | `+
    `${(sg(q.dE_toutes)+' ('+q.se_toutes.toFixed(3)+')').padEnd(16)} | ${(sg(q.dE_communes)+' ('+q.se_communes.toFixed(3)+') ['+sg(q.ic95_communes[0])+' ; '+sg(q.ic95_communes[1])+']').padEnd(35)} | ${sg(q.partDuChoixDesCourses)}`);}
o.push('(sur les graines communes, les deux bras sont mesures sur les memes routes ; mais rester en course 60 s est lui-meme un effet du bras : ce sous-ensemble');
o.push(' est choisi APRES le traitement, la comparaison n\'y est pas tout a fait propre non plus. Les deux chiffres ensemble bornent l\'effet du choix des courses.)');
o.push('');
o.push('3. LE PALIER DECOUPE (la ligne de course ne dit ni la map ni le biome : seulement la cause de mort, la survie, le palier et l\'empreinte)');
o.push('sur les graines ou la course DIFFERE du depart (empreinte) : mieux / pareil / moins, gains et pertes en paliers, d moyen sur ces graines, p du signe');
o.push('bras      | differentes | mieux/pareil/moins | gains | pertes | d moyen (et-type) | p signe | somme / 96');
for(const n of AUTRES){const x=palier[n],s=x.surDifferentes;
  o.push(`${n.padEnd(9)} | ${String(x.differentes).padStart(11)} | ${(s.mieux+'/'+s.pareil+'/'+s.moins).padStart(18)} | ${('+'+s.gainMieux).padStart(5)} | ${String(s.pertesMoins).padStart(6)} | `+
    `${((s.dMoyen==null?'-':sg(s.dMoyen,2))+' ('+(s.ecartType==null?'-':s.ecartType.toFixed(2))+')').padStart(17)} | ${String(s.pSigne).padStart(7)} | ${sg(s.dSur96,3)}`);}
o.push('');
o.push('la difference de palier sur les graines differentes, rangee par la cause de mort du DEPART sur la meme graine (somme des d : graines)');
o.push('bras      | '+CAUSES.map(c=>c.padStart(11)).join(' | '));
for(const n of AUTRES){const p=palier[n].parCauseDuDepart;o.push(`${n.padEnd(9)} | `+CAUSES.map(c=>(p[c]?((p[c].somme>=0?'+':'')+p[c].somme+' : '+p[c].graines):'-').padStart(11)).join(' | '));}
o.push('');
o.push('la meme, rangee par la cause de mort du BRAS (somme des d : graines)');
o.push('bras      | '+CAUSES.map(c=>c.padStart(11)).join(' | '));
for(const n of AUTRES){const p=palier[n].parCauseDuBras;o.push(`${n.padEnd(9)} | `+CAUSES.map(c=>(p[c]?((p[c].somme>=0?'+':'')+p[c].somme+' : '+p[c].graines):'-').padStart(11)).join(' | '));}
o.push('');
o.push('la meme, rangee par la duree du depart sur la graine (sous 60 s : course courte, hors de E chez le depart)');
for(const n of AUTRES){const p=palier[n].parDureeDuDepart,a=p.departSous60s||{graines:0,somme:0,mieux:0,moins:0},b=p.departAuMoins60s||{graines:0,somme:0,mieux:0,moins:0};
  o.push(`${n.padEnd(9)} | depart < 60 s : ${String(a.graines).padStart(2)} graines, somme ${sg(a.somme,0).padStart(4)} (${a.mieux} mieux, ${a.moins} moins) | depart >= 60 s : ${String(b.graines).padStart(2)} graines, somme ${sg(b.somme,0).padStart(4)} (${b.mieux} mieux, ${b.moins} moins)`);}
o.push('');
o.push('le palier moyen par cause de mort du bras (courses : palier moyen)');
o.push('bras      | '+CAUSES.map(c=>c.padStart(11)).join(' | '));
for(const n of BRAS){const p=palier[n].parCause;o.push(`${n.padEnd(9)} | `+CAUSES.map(c=>(p[c]?(p[c].courses+' : '+p[c].palierMoyen.toFixed(1)):'-').padStart(11)).join(' | '));}
o.push('');
o.push('4a. SLALOMON ET BORDON S\'ADDITIONNENT-ILS ? (le banc n\'a pas le bras slalomOn + bordOn)');
for(const m of ['gestes5','c0101']){const x=additivite[m];
  o.push(`${m} contre ${x.seuls.join(' + ')} :`);
  o.push(`  dE observe ${sg(x.dE_observe)} ; somme des seuls ${sg(x.dE_sommeDesSeuls)} ; interaction ${sg(x.interactionE)} (se ${x.se_interactionE.toFixed(3)}, IC 95 % [${sg(x.ic95_interactionE[0])} ; ${sg(x.ic95_interactionE[1])}])`);
  o.push(`  d palier observe ${sg(x.dPalier_observe,2)} ; somme des seuls ${sg(x.dPalier_sommeDesSeuls,2)} ; interaction ${sg(x.interactionPalier,2)} (se ${x.se_interactionPalier.toFixed(2)}, IC 95 % [${sg(x.ic95_interactionPalier[0],2)} ; ${sg(x.ic95_interactionPalier[1],2)}])`);
  const big=CLES.map(k=>[k,x.parComposante[k]]).filter(([,c])=>Math.abs(c.observe)>=0.01||Math.abs(c.sommeDesSeuls)>=0.01).sort((a,b)=>Math.abs(b[1].interaction)-Math.abs(a[1].interaction)||(a[0]<b[0]?-1:1));
  o.push('  par composante (observe / somme des seuls / interaction (se)) : '+big.map(([k,c])=>`${k} ${sg(c.observe)} / ${sg(c.sommeDesSeuls)} / ${sg(c.interaction)} (${c.se.toFixed(3)})`).join(' · '));}
o.push('slalomOn et bordOn, composante par composante (dc slalomOn / dc bordOn / somme si tout s\'additionnait ; correlation de leurs dc d\'un tirage a l\'autre) :');
for(const k of CLES){const x=sb[k];if(Math.abs(x.slalomOn)<0.005&&Math.abs(x.bordOn)<0.005)continue;
  o.push(`  ${k.padEnd(11)} ${sg(x.slalomOn)} / ${sg(x.bordOn)} / ${sg(x.somme)} (r ${x.correlationBootstrap==null?'-':x.correlationBootstrap.toFixed(2)})`);}
o.push(`  graines dont la course change : slalomOn ${recouvre.slalomOnChange}, bordOn ${recouvre.bordOnChange}, les deux ${recouvre.lesDeuxChangent} (sur ${G.length})`);
o.push('  aller et nitroDecol course par course (courses mesurees : moyenne / mediane) : '+Object.entries(parCourse).map(([k,v])=>`${k} ${v.courses} : ${v.moyenne==null?'-':v.moyenne.toFixed(3)} / ${v.mediane==null?'-':v.mediane.toFixed(3)}`).join(' · '));
o.push(`  joueurs : aller ${r3(REF.aller.m)} ± ${r3(REF.aller.s)} s, nitroDecol ${r3(REF.nitroDecol.m)} ± ${r3(REF.nitroDecol.s)}`);
o.push('');
o.push('4b. LE PRIX EN PALIER DES GESTES');
o.push(`correlation des d palier graine par graine, slalomOn et gestes5 : ${prix.correlation_dPalier_slalomOn_gestes5} ; graines perdues : slalomOn ${prix.slalomOnPerd}, gestes5 ${prix.gestes5Perd}, les deux ${prix.lesDeuxPerdent}`);
for(const n of ['slalomOn','gestes5']){const x=prix.grossesPertes[n];
  o.push(`${n} : somme des d palier sur 96 graines ${x.totalSur96} ; ${x.graines} graines perdent 5 paliers ou plus (somme ${x.somme}) ; sans elles il reste ${sg(x.resteSansGrossesPertes,0)}`);
  o.push('  '+x.lignes.map(l=>`${l.graine} ${l.dPalier} (depart ${l.depart[0]} ${l.depart[1]} ${l.depart[2]} s -> ${l.bras[0]} ${l.bras[1]} ${l.bras[2]} s)`).join(' · '));
  o.push(`  le pendant : ${prix.grosGains[n].graines} graines GAGNENT 5 paliers ou plus (somme +${prix.grosGains[n].somme}) ; les grosses pertes tombent sur des graines ou le depart allait loin : un retirage regresse vers la moyenne`);
  const P=prix.parCauseDuBras[n];
  o.push('  la perte par cause de mort du BRAS (somme des d, se sous « aucun effet », z) : '+Object.keys(P).sort().map(c=>`${c} ${sg(P[c].somme,0)} : ${P[c].graines} (${P[c].se.toFixed(1)}, z ${P[c].z.toFixed(1)})`).join(' · '));}
o.push('');
o.push('LE RYTHME (graines ou les deux courses durent 60 s ou plus : paliers par minute, difference appariee, se par bootstrap ; d survie sur les 96 graines ;');
o.push('vitesse = la mesure « vitesse » de ressemblance.js, moyenne des courses mesurees, km/h des deux premieres minutes au sol ; joueurs '+r3(REF.vitesse.m)+' ± '+r3(REF.vitesse.s)+')');
o.push('bras      | graines | paliers/min depart -> bras | d (se) z              | d survie (s) | vitesse depart -> bras | d vitesse appariee (se) z, graines');
for(const n of AUTRES){const x=rythme[n];
  o.push(`${n.padEnd(9)} | ${String(x.graines).padStart(7)} | ${(x.paliersParMinuteDepart.toFixed(3)+' -> '+x.paliersParMinuteBras.toFixed(3)).padStart(26)} | ${(sg(x.dPaliersParMinute)+' ('+x.se.toFixed(3)+') z '+(x.z==null?'-':x.z.toFixed(1))).padEnd(21)} | ${sg(x.dSurvie_s,1).padStart(12)} | `+
    `${(x.vitesseDepart_kmh+' -> '+x.vitesseBras_kmh).padEnd(22)} | ${sg(x.dVitesse_kmh,1)} (${x.se_dVitesse.toFixed(1)}) z ${x.z_dVitesse==null?'-':x.z_dVitesse.toFixed(1)}, ${x.vitesseApparieeGraines}`);}
o.push('');
o.push('A LIRE AVEC LA SECTION 3 : quand la course differe, la nouvelle course est presque un nouveau tirage. Les graines ou le depart allait loin');
o.push('perdent donc souvent, celles ou il mourait tot gagnent souvent, pour TOUS les bras (la regression vers la moyenne). Ranger par l\'issue du depart');
o.push('(sa cause, sa duree) montre surtout cela ; seul le total sur les 96 graines (d palier de resume.txt) est une mesure de l\'effet.');
const texte=o.join('\n')+'\n';
fs.mkdirSync(dossierSorties,{recursive:true});
fs.writeFileSync(path.join(dossierSorties,'composantes.json'),JSON.stringify(res,null,1)+'\n');
fs.writeFileSync(path.join(dossierSorties,'composantes.txt'),texte);
process.stdout.write(texte);
if(!controlesOk){console.error('composantes : le controle de E a echoue');process.exit(2);}
