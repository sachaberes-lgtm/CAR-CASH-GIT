/* TAILLE DES SÉRIES — node outils/banc-pieces/tailles.cjs [fichier pieces-fil.js]
   Pour chaque cas (moteur, richesse) : longueur (m), nombre de pièces et largeur de chaque série, par genre, + part des séries > 150 m. */
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'../../code/gameplay/pieces-fil.js');
const {filPlan}=new Function(fs.readFileSync(f,'utf8')+'\n;return {filPlan};')();
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const CAS=[{STR:1,rich:.88,nom:'départ'},{STR:1.45,rich:1.4,nom:'zone 1'},{STR:2.1,rich:3.4,nom:'grand moteur'}];
const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(p*a.length))]||0;};
for(const c of CAS){
  const S=[];let nb=0,L=9000,N=40;
  for(let g=1;g<=N;g++){
    const out=filPlan(mulberry32(g*131+5),{L:L,HALF:26.2,STR:c.STR,rich:c.rich,fruits:true,bloque:()=>false,s0:200});nb+=out.length;
    const m={};for(const p of out){if(!p.g)continue;const o=m[p.g]||(m[p.g]={k:p.k,a:1e9,b:-1e9,n:0,lo:1e9,hi:-1e9});o.a=Math.min(o.a,p.s);o.b=Math.max(o.b,p.s);o.n++;o.lo=Math.min(o.lo,p.l);o.hi=Math.max(o.hi,p.l);}
    for(const k in m)S.push({k:m[k].k,len:m[k].b-m[k].a,n:m[k].n,w:m[k].hi-m[k].lo});
  }
  const len=S.map(s=>s.len),n=S.map(s=>s.n);
  console.log(`== ${c.nom} (STR ${c.STR}, rich ${c.rich}) — ${(nb/N/L*1000).toFixed(1)} pièces/km, ${S.length} séries`);
  console.log(`   longueur m : médiane ${q(len,.5).toFixed(0)} · p90 ${q(len,.9).toFixed(0)} · max ${q(len,.999).toFixed(0)} · > 150 m : ${(100*len.filter(x=>x>150).length/S.length).toFixed(0)} %`);
  console.log(`   pièces/série : médiane ${q(n,.5)} · p90 ${q(n,.9)} · max ${q(n,.999)}`);
  const bk={};for(const s of S){(bk[s.k]=bk[s.k]||[]).push(s);}
  console.log('   '+Object.keys(bk).map(k=>k+' '+q(bk[k].map(s=>s.len),.5).toFixed(0)+'m/'+q(bk[k].map(s=>s.n),.5)+'p').join(' · '));
}
