/* ===== SACRE, ETAPE D : LES « REGARDS » D'UNE VALIDATION, GRAINE APRES GRAINE (2026-11-27, l'etude « sacre ») =====
   Pour comparer des plans de validation sur les MEMES tirages (nombres aleatoires communs), on tire une fois, pour chaque essai, 96 graines
   neuves jouees par le meneur et par le champion, et l'on garde note.comparer (recode, commun.js) sur les 24, 36, 48, … 96 premieres :
   [dF, se_dF, dPalier, se_dPalier, dE, se_dE] (les criteres (b) et (c) se recalculent, avec d'autres seuils si l'on veut). Les plans (e-plans.js) ne font que relire ces regards.
   Cas : un meneur qui vaut vraiment d paliers de plus et dont E vaut e de plus que le champion (e < 0 : il ressemble PLUS aux joueurs).
   Le bootstrap des regards a 200 tirages (la config en a 400 : c-sacre-actuel.js a 400 sert de controle ; e-plans.js compare les deux a 24 graines).
   usage : node d-regards.js <modele: evolution|bruit|gabarit> [essais_nul=2000] [essais_autres=1000] > sorties/d-regards-<modele>.txt
           ecrit sorties/regards-<modele>.json */
'use strict';
const fs=require('fs'),path=require('path');
const S=require('./commun.js');
const modele=process.argv[2]||'evolution',nNul=+(process.argv[3]||2000),nAutre=+(process.argv[4]||1000);
const T=S.tireur(modele),rng=S.Gr.mulberry32(161+modele.length);
const REG=[];for(let n=24;n<=96;n+=12)REG.push(n);
const CAS=[[0,0,nNul],[-1,0,nAutre],[-0.5,0,nAutre],[0.5,0,nAutre],[1,0,nAutre],[2,0,nAutre],[3,0,Math.round(nAutre/2)],
  [1,0.25,Math.round(nAutre/2)],[0,-0.25,Math.round(nAutre/2)],[0,-0.125,Math.round(nAutre/2)],[2,0.25,Math.round(nAutre/2)],[2,0.1,Math.round(nAutre/2)],[-0.5,-0.25,Math.round(nAutre/2)]];
const t0=Date.now(),sortie={modele,regards:REG,tirages:200,cas:[]};
for(const [d,e,n] of CAS){
  const essais=[];
  for(let t=0;t<n;t++){
    const R=T(rng),A=S.courses(R,d,96,rng),B=S.courses(R,0,96,rng);
    const L=[];
    for(const k of REG){const r=S.comparerRapide(A,B,{n:k,tirages:200,decalageE:e});
      L.push([r.dF,r.se_dF,r.dPalier,r.se_dPalier,r.dE,r.se_dE].map(x=>+x.toFixed(4)));}
    essais.push(L);}
  sortie.cas.push({d,e,essais});
  console.log('cas d='+d+' e='+e+' : '+n+' essais ('+((Date.now()-t0)/1000).toFixed(0)+' s)');}
fs.writeFileSync(path.join(__dirname,'sorties','regards-'+modele+'.json'),JSON.stringify(sortie));
console.log('ecrit sorties/regards-'+modele+'.json');
