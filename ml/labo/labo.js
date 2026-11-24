#!/usr/bin/env node
/* ===== LA BOITE NOIRE DU LABO (2026-11-24, etape 1 bis BOTS-ML : « tout ce qui n'est pas enregistre au moment ou ca arrive est perdu.
   On pose l'enregistrement avant la premiere boucle, et il tourne tout seul ») =====
   Ce fichier tient LES TRACES. Tout le reste du labo (inscrire.js, clore.js, garder.js, rejouer.js, arbre.js) passe par lui.
     journal/cerveaux.jsonl      une ligne par candidat : numero, parents, etape, generation, modele, LA RAISON du changement, la note,
                                 chaque course (graine, empreinte, fin, ou il est mort), le cout en jetons. On n'y fait qu'AJOUTER.
     journal/validations.jsonl   un candidat renote sur des graines jamais vues (le champion, toujours)
     journal/generations.jsonl   une ligne par generation close : le champion, ce qui a ete garde, pourquoi
     journal/depenses.jsonl      chaque depense d'API : l'etape, le modele, les jetons, les euros
     journal/echanges/           la demande et la reponse de l'API pour chaque candidat (.json.gz) : le recit en a besoin
     cerveaux/<id>-<nom>.js      le code de chaque candidat, tel qu'il a ete note (le journal garde son empreinte sha1)
     rejeux/<id>-g<graine>.json  les courses GARDEES : la graine, la version du jeu, les touches image par image
     trajectoires/               les memes courses, enregistrees par l'enregistreur du jeu (.json.gz), et les traces fines de chaque generation
     tampon/                     HORS GIT : toutes les courses de la generation en cours ; clore.js y choisit, puis le vide
     videos/                     HORS GIT : elles se refont a partir des rejeux
   `LABO_DIR=<dossier>` : un autre labo (les essais des outils ne salissent jamais le vrai journal).
   Lance seul (`node labo.js`) : l'etat du labo — candidats, generations, depenses par etape. */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),{execFileSync}=require('child_process');
const DEPOT=path.join(__dirname,'..','..'),JEU=path.join(DEPOT,'VERSION PRINCIPALE');
const RACINE=process.env.LABO_DIR?path.resolve(process.env.LABO_DIR):__dirname;
const D={journal:path.join(RACINE,'journal'),echanges:path.join(RACINE,'journal','echanges'),cerveaux:path.join(RACINE,'cerveaux'),rejeux:path.join(RACINE,'rejeux'),
  trajectoires:path.join(RACINE,'trajectoires'),tampon:path.join(RACINE,'tampon'),videos:path.join(RACINE,'videos')};
const F={cerveaux:path.join(D.journal,'cerveaux.jsonl'),validations:path.join(D.journal,'validations.jsonl'),generations:path.join(D.journal,'generations.jsonl'),
  depenses:path.join(D.journal,'depenses.jsonl')};
const sha=t=>crypto.createHash('sha1').update(t).digest('hex');
const r2=x=>Math.round(x*100)/100;

/* ----- les fichiers ----- */
function lire(f){
  if(!fs.existsSync(f))return [];
  return fs.readFileSync(f,'utf8').split(/\r?\n/).filter(l=>l.trim()).map((l,i)=>{try{return JSON.parse(l);}catch(e){throw new Error(path.basename(f)+' ligne '+(i+1)+' illisible : '+e.message);}});
}
/* AJOUTER une ligne, jamais reecrire : le journal ne perd rien, meme si l'outil plante juste apres */
function ajouter(f,o){
  fs.mkdirSync(path.dirname(f),{recursive:true});
  const deja=fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
  fs.appendFileSync(f,(deja&&!deja.endsWith('\n')?'\n':'')+JSON.stringify(o)+'\n');
}
/* (2026-11-24, defaut 26 : « un rejeu en cours d'ecriture, ou abime, fait tomber la page ») ECRIRE D'UN COUP : dans un fichier a cote, puis
   renomme. Un lecteur voit l'ancien fichier ou le nouveau, jamais une moitie ; un outil tue en pleine ecriture laisse l'ancien intact. */
function ecrireAtomique(f,d){fs.mkdirSync(path.dirname(f),{recursive:true});const t=f+'.'+process.pid+'.ecriture';fs.writeFileSync(t,d);fs.renameSync(t,f);}
function ecrireGz(f,o){ecrireAtomique(f,zlib.gzipSync(Buffer.from(JSON.stringify(o)),{level:9}));}
function lireGz(f){return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'));}

/* ----- LA VERSION DU JEU : « un rejeu n'est exact que sur la version du jeu qui l'a produit » (plan, 5.5) -----
   version = le cache annonce (cashcar-vNNN) · commit = ou en est git · sha = l'empreinte de ce que le simulateur charge VRAIMENT
   (index.html + figures.js) : c'est elle qui tranche. `propre` = ces deux fichiers sont ceux du commit (rien de modifie a la main). */
function versionJeu(){
  const lis=f=>fs.readFileSync(path.join(JEU,f));
  const v={version:(String(lis('sw.js')).match(/cashcar-v\d+/)||['?'])[0],sha:sha(Buffer.concat([lis('index.html'),lis('figures.js')])).slice(0,12),commit:null,propre:null};
  try{v.commit=execFileSync('git',['rev-parse','--short','HEAD'],{cwd:DEPOT,encoding:'utf8'}).trim();
    v.propre=!execFileSync('git',['status','--porcelain','--','VERSION PRINCIPALE/index.html','VERSION PRINCIPALE/figures.js'],{cwd:DEPOT,encoding:'utf8'}).trim();}catch(e){}
  return v;
}

/* ----- LES TOUCHES, serrees : [image, touche, 1|0] → « 12N5n… » (le nombre d'images depuis le changement d'avant, puis la touche :
   MAJUSCULE = enfoncee, minuscule = relachee ; G D H B N = ← → ↑ ↓ ESPACE). ~4 octets par changement au lieu de 12. ----- */
/* (2026-11-24, doigts v2) UNE LETTRE DE PLUS, C : la seconde chance. « C » = la plaque CONTINUER touchee et acceptee, « c » = l'attente de la plaque
   abandonnee (ml/bot/piloter.js, rejouer). Sans elle dans l'expression, un C serait avale en silence et le rejeu sortirait « different ». */
function coderTouches(T){let d=0,s='';for(const t of T){s+=(t[0]-d)+(t[2]?t[1]:t[1].toLowerCase());d=t[0];}return s;}
function decoderTouches(s){const T=[];let d=0;for(const m of String(s||'').matchAll(/(\d+)([GDHBNCgdhbnc])/g)){d+=+m[1];T.push([d,m[2].toUpperCase(),m[2]===m[2].toUpperCase()?1:0]);}return T;}

/* ----- une course, en une ligne de journal : ce qu'il faut pour la retrouver, la comparer, et savoir OU elle s'est finie ----- */
function resumeCourse(b,partie){
  const E=partie.ech||[],col={};(partie.cols||[]).forEach((n,i)=>col[n]=i);
  const d=E[E.length-1],R=partie.routes||[],m=(partie.ev||[]).filter(e=>e[1]==='mort').pop();
  return {graine:b.graine,empreinte:b.empreinte,images:b.images,duree_s:b.duree_s,cause:b.cause,cartes:b.cartes,argent:r2(b.argent),pieces:b.pieces,
    figures_payees:b.figures_payees,vols:b.vols,air_pct:b.air_pct,raccourcis:b.raccourcis,vol_pose_max_s:b.vol_pose_max_s,combo_max:b.combo_max,
    raccourci_max_m:b.raccourci_max_m,distance_m:b.distance_m,nitro_pct:b.nitro_pct,appuis:b.appuis,pannes:b.pannes,ordresVides:b.ordresVides,
    /* la fin : sur quelle map, a quel endroit de la route, a quel endroit du monde, en vol ou au sol */
    fin:d?{carte:(R[d[col.r]]||{}).carte||null,route:d[col.r],s:d[col.s],lat:d[col.lat],x:d[col.x],y:d[col.y],z:d[col.z],enVol:m?m[5]==='fall':d[col.m]===1||d[col.m]===2}:null};
}

/* ----- INSCRIRE UN CANDIDAT : son code dans cerveaux/, sa ligne dans le journal, ses courses dans le tampon -----
   c : { nom, source (le code), etape, generation, parents:[ids], modele, raison, note (la barre du lot), courses:[{bilan, partie, touches}],
         graines:{n,depart,pas}, tmax, jeu (versionJeu), cout:{entree, sortie, euros}, echange (demande + reponse de l'API), lot }
   REFUSE ce qui rendrait la ligne inutilisable plus tard : pas de raison, un parent inconnu, un cerveau d'API sans son cout. */
/* qui n'a pas de cout a declarer : le code ecrit a la main, et celui ecrit par un agent sous ABONNEMENT (aucune API facturee au jeton : « opus-abonnement ») */
function sansCout(modele){return modele==='main'||/abonnement$/.test(String(modele||''));}
/* (2026-11-24, defaut 25 : « _essai » devenait « -essai », « élan » devenait « -lan », refuses APRES 10 minutes de note) LE NOM D'UN CERVEAU,
   nettoye : accents retires, tout le reste devient un tiret, pas de tiret au bord. NOM_OK = ce que le journal accepte. */
const NOM_OK=/^[a-z0-9][a-z0-9-]*$/i;
function nettoyerNom(n){return String(n||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'');}
/* (2026-11-24, defaut 14 : « inscrire dans une generation deja close : ses courses restent au tampon pour toujours ») */
function generationClose(etape,generation){return lire(F.generations).some(g=>g.etape===String(etape)&&g.generation===generation);}
/* UNE INSCRIPTION EN COURS (le temps de la note, ~10 min) : un marqueur au tampon, que clore.js respecte (sinon la clôture passerait
   pendant la note, et le candidat arriverait apres). Un marqueur dont le processus est mort ne compte plus. */
const vivant=pid=>{try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}};
function marquerInscription(etape,generation){
  fs.mkdirSync(D.tampon,{recursive:true});const f=path.join(D.tampon,'inscription-'+process.pid+'.en-cours');
  fs.writeFileSync(f,JSON.stringify({etape:String(etape),generation:generation,pid:process.pid,date:new Date().toISOString()}));
  return ()=>{try{fs.unlinkSync(f);}catch(e){}};
}
function inscriptionsEnCours(etape,generation){
  if(!fs.existsSync(D.tampon))return [];
  return fs.readdirSync(D.tampon).filter(f=>/^inscription-\d+\.en-cours$/.test(f)).map(f=>{const g=path.join(D.tampon,f);let m=null;try{m=JSON.parse(fs.readFileSync(g,'utf8'));}catch(e){}
      if(m&&m.pid!==process.pid&&!vivant(m.pid)){try{fs.unlinkSync(g);}catch(e){}return null;}return m;}) /* le marqueur d'une inscription morte (tuee) s'efface */
    .filter(m=>m&&m.etape===String(etape)&&m.generation===generation&&m.pid!==process.pid);
}
function inscrire(c){
  const J=lire(F.cerveaux),ids=new Set(J.map(l=>l.id));
  const faute=m=>{throw new Error('inscription refusee : '+m);};
  if(!c.nom||!NOM_OK.test(c.nom))faute('un nom simple (lettres, chiffres, tirets)');
  if(!c.source||!/module\.exports/.test(c.source))faute('le code du cerveau (module.exports={nom, decide})');
  if(c.etape==null||c.etape==='')faute('l\'etape du plan (--etape)');
  if(!Number.isInteger(c.generation)||c.generation<0)faute('la generation (--generation, un entier)');
  if(generationClose(c.etape,c.generation))faute('la generation '+c.generation+' de l\'etape '+c.etape+' est deja close : inscrire dans la suivante');
  if(!c.modele)faute('le modele qui a ecrit ce code (--modele ; « main » = ecrit a la main)');
  if(!c.raison||String(c.raison).trim().length<12)faute('la raison du changement (--raison, une vraie phrase) : c\'est elle qui fait l\'arbre et le recit');
  const parents=c.parents||[];for(const p of parents)if(!ids.has(p))faute('parent inconnu : '+p);
  if(!sansCout(c.modele)&&!(c.cout&&c.cout.entree>=0&&c.cout.sortie>=0))faute('le cout en jetons d\'un cerveau ecrit par l\'API (--entree, --sortie, --euros)');
  if(!c.courses||!c.courses.length)faute('aucune course notee');
  const id='c'+String(J.length+1).padStart(4,'0'),empreinte=sha(c.source),jumeau=(J.find(l=>l.sha===empreinte)||{}).id||null;
  const code=id+'-'+c.nom.toLowerCase()+'.js';
  fs.mkdirSync(D.cerveaux,{recursive:true});fs.writeFileSync(path.join(D.cerveaux,code),c.source);
  if(c.echange)ecrireGz(path.join(D.echanges,id+'.json.gz'),c.echange);
  const ligne={id:id,nom:c.nom,date:new Date().toISOString(),etape:String(c.etape),generation:c.generation,parents:parents,modele:c.modele,raison:String(c.raison).trim(),
    code:'cerveaux/'+code,sha:empreinte,octets:Buffer.byteLength(c.source),jumeau:jumeau,jeu:c.jeu,lot:c.lot||'entrainement',graines:c.graines,tmax:c.tmax,
    /* la map et la meteo IMPOSEES a la note (--carte, --meteo ; null = tirees par la graine) : sans elles, garder.js ne refait pas la meme course (defaut 12) */
    carte:c.carte||null,meteo:c.meteo||null,note:c.note,courses:c.courses.map(x=>resumeCourse(x.bilan,x.partie)),echecs:c.echecs|0,cout:c.cout||null,echange:c.echange?'journal/echanges/'+id+'.json.gz':null};
  /* le tampon d'abord, le journal en dernier : une ligne du journal a toujours ses courses derriere elle */
  ecrireGz(path.join(D.tampon,id+'.json.gz'),{id:id,nom:c.nom,jeu:c.jeu,courses:c.courses.map(x=>({graine:x.bilan.graine,bilan:x.bilan,partie:x.partie,touches:coderTouches(x.touches)}))});
  ajouter(F.cerveaux,ligne);
  if(c.cout)depense({etape:ligne.etape,generation:ligne.generation,cerveau:id,modele:c.modele,entree:c.cout.entree,sortie:c.cout.sortie,euros:c.cout.euros,pour:'candidat'});
  return ligne;
}
/* un candidat RENOTE sur d'autres graines (« le champion est toujours valide sur des graines que Claude n'a jamais vues ») */
function valider(id,v){
  if(!lire(F.cerveaux).some(l=>l.id===id))throw new Error('candidat inconnu : '+id);
  const ligne={id:id,date:new Date().toISOString(),jeu:v.jeu,graines:v.graines,tmax:v.tmax,carte:v.carte||null,meteo:v.meteo||null,note:v.note,courses:v.courses.map(x=>resumeCourse(x.bilan,x.partie)),echecs:v.echecs|0};
  ajouter(F.validations,ligne);return ligne;
}
/* UNE DEPENSE d'API (un candidat, une analyse, un calibrage) : euros = null si le tarif n'est pas encore connu (a chiffrer, jamais a deviner) */
function depense(d){
  if(!d.etape&&d.etape!==0)throw new Error('depense sans etape');
  const l={date:new Date().toISOString(),etape:String(d.etape),generation:d.generation==null?null:d.generation,cerveau:d.cerveau||null,modele:d.modele||null,
    entree:d.entree|0,sortie:d.sortie|0,euros:d.euros==null||d.euros===''||isNaN(+d.euros)?null:+d.euros,pour:d.pour||null};
  ajouter(F.depenses,l);return l;
}
function depenses(){
  const P={};let total=0,aChiffrer=0;
  for(const d of lire(F.depenses)){const p=P[d.etape]||(P[d.etape]={etape:d.etape,appels:0,entree:0,sortie:0,euros:0,aChiffrer:0});
    p.appels++;p.entree+=d.entree;p.sortie+=d.sortie;if(d.euros==null){p.aChiffrer++;aChiffrer++;}else{p.euros=r2(p.euros+d.euros);total=r2(total+d.euros);}}
  return {etapes:Object.values(P),total:total,aChiffrer:aChiffrer};
}

/* ----- GARDER UNE COURSE : le rejeu (leger, lisible) et la trajectoire (l'enregistrement du jeu, serre) ----- */
function nomCourse(id,graine){return id+'-g'+graine;}
function garder(ligne,x,pourquoi){
  const base=nomCourse(ligne.id,x.graine),fr=path.join(D.rejeux,base+'.json'),touches=typeof x.touches==='string'?x.touches:coderTouches(x.touches);
  let deja=null;if(fs.existsSync(fr)){try{deja=JSON.parse(fs.readFileSync(fr,'utf8'));}catch(e){}}
  const pq=[...new Set([].concat(deja?deja.pourquoi:[],pourquoi||[]))];
  const b=x.bilan,bot=x.partie.bot||{};
  const rejeu={format:'cashcar-rejeu-1',cerveau:{id:ligne.id,nom:ligne.nom,sha:ligne.sha,code:ligne.code},etape:ligne.etape,generation:ligne.generation,
    jeu:ligne.jeu,graine:x.graine,carte:bot.carte||null,meteo:bot.meteo||null,tmax:bot.tmax||ligne.tmax,images:b.images,empreinte:b.empreinte,
    fin:Object.assign({},x.partie.fin),cartes:b.cartes,pourquoi:pq,trajectoire:'trajectoires/'+base+'.json.gz',
    aide:'touches : le nombre d\'images (1/60 s) depuis le changement d\'avant, puis la touche — MAJUSCULE enfoncee, minuscule relachee ; G D H B N = gauche droite haut bas ESPACE ; C = la plaque CONTINUER de la seconde chance touchee (c : attente abandonnee)',
    touches:touches};
  ecrireAtomique(fr,JSON.stringify(rejeu,null,1));
  ecrireGz(path.join(D.trajectoires,base+'.json.gz'),x.partie);
  return rejeu;
}
function tampon(id){const f=path.join(D.tampon,id+'.json.gz');return fs.existsSync(f)?lireGz(f):null;}

/* ----- la trace FINE d'une course : la caisse une fois par seconde, vue de dessus, et ses routes tous les ~60 m.
   Pour les cartes d'une generation entiere (toutes les trajectoires superposees) sans garder chaque enregistrement. ----- */
function traceFine(id,x){
  const P=x.partie,col={};(P.cols||[]).forEach((n,i)=>col[n]=i);const pts=[];
  for(let i=0;i<P.ech.length;i+=10){const e=P.ech[i];pts.push(e[col.r],e[col.x],e[col.z]);}
  const d=P.ech[P.ech.length-1];if(d)pts.push(d[col.r],d[col.x],d[col.z]);
  return {id:id,graine:x.graine,cause:x.bilan.cause,duree_s:x.bilan.duree_s,
    routes:(P.routes||[]).map(r=>{const q=[];for(let i=0;i<r.P.length;i+=3)q.push(Math.round(r.P[i][0]),Math.round(r.P[i][2]));return {carte:r.carte,L:r.L,P:q};}),pts:pts};
}

/* ----- CLORE UNE GENERATION : le champion, la pire course, les courses remarquables — puis le tampon se vide -----
   « On ne garde pas chaque course en rejeu (trop lourd) : le champion de chaque generation, la pire course, et les courses remarquables. »
   critere : le chiffre de la note qui designe le champion (argent_min par defaut ; chaque etape du plan a le sien, il s'ecrit dans le journal). */
function clore(etape,generation,o){
  o=o||{};etape=String(etape);
  const critere=o.critere||'argent_min';
  if(generationClose(etape,generation))throw new Error('generation deja close : etape '+etape+', generation '+generation);
  const enCours=inscriptionsEnCours(etape,generation);
  if(enCours.length)throw new Error('une inscription est en cours dans cette generation (processus '+enCours.map(m=>m.pid).join(', ')+', depuis '+enCours[0].date+') : attendre qu\'elle finisse');
  const L=lire(F.cerveaux).filter(l=>l.etape===etape&&l.generation===generation&&l.lot!=='validation');
  if(!L.length)throw new Error('aucun candidat pour l\'etape '+etape+', generation '+generation);
  if(L.some(l=>typeof l.note[critere]!=='number'))throw new Error('critere inconnu dans la note : '+critere);
  const champion=L.slice().sort((a,b)=>b.note[critere]-a.note[critere])[0];
  const T={},manque=[];for(const l of L){const t=tampon(l.id);if(t)T[l.id]=t;else manque.push(l.id);}
  const toutes=[];for(const l of L)if(T[l.id])for(const x of T[l.id].courses)toutes.push({l:l,x:x});
  const gardes=[],garde=(c,pq)=>{if(!c)return;garder(c.l,c.x,[pq]);const k=nomCourse(c.l.id,c.x.graine),g=gardes.find(q=>q.course===k);if(g)g.pourquoi.push(pq);else gardes.push({course:k,pourquoi:[pq]});};
  const max=(A,f)=>A.reduce((m,c)=>(!m||f(c)>f(m))?c:m,null),duChampion=toutes.filter(c=>c.l.id===champion.id);
  garde(max(duChampion,c=>c.x.bilan.argent),'champion : sa meilleure course');
  garde(max(duChampion,c=>-c.x.bilan.duree_s),'champion : sa course la plus courte');
  garde(max(toutes,c=>-c.x.bilan.duree_s),'la pire course de la generation (la plus courte)');
  const lv=max(toutes,c=>c.x.bilan.vol_pose_max_s||0);if(lv&&lv.x.bilan.vol_pose_max_s>0)garde(lv,'le plus long vol pose : '+lv.x.bilan.vol_pose_max_s+' s');
  const cb=max(toutes,c=>c.x.bilan.combo_max||0);if(cb&&cb.x.bilan.combo_max>1)garde(cb,'le plus de figures en un vol : '+cb.x.bilan.combo_max);
  const rc=max(toutes,c=>c.x.bilan.raccourci_max_m||0);if(rc&&rc.x.bilan.raccourci_max_m>=60)garde(rc,'le plus gros raccourci : '+rc.x.bilan.raccourci_max_m+' m');
  const fine='trajectoires/e'+etape+'-g'+String(generation).padStart(3,'0')+'-toutes.json.gz';
  if(toutes.length)ecrireGz(path.join(RACINE,fine),{format:'cashcar-traces-1',etape:etape,generation:generation,jeu:champion.jeu,
    aide:'pts : [route, x, z] a plat, une fois par seconde · routes[].P : [x, z] a plat, tous les ~60 m',courses:toutes.map(c=>traceFine(c.l.id,c.x))});
  const ligne={etape:etape,generation:generation,date:new Date().toISOString(),critere:critere,candidats:L.length,courses:toutes.length,
    champion:champion.id,note_champion:champion.note,gardes:gardes,traces:toutes.length?fine:null,sans_tampon:manque};
  ajouter(F.generations,ligne);
  for(const l of L){const f=path.join(D.tampon,l.id+'.json.gz');if(fs.existsSync(f))fs.unlinkSync(f);}
  return ligne;
}

/* le jeu bavarde en se chargeant (ses propres messages, des erreurs de decor sans ecran) : on ne garde que ce que l'outil a a dire */
function ensilence(f){const c=console,l=c.log,e=c.error,w=c.warn;c.log=c.error=c.warn=function(){};try{return f();}finally{c.log=l;c.error=e;c.warn=w;}}

module.exports={sansCout,ensilence,RACINE,DEPOT,D,F,sha,lire,ajouter,ecrireAtomique,ecrireGz,lireGz,versionJeu,NOM_OK,nettoyerNom,generationClose,marquerInscription,inscriptionsEnCours,coderTouches,decoderTouches,resumeCourse,inscrire,valider,depense,depenses,
  garder,tampon,nomCourse,traceFine,clore};

/* ----- lance seul : l'etat du labo ----- */
if(require.main===module){
  const J=lire(F.cerveaux),G=lire(F.generations),V=lire(F.validations),dep=depenses(),v=versionJeu();
  const n=d=>fs.existsSync(d)?fs.readdirSync(d).filter(f=>!f.startsWith('.')).length:0;
  console.log('labo : '+RACINE);
  console.log('jeu  : '+v.version+' · commit '+v.commit+' · empreinte '+v.sha+(v.propre===false?' · ⚠ index.html ou figures.js modifie depuis le commit':''));
  console.log(`${J.length} candidat(s) au journal · ${G.length} generation(s) close(s) · ${V.length} validation(s) · ${n(D.rejeux)} rejeu(x) garde(s) · ${fs.existsSync(D.tampon)?fs.readdirSync(D.tampon).filter(f=>/^c\d+\.json\.gz$/.test(f)).length:0} candidat(s) au tampon`);
  const parGen={};for(const l of J){const k='etape '+l.etape+' · generation '+l.generation;(parGen[k]=parGen[k]||[]).push(l);}
  for(const k in parGen){const A=parGen[k],g=G.find(q=>'etape '+q.etape+' · generation '+q.generation===k);
    console.log('  '+k+' : '+A.length+' candidat(s)'+(g?' · close, champion '+g.champion+' ('+g.critere+' '+g.note_champion[g.critere]+')':' · ouverte'));}
  if(dep.etapes.length){console.log('depenses :');for(const p of dep.etapes)console.log(`  etape ${p.etape} : ${p.euros} € · ${p.appels} appel(s) · ${p.entree} jetons lus, ${p.sortie} ecrits${p.aChiffrer?' · '+p.aChiffrer+' a chiffrer':''}`);
    console.log('  total : '+dep.total+' €'+(dep.aChiffrer?' (+ '+dep.aChiffrer+' appel(s) sans prix)':''));}
  else console.log('depenses : 0 € (aucun appel a l\'API inscrit)');
}
