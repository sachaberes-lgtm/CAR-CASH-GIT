#!/usr/bin/env node
/* ===== LES TESTS DE « MACHINE » : LE MEME DEPOT SUR N'IMPORTE QUEL PC, ET UN MOT DE TRAVERS NE LANCE RIEN (2026-11-27, « machine ») =====
   usage : node ml/evolution/tests/machine.test.js   (code 0 si tout passe ; ~30 s, AUCUNE course jouee)
     options        : lireOptions (--aide/-h/--help, option ou mot inconnu, valeur manquante ou absurde, deux fois, incompatibles, --x=y)
     ligne          : evoluer.js en vrai, avec une option de travers ou --aide : code 2 / 0, en moins de 5 s, ni verrou ni machine.json
                      (toujours avec --config config-essai.json --etat essais/machine/... : meme un controle rate ne lancerait qu'un essai)
     epipe          : un vrai maitre (etat d'essai, STOP pose d'avance : il s'arrete avant toute course) dont on ferme le tube de la console des
                      la premiere ligne : il finit en code 0, et la suite de son journal est dans <etat>/sortie.log
     liste          : la liste « auto » du banc pour L = 1, 2, 4, 8, 12, 16, 32 coeurs ; le repli max(1, L-2), borne par une liste ecrite
     choix          : le meilleur debit sans panne ; a moins de 5 % le plus petit nombre ; rien de valable -> null
     machine.json   : ecrit (atomique) puis relu ; un autre PC, un autre format, un nombre absurde : ignore ; quand refaire le banc
     resolution     : --travailleurs > un nombre dans la config > machine.json > le repli ; config-essai jamais plus de 2 a la fois
     config         : "travailleurs": "abc", 0, une liste de banc vide : lireConfig leve (message clair)
     banc-arrete    : un banc interrompu avant sa premiere course : repli, machine.json « interrompu », banc a refaire ; un bon machine.json
                      n'est jamais ecrase par un banc rate
     refus          : refusDePartir pour de vrai (< 5 s), avec un FAUX ml/ecurie/boucle.js (un node qui dort, jamais le vrai boucle.js) : refuse ;
                      un faux PowerShell lent, absent, ou qui repond n'importe quoi : ne refuse pas, et le dit
   Tout va dans ml/evolution/essais/machine-tests/ (efface au debut ; essais/ est ignore par git). */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,spawnSync}=require('child_process');
const C=require('../commun'),E=require('../evoluer');
const BAC=path.join(C.DOSSIER,'essais','machine-tests');
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}
function neuf(n){const d=path.join(BAC,n);fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});return d;}
const rel=d=>path.relative(C.DOSSIER,d);
const EVOLUER=path.join(C.DOSSIER,'evoluer.js');

fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});

/* ---------- options ---------- */
function testOptions(){
  const L=E.lireOptions,vrai=f=>true;
  const aide=['--aide','--help','-h'].every(a=>L([a]).aide===true&&L(['--config','config-essai.json',a]).aide===true&&L(['--inconnue',a]).aide===true);
  verdict('options : --aide, --help, -h (meme avec d\'autres options) -> l\'aide',aide);
  const mauvais=[
    [['--inconnue'],/option inconnue/],[['foo'],/mot inattendu/],[['--travailleurs'],/attend une valeur/],[['--travailleurs','abc'],/nombre entier/],
    [['--travailleurs','0'],/de 1 a/],[['--travailleurs','-3'],/attend une valeur|nombre entier/],[['--travailleurs','2.5'],/nombre entier/],
    [['--travailleurs','100000'],/de 1 a/],[['--arret-apres','0'],/de 1 a/],[['--arret-apres','x'],/nombre entier/],[['--arret-apres'],/attend une valeur/],
    [['--etat'],/attend une valeur/],[['--etat','--banc'],/attend une valeur/],[['--etat',''],/texte vide/],[['--config','n-existe-pas.json'],/introuvable/],
    [['--banc','--banc'],/deux fois/],[['--banc','--valider-maintenant'],/ne vont pas ensemble/],[['--banc','--travailleurs','3'],/ne vont pas ensemble/],
    [['--une-generation','--arret-apres','2'],/ne vont pas ensemble/],[['--bavard=oui'],/ne prend pas de valeur/],[['-x'],/option inconnue/],
    [['--travailleur','4'],/option inconnue/],[['auto'],/mot inattendu/],[['--arret-apres','3','4'],/mot inattendu/]];
  const rates=mauvais.filter(([a,re])=>{const r=L(a,{existe:f=>/config-essai\.json$/.test(f)});return !(r.erreur&&re.test(r.erreur));});
  verdict('options : '+mauvais.length+' lignes de travers -> une erreur claire chacune',!rates.length,rates.map(x=>x[0].join(' ')+' -> '+JSON.stringify(L(x[0]))).join(' | '));
  const b=L(['--config','config-essai.json','--etat','essais/x','--travailleurs=3','--arret-apres','2','--bavard']);
  verdict('options : une bonne ligne (dont --travailleurs=3) est lue',b.o&&b.o.config==='config-essai.json'&&b.o.etat==='essais/x'&&b.o.travailleurs===3&&b.o.arretApres===2&&
    b.o.bavard===true&&b.o.banc===false,JSON.stringify(b));
  const v=L([]),u=L(['--une-generation']);
  verdict('options : sans option, et --une-generation = --arret-apres 1',v.o&&v.o.arretApres===null&&v.o.travailleurs===null&&u.o&&u.o.arretApres===1,JSON.stringify([v,u]));
}

/* ---------- ligne de commande (un vrai processus, mais jamais la vraie config) ---------- */
function testLigne(){
  const d=neuf('ligne'),et=path.join(d,'etat'),base=['--config','config-essai.json','--etat',rel(et)];
  const cas=[[['--aide'],0,/Usage : node ml\/evolution\/evoluer\.js/,'stdout'],[['-h'],0,/Usage/,'stdout'],[['--inconnue'],2,/option inconnue/,'stderr'],
    [['--travailleurs','abc'],2,/nombre entier/,'stderr'],[['--arret-apres','0'],2,/de 1 a/,'stderr'],[['lancer'],2,/mot inattendu/,'stderr']];
  for(const [a,code,re,ou] of cas){
    const t0=Date.now();
    const r=spawnSync(process.execPath,[EVOLUER,...base,...a],{cwd:C.RACINE,encoding:'utf8',timeout:20000,windowsHide:true});
    const s=Date.now()-t0,texte=ou==='stdout'?r.stdout:r.stderr;
    verdict('ligne : '+a.join(' ')+' -> code '+code+(code?' (erreur + usage)':' (l\'aide)')+', rien de lance',r.status===code&&re.test(texte||'')&&(code===0||/Usage/.test(r.stderr))&&
      !fs.existsSync(path.join(et,'verrou.json'))&&!fs.existsSync(path.join(et,'machine.json'))&&!fs.existsSync(path.join(et,'population.json'))&&s<5000,
      'code '+r.status+', '+s+' ms'+(r.status!==code?' ; '+String(r.stdout+r.stderr).slice(0,300):''));
  }
}

/* ---------- EPIPE : un vrai maitre dont personne ne lit la console ---------- */
function testEpipe(){
  return new Promise(function(fin){
    const d=neuf('epipe'),et=path.join(d,'etat');
    fs.mkdirSync(et,{recursive:true});fs.writeFileSync(path.join(et,'STOP'),'');
    const c=spawn(process.execPath,[EVOLUER,'--config','config-essai.json','--etat',rel(et),'--travailleurs','1'],{cwd:C.RACINE,stdio:['ignore','pipe','pipe'],windowsHide:true});
    let premiere='',coupe=false;
    c.stdout.once('data',function(x){premiere=String(x);coupe=true;c.stdout.destroy();c.stderr.destroy();});
    const garde=setTimeout(()=>{try{c.kill();}catch(e){}},120000);
    c.on('exit',function(code){
      clearTimeout(garde);
      let log='';try{log=fs.readFileSync(path.join(et,'sortie.log'),'utf8');}catch(e){}
      verdict('epipe : console fermee des la premiere ligne -> le maitre finit quand meme en code 0',coupe&&code===0,'code '+code+' ; premiere ligne : '+premiere.trim().slice(0,100));
      verdict('epipe : la suite du journal est dans <etat>/sortie.log (« la console ne repond plus », puis « fin, code 0 »)',
        /la console ne repond plus/.test(log)&&/evoluer : fin, code 0/.test(log)&&!fs.existsSync(path.join(et,'STOP'))&&!fs.existsSync(path.join(et,'verrou.json')),log.slice(-400));
      fin();
    });
  });
}

/* ---------- liste, repli, choix ---------- */
function testListe(){
  const attendu={1:[1],2:[1],4:[2,3],8:[4,6,7],12:[6,8,10,11],16:[8,12,14,15],32:[16,28,30,31]};
  const faux=Object.keys(attendu).filter(L=>JSON.stringify(C.listeBancAuto(+L))!==JSON.stringify(attendu[L]));
  verdict('liste auto : L = 1, 2, 4, 8, 12, 16, 32 -> '+Object.keys(attendu).map(L=>L+':'+attendu[L].join('/')).join(' '),!faux.length,faux.map(L=>L+' -> '+C.listeBancAuto(+L)).join(' ; '));
  const bornes=[2,4,8,12,16,32,3,5,6,7,64].every(L=>C.listeBancAuto(L).every(n=>n>=1&&n<=L)&&new Set(C.listeBancAuto(L)).size===C.listeBancAuto(L).length);
  verdict('liste auto : chacun dans [1, L], sans doublon',bornes);
  const rep=[[1,1],[2,1],[4,2],[8,6],[16,14],[32,30]].every(([L,n])=>C.repliTravailleurs(L,{banc:{travailleurs:'auto'}})===n);
  verdict('repli : max(1, L-2)',rep,[1,2,4,8,16,32].map(L=>L+'->'+C.repliTravailleurs(L,{})).join(' '));
  verdict('repli : borne par une liste de banc ecrite (config-essai [1, 2] : jamais plus de 2)',C.repliTravailleurs(16,{banc:{travailleurs:[1,2]}})===2&&C.repliTravailleurs(2,{banc:{travailleurs:[1,2]}})===1);
  const cfgL={banc:{travailleurs:[3,2,3]}};
  verdict('liste ecrite : gardee (triee, sans doublon) ; "auto" -> la liste auto',JSON.stringify(C.listeBanc(cfgL,8))==='[2,3]'&&JSON.stringify(C.listeBanc({banc:{travailleurs:'auto'}},16))==='[8,12,14,15]');
  const R=(t,d,p,nm,rl)=>({travailleurs:t,coursesParHeure:d,pannes:p||0,nonMesurees:nm||0,relancees:rl||0});
  const cas=[
    [[R(8,100),R(12,130),R(14,150),R(15,149)],14,'le meilleur, a 5 % pres le plus petit (150 / 149 -> 14)'],
    [[R(8,100),R(12,146),R(14,150),R(15,151)],12,'146 est a moins de 5 % de 151 -> 12'],
    [[R(8,100),R(12,130),R(14,170,1),R(15,180,0,1)],12,'une panne ou une non mesuree ecarte le nombre'],
    [[R(4,50),R(6,90,0,0,1)],4,'une course relancee ecarte aussi'],
    [[R(4,50,2),R(6,90,0,3)],null,'rien de valable -> null'],
    [[],null,'aucun resultat -> null'],
    [[R(2,0)],null,'un debit nul ne vaut rien']];
  const rates=cas.filter(([r,n])=>C.choisirTravailleurs(r)!==n);
  verdict('choix du banc : '+cas.length+' cas',!rates.length,rates.map(x=>x[2]+' : '+C.choisirTravailleurs(x[0])).join(' | '));
  const p=E.planBanc(C.lireConfig('config-essai.json'),8);
  verdict('banc de l\'essai : court (1 et 2 a la fois, 4 courses chacun, au plus ~'+Math.round(p.max_s/60)+' min)',JSON.stringify(p.liste)==='[1,2]'&&p.etapes.every(e=>e.courses===4)&&p.max_s<=600,JSON.stringify(p));
  const p16=E.planBanc(C.lireConfig(),16);
  verdict('banc de la vraie config sur 16 coeurs : 8, 12, 14, 15 a la fois, des vagues pleines',JSON.stringify(p16.liste)==='[8,12,14,15]'&&p16.etapes.every(e=>e.courses%e.travailleurs===0&&e.courses>=20),
    p16.etapes.map(e=>e.courses+' a '+e.travailleurs).join(', ')+' ; '+Math.round(p16.min_s/60)+' a '+Math.round(p16.max_s/60)+' min');
}

/* ---------- machine.json ---------- */
function testMachine(){
  const d=neuf('machine');
  verdict('machine.json absent : lireMachine -> null, « absent »',C.lireMachine(d).machine===null&&C.lireMachine(d).pourquoi==='absent');
  const banc={date:'2026-11-27T20:00:00.000Z',resultats:[{travailleurs:2,coursesParHeure:10,pannes:0,nonMesurees:0}],retenu:2};
  const m=C.ecrireMachine(d,{travailleurs:2,source:'banc',banc:banc});
  const lu=C.lireMachine(d).machine,t=fs.readFileSync(path.join(d,'machine.json'),'utf8');
  verdict('machine.json : ecrit puis relu (format, ordinateur, cpus, modeleCpu, memoireGo, node, travailleurs, source, banc)',lu&&lu.format==='evolution-machine-1'&&lu.ordinateur===C.empreintePc()&&t.indexOf(os.hostname())<0&&
    lu.cpus===C.coeursLogiques()&&typeof lu.modeleCpu==='string'&&typeof lu.memoireGo==='number'&&lu.node===process.version&&lu.travailleurs===2&&lu.source==='banc'&&lu.banc.retenu===2&&
    t.indexOf('\r')<0&&!fs.readdirSync(d).some(x=>/\.tmp$/.test(x)),t.slice(0,200));
  verdict('machine.json avec un banc reussi : pas de nouveau banc',C.bancAFaire(lu)===false);
  const autre=Object.assign({},m,{ordinateur:'UN-AUTRE-PC'});fs.writeFileSync(path.join(d,'machine.json'),JSON.stringify(autre));
  const la=C.lireMachine(d);
  verdict('machine.json d\'un autre PC : ignore (le banc sera refait), et dit pourquoi',la.machine===null&&/autre PC/.test(la.pourquoi),la.pourquoi);
  fs.writeFileSync(path.join(d,'machine.json'),JSON.stringify(Object.assign({},m,{cpus:m.cpus+1})));
  verdict('machine.json d\'un autre nombre de coeurs : ignore',C.lireMachine(d).machine===null);
  fs.writeFileSync(path.join(d,'machine.json'),'{"format":"evolution-machine-1",');
  verdict('machine.json tronque : ignore (illisible)',C.lireMachine(d).machine===null&&/illisible/.test(C.lireMachine(d).pourquoi));
  fs.writeFileSync(path.join(d,'machine.json'),JSON.stringify(Object.assign({},m,{travailleurs:0})));
  verdict('machine.json au nombre absurde : ignore',C.lireMachine(d).machine===null&&/absurde/.test(C.lireMachine(d).pourquoi));
  const rate=(o)=>Object.assign({},m,{source:'auto',banc:Object.assign({retenu:null},o)});
  verdict('quand refaire le banc : rate une fois -> oui ; rate '+C.ECHECS_BANC_MAX+' fois -> non ; interrompu -> toujours oui ; pas de banc -> oui',
    C.bancAFaire(rate({echecs:1}))===true&&C.bancAFaire(rate({echecs:C.ECHECS_BANC_MAX}))===false&&C.bancAFaire(rate({echecs:C.ECHECS_BANC_MAX,interrompu:true}))===true&&
    C.bancAFaire(Object.assign({},m,{banc:null}))===true&&C.bancAFaire(null)===true);
}

/* ---------- resolution et controle de la config ---------- */
function testResolution(){
  const d=neuf('resolution');
  const cfg=()=>{const c=C.lireConfig('config-essai.json');c.dossierEtat=d;return c;};
  let c=cfg();C.resoudreTravailleurs(c);
  verdict('sans machine.json : le repli (<= 2 pour l\'essai), source auto, banc a faire',c.travailleurs>=1&&c.travailleurs<=2&&c._travailleursSource==='auto'&&c._bancAFaire===true,
    c.travailleurs+' '+c._travailleursSource);
  C.ecrireMachine(d,{travailleurs:1,source:'banc',banc:{date:new Date().toISOString(),resultats:[],retenu:1}});
  c=cfg();C.resoudreTravailleurs(c);
  verdict('avec machine.json : son nombre, source banc, pas de banc',c.travailleurs===1&&c._travailleursSource==='banc'&&c._bancAFaire===false,c.travailleurs+' '+c._travailleursSource);
  c=cfg();C.resoudreTravailleurs(c,{ligne:2});
  verdict('--travailleurs l\'emporte sur machine.json, sans banc, sans rien ecrire',c.travailleurs===2&&c._travailleursSource==='ligne de commande'&&c._bancAFaire===false&&
    JSON.parse(fs.readFileSync(path.join(d,'machine.json'),'utf8')).travailleurs===1);
  c=cfg();c._travailleursConfig=3;C.resoudreTravailleurs(c);
  verdict('un nombre ecrit dans la config l\'emporte sur machine.json',c.travailleurs===3&&c._travailleursSource==='config'&&c._bancAFaire===false);
  const b=C.lireConfig();
  verdict('config.json : "travailleurs" et "banc.travailleurs" valent "auto" ; lireConfig rend un entier',b._travailleursConfig==='auto'&&b.banc.travailleurs==='auto'&&Number.isInteger(b.travailleurs)&&b.travailleurs>=1,
    JSON.stringify({t:b.travailleurs,s:b._travailleursSource}));
  const e=C.lireConfig('config-essai.json');
  verdict('config-essai.json : "auto", banc [1, 2], jamais plus de 2 a la fois sans --travailleurs',e._travailleursConfig==='auto'&&JSON.stringify(e.banc.travailleurs)==='[1,2]'&&e.travailleurs<=2);
  /* une config de travers : lireConfig leve, avec un message clair */
  const mauvaises=[[{travailleurs:'abc'},/travailleurs doit etre/],[{travailleurs:0},/travailleurs doit etre/],[{travailleurs:2.5},/travailleurs doit etre/],
    [{banc:{travailleurs:[]}},/banc\.travailleurs/],[{banc:{travailleurs:[0,2]}},/banc\.travailleurs/],[{banc:{travailleurs:'tout'}},/banc\.travailleurs/],[{banc:{courses:0}},/banc\.courses/]];
  const rates=mauvaises.filter(([o,re],i)=>{
    const f=path.join(d,'mauvaise-'+i+'.json');fs.writeFileSync(f,JSON.stringify(Object.assign({format:'evolution-config-1',dossierEtat:rel(d)},o)));
    try{C.lireConfig(f);return true;}catch(x){return !re.test(x.message);}});
  verdict('config de travers ('+mauvaises.length+' cas) : lireConfig leve, message clair',!rates.length,rates.map(x=>JSON.stringify(x[0])).join(' | '));
}

/* ---------- un banc interrompu (aucune course) ---------- */
async function testBancArrete(){
  const d=neuf('banc-arrete'),cfg=C.lireConfig('config-essai.json');cfg.dossierEtat=d;
  const dits=[];
  const R=await E.banc(cfg,t=>dits.push(t),{dossierEtat:d,doitArreter:()=>true});
  const m=C.lireMachine(d).machine;
  verdict('banc arrete avant sa premiere course : repli, machine.json interrompu, banc a refaire',R.interrompu===true&&R.retenu===null&&R.travailleurs<=2&&m&&m.source==='auto'&&
    m.banc&&m.banc.interrompu===true&&m.banc.retenu===null&&C.bancAFaire(m)===true&&dits.some(t=>/refait au prochain lancement/.test(t)),JSON.stringify(R)+' '+dits.slice(-1));
  C.ecrireMachine(d,{travailleurs:1,source:'banc',banc:{date:'2026-11-27T20:00:00.000Z',resultats:[],retenu:1}});
  const R2=await E.banc(cfg,t=>dits.push(t),{dossierEtat:d,doitArreter:()=>true});
  const m2=C.lireMachine(d).machine;
  verdict('un bon machine.json n\'est pas ecrase par un banc rate (--banc refait sur un PC charge)',R2.travailleurs===1&&m2.source==='banc'&&m2.banc.retenu===1&&
    dits.some(t=>/on garde 1/.test(t)),dits.slice(-1)[0]);
}

/* ---------- refusDePartir pour de vrai ---------- */
async function testRefus(){
  let t0=Date.now(),r=E.refusDePartir(),s=Date.now()-t0;
  verdict('refus : PowerShell pour de vrai, rien ne tourne -> null, en moins de 5 s',r===null&&s<5000,s+' ms'+(r?' ; '+r:''));
  /* un FAUX boucle.js : un node qui dort, dans un dossier « ecurie » (jamais le vrai ml/ecurie/boucle.js) */
  const fx=path.join(BAC,'faux','ml','ecurie');fs.mkdirSync(fx,{recursive:true});
  const faux=path.join(fx,'boucle.js');fs.writeFileSync(faux,"'use strict';/* faux boucle.js des tests de machine : dort 60 s, ne fait rien */setTimeout(function(){},60000);\n");
  const c=spawn(process.execPath,[faux],{stdio:'ignore',windowsHide:true});
  await new Promise(x=>setTimeout(x,800));
  t0=Date.now();r=E.refusDePartir();s=Date.now()-t0;
  verdict('refus : un faux ml/ecurie/boucle.js qui tourne -> refuse (avec son pid), en moins de 5 s',typeof r==='string'&&r.indexOf('boucle.js')>=0&&r.indexOf(String(c.pid))>=0&&s<5000,s+' ms ; '+r);
  try{c.kill();}catch(e){}
  await new Promise(x=>c.exitCode!==null||c.signalCode!==null?x():c.once('exit',x));
  /* un faux PowerShell lent, absent, ou qui repond n'importe quoi : on part, et on le dit */
  const dits=[];
  t0=Date.now();r=E.refusDePartir({commande:[process.execPath,'-e','setTimeout(function(){},30000)'],timeout_ms:1500,dire:t=>dits.push(t)});s=Date.now()-t0;
  verdict('refus : PowerShell lent (pas de reponse en 1,5 s) -> on part, et on l\'ecrit, sans attendre',r===null&&s<4000&&dits.some(t=>/on part quand meme/.test(t)&&/pas de reponse/.test(t)),s+' ms ; '+dits.slice(-1));
  r=E.refusDePartir({commande:['ce-powershell-n-existe-pas.exe'],dire:t=>dits.push(t)});
  verdict('refus : PowerShell absent -> on part, et on l\'ecrit',r===null&&/introuvable|ENOENT/.test(dits.slice(-1)[0]||''),dits.slice(-1)[0]);
  r=E.refusDePartir({commande:[process.execPath,'-e','console.log("ceci n est pas du JSON")'],dire:t=>dits.push(t)});
  verdict('refus : une reponse illisible -> on part, et on l\'ecrit',r===null&&/illisible/.test(dits.slice(-1)[0]||''),dits.slice(-1)[0]);
  const un=E.processusNode({commande:[process.execPath,'-e','console.log(JSON.stringify({ProcessId:4242,CommandLine:"node C:\\\\x\\\\ml\\\\ecurie\\\\boucle.js"}))']});
  verdict('processusNode : un seul processus (un objet, pas une liste) est lu',Array.isArray(un)&&un.length===1&&un[0].pid===4242&&/ecurie/.test(un[0].ligne),JSON.stringify(un));
  r=E.refusDePartir({commande:[process.execPath,'-e','console.log(JSON.stringify([{ProcessId:4242,CommandLine:"\\"C:\\\\node.exe\\" C:\\\\x\\\\ml\\\\ecurie\\\\boucle.js --nuit"}]))']});
  verdict('refus : la ligne de commande d\'un boucle.js lue par le faux PowerShell -> refuse',typeof r==='string'&&/pid 4242/.test(r),r);
  /* PowerShell hors du PATH (un processus fils sans PATH) : on part */
  if(process.platform==='win32'){
    const code="const E=require("+JSON.stringify(path.join(C.DOSSIER,'evoluer.js'))+");const t=Date.now();const d=[];const r=E.refusDePartir({dire:x=>d.push(x)});"+
      "console.log(JSON.stringify({r:r,ms:Date.now()-t,d:d}));";
    const env=Object.assign({},process.env);for(const k of Object.keys(env))if(/^path$/i.test(k))delete env[k];
    const x=spawnSync(process.execPath,['-e',code],{env:env,encoding:'utf8',timeout:20000,windowsHide:true});
    let j=null;try{j=JSON.parse(String(x.stdout).trim().split('\n').pop());}catch(e){}
    verdict('refus : sans PATH (PowerShell introuvable ou trouve quand meme par Windows) -> null, en moins de 5 s',j&&j.r===null&&j.ms<5000,j?j.ms+' ms ; '+(j.d[0]||'PowerShell trouve quand meme'):String(x.stdout+x.stderr).slice(0,300));
  }
}

(async function(){
  const t0=Date.now();
  testOptions();
  testLigne();
  await testEpipe();
  testListe();
  testMachine();
  testResolution();
  await testBancArrete();
  await testRefus();
  const ko=res.filter(r=>!r.ok);
  dire((res.length-ko.length)+' / '+res.length+' controles passes en '+Math.round((Date.now()-t0)/1000)+' s'+(ko.length?' : '+ko.length+' ECHEC(S)':''));
  process.exit(ko.length?1:0);
})().catch(e=>{dire('ERREUR '+(e&&e.stack||e));process.exit(1);});
