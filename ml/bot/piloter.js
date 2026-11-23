/* ===== LE PILOTE (2026-11-23, etape 1 BOTS-ML) : un cerveau conduit le VRAI jeu, par ses yeux et ses doigts =====
   ouvrir()                     charge le jeu une fois (ml/reel), pose les yeux et branche l'enregistreur du jeu
   charger(fichier)             charge un cerveau dans un bac ferme (ni fichiers, ni reseau, temps limite par decision)
   course(J,cerveau,graine,o)   une course : rend { partie, touches, bilan }
       partie  = l'enregistrement du jeu lui-meme (format cashcar-jeurec-1 : le meme que les parties de Sacha)
       touches = le journal des doigts ([image, touche, 1|0]) : avec la graine et la map, c'est le rejeu
   LE CONTRAT D'UN CERVEAU : un fichier qui pose `module.exports={nom, decide}` ; `decide(vue, memoire)` rend un ORDRE (voir doigts.js).
   Il est appele 10 fois par seconde ; `memoire` est un objet a lui, vide au depart de chaque course. Rien d'autre : ni require, ni horloge,
   ni hasard (Math.random est retire : meme graine = meme course). */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {creer}=require('../reel/jeu-reel');
const Y=require('./yeux');
const {Doigts,HUMAIN}=require('./doigts');
const {mesures}=require('./mesures');

/* L'ENREGISTREUR DU JEU, tenu a la main : dans un navigateur il bat par requestAnimationFrame (qui ne bat jamais ici) et range ses
   parties dans le telephone. Ici on appelle SES fonctions (jrNeuve, jrSuit, jrFinit) image par image : memes chiffres, meme format. */
const JR_CODE=`window.__JR={
  debut:function(){JREC.cours=jrNeuve(performance.now());return true;},
  image:function(){const c=JREC.cours;if(c&&started&&!gameOver&&!paused){try{jrSuit(c,performance.now());}catch(e){}}},
  fin:function(){const c=JREC.cours;if(!c)return null;const now=performance.now();if(mode==='boom'||gameOver)jrEvMort(c,now);jrFinit(c,now);JREC.cours=null;return JSON.stringify(c);}
};`;

function ouvrir(o){
  o=o||{};
  const J=creer({silence:true,query:o.query||''});
  Y.installer(J);J.ev(JR_CODE);
  J.version=(fs.readFileSync(path.join(__dirname,'..','..','VERSION PRINCIPALE','sw.js'),'utf8').match(/cashcar-v\d+/)||['?'])[0];
  return J;
}

/* LE BAC FERME : le cerveau tourne dans un contexte a part, sans require, sans process, sans horloge ni hasard ; une decision qui
   depasse `ms` millisecondes est coupee (elle rend « rien »). Ce n'est pas un coffre-fort : c'est un garde-fou contre un programme
   maladroit. Les cerveaux ecrits par l'API passeront par ici. */
function charger(fichier,o){
  o=o||{};
  const src=fs.readFileSync(fichier,'utf8'),mod={exports:{}};
  const M=Object.create(Math);M.random=undefined;
  const ctx=vm.createContext({module:mod,exports:mod.exports,Math:M,console:{log(){},warn(){},error(){}}},{codeGeneration:{strings:false,wasm:false}});
  vm.runInContext(src,ctx,{filename:path.basename(fichier),timeout:1000});
  const c=mod.exports;if(!c||typeof c.decide!=='function')throw new Error(fichier+' : pas de decide(vue, memoire)');
  ctx.__c=c;
  /* 500 ms : large expres. Une limite serree couperait une decision sur un simple hoquet de l'ordinateur, et la course ne serait plus
     repetable (MESURE : a 25 ms, 1 decision sur ~2 000 coupee). Elle n'arrete que les boucles sans fin ; une panne se voit dans le bilan. */
  const appel=new vm.Script('__r=__c.decide(__v,__m)'),ms=o.ms||500;
  return {nom:c.nom||path.basename(fichier,'.js'),fichier:fichier,source:src,pannes:0,
    decide(vue,mem){ctx.__v=vue;ctx.__m=mem;try{appel.runInContext(ctx,{timeout:ms});return ctx.__r;}catch(e){this.pannes++;this.derniere=String(e&&e.message||e);return null;}}};
}

/* UNE COURSE. o : { carte, meteo (imposer la map ; sinon la graine la tire), tmax (s de jeu, 180), trace (garder la vue de chaque decision),
   sansEnregistreur, yeuxEnPlus (controles de verifier.js) } */
function course(J,cerveau,graine,o){
  o=o||{};
  const tmax=o.tmax||180,N=Math.round(tmax*60);
  J.lancer(graine,o.carte?{carte:o.carte,meteo:o.meteo}:{});
  J.ev('__JR.debut()');
  const D=new Doigts(J,()=>Y.modeDe(J)),mem={},JR=J.g.sandbox.__JR;
  const h=crypto.createHash('sha1'),vues=[];
  let fr=0,vue=null,decisions=0,vide=0,pannes0=cerveau.pannes|0;
  const t1=Date.now();
  while(fr<N){
    if(fr%HUMAIN.decision===0){
      vue=Y.voir(J);
      h.update(vue.mode+'|'+(vue.s||0)+'|'+(vue.lat||0)+'|'+(vue.vitesse||0)+'|'+vue.nitro+'|'+vue.argent+';');
      if(vue.fini)break;
      vue.image=fr;vue.t=+(fr/60).toFixed(2);
      let ordre=null;try{ordre=cerveau.decide(vue,mem);}catch(e){ordre=null;}
      if(!ordre||typeof ordre!=='object'){ordre={};vide++;}
      D.ordre(ordre,vue);decisions++;
      if(o.trace)vues.push({image:fr,vue:vue,ordre:ordre});
    }
    D.image();J.image();
    if(!o.sansEnregistreur)JR.image();
    if(o.yeuxEnPlus)Y.voir(J);   /* (controle, verifier.js) regarder plus souvent ne doit rien changer a la course */
    fr++;
  }
  const ms=Date.now()-t1,vivant=!(vue&&vue.fini);
  D.lache();J.lacher();
  const partie=JSON.parse(J.ev('__JR.fin()'));
  if(vivant&&partie.fin)partie.fin.cause='temps'; /* arretee par la limite de temps, pas par une mort */
  partie.bot={nom:cerveau.nom,graine:graine,carte:o.carte||null,meteo:o.meteo||null,jeu:J.version,tmax:tmax};
  delete partie.ecran;
  const bilan=Object.assign({graine:graine,images:fr,ms:ms,foisTempsReel:+(fr/60/Math.max(.001,ms/1000)).toFixed(2),
    decisions:decisions,ordresVides:vide,pannes:(cerveau.pannes|0)-pannes0,gestesRefuses:D.refus,appuis:D.touches.filter(x=>x[2]).length,
    empreinte:h.digest('hex').slice(0,12)},mesures(partie));
  return {partie:partie,touches:D.touches,bilan:bilan,vues:o.trace?vues:undefined};
}
module.exports={ouvrir,charger,course};
