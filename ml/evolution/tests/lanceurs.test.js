'use strict';
/* ===== LES TESTS DE lancer.cmd ET arreter.cmd (27/11/2026, etape 6 de la specification) =====
   Dans un bac a part, sous un chemin AVEC ESPACES ET PARENTHESES (essais/test lanceurs/depot copie (1)/ml/evolution/), on recopie lancer.cmd et
   arreter.cmd et on met a la place de evoluer.js un faux maitre : il note ses options et son dossier courant, tient un verrou.json a son pid, et attend
   STOP (il efface alors STOP et le verrou, comme le vrai, et sort en code 0) ; « --code N » le fait sortir tout de suite en code N.
   Ne touche ni a etat/ ni aux taches planifiees.
   node ml/evolution/tests/lanceurs.test.js -> code 0 si tout passe. Windows seulement. Aucune course.
   ===== LE NODE FIXE ET LES TACHES SANS LIMITE DE 72 H (28/11/2026, les lanceurs : installation sur le Ryzen) =====
   En plus : CRLF et ASCII des .cmd et de cache.vbs ; node-fixe.js seul (un faux PATH, de faux node.exe, une sonde de version simulee) ;
   lancer.cmd avec de VRAIS faux node.exe (un petit programme compile ici par PowerShell Add-Type : il repond a --version par sa propre version
   et passe tout le reste au vrai Node, en notant l'appel) ; installer-tache.cmd en essai ET en pose, sous un PATH ou schtasks, powercfg et choice
   sont des pieges (des .cmd du bac qui notent leurs arguments) : le vrai schtasks n'est jamais atteint ; cache.vbs (wscript) sur un faux .cmd. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const EV=path.join(__dirname,'..');
if(process.platform!=='win32'){console.log('test sans objet hors de Windows');process.exit(0);}

const BAC=path.join(EV,'essais','test lanceurs'),RACINE=path.join(BAC,'depot copie (1)'),ICI=path.join(RACINE,'ml','evolution'),ETAT=path.join(ICI,'etat');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}}

fs.rmSync(BAC,{recursive:true,force:true});
fs.mkdirSync(ICI,{recursive:true});
for(const f of ['lancer.cmd','arreter.cmd','installer-tache.cmd','node-fixe.js','cache.vbs'])fs.copyFileSync(path.join(EV,f),path.join(ICI,f));
fs.writeFileSync(path.join(ICI,'evoluer.js'),[
  "'use strict';",
  "const fs=require('fs'),path=require('path');const E=path.join(__dirname,'etat');",
  "fs.writeFileSync(path.join(E,'appel.json'),JSON.stringify({args:process.argv.slice(2),cwd:process.cwd(),node:process.version}));",
  "console.log('faux maitre : depart');",
  "const i=process.argv.indexOf('--code');if(i>=0){console.log('faux maitre : sortie '+process.argv[i+1]);process.exit(+process.argv[i+1]);}",
  "fs.writeFileSync(path.join(E,'verrou.json'),JSON.stringify({pid:process.pid,debut:new Date().toISOString(),battement:new Date().toISOString()}));",
  "const t0=Date.now();const h=setInterval(()=>{if(fs.existsSync(path.join(E,'STOP'))||Date.now()-t0>60000){",
  "  console.log('faux maitre : STOP lu');fs.rmSync(path.join(E,'verrou.json'),{force:true});fs.rmSync(path.join(E,'STOP'),{force:true});clearInterval(h);process.exit(0);}},200);",
  ''].join('\n'));

/* cmd /s /c ""chemin avec espaces\x.cmd" options" ; stdin vide : « pause » passe tout seul. env : un environnement a la place de celui-ci. */
function cmd(fichier,options,attendre,env){
  const ligne='""'+path.join(ICI,fichier)+'"'+(options?' '+options:'')+'"';
  const o={windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],cwd:EV};if(env)o.env=env;
  if(attendre===false)return cp.spawn('cmd.exe',['/d','/s','/c',ligne],o);
  return cp.spawnSync('cmd.exe',['/d','/s','/c',ligne],Object.assign(o,{encoding:'latin1',timeout:120000}));}
const log=()=>{try{return fs.readFileSync(path.join(ETAT,'sortie.log'),'latin1');}catch(e){return '';}};
const appel=()=>{try{return JSON.parse(fs.readFileSync(path.join(ETAT,'appel.json'),'utf8'));}catch(e){return null;}};
const existe=f=>fs.existsSync(path.join(ETAT,f));
const lire=f=>{try{return fs.readFileSync(f,'latin1');}catch(e){return '';}};
const attendre=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
const memeChemin=(a,b)=>!!a&&!!b&&path.resolve(String(a).trim()).toLowerCase()===path.resolve(String(b).trim()).toLowerCase();

/* ===== 0. CRLF ET ASCII DES LANCEURS ===== */
for(const f of ['lancer.cmd','arreter.cmd','sauver-traces.cmd','installer-tache.cmd','cache.vbs']){
  const b=fs.readFileSync(path.join(EV,f));const t=b.toString('latin1');
  const nonAscii=[...b].filter(x=>x>127).length,lfSeuls=(t.match(/(^|[^\r])\n/g)||[]).length,crlf=(t.match(/\r\n/g)||[]).length;
  ok(f+' : ASCII pur et CRLF partout',nonAscii===0&&lfSeuls===0&&crlf>5&&t.endsWith('\r\n'),'octets >127 : '+nonAscii+', LF seuls : '+lfSeuls+', CRLF : '+crlf);
}

/* ===== 1-8. LES TESTS DU 27/11 (le Node du PATH ; pas de population.json dans le bac : le premier Node trouve est ecrit dans node.txt) ===== */
let r=cmd('lancer.cmd','--code 0');
let a=appel();
ok('lancer.cmd a la main : code 0',r.status===0,r.stdout+r.stderr);
ok('lancer.cmd : evoluer.js lance avec les options passees',a&&a.args.join(' ')==='--code 0',JSON.stringify(a));
ok('lancer.cmd : dossier courant = la racine du depot (chemin avec espaces et parentheses)',a&&memeChemin(a.cwd,RACINE),a&&a.cwd);
ok('lancer.cmd : la console de evoluer.js va dans etat/sortie.log',/faux maitre : depart/.test(log())&&/lancement \(main\)/.test(log())&&/fin, code 0/.test(log()),log());
ok('lancer.cmd sans node.txt ni epoque : etat/node.txt ecrit (le premier Node du PATH, qui repond)',existe('node.txt')&&fs.existsSync(lire(path.join(ETAT,'node.txt')).trim()),lire(path.join(ETAT,'node.txt')));

r=cmd('lancer.cmd','--code 2');
ok('lancer.cmd : le code 2 de evoluer.js remonte',r.status===2,r.status+' '+r.stdout);
ok('lancer.cmd : message « il tourne deja » a la main',/tourne deja/.test(r.stdout),r.stdout);

fs.rmSync(path.join(ETAT,'appel.json'),{force:true});
fs.writeFileSync(path.join(ETAT,'ARRETE'),'');
r=cmd('lancer.cmd','auto --code 0');
ok('lancer.cmd auto avec ARRETE : code 0 et rien de lance',r.status===0&&!appel(),r.stdout+JSON.stringify(appel()));
ok('lancer.cmd auto avec ARRETE : le journal le dit',/relance automatique sautee/.test(log()),log().slice(-300));

fs.writeFileSync(path.join(ETAT,'STOP'),'');
r=cmd('lancer.cmd','--code 0');
ok('lancer.cmd a la main : efface ARRETE et STOP, puis lance',!existe('ARRETE')&&!existe('STOP')&&appel()!==null,r.stdout);

r=cmd('lancer.cmd','auto --code 0');a=appel();
ok('lancer.cmd auto sans ARRETE : lance, sans « auto » dans les options',r.status===0&&a&&a.args.join(' ')==='--code 0',JSON.stringify(a)+r.stdout);

fs.rmSync(path.join(ETAT,'appel.json'),{force:true});
const enfant=cmd('lancer.cmd','',false);let sortiLancer=null;enfant.on('exit',c=>{sortiLancer=c;});
for(let i=0;i<100&&!existe('verrou.json');i++)attendre(100);
ok('le faux maitre tourne (verrou.json pose)',existe('verrou.json'));
r=cmd('arreter.cmd','');
ok('arreter.cmd : code 0 et « C\'est arrete » (avec le Node de node.txt)',r.status===0&&/C'est arrete/.test(r.stdout),r.stdout+r.stderr);
ok('arreter.cmd : le verrou est parti, ARRETE reste, STOP efface',!existe('verrou.json')&&existe('ARRETE')&&!existe('STOP'));
ok('le faux maitre a lu STOP',/STOP lu/.test(log()),log().slice(-300));

fs.writeFileSync(path.join(ETAT,'verrou.json'),JSON.stringify({pid:999999,debut:'2026-11-27T00:00:00.000Z',battement:'2026-11-27T00:00:00.000Z'}));
r=cmd('arreter.cmd','');
ok('arreter.cmd, verrou d\'un mort : « Rien ne tournait », STOP efface, ARRETE pose',/Rien ne tournait/.test(r.stdout)&&!existe('STOP')&&existe('ARRETE'),r.stdout);

fs.rmSync(path.join(ETAT,'verrou.json'),{force:true});
r=cmd('arreter.cmd','');
ok('arreter.cmd sans verrou : « C\'est arrete » tout de suite',r.status===0&&/C'est arrete/.test(r.stdout),r.stdout);

/* ===== 9. node-fixe.js SEUL : un faux PATH, de faux node.exe (fichiers vides), une sonde simulee ===== */
const NF=require(path.join(EV,'node-fixe.js'));
const U=path.join(BAC,'unitaire');
const dA=path.join(U,'pa th A'),dB=path.join(U,'path (B)'),dP=path.join(U,'profil'),dL=path.join(U,'local'),dE=path.join(U,'etat');
for(const d of [dA,dB,dP,dL,dE])fs.mkdirSync(d,{recursive:true});
fs.writeFileSync(path.join(dA,'node.exe'),'');fs.writeFileSync(path.join(dB,'node.exe'),'');
const VERSIONS={};VERSIONS[path.join(dA,'node.exe').toLowerCase()]='v24.22.1';VERSIONS[path.join(dB,'node.exe').toLowerCase()]='v24.22.3';
const sonde=f=>VERSIONS[path.resolve(f).toLowerCase()]||null;
const envU={PATH:dA+';"'+dB+'";'+dA,USERPROFILE:dP,LOCALAPPDATA:dL,APPDATA:dL,ProgramFiles:path.join(U,'pf')};
const base={etat:dE,env:envU,ici:path.join(U,'depot','ml','evolution'),execPath:false,sonde};
const pop=v=>fs.writeFileSync(path.join(dE,'population.json'),JSON.stringify({epoque:{courses:'0b1c2d3e4f50',composants:{node:v}}}));
const raz=()=>{for(const f of ['node.txt','population.json','CHANGER-DE-NODE'])fs.rmSync(path.join(dE,f),{force:true});};
const cands=NF.candidats(base);
ok('candidats : les node.exe du PATH dans l\'ordre, sans doublon, guillemets enleves',cands.length===2&&memeChemin(cands[0].fichier,path.join(dA,'node.exe'))&&memeChemin(cands[1].fichier,path.join(dB,'node.exe')),JSON.stringify(cands));
raz();let c=NF.choisir(base);
ok('sans epoque : le premier Node du PATH (v24.22.1) est choisi et ecrit',c.code===0&&memeChemin(c.fichier,path.join(dA,'node.exe'))&&memeChemin(NF.lireNodeTxt(dE),path.join(dA,'node.exe')),JSON.stringify(c));
raz();pop('v24.22.3');c=NF.choisir(base);
ok('epoque en v24.22.3 : le second Node du PATH (le bon) est choisi, pas le premier',c.code===0&&memeChemin(c.fichier,path.join(dB,'node.exe'))&&memeChemin(NF.lireNodeTxt(dE),path.join(dB,'node.exe')),JSON.stringify(c));
raz();pop('v24.22.3');c=NF.choisir(Object.assign({},base,{ecrire:false}));
ok('--sans-ecrire : meme choix, node.txt non ecrit',c.code===0&&memeChemin(c.fichier,path.join(dB,'node.exe'))&&NF.lireNodeTxt(dE)===null,JSON.stringify(c));
raz();pop('v24.22.9');c=NF.choisir(base);let t=c.lignes.join('\n');
ok('aucun Node de la version de l\'epoque : refus (code 2), rien d\'ecrit, le texte dit attendue / trouvees / comment corriger',
  c.code===2&&NF.lireNodeTxt(dE)===null&&/v24\.22\.9/.test(t)&&/v24\.22\.1/.test(t)&&/v24\.22\.3/.test(t)&&/node\.txt/.test(t)&&/Pour corriger/.test(t),t);
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),path.join(U,'absent','node.exe')+'\r\n');c=NF.choisir(base);t=c.lignes.join('\n');
ok('node.txt vers un fichier absent : refus (code 2), il le dit et dit la version attendue',c.code===2&&/n'existe pas/.test(t)&&/v24\.22\.3/.test(t),t);
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),'"'+path.join(dA,'node.exe')+'"\r\n');c=NF.choisir(base);t=c.lignes.join('\n');
ok('node.txt vers un Node d\'une autre version que l\'epoque : refus (code 2), trouvee et attendue dites',c.code===2&&/trouvee : v24\.22\.1/.test(t)&&/attendue : v24\.22\.3/.test(t),t);
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),'\uFEFF'+path.join(dB,'node.exe')+'\n');c=NF.choisir(base);
ok('node.txt bon (avec BOM, fin LF) : accepte, meme si un autre Node passe devant dans le PATH',c.code===0&&memeChemin(c.fichier,path.join(dB,'node.exe')),JSON.stringify(c));
raz();fs.writeFileSync(path.join(dE,'node.txt'),path.join(dA,'node.exe'));c=NF.choisir(base);
ok('node.txt sans epoque en cours : accepte tel quel',c.code===0&&memeChemin(c.fichier,path.join(dA,'node.exe')),JSON.stringify(c));
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),path.join(dA,'node.exe'));fs.writeFileSync(path.join(dE,'CHANGER-DE-NODE'),'');c=NF.choisir(base);
ok('CHANGER-DE-NODE : l\'autre version est acceptee une fois, le texte le dit, le marqueur est efface',c.code===0&&/CHANGEMENT DE NODE VOULU/.test(c.lignes.join('\n'))&&!fs.existsSync(path.join(dE,'CHANGER-DE-NODE')),JSON.stringify(c));
c=NF.choisir(base);
ok('... et la fois suivante, sans marqueur, le refus revient (l\'epoque n\'a pas encore change)',c.code===2,JSON.stringify(c));
/* (28/11/2026, le relecteur) l'installateur ne doit pas manger le marqueur : il ne lance aucune course, l'epoque ne change pas chez lui */
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),path.join(dA,'node.exe'));fs.writeFileSync(path.join(dE,'CHANGER-DE-NODE'),'');
c=NF.choisir(Object.assign({},base,{garderMarqueur:true}));const c2=NF.choisir(base);
ok('--garder-marqueur (installer-tache.cmd) : accepte, le marqueur reste, et le lancer.cmd suivant passe encore puis l\'efface',
  c.code===0&&c2.code===0&&memeChemin(c2.fichier,path.join(dA,'node.exe'))&&!fs.existsSync(path.join(dE,'CHANGER-DE-NODE')),JSON.stringify([c,c2]));
raz();pop('v24.22.3');fs.writeFileSync(path.join(dE,'node.txt'),Buffer.concat([Buffer.from([0xFF,0xFE]),Buffer.from(path.join(dB,'node.exe')+'\r\n','utf16le')]));c=NF.choisir(base);
ok('node.txt en UTF-16 (« Unicode » du Bloc-notes) : lu et accepte',c.code===0&&memeChemin(c.fichier,path.join(dB,'node.exe')),JSON.stringify(c));
raz();fs.writeFileSync(path.join(dE,'population.json'),'{abime');c=NF.choisir(base);
ok('population.json illisible : pas de version attendue, le premier Node est pris et le texte le dit',c.code===0&&/illisible/.test(c.lignes.join('\n')),JSON.stringify(c));
/* les dossiers usuels, avec un PATH vide */
raz();pop('v24.22.3');
const dLoc=path.join(dL,'Programs','nodejs'),dZip=path.join(U,'depot','node-v24.22.3-win-x64','node-v24.22.3-win-x64'),dNvm=path.join(dL,'nvm','v24.22.3');
for(const d of [dLoc,dZip,dNvm])fs.mkdirSync(d,{recursive:true});
for(const d of [dLoc,dZip,dNvm])fs.writeFileSync(path.join(d,'node.exe'),'');
VERSIONS[path.join(dLoc,'node.exe').toLowerCase()]='v24.22.1';VERSIONS[path.join(dNvm,'node.exe').toLowerCase()]='v24.22.0';VERSIONS[path.join(dZip,'node.exe').toLowerCase()]='v24.22.3';
c=NF.choisir(Object.assign({},base,{env:Object.assign({},envU,{PATH:''})}));
ok('PATH vide : cherche dans les dossiers usuels (Programs, nvm, une archive node-v* decompressee en double a cote du depot) et prend celle de l\'epoque',
  c.code===0&&memeChemin(c.fichier,path.join(dZip,'node.exe')),JSON.stringify(c)+'\n'+JSON.stringify(NF.candidats(Object.assign({},base,{env:Object.assign({},envU,{PATH:''})}))));
ok('versionDe sur le vrai Node : la version de ce processus',NF.versionDe(process.execPath)===process.version,NF.versionDe(process.execPath));
ok('versionDe sur un fichier qui n\'est pas un programme : null, sans lever',NF.versionDe(path.join(dA,'node.exe'))===null);

/* ===== 10. LE CONTENU DES TACHES (node-fixe.js taches) ===== */
const TX=path.join(BAC,'taches unitaires (x)');
const tr=NF.ecrireTaches({ici:ICI,sortie:TX,node:'C:\\Program Files (x86)\\node & co\\node.exe',utilisateur:'DOMAINE\\quelqu1',debut:'2026-11-28',systemRoot:'C:\\Windows'});
const lireXml=f=>{const b=fs.readFileSync(f);return {bom:b[0]===0xFF&&b[1]===0xFE,t:b.slice(2).toString('utf16le')};};
for(const tache of tr.taches){
  const x=lireXml(path.join(TX,tache.fichier));
  const args=(/<Arguments>([^<]*)<\/Arguments>/.exec(x.t)||[])[1]||'';
  const de=s=>s.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  const cible=tache.nom==='CashCarEvolution-traces'?'sauver-traces.cmd':'lancer.cmd';
  ok('tache '+tache.nom+' : UTF-16 avec BOM, PT0S, IgnoreNew, sur batterie, StartWhenAvailable, InteractiveToken, droits ordinaires',
    x.bom&&/^<\?xml version="1\.0" encoding="UTF-16"\?>/.test(x.t)&&(x.t.match(/<ExecutionTimeLimit>PT0S<\/ExecutionTimeLimit>/g)||[]).length===1&&!/PT72H/.test(x.t)&&
    /<MultipleInstancesPolicy>IgnoreNew</.test(x.t)&&/<DisallowStartIfOnBatteries>false</.test(x.t)&&/<StopIfGoingOnBatteries>false</.test(x.t)&&
    /<StartWhenAvailable>true</.test(x.t)&&/<LogonType>InteractiveToken</.test(x.t)&&/<RunLevel>LeastPrivilege</.test(x.t)&&/<UserId>DOMAINE\\quelqu1<\/UserId>/.test(x.t),x.t);
  ok('tache '+tache.nom+' : wscript //B cache.vbs puis "'+cible+'" auto, chemins complets entre guillemets (espaces et parentheses)',
    /<Command>C:\\Windows\\System32\\wscript\.exe<\/Command>/.test(x.t)&&de(args)==='//B //Nologo "'+path.join(ICI,'cache.vbs')+'" "'+path.join(ICI,cible)+'" auto'&&
    x.t.includes('<WorkingDirectory>'+ICI.replace(/&/g,'&amp;')+'</WorkingDirectory>'),de(args));
  ok('tache '+tache.nom+' : le Node de ce PC dans la description, & echappe',x.t.includes('C:\\Program Files (x86)\\node &amp; co\\node.exe'),x.t.slice(0,600));
}
const xl=lireXml(path.join(TX,'CashCarEvolution.xml')).t,xr=lireXml(path.join(TX,'CashCarEvolution-relance.xml')).t,xt=lireXml(path.join(TX,'CashCarEvolution-traces.xml')).t;
ok('CashCarEvolution : a l\'ouverture de session de ce compte, 5 minutes apres',/<LogonTrigger>[\s\S]*<UserId>DOMAINE\\quelqu1<\/UserId>[\s\S]*<Delay>PT5M<\/Delay>[\s\S]*<\/LogonTrigger>/.test(xl)&&!/<TimeTrigger>/.test(xl));
ok('relance et traces : toutes les heures, sans fin, decalees de 30 minutes',/<Interval>PT1H<\/Interval>/.test(xr)&&/<Interval>PT1H<\/Interval>/.test(xt)&&!/<Duration>/.test(xr+xt)&&
  /<StartBoundary>2026-11-28T00:05:00<\/StartBoundary>/.test(xr)&&/<StartBoundary>2026-11-28T00:35:00<\/StartBoundary>/.test(xt));
const cmds=lire(path.join(TX,'commandes.txt'));
ok('commandes.txt : schtasks /create /tn NOM /xml FICHIER /f pour les trois, puis powercfg',
  ['CashCarEvolution','CashCarEvolution-relance','CashCarEvolution-traces'].every(n=>cmds.includes('schtasks /create /tn "'+n+'" /xml "'+path.join(TX,n+'.xml')+'" /f'))&&/powercfg \/change standby-timeout-ac 0/.test(cmds),cmds);
let xmlBienForme=null;
try{
  const ps=cp.spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop';foreach($f in Get-ChildItem -LiteralPath '"+TX.replace(/'/g,"''")+"' -Filter *.xml){$x=New-Object System.Xml.XmlDocument;$x.Load($f.FullName);$ns=New-Object System.Xml.XmlNamespaceManager($x.NameTable);$ns.AddNamespace('t','http://schemas.microsoft.com/windows/2004/02/mit/task');[Console]::WriteLine($f.Name+' '+$x.SelectSingleNode('//t:Settings/t:ExecutionTimeLimit',$ns).InnerText+' '+$x.SelectSingleNode('//t:Actions/t:Exec/t:Arguments',$ns).InnerText)}"],{encoding:'utf8',timeout:60000,windowsHide:true});
  xmlBienForme=ps.stdout+ps.stderr;
  ok('les trois .xml se lisent comme du XML (System.Xml) ; PT0S et les arguments relus',ps.status===0&&(ps.stdout.match(/ PT0S \/\/B \/\/Nologo "/g)||[]).length===3,xmlBienForme);
}catch(e){ok('les trois .xml se lisent comme du XML (System.Xml)',false,e.message);}

/* ===== 11. DE VRAIS FAUX node.exe : un relais compile ici, qui dit sa version et passe le reste au vrai Node ===== */
const FN=path.join(BAC,'faux node');fs.mkdirSync(FN,{recursive:true});
const SRC=[
  'using System; using System.IO; using System.Diagnostics;',
  'public static class FauxNode {',
  '  public static int Main(string[] a) {',
  '    string ici = Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location);',
  '    string l = Environment.CommandLine, reste;',
  '    if (l.StartsWith("\\"")) { int j = l.IndexOf(\'"\', 1); reste = j < 0 ? "" : l.Substring(j + 1); } else { int j = l.IndexOf(\' \'); reste = j < 0 ? "" : l.Substring(j); }',
  '    reste = reste.Trim();',
  '    File.AppendAllText(Path.Combine(ici, "appels.txt"), reste + "\\r\\n");',
  '    if (reste == "--version" || reste == "-v") { Console.WriteLine(File.ReadAllText(Path.Combine(ici, "version.txt")).Trim()); return 0; }',
  '    ProcessStartInfo i = new ProcessStartInfo(File.ReadAllText(Path.Combine(ici, "reel.txt")).Trim(), reste); i.UseShellExecute = false;',
  '    Process p = Process.Start(i); p.WaitForExit(); return p.ExitCode;',
  '  }',
  '}'].join('\r\n');
/* le piege : note son nom et ses arguments ; « choice » rend le code ecrit dans reponse.txt ; « schtasks ... /xml F » garde une copie de F */
const SRC_PIEGE=[
  'using System; using System.IO;',
  'public static class Piege {',
  '  public static int Main(string[] a) {',
  '    string exe = System.Reflection.Assembly.GetEntryAssembly().Location;',
  '    string ici = Path.GetDirectoryName(exe), nom = Path.GetFileNameWithoutExtension(exe).ToLower();',
  '    File.AppendAllText(Path.Combine(ici, "appels.txt"), nom + " " + string.Join(" ", a) + "\\r\\n");',
  '    if (nom == "choice") return int.Parse(File.ReadAllText(Path.Combine(ici, "reponse.txt")).Trim());',
  '    if (nom == "schtasks") for (int i = 0; i + 1 < a.Length; i++) if (a[i].ToLower() == "/xml") File.Copy(a[i + 1], Path.Combine(ici, Path.GetFileName(a[i + 1])), true);',
  '    return 0;',
  '  }',
  '}'].join('\r\n');
fs.writeFileSync(path.join(FN,'faux.cs'),SRC);fs.writeFileSync(path.join(FN,'piege.cs'),SRC_PIEGE);
const EXE=path.join(FN,'node.exe'),PIEGE=path.join(FN,'piege.exe');
const q=s=>"'"+s.replace(/'/g,"''")+"'";
const comp=cp.spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
  "$ErrorActionPreference='Stop';Add-Type -TypeDefinition ([IO.File]::ReadAllText("+q(path.join(FN,'faux.cs'))+")) -OutputAssembly "+q(EXE)+" -OutputType ConsoleApplication;"+
  "Add-Type -TypeDefinition ([IO.File]::ReadAllText("+q(path.join(FN,'piege.cs'))+")) -OutputAssembly "+q(PIEGE)+" -OutputType ConsoleApplication"],
  {encoding:'utf8',timeout:120000,windowsHide:true});
const compile=comp.status===0&&fs.existsSync(EXE)&&fs.existsSync(PIEGE);
ok('le faux node.exe et le piege se compilent (PowerShell Add-Type)',compile,comp.stdout+comp.stderr);

function fauxNode(dossier,version){
  fs.mkdirSync(dossier,{recursive:true});fs.copyFileSync(EXE,path.join(dossier,'node.exe'));
  fs.writeFileSync(path.join(dossier,'version.txt'),version);fs.writeFileSync(path.join(dossier,'reel.txt'),process.execPath);
  fs.rmSync(path.join(dossier,'appels.txt'),{force:true});return path.join(dossier,'node.exe');}
const appelsDe=d=>lire(path.join(d,'appels.txt'));
/* un environnement entierement a nous : le PATH (pieges, faux node, System32), le profil et les dossiers usuels dans le bac */
const SYS=path.join(process.env.SystemRoot||'C:\\Windows','System32');
const PROFIL=path.join(BAC,'profil'),LOCAL=path.join(PROFIL,'AppData','Local'),ROAM=path.join(PROFIL,'AppData','Roaming'),PF=path.join(BAC,'Program Files'),TMP=path.join(BAC,'temp');
for(const d of [PROFIL,LOCAL,ROAM,PF,TMP])fs.mkdirSync(d,{recursive:true});
function envAvec(chemins){
  const e={};for(const k of Object.keys(process.env)){if(!/^(path|userprofile|localappdata|appdata|programfiles|programfiles\(x86\)|programw6432|nvm_home|nvm_symlink|fnm_dir|temp|tmp)$/i.test(k))e[k]=process.env[k];}
  return Object.assign(e,{PATH:chemins.concat([SYS,path.join(SYS,'WindowsPowerShell','v1.0')]).join(';'),USERPROFILE:PROFIL,LOCALAPPDATA:LOCAL,APPDATA:ROAM,ProgramFiles:PF,TEMP:TMP,TMP});}
const razEtat=()=>{fs.rmSync(ETAT,{recursive:true,force:true});fs.mkdirSync(ETAT,{recursive:true});};
const popBac=v=>fs.writeFileSync(path.join(ETAT,'population.json'),JSON.stringify({epoque:{courses:'0b1c2d3e4f50',note:'a1b2c3d4e5f6',composants:{node:v}}}));
const lireNodeTxt=()=>lire(path.join(ETAT,'node.txt')).trim();

if(compile){
  const FA=path.join(BAC,'node ancien (A)'),FB=path.join(BAC,'node bon (B)');
  const nA=fauxNode(FA,'v24.22.1'),nB=fauxNode(FB,'v99.0.1');
  const envAB=envAvec([FA,FB]);
  const rv=cp.spawnSync(nA,['--version'],{encoding:'utf8'});const rr=cp.spawnSync(nB,['-e','console.log(process.version)'],{encoding:'utf8'});
  ok('le faux node A dit v24.22.1 ; le faux node B passe un script au vrai Node',rv.stdout.trim()==='v24.22.1'&&rr.stdout.trim()===process.version,rv.stdout+' / '+rr.stdout+rr.stderr);

  /* a. sans node.txt, epoque en v99.0.1 : A passe devant dans le PATH, B est choisi et lance evoluer.js */
  razEtat();popBac('v99.0.1');fauxNode(FA,'v24.22.1');fauxNode(FB,'v99.0.1');
  r=cmd('lancer.cmd','auto --code 0',true,envAB);a=appel();
  ok('lancer.cmd (faux PATH : A v24.22.1 devant, B v99.0.1 derriere, epoque v99.0.1) : code 0, node.txt = B',r.status===0&&memeChemin(lireNodeTxt(),nB),r.status+' '+r.stdout+'\n'+log()+'\nnode.txt='+lireNodeTxt());
  ok('... evoluer.js est lance par B, jamais par A',/evoluer\.js/.test(appelsDe(FB))&&!/evoluer\.js/.test(appelsDe(FA))&&a&&a.args.join(' ')==='--code 0','A : '+appelsDe(FA)+'\nB : '+appelsDe(FB));
  ok('... sortie.log dit le Node choisi et pourquoi',/v99\.0\.1 = la version de l'epoque en cours/.test(log())&&/node\.txt ecrit/.test(log()),log());

  /* b. node.txt bon : B, meme si A passe devant ; A n'est meme pas sonde */
  fauxNode(FA,'v24.22.1');fauxNode(FB,'v99.0.1');fs.rmSync(path.join(ETAT,'appel.json'),{force:true});
  r=cmd('lancer.cmd','--code 0',true,envAB);
  ok('node.txt bon : evoluer.js lance par le Node de node.txt (B), A jamais appele',r.status===0&&/evoluer\.js/.test(appelsDe(FB))&&appelsDe(FA)==='',r.stdout+'\nA : '+appelsDe(FA));

  /* c. aucun Node de la version de l'epoque : refus, code 2, rien de lance, le texte est a l'ecran, dans sortie.log et dans NODE-REFUSE.txt */
  razEtat();popBac('v77.7.7');fauxNode(FA,'v24.22.1');fauxNode(FB,'v99.0.1');
  r=cmd('lancer.cmd','--code 0',true,envAB);
  const refus=lire(path.join(ETAT,'NODE-REFUSE.txt'));
  ok('epoque v77.7.7, aucun Node de cette version : code 2, evoluer.js pas lance, node.txt pas ecrit',r.status===2&&!appel()&&!existe('node.txt'),r.status+' '+r.stdout);
  ok('... le texte dit l\'attendue, les trouvees et comment corriger (ecran, sortie.log, NODE-REFUSE.txt)',
    [r.stdout,log(),refus].every(s=>/v77\.7\.7/.test(s)&&/v24\.22\.1/.test(s)&&/v99\.0\.1/.test(s)&&/node\.txt/.test(s))&&/refuse : Node pas pret/.test(log()),r.stdout+'\n---\n'+refus);

  /* d. node.txt vers un fichier absent */
  razEtat();popBac('v99.0.1');fs.writeFileSync(path.join(ETAT,'node.txt'),path.join(BAC,'nulle part','node.exe')+'\r\n');
  r=cmd('lancer.cmd','auto --code 0',true,envAB);
  ok('node.txt vers un fichier absent : code 2, rien de lance, le texte le dit',r.status===2&&!appel()&&/n'existe pas/.test(r.stdout+log())&&/v99\.0\.1/.test(lire(path.join(ETAT,'NODE-REFUSE.txt'))),r.status+' '+r.stdout);

  /* e. node.txt vers un Node d'une autre version que l'epoque */
  razEtat();popBac('v99.0.1');fs.writeFileSync(path.join(ETAT,'node.txt'),nA+'\r\n');fauxNode(FA,'v24.22.1');
  r=cmd('lancer.cmd','auto --code 0',true,envAB);
  ok('node.txt vers A (v24.22.1) quand l\'epoque est en v99.0.1 : code 2, rien de lance, evoluer.js jamais passe a A',r.status===2&&!appel()&&!/evoluer\.js/.test(appelsDe(FA))&&/trouvee : v24\.22\.1/.test(r.stdout),r.stdout);

  /* f. puis node.txt corrige a la main : ca repart, et NODE-REFUSE.txt s'efface */
  fs.writeFileSync(path.join(ETAT,'node.txt'),nB+'\r\n');
  r=cmd('lancer.cmd','auto --code 0',true,envAB);
  ok('node.txt corrige (B) : code 0, evoluer.js lance, NODE-REFUSE.txt efface',r.status===0&&appel()!==null&&!existe('NODE-REFUSE.txt'),r.stdout);

  /* g. Node seulement dans un dossier usuel (Programs du profil) : PATH sans node */
  razEtat();popBac('v99.0.1');const FC=path.join(LOCAL,'Programs','nodejs');const nC=fauxNode(FC,'v99.0.1');
  r=cmd('lancer.cmd','auto --code 0',true,envAvec([]));
  ok('PATH sans node, Node dans %LOCALAPPDATA%\\Programs\\nodejs : amorce et choix y vont, code 0',r.status===0&&memeChemin(lireNodeTxt(),nC)&&/evoluer\.js/.test(appelsDe(FC)),r.stdout+'\n'+log());
  fs.rmSync(FC,{recursive:true,force:true});

  /* h. arreter.cmd et le Node de node.txt (B) */
  razEtat();fs.writeFileSync(path.join(ETAT,'node.txt'),nB+'\r\n');fauxNode(FA,'v24.22.1');fauxNode(FB,'v99.0.1');
  fs.writeFileSync(path.join(ETAT,'verrou.json'),JSON.stringify({pid:999999,debut:'2026-11-27T00:00:00.000Z',battement:'2026-11-27T00:00:00.000Z'}));
  r=cmd('arreter.cmd','',true,envAvec([FA]));
  ok('arreter.cmd lit le verrou avec le Node de node.txt (B), pas celui du PATH (A)',/Rien ne tournait/.test(r.stdout)&&/-e/.test(appelsDe(FB))&&appelsDe(FA)==='',r.stdout+'\nB : '+appelsDe(FB));

  /* ===== 12. installer-tache.cmd : ESSAI, puis POSE, sous un PATH a pieges (schtasks, powercfg, choice : des .cmd du bac qui notent) ===== */
  const PIEGES=path.join(BAC,'pieges');fs.mkdirSync(PIEGES,{recursive:true});
  const NOTES=path.join(PIEGES,'appels.txt');
  /* des .exe (un .cmd appele sans « call » ne rendrait pas la main a installer-tache.cmd) : le meme piege compile, qui agit selon son nom */
  for(const x of ['schtasks','powercfg','choice'])fs.copyFileSync(PIEGE,path.join(PIEGES,x+'.exe'));
  const envI=envAvec([PIEGES,FA,FB,path.dirname(process.env.ComSpec||path.join(SYS,'cmd.exe'))].concat((process.env.PATH||'').split(';').filter(d=>/\\git\\(cmd|bin)$/i.test(d))));
  razEtat();popBac('v99.0.1');fauxNode(FA,'v24.22.1');fauxNode(FB,'v99.0.1');fs.rmSync(NOTES,{force:true});
  const SORTIE=path.join(BAC,'essai taches (2)');
  r=cmd('installer-tache.cmd','essai "'+SORTIE+'"',true,envI);
  const txt=r.stdout;
  ok('installer-tache.cmd essai : code 0, aucun schtasks / powercfg / choice appele, node.txt pas ecrit',r.status===0&&!fs.existsSync(NOTES)&&!existe('node.txt'),r.status+'\n'+txt+'\npieges : '+lire(NOTES));
  ok('... il ecrit les trois .xml et commandes.txt dans le dossier donne',['CashCarEvolution','CashCarEvolution-relance','CashCarEvolution-traces'].every(n=>fs.existsSync(path.join(SORTIE,n+'.xml')))&&fs.existsSync(path.join(SORTIE,'commandes.txt')),fs.existsSync(SORTIE)?fs.readdirSync(SORTIE).join(', '):'(pas de dossier)');
  ok('... le texte d\'avant le O / N est complet : les trois taches, la veille, l\'envoi (adresse, branche, public, PAS-D-ENVOI), 72 h, remplacement, le Node, enlever',
    /CashCarEvolution"/.test(txt)&&/CashCarEvolution-relance"/.test(txt)&&/CashCarEvolution-traces"/.test(txt)&&/standby-timeout-ac 0/.test(txt)&&
    /ENVOIE SUR INTERNET/.test(txt)&&/adresse :/.test(txt)&&/branche :/.test(txt)&&/public/.test(txt)&&/PAS-D-ENVOI/.test(txt)&&
    /72 heures/.test(txt)&&/REMPLACEES/.test(txt)&&/aucune fenetre noire/.test(txt)&&txt.includes(nB)&&/v99\.0\.1/.test(txt)&&/installer-tache\.cmd enlever/.test(txt)&&/ESSAI : rien n'est pose/.test(txt),txt);
  const xe=lireXml(path.join(SORTIE,'CashCarEvolution-relance.xml')).t;
  ok('... ses taches lancent le bon lancer.cmd (chemin du bac, espaces et parentheses) et nomment le Node de ce PC (B)',
    xe.includes('&quot;'+path.join(ICI,'lancer.cmd')+'&quot; auto')&&xe.includes(nB)&&/PT0S/.test(xe),xe);

  /* pose, reponse N : rien */
  fs.writeFileSync(path.join(PIEGES,'reponse.txt'),'2');fs.rmSync(NOTES,{force:true});
  r=cmd('installer-tache.cmd','',true,envI);
  ok('installer-tache.cmd, reponse N : choice demande, aucun schtasks ni powercfg, « Rien n\'a ete change », node.txt pas ecrit',
    /choice/.test(lire(NOTES))&&!/schtasks|powercfg/.test(lire(NOTES))&&/Rien n'a ete change/.test(r.stdout)&&!existe('node.txt'),r.stdout+'\npieges : '+lire(NOTES));

  /* pose, reponse O : les commandes exactes (vers les pieges) */
  fs.writeFileSync(path.join(PIEGES,'reponse.txt'),'1');fs.rmSync(NOTES,{force:true});
  r=cmd('installer-tache.cmd','',true,envI);
  const n=lire(NOTES);
  ok('installer-tache.cmd, reponse O : schtasks /create /tn NOM /xml ... /f pour les trois, puis powercfg (vers les pieges)',
    ['CashCarEvolution','CashCarEvolution-relance','CashCarEvolution-traces'].every(x=>new RegExp('schtasks /create /tn '+x+' /xml \\S.*\\\\'+x+'\\.xml /f').test(n))&&/powercfg \/change standby-timeout-ac 0/.test(n)&&/Tache "CashCarEvolution-traces" : posee/.test(r.stdout),n+'\n'+r.stdout);
  ok('... node.txt ecrit (B), dossier temporaire des .xml retire',memeChemin(lireNodeTxt(),nB)&&fs.readdirSync(TMP).filter(f=>/^cashcar-taches-/.test(f)).length===0,lireNodeTxt()+' / '+fs.readdirSync(TMP).join(','));
  const xp=lire(path.join(PIEGES,'CashCarEvolution-traces.xml'))?lireXml(path.join(PIEGES,'CashCarEvolution-traces.xml')).t:'';
  ok('... le .xml recu par schtasks : PT0S, sauver-traces.cmd auto par cache.vbs',/<ExecutionTimeLimit>PT0S</.test(xp)&&xp.includes('&quot;'+path.join(ICI,'sauver-traces.cmd')+'&quot; auto')&&xp.includes('cache.vbs'),xp.slice(0,400));

  /* pose avec un Node qui n'est pas celui de l'epoque : rien n'est pose */
  razEtat();popBac('v77.7.7');fs.writeFileSync(path.join(PIEGES,'reponse.txt'),'1');fs.rmSync(NOTES,{force:true});
  r=cmd('installer-tache.cmd','',true,envI);
  ok('installer-tache.cmd avec un Node d\'une autre epoque : code 2, ni question ni schtasks, le texte le dit',r.status===2&&!fs.existsSync(NOTES)&&/RIEN N'A ETE POSE/.test(r.stdout)&&/v77\.7\.7/.test(r.stdout),r.status+' '+r.stdout+'\npieges : '+lire(NOTES));
}

/* ===== 13. cache.vbs : un .cmd lance cache par wscript, ses arguments et son code de sortie ===== */
const DV=path.join(BAC,'dossier vbs (3)');fs.mkdirSync(DV,{recursive:true});
fs.writeFileSync(path.join(DV,'faux lanceur.cmd'),'@echo off\r\n>"%~dp0recu.txt" echo [%1] [%2] [%~3]\r\nexit /b 3\r\n');
const rw=cp.spawnSync(path.join(SYS,'wscript.exe'),['//B','//Nologo',path.join(ICI,'cache.vbs'),path.join(DV,'faux lanceur.cmd'),'auto','a b c'],{encoding:'latin1',timeout:60000});
ok('cache.vbs : lance le .cmd (chemin avec espaces et parentheses), passe ses arguments, rend son code (3)',rw.status===3&&/\[auto\] \["a b c"\] \[\]/.test(lire(path.join(DV,'recu.txt'))),rw.status+' '+lire(path.join(DV,'recu.txt'))+rw.stderr);

const fin=Date.now();(function attendreLancer(){
  if(sortiLancer===null&&Date.now()-fin<15000)return setTimeout(attendreLancer,100);
  ok('lancer.cmd (tache de fond) a fini en code 0 apres l\'arret',sortiLancer===0,String(sortiLancer));
  console.log('\n'+(total-echecs)+' / '+total+' controles passes'+(echecs?' : '+echecs+' ECHEC(S)':''));
  process.exit(echecs?1:0);})();
