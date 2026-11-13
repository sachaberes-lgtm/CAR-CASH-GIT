/* ===== LE CATALOGUE DES ACHATS APP STORE (2026-11-07, Sacha : « les achats en vrai argent, via StoreKit ») =====
   Ce qui se vend en euros, et sous quel produit Apple. Les caisses : `CAR_UNLOCK[i].k==='premium'` hors lignes retirées (`carRetiree`),
   produit `cashcar.car.<shape>` ; les peintures à prix : `COSM.peinture` avec `eur` (hors `usine`), produit `cashcar.peinture.<id>`.
   Aucune palette en vente. `cle` = l'index de CARS (une caisse) ou `'peinture:<id>'` (la clé que `shopPaye` reçoit).
   ⚠ UN PRODUIT VENDU NE SE RENOMME JAMAIS : le `shape` d'une caisse et l'`id` d'une peinture SONT l'identifiant chez Apple. Un acheteur qui
   réinstalle retrouve ses achats par ces noms (restauration, voir `achatsResout`) même si la caisse a quitté la boutique (`retire`), si sa
   condition n'est plus `premium`, ou si la peinture est devenue une récompense de mission (son `eur` disparaît) : on cherche dans les TABLES du
   jeu, pas dans la liste « à vendre maintenant » (`produitsStore`, qui ne sert qu'à la boutique et aux prix). Ne jamais renommer ni supprimer. */
function produitsStore(){
  const L=[];
  for(let i=0;i<CARS.length;i++){
    const u=CAR_UNLOCK[i];
    if(!u||u.k!=='premium'||!carEnVente(i)||!u.eur)continue;
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
Object.assign(I18N,{"EN ATTENTE D'ACCORD":"WAITING FOR APPROVAL","1 ACHAT RESTAURÉ":"1 PURCHASE RESTORED","ACHATS RESTAURÉS":"PURCHASES RESTORED","AUCUN ACHAT À RESTAURER":"NOTHING TO RESTORE","RESTAURATION IMPOSSIBLE, RÉESSAIE":"RESTORE FAILED, TRY AGAIN","TES ACHATS SONT DÉJÀ LÀ":"YOUR PURCHASES ARE ALREADY HERE"});
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
    function(e){ACH_EN_COURS=false;
      /* (2026-11-10, banc adversaire : « débité, réponse perdue ») un échec qui n'est ni un refus du joueur ni une attente peut cacher un achat ENCAISSÉ (réseau coupé après le débit) : on redemande tout de suite à l'App Store ce qui est à toi */
      const c=e&&e.code;if(c!=='annule'&&c!=='attente')try{achatsSync(false);}catch(_){}
      throw e;});
}
function achatsBoutiqueOuverte(){ /* l'écran ACHAT de l'accueil est celui qu'on regarde (le routeur d'écrans lui pose la classe .on) */
  const e=document.getElementById('mShop');return !!e&&e.classList.contains('on');}
function achatsRafraichit(){try{GBQ.rk='';}catch(e){}if(achatsBoutiqueOuverte())try{shopRender();}catch(e){}}
function achatsResout(idProduit){ /* un id Apple → l'objet du jeu, DANS LES TABLES (R15) : jamais par la liste « à vendre maintenant » ; null = inconnu (ignoré, sans erreur) */
  if(typeof idProduit!=='string')return null;
  if(idProduit.indexOf('cashcar.car.')===0){
    const sh=idProduit.slice(12);let cle=-1;
    for(let i=0;i<CARS.length;i++){const c=CARS[i];if(!c||c.shape!==sh)continue;
      if(CAR_UNLOCK[i]&&CAR_UNLOCK[i].k==='premium'){cle=i;break;}
      if(cle<0)cle=i;} /* deux fiches de même forme : la premium d'abord */
    return cle<0?null:{type:'car',cle:cle};
  }
  if(idProduit.indexOf('cashcar.peinture.')===0){
    const id=idProduit.slice(17);
    if(id&&id!=='usine'&&COSM.peinture.some(function(d){return d.id===id;}))return {type:'peinture',cle:'peinture:'+id};
  }
  return null;
}
function achatsRecoit(idProduit,calme){ /* pose l'objet s'il manque : vrai si NOUVEAU, faux si déjà à toi ou produit inconnu */
  const p=achatsResout(idProduit);
  if(!p)return false;
  if(p.type==='car'){if(carOwned(p.cle))return false;shopDonne(p.cle,!!calme);return true;}
  const id=p.cle.slice(9); /* 'peinture:'.length */
  if(!SAVE.d.shop||!SAVE.d.shop.own||SAVE.d.shop.own.indexOf('peinture:'+id)>=0)return false;
  habDonne('peinture',id,!!calme);return true;
}
function achatsSync(restaure){ /* ce que l'App Store dit posséder ⇒ calme ; n'échoue JAMAIS, aucun toast : en cas d'erreur 0 (démarrage) ou -1 (RESTAURER : l'échec se distingue de « rien à restaurer ») */
  const A=window.ccAchat;
  if(!A)return Promise.resolve(0);
  return Promise.resolve().then(function(){
    const f=restaure&&typeof A.restaurer==='function'?A.restaurer:A.possedes;
    return f.call(A);
  }).then(function(L){
    let n=0,vus=0;(Array.isArray(L)?L:[]).forEach(function(id){try{if(achatsResout(id))vus++;if(achatsRecoit(id,true))n++;}catch(e){}});
    achatsSync.vus=vus; /* combien d'achats Apple le jeu RECONNAÎT (déjà posés ou non) : RESTAURER s'en sert pour ne pas dire « aucun achat » à qui les a tous */
    if(n)achatsRafraichit();
    return n;
  }).catch(function(){return restaure?-1:0;});
}
/* (2026-11-10, banc adversaire) DEUX DÉFAUTS PROUVÉS : (1) un double appui lançait deux demandes à Apple, et la seconde, arrivée après la première, écrasait
   « 2 ACHATS RESTAURÉS » par « AUCUN ACHAT À RESTAURER » : une seule demande en vol, les appuis suivants reçoivent la même réponse ; (2) à qui possède déjà tout
   (il vient d'acheter, ou le lancement a tout rendu) le bouton disait « AUCUN ACHAT À RESTAURER » : il dit maintenant que ses achats sont là. */
var ACH_REST_VOL=null;
function achatsRestaure(){ /* le bouton RESTAURER MES ACHATS : sans l'app, l'ancien toast */
  if(!window.ccAchat){toast(pxi('coche')+' '+TR('AUCUN ACHAT À RESTAURER'));return Promise.resolve(0);}
  if(ACH_REST_VOL)return ACH_REST_VOL;
  return ACH_REST_VOL=achatsSync(true).then(function(n){
    ACH_REST_VOL=null;
    if(n<0){toast(pxi('panier')+' '+TR('RESTAURATION IMPOSSIBLE, RÉESSAIE'));return n;} /* l'échec d'Apple n'est pas « rien à restaurer » */
    toast(pxi('coche')+' '+(n>0?(n===1?TR('1 ACHAT RESTAURÉ'):n+' '+TR('ACHATS RESTAURÉS')):TR(achatsSync.vus>0?'TES ACHATS SONT DÉJÀ LÀ':'AUCUN ACHAT À RESTAURER')));
    return n;
  });
}
/* ===== LA SYNCHRO REVIENT EN COURS DE SESSION (2026-11-10, banc adversaire : « la WebView recharge sous la feuille d'achat ») =====
   La synchro ne tournait qu'UNE fois, au démarrage. Si la page est rechargée pendant que la feuille d'Apple est ouverte (mise à jour en direct appliquée au passage
   en arrière-plan, processus web tué par iOS), le plugin natif termine l'achat et répond à une page qui n'existe plus : débité, terminé chez Apple, rien de posé
   jusqu'au lancement SUIVANT. On redemande donc ce qui est à toi (droits locaux de StoreKit, sans réseau ni mot de passe, calme, idempotent) au retour au premier
   plan et à l'ouverture de la page ACHAT ; pas plus d'une fois toutes les 3 s. */
var ACH_RESYNC_T=0;
function achatsResync(){
  if(!window.ccAchat)return;
  const t=Date.now();if(t-ACH_RESYNC_T<3000)return;
  ACH_RESYNC_T=t;achatsSync(false);
}
var ACH_PRIX_VOL=false;
function achatsPrix(){ /* les prix localisés d'Apple : au démarrage, puis de nouveau à l'ouverture de la boutique tant que la mémoire est vide */
  const A=window.ccAchat;
  if(!A||typeof A.produits!=='function'||ACH_PRIX_VOL)return Promise.resolve(0);
  ACH_PRIX_VOL=true;
  return Promise.resolve().then(function(){return A.produits(achatsIndex().L.map(function(p){return p.id;}));}).then(function(t){
    let n=0;
    if(t)for(const id in t){const x=t[id];if(x&&typeof x.prix==='string'&&x.prix&&achatsIndex().parId.has(id)){ACH_PRIX[id]=x.prix;n++;}}
    ACH_PRIX_VOL=false;
    if(n)achatsRafraichit(); /* les cartes déjà dessinées reprennent le prix d'Apple si l'écran ACHAT est là */
    return n;
  }).catch(function(){ACH_PRIX_VOL=false;return 0;});
}
function achatsPrixSiVide(){ /* à l'ouverture de l'écran ACHAT : la réponse d'Apple n'est pas encore venue (réseau, démarrage) ⇒ on redemande */
  if(window.ccAchat&&!Object.keys(ACH_PRIX).length)achatsPrix();
  achatsResync(); /* (2026-11-10) et les achats : voir achatsResync */
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
    try{document.addEventListener('visibilitychange',function(){if(!document.hidden)achatsResync();});}catch(e){} /* (2026-11-10) le retour au premier plan : voir achatsResync */
  }
  achatsPrix();achatsSync(false);
}
/* crochets du banc : on AJOUTE à dbgAchats (jamais de remplacement) */
window.dbgAchats=window.dbgAchats||{};
/* ⚠ publie-allege ne retire pas ce crochet (c'est un `||{}`) : dans l'app (EN_APP) `recoit` et `paye` sont INERTES (aucun cadeau sans Apple), `tables` rend null */
Object.assign(window.dbgAchats,{produitDe:produitDe,paye:function(cle){return EN_APP?Promise.reject(new Error('inerte')):shopPaye(cle);},sync:achatsSync,recoit:function(id,calme){return EN_APP?false:achatsRecoit(id,calme);},restaure:achatsRestaure,prix:achatsPrix,prixTxt:prixTxt,demarre:achatsDemarre,pop:shopPop,
  habPaye:function(id){return habPaye('peinture',COSM.peinture.findIndex(function(d){return d.id===id;}),null);},
  tables:function(){return EN_APP?null:{CARS:CARS,CAR_UNLOCK:CAR_UNLOCK,COSM:COSM,razIndex:function(){ACH_INDEX=null;}};}, /* le banc fausse les tables (caisse retirée, peinture sans eur) pour vérifier la restauration */
  nuance:function(id){const d=COSM.peinture.find(function(x){return x.id===id;});return d?bqNuanceEtat(d):null;}, /* l'état d'une pastille du nuancier (loupe, étiquette lue) */
  nuancier:function(){return bqNuancierHtml(peintOrdre().map(function(j){return 'peinture:'+COSM.peinture[j].id;}));}, /* le rayon entier en HTML (intertitres de rareté compris) */
  etat:function(){let save=null;try{save=JSON.parse(localStorage.cashcarSave);}catch(e){}
    return {owned:(SAVE.d.owned||[]).slice(),own:SAVE.d.shop.own.slice(),eq:Object.assign({},SAVE.d.shop.eq),save:save};}});
