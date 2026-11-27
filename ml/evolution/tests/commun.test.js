#!/usr/bin/env node
/* ===== LES TESTS DE commun.js (2026-11-27, INTERFACES.md § 0) : sans course, quelques secondes =====
   usage : node ml/evolution/tests/commun.test.js   (code 0 si tout passe) */
'use strict';
const fs=require('fs'),path=require('path');
const C=require('../commun'),K=require('../courses');
const D=path.join(C.DOSSIER,'essais','tests-commun');
fs.rmSync(D,{recursive:true,force:true});fs.mkdirSync(D,{recursive:true});
let ko=0,n=0;
function ok(nom,v,detail){n++;if(!v)ko++;process.stdout.write((v?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:'')+'\n');}
function leve(f){try{f();return false;}catch(e){return true;}}

/* la semaine ISO (cas connus) */
const S=[['2026-11-27','2026-48'],['2026-01-01','2026-01'],['2027-01-01','2026-53'],['2024-12-30','2025-01'],['2021-01-03','2020-53'],['2026-12-31','2026-53']];
ok('semaineIso',S.every(([d,w])=>C.semaineIso(new Date(d+'T12:00:00Z'))===w),S.map(([d,w])=>d+'→'+C.semaineIso(new Date(d+'T12:00:00Z'))+' (attendu '+w+')').join(', '));

/* l'ecriture atomique : LF exige, pas de .tmp qui reste */
const fa=path.join(D,'sous','a.json');
C.ecrireAtomique(fa,'{"x":1}\n');
ok('ecrireAtomique ecrit',fs.readFileSync(fa,'utf8')==='{"x":1}\n'&&fs.readdirSync(path.dirname(fa)).length===1);
ok('ecrireAtomique refuse un \\r',leve(()=>C.ecrireAtomique(fa,'a\r\nb')));

/* lireJsonl : absent, normal, fin tronquee ignoree, milieu illisible leve */
const fj=path.join(D,'j.jsonl');
ok('lireJsonl absent -> []',Array.isArray(C.lireJsonl(fj))&&C.lireJsonl(fj).length===0);
C.ajouterLigne(fj,{a:1});C.ajouterLigne(fj,{a:2});
ok('lireJsonl normal',JSON.stringify(C.lireJsonl(fj))==='[{"a":1},{"a":2}]');
fs.appendFileSync(fj,'{"a":3,"b');
ok('lireJsonl ignore une fin tronquee',C.lireJsonl(fj).length===2);
/* reparerFins : la met de cote et la coupe ; la ligne suivante n'y est pas collee */
const fc=path.join(D,'courses-2026-48.jsonl');fs.copyFileSync(fj,fc);
K.reparerFins(D);C.ajouterLigne(fc,{a:4});
ok('reparerFins coupe la fin tronquee',JSON.stringify(C.lireJsonl(fc))==='[{"a":1},{"a":2},{"a":4}]'&&fs.readdirSync(D).some(x=>/fragment/.test(x)));
fs.writeFileSync(fj,'{"a":1}\n{"a":\n{"a":3}\n');
ok('lireJsonl leve sur une ligne illisible au milieu',leve(()=>C.lireJsonl(fj)));

/* lireConfig : la surcouche fusionnee en profondeur, tableaux remplaces */
const cfg=C.lireConfig('config-essai.json');
ok('lireConfig fusionne',cfg.mu===4&&cfg.lambda===2&&cfg.graines.coffre.n===2&&cfg.graines.entrainement.depart===910000&&cfg.note.poidsEcart===4&&cfg.note.partiesMin===1&&
  JSON.stringify(cfg.banc.travailleurs)==='[1,2]'&&!!cfg._fichier&&C.lireConfig()._fichier===null);

/* vivant */
ok('vivant',C.vivant(process.pid)&&!C.vivant(999999999));

/* l'epoque : deux lectures de suite egales ; la cle a 7 morceaux */
const e1=K.epoque(C.lireConfig(),{tolererManquants:true}),e2=K.epoque(C.lireConfig(),{tolererManquants:true});
const k=K.cle({shaPilote:'a'.repeat(40),graine:910000,tmax:900},e1);
ok('epoque stable et cle',e1.courses===e2.courses&&e1.note===e2.note&&/^[0-9a-f]{12}$/.test(e1.courses)&&k.split('|').length===7&&k.endsWith('|'+e1.courses),k);

/* (2026-11-27, le correcteur) l'epoque porte le regime : un autre regime, une autre epoque des courses (relecture : « la cle ignore cfg.regime ») */
{const c2=C.lireConfig();c2.regime='max';const e3=K.epoque(c2,{tolererManquants:true});
  ok('le regime entre dans l\'epoque',e1.composants.regime==='allege'&&e3.composants.regime==='max'&&e3.courses!==e1.courses&&/^[0-9a-f]{12}$/.test(e1.composants.fichiers_sha),
    'allege '+e1.courses+', max '+e3.courses);}

/* (2026-11-27, le correcteur) reparerFin sur un journal quelconque (morts.jsonl) : relecture « les journaux du maitre ne sont jamais repares » */
{const fm=path.join(D,'morts.jsonl');C.ajouterLigne(fm,{id:'a'});C.ajouterLigne(fm,{id:'b'});fs.appendFileSync(fm,'{"id":"c","gen');
  const r1=C.reparerFin(fm);C.ajouterLigne(fm,{id:'d'});C.ajouterLigne(fm,{id:'e'});
  ok('reparerFin : la ligne tronquee est mise de cote, les suivantes restent lisibles',r1===true&&JSON.stringify(C.lireJsonl(fm).map(x=>x.id))==='["a","b","d","e"]'&&
    fs.readdirSync(D).some(x=>/^morts\.jsonl\.fragment-/.test(x))&&C.reparerFin(fm)===false&&C.reparerFin(path.join(D,'absent.jsonl'))===false);}

/* (2026-11-27, le correcteur) nettoyerTmp : les .tmp d'un pid mort partent, ceux d'un pid vivant restent */
{const dn=path.join(D,'tmp');fs.mkdirSync(path.join(dn,'pilotes'),{recursive:true});
  const mort=path.join(dn,'population.json.999999998.tmp'),mortSous=path.join(dn,'pilotes','x.js.999999997.tmp'),vif=path.join(dn,'population.json.'+process.pid+'.tmp');
  for(const f of [mort,mortSous,vif])fs.writeFileSync(f,'x');
  const nb=C.nettoyerTmp(dn);
  ok('nettoyerTmp',nb===2&&!fs.existsSync(mort)&&!fs.existsSync(mortSous)&&fs.existsSync(vif),nb+' efface(s)');}

(async function(){
  /* (2026-11-27, le correcteur) ecrireAtomique quand un autre programme tient le fichier ouvert sans FILE_SHARE_DELETE (antivirus, indexeur) :
     relecture robustesse « ecrireAtomique leve EPERM sans reessayer ». Un PowerShell tient le fichier 2,5 s : l'ecriture doit passer apres les reessais.
     Puis, avec un delai de reessai trop court (200 ms), elle leve et ne laisse aucun .tmp. */
  if(process.platform==='win32'){
    const {spawn}=require('child_process');
    const d=path.join(D,'occupe');fs.mkdirSync(d,{recursive:true});
    const f=path.join(d,'population.json');fs.writeFileSync(f,'{"generation":1}\n');
    const tenir=s=>spawn('powershell.exe',['-NoProfile','-Command',"$s=[System.IO.File]::Open('"+f+"','Open','Read','Read'); Start-Sleep -Milliseconds "+s+"; $s.Close()"],{stdio:'ignore',windowsHide:true});
    /* la sonde : renommer le fichier aller-retour ; EPERM / EACCES / EBUSY = il est tenu */
    const attendreOuvert=async()=>{for(let i=0;i<100;i++){
      try{fs.renameSync(f,f+'.sonde');fs.renameSync(f+'.sonde',f);}catch(e){if(e.code==='EPERM'||e.code==='EACCES'||e.code==='EBUSY')return true;}
      await new Promise(r=>setTimeout(r,50));}return false;};
    let ps=tenir(2500);
    const tenu=await attendreOuvert();
    const t0=Date.now();let leveA=null;
    try{C.ecrireAtomique(f,'{"generation":2}\n');}catch(e){leveA=e.code||String(e);}
    ok('ecrireAtomique reessaie quand le fichier est tenu ouvert',tenu&&leveA===null&&fs.readFileSync(f,'utf8')==='{"generation":2}\n'&&!fs.readdirSync(d).some(x=>/\.tmp$/.test(x)),
      'fichier tenu '+tenu+', ecrit apres '+(Date.now()-t0)+' ms'+(leveA?', LEVE '+leveA:''));
    await new Promise(r=>ps.on('exit',r));
    ps=tenir(3000);
    const tenu2=await attendreOuvert();
    let leveB=null;
    try{C.ecrireAtomique(f,'{"generation":3}\n',{total_ms:200});}catch(e){leveB=e.code||String(e);}
    ok('ecrireAtomique : echec final, le .tmp est efface',tenu2&&!!leveB&&!fs.readdirSync(d).some(x=>/\.tmp$/.test(x))&&fs.readFileSync(f,'utf8')==='{"generation":2}\n','leve '+leveB);
    await new Promise(r=>ps.on('exit',r));
  }
  fs.rmSync(D,{recursive:true,force:true});
  process.stdout.write(`=== ${n-ko}/${n} passent\n`);
  process.exit(ko?1:0);
})();
