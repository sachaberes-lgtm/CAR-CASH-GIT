/* ===== BOUTIQUE : LE RAYON DES TRAÎNÉES, LA PISTE (2026-11-07, Sacha : « dans la boutique les boîtes de Léo sont bien pour les voitures et achats, mais pas adaptées pour les peintures, traînées, figures… chaque type d'item doit avoir un système propre ») =====
   Une traînée est un EFFET EN MOUVEMENT, long et horizontal : la case carrée d'une voiture photographiée la tassait dans 100 px. Le rayon
   devient une PISTE : une voie par traînée, sur toute la largeur du panneau (deux voies côte à côte quand le panneau dépasse 520 px, sur
   l'ordinateur), avec à gauche la traînée qui coule DERRIÈRE une caisse (la plaque de nuit de traineeCarte, la caisse en pictogramme au bout)
   et à droite son nom et sa pastille de prix / À TOI / ÉQUIPÉE.
   · En haut, collée au haut de la liste, la RÉGLETTE DES FAMILLES (TOUT · RUBANS · PARTICULES · EFFETS · SPECTACLE, chacune à la couleur de sa
     rareté avec « à toi / total ») : toucher une famille ne garde qu'elle, la retoucher (ou TOUT) rend toute la piste. En TOUT, un intertitre
     d'une ligne ouvre chaque famille.
   · Toucher une voie = l'ESSAYER (le comportement de toujours : bqEssaie via le `.bqK` et son data-k) : la caisse la porte sur le plateau,
     son coup d'allumage rejoué toutes les 4,3 s (garageRender), sa phrase sous le nom (#gBqNom .tDesc), le bouton d'achat dit quoi faire.
   · ÉCONOME : seules les voies EN VUE s'animent (un IntersectionObserver pose .vit) ; les autres sont figées.
   Rien n'est réécrit dans le code partagé : bqTraineeRail (boutique-scene-1.js) n'appelle plus que trPisteHtml.
   `dbgTrPiste()` : l'état de la piste (banc). */
const TRV={fam:'',io:null,eqT:0,eqId:null};
const TRV_SOUS={commun:'RUBANS',rare:'PARTICULES',epique:'EFFETS',legendaire:'SPECTACLE'};
function trPrix(k,d){if(bqA(k))return {t:pxi('coche')+'<i class="trAt">'+sansAcc(TR('À TOI'))+'</i><i class="trEqT">'+sansAcc(TR('ÉQUIPÉE'))+'</i>',c:'acq'};
  if(d.pack==='chat')return {t:sansAcc(TR('PACK CHAT')),c:'eur'};if(d.eur)return {t:eurTxt(d.eur),c:'eur'};
  if(d.p)return {t:pxi('piece')+bqPxT(d.p),c:'pc'};return {t:pxi('verrou')+sansAcc(TR('MISSION')),c:'defi'};} /* (2026-11-07, passe finale) À TOI : la coche ; MISSION : le cadenas — comme les cartes des voitures */
function trVoie(k,n,f){const d=bqCos(k).d,ri=rarInfo(f),nom=sansAcc(TR(d.n)),px=trPrix(k,d);
  return '<div class="bqK trK hab r-'+f+'" data-k="'+k+'" data-fam="'+f+'" role="button" style="--rc:'+ri.c+';--tc:'+traineeCoul(d)+';--i:'+Math.min(n,8)+'" aria-label="'+nom.replace(/"/g,'')+'">'
    +'<span class="trVue">'+traineeCarte(d)+'<i class="trCaisse">'+pxi('voiture')+'</i></span>'
    +'<span class="trTx"><span class="bqKn">'+nom+'</span><span class="bqKp '+px.c+'">'+px.t+'</span></span></div>';}
function trPisteHtml(L){bqRayonRegarde('trainee'); /* (2026-11-07, passe finale) en entrant, on regarde la traînée PORTÉE (voir bqRayonRegarde) */const fam=function(k){return cosmRar('trainee',bqCos(k).d);},nb={},ok={},F=[];
  L.forEach(function(k){const f=fam(k);if(!nb[f]){nb[f]=0;F.push(f);}nb[f]++;if(bqA(k))ok[f]=(ok[f]|0)+1;});
  if(TRV.fam&&!nb[TRV.fam])TRV.fam='';
  const lib=function(f){return sansAcc(TR(TRV_SOUS[f]||rarInfo(f).n));};
  const fil='<div class="trFil" role="tablist" aria-label="'+sansAcc(TR('TRAÎNÉES'))+'">'
    +['' ].concat(F).map(function(f){const tot=f?nb[f]:L.length,a=f?(ok[f]|0):L.filter(bqA).length;
      return '<button type="button" role="tab" class="trCh'+(TRV.fam===f?' on':'')+'" data-trf="'+f+'" aria-selected="'+(TRV.fam===f)+'"'+(f?' style="--rc:'+rarInfo(f).c+'"':'')+'>'
        +'<span><b'+((f?lib(f):'').length>10?' class="lg"':'')+'>'+(f?lib(f):sansAcc(TR('TOUT')))+'</b><em>' /* (2026-11-07, passe finale) un nom long (SHOWSTOPPERS) passe un corps en dessous : la réglette tient à 375 px */+a+'/'+tot+'</em></span></button>';}).join('')+'</div>';
  const R=[fil];L.forEach(function(k,n){const f=fam(k);
    if(!n||fam(L[n-1])!==f)R.push('<div class="trSec" data-fam="'+f+'" style="--rc:'+rarInfo(f).c+'"><i>'+pxi(RAR_LOGO[f]||'etoile')+'</i><b>'+lib(f)+'</b><span>'+sansAcc(TR(rarInfo(f).n))+'</span><s></s></div>'); /* (2026-11-07, passe finale) « à toi / total » n'est dit qu'une fois : sur la réglette (comme le nuancier) */
    R.push(trVoie(k,n,f));});
  queueMicrotask(trApres); /* la piste est posée dans le rail juste après (garBqPanneau) : on la branche ensuite */
  return R;}
function trRail(){return document.querySelector('#gBqPan .bqRail');}
/* après chaque pose : le filtre, l'œil qui n'anime que les voies en vue, la pastille ÉQUIPÉE, le toucher de la réglette (une seule fois) */
function trApres(){const rail=trRail();if(!rail||!rail.querySelector('.trK'))return;
  rail.setAttribute('data-trf',TRV.fam);
  if(!rail._trF){rail._trF=1;rail.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.trCh');if(!b)return;e.stopPropagation();
    if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;const f=b.getAttribute('data-trf');TRV.fam=(TRV.fam===f?'':f);trFiltre(rail);
    try{uiPop(b);uiClic('onglet');hap(6);}catch(e9){}});}
  if('IntersectionObserver' in window){if(TRV.io)TRV.io.disconnect();
    TRV.io=new IntersectionObserver(function(E){E.forEach(function(x){x.target.classList.toggle('vit',x.isIntersecting);});},{root:rail,rootMargin:'24px 0px'});
    rail.querySelectorAll('.trK').forEach(function(el){TRV.io.observe(el);});}
  else rail.querySelectorAll('.trK').forEach(function(el){el.classList.add('vit');});
  TRV.eqId=null;trEqMaj();clearInterval(TRV.eqT);TRV.eqT=setInterval(trEqMaj,250);}
function trFiltre(rail){rail.setAttribute('data-trf',TRV.fam);rail.querySelectorAll('.trCh').forEach(function(b){const on=b.getAttribute('data-trf')===TRV.fam;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  rail.scrollTop=0;rail.querySelectorAll('.trK').forEach(function(el,n){el.style.setProperty('--i',Math.min(n,8));});}
/* ÉQUIPÉE : l'équipement change par le bouton (bqAction), le geste du bras le retire plus tard — la pastille suit l'état, pas le toucher */
function trEqMaj(){const rail=trRail();if(!rail||!rail.querySelector('.trK')||!GBQ.on){clearInterval(TRV.eqT);TRV.eqId=null;if(TRV.io){TRV.io.disconnect();TRV.io=null;}return;} /* sorti du rayon : plus de minuterie ni d'œil */
  let id='';try{const d=shopEqD('trainee');id=d&&shopOwned('trainee',d.id)?d.id:'';}catch(e){}if(id===TRV.eqId)return;TRV.eqId=id;
  rail.querySelectorAll('.trK').forEach(function(el){el.classList.toggle('eq',el.getAttribute('data-k')==='trainee:'+id);});}
window.dbgTrPiste=function(f){const rail=trRail();if(f!=null&&rail){TRV.fam=f;trFiltre(rail);}if(!rail)return null;
  return {fam:TRV.fam,voies:[...rail.querySelectorAll('.trK')].map(function(el){const r=el.getBoundingClientRect();return [el.getAttribute('data-k').slice(8),Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height),el.classList.contains('vit')?'vit':'',el.classList.contains('eq')?'eq':'',el.classList.contains('sel')?'sel':''];}),
    puces:[...rail.querySelectorAll('.trCh')].map(function(b){const r=b.getBoundingClientRect();return [b.getAttribute('data-trf')||'tout',Math.round(r.width),Math.round(r.height)];}),scroll:[rail.scrollTop,rail.scrollHeight,rail.clientHeight,rail.clientWidth]};};
