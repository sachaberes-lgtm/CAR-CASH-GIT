#!/usr/bin/env node
/* ===== LES TESTS DE ROBUSTESSE DU MAITRE, SANS COURSE (2026-11-27, le correcteur ; d'apres les relectures robustesse et statistique) =====
   usage : node ml/evolution/tests/robustesse.test.js   (code 0 si tout passe ; ~30 s, aucune course jouee)
     verrou-course   : un verrou mort, deux maitres partis a la meme milliseconde (5 fois) : jamais les deux
     verrou-vivant   : le verrou d'un processus node VIVANT dont le battement a une heure de retard : refuse, et son verrou n'est pas touche
     verrou-perdu    : le battement relit verrou.json ; si un autre pid y est, il n'ecrit pas et previent (surPerte)
     verrou-erreur   : verrouiller ne leve jamais (un dossier d'etat impossible : refus, ok:false)
     journaux        : une ligne tronquee en fin de morts / generations / validations / coffre est reparee par charger ; les lignes suivantes comptent
     journal-milieu  : une ligne illisible AU MILIEU d'un journal : charger leve (erreur fatale dite), au lieu d'oublier en silence
     malediction     : une validation forcee (--valider-maintenant, forcee:true) n'entre pas dans la malediction du gagnant
     tmp             : charger efface les restes *.<pid>.tmp d'un processus mort
   Tout l'etat va dans ml/evolution/essais/tests-robustesse/ (efface au debut). */
'use strict';
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const C=require('../commun'),E=require('../evoluer');
const BAC=path.join(C.DOSSIER,'essais','tests-robustesse');
const EXEMPLE=path.join(__dirname,'etat-exemple');
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const attendre=ms=>new Promise(r=>setTimeout(r,ms));
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}
function cfgDans(d){const c=C.lireConfig('config-essai.json');c.dossierEtat=d;c.dossierChampions=path.join(d,'champions');return c;}
function neuf(n){const d=path.join(BAC,n);fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});return d;}

/* un concurrent : node robustesse.test.js --un T dossier : attend l'instant T, verrouille, dit ok/refus, tient 2 s */
if(process.argv[2]==='--un'){
  const cfg=cfgDans(process.argv[4]),T=+process.argv[3];
  while(Date.now()<T){}
  let V;try{V=E.verrouiller(cfg);}catch(e){V={ok:false,raison:'LEVE '+(e&&e.code)};}
  process.stdout.write(JSON.stringify({pid:process.pid,ok:V.ok,raison:V.raison||null,leve:/^LEVE/.test(V.raison||'')})+'\n');
  setTimeout(()=>{if(V.ok)V.lacher();process.exit(0);},2000);
  return;
}
if(process.argv[2]==='--tenir'){
  const cfg=cfgDans(process.argv[3]);cfg.battement_s=1;
  const V=E.verrouiller(cfg);process.stdout.write('ok '+V.ok+'\n');
  setTimeout(()=>process.exit(0),+process.argv[4]||6000);
  return;
}

async function verrouCourse(){
  const d=neuf('verrou-course');let deux=0,leves=0,aucun=0;const N=5;
  for(let i=0;i<N;i++){
    fs.rmSync(path.join(d,'verrou.json'),{force:true});
    fs.writeFileSync(path.join(d,'verrou.json'),JSON.stringify({pid:999999991,debut:'2026-11-27T10:00:00.000Z',battement:'2026-11-27T10:00:00.000Z',config:'config.json'})+'\n');
    const T=Date.now()+1200,S=[];
    await Promise.all([0,1].map(()=>new Promise(r=>{
      const c=spawn(process.execPath,[__filename,'--un',String(T),d],{stdio:['ignore','pipe','inherit']});
      let s='';c.stdout.on('data',x=>s+=x);c.on('exit',()=>{try{S.push(JSON.parse(s.trim()));}catch(e){S.push({ok:false,leve:true,raison:s});}r();});})));
    const ok=S.filter(x=>x.ok).length;if(ok===2)deux++;if(ok===0)aucun++;leves+=S.filter(x=>x.leve).length;
  }
  verdict('verrou-course : deux maitres sur un verrou mort',deux===0&&leves===0&&aucun===0,`${N} essais : les deux tiennent ${deux} fois, aucun ${aucun} fois, exceptions ${leves}`);
}

async function verrouVivant(){
  const d=neuf('verrou-vivant');
  const a=spawn(process.execPath,[__filename,'--tenir',d,'7000'],{stdio:['ignore','pipe','inherit']});
  let sa='';a.stdout.on('data',x=>sa+=x);
  for(let i=0;i<100&&!/ok/.test(sa);i++)await attendre(100);
  const f=path.join(d,'verrou.json');
  const vieux=JSON.stringify({pid:a.pid,debut:'2026-11-27T10:00:00.000Z',battement:'2026-11-27T10:00:00.000Z',config:'config.json'})+'\n';
  fs.writeFileSync(f,vieux);
  const V=E.verrouiller(cfgDans(d));
  await attendre(2500);
  let v=null;try{v=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){}
  verdict('verrou-vivant : on ne prend pas le verrou d\'un maitre vivant en retard',V.ok===false&&v&&v.pid===a.pid,(V.raison||'pris !')+' ; verrou.json dit pid '+(v&&v.pid)+' (A '+a.pid+')');
  if(V.ok)V.lacher();
  await new Promise(r=>a.on('exit',r));
}

async function verrouPerdu(){
  const d=neuf('verrou-perdu');
  const cfg=cfgDans(d);cfg.battement_s=1;
  let perte=null;
  const V=E.verrouiller(cfg,{surPerte:q=>{perte=q;}});
  const f=path.join(d,'verrou.json');
  const autre=JSON.stringify({pid:process.ppid||4,debut:new Date().toISOString(),battement:new Date().toISOString(),config:'config.json'})+'\n';
  fs.writeFileSync(f,autre);
  await attendre(2600);
  const apres=fs.readFileSync(f,'utf8');
  V.lacher();
  const reste=fs.existsSync(f);
  verdict('verrou-perdu : le battement ne reecrit pas le verrou d\'un autre',V.ok&&perte!==null&&apres===autre&&reste,'surPerte « '+perte+' », verrou.json intact '+(apres===autre)+', lacher ne l\'efface pas '+reste);
}

function verrouErreur(){
  const d=neuf('verrou-erreur');
  const fichier=path.join(d,'pas-un-dossier');fs.writeFileSync(fichier,'x');
  let V,leve=null;
  try{V=E.verrouiller(cfgDans(path.join(fichier,'etat')));}catch(e){leve=e;}
  verdict('verrou-erreur : verrouiller ne leve jamais',!leve&&V&&V.ok===false,leve?'LEVE '+leve.message:V.raison);
}

function copieExemple(n){
  const d=neuf(n);
  /* les journaux seulement : population.json de l'exemple porte un genome factice (fait pour le tableau), charger le refuserait */
  for(const x of fs.readdirSync(EXEMPLE))if(/\.jsonl$/.test(x))fs.copyFileSync(path.join(EXEMPLE,x),path.join(d,x));
  return d;
}
const compte=ctx=>({morts:ctx.deja.morts.size,generations:ctx.deja.generations.size,validations:ctx.deja.validations.size,coffre:ctx.deja.coffre.size,maledictions:ctx.maledictions.length});

function journaux(){
  const d=copieExemple('journaux'),cfg=cfgDans(d),muet=()=>{};
  const avant=compte(E.charger(cfg,{dire:muet}));
  for(const n of ['morts.jsonl','generations.jsonl','validations.jsonl','coffre.jsonl']){
    const f=path.join(d,n),t=fs.readFileSync(f,'utf8').split('\n').filter(Boolean);fs.appendFileSync(f,t[t.length-1].slice(0,40));}
  const coupe=compte(E.charger(cfg,{dire:muet}));
  C.ajouterLigne(path.join(d,'morts.jsonl'),{id:'aaaaaaaaaaaa',mort:99,raison:'renvoi'});
  C.ajouterLigne(path.join(d,'generations.jsonl'),{generation:999,date:new Date().toISOString()});
  C.ajouterLigne(path.join(d,'validations.jsonl'),{generation:999,usage:'validation',meneur:'x',champion:'y',graines:[1],malediction:0.5});
  C.ajouterLigne(path.join(d,'coffre.jsonl'),{generation:999,raison:'24h',date:new Date().toISOString()});
  const apres=compte(E.charger(cfg,{dire:muet}));
  const fragments=fs.readdirSync(d).filter(x=>/\.fragment-/.test(x)).length;
  const ok=JSON.stringify(coupe)===JSON.stringify(avant)&&apres.morts===avant.morts+1&&apres.generations===avant.generations+1&&apres.validations===avant.validations+1&&
    apres.coffre===avant.coffre+1&&apres.maledictions===avant.maledictions+1&&fragments===4;
  verdict('journaux : une ligne tronquee en fin est reparee, les suivantes comptent',ok,'avant '+JSON.stringify(avant)+' ; apres coupure '+JSON.stringify(coupe)+' ; apres ajout '+JSON.stringify(apres)+' ; fragments '+fragments);
}

function journalMilieu(){
  const d=copieExemple('journal-milieu'),cfg=cfgDans(d);
  const f=path.join(d,'morts.jsonl'),L=fs.readFileSync(f,'utf8').split('\n');
  L.splice(2,0,'{"id":"casse","mo');fs.writeFileSync(f,L.join('\n'));
  let leve=null;try{E.charger(cfg,{dire:()=>{}});}catch(e){leve=e;}
  verdict('journal-milieu : une ligne illisible au milieu est fatale et dite',!!leve&&/journal illisible/.test(leve.message),leve?leve.message.slice(0,160):'charger n\'a pas leve');
}

function malediction(){
  const d=copieExemple('malediction'),cfg=cfgDans(d),muet=()=>{};
  const avant=E.charger(cfg,{dire:muet}).maledictions.length;
  C.ajouterLigne(path.join(d,'validations.jsonl'),{generation:998,usage:'validation',forcee:true,meneur:'x',champion:'y',graines:[7],malediction:5});
  C.ajouterLigne(path.join(d,'validations.jsonl'),{generation:999,usage:'validation',meneur:'x',champion:'y',graines:[8],malediction:0.25});
  const M=E.charger(cfg,{dire:muet}).maledictions;
  verdict('malediction : les validations forcees n\'y entrent pas',M.length===avant+1&&M[M.length-1]===0.25&&M.indexOf(5)<0,avant+' -> '+M.length+' (derniere '+M[M.length-1]+')');
}

function tmp(){
  const d=copieExemple('tmp'),cfg=cfgDans(d);
  const mort=path.join(d,'population.json.999999993.tmp');fs.writeFileSync(mort,'x');
  fs.mkdirSync(path.join(d,'pilotes'),{recursive:true});const mort2=path.join(d,'pilotes','abc.js.999999994.tmp');fs.writeFileSync(mort2,'x');
  E.charger(cfg,{dire:()=>{}});
  verdict('tmp : charger efface les restes d\'ecriture d\'un processus mort',!fs.existsSync(mort)&&!fs.existsSync(mort2));
}

(async function(){
  const t0=Date.now();
  const T=[verrouCourse,verrouVivant,verrouPerdu,verrouErreur,journaux,journalMilieu,malediction,tmp];
  for(const f of T){try{await f();}catch(e){verdict(f.name+' (exception)',false,String(e&&e.stack||e));}}
  const ko=res.filter(r=>!r.ok);
  dire(`=== ${res.length-ko.length}/${res.length} passent en ${Math.round((Date.now()-t0)/1000)} s${ko.length?' ; ECHOUENT : '+ko.map(r=>r.nom).join(' | '):''}`);
  process.exit(ko.length?1:0);
})();
