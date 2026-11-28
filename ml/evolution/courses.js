#!/usr/bin/env node
/* ===== LA SELECTION NATURELLE : L'ORDONNANCEUR DES COURSES, LE CACHE, L'EPOQUE (2026-11-27, etape 1, SPECIFICATION.md § 5, INTERFACES.md § 2.2) =====
   La file de (pilote, graine) ; au plus N enfants (enfant.js, un processus neuf par course) a la fois, en priorite basse ; un chien de garde ;
   une course non mesuree relancee une fois ; le tri des courses ecartees (note.pourquoiEcartee, recopie de noter.js) ; le cache = les lignes de
   etat/courses-AAAA-SS.jsonl (cle § 3.3 : une cle connue n'est jamais rejouee) ; la reprise apres un arret brutal (ligne tronquee ignoree, puis
   coupee du fichier avant toute ecriture : sinon la ligne suivante s'y collerait).
   Seul ecrivain de courses-*.jsonl et de pilotes/<shaPilote12>.js dans son dossier d'etat.
   Ligne de commande : node ml/evolution/courses.js <pilote.js> [--graines 12] [--depart 910000] [--tmax 300] [--travailleurs 4]
                       [--etat essais/etat-courses] [--config f.json] [--chien 1200] [--epoque f.json] [--bavard] [--carte grotte] [--tenue]
     --chien : le chien de garde en s (remplace cfg.chienDeGarde_s) ; --epoque : une epoque figee, lue d'un fichier (tests) ; --bavard : tout le journal
     --carte : la premiere map imposee (une de cfg.cartesTirage) ; --tenue : la meme carte a chaque portail (28/11/2026, lot « genes v4 ») */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{fork}=require('child_process');
const C=require('./commun');

const ENFANT=path.join(__dirname,'enfant.js');

/* ---------- L'EPOQUE (INTERFACES.md § 3.10) ---------- */
const FICHIERS_EPOQUE=C.FICHIERS_EPOQUE;

/* o.tolererManquants (ecart voulu, dit dans INTERFACES.md § 2.2) : un fichier absent compte 'absent' au lieu de lever.
   Sert a la ligne de commande et aux tests de l'etape 1, qui tournent avant que modele.js n'existe ; evoluer.js ne le passe jamais.
   (2026-11-27, le correcteur) le regime (cfg.regime, 'allege' par defaut) entre dans l'epoque des courses : un autre regime, un autre jeu ;
   fichiers_sha (l'empreinte d'ensemble des fichiers du bot) est compare a celle que l'enfant a lue au moment de son fork. */
function epoque(cfg,o){
  o=o||{};
  const fichiers=C.shaFichiersEpoque({tolererManquants:!!o.tolererManquants});
  const fichiers_sha=C.shaDesFichiers(fichiers);
  const regime=cfg.regime||'allege';
  const {shaJeu}=require('../bot/piloter');
  const jeu_sha=shaJeu();
  if(!jeu_sha)throw new Error('courses : empreinte du jeu illisible (VERSION PRINCIPALE/index.html, figures.js)');
  const sw=fs.readFileSync(path.join(C.RACINE,'VERSION PRINCIPALE','sw.js'),'utf8');
  const version=(sw.match(/cashcar-v\d+/)||[null])[0];
  if(!version)throw new Error('courses : version du jeu introuvable dans VERSION PRINCIPALE/sw.js');
  const simulateur=require('../reel/jeu-reel').SIMULATEUR;
  const dEt=path.join(C.RACINE,'ml','bot','etalon');
  let noms=[];
  try{noms=fs.readdirSync(dEt).filter(n=>/\.json$/i.test(n)).sort();}catch(e){throw new Error('courses : ml/bot/etalon illisible');}
  if(!noms.length)throw new Error('courses : aucun etalon dans ml/bot/etalon');
  const he=require('crypto').createHash('sha1');
  for(const n of noms){he.update(n);he.update(fs.readFileSync(path.join(dEt,n)));}
  const etalon=he.digest('hex');
  const reseaux=C.sha1(JSON.stringify(cfg.reseaux)+JSON.stringify(cfg.retourFige));
  const noteCfg=C.sha1(JSON.stringify(cfg.note));
  const composants={jeu_sha,version,simulateur,node:process.version,regime,fichiers,fichiers_sha,etalon,reseaux,noteCfg};
  const courses=C.sha1(JSON.stringify({jeu_sha,version,simulateur,node:process.version,regime,fichiers,reseaux})).slice(0,12);
  const note=C.sha1(courses+etalon+noteCfg).slice(0,12);
  return {courses,note,composants};
}

/* ===== LA MAP IMPOSEE DANS LA TACHE (28/11/2026, lot « genes v4 », notes/genes-v4.md § 5) =====
   UNE seule mise en forme de la carte d'une tache : une chaine non vide, sinon null (absente, null et '' = pas de carte). Elle sert a la cle, a
   l'envoi a l'enfant et a faireLigne, nulle part ailleurs. carteTenue (au-dela du contrat : la meme carte a chaque portail, enfant.js
   tenirLaCarte) ne vaut qu'avec une carte et seulement si elle vaut exactement true. */
function carteDe(t){return t&&typeof t.carte==='string'&&t.carte!==''?t.carte:null;}
function tenueDe(t){return !!(t&&t.carteTenue===true&&carteDe(t));}
/* la cle : sans carte, EXACTEMENT celle d'avant ce lot ; avec carte, le suffixe |carte:<carte> (et |tenue pour une carte tenue). Aucun code ne
   decoupe la cle : le suffixe ne casse rien ; une course imposee et une course libre n'ont jamais la meme cle. */
function cle(t,ep){
  const k=ep.composants;
  const c=carteDe(t);
  return t.shaPilote+'|'+t.graine+'|'+t.tmax+'|'+k.jeu_sha+'|'+k.simulateur+'|'+k.node+'|'+ep.courses+(c?'|carte:'+c+(tenueDe(t)?'|tenue':''):'');
}
/* une course a carte dont le jeu a joue une autre premiere map (une carte qu'il ne connait pas est remplacee en silence par une carte tiree :
   continuite.js, sfImpose ; le canyon n'existe que si CANYON_OK) n'est PAS mesuree. Carte tenue : toutes les maps traversees doivent etre elle.
   Rend la raison, ou null. Un echec definitif : rejouer ne changerait rien (ni relance, ni second essai au lancement suivant). */
const RAISON_CARTE=/^carte (imposee|tenue) non appliquee/;
function raisonCarte(t,res){
  const c=carteDe(t);
  if(!c||!res)return null;
  const L=Array.isArray(res.cartes)?res.cartes:[];
  if(L[0]!==c)return 'carte imposee non appliquee (jouee sur '+(L.length?String(L[0]):'?')+')';
  if(tenueDe(t)){const autres=L.filter(x=>x!==c);if(autres.length)return 'carte tenue non appliquee (jouee aussi sur '+[...new Set(autres.map(String))].join(', ')+')';}
  return null;
}

function fichiersCourses(dossierEtat){
  let n=[];
  try{n=fs.readdirSync(dossierEtat).filter(x=>/^courses-.*\.jsonl$/.test(x)).sort();}catch(e){return [];}
  return n.map(x=>path.join(dossierEtat,x));
}

function lireCourses(dossierEtat){
  const r=[];
  for(const f of fichiersCourses(dossierEtat))for(const l of C.lireJsonl(f))r.push(l);
  return r;
}

/* une ligne tronquee en fin de fichier (arret brutal pendant l'ecriture) : mise de cote dans <fichier>.fragment-<date> puis coupee,
   pour que la prochaine ligne ajoutee ne s'y colle pas. Rend le nombre de fichiers repares. */
function reparerFins(dossierEtat,journal){
  let n=0;
  for(const f of fichiersCourses(dossierEtat))if(C.reparerFin(f,journal?t=>journal('courses : '+t):null))n++;
  return n;
}

/* ===== LES ECHECS D'ENVIRONNEMENT (2026-11-27, le correcteur ; relecture robustesse « les echecs dus a la machine sont mis au cache pour toujours ») =====
   Le chien de garde, un enfant mort sans resultat (tue, Ctrl+C), des pannes de cerveau (la charge du PC), une course jouee avec d'autres fichiers
   du bot : ils dependent de la machine et du moment, pas du pilote. Leur ligne porte env:true ; elle ne compte comme essai que dans le lancement
   qui l'a ecrite (un lancement suivant rejoue la cle). Les echecs DETERMINISTES (chargement, yeuxTirages, autre jeu, autre simulateur, autre node)
   restent definitifs apres deux essais. */
const RAISONS_ENV=[/^chien de garde/,/^processus fini sans resultat/,/decision\(s\) coupee\(s\) par la limite de temps/,/^jouee avec d'autres fichiers du bot/];
function estEnv(l){return !!l&&l.mesuree===false&&(l.env===true||RAISONS_ENV.some(r=>r.test(String(l.raison||''))));}

/* ---------- LE TRI (note.pourquoiEcartee ; recopie de secours tant que note.js n'existe pas) ---------- */
function pourquoiEcarteeSecours(res,ep){
  if(res.erreurFatale)return 'chargement : '+res.erreurFatale;
  if(res.fichiers_sha&&ep.fichiers_sha&&res.fichiers_sha!==ep.fichiers_sha)return 'jouee avec d\'autres fichiers du bot (yeux, main, modele… '+res.fichiers_sha+', l\'epoque a '+ep.fichiers_sha+')';
  if(res.pannes>0||res.cause==='panne')return res.pannes+' decision(s) coupee(s) par la limite de temps'+(res.cause==='panne'?', course abandonnee':'')+' : pas repetable';
  if(!res.jeu_sha)return 'le jeu a ete reecrit pendant son chargement (empreinte instable)';
  if(res.simulateur!==ep.simulateur)return 'jouee dans un autre simulateur ('+res.simulateur+', l\'epoque est dans '+ep.simulateur+')';
  if(res.jeu_sha!==ep.jeu_sha||res.jeu!==ep.version)return 'jouee sur un autre jeu ('+res.jeu+' '+res.jeu_sha+', l\'epoque est sur '+ep.version+' '+ep.jeu_sha+')';
  if(res.yeuxTirages!==0)return 'hasard des yeux non mesure ou bouge (yeuxTirages '+res.yeuxTirages+')';
  if(res.node!==ep.node)return 'jouee sous un autre node ('+res.node+', l\'epoque est sous '+ep.node+')';
  return null;
}
function trieur(){
  try{const N=require('./note');if(N&&typeof N.pourquoiEcartee==='function')return {f:N.pourquoiEcartee,source:'note.js'};}
  catch(e){if(!(e&&e.code==='MODULE_NOT_FOUND'&&String(e.message).indexOf("Cannot find module './note'")===0))throw e;}
  return {f:pourquoiEcarteeSecours,source:'secours'};
}

/* (28/11/2026, lot « genes v4 », notes/genes-v4.md § 4.4) les champs neufs vont A LA FIN : une ligne sans carte garde l'ordre de ses champs d'avant */
const CHAMPS=['graine','tmax','palier','pieces','survie_s','cause','morts','vols','pannes','erreurs','derniereErreur','cerveau_ms_moy','yeuxTirages','mesures',
  'jeu','jeu_sha','simulateur','node','fichiers_sha','empreinte','empreinteVues','empreinteTouches','ms',
  'declenchements','cartes','causesMorts','chancePrise'];

/* ---------- L'ORDONNANCEUR ---------- */
function creer(o){
  const cfg=o.cfg;
  if(!cfg)throw new Error('courses : creer sans cfg');
  const ep=o.epoque||epoque(cfg);
  const dossierEtat=o.dossierEtat||C.chemin(cfg,cfg.dossierEtat);
  const avecCache=o.cache!==false,ecrire=o.ecrire!==false;
  const N=Math.max(1,Math.floor(o.travailleurs||cfg.travailleurs||1));
  const journal=o.journal||function(){};
  const doitArreter=o.doitArreter||function(){return false;},enPause=o.enPause||function(){return false;};
  const chien_ms=Math.max(1,+cfg.chienDeGarde_s||1200)*1000;
  const tri=trieur();
  /* (28/11/2026, lot « genes v4 ») le dossier d'etat de la selection : une course a carte n'y va jamais (notes/genes-v4.md § 5 point 1) */
  const memeDossier=(a,b)=>{const x=path.resolve(a),y=path.resolve(b);return process.platform==='win32'?x.toLowerCase()===y.toLowerCase():x===y;};
  const dansLaSelection=!!cfg.dossierEtat&&memeDossier(dossierEtat,C.chemin(cfg,cfg.dossierEtat));
  const cartesPermises=Array.isArray(cfg.cartesTirage)?cfg.cartesTirage.slice():[];
  /* (tests seulement) le script de l'enfant ; par defaut enfant.js */
  const scriptEnfant=o.enfant||ENFANT;
  const S={jouees:0,cache:0,nonMesurees:0,relancees:0,tuees:0,ms:0};

  /* le cache : lu UNE fois (cle -> lignes, ordre d'ecriture garde). (2026-11-27, le correcteur) seules les lignes de CETTE epoque des courses
     sont gardees en memoire : la cle contient ep.courses, une ligne d'une autre epoque ne sert jamais (relecture « le cache garde toutes les epoques »). */
  const memoire=new Map();
  if(ecrire)reparerFins(dossierEtat,journal);
  if(avecCache)for(const l of lireCourses(dossierEtat)){if(!l||!l.cle||l.epoque!==ep.courses)continue;if(!memoire.has(l.cle))memoire.set(l.cle,[]);memoire.get(l.cle).push(l);}
  const pilotesEcrits=new Set();
  const cetteFois=new WeakSet();   /* les lignes ecrites par CE lancement : un echec d'environnement ne compte comme essai qu'ici */

  const file=[];            /* les lancements en attente : {t, k, essai, fin, pannesAvant} */
  const enVol=new Map();    /* cle -> Promise<Ligne|null> : une cle demandee deux fois ne se joue qu'une fois */
  const vivants=new Set();  /* les enfants en cours : {c, timer, k} */
  let arrete=false,minuterie=null,attentesArret=[],panneInterne=null;
  /* une erreur de l'ordonnanceur lui-meme (disque plein, fichier tenu ouvert au-dela des reessais…) : arret, et demander() la rejette */
  let rejeterTout=null;
  const echecP=new Promise(function(_,r){rejeterTout=r;});
  echecP.catch(function(){});
  function panne(e){
    if(panneInterne)return;
    panneInterne=e instanceof Error?e:new Error(String(e));
    journal('courses : ERREUR de l\'ordonnanceur : '+panneInterne.message);
    arrete=true;
    try{vider();}catch(x){}
    rejeterTout(panneInterne);
    verifierArret();
  }

  function ligneCachee(k){
    if(!avecCache)return null;
    const L=memoire.get(k)||[];
    const ok=L.filter(l=>l.mesuree===true);
    if(ok.length)return {ligne:ok[ok.length-1],fini:true};
    /* (lot « genes v4 ») une carte que le jeu n'a pas appliquee : definitif des le premier essai */
    const carteKo=L.filter(l=>l.mesuree===false&&RAISON_CARTE.test(String(l.raison||'')));
    if(carteKo.length)return {ligne:carteKo[carteKo.length-1],fini:true};
    /* un echec d'environnement d'un lancement precedent ne compte pas : la cle sera rejouee */
    const ko=L.filter(l=>l.mesuree===false&&(!estEnv(l)||cetteFois.has(l)));
    if(ko.length>=2)return {ligne:ko[ko.length-1],fini:true};
    return {ligne:null,fini:false,essais:ko.length};
  }

  function ecrirePilote(t){
    if(!ecrire||pilotesEcrits.has(t.shaPilote))return;
    const f=path.join(dossierEtat,'pilotes',t.shaPilote.slice(0,12)+'.js');
    /* le texte EXACT envoye a l'enfant (CR compris s'il en a) ; rename reessaye si le fichier est tenu ouvert */
    if(!fs.existsSync(f))C.ecrireAtomiqueOctets(f,t.source);
    pilotesEcrits.add(t.shaPilote);
  }

  function faireLigne(t,k,essai,res,raison){
    const l={cle:k,pilote:t.shaPilote,id:t.id==null?null:t.id,usage:t.usage||'essai',generation:t.generation==null?null:t.generation,epoque:ep.courses,
      essai:essai,mesuree:!raison,raison:raison||null,date:new Date().toISOString()};
    for(const c of CHAMPS)l[c]=res&&res[c]!==undefined?res[c]:null;
    l.graine=t.graine;l.tmax=t.tmax;
    l.carte=carteDe(t);   /* (lot « genes v4 ») depuis la TACHE, comme graine et tmax ; null sans carte */
    if(tenueDe(t))l.carteTenue=true;
    if(raison&&estEnv(l))l.env=true;
    return l;
  }

  function garder(l){
    if(ecrire)C.ajouterLigne(path.join(dossierEtat,'courses-'+C.semaineIso(new Date())+'.jsonl'),l);
    if(!memoire.has(l.cle))memoire.set(l.cle,[]);
    memoire.get(l.cle).push(l);
    cetteFois.add(l);
    if(!l.mesuree)S.nonMesurees++;
  }

  /* un enfant pour une tache ; fin(Ligne|null) quand il a rendu (null : tue par arreter({dur:true}), ou arret pendant un echec) */
  function lancer(x){
    const t=x.t;
    let c;
    try{
      ecrirePilote(t);
      c=fork(scriptEnfant,[],{silent:true,windowsHide:true});
    }catch(e){x.fin(null);panne(e);return;}
    if(cfg.prioriteBasse){try{os.setPriority(c.pid,os.constants.priority.PRIORITY_BELOW_NORMAL);}catch(e){}}
    const v={c:c,k:x.k,tue:false,dur:false};vivants.add(v);
    journal('course : lancee graine '+t.graine+' pid '+c.pid+' essai '+x.essai+' ('+String(t.id)+')');
    const t0=Date.now();
    let recu=null,err='',fini=false;
    if(c.stdout)c.stdout.resume();   /* le jeu bavarde : on vide le tuyau, sinon l'enfant se bloquerait */
    if(c.stderr)c.stderr.on('data',function(d){err=(err+d).slice(-600);});
    v.timer=setTimeout(function(){v.tue=true;S.tuees++;try{c.kill('SIGKILL');}catch(e){}},chien_ms);
    c.on('message',function(m){if(!recu)recu=m;});
    function finir(code,sig){
      if(fini)return;fini=true;
      clearTimeout(v.timer);vivants.delete(v);
      S.ms+=Date.now()-t0;
      try{
        if(v.dur||panneInterne){x.fin(null);pomper();return;}
        let raison=null,res=null;
        if(v.tue&&!(recu&&!recu.erreurFatale&&recu.palier!==undefined))raison='chien de garde';
        else if(!recu)raison='processus fini sans resultat (code '+code+(sig?', signal '+sig:'')+') '+err.replace(/\s+/g,' ').trim().slice(-300);
        else if(recu.erreurFatale)raison='chargement : '+recu.erreurFatale;
        else{res=recu;raison=tri.f(res,ep.composants)||raisonCarte(t,res)||null;}
        S.jouees++;
        const l=faireLigne(t,x.k,x.essai,res,raison);
        /* les pannes de TOUS les essais de la tache (relecture statistique : « les pannes ne sont comptees que sur le dernier essai ») */
        l.pannesEssais=(x.pannesAvant|0)+(l.pannes|0);
        garder(l);
        if(raison)journal('course : graine '+t.graine+' NON MESUREE (essai '+x.essai+') : '+raison);
        const stop=arrete||doitArreter();
        if(raison&&x.essai<2&&!stop&&!RAISON_CARTE.test(raison)){
          S.relancees++;
          file.unshift({t:t,k:x.k,essai:x.essai+1,fin:x.fin,pannesAvant:l.pannesEssais});   /* la relance passe devant : la tache garde sa place */
        }else if(raison&&stop&&(x.essai<2||l.env)){
          /* (relecture robustesse « un arret qui tombe pendant que les enfants meurent ») un echec pendant un arret n'est pas un verdict :
             la ligne reste au cache (essai 1, ou echec d'environnement qui ne vaut que pour ce lancement), la tache rend null (= interrompue) */
          x.fin(null);
        }else x.fin(l);
        pomper();
      }catch(e){try{x.fin(null);}catch(y){}panne(e);}
    }
    c.on('exit',finir);
    c.on('error',function(e){err=(err+' '+String(e&&e.message||e)).slice(-600);setTimeout(function(){finir(null,null);},50);});
    try{c.send({source:t.source,fichier:t.fichier||'evolution.js',graine:t.graine,tmax:t.tmax,regime:cfg.regime||'allege',complet:false,carte:carteDe(t),carteTenue:tenueDe(t)});}
    catch(e){err=(err+' envoi : '+String(e&&e.message||e)).slice(-600);try{c.kill('SIGKILL');}catch(x){}}
  }

  function vider(){
    /* plus de lancement : les taches en attente rendent null */
    while(file.length)file.shift().fin(null);
  }

  function pomper(){
    if(arrete||doitArreter()){vider();verifierArret();return;}
    if(enPause()){
      if(!minuterie&&file.length)minuterie=setTimeout(function(){minuterie=null;pomper();},1000);
      return;
    }
    while(vivants.size<N&&file.length&&!panneInterne)lancer(file.shift());
    verifierArret();
  }

  function verifierArret(){
    if(vivants.size===0&&attentesArret.length){const a=attentesArret;attentesArret=[];for(const f of a)f();}
  }

  function une(t){
    if(!t||typeof t.source!=='string'||!t.shaPilote||!(t.graine>=0)||!(t.tmax>0))return Promise.reject(new Error('courses : tache incomplete (source, shaPilote, graine, tmax)'));
    /* (lot « genes v4 ») la carte : connue du tirage, et jamais dans l'etat de la selection */
    const carte=carteDe(t);
    if(carte!==null&&cartesPermises.indexOf(carte)<0)return Promise.reject(new Error('courses : carte inconnue « '+carte+' » (cartesTirage : '+(cartesPermises.join(', ')||'aucune')+')'));
    if(carte!==null&&dansLaSelection)return Promise.reject(new Error('courses : une course a carte imposee ne va pas dans l etat de la selection'));
    if(t.carteTenue===true&&carte===null)return Promise.reject(new Error('courses : carteTenue sans carte'));
    const k=cle(t,ep);
    const ca=ligneCachee(k);
    if(ca&&ca.fini){
      S.cache++;
      /* rendue telle quelle ; `_cache` (non enumerable : il n'entre dans aucun JSON) dit qu'elle n'a pas ete jouee */
      const r=Object.assign({},ca.ligne);Object.defineProperty(r,'_cache',{value:true,enumerable:false});
      return Promise.resolve(r);
    }
    if(enVol.has(k))return enVol.get(k);
    const p=new Promise(function(fin){
      file.push({t:t,k:k,essai:(ca?ca.essais:0)+1,fin:function(l){enVol.delete(k);fin(l);}});
    });
    enVol.set(k,p);
    return p;
  }

  return {
    demander(taches){
      if(panneInterne)return Promise.reject(panneInterne);
      const P=taches.map(une);
      try{pomper();}catch(e){panne(e);}
      return Promise.race([Promise.all(P),echecP]);
    },
    arreter(a){
      a=a||{};
      arrete=true;
      if(minuterie){clearTimeout(minuterie);minuterie=null;}
      vider();
      if(a.dur)for(const v of vivants){v.dur=true;S.tuees++;try{v.c.kill('SIGKILL');}catch(e){}}
      return new Promise(function(fin){attentesArret.push(fin);verifierArret();});
    },
    enCours(){return vivants.size;},
    stats(){return Object.assign({},S);},
    epoque:ep,
    trieur:tri.source
  };
}

module.exports={epoque,cle,lireCourses,creer,reparerFins,pourquoiEcarteeSecours,FICHIERS_EPOQUE,estEnv,CHAMPS,carteDe,raisonCarte};

/* ---------- LA LIGNE DE COMMANDE ---------- */
if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  const hh=()=>new Date().toTimeString().slice(0,8);
  const dire=t=>process.stdout.write(hh()+' '+t+'\n');
  try{
    const fichier=A[0]&&!A[0].startsWith('--')?path.resolve(A[0]):null;
    if(!fichier)throw new Error('courses : usage : node ml/evolution/courses.js <pilote.js> [--graines 12] [--depart 910000] [--tmax 300] [--travailleurs 4] [--etat essais/etat-courses] [--config f.json]');
    const cfg=C.lireConfig(opt('config',null));
    if(opt('chien',null)!=null)cfg.chienDeGarde_s=+opt('chien');
    const NG=+opt('graines',12),G0=+opt('depart',910000),TMAX=+opt('tmax',300),TRAV=+opt('travailleurs',cfg.travailleurs||4);
    const etatRel=opt('etat',path.join('essais','etat-courses'));
    const dossierEtat=path.resolve(C.DOSSIER,etatRel);
    if(path.resolve(dossierEtat)===path.resolve(C.chemin(cfg,'etat')))throw new Error('courses : la ligne de commande n\'ecrit jamais dans etat/ (choisir --etat)');
    const source=fs.readFileSync(fichier,'utf8');
    const shaPilote=C.sha1(source);
    /* --epoque f.json : une epoque figee (les tests : un modele.js retouche pendant le test ne doit pas changer la cle du cache) */
    const ep=opt('epoque',null)?C.lireJson(path.resolve(opt('epoque'))):epoque(cfg,{tolererManquants:true});
    const ord=creer({cfg,epoque:ep,dossierEtat,travailleurs:TRAV,journal:t=>{if(A.includes('--bavard')||/^course : lancee/.test(t)||/tronquee/.test(t))dire(t);}});
    dire('pilote '+path.basename(fichier)+' '+shaPilote.slice(0,12)+' · '+NG+' graines depuis '+G0+' · '+TMAX+' s au plus · '+TRAV+' a la fois · epoque '+ep.courses+' · jeu '+ep.composants.version+' '+ep.composants.jeu_sha+' · tri '+ord.trieur+' · etat '+path.relative(C.DOSSIER,dossierEtat));
    let coupe=0;
    process.on('SIGINT',function(){coupe++;if(coupe===1){dire('Ctrl+C : plus de lancement, on attend les courses en cours (encore Ctrl+C : on les tue)');ord.arreter({dur:false});}else{ord.arreter({dur:true}).then(()=>process.exit(1));}});
    const taches=[];
    const CARTE=opt('carte',null),TENUE=A.includes('--tenue');
    if(A.includes('--carte')&&(!CARTE||CARTE.startsWith('--')))throw new Error('courses : --carte sans valeur');
    for(let i=0;i<NG;i++){const t={source,fichier:path.basename(fichier),shaPilote,id:'fichier:'+path.basename(fichier),graine:G0+37*i,tmax:TMAX,usage:'essai',generation:null};
      if(CARTE){t.carte=CARTE;if(TENUE)t.carteTenue=true;}
      taches.push(t);}
    /* une ligne par course, des qu'elle est finie */
    const P=taches.map(t=>ord.demander([t]).then(L=>{const l=L[0];
      if(!l){dire('graine '+t.graine+' · non lancee (arret)');return l;}
      dire('graine '+l.graine+(l.carte?' · carte '+l.carte+' (jouee sur '+(l.cartes||[]).join(' > ')+')':'')+' · palier '+String(l.palier).padStart(2)+' · survie '+String(l.survie_s).padStart(6)+' s · '+String(l.cause).padEnd(8)+' · '+(l.mesuree?'mesuree':'NON MESUREE ('+l.raison+')')+(l._cache?' · cache':'')+' · essai '+l.essai+' · empreinte '+l.empreinte);
      return l;}));
    Promise.all(P).then(function(L){
      const ok=L.filter(l=>l&&l.mesuree);
      const moy=f=>ok.length?+(ok.reduce((s,l)=>s+l[f],0)/ok.length).toFixed(2):null;
      const st=ord.stats();
      dire('resume : '+ok.length+'/'+NG+' mesurees · palier moyen '+moy('palier')+' · survie moyenne '+moy('survie_s')+' s · jouees '+st.jouees+' · cache '+st.cache+' · non mesurees '+st.nonMesurees+' · relancees '+st.relancees+' · tuees '+st.tuees);
      process.exit(ok.length===NG?0:1);
    },function(e){process.stderr.write(String(e&&e.message||e)+'\n');process.exit(1);});
  }catch(e){process.stderr.write(String(e&&e.message||e)+'\n');process.exit(1);}
}
