// chronomètre la génération de la pelote hors vm (comme dans le jeu) : node natif.cjs <palier> [index.html]
const fs=require('fs');global.THREE=require(require('path').join(__dirname,'../../VERSION PRINCIPALE/vendor/three.min.js'));
global.mulberry32=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}};
global.GAPMARK=[];global.CAMPM=[];global.MODMARK=[];global.FORET={};global.ROAD_HALF=28;
const P=+(process.argv[2]||0),PUSH=[1.00,1.06,1.12,1.19,1.26,1.34,1.42,1.50,1.59,1.68,1.78,1.88,1.99,2.10,2.21,2.33,2.45,2.58,2.71,2.85,2.99,3.13,3.28,3.44,3.60,3.76,3.90,4.02,4.12,4.20];
const engLate=u=>1+Math.min(.5,Math.max(0,u-8)*.035),vPal=(()=>{const u=Math.min(PUSH.length-1,(P|0)+2);return 2.75*190/3.6*engLate(u)*PUSH[u]*.48;})();
global.lvPiste=()=>1+(vPal-70)/100;
const h=fs.readFileSync(process.argv[3]||'C:/Users/sacha/Documents/GitHub/CAR-CASH-GIT/VERSION PRINCIPALE/index.html','utf8');
(0,eval)(h.slice(h.indexOf('/* ---------------- LA ROUTE v3'),h.indexOf("/* ---------------- L'ATELIER DES ARBRES"))+';global.genForet=genForet;');
let tt=0;for(let g=1;g<=12;g++){const t=performance.now();genForet(mulberry32(g*7919+13));const d=performance.now()-t;tt+=d;console.log('g'+g,d.toFixed(0)+' ms',JSON.stringify(FORET.pel));}
console.log('moyenne',(tt/12).toFixed(0),'ms');
