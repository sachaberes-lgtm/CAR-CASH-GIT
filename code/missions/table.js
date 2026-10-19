/* ===== LES MISSIONS v2 — LA TABLE (2026-10-16, Sacha : « on remplace tout le système actuel de défis en carnets / groupes de 3 par des
   MISSIONS libres ; toutes les missions sont ouvertes en même temps, sans ordre imposé ») =====
   Une ligne par mission : `id` (2 à 12 lettres a-z0-9 : c'est la clé de la sauvegarde, ne jamais la renommer), `f` la famille
   (exploit · aura · argent · moteur · collection · exploration · secret), `k` ce qu'on mesure (voir m2Val), `v` le seuil ('tot' = tout
   le lot, compté au chargement), `r` la récompense — {cash} versé en banque · {car:'NOM'} une caisse · {cat,id} un habillage · {vide:1}
   (récompense à définir par Sacha : l'emplacement existe, vide). `t`/`en` le texte ({v} = le seuil), `u` l'unité de la barre
   ('' nombre · 's' secondes · 'kmh' · '$' · 'aura' · 'b' oui/non · 'mn' minutes:secondes).
   ⚠ Un objet donné par une mission ne s'achète plus : le patch de CAR_UNLOCK juste dessous, celui de COSM après les peintures.
   Les SECRÈTES (`f:'secret'`) ne se montrent qu'une fois trouvées. Console : dbgMissions(). Les seuils sont ceux de la demande de
   Sacha ; les mesures (atteignables ou non) sont au journal, « LES MISSIONS v2 ». */
const M2=[
  // EXPLOITS — à réussir en une seule partie
  {id:'fig2',f:'exploit',k:'fig',v:2,u:'',r:{cash:1000},t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
  {id:'fig5',f:'exploit',k:'fig',v:5,u:'',r:{car:'LE SCARABÉE'},t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
  {id:'air5',f:'exploit',k:'airP',v:5,u:'s',r:{cash:2000},t:'RESTE {v} S EN L\'AIR, PUIS POSE-TOI EN PARFAIT',en:'STAY {v} S IN THE AIR, THEN LAND A PERFECT'},
  {id:'parf10',f:'exploit',k:'parf',v:10,u:'',r:{car:'LE COMBI'},t:'FAIS {v} POSES PARFAITES D\'AFFILÉE',en:'LAND {v} PERFECTS IN A ROW'},
  {id:'fren',f:'exploit',k:'fren',v:1,u:'b',r:{cash:10000},t:'ATTEINS LA FRÉNÉSIE',en:'REACH FRENZY'},
  {id:'fren30',f:'exploit',k:'frenT',v:30,u:'s',r:{cash:25000},t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'}, // (2026-10-19, Sacha) avant : traînée sang — absente du garage, l'argent à la place
  {id:'kmh1000',f:'exploit',k:'kmh',v:1000,u:'kmh',r:{car:'LA DOLORÈS'},t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'vie5min',f:'exploit',k:'vie',v:300,u:'mn',r:{cash:30000},t:'TIENS 5 MIN SANS MOURIR',en:'SURVIVE 5 MIN WITHOUT DYING'}, // (2026-10-19, Sacha) avant : LA JEEP — absente du garage, l'argent à la place
  {id:'tours5',f:'exploit',k:'tours',v:5,u:'',r:{cash:20000},t:'FRÔLE {v} TOURS DANS UN SEUL SAUT (LA VILLE)',en:'SKIM {v} TOWERS IN ONE JUMP (THE CITY)'}, // (2026-10-19, Sacha) avant : LE TAXI JAUNE — absente du garage, l'argent à la place
  {id:'parfmaps',f:'exploit',k:'cartesP',v:'tot',u:'',r:{car:'LA STRATOS'},t:'POSE-TOI EN PARFAIT SUR CHAQUE MAP',en:'LAND A PERFECT ON EVERY MAP'}, // (proposition de la demande : LA STRATOS, à valider par Sacha)
  // AURA — le record d'une partie
  {id:'aura10k',f:'aura',k:'aura',v:10000,u:'aura',r:{cash:15000},t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'aura20k',f:'aura',k:'aura',v:20000,u:'aura',r:{cash:30000},t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'aura50k',f:'aura',k:'aura',v:50000,u:'aura',r:{cat:'aile',id:'phenix'},t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  // ARGENT — le total ACCUMULÉ depuis le début (pas le solde en banque)
  {id:'cash100k',f:'argent',k:'gagne',v:100000,u:'$',r:{cat:'peinture',id:'vaporwave'},t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  {id:'cash500k',f:'argent',k:'gagne',v:500000,u:'$',r:{cat:'peinture',id:'lave'},t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  {id:'cash1m',f:'argent',k:'gagne',v:1000000,u:'$',r:{cat:'peinture',id:'holo'},t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  {id:'cash2m',f:'argent',k:'gagne',v:2000000,u:'$',r:{cat:'peinture',id:'or'},t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  // MOTEUR — le record d'une partie (le palier affiché = index + 1)
  {id:'eng10',f:'moteur',k:'eng',v:10,u:'',r:{cash:5000},t:'MONTE AU PALIER {v} DU MOTEUR',en:'REACH ENGINE TIER {v}'},
  {id:'eng20',f:'moteur',k:'eng',v:20,u:'',r:{cash:15000},t:'MONTE AU PALIER {v} DU MOTEUR',en:'REACH ENGINE TIER {v}'},
  {id:'eng30',f:'moteur',k:'eng',v:30,u:'',r:{cat:'trainee',id:'foudre'},t:'MONTE AU PALIER {v} DU MOTEUR',en:'REACH ENGINE TIER {v}'},
  // COLLECTION — ce que le joueur possède (« toutes » : sans les objets gagnés par mission)
  {id:'car5',f:'collection',k:'cars',v:5,u:'',r:{cash:50000},t:'COLLECTE {v} VOITURES',en:'COLLECT {v} CARS'},
  {id:'car10',f:'collection',k:'cars',v:10,u:'',r:{cash:150000},t:'COLLECTE {v} VOITURES',en:'COLLECT {v} CARS'},
  {id:'car20',f:'collection',k:'cars',v:20,u:'',r:{cash:300000},t:'COLLECTE {v} VOITURES',en:'COLLECT {v} CARS'},
  {id:'carall',f:'collection',k:'carsT',v:'tot',u:'',r:{car:'LE TRÔNE CENTRAL'},t:'COLLECTE TOUTES LES VOITURES',en:'COLLECT EVERY CAR'},
  {id:'col5',f:'collection',k:'peint',v:5,u:'',r:{cash:10000},t:'COLLECTE {v} COULEURS',en:'COLLECT {v} PAINTS'},
  {id:'col10',f:'collection',k:'peint',v:10,u:'',r:{cash:10000},t:'COLLECTE {v} COULEURS',en:'COLLECT {v} PAINTS'},
  {id:'colall',f:'collection',k:'peintT',v:'tot',u:'',r:{cat:'peinture',id:'guerrier'},t:'COLLECTE TOUTES LES COULEURS',en:'COLLECT EVERY PAINT'},
  {id:'tr5',f:'collection',k:'trainee',v:5,u:'',r:{cash:3000},t:'COLLECTE {v} TRAÎNÉES',en:'COLLECT {v} TRAILS'},
  {id:'tr10',f:'collection',k:'trainee',v:10,u:'',r:{cash:10000},t:'COLLECTE {v} TRAÎNÉES',en:'COLLECT {v} TRAILS'},
  {id:'trall',f:'collection',k:'traineeT',v:'tot',u:'',r:{cash:50000},t:'COLLECTE TOUTES LES TRAÎNÉES',en:'COLLECT EVERY TRAIL'},
  {id:'ai5',f:'collection',k:'aile',v:5,u:'',r:{cash:3000},t:'COLLECTE {v} AILES',en:'COLLECT {v} WINGS'},
  {id:'ai10',f:'collection',k:'aile',v:10,u:'',r:{cash:10000},t:'COLLECTE {v} AILES',en:'COLLECT {v} WINGS'},
  {id:'aiall',f:'collection',k:'aileT',v:'tot',u:'',r:{cash:50000},t:'COLLECTE TOUTES LES AILES',en:'COLLECT EVERY WING'},
  {id:'fig3',f:'collection',k:'figure',v:3,u:'',r:{cash:3000},t:'COLLECTE {v} FIGURES',en:'COLLECT {v} TRICKS'},
  {id:'fig8',f:'collection',k:'figure',v:8,u:'',r:{cash:10000},t:'COLLECTE {v} FIGURES',en:'COLLECT {v} TRICKS'},
  {id:'figall',f:'collection',k:'figureT',v:'tot',u:'',r:{cash:50000},t:'COLLECTE TOUTES LES FIGURES',en:'COLLECT EVERY TRICK'},
  {id:'toutall',f:'collection',k:'toutT',v:'tot',u:'',r:{cash:500000},t:'COLLECTE TOUS LES OBJETS DU JEU',en:'COLLECT EVERYTHING IN THE GAME'}, // (2026-10-19, Sacha) avant : {vide:1}, la récompense à définir — c'est l'argent
  // EXPLORATION
  {id:'maps',f:'exploration',k:'cartes',v:'tot',u:'',r:{car:'L\'ORIGAMI'},t:'JOUE SUR CHAQUE MAP AU MOINS UNE FOIS',en:'PLAY EVERY MAP AT LEAST ONCE'},
  // SECRÈTES — invisibles tant qu'elles ne sont pas trouvées ; chacune donne une caisse, montrée en silhouette noire à la boutique (2026-10-19 : six d'entre elles donnent de l'ARGENT, leur caisse n'étant plus au garage — une secrète en argent n'a pas de scène de révélation, elle se RÉCUPÈRE comme les autres)
  {id:'morts100',f:'secret',k:'morts',v:100,u:'',r:{car:'LE CORBILLARD'},t:'MEURS {v} FOIS',en:'DIE {v} TIMES'},
  {id:'mort3s',f:'secret',k:'flag',v:1,u:'b',r:{cash:5000},t:'MEURS DANS LES 3 PREMIÈRES SECONDES',en:'DIE IN THE FIRST 3 SECONDS'}, // (2026-10-19, Sacha) avant : LA SANS-PERMIS — absente du garage, l'argent à la place
  {id:'arret',f:'secret',k:'flag',v:1,u:'b',r:{cash:5000},t:'RESTE À L\'ARRÊT JUSQU\'À EXPLOSER',en:'STAND STILL UNTIL YOU BLOW UP'}, // (2026-10-19, Sacha) avant : LE GRILLE-PAIN — absente du garage, l'argent à la place
  {id:'nitplein',f:'secret',k:'flag',v:1,u:'b',r:{cash:10000},t:'MEURS LA JAUGE DE NITRO PLEINE',en:'DIE WITH A FULL NITRO TANK'}, // (2026-10-19, Sacha) avant : LA BOULE — absente du garage, l'argent à la place
  {id:'air0',f:'secret',k:'flag',v:1,u:'b',r:{car:'LE SPECTRE'},t:'MEURS PILE À 0 S DE VOL RESTANT',en:'DIE WITH EXACTLY 0 S OF AIRTIME LEFT'},
  {id:'kmh2000',f:'secret',k:'kmh',v:2000,u:'kmh',r:{car:'LE MUR DU SON'},t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'cratere',f:'secret',k:'flag',v:1,u:'b',r:{car:'LA FOURNAISE'},t:'MEURS AU-DESSUS DU CRATÈRE DU VOLCAN',en:'DIE ABOVE THE VOLCANO CRATER'},
  {id:'lave',f:'secret',k:'flag',v:1,u:'b',r:{car:'L\'AIGLE DE FEU'},t:'ROULE DANS LA LAVE',en:'DRIVE INTO THE LAVA'},
  {id:'geyser',f:'secret',k:'flag',v:1,u:'b',r:{car:'ATCHOUM'},t:'TRAVERSE UN GEYSER',en:'FLY THROUGH A GEYSER'},
  {id:'abysse',f:'secret',k:'prof',v:'prof',u:'',r:{car:'SQUALE'},t:'DESCENDS AU FOND DE LA MER DE JADE',en:'DIVE TO THE BOTTOM OF THE JADE SEA'},
  {id:'nuage30',f:'secret',k:'vol',v:30,u:'s',r:{car:'LA CAISSE-NUAGE'},t:'RESTE {v} S EN L\'AIR AU-DESSUS DES NUAGES',en:'STAY {v} S IN THE AIR ABOVE THE CLOUDS'},
  {id:'terre',f:'secret',k:'flag',v:1,u:'b',r:{car:'COMÈTE'},t:'FAIS UN SALTO DEVANT LA TERRE',en:'FLIP IN FRONT OF THE EARTH'},
  {id:'lac10',f:'secret',k:'lac',v:10,u:'s',r:{cash:15000},t:'GLISSE {v} S SUR UN LAC GELÉ',en:'SLIDE {v} S ON A FROZEN LAKE'}, // (2026-10-19, Sacha) avant : LE GLACIER — absente du garage, l'argent à la place
  {id:'sansnit',f:'secret',k:'flag',v:1,u:'b',r:{car:'LA SILENCIEUSE'},t:'FAIS UNE PARTIE ENTIÈRE SANS TOUCHER NITRO',en:'PLAY A WHOLE RUN WITHOUT TOUCHING NITRO'},
  {id:'sanspiece',f:'secret',k:'flag',v:1,u:'b',r:{cash:15000},t:'FAIS UNE PARTIE SANS RAMASSER UNE SEULE PIÈCE',en:'PLAY A WHOLE RUN WITHOUT PICKING UP A COIN'}, // (2026-10-19, Sacha) avant : LA DEUCHE — absente du garage, l'argent à la place
  {id:'rejoue10',f:'secret',k:'rejoue',v:10,u:'',r:{car:'LE DOGE'},t:'REJOUE {v} FOIS DE SUITE SANS REVENIR AU MENU',en:'REPLAY {v} TIMES IN A ROW WITHOUT THE MENU'},
  {id:'nuit3h',f:'secret',k:'flag',v:1,u:'b',r:{car:'LA NOCTAMBULE'},t:'JOUE À 3 H DU MATIN',en:'PLAY AT 3 AM'},
  {id:'jours7',f:'secret',k:'jours',v:7,u:'',r:{cash:25000},t:'JOUE {v} JOURS DIFFÉRENTS',en:'PLAY ON {v} DIFFERENT DAYS'}, // (2026-10-19, Sacha) avant : LA DÉESSE — absente du garage, l'argent à la place
  {id:'jours30',f:'secret',k:'jours',v:30,u:'',r:{car:'L\'ÉTERNELLE'},t:'JOUE {v} JOURS DIFFÉRENTS',en:'PLAY ON {v} DIFFERENT DAYS'}];
/* les réglages des détections (mesurés : voir le journal) — `partie` : une « partie entière » dure au moins ça (s de conduite), sinon trois
   caisses tombaient en mourant à la 2e seconde ; `frole` : la distance (m) d'un flanc de tour qui compte comme frôlé ; `prof` : le fond de
   la mer de Jade (m sous la surface) — EAU.fond n'est jamais atteint (la poussée ramène avant), le seuil est le fond qu'on atteint vraiment. */
const M2K={partie:60,frole:6,prof:EAU.fond,debut:3}; // prof : le fond de la mer de Jade (420 m) — mesuré : en tenant la plongée on le passe en ~25 s
/* (2026-10-18) ⚠ CES DEUX-LÀ SONT ICI, AVANT L'APPEL DE m2Etat DU DÉMARRAGE (voir « la migration de la sauvegarde, une fois »), et nulle part plus bas : la migration
   (m2MigreV2 → m2Val / m2Seuil → m2Col) les lit, et un `const` / `let` lu avant sa ligne est en zone morte (ReferenceError). Le try/catch de l'appel avalait
   l'erreur : la migration des missions v2 s'arrêtait net, sans bruit, depuis le 16/10. M2_COLK : la catégorie de collection de chaque `k` ; M2_RECO : le cache de m2Reco. */
const M2_COLK={cars:'voiture',peint:'peinture',trainee:'trainee',aile:'aile',figure:'figure'};
let M2_RECO=null;
/* l'état de la partie en cours (jamais sauvegardé) : ctl = secondes de conduite (sans le largage), vie = depuis la dernière (re)naissance,
   parf = poses parfaites d'affilée, lac = glisse tenue sur un lac gelé, tourV = les tours frôlées pendant CE saut, run = missions
   réussies pendant cette partie (l'écran de mort), deb = la partie a été comptée (jour, heure). */
const M2R={ctl:0,vie:0,parf:0,lac:0,tourV:[],run:[],t:0,deb:false,figV:0,volT:0,figMax:0,airPm:0}; // figV/volT : les figures et la durée VÉCUE (hors de l'eau) du saut en cours — le bump retranche du temps à fallT, pas à volT
/* LES CAISSES QUI SE GAGNENT PAR MISSION : leur condition devient la mission (`k:'mis'`), l'ancienne reste dans `av` — la migration de
   la sauvegarde (m2Migre) la relit pour rendre à chacun ce qu'il avait déjà (une mise à jour ne confisque rien) ; une caisse qui se
   vendait (à l'argent du jeu ou en euros) ne s'achète plus. Les caisses RETIRÉES ne reviennent qu'avec leur gabarit (SHAPES). */
{for(const m of M2){const r=m.r;if(!r||!r.car)continue;const i=CARS.findIndex(function(c){return c&&c.name===r.car;});if(i<0)continue;
  const c=CARS[i],rr=carRar(i),u=CAR_UNLOCK[i];CAR_UNLOCK[i]={k:'mis',id:m.id,av:u||null};c.rar=rr; // la rareté d'avant est GARDÉE (elle se lisait du prix ou du défi)
  if(c.retire&&typeof SHAPES[c.shape]==='function'){c.retire=0;c.revenue=1;}} // `revenue` : une retirée qui revient comme récompense de mission
  /* les quatre caisses des carnets 6 à 9 (LA PUCE, LA GROUPE B, LE HOT ROD, LE MASTODONTE) ne sont la récompense d'aucune mission v2 : sans
     carnet, plus personne ne pourrait les avoir. Elles passent à l'argent du jeu (prix posés par Claude, À VALIDER PAR SACHA), comme les
     trophées de la carrière ; leur rareté ne bouge pas ; `exK`/`exV` gardent le carnet — qui l'avait relevé l'a dans `owned` (m2MigreV2). */
  const PX9={6:30e3,7:500e3,8:800e3,9:1e6}; // (2026-10-19, Léo : la grille des prix) LA PUCE 400 000 → 30 000 : une Mini, la moins chère des rares
  CAR_UNLOCK.forEach(function(u,i){if(!u||u.k!=='carnet'||!PX9[u.v])return;const rr=carRar(i);CAR_UNLOCK[i]={p:PX9[u.v],exK:'carnet',exV:u.v};CARS[i].rar=rr;});}
