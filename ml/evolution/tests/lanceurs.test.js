'use strict';
/* ===== LES TESTS DE lancer.cmd ET arreter.cmd (27/11/2026, etape 6 de la specification) =====
   Dans un bac a part, sous un chemin AVEC ESPACES (essais/test lanceurs/depot copie/ml/evolution/), on recopie lancer.cmd et arreter.cmd et on
   met a la place de evoluer.js un faux maitre : il note ses options et son dossier courant, tient un verrou.json a son pid, et attend STOP
   (il efface alors STOP et le verrou, comme le vrai, et sort en code 0) ; « --code N » le fait sortir tout de suite en code N.
   Ne touche ni a etat/ ni aux taches planifiees (installer-tache.cmd n'est PAS lance : il change des reglages de Windows, c'est a Sacha).
   node ml/evolution/tests/lanceurs.test.js -> code 0 si tout passe. Windows seulement. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const EV=path.join(__dirname,'..');
if(process.platform!=='win32'){console.log('test sans objet hors de Windows');process.exit(0);}

const RACINE=path.join(EV,'essais','test lanceurs','depot copie'),ICI=path.join(RACINE,'ml','evolution'),ETAT=path.join(ICI,'etat');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}}

fs.rmSync(path.join(EV,'essais','test lanceurs'),{recursive:true,force:true});
fs.mkdirSync(ICI,{recursive:true});
for(const f of ['lancer.cmd','arreter.cmd'])fs.copyFileSync(path.join(EV,f),path.join(ICI,f));
fs.writeFileSync(path.join(ICI,'evoluer.js'),[
  "'use strict';",
  "const fs=require('fs'),path=require('path');const E=path.join(__dirname,'etat');",
  "fs.writeFileSync(path.join(E,'appel.json'),JSON.stringify({args:process.argv.slice(2),cwd:process.cwd()}));",
  "console.log('faux maitre : depart');",
  "const i=process.argv.indexOf('--code');if(i>=0){console.log('faux maitre : sortie '+process.argv[i+1]);process.exit(+process.argv[i+1]);}",
  "fs.writeFileSync(path.join(E,'verrou.json'),JSON.stringify({pid:process.pid,debut:new Date().toISOString(),battement:new Date().toISOString()}));",
  "const t0=Date.now();const h=setInterval(()=>{if(fs.existsSync(path.join(E,'STOP'))||Date.now()-t0>60000){",
  "  console.log('faux maitre : STOP lu');fs.rmSync(path.join(E,'verrou.json'),{force:true});fs.rmSync(path.join(E,'STOP'),{force:true});clearInterval(h);process.exit(0);}},200);",
  ''].join('\n'));

/* cmd /s /c ""chemin avec espaces\x.cmd" options" ; stdin vide : « pause » passe tout seul */
function cmd(fichier,options,attendre){
  const ligne='""'+path.join(ICI,fichier)+'"'+(options?' '+options:'')+'"';
  if(attendre===false)return cp.spawn('cmd.exe',['/d','/s','/c',ligne],{windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],cwd:EV});
  return cp.spawnSync('cmd.exe',['/d','/s','/c',ligne],{windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],encoding:'latin1',cwd:EV,timeout:120000});}
const log=()=>{try{return fs.readFileSync(path.join(ETAT,'sortie.log'),'latin1');}catch(e){return '';}};
const appel=()=>{try{return JSON.parse(fs.readFileSync(path.join(ETAT,'appel.json'),'utf8'));}catch(e){return null;}};
const existe=f=>fs.existsSync(path.join(ETAT,f));
const attendre=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);

/* 1. a la main, le faux maitre sort en code 0 */
let r=cmd('lancer.cmd','--code 0');
let a=appel();
ok('lancer.cmd a la main : code 0',r.status===0,r.stdout+r.stderr);
ok('lancer.cmd : evoluer.js lance avec les options passees',a&&a.args.join(' ')==='--code 0',JSON.stringify(a));
ok('lancer.cmd : dossier courant = la racine du depot (chemin avec espaces)',a&&path.resolve(a.cwd).toLowerCase()===path.resolve(RACINE).toLowerCase(),a&&a.cwd);
ok('lancer.cmd : la console de evoluer.js va dans etat/sortie.log',/faux maitre : depart/.test(log())&&/lancement \(main\)/.test(log())&&/fin, code 0/.test(log()),log());

/* 2. le code de sortie remonte */
r=cmd('lancer.cmd','--code 2');
ok('lancer.cmd : le code 2 de evoluer.js remonte',r.status===2,r.status+' '+r.stdout);
ok('lancer.cmd : message « il tourne deja » a la main',/tourne deja/.test(r.stdout),r.stdout);

/* 3. arret voulu : la relance automatique ne lance rien */
fs.rmSync(path.join(ETAT,'appel.json'),{force:true});
fs.writeFileSync(path.join(ETAT,'ARRETE'),'');
r=cmd('lancer.cmd','auto --code 0');
ok('lancer.cmd auto avec ARRETE : code 0 et rien de lance',r.status===0&&!appel(),r.stdout+JSON.stringify(appel()));
ok('lancer.cmd auto avec ARRETE : le journal le dit',/relance automatique sautee/.test(log()),log().slice(-300));

/* 4. a la main, ARRETE et un STOP qui traine sont effaces */
fs.writeFileSync(path.join(ETAT,'STOP'),'');
r=cmd('lancer.cmd','--code 0');
ok('lancer.cmd a la main : efface ARRETE et STOP, puis lance',!existe('ARRETE')&&!existe('STOP')&&appel()!==null,r.stdout);

/* 5. auto sans ARRETE : lance, et « auto » n'est pas passe a evoluer.js */
r=cmd('lancer.cmd','auto --code 0');a=appel();
ok('lancer.cmd auto sans ARRETE : lance, sans « auto » dans les options',r.status===0&&a&&a.args.join(' ')==='--code 0',JSON.stringify(a)+r.stdout);

/* 6. lancer en tache de fond, puis arreter.cmd : l'arret propre */
fs.rmSync(path.join(ETAT,'appel.json'),{force:true});
const enfant=cmd('lancer.cmd','',false);let sortiLancer=null;enfant.on('exit',c=>{sortiLancer=c;});
for(let i=0;i<100&&!existe('verrou.json');i++)attendre(100);
ok('le faux maitre tourne (verrou.json pose)',existe('verrou.json'));
r=cmd('arreter.cmd','');
ok('arreter.cmd : code 0 et « C\'est arrete »',r.status===0&&/C'est arrete/.test(r.stdout),r.stdout+r.stderr);
ok('arreter.cmd : le verrou est parti, ARRETE reste, STOP efface',!existe('verrou.json')&&existe('ARRETE')&&!existe('STOP'));
ok('le faux maitre a lu STOP',/STOP lu/.test(log()),log().slice(-300));

/* 7. arreter.cmd sur un verrou laisse par un processus mort */
fs.writeFileSync(path.join(ETAT,'verrou.json'),JSON.stringify({pid:999999,debut:'2026-11-27T00:00:00.000Z',battement:'2026-11-27T00:00:00.000Z'}));
r=cmd('arreter.cmd','');
ok('arreter.cmd, verrou d\'un mort : « Rien ne tournait », STOP efface, ARRETE pose',/Rien ne tournait/.test(r.stdout)&&!existe('STOP')&&existe('ARRETE'),r.stdout);

/* 8. arreter.cmd sans rien qui tourne */
fs.rmSync(path.join(ETAT,'verrou.json'),{force:true});
r=cmd('arreter.cmd','');
ok('arreter.cmd sans verrou : « C\'est arrete » tout de suite',r.status===0&&/C'est arrete/.test(r.stdout),r.stdout);

const fin=Date.now();(function attendreLancer(){
  if(sortiLancer===null&&Date.now()-fin<15000)return setTimeout(attendreLancer,100);
  ok('lancer.cmd (tache de fond) a fini en code 0 apres l\'arret',sortiLancer===0,String(sortiLancer));
  console.log('\n'+(total-echecs)+' / '+total+' controles passes'+(echecs?' : '+echecs+' ECHEC(S)':''));
  process.exit(echecs?1:0);})();
