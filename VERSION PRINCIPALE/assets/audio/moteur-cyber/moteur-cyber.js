/* ================= LE MOTEUR CYBER — un moteur de vrai + un véhicule high-tech, mélangés (2026-11-09, Léo : « neuf, à partir de son de moteurs
   et son de véhicule cyber high-tech, un mélange » ; ses trois plaintes sur le moteur actuel : « pas de puissance », « ça saoule à la longue »,
   « trop pareil entre paliers ») =================
   DEUX MOITIÉS, UN SEUL MOTEUR :
     · LA MÉCANIQUE = le MOTEUR VIVANT (assets/audio/moteur-vivant/moteur-vivant.js), tel quel : de vrais coups d'explosion dans un vrai tuyau.
     · LE CYBER, écrit ici, trois couches :
         1. LE CŒUR (« light-cycle ») : deux dents de scie sans repliement + un sub, dans un filtre résonant qui S'OUVRE avec la charge, puis une
            saturation qui MORD quand on pousse. C'est la couche de la PUISSANCE : pied au plancher elle prend +6 dB et du grain, en croisière elle
            se fait ronde et discrète (c'est ce qui ne saoule pas).
         2. L'ONDULEUR (le moteur électrique) : la note magnétique du rotor + la PORTEUSE du découpage qui monte PAR MARCHES (le chant d'un train
            électrique, d'une voiture électrique de course) — chaque palier a sa GAMME de marches : c'est la signature qui les distingue.
         3. LE PLASMA : un souffle passé dans deux peignes accordés sur le régime (un métal qui siffle doux, large en stéréo).
       + LE BOOST : un coup de sub qui tombe (90 → 34 Hz), la porteuse qui glisse d'une quinte vers le haut, le cœur grand ouvert.
       + LE PASSAGE DE RAPPORT : un « clic » numérique et un creux de 60 ms (la mécanique y met son « blap »).
   LES 30 PALIERS (PAL) : de l'épave toute mécanique (1) à l'hybride (6-19), puis au pur cyber (20-30 : turbine, plasma, statoréacteur, pulso,
   nucléaire, fusion, antimatière, distorsion, comète, supernova, trou noir) — chacun sa part de mécanique, sa fiche, sa note de base, son
   accord, sa gamme de marches, son grain. La note de base MONTE avec les paliers mais reste sous ~200 Hz : jamais le moustique.
   ANTI-FATIGUE : rien de fixe (dérive lente de la hauteur, marches qui bougent), étagère −6 dB au-dessus de 3,5 kHz, porteuse plafonnée à 2,2 kHz,
   et le niveau suit la charge (croisière −4 dB).
   PUR : aucune référence à `window`, au DOM ni à un nœud audio. Rend du Float32 stéréo : un banc Node l'écoute en WAV, un AudioWorklet le joue.
   L'hôte écrit : rpmN (0..1,02 : le régime de la boîte du jeu), thr (0..1), load (0..1), boost (0..1, le nitro), et appelle palier(lv), rapport(). */
(function (root) {
  'use strict';
  const MVA = root.MoteurVivantApi || (typeof require === 'function' ? require('../moteur-vivant/moteur-vivant.js') : null);
  const TAU = Math.PI * 2, clamp = (x, a, b) => x < a ? a : x > b ? b : x;

  /* ---------- LES 30 PALIERS ----------
     meca : part de la mécanique (moteur vivant) · fiche/sante : sa fiche et son usure · f0 : note du cœur au ralenti (Hz) · span : sa montée (×) ·
     acc : l'accord du cœur (rapports) · q : résonance du filtre · grain : saturation de base · poles : paires de pôles (note magnétique = f0 × poles) ·
     gam : la gamme des marches de la porteuse (rapports à `fc`) · fc : porteuse de base (Hz) · inv : niveau de l'onduleur · air : plasma · peigne : son accord ·
     hach : hachoir (Hz, le pulsoréacteur) · crush : grain numérique (0..1) · sub : le sub · large : la stéreo */
  const MAJ = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2], MIN = [1, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 2], QU = [1, 4 / 3, 3 / 2, 2, 8 / 3, 3], CHR = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 7 / 5, 3 / 2];
  const PAL = [
    /*  1 ROUILLÉ     */ { meca: 1.00, fiche: 'v8', sante: .40, f0: 34, span: 2.0, acc: [1], q: .8, grain: 1.0, poles: 2, gam: [1], fc: 380, inv: .10, air: .00, peigne: 3, sub: .5 },
    /*  2 BICYLINDRE  */ { meca: 1.00, fiche: 'v8', sante: .55, f0: 36, span: 2.1, acc: [1], q: .9, grain: 1.0, poles: 2, gam: [1, 2], fc: 400, inv: .12, air: .00, peigne: 3, sub: .5 },
    /*  3 3 CYLINDRES */ { meca: .95, fiche: 'v8', sante: .68, f0: 38, span: 2.2, acc: [1], q: 1.0, grain: 1.0, poles: 3, gam: [1, 4 / 3, 2], fc: 420, inv: .15, air: .02, peigne: 3, sub: .55 },
    /*  4 4 EN LIGNE  */ { meca: .92, fiche: 'v8', sante: .78, f0: 40, span: 2.3, acc: [1], q: 1.1, grain: 1.1, poles: 3, gam: QU.slice(0, 3), fc: 440, inv: .18, air: .03, peigne: 3, sub: .55 },
    /*  5 4 SOUPAPES  */ { meca: .90, fiche: 'v8', sante: 1, f0: 42, span: 2.4, acc: [1, 2], q: 1.2, grain: 1.1, poles: 3, gam: QU.slice(0, 4), fc: 460, inv: .20, air: .04, peigne: 3, sub: .6 },
    /*  6 4L TURBO    */ { meca: .85, fiche: 'l6', sante: 1, f0: 44, span: 2.5, acc: [1, 2], q: 1.3, grain: 1.2, poles: 4, gam: MAJ.slice(0, 4), fc: 480, inv: .26, air: .05, peigne: 4, sub: .6 },
    /*  7 5 CYLINDRES */ { meca: .82, fiche: 'l6', sante: 1, f0: 46, span: 2.5, acc: [1, 1.5], q: 1.4, grain: 1.2, poles: 5, gam: MIN.slice(0, 4), fc: 500, inv: .28, air: .06, peigne: 5, sub: .6 },
    /*  8 V6          */ { meca: .80, fiche: 'v8', sante: 1, f0: 48, span: 2.6, acc: [1, 1.5], q: 1.5, grain: 1.3, poles: 3, gam: MAJ.slice(0, 5), fc: 520, inv: .30, air: .07, peigne: 3, sub: .65 },
    /*  9 V6 BITURBO  */ { meca: .76, fiche: 'l6', sante: 1, f0: 50, span: 2.6, acc: [1, 1.5], q: 1.6, grain: 1.3, poles: 6, gam: MAJ.slice(0, 5), fc: 560, inv: .34, air: .09, peigne: 6, sub: .65 },
    /* 10 BOXER       */ { meca: .74, fiche: 'v8', sante: 1, f0: 47, span: 2.7, acc: [1, 2, 3], q: 1.5, grain: 1.4, poles: 4, gam: QU.slice(0, 5), fc: 540, inv: .34, air: .09, peigne: 4, sub: .7 },
    /* 11 V8 ATMO     */ { meca: .72, fiche: 'v8', sante: 1, f0: 44, span: 2.8, acc: [1, 1.5, 2], q: 1.7, grain: 1.5, poles: 4, gam: MIN.slice(0, 5), fc: 500, inv: .32, air: .08, peigne: 4, sub: .8 },
    /* 12 V8 COMPRESSÉ*/ { meca: .70, fiche: 'v8', sante: 1, f0: 45, span: 2.8, acc: [1, 1.5, 2], q: 1.8, grain: 1.6, poles: 4, gam: MIN, fc: 520, inv: .38, air: .10, peigne: 4, sub: .8 },
    /* 13 V10         */ { meca: .62, fiche: 'flat', sante: 1, f0: 52, span: 3.0, acc: [1, 1.5, 2], q: 1.9, grain: 1.5, poles: 5, gam: MAJ, fc: 600, inv: .42, air: .12, peigne: 5, sub: .7 },
    /* 14 V12         */ { meca: .58, fiche: 'flat', sante: 1, f0: 55, span: 3.0, acc: [1, 1.5, 2, 3], q: 2.0, grain: 1.5, poles: 6, gam: MAJ, fc: 640, inv: .44, air: .13, peigne: 6, sub: .7 },
    /* 15 W12         */ { meca: .55, fiche: 'flat', sante: 1, f0: 54, span: 3.0, acc: [1, 4 / 3, 2], q: 2.0, grain: 1.5, poles: 6, gam: QU, fc: 620, inv: .46, air: .14, peigne: 6, sub: .75 },
    /* 16 V16         */ { meca: .50, fiche: 'flat', sante: 1, f0: 57, span: 3.1, acc: [1, 1.5, 2, 3], q: 2.1, grain: 1.6, poles: 8, gam: MAJ.concat([9 / 4, 5 / 2]), fc: 660, inv: .48, air: .15, peigne: 8, sub: .75 },
    /* 17 H16 F1      */ { meca: .45, fiche: 'flat', sante: 1, f0: 60, span: 3.2, acc: [1, 1.5, 2, 3], q: 2.2, grain: 1.7, poles: 8, gam: CHR, fc: 700, inv: .52, air: .16, peigne: 8, sub: .7 },
    /* 18 QUADRITURBO */ { meca: .40, fiche: 'l6', sante: 1, f0: 52, span: 3.1, acc: [1, 1.5, 2], q: 2.1, grain: 1.8, poles: 6, gam: MIN.concat([12 / 5, 8 / 3]), fc: 660, inv: .56, air: .20, peigne: 6, sub: .85 },
    /* 19 ROTATIF     */ { meca: .35, fiche: 'flat', sante: 1, f0: 62, span: 3.2, acc: [1, 2, 3], q: 2.3, grain: 1.7, poles: 9, gam: QU.concat([4]), fc: 720, inv: .58, air: .18, peigne: 9, sub: .7 },
    /* ---- plus de pistons : le cyber seul ---- */
    /* 20 TURBINE GAZ */ { meca: 0, f0: 50, span: 3.4, acc: [1, 2], q: 1.4, grain: 1.0, poles: 6, gam: MAJ, fc: 620, inv: .55, air: .55, peigne: 6, sub: .8 },
    /* 21 PLASMA      */ { meca: 0, f0: 56, span: 3.5, acc: [1, 1.5, 2], q: 2.4, grain: 1.2, poles: 8, gam: MAJ.concat([9 / 4, 5 / 2, 3]), fc: 700, inv: .62, air: .45, peigne: 8, sub: .75 },
    /* 22 STATORÉACT. */ { meca: 0, f0: 42, span: 3.0, acc: [1, 1.5], q: 1.2, grain: 1.6, poles: 1, gam: [1], fc: 300, inv: .00, air: .95, peigne: 2, sub: 1.0 },
    /* 23 PULSORÉACT. */ { meca: 0, f0: 45, span: 1.4, acc: [1, 2, 3], q: 2.0, grain: 2.2, poles: 2, gam: [1], fc: 360, inv: .10, air: .30, peigne: 3, sub: .9, hach: 45 },
    /* 24 NUCLÉAIRE   */ { meca: 0, f0: 38, span: 3.4, acc: [1, 1.5, 2, 3], q: 1.8, grain: 1.4, poles: 6, gam: MIN, fc: 560, inv: .50, air: .35, peigne: 6, sub: 1.0 },
    /* 25 FUSION      */ { meca: 0, f0: 55, span: 3.6, acc: [1, 1.5, 2, 2.5, 3], q: 2.6, grain: 1.1, poles: 10, gam: MAJ.concat([9 / 4, 5 / 2, 3, 10 / 3]), fc: 760, inv: .60, air: .30, peigne: 10, sub: .8 },
    /* 26 ANTIMATIÈRE */ { meca: 0, f0: 33, span: 3.4, acc: [1, 1.5, 2], q: 2.2, grain: 1.3, poles: 7, gam: MIN.slice().reverse().map(x => 2 / x), fc: 600, inv: .52, air: .40, peigne: 7, sub: 1.1 },
    /* 27 DISTORSION  */ { meca: 0, f0: 48, span: 3.6, acc: [1, 1.06, 1.5], q: 2.8, grain: 2.4, poles: 9, gam: CHR.concat([8 / 5, 5 / 3]), fc: 720, inv: .58, air: .35, peigne: 9, sub: .9, crush: .55 },
    /* 28 COMÈTE      */ { meca: 0, f0: 44, span: 3.6, acc: [1, 1.5, 2], q: 2.0, grain: 2.0, poles: 8, gam: QU.concat([4, 16 / 3]), fc: 680, inv: .55, air: .80, peigne: 8, sub: .95, crush: .15 },
    /* 29 SUPERNOVA   */ { meca: 0, f0: 58, span: 3.8, acc: [1, 1.25, 1.5, 2, 3], q: 2.8, grain: 1.6, poles: 12, gam: MAJ.concat([9 / 4, 5 / 2, 3, 10 / 3, 4]), fc: 800, inv: .66, air: .45, peigne: 12, sub: .9 },
    /* 30 TROU NOIR   */ { meca: 0, f0: 28, span: 3.0, acc: [1, 2, 8], q: 3.0, grain: 1.8, poles: 16, gam: [1, 3 / 2, 2, 3], fc: 900, inv: .45, air: .50, peigne: 16, sub: 1.25 }
  ];
  /* LE NIVEAU DE CHAQUE PALIER : mesuré au banc hors ligne (sim-cyber.cjs, séquence gaz · lâcher · reprise · BOOST · lâcher), la REPRISE calée de −22 dB (palier 1)
     à −19 dB (palier 30) : on monte en puissance avec les paliers, sans marche de niveau d'un palier à l'autre. */
  const VOL = [1.023,1.048,0.967,0.945,0.882,0.873,0.815,0.834,0.806,0.835,0.77,0.771,0.711,0.737,0.704,0.688,0.696,0.635,0.658,0.466,0.488,0.477,0.748,0.483,0.512,0.451,0.555,0.524,0.549,0.501];
  PAL.forEach((p, i) => { p.vol = VOL[i]; });

  /* ---------- briques ---------- */
  function Bq() { this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0; this.z1 = 0; this.z2 = 0; }
  Bq.prototype.set = function (type, f, q, gDb, sr) {
    f = clamp(f, 10, sr * .45); q = Math.max(.1, q);
    const w = TAU * f / sr, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q); let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else { const A = Math.pow(10, (gDb || 0) / 40), be = 2 * Math.sqrt(A) * al;   /* étagère haute */
      b0 = A * ((A + 1) + (A - 1) * c + be); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - be); a0 = (A + 1) - (A - 1) * c + be; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - be; }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0; return this;
  };
  Bq.prototype.p = function (x) { const y = this.b0 * x + this.z1; this.z1 = this.b1 * x - this.a1 * y + this.z2; this.z2 = this.b2 * x - this.a2 * y; return y; };
  /* dent de scie sans repliement (polyBLEP) */
  function blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; }
  /* filtre d'état (Chamberlin, stabilisé) : passe-bas résonant qui s'ouvre avec la charge */
  function Svf() { this.lp = 0; this.bp = 0; }
  Svf.prototype.p = function (x, f, q) { this.lp += f * this.bp; const hp = x - this.lp - q * this.bp; this.bp += f * hp; this.bp = clamp(this.bp, -8, 8); this.lp = clamp(this.lp, -8, 8); return this.lp; };

  function MoteurCyber(sr, seed) {
    this.sr = sr = sr || 48000;
    let s = (seed || 20261109) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.rpmN = 0; this.thr = 0; this.load = 0; this.boost = 0; this.niveau = 1;
    this.lv = -1; this.P = PAL[0]; this.mv = null; this.mvNom = '';
    this.r = 0; this.ld = 0; this.bo = 0; this.bo0 = 0;            /* lissés */
    this.ph = new Float64Array(6); this.subPh = 0; this.magPh = 0; this.carPh = 0; this.chopPh = 0; this.lfoT = 0;
    this.svf = [new Svf(), new Svf()];
    this.fc = 400; this.fcCib = 400; this.step = 0;
    this.combL = new Float32Array(4096); this.combR = new Float32Array(4096); this.ci = 0; this.cfL = 0; this.cfR = 0;
    this.airBp = [new Bq(), new Bq()]; this.shelf = [new Bq(), new Bq()]; this.hpOut = [new Bq(), new Bq()];
    this.thump = 0; this.thumpPh = 0; this.thumpF = 90;
    this.clic = 0; this.creux = 1; this.crushH = [0, 0]; this.crushN = 0;
    this.drift = 0; this.driftC = 0; this.mvBuf = [new Float32Array(128), new Float32Array(128)];
    this.mvG = 0; this.cyG = 0; this.xf = 1;                         /* fondu d'un palier à l'autre */
    this.rms = 0;
    for (let b = 0; b < 2; b++) { this.shelf[b].set('hs', 3500, .7, -6, sr); this.hpOut[b].set('hp', 28, .7, 0, sr); }
    this.palier(0);
  }
  const P = MoteurCyber.prototype;
  P.palier = function (lv) {
    lv = clamp(lv | 0, 0, PAL.length - 1); if (lv === this.lv) return; this.lv = lv; const p = this.P = PAL[lv];
    if (p.meca > 0 && MVA) {
      if (!this.mv || this.mvNom !== p.fiche) { const m = new MVA.MoteurVivant(p.fiche, this.sr, 20261022 + lv); m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; this.mv = m; this.mvNom = p.fiche; }
      this.mv.health = p.sante;
    } else { this.mv = null; this.mvNom = ''; }
    for (let b = 0; b < 2; b++) this.airBp[b].set('bp', 900 + 140 * p.peigne + b * 90, .9, 0, this.sr);
    this.xf = 0;   /* le nouveau palier entre en ~0,25 s */
  };
  P.rapport = function () { this.clic = 1; this.creux = .55; };
  P.coup = function () { this.thump = Math.max(this.thump, .6); this.thumpF = 70; };

  P.process = function (L, R, N, off) {
    off = off || 0; const sr = this.sr, p = this.P, mv = this.mv;
    /* ---- la mécanique, d'un bloc ---- */
    let mL = null, mR = null;
    if (mv) {
      if (this.mvBuf[0].length < N) this.mvBuf = [new Float32Array(N), new Float32Array(N)];
      mL = this.mvBuf[0]; mR = this.mvBuf[1]; mL.fill(0); mR.fill(0);
      const C = mv.cfg, thrM = this.thr;
      mv.rpmCmd = C.idle + Math.min(1.02, this.rpmN) * (C.redline - C.idle) * (1 + .04 * this.bo); mv.thr = thrM; mv.load = thrM > .05 ? Math.min(1, this.load) : 0;
      mv.process(mL, mR, N, 0);
    }
    for (let i = 0; i < N; i++) {
      /* ---- lissages (au taux échantillon : rien ne saute) ---- */
      this.r += (this.rpmN - this.r) * .0009;
      this.ld += (this.load - this.ld) * (this.load > this.ld ? .0012 : .0004);
      const boC = this.boost > this.bo ? .00045 : .00012; this.bo += (this.boost - this.bo) * boC;
      if (this.boost > .5 && this.bo0 <= .5) { this.thump = 1; this.thumpF = 92; this.thumpPh = 0; }   /* le coup du boost */
      this.bo0 = this.boost;
      if (this.xf < 1) this.xf = Math.min(1, this.xf + 1 / (sr * .25));
      const r = clamp(this.r, 0, 1.05), ld = clamp(this.ld, 0, 1), bo = clamp(this.bo, 0, 1);
      /* ---- la vie : une dérive lente de la hauteur (jamais une note figée) ---- */
      if ((this.lfoT++ & 255) === 0) { this.driftC += (this.rnd() * 2 - 1) * .0015; this.driftC *= .97; }
      this.drift += (this.driftC - this.drift) * .0005;
      const vib = 1 + this.drift + .003 * Math.sin(this.lfoT / sr * 1.7) + .002 * Math.sin(this.lfoT / sr * 0.43 + 1);
      /* ---- LE CŒUR ---- */
      const f0 = p.f0 * (1 + r * (p.span - 1)) * vib * (1 + .06 * bo);
      let core = 0; const A = p.acc;
      for (let k = 0; k < A.length && k < 6; k++) {
        const f = f0 * A[k], dt = f / sr; let t = this.ph[k] + dt; if (t >= 1) t -= 1; this.ph[k] = t;
        const w = (2 * t - 1) - blep(t, dt);
        core += w * (k === 0 ? 1 : .55 / Math.sqrt(k));
      }
      this.subPh += f0 * .5 / sr; if (this.subPh >= 1) this.subPh -= 1;
      const sub = Math.sin(TAU * this.subPh) * p.sub * (.45 + .55 * ld + .5 * bo);
      if (p.hach) { this.chopPh += p.hach * (1 + .25 * r) / sr; if (this.chopPh >= 1) this.chopPh -= 1; core *= this.chopPh < .42 ? 1 : .08; }
      const cut = clamp((f0 * (2.2 + 9 * ld + 7 * bo + 3 * r)) / sr * TAU, .002, .9), q = 1 / (p.q * (.7 + .5 * ld));
      let cL = this.svf[0].p(core, cut, q), cR = this.svf[1].p(core * .97, cut * 1.03, q);
      const drv = p.grain * (1 + 2.6 * ld + 2.2 * bo);
      cL = Math.tanh(cL * drv) / Math.sqrt(drv) + sub; cR = Math.tanh(cR * drv) / Math.sqrt(drv) + sub;
      /* ---- L'ONDULEUR : la note magnétique + la porteuse qui monte PAR MARCHES ---- */
      let inv = 0;
      if (p.inv > 0) {
        const G = p.gam, st = Math.min(G.length - 1, Math.floor(r * G.length * .999));
        if (st !== this.step) { this.step = st; }
        this.fcCib = Math.min(2200, p.fc * G[st] * (1 + .5 * bo));
        this.fc += (this.fcCib - this.fc) * .0016;   /* la marche glisse en ~15 ms : un « tchou » électrique, pas un clic */
        const fm = f0 * p.poles * .5; this.magPh += fm / sr; if (this.magPh >= 1) this.magPh -= 1;
        this.carPh += this.fc / sr; if (this.carPh >= 1) this.carPh -= 1;
        const mag = Math.sin(TAU * this.magPh), car = Math.sin(TAU * this.carPh + 1.6 * Math.sin(TAU * this.magPh));
        inv = (mag * .35 + car * .65) * p.inv * (.25 + .75 * ld + .6 * bo) * (.35 + .65 * Math.min(1, r * 1.6));
      }
      /* ---- LE PLASMA : du souffle dans deux peignes accordés sur le régime ---- */
      let aL = 0, aR = 0;
      if (p.air > 0) {
        const nz = this.rnd() * 2 - 1, fComb = f0 * p.peigne * .5, D = clamp(Math.round(sr / fComb), 8, 4000), D2 = clamp(Math.round(D * 1.013), 8, 4090);
        const ci = this.ci, rL = this.combL[(ci - D + 4096) & 4095], rR = this.combR[(ci - D2 + 4096) & 4095];
        const fb = .62 + .25 * ld + .08 * bo;
        this.cfL = this.cfL * .4 + rL * .6; this.cfR = this.cfR * .4 + rR * .6;
        this.combL[ci] = nz * .5 + this.cfL * fb; this.combR[ci] = nz * .5 + this.cfR * fb; this.ci = (ci + 1) & 4095;
        const ga = p.air * (.15 + .55 * Math.pow(r, 1.3) + .35 * ld + .5 * bo) * .3;
        aL = this.airBp[0].p(this.combL[ci]) * ga; aR = this.airBp[1].p(this.combR[ci]) * ga;
      }
      /* ---- le coup du boost : un sub qui TOMBE ---- */
      let th = 0;
      if (this.thump > .001) { this.thumpF += (34 - this.thumpF) * .00012; this.thumpPh += this.thumpF / sr; if (this.thumpPh >= 1) this.thumpPh -= 1; th = Math.sin(TAU * this.thumpPh) * this.thump * .7; this.thump *= .99993; }
      /* ---- le passage de rapport : un creux de 60 ms et un clic numérique qui descend ---- */
      let ck = 0;
      if (this.clic > .001) { ck = Math.sin(TAU * (380 + 900 * this.clic) * (1 - this.clic) * .05) * this.clic * .12; this.clic *= .9985; }
      this.creux += (1 - this.creux) * .0004;
      /* ---- le mélange : mécanique + cyber ; le niveau suit la charge (croisière plus discrète, poussée pleine) ---- */
      const cyb = (1 - p.meca * .55);
      let yL = (cL * .42 + inv * .5 + aL) * cyb * this.creux + th + ck, yR = (cR * .42 + inv * .5 + aR) * cyb * this.creux + th + ck;
      if (p.crush) { if (++this.crushN >= 1 + Math.round(p.crush * 6 * (1 - .5 * bo))) { this.crushN = 0; const qn = 24 - p.crush * 18; this.crushH[0] = Math.round(yL * qn) / qn; this.crushH[1] = Math.round(yR * qn) / qn; } yL = yL * (1 - p.crush * .6) + this.crushH[0] * p.crush * .6; yR = yR * (1 - p.crush * .6) + this.crushH[1] * p.crush * .6; }
      if (mL) { const gm = p.meca * 1.15; yL += mL[i] * gm; yR += mR[i] * gm; }
      const dyn = (.62 + .38 * ld + .22 * bo) * this.niveau * (p.vol || 1) * (.2 + .8 * this.xf);
      yL = this.hpOut[0].p(this.shelf[0].p(yL)) * dyn; yR = this.hpOut[1].p(this.shelf[1].p(yR)) * dyn;
      if (!(yL === yL)) yL = 0; if (!(yR === yR)) yR = 0;   /* jamais un NaN vers le jeu */
      L[off + i] = yL; if (R) R[off + i] = yR;
      this.rms = this.rms * .9995 + yL * yL * .0005;
    }
  };

  const api = { MoteurCyber, PAL, Bq, blep, Svf };   /* les briques servent aussi au moteur BÛCHE CYBER (../moteur-buche/) */
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoteurCyberApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
