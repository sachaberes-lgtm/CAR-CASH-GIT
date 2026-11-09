/* ================= LE NITRO À MATIÈRE (2026-11-09, 3e tour — Sacha : « il faut qu'il ait une matière qui se superpose très bien au bruit du moteur. Là, on dirait du vent
   (…) et c'est complètement flou. Plus de matière. Il ne va même pas avec le moteur ») =================
   POURQUOI LES AUTRES NITROS SONNAIENT COMME DU VENT. `nitro-braise.js` (et `nitro-vivant.js`) sont faits de BRUIT passé dans des bandes : un bruit n'a ni hauteur ni
   rythme, donc l'oreille ne peut ni le ranger avec le moteur (qui, lui, est une suite de COUPS à un rythme précis, dont les harmoniques sont des multiples de la fréquence
   d'allumage) ni lui trouver un contour : c'est « la tête par la fenêtre ». Le flou, c'est l'absence de pulsation et de hauteur.
   LA RÈGLE DE CE MODULE : tout ce qui sonne ici est ACCROCHÉ au moteur. L'hôte écrit `f0` = la fréquence d'ALLUMAGE du moteur (Hz) = tr/min × `cfg.pitch` ÷ 120 × cylindres (c'est exactement la cadence à laquelle le moteur vivant tire ses coups)
   (bûche, V8, pitch .80 : 700 tr/min → 37 Hz ; 5 600 → 300 Hz). Le nitro est alors le même moteur, en plus gros :
     CORPS    trois dents de scie (sans repliement : polyBLEP) pile sur f0, f0 +6 cents, f0 −6 cents, plus l'octave grave : leurs harmoniques tombent SUR celles du moteur
              (elles se renforcent au lieu de se battre) et le battement de ±6 cents (0,3 à 1,4 Hz) fait respirer la masse. Passées dans la MÊME gorge que le pot (pics fixes
              ~180 / 430 / 950 Hz : quand le régime monte, les harmoniques traversent ces crêtes = le « wah » du moteur), puis saturées : plus la pression monte, plus
              on pousse (harmoniques paires et impaires qui naissent, un son plein au lieu d'un son maigre).
     RÂPE     du bruit HACHÉ au rythme des allumages : à chaque coup (phase de f0), une rafale qui retombe en ~35 % de la période, d'amplitude un peu différente à chaque
              cylindre. C'est la détonation du moteur, redoublée : elle donne au nitro des CONTOURS (le contraire du flou) et se cale sur le « bap-bap » du moteur.
     POING    le fondamental f0 (saturé) : le coup de poitrine qui accompagne chaque allumage.
     TIRAGE   l'octave haute (2·f0, 3·f0) qui monte avec la pression : la plainte qui s'ouvre, plus on tient.
     GRONDE   (éteint par défaut ; preset « enfer ») le grondement un peu maléfique demandé au départ : trois dents de scie graves — la note du moteur ramenée dans le grave par octaves
              entières (donc TOUJOURS une harmonique du moteur), sa seconde mineure (battement lent, dissonance sourde) et un triton très bas — passées dans un formant qui glisse
              lentement d'un « o » à un « a » (une voix qui n'en est pas une), saturées. Il monte d'un demi-ton avec la pression.
     FWOOM / SOUPIR   l'allumage (un souffle qui gonfle et un coup de poitrine qui tombe) et l'extinction (« hhh ») — gardés du nitro braise, raccourcis.
   PUR (aucun DOM, aucun nœud audio) : même contrat que les autres. L'hôte écrit `nit` (0..1), `speed` (0..1) et `f0` (Hz, 0 = moteur coupé → 80 Hz par défaut). */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  const DEF = {
    master: 1,
    corpsG: .55, detune: .0035, subG: .5, gorge: [[180, 1.6, 1.0], [430, 1.8, .8], [950, 2.2, .45]], gorgeDry: .55,
    driveLo: 1.3, driveHi: 3.2,
    rapeG: .4, rapeDrive: 22, rapeDecay: 7, rapeJit: .6, rapeQ: .9, rapeLo: 800, rapeHi: 2600,
    poingG: .42, poingSat: 2.2,
    tirageG: .22,
    grondeG: 0, grondeSat: 2.2, grondeAM: .5,
    fwoomG: .45, fwoomF: 52, soupirG: .22,
    outLP: 5200, hp: 38,
    attack: .12, release: .55, spool: .7
  };
  function NitroMatiere(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 31337) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.nit = 0; this.speed = 0; this.f0 = 0;
    this.a = 0; this.sp = 0; this.fS = 80;               /* f0 lissé */
    this.ph = 0; this.phU = 0; this.phD = 0; this.phS = 0; this.phP = 0; this.rapeAmp = 1; this.rapeAmpR = 1;
    this.gF = this.P.gorge.map(() => new Bq()); this.corpsLP = new Bq(); this.corpsLP2 = new Bq();
    this.raL = new Bq(); this.raR = new Bq(); this.raL2 = new Bq(); this.raR2 = new Bq();
    this.poingLP = new Bq();
    this.hp = [new Bq().set('hp', this.P.hp, .7, 0, this.sr), new Bq().set('hp', this.P.hp, .7, 0, this.sr)];
    this.outLP = [new Bq().set('lp', this.P.outLP, .6, 0, this.sr), new Bq().set('lp', this.P.outLP, .6, 0, this.sr)];
    this.gBase = 55; this.gP1 = 0; this.gP2 = 0; this.gP3 = 0; this.gLP = new Bq().set('lp', 330, .7, 0, this.sr); this.gFm = new Bq(); this.gFm2 = new Bq(); this.vox = 0; this.voxT = 0; this.voxTg = 0; this.fl = .5; this.flT = 0; this.flTg = .5;
    this.fwE = 0; this.fwT = 0; this.fwPh = 0; this.fwLP = new Bq().set('lp', 520, .7, 0, this.sr);
    this.soupE = 0; this.soupF = new Bq().set('bp', 1200, .5, 0, this.sr);
    this.ctrlN = 0; this.igniteGap = 1;
    this.G = { corps: 1, rape: 1, poing: 1, tirage: 1, gronde: 1, fwoom: 1, soupir: 1 };
    this.rmsAcc = null;
  }
  const NP = NitroMatiere.prototype;
  NP.ignite = function () { this.fwE = 1; this.fwT = 0; this.igniteGap = 0; };
  NP.soupir = function (v) { this.soupE = v == null ? 1 : v; };
  /* polyBLEP : le saut de la dent de scie est lissé sur un échantillon de chaque côté → pas de repliement */
  function blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; }
  function saw(ph, dt) { return 2 * ph - 1 - blep(ph, dt); }
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    for (let i = 0; i < N; i++) {
      const prevA = this.a, tgt = clamp(this.nit, 0, 1);
      this.a += (tgt - this.a) * (1 - Math.exp(-1 / (sr * (tgt > this.a ? P.attack : P.release) + 1)));
      this.sp += (this.a - this.sp) * (1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))));
      const a = this.a, sp = this.sp, spd = clamp(this.speed, 0, 1);
      if (prevA < .05 && a >= .05 && this.igniteGap > .4) this.ignite();
      if (tgt < .05 && prevA >= .05 && this.a > .2 && sp > .25 && this.soupE < .05) this.soupir(sp);
      this.fS += ((this.f0 > 8 ? this.f0 : 80) - this.fS) * (1 - Math.exp(-1 / (sr * .02)));       /* le moteur ne saute pas : on suit sa fréquence en 20 ms */
      const f0 = this.fS;
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr; this.igniteGap += dt;
        for (let k = 0; k < P.gorge.length; k++) this.gF[k].set('bp', P.gorge[k][0], P.gorge[k][1], 0, sr);
        /* le corps s'éclaire avec la pression ET suit le régime (les harmoniques hautes d'un moteur qui monte) */
        this.corpsLP.set('lp', clamp(700 + 1700 * sp + 5 * f0, 600, 4200), .7, 0, sr); this.corpsLP2.set('lp', clamp(1100 + 2300 * sp + 6 * f0, 900, 5000), .7, 0, sr);
        const rc = clamp(P.rapeLo + 3.2 * f0 + 500 * sp, P.rapeLo, P.rapeHi);
        this.raL.set('bp', rc, P.rapeQ, 0, sr); this.raR.set('bp', rc * 1.07, P.rapeQ, 0, sr); this.raL2.set('bp', rc * .55, 1.2, 0, sr); this.raR2.set('bp', rc * .6, 1.2, 0, sr);
        this.poingLP.set('lp', clamp(2.2 * f0 + 120, 160, 700), .7, 0, sr);
        this.flT -= dt; if (this.flT <= 0) { this.flT = .15 + this.rnd() * .45; this.flTg = this.rnd(); } this.fl += (this.flTg - this.fl) * Math.min(1, dt * 4);
        this.voxT -= dt; if (this.voxT <= 0) { this.voxT = 1.4 + this.rnd() * 2.6; this.voxTg = this.rnd(); } this.vox += (this.voxTg - this.vox) * Math.min(1, dt * .9);
        const fo = 300 + 360 * this.vox; this.gFm.set('bp', fo, 2.2, 0, sr); this.gFm2.set('bp', fo * 2.9, 3, 0, sr);
        let gb = f0; while (gb > 110) gb *= .5; while (gb < 38) gb *= 2; this.gBase += (gb - this.gBase) * Math.min(1, dt * 10);
      }
      /* phases : toutes dérivent de f0 → tout est harmonique du moteur */
      const dph = f0 / sr; this.ph += dph; this.phU += dph * (1 + P.detune); this.phD += dph * (1 - P.detune); this.phS += dph * .5; this.phP += dph;
      if (this.ph >= 1) { this.ph -= 1; this.rapeAmp = 1 - P.rapeJit * this.rnd(); this.rapeAmpR = 1 - P.rapeJit * this.rnd(); }
      if (this.phU >= 1) this.phU -= 1; if (this.phD >= 1) this.phD -= 1; if (this.phS >= 1) this.phS -= 1; if (this.phP >= 1) this.phP -= 1;
      const w = this.g(), wR = this.g();
      /* CORPS */
      const raw = saw(this.ph, dph) * .8 + saw(this.phU, dph * (1 + P.detune)) * .6 + saw(this.phD, dph * (1 - P.detune)) * .6 + saw(this.phS, dph * .5) * P.subG;
      const lp = this.corpsLP2.p(this.corpsLP.p(raw)) * .55;
      let gs = lp * P.gorgeDry; for (let k = 0; k < this.gF.length; k++) gs += this.gF[k].p(lp) * P.gorge[k][2] * 1.6;
      const drive = P.driveLo + (P.driveHi - P.driveLo) * sp;
      const corps = Math.tanh(gs * drive) * Math.pow(a, 1.05) * P.corpsG;
      /* RÂPE : bruit × enveloppe d'allumage (retombe sur ~1/5 de la période) × hasard de cylindre */
      const env = Math.exp(-this.ph * P.rapeDecay);
      const rg = Math.pow(a, 1.1) * (.5 + .5 * spd) * P.rapeG * (.45 + .55 * sp);
      const rL = Math.tanh((this.raL.p(w) + this.raL2.p(w) * .7) * P.rapeDrive * env * this.rapeAmp) * rg, rR = Math.tanh((this.raR.p(wR) + this.raR2.p(wR) * .7) * P.rapeDrive * env * this.rapeAmpR) * rg;
      /* POING */
      const poing = Math.tanh(this.poingLP.p(Math.sin(TAU * this.phP) + .45 * Math.sin(TAU * 2 * this.phP)) * P.poingSat) * Math.pow(a, 1.1) * P.poingG;
      /* TIRAGE : l'octave haute, qui n'arrive qu'avec la pression */
      const tirage = (Math.sin(TAU * 2 * this.phP) * .6 + Math.sin(TAU * 3 * this.phP) * .35) * Math.pow(sp, 1.6) * Math.pow(a, 1.0) * P.tirageG;
      /* GRONDE */
      let gronde = 0;
      if (P.grondeG > 0) {
        const gf = this.gBase * (1 + .059 * sp); this.gP1 += gf / sr; this.gP2 += gf * 1.0595 / sr; this.gP3 += gf * 1.4142 / sr;
        if (this.gP1 >= 1) this.gP1 -= 1; if (this.gP2 >= 1) this.gP2 -= 1; if (this.gP3 >= 1) this.gP3 -= 1;
        const glow = this.gLP.p(((this.gP1 * 2 - 1) + (this.gP2 * 2 - 1) * .9 + (this.gP3 * 2 - 1) * .28) * .35), gv = this.gFm.p(glow) * 2.2 + this.gFm2.p(glow) * .9;
        gronde = Math.tanh((glow * .7 + gv * .3) * P.grondeSat * 2.2) * (1 - P.grondeAM * (1 - (.45 + .55 * this.fl))) * Math.pow(a, 1.05) * P.grondeG;
      }
      /* FWOOM */
      let fw = 0;
      if (this.fwE > 1e-4) {
        this.fwT += 1 / sr;
        const swell = (1 - Math.exp(-this.fwT / .05)) * Math.exp(-this.fwT / .35);
        const f = P.fwoomF * (1 + .9 * Math.exp(-this.fwT / .12)); this.fwPh += f / sr; if (this.fwPh >= 1) this.fwPh -= 1;
        fw = (this.fwLP.p(w) * 2.6 * swell + Math.sin(TAU * this.fwPh) * (1 - Math.exp(-this.fwT / .02)) * Math.exp(-this.fwT / .28) * .9) * P.fwoomG;
        if (this.fwT > 2) this.fwE = 0;
      }
      let so = 0;
      if (this.soupE > 1e-4) { so = this.soupF.p(w) * this.soupE * P.soupirG * 1.6; this.soupE *= Math.exp(-1 / (sr * .4)); }
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('corps', corps); q('rape', rL); q('poing', poing); q('tirage', tirage); q('gronde', gronde); q('fwoom', fw); q('soupir', so); }
      const base = corps * G.corps + poing * G.poing + tirage * G.tirage + gronde * G.gronde + fw * G.fwoom + so * G.soupir;
      let l = base + rL * G.rape, r = base + rR * G.rape;
      l = this.outLP[0].p(this.hp[0].p(l)); r = this.outLP[1].p(this.hp[1].p(r));
      L[off + i] = Math.tanh(l * 1.1) / 1.1 * P.master; if (R) R[off + i] = Math.tanh(r * 1.1) / 1.1 * P.master;
    }
  };
  const PRESETS = {
    /* A · MATIÈRE : le réglage de référence — le moteur, en plus gros */
    matiere: {},
    /* B · MATIÈRE +  : plus de saturation, plus de râpe, le tirage plus présent (plus agressif, plus « injection ») */
    plus: { corpsG: .6, driveLo: 1.8, driveHi: 4.4, rapeG: .6, rapeDrive: 30, rapeDecay: 6, tirageG: .34, poingG: .5, outLP: 6000 },
    /* C · CHAUD : moins de râpe, plus de corps et de grave (plus rond, plus « réconfortant ») */
    /* D · ENFER DOUX : le grondement maléfique (seconde mineure + voix qui glisse) sous un corps sombre, la râpe retenue — jouissif mais calme */
    enfer: { grondeG: .34, corpsG: .5, subG: .7, rapeG: .26, rapeDecay: 8, poingG: .5, tirageG: .12, driveLo: 1.4, driveHi: 3.6, outLP: 3400, release: .8 },
    chaud: { corpsG: .6, subG: .8, rapeG: .22, rapeDecay: 8, poingG: .55, tirageG: .14, driveLo: 1.2, driveHi: 2.6, outLP: 3800 }
  };
  const api = { NitroMatiere, MATIERE_DEF: DEF, PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroMatiereApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
