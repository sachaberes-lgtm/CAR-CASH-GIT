/* ================= LE MOTEUR VIVANT — synthèse par ÉVÉNEMENTS (2026-10-22, session SON : « un moteur plaisant, qui fait tilter les kiffeurs d'auto ») =================
   POURQUOI UN SECOND MOTEUR. `voix-moteur.js` fait chanter des oscillateurs dont on glisse la hauteur : c'est un SYNTHÉ qui monte. Un vrai moteur
   n'émet pas une note, il émet des COUPS — un par explosion — qui entrent dans un TUYAU, et c'est le tuyau qui chante. Tout ce que les passionnés
   reconnaissent (le gargouillis d'un V8 au ralenti, la plainte qui passe en travers de la résonance, le « bap-bap » du limiteur, le crépitement au
   lâcher, le talonnage d'un rétrogradage, le cliquetis d'un moteur maltraité, les dernières toux d'un calage) sort de CETTE mécanique-là et d'aucune
   autre. Ici on la joue à l'échantillon près : pas un oscillateur de hauteur dans tout le fichier (le démarreur seul en a un : c'est un moteur électrique).

   LA CHAÎNE (une voix, ~150 opérations par échantillon, rien d'alloué en route) :
     manivelle (phase du cycle de 720°) → ORDRE D'ALLUMAGE : à chaque cran de cylindre, un COUP part dans la bancade du cylindre
       → un coup = une impulsion de pression (décroissance exp.) + une rafale de bruit (la détonation : la « râpe ») + un CLAC sec direct (l'attaque
         qui sort du pot sans passer par le tuyau) ; amplitude = charge × hasard de cylindre
       → CONDUIT D'ÉCHAPPEMENT par bancade : ligne à retard bouclée (réflexion NÉGATIVE : bout ouvert, quart d'onde) + amortissement + 2e étage (silencieux)
         ⚠ sa résonance est FIXE (elle ne suit pas le régime) : le régime ne fait que faire PASSER les harmoniques du coup devant ses crêtes — c'est
         le « wah » qui rend un échappement vivant, et c'est la leçon de la prise de WRX du jeu (voix-moteur.js : « un pic planté au même endroit »)
       → deux bancades = deux conduits de longueurs presque égales, une dans chaque oreille : le V8 croisé GARGOUILLE parce que chaque bancade reçoit
         ses coups par paquets inégaux (écarts 270°/180°/90°/180° pour la A, l'inverse pour la B) — dans une seule oreille on entendrait un moteur
         régulier, c'est la stéréo qui fait entendre le trou.
     + ADMISSION : bruit coloré par un résonateur de Helmholtz (rugissement d'induction, né sous charge, haut régime), haché au rythme des soupapes
     + MÉCANIQUE : tic des culbuteurs (dans l'ordre d'allumage), claquement de la distribution quand on s'use
     + TURBO (si la fiche en a un) : le sifflet qui monte avec la pression, le soupir de la soupape au lâcher et le « flutter »
     + CARTER : la gorge fixe du bloc (+4 dB à ~95 Hz) et une saturation douce qui devient hargne sous charge.

   LES ÂGES D'UN MOTEUR (`health` 1 → 0, `describeEtat(h)`), du neuf à la mort — chaque étage a son vocabulaire :
     1,00–0,80  RODÉ       : régulier, rond, un gargouillis net au ralenti, rien ne claque
     0,80–0,55  FATIGUÉ    : culbuteurs qui tictaquent, ralenti qui tangue, un cylindre fait la tête de temps en temps (« raté » rare)
     0,55–0,30  MALTRAITÉ  : RATÉS fréquents (un coup manque : le battement du V8 se troue), CLIQUETIS (auto-allumage : tintement aigu sous charge),
                             COUP DE BIELLE (un « toc » mat à chaque tour, surtout bas régime), toux d'admission
     0,30–0,00  AGONIE     : cylindres morts un à un (jusqu'à 2 pistons), pompage du régime (« il cherche »), raclement métallique, puissance divisée
     CALAGE     : `calage()` — le régime s'effondre, les compressions gagnent contre l'inertie (les derniers coups s'espacent en « tonc… tonc… »),
                  puis le silence et le tic-tic du métal qui refroidit. `demarre()` : le démarreur, le pignon qui s'engage, les compressions SANS
                  allumage (« ru-ru-ru »), le moteur qui prend en toussant, le flash vers 1 500 tr/min, le ralenti qui s'installe en cherchant.
                  `coup(f)` : un choc sur la carrosserie — la tôle claque, le moteur bute (une grappe de ratés).

   CE QUI FAIT « TILTER » (la liste de contrôle du designer, chaque point a son bouton dans `CFG`) :
     1 le gargouillis du ralenti (lope) · 2 la râpe de l'harmonique 2 en charge (bruit de détonation) · 3 la plainte qui passe à travers la résonance du pot
     · 4 le limiteur qui REBONDIT (coupure d'allumage 50-80 ms, chaque reprise claque) · 5 le crépitement au lâcher (rafales de pops dans le tuyau,
     d'abord denses, qui s'égrènent) · 6 le talonnage (la montée de régime au rétrogradage, suivie d'un pop) · 7 le souffle d'admission sous charge
     · 8 la coupure nette à la montée de rapport · 9 le démarrage qui prend. Un seul de ces points ne fait rien ; les neuf ensemble font « un vrai ».

   PUR : aucune référence à `window`, au DOM ou à un nœud audio. Rend du Float32 : un banc Node l'écoute en WAV, un AudioWorklet le joue en direct (mêmes octets).
   SORTIE : stéréo [L,R]. L'hôte écrit `rpmCmd` (tr/min voulus), `thr` (pédale 0..1), `load` (charge 0..1), `health` (1..0) ; il lit `rpm`, `etat`. */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- un biquad (forme transposée II) : les formules du « Audio EQ Cookbook » ---------- */
  function Bq() { this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0; this.z1 = 0; this.z2 = 0; }
  Bq.prototype.set = function (type, f, q, gDb, sr) {
    f = clamp(f, 10, sr * .45); q = Math.max(.1, q);
    const w = TAU * f / sr, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'ls' || type === 'hs') { /* étagères (pente fixe S=1) */
      const A = Math.pow(10, (gDb || 0) / 40), be = 2 * Math.sqrt(A) * s / Math.SQRT2 * 1; /* 2√A·α avec α = sin(w)/2·√2 */
      if (type === 'ls') { b0 = A * ((A + 1) - (A - 1) * c + be); b1 = 2 * A * ((A - 1) - (A + 1) * c); b2 = A * ((A + 1) - (A - 1) * c - be); a0 = (A + 1) + (A - 1) * c + be; a1 = -2 * ((A - 1) + (A + 1) * c); a2 = (A + 1) + (A - 1) * c - be; }
      else { b0 = A * ((A + 1) + (A - 1) * c + be); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - be); a0 = (A + 1) - (A - 1) * c + be; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - be; }
    }
    else { const A = Math.pow(10, (gDb || 0) / 40); b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; } /* peaking */
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  };
  Bq.prototype.p = function (x) {
    const y = this.b0 * x + this.z1; this.z1 = this.b1 * x - this.a1 * y + this.z2; this.z2 = this.b2 * x - this.a2 * y; return y;
  };

  /* ---------- LES FICHES MOTEUR ----------
     slot[] : la BANCADE (0/1) de chaque coup, DANS L'ORDRE D'ALLUMAGE (un cycle = 720° = autant de crans que de cylindres).
     pipe   : longueurs de conduit des deux bancades (m) — presque égales = le battement d'un double échappement.
     r/damp : réflexion du bout ouvert (négative : quart d'onde) et amortissement (0 = aucun · .6 = très mat).
     form   : la GORGE du carter/pot — pic FIXE [Hz, Q, dB] (prise de WRX : +4 dB à 95 Hz, planté au même endroit à tous les régimes).
     lope   : le gargouillis (hasard de cylindre au ralenti) · rasp : la détonation (bruit par coup) · tau : durée du coup (s).
     turbo  : { spool, whine } si la fiche en a un.  hp : coupe-bas (Hz) — le jeu le monte sur téléphone. */
  /* LES VALEURS PAR DÉFAUT d'une fiche (tout ce que le labo règle et que la fiche ne dit pas) */
  /* (2026-11-09, « CHALEUR DE NOËL ») les boutons de la douceur — tous NEUTRES par défaut (les trois fiches d'origine sonnent au bit près) :
       warm   0..1  adoucit la détonation et le clac direct (moins de râpe, plus de rondeur) · breath 0..1  le moteur RESPIRE : un hasard lent (0,4-1,5 s) sur la
       charge de chaque coup, pour que l'oreille ne trouve jamais deux secondes pareilles · lopeSm  lissage du gargouillis (plus bas = plus lent, plus ronronnant)
       popSoft  allonge les pops (1 = sec, 2-3 = « bûche qui éclate ») · popLvl  leur niveau · ember / emberRate  les BRAISES : petits crépitements ronds
       sous le moteur, par vagues (un feu a des respirations) · outLP  dernier passe-bas (Hz) — le velours : rien d'aigu ne sort jamais */
  const DEF = { pitch: .72, sat: 1.05, satLoad: .9, form2: [210, 1.1, 2.2], tickF: 3300, muff: .26, clac: .00055, dryF: 1100, knockF: 6200, noiseMix: .7, whoosh: 1,
    warm: 0, breath: 0, lopeSm: .40, popSoft: 1, popLvl: 1, ember: 0, emberRate: 14, outLP: 0,
    /* (2026-11-09, « BÛCHE AFFINÉE ») emberF/emberSpan/emberLen : où et combien de temps claque une braise (défauts = avant) · wander : la gorge du bloc dérive de ±7 % très lentement ·
       swell : dB gagnés par la gorge quand on appuie (la voix « s'ouvre ») · cyber 0..1 : la touche JEU VIDÉO (halo, notes de marche, coup de poing au gaz, bloop au lâcher) ;
       cyHalo/cyPluck/cyThump : leurs niveaux ; l'hôte écrit `cleHz` = la tonique du morceau en cours (tonique, quinte, octave : justes dans TOUS les modes) */
    emberF: 650, emberSpan: 2400, emberLen: 1, wander: 0, swell: 0, cyber: 0, cyHalo: .02, cyPluck: .05, cyThump: .07 };
  const CFG = {
    /* V8 CROISÉ « américain » : A B B A B A A B (ordre 1-8-4-3-6-5-7-2) — la bancade A tire à 270/180/90/180°, la B l'inverse. LE gargouillis. */
    v8: { nom: 'V8 CROISÉ ATMO', n: 8, slot: [0, 1, 1, 0, 1, 0, 0, 1], idle: 760, limit: 6900, redline: 6500,
      pipe: [1.02, 1.11], r: -.58, damp: .40, form: [96, 1.5, 4.2], bodyLP: 3200, hp: 34, eq: [['ls', 110, 0, -4], ['hs', 1400, 0, -9]],
      lope: .75, rasp: .6, tau: .0009, popRate: .55, ticks: 1, intake: .22, pan: .62, cutMs: [58, 84] },
    /* PLAT PLANE / haute rotation (type « 458 ») : coups réguliers, aigu, déchirant. */
    flat: { nom: 'V8 PLAT-PLAN AIGU', n: 8, slot: [0, 1, 0, 1, 0, 1, 0, 1], idle: 900, limit: 9100, redline: 8800,
      pipe: [.74, .78], r: -.66, damp: .32, form: [128, 1.7, 3.6], bodyLP: 4400, hp: 40, eq: [['ls', 120, 0, -4], ['hs', 1800, 0, -5]],
      lope: .20, rasp: .80, tau: .0007, popRate: .30, ticks: 1, intake: .45, pan: .40, cutMs: [44, 60] },
    /* 6 EN LIGNE TURBO : doux, soyeux ; le sifflet du turbo, le soupir au lâcher. */
    l6: { nom: '6 EN LIGNE TURBO', n: 6, slot: [0, 1, 0, 1, 0, 1], idle: 740, limit: 7300, redline: 7000,
      pipe: [1.18, 1.22], r: -.55, damp: .42, form: [86, 1.4, 3.6], bodyLP: 3400, hp: 34, eq: [['ls', 110, 0, -4], ['hs', 1400, 0, -5]],
      lope: .24, rasp: .60, tau: .0010, popRate: .34, ticks: .7, intake: .30, pan: .22, cutMs: [60, 84], turbo: { spool: .55, whine: 1 } },

    /* ===== LES CINQ DE NOËL (2026-11-09 — Sacha : « chaud, agréable, réconfortant, ASMR ; pas de répétition dans la tête ; au coin du feu sous la couette ») =====
       Recette commune : régime bas (ralenti < 830, rupteur < 7 000 : ça ronronne, ça ne hurle pas), conduit MAT (damp .5-.6 : l'échappement s'arrondit),
       détonation adoucie (warm), clac et tic presque absents, pops longs et ronds (popSoft), respiration lente (breath), passe-bas final = le velours.
       Ce qui les distingue : le nombre de cylindres et l'ordre d'allumage (donc la façon de gargouiller), la longueur des tuyaux (donc la voix), les braises. */
    /* 1 · BÛCHE v1 (le premier jet, gardé pour comparer) */
    /* — le V8 croisé au ralenti lent, gras, gargouillant doucement ; quelques braises sous le moteur. LE grand ronron américain, sans la colère. */
    buche1: { nom: 'BÛCHE v1', n: 8, slot: [0, 1, 1, 0, 1, 0, 0, 1], idle: 700, limit: 6000, redline: 5600,
      pipe: [1.16, 1.27], r: -.52, damp: .56, form: [80, 1.4, 5.5], bodyLP: 1800, hp: 30, eq: [['ls', 100, 0, 3], ['hs', 1100, 0, -10]],
      lope: .95, lopeSm: .11, rasp: .22, tau: .0013, clac: .0010, popRate: .26, popSoft: 2.3, popLvl: .38, ticks: .12, intake: .12, pan: .7, cutMs: [90, 130],
      sat: .8, satLoad: .5, warm: 1, breath: .85, ember: .30, emberRate: 10, outLP: 2300 },
    /* 1 · BÛCHE AFFINÉE (Sacha : « on garde la bûche… une petite touche cyber, jeux vidéo, de la satisfaction ; harmoniser avec la route, les roues, la musique »)
       CALAGE SPECTRAL — mesuré sur les 10 morceaux de course : la musique est creuse vers 200-250 Hz et 1-1,25 kHz, dense à 60-125 Hz (kick + basse) et 315-800 Hz.
       La v1 débordait dans le grave de la musique (63 Hz : +5 dB, 160 Hz : +10 dB au-dessus de sa forme) → la gorge passe de 80 à 170 Hz (le « creux » 160-250), le coupe-bas
       de 30 à 78 Hz, plus d'étagère à 100 Hz : le moteur parle là où la musique laisse de la place, et le kick garde son grave.
       SATISFACTION (la « triche ») : la gorge s'OUVRE de 2,5 dB quand on appuie (swell) et dérive de ±7 % (wander) ; `cyber` : un halo tonique/quinte/octave du morceau qui monte par
       marches avec le régime, une note qui tinte à chaque marche franchie, un coup de poing grave quand on écrase le gaz, un bloop (quinte qui retombe) au lâcher.
       BRAISES : plus rares, plus graves (380-1 280 Hz), plus longues — un grain de feu, plus un claquement. Pops à 0,26. */
    buche: { nom: 'BÛCHE · V8 rond, affinée', n: 8, slot: [0, 1, 1, 0, 1, 0, 0, 1], idle: 700, limit: 6000, redline: 5600, pitch: .80,
      pipe: [1.16, 1.27], r: -.52, damp: .56, form: [175, 1.0, 3.6], form2: [430, .9, 2.4], bodyLP: 2000, hp: 78, eq: [['hs', 1100, 0, -9]],
      lope: .95, lopeSm: .11, rasp: .22, tau: .0013, clac: .0010, popRate: .26, popSoft: 2.5, popLvl: .26, ticks: .12, intake: .12, pan: .7, cutMs: [90, 130],
      sat: .8, satLoad: .5, warm: 1, breath: .85, wander: 1, swell: 2.5, ember: .15, emberRate: 8, emberF: 380, emberSpan: 900, emberLen: 1.8, outLP: 2300,
      cyber: 1, cyHalo: .02, cyPluck: .05, cyThump: .07 },
    /* 2 · TISANE — le 6 en ligne de velours : régulier, soyeux, un souffle d'admission à peine ; ni braises ni turbo (rien qui sifflerait). Le plus calme des cinq. */
    tisane: { nom: 'TISANE · 6 en ligne soyeux', n: 6, slot: [0, 1, 0, 1, 0, 1], idle: 640, limit: 6200, redline: 5800,
      pipe: [1.30, 1.35], r: -.5, damp: .60, form: [74, 1.3, 5], bodyLP: 1500, hp: 30, eq: [['ls', 96, 0, 3.5], ['hs', 1000, 0, -10]],
      lope: .30, lopeSm: .14, rasp: .12, tau: .0014, clac: .0011, popRate: .12, popSoft: 2.6, popLvl: .30, ticks: .06, intake: .10, pan: .25, cutMs: [100, 140],
      sat: .75, satLoad: .4, warm: 1, breath: .6, ember: 0, outLP: 2000 },
    /* 3 · BRAISE — le V8 qui crépite : les braises montent à plein, les pops sont des petites bûches qui éclatent. Le plus « cheminée » des cinq. */
    braise: { nom: 'BRAISE · V8 et crépitements', n: 8, slot: [0, 1, 1, 0, 1, 0, 0, 1], idle: 720, limit: 6000, redline: 5600,
      pipe: [1.12, 1.24], r: -.54, damp: .54, form: [84, 1.4, 5], bodyLP: 2000, hp: 30, eq: [['ls', 100, 0, 2.5], ['hs', 1200, 0, -9]],
      lope: .80, lopeSm: .13, rasp: .26, tau: .0012, clac: .0009, popRate: .55, popSoft: 2.0, popLvl: .42, ticks: .14, intake: .12, pan: .72, cutMs: [80, 120],
      sat: .85, satLoad: .5, warm: 1, breath: .9, ember: .80, emberRate: 24, outLP: 2600 },
    /* 4 · CHOCOLAT — le plat-plan adouci : plus clair, plus chantant que les autres, mais velouté (le « chocolat chaud » : doux ET un peu vif). */
    chocolat: { nom: 'CHOCOLAT · V8 plat-plan velours', n: 8, slot: [0, 1, 0, 1, 0, 1, 0, 1], idle: 800, limit: 7000, redline: 6600,
      pipe: [.86, .91], r: -.58, damp: .48, form: [104, 1.5, 4.5], bodyLP: 2600, hp: 34, eq: [['ls', 112, 0, 3], ['hs', 1800, 0, -7]],
      lope: .22, lopeSm: .2, rasp: .30, tau: .0010, clac: .0008, popRate: .22, popSoft: 1.8, popLvl: .34, ticks: .1, intake: .2, pan: .45, cutMs: [70, 100],
      sat: .85, satLoad: .55, warm: .85, breath: .7, ember: .14, emberRate: 8, outLP: 3000 },
    /* 5 · VEILLÉE — le 4 à plat (boxer) : les coups tombent PAR DEUX (bancade A, A, B, B) = le « bobobo-bobobo » d'un chat qui ronronne sur les genoux. */
    veillee: { nom: 'VEILLÉE · 4 à plat ronron', n: 4, slot: [0, 0, 1, 1], idle: 820, limit: 6400, redline: 6000,
      pipe: [.86, 1.22], r: -.55, damp: .55, form: [92, 1.6, 5], bodyLP: 1900, hp: 32, eq: [['ls', 104, 0, 3], ['hs', 1100, 0, -9]],
      lope: .60, lopeSm: .15, rasp: .20, tau: .0014, clac: .0010, popRate: .30, popSoft: 2.2, popLvl: .36, ticks: .1, intake: .14, pan: .8, cutMs: [90, 130],
      sat: .8, satLoad: .5, warm: 1, breath: 1, ember: .45, emberRate: 14, outLP: 2300 }
  };

  function describeEtat(h) {
    return h > .80 ? 'RODÉ' : h > .55 ? 'FATIGUÉ' : h > .30 ? 'MALTRAITÉ' : h > .001 ? 'AGONIE' : 'MORT';
  }

  function MoteurVivant(cfg, sr, seed) {
    /* la fiche est COPIÉE : le labo la règle en direct (`applyCfg` après chaque retouche des longueurs de tuyau, des filtres) sans toucher la table */
    const base = typeof cfg === 'string' ? CFG[cfg] : (cfg || CFG.v8);
    this.cfg = JSON.parse(JSON.stringify(Object.assign({}, DEF, base)));
    const C = this.cfg; this.sr = sr = sr || 48000;
    let s = (seed || 1234567) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; /* xorshift32 : le même rendu à chaque fois (A/B) */
    this.g = function () { return this.rnd() * 2 - 1; };
    /* ---- ce que l'hôte écrit ---- */
    this.rpmCmd = 0; this.thr = 0; this.load = 0; this.health = 1;
    /* ---- ce que l'hôte lit ---- */
    this.rpm = 0; this.rpmEff = 0; this.etat = 'off';       /* off · crank · pause · catch · run · stall */
    /* ---- la manivelle ---- */
    this.u = 0; this.slotIdx = 0;
    this.cutOn = false; this.cutT = 0;
    this.lopeV = new Float32Array(C.n);   /* hasard lent de chaque cylindre (le gargouillis) */
    this.dead = new Uint8Array(C.n);      /* cylindres morts (agonie) */
    /* ---- les impulsions des deux bancades : pression (P), bruit (N), clac direct (D) ---- */
    this.eP = [0, 0]; this.eN = [0, 0]; this.eD = [0, 0]; this.dP = [0, 0]; this.dN = [0, 0];
    this.buf = [null, null]; this.buf2 = [null, null]; this.bi = [0, 0]; this.lpv = [0, 0]; this.bi2 = [0, 0]; this.lpv2 = [0, 0]; this.lpOut = [0, 0];
    /* ---- l'admission, la mécanique, les défauts ---- */
    this.inF = new Bq(); this.inF2 = new Bq(); this.eI = 0;
    this.tkF = new Bq(); this.eT = 0;
    this.knF = new Bq(); this.knF2 = new Bq(); this.eK = 0;    /* cliquetis */
    this.rbF = new Bq(); this.eB = 0;                                                                              /* coup de bielle */
    this.grF = new Bq(); this.grF2 = new Bq();                /* raclement */
    this.fm = [new Bq(), new Bq()]; this.fm2 = [new Bq(), new Bq()]; this.bodyL = [new Bq(), new Bq()]; this.bodyH = [new Bq(), new Bq()]; this.eqs = [[], []]; this.dryF = [new Bq(), new Bq()];
    /* ---- les extras : démarreur, choc de tôle, pops, tic de refroidissement, turbo ---- */
    this.stPh = 0; this.stA = 0; this.stF = 70; this.stF1 = new Bq();
    this.cl = { e: 0, e2: 0, f1: new Bq(), f2: new Bq() };
    this.popQ = []; this.popT = 0;
    this.tink = { e: 0, f: new Bq() };
    this.missBoost = 0;                    /* grappe de ratés laissée par un choc (décroît) */
    this.huntPh = 0;
    this.stallT = 0; this.crankT = 0; this.catchT = 0; this.catchP = 0; this.pauseT = 0; this.failN = 0;
    this.ctrlN = 0; this.fmJit = 0; this.fmJitT = 0;
    this.coughQ = 0;                      /* toux d'admission en attente */
    this.tT = 0;
    this.liftAge = 0; this.thrHi = 0; this.wasLift = false; this.popBudget = 0; this.cutG = 1; this.tinkLeft = 0; this.tinkSch = 0;
    this.boost = 0; this.tbPh = 0; this.tbF = new Bq(); this.bovE = 0; this.bovF = new Bq(); this.fluE = 0; this.fluPh = 0;
    this.gh = 0;                           /* gain d'admission lu par la boucle audio */
    this.G = { pipe: 1, dry: 1, intake: 1, tick: 1, knock: 1, rod: 1, grind: 1, starter: 1, clank: 1, tink: 1, turbo: 1 }; /* gains par couche (banc : stems, équilibre) */
    this.oo = new Float64Array(2); this.dd = new Float64Array(2);
    /* la chaleur : respiration lente (br), souffle du feu (fl), braises (emE : enveloppe, emD : décroissance, emF : filtre), velours final (outLp) */
    this.br = 0; this.brT = 0; this.brTg = 0; this.fl = .5; this.flT = 0; this.flTg = .5;
    this.emE = [0, 0]; this.emD = [.99, .99]; this.emF = [new Bq(), new Bq()]; this.outLp = [new Bq(), new Bq()];
    this.loadS = 0; this.lowT = -9; this.punched = false; this.cleHz = 220; this.cyIdx = 0; this.cyF = 220; this.cyG = 0; this.cyPh = [0, 0, 0, 0, 0, 0];
    this.cyLP = [new Bq().set('lp', 1500, .6, 0, sr), new Bq().set('lp', 1500, .6, 0, sr)];
    this.cyV = []; for (let k = 0; k < 4; k++) this.cyV.push({ e: 0, d: .9995, ph: 0, f: 440, df: 1, a: 0 });
    this.thump = { e: 0, t: 0, ph: 0 };
    this.rmsAcc = null;                    /* banc : { couche: somme des carrés } */
    this.applyCfg();
  }

  const P = MoteurVivant.prototype;

  /* (RE)CONSTRUIT tout ce qui dépend de la fiche : longueurs de tuyau, filtres du corps, gorge, étagères. Idempotent ; l'état des lignes à retard est gardé
     tant que leur taille ne change pas (un curseur de longueur ne claque donc pas). Appelé à la construction et par le labo à chaque retouche. */
  P.applyCfg = function () {
    const C = this.cfg, sr = this.sr;
    this.dD = Math.exp(-1 / (sr * (C.clac || .00055)));
    this.D = [0, 1].map(i => Math.max(8, Math.round(2 * C.pipe[i] * sr / 343)));
    this.D2 = [0, 1].map(i => Math.max(6, Math.round(2 * ((C.muff || .26) + i * .03) * sr / 343)));
    for (let b = 0; b < 2; b++) {
      if (!this.buf[b] || this.buf[b].length !== this.D[b] + 2) { this.buf[b] = new Float32Array(this.D[b] + 2); this.bi[b] = 0; }
      if (!this.buf2[b] || this.buf2[b].length !== this.D2[b] + 2) { this.buf2[b] = new Float32Array(this.D2[b] + 2); this.bi2[b] = 0; }
      this.dryF[b].set('bp', C.dryF || 1100, .55, 0, sr);
      this.fm[b].set('peaking', C.form[0], C.form[1], C.form[2], sr);
      this.fm2[b].set('peaking', (C.form2 || DEF.form2)[0], (C.form2 || DEF.form2)[1], (C.form2 || DEF.form2)[2], sr);
      this.bodyL[b].set('lp', C.bodyLP, .6, 0, sr);
      this.bodyH[b].set('hp', C.hp, .7, 0, sr);
      const E = C.eq || []; while (this.eqs[b].length < E.length) this.eqs[b].push(new Bq());
      this.eqs[b].length = E.length;
      for (let q = 0; q < E.length; q++) this.eqs[b][q].set(E[q][0], E[q][1], .7, E[q][3], sr);
    }
    this.knF.set('bp', C.knockF || 6200, 5, 0, sr); this.knF2.set('bp', (C.knockF || 6200) * 1.4, 6, 0, sr);
    this.grF.set('bp', 1600, 2.5, 0, sr); this.grF2.set('bp', 3100, 3, 0, sr);
    if (C.outLP) { this.outLp[0].set('lp', C.outLP, .62, 0, sr); this.outLp[1].set('lp', C.outLP, .62, 0, sr); }
  };

  /* ===================== LES ÉVÉNEMENTS ===================== */
  /* `rate` : nombre d'essais RATÉS avant que ça prenne (la batterie qui baisse) */
  P.demarre = function (rate) {
    if (this.etat !== 'off') return;
    this.failN = rate || 0; this.beginCrank();
  };
  P.beginCrank = function () {
    this.etat = 'crank'; this.crankT = 0; this.catchP = 0; this.stA = 0; this.rpm = 0; this.rpmEff = 0;
    this.clank(.5, 2300, 3.5); /* le pignon qui s'engage : « tchk » */
    this.stF = 70;
  };
  P.calage = function () {
    if (this.etat === 'run' || this.etat === 'catch') { this.etat = 'stall'; this.stallT = 0; this.pop(.9, .04); this.eI = 1.6; }
  };
  P.coup = function (f) { /* un choc sur la carrosserie : f 0..1 */
    f = clamp(f, 0, 1.5);
    this.clank(f, 650 + this.rnd() * 500, 2.2);
    this.cl.e2 = Math.max(this.cl.e2, f * .8);
    this.missBoost = Math.min(1, this.missBoost + f * .85);
    if (f > .6) this.coughQ++;
  };
  P.clank = function (a, f, q) {
    this.cl.e = Math.max(this.cl.e, a);
    this.cl.f1.set('bp', f, q, 0, this.sr); this.cl.f2.set('bp', f * 2.7, q + 1.5, 0, this.sr);
  };
  /* un POP d'échappement : `a` amplitude, `delay` retard (s) — mis en file (réaction en chaîne dans les collecteurs) */
  P.pop = function (a, delay) { this.popQ.push([this.tT + (delay || 0), a]); };

  /* une NOTE de jeu vidéo : sinus + 2e harmonique, attaque de 2 ms, chute en `dec` s, et un glissando de `gl` octaves sur 250 ms (+ monte, − descend) */
  P.pluck = function (f, a, dec, gl) {
    const sr = this.sr, v = this.cyV.reduce((m, q) => q.e < m.e ? q : m);
    v.e = a; v.f = f; v.ph = 0; v.a = 0; v.d = Math.exp(-1 / (sr * dec)); v.df = Math.pow(2, (gl || 0) / (sr * .25));
  };
  /* le COUP DE POING du gaz : un sub qui tombe de 130 à 58 Hz en 0,14 s, attaque ronde */
  P.punch = function (a) { this.thump.e = a; this.thump.t = 0; this.thump.ph = 0; };

  /* ===================== UN COUP DE CYLINDRE ===================== */
  P.fire = function (slot) {
    const C = this.cfg, h = this.health, n = C.n, b = C.slot[slot];
    const rpm = this.rpmEff, rpmN = clamp(rpm / C.redline, 0, 1.2);
    const load = this.load, thr = this.thr;
    const wear = sstep(.80, .50, h), mis = sstep(.58, .26, h), agony = sstep(.30, .02, h);
    const burning = this.etat === 'run' || this.etat === 'catch' || this.etat === 'stall';
    /* hasard de cylindre : le gargouillis du ralenti + la variance d'un moteur usé */
    const lopeK = C.lope * (1 - sstep(1100, 2800, rpm)) * (.50 + .50 * (1 - thr));
    this.lopeV[slot] += (this.g() - this.lopeV[slot]) * C.lopeSm;
    const cyl = Math.max(.12, 1 + lopeK * this.lopeV[slot] * 1.1 + (wear * .20 + mis * .16) * this.g() + C.breath * .16 * this.br);
    /* le RATÉ : un coup qui manque */
    let pMiss = .004 * wear + .30 * mis * (.45 + .55 * (1 - rpmN * .6)) + .45 * agony + this.missBoost * .55;
    if (this.etat === 'catch') pMiss = Math.max(pMiss, 1 - this.catchP);
    if (this.etat === 'stall') pMiss = Math.max(pMiss, clamp(1 - rpm / 520, 0, .97));
    if (slot === 0) { /* cylindres morts : l'agonie les éteint un à un (2 pistons à la fin), refait une fois par cycle */
      const killN = Math.floor(agony * (n - 2) + .5);
      this.dead.fill(0); for (let k = 0; k < killN; k++) this.dead[(k * 3 + 1) % n] = 1;
    }
    if (this.dead[slot]) pMiss = Math.max(pMiss, .94);
    const miss = this.rnd() < pMiss;
    const fuelCut = this.cutOn || (thr < .04 && rpm > 1500 && this.etat === 'run');
    if (miss || fuelCut || !burning) {
      /* pas de combustion : seulement la pompe (compression sans explosion). Un raté laisse partir une bouffée de mélange non brûlé. */
      const pump = (fuelCut ? .10 : .07) * (.6 + .5 * rpmN) * (this.etat === 'crank' ? 2.4 : 1) + (this.etat === 'stall' ? .30 * clamp(1 - rpm / 700, 0, 1) : 0);
      this.eP[b] += pump; this.eN[b] += pump * .25; this.dP[b] = Math.exp(-1 / (this.sr * C.tau * 2.2)); this.dN[b] = Math.exp(-1 / (this.sr * C.tau * 1.6));
      if (miss && !fuelCut && burning) { this.eN[b] += .10 + .12 * this.rnd(); if (this.popBudget > 0 && this.rnd() < .06 * (wear + mis)) { this.popBudget--; this.pop(.45 + .5 * this.rnd(), .02 + .06 * this.rnd()); } }
      this.eI = Math.max(this.eI, .3);
      return;
    }
    /* coup plein : la pression de cylindre ~ charge × (couple à ce régime) */
    const torque = .60 + .40 * Math.sin(Math.PI * clamp(rpm / (C.redline * 1.05), .1, 1));
    const ld = .24 + .76 * load * (1 - .55 * agony);
    const amp = ld * torque * cyl;
    const nz = amp * C.rasp * C.noiseMix * (.35 + .65 * load) * (.7 + .5 * rpmN) * (1 - .7 * C.warm);
    this.eP[b] += amp; this.eN[b] += nz; this.eD[b] += amp * (.35 + .5 * load) * (.6 + .6 * Math.abs(this.g())) * (1 - .6 * C.warm);
    this.dP[b] = Math.exp(-1 / (this.sr * C.tau * (1.0 + .9 * (1 - rpmN) * (1 - load * .5)) / (1 + rpmN * .6)));
    this.dN[b] = Math.exp(-1 / (this.sr * C.tau * 1.15));
    this.eI = 1;
    /* la mécanique : un tic par coup, plus fort quand on s'use */
    this.eT = Math.max(this.eT, (.010 + .13 * wear + .15 * mis) * C.ticks * (.6 + .6 * this.rnd()));
    /* CLIQUETIS : l'auto-allumage sous charge d'un moteur maltraité (tintement aigu quelques ms après le coup) */
    if (mis > .05 && load > .45 && this.rnd() < .55 * mis * load) this.eK = Math.max(this.eK, (.06 + .10 * mis) * (.5 + .5 * this.rnd()));
    /* COUP DE BIELLE : un « toc » mat, à chaque tour du vilebrequin, dans le bas des tours */
    if (mis > .06 && (slot & 1) === 0) this.eB = Math.max(this.eB, mis * (.5 + .5 * (1 - rpmN)) * (.4 + .6 * this.rnd()));
    /* RETOURS D'ADMISSION (toux) : un coup trop tardif ressort par le papillon */
    if (mis > .1 && this.rnd() < .02 * mis) this.coughQ++;
  };

  /* ===================== LE CONTRÔLE (tous les 64 échantillons) ===================== */
  P.ctrl = function (dt) {
    const C = this.cfg, sr = this.sr, h = this.health;
    this.tT += dt;
    const wear = sstep(.80, .50, h), agony = sstep(.30, .02, h);
    this.missBoost *= Math.exp(-dt * 3.2);
    this.loadS += ((this.etat === 'run' ? this.load : 0) - this.loadS) * Math.min(1, dt * 3);
    if (C.wander || C.swell) {   /* la gorge du bloc : elle respire (±7 % de fréquence, très lent) et s'OUVRE quand on appuie */
      for (let b = 0; b < 2; b++) this.fm[b].set('peaking', C.form[0] * (1 + C.wander * .07 * this.br), C.form[1], C.form[2] + C.swell * this.loadS, sr);
    }
    if (C.cyber > 0 && this.etat === 'run') {
      const rN = clamp((this.rpmEff - C.idle) / (C.redline - C.idle), 0, 1), DEG = [1, 1.5, 2, 3, 4], idx = Math.min(4, Math.floor(rN * 5)), thr = this.thr;
      if (idx > this.cyIdx && thr > .3) this.pluck(this.cleHz * DEG[idx] * 2, C.cyPluck * (.7 + .5 * thr), .2, .16);   /* la marche qu'on monte : ding-ding-ding, tonique·quinte·octave */
      this.cyIdx = idx;
      this.cyF += (this.cleHz * DEG[idx] - this.cyF) * Math.min(1, dt * 9);                                          /* portamento de 110 ms entre deux marches */
      this.cyG += (C.cyber * this.loadS * (.35 + .65 * rN) - this.cyG) * Math.min(1, dt * 6);
      if (thr < .15) { this.lowT = this.tT; this.punched = false; }
      else if (thr > .55 && !this.punched && this.tT - this.lowT < .3) { this.punched = true; this.punch(C.cyThump); this.pluck(this.cleHz * 2, C.cyPluck * .8, .16, .3); }   /* le coup de poing du départ : on SENT l'appui */
    } else this.cyG += (0 - this.cyG) * Math.min(1, dt * 6);
    /* la chaleur : un hasard LENT qui glisse vers une cible tirée toutes les 0,4-1,5 s (la respiration) et un souffle de feu plus vif (0,15-0,6 s) */
    if (C.breath || C.ember) {
      this.brT -= dt; if (this.brT <= 0) { this.brT = .4 + this.rnd() * 1.1; this.brTg = this.g(); }
      this.br += (this.brTg - this.br) * Math.min(1, dt * 2.2);
      this.flT -= dt; if (this.flT <= 0) { this.flT = .15 + this.rnd() * .45; this.flTg = this.rnd(); }
      this.fl += (this.flTg - this.fl) * Math.min(1, dt * 4);
      /* les BRAISES : un Poisson dont le taux suit le souffle du feu ; amplitude à queue lourde (beaucoup de grains, de rares claquements) */
      if (C.ember > 0 && (this.etat === 'run' || this.etat === 'catch')) {
        const lam = C.emberRate * (.2 + 1.8 * this.fl * this.fl);
        if (this.rnd() < lam * dt) {
          const e = this.rnd() < .5 ? 0 : 1, u = this.rnd(), big = this.rnd() < .06;
          this.emE[e] = Math.max(this.emE[e], Math.pow(u, 2.4) * (big ? 1.4 : .7) + .03);
          this.emD[e] = Math.exp(-1 / (sr * (big ? .009 : .0012 + .0042 * this.rnd()) * C.emberLen));
          this.emF[e].set('bp', big ? 380 + this.rnd() * 300 : C.emberF + this.rnd() * C.emberSpan, 1.0, 0, sr);
        }
      }
    }
    this.popBudget = Math.min(3, this.popBudget + dt * 2.2); /* au plus ~2 pops de raté par seconde : au-delà ce n'est plus un moteur, c'est une mitrailleuse */
    if (this.etat === 'off') { this.rpm = 0; this.rpmEff = 0; }
    /* ---- LE DÉMARREUR : tourne, compresse, prend ---- */
    else if (this.etat === 'crank') {
      this.crankT += dt;
      /* la manivelle tourne à ~210 tr/min en pulsant avec les compressions (chaque piston qui monte la ralentit) */
      const rate = 1 - .30 * Math.pow(Math.max(0, Math.sin(this.u * C.n * Math.PI + 1)), 2);
      const battery = this.failN > 0 ? 1 - .22 * this.crankT : 1;
      this.rpm += (215 * rate * battery - this.rpm) * Math.min(1, dt * 9);
      this.rpmEff = this.rpm; this.load = .10; this.thr = .15;
      this.stA = Math.min(1, this.crankT * 6);
      this.stF = 70 + this.rpm * .82;
      if (this.crankT > (this.failN > 0 ? 1.35 : 1.15)) {
        if (this.failN > 0) { this.failN--; this.etat = 'pause'; this.pauseT = 0; }
        else { this.etat = 'catch'; this.catchT = 0; this.catchP = .15; }
      }
    }
    else if (this.etat === 'pause') { /* le démarreur lâche (chute de la hauteur, le moteur s'arrête), on réessaie */
      this.pauseT += dt; this.stA = Math.max(0, this.stA - dt * 6); this.stF = Math.max(50, this.stF - dt * 220);
      this.rpm = Math.max(0, this.rpm - dt * 900); this.rpmEff = this.rpm;
      if (this.pauseT > .75) this.beginCrank();
    }
    else if (this.etat === 'catch') {
      this.catchT += dt;
      /* le démarreur lâche vers 0,5 s ; le moteur prend en toussant (proba de coup qui monte) puis FLASHE à ~1 450 tr/min avant le ralenti */
      this.catchP = clamp(this.catchP + dt * (.9 + .5 * this.rnd()), 0, 1);
      this.stA = Math.max(0, 1 - this.catchT * 3); this.stF = Math.max(60, this.stF - 160 * dt);
      this.load = .22 + .5 * this.catchP; this.thr = .25;
      const tgt = this.catchT < .8 ? 215 + 1200 * Math.pow(this.catchT / .8, 1.3) : 1450 * Math.exp(-(this.catchT - .8) * 1.25) + C.idle;
      this.rpm += (tgt - this.rpm) * Math.min(1, dt * 7); this.rpmEff = this.rpm;
      if (this.catchT > 3.2) this.etat = 'run';
    }
    /* ---- LE CALAGE : les compressions gagnent ---- */
    else if (this.etat === 'stall') {
      this.stallT += dt;
      /* l'inertie du volant contre le frottement : le régime tombe vite puis traîne ; chaque dernière compression le fait tressaillir */
      this.rpm += (-this.rpm * 1.5 - 110 + 40 * Math.sin(this.stallT * 9)) * dt;
      this.thr = 0; this.load = Math.max(0, this.load - dt * 2); this.rpmEff = Math.max(0, this.rpm);
      if (this.rpm < 28) { this.etat = 'off'; this.rpm = 0; this.rpmEff = 0; this.tinkSch = this.tT + .45; this.tinkLeft = 9 + Math.floor(this.rnd() * 6); }
    }
    else { /* run : l'hôte pilote le régime ; le ralenti, le pompage d'agonie et le limiteur sont à nous */
      let tgt = Math.max(this.rpmCmd, C.idle * .94);
      /* ralenti qui TANGUE (soupape de ralenti qui cherche) : discret rodé, franc fatigué */
      const idleness = 1 - sstep(C.idle * 1.15, C.idle * 1.8, tgt), mis = sstep(.58, .26, h);
      this.huntPh += dt * (.9 + .6 * agony);
      tgt += idleness * (.012 + .05 * wear + .09 * mis) * Math.sin(this.huntPh * TAU) * C.idle;
      tgt += agony * Math.sin(this.tT * TAU * .9) * 160 + agony * this.g() * 50;
      /* le limiteur à COUPURE : tant qu'on est collé au rupteur, l'allumage se coupe par à-coups (cutMs), chaque reprise claque */
      const atLimit = this.thr > .6 && this.rpmCmd >= C.limit - 60;
      if (atLimit) {
        this.cutT -= dt;
        if (this.cutT <= 0) {
          this.cutOn = !this.cutOn;
          this.cutT = (C.cutMs[0] + this.rnd() * (C.cutMs[1] - C.cutMs[0])) / 1000 * (this.cutOn ? .62 : 1);
          if (!this.cutOn) { this.pop(1.2 + .8 * this.rnd(), 0); this.pop(.8, .018); } /* la reprise : « bap » */
          else if (this.rnd() < .5) this.pop(.7 + .5 * this.rnd(), .012);
        }
        tgt = Math.min(tgt, C.limit - (this.cutOn ? 380 : 40));
      } else { this.cutOn = false; this.cutT = 0; }
      this.rpm += (tgt - this.rpm) * Math.min(1, dt * 14);
      this.rpmEff = Math.max(0, this.rpm) * (1 - .08 * this.missBoost); /* le choc : une grappe de ratés rend le ralenti plus mou */
    }
    /* ---- LE CRÉPITEMENT AU LÂCHER : un PROGRAMME en trois temps ----
       1) au lâcher (pied levé alors qu'on était dans les gaz, régime > 1 700) : une salve de 1 à 5 pops dans les 120 premières ms, les plus gros d'abord
          (le tuyau est encore brûlant : ça s'enflamme tout de suite) — c'est aussi ce qui fait le « blap-blap » à chaque montée de rapport ;
       2) tant que le pied reste levé : un grésillement de Poisson, dense puis qui s'égrène (exp(-âge/1,4)), plus riche à haut régime ;
       3) chaque pop est parfois doublé (flamme + écho) : l'oreille y entend « pa-pap », pas « pap ». */
    if (this.etat === 'run') {
      const rpm = this.rpmEff, rN = clamp(rpm / C.redline, 0, 1.2), lift = this.thr < .06 && rpm > 1700;
      this.thrHi = Math.max(this.thr, this.thrHi - dt * 3.5);
      if (lift && !this.wasLift && this.thrHi > .5) {
        this.liftAge = 0;
        const nb = 1 + Math.floor(this.rnd() * 2 + C.popRate * (1 + 5 * rN) * this.thrHi);
        if (C.cyber > 0) this.pluck(this.cleHz * 3, C.cyPluck * .7, .16, -.5);   /* le bloop du lâcher : une quinte qui retombe */
        for (let i = 0; i < nb; i++) this.pop((i === 0 || this.rnd() < .22 ? 1.0 + .8 * this.rnd() : .3 + .35 * this.rnd()) * (.6 + .5 * rN), i * (.025 + .04 * this.rnd()));
      }
      if (lift) {
        this.liftAge += dt;
        const lam = C.popRate * (3 + 10 * rN) * Math.exp(-this.liftAge / 1.4) * (this.liftAge > .15 ? 1 : 0);
        if (this.rnd() < lam * dt) {
          const big = this.rnd() < .18;
          this.pop(big ? 1.0 + .8 * this.rnd() : .26 + .30 * this.rnd(), 0);
          if (this.rnd() < .3) this.pop(.2 + .3 * this.rnd(), .02 + .035 * this.rnd());
        }
      } else this.liftAge = 0;
      this.wasLift = lift;
      /* toux d'admission : un retour de flamme dans le papillon (grave et mou) */
      if (this.coughQ > 0 && this.rnd() < dt * 9) { this.coughQ--; this.eI = Math.max(this.eI, 1.6); this.eN[0] += .25; this.eN[1] += .25; this.pop(.22, 0); }
    }
    /* les pops à échéance sont injectés dans le conduit : une grosse bouffée de pression + une rafale de bruit, qui SONNE dans le tuyau */
    if (this.popQ.length) {
      for (let i = this.popQ.length - 1; i >= 0; i--) {
        const q = this.popQ[i];
        if (this.tT >= q[0]) {
          const a = q[1] * C.popLvl, b = this.rnd() < .5 ? 0 : 1;
          this.eP[b] += a * 1.25; this.eN[b] += a * 1.05; this.eD[b] += a * .9; this.dP[b] = Math.exp(-1 / (sr * .0042 * C.popSoft)); this.dN[b] = Math.exp(-1 / (sr * (.003 + .004 * this.rnd()) * C.popSoft));
          this.eN[1 - b] += a * .35;
          this.popQ.splice(i, 1);
        }
      }
    }
    /* le tic-tic du métal qui refroidit après le calage */
    if (this.etat === 'off' && this.tinkLeft > 0 && this.tT >= this.tinkSch) {
      this.tink.e = .5 + .5 * this.rnd(); this.tink.f.set('bp', 2200 + this.rnd() * 1800, 14, 0, sr);
      this.tinkLeft--; this.tinkSch = this.tT + .35 + this.rnd() * 1.1 * (1 + (9 - this.tinkLeft) * .35);
    }
    /* ---- le TURBO : la pression suit la charge avec du retard ; au lâcher la soupape soupire, la pression retombe en tremblant (flutter) ---- */
    if (C.turbo) {
      const rN = clamp(this.rpmEff / C.redline, 0, 1.1), run = this.etat === 'run' ? 1 : 0;
      const tgtB = run * this.thr * clamp((rN - .22) / .5, 0, 1);
      if (tgtB < this.boost - .25 && this.boost > .5 && this.bovE < .1) { this.bovE = this.boost; this.fluE = this.boost; }
      this.boost += (tgtB - this.boost) * Math.min(1, dt * (tgtB > this.boost ? 1.7 : 3.2));
    }
  };

  /* ===================== LE RENDU ===================== */
  P.process = function (L, R, N, off) {
    const C = this.cfg, sr = this.sr, dtc = 64 / sr, G = this.G, A = this.rmsAcc;
    off = off || 0;
    const nC = C.n;
    const dP0 = Math.exp(-1 / (sr * C.tau)), dN0 = Math.exp(-1 / (sr * C.tau * 1.1));
    for (let i = 0; i < N; i++) {
      if ((this.ctrlN++ & 63) === 0) {
        this.ctrl(dtc);
        const rpm = this.rpmEff, rN = clamp(rpm / C.redline, 0, 1.2), thr = this.thr;
        /* les filtres lents suivent le régime (750 fois par seconde) */
        const fi = 150 + rpm * .075 + 230 * thr; this.inF.set('bp', fi, 2.4, 0, sr); this.inF2.set('bp', fi * 2.3, 1.6, 0, sr);
        this.tkF.set('bp', C.tickF + rpm * .12, 1.4, 0, sr);
        this.rbF.set('bp', 290 + rN * 140, 1.6, 0, sr);
        this.stF1.set('bp', this.stF, 6, 0, sr);
        this.gh = Math.pow(clamp(thr, 0, 1), 1.25) * Math.pow(clamp(rN, 0, 1.1), .9) * C.intake;
        if (C.turbo) this.tbF.set('bp', 1500 + this.boost * 6200 * (.6 + .4 * rN), 14, 0, sr);
      }
      /* ---- la manivelle ---- */
      this.fmJitT--; if (this.fmJitT <= 0) { this.fmJitT = 480; this.fmJit += (this.g() * .006 - this.fmJit) * .5; }
      this.u += this.rpmEff * C.pitch / 120 / sr * (1 + this.fmJit); if (this.u >= 1) this.u -= 1;
      const si = Math.floor(this.u * nC);
      if (si !== this.slotIdx) { this.slotIdx = si; if (this.rpmEff > 0) this.fire(si); }
      /* ---- les deux bancades ---- */
      const o = this.oo, dry = this.dd;
      for (let b = 0; b < 2; b++) {
        const eP = this.eP[b], eN = this.eN[b], eD = this.eD[b];
        const nzv = this.g();
        const src = eP + eN * nzv * 1.5;
        this.eP[b] = eP < 1e-5 ? 0 : eP * (this.dP[b] || dP0);
        this.eN[b] = eN < 1e-5 ? 0 : eN * (this.dN[b] || dN0);
        this.eD[b] = eD < 1e-5 ? 0 : eD * this.dD;
        dry[b] = this.dryF[b].p(eD * nzv) * 1.6;
        /* conduit 1 : retard bouclé, réflexion négative, amortissement par un passe-bas dans la boucle */
        const Dl = this.D[b], buf = this.buf[b]; let bi = this.bi[b];
        const rd = bi - Dl, delayed = buf[rd < 0 ? rd + buf.length : rd];
        this.lpv[b] = this.lpv[b] * C.damp + delayed * (1 - C.damp);
        const y = src + C.r * this.lpv[b];
        buf[bi] = y; bi++; if (bi >= buf.length) bi = 0; this.bi[b] = bi;
        /* silencieux : 2e réflexion plus courte (chambre) */
        const D2 = this.D2[b], buf2 = this.buf2[b]; let bj = this.bi2[b];
        const rd2 = bj - D2, d2 = buf2[rd2 < 0 ? rd2 + buf2.length : rd2];
        this.lpv2[b] = this.lpv2[b] * .55 + d2 * .45;
        const y2 = y * .85 + .38 * this.lpv2[b];
        buf2[bj] = y2; bj++; if (bj >= buf2.length) bj = 0; this.bi2[b] = bj;
        /* rayonnement du bout du tuyau : un peu de dérivée (le tuyau « crache » l'aigu) */
        o[b] = y2 - this.lpOut[b] * .55; this.lpOut[b] = y2;
      }
      const nz = this.g(), burn = (this.etat === 'run' || this.etat === 'catch') ? 1 : 0;
      /* ---- l'admission ---- */
      const imod = .55 + .45 * Math.min(1, this.eI); this.eI *= .9992;
      const intake = (this.inF.p(nz) + .5 * this.inF2.p(nz)) * this.gh * imod * 1.3 * C.noiseMix * burn * (.45 + .55 * this.cutG);
      /* ---- la mécanique et les défauts ---- */
      const tick = this.tkF.p(nz) * this.eT * .25; this.eT *= .9965;
      const knock = (this.knF.p(nz) + this.knF2.p(nz) * .8) * this.eK * 2.8; this.eK *= .9955;
      const rb = this.rbF.p(this.eB * (this.g() * .5 + (this.eB > .02 ? 1 : 0))) * .33; this.eB *= .9917;
      const agony = sstep(.30, .02, this.health);
      const gr = agony > 0 && this.etat === 'run' ? (this.grF.p(nz) + this.grF2.p(nz) * .6) * agony * .55 * (.4 + .6 * clamp(this.rpmEff / 3000, 0, 1)) * (.5 + .5 * Math.sin(this.tT * 38 + 3 * Math.sin(this.tT * 3.1))) : 0;
      /* démarreur : l'induit (dent de scie douce) + denture */
      let st = 0;
      if (this.stA > .001) {
        this.stPh += this.stF / sr; if (this.stPh >= 1) this.stPh -= 1;
        const saw = this.stPh * 2 - 1, pulse = Math.max(0, Math.sin(this.stPh * TAU * 7 + 1));
        st = (this.stF1.p(saw + .35 * pulse) * .55 + saw * .05 + this.g() * .01) * this.stA * .20;
      }
      /* choc de tôle */
      let cl = 0;
      if (this.cl.e > .001) { const nn = this.g(); cl = (this.cl.f1.p(nn) * 1.4 + this.cl.f2.p(nn) * .8) * this.cl.e * 1.1; this.cl.e *= .9965; }
      if (this.cl.e2 > .001) { cl += (this.g() * .4 + Math.sin(this.tT * 190)) * this.cl.e2 * .12; this.cl.e2 *= .997; }
      /* tic de refroidissement */
      let tk = 0;
      if (this.tink.e > .001) { tk = this.tink.f.p(this.g()) * this.tink.e * .35; this.tink.e *= .9988; }
      /* turbo : sifflet (bande étroite de bruit : un souffle qui chante), soupape (BOV) et flutter */
      let tb = 0;
      if (C.turbo) {
        const wh = this.tbF.p(nz) * Math.pow(this.boost, 1.6) * .18 * burn;
        let fl = 0;
        if (this.fluE > .01) { this.fluPh += 11 / sr; if (this.fluPh >= 1) this.fluPh -= 1; fl = wh * 0 + this.tbF.p(this.g()) * this.fluE * (this.fluPh < .5 ? 1 : .15) * .5; this.fluE *= .99975; }
        let bv = 0;
        if (this.bovE > .01) { bv = this.bovF.set('bp', 4200, .8, 0, sr).p(nz) * this.bovE * .9; this.bovE *= .99982; }
        tb = wh + fl + bv;
      }
      if (A) { const ac = (k, v) => { A[k] = (A[k] || 0) + v * v; }; ac('pipe', o[0] + o[1]); ac('dry', dry[0] + dry[1]); ac('intake', intake); ac('tick', tick); ac('knock', knock); ac('rod', rb); ac('grind', gr); ac('starter', st); ac('clank', cl); ac('tink', tk); ac('turbo', tb); }
      /* ---- le mélange stéréo : la bancade A surtout à gauche, la B à droite, un tronc commun au centre ---- */
      const pan = C.pan;
      const cgT = this.cutOn ? .2 : 1; this.cutG += (cgT - this.cutG) * (cgT < this.cutG ? .015 : .006); /* le limiteur : le moteur se TAIT d'un coup, il revient en 3 ms */
      const pA = (o[0] * G.pipe + dry[0] * G.dry * 1.0) * this.cutG, pB = (o[1] * G.pipe + dry[1] * G.dry * 1.0) * this.cutG;
      const common = intake * G.intake + rb * G.rod + gr * G.grind + st * G.starter + cl * G.clank;
      const hf = tick * G.tick + knock * G.knock + tk * G.tink + tb * G.turbo;   /* les détails aigus passent APRÈS le corps : le coupe-haut du carter les mangerait */
      let l = (pA * (.5 + pan * .5) + pB * (.5 - pan * .5)) * .9 + common;
      let r = (pB * (.5 + pan * .5) + pA * (.5 - pan * .5)) * .9 + common;
      /* le corps : gorge fixe + épaule + coupe-bas/coupe-haut, puis saturation qui MORD quand on pousse */
      l = this.bodyL[0].p(this.bodyH[0].p(this.fm2[0].p(this.fm[0].p(l)))); r = this.bodyL[1].p(this.bodyH[1].p(this.fm2[1].p(this.fm[1].p(r))));
      for (let q = 0; q < this.eqs[0].length; q++) { l = this.eqs[0][q].p(l); r = this.eqs[1][q].p(r); }
      const drive = C.sat + C.satLoad * this.load * (this.etat === 'run' ? 1 : 0);
      /* les braises : deux grains (un par oreille), sous le moteur — elles reculent quand on appuie (le moteur parle), reviennent au lâcher */
      let em0 = 0, em1 = 0;
      if (C.ember > 0) {
        const eg = C.ember * (1 - .45 * this.load) * 2.2;
        if (this.emE[0] > 1e-4) { em0 = this.emF[0].p(this.g()) * this.emE[0] * eg; this.emE[0] *= this.emD[0]; }
        if (this.emE[1] > 1e-4) { em1 = this.emF[1].p(this.g()) * this.emE[1] * eg; this.emE[1] *= this.emD[1]; }
      }
      /* la touche JEU VIDÉO : un halo (tonique/quinte/octave du morceau, deux sinus désaccordés pour la largeur), les notes de marche, le coup de poing du gaz */
      let cL = 0, cR = 0;
      if (C.cyber > 0) {
        if (this.cyG > 1e-4) {
          const f = this.cyF; this.cyPh[0] += f * 1.0016 / sr; this.cyPh[1] += f * .9984 / sr; if (this.cyPh[0] >= 1) this.cyPh[0] -= 1; if (this.cyPh[1] >= 1) this.cyPh[1] -= 1;
          const hL = Math.sin(TAU * this.cyPh[0]) + .32 * Math.sin(TAU * 2 * this.cyPh[0]) + .1 * Math.sin(TAU * 3 * this.cyPh[0]), hR = Math.sin(TAU * this.cyPh[1]) + .32 * Math.sin(TAU * 2 * this.cyPh[1]) + .1 * Math.sin(TAU * 3 * this.cyPh[1]);
          cL = this.cyLP[0].p(hL) * this.cyG * C.cyHalo; cR = this.cyLP[1].p(hR) * this.cyG * C.cyHalo;
        }
        for (let k = 0; k < 4; k++) { const v = this.cyV[k]; if (v.e > 1e-4) { v.ph += v.f / sr; if (v.ph >= 1) v.ph -= 1; v.f *= v.df; v.a += (1 - v.a) * .01; const x = (Math.sin(TAU * v.ph) + .28 * Math.sin(TAU * 2 * v.ph)) * v.e * v.a; v.e *= v.d; cL += x * (.55 + .1 * k); cR += x * (1 - .1 * k); } }
        if (this.thump.e > 1e-4) { const T = this.thump; T.t += 1 / sr; T.ph += (58 + 72 * Math.exp(-T.t / .05)) / sr; const x = Math.sin(TAU * T.ph) * T.e * (1 - Math.exp(-T.t / .004)); T.e *= Math.exp(-1 / (sr * .07)); cL += x; cR += x; }
        if (A) { const q = (cL + cR) * .5; A.cyber = (A.cyber || 0) + q * q; }
      }
      let ol = Math.tanh(l * drive) / drive + hf + em0 + cL, or = Math.tanh(r * drive) / drive + hf + em1 + cR;
      if (C.outLP) { ol = this.outLp[0].p(ol); or = this.outLp[1].p(or); }   /* le velours : le dernier mot est un passe-bas */
      L[off + i] = ol; if (R) R[off + i] = or;
    }
  };

  const api = { MoteurVivant, Bq, CFG, DEF, describeEtat, clamp, sstep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoteurVivantApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
