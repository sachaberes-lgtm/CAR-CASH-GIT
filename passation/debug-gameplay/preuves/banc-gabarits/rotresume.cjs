const fs=require('fs');
for(const m of process.argv.slice(2)){const f='rot-'+m+'.jsonl';if(!fs.existsSync(f)){console.log(m,'(pas de fichier)');continue}
 for(const l of fs.readFileSync(f,'utf8').split('\n').filter(Boolean)){const r=JSON.parse(l);
  if(r.orient)console.log(m,r.orient,r.demarre===false?'PAS DE DEPART':`mort=${r.mort?JSON.stringify(r.mort):'non'} nan=${r.nan} hors=${r.horsCadre} pauses=${r.pauses} fige=${r.figeMax} fov=${r.fov} dist=${r.dist} nx=${r.nx} ny=${r.ny} s=${r.sMax}`);
  else if(r.rot)console.log(m,'rot',r.rot,r.sens,`avant=${r.modeAvant} mort=${r.mort}${r.cause?'('+r.cause+')':''} pause=${r.pause} hors=${r.horsCadre} nan=${r.nan} modes=${r.modes} asp=${r.aspApres} fov=${r.fov} dist=${r.dist} nxy=${r.nxy}`);
  else if(r.rot===undefined&&r.vol===false)console.log(m,'vol non atteint')}
 const lg=fs.readFileSync('rot-'+m+'.log','utf8');console.log(m,'exceptions:',(lg.match(/=== EXCEPTIONS \((\d+)\)/)||[])[1],/ÉCHEC/.test(lg)?'ÉCHEC':'' )}
