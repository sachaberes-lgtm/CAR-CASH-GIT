'use strict';
/* ===== NODE-FIXE.JS : UN NODE FIXE PAR PC, ET LES TACHES PLANIFIEES SANS LIMITE DE 72 H (28/11/2026, les lanceurs : « Il faudrait que lancer.cmd utilise un chemin de Node fixe ») =====
   Ce qui s'est passe sur le Ryzen (28/11) : dans le PATH systeme, C:\Program Files\nodejs passait devant ; un simple « node » lancait v24.22.1 au lieu de
   v24.22.3. Or la version de Node entre dans l'epoque des courses (courses.js, composants.node) : une autre version = une nouvelle epoque, toutes les notes
   repartent de zero. Et une tache posee par « schtasks /create /sc ... » est tuee par Windows au bout de 72 heures (limite par defaut).

   1. LE NODE DE CE PC : etat\node.txt (une ligne : le chemin complet de node.exe ; propre a un PC, comme etat\machine.json, et jamais committe).
      node node-fixe.js choisir --etat <dossier etat> [--sans-ecrire] [--garder-marqueur]
        - etat\node.txt existe : il doit pointer sur un node.exe present, qui repond, et dont la version est celle de l'epoque en cours
          (population.json, epoque.composants.node) quand il y en a une. Sinon : refus, code 2.
        - etat\node.txt n'existe pas : on cherche, dans cet ordre, les node.exe du PATH (le premier = le « node » du PATH, puis les autres, comme
          « where node »), celui qui fait tourner ce script, puis les dossiers usuels (Program Files, Programs du profil, nvm-windows, fnm, Volta, Scoop,
          un dossier node-v* ou nodejs a cote du depot ou dans le profil). Le premier qui a la version de l'epoque est ecrit dans etat\node.txt ;
          sans epoque en cours, le premier qui repond. Aucun n'a la bonne version : refus, code 2, rien n'est ecrit.
        - Le fichier etat\CHANGER-DE-NODE (vide) accepte UNE fois un Node d'une autre version : c'est une nouvelle epoque voulue (notes a zero).
          Il est efface quand il a servi.
        Sortie : ligne 1 = le chemin choisi (lancer.cmd la lit par « set /p ») ; les lignes suivantes expliquent. En refus, tout le texte explique
        (ce qu'il attend, ce qu'il a trouve, comment corriger). Code 0 = choisi, 2 = refus, 1 = erreur de ce script.
   2. LES TACHES : node node-fixe.js taches --ici <ml\evolution> --sortie <dossier> --node <node.exe> [--utilisateur DOMAINE\nom] [--debut AAAA-MM-JJ]
        ecrit dans <dossier> les trois taches en XML (UTF-16, comme les exporte le Planificateur) et commandes.txt (les commandes que
        installer-tache.cmd lance ensuite). Il ne pose rien lui-meme : seul installer-tache.cmd appelle schtasks.
        Les trois taches : sans limite de duree (ExecutionTimeLimit PT0S), demarrent sur batterie et n'y s'arretent pas, partent des que possible
        apres une heure manquee (StartWhenAvailable), une seule instance a la fois (IgnoreNew), sous le compte de la session sans mot de passe
        stocke (InteractiveToken, droits ordinaires), et passent par wscript + cache.vbs : pas de fenetre noire.
   Rien ici ne touche a Windows, au reseau ni a un fichier hors du dossier donne. Exporte ses fonctions pour tests/lanceurs.test.js. */
const fs=require('fs'),path=require('path'),cp=require('child_process');

const NOM_FICHIER='node.txt',MARQUEUR_CHANGEMENT='CHANGER-DE-NODE';
const NOMS_TACHES={logon:'CashCarEvolution',relance:'CashCarEvolution-relance',traces:'CashCarEvolution-traces'};

/* ===== LA VERSION D'UN node.exe (on le lance avec --version : rien d'autre) ===== */
function versionDe(fichier){
  try{
    const r=cp.spawnSync(fichier,['--version'],{encoding:'utf8',timeout:15000,windowsHide:true,stdio:['ignore','pipe','pipe']});
    const m=/^v\d+\.\d+\.\d+\S*/.exec(String(r.stdout||'').trim());
    return m?m[0]:null;
  }catch(e){return null;}
}

/* ===== LA VERSION DE L'EPOQUE EN COURS (etat\population.json, epoque.composants.node) ===== */
function attendueDe(etat){
  const f=path.join(etat,'population.json');
  if(!fs.existsSync(f))return {version:null,pourquoi:'pas encore de population.json : aucune epoque en cours'};
  let j;
  try{j=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){return {version:null,pourquoi:'population.json illisible ('+e.message+') : la version de l\'epoque est inconnue'};}
  const v=j&&j.epoque&&j.epoque.composants&&j.epoque.composants.node;
  if(typeof v==='string'&&/^v\d/.test(v))return {version:v,pourquoi:'epoque '+(j.epoque.courses||'?')+' (population.json)'};
  return {version:null,pourquoi:'population.json ne dit pas la version de Node de son epoque'};
}

/* ===== LES CANDIDATS, DANS L'ORDRE ===== */
function sousDossiers(d,re){try{return fs.readdirSync(d,{withFileTypes:true}).filter(e=>e.isDirectory()&&re.test(e.name)).map(e=>path.join(d,e.name)).sort().reverse();}catch(e){return [];}}
function candidats(o){
  o=o||{};const env=o.env||process.env,ici=o.ici||__dirname;
  const liste=[],vus=new Set();
  const ajouter=(f,source)=>{if(!f)return;const p=path.resolve(String(f).replace(/^"+|"+$/g,''));const k=p.toLowerCase();if(vus.has(k))return;
    let est=false;try{est=fs.statSync(p).isFile();}catch(e){}if(!est)return;vus.add(k);liste.push({fichier:p,source});};
  const cle=n=>{const k=Object.keys(env).find(x=>x.toLowerCase()===n.toLowerCase());return k?env[k]:undefined;};
  /* 1. le PATH, dans l'ordre (le premier = le « node » que lance cmd.exe) */
  const P=String(cle('PATH')||'').split(';').map(s=>s.trim().replace(/^"+|"+$/g,'')).filter(Boolean);
  for(const d of P)ajouter(path.join(d,'node.exe'),'PATH');
  /* 2. le node qui fait tourner ce script */
  if(o.execPath!==false)ajouter(o.execPath||process.execPath,'ce script');
  /* 3. les dossiers usuels */
  const pf=[cle('ProgramFiles'),cle('ProgramW6432'),cle('ProgramFiles(x86)')].filter(Boolean);
  const loc=cle('LOCALAPPDATA'),app=cle('APPDATA'),prof=cle('USERPROFILE');
  for(const d of pf)ajouter(path.join(d,'nodejs','node.exe'),'Program Files');
  if(loc)ajouter(path.join(loc,'Programs','nodejs','node.exe'),'Programs du profil');
  const nvm=[cle('NVM_HOME'),app&&path.join(app,'nvm'),loc&&path.join(loc,'nvm')].filter(Boolean);
  if(cle('NVM_SYMLINK'))ajouter(path.join(cle('NVM_SYMLINK'),'node.exe'),'nvm-windows');
  for(const d of nvm)for(const v of sousDossiers(d,/^v\d/i))ajouter(path.join(v,'node.exe'),'nvm-windows');
  const fnm=[cle('FNM_DIR'),app&&path.join(app,'fnm'),loc&&path.join(loc,'fnm')].filter(Boolean);
  for(const d of fnm)for(const v of sousDossiers(path.join(d,'node-versions'),/^v\d/i))ajouter(path.join(v,'installation','node.exe'),'fnm');
  if(loc)for(const v of sousDossiers(path.join(loc,'Volta','tools','image','node'),/^\d/))ajouter(path.join(v,'node.exe'),'Volta');
  if(prof)for(const a of ['nodejs','nodejs-lts'])for(const v of sousDossiers(path.join(prof,'scoop','apps',a),/./))ajouter(path.join(v,'node.exe'),'Scoop');
  /* un dossier node-v* (une archive .zip decompressee, parfois en double : node-v24.22.3-win-x64\node-v24.22.3-win-x64) ou nodejs, a cote du depot ou dans le profil */
  const racine=path.resolve(ici,'..','..');
  const lieux=[racine,path.dirname(racine)];
  if(prof)for(const s of ['','Downloads','code','tools','outils'])lieux.push(path.join(prof,s));
  for(const d of lieux){
    ajouter(path.join(d,'nodejs','node.exe'),'a cote du depot ou dans le profil');
    for(const v of sousDossiers(d,/^node-v\d/i)){
      ajouter(path.join(v,'node.exe'),'dossier node-v*');
      for(const w of sousDossiers(v,/^node-v\d/i))ajouter(path.join(w,'node.exe'),'dossier node-v*');
    }
  }
  return liste;
}

/* ===== LE CHOIX ===== */
function lireNodeTxt(etat){
  const f=path.join(etat,NOM_FICHIER);
  if(!fs.existsSync(f))return null;
  /* (28/11/2026, le relecteur) un node.txt enregistre en \u00AB Unicode \u00BB par le Bloc-notes est en UTF-16 : on le lit aussi */
  const b=fs.readFileSync(f);
  const brut=b.length>=2&&b[0]===0xFF&&b[1]===0xFE?b.slice(2).toString('utf16le'):b.toString('utf8');
  const t=brut.replace(/^\uFEFF/,'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)[0]||'';
  return t.replace(/^"+|"+$/g,'').trim();
}
function ecrireNodeTxt(etat,fichier){
  fs.mkdirSync(etat,{recursive:true});
  const f=path.join(etat,NOM_FICHIER),t=f+'.'+process.pid+'.tmp';
  fs.writeFileSync(t,fichier+'\r\n');fs.renameSync(t,f);
}
const commentCorriger=(etat,attendue)=>[
  'Pour corriger : ecris dans '+path.join(etat,NOM_FICHIER)+' (une seule ligne) le chemin complet du node.exe '+(attendue?'en version '+attendue:'a utiliser')+',',
  '  par exemple  C:\\Users\\<toi>\\node-'+(attendue||'v24.22.3')+'-win-x64\\node.exe  ; ou installe Node '+(attendue||'')+' (nodejs.org, archive .zip) puis relance.',
  'Pour changer de Node expres (une NOUVELLE EPOQUE : toutes les notes repartent de zero, les courses sont rejouees) : cree un fichier vide',
  '  '+path.join(etat,MARQUEUR_CHANGEMENT)+' puis relance ; il sert une fois.'];

/* o : {etat, ecrire:true, env, ici, execPath, sonde:versionDe} -> {code, fichier, version, lignes[]} */
function choisir(o){
  const etat=o.etat,sonde=o.sonde||versionDe,ecrire=o.ecrire!==false;
  const att=attendueDe(etat),attendue=att.version;
  const changement=fs.existsSync(path.join(etat,MARQUEUR_CHANGEMENT));
  const lignes=[];
  const refus=t=>({code:2,fichier:null,version:null,lignes:['NODE REFUSE : la selection ne part pas.'].concat(t,commentCorriger(etat,attendue))});
  const fini=(fichier,version,quoi)=>{
    if(changement&&attendue&&version!==attendue)
      lignes.push('CHANGEMENT DE NODE VOULU (fichier '+MARQUEUR_CHANGEMENT+') : '+attendue+' -> '+version+' ; une nouvelle epoque commence, les notes repartent de zero.');
    /* le marqueur ne sert qu'une fois, meme quand il n'a rien eu a accepter : il ne doit pas trainer et laisser passer plus tard un changement en silence */
    /* (28/11/2026, le relecteur) sauf --garder-marqueur (installer-tache.cmd) : l'installateur ne lance aucune course, l'epoque ne change donc pas
       chez lui ; s'il effacait le marqueur, le lancer.cmd suivant refuserait le Node qu'il vient d'ecrire dans node.txt. */
    if(changement&&ecrire&&!o.garderMarqueur)try{fs.unlinkSync(path.join(etat,MARQUEUR_CHANGEMENT));}catch(e){}
    if(quoi&&ecrire)ecrireNodeTxt(etat,fichier);
    if(quoi)lignes.push((ecrire?'etat\\'+NOM_FICHIER+' ecrit':'(essai : etat\\'+NOM_FICHIER+' non ecrit)')+' : '+quoi);
    lignes.unshift('node '+version+(attendue?(version===attendue?' = la version de l\'epoque en cours':' (l\'epoque en cours etait en '+attendue+')'):' ('+att.pourquoi+')'));
    lignes.unshift(fichier);
    if(/[^\x20-\x7e]/.test(fichier))lignes.push('ATTENTION : ce chemin porte des lettres accentuees ; cmd.exe peut mal le lire. Mieux : un dossier au nom sans accent.');
    return {code:0,fichier,version,lignes};
  };
  const lu=lireNodeTxt(etat);
  if(lu!==null){
    const ou='etat\\'+NOM_FICHIER+' dit : '+(lu||'(vide)');
    if(!lu||!fs.existsSync(lu))return refus([ou,'  ce fichier n\'existe pas sur ce PC.',attendue?'  La version attendue (celle de l\'epoque en cours) est '+attendue+'.':'']);
    const v=sonde(lu);
    if(!v)return refus([ou,'  ce programme ne repond pas comme Node (node --version ne rend rien).']);
    if(attendue&&v!==attendue&&!changement)return refus([ou,'  version trouvee : '+v,'  version attendue : '+attendue+' ('+att.pourquoi+')',
      '  Lancer avec '+v+' commencerait une nouvelle epoque en silence : toutes les notes repartiraient de zero.']);
    return fini(lu,v,null);
  }
  const vus=[];
  for(const c of candidats(o)){
    const v=sonde(c.fichier);vus.push({fichier:c.fichier,source:c.source,version:v});
    if(!v)continue;
    if(!attendue||v===attendue)return fini(c.fichier,v,attendue?'le premier Node en '+attendue+' trouve ('+c.source+')':'le premier Node trouve ('+c.source+')');
  }
  if(changement&&attendue){const c=vus.find(x=>x.version);if(c)return fini(c.fichier,c.version,'changement de Node voulu ('+c.source+')');}
  const trouves=vus.length?vus.map(x=>'  '+(x.version||'(ne repond pas)')+'  '+x.fichier+'  ['+x.source+']'):['  (aucun node.exe trouve)'];
  return refus(attendue?['Version attendue : '+attendue+' ('+att.pourquoi+'). Aucun Node de cette version trouve. Ceux trouves :'].concat(trouves)
    :['Aucun Node qui repond n\'a ete trouve. Ceux essayes :'].concat(trouves));
}

/* ===== LES TROIS TACHES EN XML ===== */
const xmlEchappe=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function tacheXml(t){
  const declencheur=t.logon
    ?['    <LogonTrigger>','      <Enabled>true</Enabled>','      <UserId>'+xmlEchappe(t.utilisateur)+'</UserId>','      <Delay>PT5M</Delay>','    </LogonTrigger>']
    :['    <TimeTrigger>','      <Repetition>','        <Interval>PT1H</Interval>','        <StopAtDurationEnd>false</StopAtDurationEnd>','      </Repetition>',
      '      <StartBoundary>'+t.debut+'</StartBoundary>','      <Enabled>true</Enabled>','    </TimeTrigger>'];
  return ['<?xml version="1.0" encoding="UTF-16"?>',
    '<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">',
    '  <RegistrationInfo>','    <Description>'+xmlEchappe(t.description)+'</Description>','    <URI>\\'+xmlEchappe(t.nom)+'</URI>','  </RegistrationInfo>',
    '  <Triggers>'].concat(declencheur,[
    '  </Triggers>',
    '  <Principals>','    <Principal id="Author">','      <UserId>'+xmlEchappe(t.utilisateur)+'</UserId>','      <LogonType>InteractiveToken</LogonType>',
    '      <RunLevel>LeastPrivilege</RunLevel>','    </Principal>','  </Principals>',
    '  <Settings>',
    '    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>',
    '    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>',
    '    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>',
    '    <AllowHardTerminate>true</AllowHardTerminate>',
    '    <StartWhenAvailable>true</StartWhenAvailable>',
    '    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>',
    '    <IdleSettings>','      <StopOnIdleEnd>false</StopOnIdleEnd>','      <RestartOnIdle>false</RestartOnIdle>','    </IdleSettings>',
    '    <AllowStartOnDemand>true</AllowStartOnDemand>',
    '    <Enabled>true</Enabled>',
    '    <Hidden>false</Hidden>',
    '    <RunOnlyIfIdle>false</RunOnlyIfIdle>',
    '    <WakeToRun>false</WakeToRun>',
    '    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>',
    '    <Priority>7</Priority>',
    '  </Settings>',
    '  <Actions Context="Author">','    <Exec>','      <Command>'+xmlEchappe(t.commande)+'</Command>','      <Arguments>'+xmlEchappe(t.arguments)+'</Arguments>',
    '      <WorkingDirectory>'+xmlEchappe(t.dossier)+'</WorkingDirectory>','    </Exec>','  </Actions>',
    '</Task>','']).join('\r\n');
}
/* o : {ici, node, utilisateur, debut:'AAAA-MM-JJ', systemRoot} -> [{nom, fichier (nom du .xml), xml, cible}] */
function taches(o){
  const ici=path.resolve(o.ici),wscript=path.join(o.systemRoot||process.env.SystemRoot||'C:\\Windows','System32','wscript.exe');
  const cache=path.join(ici,'cache.vbs'),jour=o.debut||new Date().toISOString().slice(0,10);
  const util=o.utilisateur||((process.env.USERDOMAIN?process.env.USERDOMAIN+'\\':'')+(process.env.USERNAME||''));
  const arg=(cmd,mot)=>'//B //Nologo "'+cache+'" "'+path.join(ici,cmd)+'" '+mot;
  const commun='Node de ce PC : '+o.node+' (ml\\evolution\\etat\\node.txt). Pose par installer-tache.cmd (CASH CAR, selection des bots).';
  return [
    {nom:NOMS_TACHES.logon,logon:true,cible:'lancer.cmd auto',arguments:arg('lancer.cmd','auto'),
      description:'5 minutes apres l\'ouverture de session : lancer.cmd auto (la selection naturelle). '+commun},
    {nom:NOMS_TACHES.relance,logon:false,debut:jour+'T00:05:00',cible:'lancer.cmd auto',arguments:arg('lancer.cmd','auto'),
      description:'Toutes les heures : lancer.cmd auto (ne fait rien si la selection tourne deja, ni apres arreter.cmd). '+commun},
    {nom:NOMS_TACHES.traces,logon:false,debut:jour+'T00:35:00',cible:'sauver-traces.cmd auto',arguments:arg('sauver-traces.cmd','auto'),
      description:'Toutes les heures : sauver-traces.cmd auto (commit des traces et envoi sur la branche evolution-... du depot GitHub). '+commun}
  ].map(t=>{Object.assign(t,{utilisateur:util,commande:wscript,dossier:ici,fichier:t.nom+'.xml'});t.xml=tacheXml(t);return t;});
}
function ecrireTaches(o){
  const sortie=path.resolve(o.sortie);fs.mkdirSync(sortie,{recursive:true});
  const ts=taches(o),cmds=[];
  for(const t of ts){
    fs.writeFileSync(path.join(sortie,t.fichier),Buffer.concat([Buffer.from([0xFF,0xFE]),Buffer.from(t.xml,'utf16le')]));
    cmds.push('schtasks /create /tn "'+t.nom+'" /xml "'+path.join(sortie,t.fichier)+'" /f');
  }
  cmds.push('powercfg /change standby-timeout-ac 0');
  fs.writeFileSync(path.join(sortie,'commandes.txt'),cmds.join('\r\n')+'\r\n');
  return {sortie,taches:ts,commandes:cmds};
}

module.exports={NOM_FICHIER,MARQUEUR_CHANGEMENT,NOMS_TACHES,versionDe,attendueDe,candidats,lireNodeTxt,choisir,tacheXml,taches,ecrireTaches};

/* ===== LIGNE DE COMMANDE ===== */
if(require.main===module){
  const a=process.argv.slice(2),ordre=a[0];
  const opt=n=>{const i=a.indexOf(n);return i>=0&&i+1<a.length?a[i+1]:null;};
  try{
    if(ordre==='choisir'){
      const etat=opt('--etat');if(!etat){console.log('node-fixe.js choisir : --etat <dossier> manque');process.exit(1);}
      const r=choisir({etat:path.resolve(etat),ecrire:!a.includes('--sans-ecrire'),garderMarqueur:a.includes('--garder-marqueur')});
      console.log(r.lignes.filter(l=>l!=='').join('\r\n'));process.exit(r.code);
    }else if(ordre==='taches'){
      const ici=opt('--ici'),sortie=opt('--sortie'),node=opt('--node');
      if(!ici||!sortie||!node){console.log('node-fixe.js taches : --ici, --sortie et --node sont obligatoires');process.exit(1);}
      const r=ecrireTaches({ici,sortie,node,utilisateur:opt('--utilisateur'),debut:opt('--debut')});
      console.log(r.commandes.join('\r\n'));process.exit(0);
    }else{console.log('usage : node node-fixe.js choisir --etat <dossier> [--sans-ecrire] | taches --ici <dossier> --sortie <dossier> --node <node.exe>');process.exit(1);}
  }catch(e){console.log('node-fixe.js : erreur : '+(e&&e.stack||e));process.exit(1);}
}
