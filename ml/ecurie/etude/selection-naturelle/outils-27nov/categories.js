/* jetable : les vols ranges par ORIGINE — voulu (le pilote est sorti expres), en chaine (moins de 1 s apres la pose d'avant), subi (le reste) — et ce
   qu'ils deviennent, par carte.   usage : node categories.js vols-a.json [vols-b.json …] */
const fs=require('fs');let W=[];const dur={};
for(const f of process.argv.slice(2)){const D=JSON.parse(fs.readFileSync(f,'utf8'));const parG={};for(const w of D.vols)(parG[w.g]=parG[w.g]||[]).push(w);
  for(const g in parG){const L=parG[g].sort((a,b)=>a.t0-b.t0);let fin=-9;for(const w of L){w.cat=(w.vues[0]&&w.vues[0].vo)?'voulu':(w.t0-fin<1?'chaine':'subi');fin=w.t0+w.dur;W.push(w);}}}
const T={};
for(const w of W){for(const k of [w.cat+' · TOUTES',w.cat+' · '+(w.carte||'?')]){const x=T[k]=T[k]||{n:0,mort:0,dessous:0,re:0,court:0};x.n++;if(w.fin==='mort'){x.mort++;if(w.dur<1)x.court++;}else if(w.apres){if(w.apres.dessous)x.dessous++;if(w.apres.re)x.re++;}}}
console.log(W.length+' vols');
for(const k of Object.keys(T).sort())console.log('  '+k.padEnd(18)+String(T[k].n).padStart(4)+' vols · '+String(T[k].mort).padStart(2)+' morts ('+(100*T[k].mort/T[k].n).toFixed(0).padStart(2)+' %, dont '+T[k].court+' en moins de 1 s) · re-sortie '+(100*T[k].re/T[k].n).toFixed(0)+' % · pose dessous '+(100*T[k].dessous/T[k].n).toFixed(0)+' %');
