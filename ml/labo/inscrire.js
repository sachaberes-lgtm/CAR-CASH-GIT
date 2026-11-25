#!/usr/bin/env node
/* ===== INSCRIRE UN CANDIDAT (2026-11-24, etape 1 bis BOTS-ML) =====
   UNE commande pour qu'un cerveau entre au labo : il est note sur ses graines dans le vrai jeu (ml/bot/noter.js, un processus neuf par
   course), puis son code, sa raison, sa note, chacune de ses courses et son cout s'ecrivent au journal. Ses courses completes
   (enregistrement du jeu + touches) vont au tampon : clore.js y choisira celles qu'on garde.
   usage : node inscrire.js <cerveau.js> --etape 3 --generation 0 --modele opus-5-5 --raison "pourquoi ce changement"
             [--parents c0001,c0004] [--entree 4200 --sortie 1800 --euros 0.09] [--echange demande-reponse.json]
             [--graines 20] [--depart 910000] [--tmax 900] [--coeurs 4] [--carte ville] [--meteo nuit] [--regime allege|max]
             [--note note.json]
           node inscrire.js --valider c0007 [--depart 950000] [--graines 20] …   renote un candidat sur des graines jamais vues
     --tmax      900 s par defaut, comme noter.js (300 jusqu'au 25/11) ; --valider reprend celui du candidat
     --modele    qui a ecrit le code : « main » (ecrit a la main, pas de cout), sinon le modele de l'API (le cout est alors exige)
     --raison    la phrase qui dit ce qui change et pourquoi : elle fait l'arbre et le recit
     --parents   le ou les candidats dont il descend (aucun : une racine)
     --regime    la version du jeu (ml/bot/piloter.js, LE REGIME DU JEU) : max par defaut ; --valider reprend celui du candidat
     --note      une note DEJA faite par `noter.js <ce cerveau> --parties` : inscrite sans rejouer, si elle vient bien de CE code et de CE jeu
   Les graines : depart + 37 × i (celles de noter.js). L'entrainement part de 910000 ; la validation d'ailleurs (950000 par defaut). */
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const VAL=opt('valider',null),stop=m=>{console.log(m);process.exit(1);};
let fichier=A[0]&&!A[0].startsWith('--')?path.resolve(A[0]):null,ligne0=null;
if(VAL){ligne0=L.lire(L.F.cerveaux).find(l=>l.id===VAL);if(!ligne0)stop('candidat inconnu : '+VAL);fichier=path.join(L.RACINE,ligne0.code);}
if(!fichier||!fs.existsSync(fichier))stop('usage : node inscrire.js <cerveau.js> --etape N --generation G --modele M --raison "…"   (detail en tete du fichier)');
/* (2026-11-25, relecture : « inscrire.js note a 300 s par defaut, noter.js et la boucle a 900 s ») LE TEMPS : celui de noter.js par defaut
   (TMAX_DEFAUT de piloter.js, 900 s) ; --valider reprend celui du candidat (une validation a un autre --tmax ne se compare pas a sa note). */
const {TMAX_DEFAUT}=require('../bot/piloter');
const NG=+opt('graines',20),G0=+opt('depart',VAL?950000:910000),TMAX=+opt('tmax',VAL&&ligne0.tmax>0?ligne0.tmax:TMAX_DEFAUT);
if(VAL&&opt('tmax',null)!=null&&ligne0.tmax!==TMAX)console.log(`⚠ ${VAL} a ete note a ${ligne0.tmax} s : cette validation a ${TMAX} s ne se comparera pas a sa note`);
const source=fs.readFileSync(fichier,'utf8'),jeu=L.versionJeu();
if(jeu.propre===false)console.log('⚠ index.html ou figures.js differe du commit '+jeu.commit+' : un rejeu ne se refera que sur CE fichier (empreinte '+jeu.sha+')');
/* le nom que le cerveau se donne (celui que noter.js ecrit dans sa note), puis celui du journal */
const nomBrut=(source.match(/nom\s*:\s*['"]([^'"]+)['"]/)||[])[1]||path.basename(fichier,'.js'),nom=L.nettoyerNom(nomBrut);

/* (2026-11-24, defaut 21 : « --valider renotait au regime maximum un candidat note en allege, sans rien dire ») CE QUI FAIT LA VERSION DU JEU
   d'une note : le regime, la map et la meteo imposees. Tapes a la main, ils valent ; sinon --valider reprend ceux du candidat (une validation
   qui ne se joue pas dans le meme jeu ne se compare pas a sa note), et une inscription prend ceux de noter.js (max, maps tirees). */
const imposes={};
for(const k of ['regime','carte','meteo']){const v=opt(k,null);if(v!=null)imposes[k]=String(v);else if(VAL)imposes[k]=k==='regime'?((ligne0.jeu&&ligne0.jeu.regime)||'max'):(ligne0[k]||null);}
if(imposes.regime!=null&&!['max','allege'].includes(imposes.regime))stop('--regime : max ou allege');
if(VAL){const r0=(ligne0.jeu&&ligne0.jeu.regime)||'max';
  if(imposes.regime!==r0)console.log(`⚠ ${VAL} a ete note au regime ${r0} : cette validation au regime ${imposes.regime} ne se comparera pas a sa note`);
  if(ligne0.carte&&imposes.carte!==ligne0.carte)console.log(`⚠ ${VAL} a ete note sur la map ${ligne0.carte} : cette validation ne se comparera pas a sa note`);}

/* (2026-11-24, defaut 25) refuser AVANT de jouer 10 minutes : la MEME verification que le journal (labo.js inscrire), sur ce qu'on sait deja.
   Avant, un nom « élan », une --generation x ou un parent inconnu n'etaient refuses qu'apres la note, et la note etait perdue. */
const GEN=parseInt(opt('generation',''),10);
if(!Number.isInteger(NG)||NG<1||!Number.isFinite(G0)||!(TMAX>0))stop('--graines (un entier ≥ 1), --depart et --tmax (des nombres)');
if(!VAL){
  const manque=[];
  if(opt('etape',null)==null)manque.push('--etape');if(opt('generation',null)==null)manque.push('--generation');
  if(!opt('modele',null))manque.push('--modele');if(String(opt('raison','')).trim().length<12)manque.push('--raison "une vraie phrase"');
  if(!L.sansCout(opt('modele','main'))&&(opt('entree',null)==null||opt('sortie',null)==null))manque.push('--entree et --sortie (les jetons de l\'API)');
  if(manque.length)stop('il manque : '+manque.join(', '));
  if(!/^\d+$/.test(String(opt('generation')))||!Number.isInteger(GEN))stop('--generation : un entier (0, 1, 2…)');
  if(!L.NOM_OK.test(nom))stop(`le nom du cerveau (« ${nomBrut} », dans nom:'…') ne donne pas un nom simple : des lettres, des chiffres, des tirets`);
  const ids=new Set(L.lire(L.F.cerveaux).map(l=>l.id)),inconnus=String(opt('parents','')).split(',').map(s=>s.trim()).filter(p=>p&&!ids.has(p));
  if(inconnus.length)stop('parent inconnu : '+inconnus.join(', '));
  if(L.generationClose(opt('etape'),GEN))stop(`la generation ${GEN} de l'etape ${opt('etape')} est deja close (journal/generations.jsonl) : inscrire dans la suivante`);
  /* le temps de la note, clore.js sait qu'une inscription est en cours dans cette generation et attend */
  process.on('exit',L.marquerInscription(opt('etape'),GEN));
}

/* LA NOTE : noter.js, tel quel, avec les enregistrements complets — ou une note deja faite (--note) */
fs.mkdirSync(L.D.tampon,{recursive:true});
let N,tmp=null;
if(opt('note',null)){
  try{N=JSON.parse(fs.readFileSync(opt('note'),'utf8'));}catch(e){stop('note illisible : '+e.message);}
  if(!N.parties||!N.parties.length)stop('cette note n\'a pas ses parties (noter.js --parties) : rien n\'est inscrit');
  /* (2026-11-24, defaut 13 : « --note inscrit une note sans verifier qu'elle vient de ce code ni de cette version du jeu ») LA NOTE DOIT ETRE
     CELLE DE CE CODE ET DE CE JEU. Le code : son empreinte sha1 si la note la porte, sinon le nom que le cerveau se donne. Le jeu : son
     empreinte (index.html + figures.js) si la note la porte, sinon sa version (cashcar-vNNN). Puis le regime, la map et la meteo. */
  const shaCode=N.sha_cerveau||N.cerveau_sha||N.code_sha||(N.code&&N.code.sha)||null,shaCode0=L.sha(source);
  if(shaCode){if(!(shaCode0.startsWith(String(shaCode))||String(shaCode).startsWith(shaCode0)))stop(`cette note vient d'un autre code (empreinte ${shaCode} ; ${path.basename(fichier)} : ${shaCode0.slice(0,12)}) : rien n'est inscrit`);}
  else if(N.cerveau!==nomBrut)stop(`cette note est celle de « ${N.cerveau} », pas de « ${nomBrut} » : rien n'est inscrit`);
  const vNote=typeof N.jeu==='string'?N.jeu:(N.jeu&&N.jeu.version),shaJeu=N.jeu_sha||N.empreinte_jeu||(N.jeu&&typeof N.jeu==='object'&&N.jeu.sha)||null;
  if(shaJeu&&shaJeu!==jeu.sha)stop(`cette note a ete faite sur un autre jeu (empreinte ${shaJeu}, aujourd'hui ${jeu.sha}) : ses courses ne se rejoueraient pas. Renoter.`);
  if(vNote!==jeu.version)stop(`cette note a ete faite sur ${vNote}, le jeu est aujourd'hui ${jeu.version} : renoter`);
  if(!shaJeu){const t=Date.parse(N.date),JEU=path.join(L.DEPOT,'VERSION PRINCIPALE'),apres=['index.html','figures.js'].filter(f=>fs.statSync(path.join(JEU,f)).mtimeMs>t);
    if(apres.length)console.log(`⚠ ${apres.join(' et ')} ont ete reecrits apres cette note (${N.date}) et la note ne porte pas l'empreinte du jeu : si le contenu a change, ses rejeux seront DIFFERENTS`);}
  for(const k of ['regime','carte','meteo']){const vu=k==='regime'?(N.regime||'max'):(N[k]||null);
    if(k in imposes&&vu!==imposes[k])stop(`cette note a ete faite avec ${k} = ${vu}, pas ${imposes[k]} : rien n'est inscrit`);}
}else{
  tmp=path.join(L.D.tampon,'note-en-cours-'+process.pid+'.json');
  const args=[path.join(__dirname,'..','bot','noter.js'),fichier,'--graines',String(NG),'--depart',String(G0),'--tmax',String(TMAX),'--sortie',tmp,'--parties'];
  if(opt('coeurs',null)!=null)args.push('--coeurs',String(opt('coeurs')));
  for(const k in imposes)if(imposes[k]!=null)args.push('--'+k,imposes[k]);
  const r=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(r.status!==0||!fs.existsSync(tmp))stop('la note n\'a pas abouti : rien n\'est inscrit');
  N=JSON.parse(fs.readFileSync(tmp,'utf8'));
}
const courses=N.parties.map((p,i)=>({bilan:N.courses[i],partie:p.partie,touches:p.touches}));
const vNote=typeof N.jeu==='string'?N.jeu:(N.jeu&&N.jeu.version)||jeu.version;
const commun={jeu:Object.assign({},jeu,{version:vNote,regime:N.regime||'max'}),graines:N.graines,tmax:N.tmax,carte:N.carte||null,meteo:N.meteo||null,
  note:N.note,courses:courses,echecs:N.echecs};
let ligne;
try{
  if(VAL)ligne=L.valider(VAL,commun);
  else{
    let echange=null;if(opt('echange',null))echange=JSON.parse(fs.readFileSync(opt('echange'),'utf8'));
    const modele=opt('modele');
    ligne=L.inscrire(Object.assign({nom:nom,source:source,etape:opt('etape'),generation:GEN,
      parents:String(opt('parents','')).split(',').map(s=>s.trim()).filter(Boolean),modele:modele,raison:opt('raison'),echange:echange,
      cout:L.sansCout(modele)?null:{entree:+opt('entree'),sortie:+opt('sortie'),euros:opt('euros',null)==null?null:+opt('euros')}},commun));
  }
}catch(e){
  /* la note n'est jamais perdue : elle reste au tampon, et se reinscrit sans rejouer avec --note */
  let garde='';if(tmp){const f=path.join(L.D.tampon,'note-refusee-'+(nom||'cerveau')+'-'+Date.now()+'.json');try{fs.renameSync(tmp,f);garde='\nla note est gardee : '+f+'  (corriger, puis la meme commande avec --note '+f+')';}catch(x){}}
  stop(String(e.message||e)+garde);
}
if(tmp)try{fs.unlinkSync(tmp);}catch(e){}
const enPanne=ligne.courses.filter(c=>c.pannes>0);
if(enPanne.length)console.log(`\n⚠ ${enPanne.length} course(s) avec des decisions coupees (graines ${enPanne.map(c=>c.graine).join(' ')}) : ces courses ne sont pas repetables — cerveau trop lent, ou ordinateur surcharge pendant la note`);
if(VAL)console.log(`\nVALIDATION de ${VAL} (« ${ligne0.nom} ») ecrite : ${ligne.courses.length} courses sur des graines a partir de ${G0} · regime ${commun.jeu.regime}${commun.carte?' · map '+commun.carte:''}`);
else console.log(`\nINSCRIT : ${ligne.id} « ${ligne.nom} » · etape ${ligne.etape}, generation ${ligne.generation} · parents ${ligne.parents.join(', ')||'aucun (racine)'} · ${ligne.courses.length} courses au tampon`
  +(ligne.jumeau?`\n⚠ meme code que ${ligne.jumeau} (un jumeau)`:''));
