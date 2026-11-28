/* ===== LE PALIER 30 EST-IL A PORTEE EN 900 s ? (28/11/2026, lecteur de la selection) =====
   Lecture seule. Lit les seuils de ENGINE_TIERS par ml/bot/mesures.js (palierDe) et les lignes de courses donnees en argument :
   pieces par seconde de survie, et ce que cela donnerait au bout de 900 s. Usage : node <ce fichier> <courses.jsonl> [...] */
'use strict';
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','..','..','..','..','code','gameplay','pickups-fruits.js'),'utf8');
const M=require(path.join(__dirname,'..','..','..','..','bot','mesures.js'));
/* les seuils : la plus petite quantite de pieces qui donne chaque palier */
const seuils=[];let p=0;for(let n=0;n<2e7&&seuils.length<30;n+= (n<1000?1:n<100000?10:1000)){const k=M.palierDe?M.palierDe(n):null;if(k==null)break;if(k>p){seuils.push([k,n]);p=k;}}
console.log('seuils (palier : pieces, a la granularite du balayage) : '+seuils.map(s=>s[0]+':'+s[1]).join(' '));
const L=[];for(const f of process.argv.slice(2))for(const x of fs.readFileSync(f,'utf8').split('\n'))if(x){try{const l=JSON.parse(x);if(l.mesuree===true&&l.survie_s>60)L.push(l);}catch(e){}}
const r=L.map(l=>l.pieces/l.survie_s).sort((a,b)=>a-b),q=t=>r[Math.floor(t*(r.length-1))];
console.log('courses de plus de 60 s : '+L.length+' ; pieces par seconde (fin de course) p10 '+q(.1).toFixed(1)+' p50 '+q(.5).toFixed(1)+' p90 '+q(.9).toFixed(1)+' max '+r[r.length-1].toFixed(1));
console.log('a ce rythme pendant 900 s : p50 '+Math.round(q(.5)*900)+' pieces (palier '+M.palierDe(Math.round(q(.5)*900))+'), p90 '+Math.round(q(.9)*900)+' (palier '+M.palierDe(Math.round(q(.9)*900))+')');
const s=L.map(l=>l.survie_s).sort((a,b)=>a-b);
console.log('survie (s) : p50 '+s[Math.floor(s.length/2)]+', p90 '+s[Math.floor(.9*(s.length-1))]+', max '+s[s.length-1]);
