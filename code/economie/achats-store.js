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
function produitDe(cle){
  const L=produitsStore();
  for(let k=0;k<L.length;k++)if(L[k].cle===cle)return L[k].id;
  return null;
}
window.dbgProduits=function(){return produitsStore();};
window.dbgAchats={produitDe:produitDe};
