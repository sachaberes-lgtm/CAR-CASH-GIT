const fs=require('fs');
function rep(f,vieux,neuf){const t=fs.readFileSync(f,'utf8');const n=t.split(vieux).length-1;if(n!==1)throw new Error(f+' : '+n+' occurrences de '+vieux.slice(0,60));fs.writeFileSync(f,t.replace(vieux,()=>neuf));}
/* 1. trouées de nuages : plus d'indexOf par trouée et par image, ni de propriété jamais lue, ni de closure neuve */
const A='code/maps/nuages-casses.js';
rep(A,'  for(const h of NCB.hs){ // les trouées','  for(let idx=0;idx<NCB.hs.length;idx++){const h=NCB.hs[idx]; // les trouées');
rep(A,'const u=h.t/h.d,e=function(a){return a*a*(3-2*a);};','const u=h.t/h.d,e=NU_LISSE;');
rep(A,'    NCB.hv=NCB.hv||NHOLE.uHole.value;const idx=NCB.hs.indexOf(h);NHOLE.uHole.value[idx].set(','    NHOLE.uHole.value[idx].set(');
/* 2. mots qui jaillissent : les 9 axes ne se calculent que quand un mot part */
const B='code/maps/orbite-2.js';
rep(B,'if(k>.05){const A=wowAxes(),gar=big<1;','if(k>.05){const gar=big<1;');
rep(B,'while(WOWT.acc>=1){WOWT.acc-=1;const sd=','while(WOWT.acc>=1){WOWT.acc-=1;const A=wowAxes(),sd=');
/* 3. piment : deux tableaux neufs par image pendant 7 s */
const C='code/gameplay/fruits-auras.js';
rep(C,'NINF.h=0;NINF.rgb=[255,34,8];','NINF.h=0;NINF.rgb=[255,34,8];NINF.trail=[1.6,.18,.08];');
rep(C,'NINF.rac=0xff6a58;NINF.trail=[1.6,.18,.08];}return;}','NINF.rac=0xff6a58;NINF.trail[0]=1.6;NINF.trail[1]=.18;NINF.trail[2]=.08;}return;}');
rep(C,'NINF.trail=[NINF_C.r*1.25,NINF_C.g*1.25,NINF_C.b*1.25];NINF.rgb=[Math.round(NINF_C.r*255),Math.round(NINF_C.g*255),Math.round(NINF_C.b*255)];','NINF.trail[0]=NINF_C.r*1.25;NINF.trail[1]=NINF_C.g*1.25;NINF.trail[2]=NINF_C.b*1.25;NINF.rgb[0]=Math.round(NINF_C.r*255);NINF.rgb[1]=Math.round(NINF_C.g*255);NINF.rgb[2]=Math.round(NINF_C.b*255);');
/* 4. aspiration du portail de cubes : lissage par seconde (identique à 60 i/s, juste à 30 et à 120) */
const D='code/rendu/portails.js';
rep(D,'function pcubeTick(t,kmh){','function pcubeTick(t,kmh,dt){');
rep(D,'PCUBE.asp+=(a-PCUBE.asp)*.08;','PCUBE.asp+=(a-PCUBE.asp)*(1-Math.pow(.92,(dt>0?Math.min(dt,.1):1/60)*60));');
rep('code/moteur/boucle-5-sons.js','pcubeTick(t,speedKmh);','pcubeTick(t,speedKmh,dt);');
rep(A,'function nuCasseTick(dt,t){',"const NU_LISSE=function(a){return a*a*(3-2*a);}; /* la courbe d'ouverture des trouées : créée une seule fois, plus une closure par trouée et par image */\nfunction nuCasseTick(dt,t){");
