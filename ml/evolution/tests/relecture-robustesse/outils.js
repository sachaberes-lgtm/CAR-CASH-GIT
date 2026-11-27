/* ===== RELECTURE ROBUSTESSE : OUTILLAGE DES ESSAIS DE PANNE (2026-11-27, le relecteur) =====
   Lister les processus node (pid, parent, ligne de commande), attendre, ecrire en LF. Rien d'autre. */
'use strict';
const {execFileSync}=require('child_process'),path=require('path');

function processus(){
  const s=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"],
    {encoding:'utf8',windowsHide:true,timeout:60000,stdio:['ignore','pipe','ignore']}).trim();
  if(!s)return [];
  const j=JSON.parse(s);
  return (Array.isArray(j)?j:[j]).map(p=>({pid:p.ProcessId,ppid:p.ParentProcessId,ligne:String(p.CommandLine||'')}));
}
/* les enfants (enfant.js) dont le parent est `ppid` */
function enfantsDe(ppid){return processus().filter(p=>p.ppid===ppid&&/evolution[\\\/]enfant\.js/.test(p.ligne));}
const attendre=ms=>new Promise(r=>setTimeout(r,ms));
const ICI=__dirname,EVOL=path.join(__dirname,'..','..');
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
module.exports={processus,enfantsDe,attendre,ICI,EVOL,dire};
