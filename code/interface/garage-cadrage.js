/* LE CADRAGE MESURÉ (2026-09-30, Léo : « la voiture est toujours pas cadrée, c'est chelou »). Deux décalages FIXES d'objectif faisaient le
   cadrage : .075 de la hauteur en portrait, .23 de la LARGEUR dès que l'écran était couché — pensé pour le téléphone couché, où les commandes
   forment une colonne à droite. Sur un écran d'ordi les commandes sont CENTRÉES en bas : la caisse partait à gauche pour rien, à moitié
   sous les onglets (capture 1400 × 800). Désormais on MESURE : `garLibre` lit la place que laissent la fiche du haut et les commandes (en
   bas, ou en colonne à droite), `garCadre` projette le CENTRE DU PLATEAU (la caisse tourne autour : le cadrage ne bouge pas avec elle) et
   décentre l'objectif (`setViewOffset`) pour le poser au milieu de cette place — n'importe quel écran, n'importe quel onglet. Lissé ; `k`
   (0 → 1) le fond au lâcher ; plafonné au tiers de l'écran. GAR_DECY / GAR_DECX restent pour la mémoire, plus lus. */
function garLibre(){
  const n=performance.now();if(garLibre._r&&n-garLibre._t<250&&garLibre._W===VP.w&&garLibre._H===VP.h)return garLibre._r;garLibre._t=n;garLibre._W=VP.w;garLibre._H=VP.h; // (2026-10-14, chasse aux bugs) idem menuCadre : pas de cache à travers une rotation
  const W=VP.w,H=VP.h,r={x0:0,x1:W,y0:0,y1:H};
  /* (2026-10-11, passe UX — Sacha : « quand on clique sur l'œil, la caméra doit recentrer sur la voiture ») LA VOITURE SEULE : la caisse
     au CENTRE de l'écran, à la MÊME taille — on reprend la place mesurée d'avant (sa demi-largeur, sa hauteur) et on la recentre : le
     recul de la caméra se calcule sur ces deux mesures, il ne bouge pas (« rendre tout l'écran la reculait », Léo). Lissé par garCadre. */
  if(gEl&&gEl.classList.contains('vueSeule')&&garLibre._n){const p=garLibre._n,hw=Math.max(40,Math.min(p.cx-p.x0,p.x1-p.cx)),hh=Math.max(40,(p.y1-p.y0)/2);
    r.x0=W/2-hw;r.x1=W/2+hw;r.y0=H/2-hh;r.y1=H/2+hh;r.cx=W/2;r.cy=H/2;return garLibre._r=r;}
  if(document.body.classList.contains('garMenuH')){ // (2026-09-30) LE MENU DE SACHA : la caisse entre le LOGO et la rangée MISSIONS · ⚙ (debout) ; couché, à gauche de la colonne
    const ti=document.querySelector('#mHome .mTitle'),ou=document.querySelector('#mHome .mOutils'),hm=$('mHome'),tr=ti&&ti.getBoundingClientRect(),orr=ou&&ou.getBoundingClientRect(),hr=hm&&hm.getBoundingClientRect();
    if(W>H*1.25&&hr&&hr.width&&hr.left>W*.3)r.x1=hr.left;                              // couché : la colonne est à droite
    else{if(tr&&tr.height)r.y0=tr.bottom+14;if(orr&&orr.height)r.y1=orr.top;}          // debout : entre le titre et les boutons
  }else if(gEl&&gEl.classList.contains('menu')&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')){ // LE MENU : entre PLAY et la rangée du bas
    const pm=$('gPlayMain'),pr=pm&&pm.getBoundingClientRect();
    if(pr&&pr.height){r.y0=pr.bottom;r.pl={l:pr.left,r:pr.right,b:pr.bottom};}
  }else if(gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')){
    const b=$('gBottom'),t=$('gTop'),bb=b&&b.getBoundingClientRect(),tb=t&&t.getBoundingClientRect();
    if(bb&&bb.width>0){
      if(bb.left>W*.3&&(bb.height>H*.6||W>H*1.2))r.x1=bb.left; // téléphone couché : la colonne à droite — (garage v6) la CONSOLE n'en prend plus toute la hauteur
      else{r.y1=bb.top;const g9=document.documentElement.classList.contains('gtConsole')?$('gTourne'):null;if(g9&&g9.classList.contains('on')&&g9.offsetHeight>0)r.y1=Math.min(r.y1,g9.offsetTop-6);}} // sinon : les commandes en bas — (2026-10-10) debout, la JAUGE posée au-dessus de la console borne aussi la caisse (offsetTop : sa place finale, sans le glissé d'entrée)
    if(tb&&tb.height>0&&tb.bottom<r.y1-120)r.y0=tb.bottom;r.shop=true;    // la fiche du haut (si elle laisse de la place)
    r.vit=gEl.classList.contains('vitrine');r.leo=garVueLeo(); // (2026-10-06) r.leo : la composition de la vitrine (la caisse décalée, l'entrée au milieu) — aussi dans la console de Sacha
    if(r.leo&&!r.vit&&W>H*1.2&&document.documentElement.classList.contains('hubOn')){const hb=document.documentElement.classList.contains('gtConsole')?null:$('gTourne'),hr=hb&&hb.getBoundingClientRect(); /* (2026-10-09) la barre du hub est partie : c'est la JAUGE qui tient le bas à gauche */if(hr&&hr.height>0&&hr.left<W*.3)r.y1=Math.min(r.y1,hb.offsetTop-8);} // couché, la barre du HUB tient le bas à gauche : la caisse se pose au-dessus — sa place FINALE (offsetTop ignore le glissé d'entrée `hubMonte`, qui faisait bouger le cadrage)
    if(r.vit&&W>H*1.2){const ga=$('gAct'),gr=ga&&ga.getBoundingClientRect();if(gr&&gr.width>0&&gr.left>W*.3){r.x1=gr.left-12;r.y1=H-12;}} // (2026-10-05) couché : la pile JOUER · niveau · MISSIONS à droite, la caisse a toute la gauche
    if(INV&&INV.on){const iv=$('gInv'),ir=iv&&iv.getBoundingClientRect();     // (2026-10-04) L'INVENTAIRE ouvert : la caisse se pose au-dessus du tiroir (debout), à sa gauche (couché)
      if(ir&&ir.width>0){if(W>H*1.2&&ir.left>W*.3){r.x1=Math.min(r.x1,ir.left);r.y1=H-12;}else r.y1=Math.min(r.y1,ir.top);}}}
  if(GBQ.zone&&r.shop){const z=GBQ.zone;if(z.cote){r.x1=Math.min(r.x1,z.x0-8);if(z.g!=null)r.x0=Math.max(r.x0,z.g);}else{r.x0=Math.max(r.x0,z.g);r.x1=Math.min(r.x1,z.d);}if(z.y0!=null)r.y0=Math.max(r.y0,z.y0);if(z.y1!=null)r.y1=Math.min(r.y1,z.y1);} // (essai) LA BOUTIQUE INDUSTRIELLE : la caisse entre les étiquettes
  const VC9=VITRINE_CAM,iv9=!!(INV&&INV.on); // (même soir, Léo : « la voiture en paysage encore calée un peu plus vers le coin bas gauche ») couché : cxL/cyL ; tiroir ouvert : au milieu de la place qui reste
  r.cx=(r.x0+r.x1)/2;if(r.leo&&!iv9&&!GBQ.zone)r.cx=r.x0+(r.x1-r.x0)*(VC9.cxL+(VC9.cx-VC9.cxL)*POR);r.cy=(r.y0+r.y1)/2;if(r.shop)r.cy=r.y0+(r.y1-r.y0)*(r.leo&&!iv9?(VC9.cyL+(VC9.cy-VC9.cyL)*POR):r.leo?.5:.44); /* (vitrine v2) debout la caisse se pose un peu plus BAS : le feu et la porte au-dessus, moins de sol vide dessous */ /* (garage v7) la caisse se posait BAS dans sa zone (DEBUGGING) : son centre à 44 % de la zone, pas 50 */if(GBQ.zone&&r.shop)r.cy=r.y0+(r.y1-r.y0)*(GBQ.zone.cote?.36:.5); // (essai) la boutique : la caisse au milieu de sa place
  garLibre._n=r;return garLibre._r=r;
}
function garCadre(k,kx){
  const r0=garLibre(),o9=(GBQ.k>.001)?bqPov():null,w9=Math.max(0,Math.min(1,GBQ.k||0)),r=o9?{cx:r0.cx+(o9.sx||0)*VP.w*w9,cy:r0.cy+(o9.sy||0)*VP.h*w9}:r0;camera.clearViewOffset();camera.updateMatrixWorld(); // (2026-10-13) le CADRAGE de la boutique déplace la place de la caisse
  const v=GAR._pc||(GAR._pc=new THREE.Vector3());v.set(0,GARAGE_Y+GAR.POD+.55+(GBQ.lev||0)+(GBQ.levB||0),0).project(camera); // le centre du plateau, à mi-hauteur de caisse
  let sx=(v.x*.5+.5)*VP.w;const sy=(.5-v.y*.5)*VP.h,cl=THREE.MathUtils.clamp;
  if(GBQ.on&&GBQ.k>.5){try{const G=garGabarit(),q=carGroup.quaternion,p=carGroup.position,c9=GAR._pc2||(GAR._pc2=new THREE.Vector3());let mn=1e9,mx=-1e9; /* (2026-10-14, Léo : « la voiture plus centrée entre les affiches d'achats ») en BOUTIQUE, on centre la SILHOUETTE de la caisse à l'écran (sa boîte projetée, nez et poupe compris), pas le centre du plateau : en trois-quarts le nez, plus proche, la tirait d'un côté */
    for(const ax of [-1,1])for(const az of [-1,1])for(const ay of [0,1]){c9.set(ax*G.b,ay*G.H,az*G.a).applyQuaternion(q).add(p);c9.project(camera);const x9=(c9.x*.5+.5)*VP.w;if(x9<mn)mn=x9;if(x9>mx)mx=x9;}
    if(mx>mn)sx=(mn+mx)/2;}catch(e){}}GAR.cErr=(sx-r.cx)/Math.max(1,VP.w);GAR.cErrVD=GAR.vDcam; // (vitrine) l'écart de la caisse à sa place, lu par le décalage de caméra (GAR.vD)
  const dx=cl((sx-r.cx)*k*(kx==null?1:kx),-VP.w/3,VP.w/3),dy=cl((sy-r.cy)*k,-VP.h/3,VP.h/3);
  const dt9=Math.min(.1,GAR.dtR||.016);if(GAR.vuePose){GAR.cdx=dx;GAR.cdy=dy;GAR.cvx=GAR.cvy=0;}else{garRessort(GAR,'cdx','cvx',dx,7,dt9);garRessort(GAR,'cdy','cvy',dy,7,dt9);} /* (LA MISE EN PLACE) posé d'un coup quand l'écran est caché */ // (2026-10-05) lissé dans le TEMPS, plus image par image · (2026-10-06) en RESSORT : l'inventaire qui s'ouvre déplaçait la place de la caisse de ~180 px, l'image partait de 20 px en UNE image (mesuré) — elle glisse maintenant en ~0,5 s
  if(Math.abs(GAR.cdx)<.5&&Math.abs(GAR.cdy)<.5)return;                // centré : l'objectif reste droit
  camera.setViewOffset(VP.w,VP.h,GAR.cdx,GAR.cdy,VP.w,VP.h);            // décaler l'objectif de +dx fait glisser l'image de −dx
}
function garageDecale(k,kx){ // k = part de la hauteur d'image dont l'objectif se décale vers le bas (la scène monte) ; 0 = objectif centré ; kx = idem en largeur (paysage)
  kx=kx||0;
  if(!(Math.abs(k)>1e-4||Math.abs(kx)>1e-4)){GAR.dec=GAR.decX=0;GAR.cdx=GAR.cdy=GAR.cvx=GAR.cvy=0;camera.clearViewOffset();return;} // (2026-09-30) zéro = TOUT effacer, cadrage mesuré compris (closeGarage)
  if(Math.abs(k-(GAR.dec||0))<1e-4&&Math.abs(kx-(GAR.decX||0))<1e-4)return;
  GAR.dec=k<1e-4?0:k;GAR.decX=Math.abs(kx)<1e-4?0:kx;
  if(!GAR.dec&&!GAR.decX){camera.clearViewOffset();return;}
  camera.setViewOffset(VP.w,VP.h,GAR.decX*VP.w,GAR.dec*VP.h,VP.w,VP.h); // ⚠ r128 pose aspect = fullWidth/fullHeight : on donne la VRAIE taille de la vue
}
// (dev, 2026-09-26) cadrage d'atelier FIGÉ pour les bancs avant/après : angle, tangage, distance — le tour automatique s'arrête
window.dbgGarage=function(a,p,d,v){if(a==='libre'){GAR.fige=false;garageDrag=false;return {libre:true};}if(a==='etat')return {vA:+(GAR.vA||0).toFixed(3),swO:+(GAR.swO||0).toFixed(3),swK:+(GAR.swK||0).toFixed(2),p:+garagePitch.toFixed(3),ang:+garageAng.toFixed(2)};if(a!=null)garageAng=a;if(p!=null)garagePitch=p;if(d!=null)garageDist=d;if(v!=null)GAR.vA=GAR.vAc=v;GAR.vW=0;GAR.pT=garagePitch;GAR.fige=true;GAR.swK=GAR.swO=GAR.swP=0;garageDrag=true;return {a:garageAng,p:garagePitch,d:garageDist,v:GAR.vA||0};}; // (2026-09-30) 4e argument : le regard (GAR.vA) ; dbgGarage('libre') rend la main
window.dbgGarObj=function(){return GAR;}; // banc (2026-10-14, passe graphismes · garage-lumiere) : l'objet GAR pour régler à chaud les couleurs de l'atelier
// ---------- RÉGLAGES : audio + commandes + sauvegarde (les toggles pilotent les MÊMES états que les boutons du HUD) ----------
const setEl=$('settings');
function setRefresh(){
  const put=(id,on)=>{const b=$(id);if(b){b.textContent=on?'ON':'OFF';b.className=on?'':'off';}};
  put('tgSnd',SND.sfx);put('tgMus',SND.music);
  const lg=$('tgLang');if(lg){lg.textContent=LANG.toUpperCase();lg.className='';}
  volUI();
}
// LANGUE : boucle FR → EN → FR (`langNext()`, seul écrivain — voir sa définition). La devise
// est désormais fixe (dollar, quelle que soit la langue) ; seul le texte bascule.
$('langRow').addEventListener('click',e=>{
  e.stopPropagation();
  langNext();
  $('tgLang').textContent=LANG.toUpperCase();
  $('tgLang').className=''; // toujours « allumé » : ce n'est pas un interrupteur ON/OFF
  applyLangDOM(); // toute l'interface bascule d'un coup (argent, record, menu, réglages, garage, HUD)
});
function openSettings(){setEl.classList.add('on');setRefresh();}
function closeSettings(){setEl.classList.remove('on');}
$('setBtn').addEventListener('click',e=>{e.stopPropagation();openSettings();});
$('setClose').addEventListener('click',e=>{e.stopPropagation();closeSettings();});
setEl.addEventListener('click',e=>{if(e.target===setEl)closeSettings();}); // clic hors carte = fermer
for(const row of document.querySelectorAll('.setRow')) row.addEventListener('click',e=>{
  if(!row.getAttribute('data-tg'))return; // ⚠ les lignes de CURSEUR n'ont pas d'interrupteur : les laisser passer ici
  e.stopPropagation();                    //   rejouerait un `null.click()` et surtout rappellerait setRefresh
  const b=$(row.getAttribute('data-tg'));if(b)b.click(); // réutilise la logique existante (persistance comprise)
  setRefresh();
});
addEventListener('keydown',e=>{if(e.code==='Escape'&&setEl.classList.contains('on'))closeSettings();});
// ---------- L'ÉTAL : on fait défiler les fruits et on règle leur boost / leur fréquence ----------
let stallOn=false,stallI=0,stallMesh=null,stallAng=0;
const stEl=$('stall');
// L'ÉCLAIRAGE DE L'ÉTAL : le showroom est une nuit cyan — sans lumière propre, un fruit rouge vire au
// violet terne. Deux sources dédiées (clé chaude + contre-jour froid) le rendent APPÉTISSANT.
const stallKey=new THREE.PointLight(0xfff0dc,0,60);stallKey.visible=false;scene.add(stallKey);
const stallRim=new THREE.PointLight(0x9fd8ff,0,60);stallRim.visible=false;scene.add(stallRim);
/* LES LAMPES DE L'ATELIER PRENNENT LA PLACE DES GYROPHARES (2026-09-28, chasse aux gels) — MESURÉ au JOUER : allumer stallKey/stallRim
   faisait passer la scène de 8 à 10 lumières ponctuelles, et three RECOMPILE chaque matière éclairée pour ce nouveau compte (il est écrit
   DANS le programme) : 17 programmes au 1er rendu de l'atelier — la caisse, l'atelier, et même le bitume et la ville, dessinés derrière
   ses murs —, ~0,8 s de gel sur PC, trois à cinq fois plus sur iPhone, puis 1 à 2 de plus à la 1re image de course. Or les deux
   gyrophares de la meute sont TOUJOURS à 0 hors d'une poursuite, et l'atelier comme l'étal sont des écrans de menu : les deux lampes
   entrent quand les deux gyrophares sortent. Le compte reste 8, l'atelier dessine avec les programmes de la course, déjà prêts. Image
   identique : une lumière à 0 n'ajoute rien (et au garage, à 1 500 m d'altitude, les gyrophares sont de toute façon hors de portée).
   ⚠ Les lampes ne s'allument QUE par ici : un `stallKey.visible=true` en direct referait 10 lumières. */
function atelierLampes(on){stallKey.visible=stallRim.visible=on;for(const l of gyroLights)l.visible=!on;}
let stallMode='fruit'; // 'fruit' = l'étal · 'moteur' = l'atelier (même vitrine, autre contenu)
function stallShow(i){
  const N=stallMode==='moteur'?ENGINE_TIERS.length:FRUIT_DEFS.length;
  stallI=((i%N)+N)%N;
  if(stallMesh){scene.remove(stallMesh);stallMesh=null;}
  if(stallMode==='moteur'){ // L'ATELIER : le moteur tourne sur son socle, avec sa fiche
    stallMesh=mkEngine(stallI);stallMesh.scale.setScalar(1.55);
    scene.add(stallMesh);
    const E=ENGINE_TIERS[stallI];
    $('stName').textContent=E.n;
    $('stRare').textContent=E.d+'  ·  poussée ×'+E.push.toFixed(2)
      +(stallI===0?'  ·  d\'origine':'  ·  à '+E.coins+' pièces')
      +(stallI===engTier?'   ◀ LE TIEN':'');
    return;
  }
  stallMesh=mkFruit(stallI);stallMesh.scale.setScalar(2.6); // gros plan d'étal : on voit le vernis (sans que le fruit déborde du cadre)
  scene.add(stallMesh);
  const d=FRUIT_DEFS[stallI];
  $('stName').textContent=d.n;
  $('stBoost').value=d.boost;$('stFreq').value=d.freq;
  stallRefresh();
}
function stallRefresh(){
  const d=FRUIT_DEFS[stallI];
  $('stBoostV').textContent=d.boost.toFixed(2);
  $('stFreqV').textContent=Math.round(d.freq);
  let tot=0;for(const f of FRUIT_DEFS)tot+=Math.max(0,f.freq);
  $('stRare').textContent=tot>0?('soit '+Math.round(100*Math.max(0,d.freq)/tot)+' % des fruits de la piste'
    +(d.freq<=0?' — jamais tiré':'')):'aucun fruit ne peut apparaître (toutes les fréquences à 0)';
}
function closeStall(){
  bioApply(BIO.cur);MENUV.bio=false; // (vague 2 : la vitrine de l'accueil repose son couchant) ⚠ (2026-09-24) le garage/l'étal écrasent le ciel chaque frame (nuit étoilée) : on rend la main au BIOME en sortant, sinon la 1re course gardait leur ciel
  stallOn=false;stEl.classList.remove('on');document.body.classList.remove('inStall');
  if(stallMesh){scene.remove(stallMesh);stallMesh=null;}
  atelierLampes(false);stallKey.intensity=0;stallRim.intensity=0; // on éteint l'étal en partant
  garageFloor.visible=false;carGroup.visible=true;
  sunSprite.visible=true;horizonGlow.visible=true;for(const r9 of RAYS)r9.visible=true;
  if(pigGroup)pigGroup.visible=true;
  camera.up.set(0,1,0);
  frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);
  overlay.style.display='flex';
  saveFruits(); // les réglages survivent à la session
}
function stallRender(dt){ // même showroom que le garage : fond cyan propre, caméra qui tourne autour
  const ay=GARAGE_Y;
  if(stallMesh){stallMesh.position.set(0,ay,0);stallMesh.rotation.y+=dt*.55;}
  if(GAR.root)GAR.root.visible=false;                       // l'étal garde son fond nu : pas d'atelier derrière le fruit
  garageFloor.position.set(0,ay-1.6,0);garageFloor.visible=true;
  atelierLampes(true);stallKey.intensity=2.6;stallKey.color.setHex(0xfff0dc);stallKey.distance=60; // ⚠ le GARAGE leur change teinte et portée : on repose les valeurs d'étal
  stallKey.position.set(Math.sin(stallAng+.7)*5,ay+4,Math.cos(stallAng+.7)*5);
  stallRim.intensity=1.5;stallRim.color.setHex(0x9fd8ff);stallRim.distance=60;
  stallRim.position.set(Math.sin(stallAng+3.6)*6,ay+1,Math.cos(stallAng+3.6)*6);
  skyU.uSkyMul.value.set(.62,.92,1.34);skyU.uStars.value=1.7;skyU.uMoon.value=1.5;skyU.uSunHalo.value=.12;
  sunSprite.visible=false;horizonGlow.visible=false;for(const r9 of RAYS)r9.visible=false;
  stallAng+=dt*.25;
  camera.up.set(0,1,0);
  camera.position.set(Math.sin(stallAng)*7,ay+2.4,Math.cos(stallAng)*7);
  camera.lookAt(0,ay+.2,0);
}
// (l'étal est retiré du menu : régler les fruits n'apportait rien au joueur — `openStall('fruit')`
//  et `openStall('moteur')` restent appelables depuis la console pour le réglage)
// (l'atelier des moteurs est retiré du menu : le moteur se gagne en jouant, il n'y a rien à y régler —
//  `openStall('moteur')` reste fonctionnel pour le debug)
$('stClose').addEventListener('click',e=>{e.stopPropagation();closeStall();});
$('stPrev').addEventListener('click',e=>{e.stopPropagation();stallShow(stallI-1);});
$('stNext').addEventListener('click',e=>{e.stopPropagation();stallShow(stallI+1);});
$('stBoost').addEventListener('input',e=>{FRUIT_DEFS[stallI].boost=+e.target.value;stallRefresh();});
$('stFreq').addEventListener('input',e=>{FRUIT_DEFS[stallI].freq=+e.target.value;stallRefresh();});
$('stBoost').addEventListener('change',saveFruits);
$('stFreq').addEventListener('change',saveFruits);
addEventListener('keydown',e=>{if(!stallOn)return;
  if(e.code==='Escape')closeStall();else if(e.code==='ArrowLeft')stallShow(stallI-1);else if(e.code==='ArrowRight')stallShow(stallI+1);});
$('garageBtn').addEventListener('click',e=>{e.stopPropagation();openGarage();});
/* (2026-09-29, Léo) la MAISON de l'atelier = le MENU de l'écran de mort : on rentre à l'ACCUEIL (venu de la mort, la course est rangée
   comme par son MENU — accueilRetour) ; venu des MISSIONS (VOIR), on y retourne comme avant (`__mRetour`, lu à la fermeture). */
$('gClose').addEventListener('click',e=>{e.stopPropagation();uiPop(e.currentTarget);uiClic('retour');
  if(window.__mRetour){ecranWipe(function(){closeGarage();});return;} // venu des MISSIONS (VOIR) : on y retourne
  ecranWipe(function(){if(started&&gameOver)accueilRetour();garMode('menu');});}); // (2026-09-30) le garage EST le menu : la maison y ramène
/* LE JOUER DE L'ATELIER (2026-09-29, Léo : « replace mieux le bouton play ») : sous le pouce droit, là où REJOUER attend sur l'écran de
   mort. Il lance LE LÂCHER — la caisse roule dans le rideau de flammes, la course part sur le boost de départ. Ce qui sort par la porte
   est une caisse À TOI : un essai (caisse fermée, habillage pas encore acheté) rend la main à la tienne avant le départ. */
function garJouer(e){
  if(e)e.stopPropagation();
  if(!garageOn||GAR.go||ecranWipe._on||pendingScore!=null||performance.now()<(garJouer._t||0))return;
  invFerme(true);invHoldFin();
  const el=$('gJouer');uiPop(el);uiClic('jouer');try{pixBurst(el,16);}catch(x){} // (2026-10-16) le bruit de MOTEUR
  /* (2026-10-18, session UI-REVUE, Sacha : « rajoute le bouton JOUER avec les 3 flèches animées dans le garage » → l'INVENTAIRE et la BOUTIQUE,
     où il n'y avait que RETOUR) JOUER part aussi de là. On referme d'abord le mode comme le ferait RETOUR — l'inventaire rouvre l'atelier (la
     porte remonte en 0,7 s, les pinces lâchent les roues : la caisse ne part pas dans une porte fermée), la boutique rend l'atelier sous son
     voile de nuit — puis le départ habituel, le temps que la scène soit là (450 / 650 ms). Le clic, le moteur et le jaillissement partent au
     toucher ; un second toucher pendant l'attente est ignoré. */
  let att9=0;const bq9=gModeM()==='shop';
  if(GATL.on){gAtelier(false);att9=450;}
  if(att9||bq9){try{gGarageReplie();}catch(x){}if(bq9)att9=650;garJouer._t=performance.now()+att9+200;}
  const part=function(){
    if(!garageOn||GAR.go)return;
    if(SHOP.tab==='voiture'){if(!carUnlocked(garageI))garageShow(equippedCar());}
    else if(SHOP.prev&&!shopOwned(SHOP.prev.cat,COSM[SHOP.prev.cat][SHOP.prev.i].id)){shopTab('voiture');garageShow(equippedCar());}
    goImmersive();
    if(jadePlayOk()){jadeJouer();return;} // (2026-10-12, Léo) le JOUER lance le SOLEIL DE JADE — depuis le 13/10 seulement avec ?play=jade
    if(sfPlayOk()){classiqueJouer();return;} // (2026-10-13, Sacha) le JOUER lance le MODE CLASSIQUE AU HASARD
    tutoArme();garageLaunch();};
  if(SAVE.d.facile==null&&!SAVE.d.tuto)Promise.resolve().then(part);else if(att9)setTimeout(part,att9);else part();
}
$('gJouer').addEventListener('click',garJouer);
/* BOUTIQUE · RÉGLAGES (repris de l'écran de mort) : l'atelier se ferme sous le volet et le routeur ouvre l'écran voulu — par `__mRetour`,
   le chemin que l'observateur de l'overlay lit à la fermeture (un mGo direct serait aussitôt écrasé par son retour à la racine). */
for(const b9 of document.querySelectorAll('#gOutils [data-go],#gShopBas'))b9.addEventListener('click',function(e){ // (2026-09-30) + la BOUTIQUE du bas
  e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b9);uiClic('nav');
  const vers=b9.getAttribute('data-go');ecranWipe(function(){window.__mRetour=vers;closeGarage();});});
function gActSync(){const a=$('gAct');if(!a)return;const bt=$('gEquip'),row=$('gBuyRow'),vu=function(x){return !!x&&x.style.display!=='none';};
  const cons=!!gEl&&!gEl.classList.contains('vitrine'); /* (2026-10-09) LA CONSOLE (le garage de Sacha) : JOUER reste en or, ÉQUIPER dit l'état par sa couleur (gEqTon) */
  const ch=!cons&&(vu(row)||(vu(bt)&&bt.dataset.etat!=='eq'));a.classList.toggle('choix',ch);
  const j=$('gJouer');if(j)j.classList.toggle('pb-gold',!ch);
  if(cons&&bt)gEqTon(bt,vu(row));}
/* ÉQUIPER EN COULEURS (2026-10-09, Léo) : ROUGE = pas à toi (à vendre, en boutique, à gagner), BLEU = à toi, à équiper, VERT = équipée.
   Le mot : ÉQUIPÉE quand c'est la tienne, ÉQUIPER sinon (le cadenas devant quand elle n'est pas à toi). */
function gEqTon(bt,achat){const et=bt.dataset.etat,ton=et==='eq'?'vert':(achat||et==='verrou')?'rouge':'bleu';
  bt.dataset.ton=ton;const bb=achat?$('gBuy'):null,px=bb&&bb.dataset.px||'';bt.classList.toggle('achat',!!px);
  /* (2026-10-10, Léo : « ÉQUIPER se change en BUY avec le prix de la voiture quand je regarde une voiture non acquise ») À VENDRE : le verbe
     en petit, le PRIX dessous (vert billet ; or pour l'euro) — sur une ligne il ne tenait pas dans la colonne de JOUER. Le geste reste le relais vers #gBuy. */
  const h=px?'<span class="gEqV">'+TR('ACHETER')+'</span><b class="gEqP'+(bb.dataset.eur?' eur':'')+'">'+px+'</b>'
    :(ton==='vert'?pxi('coche'):ton==='rouge'?pxi('verrou'):'')+'<span>'+TR(ton==='vert'?'ÉQUIPÉE':'ÉQUIPER')+'</span>';
  bt.innerHTML=h;} // (gActSync ne tourne qu'à l'affichage d'une caisse ou d'un habillage : réécrire est sans coût, et passe toujours après gEtat)
/* Le doigt sur ÉQUIPER ROUGE d'une caisse À VENDRE = l'achat (ACHETER n'est plus à l'écran) : le geste est relayé au bouton d'achat caché,
   qui fait tout comme avant (achat et tampon, ou « IL TE MANQUE » ; une légendaire part vers la BOUTIQUE). Seulement un VRAI doigt :
   JOUER clique ÉQUIPER pour partir avec la caisse affichée, ce clic-là ne doit jamais acheter. */
try{$('gAct').addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('#gvCof,#gShopBas');if(!b||!gModeConsole())return; // (2026-10-09) LA CONSOLE À TROIS MODES
  e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b);uiClic('onglet');gModeVa(b.id==='gvCof'?'inv':'shop');},true);}catch(e){}
try{$('gAct').addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('#gEquip'),row=$('gBuyRow');
  if(!b||!e.isTrusted||b.dataset.ton!=='rouge'||!row||row.style.display==='none'||!gEl||gEl.classList.contains('vitrine'))return;
  e.stopPropagation();const bb=$('gBuy');if(bb)bb.click();if(b.dataset.ton==='rouge'&&row.style.display!=='none'&&!(bb&&bb.dataset.bout==='1'))gSecoue(b);},true);}catch(e){} // UN SEUL LINGOT D'OR (charte) : s'il y a un choix, c'est LUI qui est en or — JOUER passe en laque
