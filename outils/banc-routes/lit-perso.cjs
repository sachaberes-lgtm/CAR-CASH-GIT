/* lit le `perso` (le résultat de --auditfile) du JSON écrit par le banc des maps (2026-11-11, LA DESCENTE DES VILLES) : une ligne par graine, les essais en clair.
   node outils/banc-routes/lit-perso.cjs <carte> [meteo] [--seaux] [--dossier=…] */
const fs=require('fs'),path=require('path');const A=process.argv.slice(2).filter(a=>!a.startsWith('--')),carte=A[0]||'ville',met=A[1]||'x';
const d=(process.argv.find(a=>a.startsWith('--dossier='))||'').slice(10)||path.join(__dirname,'..','banc-maps','sorties',carte);
const R=JSON.parse(fs.readFileSync(path.join(d,'gen-'+carte+'-'+met+'.json'),'utf8'));
for(const r of R){let p=r.perso;try{if(typeof p==='string')p=JSON.parse(p);}catch(e){}
  if(!p||typeof p!=='object'){console.log('g'+r.graine,'·',String(p||r.erreur).slice(0,300));continue;}
  console.log('g'+r.graine,'· L',p.L,'· pente',p.pente+'%','· rac/km',p.racKm,'· robustes',p.robustes,'· gros',p.gros,'· gainMax',p.gainMax,'· modules',(p.modules||[]).join(' '),r.course?'· course '+JSON.stringify(r.course).slice(0,120):'');
  if(process.argv.includes('--seaux'))console.log('   seaux :',(p.seaux||[]).join(' '));
  for(const e of p.droit||[])console.log('   TOUT DROIT',(e.fig||'-').padEnd(9),'posé à s',e.s,'lat',e.lat,'→ décolle à',e.decolle,'→',e.enJeu,e.cause?'('+e.cause+')':'','pose',e.sPose,'gain',e.gain,'vol',e.vol+' s');
  for(const e of p.essais||[])console.log('   saut',(e.fig||'-').padEnd(9),'s',e.s,'côté',e.cote,'prédit',e.predit,'(+'+e.gainPredit+' m, '+e.volPredit+' s) → EN JEU',e.enJeu,e.cause?'('+e.cause+')':'','pose',e.sPose,'gain',e.gain,'vol',e.vol+' s');}
