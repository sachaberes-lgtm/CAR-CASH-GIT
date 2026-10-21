// node identite.cjs avant.html nouveau.html carte : le nouveau générateur, interrupteur coupé (?sans=hasard…), rend-il la piste d'avant au bit près ?
const path=require('path');const [,,a,b,carte]=process.argv;
const A=require('./charge.cjs')(path.resolve(a)),B=require('./charge.cjs')(path.resolve(b));let ko=0,n=0;
for(const pal of [0,10,25])for(const lc of [null,0])for(let g=1;g<=40;g++){const o=lc===0?{lc:0}:{};const r1=A.trace(carte,g,pal,o),r2=B.trace(carte,g,pal,Object.assign({sans:true},o));n++;
  const s1=JSON.stringify(r1.ctrl),s2=JSON.stringify(r2.ctrl);if(s1!==s2){ko++;if(ko<4)console.log('DIFF',carte,pal,lc,g,r1.ctrl.length,r2.ctrl.length);}}
console.log(carte,'identiques :',n-ko,'/',n);
