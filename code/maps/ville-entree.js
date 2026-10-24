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
function adoucirPentes(P,o){
  const y0=P.map(function(p){return p.y;});
  for(let i=1;i<P.length;i++){const h=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z),dy=y0[i]-y0[i-1],g=h>.5?Math.abs(dy)/h:0;
    P[i].y=P[i-1].y+(g>o.seuil?Math.sign(dy)*(o.seuil+(g-o.seuil)*o.garde)*h:dy);}
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
  const sansLoop=typeof LVL!=='undefined'&&LVL.cur&&(LVL.cur.id==='ville'||LVL.cur.id==='paris'); // (Paris : on survole les toits, pas de looping)
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
  const sgn=()=>rnd()<.5+hand*.22?1:-1;
  // ---- HUMEUR DE LA ZONE : deux FLOW ne doivent PAS se ressembler ----
  // Les poids étaient FIXES par archétype : à la longue, toutes les zones d'un même archétype
  // sortaient statistiquement jumelles (« on a l'impression que la génération est toujours pareille »).
  // On secoue les poids à CHAQUE zone : celle-ci sera obsédée par les esses, la suivante par les
  // tire-bouchons. Le CARACTÈRE de l'archétype tient (un 0 reste un 0), seule l'humeur change.
  const TORDU=hautOn(),TW=TORDU; // TW : (2026-10-18) LES VIRAGES DE COURSE sur la route tordue des nuages
  const W=((ESPON?AR.wv.map(function(v,k){return v*(MC?ESP_ROUTE.wm:ESP_ROUTE.w)[k];}):AR.w)).map(v=>v*(0.35+rnd()*1.7)).map(function(v,k){return TW?v*TORD_W[k]:v;}).map(function(v,k){return MC&&!ESPON?v*VILLE_WM[k]:v;}); // (vague 3) la VILLE a ses poids à grands virages (voir `wv`) · (2026-10-18) la route tordue, les siens (TORD_W) — même nombre de tirages
  const wsum=W.reduce((a,b)=>a+b,0);
  const pick=()=>{let x=rnd()*wsum;for(let k=0;k<13;k++){x-=W[k];if(x<0)return k;}return 5;};
  const AMP=TORDU?TORD_AMP:1; // (2026-10-15) LA ROUTE SANS HAUT NI BAS EN GRAND : la zone est tirée AMP fois plus courte, puis tout est agrandi AMP fois (voir TORD_AMP)
  const LC9=longueurCible(),LEN=LC9?Math.max(1500,LC9-220*LV-260)/AMP:14400*(1+Math.min(1.5,(LV-1)*.55))/AMP; // (LA DURÉE DES MAPS, 2026-10-18) au JOUER : la longueur visée, moins le départ et l'arrivée posés hors de la boucle // (2026-09-25, user : « double la longueur de chaque niveau ») 7200 → 14400 — et plus longues encore à haute vitesse
  // ---- LE VIRAGE À FILET (voir FILET) : NUAGES seulement ; son hasard a SON générateur (un seul tirage de `rnd`, et seulement ici) ----
  FILETMARK.length=0;MODMARK.length=0;
  const FILON=FILET.on&&typeof LVL!=='undefined'&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!LVL.cur.piste&&!(typeof PARK!=='undefined'&&PARK.on);
  const rf=FILON||MC?mulberry32((rnd()*4294967296)>>>0):null; // (2026-10-18) les MODULES DE CHAQUE MAP tirent aussi dans `rf` (un seul `rnd` de plus, seulement sur leurs maps)
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
  const modTire=()=>{for(let e=0;e<12;e++){if(!modPaq.length){const t=[0,1,2,3,4];for(let i=4;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)modPaq.push(x);}
    const m=modPaq.shift();if(m===modLast||(m===0&&filN>=filMax))continue;return m;}return 3;};
  const lacets=()=>{const n=2+(rf()<.5?1:0),sg0=rf()<.5?1:-1,R=(62+rf()*20)*RS,leg=(150+rf()*80)*LV,drop=(34+rf()*10)*LV,aE=172/Math.max(1,Math.sqrt(LV*.7));
    straight(90*LV,-6*LV,2); // l'approche : on voit la première épingle venir
    for(let k=0;k<n;k++){const sg=k%2?-sg0:sg0;straight(leg,-drop*.55,3);arc(sg*aE,R,8,-drop*.45);}
    straight(leg*.8,-drop*.4,3);};
  const russes=()=>{const n=3+(rf()<.5?1:0),sg=rf()<.5?1:-1;straight(90*LV,-4*LV,2);
    for(let k=0;k<n;k++){const h=(16+rf()*10)*LV;courbe((80+rf()*25)*LV,h,sg*(4+rf()*4),2);courbe((110+rf()*30)*LV,-(h+(10+rf()*8)*LV),sg*(4+rf()*4),3);}
    straight(100*LV,-6*LV,2);};
  const plongeonG=()=>{const L1=(200+rf()*80)*LV;straight(100*LV,4*LV,2);straight(L1,-L1*.46,4); // la lèvre, puis ~25° qu'on voit venir
    arc((rf()<.5?1:-1)*(40+rf()*30),(150+rf()*70)*RS,4,-12*LV);straight(140*LV,-6*LV,2);}; // la compression : un grand virage presque plat
  const chameau=()=>{const sg=rf()<.5?1:-1;courbe((140+rf()*40)*LV,(22+rf()*10)*LV,sg*5,3);courbe((220+rf()*60)*LV,-(70+rf()*25)*LV,sg*8,3);straight(100*LV,-6*LV,2);};
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
  const tSlalom=()=>{const n=5+((rf()*3)|0),R=(1.9+rf()*.5)*rP;let sg=rf()<.5?1:-1;straight(70*LV*Z,-4*LV*Z,1);
    for(let k=0;k<n;k++){const a=38+rf()*14;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);sg=-sg;}straight(70*LV*Z,-4*LV*Z,1);};
  const tEpingle=()=>{const sg=rf()<.5+hand*.22?1:-1,R=(1.7+rf()*.3)*rP,a=165+rf()*20;straight(150*LV*Z,-6*LV*Z,2);
    arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);straight(130*LV*Z,-6*LV*Z,2);};
  const tCorde=()=>{const sg=rf()<.5+hand*.22?1:-1,R=(2+rf()*.5)*rP;straight(100*LV*Z,-5*LV*Z,1);
    for(let k=0;k<2;k++){const a=80+rf()*25;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);if(!k)straight((60+rf()*40)*LV*Z,-3*LV*Z,1);}straight(100*LV*Z,-5*LV*Z,1);};
  const tEsses=()=>{let sg=rf()<.5?1:-1;const R=(2.4+rf()*.7)*rP;straight(60*LV*Z,-3*LV*Z,1);
    for(let k=0;k<3;k++){const a=70+rf()*25;arc(sg*a,R*Z,Math.ceil(a/10),-a/57.3*R*Z*.03);sg=-sg;}straight(60*LV*Z,-3*LV*Z,1);};
  const tRusses=()=>{const n=3+(rf()<.5?1:0),sg=rf()<.5?1:-1;straight(90*LV*Z,-4*LV*Z,2);
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
  const mAngles=()=>{const n=3+(rf()<.5?1:0),R=(1.75+rf()*.35)*rP;let sg=rf()<.5+hand*.22?1:-1;straight(80*LV,-4*LV,1);
    for(let k=0;k<n;k++){const a=80+rf()*15;arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.05);sg=-sg;if(k<n-1)straight((70+rf()*60)*LV,-(4+rf()*4)*LV,1);}straight(80*LV,-4*LV,1);};
  const mBretelle=()=>{const sg=rf()<.5+hand*.22?1:-1,R=(2+rf()*.4)*rP,a=200+rf()*50;straight(110*LV,-5*LV,2);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.07);straight(110*LV,-5*LV,2);};
  const mBougie=()=>{const sg=rf()<.5?1:-1,L1=(90+rf()*30)*LV,L2=(140+rf()*40)*LV;straight(40*LV,-2*LV,1); // (2e tour) plus courte : 0,3-0,4 km au lieu de 0,6-0,8
    courbe(L1,L1*(.17+rf()*.05),sg*(40+rf()*12),4);courbe(40*LV,1.5*LV,sg*6,2);courbe(L2,-L2*(.26+rf()*.04),-sg*(16+rf()*8),4); /* le pump TOURNE (35-47°), le dump reste presque droit : c'est là qu'on se pose */straight(90*LV,-5*LV,2);};
  const mDents=()=>{const n=4+(rf()<.5?1:0),R=(2+rf()*.5)*rP;let sg=rf()<.5?1:-1;straight(70*LV,-3*LV,1);
    for(let k=0;k<n;k++){const a=40+rf()*20,l=a/57.3*R;arc(sg*a,R,Math.ceil(a/10),k%2?-l*(.2+rf()*.06):l*(.12+rf()*.06));sg=-sg;}straight(80*LV,-4*LV,1);};
  const mTour=()=>{const sg=rf()<.5+hand*.22?1:-1,R=(2+rf()*.4)*rP,a=300+rf()*40;straight(120*LV,0,2);arc(sg*a,R,Math.ceil(a/10),0);straight(160*LV,0,2);};
  const mFronde=()=>{const sg=rf()<.5+hand*.22?1:-1,R=(1.9+rf()*.5)*rP,a=200+rf()*60;straight(90*LV,-4*LV,2);arc(sg*a,R,Math.ceil(a/10),-a/57.3*R*.04);straight(150*LV,-6*LV,2);};
  const mHoule=()=>{const n=3+(rf()<.5?1:0),R=(2+rf()*.4)*rP;let sg=rf()<.5?1:-1;straight(80*LV,-3*LV,1); // chaque vague = un virage de 50-70° : on monte dans sa première moitié, on plonge dans la seconde
    for(let k=0;k<n;k++){const a=50+rf()*20,h=(10+rf()*6)*LV;arc(sg*a*.5,R,Math.ceil(a/20),h);arc(sg*a*.5,R,Math.ceil(a/20),-(h+(6+rf()*4)*LV));sg=-sg;}straight(90*LV,-4*LV,1);};
  const MCJ=!MC?null:MC==='crypto'?[mBougie,mDents,tSlalom,tEpingle]:MC==='vitree'?[mTour,mAngles,tSlalom,tEsses]:MC==='espace'?[mFronde,mHoule,tSlalom,tCorde,tEsses]:[mAngles,mBretelle,tSlalom,tCorde];
  const mcPaq=[];let mcLast=-1,mcNext=Math.min(700*LV,LEN*.15); // (LA DURÉE DES MAPS) une map courte garde au moins un module
  const mcTire=()=>{for(let e=0;e<8;e++){if(!mcPaq.length){const t=MCJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rf()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)mcPaq.push(x);}
    const m=mcPaq.shift();if(m===mcLast)continue;return m;}return 0;};
  const filet=()=>{
    const sg=rf()<.5+hand*.22?1:-1,R=(95+rf()*45)*RS,th=(55+rf()*20)*Math.PI/180,Re=R+ROAD_HALF;
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
    if(MC)courbe(E9.rampe*LV,-E9.chute*LV,(rf()<.5?1:-1)*(48+rf()*14),6);else // (2e tour) avec les modules, la grande rampe plonge EN VIRAGE (48-62°)
    straight(E9.rampe*LV,-E9.chute*LV,6);VILLE_ENTREE={pA:ctrl[iA9],pB:ctrl[ctrl.length-1]}; // (les points eux-mêmes : les adoucissements les déplacent, la ville lit leur place FINALE)
  }else straight(110*LV,-70*LV,2); // DÉPART : ligne droite, rallongée avec la vitesse (était 170 m + la caisse)
  if(MODT)modNext=Math.min(900*LV*Z,LEN*.18); // (LA DURÉE DES MAPS) une map courte garde au moins un module // (2026-10-18) le 1er module de course ~900 m après le départ (VRAIS mètres : la zone est tirée au 1/AMP)
  while(approx<LEN){
    if(MC&&approx>mcNext&&approx<LEN-Math.min(600*LV,LEN*.3)){const m=mcTire(),iM9=ctrl.length-1;mcLast=m; // (2e tour) jusqu'à 0,6 km du bout : le dernier 1,5 km faisait de longues droites // (2026-10-18) LES MODULES DE CHAQUE MAP (voir mAngles…)
      MCJ[m]();MODMARK.push({i0:iM9,i1:ctrl.length-1});mcNext=approx+(MC==='espace'?300+rf()*300:300+rf()*250)*LV;continue;} // (2e tour) un module tous les 0,3-0,6 km × LV
    if(MODT&&approx>modNext&&approx<LEN-Math.min(1500*LV*Z,LEN*.3)){const m=modTire(),iM9=ctrl.length-1;modLast=m; // (2026-10-18) LES MODULES DE COURSE (voir tSlalom…) — même paquet, même hasard `rf`
      if(m===0)tSlalom();else if(m===1)tEpingle();else if(m===2)tCorde();else if(m===3)tEsses();else tRusses();
      MODMARK.push({i0:iM9,i1:ctrl.length-1});
      modNext=approx+(500+rf()*400)*LV*Z;continue;}
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
  if(MC){const m=mcTire(),iM9=ctrl.length-1;mcLast=m;MCJ[m]();MODMARK.push({i0:iM9,i1:ctrl.length-1});} // (2e tour) avec les modules, la zone se clôt par un MODULE (les signatures FLOW, ALPIN… étaient de grandes courbes ou des droites)
  else if(AR.nm==='VOLTIGE'){straight(120,-30,2);}
  else if(AR.nm==='ALPIN'){straight(90,-50);straight(80,26);droiteM();} // ALPIN se clôt sur une droite de momentum avant le portail
  else if(AR.nm==='FLOW'){arc(sgn()*110,220*Math.min(2,LV),6,-160);}
  else if(AR.nm==='TECH'){let sgF=sgn();for(let q=0;q<3;q++){arc(sgF*24,90*RS,2,-26);sgF=-sgF;}}
  else{const sg=sgn();arc(sg*100,170*RS,5,-(100*Math.PI/180*170*RS*.3));} // (route v3) un grand virage de fin, plus la spirale de 420°
  straight(110*LV,-66*LV,2); // ARRIVÉE : ligne droite claire vers le portail
   // (vague 3) en VILLE l'altitude ne vient plus des motifs : un PROGRAMME 40 % descente · 30 % montée · 30 % plat (NUAGES et ORBITE : la pente d'avant, voir `wv`)
  if(sansLoop)adoucirPentes(ctrl,VILLE_PENTE); // (vague 3) la VILLE descend moins raide — AVANT les lissages, qui arrondissent le résultat
  lisserRaccords(ctrl);   // (route v3b) plus de cassure de pente d'un motif à l'autre
  if(ESPON)adoucirPentes(ctrl,ESP_ROUTE.pente); // (2026-09-30) l'ESPACE en houle : les pentes raides comprimées (AVANT les lissages)
  adoucirCretes(ctrl,ESPON?ESP_ROUTE.cretes:1);    // plus de crête AVEUGLE (voir la fonction) — en ESPACE, arrondies 2,5× plus
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
function lisserRaccords(P){
  for(let pass=0;pass<3;pass++){const y=P.map(function(p){return p.y;});
    for(let i=1;i<P.length-1;i++){
      const a=P[i-1],b=P[i],c=P[i+1],h1=Math.max(1,Math.hypot(b.x-a.x,b.z-a.z)),h2=Math.max(1,Math.hypot(c.x-b.x,c.z-b.z));
      const yl=y[i-1]+(y[i+1]-y[i-1])*h1/(h1+h2); // l'altitude qu'aurait une pente CONTINUE à cet endroit
      P[i].y=y[i]*.5+yl*.5;}}
}
function adoucirCretes(P,k){ // k : l'exigence (1 = la règle d'origine ; .4 en ESPACE : une cassure de pente 2,5× plus douce)
  k=k||1;
  for(let pass=0;pass<6;pass++){let bouge=false;
    for(let i=1;i<P.length-1;i++){
      const a=P[i-1],b=P[i],c=P[i+1],h1=Math.hypot(b.x-a.x,b.z-a.z),h2=Math.hypot(c.x-b.x,c.z-b.z);
      if(h1<4||h2<4)continue;
      const g1=(b.y-a.y)/h1,g2=(c.y-b.y)/h2,seuil=(g1>-.05?.30:.45)*k; // crête franche : 0,30 · lèvre d'une descente qui s'accentue : 0,45
      if(g1-g2>seuil){b.y-=(g1-g2-seuil)/(1/h1+1/h2);bouge=true;}
      else if(g2-g1>.40*k){b.y+=(g2-g1-.40*k)/(1/h1+1/h2);bouge=true;} // (route v3b) le CREUX aussi : un fond de cuvette trop sec, la caisse y tapait
    }
    if(!bouge)break;}
}
