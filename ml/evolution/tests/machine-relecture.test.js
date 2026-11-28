#!/usr/bin/env node
/* ===== LA RELECTURE DE « MACHINE » : CE QUI CASSAIT, ET CE QUI NE DOIT PLUS CASSER (27/11/2026, le relecteur de « machine ») =====
   usage : node ml/evolution/tests/machine-relecture.test.js   (code 0 si tout passe ; ~15 s, AUCUNE course jouee)
     lancer-parentheses : lancer.cmd copie dans un dossier « avec espaces (2) » (un faux evoluer.js qui ecrit ce qu'il recoit) : avant, cmd.exe
                          refusait tout le fichier (« \ml\evolution\ etait inattendu » : %ICI% sans guillemets dans un bloc entre parentheses) ;
                          les options arrivent entieres, « auto » en premier mot est mange, "" est saute, « --etat auto » garde son auto ;
                          evoluer.js absent : le message s'affiche (code 1)
     machine-abime      : machine.json vide, null, une liste, un dossier, travailleurs "auto" / 0 / 2,5, un autre nom d'ordinateur, un autre
                          nombre de coeurs, plus de courses que de coeurs (retouche) : jamais cru, le banc est a refaire, le nombre reste dans [1, L]
     banc-sans-ecrire   : machine.json impossible a ecrire (un dossier a sa place) : le banc ne leve plus (avant : ERREUR FATALE, a chaque lancement)
     valider-sans-banc  : --valider-maintenant sur un etat neuf, sans machine.json : pas de banc (avant : jusqu'a une heure de banc d'abord)
     config-jamais-ecrit: config.json et config-essai.json ont les memes octets apres tout cela
   Tout va dans ml/evolution/essais/machine-relecture/ (efface au debut ; essais/ est ignore par git). */
'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const C=require('../commun'),E=require('../evoluer');
const BAC=path.join(C.DOSSIER,'essais','machine-relecture');
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}
function neuf(n){const d=path.join(BAC,n);fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});return d;}
const EVOLUER=path.join(C.DOSSIER,'evoluer.js');
const octets=f=>fs.readFileSync(path.join(C.DOSSIER,f)).toString('hex');
const CONFIGS={'config.json':octets('config.json'),'config-essai.json':octets('config-essai.json')};

fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});

/* ---------- lancer.cmd dans un chemin avec espaces ET parentheses ---------- */
function testLancerParentheses(){
  if(process.platform!=='win32'){verdict('lancer.cmd : saute (pas Windows)',true);return;}
  const D=path.join(neuf('depot avec espaces (2)'),'ml','evolution');
  fs.mkdirSync(D,{recursive:true});
  fs.copyFileSync(path.join(C.DOSSIER,'lancer.cmd'),path.join(D,'lancer.cmd'));
  /* (28/11/2026, les lanceurs) lancer.cmd prend son Node par node-fixe.js (etat\node.txt) : il voyage avec lui */
  fs.copyFileSync(path.join(C.DOSSIER,'node-fixe.js'),path.join(D,'node-fixe.js'));
  fs.writeFileSync(path.join(D,'evoluer.js'),"process.stdout.write('ARGV='+JSON.stringify(process.argv.slice(2))+String.fromCharCode(10));\n");
  const lancer=options=>{
    try{fs.rmSync(path.join(D,'etat'),{recursive:true,force:true});}catch(e){}
    const ligne='""'+path.join(D,'lancer.cmd')+'"'+(options?' '+options:'')+'"';
    const r=spawnSync('cmd.exe',['/d','/s','/c',ligne],{windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],encoding:'latin1',cwd:D,timeout:60000});
    let log='';try{log=fs.readFileSync(path.join(D,'etat','sortie.log'),'latin1');}catch(e){}
    const m=/ARGV=(\[.*\])/.exec(log);
    return {code:r.status,sortie:(r.stdout||'')+(r.stderr||''),log:log,argv:m?JSON.parse(m[1]):null};
  };
  let r=lancer('auto --etat "C:\\x (y) z\\etat" "" --bavard');
  verdict('lancer.cmd « avec espaces (2) » : auto mange, "" saute, un chemin a parentheses arrive entier',
    r.code===0&&JSON.stringify(r.argv)===JSON.stringify(['--etat','C:\\x (y) z\\etat','--bavard']),'code '+r.code+' ; argv '+JSON.stringify(r.argv)+' '+r.sortie.trim().slice(0,160));
  r=lancer('--etat auto --aide');
  verdict('lancer.cmd : « --etat auto » garde son auto (mode main, la ligne du premier lancement est dite)',
    r.code===0&&JSON.stringify(r.argv)===JSON.stringify(['--etat','auto','--aide'])&&/Premier lancement sur ce PC/.test(r.sortie),'code '+r.code+' ; argv '+JSON.stringify(r.argv));
  fs.renameSync(path.join(D,'evoluer.js'),path.join(D,'ailleurs.js'));
  r=lancer('auto');
  verdict('lancer.cmd : evoluer.js absent -> code 1 et le message (le bloc entre parentheses se lit malgre le chemin)',
    r.code===1&&/evoluer\.js manque dans/.test(r.sortie)&&/evoluer\.js manque dans/.test(r.log),'code '+r.code+' ; '+r.sortie.trim().slice(0,160));
}

/* ---------- machine.json abime, d'un autre PC, retouche ---------- */
function testMachineAbime(){
  const ici=C.descriptionMachine(),L=ici.cpus;
  const bon=Object.assign({format:C.FORMAT_MACHINE},ici,{travailleurs:Math.max(1,L-1),source:'banc',date:'2026-11-27T00:00:00Z',
    banc:{date:'2026-11-27T00:00:00Z',liste:C.listeBancAuto(L),resultats:[],retenu:Math.max(1,L-1)}});
  const cas=[
    ['vide',''],['null','null'],['une liste','[]'],['tronque',JSON.stringify(bon).slice(0,30)],
    ['travailleurs "auto"',JSON.stringify(Object.assign({},bon,{travailleurs:'auto'}))],
    ['travailleurs 0',JSON.stringify(Object.assign({},bon,{travailleurs:0}))],
    ['travailleurs 2,5',JSON.stringify(Object.assign({},bon,{travailleurs:2.5}))],
    ['autre nom d\'ordinateur',JSON.stringify(Object.assign({},bon,{ordinateur:ici.ordinateur+'-AUTRE'}))],
    ['autre nombre de coeurs',JSON.stringify(Object.assign({},bon,{cpus:L+8}))],
    ['plus de courses que de coeurs (retouche)',JSON.stringify(Object.assign({},bon,{travailleurs:L+3}))],
    ['un dossier',null]];
  for(const [nom,texte] of cas){
    const d=neuf('abime-'+nom.replace(/[^a-z0-9]+/gi,'-'));
    if(texte===null)fs.mkdirSync(path.join(d,'machine.json'));else fs.writeFileSync(path.join(d,'machine.json'),texte);
    const lu=C.lireMachine(d);
    const cfg={travailleurs:'auto',_travailleursConfig:'auto',banc:{travailleurs:'auto'},dossierEtat:d};
    C.resoudreTravailleurs(cfg,{dossierEtat:d});
    verdict('machine.json '+nom+' : pas cru, banc a refaire, nombre dans [1, L]',
      lu.machine===null&&!!lu.pourquoi&&cfg._bancAFaire===true&&cfg._machine===null&&Number.isInteger(cfg.travailleurs)&&cfg.travailleurs>=1&&cfg.travailleurs<=L,
      lu.pourquoi+' -> '+cfg.travailleurs+' (L = '+L+')');
  }
  /* la contre-epreuve : le bon est cru ; plus que L mais mesure par une liste ecrite (dans banc.liste) : cru */
  const d=neuf('abime-bon');fs.writeFileSync(path.join(d,'machine.json'),JSON.stringify(bon));
  const cfg={travailleurs:'auto',_travailleursConfig:'auto',dossierEtat:d};C.resoudreTravailleurs(cfg,{dossierEtat:d});
  verdict('machine.json de ce PC avec un banc reussi : cru, pas de banc',cfg._bancAFaire===false&&cfg.travailleurs===bon.travailleurs&&cfg._travailleursSource==='banc');
  const d2=neuf('abime-liste-ecrite');
  fs.writeFileSync(path.join(d2,'machine.json'),JSON.stringify(Object.assign({},bon,{travailleurs:L+3,banc:Object.assign({},bon.banc,{liste:[L+3],retenu:L+3})})));
  verdict('machine.json : plus que L mais mesure par une liste de banc ecrite a la main : cru',C.lireMachine(d2).machine!==null);
}

/* ---------- le banc ne leve plus quand machine.json ne peut pas s'ecrire ---------- */
async function testBancSansEcrire(){
  const d=neuf('banc-sans-ecrire');fs.mkdirSync(path.join(d,'machine.json'));
  const cfg=C.lireConfig('config-essai.json');cfg.dossierEtat=d;
  const L=[];let R=null,leve=null;
  try{R=await E.banc(cfg,t=>L.push(t),{dossierEtat:d,doitArreter:()=>true});}catch(e){leve=e;}
  verdict('banc : machine.json impossible a ecrire -> pas d\'exception, le repli, et le journal le dit',
    !leve&&R&&R.machine===null&&R.interrompu===true&&R.travailleurs>=1&&R.travailleurs<=2&&L.some(t=>/impossible a ecrire/.test(t)),
    leve?'LEVE '+leve.message:L.slice(-2).join(' / '));
}

/* ---------- --valider-maintenant sans machine.json : pas de banc ---------- */
function testValiderSansBanc(){
  const d=neuf('valider');const et=path.join(d,'etat');
  const t0=Date.now();
  const r=spawnSync(process.execPath,[EVOLUER,'--config','config-essai.json','--etat',path.relative(C.DOSSIER,et),'--valider-maintenant'],
    {cwd:C.RACINE,encoding:'utf8',timeout:120000,windowsHide:true});
  const s=(r.stdout||'')+(r.stderr||'');
  verdict('--valider-maintenant sur un etat neuf sans machine.json : pas de banc, aucune course, sortie rapide',
    /pas de banc pour --valider-maintenant/.test(s)&&!/banc : \d+ courses de/.test(s)&&!fs.existsSync(path.join(et,'machine.json'))&&r.status===1&&
    /sans population/.test(s)&&Date.now()-t0<60000,'code '+r.status+' en '+Math.round((Date.now()-t0)/100)/10+' s ; '+s.trim().split('\n').slice(-3).join(' / ').slice(0,300));
}

(async function(){
  const t0=Date.now();
  testLancerParentheses();
  testMachineAbime();
  await testBancSansEcrire();
  testValiderSansBanc();
  const change=Object.keys(CONFIGS).filter(f=>octets(f)!==CONFIGS[f]);
  verdict('config.json et config-essai.json : les memes octets apres tous ces lancements',!change.length,change.join(' '));
  const ko=res.filter(r=>!r.ok);
  dire((res.length-ko.length)+' / '+res.length+' controles passes en '+Math.round((Date.now()-t0)/1000)+' s'+(ko.length?' : '+ko.length+' ECHEC(S)':''));
  process.exit(ko.length?1:0);
})().catch(e=>{dire('ERREUR '+(e&&e.stack||e));process.exit(1);});
