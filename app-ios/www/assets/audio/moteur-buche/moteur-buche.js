
















(function (root) {
  'use strict';
  const MVA = root.MoteurVivantApi || (typeof require === 'function' ? require('../moteur-vivant/moteur-vivant.js') : null);
  const CY = root.MoteurCyberApi || (typeof require === 'function' ? require('../moteur-cyber/moteur-cyber.js') : null);
  const PAL = CY.PAL, Bq = CY.Bq, blep = CY.blep, Svf = CY.Svf;
  const TAU = Math.PI * 2, clamp = (x, a, b) => x < a ? a : x > b ? b : x;

 







  const FICHE = ['v8', 'v8', 'v8', 'v8', 'v8', 'l6', 'l6', 'v8', 'l6', 'v8', 'v8', 'v8', 'flat', 'flat', 'l6', 'flat', 'flat', 'l6', 'flat',
                 'l6', 'flat', 'v8', 'v8', 'v8', 'flat', 'v8', 'flat', 'v8', 'flat', 'v8'];
  const SANTE = [.40, .55, .62, .68, .72, .75, .66, .74, .78, .70, .72, .76, .82, .86, .85, .84, .80, .78, .76, .80, .85, .70, .50, .75, .85, .72, .65, .70, .80, .68];
  const WM = PAL.map((p, i) => i < 2 ? 1 : .85);


  const CAL = [0.692,0.741,0.513,0.495,0.49,0.7,0.646,0.543,0.525,0.473,0.646,0.617,0.447,0.359,0.391,0.301,0.301,0.517,0.436,0.403,0.428,0.524,1.056,0.478,0.428,0.456,0.58,0.515,0.479,0.533];
  const WC0 = PAL.map((p, i) => (i < 19 ? .35 + .45 * i / 18 : 1) * CAL[i]); 








  const ANC = PAL.map((p, i) => i < 5 ? -12 : i < 12 ? -9 : i < 19 ? -7 : -4);
 
  const TC = [-16, -14, -12, -11, -11, -9, -11, -10, -8, -11, -12, -9, -9, -8, -8, -8, -7, -6, -6, -7, -6, -6, -6, -7, -6, -7, -6, -6, -6, -6];
  const TM = [-3, -4, -4, -4, -4, -4, -4, -4, -4, -4, -3, -3, -4, -4, -4, -4, -4, -4, -5, -4, -4, -4, -3, -4, -4, -4, -4, -4, -4, -4];
 
 
  const KC = [0.631, 0.794, 0.962, 0.944, 0.896, 0.859, 0.649, 0.843, 1.177, 0.913, 0.835, 1.119, 0.85, 1.06, 0.944, 1.211, 1.284, 1.19, 1.137, 0.7, 0.722, 0.821, 0.827, 0.688, 0.762, 0.697, 0.584, 0.779, 0.677, 0.745]; 
  const WC = WC0.map((w, i) => w * KC[i]);
 
  const WR = [3.718, 3.044, 2.631, 1.752, 1.537, 2.073, 2.22, 1.696, 2.401, 1.748, 3.048, 2.849, 1.721, 1.572, 1.965, 1.555, 1.457, 2.919, 1.639, 1.797, 1.607, 1.709, 2.308, 1.476, 1.621, 1.467, 1.129, 1.442, 1.035, 1.355];
 





  const BUCHE = [
    null, null,
  { h: [1, .5, .95, .35, .5, .2, .3], lope: .22, lfoK: .85, nzK: .5 },
  { h: [1, .55, .7, .45, .4, .3, .25, .15], lope: .16, nzK: .5 },
  { h: [1, .45, .8, .4, .55, .3, .35, .2, .12], lope: .13, lfoK: 1.1, nzK: .5 },
  { h: [1, .5, .75, .4, .45, .28, .25, .14], lope: .14, nzK: .45 },
  { h: [1, .62, .7, .6, .42, .36, .25, .18], lope: .22, lfoK: .7, nzK: .5 },
  { h: [1, .5, .78, .5, .5, .32, .3, .2, .14], lope: .15, lfoK: .95, nzK: .5 },
  { lope: .13, lfoK: 1.05, nzK: .4 },
  { lope: .30, lfoK: .65, nzK: .5 },
  { lope: .32, lfoK: .8, nzK: .5 },
  { lope: .26, lfoK: .85, nzK: .45 },
  { h: [1, .5, .85, .6, .66, .42, .5, .3, .3, .2], lope: .12, lfoK: 1.15, fq: 380, nzK: .4 },
  { h: [1, .45, .8, .6, .7, .5, .55, .38, .4, .26], lope: .09, lfoK: 1.3, fq: 400, nzK: .4 },
  { h: [1, .6, .65, .62, .54, .48, .4, .3], lope: .12, lfoK: 1.1, fq: 380, nzK: .4 },
  { h: [1, .4, .75, .55, .7, .5, .55, .4, .38], lope: .1, lfoK: 1.2, fq: 420, nzK: .38 },
  { lope: .08, lfoK: 1.45, fq: 480, nzK: .38 },
  { lope: .14, lfoK: .9, nzK: .32 },
  { h: [1, .35, .7, .25, .55, .2, .35, .12], lope: .14, lfoK: 1.3, fq: 480, nzK: .4 },
  { h: [1, .55, .4, .35, .25, .2, .15], lope: .12, lfoK: .9, fq: 300, fr: 3.4, nzK: .22 },
  { h: [1, .45, .5, .3, .3, .18], lope: .09, lfoK: 1.2, fq: 340, fr: 3.6, nzK: .22 },
  { h: [1, .7, .6, .5, .42, .36, .3, .25], lope: .2, lfoK: .75, fq: 260, fr: 3.0, nzK: .2 },
  { nzK: .4 },
  { h: [1, .6, .35, .4, .2, .25], lope: .18, lfoK: .7, fq: 300, fr: 3.2, nzK: .22 },
  { h: [1, .3, .5, .2, .3, .12], lope: .07, lfoK: 1.35, fq: 360, fr: 3.6, nzK: .22 },
  { h: [1, .5, .25, .3, .12], lope: .16, lfoK: .6, fq: 240, fr: 3.0, nzK: .2 },
  { h: [1, .4, .6, .35, .45, .3, .3], lope: .12, lfoK: 1.25, fq: 400, fr: 3.8, nzK: .25 },
  { h: [1, .65, .55, .5, .4, .35, .3, .22], lope: .22, lfoK: .85, fq: 320, fr: 3.4, nzK: .25 },
  { h: [1, .5, .6, .45, .5, .35, .35, .25, .2], lope: .11, lfoK: 1.15, fq: 420, fr: 3.8, nzK: .22 },
  { h: [1, .2, .6, .15, .4, .1, .25], lope: .13, lfoK: .65, fq: 220, fr: 3.0, nzK: .2 }
  ];
  const FB = [];
 
  function ficheBuche(ENG, lv) {
    const o = BUCHE[lv]; if (!o) return ENG[lv];
    if (!FB[lv]) { const e = Object.assign({}, ENG[lv], o); delete e.w; FB[lv] = e; }
    return FB[lv];
  }






  const NG = 180, NGP = .45;
  function noteBuche(f, lv) { return lv >= 2 && f > NG ? NG * Math.pow(f / NG, NGP) : f; }
  function retouche(P9, lv, st) {
    if (lv < 2) return P9; 
    const o = BUCHE[lv] || {}, ch = (st && st.charge) || 0, rpm = (st && st.rpm) || 0;
    P9.fF = noteBuche(P9.fF, lv); P9.subF = Math.max(22, P9.fF * .5); P9.tickF = Math.max(6, P9.fF);
    P9.lp = Math.min(P9.lp, lv < 19 ? 1700 : 1400); 
    P9.whineF = Math.min(P9.whineF, 1800); P9.transG *= .5;
    P9.nzG *= o.nzK != null ? o.nzK : .5; P9.pinkG *= .5; P9.whineG *= lv < 19 ? .55 : .4;
    if (lv >= 19) P9.tickG = Math.max(P9.tickG, .010 + .045 * ch + .015 * rpm);
    P9.lfoF = Math.min(26, Math.max(6, P9.lfoF * (o.lfoK || 1)));
    P9.lfoG = Math.min(P9.ev * .85, Math.max(P9.lfoG, P9.ev * (lv < 19 ? .32 : .28)));
    return P9;
  }
 
  const NIV = PAL.map((p, i) => { const pw = 1 + Math.pow(10, TC[i] / 10) + (TM[i] == null ? 0 : Math.pow(10, TM[i] / 10)); return Math.pow(10, (1.5 - 10 * Math.log10(pw)) / 20); });

  function MoteurBuche(sr, seed) {
    this.sr = sr = sr || 48000;
    let s = (seed || 20261109) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.hz = 40; this.rpmN = 0; this.thr = 0; this.load = 0; this.boost = 0; this.niveau = 1;
    this.rude = 0; this.lent1 = 0; this.lent2 = 0; this.gl = 0; this.glPh = 0; this.sante = 1; 
    this.boostOn = false; 
    this.lv = -1; this.P = PAL[0]; this.div = 1; this.mv = null; this.mvNom = '';
    this.f = 40; this.r = 0; this.ld = 0; this.bo = 0; this.bo0 = 0;
    this.ph = new Float64Array(6); this.magPh = 0; this.carPh = 0; this.chopPh = 0; this.lfoT = 0;
    this.svf = [new Svf(), new Svf()];
    this.fc = 400; this.fcCib = 400;
    this.combL = new Float32Array(4096); this.combR = new Float32Array(4096); this.ci = 0; this.cfL = 0; this.cfR = 0;
    this.airBp = [new Bq(), new Bq()];
    this.rawLp = [new Bq(), new Bq(), new Bq(), new Bq()]; 
    for (let b = 0; b < 4; b++) this.rawLp[b].set('lp', b < 2 ? 2600 : 3400, .6, 0, this.sr);
    this.thump = 0; this.thumpPh = 0; this.thumpF = 90;
    this.clic = 0; this.crushH = [0, 0]; this.crushN = 0;
    this.drift = 0; this.driftC = 0; this.xf = 1;
    this.rL = new Float32Array(128); this.rR = new Float32Array(128); this.mat = 1; 
    this.palier(0, 1);
  }
  const P = MoteurBuche.prototype;


  P.palier = function (lv, div) {
    lv = clamp(lv | 0, 0, PAL.length - 1); this.div = Math.max(1, div || 1);
    if (lv === this.lv) return; this.lv = lv; const p = this.P = PAL[lv];
    if (MVA) {
      const fi = FICHE[lv];
      if (!this.mv || this.mvNom !== fi) { const m = new MVA.MoteurVivant(fi, this.sr, 20261022 + lv); m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; this.mv = m; this.mvNom = fi; }
      this.mv.health = SANTE[lv]; this.sante = SANTE[lv];
    } else { this.mv = null; this.mvNom = ''; }
    for (let b = 0; b < 2; b++) this.airBp[b].set('bp', lv >= 2 ? Math.min(1500, 700 + 90 * p.peigne) + b * 70 : 900 + 140 * p.peigne + b * 90, .9, 0, this.sr); 
    this.xf = 0;
  };
  P.rapport = function () { this.clic = 1; };
 
  P.glitch = function (f) { this.gl = Math.max(this.gl, .5 + .5 * (f || 1)); };
  P.coup = function () { if (this.boostOn) { this.thump = Math.max(this.thump, .6); this.thumpF = 70; } };

 
  P.process = function (mL, mR, cL, cR, N) {
    const sr = this.sr, p = this.P, mv = this.mv, wm = WM[this.lv], wc = WC[this.lv], wr = WR[this.lv];
    if (this.rL.length < N) { this.rL = new Float32Array(N); this.rR = new Float32Array(N); }
    const rL = this.rL, rR = this.rR;
 
    if (mv && wm > 0) {
      const C = mv.cfg, thrM = this.thr;
      mv.health = clamp(this.sante * (1 - .5 * clamp(this.rude, 0, 1)), .2, 1); 
      mv.rpmCmd = clamp(this.hz * 120 / C.n, C.idle * .94, C.redline * 1.02); mv.thr = thrM; mv.load = thrM > .05 ? Math.min(1, this.load) : 0;
      mL.fill(0, 0, N); mR.fill(0, 0, N); mv.process(mL, mR, N, 0); 
      const g = wm * (.2 + .8 * this.xf);
      const gr = wr * (.2 + .8 * this.xf) * this.mat * (1 + .22 * this.lent2) * (1 + .35 * clamp(this.rude, 0, 1)); 
      const doux = this.lv >= 2, F = this.rawLp;
      for (let i = 0; i < N; i++) { let a = mL[i], b = mR[i]; if (!(a === a)) a = 0; if (!(b === b)) b = 0; mL[i] = a * g; mR[i] = b * g;
        if (doux) { a = F[2].p(F[0].p(a)); b = F[3].p(F[1].p(b)); a = Math.tanh(a * 3) / 3; b = Math.tanh(b * 3) / 3; } 
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
 
      const f0 = Math.max(8, this.f / this.div) * (1 + this.drift) * (1 + .06 * bo);
      let core = 0; const A = p.acc;
      for (let k = 0; k < A.length && k < 6; k++) {
        const fk = f0 * A[k], dt = fk / sr; let t = this.ph[k] + dt; if (t >= 1) t -= 1; this.ph[k] = t;
        core += ((2 * t - 1) - blep(t, dt)) * (k === 0 ? 1 : .55 / Math.sqrt(k));
      }
      if (p.hach) { this.chopPh += p.hach * (1 + .25 * r) / sr; if (this.chopPh >= 1) this.chopPh -= 1; core *= this.chopPh < .42 ? 1 : .08; }
      if (this.gl > .001) { this.gl *= .99985; this.glPh += 1 / sr; }
      const gk = this.gl > .001 ? this.gl * (Math.sin(this.glPh * 173) > 0 ? 1 : -1) : 0; 
      const cut = clamp((f0 * (2.2 + 9 * ld + 7 * bo + 3 * r) * (1 + .18 * this.lent1) * (1 - .45 * Math.abs(gk))) / sr * TAU, .002, .9), q = 1 / (p.q * (.7 + .5 * ld));
      let yL = this.svf[0].p(core, cut, q), yR = this.svf[1].p(core * .97, cut * 1.03, q);
      const drv = p.grain * (1 + 2.6 * ld + 2.2 * bo);
      yL = Math.tanh(yL * drv) / Math.sqrt(drv); yR = Math.tanh(yR * drv) / Math.sqrt(drv);
 
      let inv = 0;
      if (p.inv > 0) {
        const G = p.gam, st = Math.min(G.length - 1, Math.floor(r * G.length * .999));
        this.fcCib = Math.min(this.lv >= 2 ? 1500 : 2200, p.fc * G[st] * (1 + .5 * bo)); 
        this.fc += (this.fcCib - this.fc) * .0016;
        const fm = Math.min(1800, f0 * p.poles * .5); this.magPh += fm / sr; if (this.magPh >= 1) this.magPh -= 1;
        this.carPh += this.fc * (1 + .22 * gk) / sr; if (this.carPh >= 1) this.carPh -= 1;
        const mag = Math.sin(TAU * this.magPh), car = Math.sin(TAU * this.carPh + 1.6 * Math.sin(TAU * this.magPh));
        inv = (mag * .35 + car * .65) * p.inv * (.25 + .75 * ld + .6 * bo) * (.35 + .65 * Math.min(1, r * 1.6));
      }
 
      let aL = 0, aR = 0;
      if (p.air > 0) {
        const nz = this.rnd() * 2 - 1, fComb = Math.max(20, f0 * p.peigne * .5), D = clamp(Math.round(sr / fComb), 8, 4000), D2 = clamp(Math.round(D * 1.013), 8, 4090);
        const ci = this.ci, rL = this.combL[(ci - D + 4096) & 4095], rR = this.combR[(ci - D2 + 4096) & 4095];
        const fb = .62 + .25 * ld + .08 * bo;
        this.cfL = this.cfL * .4 + rL * .6; this.cfR = this.cfR * .4 + rR * .6;
        this.combL[ci] = nz * .5 + this.cfL * fb; this.combR[ci] = nz * .5 + this.cfR * fb; this.ci = (ci + 1) & 4095;
        const ga = p.air * (.15 + .55 * Math.pow(r, 1.3) + .35 * ld + .5 * bo) * .3 * (1 + .3 * this.lent2) * .45; 
        aL = this.airBp[0].p(this.combL[ci]) * ga; aR = this.airBp[1].p(this.combR[ci]) * ga;
      }
 
      let th = 0;
      if (this.thump > .001) { this.thumpF += (34 - this.thumpF) * .00012; this.thumpPh += this.thumpF / sr; if (this.thumpPh >= 1) this.thumpPh -= 1; th = Math.sin(TAU * this.thumpPh) * this.thump * .7; this.thump *= .99993; }
 
      let ck = 0;
      if (this.clic > .001) { ck = Math.sin(TAU * (380 + 900 * this.clic) * (1 - this.clic) * .05) * this.clic * .10; this.clic *= .9985; }
      const g = wc * (.2 + .8 * this.xf) * this.niveau * (1 + .2 * this.lent1) * (1 - .5 * Math.abs(gk)); 
      yL = (yL * .42 + inv * .5 + aL) * g + th + ck + rL[i] * this.niveau; yR = (yR * .42 + inv * .5 + aR) * g + th + ck + rR[i] * this.niveau;
      if (p.crush) { if (++this.crushN >= 1 + Math.round(p.crush * 6)) { this.crushN = 0; const qn = 24 - p.crush * 18; this.crushH[0] = Math.round(yL * qn) / qn; this.crushH[1] = Math.round(yR * qn) / qn; } yL = yL * (1 - p.crush * .6) + this.crushH[0] * p.crush * .6; yR = yR * (1 - p.crush * .6) + this.crushH[1] * p.crush * .6; }
      if (!(yL === yL)) yL = 0; if (!(yR === yR)) yR = 0;
      cL[i] = yL; cR[i] = yR;
    }
  };

  const api = { MoteurBuche, WM, WC, WC0, WR, KC, NIV, TC, TM, FICHE, SANTE, BUCHE, ficheBuche, retouche, noteBuche };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MoteurBucheApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
