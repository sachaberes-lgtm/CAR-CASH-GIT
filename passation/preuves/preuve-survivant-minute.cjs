#!/usr/bin/env node
/* LA MINUTE DU SURVIVANT NE MARQUE JAMAIS « 0:60 » (24/10, relecture RENDU)
   usage : node preuve-survivant-minute.cjs <index.html corrigé> [index.html ancien]
   Les VRAIES expressions du fichier (le cadran `svClockDraw` et l'alerte « TU ES DERNIER » de `survTick`) sont rejouées à 60 i/s sur une
   minute entière (SURV.t de 1/60 à 60) : aucun affichage ne doit valoir 60 secondes. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs=require('fs');
function releve(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const mC=/if\(svSecsEl\)\{const sLeft=([^;]*);svSecsEl\.textContent=([^;]*);/.exec(src);
  const mA=/const left=([^;]*);(?: *\/\*[^*]*\*\/)?\s*lastAlertEl\.innerHTML=TR\('([^']*)'\)\+([^;]*);/.exec(src);
  if(!mC||!mA){console.log(chemin+'\n  repère introuvable ('+(!mC?'cadran svClockDraw':'alerte de survTick')+')');return null;}
  const fC=new Function('left','const sLeft='+mC[1]+';return '+mC[2]+';');
  const fA=new Function('SURV','const left='+mA[1]+';return '+JSON.stringify(mA[2])+'+'+mA[3]+';');
  let pireC=null,pireA=null;
  for(let i=1;i<=3600;i++){const t=i/60,c=fC(60-t),a=fA({t:t});
    if(/:60$/.test(c)&&!pireC)pireC={t:+t.toFixed(3),txt:c};if(/:60$/.test(a)&&!pireA)pireA={t:+t.toFixed(3),txt:a.replace(/<br>/g,' / ')};}
  console.log(chemin+'\n  cadran : '+(pireC?'« '+pireC.txt+' » à t = '+pireC.t+' s':'0:59 → 0:00, jamais 0:60')+'\n  alerte : '+(pireA?'« '+pireA.txt+' » à t = '+pireA.t+' s':'jamais 00:60'));
  return !pireC&&!pireA;
}
const ok=releve(process.argv[2]);let okB=true;
if(process.argv[3]){const b=releve(process.argv[3]);okB=b===false;if(b)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');}
console.log(ok&&okB?'PREUVE OK':'PREUVE KO');process.exit(ok&&okB?0:1);
