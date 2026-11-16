/* ===== LE BANC DES JUMELLES SANS LE GEN (2026-11-14, vérificateurs : « jamais deux voisins identiques » non remesuré) =====
   Le `gen` de outils/banc-maps/banc.cjs ne lève plus __gameReady sur la machine chargée : ce banc passe par sonde-tel.cjs (son serveur, sans sw.js,
   sauvegarde muette, dbgJouer), récupère l'audit audit-formes.js en JSON et écrit un fichier au format du gen, que formes.cjs chiffre.
     node outils/banc-jade/jumelles.cjs <racine> <port> <cdp> <graines 1,2,3> <tel 0|1> <sortie.json> [requête en plus, ex. sans=jadejumelles]
   Puis : node outils/banc-jade/formes.cjs <sortie.json> */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const [root,port,cdp,gr,tel,sortie,plus]=process.argv.slice(2);
const src=fs.readFileSync(path.join(__dirname,'sonde-tel.cjs'),'utf8').replace("console.log('AUDIT',await ev(fs.readFileSync(process.argv[7],'utf8'),true));","fs.writeFileSync(process.env.SORTIE,JSON.stringify(await ev(fs.readFileSync(process.argv[7],'utf8'),true)));").replace("await new Promise(r=>setTimeout(r,5000));if(process.argv[7])","for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,3000));if(await ev('!!(window.dbgJadeAudit&&dbgJadeAudit())'))break;}if(process.argv[7])"); /* l'ordi monte Jade plus lentement : attendre que la vallée soit posée (JADE.root) avant l'audit */
if(!src.includes('process.env.SORTIE'))throw new Error('sonde-tel.cjs a changé : remplacement impossible');
const tmp=path.join(__dirname,'.sonde-json-'+port+'.cjs');fs.writeFileSync(tmp,src);
const R=[];
for(const g of gr.split(',')){const f=path.join(__dirname,'.audit-'+port+'.json');try{fs.unlinkSync(f);}catch(e){}
  const q=(tel==='1'?'tel=1&':'')+'meteo=midi&pistegraine='+g+(plus?'&'+plus:'');
  const bon=function(){try{return !!JSON.parse(fs.readFileSync(f,'utf8')).audit;}catch(e){return false;}}; /* audit null = la course n'était pas encore montée (machine chargée) : on relance */
  for(let essai=0;essai<4&&!bon();essai++){try{fs.unlinkSync(f);}catch(e){}try{execFileSync(process.execPath,[tmp,root,port,cdp,q,'150',path.join(__dirname,'audit-formes.js')],{env:Object.assign({},process.env,{SORTIE:f}),stdio:'ignore',timeout:600000});}catch(e){}}
  if(!fs.existsSync(f)){R.push({graine:+g,erreur:'audit absent'});console.log('graine',g,'ÉCHEC');continue;}
  const o=JSON.parse(fs.readFileSync(f,'utf8'));R.push({graine:+g,perso:o});console.log('graine',g,'audit',JSON.stringify(o.audit&&{couloir:o.audit.couloir,frole:o.audit.frole,panneaux:o.audit.panneaux,flottants:o.audit.flottants}),'regle',JSON.stringify(o.regle).slice(0,120));}
fs.writeFileSync(sortie,JSON.stringify(R));try{fs.unlinkSync(tmp);}catch(e){}
