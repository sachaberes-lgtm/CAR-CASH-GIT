'use strict';/* LE TABLEAU DU TOUR 5 (2026-11-19) : pour chaque jeu (avant, lot, variantes) et chaque cas (graine × vue × format), le tiers HAUT de l'image
   (parois et ciel) et le cadre entier, en écart à l'avant ; puis les cibles du soir tenues ou non, par variante.
   Cibles : R−B du haut ≤ 100 en course, ov < 50 %, chroma du haut ≥ 90 % de l'avant, L à ±3 %, pas de kaki (vert ≤ avant + 1 point).
   node stats5.cjs <dossier>   (écrit aussi <dossier>/mesures5.json) */
const fs=require('fs'),{lit,bande,TIERS}=require('./mesure-couleurs.cjs');
const dir=process.argv[2],M={};
for(const f of fs.readdirSync(dir).filter(x=>/^[A-Za-z0-9]+-g\d+-.+\.png$/.test(x))){const i=f.indexOf('-'),jeu=f.slice(0,i),cas=f.slice(i+1,-4),I=lit(dir+'/'+f);
  (M[cas]=M[cas]||{})[jeu]={haut:bande(I,...TIERS.haut),tout:bande(I,...TIERS.tout),bas:bande(I,...TIERS.bas)};}
fs.writeFileSync(dir+'/mesures5.json',JSON.stringify(M));
const jeux=[...new Set(Object.values(M).flatMap(o=>Object.keys(o)))].sort((a,b)=>(a==='avant'?-1:b==='avant'?1:a==='lot'?-1:b==='lot'?1:a<b?-1:1));
const pc=(a,b)=>(b?(100*(a-b)/b).toFixed(0):'?').padStart(4)+'%';
const bilan={};
for(const cas of Object.keys(M).sort()){const A=M[cas].avant;console.log('== '+cas);if(!A)continue;
  for(const j of jeux){const m=M[cas][j];if(!m)continue;const h=m.haut,t=m.tout;
    const course=/roule/.test(cas),ok={C:h.C>=.9*A.haut.C,L:Math.abs(h.L-A.haut.L)<=.03*A.haut.L,RmB:!course||h.RmB<=100,ov:!course||h.ov<50,vert:h.vert<=A.haut.vert+1};
    if(j!=='avant'){const b=bilan[j]=bilan[j]||{n:0,C:0,L:0,RmB:0,ov:0,vert:0,dC:[],dL:[]};b.n++;for(const k in ok)if(ok[k])b[k]++;b.dC.push(100*(h.C-A.haut.C)/A.haut.C);b.dL.push(100*(h.L-A.haut.L)/A.haut.L);}
    console.log('  '+j.padEnd(5)+' haut L '+String(h.L).padStart(5)+pc(h.L,A.haut.L)+'  C '+String(h.C).padStart(4)+pc(h.C,A.haut.C)+'  R-B '+String(h.RmB).padStart(4)+'  ov '+String(h.ov).padStart(4)+
      '  rouge '+String(h.rouge).padStart(4)+'  or '+String(h.or).padStart(4)+'  vert '+String(h.vert).padStart(4)+'  brule '+h.brule+'  | tout L '+t.L+pc(t.L,A.tout.L)+' C '+t.C+pc(t.C,A.tout.C)+' brule '+t.brule+
      (j==='avant'?'':'  '+Object.keys(ok).filter(k=>!ok[k]).map(k=>'✗'+k).join(' ')));}}
console.log('\n== BILAN (cas tenus / cas ; écart de chroma et de luminance du haut, min..max)');
for(const j in bilan){const b=bilan[j],r=a=>Math.min(...a).toFixed(0)+'..'+Math.max(...a).toFixed(0);
  console.log('  '+j.padEnd(5)+' C '+b.C+'/'+b.n+'  L '+b.L+'/'+b.n+'  R-B '+b.RmB+'/'+b.n+'  ov '+b.ov+'/'+b.n+'  vert '+b.vert+'/'+b.n+'   dC '+r(b.dC)+' %   dL '+r(b.dL)+' %');}
