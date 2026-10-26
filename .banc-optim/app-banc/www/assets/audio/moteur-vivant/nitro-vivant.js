/* ================= LE NITRO VIVANT (2026-10-22, session SON ; Sacha : « génère-moi un générateur de son de moteur ET de nitro où je peux tout régler ») =================
   Un nitro, c'est de la FLAMME qui rugit dans un tuyau, de l'AIR qu'on avale, et une machine (turbo, jet) qui monte en pression. Ici chaque chose a sa couche, son niveau, son réglage :
     ROAR     la flamme : bruit brun filtré, turbulent (change toutes les ~90 ms) et qui bat (flutter) — le grondement chaud, c'est lui
     SOUFFLE  l'air : bruit large filtré, de plus en plus clair avec la vitesse — le « chhhh » du vent dans le tuyau
     SIFFLET  le turbo / le jet : une bande très étroite de bruit qui MONTE avec la pression (la pression suit le nitro avec du retard : le « spool »)
     TON      le fantôme du moteur : trois harmoniques qui montent avec la pression — donne une hauteur au nitro (sans lui, ce n'est qu'un souffle)
     POPS     la flamme qui crépite : rafales de petites explosions filtrées, de plus en plus denses avec le nitro
     BOUM     l'allumage : un coup de poitrine (sinusoïde qui tombe) + un « fwoom » de souffle
     SOUPAPE  au lâcher d'un nitro installé : le « pshhh » de la soupape de décharge + le sifflet qui retombe en tremblant
   PUR (aucun DOM ni nœud audio) : même contrat que le moteur vivant — Node le rend en WAV, `worklet-nitro.js` le joue en direct. L'hôte écrit `nit` (0..1 : la gâchette),
   `speed` (0..1 : la vitesse de la caisse), et peut changer `P` (les réglages) à tout moment. */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  /* LES RÉGLAGES (le labo les expose tous) */
  const DEF = {
    master: 1,
    roarG: .55, roarF: 240, roarBody: .35, roarFlutHz: 21, roarFlut: .30, roarTurb: .45,
    hissG: .16, hissF: 2300, hissQ: .6, hissSpd: 1.0,
    whineG: .10, whineF0: 900, whineF1: 4300, whineQ: 28, whineWob: .012,
    toneG: .10, toneF0: 95, toneF1: 330, toneHarm: .5,
    popRate: 14, popG: .55, popTone: 950, popBig: .15,
    boomG: .70, boomF: 52, boomWhoosh: .50,
    bovG: .40, bovF: 4200,
    attack: .10, release: .30, spool: .60
  };
  function NitroVivant(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 7654321) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    /* ce que l'hôte écrit */
    this.nit = 0; this.speed = 0;
    /* état */
    this.a = 0; this.sp = 0; this.brown = 0; this.turb = 1; this.turbT = 1; this.turbN = 0; this.flPh = 0; this.wobPh = 0; this.tonePh = 0; this.boomPh = 0;
    this.roarLP = new Bq(); this.roarLP2 = new Bq(); this.hissL = new Bq(); this.hissR = new Bq(); this.whF = new Bq(); this.whF2 = new Bq();
    this.toneLP = new Bq().set('lp', 900, .7, 0, this.sr);
    this.popV = [0, 1].map(() => ({ e: 0, d: .99, f: new Bq(), pan: .5 }));
    this.boomE = 0; this.boomT = 0; this.whoE = 0; this.whoLP = new Bq().set('lp', 700, .7, 0, this.sr);
    this.bovE = 0; this.bovF = new Bq(); this.fluE = 0; this.fluPh = 0;
    this.ctrlN = 0; this.igniteGap = 1;
    this.G = { roar: 1, hiss: 1, whine: 1, tone: 1, pops: 1, boom: 1, bov: 1 };
    this.rmsAcc = null;
  }
  const NP = NitroVivant.prototype;
  NP.ignite = function () { this.boomE = 1; this.boomT = 0; this.whoE = 1; this.igniteGap = 0; };
  NP.pshh = function (v) { this.bovE = v == null ? 1 : v; this.fluE = this.bovE; };
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    for (let i = 0; i < N; i++) {
      const prevA = this.a;
      const tgt = clamp(this.nit, 0, 1);
      this.a += (tgt - this.a) * (1 - Math.exp(-1 / (sr * (tgt > this.a ? P.attack : P.release) + 1)));
      this.sp += (this.a - this.sp) * (1 - Math.exp(-1 / (sr * Math.max(.02, P.spool))));
      const a = this.a, sp = this.sp, spd = clamp(this.speed, 0, 1);
      /* l'allumage : le nitro monte depuis presque rien ; la soupape : il retombe vite alors que la pression est là */
      if (prevA < .06 && a >= .06 && this.igniteGap > .25) this.ignite();
      if (tgt < prevA - 1e-4 && this.a > .25 && sp > .3 && tgt < .08 && this.bovE < .05) this.pshh(sp);
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr; this.igniteGap += dt;
        this.roarLP.set('lp', P.roarF * (.7 + .6 * a), .7, 0, sr); this.roarLP2.set('hp', 28, .7, 0, sr);
        const hf = P.hissF * (.7 + .6 * spd) * (1 + .3 * a);
        this.hissL.set('bp', hf, P.hissQ, 0, sr); this.hissR.set('bp', hf * 1.07, P.hissQ, 0, sr);
        const wf = (P.whineF0 + (P.whineF1 - P.whineF0) * Math.pow(sp, 1.2)) * (1 + P.whineWob * Math.sin(this.wobPh));
        this.whF.set('bp', wf, P.whineQ, 0, sr); this.whF2.set('bp', wf * 2.01, P.whineQ, 0, sr);
        this.wobPh += dt * 31; this.turbN -= dt;
        if (this.turbN <= 0) { this.turbN = .06 + this.rnd() * .07; this.turbT = 1 + P.roarTurb * (this.rnd() * 2 - 1); }
        /* les pops : Poisson, de plus en plus denses avec le nitro et la vitesse */
        const lam = P.popRate * Math.pow(a, 1.3) * (.6 + .6 * spd);
        if (this.rnd() < lam * dt) {
          const v = this.popV[this.popV[0].e < this.popV[1].e ? 0 : 1], big = this.rnd() < P.popBig;
          v.e = (big ? 1 : .35 + .5 * this.rnd()) * P.popG; v.d = Math.exp(-1 / (sr * (big ? .03 : .006 + .014 * this.rnd())));
          v.f.set('bp', P.popTone * (big ? .55 : .6 + .9 * this.rnd()), 1.3, 0, sr); v.pan = this.rnd();
        }
        this.bovF.set('bp', P.bovF, .8, 0, sr);
      }
      this.turb += (this.turbT - this.turb) * .004;
      this.flPh += P.roarFlutHz / sr; if (this.flPh >= 1) this.flPh -= 1;
      const flut = 1 - P.roarFlut * (.5 - .5 * Math.cos(TAU * this.flPh)) * .9;
      const w = this.g(), w2 = this.g();
      this.brown = (this.brown + .02 * w) / 1.02;
      /* ROAR */
      const roar = this.roarLP2.p(this.roarLP.p(this.brown * 3.2 + w * P.roarBody * .25)) * Math.pow(a, 1.1) * P.roarG * this.turb * flut;
      /* SOUFFLE (stéréo décorrélé) */
      const hg = a * (.35 + .65 * Math.pow(spd, 1 / Math.max(.3, P.hissSpd))) * P.hissG;
      const hL = this.hissL.p(w2) * hg, hR = this.hissR.p(this.g()) * hg;
      /* SIFFLET */
      const whg = Math.pow(sp, 1.5) * P.whineG * (1 - .5 * (this.fluE > .01 ? 1 : 0));
      const wh = (this.whF.p(w) + .45 * this.whF2.p(w2)) * whg * 6;
      /* TON */
      const tf = P.toneF0 + (P.toneF1 - P.toneF0) * sp; this.tonePh += tf / sr; if (this.tonePh >= 1) this.tonePh -= 1;
      const tn = this.toneLP.p(Math.sin(TAU * this.tonePh) + P.toneHarm * Math.sin(TAU * 2 * this.tonePh) + P.toneHarm * .5 * Math.sin(TAU * 3 * this.tonePh)) * a * P.toneG;
      /* POPS */
      let pL = 0, pR = 0;
      for (let k = 0; k < 2; k++) { const v = this.popV[k]; if (v.e > 1e-4) { const x = v.f.p(this.g()) * v.e * 2; v.e *= v.d; pL += x * (1 - v.pan * .6); pR += x * (.4 + v.pan * .6); } }
      /* BOUM : sinusoïde qui tombe + fwoom */
      let bm = 0;
      if (this.boomE > 1e-4) { this.boomT += 1 / sr; const f = P.boomF * (1 + 1.3 * Math.exp(-this.boomT / .07)); this.boomPh += f / sr; bm = Math.sin(TAU * this.boomPh) * this.boomE * P.boomG; this.boomE *= Math.exp(-1 / (sr * .20)); }
      if (this.whoE > 1e-4) { bm += this.whoLP.p(w) * this.whoE * P.boomWhoosh * 2.2; this.whoE *= Math.exp(-1 / (sr * .32)); }
      /* SOUPAPE */
      let bv = 0;
      if (this.bovE > 1e-4) { bv = this.bovF.p(w2) * this.bovE * P.bovG * 1.2; this.bovE *= Math.exp(-1 / (sr * .22)); }
      if (this.fluE > 1e-4) { this.fluPh += 11 / sr; if (this.fluPh >= 1) this.fluPh -= 1; bv += this.whF.p(this.g()) * this.fluE * (this.fluPh < .5 ? 1 : .2) * P.bovG * 1.5; this.fluE *= Math.exp(-1 / (sr * .45)); }
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('roar', roar); q('hiss', hL); q('whine', wh); q('tone', tn); q('pops', pL); q('boom', bm); q('bov', bv); }
      const base = roar * G.roar + wh * G.whine + tn * G.tone + bm * G.boom + bv * G.bov;
      const l = (base + hL * G.hiss + pL * G.pops) * P.master, r = (base + hR * G.hiss + pR * G.pops) * P.master;
      L[off + i] = Math.tanh(l * 1.2) / 1.2; if (R) R[off + i] = Math.tanh(r * 1.2) / 1.2;
    }
  };
  const api = { NitroVivant, NITRO_DEF: DEF };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroVivantApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
