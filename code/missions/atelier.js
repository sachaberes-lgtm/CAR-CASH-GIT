/* ==================== LES MISSIONS DANS L'ATELIER (2026-09-30, Léo) ====================
   « Un point de vue face au garage, une ambiance sci-fi, des lignes qui montrent les missions réparties à différents endroits et
   reliées, un bouton JOUER ; on coche une mission pour la suivre, elle reste affichée discrètement pendant le jeu. »
   · LA CAMÉRA s'élève sous la porte relevée et regarde TOUT l'atelier (`GMIS.mk`, fondu en S dans garageRender : position, visée,
     objectif ; le décentrement du menu s'efface). JOUER la ramène derrière la caisse avant le lâcher (le RETOUR AU FEU la reprend).
   · LES ANCRES : chaque défi est ÉPINGLÉ sur un meuble (compresseur, établi, pont élévateur), la récompense au-dessus de la caisse,
     les deux carnets suivants sur le rack et le distributeur — un faisceau et un anneau d'hologramme en 3D (`gmHoloBuild`, matières
     déjà compilées : MeshBasic additif, sprite lampTex), un point-diamant DOM à l'endroit exact, une CARTE reliée par un filet.
     Les cartes s'écartent les unes des autres et restent dans l'écran (`gmSuit`, 8 passes) ; le fil de la constellation relie les
     points dans l'ordre : défi 1 → 2 → 3 → récompense → la suite.
   · SUIVRE : toucher un défi le coche (`SAVE.d.mis.f`, un seul à la fois, re-toucher = décocher) ; en course `#misFocus` le montre
     en bas, discret (consigne · avancement · jauge fine), vert 3 s quand il tombe. Carnet neuf ou défi réussi : plus de suivi. */
const GMIS={mk:0,e:0,v:new THREE.Vector3(),holo:[],
  ancres: // (Sacha a tranché) les ancres de SON écran rangé (f474c51)
         [{k:'d',i:0,p:[-9.3,2.3,2.6],pp:[-5.6,1.5,-12.2]},   // le compresseur, mur gauche (debout : l'étau, au bout de l'établi)
          {k:'d',i:1,p:[-4.4,2.2,-12.0],pp:[-2.7,1.4,-12.4]},  // l'établi, au fond (debout : son autre bout)
          {k:'d',i:2,p:[9.9,2.4,-10.3],pp:[4.8,2.0,-12.6]},   // le pont élévateur, au fond à droite (debout : le mur de l'affiche) — (2026-09-30) couché, 4,2 → 2,4 m
          {k:'r',p:[0,3.0,0]}]};        // la récompense, au-dessus de la caisse — (2026-09-30, « un peu brouillon ») les deux carnets SUIVANTS n'ont plus de carte ni de faisceau : une ligne dans la carte de la récompense
function gmHoloBuild(g){ // les hologrammes 3D des ancres : un faisceau (sprite) et un anneau au sol — opacité 0 hors de l'écran MISSIONS
  GMIS.holo=[];const rg=new THREE.RingGeometry(.4,.5,28);
  for(const a of GMIS.ancres){const col=a.k==='r'?0xffd75e:a.k==='n'?0x8f84c8:0x5ff0ff;
    const beam=new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    beam.scale.set(.5,a.p[1]+.5,1);beam.position.set(a.p[0],(a.p[1]+.5)/2,a.p[2]);g.add(beam);
    let ring=null;if(a.k!=='r'){ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
      ring.rotation.x=-Math.PI/2;ring.position.set(a.p[0],.05,a.p[2]);g.add(ring);}
    GMIS.holo.push({beam:beam,ring:ring,a:a});}
}
function gmHoloTick(t9){const e=GMIS.e;for(let i=0;i<GMIS.holo.length;i++){const h=GMIS.holo[i],o=e*(.34+.12*Math.sin(t9*2.7+i*1.3));
  h.beam.material.opacity=o;if(h.ring){h.ring.material.opacity=e*.8;const k=1+.12*Math.sin(t9*3.1+i);h.ring.scale.set(k,k,k);}}}
function gmRender(vu){ // vu : l'écran est déjà là (un défi coché) — les cartes ne rejouent pas leur entrée
  return m2Render(vu); /* (2026-10-16) LES MISSIONS v2 : la liste unique */
}
function gmSuit(){return gmSuitS();} // chaque image : le panneau MISSIONS se recale, les hologrammes suivent l'orientation
function gmHoloPlace(land){ // (2026-09-30) les hologrammes suivent l'ancre de l'orientation (voir `pp`)
  for(const h of GMIS.holo){const q=(!land&&h.a.pp)||h.a.p;h.beam.scale.set(.5,q[1]+.5,1);h.beam.position.set(q[0],(q[1]+.5)/2,q[2]);if(h.ring)h.ring.position.set(q[0],.05,q[2]);}}
function gmPlaceL(W,H){ // couché : DEUX colonnes — la carte de la série à gauche sous le titre, la liste à droite au-dessus de JOUER (le CSS les pose : voir « L'ÉCRAN MISSIONS ÉPURÉ ») ; debout : UN panneau entre le titre et la barre du bas
  const L=$('gmListe');if(!L)return;const hd=$('gmHead'),bs=$('gmBas'),gm=$('gMis'),rh=hd&&hd.getBoundingClientRect(),rb=bs&&bs.getBoundingClientRect(),land=W>H*1.25;
  const bt=rb&&rb.height?rb.top:H-90,g0=rh&&rh.width?rh.left:16,A=L.querySelector('.glA'),Bk=L.querySelector('.glB'),px=function(v){return Math.round(v)+'px';};
  L.classList.toggle('land',land);if(gm)gm.classList.toggle('m2land',land);
  if(hd)hd.style.maxWidth=''; // (2026-10-22) la largeur de l'en-tête vient du CSS (la colonne de gauche couché)
  if(land){
    L.style.left=L.style.top='0px';L.style.right='0px';L.style.maxHeight='none';
    if(A)A.style.left=A.style.right=A.style.top=A.style.maxHeight='';
    if(Bk){const t2=(rh&&rh.height?rh.bottom:80)+12;Bk.style.left=Bk.style.width='';Bk.style.top=px(t2);Bk.style.maxHeight=px(Math.max(90,bt-12-t2));}
    return;}
  [A,Bk].forEach(function(e){if(e)e.style.left=e.style.right=e.style.top=e.style.width=e.style.maxHeight='';});
  const tp=(rh&&rh.height?rh.bottom:60)+10;
  L.style.left=px(g0);L.style.right=px(g0);L.style.top=px(tp);L.style.maxHeight=px(Math.max(120,bt-12-tp));
}
function gmSuitS(){ // chaque image : (2026-10-15) le panneau MISSIONS se recale si l'écran change ; les hologrammes suivent l'orientation
  {const W=VP.w,H=VP.h,now=performance.now();
   if(GMIS.lw!==W||GMIS.lh!==H||!GMIS.bT||now-GMIS.bT>600){GMIS.bT=now;GMIS.lw=W;GMIS.lh=H;gmPlaceL(W,H);}
   const land=W>H*1.25;if(GMIS.land!==land){GMIS.land=land;gmHoloPlace(land);}}
}
/* (2026-10-05) MISSIONS depuis la VITRINE : l'écran des missions de l'atelier, et HOME / Échap y RAMÈNENT (pas au menu) */
function garMisRetour(){if(GAR.misVit){GAR.misVit=false;garMode('boutique');}else garMode('menu');}
$('gvCof').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic('nav');if(INV.on)invFerme();else invOuvre();}); // (2026-10-05) le COFFRE ouvre l'inventaire
$('gvMis').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic('nav');GAR.misVit=true;garMode('missions');});
function garMissionsOuvre(){ // la porte des MISSIONS, d'où qu'on vienne : l'écran de l'atelier
  if(garageOn){if(!GAR.go)garMode('missions');return;}
  if((started&&!gameOver)||pendingScore!=null)return;
  GAR.aMis=true; // (l'écran de mort passe par le routeur de la coque : voir mTap 'mis')
  ecranWipe(function(){if(garageOn){garMode('missions');GAR.aMis=false;return;}GAR.aMenu=true;openGarage();});
}
function garAccueil(){ // appelé par le routeur à chaque arrivée sur 'home'
  if((started&&!gameOver)||pendingScore!=null)return;               // une course tourne, ou un nom se saisit
  if(garageOn){if(!GAR.go)garMode('menu');return;}
  if(!garAccueil._vu||ecranWipe._on){garAccueil._vu=true;GAR.aMenu=true;openGarage();return;} // le 1er (sous l'écran de démarrage), ou déjà sous un voile
  ecranWipe(function(){if(garageOn||(started&&!gameOver))return;GAR.aMenu=true;openGarage();});
}
{const clicM=function(el,f){if(!el)return;el.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(el);f(el);});
   el.addEventListener('keydown',function(e){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();el.click();}});};
 clicM(document.querySelector('#gmBas .gmHome'),function(){uiClic('retour');garMisRetour();});
 clicM(document.querySelector('#gmHead .c6Ret'),function(){uiClic('retour');garMisRetour();}); // (2026-10-14, charte 6) le ◀ de l'en-tête = HOME (masqué sous c6)             // HOME : le menu (ou la VITRINE, si on en vient)
 clicM(document.querySelector('#gmBas .gmJouer'),function(e){garJouer();});                 // JOUER : la map des PLAY (voir « LE NIVEAU DES PLAY » ; la partie sans fin hors du hub), la mission suivie à l'écran
 {const nd=$('gmNoeuds');if(nd)nd.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go)return;
   m2Clic(e);}); /* (2026-10-16) LES MISSIONS v2 : suivre, récupérer, voir, TERMINÉES */
   nd.addEventListener('keydown',function(e){if((e.code==='Enter'||e.code==='Space')&&e.target.closest&&e.target.closest('.m2L,.m2Fin')){e.preventDefault();e.stopPropagation();e.target.click();}});}
}

function gSecoue(b){b.classList.remove('secoue');void b.offsetWidth;b.classList.add('secoue');hap([8,40,8]);} // le NON du garage : ça bouge, ça vibre, et un toast dit pourquoi
$('gEquip').addEventListener('click',e=>{e.stopPropagation();
  const b=e.currentTarget;if(b.classList.contains('arme')&&e.isTrusted)return; // (2026-09-29) le 2e tap d'un double-tap sur ACHETER n'équipe pas la caisse
  if(b.getAttribute('aria-disabled')==='true'){
    const vt=SHOP.tab==='voiture',ferme=vt?!carUnlocked(garageI):!shopOwned(SHOP.tab,COSM[SHOP.tab][SHOP.i[SHOP.tab]].id);
    if(!ferme){uiClic('nav');return;}                               // ÉQUIPÉE : un simple accusé — (2026-10-14, session SON) un tick, plus muet : tout bouton répond (sinon on rejouait la fanfare et réécrivait la sauvegarde)
    gSecoue(b);uiClic('refus');
    if(vt)toast(pxi('verrou')+' '+String(carUnlockText(garageI)).replace(/</g,'&lt;')); // boutique : les défis sont déjà listés sur la fiche
    return;}
  uiPop(b);
  if(SHOP.tab!=='voiture'){const c9=SHOP.tab,i9=SHOP.i[c9];if(shopEquip(c9,i9)){shopShow(c9,i9);hap(8);try{if(SONV2)sfx('ui.equipe');else fanfare();}catch(err){}}return;} /* (2026-10-14, session SON) équiper un habillage = ui.equipe SEUL (avant : appui principal PUIS equipe — la caisse, elle, n'avait que equipe) */
  if(!carUnlocked(garageI))return;                          // pas encore débloquée (condition propre à CETTE caisse)
  SAVE.d.equipped=garageI;SAVE.flush();
  level=garageI;levelCash=0;                                // la caisse choisie devient la caisse de départ — ⚠ plus de levelCash pré-rempli : il offrait un magot de départ égal au seuil de la caisse (la tirelire à 320 000 d'anciennes sessions venait de là)
  garageShow(garageI);                                      // rafraîchit l'étiquette du bouton
  try{if(SONV2)sfx('ui.equipe');else fanfare();}catch(err){} /* (console de son) équiper = le loquet + la quinte, pas la fanfare d'une victoire */
});
/* L'ACHAT. ⚠ on n'ÉQUIPE pas dans la foulée : acheter et choisir sont deux gestes, et les enchaîner
   ferait qu'un achat changerait la caisse de départ sans qu'on l'ait demandé. Le bouton ÉQUIPER
   s'allume juste à côté — le joueur décide. */
$('gRar').addEventListener('click',e=>{const b=e.target.closest('.gR');if(!b)return;e.stopPropagation();uiPop(b);uiClic('onglet');
  if(b.hasAttribute('data-f')){SHOP.filtre=b.getAttribute('data-f');if(SHOP.tab!=='voiture')gStripHabits(SHOP.tab,SHOP.i[SHOP.tab]);return;} // un FILTRE d'habillage
  const L0=rarListe(b.getAttribute('data-r'));if(!L0.length)return;const eq=SAVE.d.equipped|0;
  if(gModeM()==='shop'){GMODE.fam=b.getAttribute('data-r');garageFamilles(GMODE.fam);return;} // (2026-10-09) BOUTIQUE : la famille — (2026-10-10, Léo) elle ne change plus la caisse : seulement la bande, la caisse attend qu'on touche une vignette
  garageSaute(L0.indexOf(eq)>=0?eq:L0[0]);});
$('gStrip').addEventListener('click',e=>{const t=e.target.closest('.gT');if(!t)return;e.stopPropagation();uiPop(t);
  GSON9=false; /* (2026-10-14, session SON) le tick « nav » ne part qu'à la FIN du geste, et seulement si rien n'a sonné (équiper, bascule, carte) */
  if(t.hasAttribute('data-cos')){const j=+t.getAttribute('data-cos');if(SHOP.tab==='voiture'){uiClic('nav');return;}if(SHOP.tab==='figure'&&gFigTouche(j)){hap(8);return;} /* (2026-10-15) une figure à toi prend sa case (le sélecteur des trois figures) */if(garDesequipePeinture(j)){hap(8);return;} /* (2026-10-26) une peinture déjà équipée, retouchée : elle se retire */const eq9=garEquipeHabit(SHOP.tab,j);
    if(eq9||j!==SHOP.i[SHOP.tab]){shopShow(SHOP.tab,j);if(!eq9)try{if(SONV2){sfx('ui.carte',{vol:-3});GSON9=true;}else chimeNote(880,0,.16,.14);}catch(er){}}if(eq9)gInvSuite(SHOP.tab);if(GSON9)hap(8);else uiClic('nav');return;} // un habillage : à toi, il s'ÉQUIPE ; sinon on l'ESSAIE sur la caisse
  const i9=+t.getAttribute('data-car'),eq9=garEquipeCaisse(i9);if(i9!==garageI)garageSaute(i9);else if(eq9)garageShow(i9);if(eq9)gInvSuite('voiture');if(GSON9)hap(8);else uiClic('nav');}); // (2026-10-11) une caisse à toi s'ÉQUIPE au toucher
/* L'INVENTAIRE QUI ENCHAÎNE (2026-10-16, Sacha : « dans l'inventaire, une fois que tu as sélectionné une voiture, ça doit automatiquement
   t'emmener sur la page suivante pour la peinture, puis aile, ainsi de suite ») : en INVENTAIRE, une vignette à toi touchée (elle s'équipe)
   ouvre l'onglet d'après — VOITURES → PEINTURE → AILES → TRAÎNÉES → FIGURES ; FIGURES est le bout de la chaîne (on y range trois figures,
   il n'y a pas de « suivant »). Le temps de VOIR son choix sur la caisse : la bascule du plateau d'abord (~1 s pour une caisse), puis un
   battement ; un habillage, ,55 s. Un onglet touché à la main, une autre vignette, la console quittée : l'enchaînement s'annule de lui-même.
   uiGarde : la bande change sous le doigt, un second toucher trop vite équiperait la peinture qu'on n'a pas encore vue. */
const INV_ENCHAINE=false; // (2026-10-24, Léo : « dans l'inventaire on doit pouvoir sélectionner ET RESTER dans la même catégorie ») l'enchaînement VOITURES → PEINTURE → AILES… est coupé ; true = il revient
function gInvSuite(cat){clearTimeout(gInvSuite.t);gInvSuite.t=0;if(!INV_ENCHAINE||gModeM()!=='inv')return;const k=SHOP_CATS.indexOf(cat);if(k<0||k>=SHOP_CATS.length-1)return;
  let n=0,vu=0;const va=function(){gInvSuite.t=0;if(!garageOn||GAR.go||gModeM()!=='inv'||SHOP.tab!==cat)return;
    if(GAR.sw){vu=1;if(++n<40)gInvSuite.t=setTimeout(va,100);return;} // la caisse finit de se poser sur le plateau
    if(vu===1){vu=2;gInvSuite.t=setTimeout(va,220);return;}
    const nx=SHOP_CATS[k+1],b=document.querySelector('#gTabs .gTab[data-tab="'+nx+'"]');try{uiGarde(350);}catch(e){}if(b)uiPop(b);uiClic('onglet');shopTab(nx);};
  gInvSuite.t=setTimeout(va,cat==='voiture'?250:550);}
/* ÉQUIPER AU TOUCHER (2026-10-11, Léo : « quand on clique sur une voiture, ça l'équipe ; donc enlève le bouton ÉQUIPER ») : toucher une caisse
   ou un habillage À TOI (vraiment : pas seulement ouvert pour le TEST) l'équipe tout de suite ; le bouton ÉQUIPER ne se montre plus que pour
   ACHETER (voir « LE COIN DU GARAGE » : #gEquip:not(.achat) masqué) ; un achat équipe aussi. */
function garEquipeCaisse(i){const eq=SAVE.d.equipped|0;if(!(i>=0)||!CARS[i]||!(carUnlockedVrai(i)||i===eq))return false;
  if(i!==eq){SAVE.d.equipped=i;SAVE.flush();level=i;levelCash=0;try{if(SONV2){sfx('ui.equipe');GSON9=true;}}catch(e){}}return true;}
/* DÉSÉLECTIONNER UNE PEINTURE (2026-10-26, Léo : « quand on appuie sur une peinture sélectionnée, ça la désélectionne et laisse la couleur originale de l'ouverture ») :
   retoucher la peinture ÉQUIPÉE la retire — la caisse reprend sa teinte d'usine (la fiche D'ORIGINE, qui devient l'équipée). */
function garDesequipePeinture(j){if(SHOP.tab!=='peinture')return false;const d=COSM.peinture[j],u=COSM.peinture.findIndex(function(x){return x.id==='usine';});
  if(!d||u<0||d.id==='usine'||shopEqD('peinture')!==d||!shopEquip('peinture',u))return false;
  SHOP.prev=null;try{buildCar(CARS[equippedCar()]);}catch(e){}shopShow('peinture',u);try{if(SONV2)sfx('ui.off');}catch(e){}return true;}
function garEquipeHabit(cat,j){const d=COSM[cat]&&COSM[cat][j];if(!d||!shopOwned(cat,d.id))return false;
  if(shopEqD(cat)!==d&&shopEquip(cat,j)){SHOP.prev=null;try{buildCar(CARS[equippedCar()]);}catch(e){}try{if(SONV2){sfx('ui.equipe');GSON9=true;}}catch(e){}}return true;}
// aller DIRECTEMENT à une caisse (vignette, famille) — avec la bascule du plateau, comme les flèches
function garageSaute(i){if(GAR.go||i===garageI||!(i>=0))return; // (2026-09-28) GAR.go : même garde que garageGo — la caisse qui sort ne se change plus
  if(!garageOn||!GAR.root||GAR.sw){garageShow(i);return;}
  GAR.sw={t:0,fait:false,to:i};GSON9=true;try{if(SONV2)sfx('garage.bascule');else{chimeNote(880,0,.16,.14);noiseBurst(.35,.09,900);}}catch(e){}}
$('gBuy').addEventListener('click',e=>{e.stopPropagation();
  if(SHOP.tab==='voiture'&&e.currentTarget.dataset.bout==='1'&&garageOn&&!gEl.classList.contains('menu')){hap(8); // (2026-10-10) les OFFRES vivent dans la boutique du garage : ACHETER + le prix en € ouvre la fenêtre d'achat ICI, sur la caisse affichée
    let src=document.querySelector('#gStrip .fnC[data-fn="v:'+garageI+'"]')||document.querySelector('#gStrip .gT[data-car="'+garageI+'"]');if(!src)src=e.currentTarget;src.setAttribute('data-car',garageI);
    try{shopPop(src);return;}catch(er){}}
  if(SHOP.tab==='voiture'&&e.currentTarget.dataset.bout==='1'){uiClic('nav');hap(8); // LÉGENDAIRE : direction la BOUTIQUE
    // (2026-09-28) la boutique s'ouvre AU LEVER du voile (`apres`) : le clic simulé sur le bouton de l'accueil partait PENDANT le
    // fondu, et son propre ecranWipe était ignoré (garde `_on`) — ou en faisait un second. Pas dans `fn` : l'observateur de l'overlay
    // (bloc mobile) repose l'accueil juste après closeGarage et écraserait la boutique.
    ecranWipe(function(){closeGarage();},function(){if(!garageOn&&window.__mGo)window.__mGo('shop');});return;}
  if(SHOP.tab!=='voiture'){const c9=SHOP.tab,i9=SHOP.i[c9];{const d9=COSM[c9]&&COSM[c9][i9];if(d9&&d9.eur&&!shopOwned(c9,d9.id)){habPaye(c9,i9,e.currentTarget);return;}} /* (2026-10-16) une peinture en EUROS (voir habPaye) */ const r9=shopBuy(c9,i9);
    if(!r9.ok){if(r9.raison==='fonds-insuffisants'){gSecoue(e.currentTarget);uiClic('refus');toast(pxi('croix')+' '+TR('IL TE MANQUE')+' '+fmtC(r9.manque),true);}return;} /* (2026-10-14, session SON) toast muet : le refus a déjà dit « non » (avant : refus + erreur, deux non-non identiques) */
    garEquipeHabit(c9,i9);shopShow(c9,i9);hap([10,30,20,30,40]);pixBurst($('gCard'),26);gTampon(TR('À TOI !')); /* (2026-10-11) acheté = équipé */
    try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}else fanfare();}catch(err){}return;} /* (console de son) le tiroir-caisse, puis le TAMPON quand il s'abat (14 % de 1,9 s) — en mouvement réduit c'est un toast (ui.ok) */
  const r=carBuy(garageI);
  if(!r.ok){
    if(r.raison==='fonds-insuffisants'){gSecoue(e.currentTarget);uiClic('refus');toast(pxi('croix')+' '+TR('IL TE MANQUE')+' '+fmtC(r.manque),true);} // #msg est masqué au garage : c'est un toast qui parle
    return;
  }
  garEquipeCaisse(garageI); /* (2026-10-11) achetée = équipée : plus de bouton ÉQUIPER */
  garageShow(garageI);{const be=$('gEquip');if(be){be.classList.add('arme');clearTimeout(be._armT);be._armT=setTimeout(function(){be.classList.remove('arme');},420);}} // ÉQUIPER apparaît à la place d'ACHETER : il s'arme d'abord
  try{feteCaisse(garageI);}catch(err){} /* (2026-10-23) la fête, à la mesure de la rareté */
  pixBurst($('gCard'),26);hap([10,30,20,30,40]);gTampon(TR('À TOI !')); // le bouton disparaît, le compte se met à jour — et ça se FÊTE (tampon + « −$ » du compteur : plus de toast qui le redit)
  try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}else fanfare();}catch(err){} /* (console de son) ACHAT : tiroir-caisse + tampon « À TOI ! » */
});
// `buildPlayWord()` — LE JOUER SANS BULLE (2026-09-05 bis) : `#gPlayMain` n'a plus de textContent
// plat, il a une lettre par `<span class="lg gold">` — le MÊME traitement or extrudé que le logo
// CASH CAR (`.lg`/`::before` ombre/`::after` reflet, tout DÉJÀ écrit, rien à réinventer). Il faut UN
// nœud par lettre pour que `playWordWave` puisse retarder chacune indépendamment.
function buildPlayWord(){
  const el=$('gPlayMain');if(!el)return;
  const txt=TR('JOUER'); // ⚠ en CAPITALES comme tout le reste de l'UI (« Play » en bas de casse jurait sous le logo)
  el.innerHTML='';
  for(const ch0 of txt){
    const ch=ch0===' '?' ':ch0;
    const s=document.createElement('span');
    s.className='lg gold';s.setAttribute('data-t',ch);s.textContent=ch;
    el.appendChild(s);
  }
}
buildPlayWord();
/* (2026-09-30, nuit — Sacha : « prends le bouton sans fond JOUER de Léo et remplace le mien ») LE JOUER DE L'ACCUEIL = le mot de Léo :
   les mêmes lettres d'or grillées de cubes (voir <style id="accueilCiel">), la même vague d'écailles au toucher. La plaque .pbtn/.pb-gold
   cède la place à .mMot ; le routeur de l'accueil (data-m="play") reste le même : même départ, même son, même haptique. */
function mPlayMot(){const el=document.querySelector('#mHome .mPlay');if(!el)return;
  el.classList.remove('pbtn','pb-gold','big','wide');el.classList.add('mMot');el.setAttribute('aria-label',TR('JOUER'));el.innerHTML='';
  for(const ch of TR('JOUER')){const sp=document.createElement('span');sp.className='lg gold';sp.setAttribute('data-t',ch);sp.textContent=ch;el.appendChild(sp);}
  try{const gj=document.querySelector('#gJouer>span[data-fr="JOUER"],#gJouer>.gjMot');if(gj){gj.removeAttribute('data-fr');gj.className='gjMot';gj.innerHTML=''; // (2026-10-12, Léo : « je préfère le JOUER du ciel ») le JOUER du garage : le même mot, lettre par lettre
    for(const ch of TR('JOUER')){const sp=document.createElement('span');sp.className='lg gold';sp.setAttribute('data-t',ch);sp.textContent=ch;gj.appendChild(sp);}}}catch(e){}
}
function mPlayVague(x){const el=document.querySelector('#mHome .mPlay.mMot');if(!el)return;const L9=el.querySelectorAll('.lg');if(!L9.length)return;
  if(x==null){const r0=el.getBoundingClientRect();x=(r0.left+r0.right)/2;}
  L9.forEach(function(l){const r=l.getBoundingClientRect();l.classList.remove('pxScale');l.style.animationDelay='';void l.offsetWidth;l.style.animationDelay=Math.min(240,Math.abs((r.left+r.right)/2-x)*1.1).toFixed(0)+'ms';l.classList.add('pxScale');});}
try{mPlayMot();const e9=document.querySelector('#mHome .mPlay');if(e9)e9.addEventListener('pointerdown',function(e){mPlayVague(e.clientX);});}catch(e){}
// `playWordWave(clickX)` — LA VAGUE (2026-09-05 bis, demande du user : « une onde qui fait rebondir
// tous les autres pixels depuis le point cliqué »). Même animation (`pxScale`, l'écaille qui bascule
// — voir sa définition CSS) sur CHAQUE lettre, mais un `animation-delay` proportionnel à sa distance
// horizontale au clic : les lettres proches réagissent presque tout de suite, les lointaines suivent
// quelques dizaines de ms plus tard — c'est ce DÉCALAGE, pas l'animation elle-même, qui se lit comme
// une onde qui voyage plutôt qu'un mot qui bouge d'un bloc. `clickX` par défaut = centre du mot
// (déclenchement clavier, sans position de clic).
function playWordWave(clickX){
  const el=$('gPlayMain');if(!el)return;
  const letters=el.querySelectorAll('.lg');
  if(!letters.length)return;
  if(clickX==null){const r0=el.getBoundingClientRect();clickX=(r0.left+r0.right)/2;}
  letters.forEach(function(l){
    const r=l.getBoundingClientRect(),cx=(r.left+r.right)/2;
    const delay=Math.min(240,Math.abs(cx-clickX)*1.1);
    l.classList.remove('pxScale');l.style.animationDelay='';
    void l.offsetWidth; // force le redémarrage même si on reclique avant la fin de la vague précédente
    l.style.animationDelay=delay.toFixed(0)+'ms';
    l.classList.add('pxScale');
  });
}
$('gPlayMain').addEventListener('click',function(e){
  e.stopPropagation(); // le PLAY du garage : garJouer décide (la map des PLAY au hub, la partie sans fin dans la vitrine ?menu=leo)
  playWordWave(e.clientX); // ⚠ (2026-09-25) cet appel était COLLÉ au commentaire ci-dessus : la vague ne partait jamais
  setTimeout(garJouer,260); // (2026-09-30) le même départ que le JOUER du bas : 1er JOUER → le mode, caisse à l'essai → la tienne, auto-école
});
$('gPlayMain').addEventListener('keydown',function(e){
  if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();playWordWave();setTimeout(garJouer,260);}
});
$('gPrev').addEventListener('click',e=>{e.stopPropagation();uiPop(e.currentTarget);garageGo(-1);});
$('gTabs').addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('.gTab');if(!b)return;uiClic('onglet');uiPop(b);shopTab(b.getAttribute('data-tab'));});
// LA FICHE SE REPLIE (2026-09-24) : deux lignes de description suffisent, elle cachait le tiers bas de la caisse. Un tap la déplie.
$('gCard').addEventListener('click',e=>{if(e.target.closest('button,.pbtn'))return;e.stopPropagation();$('gCard').classList.toggle('ouvert');uiClic('nav');}); // (2026-09-28, charte règle 8) la fiche qui se déplie répond au doigt
$('gNext').addEventListener('click',e=>{e.stopPropagation();uiPop(e.currentTarget);garageGo(1);});
/* (2026-09-29, audit de sortie) UN SEUL DOIGT fait tourner l'atelier : le 2e (le pincement) écrasait le point de départ, l'orbite sautait
   d'un doigt à l'autre, et au relâcher le premier comptait pour un glissé — la caisse changeait. Rien ne passe à travers le voile. */
let gpId=null,gPince=false;
addEventListener('pointerdown',e=>{if(!garageOn||ecranWipe._on)return;if(e.target.closest&&e.target.closest('#gTop,#gBottom,#gFlot,#gmBas,#wipe,#modale,[data-m],#gInv,#gHub,#gTourne,#gHomeMini,#gBurnBtns,#gProf,#prof,#plq'))return; /* (2026-10-17) LA PLAQUE : le trophée et ses deux écrans ne font ni tourner l'atelier ni partir le burn-out */
  if(GBQ.on&&e.target.closest&&e.target.closest('#gBq'))return; /* (2026-10-15) en boutique, la page de vente n'est jamais un glissé du garage : ses boutons gardent leur clic, le reste est la scène de la boutique (bqScene) */ /* (2026-10-11) #gFlot : HOME et l'ŒIL flottants ne sont pas un glissé de la vue */
  if(!garageDrag&&atlVise(e)){ATL.appui=e.pointerId;return;} // (même soir) LE BOUTON ROUGE du plateau : ni vue ni plateau, il s'enfonce // (2026-09-30) [data-m] : un bouton de l'accueil n'est pas un glissé · (2026-10-04) le tiroir de l'INVENTAIRE non plus
  if(garageDrag){gPince=true;return;}
  garageDrag=true;gpId=e.pointerId;gPince=false;gpx=gpx0=e.clientX;gpy=gpy0=e.clientY;
  if(GAR.swK){GAR.vA=(GAR.vA||0)+(GAR.swO||0);garagePitch=THREE.MathUtils.clamp(garagePitch+(GAR.swP||0),.02,.82);GAR.swO=GAR.swP=GAR.swK=0;} // (2026-09-30) le balancement est VERSÉ dans le regard : pas de saut sous le doigt
  GAR.ret=null;GAR.tDoigt=performance.now(); // (LE RETOUR À LA PORTE) le doigt reprend la main, le compte à rebours repart
  if(!GAR.go){if(typeof GTN!=='undefined'&&GTN){GTN.gt=0;GTN.glisse=false;GTN.fixe=false;}GAR.vAc=(GAR.vA||0)+(GAR.vAv||0)*VITRINE_CAM.dLisse/2;GAR.vW=0;GAR.pT=garagePitch;GAR.mvT=performance.now();} // (le glissé fondu) on SAISIT la vue : elle s'arrête sous le doigt
  if(CHUTE&&CHUTE.on){CHUTE.mvT=performance.now();if(!CHUTE.go)chutePrend(e);} /* (2026-10-08, LE CIEL NE SE TOUCHE PLUS) le doigt ne saisit plus la vue : le tour continue dessous */ /* (2026-10-07, LA CAISSE AU DOIGT v2) posé SUR la caisse, le doigt la tient */ // (2026-09-30) au ciel : on SAISIT l'orbite, elle s'arrête sous le doigt
  if(!GAR.sw&&!GAR.go)GAR.pressT=GAR.PRESS_D; // LE TOUCHER : la caisse accuse la pression tout de suite, avant même qu'on glisse
  GAR.doigt=(garVueLeo()&&!GAR.go&&!(INV&&INV.on)&&e.button<=0&&garSurCaisse(e))?'caisse':'vue'; /* (2026-10-06) LA VUE DE LÉO : aussi dans la console de Sacha */ // (même soir) SUR la caisse, le doigt tient le PLATEAU — jamais la vue
  if(GAR.doigt==='caisse')GAR.platW=0; // le plateau lancé s'arrête sous le doigt
  burnDebut(e); // (2026-10-05) LA VITRINE : le doigt TENU sur la caisse lance le BURN-OUT (voir LE BURN-OUT) — l'inventaire a son bouton COFFRE (avant : invHoldDebut)
});
addEventListener('pointercancel',e=>{if(ATL.appui===e.pointerId)ATL.appui=null;if(BURN.hold&&BURN.hold.id===e.pointerId)burnFin();if(e.pointerId===gpId){garageDrag=false;gpId=null;CHUTE_TAP.tient=null;}if(INV.hold&&INV.hold.id===e.pointerId)invHoldFin();if(INV.mange===e.pointerId)INV.mange=null;});
addEventListener('pointerup',e=>{
  if(ATL.appui!=null&&ATL.appui===e.pointerId){ATL.appui=null;atlPresse();return;} // (même soir) le BOUTON ROUGE relâché : l'inventaire et ses outils
  if(INV.mange!=null&&e.pointerId===INV.mange){INV.mange=null;garageDrag=false;return;} // (inventaire) le relâcher du doigt TENU n'est ni un tap ni un glissé
  if(INV.hold&&INV.hold.id===e.pointerId)invHoldFin();
  if(BURN.hold&&BURN.hold.id===e.pointerId){const b9=BURN.on,m9=BURN.bouge,r9=BURN.hold.dit;burnFin(); // (BURN-OUT) le doigt se lève : le moteur retombe
    if(r9||b9&&(!m9||!gEl.classList.contains('vitrine'))){garageDrag=false;GAR.doigt=null;GAR.tDoigt=performance.now();GAR.vW=0;return;}} // tenu sur place : ni tap ni glissé — (2026-10-06) dans la console de Sacha, un burn-out relâché ne change JAMAIS de caisse
  if(garageDrag&&e.pointerId!==gpId)return;
  if(GAR.doigt==='caisse'&&garageDrag&&!gPince){const dx9=e.clientX-gpx0,dy9=e.clientY-gpy0; // (même soir) un glissé SUR la caisse : le plateau (ou le dérapage) — jamais l'élan de la vue
    if(Math.abs(dx9)>=14||Math.abs(dy9)>=14||BURN.bouge){
      if(!BURN.bouge){if(performance.now()-(GAR.mvT||0)>90)GAR.platW=0;else GAR.platW=THREE.MathUtils.clamp(GAR.platW||0,-7,7);} // lancé : le plateau file selon la vitesse du doigt
      GAR.vW=0;GAR.tDoigt=performance.now();garageDrag=false;GAR.doigt=null;return;}}
  if(garageDrag&&!gPince){
    const dx=e.clientX-gpx0,dy=e.clientY-gpy0;
    /* (2026-10-06, Léo : « quand on tourne la voiture dans la boutique, ça fait changer de voiture ») le glissé ne feuillette PLUS nulle part —
       ni au menu, ni en vitrine, ni dans la BOUTIQUE : il fait tourner la caisse, point. On change de caisse aux flèches ◀ ▶, aux vignettes
       ou au clavier (← →). Avant : un glissé de plus de SWIPE_PX à l'horizontale appelait garageGo au lâcher, même pour admirer la caisse. */
    if(Math.abs(dx)<14&&Math.abs(dy)<14){if(CHUTE&&CHUTE.on){if(!CHUTE.go)chuteTape(e);}else if(INV.on)invFerme();else{let af=null;try{af=afficheVise(e);}catch(_){}if(af)afficheTap(af);else{const sf9=burnDoigt(e.clientX,e.clientY,0,0,true);if(sf9)hap(6);if((!sf9||garSurCaisse(e))&&!GATL.on)garageImpact();}}} // (2026-10-03) AU CIEL : le tap est un COUP sur la caisse en chute (chuteTape) // ni glissé ni swipe : un TAP — sur une AFFICHE elle saute (voir afficheTap), sinon la caisse encaisse (voir garageImpact)
    GAR.tDoigt=performance.now(); // (LE RETOUR À LA PORTE) les 3 s partent du LÂCHER (et l'élan doit être retombé)
    if(performance.now()-(GAR.mvT||0)>90)GAR.vW=0;else{const m9=garVueLeo()?VITRINE_CAM.dElan:7;GAR.vW=THREE.MathUtils.clamp(GAR.vW||0,-m9,m9);} // (vitrine) un élan plafonné : le lancer glisse, il ne tourbillonne plus
    if(CHUTE&&CHUTE.on&&CHUTE_TAP.tient)chuteLache(); /* (2026-10-08, LE CIEL NE SE TOUCHE PLUS) lâché, le ciel n'a plus d'élan à prendre : seule la caisse tenue se balance */ /* (LE TOUR SANS FIN) lancée, l'élan retombe sur le tour lent, dans le sens du lancer */ // (2026-09-30) l'orbite du ciel : lâchée en mouvement, elle garde son élan // (le glissé fondu) doigt arrêté avant de lâcher : la vue reste ; lancé : elle file sur son élan
  }
  garageDrag=false;GAR.doigt=null;
});
addEventListener('pointermove',e=>{
  if(!garageDrag){ // (affiches) LE SURVOL à la souris : l'affiche s'allume, le curseur devient une main
    if(garageOn&&e.pointerType==='mouse'&&!GAR.go&&!(e.target.closest&&e.target.closest('#gTop,#gBottom,#gFlot,#wipe,#modale,#gInv,#gHub,#gTourne,#gHomeMini'))){let af=null;try{af=afficheVise(e);}catch(_){}
      if(af!==GAR.affH){GAR.affH=af;document.body.style.cursor=af?'pointer':'';}}
    return;}
  if(e.pointerId!==gpId||gPince)return;
  if(INV.hold&&INV.hold.id===e.pointerId&&Math.hypot(e.clientX-INV.hold.x,e.clientY-INV.hold.y)>12)invHoldFin(); // il GLISSE : ce n'est pas le geste tenu, la caisse tourne
  if(BURN.hold&&BURN.hold.id===e.pointerId&&Math.hypot(e.clientX-BURN.hold.x,e.clientY-BURN.hold.y)>(BURN.on?12:BURN_GLISSE)){if(BURN.on)BURN.bouge=true;else if(BURN.hold.non)BURN.hold=null;else BURN.hold.bouge=1;} // (BURN-OUT) avant le départ : le plateau tourne sous le doigt, et la CHARGE continue (2026-10-08 : avant, un glissé l'annulait) — sauf sur une caisse pas à toi (pas de « PAS ENCORE À TOI » à chaque tour de plateau) · en route : elle dérape
  if(CHUTE&&CHUTE.on&&!CHUTE.go&&CHUTE_TAP.tient){chuteTourne(e);gpx=e.clientX;gpy=e.clientY;return;} // (2026-10-07, LA CAISSE AU DOIGT v2) le glissé parti de la caisse la fait TOURNER, pas la vue
  if(CHUTE&&CHUTE.on&&!CHUTE.go){gpx=e.clientX;gpy=e.clientY;return;} // (2026-10-08, LE CIEL NE SE TOUCHE PLUS) AU CIEL, le glissé hors de la caisse ne bouge plus le ciel (avant : il tournait le regard, voir « L'ORBITE AU DOIGT »)
  if(GAR.go||gEl.classList.contains('missions'))return; // JOUER est parti / l'écran des MISSIONS : la vue ne se touche plus
  const leo9=garVueLeo(); // (2026-10-06) LA VUE DE LÉO : le glissé de la vitrine, aussi dans la console de Sacha
  if(gEl&&(gEl.classList.contains('menu')||leo9)){const vit9=leo9,dA=-(e.clientX-gpx)*(vit9?VITRINE_CAM.dPx:.007),n9=performance.now(),dm=Math.max(8,n9-(GAR.mvT||n9-16))/1000;
    if(vit9&&GAR.doigt==='caisse'){const dx9=e.clientX-gpx; /* (même soir, Léo : « quand on touche la voiture et qu'on la tourne, ça ne tourne pas le garage : appuie-glisse,
         la plateforme tourne selon la vitesse du doigt ; appuie et bouge, ça bouge juste la plateforme ; appui long puis glissé, la voiture dérape ») */
      if(BURN.on)burnGeste(dx9,e.clientY-gpy,e.clientX,e.clientY);                              // en burn-out : elle DÉRAPE, le doigt qui tourne autour la fait tourner — LE DONUT (voir LES GESTES DU BURN-OUT)
      else{const da=-dx9*.008;garageAng+=da;GAR.platW=(GAR.platW||0)*.55+da/dm*.45;}     // sinon : le PLATEAU suit le doigt (son bord avant sous le doigt), l'élan est retenu
      GAR.mvT=n9;GAR.tDoigt=n9;burnDoigt(e.clientX,e.clientY,dx9,e.clientY-gpy,false);} // (2026-10-07, soir) le doigt du geste avait cessé de pousser la fumée — remis (Léo : « au final c'était pas mal que le doigt, même quand on le glisse, touche la fumée ») ; le TAP la souffle
    else{GAR.vAc=(GAR.vAc!=null?GAR.vAc:(GAR.vA||0))+dA;GAR.vW=(GAR.vW||0)*.55+dA/dm*.45;GAR.mvT=n9;GAR.tDoigt=n9;if(vit9)burnDoigt(e.clientX,e.clientY,e.clientX-gpx,e.clientY-gpy,false);} // (BURN-OUT) le doigt pousse la fumée // (le glissé fondu) la CIBLE suit le doigt, la vitesse du geste est retenue pour l'élan
    if(!vit9)GAR.pT=THREE.MathUtils.clamp((GAR.pT!=null?GAR.pT:garagePitch)+(e.clientY-gpy)*.003,.08,.42);} // (2026-10-05, Léo : « c'est avec le doigt qu'on bouge le garage à 360° ») en VITRINE aussi : le tour complet de la vue, sans changer sa hauteur // (Léo : « on doit pouvoir voir derrière ») plus de borne : le tour complet // (2026-09-30, Léo) au MENU le doigt fait TOURNER LE REGARD autour de l'atelier, un peu (voir « LE GARAGE QUI VIT »)
  else{garageAng-=(e.clientX-gpx)*.01;if(!gEl.classList.contains('vitrine'))garagePitch=THREE.MathUtils.clamp(garagePitch+(e.clientY-gpy)*.006,.02,.82);} // (2026-10-04) en VITRINE le plan de présentation garde sa hauteur : le doigt tourne la caisse
  gpx=e.clientX;gpy=e.clientY;});
// ⚠ ORBITE BORNÉE À 7,8 m : au-delà on sortait par les murs et on traversait la servante et les
// piles de pneus. Le décor est rangé POUR ce rayon (rien de posé à moins de 8,3 m du centre).
addEventListener('wheel',e=>{if(!garageOn||PLQ.on||PLQ.prof)return;garageDist=THREE.MathUtils.clamp(garageDist+e.deltaY*.008,4.6,8.6);},{passive:true}); // plafond 7,8→8,6 (2026-09-05) : le zoom arrière par défaut est monté, la molette doit pouvoir suivre
addEventListener('keydown',e=>{if(!garageOn||ecranWipe._on||PLQ.on||PLQ.prof)return; /* (24/10, relecture : « Espace / I / P agissent-ils sur le garage derrière la plaque ? ») le profil ou l'atelier de la plaque ouverts par-dessus : le clavier ne touche plus le garage dessous (I ouvrait l'inventaire, les flèches changeaient la caisse, Entrée lançait la course) — comme la molette (preuve-clavier-profil) */if(GATL.on&&e.code==='Escape'){e.preventDefault();gAtelier(false);return;}if(INV.on){if(e.code==='Escape'||e.code==='KeyI'){e.preventDefault();invFerme();}return;}if(e.code==='KeyI'&&!e.repeat&&garAtelierLibre()){invOuvre();return;} /* (2026-10-04) L'INVENTAIRE au clavier : I l'ouvre, I ou Échap le referme */ if(e.code==='Escape'){if(!GAR.go&&gEl.classList.contains('missions'))garMisRetour();else if(!GAR.go&&!gEl.classList.contains('menu')&&(gModeM()==='shop'||gModeM()==='tous')){uiClic('retour');gModeVa('shop');} /* (2026-10-12, passe qualité) en BOUTIQUE, Échap = ◀ RETOUR (le même chemin que la touche), pas la sortie du garage */ else if(!GAR.go&&!gEl.classList.contains('menu')){if(window.__mRetour)ecranWipe(closeGarage);else ecranWipe(function(){if(started&&gameOver)accueilRetour();garMode('menu');});}}else if(e.code==='ArrowLeft')garageGo(-1);else if(e.code==='ArrowRight')garageGo(1);else if(e.code==='Enter'&&!e.repeat&&!document.querySelector('#modale.on')&&!gEl.classList.contains('shopRet')){e.preventDefault();garJouer();}}); // (passe qualité) pas de JOUER au clavier en BOUTIQUE : la touche JOUER y est masquée · même chemin que les flèches à l'écran (boutique comprise, premium exclues) · (2026-09-29) Entrée = JOUER, comme à l'accueil

// ---------- BOUCLE ----------
const fwdW=new THREE.Vector3(),tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),tmp3=new THREE.Vector3(),mat4=new THREE.Matrix4();
const camUp=new THREE.Vector3(0,1,0),qTmp=new THREE.Quaternion(),qTmp2=new THREE.Quaternion();
/* ---- DYNAMIQUE DE CAMÉRA — PREMIÈRE PASSE (2026-09-04) --------------------------------------
   Plainte du user : le suivi caméra est « stagnant » — la position/visée se recalculaient chaque
   frame sans aucune mémoire d'une frame à l'autre (à part le lerp de position déjà en place), donc
   rien ne « traînait » ni ne réagissait au MOUVEMENT lui-même, seulement à l'état instantané.
   Trois variables persistantes, ajoutées PAR-DESSUS le système existant (position/FOV/shake déjà
   là, on n'y touche pas) : `camLean` (roulis dans le virage, réagit vite), `camSwing` (glissement
   latéral, réagit plus LENTEMENT que le lean → la caméra a l'air TIRÉE vers l'extérieur du virage
   au lieu de pivoter sur place), `camKick` (poussée verticale au boost/nitro — l'écran « part en
   l'air » sur une accélération, retombe en douceur). ⚠ PREMIÈRE ITÉRATION, valeurs à affiner en
   jouant — les constantes ci-dessous (dans la boucle) sont un point de départ, pas un verdict.
   Hook : `dbgCam9()` renvoie l'état des trois pour régler à l'oreille... au clavier. */
let camLean=0,camSwing=0,camKick=0;
let last=performance.now();
// ---- LE TEST QUI TRANCHE POUR LE CLIGNOTEMENT DES NUAGES (2026-07-20) ----
// Tout ce qui pouvait faire clignoter les nuages CÔTÉ LOGIQUE a été mesuré STABLE (détection de
// surface sous mouvement caméra : 0 saut sur 47 400 transitions ; tri des transparents : 0 inversion
// sur 1 600 frames ; nuages dessinés : constant ; bascules matF/matB : 0 ; et le shader est
// DÉTERMINISTE — `ign()` ne dépend que de gl_FragCoord, `lightMarch` a un jitter fixe).
// Il ne reste donc qu'un mécanisme capable de changer l'image sans que rien ne bouge dans la scène :
// le RÉ-ÉCHANTILLONNAGE (DPR adaptatif + paliers perf), piloté par la charge GPU — laquelle monte
// précisément quand la caméra bouge et découvre des nuages. `dbgPin(1)` fige les deux : si le
// clignotement s'arrête net, la cause est là et nulle part ailleurs.
let RESPIN=false;
window.dbgPin=function(on){RESPIN=(on===undefined)?true:!!on;
  return {resolution_et_paliers_figes:RESPIN,dpr:+curDPR.toFixed(3),stepBase:null};};
/* (2026-10-14, sensations · passages) LES PASSAGES SE SENTENT DANS LA TÔLE. Une fonction qui ne fait que REGARDER (runStats.zones, mode,
   hopY) et répond par les outils communs, une fois par image ; elle ne calcule rien du jeu.
   · LE PORTAIL : le coup dans la main part à l'instant du passage (portailPasse). La tôle, elle, ne peut rien dire à cet instant — le
     voile couvre l'écran. C'est à l'ARRIVÉE, voile en train de s'ouvrir (½ s de jeu après), que la caisse S'ASSOIT sur ses ressorts
     (nez levé ≈ 2°, ≈ 3 cm) : elle débarque dans le nouveau monde au lieu d'y être collée. Au sol seulement.
   `tr` : secondes de course vivante (borné) · `z` : les zones déjà vues · `tp` : le compte avant le coup d'arrivée (s de jeu). */
const SENS_PA={rs:0,tr:0,z:0,tp:0,ro:null};
function sensPassages(dt){
  const vit=started&&!gameOver&&(mode==='drive'||mode==='fall');
  SENS_PA.tr=vit?Math.min(9,SENS_PA.tr+dt):0;
  if(SENS_PA.ro!==runStats){SENS_PA.ro=runStats;SENS_PA.tr=0;SENS_PA.tp=0;} // une partie NEUVE (resetGame refait `runStats`) : la boucle ne tourne pas pendant l'écran de fin, `tr` n'y retombait pas tout seul — le rejeu ne doit pas passer pour un replacement
  if(runStats.zones!==SENS_PA.z){if(runStats.zones>SENS_PA.z&&vit)SENS_PA.tp=.5;SENS_PA.z=runStats.zones;} // (une partie neuve remet zones à 0 : on se recale sans rien jouer)
  if(SENS_PA.tp>0){SENS_PA.tp-=dt;if(SENS_PA.tp<=0&&vit&&!REDUCED_MOTION)sensCoup(0,-.8,-.7);}
  /* LE REPLACEMENT (touche R, bouton « replacer » du menu de pause) : la caisse apparaissait FIGÉE sur sa ligne, à plat, comme collée.
     Elle se POSE : elle s'écrase sur ses ressorts (≈ 5 cm), le nez pique un rien (≈ 1,3°), deux bouffées de poussière aux roues arrière,
     un tic dans la main. Seulement en pleine course (`tr` > 1 s : ni au chargement, ni au départ, ni au rejeu — l'élan du départ est
     voulu sans cérémonie) et seulement si elle est posée à plat : les replacements qui la LÂCHENT de 2,2 m (bac à sable, parc, repêchage)
     ont déjà leur retombée (la retombée d'un petit saut, dans la boucle). */
  if(SENS_PA.rs){const ok9=SENS_PA.tr>1&&mode==='drive'&&hopY<=0&&!introD;SENS_PA.rs=0;
    if(ok9){sensHap(10,1);
      if(!REDUCED_MOTION){sensCoup(0,.5,-1.2);const sp9=CARS[level];
        if(sp9)for(let sd=-1;sd<2;sd+=2){DRIFT_V.set(sd*sp9.w*.45,.06,-sp9.l*.32);carGroup.localToWorld(DRIFT_V);sparkBurst(dust,DRIFT_V,2,2.5);}}}}
}
