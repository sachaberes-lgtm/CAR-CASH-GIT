/* LE PROCESSEUR AUDIO du NITRO PHYSIQUE (AudioWorklet). Chargé APRÈS moteur-vivant.js, nitro-matiere.js et nitro-physique.js (même portée : MoteurVivantApi, NitroMatiereApi, NitroPhysiqueApi existent).
   UNE sortie stéréo. Messages : { c: { f0, nit, speed, load, thr, air, vir, gl, bleu } } (la note du moteur en Hz, l'appui 0..1, en vol 0/1, le volant −1..1, la glisse 0..1, le 2e étage 0/1)
   · { P: { mixM: 1, … } } réglages (`m_x` = le corps mécanique) · { G: { roar: 0, … } } gains par couche · { preset: 'forge' | 'brasier' | 'doux' }
   · { ev: 'rapport' | 'double' | 'pose' | 'decolle' | 'bosse' | 'rate', f: 0..1 } les gestes du jeu. Renvoie { niv, a } ≈ 20 fois par seconde TANT QU'IL SONNE (rien quand il dort). */
class NitroPhysiqueProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {}, API = NitroPhysiqueApi;
    this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[o.preset || 'forge']); this.k = 0; this.acc = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.preset && API.PHYSIQUE_PRESETS[d.preset]) { const old = this.n; this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[d.preset]); for (const k of ['nit', 'speed', 'f0', 'load', 'thr', 'air', 'vir', 'gl', 'bleu', 'fa', 'fs']) this.n[k] = old[k]; }
      const n = this.n;
      if (d.c) for (const k in d.c) { const v = +d.c[k]; if (isFinite(v)) n[k] = v; }
      if (d.P) for (const k in d.P) n.setP(k, d.P[k]);
      if (d.G) for (const k in d.G) n.setG(k, d.G[k]);
      if (d.ev === 'rapport') n.rapport(); else if (d.ev === 'double') n.double(d.f); else if (d.ev === 'pose') n.pose(d.f); else if (d.ev === 'decolle') n.decolle(); else if (d.ev === 'bosse') n.bosse(d.f); else if (d.ev === 'rate') n.rate();
    };
  }
  process(inputs, outputs) {
    const o = outputs[0], L = o[0], R = o[1] || o[0], N = L.length;
    this.n.process(L, R, N, 0);
    if (this.n.dort) { if (!this.muet) { this.muet = true; this.port.postMessage({ niv: 0, a: 0 }); this.acc = 0; this.k = 0; } return true; }   /* il dort : ni mesure ni message */
    this.muet = false;
    let a = 0; for (let i = 0; i < N; i++) a += L[i] * L[i]; this.acc += a; this.k += N;
    if (this.k >= sampleRate / 20) { this.port.postMessage({ niv: Math.sqrt(this.acc / this.k), a: this.n.fa }); this.acc = 0; this.k = 0; }
    return true;
  }
}
registerProcessor('nitro-physique', NitroPhysiqueProc);
