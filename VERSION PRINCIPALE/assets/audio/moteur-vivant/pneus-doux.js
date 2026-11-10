/* ================= LES PNEUS DOUX (2026-11-09 ; Sacha : « le son des pneus dans les virages : agréable, lourd, doux, ASMR, qui se marie avec la musique ») =================
   Même contrat que les autres DSP du dossier (PUR, Float32, stéréo). L'hôte écrit `speed` (0..1 : la vitesse ressentie) et `drift` (0..1 : l'intensité du virage / de la glisse).
   Un pneu qui chante n'a rien d'un cri : c'est de la gomme chaude qui s'étire sur un sol, un GRAIN lourd qui s'épaissit. Ici, trois couches, aucune au-dessus de 2 kHz :
     ROULE     le roulement : bruit brun très grave qui s'épaissit avec la vitesse, avec une texture de route lente (±15 %), comme une main lourde qui glisse
     GRAIN     la gomme sur le sol : bruit passé dans une bande ronde (~420 Hz) haché par la rotation de la roue (AM douce, irrégulière) — le « frrr » feutré
     CHANT     le virage : deux voix de bruit étroit (~560 et ~830 Hz, Q doux) qui se balancent lentement (collé-glissé, 6-11 Hz, 30 % de profondeur) et un coussin
               grave à 140 Hz qui donne du POIDS ; l'attaque est lente (150 ms) et le relâchement plus lent encore (400 ms) : ça se pose, ça ne claque jamais. */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq, clamp = A.clamp, TAU = Math.PI * 2;
  const DEF = { master: 1, rouleG: .30, rouleF: 90, grainG: .50, grainF: 420, chantG: .22, chantF1: 560, chantF2: 830, poidsG: .22, attack: .15, release: .40 };
  function PneusDoux(sr, seed, P) {
    this.sr = sr || 48000; this.P = Object.assign({}, DEF, P || {});
    let s = (seed || 9191919) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.speed = 0; this.drift = 0;
    this.d = 0; this.brown = 0; this.tex = 1; this.texT = 0; this.texTg = 1; this.ctrlN = 0; this.rotPh = 0; this.slipPh = 0; this.slipPh2 = 0; this.rotJ = 0; this.rotJT = 0;
    this.roLP = new Bq(); this.roHP = new Bq().set('hp', 22, .7, 0, this.sr);
    this.grL = new Bq(); this.grR = new Bq(); this.grLP = [new Bq().set('lp', 1100, .6, 0, this.sr), new Bq().set('lp', 1100, .6, 0, this.sr)];
    this.c1 = new Bq(); this.c2 = new Bq(); this.c1b = new Bq(); this.c2b = new Bq(); this.pdF = new Bq().set('bp', 140, 1.1, 0, this.sr);
    this.outLP = [new Bq().set('lp', 2100, .6, 0, this.sr), new Bq().set('lp', 2100, .6, 0, this.sr)];
    this.G = { roule: 1, grain: 1, chant: 1, poids: 1 };
    this.rmsAcc = null;
  }
  const NP = PneusDoux.prototype;
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    for (let i = 0; i < N; i++) {
      const spd = clamp(this.speed, 0, 1), tgt = clamp(this.drift, 0, 1) * (.25 + .75 * spd);
      this.d += (tgt - this.d) * (1 - Math.exp(-1 / (sr * (tgt > this.d ? P.attack : P.release) + 1)));
      const d = this.d;
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr;
        this.texT -= dt; if (this.texT <= 0) { this.texT = .25 + this.rnd() * .9; this.texTg = 1 + .15 * this.g(); }
        this.tex += (this.texTg - this.tex) * Math.min(1, dt * 3);
        this.rotJT -= dt; if (this.rotJT <= 0) { this.rotJT = .2 + this.rnd() * .5; this.rotJ = this.g() * .25; }
        this.roLP.set('lp', P.rouleF * (.8 + .9 * spd), .7, 0, sr);
        this.grL.set('bp', P.grainF * (.9 + .5 * spd), .7, 0, sr); this.grR.set('bp', P.grainF * (.9 + .5 * spd) * 1.08, .7, 0, sr);
        const bal = 1 + .02 * Math.sin(this.slipPh * .37);                      /* la hauteur du chant respire un peu : jamais une note figée */
        this.c1.set('bp', P.chantF1 * (.92 + .22 * d) * bal, 2.2, 0, sr); this.c2.set('bp', P.chantF2 * (.92 + .22 * d) * bal, 2.2, 0, sr);
        this.c1b.set('bp', P.chantF1 * (.92 + .22 * d) * bal * 1.013, 2.2, 0, sr); this.c2b.set('bp', P.chantF2 * (.92 + .22 * d) * bal * .991, 2.2, 0, sr);
      }
      const w = this.g(), w2 = this.g(), w3 = this.g();
      this.brown = (this.brown + .02 * w) / 1.02;
      const roule = this.roHP.p(this.roLP.p(this.brown * 3.4)) * (.25 + .75 * Math.pow(spd, .9)) * this.tex * P.rouleG;
      this.rotPh += (3 + 15 * spd) * (1 + this.rotJ) / sr; if (this.rotPh >= 1) this.rotPh -= 1;
      const am = 1 - .28 * (.5 - .5 * Math.cos(TAU * this.rotPh));
      const gg = Math.pow(spd, 1.2) * (.35 + .65 * d) * P.grainG * am;
      const gL = this.grLP[0].p(this.grL.p(w2)) * gg, gR = this.grLP[1].p(this.grR.p(w3)) * gg;
      this.slipPh += TAU * (6 + 5 * Math.abs(Math.sin(this.slipPh2))) / sr; this.slipPh2 += TAU * .21 / sr;
      const stick = 1 - .30 * (.5 - .5 * Math.sin(this.slipPh));
      const cg = Math.pow(d, 1.15) * P.chantG * stick;
      const chantL = (this.c1.p(w) + .8 * this.c2.p(w2)) * cg * 3.2, chantR = (this.c1b.p(w3) + .8 * this.c2b.p(w)) * cg * 3.2;
      const poids = this.pdF.p(this.brown * 3 + w * .1) * Math.pow(d, 1.1) * P.poidsG * 2.4;
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('roule', roule); q('grain', gL); q('chant', chantL); q('poids', poids); }
      const base = roule * G.roule + poids * G.poids;
      let l = base + gL * G.grain + chantL * G.chant, r = base + gR * G.grain + chantR * G.chant;
      l = this.outLP[0].p(l); r = this.outLP[1].p(r);
      L[off + i] = Math.tanh(l * 1.2) / 1.2 * P.master; if (R) R[off + i] = Math.tanh(r * 1.2) / 1.2 * P.master;
    }
  };
  const api = { PneusDoux, PNEUS_DEF: DEF };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PneusDouxApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
