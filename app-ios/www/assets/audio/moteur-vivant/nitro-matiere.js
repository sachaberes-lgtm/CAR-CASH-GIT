

























(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  const DEF = {
    master: 1,
    corpsG: .55, detune: .0035, subG: .5, gorge: [[180, 1.6, 1.0], [430, 1.8, .8], [950, 2.2, .45]], gorgeDry: .55,
    driveLo: 1.3, driveHi: 3.2,
    rapeG: .4, rapeDrive: 22, rapeDecay: 7, rapeJit: .6, rapeQ: .9, rapeLo: 600, rapeHi: 1600,
    poingG: .42, poingSat: 2.2,
    tirageG: .14, tirageFold: 170, larg: .5, flick: .22, quinteG: 0, oct: 1,
    grondeG: 0, grondeSat: 2.2, grondeAM: .5,
    fwoomG: .45, fwoomF: 52, soupirG: .22,
    outLP: 2400, outOrder: 2, hp: 38,
    attack: .12, release: .55, spool: .7
  };
  function NitroMatiere(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 31337) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.nit = 0; this.speed = 0; this.f0 = 0;
    this.a = 0; this.sp = 0; this.fS = 80; 
    this.ph = 0; this.phC = 0; this.phU = 0; this.phD = 0; this.phS = 0; this.phQ = 0; this.phP = 0; this.rapeAmp = 1; this.rapeAmpR = 1; this.rEnv = 1; this.cA05 = 0; this.cA1 = 0; this.cS16 = 0; this.cFold = 1; this.cRd = 1;
    this.gF = this.P.gorge.map(() => new Bq()); this.corpsLP = new Bq(); this.corpsLP2 = new Bq(); this.sideLP = new Bq().set('lp', 1300, .7, 0, this.sr);
    this.raL = new Bq(); this.raR = new Bq(); this.raL2 = new Bq(); this.raR2 = new Bq();
    this.poingLP = new Bq();
    this.hp = [new Bq().set('hp', this.P.hp, .7, 0, this.sr), new Bq().set('hp', this.P.hp, .7, 0, this.sr)];
    this.outLP = [new Bq().set('lp', this.P.outLP, .6, 0, this.sr), new Bq().set('lp', this.P.outLP, .6, 0, this.sr)]; this.outLPb = [new Bq().set('lp', this.P.outLP, .7, 0, this.sr), new Bq().set('lp', this.P.outLP, .7, 0, this.sr)]; this.outF = this.P.outLP;
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
 
  function blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; }
  function saw(ph, dt) { return 2 * ph - 1 - blep(ph, dt); }
 
  function th(x) { if (x > 3) return 1; if (x < -3) return -1; const x2 = x * x; return x * (945 + x2 * (105 + x2)) / (945 + x2 * (420 + 15 * x2)); }
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    const kAtk = 1 - Math.exp(-1 / (sr * P.attack + 1)), kRel = 1 - Math.exp(-1 / (sr * P.release + 1)), kSp = 1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))), kF0 = 1 - Math.exp(-1 / (sr * .02)); 
    for (let i = 0; i < N; i++) {
      const prevA = this.a, tgt = clamp(this.nit, 0, 1);
      this.a += (tgt - this.a) * (tgt > this.a ? kAtk : kRel);
      this.sp += (this.a - this.sp) * kSp;
      const a = this.a, sp = this.sp, spd = clamp(this.speed, 0, 1);
      if (prevA < .05 && a >= .05 && this.igniteGap > .4) this.ignite();
      if (tgt < .05 && prevA >= .05 && this.a > .2 && sp > .25 && this.soupE < .05) this.soupir(sp);
      this.fS += ((this.f0 > 8 ? this.f0 : 80) - this.fS) * kF0; 
      const f0 = this.fS;
      if ((this.ctrlN & 15) === 0) { 
        this.cA05 = Math.pow(a, 1.05); this.cA1 = Math.pow(a, 1.1); this.cS16 = Math.pow(sp, 1.6); this.cFold = 1 / (1 + (f0 / P.tirageFold) * (f0 / P.tirageFold)); this.cRd = Math.exp(-f0 / sr * P.rapeDecay);
      }
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr; this.igniteGap += dt;
        for (let k = 0; k < P.gorge.length; k++) this.gF[k].set('bp', P.gorge[k][0], P.gorge[k][1], 0, sr);
 
        this.corpsLP.set('lp', clamp(700 + 1700 * sp + 5 * f0, 600, 4200), .7, 0, sr); this.corpsLP2.set('lp', clamp(1100 + 2300 * sp + 6 * f0, 900, 5000), .7, 0, sr);
        const rc = clamp(P.rapeLo + 3.2 * f0 + 500 * sp, P.rapeLo, P.rapeHi);
        this.raL.set('bp', rc, P.rapeQ, 0, sr); this.raR.set('bp', rc * 1.07, P.rapeQ, 0, sr); this.raL2.set('bp', rc * .55, 1.2, 0, sr); this.raR2.set('bp', rc * .6, 1.2, 0, sr);
        this.poingLP.set('lp', clamp(2.2 * f0 + 120, 160, 700), .7, 0, sr);
        if (P.outLP !== this.outF) { this.outF = P.outLP; for (let c = 0; c < 2; c++) { this.outLP[c].set('lp', P.outLP, .6, 0, sr); this.outLPb[c].set('lp', P.outLP, .7, 0, sr); } }
        this.flT -= dt; if (this.flT <= 0) { this.flT = .15 + this.rnd() * .45; this.flTg = this.rnd(); } this.fl += (this.flTg - this.fl) * Math.min(1, dt * 4);
        this.voxT -= dt; if (this.voxT <= 0) { this.voxT = 1.4 + this.rnd() * 2.6; this.voxTg = this.rnd(); } this.vox += (this.voxTg - this.vox) * Math.min(1, dt * .9);
        const fo = 300 + 360 * this.vox; this.gFm.set('bp', fo, 2.2, 0, sr); this.gFm2.set('bp', fo * 2.9, 3, 0, sr);
        let gb = f0; while (gb > 110) gb *= .5; while (gb < 38) gb *= 2; this.gBase += (gb - this.gBase) * Math.min(1, dt * 10);
      }
 
      const dph = f0 / sr, dc = dph * P.oct; this.ph += dph; this.phC += dc; this.phU += dc * (1 + P.detune); this.phD += dc * (1 - P.detune); this.phS += dc * .5; this.phQ += dc * 1.5; this.phP += dph;
      if (this.ph >= 1) { this.ph -= 1; this.rapeAmp = 1 - P.rapeJit * this.rnd(); this.rapeAmpR = 1 - P.rapeJit * this.rnd(); this.rEnv = Math.exp(-this.ph * P.rapeDecay); } else this.rEnv *= this.cRd;
      if (this.phC >= 1) this.phC -= 1; if (this.phQ >= 1) this.phQ -= 1; if (this.phU >= 1) this.phU -= 1; if (this.phD >= 1) this.phD -= 1; if (this.phS >= 1) this.phS -= 1; if (this.phP >= 1) this.phP -= 1;
      const w = this.g(), wR = this.g();
 
      const fk = 1 - P.flick * (1 - this.fl);
 
      const sU = saw(this.phU, dc * (1 + P.detune)), sD = saw(this.phD, dc * (1 - P.detune));
      const raw = saw(this.phC, dc) * .8 + sU * .6 + sD * .6 + saw(this.phS, dc * .5) * P.subG + (P.quinteG > 0 ? saw(this.phQ, dc * 1.5) * P.quinteG : 0);
      const lp = this.corpsLP2.p(this.corpsLP.p(raw)) * .55;
      let gs = lp * P.gorgeDry; for (let k = 0; k < this.gF.length; k++) gs += this.gF[k].p(lp) * P.gorge[k][2] * 1.6;
      const drive = P.driveLo + (P.driveHi - P.driveLo) * sp;
      const a05 = this.cA05, a1 = this.cA1;
      const corps = th(gs * drive) * a05 * P.corpsG * fk, side = this.sideLP.p(sU - sD) * P.larg * a05 * P.corpsG * .6; 
 
      const env = this.rEnv;
      const rg = a1 * (.5 + .5 * spd) * P.rapeG * (.45 + .55 * sp);
      const rL = th((this.raL.p(w) + this.raL2.p(w) * .7) * P.rapeDrive * env * this.rapeAmp) * rg, rR = th((this.raR.p(wR) + this.raR2.p(wR) * .7) * P.rapeDrive * env * this.rapeAmpR) * rg;
 
      const s1 = Math.sin(TAU * this.phP), c1 = Math.cos(TAU * this.phP), s2 = 2 * s1 * c1, s3 = s1 * (3 - 4 * s1 * s1); 
      const poing = th(this.poingLP.p(s1 + .45 * s2) * P.poingSat) * a1 * P.poingG * fk;
 
      const tirage = (s2 * .6 + s3 * .35) * this.cS16 * a * P.tirageG * fk * this.cFold;
 
      let gronde = 0;
      if (P.grondeG > 0) {
        const gf = this.gBase * (1 + .059 * sp); this.gP1 += gf / sr; this.gP2 += gf * 1.0595 / sr; this.gP3 += gf * 1.4142 / sr;
        if (this.gP1 >= 1) this.gP1 -= 1; if (this.gP2 >= 1) this.gP2 -= 1; if (this.gP3 >= 1) this.gP3 -= 1;
        const glow = this.gLP.p(((this.gP1 * 2 - 1) + (this.gP2 * 2 - 1) * .9 + (this.gP3 * 2 - 1) * .28) * .35), gv = this.gFm.p(glow) * 2.2 + this.gFm2.p(glow) * .9;
        gronde = th((glow * .7 + gv * .3) * P.grondeSat * 2.2) * (1 - P.grondeAM * (1 - (.45 + .55 * this.fl))) * a05 * P.grondeG;
      }
 
      let fw = 0;
      if (this.fwE > 1e-4 && P.fwoomG > 0) {
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
      let l = base + rL * G.rape + side * G.corps, r = base + rR * G.rape - side * G.corps;
      l = this.outLP[0].p(this.hp[0].p(l)); r = this.outLP[1].p(this.hp[1].p(r)); if (P.outOrder > 1) { l = this.outLPb[0].p(l); r = this.outLPb[1].p(r); } 
      L[off + i] = th(l * 1.1) / 1.1 * P.master; if (R) R[off + i] = th(r * 1.1) / 1.1 * P.master;
    }
  };
  const PRESETS = {
 
    matiere: {},
 
    plus: { corpsG: .6, driveLo: 1.8, driveHi: 4.0, rapeG: .6, rapeDrive: 30, rapeDecay: 6, tirageG: .2, poingG: .5, outLP: 3000, larg: .65 },
 
    chaud: { corpsG: .62, subG: .85, rapeG: .22, rapeDecay: 8, poingG: .55, tirageG: .08, driveLo: 1.2, driveHi: 2.4, outLP: 2000, quinteG: .12, larg: .6 },
 
    enfer: { grondeG: .34, corpsG: .5, subG: .7, rapeG: .26, rapeDecay: 8, poingG: .5, tirageG: .08, driveLo: 1.4, driveHi: 3.4, outLP: 2200, release: .8, flick: .3 },
 
    meca: { corpsG: .5, subG: .45, rapeG: .75, rapeDrive: 26, rapeDecay: 9, rapeJit: .5, rapeLo: 700, rapeHi: 2000, poingG: .62, poingSat: 2.8, tirageG: .3, tirageFold: 260, driveLo: 1.5, driveHi: 3.8, larg: .4, flick: .08, quinteG: .08, outLP: 3000, attack: .08, release: .5, spool: .6 },
 
    premier: { tirageG: .22, tirageFold: 1e9, larg: 0, flick: 0, rapeLo: 800, rapeHi: 2600, outLP: 5200, outOrder: 1 }
  };
  const api = { NitroMatiere, MATIERE_DEF: DEF, PRESETS, th };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroMatiereApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
