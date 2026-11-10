/* ================= LE NITRO PHYSIQUE (2026-11-10 ; Sacha : « le moteur cyber et le nitro très mécanique et flamme PHYSIQUE, sans que ça fasse mal aux oreilles, avec des variations malignes ») =================
   Fait pour aller avec le MOTEUR BÛCHE CYBER de Léo (assets/audio/moteur-buche/), mais PUR et indépendant : l'hôte écrit la note du moteur `f0` (Hz : `hz`, la note de la bûche
   qu'on entend ; pour le moteur vivant : régime × pitch ÷ 120 × cylindres), `nit` (0..1 : à quel point on appuie), `speed`, `load`, `thr` ; il appelle `rapport()` au passage de rapport.

   ===== 2e TOUR (2026-11-10, Claude Fable ; Sacha : « j'aime bien le nitro flamme et mécanique max », « il faut que plein d'actions soient prises en compte ») =====
   CE QUI A CHANGÉ, ET POURQUOI. Le 1er tour faisait la flamme avec un bruit CONTINU passé dans un peigne : sur le spectrogramme, un voile de bruit entre les raies du moteur
   (ce voile, c'est « le vent »). Une vraie flamme d'échappement n'est pas continue : chaque cylindre qui s'ouvre CRACHE un paquet de gaz qui brûle. D'où le nouveau modèle :
   LA FLAMME PULSÉE   à CHAQUE allumage du moteur (la phase de `f0`), le cylindre de service lâche une IMPULSION de pression (une bosse de 0,22 période + le bruit de sa combustion,
                      haché par elle) dans un TUYAU aux modes FIXES (quart d'onde : 165, 495, 825 Hz). Un train d'impulsions à la cadence du moteur est harmonique du moteur par
                      construction : plus besoin de tricher sur le tuyau, et quand le régime monte les harmoniques TRAVERSENT les modes (le « wah » d'un vrai pot).
   L'APPUI = LE NOMBRE DE CYLINDRES QUI CRACHENT   (la variation « mécanique » de l'appui). Les cylindres s'allument dans un ordre étalé (0, 4, 2, 6, 1, 5, 3, 7) : appui léger = 2
                      cylindres sur 8 → une pétarade à f0/4 (des coups séparés, « pof-pof ») ; mi-appui = 4 → f0/2 ; plein appui = 8 → la note du moteur, les coups fusionnent en
                      rugissement dur. Toujours des sous-multiples exacts de la note : ça « monte par octaves » avec le doigt.
   L'ALLUMAGE EN CASCADE   à l'appui les cylindres prennent feu UN À UN (0,1 à 0,25 s selon la vitesse du doigt) : le bégaiement d'injecteur « p-p-prrRRA », calé sur le moteur.
   LE TUYAU CHAUFFE   tenir le nitro chauffe les gaz : le son y va plus vite, les modes MONTENT (jusqu'à +22 %) — la flamme « s'ouvre » plus on tient ; au lâcher il refroidit et
                      chaque pétarade de la traîne sonne un peu plus grave que la précédente.
   LE LÂCHER, UNE SCÈNE   le CLAC rond de la soupape de purge → le « pssh » (taille = chaleur) → les cylindres s'éteignent un à un → la postcombustion PAR PAQUETS (2-4 pétarades
                      serrées, un silence qui s'allonge, un paquet plus petit… et un dernier « poum » seul et grave). Les pétarades tombent SUR des allumages du moteur.
   LES GESTES DU JEU (l'hôte écrit `air`, `vir`, `gl`, `bleu` et appelle les événements) :
       coup bref (< 0,25 s)   pas de purge : un CRACHAT (clac + deux pétarades)                    `double(f)`  la détonation du double-tap : « ba-BOUM » + traîne
       `pose(f)`  l'atterrissage : la flamme s'écrase (2-5 allumages étouffés), repart en surcharge avec un gros coup      `decolle()`  la contre-pression tombe : la flamme s'évase
       `bosse(f)` la flamme tressaille (un coup gonflé, le suivant avalé)        `rate()`  un allumage sauté        `air` (0/1) en vol : plus de sol pour renvoyer le grave, tuyau plus mat
       `vir` (−1..1) + `gl` (0..1)  la flamme part à l'extérieur du virage ; en glisse elle se déchire (coups plus inégaux, plus de crachats)       `bleu` (0/1) le 2e étage : tuyau plus
       chaud, coups plus réguliers (un chalumeau qui se serre)
   CE QUI RESTE DU 1er TOUR : la voix MÉCANIQUE (`nitro-matiere.js` : corps saturé, râpe coup par coup, poing, plainte), les TICS de culbuteur, le CLIC du solénoïde, le WHUMP (taille =
       vitesse du doigt), le HOQUET au passage de rapport, le RUGISSEMENT turbulent + son peigne (en retrait : le panache hors du tuyau, désormais haché par les coups lui aussi),
       le « caractère » tiré à chaque appui, et LE GARDE-OREILLES (limiteur de la seule bande 2-6 kHz, coupe finale à 24 dB/octave, saturation douce).
   LE COÛT : quand le nitro est éteint et que tout est retombé, `process` rend du silence sans rien calculer (le nitro ne joue qu'une petite partie de la course).
   PUR (aucun DOM, aucun nœud audio) : Float32 stéréo. */
(function (root) {
  'use strict';
  const MVA = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const NMa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-matiere.js') : root.NitroMatiereApi;
  const Bq = MVA.Bq, clamp = MVA.clamp, TAU = Math.PI * 2, th = NMa.th;   /* th : la tanh rapide de nitro-matiere.js */
  /* le corps mécanique, RÉGLÉ DOUX pour ne jamais faire mal : coupure à 2,4 kHz, râpe retenue, plainte discrète */
  const MEC = { corpsG: .5, subG: .5, rapeG: .5, rapeDrive: 22, rapeDecay: 9, rapeJit: .55, rapeLo: 600, rapeHi: 1700, poingG: .6, poingSat: 2.6, tirageG: .2, tirageFold: 230, driveLo: 1.4, driveHi: 3.2,
    larg: .55, flick: .1, quinteG: .08, outLP: 2600, attack: .08, release: .5, spool: .6, fwoomG: 0, soupirG: 0 };
  const DEF = {
    master: 1, mixM: 1, mixF: 1,
    /* la flamme pulsée : niveau, part de bruit de combustion, largeur du coup (en période), dureté, le tuyau (1er mode, Q, rangs et poids des modes 2 et 3), sa chauffe */
    jetG: 1.6, jetBruit: .7, jetPhase: .1, jetPol: -1, jetTau: .22, jetDrive: 1.5, tuyau: 165, tuyauQ: 3.4, mode2: 3, mode3: 5, mode2G: .62, mode3G: .3, chauffe: .22, chauffeT: 2.4,
    jit0: .34, jit1: .1, cascade: .16, decasc: .4, larg: .3,
    roarG: .2, roarLo: 150, roarHi: 520, turbS: .55, turbHz: 12, roarPuls: .6,
    combMix: .55, combFb: .68, combDamp: .55,
    burstG: .55, burstP0: .01, burstP1: .2, ncyl: 8,
    replG: .45,
    clickG: .10, whumpG: .38, purgeG: .30, clacG: .22, ticG: .10, ticP: .5,
    hoquet: .055,
    aiguMax: .03, aiguRatio: 3, outLP: 3000,
    attack: .06, release: .45, spool: .5
  };
  function NitroPhysique(sr, seed, P) {
    this.sr = sr || 48000; this.isPhysique = true; this.P = Object.assign({}, DEF, P || {}); this.mecP = Object.assign({}, MEC, (P && P.mec) || {});
    let s = (seed || 90909) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    /* ce que l'hôte écrit */
    this.nit = 0; this.speed = 0; this.f0 = 0; this.load = 0; this.thr = 0; this.fire = 0; this.air = 0; this.vir = 0; this.gl = 0; this.bleu = 0;
    this.mec = new NMa.NitroMatiere(this.sr, 31337, this.mecP); this.tm = [new Float32Array(1024), new Float32Array(1024)];
    this.fa = 0; this.fs = 0; this.fS = 80; this.nitPrev = 0; this.tS = 0; this.nitRate = 0; this.held = 0; this.heat = 0; this.ph = 0; this.cnt = 0; this.allume = false;
    /* les cylindres : leur rang d'allumage (ordre étalé), leur humeur, combien sont allumés */
    this.nc = 0; this.rang = new Uint8Array(16); this.cyl = new Float32Array(16).fill(1); this.cylT = 0; this.litF = 0; this.casc = .16; this.sautes = 0; this.coupK = 1;
    /* le coup de flamme et le tuyau */
    this.pe = 0; this.peD = .99; this.md = [new Bq(), new Bq(), new Bq()]; this.chaud = 0; this.jetS = new Bq().set('lp', 900, .7, 0, this.sr);
    this.airS = 0; this.glS = 0; this.bleuS = 0; this.panS = 0;
    /* le rugissement (le panache hors du tuyau) : bruit → coupe-bas → deux passe-bas dont la fréquence suit la taille de la flamme */
    this.rHP = new Bq().set('hp', 70, .7, 0, this.sr); this.rLP1 = new Bq(); this.rLP2 = new Bq(); this.rHPf = 70;
    this.tz = 0; this.tf = 1; this.tfT = 1; this.gR = 0; this.gRT = 0;
    /* le peigne du panache */
    this.cb = new Float32Array(Math.ceil(this.sr / 20) + 16); this.cw = 0; this.cD = this.sr / 90; this.cz = 0;
    /* les bouffées (pétarades, crachats, tics) : 7 voix */
    this.vo = []; for (let k = 0; k < 7; k++) this.vo.push({ u: 0, ua: 0, d: .99, f: new Bq(), a: 0, pan: .5, thump: 0, tph: 0, tf: 120, tic: false });
    this.repQ = []; this.dblT = 0; this.dblA = 0;
    this.pers = { rc: 1, bk: 1, wf: 64, wk: 1, tk: 1 };
    this.clE = 0; this.clF = new Bq().set('bp', 1500, 1.4, 0, this.sr); this.clLP = new Bq().set('lp', 2600, .7, 0, this.sr);
    this.whE = 0; this.whT = 0; this.whPh = 0; this.whA = 1; this.whLP = new Bq().set('lp', 380, .7, 0, this.sr);
    this.puE = 0; this.puD = .999; this.puF = new Bq().set('bp', 1100, .7, 0, this.sr); this.puLP = new Bq().set('lp', 2200, .7, 0, this.sr); this.puA = 0;
    this.caE = 0; this.caP1 = 0; this.caP2 = 0; this.caF1 = 310; this.caF2 = 870; this.caA = 0;
    this.gulp = 0; this.gulpT = 0; this.surge = 0;
    /* le garde-oreilles : la bande 2-6 kHz de chaque canal, son enveloppe, le gain qu'on lui applique */
    this.hf = [new Bq().set('hp', 2000, .7, 0, this.sr), new Bq().set('hp', 2000, .7, 0, this.sr)]; this.hf2 = [new Bq().set('lp', 6000, .7, 0, this.sr), new Bq().set('lp', 6000, .7, 0, this.sr)];
    this.hfE = 0; this.hfG = 1;
    this.outLP = [new Bq(), new Bq(), new Bq(), new Bq()]; this.outF = 0;
    this.ctrlN = 0; this.idle = 0; this.dort = 0;
    this.G = { mec: 1, jet: 1, roar: 1, comb: 1, burst: 1, repl: 1, click: 1, whump: 1, purge: 1, clac: 1, tic: 1 };
    this.rmsAcc = null;
    this.ordre();
  }
  const NP = NitroPhysique.prototype;
  Object.defineProperty(NP, 'a', { get() { return this.fa; } }); Object.defineProperty(NP, 'sp', { get() { return this.fs; } });   /* l'appui rapide et lissé, lus par les hôtes (compteurs) */
  /* `m_x` règle le corps mécanique, `mixM`/`mixF` l'équilibre, le reste la flamme et les événements */
  NP.setP = function (k, v) { if (k.indexOf('m_') === 0) { this.mec.P[k.slice(2)] = v; this.mecP[k.slice(2)] = v; } else this.P[k] = v; };
  NP.setG = function (k, v) { this.G[k] = v; };
  /* l'ordre ÉTALÉ des cylindres (inverse radical en base 2) : les premiers allumés sont le plus loin possible les uns des autres dans le cycle → 2 allumés = f0/4 régulier, pas deux coups collés */
  NP.ordre = function () {
    const n = Math.max(2, Math.min(16, this.P.ncyl | 0)); if (n === this.nc) return; this.nc = n;
    const v = []; for (let k = 0; k < n; k++) { let x = k, r = 0, b = .5; while (x > 0) { if (x & 1) r += b; x >>= 1; b *= .5; } v.push([r, k]); }
    v.sort((a, b) => a[0] - b[0]); for (let i = 0; i < n; i++) this.rang[v[i][1]] = i;
  };
  /* ---- LES GESTES DU JEU ---- */
  NP.rapport = function () { this.gulp = 1; this.gulpT = 0; };
  NP.ignite = function () { this.mec.ignite(); };
  NP.rate = function () { this.sautes = Math.max(this.sautes, 1); this.surge = Math.max(this.surge, .5); };
  NP.bosse = function (f) { this.coupK = 1 + .8 * clamp(f == null ? .6 : f, 0, 1); };
  NP.decolle = function () { if (this.litF > .5) this.surge = Math.max(this.surge, .6); };
  NP.pose = function (f) {
    f = clamp(f == null ? .6 : f, 0, 1); this.reveil();
    if (this.litF > .5) { this.sautes = 2 + Math.round(3 * f); this.surge = 1; this.petarade(.75, .6 + .5 * f, .012, .85, true); }
    else if (this.chaud > .12) this.petarade(.8, (.3 + .4 * f) * this.chaud, .01, .7, true);
  };
  /* la détonation du double-tap : « ba-BOUM », un coup de poitrine, puis une traîne en paquets */
  NP.double = function (f) {
    f = clamp(f == null ? 1 : f, .2, 1); this.reveil();
    this.petarade(1.05, .7 * f, .009, .55, false); this.dblT = Math.round(this.sr * (.075 + .03 * this.rnd())); this.dblA = f;
    this.whE = 1; this.whT = 0; this.whA = .55 + .45 * f; this.pers.wf = 52 + 10 * this.rnd();
  };
  NP.reveil = function () { this.idle = 0; };
  /* une bouffée : f centre (Hz), a amplitude, tau durée (s), thump = part du coup grave (pétarade) */
  NP.bouffee = function (f, a, tau, thump) {
    let v = this.vo[0]; for (let k = 1; k < this.vo.length; k++) if (this.vo[k].u < v.u) v = this.vo[k];   /* la voix la plus éteinte */
    v.tic = false; v.u = 1; v.ua = 1; v.d = Math.exp(-1 / (this.sr * tau)); v.a = a; v.pan = this.rnd(); v.f.set('bp', f, 2.2, 0, this.sr); v.thump = thump || 0; v.tph = 0; v.tf = 90 + 60 * this.rnd();
    return v;
  };
  /* une pétarade : une bouffée posée sur un mode du tuyau (k = 1 : le 1er mode ; plus haut = entre le 1er et le 2e), donc plus grave quand le tuyau refroidit */
  NP.petarade = function (k, a, tau, thump, grave) {
    const fp = this.fp || this.P.tuyau, f = fp * (grave ? .8 + .25 * this.rnd() : k * (1 + 1.4 * this.rnd()));
    const v = this.bouffee(f, Math.min(.62, a * this.P.replG * 1.25), tau, thump);   /* plafonnée : une pétarade ne pousse jamais la saturation finale (elle crisserait) */ if (grave) v.tf = 58 + 26 * this.rnd();
  };
  /* la postcombustion PAR PAQUETS : `h` = la chaleur accumulée ; les délais sont comptés en ALLUMAGES du moteur (les pétarades tombent sur ses coups) */
  NP.paquets = function (h, t0) {
    const f0 = this.fS, n = this.nc, Q = this.repQ; Q.length = 0;
    const nC = 1 + Math.round(clamp(h, 0, 1.2) * 2.4 + this.rnd() * .8); let amp = .5 + .5 * Math.min(1, h), att = Math.max(1, Math.round(t0 * f0));
    for (let c = 0; c < nC && Q.length < 20; c++) {
      const der = c === nC - 1, nP = der ? 1 + (nC > 1 && this.rnd() < .35 ? 1 : 0) : 2 + (this.rnd() * 3 | 0);
      for (let p = 0; p < nP; p++) {
        const fin = der && p === nP - 1;
        Q.push({ n: att, a: amp * (.6 + .55 * this.rnd()) * (p === 0 ? 1.15 : 1), th: fin ? .95 : .35 + .3 * this.rnd(), tau: fin ? .016 + .008 * this.rnd() : .006 + .008 * this.rnd(), grave: fin });
        att = Math.max(2, Math.round(n * (this.rnd() < .5 ? .5 : 1) * (.9 + .3 * this.rnd())));          /* dans le paquet : un demi-cycle ou un cycle moteur d'écart */
      }
      att = Math.max(3, Math.round((.1 + .06 * this.rnd()) * Math.pow(1.75, c) * f0)); amp *= .76;        /* le silence s'allonge, le paquet suivant est plus petit */
    }
  };
  /* un allumage du moteur : le cylindre de service crache (ou pas) son coup de flamme ; la file de la postcombustion avance ; un tic de culbuteur peut tomber */
  NP.allumage = function () {
    const P = this.P, sp = this.fs, n = this.nc, k = this.cnt++ % n, Q = this.repQ;
    if (Q.length && --Q[0].n <= 0) { const q = Q.shift(); this.petarade(1, q.a, q.tau, q.th, q.grave); }
    let lv = clamp(this.litF - this.rang[k], 0, 1);
    if (this.sautes > 0) { this.sautes--; lv = 0; } else if (this.gulp > .5) lv *= .15;
    if (lv > 0 && (lv >= 1 || this.rnd() < lv)) {
      const sg = (P.jit0 + (P.jit1 - P.jit0) * sp) * (1 + .8 * this.glS + .4 * this.airS) * (1 - .4 * this.bleuS);
      let A = (1 + (this.cyl[k] - 1) * (1 - .6 * sp)) * Math.exp(2 * sg * (this.rnd() + this.rnd() + this.rnd() - 1.5));       /* l'humeur du cylindre × une loi log-normale */
      A *= (.5 + .5 * sp) * (.55 + .45 * clamp(this.load, 0, 1)) * (1 + .55 * this.surge) * this.coupK * Math.sqrt(lv);
      if (this.coupK > 1) { this.coupK = 1; this.sautes = Math.max(this.sautes, 1); }                                         /* la bosse : un coup gonflé, le suivant avalé */
      this.pe = Math.min(2.4, A); this.peD = Math.exp(-1 / (this.sr * clamp(P.jetTau / this.fS, .0011, .007)));
    }
    if (this.fa > .08 && this.rnd() < P.ticP * (.25 + .75 * sp) * this.cyl[k]) {
      let v = this.vo[0]; for (let i = 1; i < this.vo.length; i++) if (this.vo[i].u < v.u) v = this.vo[i];
      if (v.u < .05) { this.bouffee(900 + 900 * this.rnd(), P.ticG * (.5 + .8 * this.rnd()) * (.4 + .6 * sp), .0012 + .0008 * this.rnd(), 0).tic = true; }
    }
    /* les crachats : en plus des coups réguliers, un cylindre peut cracher une vraie bouffée (plus souvent en glisse) */
    const p = (P.burstP0 + P.burstP1 * Math.pow(sp, 1.4)) * (.4 + .6 * clamp(this.load, 0, 1)) * this.cyl[k] * this.pers.bk * (1 + 1.2 * this.glS) * (this.gulp > .5 ? .2 : 1);
    if (this.fa > .08 && this.rnd() < p) {
      const fp = this.fp || P.tuyau, a = Math.exp(.6 * (this.rnd() + this.rnd() + this.rnd() - 1.5)) * (.45 + .55 * sp);
      this.bouffee(fp * (1.2 + 3.6 * this.rnd()), a * P.burstG, .003 + .006 * this.rnd(), 0);
    }
  };
  /* reste-t-il quelque chose à entendre ? (sinon `process` s'endort) */
  NP.vivant = function () {
    if (this.pe > 1e-4 || this.whE > 1e-4 || this.puE > 1e-4 || this.clE > 1e-4 || this.caE > 1e-4 || this.repQ.length || this.dblT > 0 || this.litF > .01) return true;
    for (let k = 0; k < this.vo.length; k++) if (this.vo[k].u > 1e-4) return true;
    return false;
  };
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    /* ---- LE SOMMEIL : nitro éteint, tout retombé depuis une demi-seconde → du silence, sans calcul ---- */
    if (!(this.nit > 0) && this.fa < 5e-4 && !this.vivant()) {
      this.idle += N;
      if (this.idle > sr * .5) { for (let i = 0; i < N; i++) { L[off + i] = 0; if (R) R[off + i] = 0; } this.dort += N; return; }
    } else this.idle = 0;
    if (this.dort) { const T = this.dort / sr; this.chaud *= Math.exp(-T / (P.chauffeT * 1.4)); this.heat = Math.max(0, this.heat - T * .05); this.dort = 0; this.fa = 0; this.fs = 0; this.mec.a = 0; this.mec.sp = 0; }
    if (this.tm[0].length < N) this.tm = [new Float32Array(N), new Float32Array(N)];
    const mec = this.mec; mec.nit = this.nit; mec.speed = this.speed; mec.f0 = this.f0 > 700 ? 700 : this.f0; mec.fire = mec.f0;
    /* LA FLAMME TOMBE SUR LE COUP DE LA MÉCANIQUE : les deux lisent la même note ; on recale la phase des allumages sur celle de la voix mécanique, décalée de `jetPhase` (mesuré : le décalage qui additionne
       les deux au lieu de les opposer — sinon le coup de flamme et le poing s'annulent dans le grave) */
    { let d = mec.ph + P.jetPhase - this.ph; d -= Math.round(d); if (d > .002 || d < -.002) { this.ph += d; this.ph -= Math.floor(this.ph); } }
    mec.process(this.tm[0], this.tm[1], N, 0);
    if (P.outLP !== this.outF) { this.outF = P.outLP; for (let c = 0; c < 4; c++) this.outLP[c].set('lp', P.outLP, c % 2 ? .7 : .6, 0, sr); }
    this.ordre();
    const kAtk = 1 - Math.exp(-1 / (sr * P.attack + 1)), kRel = 1 - Math.exp(-1 / (sr * P.release + 1)), kSp = 1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))), kF0 = 1 - Math.exp(-1 / (sr * .02));   /* constantes par bloc */
    const tgt = clamp(this.nit, 0, 1), on = tgt > .06, dS = 1 / sr, md = this.md, vo = this.vo, nV = vo.length, len = this.cb.length;
    const mixM = P.mixM * G.mec * (1 - .22 * this.airS), mixF = P.mixF, jG = P.jetG * G.jet * mixF, c2 = P.mode2G, c3 = P.mode3G, drv = P.jetDrive, larg = P.larg * mixF;
    for (let i = 0; i < N; i++) {
      this.fa += (tgt - this.fa) * (tgt > this.fa ? kAtk : kRel);
      this.fs += (this.fa - this.fs) * kSp;
      const fa = this.fa, sp = this.fs;
      /* la vitesse de l'appui (par seconde) et l'état « tenu » : ils décident du clic, du whump, du crachat ou de la purge */
      this.tS += (tgt - this.tS) * .0008; this.nitRate += ((this.tS - this.nitPrev) * sr - this.nitRate) * .004; this.nitPrev = this.tS;     /* sur une consigne lissée (~25 ms) */
      if (on) { this.held += dS; this.heat = Math.min(1.6, this.heat + tgt * (.3 + sp) * dS * .9); if (!this.allume) { this.allume = true; this.appui(Math.max(0, this.nitRate)); } }
      else { if (this.allume) { this.allume = false; if (fa > .05) this.relache(this.held < .25); } this.held = 0; this.heat = Math.max(0, this.heat - dS * .05); }
      this.fS += ((this.f0 > 8 ? Math.min(this.f0, 700) : 80) - this.fS) * kF0;
      const f0 = this.fS;
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr;
        /* les gestes, lissés : le vol, la glisse, le 2e étage ; la flamme part à l'extérieur du virage */
        this.airS += (clamp(this.air, 0, 1) - this.airS) * Math.min(1, dt * 9); this.glS += (clamp(this.gl, 0, 1) - this.glS) * Math.min(1, dt * 7); this.bleuS += (clamp(this.bleu, 0, 1) - this.bleuS) * Math.min(1, dt * 5);
        this.panS += (clamp(-this.vir, -1, 1) * (.35 + .65 * this.glS) - this.panS) * Math.min(1, dt * 7);
        /* combien de cylindres crachent : l'appui les allume un à un (cascade), le lâcher les éteint un à un */
        const litT = on ? Math.max(1, this.nc * Math.pow(clamp((tgt - .04) / .8, 0, 1), .9)) : 0;
        if (litT > this.litF) this.litF = Math.min(litT, this.litF + this.nc * dt / this.casc); else this.litF = Math.max(litT, this.litF - this.nc * dt / (P.decasc * (.6 + .6 * Math.min(1, this.heat))));
        /* le tuyau : il chauffe quand on tient (ses modes montent), il refroidit après ; en vol il est plus mat ; le 2e étage le pousse encore */
        this.chaud += ((on ? sp : 0) - this.chaud) * Math.min(1, dt / (on ? P.chauffeT : P.chauffeT * 1.4));
        const fp = P.tuyau * this.pers.tk * (1 + P.chauffe * this.chaud + .1 * this.bleuS), q = P.tuyauQ * (1 - .3 * this.airS); this.fp = fp;
        md[0].set('bp', fp, q, 0, sr); md[1].set('bp', fp * P.mode2, q * 1.15, 0, sr); md[2].set('bp', fp * P.mode3, q * 1.3, 0, sr);
        /* le panache : sa taille (l'appui) place le plafond du rugissement ; en vol, plus de sol pour renvoyer le grave */
        const fr = (P.roarLo + (P.roarHi - P.roarLo) * sp) * this.pers.rc * (1 + .12 * this.bleuS);
        this.rLP1.set('lp', fr, .7, 0, sr); this.rLP2.set('lp', fr * 1.6, .6, 0, sr);
        const hpf = 70 + 60 * this.airS; if (Math.abs(hpf - this.rHPf) > 2) { this.rHPf = hpf; this.rHP.set('hp', hpf, .7, 0, sr); }
        /* la turbulence (log-normale, ~12 Hz) et le gain du panache : calculés ici, lissés à l'échantillon */
        const kz = 1 - Math.exp(-TAU * P.turbHz * dt); this.tz += (this.g() - this.tz) * kz;
        const sg = P.turbS * (.7 + .5 * sp); this.tfT = Math.exp(sg * this.tz / Math.sqrt(kz / (2 - kz) / 3) - sg * sg / 2);
        if (this.gulp > 0) { this.gulpT += dt; if (this.gulpT > P.hoquet) { this.gulp = 0; this.surge = 1; this.petarade(1, .5 + .3 * sp, .008, .6, false); } }
        this.surge *= .93;
        this.gRT = Math.pow(fa, 1.1) * Math.pow(sp * .8 + .2, 1.2) * P.roarG * (this.gulp > 0 ? .12 : 1 + .45 * this.surge) * Math.min(1, this.litF / Math.max(1, this.nc * .5));
        this.cylT -= dt; if (this.cylT <= 0) { this.cylT = .25; for (let k = 0; k < 16; k++) this.cyl[k] = clamp(this.cyl[k] + (this.rnd() - .5) * .18 + (1 - this.cyl[k]) * .06, .55, 1.5); }
      }
      /* ---- les allumages du moteur : la cadence est la note ---- */
      this.ph += f0 * dS; if (this.ph >= 1) { this.ph -= 1; this.allumage(); }
      if (this.dblT > 0 && --this.dblT === 0) { this.petarade(.8, 1.15 * this.dblA, .02, .95, true); this.surge = 1; this.paquets(.5 + .5 * this.dblA, .09); }
      const w = this.g(), w2 = this.g();
      /* ---- LA FLAMME PULSÉE : le coup du cylindre (pression + bruit de combustion) dans le tuyau ---- */
      const e = this.pe; let jet = 0, side = 0;
      if (e > 1e-5) {
        this.pe = e * this.peD; const ex = e * (1 + P.jetBruit * w2);
        jet = md[0].p(ex) + md[1].p(ex) * c2 + md[2].p(ex) * c3;
        side = this.jetS.p(w) * e * larg;
      } else if (this.jetOn) { jet = md[0].p(0) + md[1].p(0) * c2 + md[2].p(0) * c3; side = this.jetS.p(0) * 0; }
      this.jetOn = e > 1e-5 || Math.abs(jet) > 1e-6;
      jet = th(jet * drv) * jG * P.jetPol;
      /* ---- LE PANACHE : rugissement turbulent, haché par les coups, puis son peigne (retard = la période de la note) ---- */
      this.tf += (this.tfT - this.tf) * .003; this.gR += (this.gRT - this.gR) * .004;
      let flame = 0;
      if (this.gR > 1e-5 || Math.abs(this.cz) > 1e-6) {
        const roar = this.rLP2.p(this.rLP1.p(this.rHP.p(w))) * 2.6 * this.tf * this.gR * (1 - P.roarPuls + P.roarPuls * Math.min(1.5, e * 1.3));
        this.cD += (sr / f0 - this.cD) * .002;
        const D = clamp(this.cD, 4, len - 4); let rp = this.cw - D; if (rp < 0) rp += len; const ri = rp | 0, fr2 = rp - ri;
        const d0 = this.cb[ri], d1 = this.cb[ri + 1 < len ? ri + 1 : 0], dl = d0 + (d1 - d0) * fr2;
        this.cz += (dl - this.cz) * (1 - P.combDamp);                                   /* la perte dans la boucle : les aigus meurent vite → chaud */
        const fb = clamp(P.combFb * (.55 + .45 * sp), 0, .92);
        this.cb[this.cw] = roar + this.cz * fb; if (++this.cw >= len) this.cw = 0;
        const comb = this.cz * (1 - fb * .6) * 1.1;
        flame = (roar * (1 - P.combMix) * G.roar + comb * P.combMix * G.comb) * mixF;
        if (Ac) { Ac.roar = (Ac.roar || 0) + roar * roar; Ac.comb = (Ac.comb || 0) + comb * comb; }
      }
      /* ---- LES BOUFFÉES (pétarades, crachats, tics) ---- */
      let bL = 0, bR = 0;
      for (let k = 0; k < nV; k++) { const v = vo[k]; if (v.u > 1e-4) {
        const env = v.u - v.ua; v.u *= v.d; v.ua *= .9; let x = v.f.p(this.g()) * env * v.a * 2.4;
        if (v.thump > 0) { v.tph += v.tf * dS; x += Math.sin(TAU * v.tph) * env * v.thump * v.a; }
        x *= v.tic ? G.tic : G.burst; bL += x * (1 - v.pan * .5); bR += x * (.5 + v.pan * .5); } }
      /* ---- CLIC, WHUMP, CLAC, PURGE ---- */
      let ev = 0;
      if (this.clE > 1e-4) { const ck = this.clLP.p(this.clF.p(w2)) * this.clE * P.clickG * 5; this.clE *= .99; ev += ck * G.click; if (Ac) Ac.click = (Ac.click || 0) + ck * ck; }
      if (this.whE > 1e-4) { this.whT += dS; const T = this.whT, sw = (1 - Math.exp(-T / .06)) * Math.exp(-T / .3), f = this.pers.wf * (1 + .9 * Math.exp(-T / .1)) * .55;
        this.whPh += f * dS; if (this.whPh >= 1) this.whPh -= 1;
        const wh = (this.whLP.p(w) * 2.4 * sw + Math.sin(TAU * this.whPh) * (1 - Math.exp(-T / .02)) * Math.exp(-T / .26) * .9) * P.whumpG * this.whA; if (T > 1.8) this.whE = 0;
        ev += wh * G.whump; if (Ac) Ac.whump = (Ac.whump || 0) + wh * wh; }
      if (this.caE > 1e-4) { this.caP1 += this.caF1 * dS; this.caP2 += this.caF2 * dS; const c = this.caE;
        const ca = (Math.sin(TAU * this.caP1) * c + Math.sin(TAU * this.caP2) * c * c * .6) * P.clacG * this.caA; this.caE *= .9977;        /* deux modes amortis : ~18 ms et ~9 ms */
        ev += ca * G.clac; if (Ac) Ac.clac = (Ac.clac || 0) + ca * ca; }
      if (this.puE > 1e-4) { const pu = this.puLP.p(this.puF.p(w)) * this.puE * P.purgeG * 2.6 * this.puA; this.puE *= this.puD; ev += pu * G.purge; if (Ac) Ac.purge = (Ac.purge || 0) + pu * pu; }
      if (Ac) { Ac.mec = (Ac.mec || 0) + this.tm[0][i] * this.tm[0][i]; Ac.jet = (Ac.jet || 0) + jet * jet; Ac.burst = (Ac.burst || 0) + bL * bL; }
      /* ---- LE MÉLANGE : la flamme et les bouffées partent à l'extérieur du virage ; le grave reste au centre ---- */
      const pL = 1 - .45 * this.panS, pR = 1 + .45 * this.panS;
      let l = this.tm[0][i] * mixM + flame + ev + (jet + side + bL * mixF) * pL, r = this.tm[1][i] * mixM + flame + ev + (jet - side + bR * mixF) * pR;
      /* ---- LE GARDE-OREILLES : la bande 2-6 kHz limitée seule ---- */
      const hl = this.hf2[0].p(this.hf[0].p(l)), hr = this.hf2[1].p(this.hf[1].p(r)), ah = Math.abs(hl), ahr = Math.abs(hr), eh = ah > ahr ? ah : ahr;
      this.hfE += (eh - this.hfE) * (eh > this.hfE ? .05 : .0015);
      if ((i & 15) === 0) this.hfT = this.hfE > P.aiguMax ? Math.pow(P.aiguMax / this.hfE, 1 - 1 / P.aiguRatio) : 1;
      this.hfG += (this.hfT - this.hfG) * (this.hfT < this.hfG ? .02 : .0008);
      l -= hl * (1 - this.hfG); r -= hr * (1 - this.hfG);
      l = this.outLP[1].p(this.outLP[0].p(l)); r = this.outLP[3].p(this.outLP[2].p(r));       /* 24 dB par octave */
      L[off + i] = th(l) * P.master; if (R) R[off + i] = th(r) * P.master;     /* la crête ne dépasse jamais 1 */
    }
  };
  /* l'appui : un clic, un whump à la taille de la vitesse du doigt, la durée de la cascade d'allumage, et un nouveau CARACTÈRE tiré au hasard */
  NP.appui = function (vit) {
    const q = clamp(vit / 6, .25, 1);
    this.pers = { rc: .88 + .24 * this.rnd(), bk: .7 + .6 * this.rnd(), wf: 56 + 16 * this.rnd(), wk: .8 + .4 * this.rnd(), tk: .94 + .12 * this.rnd() };
    this.casc = this.P.cascade * (1.55 - q) * (.85 + .3 * this.rnd());          /* un coup sec = une cascade courte (0,1 s), un doigt lent = un long bégaiement (0,25 s) */
    this.clE = q; this.clF.set('bp', 1300 + 500 * this.rnd(), 1.4, 0, this.sr);
    this.whE = 1; this.whT = 0; this.whA = .45 + .55 * q; this.mec.ignite(); this.repQ.length = 0;
    if (q > .6) this.petarade(1.4, .45 * q, .008, .6, false);
  };
  /* le lâcher : le clac de la soupape, puis (appui tenu) la purge et la postcombustion par paquets à la taille de la chaleur — ou (coup bref) un simple crachat */
  NP.relache = function (bref) {
    const h = clamp(this.heat, 0, 1.4);
    this.caE = 1; this.caP1 = 0; this.caP2 = 0; this.caF1 = 290 + 50 * this.rnd(); this.caF2 = 800 + 160 * this.rnd(); this.caA = bref ? .7 : .6 + .4 * Math.min(1, h);
    if (bref) { this.repQ.length = 0; this.repQ.push({ n: Math.max(2, Math.round(.035 * this.fS)), a: .6, th: .5, tau: .007, grave: false }, { n: Math.max(3, Math.round(.07 * this.fS)), a: .8, th: .9, tau: .016, grave: true }); this.heat *= .5; return; }
    this.puE = 1; this.puA = clamp(h, .2, 1.2); this.puD = Math.exp(-1 / (this.sr * (.16 + .12 * this.puA))); this.puF.set('bp', 900 + 500 * this.rnd(), .7, 0, this.sr);
    this.paquets(h, .06); this.heat *= .5;
  };
  const PRESETS = {
    /* FORGE : le plus mécanique — la râpe, le poing et les tics devant, des coups de flamme durs et serrés dans un tuyau court */
    forge: { mixM: .68, mixF: 1, jetG: 1.3, mode2G: 1.3, mode3G: .9, jetDrive: 2.0, jetBruit: .7, roarG: .2, burstP1: .22, burstG: 1.0, combMix: .6, combFb: .74, clickG: .22, clacG: .26, ticG: .16, ticP: .6, outLP: 3800, aiguMax: .05,
      mec: { rapeG: 1.2, rapeHi: 2800, rapeLo: 700, rapeDecay: 13, rapeJit: .75, poingG: .85, poingSat: 3.6, tirageG: .36, outLP: 3600, driveHi: 4.4 } },
    /* BRASIER : le plus flamme — un tuyau plus long et plus sonore, un panache large, des coups plus bruités, beaucoup de crachats, la mécanique en retrait */
    brasier: { mixM: .5, mixF: 1.2, jetG: 1.5, mode2G: 1.1, mode3G: .7, jetBruit: 1.1, jetDrive: 1.3, tuyau: 150, tuyauQ: 4, roarG: .32, burstP1: .34, burstG: 1.0, combMix: .62, combFb: .76, replG: .62, ticG: .08, outLP: 3400, aiguMax: .04, larg: .42, mec: { rapeG: .5, rapeHi: 2200, outLP: 3000 } },
    /* DOUX : la version qui ne fait JAMAIS mal — coupure plus basse, des coups ronds, peu de crachats, une purge courte */
    doux: { mixM: .62, mixF: .85, jetG: 1.5, jetDrive: 1.1, jetBruit: .5, mode3G: .16, roarG: .18, burstP1: .12, burstG: .42, outLP: 2400, aiguMax: .02, replG: .32, clickG: .07, clacG: .12, ticG: .05, ticP: .35, mec: { rapeG: .38, tirageG: .12, outLP: 2200 } }
  };
  const api = { NitroPhysique, PHYSIQUE_DEF: DEF, PHYSIQUE_MEC: MEC, PHYSIQUE_PRESETS: PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroPhysiqueApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
