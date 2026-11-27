#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : UN ARRET (STOP / Ctrl+C) QUAND LES ENFANTS MEURENT EN MEME TEMPS (2026-11-27, le relecteur) =====
   Ctrl+C dans la fenetre de lancer.cmd envoie CTRL_C_EVENT a TOUS les processus de la console : le maitre (qui le prend « comme STOP »)
   et les 4 enfants (qui meurent : node n'a pas de gestionnaire SIGINT chez eux). On le reproduit sans console : STOP pose ET les enfants
   en cours tues au meme instant. Copie de l'etat des tests de l'integrateur (generation 5 finie), config de son test (g).
   La question : la generation s'arrete-t-elle proprement (reprise au prochain lancement), ou continue-t-elle avec des courses
   « non mesurees » qui retirent des graines, virent des pilotes et sont ecrites comme finies ? */
'use strict';
const path=require('path'),fs=require('fs'),{spawn}=require('child_process');
const O=require('./outils');
(async function(){
  const src=path.join(O.EVOL,'essais','tests-evoluer','etat'),etat=path.join(O.ICI,'etat-stop');
  const FIN=process.argv.includes('--fin');   /* --fin : on garde etat-stop tel quel et on frappe quand la file est vide (les 4 dernieres courses) */
  if(!FIN){fs.rmSync(etat,{recursive:true,force:true});fs.cpSync(src,etat,{recursive:true});}
  for(const f of ['verrou.json','STOP','PAUSE'])fs.rmSync(path.join(etat,f),{force:true});
  const avant=JSON.parse(fs.readFileSync(path.join(etat,'population.json'),'utf8'));
  O.dire('avant : generation '+avant.generation+' etape '+avant.etape+', '+avant.vivants.length+' vivants, graines retirees '+JSON.stringify(avant.grainesRetirees));
  const log=fs.openSync(path.join(O.ICI,'stop-et-enfants-morts.log'),'w');
  const m=spawn(process.execPath,[path.join(O.EVOL,'evoluer.js'),'--config',path.join('essais','tests-evoluer','config-epoque.json'),
    '--etat',path.relative(O.EVOL,etat),'--une-generation'],{cwd:O.EVOL,stdio:['ignore',log,log],windowsHide:true});
  O.dire('maitre evoluer.js pid '+m.pid);
  let fin=null;m.on('exit',c=>{fin=c;});
  let E=[];
  for(let i=0;i<200&&fin===null;i++){await O.attendre(2000);E=O.enfantsDe(m.pid);if(E.length>=4)break;}
  if(fin!==null){O.dire('le maitre est sorti trop tot, code '+fin);return;}
  if(FIN){
    const fc=()=>fs.readdirSync(etat).filter(f=>/^courses-.*\.jsonl$/.test(f)).map(f=>path.join(etat,f));
    const faites=()=>{const s=new Set();for(const f of fc())for(const l of fs.readFileSync(f,'utf8').split('\n'))if(l.trim()){const x=JSON.parse(l);if(x.generation===avant.generation&&x.usage==='entrainement'&&x.mesuree)s.add(x.cle);}return s.size;};
    const n0=avant.vivants.length*avant.grainesGeneration.length;
    while(fin===null&&faites()<n0-4)await O.attendre(2000);
    O.dire('courses d\'entrainement mesurees : '+faites()+'/'+n0+' : la file est vide, les 4 dernieres tournent');
  }
  await O.attendre(FIN?3000:15000);
  E=O.enfantsDe(m.pid);
  fs.writeFileSync(path.join(etat,'STOP'),'');
  for(const p of E){try{process.kill(p.pid,'SIGKILL');}catch(e){}}
  O.dire('STOP pose et '+E.length+' enfants tues ('+E.map(p=>p.pid).join(' ')+')');
  const t0=Date.now();
  while(fin===null&&Date.now()-t0<600000)await O.attendre(2000);
  O.dire('maitre sorti, code '+fin);
  const apres=JSON.parse(fs.readFileSync(path.join(etat,'population.json'),'utf8'));
  O.dire('apres : generation '+apres.generation+' etape '+apres.etape+', '+apres.vivants.length+' vivants, graines retirees '+JSON.stringify(apres.grainesRetirees));
  const G=fs.readFileSync(path.join(etat,'generations.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);
  const g=G[G.length-1];
  O.dire('derniere ligne de generations.jsonl : generation '+g.generation+', courses '+JSON.stringify(g.courses)+', morts '+JSON.stringify(g.morts));
})();
