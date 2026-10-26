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
/* ===== LE RAMASSAGE — pickupsTick, AU SOL ET EN VOL (2026-09-30) =====
   ⚠ BUG DE STRUCTURE : cette boucle vivait DANS la branche `if(mode==='drive'){…}` de `loop`. Sa garde (`mode==='drive'||mode==='fall'`)
   et tout son code de vol (couloir `lastNearS`, face du vol, AIMANT v3 « au sol comme en vol ») ne tournaient donc qu'à l'image EXACTE du
   décollage : en vol, RIEN ne se ramassait — ni l'or frôlé en DAUPHIN, ni un cristal traversé, ni l'aimant. Le correctif du 2026-08-18
   (plus bas) n'a jamais marché : vérifié au 1er commit du dossier (6541278), la boucle y était déjà dans la branche du sol. Elle est
   appelée des DEUX branches : au sol au même endroit (mêmes effets, même ordre), en vol juste après la pose de la caisse
   (`carGroup.position=fallPos`) et AVANT les figures, qui remettent `curNear` à zéro — le radar de dalle de tryLand (image d'avant),
   comme `lastNearS`.
   EN VOL, CE QUI EST ATTIRÉ ARRIVE — L'ACCROCHE (`p.hk` = secondes d'accroche, `p.hkD` = écart garanti). Au sol, une pièce tirée puis
   lâchée reste sur le bitume, ça ne se voit pas ; en vol la même loi aurait laissé, après chaque dauphin, des pièces SUSPENDUES entre
   la route et la trajectoire. Une pièce, un fruit, un cristal qui entre EN VOL dans la sphère d'attraction s'accroche : il file droit
   sur la caisse et l'écart fond d'au moins (1−f) par image quoi que fasse la caisse (f = dt·(RAM_K + RAM_A·accroche)). SIMULÉ (banc
   node ram-sim.js) : ≤ 0,13 s depuis 11 m, ≤ 0,25 s depuis les 50 m de l'aimant, de 144 à 1 900 km/h, sans jamais toucher le filet
   (posé sur la caisse à RAM_T s) ; une pièce DEVANT ne s'enfuit jamais vers l'avant, elle attend la caisse. Ça ferme aussi le TUNNEL :
   à 1 500 km/h la caisse fait 8 m par image, la fenêtre de 3,8 m tombait entre deux images — l'accroche à 11 m ne se rate pas.
   Accrochée, elle finit sa course même si l'on se pose ; un SAUT de caisse (> 150 m d'un appel à l'autre : replacement, portail) la décroche.
   Rien n'est alloué : deux nombres par objet, un vecteur (RAM.p0).
   LE DOSAGE — 11 m (14 avec la capacité moteur), GARDÉ après mesure contre le sol (banc node ram-banc.js : même route, pièces sur toute
   la largeur) : au sol dans l'axe à 500 km/h la caisse prend 28 % des pièces ; en dauphin à 4 m, 41 % ; à 8 m, 32 % ; à 12 m (le haut
   de la bande), 9 %. Voler BAS rapporte un peu plus que rouler — la prime du risque, à 4 m on est à une image de se poser — et voler
   haut, bien moins : le rouleur n'est pas lésé, le dauphin a enfin sa récolte. ⚠ À 1 900 km/h le SOL tombe à 18 % (sa fenêtre de 3,8 m
   tombe entre deux images, 8,8 m par image — pas touché ici : au sol rien ne change) ; le vol, accroché, reste à 40 %.
   LE JUMEAU : en longeant la tranche, la face du vol bascule d'une image à l'autre ; avec l'accroche, les deux copies d'une pièce
   pouvaient s'accrocher tour à tour et payer DEUX fois (ce que la passe qualité interdit, voir plus bas). Les jumeaux sont posés côte à
   côte dans `pickups` (face +1 puis −1 : `place`, cristaux, `ligneFruit`) → `pickups[i+face]` : EN VOL, un objet dont le jumeau est
   pris ou accroché est ignoré. AU SOL, RIEN NE CHANGE.
   Banc : `dbgRamasse()` (pris au sol / en vol, accrochés, filet), `dbgRamasse('raz')`. */
function ramD(P,Q,ax,R){ // (2026-10-14, chasse aux bugs) la distance caisse ↔ objet sur le TRAJET de l'image : Q (l'objet AVANT l'attraction de l'image) au segment RAM.pA → la caisse,
  // et P (après) à la caisse comme avant — la plus petite, comparée ensuite au MÊME rayon R. Un point si le trajet n'est pas balayé (RAM.bal).
  const B=carGroup.position,d0=P.distanceTo(B);if(!RAM.bal)return d0;
  const A=RAM.pA,dx=B.x-A.x,dy=B.y-A.y,dz=B.z-A.z,l2=dx*dx+dy*dy+dz*dz;
  if(ax){const hv=(Q.x-B.x)*ax.x+(Q.y-B.y)*ax.y+(Q.z-B.z)*ax.z,c=R*R-hv*hv;if(c>0&&l2<=4*c)return d0;} // le pas tient dans la corde d'un objet PILE dans l'axe (à sa hauteur) : le test en un point ne pouvait pas le sauter — rien ne change (60/120 i/s identiques)
  let t=((Q.x-A.x)*dx+(Q.y-A.y)*dy+(Q.z-A.z)*dz)/l2;t=t<0?0:t>1?1:t;
  const x=A.x+dx*t-Q.x,y=A.y+dy*t-Q.y,z=A.z+dz*t-Q.z;return Math.min(d0,Math.sqrt(x*x+y*y+z*z));}
const RAM_K=5.5,RAM_A=30,RAM_T=.5; // l'accroche : tirage de base (/s), sa montée par seconde d'accroche, le filet (s)
/* LA FACE DU VOL (2026-10-20, Sacha : « la voiture dans les airs, quand on passe près de la route, le jeu n'arrive pas à savoir où est le
   dessus et le dessous » — il y a toujours une sorte d'aimant bizarre avec la route tordue du niveau NUAGES). MESURÉ au banc (dbgPose + dbgStep) :
   la face se lisait au seul SIGNE de la hauteur au point de piste le plus proche (`curHOff < −THICK/2`), sans regarder où l'on est : une caisse
   qui passe à 45 m du bord (demi-route 28) et descend sous le plan de la dalle passait « SOUS la route » à −1,8 m et y restait à −120 m. Chaque
   passage du plan (une pente, un virage relevé, un saut qui longe la route) retournait la face, et l'aimant / l'accroche prenait les pièces
   du JUMEAU de l'autre face — à travers le bitume. Désormais UNE face par vol, avec mémoire : elle part de la face du décollage et ne change
   que si la caisse est vraiment AU-DESSUS ou EN DESSOUS de la dalle (dans sa largeur + VOLF.m), et d'au moins VOLF.h de l'autre côté du plan
   qu'elle quitte (hystérésis : plus d'aller-retour sur la tranche). Loin sur le côté : on garde la face d'avant. Même notion que `fallUnder`. */
const VOLF={m:6,h:.8};
function volFaceTick(){
  if(RAM.fv===0)RAM.fv=fallStartSide<0?-1:1;
  if(curNear&&Math.abs(curLatOff)<ROAD_HALF+VOLF.m){
    if(RAM.fv>0&&curHOff<-THICK-VOLF.h)RAM.fv=-1;
    else if(RAM.fv<0&&curHOff>VOLF.h)RAM.fv=1;
  }
  return RAM.fv;
}
function pickupsTick(dt){
  ninfTick(dt);fauraGlobalTick(dt);dragonDecor(dt);zapTick(dt);raisinTick(dt); // (2026-10-20) le temps PARTAGÉ des auras des fruits-pouvoirs : une écriture par image pour tous les fruits de la route
  const enVol=(mode==='fall');
  // (LIGNE PARFAITE) le fruit de la file se teste aussi sur le TRAJET de l'image — (2026-09-30) le trajet AU SOL seulement : en vol `s`
  // ne décrit plus la caisse ; le balayage repart de zéro au décollage (startFall) et reprend à la pose
  const sA9=LIGNE.sPk==null?s:LIGNE.sPk;if(!enVol)LIGNE.sPk=s;
  if(!enVol&&mode!=='drive')return;
  const sg9=RAM.ok?RAM.p0.distanceTo(carGroup.position):0,saut9=sg9>150;(RAM.pA||(RAM.q=new THREE.Vector3(),RAM.pA=new THREE.Vector3())).copy(RAM.p0);RAM.p0.copy(carGroup.position);RAM.ok=true; // > 150 m d'un appel à l'autre : la caisse a SAUTÉ (replacement, portail) — le plus grand pas légitime, 2 images à 0,05 s et 2 500 km/h, fait ~70 m
  /* (2026-10-14, chasse aux bugs, cadence 30 i/s) LE RAMASSAGE BALAYÉ — comme traficTick/satHard : tout se testait en UN point par image ; à 30 i/s (dt jusqu'à 0,05)
     la caisse fait 10-28 m par image, la portée de 3,8 m tombait entre deux images (au sol l'ancien code ratait dès ~1 080 km/h à 30 i/s, ~720 à 20 i/s ; preuve :
     banc/preuve-ramasse.cjs). On teste la distance de l'objet (avant l'attraction de l'image) au SEGMENT parcouru (ramD), même rayon, et seulement quand le pas dépasse la corde d'un objet dans l'axe (60/120 i/s inchangés). Seulement si ce segment est un trajet LÉGITIME : pas plus de 2 pas
     d'image à la vitesse du moment (+2 m) — un replacement (vA 26), un portail, un saut de 150 m retombent sur le test en un point, rien ne se ramasse en route. */
  RAM.bal=sg9>1e-6&&sg9<=(enVol?fallVel.length()*AIR_RATE:Math.abs(vA)*vitMult())*SPD*Math.max(dt,.05)*2+2;
  /* ⚠ BUG CORRIGÉ (2026-08-18) — ON NE POUVAIT PAS ATTRAPER LES FRUITS EN L'AIR, et c'était
     une CONTRADICTION DANS LE CODE, pas un réglage : le tour de boucle entier était gardé par
     `mode==='drive'`, et une ligne plus bas les grappes du ciel exigeaient `mode==='fall'`.
     Les deux conditions ne pouvaient jamais être vraies ensemble — les pickups aériens étaient
     donc INRAMASSABLES depuis toujours, silencieusement.
     La boucle tourne maintenant AUSSI en vol (⚠ faux jusqu'au 2026-09-30, voir en tête) :
       · AU SOL, la caisse est SUR le ruban : `s`, `lat` et `side` la décrivent, on s'en sert
         pour ne pas aspirer toute la route.
       · EN VOL, elle n'y est plus : ces trois valeurs ne veulent plus rien dire. Seule la
         distance 3D a du sens, et on pré-filtre sur `lastNearS` (où l'on en est le long de la
         piste pendant le vol) pour ne pas tester 550 objets par frame. */
  const MAG9=pwrMagT>0; // (pouvoirs v2) L'AIMANT : tout l'or et les fruits de la route viennent à toi (les cristaux restent à viser)
  /* L'AIMANT v3 — UNE SPHÈRE DE MAG_R MÈTRES (2026-09-29, Sacha : « l'aimant doit aimanter toutes les pièces, augmente grandement son
     rayon, genre 50 mètres »). La v2 ne prenait que ce qui était DEVANT (55 m, jamais derrière), laissait l'or du CIEL au sol, et en
     vol s'arrêtait à 34 m ; loin, elle tirait mollement (3/s). Désormais : tout ce qui est à moins de MAG_R m de la caisse, devant,
     derrière, sur les côtés, au-dessus — sur TA face de la route (l'autre face est le miroir de celle-ci, la prendre paierait deux
     fois). La traction est une loi FORTE (5 + 25·(1−d/R)² par seconde) : une pièce dépassée, à 4 m derrière une caisse à 200 km/h,
     doit encore la RATTRAPER — à 13/s elle s'arrêtait à 4,3 m, juste hors de portée du ramassage (3,8 m). */
  /* (2026-09-29, passe qualité) EN VOL, UNE SEULE FACE : chaque pièce, chaque fruit a son JUMEAU sous la dalle (miroir des deux faces). Au sol
     `side` départage ; en vol rien ne le faisait — sous AIMANT (sphère de 50 m) les deux copies étaient aspirées, l'une À TRAVERS le bitume,
     et les deux encaissées : argent, pièces moteur, séries et nitro des fruits comptés DEUX fois. La face du vol = le côté de la dalle où
     l'on vole (radar de tryLand : sous la dalle → −1, sinon +1). Les grappes du CIEL (`p.air`) n'ont pas de jumeau. (2026-09-30) Sans radar (1re image du vol) : la face du DÉCOLLAGE, plus +1 d'office. */
  const fV9=enVol?volFaceTick():(RAM.fv=0,side);RAM.face=fV9; // (2026-10-20) la face du vol : voir VOLF
  for(let i9=0;i9<pickups.length;i9++){
    const p=pickups[i9];
    if(p.taken)continue;
    const mag=engTier>=ENG_CAP.aimant?1:0,gros9=MAG9&&!p.pow&&!p.nitro; /* (2026-10-20, Léo : « l'aimant attire les PIÈCES seulement ») la pomme dorée n'attire plus les fruits */ // (2026-10-14, chasse aux bugs) RAM.q = l'objet AVANT l'attraction de l'image (ramD) — (OPTIMISATION) copié dans chaque branche APRÈS ses filtres bon marché : ~9 000 copies de moins par image en fin de partie, même valeur là où elle est lue
    if(p.hk>0){RAM.q.copy(p.mesh.position);if(saut9){p.hk=0;continue;}} // un saut de caisse DÉCROCHE : rien ne traverse la carte pour payer
    else if(enVol){ // EN VOL : le couloir, TA face, pas de jumeau — puis la sphère ACCROCHE
      if(Math.abs(p.s-lastNearS)>(gros9?MAG_R+40:70))continue; // pré-filtre bon marché le long de la piste, AVANT toute distance 3D
      if(p.face!==fV9&&!p.air)continue;                         // (passe qualité) pas le jumeau de l'autre face…
      if(!p.air){const tw=pickups[i9+p.face];if(tw&&tw.face===-p.face&&tw.s===p.s&&tw.lat===p.lat&&(tw.taken||tw.hk>0))continue;} // …ni celui dont le jumeau est pris ou en route (voir LE JUMEAU)
      // EN VOL L'AIMANT EST PLUS LARGE : viser une grappe en pleine parabole, sans volant, est déjà difficile — sans coup de pouce on
      // ne les attrape jamais. (v3) sous L'AIMANT, la sphère de MAG_R m.
      RAM.q.copy(p.mesh.position);const d9=p.mesh.position.distanceTo(carGroup.position);
      if(ramD(p.mesh.position,RAM.q,p.ax,gros9?MAG_R:11+mag*3)>=(gros9?MAG_R:11+mag*3))continue; // (2026-10-14, chasse aux bugs) le TRAJET de l'image (ramD), même rayon ; hkD reste l'écart réel
      p.hk=1e-4;p.hkD=d9;RAM.n[6]++; // ACCROCHÉ
    }else if(gros9){ // (v3) L'AIMANT AU SOL : la sphère
      if(Math.abs(p.s-s)>MAG_R+8)continue; // pré-filtre bon marché le long de la piste
      if(p.face!==fV9&&!p.air)continue; // (passe qualité) TA face seulement
      RAM.q.copy(p.mesh.position);const d9=p.mesh.position.distanceTo(carGroup.position);
      if(d9<MAG_R){const q9=1-d9/MAG_R;p.mesh.position.lerp(carGroup.position,Math.min(1,dt*(5+25*q9*q9)));magSpirale(p,d9,dt);}
    }else{
      if(p.face!==side)continue;
      const ds9=Math.abs(p.s-s);
      if(ds9>22+(RAM.bal?Math.abs(s-sA9)+sg9:0))continue; // (2026-10-14, chasse aux bugs) + le trajet balayé : sans lui, à 30 i/s et grande vitesse, la pièce sortait du couloir avant d'être testée
      if(p.air)continue;                        // les grappes du CIEL ne s'attrapent qu'en vol
      RAM.q.copy(p.mesh.position);
      // CAPACITÉ MOTEUR (V12 atmosphérique) : L'AIMANT À PIÈCES — elles viennent à toi de bien plus
      // loin, et plus vite. Sans lui, on garde l'attraction d'origine, discrète.
      if(ds9<15+mag*2&&Math.abs(p.lat-side*lat)<9+mag*2) // (2026-09-26) plus de `level` ici : c'est l'index de la caisse (66), l'aimant faisait 33 m sur les dernières // portée LATÉRALE de l'aimant à pièces (route large)
        p.mesh.position.lerp(carGroup.position,lisse60(6+mag*1.5,dt));
    }
    if(p.hk>0){ // ACCROCHÉ : il file sur la caisse — l'écart fond d'au moins (1−f) par image, quoi que fasse la caisse
      const f9=lisse60(RAM_K+RAM_A*p.hk,dt),P9=p.mesh.position;p.hk+=dt;
      P9.lerp(carGroup.position,f9);if(MAG9&&!p.nitro&&!p.pow)magSpirale(p,P9.distanceTo(carGroup.position),dt); // (pomme dorée) la pièce accrochée en vol tourne aussi
      const d9=P9.distanceTo(carGroup.position),dM=p.hkD*(1-f9);
      if(d9>dM&&d9>1e-6)P9.lerp(carGroup.position,1-dM/d9); // la caisse le distance : il est tiré sur la ligne qui les relie
      p.hkD=Math.min(d9,dM);
      if(p.hk>RAM_T){P9.copy(carGroup.position);RAM.n[7]++;} // le filet (jamais atteint en simulation)
    }
    if(ramD(p.mesh.position,RAM.q,p.ax,3.8+mag*.5)<3.8+mag*.5||(p.ligne&&mode==='drive'&&p.face===side&&Math.abs(p.lat-side*lat)<4.5&&Math.abs(s-sA9)<60&&(p.s-sA9)*(p.s-s)<=0)){ // (2026-09-26) portée FIXE (les objets ont grossi)
      const vol9=enVol||p.hk>0;p.taken=true;p.hk=0;scene.remove(p.mesh); // (une pièce instanciée sort d'elle-même du couloir au prochain LOD)
      RAM.n[(vol9?3:0)+(p.pow?2:p.nitro?1:0)]++; // (banc) pris au sol ou EN VOL — accroché en vol et arrivé après la pose, il compte en vol
      if(p.spin)spinPrend(p); /* (2026-10-14) LE FINAL SPIN : le jeton entre dans la sauvegarde */
      else if(p.pow){ // POUVOIR : le minuteur démarre (ou se CUMULE), l'écran l'annonce en couleur — (pouvoirs v2) tout vit dans pwrPrend
        pwrPrend(p.pow,p.mesh.position);
      }
      else if(p.nitro){ // chaque fruit rend SA dose de nitro (réglable dans l'ÉTAL)
        const fd=FRUIT_DEFS[p.fruit]||FRUIT_DEFS[0],pw=Math.min(1,fd.boost/2);
        // (2026-09-26, user : « les fruits donnent du nitro BLEU ») : chaque fruit remplit la RÉSERVE BLEUE (la nitro la plus forte : poussée
        // 48 contre 30) de 20 % de la jauge — le bleu se voit sur la barre et sur l'anneau du bouton
        {const mx9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,av9=nitroX;nitroX=Math.min(2,nitroX+(p.ligne?(p.don||LIGNE.don):.2*mx9)); /* (2026-10-21, Sacha : « l'ancien système ») comme avant : le fruit remplit la RÉSERVE BLEUE */if(LIVRE.on){livre('n+:'+(p.ligne?'fruit.ligne':'fruit'),nitroX-av9);livre('n0:'+(p.ligne?'fruit.ligne':'fruit'),(p.ligne?LIGNE.don:.2*mx9)-(nitroX-av9));}if(p.ligne)LIGNE.pris[0]++; // (LIGNE PARFAITE) le fruit de la file rend de quoi tenir jusqu'au pad
         if(nitroX>av9+.01){if(SONV2)sfx('nitro.plein',{t:.14});nbPrend('x');}} /* (2026-10-21, Léo : « on voit directement la barre monter ») le fruit ne vole plus vers la barre : elle monte tout de suite */
        RUNX.fruits++;try{m2Fruit(fd.n);}catch(e){}hap(fd.boost>=1.5?[20,40,30]:11);
        if(SENS&&!REDUCED_MOTION)try{sensCoup(0,-(.45+.6*pw),-(.3+.35*pw));}catch(e){} // (2026-10-14, sensations · passages) LE COUP DE REINS du plein : le fruit rend sa nitro, la caisse S'ASSOIT d'un coup sur son train arrière (nez levé ≈ 1,2° la myrtille → 2,7° la pastèque, ≈ 1 à 2,5 cm) puis se repose — le jus, le croc et la main existaient, la tôle ne bronchait pas. Au sol seulement (sensCoup dort en vol).
        fruitCroque(carGroup.position,fd.jus||0xffd75e,pw,fd.n,!!p.ligne&&PADS_OFF); // ON CROQUE : jus, crunch, et la rafale qui monte
        // (le fruit ne touche PAS au moteur : il ne sert qu'au boost — ce sont les pièces qui l'améliorent)
        if(fd.boost>=1.5){ // LE GRAAL : la pastèque, ça se fête
          trickMsg('🍉 '+fd.n+' !',2);sparkBurst(sparkGold,carGroup.position,18,14);shake=Math.max(shake,.3);
        }else sparkBurst(fd.boost>=.8?sparkGold:sparkBlue,carGroup.position,fd.boost>=.8?8:5,7);
      }
      else{
        sparkBurst(sparkGold,p.mesh.position,FLOW.lv===4?14:8,FLOW.lv===4?11:8); // (2026-09-28) là où la pièce disparaît · (×3) en FRÉNÉSIE la gerbe grossit : la pièce vaut trois fois plus
        combo++;comboT=3;
        /* LA RÉCOLTE EN SÉRIE. Une pièce isolée ne donne RIEN en aura — sinon on récompense
           encore le simple fait d'avancer. C'est tous les 5 ramassages SANS laisser retomber le
           combo (fenêtre de 3 s) que la salve tombe, et elle grossit à chaque palier. */
        if(combo%5===0)chaineAura('RÉCOLTE ×'+combo,20,'recolte',true,SONV2,true); /* (console) muet : blip() joue piece.recolte */
        // ÉCONOMIE RÉGULÉE (2026-07-30) : on montait de caisse BEAUCOUP trop vite. La pièce vaut
        // ~2,3× moins et le combo se mérite (un palier toutes les 5 pièces, plafond ×4 au lieu de ×5)
        // → rendement max 8,8×denom contre 25×denom avant. La CHAÎNE DE FIGURES reste la vraie fortune.
        // LE MOTEUR MONTE À LA PIÈCE : c'est la ferraille ramassée qui paye le turbo
        addCoins(1);RUNX.coins++;flowAdd(.7,'route');if(p.grp)coinSerie(p);try{piece1Plus();}catch(e){} /* (2026-10-14) le « +1 » à côté de la caisse */
        /* (2026-10-14, sensations · passages) LA RÉCOLTE SE SENT. La 5e, la 10e, la 15e — celles où la salve d'aura tombe et où
           `piece.recolte` sonne — soulèvent la caisse d'un rien (≈ 1 → 2 cm : elle s'allège).
           (2026-10-15, Sacha : « enlève les vibrations à chaque fois qu'on ramasse des pièces ») LA PIÈCE NE VIBRE PLUS : ni le tic de
           chaque pièce, ni le tic net de la récolte. Le son et le soulèvement restent ; le téléphone ne vibre que pour ce qui compte. */
        if(SENS&&combo%5===0&&!REDUCED_MOTION)try{sensCoup(0,0,.15+.07*Math.min(4,combo/5));}catch(e){}
        const mult=Math.min(ECO3.recolte,1+.5*Math.floor(combo/5)); // (vague 3) ×1 · ×1,5 · ×2 · ×2,5 : sur une route dense la récolte ne retombait jamais — ×4 permanent
        const g=denom()*2.2*mult*(fever>0?2:1)*flowMult(); // × le FLOW
        money+=g;levelCash+=g;livre('$:piece',g);blip();addStyle(5);frenCash(g,p.mesh.position); // (×3) en frénésie : le « ×3 » jaillit de la pièce, la bande frappe
        checkUpgrade();
      }
    }
  }
}
/* =====================================================================================================================================
   LE BOUTON NITRO v3 — L'ÉCLAIR EN PIXELS QUI S'ENFONCE, ET LA VITESSE À DROITE DE LA BARRE DE BOOST (2026-10-12, Léo) — voir
   <style id="nitroEclair">. Le chemin du jour : un éclair 3D brillant, un cadran rond (« la jauge bizarre » : retiré), des arcs électriques
   (« qu'elle ne s'électrifie pas »), un bouton d'arcade rond et vernis (« nan, sans rond, vraiment PIXELS, qui s'appuie quand on appuie »).
   · L'ÉCLAIR est une GRILLE (NX3_G, la même silhouette que l'icône de la barre, en grand) dessinée case par case dans une toile de la taille
     de la grille, agrandie sans lissage (`image-rendering:pixelated`) : contour d'encre, biseau clair en haut à gauche, ombre en bas à droite,
     un reflet en diagonale, et une ÉPAISSEUR de NX3_T cases dessous. Appuyer l'ENFONCE : il descend d'une case à la fois, l'épaisseur
     disparaît (au lâcher il remonte, saute une case trop haut et retombe). La nitro qui BRÛLE le chauffe (palette claire) et l'entoure d'une
     lueur en CASES (deux anneaux) ; réserve bleue = bleu, nitro infinie = violet, à sec = gris et contour qui clignote rouge ; plein, la
     lueur respire. Un reflet blanc balaie les cases de temps en temps. Rien de 3D, aucun programme : ~700 cases, redessinées SEULEMENT
     quand quelque chose change (enfoncement, reflet, palette, lueur).
   · LA VITESSE (`#nxVit`, dans #nitroBar) : à droite de la barre de boost, en gros.
   Console : `dbgNitro3()` (état) · `dbgNitro3('k',1)` force la lueur · `dbgNitro3('p',1)` force l'appui.
   ===================================================================================================================================== */
const NX3_G=[ // 15 × 20 : la silhouette de l'éclair de la barre (pente, marche, pointe qui s'effile)
  '........######.',
  '.......######..',
  '......######...',
  '.....######....',
  '....######.....',
  '...######......',
  '..############.',
  '.############..',
  '.......######..',
  '......######...',
  '......#####....',
  '.....#####.....',
  '....#####......',
  '....####.......',
  '...####........',
  '...###.........',
  '..###..........',
  '..##...........',
  '.##............',
  '.#.............'];
/* (2026-10-24, passe perf 2e tour) LA JAUGE ET L'ANNEAU DE LA NITRO PAR CRANS PLUS LARGES sur les vieux téléphones : nitro tenue, la valeur change à chaque
   image — et le bouton (#tNitro : 18 règles, 402 déclarations, 16 descendants, un dégradé conique) est l'élément du HUD le plus cher à restyler et à repeindre
   (mesuré : 331 µs par recalcul à ×1, ~1,3 ms à ×4 ; la barre #nitroBar 542 µs). Crans [ANCIEN, MOYEN, RÉCENT] : l'anneau 2 % · 2 % · 1 % (d'origine), la barre
   1 % · 1 % · 0,5 % (d'origine) — deux fois moins de recalculs pendant la vidange ; le RÉCENT ne change pas. */
PAL.B.hudNitroQ=[50,50,100];PAL.B.hudBarQ=[100,100,200];
const NX3_T=3,NX3_M=3; // l'épaisseur (cases) · la marge autour (lueur 2 + contour 1)
const NX3={el:null,cv:null,cx:null,img:null,u32:null,vit:null,vN:null,v:-1,vT:0,vc:null,kmh:0,
  W:0,H:0,p:0,pv:0,pF:null,k:0,kF:null,t:0,gl:-1,glT:1.6,cle:'',m:null};
/* les PALETTES : [biseau, plein, reflet, ombre, épaisseur haute, épaisseur basse, lueur, contour] — l'or au repos, chauffé quand la nitro
   brûle, bleu en réserve, violet en nitro infinie (au repos et chauffé), gris à sec */
const NX3_PAL={
  or:  ['#fff3b8','#ffc21f','#ffe680','#e07a00','#b45200','#6e2a00','#ff8d2e','#1c0430'],
  feu: ['#ffffff','#fff0a0','#ffffff','#ffb02a','#ff7a1a','#b83e00','#ffb347','#1c0430'],
  bleu:['#ffffff','#b5c4ff','#e8edff','#4a68f0','#2a44c8','#16247a','#4a68f0','#0b0a2e'],
  vio: ['#ffe0dc','#ff4a3a','#ffb0a8','#ff1a0a','#c40a00','#6e0500','#ff4a3a','#1c0430'],
  vioF:['#ffffff','#ffc8c0','#ffffff','#ff4a3a','#ff1a0a','#6e0500','#ff4a3a','#1c0430'],
  sec: ['#a49cc4','#6e6890','#8a84aa','#4a4468','#332e50','#211d38','#ff5a6e','#1c0430']};
const NX3_RGB={};function nx3Rgb(h){let v=NX3_RGB[h];if(v==null){const n=parseInt(h.slice(1),16);v=NX3_RGB[h]=(255<<24|(n&255)<<16|(n>>8&255)<<8|n>>16)>>>0;}return v;} // ABGR (petit-boutiste)
function nx3Monte(){
  const el=document.getElementById('tNitro'),bar=document.getElementById('nitroBar');if(!el||!bar||NX3.el)return!!NX3.el;NX3.el=el;
  const gw=NX3_G[0].length,gh=NX3_G.length;NX3.W=gw+2*NX3_M;NX3.H=gh+2*NX3_M+NX3_T;
  NX3.m=new Uint8Array(gw*gh);for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)NX3.m[y*gw+x]=NX3_G[y][x]==='#'?1:0;
  const w=document.createElement('div');w.className='nx3';w.setAttribute('aria-hidden','true');
  const cv=document.createElement('canvas');cv.className='nx3Ecl';cv.width=NX3.W;cv.height=NX3.H;w.appendChild(cv);el.appendChild(w);
  el.style.setProperty('--nxW',NX3.W);el.style.setProperty('--nxH',NX3.H);
  NX3.cv=cv;NX3.cx=cv.getContext('2d');NX3.img=NX3.cx.createImageData(NX3.W,NX3.H);NX3.u32=new Uint32Array(NX3.img.data.buffer);
  const v=document.createElement('div');v.id='nxVit';v.setAttribute('aria-hidden','true');v.innerHTML='<b>0</b><i>KM/H</i>';bar.appendChild(v);
  NX3.vit=v;NX3.vN=v.firstChild;
  return true;
}
/* LE DESSIN, case par case : d = enfoncement en cases (−1 = le saut du lâcher … NX3_T = au fond), pal = palette, a = force de la lueur,
   g = position du reflet qui balaie (somme x+y, −1 = aucun), clig = contour rouge (à sec). Couches : l'éclair (1), son épaisseur (2), puis
   autour, à 1 case le contour d'encre, à 2 et 3 cases les deux anneaux de lueur. */
function nx3Dessine(d,pal,a,g,clig){
  const W=NX3.W,H=NX3.H,u=NX3.u32,m=NX3.m,gw=NX3_G[0].length,gh=NX3_G.length,M=NX3_M,T=NX3_T,P=NX3_PAL[pal];u.fill(0);
  const y0=M+d,ep=T-d,B=NX3.B||(NX3.B=new Uint8Array(W*H));
  const forme=function(x,y){x-=M;y-=y0;return x>=0&&y>=0&&x<gw&&y<gh&&m[y*gw+x]===1;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let b=forme(x,y)?1:0;if(!b)for(let k=1;k<=ep;k++)if(forme(x,y-k)){b=2;break;}B[y*W+x]=b;}
  const pres=function(x,y,r){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H&&B[Y*W+X])return true;}return false;};
  const cE=nx3Rgb(clig?'#ff5a6e':P[7]),g0=nx3Rgb(P[6])&0x00ffffff,cG1=(g0|Math.round(a*.78*255)<<24)>>>0,cG2=(g0|Math.round(a*.36*255)<<24)>>>0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=B[y*W+x],i=y*W+x;
    if(b===1){ // l'éclair : biseau en haut à gauche, ombre en bas à droite, deux reflets en long, et le balayage blanc
      const hg=!forme(x,y-1)||!forme(x-1,y),bd=!forme(x,y+1)||!forme(x+1,y),s=(x-M)+(y-y0);
      let c=hg?P[0]:bd?P[3]:(s===9||s===10||s===16)?P[2]:P[1];
      if(g>=0&&(s===g||s===g+1)&&!bd)c='#ffffff';
      u[i]=nx3Rgb(c);}
    else if(b===2)u[i]=nx3Rgb(forme(x,y-1)?P[4]:P[5]); // l'épaisseur : claire juste sous la face, sombre au fond
    else if(pres(x,y,1))u[i]=cE;                       // le contour d'encre
    else if(a>.02){if(pres(x,y,2))u[i]=cG1;else if(pres(x,y,3))u[i]=cG2;} // la lueur, en cases
  }
  NX3.cx.putImageData(NX3.img,0,0);
}
function nx3Tick(dt,kmh){
  if(!NX3.el&&!nx3Monte())return;
  if(!document.body.classList.contains('play'))return;
  const inf=pwrNitroT>0,res=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,plein=inf||(nitroR+nitroX)>=res-.01,sec=!inf&&(nitroR+nitroX)<.35;NX3.t+=dt;
  // LA VITESSE : 12 fois par seconde au plus, et seulement si le chiffre change (un texte réécrit = un recalcul de style) ; sa couleur suit la poussée
  NX3.kmh=kmh;NX3.vT-=dt;
  if(NX3.vT<=0){NX3.vT=.08;const v=Math.round(Math.max(0,kmh||0));if(v!==NX3.v){NX3.v=v;NX3.vN.textContent=v;}}
  const vc=inf?'inf':(nitroOn?(nitroBlue?'bleu':'on'):'');if(vc!==NX3.vc){NX3.vc=vc;NX3.vit.className=vc;}
  // L'APPUI : un ressort raide, rendu en CASES (l'éclair descend d'une case à la fois ; au lâcher il saute une case trop haut et retombe)
  const appui=NX3.pF!=null?NX3.pF:((keys.Space||keys.ShiftLeft||keys.ShiftRight||NX3.el.classList.contains('on'))?1:0);
  const rm=REDUCED_MOTION||document.documentElement.hasAttribute('data-reduced-motion');
  if(rm){NX3.p=appui;NX3.pv=0;}else{const h=Math.min(dt,.05)/2,w0=30,z=.4;for(let i=0;i<2;i++){NX3.pv+=(w0*w0*(appui-NX3.p)-2*z*w0*NX3.pv)*h;NX3.p+=NX3.pv*h;}
    if(NX3.p<-.34){NX3.p=-.34;NX3.pv=0;}else if(NX3.p>1.05){NX3.p=1.05;NX3.pv=0;}}
  const d=Math.max(-1,Math.min(NX3_T,Math.round(NX3.p*NX3_T)));
  // LA LUEUR : la nitro qui brûle (à sec, l'appui ne fait rien briller) ; pleine et au repos, elle respire
  const veut=NX3.kF!=null?NX3.kF:(nitroOn?1:0);NX3.k+=(veut-NX3.k)*Math.min(1,dt*(veut>NX3.k?16:6));
  const souffle=(plein&&!appui&&!rm)?.18+.16*Math.sin(NX3.t*5.2):0,a=Math.max(NX3.k,souffle);
  const aQ=Math.round(a*(rm?1:(.85+.15*Math.sin(NX3.t*31)))*6)/6; // la lueur par crans (des cases qui battent, pas un dégradé)
  const chaud=NX3.k>.5,pal=inf?(chaud?'vioF':'vio'):(chaud?(nitroBlue?'bleu':'feu'):(sec?'sec':'or'));
  const clig=sec&&!appui&&(Math.floor(NX3.t/.3)&1)===1;
  // le REFLET blanc qui balaie les cases : toutes les ~3,5 s (1,6 s quand la nitro est pleine)
  NX3.glT-=dt;if(NX3.gl<0&&NX3.glT<=0&&!rm&&!appui&&!sec){NX3.gl=0;}
  let g=-1;if(NX3.gl>=0){NX3.gl+=dt/.5;if(NX3.gl>1){NX3.gl=-1;NX3.glT=plein?1.6:3.5;}else g=Math.floor(-2+NX3.gl*36);}
  const cle=d+'|'+pal+'|'+aQ+'|'+g+'|'+clig;
  if(cle!==NX3.cle){NX3.cle=cle;nx3Dessine(d,pal,aQ,g,clig);}
}
window.dbgNitro3=function(a,b){
  if(a==='k'){NX3.kF=b==null?null:+b;return NX3.kF;}
  if(a==='p'){NX3.pF=b==null?null:+b;return NX3.pF;}
  return {monte:!!NX3.el,grille:NX3.W+'×'+NX3.H,k:+NX3.k.toFixed(2),enfonce:+NX3.p.toFixed(2),dessin:NX3.cle,kmh:Math.round(NX3.kmh||0),affiche:NX3.v,couleur:NX3.vc,nitro:nitroOn};
};
/* LA COUCHE DES GAINS QUI VOLENT (#ajVols) — (2026-10-12, Léo) elle portait aussi la JAUGE D'AURA (#ajCourse, masquée depuis le 15/10,
   retirée le 18/10 avec `?jauge=1`) ; elle porte les éclairs de NITRO qui tombent dans la barre de boost (voir LES GAINS QUI FLOTTENT). */
const AJ={vols:null,run0:-1,v3:null};
function ajMonte(){
  if(AJ.vols)return true;if(!document.getElementById('nitroBar'))return false;
  const v=document.createElement('div');v.id='ajVols';v.setAttribute('aria-hidden','true');document.body.appendChild(v);AJ.vols=v;
  AJ.v3=new THREE.Vector3();
  return true;
}
function ajSource(ch){
  if(ch){const c=document.getElementById('avCh');if(c&&c.classList.contains('on')){const r=zRect(c);if(r.width>0)return [r.left+r.width*.3,r.top+r.height*.4];}}
  const p=AJ.v3.copy(carGroup.position);p.project(camera);
  if(p.z<1&&p.x>-1.2&&p.x<1.2&&p.y>-1.2&&p.y<1.2)return [(p.x+1)/2*VP.w,(1-p.y)/2*VP.h-28];
  return [VP.w*.5,VP.h*.55];
}
/* =====================================================================================================================================
   LES GAINS QUI FLOTTENT, PUIS TOMBENT DANS LEUR JAUGE (2026-10-12, Léo : « quand on gagne de l'aura, n'importe quoi, ça arrive dans l'écran
   en mode flottement, et après ça tire, la gravité, vers la jauge — quand on fait des figures, quand on tombe sur un truc de nitro »).
   UN moteur pour l'AURA (→ le bout du plein de la jauge d'aura) et la NITRO (→ le bout orange de la barre de boost ; la réserve BLEUE des
   fruits → son bout bleu). Avant : l'aura filait en ligne presque droite en 0,7 s, et la nitro SAUTAIT dans la barre (avec un flash blanc
   sur toute la barre, km/h compris).
   · Le gain JAILLIT de là où il naît (la caisse à l'écran, la boîte de la chaîne qu'on encaisse) : un coup vers le haut, un peu de côté ;
   · il FLOTTE : l'air le freine, il plane en ondulant (~0,4 s) ;
   · puis la jauge l'ATTIRE : une gravité qui grandit avec le temps (un puits), la vitesse de travers freinée pour qu'il y plonge sans tourner
     autour ; il rapetisse en tombant. Il touche le bout du plein (suivi EN DIRECT : la jauge bouge pendant qu'il vole), la jauge le prend
     (elle bat, un anneau de pixels) — et c'est seulement LÀ qu'elle monte. La ressource est à toi dès la prise (la nitro se brûle tout de
     suite) : seul l'AFFICHAGE attend (`VOLG.n.r/x`, ôtés de la barre par la boucle).
   · Simulé à l'image (pas de keyframes) ; 12 en vol au plus — au-delà, ou en « Réduire les animations », le gain passe direct.
   · Les nitros nées ensemble (pose + figure + bump au même atterrissage) partent en UNE (elle grossit).
   Console : `dbgVols()` (en vol, nitro en attente) · `dbgVols('n',.5)` / `('x',.4)` / `('a',200)` lance un gain depuis la caisse.
   ===================================================================================================================================== */
var VOLG={L:[],pool:[],imp:[],rS:null,rN:null,rT:0,n:{r:0,x:0},fR:0,fX:0,nb:null,nbP:null,k:1,dR:0,vR:0,tR:0,dX:0,vX:0,tX:0,ch:0,chT:-1e9};
/* LE REMPLISSAGE QUI SATISFAIT (2026-10-12, Léo : « travaille juste le fait que ce soit satisfaisant quand ça se remplit — la dynamique ») :
   · les deux jauges se REMPLISSENT en ressort (ω 17, ζ ,5 : elles dépassent d'~16 % de ce qui arrive, reviennent, se posent en ~0,45 s) ;
     la barre de boost se VIDE, elle, sans traîner (la nitro qui brûle se suit à l'image) ;
   · à chaque arrivée le plein BAT (il gonfle, s'écrase, se pose) et un « plop » (ui.pop) sonne ; les arrivées ENCHAÎNÉES (< 0,65 s) montent
     la gamme (pentatonique) et tapent un peu plus fort — une série de gains se sent comme une série de pièces. */
var VOLG_W=17,VOLG_Z=.5,VOLG_GAMME=[0,2,4,7,9,12,14];
function volgRessort(dt,fR,fX){
  const k=Math.min(dt,.05)*VOLG.k,W2=VOLG_W*VOLG_W,D=2*VOLG_Z*VOLG_W; // (k : le ralenti du banc)
  if(fR<VOLG.tR-1e-4){VOLG.dR=Math.min(VOLG.dR,fR);VOLG.vR=Math.min(0,VOLG.vR);} // elle se vide : elle suit
  else{VOLG.vR+=((fR-VOLG.dR)*W2-D*VOLG.vR)*k;VOLG.dR+=VOLG.vR*k;}
  if(fX<VOLG.tX-1e-4){VOLG.dX=Math.min(VOLG.dX,fX);VOLG.vX=Math.min(0,VOLG.vX);}
  else{VOLG.vX+=((fX-VOLG.dX)*W2-D*VOLG.vX)*k;VOLG.dX+=VOLG.vX*k;}
  VOLG.tR=fR;VOLG.tX=fX;
  VOLG.fR=Math.max(0,Math.min(1,VOLG.dR));VOLG.fX=Math.max(0,Math.min(1-VOLG.fR,VOLG.dX));
}
function volgBat(el,a){ // le plein BAT : il gonfle, s'écrase, se pose (propriété `scale` seule : rien d'autre ne l'anime)
  if(!el||!el.animate)return;
  try{const an=el.animate([{scale:'1 '+(1+.3*a).toFixed(2)},{scale:'1 '+(1-.1*a).toFixed(2),offset:.38},{scale:'1 '+(1+.04*a).toFixed(2),offset:.7},{scale:'1 1'}],{duration:380,easing:'ease-out'});if(VOLG.k!==1)an.playbackRate=VOLG.k;}catch(e){} // (le ralenti du banc le ralentit aussi)
}
function volgMonte(){
  if(VOLG.pool.length||VOLG.L.length||!AJ.vols)return;
  for(let i=0;i<12;i++){const b=document.createElement('b');AJ.vols.appendChild(b);VOLG.pool.push(b);}
  for(let i=0;i<4;i++){const u=document.createElement('u');AJ.vols.appendChild(u);VOLG.imp.push(u);}
}
// la cible : le bout du plein de SA jauge (rectangles relus deux fois par seconde, la fraction suit chaque image)
function volgCible(k,o){
  if(k==='a'){const r=VOLG.rS;if(!r)return null;o[0]=r.left+3+AJ.fx*(r.width-6);o[1]=r.top+r.height/2;return o;}
  const r=VOLG.rN;if(!r)return null;o[0]=r.left+3+(k==='x'?VOLG.fR+VOLG.fX:VOLG.fR)*(r.width-6);o[1]=r.top+r.height/2;return o;
}
function volgLance(k,q,src,big){
  if(REDUCED_MOTION||document.hidden||!document.body.classList.contains('play')||!src)return false;
  volgMonte();
  if(k!=='a')for(const f of VOLG.L)if(f.k===k&&f.t<.12){f.q+=q;f.big=Math.min(1.6,f.big+.25);return true;} // née au même instant : elle grossit
  const el=VOLG.pool.pop();if(!el)return false;
  if(k==='a'){el.className='a';el.textContent='+'+fmtAura(q);}else{el.className='n '+k;if(!el.firstChild||el.firstChild.nodeType!==1)el.innerHTML='<i></i>';}
  const sg=Math.random()<.5?-1:1;
  VOLG.L.push({el,k,q,big,x:src[0],y:src[1],vx:sg*(40+Math.random()*110),vy:-(220+Math.random()*90),t:0,tF:.34+Math.random()*.12,d0:0,ph:Math.random()*6.3,c:[0,0]});
  return true;
}
// une nitro gagnée : elle vole si elle peut (`r` réservoir orange, `x` réserve bleue) ; sinon la barre bat tout de suite
function volgNitro(k,q){
  if(LEFIL.on)return false; /* (2026-10-25, LE FIL) plus d'éclairs qui traversent l'écran : la barre prend son éclat sur place (nbPrend, appelé par le refus) */
  if(!(q>.03)||!VOLG)return false;
  if(volgLance(k,q,ajSource(false),Math.min(1.5,.9+q*.6))){VOLG.n[k]+=q;return true;}
  return false;
}
/* (2026-10-15, perf-devtools — trace Chrome DevTools d'une course à pleine vitesse) RELANCER UNE ANIMATION SANS FORCER LA MISE EN PAGE.
   À chaque gain qui touche sa jauge, l'anneau (volgImpact), l'éclat de la barre (nbPrend) et la cellule d'aura (volgArrive) se relançaient
   par `void el.offsetWidth` : un recalcul synchrone des styles ET de la mise en page de tout le HUD, plusieurs fois par seconde à grande
   vitesse (~0,35 ms par image sur le Mac, offsetWidth + recalculs forcés). On ALTERNE deux animations jumelles (même dessin, autre nom),
   comme flashEcran : le nom change, le navigateur la relance à la même image, sans lecture forcée. Deux relances du même élément dans la
   même tâche = UNE (elles partaient déjà à la même image). */
function jumelle(el,a,b){if(el._jm)return;el._jm=1;Promise.resolve().then(function(){el._jm=0;});
  const x=el.classList.contains(a);el.classList.remove(x?a:b);el.classList.add(x?b:a);}
function volgImpact(x,y,c){const u=VOLG.imp.shift();if(!u)return;VOLG.imp.push(u);
  u.style.translate=Math.round(x)+'px '+Math.round(y)+'px';u.style.setProperty('--c',c);jumelle(u,'on','on2');}
function nbPrend(k){ // la barre de boost PREND : un éclat au bout du plein
  if(!VOLG)return;
  if(!VOLG.nbP){const nb=document.getElementById('nitroBar');if(!nb)return;const p=document.createElement('i');p.className='nbPrend';p.setAttribute('aria-hidden','true');nb.appendChild(p);VOLG.nbP=p;}
  const p=VOLG.nbP;p.style.setProperty('--px',(k==='x'?VOLG.fR+VOLG.fX:VOLG.fR).toFixed(3));p.classList.remove(k==='x'?'r':'x');p.classList.add(k);jumelle(p,'on','on2'); // (2026-10-15, perf-devtools) relancé sans offsetWidth : voir jumelle
}
function volgArrive(f,i,muet){
  VOLG.L.splice(i,1);f.el.style.opacity='0';VOLG.pool.push(f.el);
  let a=1;
  if(!muet){const now=performance.now();VOLG.ch=now-VOLG.chT<650?Math.min(VOLG_GAMME.length-1,VOLG.ch+1):0;VOLG.chT=now;a=1+.16*Math.min(VOLG.ch,4);
    } // (2026-10-12, Léo : « je ne l'entends plus accordé ; une pièce, je l'entends pas forcément ») le « plop » d'arrivée (ui.pop, sa gamme à lui) est RETIRÉ : il brouillait la mélodie des pièces — l'arrivée se VOIT (rebond, anneau)
  if(f.k==='a'){AJ.envol=Math.max(0,AJ.envol-f.q);AJ.enVol=Math.max(0,AJ.enVol-1);
    if(!muet&&AJ.el){jumelle(AJ.el,'prend','prend2');volgBat(AJ.seg,a);volgImpact(f.c[0],f.c[1],FLOW_CEL[Math.max(0,AJ.cur)]||'#5ee6ff');}}
  else{VOLG.n[f.k]=Math.max(0,VOLG.n[f.k]-f.q);if(!muet){nbPrend(f.k);volgBat(document.getElementById(f.k==='x'?'nitroX':'nitroR'),a);volgImpact(f.c[0],f.c[1],f.k==='x'?'#8fa4ff':'#ffb81f');}}
}
function volgVide(){for(let i=VOLG.L.length-1;i>=0;i--)volgArrive(VOLG.L[i],i,true);VOLG.n.r=VOLG.n.x=0;}
function volgMesure(){if(AJ.seg)VOLG.rS=zRect(AJ.seg);const nb=document.getElementById('nitroBar');if(nb)VOLG.rN=zRect(nb);}
function volgTick(dt){
  if((VOLG.rT-=dt)<=0){VOLG.rT=.5;apresMiseEnPage(volgMesure);} // (2026-10-17, HUD-MESURE) relus en fin d'image, quand ça ne force plus rien (voir apresMiseEnPage)
  if(!VOLG.L.length)return;
  dt=Math.min(dt,.05)*VOLG.k; // (k : le ralenti du banc, `dbgVols('ralenti',.1)`)
  for(let i=VOLG.L.length-1;i>=0;i--){const f=VOLG.L[i];f.t+=dt;
    if(!volgCible(f.k,f.c)||f.t>2.6){volgArrive(f,i,true);continue;}
    if(f.t<f.tF){ // IL FLOTTE : l'air le freine, il plane
      const dr=Math.exp(-dt*5.5);f.vx*=dr;f.vy*=dr;f.x+=f.vx*dt;f.y+=f.vy*dt;
    }else{ // LA JAUGE L'ATTIRE : une gravité qui grandit (un puits), le travers freiné
      const dx=f.c[0]-f.x,dy=f.c[1]-f.y,d=Math.hypot(dx,dy)||1;if(!f.d0)f.d0=Math.max(40,d);
      const ux=dx/d,uy=dy/d,vl=f.vx*ux+f.vy*uy,kt=Math.exp(-dt*7),a=2400+24000*(f.t-f.tF);
      const px=(f.vx-vl*ux)*kt,py=(f.vy-vl*uy)*kt,v2=Math.min(3200,Math.max(vl,0)+a*dt);
      f.vx=px+v2*ux;f.vy=py+v2*uy;
      if(d<=Math.max(7,Math.hypot(f.vx,f.vy)*dt)){volgArrive(f,i,false);continue;}
      f.x+=f.vx*dt;f.y+=f.vy*dt;
    }
    // le rendu : il éclôt (rebond), ondule tant qu'il flotte, rapetisse en tombant
    const t=f.t,pop=t<.1?.55+.6*t/.1:t<.2?1.15-.15*(t-.1)/.1:1,shr=f.d0?.45+.55*Math.min(1,Math.hypot(f.c[0]-f.x,f.c[1]-f.y)/f.d0):1,
      fl=Math.max(0,1-Math.max(0,t-f.tF)/.12),oy=Math.sin(t*10+f.ph)*3*fl;
    f.el.style.opacity=t<.06?(t/.06).toFixed(2):'1';
    f.el.style.transform='translate('+Math.round(f.x)+'px,'+Math.round(f.y+oy)+'px) translate(-50%,-50%) scale('+(f.big*pop*shr).toFixed(3)+')';
  }
}
function ajTick(dt){
  if(!AJ.vols&&!ajMonte())return;
  if(!document.body.classList.contains('play')){if(VOLG.L.length||VOLG.n.r||VOLG.n.x)volgVide();return;}
  if(auraRun<AJ.run0)volgVide(); // une NOUVELLE partie : rien en vol
  AJ.run0=auraRun;
  volgTick(dt); // les gains qui flottent puis tombent dans leur jauge (la nitro)
}
function loopWarn(b,nom,e){if(!((loop._crWarn|0)&b)){console.warn('créatures/musique · '+nom,e);loop._crWarn=(loop._crWarn|0)|b;}} // (2026-09-30) un bit par appel gardé : chaque panne se dit UNE fois, sans masquer celle du voisin
/* (2026-10-13, passe de sortie — perf-iphone7) BANC : LE COÛT D'UNE IMAGE ENTIÈRE. `renderer.info` se remet à zéro à CHAQUE render() du
   compositeur : seul, il ne montre que la dernière passe (l'ACES : 1 appel, 2 triangles). Armé, il additionne TOUTES les passes de l'image
   (ombre, scène, bloom, ACES, vignette moteur) et la puce se chronomètre là où le navigateur le permet (EXT_disjoint_timer_query_webgl2 —
   Chrome/Mac ; jamais en même temps que la sonde de la qualité). dbgCout(1) arme · dbgCout() lit · dbgCout(0) désarme. Éteint : zéro coût. */
const COUT={on:false,der:null,q:null,ext:null,att:[],gpu:[],cpu:[]};
function coutDebut(){const r=renderer.info;r.autoReset=false;r.reset();
  if(COUT.ext&&!QLT.q&&!COUT.q){try{const g9=renderer.getContext(),q=g9.createQuery();if(q){g9.beginQuery(COUT.ext.TIME_ELAPSED_EXT,q);COUT.q=q;}}catch(e){COUT.ext=null;}}}
function coutFin(){const r=renderer.info,g9=renderer.getContext();
  COUT.der={calls:r.render.calls,tris:r.render.triangles,pts:r.render.points,lignes:r.render.lines};
  COUT.cpu.push(performance.now()-QLR.t0);if(COUT.cpu.length>120)COUT.cpu.shift();
  try{if(COUT.q){const q=COUT.q;COUT.q=null;g9.endQuery(COUT.ext.TIME_ELAPSED_EXT);COUT.att.push(q);}
    for(let i=COUT.att.length-1;i>=0;i--){const q=COUT.att[i];if(g9.getQueryParameter(q,g9.QUERY_RESULT_AVAILABLE)){
      if(!g9.getParameter(COUT.ext.GPU_DISJOINT_EXT))COUT.gpu.push(g9.getQueryParameter(q,g9.QUERY_RESULT)/1e6);g9.deleteQuery(q);COUT.att.splice(i,1);}}
    if(COUT.gpu.length>120)COUT.gpu.splice(0,COUT.gpu.length-120);}catch(e){COUT.ext=null;COUT.q=null;}}
window.dbgSable=function(on){SANDBOX=!!on;return SANDBOX;}; // (2026-10-13, banc perf-iphone7) le bac à sable : la caisse se replace au lieu de mourir (mesures longues sans fin de partie)
window.dbgCout=function(on){ // (banc) — voir COUT
  if(on!=null){COUT.on=!!on;COUT.gpu.length=0;COUT.cpu.length=0;COUT.att.length=0;
    if(COUT.on&&COUT.ext===null){try{COUT.ext=renderer.capabilities.isWebGL2?renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2'):null;}catch(e){COUT.ext=null;}}
    if(!COUT.on)renderer.info.autoReset=true;}
  const st=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return {n:s.length,p50:+s[s.length>>1].toFixed(2),p90:+s[Math.min(s.length-1,(s.length*.9)|0)].toFixed(2),max:+s[s.length-1].toFixed(2)};};
  const cv=renderer.domElement,m=renderer.info.memory,pa=composer?composer.passes.filter(p=>p.enabled).length:0;
  return {on:COUT.on,image:COUT.der,gpu:st(COUT.gpu),cpu:st(COUT.cpu),chrono:!!COUT.ext,geo:m.geometries,tex:m.textures,progs:(renderer.info.programs||[]).length,
    toile:[cv.width,cv.height],px:cv.width*cv.height,dpr:+curDPR.toFixed(2),post:POST_ON,passes:pa,bloom:bloomPass?(bloomPass.enabled?[bloomPass.renderTargetsHorizontal[0].width,bloomPass.renderTargetsHorizontal[0].height]:0):null,
    ombre:renderer.shadowMap.enabled?sun.shadow.mapSize.x:0,ql:QL.k,vhd:VHD.on,qualite:typeof SAVE!=='undefined'&&SAVE.d?SAVE.d.q:null};};
/* (2026-10-14, passe perf mobile) LE NIVEAU DERRIÈRE L'ÉCRAN DE MORT, UNE IMAGE SUR N. Mesuré sur iPhone 7 émulé : pendant l'écran de fin le jeu
   dessinait encore ~286 appels et ~1 000 000 de triangles par image — le niveau entier, ombres et passes plein écran comprises — sous les cartes
   ET sous le voile du téléphone (`body.touch #overlay[data-ecran="dead"]::before`, opacité .9) : il ne reste que 10 % d'une image où plus rien
   ne se joue (endGame arrive APRÈS l'explosion, la simulation et la caméra sont arrêtées ; seuls le ciel, les nuages, l'eau dérivent). Un
   téléphone qui chauffe là rame à la partie suivante. `mortImg` = on ne redessine la scène 3D qu'une image sur N : ANCIEN 4, MOYEN 2, RÉCENT 1
   (chaque image, comme avant). Les autres images, RIEN n'est dessiné dans la toile : le navigateur garde l'image affichée (pas de dessin, pas
   de nouvelle présentation). On espace le DESSIN seulement : simulation d'ambiance, sons, cartes et carte MOTEUR (son tampon à elle) continuent.
   ⚠ les gardes : (1) seulement l'écran « dead » du téléphone, 1,5 s après son arrivée (le voile et les cartes sont posés) — accueil, atelier,
   étal, REJOUER remettent le compteur à zéro : leur 1re image est dessinée tout de suite ; (2) une toile redimensionnée (rotation) est VIDÉE
   par le navigateur : on redessine aussitôt ; (3) la sonde de qualité veut une vraie image ; (4) l'échelle de qualité (QL) ne conclut rien d'un
   écran où trois images sur quatre ne coûtent rien : son horloge `dprT` est tenue (elle repartait sinon en netteté, à payer au départ suivant).
   `dbgMortImg()` lit l'état ; `dbgMortImg(n)` force N sur le palier courant (banc). */
PAL.B.mortImg=[4,2,1];
const MORT_IMG={t:0,i:0,w:0,h:0,n:0,on:false,dt:0}; // dt : le temps des images sautées, rendu aux ticks d'ambiance à l'image dessinée suivante (voir loop)
function mortSaute(dt){
  const N=Math.max(PAL.b('mortImg',1)|0,PFR_ON?2:1); /* (2026-10-24) le téléphone au frais : une image sur deux au moins (voir PFR_ON) */
  if(N<=1)return false;
  if(!(gameOver&&TCTL.on&&!garageOn&&!stallOn&&!MENUV.retour&&overlay.style.display!=='none'&&overlay.getAttribute('data-ecran')==='dead')){MORT_IMG.t=0;MORT_IMG.i=0;MORT_IMG.on=false;return false;}
  MORT_IMG.t+=dt;
  if(MORT_IMG.t<1.5)return false;
  MORT_IMG.on=true;if(dprT<2.2)dprT=2.2;
  const c=renderer.domElement;
  if(c.width!==MORT_IMG.w||c.height!==MORT_IMG.h||QLR.sN>0){MORT_IMG.w=c.width;MORT_IMG.h=c.height;MORT_IMG.i=0;return false;}
  MORT_IMG.i=(MORT_IMG.i+1)%N;
  if(MORT_IMG.i===0)return false;
  MORT_IMG.n++;return true;
}
window.dbgMortImg=function(n){if(n!=null){PAL.B.mortImg[PAL.n]=Math.max(1,n|0);MORT_IMG.i=0;}return {N:PAL.b('mortImg',1),actif:MORT_IMG.on,depuis:+MORT_IMG.t.toFixed(2),sautees:MORT_IMG.n,ecran:overlay.getAttribute('data-ecran'),tel:TCTL.on};}; // (banc)
/* ====================== LA CADENCE STABLE — CAD (2026-10-14, passe perf mobile ; Sacha : « fluide même sur un iPhone 7 », « sans bugger ») ======================
   Un téléphone qui ne tient pas 60 images/s n'en affiche pas « 45 » : il alterne des images de 16,7 ms et de 33,3 ms au hasard, et c'est
   CETTE irrégularité que le joueur appelle « ça bug ». 30 images/s RÉGULIÈRES (une image d'écran sur deux, toujours la même) se lisent
   bien mieux. CAD cale donc la boucle sur 33,3 ms quand 60 ne tient pas, et la relâche quand la marge revient.
   · EN TEMPS, pas « une image sur deux » : on saute l'appel de rAF tant qu'il ne s'est pas écoulé 33,3 ms − une demi-période d'écran depuis
     la dernière image CALCULÉE. Sur un écran 60 Hz ça donne une sur deux, sur un 120 Hz une sur quatre, et quand iOS bride déjà l'écran à
     30 Hz (économie d'énergie) plus rien n'est sauté. La période d'écran = le plus petit intervalle entre deux rAF sur 90 appels, ramené
     à une fréquence connue (Safari arrondit les horodatages à 1 ms : on lit 16 ou 17, jamais 16,67).
   · Une image sautée ne fait RIEN (ni `last`, ni moyenne, ni anneau QLR) : le `dt` de la suivante vaut ~33 ms tout seul (borné à 50 ms
     comme toujours) — exactement le chemin déjà vécu quand iOS impose 30 Hz. La simulation ne change pas.
   · ON ENTRE (en course seulement, `cadence30`) quand plus d'un quart des images ratent la synchro (`QLR.p75` > 19 ms) de façon TENUE et
     « calme » (ni reconstruction de zone, ni retour d'onglet, ni 30 Hz imposé, ni essai de résolution de l'échelle QL en cours) :
     `cadenceTenue` = 1 s sur l'ANCIEN, 2 s sur le MOYEN. Et sur l'ANCIEN, DÈS LE DÉPART de la course (`cadenceDepart`) : mesuré, une
     course lui demande ~250 appels de dessin et ~1 M de triangles — il ne tient jamais 60 ; partir à 60, c'est lui offrir à CHAQUE partie
     les secondes hachées qu'on veut supprimer. S'il a de la marge (niveau léger, palier mal deviné), la règle de sortie le rend à 60 en 5 s.
   · ON SORT quand le TRAVAIL d'une image (processeur, de `QLR.t0` à la fin de `loop` : fiable même à 30 i/s) reste sous 10 ms pour plus
     de 9 images sur 10 pendant 5 s (10 ms : il reste 6,7 ms à la puce et au compositeur sur 16,7) : ESSAI de retour à 60. Si dans les 10 s
     la lenteur revient (1 s tenue), retour à 30 et MUR — 60 s, doublé à chaque échec jusqu'à 8 min (Safari ne chronomètre pas la puce :
     l'essai et le mur sont le filet ; quand la sonde `QLR.vrai` vient de dire > 13 ms, on ne tente même pas).
   · L'ÉCHELLE QL NE S'Y TROMPE PAS : calée, chaque image dure 33 ms — lue telle quelle, la règle (19 / 24 / 17,8 ms) y verrait de la lenteur
     et sabrerait la résolution. On lui donne la durée RAMENÉE À UNE IMAGE D'ÉCRAN (`ms9` = durée − (33,3 − période d'écran)) : à l'heure =
     16,7 ; en retard de 10 ms = 26,7. Toute la règle marche donc telle quelle « contre 30 », et le détecteur de 30 Hz imposé (`loop._r30`,
     qui lit `loop._ms` entre 29,5 et 37,5) ne se déclenche pas sur NOTRE cadence. `rawMs` reste la durée VRAIE (temps de course, moniteur).
   · `cadenceMonte` : calé, l'échelle peut-elle REMONTER ? ANCIEN oui (elle est tenue par `qlMin`, et à 30 i/s il regagne sa netteté) ;
     MOYEN non — sinon elle remplirait les 33 ms de qualité et le travail ne repasserait jamais sous 10 ms : il resterait à 30 pour toujours
     alors qu'il tient 60 un cran plus bas. Lui retourne d'abord à 60, PUIS remonte.
   Palier RÉCENT : sur l'ordinateur `CAD.ok` = 0 → un test faux par point d'accroche, rien d'autre ; sur un téléphone, voir CAD30_REC (2026-10-24). Hors course (accueil, garage, écran de fin) : jamais calé.
   Banc : `dbgCadence()` décrit, `dbgCadence(30)` force, `dbgCadence(60)` coupe et fige, `dbgCadence(0)` rend la main. */
/* (2026-10-14, décision de Sacha 3 h 30) ROUVERT (7 h 50) : le choc balayé de DEBUGGING est dans le jeu ; preuve perf/banc/chef/v13.cjs (trafic niv. 19, satellites au sol et en vol, 163 / 400 / 8 010 km/h, plein axe et de biais : 20/20 chocs à 30 i/s, 0 faux positif ; l'ancien code ratait). Avant : interrupteur fermé, à 20-30 i/s la caisse traversait le trafic. `dbgCadence(30)` force toujours au banc. */PAL.B.cadence30=[1,1,0];PAL.B.cadenceDepart=[1,0,0];PAL.B.cadenceTenue=[1000,2000,2000];PAL.B.cadenceMonte=[1,0,0];
/* ===== LE TÉLÉPHONE RÉCENT QUI CHAUFFE SE CALE AUSSI SUR 30 (2026-10-24, passe perf iPhone — Sacha, sur la question « quand l'iPhone chauffe, il ne tient
   plus 60 et le jeu saccade entre 17 et 45 i/s » : « 30 i/s stables si chaud ») =====
   MESURÉ dans l'app sur l'iPhone 13 Pro (CC BANC, puis Sacha à la main, enregistreur de PERF-PC) : froid, 58-60 i/s ; au bout de 3-4 min iOS bride la puce
   (sonde CPU ×2) et la course tombe à 17-45 i/s, irrégulière, alors même que l'échelle QL est descendue au cran 9-13. Le palier RÉCENT n'avait pas la cadence :
   il hachait. Désormais, sur un VRAI téléphone (TEL_NATIF) au palier RÉCENT, la même règle que MOYEN : 60 tant qu'il tient ; calé sur 33 ms quand plus d'un
   quart des images ratent la synchro pendant 2 s ; retour à 60 quand le travail repasse sous 10 ms (essai, puis mur de 60 s doublé). `cadenceMonte` RÉCENT = 0 :
   calé, l'échelle ne remonte pas — deux fois moins d'images ET pas plus lourdes, la puce refroidit (sur l'ordinateur CAD reste éteint : la colonne 3 n'y joue pas).
   `?cad30=0` = avant (RÉCENT à 60, haché). Le RÉCENT qui tient 60 ne voit aucune différence (règle d'or). */
const CAD30_REC=TEL_NATIF&&PAL.n===2&&!/[?&]cad30=0\b/.test(location.search);
const CAD={ok:(PAL.b('cadence30',0)||CAD30_REC)?1:0,on:false,gel:false,force:0,per:1000/30,ecran:1000/60,tol:1000/120,der:0,rp:0,eMin:99,eN:0,
  w:0,wMax:10,wh:0,calT:0,lT:0,vu:0,crs:false,calme:false,essT:0,murT:0,murD:30000,entrees:0,sorties:0};
const FPS_CAP=!/[?&]fps=0\b/.test(location.search); /* (2026-10-20) le plafond à 60 i/s — voir le début de loop */
/* (2026-10-20, Sacha : « beaucoup de freeze et de latence sur la version vercel ») LE PLAFOND EN IMAGES ENTIÈRES. L'horloge cumulée à 1000/60
   tombait entre deux images d'écran sur un écran qui n'est pas un multiple de 60 Hz — SIMULÉ : 90 Hz → 11 / 22 ms en alternance, 144 Hz →
   14 / 21 ms, 75 et 100 Hz idem (des à-coups là où l'écran était fluide), et sur un écran à ~61 Hz une image sautée chaque seconde. On saute
   désormais UNE IMAGE D'ÉCRAN SUR n, n entier = la fréquence ÷ 60 arrondie au-dessous : 120 Hz → 60 i/s, 240 → 60, 144 → 72, toutes à la
   même cadence ; sous ~110 Hz (60, 75, 90, 100) rien ne se saute. La période d'écran = la MÉDIANE des intervalles entre deux rAF sur 90 (le
   minimum, lui, sous-estime la période dès que les horodatages tremblent : simulé à 144 Hz ± 0,6 ms, n hésitait entre 2 et 3) ; un jeu qui
   rame allonge la médiane, n baisse, on saute moins — jamais trop. Le seuil est à mi-chemin entre (n−1) et n images d'écran. */
const FPS={rp:0,eN:0,n:1,per:1000/60,der:0,a:new Float32Array(90)};
function fpsSaute(now){ // en tête de loop : rend true si cette image d'écran se saute
  const d=now-FPS.rp;FPS.rp=now;if(d>2&&d<100)FPS.a[FPS.eN++]=d;
  if(FPS.eN>=90){FPS.a.sort();FPS.per=FPS.a[45];FPS.n=Math.max(1,Math.floor(1000/FPS.per/60+.2));FPS.eN=0;}
  if(FPS.n<2)return false;
  if(now-FPS.der<FPS.per*(FPS.n-.5))return true;
  FPS.der=now;return false;}
function cadSaute(now){ // en tête de loop : rend true si cette image d'écran se saute
  const d=now-CAD.rp;CAD.rp=now;if(d>3&&d<CAD.eMin)CAD.eMin=d;
  if(++CAD.eN>=90){const m=CAD.eMin;CAD.eN=0;CAD.eMin=99;CAD.ecran=m<7.7?1000/144:m<9.7?1000/120:m<12.6?1000/90:m<15?1000/75:1000/60;CAD.tol=CAD.ecran*.5;} // 30 Hz imposé (m ≈ 33) : on garde 60, rien ne se saute de toute façon
  if(CAD.on&&now-CAD.der<CAD.per-CAD.tol)return true;
  CAD.der=now;return false;}
function cadPose(v,now){if(v===CAD.on)return;CAD.on=v;CAD.gel=v&&!PAL.b('cadenceMonte',1);CAD.der=now;CAD.lT=0;CAD.calT=now;
  QLR.i=0;QLR.n=0; // l'anneau repart : les centiles ne mélangent pas des durées vraies et des durées ramenées
  if(v){CAD.entrees++;loop._ms=Math.max(CAD.ecran,(loop._ms||16)-(CAD.per-CAD.ecran));}else CAD.sorties++;}
function cadFin(now){ // en fin de loop (avant la sonde, qui attend la puce) : le travail de l'image, puis la décision
  const w=performance.now()-QLR.t0;CAD.w=CAD.w*.9+w*.1;CAD.wh=CAD.wh*.97+(w>CAD.wMax?1:0); // wh : compteur fuyant, ≥ 3 ≈ plus d'une image sur dix au-dessus de wMax
  const d=Math.min(100,now-CAD.vu);CAD.vu=now;
  if(CAD.force)return;
  if(!(started&&running&&!gameOver&&!garageOn)){CAD.crs=false;CAD.lT=0;if(CAD.on){cadPose(false,now);CAD.sorties--;}return;} // hors course : jamais calé (et ce n'est pas une « sortie »)
  if(paused)return; // en pause : l'état reste tel quel
  if(!CAD.crs){CAD.crs=true;CAD.lT=0;CAD.essT=0;if(PAL.b('cadenceDepart',0)&&!loop._r30)cadPose(true,now);return;} // le départ de la course
  if(!CAD.calme||QL.essai){CAD.lT=0;CAD.calT=now;return;}
  if(!CAD.on){const ess9=CAD.essT>0&&now-CAD.essT<10000;
    CAD.lT=QLR.p75>19?CAD.lT+d:0;
    if(CAD.lT>(ess9?1000:PAL.b('cadenceTenue',2000))){
      if(ess9){CAD.murT=now;CAD.murD=Math.min(480000,CAD.murD*2);} // l'essai de 60 a échoué : un MUR (60 s, puis 2, 4, 8 min)
      CAD.essT=0;cadPose(true,now);}
    else if(CAD.essT>0&&!ess9){CAD.essT=0;CAD.murD=30000;}} // l'essai a tenu 10 s : 60 est acquis, le mur repart de zéro
  else if(CAD.wh>=3||(CAD.murT>0&&now-CAD.murT<CAD.murD)||(QLR.vraiT&&now-QLR.vraiT<20000&&QLR.vrai>13))CAD.calT=now;
  else if(now-CAD.calT>5000){cadPose(false,now);CAD.essT=now;}}
window.dbgCadence=function(f){if(f!=null){const n=performance.now();f=+f;CAD.force=(f===30||f===60)?f:0;CAD.ok=(CAD.force||PAL.b('cadence30',0)||CAD30_REC)?1:0;if(CAD.force)cadPose(f===30,n);else if(!CAD.ok)cadPose(false,n);} // (banc) 30 force, 60 coupe et fige, 0 rend la main
  const n=performance.now();return {on:CAD.on,per:+CAD.per.toFixed(1),ecran:+CAD.ecran.toFixed(2),w:+CAD.w.toFixed(1),mur:(CAD.murT>0&&n-CAD.murT<CAD.murD)?Math.round((CAD.murD-(n-CAD.murT))/1000):0,entrees:CAD.entrees,sorties:CAD.sorties,force:CAD.force,auto:CAD.ok===1&&!CAD.force,essai:CAD.essT>0&&n-CAD.essT<10000,gel:CAD.gel,haut:+CAD.wh.toFixed(1),plafond:{actif:FPS_CAP,n:FPS.n,ecran:+FPS.per.toFixed(2)}};}; // (2026-10-20) plafond : une image d'écran sur n (fpsSaute)
/* ====================== HORS COURSE À 30 i/s — HC (2026-10-23, audit mobile, Sacha : « une version mobile fluide sans que ça baisse trop en qualité ») ======================
   CAD ne cale qu'EN COURSE : un accueil ou un garage laissé ouvert tournait à 60 i/s plein rendu (haute définition comprise) et chauffait comme une
   partie. Sur ANCIEN et MOYEN (CAD.ok), l'accueil et le garage se calent donc sur 33 ms, par le même saut en temps que CAD (une image d'écran sur
   deux sur 60 Hz, une sur quatre sur 120 Hz) : une image sautée ne fait RIEN, le dt de la suivante absorbe l'écart (borné à 50 ms). La durée lue par
   la règle de qualité est ramenée à une image d'écran (voir ms9 dans loop), le filet de VHD et la détection de 30 Hz imposé n'y voient donc rien.
   Palier RÉCENT : `hors30` = 0, aucun effet. `?hc=0` coupe (comparer). La course, la pause et l'écran de fin ne sont pas touchés. */
PAL.B.hors30=[1,1,0];
const HC={on:false,der:0,off:/[?&]hc=0/.test(location.search)};
function hcSaute(now){ // en tête de loop (après cadSaute, qui tient CAD.ecran à jour) : rend true si cette image d'écran se saute
  const hc=!HC.off&&(PAL.b('hors30',0)||PFR_ON)&&!CAD.on&&(!started||garageOn)&&!document.hidden;
  if(!hc){HC.on=false;return false;}
  if(HC.on&&now-HC.der<CAD.per-CAD.tol)return true;
  HC.on=true;HC.der=now;return false;}
function loop(now){
  requestAnimationFrame(loop);
  if(window.__introCouvre){loop._pn=now;last=now;return;} // (2026-10-22, Léo : « ça bug ») l'INTRO DU STUDIO couvre tout l'écran : dessous, le jeu ne calcule ni ne dessine rien (il faisait saccader le film, surtout sur un Mac chargé) — voir moteur/intro-161.js
  if(CAD.ok&&cadSaute(now))return; // (2026-10-14, passe perf mobile) LA CADENCE STABLE : cette image d'écran se saute, sans RIEN toucher — voir CAD
  if((CAD.ok||PFR_ON)&&hcSaute(now))return; /* (2026-10-24) le téléphone au frais aussi (voir PFR_ON) */ /* (2026-10-23, audit mobile) hors course (accueil, garage) : 30 i/s sur les vieux paliers — voir HC */
  /* (2026-10-20, Sacha : « Chrome à 94-96 % de CPU ») PLAFOND À 60 i/s : rAF suit la fréquence de l'écran — 120/144/240 Hz = 2 à 4× plus d'images
     calculées (physique, particules, bloom) pour rien. On saute l'image d'écran trop proche de l'échéance (horloge cumulée : pas de dérive,
     pas de « une sur deux » raté sur 144 Hz), sans RIEN toucher : le dt de la suivante absorbe l'écart, comme la cadence 30 Hz. Sur un
     écran 60 Hz (ou 30 Hz imposé) rien ne se saute. Coupé quand CAD cale déjà à 30 (même horloge, pas de double saut). `?fps=0` = sans plafond.
     (2026-10-20, même jour) une image d'écran sur n, n ENTIER — voir fpsSaute : l'horloge à 1000/60 hachait les écrans 75/90/100/144 Hz. */
  if(FPS_CAP&&!CAD.on&&!HC.on&&fpsSaute(now))return;
  if(BANC_ON)BANC_T0=performance.now(); // (banc ?banc=1) début de l'image chronométrée
  QLR.t0=performance.now(); // (tour 2) début de l'image, pour la sonde de la règle de qualité
  if(QLR.sN>0)qlSondeDebut(); // (2026-10-08) sonde armée : la puce chronomètre l'image (voir qlSonde)
  if(COUT.on)coutDebut(); // (2026-10-13, banc perf-iphone7) le coût de l'image entière — voir COUT
  // ⚠ dt JAMAIS NÉGATIF (2026-09-25) : l'horodatage de rAF est celui du DÉBUT de l'image, et `last` peut avoir été posé
  // par `performance.now()` un peu plus tard (reprise d'onglet, pas-à-pas) — un dt < 0 rendait négatif le rayon
  // des taches de jus, et `arc()` lève alors une IndexSizeError qui cassait l'image entière (mesuré).
  let dt=Math.max(0,Math.min((now-last)/1000,.05));last=Math.max(last,now);
  if(TCTL.on&&running&&!paused&&!gameOver)hudColonne(dt); // (2026-10-14) la colonne de droite se MESURE ici, avant toute écriture du HUD de l'image (voir hudColonne)
  // qualité auto : si le GPU peine (<45 fps soutenus après l'échauffement), on allège la ouate une fois pour toutes
  if(PERF_MON)loop._brut=now-(loop._pn||now); // (OPTIMISATION, ?perf=1) l'intervalle VRAI, non plafonné : le relevé des à-coups (perfAcoup)
  const rawMs=Math.min(100,now-(loop._pn||now));
  const ms9=(CAD.on||HC.on)?Math.max(0,rawMs-(CAD.per-CAD.ecran)):rawMs; // (2026-10-14, passe perf mobile) calé à 30 i/s : la durée RAMENÉE à une image d'écran, pour toute la règle de qualité — voir CAD (rawMs reste la durée vraie)
  loop._ms=(loop._ms||16)*.96+ms9*.04;loop._pn=now;
  // DÉTECTEUR D'À-COUPS : l'EMA (constante ~25 frames) lisse les PICS ponctuels (titan de nuage plein écran) —
  // ce compteur fuyant attrape la saccade VÉCUE : ~10 frames >26 ms sur les 2-3 dernières secondes = on allège.
  /* (2026-09-26, vague 2) L'IPHONE EN ÉCONOMIE D'ÉNERGIE bride l'affichage à 30 Hz : chaque image dure 33 ms PILE, GPU au repos. Lu
     comme de la lenteur, ça coupait le bloom (palier BAS), descendait la résolution à 0,5 et comptait chaque image comme un à-coup.
     Un rythme de 30 Hz STABLE (écart moyen à la moyenne < 2 ms) n'est pas un GPU qui peine : c'est une cadence imposée. On n'en tire
     plus aucune conclusion (ni palier, ni résolution) et un à-coup s'y mesure contre 45 ms. Un GPU qui rame, lui, n'est jamais régulier.
     Et la résolution peut y REMONTER : au chargement (images irrégulières) elle descendait au plancher, puis la remontée exigeait
     < 17,8 ms — impossible à 30 Hz, donc 0,5 pour toute la session. Si la remontée surcharge vraiment, les images sautent, la
     cadence n'est plus régulière et l'anti-yoyo (plafond mémorisé) reprend la main. Banc : scratchpad gfx2-etal/r30.js. */
  loop._jit=(loop._jit==null?4:loop._jit)*.95+Math.abs(ms9-(loop._ms||16))*.05;
  {const cad9=(loop._ms||16)>29.5&&(loop._ms||16)<37.5;if(cad9&&loop._jit<2)loop._r30T=now+2500; // tenu 2,5 s : une image sautée (66 ms) ne fait pas basculer
   loop._r30=cad9&&now<(loop._r30T||0);}
  loop._spk=(loop._spk||0)*.985+(ms9>(loop._r30?45:26)?1:0);
  QLR.a[QLR.i]=ms9;QLR.i=(QLR.i+1)%QLR.a.length;if(QLR.n<QLR.a.length)QLR.n++; // (tour 2) l'anneau des 60 dernières images, lu par les centiles
  /* ⚠ LENTEUR SOUTENUE, JAMAIS UN PIC (2026-09-24) — toujours vrai : on ne dégrade que « calme » (ni reconstruction de zone, ni retour
     d'onglet, ni cadence 30 Hz imposée). Mais les paliers ne sont plus DÉFINITIFS et la résolution n'est plus la PREMIÈRE sacrifiée :
     (2026-09-27, passe perf iPhone) paliers MOYEN/BAS et résolution adaptative ne font plus qu'UNE échelle, `QL` — voir « LA NETTETÉ EN
     DERNIER » près de qlPose. Même horloge (un pas toutes les 1,1 s), mêmes seuils (19 / 24 / 17,8 ms), même anti-yoyo (4 pas de marge
     pour remonter, mur mémorisé 45 s) — appliqués au cran de l'échelle au lieu du seul pixelRatio. */
  const calme9=!document.hidden&&now-(loop._rebuildT||0)>(loop._rebuildD||2500)&&!loop._r30; // ni reconstruction de zone, ni départ de partie, ni retour d'onglet, ni cadence 30 Hz imposée
  if(CAD.ok)CAD.calme=calme9; // (2026-10-14, passe perf mobile) la cadence stable ne décide que « calme », elle aussi
  const qb9=qlBornes();
  // EFFONDREMENT : au plancher, encore > 24 ms (< 42 i/s) pendant 6 s D'AFFILÉE → on s'autorise sous le plancher (puis le bloom)
  /* (2026-09-27, tour 2) LA MESURE, C'EST LA PART D'IMAGES RATÉES — plus la moyenne glissante. Sur un écran 60 Hz une image qui
     déborde d'un rien dure 33,3 ms : la moyenne mélangeait les à-coups (compilations, chargements, 1er vol) et la vraie lenteur, et un
     départ de partie un peu haché suffisait à faire dévaler toute l'échelle. Désormais, sur les 60 dernières images : `p50` (la
     médiane — plus de la moitié des images ratées = ça rame fort), `p75` (plus d'un quart ratées = ça tire), `p90` (moins d'une sur
     dix ratée = marge pour remonter). Un à-coup isolé ne bouge aucun des trois. */
  if(!loop._qlT||now-loop._qlT>250){loop._qlT=now;const n9=QLR.n,s9=QLR.s;for(let i=0;i<n9;i++)s9[i]=QLR.a[i];
    const v9=s9.subarray(0,n9).sort();QLR.p50=n9?v9[n9>>1]:16;QLR.p75=n9?v9[(n9*.75)|0]:16;QLR.p90=n9?v9[Math.min(n9-1,(n9*.9)|0)]:16;}
  QL.efT=(calme9&&QL.k>=qb9.kNet&&QLR.p50>24)?QL.efT+dt:0;if(QL.efT>6)QL.effondre=true;
  // ÉTAGE 1 : l'ombre en vol, une image sur deux — seulement LOIN de toute dalle (radar de tryLand), jamais au sol
  {const loin9=QL.k>=1&&mode==='fall'&&(lastNearH2+(fallPos.y-lastNearY)*(fallPos.y-lastNearY))>196;
   if(loin9){renderer.shadowMap.autoUpdate=false;QL.fr^=1;renderer.shadowMap.needsUpdate=QL.fr===0;}
   else if(renderer.shadowMap.autoUpdate===false)renderer.shadowMap.autoUpdate=true;}
  /* (historique conservé) RÉSOLUTION ADAPTATIVE v3 ANTI PING-PONG (2026-07-20) : l'ancienne remontée instantanée à <14,5 ms faisait
     OSCILLER la résolution sur les machines pile au seuil — chaque cran re-échantillonne TOUT l'écran, et les dégradés doux des NUAGES
     le montrent le plus. D'où (1) la remontée après ~4,5 s de marge CONSÉCUTIVE, (2) une montée qui retombe en < 6 s marque ce cran
     comme un MUR (45 s). ⚠ LA REMONTÉE À < 14,5 ms ÉTAIT IMPOSSIBLE SUR UN ÉCRAN 60 Hz (2026-09-24) : la synchro plafonne l'image à
     16,7 ms — le seuil est 17,8 ms (« on tient la synchro 60 »). */
  dprT-=dt;
  // (2026-09-28) L'ACCUEIL EN HAUTE DÉFINITION (VHD) : l'échelle dort, c'est la vitrine qui tient la résolution — et son FILET la
  // redescend (×0,8, jamais sous le plafond ordinaire) quand le téléphone ne suit vraiment pas
  /* LE FILET v2 (2026-10-13, Léo : « l'écran d'accueil ne baisse pas de qualité pour les tels qui peuvent ») — MESURÉ au banc : l'ancien
     filet était un CLIQUET. Un à-coup d'une seconde (une compilation, la pluie de richesse, un onglet voisin) suffisait à faire passer plus
     d'un quart des images au-dessus de 22 ms : la résolution perdait 20 %… et ne remontait JAMAIS tant qu'on restait sur l'accueil
     (×2,6 → ×1,0 en 10-20 s, 7 fois moins de pixels — le ciel flou). Désormais :
     · on ne baisse que sur une lenteur TENUE (2,5 s d'affilée, `lT`) — un à-coup passe sans rien coûter ;
     · avant de baisser, la SONDE de la course (qlSonde) mesure le VRAI coût d'une image : sous 14,5 ms, la puce tiendrait le 60 i/s,
       c'est l'ÉCRAN qui bride (économie d'énergie, chaleur) → on ne sacrifie rien, et ce qui avait été baissé remonte ;
     · la marge revenue (moins d'une image sur dix ratée pendant 3 s, `bT` — ou la sonde qui prouve qu'une image agrandie d'un cran
       tiendrait sous 14 ms), la résolution REMONTE d'un cran (×1,25) jusqu'à la pleine
       définition de l'écran (`max`) — sauf vers un cran qui vient d'échouer (remonté puis retombé en moins de 10 s : un MUR de 45 s,
       l'anti-yoyo de l'échelle de course). */
  if(VHD.on){VHD.t+=dt;
    VHD.lT=(calme9&&QLR.p75>22)?VHD.lT+dt:0;VHD.bT=(calme9&&QLR.p90<17.8)?VHD.bT+dt:0;
    const sonde9=VHD.sT&&QLR.vraiT>VHD.sT; // la sonde lancée par le filet a parlé
    if(VHD.lT>2.5&&VHD.t>1.5){
      if(!sonde9){if(!VHD.sT||now-VHD.sT>3000){VHD.sT=now;qlSondeArme();}} // la SONDE d'abord : on décide quand elle a parlé
      else{VHD.sT=0;VHD.lT=0;VHD.bT=0;
        if(QLR.vrai<14.5){VHD.bride=now;VHD.t=-6.5;vhdNote(now,'bride');vhdMonte(now,QLR.vrai);} // l'écran bride, pas la puce : rien n'est sacrifié (et la sonde se tait 8 s)
        else if(VHD.dpr>DPR_CAP+.02){VHD.t=0;if(VHD.monteT&&now-VHD.monteT<10000){VHD.mur=VHD.dpr;VHD.murT=now;}VHD.dpr=Math.max(DPR_CAP,VHD.dpr*.8);VHD.bas++;vhdNote(now,'baisse');curDPR=-1;qlPose(0);}
        else VHD.t=-6.5;}} // déjà au plancher : rien à baisser, la sonde se tait 8 s
    else if(VHD.dpr<VHD.max-.02&&VHD.t>1.5){
      if(VHD.bT>3){if(vhdMonte(now,0)){VHD.t=0;VHD.bT=0;}}
      /* entre les deux (quelques images ratées, pas assez pour baisser — souvent le reste de la machine, pas le jeu) : la sonde dit
         combien coûte VRAIMENT une image ; si, agrandie au cran du dessus (coût ∝ pixels), elle tient encore sous 14 ms, on remonte */
      else if(sonde9){VHD.sT=0;VHD.t=-10;if(vhdMonte(now,QLR.vrai))VHD.t=0;} // pas de marge : la sonde se tait ~12 s
      else if(!VHD.sT||now-VHD.sT>3000){VHD.sT=now;qlSondeArme();}}}
  else if(!RESPIN&&dprT<=0&&now>4000&&qlAuto()){dprT=1.1;const fort9=QLR.p50>24,tire9=QLR.p75>24||QLR.p50>18.5; /* (OPTIMISATION) voir L'IMAGE EN AUTOMATIQUE */
    /* LA NETTETÉ NE SE SACRIFIE QUE SI ÇA PAIE (tour 2) : un cran de RÉSOLUTION posé, on regarde 3 s plus tard si la médiane a
       baissé. Si non (le téléphone bute ailleurs : processeur, affichage), la résolution revient et ce cran devient un MUR — on ne
       floute pas l'image pour rien. */
    if(QL.essai&&now-QL.essai.t>3300){const e9=QL.essai;QL.essai=null;
      if(QLR.p50>e9.p50-1.5&&QLR.p75>e9.p75-1.5&&(loop._ms||16)>e9.ms*.92){QL.plafK=e9.k0;QL.plafT=now;QL.up=0;qlPose(e9.k0);}}
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai&&!(QLR.vraiT&&now-QLR.vraiT<(((QL.k>=qb9.kNet&&!QL.effondre)||(QL.k>=QL.N_EFF&&QL.plafT&&now-QL.plafT<45000&&QL.k>=QL.plafK))&&!qlChrono(renderer.getContext())?30000:8000))){qlSondeArme();QL.up=0;} // d'abord la SONDE : on décidera au pas suivant
    /* (2026-10-14, passe mobile — « jouer en NETTE sans que ça bug ») QUAND L'ÉCHELLE NE PEUT PLUS DESCENDRE, SUR IPHONE : au plancher net (on ne
       passe dessous que sur effondrement, qui a son propre chrono) ou sous un PLAFOND (un cran de résolution qui n'a rien rapporté : le
       téléphone bute sur le processeur), la sonde ne décide plus rien vers le bas — elle ne sert qu'à voir si l'écran bride. Or sans
       chronomètre de la puce (Safari) ce sont CINQ images synchronisées, le processeur qui attend la puce à chaque fois : MESURÉ au banc
       (Safari simulé, processeur ralenti ×6) — l'image se figeait ainsi toutes les 8 s, pour toujours. Là : toutes les 30 s. Ailleurs
       (chrono non bloquant, ou une échelle qui peut encore descendre) : inchangé. */
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai&&QLR.vrai<14.5){QL.bride=now;QL.up++; // l'ÉCRAN bride (économie d'énergie, chaleur) : on ne sacrifie rien…
      if(QL.k>0&&QL.up>=3){QL.up=0;QL.effondre=false;qlPose(QL.k-1);}} // …et ce qui aurait été baissé remonte
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai){
      const lim9=QL.effondre?qb9.kMax:qb9.kNet;
      let k9=Math.min(lim9,QL.k+(fort9?2:1));
      if(k9>QL.N_EFF&&QL.plafT&&now-QL.plafT<45000)k9=Math.max(QL.k,Math.min(k9,QL.plafK)); // un PLAFOND : ce cran de résolution n'a rien rapporté il y a peu
      if(k9>QL.k){if(QL.roseT&&now-QL.roseT<6000){QL.mur=k9;QL.murT=now;} // remonté puis retombé aussitôt → ce cran est un mur
        const res9=qlDpr(k9,qb9)<qlDpr(QL.k,qb9)-.001;if(res9)QL.essai={t:now,k0:QL.k,p50:QLR.p50,p75:QLR.p75,ms:loop._ms||16};
        QL.roseT=0;QL.up=0;qlPose(k9);}
      else QL.up=0;}
    else if((QLR.p90<17.8||loop._r30)&&!CAD.gel){const mur9=(QL.murT&&now-QL.murT<45000)?QL.mur:0;QL.up++;
      // la marge revient : la RÉSOLUTION remonte d'abord, et vite (2 crans d'un coup quand presque aucune image ne rate)
      if(QL.k>mur9&&QL.up>=3){QL.up=0;QL.roseT=now;const k9=Math.max(mur9,QL.k-(QLR.p90<16.9&&QL.k>QL.N_EFF+1?2:1));if(k9<=qb9.kNet)QL.effondre=false;qlPose(k9);}}
    else QL.up=0;
  }
  if(PERF_MON)perfMonTick(now,rawMs);
  lvlStep(dt);routeTick(); // NIVEAUX : le noir de l'orbite, la planète et la pluie suivent le même fondu — AVANT bioStep, qui lit LVL.espace
  ailvTick(dt); // (2026-10-16) LES AILES VIVANTES : le boost, le virage, la montée, la vitrine du garage — avant blingTick, qui les anime
  blingTick(dt); // (2026-10-10) L'ICEBERG : les éclats de givre scintillent (menu, garage, course)
  bioStep(dt); // BIOMES : le voyage d'ambiance avance même au menu/en pause de jeu (c'est le ciel qui vit, pas la sim)
  try{nuFondTick(dt);}catch(e){} // (2026-10-18) le fond peint de la mer de nuages
  if(mode!=='drive'||!running||gameOver)LIGNE_U.uFile.value*=Math.max(0,1-dt*6); /* (LES TIRETS FILENT) hors de la route, le filé retombe : pas de tirets flous au menu */
  cityTick(dt,camera.position.y); // LA VILLE : son altitude court après la caméra (hors gate de sim — le décor vit au menu, comme le ciel)
  try{portesTick();}catch(e){} // (optimisation) les chaînes muettes se débranchent, les chaînes appelées se rebranchent
  if(SONV2){ // (console de son) LE VIDE : en orbite, un bourdon qui respire remplace le vent (windG/whG se taisent, voir la boucle audio)
    const v9=LVL.espace>.5&&started&&running&&!paused&&!gameOver&&!garageOn&&mode!=='boom';
    if(v9&&!loop._vide&&now>(loop._videT||0)){loop._videT=now+500;loop._vide=sfx('espace.ambiance',{loop:true,vol:-24});if(loop._vide)loop._vide.gain(0,.8);}
    else if(!v9&&loop._vide){loop._vide.stop(.5);loop._vide=null;}
    /* (2026-10-08, Léo : « au départ de la première map, un son parasite — enlève ») : plus d'ambiance de la MER DE NUAGES en course (souffle, rafales, harpe éolienne : elle passait 11 à 26 dB au-dessus de la musique du ciel). Code et échantillons retirés au nettoyage du 14/10. */
    if(garageOn&&!(CHUTE&&CHUTE.on)&&(!openGarage._amb||!openGarage._feu)&&now>(loop._garT||0)){loop._garT=now+800;if(!openGarage._amb)openGarage._amb=sfx('garage.ambiance',{loop:true,vol:GAR_AMB_DB});if(!openGarage._feu)openGarage._feu=sfx('garage.feu',{loop:true});} // (débogage 2026-09-29) une ambiance ratée au premier essai est retentée — (2026-10-12, passe qualité) le FEU aussi : SON rallumé dans l'atelier, il restait muet jusqu'à la visite suivante
    else if(!garageOn&&openGarage._amb){openGarage._amb.stop(.35);openGarage._amb=null;}
  }
  // (2026-09-26, user : « enlève tous les modes ralentis du jeu ») : plus de slow-mo (atterrissage, gros air, bullet-time, reprise de
  // pause, ultra-turbo, explosion) ni de HIT-STOP. Les déclencheurs posent encore slowT/hitT : on les vide ici, le temps ne ralentit JAMAIS.
  slowT=0;hitT=0;
  dt=ralentiDt(dt); // (2026-09-29) …SAUF le ralenti de la FRÉNÉSIE, demandé par Sacha (voir RALENTI) — le dt RÉEL reste celui des mesures de perf ci-dessus
  const t=now/1000;
  let speedKmh=0;
  try{ if(running&&!paused&&!gameOver&&!BANC_FIGE){ // (banc ?banc=1) BANC_FIGE : la simulation s'arrête, le rendu continue
    // OVERDRIVE : passé le niveau 6, le jeu passe la surmultipliée — +8 %/niveau, jusqu'à +50 %
    // ⚠ JEU DE PROGRESSION : la VITESSE vient du MOTEUR, pas de la caisse équipée — sinon équiper une
    // caisse débloquée ferait démarrer la partie à 400 km/h et il n'y aurait plus rien à gagner.
    // ⚠ `spec` = CARS[0] et NON CARS[level] (2026-08-03) : il ne servait plus qu'à `spec.turn`, et
    // depuis que la caisse équipée s'applique, ce seul champ suffisait à donner à une caisse tardive
    // un rayon de braquage deux fois meilleur — de la performance déguisée en cosmétique. Toutes les
    // caisses PILOTENT donc pareil ; CARS[level] ne sert plus qu'à la carrosserie et au nom.
    const spec=CARS[0],late=lateMul(),
          eng9=ENGINE_TIERS[engTier]||ENGINE_TIERS[0],
          maxSp=CARS[0].maxKmh/3.6*late*eng9.push,acc9=CARS[0].accel*late*(1+(eng9.push-1)*.6);
    const up=AUTO_GAS||keys.KeyW||keys.KeyZ||keys.ArrowUp,dn=keys.KeyS||keys.ArrowDown;
    gasOn=up;
    const lf=keys.KeyA||keys.KeyQ||keys.ArrowLeft,rt=keys.KeyD||keys.ArrowRight;
    // POUVOIRS : les minuteurs s'égrènent, l'airtime infini rend une jauge neuve en expirant
    {const pn9=pwrNitroT>0,ps9=pwrSpdT>0;
    pwrNitroT=Math.max(0,pwrNitroT-dt);
    pwrSpdT=Math.max(0,pwrSpdT-dt);pwrSpdK+=((pwrSpdT>0?1:0)-pwrSpdK)*(1-Math.exp(-dt*6));if(pwrSpdT<=0&&pwrSpdK<.003)pwrSpdK=0; /* (2026-10-17) le ×2 de VITESSE se prend et se rend en douceur (voir pwrSpdK) */
    if(pn9&&pwrNitroT<=0)pwrFinSnd('n');else if(ps9&&pwrSpdT<=0)pwrFinSnd('v');} // (2026-09-26) la fin d'un pouvoir se dit aussi à l'oreille — (pouvoirs v2) avec sa clé (la session SON la lit)
    if(startBoostT>0)startBoostT=Math.max(0,startBoostT-dt); // LE BOOST DE DÉPART : décroît tout seul, même hors mode 'drive' ne l'arrête pas plus tôt que prévu
    if(pwrAirT>0){pwrAirT-=dt*pwrAirK();if(pwrAirT<=0){pwrAirT=0;if(!TUTO.on)pwrFinSnd('a');if(mode==='fall'){fallT=0;fallTR=0;airFlash=.6;}}} // (2026-09-28) l'airtime PRÊTÉ par l'auto-école n'est pas un pouvoir : il finit sans bruit
    pwrTick(dt); // (pouvoirs v2) aimant · aura ×2
    mortsTick(Math.min(.05,rawMs*.001)); // (2026-09-30) le temps de course par niveau — le temps RÉEL de l'image (le dt de sim passe au ralenti en frénésie)
    ligneTick(dt); // (2026-09-29) LA LIGNE PARFAITE s'allonge devant la caisse
    // nitro : 2s regen (10s de recharge) + 2s réserve (bidons bleus)
    // CAPACITÉ MOTEUR : la réserve de nitro s'élargit avec le palier (2,0 → 3,6 au réacteur)
    const NRMAX=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2;
    {const av9=nitroR;nitroR=Math.min(NRMAX,nitroR+NITRO2.regen*dt);if(LIVRE.on)livre('n+:seule',nitroR-av9);}
    if(pwrNitroT>0||PARK.on||startBoostT>0)nitroR=NRMAX; // NITRO INFINIE : jauge pleine, rien ne se consomme (pouvoir, parc freestyle, OU l'élan du départ — 2026-10-08 : le départ ne fait plus de nitro tout seul, mais une nitro APPUYÉE pendant ses 3 s reste offerte : sinon, tenue dès le départ, la jauge tombait à sec en 2,6 s et la nitro se coupait en PANNE SÈCHE) — pleine = la capacité du MOTEUR (à 2 en dur, la jauge restait à 55 % au palier max)
    {const fu9=nitroR>=NRMAX-.001,d9=nitroR-(loop._nR==null?nitroR:loop._nR);if(SONV2&&fu9&&loop._nFu===false&&d9<.06&&!(pwrNitroT>0||PARK.on||startBoostT>0)&&started&&!gameOver)sfx('nitro.pleine');loop._nFu=fu9;loop._nR=nitroR;} // (console de son) PLEINE : ding au franchissement — pas sous nitro infinie, ni quand un plein OFFERT (saut > .06 : portail, pose, bump, fruit) l'a remplie, il a son glouglou
    const wantN=keys.ShiftLeft||keys.ShiftRight||keys.Space||(DBG_AUTO.on&&(DBG_AUTO.nit===1||(DBG_AUTO.nit===2&&mode==='fall')||(DBG_AUTO.nit===3&&mode==='drive'))); // (2026-10-08, Léo : « l'accélération du début n'est pas du boost, c'est de la vitesse ; enlève tout ce qui a rapport au nitro ») le départ ne tient PLUS la touche : il pousse la caisse (voir `startBoostT` dans la conduite), sans flamme, ni son, ni traînée
    /* (2026-10-01, LA LOI DU RÉSERVOIR, loi 0) À SEC : le réacteur tenait tant qu'il restait plus de ,005 dans la jauge — or elle se refait
       de ,2 × dt à chaque image : sous ~40 images/s (dt > ,025 : un iPhone bridé à 30 i/s) la recharge d'UNE image suffisait, et le nitro
       tenu ne s'éteignait JAMAIS, jauge vide (poussée, NITROOO, PSYCHO, flow gelé). Il tient désormais tant que la jauge PAIE l'image. */
    const tk9=pwrNitroT>0||PARK.on||startBoostT>0?0:nitroConsoDe(dt,FLOW2.fren.nitro,FLOW.lv===4);
    nitroOn=wantN&&nitroTientDe(nitroR+nitroX,tk9,nitroOn); // hystérésis anti-clignotement (il se rallume à ,3)
    if(LIVRE.on){LIVRE.t+=dt;if(nitroOn)LIVRE.tN+=dt;if(mode==='fall')LIVRE.tV+=dt;}
    if(wantN&&!loop._nvW&&!nitroOn&&mode!=='boom'){try{if(SONV2)sfx('nitro.vide');else noiseBurst(.04,.06,2500);}catch(e){}hap(6);} // (2026-09-26, audit son) NITRO À VIDE : un « tchk » sec — l'appui répond toujours
    loop._nvW=wantN;
    const doigtN=!!(keys.ShiftLeft||keys.ShiftRight||keys.Space); // (2026-10-03, Léo) la phrase ne répond qu'au VRAI doigt : ni le boost de départ (startBoostT), ni le pilote auto
    if(VEQ.dReq){VEQ.dReq=false;if(performance.now()-(VEQ.dReqT||0)<150)veqDouble();}if(VEQ.sautAtt>0){const a9=performance.now()-VEQ.sautAtt;if(a9>400||mode!=='drive'||gameOver)VEQ.sautAtt=0;else if(!(hopY>0||hopV!==0||POSE_F)){VEQ.sautAtt=0;veqDouble();}} /* (2026-10-15 soir) le double-tap fait pendant un rebond part à la fin du rebond (0,4 s au plus) */if(GLI.req){const d9=GLI.req;GLI.req=null;if(performance.now()-GLI.reqT<150)figGJoue(d9);}gsolTick(dt);frTick(dt);figHud(); /* (2026-10-14, GAMEPLAY — bug relevé par GENERAL : « VEQ.dReq jamais remis à zéro : un double-tap fait en pause, au 3-2-1 ou à l'écran de mort part à la REPRISE ») la boucle ne lit la demande qu'en course : passé 150 ms (une pause, un compte, une mort), elle est PÉRIMÉE et tombe */ // LES FIGURES (2026-10-14) : le double-tap NITRO est lu aux ÉVÉNEMENTS (veqDoigt) — à 30 i/s un tap bref passait entre deux images
    {const iV=doigtN&&mode!=='boom'&&!gameOver;if(iV!==!!loop._iW){loop._iW=iV;try{if(iV)instruOn();else instruOff();}catch(e){}}} /* (2026-10-07, audit) on retient ce qu'on JOUE, pas le doigt : mort doigt posé, la partie suivante rejoue au 1er appui */ // (2026-10-03) LA PHRASE DU BOOST suit le DOIGT, pas la flamme (le réservoir vide la coupait)
    if(nitroOn&&pwrNitroT<=0&&!PARK.on&&startBoostT<=0){
      let take=tk9; // (v3, Sacha : « en frénésie le nitro baisse 2× plus lentement »)
      if(LIVRE.on)livre(mode==='fall'?'n-:vol':'n-:sol',Math.min(take,nitroR+nitroX));
      if(nitroR>=take)nitroR-=take;
      else{take-=nitroR;nitroR=0;nitroX=Math.max(0,nitroX-take);}
    }
    nitroBlue=nitroOn&&nitroR<=.01; // réserve bleue = plus puissante
    // TURBO v2 : spool à l'enclenchement (au sol), blow-off + flutter à la relâche (partout)
    if(!wantN){NSEC.sous=false;NSEC.etage=false;} // (2026-10-17) le doigt levé : le prochain allumage est un VRAI appui (voir NSEC)
    if(nitroOn&&!loop._nOn&&mode==='drive'&&!NSEC.sous)nitroSpool();
    if(nitroOn&&!loop._nOn&&mode!=='boom')nitroAllume(nitroBlue,false);            // (vague 3) LE COUP d'allumage — au sol comme en vol
    else if(nitroOn&&nitroBlue&&!loop._nBl&&mode!=='boom')nitroAllume(true,true); // …et le 2e étage : on bascule dans la réserve bleue
    loop._nBl=nitroBlue;
    if(nitroOn){nitroHeldT+=dt;styleFromBoost(dt);} // TENIR le boost remplit la jauge rose — la seule source
    if(!nitroOn&&loop._nOn&&nitroHeldT>.35&&mode!=='boom'&&!wantN)blowOff(); // (2026-10-17) pas sous le doigt : la panne sèche n'est pas une relâche (voir NSEC) — (2026-10-14, chasse aux bugs) pas de soupape de turbo sur la caisse qui EXPLOSE : la porte de simulation reste ouverte les 1,8 s de 'boom', un pouce levé (ou la panne sèche) y jouait le PSSHT + flutter par-dessus l'explosion — tous les autres sons de fin de nitro (nitroEteint, nitro.sec, sensNitro) sont déjà gardés mode!=='boom'
    if(SONV2&&!nitroOn&&loop._nOn&&wantN&&mode!=='boom')sfx('nitro.sec'); // (console de son) PANNE SÈCHE : la jauge lâche sous le doigt
    if(!nitroOn&&loop._nOn)nitroEteint(!!wantN); // (vague 3) la dernière bouffée (lit nitroHeldT : avant sa remise à zéro) — (2026-10-17) `wantN` : la jauge lâche SOUS le doigt, la pétarade se tait
    if(!nitroOn&&loop._nOn&&wantN)NSEC.sous=true;
    if(SENS)try{sensNitro(dt,!!wantN);}catch(e){} // (2026-10-14, sensations · nitro) la coupure, la panne sèche, les rapports, les paliers : dans la tôle et la main (lit nitroHeldT avant sa remise à zéro)
    if(SENS)try{sensPassages(dt);}catch(e){} // (2026-10-14, sensations · passages) l'arrivée d'un portail, le replacement : la caisse se pose sur ses ressorts
    if(!nitroOn)nitroHeldT=0;
    loop._nOn=nitroOn;
    if(keys.KeyR&&mode==='drive'){respawn();keys.KeyR=false;if(SONV2)sfx('respawn');}
    // PILOTE AUTO DE MESURE (`dbgAuto`) : le volant du bot de poursuite (mêmes équations) posé sur TA caisse —
    // sert à mesurer l'économie sur des dizaines de parties sans jouer à la main. Jamais armé en jeu.
    const mA9=DBG_AUTO.on&&mode==='drive'?vitMult():1; // (HAUTE VITESSE, 2026-09-30) le pilote de mesure connaît sa caisse : au sol, le lacet est ×spdMult, et l'écart latéral s'y referme en autant de SECONDES qu'à ×1
    const target=DBG_AUTO.on&&DBG_AUTO.vol&&mode==='fall'?dbgAutoVol(dt):DBG_AUTO.on?THREE.MathUtils.clamp((routeLacet+(THREE.MathUtils.clamp((DBG_AUTO.lat-lat)/(Math.max(6,Math.abs(vA)*SPD*mA9)*.9),-.4,.4)-(DBG_AUTO.gl?psi-BKV.gl:psi))*3)/(lacetMax(vA)*mA9),-1,1) // (conduite v6) le pilote de mesure corrige son CAP vers la ligne visée // (conduite v4) le pilote de mesure VISE un cap
      :TCTL.act?TCTL.st:(lf?1:0)-(rt?1:0); // VOLANT TACTILE : le pouce prend la main sur le tout-ou-rien (même lissage derrière)
    if(lf||rt)TCTL.doigt=false; // (2026-10-14, sensations) une flèche du clavier reprend la main : son lissage à elle (le dernier qui a tenu le volant décide)
    steer+=(target-steer)*(1-Math.exp(-dt*(TCTL.doigt?VOL_LIS_D:VOL_LIS))); /* (2026-10-14) τ 30 ms au pouce, 47 ms au clavier (voir VOL_LIS_D) · (2026-10-09) exponentielle EXACTE : à 60 i/s c'est l'ancien ×0,3 au millième ; à 30 i/s (l'iPhone bridé) le volant braquait plus sec que sur PC (τ 36 ms au lieu de 47) */
    graceT=Math.max(0,graceT-dt);
    if(CHANCE.inv>0)chanceTick(dt); // (2026-10-14) le bouclier de la SECONDE CHANCE
    sideCd=Math.max(0,sideCd-dt);
    if(DBG_AUTO.on&&DBG_AUTO.saut>0){if(mode==='drive'&&!introD&&graceT<=0){DBG_AUTO.tS+=dt;if(DBG_AUTO.tS>=DBG_AUTO.saut&&Math.abs(lat)<ROAD_HALF*.5&&Math.abs(vA)*3.6*SPD>110){DBG_AUTO.tS=0;DBG_AUTO.l0=null;startFall(DBG_AUTO.imp,1);}}else DBG_AUTO.tS=0;} /* banc : la boucle décoller / se poser */
    if(mode==='drive'){
      landMark.visible=false;LM.a=0; // (au sol : le prochain vol repart d'un viseur éteint)
      // ANTI-IDLE : la musique n'avance pas sans toi — reste quasi à l'arrêt trop longtemps et la caisse explose
      const idleKmh=Math.abs(vA)*3.6*SPD;
      if(!introD&&!PARK.on&&!BALADE&&graceT<=0&&idleKmh<22){
        idleT+=dt;
        if(idleT>1.6){
          showMsg(TR('⚠ ROULE OU CRÈVE — ')+decFr(Math.max(0,6-idleT),1)+' s','#ff4d4d'); // compte à rebours vivant
          loop._tickT=(loop._tickT||0)-dt; // TIC d'amorce qui S'ACCÉLÈRE vers le boom
          if(loop._tickT<=0){loop._tickT=Math.max(.10,(6-idleT)*.22);if(SONV2)sfx('arret.tic',{st:6-idleT<1?7:0,vol:6-idleT<1?2:0});else{chimeNote(660+ (6-idleT<1?900:0),0,.05,.22);subBoom(.05);}}
        }
        if(idleT>=6){idleT=0;explode('arret');}
      }else{idleT=Math.max(0,idleT-dt*2.5);loop._tickT=0;}
      frameAt(s,F);
      if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
      // cap MONDE : la route tourne sous la voiture
      if(prevTvalid){
        tmp.crossVectors(prevTv,F.t);
        const dyaw=Math.atan2(tmp.dot(F.n),prevTv.dot(F.t));
        /* ⚠ LA CONDUITE v2 (2026-09-25, user : « retravaille la conduite, il faut que ce soit plus fun et cool »).
           AVANT : tout le virage de la route était reporté sur le cap de la caisse (`psi -= dyaw`) — dans CHAQUE courbe il
           fallait contre-braquer en continu, sinon on filait au bord et on tombait ; conduire, c'était corriger la route.
           La v2 faisait suivre 78 % du virage à la caisse (`ASSIST_VIRAGE`) — (conduite v6) REVENU À ZÉRO : c'était l'aimant
           (« quand je ne touche à rien je reste quand même sur la route »). La route tourne SOUS la caisse ; c'est le pouce qui
           prend le virage — et `lacetMax` + des virages à l'échelle de la vitesse (`lvPiste`) le rendent faisable. */
        // (piste v7) LE HAUT DES LOOPINGS : quand la dalle dépasse 60° d'inclinaison (mur, plafond), la caisse SUIT le ruban comme sur des
        // rails — le vrillage du ruban y fabrique un « virage » qui n'en est pas un (mesuré : 8 % des loopings infaisables pouce à fond,
        // 1 % hors de ces parties). Sur la route (dalle < 60°), l'aide reste à ZÉRO.
        const nyR9=side<0?-F.n.y:F.n.y,rails9=TORD.on?0:THREE.MathUtils.clamp((.5-nyR9)/.3,0,1); /* (2026-10-15) sur la route SANS HAUT NI BAS la dalle couchée n'est pas un looping : ses virages sont de vrais virages (pisteTord), le pouce les prend */
        psi=THREE.MathUtils.clamp(psi-dyaw*(1-Math.max(ASSIST_VIRAGE,rails9,0)),-1.4,1.4);routeLacet=dt>0?dyaw/dt:0; // (le pilote de mesure s'en sert pour anticiper)
      }
      prevTv.copy(F.t);prevTvalid=true;
      // MOMENTUM : tenir la ligne droite fait monter la puissance en exponentiel
      // MOMENTUM v2 (2026-09-25) : tenir sa ligne REMPLIT la réserve, manœuvrer la GÈLE (frôlé, slalom, pièce visée ne coûtent plus rien —
      // avant, un slalom de frôlés coûtait jusqu'à 38 % de vitesse) ; seuls la glisse, le gros coup de volant et le pied levé la VIDENT.
      // Plafond 4,3 s = saturation de momF : plus de braquage « en banque ».
      if(up&&!driftEnCours&&Math.abs(psi)<.6){if(Math.abs(psi)<.25)momT=Math.min(4.3,momT+dt);} // (conduite v6) tenir sa ligne DANS un virage compte aussi (on y braque forcément : le pouce ne gèle plus la réserve)
      else momT=Math.max(0,momT-dt*2);
      const momF=1+Math.min(1.8,momT*momT*.1);
      let a=0;
      if(up)a=acc9*(vA<maxSp*(1+FLOW.lv*.05)?1:.55)*(boost>0?1.5:1)*momF*(1+FLOW.lv*.06); // ça pousse TOUJOURS sur la route — et le FLOW pousse plus loin
      if(dn&&!driftEnCours)a=vA>2?-acc9*1.5:-acc9*.75; /* (2026-10-14, Sacha : « la MARCHE ARRIÈRE doit être plus rapide ») en recul .5 → .75 : 1,5× plus vive */ /* (2026-10-09) au clavier ↓ est AUSSI le geste du drift : en drift il ne freine plus — au doigt et à la souris le drift ne freinait pas, au clavier il coûtait ~3× plus de vitesse */
      vA+=a*dt;
      if(nitroOn)vA+=(nitroBlue?48:30)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dt; // LE MOTEUR pousse : le palier multiplie la nitro
      else if(startBoostT>0)vA+=30*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dt; // (2026-10-08) L'ÉLAN DU DÉPART : la poussée de la nitro, sans la nitro — de la vitesse, rien d'autre
      vA+=-GRAV*F.t.y*hautPente()*Math.cos(psi)*driveDir*dt; // la pente accélère/freine selon le SENS réel de marche
      // pas de plafond : seule la traînée résiste (terminal ≈ 2,4x la vitesse max de la caisse)
      vA-=vA*Math.abs(vA)*(acc9/(maxSp*maxSp*5.8))*dt;
      vA*=Math.max(0,1-.03*dt);
      if(FREIN_L<0){const f9=FREIN_L*(1-Math.exp(-dt/FREIN_TAU));vA*=Math.exp(f9);FREIN_L-=f9;if(FREIN_L>-1e-4){vA*=Math.exp(FREIN_L);FREIN_L=0;}} // (2026-10-17) LE FREIN ÉTALÉ : la perte d'un choc ou d'une pose, en ~0,2 s (voir FREIN_L)
      if(!up&&!dn&&!nitroOn)vA*=Math.max(0,1-.4*dt);
      if(PARK.on&&vA>PARK_VCAP)vA=PARK_VCAP; // PARC : gouverneur de vitesse — la nitro infinie POUSSE mais ne s'emballe pas (contrôlable)
      if(vA<-16)vA=-16; // (2026-10-14, Sacha : « la MARCHE ARRIÈRE doit être plus rapide ») -8 → -16 : 13,8 → 27,6 km/h affichés en recul (×3,6×SPD)
      if(introD){vA=0;momT=0;steer=0;psi=0;} // LARGAGE : chute verticale, contrôles gelés
      if(Math.abs(target)>.1)steerHold=Math.min(.3,steerHold+dt);else steerHold=0;
      // LE DRIFT : braquage FORT à bonne vitesse, ou pouce tiré vers le bas (le geste du frein) en braquant
      const tireBas=TCTL.act&&(TCTL.dy||0)>(driftEnCours?DRIFT_PX:Math.max(DRIFT_PX,TCTL.dyS)),vitOk=Math.abs(vA)>maxSp*.42; // (2026-09-28) en PIXELS : 34,9 px = l'ancien sv < -0,45 — la sensibilité de l'assiette ne change pas le geste du drift — (2026-09-30) pour ENTRER à droite, au moins le seuil de l'ARC du pouce (`dyS`, ≤ 42,5) ; pour TENIR, 34,9 px comme avant : on en sort au même geste
      // (conduite v3) HYSTÉRÉSIS : on ENTRE en drift à 0,85 de braquage (ou pouce tiré), on n'en SORT que sous 0,45 — il ne clignote plus
      // (2026-09-25) le braquage À FOND doit être TENU 0,12 s pour décrocher : un grand glissé de changement de ligne ne part plus
      // en drift (ni au vide). Le geste du frein (pouce tiré vers le bas, ↓) décroche tout de suite.
      // (conduite v6) UNIQUEMENT le geste : pouce tiré vers le bas (↓ au clavier) EN braquant. Braquer fort ne décroche plus tout
      // seul (mesuré : 16 drifts involontaires par minute, 0 mini-turbo). On en sort en relâchant le geste.
      const veut9=!introD&&!PARK.on&&vitOk&&(tireBas||dn)&&Math.abs(steer)>.35;
      driftArm=veut9?driftArm+dt:0;
      if(veut9)driftEnCours=true;
      else if(!vitOk||!(tireBas||dn)||Math.abs(steer)<.2)driftEnCours=false;
      const drifte=driftEnCours;
      if(TCTL.on&&!TUTO.on&&!(SAVE.d.ast&1)){ // (2026-09-26, audit UX) le geste du drift n'était enseigné nulle part
        if(drifte){SAVE.d.ast|=1;SAVE.mark();}
        else if(vitOk&&Math.abs(steer)>.8){loop._astD=(loop._astD||0)+dt;if(loop._astD>1.2){loop._astD=0;SAVE.d.ast|=1;SAVE.mark();misBanniere('ASTUCE',TR('Tire le pouce vers le BAS en tournant : DRIFT !'),'','volant');}}
        else loop._astD=0;}
      // (conduite v6) LE POUCE FAIT TOURNER (voir lacetMax) : il commande un LACET, la caisse le prend en VOL_TAU ; lâché, le lacet
      // retombe à 0 et le cap reste figé dans le monde. En DRIFT : la TRAJECTOIRE tourne 15 % plus serré, et le NEZ pivote en plus
      // (slipB, jusqu'à 24°) — ⚠ la glisse s'AJOUTE au nez, elle ne se retire pas de la trajectoire : sinon, le temps qu'elle
      // s'installe, la caisse partait tout droit (mesuré : décrochée à 1,4 rad/s, elle ne tournait plus du tout pendant 0,2 s).
      /* (2026-09-30, HAUTE VITESSE) LE LACET SUIT L'AVANCE. `spdMult` (NITROOO ×1,10/s, VITESSE ×2 — plafond ×2,6) multiplie l'AVANCE : la
         route tournait donc sous la caisse ×spdMult plus vite, le lacet non — le rayon mini de braquage était ×spdMult. CALCUL : l'épingle
         TECH du 1er moteur (R 68 m ; rayon mini 61 m à 253 km/h) = 89 % de pouce à ×1 → 233 % à ×2,6 : impossible, sortie forcée (le banc
         ntrx.js : « la caisse sort et s'envole »). Le lacet commandé ET l'inertie (VOL_TAU) suivent spdMult : même pouce = même TRAJECTOIRE,
         parcourue plus vite. √spdMult écarté : 144 % sur cette épingle ; au banc node (pilote de mesure), 0,15 à 0,7 sortie/km restaient
         à ×2,6 au 1er moteur (0 avec ×spdMult). VOL_TAU ÷ spdMult : la caisse PÈSE le même nombre de MÈTRES qu'à ×1 — au moteur 10 sous nitro,
         ×2,6 (1 700 km/h), 0,36 → 0,01 sortie/km. Les EFFETS (power-slide, roulis, fumée, traces, VIRAGE SERRÉ) lisent le lacet de BASE
         `yawR/spdMult` : mêmes images et mêmes paiements qu'à ×1 dans le même virage (sinon, à ×2,6, la caisse restait en travers en
         permanence et VIRAGE SERRÉ sonnait dans des courbes molles). Rien ne tourne tout seul : pouce lâché, yawR retombe à 0 comme avant. */
      const spdMult=vitMult(); // (NITROOO) ×1,10/s tenue, et avec VITESSE ×2 : PLAFOND COMMUN ×2,6 (voir vitMult) — SPEED UP : le sol défile DEUX FOIS plus vite (2026-09-26, user : « le power-up vitesse doit faire ×2 »), sans casser la physique
      {const rT=steer*lacetMax(vA)*spdMult*(drifte?1.15:1)*THREE.MathUtils.clamp(vA/8,-1,1)*(slipT>0?.18:BKV.sur?BK_VG.grip:1); // flaque : la direction ne mord presque plus · (2026-10-15) verglas du glacier : elle mord à moitié
       yawR+=(rT-yawR)*(1-Math.exp(-dt*spdMult/VOL_TAU));
       const b0=slipB,bT=drifte?Math.sign(steer)*.42*Math.min(1,Math.abs(steer)):0;
       slipB+=(bT-slipB)*(1-Math.exp(-dt*(drifte?4:6)));
       psi+=yawR*dt+(slipB-b0); // le nez = la trajectoire + la glisse
       if(MURC.psiK>0){MURC.psiK=Math.max(0,MURC.psiK-dt/.06);psi+=(MURC.psiR-psi)*(1-Math.exp(-dt*50));} // (2026-10-17) LE COUP D'ÉPAULE : le renvoi de la paroi en ~50 ms (voir murCote)
       if(BKV.sur)BKV.gl=THREE.MathUtils.clamp(BKV.gl+yawR*dt,-BK_VG.glMax,BK_VG.glMax); // (2026-10-15 soir) SUR LE VERGLAS le pouce tourne le NEZ, la trajectoire ne suit qu'en BK_VG.tau s (voir banqVerglas) : la caisse GLISSE
       const aB9=Math.abs(yawR/spdMult*vA)*SPD; // (HAUTE VITESSE) la charge latérale de BASE : celle qu'aurait le même virage à ×1
       glisse9=THREE.MathUtils.clamp(Math.abs(slipB)*2.6+driftT*.5+Math.max(0,aB9-22)/70,0,1)*Math.min(1,Math.abs(vA)/35); // (2026-09-26) la gomme fume et crisse dès que la caisse chasse (power-slide)
       // (aura v2) LE VIRAGE SERRÉ : tenir une grosse charge latérale 0,9 s sur la route — prendre un virage À FOND, ça se paie
       {const aL9=aB9;FRONDE.cd=Math.max(0,FRONDE.cd-dt);if(aL9>32){virT+=dt*spdMult;if(lat*yawR*driveDir>ROAD_HALF*.2*Math.abs(yawR))virC+=dt*spdMult;if(drifte||slipT>0)virD=true;}else if(aL9<12){if(virPaye&&!virD)frondeLache(virT,virC);virT=0;virC=0;virD=false;virPaye=false;} /* (LA FRONDE) la corde = la moitié INTÉRIEURE du virage (lat du côté où l'on tourne) ; une glisse (drift, flaque) désarme la fronde */ // (HAUTE VITESSE) les 0,9 s se comptent en temps ×1 : le même virage paie, pris à ×1 comme à ×2,6
        if(virT>.9&&!virPaye){virPaye=true;if(SONV2)sfx('virage');chaineAuraMuette('VIRAGE SERRÉ',45,'virage',false,SONV2);}} // (2026-09-29, Sacha) ne s'écrit plus
       filetTick();} // (2026-09-29) LA ROUTE QUI TE RATTRAPE : le VIRAGE À FOND (voir FILET)
      driftTick(dt,drifte);
      if(SENS)try{sensCaisse();}catch(e){} // (2026-10-14, sensations · caisse) le coup de volant sec, la roue qui passe la lèvre et qui remonte : dans la tôle et la main
      // (conduite v3) RASE-BORD : frôler le vide à pleine vitesse RECHARGE le nitro — le risque paie
      if(!introD&&!PARK.on&&Math.abs(lat)>ROAD_HALF*.8&&Math.abs(vA)>maxSp*.5){raseT+=dt;if(!nitroOn)nitroGain(NITRO2.rase*dt,'rase'); /* (LA LOI DU RÉSERVOIR) le rase-bord ne remplit que nitro COUPÉE */flowAdd(6*dt,'route'); // bande du RASE-BORD : les 20 % extérieurs de la demi-route (3 à 4,8 m sur la route large)
        if(raseT>.6&&!raseAnn){raseAnn=true;hap(12);try{chaineAuraMuette('RASE-BORD',40,'rase');}catch(e){}} // (2026-09-29, Sacha) ne s'écrit plus
        if(Math.random()<dt*14){DRIFT_V.set(Math.sign(lat)*CARS[level].w*.5,.1,-.3);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkBlue,DRIFT_V,1,4);}}
      else{raseT=0;raseAnn=false;}
      slideTick(dt); // (2026-10-14 soir) LA FIGURE SLIDE (voir SLD)
      // ---- DRIFT : FREIN + BRAQUAGE à bonne vitesse = le train arrière décroche ----
      // (mobile OK : le frein = tirer le pad vers le bas, déjà mappé sur ArrowDown)
      // Le CAP part plus vite que la TRAJECTOIRE (psi grimpe) mais la caisse continue de filer
      // vers l'avant (vL atténué) : c'est exactement la sensation de glisse. Zéro nouvelle physique.
      // DRIFT DE CONDUITE ABANDONNÉ (2026-07-30) : la glisse ne se RESSENTAIT pas — dans ce modèle le cap
      // EST la trajectoire (vL=vA·sin psi), donc « décrocher » ne fait que tourner plus, sans sensation.
      // Il faudrait une vraie vitesse latérale indépendante du cap : refonte à part, pas un réglage.
      // (la RÉCEPTION EN GLISSE à l'atterrissage, elle, reste — c'est un effet ponctuel bien visible)
      driftT=Math.max(0,driftT-dt*2.2); // retombe après un atterrissage en travers
      psi=THREE.MathUtils.clamp(psi,-1.4,1.4);
      if(DMT.act)dmtConduite(dt); // (LE DEMI-TOUR) la manœuvre tient le volant, la vitesse et la ligne pendant ~1 s
      vL=vA*Math.sin(psi-slipB-BKV.gl); // la TRAJECTOIRE : le cap moins la glisse (0 hors drift) · moins la glissade du verglas (BKV.gl, 0 hors du glacier)
      const lat09=lat; // (BALAYAGE, voir balEcart) la ligne de la caisse AVANT l'avance : plots, pads, dos d'âne et flaques se testent sur le trajet
      lat+=vL*driveDir*dt*SPD*spdMult; // (spdMult : calculé avant le lacet, voir HAUTE VITESSE)
      const sPrev9=s; // ⚠ mémorisé AVANT l'avance : les tremplins se testent sur le SEGMENT parcouru, pas sur un point
      s+=vA*Math.cos(psi-slipB-BKV.gl)*driveDir*dt*SPD*spdMult; // avance le long du ruban dans le SENS de conduite (parc : avant OU arrière)
      const vF=vA;
      boost=Math.max(0,boost-dt);
      speedKmh=Math.abs(vF)*3.6*SPD*spdMult;
      vpalTick(speedKmh); // (2026-09-28) les PALIERS DE VITESSE : chaque centaine franchie se crie (écran nu : pas de compteur sur téléphone)
      {const f9=Math.min(.42,speedKmh/3.6*Math.max(dt,1/120)/Math.max(1,LIGNE_PER.v));LIGNE_U.uFile.value+=(f9-LIGNE_U.uFile.value)*Math.min(1,dt*12);} /* (LES TIRETS FILENT) la route parcourue pendant cette image, en part de période */
      // point de respawn sûr
      if(side>0&&F.n.y>.5&&Math.abs(lat)<ROAD_HALF-2&&Math.abs(psi)<.5)safeS=s;
      // BORD : si la voiture dépasse le côté de la route, elle bascule et tombe dans le vide.
      if(cyCouloirIci()&&Math.abs(lat)>ROAD_HALF-1.15){murCote(dt,'paroi');slideContact();} // (2026-10-14, CANYON) LE COULOIR des Étroits : les parois touchent la route — même mur que Paris
      else if(banqOk())bkCongere(dt); // (2026-10-18, GLACIER) LA CONGÈRE : au-delà de la glace, la neige profonde — on s'enfonce, on ralentit, on ne meurt pas (était : le mur murCote, où la caisse restait collée)
      else if(Math.abs(lat)>ROAD_HALF){
        const out=Math.sign(lat);
        // (bord v2) le CENTRE DE GRAVITÉ passe la lèvre : elle BASCULE — ni saut (était +3,4 vers le haut), ni poussée (+4 %) : on ne
        // décolle pas d'un bord plat, on en tombe. Elle garde sa vitesse et sa dérive ; la gravité fait le reste (voir startFall).
        if(graceT<=0)startFall(0,1,true);
        else{lat=out*ROAD_HALF;if(vL*out>0)vL=0;}
      }
      if(graceT<=0&&!volrOn()&&F.n.y*1<-.15&&Math.abs(vF)<7)startFall(); // (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, pas de plafond d'où l'on décroche au ralenti : la dalle à l'envers est un sol comme un autre
      // PORTAIL : fin de zone
      if(mode==='drive'&&PARK.on&&((s>L-32&&driveDir>0)||(s<6&&driveDir<0))){ // FREESTYLE : on ne régénère QUE si on sort par le bout vers lequel on roule (les deux sens sont valides, s=0 au spawn ne déclenche rien)
        portalSnd();shake=.35;nitroR=2;
        showMsg('✦ NOUVEAU SECTEUR','#7dffec');
        newTrack();
      }else if(!PARK.on&&portalMesh&&mode==='drive'&&(PCUBE.on?(s>L-24||pcubeFranchi(carGroup.position)):(s>L-32||carGroup.position.distanceToSquared(PORTAL.c)<PORTAL.R*PORTAL.R*.9))){ /* (2026-10-17) le portail de cubes : on passe en TRAVERSANT la fenêtre */ // (2026-09-26) on ENTRE dans l'ovule — par la route ou par le côté (en vol : voir la branche 'fall')
        if(PORTV.att){if(s>L-2)s=L-2;} // (le passage en deux temps) le voile est posé, la construction part à l'image suivante
        else portailPasse();
      }
      // pads turbo
      padCd=Math.max(0,padCd-dt);
      LIGNE.sPd0=LIGNE.sPd;LIGNE.sPd=s; // (LIGNE PARFAITE) le pad de la file se teste sur le TRAJET de l'image (à 600 km/h et 30 i/s, 5,6 m par image)
      const bal9=Math.abs(s-sPrev9)<60,sDe9=bal9?sPrev9:s,lDe9=bal9?lat09:lat; // (BALAYAGE) le trajet de l'image — un saut de `s` (portail, replacement) retombe sur le test en un point
      if(mode==='drive')for(let i9=0;i9<PADS.length;i9++){
        const pl9=LIGNE.padI.has(i9);if(pl9?LIGNE.padPris.has(i9):padCd>0)continue; // (LIGNE PARFAITE) le pad de la file ne se bloque pas sur la recharge du précédent : il ne se prend qu'UNE fois
        if(pl9?((Math.abs(s-PADS[i9])<6||(Math.abs(s-LIGNE.sPd0)<60&&(PADS[i9]-LIGNE.sPd0)*(PADS[i9]-s)<=0))&&Math.abs(side*lat-PADL[i9])<4.1) /* le pad de la LIGNE : son test à lui, inchangé */
          :balEcart(PADS[i9],6,sDe9,s,side*lDe9,side*lat,PADL[i9])<4.1){ // 2,75 de pad + ~1,35 de caisse : il faut MORDRE dessus — (BALAYAGE) sur le trajet : à 30 i/s il sautait par-dessus au-delà de ~1 300 km/h
          const tr9=padTrain(PADS[i9]),trk9=Math.min(5,tr9)-1; /* (LE TRAIN DE BOOSTS) 1, 2, 3… les pads pris à la suite, sans en rater un */
          vA+=18+5*trk9;boost=Math.max(boost,1.5+.2*trk9);if(!pl9)padCd=1.5; /* (LIGNE PARFAITE, audit GAMEPLAY) un pad de la file ne met plus la recharge : au niveau 12 il bloquait le 1er pad de la LIGNE DE NÉON au-delà de ~470 km/h (« LIGNE CASSÉE ») */ // viser paie plus qu'avant (14 → 18)
          if(SONV2)sfx('pad',{st:sonPd(trk9)});else boostSnd(1+.1*trk9);shake=Math.max(shake,.3+.04*trk9);hap(trk9?[10,16,10]:10);
          if(SENS)try{sensCoup(0,-1.7-.25*trk9,-.9);DRIFT_V.set(0,.12,-CARS[level].l*.42);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,5+trk9,7);}catch(e){} // (2026-10-14, sensations) la plaque POUSSE : le nez se lève, le cul s'écrase sur ses ressorts, une gerbe d'or part de sous la poupe — plus fort à chaque pad du train
          if(LEFIL.on)fil(tr9>1?TR('BOOST')+' ×'+tr9:'BOOST','#ffb000',1);else slam(tr9>1?TR('BOOST')+' ×'+tr9:'BOOST','','#ffb000','#ff3924',28); /* (LE FIL) le BOOST s'écrit dans la pastille */ /* (2026-09-29, Sacha : « BOOST écrit plus petit ») 46 → 28 */flashEcran('rgba(255,150,0,.5)');fovPunch=Math.max(fovPunch,10+2*trk9); // (HUD v3) « quand tu roules sur un boost, BOOST en gros »
          if(pl9){LIGNE.pris[1]++;LIGNE.padPris.add(i9);}nitroGain(LIGNE.padI.has(i9)?LIGNE.don:.12,LIGNE.padI.has(i9)?'pad.ligne':'pad');flowAdd(6+2*trk9,'route','p');momT=Math.min(4.3,momT+.8); // (LIGNE PARFAITE) le pad de la file rend de quoi tenir jusqu'au fruit
          break;
        }
      }
      rampCd=Math.max(0,rampCd-dt);
      if(mode==='drive')banqPisteHeurt(); // (v4) un pic de la piste, percuté au sol : L'IMPACT
      if(mode==='drive'&&DN.on&&DN.lev&&DN.lev.length)dnLevre(sPrev9); // (2026-10-19) LES DUNES D'OR : on décolle à la crête des vagues, même sans nitro
      if(mode==='drive'&&BANQ.kick&&BANQ.kick.length&&banqOk())for(const k9 of BANQ.kick){ // (v4) LES TREMPLINS DE GLACE — (2026-10-18) une vraie rampe de BK_BEC.lg m : on la MONTE, on décolle à la LÈVRE (k9.s)
        if(lat<k9.l0-.5||lat>k9.l1+.5||s<k9.s-k9.lg-2||Math.min(sPrev9,s)>k9.s+2)continue;
        if(s<k9.s){if(rampCd<=0){const u=Math.max(0,(s-k9.s+k9.lg)/k9.lg),hR=k9.h*Math.pow(u,1.7);if(hR>hopY-.6){hopY=Math.max(hR-.8,hopY+(hR-hopY)*Math.min(1,dt*25));hopV=0;}}break;} // sur la rampe : la caisse en suit la courbe (hopY)
        if(rampCd>0||k9.s<Math.min(sPrev9,s))break;                                                     // la lèvre franchie pendant cette image
        hopY=Math.max(hopY,k9.h);hopV=0;                                                                 // on part du HAUT de la lèvre
        if(Math.abs(vA)*3.6*SPD<70)break;                                                                // au pas : on tombe de la lèvre, sans décoller
        rampCd=1.2;startFall(THREE.MathUtils.clamp(BK_BEC.pop*Math.abs(vA)*vitMult(),14,60),1.04);fallVel.addScaledVector(F.b,-fallVel.dot(F.b)*BK_BEC.axe);boost=Math.max(boost,1.2);shake=Math.max(shake,.5);try{hap([10,18]);}catch(e){}break;} /* (BK_BEC.axe) le tremplin envoie DANS L'AXE de la piste : au banc, la glisse de travers emportée en vol (3-5 s à 45°) sortait la caisse des 196 m — 2 vols sur 9 finissaient hors piste */
      if(hopY>0||hopV!==0){
        hopY+=hopV*dt;hopV-=26*GRAV_K*gK()*dt;
        if(hopY<=0){hopY=0;hopV=0;squashT=Math.max(squashT,.15);if(introD)smashPig();if(POSE_F){const f9=POSE_F;POSE_F=null;try{f9();}catch(e){}}} // SPLAT. — (2026-10-01) et le CONTACT d'une pose (gerbe, choc, gomme)
      }
      /* (2026-10-14, sensations) LA RETOMBÉE D'UN PETIT SAUT. Un dos d'âne, un replacement : la caisse retombait et se tassait (squashT),
         rien d'autre. Désormais, à proportion de la hauteur du saut : deux bouffées de poussière aux roues arrière, le nez qui pique
         un instant, un tic dans la main. Une POSE déclarée en l'air (POSE_F) a déjà sa gerbe et son choc à elle : on ne double pas. */
      if(SENS){if(hopY>0){if(hopY>SCOUP.hop)SCOUP.hop=hopY;if(POSE_F)SCOUP.hopP=true;}
        else if(SCOUP.hop>0){const k9=Math.min(1,SCOUP.hop/1.1),po9=SCOUP.hopP;SCOUP.hop=0;SCOUP.hopP=false;
          if(!po9&&k9>.12&&!introD&&mode==='drive')try{sensCoup(0,.5+.9*k9,0);sensHap(8+Math.round(10*k9),1);
            for(let w9=-1;w9<=1;w9+=2){DRIFT_V.set(w9*CARS[level].w*.45,.06,-CARS[level].l*.32);carGroup.localToWorld(DRIFT_V);sparkBurst(dust,DRIFT_V,1+Math.round(2*k9),2+2*k9);}}catch(e){}}}
      if(SENS&&JEAU.sorti<2.6&&mode==='drive'&&!introD&&jadeEauOk())try{sensMouille(dt);}catch(e){} // (2026-10-14, sensations) sortie de l'eau, elle se pose TREMPÉE : les pneus crachent ~2,5 s (voir SEAU)
      FROLE.t=Math.max(0,FROLE.t-dt);if(FROLE.t<=0)FROLE.n=0;
      // FLAQUES D'HUILE : passer dessus fait GLISSER (contrôle coupé un instant, la caisse chasse)
      oilCd=Math.max(0,oilCd-dt);
      if(mode==='drive'&&oilCd<=0)for(const o9 of OILS){
        if(o9.face!==side)continue; // chaque flaque vit sur SA face
        if(balEcart(o9.s,o9.r+2,sDe9,s,lDe9,lat,side*o9.lat)<o9.r+.6){ // même repère que les plots (posées côté dessus) — (BALAYAGE) sur le trajet de l'image : à 30 i/s, une flaque de 2 m sautait au-delà de ~860 km/h
          slipT=.75;oilCd=1.2;
          if(SENS)try{const e9=!!o9.eau;for(let w9=-1;w9<=1;w9+=2){DRIFT_V.set(w9*CARS[level].w*.5,.1,CARS[level].l*.25);carGroup.localToWorld(DRIFT_V);sparkBurst(e9?spray:dust,DRIFT_V,e9?7:3,e9?9:3.5);}sensCoup(lat>side*o9.lat?1.3:-1.3,.4,0);}catch(e){} // (2026-10-14, sensations) on ENTRE dans la flaque : l'eau gicle des deux roues avant (l'huile soulève un voile), la caisse se couche du côté où elle part
          shake=Math.max(shake,.2);
          if(SONV2)sfx(o9.eau?'flaque.eau':'flaque.huile');else noiseBurst(.35,.12,1900); // long crissement (console de son : l'eau de la ville ne sonne plus comme l'huile)
          hap(60); // (2026-09-26) par hap() : l'interrupteur et le Taptic d'iOS s'appliquent
          break;
        }
      }
      try{banqVerglas(dt);}catch(e){} // (2026-10-15) LE VERGLAS du glacier : la caisse part sur le côté (voir BKV)
      if(slipT>0){ // la voiture chasse : direction quasi coupée + embardée aléatoire
        slipT-=dt;driftT=Math.max(driftT,.7); // (2026-09-28) on VOIT la glisse : fumée de gomme + crissement (au téléphone, le message « huile » est masqué)
        if(SENS)rollV+=Math.sin(slipT*26)*20*Math.min(dt,1/30); // (2026-10-14, sensations) elle LOUVOIE : la carrosserie balance d'un flanc sur l'autre (~2°, une onde lisse — jamais du hasard par image) tant que les pneus ne mordent plus
        psi+=(Math.random()-.5)*2.6*Math.sqrt(dt/60)*Math.min(1,Math.abs(vA)/12); /* (2026-10-09) une marche aléatoire grandit en √dt : ×√(dt/60) = la même embardée à toutes les cadences (à 30 i/s elle était +41 %) */
        psi=THREE.MathUtils.clamp(psi,-1.4,1.4);
      }
      // des petits bouts se détachent par moments (réalisme, surtout l'épave)
      chipT-=dt;
      if(chipT<=0){
        chipT=5+Math.random()*9-(level===0?2.5:0);
        if(Math.abs(vF)>18&&Math.random()<(level===0?.85:.4))dropChip(level===0?1+Math.floor(Math.random()*2):1);
      }
      pickupsTick(dt); // LE RAMASSAGE (au sol ET en vol, 2026-09-30) — voir pickupsTick : même endroit, mêmes effets, même ordre qu'avant
      if(mode==='drive'){
        frameAt(s,F);
        if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
        if(levreY<0){levreY*=Math.exp(-dt*16);if(levreY>-.005)levreY=0;} // (bord v2) la caisse qui a raccroché la LÈVRE finit de remonter sa marche (~0,15 s)
        carGroup.position.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,(side<0?THICK:0)+hopY+levreY-BKB.enf); /* (2026-10-18) -BKB.enf : enfoncée dans la congère du glacier (0 ailleurs) */
        fwdW.copy(F.t).multiplyScalar(Math.cos(psi)*driveDir).addScaledVector(F.b,Math.sin(psi)*driveDir).normalize(); // la caisse REGARDE son sens de marche (parc : peut faire face à -T)
        tmp.crossVectors(F.n,fwdW).normalize();
        mat4.makeBasis(tmp,F.n,fwdW);
        carGroup.quaternion.setFromRotationMatrix(mat4);
        // ---- TOKYO DRIFT (au BOOST) : la caisse se met EN TRAVERS, la trajectoire ne bouge PAS ----
        // C'est le découplage qui manquait au drift précédent : ici on ne touche QU'À L'IMAGE (rotation
        // du mesh autour de la normale). Le pilotage reste exactement celui du joueur → toujours jouable,
        // mobile compris — mais on VOIT enfin la caisse glisser en crabe, contre-braquée.
        {
          const tdKmh=Math.abs(vA)*3.6*SPD;
          /* (2026-09-26, user : « rajoute une animation où la voiture part VRAIMENT sur le côté pendant les virages ») LE POWER-SLIDE :
             l'arrière CHASSE à proportion de la charge du virage (lacet × vitesse) — le nez rentre dans la courbe jusqu'à ~18°, la
             trajectoire reste celle qu'on pilote. ⚠ À ne pas confondre avec l'ancien « Tokyo drift » retiré en v6 : lui pivotait dès
             qu'on touchait le pouce sous nitro, même en ligne droite — celui-ci n'existe QUE dans un virage, et grandit avec lui. */
          const aLat9=yawR/spdMult*Math.abs(vA)*SPD,tdWant=Math.sign(aLat9)*.32*(1-Math.exp(-Math.abs(aLat9)/38))*Math.min(1,tdKmh/90);
          driftYaw+=(tdWant-driftYaw)*Math.min(1,dt*(Math.abs(tdWant)>Math.abs(driftYaw)?5:3.2)); // départ franc, rattrapage plus doux
          if(Math.abs(driftYaw)>.003){
            qTmp.setFromAxisAngle(F.n,driftYaw);
            carGroup.quaternion.premultiply(qTmp); // rotation MONDE autour de la verticale de la route
          }
          if(BKV.yaw){qTmp.setFromAxisAngle(F.n,BKV.yaw);carGroup.quaternion.premultiply(qTmp);}
          if(DMT.y||DMT.act)dmtPose(F,dt); // (LE DEMI-TOUR) le lacet de la manœuvre, la gomme, le panneau // (2026-10-15) ICE SKATE : le crabe et la foulée du patineur sur le verglas
          gsolPose(F); // (2026-10-15) LES FIGURES AU SOL du GLISSER (slide 360, wheelie, stoppie)
          figMemo(dt); // (2026-10-14, LES FIGURES v2) l'assiette des deux dernières images : au décollage, la caisse emporte sa rotation
          frPose(F,dt); // (2026-10-17) LA FIGURE SUR LA ROUTE : elle tourne et bondit par-dessus la pose (après figMemo : l'élan emporté reste celui de la route)
          // (conduite v3) LE ROULIS : la caisse s'écrase sur l'extérieur du virage — elle a du POIDS
          // LE ROULIS (v2) : la CARROSSERIE s'écrase sur l'EXTÉRIEUR du virage, à proportion de la charge latérale (lacet × vitesse) —
          // 6° pour un petit virage, 13-15° en plein braquage, +4° en drift. Un RESSORT (ω 14, amortissement .55) : elle plonge, dépasse
          // à peine et se pose ; un gauche-droite la fait basculer d'un flanc sur l'autre. Les roues, elles, restent au sol.
          /* (bord v2) LES ROUES DEHORS : dès que les roues extérieures passent la lèvre, plus rien ne porte ce côté — la carrosserie
             s'affaisse vers le VIDE (jusqu'à ~9° quand le centre de gravité arrive au bord, où la bascule prend le relais) et le plancher
             RACLE la lèvre (étincelles). C'est l'avertissement physique : on SENT le bord avant d'y tomber. */
          const hw9=CARS[level].w*.5,dB9=Math.abs(lat)-(ROAD_HALF-hw9),pe9=dB9>0?Math.min(1,dB9/hw9):0;
          if(pe9>0&&Math.abs(vA)>12&&Math.random()<dt*28*pe9){DRIFT_V.set(Math.sign(lat)*Math.max(0,hw9-dB9),.08,(Math.random()-.5)*CARS[level].l*.7);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);}
          {const aLat=yawR/spdMult*Math.abs(vA)*SPD,d9=Math.min(dt,1/30), /* (HAUTE VITESSE) le lacet de BASE : le roulis du même virage qu'à ×1 */
                rollT=Math.sign(aLat)*.26*(1-Math.exp(-Math.abs(aLat)/35))+(driftEnCours?Math.sign(slipB)*.07:0)-Math.sign(lat)*.15*pe9*(2-pe9);
           rollV+=((rollT-carRoll9)*196-rollV*15.4)*d9;carRoll9=THREE.MathUtils.clamp(carRoll9+rollV*d9,-.42,.42);
           pitch9+=(((dn||driftEnCours)?.035:0)-((nitroOn||boost>0)?.03:0)-NFX.ign*NFX.ignK*.1-pitch9)*Math.min(1,dt*6); // plonge au frein/drift, s'accroupit à la poussée — (vague 3) et SE CABRE à l'allumage de la nitro (≈3° le temps du coup)
           const pv=carBody.userData.pivY||.45;
           if(SENS){SCOUP.pv+=(-SCOUP.p*169-SCOUP.pv*13)*d9;SCOUP.p=THREE.MathUtils.clamp(SCOUP.p+SCOUP.pv*d9,-.14,.14);} // (2026-10-14, sensations) le ressort des COUPS de tangage (ω 13, amorti .5) : voir sensCoup
           carBody.rotation.set(pitch9+SCOUP.p+veqConduite(d9),0,carRoll9);carBody.position.set(pv*Math.sin(carRoll9),pv-pv*Math.cos(carRoll9),0);}
        }
        /* (2026-09-28) LA SUSPENSION : la réception, le dos d'âne, le bump écrasaient TOUTE la caisse (`carGroup.scale`) — roues comprises,
           qui devenaient ovales, comme du caoutchouc. Désormais la CARROSSERIE plonge sur ses ressorts (ω ≈ 15, amortie) : elle se tasse,
           remonte en dépassant à peine et se pose ; les roues restent au sol et rondes. `squashT` garde son rôle : c'est l'appui du coup. */
        {const sq=Math.min(1,squashT/.28),d9=Math.min(dt,1/30);squashT=Math.max(0,squashT-dt);
         susV+=((-sq*.17-susY)*230-susV*16)*d9;susY=THREE.MathUtils.clamp(susY+susV*d9,-.26,.12);
         const pv=carBody.userData.pivY||.45;carBody.position.y=pv-pv*Math.cos(carRoll9)+susY;}
        carGroup.scale.set(1,1,1);
        ROUES.v=vF*SPD;if(DMT.act&&DMT.burn)ROUES.v=Math.max(ROUES.v,45); // (LE DEMI-TOUR) au burn-out, les roues patinent // (2026-09-26) la vitesse du SOL sous les pneus : carVit fait tourner chaque roue à v ÷ R (+ flou de jante)
        // ombre
        shadow.material.opacity=0; // (2026-09-25) .10 → 0 : ce disque à bord NET se lisait comme une tache sombre autour de la caisse — l'ombre portée (shadow map) et le blob de contact doux suffisent // en drive la shadow map fait le travail — le disque noir creusait un DONUT dans le néon/les flaques
        shadow.position.copy(carGroup.position).addScaledVector(F.n,.06-hopY); // l'ombre reste collée à la route (drop/dos d'âne)
        mat4.makeBasis(tmp3.copy(F.t),tmp2.copy(F.b),F.n);
        shadow.quaternion.setFromRotationMatrix(mat4);
        shadow.scale.setScalar(1);
        // fumée de gomme : SEULEMENT quand ça glisse (même zone morte que le crissement) —
        // la poussière permanente derrière les roues, c'était du bruit visuel, pas de la vitesse
        const drf9=glisse9; // (conduite v6) la fumée suit la VRAIE glisse (drift, grosse charge, réception) — plus l'angle à la route, qui n'est plus une glisse
        traceTick(Math.abs(vF)>10&&(glisse9>.08||Math.abs(yawR/spdMult*vA)*SPD>9)); // (2026-09-26) LES TRACES DE PNEUS : dès que ça tourne fort ou que ça glisse
        if(drf9>0&&Math.abs(vF)>14){
          const nD9=1+(drf9>.5?1:0),VC9=PT_U.uVc.value;
          for(let r9=0,rp9=emiN('fum',dt);r9<rp9;r9++)for(let k=0;k<nD9;k++){ // (2026-10-09) à la seconde : voir emiN
            const sd2=k?1:-1;
            tmp2.copy(carGroup.position).addScaledVector(fwdW,-spec.l/2).addScaledVector(tmp,sd2*spec.w/2);if(r9)tmp2.addScaledVector(VC9,-dt*r9/rp9); // la bouffée « d'entre deux images » naît là où était la roue
            spawnP(dust,tmp2.x,tmp2.y,tmp2.z, // (2026-09-26) la fumée HÉRITE de la vitesse de la caisse (EXV) : laissée sur place, la caméra la traversait → un grand disque mauve derrière la roue
              VC9.x*.9-fwdW.x*3+tmp.x*sd2*2.5*drf9+(Math.random()-.5)*1.5,VC9.y*.9+F.n.y*1.2+Math.random()*.8,VC9.z*.9-fwdW.z*3+tmp.z*sd2*2.5*drf9+(Math.random()-.5)*1.5,
              .3+Math.random()*.25); // (particules v2) elle hérite de la VRAIE vitesse de la caisse (VC9 : en glisse, le nez ne dit plus où l'on va — calée sur le cap, la fumée partait de côté hors de l'écran), colle à la roue et vit un peu plus : le fondu de vie l'efface en douceur
          }
        }
        // traits d'AIR : discrets, de plus en plus nombreux à mesure que ça accélère
        if(speedKmh>140){ // seuils ×2 (SPD .25→.5 : km/h doublés) — mêmes traits d'air au même état-caisse
          const nS9=speedKmh>640?4:speedKmh>460?3:speedKmh>280?2:1;
          for(let k9=0,n9=nS9*emiN('trS',dt);k9<n9;k9++)if(Math.random()<.85){ // (2026-10-09) à la seconde : voir emiN
            tmp2.copy(carGroup.position).addScaledVector(fwdW,10+Math.random()*40);
            tmp2.addScaledVector(tmp,(Math.random()-.5)*30);
            tmp2.addScaledVector(F.n,1+Math.random()*10);
            const ln9=4+speedKmh*.035;
            spawnStreak(tmp2.x,tmp2.y,tmp2.z,fwdW.x*ln9,fwdW.y*ln9,fwdW.z*ln9);
          }
        }
        if(nitroOn&&!REDUCED_MOTION)nfxVent(dt,fwdW,speedKmh); // (vague 3) NITRO : les stries de vent filent au ras de l'objectif
        // BRAISES d'échappement : fines, vie COURTE, jet serré — le plume mesh (JETS) et la traînée
        // font le spectacle, les particules ne sont plus que des étincelles qui giclent. Fini le mur
        // blanc : avant, des sprites géants restaient plantés dans le monde et la caméra les TRAVERSAIT.
        flames.mesh.material.size=Math.min(.62,.27+Math.min(engTier,15)*.022)*(nitroOn?1.2:1); // (2026-09-26) plus de tirage PAR IMAGE (toute la réserve palpitait d'un bloc) : chaque braise a sa taille (aR) ; et le feu grandit avec le MOTEUR, plus avec l'index de la caisse // PETIT : une étincelle, pas un ballon (le plume mesh fait le volume)
        flameCore.mesh.material.size=Math.min(.34,.14+Math.min(engTier,15)*.012)*(nitroOn?1.25:1);
        flames.mesh.material.color.set(nitroOn?(nitroBlue?0x5b7dff:pwrNitroT>0?NINF.jet:0xff7a24):0xff9030); // (vague 3) la bible : feu #ff7a24, réserve #5b7dff
        flameCore.mesh.material.color.set(nitroOn?(nitroBlue?0xd6e2ff:pwrNitroT>0?NINF.core:0xffe4bc):0xffe2a8); // le CŒUR blanchit (blanc chaud / blanc bleuté)
        const fl=(up||nitroOn)?(nitroOn?(FLM_ON&&NFEU.on&&NFEU.k>.3?1:5):2)+Math.min(3,Math.floor(level/5)):(Math.abs(vF)>8?1:0); /* (2026-10-15) au nitro le FEU DE PIXELS remplace les boules rondes : une braise par pot suffit */
        // (2026-09-25) Les étincelles HÉRITENT de la vitesse de la caisse (EXV) : lâchées à −22 m/s en MONDE alors que la caisse file
        // à 50+, elles fonçaient vers la caméra à ~70 m/s relatifs et gonflaient en gros ronds orange devant l'objectif. Le gaz
        // quitte le pot à −22 m/s PAR RAPPORT À LA CAISSE : c'est la physique, et elles meurent avant d'atteindre la caméra.
        EXV.copy(fwdW).multiplyScalar(Math.max(0,vA)*SPD);
        for(let r9=0,rp9=emiN('fl',dt);r9<rp9;r9++)for(let k=0;k<fl;k++){ // (2026-10-09) à la seconde : voir emiN
          potMonde(CAR_POTS[k%CAR_POTS.length],tmp2); // (2026-09-26) des VRAIS pots de la caisse (voir CAR_POTS)
          if(r9)tmp2.addScaledVector(EXV,-dt*r9/rp9); // (2026-10-09) la braise « d'entre deux images » sort du pot où il était
          const vsp=nitroOn?.6:.9; // flux SERRÉ le long de l'axe : un jet, pas un nuage
          spawnP(flames,tmp2.x+(Math.random()-.5)*.10,tmp2.y+(Math.random()-.5)*.10,tmp2.z+(Math.random()-.5)*.10,
            EXV.x-fwdW.x*(13+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*vsp,EXV.y+F.n.y*.5+(Math.random()-.5)*vsp,EXV.z-fwdW.z*(13+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*vsp, // ≤ 2,5 m derrière le pot : la caméra est 3 m plus loin
            .05+(nitroOn?.04:0)+Math.random()*.05);
          if(Math.random()<.3)spawnP(embers,tmp2.x,tmp2.y,tmp2.z,
            EXV.x-fwdW.x*(2+Math.random()*4)+(Math.random()-.5)*3,EXV.y+1+Math.random()*3,EXV.z-fwdW.z*(2+Math.random()*4)+(Math.random()-.5)*3,
            .15+Math.random()*.15);
          if(k<2)spawnP(flameCore,tmp2.x+(Math.random()-.5)*.06,tmp2.y+(Math.random()-.5)*.06,tmp2.z+(Math.random()-.5)*.06,
            EXV.x-fwdW.x*(16+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*.5,EXV.y+F.n.y*.3+(Math.random()-.5)*.5,EXV.z-fwdW.z*(16+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*.5,
            .04+Math.random()*.04+(nitroOn?.03:0));
        }
        // backfire : pop de flammes quand on relâche les gaz à haut régime
        if(!up&&loop._wasUp&&speedKmh>280){ // seuil ×2 (SPD .25→.5) : le backfire reste réservé au HAUT régime
          for(let k=0;k<6;k++){
            potMonde(CAR_POTS[k%CAR_POTS.length],tmp2); // (2026-09-26) le retour de flamme sort des pots
            spawnP(flames,tmp2.x,tmp2.y,tmp2.z,-fwdW.x*16+(Math.random()-.5)*2.5,Math.random()*1.6,-fwdW.z*16+(Math.random()-.5)*2.5,.12);
          }
          noiseBurst(.12,.07,900);
        }
        loop._wasUp=up;
        // les caisses de riche crachent des billets par les fenêtres
        if(engTier>=ENG_CAP.billets&&Math.abs(vF)>15){ // CAPACITÉ MOTEUR (V10) : la caisse crache des billets
          billT-=dt;
          if(billT<=0){
            billT=.28+Math.random()*.4;
            const sd9=Math.random()<.5?-1:1;
            tmp2.copy(carGroup.position).addScaledVector(tmp,sd9*spec.w*.55).addScaledVector(F.n,spec.h+.4);
            spawnBill(tmp2,new THREE.Vector3(tmp.x*sd9*2.5-fwdW.x*5+(Math.random()-.5)*3,1.5+Math.random()*2,tmp.z*sd9*2.5-fwdW.z*5+(Math.random()-.5)*3),1.4);
          }
        }
        // caméra COLLÉE à la caisse hors boost (elle remplit l'écran) → RECULE quand on boost (le monde s'ouvre)
        // ⚠ ANGLE : en rapprochant la caméra (5,6 → 4,1) sans baisser sa hauteur, l'assiette est passée
        // de 21,4° à 26° de plongée — la caméra regardait 5° trop vers le bas EN PERMANENCE.
        // La hauteur suit désormais la distance (même rapport qu'à l'origine) : on reste collé à la
        // caisse, mais l'œil retrouve exactement l'angle d'avant.
        const camBoost=Math.min(1,(nitroOn?.72:0)+Math.min(1,boost)*.5);
        // PORTRAIT : on COLLE à la caisse (×.70 — elle déborde volontairement un peu en bas) et on
        // MONTE (×1.72) — c'est la vue plongeante qui la fait tenir ENTIÈRE dans le cadre au lieu de
        // la laisser sortir par le bas. Ces deux valeurs et la visée (plus bas) se règlent ENSEMBLE.
        // ⚠ LA CAMERA RECULE À NOUVEAU (2026-09-05, demande du user : « trop zoomé ») : le 4,1 du
        // 2026-09-03 rapprochait pour mieux voir caisse et route, mais combiné à la dynamique de
        // caméra (lean/swing) ajoutée depuis, l'image est devenue trop serrée. Le recul de base
        // remonte à 5,3 — entre l'ancien 4,6 et le 4,1 récent — la HAUTEUR suit (même rapport ×.46),
        // donc l'angle de vue ne change pas, seule la distance augmente.
        /* ⚠ LA CAMÉRA DE CONDUITE DE SACHA, RÉTABLIE EN BLOC (2026-09-24, user : « la physique de conduite
           est beaucoup plus fun dans la version de Sacha, reprends-la »). Mesuré avant de toucher : les
           ÉQUATIONS de conduite (accélération, adhérence, braquage, `steer`) sont identiques dans les deux
           versions — ce qui change la sensation, c'est tout ce qui l'ENTOURE. Retour donc, à l'identique :
           recul 4,6 (et non 5,3) qui s'allonge avec la vitesse, hauteur ×.393, suivi `dt*5`, roulis 0,035,
           visée fixe — et surtout le CHAMP qui s'ouvre franchement (jusqu'à +38°, +22 en réserve bleue) :
           c'est lui qui dit « ça pousse ». Le glissement latéral (`camSwing`) et le coup de tête au boost
           (`camKick`) de la version de Léo sont retirés ; les variables restent à 0 pour `dbgCam9()`. */
        /* ⚠ LA CAMÉRA COLLE À LA CAISSE (2026-09-25, user, deux fois : « caméra plus proche de la voiture »). Le vrai
           coupable n'était pas le recul : c'était le SUIVI. `camera.position.lerp(cible, dt*5)` suit une cible qui AVANCE —
           le retard en régime établi vaut vitesse ÷ 5 : à fond, la caméra traînait des DIZAINES de mètres derrière la
           consigne, la caisse devenait un point au loin. On lisse désormais l'ÉCART caisse→caméra (dans le repère de la
           caisse), pas la position absolue : la caméra garde la douceur dans les virages et les bosses, mais la vitesse ne
           l'éloigne plus. Recul de base 2,9 (était 3,3), qui s'allonge à peine avec la vitesse et le boost. */
        const hC9=Math.max(0,(CARS[level].h||1.3)-1.5), // (2026-09-26) les HAUTES (monster truck, glacier, combi) : on recule et on monte d'autant — elles bouchaient la route
        ct9=camTailleOn(),H9=CAM_HEROS.on,vCam9=(ct9||H9)?Math.min(speedKmh,CAM_TAILLE.recMax/.0018):speedKmh,bCam9=H9?camBoost*CAM_HEROS.boost:ct9?camBoost*CAM_TAILLE.boost:camBoost, /* (CAM_HEROS) la nitro ne recule plus la caméra ; couché aussi, la vitesse n'éloigne plus au-delà de recMax */
        dz9=H9?CAM_HEROS.dolly(loop._fovB):1,hz9=H9?1-CAM_HEROS.bas*THREE.MathUtils.clamp(speedKmh/Math.max(1,vCroisiere())-.6,0,1):1, /* (CAM_HEROS) le VERTIGO : la caméra avance quand le champ s'ouvre · elle descend à haute vitesse */ // (2026-09-30) CAM_TAILLE : en portrait la vitesse n'éloigne plus la caméra au-delà de recMax (NITROOO ×2,6 l'envoyait à 9 m de haut)
        camBack=(3.6+CARS[level].l*.42+hC9*1.6+vCam9*.0018+bCam9*1.6)*(1-POR*.28)*dz9*(H9?1+(CAM_HEROS.recP-1)*POR:1)*camGlacierM(0), /* (CAM_HEROS) debout, un pas en arrière : le champ resserré suffit à grossir la caisse */ // le recul suit la LONGUEUR de la caisse : la Combi et la Bulle cadrées pareil
       camH=(camBack*.40+hC9*.9+vCam9*.0012+bCam9*.25)*(1+POR*.70)*hz9*camGlacierM(1); // (2026-10-19) ×camGlacierM : la vue qui plonge du glacier
        camLean=(loop._viseR==null||loop._viseR>=1)?steer*.065:camLean+(steer*.065-camLean)*(1-Math.exp(-dt*10));camSwing=0;camKick=0; // (conduite v3) la caméra penche avec toi (était .035) — (2026-10-17) à la POSE la penche (éteinte en vol) revient en ~0,1 s au lieu d'une image (jusqu'à 3,7°, volant tenu) ; ensuite elle colle au volant comme avant
        // (conduite v6) la caméra se place derrière un axe MI-ROUTE MI-CAISSE : avant, elle suivait le cap de la caisse et la clouait au
        // centre de l'image (mesuré : 0 % d'écart à l'écran à 15 m du centre) — on voyait le décor coulisser, pas la caisse bouger.
        if(!loop._camD)loop._camD=new THREE.Vector3();
        loop._camD.copy(F.t).multiplyScalar(driveDir).lerp(fwdW,.55).normalize();
        if(DMT.cam)loop._camD.applyAxisAngle(F.n,DMT.cam);dmtCamTick(dt); // (LE DEMI-TOUR) la caméra tourne autour de la caisse avec elle
        // (2026-09-25, user : « toujours aimantée au centre ») : la caméra suivait la position latérale AU CENTIMÈTRE — la caisse restait
        // plantée au milieu de l'image et c'est la route qui coulissait dessous. Elle suit désormais avec un RETARD (~0,35 s) : quand on
        // change de ligne, on VOIT la caisse partir vers le bord de l'écran, puis la caméra la rejoint. Pas de rappel vers l'axe : la cible
        // est TA position (×1), seul le rythme change.
        {const n9=performance.now();if(loop._camLat==null||n9-(loop._camLatT||0)>(window.dbgCamReprise||CAM_REPRISE))loop._camLat=lat;loop._camLatT=n9;
         loop._camLat+=(lat-loop._camLat)*(1-Math.exp(-dt/.22));}
        // ⚠ PLAFONNÉ à 30 % du recul : la caméra n'est qu'à ~4 m derrière — un retard de 4 m montrait la caisse DE PROFIL, collée au bord
        /* ⚠ (2026-09-30) SOUS LA DALLE, LA CAMÉRA DEVANÇAIT LA CAISSE : il y avait ici un `×(side<0?−1:1)` — mais `lat` et `_camLat` vivent
           déjà dans le repère RETOURNÉ (F.b est retourné plus haut, la caisse est posée à F.p + F.b·lat) : retourné deux fois. La caméra se
           posait à 2·lat − _camLat : au lieu de traîner, elle partait DEVANT la caisse du côté où l'on braque, et la caisse filait à l'écran
           du côté opposé à son mouvement. Le regard (FVISEE, repère NON retourné) avait, lui, le bon signe. */
        const cLag9=THREE.MathUtils.clamp(loop._camLat-lat,-camBack*.3,camBack*.3); // de combien la caméra est en retard sur la caisse (repère de la route, retourné sous la dalle comme F.b)
        tmp2.copy(carGroup.position).addScaledVector(loop._camD,-camBack).addScaledVector(F.n,camH).addScaledVector(F.b,cLag9);
        {const n9=performance.now(); // l'écart repart de la caméra RÉELLE à chaque reprise de conduite (après un vol, le garage, un respawn)
         if(!loop._camOff)loop._camOff=new THREE.Vector3();
         if(n9-(loop._camDriveT||0)>(window.dbgCamReprise||CAM_REPRISE)){ /* (banc) dbgCamReprise : en rendu logiciel (200-300 ms l'image) CHAQUE image passait pour une reprise de conduite et la caméra reculait de v·dt à chaque image */loop._camOff.subVectors(camera.position,loop._carPrev&&loop._carPrev.distanceToSquared(carGroup.position)<900?loop._carPrev:carGroup.position);CAM_ROUTE.phi=0;} /* (2026-10-01, LA POSE) l'écart repart de la caisse de l'image D'AVANT (`_carPrev`) : mesuré à la caisse de CETTE image, il clouait la caméra sur place une image entière (elle n'avançait que de 0,4 m au lieu de 0,8, de 0,6 au lieu de 2,5 à 540 km/h), puis elle rattrapait — l'à-coup de la pose */ // (vague 3) le pivot anticipé repart de zéro, lui aussi
         loop._camDriveT=n9;}
        {const off=loop._camOff,cibleOff=tmp2.sub(carGroup.position);        // l'écart VOULU (tmp2 redevient un écart)
         camRouteTonneau(cibleOff,loop._camD,dt); // (vague 3) dessus ↔ dessous : la caméra ROULE et orbite (voir CAM_ROUTE)
         if(off.distanceToSquared(cibleOff)>2500)off.copy(cibleOff);           // téléport (respawn, portail) : on ne lisse pas un saut de 50 m
         if(DMT.dc)off.applyAxisAngle(F.n,DMT.dc); /* (LE DEMI-TOUR) l'orbite : la caméra tourne d'un bloc autour de la caisse, puis se recale */
         {const r9=loop._viseR==null?1:loop._viseR;off.lerp(cibleOff,Math.min(1,dt*(CAM_ROUTE.vif?16:7*(.3+.7*r9*r9))));if(DMT.cam){const l9=cibleOff.length()*.9;if(off.lengthSq()<l9*l9)off.setLength(l9);}} /* (LE DEMI-TOUR) en orbite, la caméra ne coupe pas au plus court à travers la caisse */ /* (2026-10-01, LA POSE) la PLACE de la caméra reprend en douceur, comme sa visée (`_viseR`) : à ×7/s elle faisait 11 % du chemin entre la caméra de vol et celle de route dès la 1re image */ // (vague 3) pendant le tonneau, la caméra colle à son orbite (sinon elle coupe au travers de la dalle)
         camera.position.copy(carGroup.position).add(off);}
        (loop._carPrev||(loop._carPrev=new THREE.Vector3())).copy(carGroup.position);
        camUp.lerp(F.n,Math.min(1,dt*4)).normalize();
        qTmp2.setFromAxisAngle(fwdW,-camLean); // inclinaison caméra très légère dans les virages
        camera.up.copy(camUp).applyQuaternion(qTmp2); // ⚠ (conduite v6) BUG : la penche était ré-appliquée à camUp À CHAQUE IMAGE — elle s'additionnait (×15 à 60 i/s, ×30 à 120 Hz) : l'horizon penchait de 22 à 68° à chaque coup de pouce
        // PORTRAIT : on vise plus BAS (F.n 1,05 → 0,50) — la caméra pique du nez, donc la caisse
        // REMONTE dans le cadre au lieu de sortir par le bas. Reculer/monter/viser bas se règlent
        // ENSEMBLE : sans cette ligne, camBack et camH seuls laissaient une caisse minuscule en bas.
        tmp2.copy(carGroup.position).addScaledVector(dmtCamDir(fwdW,F.n),8.5+POR*1.2).addScaledVector(F.n,1.05-POR*.55-(H9?CAM_HEROS.vise*POR:0)).addScaledVector(F.b,cLag9*.5); /* (CAM_HEROS) debout, la visée descend : la caisse remonte */ // la visée prend une partie du retard : la caisse sort un peu du centre de l'image
        /* (route v2) LE REGARD SUIT LA ROUTE : la visée se tire à 35 % vers un point de la piste 35 m DEVANT (à la même
           distance du bord que la caisse). Dans une courbe, l'œil part vers la sortie du virage au lieu de fixer l'axe de
           la caisse — on voit où l'on va. */
        {const CR=CAM_REGARD,dR=CR.on?THREE.MathUtils.clamp(Math.abs(vA)*SPD*vitMult()*CR.k,Math.max(5,CR.min),CR.max):35, /* (2026-09-30) CAM_REGARD : le regard porte à k s d'avance réelle (voir CAM_REGARD) */
              sA=THREE.MathUtils.clamp(s+driveDir*dR,0,L-1);frameAt(sA,FVISEE);
         tmp3.copy(FVISEE.p).addScaledVector(FVISEE.b,lat*(side<0?-1:1)).addScaledVector(FVISEE.n,(side<0?-1:1)*1.2); // (conduite v4) le regard file sur TA ligne (×1) — à ×0,6 il tirait l'œil vers l'axe : un « aimant » visuel
         // ⚠ (conduite v3) plus de seuil de distance qui ALLUMAIT/ÉTEIGNAIT le regard d'un coup (c'était une saccade) : la part
         // de visée route s'estompe en continu avec l'écart, et la visée elle-même est LISSÉE dans le temps
         const dd=Math.sqrt(tmp3.distanceToSquared(tmp2)), // fenêtre de fondu ∝ D : 40 → 100 m à 35 m (à D=35 et CAM_REGARD éteint : la formule d'avant, au bit près)
               kV=(CR.on?.35*(1+CR.por*POR)*(CR.comp?CR.min/dR:1):.35)*THREE.MathUtils.clamp(1-(dd-dR*8/7)/(dR*12/7),0,1);
         CR.D=dR;CR.kV=kV;
         tmp2.lerp(tmp3,DMT.cam?kV*Math.max(0,Math.cos(DMT.cam)):kV); // (LE DEMI-TOUR) tournée vers l'arrière, la caméra ne cherche pas la route devant
         tmp2.sub(carGroup.position); // (conduite v6) lissée RELATIVEMENT à la caisse : lissée en position monde, elle traînait de v/9 — à 700 km/h on regardait le capot
         /* (2026-10-01, LA POSE) LA VISÉE REPREND EN DOUCEUR : en vol la caméra vise la caisse, au sol ~10 m devant — à la pose, la visée y repartait
            à plein régime (×9/s : 15 % du chemin dès la 1re image, la caisse glissait de 0,05 à 0,18 NDC en une image — MESURÉ au banc des poses,
            contre 0,005 à 0,04 pour un pas de vol). Elle part désormais lentement (×2,2/s) et retrouve son régime en 0,6 s (`_viseR`, remis à 0 en vol). */
         loop._viseR=Math.min(1,(loop._viseR==null?1:loop._viseR)+dt/.6);
         if(DMT.dc&&loop._vise)loop._vise.applyAxisAngle(F.n,DMT.dc); // (LE DEMI-TOUR) la visée tourne avec l'orbite
         if(!loop._vise||n9Saut(loop))loop._vise=tmp2.clone();else loop._vise.lerp(tmp2,Math.min(1,dt*(2.2+6.8*loop._viseR*loop._viseR)));
         tmp2.copy(loop._vise).add(carGroup.position);}
        /* (vague 3) LE CABRAGE ANTICIPÉ : tout le plan (place, visée, haut) pivote autour de la caisse d'une part du cabrage de la route
           à venir — la caisse reste à sa place à l'écran, c'est la route devant qui redevient lisible (voir CAM_ROUTE) */
        if(FR.lift>0){FR.cv.copy(F.n).multiplyScalar(-FR.lift*FR_K.cam);camera.position.add(FR.cv);tmp2.add(FR.cv);} // (2026-10-17, LA FIGURE SUR LA ROUTE) la caméra ne suit que 20 % du bond : on voit la caisse quitter le bitume
        camRouteCabrage(dt,camBack,camH);
        {const q9=CAM_ROUTE.q,c9=carGroup.position;camera.position.sub(c9).applyQuaternion(q9).add(c9);tmp2.sub(c9).applyQuaternion(q9).add(c9);camera.up.applyQuaternion(q9);}
        camera.lookAt(tmp2);
        fovPunch=Math.max(0,fovPunch-dt*18);
        const r9=speedKmh/Math.max(1,vCroisiere()), // (2026-09-25) le champ s'ouvre sur la CROISIÈRE réelle : il continue de réagir au momentum, au pad, au FLOW au lieu d'être collé au plafond
              fb9=H9?(()=>{const H=CAM_HEROS;if(H.v0<0||Math.abs(speedKmh-H.v0)>400)H.v0=speedKmh; /* (CAM_HEROS) « ça pousse » = la PRISE DE VITESSE : l'écart entre la vitesse et sa moyenne lente (≈1,2 s) — un pad, la nitro, une relance ouvrent le champ ; une vitesse stable ou une pente qui accélère doucement le laissent se refermer (la piste descend presque toujours : une accélération brute le tenait ouvert en permanence, mesuré) */
                H.v0+=(speedKmh-H.v0)*(1-Math.exp(-dt/H.tau));const a9=speedKmh-H.v0;
                H.acc+=(THREE.MathUtils.clamp(a9/H.accK,0,1)-H.acc)*(1-Math.exp(-dt*(a9>H.acc*H.accK?8:2)));
                return 72+FLOW.lv*1.1+Math.min(16,r9*10+Math.max(0,r9-1)*4)+(boost>0?4:0)+(nitroOn?(nitroBlue?10:7):0)+H.kick*H.acc*FOVP_K;})() /* (« Réduire les animations » : le coup à 30 %, comme fovPunch) */
               :FLOW.lv*2.2+72+Math.min(38,r9*28+Math.max(0,r9-1)*10)+(boost>0?8:0)+(nitroOn?(nitroBlue?22:15):0); // le tunnel s'ouvre : part RELATIVE + part absolue + GROS coup de FOV au boost (Sacha)
        CAM_HEROS.fb=fb9;CAM_HEROS.pu=fovPunch; // (banc) lus par dbgCamRoute
        let fovT=Math.min(160,fovPor(fovPunch*FOVP_K+fb9)); // (portrait : élargi par la tangente, voir fovPor)
        if(ct9){const f09=Math.min(160,fovPor(fb9));fovT=camTailleFov(f09)+(fovT-f09);}
        else if(H9){const H=CAM_HEROS,K=H.fovMaxL-H.genouL,f09=Math.min(160,fovPor(fb9));fovT=(f09<=K?f09:K+H.genouL*(1-Math.exp(-(f09-K)/H.genouL)))+(fovT-f09);} /* (CAM_HEROS) COUCHÉ aussi, le champ tenu passe par un genou (112°) — les coups passent par-dessus */ // (2026-09-30) CAM_TAILLE : le champ tenu passe par le genou, le COUP (fovPunch) passe par-dessus, intact
        {const n9=performance.now();if(loop._fovB==null||n9-(loop._fovBT||0)>(window.dbgCamReprise||CAM_REPRISE))loop._fovB=camera.fov;loop._fovBT=n9;} // le champ « de base » repart du vrai champ à chaque reprise de conduite
        loop._fovB+=(fovT-loop._fovB)*Math.min(1,dt*(NFX.off>0&&fovT<loop._fovB?2.4:6));
        CAMV.zoom=Math.max(0,CAMV.zoom-dt*2);CAMV.zp=24*CAMV.zoom*CAMV.zoom*FOVP_K; // (2026-09-28) le COUP DE ZOOM d'une pose PARFAITE : sec à l'impact (−24°), relâché en 0,5 s — (2026-09-30) à 30 % sous « Réduire les animations », comme fovPunch
        camera.fov=Math.max(20,loop._fovB-CAMV.zp); // (vague 3) à l'extinction de la nitro le champ RETOMBE en douceur (il s'ouvre toujours sec)
        camera.updateProjectionMatrix();CAM_HEROS.leveApplique(dt,1); // (CAM_HEROS) l'image monte : la caisse au-dessus des commandes
        /* (2026-09-28, chasse aux détails) LES SECOUSSES SONT DES COUPS, PLUS DE LA NEIGE : un tirage au hasard à CHAQUE image (±0,7 m à la
           réception) grésillait à 60 i/s et sautait franchement à 30 — la caméra de mort, elle, tremblait déjà en sinus lisses. Trois sinus
           désaccordés (un choc qui cogne vers le bas, puis roule) + un soupçon de roulis ; même enveloppe qu'avant (décroît de 3,5/s). */
        if(shake>0){
          if(!REDUCED_MOTION&&!window.dbgNoShake){const a9=Math.min(1.4,shake)*.3;
            camera.position.addScaledVector(F.n,a9*(Math.sin(t*31)-.6*Math.abs(Math.sin(t*17)))).addScaledVector(tmp,a9*.7*Math.sin(t*23+1.3));
            camera.rotateZ(a9*.03*Math.sin(t*27+.7));}
          shake=Math.max(0,shake-3.5*dt);
        }
        veqCamera(dt); // (2026-10-14) la caméra s'enfonce sous le choc de la pose
        // VIBRATION DE VITESSE — RELATIVE à la caisse : ça frémit dès ~45 % de TA vmax (une LA HONTE
        // à fond doit trembler autant qu'une COMÈTE à fond), puis le PLANÉ SUPERSONIQUE calme tout :
        // passé ~350 km/h affichés, l'air ne lutte plus, la caisse fend — les vibrations fondent à 30 %.
        const vmx9=vmaxShow(),
              spdN=THREE.MathUtils.clamp((speedKmh-vmx9*1.55*.35)/(vmx9*1.55*.9),0,1), // (2026-09-25) sur la CROISIÈRE (1,55×vmaxShow) : ≈.10 en croisière, et de la marge pour le momentum, le FLOW, la nitro
              calm9=1-.7*THREE.MathUtils.smoothstep(speedKmh,700,1800), // fenêtre DOUBLÉE (SPD .25→.5 : les km/h affichés ont doublé) — le plané supersonique calme au même état-caisse qu'avant, pas dès le mid-game
              spdSh=spdN*spdN*CAM_SHAKE_V*.42*calm9*(nitroOn?1.3:1); // FRISSON, pas séisme : à vmax de croisière ≈ .10 d'amplitude (la sensation vient du FOV + speed lines, le tremblement signale juste la LIMITE)
        if(spdSh>0&&!window.dbgNoShake){
          camera.position.addScaledVector(F.n,spdSh*.36*(Math.sin(t*41)+.5*Math.sin(t*67+2.1))); // (2026-09-28) un GRONDEMENT de sinus, plus un grésillement au hasard
          camera.position.addScaledVector(tmp,spdSh*.42*(Math.sin(t*37+.9)+.5*Math.sin(t*59)));
          camera.position.addScaledVector(fwdW,spdSh*.18*Math.sin(t*29+1.7));
          camera.rotateZ(spdSh*.016*Math.sin(t*33+.4)+Math.sin(t*27)*spdSh*.014);
        }
        // (vague 3) NITRO — LA CAISSE ARRACHE : la caméra DÉCROCHE (0 → pic à ~0,2 s → 0, elle recule et monte un peu) pendant que le
        // champ s'ouvre, puis revient ; tant qu'on tient, un frisson continu (deux sinus : un grondement, pas un grésillement)
        if(!REDUCED_MOTION&&!window.dbgNoShake){
          if(NFX.ign>0){const e9=NFX.ign*NFX.ign*(1-NFX.ign)*6.75*NFX.ignK,j9=Math.max(0,NFX.ign-.85)*.9*NFX.ignK; // + l'À-COUP des trois premières images (tirage PROPRE : `shake` puise dans le Math.random du jeu, et la physique aussi)
            camera.position.addScaledVector(fwdW,-1.05*e9).addScaledVector(F.n,.25*e9+(nfxR()-.5)*j9).addScaledVector(tmp,(nfxR()-.5)*j9);}
          if(nitroOn){const a9=nitroBlue?.05:.036;camera.position.addScaledVector(F.n,Math.sin(t*38.7)*a9).addScaledVector(tmp,Math.sin(t*29.3+1.7)*a9*.7);}
        }
        // indicateur de virage RETIRÉ du HUD épuré (#turnHint est display:none) : on n'évalue plus la courbe à l'avance (frameAt+trig) chaque frame pour rien
        if(airPie.style.display!=='none')airPie.style.display='none'; // (2026-09-27) une fois suffit (c'était à chaque image de conduite)
      }
    }else if(mode==='fall'){ // ---- VOL : maniabilité aérienne propre ----
      const dtF=dt*AIR_RATE; // temps de vol accéléré : même arc dans l'espace, moins de temps réel à flotter
      fallT+=dtF;fallTR+=dt; // fallT = temps-sim (figures/paiements) ; fallTR = temps RÉEL (jauge des 6 s — sinon le chrono file à ×1,6)
      NIT.vol+=dtF;if(nitroOn&&pwrNitroT<=0&&!PARK.on)NIT.nit+=dtF; /* (LA LOI DU RÉSERVOIR) la durée du vol et ce qu'on y a BRÛLÉ : la pose ne rend que la part volée nitro coupée */
      if(!nitroOn)loop._nAir=false; // (2026-09-26) l'impulsion se RÉARME au relâché
      if(bascOn){bascT+=dtF;if(bascT>1.1)bascOn=false;} /* (1/10, soir) la bascule dure UNE seconde au plus, puis c'est un vol comme un autre (ni portée, ni lèvre, ni gravité retenue) */
      const gB9=bascOn?Math.min(1,bascT/BASC_T):1; // (bord, 1/10) LA BASCULE : la caisse pivote sur la lèvre avant de tomber — la gravité s'installe en BASC_T
      volrSuit(dtF); // (LE VOL QUI SUIT LA ROUTE) le haut du vol suit la dalle survolée (route sans haut ni bas seulement)
      {const i9=tryLand._bi;if(TBORD.t>0&&(!TORD.on||Math.abs(curLatOff)>ROAD_HALF+20||Math.abs(curHOff)>20))TBORD.t=0; // (LE BORD DE LA ROUTE TORDUE) loin du bord : la gravité du monde reprend
       TBORD.on=TBORD.t>0&&i9>=0&&!!Nn[i9]; // le bas de LA ROUTE, pas celui du monde
       if(TBORD.on){TBORD.u.copy(Nn[i9]).multiplyScalar(fallStartSide).normalize();TBORD.t-=dtF;fallVel.addScaledVector(TBORD.u,-FALL_G*gK()*gB9*dtF);}else volMonte(fallVel,-FALL_G*gK()*gB9*dtF);} /* (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, la gravité est celle de la dalle survolée (VOLR) ; ailleurs, celle du monde */ // gK : gravité LUNAIRE en orbite (÷2)
      // (vol libre, 2026-09-26) l'ANTI-BLOCAGE DU LACET a sauté : il rendait « un minimum d'horizontale » parce que le volant tournait
      // autour de l'axe VERTICAL du monde (mort en trajectoire verticale). Le volant tourne désormais autour du HAUT DE LA CAISSE
      // (FLY_U) : il mord à toutes les assiettes, piqué à pic compris, et il ne redresse plus rien.
      // chute pilotée : un peu de lacet, c'est tout — la voiture est LOURDE
      // (le lacet gagne un peu d'autorité à grande vitesse → vol simplifié)
      // chute pilotée : un peu de lacet, c'est tout — la voiture est LOURDE
      // (le lacet gagne un peu d'autorité à grande vitesse → vol simplifié)
      if(VEQ.lArm)VEQ.lT+=dt; // (vol équilibré) l'horloge du verrou du volant
      const yawIn=veqVolant()*lacetVol(fallVel.length())*dtF; // (2026-10-14) le braquage tenu depuis la route ne continue plus le virage en l'air (veqVolant)
      banqLacet(fallVel,yawIn); // (vol libre) autour du haut de la CAISSE — à gauche à l'écran, c'est à gauche, même sur le dos — (2026-10-19) au GLACIER, le CAP seulement (banqLacet)
      yawAcc+=yawIn;
      /* (2026-10-17, LE RÉACTEUR QUI S'INSTALLE) lâcher le nitro en vol (ou la jauge qui se vide) faisait passer EN UNE IMAGE la gravité de 40 %
         à 100 % et l'autorité du manche de 1,7 à 0,85 rad/s — la caisse « tombait comme une pierre » et le cabré cassait net. Le plané et
         l'autorité suivent désormais `nk9`, l'état du réacteur lissé en ~80 ms (τ 1/12 s), dans les deux sens ; le COUP d'allumage (+46 m/s)
         reste sec, c'est lui qui répond au doigt. Le décollage nitro tenu part réacteur plein (startFall pose `_nk`). */
      const nk9=loop._nk=(loop._nk||0)+((nitroOn?1:0)-(loop._nk||0))*(1-Math.exp(-dtF*12));
      if(nk9>.002){if(TBORD.on)fallVel.addScaledVector(TBORD.u,FALL_G*gK()*(nitroBlue?.75:.6)*gB9*dtF*nk9);else volMonte(fallVel,FALL_G*gK()*(nitroBlue?.75:.6)*gB9*dtF*nk9);} // (LE BORD DE LA ROUTE TORDUE : il plane contre la gravité de la route) (bord, 1/10 : au prorata de la bascule — jamais de remontée) (vol v7) le RÉACTEUR fait PLANER : il reprend 60 % de la gravité (75 % en réserve bleue)
      if(nitroOn){ // RÉACTEUR : il fait planer et donne l'assiette (piqué/cabré) — il n'accélère plus (vol v7 : inertie)
        /* (2026-09-26, user : « le boost nitro aérien doit VRAIMENT donner une impulsion, indépendamment de la vitesse de départ, qui s'y
           additionne, comme un propulseur ») : à l'ALLUMAGE en vol, un coup de réacteur de +32 m/s (× le palier moteur) dans l'axe du
           vol, quelle que soit la vitesse d'éjection. Un par allumage (0,5 s mini entre deux), et il coûte 12 % de réserve. */
        if(!loop._nAir&&nitroOn&&(performance.now()-(loop._nAirT||0))>500){loop._nAirT=performance.now();loop._nAir=true;
          const sp8=fallVel.length(),a8=46*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1); // (2026-09-26, user : « dans l'air le nitro doit accélérer plus ») 32 → 46 m/s
          if(sp8>1)fallVel.multiplyScalar((sp8+a8)/sp8);else fallVel.addScaledVector(FLY_U,a8);
          FLC.t=performance.now();FLC.k=sp8>1?sp8/(sp8+a8):1;FLC.n=nitroR;FLC.ok=true; // (2026-10-14) noté : si c'est le 1er appui d'un DOUBLE-TAP, la figure le rend (figLance)
          fallVH0=Math.max(fallVH0,volH(fallVel));if(pwrNitroT<=0){const av9=nitroR;nitroR=Math.max(0,nitroR-NITRO2.coup*nitroCap()*(FLOW.lv===4?FLOW2.fren.nitro:1));if(LIVRE.on)livre('n-:coup',av9-nitroR);}
          FLC.c=Math.max(0,FLC.n-nitroR);fovPunch=Math.max(fovPunch,12);shake=Math.max(shake,.35);} // (vague 3) le reste du coup — onde, bords, WHOOMP, vibreur — vient de `nitroAllume`, qui part à la même image (il le doublait)
        { // (2026-09-26, user : « le nitro en l'air ne sert pas qu'à guider, il faut que ça ACCÉLÈRE vraiment ») : la MÊME poussée qu'au sol
          // (30 · 48 en réserve bleue × le palier moteur), dans l'axe du vol — et l'élan gagné au réacteur est GARDÉ (le plafond d'inertie suit)
          // (2026-09-26, user : « dans l'air le nitro doit accélérer plus ») : DEUX FOIS la poussée du sol (60 · 96 en réserve bleue) — rien ne
          // freine en l'air, mais un vol dure 2 à 4 s : à la poussée du sol, on ne sentait presque rien avant de se reposer
          const sp9=fallVel.length();if(sp9>1){const a9=(nitroBlue?96:60)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dtF;
            fallVel.multiplyScalar((sp9+a9)/sp9);fallVH0=Math.max(fallVH0,volH(fallVel));}}
        // ↑/AVANT : PIQUÉ · ↓/FREIN : CABRÉ. On fait TOURNER la vitesse en tangage (pitch) au lieu
        // d'ajouter à .y : ajouter ±12 à un vecteur de 145 puis reclamper ne pliait la trajectoire que
        // de ~4°/s (« le nitro haut/bas ne marche plus » — surtout au plafond de vitesse du parc). La
        // ROTATION donne une autorité FORTE et INDÉPENDANTE de la vitesse (on plie autant à 260 qu'à 80).
        // BORNÉE à ±65° d'assiette → jamais vertical → pas de gimbal-lock, pas de vrille coincée.
        // VOLANT TACTILE : l'assiette devient ANALOGIQUE (2026-10-10, Léo : pouce vers le HAUT = MONTE (cabré), vers le BAS =
        // plonge, par défaut ; le réglage PLONGE rend le manche d'avion) — même levier, dosé. Zone morte large : tourner ne doit jamais cabrer par accident.
        const pitT=TCTL.act?TCTL.sv*volSens():0; // (2026-09-29) réglage « POUCE HAUT EN VOL : PLONGE / MONTE »
        const wPitch=pitT!==0?(Math.abs(pitT)<.05?0:-pitT):((keys.KeyW||keys.KeyZ||keys.ArrowUp)?-1:0)+(dn?1:0); // -1 = piqué, +1 = cabré
        // (vol libre, 2026-09-26) plus de plafond à ±65° ni de repli « à l'horizontale » : le manche fait tourner la trajectoire ET le
        // haut de la caisse autour de SA droite (FLY_R) — piqué, cabré, looping : aucune assiette n'est interdite, rien ne se bloque
        // (des vecteurs qui tournent autour d'un axe local : pas d'angle d'Euler, donc pas de gimbal-lock).
        pitchS+=(wPitch-pitchS)*(1-Math.exp(-dtF*(pitT!==0?VOL_LIS_D:VOL_LIS))); /* (2026-10-14, sensations) τ 30 ms quand c'est le pouce qui donne l'assiette · (2026-10-09) LE MANCHE LISSÉ COMME LE VOLANT (τ 47 ms) : le lacet passait par le lissage de steer, le tangage attaquait brut — 97°/s d'un coup au clavier, dosage aux petits coups. Plafonds inchangés (1,7 / 0,85 rad/s) */
        if(Math.abs(pitchS)>1e-4){const a9=-pitchS*(.85+.85*nk9)*dtF;fallVel.applyAxisAngle(FLY_R,a9);FLY_U.applyAxisAngle(FLY_R,a9);} // (2026-10-17) 1,7 rad/s réacteur plein (nk9 : voir LE RÉACTEUR QUI S'INSTALLE)
        // jet visible au point de poussée arrière : panache conique, jamais deux fois pareil
        flames.mesh.material.color.set(nitroBlue?0x5b7dff:pwrNitroT>0?NINF.jet:0xff7a24);    // (vague 3) le RÉACTEUR aux couleurs de la bible : feu #ff7a24, réserve #5b7dff
        flameCore.mesh.material.color.set(nitroBlue?0xd6e2ff:pwrNitroT>0?NINF.core:0xffe4bc); // cœur blanc chaud / blanc bleuté
        embers.mesh.material.color.set(nitroBlue?0x8ea4ff:pwrNitroT>0?0xc79bff:0xffa24a);
        tmp3.set(0,0,1).applyQuaternion(carGroup.quaternion);
        potAuHasard(tmp2); // (2026-09-26) en vol aussi, le feu sort des POTS (avant : 2,4 m derrière le centre, au milieu)
        if(Math.random()<.7)spawnP(embers,
          tmp2.x-tmp3.x*.1,tmp2.y-tmp3.y*.1,tmp2.z-tmp3.z*.1,
          -tmp3.x*(8+Math.random()*10)+(Math.random()-.5)*5,-tmp3.y*8+2+Math.random()*3,-tmp3.z*(8+Math.random()*10)+(Math.random()-.5)*5,
          .4+Math.random()*.45);
        for(let r9=0,rp9=emiN('jet',dt);r9<rp9;r9++)for(let j9=0;j9<5;j9++){ // (2026-10-09) à la seconde : voir emiN
          potMonde(CAR_POTS[j9%CAR_POTS.length],tmp2);
          tmp2.x+=(Math.random()-.5)*.14;tmp2.y+=(Math.random()-.5)*.14;tmp2.z+=(Math.random()-.5)*.14;if(r9)tmp2.addScaledVector(fallVel,-SPD*dtF*r9/rp9);
          const pw=21+Math.random()*9,spr=1.7; // vol : le jet reste un CRAYON de feu, pas une gerbe
          spawnP(flames,tmp2.x,tmp2.y,tmp2.z,
            -tmp3.x*pw+(Math.random()-.5)*spr,-tmp3.y*pw+(Math.random()-.5)*spr,-tmp3.z*pw+(Math.random()-.5)*spr,
            .07+Math.random()*.10);
          if(j9<3)spawnP(flameCore,tmp2.x,tmp2.y,tmp2.z,
            -tmp3.x*(pw+7)+(Math.random()-.5)*.9,-tmp3.y*(pw+7)+(Math.random()-.5)*.9,-tmp3.z*(pw+7)+(Math.random()-.5)*.9,
            .05+Math.random()*.07);
        }
        if(Math.random()<.5)spawnP(embers, // (vague 3) les braises du réacteur (elles étaient CYAN néon, même en nitro orange : deux signaux contradictoires)
          carGroup.position.x-tmp3.x*2.5,carGroup.position.y-tmp3.y*2.5,carGroup.position.z-tmp3.z*2.5,
          -tmp3.x*20+(Math.random()-.5)*6,-tmp3.y*20+(Math.random()-.5)*6,-tmp3.z*20+(Math.random()-.5)*6,.3);
      } else { // VOL SANS BOOST : léger pilotage haut/bas — assez pour infléchir la trajectoire, bien moins qu'au réacteur
        // (2026-09-27, user : « quand j'essaye de redresser dans les airs sans le nitro ça fait rien ») : cette branche ne lisait que le
        // CLAVIER — sur téléphone le pouce (axe Y du volant) était ignoré sans nitro. Même lecture qu'au réacteur : analogique, zone morte.
        const pitT=TCTL.act?TCTL.sv*volSens():0;
        const wPitch=pitT!==0?(Math.abs(pitT)<.05?0:-pitT):((keys.KeyW||keys.KeyZ||keys.ArrowUp)?-1:0)+(dn?1:0); // ↑ piqué · ↓ cabré
        pitchS+=(wPitch-pitchS)*(1-Math.exp(-dtF*(pitT!==0?VOL_LIS_D:VOL_LIS))); // (2026-10-14) τ 30 ms au pouce · (2026-10-09) le même manche lissé (voir le réacteur)
        if(Math.abs(pitchS)>1e-4){const a9=-pitchS*(.85+.85*nk9)*dtF;fallVel.applyAxisAngle(FLY_R,a9);FLY_U.applyAxisAngle(FLY_R,a9);} // (vol libre) même manche, sans plafond — 0,85 rad/s : on infléchit, on ne pilote pas — (2026-10-17) l'autorité du réacteur s'éteint en ~80 ms (nk9)
      }
      /* (vol v7, 2026-09-25, user : « l'airtime doit être basé sur un principe d'INERTIE, dépendre de la vitesse de la voiture au
         moment de l'éjection, et PAS de sa vitesse max ») : en l'air, la caisse garde la vitesse qu'elle avait en quittant la route —
         seule la GRAVITÉ agit (elle accélère en chute, freine en montée). Le volant et le piqué/cabré TOURNENT la vitesse sans
         l'augmenter, et la nitro ne pousse plus en avant (elle fait PLANER : voir plus haut). Garde-fou : l'avance HORIZONTALE ne
         dépasse jamais celle de l'éjection (un cabré qui convertirait la chute en élan ne crée pas de vitesse). Aucune lecture de
         maxSp : la portée d'un saut ne dépend que de la vitesse d'éjection. */
      {const hx9=volH(fallVel);if(fallVH0<0)fallVH0=Math.max(hx9,fallVel.length()); // (vol libre) plafond = la vitesse d'ÉJECTION entière : sortir d'un piqué à l'horizontale reste possible (le manche n'a plus de butée), jamais plus vite qu'au décollage
       if(hx9>fallVH0&&hx9>1){const f9=fallVH0/hx9;volHK(fallVel,f9);}} /* (LE VOL QUI SUIT LA ROUTE) « à plat » = perpendiculaire au haut du vol */
      try{jadeEauVol(dt,dtF);}catch(e){loopWarn(8192,'eau',e);} // (2026-10-13) LA MER COMME LE CIEL (voir EAU)
      try{banqSolVol(dt,dtF);}catch(e){loopWarn(262144,'banquise',e);} // (2026-10-14) LA BANQUISE : la poudreuse qui porte et qui avale, la glace où l'on glisse (voir banqSolVol)
      if(PARK.on&&fallVel.lengthSq()>PARK_VCAP*PARK_VCAP)fallVel.setLength(PARK_VCAP); // PARC : la nitro infinie ne t'emballe pas non plus EN L'AIR — vol rapide mais pilotable
      fallPos.addScaledVector(fallVel,dtF*SPD);
      carGroup.position.copy(fallPos);
      speedKmh=volH(fallVel)*3.6*SPD; // (vol v6) la vitesse d'AVANCE, comme sur la route — la chute verticale ne gonfle plus les filés ni le compteur
      pickupsTick(dt); // (2026-09-30) LE RAMASSAGE EN VOL — la caisse est posée à sa place de l'image ; AVANT les figures, qui remettent le radar de dalle (`curNear`) à zéro
      // ---- FIGURES EN VOL : chaque exploit se nomme à la seconde où il naît ----
      {
        const halfs=Math.floor(Math.abs(yawAcc)/Math.PI); // vrilles : un cri par demi-tour de lacet
        if(halfs>spinHalf&&fallT>.45){spinHalf=halfs;
          addTrick('vrille',halfs===1?'180°':halfs===2?'VRILLE 360 — LAVE-LINGE !':halfs===3?'540° !!':(halfs*180)+'° — '+TR('ESSOREUSE COSMIQUE !!'),3.5*halfs,halfs>=4?3:(halfs>=2?2:false),true);}
        if(!trkBigA&&fallTR>1.8){trkBigA=true;chaineAura('BIG AIR',50,'bigair',false,SONV2);if(SONV2)sfx('fig.bigair',{st:echSt()});flowAdd(6,'risque');}          // (aura v2) le temps passé EN L'AIR se paie
        if(!trkMonstre&&fallTR>3.4){trkMonstre=true;chaineAura('AIR MONSTRE',110,'monstre',false,SONV2);if(SONV2)sfx('fig.monstre',{st:echSt()});flowAdd(10,'risque');}
        if(curNear){ // radar de dalle (rempli par tryLand à la frame précédente)
          curNear=false;
        }
      }
      // ---- LA MALLETTE : RETIRÉE (2026-09-29, passe qualité) — les figures ne paient plus qu'en AURA (66ab228) : le montant « 💰 $ » (PC),
      // le tremblement et le BATTEMENT DE CŒUR (téléphone compris, `mallette.chaude`) annonçaient de l'argent qui n'existe plus. `heartBeat` reste défini.
      if(speedKmh>120){ // traits d'air aussi en vol (seuils ×2 : SPD .25→.5)
        tmp.copy(fallVel).normalize();
        const nS9=speedKmh>480?3:speedKmh>260?2:1;
        for(let k9=0,n9=nS9*emiN('trV',dt);k9<n9;k9++){ // (2026-10-09) à la seconde : voir emiN
          tmp2.copy(fallPos).addScaledVector(tmp,10+Math.random()*30);
          tmp2.x+=(Math.random()-.5)*22;tmp2.y+=(Math.random()-.5)*16;tmp2.z+=(Math.random()-.5)*22;
          const ln9=4+speedKmh*.035;
          spawnStreak(tmp2.x,tmp2.y,tmp2.z,tmp.x*ln9,tmp.y*ln9,tmp.z*ln9);
        }
      }
      if(nitroOn&&!REDUCED_MOTION&&fallVel.lengthSq()>1){NFX.d.copy(fallVel).normalize();nfxVent(dt,NFX.d,fallVel.length()*3.6*SPD);} // (vague 3) les stries de vent en vol : dans l'axe de la VITESSE, pas du nez qui vrille
      // orientation stable : le nez suit la trajectoire, PAS de vrille surprise
      carGroup.scale.set(1,1,1);
      tmp.copy(fallVel).normalize();
      if(JEAU.dans||JEAU.wB>.01)jadeEauNez(tmp,dt); // (2026-10-13) DANS L'EAU : le nez garde le cap, la caisse se redresse et suit la houle
      // (vol libre) le HAUT est transporté avec la trajectoire (on lui retire sa part le long de la vitesse) : aucun (0,1,0) du monde,
      // donc plus de repère qui dégénère en piqué à pic ni de caisse qui se remet d'elle-même à l'endroit
      FLY_U.addScaledVector(tmp,-FLY_U.dot(tmp));
      if(FLY_U.lengthSq()<1e-4)FLY_U.crossVectors(tmp,FLY_R); // (garde : trajectoire retournée d'un coup — on repart de la droite)
      FLY_U.normalize();
      if(VEQ.on)veqNiveau(dt,tmp); // (2026-10-14) L'ÉQUILIBRE : le haut du vol revient à la verticale
      FLY_R.crossVectors(FLY_U,tmp).normalize();
      tmp3.copy(FLY_R);tmp2.copy(FLY_U);
      mat4.makeBasis(tmp3,tmp2,tmp);
      qTmp.setFromRotationMatrix(mat4);
      /* ⚠ LA VRILLE EST VOULUE — NE PAS LA « CORRIGER » (tranché par le user, 2026-08-05).
         La caisse tourne sur elle-même en vol, en permanence. J'ai cru à une incohérence (des ailes
         déployées sur un engin qui fait le poulet rôti) et je l'ai remplacée par une inclinaison de
         virage : le user a essayé les deux et TRANCHÉ pour la vrille, deux fois. C'est un parti pris
         ARCADE, pas un oubli — la lisibilité aéronautique n'est pas le sujet de ce jeu.
         ⚠ à ne pas confondre avec la FIGURE « vrille » qui paye : celle-là se compte en demi-tours
         de LACET (`yawAcc`) et n'a rien à voir avec cette rotation visuelle. */
      // (bord v2) après une sortie par le BORD la vrille tourne du côté du vide (`bascDir`) et DÉMARRE comme une vraie bascule : le pivot sur
      // la lèvre l'accélère de 25 % à 100 % en ~0,4 s. Hors bord : bascDir = 1, facteur 1 → la formule de toujours, au chiffre près.
      if(VEQ.on)veqCorps(dt); // (2026-10-14) LA BALANCE : plus de vrille, la caisse pivote, s'incline et se balance sur ses ressorts (voir LE VOL ÉQUILIBRÉ)
      else{
      {const r9=(bascDir*(3.0+Math.min(2,fallT*.5))*(bascOn?Math.min(1,.25+bascT*1.9):1)+steer*2.2)*dtF;airRoll+=r9*(1-JEAU.wB); // VRILLE : la caisse tourne sur elle-même (suit le vol accéléré) — (2026-10-13) l'eau l'arrête et la remet à l'endroit
       if(JEAU.wB>.01){const r0=Math.round(airRoll/6.2832)*6.2832;airRoll+=(r0-airRoll)*Math.min(1,dt*3.5*JEAU.wB);}}
      qTmp2.setFromAxisAngle(tmp,airRoll);
      qTmp.premultiply(qTmp2);
      carGroup.quaternion.slerp(qTmp,Math.min(1,dt*8));
      }
      figPose(dt); // LES FIGURES, par-dessus l'assiette — (2026-10-14) v2 : la PHYSIQUE (explosions, inertie, planté)
      if(BANQ.glisse)try{banqAssiette(dt);}catch(e){} // (2026-10-14) LA BANQUISE : sur la glace, la caisse est posée sur la facette et DÉRIVE (voir banqAssiette)
      if(SENS&&(JEAU.dans||SEAU.pose))try{sensEau(dt);}catch(e){} // (2026-10-14, sensations) L'EAU SE SENT : le bouchon, le bouillon, le creux du plongeon (voir SEAU)
      shadow.position.y=-99999;
      /* ===== LA CAMÉRA DE VOL — RETOUR À LA CAMÉRA DE POURSUITE (2026-09-28, soir, Sacha : « la caméra en air time déconne
         complètement, ça devient beaucoup trop dur de viser juste ») =====
         La v2 de l'après-midi (écart TENU à 7-9 m + plan de TROIS-QUARTS à 57° sur tout vol de plus de 1,3 s) a été filmée au banc sur
         un gros saut : dès la 1re seconde, la caméra part sur le flanc et passe SOUS la caisse — on la voit de dessous, en gros plan, la
         route n'est plus qu'un trait en biais, et gauche/droite ne correspondent plus à l'écran. Viser devient impossible. On revient à
         la caméra avec laquelle on visait : elle SUIT la trajectoire PAR DERRIÈRE — le lissage en position monde la fait traîner (15 à
         30 m sur un gros air) et c'est justement ce retard qui aligne le regard sur la direction du VOL : on voit où l'on va, l'anneau
         devant la caisse — et le champ se resserre avec l'ampleur du saut (76° → 54°) pour que la caisse reste lisible.
         ⚠ NE PAS remettre de plan de côté ni d'écart tenu court en vol : c'est ce qui a cassé la visée (verdict du 28/09 au soir).
         Gardés de l'après-midi : les secousses calmes (sinus, vent ×.42), la remise à zéro du coup de zoom PARFAIT au décollage, et les
         CHOCS en vol (bump, nuage, catapulte) — mais en petit déplacement de la caméra, plus en coup dans le REGARD (il décadrait la visée). */
      const bigAir=THREE.MathUtils.clamp((fallT-0.5)/2.2,0,1); // 0 au décollage → 1 sur un gros air
      /* (2026-10-17, LA CAMÉRA SANS SURSAUT) au sol la visée pivote du CABRAGE ANTICIPÉ (CAM_ROUTE.q, jusqu'à 24° au sommet d'une crête) ; la
         caméra de vol gardait le pivot de sa PLACE mais pas celui de sa VISÉE — le regard sautait de 4 à 14° à la 1re image de chaque saut
         depuis une bosse. La visée de conduite emporte son pivot, puis fond vers la caisse comme avant. */
      if(!(loop._camAirT>0)&&loop._vise)loop._vise.applyQuaternion(CAM_ROUTE.q);
      {const n9=performance.now();if(n9-(CAMV.t||0)>400){CAMV.zoom=0;CAMV.vtg=0;CAMV.p0ok=false;CAMV.s0=THREE.MathUtils.clamp(volTaille(camera.position.distanceTo(fallPos),camera.fov),.1,.4);}CAMV.t=n9;} // 1re image du vol : un coup de zoom PARFAIT en cours ne survit pas au décollage · la TAILLE de la caisse au sol, mesurée à l'instant du décollage
      tmp2.copy(fallPos).addScaledVector(tmp,-(9.0-bigAir*2.6)*(1-POR*.16)).addScaledVector(FLY_U,(3.5+bigAir*2.4)*(1+POR*.12)); // derrière la trajectoire, au-dessus de la caisse — « au-dessus » = vers le HAUT DE LA CAISSE (vol libre), pas vers le ciel
      /* (bord v2) LE SUIVI SANS À-COUP : l'ancien `camera.position.lerp(cible)` suivait une cible qui file — à la 1re image de vol la caméra
         passait d'un coup de « roule AVEC la caisse » (conduite : écart lissé) à « reste presque sur place » : la caisse s'échappait. On
         lisse l'ÉCART caisse→caméra, et la TRAÎNE que produisait l'ancien lerp (l'avance de la caisse, `fallVel·SPD·dtF`) s'installe en
         0,6 s — une fois installée, c'est l'ancien suivi au chiffre près (même cible, même raideur, même retard en régime établi). */
      {const oA=CAMV.oA||(CAMV.oA=new THREE.Vector3());loop._camAirT=(loop._camAirT||0)+dt;
       const c09=CAMV.p0ok&&CAMV.p0.distanceToSquared(camera.position)<100?CAMV.p0:camera.position; /* (2026-10-17) l'écart se lit sur la place d'AVANT les secousses (CAMV.p0) : relu après elles, chaque coup et le vent étaient réinjectés dans le suivi — ×1,5 à 2 à 60 i/s, ×3 à 120 Hz, et le « vent ×.42 » voulu n'existait plus */
       oA.subVectors(c09,fallPos).addScaledVector(fallVel,SPD*dtF*(1-Math.min(1,loop._camAirT/.6))) // l'écart de l'image d'avant, moins la part de traîne pas encore installée
         .lerp(tmp2.sub(fallPos),Math.min(1,dt*(3+bigAir*4.5)*(1+Math.abs(VEQ.on?VEQ.u:steer)*(lacetVolK(fallVel.length())-1)))); // suivi plus vif en gros air : la caméra ne décroche pas — (2026-10-18) et dans le VIRAGE SERRÉ, au prorata du lacet gagné (`lacetVolK`) : elle garde son retard d'avant
       camera.position.copy(fallPos).add(oA);}
      /* LE BRAS DE LA CAMÉRA (2026-09-28, nuit, Sacha : « sur mobile la voiture devient trop petite en air time — il faut juste pas que ça
         complexifie »). MESURÉ en portrait : la poursuite décroche à 17-18 m dans la 1re seconde du vol, quand le champ est encore large —
         la caisse tombait à la MOITIÉ de sa taille au sol (0,12 contre 0,23 de la demi-hauteur), pile sur les sauts courts. Désormais la
         caméra reste où la poursuite la met (même direction : derrière la trajectoire), mais jamais plus loin que la distance qui garde la
         caisse à sa taille du DÉCOLLAGE (`CAMV.s0`, mesurée à la 1re image du vol) — au champ du moment. Aucun angle ne change.
         Mesuré : 0,17-0,19 tout le vol (75-85 % du sol) au lieu de 0,12 ; la course et l'atterrissage n'ont pas bougé. */
      {const dMx=volR()/(CAMV.s0*Math.tan(camera.fov*Math.PI/360));CAMV.off.subVectors(camera.position,fallPos);const d9=CAMV.off.length();if(d9>dMx)camera.position.copy(fallPos).addScaledVector(CAMV.off,dMx/d9);}
      (CAMV.p0||(CAMV.p0=new THREE.Vector3())).copy(camera.position);CAMV.p0ok=true; // (2026-10-17) la place du suivi, AVANT secousses et vent (lue à l'image suivante)
      camUp.lerp(FLY_U,Math.min(1,dt*3)).normalize(); // (vol libre) le haut de l'écran = le haut de la caisse : la caméra ne se remet plus « à l'endroit »
      camera.up.copy(camUp);
      /* (bord v2) LA VISÉE GLISSE — c'était LE « clic » du bord : au sol la caméra vise ~10 m DEVANT la caisse (`loop._vise`, la caisse en
         bas de l'image, décalée du côté où elle file), en vol elle vise la caisse ; le passage se faisait en UNE image. La visée de conduite
         fond désormais vers la caisse en ~0,4 s, la penche du virage aussi — et comme `n9Saut` reste nourri en vol, la visée repart EN
         DOUCEUR à l'atterrissage au lieu d'y sauter. */
      if(Math.abs(camLean)>.001){camLean*=Math.exp(-dt*5);qTmp2.setFromAxisAngle(tmp,-camLean);camera.up.applyQuaternion(qTmp2);}
      loop._viseR=0;(loop._carPrev||(loop._carPrev=new THREE.Vector3())).copy(fallPos); /* (2026-10-01) à la pose, la visée de conduite repartira en douceur — et la caméra de route, de la caisse de cette image */
      {const v9=loop._vise;if(v9){if(n9Saut(loop))v9.set(0,0,0);else v9.multiplyScalar(Math.exp(-dt*5));}
       camera.lookAt(fallPos.x+(v9?v9.x:0),fallPos.y+(v9?v9.y:0),fallPos.z+(v9?v9.z:0));}
      // LES CHOCS EN VOL SE SENTENT (bump sur la tranche, surf de nuage, catapulte) — un petit déplacement qui décroît ici, le regard reste sur la caisse
      if(shake>0){if(!REDUCED_MOTION&&!window.dbgNoShake){const a9=Math.min(1.3,shake)*.12;
        camera.position.addScaledVector(FLY_R,Math.sin(t*47)*a9).addScaledVector(camUp,Math.sin(t*37+1.3)*a9*.8);}
        shake=Math.max(0,shake-3*dt);}
      // (2026-09-26) la NITRO se VOIT en l'air : le champ s'ouvre sous la poussée (comme au sol) et le coup de réacteur de l'allumage
      // (`fovPunch`) claque ici aussi — avant, il n'était lu qu'au sol et partait en retard, à l'atterrissage
      fovPunch=Math.max(0,fovPunch-dt*18);
      /* LE VERTIGO DU PLONGEON (2026-10-15, Sacha : « un effet de caméra pour le fun et la sensation de vitesse de l'air time »). Dans la
         DESCENTE, le champ s'ouvre avec la vitesse de chute (jusqu'à +20°) — et comme le BRAS ci-dessus garde la caisse à sa taille du
         décollage, la caméra se RAPPROCHE d'elle-même : la caisse ne bouge pas, le décor s'étire, la route d'en bas file vers soi (le
         « vertigo » des films). Aucun angle ne change : la visée du 28/09 reste intacte. Montée et sommet : rien. Dans l'eau : rien. */
      CAMV.vtg+=((JEAU.dans?0:THREE.MathUtils.smoothstep(-volVu(fallVel),12,70))-CAMV.vtg)*Math.min(1,dt*5);
      const fovAir=fovPor(76-bigAir*22+CAMV.vtg*20*FOVP_K+fovPunch*FOVP_K+(nitroOn?(nitroBlue?18:13):0)); // le champ se resserre avec l'ampleur du saut (76° petit air → 54° gros air) — et se rouvre dans le plongeon (le vertigo)
      camera.fov+=(fovAir-camera.fov)*Math.min(1,dt*(NFX.off>0&&fovAir<camera.fov?2:4)); // (vague 3) la nitro coupée : le champ retombe en douceur
      camera.updateProjectionMatrix();CAM_HEROS.leveApplique(dt,0); // (CAM_HEROS) en vol le décentrement s'efface en douceur
      // (2026-09-28) le vent du VOL au même régime que celui du sol (×.42, le PLANÉ SUPERSONIQUE qui calme, « Réduire les animations ») :
      // en l'air la caméra tremblait 3 à 6 fois plus fort qu'au sol, en bruit blanc, pile sur le beau plan de trois-quarts des gros sauts
      const fshN=THREE.MathUtils.clamp((speedKmh-180)/360,0,1.2),fsh=(REDUCED_MOTION||window.dbgNoShake)?0:fshN*fshN*CAM_SHAKE_V*.42*(1-.7*THREE.MathUtils.smoothstep(speedKmh,700,1800));
      if(fsh>0){
        camera.position.addScaledVector(camUp,fsh*.36*(Math.sin(t*41)+.5*Math.sin(t*67+2.1)));
        camera.position.addScaledVector(FLY_R,fsh*.42*(Math.sin(t*37+.9)+.5*Math.sin(t*59)));
        camera.rotateZ(fsh*.02*Math.sin(t*33+.4)); // le vent secoue aussi l'horizon
      }
      if(nitroOn&&!REDUCED_MOTION&&!window.dbgNoShake)camera.position.addScaledVector(camUp,Math.sin(t*38.7)*(nitroBlue?.05:.036)); // (vague 3) le réacteur GRONDE dans l'image
      if(elTurn.style.opacity!=='0')elTurn.style.opacity=0; // (perf) une fois suffit
      // viseur : où vais-je atterrir ?
      LM.vu=false; // (la dernière pose trouvée reste en place pendant le fondu de sortie)
      tmp2.copy(fallPos);tmp3.copy(fallVel);
      CAMV.eta=99; // (caméra de vol v2) temps avant la réception prédite — 99 = rien en vue
      /* (2026-10-09) LE VISEUR HONNÊTE : il n'intégrait que la gravité pleine — nitro tenue, la vraie chute est 2,5× (orange) à 4× (bleue)
         plus lente et la poussée allonge le vol : l'anneau annonçait une pose trop COURTE et trop DURE (rouge au lieu d'or) pile quand on
         pilote au réacteur. Même loi que la chute : plané (60 / 75 %), poussée dans l'axe (60 / 96 × palier × NITROOO), bascule du bord. */
      const vg9=nitroOn?1-(nitroBlue?.75:.6):1,th9=nitroOn?(nitroBlue?96:60)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*.12:0;
      for(let st2=0;st2<14;st2++){ // même intégration que la vraie chute : vel par seconde, position ×SPD
        if(th9>0){const sp9=tmp3.length();if(sp9>1)tmp3.multiplyScalar((sp9+th9)/sp9);}
        volMonte(tmp3,-FALL_G*gK()*(bascOn?Math.min(1,(bascT+st2*.12)/BASC_T):1)*vg9*.12); // (LE VOL QUI SUIT LA ROUTE) le viseur tombe comme la caisse : vers la dalle survolée sur la route sans haut ni bas
        lmP.copy(tmp2);
        tmp2.addScaledVector(tmp3,.12*SPD);
        // le point le plus proche à moins de 20 m, 1 sur 8, trous exclus (le viseur ne promet jamais un atterrissage dans le vide)
        // (2026-09-27, passe perf iPhone) balayage en casiers (dalleProche) : même point élu, ~6× moins de distances
        const bi=dalleProche(tmp2.x,tmp2.y,tmp2.z,8,400,-1);
        if(bi>=0){
          dTmp.subVectors(tmp2,pts[bi]);
          const h2=dTmp.dot(Nn[bi]),l2=dTmp.dot(B[bi]);
          if(Math.abs(l2)<ROAD_HALF&&h2>-THICK-1&&h2<3){
            /* (2026-10-20) DESSUS OU DESSOUS : le côté d'où l'on ARRIVE (le pas d'avant, dans le repère de CETTE dalle), comme tryLand (prevH > −1,2 →
               dessus). Avant, le seul signe de h2 décidait : un pas tombé à mi-épaisseur posait l'anneau SOUS la route alors que la caisse allait se poser dessus. */
            const hP9=lmP.sub(pts[bi]).dot(Nn[bi]),dessus9=hP9>-1.2?true:hP9<-THICK+1.2?false:h2>-1.3;
            landMark.position.copy(pts[bi]).addScaledVector(B[bi],l2).addScaledVector(Nn[bi],dessus9?.3:-THICK-.3);
            landMark.quaternion.setFromRotationMatrix(mat4.makeBasis(T[bi],B[bi],Nn[bi]));
            LM.vu=true;CAMV.eta=(st2+1)*.12;
            const impP=Math.abs(tmp3.dot(Nn[bi])); // impact PRÉDIT — même unité que le verdict d'atterrissage
            LM.c.setHex(impP<4.5?0xffd75e:impP>=10?0xff5040:0xffffff);if(LM.a<.05)landMark.material.color.copy(LM.c); // or = fenêtre PARFAIT, rouge = posé lourd — la teinte GLISSE de l'une à l'autre
            landMark.scale.setScalar(impP<4.5?1+Math.sin(t*10)*.12:1); // l'anneau OR pulse : vas-y, c'est maintenant
            // assistance d'atterrissage : recentre doucement (d'autant plus qu'on va vite)
            const asF=AIR_ASSIST*THREE.MathUtils.clamp(fallVel.length()/60,.2,1.4);
            fallVel.addScaledVector(B[bi],-l2*asF*dt*.5);
            break;
          }
        }
      }
      mirTick(dt);if(JADE.root&&jadeEauOk()){MIR.t=0;MIR.max=0;} // (2026-10-13) au-dessus de la mer, aucune chute n'est perdue d'avance // (2026-09-28) MIRACULÉ : depuis combien de temps cette chute est-elle perdue d'avance ?
      LM.a+=((LM.vu?1:0)-LM.a)*Math.min(1,dt*(LM.vu?14:7));landMark.visible=LM.a>.02;landMark.material.opacity=.85*LM.a;
      landMark.material.color.lerp(LM.c,Math.min(1,dt*12));
      // camembert de temps de vol (cyan plein pendant AIRTIME INFINI : c'est le pouvoir qui s'égrène)
      if(airPie.style.display!=='block')airPie.style.display='block'; // (2026-09-27) une fois par vol, plus à chaque image
      const inf9=pwrAirT>0&&TUTO.pa; // l'airtime PRÊTÉ par l'auto-école reste INFINI ; le RAISIN, lui, DOUBLE la jauge (voir RAI)
      const fr=inf9?Math.min(1,pwrAirT/PWR_DEFS.a.t):Math.max(0,1-fallTR/airMax()); // jauge en temps RÉEL : 6 s affichées = 6 s vécues
      if(airFlash>0)airFlash=Math.max(0,airFlash-dt);
      const dbl9=pwrAirT>0&&!TUTO.pa; // (raisin) DEUX jauges : la 1re, puis — les ailes perdues — la 2e, de même durée
      airPieDraw(dbl9&&RAI.stage===1?0:fr,inf9?pwrAirT:Math.max(0,airMax()-fallTR),airFlash>0);
      raisinHud(dbl9,dbl9?(RAI.stage===1?fr:1):0);
      {const dg=!inf9&&airMax()-fallTR<1.5;if(dg!==loop._pdg){loop._pdg=dg;airPie.classList.toggle('danger',dg);} // (2026-09-26) il TREMBLE sous 1,5 s
       // …et il TIQUE : les yeux sont sur la caisse, pas sur le chrono — un tic dans la tonalité qui accélère, plus une micro-vibration
       if(dg){loop._atk=(loop._atk||0)-dt;if(loop._atk<=0){const r9=Math.max(0,airMax()-fallTR);loop._atk=.09+.25*r9/1.5;try{if(SONV2)sfx(r9<.5?'alerte.tac':'alerte.tic');else chimeNote(noteP(r9<.5?4:2,1),0,.06,.06);}catch(e){} /* (console) un danger sonne en BOIS, jamais en cloche de récompense */hap(5);}}else loop._atk=0;}
      if(TCTL.on&&!TUTO.on&&!(SAVE.d.ast&2)){loop._astV=(loop._astV||0)+dt;if(loop._astV>1){SAVE.d.ast|=2;SAVE.mark(); // ASTUCE (une fois à vie) : l'assiette au pouce
        misBanniere('ASTUCE',TR(volSens()<0?"En l'air : pouce en HAUT = monte, en BAS = plonge.":"En l'air : pouce en HAUT = plonge, en BAS = monte."),'','eclair');}}
      if(!PARK.on&&portalMesh&&(PCUBE.on?pcubeFranchi(fallPos):fallPos.distanceToSquared(PORTAL.c)<PORTAL.R*PORTAL.R*.9)&&!PORTV.att)portailPasse(); // (2026-09-26) l'ovule traversé EN VOL — du ciel, de côté, d'en dessous
      else if(FORET.root&&(FORET.heurt=foretHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(foretHeurt,FORET.heurt,1.1);explode(FORET.heurt);} // (2026-10-14) LA FORÊT NOIRE : un géant, une cime, le sous-bois
      else if(GROTTE.root&&(GROTTE.heurt=grotteHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(grotteHeurt,GROTTE.heurt,1);explode(GROTTE.heurt);} // (2026-10-18) LES PROFONDEURS : la roche, la lave, l'eau, les gros décors
      else if(BANQ.root&&(BANQ.heurt=banqHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(banqDans,BANQ.heurt,.3);explode(BANQ.heurt);} // (2026-10-14) LA BANQUISE : trop profond dans la poudreuse, la glace prise de face
      else if(JADE.col&&jadeHeurt(fallPos)){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(jadeHeurt,'pic',1.1);explode('pic');} // (2026-10-09) LES PICS DE JADE : un pilier, la muraille, l'arche
      else if(CY.on&&(CY.heurt=canyonHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(canyonHeurt,CY.heurt,1);explode(CY.heurt);} // (2026-10-14) LE CANYON DES GÉANTS : la paroi, la rivière, le fond
      else if(DN.on&&(DN.heurt=dunesHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(dunesHeurt,DN.heurt,1);explode(DN.heurt);} // (2026-10-18) LES DUNES D'OR : le sable, l'oasis, les obélisques, la pyramide
      else if(CITY.solY!=null&&LVL.cur&&LVL.cur.vitre&&fallPos.y<CITY.solY+1.4){airPie.style.display='none';shake=Math.max(shake,1.2);if(PARK.on)parkRespawn();else{impPrep(vitreSolDans,'sol',.6);explode('sol');}} // (2026-10-18) LA VILLE VITRÉE AU SOL : le sol est dur
      else if(CITY.col&&villeHeurt(fallPos)){airPie.style.display='none';shake=Math.max(shake,1.2);if(PARK.on)parkRespawn();else{impPrep(villeHeurt,'tour',.9);explode('tour');}} // (2026-10-15) L'IMPACT, le même partout (le cratère propre aux tours, villeImpact, n'est plus appelé : Sacha veut l'explosion de l'airtime sur la ville aussi) // (2026-09-26) DANS UNE TOUR : on meurt
      else if(tryLand(dtF)){airPie.style.display='none';mirPose();} // posé : le total du DAUPHIN se fige et s'encaisse — (v5) et s'ÉCRIT enfin
      else if((airDepasse()&&!BALADE)||jadeVide(fallPos.y)){airPie.style.display='none';if(PARK.on)parkRespawn();else explode(jadeVide(fallPos.y)||MIR.t>2.2?'vide':'air');} // FREESTYLE : trop long en l'air ou chute dans le vide = on repart, jamais de mort // plongeon fatal : sous le point le plus BAS de la piste — comparer à la route « la plus proche » tuait injustement en plein plongeon de crête (elle référençait la crête au-dessus)
    }else if(mode==='boom'){ // ---- EXPLOSION ----
      if(!impCoupTick(dt)){ // (2026-10-15, L'IMPACT) pendant le COUP (0,11 s), la caisse s'écrase contre la paroi : la détonation attend
      boomT+=dt;
      for(const d of debris){
        d.v.y-=22*dt;
        d.m.position.addScaledVector(d.v,dt);
        const sv9=SENS&&BOOM_SOL.ok?d.v.dot(BOOM_SOL.n):0; // (2026-10-14, sensations) la vitesse d'arrivée sur la dalle, AVANT le rebond
        if(BOOM_SOL.ok){tmp3.subVectors(d.m.position,BOOM_SOL.p);const h9=tmp3.dot(BOOM_SOL.n),vn9=d.v.dot(BOOM_SOL.n); // (2026-09-28) roue, capot, éclats REBONDISSENT sur la route
          if(h9<.15&&vn9<0&&h9>-2.5&&Math.abs(tmp3.dot(BOOM_SOL.b))<ROAD_HALF){d.m.position.addScaledVector(BOOM_SOL.n,.15-h9);d.v.addScaledVector(BOOM_SOL.n,-1.4*vn9).multiplyScalar(.55);d.rx*=.7;d.ry*=.7;}}
        if(sv9<-3&&d.v.dot(BOOM_SOL.n)>0)try{sensBoomRebond(d,-sv9);}catch(e){} // (2026-10-14, sensations) elle vient de REBONDIR : ça s'entend, ça se voit, la roue repart
        if(IMP.on&&impRebond(d.m.position,d.v,.5)){d.rx*=.7;d.ry*=.7;} // (2026-10-15, L'IMPACT) …et sur la PAROI percutée
        if(boomT<1.2&&Math.random()<.55)spawnP(boomEmbO,d.m.position.x,d.m.position.y,d.m.position.z,d.v.x*.12,d.v.y*.12,d.v.z*.12,.3+Math.random()*.3); // (2026-09-26) chaque éclat TRAÎNE ses braises
        d.m.rotation.x+=d.rx*dt;d.m.rotation.y+=d.ry*dt;d.m.visible=d.m.position.distanceToSquared(camera.position)>(d.hid||11.5); // (vague 2) à moins de 3,4 m (+ sa taille) de l'objectif, un éclat n'est plus qu'un aplat : masqué
        if(!d.part&&d.m.material)d.m.material.emissiveIntensity=Math.max(0,.6-boomT*.45);
      }
      // (vague 2) anneaux et cœur : animés par updateBoomArt (créés une fois)
      if(SENS&&BOOM_SOL.ok)try{sensBoomBraises(boomEmbO);sensBoomBraises(boomEmbY);}catch(e){} // (2026-10-14, sensations) la pluie de braises REBONDIT sur le bitume
      if(boomLight)boomLight.intensity=Math.max(0,4.5-boomT*3);
      /* (vague 2) LE CADRAGE DE L'EXPLOSION : la secousse s'AJOUTAIT à la position d'une image sur l'autre — une marche au hasard de
         5 à 10 m en 1,8 s : la caméra partait n'importe où, passait parfois AU-DESSUS du foyer et le monde se retournait.
         (vague 3) … puis le recul de 3,5 m laissait la poursuite figée à 7-14 m, grand-angle, monde parfois à l'envers : c'est
         désormais un PLAN de cinéma, voir BOOM_CAM / boomCamTick. */
      boomCamTick(dt);
      if(elTurn.style.opacity!=='0')elTurn.style.opacity=0;
      if(boomT<2.4){if(Math.random()<dt*11)spawnP(smokePool,boomPos.x+(Math.random()-.5)*2.4,boomPos.y+1+boomT*3.2+(Math.random()-.5)*1.5,boomPos.z+(Math.random()-.5)*2.4,(Math.random()-.5)*1.4,4.5+Math.random()*2.5,(Math.random()-.5)*1.4,1.6+Math.random()*.9); // (2026-09-29, passe « jeu pro ») LA COLONNE DE FUMÉE : à 1,4 s il ne restait rien à voir
        if(Math.random()<dt*7)spawnP(boomEmbO,boomPos.x+(Math.random()-.5)*1.6,boomPos.y+.6,boomPos.z+(Math.random()-.5)*1.6,(Math.random()-.5)*3,5+Math.random()*5,(Math.random()-.5)*3,.8+Math.random()*.6);} // …et les braises qui s'en échappent
      if(boomT>1.8&&!gameOver)endGame();
      }
    }
    // traînée nitro façon Asphalt 8 — (2026-09-26, passe graphique) ÉTEINTE : ce ruban PLAT de 1,9 m posé derrière la caisse, sans
    // fondu près de l'objectif, se voyait depuis la caméra de poursuite comme un TAPIS orange sur toute la moitié basse de l'écran à
    // la nitro (mesuré en capture) — la « nappe lumineuse derrière la caisse » du verdict. Les deux rubans des tuyères (trailL/R)
    // et la plume font ce travail. (Elle allouait aussi deux tableaux par image.) `trailPush` reste défini, plus appelé.
    tmp3.set(0,0,1).applyQuaternion(carGroup.quaternion);
    tmp.set(1,0,0).applyQuaternion(carGroup.quaternion);
    tmp2.set(0,1,0).applyQuaternion(carGroup.quaternion);
    // particules
    ptTick(dt); // (particules v2) la vitesse de la caisse : le repère des étincelles étirées
    updatePool(dust,dt,2);
    try{impTick(dt);}catch(e){loopWarn(4194304,'impact',e);} // (2026-10-15) L'IMPACT : le cratère, l'étoile, les éclats, le feu qui couve
    try{impMiniTick(dt);}catch(e){loopWarn(4194304,'impact mini',e);} // (2026-10-15 soir) L'IMPACT EN MINIATURE (le coup d'épaule contre une paroi)
    updateStreaks(dt);
    updatePool(flames,dt,1);
    updatePool(flameCore,dt,1);
    updatePool(embers,dt,4.5);
    updatePool(silBraises,dt,2); // (sillage v6) les braises du sillage montent doucement
    updatePool(ventN,dt,0); // (vague 3) les stries de vent de la nitro (posées fixes : la caisse les traverse)
    updatePool(boomPool,dt,3);
    updatePool(boomRed,dt,2.5);
    updatePool(boomYel,dt,3.5);
    updatePool(smokePool,dt,2.5);
    updatePool(sparkGold,dt,-2); // (2026-09-26) la chute vient désormais de la VRAIE gravité (acc) : l'étincelle part, monte, retombe en arc
    updatePool(sparkBlue,dt,-1);
    updatePool(sparkPink,dt,-1);
    updatePool(spray,dt,9);   // ⚠ gravité POSITIVE : l'eau retombe (c'est tout ce qui la sépare d'une étincelle)
    updatePool(foam,dt,2.4);
    updatePool(cloudBits,dt,-2.2); // les morceaux de nuage retombent doucement
    updatePool(gouttes,dt,9); // (2026-10-21) les gouttelettes de la pluie sur la caisse retombent
    updatePool(juicePool,dt,-16);  // le jus retombe VITE : c'est lourd, une goutte
    updatePool(boomTom,dt,-22);
    updatePool(boomEmbR,dt,1.2);
    updatePool(boomEmbO,dt,0);   // (2026-09-26) les braises orange et jaunes RETOMBENT (acc) — seules les rouges montent encore
    updatePool(boomEmbY,dt,0);
    updatePool(neonPool,dt,2.5);
    for(let i9=chips.length-1;i9>=0;i9--){
      const d=chips[i9];
      d.life-=dt;d.v.y-=20*dt;
      d.m.position.addScaledVector(d.v,dt);
      d.m.rotation.x+=d.rx*dt;d.m.rotation.y+=d.ry*dt;
      if(d.life<=0){scene.remove(d.m);if(!d.sh){if(d.m.material.dispose)d.m.material.dispose();if(d.m.geometry)d.m.geometry.dispose();}chips.splice(i9,1);} // géométrie unique des débris : libérer le GPU aussi
    }
    billsTick(dt); // (vague 2) billets volants : un seul appel de dessin (InstancedMesh)
    // ---- LOD DE PROXIMITÉ : on ne s'occupe QUE du couloir utile ----
    // La scène porte ~1550 meshes (≈550 pièces + ≈590 plots). Avant, CHAQUE frame faisait tourner les
    // 600 pièces à l'autre bout de la piste : 600 quaternions + 600 matrices monde recalculées pour des
    // objets invisibles, plus autant de tests de frustum. Tout ce qui est hors du couloir est masqué
    // (`visible=false` = ni draw call, ni frustum, ni matrice). Le rayon s'élargit avec la vitesse pour
    // que rien n'apparaisse sous le nez, et en VOL on se recentre sur la portion de piste survolée
    // (`lastNearS`) — sinon le couloir resterait figé au point de décollage et la zone d'arrivée
    // se retrouverait vide pendant tout le saut.
    {
      const cS=(mode==='fall'?lastNearS:s),lodR=620+Math.abs(vA)*1.1;
      for(const pk of pickups){
        if(pk.taken)continue;
        // ⚠ LA FACE D'EN DESSOUS NE SE DESSINE PAS AU SOL (2026-09-25) : chaque pickup existe en miroir sous la
        // route, invisible derrière la dalle mais DESSINÉ quand même — la moitié des appels de dessin pour rien.
        const vis=Math.abs(pk.s-cS)<lodR&&(mode==='fall'||pk.face===side);
        if(pk.mesh.visible!==vis)pk.mesh.visible=vis;
        if(!vis)continue; // hors couloir : on ne l'anime même pas (une pièce instanciée n'est tout simplement pas rangée)
        pk.mesh.rotateOnWorldAxis(pk.ax,dt*(pk.pow?1.4:2.5));
        if(pk.nitro||pk.pow){if(pk.sc0==null)pk.sc0=pk.mesh.scale.x;pk.mesh.scale.setScalar(pk.sc0*(1+(pk.pow?.10:.08)*Math.sin(t*6+pk.s)));} // (2026-09-26) le battement RESPECTE l'échelle (il ramenait les fruits de ×1,9 à ×1)
        pk.mesh.updateMatrix(); // (perf) les objets sont GELÉS : on recalcule à la main ceux qui tournent (et ceux que l'aimant a tirés plus haut)
        if(pk.ci)coinPose(pk); // la pièce : sa matrice est rangée en tête de l'instance
      }
      coinFlush(); // le couloir de l'image part au GPU d'un bloc — et `count` s'y arrête
    }
    updateMoneyRain(dt,t);
    updatePigeons(dt,t);
    updateClouds(dt,t);
    pluieCaisseTick(dt); // (2026-10-21) la pluie éclabousse la caisse
    for(let i9=skulls.length-1;i9>=0;i9--){ // crânes qui tournoient puis s'estompent
      const k9=skulls[i9];
      k9.life-=dt;k9.v.y-=18*dt;
      k9.m.position.addScaledVector(k9.v,dt);
      k9.m.material.rotation+=k9.rs*dt;
      if(k9.life<.6)k9.m.material.opacity=Math.max(0,k9.life/.6);
      if(k9.life<=0){scene.remove(k9.m);k9.m.material.dispose();skulls.splice(i9,1);}
    }
    carLight.position.copy(carGroup.position);carLight.position.y+=3;carLight.distance=12;carLight.decay=2; // ⚠ le menu la passe à 60 : on la reprend à chaque image de course
    if(SURV.last&&!gameOver){carLight.color.setHex(Math.sin(t*18)>0?0xff3030:0x7a1010);carLight.intensity=1.6+Math.sin(t*18)*.9;} // DERNIER : la caisse clignote rouge
    else if(fever>0){carLight.color.setHex(0xffd75e);carLight.intensity=.9+Math.sin(t*12)*.45;}
    else{carLight.color.setHex(0xfff2ea);carLight.intensity=1;}
    // PHARES : le spot suit le nez de la caisse et pose sa flaque chaude 30 m devant (éteint quand la caisse explose)
    carGroup.getWorldDirection(hsF);
    headSpot.position.copy(carGroup.position).addScaledVector(hsF,1.6);headSpot.position.y+=1.5;
    headSpot.target.position.copy(carGroup.position).addScaledVector(hsF,30);headSpot.target.position.y-=1.2;
    headSpot.intensity=(mode==='boom')?0:1.85; // phares qui MORDENT le bitume (la flaque CARPOOL.head assure la lecture, le spot fait répondre le spéculaire)
    {const nu9=LVL.nuit,ok9=nu9>.02&&mode!=='boom'&&!garageOn;PHARE_FX.m.opacity=ok9?.16*nu9*(LUMK.air[0]+LUMK.air[1]*Math.min(1,Math.max(LVL.pluie||0,LVL.brume||0))):0; // (2026-10-17) le faisceau dans l'AIR ne se voit que s'il y a de quoi l'attraper : la pluie, le brouillard (LUMK.air) // (2026-09-30) MINUIT EN VILLE : les faisceaux
     for(let j=0;j<2;j++){const o=PHARE_FX.L[j];o.visible=ok9;if(!ok9)continue;hsU.set(0,1,0).applyQuaternion(carGroup.quaternion);PHARE_FX.r.set(j?1:-1,0,0).applyQuaternion(carGroup.quaternion);
       o.position.copy(carGroup.position).addScaledVector(hsF,1.9).addScaledVector(hsU,.72).addScaledVector(PHARE_FX.r,.62);o.quaternion.copy(carGroup.quaternion);}}
    if(CARPOOL.head)CARPOOL.head.visible=(mode==='drive'); // (2026-09-28) en VOL la nappe de 15 m flottait dans le ciel devant la caisse et tournait avec la vrille comme une pale // (2026-09-26) la flaque rouge et le halo nitro au sol n'existent plus : seuls les faisceaux restent
    // REFLET NITRO/BOOST : le pool de lumière colle à l'échappement (repère caisse : marche aussi sous la dalle)
    hsU.set(0,1,0).applyQuaternion(carGroup.quaternion);
    potMonde(CAR_POT_C,nitroLight.position).addScaledVector(hsF,-.3).addScaledVector(hsU,.1); // (2026-09-26) au droit des POTS, plus au milieu de la poupe
    nfxTick(dt); // (vague 3) NITRO : l'onde d'allumage, les bords de l'image, les enveloppes du coup (voir NFX)
    const nTgt=((mode==='boom')?0:(nitroOn?(nitroBlue?1.5:1.25):(boost>0?.8:0)))*(1+NFX.ign*NFX.ignK*.5); // (vague 3) l'allumage ÉCLAIRE la poupe un instant — un éclair, pas une flaque qui reste // (2026-09-26, audit rendu) AU REPOS : 0 — le reflet rouge permanent était la « tache rouge » derrière la caisse // (2026-09-25) ÷1,5 à ÷2 : additionnée aux flaques et au bloom, elle faisait la « tache violette » // .68 au repos (était .8) : les FEUX ARRIÈRE posent leur reflet rouge en permanence — braise posée, plus le point chaud qui perçait
    nitroLight.intensity+=(nTgt*(.82+.18*Math.sin(t*43))-nitroLight.intensity)*Math.min(1,dt*14); // flamme qui tremble, fondu doux
    {const FL9=CARS[level].fx,fxL=(FL9&&FL9.light!=null&&!nitroBlue)?FL9.light:null; // la signature n'éclaire QUE sous poussée
     if(nitroOn)nitroLight.color.setHex(nitroBlue?NFX_C.b:(pwrNitroT>0?(NFX_C.i):(fxL!=null?fxL:0xff7a24))); // orange nitro / bleu réserve (mêmes teintes que les particules) / VIOLET de la nitro infinie
     else if(boost>0)nitroLight.color.setHex(fxL!=null?fxL:0xffd75e); // pad turbo : coup d'or (vague 3 : l'or de la bible)
     else nitroLight.color.setHex(0xf21808);} // repos : rouge feux arrière PROFOND (la signature ne vit qu'à la nitro)
    if(NYAN.on&&!FX_EFF&&(nitroOn||boost>0)&&!nitroBlue&&!(pwrNitroT>0))nitroLight.color.setHSL((t*.55)%1,1,.6); // (2026-10-07) LE BOOST DU CHAT : son reflet passe par toutes les couleurs de l'arc-en-ciel
    if(ORBFX.feu>0&&mode!=='boom'){ // (2026-09-28) LA RENTRÉE EN FEU : le reflet quitte les pots pour le NEZ, rouge-orange, fort et vacillant — la caisse brûle
      nitroLight.color.setHex(0xff5a1e);nitroLight.position.copy(carGroup.position).addScaledVector(hsF,CARS[level].l*.5).addScaledVector(hsU,.9);
      nitroLight.intensity=Math.max(nitroLight.intensity,3.4*ORBFX.feu*(.8+.2*Math.sin(t*37)));}
    // PLUME DE RÉACTEUR : court au filage, long et affûté à la nitro — flicker haute fréquence, la flamme VIT
    /* (2026-10-07) LA LANCÉE SE VOIT : tenir sa ligne remplit l'élan (`momT`, jusqu'à ×2,8 de reprise) — un mécanisme invisible jusqu'ici. Au sol,
       la plume de croisière (.34) s'allonge avec lui jusqu'à .56 : on VOIT la caisse se charger quand on conduit propre, et retomber au coup de volant. */
    const lanc9=mode==='drive'&&!nitroOn?THREE.MathUtils.clamp(momT/4.2,0,1):0;
    const jTgt=(mode==='boom')?0:((nitroOn?(nitroBlue?1.35:1.05):((mode!=='drive'||loop._wasUp)&&Math.abs(speedKmh)>20?.34+.22*lanc9*lanc9:0))+(boost>0?.4:0));
    JETS.k+=(jTgt-JETS.k)*Math.min(1,dt*11);
    const FM9=FLM_ON?flmPas(dt,speedKmh):null,nfK9=FLM_ON&&NFEU.on?NFEU.k:0,ecl9=!!FM9&&MOTEUR_MINI&&!nitroOn&&!(boost>0)&&!(pwrNitroT>0); // ecl9 : hors nitro, la flamme EST le feu de pixels en minuscule (la goutte lisse se cache, la lueur du pot reste) // (2026-10-15) LE MOTEUR QUI AVANCE (FLM) et le FEU DE PIXELS du nitro (NFEU) — voir près de JET_DIR
    if(JETS.shells.length){
      const jOn=JETS.k>.05,fl9=FM9?1:.82+.18*Math.sin(t*57+Math.sin(t*33)*2.1);
      const iK9=NFX.ign*NFX.ignK; // (vague 3) le COUP d'allumage : la plume jaillit (+1,6 m, plus large) puis se pose
      const jl=Math.max(.03,((.5+Math.min(engTier,15)*.035)*JETS.k*2.1*fl9*(1+NFX.len*.85)+iK9*1.6*Math.min(1,JETS.k))*(1-.62*nfK9)),jr=(.09+.07*JETS.k+NFX.len*.05+iK9*.09)*(1-.25*nfK9); /* (2026-10-15) au nitro la plume n'est plus que la TORCHE dans la bouche du pot : le feu de pixels porte la longueur */ // (2026-09-26) la plume grandit avec le MOTEUR, plus avec l'index de la caisse — (vague 3) et s'ALLONGE à la nitro (×1,85 : 2 à 4 m, Asphalt) : vue à 45° par la poursuite, 2 m ne faisaient qu'un cornet
      // LA SIGNATURE DE LA CAISSE EST UN EFFET DE **NITRO**, pas une peinture permanente (décision
      // du user, 2026-08-05). Au filage la plume reste l'orange commun à tout le monde ; c'est en
      // appuyant que la caisse montre ce qu'elle a dans le ventre — le vert acide, le rose de la
      // pop-tart, l'eau du requin. Une signature qui est TOUJOURS là ne récompense plus rien.
      // ⚠ la RÉSERVE BLEUE garde la priorité absolue : c'est un SIGNAL de jeu (« tu tapes dans la
      // réserve »), et aucune identité de caisse n'a le droit d'effacer un signal.
      const FX9=CARS[level].fx,fxOn=(nitroOn||boost>0)&&!nitroBlue,inf9=pwrNitroT>0&&!nitroBlue; // (2026-09-28) NITRO INFINIE = VIOLET : un SIGNAL, il passe devant la signature de la caisse (comme la réserve bleue)
      if(inf9){jetShellM.color.setHex(NINF.jet);jetCoreM.color.setHex(NINF.core);}else{
      jetShellM.color.setHex(nitroBlue?0x5b7dff:(fxOn&&FX9&&FX9.jet!=null?FX9.jet:(nitroOn?0xff7a24:(boost>0?0xffd75e:0xff8c30)))); // (vague 2) le pad turbo souffle OR : la poussée qui vient de l'argent — (vague 3) les teintes EXACTES de la bible : feu #ff7a24, réserve #5b7dff, or #ffd75e
      jetCoreM.color.setHex(nitroBlue?0xe2ebff:(fxOn&&FX9&&FX9.core!=null?FX9.core:(nitroOn?0xfff2da:0xffe6b0)));} // (vague 3) à la nitro le cœur brûle BLANC : les diamants de choc se lisent sur le corps orange
      if(FM9&&!inf9&&!nitroBlue&&!nitroOn&&!(boost>0)){jetShellM.color.copy(FM9.cF).lerp(FM9.cB,FM9.heat).lerp(FM9.cC,FM9.pop);jetCoreM.color.copy(FM9.kF).lerp(FM9.kC,FM9.pop);} // (2026-10-15) la couleur suit la CHALEUR : rouge-orangé stabilisé, orange en charge, jaune-blanc dans un pop
      else if(nfK9>.02&&!inf9&&!nitroBlue)jetShellM.color.lerp(NFX.blanc,.35*nfK9); // (2026-10-15) au nitro, la torche chauffée à blanc
      jetGlowM.color.copy(jetShellM.color).lerp(NFX.blanc,NFX.len*.45);jetGlowM.opacity=Math.min(1,JETS.k*.95*(FM9?FM9.glow:fl9)+iK9*.5); // (vague 3) à la nitro la tuyère est chauffée à BLANC : le point le plus chaud de la flamme
      JET_T.value=t; // (2026-09-28) la flamme vivante : son bruit coule avec le temps de jeu (figé en pause)
      jetCoreM.uniforms.uRac.value.setHex(nitroBlue?(0xc6d0e6):inf9?NINF.rac:0x6f8cff); // la racine de brûleur : bleue sous le feu, lilas sous la réserve (et sous la nitro infinie)
      JET_QI.copy(carGroup.quaternion).invert();
      for(let i9=0;i9<JETS.shells.length;i9++){ // chaque pot VIT pour lui : sa longueur bat à son rythme (deux pots en phase = un décor)
        const f9=FM9?FM9.L[i9&3]:.84+.16*Math.sin(t*31+i9*2.4)*Math.sin(t*13.7+i9*1.7),m9=JETS.shells[i9],c9=JETS.cores[i9],rr9=FM9?FM9.R[i9&3]:1.1-.1*f9; // (2026-10-15) les bouffées du MOTEUR SIMULÉ, pot par pot (plus de sinus)
        m9.visible=jOn&&!ecl9;m9.scale.set(jr*rr9,jr*rr9,jl*f9);
        /* (sillage v5) LA FLAMME SUIT LA LIGNE : l'axe de la plume se couche vers les premiers mètres de SON sillage (ramenés dans le repère
           caisse), lissé, et jamais à plus de 70° de la poupe ; sans sillage (filage, repos), elle reprend l'axe de la caisse */
        const sl9=SILS[CAR_FEUX.length<2?0:(CAR_POTS[i9]&&CAR_POTS[i9].x<0?0:1)],dl9=JET_DIR[i9]||JET_DIR[0]; // (2026-10-15) la traînée part des FEUX : la plume suit celle de son côté
        if(jOn&&sl9&&sl9.dOk){JET_V.set(sl9.dX,sl9.dY,sl9.dZ).applyQuaternion(JET_QI);
          if(JET_V.z>-.34){const q9=Math.sqrt((1-.34*.34)/Math.max(1e-6,JET_V.x*JET_V.x+JET_V.y*JET_V.y));JET_V.x*=q9;JET_V.y*=q9;JET_V.z=-.34;}}
        else JET_V.copy(JET_NZ);
        dl9.lerp(JET_V,Math.min(1,dt*16)).normalize();
        m9.quaternion.setFromUnitVectors(JET_NZ,dl9).multiply(JET_QS.setFromAxisAngle(JET_Z,t*7.3)); // (plume v2) l'enveloppe TOURNE sur son axe
        if(c9){c9.visible=jOn&&!ecl9;c9.scale.set(jr*.48*(FM9?rr9:1),jr*.48*(FM9?rr9:1),jl*.72*(FM9?f9:.9+.1*f9));c9.quaternion.setFromUnitVectors(JET_NZ,dl9);}}
      const g9=.2+.55*JETS.k*(FM9?FM9.glow:fl9)+iK9*1.1+NFX.off*NFX.off*.35; // (vague 3) la tuyère FLASHE à l'allumage, hoquette à l'extinction
      for(const s9 of JETS.glows){s9.visible=jOn;s9.scale.set(g9,g9,1);}
    }
    if(FLM_ON)try{nfeuPas(dt,nitroOn&&!(NYAN.on&&!FX_EFF),nitroBlue,pwrNitroT>0&&!nitroBlue,speedKmh,FM9,ecl9&&JETS.k>.05);}catch(e){loopWarn(1048576,'feu du nitro',e);} // (2026-10-15) LE NITRO EN FEU DE PIXELS
    // LE DÉPART EN ARC-EN-CIEL (2026-09-05) : les premières secondes de chaque run brillent d'une
    // teinte qui TOURNE — signature du LANCEMENT, pas de la caisse (elle n'efface donc RIEN de la
    // réserve bleue ni des signatures par caisse : elle s'applique APRÈS leur calcul, seulement
    // pendant `startBoostT`, une fenêtre bien plus courte que la moindre partie). `setHSL` plutôt que
    // choisir des hex à la main : la teinte balaie tout le spectre sans jamais tomber sur une valeur
    // qui jure avec le bleu de réserve ou l'orange de repos qui reprennent la main juste après.
    // (2026-10-08, Léo : « le départ n'est pas de la nitro ») RETIRÉ : le départ ne tient plus la touche, il n'a plus de flamme à teinter —
    // une vraie nitro prise dans ces 3 s garde la couleur de SA caisse.
    // TRAÎNÉE DE NITRO : les rubans collent aux tuyères — orange nitro, bleu réserve, or pad turbo
    const tTgt=(mode==='boom')?0:(nitroOn?1:(boost>0?.5:0));
    trailK+=(tTgt-trailK)*Math.min(1,dt*(tTgt>trailK?16:6)); // s'allume sec, s'éteint en douceur
    hsR.set(1,0,0).applyQuaternion(carGroup.quaternion);
    const spec9=CARS[level],tz9=-(spec9.l/2+.32);
    let tcr,tcg,tcb;
    const FXT=FX_EFF||spec9.fx; // la traînée de la boutique a le dernier mot
    const trSig9=TRAINEE_SIGNAL||!FX_EFF; /* (2026-10-15 soir) une traînée ACHETÉE ne se tait plus en réserve bleue ni en nitro infinie (voir TRAINEE_SIGNAL) */
    if(!trSig9&&FXT&&FXT.trail){tcr=FXT.trail[0];tcg=FXT.trail[1];tcb=FXT.trail[2];}
    else if(nitroBlue){tcr=.52;tcg=.72;tcb=1.5;}                       // la réserve bleue reste un SIGNAL — (vague 3) calée sur #5b7dff
    else if(pwrNitroT>0){tcr=NINF.trail[0];tcg=NINF.trail[1];tcb=NINF.trail[2];} // (2026-09-28) la NITRO INFINIE aussi : son ruban est VIOLET, comme sa plume et sa jauge
    else if(FXT&&FXT.trail){tcr=FXT.trail[0];tcg=FXT.trail[1];tcb=FXT.trail[2];} // la signature de la caisse
    else if(nitroOn){tcr=1.38;tcg=.62;tcb=.17;}else{tcr=1.25;tcg=.9;tcb=.26;} // couleurs FRANCHES : le ruban doit rester orange/bleu, jamais blanc — (vague 2) le pad turbo : OR #ffd75e (il était orange, on ne le distinguait pas de la nitro) — (vague 3) la nitro calée sur le feu #ff7a24 (elle tirait au rouge)
    silBraises.mesh.material.color.setRGB(Math.min(1,tcr*.8),Math.min(1,tcg*.8),Math.min(1,tcb*.8)); // (sillage v6) les braises ont la couleur du feu du sillage
    const tw9=nitroOn?1.3+NFX.ign*NFX.ignK*.7:1; // (vague 3) à la nitro le sillage s'épaissit (et gicle à l'allumage — la tête seulement, voir sillageStep)
    { // (2026-10-15) LES TRAÎNÉES DE LUMIÈRE (voir LUMT) : une par FEU ARRIÈRE — toujours là quand on roule, embrasées par le nitro
      const nf9=Math.min(2,CAR_FEUX.length),wu9=nf9===1?SIL.un:1,ku9=.74; // ×.74 (2026-09-25) : additif + bloom, le ruban faisait un faisceau AVEUGLANT sur la route
      const arc9=(NYAN.on&&!FX_EFF)||!!(FXT&&FXT.rainbow)||!!(FXT&&FXT.rubOff),sig9=trSig9&&(nitroBlue||pwrNitroT>0); // (2026-10-07) l'ARC-EN-CIEL est la traînée de nitro du chat : la lumière se tait au nitro (sauf réserve bleue / nitro infinie, des SIGNAUX)
      const fx9=(arc9&&!sig9)?0:trailK,roule9=running&&mode!=='boom'&&Math.abs(speedKmh)>12,fr9=VIT9.frein*(1-fx9);
      VIT9.trK=DMT.act?0:fx9;if(fx9>.01){const m9=Math.max(tcr,tcg,tcb,1e-4);VIT9.trC.setRGB(tcr/m9,tcg/m9,tcb/m9);} // (2026-10-18) le halo du feu prend la couleur de sa traînée (voir carVit)
      const kB=(arc9&&!sig9&&trailK>.05)?0:roule9?LUMT.k*(1+LUMT.kF*fr9):0,kT=kB+(1-kB)*fx9; // la lumière des feux, puis l'énergie du nitro par-dessus
      const lr=LUMT.r[0]+(LUMT.rF[0]-LUMT.r[0])*fr9,lg=LUMT.r[1]+(LUMT.rF[1]-LUMT.r[1])*fr9,lb=LUMT.r[2]+(LUMT.rF[2]-LUMT.r[2])*fr9; // rouge des feux, plus vif au frein
      /* (2026-10-18, traînées) LA TRAÎNÉE GARDE SA COULEUR : le passage du rouge des feux à la couleur de la traînée était un mélange RGB à la mesure
         de l'énergie — or après le nitro elle reste à mi-énergie tant que dure le boost (trailK vise ,5) : MENTHE + rouge = un JAUNE doré, HYPERESPACE
         + rouge = un violet, la traînée en avait l'air d'une autre (VU au banc). La couleur bascule désormais vite (`cw9` : pleine dès 38 % d'énergie)
         et le court passage creuse l'éclat au lieu de montrer la teinte boueuse ; l'ÉNERGIE (longueur, chaleur, pouls) suit toujours fx9. */
      const cw9=THREE.MathUtils.smoothstep(fx9,.03,.38),cl9=(1-cw9)*(1-cw9),ct9=cw9*cw9;
      const cr9=(lr*cl9+tcr*ct9)*ku9,cg9=(lg*cl9+tcg*ct9)*ku9,cb9=(lb*cl9+tcb*ct9)*ku9,wm9=1+(tw9-1)*fx9,wl9=wu9*(LUMT.w+(1-LUMT.w)*fx9);
      loop._nOnT=nitroOn?(loop._nOnT||0)+dt:0;let kT9=DMT.act?0:kT; /* (LE DEMI-TOUR) pendant la manœuvre les traînées se taisent : accrochées aux feux, elles dessinaient une boucle sur la route */if(FXT&&FXT.pop==='neon'&&!sig9&&fx9>.05)kT9*=neonAllume(loop._nOnT); // (2026-10-16, TRAÎNÉES) ROSE NÉON : l'enseigne qui s'allume en clignotant
      SIL_STY=(FXT&&FXT.sil&&!sig9&&fx9>.4)?FXT.sil:null;
      const lgT=LUMT.lg+(SIL.LONG-LUMT.lg)*fx9;
      for(let i9=0;i9<4;i9++){const tr9=SILS[i9];
        tr9.hk=fx9;tr9.lg=lgT>tr9.lg?lgT:Math.max(lgT,tr9.lg-LUMT.rDn*dt); // la queue de nitro s'allonge d'un coup, et se fait AVALER en douceur
        if(i9<nf9){potMonde(CAR_FEUX[i9],tmp2);sillageStep(tr9,tmp2.x,tmp2.y,tmp2.z,cr9,cg9,cb9,kT9,wm9,dt,wl9);}
        else sillageStep(tr9,0,0,0,0,0,0,0,1,dt);} // un feu de moins (changement de caisse) : ce sillage s'éteint
      SIL_STY=null;
    }
    // L'ARC-EN-CIEL EST LA TRAÎNÉE DE NITRO DE CETTE CAISSE — pas un décor permanent. Il suit donc
    // `trailK`, exactement comme les rubans des autres : il se déclenche à l'appui, s'éteint en
    // douceur, et le joueur le MÉRITE. (Première version : toujours visible dès qu'on roulait ;
    // le user a tranché — les effets spéciaux de caisse sont des effets de nitro.)
    { // (2026-10-07) L'ARC-EN-CIEL EN FEU DE PIXELS (voir ARC_*) : le CHAT à la nitro (et plus en vol : 2026-10-08), ou toute caisse qui porte la
      // traînée ARC-EN-CIEL de la boutique, à la nitro. ⚠ Il s'efface en réserve bleue et en nitro infinie, comme la plume : sinon la caisse
      // arborerait ses six couleurs pendant que le reste dit « tu tapes dans la réserve » — deux messages, et le signal se perd dans la fête.
      const nyan9=NYAN.on&&!FX_EFF,arcOn9=nyan9||!!(FXT&&FXT.rainbow);
      /* (2026-10-08, Léo : « l'arc-en-ciel ne se déclenche qu'à la NITRO, pas aux boosts au sol ») il a SA propre intensité, branchée sur la
         seule nitro (au sol comme en l'air) : `trailK` s'allumait à moitié sur une plaque turbo et dans le boost qui suit la nitro, et le
         chat le sortait aussi en vol. S'allume sec, s'éteint en ~0,5 s (l'extinction : il raccourcit en étincelles, voir rainbowStep). */
      loop._arcK=(loop._arcK||0)+((nitroOn&&mode!=='boom'?1:0)-(loop._arcK||0))*Math.min(1,dt*(nitroOn?16:6));
      if(arcOn9){const rk=(DMT.act||mode==='boom'||((trSig9||nyan9)&&(nitroBlue||pwrNitroT>0)))?0:loop._arcK;
        if(nyan9)nyanPixNitro(dt,rk*.45); // ses PIXELS scintillent toujours autour, moins nombreux : l'arc-en-ciel mène
        if(nyan9)potMonde(NYAN.arc,tmp2);else potMonde(CAR_POT_C,tmp2).addScaledVector(hsU,.19); // le chat : la poupe de la pop-tart, à mi-hauteur
        rainbowStep(tmp2.x,tmp2.y,tmp2.z,rk,t,dt,-hsF.x,-hsF.y,-hsF.z);
      }else if(rainbow.m.visible&&!rainbow.apercu)rainbowCoupe();
    }
    { // (2026-10-14) LES TRAÎNÉES POP (voir TRX) : à la nitro, comme l'arc-en-ciel et WOW — `dbgTrx('grille')` en force une sur n'importe quelle caisse
      const pop9=(FXT&&FXT.pop)||TRX_FORCE;
      if(pop9||(TRX&&TRX.n)){const pk=(!pop9||mode==='boom'||(trSig9&&!TRX_FORCE&&(nitroBlue||pwrNitroT>0)))?0:(loop._arcK||0);trxStep(pop9,pk,dt);}
    }
    { // (2026-10-14) LA TRAÎNÉE WOW (voir wowStep) : le DOGE, ou toute caisse qui porte la traînée WOW — à la nitro, comme l'arc-en-ciel
      const wow9=!!(FXT&&FXT.wow);
      if(wow9||WOWT.n){const wk=(!wow9||mode==='boom'||(trSig9&&(nitroBlue||pwrNitroT>0)))?0:(loop._arcK||0);potMonde(CAR_POT_C,tmp2).addScaledVector(hsU,.25);wowStep(tmp2.x,tmp2.y,tmp2.z,wk,dt,1);}
    }
    // LA GERBE D'EAU : la caisse qui déclare `fx.spray` ne crache pas du feu mais de l'EAU. On sème
    // à la tuyère, en cône, avec une composante latérale franche — une gerbe s'ÉVASE, un jet de
    // réacteur non. Comme le reste des signatures : uniquement sous poussée, jamais en réserve bleue.
    if(FXT&&FXT.spray&&trailK>.05&&mode!=='boom'&&!nitroBlue){
      const nj=(1+(Math.random()*3|0));
      for(let q9=0;q9<nj;q9++){
        potAuHasard(tmp2); // (2026-09-26) l'eau jaillit des pots
        const bx=tmp2.x,by=tmp2.y,bz=tmp2.z;
        const pw=10+Math.random()*16,ev=(Math.random()-.5)*7; // ev = l'évasement, la signature de la gerbe
        spawnP(spray,bx,by,bz,
          -hsF.x*pw+hsR.x*ev+(Math.random()-.5)*2,
          -hsF.y*pw+hsU.y*(1.5+Math.random()*3),
          -hsF.z*pw+hsR.z*ev+(Math.random()-.5)*2,
          .22+Math.random()*.26);
      }
      if(Math.random()<.5)spawnP(foam,
        carGroup.position.x-hsF.x*3.2,carGroup.position.y-hsF.y*3.2+.2,carGroup.position.z-hsF.z*3.2,
        -hsF.x*4+(Math.random()-.5)*3,-hsF.y*4+1.2,-hsF.z*4+(Math.random()-.5)*3,
        .45+Math.random()*.5);
    }
    // LES HÉLICES DU REQUIN : elles brassent doucement au sol et s'emballent en vol (`wingT` est
    // déjà le taux de déploiement des bras — une seule variable pilote la sortie ET le régime).
    if(carProps.length){
      propSpin+=dt*(3.5+wingT*36+AILV.n*40); /* (2026-10-16) et s'emballent au boost (AILV.n) */
      for(const p9 of carProps)p9.m.rotation.y=p9.b+propSpin;
    }
    // L'AILERON DORSAL SORT AVEC LES BRAS : couché dans le dos au sol, dressé en vol. Même `wingT`,
    // donc la caisse a UN seul geste — elle s'ouvre — au lieu de deux animations qui se cherchent.
    if(carFins.length)for(const f9 of carFins)f9.scale.y=.07+.93*wingT;
    // le reflet de la traînée GLISSE sur la route derrière la caisse (même couleur que le ruban)
    trailLight.position.copy(carGroup.position).addScaledVector(hsF,-9).addScaledVector(hsU,1.1);
    trailLight.intensity=0; // (2026-09-26, audit rendu) son reflet rond sur le bitume derrière la caisse est retiré — la lumière reste en scène à 0 (retirer une lumière recompile tout) // ×1.7→1.5 : le RUBAN garde la vedette, son reflet accompagne sans s'additionner brutalement au reste
    trailLight.color.setRGB(Math.min(1,tcr),Math.min(1,tcg),Math.min(1,tcb));
