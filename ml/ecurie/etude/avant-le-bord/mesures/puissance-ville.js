#!/usr/bin/env node
/* ===== LA PUISSANCE DES 16 COURSES DE VILLE (28/11/2026, le mesureur ; ecrit AVANT de jouer les courses) =====
   Un modele grossier d'une course de ville tenue, cale sur les 8 courses de ville de la mesure d'avant (../../sortie-preparee/sorties/lignes/ville-tenue-*) :
     · 22 sorties voulues en 528 s de course : une sortie toutes les 24 s ; moitie bordees, moitie ouvertes (11 / 11) ;
     · une course meurt aussi d'autre chose (decollages subis, etc.) : 3 courses sur 8, environ une fois toutes les 176 s de course hors sorties voulues ;
     · tmax 180 s ; une mort sur une sortie voulue arrete la course.
   Pour chaque hypothese (p bordee, p ouverte), 20 000 tirages de 16 courses ; la regle de decision de prediction-ville.md :
     CONFIRMEE  : rapport (morts/sortie bordee) / (morts/sortie ouverte) >= 3 (infini si 0 mort ouverte et >= 2 morts bordees) ET Fisher unilateral p <= 0,05 ;
     REFUTEE    : rapport < 1,5 (0 mort bordee compris), avec au moins 10 sorties de chaque cote ;
     INDECISE   : le reste.
   usage : node puissance-ville.js -> puissance-ville.txt */
'use strict';
const fs=require('fs'),path=require('path');
let graine=12345;const alea=()=>{graine=(graine+0x6D2B79F5)|0;let t=Math.imul(graine^(graine>>>15),1|graine);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};   /* mulberry32 */
const lf=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s;};
const LF=[];for(let i=0;i<400;i++)LF.push(lf(i));
/* Fisher unilateral : P(X >= a) pour le tableau [[a, b-a], [c, d-c]] (morts bordees a sur b sorties, morts ouvertes c sur d) */
function fisher(a,b,c,d){const m=a+c,N=b+d;let p=0;
  for(let x=a;x<=Math.min(b,m);x++){const y=m-x;if(y>d||y<0)continue;p+=Math.exp(LF[b]-LF[x]-LF[b-x]+LF[d]-LF[y]-LF[d-y]-LF[N]+LF[m]+LF[N-m]);}return Math.min(1,p);}
function juger(a,b,c,d){
  if(b<1||d<1)return 'indecise';
  const rb=a/b,ro=c/d,rap=ro>0?rb/ro:(a>=2?Infinity:(a===0?0:1));
  if(rap>=3&&fisher(a,b,c,d)<=.05)return 'confirmee';
  if(b>=10&&d>=10&&rap<1.5)return 'refutee';
  return 'indecise';}
function course(pb,po){const T=180,autre=-176*Math.log(1-alea());let t=0;const o={b:0,o:0,mb:0,mo:0};
  for(;;){t+=-24*Math.log(1-alea());if(t>=T||t>=autre)return o;
    const borde=alea()<.5;if(borde)o.b++;else o.o++;
    if(alea()<(borde?pb:po)){if(borde)o.mb++;else o.mo++;return o;}}}
const H=[['comme la mesure d\'avant (5/11 contre 0/11, l\'ouvert mis a 0,03)',.45,.03],['rapport 6 (0,30 contre 0,05)',.30,.05],['rapport 3 (0,24 contre 0,08)',.24,.08],
  ['rapport 3, plus rare (0,15 contre 0,05)',.15,.05],['rapport 2 (0,20 contre 0,10)',.20,.10],['aucun ecart (0,15 et 0,15)',.15,.15],['aucun ecart, rare (0,08 et 0,08)',.08,.08]];
const L=[];const N=20000;
L.push('LA PUISSANCE DES 16 COURSES DE VILLE (modele grossier, '+N+' tirages par hypothese ; voir l\'en-tete de puissance-ville.js)');
for(const [mot,pb,po] of H){const c={confirmee:0,refutee:0,indecise:0};let sb=0,so=0,mb=0,mo=0;
  for(let k=0;k<N;k++){let a=0,b=0,cc=0,d=0;for(let i=0;i<16;i++){const o=course(pb,po);b+=o.b;d+=o.o;a+=o.mb;cc+=o.mo;}
    sb+=b;so+=d;mb+=a;mo+=cc;c[juger(a,b,cc,d)]++;}
  L.push('- '+mot+' : sorties attendues bordees '+(sb/N).toFixed(1)+', ouvertes '+(so/N).toFixed(1)+' ; morts attendues bordees '+(mb/N).toFixed(1)+', ouvertes '+(mo/N).toFixed(1)+
    ' ; CONFIRMEE '+(100*c.confirmee/N).toFixed(0)+' %, REFUTEE '+(100*c.refutee/N).toFixed(0)+' %, INDECISE '+(100*c.indecise/N).toFixed(0)+' %');}
fs.writeFileSync(path.join(__dirname,'sorties','puissance-ville.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
module.exports={fisher,juger};
