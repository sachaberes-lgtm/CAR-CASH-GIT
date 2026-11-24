/* ===== LE PILOTE (2026-11-23, etape 1 BOTS-ML) : un cerveau conduit le VRAI jeu, par ses yeux et ses doigts =====
   ouvrir({regime})             charge le jeu une fois (ml/reel), pose les yeux et branche l'enregistreur du jeu ; J.version, J.sha (l'empreinte chargee)
   charger(fichier,{source,ms}) charge un cerveau dans un bac ferme (ni fichiers, ni reseau, ni horloge, ni hasard, temps limite par decision) ;
                                source : son texte, s'il est deja lu (noter.js le lit une fois pour toutes les courses)
   course(J,cerveau,graine,o)   une course : rend { partie, touches, bilan }
       partie  = l'enregistrement du jeu lui-meme (format cashcar-jeurec-1 : le meme que les parties de Sacha)
       touches = le journal des doigts ([image, touche, 1|0]) : avec la graine et la map, c'est le rejeu
   LE CONTRAT D'UN CERVEAU : un fichier qui pose `module.exports={nom, decide}` ; `decide(vue, memoire)` rend un ORDRE (voir doigts.js).
   Il est appele 10 fois par seconde ; `memoire` est un objet a lui, vide au depart de chaque course. Rien d'autre : ni require, ni horloge,
   ni hasard (Math.random est retire : meme graine = meme course). */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {creer}=require('../reel/jeu-reel');
const Y=require('./yeux');
const {Doigts,HUMAIN,TOUCHE}=require('./doigts');
const {mesures}=require('./mesures');

/* L'ENREGISTREUR DU JEU, tenu a la main : dans un navigateur il bat par requestAnimationFrame (qui ne bat jamais ici) et range ses
   parties dans le telephone. Ici on appelle SES fonctions (jrNeuve, jrSuit, jrFinit) image par image : memes chiffres, meme format. */
const JR_CODE=`window.__JR={
  debut:function(){JREC.cours=jrNeuve(performance.now());return true;},
  image:function(){const c=JREC.cours;if(c&&started&&!gameOver&&!paused){try{jrSuit(c,performance.now());}catch(e){}}},
  fin:function(){const c=JREC.cours;if(!c)return null;const now=performance.now();if(mode==='boom'||gameOver)jrEvMort(c,now);jrFinit(c,now);JREC.cours=null;return JSON.stringify(c);}
};`;

/* LE REGIME DU JEU (2026-11-24) : au chargement, le jeu juge la machine. Telephone ou puce graphique integree → version ALLEGEE, ou Crypto City est
   hors du tirage des maps ; le simulateur, sans carte graphique a juger, tombe au regime MAXIMUM. Les vrais joueurs de l'etalon sont tous en allege :
   `regime:'allege'` (le parametre ?allege=1 du jeu) fait jouer le bot dans LEUR jeu. Sans rien : le maximum, comme avant (les notes d'avant le 24/11). */
/* (2026-11-24, defaut 16 : « une meme note peut meler deux versions du jeu ») J.sha = l'empreinte de ce que CE processus a charge : sha1 de
   index.html + figures.js (la meme que versionJeu() de ml/labo), lue juste AVANT et juste APRES le chargement. Si un autre agent reassemble le jeu
   pendant ce temps-la, les deux different : J.sha vaut alors null (version inconnue) et noter.js ecarte la course. */
const JEU_DIR=path.join(__dirname,'..','..','VERSION PRINCIPALE');
function shaJeu(){try{return crypto.createHash('sha1').update(Buffer.concat([fs.readFileSync(path.join(JEU_DIR,'index.html')),fs.readFileSync(path.join(JEU_DIR,'figures.js'))])).digest('hex').slice(0,12);}catch(e){return null;}}
function ouvrir(o){
  o=o||{};
  const regime=o.regime==='allege'?'allege':'max',v0=fs.readFileSync(path.join(JEU_DIR,'sw.js'),'utf8'),s0=shaJeu();
  const J=creer({silence:true,query:(regime==='allege'?'&allege=1':'')+(o.query||'')});J.regime=regime;
  Y.installer(J);J.ev(JR_CODE);
  const v1=fs.readFileSync(path.join(JEU_DIR,'sw.js'),'utf8'),s1=shaJeu();
  J.version=v0===v1?(v1.match(/cashcar-v\d+/)||['?'])[0]:'?';
  J.sha=s0&&s0===s1?s0:null;
  return J;
}
/* (2026-11-24, defaut 17 : « la limite de 180 s plafonne le palier mesure ») la limite par defaut d'une course : 900 s de jeu (15 min).
   MESURE : le record de l'etalon (palier 28, 4044 pieces) tient en 548,8 s ; le bot de reference ramasse ~6,5 pieces/s : a 180 s il ne
   pouvait pas depasser le palier ~15, a 300 s le palier ~20. 900 s laisse l'echelle 1 a 30 se remplir ; une course coupee reste marquee « temps ». */
const TMAX_DEFAUT=900;

/* LE BAC FERME : le cerveau tourne dans un contexte a part, sans require, sans process, sans horloge ni hasard ; une decision qui
   depasse `ms` millisecondes est coupee (elle rend « rien »). Les cerveaux ecrits par l'API passeront par ici. */
/* ===== LE BAC FERME POUR DE BON (2026-11-24, defauts 1 et 3 de ml/ecurie/etude/defauts-confirmes.md : « le bac laisse passer la vraie horloge,
   le vrai hasard et le processus ») =====
   MESURE (vm de Node 24, avant) : dans l'ancien bac, `Date.now()` rendait l'heure du PC, `Object.getPrototypeOf(Math).random()` le hasard de
   Node (Math etait un Object.create du Math de l'hote), `memoire.constructor.constructor("return process")()` rendait `process` (memoire, module,
   console : des objets de l'hote, dont le Function n'a pas l'interdit du bac), et la vue, faite DANS le jeu, ouvrait le jeu lui-meme.
   Desormais RIEN de l'hote ni du jeu ne passe la frontiere, seulement du TEXTE :
     · le contexte part d'un objet sans prototype ; module, exports, console, Math (une copie sans random) sont faits DEDANS ;
     · Date est une souche qui refuse (« pas d'horloge : vue.t »), Intl (il donne la date du jour), WeakRef et FinalizationRegistry (le
       ramasse-miettes n'est pas repetable), SharedArrayBuffer et Atomics sont retires ;
     · la vue entre en TEXTE (JSON, avec NaN, ±Infinity, -0 et undefined gardes tels quels : un cerveau honnete voit exactement les memes
       nombres) et se relit dans le contexte ; la memoire est un objet du contexte ; l'ordre ressort en TEXTE et se relit chez l'hote ;
     · l'appel passe par `__bac`, une constante posee AVANT le cerveau, qui a garde JSON et String d'origine : le cerveau peut tout casser chez
       lui, rien chez l'hote. Les promesses du cerveau tournent dans sa limite de temps (microtaskMode).
   Ce qu'un cerveau qui triche obtient : une erreur (comptee dans `erreurs`, ordre vide), la course continue. Controle : verifier.js, section 5.
   Ce n'est toujours pas un coffre-fort contre un attaquant du moteur JavaScript lui-meme : pour des cerveaux d'inconnus, un processus a part. */
const BAC_CODE=`(function(g){
  const M={};for(const k of Object.getOwnPropertyNames(Math))if(k!=='random')M[k]=Math[k];
  const non=function(){throw new Error("pas d'horloge dans le bac : le temps du jeu est vue.t");};
  const D=function Date(){non();};D.now=non;D.parse=non;D.UTC=non;
  g.Math=M;g.Date=D;
  for(const k of ['Intl','WeakRef','FinalizationRegistry','SharedArrayBuffer','Atomics'])delete g[k];
  g.console={log(){},warn(){},error(){},info(){}};
  g.module={exports:{}};g.exports=g.module.exports;
})(globalThis);
const __bac=(function(){'use strict';
  const JS=JSON.stringify,JP=JSON.parse,S=String;
  const enc=function(k,v){if(typeof v==='number'){if(v!==v)return '\\u0000N';if(v===Infinity)return '\\u0000I';if(v===-Infinity)return '\\u0000J';if(v===0&&1/v<0)return '\\u0000Z';}
    else if(v===undefined)return '\\u0000U';return v;};
  const dec=function(k,v){if(typeof v==='string'&&v.length===2&&v.charCodeAt(0)===0){const c=v.charCodeAt(1);
    if(c===78)return NaN;if(c===73)return Infinity;if(c===74)return -Infinity;if(c===90)return -0;if(c===85)return undefined;}return v;};
  let c=null,m={};
  return Object.freeze({
    pose:function(){const x=module.exports;if(!x||typeof x.decide!=='function')return 'E';c=x;return 'O'+(typeof x.nom==='string'?x.nom:'');},
    neuve:function(){m={};},
    appel:function(vj){try{const r=c.decide(JP(vj,dec),m);return 'O'+JS(r,enc);}catch(e){let s='?';try{s=S(e&&e.message||e);}catch(x){}return 'E'+s;}}});
})();`;
/* la vue → texte, chez l'hote (les memes reperes que `enc` du bac) */
const encHote=(k,v)=>{if(typeof v==='number'){if(v!==v)return '\u0000N';if(v===Infinity)return '\u0000I';if(v===-Infinity)return '\u0000J';if(v===0&&1/v<0)return '\u0000Z';}else if(v===undefined)return '\u0000U';return v;};
const decHote=(k,v)=>{if(typeof v==='string'&&v.length===2&&v.charCodeAt(0)===0){const c=v.charCodeAt(1);if(c===78)return NaN;if(c===73)return Infinity;if(c===74)return -Infinity;if(c===90)return -0;if(c===85)return undefined;}return v;};
function charger(fichier,o){
  o=o||{};
  const src=o.source!=null?String(o.source):fs.readFileSync(fichier,'utf8');
  const ctx=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false},microtaskMode:'afterEvaluate'});
  vm.runInContext(BAC_CODE,ctx,{filename:'bac.js'});
  vm.runInContext(src,ctx,{filename:path.basename(fichier),timeout:1000});
  const pose=vm.runInContext('__bac.pose()',ctx,{timeout:1000});
  if(typeof pose!=='string'||pose[0]!=='O')throw new Error(fichier+' : pas de decide(vue, memoire)');
  /* 5 s : TRES large, expres. La limite ne sert qu'a arreter une boucle sans fin ; elle compte en vraie montre, donc un ordinateur charge peut
     la franchir sans que le cerveau y soit pour rien — et la course n'est plus repetable. MESURES : a 25 ms, 1 decision sur ~2 000 coupee ;
     a 500 ms, le 24/11, PC charge par ailleurs (jeu sans ecran a 0,68 x le temps reel) : 3 et 10 decisions coupees sur la meme graine, deux
     courses differentes. En echange, une course s'ABANDONNE a la 3e panne (PANNES_MAX, dans course) : un cerveau qui boucle coute 15 s, pas des heures. */
  /* (2026-11-24, soir) 60 s, et DEUX COMPTES SEPARES. La note de depart en allege, lancee pendant que 13 agents occupaient le PC : 4 courses
     abandonnees « panne » a 5 s. Or le meme compteur melait deux choses qui n'ont rien a voir :
       · la decision COUPEE par la limite de temps (`pannes`) : elle depend de la charge du PC → la course n'est plus repetable → on abandonne ;
       · la decision qui LEVE UNE ERREUR (`erreurs` : un bug du cerveau, une vue qu'il n'attendait pas) : elle se repete a l'identique → la course
         reste repetable, l'ordre de cette decision est vide, on continue et on le dit dans le bilan. */
  /* une decision = un petit script : la vue y entre comme un texte litteral (rien a poser sur le contexte, ou un cerveau aurait pu guetter) */
  const ms=o.ms||60000;
  return {nom:pose.slice(1)||path.basename(fichier,'.js'),fichier:fichier,source:src,pannes:0,erreurs:0,
    neuve(){vm.runInContext('__bac.neuve()',ctx,{timeout:1000});},
    decide(vue){let r;
      try{r=vm.runInContext('__bac.appel('+JSON.stringify(JSON.stringify(vue,encHote))+')',ctx,{timeout:ms});}
      catch(e){let code=null;try{code=e&&e.code;}catch(x){} /* seule une erreur de Node sort d'ici (__bac attrape tout le reste) ; avec microtaskMode, elle est faite dans le contexte : pas d'instanceof */
        if(code==='ERR_SCRIPT_EXECUTION_TIMEOUT'){this.pannes++;this.derniere='decision coupee apres '+ms+' ms';}
        else{this.erreurs++;this.derniere='le bac a leve une erreur';}return null;}
      if(typeof r!=='string'){this.erreurs++;this.derniere='le bac n\'a rien rendu';return null;}
      if(r[0]==='E'){this.erreurs++;this.derniere=r.slice(1,300);return null;}
      try{return JSON.parse(r.slice(1),decHote);}catch(e){return null;}}};  /* 'Oundefined' (un cerveau qui ne rend rien) : ordre vide */
}

const PANNES_MAX=2; /* decisions coupees par la limite de temps avant d'abandonner la course (un cerveau qui boucle : 2 minutes perdues, pas des heures) */
/* UNE COURSE. o : { carte, meteo (imposer la map ; sinon la graine la tire), tmax (s de jeu, TMAX_DEFAUT = 900), trace (garder la vue de chaque decision),
   sansEnregistreur, yeuxEnPlus (controles de verifier.js) } */
function course(J,cerveau,graine,o){
  o=o||{};
  const tmax=o.tmax||TMAX_DEFAUT,N=Math.round(tmax*60);
  J.lancer(graine,o.carte?{carte:o.carte,meteo:o.meteo}:{});
  J.ev('__JR.debut()');
  const D=new Doigts(J,()=>Y.modeDe(J)),JR=J.g.sandbox.__JR;
  cerveau.neuve(); /* la memoire du cerveau : vide au depart de chaque course (un objet de SON contexte) */
  const h=crypto.createHash('sha1'),vues=[];
  let fr=0,vue=null,decisions=0,vide=0,pannes0=cerveau.pannes|0,erreurs0=cerveau.erreurs|0,abandon=false;
  const t1=Date.now();
  while(fr<N){
    if(fr%HUMAIN.decision===0){
      vue=Y.voir(J);
      h.update(vue.mode+'|'+(vue.s||0)+'|'+(vue.lat||0)+'|'+(vue.vitesse||0)+'|'+vue.nitro+'|'+vue.argent+';');
      if(vue.fini)break;
      vue.image=fr;vue.t=+(fr/60).toFixed(2);
      let ordre=null;try{ordre=cerveau.decide(vue);}catch(e){ordre=null;}
      if((cerveau.pannes|0)-pannes0>=PANNES_MAX){abandon=true;break;}   /* le cerveau boucle (ou l'ordinateur est a genoux) : cette course ne vaut rien */
      if(!ordre||typeof ordre!=='object'){ordre={};vide++;}
      D.ordre(ordre,vue);decisions++;
      if(o.trace)vues.push({image:fr,vue:vue,ordre:ordre});
    }
    D.image();J.image();
    if(!o.sansEnregistreur)JR.image();
    if(o.yeuxEnPlus)Y.voir(J);   /* (controle, verifier.js) regarder plus souvent ne doit rien changer a la course */
    fr++;
  }
  const ms=Date.now()-t1;
  D.lache();J.lacher();
  const partie=JSON.parse(J.ev('__JR.fin()'));
  /* (2026-11-24, defaut 24 : « une mort dans les 5 dernieres images notee temps ») morte ou non, c'est l'ENREGISTREMENT qui le dit (l'evenement
     'mort', ecrit a l'image pres), pas la derniere vue (prise jusqu'a 5 images avant la fin) */
  const morte=!!(partie&&(partie.ev||[]).some(e=>e[1]==='mort'));
  if(partie.fin&&(abandon||!morte))partie.fin.cause=abandon?'panne':'temps'; /* arretee par la limite de temps (ou abandonnee : le cerveau en panne), pas par une mort */
  partie.bot={nom:cerveau.nom,graine:graine,carte:o.carte||null,meteo:o.meteo||null,jeu:J.version,jeu_sha:J.sha||null,regime:J.regime||'max',tmax:tmax};
  delete partie.ecran;
  const bilan=Object.assign({graine:graine,images:fr,ms:ms,foisTempsReel:+(fr/60/Math.max(.001,ms/1000)).toFixed(2),
    decisions:decisions,ordresVides:vide,pannes:(cerveau.pannes|0)-pannes0,erreurs:(cerveau.erreurs|0)-erreurs0,derniereErreur:((cerveau.erreurs|0)-erreurs0||(cerveau.pannes|0)-pannes0)?(cerveau.derniere||null):null,gestesRefuses:D.refus,appuis:D.touches.filter(x=>x[2]).length,
    empreinte:h.digest('hex').slice(0,12)},mesures(partie));
  return {partie:partie,touches:D.touches,bilan:bilan,vues:o.trace?vues:undefined};
}
/* ===== LE REJEU (2026-11-24, etape 1 bis BOTS-ML : « les rejeux : la graine, la version du jeu, les touches image par image ») =====
   Rejoue une course SANS cerveau : la graine, la map, et le journal des touches ([image, touche, 1|0]) remis image par image.
   Meme boucle que course() (les yeux regardent aux memes images : l'empreinte se compare a celle de la course d'origine).
   La course s'arrete comme l'originale : a la mort (vue par les yeux, a une image de decision) ou a tmax — jamais « au nombre d'images » du rejeu,
   sinon la derniere decision, celle qui voit la mort, ne serait pas regardee (MESURE : 4 rejeux « differents » dont l'argent etait pourtant le meme).
   o : { carte, meteo, tmax, serie (garder l'etat a chaque decision : pour chercher l'image ou deux rejeux se separent),
         hasard (noter l'etat du generateur a chaque image et a l'entree de chaque fonction qui tire : voir LE RECALAGE DU HASARD) } */
/* ===== LE RECALAGE DU HASARD (2026-11-24, etape 1 bis : la salle de projection) =====
   Le jeu tire TOUT du meme hasard (Math.random) : la flamme d'un reacteur comme la graine de la route suivante. Or un vrai navigateur anime
   plus de choses que le simulateur, et pas autant de fois (MESURE : presque chaque image tire un nombre different de valeurs — 723 contre 403
   a la 1re ; la flamme du bouton NITRO ne vit que si la page a la classe « play »). Sans rien faire : course identique 56,6 s, puis une AUTRE
   route apres le premier portail. Recale une fois par image : identique 127,4 s, puis la map crypto tire la date de son prochain record de prix
   au milieu d'une image, apres des effets. D'ou la regle, sans liste a tenir, sans changer ni le jeu ni le simulateur :
     · le rejeu sans ecran NOTE l'etat du generateur au debut de chaque image, et a l'ENTREE de chaque fonction du jeu qui tire au hasard
       (toute fonction de haut niveau dont le code contient Math.random ; un appel fait depuis une autre de ces fonctions n'est pas note :
       il suit le sien) ;
     · le navigateur POSE ces etats aux memes appels de la meme image ;
     · un appel que SEUL le navigateur fait (un effet d'ecran) est mis de cote : l'etat du generateur est remis apres lui.
   Lire l'etat ne change rien a la course sans ecran (controle : le rejeu qui note redonne la meme empreinte).
   Ce qui reste hors d'atteinte : un tirage fait ailleurs que dans une fonction de haut niveau (une methode, une fonction interne, loop elle-meme).
   `loop` n'est pas enveloppee : jeu-reel la tient par son nom, et son entree est le debut de l'image, deja recale. */
const HASARD_CODE=`window.__HAS={mode:null,cur:null,pos:null,prof:0,noms:[]};
(function(){const H=window.__HAS;
  for(const n of window.__NOMS){if(n==='loop')continue;let v;try{v=eval(n);}catch(x){continue;}if(typeof v!=='function')continue;
    let src;try{src=Function.prototype.toString.call(v);}catch(x){continue;}if(src.indexOf('Math.random')<0||src.slice(0,6)==='class ')continue;
    const gen=!!(v.constructor&&v.constructor.name==='GeneratorFunction');
    if(!gen&&v.prototype&&Object.getOwnPropertyNames(v.prototype).length>1)continue; /* un constructeur : on n'y touche pas */
    const i=H.noms.length;
    /* l'entree d'un appel de premier niveau : rend l'etat a remettre apres lui (un appel que le simulateur n'a pas fait), sinon null */
    const entree=function(){const e=Math.random.__etat;if(H.mode==='note'){H.cur.push(i,e());return null;}
      if(H.mode==='pose'){const q=H.pos&&H.pos[i];if(q&&q.length){e(q.shift());return null;}return e();}return null;};
    const f=gen?function*(){const g=v.apply(this,arguments);for(;;){if(H.prof!==0){const r0=g.next();if(r0.done)return r0.value;yield r0.value;continue;}
        const iso=entree();H.prof++;let r;try{r=g.next();}finally{H.prof--;if(iso!==null)Math.random.__etat(iso);}if(r.done)return r.value;yield r.value;}}
      :function(){if(H.prof!==0)return v.apply(this,arguments);const iso=entree();H.prof++;try{return v.apply(this,arguments);}finally{H.prof--;if(iso!==null)Math.random.__etat(iso);}};
    try{Object.assign(f,v);eval(n+'=f');H.noms.push(n);}catch(x){}}
})()`;
function rejouer(J,graine,touches,o){
  o=o||{};
  const N=Math.round((o.tmax||TMAX_DEFAUT)*60),JR=J.g.sandbox.__JR,h=crypto.createHash('sha1'),serie=[];
  J.lancer(graine,o.carte?{carte:o.carte,meteo:o.meteo}:{});
  J.ev('__JR.debut()');
  let fr=0,k=0,vue=null,HAS=null;const hasard=[],appels=[],etat=o.hasard?J.ev('Math.random.__etat'):null;
  if(o.hasard){J.ev(HASARD_CODE);HAS=J.g.sandbox.__HAS;HAS.mode='note';}
  while(fr<N){
    if(etat){hasard.push(etat());HAS.cur=[];HAS.prof=0;}
    if(fr%HUMAIN.decision===0){
      vue=Y.voir(J);
      h.update(vue.mode+'|'+(vue.s||0)+'|'+(vue.lat||0)+'|'+(vue.vitesse||0)+'|'+vue.nitro+'|'+vue.argent+';');
      if(o.serie)serie.push([fr,vue.mode,vue.s||0,vue.lat||0,vue.vitesse||0,vue.nitro,vue.argent]);
      if(vue.fini)break;
    }
    while(k<touches.length&&touches[k][0]<=fr){if(touches[k][0]===fr)J.touche(TOUCHE[touches[k][1]],!!touches[k][2]);k++;}
    J.image();JR.image();fr++;
    if(etat)appels.push(HAS.cur);
  }
  if(HAS)HAS.mode=null;
  J.lacher();
  const partie=JSON.parse(J.ev('__JR.fin()'));
  if(partie.fin&&!(partie.ev||[]).some(e=>e[1]==='mort'))partie.fin.cause='temps'; /* comme course() (defaut 24) */
  delete partie.ecran;
  /* hasard : images[i] = l'etat au debut de l'image i · appels[i] = [fonction, etat, fonction, etat…] dans l'ordre des appels de l'image i · noms = les fonctions */
  return {partie:partie,images:fr,empreinte:h.digest('hex').slice(0,12),serie:o.serie?serie:undefined,hasard:o.hasard?{images:hasard,noms:HAS.noms,appels:appels}:undefined,bilan:mesures(partie)};
}
module.exports={ouvrir,charger,course,rejouer,shaJeu,TMAX_DEFAUT,JR_CODE,HASARD_CODE,BAC_CODE};
