/* ===== LES AUTOROUTES DU MONDE : DES PLANS DE L'ATELIER AU JEU (2026-11-15) =====
   node outils/banc-autoroute/monde.cjs se,ch,kr,uk,fr,no,jp,za,my,au
   Recolle les plans `outils/banc-autoroute/pays/<xx>.js` (ceux que le banc injecte) dans `code/rendu/autoroute-monde.js`, le morceau du jeu :
   `arPaysDef(` y devient `arpInscrit(` (le plan entre dans le tirage). L'ordre de la liste est l'ordre du tirage : on AJOUTE À LA FIN, sinon
   une même graine ne donne plus la même route. Ensuite : node code/assembler.cjs --depuis-morceaux. */
const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'..','..'),codes=(process.argv[2]||'').split(',').filter(Boolean);
if(!codes.length){console.error('donner la liste des pays');process.exit(1);}
let out="/* ===== LES AUTOROUTES DU MONDE : LES PLANS DU JEU (2026-11-15, Sacha : « une dizaine en plus, d'autres pays ; discret mais visible ; garde les mieux notées ») =====\n"+
"   Un plan par pays, écrit avec l'outillage de rendu/autoroute-pays.js (K.trait, K.plot, K.motif, K.poteaux, K.dessin, K.decal…). `arpInscrit` le met dans le\n"+
"   tirage de la piste (arpTirage) : à parts égales avec l'américaine, sur toutes les maps. ⚠ On AJOUTE À LA FIN : l'ordre est celui du tirage.\n"+
"   Essayer : ?pays=xx (xx = "+codes.join(', ')+" ; us = l'américaine), dbgPays('xx') en course. Banc : outils/banc-autoroute/pays.cjs.\n"+
"   Ce morceau est RECOLLÉ par outils/banc-autoroute/monde.cjs depuis outils/banc-autoroute/pays/ : retoucher là-bas, puis relancer. */\n";
for(const c of codes){let t=fs.readFileSync(path.join(__dirname,'pays',c+'.js'),'utf8').replace(/\r\n/g,'\n').trim();
  const n=(t.match(/arPaysDef\(/g)||[]).length;if(n!==1){console.error(c+' : '+n+' appel(s) à arPaysDef, il en faut un');process.exit(1);}
  out+=t.replace('arPaysDef(','arpInscrit(')+'\n';}
fs.writeFileSync(path.join(R,'code','rendu','autoroute-monde.js'),out);console.log(codes.length+' plans, '+out.length+' octets');
