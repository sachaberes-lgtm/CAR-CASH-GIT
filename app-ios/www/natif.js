/* CASH CAR — LA COLLE NATIVE (app iOS Capacitor, branche ios-capacitor).
   preparer-www.js copie ce fichier dans www/ et le charge en TOUT PREMIER dans www/index.html (juste après <meta charset>),
   avant le moindre script du jeu. Hors de l'app (navigateur, Vercel, portails), il ne fait RIEN : la garde ci-dessous sort.
   Le jeu sait déjà vivre sous Capacitor (window.Capacitor) : copie de la sauvegarde dans Preferences (P0-03, SAVE.flush),
   service worker et mise à jour toute seule coupés, plein écran natif, vibrations par le plugin Haptics. Ce fichier ajoute
   ce que le jeu ne fait pas lui-même :
   1. le rendu natif : barre d'état cachée, pas de rebond, pas de zoom, pas de sélection ni de loupe, fond sombre sous la page ;
   2. le service worker coupé PAR CONSTRUCTION (register refuse, les anciens sont désinscrits) ;
   3. aucun lien qui sort de l'app (la garde native GardeNavigation.swift fait la même chose côté iOS) ;
   4. le son débloqué au premier toucher, et relancé après un appel ou Siri (état « interrupted ») — sans jamais rallumer
      un contexte que le JEU a mis en veille lui-même (son coupé, pause) ;
   5. l'écran de lancement natif retiré dès que le jeu a peint son propre écran ;
   6. en version DEBUG seulement (Xcode ▶) : chaque requête qui sortirait de l'app est écrite dans la console de Xcode,
      plus un bilan à 15 s et à 60 s — c'est le banc du « mode hors ligne ». La version App Store n'écrit rien ;
   7. les mises à jour en direct du jeu (sans l'App Store), placées avant le 6 qui s'arrête hors DEBUG ;
   8. l'écran qui reste allumé pendant qu'on joue (avant le 6, lui aussi).
   Et, côté Swift (JeuViewController.swift), le modèle exact de l'iPhone dans `window.__ccAppareil` avant tout script : preparer-www.js
   le branche dans le palier graphique du jeu (PAL). */
(function(){
  'use strict';
  var C=window.Capacitor;
  if(!C||typeof C.isNativePlatform!=='function'||!C.isNativePlatform())return; // navigateur : rien
  var P=C.Plugins||{}, DEBUG=!!C.DEBUG, ICI=location.origin; // capacitor://localhost
  var dit=function(){if(DEBUG)try{console.log.apply(console,['[natif]'].concat([].slice.call(arguments)));}catch(e){}};
  document.documentElement.classList.add('natif');

  /* ---- 1. LE RENDU NATIF ---- (la page du jeu est déjà en position fixe : on ne fait que fermer les fuites) */
  try{var st=document.createElement('style');st.id='natifCss';
    st.textContent='html,body{background:#12081f;overscroll-behavior:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;'+
      '-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
      'input,textarea,[contenteditable]{-webkit-user-select:text;user-select:text}';
    (document.head||document.documentElement).appendChild(st);}catch(e){}
  var barre=function(){try{if(P.StatusBar)P.StatusBar.hide();}catch(e){}};
  barre(); // Info.plist la cache déjà au lancement (UIStatusBarHidden) ; ceci la garde cachée au retour d'arrière-plan
  document.addEventListener('visibilitychange',function(){if(!document.hidden)barre();});

  /* ---- 2. PAS DE SERVICE WORKER DANS L'APP ---- (le jeu ne l'enregistre déjà plus sous Capacitor : ceindre et bretelles) */
  try{var sw=navigator.serviceWorker;
    if(sw){sw.register=function(){return Promise.reject(new Error('service worker coupé dans l’app'));};
      if(sw.getRegistrations)sw.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){});}
  }catch(e){}

  /* ---- 3. AUCUN LIEN QUI SORT DE L'APP ---- */
  var interne=function(u){try{return new URL(u,location.href).origin===ICI;}catch(e){return false;}};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href')||'';if(h.charAt(0)==='#')return;
    if(a.target==='_blank'||!interne(a.href)){e.preventDefault();e.stopPropagation();dit('lien bloqué',a.href);}
  },true);
  document.addEventListener('submit',function(e){var f=e.target;
    if(f&&f.action&&!interne(f.action)){e.preventDefault();dit('formulaire bloqué',f.action);}},true);
  var wo=window.open;
  window.open=function(u){if(u&&!interne(String(u))){dit('window.open bloqué',u);return null;}return wo.apply(window,arguments);};

  /* ---- 4. LE SON DÉBLOQUÉ AU PREMIER TOUCHER ----
     Chaque contexte audio créé (le jeu, la musique GLISSE, la banque de sons) est retenu. Au toucher, un contexte qui dort
     SANS que le jeu l'ait endormi (politique d'autoplay, ou « interrupted » après un appel) est relancé, et reçoit une fois un
     échantillon muet (le vieux déverrouillage d'iOS). Un contexte que le jeu a mis en veille (suspend : son coupé, pause) n'est
     jamais touché : c'est le jeu qui le réveillera. */
  var AC0=window.AudioContext||window.webkitAudioContext,CTX=[];
  if(AC0)try{
    var AC=function(){var c=Reflect.construct(AC0,arguments,new.target||AC);CTX.push(c);return c;};
    AC.prototype=AC0.prototype;Object.setPrototypeOf(AC,AC0);
    var su=AC0.prototype.suspend,re=AC0.prototype.resume;
    AC0.prototype.suspend=function(){this.__ccVeille=true;return su.apply(this,arguments);};
    AC0.prototype.resume=function(){this.__ccVeille=false;return re.apply(this,arguments);};
    window.AudioContext=AC;if(window.webkitAudioContext)window.webkitAudioContext=AC;
  }catch(e){dit('déverrouillage audio indisponible',e&&e.message);}
  var reveil=function(){
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(!c||c.state==='closed')continue;
      if(c.state!=='running'&&!c.__ccVeille){try{re.call(c);}catch(e){}}
      if(!c.__ccAmorce&&c.state!=='closed'){try{var b=c.createBuffer(1,1,22050),s=c.createBufferSource();
        s.buffer=b;s.connect(c.destination);s.start(0);c.__ccAmorce=true;}catch(e){}}}
  };
  ['touchend','pointerup','click','keydown'].forEach(function(t){addEventListener(t,reveil,{capture:true,passive:true});});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(reveil,120);});

  /* ---- 5. L'ÉCRAN DE LANCEMENT ---- (retiré seul au bout de 4 s au plus : capacitor.config.json, launchShowDuration) */
  var cache=function(){try{if(P.SplashScreen)P.SplashScreen.hide({fadeOutDuration:250});}catch(e){}};
  if(document.readyState!=='loading')setTimeout(cache,60);else document.addEventListener('DOMContentLoaded',function(){setTimeout(cache,60);});

  /* ---- 7. LES MISES À JOUR EN DIRECT (2026-10-14, oui de Sacha) ----
     Le jeu (les fichiers de www/) se met à jour SANS passer par l'App Store : publier-maj.js fabrique l'édition App Store d'une
     nouvelle version (mêmes coupes que l'app, jamais le jeu web tel quel) et la pose sur la branche `app-maj` du dépôt public.
     Ici, une fois le jeu démarré (__gameReady, le signal de son propre chien de garde) :
     a. on dit au module (Capgo, @capgo/capacitor-updater, mode manuel, statistiques COUPÉES : statsUrl vide) que cette version
        marche. Sans ce feu vert avant appReadyTimeout, il revient tout seul à la version d'avant : une mise à jour qui casse le
        démarrage ne bloque jamais un joueur ;
     b. on lit latest.json. Si sa version diffère de la nôtre (maj.json, écrit par preparer-www.js) et que l'app native est assez
        récente (natifMin), le module télécharge SEULEMENT les fichiers changés (le manifeste donne chaque fichier par son
        empreinte sha256 ; les autres sont repris de la version installée), puis la nouvelle version s'applique au prochain
        passage en arrière-plan ou au prochain lancement — jamais en pleine course.
     Rien n'est envoyé : la lecture de fichiers publics, sans identifiant. Hors ligne, ou si le dépôt ne répond pas, rien ne change. */
  var MAJ='https://raw.githubusercontent.com/sachaberes-lgtm/CAR-CASH-GIT/app-maj/'; // (preparer-www.js --maj <adresse> : un essai)
  var U=P.CapacitorUpdater,BANC=!!(window.__ccAppareil&&window.__ccAppareil.banc);
  if(U&&!BANC){ // (le banc de mesure, partie 9 : pas de réseau, pas de mise à jour pendant qu'on mesure)
    var vSup=function(a,b){a=String(a||'0').split('.');b=String(b||'0').split('.'); // a ≥ b, numéro de version par numéro
      for(var i=0;i<Math.max(a.length,b.length);i++){var x=+a[i]||0,y=+b[i]||0;if(x!==y)return x>y;}return true;};
    var lire=function(u){var H=P.CapacitorHttp; // la requête native : ni CORS ni « contenu mixte » ; repli fetch
      if(H&&H.get)return H.get({url:u,headers:{'Cache-Control':'no-cache'}}).then(function(r){
        if(r.status!==200)throw new Error('HTTP '+r.status);return typeof r.data==='string'?JSON.parse(r.data):r.data;});
      return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});};
    /* LA MÉMOIRE DES ÉCHECS (essai au simulateur, 14/10) : le module revient bien seul à la version d'avant quand une mise à jour
       ne démarre pas, mais il la gardait en cache et la RÉAPPLIQUAIT au passage en arrière-plan suivant — une minute d'écran de
       panne à chaque fois. On note donc la version qu'on vient de préparer (ccMajEssai) ; si au lancement suivant on tourne sur
       une AUTRE version et qu'elle n'attend plus son tour (getNextBundle), c'est qu'elle a été appliquée puis rejetée : elle part
       dans ccMajRefus et n'est plus jamais retentée. Une version qui démarre (__gameReady) efface sa marque. */
    var ls=function(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;};
    var refus=function(){try{return JSON.parse(ls('ccMajRefus')||'[]');}catch(e){return [];}};
    var ici0=fetch('maj.json',{cache:'no-store'}).then(function(r){return r.json();}).catch(function(){return {};});
    var bilanEssai=function(){var essai=ls('ccMajEssai');if(!essai)return Promise.resolve();
      return ici0.then(function(ici){
        if(ici.version===essai){ls('ccMajEssai',null);dit('maj : la version '+essai+' a démarré');return;}
        return U.getNextBundle().then(function(n){if(n&&n.version===essai)return; // pas encore appliquée : elle attend son tour
          var r=refus();if(r.indexOf(essai)<0)r.push(essai);ls('ccMajRefus',JSON.stringify(r.slice(-20)));ls('ccMajEssai',null);
          dit('maj : la version '+essai+' a échoué, elle ne sera plus retentée');}).catch(function(){});});};
    var majVerif=function(){
      if(navigator.onLine===false)return;
      var der;
      Promise.all([ici0,U.getBuiltinVersion().catch(function(){return {};}),lire(MAJ+'latest.json?t='+Date.now())])
      .then(function(t){var ici=t[0]||{},natif=(t[1]||{}).version;der=t[2]||{};
        if(!der.version||!der.manifest||der.version===ici.version){dit('maj : à jour',ici.version);return null;}
        if(refus().indexOf(der.version)>=0){dit('maj : '+der.version+' a déjà échoué ici, ignorée');return null;}
        if(der.natifMin&&!vSup(natif,der.natifMin)){dit('maj : demande une app plus récente',der.natifMin,natif);return null;}
        return U.list().then(function(l){
          var deja=((l&&l.bundles)||[]).filter(function(b){return b.version===der.version&&b.status!=='error'&&b.status!=='deleted'&&b.status!=='deleting';})[0];
          if(deja)return deja;
          dit('maj : téléchargement',der.version);
          return U.download({url:MAJ+'latest.json',version:der.version,
            manifest:der.manifest.map(function(e){return {file_name:e.f,file_hash:e.h,download_url:MAJ+'f/'+e.h};})});});})
      .then(function(b){if(b&&b.id)return U.next({id:b.id}).then(function(){ls('ccMajEssai',der.version);dit('maj : prête pour le prochain lancement',der.version);});})
      .catch(function(e){dit('maj : rien',e&&e.message);});};
    var tours=0,guet=setInterval(function(){
      if(!window.__gameReady&&++tours<240)return;clearInterval(guet);
      if(!window.__gameReady)return; // jamais démarré : pas de feu vert, le module reviendra à la version d'avant
      U.notifyAppReady().catch(function(){});
      setTimeout(function(){bilanEssai().then(majVerif);},4000);},500);
    // une version qui ne démarre jamais ne donne pas le feu vert ; au lancement d'après (la version d'avant), bilanEssai la classe
  }

  /* ---- 8. L'ÉCRAN RESTE ALLUMÉ PENDANT QU'ON JOUE (2026-10-14, passe « iPhone au max ») ----
     Un pouce posé sans bouger (volant, NITRO) n'envoie aucun toucher à iOS : avec le verrouillage automatique à 30 s, l'écran
     s'assombrissait en pleine course. Le plugin natif Eveil (JeuViewController.swift) coupe la mise en veille au premier toucher et la
     rend à iOS après 3 minutes sans toucher, ou quand l'app passe en arrière-plan : un menu oublié sur la table ne vide pas la batterie. */
  var E=P.Eveil;
  if(E){var eveil=false,dernier=0;
    var garde=function(on){if(on===eveil)return;eveil=on;try{E.garde({on:on}).catch(function(){});}catch(e){}};
    var touche=function(){dernier=Date.now();if(!eveil)garde(true);};
    ['touchstart','pointerdown','keydown'].forEach(function(t){addEventListener(t,touche,{capture:true,passive:true});});
    setInterval(function(){if(eveil&&Date.now()-dernier>180000)garde(false);},15000);
    document.addEventListener('visibilitychange',function(){if(document.hidden)garde(false);});
  }

  /* ---- 10. LE GOUVERNEUR THERMIQUE (2026-10-15, mesuré sur l'iPhone 13 Pro de Sacha : « ultra saccadé quand on va vite ») ----
     Mesuré au banc : à pleine vitesse la puce graphique tourne à fond ; en une à deux minutes l'iPhone chauffe, iOS bride processeur ET
     puce (le même calcul JavaScript passe de 2 à 15 ms par image) et la course s'effondre de 60 à 15-30 images/s irrégulières — alors
     plus rien n'y fait, ni moitié moins de pixels ni le cran de qualité le plus bas. Dès qu'iOS dit « chaud » (2) ou « critique » (3), on
     cale le jeu à 30 images/s STABLES (sa propre cadence CAD : la physique y est prouvée exacte, une image d'écran sur deux n'est pas
     dessinée) : moitié moins de travail, le téléphone refroidit, l'image reste régulière. Revenu à « normal » ou « tiède » (0, 1), le jeu
     reprend la main : 60, et sa cadence automatique s'il manque encore de marge. */
  /* Et au « critique » (3, mesuré : le processeur ralenti ~10 fois, 20-30 ms de calcul par image même calé à 30), le cran de qualité le
     plus bas en plus : plus de passe d'ombre ni de halo, beaucoup moins d'appels de dessin. On redescend par paliers en refroidissant. */
  if(E&&E.addListener&&!(BANC&&window.__ccAppareil.ab)){var niv=0; // (le banc A/B mesure le jeu brut : pas de gouverneur) // 0 : le jeu décide · 1 : calé à 30 · 2 : calé à 30 + qualité au plus bas
    var thermique=function(r){if(!r||typeof window.dbgCadence!=='function')return;var v=r.thermique>=3?2:r.thermique>=2?1:0;if(v===niv)return;
      try{if(v>=1&&niv===0)window.dbgCadence(30);if(v===0)window.dbgCadence(0);
        if(v===2&&typeof window.dbgQual==='function'){var b=window.dbgQual();window.dbgQual(b.kMax);}
        if(niv===2&&v<2&&typeof window.dbgPin==='function')window.dbgPin(false);
        niv=v;dit('chaleur '+r.thermique+[' : le jeu reprend la main',' : jeu calé à 30 images/s',' : calé à 30 + qualité au plus bas'][v]);}catch(e){}};
    try{E.addListener('thermique',thermique);}catch(e){}
    var amorce=function(){if(!window.__gameReady)return setTimeout(amorce,1000);try{E.etat().then(thermique).catch(function(){});}catch(e){}};amorce();
  }

  /* ---- 9. LE BANC DE MESURE SUR LE VRAI IPHONE (2026-10-14, Sacha : « ultra saccadé quand on va vite ») ----
     Seulement quand l'app est lancée avec `-ccBanc` (JeuViewController.swift pose __ccAppareil.banc et un stockage web JETABLE). Ici :
     la sauvegarde native en LECTURE SEULE (le jeu la relit, n'y écrit rien), le relevé des à-coups du jeu allumé (?perf=1), puis une
     course jouée toute seule — bac à sable (la caisse se replace au lieu de mourir), pilote automatique, NITRO tenue — et toutes les
     2 s une ligne « [banc] » dans la console : images/s, images ratées (> 20, > 34, > 50 ms), pire image, vitesse, niveau, cran de
     qualité, appels de dessin, triangles, et les à-coups nommés par le jeu (construction, programmes, textures). Durée : 150 s. */
  if(BANC){
    var bl=function(){try{console.log('[banc] '+[].slice.call(arguments).join(' '));}catch(e){}};
    try{if(!/[?&]perf=1/.test(location.search))history.replaceState(null,'',location.pathname+(location.search?location.search+'&':'?')+'perf=1'+location.hash);}catch(e){}
    var PR=P.Preferences;
    if(PR){var lu={get:function(o){return PR.get(o);},keys:function(){return PR.keys();},
        set:function(){return Promise.resolve();},remove:function(){return Promise.resolve();},clear:function(){return Promise.resolve();}};
      try{C.Plugins.Preferences=lu;}catch(e){}
      if(C.Plugins.Preferences!==lu){bl('ARRÊT : la sauvegarde native n\'a pas pu passer en lecture seule');return;}}
    bl('prêt',location.href,JSON.stringify(window.__ccAppareil));
    try{if(P.Eveil)P.Eveil.garde({on:true});}catch(e){} // le banc ne touche jamais l'écran : sans ça, le verrouillage automatique l'arrêterait en route
    var g=function(f,d){try{return f();}catch(e){return d;}};
    /* Les variables du jeu vivent dans sa fermeture : on ne lit QUE ses crochets publics (dbgPerf, dbgCout, dbgPalier, dbgState, dbgScene),
       son moniteur (#perfMon, allumé par ?perf=1) et le compteur de vitesse du HUD (#nxVit). LA DISSECTION : après 15 s de mise en vitesse,
       des étapes de 8 s (mesurées sur leurs 6 dernières) éteignent une famille à la fois — ce qui fait remonter les images/s est ce qui
       étouffe la puce. `-ccCarte volcan` (argument de lancement) force la carte. */
    var SC=function(){return g(function(){return dbgScene();},null);},CACHE=[];
    var montre=function(){for(var i=0;i<CACHE.length;i++)CACHE[i].visible=true;CACHE=[];};
    var mat=function(o){var m=o.material;return Array.isArray(m)?m[0]:m;};
    var cacheSi=function(t){var s9=SC();if(!s9)return;s9.scene.traverse(function(o){if(o.visible&&(o.isMesh||o.isPoints||o.isSprite||o.isLine)&&o!==s9.car&&t(o)){o.visible=false;CACHE.push(o);}});};
    var transp=function(o){var m=mat(o);return !!(m&&m.transparent);},additif=function(o){var m=mat(o);return !!(m&&m.blending===2);},
        partic=function(o){return !!(o.isPoints||o.isSprite);};
    var DPR0=0;
    var ET=[['base',null,null,null],
      ['sans flou de vitesse',null,function(){dbgNet(1);},function(){dbgNet(0);}],
      ['sans objets transparents',transp,null,montre],
      ['sans effets additifs',additif,null,montre],
      ['sans particules',partic,null,montre],
      ['pixels /2',null,function(){DPR0=dbgPerf().dpr;dbgDPR(+(DPR0*0.7071).toFixed(2));},function(){dbgDPR(DPR0);dbgPin(false);}],
      ['cran de qualité le plus bas',null,function(){var b=dbgQual();dbgQual(b&&b.kMax!=null?b.kMax:9);},function(){dbgPin(false);}],
      ['base (retour)',null,null,null]];
    var inventaire=function(){var s9=SC();if(!s9)return;var T={};s9.scene.traverse(function(o){if(!o.visible||!(o.isMesh||o.isPoints||o.isSprite))return;var m=mat(o);if(!m||!(m.transparent||o.isPoints||o.isSprite))return;
        var p=o,nm='';for(var k=0;k<4&&p&&!nm;k++){nm=p.name||'';p=p.parent;}nm=(nm||'?')+(o.isPoints?' [points]':o.isSprite?' [sprite]':'')+(m.blending===2?' [add]':'')+(m.depthWrite?'':' [sans z]');
        if(!o.geometry.boundingSphere&&o.geometry.computeBoundingSphere)g(function(){o.geometry.computeBoundingSphere();});var r=o.geometry.boundingSphere?o.geometry.boundingSphere.radius*Math.max(o.scale.x,o.scale.y,o.scale.z):0;
        var e=T[nm]||(T[nm]={n:0,r:0,inst:0});e.n++;e.r=Math.max(e.r,Math.round(r));if(o.isInstancedMesh)e.inst+=o.count;});
      var L=Object.keys(T).map(function(k){return [k,T[k]];}).sort(function(x,y){return y[1].n*Math.max(1,y[1].r)-x[1].n*Math.max(1,x[1].r);}).slice(0,14);
      bl('inventaire des transparents :',L.map(function(e){return e[0]+' ×'+e[1].n+(e[1].inst?' (inst '+e[1].inst+')':'')+' r'+e[1].r;}).join(' · '));};
    var mesure=function(){
      g(function(){dbgCout(1);if(window.__ccAppareil.ab)dbgCadence(60);}); // A/B : cadence figée à 60, rien d'autre ne bouge
      bl('palier',JSON.stringify(g(function(){var p=dbgPalier();return {n:p.n,src:p.src};},null)),'carte',JSON.stringify(g(function(){return dbgClassique().niveau;},null)));
      var t0=performance.now(),der=t0,tLog=t0,n=0,s20=0,s34=0,s50=0,pire=0,ei=-1,tE=0,EM={n:0,s20:0,dur:0,calls:0,tris:0,k:0},RES=[],DIS=!!window.__ccAppareil.dissection,FEN={w:-1},FENS=[],CADON=false,AB=window.__ccAppareil.ab||'',abK=-1,ABS={A:{n:0,dur:0,s34:0,s50:0,k:0},B:{n:0,dur:0,s34:0,s50:0,k:0}},abSt=null;
      var cloture=function(){var E=ET[ei];if(E[3])g(E[3]);var r=[E[0],EM.dur?Math.round(EM.n*1000/EM.dur):0,EM.n?Math.round(100*EM.s20/EM.n):0,EM.k?Math.round(EM.calls/EM.k):0,EM.k?Math.round(EM.tris/EM.k/1000):0];
        RES.push(r);bl('ÉTAPE',r[0],'→',r[1]+' i/s',r[2]+'% en retard',r[3]+' appels',r[4]+'k tri');};
      (function f(now){var dt=now-der;der=now;n++;
        if(dt>20)s20++;if(dt>34)s34++;if(dt>50)s50++;if(dt>pire)pire=dt;
        var t=(now-t0)/1000;
        if(DIS&&t>=15){var ne=Math.min(ET.length-1,Math.floor((t-15)/8));
          if(ne!==ei){if(ei>=0)cloture();ei=ne;tE=t;EM={n:0,s20:0,dur:0,calls:0,tris:0,k:0};var E2=ET[ei];if(E2[2])g(E2[2]);if(E2[1])cacheSi(E2[1]);if(ei===2)inventaire();bl('→',E2[0]);}
          if(ET[ei][1]&&(n%30===0))cacheSi(ET[ei][1]); // les objets nés pendant l'étape
          if(t-tE>=2){EM.n++;EM.dur+=dt;if(dt>20)EM.s20++;var cd=g(function(){return dbgCout().image;},null);if(cd){EM.calls+=cd.calls;EM.tris+=cd.tris;EM.k++;}}}
        if(now-tLog>=2000){thermo();
          var pf=g(function(){return dbgPerf();},{}),co=g(function(){return dbgCout();},{}),d=g(function(){return dbgState();},{});
          var vit=g(function(){return document.querySelector('#nxVit b').textContent;},'?');CADON=g(function(){return dbgCadence().on;},false);
          bl(Math.round(t)+'s',Math.round(n*1000/(now-tLog))+' i/s',CADON?'(calé 30)':'','>34ms:'+s34,'>50ms:'+s50,'pire:'+Math.round(pire),vit+' km/h','cpu:'+(co.cpu?co.cpu.p50+'/'+co.cpu.p90:'?'),
            'dpr:'+pf.dpr,'cran:'+co.ql,'appels:'+(co.image?co.image.calls:'?'),'tri:'+(co.image?Math.round(co.image.tris/1000)+'k':'?'),'chaleur:'+(TH.thermique!=null?TH.thermique:'?')+(TH.eco?' ÉCO':''),
            g(function(){return dbgClassique().niveau.carte;},'?'),d.gameOver?'MORT':'');
          n=s20=s34=s50=pire=0;tLog=now;}
        /* L'A/B DES FILTRES DU HUD (2026-10-15, demande de la session Chrome DevTools : à grande vitesse, les contours d'encre en
           drop-shadow d'une quarantaine de textes du HUD, re-filtrés à chaque image) : après 15 s, 10 phases de 5 s, A = le jeu tel quel,
           B = tous les `filter` CSS coupés (hors toile 3D) ; bilan A contre B. */
        /* `-ccAB contour` (2026-10-16, avec la session Chrome DevTools) : le VRAI contour d'encre sans filtre de la page, s'il y est —
           B = window.dbgContour(true) (ou la classe html.contourV2), A = le contour d'aujourd'hui. */
        if((AB==='filtres'||AB==='contour')&&t>=15){var k=Math.floor((t-15)/5);
          if(k!==abK){abK=k;var B9=k%2===1;
            if(AB==='filtres'){if(!abSt){abSt=document.createElement('style');abSt.textContent='body *:not(canvas),body *::before,body *::after{filter:none!important}';}
              if(B9&&!abSt.parentNode)document.head.appendChild(abSt);if(!B9&&abSt.parentNode)abSt.remove();}
            else{if(typeof window.dbgContour==='function')g(function(){window.dbgContour(B9);});else document.documentElement.classList.toggle('contourV2',B9);}
            bl('A/B phase',k,B9?(AB==='filtres'?'B sans filtres':'B contour v2'+(typeof window.dbgContour==='function'?'':' (classe seule : dbgContour absent)')):'A normal');}
          var q=ABS[k%2===1?'B':'A'];if(t-15-k*5>=1){q.n++;q.dur+=dt;if(dt>34)q.s34++;if(dt>50)q.s50++;}}
        if(!DIS){var w=Math.floor(t/30);if(w!==FEN.w){if(FEN.w>=0&&FEN.n)FENS.push(FEN.w*30+'-'+(FEN.w*30+30)+' s : '+Math.round(FEN.n*1000/FEN.dur)+' i/s, '+FEN.s50+' à-coups > 50 ms, '+FEN.s34+' > 34 ms, calé 30 : '+Math.round(100*FEN.cal/FEN.n)+' %, chaleur '+FEN.ch);FEN={w:w,n:0,dur:0,s34:0,s50:0,cal:0,ch:FEN.ch};}
          FEN.n++;FEN.dur+=dt;if(dt>34)FEN.s34++;if(dt>50)FEN.s50++;if(CADON)FEN.cal++;FEN.ch=TH.thermique!=null?TH.thermique:'?';}
        if(t<(DIS?15+8*ET.length+1:AB?65:180))requestAnimationFrame(f);
        else if(AB){if(abSt&&abSt.parentNode)abSt.remove();if(AB==='contour')g(function(){if(window.dbgContour)window.dbgContour(false);else document.documentElement.classList.remove('contourV2');});g(function(){dbgAuto(0);dbgCout(0);});
          var r=function(q){return q.dur?Math.round(q.n*1000/q.dur)+' i/s, '+(q.s34*1000/q.dur).toFixed(1)+' images > 34 ms par s, '+q.s50+' > 50 ms':'-';};
          bl('BILAN A/B '+AB.toUpperCase(),'A normal : '+r(ABS.A),'|| B '+(AB==='filtres'?'sans filtres':'contour v2')+' : '+r(ABS.B),'|| chaleur '+(TH.thermique!=null?TH.thermique:'?'));bl('FIN');}
        else if(!DIS){if(FEN.n)FENS.push(FEN.w*30+'-'+Math.round(t)+' s : '+Math.round(FEN.n*1000/FEN.dur)+' i/s, '+FEN.s50+' à-coups > 50 ms, '+FEN.s34+' > 34 ms, calé 30 : '+Math.round(100*FEN.cal/FEN.n)+' %, chaleur '+FEN.ch);
          g(function(){dbgAuto(0);dbgCout(0);});bl('BILAN ENDURANCE',FENS.join(' || '));bl('FIN');}
        else{cloture();montre();g(function(){dbgAuto(0);dbgCout(0);dbgNet(0);dbgPin(false);});
          bl('BILAN',RES.map(function(r){return r[0]+' : '+r[1]+' i/s, '+r[2]+'% en retard, '+r[3]+' appels, '+r[4]+'k tri';}).join(' || '));bl('FIN');}
      })(t0);};
    var TH={},thermo=function(){try{if(P.Eveil&&P.Eveil.etat)P.Eveil.etat().then(function(r){TH=r||{};}).catch(function(){});}catch(e){}};
    var etape=function(){
      if(!window.__gameReady)return setTimeout(etape,500);
      if(window.__intro==='attente'){bl('écran titre → départ');dispatchEvent(new KeyboardEvent('keydown',{key:' '}));return setTimeout(etape,1500);}
      if(window.__intro)return setTimeout(etape,500);
      var d=g(function(){return dbgState();},null);
      if(!d||!d.started){if(window.__ccAppareil.carte)g(function(){dbgClassique(window.__ccAppareil.carte);});var b=document.querySelector('#mHome .mPlay');bl('JOUER',!!b,window.__ccAppareil.carte||'');if(b)b.click();return setTimeout(etape,4000);}
      g(function(){dbgSable(1);dbgAuto(1,0,{nit:1});});bl('course : bac à sable + pilote + NITRO');mesure();};
    setTimeout(etape,1500);
  }

  /* ---- 6. LE BANC DU HORS-LIGNE (DEBUG seulement) ---- */
  if(!DEBUG)return;
  var dehors={},nDehors=0,nIci=0;
  var note=function(u,via){if(!u)return;var s=String(u);
    if(/^(data|blob|about|javascript):/i.test(s))return;
    if(interne(s)){nIci++;return;}
    if(!dehors[s]){dehors[s]=1;nDehors++;console.warn('[natif] RÉSEAU HORS DE L’APP ('+via+') : '+s);}};
  try{var f0=window.fetch;if(f0)window.fetch=function(r){note(r&&r.url?r.url:r,'fetch');return f0.apply(this,arguments);};}catch(e){}
  try{var xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){note(u,'xhr');return xo.apply(this,arguments);};}catch(e){}
  try{if(navigator.sendBeacon){var sb=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u){note(u,'beacon');return sb.apply(null,arguments);};}}catch(e){}
  ['WebSocket','EventSource'].forEach(function(k){try{var K=window[k];if(!K)return;
    var W=function(u){note(u,k);return Reflect.construct(K,arguments,new.target||W);};W.prototype=K.prototype;Object.setPrototypeOf(W,K);window[k]=W;}catch(e){}});
  try{['HTMLImageElement','HTMLScriptElement','HTMLMediaElement','HTMLSourceElement','HTMLIFrameElement'].forEach(function(n){
    var K=window[n];if(!K)return;var d=Object.getOwnPropertyDescriptor(K.prototype,'src');if(!d||!d.set)return;
    Object.defineProperty(K.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,
      set:function(v){note(v,n.replace(/^HTML|Element$/g,''));return d.set.call(this,v);}});});}catch(e){}
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(en){note(en.name,'ressource');});}).observe({type:'resource',buffered:true});}catch(e){}
  addEventListener('error',function(e){console.error('[natif] ERREUR JS : '+(e.message||e)+' @ '+(e.filename||'')+':'+(e.lineno||0));});
  addEventListener('unhandledrejection',function(e){var r=e.reason;console.warn('[natif] promesse rejetée : '+(r&&r.message||r));});
  var bilan=function(t){console.log('[natif] BILAN RÉSEAU '+t+' : '+nDehors+' adresse(s) hors de l’app, '+nIci+' chargement(s) locaux'+
    ' · localStorage cashcarSave '+(function(){try{return localStorage.cashcarSave?'présent':'absent';}catch(e){return 'illisible';}})()+
    ' · langue de l’appareil vue par la page : '+navigator.language+' ['+(navigator.languages||[]).join(',')+'] → jeu en '+document.documentElement.lang+
    ' · palier '+(function(){try{var p=window.dbgPalier();return p.nom+' ('+p.src+')';}catch(e){return '?';}})());};
  setTimeout(function(){bilan('15 s');},15000);setTimeout(function(){bilan('60 s');},60000);
  // le pouls : images par seconde, ce qui couvre le milieu de l'écran, l'état du jeu (toutes les 4 s)
  var nIm=0;(function f(){nIm++;requestAnimationFrame(f);})();
  setInterval(function(){try{var e=document.elementFromPoint(innerWidth/2,innerHeight/2),d=window.dbgState?window.dbgState():null;
    console.log('[natif] POULS '+Math.round(nIm/4)+' i/s · centre '+(e?(e.id?'#'+e.id:e.tagName)+(e.className&&e.className.baseVal===undefined?'.'+String(e.className).split(' ').join('.'):''):'∅')+
      ' · son ['+CTX.map(function(c){return c.state+(c.__ccVeille?'(veille)':'');}).join(',')+']'+
      ' · erreur '+(window.__loopErr||'—')+' · état '+(d?JSON.stringify(d).slice(0,220):'—'));}catch(err){console.log('[natif] POULS ?',err.message);}nIm=0;},4000);
  window.ccNatif={bilan:bilan,dehors:dehors,ctx:CTX}; // console Safari (Développement › Simulateur)
  dit('colle native prête',navigator.userAgent);
})();
