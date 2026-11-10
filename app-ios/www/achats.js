














(function(){
  'use strict';
  var C=window.Capacitor;
  if(!C||typeof C.isNativePlatform!=='function'||!C.isNativePlatform())return;
  var A=(C.Plugins||{}).Achats;
  if(!A)return;

  var erreur=function(code,texte){var e=new Error(texte||code);e.code=code;return e;};
  var enCours=false;
  var ecouteurs=[], enAttente=[];

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
