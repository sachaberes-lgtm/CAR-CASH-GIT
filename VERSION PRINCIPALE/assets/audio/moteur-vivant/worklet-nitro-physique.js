/* LE PROCESSEUR AUDIO du NITRO PHYSIQUE (AudioWorklet). Chargé APRÈS moteur-vivant.js, nitro-matiere.js et nitro-physique.js (même portée : MoteurVivantApi, NitroMatiereApi, NitroPhysiqueApi existent).
   UNE sortie stéréo. Messages : { c: { f0, nit, speed, load, thr } } (la note du moteur en Hz, l'appui 0..1…) · { P: { mixM: 1, … } } réglages (`m_x` = le corps mécanique)
   · { G: { roar: 0, … } } gains par couche · { preset: 'forge' | 'brasier' | 'doux' } · { ev: 'rapport' }. Renvoie { niv, a } ≈ 20 fois par seconde. */
class NitroPhysiqueProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {}, API = NitroPhysiqueApi;
    this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[o.preset || 'forge']); this.k = 0; this.acc = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.preset && API.PHYSIQUE_PRESETS[d.preset]) { const old = this.n; this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[d.preset]); this.n.nit = old.nit; this.n.speed = old.speed; this.n.f0 = old.f0; this.n.load = old.load; this.n.thr = old.thr; this.n.fa = old.fa; this.n.fs = old.fs; }
      const n = this.n;
      if (d.c) for (const k in d.c) { const v = +d.c[k]; if (isFinite(v)) n[k] = v; }
      if (d.P) for (const k in d.P) n.setP(k, d.P[k]);
      if (d.G) for (const k in d.G) n.setG(k, d.G[k]);
      if (d.ev === 'rapport') n.rapport();
    };
  }
  process(inputs, outputs) {
    const o = outputs[0], L = o[0], R = o[1] || o[0], N = L.length;
    this.n.process(L, R, N, 0);
    let a = 0; for (let i = 0; i < N; i++) a += L[i] * L[i]; this.acc += a; this.k += N;
    if (this.k >= sampleRate / 20) { this.port.postMessage({ niv: Math.sqrt(this.acc / this.k), a: this.n.fa }); this.acc = 0; this.k = 0; }
    return true;
  }
}
registerProcessor('nitro-physique', NitroPhysiqueProc);
