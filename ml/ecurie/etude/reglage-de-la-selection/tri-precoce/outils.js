/* ===== TRI PRECOCE : LES OUTILS COMMUNS (27/11/2026, etude « tri-precoce ») =====
   - le hasard (mulberry32, comme ml/evolution/graines.js) et une loi normale ;
   - les residus reels (residus.json, ecrit par mesurer.js) et le temps reel d'une course selon son palier (lu dans la copie figee des courses) ;
   - ajusterRapide : le MEME modele pilote + graine que ml/evolution/note.js (ajuster : moindres carres alternes, a d'abord, b ensuite, b centre et la
     constante rendue aux a, 10 passes, retrecissement vers la moyenne des VIVANTS avec k = 12), sur des tableaux, sans la survie : 30 fois plus
     rapide. verifier.js controle qu'il rend les memes nombres que note.js sur les vraies courses. */
'use strict';
const fs=require('fs'),path=require('path');

function mulberry32(s){let a=s>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function normale(u){return ()=>Math.sqrt(-2*Math.log(1-u()))*Math.cos(2*Math.PI*u());}

const R=JSON.parse(fs.readFileSync(path.join(__dirname,'residus.json'),'utf8'));

/* le temps de calcul moyen d'une course (s) selon son palier, mesure sur les vraies courses (gen. 0 et 1) ; au-dela des paliers vus : la droite */
function tableTemps(){
  const L=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
    .filter(l=>l.usage==='entrainement'&&l.mesuree===true&&l.ms>0);
  const S={},N={};for(const l of L){S[l.palier]=(S[l.palier]||0)+l.ms/1000;N[l.palier]=(N[l.palier]||0)+1;}
  const T=[];for(let p=0;p<=40;p++){if(N[p]>=5)T[p]=S[p]/N[p];else T[p]=null;}
  return {T,N,S,lignes:L.length};
}
const TT=tableTemps();
function tempsDe(palierReel){
  const p=Math.max(1,Math.round(palierReel));
  if(TT.T[p]!=null)return TT.T[p];
  return Math.max(TT.T[1]||5,R.tempsOrigine+R.tempsPente*p);
}

/* le modele pilote + graine de note.js, sur des tableaux. ip[k], jg[k], y[k] : pilote, graine, palier de la course k (N courses).
   P pilotes, G graines. vivant[p] : 1 si p est vivant (le centre du retrecissement). Rend a, b, n, ahat, sigma. */
function ajusterRapide(ip,jg,y,N,P,G,vivant,passes,kRet){
  passes=passes||10;kRet=kRet==null?12:kRet;
  const a=new Float64Array(P),b=new Float64Array(G),n=new Float64Array(P),m=new Float64Array(G),sa=new Float64Array(P),sb=new Float64Array(G);
  for(let k=0;k<N;k++){n[ip[k]]++;m[jg[k]]++;}
  let nP=0,nG=0;for(let p=0;p<P;p++)if(n[p]>0)nP++;for(let g=0;g<G;g++)if(m[g]>0)nG++;
  for(let t=0;t<passes;t++){
    sa.fill(0);for(let k=0;k<N;k++)sa[ip[k]]+=y[k]-b[jg[k]];for(let p=0;p<P;p++)a[p]=n[p]?sa[p]/n[p]:0;
    sb.fill(0);for(let k=0;k<N;k++)sb[jg[k]]+=y[k]-a[ip[k]];for(let g=0;g<G;g++)b[g]=m[g]?sb[g]/m[g]:0;
    let c=0;for(let g=0;g<G;g++)if(m[g])c+=b[g];c=nG?c/nG:0;for(let g=0;g<G;g++)if(m[g])b[g]-=c;for(let p=0;p<P;p++)if(n[p])a[p]+=c;}
  let ssr=0;for(let k=0;k<N;k++){const r=y[k]-a[ip[k]]-b[jg[k]];ssr+=r*r;}
  const sigma=Math.sqrt(ssr/Math.max(1,N-nP-nG+1));
  let s=0,c=0;for(let p=0;p<P;p++)if(vivant[p]&&n[p]>0){s+=a[p];c++;}
  if(!c)for(let p=0;p<P;p++)if(n[p]>0){s+=a[p];c++;}
  const abar=s/c,ahat=new Float64Array(P);
  for(let p=0;p<P;p++)ahat[p]=n[p]?(a[p]-abar)*n[p]/(n[p]+kRet)+abar:abar;
  return {a,b,n,ahat,sigma,abar};
}

const moy=A=>A.length?A.reduce((x,y)=>x+y,0)/A.length:NaN;
const sd=A=>{const m=moy(A);return Math.sqrt(A.reduce((s,x)=>s+(x-m)*(x-m),0)/Math.max(1,A.length-1));};
const cor=(A,B)=>{const ma=moy(A),mb=moy(B);let s=0,sa=0,sb=0;for(let i=0;i<A.length;i++){s+=(A[i]-ma)*(B[i]-mb);sa+=(A[i]-ma)**2;sb+=(B[i]-mb)**2;}return sa&&sb?s/Math.sqrt(sa*sb):NaN;};
const rang=A=>{const I=A.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=new Array(A.length);I.forEach((p,k)=>r[p[1]]=k);return r;};
const spear=(A,B)=>cor(rang(A),rang(B));
/* la fonction de repartition de la loi normale (Abramowitz-Stegun 7.1.26, erreur < 1,5e-7) */
function Phi(x){const t=1/(1+0.3275911*Math.abs(x)/Math.SQRT2),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x/2);return x>=0?(1+y)/2:(1-y)/2;}

module.exports={mulberry32,normale,R,TT,tempsDe,ajusterRapide,moy,sd,cor,spear,Phi};
