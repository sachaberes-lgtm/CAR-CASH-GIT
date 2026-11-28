/* ===== RELECTURE DE L'ETUDE « SACRE », CONTROLE 3 : LE SEQUENTIEL SACRE-T-IL PLUS SOUVENT UN MENEUR CHOISI ? (2026-11-27, le relecteur) =====
   f-population.js (graine 4242) trouvait 3,0 % de faux sacres pour seqOBF-2.2 sur 1 136 validations de meneurs choisis (monde NUL, regle 6 a 1),
   contre 1,6 % (e-plans) et 1,8 % (g-controle-nul) pour des pilotes non choisis : un ecart de plus de 3 erreurs-types. L'auteur conclut au hasard.
   Dans la simulation, les graines de validation sont tirees independamment de l'entrainement : le choix du meneur ne PEUT pas changer ce taux,
   sauf bug. On refait le monde NUL avec d'autres graines du hasard et plus de fenetres. Meme note d'entrainement que f-population.js (recopiee).
   usage : node relecture/r3-population-nul.js [fenetres=1500] [graine=31337] > relecture/r3-population-nul.txt */
'use strict';
const S=require('../commun.js'),PL=require('../plans.js');
const fen=+(process.argv[2]||1500),graine=+(process.argv[3]||31337);
const R=S.reserveEvolution(),rng=S.Gr.mulberry32(graine),PE=S.PE,K=12;
function noteEntrainement(C){
  const n=C[0].length,a=C.map(L=>L.reduce((s,x)=>s+x.p,0)/n);
  let ss=0;for(let i=0;i<C.length;i++)for(const x of C[i])ss+=(x.p-a[i])**2;
  const sig=Math.sqrt(ss/(C.length*(n-1))),abar=a.reduce((s,x)=>s+x,0)/a.length;
  return C.map((L,i)=>{const idx=[];for(let j=0;j<n;j++)idx.push(j);const E=S.eIdx(L,idx),v=[];
    for(let t=0;t<100;t++){for(let j=0;j<n;j++)idx[j]=rng.entier(n);v.push(S.eIdx(L,idx));}
    const seE=S.etype(v),ahat=(a[i]-abar)*n/(n+K)+abar,se_a=sig/Math.sqrt(n);
    return {F:ahat-PE*E,se_F:Math.sqrt(se_a*se_a+PE*PE*seE*seE)};});}
const t0=Date.now();let V=0,s1=0,s2=0,sa=0,Vn=0,n1=0;
for(const g of [4,10])for(let t=0;t<fen;t++){
  const C=[];for(let i=0;i<20;i++)C.push(S.courses(R,0,12*g,rng));
  const N=noteEntrainement(C);let m=1;for(let i=2;i<20;i++)if(N[i].F>N[m].F)m=i;
  const A=S.courses(R,0,96,rng),B=S.courses(R,0,96,rng);
  const L=PL.REG.map(k=>{const r=S.comparerRapide(A,B,{n:k,tirages:200});return [r.dF,r.se_dF,r.dPalier,r.se_dPalier,r.dE,r.se_dE];});
  PL.criteres(1,1);const x=PL.P['seqOBF-2.2-0.5-96'](L)[0],y=PL.P['actuel (24, z>2)'](L)[0];
  /* tous les essais (meneur non filtre) */
  Vn++;if(x)n1++;
  const rap=(N[m].F-N[0].F)/Math.sqrt(N[m].se_F**2+N[0].se_F**2);
  if(rap>1){V++;if(x)s1++;if(y)sa++;}
}
console.log('monde NUL, g = 4 et 10, '+fen+' fenetres chacun, graine '+graine+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
console.log('  tous les essais : seqOBF-2.2 (criteres a 1 se) sacre '+S.pct(n1,Vn)+' '+S.wilson(n1,Vn)+' sur '+Vn);
console.log('  meneurs passes par la regle 6 a 1 : '+V+' validations ; seqOBF-2.2 '+S.pct(s1,V)+' '+S.wilson(s1,V)+' ; actuel '+S.pct(sa,V)+' '+S.wilson(sa,V));
