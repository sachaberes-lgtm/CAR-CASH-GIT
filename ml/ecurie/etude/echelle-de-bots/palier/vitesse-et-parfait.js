/* LA VITESSE PAR PALIER ET LE PILOTE PARFAIT — un CALCUL sur les formules du jeu, pas une mesure. Aucune course jouee.
   Sources : ENGINE_TIERS (code/gameplay/pickups-fruits.js:557), engLate (code/gameplay/camera.js:317), maxSp (code/moteur/boucle-1.js:183),
   SPD=0,48 (code/gameplay/gravite-orbite.js:21), croisiere ~2,75 x maxSp (camera.js:296, vPalier), densite (ml/ecurie/etude/economie.md :
   min(0,24 ; 2,15*30*rich^1,2/1000) par m, rich=clamp(0,88+0,52*zones;0,88;3,4)), main clavier (ml/bot/doigts.js:113 : volant 120/200/320 ms,
   suivi 150 ms, decision toutes les 6 images). La longueur d'une zone entre deux portails N'EST PAS lue dans le code : 7 et 11 km sont deux
   hypotheses (notes de passation citees par economie.md, non verifiees). La nitro (vitMult jusqu'a x2,6) est laissee de cote. */
const fs=require('fs');
const src=fs.readFileSync('code/gameplay/pickups-fruits.js','utf8'),a=src.indexOf('const ENGINE_TIERS=['),b=src.indexOf('];',a);
const T=[...src.slice(a,b).matchAll(/coins:\s*(\d+),\s*push:([\d.]+)/g)].map(m=>({coins:+m[1],push:+m[2]}));
const SPD=0.48,MAXKMH=190,late=t=>1+Math.min(.5,Math.max(0,t-8)*.035);
const crois=t=>2.75*MAXKMH/3.6*late(t)*T[t].push*SPD; /* m de piste par seconde, sans nitro */
const LAT=0.1+0.2+0.15; /* s : une decision (100 ms) + reaction mediane du volant (200 ms) + retard du suivi (150 ms) */
console.log('palier | seuil | push | late | facteur | croisiere m/s | km/h affiches | m parcourus en',LAT,'s');
for(let t=0;t<30;t++){const v=crois(t);if(t%1===0)console.log([t+1,T[t].coins,T[t].push,late(t).toFixed(3),(late(t)*T[t].push).toFixed(2),v.toFixed(0),(v*3.6).toFixed(0),(v*LAT).toFixed(0)].join(' | '));}
const dens=z=>Math.min(.24,2.15*30*Math.pow(Math.min(3.4,Math.max(.88,.88+.52*z)),1.2)/1000);
console.log('densite par zone (pieces/km) :',[0,1,2,3,4,5].map(z=>(dens(z)*1000).toFixed(0)).join(' '));
/* le pilote parfait : ne meurt jamais, prend une part `k` des pieces de la route, roule a la croisiere de son palier, sans figures ni nitro */
function parfait(Lkm,k){let t=0,x=0,c=0,tier=0;const dt=0.5,out={};
  while(t<3600){const z=Math.floor(x/(Lkm*1000)),v=crois(tier);x+=v*dt;c+=dens(z)*v*dt*k;t+=dt;
    while(tier<29&&c>=T[tier+1].coins)tier++;for(const p of [10,20,30])if(tier+1>=p&&out[p]==null)out[p]=+(t/60).toFixed(1);if(tier===29)break;}
  return out;}
for(const L of [7,11])for(const k of [1,.5,.25])console.log(`zone ${L} km, part ramassee ${k*100} % : minutes pour P10/P20/P30`,JSON.stringify(parfait(L,k)));
