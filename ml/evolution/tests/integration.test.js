'use strict';
/* ===== LES TESTS DE L'INTEGRATION DU 27/11 AU SOIR (27/11/2026, l'integrateur des lots « machine », « traces », « gestes ») =====
   Aucune course, aucun reseau, aucune tache planifiee posee, rien d'ecrit hors de essais/integration-tests/ et d'un depot jetable du dossier temporaire.
   1. installer-tache.cmd : CRLF et ASCII ; la troisieme tache (sauver-traces.cmd auto) posee et retiree ; le texte dit ce qui part et ou, avant le O / N ;
      son debut (jusqu'a la question, recopie sans elle) lance pour de vrai dans un depot jetable : l'adresse du depot sans jeton, la branche, et
      l'avertissement quand le dossier n'est pas sur une branche evolution-.
   2. arbre.js : un parent mort au genome v:1 (morts.jsonl d'avant les gestes) et son enfant v:2 : un seul gene change, pas 21 « undefined -> naissance ».
   3. tableau.js : l'en-tete ne dit plus « Rien n'est publie » et nomme sauver-traces.cmd.
   4. config.json : alarmeDistance 0.012 (la moitie de la distance d'une vraie population a la naissance), et ce nombre n'entre dans aucune epoque.
      (28/11, lot « regles ») 0.011 sur 121 genes.
   5. tests/evoluer.test.js : --travailleurs N passe a tous ses lancements (plus de 4 en dur) ; la copie temporaire du relecteur est partie.
   6. README.md : les commandes d'installation et de mise a jour (git fetch, worktree add -b evolution-, merge --no-edit) et le reste demande.
   node ml/evolution/tests/integration.test.js -> code 0 si tout passe. */
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const EV=path.join(__dirname,'..');
const BAC=path.join(EV,'essais','integration-tests');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}}
fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});

/* ===== 1. installer-tache.cmd ===== */
{
  const brut=fs.readFileSync(path.join(EV,'installer-tache.cmd'));const t=brut.toString('latin1');
  ok('installer : ASCII seulement',![...brut].some(o=>o>127));
  ok('installer : CRLF partout',!/[^\r]\n/.test(t)&&t.includes('\r\n'));
  ok('installer : la tache des traces lance sauver-traces.cmd auto toutes les heures',
    /* (28/11/2026, les lanceurs) les taches sont posees par XML (sans limite de 72 h) : le contenu est controle dans tests/lanceurs.test.js */
    /schtasks \/create \/tn "%TACHE_TRACES%" \/xml "%XML%\\%TACHE_TRACES%\.xml" \/f/.test(t)&&t.includes('set "TRACES=%~dp0sauver-traces.cmd"'));
  ok('installer : enlever retire les trois taches',/schtasks \/delete \/tn "%TACHE%"/.test(t)&&/schtasks \/delete \/tn "%RELANCE%"/.test(t)&&/schtasks \/delete \/tn "%TACHE_TRACES%"/.test(t));
  ok('installer : la phrase fausse « Rien n\'est envoye sur Internet » est partie',!/Rien n'est envoye sur Internet/.test(t));
  const iChoix=t.indexOf('choice /c ON');
  const avant=t.slice(0,iChoix);
  ok('installer : avant le O / N, il dit ENVOIE SUR INTERNET, l\'adresse, la branche, ce qui part et PAS-D-ENVOI',
    iChoix>0&&/ENVOIE SUR INTERNET/.test(avant)&&/adresse :  %ORIGINE%/.test(avant)&&/branche :  %BRANCHE%/.test(avant)&&/PAS-D-ENVOI/.test(avant)&&/ni les courses/.test(avant));
  ok('installer : les deux premieres taches et la veille sont gardees',
    /schtasks \/create \/tn "%TACHE%" \/xml "%XML%\\%TACHE%\.xml" \/f/.test(t)&&/schtasks \/create \/tn "%RELANCE%" \/xml "%XML%\\%RELANCE%\.xml" \/f/.test(t)&&
    !/^schtasks \/create [^\r\n]*\/sc /m.test(t)&&/powercfg \/change standby-timeout-ac 0/.test(t));

  /* le debut, pour de vrai : recopie jusqu'a la question (exclue), dans un depot jetable avec espace et parentheses, origin avec un faux jeton */
  if(process.platform==='win32'){
    const D=path.join(os.tmpdir(),'cashcar-integration-installer','depot (2) a'),ICI=path.join(D,'ml','evolution');
    fs.rmSync(path.dirname(D),{recursive:true,force:true});fs.mkdirSync(ICI,{recursive:true});
    fs.copyFileSync(path.join(EV,'histoire.js'),path.join(ICI,'histoire.js'));
    for(const f of ['config.json','commun.js','etat.js','arbre.js','genome.js','graines.js','note.js','node-fixe.js','cache.vbs'])if(fs.existsSync(path.join(EV,f)))fs.copyFileSync(path.join(EV,f),path.join(ICI,f));
    fs.writeFileSync(path.join(ICI,'apercu.cmd'),avant+'exit /b 0\r\n','latin1');
    const git=(a)=>cp.spawnSync('git',a,{cwd:D,encoding:'utf8'});
    git(['init','-q','-b','evolution-essai-integration']);
    fs.writeFileSync(path.join(D,'lisez-moi.txt'),'depot jetable\n');git(['add','lisez-moi.txt']);
    git(['-c','user.name=essai','-c','user.email=essai@exemple.invalid','commit','-q','-m','premier']);
    git(['remote','add','origin','https://quelquun:JETON-SECRET-123@github.com/exemple/depot.git']);
    const lancer=()=>cp.spawnSync('cmd.exe',['/d','/s','/c','""'+path.join(ICI,'apercu.cmd')+'""'],{windowsVerbatimArguments:true,encoding:'latin1',stdio:['ignore','pipe','pipe'],timeout:60000});
    let r=lancer();const s=(r.stdout||'')+(r.stderr||'');
    ok('installer (apercu) : code 0',r.status===0,s.slice(-800));
    ok('installer (apercu) : l\'adresse du depot sans le jeton',s.includes('https://github.com/exemple/depot.git')&&!s.includes('JETON-SECRET'),s);
    ok('installer (apercu) : la branche du dossier',s.includes('branche :  evolution-essai-integration'),s);
    ok('installer (apercu) : pas d\'avertissement sur une branche evolution-',!s.includes('ATTENTION'),s);
    git(['checkout','-q','-b','bots-ecurie']);
    r=lancer();const s2=(r.stdout||'')+(r.stderr||'');
    ok('installer (apercu) : sur bots-ecurie, l\'avertissement « ATTENTION … pas sur une branche evolution- »',/ATTENTION : ce dossier est sur la branche bots-ecurie/.test(s2),s2);
    git(['remote','remove','origin']);
    r=lancer();const s3=(r.stdout||'')+(r.stderr||'');
    ok('installer (apercu) : sans origin, il le dit',s3.includes('(aucune : rien ne pourra partir)'),s3);
    fs.rmSync(path.dirname(D),{recursive:true,force:true});
  }else console.log('(apercu de installer-tache.cmd sans objet hors de Windows)');
}

/* ===== 2. arbre.js : un parent mort v:1, un enfant v:2 ===== */
{
  const Gn=require('../genome'),A=require('../arbre'),ET=require('../etat');
  const cfg=ET.lireConfig();cfg.dossierEtat=path.join(EV,'tests','etat-exemple');
  const D=ET.lire(cfg,{morts:true});
  const enfant=D.pop.vivants.find(v=>v.id==='29a13852a980');
  const parent=D.morts.find(m=>m.id==='f68459c46a57');
  ok('arbre : l\'etat d\'exemple a bien l\'enfant 29a13852a980 et son parent mort f68459c46a57',!!enfant&&!!parent);
  if(enfant&&parent){
    const t=Gn.genomeTemoin(cfg);
    /* le parent : un vrai genome v:1 (les 86 premiers genes, dans leur ordre) */
    const A1={};for(const k of Gn.CLES_V1)A1[k]=t.A[k];
    parent.genome={v:1,A:A1,WV:t.WV.slice(),WS:t.WS.slice()};
    /* l'enfant : le meme, en v:2, un seul gene change */
    const g2=JSON.parse(JSON.stringify(parent.genome));Gn.migrer(g2);g2.A.braqueNitro=Math.round((g2.A.braqueNitro+0.04)*1e4)/1e4;
    enfant.genome=g2;enfant.parents=['f68459c46a57'];
    const M=A.modele(cfg,{donnees:D}),P=A.donneesPage(M,{});
    const i=P.noeuds.findIndex(n=>n[0]==='29a13852a980');
    const diff=i>=0?P.noeuds[i][14]:null;
    /* (28/11/2026, portage) migre jusqu'a la version courante (v:3, 121 genes depuis le portage ; v:2, 107 genes avant) */
    ok('arbre : le parent mort v:1 est lu migre (v:'+Gn.VERSION+', '+Gn.BORNES.length+' genes)',M.individus.some(x=>x.id==='f68459c46a57'&&x.genome&&x.genome.v===Gn.VERSION&&Object.keys(x.genome.A).length===Gn.BORNES.length));
    ok('arbre : un seul changement, braqueNitro (et pas 21 « undefined -> naissance »)',Array.isArray(diff)&&diff.length===1&&P.genes[diff[0][0]]==='braqueNitro',JSON.stringify(diff));
    ok('arbre : morts.jsonl lui-meme n\'est pas reecrit',fs.readFileSync(path.join(cfg.dossierEtat,'morts.jsonl'),'utf8').indexOf('"lacheOn"')<0);
  }
}

/* ===== 3. tableau.js : l'en-tete ===== */
{
  const T=require('../tableau'),ET=require('../etat');
  const E=path.join(BAC,'etat');fs.mkdirSync(E,{recursive:true});
  for(const f of fs.readdirSync(path.join(EV,'tests','etat-exemple')))if(f!=='verrou.json')fs.copyFileSync(path.join(EV,'tests','etat-exemple',f),path.join(E,f));
  const cfg=ET.lireConfig();cfg.dossierEtat=E;
  let r=null,err=null;try{r=T.ecrire(cfg);}catch(e){err=e;}
  const h=fs.existsSync(path.join(E,'tableau.html'))?fs.readFileSync(path.join(E,'tableau.html'),'utf8'):'';
  ok('tableau : ecrit sans erreur, avec l\'arbre et le recit',!err&&h.length>0&&fs.existsSync(path.join(E,'arbre.html'))&&fs.existsSync(path.join(E,'histoire.md')),err&&err.stack);
  ok('tableau : l\'en-tete ne dit plus « Rien n\'est publie »',!/Rien n.est publi/.test(h));
  ok('tableau : l\'en-tete nomme sauver-traces.cmd et la branche a part',/sauver-traces\.cmd/.test(h)&&/jamais sur main/.test(h));
}

/* ===== 4. config.json : l'alarme de diversite ===== */
{
  const C=require('../commun'),K=require('../courses');
  const cfg=C.lireConfig();
  /* (28/11, lot « regles ») 0.011 : la moitie de la distance de naissance remesuree sur 121 genes (0.0221, tests/mesure-distance.js) */
  ok('config : alarmeDistance 0.011 (la moitie de la distance de naissance mesuree sur 121 genes, 0.0221)',cfg.alarmeDistance===0.011);
  const a=K.epoque(cfg),b=K.epoque(Object.assign({},cfg,{alarmeDistance:0.05}));
  ok('config : alarmeDistance n\'entre ni dans l\'epoque des courses ni dans celle des notes',a.courses===b.courses&&a.note===b.note);
}

/* ===== 5. tests/evoluer.test.js ===== */
{
  const t=fs.readFileSync(path.join(EV,'tests','evoluer.test.js'),'utf8');
  ok('evoluer.test : --travailleurs N lu, et plus aucun \'--travailleurs\',\'4\' en dur',/indexOf\('--travailleurs'\)/.test(t)&&!/'--travailleurs','4'/.test(t)&&(t.match(/'--travailleurs',TRAVAILLEURS/g)||[]).length===2);
  ok('evoluer.test : la copie temporaire du relecteur est effacee',!fs.existsSync(path.join(EV,'tests','zz-relecteur-evoluer.tmp.test.js')));
}

/* ===== 6. README.md ===== */
{
  const t=fs.readFileSync(path.join(EV,'README.md'),'utf8');
  const iInst=t.indexOf('INSTALLER SUR UN NOUVEAU PC');
  ok('README : « INSTALLER SUR UN NOUVEAU PC » tout en haut (avant « Lancer »)',iInst>0&&iInst<t.indexOf('## Lancer'));
  ok('README : git fetch, git worktree add -b evolution-<pc> ..\\CASH-CAR-evolution origin/bots-ecurie',
    /git fetch origin/.test(t)&&/git worktree add -b evolution-\S+ \.\.\\CASH-CAR-evolution origin\/bots-ecurie/.test(t));
  ok('README : METTRE A JOUR avec arreter.cmd, git merge --no-edit origin/bots-ecurie, lancer.cmd',/METTRE À JOUR/.test(t)&&/git merge --no-edit origin\/bots-ecurie/.test(t));
  ok('README : l\'arbre, le recit, sauver-traces, PAS-D-ENVOI, les gestes, machine.json',
    /arbre\.html/.test(t)&&/histoire\.md/.test(t)&&/sauver-traces\.cmd/.test(t)&&/PAS-D-ENVOI/.test(t)&&/gestes/i.test(t)&&/machine\.json/.test(t));
  ok('README : sans fin de ligne CRLF',!t.includes('\r'));
}

fs.rmSync(BAC,{recursive:true,force:true});
console.log(echecs?'ECHEC : '+echecs+' / '+total+' controles rates':total+' / '+total+' controles passes');
process.exit(echecs?1:0);
