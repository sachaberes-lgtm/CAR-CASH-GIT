/* LE FAUX STOREKIT (2026-11-10, banc adversaire des achats) — injecté dans la page AVANT natif.js, achats.js et le jeu.
   Il remplace tout ce qui est natif dans l'app : window.Capacitor, le plugin « Achats » (un portage LIGNE À LIGNE de
   app-ios/ios/App/App/Achats.swift : registre des achats en vol, Transaction.updates, finish après la réponse, achatRecu retenu)
   et le plugin Preferences (le miroir de la sauvegarde). Le VRAI pont achats.js et le VRAI jeu tournent par-dessus.
   Trois mémoires, comme sur un iPhone :
     localStorage.__appstore   = Apple + la base StoreKit de l'appareil : survit à tout (app tuée, TOUT EFFACER) ;
     sessionStorage.__natif    = la mémoire vive du plugin Swift : survit à un rechargement de la WebView, PAS à l'app tuée
                                 (le banc l'efface avant de recharger pour « tuer l'app ») ;
     localStorage.__prefs:<k>  = NSUserDefaults (Preferences).
   Le banc pilote par window.__sk (voir en bas). ⚠ Ce fichier modélise StoreKit : il ne PROUVE rien sur le vrai. */
(function(){
  'use strict';
  if(window.__sk)return;
  if(location.pathname.slice(-5)==='.json')return; /* une page de service du banc (maj.json) : pas d'app ici */
  var LS=localStorage,SS=sessionStorage;
  var lit=function(S,k,d){try{var x=JSON.parse(S.getItem(k));return x&&typeof x==='object'?x:d;}catch(e){return d;}};
  var AS=lit(LS,'__appstore',null)||{tx:[],n:1000,local:true,regle:{feuille:'ok',reseau:true,catalogue:null}};
  var ecrisAS=function(){LS.setItem('__appstore',JSON.stringify(AS));};
  var vivant=!!SS.getItem('__natif'); /* la WebView a rechargé mais l'app (le plugin Swift) n'a pas été tuée */
  var N=lit(SS,'__natif',null)||{enVol:null,tenues:[],differees:[],pend:null,ecoute:false};
  var ecrisN=function(){SS.setItem('__natif',JSON.stringify(N));};
  var journal=[];
  var note=function(){journal.push([].slice.call(arguments).join(' '));};
  var tard=function(f,ms){return new Promise(function(ok,non){setTimeout(function(){try{ok(f());}catch(e){non(e);}},ms==null?8:ms);});};
  var rejet=function(msg,code){var e=new Error(msg);if(code)e.code=code;return e;};
  var txDe=function(tid){for(var i=0;i<AS.tx.length;i++)if(AS.tx[i].tid===tid)return AS.tx[i];return null;};
  var droits=function(){ /* Transaction.currentEntitlements : vérifiées, non remboursées ; un téléphone neuf ne sait rien avant AppStore.sync() */
    if(!AS.local)return [];
    var s={};AS.tx.forEach(function(t){if(t.etat==='payee'&&!t.revoquee)s[t.pid]=1;});return Object.keys(s).sort();};
  var finis=function(t){t.finie=true;ecrisAS();note('finish',t.pid,t.tid);};

  /* ---- les écouteurs Capacitor (notifyListeners … retainUntilConsumed) ---- */
  var ecouteurs=[],retenus=[];
  var notifie=function(id){
    if(ecouteurs.length){ecouteurs.slice().forEach(function(cb){try{cb({id:id});}catch(e){}});note('achatRecu',id);return;}
    if(N.ecoute){note('achatRecu PERDU (écouteur d\'une page morte)',id);return;} /* le natif croit avoir un écouteur : celui de la page d'avant */
    retenus.push(id);note('achatRecu retenu',id);};

  /* ---- Transaction.updates → recoit / livre (Achats.swift) ---- */
  var livre=function(t){if(!t.revoquee)notifie(t.pid);else note('remboursée, rien à donner',t.pid);finis(t);};
  var recoit=function(t){
    if(N.tenues.indexOf(t.tid)>=0){finis(t);return;}
    if(N.enVol===t.pid){if(N.differees.indexOf(t.tid)<0){N.differees.push(t.tid);ecrisN();}note('différée',t.pid);return;}
    livre(t);};
  var relache=function(){
    N.enVol=null;N.pend=null;
    var reste=N.differees.filter(function(tid){return N.tenues.indexOf(tid)<0;});N.differees=[];ecrisN();
    reste.forEach(function(tid){var t=txDe(tid);if(t&&!t.finie)livre(t);});};

  /* ---- la feuille d'achat d'Apple ---- */
  var encaisse=function(pid){ /* Apple débite. Un non-consommable déjà possédé : la transaction d'origine est rendue, sans second débit */
    for(var i=0;i<AS.tx.length;i++){var o=AS.tx[i];if(o.pid===pid&&o.etat==='payee'&&!o.revoquee){note('déjà acheté, rendu sans débit',pid);return o;}}
    var t={tid:++AS.n,pid:pid,etat:'payee',finie:false,revoquee:false};AS.tx.push(t);AS.debits=(AS.debits||0)+1;ecrisAS();note('DÉBIT',pid,t.tid);return t;};
  var feuilleAttente=null; /* la feuille ouverte en mode 'pend' : {pid, fin(mode)} */
  var issue=function(pid,call,mode){
    if(mode==='annule'){call.resolve({etat:'annule'});return;}
    if(mode==='attente'){AS.tx.push({tid:++AS.n,pid:pid,etat:'attente',finie:false,revoquee:false});ecrisAS();call.resolve({etat:'attente'});return;}
    if(mode==='echec'||!AS.regle.reseau){call.reject(rejet('achat impossible : réseau'));return;}
    if(mode==='coupe'){encaisse(pid);call.reject(rejet('achat impossible : la connexion a été perdue'));return;} /* débité, réponse perdue : StoreKit la rendra par Transaction.updates */
    var t=encaisse(pid);
    N.tenues.push(t.tid);ecrisN();
    call.resolve({etat:'ok'}); /* d'abord le jeu… */
    if(AS.regle.tueAvantFinish){note('app tuée avant finish');return;}
    finis(t);};             /* …ensuite Apple */
  var achete=function(pid,call){
    return tard(function(){
      if(!AS.regle.reseau)throw rejet('achat impossible : hors ligne');
      if(AS.regle.catalogue&&AS.regle.catalogue.indexOf(pid)<0){call.reject(rejet('produit inconnu de l\'App Store : '+pid));return;}
      if(AS.regle.feuille!=='pend'){issue(pid,call,AS.regle.feuille);return;}
      N.pend=pid;ecrisN();
      return new Promise(function(ok){feuilleAttente={pid:pid,fin:function(mode){feuilleAttente=null;issue(pid,call,mode||'ok');ok();}};});
    }).catch(function(e){call.reject(e);});};

  var appel=function(){var c={};c.p=new Promise(function(ok,non){c.resolve=ok;c.reject=non;});return c;};
  var Achats={
    addListener:function(nom,cb){
      if(nom==='achatRecu'){ecouteurs.push(cb);N.ecoute=true;ecrisN();var q=retenus;retenus=[];q.forEach(function(id){setTimeout(function(){try{cb({id:id});}catch(e){}},0);});}
      return Promise.resolve({remove:function(){}});},
    produits:function(a){return tard(function(){
      if(!AS.regle.reseau)throw rejet('produits indisponibles');
      return {produits:((a&&a.ids)||[]).filter(function(id){return !AS.regle.catalogue||AS.regle.catalogue.indexOf(id)>=0;}).map(function(id){return {id:id,prix:(AS.regle.prix&&AS.regle.prix[id])||'9,99 €',devise:'EUR'};})};});},
    acheter:function(a){
      var id=a&&a.id,c=appel();
      if(!id){c.reject(rejet('acheter : id manquant'));return c.p;}
      tard(function(){
        if(N.enVol){c.reject(rejet('un achat est déjà en cours','indisponible'));return;}
        N.enVol=id;ecrisN();note('acheter',id);
        return achete(id,c).then(relache);});
      return c.p;},
    possedes:function(){return tard(function(){return {ids:droits()};},12);},
    restaurer:function(){return tard(function(){
      AS.nRestaurer=(AS.nRestaurer||0)+1;
      if(!AS.regle.reseau||AS.regle.restaurerEchoue)throw rejet('restauration impossible');
      AS.local=true;ecrisAS();return {ids:droits()};},20);}
  };
  var Preferences={
    get:function(o){return tard(function(){var v=LS.getItem('__prefs:'+o.key);return {value:v==null?null:v};},25);},
    set:function(o){LS.setItem('__prefs:'+o.key,String(o.value));return Promise.resolve();},
    remove:function(o){LS.removeItem('__prefs:'+o.key);return Promise.resolve();}
  };
  window.Capacitor={isNativePlatform:function(){return true;},getPlatform:function(){return 'ios';},DEBUG:false,Plugins:{Achats:Achats,Preferences:Preferences}};

  /* ---- load() du plugin : au LANCEMENT de l'app, Transaction.updates rend les transactions payées et jamais terminées ---- */
  if(!vivant){ecrisN();setTimeout(function(){AS.tx.slice().forEach(function(t){if(t.etat==='payee'&&!t.finie&&AS.local)recoit(t);});},40);}
  else if(N.pend){ /* la WebView a rechargé sous une feuille d'achat ouverte : l'achat finira, mais sa réponse ira à la page morte */
    var mort={resolve:function(){note('réponse « ok » envoyée à une page morte');},reject:function(){}};
    feuilleAttente={pid:N.pend,fin:function(mode){var pid=N.pend;feuilleAttente=null;issue(pid,mort,mode||'ok');relache();}};}

  /* ---- les manettes du banc ---- */
  window.__sk={
    regle:function(o){for(var k in o)AS.regle[k]=o[k];ecrisAS();return AS.regle;},
    feuille:function(){return feuilleAttente?feuilleAttente.pid:null;},
    valide:function(mode){if(!feuilleAttente)return false;feuilleAttente.fin(mode);return true;},
    approuve:function(pid){ /* le parent dit oui (Ask to Buy) : Apple débite, Transaction.updates la rend si l'app tourne */
      var t=null;AS.tx.forEach(function(x){if(x.pid===pid&&x.etat==='attente')t=x;});if(!t)return false;
      t.etat='payee';AS.debits=(AS.debits||0)+1;ecrisAS();note('DÉBIT (accord parental)',pid);recoit(t);return true;},
    /* APP FERMÉE (le banc tue l'app juste après) : Apple débite, mais personne n'écoute — la transaction reste « payée, jamais terminée » */
    approuveFerme:function(pid){var t=null;AS.tx.forEach(function(x){if(x.pid===pid&&x.etat==='attente')t=x;});if(!t)return false;
      t.etat='payee';AS.debits=(AS.debits||0)+1;ecrisAS();note('DÉBIT (accord parental, app fermée)',pid);return true;},
    debiteSeul:function(pid){encaisse(pid);return true;}, /* débité, l'app meurt avant la réponse */
    pose:function(pids){pids.forEach(function(pid){AS.tx.push({tid:++AS.n,pid:pid,etat:'payee',finie:true,revoquee:false});});ecrisAS();return AS.tx.length;}, /* des achats anciens, terminés (un autre appareil) */
    oublie:function(){AS.local=false;ecrisAS();return true;}, /* StoreKit ne sait plus rien tant que RESTAURER (AppStore.sync) n'a pas été touché */
    refuse:function(pid){AS.tx=AS.tx.filter(function(x){return !(x.pid===pid&&x.etat==='attente');});ecrisAS();return true;},
    rembourse:function(pid){var t=null;AS.tx.forEach(function(x){if(x.pid===pid&&x.etat==='payee'&&!x.revoquee)t=x;});if(!t)return false;
      t.revoquee=true;t.finie=false;ecrisAS();recoit(t);return true;},
    reseauRevient:function(){AS.regle.reseau=true;ecrisAS();AS.tx.slice().forEach(function(t){if(t.etat==='payee'&&!t.finie)recoit(t);});},
    paye:function(pid){return AS.tx.some(function(t){return t.pid===pid&&t.etat==='payee'&&!t.revoquee;});},
    etat:function(){return {tx:AS.tx.slice(),debits:AS.debits||0,local:AS.local,regle:AS.regle,natif:N,nRestaurer:AS.nRestaurer||0,journal:journal.slice()};}
  };
})();
