





class NitroPhysiqueProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {}, API = NitroPhysiqueApi;
    this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[o.preset || 'forge']); this.k = 0; this.acc = 0;
    this.d = (typeof DetailsConduiteApi !== 'undefined' && o.details !== 0) ? new DetailsConduiteApi.DetailsConduite(sampleRate, 4242) : null; if (this.d && o.details > 0) this.d.P.master = o.details;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.preset && API.PHYSIQUE_PRESETS[d.preset]) { const old = this.n; this.n = new API.NitroPhysique(sampleRate, 90909, API.PHYSIQUE_PRESETS[d.preset]); for (const k of ['nit', 'speed', 'f0', 'load', 'thr', 'air', 'vir', 'gl', 'bleu', 'fa', 'fs']) this.n[k] = old[k]; }
      const n = this.n;
      const dc = this.d;
      if (d.c) for (const k in d.c) { const v = +d.c[k]; if (isFinite(v)) { n[k] = v; if (dc && k in dc) dc[k] = v; } }
      if (dc && d.D) for (const k in d.D) dc.setG(k, d.D[k]);
      if (dc && d.details != null && isFinite(+d.details)) dc.P.master = +d.details;
      if (d.ev === 'coupe') { n.coupe(); if (dc) dc.coupe(); }
      if (d.P) for (const k in d.P) n.setP(k, d.P[k]);
      if (d.G) for (const k in d.G) n.setG(k, d.G[k]);
      if (d.ev === 'rapport') n.rapport(); else if (d.ev === 'double') n.double(d.f); else if (d.ev === 'pose') n.pose(d.f); else if (d.ev === 'decolle') n.decolle(); else if (d.ev === 'bosse') n.bosse(d.f); else if (d.ev === 'rate') n.rate();
    };
  }
  process(inputs, outputs) {
    const o = outputs[0], L = o[0], R = o[1] || o[0], N = L.length;
    this.n.process(L, R, N, 0);
    if (this.d) this.d.process(L, R, N, 0);
    if (this.n.dort && (!this.d || this.d.dort)) { if (!this.muet) { this.muet = true; this.port.postMessage({ niv: 0, a: 0 }); this.acc = 0; this.k = 0; } return true; } 
    this.muet = false;
    let a = 0; for (let i = 0; i < N; i++) a += L[i] * L[i]; this.acc += a; this.k += N;
    if (this.k >= sampleRate / 20) { this.port.postMessage({ niv: Math.sqrt(this.acc / this.k), a: this.n.fa }); this.acc = 0; this.k = 0; }
    return true;
  }
}
registerProcessor('nitro-physique', NitroPhysiqueProc);
