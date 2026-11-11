















(function (root) {
  'use strict';
  const MVA = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = MVA.Bq, clamp = MVA.clamp, TAU = Math.PI * 2;
  const DEF = { master: 1, aspiG: .16, coupG: .12, chantG: .11, chantT: 2.2, chantSeuil: .3, tintG: .028, roueG: .055, rupteurG: .09, clonkG: .3, transfertG: .1, diffG: .035, outLP: 3200 };
  function blep(t, dt) { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; }
  function DetailsConduite(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 4242) >>> 0; this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.f0 = 0; this.thr = 0; this.load = 0; this.air = 0; this.vir = 0; this.speed = 0;
    this.G = { aspi: 1, coup: 1, chant: 1, tint: 1, roue: 1, rupteur: 1, clonk: 1, transfert: 1, diff: 1 };
    this.fS = 80; this.ph = 0; this.ctrlN = 0;
    this.thrP = 0; this.thrT = 0; this.offT = 9; this.eff = 0; this.effMax = 0; this.airP = 0; this.airT = 0; this.solT = 9;
 
    this.asE = 0; this.asA = 0; this.asF = new Bq().set('bp', 420, 2, 0, this.sr); this.cgE = 0; this.cgPh = 0; this.cgF = 60; this.cgT = 0;
 
    this.chA = 0; this.chT = 0; this.ch1 = new Bq().set('bp', 620, 6, 0, this.sr); this.ch2 = new Bq().set('bp', 930, 7, 0, this.sr); this.chB = 0;
 
    this.tiQ = []; this.tiT = 0; this.ti = []; for (let k = 0; k < 3; k++) this.ti.push({ e: 0, ph: 0, f: 2000, pan: .5, d: .99 });
 
    this.roA = 0; this.roPh = 0; this.roF = new Bq().set('bp', 700, 3, 0, this.sr); this.ruPh = 0; this.ruF = new Bq().set('bp', 300, 2, 0, this.sr); this.ruA = 0;
 
    this.clE = 0; this.clP1 = 0; this.clP2 = 0; this.clA = 0;
 
    this.virS = 0; this.cote = 0; this.coteT = 9; this.agit = 0; this.trE = 0; this.trPh = 0; this.trPan = 0; this.trA = 0; this.dfN = 0; this.dfT = 0; this.dfE = 0; this.dfPh = 0; this.dfPan = 0;
    this.lp = [new Bq().set('lp', this.P.outLP, .7, 0, this.sr), new Bq().set('lp', this.P.outLP, .7, 0, this.sr)];
    this.idle = 0; this.dort = false; this.garde = .4;
  }
  const DC = DetailsConduite.prototype;
  DC.setG = function (k, v) { this.G[k] = v; };
  DC.coupe = function () { this.asE = 0; this.cgE = 0; this.chA = 0; this.chT = 0; this.tiQ.length = 0; for (const t of this.ti) t.e = 0; this.roA = 0; this.ruA = 0; this.clE = 0; this.trE = 0; this.dfN = 0; this.dfE = 0; this.eff = 0; this.effMax = 0; this.agit = 0; this.garde = .4; };
 
  DC.gestes = function (dt) {
    const P = this.P, thr = this.thr > .5 ? 1 : 0, air = this.air > .5 ? 1 : 0, f0 = this.fS, v = clamp(this.speed, 0, 1);
 
    if (this.garde > 0) { this.garde -= dt; this.thrP = thr; this.airP = air; this.thrT = 1; this.offT = 0; this.airT = 0; this.cote = 0; return; }
 
    if (thr && !this.thrP) { if (!air && v > .04 && this.offT > .12) { this.asE = 1; this.asA = clamp(.45 + .55 * Math.min(1, this.offT / 1.2), 0, 1); } this.thrT = 0; }
    if (!thr && this.thrP) {
      if (!air && this.thrT < .5 && this.thrT > .05 && v > .04) { this.cgE = 1; this.cgT = 0; this.cgPh = 0; this.cgF = clamp(f0 * .5, 28, 110); }
      if (this.effMax > .75 && !air) { const n = 3 + Math.round(5 * this.rnd() * this.effMax); let t = .25 + .3 * this.rnd(); this.tiQ.length = 0; for (let k = 0; k < n; k++) { this.tiQ.push(t); t = (.12 + .25 * this.rnd()) * Math.pow(1.35, k); } this.tiT = 0; }
      this.effMax = 0; this.offT = 0;
    }
    if (thr) this.thrT += dt; else this.offT += dt;
    this.thrP = thr;
 
    const cible = thr && !air ? clamp(this.load, 0, 1) : 0; 
    this.eff += (cible - this.eff) * Math.min(1, dt / (cible > this.eff ? P.chantT : .45)); if (this.eff > this.effMax) this.effMax = this.eff;
    this.chT = clamp((this.eff + this.chB - P.chantSeuil) / (1 - P.chantSeuil), 0, 1); this.chT *= this.chT; this.chB *= Math.exp(-dt / .5);
 
    if (air && !this.airP) { this.airT = 0; this.roPh = 0; }
    if (!air && this.airP) { if (this.airT > .22) { this.clE = 1; this.clP1 = 0; this.clP2 = 0; this.clA = clamp(.35 + .5 * this.airT, .35, 1); this.chB = .55 * this.clA; } this.solT = 0; }
    if (air) this.airT += dt; else this.solT += dt;
    this.airP = air;
 
    if (this.tiQ.length) { this.tiT += dt; if (this.tiT >= this.tiQ[0]) { this.tiT = 0; this.tiQ.shift(); let t = this.ti[0]; for (const x of this.ti) if (x.e < t.e) t = x; t.e = .5 + .5 * this.rnd(); t.ph = 0; t.f = 1500 + 800 * this.rnd(); t.pan = this.rnd(); t.d = Math.exp(-1 / (this.sr * (.004 + .005 * this.rnd()))); } }
 
    this.virS += (clamp(this.vir, -1, 1) - this.virS) * Math.min(1, dt * 30); this.coteT += dt; this.agit *= Math.exp(-dt / 1.2);
    const c = this.virS > .35 ? 1 : this.virS < -.35 ? -1 : 0;
    if (c && c !== this.cote) {
      if (this.cote && this.coteT < .8 && !air && v > .18) { this.agit = Math.min(1, this.agit + .34); this.trE = 1; this.trPh = 0; this.trPan = c; this.trA = .5 + .5 * this.agit;
        if (this.agit > .55 && this.dfN <= 0) { this.dfN = 4 + (this.rnd() * 3 | 0); this.dfT = .03; this.dfPan = c; } }
      this.cote = c; this.coteT = 0;
    }
    if (this.dfN > 0) { this.dfT -= dt; if (this.dfT <= 0) { this.dfT = 1 / 28 * (.9 + .2 * this.rnd()); this.dfN--; this.dfE = .6 + .4 * this.rnd(); this.dfPh = 0; } }
  };
  DC.vivant = function () {
    if (this.asE > 1e-4 || this.cgE > 1e-4 || this.chA > 1e-4 || this.chT > 1e-4 || this.tiQ.length || this.roA > 1e-4 || this.ruA > 1e-4 || this.clE > 1e-4 || this.trE > 1e-4 || this.dfN > 0 || this.dfE > 1e-4 || this.air > .5) return true;
    for (const t of this.ti) if (t.e > 1e-4) return true;
    return false;
  };
 
  DC.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, dS = 1 / sr; off = off || 0;
    const kF0 = 1 - Math.exp(-1 / (sr * .02));
 
    if (this.dort) { this.fS = this.f0 > 8 ? Math.min(this.f0, 700) : 80; this.gestes(N * dS); if (!this.vivant()) return; this.dort = false; this.idle = 0; }
    for (let i = 0; i < N; i++) {
      this.fS += ((this.f0 > 8 ? Math.min(this.f0, 700) : 80) - this.fS) * kF0;
      const f0 = this.fS;
      if ((this.ctrlN++ & 63) === 0) this.gestes(64 * dS);
      this.ph += f0 * dS; if (this.ph >= 1) this.ph -= 1;
      const dph = f0 * dS, scie = 2 * this.ph - 1 - blep(this.ph, dph); 
      let m = 0, l = 0, r = 0;
 
      if (this.asE > 1e-4) { const e = this.asE; this.asE *= .99975; const a = (1 - e) * 60; m += this.asF.p(scie) * e * (a > 1 ? 1 : a) * this.asA * P.aspiG * G.aspi * 2; if (e < .02) this.asE = 0; } 
 
      if (this.cgE > 1e-4) { this.cgT += dS; const T = this.cgT, e = (1 - Math.exp(-T / .008)) * Math.exp(-T / .07); this.cgPh += this.cgF * (1 - .15 * Math.min(1, T / .12)) * dS;
        m += Math.sin(TAU * this.cgPh) * e * P.coupG * G.coup; if (T > .5) this.cgE = 0; }
 
      this.chA += (this.chT - this.chA) * .0006;
      if (this.chA > 1e-4) m += (this.ch1.p(scie) + this.ch2.p(scie) * .55) * this.chA * P.chantG * G.chant * 3;
 
      for (let k = 0; k < 3; k++) { const t = this.ti[k]; if (t.e > 1e-4) { t.ph += t.f * dS; const x = Math.sin(TAU * t.ph) * t.e * P.tintG * G.tint; t.e *= t.d; l += x * (1 - t.pan); r += x * t.pan; } }
 
      const enVol = this.airP === 1, roT = enVol ? 1 : 0; this.roA += (roT - this.roA) * (enVol ? .0004 : .0012);
      if (this.roA > 1e-4) {
        const T = this.airT, fw = (38 + 70 * clamp(this.speed, 0, 1)) * (1 + .35 * (1 - Math.exp(-T / .25))) * (.9 + .1 * Math.exp(-T / 2)) * 4; 
        this.roPh += fw * dS; if (this.roPh >= 1) this.roPh -= 1;
        m += this.roF.p(2 * this.roPh - 1 - blep(this.roPh, fw * dS)) * this.roA * P.roueG * G.roue * (.6 + .4 * Math.exp(-T / 1.5));
      }
      const ruT = enVol && this.thr > .5 && this.airT > .3 ? 1 : 0; this.ruA += (ruT - this.ruA) * .002;
      if (this.ruA > 1e-4) { this.ruPh += 12.3 * dS; if (this.ruPh >= 1) this.ruPh -= 1; const g = this.ruPh < .55 ? 1 : 0; this.ruG = (this.ruG || 0) + (g - (this.ruG || 0)) * .01;
        m += this.ruF.p(scie) * this.ruG * this.ruA * P.rupteurG * G.rupteur * 2; }
 
      if (this.clE > 1e-4) { const e = this.clE; this.clE *= .99965; this.clP1 += 95 * (.8 + .2 * e) * dS; this.clP2 += 410 * dS;
        m += (Math.sin(TAU * this.clP1) * e + Math.sin(TAU * this.clP2) * e * e * e * e * .5) * (1 - Math.exp(-(1 - e) * 400)) * this.clA * P.clonkG * G.clonk; }
 
      if (this.trE > 1e-4) { const e = this.trE; this.trE *= .9993; this.trPh += (52 + 18 * e) * dS; const x = Math.sin(TAU * this.trPh) * e * (1 - Math.exp(-(1 - e) * 300)) * this.trA * P.transfertG * G.transfert;
        l += x * (1 - .5 * this.trPan); r += x * (1 + .5 * this.trPan); }
      if (this.dfE > 1e-4) { const e = this.dfE; this.dfE *= .997; this.dfPh += 600 * dS; const x = Math.sin(TAU * this.dfPh) * e * P.diffG * G.diff; l += x * (1 - .4 * this.dfPan); r += x * (1 + .4 * this.dfPan); }
      l = this.lp[0].p(l + m); r = this.lp[1].p(r + m);
      L[off + i] += l * P.master; if (R) R[off + i] += r * P.master;
    }
    if (!this.vivant()) { this.idle += N; if (this.idle > sr * .3) this.dort = true; } else this.idle = 0;
  };
  const api = { DetailsConduite, DETAILS_DEF: DEF };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DetailsConduiteApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
