/* ===== RELECTURE STATISTIQUE (27/11/2026, relecteur) : un petit cas refait a la main, puis la convergence des 10 passes ===== */
'use strict';
const path=require('path');
const N=require(path.join(__dirname,'..','..','note.js'));

/* --- 1. Le cas a la main : sans bruit, a = {P1:5, P2:7, P3:9}, b = {g1:+1, g2:-1, g3:0} (moyenne de b nulle).
   Plan en escalier : P1 court g1 g2 ; P2 court g1 g2 g3 ; P3 court g2 g3. palier = a + b exactement. */
const vrai={a:{P1:5,P2:7,P3:9},b:{1:1,2:-1,3:0}};
const plan={P1:[1,2],P2:[1,2,3],P3:[2,3]};
const L=[];for(const p in plan)for(const g of plan[p])L.push({id:p,graine:g,palier:vrai.a[p]+vrai.b[g],survie_s:100,mesuree:true});
for(const passes of [1,2,10,200]){
  const f=N.ajuster(L,{passes,retrecir:12});
  console.log('passes '+String(passes).padStart(3)+' : a '+['P1','P2','P3'].map(p=>p+' '+f.a[p].toFixed(4)).join(' ')+' ; b '+[1,2,3].map(g=>f.b[g].toFixed(4)).join(' ')+' ; sigmaRes '+f.sigmaRes.toExponential(2));
}
/* a la main : la solution exacte est a = 5,7,9 ; ā = 7 ; â_P1 = (5-7)*2/14+7 = 6,7143 ; â_P2 = (7-7)*3/15+7 = 7 ; â_P3 = (9-7)*2/14+7 = 7,2857 */
const f=N.ajuster(L,{passes:200,retrecir:12});
console.log('retrecissement (200 passes) : '+['P1','P2','P3'].map(p=>p+' '+f.ahat[p].toFixed(4)).join(' ')+' (a la main : 6.7143 7.0000 7.2857)');

/* --- 2. L'escalier reel : mu 20, lambda 6, 12 graines neuves par generation, renvoi des 6 plus bas parmi ceux d'au moins 24 courses.
   Vrai a ~ N(0,1), b ~ N(0,1,5), bruit 3,3. On compare les a de 10 passes a ceux de 3000 passes (convergence), sur les vivants. */
function rng(s){let a=s|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function simuler(graine,gens){
  const u=rng(graine),nor=()=>Math.sqrt(-2*Math.log(1-u()))*Math.cos(2*Math.PI*u());
  let id=0,gr=0;const vrais={},lignes=[];let viv=[];
  const naitre=()=>{const p='p'+(id++);vrais[p]=nor();viv.push(p);};
  for(let i=0;i<20;i++)naitre();
  for(let G=0;G<gens;G++){
    if(G>0)for(let i=0;i<6;i++)naitre();
    const graines=[];for(let i=0;i<12;i++){const g=gr++;graines.push({g,b:nor()*1.5});}
    for(const {g,b} of graines)for(const p of viv)lignes.push({id:p,graine:g,palier:vrais[p]+b+3.3*nor(),survie_s:100,mesuree:true});
    if(G>0){const f=N.ajuster(lignes,{passes:10,retrecir:12});
      const n={};for(const l of lignes)n[l.id]=(n[l.id]||0)+1;
      const elig=viv.filter(p=>n[p]>=24).sort((x,y)=>f.ahat[x]-f.ahat[y]);
      const morts=new Set(elig.slice(0,Math.max(0,viv.length-20)));viv=viv.filter(p=>!morts.has(p));}
  }
  return {lignes,viv,vrais};
}
for(const gens of [10,30,60]){
  const S=simuler(7,gens);
  const f10=N.ajuster(S.lignes,{passes:10,retrecir:12}),fX=N.ajuster(S.lignes,{passes:3000,retrecir:12});
  let maxd=0;for(const p of S.viv)maxd=Math.max(maxd,Math.abs(f10.a[p]-fX.a[p]));
  /* l'ecart a la solution exacte en termes de rang : combien de paires de vivants sont classees a l'envers */
  let inv=0,tot=0;for(let i=0;i<S.viv.length;i++)for(let j=i+1;j<S.viv.length;j++){const x=S.viv[i],y=S.viv[j];tot++;if(Math.sign(f10.ahat[x]-f10.ahat[y])!==Math.sign(fX.ahat[x]-fX.ahat[y]))inv++;}
  /* ā (tous, morts compris) contre la moyenne des vivants */
  const mv=S.viv.reduce((s,p)=>s+fX.a[p],0)/S.viv.length;
  console.log('escalier '+gens+' generations : '+S.lignes.length+' lignes, |a10 - a_exact| max sur les vivants '+maxd.toFixed(4)+', paires inversees '+inv+'/'+tot+
    ' ; ā (morts compris) '+fX.abar.toFixed(3)+' contre moyenne des vivants '+mv.toFixed(3)+' (ecart '+(mv-fX.abar).toFixed(3)+')'+
    ' ; penalite d\'un nouveau-ne moyen a 24 courses : '+((mv-fX.abar)*12/36).toFixed(3)+' palier');
}
