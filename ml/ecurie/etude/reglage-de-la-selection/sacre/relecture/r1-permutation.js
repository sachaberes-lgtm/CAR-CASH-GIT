/* ===== RELECTURE DE L'ETUDE « SACRE », CONTROLE 1 : LA REGLE D'AUJOURD'HUI PAR UN CHEMIN INDEPENDANT (2026-11-27, le relecteur) =====
   Ce script n'utilise NI commun.js NI le code rapide de l'auteur : il appelle le VRAI note.comparer de ml/evolution (bootstrap de 400 tirages,
   la vraie config) sur de VRAIES paires de courses jouees sur les MEMES graines (l'appariement reel est garde : meme carte, meme effet de graine,
   y compris sur les mesures qui font E).
   L'hypothese nulle est fabriquee par permutation : pour deux vrais pilotes i et j, a chaque graine on echange au hasard (pile ou face) la course
   de i et celle de j. « A » et « B » sont alors echangeables : tout sacre est faux (a un detail pres : la petite vraie difference entre i et j
   gonfle un peu le bruit, ce qui rend le test un peu plus prudent, jamais moins). Pour la puissance, on ajoute d paliers a chaque course de A
   (meme supposition que l'auteur : un meilleur pilote decale ses paliers sans changer ses mesures).
   Deux sources : 'bruit' = les 34 pilotes x 24 graines de 300 s de courses-0.json ; 'evolution' = les 7 pilotes qui ont deja 24 graines
   d'entrainement (generations 0 et 1) dans la copie figee de l'auteur (donnees/courses-2026-48.jsonl, 900 s, la vraie config).
   usage : node relecture/r1-permutation.js [essais=400] [source=bruit|evolution] > relecture/r1-<source>.txt */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..');
const N=require(path.join(RAC,'ml','evolution','note.js'));
const Gr=require(path.join(RAC,'ml','evolution','graines.js'));
const cfg=require(path.join(RAC,'ml','evolution','config.json'));
const REF=N.referenceEpoque();
const essais=+(process.argv[2]||400),source=process.argv[3]||'bruit';
const rng=Gr.mulberry32(777);

/* les pilotes et leurs courses, par graine */
let L;
if(source==='bruit'){
  L=N.depuisEtude(require(path.join(RAC,'ml','ecurie','etude','selection-naturelle','bruit','courses-0.json'))).filter(l=>l.tmax===300);
}else{
  L=fs.readFileSync(path.join(__dirname,'..','donnees','courses-2026-48.jsonl'),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x))
    .filter(l=>l.usage==='entrainement'&&l.mesuree===true&&typeof l.palier==='number');
}
const P={};for(const l of L){(P[l.id]=P[l.id]||new Map()).set(l.graine,l);}
const ids=Object.keys(P).filter(i=>P[i].size>=24);
console.log('source '+source+' : '+ids.length+' pilotes a 24 graines ou plus');

function essai(d){
  const i=ids[rng.entier(ids.length)];let j=ids[rng.entier(ids.length-1)];if(j===i)j=ids[ids.length-1];
  const G=[...P[i].keys()].filter(g=>P[j].has(g)).slice(0,24);
  const LA=[],LB=[];
  for(const g of G){let x=P[i].get(g),y=P[j].get(g);if(rng.suivant()<0.5){const t=x;x=y;y=t;}
    LA.push(Object.assign({},x,{id:'A',palier:x.palier+d}));LB.push(Object.assign({},y,{id:'B'}));}
  return N.comparer(LA,LB,{REF,cfg});}

const t0=Date.now();
for(const d of [0,1]){
  let s=0,a=0,c=0;const n=d===0?essais*2:essais;
  for(let t=0;t<n;t++){const r=essai(d);if(r.sacre)s++;if(r.criteres.a)a++;if(r.criteres.c)c++;}
  const p=s/n,se=Math.sqrt(p*(1-p)/n);
  console.log('d = +'+d+' palier : sacre '+(100*p).toFixed(1)+' % (+- '+(196*se).toFixed(1)+' a 95 %), critere (a) '+(100*a/n).toFixed(1)+' %, critere (c) '+(100*c/n).toFixed(1)+' % ; '+n+' essais ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
}
