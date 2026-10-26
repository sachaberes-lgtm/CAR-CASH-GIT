/* LE PROCESSEUR AUDIO du NITRO VIVANT (AudioWorklet) — mêmes règles que worklet-moteur.js : le texte de moteur-vivant.js ET de nitro-vivant.js est mis devant.
   Messages : { c: { nit, speed } } · { P: { …réglages… } } · { G: { roar: 1, … } } · { ev: 'ignite' | 'pshh' }. Renvoie { niv, a, sp } ≈ 20 fois par seconde. */
class NitroVivantProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    this.n = new NitroVivantApi.NitroVivant(sampleRate, 7654321, (opt.processorOptions || {}).P);
    this.k = 0; this.acc = 0;
    this.port.onmessage = (e) => {
      const d = e.data, n = this.n;
      if (d.c) for (const k in d.c) n[k] = d.c[k];
      if (d.P) Object.assign(n.P, d.P);
      if (d.G) Object.assign(n.G, d.G);
      if (d.ev === 'ignite') n.ignite(); else if (d.ev === 'pshh') n.pshh(d.a);
    };
  }
  process(inputs, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0], N = L.length;
    this.n.process(L, R, N, 0);
    let a = 0; for (let i = 0; i < N; i++) a += L[i] * L[i];
    this.acc += a; this.k += N;
    if (this.k >= sampleRate / 20) { this.port.postMessage({ niv: Math.sqrt(this.acc / this.k), a: this.n.a, sp: this.n.sp }); this.acc = 0; this.k = 0; }
    return true;
  }
}
registerProcessor('nitro-vivant', NitroVivantProc);
