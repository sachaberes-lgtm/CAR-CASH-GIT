#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : ecrireAtomique QUAND UN AUTRE PROGRAMME TIENT LE FICHIER OUVERT (2026-11-27, le relecteur) =====
   Un lecteur Windows qui n'est pas node (antivirus, indexeur, sauvegarde, un editeur) ouvre population.json sans FILE_SHARE_DELETE
   pendant 6 s ; le maitre veut la reecrire (ecrirePop = commun.ecrireAtomique : ecrire .tmp puis rename). */
'use strict';
const path=require('path'),fs=require('fs'),{spawn}=require('child_process');
const O=require('./outils'),C=require(path.join(O.EVOL,'commun.js'));
(async function(){
  const d=path.join(O.ICI,'etat-occupe');fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
  const f=path.join(d,'population.json');fs.writeFileSync(f,'{"generation":1}\n');
  const ps=spawn('powershell.exe',['-NoProfile','-Command',"$s=[System.IO.File]::Open('"+f+"','Open','Read','Read'); Start-Sleep -Seconds 6; $s.Close()"],{stdio:'ignore',windowsHide:true});
  await O.attendre(2500);
  try{C.ecrireAtomique(f,'{"generation":2}\n');O.dire('ecrireAtomique : ecrit');}
  catch(e){O.dire('ecrireAtomique : LEVE '+e.code+' ('+e.syscall+')');}
  O.dire('restes .tmp : '+fs.readdirSync(d).filter(x=>/\.tmp$/.test(x)).join(' '));
  await new Promise(r=>ps.on('exit',r));
})();
