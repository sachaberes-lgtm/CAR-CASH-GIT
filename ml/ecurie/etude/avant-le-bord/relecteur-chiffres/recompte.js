#!/usr/bin/env node
/* ===== LE RECOMPTE ADVERSE (28/11/2026, etude « avant le bord », le relecteur des chiffres) =====
   Refait, SANS reprendre le code des lecteurs ni des concepteurs, les comptes sur lesquels les propositions s'appuient :
   decollages subis distincts, mortels, sur decor ; les grandeurs lues au sol avant le decollage (vitesse, nitro, marge, cap, jauge, palier, ligne) ;
   le meilleur seuil (J de Youden) ; ce que le hasard seul donne quand on fouille beaucoup de grandeurs (permutations globales et par carte) ;
   la vitesse > 143 m/s ; le cote « borde » des sorties voulues de ville. Lit les traces de sortie-preparee/sorties/lignes. Aucune course.
   usage : node recompte.js > recompte.txt */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
let graineAl=12345;const alea=()=>{graineAl=(graineAl*1103515245+12345)%2147483648;return graineAl/2147483648;};
const P=s=>console.log(s);

const C=[];
for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
  const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
  C.push({nom:n.replace(/\.jsonl\.gz$/,''),h:L[0],V:L.slice(1).filter(v=>!v.erreurDiag)});}

/* les decollages, tires des evenements */
const tous=[];
for(const c of C){const ev=(c.h.ev||[]).filter(e=>['decol','pose','mort'].includes(e[1]));let tPose=-9;
  for(let i=0;i<ev.length;i++){const e=ev[i];if(e[1]==='pose'){tPose=e[0];continue;}if(e[1]!=='decol')continue;
    const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort')||null,td=e[0];
    const sol=c.V.filter(v=>v.mo==='s'&&v.t>tPose+1e-9&&v.t<td-1e-6);
    const S=sol.length?sol[sol.length-1]:null;
    const vol1=c.V.find(v=>v.mo==='v'&&v.t>td);
    const voulu=!!(S&&S.D&&S.D.so)||!!(vol1&&vol1.D&&vol1.D.vo);
    const carte=S?S.c:(vol1?vol1.c:null);
    tous.push({c,course:c.nom,graine:c.h.graine,e,td,tPose,sol,S,voulu,carte,mort:!!(fin&&fin[1]==='mort'),fin:fin?fin[1]:'tmax',cote:Math.sign(e[4])||1,cle:c.h.graine+'|'+JSON.stringify(e)+'|'+(fin?(fin[0]-td).toFixed(2):'x')});}}
const vu=new Set();for(const d of tous){d.double=vu.has(d.cle);vu.add(d.cle);}
const U=tous.filter(d=>!d.voulu&&!d.double);
P('courses '+C.length+' ; decollages (evenements) '+tous.length+' ; doublons '+tous.filter(d=>d.double).length);
P('subis distincts '+U.length+' ; mortels '+U.filter(d=>d.mort).length);
const D=U.filter(d=>DECOR[d.carte]);
P('subis sur decor '+D.length+' : morts '+D.filter(d=>d.mort).length+', poses '+D.filter(d=>d.fin==='pose').length+', tmax '+D.filter(d=>d.fin==='tmax').length);
const genres={};for(const d of tous)genres[d.e[2]]=(genres[d.e[2]]||0)+1;P('genres des decollages (tous) : '+JSON.stringify(genres));
const DD=D.filter(d=>d.fin!=='tmax');

/* grandeurs : vue au sol continue la plus recente a t <= td - recul */
function vueA(d,r){let w=null;for(const v of d.sol)if(v.t<=d.td-r+1e-6)w=v;return w;}
const RECULS=[.6,.8,1,1.5,2],G={
  v:w=>w.v, nitro:w=>w.O&&w.O.nitro!=null?(w.O.nitro?1:0):null, marge:(w,d)=>w.demi-w.lat*d.cote, capS:(w,d)=>w.cap*d.cote,
  jauge:w=>(w.n||0)+(w.r||0), pal:w=>w.pal, ligneS:(w,d)=>w.O&&w.O.ligne!=null?w.O.ligne*d.cote:null};
const FEAT=[];for(const r of RECULS)for(const g in G)FEAT.push({nom:g+'@'+r,f:d=>{const w=vueA(d,r);if(!w)return null;const x=G[g](w,d);return x==null||!isFinite(x)?null:x;}});
P('grandeurs essayees ici : '+FEAT.length+' ('+Object.keys(G).length+' x '+RECULS.length+' reculs)');
const X=FEAT.map(F=>DD.map(F.f));
const Y0=DD.map(d=>d.mort?1:0);
function J(x,y){const p=[];for(let i=0;i<x.length;i++)if(x[i]!=null)p.push([x[i],y[i]]);const nM=p.filter(a=>a[1]).length,nP=p.length-nM;if(nM<3||nP<3)return {j:0};
  p.sort((a,b)=>a[0]-b[0]);let best={j:0};let m=0,q=0;
  for(let i=0;i<p.length;i++){if(p[i][1])m++;else q++;if(i<p.length-1&&p[i+1][0]===p[i][0])continue;
    const a=m/nM-q/nP;if(Math.abs(a)>Math.abs(best.j))best={j:Math.abs(a),s:p[i][0],sens:a>0?'<=':'>',nM,nP};}return best;}
const obs=X.map((x,i)=>({nom:FEAT[i].nom,...J(x,Y0)})).sort((a,b)=>b.j-a.j);
P('\n== meilleurs J observes (sur decor, morts contre poses) ==');for(const o of obs.slice(0,10))P('  '+o.nom+' J='+o.j.toFixed(3)+' seuil '+o.sens+' '+o.s+' (morts '+o.nM+', poses '+o.nP+')');
/* permutation globale */
function permMax(perm,N){const M=[];for(let k=0;k<N;k++){const y=perm();let mx=0;for(const x of X){const j=J(x,y).j;if(j>mx)mx=j;}M.push(mx);}M.sort((a,b)=>a-b);return M;}
const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(alea()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const N=500;
const Mg=permMax(()=>shuffle(Y0),N);
P('\n== hasard (etiquettes melangees '+N+' fois, toutes cartes) : max J sur '+FEAT.length+' grandeurs : mediane '+Mg[N>>1].toFixed(3)+', 95 % '+Mg[Math.floor(N*.95)].toFixed(3)+' ; p du meilleur observe '+(Mg.filter(m=>m>=obs[0].j).length/N).toFixed(3));
/* permutation dans chaque carte */
const parC={};DD.forEach((d,i)=>{(parC[d.carte]=parC[d.carte]||[]).push(i);});
const permC=()=>{const y=Y0.slice();for(const k in parC){const I=parC[k],s=shuffle(I.map(i=>Y0[i]));I.forEach((i,j)=>y[i]=s[j]);}return y;};
const Mc=permMax(permC,N);
P('== hasard a carte egale : max J : mediane '+Mc[N>>1].toFixed(3)+', 95 % '+Mc[Math.floor(N*.95)].toFixed(3)+' ; p du meilleur observe '+(Mc.filter(m=>m>=obs[0].j).length/N).toFixed(3));
/* le seul test a carte egale de la vitesse, une grandeur nommee d'avance : rang moyen des morts dans leur carte */
function rangMoyen(x,y){let s=0,n=0;for(const k in parC){const I=parC[k].filter(i=>x[i]!=null);for(const i of I)if(y[i]){let r=0;for(const j of I)if(!y[j])r+=(x[j]<x[i])+.5*(x[j]===x[i]);const nP=I.filter(j=>!y[j]).length;if(nP){s+=r/nP;n++;}}}return n?s/n:null;}
for(const nom of ['v@2','v@1.5','v@1','v@0.6','pal@1.5','nitro@1','marge@0.6']){const i=FEAT.findIndex(F=>F.nom===nom);const o=rangMoyen(X[i],Y0);let ge=0;const NN=2000;
  for(let k=0;k<NN;k++){const r=rangMoyen(X[i],permC());if(Math.abs(r-.5)>=Math.abs(o-.5))ge++;}
  P('  rang moyen a carte egale '+nom+' = '+o.toFixed(3)+' (p bilateral '+(ge/NN).toFixed(4)+', morts lisibles '+X[i].filter((x,j)=>x!=null&&Y0[j]).length+')');}
/* rapport vitesse / palier : la vitesse au-dela de la mediane des poses du meme palier */
{const i=FEAT.findIndex(F=>F.nom==='v@1.5'),ip=FEAT.findIndex(F=>F.nom==='pal@1.5');const med={};
  DD.forEach((d,j)=>{if(X[i][j]!=null&&!Y0[j])(med[X[ip][j]]=med[X[ip][j]]||[]).push(X[i][j]);});
  const m=k=>{const a=(med[k]||[]).slice().sort((a,b)=>a-b);return a.length?a[a.length>>1]:null;};
  const x=DD.map((d,j)=>X[i][j]!=null&&m(X[ip][j])!=null?X[i][j]-m(X[ip][j]):null);
  const o=rangMoyen(x,Y0);let ge=0;for(let k=0;k<2000;k++){if(Math.abs(rangMoyen(x,permC())-.5)>=Math.abs(o-.5))ge++;}
  P('  v@1.5 moins la mediane des poses du meme palier : rang moyen '+o.toFixed(3)+' p '+(ge/2000).toFixed(4));}

/* vitesse > 143 a 1,5 s, carte par carte */
P('\n== v@1.5 > 143, par carte (morts dessus/dessous ; poses dessus/dessous) ==');
{const i=FEAT.findIndex(F=>F.nom==='v@1.5');const T={};DD.forEach((d,j)=>{const x=X[i][j];if(x==null)return;const t=T[d.carte]=T[d.carte]||[0,0,0,0];t[(Y0[j]?0:2)+(x>143?0:1)]++;});
  for(const k in T)P('  '+k+' : '+T[k][0]+'/'+T[k][1]+' ; '+T[k][2]+'/'+T[k][3]);}

/* exposition : vues au sol sur decor > 143 ; morts par vue */
{let n=0,h=0;for(const c of C){if(/^libre-(3970400|3970585|3970659)$/.test(c.nom))continue;for(const v of c.V)if(v.mo==='s'&&DECOR[v.c]){n++;if(v.v>143)h++;}}
  P('\nvues au sol sur decor (sans les 3 libres doublons) : '+n+', dont > 143 : '+h+' ('+(100*h/n).toFixed(1)+' %)');}

/* hors echantillon : seuil choisi sur 7 graines, compte sur la 8e */
P('\n== seuil de v@1.5 choisi sur 7 graines, compte sur la 8e ==');
{const i=FEAT.findIndex(F=>F.nom==='v@1.5');const gr=[...new Set(DD.map(d=>d.graine))].sort();let tot=[0,0,0,0];
  for(const g of gr){const tr=DD.map((d,j)=>d.graine!==g?X[i][j]:null),te=DD.map((d,j)=>d.graine===g?X[i][j]:null);const b=J(tr,Y0);
    const t=[0,0,0,0];te.forEach((x,j)=>{if(x==null)return;t[(Y0[j]?0:2)+(x>b.s?0:1)]++;});tot=tot.map((a,k)=>a+t[k]);
    P('  graine '+g+' : seuil > '+b.s+' ('+b.sens+') ; test morts '+t[0]+'/'+t[1]+' poses '+t[2]+'/'+t[3]);}
  P('  total test : morts dessus/dessous '+tot[0]+'/'+tot[1]+' ; poses '+tot[2]+'/'+tot[3]+' ; part de morts dessus '+(tot[0]/(tot[0]+tot[2])*100).toFixed(1)+' %, dessous '+(tot[1]/(tot[1]+tot[3])*100).toFixed(1)+' %');}

/* sorties voulues de ville : le cote est-il « borde » (rien ET plane en choc) a l'engagement ? */
P('\n== sorties voulues (distinctes), cote borde a la vue d\'engagement ==');
{const V=tous.filter(d=>d.voulu&&!d.double);const T={};
  for(const d of V){const so=d.S&&d.S.D&&d.S.D.so;if(!so){(T[d.carte+'|sans so']=T[d.carte+'|sans so']||[0,0])[0]++;continue;}
    let eng=null;for(const w of d.sol)if(w.D&&w.D.so&&w.D.so.t0===so.t0){eng=w;break;}
    const X_=eng?(so.c>0?eng.Sg:eng.Sd):null,R=X_&&Array.isArray(X_.R)?X_.R:null;
    const f=m=>R&&R.find(r=>r&&r.m===m);const b=R?(f('rien')&&f('plane')&&f('rien').i==='choc'&&f('plane').i==='choc'?'borde':'ouvert'):'sans rayons';
    const k=(DECOR[d.carte]?d.carte:'autre')+'|'+(so.d?'dessous':'raccourci')+'|'+b;(T[k]=T[k]||[0,0]);T[k][0]++;if(d.mort)T[k][1]++;}
  for(const k of Object.keys(T).sort())P('  '+k+' : '+T[k][0]+' vols, '+T[k][1]+' morts');
  P('  (sorties voulues distinctes : '+V.length+', morts '+V.filter(d=>d.mort).length+')');}
