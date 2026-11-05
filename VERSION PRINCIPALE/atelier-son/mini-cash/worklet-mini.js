/* ===== LE PROCESSEUR AUDIO du MINI CASH (2026-11-05, session SON) =====
   Comme worklet-moteur.js / worklet-nitro.js, mais les DEUX voix dans un seul processeur, et une fiche moteur ENTIÈRE peut arriver par message
   (le générateur invente des moteurs que la table `CFG` ne connaît pas : 3, 5, 10, 12 cylindres…). Assemblé par la page : le texte de moteur-vivant.js et de
   nitro-vivant.js est mis devant celui-ci dans un même module (Blob).
   Messages :
     { fiche: {…}, nitro: {…}, sante, demarre: bool }   un NOUVEAU moteur (la voix est reconstruite ; `demarre` : on entend le démarreur)
     { c: { rpmCmd, thr, load, health } }                 les commandes du moteur (≈ 60 fois par seconde)
     { n: { nit, speed } }                                le nitro
     { ev: 'coup'|'pop'|'calage'|'demarre'|'allume'|'ignite', a }   les événements
     { cfg: {…} } · { nitroP: {…} }                      retouche d'un réglage du moteur / du nitro en direct
     { gE, gN }                                           les niveaux des deux voix
   Renvoie { rpm, etat, niv, boost, cut, nA } ≈ 20 fois par seconde. */
class MiniCashProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    this.m = null; this.nz = new NitroVivantApi.NitroVivant(sampleRate, 7654321, {});
    this.gE = 1; this.gN = .8; this.k = 0; this.acc = 0;
    this.tL = new Float32Array(128); this.tR = new Float32Array(128);
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.fiche) {
        const m = new MoteurVivantApi.MoteurVivant(d.fiche, sampleRate, 20261105);
        m.health = d.sante == null ? 1 : d.sante;
        if (d.demarre) { m.etat = 'off'; m.demarre(0); } else { m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; }
        this.m = m;
      }
      if (d.nitro) { this.nz = new NitroVivantApi.NitroVivant(sampleRate, 7654321, d.nitro); }
      const m = this.m;
      if (d.c && m) for (const k in d.c) m[k] = d.c[k];
      if (d.n) for (const k in d.n) this.nz[k] = d.n[k];
      if (d.cfg && m) { Object.assign(m.cfg, d.cfg); m.applyCfg(); }   /* un curseur « sous le capot » : retouche sans reconstruire */
      if (d.nitroP) Object.assign(this.nz.P, d.nitroP);
      if (d.gE != null) this.gE = d.gE;
      if (d.gN != null) this.gN = d.gN;
      if (m) {
        if (d.ev === 'coup') m.coup(d.a); else if (d.ev === 'pop') m.pop(d.a, d.t || 0); else if (d.ev === 'calage') m.calage();
        else if (d.ev === 'demarre') m.demarre(0); else if (d.ev === 'allume') { m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; }
      }
      if (d.ev === 'ignite') this.nz.ignite();
    };
  }
  process(inputs, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0], N = L.length;
    if (this.tL.length < N) { this.tL = new Float32Array(N); this.tR = new Float32Array(N); }
    const tL = this.tL, tR = this.tR;
    if (this.m) this.m.process(L, R, N, 0); else { L.fill(0); R.fill(0); }
    this.nz.process(tL, tR, N, 0);
    const gE = this.gE, gN = this.gN;
    let a = 0;
    for (let i = 0; i < N; i++) { L[i] = L[i] * gE + tL[i] * gN; R[i] = R[i] * gE + tR[i] * gN; a += L[i] * L[i]; }
    this.acc += a; this.k += N;
    if (this.k >= sampleRate / 20) {
      const m = this.m;
      this.port.postMessage({ rpm: m ? m.rpm : 0, etat: m ? m.etat : 'off', niv: Math.sqrt(this.acc / this.k), boost: m ? m.boost || 0 : 0, cut: m ? m.cutOn : false, nA: this.nz.a });
      this.acc = 0; this.k = 0;
    }
    return true;
  }
}
registerProcessor('mini-cash', MiniCashProc);
