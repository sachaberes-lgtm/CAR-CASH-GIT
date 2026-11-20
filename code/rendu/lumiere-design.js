/* ===== LE PLAN DE FEU (2026-11-10, Sacha : « mets-toi dans la peau d'un light designer senior […] le jeu magnifique, dans la même DA, sans que ce soit
   plus lourd sur téléphone ») =====
   La couche de LUMIÈRE, posée après l'équilibre des maps. Jugée sur le chemin de l'iPhone (banc outils/banc-lumiere/studio.py : la même image figée,
   plusieurs réglages côte à côte), pas sur l'ordinateur. Une seule idée, celle d'un plateau : L'ÉCHELLE DES CLARTÉS. La caisse est la vedette, les
   sources (phares, néons, tuyères, pièces) passent devant, la route est le SOL DE SCÈNE :
   · LA NUIT ET SOUS LA TERRE, le sol recule : béton plus sombre et refroidi en bleu nuit (c'était une dalle lavande claire, L* 47-67 — plus claire que
     tout le reste de l'image : la flaque des phares, les bords néon et la caisse s'y noyaient), contre-jour rose et liseré plus forts : la caisse se
     découpe en braise sur l'encre, les phares redeviennent une lumière ;
   · À MIDI au-dessus des nuages, le sol remonte (il sortait presque noir, L* 22-28, sur les pentes à l'ombre) ; le ciel photo et la mer de
     cumulus retrouvent l'azur (CIEL_ARC, chute-menu.js) et perdent la sarcelle des ombres (daSh).
   Que des valeurs d'ambiance (rtK, rtT, kickI, rimS, daSh) : zéro programme, zéro lecture de texture, zéro lumière de plus. `?lumiere=0` = l'image
   d'avant au bit près ; `dbgLumiere(nom,{…})` essaie une retouche à chaud. Champs : ceux de l'équilibre (expo, sat, con, rtK ×…) + `kick` (× kickI). */
const LUMIERE_ON=!/[?&]lumiere=0\b/.test(location.search);
const PLAN_FEU={
  nuagesMidiCC:{rtK:1.12,rimS:.5,daSh:.25}, /* daSh : la sarcelle des ombres verdissait le ciel photo et la mer de cumulus (voir CIEL_ARC, chute-menu.js) */
  nuagesMatinCC:{daSh:.25},
  canyonSoir:{rtK:.82,rtT:[.95,.97,1.05],kick:1.4,rimS:.6}, /* la gorge au couchant : le sol à l'ombre prend le bleu du ciel, complémentaire des parois rouges */
  jade:{rtK:.8,kick:1.4,rimS:.6},                            /* le soir de Jade : le béton un cran plus profond sous le ciel d'or */
  canyonNuit:{rtK:.62,rtT:[.86,.93,1.14],kick:1.5,rimS:.7},
  espaceMatin:{rtK:.62,rtT:[.86,.93,1.14],kick:1.5,rimS:.7},
  'grt-matin':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-midi':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-soir':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-nuit':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7},'grt-glace':{rtK:.62,rtT:[.92,.96,1.08],kick:1.5,rimS:.7}}; /* sous la terre, les cinq temps : la roche et les cristaux éclairent, pas la dalle */
function feuApplique(b,r){const k=r.kick;if(k!=null&&typeof b.kickI==='number')b.kickI=+(b.kickI*k).toFixed(3);const q={};for(const f in r)if(f!=='kick')q[f]=r[f];
  /* rtT (la teinte du béton) est POSÉE telle quelle : c'est la valeur jugée au studio */
  eqApplique(b,q);}
function feuPose(T){for(const k in T){const r=T[k];if(BIOMES[k])feuApplique(BIOMES[k],r);else if(/^grt-/.test(k))for(const n in BIOMES)if(n.indexOf(k+'-')===0)feuApplique(BIOMES[n],r);}}
if(LUMIERE_ON)feuPose(PLAN_FEU);
window.dbgLumiere=function(n,r){if(n&&r){const b=BIOMES[n];if(!b)return null;feuApplique(b,r);if(BIO.name===n||BIO.to===b){bioLerp(b,b,1,BIO.cur);bioApply(BIO.cur);}}return {on:LUMIERE_ON,plan:PLAN_FEU};};
/* ===== LA NUIT D'ARGENT 2 DES DUNES (2026-11-13, Sacha : « la map dune nuit est plutôt moche sur iPhone, retravaille les couleurs en restant optimisé ») =====
   Jugée au studio sur le chemin iPhone (portrait, pistegraine 777, mêmes images côte à côte). AVANT : tout dans UN bleu roi saturé (ciel chroma 85, dunes
   lointaines bleu glacier pailletées de blanc, route lavande) — la nuit des dunes se lisait comme le glacier. APRÈS, une nuit à deux températures :
   · le CIEL : marine au zénith → argent-acier à l'horizon (le même niveau de clarté, moitié moins de chroma) ;
   · le SABLE : beige sous la lune (dnA/dnB/dnL chauds), ombres bleues (dnS) — le complémentaire fait le relief ; paillettes d'OR au lieu de bleu-blanc ;
   · la LUNE argent neutre (sunC), le ciel de l'hémisphère moins bleu, le remplissage turquoise de la map adouci ;
   · la ROUTE en sol de scène graphite (rtK, rtT) : la caisse, les phares et les rails turquoise passent devant ; l'exposition remonte d'un cran (la moyenne
     de l'image reste celle d'avant : Sacha trouvait déjà les maps sombres).
   Valeurs POSÉES (celles du studio), après l'équilibre et le plan de feu. Que des valeurs d'ambiance : zéro programme, zéro texture, zéro lumière de plus.
   `?dunesnuit=0` = la nuit d'avant au bit près (DN_ARGENT, dunes-2.js : aussi la teinte du satin du sable). */
if(DN_ARGENT&&BIOMES.dunesNuit)Object.assign(BIOMES.dunesNuit,{
  cyZ:[.06,.085,.20],cyM:[.10,.13,.24],cyH:[.22,.24,.31],jZen:[.06,.085,.20],jMid:[.10,.13,.24],jHor:[.22,.24,.31],cyR:[.08,.085,.13],
  fog:[.12,.13,.19],fogCj:[.17,.18,.24],fogIn:[.16,.17,.23],
  hemiS:[.26,.30,.46],sunC:[.86,.84,.86],sunI:.75,fillC:[.24,.42,.48],
  dnA:[.46,.40,.34],dnB:[.36,.31,.27],dnL:[.80,.77,.72],dnS:[.56,.60,.80],dnH:[.10,.11,.16],dnP:[1,.82,.50,.35],
  rtK:.55,rtT:[1.06,1,.86],expo:1.04});
/* ===== LA NUIT DE JADE (2026-11-13, Sacha sur son iPhone : « la map Jade nuit est assez moche… couleurs ternes, mélangé au fait que la barrière de rendu est très grise ») =====
   Jugée sur le chemin iPhone (outils/banc-lumiere/parcours.py : 844 × 390 et 390 × 844, plusieurs endroits de la route, images figées). AVANT : une nuit
   d'UN SEUL gris-vert (zénith, horizon et brume entre .10 et .16 presque neutres) ; les pics lointains se fondaient dans une brume GRISE plus claire que le
   ciel derrière eux (la « barrière ») ; sous l'horizon l'abîme était multiplié par jdK.z = .32 (le réglage de l'ancien fleuve) : une bande pâle posée sur du
   NOIR ; la lune, un disque lavande codé en dur, sans lueur. APRÈS, une nuit à deux températures, aux couleurs du jade :
   · le CIEL : bleu de nuit au zénith → turquoise → JADE lumineux à l'horizon (jdZ/jdL/jdM/jdH) ;
   · la BRUME des pics en 3D = la teinte du bas du ciel (fog ≈ jdM ≈ jdB) : un pic qui s'efface s'efface DANS le ciel, plus de mur gris ;
   · l'ABÎME rendu (jdK.z .32 → .8) : la mer de nuages sous la lune, dans la teinte de la brume — plus de noir sous l'horizon (le fond à la couleur de la brume) ;
   · la LUNE ivoire doré et son halo (jdS ; scene-ciel.js), le complémentaire du jade : c'est elle qui fait chanter le vert ;
   · les LUMIÈRES : ciel d'hémisphère et remplissage jade, liseré émeraude, lune un cran plus forte — les pics reprennent leur vert ;
   · la ROUTE un cran plus profonde (rtK) : la caisse, ses feux et les rails verts passent devant.
   Que des valeurs d'ambiance + une ligne du ciel de Jade (même coût) : zéro programme, zéro texture, zéro appel de dessin en plus. Posé APRÈS l'équilibre
   et le plan de feu (valeurs finales, celles du banc). `?jadenuit=0` = la nuit d'avant au bit près. */
const JADE_NUIT2=!/[?&]jadenuit=0\b/.test(location.search);
if(JADE_NUIT2&&BIOMES.jadeNuit)Object.assign(BIOMES.jadeNuit,{
  jdZ:[.018,.052,.098],jdL:[.030,.086,.130],jdM:[.045,.135,.150],jdH:[.065,.19,.18],jdB:[.07,.19,.195],jdR:[.03,.09,.09],jdS:[1,.90,.68],jdK:[.9,0,.8,1],
  fog:[.047,.142,.148],fogCj:[.08,.22,.21],fogIn:[.06,.17,.17],volSky:[.06,.17,.18],volGnd:[.02,.06,.06],
  hemiS:[.14,.36,.40],hemiG:[.03,.09,.08],sunC:[.80,.90,.92],sunI:.75,fillC:[.16,.50,.44],kickC:[.30,.85,.65],
  env:[[0,'#04101c'],[.3,'#0a2630'],[.48,'#1c5a58'],[.58,'#3a8f80'],[.66,'#0e2a2c'],[1,'#04100f']],
  rtK:.78});
/* ===== LA FINITION DE JADE (2026-11-18, finition des maps : « des couleurs plus fun, plus franches, plus typées par ambiance ; la nuit bleue/violette ») =====
   Que des NOMBRES d'ambiance (ciel peint jdZ/jdL/jdM/jdH, abîme jdB, lointain jdR, brumes, lumières, env) posés en DERNIER, sur les six temps de Jade
   (niveaux.js : matin, midi, soir, nuit, pluie, orage). La famille de la marque : zénith azur saturé → horizon pêche le jour, corail·magenta·or au soir,
   indigo·violet et clair de lune la nuit, le vert jade (#4FE0A8) gardé en accent (le bas du ciel, le liseré). Zéro programme, texture ou appel de dessin de plus.
   `?sans=jadefini` = les valeurs d'avant (et l'astre d'avant, scene-ciel.js). */
const JADE_FINI=!/[?&]sans=([^&]*,)?jadefini(,|&|$)/.test(location.search);
if(JADE_FINI&&BIOMES.jadeNuit){
  Object.assign(BIOMES.jade,{ /* SOIR : le zénith bleu-violet, une bande rose (au banc : un mauve .80,.52,.74 faisait un aplat lilas, un rose .94,.58,.64 sous la saturation du soir 1,2 virait au fluo), le corail puis l'or à l'horizon (il était gris-beige au milieu).
    (contrôle, tour 1 : le soleil vermillon se perdait dans la bande rose) la bande rose tire un cran vers le rose de la marque (.92,.64,.64 → .90,.62,.70) et le milieu passe du corail à la pêche dorée (1,.62,.50 → 1,.70,.48) : le disque rouge se découpe sur du chaud clair.
    (contrôle du 19/11 : le haut tirait au rose-magenta fluo, rouge-orange vif du tiers haut 37 → 42 %, chroma 100-115 → 145) la bande rose rabattue vers le lilas-pêche (.90,.62,.70 → .84,.64,.76), le zénith un cran plus bleu (.36,.38,.64 → .34,.40,.68), l'horizon plus doré (1,.76,.46 → 1,.80,.52).
    (correction 2 du 19/11 : le haut restait un dégradé violet → rose vif → orange « synthwave », chroma 114-121) la bande vers le pêche-lilas (.84,.64,.76 → .86,.70,.76), le zénith un cran plus clair et doux (.34,.40,.68 → .40,.46,.70)
    (correction 3 du 20/11 : le rouge-orange vif MONTAIT encore, haut et milieu, chroma du haut 113 ; la brume et l'abîme étaient passés au saumon) trois jeux mesurés
    au banc en un passage (outils/banc-finition-jade/essais.cjs), gardé le plus calme : zénith bleu .44,.52,.72, bande LILAS .74,.74,.84 (plus de rose), milieu et
    horizon pêche-or plus clairs (1,.72,.54 ; 1,.84,.62), abîme et brumes rendus au beige-lilas (jdB .86,.82,.80, fog .80,.76,.72, fogIn .86,.82,.78,
    fogCj .94,.74,.58), lointain .38,.38,.50, soleil d'avant 1,.72,.44 : rouge vif du haut et du milieu SOUS celui d'avant sur g3, g5, g17 et g11 debout */
    jdZ:[.44,.52,.72],jdL:[.74,.74,.84],jdM:[1,.72,.54],jdH:[1,.84,.62],jdB:[.86,.82,.80],jdR:[.38,.38,.50],jdS:[1,.72,.44],
    fog:[.80,.76,.72],fogIn:[.86,.82,.78],fogCj:[.94,.74,.58]});
  Object.assign(BIOMES.jadeMatin,{ /* MATIN : azur plus franc, le céladon du milieu passe au vert jade-menthe, l'horizon pêche-rose ; brume pêche.
    (contrôle, tour 1 : « presque invisible ») poussé : saturation × 1,08 (sur celle de l'étalonnage et de l'équilibre), la menthe plus franche (.62,.88,.76 → .56,.90,.76 ; .48,.92,.74 virait à l'acide au banc), l'horizon plus rose (1,.76,.62 → 1,.70,.60 ; contrôle du 19/11 : il tirait au saumon, remonté à 1,.76,.62 ;
    correction 3 du 20/11 : le rouge du milieu restait 2 points au-dessus d'avant) l'horizon or-pêche 1,.80,.64, la brume pêche-crème .86,.82,.74 / .92,.88,.80 */
    sat:+((BIOMES.jadeMatin.sat||1)*1.08).toFixed(3),jdZ:[.16,.44,.90],jdL:[.40,.70,.90],jdM:[.56,.90,.76],jdH:[1,.80,.64],jdB:[.82,.90,.84],
    fog:[.86,.82,.74],fogIn:[.92,.88,.80]});
  Object.assign(BIOMES.jadeMidi,{ /* MIDI : cobalt au zénith, jade au milieu, crème-pêche à l'horizon ; brume bleu ciel.
    (contrôle, tour 1 : « presque invisible ») poussé : la saturation × 1,07 (l'équilibre l'avait rabattue de × 0,93), le jade du milieu plus franc (.52,.88,.80 → .48,.88,.78 ; .40,.90,.76 virait à l'acide au banc), l'horizon or-pêche (1,.86,.68 → 1,.84,.60 ;
    correction 3 du 20/11 : rouge du milieu +3,6 à +5 points sur avant → .98,.86,.66, crème dorée) */
    sat:+((BIOMES.jadeMidi.sat||1)*1.07).toFixed(3),jdZ:[.08,.38,.90],jdL:[.32,.70,.92],jdM:[.48,.88,.78],jdH:[.98,.86,.66],
    fog:[.62,.80,.86],fogIn:[.78,.90,.92]});
  Object.assign(BIOMES.jadeNuit,{ /* NUIT (contrôle, tour 1 : le zénith en bleu roi pur tirait à l'électrique : .040,.030,.110 → .062,.034,.098, la bande .062,.056,.175 → .072,.050,.150 : un cran de rouge, l'indigo-violet au lieu du bleu roi) : indigo-violet au zénith, bleu au milieu, la lueur jade gardée au ras de l'horizon ; brume indigo (plus de bleu-vert gris) ; lune or pâle.
    (contrôle du 19/11 : le vert jade mourait, 30 → 6-12 % au milieu de l'image, et l'image s'assombrissait ; Sacha veut « plus de bleu, plus de vert ») le zénith indigo-violet reste, le bas redevient bleu-JADE et plus clair :
    jdM .060,.112,.200 → .050,.135,.180, jdB .065,.120,.190 → .060,.160,.185, brume .050,.100,.170 → .045,.130,.160, fogIn .07,.12,.20 → .06,.15,.18, volSky .06,.10,.20 → .06,.14,.18,
    ciel de l'hémisphère .16,.26,.46 → .14,.32,.44, appoint .22,.36,.60 → .20,.40,.56, reflet du milieu '#243e6a' → '#1e5262'.
    (correction 2 du 19/11 : encore trop peu, le vert du milieu à 6-15 % au lieu de 34, la route et le sol en bleu marine) seul le CIEL du haut reste au lot
    (jdZ, jdL indigo-violet, la lune jdS) ; tout ce qui éclaire le sol et l'horizon reprend la nuit jade (JADE_NUIT2 plus haut) : jdM, jdH, jdB, jdR,
    les brumes, l'hémisphère, l'appoint et le reflet. Ici on ne fait donc que le ciel.
    (correction 3 du 20/11 : ce zénith indigo rendait le haut PLUS SOMBRE qu'avant, L 17 → 10 debout) trois ciels mesurés au banc, gardé le BLEU-JADE :
    zénith bleu nuit .040,.070,.150, bande bleu-sarcelle .040,.120,.170 : le haut plus clair et plus coloré qu'avant, le sol et l'horizon jade inchangés */
    jdZ:[.040,.070,.150],jdL:[.040,.120,.170],jdS:[1,.88,.62]});
  Object.assign(BIOMES.jadePluie,{ /* PLUIE : ardoise BLEUE au zénith, jade mouillé à l'horizon (il était gris-vert) ; un cran de saturation.
    (contrôle, tour 1 : « presque invisible ») poussé : saturation 1,14 → 1,16, le zénith plus bleu (.20,.30,.42 → .17,.28,.48), le jade du milieu plus franc (.36,.58,.54 → .32,.58,.56 ; 1,20 et .30,.62,.56 faisaient un beau temps turquoise au banc ;
    correction 3 du 20/11 : le haut avait perdu son vert pour un azur plus clair que le midi) zénith ardoise-JADE .14,.28,.27, bande .20,.40,.38 : vert jade
    au haut de l'image (V 92-100 %), plus sombre que le midi, plus coloré qu'avant (le conseil .16,.30,.42 aurait gardé l'azur : teinte 208°) */
    sat:1.16,jdZ:[.14,.28,.27],jdL:[.20,.40,.38],jdM:[.32,.58,.56],jdH:[.54,.68,.62],jdB:[.38,.52,.52],jdR:[.20,.30,.32],
    fog:[.38,.50,.52],fogCj:[.48,.58,.62],fogIn:[.50,.62,.62],volSky:[.38,.50,.54]});
  Object.assign(BIOMES.jadeOrage,{ /* ORAGE : ardoise VIOLETTE au zénith, horizon bleu-vert (il était gris).
    (contrôle, tour 1 : devenu une seconde NUIT, ciel indigo S 184 V 115) rabattu vers l'ardoise : zénith .12,.10,.20 → .10,.09,.14, bande .14,.15,.24 → .13,.14,.19,
    milieu .16,.22,.28 → .16,.21,.24, brume .20,.24,.32 → .17,.20,.25, ciel du dessus .34,.38,.54 → .30,.33,.42 ; l'horizon bleu-vert garde l'orage à part de la nuit indigo */
    jdZ:[.10,.09,.14],jdL:[.13,.14,.19],jdM:[.16,.21,.24],jdH:[.22,.32,.34],jdB:[.22,.28,.32],
    fog:[.17,.20,.25],fogCj:[.22,.24,.30],fogIn:[.21,.24,.29],hemiS:[.30,.33,.42]});
}
/* (2026-11-17, LE RENDU FINAL DU CANYON : CY_LOOKS dans maps/canyon-relief.js) les retouches d'ambiance de la piste choisie, posées en DERNIER (après l'équilibre des maps et le plan de feu) ; sans piste : rien */
if(CY_LOOK&&CY_LOOK.bio)for(const k in CY_LOOK.bio)if(BIOMES[k])eqApplique(BIOMES[k],CY_LOOK.bio[k]);
