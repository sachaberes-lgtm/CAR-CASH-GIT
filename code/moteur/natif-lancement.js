/* ===== LE CHRONO DU LANCEMENT DE L'APP (2026-11-15, lot « natif ») =====
   La tranche jamais écrite : « toucher l'icône → début de la page ». L'app iOS pose `window.__ccNatifT` au début du document (ChronoLancement,
   JeuViewController.swift) : des instants en millisecondes d'horloge murale — proc (début du processus, lu au noyau), lance (didFinishLaunching),
   web (la vue web va être créée), prete (elle existe), vue (viewDidAppear : le serpent natif est à l'écran) — et prechauffe (iOS avait créé le
   processus d'avance : processus→… ne veut alors rien dire). La page y ajoute son propre début (`performance.timeOrigin`, même horloge).
   `window.ccNatifLancement()` rend la FIN de la ligne `chargement` de la boîte noire (intro-161.js, introNote) :
     « · natif : processus→vue X ms · vue→page Y ms (processus→lancé A, lancé→web B, web→prête C, prête→vue D) »
   vue→page peut être NÉGATIF : la page a commencé avant que l'écran n'apparaisse. « rechargement » : la page a été rechargée (TOUT EFFACER, code,
   contexte perdu), les instants natifs sont ceux du lancement d'origine et vue→page ne mesure plus un lancement.
   LECTURE SEULE : rien ne change dans le jeu. Hors de l'app (site, ordinateur, banc) `__ccNatifT` n'existe pas : la fonction rend '' et la ligne
   est celle d'avant, à l'octet. `?sans=natiflancement` = la ligne d'avant, dans l'app aussi. */
window.ccNatifLancement=function(){
  try{
    const T=window.__ccNatifT;
    if(!T||typeof T!=='object'||/[?&]sans=[^&]*natiflancement/.test(location.search))return '';
    const n=function(x){x=+x;return isFinite(x)&&x>0?x:null;};
    const d=function(a,b){return a==null||b==null?'?':String(Math.round(b-a));};
    const proc=n(T.proc),lance=n(T.lance),web=n(T.web),prete=n(T.prete),vue=n(T.vue);
    let page=n(performance.timeOrigin);if(page==null)page=Date.now()-performance.now();
    let rech=false;try{const N=performance.getEntriesByType('navigation')[0];rech=!!(N&&N.type==='reload');}catch(e){}
    if(!rech&&vue!=null&&page-vue>60000)rech=true; /* filet : une page née plus d'une minute après l'écran n'est pas celle du lancement */
    return ' · natif : processus→vue '+d(proc,vue)+' ms · vue→page '+d(vue,page)+' ms (processus→lancé '+d(proc,lance)+', lancé→web '+d(lance,web)+
      ', web→prête '+d(web,prete)+', prête→vue '+d(prete,vue)+(T.prechauffe?', PRÉCHAUFFÉ : processus→… ne compte pas':'')+(rech?', rechargement':'')+')';
  }catch(e){return '';}
};
