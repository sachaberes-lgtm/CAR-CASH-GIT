/* CASH CAR — LE PONT DES ACHATS (app iOS Capacitor, 2026-11-06 : achats intégrés App Store).
   preparer-www.js copie ce fichier dans www/ et le charge juste après natif.js. Il expose window.ccAchat au jeu, qui n'a ainsi jamais
   à connaître Capacitor : le jeu appelle ccAchat.payer('id'), le plugin Swift « Achats » (StoreKit 2) fait le reste.
   Hors de l'app (navigateur, Vercel, portails) ou si le plugin natif manque, il ne fait RIEN : window.ccAchat reste INDÉFINI
   et le jeu web est inchangé (c'est le test que le jeu fait : « if(window.ccAchat) … »). Aucune requête réseau, aucun SDK tiers.
   Contrat avec le plugin natif (Capacitor.Plugins.Achats) :
     produits({ids}) → {produits:[{id,prix,devise}]} · acheter({id}) → {etat:'ok'|'annule'|'attente'}
     possedes() → {ids:[…]} · restaurer() → {ids:[…]} · événement « achatRecu » {id} (achat validé hors d'un appel : demande
     d'achat approuvée plus tard, achat fait sur un autre appareil).
   Ce que le jeu reçoit :
     ccAchat.pret                 vrai
     ccAchat.produits(ids)        Promise<{[id]:{prix:'0,99 €', devise:'EUR'}}>
     ccAchat.payer(id)            Promise<'ok'> ; rejette une Error dont .code vaut 'annule' | 'attente' | 'indisponible' | 'echec'
     ccAchat.possedes()           Promise<string[]> ;  ccAchat.restaurer()  Promise<string[]>
     ccAchat.onRecu(cb)           cb(id) à chaque achat reçu en dehors d'un payer() */
(function(){
  'use strict';
  var C=window.Capacitor;
  if(!C||typeof C.isNativePlatform!=='function'||!C.isNativePlatform())return; // navigateur : rien
  var A=(C.Plugins||{}).Achats;
  if(!A)return; // plugin natif absent (build sans StoreKit) : rien

  var erreur=function(code,texte){var e=new Error(texte||code);e.code=code;return e;};
  var enCours=false; // UN SEUL ACHAT À LA FOIS : un second payer() pendant le premier est refusé sans toucher au plugin
  var ecouteurs=[], enAttente=[]; // enAttente : achats reçus avant que le jeu n'ait posé son onRecu (ils sont rejoués ensuite)

  var recu=function(id){
    if(typeof id!=='string')return;
    if(!ecouteurs.length){enAttente.push(id);return;}
    ecouteurs.slice().forEach(function(cb){try{cb(id);}catch(e){}});
  };
  try{var r=A.addListener('achatRecu',function(ev){recu(ev&&ev.id);});if(r&&r.catch)r.catch(function(){});}catch(e){}

  var ids=function(r){return (r&&Array.isArray(r.ids))?r.ids.filter(function(x){return typeof x==='string';}):[];};

  window.ccAchat={
    pret:true,
    produits:function(liste){
      return Promise.resolve().then(function(){return A.produits({ids:(liste||[]).slice()});}).then(function(r){
        var t={},l=(r&&r.produits)||[];
        l.forEach(function(p){if(p&&typeof p.id==='string')t[p.id]={prix:String(p.prix),devise:String(p.devise)};});
        return t;
      },function(){throw erreur('echec','produits indisponibles');});
    },
    payer:function(id){
      if(enCours)return Promise.reject(erreur('indisponible','un achat est déjà en cours'));
      enCours=true;
      return Promise.resolve().then(function(){return A.acheter({id:id});}).then(function(r){
        enCours=false;
        var etat=r&&r.etat;
        if(etat==='ok')return 'ok';
        if(etat==='annule'||etat==='attente')throw erreur(etat);
        throw erreur('echec','état inconnu');
      },function(e){
        enCours=false;
        if(e&&e.code&&/^(annule|attente|indisponible|echec)$/.test(e.code))throw e;
        throw erreur('echec',(e&&e.message)||'échec');
      });
    },
    possedes:function(){return Promise.resolve().then(function(){return A.possedes();}).then(ids);},
    restaurer:function(){return Promise.resolve().then(function(){return A.restaurer();}).then(ids);},
    onRecu:function(cb){
      if(typeof cb!=='function')return;
      ecouteurs.push(cb);
      if(enAttente.length){var q=enAttente;enAttente=[];q.forEach(recu);}
    }
  };
})();
