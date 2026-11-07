/* Test de la garde de publier-maj.js (2026-11-07, achats App Store, passe finale I4) — Node seul, mode --local (rien n'est envoyé, la branche app-maj n'est pas touchée).
   Une édition qui contient achats.js (les achats StoreKit) ne doit jamais viser par défaut un binaire sans le plugin : sans --natif-min explicite, publier-maj.js refuse ;
   avec --natif-min 1.1.0 il écrit latest.json avec natifMin = 1.1.0.
   Lancer : node app-ios/outils/publier-maj-test.cjs   → « OK publier-maj » ou exit 1 avec le cas fautif. (Fabrique deux fois l'édition : ~1 min.) */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
const PM=path.join(__dirname,'..','publier-maj.js');
const rate=m=>{console.error('✗ publier-maj-test : '+m);process.exit(1);};
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'cashcar-pmtest-'));
process.on('exit',()=>{try{fs.rmSync(TMP,{recursive:true,force:true});}catch(e){}});
const joue=(args)=>spawnSync(process.execPath,[PM,'--local',path.join(TMP,'dest')].concat(args),{encoding:'utf8',timeout:600000});

/* (a) sans --natif-min : refus, rien d'écrit */
const a=joue([]);
if(a.status===0)rate('(a) sans --natif-min la publication aurait dû être refusée');
if(!/natif-min/.test(a.stderr))rate('(a) le message devrait nommer --natif-min : '+a.stderr.slice(0,300));
if(!/achats/i.test(a.stderr))rate('(a) le message devrait parler des achats : '+a.stderr.slice(0,300));
if(fs.existsSync(path.join(TMP,'dest','latest.json')))rate('(a) latest.json ne devait pas être écrit');

/* (b) avec --natif-min 1.1.0 : réussi, natifMin posé */
const b=joue(['--natif-min','1.1.0']);
if(b.status!==0)rate('(b) avec --natif-min 1.1.0 la publication aurait dû réussir : '+(b.stderr||b.stdout).slice(0,400));
let L=null;try{L=JSON.parse(fs.readFileSync(path.join(TMP,'dest','latest.json'),'utf8'));}catch(e){rate('(b) latest.json illisible');}
if(L.natifMin!=='1.1.0')rate('(b) natifMin devrait valoir 1.1.0 : '+L.natifMin);
console.log('OK publier-maj');
