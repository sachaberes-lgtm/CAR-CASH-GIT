#!/usr/bin/env node
/* ===== LA SELECTION NATURELLE : UNE COURSE, UN PROCESSUS NEUF (2026-11-27, etape 1, SPECIFICATION.md § 5.2, INTERFACES.md § 2.1) =====
   Copie du bloc --enfant de ml/bot/noter.js : le jeu s'ouvre, le pilote arrive en TEXTE, la course se joue, le RESULTAT COMPACT remonte (~1 Ko).
   Une course = un processus neuf : c'est la condition pour que (jeu, graine, pilote) redonne la meme course au bit pres.
   N'est jamais requis par le maitre : il est forke (courses.js). Il exporte resultatCompact pour les tests.
   Message recu : { source, fichier, graine, tmax, regime, complet }.
   Message rendu : le resultat compact, ou { graine, erreurFatale } (charger a leve : texte invalide, profil refuse…) puis sortie code 2.
   Essai a la main : node ml/evolution/enfant.js --essai <pilote.js> <graine> [tmax=45] (une ligne JSON sur stdout, le bavardage du jeu sur stderr). */
'use strict';
const path=require('path'),crypto=require('crypto');

function sha12(x){return crypto.createHash('sha1').update(x).digest('hex').slice(0,12);}

/* ===== CE QUE L'ENFANT A CHARGE (2026-11-27, le correcteur ; relecture robustesse « les fichiers des yeux sont hashes une fois par generation,
   mais chaque enfant les relit au moment de son fork ») : l'empreinte des fichiers de l'epoque, lue sur le disque JUSTE AVANT le require du bot,
   rendue dans le resultat (fichiers_sha) ; le tri du maitre rejette une course jouee avec d'autres fichiers que ceux de son epoque. ===== */
function fichiersLus(){
  try{const Cm=require('./commun');return Cm.shaDesFichiers(Cm.shaFichiersEpoque({tolererManquants:true}));}catch(e){return null;}
}

/* r : ce que rend piloter.course ; J : le jeu ouvert ; C : le pilote charge */
function resultatCompact(r,J,C,graine){
  const b=r.bilan;
  let mes=null;
  try{mes=require('../bot/ressemblance').mesuresPartie(r.partie)||null;}catch(e){mes=null;}
  return {graine:graine,palier:b.palier,pieces:b.pieces,survie_s:b.duree_s,cause:b.cause,morts:b.morts_en_vol,vols:b.vols,
    pannes:b.pannes,erreurs:b.erreurs,derniereErreur:b.derniereErreur==null?null:b.derniereErreur,cerveau_ms_moy:b.cerveau_ms_moy,
    yeuxTirages:b.yeuxTirages==null?null:b.yeuxTirages,mesures:mes,
    jeu:J.version,jeu_sha:J.sha||null,simulateur:J.simulateur||null,node:process.version,
    empreinte:b.empreinte,empreinteVues:b.empreinteVues,empreinteTouches:sha12(JSON.stringify(r.touches)),
    nom:C.nom,ms:b.ms};
}

/* une course entiere, dans CE processus. Leve { erreurFatale } si le pilote ne se charge pas */
function jouer(m){
  const fichiers_sha=fichiersLus();
  const {ouvrir,charger,course}=require('../bot/piloter');
  const J=ouvrir({regime:m.regime||'allege'});
  let C;
  try{C=charger(m.fichier||'evolution.js',{source:m.source});}
  catch(e){const x=new Error(String(e&&e.message||e));x.fatale=true;throw x;}
  const r=course(J,C,m.graine,{tmax:m.tmax});
  const res=resultatCompact(r,J,C,m.graine);
  res.fichiers_sha=fichiers_sha;
  if(m.complet)res.complet={bilan:r.bilan,partie:r.partie,touches:r.touches};
  return res;
}

module.exports={resultatCompact};

const A=process.argv.slice(2);
if(require.main===module&&A[0]==='--essai'){
  /* l'essai a la main : stdout ne porte QUE la ligne de resultat ; tout le reste part sur stderr */
  const fs=require('fs');
  const ecrire=process.stdout.write.bind(process.stdout);
  const versErr=function(){process.stderr.write(Array.prototype.map.call(arguments,String).join(' ')+'\n');};
  console.log=versErr;console.info=versErr;console.warn=versErr;
  const fichier=path.resolve(A[1]||''),graine=+A[2],tmax=+(A[3]||45);
  if(!A[1]||!(graine>=0)){process.stderr.write('enfant : usage : node enfant.js --essai <pilote.js> <graine> [tmax=45]\n');process.exit(1);}
  let res;
  try{res=jouer({source:fs.readFileSync(fichier,'utf8'),fichier:path.basename(fichier),graine:graine,tmax:tmax,regime:'allege'});}
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
