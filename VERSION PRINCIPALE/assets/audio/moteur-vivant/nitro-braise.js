/* ================= LE NITRO BRAISE (2026-11-09 ; Sacha : « un bruit de flamme rond, crépitant, ardent, comme des charbons, comme de la braise… et aussi les flammes
   de l'enfer, un grondement un petit peu maléfique… jouissif mais calme ») =================
   Même contrat que `nitro-vivant.js` (PUR : aucun DOM, aucun nœud ; Node le rend en WAV, un AudioWorklet le jouera). L'hôte écrit `nit` (0..1) et `speed` (0..1).
   Ce n'est PAS un réacteur : il n'y a ni sifflet de turbo ni soupape. C'est un FEU qui prend, respire, crépite et s'éteint en braises.
     GRONDE    le « petit peu maléfique » : deux dents de scie graves à une SECONDE MINEURE l'une de l'autre (battement lent, dissonance sourde, la chose qu'on
               sent plus qu'on n'entend), un triton très bas, passés dans un FORMANT qui glisse lentement d'un « o » à un « a » (une voix qui n'en est pas une),
               puis une saturation douce qui fait naître des harmoniques audibles sur un petit haut-parleur. Il monte d'un demi-ton avec la pression.
     BRAISE    le lit de charbons : bruit brun, très grave, qui RESPIRE (le souffle du feu = un hasard lent, 0,15-0,6 s).
     SOUFFLE   l'air chaud entre les braises : une bande de bruit à ~900 Hz, décorrélée gauche/droite.
     CRÉPITE   des grains ronds, par VAGUES (le taux suit le souffle du feu, au carré : des accalmies puis des gerbes), amplitude à queue lourde (beaucoup de
               petits, de rares gros), fréquence et durée tirées à chaque grain ; un gros grain traîne 2 à 5 petits grains derrière lui (une bûche qui s'effondre).
     BÛCHE     de loin en loin un claquement grave et mou (300-480 Hz, ~20 ms) : la poche de résine qui éclate.
     FWOOM     l'allumage : un souffle qui GONFLE (120 ms) puis retombe, et un coup de poitrine à 46 Hz — rond, jamais sec.
     SOUPIR    l'extinction : un « hhh » chaud ; le crépitement ne s'arrête pas net, il s'égrène avec la pression (les braises refroidissent). */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  const DEF = {
    master: 1,
    grondeG: .15, grondeF: 38, grondeSat: 1.7, grondeAM: .45, grondeVoix: .6,
    braiseG: .40, braiseF: 170,
    souffleG: .20, souffleF: 900,
    crepiteG: 0, crepiteRate: 38, crepiteBig: .10, crepiteQueue: 2.3, crepiteF: 700, crepiteSpan: 2500, outLP: 2400,
    bucheG: 0, bucheRate: .7,
    flammeG: .5, flammeF: 650, flammeBody: .6, flammeDepth: .5,
    /* (2026-11-09, 3e tour — Sacha : « on dirait du vent, tête par la fenêtre, complètement flou… il faut lui ajouter de la MATIÈRE qui se superpose au moteur ») :
       tout ce qui précède est du BRUIT filtré, donc du vent. La matière vient du MOTEUR : l'hôte écrit `fire` (Hz, la fréquence d'allumage du moteur : régime × hauteur ÷ 120 × cylindres).
       corps*   un train d'impulsions À LA FRÉQUENCE D'ALLUMAGE du moteur (corpsDiv 1) : ses harmoniques sont celles du moteur, 100 % — il les RENFORCE au lieu de se battre avec elles
                (mesuré : à fire ÷ 2 une dent de scie ne pose que 25 % de son énergie sur le peigne du moteur, le reste tombe entre → flou) ; `sub` : l'octave en dessous, le poids,
                deux copies désaccordées (largeur), passe-bas, formant « o→a », saturation : un grondement qui a une HAUTEUR, qui suit le moteur, qui monte avec lui
       ronce*   chaque impulsion lance une petite flamme (grain de bruit de 5-10 ms, bande ronceF) : à 80-150 impulsions/s les grains FUSIONNENT en un ronronnement rugueux et
                calé sur le moteur — la texture « qui brûle », sans aucun clac isolé
       quinte*  une 3e voix à fire ÷ corpsDiv × 1,5 (la quinte) : l'épaisseur d'un accord de puissance */
    corpsG: 0, corpsDiv: 1, subG: 0, corpsF0min: 45, corpsW: .35, corpsSat: 2, corpsLP: 1600, ronceG: 0, ronceF: 520, ronceTau: .007, quinteG: 0,
    fwoomG: .55, fwoomF: 46,
    soupirG: .30,
    attack: .22, release: .9, spool: .8
  };
  function NitroBraise(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 4242424) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.nit = 0; this.speed = 0;
    this.a = 0; this.sp = 0; this.fl = .5; this.flT = 0; this.flTg = .5; this.vox = 0; this.voxT = 0; this.voxTg = 0;
    this.brown = 0; this.ph1 = 0; this.ph2 = 0; this.ph3 = 0; this.ph4 = 0; this.fwPh = 0;
    this.gLP = new Bq().set('lp', 330, .7, 0, this.sr); this.gFm = new Bq(); this.gFm2 = new Bq();
    this.brLP = new Bq(); this.brHP = new Bq().set('hp', 24, .7, 0, this.sr);
    this.soL = new Bq(); this.soR = new Bq(); this.soLP = [new Bq().set('lp', 2000, .6, 0, this.sr), new Bq().set('lp', 2000, .6, 0, this.sr)];
    this.grain = []; for (let k = 0; k < 8; k++) this.grain.push({ e: 0, d: .99, f: new Bq(), pan: .5 });
    this.queue = [];                     /* grains en attente : [échéance (s), amplitude, bûche ? 1 : 0] */
    this.bucheV = { e: 0, d: .999, f: new Bq(), pan: .5 };
    this.fwE = 0; this.fwT = 0; this.fwHiE = 0; this.fwLP = new Bq().set('lp', 520, .7, 0, this.sr);
    this.soupE = 0; this.soupF = new Bq().set('bp', 1200, .5, 0, this.sr);
    this.outLP = [new Bq().set('lp', this.P.outLP, .6, 0, this.sr), new Bq().set('lp', this.P.outLP, .6, 0, this.sr)];
    this.fire = 0; this.f0 = 70; this.cph = 0; this.cph2 = 0; this.cph3 = 0; this.cph4 = 0; this.subLP = new Bq(); this.cjit = 0; this.cjitT = 0; this.bzE = 0; this.bzD = .99;
    this.cpLP = [new Bq(), new Bq()]; this.cpFm = new Bq(); this.cpFm2 = new Bq(); this.bzF = new Bq(); this.qLP = new Bq();
    this.fs = [0, 0, 0]; this.flB = [new Bq(), new Bq()]; this.flBody = new Bq();   /* la FLAMME : trois hasards lisses (2,5 · 7 · 15 Hz) qui font onduler un souffle, pas un grain */
    this.t = 0; this.ctrlN = 0; this.igniteGap = 1;
    this.G = { corps: 1, ronce: 1, quinte: 1, gronde: 1, braise: 1, souffle: 1, flamme: 1, crepite: 1, buche: 1, fwoom: 1, soupir: 1 };
    this.rmsAcc = null;
  }
  const NP = NitroBraise.prototype;
  NP.ignite = function () { this.fwE = 1; this.fwT = 0; this.fwHiE = 1; this.igniteGap = 0; };
  NP.soupir = function (v) { this.soupE = v == null ? 1 : v; };
  /* un grain de braise : `a` amplitude 0..1, `big` = gros (plus long, plus grave) */
  NP.grainAt = function (a, big) {
    const sr = this.sr, v = this.grain.reduce((m, g) => g.e < m.e ? g : m);   /* la voix la plus éteinte */
    v.e = a * this.P.crepiteG;
    v.d = Math.exp(-1 / (sr * (big ? .006 + .006 * this.rnd() : .0009 + .0036 * this.rnd())));
    v.f.set('bp', big ? 520 + this.rnd() * 700 : this.P.crepiteF + this.rnd() * this.P.crepiteSpan, 1.0, 0, sr);
    v.pan = this.rnd();
  };
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    for (let i = 0; i < N; i++) {
      const prevA = this.a, tgt = clamp(this.nit, 0, 1);
      this.a += (tgt - this.a) * (1 - Math.exp(-1 / (sr * (tgt > this.a ? P.attack : P.release) + 1)));
      this.sp += (this.a - this.sp) * (1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))));
      const a = this.a, sp = this.sp, spd = clamp(this.speed, 0, 1);
      if (prevA < .05 && a >= .05 && this.igniteGap > .4) this.ignite();
      if (tgt < .05 && prevA >= .05 && this.a > .2 && sp > .25 && this.soupE < .05) this.soupir(sp);
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr; this.t += dt; this.igniteGap += dt;
        /* le souffle du feu (rapide) et la voix du formant (lente) : des cibles tirées au hasard, vers lesquelles on glisse */
        this.flT -= dt; if (this.flT <= 0) { this.flT = .15 + this.rnd() * .45; this.flTg = this.rnd(); }
        this.fl += (this.flTg - this.fl) * Math.min(1, dt * 4);
        this.voxT -= dt; if (this.voxT <= 0) { this.voxT = 1.4 + this.rnd() * 2.6; this.voxTg = this.rnd(); }
        this.vox += (this.voxTg - this.vox) * Math.min(1, dt * .9);
        const fo = 300 + 360 * this.vox;                       /* « o » 300 Hz → « a » 660 Hz */
        this.gFm.set('bp', fo, 2.2, 0, sr); this.gFm2.set('bp', fo * 2.9, 3, 0, sr);
        this.brLP.set('lp', P.braiseF * (.7 + .6 * a), .7, 0, sr);
        this.flB[0].set('bp', P.flammeF * (.85 + .3 * this.fl), .55, 0, sr); this.flB[1].set('bp', P.flammeF * (.85 + .3 * this.fl) * 1.06, .55, 0, sr); this.flBody.set('bp', P.flammeF * .38, .6, 0, sr);
        if (P.corpsG > 0 || P.ronceG > 0) {
          let f0 = (this.fire > 5 ? this.fire : 70) / P.corpsDiv; while (f0 < P.corpsF0min) f0 *= 2; while (f0 > 330) f0 /= 2;
          this.f0 += (f0 - this.f0) * Math.min(1, dt * 12);
          this.cjitT -= dt; if (this.cjitT <= 0) { this.cjitT = .05 + this.rnd() * .12; this.cjit = this.g(); }   /* le hasard de la flamme : ±0,5 % de hauteur — jamais un synthé figé */
          const lp = P.corpsLP * (.75 + .5 * a); this.cpLP[0].set('lp', lp, .7, 0, sr); this.cpLP[1].set('lp', lp, .7, 0, sr);
          const fo = 280 + 330 * this.vox; this.cpFm.set('bp', fo, 1.6, 0, sr); this.cpFm2.set('bp', fo * 2.6, 2, 0, sr); this.qLP.set('lp', 1300, .7, 0, sr); this.subLP.set('lp', 520 * (.8 + .4 * a), .7, 0, sr);
        }
        const sf = P.souffleF * (.75 + .5 * this.fl); this.soL.set('bp', sf, .6, 0, sr); this.soR.set('bp', sf * 1.09, .6, 0, sr);
        /* les grains : Poisson dont le taux suit le feu AU CARRÉ, et la pression restante (les braises s'égrènent après le lâcher) */
        const heat = Math.max(a, sp * .7), lam = P.crepiteRate * Math.pow(heat, 1.15) * (.18 + 1.9 * this.fl * this.fl) * (.7 + .5 * spd);
        if (this.rnd() < lam * dt) {
          const big = this.rnd() < P.crepiteBig, u = this.rnd(), amp = Math.pow(u, P.crepiteQueue) * (big ? 1.5 : .75) + .03;
          this.grainAt(amp, big);
          if (big) { const nq = 2 + Math.floor(this.rnd() * 4); for (let q = 0; q < nq; q++) this.queue.push([this.t + .03 + q * (.02 + .05 * this.rnd()), amp * (.5 - q * .08), 0]); }
        }
        if (this.rnd() < P.bucheRate * heat * dt * (.3 + this.fl)) this.queue.push([this.t, .8 + .4 * this.rnd(), 1]);
        for (let q = this.queue.length - 1; q >= 0; q--) {
          const e = this.queue[q];
          if (this.t >= e[0]) {
            if (e[2]) { const v = this.bucheV; v.e = e[1] * P.bucheG; v.d = Math.exp(-1 / (sr * (.014 + .012 * this.rnd()))); v.f.set('bp', 300 + this.rnd() * 180, 1.2, 0, sr); v.pan = this.rnd(); }
            else if (e[1] > .02) this.grainAt(e[1], false);
            this.queue.splice(q, 1);
          }
        }
      }
      const w = this.g(), w2 = this.g();
      /* GRONDE : seconde mineure (×1,0595) + triton (×1,414) très bas, dents de scie → passe-bas → formant glissant → saturation */
      const f0 = P.grondeF * (1 + .059 * sp);
      this.ph1 += f0 / sr; this.ph2 += f0 * 1.0595 / sr; this.ph3 += f0 * 1.4142 / sr; this.ph4 += f0 * .5 / sr;
      if (this.ph1 >= 1) this.ph1 -= 1; if (this.ph2 >= 1) this.ph2 -= 1; if (this.ph3 >= 1) this.ph3 -= 1; if (this.ph4 >= 1) this.ph4 -= 1;
      const saw = (this.ph1 * 2 - 1) + (this.ph2 * 2 - 1) * .9 + (this.ph3 * 2 - 1) * .28 + Math.sin(TAU * this.ph4) * .8;
      const low = this.gLP.p(saw * .35);
      const vx = this.gFm.p(low) * 2.2 + this.gFm2.p(low) * .9;
      const gm = Math.tanh((low * (1 - .5 * P.grondeVoix) + vx * P.grondeVoix * .5) * P.grondeSat * 2.2) * (1 - P.grondeAM * (1 - (.45 + .55 * this.fl)));
      const gronde = gm * Math.pow(a, 1.05) * P.grondeG;
      /* BRAISE */
      this.brown = (this.brown + .02 * w) / 1.02;
      const braise = this.brHP.p(this.brLP.p(this.brown * 3.4 + w * .05)) * Math.pow(a, 1.1) * P.braiseG * (.55 + .75 * this.fl);
      /* SOUFFLE */
      const sg = Math.pow(a, 1.2) * (.4 + .6 * spd) * P.souffleG * (.5 + .8 * this.fl);
      const sL = this.soLP[0].p(this.soL.p(w2)) * sg, sR = this.soLP[1].p(this.soR.p(this.g())) * sg;
      /* MATIÈRE (corps · ronce · quinte) : voir DEF */
      let cpL = 0, cpR = 0, rc = 0, qn = 0;
      if (P.corpsG > 0 || P.ronceG > 0) {
        const fz = this.f0 * (1 + .005 * this.cjit), dp = fz / sr;
        this.cph += dp; if (this.cph >= 1) { this.cph -= 1; this.bzE = .55 + .45 * this.rnd(); this.bzD = Math.exp(-1 / (sr * P.ronceTau * (.7 + .6 * this.rnd()))); this.bzF.set('bp', P.ronceF * (.7 + .6 * this.rnd()), .9, 0, sr); }   /* une impulsion = une petite flamme */
        this.cph2 += dp * 1.0035; if (this.cph2 >= 1) this.cph2 -= 1;
        this.cph3 += dp * 1.5; if (this.cph3 >= 1) this.cph3 -= 1;
        this.cph4 += dp * .5; if (this.cph4 >= 1) this.cph4 -= 1;
        const saw = (ph, d) => { let v = 2 * ph - 1; if (ph < d) { const t = ph / d; v -= t + t - t * t - 1; } else if (ph > 1 - d) { const t = (ph - 1) / d; v -= t * t + t + t + 1; } return v; };   /* dent de scie PolyBLEP : pas de repliement */
        const w = P.corpsW, p1 = saw(this.cph, dp) - saw((this.cph + w) % 1, dp), p2 = saw(this.cph2, dp * 1.0035) - saw((this.cph2 + w + .05) % 1, dp * 1.0035);
        const cA = Math.pow(a, 1.0) * P.corpsG * (.8 + .4 * this.fl);
        const body1 = this.cpLP[0].p(p1 * .8 + p2 * .35), body2 = this.cpLP[1].p(p2 * .8 + p1 * .35);
        const vx = this.cpFm.p(body1) * 1.6 + this.cpFm2.p(body1) * .6;
        cpL = Math.tanh((body1 + vx * .55) * P.corpsSat) * cA; cpR = Math.tanh((body2 + vx * .55) * P.corpsSat) * cA;
        if (this.bzE > 1e-4) { rc = this.bzF.p(this.g()) * this.bzE * 2.2 * Math.pow(a, 1.1) * P.ronceG; this.bzE *= this.bzD; }
        qn = this.qLP.p(saw(this.cph3, dp * 1.5)) * Math.pow(a, 1.2) * P.quinteG + this.subLP.p(saw(this.cph4, dp * .5) - saw((this.cph4 + .3) % 1, dp * .5)) * Math.pow(a, 1.1) * P.subG;
      }
      /* FLAMME : un souffle de bruit (bande ronde) dont l'amplitude ONDULE — somme de trois hasards lissés, élevée à la puissance 1,6 (les creux se creusent) : « fwuuf-fwuf-fwuuuf » */
      let env = 1;
      for (let j = 0; j < 3; j++) { const k = TAU * (j === 0 ? 2.5 : j === 1 ? 7 : 15) / sr; this.fs[j] += (this.g() - this.fs[j]) * k; env += P.flammeDepth * this.fs[j] / (.577 * Math.sqrt(k / 2)) * (j === 0 ? .5 : j === 1 ? .35 : .15); }
      const fe = Math.pow(Math.max(0, env), 1.6) * Math.pow(a, 1.1) * P.flammeG, fb = this.flBody.p(w) * P.flammeBody * 2.2;
      const fL = (this.flB[0].p(w2) * 2 + fb) * fe, fR = (this.flB[1].p(this.g()) * 2 + fb) * fe;
      /* CRÉPITE + BÛCHE (éteints par défaut : Sacha n'en veut plus — des claquements « qui ne marchent pas ») */
      let cL = 0, cR = 0;
      for (let k = 0; k < this.grain.length; k++) {
        const v = this.grain[k]; if (v.e > 1e-4) { const x = v.f.p(this.g()) * v.e * 2.4; v.e *= v.d; cL += x * (1 - v.pan * .65); cR += x * (.35 + v.pan * .65); }
      }
      let bu = 0, buP = .5;
      if (this.bucheV.e > 1e-4) { bu = this.bucheV.f.p(this.g()) * this.bucheV.e * 2.6; this.bucheV.e *= this.bucheV.d; buP = this.bucheV.pan; }
      /* FWOOM : un souffle qui gonfle puis retombe + un coup de poitrine qui descend */
      let fw = 0;
      if (this.fwE > 1e-4) {
        this.fwT += 1 / sr;
        const swell = (1 - Math.exp(-this.fwT / .06)) * Math.exp(-this.fwT / .55);
        const f = P.fwoomF * (1 + .9 * Math.exp(-this.fwT / .12)); this.fwPh += f / sr; if (this.fwPh >= 1) this.fwPh -= 1;
        fw = (this.fwLP.p(w) * 3.2 * swell + Math.sin(TAU * this.fwPh) * (1 - Math.exp(-this.fwT / .02)) * Math.exp(-this.fwT / .3) * .9) * P.fwoomG;
        if (this.fwT > 2.5) this.fwE = 0;
      }
      /* SOUPIR */
      let so = 0;
      if (this.soupE > 1e-4) { so = this.soupF.p(w2) * this.soupE * P.soupirG * 1.6; this.soupE *= Math.exp(-1 / (sr * .5)); }
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('gronde', gronde); q('braise', braise); q('souffle', sL); q('flamme', fL); q('corps', cpL); q('ronce', rc); q('quinte', qn); q('crepite', cL); q('buche', bu); q('fwoom', fw); q('soupir', so); }
      const base = (rc * G.ronce + qn * G.quinte) + gronde * G.gronde + braise * G.braise + fw * G.fwoom + so * G.soupir;
      let l = base + cpL * G.corps + fL * G.flamme + sL * G.souffle + cL * G.crepite + bu * G.buche * (1 - buP * .5);
      let r = base + cpR * G.corps + fR * G.flamme + sR * G.souffle + cR * G.crepite + bu * G.buche * (.5 + buP * .5);
      l = this.outLP[0].p(l); r = this.outLP[1].p(r);                      /* le velours : jamais d'aigu qui pique */
      L[off + i] = Math.tanh(l * 1.15) / 1.15 * P.master; if (R) R[off + i] = Math.tanh(r * 1.15) / 1.15 * P.master;
    }
  };
  /* LES CINQ NITROS (2026-11-09 — Sacha garde la BÛCHE pour le moteur et demande « une sélection de nitro précise ») : des réglages de `P`, rien d'autre ne change */
  const PRESETS = {
    /* (2026-11-09, 2e tour — Sacha : « juste des beaux sons de nitro, plusieurs variétés, pas de crépitement bizarre ») : plus aucun grain, de la FLAMME qui ondule */
    /* 1 · FLAMME RONDE : le souffle chaud et rond, un grondement discret dessous */
    ronde: { grondeG: .12, braiseG: .4, souffleG: .14, flammeG: .55, flammeF: 620, flammeDepth: .5, fwoomG: .55 },
    /* 2 · BRAISE ARDENTE : le lit de charbons qui rougeoie, lent, plus grave, une flamme qui respire profondément */
    ardente: { grondeG: .08, braiseG: .6, braiseF: 210, souffleG: .10, flammeG: .7, flammeF: 520, flammeBody: 1.0, flammeDepth: .65, fwoomG: .5, attack: .3 },
    /* 3 · ENFER DOUX : le grondement maléfique (seconde mineure, voix qui glisse), la flamme basse et sombre */
    enfer: { grondeG: .26, grondeF: 34, grondeSat: 2.4, grondeVoix: 1, grondeAM: .55, braiseG: .45, flammeG: .35, flammeF: 420, flammeDepth: .4, fwoomG: .7, fwoomF: 40, attack: .35, release: 1.2 },
    /* 4 · CHEMINÉE : le tirage d'air dans l'âtre — plus aérien, flamme plus vive et haute, pas de grondement */
    cheminee: { grondeG: .04, braiseG: .25, souffleG: .34, souffleF: 640, flammeG: .8, flammeF: 700, flammeBody: .35, flammeDepth: .75, fwoomG: .4, attack: .18 },
    /* 5 · DRAGON ENDORMI : une montée très lente, un grand fwoom, un grondement profond qui respire, un long soupir */
    dragon: { grondeG: .22, grondeF: 36, grondeSat: 2.0, grondeVoix: .9, grondeAM: .7, braiseG: .5, souffleG: .16, flammeG: .3, flammeF: 360, flammeDepth: .35, fwoomG: 1.0, fwoomF: 42, attack: .5, release: 1.6, spool: 1.4, soupirG: .6 },
    /* ===== LA MATIÈRE (3e tour) : le même feu, mais bâti sur une NOTE du moteur. Le vent (flamme, souffle) est presque éteint. ===== */
    /* A · FOYER : chaud, rond — le moteur renforcé, un sous-grondement à l'octave, une pointe de quinte */
    foyer: { corpsG: .45, corpsW: .35, corpsSat: 1.8, corpsLP: 1500, subG: .55, ronceG: .30, ronceF: 520, ronceTau: .006, quinteG: .10, grondeG: .06, braiseG: .22, souffleG: .03, flammeG: .10, fwoomG: .8, attack: .12, release: .7, spool: .5 },
    /* B · FORGE : plus dense et brillant — impulsion étroite (harmoniques riches), saturation plus forte, ronce plus claire */
    forge: { corpsG: .50, corpsW: .22, corpsSat: 2.6, corpsLP: 2300, subG: .40, ronceG: .45, ronceF: 760, ronceTau: .005, quinteG: .15, grondeG: .04, braiseG: .20, souffleG: .04, flammeG: .12, fwoomG: .7, attack: .10, outLP: 2800 },
    /* C · GOUFFRE : sombre — le sous-grondement domine (octave sous le moteur), passe-bas bas, voix et seconde mineure dessous, pas de quinte */
    gouffre: { corpsG: .40, corpsW: .30, corpsSat: 2.4, corpsLP: 1100, subG: 1.0, ronceG: .35, ronceF: 380, ronceTau: .010, quinteG: 0, grondeG: .18, grondeF: 34, grondeVoix: 1, grondeAM: .5, braiseG: .30, souffleG: .03, flammeG: .08, fwoomG: .9, fwoomF: 40, attack: .16, release: .9 },
    /* 6 · FOYER DE NOËL : le plus chaleureux — médium moelleux, flamme douce, grave arrondi, passe-bas plus bas */
    noel: { grondeG: .10, grondeF: 46, braiseG: .5, souffleG: .2, souffleF: 700, flammeG: .6, flammeF: 560, flammeBody: .8, flammeDepth: .4, fwoomG: .8, attack: .28, release: 1.1, soupirG: .45, outLP: 2600 }
  };
  const api = { NitroBraise, BRAISE_DEF: DEF, PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroBraiseApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
