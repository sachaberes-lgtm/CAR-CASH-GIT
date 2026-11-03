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
   7. les mises à jour en direct du jeu (sans l'App Store), placées avant le 6 qui s'arrête hors DEBUG. */
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
      if(c.state!=='running'&&!c.__ccVeille){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(e){dit('son pas relancé',e&&e.message);});}catch(e){}} /* (28/10, boîte noire : « Failed to start the audio device ») au retour d'arrière-plan, sans geste, iOS refuse souvent : le refus est écouté (plus de promesse rejetée), le prochain toucher réessaie */
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
  var U=P.CapacitorUpdater;
  if(U){
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
    ' · langue de l’appareil vue par la page : '+navigator.language+' ['+(navigator.languages||[]).join(',')+'] → jeu en '+document.documentElement.lang);};
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
