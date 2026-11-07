/* ===== LE CATALOGUE DES ACHATS APP STORE (2026-11-07, Sacha : « les achats en vrai argent, via StoreKit ») =====
   Ce qui se vend en euros, et sous quel produit Apple. Les caisses : `CAR_UNLOCK[i].k==='premium'` hors lignes retirées (`carRetiree`),
   produit `cashcar.car.<shape>` ; les peintures à prix : `COSM.peinture` avec `eur` (hors `usine`), produit `cashcar.peinture.<id>`.
   Aucune palette en vente. `cle` = l'index de CARS (une caisse) ou `'peinture:<id>'` (la clé que `shopPaye` reçoit). */
function produitsStore(){
  const L=[];
  for(let i=0;i<CARS.length;i++){
    const u=CAR_UNLOCK[i];
    if(!u||u.k!=='premium'||carRetiree(i)||!u.eur)continue;
    L.push({id:'cashcar.car.'+CARS[i].shape,type:'car',cle:i,eur:u.eur});
  }
  for(const d of COSM.peinture){
    if(!d.eur||d.id==='usine')continue;
    L.push({id:'cashcar.peinture.'+d.id,type:'peinture',cle:'peinture:'+d.id,eur:d.eur});
  }
  return L;
}
/* l'index est construit UNE fois (le catalogue ne bouge pas en cours de partie) : produitDe / prixTxt sont appelés dans les rendus */
var ACH_INDEX=null;
function achatsIndex(){
  if(ACH_INDEX)return ACH_INDEX;
  const L=produitsStore(),parCle=new Map(),parId=new Map();
  L.forEach(function(p){parCle.set(p.cle,p);parId.set(p.id,p);});
  return ACH_INDEX={L:L,parCle:parCle,parId:parId};
}
function produitDe(cle){const p=achatsIndex().parCle.get(cle);return p?p.id:null;}
window.dbgProduits=function(){return produitsStore();};

/* ===== LA PORTE D'ACHAT BRANCHÉE SUR L'APP (2026-11-07, Sacha : « les achats en vrai argent, via StoreKit ») =====
   `window.ccAchat` n'existe que dans l'app iPhone (app-ios/natif/achats.js, StoreKit 2). Sur le web il est indéfini : shopPaye rejette
   `storekit`, la page dit INDISPONIBLE, rien ne change. ⚠ Rien n'est donné tant qu'Apple n'a pas rendu 'ok' ; annulé ou en attente = rien.
   Les cadeaux sont IDEMPOTENTS (l'objet est déjà à toi ⇒ on ne fait rien) : un achatRecu pour un achat que payer() vient de tenir ne rejoue
   ni la fête ni le son. La synchro du démarrage et RESTAURER donnent « calme » (ni fête, ni peinture équipée) ; un achat vivant (onRecu) fête. */
Object.assign(I18N,{"EN ATTENTE D'ACCORD":"WAITING FOR APPROVAL","1 ACHAT RESTAURÉ":"1 PURCHASE RESTORED","ACHATS RESTAURÉS":"PURCHASES RESTORED","AUCUN ACHAT À RESTAURER":"NOTHING TO RESTORE"});
var ACH_EN_COURS=false,ACH_PRIX={};
function achatsErreur(code,texte){const e=new Error(texte||code);e.code=code;return e;}
function achatsMotif(e){ /* ce que le jeu fait d'un refus : annule | attente | occupe (un autre achat est en vol) | indisponible (tout le reste, dont le web) */
  const c=e&&e.code;return c==='annule'||c==='attente'||c==='occupe'?c:'indisponible';}
function achatsPaye(cle){
  const A=window.ccAchat;
  if(!A||typeof A.payer!=='function')return Promise.reject(new Error('storekit'));
  const id=produitDe(cle);
  if(!id)return Promise.reject(achatsErreur('indisponible','produit inconnu'));
  if(ACH_EN_COURS)return Promise.reject(achatsErreur('occupe','un achat est déjà en cours'));
  ACH_EN_COURS=true;
  let p;try{p=Promise.resolve(A.payer(id));}catch(e){p=Promise.reject(e);}
  return p.then(function(r){ACH_EN_COURS=false;if(r!=='ok')throw achatsErreur('echec','réponse inattendue');},
    function(e){ACH_EN_COURS=false;throw e;});
}
function achatsRafraichit(){try{shopRender();}catch(e){}try{GBQ.rk='';}catch(e){}}
function achatsRecoit(idProduit,calme){ /* pose l'objet s'il manque : vrai si NOUVEAU, faux si déjà à toi ou produit inconnu */
  const p=typeof idProduit==='string'?achatsIndex().parId.get(idProduit):null;
  if(!p)return false;
  if(p.type==='car'){if(carOwned(p.cle))return false;shopDonne(p.cle,!!calme);return true;}
  const id=p.cle.slice(9); /* 'peinture:'.length */
  if(!SAVE.d.shop||!SAVE.d.shop.own||SAVE.d.shop.own.indexOf('peinture:'+id)>=0)return false;
  habDonne('peinture',id,!!calme);return true;
}
function achatsSync(restaure){ /* ce que l'App Store dit posséder ⇒ calme ; n'échoue JAMAIS (0 en cas d'erreur, aucun toast) */
  const A=window.ccAchat;
  if(!A)return Promise.resolve(0);
  return Promise.resolve().then(function(){
    const f=restaure&&typeof A.restaurer==='function'?A.restaurer:A.possedes;
    return f.call(A);
  }).then(function(L){
    let n=0;(Array.isArray(L)?L:[]).forEach(function(id){try{if(achatsRecoit(id,true))n++;}catch(e){}});
    if(n)achatsRafraichit();
    return n;
  }).catch(function(){return 0;});
}
function achatsRestaure(){ /* le bouton RESTAURER MES ACHATS : sans l'app, l'ancien toast */
  if(!window.ccAchat){toast(pxi('coche')+' '+TR('AUCUN ACHAT À RESTAURER'));return Promise.resolve(0);}
  return achatsSync(true).then(function(n){
    toast(pxi('coche')+' '+(n>0?(n===1?TR('1 ACHAT RESTAURÉ'):n+' '+TR('ACHATS RESTAURÉS')):TR('AUCUN ACHAT À RESTAURER')));
    return n;
  });
}
function achatsPrix(){ /* les prix localisés d'Apple, demandés UNE fois au démarrage ; le prochain rendu les reprend */
  const A=window.ccAchat;
  if(!A||typeof A.produits!=='function')return Promise.resolve(0);
  return Promise.resolve().then(function(){return A.produits(achatsIndex().L.map(function(p){return p.id;}));}).then(function(t){
    let n=0;
    if(t)for(const id in t){const x=t[id];if(x&&typeof x.prix==='string'&&x.prix&&achatsIndex().parId.has(id)){ACH_PRIX[id]=x.prix;n++;}}
    if(n)try{GBQ.rk='';}catch(e){}
    return n;
  }).catch(function(){return 0;});
}
function prixTxt(cle,eurRepli){ /* Apple impose d'afficher le prix qu'il facture : le sien s'il est connu, sinon l'euro du jeu */
  const id=produitDe(cle),p=id&&ACH_PRIX[id];
  return p?p:eurTxt(eurRepli);
}
function prixGroupe(cles,eurRepli){ /* le prix écrit UNE fois pour un groupe (l'intertitre d'une rareté de peintures) : celui d'Apple pour la première peinture à vendre du groupe, sinon l'euro du jeu. ⚠ Toutes les peintures d'une rareté sont supposées dans le MÊME palier de prix Apple (PEINT_EUR) */
  for(let i=0;i<cles.length;i++)if(produitDe(cles[i]))return prixTxt(cles[i],eurRepli);
  return eurTxt(eurRepli);
}
function achatsDemarre(){ /* fin d'init : écoute des achats reçus, prix, synchro — rien du tout hors de l'app */
  const A=window.ccAchat;
  if(!A)return;
  if(!achatsDemarre.recu&&typeof A.onRecu==='function'){
    achatsDemarre.recu=1;
    try{A.onRecu(function(id){try{if(achatsRecoit(id,false))achatsRafraichit();}catch(e){}});}catch(e){}
  }
  achatsPrix();achatsSync(false);
}
/* crochets du banc : on AJOUTE à dbgAchats (jamais de remplacement) */
window.dbgAchats=window.dbgAchats||{};
Object.assign(window.dbgAchats,{produitDe:produitDe,paye:shopPaye,sync:achatsSync,recoit:achatsRecoit,restaure:achatsRestaure,prix:achatsPrix,prixTxt:prixTxt,demarre:achatsDemarre,pop:shopPop,
  habPaye:function(id){return habPaye('peinture',COSM.peinture.findIndex(function(d){return d.id===id;}),null);},
  nuance:function(id){const d=COSM.peinture.find(function(x){return x.id===id;});return d?bqNuanceEtat(d):null;}, /* l'état d'une pastille du nuancier (loupe, étiquette lue) */
  nuancier:function(){return bqNuancierHtml(peintOrdre().map(function(j){return 'peinture:'+COSM.peinture[j].id;}));}, /* le rayon entier en HTML (intertitres de rareté compris) */
  etat:function(){let save=null;try{save=JSON.parse(localStorage.cashcarSave);}catch(e){}
    return {owned:(SAVE.d.owned||[]).slice(),own:SAVE.d.shop.own.slice(),eq:Object.assign({},SAVE.d.shop.eq),save:save};}});
