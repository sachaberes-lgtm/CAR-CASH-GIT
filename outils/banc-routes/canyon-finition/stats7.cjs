'use strict';/* LE TABLEAU DU TOUR 7 (2026-11-20, correction 6) : pour chaque cas (graine × vue × format) et chaque jeu (avant, AV, variantes, lot, sans), le tiers HAUT
   (L, chroma, braise 0-30°, or 30-55°, brûlé) et la MOITIÉ HAUTE pour les verdâtres sombres compris (vsom) ; puis les cibles de la correction 6, jeu par jeu :
     braise du haut : baisse d'au moins 10 points sur l'avant (« nette »)    vsom ≤ avant + 2 points
     chroma du haut ≥ 90 % de l'avant      luminance du haut à ±4 %      brûlé du cadre = 0
   node stats7.cjs <dossier> [référence=avant]   (écrit <dossier>/mesures7.json) */
const fs=require('fs'),{lit,bande,TIERS}=require('./mesure-couleurs.cjs');
const dir=process.argv[2],REF=process.argv[3]||'avant',M={};
for(const f of fs.readdirSync(dir).filter(x=>/^[A-Za-z0-9]+-g\d+-.+\.png$/.test(x))){const i=f.indexOf('-'),jeu=f.slice(0,i),cas=f.slice(i+1,-4),I=lit(dir+'/'+f);
  (M[cas]=M[cas]||{})[jeu]={haut:bande(I,...TIERS.haut),moitie:bande(I,...TIERS.moitie),tout:bande(I,...TIERS.tout)};}
fs.writeFileSync(dir+'/mesures7.json',JSON.stringify(M));
const pc=(a,b)=>(b?(100*(a-b)/b).toFixed(0):'?').padStart(4)+'%',bilan={};
for(const cas of Object.keys(M).sort()){const A=M[cas][REF];console.log('== '+cas);if(!A)continue;
  for(const j of Object.keys(M[cas]).sort((x,y)=>x===REF?-1:y===REF?1:x<y?-1:1)){const m=M[cas][j],h=m.haut;
    const ok={braise:h.rouge<=A.haut.rouge-10,vsom:m.moitie.vsom<=A.moitie.vsom+2,C:h.C>=.9*A.haut.C,L:Math.abs(h.L-A.haut.L)<=.04*A.haut.L,brule:m.tout.brule===0};
    if(j!==REF){const b=bilan[j]=bilan[j]||{n:0,braise:0,vsom:0,C:0,L:0,brule:0,dB:[],dC:[]};b.n++;for(const k in ok)if(ok[k])b[k]++;b.dB.push(h.rouge-A.haut.rouge);b.dC.push(100*(h.C-A.haut.C)/A.haut.C);}
    console.log('  '+j.padEnd(5)+' haut L '+String(h.L).padStart(5)+pc(h.L,A.haut.L)+'  C '+String(h.C).padStart(4)+pc(h.C,A.haut.C)+'  braise '+String(h.rouge).padStart(4)+'  or '+String(h.or).padStart(4)+
      '  | moitié vsom '+String(m.moitie.vsom).padStart(4)+'  | brûlé '+m.tout.brule+(j===REF?'':'  '+Object.keys(ok).filter(k=>!ok[k]).map(k=>'✗'+k).join(' ')));}}
console.log('\n== BILAN (cas tenus / cas ; écart de braise en points et de chroma en %, min..max)');
for(const j in bilan){const b=bilan[j],r=a=>Math.min(...a).toFixed(0)+'..'+Math.max(...a).toFixed(0);
  console.log('  '+j.padEnd(5)+' braise '+b.braise+'/'+b.n+'  vsom '+b.vsom+'/'+b.n+'  C '+b.C+'/'+b.n+'  L '+b.L+'/'+b.n+'  brûlé '+b.brule+'/'+b.n+'   dBraise '+r(b.dB)+'   dC '+r(b.dC)+' %');}
