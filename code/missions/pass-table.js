/* ===== LE PASS DE MISSIONS — LE RÉSERVOIR DU CHAPITRE 1 (2026-11-07, Léo : « un nouveau système, un peu similaire à un pass de combat, pour que les gens aient plus envie
   de faire des missions. Actuellement c'est vraiment mis comme un contrôle. Refonte totale. Une suite logique : les premières missions plus simples, plus on avance plus
   c'est dur, mais les récompenses sont plus grosses » · puis « 3 missions actives en même temps, remplacées au tirage dès qu'une est réussie ») =====
   LE MODÈLE : TROIS missions actives pour tous les joueurs ; réussie + récompense prise -> elle est remplacée par une autre TIRÉE dans le réservoir du chapitre.
   Le tirage est au hasard mais BORNÉ par la difficulté : on ne tire que dans la tranche atteinte (selon le nombre de missions réussies du chapitre) et celle d'avant.
   Ce morceau est de la DONNÉE : le réservoir (PASS_POOL), les tranches, les chapitres, les mesures de la partie. Le moteur du tirage vient après (case 3).
   ⚠ INERTE tant que l'URL n'a pas `?pass=1` : sans lui, M2 (table.js) n'est PAS touchée, rien ne change dans le jeu. Avec lui : les missions de départ `ps01`..
   sont AJOUTÉES à M2, les primes du réservoir remplacent `m.r`, deux caisses sont re-liées (voir PASS_LIEN). Les `id` de M2 sont des clés de sauvegarde : aucun n'est renommé.
   Le tableau lisible (et le calcul des parties) : `node outils/pass-table-md.cjs` -> passation/PASS-MISSIONS-TABLE.md. Console (case 3) : dbgPass().
   RÈGLES DE LA TABLE (Léo, points 6 à 9) : chaque mission demande une VRAIE action (aucune ne se remplit toute seule : « RÉUSSIS 10 MISSIONS » et le doublon `maps2` sont SORTIS,
   voir PASS_SORTIES) ; les collections comptent hors cadeaux (variante `T` de la mesure) ; jamais deux caisses proches ; une petite peinture de base tôt. */
const PASS_ON=/[?&]pass=1\b/.test(location.search); /* (2026-11-07 au soir, Sacha : « remet l'ancien système de mission en mode liste ») la liste d'avant par défaut ; LE VISEUR de Léo reste entier derrière ?pass=1 */
/* ---- LES MESURES DE LA PARTIE : LE SEUL ENDROIT À CORRIGER (Léo ne connaît pas la durée d'une partie ; ces chiffres sont DÉDUITS du dépôt) ----
   Sources : passation/ECONOMIE.md §1-2 (mesure au banc : 15-75 s tenues, 267 -> 2 456 $ la partie, « un humain moyen ~500-1 000 $ par partie au début »), outils/eco-debut-modele.cjs
   (profils de GAMEPLAY : moyen 45-90 s, la moitié des pièces ; fort 120-240 s, 75 % des pièces, frénésie), journal « LES MISSIONS v2 » (1 000 km/h en ~50 s, 55 d'aura/s au pilote auto).
   Le DÉBUTANT = le profil « moyen » (~67 s, ~800 $) ; l'HABITUÉ = le profil « fort » (~3 min, ~4 000 $ : 3 min x ~1 000 $/min x 0,75 de pièces x flow 1,9). Léo corrigera avec ses vraies parties. */
const PARTIE_MN={debutant:1.1,habitue:3.0};        // minutes tenues par partie
const GAIN_PARTIE={debutant:800,habitue:4000};     // $ gagnés par partie, AU DÉBUT ; le gain grandit : g(n)=GAIN*(1+n/PASS_CROIS) à la n-ième partie (le moteur monte de palier, les pièces valent plus)
const PASS_CROIS={debutant:24,habitue:60};
/* ce qu'une partie MOYENNE ajoute aux compteurs à vie (km = vitesse moyenne x durée ; le reste : combien en une partie) */
const PASS_TAUX={
  debutant:{km:8,fig:5,pu:3,nit:9,nmax:2.5,air:12,verg:6,mort:1},
  habitue:{km:45,fig:20,pu:10,nit:30,nmax:8,air:35,verg:25,mort:1}};
/* les classes de durée (parties du DÉBUTANT) : Léo a dit COURT <= 1, MOYEN 3 à 10 ; les trous (2 et 11-12) sont rattachés au voisin */
const PASS_COURT=2,PASS_MOYEN=12;
/* ---- LES CHAPITRES : un seul pour commencer, la structure en accepte d'autres sans toucher le moteur ----
   Un chapitre = un nom, un seuil d'entrée (`apres` : l'id du chapitre à avoir fini ; null = le premier), des TRANCHES (`entree` = missions réussies DU CHAPITRE pour l'ouvrir),
   et son réservoir (les entrées de PASS_POOL qui portent son id). Pour en ajouter un : une ligne ici + des entrées `ch:2` dans PASS_POOL. */
const PASS_TRANCHES=[ // [numéro, missions réussies pour l'ouvrir, prime de base de la tranche ($)]
  [1,0,600],[2,5,1500],[3,10,3500],[4,16,9000],[5,24,24000],[6,34,60000],[7,46,150000],[8,58,350000]];
const PASS_CHAPITRES=[{id:1,nom:'CHAPITRE 1',en:'CHAPTER 1',apres:null,tranches:PASS_TRANCHES}];
/* ---- LE TIRAGE (lu par le moteur, case 3) ---- */
const PASS_REGLES={
  emplacements:3,        // missions actives en même temps
  fenetre:2,             // on tire dans la tranche atteinte et la précédente
  ecartCaisses:5,        // missions réussies entre deux caisses tirées (jamais deux caisses proches)
  memeFamille:false,     // pas deux missions de même famille en même temps, si possible
  garanti:{ps04:4},      // la petite peinture de base : tirée au plus tard au 4e tirage
  echangeParties:12,     // garde-fou : un emplacement non fini après max(12, 2 x ses parties) parties peut être ÉCHANGÉ (la mission retourne au réservoir)
  ecarteDejaRemplie:true};// une mission déjà remplie à l'instant du tirage n'est pas tirée
/* ---- LES NOUVELLES MISSIONS (ajoutées à M2 sous ?pass=1) : les petites, pour que les premières soient simples ---- */
const PASS_NOUV=[
  {id:'ps01',f:'exploration',k:'kmTot',v:1,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps02',f:'exploit',k:'figs',v:3,u:'',t:'FAIS {v} FIGURES',en:'LAND {v} TRICKS'},
  {id:'ps03',f:'moteur',k:'eng',v:4,u:'',t:'MONTE AU PALIER {v} DU MOTEUR',en:'REACH ENGINE TIER {v}'},
  {id:'ps04',f:'moteur',k:'nitS',v:30,u:'s',t:'BRÛLE {v} S DE NITRO',en:'BURN {v} S OF NITRO'},
  {id:'ps05',f:'argent',k:'gagne',v:5000,u:'$',t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  {id:'ps06',f:'exploration',k:'airS',v:30,u:'s',t:'PASSE {v} S EN L\'AIR',en:'SPEND {v} S IN THE AIR'},
  {id:'ps07',f:'aura',k:'aura',v:2000,u:'aura',t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'ps08',f:'exploration',k:'pu',v:8,u:'',t:'RAMASSE {v} POWER-UPS',en:'PICK UP {v} POWER-UPS'},
  {id:'ps09',f:'exploit',k:'kmh',v:500,u:'kmh',t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'ps10',f:'moteur',k:'nitS',v:60,u:'s',t:'BRÛLE {v} S DE NITRO',en:'BURN {v} S OF NITRO'},
  {id:'ps11',f:'exploit',k:'figs',v:30,u:'',t:'FAIS {v} FIGURES',en:'LAND {v} TRICKS'},
  {id:'ps12',f:'exploration',k:'pu',v:20,u:'',t:'RAMASSE {v} POWER-UPS',en:'PICK UP {v} POWER-UPS'},
  {id:'ps13',f:'exploration',k:'kmTot',v:50,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps14',f:'exploration',k:'airS',v:90,u:'s',t:'PASSE {v} S EN L\'AIR',en:'SPEND {v} S IN THE AIR'},
  {id:'ps15',f:'exploit',k:'figs',v:60,u:'',t:'FAIS {v} FIGURES',en:'LAND {v} TRICKS'},
  {id:'ps16',f:'exploration',k:'pu',v:36,u:'',t:'RAMASSE {v} POWER-UPS',en:'PICK UP {v} POWER-UPS'},
  {id:'ps17',f:'exploit',k:'frenT',v:10,u:'s',t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'},
  {id:'ps18',f:'moteur',k:'nitS',v:100,u:'s',t:'BRÛLE {v} S DE NITRO',en:'BURN {v} S OF NITRO'},
  {id:'ps19',f:'exploit',k:'kmh',v:1400,u:'kmh',t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'ps20',f:'exploit',k:'airP',v:8,u:'s',t:'RESTE {v} S EN L\'AIR, PUIS POSE-TOI EN PARFAIT',en:'STAY {v} S IN THE AIR, THEN LAND A PERFECT'},
  {id:'ps21',f:'exploit',k:'frenT',v:15,u:'s',t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'},
  {id:'ps22',f:'exploration',k:'airS',v:140,u:'s',t:'PASSE {v} S EN L\'AIR',en:'SPEND {v} S IN THE AIR'},
  {id:'ps23',f:'exploration',k:'kmTot',v:90,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps24',f:'exploit',k:'airP',v:10,u:'s',t:'RESTE {v} S EN L\'AIR, PUIS POSE-TOI EN PARFAIT',en:'STAY {v} S IN THE AIR, THEN LAND A PERFECT'},
  {id:'ps25',f:'aura',k:'aura',v:15000,u:'aura',t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'ps26',f:'exploration',k:'kmTot',v:150,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps27',f:'exploit',k:'figs',v:100,u:'',t:'FAIS {v} FIGURES',en:'LAND {v} TRICKS'},
  {id:'ps28',f:'exploration',k:'pu',v:50,u:'',t:'RAMASSE {v} POWER-UPS',en:'PICK UP {v} POWER-UPS'},
  {id:'ps29',f:'moteur',k:'nitS',v:180,u:'s',t:'BRÛLE {v} S DE NITRO',en:'BURN {v} S OF NITRO'},
  {id:'ps30',f:'exploration',k:'airS',v:250,u:'s',t:'PASSE {v} S EN L\'AIR',en:'SPEND {v} S IN THE AIR'},
  {id:'ps31',f:'exploit',k:'kmh',v:1800,u:'kmh',t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'ps32',f:'exploit',k:'parf',v:15,u:'',t:'FAIS {v} POSES PARFAITES D\'AFFILÉE',en:'LAND {v} PERFECTS IN A ROW'},
  {id:'ps33',f:'exploit',k:'airP',v:15,u:'s',t:'RESTE {v} S EN L\'AIR, PUIS POSE-TOI EN PARFAIT',en:'STAY {v} S IN THE AIR, THEN LAND A PERFECT'},
  {id:'ps34',f:'exploit',k:'frenT',v:20,u:'s',t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'},
  {id:'ps35',f:'aura',k:'aura',v:30000,u:'aura',t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'ps36',f:'moteur',k:'eng',v:25,u:'',t:'MONTE AU PALIER {v} DU MOTEUR',en:'REACH ENGINE TIER {v}'},
  {id:'ps37',f:'exploit',k:'vie',v:600,u:'mn',t:'TIENS 10 MIN SANS MOURIR',en:'SURVIVE 10 MIN WITHOUT DYING'},
  {id:'ps38',f:'exploit',k:'fig',v:8,u:'',t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
  {id:'ps39',f:'exploration',k:'kmTot',v:400,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps40',f:'exploit',k:'figs',v:250,u:'',t:'FAIS {v} FIGURES',en:'LAND {v} TRICKS'},
  {id:'ps41',f:'moteur',k:'nitS',v:600,u:'s',t:'BRÛLE {v} S DE NITRO',en:'BURN {v} S OF NITRO'},
  {id:'ps42',f:'exploration',k:'airS',v:500,u:'s',t:'PASSE {v} S EN L\'AIR',en:'SPEND {v} S IN THE AIR'},
  {id:'ps43',f:'exploit',k:'kmh',v:2200,u:'kmh',t:'DÉPASSE {v} KM/H',en:'GO PAST {v} KM/H'},
  {id:'ps44',f:'exploit',k:'frenT',v:45,u:'s',t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'},
  {id:'ps45',f:'aura',k:'aura',v:70000,u:'aura',t:'ATTEINS {v} D\'AURA EN UNE PARTIE',en:'REACH {v} AURA IN ONE RUN'},
  {id:'ps46',f:'exploration',k:'kmTot',v:1500,u:'km',t:'ROULE {v} KM',en:'DRIVE {v} KM'},
  {id:'ps47',f:'argent',k:'gagne',v:25000,u:'$',t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'},
  {id:'ps48',f:'argent',k:'gagne',v:50000,u:'$',t:'ACCUMULE {v}',en:'EARN {v} IN TOTAL'}];
/* ---- CE QUI SORT DU PASS (et pourquoi) : leurs clés de sauvegarde restent ---- */
const PASS_SORTIES={
  mis10:'« RÉUSSIS 10 MISSIONS » : une méta-mission, elle se remplit toute seule (point 6). Sa caisse, LE CHARGEUR, passe à aura20k (PASS_LIEN).',
  maps2:'« AVOIR EXPLORÉ CHAQUE MAP » : la même mesure que `maps` (deux missions identiques, point 6). Sa caisse, LE ROUGE-GORGE, passe à `maps` (PASS_LIEN).'};
/* ---- LES CAISSES RE-LIÉES : { caisse : l'id de la mission qui la donne désormais } (la fiche `CAR_UNLOCK[i]={k:'mis',id}` suit ; point 7 : la mission d'origine était mal placée) ---- */
const PASS_LIEN={'LE CHARGEUR':'aura20k','LE ROUGE-GORGE':'maps'};
/* ---- LES MISSIONS « CADEAU » (point 11, Léo 07/11) : celles dont la récompense est une VOITURE ou un habillage sont plus RARES que les missions d'argent, mais toujours là ----
   Apparition à INTERVALLE VARIABLE AVEC PLAFOND GARANTI (le « pity timer ») : après chaque mission réussie, le moteur compte ; le prochain cadeau est tiré dans une fenêtre
   [min, max] de missions réussies (le joueur ne peut pas le calculer), et `max` est une GARANTIE. Une jauge cachée monte avec le compte ; elle n'annonce rien, sauf `presque`
   (l'écran de fin de partie dit « une mission cadeau est proche », sans chiffre). Le tirage est SAUVEGARDÉ (jamais de re-tirage à la réouverture). Carte DORÉE + silhouette (voiture
   noire floutée / aperçu de la peinture) + message « NOUVELLE MISSION CADEAU » ; une mission cadeau commencée reste dans ses emplacements jusqu'à réussite ; récupération = la révélation
   (m2Revele). Variété : voiture / habillage en alternance, pas deux peintures de suite, jamais un objet déjà possédé. Tout se règle ICI. */
const PASS_CADEAU={
  debut:{hab:5,voiture:[10,12]},     // début généreux : un habillage (la petite peinture) au plus tard à la 5e mission réussie, la première voiture entre la 10e et la 12e
  hab:{min:4,max:12},                // ensuite : un habillage tous les 4 à 12 missions réussies (jamais plus de 12 sans) ; l'écart s'allonge de `croit` par cadeau déjà donné
  voiture:{min:10,max:25},           // une voiture tous les 10 à 25 (jamais plus de 25 sans)
  croit:{hab:.5,voiture:1},          // missions de plus ajoutées à min ET max à chaque cadeau du même genre
  plafondCroit:{hab:20,voiture:40},  // l'écart ne dépasse jamais ça
  ecartCadeaux:2,                    // jamais deux cadeaux de suite : au moins 2 missions réussies entre deux
  ecartCaisses:5,                    // jamais deux caisses proches (point 7)
  presque:.75,                       // la jauge cachée (compte / max) à partir de laquelle l'écran de fin dit « une mission cadeau est proche »
  alterne:true,                      // voiture / habillage en alternance quand les deux sont dus ; pas deux peintures de suite
  dore:true,                         // carte dorée + silhouette + message à l'arrivée
  tiersFinal:true};                  // la carte cadeau pulse doucement dans son dernier tiers de progression
/* ---- LE RÉSERVOIR : [id, mesure de durée, récompense, options] ----
   Durée (spec) : {c:'km'|'fig'|'pu'|'nit'|'nmax'|'air'|'verg'|'mort',n} un compteur À VIE (n / ce qu'une partie ajoute) · {g:$} de l'argent à ACCUMULER (la somme à avoir gagnée) ·
   {r:[débutant,habitué]} un exploit ou un record (parties pour y arriver, estimées) · {inf:1} hors de portée sans le pack de peintures ou des dizaines de millions.
   Récompense : 'auto' = la prime de la tranche · null = celle d'origine (une caisse, l'aile PHÉNIX, la traînée FOUDRE) · {cash} · {cat,id} un habillage.
   Options : tr = tranche forcée (sinon calculée sur les parties du débutant) · k = la mesure remplacée (les collections comptent HORS cadeaux : variante `T`) · v = le seuil remplacé. */
const PASS_POOL_DEF=[
  // départ : une à deux parties chacune (les trois premières missions sont toujours là)
  ['ps01',{c:'km',n:1},'auto'],['ps02',{c:'fig',n:3},'auto'],['ps03',{r:[1,1]},'auto'],['fig2',{r:[2,1]},'auto'],['ps07',{r:[2,1]},'auto'],['ps09',{r:[2,1]},'auto'],['eng10',{r:[2,1]},'auto'],
  ['ps04',{c:'nit',n:30},{cat:'peinture',id:'lagon'},{tr:1}],           // la petite peinture de base (point 9), garantie dans les premiers tirages
  ['ps05',{g:5000},'auto'],['ps06',{c:'air',n:30},'auto'],['ps08',{c:'pu',n:8},'auto'],['air5',{r:[6,2]},'auto'],['ps11',{c:'fig',n:30},{cat:'trainee',id:'rose'}],
  // un peu plus loin
  ['fig5',{r:[8,2]},null],['fig3',{g:7500},'auto',{k:'figureT'}],['ps10',{c:'nit',n:60},'auto'],['ps12',{c:'pu',n:20},'auto'],['fren',{r:[7,2]},'auto'],['ps13',{c:'km',n:50},'auto'],
  ['aura10k',{r:[12,3]},'auto'],['kmh1000',{r:[4,1]},'auto'],['ps14',{c:'air',n:90},'auto'],['ps15',{c:'fig',n:60},'auto'],['ps16',{c:'pu',n:36},'auto'],['ps17',{r:[11,3]},'auto'],
  ['ps18',{c:'nit',n:100},'auto'],['ps19',{r:[11,2]},'auto'],['ps20',{r:[10,3]},'auto'],['ps21',{r:[12,3]},'auto'],['ps22',{c:'air',n:140},'auto'],['ps23',{c:'km',n:90},'auto'],
  ['ps24',{r:[12,4]},'auto'],['ps47',{g:25000},'auto'],['ps48',{g:50000},'auto'],['eng20',{r:[12,3]},{cat:'trainee',id:'sakura'}],
  // la montée : une dizaine de parties, puis plusieurs dizaines
  ['parf10',{r:[14,4]},null],['maps',{r:[15,8]},null],['verglas100',{c:'verg',n:100},null,{tr:5}],['ps25',{r:[14,3]},'auto'],['ps26',{c:'km',n:150},'auto'],['ps27',{c:'fig',n:100},'auto'],
  ['ps28',{c:'pu',n:50},'auto'],['ps29',{c:'nit',n:180},'auto'],['ps30',{c:'air',n:250},'auto'],['tours5',{r:[20,6]},'auto'],['vie5min',{r:[22,5]},'auto'],
  ['aura20k',{r:[30,6]},null],['ps31',{r:[25,4]},{cat:'peinture',id:'couchant'}],['ps32',{r:[25,6]},'auto'],['ps33',{r:[28,8]},'auto'],['ps34',{r:[24,5]},'auto'],['ps36',{r:[28,6]},'auto'],
  ['pu100',{c:'pu',n:100},null],['meteo',{r:[35,12]},null],['nmax100',{c:'nmax',n:100},null],['fren30',{r:[40,8]},'auto'],['parfmaps',{r:[40,14]},'auto'],['ps38',{r:[40,9]},'auto'],
  ['cash100k',{g:100000},'auto'],['fig8',{g:85000},'auto',{k:'figureT'}],['car5',{g:250000},'auto',{k:'carsT'}],['col5',{g:560000},'auto',{k:'peintT'}],['tr5',{g:380000},'auto',{k:'traineeT'}],
  ['ps35',{r:[55,10]},'auto'],['ps37',{r:[55,12]},'auto'],['eng30',{r:[60,12]},null],['ps39',{c:'km',n:400},'auto'],['ps40',{c:'fig',n:250},'auto'],
  // le fond : des centaines de parties
  ['aura50k',{r:[120,22]},null],['ps41',{c:'nit',n:600},'auto'],['ps42',{c:'air',n:500},'auto'],['ps43',{r:[90,12]},'auto'],['ps44',{r:[90,15]},'auto'],['ps45',{r:[250,40]},'auto'],
  ['morts100',{c:'mort',n:100},null],['figs500',{c:'fig',n:500},null],['cash500k',{g:500000},'auto'],['car10',{g:1200000},'auto',{k:'carsT'}],['figall',{g:300000},'auto'],
  ['km100k',{c:'km',n:3000},null,{v:3000}],['air1000',{c:'air',n:1000},null],['cash1m',{g:1000000},{cat:'peinture',id:'vaporwave'}],['ps46',{c:'km',n:1500},'auto'],
  ['nit2000',{c:'nit',n:2000},null],['tr10',{g:4200000},'auto',{k:'traineeT'}],['cash2m',{g:2000000},'auto'],['car20',{g:6000000},'auto',{k:'carsT'}],['rares',{g:6000000},null],
  ['col10',{g:7000000},'auto',{k:'peintT'}],['ai5',{g:3000000},'auto',{k:'aileT'}],
  // hors de portée sans le pack (0,99 €) ou sans des dizaines de millions : l'horizon du chapitre
  ['ai10',{g:23000000},'auto',{k:'aileT'}],['trall',{g:9200000},'auto'],['colall',{inf:1},'auto'],['aiall',{inf:1},'auto'],['carall',{inf:1},null],['toutall',{inf:1},{cash:1000000}]];
/* ---- LES CALCULS (purs : le moteur et le générateur du tableau les partagent) ---- */
function passGainCumul(P,n){const g=GAIN_PARTIE[P],c=PASS_CROIS[P];return g*(n+n*n/(2*c));} // $ gagnés en n parties
function passPartiesArgent(P,G){const g=GAIN_PARTIE[P],c=PASS_CROIS[P];return c*(-1+Math.sqrt(1+2*G/(g*c)));} // n tel que passGainCumul(P,n)=G
function passParties(spec,P){ // parties pour y arriver, pour le profil P ('debutant' | 'habitue') ; 9999 = hors de portée
  if(spec.inf)return 9999;if(spec.r)return spec.r[P==='debutant'?0:1];
  if(spec.g)return Math.max(1,Math.ceil(passPartiesArgent(P,spec.g)));
  return Math.max(1,Math.ceil(spec.n/PASS_TAUX[P][spec.c]));}
function passTranche(pDeb){const L=[2,5,8,12,30,100,400];for(let i=0;i<L.length;i++)if(pDeb<=L[i])return i+1;return 8;}
function passClasse(pDeb){return pDeb<=PASS_COURT?'COURT':pDeb<=PASS_MOYEN?'MOYEN':'LONG';}
function passPrime(tr){return PASS_TRANCHES[tr-1][2];}
const PASS_POOL=PASS_POOL_DEF.map(function(e){const o=e[3]||{},pd=passParties(e[1],'debutant'),ph=passParties(e[1],'habitue'),tr=o.tr||passTranche(pd);
  var rec=e[2]==='auto'?{cash:passPrime(tr)}:e[2],r0=rec||(M2.find(function(x){return x.id===e[0];})||{}).r||{},car=!!r0.car||Object.keys(PASS_LIEN).some(function(n){return PASS_LIEN[n]===e[0];}),hab=!!r0.cat;
  return {id:e[0],ch:1,tr:tr,spec:e[1],p:{debutant:pd,habitue:ph},rec:rec,opt:o,cadeau:car?'voiture':hab?'hab':null};}); // cadeau : le genre de la récompense (le moteur tire ces missions à part, selon PASS_CADEAU)
const PASS_N=PASS_POOL.length;
function passDef(id){for(let i=0;i<PASS_POOL.length;i++)if(PASS_POOL[i].id===id)return PASS_POOL[i];return null;}
Object.assign(I18N,{'CHAPITRE 1':'CHAPTER 1'});
/* ---- LA MISE EN PLACE, UNIQUEMENT SOUS ?pass=1 : M2 reçoit les nouvelles missions, les primes du réservoir, les mesures « hors cadeaux » ; deux caisses changent de mission ---- */
if(PASS_ON){
  for(const m of PASS_NOUV)if(!M2.some(function(x){return x.id===m.id;}))M2.push(Object.assign({r:{cash:0}},m));
  for(const d of PASS_POOL){const m=M2.find(function(x){return x.id===d.id;});if(!m){console.warn('pass : mission inconnue',d.id);continue;}
    m.pass=d.tr;if(d.rec)m.r=d.rec;if(d.opt.k)m.k=d.opt.k;if(d.opt.v!=null)m.v=d.opt.v;}
  for(const nom in PASS_LIEN){const i=CARS.findIndex(function(c){return c&&c.name===nom;}),m=M2.find(function(x){return x.id===PASS_LIEN[nom];});
    if(i<0||!m)continue;const u=CAR_UNLOCK[i];if(u&&u.k==='mis'){u.id=m.id;m.r={car:nom};}}
  for(const id in PASS_SORTIES){const m=M2.find(function(x){return x.id===id;});if(m){m.pass=0;m.sortie=1;if(m.r&&m.r.car)m.r={cash:0};}}}
