/* L'ENTRÉE DANS LA VILLE (2026-09-29, Sacha : « quand on arrive dans la ville, la route doit commencer par être droite et surélevée le
   temps que le joueur s'adapte, puis la route descend dans la ville »). AVANT : le départ commun à tous les niveaux — 110 m qui plongent
   de 70 (adoucis à ~23°) — jetait la caisse dans le canyon dès la sortie du portail, murs au-dessus de la route, nitro déjà sur les
   doigts. DÉSORMAIS, au niveau VILLE (tracé généré, pas les pistes dessinées de la campagne) : une LIGNE DROITE quasi plate de
   `droite`×LV m (~6 s à la croisière : le temps de lire « NIVEAU 2 », de voir la ville et de prendre la route en main), SURÉLEVÉE —
   `buildVoxCity` plafonne les toits qui la bordent SOUS la route, de 22 à 142 m (on roule au-dessus de la ville, on la voit défiler) —, puis une GRANDE RAMPE
   droite de `rampe`×LV m qui plonge de `chute`×LV (adoucie par VILLE_PENTE à ~19° : ~180 m de chute) : les tours remontent autour de
   la route à mesure qu'elle descend, et le canyon se referme au pied de la rampe. Aucun tirage `rnd` de plus (NUAGES et ORBITE
   identiques au tirage près) ; `VILLE_ENTREE` garde les deux points de contrôle (fin de la droite, pied de la rampe) pour la ville. */
const VILLE_ENTREE_R={droite:420,rampe:520,chute:220,toit:22,etage:120}; // toit/etage : sous la droite, les toits de 22 à 142 m sous la route
let VILLE_ENTREE=null;
function adoucirPentes(P,o,prot){ /* prot : (ROUTE LIBRE) les points d'une figure dessinée (looping, puits…) gardent leur pente telle qu'elle est */
  const y0=P.map(function(p){return p.y;});
  for(let i=1;i<P.length;i++){const h=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z),dy=y0[i]-y0[i-1],g=h>.5?Math.abs(dy)/h:0;
    P[i].y=P[i-1].y+(g>o.seuil&&!(prot&&prot[i])?Math.sign(dy)*(o.seuil+(g-o.seuil)*o.garde)*h:dy);}
}
const CAMPM=[]; // (2026-10-18) les repères de la piste de campagne (genCampagne, retirée avec la carrière) : toujours vide — les générateurs le vident encore, le pré-bâti l'échange (PREB_TAB)
/* <<<MODCARTES>>> LES MODULES DE CHAQUE MAP (2026-10-18, Sacha : « dans les générations de map il n'y a pas beaucoup de modules ; rajoute des
   modules adaptés au gameplay de chaque map, au moins 3 par map, sélectionnés automatiquement — pour l'instant il y a trop de tout droit et trop
   peu de modules »). Chaque générateur a désormais SON paquet de modules (au moins trois, tirés au hasard dans un paquet mélangé, jamais deux fois
   de suite) — ici ceux des maps que bâtit genCtrl (VILLE et MINUIT, CRYPTO CITY, VILLE VITRÉE, EN ORBITE ; les NUAGES ont les leurs depuis le
   matin : tSlalom…) ; les maps à générateur propre ont les leurs dans genForet, genCanyon, genBanq, genJade. Voir « LES MODULES DE
   CHAQUE MAP » au JOURNAL. `?sans=modcartes` rend les pistes d'avant (même graine, même route qu'avant). */
let MODC_ON=!/[?&]sans=([^&]*,)?modcartes(,|&|$)/.test(location.search);
window.dbgModCartes=function(v){if(v!=null)MODC_ON=!!v;return MODC_ON;}; // banc : dbgModCartes(0) = les pistes d'avant, sans recharger (la piste suivante)
/* ===== LES VILLES AU HASARD — LE TRACÉ (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
   MESURÉ AVANT (16 graines, palier 0, banc traces.cjs) : écart de forme VILLE 0,197 · CRYPTO 0,243 · VITRÉE 0,291 · ORBITE 0,243 — et, à rotation près
   (deux pistes superposées au mieux), VILLE 0,137 · CRYPTO 0,161 : toutes partaient plein nord, et chaque paquet n'avait que 4 ou 5 modules.
   · VILLE_MODULES : des modules de plus dans le paquet de chaque map de genCtrl (voir mCarrefourS…) — ≥ 6 sortes par map ; `?sans=villemodules` = les
     paquets d'avant, au tirage près.
   · VILLE_HASARD : un flux à part (`rh`, né de la graine du hasard des modules : aucun tirage `rnd` ni `rf` de plus) tire l'AXE de la piste (le cap du
     départ, sur tout le cercle — la ville, ses tours, ses décors sont bâtis autour de la route où qu'elle aille) et la CADENCE des modules (×0,75-1,35) ;
     `?sans=villehasard` = la recette d'avant au tirage près. Les NUAGES (et leur route tordue) ne lisent ni l'un ni l'autre : leur route ne bouge pas d'un point. */
const VILLE_MODULES=!/[?&]sans=([^&]*,)?villemodules(,|&|$)/.test(location.search);
const VILLE_HASARD=!/[?&]sans=([^&]*,)?villehasard(,|&|$)/.test(location.search);
/* ===== LA DESCENTE DES VILLES (2026-11-11 nuit, Sacha : « ça ne descend pas assez, il manque 50 % du gameplay : s'envoler pour prendre des raccourcis ») =====
   MESURÉ dans le vrai jeu (outils/banc-routes/raccourcis-page.js) : la ville descendait de 9 %, Crypto City de 8 %, et AUCUN saut n'y survivait — le seul que la géométrie promettait
   (du rond-point) finissait dans une tour. Désormais, dans la ville et à Crypto City :
   · la route descend plus (les virages de la phrase à 18-30 % au lieu de 7-17 %, les souffles à 16 % au lieu de 5 %) ;
   · DEUX TEMPS FORTS SUR TROIS (le premier, le deuxième, pas le troisième…) sont un module à raccourci, s'il tient avant l'arrivée : LE SAUT et LE GRAND SAUT, à tour de rôle — un virage serré
     qu'on ne prend pas : la route d'en bas est DANS L'AXE, 32-44 m (2 s de vol) ou 66-90 m plus bas (3 s de vol entre les tours), on saute toute la bretelle (~1 km gagné) ; le 1er vient sans montée,
     un autre suit le climax s'il tient ; à haut palier (la route ne dure que ~25 s), six fois sur dix il prend la place du climax ;
   · les tours sont RABATTUES sous la trajectoire (FILETMARK.air, lu par buildVoxCity) : on voit la route d'en bas avant de sauter, et aucune tour ne coupe le vol.
   Le virage à filet des nuages (concentrique) a été essayé ici et retiré : 1,9 km presque à plat, et sa pose dépend trop de la vitesse (prouvé en jeu : dépassé à 90 m/s).
   `?sans=villeracc` rend les routes d'avant (au tirage près) ; `?fort=saut|grandsaut` : tous les temps forts jouent ce module (banc). */
const VILLE_RACC=!/[?&]sans=([^&]*,)?villeracc(,|&|$)/.test(location.search);
/* (2026-10-18, 2e tour — Sacha : « pour les 3 villes il y a trop de moments où il faut faire du tout droit ; il faut que ça reste fun et jouable, il faut
   des tout droit mais pas autant ») les poids des motifs des VILLES quand elles ont leurs modules : épingles, esses, chicanes ×1,6-1,8 ; lignes de
   momentum ×0,3, grands balayages ×0,5, plongeons ×0,6 (ce sont eux, des courbes de 200 à 300 m, qu'on prenait pour des droites — banc). */
const VILLE_WM=[1,1,1.8,1.6,.5,1,.6,.3,1.8,.5,.2,1,1]; // (vagues ×0,5 ; le « gap », sans tremplin, une droite de 140-290 m : ×0,2)
/* <<<FIN MODCARTES>>> */
function genCtrl1(rnd,startPos,startPhi){ /* (2026-11-05, LE DIRECTEUR DE RYTHME) un seul dessin ; genCtrl, plus bas, en tire N et garde le mieux noté */
  /* (piste v6, 2026-09-25, user : « les pistes sont trop droites, il n'y a pas assez de virages »). MESURÉ au banc (218 pistes) :
     31 % de la longueur tournait plus serré que R 300 m avec la 1re caisse… et 7 % avec la dernière — c'était la CAISSE qui
     élargissait tout (LV). Or la vitesse vient désormais du MOTEUR : la caisse ne dessine plus la piste (`level` masqué ici),
     c'est la vitesse de croisière du palier moteur qui règle l'échelle (`lvPiste`). Et les respirations ne sont plus des
     droites : de petits virages de liaison. Résultat banc : ~51 % de la piste en virage, plus longue droite 978 → 336 m. */
  const level=0;
  const ctrl=[];
  let P=startPos.clone(),phi=startPhi,approx=0;const HCAP=[0,startPhi]; /* (2026-11-08, débogage) l'historique du cap pour le garde-fou d'enroulement (e1c64a63) : il n'était déclaré nulle part — « HCAP is not defined » cassait la génération des nuages, de l'espace, de la ville, de Crypto City et de la vitrée (pas de course, menu sans piste) */
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi));
  const push=()=>ctrl.push(P.clone());
  push();
  const straight=(l,dy=0,n=1)=>{for(let k=0;k<n;k++){P.addScaledVector(dir(),l/n);P.y+=dy/n;push();}approx+=Math.hypot(l,dy);};
  // (piste v6) ≤ 12° par point : le Catmull-Rom tient enfin le cercle déclaré (il l'aplatissait)
  let rPlancher=0,rPlafond=0; // (2026-10-18, 2e tour) le plancher des rayons quand la map a ses modules (voir MODC_ON) : on serre tout, jamais sous 1,35 × le rayon tenable
  const arc=(aDeg,R,n,dy=0)=>{R=Math.max(R,rPlancher);n=Math.max(n,Math.ceil(Math.abs(aDeg)/12));const a=aDeg*Math.PI/180,st=a/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.addScaledVector(dir(),ch);P.y+=dy/n;phi+=st/2;push();}
    approx+=Math.abs(a)*R;HCAP.push(approx,phi);};
  // (route v3c) une « droite » qui n'en est pas une : un arc léger de a° sur l mètres — la piste ne va plus jamais tout droit
  const courbe=(l,dy,aDeg,n)=>{let a=Math.max(4,Math.abs(aDeg));const s9=aDeg<0?-1:1;if(a>=(GEN_V2?BRIQUE.angMin:8)&&rPlafond&&l/(a*Math.PI/180)>rPlafond)a=l/rPlafond*57.2958;arc(s9*a,l/(a*Math.PI/180),n||2,dy);}; /* (2026-11-05, LE DIRECTEUR DE RYTHME) rPlafond : une « courbe » d'au moins 8° ne dépasse jamais 3,3 × le rayon tenable — à haut palier ses mètres (× LV) grandissaient plus vite que le rayon tenable, la courbe devenait une droite ; sous 8° (le tablier du pont), c'est une droite voulue */
  // (2026-09-26, user : « enlève les loopings » dans la VILLE) : le niveau ville n'en a plus aucun (motif ET signature de fin)
  const sansLoop=typeof LVL!=='undefined'&&LVL.cur&&LVL.cur.id==='ville';
  // ---- ADN DE PISTE : chaque zone tire une PERSONNALITÉ — fini le shuffle statistiquement identique ----
  // LV : la vitesse de la caisse élargit TOUS les rayons (praticable même à 1500 km/h) et allonge les respirations.
  const ESPON=typeof LVL!=='undefined'&&LVL.cur&&LVL.cur.id==='espace'&&!(typeof PARK!=='undefined'&&PARK.on)&&!window.dbgEspOff; // (2026-09-30) L'AUTOROUTE ORBITALE (voir ESP_ROUTE) — `dbgEspOff=true` : l'ancien terrain, pour comparer au banc
  const LV=(typeof lvPiste==='function'?lvPiste():1)*(ESPON?ESP_ROUTE.lv:1); // l'échelle suit la VITESSE du moteur (voir lvPiste) — 1 au banc · en ESPACE, 30 % de marge
  // (2026-10-18) LES MODULES DE CHAQUE MAP (voir MODC_ON) : la map tirée — la VILLE (et MINUIT), CRYPTO CITY, la VILLE VITRÉE (toutes `id:'ville'`) ou l'ORBITE
  const MC=MODC_ON&&typeof LVL!=='undefined'&&LVL.cur&&!LVL.cur.piste&&!LVL.cur.camp&&!(typeof PARK!=='undefined'&&PARK.on)?
    (LVL.cur.id==='espace'?'espace':LVL.cur.id==='ville'?(LVL.cur.crypto?'crypto':LVL.cur.vitre?'vitree':'ville'):null):null;
  // poids des 13 motifs [loop,hélice,épingle,esses,vague,virage,plongeon,droite,chicane,spirale,GAP,TIRE-BOUCHON,ENTRELACS]
  const AR=[
    /* ⚠ ROUTE v2 (2026-09-25, user : « il y a trop de moments où la route est courbée et où on roule sans savoir où on
       va »). Les motifs qui ENROULENT la route sur elle-même (hélice, spirale 1,5-2,5 tours, tire-bouchon, entrelacs)
       pesaient jusqu'à 40 % d'une zone : on passait de longues secondes à tourner sans rien voir venir. Ils deviennent
       RARES (l'entrelacs disparaît) au profit des DROITES, des grands virages et des esses — des courbes qu'on LIT. */
    /* ⚠ ROUTE v3 (2026-09-26, user : « enlève toutes les structures trop bizarres, ne laisse que quelques loopings de temps en
       temps ») : hélice, spirale, tire-bouchon et entrelacs sont à ZÉRO partout (leur code est parti avec) ; le looping est un
       looping SEUL, espacé d'au moins 1,6 km (plus de doublé) ; les pentes de plongeon et de momentum sont bornées (≤ ~30°). */
    /* ROUTE v3b (même jour, « ça va trop tout droit : rajoute des GRANDS VIRAGES, tout un parcours fun ») : la droite de momentum
       tombe de ~20 à 6 ; les grands virages, les esses et le GRAND BALAYAGE (motif 9, 100-150° à fond) portent la piste. */
    /* (vague 3, 2026-09-27, user : « mets plus de virages larges ») : `wv` = les poids de la VILLE — le GRAND VIRAGE (5) et le GRAND
       BALAYAGE (9) y prennent la main, au détriment des épingles (2), plongeons (6) et droites de momentum (7) ; l'altitude y vient de
       RELIEF. Puis « garde ce terrain pour la ville mais remets les anciens pour les deux autres niveaux » : NUAGES et ORBITE gardent `w`,
       les poids, les rayons et la pente d'AVANT — leurs pistes sortent identiques au tirage près. */
    {nm:'FLOW',   w:[3,0,3,26,6,30,4,6,6,16,3,0,0],    wv:[3,0,2,22,6,40,2,3,5,28,3,0,0],  rs:1.15,vt:.8},  // autoroute céleste : sweepers qui chantent — et LE gap
    {nm:'TECH',   w:[2,0,14,22,4,20,3,6,16,8,0,0,0],   wv:[2,0,9,20,4,28,2,3,13,16,0,0,0], rs:.92, vt:.9},  // slalom : épingles, chicanes (zéro gap : on est en ville)
    {nm:'ALPIN',  w:[2,0,4,14,12,22,10,8,4,12,3,0,0],  wv:[2,0,3,12,10,32,5,4,4,22,3,0,0], rs:1.1, vt:1.4}, // crêtes et plongeons (adoucis : voir `adoucirCretes`)
    {nm:'VOLTIGE',w:[7,0,4,16,8,22,6,6,5,14,2,0,0],    wv:[7,0,3,14,8,32,3,3,4,24,2,0,0],  rs:1.15,vt:1.1}, // le ciel est un cirque : un LOOP de temps en temps
    {nm:'GRAND8', w:[4,0,7,18,8,24,6,6,8,14,1,0,0],    wv:[4,0,5,16,8,34,3,3,6,24,1,0,0],  rs:1,   vt:1}    // mixte équilibré
  ][Math.floor(rnd()*5)];
  zoneArch=AR.nm; // exporté pour les BIOMES
  const RS=AR.rs*(hautOn()||MC?(40+.3*(70+(LV-1)*100))/61:LV)*(MC?.9:1.25), /* (2e tour) ×0,9 avec les modules : les virages des villes et de l'orbite se SENTENT (plancher : rPlancher) */ /* (2026-10-18, LES MODULES DE CHAQUE MAP) la ville, la crypto, la vitrée et l'orbite aussi : avec LV, au palier 15 plus un virage ne demandait le volant (0,75 virage/km en ville, 0,24 en orbite — banc) */VT=AR.vt; // (2026-10-18) sur la route TORDUE des nuages, les rayons suivent le rayon que la caisse tient au palier (40 + 0,3·v, passation/RACCOURCIS.md) au lieu de LV : LV grandissait plus vite que lui, au palier 12 plus aucun virage ne demandait le volant // ×1,25 (route v2) : des rayons plus larges — les courbes se prennent, elles ne se subissent pas
  const hand=rnd()<.33?-1:(rnd()<.5?0:1);        // LATÉRALITÉ : une piste qui spirale à gauche ne ressemble pas à une équilibrée
  const sgn=()=>rnd()<thrH(.5+hand*.22)?1:-1; // (2026-10-20) thrH : le PLAN de la piste penche le côté (voir PLN) — même tirage `rnd`
  // ---- HUMEUR DE LA ZONE : deux FLOW ne doivent PAS se ressembler ----
  // Les poids étaient FIXES par archétype : à la longue, toutes les zones d'un même archétype
  // sortaient statistiquement jumelles (« on a l'impression que la génération est toujours pareille »).
  // On secoue les poids à CHAQUE zone : celle-ci sera obsédée par les esses, la suivante par les
  // tire-bouchons. Le CARACTÈRE de l'archétype tient (un 0 reste un 0), seule l'humeur change.
  const ESPT=ESPON&&espTordOn(),TORDU=hautOn(),TW=TORDU,FIGON=ROUTE_FIGURES&&(TORDU||ESPT); // (2026-10-22, LA ROUTE LIBRE) ESPT : l'orbite aussi est ré-enroulée (pisteTord) · FIGON : les figures dessinées (looping, tonneau, à l'envers, mur, puits)
  const EV3=ESP_V3&&MC==='espace'&&FIGON&&TORD_MOD&&GEN_V2; /* (2026-11-12) L'ORBITE VERS L'AVANT (voir ESP_V3 dans route-sans-haut.js) */
  // TW : (2026-10-18) LES VIRAGES DE COURSE sur la route tordue des nuages
  const W=((ESPON?AR.wv.map(function(v,k){return v*(MC?ESP_ROUTE.wm:ESP_ROUTE.w)[k];}):AR.w)).map(v=>v*(0.35+rnd()*1.7)).map(function(v,k){return TW?v*TORD_W[k]:v;}).map(function(v,k){return MC&&!ESPON?v*VILLE_WM[k]:v;}); // (vague 3) la VILLE a ses poids à grands virages (voir `wv`) · (2026-10-18) la route tordue, les siens (TORD_W) — même nombre de tirages
  const wsum=W.reduce((a,b)=>a+b,0);
  const pick=()=>{let x=rnd()*wsum;for(let k=0;k<13;k++){x-=W[k];if(x<0)return k;}return 5;};
  const AMP=TORDU?TORD_AMP:1; // (2026-10-15) LA ROUTE SANS HAUT NI BAS EN GRAND : la zone est tirée AMP fois plus courte, puis tout est agrandi AMP fois (voir TORD_AMP)
  const LC9=longueurCible(),LEN=LC9?Math.max(1500,LC9-220*LV-260)/AMP:14400*(1+Math.min(1.5,(LV-1)*.55))/AMP; // (LA DURÉE DES MAPS, 2026-10-18) au JOUER : la longueur visée, moins le départ et l'arrivée posés hors de la boucle // (2026-09-25, user : « double la longueur de chaque niveau ») 7200 → 14400 — et plus longues encore à haute vitesse
  // ---- LE VIRAGE À FILET (voir FILET) : NUAGES seulement ; son hasard a SON générateur (un seul tirage de `rnd`, et seulement ici) ----
  FILETMARK.length=0;MODMARK.length=0;
  const FILON=FILET.on&&typeof LVL!=='undefined'&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!LVL.cur.piste&&!(typeof PARK!=='undefined'&&PARK.on);
  const N2=FILON&&nua2On(); /* (2026-11-12) LES NUAGES, LA GRANDE DESCENTE (voir NUAGES_V2 dans route-sans-haut.js) : la route va vers l'avant, ses petits modules sont dans nuages-modules.js */
  const rfS=FILON||MC?(rnd()*4294967296)>>>0:0,rf=FILON||MC?mulberry32(rfS):null; // (2026-10-18) les MODULES DE CHAQUE MAP tirent aussi dans `rf` (un seul `rnd` de plus, seulement sur leurs maps)
  const rh=MC&&VILLE_HASARD?mulberry32((rfS^0x7A1EA5ED)>>>0):null; // (2026-10-20, LES VILLES AU HASARD) le hasard du TRACÉ, à part (voir VILLE_HASARD)
  const kMC=rh?.75+rh()*.6:1;if(rh)phi+=(rh()*2-1)*Math.PI; // la cadence des modules · L'AXE : le cap du départ, sur tout le cercle
  /* LE PLAN DE LA PISTE (VILLE_HASARD) : 'axe' — la piste file vers l'axe tiré, son cap borné à ±capB (quand elle s'en écarte, les virages penchent du
     côté qui la ramène) : une longue traversée ; 'libre' — comme avant ; 'boucle' — une latéralité franche : elle s'enroule (la spirale de la ville).
     Il ne fait que PENCHER le seuil des tirages de côté (sgn, et le côté des modules qui suivaient `hand`) : aucun tirage de plus. */
  const PLN=rh?(function(u){return EV3?'axe':u<.42?'axe':u<.7?'libre':'boucle';})(rh()):null,capB=rh?(EV3?32+rh()*24:40+rh()*60)*Math.PI/180:0, /* (2026-11-12, L'ORBITE VERS L'AVANT) en orbite : toujours l'axe, le cap tenu à 32-56° de lui — la route avance, elle ne revient plus sur ses pas (mêmes tirages) */hB=rh&&rh()<.5?-1:1,phiAx=phi;
  /* ===== LA ROUTE NE S'ENROULE PLUS SUR ELLE-MÊME (2026-11-08, Sacha : « dans la ville la route fait parfois une boucle et se superpose de manière très serrée ») =====
     MESURÉ (banc, 40 graines de ville) : 23 pistes sur 40 repassaient À MOINS DE 90 M DE LEUR PROPRE ROUTE, dans le même sens (jusqu'à 0 m : une hélice) ; toutes
     avaient plus de ~370° de cap cumulé sur 1,5 km. Rien ne bornait ce cumul : virages, esses et modules tiraient leur côté sans regarder d'où l'on venait.
     ENROULEMENT = le cap gagné sur les dernières 1500 m. Si un virage (a° : ceux des modules, 90° sinon) mènerait le cap cumulé au-delà de 170° d'un côté, le tirage prend l'autre côté
     (97 %) : le seuil seul change, aucun tirage de plus. */
  const enroul=()=>{const n=HCAP.length;if(n<2)return 0;let k=n-2;while(k>0&&HCAP[k]>approx-1500)k-=2;return phi-HCAP[k+1<n?k+1:n-1];};
  const thrG=(b,a9)=>{if(N2){const d9=(phi-phiAx)*57.2958,a=a9||60;if(Math.abs(d9)>NUA2.cap||Math.abs(d9+a)>NUA2.capMax||Math.abs(d9-a)>NUA2.capMax)return Math.abs(d9+a)<Math.abs(d9-a)?1.01:0;return -1;} /* (LA GRANDE DESCENTE) aux nuages le cap reste près de l'AXE de la descente : dès qu'on s'en écarte de NUA2.cap°, ou qu'un virage de a° finirait à plus de capMax°, le tirage prend TOUJOURS le côté qui ramène (à 97 %, une route sur dix finissait à 117° de l'axe) — le seuil seul change, aucun tirage de plus */if(!PLN&&!(TORD_MOD&&MODT))return -1; /* (2026-11-11) les nuages aussi : sans vrille pour l'écarter d'elle-même, la route ne doit plus s'enrouler en plan (une pelote, vue de loin) */const w=enroul()*57.2958,a=a9||90,pP=Math.abs(w+a),pM=Math.abs(w-a);if(Math.max(pP,pM)<=170)return -1;return pP<pM?.97:.03;}; /* un virage de a° du côté + finirait à w+a°, du côté − à w−a° : si l'un des deux dépasse 170° de cap cumulé, on prend celui qui défait */
  const thrH=(b,a9)=>{const g9=thrG(b,a9);if(g9>=0)return g9; /* le garde-fou d'enroulement l'emporte sur le plan */ if(!PLN||PLN==='libre')return b;if(PLN==='boucle')return Math.min(.92,Math.max(.08,b+hB*.3));
    if(a9){const ep=Math.abs(phi+a9/57.3-phiAx),em=Math.abs(phi-a9/57.3-phiAx);return ep<em?.88:.12;} // un GRAND virage (a9°) : le côté qui finit le plus près de l'axe
    const e=(phi-phiAx)/capB;return Math.min(.94,Math.max(.06,b-.45*Math.max(-1,Math.min(1,e))-(Math.abs(e)>1?.25*Math.sign(e):0)));};
  if(typeof window!=='undefined')window.__villePlan=PLN?{plan:PLN,cap:Math.round(capB*57.3),kMC:+kMC.toFixed(2)}:null; // (banc) le plan de la dernière piste générée
  const visF=!FILON?0:FILET.visite!=null?FILET.visite:Math.floor(Math.max(0,(runStats.zones|0)-(LVL.tutoZ|0))/NIVEAUX.length); // la 1re visite du niveau NUAGES, la 2e… (2026-09-30 : le cycle a 6 niveaux, plus 3)
  const filMax=!FILON?0:LVL.cur.id==='orage'?1:FILET.par[Math.min(FILET.par.length-1,visF)]; // (2026-09-29) L'ORAGE, le niveau dur : UN filet
  let filN=0,filNext=900*LV;
  /* LES MODULES DU 1er NIVEAU (2026-09-30, Sacha : « retravaille la génération de terrain dans le premier niveau, il n'y a pour l'instant
     qu'un seul module »). MESURÉ (banc plan.js, vue de dessus) : trois nœuds de FILET identiques reliés par des virages — la zone se
     résumait au même geste ×3. Aux NUAGES (mode principal), la zone pioche désormais un MODULE tous les 1,6-2,6 km dans un paquet
     MÉLANGÉ de cinq, sans jamais le même deux fois de suite :
       0 · LE FILET (le virage rapide et sa route de rattrapage, voir FILET — au plus `filMax` par zone)
       1 · LES LACETS : 2-3 épingles qui zigzaguent en descendant, les jambes côte à côte (le voltigeur coupe d'une jambe à l'autre)
       2 · LES MONTAGNES RUSSES : 3-4 bosses en ligne presque droite — le rouleur sent le rythme, le voltigeur décolle à chaque crête
       3 · LE GRAND PLONGEON : une longue descente à ~25° qu'on voit venir, puis un grand virage de compression
       4 · LE DOS DE CHAMEAU : une seule grande bosse, puis une descente longue et lisible — le BIG AIR du niveau
     Tout passe par `rf` (le hasard du filet) : les autres niveaux ne tirent pas un `rnd` de plus. Les crêtes restent soumises à
     adoucirCretes (verdict du 25/09 : jamais de crête aveugle) — les bosses sont RONDES, la route derrière se voit. */
  const MODT=FILON&&TW; // (2026-10-18) la route TORDUE a ses modules de COURSE (voir plus bas) : ceux d'ici vivent de la gravité, qu'elle n'a plus
  const MODON=FILON&&LVL.cur.id==='nuages'&&!MODT;
  /* ===== LE BUDGET DE TORSION (2026-11-11, LA TORSION EN MODULES — voir route-sans-haut.js) ===== La route ne se tord plus que dans des figures, et chaque route a son budget, donné par son
     GENRE (phraseGenre) : TECHNIQUE — aucune torsion hors du climax (on conduit) · VITESSE — un MUR au plus (le grand virage relevé de vélodrome) · SPECTACLE — un mur et UNE
     figure qui retourne le monde (le TONNEAU dans les nuages, le PASSAGE À L'ENVERS en orbite : chaque map a la sienne, plus les deux). Le looping et le puits ne roulent pas la
     dalle : ils restent hors budget. Le climax (le surf, le couloir) est le grand moment de torsion de chaque route. */
  let torsRho=9,torsCou=9,torsSig=null; /* torsSig : LA SIGNATURE — le 1er temps fort d'une route SPECTACLE est sa figure qui retourne le monde (six fois sur dix), celui d'une route VITESSE son mur : la torsion est placée par le genre, plus tirée dans le paquet */
  const torsRefus=function(f){return f===fTonneau||f===fEnvers||f===fRetourne?torsRho<=0:f===fMur?torsCou<=0:false;},torsCompte=function(f){if(f===fTonneau||f===fEnvers||f===fRetourne)torsRho--;else if(f===fMur)torsCou--;};
  const modPaq=[];let modNext=1000*LV,modLast=-1;
  const modTire=()=>{for(let e=0;e<12;e++){if(!modPaq.length){const t=[0,1,2,3,4].concat(MODT&&FIGON?FIGF.map(function(_,i){return 5+i;}).concat([5]):[]); /* le looping (5) compte double : c'est LE raccourci (2026-11-05 : le puits ne compte plus double — une spirale de 14 s par map suffit) */for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)modPaq.push(x);}
    const m=modPaq.shift();if(m===modLast||(m===0&&filN>=filMax)||(m>=5&&modLast>=5)||(MODT&&torsRefus(MODTJ[m])))continue;if(MODT)torsCompte(MODTJ[m]);return m;}return 3;};
  const lacets=()=>{const n=2+(rf()<.5?1:0),sg0=rf()<thrH(.5)?1:-1,R=(62+rf()*20)*RS,leg=(150+rf()*80)*LV,drop=(34+rf()*10)*LV,aE=172/Math.max(1,Math.sqrt(LV*.7));
    straight(90*LV,-6*LV,2); // l'approche : on voit la première épingle venir
    for(let k=0;k<n;k++){const sg=k%2?-sg0:sg0;straight(leg,-drop*.55,3);arc(sg*aE,R,8,-drop*.45);}
    straight(leg*.8,-drop*.4,3);};
  const russes=()=>{const n=3+(rf()<.5?1:0),sg=rf()<thrH(.5)?1:-1;straight(90*LV,-4*LV,2);
    for(let k=0;k<n;k++){const h=(16+rf()*10)*LV;courbe((80+rf()*25)*LV,h,sg*(4+rf()*4),2);courbe((110+rf()*30)*LV,-(h+(10+rf()*8)*LV),sg*(4+rf()*4),3);}
    straight(100*LV,-6*LV,2);};
  const plongeonG=()=>{const L1=(200+rf()*80)*LV;straight(100*LV,4*LV,2);straight(L1,-L1*.46,4); // la lèvre, puis ~25° qu'on voit venir
    arc((rf()<thrH(.5)?1:-1)*(40+rf()*30),(150+rf()*70)*RS,4,-12*LV);straight(140*LV,-6*LV,2);}; // la compression : un grand virage presque plat
  const chameau=()=>{const sg=rf()<thrH(.5)?1:-1;courbe((140+rf()*40)*LV,(22+rf()*10)*LV,sg*5,3);courbe((220+rf()*60)*LV,-(70+rf()*25)*LV,sg*8,3);straight(100*LV,-6*LV,2);};
  /* LES MODULES DE COURSE DE LA ROUTE TORDUE (2026-10-18, Sacha : « rajoute des virages et des modules cool à rider, ça reste un jeu de course »).
     Sans haut ni bas, le filet n'a plus de route en dessous, et lacets, plongeon, dos de chameau vivaient de la pente — qui ne pousse plus ici.
     Cinq modules qui se jouent AU VOLANT, tirés comme les autres (paquet mélangé, jamais deux fois de suite, `rf`), tous les 0,5-0,9 km (× LV) :
       0 · LE SLALOM : 5 à 7 virages alternés de 38-52°, sans respiration — le rythme gauche-droite à pleine vitesse
       1 · L'ÉPINGLE : un demi-tour de 165-185° au rayon que la caisse tient à fond (~1,7-2 fois) — on la voit venir, on la prend couchée (dévers)
       2 · LA DOUBLE CORDE : deux virages de 80-105° du même côté, une courte droite entre — un U en deux coups de volant
       3 · LES ESSES : trois grands virages alternés de 70-95° — la courbe qui coule
       4 · LES MONTAGNES RUSSES : 3-4 bosses rondes en courbe — le rouleur sent le rythme, le voltigeur décolle aux crêtes
     ⚠ Leurs rayons sont VRAIS : ils échappent au zoom de la route (×Z, Z = 1/AMP) et se règlent sur `rP`, le rayon que la caisse tient volant à fond
     au palier (40 + 0,3·v, passation/RACCOURCIS.md) — jamais sous 1,7 rP : serré, jamais infranchissable. Leurs pentes sont douces (sans haut ni bas,
     une pente ne se sent pas) ; le dévers de pisteTord les couche dans le virage. */
  const rP=40+.3*(70+(LV-1)*100),Z=1/AMP;
  rPlancher=MC?1.6*rP:1.45*rP*Z;rPlafond=3.3*rP*Z; /* (2026-11-05, LE DIRECTEUR DE RYTHME) partout : jamais sous 1,45-1,6 × le rayon tenable — serré, jamais infranchissable */ // (2e tour) voir arc()
  const tSlalom=()=>{const n=5+((rf()*3)|0),R=(1.9+rf()*.5)*rP;let sg=rf()<thrH(.5)?1:-1;straight(70*LV*Z,-4*LV*Z,1);
    for(let k=0;k<n;k++){const a=38+rf()*14;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);sg=-sg;}straight(70*LV*Z,-4*LV*Z,1);};
  const tEpingle=()=>{const sg=rf()<thrH(.5+hand*.22,175)?1:-1,R=(1.45+rf()*.4)*rP,a=165+rf()*20; /* (2026-11-05) 1,45-1,85 rP : une fois sur deux SERRÉE (volant à fond, la dalle couchée par le dévers) */straight(150*LV*Z,-6*LV*Z,2);
    arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);straight(130*LV*Z,-6*LV*Z,2);};
  const tCorde=()=>{const sg=rf()<thrH(.5+hand*.22,185)?1:-1,R=(2+rf()*.5)*rP;straight(100*LV*Z,-5*LV*Z,1);
    for(let k=0;k<2;k++){const a=80+rf()*25;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);if(!k)straight((60+rf()*40)*LV*Z,-3*LV*Z,1);}straight(100*LV*Z,-5*LV*Z,1);};
  const tEsses=()=>{let sg=rf()<thrH(.5)?1:-1;const R=(2.4+rf()*.7)*rP;straight(60*LV*Z,-3*LV*Z,1);
    for(let k=0;k<3;k++){const a=70+rf()*25;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);sg=-sg;}straight(60*LV*Z,-3*LV*Z,1);};
  const tRusses=()=>{const n=3+(rf()<.5?1:0),sg=rf()<thrH(.5)?1:-1;straight(90*LV*Z,-4*LV*Z,2);
    for(let k=0;k<n;k++){const h=(16+rf()*10)*LV*Z;courbe((80+rf()*25)*LV*Z,h,sg*(8+rf()*8),2);courbe((110+rf()*30)*LV*Z,-(h+(6+rf()*6)*LV*Z),sg*(8+rf()*8),3);}
    straight(100*LV*Z,-6*LV*Z,2);};
  /* LES MODULES DE CHAQUE MAP (2026-10-18, voir MODC_ON) — les maps de genCtrl hors nuages. Rayons VRAIS réglés sur rP (jamais sous 1,7 rP : serré,
     jamais infranchissable), longueurs à l'échelle LV ; chaque map pioche dans SON paquet (`MCJ`) tous les 0,45-0,8 km × LV, paquet mélangé, jamais
     deux fois le même de suite, hasard `rf`. Ses modules à elle :
       mAngles   · LES ANGLES DE RUE (ville, vitrée) : 3-4 coins de 80-95° alternés, un pâté de maisons entre deux — on tourne aux carrefours
       mBretelle · L'ÉCHANGEUR (ville) : une bretelle de 200-250° qui plonge (~7 %) au rayon que la caisse tient — on la prend volant serré
       mBougie   · LA BOUGIE (crypto) : le PUMP, une montée dans un virage de 35-47° (~20 %), puis le DUMP, la chute presque droite (~28 %) — le saut du bull run
       mDents    · LES DENTS DE SCIE (crypto) : 4-5 virages alternés qui montent et redescendent comme une courbe de cours
       mTour     · LE TOUR DE LA GÉANTE (vitrée) : la route fait le tour (300-340°) et repasse au-dessus d'elle-même (le pont de vitreAplanir)
       mFronde   · LA FRONDE (orbite) : un grand virage de 200-260° qui vous relance de l'autre côté — la fronde gravitationnelle
       mHoule    · LA HOULE (orbite) : 3-4 vagues, chacune un virage de 50-70° (on monte dans sa 1re moitié, on plonge dans la 2de), en S — ESP_ROUTE.pente l'arrondit
     et ceux des nuages, tels quels hors de la route tordue (Z = 1) : tSlalom, tEpingle, tCorde, tEsses. */
  const mAngles=()=>{const n=3+(rf()<.5?1:0),R=(1.75+rf()*.35)*rP;let sg=rf()<thrH(.5+hand*.22)?1:-1;straight(80*LV,-4*LV,1);
    for(let k=0;k<n;k++){const a=80+rf()*15;arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.05);sg=-sg;if(k<n-1)straight((70+rf()*60)*LV,-(4+rf()*4)*LV,1);}straight(80*LV,-4*LV,1);};
  const mBretelle=()=>{const sg=rf()<thrH(.5+hand*.22,225)?1:-1,R=(2+rf()*.4)*rP,a=200+rf()*50;straight(110*LV,-5*LV,2);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.07);straight(110*LV,-5*LV,2);};
  const mBougie=()=>{const sg=rf()<thrH(.5)?1:-1,L1=(90+rf()*30)*LV,L2=(140+rf()*40)*LV;straight(40*LV,-2*LV,1); // (2e tour) plus courte : 0,3-0,4 km au lieu de 0,6-0,8
    courbe(L1,L1*(.17+rf()*.05),sg*(40+rf()*12),4);courbe(40*LV,1.5*LV,sg*6,2);courbe(L2,-L2*(.26+rf()*.04),-sg*(GEN_V2?28+rf()*10:16+rf()*8),4); /* le pump TOURNE (35-47°), le dump reste presque droit : c'est là qu'on se pose */straight(90*LV,-5*LV,2);};
  const mDents=()=>{const n=4+(rf()<.5?1:0),R=(2+rf()*.5)*rP;let sg=rf()<thrH(.5)?1:-1;straight(70*LV,-3*LV,1);
    for(let k=0;k<n;k++){const a=40+rf()*20,l=a/57.3*R;arc(sg*a,R,Math.ceil(a/10),k%2?-l*(.2+rf()*.06):l*(.12+rf()*.06));sg=-sg;}straight(80*LV,-4*LV,1);};
  const mTour=()=>{const sg=rf()<thrH(.5+hand*.22,320)?1:-1,R=(2+rf()*.4)*rP,a=300+rf()*40;straight(120*LV,0,2);arc(sg*a,R,Math.ceil(a/10),0);straight(160*LV,0,2);};
  const mFronde=()=>{const sg=rf()<thrH(.5+hand*.22,205)?1:-1,R=(2.2+rf()*.5)*rP,a=180+rf()*50; /* (2026-11-05) plus large, moins longue */straight(90*LV,-4*LV,2);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.04);straight(150*LV,-6*LV,2);};
  const mHoule=()=>{const n=3+(rf()<.5?1:0),R=(2+rf()*.4)*rP;let sg=rf()<thrH(.5)?1:-1;straight(80*LV,-3*LV,1); // chaque vague = un virage de 50-70° : on monte dans sa première moitié, on plonge dans la seconde
    for(let k=0;k<n;k++){const a=50+rf()*20,h=(10+rf()*6)*LV;arc(sg*a*.5,R,Math.ceil(a/20),h);arc(sg*a*.5,R,Math.ceil(a/20),-(h+(6+rf()*4)*LV));sg=-sg;}straight(90*LV,-4*LV,1);};
  /* ===== LES FIGURES (2026-10-22, LA ROUTE LIBRE — Sacha : « retravaille la route de l'espace et des nuages : plus fun, plus jouable, des modules, des raccourcis, passer à
     l'endroit et à l'envers ; garde les spirales mais gère-les bien ») ===== NUAGES et ORBITE, là où la route se roule dans l'espace (pisteTord), tirent aussi dans cinq figures
     DESSINÉES : leur forme est protégée des lissages (MODMARK.g) et leur roulis est SCRIPTÉ (MODMARK.f = [[i0,i1,rad]…] : pisteTord n'y tire aucune vrille, y laisse la dalle rouler
     jusqu'à TORD_DEVERS.fig, et la ramène à l'endroit avant d'y entrer). Les durées se comptent en SECONDES de croisière (vD = la croisière de conception du palier) : une figure
     dure autant à 78 m/s qu'à 340. Au plus une figure à la suite d'une autre jamais (modTire, mcTire).
       fBoucle  · LE LOOPING : un cercle vertical de ~0,85·vD m de rayon (110-520), décalé de côté d'une largeur de route + 44 m pour que la sortie ne retombe pas sur l'entrée
       fTonneau · LE TONNEAU : 7-8 s de route presque droite (deux S doux) pendant lesquelles la dalle fait UN tour complet sur elle-même
       fEnvers  · LE PASSAGE À L'ENVERS : un demi-tour de roulis (3,6 s), 3-4 esses PLAFOND, un autre demi-tour pour revenir (la route sous la tête, la planète au-dessus)
       fMur     · LE MUR : la dalle se couche d'un quart de tour dans un grand virage de 95-140° (on rase la paroi), puis se redresse
       fPuits   · LE PUITS : une spirale de ~1,25 tour, rayon large resserré aux deux bouts (entrée et sortie en douceur), qui descend de D m par tour — le RACCOURCI : sauter
                  par l'intérieur retombe sur le tour d'en dessous, ~1 tour plus loin (voir D et le banc raccourcis) */
  const vD=70+((typeof lvPiste==='function'?lvPiste():1)-1)*100; // la croisière de conception (m/s) — celle de pisteTord
  const LVf=Math.min(LV,2.2); // les approches et sorties des figures : jamais plus de 2,2 × (à haut palier LV gonflait chaque entrée à 300-400 m)
  const kT=Math.max(.4,Math.min(1,LEN/(vD*24))); // la part de temps qu'une figure peut prendre : à haut palier la map ne dure que ~13 s de croisière de conception, les figures raccourcissent (jamais sous 40 %)
  const fS=function(l,dy,n){straight(l*Z,dy*Z,n||1);},fA=function(a,R,n,dy){arc(a,R*Z,n||Math.ceil(Math.abs(a)/10),(dy||0)*Z);}; // à la VRAIE taille (le zoom des nuages les agrandit de TORD_AMP)
  const fBoucle=function(){
    const sg=rf()<.5?1:-1,Rl=Math.max(110,Math.min(520,(.85*vD+40)*kT))*Z,W=(2*ROAD_HALF+44)*Z,n=40;
    fS(100*LVf,-3*LVf,1);const O=P.clone(),d=dir(),r=new THREE.Vector3(Math.cos(phi),0,-Math.sin(phi));
    const Dl=56*Z; // le looping DESCEND d'une hauteur de dalle et demie : la sortie est plus bas que l'entrée — sauter par le côté au pied du looping retombe sur la piste de sortie (le RACCOURCI)
    for(let k=1;k<=n;k++){const a=2*Math.PI*k/n;P.copy(O).addScaledVector(d,Rl*Math.sin(a)).addScaledVector(r,sg*W*(a-Math.sin(a))/(2*Math.PI));P.y=O.y+Rl*(1-Math.cos(a))-Dl*a/(2*Math.PI);push();}
    approx+=2*Math.PI*Rl;fS(Math.max(120*LVf,(ESPT?3.8:3)*vD*kT),-3*LVf,2); /* la piste de sortie, longue : on la voit passer sous soi au pied du looping */
    return {g:1,fig:'boucle'};};
  const fTonneau=function(){
    const sg=rf()<.5?1:-1,R=Math.max(3.1*rP,.9*vD)*(.9+rf()*.3),Tt=vD*kT*(TORD_MOD?8+rf()*1.2:6.2+rf()*1.6), /* (2026-11-11) un tour en 8-9 s (c'était 6-8) */ra=rf()<.5?1:-1,a1=14+rf()*14;
    fS(100*LVf,-3*LVf,1);const ia=ctrl.length-1;
    if(TORD_MOD)fS(Tt,-2*LVf,7); /* (2026-11-11) le tonneau se joue sur une droite FRANCHE : ses deux S, pris dalle couchée, envoyaient la route jusqu'à 45° de pente (un ruban vrillé bien droit se lit de loin) */
    else{fS(.2*Tt,-2*LVf,2);fA(sg*a1,R);fS(.3*Tt,-2*LVf,3);fA(-sg*a1*.9,R);fS(.2*Tt,-2*LVf,2);}
    const ib=ctrl.length-1;fS(110*LVf,-3*LVf,1);
    return {g:1,fig:'tonneau',f:[[ia,ib,ra*2*Math.PI]]};};
  const fEnvers=function(){
    const sg=rf()<.5?1:-1,R=(1.9+rf()*.5)*rP,nE=TORD_MOD?2:kT<.7?2:3+(rf()<.5?1:0),ra=rf()<.5?1:-1,rb=rf()<.5?1:-1;let sj=sg; /* (2026-11-11, LA TORSION EN MODULES) deux esses au plafond, plus trois ou quatre : ~5 s à l'envers au lieu de 8-10 (mesuré : 15 % d'une route d'orbite à l'envers) */
    fS(80*LVf,-3*LVf,1);const ia=ctrl.length-1;fS(vD*(TORD_MOD?4:2.8)*kT,-3*LVf,3);const ib=ctrl.length-1; /* (2026-11-11) le demi-tour en 4 s (c'était 2,8) */
    for(let k=0;k<nE;k++){fA(sj*(50+rf()*22),R,0,-3*LVf);sj=-sj;if(k<nE-1)fS(40*LVf,0,1);}
    const ic=ctrl.length-1;fS(vD*(TORD_MOD?4:2.8)*kT,-3*LVf,3);const id=ctrl.length-1;fS(80*LVf,-3*LVf,1);
    return {g:1,fig:'envers',f:[[ia,ib,ra*Math.PI],[ic,id,rb*Math.PI]]};};
  const fMur=function(){
    const sg0=rf()<.5?1:-1,R=(EV3?1.3:1)*Math.max(2.6*rP,.8*vD)*(.9+rf()*.3),a0=EV3?88+rf()*30:TORD_MOD?95+rf()*(LEN>vD*60?80:40):95+rf()*45,d9=N2?(phi-phiAx)*57.2958:0,sg=N2&&Math.abs(d9)>10?(d9>0?-1:1):sg0,a=N2?Math.max(60,Math.min(95,a0,NUA2.capMax-sg*d9)):a0,tR=TORD_MOD?2.4:3,lA=TORD_MOD?50:70; /* (2026-11-12, L'ORBITE VERS L'AVANT) en orbite : LA GRANDE COURBE — 88-118° à 3,4 rP, plus jamais le demi-tour de vélodrome */ /* (2026-11-12, LA GRANDE DESCENTE) aux nuages le mur tourne de 60-95° vers l'axe : plus de demi-tour de vélodrome */ /* (2026-11-11) jusqu'au demi-tour de vélodrome (95-175°) sur une route de plus d'une minute : la route ne dérive plus, le mur peut durer ; la dalle se couche en 2,4 s (≤ 50°/s) */
    fS(lA*LVf,-3*LVf,1);const ia=ctrl.length-1;fS(vD*tR*kT,-2*LVf,3);const ib=ctrl.length-1;
    fA(sg*a,R,0,-a/57.3*R*(TORD_MOD?.14:.04));const ic=ctrl.length-1;fS(vD*tR*kT,-2*LVf,3);const id=ctrl.length-1;fS(lA*LVf,-3*LVf,1);
    return TORD_MOD?{g:1,fig:'mur',calme:N2?1:0,c:[[ia,ib,-sg*1.4],[ic,id,sg*1.4]]}:{g:1,fig:'mur',f:[[ia,ib,-sg*Math.PI/2],[ic,id,sg*Math.PI/2]]};}; /* (2026-11-11, LA TORSION EN MODULES) c : la dalle se COUCHE à 80° autour de la route, qui reste un grand virage à plat (voir « 2 ter » dans route-sans-haut.js) */
  const PUITS_D=function(Rh){const o=window.dbgPuits||{};return o.D!=null?o.D:56;}; // (m par tour) calé au banc raccourcis — voir outils/banc-routes/raccourcis.cjs · `window.dbgPuits={D,R}` : le banc balaie D et le rayon
  const fPuits=function(){
    const sg=rf()<.5+hand*.22?1:-1,Rh=(window.dbgPuits&&window.dbgPuits.R||1)*Math.max(2.5*rP,1.5*vD),th=350+rf()*50, /* (2026-11-05, Sacha : « des spirales trop serrées ») 2,2 → 2,5 rP, et 1 tour (350-400°) au lieu de 1,25 : ~14 s de spirale au palier 0 au lieu de 19 */D=PUITS_D(Rh);
    if(8*Rh*Z>LEN*.42)return tEsses(); // la map est trop courte pour un puits de cette taille : une route ordinaire
    fS(110*LVf,-4*LVf,1);
    fA(sg*40,Rh*1.7,0,-D*40/360);fA(sg*(th-80),Rh,0,-D*(th-80)/360);fA(sg*40,Rh*1.7,0,-D*40/360); // entrée et sortie en douceur : le rayon se resserre vers le puits
    fS(130*LVf,-4*LVf,1);
    return {g:1,fig:'puits'};};
  /* ===== LE MODULE UNIQUE DE CHAQUE MAP (2026-11-07, Sacha : « pour chaque map tu peux rajouter un module, unique à chaque map ») — le CLIMAX de la phrase, une fois par route =====
       fSurf      · NUAGES — LE SURF : trois virages alternés de 70-85° à 2,2 rP ; à chacun la dalle se couche à 75° vers l'intérieur (roulis scripté gauche/droite/gauche), à l'endroit entre deux : on surfe la vague
       fCouloir   · ESPACE — LE COULOIR DE LANCEMENT : 4 s de ligne droite parfaitement plate et à l'endroit (la nitro), puis un balayage de 120-140° à 2,6 rP pris sur la tranche (roulis scripté 80°) : la fronde de sortie
       mRondPoint · VILLE — LE ROND-POINT : 270° à 1,9 rP, plat, entrée et sortie en droite franche de 1,5 s : on lit le rond-point, on le coupe
       mMoon      · CRYPTO — TO THE MOON : 3 s de rampe droite montante à 18 % qui finit sur une crête (un big air), 2 s de plat, puis 90° à 2 rP
       mMiroir    · VITRÉE — LE MIROIR : deux angles droits opposés à 1,9 rP de part et d'autre d'une droite franche de 2 s */
  const fSurf=function(){let sg=rf()<.5?1:-1;
    if(TORD_MOD){ /* (2026-11-11, LA TORSION EN MODULES) LE SURF REFAIT : trois grands virages alternés de 65-80° à 2,2 rP, la dalle couchée à 52° vers l'intérieur de chacun (un bobsleigh). MESURÉ avant : 75° de roulis
         en 0,7 s, six fois de suite (125°/s), et chaque virage pris sur la tranche partait en montée ou en piqué. La dalle passe désormais d'un bord à l'autre en ~2 s (du dernier quart d'un virage
         au premier quart du suivant, 0,8 s de droite entre deux : ≤ 50°/s), et la route reste un S à plat qu'on voit venir de loin, ses trois parois tournées vers soi. */
      if(N2){const d9=(phi-phiAx)*57.2958;if(Math.abs(d9)>3)sg=d9>0?-1:1;} /* (LA GRANDE DESCENTE) le premier virage du surf ramène vers l'axe */
      const R=2.2*rP,th=.9,ev=[];fS(60*LVf,-3*LVf,1);let iP=ctrl.length-1;fS(1*vD*kT,-1,2);
      for(let k=0;k<3;k++){const a=65+rf()*15,dq=-a*.25/57.3*R*.14;fA(sg*a*.25,R,0,dq);ev.push([iP,ctrl.length-1,k?-2*sg*th:-sg*th]);fA(sg*a*.5,R,0,2*dq);iP=ctrl.length-1;fA(sg*a*.25,R,0,dq);if(k<2){fS(.8*vD*kT,-.8*vD*kT*.14,1);sg=-sg;}} /* (LA DESCENTE) le surf plonge de 14 % : un bobsleigh, ça descend */
      fS(1*vD*kT,-1,2);ev.push([iP,ctrl.length-1,sg*th]);fS(60*LVf,-3*LVf,1);return N2?{g:1,fig:'surf',c:ev,calme:1}:{g:1,fig:'surf',c:ev};} /* calme (LA GRANDE DESCENTE) : sur la route qui plonge, la dalle du surf se couche autour d'une route rappelée vers le ciel — sans quoi chaque virage, pris sur un plan incliné de 38°, repartait en montée */
    const R=2.2*rP,ev=[];fS(90*LVf,-3*LVf,1);
    for(let k=0;k<3;k++){const a=70+rf()*15,ia=ctrl.length-1;fS(.7*vD*kT,-1,1);const ib=ctrl.length-1;fA(sg*a,R,0,-2);const ic=ctrl.length-1;fS(.7*vD*kT,-1,1);const id=ctrl.length-1;ev.push([ia,ib,-sg*1.31],[ic,id,sg*1.31]);sg=-sg;}
    fS(90*LVf,-3*LVf,1);return TORD_MOD?{g:1,fig:'surf',c:ev}:{g:1,fig:'surf',f:ev};};
  const fCouloir=function(){const sg=rf()<.5?1:-1,R=2.6*rP,a=(EV3?92:120)+rf()*20; /* (2026-11-12) en orbite la fronde de sortie tourne de 92-112° : elle ne ramène plus la route en arrière */fS(60*LVf,-2*LVf,1);fS(4*vD*kT,0,4);const ia=ctrl.length-1;fS(.8*vD*kT,0,1);const ib=ctrl.length-1;fA(sg*a,R,0,-6);const ic=ctrl.length-1;fS(.8*vD*kT,-2,1);const id=ctrl.length-1;fS(80*LVf,-3*LVf,1);
    return TORD_MOD?{g:1,fig:'couloir',c:[[ia,ib,-sg*1.4],[ic,id,sg*1.4]]}:{g:1,fig:'couloir',f:[[ia,ib,-sg*1.4],[ic,id,sg*1.4]]};};
  /* (2026-11-09, Sacha : « dans la map city des fois ça fait une boucle trop serrée et il y a presque pas d'espace pour la voiture de passer en dessous ») MESURÉ (outils/banc-routes/croise.cjs, 60 graines × 3 paliers) :
     le rond-point était PLAT, donc sa sortie recoupait son entrée à 5-11 m de hauteur libre — sur 100 % des routes de ville. Le tour descend désormais d'une pente de 14 % (≈ 0,66 R : 79 m au palier 0, 180 m au 20,
     jamais moins de 70 m) : la sortie passe EN DESSOUS de l'entrée (la ville vitrée impose 46 m, VIT_SEP). */
  const mRondPoint=function(){const sg=rf()<thrH(.5+hand*.22,270)?1:-1,R=1.9*rP,kP=VRAC?.2:.14;straight(1.5*vD,(VRAC?-12:-3)*LV,2);arc(sg*270,R,27,-Math.max(70,kP*(270*Math.PI/180)*R));straight(1.5*vD,(VRAC?-12:-3)*LV,2);return {fig:'rondpoint'};}; /* (LA DESCENTE DES VILLES) 20 % au lieu de 14 */
  const mMoon=function(){const sg=rf()<thrH(.5)?1:-1,L1=3*vD,L2=2*vD;straight(50*LV,-2*LV,1);straight(L1,L1*.18,3);straight(L2,-L2*.04,2);arc(sg*90,2*rP,9,-30*LV);straight(60*LV,-3*LV,1);return {g:1,fig:'moon'};};
  const mMiroir=function(){const sg=rf()<thrH(.5+hand*.22)?1:-1,R=1.9*rP;straight(60*LV,-2*LV,1);arc(sg*90,R,9,-6*LV);straight(2*vD,-4*LV,2);arc(-sg*90,R,9,-6*LV);straight(60*LV,-2*LV,1);return {fig:'miroir'};};
  /* ===== LES MODULES DE L'ORBITE VERS L'AVANT (2026-11-12, voir ESP_V3) ===== Sacha : « des modules qui incitent le joueur à beaucoup voler, sans que ce soit forcé ; des longues lignes ; contemplatif ; que les joueurs qui
     n'ont pas envie de sauter ne sautent pas ; que la route reste crédible ; de belles occasions de prendre du kiff en volant, à l'endroit, à l'envers ».
     LA RÈGLE DE CONCEPTION : en orbite la caisse ne quitte JAMAIS la route d'elle-même (ni crête ni tremplin : elle reste collée, même dans un piqué) — on ne vole que si on le VEUT, par le saut nitro
     (double-tap : ~2,5 s en l'air à niveau en gravité d'orbite) ou en sortant par le bord. Chaque module est donc une route sage et belle, qui s'ÉCARTE de la ligne droite (vers le bas ou de côté) puis y revient :
     qui roule suit le détour, qui vole tire tout droit. Et celui qui vole court n'est pas puni : la route remonte vers lui (la paroi d'en face le rattrape). Aucun demi-tour : le cap ne quitte jamais l'axe de plus de ~60°.
       fFaille    · LA FAILLE : la route plonge dans une gorge (piqué de 46-54°, ~105 m de fond) et remonte en face, 25 m plus bas que le bord quitté — on la descend comme un grand huit, ou on SAUTE par-dessus (~330 m au palier 0, gain ~65 m)
       fCascade   · LA CASCADE : deux ou trois failles de plus en plus petites, un replat entre deux — un rebond, ou un seul long plané à la nitro par-dessus tout
       fTerrasses · LES TERRASSES : trois ou quatre longues lignes droites en gradins, une marche de ~29 m entre deux — on saute d'une terrasse à la suivante (ou à celle d'après)
       fEcart     · LE GRAND ÉCART : la route s'écarte de côté (54-62°), fait un grand virage (108-124°) et revient dans l'axe plus bas, suivie d'une longue ligne droite qui descend — qui sort tout droit par le bord plane au-dessus du vide et s'y pose
       fRetourne  · LE GRAND RETOURNEMENT : une longue ligne droite où la dalle se retourne lentement (3,4 s), ~3 s la tête en bas (la Terre au-dessus), puis revient — qui saute avant la vrille retombe sur l'AUTRE face
     Les hauteurs de vol (dr, dh) sont calées sur la gravité d'orbite en vol (~11,5 m/s²) et la croisière de conception vD : à RÉGLER dans le vrai jeu (passation/ESPACE-GRAVITY.md). `?fort=faille|cascade|terrasses|ecart|retourne`. */
  const fV=function(l,p0,p1,n){n=n||Math.max(2,Math.ceil(Math.abs(p1-p0)*57.3/9));const d=dir(),c=l*Z/n;for(let k=0;k<n;k++){const p=p0+(p1-p0)*(k+.5)/n;P.addScaledVector(d,c*Math.cos(p));P.y+=c*Math.sin(p);push();}approx+=l*Z;}; /* un tronçon dans le plan VERTICAL : l mètres, l'assiette passe de p0 à p1 (rad, − = piqué) */
  const faille1=function(k){const th=(46+rf()*8)/57.3,Rv=1.3*vD*kT*k,Ls=.28*vD*kT*k,dr=.36*vD*kT*k; /* k : la taille · Rv : le rayon des arrondis · dr : le bord d'en face, plus bas que celui qu'on quitte */
    fV(Rv*th,0,-th);fV(Ls+dr/Math.sin(th),-th,-th,2);fV(2*Rv*th,-th,th);fV(Ls,th,th,1);fV(Rv*(th+.06),th,-.06);};
  const fFaille=function(){fS(.8*vD*kT,-2*LVf,2);faille1(1);fS(2*vD*kT,-.08*2*vD*kT,3);return {g:1,plat:1,fig:'faille'};}; /* la sortie : 2 s de ligne droite à 8 % — plus on arrive vite, plus on se pose loin et bas */
  const fCascade=function(){const n=2+(rf()<.5?1:0);if(n*5.6*vD*kT*Z>LEN*.3)return fFaille(); /* la map est trop courte : une seule faille */
    fS(.8*vD*kT,-2*LVf,2);for(let k=0;k<n;k++){faille1(k?(k>1?.6:.78):1);fS((k<n-1?.8:1.8)*vD*kT,-3*LVf,k<n-1?1:3);}return {g:1,plat:1,fig:'cascade'};};
  const fTerrasses=function(){const n=2+(rf()<.3?1:0),th=(24+rf()*6)/57.3,Rv=.9*vD*kT; /* (2026-11-12, MESURÉ en jeu, banc saut-page.js) un saut d'orbite dure ~3 s À TOUTE VITESSE : des terrasses de 1,2-1,6 s faisaient survoler la suivante, puis celle d'après — mort par la jauge de vol (5 s) dès 105 m/s. Désormais des terrasses de 4,6-5,2 s (la longue ligne qu'on contemple) et des marches de ~22 m : le saut se pose sur la terrasse suivante */fS(.8*vD*kT,-2*LVf,1);
    for(let k=0;k<n;k++){fS((k?4.6+rf()*.6:1.2+rf()*.4)*vD*kT,-1*LVf,k?5:2);fV(Rv*th,0,-th);fV(.1*vD*kT,-th,-th,1);fV(Rv*th,-th,0);}
    fS(4.6*vD*kT,-.03*4.6*vD*kT,5);return {g:1,plat:1,fig:'terrasses'};};
  const fEcart=function(){const sg=rf()<thrH(.5)?1:-1,al=54+rf()*8,R1=Math.max(rPlancher,(1.6+rf()*.15)*rP),R2=Math.max(rPlancher,(1.7+rf()*.25)*rP),C=2*(R1+R2)*Math.sin(al/57.3),tV=C/(1.5*vD),dh=Math.max(28,Math.min(105,.5*11.5*tV*tV)); /* C : la corde (ce qu'on survole) · tV : le vol à 1,5 × la croisière · dh : la chute de ce vol-là. (2026-11-12, MESURÉ en jeu, banc saut-page.js : LE GESTE, c'est SORTIR TOUT DROIT PAR LE BORD du 1er virage — posé 8 fois sur 9 de 78 à 140 m/s, gain 85-104 m, ~3,2 s de vol. Le saut nitro à l'entrée vole trop longtemps dès ~100 m/s (la jauge de 5 s tue). Resserré (corde 230 m) puis borné (chute ≤ 48 m), essayés le même jour : la sortie par le bord ne quittait plus la dalle dans le 1er virage et tombait dans le vide au 2e — rendu tel qu'il était.) */ /* C : la corde (ce qu'on survole) · tV : le vol à 1,5 × la croisière (la nitro) · dh : la chute de ce vol-là (2026-11-12, MESURÉ en jeu : bornée à 48 m, la sortie par le bord lente tombait dans le vide — rendue telle qu'elle était) */
    fS(1.2*vD*kT,-2*LVf,2);const i0=ctrl.length-1,y0=P.y;fA(sg*al,R1);fA(-sg*2*al,R2);fA(sg*al,R1);
    {let tot=0;const cum=[0];for(let k=i0+1;k<ctrl.length;k++){tot+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);cum.push(tot);} /* les hauteurs de l'écart : la chute s'étale sur tout le détour */
     for(let k=i0+1;k<ctrl.length;k++)ctrl[k].y=y0-dh*THREE.MathUtils.smootherstep(cum[k-i0]/Math.max(1,tot),0,1);P.y=y0-dh;}
    fS(2.3*vD*kT,-.12*2.3*vD*kT,4);return {g:1,plat:1,fig:'ecart'};}; /* la piste de pose : 2,3 s de ligne droite à 12 %, dans l'axe de la sortie */ /* la piste de pose : 2,3 s de ligne droite à 12 %, dans l'axe de la sortie — puis (2026-11-12, MESURÉ en jeu : le saut nitro à l'entrée la dépassait dès 105 m/s et la jauge de vol le tuait) elle REMONTE à 10 % pendant 2,6 s : la route va chercher celui qui vole long */
  const fRetourne=function(){const ra=rf()<.5?1:-1,rb=rf()<.5?1:-1,Tr=3.4*vD*kT;fS(80*LVf,-3*LVf,1);const ia=ctrl.length-1;fS(Tr,-2*LVf,4); /* (2026-11-12, MESURÉ en jeu) sauté 0,5 s AVANT la vrille, on retombe sur la même face (1,2-1,7 s de vol, la dalle n'a tourné que de ~40°) : c'est sauté AU DÉBUT de la vrille qu'on passe sur l'autre face (une descente pendant la vrille, essayée, allongeait le vol jusqu'à la mort) */const ib=ctrl.length-1;fS((2.6+rf()*1)*vD*kT,-2*LVf,4);const ic=ctrl.length-1;fS(Tr,-2*LVf,4);const id=ctrl.length-1;fS(80*LVf,-3*LVf,1);
    return {g:1,fig:'retourne',f:[[ia,ib,ra*Math.PI],[ic,id,rb*Math.PI]]};};
  const CLIMAX=!GEN_V2?null:MC==='crypto'?mMoon:MC==='vitree'?mMiroir:MC==='espace'?fCouloir:MC==='ville'?mRondPoint:MODT?fSurf:null;
  const FIGF=!FIGON?[]:EV3?[fBoucle,fEnvers,fMur,fRetourne]:!TORD_MOD?[fBoucle,fTonneau,fEnvers,fMur,fPuits]:MC==='espace'?[fBoucle,fEnvers,fMur,fPuits]:[fBoucle,fTonneau,fMur,fPuits]; /* (2026-11-11, LE BUDGET DE TORSION) le tonneau aux nuages, le passage à l'envers à l'orbite */
  /* ===== LES MODULES À RACCOURCI (2026-11-11 soir, LA DESCENTE — Sacha : « des modules qui permettent de prendre des raccourcis fun et stylés », voir route-sans-haut.js) ===== Sur la route des nuages et de
     l'orbite, UN TEMPS FORT SUR DEUX (le premier, le troisième…) est un module dont la route repasse SOUS elle-même, là où la caisse retombe si elle saute du bord : le PUITS (la spirale : sauter par
     l'intérieur), le FILET (le virage rapide dont on sort tout droit : le filet attend 42-54 m plus bas, on saute toute la bretelle) et le LOOPING (sauter par le côté, au pied). Tirés à tour de rôle.
     Le filet revient sur la route roulée : c'est une figure à plat (`plat` : ni dévers ni houle dedans, pisteTord la rejoue telle quelle — sa chute est calée sur la gravité).
     `?fort=puits|filet|boucle|mur|tonneau|envers` : tous les temps forts jouent ce module (banc). */
  const fFilet=function(){const n0=MODMARK.length;filet();MODMARK.length=n0;return {g:1,fig:'filet',plat:1};};
  const VRAC=VILLE_RACC&&GEN_V2&&(MC==='ville'||MC==='crypto'); /* (2026-11-11, LA DESCENTE DES VILLES — voir VILLE_RACC) */
  /* LE SAUT ET LE GRAND SAUT (2026-11-11, LA DESCENTE DES VILLES) : un virage serré (1,6-1,9 rP, 62-96°) qu'on peut NE PAS PRENDRE — la route d'en bas est posée DROIT DANS L'AXE de l'approche, 32-44 m plus bas (LE SAUT : 2 s de vol)
     ou 66-90 m plus bas (LE GRAND SAUT : 3 s de vol entre les tours),
     sur ~1,5 × la portée : qui va tout droit quitte le bord extérieur et s'y pose dans le sens de la marche, lent ou à la nitro (elle descend à 14 % : plus on va vite, plus on se pose loin et bas).
     La route sage fait le tour : le virage, une bretelle qui s'éloigne, le grand demi-tour du même côté, et elle revient passer SOUS le virage pour entrer dans la route d'en bas (~1 km). */
  const vSaute=function(G9){ /* G9 : 1 = LE GRAND SAUT */
    const sg=rf()<thrH(.5+hand*.22)?1:-1,R=Math.max(rPlancher,(1.6+rf()*.3)*rP),th=((G9?72:62)+rf()*24)*Math.PI/180,dh=G9?66+rf()*24:32+rf()*12,g=FALL_G*SPD,pC=.05,pN=.14;
    straight((G9?90:70)*LV,-(G9?12:9)*LV,2);
    const A=P.clone(),ph0=phi,yA=P.y,ux=Math.sin(ph0),uz=Math.cos(ph0);
    arc(sg*th*57.2958,R,Math.ceil(th*57.3/10),-th*R*pC); // LE VIRAGE SERRÉ
    const yE=P.y,iE=ctrl.length-1;
    const xS=Math.sqrt(2*ROAD_HALF*R),t0=Math.sqrt(2*dh/g),d0=xS+.4*vD*t0,d1=xS+1.75*vD*t0,yN=yA-.75*dh; /* xS : là où celui qui va tout droit quitte le bord (le virage s'est écarté d'une demi-route) */
    const N=new THREE.Vector3(A.x+ux*d0,yN,A.z+uz*d0),hN=ph0;
    straight(((G9?60:30)+rf()*50)*LV,0,3); // LA BRETELLE : elle s'éloigne, fait demi-tour du même côté, revient (virage · droite · virage)
    {const rB=Math.max(rPlancher,(1+rf()*.15)*R),md=a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
     const c1x=P.x+sg*rB*Math.cos(phi),c1z=P.z-sg*rB*Math.sin(phi),c2x=N.x+sg*rB*Math.cos(hN),c2z=N.z-sg*rB*Math.sin(hN);
     const D=Math.hypot(c2x-c1x,c2z-c1z),hs=Math.atan2(c2x-c1x,c2z-c1z),b1=md(sg*(hs-phi)),b2=md(sg*(hN-hs));
     if(b1>.01)arc(sg*b1*57.2958,rB,Math.ceil(b1*57.2958/10),0);
     if(D>2)straight(D,0,Math.max(1,Math.round(D/110)));
     if(b2>.01)arc(sg*b2*57.2958,rB,Math.ceil(b2*57.2958/10),0);}
    {let tot=0;const cum=[0];for(let k=iE+1;k<ctrl.length;k++){tot+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);cum.push(tot);} // les hauteurs de la bretelle : de la sortie du virage à la route d'en bas
     for(let k=iE+1;k<ctrl.length;k++)ctrl[k].y=yE+(yN-yE)*THREE.MathUtils.smootherstep(cum[k-iE]/Math.max(1,tot),0,1);P.y=yN;}
    straight(d1-d0,-pN*(d1-d0),Math.max(3,Math.round((d1-d0)/(55*LV)))); // LA ROUTE D'EN BAS, dans l'axe
    {const air=[];for(let k=0;k<=12;k++){const d=xS*.6+(d1+40-xS*.6)*k/12;air.push({x:A.x+ux*d,z:A.z+uz*d,y:yN-pN*Math.max(0,d-d0),r:58+.22*(d-xS*.6)});}FILETMARK.push({air:air});} /* L'AIR DU SAUT (buildVoxCity y rabat les tours) : un CÔNE de ±12° autour de l'axe — une sortie de biais dérive, elle tombait sur le toit d'une tour rabattue sous la route d'en haut (prouvé en jeu) */
    straight(70*LV,-10*LV,1);
    return {fig:G9?'grandsaut':'saut'};};
  const vSaut=function(){return vSaute(1);},vPetit=function(){return vSaute(0);};
  const RACC=EV3?[fFaille,fEcart,fCascade,fTerrasses]:N2?[]:TORD_MOD&&FIGON?[fFilet,fPuits,fFilet,fBoucle]:VRAC?[vPetit,vSaut]:[]; /* (2026-11-12, LA GRANDE DESCENTE) aux nuages : ni filet (sa bretelle : un grand demi-tour de 2 km), ni puits (un tour complet) */
  const NUA=N2?nuaModules({rf:rf,fS:fS,fA:fA,i:function(){return ctrl.length-1;},T:vD*kT,rP:rP,dev:function(){return (phi-phiAx)*57.2958;},court:LEN/(vD*Z)<26,kR:Math.min(1,NUA2.relief/vD)}):null; /* LES PETITS MODULES DES NUAGES (nuages-modules.js) */ /* le filet deux fois : c'est le raccourci PROUVÉ dans le vrai jeu (outils/banc-routes/saut-page.js : sortie tout droit, pose ~2 km plus loin) */let nFort=0,raccI=RACC.length?(rf()*RACC.length)|0:0;
  const FORT_F=(function(){const m=typeof location!=='undefined'&&/[?&]fort=([a-z]+)/.exec(location.search);return m&&FIGON?({puits:fPuits,filet:fFilet,boucle:fBoucle,mur:fMur,tonneau:fTonneau,envers:fEnvers,faille:fFaille,cascade:fCascade,terrasses:fTerrasses,ecart:fEcart,retourne:fRetourne})[m[1]]||null:m&&VRAC?({saut:vPetit,grandsaut:vSaut})[m[1]]||null:null;})();
  const MODTJ=[tSlalom,tEpingle,tCorde,tEsses,tRusses].concat(FIGF);
  /* LES MODULES DE PLUS (2026-10-20, LES VILLES AU HASARD — voir VILLE_MODULES) : deux ou trois par map, mêmes règles (rayons VRAIS ≥ 1,75 rP, longueurs × LV, `rf`) :
       mCarrefourS · LE CARREFOUR EN S (ville, vitrée) : deux coins de 82-94° opposés à 25-55 m l'un de l'autre (on change de rue), parfois un troisième
       mPont       · LE PONT ENTRE DEUX TOURS (ville) : on monte en courbe (~9 %), un tablier droit et plat de 160-240 m au-dessus du canyon, on replonge (~13 %)
       mParking    · LA DESCENTE DU PARKING (ville) : une spirale de 400-460° qui descend à ~9 % au rayon que la caisse tient (≥ 60 m d'air entre deux tours)
       mEscalier   · L'ESCALIER DU BULL RUN (crypto) : 3-4 marches qui montent (~13 %) en tournant, des paliers entre deux, puis la chute
       mKrach      · LE KRACH ET LA REPRISE (crypto) : un plongeon à ~20 % en virage, le creux, la remontée à ~15 % de l'autre côté — un V de cours
       mTrombone   · LE TROMBONE (vitrée) : deux demi-tours opposés reliés par 100-160 m — la route revient sur elle-même deux fois (vitreAplanir en fait des ponts)
       mDebris     · LE CHAMP DE DÉBRIS (orbite) : 6-8 coups de volant de 22-34° qui montent et descendent de ±7 m — on se faufile
       mTransfert  · L'ORBITE DE TRANSFERT (orbite) : deux grands virages du même côté (110-140° chacun), une bosse de 18-26 m entre eux */
  const mCarrefourS=()=>{const n=2+(rf()<.35?1:0),R=(1.75+rf()*.3)*rP;let sg=rf()<thrH(.5+hand*.22)?1:-1;straight(70*LV,-3*LV,1);
    for(let k=0;k<n;k++){const a=82+rf()*12;arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.04);sg=-sg;if(k<n-1)straight((25+rf()*30)*LV,-2*LV,1);}straight(110*LV,-4*LV,2);};
  const mPont=()=>{const sg=rf()<thrH(.5)?1:-1,L1=(110+rf()*30)*LV,Lp=(160+rf()*80)*LV,L2=(120+rf()*30)*LV;straight(50*LV,-2*LV,1);
    courbe(L1,L1*.09,sg*(14+rf()*10),3);courbe(Lp,0,-sg*4,3);courbe(L2,-L2*.13,sg*(16+rf()*12),3);straight(70*LV,-3*LV,1);};
  const mParking=()=>{const sg=rf()<thrH(.5+hand*.22,330)?1:-1,R=(2.4+rf()*.4)*rP,a=290+rf()*60; /* (2026-11-05, « spirales trop serrées ») 1,8-2,1 rP × 400-460° → 2,4-2,8 rP × 330-390° ; 2026-11-08 : 290-350°, jamais un tour complet */straight(70*LV,-3*LV,1);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.09);straight(110*LV,-4*LV,2);return {fig:'parking'};}; /* fig : une spirale DÉCLARÉE (la note ne la compte pas comme une spirale subie) */
  const mEscalier=()=>{const n=3+(rf()<.5?1:0);let sg=rf()<thrH(.5)?1:-1;straight(50*LV,-2*LV,1);
    for(let k=0;k<n;k++){const l=(60+rf()*25)*LV;if(GEN_V2){courbe(l,l*(.12+rf()*.03),sg*(28+rf()*12),2);straight((55+rf()*30)*LV,-1*LV,1);} /* (LA GÉNÉRATION PROPRE) des marches qui tournent du MÊME côté (28-40°), un palier droit entre deux : plus de zigzag de petits lobes */else{courbe(l,l*(.12+rf()*.03),sg*(22+rf()*12),2);courbe((55+rf()*30)*LV,-1*LV,-sg*(14+rf()*8),2);sg=-sg;}}
    {const l=(170+rf()*50)*LV;courbe(l,-l*(.24+rf()*.04),sg*(45+rf()*25),4);}straight(70*LV,-3*LV,1);}; /* (2026-11-05) des marches qui tournent (22-34°), une chute qui tourne (45-70°) */
  const mKrach=()=>{const sg=rf()<thrH(.5)?1:-1,L1=(130+rf()*40)*LV,L2=(120+rf()*30)*LV;straight(50*LV,-2*LV,1);
    courbe(L1,-L1*(.19+rf()*.03),sg*(45+rf()*20),4);courbe(40*LV,-1*LV,sg*6,2);courbe(L2,L2*(.14+rf()*.03),-sg*(45+rf()*20),4);straight(70*LV,-3*LV,1);}; /* (2026-11-05) le V du krach TOURNE : 45-65° de chaque côté (20-30° sur 130-170 m, c'était une droite qui penche) */
  const mTrombone=()=>{const sg=rf()<thrH(.5+hand*.22)?1:-1,R=(1.8+rf()*.3)*rP;straight(80*LV,0,1);arc(sg*(170+rf()*15),R,18,0);straight((100+rf()*60)*LV,0,2);arc(-sg*(170+rf()*15),R,18,0);straight(100*LV,0,2);};
  const mDebris=()=>{const n=GEN_V2?4+((rf()*2)|0):6+((rf()*3)|0),R=(1.8+rf()*.4)*rP;let sg=rf()<thrH(.5)?1:-1;straight(60*LV,-3*LV,1); /* (2026-11-07, LA GÉNÉRATION PROPRE) 4-5 coups de volant de 42-56° : des virages qu'on lit, plus huit petites douilles */
    for(let k=0;k<n;k++){const a=GEN_V2?42+rf()*14:22+rf()*12;arc(sg*a,R,Math.ceil(a/10),(k%2?-7:7)*LV);sg=-sg;} /* (2026-11-07, LA GÉNÉRATION PROPRE) 30-42° : des coups de volant, plus des douilles */straight(80*LV,-4*LV,1);};
  const mTransfert=()=>{const sg=rf()<thrH(.5+hand*.22,250)?1:-1,R=(2+rf()*.5)*rP,h=(18+rf()*8)*LV;straight(70*LV,-3*LV,1);
    {const a=110+rf()*30;arc(sg*a,R,Math.ceil(a/10),h);}straight((60+rf()*40)*LV,-h*.4,1);{const a=110+rf()*30;arc(sg*a,R,Math.ceil(a/10),-h*.9);}straight(90*LV,-4*LV,1);};
  const VMOD=VILLE_MODULES; // (`?sans=villemodules` : les paquets d'avant)
  const MCJ=!MC?null:MC==='crypto'?[mBougie,mDents,tSlalom,tEpingle].concat(VMOD?[mEscalier,mKrach]:[]):MC==='vitree'?[mTour,mAngles,tSlalom,tEsses].concat(VMOD?[mCarrefourS,mTrombone,tCorde]:[]):MC==='espace'?(EV3?[fFaille,fEcart,fTerrasses,fCascade,mHoule,tEsses,mDebris].concat(FIGF):[mFronde,mHoule,tSlalom,tCorde,tEsses].concat(VMOD?[mDebris,mTransfert]:[],FIGF,FIGON?[fBoucle]:[])):[mAngles,mBretelle,tSlalom,tCorde].concat(VMOD?[mCarrefourS,mPont,mParking]:[]);
  const mcPaq=[];let mcLast=-1,mcNext=Math.max(Math.min(700*LV,LEN*.15),FIGON?Math.max(450,1.8*vD)+90:0); // (LA DURÉE DES MAPS) une map courte garde au moins un module
  const mcTire=()=>{for(let e=0;e<8;e++){if(!mcPaq.length){const t=MCJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)mcPaq.push(x);}
    const m=mcPaq.shift();if(m===mcLast||(FIGF.indexOf(MCJ[m])>=0&&FIGF.indexOf(MCJ[mcLast])>=0)||torsRefus(MCJ[m]))continue;torsCompte(MCJ[m]);return m;}return 0;};
  const filet=()=>{
    const sg=rf()<thrH(.5+hand*.22)?1:-1,R=(95+rf()*45)*RS,th=(55+rf()*20)*Math.PI/180,Re=R+ROAD_HALF;
    const eG9=TORD_MOD&&ESPT?.5:1,vN=FILET.kv*(70+(LV-1)*100),g=FALL_G*SPD*eG9,k0=FILET.kick,iM0=ctrl.length-1; /* (2026-11-11, LA DESCENTE) en orbite la gravité est moitié moindre : le filet se pose sous la même trajectoire, 0,6 fois moins bas (un vol de ~2,5 s au lieu de 4) */ // iM0 : début du module (MODMARK)
    straight(70*LV,-10*LV,2); // l'APPROCHE : droite et lisible — le virage et son filet se voient venir
    const A=P.clone(),ph0=phi,yA=P.y,pC=.04+rf()*.03,dropC=th*R*pC; // un virage PRESQUE PLAT : sa pente part avec la caisse (vy = −v·pente) — à 780 km/h, 12 % de pente jetaient la caisse 44 m sous le filet (mesuré)
    const C=new THREE.Vector3(A.x+sg*R*Math.cos(ph0),0,A.z-sg*R*Math.sin(ph0));
    const at=(ps,r,y)=>P.set(C.x-sg*Math.cos(ph0+sg*ps)*r,y,C.z+sg*Math.sin(ph0+sg*ps)*r); // le point à l'angle parcouru ps, au rayon r
    const pose=f=>{const fc=Math.min(1,Math.max(0,f)),dh=(FILET.dh+FILET.dhS*fc)*(eG9<1?.6:1),b=vN*pC-k0,t=(-b+Math.sqrt(b*b+2*g*dh))/g,x=vN*t; // ½g·t² + (v·pente − kick)·t = dh
      const xr=Re+x*Math.sin(FILET.dev),xt=x*Math.cos(FILET.dev);return {ps:f*th+Math.atan2(xt,xr),r:Math.hypot(xr,xt),y:yA-dropC*fc-dh};}; // (la sortie, écartée de `dev` vers le vide)
    arc(sg*th*180/Math.PI,R,Math.max(5,Math.ceil(th*57.3/10)),-dropC);   // LE VIRAGE RAPIDE
    const E=P.clone(),yE=P.y,iE=ctrl.length-1;
    const f0=-.15,f1=1.15,p0=pose(f0),aN=2*Math.PI+p0.ps;
    at(aN,p0.r,p0.y);const N=P.clone(),hN=ph0+sg*aN;P.copy(E); // le début du filet (at a déplacé P : il revient en E)
    /* LA BRETELLE (v2 — la v1 tournait en rond autour du virage : un « escargot », trop proche des spirales retirées le 26/09 pour
       « on tourne sans rien voir venir »). Comme une bretelle d'échangeur : une LIGNE qui s'éloigne dans l'axe de sortie du virage, un
       grand DEMI-TOUR, la ligne du RETOUR, puis le virage qui entre dans le filet (un Dubins « virage · droite · virage » du même
       côté, rayon `rB`). Les hauteurs se posent ensuite, à la longueur parcourue : la chute de E au filet s'étale sur toute la bretelle. */
    let len=0,prev=P.clone();
    const a0=approx;
    straight((200+rf()*140)*LV,0,3);
    {const rB=Math.max(55*RS,(.72+rf()*.3)*R),md=a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
     const c1x=P.x+sg*rB*Math.cos(phi),c1z=P.z-sg*rB*Math.sin(phi),c2x=N.x+sg*rB*Math.cos(hN),c2z=N.z-sg*rB*Math.sin(hN);
     const D=Math.hypot(c2x-c1x,c2z-c1z),hs=Math.atan2(c2x-c1x,c2z-c1z),b1=md(sg*(hs-phi)),b2=md(sg*(hN-hs));
     if(b1>.01)arc(sg*b1*57.2958,rB,Math.ceil(b1*57.2958/10),0);
     if(D>2)straight(D,0,Math.max(1,Math.round(D/110)));
     if(b2>.01)arc(sg*b2*57.2958,rB,Math.ceil(b2*57.2958/10),0);}
    {let tot=0;const cum=[0];for(let k=iE+1;k<ctrl.length;k++){tot+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);cum.push(tot);}
     for(let k=iE+1;k<ctrl.length;k++)ctrl[k].y=yE+(p0.y-yE)*THREE.MathUtils.smootherstep(cum[k-iE]/Math.max(1,tot),0,1);
     len=approx-a0;approx=a0;P.copy(ctrl[ctrl.length-1]);prev.copy(P);}
    const nF=Math.max(6,Math.ceil((pose(f1).ps-p0.ps)/(8*Math.PI/180)));
    let last=null;const iN0=ctrl.length;
    for(let k=1;k<=nF;k++){const q=pose(f0+(f1-f0)*k/nF);at(2*Math.PI+q.ps,q.r,q.y);len+=P.distanceTo(prev);prev.copy(P);push();last=q;} // LE FILET
    for(let k=1;k<=3;k++){at(2*Math.PI+last.ps+k*.14,last.r,last.y-6*k);len+=P.distanceTo(prev);prev.copy(P);push();} // la sortie, dans l'élan
    MODMARK.push({i0:iM0,i1:iE},{i0:iN0,i1:ctrl.length-1}); // (revue PISTE) le virage d'où l'on sort, le filet où l'on se pose — la bretelle entre les deux reste une route comme une autre
    phi=ph0+sg*(2*Math.PI+last.ps+.42);approx+=len; // (le virage, arc() l'a déjà compté)
    const pz=f=>{const q=pose(f);at(2*Math.PI+q.ps,q.r,q.y);return P.clone();};
    FILETMARK.push({sg:sg,A:A,E:E,N0:pz(0),N1:pz(1),Nlo:pz(f0),Nhi:pz(f1),R:R,th:th,vN:vN});
    at(2*Math.PI+last.ps+.42,last.r,last.y-18); // (pz a déplacé P : il revient au dernier point posé)
  };
  const droiteM=()=>{const l9=(140+rnd()*150)*(1+level*.04);straight(l9,-l9*(.32+rnd()*.16),2);}; // (route v3) la droite de momentum qui a remplacé le gap (tremplins coupés) : pente ≤ ~26°, plus un toboggan à 45°
  if(sansLoop&&LVL.cur.id==='ville'){ // (2026-09-29) L'ENTRÉE DANS LA VILLE : droite surélevée, puis la grande rampe qui plonge dans le canyon (voir VILLE_ENTREE_R)
    const E9=MC?Object.assign({},VILLE_ENTREE_R,{droite:260,rampe:320,chute:160}):VILLE_ENTREE_R; // (2e tour) avec les modules, l'entrée raccourcit : 260 m de droite au lieu de 420, une rampe de 320 m (en virage) au lieu de 520 (« trop de tout droit »)
    straight(E9.droite*LV,-6*LV,4);const iA9=ctrl.length-1;
    if(MC)courbe(E9.rampe*LV,-E9.chute*LV,(rf()<thrH(.5)?1:-1)*(72+rf()*20),6);else /* (rPlafond : à haut palier la rampe tourne davantage, pour rester sous 3,3 rP) */ // (2e tour) avec les modules, la grande rampe plonge EN VIRAGE (72-92° — 2026-11-05 : à 48-62° sur 320 m c'était 4 rP et plus, une droite qui penche)
    straight(E9.rampe*LV,-E9.chute*LV,6);VILLE_ENTREE={pA:ctrl[iA9],pB:ctrl[ctrl.length-1]}; // (les points eux-mêmes : les adoucissements les déplacent, la ville lit leur place FINALE)
  }else straight(110*LV,(N2?-10:-70)*LV,2); // DÉPART : ligne droite, rallongée avec la vitesse (était 170 m + la caisse)
  if(MODT)modNext=Math.max(Math.min((FIGON?300:900)*LV*Z,LEN*(FIGON?.08:.18)),FIGON?(Math.max(450,1.8*vD)+90)/AMP:0); // (ROUTE LIBRE) pas avant la fin du départ tenu de pisteTord : une figure y serait perdue // (LA DURÉE DES MAPS) une map courte garde au moins un module // (2026-10-18) le 1er module de course ~900 m après le départ (VRAIS mètres : la zone est tirée au 1/AMP)
  const respire=(l,dy)=>{let sg9=sgn(),fait9=0;while(fait9<l-40){const a9=20+rnd()*12,R9=(2.6+rnd()*.8)*rP*Z,l9=Math.min(a9/57.3*R9,l-fait9);arc(sg9*a9*(l9/(a9/57.3*R9)),R9,3,dy*l9/l);fait9+=l9;sg9=-sg9;}}; /* (2026-11-05, LE DIRECTEUR DE RYTHME) le départ jusqu'au 1er module : des esses DOUCES (20-32° à 2,6-3,4 rP) — on lit la map, mais on tourne déjà (un S de 8° sur 600 m était une droite de 8 s) */
  const V2=GEN_V2&&!!(MC||MODT); /* (2026-11-07, LA GÉNÉRATION PROPRE — voir route-briques.js) LA PHRASE DE RYTHME remplace les 13 motifs tirés au hasard et les respirations de 8-20° ;
     le ciel du menu, le parc et les pistes sans modules gardent l'ancienne recette. `window.__phrase` : la phrase de la dernière zone (banc). */
  if(V2){
    const G0=phraseGenre(rnd),G9=EV3?'ORBITE':G0,vS=vD*Z,PH=phraser(rnd,LEN-approx,vS,G9,{G:N2?Object.assign({},PHRASE_GENRES[G9],{montee:[1,1],a:[45,80],Rk:[2.2,3],ench:.35}):undefined,climax:N2&&(LEN-approx)/vS<58?false:undefined, /* (LA GRANDE DESCENTE) aux nuages : la montée est UN virage ample, le temps fort un enchaînement de petits modules (~8 s) ; le surf (11 s) ne vient que sur une route d'une minute ou plus (les paliers lents) — au-delà il prenait la place de tous les modules */ouverture:EV3?[2.4,3.2]:[1.5,2.6] /* (2026-11-12, MESURÉ en jeu) en orbite le 1er temps fort tombait parfois avant s0+60 m : pisteTord le refusait, la dalle y gardait son dévers et le saut de la faille tuait */,fortS:N2?Math.max(4,Math.min(7,(LEN-approx)/vS/4.5)):5, /* aux nuages : un GRAND module de 5 à 8 s (7 s prévues), moins sur une route de moins de 32 s (au palier 27 elle ne dure que 17 s : il lui faut quand même son temps fort) */climaxS:TORD_MOD&&FIGON?(TW?3*1.27*2.2*rP/vD+3.6*kT+1.6:2.27*2.6*rP/vD+5.6*kT+1.8):0,margeFort:RACC.length?22:10,fin:N2?Math.max(450*LV*Z,4*vS)+vS:(TW||ESPT?Math.max(700*LV*Z,6*vS):0)+1.4*vS}) /* la fin : sur la route roulée, pisteTord tient les 6 dernières secondes à l'endroit — le climax doit finir avant */,G=PH.G,dyk=VRAC?.26:MC==='ville'||MC==='crypto'||MC==='vitree'?.12:.03; /* (LA DESCENTE DES VILLES) ,12 → ,26 */
    let dette=0;if(typeof window!=='undefined')window.__phrase=PH;
    const ap0=VRAC?approx:0;let vMont=VRAC?0:1,vApres=0; /* (LA DESCENTE DES VILLES) en ville : la phrase se compte depuis le pied de la rampe d'entrée (le climax ne tombe plus 0,6 km trop tôt), le 1er temps fort vient SANS montée (la rampe en tient lieu), et après le climax un 2e module à raccourci prend la place de la montée s'il tient avant l'arrivée */
    if(TORD_MOD&&FIGON){torsRho=G9==='SPECTACLE'?1:0;torsCou=G9==='TECHNIQUE'?0:1;
      if(G9==='SPECTACLE'){if(rf()<.6){torsSig=MC==='espace'?fEnvers:fTonneau;torsRho=0;}}else if(G9==='VITESSE'){torsSig=fMur;torsCou=0;}
      if(N2&&PH.L/vS<40)torsSig=null;} /* (LA GRANDE DESCENTE) une route de moins de 40 s n'a pas la place d'une grande figure (7 à 9 s) : ses temps forts sont tous des petits modules */ /* (2026-11-11) LE BUDGET DE TORSION de cette route, d'après son genre */
    if(EV3){torsRho=1;torsCou=1;torsSig=null;} /* (2026-11-12, L'ORBITE VERS L'AVANT) le budget de l'orbite : un retournement (ou un passage à l'envers) et une grande courbe par route, tirés dans le paquet */
    const capA=function(aDeg){if(!N2)return aDeg;const d9=(phi-phiAx)*57.2958;let s9=aDeg<0?-1:1,a=Math.abs(aDeg);if(Math.abs(d9+s9*a)>NUA2.capMax&&Math.abs(d9-s9*a)<Math.abs(d9+s9*a))s9=-s9;const f9=Math.abs(d9+s9*a);if(f9>NUA2.capMax)a=Math.max(BRIQUE.angMin+8,a-(f9-NUA2.capMax));return s9*a;}; /* (LA GRANDE DESCENTE) un virage de la phrase ne finit jamais à plus de capMax° de l'axe : il change de côté, ou tourne moins */
    const virageL=function(aDeg,Rk,pk){const a=capA(briqueDette(aDeg,dette));dette=0;const R=Math.max(rPlancher,Rk*rP*Z),n=Math.ceil(Math.abs(a)/10);arc(a,R,n,-(Math.abs(a)/57.3*R)*pk);}; /* un virage LISIBLE : 45-120° à 1,7-3,4 rP */
    const souffle=function(sl){const pk=MC==='espace'?.02:dyk*(VRAC?.6:.4);if(sl.bal){const sg=sgn(),R=Math.max(BRIQUE.balayageRP*rP*Z,sl.L/(sl.a/57.3));arc(sg*sl.a,R,Math.ceil(sl.a/6),-sl.L*pk);}else straight(sl.L,-sl.L*pk,Math.max(1,Math.round(sl.s)));}; /* une droite franche, ou un balayage au pouce */
    const vTient=function(sansClimax){const f9=FORT_F||RACC[raccI%RACC.length];return LEN-approx>(f9===vSaut?240*LV+15*rP+4.2*vD:180*LV+14.5*rP+3*vD)+(PH.climaxFait||sansClimax?2.5*vD:5.5*vD+9*rP);}; /* (LA DESCENTE DES VILLES) la longueur du module (m) + 2,5 s — et la place du climax s'il reste à venir : il ne part que s'il tient avant l'arrivée (à haut palier la route ne dure que ~25 s) */
    let vRac=0;
    const fort=function(){
      if(VRAC&&!vRac&&!PH.climaxFait&&!vTient()&&vTient(1)&&rf()<.6)PH.climaxFait=true; /* (LA DESCENTE DES VILLES) à haut palier la route ne dure que ~25 s : six fois sur dix, le module à raccourci prend la place du climax */
      if(RACC.length&&(VRAC?(FORT_F||nFort++%3!==2)&&vTient():(FORT_F||nFort++%2===0))){vRac++; /* (LA DESCENTE DES VILLES) en ville : deux temps forts sur trois */const f9=FORT_F||RACC[raccI++%RACC.length],iM9=ctrl.length-1;if(MC)mcLast=MCJ.indexOf(f9);else modLast=MODTJ.indexOf(f9);const fm9=f9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));return;} /* (LA DESCENTE) un temps fort sur deux : un module à raccourci */
      if(torsSig){const iM9=ctrl.length-1,f9=torsSig;torsSig=null;if(MC)mcLast=MCJ.indexOf(f9);else modLast=MODTJ.indexOf(f9);const fm9=f9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));return;}
      if(N2){NUA.fort(function(f9){const iM9=ctrl.length-1,fm9=f9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));});return;} /* (LES GRANDS MODULES, 12/11) aux nuages : UN grand module par temps fort (nuages-modules.js) */
      if(MC){const m=mcTire(),iM9=ctrl.length-1;mcLast=m;const fm9=MCJ[m]();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}
      else{const m=modTire(),iM9=ctrl.length-1;modLast=m;const fm9=MODTJ[m]();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}};
    for(let sl=PH.suivant(approx-ap0);sl;sl=PH.suivant(approx-ap0)){
      if(sl.t==='ouverture'){if(sl.L>40)straight(sl.L,-sl.L*.02,Math.max(1,Math.round(sl.s)));}
      else if(sl.t==='montee'&&!vMont){vMont=1;}
      else if(sl.t==='montee'&&N2&&PH.L/vS<40){} /* (LA GRANDE DESCENTE) une route de moins de 40 s (les paliers rapides) : pas de montée, les modules s'enchaînent d'un souffle à l'autre */
      else if(sl.t==='montee'&&VRAC&&PH.climaxFait&&!vApres&&vTient()){vApres=1;nFort=0;fort();}
      else if(sl.t==='montee'){let sg=sgn(),cum=0;for(let k=0;k<sl.n;k++){let a=G.a[0]+rnd()*(G.a[1]-G.a[0]);if(cum&&a>150-cum)a=Math.max(BRIQUE.angMin,150-cum);virageL(sg*a,G.Rk[0]+rnd()*(G.Rk[1]-G.Rk[0]),dyk*(VRAC?.7+rnd()*.45:.6+rnd()*.8)); /* deux virages du même côté ne font jamais plus de 150° à eux deux : une montée ne s'enroule pas sur elle-même */
        if(k<sl.n-1){if(!sl.ench)straight((.5+rnd()*.7)*vS,-1*LV,1);if(rnd()<.78){sg=-sg;cum=0;}else cum+=a;}}}
      else if(sl.t==='fort')fort();
      else if(sl.t==='souffle')souffle(sl);
      else if(sl.t==='climax'){if(RACC.length&&(VRAC?!vRac&&vTient():!nFort)&&rf()<.6){nFort=0;fort();} /* (LA DESCENTE) une route trop courte pour un temps fort avant son climax (les paliers rapides) : six fois sur dix, son grand moment EST un module à raccourci */
        else if(CLIMAX){const iM9=ctrl.length-1,fm9=CLIMAX();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1,climax:1},fm9||{}));}}
      else if(sl.t==='fin'){const sg=sgn(),a=60+rnd()*40;virageL(sg*a,2.4+rnd()*.6,dyk*(VRAC?.75:.5));let n9=0;
        if(N2){let k9=0;while(LEN-approx>Math.max(450*LV*Z,4*vS)+7.5*vS&&k9++<4){NUA.un(function(f9){const iM9=ctrl.length-1,fm9=f9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));});if(LEN-approx>Math.max(450*LV*Z,4*vS)+7*vS)souffle(briqueSouffle(rnd,vS,G));}} /* (LA GRANDE DESCENTE) aux nuages la fin de route joue encore des petits modules, un par un, jusqu'à l'arrivée tenue à l'endroit (c'étaient 13 s de virages et de droites sans rien) */while(approx<LEN-30&&n9++<10){if(n9%2===0&&LEN-approx>3*vS){const sg9=sgn();virageL(sg9*(45+rnd()*45),2.4+rnd()*.8,dyk*(VRAC?.7:.4));continue;}const s9=briqueSouffle(rnd,vS,G);if(approx+s9.L>LEN){s9.L=Math.max(40,LEN-approx);s9.s=s9.L/vS;}souffle(s9);}}} /* la signature de fin : un dernier grand virage, puis la route jusqu'à la longueur visée (sur la route roulée, à l'endroit : droites et balayages) et la droite d'arrivée */
  }else{
  if(FIGON&&MODT&&approx<modNext)respire(modNext-approx,-2*LV); // (ROUTE LIBRE) le départ tenu rejoint le 1er module : pas un motif de plus, qui à haut palier prend 1 à 3 km
  if(FIGON&&MC&&approx<mcNext)respire(mcNext-approx,-2*LV);
  while(approx<LEN){
    if(MC&&approx>mcNext&&approx<LEN-Math.min(600*LV,LEN*.3)){const m=mcTire(),iM9=ctrl.length-1;mcLast=m; // (2e tour) jusqu'à 0,6 km du bout : le dernier 1,5 km faisait de longues droites // (2026-10-18) LES MODULES DE CHAQUE MAP (voir mAngles…)
      {const fm9=MCJ[m]();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}mcNext=approx+(MC==='espace'?(FIGON?40+rf()*200:300+rf()*300):300+rf()*250)*LV*kMC;continue;} // (2e tour) un module tous les 0,3-0,6 km × LV
    if(MODT&&approx>modNext&&approx<LEN-Math.min((FIGON?900:1500)*LV*Z,LEN*(FIGON?.2:.3))){const m=modTire(),iM9=ctrl.length-1;modLast=m; // (2026-10-18) LES MODULES DE COURSE (voir tSlalom…) — même paquet, même hasard `rf`
      {const fm9=MODTJ[m]();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}
      modNext=approx+(FIGON?40+rf()*140:500+rf()*400)*LV*Z;continue;}
    if(MODON&&approx>modNext&&approx<LEN-2600*LV){const m=modTire(),iM9=ctrl.length-1;modLast=m; // (2026-09-30) LES MODULES DU 1er NIVEAU (voir plus haut)
      if(m===0){filet();filN++;}else if(m===1)lacets();else if(m===2)russes();else if(m===3)plongeonG();else chameau();
      if(m!==0)MODMARK.push({i0:iM9,i1:ctrl.length-1}); // (revue PISTE) le module entier (le filet pose ses deux tronçons lui-même)
      modNext=approx+(1600+rf()*1000)*LV;continue;}
    const mo=(!MODON&&!MODT&&filN<filMax&&approx>filNext&&approx<LEN-2600*LV)?-7:pick(); // (2026-10-18) pas de filet sur la route tordue (MODT) : sa route d'en dessous n'est plus en dessous
    if(mo===-7){filet();filN++;filNext=approx+(1500+rf()*1300)*LV;} // LE VIRAGE À FILET (voir FILET)
    else if(mo===9){ // (route v3b) LE GRAND BALAYAGE : un virage long et LARGE, 100-150°, qui descend doucement — on le prend à fond, on le SENT
      const sg=sgn(),R9=(2.2+rnd()*1.2)*rP*Z,a9=90+rnd()*50; /* (2026-11-05, LE DIRECTEUR DE RYTHME) le grand balayage : 2,2-3,4 × le rayon tenable, 90-140° — large, mais il TOURNE */ // (2026-09-30) l'ESPACE a les rayons de la ville // (vague 3) plus LARGE en VILLE : R 160-320 (ailleurs 110-200)
      arc(sg*a9,R9,Math.max(5,Math.round(a9/14)),-(a9*Math.PI/180*R9*(.12+rnd()*.12)));
    }else if(mo===0||mo===1||mo===11||mo===12){ // (route v3) le motif looping et les motifs retirés : un GRAND VIRAGE
      const sg=sgn(),R2=(1.8+rnd()*1.2)*rP*Z,a2=45+rnd()*65; /* (2026-11-05, LE DIRECTEUR DE RYTHME) 1,8-3 × le rayon tenable : un virage qui se SENT */
      arc(sg*a2,R2,3,-(a2*Math.PI/180*R2*(.35+rnd()*.3)));
    }else if(mo===2){ // épingle OUVERTE — s'évase avec le niveau (praticable à toute vitesse)
      const sg=sgn();
      straight(25+rnd()*40,-25);
      arc(sg*(150+rnd()*30),(1.7+rnd()*.4)*rP*Z,8,-(24+rnd()*26)); /* (2026-11-05) l'épingle : 150-180° à 1,7-2,1 rP */
      straight(25+rnd()*40,-25);
    }else if(mo===3){ // esses amples
      const nS=1+Math.floor(rnd()*3),a=Math.max(40,25+rnd()*45),R=(1.8+rnd()*1.0)*rP*Z; /* (2026-11-05) des esses d'au moins 40° à 1,8-2,8 rP */ // (2e tour) avec les modules, des esses d'au moins 40°
      for(let q=0;q<nS;q++){
        const dl=a*Math.PI/180*R*(.6+rnd()*.5);
        arc(a,R,2,-dl);arc(-a,R,2,-dl);
      }
    }else if(mo===4){ // vague verticale : bosse + creux (crête à sauter !)
      const sg4=sgn(); // (route v3c) la vague se prend EN COURBE : trois tronçons qui tournent du même côté
      courbe(40+rnd()*40,-(10+rnd()*20)*VT,sg4*(10+rnd()*12));
      courbe(50+rnd()*40,(20+rnd()*25)*VT,sg4*(10+rnd()*12));  // remontée surprise
      courbe(70+rnd()*50,-(45+rnd()*40)*VT,sg4*(12+rnd()*14)); // et ça replonge (route v3 : sans le mur de 60°)
    }else if(mo===5){ // grand virage large — (route v3c) plus serré d'un cran et jamais sous 45° : un VRAI virage
      const sg=sgn(),R2=(1.8+rnd()*1.3)*rP*Z,a2=45+rnd()*65; /* (2026-11-05, LE DIRECTEUR DE RYTHME) 1,8-3,1 × le rayon tenable */ // (vague 3, « plus de virages larges ») R 130-320 en VILLE (ailleurs 80-200)
      arc(sg*a2,R2,3,-(a2*Math.PI/180*R2*(.6+rnd()*.5)));
    }else if(mo===6){ // plongeon — (route v3) franc mais jamais vertical : pente bornée à ~30°
      {const l6=60+rnd()*80;courbe(l6,-l6*Math.min(.58,(.28+rnd()*.2)*VT),sgn()*(10+rnd()*10));}
      const sg=sgn(),a3=25+rnd()*50,R3=(1.9+rnd()*1.1)*rP*Z;
      arc(sg*a3,R3,2,-(a3*Math.PI/180*R3*.8));
    }else if(mo===7){ // ligne de momentum (zone de vitesse, pente douce)
      const l=Math.min((90+rnd()*100)*LV,2.5*vD*Z); /* (2026-11-05) jamais plus de 2,5 s de croisière */
      {const a7=20+rnd()*20;arc(sgn()*a7,l/(a7*Math.PI/180),3,-l*(.32+rnd()*.16));} // (piste v6) la ligne de momentum se CINTRE — (route v3) pente ≤ ~26° au lieu du toboggan à 45°
    }else if(mo===8){ // chicane rapide : gauche-droite-gauche à pleine vitesse
      const n8=3+Math.floor(rnd()*3),a8=(TW?26:16)+rnd()*14,R8=(1.7+rnd()*.9)*rP*Z;let sg8=sgn(); // (2026-10-18) sur la route tordue, des coups de volant francs (26-40°)
      for(let q=0;q<n8;q++){arc(sg8*a8,R8,2,-(a8*Math.PI/180*R8*.5));sg8=-sg8;}
    }else if(mo===10){ // (route v3) l'ancien GAP : une droite de momentum — le tirage de sa variante est GARDÉ (la piste ne bouge pas)
      if(!(level>=8&&rnd()<.22))rnd();
      if(approx<LEN-1000)droiteM();
      else{const l=(100+rnd()*130)*(1+level*.04);courbe(l,-l*(.32+rnd()*.16),sgn()*(24+rnd()*20),3);} // déjà servi (ou pas la place) : courbe de momentum, le rythme ne trébuche pas
    }
    // (route v3, 2026-09-26) le TIRE-BOUCHON et l'ENTRELACS sont partis, comme l'hélice et la spirale : « des structures trop bizarres »
    // RESPIRATION entre motifs : plus RARE et plus COURTE (.6→.42). C'était l'autre raison du
    // « tout se ressemble » : le liant entre deux motifs était TOUJOURS le même bout de droite.
    {const l9=(1.2+rnd()*1.6)*vD*Z,a9=8+rnd()*12;arc(sgn()*a9,l9/(a9*Math.PI/180),4,-(8+rnd()*8)*LV);} /* (2026-11-05, LE DIRECTEUR DE RYTHME) LA RESPIRATION : 1,2-2,8 s de croisière à peine courbées (8-20°) — le souffle entre deux temps forts, jamais 5 s de tout droit */ // (route v3c) 16-36° : la liaison TOURNE // (piste v6/v7) la RESPIRATION est un virage de liaison (60-110 m, 8-22°, 4 points : 35 m sur 2 points faisait un coude)
  }
  // SIGNATURE DE FIN : chaque archétype clôt SA zone par SON geste — la zone se retient
  if(MC){const m=mcTire(),iM9=ctrl.length-1;mcLast=m;{const fn9=FIGF.indexOf(MCJ[m])>=0?tEsses:MCJ[m],fm9=fn9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}} // (2e tour) avec les modules, la zone se clôt par un MODULE (les signatures FLOW, ALPIN… étaient de grandes courbes ou des droites)
  else if(AR.nm==='VOLTIGE'){straight(120,-30,2);}
  else if(AR.nm==='ALPIN'){straight(90,-50);straight(80,26);droiteM();} // ALPIN se clôt sur une droite de momentum avant le portail
  else if(AR.nm==='FLOW'){arc(sgn()*110,220*Math.min(2,LV),6,-160);}
  else if(AR.nm==='TECH'){let sgF=sgn();for(let q=0;q<3;q++){arc(sgF*24,90*RS,2,-26);sgF=-sgF;}}
  else{const sg=sgn();arc(sg*100,170*RS,5,-(100*Math.PI/180*170*RS*.3));} // (route v3) un grand virage de fin, plus la spirale de 420°
  } /* (fin de l'ancienne recette) */
  straight(110*LV,(N2?-10:-66)*LV,2); // ARRIVÉE : ligne droite claire vers le portail
   // (vague 3) en VILLE l'altitude ne vient plus des motifs : un PROGRAMME 40 % descente · 30 % montée · 30 % plat (NUAGES et ORBITE : la pente d'avant, voir `wv`)
  const prot=FIGON?new Uint8Array(ctrl.length):null;if(prot)for(const m of MODMARK)if(m.g)for(let i=m.i0+1;i<=m.i1&&i<ctrl.length;i++)prot[i]=1; // (LA ROUTE LIBRE) la forme des figures n'est pas lissée
  if(sansLoop)adoucirPentes(ctrl,VILLE_PENTE); // (vague 3) la VILLE descend moins raide — AVANT les lissages, qui arrondissent le résultat
  lisserRaccords(ctrl,prot);   // (route v3b) plus de cassure de pente d'un motif à l'autre
  if(ESPON)adoucirPentes(ctrl,ESP_ROUTE.pente,prot); // (2026-09-30) l'ESPACE en houle : les pentes raides comprimées (AVANT les lissages)
  adoucirCretes(ctrl,ESPON?ESP_ROUTE.cretes:1,prot);    // plus de crête AVEUGLE (voir la fonction) — en ESPACE, arrondies 2,5× plus
  if(sansLoop&&LVL.cur.vitre&&VIT_SOL)vitreAplanir(ctrl); // (2026-10-18) LA VILLE VITRÉE AU SOL : la route ne descend plus, des ponts où elle se recroise (voir VIT_SOL)
  if(AMP!==1){const o=ctrl[0].clone(),vu=new Set(),zoom=function(v){if(v&&v.isVector3&&!vu.has(v)){vu.add(v);v.sub(o).multiplyScalar(AMP).add(o);}}; // LE ZOOM, autour du départ : mêmes formes, mêmes pentes, AMP fois plus grandes
    for(const c of ctrl)zoom(c);for(const f of FILETMARK)for(const k in f)zoom(f[k]);}
  return ctrl;
}
/* ===== LE MEILLEUR-DE-N (2026-11-05, LE DIRECTEUR DE RYTHME — voir route-rythme.js) ===== genCtrl dessine N zones sur des flux dérivés d'UN tirage de `rnd` et garde celle
   que rythmeNote préfère (virages/km, pas de droite de 5 s, pas de spirale subie, pas de coude). Le parc et les pistes dessinées n'en tirent qu'une ; `?rythme=0` aussi. */
/* ===== LA ROUTE QUI SE RECOUPE (2026-11-08, Sacha : « dans la ville la route fait parfois une boucle et se superpose de manière très serrée ») =====
   MESURÉ (banc, 80 graines de ville) : 16 routes sur 80 repassaient à moins de 90 m d'elles-mêmes, dans le même sens et à moins de 150 m d'altitude (une hélice, un
   lacet qui se replie sur le précédent). Le meilleur-de-N ne le voyait pas : sa fiche ne regarde que la forme locale. Ce MALUS compte la longueur de route qui a, plus de
   300 m plus loin sur la piste, un morceau PARALLÈLE (cap à 29° près, dans un sens ou l'autre) à moins de 90 m en plan et 150 m en hauteur : 0,03 par mètre. Un croisement franc
   ou un pont à 150 m+ ne coûte rien. Aucun tirage `rnd`. */
function routeRecoupe(ctrl,marks){ /* marks : (2026-11-11, LA DESCENTE DES VILLES) les modules à raccourci (filet, grand saut) ne comptent pas — leur route repasse sous elle-même EXPRÈS */
  const ex=new Uint8Array(ctrl.length);if(marks)for(const m9 of marks)if(m9.fig==='filet'||m9.fig==='grandsaut')for(let i=m9.i0;i<=m9.i1&&i<ctrl.length;i++)ex[i]=1;
  const P=[];let s=0;P.push({x:ctrl[0].x,z:ctrl[0].z,y:ctrl[0].y,s:0,k:0});
  for(let i=1;i<ctrl.length;i++){const a=ctrl[i-1],b=ctrl[i],d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/12));for(let k=1;k<=n;k++){s+=d/n;P.push({x:a.x+(b.x-a.x)*k/n,z:a.z+(b.z-a.z)*k/n,y:a.y+(b.y-a.y)*k/n,s:s,k:i});}}
  const m=P.length;if(m<8)return 0;const H=new Float64Array(m);
  for(let i=0;i<m;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(m-1,i+1)];H[i]=Math.atan2(b.x-a.x,b.z-a.z);}
  const G=new Map(),C=90;
  for(let i=0;i<m;i++){const k=Math.floor(P[i].x/C)*100003+Math.floor(P[i].z/C);let l=G.get(k);if(!l)G.set(k,l=[]);l.push(i);}
  let mal=0;
  for(let i=0;i<m;i++){const p=P[i],cx=Math.floor(p.x/C),cz=Math.floor(p.z/C);let hit=false;
    for(let dx=-1;dx<=1&&!hit;dx++)for(let dz=-1;dz<=1&&!hit;dz++){const l=G.get((cx+dx)*100003+cz+dz);if(!l)continue;
      for(const j of l){if(j<=i||P[j].s-p.s<300)continue;const q=P[j];if(Math.abs(q.y-p.y)>150)continue;if(Math.hypot(q.x-p.x,q.z-p.z)>90)continue;
        let a=Math.abs(H[i]-H[j])%Math.PI;a=Math.min(a,Math.PI-a);if(a<.5){hit=true;break;}}}
    if(hit&&!ex[P[i].k])mal+=12;}
  return mal*.03;
}
function genCtrl(rnd,startPos,startPhi){
  const c=typeof LVL!=='undefined'&&LVL.cur,park=typeof PARK!=='undefined'&&PARK.on,id=c?(c.id==='espace'?'espace':c.id==='ville'?(c.crypto?'crypto':'ville'):'nuages'):'nuages';
  const n=park||!c?1:RYTHME.N;if(n<=1)return genCtrl1(rnd,startPos,startPhi);
  return rythmeMeilleur(rnd,n,id,function(r9){return genCtrl1(r9,startPos,startPhi);},{assez:1,malus:(id==='ville'||id==='crypto')?function(c9){return routeRecoupe(c9,MODMARK);}:null}).ctrl;}
/* ---- LES CRÊTES AVEUGLES (2026-09-25, user : « on va vers le haut puis la route descend, donc on ne voit pas
   devant ») ---------------------------------------------------------------------------------------------------
   Une crête, c'est un point de contrôle où la pente CASSE vers le bas : ça montait (ou c'était plat) et ça plonge.
   La caméra, qui regarde dans l'axe de la caisse, vise alors le ciel : la route qui descend derrière le sommet
   est invisible, on arrive sur la suite à l'aveugle (la « vague verticale », la signature ALPIN, les plongeons
   après un plat). On ABAISSE le sommet juste ce qu'il faut pour que la cassure de pente ne dépasse plus un
   seuil : le plongeon reste un plongeon, mais il commence avant la bosse et on le voit venir.
   Calcul exact : descendre le sommet de dy change la pente d'avant de −dy/h1 et celle d'après de +dy/h2 ;
   dy = excès / (1/h1 + 1/h2) ramène la cassure pile au seuil. Quelques passes (un sommet en dégage un autre).
   ⚠ AUCUN tirage `rnd` : la suite seedée de la piste est intacte (portails, pouvoirs, pièces ne bougent pas).
   ⚠ Un segment quasi vertical (plongeon) n'a pas de pente lisible. */
/* LES RACCORDS ENTRE MOTIFS (route v3b, 2026-09-26, user : « il y a des problèmes de génération de route entre différents modules »).
   Chaque motif pose SA pente (un plongeon à −30 %, puis un grand virage à −12 %, puis une bosse à +40 %…) : au point de jonction la
   pente CASSE d'un coup — une marche dans le ruban, la caisse tape ou décolle sans raison. Trois passes d'un filtre [¼ ½ ¼] sur
   l'altitude seule (le tracé en plan ne bouge pas), pondéré par la longueur des segments. */
function lisserRaccords(P,prot){
  for(let pass=0;pass<3;pass++){const y=P.map(function(p){return p.y;});
    for(let i=1;i<P.length-1;i++){
      if(prot&&prot[i])continue;
      const a=P[i-1],b=P[i],c=P[i+1],h1=Math.max(1,Math.hypot(b.x-a.x,b.z-a.z)),h2=Math.max(1,Math.hypot(c.x-b.x,c.z-b.z));
      const yl=y[i-1]+(y[i+1]-y[i-1])*h1/(h1+h2); // l'altitude qu'aurait une pente CONTINUE à cet endroit
      P[i].y=y[i]*.5+yl*.5;}}
}
function adoucirCretes(P,k,prot){ // k : l'exigence (1 = la règle d'origine ; .4 en ESPACE : une cassure de pente 2,5× plus douce)
  k=k||1;
  for(let pass=0;pass<6;pass++){let bouge=false;
    for(let i=1;i<P.length-1;i++){
      if(prot&&prot[i])continue;
      const a=P[i-1],b=P[i],c=P[i+1],h1=Math.hypot(b.x-a.x,b.z-a.z),h2=Math.hypot(c.x-b.x,c.z-b.z);
      if(h1<4||h2<4)continue;
      const g1=(b.y-a.y)/h1,g2=(c.y-b.y)/h2,seuil=(g1>-.05?.30:.45)*k; // crête franche : 0,30 · lèvre d'une descente qui s'accentue : 0,45
      if(g1-g2>seuil){b.y-=(g1-g2-seuil)/(1/h1+1/h2);bouge=true;}
      else if(g2-g1>.40*k){b.y+=(g2-g1-.40*k)/(1/h1+1/h2);bouge=true;} // (route v3b) le CREUX aussi : un fond de cuvette trop sec, la caisse y tapait
    }
    if(!bouge)break;}
}
