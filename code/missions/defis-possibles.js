/* ===== CE QUI SE GAGNE ENCORE — LE RELEVÉ (2026-11-21, Sacha : « dans la boutique, il y a plein de trucs qu'il faut changer maintenant […] Faut que tu regardes tous les défis,
   notamment les missions. Par exemple, le blanc de neige, il faut que tu le remettes payant parce qu'il n'y a plus de niveau sur les glaciers ») =====
   (banc) dbgDefisPossibles() rend TOUT ce qui se débloque, se gagne ou se demande, tel que le jeu l'a construit sur CET appareil : les voitures (CAR_UNLOCK après les patchs
   des missions), les missions (M2, avec m2Dispo), les habillages (COSM : défi, prix en dollars, prix en euros, mission, pack, série), le pass (inerte sans ?pass=1),
   la semaine de série, la machine à sous, et les maps / météos que JOUER tire ici (SF_CARTES moins SF_HORS, poids 0 exclus). Rien n'est écrit.
   Le juge vit hors du jeu (outils/defis-possibles/juge.cjs) : il croise ce relevé avec les compteurs que le code alimente encore. */
window.dbgDefisPossibles=function(){const J=function(o){try{return JSON.parse(JSON.stringify(o));}catch(e){return null;}};
  const cartes={};for(const k of Object.keys(SF_CARTES)){const M=SF_CARTES[k].m||{},m={};for(const x of Object.keys(M))m[x]=M[x].p==null?1:M[x].p;cartes[k]={hors:!!SF_HORS[k],map:sfMapDe(k),m:m};}
  const voitures=CARS.map(function(c,i){return {i:i,n:c&&c.name,retire:!!(c&&c.retire),rar:(function(){try{return carRar(i);}catch(e){return '?';}})(),u:J(CAR_UNLOCK[i]||null),
    enVente:(function(){try{return carEnVente(i);}catch(e){return null;}})()};});
  const missions=M2.map(function(m){let s=null;try{s=m2Seuil(m);}catch(e){}return {id:m.id,f:m.f,k:m.k,v:m.v,seuil:s,r:J(m.r),t:m.t,en:m.en,dispo:m2Dispo(m),sources:J(M2_CARTES[m.id]||null),jouable:m2Jouable(m)};});
  const hab={};for(const cat of ['peinture','aile','trainee','figure']){hab[cat]=(COSM[cat]||[]).map(function(d){return {id:d.id,n:d.n,r:(function(){try{return cosmRar(cat,d);}catch(e){return d.r||'?';}})(),
    p:d.p||0,pk:d.pk||0,eur:d.eur||'',def:J(d.def||null),exDef:J(d.exDef||null),mis:d.mis||0,mis2:d.mis2||'',pack:d.pack||'',sec:d.sec||'',serie:!!d.serie,ind:d.ind||'',d:d.d||''};});}
  let pass=null;try{pass={on:PASS_ON,pool:J(PASS_POOL_DEF)};}catch(e){}
  let serie=null;try{serie={lots:J(SERIE7.lots),sac:J(SERIE7.sac)};}catch(e){}
  let spin=null;try{spin={lots:J(SPIN.lots),epiques:(function(){const mis=spinEpiqueMis(),L=[];for(let i=0;i<CARS.length;i++)if(spinEpiqueOk(i,mis))L.push(i);return L;})()};}catch(e){}
  let bdj=null;try{bdj=bqCles();}catch(e){}
  let ecoMin=null;try{ecoMin=ecoDebutPrix();}catch(e){}
  let src=null;try{src={peinture:J(DEF_SOURCES),missions:J(M2_CARTES),prix:J(PEINT_PRIX_JEU),actif:DEF_POSSIBLES};}catch(e){}
  let tr=null;try{tr=J(I18N);}catch(e){}
  return {appareil:{ALLEGE:ALLEGE,TEL_NATIF:TEL_NATIF,LANG:LANG},cartes:cartes,voitures:voitures,missions:missions,hab:hab,pass:pass,serie:serie,spin:spin,boutiqueDuJour:bdj,ecoDebutPrix:ecoMin,sources:src,i18n:tr};};
