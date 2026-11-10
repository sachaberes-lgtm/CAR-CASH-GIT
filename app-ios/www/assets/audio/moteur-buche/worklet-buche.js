


class MoteurBucheProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {};
    this.m = new MoteurBucheApi.MoteurBuche(sampleRate, 20261109); this.m.palier(o.palier || 0, o.div || 1);
    this.on = true;
    this.port.onmessage = (e) => {
      const d = e.data, m = this.m;
      if (d.c) for (const k in d.c) { const v = +d.c[k]; if (isFinite(v)) m[k] = v; }
      if (d.palier != null) { m.palier(d.palier, d.div); this.port.postMessage({ niv: MoteurBucheApi.NIV[m.lv] }); } 
      if (d.mat != null) m.mat = +d.mat;
      if (d.boostOn != null) m.boostOn = !!d.boostOn;
      if (d.ev === 'rapport') m.rapport(); else if (d.ev === 'coup') m.coup(); else if (d.ev === 'glitch') m.glitch(d.f);
      if (d.ev === 'coupe') this.on = false; else if (d.ev === 'allume') this.on = true;
    };
  }
  process(inputs, outputs) {
    const o0 = outputs[0], o1 = outputs[1];
    if (!this.on) return true;
    const mL = o0[0], mR = o0[1] || o0[0], cL = o1[0], cR = o1[1] || o1[0];
    this.m.process(mL, mR, cL, cR, mL.length);
    return true;
  }
}
registerProcessor('moteur-buche', MoteurBucheProc);
