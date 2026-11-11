/* ================= LE NITRO HYBRIDE : MÉCANIQUE + FLAMME (2026-11-09, 6e tour ; Sacha : « nitro bien mécanique, flamme, variation en fonction de à quel point on appuie ») =================
   Deux voix qui se complètent, jouées ensemble par une seule paire de mains :
     MÉCANIQUE   `nitro-matiere.js` (preset `meca`) : calée sur la cadence d'allumage du moteur (`f0`) — corps saturé, râpe coup par coup, poing grave, plainte de compresseur.
                 C'est ce qui l'accroche au moteur : ses harmoniques tombent sur les siennes.
     FLAMME      `nitro-fusee.js` (les flammes du 5e tour) SANS sa note ni son sous-grave (ils doubleraient la mécanique et ne suivent pas le moteur) : le corps de flamme qui ondule,
                 les langues, l'air chaud qui flotte, la chambre, les coups de combustion qui font pulser le tout.
   L'APPUI (`nit`, 0..1 : à quel point on appuie) fait varier les DEUX, et pas de la même façon :
     appui léger  → surtout la mécanique : un ronron serré qui accompagne le moteur, une flamme à peine allumée (gain de flamme = appui^0,8 × mixF)
     appui plein  → la mécanique durcit (saturation, râpe, plainte montent avec la pression `sp`) et la flamme s'ouvre en grand (langues plus vives, air, chambre)
   Même contrat que les autres : l'hôte écrit `nit`, `speed`, `f0` ; PUR (aucun DOM). Les réglages se passent avec un préfixe : `f_flameG` = la flamme, sans préfixe = la mécanique ; `mixM`, `mixF` = l'équilibre. */
(function (root) {
  'use strict';
  const NMa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-matiere.js') : root.NitroMatiereApi;
  const NFa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-fusee.js') : root.NitroFuseeApi;
  const TAU = Math.PI * 2, clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  /* la flamme sans sa note : le squelette de combustion (coups, langues, air) reste, la note et le sous-grave partent */
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
  /* règle un paramètre : `f_x` = flamme, `mixM`/`mixF` = équilibre, le reste = mécanique */
  NP.setP = function (k, v) { if (k === 'mixM' || k === 'mixF') this[k] = v; else if (k.indexOf('f_') === 0) this.f.P[k.slice(2)] = v; else this.m.P[k] = v; };
  NP.setG = function (k, v) { if (k.indexOf('f_') === 0) this.f.G[k.slice(2)] = v; else this.m.G[k] = v; };
  NP.process = function (L, R, N, off) {
    off = off || 0; if (this.tm[0].length < N) { this.tm = [new Float32Array(N), new Float32Array(N)]; this.tf = [new Float32Array(N), new Float32Array(N)]; }
    const m = this.m, f = this.f; m.nit = f.nit = this.nit; m.speed = f.speed = this.speed; m.f0 = this.f0; m.fire = this.fire || this.f0;
    m.process(this.tm[0], this.tm[1], N, 0); f.process(this.tf[0], this.tf[1], N, 0);
    for (let i = 0; i < N; i++) {
      /* la flamme s'ouvre avec la pression de la mécanique : appui léger = flamme à peine allumée */
      const fe = this.mixF * Math.pow(clamp(m.sp * .6 + m.a * .4, 0, 1), .8);
      L[off + i] = Math.tanh(this.tm[0][i] * this.mixM + this.tf[0][i] * fe); if (R) R[off + i] = Math.tanh(this.tm[1][i] * this.mixM + this.tf[1][i] * fe);
    }
  };
  const PRESETS = {
    /* MÉCANIQUE + BRÛLEUR : le rugissement de flamme franc, le plus « brûleur de montgolfière sous pression » */
    bruleur: { m: NMa.PRESETS.meca, f: Object.assign({}, NFa.FLAMMES.bruleur, { airG: .14, airF: 1500, outLP: 2000 }), mixM: 1, mixF: .9 },
    /* MÉCANIQUE + FLAMBÉE : la flamme qui danse, des langues larges et rapides, un allumage épais */
    flambee: { m: NMa.PRESETS.meca, f: Object.assign({}, NFa.FLAMMES.flambee, { airG: .16, airF: 1500, outLP: 2000 }), mixM: 1, mixF: .95 },
    /* MÉCANIQUE + DRAGON : le souffle maléfique — grondement et voix qui glisse (preset enfer pour la mécanique), flamme en vagues lentes */
    dragon: { m: Object.assign({}, NMa.PRESETS.meca, { grondeG: .3, subG: .7, rapeG: .6, outLP: 2600 }), f: NFa.FLAMMES.souffle, mixM: 1, mixF: .85 }
  };
  const api = { NitroHybride, HYBRIDE_PRESETS: PRESETS, SANS_NOTE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroHybrideApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
