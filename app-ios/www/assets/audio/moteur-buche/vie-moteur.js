

















(function (root) {
  'use strict';
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
 
  const RUGO = [1, .75, .6, .42, .3, .36, .45, .3, .3, .4, .45, .38, .24, .16, .14, .14, .26, .3, .28, .3, .2, .35, .6, .3, .2, .35, .45, .35, .25, .4]; 







  const FAMILLE = ['atmo', 'atmo', 'atmo', 'atmo', 'atmo', 'turbo', 'atmo', 'atmo', 'turbo', 'atmo', 'atmo', 'atmo', 'atmo', 'atmo', 'atmo', 'atmo', 'atmo', 'turbo', 'rotatif',
                   'jet', 'jet', 'jet', 'pulso', 'jet', 'jet', 'jet', 'jet', 'jet', 'jet', 'jet'];
  function VieMoteur(seed) {
    let s = (seed || 1611) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.t = 0; this.lv = 0; this.jet = false; this.on = true;
    this.n1 = 0; this.n1c = 0; this.n2 = 0; this.n2c = 0; 
    this.ratT = 0; this.hoquet = 0; this.popT = -1; this.glT = 0;
    this.flare = 0; this.sag = 0; this.coupC = 0; this.rudeT = 0; this.tour = 0; this.apresPose = 0;
  }
  const P = VieMoteur.prototype;
  P.palier = function (lv, jet) { this.lv = lv | 0; this.jet = !!jet; };
  P.rugo = function () { return RUGO[this.lv] || .3; };
 
  P.bosse = function (f) { f = clamp(f || .5, 0, 1); this.flare = Math.max(this.flare, .06 * f); this.sag = Math.max(this.sag, .05 * f); this.coupC = Math.max(this.coupC, .5 * f); this.ev('clunk', f); };
 
  P.atterrit = function (f) { f = clamp(f || .5, 0, 1); this.sag = Math.max(this.sag, .08 + .14 * f); this.coupC = Math.max(this.coupC, .7 + .3 * f); this.rudeT = Math.max(this.rudeT, .25 + .3 * f); this.apresPose = 1.2; };
 
  P.rapport = function () {
    const r = this.rugo(), accroche = this.on && this.rnd() < .04 + .10 * r;
    return { seuil: this.on ? .955 + .045 * this.rnd() : .99, duree: !this.on ? .12 : accroche ? .22 + .08 * this.rnd() : .09 + .07 * this.rnd(), accroche: accroche,
             souffle: this.on && FAMILLE[this.lv] === 'turbo' }; 
  };
  P.ev = function (k, f) { (this.evs || (this.evs = [])).push({ k: k, f: f == null ? 1 : f }); };
 
  P.pas = function (dt, e) {
    this.evs = []; const o = { rpmK: 1, coupe: 0, charge: 0, rude: 0, lent1: 0, lent2: 0, evs: this.evs };
    this.t += dt; const t = this.t;
 
    if (!this.on) { this.thr0 = e.thr; return o; }
 
    { const fam = FAMILLE[this.lv]; if (this.thr0 && !e.thr && !e.air && (e.rpm || 0) > .45 && fam !== 'atmo') this.ev(fam === 'turbo' ? 'flutter' : fam === 'rotatif' ? 'brap' : fam === 'pulso' ? 'begaie' : 'whoosh', Math.min(1, (e.rpm || 0) * 1.1)); }
    this.thr0 = e.thr;
 
    if (this.lv === 27 && e.thr && !e.air && this.rnd() < dt * (1 + 2 * (e.charge || 0))) this.ev('crepite', .5 + .5 * this.rnd());
    o.lent1 = .62 * Math.sin(t * .69) + .38 * Math.sin(t * 1.13 + 2.1); 
    o.lent2 = .55 * Math.sin(t * .45 + 1) + .45 * Math.sin(t * .83 + 4.2); 
    if (e.air) { this.n1 *= .9; return o; }
    const r = this.rugo(), rpm = clamp(e.rpm || 0, 0, 1.1), av = Math.abs(e.vir || 0), thr = e.thr ? 1 : 0, vit = clamp(e.vit == null ? 1 : e.vit, 0, 1.1);
 
    if (this.rnd() < dt * 3) this.n1c = this.rnd() * 2 - 1; this.n1 += (this.n1c - this.n1) * Math.min(1, dt * 2.2);
    if (this.rnd() < dt * 9) this.n2c = this.rnd() * 2 - 1; this.n2 += (this.n2c - this.n2) * Math.min(1, dt * 7);
    const grain = vit * (.005 + .006 * rpm + .010 * av + .006 * r);
    o.rpmK *= 1 + grain * (this.n1 * .7 + this.n2 * .5);
 
    this.tour = av > .35 && thr ? this.tour + dt : Math.max(0, this.tour - dt * 2);
    o.rpmK *= 1 - .04 * av * thr; o.charge += .28 * av * thr;
    if (this.tour > 1) o.rpmK *= 1 + .012 * Math.min(1, this.tour - 1) * Math.sin(t * 23 + Math.sin(t * 5.3) * 2);
 
    o.rpmK *= 1 + this.flare - this.sag;
    this.flare *= Math.exp(-dt * 14); this.sag += (0 - this.sag) * Math.min(1, dt * (this.flare > .01 ? .5 : 3.2));
    o.charge += this.coupC; this.coupC *= Math.exp(-dt * 4);
 
    this.apresPose = Math.max(0, this.apresPose - dt);
    if (this.ratT <= 0 && this.glT <= 0 && thr) {
      const taux = r * (.12 + .5 * (e.charge || 0) * (1 - Math.min(1, rpm)) + 1.5 * this.apresPose * r) + .03; 
      if (this.rnd() < taux * dt) {
        if (this.jet) { this.glT = .06 + .08 * this.rnd(); this.ev('glitch', .5 + .5 * this.rnd()); }
        else { this.ratT = .04 + .07 * this.rnd(); this.ev('rate', .5 + .5 * this.rnd()); this.hoquet = this.rnd() < .25 + .4 * r ? 1 + (this.rnd() < .4 ? 1 : 0) : 0; this.popT = this.rnd() < .3 + .5 * r ? .05 + .08 * this.rnd() : -1; }
      }
    }
    if (this.ratT > 0) {
      this.ratT -= dt; o.coupe = 1; o.rude = 1; o.rpmK *= 1 - .035 * (1 + r);
      if (this.ratT <= 0) { if (this.hoquet > 0) { this.hoquet--; this.ratT = -(.06 + .08 * this.rnd()); } else this.ratT = 0; } 
    } else if (this.ratT < 0) { this.ratT += dt; if (this.ratT >= 0) { this.ratT = .03 + .05 * this.rnd(); this.ev('rate', .4); } }
    if (this.popT >= 0) { this.popT -= dt; if (this.popT < 0) this.ev('pop', .4 + .6 * r); }
    if (this.glT > 0) { this.glT -= dt; o.rpmK *= 1 - .02; }
    if (this.rudeT > 0) { this.rudeT -= dt; o.rude = Math.max(o.rude, .6); }
    o.rude = Math.max(o.rude, .25 * r * (.5 + .5 * this.n2)); 
    if (!(o.rpmK === o.rpmK)) o.rpmK = 1; o.rpmK = clamp(o.rpmK, .6, 1.12); o.charge = clamp(o.charge, 0, 1.2);
    return o;
  };
  const api = { VieMoteur, RUGO, FAMILLE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VieMoteurApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
