#!/usr/bin/env node
/* ===== APRES (2026-11-25, Sacha : « des jolies photos techniques des simulations pour le portfolio ») =====
   Attend qu'une session d'agent (reconnue a un mot de sa ligne de commande) soit finie, puis lance la suivante par agent-api.js.
   Deux agents qui ecrivent dans le meme dossier ne tournent jamais ensemble.
   usage : node apres.js --attendre portfolio.md --consigne consignes-agents/images.md --nom images --modele claude-opus-5-5 --budget 10 --etape recit */
const {execFileSync,spawnSync}=require('child_process'),path=require('path'),fs=require('fs');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const MOT=opt('attendre'),ICI=__dirname,LOG=path.join(ICI,'agents','apres-'+opt('nom','agent')+'.log');
const dire=m=>fs.appendFileSync(LOG,new Date().toISOString().slice(0,19)+'  '+m+'\n');
function encore(){try{const s=execFileSync('powershell',['-NoProfile','-Command',"Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -match '"+MOT.replace(/[^\w.-]/g,'')+"' -and $_.CommandLine -notmatch 'apres.js' } | Measure-Object | Select-Object -ExpandProperty Count"],{encoding:'utf8'});return +s.trim()>0;}catch(e){return false;}}
dire('attente de la fin de « '+MOT+' »');
(function boucle(){
  if(encore())return setTimeout(boucle,30000);
  dire('fini : lancement de '+opt('nom'));
  const r=spawnSync(process.execPath,['agent-api.js','--consigne',path.join(ICI,opt('consigne')),'--nom',opt('nom'),'--modele',opt('modele','claude-opus-5-5'),'--budget',opt('budget','8'),'--etape',opt('etape','recit')],{cwd:ICI,stdio:['ignore','pipe','pipe'],windowsHide:true});
  fs.appendFileSync(LOG,String(r.stdout||'')+String(r.stderr||''));dire('fin (code '+r.status+')');
})();
