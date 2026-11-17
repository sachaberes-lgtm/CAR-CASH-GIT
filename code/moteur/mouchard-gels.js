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
    sen:false,senV:-1,ref:null,senT:0,mgt:false,gcT:0};})(); /* (lot SENTINELLE) sen : la sentinelle du processeur · senV : sa dernière mesure (ms) · mgt : le témoin du ramasse-miettes · gcT : son dernier passage */
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
    w=function(ts){const t0=performance.now(),g=MG.l1?t0-MG.l1:0;mgImageEcran(ts,1);
      if(MG.pc){if(MG.pOn){const s9=t0-MG.pT;if(s9>MG.pMax)MG.pMax=s9;}else if(MG.pArm&&t0>MG.pDue+2){const s9=t0-MG.pDue;if(s9>MG.pMax)MG.pMax=s9;}} /* (lot RETOURPIVOT) le pouls vu de l'image qui arrive : un battement (ou le guet) en retard = le fil n'était pas libre */
      MG.gap=g;MG.cGap+=g;MG.cS+=MG.hS;MG.cN+=MG.hN;if(MG.hTop>MG.cTop){MG.cTop=MG.hTop;MG.cTopF=MG.hTopF;MG.cTopK=MG.hTopK;}MG.hS=0;MG.hN=0;MG.hTop=0;MG.hTopF=null;
      MG.ts.fill(0);MG.ts[0]=t0;MG.l0=t0;MG.calc=0;MG.dansBoucle=true;MG.nLoop++;MG.sec.nL++;
      try{return fn.call(this,ts);}finally{const t1=performance.now();MG.dansBoucle=false;MG.ts[9]=t1;MG.l1=t1;MG.lDur=t1-t0;
        /* les tranches : chaque horodatage posé ferme la tranche du précédent (une tranche non traversée — hors course, image sautée — vaut 0) */
        if(MG.sen&&(MG.lDur>60||(MG.calc&&MG.lc0&&t0-MG.lc0>=MG.GEL)))mgSentinelle(); /* (lot SENTINELLE) une image longue, ou un gel qui va s'écrire dans G : une mesure fraîche */
        MG.tr.fill(0);let p=0;for(let i=2;i<10;i++){if(MG.ts[i]>0){const j=p<2?0:p-1;MG.tr[j<8?j:7]+=MG.ts[i]-MG.ts[p];p=i;}}
        if(MG.pc&&!MG.pArm){MG.pArm=true;MG.pDue=t1+40;MG.sT.call(window,mgPoulsGuet,40);} /* (lot RETOURPIVOT) le pouls se tient prêt : il ne bat que si l'image suivante tarde */
        if(MG.calc){if(MG.ref)MG.ref();const dw=MG.lc0?t0-MG.lc0:0;MG.lc0=t0;MG.dw=dw;if(dw>=MG.GEL&&MG.apres)try{MG.apres(t1);}catch(e){} /* dw : l'intervalle à l'HORLOGE entre les débuts de deux images calculées = boucle d'avant + trous + loop sautés (l'horodatage rAF, lui, peut être celui d'avant un blocage : le gel s'y voit une image trop tard) */
          MG.trAv.set(MG.tr);MG.lAv=MG.lDur;MG.pMax=-1;MG.cGap=0;MG.cS=0;MG.cN=0;MG.cTop=0;MG.cTopF=null;MG.cSaut=0;}
        else{MG.cSaut+=MG.lDur;if(MG.cGap>3000){MG.cGap=0;MG.cS=0;MG.cN=0;MG.cTop=0;MG.cTopF=null;MG.cSaut=0;}}}};
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
function mgSentinelle(){const t0=performance.now();let s=0;
  for(let k=0;k<200;k++){for(let i=0;i<1024;i++)s=(s+MG_SA[i]+i)|0;MG_SA[k&1023]=s&1;}
  const d=performance.now()-t0;MG.senV=d;MG.senT=t0;return d;}
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
  if(a==='gelI'){const ms=+arguments[1]||120;const id=setInterval(function mouchardGelIntervalle(){const f=performance.now()+ms;while(performance.now()<f){}},1000);return id;}
  return {on:MG.on,minuteries:MG.nTO,intervalles:MG.nIV,ecouteurs:MG.nEC,boucles:MG.nLoop,imageMs:+MG.lDur.toFixed(1),horsMs:+MG.gap.toFixed(1),
    tranches:Array.from(MG.tr,function(v){return +v.toFixed(1);}),retourS:MG.bgT?+((performance.now()-MG.bgT)/1000).toFixed(1):null,pivotS:MG.pivT?+((performance.now()-MG.pivT)/1000).toFixed(1):null,ac:mgAc(),tas:mgTas(),sentinelle:MG.sen?+MG.senV.toFixed(3):null,temoin:MG.mgt,gcSec:MG.sec.gc,natif:mgNatif()};};
