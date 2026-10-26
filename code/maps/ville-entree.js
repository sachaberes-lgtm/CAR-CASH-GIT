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
/* (2026-10-18, 2e tour — Sacha : « pour les 3 villes il y a trop de moments où il faut faire du tout droit ; il faut que ça reste fun et jouable, il faut
   des tout droit mais pas autant ») les poids des motifs des VILLES quand elles ont leurs modules : épingles, esses, chicanes ×1,6-1,8 ; lignes de
   momentum ×0,3, grands balayages ×0,5, plongeons ×0,6 (ce sont eux, des courbes de 200 à 300 m, qu'on prenait pour des droites — banc). */
const VILLE_WM=[1,1,1.8,1.6,.5,1,.6,.3,1.8,.5,.2,1,1]; // (vagues ×0,5 ; le « gap », sans tremplin, une droite de 140-290 m : ×0,2)
/* <<<FIN MODCARTES>>> */
function genCtrl(rnd,startPos,startPhi){
  /* (piste v6, 2026-09-25, user : « les pistes sont trop droites, il n'y a pas assez de virages »). MESURÉ au banc (218 pistes) :
     31 % de la longueur tournait plus serré que R 300 m avec la 1re caisse… et 7 % avec la dernière — c'était la CAISSE qui
     élargissait tout (LV). Or la vitesse vient désormais du MOTEUR : la caisse ne dessine plus la piste (`level` masqué ici),
     c'est la vitesse de croisière du palier moteur qui règle l'échelle (`lvPiste`). Et les respirations ne sont plus des
     droites : de petits virages de liaison. Résultat banc : ~51 % de la piste en virage, plus longue droite 978 → 336 m. */
  const level=0;
  const ctrl=[];
  let P=startPos.clone(),phi=startPhi,approx=0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi));
  const push=()=>ctrl.push(P.clone());
  push();
  const straight=(l,dy=0,n=1)=>{for(let k=0;k<n;k++){P.addScaledVector(dir(),l/n);P.y+=dy/n;push();}approx+=Math.hypot(l,dy);};
  // (piste v6) ≤ 12° par point : le Catmull-Rom tient enfin le cercle déclaré (il l'aplatissait)
  let rPlancher=0; // (2026-10-18, 2e tour) le plancher des rayons quand la map a ses modules (voir MODC_ON) : on serre tout, jamais sous 1,35 × le rayon tenable
  const arc=(aDeg,R,n,dy=0)=>{R=Math.max(R,rPlancher);n=Math.max(n,Math.ceil(Math.abs(aDeg)/12));const a=aDeg*Math.PI/180,st=a/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.addScaledVector(dir(),ch);P.y+=dy/n;phi+=st/2;push();}
    approx+=Math.abs(a)*R;};
  // (route v3c) une « droite » qui n'en est pas une : un arc léger de a° sur l mètres — la piste ne va plus jamais tout droit
  const courbe=(l,dy,aDeg,n)=>{const a=Math.max(4,Math.abs(aDeg)),s9=aDeg<0?-1:1;arc(s9*a,l/(a*Math.PI/180),n||2,dy);};
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
  // TW : (2026-10-18) LES VIRAGES DE COURSE sur la route tordue des nuages
  const W=((ESPON?AR.wv.map(function(v,k){return v*(MC?ESP_ROUTE.wm:ESP_ROUTE.w)[k];}):AR.w)).map(v=>v*(0.35+rnd()*1.7)).map(function(v,k){return TW?v*TORD_W[k]:v;}).map(function(v,k){return MC&&!ESPON?v*VILLE_WM[k]:v;}); // (vague 3) la VILLE a ses poids à grands virages (voir `wv`) · (2026-10-18) la route tordue, les siens (TORD_W) — même nombre de tirages
  const wsum=W.reduce((a,b)=>a+b,0);
  const pick=()=>{let x=rnd()*wsum;for(let k=0;k<13;k++){x-=W[k];if(x<0)return k;}return 5;};
  const AMP=TORDU?TORD_AMP:1; // (2026-10-15) LA ROUTE SANS HAUT NI BAS EN GRAND : la zone est tirée AMP fois plus courte, puis tout est agrandi AMP fois (voir TORD_AMP)
  const LC9=longueurCible(),LEN=LC9?Math.max(1500,LC9-220*LV-260)/AMP:14400*(1+Math.min(1.5,(LV-1)*.55))/AMP; // (LA DURÉE DES MAPS, 2026-10-18) au JOUER : la longueur visée, moins le départ et l'arrivée posés hors de la boucle // (2026-09-25, user : « double la longueur de chaque niveau ») 7200 → 14400 — et plus longues encore à haute vitesse
  // ---- LE VIRAGE À FILET (voir FILET) : NUAGES seulement ; son hasard a SON générateur (un seul tirage de `rnd`, et seulement ici) ----
  FILETMARK.length=0;MODMARK.length=0;
  const FILON=FILET.on&&typeof LVL!=='undefined'&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!LVL.cur.piste&&!(typeof PARK!=='undefined'&&PARK.on);
  const rfS=FILON||MC?(rnd()*4294967296)>>>0:0,rf=FILON||MC?mulberry32(rfS):null; // (2026-10-18) les MODULES DE CHAQUE MAP tirent aussi dans `rf` (un seul `rnd` de plus, seulement sur leurs maps)
  const rh=MC&&VILLE_HASARD?mulberry32((rfS^0x7A1EA5ED)>>>0):null; // (2026-10-20, LES VILLES AU HASARD) le hasard du TRACÉ, à part (voir VILLE_HASARD)
  const kMC=rh?.75+rh()*.6:1;if(rh)phi+=(rh()*2-1)*Math.PI; // la cadence des modules · L'AXE : le cap du départ, sur tout le cercle
  /* LE PLAN DE LA PISTE (VILLE_HASARD) : 'axe' — la piste file vers l'axe tiré, son cap borné à ±capB (quand elle s'en écarte, les virages penchent du
     côté qui la ramène) : une longue traversée ; 'libre' — comme avant ; 'boucle' — une latéralité franche : elle s'enroule (la spirale de la ville).
     Il ne fait que PENCHER le seuil des tirages de côté (sgn, et le côté des modules qui suivaient `hand`) : aucun tirage de plus. */
  const PLN=rh?(function(u){return u<.42?'axe':u<.7?'libre':'boucle';})(rh()):null,capB=rh?(40+rh()*60)*Math.PI/180:0,hB=rh&&rh()<.5?-1:1,phiAx=phi;
  const thrH=(b,a9)=>{if(!PLN||PLN==='libre')return b;if(PLN==='boucle')return Math.min(.92,Math.max(.08,b+hB*.3));
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
  const modPaq=[];let modNext=1000*LV,modLast=-1;
  const modTire=()=>{for(let e=0;e<12;e++){if(!modPaq.length){const t=[0,1,2,3,4].concat(MODT&&FIGON?[5,6,7,8,9,5,9]:[]); /* le looping (5) et le puits (9) comptent double : ce sont LES raccourcis */for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)modPaq.push(x);}
    const m=modPaq.shift();if(m===modLast||(m===0&&filN>=filMax)||(m>=5&&modLast>=5))continue;return m;}return 3;};
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
  rPlancher=MC?1.35*rP:0; // (2e tour) voir arc()
  const tSlalom=()=>{const n=5+((rf()*3)|0),R=(1.9+rf()*.5)*rP;let sg=rf()<thrH(.5)?1:-1;straight(70*LV*Z,-4*LV*Z,1);
    for(let k=0;k<n;k++){const a=38+rf()*14;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);sg=-sg;}straight(70*LV*Z,-4*LV*Z,1);};
  const tEpingle=()=>{const sg=rf()<thrH(.5+hand*.22,175)?1:-1,R=(1.7+rf()*.3)*rP,a=165+rf()*20;straight(150*LV*Z,-6*LV*Z,2);
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
    courbe(L1,L1*(.17+rf()*.05),sg*(40+rf()*12),4);courbe(40*LV,1.5*LV,sg*6,2);courbe(L2,-L2*(.26+rf()*.04),-sg*(16+rf()*8),4); /* le pump TOURNE (35-47°), le dump reste presque droit : c'est là qu'on se pose */straight(90*LV,-5*LV,2);};
  const mDents=()=>{const n=4+(rf()<.5?1:0),R=(2+rf()*.5)*rP;let sg=rf()<thrH(.5)?1:-1;straight(70*LV,-3*LV,1);
    for(let k=0;k<n;k++){const a=40+rf()*20,l=a/57.3*R;arc(sg*a,R,Math.ceil(a/10),k%2?-l*(.2+rf()*.06):l*(.12+rf()*.06));sg=-sg;}straight(80*LV,-4*LV,1);};
  const mTour=()=>{const sg=rf()<thrH(.5+hand*.22,320)?1:-1,R=(2+rf()*.4)*rP,a=300+rf()*40;straight(120*LV,0,2);arc(sg*a,R,Math.ceil(a/10),0);straight(160*LV,0,2);};
  const mFronde=()=>{const sg=rf()<thrH(.5+hand*.22,230)?1:-1,R=(1.9+rf()*.5)*rP,a=200+rf()*60;straight(90*LV,-4*LV,2);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.04);straight(150*LV,-6*LV,2);};
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
    const sg=rf()<.5?1:-1,R=Math.max(3.1*rP,.9*vD)*(.9+rf()*.3),Tt=vD*kT*(6.2+rf()*1.6),ra=rf()<.5?1:-1,a1=14+rf()*14;
    fS(100*LVf,-3*LVf,1);const ia=ctrl.length-1;
    fS(.2*Tt,-2*LVf,2);fA(sg*a1,R);fS(.3*Tt,-2*LVf,3);fA(-sg*a1*.9,R);fS(.2*Tt,-2*LVf,2);
    const ib=ctrl.length-1;fS(110*LVf,-3*LVf,1);
    return {g:1,fig:'tonneau',f:[[ia,ib,ra*2*Math.PI]]};};
  const fEnvers=function(){
    const sg=rf()<.5?1:-1,R=(1.9+rf()*.5)*rP,nE=kT<.7?2:3+(rf()<.5?1:0),ra=rf()<.5?1:-1,rb=rf()<.5?1:-1;let sj=sg;
    fS(80*LVf,-3*LVf,1);const ia=ctrl.length-1;fS(vD*2.8*kT,-3*LVf,3);const ib=ctrl.length-1;
    for(let k=0;k<nE;k++){fA(sj*(50+rf()*22),R,0,-3*LVf);sj=-sj;if(k<nE-1)fS(40*LVf,0,1);}
    const ic=ctrl.length-1;fS(vD*2.8*kT,-3*LVf,3);const id=ctrl.length-1;fS(80*LVf,-3*LVf,1);
    return {g:1,fig:'envers',f:[[ia,ib,ra*Math.PI],[ic,id,rb*Math.PI]]};};
  const fMur=function(){
    const sg=rf()<.5?1:-1,R=Math.max(2.6*rP,.8*vD)*(.9+rf()*.3),a=95+rf()*45;
    fS(70*LVf,-3*LVf,1);const ia=ctrl.length-1;fS(vD*3*kT,-2*LVf,3);const ib=ctrl.length-1;
    fA(sg*a,R,0,-a/57.3*R*.04);const ic=ctrl.length-1;fS(vD*3*kT,-2*LVf,3);const id=ctrl.length-1;fS(70*LVf,-3*LVf,1);
    return {g:1,fig:'mur',f:[[ia,ib,-sg*Math.PI/2],[ic,id,sg*Math.PI/2]]};};
  const PUITS_D=function(Rh){const o=window.dbgPuits||{};return o.D!=null?o.D:56;}; // (m par tour) calé au banc raccourcis — voir outils/banc-routes/raccourcis.cjs · `window.dbgPuits={D,R}` : le banc balaie D et le rayon
  const fPuits=function(){
    const sg=rf()<.5+hand*.22?1:-1,Rh=(window.dbgPuits&&window.dbgPuits.R||1)*Math.max(2.2*rP,1.5*vD),th=420+rf()*60,D=PUITS_D(Rh);
    if(8*Rh*Z>LEN*.42)return tEsses(); // la map est trop courte pour un puits de cette taille : une route ordinaire
    fS(110*LVf,-4*LVf,1);
    fA(sg*40,Rh*1.7,0,-D*40/360);fA(sg*(th-80),Rh,0,-D*(th-80)/360);fA(sg*40,Rh*1.7,0,-D*40/360); // entrée et sortie en douceur : le rayon se resserre vers le puits
    fS(130*LVf,-4*LVf,1);
    return {g:1,fig:'puits'};};
  const FIGF=FIGON?[fBoucle,fTonneau,fEnvers,fMur,fPuits]:[];
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
  const mParking=()=>{const sg=rf()<thrH(.5+hand*.22,430)?1:-1,R=(1.8+rf()*.3)*rP,a=400+rf()*60;straight(70*LV,-3*LV,1);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.09);straight(110*LV,-4*LV,2);};
  const mEscalier=()=>{const n=3+(rf()<.5?1:0);let sg=rf()<thrH(.5)?1:-1;straight(50*LV,-2*LV,1);
    for(let k=0;k<n;k++){const l=(60+rf()*25)*LV;courbe(l,l*(.12+rf()*.03),sg*(10+rf()*8),2);courbe((55+rf()*30)*LV,-1*LV,-sg*(8+rf()*6),2);sg=-sg;}
    {const l=(170+rf()*50)*LV;courbe(l,-l*(.24+rf()*.04),sg*(18+rf()*10),4);}straight(70*LV,-3*LV,1);};
  const mKrach=()=>{const sg=rf()<thrH(.5)?1:-1,L1=(130+rf()*40)*LV,L2=(120+rf()*30)*LV;straight(50*LV,-2*LV,1);
    courbe(L1,-L1*(.19+rf()*.03),sg*(20+rf()*10),4);courbe(40*LV,-1*LV,sg*6,2);courbe(L2,L2*(.14+rf()*.03),-sg*(20+rf()*10),4);straight(70*LV,-3*LV,1);};
  const mTrombone=()=>{const sg=rf()<thrH(.5+hand*.22)?1:-1,R=(1.8+rf()*.3)*rP;straight(80*LV,0,1);arc(sg*(170+rf()*15),R,18,0);straight((100+rf()*60)*LV,0,2);arc(-sg*(170+rf()*15),R,18,0);straight(100*LV,0,2);};
  const mDebris=()=>{const n=6+((rf()*3)|0),R=(1.8+rf()*.4)*rP;let sg=rf()<thrH(.5)?1:-1;straight(60*LV,-3*LV,1);
    for(let k=0;k<n;k++){const a=22+rf()*12;arc(sg*a,R,Math.ceil(a/10),(k%2?-7:7)*LV);sg=-sg;}straight(80*LV,-4*LV,1);};
  const mTransfert=()=>{const sg=rf()<thrH(.5+hand*.22,250)?1:-1,R=(2+rf()*.5)*rP,h=(18+rf()*8)*LV;straight(70*LV,-3*LV,1);
    {const a=110+rf()*30;arc(sg*a,R,Math.ceil(a/10),h);}straight((60+rf()*40)*LV,-h*.4,1);{const a=110+rf()*30;arc(sg*a,R,Math.ceil(a/10),-h*.9);}straight(90*LV,-4*LV,1);};
  const VMOD=VILLE_MODULES; // (`?sans=villemodules` : les paquets d'avant)
  const MCJ=!MC?null:MC==='crypto'?[mBougie,mDents,tSlalom,tEpingle].concat(VMOD?[mEscalier,mKrach]:[]):MC==='vitree'?[mTour,mAngles,tSlalom,tEsses].concat(VMOD?[mCarrefourS,mTrombone,tCorde]:[]):MC==='espace'?[mFronde,mHoule,tSlalom,tCorde,tEsses].concat(VMOD?[mDebris,mTransfert]:[],FIGF,FIGON?[fBoucle,fPuits]:[]):[mAngles,mBretelle,tSlalom,tCorde].concat(VMOD?[mCarrefourS,mPont,mParking]:[]);
  const mcPaq=[];let mcLast=-1,mcNext=Math.max(Math.min(700*LV,LEN*.15),FIGON?Math.max(450,1.8*vD)+90:0); // (LA DURÉE DES MAPS) une map courte garde au moins un module
  const mcTire=()=>{for(let e=0;e<8;e++){if(!mcPaq.length){const t=MCJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)mcPaq.push(x);}
    const m=mcPaq.shift();if(m===mcLast||(FIGF.indexOf(MCJ[m])>=0&&FIGF.indexOf(MCJ[mcLast])>=0))continue;return m;}return 0;};
  const filet=()=>{
    const sg=rf()<thrH(.5+hand*.22)?1:-1,R=(95+rf()*45)*RS,th=(55+rf()*20)*Math.PI/180,Re=R+ROAD_HALF;
    const vN=FILET.kv*(70+(LV-1)*100),g=FALL_G*SPD,k0=FILET.kick,iM0=ctrl.length-1; // iM0 : début du module (MODMARK)
    straight(70*LV,-10*LV,2); // l'APPROCHE : droite et lisible — le virage et son filet se voient venir
    const A=P.clone(),ph0=phi,yA=P.y,pC=.04+rf()*.03,dropC=th*R*pC; // un virage PRESQUE PLAT : sa pente part avec la caisse (vy = −v·pente) — à 780 km/h, 12 % de pente jetaient la caisse 44 m sous le filet (mesuré)
    const C=new THREE.Vector3(A.x+sg*R*Math.cos(ph0),0,A.z-sg*R*Math.sin(ph0));
    const at=(ps,r,y)=>P.set(C.x-sg*Math.cos(ph0+sg*ps)*r,y,C.z+sg*Math.sin(ph0+sg*ps)*r); // le point à l'angle parcouru ps, au rayon r
    const pose=f=>{const fc=Math.min(1,Math.max(0,f)),dh=FILET.dh+FILET.dhS*fc,b=vN*pC-k0,t=(-b+Math.sqrt(b*b+2*g*dh))/g,x=vN*t; // ½g·t² + (v·pente − kick)·t = dh
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
    if(MC)courbe(E9.rampe*LV,-E9.chute*LV,(rf()<thrH(.5)?1:-1)*(48+rf()*14),6);else // (2e tour) avec les modules, la grande rampe plonge EN VIRAGE (48-62°)
    straight(E9.rampe*LV,-E9.chute*LV,6);VILLE_ENTREE={pA:ctrl[iA9],pB:ctrl[ctrl.length-1]}; // (les points eux-mêmes : les adoucissements les déplacent, la ville lit leur place FINALE)
  }else straight(110*LV,-70*LV,2); // DÉPART : ligne droite, rallongée avec la vitesse (était 170 m + la caisse)
  if(MODT)modNext=Math.max(Math.min((FIGON?300:900)*LV*Z,LEN*(FIGON?.08:.18)),FIGON?(Math.max(450,1.8*vD)+90)/AMP:0); // (ROUTE LIBRE) pas avant la fin du départ tenu de pisteTord : une figure y serait perdue // (LA DURÉE DES MAPS) une map courte garde au moins un module // (2026-10-18) le 1er module de course ~900 m après le départ (VRAIS mètres : la zone est tirée au 1/AMP)
  if(FIGON&&MODT&&approx<modNext)straight(modNext-approx,-2*LV,2); // (ROUTE LIBRE) le départ tenu rejoint le 1er module : pas un motif de plus, qui à haut palier prend 1 à 3 km
  if(FIGON&&MC&&approx<mcNext)straight(mcNext-approx,-2*LV,2);
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
      const sg=sgn(),R9=(ESPON?(MC?85+rnd()*70:160+rnd()*160):110+rnd()*90)*RS, /* (2026-10-18, MODULES DE CHAQUE MAP) en orbite un cran plus serré : à 160-320 il se prenait comme une droite */ a9=Math.min(100+rnd()*60,(ESPON?64000:52000)/R9); // (2026-09-30) l'ESPACE a les rayons de la ville // (vague 3) plus LARGE en VILLE : R 160-320 (ailleurs 110-200)
      arc(sg*a9,R9,Math.max(5,Math.round(a9/14)),-(a9*Math.PI/180*R9*(.12+rnd()*.12)));
    }else if(mo===0||mo===1||mo===11||mo===12){ // (route v3) le motif looping et les motifs retirés : un GRAND VIRAGE
      const sg=sgn(),R2=(80+rnd()*120)*RS,a2=Math.min(45+rnd()*65,46000/R2);
      arc(sg*a2,R2,3,-(a2*Math.PI/180*R2*(.35+rnd()*.3)));
    }else if(mo===2){ // épingle OUVERTE — s'évase avec le niveau (praticable à toute vitesse)
      const sg=sgn();
      straight(25+rnd()*40,-25);
      arc(sg*180/Math.max(1,Math.sqrt(LV*.7)),(55+rnd()*50)*RS,5,-(24+rnd()*26));
      straight(25+rnd()*40,-25);
    }else if(mo===3){ // esses amples
      const nS=1+Math.floor(rnd()*3),a=Math.max(MC?40:0,25+rnd()*45),R=(80+rnd()*100)*RS; // (2e tour) avec les modules, des esses d'au moins 40°
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
      const sg=sgn(),R2=(ESPON?(MC?85+rnd()*95:130+rnd()*190):80+rnd()*120)*RS, /* (2026-10-18) idem */ a2=Math.min(45+rnd()*65,(ESPON?56000:46000)/R2); // (vague 3, « plus de virages larges ») R 130-320 en VILLE (ailleurs 80-200)
      arc(sg*a2,R2,3,-(a2*Math.PI/180*R2*(.6+rnd()*.5)));
    }else if(mo===6){ // plongeon — (route v3) franc mais jamais vertical : pente bornée à ~30°
      {const l6=60+rnd()*80;courbe(l6,-l6*Math.min(.58,(.28+rnd()*.2)*VT),sgn()*(10+rnd()*10));}
      const sg=sgn(),a3=25+rnd()*50,R3=(90+rnd()*80)*RS;
      arc(sg*a3,R3,2,-(a3*Math.PI/180*R3*.8));
    }else if(mo===7){ // ligne de momentum (zone de vitesse, pente douce)
      const l=(90+rnd()*100)*LV;
      {const a7=20+rnd()*20;arc(sgn()*a7,l/(a7*Math.PI/180),3,-l*(.32+rnd()*.16));} // (piste v6) la ligne de momentum se CINTRE — (route v3) pente ≤ ~26° au lieu du toboggan à 45°
    }else if(mo===8){ // chicane rapide : gauche-droite-gauche à pleine vitesse
      const n8=3+Math.floor(rnd()*3),a8=(TW?26:16)+rnd()*14,R8=(70+rnd()*90)*RS;let sg8=sgn(); // (2026-10-18) sur la route tordue, des coups de volant francs (26-40°)
      for(let q=0;q<n8;q++){arc(sg8*a8,R8,2,-(a8*Math.PI/180*R8*.5));sg8=-sg8;}
    }else if(mo===10){ // (route v3) l'ancien GAP : une droite de momentum — le tirage de sa variante est GARDÉ (la piste ne bouge pas)
      if(!(level>=8&&rnd()<.22))rnd();
      if(approx<LEN-1000)droiteM();
      else{const l=(100+rnd()*130)*(1+level*.04);courbe(l,-l*(.32+rnd()*.16),sgn()*(24+rnd()*20),3);} // déjà servi (ou pas la place) : courbe de momentum, le rythme ne trébuche pas
    }
    // (route v3, 2026-09-26) le TIRE-BOUCHON et l'ENTRELACS sont partis, comme l'hélice et la spirale : « des structures trop bizarres »
    // RESPIRATION entre motifs : plus RARE et plus COURTE (.6→.42). C'était l'autre raison du
    // « tout se ressemble » : le liant entre deux motifs était TOUJOURS le même bout de droite.
    straight(0,0,0);{const l9=(50+rnd()*40)*LV,a9=16+rnd()*20;arc(sgn()*a9,l9/(a9*Math.PI/180),4,-(8+rnd()*8)*LV);} // (route v3c) 16-36° : la liaison TOURNE // (piste v6/v7) la RESPIRATION est un virage de liaison (60-110 m, 8-22°, 4 points : 35 m sur 2 points faisait un coude)
  }
  // SIGNATURE DE FIN : chaque archétype clôt SA zone par SON geste — la zone se retient
  if(MC){const m=mcTire(),iM9=ctrl.length-1;mcLast=m;{const fn9=FIGF.indexOf(MCJ[m])>=0?tEsses:MCJ[m],fm9=fn9();MODMARK.push(Object.assign({i0:iM9,i1:ctrl.length-1},fm9||{}));}} // (2e tour) avec les modules, la zone se clôt par un MODULE (les signatures FLOW, ALPIN… étaient de grandes courbes ou des droites)
  else if(AR.nm==='VOLTIGE'){straight(120,-30,2);}
  else if(AR.nm==='ALPIN'){straight(90,-50);straight(80,26);droiteM();} // ALPIN se clôt sur une droite de momentum avant le portail
  else if(AR.nm==='FLOW'){arc(sgn()*110,220*Math.min(2,LV),6,-160);}
  else if(AR.nm==='TECH'){let sgF=sgn();for(let q=0;q<3;q++){arc(sgF*24,90*RS,2,-26);sgF=-sgF;}}
  else{const sg=sgn();arc(sg*100,170*RS,5,-(100*Math.PI/180*170*RS*.3));} // (route v3) un grand virage de fin, plus la spirale de 420°
  straight(110*LV,-66*LV,2); // ARRIVÉE : ligne droite claire vers le portail
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
/* ================= LE BITUME v2 (2026-09-25) =================
   User : « retravaille complètement les shaders, j'aime pas cette tache rose sur la route ». MESURÉ en rendu, source par
   source (inventaire : scratchpad/lumieres.md) : la grosse tache rose à cœur blanc derrière la caisse était le reflet de
   `carLight` (la lumière d'appoint de la carrosserie) sur un bitume au spéculaire SAUMON 0x8a524a et au lobe ÉNORME
   (shininess 40 : ±10° de demi-vecteur) ; la grande nappe magenta, le même lobe sous la directionnelle `kick` du biome ;
   le bloom, le WB magenta et le split-tone rosé finissaient le travail. Le bitume change donc de nature :
     · un vrai GRAIN d'asphalte (texture cuite une fois, granulats clairs) qui module le diffus ET le spéculaire : les reflets
       deviennent un scintillement de matière, plus jamais une flaque ;
     · un spéculaire FROID et SOMBRE, plus serré (0x2c2a3a, shininess 80) : chaque lumière garde sa couleur, en petit ;
     · une BRILLANCE D'HORIZON (fresnel) à la couleur du brouillard : la route luit vers le lointain, elle se lit ;
     · une CLARTÉ PAR NIVEAU (`uLift`) : la VILLE a un bitume plus clair, qui se détache de la ville sombre (user).
   Les uniformes vivent dans ROAD_U, PARTAGÉS par toutes les pistes : routeTick() les écrit une fois par image. */
const BETON={col:0xa39c8e,t:[1,1,1],lift0:.012,lift:.13,amb:.22,sheen:0,mouille:.24,ville:1,espace:1}; /* (2026-10-14, passe graphismes) LE BÉTON BRUT, ses réglages : col = le gris minéral de la matière · t = teinte globale · lift0/lift = la clarté de niveau (neutre, × LVL.route) · amb = la part de l'air du lieu (la brume) dans cette clarté · sheen = brillance d'horizon À SEC (0 : mat) · mouille = ce que la pluie fonce · ville/espace = teinte par monde — voir routeTick, dbgBeton */
const ROAD_U={uLift:{value:new THREE.Color(0,0,0)},uSheen:{value:.1},uSheenCol:{value:new THREE.Color(.4,.3,.5)},uWet:{value:0},uAcc:{value:new THREE.Color(0xf24aa0)},uVil:{value:0},uEcl:{value:0},
  uGlace:{value:0},uSunW:{value:SUN_DIR},uTeinte:{value:new THREE.Color(1,1,1)},uBmM:{value:new THREE.Vector3(1,.28,.66)}}; // (2026-10-16) uBmM : le MAGENTA des enseignes que renvoient les flaques (bmCol) — remappé dans une ville teintée (VTEINTES) // (passe graphismes mobile) uGlace/uSunW : le BITUME GLACÉ des routes sèches (voir roadMat) — la direction du soleil est SUN_DIR lui-même (même objet) // uWet/uAcc : le bitume MOUILLÉ de la ville (voir BITUME_MOUILLE)
/* ================= LE BÉTON BRUT (2026-10-14, passe graphismes) — Sacha : « retravaille la texture de la route pour que ça soit un beau béton bien brut et bien, bien mat » =====
   GRATUIT pour la puce : la MÊME texture 256² (même lecture, même shader), REPEINTE en béton — granulat serré, laitance et coulures en paliers nets, micro-fissures, bullage,
   et les JOINTS DE DALLE sur les bords de la tuile. ASPH_K 1,7 → .57 : une tuile = une dalle de 7 m (la route de 56 m = 8 dalles pile, un joint sous la ligne centrale). */
function betonPeint(N){ // PUR (aucun canvas) : les octets RGBA d'une tuile N×N de BÉTON BRUT qui se raccorde sur ses 4 bords — une tuile = UNE DALLE de 7 m (voir ASPH_K) ; rejoué tel quel par gfx/banc/route-beton/apercu.cjs
  const d=new Uint8ClampedArray(N*N*4);let sd=20261014;
  const r=function(){sd=(sd*16807)%2147483647;return sd/2147483647;};
  const grille=function(px,py){const g=new Float32Array(px*py);for(let i=0;i<g.length;i++)g[i]=r();return {g:g,px:px,py:py};}; // bruit de valeur BOUCLÉ
  const lit=function(G,u,v){const x=u*G.px,y=v*G.py,xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    const x0=xi%G.px,x1=(xi+1)%G.px,y0=(yi%G.py)*G.px,y1=((yi+1)%G.py)*G.px,g=G.g;
    return (g[y0+x0]*(1-fx)+g[y0+x1]*fx)*(1-fy)+(g[y1+x0]*(1-fx)+g[y1+x1]*fx)*fy;};
  // LA LAITANCE (nuages de ciment, 3 échelles) et LES COULURES (étirées dans le sens de la route : elles ne scintillent pas quand on file), en PALIERS nets (pas un flou de photo)
  const A=grille(3,3),B=grille(7,7),C=grille(15,15),S1=grille(34,2),S2=grille(90,4),S3=grille(18,1),W=grille(2,2),V=new Float32Array(N*N);let mn=9,mx=-9;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5)/N,v=(y+.5)/N,
      w=.60*(.50*lit(A,u,v)+.32*lit(B,u,v)+.18*lit(C,u,v))+.40*(.45*lit(S1,u,v)+.20*lit(S2,u,v)+.35*lit(S3,u,v));
    V[y*N+x]=w;if(w<mn)mn=w;if(w>mx)mx=w;}
  let mV=0;for(let i=0;i<V.length;i++){const w=Math.round((V[i]-mn)/(mx-mn)*7)/7;V[i]=w;mV+=w;}mV/=V.length; // 8 paliers
  // LES MICRO-FISSURES (marches au hasard, un texel de large, qui bifurquent) et LE BULLAGE (trous d'air en grappes)
  const F=new Float32Array(N*N),pose=function(x,y,a){x=((Math.floor(x)%N)+N)%N;y=((Math.floor(y)%N)+N)%N;const k=y*N+x;if(a>F[k])F[k]=a;};
  const fis=[];for(let f=0;f<3;f++)fis.push([r()*N,r()*N,r()*6.283,50+r()*90,.55+r()*.4]);
  while(fis.length){const f=fis.pop();let x=f[0],y=f[1],th=f[2];const len=f[3],a=f[4];
    for(let s=0;s<len;s++){th+=(r()-.5)*.55;if(r()<.03)th+=(r()-.5)*2.;x+=Math.cos(th);y+=Math.sin(th);
      pose(x,y,a*Math.min(1,s/8,(len-s)/8)*(.7+.3*r()));if(len>60&&r()<.012)fis.push([x,y,th+(r()<.5?1:-1)*(.6+r()*.7),18+r()*len*.4,a*.8]);}}
  for(let c=0;c<12;c++){const cx=r()*N,cy=r()*N,n=3+Math.floor(r()*8),R0=4+r()*16;
    for(let i=0;i<n;i++){const an=r()*6.283,q=r()*R0;pose(cx+Math.cos(an)*q,cy+Math.sin(an)*q,.4+r()*.5);}}
  // LES JOINTS DE DALLE, sur les bords de la tuile (ils se raccordent avec la tuile voisine) : le joint EN LONG (franc : il file vers l'horizon sans jamais clignoter)
  // et le joint EN TRAVERS (plus discret : c'est lui qui défile) ; une arête claire d'un côté (le chanfrein prend la lumière), la salissure qui s'accumule autour
  const JL=.36,JT=.22,jd=function(p){return Math.min(p,N-1-p);}; // p : distance (texels) au bord ; joint = 2 texels à cheval sur le raccord
  for(let i=0;i<N*N;i++){const x=i%N,y=(i-x)/N,o=i*4,u=(x+.5)/N,v=(y+.5)/N;
    let g=(r()-.5)*.20;const q=r();if(q<.045)g+=.10+r()*.10;else if(q<.075)g-=.20; // LE GRANULAT : grain serré, granulats clairs, petits trous
    let b=1+g+(V[i]-mV)*.30-F[i]*.34;
    const dx=jd(x),dy=jd(y);
    b*=1-.07*Math.max(Math.max(0,1-dx/9),Math.max(0,1-dy/9)*.7);                 // la salissure autour des joints
    if(x===1||x===N-2)b+=.05;if(y===1||y===N-2)b+=.03;                           // l'arête du chanfrein
    if(dx<1)b*=1-JL;else if(dy<1)b*=1-JT;                                        // le joint (2 texels ≈ 5,5 cm)
    const t=lit(W,u,v)-.5,k=204*b;                                               // la teinte : un rien plus chaude ou plus froide par grandes plages (gris minéral, jamais coloré)
    d[o]=k*(1+t*.035);d[o+1]=k;d[o+2]=k*(1-t*.05);d[o+3]=255;}
  return d;
} // fin betonPeint
let ASPH_TEX=null;const ASPH_K=.57; // (2026-10-14, passe graphismes) une tuile = une DALLE de 7 m (4 ÷ .57) — (vague 2) c'était 1,7 : la finesse du grain d'asphalte
function asphTex(){ if(ASPH_TEX)return ASPH_TEX;
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const c=cv.getContext('2d'),im=c.createImageData(N,N);im.data.set(betonPeint(N));
  c.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=Math.min(ALLEGE?4:8,renderer.capabilities.getMaxAnisotropy()); // la route se regarde RASANTE : sans anisotropie le grain devient une bouillie
  return (ASPH_TEX=t);
}
/* (2026-09-26, audit rendu) LES LUMIÈRES PONCTUELLES NE TOUCHENT QUE LA CAISSE. r128 fait tourner la boucle de CHAQUE PointLight dans
   CHAQUE pixel Phong — même à intensité 0 — et le bitume couvre la moitié de l'écran : ~20 % du GPU mesuré, pour dessiner… les taches
   rondes du verdict (carLight, nitroLight, portail). Le bloc des lumières ponctuelles est retiré du chunk pour la route et les nuages ;
   les phares (SpotLight), le soleil et l'hémisphère restent. ⚠ r128 remplace NUM_POINT_LIGHTS par sa valeur dans le texte du shader :
   on ne peut pas le redéfinir, on retire donc la boucle elle-même. */
const LFB_SANS_PL=THREE.ShaderChunk.lights_fragment_begin.replace(/#if \( NUM_POINT_LIGHTS > 0 \) && defined\( RE_Direct \)[\s\S]*?#pragma unroll_loop_end\s*#endif/,'');
/* LE BITUME NE CALCULE QUE CE QUI SE VOIT (2026-09-27, passe perf iPhone, tour 2 — « le bitume, les néons et les ombres »). MESURÉ au banc
   logiciel (SwiftShader : le temps y suit le travail par pixel ; piste seule à l'écran, image figée, A/B alternés) : le bitume coûtait ~285 ms
   sur ~600, et sa face CACHÉE autant que la face vue (dessus seul 172 ms, dessous seul 174 ms, les deux 310) — la dalle est dessinée en
   DoubleSide, dessus et dessous dans le même maillage, et chaque tranche peignait les deux faces. Deux économies, image identique :
     · LA FACE CACHÉE N'EST PLUS DESSINÉE (`BITUME.face`) : la dalle est un solide FERMÉ (dessus, dessous, flancs, bords du vide en rouge),
       une face vue de dos est donc toujours derrière une face vue de face. Le bloc du DESSOUS est retourné (sens des triangles inversé,
       normales et couleurs NIÉES — le signe de la couleur porte l'orientation) et la matière passe en FrontSide : le GPU jette la face de
       dos avant de la tramer, ~la moitié des triangles du bitume, y compris dans les loopings et les dalles qui vrillent (le test est
       par TRIANGLE, gratuit). Le shader du dessous reçoit exactement ce qu'il recevait : la normale retournée par `faceDirection` y
       arrivait déjà niée (−n interpolé = −(n interpolé), au bit près), la couleur est relue en valeur absolue, et le décalage d'ombre
       (`normalBias`, calculé au SOMMET avec la normale non retournée) reprend son signe d'origine.
     · LES LUMIÈRES QUI N'ÉCLAIRENT PAS NE SE CALCULENT PAS (`LFB_ROUTE`) : r128 évalue le Blinn-Phong complet (deux normalisations, une
       puissance, un Schlick) de chaque lumière, même quand elle vaut ZÉRO ici — le phare hors de son cône (presque tout l'écran), le fill
       bleu qui vient d'EN DESSOUS sur la face du dessus, le soleil sur une face qui lui tourne le dos (et son ombre : 16 lectures de carte).
       Un `if` exact : hors du cône la couleur vaut 0, dos à la lumière le cosinus vaut 0 — l'apport sautée était 0 × quelque chose.
   `dbgBitume(face,sauts)` : l'ancien bitume (DoubleSide, toutes les lumières) sur la piste en cours, pour comparer au pixel et au banc. */
const BITUME={face:true,sauts:true};
const LFB_ROUTE=(function(){
  const sp=/(getSpotDirectLightIrradiance\( spotLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        di=/(getDirectionalDirectLightIrradiance\( directionalLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/;
  const t=LFB_SANS_PL.replace(sp,'$1\n\t\tif ( directLight.visible && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}')
    .replace(di,'$1\n\t\tif ( dot( geometry.normal, directLight.direction ) > 0.0 && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}');
  if(!sp.test(LFB_SANS_PL)||!di.test(LFB_SANS_PL)){console.warn('CASH CAR : lumières du bitume non greffées (chunk inattendu)');return LFB_SANS_PL;}
  return t;})();
/* ===================== LES LUMIÈRES DE LA CAISSE v2 (2026-10-17, session « Système d'éclairage » — Sacha : « on retravaille complètement comment les
   lumières fonctionnent : les flammes de nitro doivent faire de la lumière, les feux arrière doivent faire de la lumière quand il fait nuit, sur la route ;
   on retravaille comment les phares fonctionnent, comment la lumière des feux arrière se reflète dans le pare-brise arrière ; il faut que la lumière marche
   très bien, que ce soit parfait — optimisé quand même, pas de ray tracing : magnifique, mais compréhensible pour un iPhone ») =====================
   L'ancien éclairage de la caisse sur la route : UN projecteur three (headSpot) au milieu du capot, une NAPPE PEINTE plate (CARPOOL.head, le trapèze blanc
   qu'on voit devant la caisse la nuit) — et RIEN derrière : la flaque rouge des feux et le halo nitro, des plans additifs, faisaient des « taches rondes »
   (verdict du 25-26/09) et avaient été retirés. Les PointLights ne touchent plus le bitume depuis le 26/09 (LFB_SANS_PL : ~20 % du GPU).
   LA RECETTE NEUVE : les lumières de la caisse sont CALCULÉES DANS LE SHADER DU BITUME, en quelques lignes, sans aucune lumière three de plus :
     · LES PHARES (`uHl*`) : deux lampes, chacune un vrai faisceau de croisement — un éventail large, une COUPURE nette à l'horizon de la lampe, un point
       chaud juste dessous qui porte loin, l'inverse du carré de la distance et le cosinus de la surface (une bosse, une rampe s'allument plus fort). Les
       deux lobes se croisent devant le capot. Le projecteur three ne touche plus le bitume (la boucle des spots est retirée de son shader, comme celle
       des points) : il reste pour le décor (tours, rochers, arbres). La nappe peinte est éteinte.
     · DES LAMPES-SEGMENTS (`uLmA/B/C`, LM_N au plus) : un point (A = B) ou un trait (A → B) de lumière — l'éclairement vient du point le plus proche du
       trait, le REFLET (pellicule d'eau, flaques — le béton sec est mat : sauté) du point du trait le plus proche du rayon réfléchi (« point représentatif »,
       Karis 2013), dans un lobe ÉTIRÉ (fin en travers, long vers l'œil) : sur une route mouillée chaque lumière s'étire en TRAÎNÉE vers la caméra, comme
       sur une vraie route de nuit sous la pluie (un lobe rond y faisait des taches). Les FEUX ARRIÈRE (deux points rayonnés vers l'arrière, embrasés au
       frein), le FEU DU NITRO (un trait par côté, de la bouche du pot le long du jet, à la couleur de sa flamme, qui tremble avec elle) — hors nitro la
       FLAMME DU MOTEUR, qui crépite —, les TRAÎNÉES DE LUMIÈRE (un trait sur leurs 12 premiers mètres, à leur couleur et à leur éclat).
   Tout est en espace VUE (lumTick pose en monde, lumVue transforme pour la caméra qui rend) ; hors d'une sphère de 18 m autour de la caisse, le pixel ne
   paie qu'un test ; les phares sautent tout ce qui est derrière eux, hors de l'éventail ou au-dessus de la coupure. Rien n'est alloué, aucun programme de
   plus (la clé du bitume change : UN programme remplacé). MESURÉ (temps GPU) : sous le bruit, comme l'éclairage d'avant. Crochets : `dbgLum()`, `dbgLumVue()`. */
const LM_N=6; /* deux feux, deux traits de nitro (ou la flamme du moteur), une traînée par feu — MESURÉ : à 10 (trois traits par traînée) le bitume coûtait trop, pour une lueur qu'on ne distinguait pas */
const LUM_U={uLmA:{value:[]},uLmB:{value:[]},uLmC:{value:[]},uLmN:{value:0},uLmS:{value:new THREE.Vector4(0,0,0,0)},uLmK:{value:new THREE.Vector3(0,0,1)},
  uLmW:{value:new THREE.Vector4(260,.1,.6,1.4)}, /* le reflet : x = finesse du lobe en travers (en long : ×0,05, la traînée) · y = béton sec · z = pellicule d'eau · w = flaques */
  uHlP:{value:[new THREE.Vector4(),new THREE.Vector4()]},uHlF:{value:new THREE.Vector3(0,0,-1)},uHlR:{value:new THREE.Vector3(1,0,0)},uHlU:{value:new THREE.Vector3(0,1,0)},
  uHlN:{value:1},uHlC:{value:new THREE.Color(0,0,0)},uHlK:{value:new THREE.Vector4(-.012,.6,4,3)}}; /* les phares : x = la coupure (tangente) · y = la demi-ouverture de l'éventail (tangente) · z = le point chaud · w = l'adoucissement de près (m²) */
for(let i=0;i<LM_N;i++){LUM_U.uLmA.value.push(new THREE.Vector4());LUM_U.uLmB.value.push(new THREE.Vector4());LUM_U.uLmC.value.push(new THREE.Vector4());}
const LUM_GLSL=['#define LM_N '+LM_N,
  'uniform vec4 uLmA[LM_N],uLmB[LM_N],uLmC[LM_N],uLmS,uLmW,uHlP[2],uHlK;uniform vec3 uLmK,uHlF,uHlR,uHlU,uHlC;uniform float uLmN,uHlN;',
  'vec3 lmSp9=vec3(0.);float bmP9=0.;',
  'vec3 lmRoute(vec3 P,vec3 N,vec3 V){',
  '  vec3 E=vec3(0.);',
  '  if(uHlC.r+uHlC.g+uHlC.b>0.){',                                                              // LES PHARES — trois tests bon marché d abord : devant, dans l éventail, sous la coupure
  '    for(int j=0;j<2;j++){vec3 v=P-uHlP[j].xyz;float fw=dot(v,uHlF);',
  '      if(fw>1.5){float iw=1./fw,hx=abs(dot(v,uHlR))*iw;',                                      // les tangentes du rayon : en travers…
  '        if(hx<uHlK.y){float vy=dot(v,uHlU)*iw;',                                               // …et en hauteur
  '          if(vy<uHlK.x+mix(.02,.06,uHlN)){float d2=dot(v,v);',
  '            float I=(1.-smoothstep(uHlK.y*mix(.55,.12,uHlN),uHlK.y,hx))*(mix(.5,.45,uHlN)+mix(.5,.55,uHlN)*exp(-hx*hx*mix(9.,7.,uHlN)))*(1.-smoothstep(uHlK.x-mix(.006,.045,uHlN),uHlK.x+mix(.02,.05,uHlN),vy))*pow(.03/(.03+max(-vy,0.)),uHlK.z)*smoothstep(1.5,7.,fw)*exp(-fw*.008*uHlN);', // l éventail (des BORDS nets : on lit un faisceau projeté, pas une lueur) · la coupure · le point chaud qui porte loin · presque rien sous le pare-chocs (vu de la poursuite, c était un halo autour du capot)
  '            E+=uHlC*(I*uHlP[j].w*max(dot(N,-v),0.)*inversesqrt(d2)/(d2+uHlK.w));}}}}}',
  '  vec3 dq=P-uLmS.xyz;',
  '  if(uLmN>.5&&dot(dq,dq)<uLmS.w){vec3 R=reflect(-V,N),T=normalize(cross(N,V)+vec3(1e-5,0.,0.)),B=cross(R,T);', // LES LAMPES-SEGMENTS (feux, nitro, traînées) — T : le travers de la route vu d ici, B : le long (vers l œil)
  '    for(int i=0;i<LM_N;i++){if(float(i)>=uLmN)break;',
  '      vec4 a=uLmA[i],b=uLmB[i],c=uLmC[i];vec3 Q=P-a.xyz;',                                     // a : départ + rayon² (+100 : rayonné vers l arrière) · b : le trait A→B + 1/|AB|² (posés par lumVue)
  '      vec3 L=b.xyz*clamp(dot(Q,b.xyz)*b.w,0.,1.)-Q;float d2=dot(L,L)+1e-4;vec3 l=L*inversesqrt(d2);', // le point du trait le plus proche
  '      float r2=a.w,lob=1.;if(r2>50.){r2-=100.;lob=smoothstep(-.35,.6,-dot(l,uLmK));}',         // les feux rayonnent vers l arrière (branche UNIFORME : la même pour tout l écran)
  '      E+=c.rgb*(max(dot(N,l),0.)*lob/(d2+r2));',
  '      if(c.w>0.){float DD=dot(b.xyz,b.xyz),RD=dot(R,b.xyz);',                                 // le REFLET (sur l eau seulement) : le point du trait le plus proche du rayon réfléchi
  '        vec3 Ls=b.xyz*clamp((dot(R,-Q)*RD+dot(Q,b.xyz))/max(DD-RD*RD,1e-4),0.,1.)-Q;float s2=dot(Ls,Ls);',
  '        vec3 e=Ls*inversesqrt(s2)-R;float et=dot(e,T),eb=dot(e,B);',                               // l écart angulaire, en travers et en long
  '        lmSp9+=c.rgb*(c.w*lob*step(0.,dot(R,Ls))*exp(-et*et*uLmW.x-eb*eb*uLmW.x*.05)/(1.+.08*s2+r2));}}}', // un lobe ÉTIRÉ : fin en travers, long vers l œil — la TRAÎNÉE d une lumière sur l eau (un lobe rond faisait des taches)
  '  return E;}',''].join('\n');
const LUM_APPEL='\n{vec3 lmE9=lmRoute(geometry.position,geometry.normal,geometry.viewDir);reflectedLight.directDiffuse+=lmE9*diffuseColor.rgb;}\n';
const LFB_ROUTE_LUM=LFB_ROUTE.replace(/#if \( NUM_SPOT_LIGHTS > 0 \) && defined\( RE_Direct \)[\s\S]*?#pragma unroll_loop_end\s*#endif/,''); // les phares du bitume sont les nôtres : le projecteur three n'y entre plus
function roadMat(){
  /* (2026-09-26, vague 2) UNE LECTURE DE TEXTURE DE MOINS PAR PIXEL DE ROUTE. Le grain servait deux fois — en `map` ET en `specularMap`,
     la même image lue deux fois dans chaque pixel du bitume (la moitié de l'écran). Le spéculaire prend désormais le rouge du texel
     déjà lu (`specularStrength=texelColor.r`, la carte est en niveaux de gris et en espace linéaire : c'est la même valeur).
     Et le grain est lu 1,7 fois plus FIN (`ASPH_K`) : à 1,6 cm le texel, de près il faisait des pâtés sous le nez de la caisse ; les
     mipmaps et l'anisotropie tiennent le lointain. Les flaques et les impacts de pluie (vUv) gardent leur échelle. */
  const face=BITUME.face,sauts=BITUME.sauts; // (tour 2) figés à la construction : la matière et la géométrie de la piste vont ensemble (voir BITUME)
  const m=new THREE.MeshPhongMaterial({color:BETON.col,side:face?THREE.FrontSide:THREE.DoubleSide,vertexColors:true,map:asphTex(),
    shininess:30,specular:0x000000,envMap:envTex,reflectivity:0}); /* (2026-10-14, passe graphismes) LE BÉTON EST MAT : gris minéral (c'était l'indigo 0x322e40), lobe spéculaire à ZÉRO (0x16141e), plus de mélange du cube (.03) — la lumière s'y pose en diffus pur ; la pluie garde son eau (BITUME_MOUILLE a son propre reflet) */ // (2026-09-26, user : « un peu trop brillante, gère mal le reflet du soleil ») : 80/0x2c2a3a faisait une traînée de soleil DURE et granuleuse — un bitume renvoie une nappe large et sourde
  m.userData.bitume=face?2:1;m.userData.sauts=sauts; // 2 = face cachée jetée (bloc du dessous retourné), 1 = l'ancien DoubleSide
  m.onBeforeCompile=function(sh){
    sh.uniforms.uLift=ROAD_U.uLift;sh.uniforms.uSheen=ROAD_U.uSheen;sh.uniforms.uSheenCol=ROAD_U.uSheenCol;
    for(const k in LUM_U)sh.uniforms[k]=LUM_U[k]; // (2026-10-17) LES LUMIÈRES DE LA CAISSE v2 (voir LUM_GLSL)
    sh.uniforms.uTeinte=ROAD_U.uTeinte;sh.uniforms.uBmM9=ROAD_U.uBmM;sh.uniforms.uWet=ROAD_U.uWet;sh.uniforms.uAcc9=ROAD_U.uAcc;sh.uniforms.uT9=CITY.uT;sh.uniforms.uVil9=ROAD_U.uVil;sh.uniforms.uEcl9=ROAD_U.uEcl;sh.uniforms.uGlace=ROAD_U.uGlace;sh.uniforms.uSunW=ROAD_U.uSunW;
    if(face)sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>','#include <color_vertex>\nvColor=abs(vColor);') // le dessous porte des couleurs NIÉES : on relit leur valeur
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.split('inverseTransformDirection( transformedNormal, viewMatrix )')
        .join('inverseTransformDirection( transformedNormal*(color.r<0.?-1.:1.), viewMatrix )')); // …et le décalage d'ombre reprend la normale d'avant le retournement
    sh.fragmentShader='uniform vec3 uTeinte;uniform vec3 uBmM9;uniform vec3 uLift;uniform float uSheen;uniform vec3 uSheenCol;uniform float uWet;uniform vec3 uAcc9;uniform float uT9;uniform float uGlace;uniform vec3 uSunW;uniform float uVil9,uEcl9;\n'+
      sh.fragmentShader.replace('void main() {',(LUM_GLSL+BITUME_MOUILLE.replace('  col*=1.-uWet*.2*P;','  bmP9=P;col*=1.-uWet*.2*P;'))+'void main() {').replace('#include <lights_fragment_begin>',sauts?LFB_ROUTE_LUM:LFB_SANS_PL)
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+(LUM_APPEL))
      .replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv*'+ASPH_K.toFixed(2)+');float spec9=texelColor.r;texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;diffuseColor.rgb*=uTeinte;')
      .replace('#include <specularmap_fragment>','float specularStrength=spec9;').replace('#include <envmap_fragment>',
      '#include <envmap_fragment>\n{float fr9=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),4.0);float lk9=1.;\n'+
      '#if defined(USE_ENVMAP)&&defined(ENVMAP_TYPE_CUBE)\nif(uWet>.001){vec4 w9=bitumeMouille(outgoingLight,reflectVec,normal,normalize(vViewPosition));outgoingLight=w9.rgb;lk9=w9.a;}\n'+
      /* LE BITUME GLACÉ (2026-09-28, « plus beau sur iPhone sans coût en plus ») — la route sèche des NUAGES n'était qu'un aplat indigo
         sous un ciel éclatant : rien ne la reliait au monde. Une route vue en rasant renvoie le ciel (Fresnel) : le cube du biome, DÉJÀ
         lu par ce pixel (le mélange d'origine à 3 %), s'y pose désormais selon l'angle — presque rien sous le nez de la caisse, le
         dégradé du ciel et la bande rose de l'horizon vers le lointain et sur les dalles qui tournent. Le reflet du SOLEIL en est retiré
         (la traînée dure que Sacha avait refusée le 26/09) ; la pluie de la VILLE garde son eau (uGlace y vaut 0). Zéro lecture de plus. */
      'if(uGlace>.001){float cg9=clamp(abs(dot(normal,normalize(vViewPosition))),0.,1.),g9=1.-cg9;g9=g9*g9*g9*g9*g9;'+
      'outgoingLight+=envColor.rgb*(g9*uGlace*(1.-smoothstep(.90,.985,dot(normalize(reflectVec),uSunW))));}\n'+
      '#endif\n'+
      'outgoingLight+=uLift*lk9+uSheenCol*(uSheen*fr9);}'+
      ('\noutgoingLight+=lmSp9*(uLmW.y*(.4+spec9)+uWet*(uLmW.z+uLmW.w*bmP9));')); // (2026-10-17) le REFLET des lampes de la caisse : le béton sec en garde un voile, la pellicule d'eau et les FLAQUES le font miroir (voir LUM_GLSL)
  };
  m.customProgramCacheKey=function(){return 'bitumeV5'+(face?'f':'')+(sauts?'s':'')+('L');}; // UNE compilation pour toutes les pistes (L : les lumières de la caisse v2)
  return m;
}
/* LE BITUME MOUILLÉ DE LA VILLE (2026-09-26) — sous la pluie, la route n'était qu'un aplat violet : c'est pourtant LA surface qui fait
   une ville cyberpunk. Tout vit dans le shader du bitume, SANS aucune lumière (la route n'écoute plus les PointLights : LFB_SANS_PL),
   et ne coûte rien ailleurs (`uWet` = LVL.pluie, branche uniforme coupée hors de la pluie) :
     · une PELLICULE D'EAU : un reflet de Fresnel (celui de l'eau, F0 = 0,02) renvoie le ciel et la brume de la ville
       (le cube d'environnement du biome, ses bandes néon magenta/cyan) — la route prend la couleur de la nuit au lieu d'un aplat ;
     · des FLAQUES : un bruit étiré dans le sens de la route (repère de la dalle, `vUv` en m/4) où l'eau fait miroir et le bitume noircit ;
     · les REFLETS ÉTIRÉS DES ENSEIGNES : des colonnes de lumière (ambre des fenêtres, cyan, magenta, l'accent de la zone) tirées de
       l'AZIMUT du reflet — ancrées dans le monde comme de vrais reflets de lumières lointaines, elles restent en place pendant que le
       bitume défile dessous, et c'est l'eau (flaques + pellicule qui frissonne) qui les découpe et les fait vivre ;
     · les IMPACTS DE PLUIE : des cercles de 10 cm qui s'ouvrent et s'éteignent (une cellule de 67 cm), visibles de près seulement.
   Des traînées et des cercles d'eau fins : aucune tache ronde de lumière (verdict), aucune passe de plus. ⚠ La route de la ville DESCEND
   (spirale de ~9 km) : ses reflets rasants plongent SOUS l'horizon — on ne coupe donc que le zénith et le fond, pas le bas du ciel. */
const BITUME_MOUILLE=['#if defined(USE_ENVMAP)&&defined(ENVMAP_TYPE_CUBE)',
  'float bmH(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'float bmN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bmH(i),bmH(i+vec2(1.,0.)),f.x),mix(bmH(i+vec2(0.,1.)),bmH(i+vec2(1.,1.)),f.x),f.y);}',
  'vec3 bmCol(float h){return h>.93?uBmM9:h>.82?vec3(.40,.86,1.):h>.74?uAcc9:vec3(1.,.62,.30);}', // ambre des fenêtres surtout, puis cyan, accent, magenta
  'vec4 bitumeMouille(vec3 col,vec3 R,vec3 nV,vec3 vV){',
  '  float cv=clamp(abs(dot(nV,vV)),0.,1.),F=.02+.98*pow(1.-cv,5.);',                                   // Fresnel de l eau
  '  float dz=length(vViewPosition);',
  '  vec2 u=vUv*vec2(1.,.25);',                                                                           // (m/4 en travers, m/16 en long) : bruits étirés dans le sens de la route
  '  float P=smoothstep(.58,.72,.6*bmN(u*vec2(1.1,1.8)+3.1)+.4*bmN(u*vec2(3.1,4.4)-7.3));',             // les FLAQUES
  '  float film=.55+.45*bmN(vUv*vec2(3.,.6)+vec2(0.,uT9*.35));',                                          // la pellicule qui frissonne (défile avec le bitume)
  // les impacts : un cercle par cellule de 67 cm, qui s ouvre et s éteint — de près seulement
  '  vec2 q=vUv*6.,ci=floor(q),cf=fract(q)-.5;float hr=bmH(ci+17.),ph=fract(uT9*1.6+hr*7.3);',
  '  float ring=smoothstep(.04,0.,abs(length(cf-(vec2(hr,fract(hr*37.3))-.5)*.4)-ph*.16))*(1.-ph)*(1.-ph)*step(.45,hr)*(1.-smoothstep(3.,12.,dz));',
  // les reflets étirés : colonnes de lumière selon l azimut du reflet (fines + larges), éteintes vers le zénith
  '  float az=atan(R.z,R.x);',
  '  float x1=az*28.+uAcc9.r*9.,i1=floor(x1),f1=fract(x1)-.5,h1=bmH(vec2(i1,5.7));',
  '  vec3 st=bmCol(h1)*step(.55,h1)*exp(-f1*f1*12.)*(.6+.4*sin(uT9*(.6+h1*2.)+h1*50.));',
  '  float x2=az*9.+1.7,i2=floor(x2),f2=fract(x2)-.5,h2=bmH(vec2(i2,-2.3));',
  '  st+=bmCol(h2)*step(.45,h2)*exp(-f2*f2*6.)*.55;',
  '  st*=smoothstep(.8,.15,abs(R.y))*smoothstep(3.,22.,dz)*uVil9;',                                   /* (2026-09-30, Sacha : « dans l orage on voit le reflet de la ville dans les flaques, c est pas normal, il n y a pas de ville ») : les enseignes ne se reflètent que s il y a une VILLE (LVL.ville, au fondu du portail) */                                            // ni le zénith ni le fond de l abîme (la route de la ville DESCEND : ses reflets rasants plongent sous l horizon, et les tours y sont aussi) ; pas sous le nez
  '  vec4 ec=textureCube(envMap,vec3(flipEnvMap*R.x,R.yz),1.5);ec=envMapTexelToLinear(ec);',              // le ciel de la ville, un peu flou
  '  float wet=uWet*(.24+.76*P);', /* (2026-10-14, passe graphismes) béton mouillé : .45/.55 → .24/.76 — les FLAQUES font miroir, hors d'elles le béton reste peu brillant */
  '  col*=1.-uWet*.2*P;',                                                                                  // la flaque fonce (⚠ pas le reste : l étalonnage de la pluie ÉCRASE les sombres — 10 % de moins et le bitume proche devenait noir)
  '  vec3 refl=(ec.rgb*.7+uSheenCol*.55+st*(.9+1.7*P)*film)*F*wet;',
  '  refl+=(uSheenCol+st*.5+vec3(.04,.05,.07))*ring*uWet*.3;',
  '  refl+=vec3(.66,.72,1.)*uEcl9*(F*(1.2+2.6*P)+.10*P)*uWet;',                                        /* (2026-09-30) L ORAGE : ce que les flaques renvoient, c est L ÉCLAIR — un miroir froid qui s allume avec le ciel (CAMP_FLASH) */
  '  return vec4(col+refl,1.-uWet*.22*P);}',                                                               // la flaque garde moins de clarté de niveau : c est un miroir, pas une craie
'#endif',''].join('\n');
/* (2026-09-26) LES TRAITS DE LA ROUTE TIENNENT JUSQU'À L'HORIZON. Rails néon (60 cm), nappes de lueur et ligne centrale (un trait GL
   d'UN pixel, épaisseur fausse de près) tombaient sous le pixel passé ~400 m : ils s'émiettaient en POINTILLÉS qui grouillaient au moindre
   mouvement, et le bord de la route se perdait dans la nuit. Le vertex shader ÉLARGIT désormais chaque trait juste assez pour couvrir
   `minPx` pixels à l'écran (jamais moins que sa vraie largeur) et baisse son éclat d'autant : un trait continu qui file jusqu'au bout de
   la route, sans surbrillance. La géométrie porte `aLat` (le vecteur qui va du milieu du trait vers CE bord) ; `TRAIT_U.uPx` (taille d'un
   pixel à 1 m de l'œil) est écrit par routeTick. Coût : une poignée d'opérations par SOMMET, zéro par pixel.
   `pal` : 0 = opaque (on assombrit), 1 = additif (on divise l'énergie), 2 = alpha (on éclaircit l'alpha). */
const TRAIT_U={uPx:{value:.002}};
const BMAP_U={uRgb:{value:0},uRgbT:{value:0},uRgbK:{value:0},uRgbM:{value:1},uPal:{value:Array.from({length:10},function(){return new THREE.Vector3(1,.45,.12);})},uCum:{value:new Float32Array([.1,.2,.3,.4,.5,.6,.7,.8,.9,1])}}; // (2026-10-18, Léo) LE BOOST RGB des bords (voir BMAP) : part d'arc-en-ciel, défilement (tours, l'horloge du scintillement ×16) — (2026-10-18, Sacha) uRgbM : 1 = le JEU DE LUMIÈRE de la traînée (uPal : ses 10 nuances, uCum : leur part cumulée dans le feu), 0 = l'arc-en-ciel
function traitMat(m,minPx,pal){
  const rgb9=pal<2; // (2026-10-18, Léo : « quand on booste, les côtés scintillent un peu en mode RGB ») les RAILS (0) et la NAPPE (1) — les seuls à porter ces deux programmes — peignent l'arc-en-ciel du boost (BMAP_U, à 0 hors boost : rien ne change)
  m.onBeforeCompile=function(sh){sh.uniforms.uPx9=TRAIT_U.uPx;if(rgb9){sh.uniforms.uRgb9=BMAP_U.uRgb;sh.uniforms.uRgbT9=BMAP_U.uRgbT;sh.uniforms.uRgbK9=BMAP_U.uRgbK;sh.uniforms.uRgbM9=BMAP_U.uRgbM;sh.uniforms.uPal9=BMAP_U.uPal;sh.uniforms.uCum9=BMAP_U.uCum;}
    sh.vertexShader='attribute vec3 aLat;uniform float uPx9;varying float vK9;\n'+(rgb9?'attribute float aS;varying float vS9;\n':'')+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n{float hw9=max(length(aLat),1e-4),d9=max(0.,-(modelViewMatrix*vec4(position,1.)).z);'+
      'float k9=max(1.,'+minPx.toFixed(2)+'*.5*uPx9*d9/hw9);transformed+=aLat*(k9-1.);vK9=1./k9;}'+(rgb9?'vS9=aS;':''));
    sh.fragmentShader='varying float vK9;\n'+(rgb9?'varying float vS9;uniform float uRgb9,uRgbT9,uRgbK9,uRgbM9;uniform vec3 uPal9[10];uniform float uCum9[10];\n':'')+sh.fragmentShader.replace('#include <fog_fragment>',
      (pal===0?'gl_FragColor.rgb*=.35+.65*sqrt(vK9);':pal===1?'gl_FragColor.rgb*=vK9;':'gl_FragColor.a*=.25+.75*vK9;')+
      (rgb9?'if(uRgb9>.001){float I9=max(max(gl_FragColor.r,gl_FragColor.g),gl_FragColor.b);vec3 c9;'+
        'if(uRgbM9<.5){float h9=fract(vS9*.016+uRgbT9);c9=clamp(abs(mod(h9*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);'+ // (Léo) la teinte de l'arc-en-ciel à cet endroit de la route (tout le spectre en ~60 m)
        'float n9=fract(sin(mod(floor(vS9*.4),997.)*12.9898+floor(uRgbK9)*78.233)*43758.5453);'+ // le SCINTILLEMENT : chaque tronçon de ~2,5 m tire son éclat, 16 fois par seconde — un sur sept ÉCLATE (blanc vif) : le flou de vitesse du boost avalait un simple frémissement (vu au banc)
        'c9=mix(c9,vec3(1.),.45*step(.86,n9))*(.7+.3*n9+1.4*step(.86,n9));}'+
        'else{float g9=mod(floor(vS9*.5),997.),y9=floor(uRgbK9*.5+fract(sin(g9*7.137)*4375.85));'+ // (2026-10-18, Sacha : « le même jeu de lumière que la traînée ») chaque tronçon de 2 m est un PIXEL du feu : il change ~8 fois par seconde, chacun à son temps (ils ne clignotent pas tous ensemble)
        'float n9=fract(sin(g9*12.9898+mod(y9,997.)*78.233)*43758.5453);c9=uPal9[9];for(int i=0;i<10;i++){if(n9<uCum9[i]){c9=uPal9[i];break;}}'+ // il tire SA NUANCE dans la part qu'elle a dans le feu de la traînée (70 % de rose et 30 % de blanc dans le feu = 70 % et 30 % des pixels du bord)
        'c9*=.92+.16*fract(n9*91.7);}'+ // et son éclat (± 8 %), comme chaque cube du feu
        'gl_FragColor.rgb=mix(gl_FragColor.rgb,c9*I9,uRgb9);}':'')+'\n#include <fog_fragment>');
  };
  m.customProgramCacheKey=function(){return 'trait'+pal+'_'+minPx;};
  m.polygonOffset=true; // … et plus de Z-FIGHTING : 4 à 9 cm au-dessus du bitume, c'était sous la précision du tampon de profondeur dès 300 m
  return m;
}
/* ==========================================================================
   (2026-10-14, passe graphismes · agent bords-route) FIN DU NÉON DE BORD — flancs et rail en BÉTON.
   Sacha : « le néon violet/magenta fait trop IA ». Les bords de la route (rail cyan/rose/violet + nappe de lueur additive, flancs d'ENCRE
   violette, liseré et catadioptres à l'accent de la zone, ligne centrale lavande, plaques turbo sur encre violette) passent à la matière :
     · DE JOUR (matin, midi, soir, orbite) le rail n'est plus une lumière : c'est le CHANFREIN clair de la dalle (béton #C9C3B6), la nappe de
       lueur est éteinte ;
     · la NUIT, sous la PLUIE, à l'ORAGE : un rail BLANC doux (#E8E4DA à demi) — le bord du vide reste lisible — et une nappe très discrète ;
     · les flancs sont en béton sombre #3A3833 ; le liseré et les catadioptres (1,5 m tous les 6 m) sont AMBRE (#FFB04A ; or aux
       PICS DE JADE, blanc froid en orbite) ; la ligne centrale est un blanc cassé ; les plaques turbo ont un fond de béton sombre.
   Rien de plus pour la puce : des valeurs, des couleurs de matière existantes, les MÊMES programmes (le flanc change de clé : un programme
   remplacé, pas ajouté), aucune texture en plus.
   Mécanique : `bordsTick()` repeint la couleur du rail et l'opacité de la nappe à chaque image, JUSTE APRÈS la boucle « caméléon » de
   musicTick (qui les repeint depuis `userData.base`, laquelle reste l'accent ambre : le ciel musical, `lvlTick`, le lit toujours). Le rail
   blanc ne vire donc plus de teinte avec la musique. `villeApres` (minuit) baisse ensuite le rail ×kr : on le pré-divise pour qu'il reste lisible.
   Banc : `dbgBords({kNuit,kJ,glowN,jour:[r,g,b],nuit:[r,g,b]})`. ========================================================================== */
/* (2026-10-14, Sacha : « garde quand même la première map de la VILLE avec les NÉONS ROSES, elle était bien ») LA VILLE AU NÉON (ambiance `pluie`, le niveau VILLE d'origine)
   GARDE SON ROSE : bords de route roses, enseignes magenta/cyan, ambiance d'avant la passe graphismes — c'est la RÉFÉRENCE d'identité de CASH CAR. Elle seule. */
{BETON.t=[.86,.93,1.2];BETON.amb=.4;} // (vives) le béton n'est plus gris mort : un bleu d'ardoise franc, qui prend davantage la couleur de l'air du lieu (rose au soir, azur à midi) — chiffres de la COUCHE POP
function metroH(x,z){const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v);} // un hasard FIXÉ par la position (ne consomme pas `vr`)
function villeRose(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!(!!c&&c.id==='ville'&&!!c.bio))return false;const b=c.bioBase||c.bio[0];return b==='pluie'||b==='nuitNoire'||b==='villeOrage'||b==='villeBrume';} /* (Sacha, 20 h 50 : « la ville doit être en ROSE la nuit ») la nuit, la pluie ET l'orage — (2026-10-16) et le BROUILLARD ; une ville teintée (`pluie_vert`…) garde son ambiance de base dans `bioBase` (sfNiveau) */
/* ============================================================================
   (2026-10-16, Sacha : « la map ville, elle sera toujours la nuit. Tu reprends la map nuit avec de la pluie qui était là de base — la première version finie de la
   ville — et tu la déclines simplement en plusieurs couleurs : une violette, c'est celle de base ; une autre avec des néons verts, une autre avec des néons jaunes,
   une autre bleue — bleu foncé, bleu électrique. La ville est toujours la nuit : des fois du brouillard, des fois de la pluie, des fois pas de pluie. La ville-jour,
   ça marche pas : on abandonne toutes les maps ville-jour. »)
   LA VILLE TOUJOURS LA NUIT, EN QUATRE COULEURS. au JOUER, LA VILLE n'a plus ni matin, ni midi, ni soir (SF_CARTES.ville) ; c'est toujours la map de
   base — la ville au néon d'AU-DESSUS DE LA VILLE — sous quatre temps : la PLUIE (la map d'origine), la NUIT sèche (minuit), le BROUILLARD (villeBrume + LVL.brume :
   le plafond bas sans une goutte), l'ORAGE ; et une TEINTE tirée au hasard à chaque fois (sfTire) : VIOLET (la ville de base, au pixel près), VERT, JAUNE, BLEU.
   Une teinte = un REMAPPAGE SÉLECTIF de la teinte (vtRgb) : seule la famille violet → magenta → rose de la ville (250°-345°) bascule — le violet de l'air vers `a`,
   le magenta des néons vers `b` ; le cyan des enseignes, l'ambre et le cyan des fenêtres, le rouge des balises restent ce qu'ils sont. Il s'applique :
     · aux AMBIANCES de la ville, copiées en `<ambiance>_<teinte>` à leur premier emploi (vtBio) : brume, lumières, vignette, reflets ;
     · aux NÉONS des tours et à l'ACCENT de la route (rails, nappe, flaques, couronnes : buildTrack, buildVoxCity), aux RÉCLAMES (villePubAtlas, repeintes) ;
     · aux couleurs FIXES du ciel (skyU.uFd, skyU.uVc) et du pied des tours (CITY.uPiedC) : posées par vtPose, fondues au portail avec le reste (lvlGo, lvlStep).
   Rien n'est compilé de plus (des uniforms) ; la ville violette garde ses valeurs d'origine.
   `?carte=ville&meteo=brouillard&teinte=vert` · `dbgClassique('ville','pluie','jaune')` puis dbgSaut() · `dbgTeinte()` (ce qui est posé). */
const VTEINTES={violet:null, // a : où va le VIOLET (262°) de l'air · b : où va le MAGENTA (330°) des néons · s, v : saturation et éclat de la bande · sA, vA : ceux de l'AIR seul (le côté violet)
  vert:{a:178,b:128,s:1,v:1,sA:.82,vA:.86,     // l'air sarcelle profond, les néons vert acide — vu au banc : à 166° et pleine saturation, un ciel vert « toxique » ; plus froid et plus sourd, le néon ressort
    fd:[[.04,.10,.16],[.08,.20,.26],[.16,.40,.34],[.24,.58,.36],[.36,.68,.32],[.46,.72,.32],[.10,.24,.22],[.03,.07,.09]]}, // le ciel SEC (la nuit) : bleu-sarcelle en haut, la lueur verte de la ville à l'horizon
  jaune:{a:30,b:50,s:1,v:1.08,sA:.42,vA:.72,   // l'air brun de sodium, SOMBRE, les néons or-jaune — vu au banc : l'air ambre plein faisait un ciel orange brûlé qui noyait le néon jaune
    fd:[[.08,.07,.09],[.17,.13,.12],[.36,.25,.14],[.60,.46,.17],[.68,.58,.20],[.74,.70,.28],[.26,.19,.12],[.05,.045,.05]],vc:{5:[1,.56,.22]},bio:{skyMul:[.56,.54,.40]}}, // presque noir en haut, l'OR à l'horizon — skyMul chaud : le bleuté de la ville (.42,.5,.64) rendait le jaune OLIVE ; vert ≥ .85 × rouge à l'horizon, sinon l'étalonnage (sat 1,38) le pousse au ROUGE de couchant (vu au banc)
  bleu:{a:230,b:218,s:1.05,v:1,                // l'air bleu nuit, les néons bleu électrique
    fd:[[.03,.06,.24],[.07,.14,.42],[.14,.28,.62],[.20,.42,.84],[.30,.58,.92],[.46,.74,.96],[.10,.16,.36],[.03,.05,.13]]}}; // bleu marine en haut, le bleu électrique à l'horizon
/* fd : les huit teintes du dégradé du ciel SEC (cielFond : zénith, violet, mauve, rose, corail, ambre, prune, fond), DESSINÉES pour la teinte — le remappage ne
   touchait que la bande violet → rose : le corail et l'ambre de l'horizon restaient, et un jaune sombre est OLIVE. `bio` : ce que l'ambiance teintée prend en plus. `vc` : une couleur fixe du ciel de la ville DITE (par son rang dans VT_VC0) au lieu de remappée — le cyan de la guirlande (5), mêlé au jaune, verdissait l'horizon (vu au banc) : il passe à l'orange. */
function vtCur(){const c=typeof LVL!=='undefined'&&LVL.cur;return (c&&c.id==='ville'&&c.teinte&&VTEINTES[c.teinte])||null;} // la teinte de la ville courante (null : violette, ou pas en ville)
function vtRgb(r,g,b,T,o){ // (r,g,b) remappé par la teinte T → o[0..2] (au-dessus de 1 ça tient : V = le max) ; T nul ou hors de la bande : la couleur telle quelle
  o=o||[0,0,0];const mx=Math.max(r,g,b),d=mx-Math.min(r,g,b);
  if(!T||mx<=0||d<=1e-6){o[0]=r;o[1]=g;o[2]=b;return o;}
  const h=((mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360,s=d/mx;
  const w=(h<236||h>348?0:h<250?(h-236)/14:h>342?(348-h)/6:1)*Math.min(1,s/.12); // la bande violet → rose, fondue aux bords (au-delà de 348° : le ROUGE des balises reste rouge) ; les gris restent gris
  if(w<=0){o[0]=r;o[1]=g;o[2]=b;return o;}
  const t=Math.min(1,Math.max(0,(h-262)/68)),dh=((T.a+(T.b-T.a)*t-h+540)%360)-180; // violet → a, magenta → b, par le plus court chemin
  const wA=w*(1-t),h2=(h+dh*w+360)%360,s2=Math.min(1,s*(1+(T.s-1)*w)*(1+((T.sA||1)-1)*wA)),v2=mx*(1+(T.v-1)*w)*(1+((T.vA||1)-1)*wA), /* wA : le côté VIOLET de la bande (l'air) — sA, vA le retiennent */ c=v2*s2,x=c*(1-Math.abs((h2/60)%2-1)),m=v2-c,k=Math.min(5,(h2/60)|0);
  o[0]=(k===0||k===5?c:k===1||k===4?x:0)+m;o[1]=(k===1||k===2?c:k===0||k===3?x:0)+m;o[2]=(k===3||k===4?c:k===2||k===5?x:0)+m;return o;}
function vtCol(col,T){if(T){const o=vtRgb(col.r,col.g,col.b,T);col.setRGB(o[0],o[1],o[2]);}return col;} // une THREE.Color, en place
function vtHex(s,T){if(!T||typeof s!=='string'||s[0]!=='#')return s;const n=parseInt(s.slice(1),16),o=vtRgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255,T);
  return '#'+o.map(function(v){return ('0'+Math.round(Math.min(1,Math.max(0,v))*255).toString(16)).slice(-2);}).join('');}
const VT_COLS=['fog','fogIn','fogCj','hemiS','hemiG','sunC','fillC','kickC','volSun','volSky','volGnd','vigC','skyMul','skyLift','sunTint','jZen','jMid','jHor','jSol'];
function vtBio(n,te){ // le nom de l'ambiance `n` dans la teinte `te` — créée à son premier emploi, d'après l'ambiance FINIE (toutes les passes d'étalonnage faites)
  if(n==='villeBrume'&&!BIOMES.villeBrume&&BIOMES.nuitNoire) // LE BROUILLARD : la nuit sèche de la ville au néon, noyée — ni étoiles ni lune, la brume se referme à ~1 km et s'éclaire (la ville la porte)
    BIOMES.villeBrume=Object.assign(JSON.parse(JSON.stringify(BIOMES.nuitNoire)),{nm:'VILLE · BROUILLARD',stars:0,moon:0,fog:[.30,.19,.40],fogN:30,fogF:950,fogIn:[.86,.74,.86],expo:.82,city:1.3,vigK:.7}); // (vu au banc : à 60/1100 m les tours proches restaient nettes — un plafond bas plus qu'un brouillard ; la brume plus CLAIRE que les tours : de nuit, c'est ce qui la fait lire)
  const T=VTEINTES[te];if(!T||!BIOMES[n])return n;const k=n+'_'+te;
  if(!BIOMES[k]){const o=JSON.parse(JSON.stringify(BIOMES[n]));o.nm=(o.nm||n)+' · '+te.toUpperCase();
    for(const f of VT_COLS)if(Array.isArray(o[f])&&o[f].length===3)vtRgb(o[f][0],o[f][1],o[f][2],T,o[f]);
    if(Array.isArray(o.env))for(const e of o.env)e[1]=vtHex(e[1],T);
    for(const f of ['eS1','eS2'])if(Array.isArray(o[f])){const a=vtRgb(o[f][0]/255,o[f][1]/255,o[f][2]/255,T);for(let i=0;i<3;i++)o[f][i]=Math.round(Math.min(1,a[i])*255);}
    if(T.bio)Object.assign(o,JSON.parse(JSON.stringify(T.bio)));
    BIOMES[k]=o;}
  return k;}
const VTF={de:null,a:null}; // le fondu des couleurs fixes au portail : d'où (de) vers où (a) — 8 du dégradé (uFd), 6 du ciel de la ville (uVc), le pied des tours, le magenta des flaques
function vtUni(i){return i<8?skyU.uFd.value[i]:i<14?skyU.uVc.value[i-8]:i<15?CITY.uPiedC.value:ROAD_U.uBmM.value;} // + le magenta des flaques (ROAD_U.uBmM)
function vtGo(){const T=vtCur(),src=VT_FD0.concat(VT_VC0,[[.16,.04,.2],[1,.28,.66]]);VTF.de=[];VTF.a=[];
  for(let i=0;i<src.length;i++){const u=vtUni(i);VTF.de.push([u.x,u.y,u.z]);VTF.a.push(T&&T.fd&&i<8?T.fd[i].slice():T&&T.vc&&T.vc[i-8]?T.vc[i-8].slice():vtRgb(src[i][0],src[i][1],src[i][2],T));}}
function vtPose(e){if(!VTF.a)return;for(let i=0;i<VTF.a.length;i++){const a=VTF.a[i],d=VTF.de[i];vtUni(i).set(d[0]+(a[0]-d[0])*e,d[1]+(a[1]-d[1])*e,d[2]+(a[2]-d[2])*e);}if(e>=1)VTF.a=null;}
window.dbgTeinte=function(){const c=typeof LVL!=='undefined'&&LVL.cur;return {teinte:c&&c.teinte||null,ciel:BIO.name,fd:skyU.uFd.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(3);});}),
  vc:skyU.uVc.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(3);});}),pied:CITY.uPiedC.value.toArray().map(function(x){return +x.toFixed(3);}),brume:+((typeof LVL!=='undefined'&&LVL.brume)||0).toFixed(2),
  brumeCiel:+skyU.uPluie.value.toFixed(2),ville:+skyU.uVille.value.toFixed(2),fog:scene.fog?scene.fog.color.toArray().map(function(x){return +x.toFixed(3);}):null,fogNF:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far)]:null,mode:typeof CIEL2!=='undefined'?CIEL2.mode:null};};
/* (2026-10-14, LA BIBLE CAR CASH — passation/DA-CARCASH.md, validée par Sacha) LA SIGNATURE DE ROUTE : bords néon ROSE + nappe + ligne centrale OR, sur
   chaque map passée à la bible (une map à la fois). routeSig() dit si la map courante la porte. La ville au néon (villeRose) garde
   sa peinture caméléon d'origine ; les autres reçoivent le rose de la marque, plein la nuit et sous la pluie, ~70 % de jour (jamais blanc ni éteint). */
/* LA CONTINUITÉ DES MAPS (2026-10-17, Sacha : « grosse session d'amélioration des maps : mets-toi dans la peau d'un game designer senior, regarde
   toutes les maps comme un tout ; il faut une vraie continuité dans les maps, tant dans la colorimétrie que dans les textures — pour l'instant les
   seules maps à ne pas toucher sont les montagnes chinoises (jade) et la ville » · « c'est surtout l'éclairage de NUIT que tu arrives mal à faire » ·
   « des couleurs vives et pop mais pas trop : la journée dans les nuages est trop saturée ; un vrai équilibre ») — six maps : NUAGES, CANYON, FORÊT,
   GLACIER, ORBITE. Le détail (la recette commune par temps, la route commune, la nuit) est dans `CONTI` (après l'étalonnage) et au JOURNAL.
   `contiMap()` : la map courante est l'une des six (JAMAIS la ville ni le jade). */
function contiMap(){const c=typeof LVL!=='undefined'&&LVL.cur;return !!c&&(c.id==='nuages'||c.id==='orage' /* (2026-10-18, DEBUGGING : la MER DE NUAGES sous l'ORAGE a l'id du niveau 'orage' — CONTI.cartes.nuages.orage = 'tempete' recevait la recette, mais le bitume commun rtT/rtA, le ciel continu uCiel2 et la chroma du ciel ne la lisaient pas) */||c.id==='canyon'||c.id==='foret'||c.id==='banquise'||c.id==='espace'||c.id==='grotte'||c.id==='dunes');} /* (2026-10-18) + LES PROFONDEURS : la grotte suit la recette commune (grtConti) */
function routeSig(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!c||!c.bio)return false;
  return c.id==='nuages'||c.id==='orage' /* (2026-10-18, DEBUGGING) l'orage des nuages (id 'orage') : la ligne centrale OR de la signature, comme bmapCle pour les bords */||c.id==='banquise'||c.id==='canyon'||c.id==='dunes'||c.id==='espace'||c.id==='foret'||c.id==='jade'||!!c.vitre;} /* (continuité) la signature rose + or sur TOUTES les météos des nuages · (2026-10-17) la VILLE VITRÉE la porte aussi */
const BORDS={jour:new THREE.Color(0xc9c3b6),nuit:new THREE.Color(0xe8e4da),kJ:1,kNuit:.62,glowN:.4,jf:1}; // kNuit .62 = le « rail blanc doux » (le rail est opaque : on baisse sa couleur ; .5 sortait un peu mince au banc, le bord du vide doit rester lisible) · glowN .4 = la nappe ambre garde 40 % de son opacité la nuit
const LIGNE_OPJ=.55; // l'opacité de la ligne centrale aux PICS DE JADE (blanc cassé sur béton clair : un peu plus franche)
const _c9=new THREE.Color(),_d9=new THREE.Color();
/* (2026-10-17, Léo : « je voudrais que les maps aient les côtés lumineux de la route en fonction de la map, les couleurs, et qu'ils évoluent en
   fonction de comment la personne booste ») LES BORDS DE LA MAP. Chaque map du JOUER a SA couleur de bord (`BMAP_PAL`) — les rails, leur nappe
   de lueur et le liseré des flancs (ROAD_U.uAcc) la prennent : ~70 % de jour, pleine la nuit et sous la pluie (la règle de la bible, qui mettait le
   ROSE partout). La MER DE NUAGES garde le rose de la marque (son orage le retrouve : il avait perdu la signature) ; la VILLE au néon garde ses
   teintes et son caméléon (elle n'est pas dans la palette). La NAPPE porte une couleur de sommet NEUTRE (sa force, ka9) et sa MATIÈRE la teinte
   (accC, posée par buildTrack) : à l'image près la même chose pour les maps hors palette.
   (2026-10-18, Léo : « quand on booste, les côtés scintillent un peu en mode RGB, mais chaque niveau a sa couleur de base ») LE BOOST RGB : au boost,
   les bords quittent leur couleur pour un ARC-EN-CIEL qui court le long de la route (tout le spectre en ~60 m, `aS` = l'abscisse de la piste) et
   SCINTILLE (chaque tronçon de ~2,5 m tire son éclat 16 fois par seconde, un sur sept éclate en blanc) ; ils s'allument un peu plus fort (la lueur prend) ; lâché, la
   couleur de la map revient en ~0,3 s. C'est le trait des bords (`traitMat`, rails et nappe : leurs programmes à eux seuls) qui le peint, mené par
   trois uniformes (`BMAP_U`) : aucun programme de plus (mesuré : dbgProgs). `?bordsboost=0` = pas d'effet au boost. `dbgBordsMap()` (ce qui est posé),
   `dbgBordsMap('canyon',0x22e0c2)` (essayer une couleur), `dbgBordsMap('rgb',1)` (l'arc-en-ciel sans boost, pour les photos).
   (2026-10-18, Sacha : « change le RGB que Léo a mis sur le bord de la route pour qu'il soit de la même couleur que la traînée choisie par le joueur »)
   LA COULEUR DE LA TRAÎNÉE : au boost, les bords prennent la couleur de la traînée que porte la caisse (`bmapTrainee` : celle de la boutique, sinon la
   signature de la caisse, sinon l'orange du nitro) au lieu de l'arc-en-ciel ; le SCINTILLEMENT et les éclats blancs restent. La traînée ARC-EN-CIEL
   (et le chat) garde l'arc-en-ciel. `?bordsboost=rgb` = l'arc-en-ciel pour toutes (la version de Léo). Deux uniformes de plus, aucun programme de plus.
   (2026-10-18, Sacha : « il faut aussi que les côtés de la route clignotent, mais surtout le même jeu de lumière que la traînée : si la traînée a 70 % de
   pixels roses et 30 % de blancs, il faut le même jeu de clignotement ») LE JEU DE LUMIÈRE DE LA TRAÎNÉE : chaque tronçon de 2 m du bord devient un PIXEL
   du feu de la traînée — il change ~8 fois par seconde, chacun à son temps, et tire à chaque fois une des 10 nuances du feu (`NFEU.pal` : cœur blanc,
   couleur pleine, braise, fumée) dans la part qu'elle a DANS LE FEU à cet instant (`NFEU.part`, mesurée par nfeuPas sur la surface des cubes, lissée
   ~0,12 s), avec l'éclat ± 8 % de chaque cube. En réserve bleue et en nitro infinie, le feu change de palette : les bords aussi. `dbgBordsMap()`
   donne la palette et les parts (`trainee`). Uniformes : `uPal` (10 couleurs), `uCum` (parts cumulées) — toujours aucun programme de plus. */
const BMAP_PAL={nuages:0xf24aa0,jade:0x2ee8a6,foret:0xc8f03c,banquise:0x52d8ff,crypto:0xffc23a,espace:0x8c6bff,canyon:0x22e0c2,vitree:0x2f8cff,grotte:0x3ef0ff,dunes:0x1fd6ff}; // (2026-10-18) LES PROFONDEURS : les bords au bleu DIAMANT
const BMAP_B=!/[?&]bordsboost=0\b/.test(location.search);
const BMAP_ARC=/[?&]bordsboost=rgb\b/.test(location.search); // ?bordsboost=rgb : l'arc-en-ciel de Léo pour toutes les traînées (comparer)
const BMAP_PART0=[.07,.09,.11,.12,.13,.12,.11,.1,.08,.07]; // la part des 10 nuances avant le premier nitro (la durée de chacune dans la vie d'un cube : NFEU_B10) — remplacée par la mesure dès que le feu brûle
const BMAP={c:new THREE.Color(),g:new THREE.Color(),t:0,ph:0,cle:null,i:0,rgb:0,force:null};
function bmapCle(){const c=typeof LVL!=='undefined'&&LVL.cur;if(!c||PARK.on)return null; // la map de la palette (null : la ville au néon, le parc, une map sans couleur)
  const k=c.carte||(c.crypto?'crypto':c.vitre?'vitree':c.id==='orage'?'nuages':c.id);return BMAP_PAL[k]!=null?k:null;}
function bmapBoost(){ // L'ÉLAN DU BOOST → BMAP.rgb (part d'arc-en-ciel), BMAP.i (éclat en plus) ; fait défiler et scintiller l'arc-en-ciel (BMAP_U)
  let e=0,ig=0,pad=0,dt=0;
  try{const t=performance.now()*.001;dt=paused?0:Math.min(.1,Math.max(0,t-BMAP.t));BMAP.t=t; // (bordsTick tourne dès buildTrack : NFX et la course peuvent ne pas être nés)
    const vit=running&&!gameOver&&mode!=='boom';e=vit?NFX.len:0;ig=vit?NFX.ign*NFX.ign*NFX.ignK:0;pad=vit&&!nitroOn&&boost>0?1:0;}catch(x){}
  if(!BMAP_B)e=ig=pad=0;if(BMAP.force!=null)e=BMAP.force;
  BMAP.rgb=Math.min(1,.82*e+.3*ig);BMAP.i=.6*e+.15*pad; // NFX.len : il s'ouvre en ~0,1 s, se referme en ~0,3 s — le pad turbo allume un peu, sans arc-en-ciel
  BMAP.ph=(BMAP.ph+dt*(.45+.5*e))%1; // l'arc-en-ciel défile vers l'arrière (il double la vitesse de la caisse)
  BMAP_U.uRgb.value=BMAP.rgb;BMAP_U.uRgbT.value=BMAP.ph;BMAP_U.uRgbK.value=(BMAP.t*16)%997; // l'horloge du scintillement (×16 : l'arc-en-ciel en prend l'entier, les pixels de la traînée la moitié, chacun décalé)
  if(BMAP.rgb>.001)bmapTrainee();}
function bmapTrainee(){ // (2026-10-18, Sacha : « même couleur que la traînée », puis « le même jeu de lumière que la traînée ») → BMAP_U.uPal / uCum / uRgbM
  let F=null,arc=BMAP_ARC,P=null,W=null;
  try{F=FX_EFF||(CARS[level]&&CARS[level].fx)||null;if((NYAN.on&&!FX_EFF)||(F&&F.rainbow))arc=true;}catch(x){} // la traînée ARC-EN-CIEL (ou le chat) : les bords gardent l'arc-en-ciel de Léo
  if(arc){BMAP_U.uRgbM.value=0;return;}
  try{P=NFEU.pal;W=NFEU.part;}catch(x){} // le FEU DE PIXELS de la traînée, tel qu'il brûle : ses 10 nuances (celles de la traînée achetée, sinon l'orange du nitro ; bleuies en réserve, violettes en nitro infinie)…
  if(!P){let T9=null;try{T9=nfeuPalTrainee();}catch(x){}P=T9?T9.pal:NFEU_P10.f;} // (le feu n'a pas encore brûlé : la palette qu'il prendra)
  if(!W)W=BMAP_PART0; // … et la part de chacune, MESURÉE dans le feu à chaque image (nfeuPas : la surface de ses cubes, nuance par nuance)
  let nm=1e-3,s=0;for(let i=2;i<6;i++)nm=Math.max(nm,P[i][0],P[i][1],P[i][2]); // ramenées à la couleur pleine du feu (les nuances 2 à 5) : le cœur chauffé à blanc passe au-dessus (la lueur prend), la braise et la fumée en dessous
  for(let i=0;i<10;i++){const c=P[i];BMAP_U.uPal.value[i].set(Math.min(2.2,c[0]/nm),Math.min(2.2,c[1]/nm),Math.min(2.2,c[2]/nm));s+=W[i];}
  let a=0;for(let i=0;i<10;i++){a+=W[i];BMAP_U.uCum.value[i]=s>0?a/s:(i+1)/10;}BMAP_U.uCum.value[9]=1.01;BMAP_U.uRgbM.value=1;}
function bmapPeint(k){ // remplace la peinture des bords pour une map de la palette (appelée par bordsTick, à chaque image)
  const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf;BMAP.cle=k;bmapBoost();
  let kk=1;if(!contiMap())try{const kv=1-.6*LVL.nuit;if(kv<.999)kk=1/(.07+.93*kv);}catch(e){} // villeApres baissera les rails ×kr et la nappe ×kr² (les PICS DE JADE et CRYPTO CITY ne sont pas des six maps) : on l'annule d'avance — pleins la nuit
  BMAP.c.setHex(BMAP_PAL[k]);ROAD_U.uAcc.value.copy(BMAP.c); // le liseré des flancs et le reflet des flaques parlent la même couleur
  const dj=.7+.3*(1-jf),I=BMAP.i; // de jour à 70 % ; le boost rallume jusqu'au plein (et au-delà : la lueur — bloom — prend au-dessus de ~0,92)
  _c9.copy(BMAP.c).multiplyScalar(Math.min(1.9,dj+(1-dj)*Math.min(1,I)+.55*I)*kk);
  for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
  BMAP.g.copy(BMAP.c).multiplyScalar(1+1.6*I); // la nappe (additive) : sa couleur monte avec le boost, son opacité suit le jour
  const og=Math.min(1,.78*(.55+.45*(1-jf))+.22*Math.min(1,I))*kk*kk;if(og>1)BMAP.g.multiplyScalar(og); // (au-delà d'une opacité pleine, c'est la couleur qui porte le reste : la nappe additive reste pleine la nuit sous villeApres)
  for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i];if(m.userData.base!=null){m.color.copy(BMAP.g);m.opacity=Math.min(1,og);}}}
window.dbgBordsMap=function(k,hex){if(k==='rgb'){BMAP.force=hex==null?null:+hex;}else if(k&&hex!=null){BMAP_PAL[k]=hex;}if(k){bordsTick();try{villeApres();}catch(e){}if(paused&&POST_ON&&composer)composer.render();}
  return {boost:BMAP_B,cle:BMAP.cle,pal:Object.keys(BMAP_PAL).map(function(n){return n+' #'+('00000'+BMAP_PAL[n].toString(16)).slice(-6);}),
  rgb:+BMAP.rgb.toFixed(2),i:+BMAP.i.toFixed(2),force:BMAP.force,u:[+BMAP_U.uRgb.value.toFixed(2),+BMAP_U.uRgbT.value.toFixed(2),BMAP_U.uRgbK.value],trainee:BMAP_U.uRgbM.value?BMAP_U.uPal.value.map(function(v,i){return '#'+new THREE.Color(Math.min(1,v.x),Math.min(1,v.y),Math.min(1,v.z)).getHexString()+' '+Math.round(100*(BMAP_U.uCum.value[i]-(i?BMAP_U.uCum.value[i-1]:0)))+'%';}):'arc-en-ciel',rail:NEON_RAILS[0]?NEON_RAILS[0].color.toArray().map(function(x){return +x.toFixed(3);}):null,
  nappe:NEON_GLOW[0]?NEON_GLOW[0].color.toArray().map(function(x){return +x.toFixed(3);}).concat([+NEON_GLOW[0].opacity.toFixed(3)]):null};};
function bordsTick(){ // appelée par musicTick, APRÈS la peinture « caméléon » des rails et de la nappe
  skyU.uRose.value=villeRose()?1:0; // (plafrose, Sacha : « la ville la nuit = ROSE ») le plafond de la pluie et de l'orage retrouve sa lueur LILAS et son éclair violet en ville au néon
  BMAP_U.uRgb.value=0; // (2026-10-18, boost RGB) l'arc-en-ciel n'est posé que par bmapPeint (maps de la palette)
  if(villeRose())return; // (villerose) la ville au néon garde ses rails et sa nappe ROSES (la peinture caméléon d'avant)
  {const k9=bmapCle();if(k9){bmapPeint(k9);return;}} // (2026-10-17, Léo) LES BORDS DE LA MAP : la couleur de la map, et le boost (voir BMAP)
  if(routeSig()){const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf;_c9.setHex(LVL.cur&&LVL.cur.vitre?0x2f8cff:0xf24aa0) /* (2026-10-17, Léo) la VILLE VITRÉE : les bords de la route en BLEU */.multiplyScalar(.7+.3*(1-jf)); // (bible) la SIGNATURE : rails roses (70 % de jour, plein la nuit), nappe à 55 % de jour
    for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
    for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i],b=m.userData.base;if(b!=null)m.opacity=Math.min(1,b*(.55+.45*(1-jf)));}return;}
  const jf=(1-LVL.nuit)*(1-Math.min(1,LVL.pluie*1.5));BORDS.jf=jf; // 1 = plein jour sec ; 0 = nuit / pluie / orage (fondus par lvlStep au portail)
  _c9.copy(BORDS.nuit).multiplyScalar(BORDS.kNuit);_d9.copy(BORDS.jour).multiplyScalar(BORDS.kJ);_c9.lerp(_d9,jf);
  let kk=1,kg=BORDS.glowN*(1-jf);
  if(!contiMap())try{const nu=LVL.nuit,k=1-.6*nu;if(k<.999){kk=1/(.07+.93*k);kg*=kk*kk;}}catch(e){} // (continuité : villeApres ne baisse plus les néons des six maps) villeApres multipliera la couleur par kr et l'opacité par kr² : on l'annule d'avance
  _c9.multiplyScalar(kk);
  for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.copy(_c9);}
  for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i],b=m.userData.base;if(b!=null)m.opacity=Math.min(1,b*kg);}
}
window.dbgBords=function(o){if(o){for(const k in o){if(k==='jour'||k==='nuit')BORDS[k].setRGB(o[k][0],o[k][1],o[k][2]);else BORDS[k]=o[k];}bordsTick();if(paused&&POST_ON&&composer)composer.render();}return {jf:BORDS.jf,kJ:BORDS.kJ,kNuit:BORDS.kNuit,glowN:BORDS.glowN,fog:FOG_BASE.toArray(),fogS:scene.fog.color.toArray(),hemi:hemi.intensity,sun:sun.intensity,nuit:LVL.nuit,pluie:LVL.pluie,bio:BIO.name,acc:ROAD_U.uAcc.value.toArray(),rail:NEON_RAILS[0]?NEON_RAILS[0].color.toArray():null,glow:NEON_GLOW[0]?NEON_GLOW[0].opacity:null};}; // banc
let LIGNE_TEX=null;
/* (2026-10-07) LES TIRETS FILENT : la ligne centrale a un tiret tous les ~31 m. À 30 images par seconde (l'iPhone bride), passé ~1 100 km/h
   la caisse avance d'un tiers de période par image et les tirets se mettent à BÉGAYER (ils semblent ralentir, puis sauter — l'effet de la
   roue de charrette) : la sensation de vitesse s'effondre pile quand elle devrait exploser. Le tiret s'étire désormais de ce que la route
   parcourt pendant UNE image (`LIGNE_U.uFile`, en part de période, écrite par la boucle : vitesse × durée de l'image ÷ période, plafond .42) :
   quatre lectures de la carte le long de la route. Lent → rien ne change ; vite → des traits qui filent, comme sur une photo à la pose. */
const LIGNE_U={uFile:{value:0}},LIGNE_PER={v:30};
function ligneMat(){ // la peinture de la ligne centrale : tirets dans une texture mipmappée (voir buildTrack) — texture unique, matériau par piste
  if(!LIGNE_TEX){const cv=document.createElement('canvas');cv.width=4;cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#fff';c.fillRect(0,1,4,27);c.globalAlpha=.5;c.fillRect(0,0,4,1);c.fillRect(0,28,4,1); // 7/16 de tiret, bouts adoucis d'un texel
    LIGNE_TEX=new THREE.CanvasTexture(cv);LIGNE_TEX.wrapT=THREE.RepeatWrapping;
    LIGNE_TEX.anisotropy=Math.min(ALLEGE?4:8,renderer.capabilities.getMaxAnisotropy());} // vue RASANTE : sans anisotropie, la carte réduite gommerait les tirets dès 30 m
  // (2026-09-26, vague 2) la peinture passe du SODIUM doré (0xffc978) au BLANC lavande : sous le grade, les tirets se lisaient ORANGE,
  // une rangée de fausses pièces au milieu de la route. L'or ne sert qu'à ce qui rapporte ; la peinture n'est que de la peinture.
  const m9=traitMat(new THREE.MeshBasicMaterial({map:LIGNE_TEX,color:routeSig()?0xffd75e:0xf2eee6,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),1.2,2);
  const ob9=m9.onBeforeCompile;m9.onBeforeCompile=function(sh){ob9(sh);sh.uniforms.uFile9=LIGNE_U.uFile;
    sh.fragmentShader='uniform float uFile9;\n'+sh.fragmentShader.replace('#include <map_fragment>',
      '{vec4 texelColor=(texture2D(map,vUv+vec2(0.,uFile9*.375))+texture2D(map,vUv+vec2(0.,uFile9*.125))+texture2D(map,vUv-vec2(0.,uFile9*.125))+texture2D(map,vUv-vec2(0.,uFile9*.375)))*.25;'+
      'texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;}');};
  m9.customProgramCacheKey=function(){return 'ligneFile';}; /* (sa propre clé : le trait de même réglage n'a pas le filé) */
  return m9;
}
/* LES TRANCHES S'ALLUMENT (2026-09-26) — la dalle fait 2,6 m d'épaisseur, et ses flancs n'étaient qu'un bandeau violet-noir : vu d'avion
   (vol libre, plongeons, les étages de la spirale de la VILLE), le ruban se perdait dans la nuit des tours. Chaque flanc porte désormais
   un LISERÉ à l'accent de la zone à mi-hauteur, ponctué de CATADIOPTRES tous les 6 m (des tirets, pas des ronds) : on lit la route
   comme une structure, de loin et d'en dessous. Anticrénelé, et fondu en lueur moyenne quand il passe sous le pixel. Aucun sommet de
   plus (la géométrie reçoit seulement ses UV) ; la teinte est `ROAD_U.uAcc`, posée par buildTrack. */
function trancheMat(){
  const m=new THREE.MeshLambertMaterial({color:0x3a3833,side:THREE.DoubleSide});m.extensions={derivatives:true}; /* (2026-10-14, bords-route) le flanc en BÉTON sombre #3A3833 (c'était l'encre violette) ; liseré plus discret, catadioptres ambre (uAcc) */ // (vague 2) le flanc à l'ENCRE de la bible #1c0430 (c'était un gris-violet neutre 0x14101f)
  m.onBeforeCompile=function(sh){sh.uniforms.uAcc9=ROAD_U.uAcc;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vTr9;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTr9=uv;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uAcc9;varying vec2 vTr9;').replace('#include <fog_fragment>',
      '{float fy=max(fwidth(vTr9.y),1e-4),fx=max(fwidth(vTr9.x),1e-4);'+
      'float bd=1.-smoothstep(.025,.025+fx*1.5,abs(vTr9.x-.5));'+                                       // le liseré (13 cm sur 2,6 m)
      'float ce=(1.-smoothstep(.13,.13+fy/6.*1.5,abs(fract(vTr9.y/6.)-.5)))*step(abs(vTr9.x-.5),.09);'+ // les catadioptres : 1,5 m tous les 6 m
      'float lo=smoothstep(.5,1.6,fy);'+                                                                // un pixel couvre plus d un demi-mètre de route : la lueur moyenne
      'gl_FragColor.rgb+=uAcc9*(mix('+('bd*.30+ce*1.')+',.09,lo))*(1.-smoothstep(.08,.3,fx));}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'trancheV3';};
  return m;
}
const ROUTE_JOUR=[1.10,1.07,1.0]; /* (2026-10-14, passe graphismes) LE BÉTON : la base est déjà un gris neutre — le jour d'altitude le réchauffe et le relève un peu (vu au banc : le midi le tirait vers un gris-bleu sombre) ; il reste bien sous les nuages (c'était [.86,.94,.86], qui dé-violettait l'indigo) */ /* (niveau 1 v2) [1,1.12,.88] → plus SOMBRE : au banc le bitume du midi sortait gris clair (L* ~55), au niveau des nuages — la route doit être le ruban le plus sombre de l'image pour que la caisse orange et le ciel clair se lisent contre elle (L10 26 → 10) */ // (2026-09-30) la teinte du bitume au jour d'altitude (× la base violette 0x322e40 → un anthracite à peine bleuté)
const GLACE={k:1,nuages:.45,espace:.5,jade:.55,crypto:.5}; // (v11) l'émeraude est polie comme une pierre taillée — (v12) « beaucoup plus brillante » : .5 → .8 // (v9) le jade est POLI : il renvoie le ciel en rasant
const ROUTE_JADE=[1,1,.96]; /* (2026-10-14, passe graphismes) béton : un rien plus chaud aux PICS DE JADE (c'était [.95,1.04,.86] × la base violette) */ // (2026-10-09) LES PICS DE JADE : le bitume en gris de pierre (× la base violette) // (passe graphismes mobile) la part du ciel dans le bitume sec, par niveau (la VILLE a son eau) — `dbgGfx({glace:0})` = l'ancien bitume
const _px9=new THREE.Vector2();
/* LE BÉTON DE JOUR (2026-10-15 soir, Sacha : « les couleurs en plein jour sont mal gérées ») — MESURÉ sur les photos de course : en plein jour le
   béton sortait BLEU-VIOLET — nuages midi #5b5fb4 (saturation .37), matin #6d5eb1, forêt midi #516ad5 (.61), canyon midi #9f9cf4 (.80) — et non gris.
   La cause : la passe « vives » du même jour (Sacha : « les maps sont trop ternes, sature un peu plus ») a teinté le béton lui-même en ardoise bleue
   (BETON.t .86/.93/1.2), lui a fait prendre 40 % de la couleur de l'air (BETON.amb .22 → .4), puis l'étalonnage sature ×1,18 de plus. De JOUR,
   le béton revient vers une ardoise NEUTRE (ROUTE_JOUR_T) et ne prend plus que 15 % de l'air ; la nuit garde la passe « vives » telle quelle (et
   l'orbite, et les routes de jade). ROUTE_NEUTRE = la part (0,85). `?beton=bleu` = avant. */
const ROUTE_NEUTRE=/[?&]beton=bleu\b/.test(location.search)?0:.85,ROUTE_JOUR_T=[.95,1,.99],ROUTE_T9=[1,1,1];
/* LE CIEL DE JOUR SANS BLEU ÉLECTRIQUE (même demande) — MESURÉ : le zénith de midi sortait SATURÉ À BLOC, le rouge à ZÉRO — forêt #0058fd, canyon
   #0044f8 (saturation 1,00) : la passe « vives » (×1,18 sur chaque ambiance) poussait le bleu du ciel hors de l'écran. Le ciel de JOUR garde
   sa teinte mais sa chroma est ramenée (`cielSat` à la fin des programmes du ciel : plein, passe lisse, canyon) ; la nuit, l'orbite et le ciel de
   jade ne bougent pas. `?ciel=vif` = avant. */
const CIEL_DESAT=/[?&]ciel=vif\b/.test(location.search)?0:.5;
function routeTick(){ // le bitume suit le NIVEAU (fondu du portail : LVL.route / LVL.sheen, voir lvlStep)
  renderer.getDrawingBufferSize(_px9);TRAIT_U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,_px9.y); // la taille d'un pixel à 1 m (suit le FOV de vol et la résolution adaptative)
  const r=LVL.route;ROAD_U.uLift.value.setRGB(.010+.15*r,.009+.13*r,.016+.16*r); // (Paris) un gris d'asphalte NEUTRE, pas le violet de la nuit // ⚠ l'étalonnage de la pluie écrase le rouge et le vert : la clarté doit être NEUTRE et franche pour se lire (mesuré : (0,0,17) → (2,0,47) avec une clarté bleutée de .05)
  ROAD_U.uSheen.value=LVL.sheen;ROAD_U.uWet.value=LVL.pluie;ROAD_U.uVil.value=LVL.ville;try{ROAD_U.uEcl.value=CAMP_FLASH;}catch(e){} /* (2026-09-30) les enseignes reflétées : en VILLE seulement · l'éclair dans les flaques (CAMP_FLASH est déclaré plus bas : le try couvre l'init) */ // (2026-09-26) le bitume se mouille avec la pluie du niveau, au même fondu
  ROAD_U.uGlace.value=GLACE.k*(GLACE.nuages*LVL.mer+GLACE.espace*LVL.espace+GLACE.jade*(LVL.jade||0)+GLACE.crypto*(LVL.crypto||0))*(1-LVL.pluie);
  {const j9=Math.max(LVL.mer,LVL.crypto||0)*skyU.uJour.value,jd9=LVL.jade||0;ROAD_U.uTeinte.value.setRGB((1+(ROUTE_JOUR[0]-1)*j9)*(1+(ROUTE_JADE[0]-1)*jd9),(1+(ROUTE_JOUR[1]-1)*j9)*(1+(ROUTE_JADE[1]-1)*jd9),(1+(ROUTE_JOUR[2]-1)*j9)*(1+(ROUTE_JADE[2]-1)*jd9));} // (2026-09-30) LE JOUR D'ALTITUDE : l'asphalte des NUAGES en gris d'anthracite (le violet de la nuit, sous un ciel turquoise, se lisait en encre violette) // (passe graphismes mobile) le bitume GLACÉ des routes sèches — voir roadMat
  ROAD_U.uSheenCol.value.copy(scene.fog.color).multiplyScalar(.9); // (2026-09-26) ×1,5 → ×0,9 : la brillance rasante blanchissait tout le lointain
  {let rk9=1;try{rk9=BIO.cur.rtK;if(rk9==null)rk9=1;}catch(e9){} /* (2026-10-14, passe graphismes · contrôle) CLARTÉ DU BÉTON PAR AMBIANCE : `rtK` (1 par défaut, voir BIO_ETAL0) multiplie la clarté de niveau ET la teinte — le béton de jour était à L* 50-60 (cible 32-45) */ const jr9=ROUTE_NEUTRE*(1-Math.min(1,LVL.nuit||0))*(1-Math.min(1,LVL.espace||0))*(1-Math.min(1,LVL.jade||0)); /* (2026-10-15 soir) LE BÉTON DE JOUR (voir ROUTE_NEUTRE) */
   for(let c9=0;c9<3;c9++)ROUTE_T9[c9]=BETON.t[c9]+(ROUTE_JOUR_T[c9]-BETON.t[c9])*jr9;
   skyU.uCiel2.value=contiMap()?1:0; // (continuité) le ciel continu sur les six maps
   skyU.uSkySat.value=1-CIEL_DESAT*(contiMap()?.55:1)*(1-Math.min(1,LVL.nuit||0))*(1-Math.min(1,LVL.espace||0))*(1-Math.min(1,LVL.jade||0)); /* (2026-10-15 soir) LE CIEL DE JOUR SANS BLEU ÉLECTRIQUE (voir CIEL_DESAT) */
   const cm9=contiMap(),rA9=cm9&&BIO.cur.rtA!=null?BIO.cur.rtA:1, // (continuité) `rtA` : la part de l'air du lieu dans la clarté du béton (× ; la nuit, la brume violette teignait toute la route)
    b=BETON,f=scene.fog.color,fm=Math.max(f.r,f.g,f.b,.02),k=(b.lift0+b.lift*LVL.route)*rk9,a9=(b.amb+(.15-b.amb)*jr9)*rA9,w9=Math.min(1,ROAD_U.uWet.value), // (2026-10-14, passe graphismes) LE BÉTON BRUT — tout est valeur d'uniforme, rien de plus pour la puce :
    m9=ROUTE_T9,e9=rk9*(1+(b.ville-1)*LVL.ville)*(1+(b.espace-1)*LVL.espace)*(1-b.mouille*w9);
   ROAD_U.uLift.value.setRGB(k*(1-a9+a9*f.r/fm),k*(1-a9+a9*f.g/fm),k*(1-a9+a9*f.b/fm)); // la clarté de niveau en gris MINÉRAL (plus de violet), à peine teintée par l'air du lieu
   ROAD_U.uTeinte.value.r*=m9[0]*e9;ROAD_U.uTeinte.value.g*=m9[1]*e9;ROAD_U.uTeinte.value.b*=m9[2]*e9; // le béton mouillé FONCE (la pluie), chaque monde sa teinte
   if(cm9&&BIO.cur.rtT){const t9=BIO.cur.rtT;ROAD_U.uTeinte.value.r*=t9[0];ROAD_U.uTeinte.value.g*=t9[1];ROAD_U.uTeinte.value.b*=t9[2];} // (continuité) LE BITUME COMMUN : `rtT` corrige la teinte du béton par temps (voir CONTI) — le ciel bleu ×1,5 de saturation le peignait en pervenche
   ROAD_U.uSheen.value*=Math.min(1,w9+b.sheen); // MAT à sec : la brillance d'horizon ne vit que sous la pluie
   ROAD_U.uGlace.value=0;} // … et plus de « bitume glacé » : le béton sec ne renvoie pas le ciel
}
window.dbgBeton=function(o){if(o){for(const k in o){if(k==='col'){BETON.col=o.col;for(const m of trackMeshes)if(m.isMesh&&m.material&&m.material.userData&&m.material.userData.bitume)m.material.color.setHex(o.col);}else if(k==='jour'||k==='jade'){const A=k==='jour'?ROUTE_JOUR:ROUTE_JADE;A[0]=o[k][0];A[1]=o[k][1];A[2]=o[k][2];}else BETON[k]=o[k];}routeTick();if(paused&&POST_ON&&composer)composer.render();}return {BETON:BETON,jour:ROUTE_JOUR,jade:ROUTE_JADE,lift:ROAD_U.uLift.value.toArray(),teinte:ROAD_U.uTeinte.value.toArray(),sheen:ROAD_U.uSheen.value,glace:ROAD_U.uGlace.value,wet:ROAD_U.uWet.value};}; // banc (2026-10-14, passe graphismes) : le béton retouché à chaud
/* LES MATIÈRES D'UNE PISTE MEURENT APRÈS LA SUIVANTE (2026-09-26, passe perf, lot 4). MESURÉ à chaque portail et à chaque « rejouer » :
   6 shaders RECOMPILÉS (bitume, bandes, nappes…) — 40 à 160 ms d'image figée, pire sur iPhone. Libérer une matière relâche son programme ;
   s'il n'a plus d'autre utilisateur, three le DÉTRUIT, et la piste neuve (mêmes réglages, donc même programme) doit le recompiler. Les
   matières sortantes attendent donc 3 images rendues (`matSursisTick`, après le rendu de la boucle) : la piste neuve a déjà pris les mêmes
   programmes, la libération ne détruit plus rien. Une matière que la piste neuve a REPRISE n'est jamais libérée. */
const MAT_SURSIS=new Set();let matSursisN=0;
/* (2026-10-18, PASSE PERF, Léo : « optimisation des performances ») LE SURSIS NE SUFFIT PAS QUAND LA MAP SUIVANTE A UNE AUTRE ROUTE : le glacier
   (sa piste nue) ne reprend ni le bitume, ni la tranche, ni les rails, ni la ligne — leurs matières partaient, three DÉTRUISAIT leurs 5 programmes,
   et la map d'après (nuages…) les recompilait EN COURSE (MESURÉ, banc ×4 : 5 programmes à l'entrée de la map qui suit le glacier).
   Comme `CAR_GARDE` pour les caisses : la 1re matière de route vue de chaque programme n'est jamais libérée (`PISTE_GARDE`) — un programme de route
   compilé une fois l'est pour la session. Coût : une poignée de matières gardées (leurs textures sont celles de toutes les routes). */
const PISTE_GARDE=new Map();
function pisteGarde(m){const pp=renderer.properties.get(m).programs;if(!pp)return false;
  let g=false;for(const k of pp.keys())if(!PISTE_GARDE.has(k)){PISTE_GARDE.set(k,m);g=true;}
  return g;}
function matSursisTick(){
  if(!MAT_SURSIS.size||--matSursisN>0)return;
  const vif=new Set();for(const m of trackMeshes)if(m.material)vif.add(m.material);
  for(const m of MAT_SURSIS)if(!vif.has(m)&&!pisteGarde(m))m.dispose();
  MAT_SURSIS.clear();
}
