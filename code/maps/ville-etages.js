/* ===== LA ROUTE À ÉTAGES (2026-11-19, Sacha : « c'est exactement celle-là […] des sortes de tunnels formés d'immeubles chelous, ultra conceptuels […]
   tu reprends la STRUCTURE de cette ville-là et tu ajoutes les modules et les trucs en plus que tu as faits ») — le lot E, passation/ville-cyber/LOT-E.md =====
   La ville du 3/11 (aa160d07f) descendait fort et sans montée, tournait beaucoup sans borne de cap et revenait le long d'elle-même, 150-400 m plus haut : `tourLibre`
   relevait le pied des tours du dessus, `villePied` le noyait dans la brume violette. Sous VILLE_ETAGES, la CARTE VILLE seule (ni Crypto City ni la vitrée) retrouve
   ce SQUELETTE dans genCtrl1 (ville-entree.js) :
   · le moteur du 3/11 : les 13 motifs (poids VILLE_WM), la respiration (50-90 m, 16-36°, −(8-16)·LV m), un module tous les 0,3-0,55 km × LV × kMC ; aucune liaison qui monte ;
     l'entrée du 3/11 (droite 260, rampe 320 qui plonge de 160, en virage de 48-62°) ;
   · LA PENTE DESSINÉE À SA VALEUR FINALE (vePente) : le 3/11 dessinait ses esses et ses grands virages à 60-110 % qu'adoucirPentes ramenait à 40-58 % — la pente de 55 %
     de l'enquête, LOCALISÉE (scratchpad lot-e/loc55.cjs : 4 611 segments au-dessus de 40,5 % dans les esses, 1 598 dans les grands virages, 160 dans les plongeons, 18 à
     l'entrée). Ici chaque motif est dessiné à la pente qu'adoucirPentes en aurait faite, bornée à 40,5 % (la charte), et pré-compensée (comme vcDessin) : adoucirPentes
     n'y touche plus, rien ne glisse en hauteur derrière un saut ou une ancre ;
   · le garde-fou d'enroulement porté de 170° à 450° (une borne plus haute, pas aucune) ; le tour des modules d'étage (parking, bretelle) ne compte pas dans l'enroulement ;
   · LE PAQUET, un tableau NEUF (VS.scenes n'est jamais touché : il sert à Crypto City) : les scènes, les modules du 3/11 (le parking à 400-460° à 1,8-2,1 rP, SERRÉ — Sacha, 19/11),
     les modules route-ville du lot A ; L'ÉTAGE (parking ou bretelle) d'abord, puis LE SAUT ou LE GRAND SAUT s'il tient avant l'arrivée (une graine sur deux sur la route
     courte des hauts paliers), puis les cartes ; le parking plonge de 170 m par tour (VE_AIR) ; la respiration et l'entrée tournent plus aux hauts paliers (VE_KT) ;
   · le meilleur-de-N : routeRecoupe ne compte plus que les empilements à moins de 80 m (150 ailleurs) ; vsMalusBoucle exempte les modules d'étage (`etage`).
   On garde vsDevers, vsReserve/vsBatir et les ancres, vsCroise, vsMalusTenue, le saut refusé tête en bas, la génération en tranches et le pré-bâti.
   `?sans=villeetages` : la ville du 18/11 (lots A et C), au bit près. */
const VILLE_ETAGES=VILLE_CALME&&!/[?&]sans=([^&]*,)?villeetages(,|&|$)/.test(location.search);
function veActif(){const c=typeof LVL!=='undefined'&&LVL.cur;return !!(VILLE_ETAGES&&c&&c.id==='ville'&&!c.crypto&&!c.vitre&&!c.piste&&!c.camp&&MODC_ON&&!(typeof PARK!=='undefined'&&PARK.on)&&VILLE_ANCRES&&VILLE_RACC&&GEN_V2);} /* la carte VILLE tirée, avec ses modules et ses ancres */
const VE_RECOUPE=80; /* (routeRecoupe) la hauteur sous laquelle deux tronçons parallèles empilés coûtent : 80 m (150 ailleurs) */
const VE_LG=[[12,8],[11.1,6.5],[11.3,6],[10.6,6],[8.2,5],[8.5,6],[15.6,8.6]]; /* la longueur des modules du 3/11 dans le paquet (s de croisière, palier 0 puis 20 : voir VS.longueur) — angles, bretelle, slalom, double corde, carrefour, pont, parking */
const VE_CROISE={h:60,k:20,hr:40}; /* (vsCroise) aucun croisement sous 60 m de hauteur libre : 20 par croisement (50 m et 6 ailleurs) ; hr : (contrôle du lot E) un raccourci
   qui repasse sous lui-même à moins de 40 m compte aussi — MESURÉ, 27 routes sur 80 au palier 0 sans lui (graines du contrôle), 1 avec */
const VE_DECOR=40; /* (vsMalusDecor) un plan de scène perdu : 40, une pièce d'un module route-ville : 20 (3 et 1,5 ailleurs) — MESURÉ (ville-cyber.cjs, graines 501-560, palier 0) :
   à 3, 14 plans perdus ; à 15, 12 pièces du piqué perdues (une route du dessus dans leur emprise ou leur air) ; à 40, aucune au palier 0, 2 au palier 10 */
const VE_AIR=170; /* (le parking) l'air d'un tour de spirale à l'autre, au moins (m) : la spirale reste SERRÉE (1,8-2,1 rP, 400-460°, Sacha) mais plonge de 170 m par tour
   (−23 % au rayon le plus serré du palier 0) — MESURÉ (contrôle du lot E) : à 68 m ses tours empilés tiraient l'écart médian avec la route du dessus à 110 m, et le décor
   (tourLibre) n'y suspendait aucune tour ; à 170 m, 174 m de médiane */
const VE_NEUF=6; /* la place d'une scène courte (s de croisière) qu'il faut encore jouer : le raccourci n'en garde que ce qui dépasse la place de la clôture (VE_FIN) */
const VE_FIN=5; /* la place gardée au bout pour le module de clôture (s de croisière de conception) */
/* LE VIRAGE AUX HAUTS PALIERS (contrôle du lot E : 3,7 tours au palier 10, 2,9 au palier 20). Les motifs du 3/11 gardent leurs degrés quand leurs mètres grandissent avec la
   vitesse (× LV, × rP) : MESURÉ, la respiration y tournait à 62 °/km au palier 20 (253 au palier 0), l'entrée à 25. Sous la route à étages :
   · VE_KT : la respiration et la rampe de l'entrée tournent LV^1,25 fois plus (3,6 au plus : ×1,1 au palier 0, ×2,2 au palier 10, ×3,6 au palier 20) ;
   · VE_LRE : la respiration s'allonge comme LV^0,6 (et non LV) ;
   · VE_KR : les rayons des motifs se rapprochent du plancher (rPlancher, jamais dessous) : −50 % au palier 20, rien au palier 0.
   Le plancher des rayons (1,6 rP, « jamais infranchissable ») borne le reste : au palier 20 la médiane plafonne à 4,0 tours. */
const VE_KTMAX=3.6,VE_KTE=1.25,VE_LRE=.6,VE_KRP=.5;
function VE_KT(LV){return Math.min(VE_KTMAX,Math.pow(Math.max(1,LV),VE_KTE));}
function VE_KR(LV){return 1-VE_KRP*Math.max(0,Math.min(1,(LV-1.08)/2.63));}
/* LA ROUTE COURTE (LV ≥ 2,3 : palier ~13 et plus, 30 s et moins) : l'étage passe d'abord, et le raccourci (40 % de la route au palier 15, enclavé à 20 %) ne part
   qu'une graine sur VE_RACN, s'il tient — MESURÉ, palier 15 (graines 401-460, avant le parking préféré) : enclavé médian 38 % avec un raccourci partout, 40 % une route sur deux, 53 % sans ;
   avec le parking d'abord sur la route courte (ville-entree.js, veE) : 47 % une route sur deux */
const VE_LVCOURT=2.3,VE_RACN=2;
const VE_MONTE=.02; /* la pente la plus forte d'une montée dans les motifs (un replat) */
const VE_PMAX=.405; /* la pente FINALE la plus forte d'un segment de la route ordinaire (la charte) */
/* la pente à DESSINER pour que la route finisse, après adoucirPentes(VILLE_PENTE), à la pente que le 3/11 en aurait faite — bornée à VE_PMAX */
function vePente(g){const S=VILLE_PENTE.seuil,K=VILLE_PENTE.garde,a=Math.abs(g);let f=a<=S?a:S+(a-S)*K;f=Math.min(f,VE_PMAX);return (g<0?-1:1)*(f<=S?f:S+(f-S)/K);}
/* L'ORDRE DU PREMIER PAQUET : `?villescene=` (banc) met la carte demandée en tête ; sinon l'étage de la graine, puis une carte route-ville du lot A (vcPaquet). Aucun tirage.
   (L'étage lui-même part d'abord par veEtage, dans genCtrl1 : il ne reste en tête du paquet que s'il n'a pas tenu.) */
function veOrdre(t,MCJ,gr){const f9=(/[?&]villescene=(\w+)/.exec(typeof location!=='undefined'?location.search:'')||[])[1];
  let k9=-1;if(f9){k9=typeof vcIndice==='function'?vcIndice(MCJ,f9):-1;if(k9<0)k9=['traversee','passerelle','facade','phare','crete','portes','plongee'].indexOf(f9);if(k9<0)for(let k=0;k<MCJ.length;k++)if(MCJ[k]&&MCJ[k].nom===f9)k9=k;} /* ?villescene=parking|bretelle|pont… : un module du 3/11 */
  if(k9>=0){const q=t.indexOf(k9);if(q>=0)t.splice(q,1);t.unshift(k9);return;}
  if(VILLE_CYBER&&gr!=null)vcPaquet(t,MCJ,gr);
  /* UN ÉTAGE PAR ROUTE, EN PREMIER : le parking (une graine sur deux) ou la bretelle ouvre la route, la carte route-ville vient derrière (le raccourci se glisse entre les deux
     s'il tient) — MESURÉ, tirés au hasard du paquet de 17 cartes, quatre routes sur cinq n'en jouaient aucun (et la route du 3/11 leur devait 69 % de ses passages dessous) ;
     placés après la carte route-ville et le raccourci, ils ne tenaient plus dans la durée de la route */
  if(gr!=null){const E=[];for(let k=0;k<MCJ.length;k++)if(MCJ[k]&&MCJ[k].etage)E.push(k);if(E.length){const e=E[((gr%E.length)+E.length)%E.length],q=t.indexOf(e);if(q>0){t.splice(q,1);t.unshift(e);}}}}
/* ===== LE DÉCOR DU 3 NOVEMBRE SUR LA ROUTE À ÉTAGES (2026-11-20, Sacha : « c'est exactement celle-là […] des sortes de tunnels formés d'immeubles chelous, ultra conceptuels.
   C'était magnifique, j'aimerais que tu remettes ça […] tu peux pas simplement récupérer le code sur le git et l'adapter ») — le lot F, passation/ville-cyber/LOT-F.md =====
   Le canyon de buildVoxCity est, au caractère près, celui d'aa160d07f (jade-balade.js l.109-180 d'alors : mêmes trois rangs, même toit, même pied à min(yLo,yN)−330−vr·120,
   même `tourLibre` qui relève le pied 44 m au-dessus de la route du dessus, même `villePied` qui le noie dans la brume). MESURÉ (vrai buildVoxCity en Node, graines 1-12,
   palier 0) : 967 tours au 3/11, 776 aujourd'hui ; 21 tours au pied relevé (« à l'envers, transparentes ») contre 11 ; murs des deux côtés à moins de 100 m sur 77 % de la
   route contre 59 % ; 8,9 tours au 1er rang contre 6,5. La cause, isolée : L'AIR DES SAUTS (AIRZ, la règle des sauts — intouchable) rabat le toit des tours qui, plus hautes,
   auraient enjambé la route du dessus et pendu au-dessus d'elle (sans AIRZ : 18,8 pendues) ; les EMPRISES DES SCÈNES en retirent 54 ; et la route est 11 % plus courte.
   On rend donc au canyon de la route à étages ce que les sauts et les scènes lui prennent, sans toucher ni aux uns ni aux autres :
   · VE_RANGS : les rangs du 3/11 resserrés et complets (1er et 2e rangs à 100 %), un 4e rang au fond de la rue ;
   · VE_HAUT : les murs 1,5 fois plus hauts au-dessus de la route — `tourLibre` relève alors le pied de ceux que la route du dessus traverse dans leur moitié basse : ce sont
     les tours pendues du 3/11 (une tour rabattue par AIRZ ou par une route dans sa moitié haute reste rabattue, la règle d'or et l'air des sauts passent APRÈS).
   · VE_LIBRE : ce pied relevé laisse 60 m d'air au-dessus de la route d'en bas (44 m au 3/11 et au socle) ;
   · la part de GÉANTES DE VERRE se juge à la hauteur d'avant VE_HAUT (villeVerreTour en prend plus au-dessus de 190 m) : 15,7 % comme au 3/11 (15,5 %), pas 20 %.
   Carte VILLE de nuit seule (veDecor3 : ni Crypto City de jour — ses météos cj —, ni la vitrée) ; `?sans=villedecor3` (pas `villedecor` : ce nom est déjà celui du décor tiré du 23/10, ville-v3.js) rend le décor de la route à étages d'avant (lot E) au bit près,
   `?sans=villeetages` celui du socle. */
const VE_DECOR3=VILLE_ETAGES&&!/[?&]sans=([^&]*,)?villedecor3(,|&|$)/.test(location.search);
function veDecor3(){const c=typeof LVL!=='undefined'&&LVL.cur;return VE_DECOR3&&veActif()&&!(c&&c.cj);} /* la NUIT de la carte ville seule : ni Crypto City de jour (lot J : météos cjMatin/cjMidi/cjSoir, LVL.cur.cj), ni la vitrée, ni le parc */
const VE_RANGS=[[24,12,1],[60,30,1],[116,70,.9],[200,120,.5]]; /* [écart au bord de la dalle (m), dispersion (m), part tirée] — le 3/11 : [28,40,.9],[100,60,.7],[190,130,.5] */
const VE_HAUT=1.5; /* le toit des murs au-dessus de la route (t − yN + 50), × */
const VE_LIBRE=60; /* (tourLibre) l'air libre sous le pied relevé d'une tour que la route traverse dans sa moitié basse : au moins 60 m (61 posés ; 44 ailleurs, et au 3/11) */
