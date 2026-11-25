#!/usr/bin/env node
/* ===== LE RELAIS (2026-11-25, Sacha : « occupe toi toi meme de cloturer le travail amorce ici sans bacler le travail debute par fable ») =====
   Glisse une session d'agent payee par la cle d'API ENTRE deux pas de la chaine, sans courses en double ni ecritures croisees :
   attend que la chaine en cours s'arrete (le fichier agents/STOP la fait s'arreter au pas suivant), lance l'agent, retire STOP, relance la chaine
   (elle reprend ou elle en etait, d'apres agents/chaine-etat.json).
   usage : node relais.js --pid 5368 --consigne consignes-agents/finitions-b.md --nom finitions-b --modele claude-opus-5-5 --budget 20 --etape B */
const fs=require('fs'),path=require('path'),{spawn,spawnSync}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const ICI=__dirname,AG=path.join(ICI,'agents'),LOG=path.join(AG,'chaine.log'),STOP=path.join(AG,'STOP'),PID=+opt('pid',0);
const dire=m=>fs.appendFileSync(LOG,new Date().toISOString().slice(0,19).replace('T',' ')+'  [relais] '+m+'\n');
const vivant=p=>{try{process.kill(p,0);return true;}catch(e){return e.code==='EPERM';}};
fs.writeFileSync(STOP,'pose par relais.js : la chaine s\'arrete au pas suivant pour laisser passer '+opt('nom','un agent')+'\n');
dire('STOP pose : attente de l\'arret de la chaine (pid '+PID+')');
(function attendre(){
  if(PID&&vivant(PID))return setTimeout(attendre,30000);
  dire('la chaine est arretee : agent '+opt('nom'));
  const r=spawnSync(process.execPath,['agent-api.js','--consigne',path.join(ICI,opt('consigne')),'--nom',opt('nom','relais'),'--modele',opt('modele','claude-opus-5-5'),'--budget',opt('budget','10'),'--etape',opt('etape','B')],{cwd:ICI,stdio:['ignore','pipe','pipe'],windowsHide:true});
  String(r.stdout||'').split(/\r?\n/).filter(Boolean).forEach(l=>fs.appendFileSync(LOG,'      '+l.slice(0,240)+'\n'));
  dire('agent fini (code '+r.status+') : STOP retire, la chaine repart');
  try{fs.unlinkSync(STOP);}catch(e){}
  const c=spawn(process.execPath,['chaine.js'],{cwd:ICI,detached:true,stdio:['ignore',fs.openSync(path.join(AG,'chaine-console.log'),'a'),fs.openSync(path.join(AG,'chaine-erreurs.log'),'a')],windowsHide:true});
  c.unref();dire('chaine relancee (pid '+c.pid+')');
})();
