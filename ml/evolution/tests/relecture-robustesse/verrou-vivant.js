#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : UN MAITRE VIVANT DONT LE BATTEMENT A PRIS DU RETARD (2026-11-27, le relecteur) =====
   A tient le verrou et bat toutes les secondes. Son battement prend 1 h de retard (PC en veille / hibernation, boucle bloquee) :
   on le simule en reecrivant verrou.json avec le pid de A et un battement vieux. B arrive (la tache planifiee horaire) :
   prend-il le verrou d'un maitre VIVANT ? Et A, au battement suivant, ecrase-t-il le verrou de B ? */
'use strict';
const path=require('path'),fs=require('fs'),{spawn}=require('child_process');
const O=require('./outils');
const E=require(path.join(O.EVOL,'evoluer.js')),C=require(path.join(O.EVOL,'commun.js'));
const etat=path.join(O.ICI,'etat-verrou-vivant');
const cfg=C.lireConfig(null);cfg.dossierEtat=etat;cfg.battement_s=1;
if(process.argv[2]==='--A'){
  const V=E.verrouiller(cfg);process.stdout.write('A '+process.pid+' ok '+V.ok+'\n');
  setTimeout(()=>{process.stdout.write('A sort\n');process.exit(0);},8000);
}else (async function(){
  fs.rmSync(etat,{recursive:true,force:true});
  const a=spawn(process.execPath,[__filename,'--A'],{stdio:['ignore','inherit','inherit']});
  await O.attendre(2000);
  const f=path.join(etat,'verrou.json');
  fs.writeFileSync(f,JSON.stringify({pid:a.pid,debut:'2026-11-27T10:00:00.000Z',battement:'2026-11-27T10:00:00.000Z',config:'config.json'})+'\n');
  const V=E.verrouiller(cfg);
  O.dire('B '+process.pid+' : ok '+V.ok+(V.raison?' ('+V.raison+')':'')+' ; A ('+a.pid+') vivant : '+C.vivant(a.pid));
  for(let i=0;i<3;i++){await O.attendre(1200);let v=null;try{v=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){}O.dire('verrou.json dit pid '+(v&&v.pid));}
  if(V.ok)V.lacher();
  await new Promise(r=>a.on('exit',r));
})();
