/* ================= LA CAMÉRA DE ROUTE S'ADAPTE (vague 3, 2026-09-27) =================
   Sacha : « quand on est à l'envers de l'autre côté de la route, et que du coup on a l'impression que ça monte beaucoup, il faut que
   la caméra fasse un truc pour s'adapter ». Mesuré (`dbgCamRoute`, portrait 390×844) : la piste PLONGE sans cesse (pente −0,2 à −0,74),
   par paliers — chaque départ de plongée est un SOMMET. Vu du dessus, un sommet dérobe la route (on voit le ciel) ; vu du DESSOUS, le
   même sommet devient un MUR : la route s'y cabre de +13 à +23° à 45-60 m, l'axe de la caméra fait 25 à 34° avec elle, la dalle sombre
   monte en rampe jusqu'au tiers haut de l'écran — et l'horizon, qui dessus flotte AU-DESSUS de la route (+0,31 à l'écran), est dessous
   caché DERRIÈRE elle (−0,16 à −0,36) : tout crie « ça grimpe », pendant que la caisse accélère en descente. (Le monde à l'envers, lui,
   ne se corrige pas : remettre le ciel en haut inverserait la gauche et la droite à l'écran.) Deux gestes de CAMÉRA — conduite,
   physique et aides intouchées :
     · LE CABRAGE ANTICIPÉ — la caméra lit la route ~0,65 s devant et PIVOTE AUTOUR DE LA CAISSE d'une part de son cabrage : devant un
       mur, elle lève le nez et descend un peu sous l'axe (la rampe redevient une route qui file) ; devant un sommet, elle monte et
       pique (la route qui se dérobe reste à l'écran). Pivoter autour de la caisse la laisse PILE à sa place à l'écran ; le retard latéral,
       la penche et le regard qui suit la route restent ceux d'avant. Plus franc DESSOUS, où chaque plongée commence par un mur.
     · LE TONNEAU — passer dessus ↔ dessous (atterrir sous la dalle, repartir en bac à sable après une mort) interpolait le haut de la
       caméra vers son OPPOSÉ : un vecteur mêlé à son contraire ne tourne pas, il RÉTRÉCIT — mesuré, le haut de l'écran restait collé à
       l'ancienne face jusqu'à 0,5 s (la caisse pendue au plafond, la dalle en rampe au-dessus d'elle : LE « ça monte beaucoup »), puis
       basculait d'un coup en passant par zéro, ~1,2 s pour se poser. Désormais la caméra ROULE autour de l'axe du regard en orbitant
       autour de la caisse, d'un seul geste : posée en ~0,2 s.
   Zéro allocation par image. */
const CAM_ROUTE={
  ANTICIPE:.5,           // part du cabrage à venir que la caméra prend d'avance, sur le DESSUS (0 = collée au bitume sous la caisse, 1 = déjà dans la pente)
  ANTICIPE_DESSOUS:.9,   // … sur le DESSOUS, où chaque départ de plongée est un mur
  VOIR_LOIN:.65,         // s — la route à venir est lue à la distance parcourue en ce temps…
  LOIN_MIN:38,LOIN_MAX:90, // m — … bornée (à 1500 km/h, 0,65 s dépasserait la courbe)
  HAUT_MAX:22,           // ° — nez levé au plus…
  GARDE:12,              // ° — … en gardant la caméra au moins à ce site au-dessus du bitume derrière la caisse (paysage : moins de marge)
  BAS_MAX:24,            // ° — nez piqué au plus (sommet, route qui se dérobe)
  LISSE:.2,              // s — lissage du pivot : ni à-coup ni retard sensible
  TONNEAU:7,             // 1/s — vitesse du tonneau dessus ↔ dessous (l'essentiel en ~0,3 s : un geste franc, la traversée de la dalle ne dure qu'un éclair)
  RESSORT:6,             // rad/s — raideur du tonneau (ω0 du ressort amorti : 5 ≈ 1 s pour se poser, 7 ≈ 0,7 s) ; ?tonneau=ancien = la décroissance sèche d'avant
  ANCIEN:/[?&]tonneau=ancien/.test(location.search),om:0,
  phi:0,sg:1,vif:false,enCours:false,ax:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Quaternion(),
  FA:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}
};
function camRouteTonneau(cible,axe,dt){ // LE TONNEAU : `cible` = l'écart caisse→caméra voulu, `axe` = l'axe du regard (unitaire)
  const C=CAM_ROUTE;C.vif=false;if(!C.TONNEAU){C.enCours=false;return;} // (TONNEAU:0 = le comportement d'avant, pour comparer)
  C.v.copy(camUp).addScaledVector(axe,-camUp.dot(axe));C.w.copy(F.n).addScaledVector(axe,-F.n.dot(axe));
  if(C.v.lengthSq()<1e-4||C.w.lengthSq()<1e-4)return;
  C.v.normalize();C.w.normalize();
  let a=Math.atan2(C.ax.crossVectors(C.w,C.v).dot(axe),C.v.dot(C.w)); // de combien la caméra est ROULÉE par rapport à la face (autour du regard)
  if(Math.abs(a)>3.05)a=3.05*C.sg;C.sg=a<0?-1:1; // pile à l'opposé : on garde le sens déjà engagé (sinon il hésiterait d'une image à l'autre)
  const aA=Math.abs(a);
  if(aA>1.05){if(!C.enCours)C.om=0;C.enCours=true;}else if(aA<.09)C.enCours=false; // un tonneau s'engage au-delà de 60° de roulis et va jusqu'au bout (< 5°)
  if(!C.enCours&&aA<.5)return; // la conduite de tous les jours (< 29°) : rien ne change, l'interpolation d'avant s'en charge
  let r=a;
  if(C.enCours){C.vif=true;
    if(C.ANCIEN)r=a*Math.exp(-dt*C.TONNEAU);
    else{ /* LE TONNEAU A UNE INERTIE (2026-10-29, Léo : « l'écran qui tourne quand j'atterris de l'autre côté… il faut travailler la physique ») : l'exponentielle partait à pleine vitesse dès la 1re image (un coup sec) et finissait en 0,3 s. Maintenant un RESSORT CRITIQUEMENT AMORTI (ω0 = RESSORT) sur le roulis restant : la vitesse angulaire monte d'abord, passe par un pic au milieu du demi-tour, puis s'éteint sans rebond — environ 0,8 s, le monde « se pose » au lieu de claquer */
      const k9=C.RESSORT*C.RESSORT;C.om+=(-k9*a-2*C.RESSORT*C.om)*dt;r=a+C.om*dt;
      if(r*a<0){r=0;C.om=0;} /* jamais de dépassement : le monde ne rebondit pas au-delà de l'endroit */ }
    C.q.setFromAxisAngle(axe,r-a);camUp.applyQuaternion(C.q);} // le haut ROULE (il ne passe plus par zéro)
  else C.om=0;
  C.q.setFromAxisAngle(axe,r*(C.enCours?1:THREE.MathUtils.smoothstep(aA,.5,1.05)));cible.applyQuaternion(C.q); // la place voulue roule avec lui : la caméra orbite autour de la caisse au lieu de couper la dalle
}
/* (2026-10-18, Sacha : « oui : redresse la caméra sur le glacier seulement, pour qu'on voie la pente en roulant ») LA CAMÉRA DU GLACIER.
   La caméra de route s'incline avec la piste : à 70 % de pente, la glace remplissait l'écran comme un parking plat. Au glacier (v4, sur la
   piste), le CABRAGE ANTICIPÉ prend en plus une part `k` de la pente sous la caisse : tout le plan pivote autour de la caisse, nez levé vers
   l'horizon — la caisse reste à sa place à l'écran, la piste devant elle PLONGE, les pics se redressent. Le plafond du cabrage (`haut` :
   CAM_GLACIER.max = 30°, et la caméra garde 12° au-dessus de la glace derrière la caisse) borne le geste : ~22-24° debout, ~10° couché.
   ⚠ Ne pas MONTER la caméra pour redresser plus : essayé (banc), la caisse descend et rapetisse à l'écran — le pivot seul la garde à sa place.
   `?glaciercam=0` = la caméra d'avant. Partout ailleurs : zéro. */
const CAM_GLACIER={on:!/[?&]glaciercam=0\b/.test(location.search),k:.9,max:40,garde:12,monte:2,recul:1}; /* (2026-10-19, Sacha : « fais une caméra du glacier qui montre la pente, vue plus haute qui plonge » — choisie sur planche parmi 3 : l'actuelle k ,8/max 30/monte 1, « 1 » ci-contre, « 2 » monte 2,6/recul 1,2/k 1/max 45) la caméra MONTE ×2 avec la pente, et le cabrage redresse jusqu'à ~28° (11° avant) : plus de piste qui part devant et de paysage ; la caisse un peu plus basse et plus petite à l'écran */ // k : part de la pente redressée · max : plafond (°) · garde : site mini (°) de la caméra au-dessus de la glace derrière la caisse (7 essayé : vue rasante, les roues passaient derrière la glace)
function camGlacier(){ // la part de pente (rad, ≥ 0 en descente) que la caméra du glacier redresse
  if(!CAM_GLACIER.on||side<0||!banqOk())return 0;
  const h=Math.hypot(F.t.x,F.t.z);return Math.max(0,Math.atan2(-driveDir*F.t.y,h))*CAM_GLACIER.k;}
function camGlacierM(i){const g9=camGlacier();if(!(g9>0))return 1;const m9=Math.min(1,g9/(.61*CAM_GLACIER.k));return 1+((i?CAM_GLACIER.monte:CAM_GLACIER.recul)-1)*m9;} // (2026-10-19) LA VUE QUI PLONGE : au glacier, la caméra MONTE (×monte) et RECULE (×recul) avec la pente (pleine dose à 35°) — plus haute, le cabrage peut redresser davantage sans passer sous la glace derrière la caisse
function camRouteCabrage(dt,camBack,camH){ // LE CABRAGE ANTICIPÉ : pose C.q, le pivot à appliquer autour de la caisse
  const C=CAM_ROUTE,D=THREE.MathUtils.clamp(Math.abs(vA)*SPD*C.VOIR_LOIN,C.LOIN_MIN,C.LOIN_MAX);
  frameAt(THREE.MathUtils.clamp(s+driveDir*D,0,L-.01),C.FA);
  const th=Math.atan2(driveDir*C.FA.t.dot(F.n),C.FA.t.dot(F.t)), // le cabrage de la route là-bas, dans le plan (tangente, normale de TA face) d'ici — + = elle se lève
        gl9=camGlacier()>0,haut=Math.max(0,Math.min(gl9?CAM_GLACIER.max:C.HAUT_MAX,Math.atan2(camH,camBack)*57.3-(gl9?CAM_GLACIER.garde:C.GARDE)))/57.3, // (2026-10-18) au glacier : le plafond et la garde de CAM_GLACIER
        vise=THREE.MathUtils.clamp(th*(side<0?C.ANTICIPE_DESSOUS:C.ANTICIPE)+camGlacier(),-C.BAS_MAX/57.3,haut);
  C.phi+=(vise-C.phi)*(1-Math.exp(-dt/C.LISSE));
  C.ax.crossVectors(F.t,F.n).multiplyScalar(driveDir).normalize(); // tourner autour de cet axe fait monter l'avant vers la normale
  C.q.setFromAxisAngle(C.ax,C.phi);
}
/* (2026-09-30, caméra) DEUX RÉGLAGES DE LA CAMÉRA DE ROUTE, chacun derrière UNE constante — `on:false` rend la caméra d'avant
   (A/B au banc : `dbgCamRoute({regard:{on:false},taille:{on:false}})`). Mesurés par projection perspective (portrait 390×844, route plate) :
   · CAM_REGARD — le regard qui suit la route (route v2) visait un point FIXE à 35 m : 0,5 s d'avance à 250 km/h, 0,14 s à 900. Au rayon mini
     de la caisse, l'œil partait de 8,8° vers la sortie du virage à 250 km/h… et de 4,7° seulement à 900 — alors qu'en portrait le champ
     horizontal est étroit (52° au repos, 77° en croisière). La distance suit désormais la vitesse d'AVANCE réelle (vitMult compris : NITROOO,
     VITESSE ×2) : `k` s d'avance, bornée [min,max]. ⚠ Le regard est un MÉLANGE DE POSITIONS : à poids égal, un point à 90 m tire l'angle
     1,5× plus fort qu'à 35 m (part d'angle ,54 → ,81 : lacet 20,8° à 720 km/h, la caisse rejetée à mi-chemin du bord de l'écran) et, en ligne droite, relève
     l'assiette de 4° (la caisse glisse vers le bas de l'image, contre tout le cadrage portrait). `comp` garde la même PART D'ANGLE qu'à `min`
     (poids × min/D) : en ligne droite rien ne bouge, dans un virage l'œil part vers la sortie autant à 900 km/h qu'à 150 (12-14° au rayon
     mini). Portrait : poids ×(1+por). La fenêtre où le regard s'efface (point de route trop loin de la visée) grandit avec D (40-100 m à 35 m).
   · CAM_TAILLE — en portrait, la NITRO RAPETISSAIT la caisse, pile quand le feu et le dragon doivent se voir : le champ (fovPor, plafond 150°)
     passait de 120° en croisière à 141° en nitro tenue, 146° en réserve bleue, 141-148° sous NITROOO ; recul et hauteur grandissaient avec
     speedKmh, qui compte ×2,6 sous NITROOO (palier 20 : recul 7,4 m et hauteur 9,5 m, contre 4,7 et 4,4 en croisière). Taille de la
     caisse à l'écran, croisière = 1 (paliers 10 et 20) : 0,44 en nitro tenue, 0,38 en bleu, 0,23 à 0,35 sous NITROOO. En portrait (POR>.5)
     le champ final passe par un GENOU (inchangé sous fovMax−genou, tend vers fovMax au-dessus) et la part VITESSE du recul et de la hauteur
     s'arrête à `recMax` m de recul (≈333 km/h ; la hauteur suit, sinon la caméra grimpe et l'angle plonge — ⚠ ça rapproche aussi la
     croisière des hauts paliers : +15 % de caisse au palier 20). Après : 0,65 à 0,68 de la croisière en nitro, en bleu comme sous NITROOO.
     L'ouverture « ça pousse » reste entière de 94° (repos) à ~120° (croisière), et les COUPS de champ (fovPunch : allumage, pad, drift,
     palier) passent PAR-DESSUS le genou, intacts. `boost` : part du recul de nitro (camBoost) gardée en portrait — c'est lui qui fait
     l'essentiel du 0,65 restant (à ,5 : 0,75) ; 1 = inchangé. */
const CAM_REGARD={on:true,k:.45,min:35,max:90,por:.3,comp:1,D:35,kV:0}; // D, kV : lus par dbgCamRoute (dernière image)
const CAM_TAILLE={on:true,fovMax:125,genou:6,recMax:.6,boost:1};
/* (2026-10-17, LA CAMÉRA SANS SURSAUT) LA REPRISE DE CONDUITE se reconnaît à un trou de plus de CAM_REPRISE ms dans la conduite (garage,
   pause, respawn ; le retour d'un vol, lui, est signalé par startFall). À 150 ms, une image qui tousse (ramasse-miettes, programme compilé
   au 1er nitro — sur iPhone 150 à 300 ms) passait pour une reprise : la visée perdait son pivot (`phi=0`), la caméra se recalait d'1,5 m
   sur le côté et le champ repartait d'ailleurs — un second sursaut juste après le premier. Les vraies absences durent plus d'une seconde. */
const CAM_REPRISE=400;
/* LA CAMÉRA HÉROS (2026-09-30, session SON — Sacha : « la voiture est souvent trop petite pour l'écran, surtout sur mobile : trouve des trucs
   de caméra pour la jouabilité et la sensation de vitesse, surtout sur route »). MESURÉ (banc cam-mesure2.js, `dbgCamRoute().caisse`, image
   normale — ⚠ en rendu logiciel chaque image passait pour une « reprise de conduite » et la caméra reculait de v·dt : `dbgCamReprise`) :
   le coupable n'était pas le recul (5,6-7,6 m) mais le CHAMP, grand ouvert EN PERMANENCE avec la vitesse : 123-131° en portrait,
   107-144° couché (où CAM_TAILLE ne joue pas) — un fish-eye où la caisse ne faisait que 29-44 % de la largeur debout, 3 À 8 % couché ; et la
   NITRO (tenue presque tout le temps) reculait encore la caméra de 1,6 m.
   LES TRUCS :
   · le champ TENU s'ouvre deux fois moins avec la vitesse (+20° au lieu de +38, nitro +8 au lieu de +15/22, FLOW ×½) ;
   · « ÇA POUSSE » se dit par l'ACCÉLÉRATION : chaque prise de vitesse (pad, nitro, relance) ouvre le champ de `kick`°, qui se referme
     doucement quand la vitesse se stabilise — c'est le CHANGEMENT qui se sent, pas le champ grand ouvert ;
   · le VERTIGO (travelling compensé) : quand le champ s'ouvre, la caméra AVANCE d'autant (`dolly`) — la caisse garde sa taille, c'est le
     monde qui s'étire autour d'elle ;
   · la nitro ne recule plus la caméra (`boost` : 20 % du recul d'avant) — le coup de champ de l'allumage reste ;
   · à haute vitesse la caméra DESCEND un peu vers la route (`bas`) : le bitume défile plus fort ;
   · debout, la visée descend (`vise`) : la caisse remonte entre le HUD du haut et les commandes du bas ;
   · un voile de FLOU de vitesse sur les BORDS en croisière rapide (`flou`, le centre reste net).
   A/B : dbgCamRoute({heros:{on:false}}). */
const CAM_HEROS={on:true,ref:86,dMin:.88,dMax:1,kick:16,accK:200,tau:.6,acc:0,v0:-1,boost:.2,bas:.08,vise:1.2,recP:1.1,flou:.2,fovMaxL:112,genouL:8,leve:.09,lk:0,
  /* (2026-09-30, relevé par GRAPHISME au banc du HUD) debout, l'arrière de la caisse descendait à ~750 px : sous le bouton NITRO (744-828) et
     l'anneau du volant (656-748). La visée n'y pouvait presque rien (le regard est tiré vers la route au loin, CAM_REGARD) → on DÉCENTRE
     L'OBJECTIF : toute l'image monte de `leve` (en NDC, ×POR), sans changer ni la taille ni la perspective (l'objectif à bascule du
     photographe). Il s'efface en vol (lissé : pas de saut de 38 px au décollage). Le garage gère SON décentrement (setViewOffset) : ici on
     ajoute au terme de la matrice juste après updateProjectionMatrix, une fois par image. */
  leveApplique:function(dt,cible){this.lk+=((this.on?cible:0)-this.lk)*Math.min(1,dt*3);const d=this.leve*POR*this.lk;if(Math.abs(d)<1e-4)return;
    camera.projectionMatrix.elements[9]-=d;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();},
  dolly:function(f){if(!(f>0))return 1;const r=Math.tan(fovPor(this.ref)*Math.PI/360)/Math.tan(Math.min(170,f)*Math.PI/360);return THREE.MathUtils.clamp(r,this.dMin,this.dMax);}};
function camTailleOn(){return CAM_TAILLE.on&&POR>.5;}
function camTailleFov(f){const T=CAM_TAILLE,K=T.fovMax-T.genou;return f<=K?f:K+T.genou*(1-Math.exp(-(f-K)/T.genou));} // le genou : pente 1 à K, tend vers fovMax
const ASSIST_VIRAGE=0; // (conduite v6) ZÉRO : la caisse ne suit plus la route toute seule — c'était l'« aimant » (elle prenait 78 % de chaque virage, 99,5 % avec le cap visé)
const TURN_HS=.0035; // pénalité de braquage à haute vitesse (avant .008 — plus petit = virages plus faciles)
const CAP_V0=20,CAP_V1=.08;  // vitesse LATÉRALE plein pouce (m/s monde) = 20 + 8 % de l'avance : 23 m/s à 145 km/h, 33 m/s à 590
const CAP_YAW=1.6,CAP_RET=2; // plafond de lacet (× le gain historique, TURN_HS compris) ; ×2 quand le cap REVIENT : lâcher = filer droit tout de suite
/* (conduite v6, 2026-09-25 soir) LE POUCE FAIT TOURNER LA CAISSE. User : « il y a un centrage automatique : quand je ne touche à
   rien, je reste quand même sur la route ». MESURÉ (banc v6/conduite/diag) : pouce lâché, la caisse prenait 99,5 % de chaque virage
   (78 % par ASSIST_VIRAGE, 21,5 % par le cap visé qui se réalignait sur la ROUTE) — elle ne tombait dans aucun virage testé. Le cap
   visé était relatif à la route : lâcher = se remettre dans l'axe = l'aimant. DÉSORMAIS le pouce commande une VITESSE DE LACET
   (comme un volant) : pouce lâché, la caisse garde son cap dans le MONDE et file tout droit — dans un virage, elle sort si on ne
   tourne pas. `lacetMax(v)` = lacet plein pouce = v / rayon mini, le rayon mini grandit avec la vitesse (61 m à 250 km/h, 100 m à
   720) ; VOL_TAU = l'inertie de la caisse (elle met 0,1 s à prendre son lacet : elle PÈSE). Banc (pilote réaction 150 ms, route ÷2,
   virages mis à l'échelle par `lvPiste`) : 0 sortie/km jusqu'au palier 10 sans nitro, pouce moyen 20-26 %, et pouce lâché dans un
   R 150 → dehors en 1,2 s. La glisse n'existe plus qu'en DRIFT VOLONTAIRE (pouce tiré vers le bas / ↓) : le nez tourne plus que la
   trajectoire (`slipB`, jusqu'à ~20°) — une vraie glisse, qui se voit ET se conduit. */
const VOL_R0=40,VOL_RK=.3,VOL_TAU=.1;
function lacetMax(v){const vw=Math.max(8,Math.abs(v)*SPD);return vw/(VOL_R0+VOL_RK*vw);} // rad/s au plein pouce — ×spdMult dans la boucle (HAUTE VITESSE, 2026-09-30)
/* (2026-10-14, GAMEPLAY — LECTURE SEULE, la règle commune des maps : passation/RACCOURCIS.md) « Plus la vitesse du palier est élevée, plus les virages
   doivent être larges. » `vPalier(t)` : la vitesse de croisière MONDE (m/s) du palier moteur t (par défaut le palier courant) — le même calcul que
   `lvPiste` (palier +2, overdrive, poussée). `rayonPalier(t)` : le rayon mini qu'on TIENT volant à fond à cette vitesse (lacetMax : r = R0 + RK·v).
   Un virage d'axe plus serré que `rayonPalier` ne passe PAS à la vitesse du palier ; entre 1 et 1,5 × rayonPalier, c'est un virage SERRÉ (volant à
   fond) ; au-delà, il passe au pouce. Rien ne les appelle dans le jeu : ce sont les mesures du banc (cc-banc/raccourcis.cjs) et des générateurs de pistes. */
function vPalier(t){const u=Math.min(ENGINE_TIERS.length-1,((t==null?engTier:t)|0)+2);return 2.75*CARS[0].maxKmh/3.6*engLate(u)*ENGINE_TIERS[u].push*SPD;}
function rayonPalier(t){return VOL_R0+VOL_RK*vPalier(t);}
/* LE BALAYAGE (2026-09-30, HAUTE VITESSE). Plots, pads, dos d'âne et flaques se testaient en UN POINT (`|s−objet| < w`) : la caisse avance
   de km/h ÷ 3,6 ÷ images/s par image — à 30 i/s (iPhone bridé) un plot (w 2,6) devenait fantôme au-delà de ~560 km/h, un dos d'âne (w 2,2)
   de ~475, une flaque (w 4-5) de ~860 ; à 60 i/s, le double. On teste désormais le TRAJET de l'image, comme la catapulte : l'écart latéral
   le plus serré pendant que la caisse RECOUVRE l'objet (|s−so| ≤ w), `lat` interpolé le long du trajet (sA→sB, lA→lB). Infinity = pas de
   recouvrement. Au pas, le trajet est un point : c'est l'ancien test (il en est un sur-ensemble). */
function balEcart(so,w,sA,sB,lA,lB,lo){
  const a=Math.max(Math.min(sA,sB),so-w),b=Math.min(Math.max(sA,sB),so+w);
  if(a>b)return Infinity;
  const d=sB-sA;if(Math.abs(d)<1e-6)return Math.abs(lB-lo);
  const ea=lA+(lB-lA)*(a-sA)/d-lo,eb=lA+(lB-lA)*(b-sA)/d-lo;
  return ea*eb<=0?0:Math.min(Math.abs(ea),Math.abs(eb));
}
let yawR=0,slipB=0,glisse9=0,routeLacet=0; // lacet courant · angle de glisse (drift) · glisse ressentie (fumée, crissement)
const AIR_ASSIST=0; // (conduite v6) règle n°1 : aucun recentrage, en vol non plus — était .2 ; // aide au recentrage en vol (0 = off), monte avec la vitesse — ÷5 (2026-09-25, user : « un effet qui t'attire vers le centre de la route, trop puissant, baisse-le au point qu'il ne soit plus remarquable ») : à 1,0 un ressort de 0,7·écart m/s² ramenait la caisse sur l'axe en plein vol ; il reste un filet qu'on ne sent plus
const CAM_SHAKE_V=.45; // intensité du tremblement caméra lié à la vitesse (position + roulis) — .78→.45 : un frémissement, plus un séisme (user : « c'est trop »)
// OVERDRIVE : il suivait le NIVEAU DE CAISSE (+8 %/niveau à partir du 6e). Depuis que la caisse est
// équipée au choix, ça revenait à vendre de la vitesse au garage. Il suit désormais le PALIER MOTEUR,
// calé pour que le sommet donne exactement le même +50 % qu'avant (palier 22 sur 30 et au-delà).
function lateMul(){return engLate(engTier);}
function engLate(t){return 1+Math.min(.5,Math.max(0,t-8)*.035);} // (2026-09-30) l'overdrive d'UN palier donné : lateMul (le palier courant), lvPiste (+2) et engGain (les deux paliers comparés) le lisent ici
/* (piste v6) L'ÉCHELLE DES VIRAGES suit la VITESSE : croisière (momentum compris ≈ 2,75 × maxSp) du palier moteur +2 (on monte
   pendant la zone). 70 m/s (253 km/h) → 1 ; 132 m/s → 1,6 ; 290 m/s → 3,2 ; plafond 4,4. Sans aide au virage (conduite v6), un
   rayon fixe devenait infaisable à 1000 km/h sur une route de 24 m : les virages grandissent, leur NOMBRE par minute reste. */
function lvPiste(){const t=Math.min(ENGINE_TIERS.length-1,(engTier|0)+2),late=engLate(t),
  vw=2.75*CARS[0].maxKmh/3.6*late*ENGINE_TIERS[t].push*SPD;return 1+THREE.MathUtils.clamp((vw-70)/140*1.4,0,3.4);}
// vitesse max AFFICHÉE — la sensation de vitesse (tremblement, filés, FOV) se juge RELATIVE à elle.
// ⚠ elle doit décrire la vitesse RÉELLEMENT atteignable : lire CARS[level].maxKmh (la fiche de la
// carrosserie, jusqu'à 1900) alors que la caisse plafonne en vrai à CARS[0]×moteur donnait un ratio
// minuscule — plus aucun frisson, plus de speed lines, quelle que soit l'allure.
function vmaxShow(){return CARS[0].maxKmh*SPD*lateMul()*(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push;}
// LA CROISIÈRE RÉELLE (2026-09-25, audit mesuré) : gaz auto, la traînée équilibre la poussée à ≈1,55× vmaxShow. Les effets de VITESSE
// (tremblement, filés, champ) se jugent sur ELLE : calés sur vmaxShow, ils saturaient 3-4 s après le départ et restaient plats toute la
// partie — le momentum, un pad, le FLOW, le mini-turbo ne changeaient plus RIEN à l'écran. (vmaxShow reste la référence de l'économie.)
function vCroisiere(){return vmaxShow()*1.55;}
let mode='drive',s=0,lat=0,psi=0,vA=0,vL=0,side=1,driveDir=1; // driveDir : sens de conduite le long du ruban (+1/-1). TOUJOURS 1 en course ; dans le PARC il suit le sens d'atterrissage → les routes se roulent dans les DEUX sens (pas de sens imposé)
const START_CASH=1.61; // la mise de depart, clin d'oeil au studio 1.61
let steer=0,pitchS=0,money=START_CASH,levelCash=0,boost=0,fallT=0,fallTR=0,padCd=0,shake=0,combo=0,comboT=0,graceT=0,safeS=0,yawAcc=0,edgeT=0,squashT=0,momT=0,styleM=0,fever=0,streak=0,slowT=0,steerHold=0,aheadV=0,sideCd=0,slipT=0,oilCd=0,hitT=0,insUsed=false,feverArmed=false,lastSpaceT=0,rollover=0,idleT=0,driftT=0,driftYaw=0;
/* LE FREIN ÉTALÉ (2026-10-17, session « Physique et gameplay fluides » — Sacha : « améliore une dernière fois la physique et le gameplay,
   fluidifie la conduite, la voltige et tout », « la dernière amélioration avant de figer le gameplay »). Une vitesse PERDUE d'un coup
   (la pose, le choc contre une paroi, la foudre, un débris, un accrochage) tombait en UNE image : jusqu'à −45 % entre deux images, la
   caisse « freinait au mur » et la caméra sursautait. La même perte, au même total, passe désormais en ~0,2 s : FREIN_L est le
   LOGARITHME de ce qui reste à perdre (≤ 0), vidé en exponentielle (FREIN_TAU) par la conduite — deux chocs se COMPOSENT comme avant
   (×0,7 puis ×0,6 = ×0,42). Hors conduite (en vol, vA ne sert pas) la perte reste immédiate ; au décollage le reste est payé d'un coup
   (startFall). `?frein=0` = l'ancien coup sec, pour comparer. */
const FREIN_TAU=/[?&]frein=0\b/.test(location.search)?0:.08;let FREIN_L=0;
function vFrein(k){k=Math.max(.01,Math.min(1,k));if(mode!=='drive'||!FREIN_TAU)vA*=k;else FREIN_L+=Math.log(k);}
/* ⚠ LE VOL EN VRILLE EST UN PARTI PRIS, PAS UN OUBLI (tranché par le user, 2026-08-05).
   J'ai tenté deux fois de « corriger » la rotation de la caisse en vol — d'abord en la remplaçant
   par une inclinaison de virage pilotant le lacet (trop de latence au braquage), puis en gardant
   l'inclinaison en pur décor. Le user a essayé et tranché les deux fois POUR LA VRILLE.
   Les variables `airBank` / `airRollT` / `AIR_BANK_*` ont donc été RETIRÉES : les laisser en place
   aurait fait croire à un réglage disponible alors que plus rien ne les lit. */
let airRoll=0; // vrille visuelle en vol
/* LA PHYSIQUE DU BORD v2 — portée de la branche de Léo (cb3e82c, 2026-09-26, Léo : « quand on s'approche du bord la voiture déclique vers le
   ciel, fais plus réaliste ») sur main le 2026-09-30 (Sacha : « quand on roule au bord de la route on est comme TÉLÉPORTÉ à côté — c'est un
   petit CLIC bizarre, Léo l'avait corrigé »). Mesuré sur main avant (banc bord5.js, sortie douce) : au passage du bord la caisse SAUTAIT de
   0,79 NDC à l'écran en UNE image (×52 son mouvement normal — du bord droit de l'image au centre : la caméra de vol la visait d'un coup),
   restait figée une image puis rattrapait 2,7 m, montait de 60 cm, et recevait un coup de saut de +3,4. Désormais c'est une vraie BASCULE :
   roues dehors → la caisse penche vers le vide ; centre de gravité dehors → elle bascule sans décoller, du côté du vide, de plus en plus
   vite ; si l'on braque à temps, le pneu raccroche la LÈVRE au lieu d'aller cogner la tranche ; et la caméra glisse au lieu de sauter.
   `bascOn` = ce vol vient d'une sortie par le bord, `bascDir` = sens de la vrille (+1 = celui de toujours), `levreY` = la marche que la
   caisse remonte en raccrochant (décroît). */
/* LE BORD DE LA ROUTE TORDUE (2026-10-15 soir, Sacha : « fais revenir le BUMP sur la route tordue des nuages, sans toucher au reste »).
   Sur la route SANS HAUT NI BAS (TORD) la dalle est couchée, sur la tranche, à l'envers — et la caisse sortie par le bord tombait selon le
   bas du MONDE : elle ne s'enfonçait jamais sous le niveau de SA dalle, donc ne pouvait plus en cogner la tranche (MESURÉ, même graine :
   0 BUMP sur 20 sorties, contre 3 sur la même piste remise droite). Ici, le temps de la BASCULE (1,1 s au plus) et après
   chaque BUMP, la gravité est celle de la ROUTE quittée (−Nn × face de départ) : la caisse s'enfonce sous la dalle comme sur une route
   droite, la lèvre raccroche, la tranche cogne, et le BUMP renvoie vers le ciel de LA ROUTE (pas vers celui du monde). Au-delà (ou à plus de
   20 m du bord), le vol reprend la gravité du monde. Route droite (TORD éteint) : rien ne change. `TBORD.t` = le temps qu'il reste. */
const TBORD={t:0,on:false,u:new THREE.Vector3()};
/* LE VOL QUI SUIT LA ROUTE (2026-10-18, Sacha : « dans la map nuage la route fait des rotations et tout, mais la voiture a du mal à voler,
   comme si le jeu n'arrivait pas à savoir de quel côté de la route on va »). Sur la route SANS HAUT NI BAS, le vol gardait le bas du MONDE :
   un saut depuis une dalle couchée partait à côté d'elle, depuis une dalle à l'envers il tombait loin d'elle, et l'ÉQUILIBRE redressait la
   caisse et l'écran vers un ciel qui n'existe plus sur cette map. MESURÉ (banc volcote.cjs, saut de 21 m/s à 162 km/h, sans toucher aux
   commandes, mêmes points de la piste avant/après) : posés sur leur route 6/6 sur dalle à plat, 3/5 penchée, 1/6 sur la tranche, 0/6 à
   l'envers — les autres, perdus dans le vide jusqu'au couperet des 6 s ; l'écran tournait de 73 à 88° pendant un saut depuis une dalle sur
   la tranche ou à l'envers. APRÈS : 23/23 posés sur leur route, même face, à ~15 m ; l'écran tourne de 6 à 14°.
   Ici, le HAUT DU VOL (`VOLR.u`) est le ciel de LA ROUTE SURVOLÉE : la normale de la dalle la plus proche (le radar de tryLand), sur la face
   qu'on a quittée — et quand le radar passe à un autre tronçon, la face la plus proche du haut d'avant (jamais de bascule de plus de 90°),
   lissée en ~0,08 s. La gravité, le plané du nitro, l'équilibre de la caisse et de l'écran, le viseur de pose, le plafond de vitesse « à
   plat », le BUMP, le compteur et les prédictions des figures le suivent : on retombe sur la route qu'on survole, quelle que soit sa pose
   dans l'espace — comme sur une route droite. Les autres maps : le haut du monde, au chiffre près (`VOLR.on` faux). Sortie par le bord :
   on tombe sous SA dalle et on s'y perd, comme ailleurs (la gravité de la route ne s'arrête plus au bout d'1,1 s — voir TBORD).
   `?sans=volroute` rend le vol d'avant. */
/* LA VRILLE PORTE LE VOL (2026-10-19, Sacha : « il y a toujours des problèmes dans la map nuage : quand on vole près de la route, ça dévie la
   trajectoire »). LA CAUSE, MESURÉE (simulateur de la branche 'fall' sur deux pistes des nuages vidées du jeu, mêmes formules) : le haut du vol
   suit la dalle survolée en ~0,08 s ; quand la route VRILLE sous la caisse (jusqu'à 64°/s), la gravité tourne avec elle, mais l'élan, le repère
   de la caisse (FLY_U, autour duquel tourne le volant) et le haut de l'écran restent dans l'ancien (l'équilibre les rattrape à 2,6/s, la caméra
   à 3/s) : la gravité tire DE CÔTÉ à l'écran. Sans toucher aux commandes, sur un vol de 1,5 s au nitro, la poussée de côté cumulée valait
   11-15 m/s en médiane et jusqu'à 92 m/s (0,3 sur un saut court) ; et un pilote qui vise la route ne se posait que 34 fois sur 48.
   Désormais la part de la rotation du haut du vol qui est la VRILLE de la route (son roulis autour de son axe T) emporte aussi l'élan, le repère
   du vol, la caisse et le haut de l'écran : la route tourne, le vol tourne avec elle, comme quand on roule. Le reste (la route qui plonge ou se
   cabre sous la caisse) ne touche que la gravité, comme avant : on décolle toujours des crêtes, et aucune force ne ramène vers la route.
   MESURÉ (même simulateur, 88 départs) : poussée de côté méd 1,0-1,4 m/s, max 10-13 ; sauts courts inchangés (tous posés) ; vols nitro sans
   les mains 22/48 et 18/40 posés (21 et 18 avant) ; un pilote qui vise la route 48/48 et 40/40 (34 et 34), gros vols 37/48 et 36/40 (23 et 24).
   `?sans=volroulis` = avant ; `dbgVolRoulis(false|true)` le bascule en direct pour les vols suivants. */
let VOLR_ROULIS=!/[?&]sans=([^&]*,)?volroulis(,|&|$)/.test(location.search);
window.dbgVolRoulis=function(v){if(v!=null)VOLR_ROULIS=!!v;return VOLR_ROULIS;};
/* ===== LE VOL SANS HAUT NI BAS (2026-10-20, Sacha : « il y a toujours des problèmes dans la map nuage : on est aimanté à la route, le jeu a du mal à
   gérer le haut et le bas — il ne faut plus de haut ni de bas, juste la voiture, elle peut voler naturellement, librement ; quand tu voles près de la
   route tu es attiré et ta trajectoire est déviée par le haut et le bas ») =====
   `VOLR` faisait encore tourner le haut du vol avec la dalle la plus proche, image après image : près de la route, la gravité tirait toujours vers
   « sa » dalle, et chaque vrille, chaque plongeon de la route sous la caisse tordait la trajectoire (l'aimant, même quand l'écran ne roulait plus).
   Désormais le haut du vol est celui du DÉCOLLAGE et il ne bouge plus : la face de la route qu'on quitte (`startFall`, `VOLR.u = F.n`). Un vol est une
   parabole nette dans le repère de la caisse au départ — gravité, plané du nitro, équilibre de la caisse et de l'écran, viseur et prédictions des figures
   suivent ce même haut, donc rien ne dévie, rien n'attire (aucune aide : la route qui s'est tordue entre-temps peut aussi être manquée).
   `?sans=volfige` = le haut qui suit la dalle (v689) ; `dbgVolFige(false|true)` le bascule en direct pour les vols suivants. */
let VOLR_FIGE=!/[?&]sans=([^&]*,)?volfige(,|&|$)/.test(location.search);
window.dbgVolFige=function(v){if(v!=null)VOLR_FIGE=!!v;return VOLR_FIGE;};
let VOLR_ON=!/[?&]sans=([^&]*,)?volroute(,|&|$)/.test(location.search);
window.dbgVolRoute=function(v){if(v!=null)VOLR_ON=!!v;return {on:VOLR_ON,vol:VOLR.on,u:VOLR.u.toArray().map(function(x){return +x.toFixed(3);})};}; // (banc) dbgVolRoute(false) = le vol d'avant pour les vols suivants
const VOLR={on:false,k:12,u:new THREE.Vector3(0,1,0),c:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3(),q:new THREE.Quaternion()}; // k : la vitesse du lissage (1/s) · u : le haut du vol · c, a, b, q : calcul
function volrOn(){return VOLR_ON&&TORD.on&&!PARK.on;}
function volVu(v){return VOLR.on?v.dot(VOLR.u):v.y;} // la part de v vers le haut du vol
function volMonte(v,d){if(VOLR.on)v.addScaledVector(VOLR.u,d);else v.y+=d;} // + d vers le haut du vol
function volPlafU(v,m){if(!VOLR.on){if(v.y>m)v.y=m;return;}const k=v.dot(VOLR.u);if(k>m)v.addScaledVector(VOLR.u,m-k);} // la montée bornée à m
function volH(v){if(!VOLR.on)return Math.hypot(v.x,v.z);const k=v.dot(VOLR.u);return Math.sqrt(Math.max(0,v.lengthSq()-k*k));} // la vitesse « à plat »
function volHK(v,f){if(!VOLR.on){v.x*=f;v.z*=f;return;}const k=v.dot(VOLR.u);v.addScaledVector(VOLR.u,-k).multiplyScalar(f).addScaledVector(VOLR.u,k);} // la part « à plat » × f
function volrSuit(dt){if(!VOLR.on)return;if(!TORD.on){VOLR.on=false;VOLR.u.set(0,1,0);return;} // chaque image de vol : le haut suit la dalle survolée (une route qui change en plein vol rend le haut du monde)
  if(VOLR_FIGE)return; // (LE VOL SANS HAUT NI BAS) le haut du vol reste celui du décollage : la route qui tourne dessous ne le touche plus
  const i=tryLand._bi;if(!(i>=0)||!Nn[i])return;
  const t=T[i],a=VOLR.a.copy(VOLR.u);if(t)a.addScaledVector(t,-a.dot(t)); // (LA VRILLE PORTE LE VOL) le haut d'avant, vu le long de l'axe de la route
  VOLR.c.copy(Nn[i]);if(VOLR.c.dot(VOLR.u)<0)VOLR.c.negate();VOLR.u.lerp(VOLR.c,1-Math.exp(-dt*VOLR.k)).normalize();
  if(!VOLR_ROULIS||!t)return;
  const b=VOLR.b.copy(VOLR.u).addScaledVector(t,-VOLR.u.dot(t));if(a.lengthSq()<1e-6||b.lengthSq()<1e-6)return;
  const r=Math.atan2(VOLR.c.crossVectors(a,b).dot(t),a.dot(b));if(Math.abs(r)<1e-7)return; // le roulis de la route sous la caisse, cette image
  fallVel.applyAxisAngle(t,r);FLY_U.applyAxisAngle(t,r);FLY_R.applyAxisAngle(t,r);camUp.applyAxisAngle(t,r);VEQ.qb.premultiply(VOLR.q.setFromAxisAngle(t,r));}
let bascOn=false,bascDir=1,levreY=0,bascT=0; /* bascT (1/10, soir) : le temps VÉCU depuis la sortie par le bord — `fallT` est rendu par les bumps, il réarmait la bascule en plein vol */
const BUMP_VY=16; /* (2026-10-01) la vitesse verticale rendue par un BUMP (voir tryLand) */
const BUMP_VAL=5; /* (2026-10-15 soir, Sacha) ce que le 1er BUMP d'un vol verse à la chaîne, comme une figure (le RICOCHET sur l'eau : 5) — puis ×0,6 par rebond */
const LEVRE_POSE=.45; /* (2026-10-01) la marche qu'un pneu monte à TOUTE pose au bord (voir levre9 dans tryLand) */
const LEVRE_H=2; /* (1/10, soir : 1,2 → 2 m, pendant 1 s — la marge que donnait, par accident, la portée réarmée après un bump) */ // sous la surface, jusqu'où le pneu peut encore raccrocher la lèvre (plus bas : c'est la tranche qui cogne → BUMP)
/* (2026-10-01, Sacha, le lendemain : « maintenant quand on s'expulse de la route à grande vitesse on MEURT sans raison, sans qu'on ait la
   chance de se RATTRAPER ») — la v2 avait retiré le bond de sortie (+0,6 m et +3,4 vers le haut) : c'était le « clic », mais c'était AUSSI
   le sursis. Mesuré : avant, la caisse restait au-dessus de −1,2 m (la fenêtre de pose) ~0,59 s ; en v2, 0,39 s — et la lèvre ne
   raccrochait qu'à −0,7 m pendant 0,6 s : à grande vitesse, le temps de braquer, on était déjà sous la dalle. Le sursis revient SANS le
   bond : la caisse PIVOTE sur ses roues intérieures avant de tomber — la gravité monte de 0 à 100 % en BASC_T (0,45 s), la réserve de
   nitro plane au même prorata (jamais de remontée), et la lèvre raccroche jusqu'à LEVRE_H 1,2 m pendant 0,8 s. */
const BASC_T=.45;
/* VOL LIBRE (2026-09-26) — le REPÈRE DU VOL : FLY_U = le « haut » de la caisse en l'air, FLY_R = sa droite. Plus aucune référence au
   ciel : au décollage FLY_U part de la normale de la route (dessus comme dessous), puis il est TRANSPORTÉ avec la trajectoire
   (on lui retire sa part le long de la vitesse, image après image). Le volant tourne autour de FLY_U, le manche autour de FLY_R,
   la caméra prend FLY_U pour « haut » — la caisse va là où on la guide, et l'écran la suit sans jamais se remettre à l'endroit. */
const FLY_U=new THREE.Vector3(0,1,0),FLY_R=new THREE.Vector3(1,0,0);
