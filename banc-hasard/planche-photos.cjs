// node planche-photos.cjs <carte> <sortie.html> — la planche AVANT | APRÈS des photos en course (photos2.py), et celle des pièces (vues.cjs) (NON COMMITÉ)
const fs=require('fs'),path=require('path');const carte=process.argv[2],OUT=process.argv[3];
const NOM={canyon:'LE CANYON DES GÉANTS',dunes:"LES DUNES D'OR"}[carte];
let h=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#141414;color:#eee;font:13px Menlo,monospace}h1{font-size:18px;margin:10px 12px}table{border-collapse:collapse;margin:0 8px 10px}td,th{padding:3px}th{font-weight:400;color:#bbb;text-align:left}img{width:380px;display:block}.av{color:#999}.ap{color:#3c6}</style><h1>${NOM} — en course, même graine (?pistegraine), AVANT | APRÈS</h1><table><tr><th></th><th class=av>AVANT · 14 s</th><th class=av>AVANT · 30 s</th><th class=ap>APRÈS · 14 s</th><th class=ap>APRÈS · 30 s</th></tr>`;
for(const m of ['soir','midi'])for(const g of ['7','8']){h+=`<tr><th>${m}<br>graine ${g}</th>`;for(const v of ['avant','apres'])for(const k of [1,3])h+=`<td><img src="photos-${v}/${carte}-${m}-g${g}-${k}.jpg"></td>`;h+='</tr>';}
h+='</table>';
const J=path.join(__dirname,'vues-apres',carte+'.json');
if(fs.existsSync(J)){const L=JSON.parse(fs.readFileSync(J));h+=`<h1>APRÈS — ${L.length} ${carte==='canyon'?'canyons':'ergs'} tirés au hasard, une vue devant chaque pièce, dans l'ordre</h1>`;
  for(const m of L){h+=`<div style="margin:4px 12px;color:#3c6">axe ${m.axe}° · ${(m.L/1000).toFixed(1)} km · ${m.ordre.join(' → ')}</div><table><tr>`;
    for(const [n,f] of m.photos.slice(0,6))h+=`<td><img style="width:252px" src="vues-apres/${f}"><div style="color:#bbb">${n}</div></td>`;h+='</tr></table>';}}
fs.writeFileSync(OUT,h);console.log('ok',OUT);
