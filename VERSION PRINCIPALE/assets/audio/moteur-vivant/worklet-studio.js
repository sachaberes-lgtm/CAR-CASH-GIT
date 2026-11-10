/* LE PROCESSEUR AUDIO DU STUDIO (AudioWorklet) — moteur + nitro + pneus dans UN SEUL processeur (2026-11-09, « combine simulateur moteur et simulateur nitro, mais fais ça mieux »).
   POURQUOI UN SEUL. Le nitro à matière est calé sur la cadence d'allumage du moteur : il lui faut `f0` à CHAQUE bloc audio, pas toutes les 16 ms par un message. Donc le moteur, le nitro et
   les pneus tournent ici, dans la même boucle ; la page ne fait que piloter (pédale, gâchette, virage) et mixer.
   ASSEMBLAGE : la page met devant ce fichier le texte de moteur-vivant.js, nitro-braise.js, nitro-matiere.js, nitro-fusee.js, nitro-hybride.js, nitro-physique.js et pneus-doux.js dans un même module (Blob) → les API existent.
   SORTIES : 3 bus stéréo séparés — [0] moteur · [1] nitro · [2] pneus — pour que la page les mixe, les mesure et les montre chacun.
   MESSAGES (page → ici) :
     { c: { eng: { rpmCmd, thr, load, health, cleHz }, nit: { nit, speed }, tyr: { speed, drift } } }   commandes continues (~60 fois par seconde)
     { ev: 'demarre' | 'calage' | 'coup' | 'allume' | 'coupe', a }                                      événements du moteur
     { eng: 'buche' }                      change de fiche moteur (reconstruit la voix)        { cfg: { … } }   règle la fiche en direct (applyCfg)
     { nitro: { kind: 'matiere' | 'braise' | 'fusee' | 'hybride' | 'physique', preset: 'enfer', P: { … } } }   change de nitro      { nitP: { … } }  règle le nitro en direct · { nitG: { corps: 1, rape: 0, … } }  gains par couche
     { tyrP: { … } }   règle les pneus · { nitIgnite: 1 }  rallume le nitro à la main
   RETOUR (ici → page, ~20 fois par seconde) : { rpm, etat, f0, boost, cut, nitA, nitSp, lv: [moteur, nitro, pneus] (RMS) }. */
class StudioProc extends AudioWorkletProcessor {
  constructor(opt) {
    super();
    const o = (opt && opt.processorOptions) || {};
    this.engName = o.eng || 'buche';
    this.eng = new MoteurVivantApi.MoteurVivant(this.engName, sampleRate, 20261109);
    this.eng.etat = 'run'; this.eng.rpm = this.eng.rpmEff = this.eng.cfg.idle;
    this.mkNit(o.nitro || { kind: 'matiere', preset: 'matiere' });
    this.tyr = new PneusDouxApi.PneusDoux(sampleRate, 9191919);
    this.k = 0; this.acc = [0, 0, 0]; this.f0 = 80;
    this.port.onmessage = (e) => {
      const d = e.data, m = this.eng;
      if (d.c) {
        if (d.c.eng) for (const k in d.c.eng) { m[k] = d.c.eng[k]; if (k === 'cleHz') m.cyF = d.c.eng[k]; }
        if (d.c.nit) for (const k in d.c.nit) this.nit[k] = d.c.nit[k];
        if (d.c.tyr) for (const k in d.c.tyr) this.tyr[k] = d.c.tyr[k];
      }
      if (d.ev === 'demarre') m.demarre(d.a); else if (d.ev === 'calage') m.calage(); else if (d.ev === 'coup') m.coup(d.a);
      else if (d.ev === 'coupe') { m.etat = 'off'; m.rpm = 0; m.rpmEff = 0; m.cutOn = false; }
      else if (d.ev === 'allume') { m.etat = 'run'; m.rpm = m.cfg.idle; m.rpmEff = m.rpm; }
      if (d.cfg) { Object.assign(m.cfg, d.cfg); m.applyCfg(); }
      if (d.eng && d.eng !== this.engName) {
        this.engName = d.eng; const old = m, n = new MoteurVivantApi.MoteurVivant(d.eng, sampleRate, 20261109);
        n.health = old.health; n.cleHz = old.cleHz; n.cyF = old.cyF; if (old.etat === 'run') { n.etat = 'run'; n.rpm = n.cfg.idle; n.rpmEff = n.rpm; }
        this.eng = n;
      }
      if (d.nitro) this.mkNit(d.nitro);
      if (d.nitP) this.setNitP(d.nitP);
      if (d.nitG) this.setNitG(d.nitG);                     /* gains par couche du nitro : le solo, le muet, le mixage fin */
      if (d.tyrP) Object.assign(this.tyr.P, d.tyrP);
      if (d.nitIgnite) this.nit.ignite();
      if (d.nitRapport && this.nit.rapport) this.nit.rapport();         /* un passage de rapport : le hoquet de la flamme */
    };
  }
  /* LES QUATRE FAMILLES DE NITRO : matiere (calée sur le moteur), braise (idem, plus doux), fusee (les flammes, indépendantes du moteur), hybride (mécanique calée + flammes) */
  mkNit(o) {
    const old = this.nit, k = o.kind, sr = sampleRate;
    if (k === 'braise') this.nit = new NitroBraiseApi.NitroBraise(sr, 4242424, o.P || NitroBraiseApi.PRESETS[o.preset] || {});
    else if (k === 'fusee') this.nit = new NitroFuseeApi.NitroFusee(sr, 5151515, o.P || NitroFuseeApi.FLAMMES[o.preset] || NitroFuseeApi.FUSEE_PRESETS[o.preset] || {});
    else if (k === 'hybride') this.nit = new NitroHybrideApi.NitroHybride(sr, 1, NitroHybrideApi.HYBRIDE_PRESETS[o.preset]);
    else if (k === 'physique') this.nit = new NitroPhysiqueApi.NitroPhysique(sr, 90909, NitroPhysiqueApi.PHYSIQUE_PRESETS[o.preset] || {});
    else this.nit = new NitroMatiereApi.NitroMatiere(sr, 31337, o.P || NitroMatiereApi.PRESETS[o.preset] || {});
    if (old) { this.nit.nit = old.nit; this.nit.speed = old.speed; if (!this.nit.isHybride && !this.nit.isPhysique) { this.nit.a = old.a; this.nit.sp = old.sp; } }
  }
  setNitP(P) { const n = this.nit; for (const k in P) { if (n.setP) n.setP(k, P[k]); else n.P[k] = P[k]; } }
  setNitG(G) { const n = this.nit; for (const k in G) { if (n.setG) n.setG(k, G[k]); else n.G[k] = G[k]; } }
  process(inputs, outputs) {
    const o0 = outputs[0], o1 = outputs[1], o2 = outputs[2], N = o0[0].length, m = this.eng, n = this.nit;
    m.process(o0[0], o0[1] || o0[0], N, 0);
    /* LA CADENCE D'ALLUMAGE du moteur (Hz) — exactement la vitesse à laquelle sa manivelle tire ses coups : rpm × pitch ÷ 120 × cylindres */
    const f0 = m.rpmEff > 5 ? m.rpmEff * m.cfg.pitch / 120 * m.cfg.n : 0; this.f0 = f0 > 0 ? f0 : this.f0;
    n.f0 = f0; n.fire = f0; n.load = m.load; n.thr = m.thr;      /* le nitro physique lit aussi la charge et la pédale du moteur */
    n.process(o1[0], o1[1] || o1[0], N, 0);
    this.tyr.process(o2[0], o2[1] || o2[0], N, 0);
    for (let b = 0; b < 3; b++) { const x = outputs[b][0]; let a = 0; for (let i = 0; i < N; i++) a += x[i] * x[i]; this.acc[b] += a; }
    this.k += N;
    if (this.k >= sampleRate / 20) {
      this.port.postMessage({ rpm: m.rpm, etat: m.etat, f0, boost: m.boost || 0, cut: m.cutOn, nitA: n.a, nitSp: n.sp, lv: this.acc.map(v => Math.sqrt(v / this.k)) });
      this.acc = [0, 0, 0]; this.k = 0;
    }
    return true;
  }
}
registerProcessor('studio-son', StudioProc);
