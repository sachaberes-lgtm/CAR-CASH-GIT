









(function (root) {
  'use strict';
  const NMa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-matiere.js') : root.NitroMatiereApi;
  const NFa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-fusee.js') : root.NitroFuseeApi;
  const TAU = Math.PI * 2, clamp = (x, a, b) => x < a ? a : x > b ? b : x;
 
  const SANS_NOTE = { coreG: 0, subG: 0, growlG: 0, dropG: 0, shockG: 0, thumpG: .3, sweepG: .22, roarG: .22 };
  function NitroHybride(sr, seed, P) {
    P = P || {}; this.sr = sr || 48000; this.isHybride = true;
    this.m = new NMa.NitroMatiere(this.sr, 31337, P.m || NMa.PRESETS.meca);
    this.f = new NFa.NitroFusee(this.sr, 5151515, Object.assign({}, P.f || NFa.FLAMMES.bruleur, SANS_NOTE, P.fOver || {}));
    this.mixM = P.mixM == null ? 1 : P.mixM; this.mixF = P.mixF == null ? .9 : P.mixF;
    this.nit = 0; this.speed = 0; this.f0 = 0; this.fire = 0;
    this.tm = [new Float32Array(1024), new Float32Array(1024)]; this.tf = [new Float32Array(1024), new Float32Array(1024)];
    this.rmsAcc = null;
  }
  const NP = NitroHybride.prototype;
  Object.defineProperty(NP, 'a', { get() { return this.m.a; } }); Object.defineProperty(NP, 'sp', { get() { return this.m.sp; } });
  NP.ignite = function () { this.m.ignite(); this.f.ignite(); };
 
  NP.setP = function (k, v) { if (k === 'mixM' || k === 'mixF') this[k] = v; else if (k.indexOf('f_') === 0) this.f.P[k.slice(2)] = v; else this.m.P[k] = v; };
  NP.setG = function (k, v) { if (k.indexOf('f_') === 0) this.f.G[k.slice(2)] = v; else this.m.G[k] = v; };
  NP.process = function (L, R, N, off) {
    off = off || 0; if (this.tm[0].length < N) { this.tm = [new Float32Array(N), new Float32Array(N)]; this.tf = [new Float32Array(N), new Float32Array(N)]; }
    const m = this.m, f = this.f; m.nit = f.nit = this.nit; m.speed = f.speed = this.speed; m.f0 = this.f0; m.fire = this.fire || this.f0;
    m.process(this.tm[0], this.tm[1], N, 0); f.process(this.tf[0], this.tf[1], N, 0);
    for (let i = 0; i < N; i++) {
 
      const fe = this.mixF * Math.pow(clamp(m.sp * .6 + m.a * .4, 0, 1), .8);
      L[off + i] = Math.tanh(this.tm[0][i] * this.mixM + this.tf[0][i] * fe); if (R) R[off + i] = Math.tanh(this.tm[1][i] * this.mixM + this.tf[1][i] * fe);
    }
  };
  const PRESETS = {
 
    bruleur: { m: NMa.PRESETS.meca, f: Object.assign({}, NFa.FLAMMES.bruleur, { airG: .14, airF: 1500, outLP: 2000 }), mixM: 1, mixF: .9 },
 
    flambee: { m: NMa.PRESETS.meca, f: Object.assign({}, NFa.FLAMMES.flambee, { airG: .16, airF: 1500, outLP: 2000 }), mixM: 1, mixF: .95 },
 
    dragon: { m: Object.assign({}, NMa.PRESETS.meca, { grondeG: .3, subG: .7, rapeG: .6, outLP: 2600 }), f: NFa.FLAMMES.souffle, mixM: 1, mixF: .85 }
  };
  const api = { NitroHybride, HYBRIDE_PRESETS: PRESETS, SANS_NOTE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroHybrideApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
