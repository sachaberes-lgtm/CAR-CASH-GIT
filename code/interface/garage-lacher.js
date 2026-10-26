/* `garageGo(d)` — passer à la caisse suivante/précédente EN MACHINE.
   ⚠ DEUX PORTES D'ENTRÉE, ET C'EST VOULU : `garageShow(i)` reste le chemin INSTANTANÉ, appelé à
   l'ouverture du garage, à la bascule de langue, après un achat (`dbgBuy`). Y coller l'animation
   ferait tourner le plateau à chaque changement de langue. `garageGo` est le chemin JOUEUR, et lui
   seul déclenche le retourneur. ⚠ si une bascule est déjà en cours on retombe sur l'instantané :
   marteler ◀ ▶ relancerait l'animation à mi-course et la caisse resterait écrasée. */
/* ============================================================================
   LE LÂCHER (2026-08-30) — on ne « ferme pas le garage pour lancer la partie », la caisse SORT.
   ----------------------------------------------------------------------------
   Trois gestes en 1,7 s, et c'est leur ORDRE qui fait la sensation :
     1. l'APPUI   — la caisse s'assoit sur ses suspensions, l'anneau du plateau s'embrase ;
     2. la SORTIE — elle part vers la porte en ACCÉLÉRANT (u², jamais linéaire : une voiture qui
        démarre à vitesse constante ne démarre pas, elle glisse) ;
     3. la PRISE DE VUE — la caméra quitte son orbite et vient se planter DERRIÈRE elle, à hauteur
        de pare-chocs, exactement là où elle sera pendant la course.
   ⚠ LE VOILE N'EST PAS UN EFFET, C'EST UN RACCORD. L'atelier et le départ de piste sont deux
   endroits sans rapport dans la scène : à la fin de la séquence il y a forcément une COUPE. Un
   fondu de 0,34 s la rend invisible ; sans lui, on téléporte le joueur et tout le travail de
   caméra est perdu sur la dernière frame.
   ⚠ la caisse VISE +Z : c'est le côté de la porte (le halo de sol est posé à `hd+rL/2`) et c'est
   aussi le nez de la caisse (les pots sont à `-l/2`, donc à l'arrière, en -Z). Les deux coïncident,
   il n'y a rien à retourner — mais si un jour la porte déménage, c'est ici que ça se règle. */
function garageLaunch(){
  if(GAR.go||!garageOn)return;
  // (2026-09-28) JOUER PENDANT UNE BASCULE : la bascule dure 1,06 s et le LÂCHER refusait de partir tant qu'elle tournait — changer
  // de caisse puis taper JOUER dans la seconde ne lançait RIEN. On la TERMINE sur-le-champ, exactement comme sa dernière image
  // (l'échange s'il n'a pas eu lieu, puis scanner éteint, échelle rendue) : la caisse qui sort est bien celle qu'on vient de choisir.
  if(GAR.sw){const SW=GAR.sw;GAR.sw=null;if(!SW.fait)garageShow(SW.to);if(GAR.scan)GAR.scan.visible=false;carGroup.scale.set(1,1,1);}
  window.__offGar=false; // (2026-10-14, chasse aux bugs) une course part : plus de RETOUR d'OFFRES vers le garage
  window.__setGar=false; // (2026-10-19) …ni des RÉGLAGES (le ⚙ du garage)
  window.__mRetour=null; // (2026-09-29) une course part de l'atelier : l'écran qui l'attend à la fin, c'est la mort, pas les missions
  try{ if(carUnlocked(garageI)){const be=$('gEquip'); if(be&&be.getAttribute('aria-disabled')!=='true')be.click();} }catch(e){}
  if(CHUTE.on){chuteLance();return;} // (2026-09-30) LA CHUTE : depuis le ciel, pas de porte — elle PIQUE vers la route (voir chuteRender)
  if(!GAR._v)GAR._v=new THREE.Vector3();
  if(!GAR._c)GAR._c=new THREE.Vector3();
  /* (2026-09-30, Léo : « fais le retour vers la porte (mieux) quand on appuie sur PLAY ») LE RETOUR AU FEU : si le regard est parti
     ailleurs (le glissé, le balancement), JOUER ramène d'abord la vue derrière la caisse, face à la porte en feu — un travelling
     lissé (smootherstep) dont la durée suit l'angle à rattraper (~0,3 s pour 25°, ~1,1 s pour un demi-tour) — pendant que le plateau
     remet la caisse face à la porte. Le lâcher part ENSUITE, de la vue de toujours (p0/r0 relevés à la fin du retour). */
  GAR.vA=(GAR.vA||0)+(GAR.swO||0);GAR.swO=GAR.swP=GAR.swK=0;GAR.vW=0;
  const dv=Math.atan2(Math.sin(GAR.vA),Math.cos(GAR.vA)),dr=Math.atan2(Math.sin(garRot()),Math.cos(garRot()));GAR.vA=GAR.vAc=dv;
  const mk0=GMIS.mk>.02?GMIS.mk:0; // (missions) la vue d'ensemble redescend derrière la caisse pendant le même retour
  const vd0=GAR.vD||0,wd0=GAR.wD||0; // (vitrine) la visée sur l'entrée et le décalage de composition se défont pendant le retour (sinon la vue sautait au départ)
  const pre=(Math.abs(dv)>.12||Math.abs(garagePitch-.2)>.1||mk0||Math.abs(vd0)>.02||wd0>.02)?{t:0,D:Math.max(mk0?.8:0,(wd0>.02?.55:.25)+.28*Math.max(Math.abs(dv),Math.abs(dr)*.5,Math.abs(vd0))),v0:dv,g0:garageAng,gd:dr,p0:garagePitch,mk0:mk0,vd0:vd0}:null;
  GAR.go={t:0,pre:pre,p0:pre?null:camera.position.clone(),lx0:-Math.sin(garCamA())*1.5,lz0:-Math.cos(garCamA())*1.5,voile:false,quiet:gEl.classList.contains('quiet'),r0:dr}; // r0 : où le plateau l'avait tournée
  gEl.classList.add('launching');document.body.classList.remove('garMenuH'); // dès qu'on PART, la vitrine s'efface — qu'on l'ait parcourue ou pas
  pbjDepart(); // (15/10) POUCE BLEU : le morceau de la course entre pendant le piqué (son intro)
  if(!pre)garLacherSon();
}
function garLacherSon(){try{if(SONV2)sfx('garage.lacher',{vol:-8});else{noiseBurst(.6,.07,420);chimeNote(196,0,.5,.06);}}catch(e){}} /* (2026-10-16) −8 dB, et le repli −10 dB : c'était le BOOM du début de partie (voir LE PIQUÉ QUI NE CRIE PLUS) */ /* (console de son) LE LÂCHER : moteur, turbo, départ, et le WHOOSH du voile (1,36 s) — le 196 Hz hors gamme reste en repli ; après LE RETOUR AU FEU s'il y en a un */
// `playViaGarage()` — UNE SEULE PORTE D'ENTRÉE POUR LANCER UNE COURSE (2026-09-05) : « on ne peut
// jouer que depuis le garage avec la porte qui s'ouvre » (demande du user). Le bouton JOUER du menu,
// REJOUER, la touche Entrée en fin de partie — tout ouvre le garage et enchaîne LE LÂCHER : c'est le
// MÊME geste (porte qui s'ouvre, boost, logo) qu'on vienne de gagner ou qu'on lance sa toute première
// partie, au lieu d'un raccourci direct qui aurait fait cohabiter deux façons de démarrer.
// ⚠ `openGarage(true)` — EN SOURDINE (2026-09-05 bis) : le premier jet montrait la fiche d'achat/
// échange pendant TOUTE la sortie de porte (« un bouton play séparé des achats de voitures », retour
// du user) — le garage reste la scène du départ, seule sa vitrine de shopping n'a rien à y faire.
function playViaGarage(tuto){
  if(pendingScore!=null||(started&&!gameOver))return; // course en cours, ou nom en cours de saisie : rien à faire
  // (2026-09-25, transitions App Store) le menu ne disparaît plus d'un coup sur l'atelier : fondu au noir, l'atelier
  // s'allume DESSOUS, et le LÂCHER démarre quand le voile se lève — la caméra quitte l'orbite sous les yeux du joueur.
  if(garageOn){if(tuto)tutoArme();garageLaunch();return;}
  ecranWipe(function(){if(tuto)tutoArme();openGarage(true);},function(){garageLaunch();});
}
let GSON9=false; // (2026-10-14, session SON) vrai quand une ACTION sonore (équiper, bascule de la caisse, carte, geste de l'atelier) vient de jouer dans CE geste : le clic « nav » se tait alors (il ne reste que la vibration) — remis à faux au début de chaque geste de vignette
function garageGo(d){
  if(GAR.go)return; // (2026-09-28) pendant la SORTIE (1,7 s), un glissé remplaçait la caisse qui roule vers la porte
  hap(8); // ◀ ▶, glissé, clavier : le doigt sent qu'on change de caisse (2026-09-26, charte règle 8) — (2026-10-14, session SON) l'oreille l'entend par l'ACTION (carte / bascule), plus par un tick nav EN PLUS ; le tick ne reste que là où rien d'autre ne sonne
  if(SHOP.tab!=='voiture'){ // BOUTIQUE : on feuillette les articles, la caisse reste la tienne
    shopShow(SHOP.tab,SHOP.i[SHOP.tab]+d);try{if(SONV2)sfx('ui.carte',{vol:-3});else chimeNote(d>0?880:660,0,.16,.14);}catch(e){}return;}
  if(!garageOn||!GAR.root||GAR.sw){uiClic('nav');garageShow(garageVoisin(garageI,d));return;}
  GAR.sw={t:0,fait:false,to:garageVoisin(garageI,d)};
  try{if(SONV2)sfx('garage.bascule');else{chimeNote(d>0?880:660,0,.16,.14);noiseBurst(.35,.09,900);}}catch(e){} /* (console de son) LA BASCULE, calée sur le retourneur de 1,06 s */
}
/* `garageImpact()` — LE TAP : un clic bref sur la caisse (pas un glissé, voir le seuil dans le
   `pointerup` plus bas) EST un petit coup. Elle recule d'un rien (voir `garageRender`, même minuteur
   `GAR.impactT`) et dix blocs giclent avant de retomber — la même caisse en accuse le geste, elle ne
   change pas encore de modèle. Le CHANGEMENT reste au swipe ou aux flèches, ce tap-ci ne fait que
   répondre au toucher. */
function garageImpact(){
  if(!garageOn||!GAR.root||GAR.sw||GAR.go||!GAR.impactMeshes)return;
  GAR.impactT=GAR.IMPACT_D;
  for(let i=0;i<GAR.impactMeshes.length;i++){
    const m=GAR.impactMeshes[i],a=Math.random()*Math.PI*2,sp=1.1+Math.random()*1.8;
    m.position.set((Math.random()-.5)*.3,GAR.POD+.35+Math.random()*.3,.9); // point d'impact : le nez de la caisse, à peu près — les 15 gabarits n'ont pas tous la même longueur, une valeur moyenne suffit pour un effet aussi bref
    m.rotation.set(Math.random()*6,Math.random()*6,0);m.visible=true;m.material.opacity=1;
    if(!m.material.transparent){m.material.transparent=true;}
    GAR.impactVel[i].x=Math.cos(a)*sp*.4;GAR.impactVel[i].y=1.6+Math.random()*1.6;GAR.impactVel[i].z=Math.sin(a)*sp*.4+2.2;
    GAR.impactVel[i].rx=(Math.random()-.5)*9;GAR.impactVel[i].ry=(Math.random()-.5)*9;
  }
  try{if(SONV2)sfx('garage.tole');else{chimeNote(340,0,.05,.10);noiseBurst(.14,.05,1400);}}catch(e){} /* (console de son) le TONK de tôle */
  // LES FLÈCHES SE MONTRENT : discrètes au repos, elles se rappellent au bon souvenir pile quand on
  // vient de toucher la caisse — c'est LE moment où « comment je change de voiture » se pose.
  const gp=$('gPrev'),gn=$('gNext');
  if(gp)gp.classList.add('hint');if(gn)gn.classList.add('hint');
  clearTimeout(garageImpact._t);
  garageImpact._t=setTimeout(()=>{if(gp)gp.classList.remove('hint');if(gn)gn.classList.remove('hint');},1800);
}
/* LE GARAGE NE MONTRE QUE CE QUI SE JOUE ICI (2026-09-25) : les caisses PREMIUM vivent dans la BOUTIQUE (vrai argent) ;
   elles n'entrent au garage qu'une fois achetées. `garageListe()` = les index visibles, dans l'ordre de la gamme. */
// (2026-09-26) LES CINQ FAMILLES, dans l'ordre (communes → défis), chacune du plus accessible au plus dur. Les LÉGENDAIRES y sont
// toutes : on les VOIT tourner sur le plateau (l'envie naît là) — leur bouton mène à la BOUTIQUE, seul endroit où elles s'achètent.
function garageListe(){let L=[];for(const r of RAR_FAM)L=L.concat(rarListe(r.id));return L;}
function garageVoisin(i,d){const L=garageListe();let k=L.indexOf(i);if(k<0)k=0;return L[((k+d)%L.length+L.length)%L.length];}
function garageShow(i){
  i=((i%CARS.length)+CARS.length)%CARS.length;if(garageListe().indexOf(i)<0)i=garageVoisin(i,0);
  garageI=i;
  buildCar(CARS[garageI]);
  const c=CARS[garageI];
  gNomEntre(TR(c.name));
  {const L9=garageListe();gLvlEl.textContent=(L9.indexOf(garageI)+1)+' / '+L9.length;} // (garage v6) le rang seul — l'onglet dit déjà VOITURES
  gSpdEl.textContent=''; // plus de km/h sur la fiche : la vitesse vient du MOTEUR, pas de la caisse
  // La caisse VERROUILLÉE annonce SA condition (et où tu en es) : c'est la carte du jeu, pas une
  // porte close. Une caisse débloquée garde sa punchline d'origine — le champ `desc` des 24 fiches
  // ressert enfin, il n'était plus affiché nulle part depuis le retrait de la carte de déblocage.
  const ouverte=carUnlocked(garageI),testOuv=TEST_CAISSES&&!carUnlockedVrai(garageI); // testOuv : ouverte pour le TEST seulement
  const u9=CAR_UNLOCK[garageI],dfi=!ouverte&&u9&&u9.k==='carnet';
  if(testOuv)gDescEl.innerHTML='<i class="gTest">TEST</i> '+(u9&&u9.k==='mis'?(m2Secrete(garageI)?m2SecretHtml():m2DebloqueHtml(m2Def(u9.id))):pxi('verrou')+' '+(u9&&u9.k==='premium'?TR('BOUTIQUE')+' — <b class="gEur">'+eurTxt(u9.eur)+'</b>':String(carUnlockText(garageI)).replace(/</g,'&lt;'))); // la VRAIE condition reste écrite (charte v5 : le prix en € en or, « TEST » en pastille discrète — elle disparaît avec TEST_CAISSES)
  else if(ouverte)gDescEl.textContent=LANG==='fr'?(c.desc||''):TR(c.desc||''); /* (2026-09-29) en police système : « Ça se voit », pas « Ca se voit » */else if(u9&&u9.k==='mis')gDescEl.innerHTML=m2Secrete(garageI)?m2SecretHtml():m2DebloqueHtml(m2Def(u9.id));else gDescEl.innerHTML=pxi('verrou')+' '+String(carUnlockText(garageI)).replace(/</g,'&lt;');
  $('gCard').classList.toggle('defis',!!dfi);
  $('gCard').classList.toggle('prixSeul',!!(testOuv||(u9&&u9.p&&!dfi&&u9.k!=='premium'&&!ouverte))); /* (garage v7) le prix est sur le bouton (« IL MANQUE $ X ») et sur la vignette : l'encadré ne le redit plus — (2026-10-11, Léo : « enlève le TEST BOUTIQUE 0,99 €, c'est super dérangeant, on ne voit pas la voiture ») une caisse ouverte pour le TEST n'a plus d'encadré */
  // ÉQUIPER : verrouillé tant que la caisse n'est pas débloquée ; marqué quand c'est déjà la tienne
  // ⚠ on teste carUnlocked(i), PAS `garageI>bestCar` : les caisses ne se gagnent plus dans l'ordre
  // (chacune a sa condition), donc un simple « au-dessus du meilleur » laisserait passer les trous.
  const bt=$('gEquip'),eq=SAVE.d.equipped|0;
  if(bt){
    bt.disabled=false; // aria-disabled plutôt que disabled : le bouton fermé RÉPOND (secousse + vibration + la condition)
    // (2026-09-26, charte v4) l'ÉTAT se lit dans la MATIÈRE (`data-etat`) : lingot = à équiper, carbone vert = la tienne, carbone gris = fermée
    if(!ouverte)gEtat(bt,'verrou','verrou','VERROUILLÉE');
    else if(garageI===eq)gEtat(bt,'eq','coche','ÉQUIPÉE');
    else gEtat(bt,'',null,'ÉQUIPER');
  }
  /* LE BOUTON ACHETER n'existe QUE pour les caisses à vendre et pas encore possédées. Les caisses
     à défi n'en ont pas du tout : afficher un bouton d'achat grisé sur LE MANS 24 laisserait croire
     qu'elle finira par s'acheter, alors que non — c'est tout l'intérêt de la voie aura. */
  const bb=$('gBuy'),row=$('gBuyRow'),prix=carPrice(garageI);
  $('gCard').classList.toggle('verrou',(!ouverte&&!dfi&&!prix)||testOuv); // (test) la condition se lit même sur une caisse ouverte pour l'essai // défi d'aura : la condition DOIT se lire (elle était écrite… puis masquée)
  const aVendre=prix&&(!ouverte||testOuv); // (2026-09-30) en TEST aussi, la caisse à vendre pas encore payée montre ACHETER (sinon la pastille « à ta portée » n'avait pas d'issue) ; JOUER l'équipe toujours (garageLaunch clique ÉQUIPER)
  if(row)row.style.display=aVendre?'':'none';
  if(bb&&aVendre){
    const peut=bank()>=prix;
    bb.innerHTML=gPrixHtml(peut,prix);bb.dataset.px=fmtC(prix);bb.dataset.eur=''; // le verbe, puis le prix en gros (charte v4) — (2026-10-10) dataset.px : le prix que dit ÉQUIPER devenu ACHETER (gEqTon)
    bb.classList.toggle('pauvre',!peut); // ⚠ plus de `disabled` : un bouton désactivé n'émet AUCUN clic — pas de son, pas de vibration, rien
  }
  // ⚠ UN SEUL BOUTON D'ACTION (2026-09-25) : une caisse à vendre affichait « IL MANQUE 25 k » ET « VERROUILLÉE »
  // l'un sous l'autre — deux fois la même nouvelle. À vendre : ACHETER seul ; à défi : le verrou seul.
  if(bt&&aVendre)bt.style.display='none';else if(bt)bt.style.display='';
  gActSync(); // (2026-09-29) JOUER prend toute la barre s'il n'y a rien à décider
  gDots(garageListe().map(function(i9){return {on:i9===garageI,a:carUnlocked(i9),eq:i9===eq};}));
  const sw=$('gSw');if(sw){sw.style.display='none';sw.innerHTML='';}
  // (2026-09-26) LA FAMILLE : la pastille de rareté sur la fiche, la barre des familles et la bande de vignettes suivent la caisse
  {const ri=rarInfo(carRar(garageI)),pl=$('gRarPill');if(pl){pl.textContent=sansAcc(TR(ri.n1));pl.style.setProperty('--rc',ri.c);}
   $('gCard').style.setProperty('--rc',ri.c); // le nom s'auréole de la couleur de sa famille
   // LÉGENDAIRE pas encore à toi : UN bouton, qui mène à la BOUTIQUE (le seul endroit où elle s'achète)
   if(bb){bb.dataset.bout='';if(u9&&u9.k==='premium'&&!carUnlockedVrai(garageI)&&(!testOuv||gModeM()==='shop'||gModeM()==='tous')){ /* (2026-10-10) en BOUTIQUE (et SEE ALL ITEMS), une caisse en € pas vraiment à toi dit ACHETER + son prix, même ouverte pour le TEST (TEST_CAISSES) */if(row)row.style.display='';bb.innerHTML=pxi('panier')+'<span>'+TR('EN BOUTIQUE')+'</span><b class="gPrix">'+eurTxt(u9.eur)+'</b>';
     bb.classList.remove('pauvre');bb.dataset.bout='1';bb.dataset.px=eurTxt(u9.eur);bb.dataset.eur='1';if(bt)bt.style.display='none';gActSync();}} // (2026-10-10) gActSync : ÉQUIPER dit ACHETER + le prix en € (il était passé avant cette branche)
   garageFamilles(ri.id);}
  gBankPaint();
}
/* LA BARRE DES FAMILLES + LA BANDE DE VIGNETTES. La barre ne se réécrit que si la famille ou les comptes changent ; la bande
   se reconstruit au changement de famille et ne fait sinon que déplacer la sélection (et se recentrer dessus). Les photos
   viennent du studio (`carPhoto`), UNE par image au plus (`photoFile`) : ouvrir une famille de 16 ne gèle pas le garage. */
function garageFamilles(r){
  const md=gModeM();if(md==='shop'){gShopJour();return;} /* (2026-10-10) la BOUTIQUE est devenue LA BOUTIQUE DU JOUR (gShopJour) */if(md==='inv'||md==='tous'){gStripModeVoitures();return;} // (2026-10-10) SEE ALL ITEMS (`tous`) : la page de l'inventaire, tout ce qui s'achète — (2026-10-09) INVENTAIRE : voir « LA CONSOLE À TROIS MODES » — la BOUTIQUE garde les familles (Léo : « remets les raretés dans la boutique »)
  const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;try{gModeBoutons();}catch(e){}bar.classList.remove('gModeBar');
  const eq=SAVE.d.equipped|0,shop=md==='shop';
  const nbV=function(L){let n=0;for(const i of L)if(gAVendre(i))n++;return n;}; // BOUTIQUE : chaque famille dit combien il en reste à ACHETER
  const cles=md+':'+RAR_FAM.map(function(x){const L=rarListe(x.id);let a=0;for(const i of L)if(carUnlockedVrai(i))a++;return x.id+a+'/'+L.length+(shop?'v'+nbV(L):'');}).join('|')+'#'+r;
  if(bar._k!==cles){bar._k=cles;
    bar.innerHTML=RAR_FAM.map(function(x){const L=rarListe(x.id);let a=0;for(const i of L)if(carUnlockedVrai(i))a++;const v=shop?nbV(L):0,lb=shop?String(v):a+'/'+L.length;
      const nm9=sansAcc(TR(x.n)); // (garage v6) la famille se dit en COULEUR : son nom reste pour le lecteur d'écran et l'info-bulle
      return '<button class="gR'+(x.id===r?' on':'')+(shop&&!v?' vide':'')+'" data-r="'+x.id+'" role="tab" aria-selected="'+(x.id===r)+'" aria-label="'+nm9+' '+lb+'" title="'+nm9+'" style="--rc:'+x.c+'"><span class="gRn">'+nm9+'</span>'+pxi(RAR_LOGO[x.id]||'etoile')+'</button>';}).join('');} // (2026-10-09) le LOGO de la famille, plus de compte
  {const ro=bar.querySelector('.gR.on');if(ro&&bar._on!==r){bar._on=r;const x=ro.offsetLeft-(bar.clientWidth-ro.offsetWidth)/2;try{bar.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){bar.scrollLeft=x;}}} // la famille active vient se montrer
  const L=shop?rarListe(r).filter(gAVendre):rarListe(r),ri=rarInfo(r),own=L.filter(carUnlockedVrai).length; // (charte v4) posséder une caisse de plus REFAIT la bande (elle gardait son cadenas après l'achat) — (2026-10-09) en BOUTIQUE, celles à vendre seulement
  if(st._r!==r||st._n!==L.length||st._eq!==eq||st._o!==own||st._md!==md){st._r=r;st._n=L.length;st._eq=eq;st._o=own;st._md=md;
    const lu9={commun:.35,rare:.6,exotique:.7,epique:.82,defi:.7,legendaire:1,mythique:1,infini:1}[r]||.5, // (2026-10-07, Léo) LA LUEUR de la famille : plus elle est rare, plus elle brille — les crans de l'inventaire (INV_LUEUR)
      lg9=';--rg:'+invRgba(ri.c,.22+.28*lu9)+';--rg2:'+invRgba(ri.c,.55+.4*lu9); // en rgba, pas de color-mix (les vieux iPhone, voir hudDA §7)
    st.innerHTML=(shop&&!L.length)?'<div class="gVide">'+sansAcc(TR('TOUT EST A TOI'))+'</div>':L.map(function(i){const u=CAR_UNLOCK[i],ouv=carUnlockedVrai(i);
      const et=ouv?(i===eq?'':pxi('coche')):(u&&u.p?fmtC(u.p):u&&u.eur?eurTxt(u.eur):u&&u.k==='mis'?sansAcc(TR(m2Secrete(i)?'SECRÈTE':'MISSION')):''); // (la police pixel n'a pas de ✓ : l'icône pixel) · (2026-09-29) la caisse des MISSIONS en cours dit où on en est : « 1 / 3 »
      const sec9=!ouv&&m2Secrete(i);
      return '<div class="gT'+(ouv?'':' lock')+(sec9?' m2sec':'')+(i===eq?' eq':'')+'" data-car="'+i+'" role="button" aria-label="'+(sec9?'? ? ?':String(CARS[i].name).replace(/"/g,''))+'" style="--rc:'+ri.c+lg9+'">'
        +'<i class="gTl"></i><i class="gTv"></i><em'+(!ouv&&u&&!u.p&&u.eur?' class="eur"':!ouv&&u&&u.k==='carnet'?' class="def"':'')+'>'+et+'</em></div>';}).join(''); // (charte v5) l'argent du JEU en vert billet, le vrai argent (€) en or
    st.querySelectorAll('.gT').forEach(function(el){const i=+el.getAttribute('data-car');
      photoFile(i,function(url){const v=el.querySelector('.gTv');if(v)v.remove();if(!el.querySelector('img')){const im=document.createElement('img');im.alt='';im.src=url;el.insertBefore(im,el.firstChild);}});});}
  st.querySelectorAll('.gT').forEach(function(el){el.classList.toggle('on',+el.getAttribute('data-car')===garageI);});
  const on=st.querySelector('.gT.on');if(on){const x=on.offsetLeft-(st.clientWidth-on.offsetWidth)/2;try{st.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=x;}}
  if(!st._fin){st._fin=1;const f9=function(){st.classList.toggle('finDroite',st.scrollLeft+st.clientWidth>=st.scrollWidth-4);};st.addEventListener('scroll',f9,{passive:true});setTimeout(f9,400);} /* (garage v7) au bout de la bande, plus de fondu */
}
/* ===== LA CONSOLE À TROIS MODES (2026-10-09, Léo : « crée un système : les boutons INVENTAIRE et BOUTIQUE liés à ce qui est affiché au
   début — voitures, peinture, ailes, avec les raretés. Pas une autre page : la même. INVENTAIRE montre ce qu'on a, directement, dans la
   couleur indiquée, au lieu des raretés ; BOUTIQUE, la même chose avec tout ce qu'il y a à acheter ») =====
   `GMODE.m` : 'tout' (la console d'origine : familles pour les voitures, filtres TOUT · À MOI · À ACHETER pour l'habillage) · 'inv' · 'shop'.
   Les deux touches de la rangée basculent le mode (re-toucher la touche allumée ramène à 'tout') ; les onglets VOITURES · PEINTURE · AILES ·
   TRAÎNÉES restent, la barre des familles devient l'INTERTITRE du mode (pictogramme, nom, fil, compte) et la bande des vignettes ne garde
   que ce qui est à toi (INVENTAIRE, toutes familles mêlées, dans le cyan de l'inventaire — plus de couleur de rareté, demande de Léo le même soir) ou ce qui est
   à acheter (BOUTIQUE : l'argent du jeu du moins cher au plus cher, puis les légendes en €, vignettes éclairées — c'est une vitrine).
   Le tiroir #gInv et la page € (#mShop) ne s'ouvrent plus depuis ces touches dans la console (la page € reste sur l'accueil). */
var GMODE={m:'tout',fam:null,paye:false};
var GATL={on:false,c:0,cs:0,l:0,lb:0,p:0,cle:'',g:null,pinces:[],sonL:0,sonP:0,dim:-1}; // L'ATELIER FERMÉ de l'INVENTAIRE (voir gAtelier)
/* (2026-10-10) LA FAMILLE DE LA BOUTIQUE : celle de la caisse affichée si elle a encore quelque chose à vendre, sinon la 1re qui en a. La caisse,
   elle, ne bouge pas tant qu'on ne touche pas une vignette ; une puce de famille ne change que la bande. */
function gShopFam(){const r0=carRar(garageI),a=function(r){return rarListe(r).some(gAVendre);};if(a(r0))return r0;for(const x of RAR_FAM)if(a(x.id))return x.id;return r0;}
function gAVendre(i){const u=CAR_UNLOCK[i];return !carRetiree(i)&&i!==(SAVE.d.equipped|0)&&!carUnlockedVrai(i)&&!!u&&(!!u.p||u.k==='premium');} // (2026-10-09) à acheter : argent du jeu ou boutique (€), pas encore à toi
function gModeConsole(){return !!gEl&&!gEl.classList.contains('vitrine')&&!gEl.classList.contains('menu');}
function gModeM(){return GMODE&&gModeConsole()?GMODE.m:'tout';} // (GMODE est un var : lu avant sa ligne au chargement, il vaut undefined → 'tout')
function gPossede(i){return i===(SAVE.d.equipped|0)||carUnlockedVrai(i);}
function gModeListeVoitures(m){const eq=SAVE.d.equipped|0,L=[];
  for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;
    if(m==='inv'?gPossede(i):m==='tous'?(i===0||(!!CAR_UNLOCK[i]&&(CAR_UNLOCK[i].p>0||CAR_UNLOCK[i].k==='premium'))):(i===0||gAVendre(i)))L.push(i);} /* (2026-10-22, Sacha : « dans le shop avec les communes, en première, même si on ne peut pas l'acheter ») LA HONTE (index 0, gratuite) ouvre SEE ALL ITEMS pour qu'on puisse la reprendre */
  if(m==='inv')L.sort(function(a,b){return (INV_RANG[carRar(b)]-INV_RANG[carRar(a)])||(carOrdre(b)-carOrdre(a));}); // (2026-10-09) les silhouettes de ce qu'on n'a pas (v221-v222) sont retirées le même soir (Léo : « enlève le truc avec les voitures transparentes »)
  else L.sort(function(a,b){if(a===0||b===0)return a===0?-1:1;return ((CAR_UNLOCK[a].p?0:1)-(CAR_UNLOCK[b].p?0:1))||(carPrixOrdre(a)-carPrixOrdre(b));});
  return L;}
function gModeBoutons(){const m=gModeM(),c=document.getElementById('gvCof'),b=document.getElementById('gShopBas'),r=document.getElementById('gRar'),st=document.getElementById('gStrip');
  if(c)c.classList.toggle('modeOn',m==='inv');if(b)b.classList.toggle('modeOn',m==='shop'||m==='tous');
  if(b){const ret=m==='shop'||m==='tous';if(b._lib==null)b._lib=b.innerHTML;if(ret!==!!b._ret){b._ret=ret;b.innerHTML=ret?pxi('gauche')+'<span data-fr="RETOUR">'+TR('RETOUR')+'</span>':b._lib;if(!ret){const s9=b.querySelector('span[data-fr]');if(s9)s9.textContent=TR(s9.dataset.fr);}b.setAttribute('aria-label',ret?TR('RETOUR'):TR('Boutique'));} /* (2026-10-12, passe qualité) _lib est figé dans la langue de la 1re visite : on repasse le libellé dans la langue du moment (sinon « BOUTIQUE » en anglais après FR→EN) */
    if(gEl)gEl.classList.toggle('shopRet',ret);} // (2026-10-12) BOUTIQUE devient RETOUR
  if(GATL.on&&m!=='inv')GATL.on=false; // l'atelier fermé n'existe qu'en INVENTAIRE
  if(c){const ret=m==='inv'&&GATL.on;if(c._lib==null)c._lib=c.innerHTML;if(ret!==!!c._ret){c._ret=ret;c.innerHTML=ret?pxi('gauche')+'<span data-fr="RETOUR">'+TR('RETOUR')+'</span>':c._lib;c.setAttribute('aria-label',ret?TR('RETOUR'):'Inventaire');}}
  if(gEl){gEl.classList.remove('invRet');gEl.classList.toggle('modeInv',m==='inv');gEl.classList.toggle('atelierInv',GATL.on);} // (2026-10-12, Léo) à l'arrivée l'INVENTAIRE en aperçu, les cinq touches ; INVENTAIRE touché = L'ATELIER FERMÉ (gAtelier) : la touche devient ◀ RETOUR, en bas à gauche, les autres s'effacent
  if(r&&m==='tout')r.classList.remove('gModeBar');if(st){st.classList.toggle('gModeShop',m==='shop'||m==='tous');st.classList.toggle('gModeTous',m==='tous');st.classList.toggle('gModeInv',m==='inv');if(m!=='shop'&&st.classList.contains('fnBande')){st.classList.remove('fnBande');st._r=null;st._n=-1;if(r)r._k=null;}}
  if(gEl)gEl.classList.toggle('modeShop',m==='shop');} // (2026-10-10) LA BOUTIQUE DU JOUR : la console change de visage (voir gShopJour)
function gModeTete(bar,m,n){bar.classList.add('gModeBar'); // n : un nombre, ou « 15 / 46 » en INVENTAIRE
  if(m==='tous'){bar.innerHTML='<div class="gModeT fnTete" style="--rc:var(--neoM)"><b class="fnRetour" role="button" aria-label="'+TR('RETOUR')+'">'+pxi('gauche')+'</b>'+pxi('panier')+'<span>SEE ALL ITEMS</span><s></s><b>'+n+'</b></div>';return;} // (2026-10-10) SEE ALL ITEMS, en anglais (Léo)
  bar.innerHTML='<div class="gModeT" style="--rc:'+(m==='inv'?'var(--neoC)':'var(--neoM)')+'">'+pxi(m==='inv'?'coffre':'panier')+'<span>'+sansAcc(TR(m==='inv'?'INVENTAIRE':'BOUTIQUE'))+'</span><s></s><b>'+n+'</b></div>';}
/* LE LOGO DE LA RARETÉ (2026-10-10, Léo : « les raretés, tu peux ajouter le logo à côté de chaque voiture, au même endroit, pour créer un peu
   de logique visuelle ») : sur CHAQUE vignette de caisse (inventaire, SEE ALL ITEMS, vitrine du jour), le logo de sa famille (RAR_LOGO : roue,
   gemme, flamme, couronne, cible) dans sa couleur, toujours au coin haut droit — le cadenas et le losange de l'équipée restent à gauche. */
function rarLogoR(r){const c=rarInfo(r).c;return '<span class="rarLogo r-'+r+'" style="--rl:'+c+'" title="'+sansAcc(TR(rarInfo(r).n1))+'">'+pxi(RAR_LOGO[r]||'etoile')+'</span>';}
function rarLogo(i){return rarLogoR(carRar(i));}
function gStripModeVoitures(){
  const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;gModeBoutons();
  const m=GMODE.m,eq=SAVE.d.equipped|0,L=gModeListeVoitures(m);
  const lbl=L.length;
  const kb='mode:'+m+':'+lbl+':'+LANG;if(bar._k!==kb){bar._k=kb;bar._on=null;gModeTete(bar,m,lbl);}
  const k='mode:'+m+':'+L.join(',')+':'+eq+':';
  if(st._r!==k){st._r=k;st._n=-1;
    if(!L.length)st.innerHTML='<div class="gVide">'+sansAcc(TR(m==='inv'?'RIEN ICI':'TOUT EST A TOI'))+'</div>';
    else st.innerHTML=L.map(function(i){const ri={c:m==='tous'?'#ff3ec8':'#5ee6ff'},lg9=m==='tous'?';--rg:rgba(255,62,200,.3);--rg2:rgba(255,62,200,.7)':';--rg:rgba(94,230,255,.32);--rg2:rgba(94,230,255,.72)'; // (2026-10-09, Léo : « enlève la rareté de l'inventaire ») tout dans le cyan de l'INVENTAIRE — (2026-10-10) SEE ALL ITEMS : pas de rareté non plus, le magenta de la boutique
      const u=CAR_UNLOCK[i],ouv=i===eq||carUnlockedVrai(i);
      const et=ouv?(i===eq?'':pxi('coche')):(u&&u.p?fmtC(u.p):u&&u.eur?eurTxt(u.eur):u&&u.k==='mis'?sansAcc(TR(m2Secrete(i)?'SECRÈTE':'MISSION')):'');
      const sec9=!ouv&&m2Secrete(i);
      return '<div class="gT'+(ouv?'':' lock')+(sec9?' m2sec':'')+(i===eq?' eq':'')+'" data-car="'+i+'" role="button" aria-label="'+(sec9?'? ? ?':String(CARS[i].name).replace(/"/g,''))+'" style="--rc:'+ri.c+lg9+'">'
        +'<i class="gTl"></i><i class="gTv"></i>'+rarLogo(i)+'<em'+(!ouv&&u&&!u.p&&u.eur?' class="eur"':!ouv&&u&&u.k==='carnet'?' class="def"':'')+'>'+et+'</em></div>';}).join('');
     // (2026-10-14, charte 6, ordre de Sacha) plus de blocs « ? BIENTÔT » : un testeur y voit un jeu inachevé
    st.querySelectorAll('.gT[data-car]').forEach(function(el){const i=+el.getAttribute('data-car');
      photoFile(i,function(url){const v=el.querySelector('.gTv');if(v)v.remove();if(!el.querySelector('img')){const im=document.createElement('img');im.alt='';im.src=url;el.insertBefore(im,el.firstChild);}});});}
  st.querySelectorAll('.gT').forEach(function(el){el.classList.toggle('on',+el.getAttribute('data-car')===garageI);});
  const on=st.querySelector('.gT.on');if(on){const x=on.offsetLeft-(st.clientWidth-on.offsetWidth)/2;try{st.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=x;}}
  else{try{st.scrollTo({left:0,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=0;}}}
