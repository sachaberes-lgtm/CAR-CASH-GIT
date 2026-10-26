const fs=require('fs');
const sw=fs.readFileSync('sw.js','utf8').split('\n');
const jo=fs.readFileSync('JOURNAL.md','utf8').split('\n');
const iC=sw.findIndex(l=>/^const CACHE = /.test(l));
const ancienne=sw[iC];
const mortes=[],garde=[];
sw.forEach((l,i)=>{ if(i>iC && /^\/\/ /.test(l) && /cashcar-v\d+/.test(l)) mortes.push(l); else garde.push(l); });
const n=+/cashcar-v(\d+)/.exec(ancienne)[1]+1;
const j=garde.findIndex(l=>/^const CACHE = /.test(l));
garde[j]="const CACHE = 'cashcar-v"+n+"'; /* v"+n+" (2026-10-26, Sacha : « une énorme session de debugging, de nettoyage ») index.html repassé en fins de ligne LF (le commit de la grotte l'avait converti en CRLF : +73 Ko), sw.js ramené à une ligne (47 Ko d'historique rangés au journal), clés de traduction en double retirées, quatre allocations par image retirées (trouées de nuages, mots, piment, aspiration du portail) — rien ne change à l'écran */";
const deja=new Set(jo);
const aInserer=[ '// '+ancienne ].concat(mortes).filter(l=>!deja.has(l));
const pos=jo.findIndex((l,i)=>i>20525&&/^\/\/ const CACHE = .cashcar-v646./.test(l));
if(pos<0)throw new Error('point d insertion introuvable');
/* le plus récent d'abord : l'ancienne ligne 13 de main, puis ses lignes commentées dans leur ordre */
jo.splice(pos,0,...aInserer);
fs.writeFileSync('JOURNAL.md',jo.join('\n'));fs.writeFileSync('sw.js',garde.join('\n'));
console.log('cache ->',n,'| lignes rangées au journal:',aInserer.length);
