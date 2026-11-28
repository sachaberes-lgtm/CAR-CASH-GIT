/* ===== TRI PRECOCE : LES 10 PASSES DE note.js SUFFISENT-ELLES QUAND LES PILOTES N'ONT PAS LES MEMES GRAINES ? (27/11/2026, etude « tri-precoce ») =====
   Plan des courses de B4 (enfants 12 graines, anciens 4) et de C (anciens sur 0 ou 12) apres 10 generations, SANS bruit : palier = theta + b_g exactement.
   Le vrai a est connu ; on mesure l'erreur des a apres 10 passes (le reglage de note.js) et apres 200. Plan equilibre (A) en temoin : 0 attendu.
   usage : node convergence.js > convergence.txt */
'use strict';
const O=require('./outils');
const u=O.mulberry32(5),nor=O.normale(u);
function plan(nom){
  const ip=[],jg=[],y=[],theta=[],b=[];let P=0,G=0;const viv=[];
  const pil=()=>{theta.push(0.6*nor());viv.push(1);return P++;};
  const gr=()=>{b.push(2*nor());return G++;};
  let V=[];for(let i=0;i<20;i++)V.push(pil());
  for(let g=0;g<10;g++){
    const enf=[];for(let i=0;i<(g?6:0);i++)enf.push(pil());
    const S=[];for(let i=0;i<12;i++)S.push(gr());
    for(let i=0;i<12;i++){for(const p of enf){ip.push(p);jg.push(S[i]);y.push(theta[p]+b[S[i]]);}
      for(const p of V){const m=nom==='A'?12:nom==='B4'?4:(p%3===0?12:0);if(i<m){ip.push(p);jg.push(S[i]);y.push(theta[p]+b[S[i]]);}}}
    V=V.concat(enf);V.sort(()=>u()-0.5);for(const p of V.splice(20))viv[p]=0;}
  return {ip,jg,y,P,G,theta,viv};}
for(const nom of ['A','B4','C']){
  const x=plan(nom);
  for(const passes of [10,30,200]){
    const f=O.ajusterRapide(x.ip,x.jg,x.y,x.y.length,x.P,x.G,x.viv,passes,0);
    /* a est defini a une constante pres : on compare apres centrage */
    const d=[];for(let p=0;p<x.P;p++)if(f.n[p])d.push(f.a[p]-x.theta[p]);const m=O.moy(d);
    console.log(nom.padEnd(3)+' '+String(passes).padStart(3)+' passes : erreur des a, ET '+O.sd(d.map(v=>v-m)).toFixed(4)+', max '+Math.max(...d.map(v=>Math.abs(v-m))).toFixed(4)+' palier ; sigma residuel '+f.sigma.toFixed(4)+' (attendu 0)');}}
