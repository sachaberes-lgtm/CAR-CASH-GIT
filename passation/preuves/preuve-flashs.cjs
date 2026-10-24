#!/usr/bin/env node
/* RELEVÉ DES FLASHS PAR SECONDE (2026-10-14, WCAG 2.3.1 : au plus 3 flashs sur toute fenêtre d'1 s — motif de refus Apple)
   usage : node preuve-flashs.cjs <index.html corrigé> [index.html ancien]
   Les expressions RÉELLES du fichier (lues dans le texte) sont rejouées image par image à 60 i/s :
   · l'ORAGE : CAMP_FLASH pendant la vie d'un éclair (ECL.vie .34 → 0, e=k², k qui baisse de 1,9/s) ;
   · l'ÉCLAIR lui-même : son opacité `fl` ;
   · le VOILE DE BEAT : MUSIC_BEAT nourri par un morceau DENSE (une frappe toutes les 0,125 s = doubles croches à 120 bpm).
   Un flash = une MONTÉE nette (+0,1 au moins depuis le dernier creux). Dernière ligne : PREUVE OK / PREUVE KO.
   (24/10, débogage sortie iOS) PÉRIMÉE puis remise à jour : les éclairs ont été refaits le 21/10 (3962f657, v769 ; JOURNAL : « enveloppe
   à deux lobes (coup, creux à 55 %, retour — jamais une alternance : WCAG 2.3.1) »). L'opacité de l'éclair n'est plus `const fl=(ECL.vie>.2?…)`
   mais `eclEnv(E)` (lue ici en entier, avec la durée réelle `ECL.vie=ECL.dur=…`). Deux lobes = DEUX montées par coup, voulu : on exige
   donc ≤ 2 pour l'éclair, ≤ 1 pour le voile d'orage, ≤ 3 pour les deux ensemble, et des coups espacés d'au moins 1 s (`ECL.t=… +random`),
   soit toujours ≤ 3 flashs dans toute seconde. Hors périmètre : les fils des nuages (ECL2, filTick), qui n'éclairent que localement. */
'use strict';
const fs=require('fs');
function releve(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const mFlash=/CAMP_FLASH=(\.8\*e[^;]*);/.exec(src),mFl=/const fl=(ECL\.vie>\.2\?1:[^;]*);/.exec(src);
  const mEnv=/function eclEnv\(E\)\{[^\n]*?\}(?= *\/\/| *\/\*|\n)/.exec(src),mDur=/ECL\.vie=ECL\.dur=([0-9.]+);/.exec(src),mT=/ECL\.t=([0-9.]+)\+Math\.random\(\)\*([0-9.]+);/.exec(src);
  if(!mFlash||(!mFl&&!mEnv)){console.log(chemin+'\n  repère introuvable : '+(!mFlash?'CAMP_FLASH=.8*e':'opacité de l\'éclair (const fl= / function eclEnv)'));return {o1:9,o2:9,pire:9,lobes:1,ecart:0};}
  const vie0=mDur?+mDur[1]:.34,lobes=mFl?1:2,ecart=mT?+mT[1]:0; /* deux lobes depuis le 21/10 ; écart minimal entre deux coups */
  const mBeat=src.indexOf('  MUSIC_BEAT=Math.max(0,MUSIC_BEAT-dt*3.4);');const avant=src.slice(src.lastIndexOf('\n',mBeat-2)+1,mBeat);
  const morte=/musicTick\._bc=/.test(avant)?avant:'';
  const fFlash=new Function('e','ECL','return '+mFlash[1]),fFl=mFl?new Function('ECL','return '+mFl[1]):new Function('ECL',mEnv[0]+'\nreturn eclEnv(ECL);');
  const monte=serie=>{let n=0,creux=serie[0],haut=false;const t=[];serie.forEach((v,i)=>{if(!haut&&v-creux>=.1){n++;haut=true;t.push(i);}if(haut&&v<serie[i-1]){haut=false;creux=v;}if(!haut)creux=Math.min(creux,v);});return t;};
  const dt=1/60;
  // orage : un éclair
  const S1=[0],S2=[0];{const ECL={vie:vie0,dur:vie0}; /* (24/10) une image NOIRE avant le coup : le coup lui-même compte pour un flash */let k=1;for(let i=0;i<60;i++){S1.push(fFlash(k*k,ECL));S2.push(ECL.vie>0?fFl(ECL):0);ECL.vie=Math.max(0,ECL.vie-dt);k=Math.max(0,k-1.9*dt);}}
  const o1=monte(S1).length,o2=monte(S2).length;
  // beat : morceau dense, 3 s
  const musicTick={};let MUSIC_BEAT=0;const S3=[];
  const pas=new Function('musicTick','beat','dt','MUSIC_BEAT',morte+'\n  MUSIC_BEAT=Math.max(0,MUSIC_BEAT-dt*3.4);if(beat>MUSIC_BEAT)MUSIC_BEAT=Math.min(1,beat);return MUSIC_BEAT;');
  for(let i=0;i<180;i++){const t=i*dt,beat=(t%.125)<dt?.9:0;MUSIC_BEAT=pas(musicTick,beat,dt,MUSIC_BEAT);S3.push(MUSIC_BEAT);}
  const tb=monte(S3);let pire=0;for(let i=0;i<tb.length;i++){let n=0;for(let j=i;j<tb.length&&tb[j]-tb[i]<60;j++)n++;pire=Math.max(pire,n);}
  console.log(chemin+'\n  orage (vie d\'un éclair, 0,34 s) : '+o1+' montée(s) · éclair : '+o2+' montée(s) · voile de beat, morceau dense : '+pire+' montée(s) dans la pire seconde'+(morte?'':' (sans temps mort)')+' · coups espacés d\'au moins '+ecart+' s');
  return {o1,o2,pire,lobes,ecart};}
const a=releve(process.argv[2]);const okA=a.o1<=1&&a.o2<=a.lobes&&a.o1+a.o2<=3&&a.ecart>=1&&a.pire<=3;
let okB=true;if(process.argv[3]){const b=releve(process.argv[3]);okB=b.o1>1||b.o2>1||b.pire>3;if(!okB)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');}
console.log(okA&&okB?'PREUVE OK':'PREUVE KO'+(okA?'':' — plus de 3 flashs possibles dans une seconde (orage '+a.o1+', éclair '+a.o2+' / '+a.lobes+' permis, écart '+a.ecart+' s, beat '+a.pire+')'));process.exit(okA&&okB?0:1);
