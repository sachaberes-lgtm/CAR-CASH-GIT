#!/usr/bin/env node
/* ===== LA SELECTION NATURELLE : UNE COURSE, UN PROCESSUS NEUF (2026-11-27, etape 1, SPECIFICATION.md § 5.2, INTERFACES.md § 2.1) =====
   Copie du bloc --enfant de ml/bot/noter.js : le jeu s'ouvre, le pilote arrive en TEXTE, la course se joue, le RESULTAT COMPACT remonte (~1 Ko).
   Une course = un processus neuf : c'est la condition pour que (jeu, graine, pilote) redonne la meme course au bit pres.
   N'est jamais requis par le maitre : il est forke (courses.js). Il exporte resultatCompact pour les tests.
   Message recu : { source, fichier, graine, tmax, regime, complet, carte, carteTenue }.
   Message rendu : le resultat compact, ou { graine, erreurFatale } (charger a leve : texte invalide, profil refuse…) puis sortie code 2.
   Essai a la main : node ml/evolution/enfant.js --essai <pilote.js> <graine> [tmax=45] [--carte grotte] [--tenue]
   (une ligne JSON sur stdout, le bavardage du jeu sur stderr). */
'use strict';
const path=require('path'),crypto=require('crypto');

function sha12(x){return crypto.createHash('sha1').update(x).digest('hex').slice(0,12);}

/* ===== CE QUE L'ENFANT A CHARGE (2026-11-27, le correcteur ; relecture robustesse « les fichiers des yeux sont hashes une fois par generation,
   mais chaque enfant les relit au moment de son fork ») : l'empreinte des fichiers de l'epoque, lue sur le disque JUSTE AVANT le require du bot,
   rendue dans le resultat (fichiers_sha) ; le tri du maitre rejette une course jouee avec d'autres fichiers que ceux de son epoque. ===== */
function fichiersLus(){
  try{const Cm=require('./commun');return Cm.shaDesFichiers(Cm.shaFichiersEpoque({tolererManquants:true}));}catch(e){return null;}
}

/* ===== LES COMPTEURS DE DECLENCHEMENTS (28/11/2026, lot « genes v4 ») =====
   notes/genes-v4.md § 4.1 : le pilote ajoute a son ordre un champ « declic » (un tableau de noms, notes/genes-v4.md § 4.2) seulement a une decision
   ou une de ses regles a vraiment agi. L'enveloppe, posee sur C.decide apres charger et avant course, appelle l'original (avec le cerveau pour
   this : il y ecrit this.texte, this.pannes…), ajoute 1 a chaque nom (une fois par decision), puis RETIRE le champ avant de rendre l'ordre :
   piloter.js ne le voit jamais. Sans champ « declic » (c0025, tout genome aux genes nes a 0), l'ordre rendu est l'objet de l'original, intact.
   Rend le compte : un objet nom -> nombre, sans prototype (un nom « __proto__ » ou « constructor » reste un nom comme un autre). */
function envelopper(C){
  const d0=C.decide,compte=Object.create(null);
  C.decide=function(vue){
    const r=d0.call(C,vue);
    if(r&&typeof r==='object'&&Object.prototype.hasOwnProperty.call(r,'declic')){
      const D=r.declic;
      if(Array.isArray(D)){const vus=new Set();for(const n of D)if(typeof n==='string'&&!vus.has(n)){vus.add(n);compte[n]=(compte[n]||0)+1;}}
      delete r.declic;
    }
    return r;
  };
  return compte;
}
/* le compte -> le champ de la ligne : cles triees, {} sans rien, null sans compte (les lignes d'avant ce lot) */
function declenchementsDe(compte){
  if(compte==null)return null;
  const o={};
  for(const k of Object.keys(compte).sort())Object.defineProperty(o,k,{value:compte[k],enumerable:true,writable:true,configurable:true});
  return o;
}
/* la cause de CHAQUE mort de la partie, dans l'ordre (les evenements 'mort' de l'enregistrement, [t,'mort',cause,…], le champ que mesures.js lit
   comme mort:e[2]) : la seconde chance comprise, alors que « cause » ne dit que la derniere. [] sans mort ; null sans partie lisible. */
function causesMortsDe(partie){
  if(!partie||!Array.isArray(partie.ev))return null;
  const r=[];
  for(const e of partie.ev)if(Array.isArray(e)&&e[1]==='mort')r.push(e[2]==null?null:e[2]);
  return r;
}

/* r : ce que rend piloter.course ; J : le jeu ouvert ; C : le pilote charge ; compte : celui d'envelopper (lot « genes v4 ») */
function resultatCompact(r,J,C,graine,compte){
  const b=r.bilan;
  let mes=null;
  try{mes=require('../bot/ressemblance').mesuresPartie(r.partie)||null;}catch(e){mes=null;}
  return {graine:graine,palier:b.palier,pieces:b.pieces,survie_s:b.duree_s,cause:b.cause,morts:b.morts_en_vol,vols:b.vols,
    pannes:b.pannes,erreurs:b.erreurs,derniereErreur:b.derniereErreur==null?null:b.derniereErreur,cerveau_ms_moy:b.cerveau_ms_moy,
    yeuxTirages:b.yeuxTirages==null?null:b.yeuxTirages,mesures:mes,
    jeu:J.version,jeu_sha:J.sha||null,simulateur:J.simulateur||null,node:process.version,
    empreinte:b.empreinte,empreinteVues:b.empreinteVues,empreinteTouches:sha12(JSON.stringify(r.touches)),
    nom:C.nom,ms:b.ms,
    /* (28/11/2026, lot « genes v4 », notes/genes-v4.md § 4.4) hors de toute empreinte et de la note */
    declenchements:declenchementsDe(compte),
    cartes:Array.isArray(b.cartes)?b.cartes.slice():null,
    causesMorts:causesMortsDe(r.partie),
    chancePrise:b.chance?!!b.chance.prise:null};
}

/* ===== LA MAP IMPOSEE (28/11/2026, lot « genes v4 », notes/genes-v4.md § 5) =====
   Les options de piloter.course : {tmax}, plus carte SEULEMENT si c'est une chaine non vide (pas de meteo : la map tire la sienne).
   Sans carte, l'objet est celui d'avant ce lot ({tmax}) : la course aussi. */
function optionsCourse(m){
  const o={tmax:m.tmax};
  if(typeof m.carte==='string'&&m.carte!=='')o.carte=m.carte;
  return o;
}
/* ===== LA CARTE TENUE TOUTE LA COURSE (28/11/2026, lot « genes v4 », au-dela du contrat : son § 10.8) =====
   La carte imposee ne vaut que pour la premiere map (code/maps/continuite.js, sfImpose : « const f=SF.force;SF.force=null; »). Le jeu a un crochet,
   dbgBancCarte(c,m) (code/economie/aura-banque-contrats.js), qui tient SF.force pose et reecrit les maps deja tirees : la MEME carte et la MEME meteo
   a chaque portail. Une tache « carteTenue:true » l'appelle juste apres le depart (J.lancer : la premiere map est batie, sa meteo tiree), avec la
   meteo de cette premiere map — une meteo d'une autre map pourrait ne pas exister dans la carte tenue (la grotte n'a ni pluie ni orage).
   Le jeu n'est pas modifie ; piloter.js et jeu-reel.js non plus : seul J.lancer de CE processus est enveloppe (un processus = une course).
   Sans carteTenue (toutes les courses de la selection), rien de ceci ne s'execute. */
function tenirLaCarte(J,carte){
  const l0=J.lancer;
  J.lancer=function(graine,o){
    const etat=l0.call(J,graine,o);
    try{J.carteTenue=J.ev('(function(){const c=(LVL&&LVL.cur)||{};return dbgBancCarte('+JSON.stringify(carte)+',c.meteo||null);})()');}
    catch(e){J.carteTenue=0;}
    return etat;
  };
}

/* une course entiere, dans CE processus. Leve { erreurFatale } si le pilote ne se charge pas */
function jouer(m){
  const fichiers_sha=fichiersLus();
  const {ouvrir,charger,course}=require('../bot/piloter');
  const J=ouvrir({regime:m.regime||'allege'});
  let C;
  try{C=charger(m.fichier||'evolution.js',{source:m.source});}
  catch(e){const x=new Error(String(e&&e.message||e));x.fatale=true;throw x;}
  const compte=envelopper(C);
  const oc=optionsCourse(m);
  if(oc.carte&&m.carteTenue===true)tenirLaCarte(J,oc.carte);
  const r=course(J,C,m.graine,oc);
  const res=resultatCompact(r,J,C,m.graine,compte);
  res.fichiers_sha=fichiers_sha;
  if(m.complet)res.complet={bilan:r.bilan,partie:r.partie,touches:r.touches};
  return res;
}

/* ===== L'ESSAI A LA MAIN : LA LIGNE DE COMMANDE (28/11/2026, lot « genes v4 », notes/genes-v4.md § 5 point 4) =====
   A = les arguments apres --essai : <pilote.js> <graine> [tmax] [--carte grotte] [--tenue]. --carte se lit par son NOM (la valeur qui suit,
   refusee si vide ou si elle commence par --) ; tmax vient de A[2] seulement s'il ne commence pas par --. Rend {fichier, graine, tmax, carte,
   carteTenue} ou {erreur}. */
const USAGE_ESSAI='enfant : usage : node enfant.js --essai <pilote.js> <graine> [tmax=45] [--carte grotte] [--tenue]';
function lireEssai(A){
  A=A||[];
  const fichier=A[0]&&!String(A[0]).startsWith('--')?A[0]:null;
  const g=A[1]!=null&&!String(A[1]).startsWith('--')?+A[1]:NaN;
  const tmax=A[2]!=null&&!String(A[2]).startsWith('--')?+A[2]:45;
  let carte=null;
  const i=A.indexOf('--carte');
  if(i>=0){const v=A[i+1];if(v==null||v===''||String(v).startsWith('--'))return {erreur:USAGE_ESSAI+' (--carte sans valeur)'};carte=String(v);}
  const carteTenue=A.indexOf('--tenue')>=0;
  if(carteTenue&&!carte)return {erreur:USAGE_ESSAI+' (--tenue sans --carte)'};
  if(!fichier||!(g>=0)||!(tmax>0))return {erreur:USAGE_ESSAI};
  return {fichier,graine:g,tmax,carte,carteTenue};
}

module.exports={resultatCompact,envelopper,declenchementsDe,causesMortsDe,optionsCourse,lireEssai};

const A=process.argv.slice(2);
if(require.main===module&&A[0]==='--essai'){
  /* l'essai a la main : stdout ne porte QUE la ligne de resultat ; tout le reste part sur stderr */
  const fs=require('fs');
  const ecrire=process.stdout.write.bind(process.stdout);
  const versErr=function(){process.stderr.write(Array.prototype.map.call(arguments,String).join(' ')+'\n');};
  console.log=versErr;console.info=versErr;console.warn=versErr;
  const E=lireEssai(A.slice(1));
  if(E.erreur){process.stderr.write(E.erreur+'\n');process.exit(1);}
  const fichier=path.resolve(E.fichier),graine=E.graine;
  let res;
  try{res=jouer({source:fs.readFileSync(fichier,'utf8'),fichier:path.basename(fichier),graine:graine,tmax:E.tmax,regime:'allege',carte:E.carte,carteTenue:E.carteTenue});}
  catch(e){if(e.fatale){ecrire(JSON.stringify({graine:graine,erreurFatale:e.message})+'\n');process.exit(2);}throw e;}
  ecrire(JSON.stringify(res)+'\n');
  process.exit(0);
}else if(require.main===module&&typeof process.send==='function'){
  /* Ctrl+C dans la console de lancer.cmd frappe TOUS les processus de la console : l'enfant l'ignore, seul le maitre decide
     (il le tue lui-meme au second Ctrl+C, par arreter({dur:true})). Relecture robustesse, 2026-11-27, le correcteur. */
  process.on('SIGINT',function(){});
  /* un seul message ; les suivants sont ignores */
  let pris=false;
  process.on('message',function(m){
    if(pris)return;pris=true;
    let res;
    try{res=jouer(m);}
    catch(e){
      if(e.fatale){process.send({graine:m.graine,erreurFatale:e.message},function(){process.exit(2);});return;}
      throw e;   /* une erreur du jeu lui-meme : le processus meurt, le maitre lit la fin de stderr */
    }
    process.send(res,function(){process.exit(0);});
  });
  /* le maitre a disparu (tue) : rien a rendre a personne */
  process.on('disconnect',function(){process.exit(3);});
}
