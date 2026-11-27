#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : DEUX LANCEMENTS SUR UN VERROU MORT (2026-11-27, le relecteur) =====
   Un verrou.json laisse par un pid mort (kill dur). Deux maitres partent au meme instant (la tache planifiee + un double-clic) :
   chacun appelle evoluer.verrouiller() a la meme milliseconde. Combien croient tenir le verrou ?
   node verrou-course.js            : le meneur du jeu (lance 2 processus, N fois)
   node verrou-course.js --un T D   : un concurrent (attend l'instant T, verrouille l'etat D, dit ok/refus, tient 3 s) */
'use strict';
const path=require('path'),fs=require('fs'),{spawn}=require('child_process');
const O=require('./outils');
const A=process.argv.slice(2);

if(A[0]==='--un'){
  const E=require(path.join(O.EVOL,'evoluer.js')),C=require(path.join(O.EVOL,'commun.js'));
  const cfg=C.lireConfig(null);cfg.dossierEtat=A[2];
  const T=+A[1];
  while(Date.now()<T){}
  let V;try{V=E.verrouiller(cfg);}catch(e){V={ok:false,raison:'LEVE '+e.code};}
  process.stdout.write(JSON.stringify({pid:process.pid,ok:V.ok,raison:V.raison||null})+'\n');
  setTimeout(()=>{if(V.ok)V.lacher();process.exit(0);},3000);
}else (async function(){
  const etat=path.join(O.ICI,'etat-verrou');
  let deux=0;const N=+(A[0]||10);
  for(let i=0;i<N;i++){
    fs.rmSync(etat,{recursive:true,force:true});fs.mkdirSync(etat,{recursive:true});
    /* le verrou d'un maitre tue : pid qui ne vit plus, battement vieux d'une heure */
    fs.writeFileSync(path.join(etat,'verrou.json'),JSON.stringify({pid:999999,debut:'2026-11-27T10:00:00.000Z',battement:'2026-11-27T10:00:00.000Z',config:'config.json'})+'\n');
    const T=Date.now()+1500,sorties=[];
    await Promise.all([0,1].map(()=>new Promise(r=>{
      const c=spawn(process.execPath,[__filename,'--un',String(T),etat],{stdio:['ignore','pipe','inherit']});
      let s='';c.stdout.on('data',d=>s+=d);c.on('exit',()=>{sorties.push(JSON.parse(s.trim()));r();});})));
    const ok=sorties.filter(x=>x.ok).length;if(ok===2)deux++;
    O.dire('essai '+(i+1)+' : '+sorties.map(x=>x.pid+' '+(x.ok?'TIENT LE VERROU':'refuse')).join(' ; '));
  }
  O.dire('bilan : '+deux+'/'+N+' essais ou les DEUX maitres tiennent le verrou');
})();
