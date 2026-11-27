#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : LES ENFANTS SURVIVENT-ILS A UN KILL DUR DU MAITRE ? (2026-11-27, le relecteur) =====
   courses.js (le meme ordonnanceur que evoluer.js) lance 4 courses de 60 s ; des que les 4 enfants tournent depuis 8 s, le maitre est tue
   (SIGKILL = TerminateProcess, comme taskkill /F ou le gestionnaire des taches). On compte ensuite les enfant.js dont il etait le parent. */
'use strict';
const {spawn}=require('child_process'),path=require('path'),fs=require('fs');
const O=require('./outils');

(async function(){
  const etat=path.join(O.ICI,'etat-orphelins');
  fs.rmSync(etat,{recursive:true,force:true});
  const pilote=path.join(O.EVOL,'..','ecurie','pilote-voltige.js');
  const m=spawn(process.execPath,[path.join(O.EVOL,'courses.js'),pilote,'--graines','4','--tmax','60','--travailleurs','4',
    '--etat',path.relative(O.EVOL,etat)],{stdio:['ignore','pipe','pipe'],windowsHide:true});
  m.stdout.on('data',d=>process.stdout.write('  [maitre] '+d));
  O.dire('maitre courses.js pid '+m.pid);
  let E=[];
  for(let i=0;i<60;i++){await O.attendre(1500);E=O.enfantsDe(m.pid);if(E.length>=4)break;}
  O.dire('enfants vivants : '+E.map(p=>p.pid).join(' '));
  await O.attendre(+(process.argv[2]||8000));
  process.kill(m.pid,'SIGKILL');
  const t0=Date.now();
  O.dire('maitre tue (SIGKILL)');
  for(;;){
    await O.attendre(3000);
    const R=O.enfantsDe(m.pid);
    O.dire('+'+Math.round((Date.now()-t0)/1000)+' s : enfants orphelins encore vivants : '+R.length+(R.length?' ('+R.map(p=>p.pid).join(' ')+')':''));
    if(!R.length||Date.now()-t0>180000)break;
  }
  const lignes=fs.readdirSync(etat).filter(f=>/^courses-.*\.jsonl$/.test(f)).map(f=>fs.readFileSync(path.join(etat,f),'utf8').split('\n').filter(Boolean).length);
  O.dire('lignes ecrites dans le cache : '+(lignes.reduce((a,b)=>a+b,0)));
})();
