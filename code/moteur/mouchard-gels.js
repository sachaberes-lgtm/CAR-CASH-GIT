/* ===== LE MOUCHARD DES GELS (2026-11-15, lot GELS — Sacha, build 117 : « quelques freezes » ; la boîte de vol voyait des images de 150-250 ms une fois par seconde
   dont la plupart avec 15-25 ms de travail DANS loop() : le temps partait AILLEURS, et rien ne disait où) =====
   Actif SEULEMENT dans un build de mesure (`?perfrec=2`, ou localStorage `ccPerfRecOn`='2' comme la boîte de vol) ; `?sans=mouchard` le coupe. Éteint : rien n'est enveloppé,
   les tests `MG.on` des tranches de loop sont un booléen faux.
   Allumé, il ENVELOPPE ce que le jeu pose après ce morceau (et tout ce que natif.js ou les bibliothèques posent ensuite) : setTimeout, setInterval, requestAnimationFrame,
   requestIdleCallback, addEventListener, et les rappels des observateurs (Mutation, Resize, Intersection). Chaque rappel est chronométré (deux performance.now) ; au-delà de
   MG.SEUIL (8 ms) il est NOMMÉ (le nom de la fonction, sinon le début de son texte ; 'T:' minuterie, 'I:' intervalle, 'R:' image, 'E:<type>' écouteur, 'O:' observateur)
   et compté dans la course (c.Q, voir enregistreur-perf.js). La boucle de jeu elle-même (`loop`, posée par rAF) est reconnue : son temps total, ses TRANCHES (horodatées par
   `MG.ts[k]` au début de boucle-2…6, avant et après le rendu), et le temps HORS boucle entre deux images (rappels attribués + reste non attribué : ramasse-miettes, système,
   puce qui retient l'image). Il compte aussi les minuteries en attente, les intervalles vivants, les écouteurs posés, les images de loop et les autres rAF par seconde, et note le retour d'arrière-plan
   et le dernier pivot. Aucune allocation par image : les enveloppes sont gardées (WeakMap) par fonction, les tranches dans des Float64Array. */
const MG=(function(){let on=false;
  try{const q=location.search;if(/[?&]perfrec=2\b/.test(q))on=true;else if(!/[?&]perfrec=[01]\b/.test(q))on=localStorage.getItem('ccPerfRecOn')==='2';
    if(/[?&]sans=[^&]*mouchard/.test(q))on=false;}catch(e){}
  return {on:on,SEUIL:8,prof:0,dansBoucle:false,
    ts:new Float64Array(10),tr:new Float64Array(8),trAv:new Float64Array(8), /* ts : 0 début de loop · 2…6 début de boucle-2…6 · 7 avant le rendu · 8 après le rendu · 9 fin ; tr : b1…b6, rendu, après (pré-bâti compris) */
    l0:0,l1:0,lDur:0,lAv:0,gap:0,nLoop:0,nRaf:0,
    hS:0,hN:0,hTop:0,hTopF:null,hTopK:'',  /* hors boucle depuis la fin de la dernière image : somme des rappels, nombre > seuil, le plus long */
    cGap:0,cS:0,cN:0,cTop:0,cTopF:null,cTopK:'',cSaut:0,calc:0,lc0:0,dw:0,GEL:80,  /* …cumulés depuis la dernière image CALCULÉE : hors boucle, rappels, le plus long, loop sautés */
    nTO:0,nIV:0,nEC:0,TO:new Set(),IV:new Set(),
    bgT:0,bgD:0,pivT:0,cachT:0,orient:'',noms:new WeakMap(),env:{},apres:null,lent:null,
    sec:{hS:0,nL:0,nR:0,acH:-1,acT:0,gc:0,gcA:-1,fMax:0,lMax:0},
    fTs:-1,fN:0,fL:0,pT:0,pDue:0,pDeb:0,pMax:-1,pOn:false,pArm:false,sT:null,pc:null, /* (lot RETOURPIVOT) rappels rAF dans l'image d'écran en cours (tous, loop) · le POULS : dernier battement, plus long silence depuis l'image calculée d'avant */
    sen:false,senV:-1,ref:null,senT:0,mgt:false,gcT:0,lourde:null};})();
/* (2026-11-18, lot sondecalme) l'interrupteur de la mesure corrigée : `?sans=sondecalme` = la boîte de vol d'avant (ni CAD.rN remis à zéro au départ, ni horodatage des
   battements natifs, ni étiquette des readPixels) ; voir aussi natif.js et JeuViewController.swift (SondeNatif) */
const SDCALME=(function(){try{return !/[?&]sans=[^&]*sondecalme/.test(location.search);}catch(e){return true;}})();
/* (lot MESURE-RAFALES, 2026-11-17) l'état des rafales — voir « LES RAFALES » en fin de morceau. on : avec le mouchard, sauf `?sans=rafales` */
const MGR={on:false,senDOn:false,dwM:16.7,senDv:-1,senR:-1,senF:-1,mes:0,senDAv:-1,senRAv:-1,senFAv:-1,hCur:-1,hAv:-1,
  spN:[''],spI:{},sd:new Float64Array(96),spP:[],spPn:0,sk:0,s0:0,nPas:-1,
  im:new Float64Array(3),imN:new Uint32Array(3),imAv:new Float64Array(3),imNAv:new Uint32Array(3),hors:0,horsAv:0,
  sec:new Float64Array(3),secN:new Uint32Array(3),secS:0,secSN:0,
  yN:[],yF:[],yI:{},yMs:new Float64Array(96),yC:new Uint32Array(96),yMx:new Float64Array(96),swN:-1,bancMs:0,bancN:0,filMs:0,filN:0,filE:3,filI:0,filOn:false,nSD:0,msSD:0,nSR:0,msSR:0}; /* (lot SENTINELLE) sen : la sentinelle du processeur · senV : sa dernière mesure (ms) · mgt : le témoin du ramasse-miettes · gcT : son dernier passage */
function mgNom(k,fn,a0){ /* le nom d'un rappel lent — seulement au-delà du seuil (une chaîne par fonction, gardée) */
  let n=MG.noms.get(fn);
  if(n===undefined){n=fn.name||'';if(!n||n==='bound '){try{n=String(fn).slice(0,70).replace(/\s+/g,' ');}catch(e){n='?';}}MG.noms.set(fn,n);}
  if(k==='E'){let t='?';try{t=a0&&a0.type||'?';}catch(e){}return 'E:'+t+' '+n;}
  return k+':'+n;}
function mgFin(k,fn,t0,a0){ /* un rappel vient de finir */
  const t1=performance.now(),d=t1-t0;
  if(MG.dansBoucle)return; /* un rappel appelé PENDANT loop (événement envoyé par le jeu lui-même) : son temps est déjà dans la tranche */
  MG.hS+=d;MG.sec.hS+=d;
  if(d>MG.SEUIL){MG.hN++;if(d>MG.hTop){MG.hTop=d;MG.hTopF=fn;MG.hTopK=k;}if(MG.lent)try{MG.lent(mgNom(k,fn,a0),d,0);}catch(e){}}}
function mgEnveloppe(k,fn){
  if(typeof fn!=='function')return fn;
  const W=MG.env[k]||(MG.env[k]=new WeakMap());let w=W.get(fn);if(w)return w;
  if(k==='R'&&fn===loop){
    /* ⚠ une image d'écran SAUTÉE (cadence 30, plafond 60, chargement) passe aussi par loop : le hors-boucle et les rappels se CUMULENT (c*) jusqu'à la prochaine image
       CALCULÉE (bvImage pose MG.calc) — c'est l'intervalle que la boîte de vol mesure ; les loop sautés s'ajoutent à cSaut */
    w=function(ts){const R=MGR;let sd=-1;
      if(R.senDOn&&MG.lc0&&performance.now()-MG.lc0>R.dwM*.8&&mgEnCourse()){sd=mgSenBrut();R.secS+=sd;R.secSN++;R.nSD++;R.msSD+=sd;} /* (lot MESURE-RAFALES) la sentinelle au DÉBUT de l'image, quand elle sera sans doute calculée : en course seulement (MG.lc0 vaut 0 au menu, en pause, à la mort), et seulement passé 80 % de l'intervalle habituel entre deux images calculées (R.dwM) depuis la dernière — à 120 Hz calé à 30, les images sautées de 8, 17 et 25 ms n'en lancent pas. Avant l'horloge de loop, hors des tranches, retirée du hors-boucle */
      const t0=performance.now(),g=MG.l1?t0-MG.l1-(sd>0?sd:0):0;mgImageEcran(ts,1);
      if(MG.pc){if(MG.pOn){const s9=t0-MG.pT;if(s9>MG.pMax)MG.pMax=s9;}else if(MG.pArm&&t0>MG.pDue+2){const s9=t0-MG.pDue;if(s9>MG.pMax)MG.pMax=s9;}} /* (lot RETOURPIVOT) le pouls vu de l'image qui arrive : un battement (ou le guet) en retard = le fil n'était pas libre */
      MG.gap=g;MG.cGap+=g;MG.cS+=MG.hS;MG.cN+=MG.hN;if(MG.hTop>MG.cTop){MG.cTop=MG.hTop;MG.cTopF=MG.hTopF;MG.cTopK=MG.hTopK;}MG.hS=0;MG.hN=0;MG.hTop=0;MG.hTopF=null;
      MG.ts.fill(0);MG.ts[0]=t0;MG.l0=t0;MG.calc=0;MG.dansBoucle=true;MG.nLoop++;MG.sec.nL++;if(R.on)mgRDebut(sd);
      try{return fn.call(this,ts);}finally{const t1=performance.now();MG.dansBoucle=false;MG.ts[9]=t1;MG.l1=t1;MG.lDur=t1-t0;
        if(R.on){if(R.sk)mgSt('');if(R.mes>0)MG.lDur-=R.mes;} /* (lot MESURE-RAFALES) la sous-tranche restée ouverte se ferme ; la sentinelle d'après le rendu ne compte pas dans l'image */
        /* les tranches : chaque horodatage posé ferme la tranche du précédent (une tranche non traversée — hors course, image sautée — vaut 0) */
        R.senF=-1;if(MG.sen&&(MG.lDur>60||(MG.calc&&MG.lc0&&t0-MG.lc0>=MG.GEL))){mgSentinelle();R.senF=MG.senV;} /* (lot SENTINELLE) une image longue, ou un gel qui va s'écrire dans G : une mesure fraîche */
        MG.tr.fill(0);let p=0;for(let i=2;i<10;i++){if(MG.ts[i]>0){const j=p<2?0:p-1;MG.tr[j<8?j:7]+=MG.ts[i]-MG.ts[p];p=i;}}
        if(R.on){if(R.mes>0)MG.tr[7]=Math.max(0,MG.tr[7]-R.mes);R.hCur=-1;if(MG.lDur>60&&MG.lourde)try{MG.lourde(t0);}catch(e){}} /* (lot MESURE-RAFALES) une image lourde : sa ligne c.LH (sentinelles, attentes de la puce, sous-tranches) */
        if(MG.pc&&!MG.pArm){MG.pArm=true;MG.pDue=t1+40;MG.sT.call(window,mgPoulsGuet,40);} /* (lot RETOURPIVOT) le pouls se tient prêt : il ne bat que si l'image suivante tarde */
        if(MG.calc){if(MG.ref)MG.ref();const dw=MG.lc0?t0-MG.lc0:0;MG.lc0=t0;MG.dw=dw;if(dw>=MG.GEL&&MG.apres)try{MG.apres(t1);}catch(e){} /* dw : l'intervalle à l'HORLOGE entre les débuts de deux images calculées = boucle d'avant + trous + loop sautés (l'horodatage rAF, lui, peut être celui d'avant un blocage : le gel s'y voit une image trop tard) */
          MG.trAv.set(MG.tr);MG.lAv=MG.lDur;MG.pMax=-1;MG.cGap=0;MG.cS=0;MG.cN=0;MG.cTop=0;MG.cTopF=null;MG.cSaut=0;if(R.on){if(dw>0&&dw<60)R.dwM=R.dwM*.9+dw*.1;mgRAv();}}
        else{MG.cSaut+=MG.lDur;if(R.on)R.hors+=R.im[0]+R.im[1]+R.im[2]; /* (contrôle MESURE-RAFALES) les appels à la puce d'une loop SAUTÉE vont au hors-boucle (G[50]) au lieu de disparaître */if(MG.cGap>3000){MG.cGap=0;MG.cS=0;MG.cN=0;MG.cTop=0;MG.cTopF=null;MG.cSaut=0;}}}};
  }else if(k==='E'){w=function(e){const t0=performance.now();try{return fn.apply(this,arguments);}finally{mgFin('E',fn,t0,e);}};}
  else if(k==='R'){w=function(ts){mgImageEcran(ts,0);MG.nRaf++;MG.sec.nR++;const t0=performance.now();try{return fn.apply(this,arguments);}finally{mgFin('R',fn,t0);}};}
  else w=function(){const t0=performance.now();try{return fn.apply(this,arguments);}finally{mgFin(k,fn,t0);}};
  W.set(fn,w);return w;}
if(MG.on)try{
  /* ⚠ (MESURÉ au banc) le GUET DU DÉMARRAGE (page/debut-corps.html) enrobe lui aussi setTimeout et requestAnimationFrame, puis REMET les originaux à sa fin (`fin`) :
     une simple affectation était écrasée quelques secondes après le départ et la boucle échappait au mouchard. On pose donc des accesseurs : ce que quiconque
     y range devient la fonction SOUS l'enveloppe, l'enveloppe reste devant. */
  const garde=function(nom,fab){let base=window[nom];const env=fab(function(){return base;});
    Object.defineProperty(window,nom,{configurable:true,enumerable:true,get:function(){return env;},set:function(v){if(typeof v==='function'&&v!==env)base=v;}});};
  MG.sT=window.setTimeout; /* (lot RETOURPIVOT) la minuterie d'avant l'enveloppe : le pouls ne se compte pas lui-même */
  const sI=window.setInterval,cI=window.clearInterval;
  garde('setTimeout',function(B){return function(fn,d){if(typeof fn!=='function')return B().apply(window,arguments);
    let id=0;const f=fn,a=arguments.length>2?Array.prototype.slice.call(arguments,2):null;
    id=B().call(window,function(){if(MG.TO.delete(id))MG.nTO--;const t0=performance.now();try{return a?f.apply(window,a):f.call(window);}finally{mgFin('T',f,t0);}},d);
    MG.TO.add(id);MG.nTO++;return id;};});
  garde('clearTimeout',function(B){return function(id){if(MG.TO.delete(id))MG.nTO--;return B().call(window,id);};});
  window.setInterval=function(fn,d){if(typeof fn!=='function')return sI.apply(window,arguments);
    const a=Array.prototype.slice.call(arguments);a[0]=mgEnveloppe('I',fn);const id=sI.apply(window,a);MG.IV.add(id);MG.nIV++;return id;};
  window.clearInterval=function(id){if(MG.IV.delete(id))MG.nIV--;return cI.call(window,id);};
  garde('requestAnimationFrame',function(B){return function(fn){return B().call(window,mgEnveloppe('R',fn));};}); /* les rAF se comptent à l'arrivée (MG.sec.nL : images de loop, nR : les autres) : deux boucles loop = deux fois plus d'images de loop que d'images d'écran */
  if(window.requestIdleCallback){const rI=window.requestIdleCallback;window.requestIdleCallback=function(fn,o){return rI.call(window,mgEnveloppe('T',fn),o);};}
  const ET=EventTarget.prototype,aE=ET.addEventListener,rE=ET.removeEventListener,EW=MG.env.E=new WeakMap();MG.aE=aE;
  ET.addEventListener=function(t,fn,o){if(typeof fn==='function'){MG.nEC++;return aE.call(this,t,mgEnveloppe('E',fn),o);}return aE.call(this,t,fn,o);};
  ET.removeEventListener=function(t,fn,o){if(typeof fn==='function'){const w=EW.get(fn);if(w){MG.nEC--;return rE.call(this,t,w,o);}}return rE.call(this,t,fn,o);};
  ['MutationObserver','ResizeObserver','IntersectionObserver'].forEach(function(nm){const O=window[nm];if(!O)return;
    const N=function(cb,o){return Reflect.construct(O,[mgEnveloppe('O',cb),o],new.target||N);};N.prototype=O.prototype;Object.setPrototypeOf(N,O);window[nm]=N;});
  /* le contexte : retour d'arrière-plan, pivot (nos écouteurs, posés avec les originaux : hors du compte) */
  aE.call(document,'visibilitychange',function(){const t=performance.now();if(document.hidden)MG.cachT=t;else if(MG.cachT){MG.bgT=t;MG.bgD=t-MG.cachT;MG.cachT=0;}},true);
  aE.call(document,'resume',function(){if(!MG.bgT||performance.now()-MG.bgT>2000){MG.bgT=performance.now();}});
  const orient=function(){const o=innerWidth>innerHeight?'P':'D';if(MG.orient&&o!==MG.orient)MG.pivT=performance.now();MG.orient=o;};
  aE.call(window,'resize',orient);aE.call(window,'orientationchange',function(){MG.pivT=performance.now();});orient();
  window.__MG=MG; /* (banc) le mouchard lisible depuis l'inspecteur — build de mesure seulement */
}catch(e){MG.on=false;}
/* ===== LE RETOUR + PIVOT DANS LE MOUCHARD (2026-11-17, lot qualité RETOURPIVOT — builds 117-119 : la majorité des gels sont « hors boucle », l'image d'écran
   n'arrive pas pendant 2-3 battements alors que la boucle fait 8 ms ; ils commencent après un retour d'arrière-plan LONG suivi d'un pivot et ne cessent plus) =====
   Trois mesures, `?perfrec=2` seulement (`?sans=pouls` coupe le pouls) :
   · LE POULS (G[37]) : quand l'image suivante tarde (40 ms après la fin de loop), un battement toutes les ~5 ms — une minuterie puis un message MessageChannel
     (les messages ne sont pas bridés comme les minuteries). G[37] = le plus long silence entre deux battements pendant le trou : ≈ 5-10 ms, le fil était LIBRE
     (l'image est retenue ailleurs : compositeur, puce, système) ; ≈ la durée du trou, le fil était PRIS (nos rappels, le ramasse-miettes, une tâche du moteur web).
     Il s'arrête à l'image suivante, ou au bout de 3 s. Aucune allocation par battement. Si le fil est pris dès le début du trou, le guet lui-même ne part pas à l'heure :
     l'image qui arrive compte alors son retard (maintenant − heure prévue du guet) comme silence — un trou où rien n'a battu se lit donc « fil pris », jamais « libre ».
   · LES IMAGES D'ÉCRAN : chaque rappel rAF compte dans l'image d'écran de son horodatage ; par seconde (M) le plus grand nombre de rappels dans une même image
     (= les chaînes rAF vivantes) et le plus grand nombre de loop dans une même image (2 = deux boucles de jeu).
   · LA BOÎTE NOIRE (genre « toile ») au retour d'arrière-plan et au pivot (1,5 s après, une fois la page retaillée) et à la perte / au retour du contexte 3D :
     toile 3D (largeur × hauteur), tampon de dessin (gl.drawingBuffer*), fenêtre, densité de l'écran, DPR du jeu, rapport toile / fenêtre, écouteurs, rAF par image. */
function mgImageEcran(ts,estLoop){if(ts!==MG.fTs){MG.fTs=ts;MG.fN=0;MG.fL=0;}MG.fN++;if(estLoop)MG.fL++;const s=MG.sec;if(MG.fN>s.fMax)s.fMax=MG.fN;if(MG.fL>s.lMax)s.lMax=MG.fL;}
function mgPoulsGuet(){MG.pArm=false;const n=performance.now();
  if(n-MG.l1<38){const d9=Math.max(4,40-(n-MG.l1));MG.pArm=true;MG.pDue=n+d9;MG.sT.call(window,mgPoulsGuet,d9);return;} /* une image est passée entre-temps : on se recale sur elle */
  if(MG.pOn)return;MG.pOn=true;MG.pDeb=MG.l1;MG.pT=n;if(MG.pMax<0)MG.pMax=0;mgPoulsBat();}
function mgPoulsBat(){MG.sT.call(window,mgPoulsPoste,5);}
function mgPoulsPoste(){try{MG.pc.port1.postMessage(0);}catch(e){MG.pOn=false;}}
function mgPoulsRecu(){const n=performance.now(),s=n-MG.pT;MG.pT=n;if(s>MG.pMax)MG.pMax=s;
  if(MG.l1!==MG.pDeb||n-MG.pDeb>3000){MG.pOn=false;return;} /* l'image est arrivée (ou le trou dure : arrière-plan) — le pouls se tait */
  mgPoulsBat();}
let MG_GL=null,MG_CW=null,MG_CH=null; /* le contexte WebGL du jeu, lu une fois ; les accesseurs NATIFS de la toile */
/* ⚠ (MESURÉ au banc) LA LOUPE (rendu/loupe-caisse.js) redéfinit `width`/`height` de la toile 3D : ils rendent la taille de la SCÈNE (487×1055 à DPR 1,25) alors que la vraie
   toile fait l'écran ×3 (1170×2532) en course, téléphone froid. On lit donc les accesseurs natifs : c'est la taille que le compositeur reçoit. */
function mgToile(){let w=-1,h=-1,bw=-1,bh=-1,r=-1;try{const cv=renderer.domElement;
  if(!MG_CW){const P=HTMLCanvasElement.prototype;MG_CW=Object.getOwnPropertyDescriptor(P,'width').get;MG_CH=Object.getOwnPropertyDescriptor(P,'height').get;}
  w=MG_CW.call(cv);h=MG_CH.call(cv);if(!MG_GL)MG_GL=renderer.getContext();bw=MG_GL.drawingBufferWidth;bh=MG_GL.drawingBufferHeight;
  const iw=typeof VP!=='undefined'?VP.w:innerWidth,ih=typeof VP!=='undefined'?VP.h:innerHeight;r=Math.round(w*h/Math.max(1,iw*ih)*100);}catch(e){}return [w,h,bw,bh,r];}
function mgNoteToile(quoi){if(!MG.on)return;try{const t=mgToile();let pr='?';try{pr=renderer.getPixelRatio().toFixed(2);}catch(e){}
  window.__ccNote('toile',quoi+' · toile '+t[0]+'×'+t[1]+' · tampon '+t[2]+'×'+t[3]+' · fenêtre '+innerWidth+'×'+innerHeight+' · densité '+(window.devicePixelRatio||1)+' · DPR jeu '+pr+' (cur '+(typeof curDPR==='number'?curDPR.toFixed(2):'?')+')'+(typeof LOUPE!=='undefined'?' · loupe '+(LOUPE.on?'POSÉE ×'+LOUPE.k:'non'):'')+' · toile/fenêtre '+t[4]+' % · écouteurs '+MG.nEC+' · minuteries '+MG.nTO+' · intervalles '+MG.nIV+' · rAF par image '+MG.sec.fMax+' (loop '+MG.sec.lMax+')'+(MG_GL&&MG_GL.isContextLost()?' · CONTEXTE PERDU':''));}catch(e){}}
if(MG.on)try{
  if(!/[?&]sans=[^&]*pouls/.test(location.search)&&typeof MessageChannel==='function'){MG.pc=new MessageChannel();MG.pc.port2.onmessage=mgPoulsRecu;}
  let tRet=0,tPiv=0,o0=innerWidth>innerHeight;
  const plus=function(quoi,t){return function(){clearTimeout(t===1?tRet:tPiv);const id=MG.sT.call(window,function(){mgNoteToile(quoi);},1500);if(t===1)tRet=id;else tPiv=id;};};
  const ret=plus('retour d\'arrière-plan',1),piv=plus('pivot',2);
  MG.aE.call(document,'visibilitychange',function(){if(!document.hidden)ret();});
  MG.aE.call(window,'resize',function(){const o=innerWidth>innerHeight;if(o!==o0){o0=o;piv();}}); /* MG.aE : l'original, nos écouteurs restent hors du compte */
}catch(e){}
function mgAc(sec){ /* l'état du contexte audio du jeu : 0 aucun · 1 running · 2 suspended · 3 interrupted · 4 closed ; +10 : « running » mais son horloge n'a pas bougé depuis la seconde d'avant */
  let s=0;try{if(typeof AC!=='undefined'&&AC){const st=AC.state;s=st==='running'?1:st==='suspended'?2:st==='interrupted'?3:st==='closed'?4:5;
    if(sec){if(s===1){const h=AC.currentTime;if(MG.sec.acH===h)s+=10;MG.sec.acH=h;}else MG.sec.acH=-1;}}}catch(e){} /* sec : la lecture d'une seconde (seule à comparer l'horloge) */
  return s;}
function mgTas(){try{const m=performance.memory;if(m&&m.usedJSHeapSize)return Math.round(m.usedJSHeapSize/1048576);}catch(e){}return -1;}
/* ===== LA SENTINELLE DU PROCESSEUR ET LE TÉMOIN DU RAMASSE-MIETTES (2026-11-16, lot SENTINELLE — Sacha, build 118, 25 min : « beaucoup de lag ».
   Dans deux longues courses TOUT le fil principal ralentit ×8 par paquets — toutes les tranches de loop, même touchmove. Bridage du processeur par iOS ? ramasse-miettes ? autre ?) =====
   LA SENTINELLE : un travail FIXE (les mêmes ≈ 205 000 additions sur un Int32Array pré-alloué, aucune allocation, ≈ 0,2 ms à froid), chronométré une fois par seconde (M) et à
   chaque image de loop > 60 ms ou à chaque gel (G). Si le processeur est bridé ×N, elle dure ×N ; si c'est le ramasse-miettes ou le code du jeu, elle ne bouge pas.
   ⚠ (MESURÉ sur le vol du 16/11) l'horloge de la vue web d'iOS est au MILLISECONDE : une mesure seule vaut 0 ou 1 ms à froid (1 ou 2 bridé ×8) ; la phase de l'horloge est au hasard,
   donc la MOYENNE de plusieurs mesures (10 s, ou tous les gels d'un paquet) donne la vraie durée. `?sans=sentinelle` la coupe.
   LE TÉMOIN : un objet appât par seconde inscrit dans un FinalizationRegistry ; quand le ramasse-miettes le ramasse, le rappel compte un passage (rappels à moins de 5 ms l'un de
   l'autre = un seul passage) et l'âge de l'appât (sa durée de vie = l'écart entre deux ramassages qui le voient). `?sans=mgtemoin` le coupe ; sans FinalizationRegistry, rien. */
const MG_SA=new Int32Array(1024);
function mgSenBrut(){const t0=performance.now();let s=0; /* (lot MESURE-RAFALES) le travail fixe seul, sans toucher à MG.senV / MG.senT (G[35] garde son sens) */
  for(let k=0;k<200;k++){for(let i=0;i<1024;i++)s=(s+MG_SA[i]+i)|0;MG_SA[k&1023]=s&1;}
  return performance.now()-t0;}
function mgSentinelle(){const t0=performance.now(),d=mgSenBrut();MG.senV=d;MG.senT=t0;return d;}
let MG_FR=null;
function mgAppat(){if(!MG_FR)return;try{MG_FR.register({t:performance.now()},performance.now());}catch(e){}} /* un objet par seconde (le seul que le témoin alloue) */
if(MG.on)try{const q=location.search;
  MG.sen=!/[?&]sans=[^&]*sentinelle/.test(q);
  if(MG.sen)for(let k=0;k<12;k++)mgSentinelle(); /* le réchauffage : les premières mesures tournent dans l'interprète, pas encore compilées */
  if(!/[?&]sans=[^&]*mgtemoin/.test(q)&&typeof FinalizationRegistry==='function'){
    MG_FR=new FinalizationRegistry(function(t9){const n=performance.now();if(n-MG.gcT>5){MG.sec.gc++;}MG.gcT=n;MG.sec.gcA=Math.round(n-t9);});MG.mgt=true;}
}catch(e){MG.sen=false;MG.mgt=false;}
function mgNatif(){ /* l'état natif, un chiffre par champ (9 = inconnu) : thermique ×1000 + branché ×100 + autre musique ×10 + économie */
  const ch=function(v,mx){v=+v;return (v>=0&&v<=mx&&v===(v|0))?v:9;};let w=window;
  return ch(w.__ccThermique,3)*1000+ch(w.__ccBranche,2)*100+ch(w.__ccAutreSon,2)*10+ch(w.__ccEco,1);}
window.dbgMouchard=function(a){ /* (banc) l'état · dbgMouchard('gel',ms) : une minuterie qui bloque `ms` dans 1 s (le gel provoqué exprès, pour vérifier l'attribution) */
  if(a==='gel'){const ms=+arguments[1]||120;setTimeout(function mouchardGelExpres(){const f=performance.now()+ms;while(performance.now()<f){}},1000);return 'gel de '+ms+' ms dans 1 s';}
  if(a==='sentinelle'){const n=+arguments[1]||20,o=[];for(let k=0;k<n;k++)o.push(+mgSentinelle().toFixed(3));return o;} /* (lot SENTINELLE, banc) n mesures d'affilée */
  if(a==='rafales'){const R=MGR,y={};for(let i=0;i<R.yN.length;i++)if(R.yC[i])y[['gl ','2d ','envoi '][R.yF[i]]+R.yN[i]]=[R.yC[i],+R.yMs[i].toFixed(1)]; /* (lot MESURE-RAFALES, banc) l'état du lot */
    let nY=0,msY=0;for(let i=0;i<R.yN.length;i++){nY+=R.yC[i];msY+=R.yMs[i];}
    return {on:R.on,senDebut:R.senDOn,senDebutN:R.nSD,senDebutMs:+R.msSD.toFixed(1),senRenduN:R.nSR,senRenduMs:+R.msSR.toFixed(1),appelsN:nY,appelsMs:+msY.toFixed(1),loops:MG.nLoop,nomsPerdus:R.spPn,dwM:+R.dwM.toFixed(1),sousTranches:R.spN.slice(1),image:Array.from(R.sd.subarray(1,R.spN.length),function(v){return +v.toFixed(2);}),appelsCourse:y,passes:R.nPas,reposes:R.repose|0,sw:window.__ccSw||null};}
  if(a==='lourd'){MGR.bancMs=+arguments[1]||90;MGR.bancN=+arguments[2]||10;return 'les '+MGR.bancN+' prochaines loop pleines : +'+MGR.bancMs+' ms dans b4 (sous-tranche « banc · lourd exprès »)';} /* (banc) des images lourdes provoquées, DANS la boucle */
  if(a==='fil'){const R=MGR;R.filMs=+arguments[1]||14;R.filN=arguments.length>2?(+arguments[2]|0):90;R.filE=Math.max(1,+arguments[3]||3);R.filI=0;R.filOn=false;if(!R.filN)return 'fil entier arrêté';return 'les '+R.filN+' prochaines loop pleines, une sur '+R.filE+' : +'+R.filMs+' ms à CHAQUE borne b2…rendu (sous-tranche « banc · fil entier exprès »)';} /* (banc, 3e tour MESURE-RAFALES) une rafale « fil entier » provoquée : TOUTES les tranches gonflent, une image sur filE — le bloc RAFALES d'analyse-vol.py la voit */
  if(a==='gelI'){const ms=+arguments[1]||120;const id=setInterval(function mouchardGelIntervalle(){const f=performance.now()+ms;while(performance.now()<f){}},1000);return id;}
  return {on:MG.on,minuteries:MG.nTO,intervalles:MG.nIV,ecouteurs:MG.nEC,boucles:MG.nLoop,imageMs:+MG.lDur.toFixed(1),horsMs:+MG.gap.toFixed(1),
    tranches:Array.from(MG.tr,function(v){return +v.toFixed(1);}),retourS:MG.bgT?+((performance.now()-MG.bgT)/1000).toFixed(1):null,pivotS:MG.pivT?+((performance.now()-MG.pivT)/1000).toFixed(1):null,ac:mgAc(),tas:mgTas(),sentinelle:MG.sen?+MG.senV.toFixed(3):null,temoin:MG.mgt,gcSec:MG.sec.gc,natif:mgNatif()};};
/* ===== LES RAFALES : CE QUE FAIT LE FIL PENDANT UNE IMAGE LOURDE (2026-11-17, lot qualité MESURE-RAFALES — vol 1448, build 120 : en économie d'énergie + téléphone
   tiède ou chaud, des rafales de 3 à 34 s où une image sur 3-4 pèse ~115 ms, avec des tranches de montant FIXE (b1 15 ms, b4 47-52, rendu 20-22). Attente de la puce,
   travail périodique à nous, ou ramasse-miettes ? Le vol ne pouvait pas trancher) =====
   `?perfrec=2` seulement (avec le mouchard) ; `?sans=rafales` coupe tout le lot. Éteint : rien n'est enveloppé, chaque marque des boucles est un `if(MG.on)` faux.
   1. LES SENTINELLES DE L'IMAGE (le même travail fixe que mgSentinelle) : au DÉBUT de loop, EN COURSE seulement, quand l'image sera sans doute calculée (passé 80 % de
      l'intervalle habituel entre deux images calculées) — avant l'horloge de loop : hors des tranches ; et APRÈS LE RENDU, si l'image a déjà pris ≥ 45 ms — retirée de la
      tranche « après », de la durée de loop et du travail compté depuis QLR.t0 (cadFin, qlSonde, bvImage, pré-bâti, pilote).
      Avec celle de FIN (mgSentinelle, loop > 60 ms ou gel), trois mesures dans la même image. `?sans=sendebut` coupe les deux nouvelles. Coût : une sentinelle par image
      calculée (≈ 0,2 ms à froid, ≈ 1,2 ms bridé) — la moyenne par seconde est dans M[23], on peut la retirer du budget.
   2. LES SOUS-TRANCHES : `mgSt('nom')` (derrière `if(MG.on)`) ferme la sous-tranche ouverte et ouvre la suivante, `mgSt('')` ferme ; une borne de tranche (mgTs) ferme
      aussi. Les passes du compositeur et le quad de la loupe sont chronométrés à part (mgPasses : imbriqués DANS « rendu composer »). Une image = 96 cases d'un
      Float64Array, aucune allocation (un nom au-delà est perdu et compté : c.LHNp) ; ÉCRITES seulement pour une loop > 60 ms (c.LH), sommées sur les images légères (< 25 ms) pour la référence (c.SR).
   3. LES APPELS QUI ATTENDENT LA PUCE, enveloppés sur les prototypes : famille 0 « WebGL synchrones » (get* sauf getContextAttributes, checkFramebufferStatus,
      readPixels, clientWaitSync, finish) ; 1 « Canvas 2D » (getImageData, putImageData, measureText, drawImage — une toile WebGL dessinée dans un 2D est relue) ;
      2 « WebGL envois » (draw*, tex*Image*, buffer*Data, generateMipmap, clear, blit/invalidateFramebuffer, compileShader, linkProgram, flush : sur iOS la file vers le
      processus de la puce, pleine, bloque N'IMPORTE QUEL appel — `?sans=glenvois` les laisse nus). Par image (G[43-48], c.LH), par seconde (M[17-22]), par nom (c.Y).
      ⚠ L'horloge de la vue web d'iOS est au ms : un appel isolé vaut 0 ou 1 ms ; les SOMMES de nombreux appels sont justes en moyenne (phase au hasard).
   4. LE NATIF (M[24-26]) : JeuViewController.swift (SondeNatif), démarré par natif.js dans l'app de mesure, pose chaque seconde `window.__ccSw` =
      [pression mémoire 0 normale · 1 avertissement · 2 critique, sentinelle Swift sur le fil principal de l'app (µs), retard du battement d'une seconde (ms ×10)]. */
function mgRDebut(sd){const R=MGR;R.sd.fill(0);R.sk=0;R.im.fill(0);R.imN.fill(0);R.senDv=sd;R.senR=-1;R.mes=0;}
function mgRAv(){const R=MGR;R.senDAv=R.senDv;R.senRAv=R.senR;R.senFAv=R.senF;R.imAv.set(R.im);R.imNAv.set(R.imN);R.hAv=R.hCur;R.horsAv=R.hors;R.hors=0;}
function mgSpId(nm){const R=MGR,i=R.spN.length;if(i>=R.sd.length){R.spI[nm]=0;R.spPn++;if(R.spP.length<24)R.spP.push(nm);return 0;}R.spN.push(nm);R.spI[nm]=i;return i;} /* 96 cases (≈ 63 noms + 3-5 passes au 17/11 : la marge) ; au-delà, le nom est PERDU, compté (c.LHNp) et son temps ne s'écrit nulle part */
function mgEnCourse(){try{return started&&running&&!paused&&!gameOver;}catch(e){return false;}}
function mgSt(nm){const R=MGR;if(!R.on)return;const t=performance.now();if(R.sk)R.sd[R.sk]+=t-R.s0;let i=0;if(nm){i=R.spI[nm];if(i===undefined)i=mgSpId(nm);}R.sk=i;R.s0=t;}
function mgAj(nm,d){const R=MGR;if(!R.on)return;let i=R.spI[nm];if(i===undefined)i=mgSpId(nm);if(i)R.sd[i]+=d;} /* un chrono à part (imbriqué : il ne ferme rien) */
function mgTs(k){const t=performance.now(),R=MGR;MG.ts[k]=t;if(R.sk){R.sd[R.sk]+=t-R.s0;R.sk=0;}
  if(R.filN>0||R.filOn){if(k===2){R.filOn=R.filN>0&&(R.filI++%R.filE===0);if(R.filN>0)R.filN--;}if(R.filOn){mgSt('banc · fil entier exprès');const f=performance.now()+R.filMs;while(performance.now()<f){}mgSt('');}} /* (banc) dbgMouchard('fil') */
  if(k===4&&R.bancN>0){R.bancN--;mgSt('banc · lourd exprès');const f=performance.now()+R.bancMs;while(performance.now()<f){}mgSt('');}} /* (banc) dbgMouchard('lourd') */ /* une borne de tranche (boucle-2…6, avant le rendu) */
function mgApresRendu(){const t=performance.now(),R=MGR;MG.ts[8]=t;if(R.sk){R.sd[R.sk]+=t-R.s0;R.sk=0;}
  if(R.senDOn&&t-MG.ts[0]>=45&&mgEnCourse()){R.senR=mgSenBrut();const m=performance.now()-t;R.mes+=m;R.nSR++;R.msSR+=m;QLR.t0+=m;if(BANC_ON)BANC_T0+=m;}} /* (contrôle MESURE-RAFALES) la sentinelle d'après le rendu sort aussi du travail que lisent cadFin (CAD.w), qlSonde, bvImage, le pré-bâti et le pilote (tous comptent depuis QLR.t0) */
function mgPasses(){const R=MGR;if(!R.on)return;try{if(!composer||composer.passes.length===R.nPas)return;R.nPas=composer.passes.length;
  composer.passes.forEach(function(p,i){if(p.__mg)return;p.__mg=1;const r=p.render;
    const nm='passe '+i+' '+(p===acesPass?'ACES (+ loupe)':p===bloomPass?'bloom':(THREE.RenderPass&&p instanceof THREE.RenderPass)?'scène':(p.constructor&&p.constructor.name)||'?');
    p.render=function(){const t=performance.now();try{return r.apply(this,arguments);}finally{mgAj(nm,performance.now()-t);}};});
  if(typeof LOUPE!=='undefined'&&LOUPE.quad&&!LOUPE.quad.__mg){const q=LOUPE.quad,r=q.render;q.__mg=1;q.render=function(){const t=performance.now();try{return r.apply(this,arguments);}finally{mgAj('dont loupe (quad)',performance.now()-t);}};}
  }catch(e){}}
function mgYId(nm,fam){const R=MGR,k=fam+nm;let i=R.yI[k];if(i===undefined){i=R.yN.length;if(i>=R.yMs.length)return -1;R.yN.push(nm);R.yF.push(fam);R.yI[k]=i;}return i;}
function mgY(id,fam,d){const R=MGR;if(id>=0){R.yMs[id]+=d;R.yC[id]++;if(d>R.yMx[id])R.yMx[id]=d;}
  if(MG.dansBoucle){R.im[fam]+=d;R.imN[fam]++;}else R.hors+=d;R.sec[fam]+=d;R.secN[fam]++;}
/* (3e tour, vu au banc) LE GUET DU DÉMARRAGE (page/debut-corps.html, « serpent ») enveloppe ~45 appels WebGL AVANT nous, et à sa fin REMET les originaux qu'il avait gardés :
   nos enveloppes de getError, drawElements, bufferData… disparaissaient avec (banc J : 0 envoi compté après la fin du guet, en pleine course). Une fois par seconde
   (mgRSec) on regarde getError ; s'il n'est plus à nous, on REPOSE (les noms déjà à nous sont sautés : rien n'est compté deux fois). MGR.repose = combien de fois. */
function mgYGarde(){try{const P=window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype;if(P&&typeof P.getError==='function'&&!P.getError.__mg){mgYPose();MGR.repose=(MGR.repose|0)+1;}}catch(e){}}
function mgYPose(){const q=location.search,env=!/[?&]sans=[^&]*glenvois/.test(q);
  const sync=/^(get(?!ContextAttributes$)\w+|checkFramebufferStatus|readPixels|clientWaitSync|finish)$/,
    envoi=/^(draw(Arrays|Elements|RangeElements|Buffers)(Instanced(ANGLE)?)?|(compressed)?[tT]ex(Sub)?Image[23]D|buffer(Sub)?Data|generateMipmap|clear|blitFramebuffer|invalidate(Sub)?Framebuffer|compileShader|linkProgram|flush)$/,
    c2=/^(getImageData|putImageData|measureText|drawImage)$/;
  const fait=function(P,deux){if(!P)return;Object.getOwnPropertyNames(P).forEach(function(nm){let d=null;try{d=Object.getOwnPropertyDescriptor(P,nm);}catch(e){}
    if(!d||typeof d.value!=='function'||!d.writable||d.value.__mg)return; /* (3e tour) déjà enveloppé par nous : rien (mgYGarde repose sans doubler) */
    const fam=deux?(c2.test(nm)?1:-1):sync.test(nm)?0:(env&&envoi.test(nm))?2:-1;if(fam<0)return;
    const id=mgYId(nm,fam),g=d.value;
    const w=(SDCALME&&nm==='readPixels')? /* (lot sondecalme) readPixels : aussi compté PAR APPELANT (c.Y « gl readPixels ← qui »), après le chrono ; « gl readPixels » reste le total */
      function(){const t=performance.now();try{return g.apply(this,arguments);}finally{const d9=performance.now()-t;mgY(id,fam,d9);mgYParQui(nm,fam,d9);}}:
      function(){const t=performance.now();try{return g.apply(this,arguments);}finally{mgY(id,fam,performance.now()-t);}};w.__mg=1;P[nm]=w;});};
  fait(window.WebGLRenderingContext&&WebGLRenderingContext.prototype,false);fait(window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype,false);
  fait(window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype,true);}
/* ===== QUI APPELLE readPixels (2026-11-18, lot sondecalme — vol 1118-0416 : 16 à 64 « gl readPixels » synchrones par course, jusqu'à 255 ms, sans savoir qui) =====
   La pile de l'appel (new Error().stack : quelques dizaines de µs, pour un appel rare), sans nos propres cadres ni ceux de three.js (vendor/) : le premier cadre du JEU
   donne l'étiquette « nom l.LIGNE » (la ligne d'index.html : `node code/assembler.cjs` dit quel morceau ; un rappel anonyme n'a que sa ligne). 12 étiquettes au plus
   (les cases de c.Y sont comptées : 96), au-delà « autre ». Seulement le nombre, les ms et le pire, comme les autres lignes de c.Y : rien n'entre dans les familles
   (mgY l'a déjà fait). `?sans=sondecalme` : plus d'étiquette. */
function mgYQui(){let s='';try{s=String(new Error().stack||'');}catch(e){return '?';}
  const L=s.split('\n');let k=0;
  for(let i=0;i<L.length;i++){const l=L[i].trim();if(!l||/^Error\b/.test(l))continue;
    const m=/^at (?:(.+?) \()?(.+?):(\d+):\d+\)?$/.exec(l)||/^(?:(.*?)@)?(.+?):(\d+):\d+$/.exec(l);if(!m)continue;
    if(k++<3)continue; /* mgYQui, mgYParQui, l’enveloppe */
    if(/vendor\/|three[^\/]*\.js/.test(m[2]))continue;
    const nm=(m[1]||'').replace(/^(?:Object\.|new |async )/,'');
    return (nm&&nm!=='anonymous'&&nm!=='<anonymous>'?nm+' ':'')+'l.'+m[3];}
  return '?';}
function mgYParQui(nm,fam,d){const R=MGR;let q=mgYQui(),k=fam+nm+' ← '+q;
  if(R.yI[k]===undefined&&(R.quiN|0)>=12){q='autre';k=fam+nm+' ← autre';}
  if(R.yI[k]===undefined)R.quiN=(R.quiN|0)+1;
  const i=mgYId(nm+' ← '+q,fam);if(i<0)return;R.yMs[i]+=d;R.yC[i]++;if(d>R.yMx[i])R.yMx[i]=d;}
if(MG.on)try{const q=location.search;
  if(!/[?&]sans=[^&]*rafales/.test(q)){MGR.on=true;MGR.senDOn=MG.sen&&!/[?&]sans=[^&]*sendebut/.test(q);mgYPose();}
}catch(e){MGR.on=false;MGR.senDOn=false;}
function mgRSec(M){ /* (enregistreur-perf.js, bvSec) les 10 colonnes de la seconde, M[17…26], puis remise à zéro */
  const R=MGR;if(!R.on){for(let i=0;i<10;i++)M.push(-1);return;}
  mgYGarde();
  for(let f=0;f<3;f++)M.push(Math.round(R.sec[f]*10),R.secN[f]);
  M.push(R.secSN?Math.round(R.secS/R.secSN*100):-1);R.sec.fill(0);R.secN.fill(0);R.secS=0;R.secSN=0;
  const w=window,a=w.__ccSw,n=w.__ccSwN|0,frais=!!a&&n!==R.swN;R.swN=n;
  M.push(a?(a[0]|0):-1,frais?(a[1]|0):-1,frais?(a[2]|0):-1);}
function mgRVide(){const R=MGR;R.yMs.fill(0);R.yC.fill(0);R.yMx.fill(0);R.sec.fill(0);R.secN.fill(0);R.secS=0;R.secSN=0;} /* une course neuve */
