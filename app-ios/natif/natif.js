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
  /* ---- 0. LE BANC iPHONE (2026-11-07, passe 3 P7) : preparer-www.js --banc "<scénario>" remplace BANC par le scénario (aussi écrit dans www/banc.json) ;
     banc-iphone.js (dans le jeu) joue alors toute seule le protocole et note tout dans la boîte noire. Une app normale EFFACE le drapeau (le localStorage survit aux mises à jour). */
  var BANC=null; /*@BANC@*/
  try{if(BANC)localStorage.setItem('ccBancAuto',JSON.stringify(BANC));else localStorage.removeItem('ccBancAuto');}catch(e){}
  /* ---- 0 bis. DES INTERRUPTEURS DANS L'APP (2026-11-07, passe 3) : preparer-www.js --qs "&gouv=max&img=max" remplace QS ; la page de l'app est capacitor://localhost SANS query : on pose la query avant les scripts du jeu (natif.js est chargé en premier), tous les /[?&]x=/.test(location.search) la voient. Sans --qs : rien. */
  var QS=null; /*@QS@*/
  try{if(QS&&!location.search)history.replaceState(null,'',location.pathname+'?'+String(QS).replace(/^[?&]/,''));}catch(e){}
  /* (2026-11-12, ios-ultime) L'ENREGISTREUR DE MESURE NE SURVIT PAS À L'APP DE MESURE : `ccPerfRecOn` (boîte de vol ?perfrec=2, enregistreur ?perfrec=1) reste dans le localStorage après une mise à jour ; une app construite sans `perfrec` dans --qs l'efface, comme le drapeau du banc. */
  try{if(!QS||!/perfrec=/.test(String(QS))){localStorage.removeItem('ccPerfRecOn');var nBV=+(localStorage.getItem('ccBVn')||0);if(nBV){for(var kBV=Math.max(0,nBV-300);kBV<nBV;kBV++)localStorage.removeItem('ccBV'+kBV);localStorage.removeItem('ccBVn');}} /* (2026-11-13) …et les courses de la boîte de vol s'en vont avec lui : elles partagent les ≈ 5 Mo de stockage de la sauvegarde */}catch(e){}

  /* ---- 1. LE RENDU NATIF ---- (la page du jeu est déjà en position fixe : on ne fait que fermer les fuites) */
  try{var st=document.createElement('style');st.id='natifCss';
    st.textContent='html,body{background:#000;overscroll-behavior:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;'+
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

  /* ---- 2 bis. LES FICHIERS SON LUS PAR fetch (2026-11-09, debug iOS au simulateur) ----
     Capacitor sert les fichiers MÉDIA de l'app (m4a, mp3, mp4… : WebViewAssetHandler.swift) sans statut HTTP quand la requête n'a pas
     de plage : fetch() reçoit alors status 0, donc r.ok === false, alors que le fichier est là et complet. Tout chargeur du jeu qui
     écrit « if(!r.ok) throw » croit le fichier absent, dans l'app SEULEMENT : les sons de la mort repassaient par l'ancien chemin
     <audio> (waCharge), et le lecteur à paliers de la musique (pouce-bleu-jeu.js, `lit`) refusait chaque fichier. Ici, une réponse
     locale à statut 0 est rendue avec le statut 200 (même corps, mêmes en-têtes). Un fichier vraiment absent répond 404 : inchangé. */
  try{var fetch0=window.fetch;
    if(fetch0)window.fetch=function(u){
      var p=fetch0.apply(this,arguments),a=typeof u==='string'?u:String((u&&u.url)||'');
      if(/^[a-z][a-z0-9+.-]*:/i.test(a)&&a.indexOf(ICI)!==0)return p; // une autre origine : on n'y touche pas
      return p.then(function(r){
        if(r&&r.status===0&&r.type!=='opaque'&&r.type!=='error'&&r.type!=='opaqueredirect'){
          try{return new Response(r.body,{status:200,statusText:'OK',headers:r.headers});}catch(e){}}
        return r;});};
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
  var AC0=window.AudioContext||window.webkitAudioContext,CTX=[],baisseT=0; // baisseT : l'heure où le fondu de sortie (4 ter) a commencé, 0 = sortie à plein
  if(AC0)try{
    var AC=function(){var c=Reflect.construct(AC0,arguments,new.target||AC);CTX.push(c);return c;};
    AC.prototype=AC0.prototype;Object.setPrototypeOf(AC,AC0);
    var su=AC0.prototype.suspend,re=AC0.prototype.resume;
    /* (SON-CYCLE) un suspend() demandé pendant le FONDU DE SORTIE (4 ter) attend la fin du fondu (≤ 100 ms) : le jeu endort son contexte sec dès `hidden` (init.js, visibilitychange) */
    AC0.prototype.suspend=function(){this.__ccVeille=true;var me=this,args=arguments,reste=baisseT?baisseT+100-Date.now():0;
      if(reste>0&&reste<=100)return new Promise(function(ok){setTimeout(function(){ok(me.__ccVeille&&me.state==='running'?su.apply(me,args):undefined);},reste);});
      return su.apply(this,arguments);};
    AC0.prototype.resume=function(){this.__ccVeille=false;return re.apply(this,arguments);};
    window.AudioContext=AC;if(window.webkitAudioContext)window.webkitAudioContext=AC;
  }catch(e){dit('déverrouillage audio indisponible',e&&e.message);}
  var reveil=function(){if(window.__ccAutreSon===1)return; /* (2026-11-13) une autre musique joue : aucun contexte réveillé ni amorcé (voir le veilleur) */
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(!c||c.state==='closed')continue;
      if(c.state!=='running'&&!c.__ccVeille){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(e){dit('son pas relancé',e&&e.message);});}catch(e){}} /* (28/10, boîte noire : « Failed to start the audio device ») au retour d'arrière-plan, sans geste, iOS refuse souvent : le refus est écouté (plus de promesse rejetée), le prochain toucher réessaie */
      if(!c.__ccAmorce&&c.state!=='closed'){try{var b=c.createBuffer(1,1,22050),s=c.createBufferSource();
        s.buffer=b;s.connect(c.destination);s.start(0);c.__ccAmorce=true;}catch(e){}}}
  };
  ['touchend','pointerup','click','keydown'].forEach(function(t){addEventListener(t,reveil,{capture:true,passive:true});});
  /* (SON-CYCLE) au retour, iOS refuse souvent le resume() tant que l'app n'est pas tout à fait active (« Failed to start the audio device », boîte noire du 28/10) : quatre essais espacés,
     sans attendre le toucher. `ccActif` vient de Swift (SceneDelegate : sceneDidBecomeActive, fin d'une interruption audio). Un contexte que le jeu a endormi (__ccVeille) n'est jamais touché. */
  var reessais=function(){[0,250,800,2000].forEach(function(d){setTimeout(function(){if(!document.hidden)reveil();},d);});};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)reessais();});
  addEventListener('ccActif',reessais);

  /* ---- 4 ter. LE FONDU DE SORTIE (2026-11-12, SON-CYCLE) ----
     Quitter l'app coupait le son SEC : au geste d'accueil la musique continuait par-dessus l'écran d'accueil, puis `visibilitychange` (hidden) suspendait tout d'un coup, à n'importe quel point de l'onde
     (clic, queue de son figée qui ressort au retour). Ici chaque contexte du jeu a un GAIN DE SORTIE posé entre tout ce qu'il joue et sa destination (connect() vers la destination est redirigé : un seul
     patch, au branchement). Swift envoie `ccInactif` dès que l'app perd le premier plan (geste d'accueil, verrouillage, centre de contrôle, appel, sélecteur d'apps) : fondu de 90 ms ; `pause` (Capacitor,
     passage en arrière-plan) et `hidden` le font aussi s'il n'a pas eu lieu, et DIFFÈRENT de ≤ 100 ms l'endormissement des contextes (suspend ci-dessus, musVide plus bas). Retour : `ccActif`,
     `visibilitychange` visible (le jeu remet ses boucles à zéro d'abord : +150 ms) ou le PREMIER TOUCHER — un fondu qui ne se relèverait pas rendrait l'app muette, le toucher est le filet.
     INTERRUPTEUR : `?fondu=0` dans l'adresse (preparer-www.js --qs) ou la clé localStorage `ccFondu0` = le comportement d'avant (coupure sèche, rien de redirigé). */
  var FONDU=!/[?&]fondu=0\b/.test(location.search);try{if(localStorage.getItem('ccFondu0'))FONDU=false;}catch(e){}
  var AN=window.AudioNode,cn0=AN&&AN.prototype.connect,DN=window.AudioDestinationNode;
  var sortieDe=function(c){var g=c.__ccSortie;if(!g&&cn0){try{g=c.createGain();cn0.call(g,c.destination);c.__ccSortie=g;}catch(e){g=null;}}return g;};
  if(FONDU&&cn0&&DN)try{AN.prototype.connect=function(d){
    if(d instanceof DN&&d.context&&CTX.indexOf(d.context)>=0){var g=sortieDe(d.context);if(g&&g!==this)arguments[0]=g;}
    return cn0.apply(this,arguments);};}catch(e){dit('fondu de sortie indisponible',e&&e.message);}
  var rampe=function(c,v,tau,delai){var g=c.__ccSortie;if(!g||c.state==='closed')return;
    try{var P=g.gain,t=c.currentTime,t1=t+(delai||0);P.cancelScheduledValues(t);P.setValueAtTime(P.value,t);
      if(v===0)P.setTargetAtTime(0,t,tau);else{P.setTargetAtTime(1,t1,tau);P.setValueAtTime(1,t1+tau*6);}}catch(e){}};
  var baisse=function(){if(!FONDU||baisseT)return;baisseT=Date.now()||1;CTX.forEach(function(c){rampe(c,0,.03);});};
  var releve=function(delai){if(!baisseT)return;baisseT=0;CTX.forEach(function(c){rampe(c,1,.05,delai);});};
  addEventListener('ccInactif',baisse);
  addEventListener('ccActif',function(){releve(0);});
  document.addEventListener('pause',baisse);
  document.addEventListener('visibilitychange',function(){if(document.hidden)baisse();else releve(.15);},true);
  ['touchstart','pointerdown'].forEach(function(t){addEventListener(t,function(){releve(0);},{capture:true,passive:true});});
  /* ---- 4 quater. LE VEILLEUR DU SON (2026-11-13, Sacha : « quand on quitte l'appli et qu'on revient il n'y a plus de son ») ----
     Le retour du son tient à une chaîne d'événements (ccActif de Swift, visibilitychange, le réveil du jeu) dont un seul maillon manquant laisse l'app muette, sans erreur. Toutes les 1,5 s, page visible :
       · un fondu de sortie resté baissé depuis plus de 2 s alors qu'on est revenu → on le relève ;
       · un gain de sortie resté sous 0,9 sans fondu en cours → on le remet à 1 ;
       · un contexte « interrupted », ou suspendu sans que le jeu l'ait voulu → resume() ;
       · le contexte du jeu endormi alors que le jeu VEUT du son (`__ccSonVeut`, exposé par graphe-audio.js : ni pause, ni tout coupé) → `__ccSonReveil()`.
     Chaque rattrapage s'écrit dans la boîte noire (genre « son », 6 lignes au plus par session) avec l'état trouvé : c'est aussi la mesure qui manquait. */
  var veilN=0,visT=Date.now();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)visT=Date.now();},true);
  addEventListener('ccActif',function(){visT=Date.now();});
  setInterval(function(){try{
    if(document.hidden||Date.now()-visT<900)return; /* (2026-11-13) une autre musique joue (window.__ccAutreSon, posé par Swift) : le veilleur ne réveille AUCUN contexte — un contexte relancé rouvrait la session audio et pouvait couper la musique du joueur */
    var fait=[];
    if(baisseT&&Date.now()-baisseT>900){releve(0);fait.push('fondu relevé');}
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(!c||c.state==='closed')continue;
      var g=c.__ccSortie;if(g&&!baisseT&&c.state==='running'&&g.gain.value<.9){var v0=g.gain.value;rampe(c,1,.05,0);fait.push('gain de sortie '+v0.toFixed(2)+' → 1');}
      if(c.state!=='running'&&!c.__ccVeille&&window.__ccAutreSon!==1){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}fait.push('contexte '+i+' '+c.state+' relancé');}}
    if(typeof window.__ccSonVeut==='function'&&window.__ccSonVeut()){try{window.__ccSonReveil();}catch(e){}fait.push('contexte du jeu endormi alors que le jeu veut du son : réveil');}
    if(fait.length&&veilN<6&&window.__ccNote){veilN++;window.__ccNote('son','veilleur : '+fait.join(' · ')+' · états '+CTX.map(function(c){return c?c.state+(c.__ccVeille?'(veille)':''):'-';}).join(','));}
  }catch(e){}},700); /* (2026-11-12 soir, build 67 lu : un fondu resté baissé au retour, rattrapé après 2 s de silence) le veilleur passe plus souvent et attend moins : 0,9 s au lieu de 2 s */

  /* ---- 5. L'ÉCRAN DE LANCEMENT ---- (2026-11-05, Opus : jury IOS-20) launchAutoHide:false dans capacitor.config.json : l'écran natif
     ne s'efface plus seul au bout de 4 s (sur un iPhone lent, le grand script n'avait pas fini : un fond violet nu pendant des secondes).
     Le vrai signal, c'est ici : DOMContentLoaded arrive APRÈS l'exécution du grand script de la page. Filet : 30 s quoi qu'il arrive. */
  var cache=function(){try{if(P.SplashScreen)P.SplashScreen.hide({fadeOutDuration:250});}catch(e){}};
  if(document.readyState!=='loading')setTimeout(cache,60);else document.addEventListener('DOMContentLoaded',function(){setTimeout(cache,60);});
  setTimeout(cache,30000);
  /* LE SERPENT D'iOS (2026-11-06) : filet, si l'intro ne l'a pas éteint (intro sautée ou plantée), le menu qui paraît le retire. */
  document.addEventListener('cc:revele',function(){try{if(P.SerpentNatif)P.SerpentNatif.retire();}catch(e){}});
  /* (2026-11-09, debug iOS) LA PAGE SE RECHARGE (TOUT EFFACER, ENTRER UN CODE, RELANCER, contexte 3D perdu) : iOS ne reposait jamais son serpent
     (il n'est montré qu'à l'ouverture de l'app) et la page cache le sien — écran noir pendant tout le rechargement. On le redemande au début de
     chaque chargement : sans effet au premier (il tourne déjà), sans effet non plus sur un binaire plus ancien (méthode absente : rejet avalé). */
  try{if(P.SerpentNatif&&P.SerpentNatif.montre){var pm=P.SerpentNatif.montre();if(pm&&pm.catch)pm.catch(function(){});}}catch(e){}

  /* ---- 8. PAS DE LECTEUR MULTIMÉDIA SUR L'ÉCRAN D'ACCUEIL (2026-11-06, Sacha : « ça lance une fenêtre de musique ou vidéo
     qu'on voit même sur l'écran d'accueil ») ----
     La musique du jeu est un <audio> dans la WebView : iOS l'inscrit comme « lecture en cours » (centre de contrôle, écran
     verrouillé) et, quand l'appli part en arrière-plan, le jeu ne fait que PAUSE — la fiche reste affichée après la sortie.
     Une fiche n'existe que tant que l'élément a une source : au départ on le vide (source mémorisée + position), au retour on
     le remplit AVANT que le jeu relance la musique (écouteur en capture, posé avant ceux du jeu : natif.js charge en premier). */
  var musSauve=null;
  var ctxDort=function(){ // tout le son se coupe : les contextes Web Audio (effets, voix) qui tournaient s'endorment aussi
    if(!AC0||!su)return;
    for(var i=0;i<CTX.length;i++){var c=CTX[i];
      if(c&&c.state==='running'&&!c.__ccParti){try{c.__ccParti=true;var p9=su.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}}}
  };
  var ctxReveil=function(){ // au retour : seuls ceux que NOUS avons endormis sont relancés (les autres restent au jeu)
    if(!AC0||!re)return;
    for(var i=0;i<CTX.length;i++){var c=CTX[i];
      if(c&&c.__ccParti){c.__ccParti=false;if(c.state!=='closed'&&!c.__ccVeille){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}}}}
  };
  var musVide=function(){try{
    ctxDort();
    var el=document.getElementById('musique');if(!el||musSauve)return;
    var s=el.getAttribute('src');if(!s)return;
    musSauve={s:s,t:el.currentTime||0};
    el.pause();el.removeAttribute('src');el.load();
    if(navigator.audioSession)navigator.audioSession.type='ambient'; // plus de session « lecture » tant qu'on est parti
    if(navigator.mediaSession){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}
    dit('musique : source retirée (arrière-plan)');
  }catch(e){}};
  var musRend=function(){try{
    ctxReveil();
    var m=musSauve;musSauve=null;if(!m)return;
    var el=document.getElementById('musique');if(!el||el.getAttribute('src'))return; // le jeu a déjà choisi autre chose : on n'y touche pas
    el.src=m.s;
    el.addEventListener('loadedmetadata',function r(){el.removeEventListener('loadedmetadata',r);try{if(m.t>0&&m.t<(el.duration||1e9))el.currentTime=m.t;}catch(e){}});
    dit('musique : source rendue');
  }catch(e){}};
  /* (SON-CYCLE) à `hidden`, la source de la musique n'est retirée qu'APRÈS le fondu (≤ 100 ms ; tout de suite s'il a déjà eu lieu au `ccInactif`, ou fondu éteint) et seulement si la page est encore cachée */
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){var reste=baisseT?baisseT+100-Date.now():0;
      if(reste>0&&reste<=100)setTimeout(function(){if(document.hidden)musVide();},reste);else musVide();}
    else musRend();},true);
  addEventListener('pagehide',musVide);

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
        /* (2026-11-09, debug iOS) JAMAIS EN ARRIÈRE : « diffère » ne suffit pas. Une app plus récente que la dernière mise à jour publiée
           (constaté : app du jeu v1393, latest.json du 3/11 = v1087) la téléchargeait et repartait 300 versions en arrière au lancement
           suivant. Les deux fichiers portent leur date de fabrication (maj.json : preparer-www.js ; latest.json : publier-maj.js, daté du
           jour de la publication, donc un retour en arrière VOULU reste possible : il suffit de le publier). */
        if(der.date&&ici.date&&Date.parse(der.date)<=Date.parse(ici.date)){dit('maj : '+der.version+' est plus ancienne que cette app, ignorée');return null;}
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

  /* ---- 8. LE RELEVÉ DU CHARGEMENT ---- (2026-11-07, Perf 3 / P4) combien de temps entre le lancement de la page (performance.timeOrigin) et le jeu prêt ?
     Mesure si WKWebView garde le bytecode d'un script EXTERNE (www/ fabriqué avec --jeu-fichier) d'un lancement à l'autre.
     Écrit dans la boîte noire (__ccNote 'chargement', lisible par câble : outils/banc-perf/boite-noire.sh) et, en DEBUG, dans la console. Rien ne sort de l'appareil. */
  (function(){
    var t={dcl:null,pret:null},fini=false;
    var ms=function(x){return x==null?'?':Math.round(x);};
    var rapport=function(){
      if(fini)return;fini=true;
      var jeu='en ligne',tr='-',du='-',fi=null;
      try{var R=performance.getEntriesByType('resource');
        for(var i=0;i<R.length;i++)if(/\/jeu(\.[0-9a-f]+)?\.js(\?|$)/.test(R[i].name)){fi=R[i];break;}
        if(fi){tr=Math.round(fi.transferSize||0);du=ms(fi.duration);}}catch(e){}
      /* (build 14, 13 Pro) le schéma capacitor:// ne remonte PAS toujours le script dans les entrées resource : le mode se lit sur la balise de la page */
      try{var sc=document.querySelector('script[src*="jeu."]');if(sc||fi)jeu='fichier';}catch(e){}
      var m='jeu '+jeu+' · origine→DCL '+ms(t.dcl)+' ms · origine→prêt '+ms(t.pret)+' ms · DCL→prêt '+ms(t.pret==null||t.dcl==null?null:t.pret-t.dcl)+' ms'+
        (fi?' · jeu.js transfert '+tr+' o, durée '+du+' ms (début '+ms(fi.startTime)+', fin '+ms(fi.responseEnd)+')':(jeu==='fichier'?' · jeu.js : aucune entrée resource':''));
      dit('CHARGEMENT '+m);
      try{if(window.__ccNote)window.__ccNote('chargement',m);}catch(e){}
    };
    var pret=function(){if(t.pret!=null)return;t.pret=performance.now();setTimeout(rapport,300);};
    document.addEventListener('DOMContentLoaded',function(){t.dcl=performance.now();});
    var v=window.__gameReady;
    if(v){pret();}
    else{try{Object.defineProperty(window,'__gameReady',{configurable:true,enumerable:true,get:function(){return v;},set:function(x){v=x;if(x)pret();}});}catch(e){}
      var n=0,g=setInterval(function(){if(window.__gameReady)pret();if(t.pret!=null||++n>400)clearInterval(g);},50);}
  })();

  /* ---- 9. LA VIGNETTE « EN LECTURE » ---- (2026-11-08, Perf 3 / P4) la musique du jeu joue par un <audio> (musique.js, #musique) : iOS enregistre alors l'app comme
     lecteur média et laisse une vignette « En lecture » sur l'écran d'accueil après avoir quitté l'app. À l'arrière-plan on décharge donc l'<audio> (pause, source vidée,
     mediaSession effacée) et au retour on remet la source et la position AVANT que le jeu ne relance sa musique (son propre écouteur visibilitychange, branché après
     celui-ci : musicJoue ne refait pas la source). Côté natif, AppDelegate.swift relâche la session audio en arrière-plan. */
  (function(){
    var gardes=[]; // [{el, src, t, jouait}]
    var efface=function(){try{var M=navigator.mediaSession;if(!M)return;M.metadata=null;M.playbackState='none';
      ['play','pause','stop','seekbackward','seekforward','seekto','previoustrack','nexttrack'].forEach(function(a){try{M.setActionHandler(a,null);}catch(e){}});}catch(e){}};
    var decharge=function(){
      if(gardes.length)return; // déjà déchargé
      try{var L=document.querySelectorAll('audio,video');
        for(var i=0;i<L.length;i++){var el=L[i],src=el.getAttribute('src');
          if(!src)continue; // sans source (ou source <source>) : rien à vider
          gardes.push({el:el,src:src,t:el.currentTime||0,jouait:!el.paused});
          try{el.pause();}catch(e){}
          el.removeAttribute('src');try{el.load();}catch(e){}}}catch(e){}
      efface();
      if(gardes.length)dit('vignette lecture : '+gardes.length+' média(s) déchargé(s)');
    };
    var recharge=function(){
      var G=gardes;gardes=[];
      G.forEach(function(g){try{
        if(g.el.getAttribute('src'))return; // le jeu a déjà remis une source : on n'y touche pas
        g.el.setAttribute('src',g.src);g.el.load();
        if(g.t>0)g.el.addEventListener('loadedmetadata',function f(){g.el.removeEventListener('loadedmetadata',f);try{g.el.currentTime=g.t;}catch(e){}});
      }catch(e){}});
      if(G.length)dit('vignette lecture : '+G.length+' média(s) rechargé(s)');
    };
    document.addEventListener('visibilitychange',function(){if(document.hidden)decharge();else recharge();});
    addEventListener('pagehide',decharge);
    addEventListener('pageshow',function(){if(!document.hidden)recharge();});
    document.addEventListener('freeze',decharge);
    window.__ccVignette={decharge:decharge,recharge:recharge}; // banc : window.__ccVignette.decharge()
  })();

  /* ---- 10. LA PAGE A-T-ELLE ÉTÉ TUÉE ? (2026-11-12, ios-ultime) ----
     Un processus web tué par iOS ne laisse aucune trace : la page suivante démarre comme si de rien n'était. Ici la page marque « avant-plan » tant qu'elle est visible
     et « fond » dès qu'elle part (visibilitychange, pause de Capacitor, pagehide). Au chargement suivant, si la marque est restée « avant-plan », la page d'avant est
     morte sans prévenir : processus web tué (même session : `ccVieS` survit au rechargement du processus web, À VÉRIFIER), app tuée ou plantage (nouvelle session).
     Écrit dans la boîte noire (genre « contexte », protégé du plafond). Un 2e lancement à froid après un balayage de l'app au premier plan compte aussi (faux positif connu). */
  (function(){
    var K='ccVie',lsv=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
    var av=lsv(K),t0=+lsv(K+'T')||0,mm=null;try{mm=sessionStorage.getItem('ccVieS');}catch(e){}
    if(av==='avant')document.addEventListener('DOMContentLoaded',function(){try{
      window.__ccNote('contexte','page d’avant non fermée proprement ('+(mm?'même session : processus web tué':'nouvelle session : app tuée, redémarrée ou plantée')+') · dernier signe de vie il y a '+Math.round((Date.now()-t0)/1000)+' s');}catch(e){}});
    var pose=function(){lsv(K,document.hidden?'fond':'avant');lsv(K+'T',String(Date.now()));try{sessionStorage.setItem('ccVieS','1');}catch(e){}};
    pose();
    document.addEventListener('visibilitychange',pose);
    document.addEventListener('pause',function(){lsv(K,'fond');});
    document.addEventListener('resume',pose);
    addEventListener('pagehide',function(){lsv(K,'fond');});
    setInterval(function(){if(!document.hidden)lsv(K+'T',String(Date.now()));},15000);
  })();

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
