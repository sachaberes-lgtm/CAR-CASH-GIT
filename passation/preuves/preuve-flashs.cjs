#!/usr/bin/env node
/* RELEVÉ DES FLASHS PAR SECONDE (2026-10-14, WCAG 2.3.1 : au plus 3 flashs sur toute fenêtre d'1 s — motif de refus Apple)
   usage : node preuve-flashs.cjs <index.html corrigé> [index.html ancien]
   Les expressions RÉELLES du fichier (lues dans le texte) sont rejouées image par image à 60 i/s :
   · l'ORAGE : CAMP_FLASH pendant la vie d'un éclair (ECL.vie .34 → 0, e=k², k qui baisse de 1,9/s) ;
   · l'ÉCLAIR lui-même : son opacité `fl` ;
   · le VOILE DE BEAT : MUSIC_BEAT nourri par un morceau DENSE (une frappe toutes les 0,125 s = doubles croches à 120 bpm).
   Un flash = une MONTÉE nette (+0,1 au moins depuis le dernier creux). Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs=require('fs');
function releve(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const mFlash=/CAMP_FLASH=(\.8\*e[^;]*);/.exec(src),mFl=/const fl=(ECL\.vie>\.2\?1:[^;]*);/.exec(src);
  const mBeat=src.indexOf('  MUSIC_BEAT=Math.max(0,MUSIC_BEAT-dt*3.4);');const avant=src.slice(src.lastIndexOf('\n',mBeat-2)+1,mBeat);
  const morte=/musicTick\._bc=/.test(avant)?avant:'';
  const fFlash=new Function('e','ECL','return '+mFlash[1]),fFl=new Function('ECL','return '+mFl[1]);
  const monte=serie=>{let n=0,creux=serie[0],haut=false;const t=[];serie.forEach((v,i)=>{if(!haut&&v-creux>=.1){n++;haut=true;t.push(i);}if(haut&&v<serie[i-1]){haut=false;creux=v;}if(!haut)creux=Math.min(creux,v);});return t;};
  const dt=1/60;
  // orage : un éclair
  const S1=[],S2=[];{const ECL={vie:.34};let k=1;for(let i=0;i<60;i++){S1.push(fFlash(k*k,ECL));S2.push(ECL.vie>0?fFl(ECL):0);ECL.vie=Math.max(0,ECL.vie-dt);k=Math.max(0,k-1.9*dt);}}
  const o1=monte(S1).length,o2=monte(S2).length;
  // beat : morceau dense, 3 s
  const musicTick={};let MUSIC_BEAT=0;const S3=[];
  const pas=new Function('musicTick','beat','dt','MUSIC_BEAT',morte+'\n  MUSIC_BEAT=Math.max(0,MUSIC_BEAT-dt*3.4);if(beat>MUSIC_BEAT)MUSIC_BEAT=Math.min(1,beat);return MUSIC_BEAT;');
  for(let i=0;i<180;i++){const t=i*dt,beat=(t%.125)<dt?.9:0;MUSIC_BEAT=pas(musicTick,beat,dt,MUSIC_BEAT);S3.push(MUSIC_BEAT);}
  const tb=monte(S3);let pire=0;for(let i=0;i<tb.length;i++){let n=0;for(let j=i;j<tb.length&&tb[j]-tb[i]<60;j++)n++;pire=Math.max(pire,n);}
  console.log(chemin+'\n  orage (vie d\'un éclair, 0,34 s) : '+o1+' montée(s) · éclair : '+o2+' montée(s) · voile de beat, morceau dense : '+pire+' montée(s) dans la pire seconde'+(morte?'':' (sans temps mort)'));
  return {o1,o2,pire};}
const a=releve(process.argv[2]);const okA=a.o1<=1&&a.o2<=1&&a.pire<=3;
let okB=true;if(process.argv[3]){const b=releve(process.argv[3]);okB=b.o1>1||b.o2>1||b.pire>3;if(!okB)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');}
console.log(okA&&okB?'PREUVE OK':'PREUVE KO');process.exit(okA&&okB?0:1);
