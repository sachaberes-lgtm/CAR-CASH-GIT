/* essai du bac de piloter.js pour un reseau ecrit dans le fichier (aucun jeu charge) */
const {charger}=require('../../../../../bot/piloter');
const fs=require('fs'),path=require('path');
function src(nIn,nH,nOut){let s=1;const r=()=>{s=(s*16807)%2147483647;return +((s/2147483647-.5)*.2).toFixed(4);};
  const W=[];for(let i=0;i<nIn*nH+nH+nH*nOut+nOut;i++)W.push(r());
  return `const W=new Float64Array(${JSON.stringify(W)});const NI=${nIn},NH=${nH},NO=${nOut};const H=new Float64Array(NH),X=new Float64Array(NI);
module.exports={nom:'essai-nn',decide:function(v,m){for(let i=0;i<NI;i++)X[i]=Math.tanh(((v.lat||0)+i)*.01);
 for(let j=0;j<NH;j++){let a=W[NI*NH+j];for(let i=0;i<NI;i++)a+=W[j*NI+i]*X[i];H[j]=Math.tanh(a);}
 const o=[];const b=NI*NH+NH;for(let k=0;k<NO;k++){let a=W[b+NH*NO+k];for(let j=0;j<NH;j++)a+=W[b+k*NH+j]*H[j];o.push(Math.tanh(a));}
 m.n=(m.n|0)+1;return {volant:o[0],nitro:o[1]>0,manche:o[2]>0?1:o[2]<-.5?-1:0,ok:typeof Float32Array+'/'+typeof Math.exp+'/'+typeof Math.random+'/'+typeof Math.fround};}};`;}
const vue={mode:'sol',lat:3,t:1,vitesse:100,route:[{d:30,virage:.1}],x:NaN};
for(const [a,b,c] of [[40,32,6],[80,64,8],[120,128,8],[200,256,8]]){
  const S=src(a,b,c),t0=process.hrtime.bigint();const C=charger('essai-nn.js',{source:S});const tc=Number(process.hrtime.bigint()-t0)/1e6;
  C.neuve();let r;const t1=process.hrtime.bigint();for(let i=0;i<500;i++)r=C.decide(vue);const td=Number(process.hrtime.bigint()-t1)/1e6/500;
  console.log(`reseau ${a}-${b}-${c} : ${a*b+b+b*c+c} poids, source ${(S.length/1024).toFixed(0)} Ko, charger ${tc.toFixed(0)} ms, decide ${td.toFixed(3)} ms, ordre ${JSON.stringify(r)} erreurs ${C.erreurs}`);}
/* le texte de la vue, a part : son poids dans une vraie course ~2,4 Ko (README) */
const C=charger('x.js',{source:"module.exports={nom:'x',decide:function(v){try{return {t:typeof eval}}catch(e){return {e:1}}}};"});C.neuve();console.log('eval dans le bac :',JSON.stringify(C.decide(vue)));
const D=charger('y.js',{source:"module.exports={nom:'y',decide:function(v){try{return {f:Function('return 1')()}}catch(e){return {e:String(e.message).slice(0,60)}}}};"});D.neuve();console.log('Function() :',JSON.stringify(D.decide(vue)));
