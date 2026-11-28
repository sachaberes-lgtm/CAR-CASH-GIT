#!/usr/bin/env node
/* ===== LE GENOME DE LA SELECTION NATURELLE (2026-11-27, etape 2 — Sacha : « une population de pilotes evolue seule sur un PC, le moins bon est vire ») =====
   Contrat : ml/evolution/INTERFACES.md § 2.3, § 3.2, § 4 et § 5 (il fait foi). Specification : SPECIFICATION.md § 4.
   Un genome = { v:4, A:{129 genes, dans l'ordre de BORNES}, WV:[222 poids de la tete RAYON], WS:[90 poids de la tete SOL] }.
   (28/11, le relecteur « bit-pres ») cette ligne disait encore v:3 et 121 genes ; l'historique des versions suit.
   (27/11/2026, tache « gestes ») v:2 = les 86 genes de v:1 puis les 21 genes des cinq gestes (GESTES, en fin de BORNES) ; un genome v:1 se lit (migrer).
   (28/11/2026, tache « portage ») v:3 = les 107 genes de v:2 puis les 14 genes du portage de la boucle payante (PORTAGE : c0026 a c0101) ; un genome
   v:1 ou v:2 se lit (migrer).
   (28/11/2026, lot « genes v4 ») v:4 = les 121 genes de v:3 puis les 8 genes v4 (GENES_V4 : sortieOn, sortieT, sortieJauge, rienOn, rienEcart,
   loiFidele, secoursOn, chancePalierMin fige) ; un genome v:1, v:2 ou v:3 se lit (migrer) et garde son identifiant. Le temoin est choisi par config.json "temoin" (c0025 = pilote-voltige.js par defaut ; c0101 ; ou un sacre entre les deux).
   - BORNES : 64 reels (45 de REGLAGES, 5 de la loi « retour », 14 constantes promues de pilote-voltige.js), 20 drapeaux, dessousDecor (choix 0/1/2),
     figMax (entier 0..5). Les cartes de raccCartes_* / raccJumeau_* sont celles de config.json (cartesTirage), lues une fois au chargement.
   - genomeTemoin(cfg) : le genome du temoin (cfg.temoin ; c0025 = ml/ecurie/pilote-voltige.js), REGLAGES lu par une regex, evalue dans un contexte
     vide, les drapeaux du portage lus dans son code (BLOCS) ; les tetes tirees une fois
     (graineReseaux), W2 = 0 : le pilote fabrique joue alors au bit pres comme pilote-voltige (identite.js le prouve).
   - muter / croiser / reparer : § 4.2 et § 6.2 du contrat. Tout tirage passe par le Rng recu (mulberry32 de graines.js), jamais Math.random.
   - ecrirePilote(genome) : le texte du pilote (modele.js, la balise remplacee par le bloc du genome), en LF, pret pour piloter.charger.
   Ligne de commande : node ml/evolution/genome.js --temoin [--nom c0101] [--ecrire sortie.js] | --essai-reparer 10000 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('./commun');
const {mulberry32}=require('./graines');

const CFG0=C.lireConfig();
const CARTES=Object.freeze(CFG0.cartesTirage.slice());
const MODELE=path.join(C.DOSSIER,'modele.js');
const VOLTIGE=path.join(C.RACINE,'ml','ecurie','pilote-voltige.js');
const BALISE='/*@GENOME@*/';

/* ===== LES BORNES (INTERFACES.md § 4.1) ===== */
/* les 45 reels de REGLAGES, dans l'ordre de leur apparition dans pilote-voltige.js : [cle, min, max, temoin (= naissance)] */
const REELS_R=[
  ['marge',3,20,10],['bandeDecor',10,99,99],['nitroDecor',0,1.5,1],['margeCouloir',5,25,15],['avance',.1,.8,.3],['glisse',.04,.3,.12],
  ['glisseUrgence',.1,.6,.3],['ligneLoin',100,500,320],['piecesLoin',60,350,180],['capLigne',.1,.5,.3],['avanceCap',0,.6,.25],['capAvance',0,.5,.25],
  ['braqueDoux',0,.5,.15],['braqueFort',.2,1,.5],['braqueNitro',.2,1.2,.7],['margeAllumer',-.1,.5,.05],['margeTenir',-.2,.3,0],['jaugeAllume',.2,1.2,.45],
  ['jaugeCoupe',0,.8,.25],['capMax',.1,.8,.35],['bascule',0,40,10],['tenirFacon',.1,1.5,.35],['derive',0,.6,.3],
  ['raccVirage',0,.6,.2],['raccGain',40,300,80],['raccAxe',.3,.95,.75],['raccTmin',.3,1.5,.7],['raccChute',30,300,120],['raccTmax',2,5.5,3.6],
  ['raccAir',.3,3,1.2],['raccBord',1,12,5],['raccAttente',.6,3,1.6],['raccRepos',.3,4,1.5],['figPlongeon',1.4,3.5,2.2],['figTemps',1.4,3,1.5],
  ['figJauge',.35,1,.4],['figEcart',.5,2,.55],['dessousMax',.2,3,.8],['dessousPose',0,60,25],['departMin',0,4,1.5],['departMax',1,8,5.5],
  ['volRetour',.2,1.5,.8],['volAvance',0,.4,.25],['figDepuis',.1,1.2,.4],['figHaut',0,60,15]];
/* les drapeaux, choix et entiers de REGLAGES, dans l'ordre de leur apparition (raccCartes_* et raccJumeau_* a la place de leur objet) */
const NON_REELS=[];
for(const c of CARTES)NON_REELS.push({cle:'raccCartes_'+c,type:'drapeau',min:0,max:1,naissance:(c==='grotte'||c==='canyon'||c==='jade')?0:1,ou:'raccCartes',carte:c});
for(const c of CARTES)NON_REELS.push({cle:'raccJumeau_'+c,type:'drapeau',min:0,max:1,naissance:(c==='jade'||c==='ville')?1:0,ou:'raccJumeau',carte:c});
NON_REELS.push({cle:'dessousAveugle',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'dessousDecor',type:'choix',min:0,max:2,naissance:1,ou:'R'});
NON_REELS.push({cle:'dessousNitro',type:'drapeau',min:0,max:1,naissance:0,ou:'R'});
NON_REELS.push({cle:'dessousFuir',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'portailVol',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'volDemiTour',type:'drapeau',min:0,max:1,naissance:1,ou:'R'});
NON_REELS.push({cle:'volRetourOn',type:'drapeau',min:0,max:1,naissance:0,ou:'volRetour'});
NON_REELS.push({cle:'figMax',type:'entier',min:0,max:5,naissance:2,ou:'R'});
/* la loi « retour » (amendement 2) */
const RETOUR=[
  {cle:'retourOn',type:'drapeau',min:0,max:1,naissance:0,ou:'retours'},
  {cle:'retMarge',type:'reel',min:4,max:14,naissance:8,ou:'R'},
  {cle:'retCap',type:'reel',min:.45,max:.9,naissance:.8,ou:'R'},
  {cle:'retGain',type:'reel',min:.7,max:1.4,naissance:.8,ou:'R'},
  {cle:'retAvance',type:'reel',min:.1,max:.25,naissance:.15,ou:'R'},
  {cle:'retourPrime',type:'reel',min:0,max:15,naissance:4,ou:'R'},
  {cle:'volMieux',type:'drapeau',min:0,max:1,naissance:0,ou:'R'}];
/* les 14 constantes promues (ecrites en dur dans pilote-voltige.js, lues G.<cle> dans modele.js) */
const PROMUES=[['axePoids',5,60,20],['vTemps',0,10,3],['vPortail',60,100,94],['vLevre',40,95,80],['vLibreBase',0,30,12],['vLibrePente',0,6,2],
  ['vCourt',10,60,34],['rAxe',50,500,250],['rTemps',0,80,25],['rPlane',0,100,40],['rLourde',0,100,40],['bVersRoute',0,10,3],['bVersRoutePlane',0,10,2],['bRien',0,10,1]];
/* les extraits de pilote-voltige.js qui portent ces constantes (§ 5.3) : s'ils manquent, pilote-voltige a change et le temoin ne se lit plus */
const EXTRAITS=['100-20*Math.abs(axe)-3*t-',"if(r.issue==='portail')return 94;",'return 80-3*t;','return 12+2*t;','return 34-Math.min(20,',
  "const s=Math.min(gain,600)-250*axe-25*t-(r.m==='plane'?40:0)-(r.note==='lourde'?40:0);",
  "(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0)"];

/* ===== LES GESTES DES JOUEURS (27/11/2026, tache « gestes » — Sacha : « donner a la selection de quoi trouver du neuf ») =====
   Cinq gestes que les vrais joueurs font et que le bot ne fait pas (ml/ecurie/etude/selection-naturelle/PROPOSITIONS.md, les verdicts « a essayer »
   et la proposition 4 de l'enquete 1). Chacun : un DRAPEAU a 0 a la naissance (le geste eteint, le pilote joue comme pilote-voltige au bit pres) et
   ses reglages, qui ne changent RIEN tant que le drapeau est eteint. Naissance = la valeur que propose l'enquete ; « l.N » = la ligne de PROPOSITIONS.md.
   Ajoutes A LA FIN de BORNES : un genome ecrit avant (v:1, 86 genes) se lit (migrer) et garde son identifiant (shaGenome). */
const GESTES=[
  /* 1. LES MAINS LACHEES AVANT LE CONTACT (enquete 2, l.115-119) : volant a 0 quand la pose annoncee sur la dalle est a moins de lacheAvant s */
  {cle:'lacheOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'lacheAvant',type:'reel',min:.15,max:.5,naissance:.35,ou:'R'},      /* l.115 « lacheAvant:.35 » ; la main obeit 0,11 a 0,38 s plus tard (l.93) ; les joueurs : |volant| 0,00 dans les 0,5 s avant la pose (l.104) */
  /* 2. LE SLALOM DEMANDE PAR LE PILOTE (enquete 3, l.227-239) : un cap alterne franc, avec la loi de ligne adoucie dans le meme bloc */
  {cle:'slalomOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'slalomCap',type:'reel',min:.2,max:.5,naissance:.35,ou:'R'},       /* l.235 « slalomCap:.35 » ; essais a 0,3 et 0,4 (l.194, l.216) */
  {cle:'slalomDemi',type:'reel',min:.38,max:.65,naissance:.45,ou:'R'},     /* l.235 « slalomDemi:.42 », corrige par le verificateur l.239 « garder slalomDemi a 0,45 au moins » (relecture du 27/11 : naissance .45) ; « ne pas descendre sous 0,38 » (l.237) ; l'aller des joueurs 0,55 a 0,65 s (l.201) */
  {cle:'slalomH',type:'reel',min:.9,max:3.5,naissance:3,ou:'R'},           /* l'horizon de la loi de ligne pendant le slalom : 3 (l.221, l.235 « toujours avec la proposition 1 ») ; 0,9 aujourd'hui ; essais 0,45 a 3 (l.215) */
  /* 3. LE COUP DE NITRO VU, VERSION SERREE (enquete 4, l.316-321) : un coup bref en vol quand le rayon AVEC le coup se pose aussi bien que SANS */
  {cle:'coupOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'coupDepuis',type:'reel',min:.35,max:1.2,naissance:.6,ou:'R'},      /* l.317 « coupDepuis .6 au lieu de .35 » ; les joueurs : premier coup a 0,80 s (l.308) */
  {cle:'coupEcart',type:'reel',min:.5,max:1.5,naissance:.7,ou:'R'},        /* l.317 « 0,7 s depuis le dernier coup » ; le jeu ne donne rien sous 0,5 s (l.305) ; joueurs 0,80, bot 1,52 (l.301) */
  {cle:'coupDuree',type:'reel',min:.1,max:.3,naissance:.15,ou:'R'},        /* l.317 « coupDuree=.15 s (deux vues) » ; les joueurs : 0,21 s, la moitie d'un seul echantillon de 0,108 s (l.301) */
  {cle:'coupPoseMin',type:'reel',min:.5,max:1.5,naissance:.8,ou:'R'},      /* l.317 « retour1.t >= .8 » ; le dernier coup des joueurs tombe 0,42 s avant la pose (l.303) */
  {cle:'coupAxe',type:'reel',min:.2,max:.5,naissance:.35,ou:'R'},          /* l.317 « |retour1.axe| <= max(.35, …) » ; 0,35 rad = le seuil d'une pose de travers (l.12) */
  {cle:'coupAir',type:'reel',min:.4,max:1.5,naissance:.8,ou:'R'},          /* l.317 « air.reste > retour1.t+.8 » */
  {cle:'coupJauge',type:'reel',min:.2,max:.6,naissance:.35,ou:'R'},        /* l.317 « jauge+reserve >= .35 » (un coup coute 0,12 : etude-nitro-vol/faire-coup.js) */
  {cle:'coupPerte',type:'reel',min:0,max:60,naissance:10,ou:'R'},          /* l.321 « retour1.gain >= retour0.gain - petit seuil » : le seuil (m de piste) n'est pas mesure, 10 est un choix */
  {cle:'coupDecor',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},         /* l.317 « coupDecor:0 » : pas de coup en grotte, canyon, jade, ville */
  /* 4. LE RELACHE APRES LE DECOLLAGE (enquete 4, l.333-338) : la nitro tenue au decollage est gardee jusqu'a relacheT s de vol, puis lachee */
  {cle:'relacheOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'relacheT',type:'reel',min:.12,max:.45,naissance:.25,ou:'R'},       /* l.334 « vol.t >= .25 s » ; joueurs relachent a 0,17 / 0,29 / 0,43 s (l.308), 0,23 (0,12 / 0,42) au verificateur (l.359) */
  /* 5. AU SOL APRES LA POSE, LA LIGNE SUIT LA CAISSE (enquete 1, proposition 4, l.51-54) */
  {cle:'suitOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'suitDerive',type:'reel',min:.1,max:.6,naissance:.3,ou:'R'},        /* l.52 « R.derive » (0,3 dans pilote-voltige) ; les joueurs contre-braquent de +0,1 a +0,7 s (l.9) */
  {cle:'suitMarge',type:'reel',min:0,max:.5,naissance:.25,ou:'R'}];        /* l.52 « R.derive+.25 (0,55 s) » ; le bot contre-braque encore a +1 s (l.15) */
const ORDRE_GESTES=GESTES.map(b=>b.cle);
const N_V1=86;   /* les genes d'un genome v:1 (avant les gestes) : les 86 premiers de BORNES */
const N_V2=107;  /* les genes d'un genome v:2 (avant le portage de la boucle payante) : les 107 premiers */

/* ===== LES APPORTS DE LA BOUCLE PAYANTE (28/11/2026, tache « portage » — « le genome doit savoir ecrire c0101 comme il ecrit c0025 ») =====
   La boucle payante du Ryzen (un modele de langage reecrit le pilote, le vrai jeu le note) a sacre cinq champions a la suite, depuis c0025
   (= ml/ecurie/pilote-voltige.js) : c0026, c0064, c0072, c0087, c0101 (ml/labo/cerveaux/). Les differences d'un sacre a l'autre se decoupent
   proprement en quatre blocs de code (un DRAPEAU chacun) et des constantes (des REELS) :
     c0026 : dessousMax .8 -> .4 et dessousPose 25 -> 40 (deux genes qui existaient deja) ; et « fuir le dessous sans attendre tenirFacon » (fuirVite) ;
     c0064 : le decollage nitro allumee quand le bord est imminent, maps sans decor (bordOn ; bordNitro, bordJauge) ;
     c0072 : les figures en vol subi a marge large, maps sans decor (largeOn ; largeHaut, largeT1, largeT2, largeAxe, largeAir, largeMax) ;
     c0087 : la nitro deja allumee gardee plus longtemps dans les virages, maps sans decor (libreOn ; nitroLibreK, tenirLibre) ;
     c0101 : largeHaut 9 -> 4 (le reglage d'un gene de c0072).
   Drapeau a 0 : le bloc ne s'execute pas, ses reglages ne sont pas lus, le pilote joue au bit pres comme c0025. Les reglages naissent a la valeur
   de c0101 (le dernier champion) : allumer un drapeau sur un genome c0025 apporte le bloc tel que c0101 le joue. Bornes : la valeur de c0025 quand
   elle existe (le parent : figHaut 15 pour largeHaut, 1 pour nitroLibreK, 0 pour tenirLibre), celle de c0072 et de c0101, et une marge autour qui
   reste dans le sens du geste ; les seuils mesures des commentaires de c0101 sont cites. Ajoutes A LA FIN de BORNES (apres les gestes) : un genome
   v:2 (107 genes) se lit (migrer) et garde son identifiant (shaGenome). Le detail : notes/portage.md. */
const PORTAGE=[
  /* c0026 : en vol, quitter TOUT DE SUITE une facon qui mene sous la dalle quand un autre rayon se pose dessus (sans attendre tenirFacon) */
  {cle:'fuirVite',type:'drapeau',min:0,max:1,naissance:0,ou:'R',sacre:'c0026'},
  /* c0064 : au sol, map sans decor, la route lache et le bord est dans moins de bordNitro s : la nitro reste tenue jusqu'au decollage */
  {cle:'bordOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R',sacre:'c0064'},
  {cle:'bordNitro',type:'reel',min:.3,max:1.2,naissance:.7,ou:'R',sacre:'c0064'},     /* c0064 et c0101 : .7 s ; tenue annonce le bord jusqu'a 3 s, un ordre met 0,2 s a partir : de .3 a 1,2 */
  {cle:'bordJauge',type:'reel',min:.2,max:1,naissance:.5,ou:'R',sacre:'c0064'},       /* c0064 et c0101 : .5 ; jaugeCoupe .25 / jaugeAllume .45 chez c0025 : de .2 a 1 */
  /* c0072 : les figures en vol subi a marge large (les deux rayons vers la route se posent, propres, dessus, droits ; la pose est lointaine) */
  {cle:'largeOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R',sacre:'c0072'},
  {cle:'largeHaut',type:'reel',min:2,max:15,naissance:4,ou:'R',sacre:'c0072'},       /* c0072 : 9 ; c0101 : 4 ; figHaut (la regle du parent) : 15 */
  {cle:'largeT1',type:'reel',min:1.6,max:3,naissance:2.2,ou:'R',sacre:'c0072'},      /* c0072 et c0101 : 2,2 s (« MESURE 26/11 : sous 2,2 s une figure dereglait le vol ») ; figTemps 1,4 a 3 */
  {cle:'largeT2',type:'reel',min:1.2,max:3,naissance:1.8,ou:'R',sacre:'c0072'},      /* c0072 et c0101 : 1,8 s ; la meme marge */
  {cle:'largeAxe',type:'reel',min:.25,max:.8,naissance:.5,ou:'R',sacre:'c0072'},     /* c0072 et c0101 : .5 rad ; .35 = une pose de travers, raccAxe .75 chez c0025 */
  {cle:'largeAir',type:'reel',min:.5,max:3,naissance:1.5,ou:'R',sacre:'c0072'},      /* c0072 et c0101 : 1,5 s ; raccAir 1,2 chez c0025 (borne .3 a 3) */
  {cle:'largeMax',type:'entier',min:1,max:5,naissance:3,ou:'R',sacre:'c0072'},       /* c0072 et c0101 : 3 figures ; figMax 2 chez c0025 (borne 0 a 5) */
  /* c0087 : map sans decor, la nitro DEJA allumee : seuil de volant x nitroLibreK, vitesse jusqu'a tenirLibre au-dessus de vSure */
  {cle:'libreOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R',sacre:'c0087'},
  {cle:'nitroLibreK',type:'reel',min:1,max:1.6,naissance:1.25,ou:'R',sacre:'c0087'}, /* c0087 et c0101 : 1,25 ; 1 = c0025 (le seuil de toujours) */
  {cle:'tenirLibre',type:'reel',min:0,max:.15,naissance:.05,ou:'R',sacre:'c0087'}];  /* c0087 et c0101 : .05 ; 0 = c0025 ; margeTenir 0 (borne -.2 a .3) */
const ORDRE_PORTAGE=PORTAGE.map(b=>b.cle);
const N_V3=121;  /* les genes d'un genome v:3 (avant les genes v4) : les 121 premiers */

/* ===== LES GENES V4 (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 2 et § 3 (il fait foi). Quatre idees nouvelles, chacune derriere un interrupteur ETEINT a la naissance
   (le pilote joue alors au bit pres comme c0025), et la seconde chance devenue un reglage FIGE (la selection n'y touche pas : fige:true, § 2.4) :
     sortieOn (+ sortieT, sortieJauge) : la nitro au decollage sur les maps a decor (le pendant de bordOn ; reecrit le 28/11 apres la mesure des
                                         decollages, ml/ecurie/etude/sortie-preparee : c'etait « garder la nitro quand seul le vol plane se pose ») ;
     rienOn (+ rienEcart)              : en vol, lacher le volant quand « rien » promet une pose plus droite d'au moins rienEcart rad ;
     loiFidele (0, 1, 2)               : juger (1), puis aussi suivre (2), le vol sur la loi que les yeux jouent exactement (LOI_PILOTE de modele.js) ;
     secoursOn                         : quand toutes les facons longues meurent, essayer deux lois de secours (plane bas, cabre) ;
     chancePalierMin (12)              : le palier de la seconde chance de la main (PROFIL.chance.palierMin), fige.
   Ajoutes A LA FIN de BORNES (apres le portage) : un genome v:3 (121 genes) se lit (migrer) et garde son identifiant (shaGenome). */
const GENES_V4=[
  {cle:'sortieOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'sortieT',type:'reel',min:.3,max:1.2,naissance:.7,ou:'R'},          /* la forme de bordNitro ; sous 1,5 s : vue.sorties.bord n'existe qu'a 1,5 s du bord (yeux.js) */
  {cle:'sortieJauge',type:'reel',min:.2,max:1,naissance:.5,ou:'R'},        /* les bornes et la naissance de bordJauge, un gene a lui (bordJauge est garde par bordOn) */
  {cle:'rienOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'rienEcart',type:'reel',min:.1,max:.4,naissance:.2,ou:'R'},         /* rad ; la grotte : « rien » se pose a 0,09, le bot a 0,44 (PROPOSITIONS.md l.109) */
  {cle:'loiFidele',type:'choix',min:0,max:2,naissance:0,ou:'R'},           /* 0 eteint, 1 juger, 2 juger et suivre ; un choix : 1 et 2 a parts egales */
  {cle:'secoursOn',type:'drapeau',min:0,max:1,naissance:0,ou:'R'},
  {cle:'chancePalierMin',type:'entier',min:1,max:30,naissance:12,ou:'profil',fige:true}];   /* les bornes de la main (doigts.js palierMin:['e',1,30]) */
const ORDRE_V4=GENES_V4.map(b=>b.cle);
/* LES NOMS DES COMPTEURS DE DECLENCHEMENTS (§ 4.2 du contrat, dans cet ordre) : le champ d'ordre « declic » n'en porte jamais d'autre.
   Les compteurs eux-memes sont les tic('…') de modele.js (section « LES COMPTEURS DE DECLENCHEMENTS ») ; tests/compteurs.test.js verifie dans les deux
   sens que cette liste et le texte collent. Un nom de plus ou de moins dans modele.js = une nouvelle epoque (notes/genes-v4.md § 4.1). */
const DECLICS=Object.freeze(['volRetourOn','retourOn','retourOn.reacteur','volMieux','dessousNitro','lacheOn','slalomOn','coupOn','coupDecor','relacheOn',
  'suitOn','suitOn.ensuite','fuirVite','bordOn','largeOn','libreOn','raccCartes','raccJumeau','sortieOn','sortieOn.vol','sortieOn.pose','rienOn',
  'loiFidele.desaccord','loiFidele.suit','secoursOn']);
/* LES QUATRE BLOCS DE CODE : pour chaque drapeau, les extraits qui le trahissent dans un pilote ecrit a la main, et les cles de REGLAGES qu'il apporte.
   genomeTemoin lit le drapeau d'un temoin dans son texte ; s'il y trouve les cles sans le code (ou l'inverse), il refuse. */
const BLOCS={
  fuirVite:{avec:['depuis>R.tenirFacon||fuit||(mien&&'],sans:['depuis>R.tenirFacon||(mien&&'],cles:[]},
  bordOn:{avec:['tn.t<R.bordNitro&&jauge>R.bordJauge)m.nitro=true;'],sans:[],cles:['bordNitro','bordJauge']},
  largeOn:{avec:['f.proche.haut>R.largeHaut','(parentOk||large)','const poseNette='],sans:[],cles:['largeHaut','largeT1','largeT2','largeAxe','largeAir','largeMax']},
  libreOn:{avec:['(m.nitro?R.nitroLibreK:1)','R.margeTenir-R.tenirLibre'],sans:[],cles:['nitroLibreK','tenirLibre']}};

/* ===== QUEL DRAPEAU GARDE QUEL REEL (28/11/2026, lot « regles » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 2 C2 :
   « ne tirer les reels que parmi ceux que le pilote lit ») =====
   LA SEULE TABLE : drapeau -> les reels que le pilote fabrique (modele.js, et bloc() plus bas) ne lit JAMAIS quand ce drapeau vaut 0. Relue dans le code,
   pas dans les noms :
     volRetourOn : bloc() ecrit « volRetour:0 » quand il est eteint (la portee de « vers la route » reste 40 m) ;
     retourOn    : bloc() n'ecrit « retours:[] » que s'il est allume ; retMarge, retCap, retGain, retAvance n'y vont que la ; retourPrime n'est lu que par
                   prime() d'une facon retour<i>, i < R.retours.length (le choix du depart et la bascule en sautent les autres, coup compris) ;
     les gestes  : chaque reglage n'est lu que sous « R.<drapeau>>0 » (lacheOn, slalomOn par zActif, coupOn, relacheOn, suitOn) ;
     le portage  : bordOn (bordNitro, bordJauge) ; largeOn (largeHaut, largeAxe, largeAir sous R.largeOn>0 ; largeT1, largeT2 dans tSeuil, qui ne
                   compte que si large est vrai, donc si largeOn) ; libreOn (nitroLibreK, tenirLibre par « libre »).
   Hors de la table (pas des reels de l'urne) : coupDecor (un drapeau garde par coupOn) et largeMax (un entier garde par largeOn : son tirage est celui
   des entiers, pFigMax, il ne change pas). tests/genes-muets.test.js prouve la table sur les vues de l'inventaire et de tests/portage.test.js : drapeau
   eteint, un reel garde pousse a ses bornes ne change aucune decision ; drapeau allume, il en change. */
const GARDES=Object.freeze({
  volRetourOn:Object.freeze(['volRetour']),
  retourOn:Object.freeze(['retMarge','retCap','retGain','retAvance','retourPrime']),
  lacheOn:Object.freeze(['lacheAvant']),
  slalomOn:Object.freeze(['slalomCap','slalomDemi','slalomH']),
  coupOn:Object.freeze(['coupDepuis','coupEcart','coupDuree','coupPoseMin','coupAxe','coupAir','coupJauge','coupPerte']),
  relacheOn:Object.freeze(['relacheT']),
  suitOn:Object.freeze(['suitDerive','suitMarge']),
  bordOn:Object.freeze(['bordNitro','bordJauge']),
  largeOn:Object.freeze(['largeHaut','largeT1','largeT2','largeAxe','largeAir']),
  libreOn:Object.freeze(['nitroLibreK','tenirLibre']),
  /* (28/11/2026, lot « genes v4 ») sortieT et sortieJauge ne sont lus que sous R.sortieOn>0, rienEcart que sous R.rienOn>0 ; loiFidele, secoursOn et
     chancePalierMin ne gardent aucun reel */
  sortieOn:Object.freeze(['sortieT','sortieJauge']),
  rienOn:Object.freeze(['rienEcart'])});
/* reel -> son drapeau de garde (construit depuis GARDES, controle plus bas avec BORNES) */
const GARDE_DE=Object.freeze(Object.keys(GARDES).reduce((o,d)=>{for(const r of GARDES[d])o[r]=d;return o;},{}));

/* ===== LES TEMOINS POSSIBLES (28/11/2026, tache « portage ») =====
   config.json "temoin" : le pilote ecrit a la main dont part une population neuve (c0025 par defaut). Chacun a son fichier, auquel le controle
   d'identite compare le pilote fabrique par son genome. Les sacres intermediaires sont la aussi : ils prouvent que chaque apport se decoupe seul. */
const TEMOINS=Object.freeze({
  c0025:Object.freeze({fichier:'ml/ecurie/pilote-voltige.js',dit:'pilote-voltige (c0025), le pilote ecrit a la main'}),
  c0026:Object.freeze({fichier:'ml/labo/cerveaux/c0026-pilote.js',dit:'c0026, 1er sacre de la boucle payante'}),
  c0064:Object.freeze({fichier:'ml/labo/cerveaux/c0064-pilote.js',dit:'c0064, 2e sacre de la boucle payante'}),
  c0072:Object.freeze({fichier:'ml/labo/cerveaux/c0072-pilote.js',dit:'c0072, 3e sacre de la boucle payante'}),
  c0087:Object.freeze({fichier:'ml/labo/cerveaux/c0087-pilote.js',dit:'c0087, 4e sacre de la boucle payante'}),
  c0101:Object.freeze({fichier:'ml/labo/cerveaux/c0101-pilote.js',dit:'c0101, le dernier champion de la boucle payante'})});
const TEMOIN_DEFAUT='c0025';

const BORNES=Object.freeze([].concat(
  REELS_R.map(([cle,min,max,n])=>({cle,type:'reel',min,max,naissance:n,ou:cle==='volRetour'?'volRetour':'R'})),
  NON_REELS,RETOUR,
  PROMUES.map(([cle,min,max,n])=>({cle,type:'reel',min,max,naissance:n,ou:'G'})),
  GESTES,PORTAGE,GENES_V4).map(b=>Object.freeze(b)));
const PAR_CLE=Object.freeze(BORNES.reduce((o,b)=>{o[b.cle]=b;return o;},{}));
const CONTINUS=Object.freeze(BORNES.filter(b=>b.type==='reel').map(b=>b.cle));
const TETES=Object.freeze({rayon:Object.freeze({cle:'WV',nIn:36,nH:6,nOut:1,nW1:216,nW2:6}),sol:Object.freeze({cle:'WS',nIn:12,nH:6,nOut:3,nW1:72,nW2:18})});
const LONGUEUR={WV:222,WS:90};
const VERSION=4;   /* v:1 = 86 genes (27/11, etape 2) ; v:2 = + les 21 genes des gestes (27/11, tache « gestes ») ; v:3 = + les 14 du portage (28/11) ;
                      v:4 = + les 8 genes v4 (28/11, lot « genes v4 ») */
if(BORNES.length!==129||CONTINUS.length!==91)throw new Error('genome : BORNES mal construites ('+BORNES.length+' genes, '+CONTINUS.length+' reels)');
if(BORNES.filter(b=>b.fige).map(b=>b.cle).join(',')!=='chancePalierMin')throw new Error('genome : seul chancePalierMin est fige');
const CLES_V1=Object.freeze(BORNES.slice(0,N_V1).map(b=>b.cle));
const CLES_V2=Object.freeze(BORNES.slice(0,N_V2).map(b=>b.cle));
const CLES_V3=Object.freeze(BORNES.slice(0,N_V3).map(b=>b.cle));
for(const b of BORNES)if(!(b.naissance>=b.min&&b.naissance<=b.max))throw new Error('genome : naissance hors borne pour « '+b.cle+' »');
for(const d in GARDES){if(!PAR_CLE[d]||PAR_CLE[d].type!=='drapeau')throw new Error('genome : GARDES : « '+d+' » n\'est pas un drapeau de BORNES');
  for(const r of GARDES[d])if(!PAR_CLE[r]||PAR_CLE[r].type!=='reel')throw new Error('genome : GARDES : « '+r+' » n\'est pas un reel de BORNES');}
if(Object.keys(GARDE_DE).length!==33)throw new Error('genome : GARDES doit garder 33 reels ('+Object.keys(GARDE_DE).length+')');

/* L'ORDRE DES CLES DE REGLAGES dans pilote-voltige.js (le bloc ecrit suit cet ordre, comme l'exemple du § 5.1 ; les cles de la loi « retour » ensuite) */
const ORDRE_VOLTIGE=['marge','bandeDecor','nitroDecor','margeCouloir','avance','glisse','glisseUrgence','ligneLoin','piecesLoin','capLigne','avanceCap',
  'capAvance','braqueDoux','braqueFort','braqueNitro','margeAllumer','margeTenir','jaugeAllume','jaugeCoupe','capMax','bascule','tenirFacon','derive',
  'raccVirage','raccGain','raccAxe','raccTmin','raccChute','raccTmax','raccAir','raccBord','raccAttente','raccCartes','raccJumeau','raccRepos',
  'figPlongeon','figTemps','figJauge','figEcart','dessousMax','dessousAveugle','dessousDecor','dessousNitro','dessousFuir','dessousPose','departMin',
  'departMax','portailVol','volDemiTour','volRetour','volAvance','figMax','figDepuis','figHaut'];
const ORDRE_RETOUR=['retourOn','retMarge','retCap','retGain','retAvance','retourPrime','volMieux'];

/* ===== LES ARRONDIS ===== */
const sansMoinsZero=x=>x===0?0:x;
const arr4=x=>sansMoinsZero(+(+x).toFixed(4));
const arr6=x=>sansMoinsZero(+(+x).toFixed(6));
const fini=x=>typeof x==='number'&&x-x===0;
const cl=(x,a,b)=>x<a?a:x>b?b:x;
const TOL=1e-9;

function cfgDe(cfg){
  const c=cfg||CFG0;
  if(Array.isArray(c.cartesTirage)&&c.cartesTirage.join(',')!==CARTES.join(','))
    throw new Error('genome : cfg.cartesTirage ('+c.cartesTirage.join(',')+') differe de config.json ('+CARTES.join(',')+') : les genes raccCartes_*/raccJumeau_* ne correspondent plus');
  return c;}
function bornePoids(cfg){const b=(cfg||CFG0).bornePoids;return fini(b)&&b>0?b:4;}

/* ===== LES TETES A LA NAISSANCE (§ 3.2) : W1 ~ N(0, 1/sqrt(nIn)), dans l'ordre des indices ; W2 = 0 ===== */
function tirerReseaux(graine){
  const rng=mulberry32(graine>>>0),bp=bornePoids();
  const WV=new Array(LONGUEUR.WV).fill(0),WS=new Array(LONGUEUR.WS).fill(0);
  for(let i=0;i<TETES.rayon.nW1;i++)WV[i]=arr6(cl(rng.normal()/6,-bp,bp));
  for(let i=0;i<TETES.sol.nW1;i++)WS[i]=arr6(cl(rng.normal()/Math.sqrt(12),-bp,bp));
  return {WV,WS};}

/* ===== REPARER (§ 4.2) : bornes, types, les trois contraintes, arrondis, -0 -> 0 ; en place, idempotent ===== */
function reparer(genome,cfg){
  if(!genome||typeof genome!=='object')throw new Error('genome : reparer attend un genome (objet)');
  const A0=genome.A&&typeof genome.A==='object'?genome.A:{},A={};
  for(const b of BORNES){
    let x=A0[b.cle];
    if(b.type==='reel'){x=+x;if(!fini(x))x=b.naissance;A[b.cle]=arr4(cl(x,b.min,b.max));}
    else if(b.type==='drapeau')A[b.cle]=x?1:0;
    else{x=+x;if(!fini(x))x=b.naissance;A[b.cle]=sansMoinsZero(cl(Math.round(x),b.min,b.max));}}
  /* 1. braqueFort >= braqueDoux + 0,1 */
  if(A.braqueFort<A.braqueDoux+.1-TOL){
    A.braqueFort=arr4(A.braqueDoux+.1);
    if(A.braqueFort>PAR_CLE.braqueFort.max){A.braqueFort=PAR_CLE.braqueFort.max;A.braqueDoux=arr4(A.braqueFort-.1);}}
  /* 2. jaugeCoupe <= jaugeAllume */
  if(A.jaugeCoupe>A.jaugeAllume)A.jaugeCoupe=A.jaugeAllume;
  /* 3. departMax >= departMin */
  if(A.departMax<A.departMin)A.departMax=A.departMin;
  genome.v=VERSION;genome.A=A;
  const bp=bornePoids(cfg);
  for(const t of ['WV','WS']){
    const W=genome[t];
    if(!W||typeof W.length!=='number'||W.length!==LONGUEUR[t])throw new Error('genome : la tete '+t+' doit avoir '+LONGUEUR[t]+' poids ('+(W&&W.length)+')');
    const R=new Array(LONGUEUR[t]);
    for(let i=0;i<R.length;i++){let x=+W[i];if(!fini(x))x=0;R[i]=arr6(cl(x,-bp,bp));}
    genome[t]=R;}
  return genome;}

/* ===== VALIDER : null si conforme, sinon le premier defaut ===== */
function valider(genome,cfg){
  if(!genome||typeof genome!=='object')return 'pas un objet';
  migrer(genome);   /* un genome v:1, v:2 ou v:3 conforme devient v:4, EN PLACE : evoluer.js valide chaque vivant au chargement, c'est la qu'il migre */
  if(genome.v!==VERSION)return 'version '+genome.v+' (attendu '+VERSION+', ou 1 avec ses 86 genes, ou 2 avec ses 107, ou 3 avec ses 121)';
  const A=genome.A;if(!A||typeof A!=='object')return 'A manque';
  const k=Object.keys(A);
  if(k.length!==BORNES.length)return 'A a '+k.length+' genes (attendu '+BORNES.length+')';
  for(let i=0;i<BORNES.length;i++){const b=BORNES[i],x=A[b.cle];
    if(k[i]!==b.cle)return 'A : cle « '+k[i]+' » a la place de « '+b.cle+' »';
    if(!fini(x))return 'gene « '+b.cle+' » non numerique';
    if(x<b.min||x>b.max)return 'gene « '+b.cle+' » hors borne ('+x+' hors ['+b.min+', '+b.max+'])';
    if(b.type!=='reel'&&x!==Math.round(x))return 'gene « '+b.cle+' » non entier';
    if(b.type==='reel'&&x!==arr4(x))return 'gene « '+b.cle+' » non arrondi a 4 decimales';
    if(x===0&&1/x<0)return 'gene « '+b.cle+' » vaut -0';}
  if(A.braqueFort<A.braqueDoux+.1-TOL)return 'contrainte braqueFort >= braqueDoux + 0,1';
  if(A.jaugeCoupe>A.jaugeAllume)return 'contrainte jaugeCoupe <= jaugeAllume';
  if(A.departMax<A.departMin)return 'contrainte departMax >= departMin';
  const bp=bornePoids(cfg);
  for(const t of ['WV','WS']){const W=genome[t];
    if(!W||typeof W.length!=='number'||W.length!==LONGUEUR[t])return 'tete '+t+' : '+(W&&W.length)+' poids (attendu '+LONGUEUR[t]+')';
    for(let i=0;i<W.length;i++){const x=W[i];
      if(!fini(x))return 'tete '+t+' : poids '+i+' non fini';
      if(x<-bp||x>bp)return 'tete '+t+' : poids '+i+' hors de ±'+bp;
      if(x===0&&1/x<0)return 'tete '+t+' : poids '+i+' vaut -0';}}
  return null;}

function copier(g){const A=migrer({v:g.v,A:Object.assign({},g.A)}).A;return {v:VERSION,A:Object.assign({},A),WV:Array.from(g.WV),WS:Array.from(g.WS)};}

/* ===== MIGRER (27/11/2026, tache « gestes » ; 28/11/2026, tache « portage ») =====
   Un genome v:1 (les 86 genes d'avant les gestes, dans leur ordre, rien d'autre) recoit les 21 genes des gestes ET les 14 du portage a leur
   naissance ; un genome v:2 (les 107 genes d'avant le portage, dans leur ordre) recoit les 14 du portage a leur naissance (drapeaux a 0 : la
   conduite de c0025). Il devient v:3, EN PLACE ; rend le meme objet. Tout autre genome est rendu tel quel (valider dira son defaut). Ni les valeurs
   d'avant ni les tetes ne bougent : un pilote migre conduit comme avant, et son identifiant (shaGenome) ne change pas.
   (28/11/2026, lot « genes v4 ») un cran plus loin : v:1, v:2 ou v:3 (les 121 genes d'avant les genes v4, dans leur ordre) recoivent aussi les 8 genes
   v4 a leur naissance (interrupteurs a 0, chancePalierMin 12) et deviennent v:4. */
function migrer(genome){
  if(!genome||typeof genome!=='object'||(genome.v!==1&&genome.v!==2&&genome.v!==3)||!genome.A||typeof genome.A!=='object')return genome;
  const k=Object.keys(genome.A),cles=genome.v===1?CLES_V1:genome.v===2?CLES_V2:CLES_V3;
  if(k.length!==cles.length)return genome;
  for(let i=0;i<cles.length;i++)if(k[i]!==cles[i])return genome;
  const A={};
  for(const c of cles)A[c]=genome.A[c];
  if(genome.v===1)for(const b of GESTES)A[b.cle]=b.naissance;
  if(genome.v===1||genome.v===2)for(const b of PORTAGE)A[b.cle]=b.naissance;
  for(const b of GENES_V4)A[b.cle]=b.naissance;
  genome.A=A;genome.v=VERSION;
  return genome;}

/* ===== LE TEMOIN : le genome du pilote ecrit a la main que config.json nomme ("temoin", c0025 par defaut) ===== */
function nomTemoin(cfg){
  const n=cfg&&cfg.temoin!=null?String(cfg.temoin):TEMOIN_DEFAUT;
  if(!Object.prototype.hasOwnProperty.call(TEMOINS,n))throw new Error('genome : temoin inconnu « '+n+' » (config "temoin" : '+Object.keys(TEMOINS).join(', ')+')');
  return n;}
function sourceTemoin(cfg){return path.join(C.RACINE,...TEMOINS[nomTemoin(cfg)].fichier.split('/'));}
function lireReglagesVoltige(texte,nom){
  nom=nom||'pilote-voltige.js';
  const m=texte.match(/const REGLAGES=\{[\s\S]*?\r?\n\};/);
  if(!m)throw new Error('genome : '+nom+' a change (bloc const REGLAGES={…}; introuvable)');
  const ctx=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
  const R=vm.runInContext(m[0]+'\nREGLAGES;',ctx,{timeout:1000});
  if(!R||typeof R!=='object')throw new Error('genome : REGLAGES de '+nom+' illisible');
  return JSON.parse(JSON.stringify(R));}
/* les drapeaux du portage d'un pilote ecrit a la main : lus dans son code (BLOCS), recoupes avec ses cles de REGLAGES */
function apportsDe(texte,R,nom){
  const D={};
  for(const cle of ORDRE_PORTAGE.filter(c=>BLOCS[c])){
    const B=BLOCS[cle],code=B.avec.every(e=>texte.indexOf(e)>=0),aucun=B.avec.every(e=>texte.indexOf(e)<0);
    const cles=B.cles.filter(c=>c in R).length;
    if(!code&&!aucun)throw new Error('genome : '+nom+' porte une partie seulement du bloc « '+cle+' » ('+B.avec.filter(e=>texte.indexOf(e)<0).join(' | ')+' manque)');
    if(code&&cles!==B.cles.length)throw new Error('genome : '+nom+' a le code du bloc « '+cle+' » sans ses reglages ('+B.cles.join(', ')+')');
    if(!code&&cles)throw new Error('genome : '+nom+' a des reglages du bloc « '+cle+' » sans son code');
    if(!code)for(const e of B.sans)if(texte.indexOf(e)<0)throw new Error('genome : '+nom+' a change (ni le bloc « '+cle+' » ni le code de c0025 : '+e+')');
    D[cle]=code?1:0;}
  return D;}
function genomeTemoin(cfg){
  cfg=cfgDe(cfg);
  const nom=nomTemoin(cfg),fichier=sourceTemoin(cfg),court=path.basename(fichier);
  const texte=fs.readFileSync(fichier,'utf8');
  for(const e of EXTRAITS)if(texte.indexOf(e)<0)throw new Error('genome : '+court+' a change (extrait introuvable : '+e+')');
  const R=lireReglagesVoltige(texte,court),D=apportsDe(texte,R,court);
  const voulues=ORDRE_VOLTIGE.concat(...ORDRE_PORTAGE.filter(c=>BLOCS[c]&&D[c]).map(c=>BLOCS[c].cles));
  const k=Object.keys(R),attendu=new Set(voulues);
  for(const c of k)if(!attendu.has(c))throw new Error('genome : REGLAGES de '+court+' a une cle absente de BORNES « '+c+' »');
  for(const c of voulues)if(!(c in R))throw new Error('genome : la cle « '+c+' » de BORNES manque dans REGLAGES de '+court);
  const A={};
  for(const b of BORNES){
    let x;
    if(b.ou==='R'&&D[b.cle]!=null)x=D[b.cle];
    else if(b.ou==='R')x=(b.cle in R)?R[b.cle]:b.naissance;
    else if(b.ou==='G'||b.ou==='retours')x=b.naissance;
    else if(b.ou==='raccCartes')x=R.raccCartes&&R.raccCartes[b.carte]===0?0:1;
    else if(b.ou==='raccJumeau')x=R.raccJumeau&&R.raccJumeau[b.carte]?1:0;
    else if(b.cle==='volRetourOn')x=R.volRetour>0?1:0;
    else if(b.cle==='volRetour')x=R.volRetour>0?R.volRetour:b.naissance;
    /* (28/11/2026, lot « genes v4 ») le palier de la seconde chance : lu dans le PROFIL du texte du temoin, mot pour mot */
    else if(b.ou==='profil'&&b.cle==='chancePalierMin'){const mc=texte.match(/chance:\{prend:1,palierMin:(\d+)\}/);
      if(!mc)throw new Error('genome : '+court+' a change (chance:{prend:1,palierMin:N} introuvable)');x=+mc[1];}
    else throw new Error('genome : gene « '+b.cle+' » sans source');
    if(!fini(x))throw new Error('genome : valeur du temoin non numerique pour « '+b.cle+' »');
    if(x<b.min||x>b.max)throw new Error('genome : la valeur du temoin sort de sa borne pour « '+b.cle+' » ('+x+' hors ['+b.min+', '+b.max+'])');
    A[b.cle]=x;}
  /* une cle de pilote-voltige a valeur reelle qui ne tombe pas sur une borne : refuse (toutes les cles hors objets sont des genes) */
  const net=reparer(Object.assign({v:1,A},tirerReseaux(cfg.graineReseaux>>>0)),cfg);
  for(const b of BORNES)if(Math.abs(net.A[b.cle]-A[b.cle])>TOL)throw new Error('genome : la valeur du temoin de « '+b.cle+' » ne survit pas a reparer ('+A[b.cle]+' -> '+net.A[b.cle]+')');
  return net;}

/* LES REELS QUE LE PILOTE DE CE GENOME LIT (28/11, lot « regles ») : CONTINUS, dans son ordre, moins ceux dont le drapeau de garde vaut 0 (GARDES) */
function reelsLus(genome){return CONTINUS.filter(c=>{const d=GARDE_DE[c];return !d||genome.A[d]!==0;});}

/* ===== MUTER (§ 6.2) ===== */
function muter(genome,rng,o){
  o=o||{};const cfg=cfgDe(o.cfg),phase=o.phase||'A';
  if(phase!=='A'&&phase!=='B'&&phase!=='C')throw new Error('genome : phase inconnue « '+phase+' »');
  const avant=copier(genome),g=copier(genome),A=g.A;
  const sigma=o.sigma!=null?+o.sigma:+cfg.sigmaMutation;
  /* (28/11/2026, lot « regles » ; synthese § 2 C2) L'URNE = LES REELS QUE LE PILOTE DU PARENT LIT (reelsLus : CONTINUS moins ceux dont le drapeau de
     garde vaut 0 chez le parent, table GARDES). Avant, un tirage sur trois du temoin c0025 (34 % en v:3, 27 % en v:2) tombait sur un reglage que le
     pilote ne lit pas : une mutation perdue. Le nombre m ne change pas (borne a la taille de l'urne, 58 reels au moins), ni les tirages des drapeaux,
     du choix, des entiers et des tetes ; l'ordre des cles de l'urne reste celui de CONTINUS. Un drapeau allume dans CETTE naissance garde les reglages
     du parent (ou de leur naissance) : c'est l'enfant suivant qui les fera muter. o.urneComplete (les mesures et les tests seulement) : l'ancienne urne. */
  const urne=o.urneComplete?CONTINUS.slice():reelsLus(g);
  let m=o.genes!=null?Math.round(+o.genes):1+rng.poisson(+cfg.poissonMutations);
  m=Math.max(0,Math.min(urne.length,m));
  /* les reels : m distincts tires dans l'urne ; x + N(0,1)·sigma·etendue, reflexion aux bornes puis bornage */
  for(let n=0;n<m;n++){
    const cle=urne.splice(rng.entier(urne.length),1)[0],b=PAR_CLE[cle],e=b.max-b.min;
    let x=(+A[cle])+rng.normal()*sigma*e;
    if(x>b.max)x=2*b.max-x;else if(x<b.min)x=2*b.min-x;
    A[cle]=cl(x,b.min,b.max);}
  /* les drapeaux, dessousDecor, figMax : un tirage chacun, dans l'ordre de BORNES */
  const pD=+cfg.pDrapeau,pF=+cfg.pFigMax;
  for(const b of BORNES){
    if(b.fige)continue;   /* (28/11, lot « genes v4 ») chancePalierMin : aucun tirage (c'est le dernier gene : la suite des autres tirages n'en depend pas) */
    if(b.type==='drapeau'){if(rng.suivant()<pD)A[b.cle]=A[b.cle]?0:1;}
    else if(b.type==='choix'){if(rng.suivant()<pD){const autres=[];for(let v=b.min;v<=b.max;v++)if(v!==A[b.cle])autres.push(v);A[b.cle]=autres[rng.entier(autres.length)];}}
    else if(b.type==='entier'){if(rng.suivant()<pF)A[b.cle]=cl(A[b.cle]+(rng.suivant()<.5?-1:1),b.min,b.max);}}
  /* les tetes : W2 en phase B et C, W1 en plus en phase C */
  const ouvrir=(P,partie)=>{
    if(!P||!(rng.suivant()<+P.pTete))return;
    const t=rng.suivant()<.5?TETES.rayon:TETES.sol,W=g[t.cle];
    const n=partie==='W2'?t.nW2:t.nW1,off=partie==='W2'?t.nW1:0,k=Math.max(1,Math.round(+P.part*n));
    const ids=[];for(let i=0;i<n;i++)ids.push(i);
    const pris=[];for(let j=0;j<k&&ids.length;j++)pris.push(ids.splice(rng.entier(ids.length),1)[0]);
    for(const i of pris)W[off+i]=W[off+i]+rng.normal()*(+P.sigma);};
  if(phase==='B'||phase==='C')ouvrir(cfg.phases&&cfg.phases.B,'W2');
  if(phase==='C')ouvrir(cfg.phases&&cfg.phases.C,'W1');
  reparer(g,cfg);
  const mutes=[];
  for(const b of BORNES)if(g.A[b.cle]!==avant.A[b.cle])mutes.push({cle:b.cle,avant:avant.A[b.cle],apres:g.A[b.cle]});
  for(const t of ['WV','WS'])if(g[t].some((x,i)=>x!==avant[t][i]))mutes.push({cle:t,avant:null,apres:null});
  return {genome:g,mutes};}

/* ===== CROISER (§ 6.2) : chaque gene chez l'un ou l'autre ; chaque tete entiere chez l'un ===== */
function croiser(g1,g2,rng){
  const A={};
  for(const b of BORNES)A[b.cle]=b.fige?g1.A[b.cle]:rng.suivant()<.5?g1.A[b.cle]:g2.A[b.cle];   /* un gene fige : celui du premier parent, sans tirage */
  const WV=Array.from(rng.suivant()<.5?g1.WV:g2.WV),WS=Array.from(rng.suivant()<.5?g1.WS:g2.WS);
  return reparer({v:VERSION,A,WV,WS});}

/* ===== LES EMPREINTES ===== */
function enOrdre(genome){const A={};for(const b of BORNES)A[b.cle]=genome.A[b.cle];return A;}
/* (27/11/2026, tache « gestes ») L'IDENTIFIANT NE CHANGE PAS A LA MIGRATION : tant que les 21 genes des gestes sont TOUS a leur naissance, le sha est
   celui du genome v:1 d'avant (v:1 et les 86 premiers genes) ; sinon, celui du genome v:2 entier. Les deux formes ne se confondent pas (v differe). */
/* (28/11/2026, tache « portage ») la meme regle un cran plus loin : les 14 genes du portage TOUS a leur naissance (c0025), le sha est celui du
   genome v:2 d'avant (v:2 et les 107 premiers genes), qui lui-meme se ramene au v:1 si les gestes sont aussi a leur naissance ; sinon, celui du
   genome v:3 entier. Un pilote ne avant le portage garde donc son identifiant. */
function gestesANaissance(genome){for(const b of GESTES)if(genome.A[b.cle]!==b.naissance)return false;return true;}
function portageANaissance(genome){for(const b of PORTAGE)if(genome.A[b.cle]!==b.naissance)return false;return true;}
/* (28/11/2026, lot « genes v4 ») encore un cran : les 8 genes v4 TOUS a leur naissance (chancePalierMin compris), le sha est celui du genome v:3
   d'avant (qui se ramene lui-meme au v:2 ou au v:1) ; sinon, celui du genome v:4 entier. c0025 garde 19e3767cc346, c0101 f70ddcb5a565. */
function v4ANaissance(genome){for(const b of GENES_V4)if(genome.A[b.cle]!==b.naissance)return false;return true;}
function shaGenome(genome0){
  const genome=genome0&&(genome0.v===1||genome0.v===2||genome0.v===3)?migrer({v:genome0.v,A:Object.assign({},genome0.A),WV:genome0.WV,WS:genome0.WS}):genome0;   /* l'entree n'est pas touchee */
  const W={WV:Array.from(genome.WV),WS:Array.from(genome.WS)};
  if(genome.v===VERSION&&v4ANaissance(genome)){
    if(portageANaissance(genome)){
      const cles=gestesANaissance(genome)?CLES_V1:CLES_V2,A={};for(const c of cles)A[c]=genome.A[c];
      return C.sha1(JSON.stringify({v:cles===CLES_V1?1:2,A:A,WV:W.WV,WS:W.WS}));}
    const A={};for(const c of CLES_V3)A[c]=genome.A[c];
    return C.sha1(JSON.stringify({v:3,A:A,WV:W.WV,WS:W.WS}));}
  return C.sha1(JSON.stringify({v:genome.v,A:enOrdre(genome),WV:W.WV,WS:W.WS}));}
function idDe(genome){return shaGenome(genome).slice(0,12);}
function shaPilote(texte){return C.sha1(texte);}

/* ===== DISTANCES (le tableau) ===== */
function distance(g1,g2){
  let s=0;
  for(const b of BORNES){const a=g1.A[b.cle],c=g2.A[b.cle];
    if(b.type==='reel'||b.type==='entier')s+=Math.abs(a-c)/(b.max-b.min);else s+=a!==c?1:0;}
  return s/BORNES.length;}
function distanceW2(g1,g2){
  let s=0,n=0;
  for(const t of [TETES.rayon,TETES.sol])for(let i=t.nW1;i<t.nW1+t.nW2;i++){s+=Math.abs(g1[t.cle][i]-g2[t.cle][i]);n++;}
  return s/n;}

/* ===== LE PILOTE (§ 5.1) : modele.js, la balise remplacee par le bloc du genome ===== */
function bloc(genome,o){
  const cfg=cfgDe(o.cfg),A=genome.A,F=cfg.retourFige||{rv:.2,rm:.24,rn:.18};
  const r=[];
  for(const k of ORDRE_VOLTIGE){
    if(k==='raccCartes')r.push('raccCartes:{'+CARTES.filter(c=>A['raccCartes_'+c]===0).map(c=>c+':0').join(',')+'}');
    else if(k==='raccJumeau')r.push('raccJumeau:{'+CARTES.filter(c=>A['raccJumeau_'+c]===1).map(c=>c+':1').join(',')+'}');
    else if(k==='volRetour')r.push('volRetour:'+(A.volRetourOn?String(A.volRetour):'0'));
    else r.push(k+':'+String(A[k]));}
  for(const k of ORDRE_RETOUR)r.push(k+':'+String(A[k]));
  for(const k of ORDRE_GESTES)r.push(k+':'+String(A[k]));   /* les gestes (27/11, tache « gestes ») : drapeaux et reglages, lus R.<cle> dans modele.js */
  for(const k of ORDRE_PORTAGE)r.push(k+':'+String(A[k]));  /* le portage de la boucle payante (28/11, tache « portage ») : lus R.<cle> dans modele.js */
  for(const k of ORDRE_V4)r.push(k+':'+String(A[k]));       /* les genes v4 (28/11, lot « genes v4 ») : lus R.<cle> ; chancePalierMin par PROFIL */
  r.push('volNitro:0');
  r.push('retours:['+(A.retourOn?'{marge:'+A.retMarge+',cap:'+A.retCap+',gain:'+A.retGain+',avance:'+A.retAvance+',rv:'+String(+F.rv)+',rm:'+String(+F.rm)+',rn:'+String(+F.rn)+'}':'')+']');
  const gG=PROMUES.map(([k])=>k+':'+String(A[k])).join(',');
  return ['/*@GENOME@ debut : ecrit par ml/evolution/genome.js (ecrirePilote), genome '+idDe(genome)+' — ne pas editer */',
    'const REGLAGES={'+r.join(',')+'};',
    'const G={'+gG+'};',
    'const WV=new Float64Array(['+genome.WV.map(String).join(',')+']),WS=new Float64Array(['+genome.WS.map(String).join(',')+']);',
    'const CONTROLE_RAYONS='+(o.controleRayons!==false)+';',
    '/*@GENOME@ fin*/'];}
function ecrirePilote(genome,o){
  o=o||{};
  const d=valider(genome,o.cfg);if(d)throw new Error('genome : ecrirePilote refuse un genome non conforme : '+d);
  const modele=(o.modele!=null?String(o.modele):fs.readFileSync(MODELE,'utf8')).replace(/\r\n?/g,'\n');
  const L=modele.split('\n'),ou=[];
  for(let i=0;i<L.length;i++)if(L[i]===BALISE)ou.push(i);
  if(ou.length!==1)throw new Error('genome : modele.js doit porter une seule ligne « '+BALISE+' » ('+(ou.length?ou.length+' trouvees':'aucune')+')');
  L.splice(ou[0],1,...bloc(genome,o));
  return L.join('\n');}

module.exports={BORNES,CONTINUS,TETES,genomeTemoin,tirerReseaux,muter,croiser,reparer,shaGenome,idDe,ecrirePilote,shaPilote,distance,distanceW2,valider,
  migrer,VERSION,
  /* le temoin (28/11, tache « portage ») : son nom (config "temoin"), son fichier ecrit a la main, la table des temoins possibles */
  nomTemoin,sourceTemoin,TEMOINS,TEMOIN_DEFAUT,
  /* outillage pour les tests */
  CARTES,ORDRE_VOLTIGE,EXTRAITS,MODELE,VOLTIGE,GESTES,CLES_V1,PORTAGE,CLES_V2,BLOCS,
  /* (28/11, lot « regles ») la table des gardes et l'urne des mutations d'un genome */
  GARDES,GARDE_DE,reelsLus,
  /* (28/11, lot « genes v4 ») les 8 genes v4, l'ordre de v:3, les noms des compteurs */
  GENES_V4,ORDRE_V4,CLES_V3,N_V3,DECLICS};

/* ===== LA LIGNE DE COMMANDE ===== */
function essaiReparer(n){
  const rng=mulberry32(20261127),T=genomeTemoin(),pop=[T];let fautes=0,premiere=null;
  for(let i=0;i<n;i++){
    const phase=['A','B','C'][rng.entier(3)],p1=pop[rng.entier(pop.length)];
    let g;
    if(rng.suivant()<.3)g=croiser(p1,pop[rng.entier(pop.length)],rng);else g=p1;
    g=muter(g,rng,{phase,genes:rng.suivant()<.2?1+rng.entier(64):undefined,sigma:rng.suivant()<.2?rng.suivant()*2:undefined}).genome;
    const d=valider(g);
    const g2=reparer(copier(g));
    if(d||shaGenome(g2)!==shaGenome(g)){fautes++;if(!premiere)premiere=d||'reparer non idempotent';}
    if(pop.length<30)pop.push(g);else pop[rng.entier(30)]=g;}
  return {n,fautes,premiere};}
if(require.main===module){
  const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
  try{
    if(A.includes('--temoin')){
      /* --nom c0101 : un autre temoin que celui de config.json (28/11, tache « portage ») */
      const T=genomeTemoin(Object.assign({},CFG0,{temoin:opt('nom',CFG0.temoin)}));
      const sortie=opt('ecrire',null);
      if(sortie){const t=ecrirePilote(T);C.ecrireAtomique(path.resolve(sortie),t);console.log('pilote temoin ecrit : '+sortie+' (genome '+idDe(T)+', pilote '+shaPilote(t).slice(0,12)+')');}
      else console.log(JSON.stringify(T));
      process.exit(0);}
    if(A.includes('--essai-reparer')){
      const r=essaiReparer(+opt('essai-reparer',10000)||10000);
      console.log((r.fautes?'ECHEC':'OK')+' : '+r.n+' mutations, '+r.fautes+' genome(s) hors bornes ou contraintes'+(r.premiere?' (premier : '+r.premiere+')':''));
      process.exit(r.fautes?1:0);}
    console.error('usage : node ml/evolution/genome.js --temoin [--nom c0101] [--ecrire sortie.js] | --essai-reparer 10000');process.exit(1);
  }catch(e){console.error(String(e&&e.message||e));process.exit(1);}
}
