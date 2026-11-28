/* ===== SACRE, ETAPE B : LE CODE RAPIDE REND-IL LES MEMES NOMBRES QUE note.js ? (2026-11-27, l'etude « sacre ») =====
   1. eRapide contre note.ecartFoule (E seul) sur 300 lots tires dans les vraies courses (5 a 60 parties, et des lots trop petits) ;
   2. comparerRapide contre note.comparer sur 40 paires de pilotes reels de l'etude du bruit (24 graines communes), meme generateur ;
   3. un cas ou l'on connait la reponse : deux pilotes IDENTIQUES course pour course (dF = 0, se = 0, jamais sacre) et un pilote = l'autre
      + 5 paliers a chaque course (dPalier = 5 exactement, dE = 0, sacre) ;
   4. la taille du bruit simule contre celle de l'etude : l'ecart-type de dPalier sur 24 graines (etude du bruit : 1,37 sur 12 graines, soit ~0,97 sur 24).
   usage : node b-verifier.js > sorties/b-verifier.txt */
'use strict';
const S=require('./commun.js');
const {N,Gr,CFG,REF}=S;
const rng=Gr.mulberry32(7);
const L=S.lignesBruit();
const ids=[...new Set(L.map(l=>l.id))];
const cn=Object.assign({},CFG.note,{bootstrapE:0});
/* 1 */
let maxE=0,nE=0;
for(let t=0;t<300;t++){
  const k=t<20?1+rng.entier(4):5+rng.entier(56);const M=[];for(let i=0;i<k;i++)M.push(L[rng.entier(L.length)].mesures);
  const e1=N.ecartFoule(M,REF,cn).E,e2=S.eRapide(M.filter(Boolean).map(S.vecteur));
  maxE=Math.max(maxE,Math.abs(e1-e2));nE++;}
console.log('1. E rapide contre note.ecartFoule : '+nE+' lots, plus grand ecart '+maxE.toExponential(2));
/* 2 */
for(const exact of [true,false]){S.exact(exact);
let maxD=0,acc=0;const C=[];
for(let t=0;t<40;t++){
  const i=ids[rng.entier(ids.length)];let j=ids[rng.entier(ids.length)];if(j===i)j=ids[(ids.indexOf(i)+1)%ids.length];
  const LA=L.filter(l=>l.id===i),LB=L.filter(l=>l.id===j);
  const r1=N.comparer(LA,LB,{REF,cfg:CFG});
  const MA=new Map(LA.map(l=>[l.graine,l])),MB=new Map(LB.map(l=>[l.graine,l]));
  const G=[...MA.keys()].filter(g=>MB.has(g));
  const A=G.map(g=>({p:MA.get(g).palier,v:S.vecteur(MA.get(g).mesures)})),B=G.map(g=>({p:MB.get(g).palier,v:S.vecteur(MB.get(g).mesures)}));
  const r2=S.comparerRapide(A,B,{});
  for(const k of ['dF','se_dF','dPalier','se_dPalier','dE','se_dE'])maxD=Math.max(maxD,Math.abs(r1[k]-r2[k]));
  if(r1.sacre===r2.sacre&&r1.criteres.a===r2.criteres.a&&r1.criteres.b===r2.criteres.b&&r1.criteres.c===r2.criteres.c)acc++;
  C.push(r1.dF);}
console.log('2. comparer rapide ('+(exact?'arrondi toFixed, exact':'arrondi Math.round, celui des simulations')+') contre note.comparer : 40 paires reelles, plus grand ecart sur dF/se/dPalier/dE '+maxD.toExponential(2)+', criteres identiques '+acc+'/40');}
S.exact(false);
/* 3 */
const R=S.reserveBruit();
const A=S.courses(R,7,24,rng),B=A.map(x=>({p:x.p,v:x.v})),B5=A.map(x=>({p:x.p+5,v:x.v}));
const r0=S.comparerRapide(A,B,{}),r5=S.comparerRapide(B5,A,{});
console.log('3. identiques : dF '+r0.dF+' se '+r0.se_dF+' sacre '+r0.sacre+' ; +5 paliers : dPalier '+r5.dPalier.toFixed(6)+' dE '+r5.dE+' se_dF '+r5.se_dF+' sacre '+r5.sacre);
/* 4 */
for(const mod of ['evolution','bruit','gabarit']){
  const T=S.tireur(mod),dP=[],dE=[],seF=[],seP=[];
  for(let t=0;t<2000;t++){const R=T(rng),A=S.courses(R,0,24,rng),B=S.courses(R,0,24,rng);
    let s=0;for(let i=0;i<24;i++)s+=A[i].p-B[i].p;dP.push(s/24);
    dE.push(S.eRapide(A.filter(x=>x.v).map(x=>x.v))-S.eRapide(B.filter(x=>x.v).map(x=>x.v)));
    if(t<300){const r=S.comparerRapide(A,B,{});seF.push(r.se_dF);seP.push(r.se_dPalier);}}
  const dF=dP.map((x,i)=>x-4*dE[i]);
  const m=A=>A.reduce((s,x)=>s+x,0)/A.length;
  console.log('4. modele '+mod.padEnd(9)+' (pilotes egaux, 24 graines) : ET vraie de dPalier '+S.etype(dP).toFixed(2)+', de 4 dE '+(4*S.etype(dE)).toFixed(2)+', de dF '+S.etype(dF).toFixed(2)+
    ' ; se moyenne du bootstrap : dPalier '+m(seP).toFixed(2)+', dF '+m(seF).toFixed(2)+' ; correlation dP/dE '+(()=>{const a=m(dP),b=m(dE);let x=0,y=0,z=0;for(let i=0;i<dP.length;i++){x+=(dP[i]-a)*(dE[i]-b);y+=(dP[i]-a)**2;z+=(dE[i]-b)**2;}return (x/Math.sqrt(y*z)).toFixed(2);})());}
console.log('   reference (etude du bruit) : ET de la difference de palier moyen sur 12 graines communes 1,37, soit ~0,97 sur 24 ; ET bootstrap de l\'ecart d\'un pilote sur 24 courses 0,09');
