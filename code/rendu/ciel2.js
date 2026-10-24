/* ============ LE CIEL EN DEUX TEMPS — CIEL2 (2026-09-27, passe perf iPhone, tour 2) ============
   MESURÉ (banc du dôme seul à la résolution de l'iPhone en NETTE, 585×1266, rendu logiciel puis carte graphique) : le dôme coûtait
   ~180 ms d'image logicielle, AU SOL COMME EN VOL, en regardant la mer comme le zénith, aux NUAGES comme en VILLE — éteindre la
   mer de nuages n'y changeait RIEN. C'est que les `if` d'un shader ne sautent pas le travail comme on l'espère : sous le rendu
   logiciel et sous ANGLE/D3D (et sans garantie sur la puce d'Apple, qui aplatit volontiers les petites branches), chaque pixel
   paie une grosse part du programme ENTIER — mer, ville, skyline, étoiles, fond musical — même là où la couche ne peint pas.
   Deux leviers qui retirent du VRAI travail partout, sans rien changer à l'image :
     1. MOINS DE PIXELS pour ce qui est LISSE : le dégradé, la mer de nuages, le soleil, la guirlande, le voile (NUAGES, ORBITE) —
        le plafond de pluie et la lueur des quartiers (VILLE) — sont peints dans une cible HORS ÉCRAN à ½ de la résolution (¼ des
        pixels). Rien de tout ça n'a de bord : relu en bilinéaire, c'est le même ciel. MESURÉ sur l'image finale (post compris, même
        image figée) : écart moyen ~0,1 niveau ; les seuls écarts francs sont le liseré de mer juste sous l'horizon, où les ondulations les plus fines (1 à 3 px)
        se placent un pixel à côté (quelques centaines de pixels à 20-40 niveaux), et des bords de gouttes où le FXAA bascule ; regardé en gros plan à la taille du téléphone
        (1170×2532) : indiscernable. En cible 8 bits (téléphone sans demi-flottant), la passe lisse se TRAME (`uBasTr`) : sans ça,
        l'arrondi dessinait des anneaux d'un niveau dans les grands dégradés (mesuré : biais local en courbes de niveau → bruit).
     2. DES PROGRAMMES À LA TAILLE DE LEUR TRAVAIL : la passe NETTE (le dôme, à pleine résolution, toujours après les opaques donc
        rejeté là où il est caché) relit la passe lisse AU PIXEL DE L'ÉCRAN (`gl_FragCoord`) et n'ajoute que ce qui a des BORDS —
        étoiles et lune (NUAGES, ORBITE) · lumières fines de l'abîme et skyline (VILLE) — et la trame. Elle ne contient plus rien d'autre.
   MÊME CAMÉRA, MÊME IMAGE : la passe lisse est rendue ICI, dans `scene.onBeforeRender` (chaîné, jamais réassigné), c.-à-d. à chaque
   rendu de la scène, avec LA caméra de ce rendu, après la mise à jour de ses matrices et avant la passe d'ombre et le premier objet —
   c'est le SEUL point d'appel. Elle reprend le maillage du dôme et sa matrice : les directions interpolées sont exactement celles du
   dôme. La cible suit la taille du tampon de dessin (donc `curDPR` et l'échelle QL) et prend le format du compositeur (demi-flottant
   là où il existe : le cœur du soleil y dépasse 1, le bloom le lit).
   REPLI — le programme PLEIN d'avant, au pixel près : pendant les fondus d'entrée et de sortie de la VILLE, quand le fond musical
   joue hors de la ville (accueil), à l'atelier, à l'étal, dôme caché, et avec `?ciel=plein` (pour comparer sur le téléphone).
   Zéro compilation en course : les cinq programmes sont compilés ET dessinés une fois au chargement (`cielChauffe`, cibles 8×8 au
   format des vraies — la puce d'Apple fabrique son état de pipeline au premier dessin). Bancs : `dbgCiel2()`. */
const CIEL2={on:!/[?&]ciel=plein/.test(location.search),rt:null,sc:new THREE.Scene(),me:null,v:new THREE.Vector2(),mode:'',n:0};
CIEL2.sc.autoUpdate=false; // la matrice du maillage est recopiée de celle du dôme (déjà à jour) : rien à recalculer
CIEL2.me=new THREE.Mesh(skyDome.geometry,skyDome.userData.ciel.basN);CIEL2.me.frustumCulled=false;CIEL2.me.matrixAutoUpdate=false;CIEL2.sc.add(CIEL2.me);
const cielType=()=>(composer&&composer.renderTarget1)?composer.renderTarget1.texture.type:THREE.UnsignedByteType;
const cielCible=(w,h,prof)=>new THREE.WebGLRenderTarget(w,h,{format:THREE.RGBAFormat,type:CIEL2.octets?THREE.UnsignedByteType:cielType(),minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:!!prof,stencilBuffer:false});
function cielHorsCourse(){try{return (garageOn&&!(CHUTE&&CHUTE.on))||stallOn;}catch(e){return true;}} // (déclarés plus loin : au tout premier rendu, prudence)
function cielDeuxTemps(r9,cam){
  const C=skyDome.userData.ciel,U=skyU;let md='';
  if(CIEL2.on&&skyDome.visible&&!cielHorsCourse()){
    if(U.uVille.value<=.001&&U.uLvl.value<=.001)md='N';                  // NUAGES, ORBITE (et leur fondu) : ni ville, ni fond musical
    else if(U.uVille.value>.9999&&U.uPluie.value>.9999)md='V';}           // VILLE sous la pluie (le raccourci d'avant : la ville seule)
  if(U.uJade.value>.001||U.uCanyon.value>.001)md=''; // (PICS DE JADE) le rouleau peint vit dans le programme PLEIN · (CANYON) son fondu aussi
  /* (2026-10-22, Léo : « la map jade bugue, la grotte non ») LES PICS DE JADE SEULS : leur ciel (le rouleau peint, la mer en cubes) dans un programme à lui, comme le canyon.
     MESURÉ : le dôme coûtait à lui seul 40 à 50 % d'une image de Jade (sans lui : 8,5 → 5 ms) — il tournait dans le programme PLEIN, qui porte aussi la ville, l'orbite, les nuages et
     le fond musical : la puce y réserve les registres du programme ENTIER pour chaque pixel, même sur la branche courte. Le MÊME calcul, sans le reste. `?ciel=plein` = avant. */
  if(CIEL2.on&&U.uJade.value>.9999&&C.jd&&skyDome.visible&&!cielHorsCourse()){CIEL2.mode='J';if(skyDome.material!==C.jd)skyDome.material=C.jd;return;}
  if(U.uCanyon.value>.9999&&C.cy&&skyDome.visible&&!cielHorsCourse()){CIEL2.mode='C';if(skyDome.material!==C.cy)skyDome.material=C.cy;return;} // (2026-10-14) LE CANYON SEUL : son programme à lui
  CIEL2.mode=md;
  if(!md){if(skyDome.material!==C.plein)skyDome.material=C.plein;return;}
  r9.getDrawingBufferSize(CIEL2.v);
  const w=Math.max(1,Math.round(CIEL2.v.x*C.f)),h=Math.max(1,Math.round(CIEL2.v.y*C.f));
  if(!CIEL2.rt){CIEL2.rt=cielCible(w,h,false);U.uBasTex.value=CIEL2.rt.texture;U.uBasTr.value=CIEL2.rt.texture.type===THREE.UnsignedByteType?160/255:0;} // (trame d'UN niveau de 8 bits : cielTrame vaut ±1/320)
  else if(CIEL2.rt.width!==w||CIEL2.rt.height!==h)CIEL2.rt.setSize(w,h);            // la résolution a changé (QL, rotation) : la cible suit
  const cible=r9.getRenderTarget();
  if(cible)U.uBasInv.value.set(1/cible.width,1/cible.height);else U.uBasInv.value.set(1/CIEL2.v.x,1/CIEL2.v.y); // le pixel de l'écran → la cible lisse
  CIEL2.me.material=md==='N'?C.basN:C.basV;CIEL2.me.matrixWorld.copy(skyDome.matrixWorld);
  r9.setRenderTarget(CIEL2.rt);r9.render(CIEL2.sc,cam);r9.setRenderTarget(cible);
  skyDome.material=md==='N'?C.netN:C.netV;CIEL2.n++;
}
function cielChauffe(){ if(!CIEL2.on)return; try{
  const C=skyDome.userData.ciel,a=cielCible(8,8,false),b=cielCible(8,8,true),sc=new THREE.Scene(),me=new THREE.Mesh(skyDome.geometry,C.plein);
  me.frustumCulled=false;sc.add(me);const cible=renderer.getRenderTarget(),t0=skyU.uBasTex.value;skyU.uBasTex.value=a.texture;
  renderer.setRenderTarget(a);for(const k of ['basN','basV']){me.material=C[k];renderer.render(sc,camera);}
  renderer.setRenderTarget(b);for(const k of ['netN','netV','plein','cy','jd']){me.material=C[k];renderer.render(sc,camera);}
  renderer.setRenderTarget(cible);skyU.uBasTex.value=t0;a.dispose();b.dispose(); // (les matières restent : leurs programmes vivent)
}catch(e){console.warn('cielChauffe',e);} }
cielChauffe();
{const ob=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt9){ob.call(this,r9,s9,cam,rt9);cielDeuxTemps(r9,cam);};} // ⚠ CHAÎNÉ (pisteLoin passe d'abord)
/* (banc) `dbgCiel2(false)` = le ciel d'avant, pour des A/B dans la même page · `dbgCiel2(on,{rendre:1})` re-rend l'image courante tout de
   suite (même caméra, même horloge : deux captures comparables au pixel) · `{octets:1}` force la passe lisse en 8 bits (le cas d'un
   téléphone sans cible demi-flottante). */
window.dbgCiel2=function(on,o){if(on!=null)CIEL2.on=!!on;o=o||{};if(o.f)skyDome.userData.ciel.f=Math.max(.25,Math.min(1,+o.f)); // `{f:.667}` : une autre résolution de passe lisse (banc)
  if(o.octets!=null&&!!o.octets!==!!CIEL2.octets){CIEL2.octets=!!o.octets;if(CIEL2.rt){CIEL2.rt.dispose();CIEL2.rt=null;}}
  if(o.rendre){if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  return {on:CIEL2.on,mode:CIEL2.mode,rendus:CIEL2.n,cible:CIEL2.rt?[CIEL2.rt.width,CIEL2.rt.height,CIEL2.rt.texture.type===THREE.UnsignedByteType?8:16]:null,f:skyDome.userData.ciel.f};};
function engVigBuild(){
  if(engVigMesh){ // ⚠ mkEngine fabrique des matériaux NEUFS à chaque appel : sans ça, une fuite par palier
    engVigScene.remove(engVigMesh);
    if(engVigFeu&&engVigFeu.parent===engVigMesh)engVigMesh.remove(engVigFeu); // la FLAMME est partagée : elle passe au moteur suivant
    // (2026-09-26, passe perf) MESURÉ : libérées avant que le nouveau moteur soit rendu, ses matières faisaient détruire puis RECOMPILER
    // leurs programmes à chaque palier (~5 shaders, l'à-coup de la montée de moteur). Libéré après le 1er rendu du suivant (engVigRender).
    if(engVigVieux)jeteEngin(engVigVieux);
    engVigVieux=engVigMesh;engVigMesh=null;
  }
  const t=engVigTier();
  engVigMesh=mkEngine(t);
  engVigScene.add(engVigMesh);
  // CADRAGE AUTOMATIQUE — mesuré : 10 des 30 paliers débordaient (la tuyère à plasma porte à 2,12 du
  // centre pour un champ de 1,86). Reculer la caméra aurait réduit le moteur rouillé à un pois. Chaque
  // pièce est donc mise à l'échelle pour remplir le cadre. Le rayon retenu est celui du plan XZ, parce
  // que la pièce TOURNE : c'est lui qui balaie la largeur. Recentrage en Y seulement — recentrer en X
  // ferait valser la pièce à chaque tour.
  {const bb=new THREE.Box3().setFromObject(engVigMesh);
   const rx=Math.max(Math.abs(bb.min.x),Math.abs(bb.max.x)),rz=Math.max(Math.abs(bb.min.z),Math.abs(bb.max.z)),
         rxz=Math.max(.001,Math.hypot(rx,rz)),ry=Math.max(.001,(bb.max.y-bb.min.y)/2);
   const halfV=engVigCam.position.z*Math.tan(engVigCam.fov*Math.PI/360),halfH=halfV*engVigCam.aspect;
   // .92 → .76 : il faut de l'air autour de la pièce pour que la flamme de boost DÉPASSE de la
   // silhouette. À 92 % le moteur touchait les bords et rien ne pouvait se voir derrière lui.
   const k=Math.min(halfH*.76/rxz,halfV*.76/ry);
   engVigMesh.scale.setScalar(k);
   engVigMesh.position.y=-(bb.min.y+bb.max.y)/2*k;
   engVigBaseY=engVigMesh.position.y;   // le tremblement oscille AUTOUR de cette hauteur de cadrage
   // les matériaux qui peuvent rougir (tout ce qui est Phong : bloc, cache-culasse, chrome).
   // On les collecte au build plutôt que de traverser l'arbre à chaque frame.
   engVigMats=[];
   engVigMesh.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive&&engVigMats.indexOf(o.material)<0)engVigMats.push(o.material);});
   /* ---- LA FLAMME EST ACCROCHÉE AU POT, PAS POSÉE DANS LA SCÈNE ----
      ⚠ LE BUG QU'ON VIENT DE CORRIGER. Elle était ajoutée à `engVigScene` à une position fixe
      calculée sur le rayon d'encombrement. Or la pièce TOURNE (`engVigMesh.rotation.y`) : la
      flamme, elle, ne tournait pas. Résultat visible en jeu : un cône orange planté à côté du
      moteur, sans rapport avec le tuyau, immobile pendant que le bloc tourne.
      Le correctif précédent (« la sortir du gabarit pour qu'elle ne disparaisse jamais derrière
      le bloc ») soignait un symptôme et fabriquait celui-ci. La vraie réponse : elle devient
      FILLE du moteur, posée sur l'ancre que `mkEngine` déclare (`userData.echap`). Elle tourne
      donc avec lui, elle part du bon endroit et dans le bon sens — et si elle passe une demi-
      seconde derrière le bloc au fil de la rotation, c'est juste : un pot tourne aussi. */
   if(!engVigFeu){engVigFeu=new THREE.Mesh(engVigFeuGeo,engVigFeuMat);engVigFeu.visible=false;}
   if(engVigFeu.parent)engVigFeu.parent.remove(engVigFeu);
   engVigMesh.add(engVigFeu);                    // ⚠ FILLE DU MOTEUR : c'est tout le correctif
   const A=engVigMesh.userData.echap||{p:[-rxz*.9,0,0],d:[-1,0,0]};
   engVigFeu.position.set(A.p[0],A.p[1],A.p[2]);
   engVigFeu.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),
     new THREE.Vector3(A.d[0],A.d[1],A.d[2]).normalize());
   // ⚠ TAILLE EN UNITÉS DU MOTEUR, plus en unités d'écran : la flamme hérite maintenant de
   // l'échelle de cadrage `k` par son parent. La multiplier par `k` une seconde fois la rendait
   // gigantesque sur les petits moteurs et minuscule sur les gros.
   engVigFeuBase=rxz*.42;}
  const E=ENGINE_TIERS[t]||ENGINE_TIERS[0];
  // ⚠ la flamme prend la TEINTE DU PALIER (`E.flam`). Elle était figée en orange `0xffa855` pour
  // les trente : la table portait une couleur par moteur que personne n'affichait jamais.
  engVigFeuMat.color.setHex(E.flam);
  // légende COURTE : « PALIER 7 / 30 · POUSSÉE ×1.50 » passait à la ligne dans le cadre étroit
  const lg=(t+1)+'/'+ENGINE_TIERS.length+'  ·  ×'+E.push.toFixed(2);
  if(engVigCapEl)engVigCapEl.firstChild.nodeValue=TR(E.n);
  if(engVigTierEl)engVigTierEl.textContent=lg;
  // l'ecran de fin porte la MEME fiche : on ne recalcule rien, on la recopie
  if(engEndCapEl)engEndCapEl.firstChild.nodeValue=TR(E.n);
  if(engEndTierEl)engEndTierEl.textContent=TR('PALIER')+' '+lg;
  engVigTierShown=t;
}
function engVigRender(dt){
  /* DEUX MAISONS, UN SEUL RENDU (2026-08-03). Pendant la course le moteur vit dans le coin du HUD ;
     à la mort il passe sur l'écran de fin, en grand, pour montrer JUSQU'OÙ on est monté. Le quad se
     cale sur le rect DOM de la cible, donc il suffit de changer d'élément — pas une ligne de rendu
     à dupliquer, et le palier affiché reste celui qu'on avait au moment de mourir. */
  const fin=gameOver&&overlay.style.display!=='none',tel=TCTL.on;
  let cible,carte9=false;
  if(tel){ /* TÉLÉPHONE (2026-09-25) : l'écran nu masque la vignette de coin et l'écran de fin desktop — le moteur 3D vit
              désormais dans la grande carte « NOUVEAU MOTEUR » (engBig), et SEULEMENT pendant qu'elle est là. Le reste du
              temps : aucun rendu, et surtout plus la relecture GPU→CPU de l'écran de fin masqué (20 par seconde pour rien). */
    if(engVigEl&&engVigEl.style.display!=='none')engVigEl.style.display='none';
    if(engEndEl&&engEndEl.style.display!=='none')engEndEl.style.display='none';
    // (2026-09-26, user : « dans l'écran de mort, au lieu d'avoir marqué ENGINE GAS TURBINE, il faut voir le 3D ») : le moteur tourne aussi
    // dans la carte MOTEUR de l'écran de mort, tant qu'elle est à l'écran
    const mort9=gameOver&&ENG_MORT.ctx&&ENG_MORT.cv&&ENG_MORT.cv.isConnected; // (2026-10-14, passe perf mobile) `offsetParent` (carte affichée ?) se demande plus bas, à la cadence de la recopie : ici, à CHAQUE image, il forçait la mise en page pendant que les chiffres des cartes montent
    carte9=engBig.on&&!gameOver&&!paused; // (vague 2) la carte de course : recollée dans l'image (engQuadDraw), plus de relecture
    if(!carte9&&!mort9){if(engSwapT>0)engSwapT=Math.max(0,engSwapT-dt);return;}
    cible=null;
  }else{
    cible=fin?engEndEl:engVigEl;
    const autre=fin?engVigEl:engEndEl;
    const on=started&&!garageOn&&!stallOn&&(fin||(!gameOver&&!paused&&running));
    if(autre&&autre.style.display!=='none')autre.style.display='none';
    if(!on){if(cible&&cible.style.display!=='none')cible.style.display='none';return;}
    if(cible.style.display!=='block')cible.style.display='block';
  }
  if(engVigTierShown!==engVigTier())engVigBuild();
  if(!engVigMesh)return;
  /* ---- L'ANIMATION DU CHANGEMENT DE PALIER, côté vignette ----
     Pendant 1,25 s la pièce s'EMBALLE puis se recale : c'est le geste qui dit « on vient de te
     monter autre chose ». La rotation part vite et retombe (courbe au cube), et le cadre pulse.
     ⚠ le sens de lecture compte : on accélère puis on ralentit, comme un moteur qu'on lance —
     une rotation constante plus rapide ne raconterait rien. */
  if(engSwapT>0){
    engSwapT=Math.max(0,engSwapT-dt);
    const q=engSwapT/T_SWAP, e=q*q*q;
    engVigSpin+=dt*e*18;
    // ⚠ la vignette ne fait pas que grossir : elle ENCAISSE à la pose. Le petit creux au moment
    // du clank (u≈.36) est ce qui donne du poids à la pièce — sans lui, elle « apparaît ».
    const u=1-q, kick=(u>.30&&u<.46)?-Math.sin((u-.30)/.16*Math.PI)*.07:0;
    if(engVigEl)engVigEl.style.transform='scale('+(1+e*.14+kick).toFixed(3)+')';
  }else if(engVigEl&&engVigEl.style.transform)engVigEl.style.transform='';
  engVigSpin+=dt*.6;
  engVigMesh.rotation.y=engVigSpin;
  engVigMesh.rotation.x=Math.sin(engVigSpin*.4)*.09; // un léger roulis : la pièce se donne à voir sous tous les angles
  /* ---- LE MOTEUR VIT (2026-08-03) : il TREMBLE quand ça roule, il CHAUFFE quand ça boost ----
     ⚠ le tremblement n'est PAS un bruit aléatoire. Un moteur BAT à une fréquence, et c'est ce
     battement régulier — plus une petite dérive irrégulière, les ratés — qui le fait lire comme
     une machine plutôt que comme un objet secoué. La fréquence suit le régime, donc la vitesse.
     La CHALEUR, elle, monte et redescend LENTEMENT : c'est de la fonte, pas une ampoule. C'est
     ce lissage qui empêche le boost de clignoter comme un bug. */
  const kmh9=Math.abs(vA)*3.6*SPD, reg9=THREE.MathUtils.clamp(kmh9/Math.max(1,vmaxShow()),0,1.15);
  const hz9=10+reg9*26+(nitroOn?11:0);
  engVigT+=dt;
  const w9=engVigT*hz9*6.2832;
  const bat9=Math.sin(w9), rate9=Math.sin(w9*.37+1.3)*.45+Math.sin(w9*2.13)*.22; // battement + ratés
  const amp9=(.0055+reg9*.010+(nitroOn?.008:0));
  engVigMesh.position.x=rate9*amp9*1.6;
  engVigMesh.position.y=engVigBaseY+(bat9*.55+rate9*.45)*amp9*3.0;
  engVigMesh.rotation.z=(bat9*.6+rate9*.4)*amp9*.75;
  /* la chauffe : pleine à la nitro, sinon LE GAZ d'abord et le régime ensuite.
     ⚠ Avant : `reg9*.34` — uniquement la part de vitesse atteinte. Donc en début de partie, où
     l'on passe son temps pied au plancher SANS aller vite, la cible plafonnait à ~.10 et la
     flamme (seuil .30) ne sortait JAMAIS. On récompensait la vitesse déjà acquise au lieu de
     l'effort en cours. C'est l'appui sur la flèche qui doit s'entendre ET se voir. */
  const cible9=nitroOn?1:(gasOn?.34:0)+reg9*.30;
  engVigHeat+=(cible9-engVigHeat)*Math.min(1,dt*(cible9>engVigHeat?3.2:1.6)); // monte plus vite qu'elle ne retombe
  for(const m9 of engVigMats)m9.emissive.setRGB(engVigHeat*.60,engVigHeat*.12,engVigHeat*.02);
  /* ---- LA FLAMME, UNE PAR MOTEUR (2026-08-05) ----
     Elle palpitait à 47 Hz pour les trente. Or ce qui distingue une flamme, c'est sa CADENCE et
     sa régularité, pas sa couleur : un V8 crache par à-coups (lent et très irrégulier), une
     turbine tient un cône stable (rapide, presque lisse), un pulsoréacteur BÉGAIE. Trois champs
     suffisent — `fHz` la cadence, `fJit` l'irrégularité, `fLen` la longueur — et ils viennent de
     la même table que le son, donc l'œil et l'oreille racontent la même chose. */
  if(engVigFeu){
    const S9=ENG_SND[Math.min(ENG_SND.length-1,engVigTier())]||ENG_SND[0];
    const k9=Math.max(0,engVigHeat-.24)/.76;
    const hz=S9.fHz||40, ji=S9.fJit==null?.3:S9.fJit;
    // la palpitation : une porteuse RÉGULIÈRE (la machine bat) + une dérive irrégulière dosée par
    // `fJit` (les à-coups). À jitter nul on obtient le cône propre d'une turbine.
    const pal9=1+Math.sin(engVigT*hz)*.16*(1-ji*.4)
                +(Math.sin(engVigT*hz*.41+1.7)*.5+Math.sin(engVigT*hz*1.63)*.3)*.34*ji;
    engVigFeu.visible=k9>.02;
    if(engVigFeu.visible){
      const b9=engVigFeuBase;
      engVigFeu.scale.set(b9,b9*k9*pal9*1.35*(S9.fLen||1),b9); // la LONGUEUR palpite, la largeur suit le moteur
      engVigFeu.material.opacity=.72*k9;
    }
  }
  // (vague 2, H6) LA CARTE DE COURSE : le moteur est rendu à 30 i/s dans son petit tampon, et recollé À CHAQUE IMAGE (le framebuffer
  // principal est repeint à chaque image : un quad sauté = un moteur qui clignote)
  if(carte9){if(performance.now()-engEndT>PAL.b('engVigMs',33)){engEndT=performance.now();engVigRendRT(engRTc);}engQuadDraw();return;} // (2026-10-24, passe perf) la carte de COURSE aussi à la cadence du palier (engVigMs : 10 / 15 / 30 rendus par seconde) — le quad recolle l'image d'avant entre deux
  // (perf) téléphone et écran de fin : l'image n'est RECOPIÉE qu'à 30 (20) i/s — la rendre entre deux recopies ne servait à rien
  if((fin||tel)&&performance.now()-engEndT<=(tel?PAL.b('engVigMs',33):50))return;
  if(tel&&ENG_MORT.cv&&ENG_MORT.cv.offsetParent===null){engEndT=performance.now();return;} // (2026-10-14, passe perf mobile) carte cachée (accueil ou atelier ouverts par-dessus la mort) : ni rendu ni relecture — et la question n'est reposée qu'à la cadence de la recopie
  // (1) le moteur dans SON framebuffer — fond transparent pour que le cadre CSS reste visible dessous
  engVigRendRT(engRT);
  /* (2a) ÉCRAN DE FIN : là, le recollage en WebGL NE MARCHE PAS. L'overlay de game over est un
     élément DOM posé PAR-DESSUS le canvas, avec un flou d'arrière-plan : tout ce qu'on dessine
     dans le canvas passe derrière lui et ressort flouté. On rapatrie donc l'image du RenderTarget
     dans un vrai <canvas> DOM, qui vit DANS l'overlay et passe donc au-dessus.
     ⚠ readRenderTargetPixels est une lecture GPU→CPU, coûteuse : on la limite à ~20 images/s, ce
     qui suffit largement pour une rotation lente, et on est de toute façon à l'arrêt. Les lignes
     arrivent de bas en haut, d'où le retournement. */
  if(fin||tel){ // (tel : la carte du téléphone, même recopie — 30 images/s, le temps de la carte seulement)
    const now9=performance.now(),ctx9=tel?ENG_MORT.ctx:engEndCtx; // (vague 2) la carte de course n'a plus de <canvas> : seul l'écran de mort relit
    if(now9-engEndT>(tel?PAL.b('engVigMs',33):50)&&ctx9){
      engEndT=now9;
      const w=engRT.width,h=engRT.height;
      if(!engEndBuf){engEndBuf=new Uint8Array(w*h*4);engEndImg=ctx9.createImageData(w,h);}
      if(!engLit(w,h,ctx9)){renderer.readRenderTargetPixels(engRT,0,0,w,h,engEndBuf);engPose(ctx9,w,h);} // WebGL1 : la lecture directe, comme avant
    }
    return; // pas de quad : l'overlay (ou le fond de la carte) le masquerait
  }
  // (2b) EN COURSE : recollage WebGL, à la place que le CSS a décidée
  const r=cible.getBoundingClientRect();
  if(r.width<8||r.height<8)return;
  const W=VP.w||1,H=VP.h||1; // (perf) VP : voir sa définition
  engVigQuad.position.set((r.left+r.width/2)/W*2-1,-((r.top+r.height/2)/H*2-1),0);
  engVigQuad.scale.set(r.width/W*2,r.height/H*2,1);
  const ac=renderer.autoClear;renderer.autoClear=false;
  renderer.render(engVigQuadScene,engVigQuadCam);
  renderer.autoClear=ac;
}
buildCar(CARS[0]);
try{renderer.initTexture(flouRoueTex);}catch(e){} // (2026-09-26) le flou de jante ne s'allume qu'en course, lancé : sa texture monte au GPU dès maintenant, pas au premier virage
window.dbgEquipe=function(i){if(started&&!gameOver)return 'en course';i=Math.max(0,Math.min(CARS.length-1,i|0));if(!carFicheOk(CARS[i]))return CARS[i].name+' : RETIRÉE (pas de fiche)';SAVE.d.equipped=i;level=i;buildCar(CARS[i]);return CARS[i].name;}; // (2026-09-26) équiper une caisse depuis la console (tests) — (2026-10-20) une retirée sans fiche est refusée (voir carFicheOk) : elle mettait le garage au noir
window.dbgSpec=function(i){const c=CARS[i|0];return c?{name:c.name,w:c.w,l:c.l,h:c.h,shape:c.shape}:null;};window.dbgNbCaisses=function(){return CARS.length;}; // (dev) les fiches, pour les bancs d'essai
 // console : dbgCar(16) → prévisualiser un gabarit sans farmer les milliards (visuel pur, ne touche pas au niveau)
window.dbgScene=function(){return {car:carGroup,scene:scene,contact:contactShadow,shadow:shadow,cam:camera,rdr:renderer};}; // dissection console (visuel pur) — (2026-09-26) + caméra et renderer : le banc des laques mesure la caisse au pixel
window.dbgState=function(){return {started:started,running:running,paused:paused,gameOver:gameOver,mode:mode,psi:+psi.toFixed(4),yawR:+yawR.toFixed(4),slipB:+slipB.toFixed(4),glisse:+glisse9.toFixed(3),drift:driftEnCours,roulisDeg:+(carRoll9*57.3).toFixed(1),glisseDeg:+(driftYaw*57.3).toFixed(1),vH:+(mode==='fall'?Math.hypot(fallVel.x,fallVel.z):Math.abs(vA)).toFixed(1),driftLv:driftLv,graceT:+graceT.toFixed(2),
  /* flux des PIÈCES : sans ces trois-là, régler leur arrivée se fait à l'aveugle */
  engTier:engTier,coinsGot:coinsGot,prochainPalier:(ENGINE_TIERS[engTier+1]||{}).coins||null,
  steer:+steer.toFixed(3),airRoll:+airRoll.toFixed(3),
vA:+vA.toFixed(2),s:+s.toFixed(1),lat:+lat.toFixed(2),side:side,driveDir:driveDir,fallT:+fallT.toFixed(2),level:level,introD:introD,hopY:+hopY.toFixed(2),hOff:+curHOff.toFixed(2),latOff:+curLatOff.toFixed(2),tOff:+curTOff.toFixed(2),auraRun:Math.round(auraRun),chainVal:+chainVal.toFixed(2),fvy:+fallVel.y.toFixed(2),fspd:+fallVel.length().toFixed(1)};}; // état interne (lecture seule) — hOff/dolph* : calibrage du DAUPHIN
// `dbgCam9()` — état de la dynamique de caméra v1 (lean/swing/kick, voir leur déclaration) : pour
// régler au clavier sans deviner ce qui bouge derrière l'écran.
// SIMULATION PAS À PAS : en headless l'onglet est « caché », rAF est suspendu et le jeu ne bouge plus —
// impossible de vérifier une mécanique. Ce pas-à-pas fait avancer la boucle À LA MAIN, sans rAF.
const DBG_AUTO={on:false,lat:0,vol:false,nit:0,saut:0,imp:12,tS:0,l0:null,sg:1}; /* (2026-10-01) vol : il pilote aussi EN VOL (revient sur l'axe) · nit : 1 nitro tenue · 2 en vol seulement · 3 au sol seulement · saut : il décolle toutes les `saut` s de route (élan `imp`) — banc de LA LOI DU RÉSERVOIR */
window.dbgMusique=function(){const e=musicEl;return {mode:musicMode,lieu:musicLieu&&musicLieu.titre,cur:musicCur,ctx:AC?AC.state:null,
  el:e?{src:(e.currentSrc||e.src).split('/').pop(),paused:e.paused,t:+e.currentTime.toFixed(2),ready:e.readyState,err:e.error&&e.error.code,vol:+musicVolCour.toFixed(2),voulue:musicVoulue,attente:musicEnAttente,analyse:!!musicAna,muted:e.muted}:null,son:SND.music,
  menu:typeof MENU_MUS!=='undefined'?{ciel:MENU_MUS.tire.ciel.split('/').pop(),veut:(musicMenuUrl()||'').split('/').pop(),tait:MUS_TAIT}:null};}; // (14/10) menu : la musique du CIEL et du GARAGE tirées, celle que le lieu veut
window.dbgMoteur=function(){const E=ENGINE_TIERS[engTier+1];if(!E)return 'palier max';addCoins(Math.max(1,E.coins-coinsGot));return engTier+' · '+ENGINE_TIERS[engTier].n;}; // console : monter d'UN palier en course (la vraie scène : son, carte 3D, boîte) // console : la grande carte « NOUVEAU MOTEUR »
window.dbgAuto=function(on,l,o){DBG_AUTO.on=!!on;o=o||{};DBG_AUTO.lat=o.latK!=null?o.latK*ROAD_HALF:(+l||0); /* latK : en part de la demi-route (,86 = le rase-bord) */DBG_AUTO.vol=!!o.vol;DBG_AUTO.gl=!!o.gl;/* gl : sur le verglas du glacier, il vise avec la TRAJECTOIRE (psi−BKV.gl), comme un joueur qui lit la glisse */DBG_AUTO.nit=o.nit|0;DBG_AUTO.saut=+o.saut||0;DBG_AUTO.imp=o.imp==null?12:+o.imp;DBG_AUTO.sg=o.sg==null?1:+o.sg;DBG_AUTO.tS=0;DBG_AUTO.l0=null;return DBG_AUTO.on;};
function dbgAutoVol(dt){ /* banc : en vol, le pilote de mesure ramène la caisse sur l'axe de la route (écart latéral du radar de tryLand, et sa dérive) */
  if(!curNear){DBG_AUTO.l0=null;return 0;}
  const dl=DBG_AUTO.l0==null?0:THREE.MathUtils.clamp((curLatOff-DBG_AUTO.l0)/Math.max(dt,1e-3),-60,60);DBG_AUTO.l0=curLatOff;
  return DBG_AUTO.sg*THREE.MathUtils.clamp((-curLatOff*1.2-dl)/Math.max(20,fallVel.length())*4,-1,1);}
// `dbgEco()` : le relevé d'argent d'une partie en cours (pour caler l'économie) · `dbgEco('rejouer')` relance.
window.dbgEco=function(a){if(a==='rejouer'&&gameOver){playViaGarage();}
  return {money:Math.round(money),bank:Math.round(bank()),engTier:engTier,gameOver:gameOver,started:started,mode:mode,
    tricks:runStats.tricks,zones:runStats.zones,gaps:runStats.gaps,vmax:Math.round(runStats.vmax),s:Math.round(s),
    nitroR:+nitroR.toFixed(2),nitroX:+nitroX.toFixed(2),nitroOn:nitroOn,tuto:TUTO.on?TUTO.i:null,mis:SAVE.d.mis,
    eco:ECO3,best:Math.round(best)};}; // les réglages ECO3
window.dbgStep=function(n,ms){
  n=n||60;ms=ms||16;
  for(let k=0;k<n;k++){last=performance.now()-ms;loop(performance.now());}
  return window.dbgState();
};
window.CASHCAR_BUILD='2026-07-20 v5 (anti-flicker + anti-cache)'; // vérif version : taper CASHCAR_BUILD en console
console.log('%c🏎 CASH CAR — build '+CASHCAR_BUILD,'color:#f24aa0;font-weight:bold'); // si ce texte n'apparaît pas au chargement → tu es sur une VIEILLE version en cache (Ctrl+Shift+R)
/* (2026-10-24, allègement mobile) `dbgGros(seuil)` : les objets VISIBLES de la scène qui pèsent le plus (triangles, instances, matière, parent), tous niveaux confondus — le relevé qui manquait hors de Jade */
window.dbgGros=function(seuil){seuil=seuil||15000;const o=[],tot={n:0,m:0};scene.traverse(function(x){if(!(x.isMesh||x.isPoints||x.isLine)||!x.geometry)return;let v=true,p=x;while(p){if(!p.visible){v=false;break;}p=p.parent;}if(!v)return;const g=x.geometry,n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3*(x.isInstancedMesh?x.count:1);tot.n+=n;tot.m++;if(n<seuil)return;o.push([Math.round(n/1000)+'k',x.name||'',x.type+(x.isInstancedMesh?'[I'+x.count+']':''),x.material&&(x.material.type+(x.material.name?':'+x.material.name:'')),x.parent===scene?'scène':(x.parent&&x.parent.name)||'sous',x.frustumCulled?'cull':'-',Object.keys(g.attributes).join('+'),[x.position.x,x.position.y,x.position.z].map(function(q){return Math.round(q);}).join(','),x.material&&x.material.vertexColors?'vc':'',(x.userData&&Object.keys(x.userData).join('+'))||'',x.material&&x.material.color?x.material.color.getHexString():'']);});o.sort(function(a,b){return parseFloat(b[0])-parseFloat(a[0]);});return {total:Math.round(tot.n/1000)+'k',maillages:tot.m,gros:o.slice(0,30)};};
window.dbgPerf=function(){return {ms:+(loop._ms||0).toFixed(1),fps:Math.round(1000/Math.max(1,loop._ms||16)),spikes:+(loop._spk||0).toFixed(1),dpr:+curDPR.toFixed(2),dprCeil:loop._dprCeilT?+loop._dprCeil.toFixed(2):null,cloudIn:+cloudInS.toFixed(2),nuages:CLOUDS.length,tier:QUAL_LOW?'LOW':QUAL_MED?'MED':'FULL',r30:!!loop._r30,jit:+(loop._jit||0).toFixed(1),cad:CAD.on?30:60};};
window.dbgView=function(a,d,h){ // MODE PHOTO : force la pause, cadre la caisse sous l'angle a (rad), distance d, hauteur h, re-rend UNE frame
  if(started&&!gameOver&&!paused)togglePause(); // sans pause, la chase-cam écrase le cadrage à la frame suivante
  const p=carGroup.position;
  camera.position.set(p.x+Math.sin(a)*(d||9),p.y+(h==null?2.4:h),p.z+Math.cos(a)*(d||9));
  camera.lookAt(p.x,p.y+.7,p.z);camera.updateMatrixWorld();
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse); // (2026-09-26, vague 2) le liseré suit la caméra de la PHOTO (il gardait celle de la poursuite)
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
};
window.dbgCiel=function(a,e){ // (dev, 2026-10-15) PHOTO DU CIEL : en pause, l'œil au-dessus de la caisse regarde l'azimut a (rad) à l'élévation e (rad), re-rend UNE frame
  window.dbgView(0,9,2.4);const p=carGroup.position;camera.position.set(p.x,p.y+3,p.z);
  camera.lookAt(p.x+Math.sin(a)*Math.cos(e)*100,p.y+3+Math.sin(e)*100,p.z+Math.cos(a)*Math.cos(e)*100);camera.updateMatrixWorld();
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
};
// ombre portée sous la voiture
const landMark=new THREE.Mesh(new THREE.TorusGeometry(3,.35,8,24),
  new THREE.MeshBasicMaterial({color:0x62e062,transparent:true,opacity:.85,depthTest:false}));
landMark.renderOrder=999; // (2026-09-28, nuit) le VISEUR passe PAR-DESSUS tout : la caméra de vol garde la caisse plus grande (le « bras », voir la caméra de vol) — elle ne doit jamais cacher l'endroit où l'on se pose
landMark.visible=false;scene.add(landMark);
const lmP=new THREE.Vector3(); // (2026-10-20) le pas d'AVANT du viseur : c'est lui qui dit de quel côté de la dalle on arrive (voir le viseur de la boucle de vol)
const LM={a:0,vu:false,c:new THREE.Color()}; // (2026-09-28) le viseur en FONDU : il surgissait à 1,7 s de la pose, clignotait près des bords, sautait d'or à blanc
const shadow=new THREE.Mesh(new THREE.CircleGeometry(2.4,20),
  new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false}));
scene.add(shadow);
// (2026-09-26, vague 2) ÉTEINT POUR DE BON : à opacité 0 depuis le 25/09 (le disque à bord net faisait une tache autour de la caisse),
// il restait DESSINÉ à chaque image — un appel de dessin transparent de 18 m² pour rien, sous la caisse. Vérifié : rien d'autre ne le lit
// (le viseur de vol est `landMark`, le télégraphe d'atterrissage est `contactShadow`) ; la boucle continue de le placer, sans effet.
shadow.visible=false;
