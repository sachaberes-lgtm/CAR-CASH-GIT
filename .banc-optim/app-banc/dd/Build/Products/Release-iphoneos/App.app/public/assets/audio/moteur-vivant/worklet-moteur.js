/* LE PROCESSEUR AUDIO du MOTEUR VIVANT (AudioWorklet). Il est ASSEMBLÉ par la page : le texte de `moteur-vivant.js` est mis devant celui-ci dans un même
   module (Blob), donc `MoteurVivantApi` existe quand ce fichier s'exécute. L'hôte lui parle par `port.postMessage` :
     { c: { rpmCmd, thr, load, health } }  les commandes continues (≈ 60 fois par seconde)
     { ev: 'demarre'|'calage'|'coup'|'pop', a: … }  les événements
     { moteur: 'v8'|'flat'|'l6' }  change de fiche (reconstruit la voix)
     { G: { pipe: 1, intake: 1, … } }  les gains par couche (banc)
   Il renvoie { rpm, etat, niv } ≈ 20 fois par seconde (la page affiche le compte-tours). */
class MoteurVivantProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {};
    this.nom = o.moteur || 'v8';
    this.m = new MoteurVivantApi.MoteurVivant(this.nom, sampleRate, 20261022);
    this.n = 0; this.acc = 0;
    this.port.onmessage = (e) => {
      const d = e.data, m = this.m;
      if (d.c) { for (const k in d.c) m[k] = d.c[k]; }
      if (d.ev === 'demarre') m.demarre(d.a); else if (d.ev === 'calage') m.calage(); else if (d.ev === 'coup') m.coup(d.a); else if (d.ev === 'pop') m.pop(d.a, 0);
      if (d.ev === 'coupe') { m.etat = 'off'; m.rpm = 0; m.rpmEff = 0; m.cutOn = false; }
      if (d.ev === 'allume') { m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; }
      if (d.G) Object.assign(m.G, d.G);
      if (d.cfg) { Object.assign(m.cfg, d.cfg); m.applyCfg(); }   /* le LABO règle la fiche en direct (longueurs de tuyau, filtres, hauteur…) */
      if (d.moteur && d.moteur !== this.nom) { this.nom = d.moteur; const old = this.m; this.m = new MoteurVivantApi.MoteurVivant(this.nom, sampleRate, 20261022); this.m.health = old.health; if (old.etat === 'run') { this.m.etat = 'run'; this.m.rpm = this.m.cfg.idle; this.m.rpmEff = this.m.rpm; } }
    };
  }
  process(inputs, outputs) {
    const out = outputs[0], L = out[0], R = out[1] || out[0], N = L.length;
    this.m.process(L, R, N, 0);
    let a = 0; for (let i = 0; i < N; i++) a += L[i] * L[i];
    this.acc += a; this.n += N;
    if (this.n >= sampleRate / 20) {
      this.port.postMessage({ rpm: this.m.rpm, etat: this.m.etat, niv: Math.sqrt(this.acc / this.n), boost: this.m.boost || 0, cut: this.m.cutOn });
      this.acc = 0; this.n = 0;
    }
    return true;
  }
}
registerProcessor('moteur-vivant', MoteurVivantProc);
