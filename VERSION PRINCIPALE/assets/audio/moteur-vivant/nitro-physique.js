/* ================= LE NITRO PHYSIQUE (2026-11-10 ; Sacha : « le moteur cyber et le nitro très mécanique et flamme PHYSIQUE, sans que ça fasse mal aux oreilles, avec des variations malignes ») =================
   Fait pour aller avec le MOTEUR BÛCHE CYBER de Léo (assets/audio/moteur-buche/), mais PUR et indépendant : l'hôte écrit la note du moteur `f0` (Hz : `hz`, la note de la bûche
   qu'on entend ; pour le moteur vivant : régime × pitch ÷ 120 × cylindres), `nit` (0..1 : à quel point on appuie), `speed`, `load`, `thr` ; il appelle `rapport()` au passage de rapport.
   Deux parties qui travaillent ENSEMBLE, toutes deux accrochées à la note du moteur :
   LA MÉCANIQUE  la voix de `nitro-matiere.js` (corps saturé, râpe coup par coup, poing grave, plainte de compresseur), réglée DOUCE (preset `physique`), + :
       TICS       à CHAQUE allumage du moteur, un petit tic de culbuteur / d'injecteur (1,2 ms, arrondi à 2,4 kHz) avec une probabilité qui suit l'appui et l'humeur du cylindre : un cliquetis
                  mécanique accroché au rythme du moteur, jamais deux fois le même motif
       CLIC       le solénoïde qui s'ouvre : un clic sec mais rond (passe-bas à 2,6 kHz, attaque 1 ms), d'autant plus fort qu'on appuie vite
       WHUMP      l'allumage : un coup de poitrine qui tombe de 64 à 34 Hz + un souffle qui gonfle ; sa taille suit la VITESSE de l'appui (un coup sec = un gros whump)
       PURGE      au lâcher, le « psssh » de la soupape, d'autant plus long qu'on a tenu et poussé
   LA FLAMME PHYSIQUE  pas un bruit passé dans des filtres (c'est ça qui faisait le vent) : ce qui se passe vraiment dans un tuyau d'échappement qui brûle.
       RUGISSEMENT  le bruit turbulent d'une flamme : un spectre qui plafonne vers 150-500 Hz (selon la taille de la flamme = l'appui) puis retombe à −12 dB/octave, dont l'amplitude
                    fluctue comme les tourbillons (log-normale, 10-15 Hz) — jamais un souffle régulier
       RÉSONANCE    LE point clé : la flamme est DANS le tuyau, et le tuyau l'amplifie à ses modes (couplage thermo-acoustique). Un peigne à rétroaction dont le retard est la période
                    de la note du moteur : le rugissement se met à sonner EXACTEMENT sur les harmoniques du moteur. Voilà pourquoi il s'accroche au lieu de flotter par-dessus.
       BOUFFÉES     à CHAQUE allumage du moteur, un cylindre peut cracher de la flamme : probabilité = appui^1,4 × charge × l'humeur de CE cylindre (chacun a la sienne, qui dérive
                    lentement). Une bouffée = un bruit de 3 à 9 ms dans une bande de 180-520 Hz, d'amplitude log-normale. Le motif des bouffées suit donc l'ordre d'allumage et ne se répète jamais.
       RÉPLIQUE     après le lâcher, les pétarades de postcombustion : un taux qui s'éteint en ~1,4 s, proportionnel à la CHALEUR accumulée (durée de l'appui × force)
       HOQUET       au passage de rapport la flamme est coupée 55 ms (l'injection saute) puis revient en surcharge avec une grosse bouffée
   VARIATIONS MALIGNES : à chaque appui, un « caractère » tiré au hasard (couleur du rugissement ±12 %, densité des bouffées ×0,7-1,3, taille du whump) ; le mélange mécanique/flamme
       suit l'appui (léger = surtout le ronron mécanique, plein = la flamme grande ouverte) ; la flamme dépend de la charge ; rien ne revient deux fois pareil.
   LE GARDE-OREILLES (« sans que ça fasse mal ») : coupe finale à 24 dB/octave, et surtout un limiteur DYNAMIQUE de la bande 2-6 kHz (celle qui pique) : si une bouffée ou une
       attaque y met trop d'énergie, la bande seule est abaissée (jamais tout le son) ; une saturation douce rabote les crêtes. Mesuré : jamais plus brillant que le moteur de plus de ×1,5.
   PUR (aucun DOM, aucun nœud audio) : Float32 stéréo. */
(function (root) {
  'use strict';
  const MVA = (typeof module !== 'undefined' && module.exports) ? require('./moteur-vivant.js') : root.MoteurVivantApi;
  const NMa = (typeof module !== 'undefined' && module.exports) ? require('./nitro-matiere.js') : root.NitroMatiereApi;
  const Bq = MVA.Bq, clamp = MVA.clamp, TAU = Math.PI * 2;
  /* le corps mécanique, RÉGLÉ DOUX pour ne jamais faire mal : coupure à 2,4 kHz, râpe retenue, plainte discrète */
  const MEC = { corpsG: .5, subG: .5, rapeG: .5, rapeDrive: 22, rapeDecay: 9, rapeJit: .55, rapeLo: 600, rapeHi: 1700, poingG: .6, poingSat: 2.6, tirageG: .2, tirageFold: 230, driveLo: 1.4, driveHi: 3.2,
    larg: .55, flick: .1, quinteG: .08, outLP: 2600, attack: .08, release: .5, spool: .6, fwoomG: 0, soupirG: 0 };
  const DEF = {
    master: 1, mixM: 1, mixF: 1,
    roarG: .34, roarLo: 150, roarHi: 520, turbS: .55, turbHz: 12,
    combMix: .55, combFb: .68, combDamp: .55,
    burstG: .55, burstP0: .02, burstP1: .5, burstLo: 180, burstHi: 520, ncyl: 8,
    replG: .45, replTau: 1.3, replRate: 22,
    clickG: .10, whumpG: .38, purgeG: .30, ticG: .10, ticP: .5,
    hoquet: .055,
    aiguMax: .03, aiguRatio: 3, outLP: 3000,
    attack: .06, release: .45, spool: .5
  };
  function NitroPhysique(sr, seed, P) {
    this.sr = sr || 48000; this.isPhysique = true; this.P = Object.assign({}, DEF, P || {}); this.mecP = Object.assign({}, MEC, (P && P.mec) || {});
    let s = (seed || 90909) >>> 0;
    this.rnd = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    this.g = function () { return this.rnd() * 2 - 1; };
    this.nit = 0; this.speed = 0; this.f0 = 0; this.load = 0; this.thr = 0; this.fire = 0;
    this.mec = new NMa.NitroMatiere(this.sr, 31337, this.mecP); this.tm = [new Float32Array(1024), new Float32Array(1024)];
    this.fa = 0; this.fs = 0; this.fS = 90; this.nitPrev = 0; this.tS = 0; this.nitRate = 0; this.held = 0; this.heat = 0; this.ph = 0; this.cnt = 0;
    /* le rugissement : bruit → coupe-bas → deux passe-bas dont la fréquence suit la taille de la flamme */
    this.rHP = new Bq().set('hp', 70, .7, 0, this.sr); this.rLP1 = new Bq(); this.rLP2 = new Bq(); this.rSide = new Bq().set('lp', 900, .7, 0, this.sr);
    this.tz = 0; this.tzK = 1 - Math.exp(-TAU * 12 / this.sr); this.tzSd = Math.sqrt(this.tzK / 6);
    /* le peigne du tuyau */
    this.cb = new Float32Array(Math.ceil(this.sr / 20) + 16); this.cw = 0; this.cD = this.sr / 90; this.cz = 0;
    /* les bouffées : 7 voix */
    this.vo = []; for (let k = 0; k < 7; k++) this.vo.push({ u: 0, ua: 0, d: .99, f: new Bq(), a: 0, pan: .5, thump: 0, tph: 0, tf: 120 });
    this.cyl = new Float32Array(16).fill(1); this.cylT = 0;
    this.rep = 0; this.repT = 0;
    this.pers = { rc: 1, bk: 1, wf: 64, wk: 1 };
    this.clE = 0; this.clF = new Bq().set('bp', 1500, 1.4, 0, this.sr); this.clLP = new Bq().set('lp', 2600, .7, 0, this.sr);
    this.whE = 0; this.whT = 0; this.whPh = 0; this.whA = 1; this.whLP = new Bq().set('lp', 380, .7, 0, this.sr);
    this.puE = 0; this.puF = new Bq().set('bp', 1100, .7, 0, this.sr); this.puLP = new Bq().set('lp', 2200, .7, 0, this.sr); this.puA = 0;
    this.gulp = 0; this.gulpT = 0; this.surge = 0;
    /* le garde-oreilles : la bande 2-6 kHz de chaque canal, son enveloppe, le gain qu'on lui applique */
    this.hf = [new Bq().set('hp', 2000, .7, 0, this.sr), new Bq().set('hp', 2000, .7, 0, this.sr)]; this.hf2 = [new Bq().set('lp', 6000, .7, 0, this.sr), new Bq().set('lp', 6000, .7, 0, this.sr)];
    this.hfE = 0; this.hfG = 1;
    this.outLP = [new Bq(), new Bq(), new Bq(), new Bq()]; this.outF = 0;
    this.ctrlN = 0;
    this.ticLP = new Bq().set('lp', 2400, .7, 0, this.sr);
    this.G = { mec: 1, roar: 1, comb: 1, burst: 1, repl: 1, click: 1, whump: 1, purge: 1, tic: 1 };
    this.rmsAcc = null;
  }
  const NP = NitroPhysique.prototype;
  Object.defineProperty(NP, 'a', { get() { return this.fa; } }); Object.defineProperty(NP, 'sp', { get() { return this.fs; } });   /* l'appui rapide et lissé, lus par les hôtes (compteurs) */
  /* `m_x` règle le corps mécanique, `mixM`/`mixF` l'équilibre, le reste la flamme et les événements */
  NP.setP = function (k, v) { if (k.indexOf('m_') === 0) { this.mec.P[k.slice(2)] = v; this.mecP[k.slice(2)] = v; } else this.P[k] = v; };
  NP.setG = function (k, v) { this.G[k] = v; };
  NP.rapport = function () { this.gulp = 1; this.gulpT = 0; };
  NP.ignite = function () { this.mec.ignite(); };
  /* une bouffée : f centre (Hz), a amplitude, tau durée (s), thump = part du coup grave (pétarade) */
  NP.bouffee = function (f, a, tau, thump) {
    const v = this.vo.reduce((m, x) => x.u < m.u ? x : m);   /* la voix la plus éteinte */
    v.tic = false; v.u = 1; v.ua = 1; v.d = Math.exp(-1 / (this.sr * tau)); v.a = a; v.pan = this.rnd(); v.f.set('bp', f, 2.2, 0, this.sr); v.thump = thump || 0; v.tph = 0; v.tf = 90 + 60 * this.rnd();
  };
  /* un allumage du moteur : chaque cylindre a son humeur ; la probabilité de cracher suit l'appui, la charge et cette humeur */
  NP.allumage = function () {
    const P = this.P, sp = this.fs, k = this.cnt++ % Math.max(2, Math.min(16, P.ncyl | 0));
    const p = (P.burstP0 + P.burstP1 * Math.pow(sp, 1.4)) * (.4 + .6 * clamp(this.load, 0, 1)) * this.cyl[k] * this.pers.bk * (this.gulp > .5 ? .2 : 1);
    if (this.fa > .08 && this.rnd() < P.ticP * (.25 + .75 * sp) * this.cyl[k]) { const v = this.vo.reduce((m, x) => x.u < m.u ? x : m); if (v.u < .05) { this.bouffee(900 + 900 * this.rnd(), P.ticG * (.5 + .8 * this.rnd()) * (.4 + .6 * sp), .0012 + .0008 * this.rnd(), 0); this.vo.forEach(x => { if (x === v) x.tic = true; }); } }
    if (this.fa > .08 && this.rnd() < p) {
      const f = P.burstLo + (P.burstHi - P.burstLo) * this.rnd(), a = Math.exp(.6 * (this.rnd() + this.rnd() + this.rnd() - 1.5)) * (.45 + .55 * sp);   /* log-normale */
      this.bouffee(f, a * P.burstG, .003 + .006 * this.rnd(), 0);
    }
  };
  NP.process = function (L, R, N, off) {
    const sr = this.sr, P = this.P, G = this.G, Ac = this.rmsAcc; off = off || 0;
    if (this.tm[0].length < N) this.tm = [new Float32Array(N), new Float32Array(N)];
    const mec = this.mec; mec.nit = this.nit; mec.speed = this.speed; mec.f0 = this.f0; mec.fire = this.f0;
    mec.process(this.tm[0], this.tm[1], N, 0);
    if (P.outLP !== this.outF) { this.outF = P.outLP; for (let c = 0; c < 4; c++) this.outLP[c].set('lp', P.outLP, c % 2 ? .7 : .6, 0, sr); }
    for (let i = 0; i < N; i++) {
      const tgt = clamp(this.nit, 0, 1);
      this.fa += (tgt - this.fa) * (1 - Math.exp(-1 / (sr * (tgt > this.fa ? P.attack : P.release) + 1)));
      this.fs += (this.fa - this.fs) * (1 - Math.exp(-1 / (sr * Math.max(.05, P.spool))));
      const fa = this.fa, sp = this.fs, thr = this.thr;
      /* la vitesse de l'appui (par seconde) et l'état « tenu » : ils décident du clic, du whump, de la purge */
      this.tS += (tgt - this.tS) * .0008; this.nitRate += ((this.tS - this.nitPrev) * sr - this.nitRate) * .004; this.nitPrev = this.tS;     /* la vitesse de l'appui, sur une consigne lissée (~25 ms) */
      if (tgt > .25) { this.held += 1 / sr; this.heat = Math.min(1.6, this.heat + tgt * (.3 + sp) / sr * .9); }
      else { if (this.held > .25 && fa > .12) this.relache(); this.held = 0; this.heat = Math.max(0, this.heat - 1 / sr * .05); }
      if (tgt > .25 && this.nitPrevB !== true) { this.appui(Math.max(0, this.nitRate)); }
      this.nitPrevB = tgt > .25;
      this.fS += ((this.f0 > 8 ? Math.min(this.f0, 700) : 90) - this.fS) * (1 - Math.exp(-1 / (sr * .02)));
      const f0 = this.fS;
      if ((this.ctrlN++ & 63) === 0) {
        const dt = 64 / sr;
        /* la taille de la flamme (l'appui) place le plafond du rugissement */
        const fr = (P.roarLo + (P.roarHi - P.roarLo) * sp) * this.pers.rc;
        this.rLP1.set('lp', fr, .7, 0, sr); this.rLP2.set('lp', fr * 1.6, .6, 0, sr);
        this.cylT -= dt; if (this.cylT <= 0) { this.cylT = .25; for (let k = 0; k < 16; k++) this.cyl[k] = clamp(this.cyl[k] + (this.rnd() - .5) * .18 + (1 - this.cyl[k]) * .06, .55, 1.5); }
        if (this.gulp > 0) { this.gulpT += dt; if (this.gulpT > P.hoquet) { this.gulp = 0; this.surge = 1; } }
        this.surge *= .93;
      }
      /* ---- les allumages du moteur : la cadence est la note ---- */
      this.ph += f0 / sr; if (this.ph >= 1) { this.ph -= 1; this.allumage(); }
      const w = this.g();
      /* ---- LE RUGISSEMENT : turbulent, log-normal ---- */
      this.tz += (this.g() - this.tz) * this.tzK; const z = this.tz / this.tzSd, sg = P.turbS * (.7 + .5 * sp), tf = Math.exp(sg * z - sg * sg / 2);
      let roar = this.rLP2.p(this.rLP1.p(this.rHP.p(w))) * 2.6;
      const gate = this.gulp > 0 ? .12 : 1 + .45 * this.surge;      /* le hoquet : l'injection saute puis revient en surcharge */
      roar *= tf * Math.pow(fa, 1.1) * Math.pow(sp * .8 + .2, 1.2) * P.roarG * gate;
      const side = this.rSide.p(this.g()) * .35 * Math.abs(roar) * 2;
      /* ---- LA RÉSONANCE DU TUYAU : peigne dont le retard est la période de la note ---- */
      this.cD += (sr / f0 - this.cD) * .002;
      const D = clamp(this.cD, 4, this.cb.length - 4), rp = this.cw - D, ri = Math.floor(rp), fr2 = rp - ri, len = this.cb.length;
      const d0 = this.cb[((ri % len) + len) % len], d1 = this.cb[(((ri + 1) % len) + len) % len], dl = d0 + (d1 - d0) * fr2;
      this.cz += (dl - this.cz) * (1 - P.combDamp);                                   /* la perte dans la boucle : les aigus meurent vite → chaud */
      const fb = clamp(P.combFb * (.55 + .45 * sp), 0, .92);
      this.cb[this.cw] = roar + this.cz * fb; if (++this.cw >= len) this.cw = 0;
      const comb = this.cz * (1 - fb * .6) * 1.1;
      const flame = (roar * (1 - P.combMix) * G.roar + comb * P.combMix * G.comb);
      /* ---- LES BOUFFÉES et la RÉPLIQUE ---- */
      let bL = 0, bR = 0;
      for (let k = 0; k < this.vo.length; k++) { const v = this.vo[k]; if (v.u > 1e-4) {
        const env = v.u - v.ua; v.u *= v.d; v.ua *= .9; const x = v.f.p(this.g()) * env * v.a * 2.4;
        let t = 0; if (v.thump > 0) { v.tph += v.tf / sr; t = Math.sin(TAU * v.tph) * env * v.thump * v.a; }
        const gv = v.tic ? G.tic : G.burst; bL += (x + t) * gv * (1 - v.pan * .5); bR += (x + t) * gv * (.5 + v.pan * .5); } }
      if (this.rep > 0) { this.repT -= 1 / sr; this.rep *= Math.exp(-1 / (sr * P.replTau));
        if (this.repT <= 0) { this.repT = -Math.log(this.rnd() + 1e-4) / Math.max(1, P.replRate * this.rep); const a = .4 + .8 * this.rnd() * this.rep; this.bouffee(130 + 190 * this.rnd(), a * P.replG * 2, .006 + .012 * this.rnd(), .5 + .4 * this.rnd()); } }
      /* ---- CLIC, WHUMP, PURGE ---- */
      let ck = 0; if (this.clE > 1e-4) { ck = this.clLP.p(this.clF.p(this.g())) * this.clE * P.clickG * 5; this.clE *= .99; }
      let wh = 0;
      if (this.whE > 1e-4) { this.whT += 1 / sr; const sw = (1 - Math.exp(-this.whT / .06)) * Math.exp(-this.whT / .3), f = this.pers.wf * (1 + .9 * Math.exp(-this.whT / .1)) * .55 + 0;
        this.whPh += f / sr; if (this.whPh >= 1) this.whPh -= 1; wh = (this.whLP.p(w) * 2.4 * sw + Math.sin(TAU * this.whPh) * (1 - Math.exp(-this.whT / .02)) * Math.exp(-this.whT / .26) * .9) * P.whumpG * this.whA; if (this.whT > 1.8) this.whE = 0; }
      let pu = 0; if (this.puE > 1e-4) { pu = this.puLP.p(this.puF.p(w)) * this.puE * P.purgeG * 2.6 * this.puA; this.puE *= Math.exp(-1 / (sr * (.16 + .12 * this.puA))); }
      if (Ac) { const q = (k, v) => { Ac[k] = (Ac[k] || 0) + v * v; }; q('mec', this.tm[0][i]); q('roar', roar); q('comb', comb); q('burst', bL); q('click', ck); q('whump', wh); q('purge', pu); }
      const m0 = this.tm[0][i] * P.mixM * G.mec, m1 = this.tm[1][i] * P.mixM * G.mec;
      const fl = flame * P.mixF, ev = (ck * G.click + wh * G.whump + pu * G.purge);
      let l = m0 + fl + side * P.mixF + bL * P.mixF + ev, r = m1 + fl - side * P.mixF + bR * P.mixF + ev;
      /* ---- LE GARDE-OREILLES : la bande 2-6 kHz limitée seule ---- */
      const hl = this.hf2[0].p(this.hf[0].p(l)), hr = this.hf2[1].p(this.hf[1].p(r)), e = Math.max(Math.abs(hl), Math.abs(hr));
      this.hfE += (e - this.hfE) * (e > this.hfE ? .05 : .0015);
      const gT = this.hfE > P.aiguMax ? Math.pow(P.aiguMax / this.hfE, 1 - 1 / P.aiguRatio) : 1; this.hfG += (gT - this.hfG) * (gT < this.hfG ? .02 : .0008);
      l -= hl * (1 - this.hfG); r -= hr * (1 - this.hfG);
      l = this.outLP[1].p(this.outLP[0].p(l)); r = this.outLP[3].p(this.outLP[2].p(r));       /* 24 dB par octave */
      L[off + i] = Math.tanh(l * .9) / .9 * P.master; if (R) R[off + i] = Math.tanh(r * .9) / .9 * P.master;
    }
  };
  /* l'appui : un clic, un whump à la taille de la vitesse d'appui, et un nouveau CARACTÈRE tiré au hasard */
  NP.appui = function (vit) {
    const q = clamp(vit / 6, .25, 1);
    this.pers = { rc: .88 + .24 * this.rnd(), bk: .7 + .6 * this.rnd(), wf: 56 + 16 * this.rnd(), wk: .8 + .4 * this.rnd() };
    this.clE = q; this.clF.set('bp', 1300 + 500 * this.rnd(), 1.4, 0, this.sr);
    this.whE = 1; this.whT = 0; this.whA = .45 + .55 * q; this.mec.ignite();
    if (q > .6) this.bouffee(240 + 120 * this.rnd(), .9 * q * this.P.burstG, .008, .6);
  };
  /* le lâcher : la purge et la réplique, à la taille de la chaleur accumulée */
  NP.relache = function () {
    const h = clamp(this.heat, 0, 1.4);
    this.puE = 1; this.puA = clamp(h, .2, 1.2); this.puF.set('bp', 900 + 500 * this.rnd(), .7, 0, this.sr);
    this.rep = clamp(h, 0, 1.2); this.repT = .05; this.heat *= .5;
  };
  const PRESETS = {
    /* FORGE : le plus mécanique — la râpe, le poing et les tics devant, une flamme franche mais courte. Mesuré face au moteur de Léo : aussi brillant que lui (2-6 kHz : 0,6 % contre 0,6 %) */
    forge: { mixM: 1.05, mixF: 1, roarG: .36, burstP1: .6, burstG: 1.1, burstLo: 220, burstHi: 900, combMix: .6, combFb: .74, clickG: .22, ticG: .16, ticP: .6, outLP: 3800, aiguMax: .05,
      mec: { rapeG: 1.2, rapeHi: 2800, rapeLo: 700, rapeDecay: 13, rapeJit: .75, poingG: .85, poingSat: 3.6, tirageG: .36, outLP: 3600, driveHi: 4.4 } },
    /* BRASIER : le plus flamme — un rugissement large, beaucoup de bouffées, la mécanique en retrait */
    brasier: { mixM: .8, mixF: 1.2, roarG: .5, burstP1: .7, burstG: 1.0, burstHi: 800, combMix: .62, combFb: .76, replG: .62, ticG: .08, outLP: 3400, aiguMax: .04, mec: { rapeG: .5, rapeHi: 2200, outLP: 3000 } },
    /* DOUX : la version qui ne fait JAMAIS mal — coupure plus basse, peu de bouffées, une purge courte */
    doux: { mixM: .9, mixF: .85, roarG: .3, burstP1: .34, burstG: .42, outLP: 2400, aiguMax: .02, replG: .32, clickG: .07, ticG: .05, ticP: .35, mec: { rapeG: .38, tirageG: .12, outLP: 2200 } }
  };
  const api = { NitroPhysique, PHYSIQUE_DEF: DEF, PHYSIQUE_MEC: MEC, PHYSIQUE_PRESETS: PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NitroPhysiqueApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
