/* L'ATELIER (2026-11-17, canyon final) : UN Chrome gardé ouvert sous le verrou, piloté par des fichiers de commande — pour régler une image en plusieurs essais
   sans refaire la queue du verrou à chaque fois. À fermer dès que le réglage est fini (les autres sessions attendent).
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/atelier.mjs dir=<dossier> [repos=420]
   Dans <dossier> : `N.json` = {scenario:'pistes'|'photos'|'lot'|'cout'|'course', args:{…}} → exécuté, puis `N.fait` (le journal de l'essai) ; `fin` = on ferme ; `pret` = l'atelier écoute.
   Sans commande pendant `repos` secondes : on ferme. */
import fs from 'node:fs';import path from 'node:path';
export default async function(api,a){const D=a.dir,repos=+(a.repos||420)*1000,ici=path.dirname(new URL(import.meta.url).pathname),S={};
  fs.mkdirSync(D,{recursive:true});fs.writeFileSync(path.join(D,'pret'),String(Date.now()));let t0=Date.now();const faits=new Set(fs.readdirSync(D).filter(f=>f.endsWith('.fait')).map(f=>f.slice(0,-5)));
  for(;;){if(fs.existsSync(path.join(D,'fin')))break;if(Date.now()-t0>repos){api.log('atelier : repos dépassé, fermeture');break;}
    const c=fs.readdirSync(D).filter(f=>f.endsWith('.json')&&!faits.has(f.slice(0,-5))).sort((x,y)=>parseInt(x)-parseInt(y))[0];
    if(!c){await api.dort(700);continue;}
    const id=c.slice(0,-5),lignes=[],log0=api.log;api.log=(...x)=>{lignes.push(x.join(' '));log0(...x);};
    try{const cmd=JSON.parse(fs.readFileSync(path.join(D,c),'utf8'));S[cmd.scenario]=S[cmd.scenario]||(await import(path.join(ici,cmd.scenario+'.mjs'))).default;await S[cmd.scenario](api,cmd.args||{});}
    catch(e){lignes.push('ÉCHEC '+String(e&&e.stack||e).slice(0,500));}
    api.log=log0;faits.add(id);fs.writeFileSync(path.join(D,id+'.fait'),lignes.join('\n'));t0=Date.now();}
  try{fs.unlinkSync(path.join(D,'pret'));}catch(e){}
}
