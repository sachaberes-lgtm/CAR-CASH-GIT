/* ===== RELECTURE STATISTIQUE : vers quoi retrecit-on ? ā (morts compris, comme note.js) ou la moyenne des vivants =====
   Escalier mu 20, lambda 6, 12 graines par generation, bruit 3,3, b ~ N(0;1,5), vrai a ~ N(0;sa). On mesure, sur 40 generations :
   la part des nouveau-nes (24 courses) parmi les vires, contre leur part parmi les renvoyables ; et le vrai a moyen des vires. */
'use strict';
const path=require('path');
const N=require(path.join(__dirname,'..','..','note.js'));
function rng(s){let a=s|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function courir(graine,gens,sa,cible){
  const u=rng(graine),nor=()=>Math.sqrt(-2*Math.log(1-u()))*Math.cos(2*Math.PI*u());
  let id=0,gr=0;const vrais={},lignes=[];let viv=[];
  const naitre=()=>{const p='p'+(id++);vrais[p]=sa*nor();viv.push(p);};
  for(let i=0;i<20;i++)naitre();
  let nesVires=0,vires=0,nesElig=0,elig=0,ecartCible=0,k=0;
  for(let G=0;G<gens;G++){
    if(G>0)for(let i=0;i<6;i++)naitre();
    for(let i=0;i<12;i++){const g=gr++,b=1.5*nor();for(const p of viv)lignes.push({id:p,graine:g,palier:vrais[p]+b+3.3*nor(),survie_s:100,mesuree:true});}
    if(G<1)continue;
    const f=N.ajuster(lignes,{passes:10,retrecir:12});
    const n={};for(const l of lignes)n[l.id]=(n[l.id]||0)+1;
    const mv=viv.reduce((s,p)=>s+f.a[p],0)/viv.length,c=cible==='vivants'?mv:f.abar;
    if(G>5){ecartCible+=mv-f.abar;k++;}
    const ah=p=>(f.a[p]-c)*n[p]/(n[p]+12)+c;
    const E=viv.filter(p=>n[p]>=24).sort((x,y)=>ah(x)-ah(y)),M=E.slice(0,Math.max(0,viv.length-20));
    if(G>5){for(const p of E){elig++;if(n[p]===24)nesElig++;}for(const p of M){vires++;if(n[p]===24)nesVires++;}}
    const morts=new Set(M);viv=viv.filter(p=>!morts.has(p));
  }
  const vraiViv=viv.reduce((s,p)=>s+vrais[p],0)/viv.length;
  return {partNesVires:nesVires/vires,partNesElig:nesElig/elig,ecartCible:ecartCible/k,vraiViv};
}
for(const sa of [0.3,1]){
  for(const cible of ['tous','vivants']){
    let A=0,B=0,Cc=0,V=0;const R=6;
    for(let r=0;r<R;r++){const x=courir(100+r,40,sa,cible);A+=x.partNesVires;B+=x.partNesElig;Cc+=x.ecartCible;V+=x.vraiViv;}
    console.log('vrai sigma_a '+sa+', cible '+cible.padEnd(7)+' : nouveau-nes = '+(100*A/R).toFixed(1)+' % des vires pour '+(100*B/R).toFixed(1)+' % des renvoyables ; '+
      'moyenne des vivants - ā(tous) '+(Cc/R).toFixed(3)+' ; vrai a moyen des vivants a la fin '+(V/R).toFixed(3)+' ('+R+' repetitions de 40 generations)');
  }
}
