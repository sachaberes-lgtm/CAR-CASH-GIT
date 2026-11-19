/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — la série (2026-11-18, rôle « generation ») =====
   node outils/banc-espace/generation-crible.cjs search='?sans=uniques' paliers=0,10,20,27 n=300 rodage=30 base=20261118 sortie=passation/espace-debug/data/x.jsonl [lent=1] [frais=0]
   Une série = un vm par palier ; 30 routes de rodage puis n routes DE SUITE (le sac, ORB_PIOCHE, OU, OU_FORMES se souviennent, comme dans une partie).
   frais=1 : la mémoire remise à zéro avant chaque route (une route = une première route). Graines : (rand·1e9)|0 comme le jeu. */
const path=require('path'),fs=require('fs');
const C=require('./generation-charge.cjs'),Me=require('./generation-mesure.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const search=arg('search',''),PAL=arg('paliers','0').split(',').map(Number),n=+arg('n',300),rod=+arg('rodage',30),base=+arg('base',20261118),lent=+arg('lent',1),frais=arg('frais','0')==='1';
const sortie=path.resolve(__dirname,'../..',arg('sortie','passation/espace-debug/data/crible.jsonl'));fs.mkdirSync(path.dirname(sortie),{recursive:true});
const fd=fs.openSync(sortie,'a');
function graines(k,b){let a=b>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const G=[];for(let i=0;i<k;i++)G.push((f()*1e9)|0);return G;}
for(const p of PAL){const M=C.creer(search,{lent});const G=graines(rod+n,base+p*7919);const t0=Date.now();
  for(let q=0;q<G.length;q++){if(frais)M.raz();const r=M.route(G[q],p);if(q<rod)continue;let d=null,e2=null;try{d=M.dalle(r);}catch(e){e2=String(e.stack||e).slice(0,300);}
    const o=Me.mesure(r,d,p);o.search=search;o.lent=lent;o.rang=q-rod;if(e2)o.errDalle=e2;fs.writeSync(fd,JSON.stringify(o)+'\n');
    if((q-rod)%50===49)console.error('p'+p,search,q-rod+1,'/',n,Math.round((Date.now()-t0)/1000)+' s');}}
fs.closeSync(fd);
