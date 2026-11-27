/* jetable : une ligne par fichier vols-*.json (rayons-vol.js) — duree totale, paliers, vols, morts, glisse apres la pose, re-sorties, poses dessous
   usage : node resume.js vols-a.json [vols-b.json …]   (plusieurs fichiers d'un meme pilote : ajouter --somme pour une ligne de total) */
const fs=require('fs');const F=process.argv.slice(2).filter(x=>!x.startsWith('--'));
const med=a=>{a=a.filter(x=>x!=null&&x===x).sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:NaN;};
const ligne=(nom,B,W)=>{const P=W.filter(f=>f.fin==='pose'&&f.apres&&f.apres.glisse!=null),dur=B.reduce((a,b)=>a+b.duree,0),m=W.filter(f=>f.fin==='mort');
  console.log(nom.padEnd(28)+' duree '+Math.round(dur)+' s · paliers '+B.reduce((a,b)=>a+b.palier,0)+' · '+W.length+' vols ('+(60*W.length/dur).toFixed(1)+'/min) · '+m.length+' morts ('+(100*m.length/W.length).toFixed(1)+' pour 100 vols, '+m.filter(f=>f.dur<1).length+' en moins de 1 s) · glisse '+med(P.map(f=>f.apres.glisse)).toFixed(2)+' · re-sorties '+(100*P.filter(f=>f.apres.re).length/Math.max(1,P.length)).toFixed(0)+' % · poses dessous '+P.filter(f=>f.apres.dessous).length+' · departs dessous '+W.filter(f=>f.depDessous).length);};
let TB=[],TW=[];
for(const f of F){if(!fs.existsSync(f)){console.log(f+' absent');continue;}const D=JSON.parse(fs.readFileSync(f,'utf8'));ligne(f,D.bilans,D.vols);TB=TB.concat(D.bilans);TW=TW.concat(D.vols);}
if(process.argv.includes('--somme'))ligne('TOTAL',TB,TW);
