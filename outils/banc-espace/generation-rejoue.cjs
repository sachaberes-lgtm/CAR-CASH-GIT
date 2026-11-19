/* rejoue la série du crible jusqu'au rang voulu et chronomètre la route : node generation-rejoue.cjs palier rang [search] [base=20261118] [rodage=30] */
const C=require('./generation-charge.cjs');const [p,rang,search]=process.argv.slice(2);const base=20261118,rod=30;
function graines(k,b){let a=b>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const G=[];for(let i=0;i<k;i++)G.push((f()*1e9)|0);return G;}
const M=C.creer(search||'');const G=graines(rod+(+rang)+1,base+(+p)*7919);
for(let q=0;q<G.length;q++){const r=M.route(G[q],+p);if(q>=G.length-3)console.log(q-rod,G[q],Math.round(r.ms),'ms reprises',r.reprises,r.marks0.map(m=>m.fig).join(' '));}
