/* ===== LE CHRONO DU LANCEMENT DE L'APP (2026-11-15, lot « natif ») =====
   La tranche jamais écrite : « toucher l'icône → début de la page ». L'app iOS (build de mesure : Debug) pose `window.__ccNatifT` au début du document
   (ChronoLancement, JeuViewController.swift) : des instants en millisecondes d'horloge murale — proc (début du processus, lu au noyau), lance
   (didFinishLaunching), web (la vue web va être créée), prete (elle existe), vue (viewDidAppear : le serpent natif est à l'écran) — prechauffe (iOS
   avait créé le processus d'avance : processus→… ne veut alors rien dire) et charge (le numéro de la page dans ce processus, compté par le natif).
   La page y ajoute son propre début (`performance.timeOrigin`, même horloge).
   `window.ccNatifNote()` écrit une ligne `natif` dans la boîte noire, À ELLE (contrôle du 15/11 : en fin de ligne `chargement` elle était coupée par
   le plafond de 240 caractères de __ccNote). Appelée par introNote (intro-161.js), à côté de la ligne `chargement` :
     « processus→vue X ms · vue→page Y ms (processus→lancé A, lancé→web B, web→prête C, prête→vue D) »
   vue→page peut être NÉGATIF : la page a commencé avant que l'écran n'apparaisse. « rechargement » : la page n'est pas celle du lancement — rechargée
   (TOUT EFFACER, code : type reload), ou relancée par le natif (GardeVue, contexte perdu : « page N », N ≥ 2, compté par le natif) ; les instants
   natifs sont ceux du lancement d'origine et vue→page ne mesure plus un lancement. « PRÉCHAUFFÉ » : processus→… ne compte pas.
   LECTURE SEULE : rien ne change dans le jeu. Hors de l'app (site, ordinateur, banc) et dans une app de l'App Store `__ccNatifT` n'existe pas :
   `ccNatifLancement()` rend '' et AUCUNE ligne n'est écrite. `?sans=natiflancement` = aucune ligne, dans l'app aussi.
   Le texte tient dans les 240 caractères de __ccNote, mentions comprises (prouvé dans node : passation/qualite/natif.md). */
window.ccNatifLancement=function(){
  try{
    const T=window.__ccNatifT;
    if(!T||typeof T!=='object'||/[?&]sans=[^&]*natiflancement/.test(location.search))return '';
    const n=function(x){x=+x;return isFinite(x)&&x>0?x:null;};
    const d=function(a,b){return a==null||b==null?'?':String(Math.round(b-a));};
    const proc=n(T.proc),lance=n(T.lance),web=n(T.web),prete=n(T.prete),vue=n(T.vue),charge=n(T.charge);
    let page=n(performance.timeOrigin);if(page==null)page=Date.now()-performance.now();
    let rech=charge!=null&&charge>1;try{const N=performance.getEntriesByType('navigation')[0];if(N&&N.type==='reload')rech=true;}catch(e){}
    if(!rech&&vue!=null&&page-vue>60000)rech=true; /* filet : une page née plus d'une minute après l'écran n'est pas celle du lancement */
    return 'processus→vue '+d(proc,vue)+' ms · vue→page '+d(vue,page)+' ms (processus→lancé '+d(proc,lance)+', lancé→web '+d(lance,web)+
      ', web→prête '+d(web,prete)+', prête→vue '+d(prete,vue)+(T.prechauffe?', PRÉCHAUFFÉ : processus→… ne compte pas':'')+(rech?', rechargement'+(charge>1?' page '+charge:''):'')+')';
  }catch(e){return '';}
};
window.ccNatifNote=function(){
  try{const s=window.ccNatifLancement();if(s&&window.__ccNote)window.__ccNote('natif',s);}catch(e){}
};
