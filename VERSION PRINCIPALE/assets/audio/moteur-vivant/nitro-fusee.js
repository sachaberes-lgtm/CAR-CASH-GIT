/* ================= LE NITRO « FLAMMES SOUS PRESSION » (2026-11-09, 4e tour ; Sacha : « des propositions pour le nitro, seulement le nitro… des trucs qui font bjiou, un peu moteur de fusée,
   du gaz très haute pression, agréable, PAS d'effet vent… où on sent les flammes, un son rond… irrégulier et chaleureux, des flammes sous pression, agressif, qui donne une impression de vitesse ») =================
   POURQUOI LES TOURS D'AVANT SONNAIENT « VENT ». Du bruit filtré, même joliment, c'est un souffle : l'oreille entend de l'AIR qui passe. Une flamme sous pression, elle, est faite de COMBUSTION :
   des explosions rapprochées et irrégulières (les ingénieurs de fusées appellent ça le « chuffing » : une instabilité de combustion à 10-40 Hz) qui, à mesure que la pression monte, se rapprochent
   jusqu'à FONDRE en un ronronnement rugueux qui a une hauteur. C'est ça qu'on sent dans la poitrine, et ça n'a rien d'un vent. Ici :
     CHUFF     le métronome irrégulier de la combustion : un train d'impulsions dont la cadence MONTE avec la pression (impression de vitesse) et dont chaque coup a sa force et son écart au hasard ;
               il module tout ce qui brûle (profondeur réglable : 0 = flamme continue, 1 = coups bien séparés)
     CŒUR      la note de la flamme : une impulsion étroite (+ une modulation de fréquence pour le brillant), deux copies désaccordées (largeur), qui MONTE avec la pression (le « spool »)
               et tremble de ±1 % au hasard — une flamme ne tient jamais sa hauteur
     SOUS      l'octave en dessous : le poids dans la poitrine
     GRONDE    (option) deux dents de scie à une seconde mineure + une voix qui glisse : le côté maléfique
     BRAISE    du bruit brun, mais SOUS 900 Hz et haché par le chuff : un roulement grave, jamais un souffle
     CHOC      (option) les « diamants de choc » d'une tuyère : de petites impulsions qui crépitent en roulement fondu, jamais en claquements isolés
     MORSURE   à chaque coup la bouche du filtre du cœur s'OUVRE (×(1+biteK)) puis se referme : un « waou » bref et rond par coup, la morsure de la flamme — sans une once de bruit ;
               `misfire` : la part des coups qui ratent à moitié (la flamme crachote) ; `swellD` : le souffle du feu, une respiration lente de ±swellD sur tout
     BJIOU     l'allumage : une note qui monte vite (« bj ») puis redescend (« iou »), avec son brillant qui s'éteint ; + un coup de poitrine
     SOUPIR    l'extinction : la pression retombe, la hauteur glisse vers le bas, un dernier coup sourd — pas un « pshhh »
   Aucun filtre passe-bande étroit sur du bruit (c'est LUI qui fait le sifflement/le vent). Tout passe par un passe-bas : rien d'aigu ne pique.
   PUR : Float32 stéréo, aucun DOM ; l'hôte écrit `nit` (0..1) et `speed` (0..1). */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  const DEF = {
    master: 1, attack: .10, release: .60, spool: .90,
    coreG: .50, coreF0: 140, coreF1: 420, coreW: .35, coreFM: 0, fmG: .5, coreLP: 1800, coreSat: 1.8, flick: .010,
    subG: .30,
    chugR0: 9, chugR1: 20, chugJit: .20, chugTau: .030, chugDepth: .45,
    roarG: .30, roarF: 700,
    shockG: 0, shockF: 450,
    growlG: 0, growlF: 41,
    sweepG: .50, sweepRise: .07, sweepFall: .35, sweepF0: 180, sweepF1: 1400, sweepF2: 520, sweepFM: 1.0,
    dropG: .40, dropOct: .5, thumpG: .40, thumpF: 55,
    outLP: 2400,
    biteK: 1.2, misfire: .07, swellD: .35,
    /* (5e tour — « la flamme qui flotte dans l'air ») : flame* = le corps de la flamme (bruit LARGE sous flameF, jamais un passe-bande étroit) qui ONDULE par bouffées (4 hasards lissés :
       1,2 · 5 · 11 · 23 Hz) ; lick* = les LANGUES : de brèves bouffées qui gonflent (50 ms) et retombent (180 ms), elles soulèvent la flamme, l'air et la note ; air* = l'air chaud
       qui bouge AVEC la flamme (même ondulation, mêmes langues, pente raide au-dessus de airF) ; drift = la flamme dérive d'une oreille à l'autre ; bloom = l'air autour (une petite
       chambre qui la fait FLOTTER : 4 peignes amortis + 2 passe-tout) */
    flameG: 0, flameF: 900, flameLo: 90, flameFlut: .7, lickRate: 1.6, lickG: .8, airG: 0, airF: 2200, airLo: 600, drift: .3, bloom: 0 };
  function NitroFusee(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 5151515) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.nit = 0; this.speed = 0;
    this.a = 0; this.sp = 0; this.t = 0; this.ctrlN = 0; this.igniteGap = 1;
    this.fl = .5; this.flT = 0; this.flG = .5; this.cr = 0; this.cj = 0; this.chA = 1; this.ce = 0; this.sh = 0; this.shE = 0; this.shj = 0;
    this.ph = 0; this.ph2 = 0; this.phS = 0; this.phSub = 0; this.phG1 = 0; this.phG2 = 0; this.phD = 0; this.phT = 0; this.fk = 0; this.fkT = 0; this.fkG = 0; this.vox = 0; this.voxT = 0; this.voxG = 0;
    this.swT = 99; this.swFall = 99; this.dropT = 99; this.thT = 99; this.cF = 140;
    this.fs4 = [0, 0, 0, 0]; this.lk = 0; this.lkT = 0; this.lkN = 0; this.panPh = Math.random() * 6.28; this.flLP = new Bq(); this.flHP = new Bq(); this.aiLP = new Bq(); this.aiHP = new Bq();
    this.rv = null;
    this.brown = 0; this.roarLP = new Bq(); this.cpLP = [new Bq(), new Bq()]; this.subLP = new Bq(); this.gLP = new Bq(); this.gFm = new Bq(); this.gFm2 = new Bq(); this.shF = new Bq(); this.swLP = new Bq();
    this.outLP = [new Bq().set('lp', this.P.outLP, .62, 0, this.sr), new Bq().set('lp', this.P.outLP, .62, 0, this.sr)];
    this.G = { core: 1, sub: 1, growl: 1, roar: 1, shock: 1, sweep: 1, drop: 1 };
    this.rmsAcc = null;
  }
  const NP = NitroFusee.prototype;
  /* la chambre : 4 peignes amortis par canal (longueurs premières, un peu différentes à gauche et à droite) + 2 passe-tout */
  function Chambre(sr) {
    const D = [[1423, 1783, 2111, 2539], [1511, 1871, 2203, 2617]]; this.c = D.map(L => L.map(n => ({ b: new Float32Array(Math.round(n * sr / 48000)), i: 0, z: 0 }))); this.a = [[347, 113], [379, 127]].map(L => L.map(n => ({ b: new Float32Array(Math.round(n * sr / 48000)), i: 0 })));
  }
  Chambre.prototype.p = function (x, ch, fb, damp) {
    let y = 0; const C = this.c[ch];
    for (let k = 0; k < 4; k++) { const c = C[k], d = c.b[c.i]; c.z = c.z * damp + d * (1 - damp); c.b[c.i] = x + c.z * fb; if (++c.i >= c.b.length) c.i = 0; y += d; }
    y *= .25; const A = this.a[ch];
    for (let k = 0; k < 2; k++) { const a = A[k], d = a.b[a.i], o = -y + d; a.b[a.i] = y + d * .5; if (++a.i >= a.b.length) a.i = 0; y = o; }
    return y;
  };
  NP.ignite = function () { this.swT = 0; this.thT = 0; this.phS = 0; this.igniteGap = 0; };
  NP.soupir = function () { this.dropT = 0; this.phD = 0; this.cF = Math.max(60, this.cF); this.thT = 0; };
  const saw = (ph, d) => { let v = 2 * ph - 1; if (ph < d) { const t = ph / d; v -= t + t - t * t - 1; } else if (ph > 1 - d) { const t = (ph - 1) / d; v -= t * t + t + t + 1; } return v; };   /* dent de scie PolyBLEP */
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    const ced = Math.exp(-1 / (sr * P.chugTau)), shd = Math.exp(-1 / (sr * .008));
    for (let i = 0; i < N; i++) {
      const prevA = this.a, tgt = clamp(this.nit, 0, 1);
      this.a += (tgt - this.a) * (1 - Math.exp(-1 / (sr * (tgt > this.a ? P.attack : P.release) + 1)));
      this.sp += (this.a - this.sp) * (1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))));
      const a = this.a, sp = this.sp, spd = clamp(this.speed, 0, 1), pr = clamp(sp * (.8 + .2 * spd), 0, 1);
      if (prevA < .05 && a >= .05 && this.igniteGap > .4) this.ignite();
      if (tgt < .05 && prevA >= .05 && this.a > .2 && sp > .25 && this.dropT > 1) this.soupir();
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr; this.t += dt; this.igniteGap += dt;
        this.fkT -= dt; if (this.fkT <= 0) { this.fkT = .04 + this.rnd() * .10; this.fkG = this.g(); }
        this.fk += (this.fkG - this.fk) * Math.min(1, dt * 25);
        this.voxT -= dt; if (this.voxT <= 0) { this.voxT = 1.2 + this.rnd() * 2.2; this.voxG = this.rnd(); }
        this.vox += (this.voxG - this.vox) * Math.min(1, dt * .9);
        this.flT -= dt; if (this.flT <= 0) { this.flT = .15 + this.rnd() * .5; this.flG = this.rnd(); }
        this.fl += (this.flG - this.fl) * Math.min(1, dt * 4);
        const lp = P.coreLP * (.7 + .6 * pr) * (1 + P.biteK * this.ce * this.chA); this.cpLP[0].set('lp', lp, .7, 0, sr); this.cpLP[1].set('lp', lp, .7, 0, sr);
        this.roarLP.set('lp', P.roarF * (.7 + .5 * pr), .7, 0, sr); this.subLP.set('lp', 480, .7, 0, sr);
        if (P.flameG > 0 || P.airG > 0) {
          this.lkN -= dt; if (this.lkN <= 0) { this.lkN = (.15 + this.rnd() * .55) / Math.max(.2, P.lickRate); this.lkT = .5 + .5 * this.rnd(); }
          this.flLP.set('lp', P.flameF * (.7 + .6 * pr) * (1 + .35 * this.lk), .7, 0, sr); this.flHP.set('hp', P.flameLo, .7, 0, sr);
          this.aiLP.set('lp', P.airF * (.8 + .4 * pr), .7, 0, sr); this.aiHP.set('hp', P.airLo, .7, 0, sr);
        }
        if (P.growlG > 0) { this.gLP.set('lp', 330, .7, 0, sr); const fo = 300 + 330 * this.vox; this.gFm.set('bp', fo, 2.2, 0, sr); this.gFm2.set('bp', fo * 2.9, 3, 0, sr); }
        if (P.shockG > 0) this.shF.set('bp', P.shockF * (.8 + .4 * this.rnd()), .9, 0, sr);
      }
      /* CHUFF : le métronome irrégulier ; sa cadence monte avec la pression */
      const rate = P.chugR0 + (P.chugR1 - P.chugR0) * Math.pow(pr, 1.15);
      this.cr += rate * (1 + P.chugJit * this.cj) / sr;
      if (this.cr >= 1) { this.cr -= 1; this.cj = this.g(); this.chA = this.rnd() < P.misfire ? .12 + .2 * this.rnd() : .5 + .5 * this.rnd(); this.ce = 1; }
      this.ce *= ced;
      const m = ((1 - P.chugDepth) + P.chugDepth * this.chA * this.ce) * (1 + P.swellD * (this.fl - .5) * 2);
      /* CŒUR : impulsion étroite (+ FM), deux copies désaccordées, la hauteur monte avec la pression et tremble */
      const f = (P.coreF0 + (P.coreF1 - P.coreF0) * Math.pow(pr, 1.3)) * (1 + P.flick * this.fk + .012 * this.lk); this.cF = f;
      const dp = f / sr; this.ph += dp; if (this.ph >= 1) this.ph -= 1; this.ph2 += dp * 1.004; if (this.ph2 >= 1) this.ph2 -= 1; this.phSub += dp * .5; if (this.phSub >= 1) this.phSub -= 1;
      let c1 = saw(this.ph, dp) - saw((this.ph + P.coreW) % 1, dp), c2 = saw(this.ph2, dp * 1.004) - saw((this.ph2 + P.coreW + .04) % 1, dp * 1.004);
      if (P.coreFM > 0) { c1 += P.fmG * Math.sin(TAU * this.ph + P.coreFM * Math.sin(TAU * this.ph)); c2 += P.fmG * Math.sin(TAU * this.ph2 + P.coreFM * Math.sin(TAU * this.ph2)); }
      const cA = Math.pow(a, 1.0) * P.coreG * m;
      const coreL = Math.tanh(this.cpLP[0].p(c1 * .8 + c2 * .3) * P.coreSat) * cA, coreR = Math.tanh(this.cpLP[1].p(c2 * .8 + c1 * .3) * P.coreSat) * cA;
      const sub = this.subLP.p(saw(this.phSub, dp * .5) - saw((this.phSub + .3) % 1, dp * .5)) * Math.pow(a, 1.1) * P.subG * Math.pow(m, 1.3);
      /* GRONDE (option) */
      let gr = 0;
      if (P.growlG > 0) {
        const f0 = P.growlF * (1 + .06 * sp); this.phG1 += f0 / sr; this.phG2 += f0 * 1.0595 / sr; if (this.phG1 >= 1) this.phG1 -= 1; if (this.phG2 >= 1) this.phG2 -= 1;
        const lo = this.gLP.p((this.phG1 * 2 - 1) + (this.phG2 * 2 - 1) * .9 + Math.sin(TAU * this.phG1 * .5) * .8) * .35;
        gr = Math.tanh((lo * .6 + (this.gFm.p(lo) * 1.6 + this.gFm2.p(lo) * .6) * .3) * 4.4) * Math.pow(a, 1.05) * P.growlG * Math.pow(m, 1.2);
      }
      /* BRAISE : du bruit brun SOUS 900 Hz, haché par le chuff */
      this.brown = (this.brown + .02 * this.g()) / 1.02;
      const roar = this.roarLP.p(this.brown * 3.4) * Math.pow(m, 1.6) * Math.pow(a, 1.1) * P.roarG;
      /* LANGUES : des bouffées qui gonflent vite et retombent doucement */
      if (this.lkT > 1e-4 || this.lk > 1e-4) { this.lk += (this.lkT - this.lk) * (this.lkT > this.lk ? 1 / (sr * .05) : 1 / (sr * .02));   /* gonfle en 50 ms, retombe en suivant la cible (180 ms) */ this.lkT *= Math.exp(-1 / (sr * .16)); }
      /* FLAMME + AIR : un souffle LARGE qui ondule par bouffées (4 hasards lissés) — il n'a de sens que mêlé au corps et aux coups ; l'air suit la flamme à la lettre */
      let fl = 0, ai = 0;
      if (P.flameG > 0 || P.airG > 0) {
        let env = 1; for (let j = 0; j < 4; j++) { const k = TAU * (j === 0 ? 1.2 : j === 1 ? 5 : j === 2 ? 11 : 23) / sr; this.fs4[j] += (this.g() - this.fs4[j]) * k; env += P.flameFlut * this.fs4[j] / (.577 * Math.sqrt(k / 2)) * (j === 0 ? .4 : j === 1 ? .3 : j === 2 ? .22 : .08); }
        const fe = Math.pow(Math.max(0, env), 1.5) * (1 + P.lickG * this.lk);
        fl = this.flHP.p(this.flLP.p(this.g())) * fe * Math.pow(a, 1.1) * P.flameG * (.7 + .3 * m);
        ai = this.aiHP.p(this.aiLP.p(this.g())) * Math.pow(Math.max(0, env), 1.2) * (1 + 1.6 * P.lickG * this.lk) * Math.pow(a, 1.2) * P.airG;
      }
      /* CHOC (option) : petites impulsions dont la cadence fond en roulement */
      let shk = 0;
      if (P.shockG > 0) {
        this.sh += rate * 2.3 * (1 + .3 * this.shj) / sr; if (this.sh >= 1) { this.sh -= 1; this.shj = this.g(); this.shE = .4 + .6 * this.rnd(); }
        if (this.shE > 1e-4) { shk = this.shF.p(this.g()) * this.shE * 2.2 * Math.pow(a, 1.1) * P.shockG; this.shE *= shd; }
      }
      /* BJIOU (allumage) et SOUPIR (extinction) */
      let sw = 0, th = 0;
      if (this.swT < P.sweepRise + P.sweepFall + .5) {
        this.swT += 1 / sr; const t = this.swT, r = P.sweepRise;
        const fs = t < r ? P.sweepF0 * Math.pow(P.sweepF1 / P.sweepF0, t / r) : P.sweepF1 * Math.pow(P.sweepF2 / P.sweepF1, Math.min(1, (t - r) / P.sweepFall));
        this.phS += fs / sr; if (this.phS >= 1) this.phS -= 1;
        const I = P.sweepFM * Math.exp(-t / .15), env = (1 - Math.exp(-t / .004)) * Math.exp(-t / ((r + P.sweepFall) * .6));
        sw = this.swLP.set('lp', 2600, .7, 0, sr).p(Math.sin(TAU * this.phS + I * Math.sin(TAU * this.phS))) * env * P.sweepG;
      }
      if (this.dropT < 1) {
        this.dropT += 1 / sr; const t = this.dropT, fd = this.cF * Math.pow(2, -P.dropOct * Math.min(1, t / .3)); this.phD += fd / sr; if (this.phD >= 1) this.phD -= 1;
        sw += Math.sin(TAU * this.phD) * (1 - Math.exp(-t / .006)) * Math.exp(-t / .22) * P.dropG;
      }
      if (this.thT < 1) {
        this.thT += 1 / sr; const t = this.thT; this.phT += (P.thumpF + 55 * Math.exp(-t / .05)) / sr; if (this.phT >= 1) this.phT -= 1;
        th = Math.sin(TAU * this.phT) * (1 - Math.exp(-t / .005)) * Math.exp(-t / .13) * P.thumpG;
      }
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('core', coreL); q('sub', sub); q('growl', gr); q('roar', roar); q('shock', shk); q('sweep', sw + th); q('flamme', fl); q('air', ai); }
      const mid = sub * G.sub + gr * G.growl + roar * G.roar + shk * G.shock + (sw + th) * G.sweep;
      this.panPh += TAU * (.11 + .05 * Math.sin(this.t * .7)) / sr; const pn = P.drift * Math.sin(this.panPh);
      let l = coreL * G.core + mid + (fl + ai) * (1 + pn), r2 = coreR * G.core + mid + (fl + ai) * (1 - pn);
      if (P.bloom > 0) { if (!this.rv) this.rv = new Chambre(sr); const wl = this.rv.p(l, 0, .8, .35), wr = this.rv.p(r2, 1, .8, .35); l += wl * P.bloom; r2 += wr * P.bloom; }
      l = this.outLP[0].p(l); r2 = this.outLP[1].p(r2);
      L[off + i] = Math.tanh(l * 1.15) / 1.15 * P.master; if (R) R[off + i] = Math.tanh(r2 * 1.15) / 1.15 * P.master;
    }
  };
  /* LES SIX PROPOSITIONS (réglages de `P`) */
  const PRESETS = {
    /* 1 · BJIOU — le « boost » d'arcade : un « bj-iou » net à l'allumage, une note brillante qui MONTE, des coups de flamme réguliers qui s'accélèrent */
    bjiou: { biteK: 1.6, misfire: 0.05, coreG: .50, coreF0: 150, coreF1: 460, coreW: .30, coreFM: 1.2, fmG: .45, coreLP: 2200, chugR0: 9, chugR1: 22, chugJit: .22, chugTau: .030, chugDepth: .68, roarG: .25, subG: .30,
      sweepG: .75, sweepRise: .06, sweepF0: 170, sweepF1: 1500, sweepF2: 480, sweepFall: .38, sweepFM: 1.6, dropG: .45, outLP: 2600 },
    /* 2 · FUSÉE — le moteur-fusée : grave, des coups de combustion rapprochés et irréguliers (instabilité 22→36 Hz) qui font un roulement rugueux, des diamants de choc */
    fusee: { biteK: 1.0, misfire: 0.1, coreG: .45, coreF0: 58, coreF1: 118, coreW: .28, coreSat: 2.2, coreLP: 1400, subG: .55, chugR0: 22, chugR1: 36, chugJit: .28, chugTau: .018, chugDepth: .75, roarG: .55, roarF: 650,
      shockG: .45, shockF: 420, sweepG: .45, sweepF0: 60, sweepF1: 280, sweepF2: 90, sweepRise: .16, sweepFall: .45, sweepFM: .3, thumpG: .65, dropG: .4, outLP: 1900, attack: .14 },
    /* 3 · TUYÈRE — le gaz haute pression qui CHANTE : une note brillante (FM) qui monte haut, un bourdonnement fondu à 60-95 coups/s ; le plus « jet » des six, mais tonal */
    tuyere: { biteK: 0.6, misfire: 0.03, coreG: .55, coreF0: 230, coreF1: 620, coreW: .25, coreFM: 2.0, fmG: .6, coreLP: 2400, coreSat: 1.6, subG: .25, chugR0: 55, chugR1: 95, chugJit: .12, chugTau: .006, chugDepth: .45, roarG: .12, roarF: 600,
      sweepG: .6, sweepF0: 200, sweepF1: 1000, sweepF2: 420, sweepRise: .15, sweepFall: .45, sweepFM: 1.2, dropG: .5, dropOct: .6, outLP: 2800, spool: 1.2 },
    /* 4 · CHALUMEAU — la flamme bleue sous pression : une note chaude qui vacille (±1,6 %), des coups irréguliers (14→26 Hz, forte gigue), un roulement chaud dessous */
    chalumeau: { biteK: 1.8, misfire: 0.16, coreG: .50, coreF0: 320, coreF1: 500, coreW: .15, coreSat: 1.5, coreLP: 1700, flick: .016, subG: .30, chugR0: 14, chugR1: 26, chugJit: .38, chugTau: .028, chugDepth: .6, roarG: .45, roarF: 600,
      sweepG: .35, sweepF0: 220, sweepF1: 800, sweepF2: 360, sweepRise: .05, sweepFall: .25, sweepFM: .6, thumpG: .5, dropG: .3, outLP: 2200 },
    /* 5 · DRAGON — la flamme maléfique : une seconde mineure et une voix qui glisse, de GROS coups lents (10→17 Hz) en « wuh-wuh-wuh » qui s'accélèrent, une longue chute à l'extinction */
    dragon: { biteK: 1.3, misfire: 0.12, coreG: .38, coreF0: 85, coreF1: 190, coreW: .32, coreSat: 2.4, coreLP: 1300, subG: .60, growlG: .28, growlF: 38, chugR0: 10, chugR1: 17, chugJit: .30, chugTau: .045, chugDepth: .85, roarG: .5, roarF: 520,
      sweepG: .4, sweepF0: 55, sweepF1: 240, sweepF2: 70, sweepRise: .2, sweepFall: .6, sweepFM: .2, thumpG: .75, dropG: .5, dropOct: .8, outLP: 1700, attack: .2, release: .9 },
    /* 6 · TURBINE — le spool tonal et plaisant : une note qui MONTE longtemps (1,6 s) avec un léger chœur, un « bjiiiou » long, un bourdonnement fondu 70→110 coups/s */
    turbine: { biteK: 0.5, misfire: 0.03, coreG: .45, coreF0: 260, coreF1: 900, coreW: .35, coreFM: .6, fmG: .3, coreLP: 2800, coreSat: 1.4, subG: .20, chugR0: 70, chugR1: 110, chugJit: .08, chugTau: .005, chugDepth: .35, roarG: .12, roarF: 600,
      sweepG: .55, sweepF0: 240, sweepF1: 1100, sweepF2: 600, sweepRise: .22, sweepFall: .5, sweepFM: .8, dropG: .55, dropOct: .7, outLP: 3000, spool: 1.6, attack: .16, release: .8 }
  };
  /* ===== LES SIX FLAMMES (5e tour) : le squelette de combustion d'avant (coups, note qui monte, bjiou) ENROBÉ de vraie flamme et d'air qui flotte ===== */
  const FLAMMES = {
    /* 1 · BRÛLEUR — le brûleur de montgolfière : un gros rugissement de flamme, ondulé par bouffées lentes, des langues qui gonflent, un grave de propane sous pression */
    bruleur: Object.assign({}, PRESETS.chalumeau, { coreG: .18, subG: .18, roarG: .45, flameG: 1.3, flameF: 800, flameLo: 70, flameFlut: 1.2, lickRate: 1.2, lickG: .9, airG: .22, airF: 2000, bloom: .22, drift: .25, chugDepth: .45, chugR0: 11, chugR1: 20, sweepG: .30, thumpG: .6, outLP: 2300, attack: .16, release: .9 }),
    /* 2 · FLAMBÉE — le « whoomp » d'une torchère : l'allumage ÉPAIS (long gonflement), puis une flamme qui danse, bouffées larges et rapides */
    flambee: Object.assign({}, PRESETS.bjiou, { coreG: .22, subG: .15, roarG: .35, flameG: 1.2, flameF: 800, flameLo: 80, flameFlut: 1.3, lickRate: 2.2, lickG: 1.1, airG: .26, airF: 1800, bloom: .26, drift: .35, sweepG: .55, sweepFall: .5, thumpG: .7, outLP: 2100, chugDepth: .5 }),
    /* 3 · CHALUMEAU AÉRIEN — la flamme bleue qui flotte : la note chaude du chalumeau, une flamme fine qui ondule, beaucoup d'air autour et de dérive */
    chalumeauAir: Object.assign({}, PRESETS.chalumeau, { coreG: .34, subG: .15, roarG: .25, flameG: 1.0, flameF: 800, flameLo: 110, flameFlut: 1.2, lickRate: 1.8, lickG: 1.0, airG: .30, airF: 1700, airLo: 500, bloom: .34, drift: .5, outLP: 2000 }),
    /* 4 · SOUFFLE DE DRAGON — la flamme maléfique qui s'étire : le grondement et la voix, un rugissement chaud en vagues lentes, une longue chambre */
    souffle: Object.assign({}, PRESETS.dragon, { coreG: .22, subG: .2, growlG: .24, roarG: .45, flameG: 1.4, flameF: 700, flameLo: 60, flameFlut: 1.1, lickRate: .9, lickG: 1.2, airG: .2, airF: 1800, bloom: .38, drift: .3, outLP: 2000, chugDepth: .7 }),
    /* 5 · PANACHE — le panache d'une fusée : le roulement de combustion et les diamants de choc, enveloppés d'une flamme large et d'air chaud qui tire vers l'arrière */
    panache: Object.assign({}, PRESETS.fusee, { coreG: .24, subG: .2, roarG: .5, flameG: 1.1, flameF: 850, flameLo: 90, flameFlut: .9, lickRate: 1.4, lickG: .7, airG: .26, airF: 1800, airLo: 700, bloom: .18, drift: .2, shockG: .35, outLP: 2000 }),
    /* 6 · FEU FOLLET — la flamme qui flotte, légère : peu de grave, une note claire qui monte, des langues douces, énormément d'air et de dérive d'une oreille à l'autre */
    follet: Object.assign({}, PRESETS.turbine, { coreG: .30, subG: .12, roarG: .15, flameG: 1.0, flameF: 900, flameLo: 120, flameFlut: 1.3, lickRate: 2.0, lickG: 1.2, airG: .18, airF: 1800, airLo: 600, bloom: .42, drift: .6, chugDepth: .3, outLP: 2200 })
  };
  const api = { NitroFusee, FUSEE_DEF: DEF, FUSEE_PRESETS: PRESETS, FLAMMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroFuseeApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
