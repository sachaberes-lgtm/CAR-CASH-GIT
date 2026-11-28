/* ===== SACRE, ETAPE G : CONTROLE DU TAUX DE FAUX SACRES DES PLANS RETENUS (2026-11-27, l'etude « sacre ») =====
   Deux simulations ne donnaient pas le meme taux de faux sacres pour seqOBF-2.2-0.5-96 (e-plans : 1,6 % sur 1 600 essais ; f-population :
   3,0 % sur 1 136 validations). On le refait a part, avec une autre graine du hasard ET le bootstrap de la vraie config (400 tirages au lieu
   de 200), pilotes egaux, modele 'evolution', regards a 24…96 graines. Chaque regard n'est calcule que si le plan en a besoin.
   usage : node g-controle-nul.js [essais=2500] [graine=99] > sorties/g-controle-nul.txt */
'use strict';
const S=require('./commun.js'),PL=require('./plans.js');
const essais=+(process.argv[2]||2500),graine=+(process.argv[3]||99);
const R=S.reserveEvolution(),rng=S.Gr.mulberry32(graine);
const VUS=['actuel (24, z>2)','seqOBF-2.2-0.5-96','seqOBF-2-0.5-96','2etages-0.5-96-2.33 +direct','2etages-1-96-2'];
const cpt={};for(const p of VUS)cpt[p]={c1:0,c2:0,g:0};
const t0=Date.now();
for(let t=0;t<essais;t++){
  const A=S.courses(R,0,96,rng),B=S.courses(R,0,96,rng);
  /* les regards paresseux : un tableau dont chaque case se calcule a la premiere lecture */
  const cache=[];const L=new Proxy([],{get:(o,k)=>{const i=+k;if(!(i>=0))return o[k];if(!cache[i]){const r=S.comparerRapide(A,B,{n:PL.REG[i],tirages:400});cache[i]=[r.dF,r.se_dF,r.dPalier,r.se_dPalier,r.dE,r.se_dE];}return cache[i];}});
  for(const p of VUS){PL.criteres(1,1);const [s,g]=PL.P[p](L);if(s)cpt[p].c1++;cpt[p].g+=g;PL.criteres(2,2);if(PL.P[p](L)[0])cpt[p].c2++;}
}
console.log('pilotes egaux, '+essais+' essais, bootstrap 400 tirages, graine '+graine+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
for(const p of VUS)console.log('  '+p.padEnd(28)+' faux sacres : (b)(c) a 1 se '+S.pct(cpt[p].c1,essais)+' '+S.wilson(cpt[p].c1,essais)+' ; a 2 se '+S.pct(cpt[p].c2,essais)+' '+S.wilson(cpt[p].c2,essais)+' ; graines jouees '+(cpt[p].g/essais).toFixed(0));
