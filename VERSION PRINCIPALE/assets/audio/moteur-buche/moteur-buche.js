/* ================= LE MOTEUR BÛCHE CYBER (2026-11-09, Léo : « le concept du moteur bûche actuel, remixé par tous les trucs bien de ce moteur
   (le cyber), que ça me plaise obligatoirement » ; « pour l'instant on laisse le boost tel quel ; plus tard, prépare-toi à l'ajouter ») =================
   LA BASE NE CHANGE PAS : c'est LA BÛCHE, le moteur du jeu (code/son/voix-moteur.js + graphe-audio.js) — le ronron grave, le battement, la gorge
   du pot, les 30 voix ENG_SND. Ce fichier ne la remplace pas : il lui AJOUTE ce que le moteur cyber avait de bien, CALÉ SUR SA NOTE (une seule
   machine, jamais deux moteurs qui jouent chacun leur air) :
     SORTIE 0 · LA MÉCANIQUE : le moteur vivant (de vrais coups d'explosion dans un vrai tuyau), son régime réglé pour que ses explosions tombent
                SUR la note de la bûche. L'hôte la branche DANS la bûche (engMix) : elle passe par sa saturation, sa gorge et son filtre — les
                coups deviennent du bois qui craque, pas un fusil.
     SORTIE 1 · LE CYBER, branché après le filtre de la bûche :
                le CŒUR light-cycle (dents de scie dans un filtre qui s'ouvre quand on pousse, saturation qui mord), une octave sous la note ;
                l'ONDULEUR (note magnétique + porteuse qui monte PAR MARCHES, une gamme par palier : ce qui les distingue) ;
                le PLASMA (souffle dans deux peignes accordés) ; le CLIC numérique du passage de rapport.
   Le dosage suit les paliers : la bûche devant partout ; la mécanique pèse en bas (1-19), le cyber monte (discret en 1-5, plein en 20-30).
   LE BOOST : volontairement ABSENT (Léo). L'entrée `boost` est lue mais multipliée par `boostOn` (faux) : le jour où on l'ajoute, `boostOn = true`
   rallume le coup de sub qui tombe, le cœur grand ouvert et la porteuse qui glisse — tout est déjà écrit ci-dessous.
   PUR (ni DOM ni nœud audio) : un banc Node l'écoute, un AudioWorklet le joue (worklet-buche.js).
   L'hôte écrit : hz (la note de la bûche qu'on ENTEND, `fF` d'engSndParams), rpmN (régime 0..1), thr, load ; appelle palier(lv, div), rapport(). */
(function (root) {
  'use strict';
  const MVA = root.MoteurVivantApi || (typeof require === 'function' ? require('../moteur-vivant/moteur-vivant.js') : null);
  const CY = root.MoteurCyberApi || (typeof require === 'function' ? require('../moteur-cyber/moteur-cyber.js') : null);
  const PAL = CY.PAL, Bq = CY.Bq, blep = CY.blep, Svf = CY.Svf;
  const TAU = Math.PI * 2, clamp = (x, a, b) => x < a ? a : x > b ? b : x;

  /* LE DOSAGE PAR PALIER. WM : la mécanique (la part `meca` du moteur cyber, en retrait de la bûche) · WC : le cyber (un soupçon en bas, plein en haut). */
  /* ===== DE LA MATIÈRE PARTOUT (2026-11-09 nuit, Léo : « c'est bien le moteur 1, le 2 à la limite ; après c'est du vent, ça ne fait que du vent,
     il n'y a pas de matière, fais mieux ») =====
     CE QUI FAIT LE PALIER 1 : de vraies explosions (le moteur vivant), un moteur USÉ qui tousse (santé .40), un battement fort, presque pas de cyber.
     CE QUI FAISAIT LE VENT au-dessus : la mécanique s'effaçait (5-19) puis DISPARAISSAIT (20-30), et il ne restait que des souffles — le lit de bruit de la
     bûche, le plasma, le sifflet. Désormais LES 30 PALIERS EXPLOSENT : chacun sa fiche de moteur vivant (FICHE) et son usure (SANTE : un moteur un peu
     fatigué cliquette, tangue, a des cylindres inégaux — c'est ça la matière), la bûche perd la moitié de ses souffles (retouche(), côté hôte),
     le plasma recule, le cyber redevient une TEINTE. */
  const FICHE = ['v8', 'v8', 'v8', 'v8', 'v8', 'l6', 'l6', 'v8', 'l6', 'v8', 'v8', 'v8', 'flat', 'flat', 'l6', 'flat', 'flat', 'l6', 'flat',
                 'l6', 'flat', 'v8', 'v8', 'v8', 'flat', 'v8', 'flat', 'v8', 'flat', 'v8'];
  const SANTE = [.40, .55, .62, .68, .72, .75, .66, .74, .78, .70, .72, .76, .82, .86, .85, .84, .80, .78, .76, .80, .85, .70, .50, .75, .85, .72, .65, .70, .80, .68];
  const WM = PAL.map((p, i) => i < 2 ? 1 : .85);
  /* CAL : le calage MESURÉ (2026-11-09, page d'essai + banc hors ligne, écart modèle/mesure 0,5 dB) pour que le cyber reste SOUS la bûche, en croisière :
     −12 dB aux paliers 1-5, −9 dB en 6-12, −7 dB en 13-19, −4 dB en 20-30 (là où il fait l'identité). La bûche devant, toujours. */
  const CAL = [0.692,0.741,0.513,0.495,0.49,0.7,0.646,0.543,0.525,0.473,0.646,0.617,0.447,0.359,0.391,0.301,0.301,0.517,0.436,0.403,0.428,0.524,1.056,0.478,0.428,0.456,0.58,0.515,0.479,0.533];
  const WC0 = PAL.map((p, i) => (i < 19 ? .35 + .45 * i / 18 : 1) * CAL[i]);   /* ← le cyber à −12/−9/−7/−4 dB sous la bûche (1re version, « presque parfait ») */
  /* ===== LA MATIÈRE ET LE CARACTÈRE (2026-11-09 nuit, Léo : « dans le cyber il y avait des trucs intéressants dans la matière du bruit, des variations
     encore plus fortes entre les moteurs mais bien contrôlées ; il faut que ça améliore et que ça ne transforme pas ce que j'aime ») =====
     TC : le cyber, en dB SOUS la bûche (croisière), palier par palier — il ressort là où le moteur est électrique/réacteur (turbo, quadriturbo, rotatif,
          plasma, stato, pulso, distorsion, comète, trou noir), il se cache sous les atmo (rouillé, bicylindre, V8).
     TM : la MATIÈRE BRUTE — les coups du moteur vivant SANS passer par le filtre de la bûche (le grain, la râpe, le claquement de l'échappement) :
          forte sous l'épave et les gros atmo, discrète sous les moteurs lisses (V12, W12), absente des réacteurs (rien à exploser).
     Jamais au-dessus de la bûche (−1 dB au plus) : elle reste devant. Le NIVEAU TOTAL, lui, ne bouge pas d'un palier à l'autre : l'hôte le corrige
     avec NIV (ci-dessous) — les paliers changent de MATIÈRE, pas de volume. */
  const ANC = PAL.map((p, i) => i < 5 ? -12 : i < 12 ? -9 : i < 19 ? -7 : -4);
  /* (v2 « de la matière partout ») le cyber en TEINTE (−16 au palier 1 qu'aime Léo, −6 à −9 ailleurs), la matière brute à −3/−4 dB partout */
  const TC = [-16, -14, -12, -11, -11, -9, -11, -10, -8, -11, -12, -9, -9, -8, -8, -8, -7, -6, -6, -7, -6, -6, -6, -7, -6, -7, -6, -6, -6, -6];
  const TM = [-3, -4, -4, -4, -4, -4, -4, -4, -4, -4, -3, -3, -4, -4, -4, -4, -4, -4, -5, -4, -4, -4, -3, -4, -4, -4, -4, -4, -4, -4];
  /* KC / KR : les poids CALÉS (page muette, bûche mesurée palier par palier + banc hors ligne) pour tomber sur TC et TM — remplis par cal-buche */
  /* (paliers 1 et 2 : les poids EXACTS de la version que Léo aime, rien ne bouge) */
  const KC = [0.631, 0.794, 0.962, 0.944, 0.896, 0.859, 0.649, 0.843, 1.177, 0.913, 0.835, 1.119, 0.85, 1.06, 0.944, 1.211, 1.284, 1.19, 1.137, 0.7, 0.722, 0.821, 0.827, 0.688, 0.762, 0.697, 0.584, 0.779, 0.677, 0.745];   /* recalé le 09/11 nuit après la note plus grave (page muette) */
  const WC = WC0.map((w, i) => w * KC[i]);
  /* la matière brute : la relation bûche/matière du PALIER 1 (celui que Léo aime) +2 dB, sur tous les autres ; 1 et 2 inchangés */
  const WR = [3.718, 3.044, 2.631, 1.752, 1.537, 2.073, 2.22, 1.696, 2.401, 1.748, 3.048, 2.849, 1.721, 1.572, 1.965, 1.555, 1.457, 2.919, 1.639, 1.797, 1.607, 1.709, 2.308, 1.476, 1.621, 1.467, 1.129, 1.442, 1.035, 1.355];
  /* LA RETOUCHE DE LA BÛCHE (côté hôte, sur les réglages d'engSndParams) : moins de souffle, un battement toujours là */
  /* ===== LA FICHE BÛCHE DE CHAQUE PALIER (2026-11-09 nuit, Léo : « retouche » — encore trop de vent, trop dur, paliers trop pareils) =====
     La bûche du jeu (ENG_SND) donne à ses réacteurs (20-30) une onde presque SINUS et un filtre grand ouvert : il ne reste qu'une note pure et du
     souffle — LE VENT. Ici chaque palier reçoit sa fiche : h (les harmoniques : du CORPS, impairs pour les moteurs qui cognent, denses pour ceux qui
     rugissent), lope (la profondeur du battement), lfoK (sa cadence : le 5-cylindres et le boxer roulent plus lent, la F1 plus vite),
     fq/fr (le filtre : plus sombre = moins d'air), nzK (ce qui reste du lit de bruit). Paliers 1 et 2 : RIEN (la fiche du jeu, que Léo aime). */
  const BUCHE = [
    null, null,
    /*  3 3 CYLINDRES  */ { h: [1, .5, .95, .35, .5, .2, .3], lope: .22, lfoK: .85, nzK: .5 },
    /*  4 4 EN LIGNE   */ { h: [1, .55, .7, .45, .4, .3, .25, .15], lope: .16, nzK: .5 },
    /*  5 4 SOUPAPES   */ { h: [1, .45, .8, .4, .55, .3, .35, .2, .12], lope: .13, lfoK: 1.1, nzK: .5 },
    /*  6 4L TURBO     */ { h: [1, .5, .75, .4, .45, .28, .25, .14], lope: .14, nzK: .45 },
    /*  7 5 CYLINDRES  */ { h: [1, .62, .7, .6, .42, .36, .25, .18], lope: .22, lfoK: .7, nzK: .5 },
    /*  8 V6           */ { h: [1, .5, .78, .5, .5, .32, .3, .2, .14], lope: .15, lfoK: .95, nzK: .5 },
    /*  9 V6 BITURBO   */ { lope: .13, lfoK: 1.05, nzK: .4 },
    /* 10 BOXER        */ { lope: .30, lfoK: .65, nzK: .5 },
    /* 11 V8 ATMO      */ { lope: .32, lfoK: .8, nzK: .5 },
    /* 12 V8 COMPRESSÉ */ { lope: .26, lfoK: .85, nzK: .45 },
    /* 13 V10          */ { h: [1, .5, .85, .6, .66, .42, .5, .3, .3, .2], lope: .12, lfoK: 1.15, fq: 380, nzK: .4 },
    /* 14 V12          */ { h: [1, .45, .8, .6, .7, .5, .55, .38, .4, .26], lope: .09, lfoK: 1.3, fq: 400, nzK: .4 },
    /* 15 W12          */ { h: [1, .6, .65, .62, .54, .48, .4, .3], lope: .12, lfoK: 1.1, fq: 380, nzK: .4 },
    /* 16 V16          */ { h: [1, .4, .75, .55, .7, .5, .55, .4, .38], lope: .1, lfoK: 1.2, fq: 420, nzK: .38 },
    /* 17 H16 F1       */ { lope: .08, lfoK: 1.45, fq: 480, nzK: .38 },
    /* 18 QUADRITURBO  */ { lope: .14, lfoK: .9, nzK: .32 },
    /* 19 ROTATIF      */ { h: [1, .35, .7, .25, .55, .2, .35, .12], lope: .14, lfoK: 1.3, fq: 480, nzK: .4 },
    /* 20 TURBINE GAZ  */ { h: [1, .55, .4, .35, .25, .2, .15], lope: .12, lfoK: .9, fq: 300, fr: 3.4, nzK: .22 },
    /* 21 PLASMA       */ { h: [1, .45, .5, .3, .3, .18], lope: .09, lfoK: 1.2, fq: 340, fr: 3.6, nzK: .22 },
    /* 22 STATORÉACT.  */ { h: [1, .7, .6, .5, .42, .36, .3, .25], lope: .2, lfoK: .75, fq: 260, fr: 3.0, nzK: .2 },
    /* 23 PULSORÉACT.  */ { nzK: .4 },
    /* 24 NUCLÉAIRE    */ { h: [1, .6, .35, .4, .2, .25], lope: .18, lfoK: .7, fq: 300, fr: 3.2, nzK: .22 },
    /* 25 FUSION       */ { h: [1, .3, .5, .2, .3, .12], lope: .07, lfoK: 1.35, fq: 360, fr: 3.6, nzK: .22 },
    /* 26 ANTIMATIÈRE  */ { h: [1, .5, .25, .3, .12], lope: .16, lfoK: .6, fq: 240, fr: 3.0, nzK: .2 },
    /* 27 DISTORSION   */ { h: [1, .4, .6, .35, .45, .3, .3], lope: .12, lfoK: 1.25, fq: 400, fr: 3.8, nzK: .25 },
    /* 28 COMÈTE       */ { h: [1, .65, .55, .5, .4, .35, .3, .22], lope: .22, lfoK: .85, fq: 320, fr: 3.4, nzK: .25 },
    /* 29 SUPERNOVA    */ { h: [1, .5, .6, .45, .5, .35, .35, .25, .2], lope: .11, lfoK: 1.15, fq: 420, fr: 3.8, nzK: .22 },
    /* 30 TROU NOIR    */ { h: [1, .2, .6, .15, .4, .1, .25], lope: .13, lfoK: .65, fq: 220, fr: 3.0, nzK: .2 }
  ];
  const FB = [];
  /* la fiche de la bûche pour ce palier : celle du jeu + la retouche (copie : le cache d onde « w » de la fiche du jeu n'est jamais touché) */
  function ficheBuche(ENG, lv) {
    const o = BUCHE[lv]; if (!o) return ENG[lv];
    if (!FB[lv]) { const e = Object.assign({}, ENG[lv], o); delete e.w; FB[lv] = e; }
    return FB[lv];
  }
  /* LA RETOUCHE DES RÉGLAGES D'UNE IMAGE (engSndParams) : moins de souffle, un battement toujours là, à sa cadence ; les réacteurs gagnent les
     bouffées de combustion (le « tic » que le jeu ne donne qu'aux moteurs à boîte) — c'est ça qui remplace le vent par de la matière.
     st = { rpm, charge } (les mêmes que pour engSndParams) */
  /* LA NOTE PLUS GRAVE (mesuré le 09/11 nuit, page muette : la part 2-6 kHz vaut −32 dB au palier 1 et −17 à −23 dB aux paliers 14-30 — c'est ÇA le vent
     et la dureté). Le palier 1 chante à 40-70 Hz ; à partir du 13 la bûche montait à 400-700 Hz et ses harmoniques remplissaient l'aigu. Au-dessus de
     180 Hz la note est COMPRIMÉE (puissance .45) : 491 Hz → 283, 680 → 327 ; en dessous rien ne bouge. Les paliers 1-2 n'y passent jamais. */
  const NG = 180, NGP = .45;
  function noteBuche(f, lv) { return lv >= 2 && f > NG ? NG * Math.pow(f / NG, NGP) : f; }
  function retouche(P9, lv, st) {
    if (lv < 2) return P9;   /* le palier 1 (et le 2) : la bûche telle que Léo l'aime, pas touchée */
    const o = BUCHE[lv] || {}, ch = (st && st.charge) || 0, rpm = (st && st.rpm) || 0;
    P9.fF = noteBuche(P9.fF, lv); P9.subF = Math.max(22, P9.fF * .5); P9.tickF = Math.max(6, P9.fF);
    P9.lp = Math.min(P9.lp, lv < 19 ? 1700 : 1400);                     /* le filtre plus sombre : la matière reste, l'air part */
    P9.whineF = Math.min(P9.whineF, 1800); P9.transG *= .5;
    P9.nzG *= o.nzK != null ? o.nzK : .5; P9.pinkG *= .5; P9.whineG *= lv < 19 ? .55 : .4;
    if (lv >= 19) P9.tickG = Math.max(P9.tickG, .010 + .045 * ch + .015 * rpm);
    P9.lfoF = Math.min(26, Math.max(6, P9.lfoF * (o.lfoK || 1)));
    P9.lfoG = Math.min(P9.ev * .85, Math.max(P9.lfoG, P9.ev * (lv < 19 ? .32 : .28)));
    return P9;
  }
  /* NIV : la correction du niveau total (bûche + matière + cyber ramenés à bûche +1,5 dB, la moyenne de la 1re version) */
  const NIV = PAL.map((p, i) => { const pw = 1 + Math.pow(10, TC[i] / 10) + (TM[i] == null ? 0 : Math.pow(10, TM[i] / 10)); return Math.pow(10, (1.5 - 10 * Math.log10(pw)) / 20); });

  function MoteurBuche(sr, seed) {
    this.sr = sr = sr || 48000;
    let s = (seed || 20261109) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.hz = 40; this.rpmN = 0; this.thr = 0; this.load = 0; this.boost = 0; this.niveau = 1;
    this.rude = 0; this.lent1 = 0; this.lent2 = 0; this.gl = 0; this.glPh = 0; this.sante = 1;   /* LA VIE (vie-moteur.js) : rugosité, souffle lent, décrochage */
    this.boostOn = false;                                              /* ← LE BOOST, plus tard : true */
    this.lv = -1; this.P = PAL[0]; this.div = 1; this.mv = null; this.mvNom = '';
    this.f = 40; this.r = 0; this.ld = 0; this.bo = 0; this.bo0 = 0;
    this.ph = new Float64Array(6); this.magPh = 0; this.carPh = 0; this.chopPh = 0; this.lfoT = 0;
    this.svf = [new Svf(), new Svf()];
    this.fc = 400; this.fcCib = 400;
    this.combL = new Float32Array(4096); this.combR = new Float32Array(4096); this.ci = 0; this.cfL = 0; this.cfR = 0;
    this.airBp = [new Bq(), new Bq()];
    this.rawLp = [new Bq(), new Bq(), new Bq(), new Bq()];   /* la matière brute adoucie (paliers 3-30) : deux passe-bas à 2,6 kHz, la râpe reste, le perçant part */
    for (let b = 0; b < 4; b++) this.rawLp[b].set('lp', b < 2 ? 2600 : 3400, .6, 0, this.sr);
    this.thump = 0; this.thumpPh = 0; this.thumpF = 90;
    this.clic = 0; this.crushH = [0, 0]; this.crushN = 0;
    this.drift = 0; this.driftC = 0; this.xf = 1;
    this.rL = new Float32Array(128); this.rR = new Float32Array(128); this.mat = 1;   /* mat : 0 = sans la matière brute (la 1re version), pour comparer */
    this.palier(0, 1);
  }
  const P = MoteurBuche.prototype;
  /* div : la puissance de 2 qui ramène la note la plus haute du palier sous ~240 Hz (le cœur joue une ou plusieurs octaves SOUS la bûche :
     même famille de notes, jamais de moustique). L'hôte la calcule depuis ENG_SND. */
  P.palier = function (lv, div) {
    lv = clamp(lv | 0, 0, PAL.length - 1); this.div = Math.max(1, div || 1);
    if (lv === this.lv) return; this.lv = lv; const p = this.P = PAL[lv];
    if (MVA) {
      const fi = FICHE[lv];
      if (!this.mv || this.mvNom !== fi) { const m = new MVA.MoteurVivant(fi, this.sr, 20261022 + lv); m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; this.mv = m; this.mvNom = fi; }
      this.mv.health = SANTE[lv]; this.sante = SANTE[lv];
    } else { this.mv = null; this.mvNom = ''; }
    for (let b = 0; b < 2; b++) this.airBp[b].set('bp', lv >= 2 ? Math.min(1500, 700 + 90 * p.peigne) + b * 70 : 900 + 140 * p.peigne + b * 90, .9, 0, this.sr);   /* (3-30) le plasma plus bas */
    this.xf = 0;
  };
  P.rapport = function () { this.clic = 1; };
  /* LE DÉCROCHAGE (les réacteurs n'ont pas de cylindre qui rate : c'est l'électronique qui glitche une fraction de seconde) */
  P.glitch = function (f) { this.gl = Math.max(this.gl, .5 + .5 * (f || 1)); };
  P.coup = function () { if (this.boostOn) { this.thump = Math.max(this.thump, .6); this.thumpF = 70; } };

  /* mL/mR : la mécanique (sortie 0) · cL/cR : le cyber (sortie 1) — N échantillons */
  P.process = function (mL, mR, cL, cR, N) {
    const sr = this.sr, p = this.P, mv = this.mv, wm = WM[this.lv], wc = WC[this.lv], wr = WR[this.lv];
    if (this.rL.length < N) { this.rL = new Float32Array(N); this.rR = new Float32Array(N); }
    const rL = this.rL, rR = this.rR;
    /* ---- la mécanique : son régime fait tomber ses explosions SUR la note de la bûche (régime × cylindres / 120 = la note) ---- */
    if (mv && wm > 0) {
      const C = mv.cfg, thrM = this.thr;
      mv.health = clamp(this.sante * (1 - .5 * clamp(this.rude, 0, 1)), .2, 1);   /* la rugosité de la vie : le moteur vivant tousse, cliquette, hésite pour de vrai */
      mv.rpmCmd = clamp(this.hz * 120 / C.n, C.idle * .94, C.redline * 1.02); mv.thr = thrM; mv.load = thrM > .05 ? Math.min(1, this.load) : 0;
      mL.fill(0, 0, N); mR.fill(0, 0, N); mv.process(mL, mR, N, 0);   /* (il AJOUTE dans le tampon) */
      const g = wm * (.2 + .8 * this.xf);
      const gr = wr * (.2 + .8 * this.xf) * this.mat * (1 + .22 * this.lent2) * (1 + .35 * clamp(this.rude, 0, 1));   /* la matière respire, et ressort quand ça tousse */
      const doux = this.lv >= 2, F = this.rawLp;
      for (let i = 0; i < N; i++) { let a = mL[i], b = mR[i]; if (!(a === a)) a = 0; if (!(b === b)) b = 0; mL[i] = a * g; mR[i] = b * g;
        if (doux) { a = F[2].p(F[0].p(a)); b = F[3].p(F[1].p(b)); a = Math.tanh(a * 3) / 3; b = Math.tanh(b * 3) / 3; }   /* + les crêtes arrondies : un claquement, pas un coup de fusil */
        rL[i] = a * gr; rR[i] = b * gr; }
    } else { mL.fill(0, 0, N); mR.fill(0, 0, N); rL.fill(0, 0, N); rR.fill(0, 0, N); }
    const bIn = this.boostOn ? this.boost : 0;
    for (let i = 0; i < N; i++) {
      this.f += (this.hz - this.f) * .002;
      this.r += (this.rpmN - this.r) * .0009;
      this.ld += (this.load - this.ld) * (this.load > this.ld ? .0012 : .0004);
      this.bo += (bIn - this.bo) * (bIn > this.bo ? .00045 : .00012);
      if (bIn > .5 && this.bo0 <= .5) { this.thump = 1; this.thumpF = 92; this.thumpPh = 0; }
      this.bo0 = bIn;
      if (this.xf < 1) this.xf = Math.min(1, this.xf + 1 / (sr * .25));
      const r = clamp(this.r, 0, 1.05), ld = clamp(this.ld, 0, 1), bo = clamp(this.bo, 0, 1);
      if ((this.lfoT++ & 255) === 0) { this.driftC += (this.rnd() * 2 - 1) * .0012; this.driftC *= .97; }
      this.drift += (this.driftC - this.drift) * .0005;
      /* ---- LE CŒUR, une ou plusieurs octaves sous la bûche ---- */
      const f0 = Math.max(8, this.f / this.div) * (1 + this.drift) * (1 + .06 * bo);
      let core = 0; const A = p.acc;
      for (let k = 0; k < A.length && k < 6; k++) {
        const fk = f0 * A[k], dt = fk / sr; let t = this.ph[k] + dt; if (t >= 1) t -= 1; this.ph[k] = t;
        core += ((2 * t - 1) - blep(t, dt)) * (k === 0 ? 1 : .55 / Math.sqrt(k));
      }
      if (p.hach) { this.chopPh += p.hach * (1 + .25 * r) / sr; if (this.chopPh >= 1) this.chopPh -= 1; core *= this.chopPh < .42 ? 1 : .08; }
      if (this.gl > .001) { this.gl *= .99985; this.glPh += 1 / sr; }
      const gk = this.gl > .001 ? this.gl * (Math.sin(this.glPh * 173) > 0 ? 1 : -1) : 0;   /* le glitch : un créneau qui fait sauter la porteuse et ferme le cœur */
      const cut = clamp((f0 * (2.2 + 9 * ld + 7 * bo + 3 * r) * (1 + .18 * this.lent1) * (1 - .45 * Math.abs(gk))) / sr * TAU, .002, .9), q = 1 / (p.q * (.7 + .5 * ld));
      let yL = this.svf[0].p(core, cut, q), yR = this.svf[1].p(core * .97, cut * 1.03, q);
      const drv = p.grain * (1 + 2.6 * ld + 2.2 * bo);
      yL = Math.tanh(yL * drv) / Math.sqrt(drv); yR = Math.tanh(yR * drv) / Math.sqrt(drv);
      /* ---- L'ONDULEUR : note magnétique (accordée sur le cœur) + porteuse PAR MARCHES ---- */
      let inv = 0;
      if (p.inv > 0) {
        const G = p.gam, st = Math.min(G.length - 1, Math.floor(r * G.length * .999));
        this.fcCib = Math.min(this.lv >= 2 ? 1500 : 2200, p.fc * G[st] * (1 + .5 * bo));   /* (3-30) la porteuse sous 1,5 kHz : moins d'aigu */
        this.fc += (this.fcCib - this.fc) * .0016;
        const fm = Math.min(1800, f0 * p.poles * .5); this.magPh += fm / sr; if (this.magPh >= 1) this.magPh -= 1;
        this.carPh += this.fc * (1 + .22 * gk) / sr; if (this.carPh >= 1) this.carPh -= 1;
        const mag = Math.sin(TAU * this.magPh), car = Math.sin(TAU * this.carPh + 1.6 * Math.sin(TAU * this.magPh));
        inv = (mag * .35 + car * .65) * p.inv * (.25 + .75 * ld + .6 * bo) * (.35 + .65 * Math.min(1, r * 1.6));
      }
      /* ---- LE PLASMA ---- */
      let aL = 0, aR = 0;
      if (p.air > 0) {
        const nz = this.rnd() * 2 - 1, fComb = Math.max(20, f0 * p.peigne * .5), D = clamp(Math.round(sr / fComb), 8, 4000), D2 = clamp(Math.round(D * 1.013), 8, 4090);
        const ci = this.ci, rL = this.combL[(ci - D + 4096) & 4095], rR = this.combR[(ci - D2 + 4096) & 4095];
        const fb = .62 + .25 * ld + .08 * bo;
        this.cfL = this.cfL * .4 + rL * .6; this.cfR = this.cfR * .4 + rR * .6;
        this.combL[ci] = nz * .5 + this.cfL * fb; this.combR[ci] = nz * .5 + this.cfR * fb; this.ci = (ci + 1) & 4095;
        const ga = p.air * (.15 + .55 * Math.pow(r, 1.3) + .35 * ld + .5 * bo) * .3 * (1 + .3 * this.lent2) * .45;   /* le plasma recule : c'était du vent */
        aL = this.airBp[0].p(this.combL[ci]) * ga; aR = this.airBp[1].p(this.combR[ci]) * ga;
      }
      /* ---- le coup du boost (éteint tant que boostOn est faux) ---- */
      let th = 0;
      if (this.thump > .001) { this.thumpF += (34 - this.thumpF) * .00012; this.thumpPh += this.thumpF / sr; if (this.thumpPh >= 1) this.thumpPh -= 1; th = Math.sin(TAU * this.thumpPh) * this.thump * .7; this.thump *= .99993; }
      /* ---- le clic du passage de rapport ---- */
      let ck = 0;
      if (this.clic > .001) { ck = Math.sin(TAU * (380 + 900 * this.clic) * (1 - this.clic) * .05) * this.clic * .10; this.clic *= .9985; }
      const g = wc * (.2 + .8 * this.xf) * this.niveau * (1 + .2 * this.lent1) * (1 - .5 * Math.abs(gk));   /* le cyber respire (±1,5 dB sur ~9 s) */
      yL = (yL * .42 + inv * .5 + aL) * g + th + ck + rL[i] * this.niveau; yR = (yR * .42 + inv * .5 + aR) * g + th + ck + rR[i] * this.niveau;
      if (p.crush) { if (++this.crushN >= 1 + Math.round(p.crush * 6)) { this.crushN = 0; const qn = 24 - p.crush * 18; this.crushH[0] = Math.round(yL * qn) / qn; this.crushH[1] = Math.round(yR * qn) / qn; } yL = yL * (1 - p.crush * .6) + this.crushH[0] * p.crush * .6; yR = yR * (1 - p.crush * .6) + this.crushH[1] * p.crush * .6; }
      if (!(yL === yL)) yL = 0; if (!(yR === yR)) yR = 0;
      cL[i] = yL; cR[i] = yR;
    }
  };

  const api = { MoteurBuche, WM, WC, WC0, WR, KC, NIV, TC, TM, FICHE, SANTE, BUCHE, ficheBuche, retouche, noteBuche };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoteurBucheApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
