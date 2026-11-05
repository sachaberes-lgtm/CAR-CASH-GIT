/* ===== LE GÉNÉRATEUR DE MOTEURS du MINI CASH (2026-11-05, session SON ; Sacha : « un générateur de moteurs qui crée des variations avec des réglages compliqués, mais moi j'appuie et ça génère ») =====
   UNE GRAINE (un entier) → UN MOTEUR complet : une fiche pour `MoteurVivant` (assets/audio/moteur-vivant/moteur-vivant.js, le même DSP que le jeu) et des
   réglages pour `NitroVivant` (le nitro assorti). La même graine redonne toujours le même moteur : on peut la noter, la partager, la remettre dans l'adresse (?graine=).
   COMMENT ON TIRE SANS FAIRE DE BRUIT MOCHE : on ne tire pas les 40 réglages au hasard (ça donne une soufflerie), on tire d'abord une FAMILLE (V8 croisé,
   4 en ligne, boxer, 5 cylindres, V12…) qui fixe l'ordre d'allumage et les plages qui sonnent juste pour elle, puis chaque réglage DANS sa plage. Les plages
   sont calées sur les trois fiches du jeu (v8, flat, l6), élargies d'environ ±30 %.
   PUR : pas de DOM, pas d'audio. `MiniGen.genere(graine)` → { graine, nom, famille, fiche, nitro, sante } · `MiniGen.mute(moteur, force)` → un cousin. */
(function (root) {
  'use strict';
  function Rng(seed) {
    let s = (seed >>> 0) || 1;
    const r = function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    r.entre = function (a, b) { return a + (b - a) * r(); };
    r.choix = function (t) { return t[Math.floor(r() * t.length) % t.length]; };
    r.pile = function (p) { return r() < p; };
    return r;
  }
  const arr = function (x, n) { const k = Math.pow(10, n == null ? 3 : n); return Math.round(x * k) / k; };

  /* LES FAMILLES. slot = la bancade de chaque coup dans l'ordre d'allumage (deux bancades = deux tuyaux, un par oreille).
     Des paquets inégaux dans une bancade (boxer, V8 croisé, 5 cylindres) = le gargouillis ; une alternance régulière = un chant lisse.
     idle/limit : ralenti et rupteur (tr/min) · pipe : longueur de tuyau (m) · lope : gargouillis · rasp : râpe · pop : pétarades au lâcher · pitch : hauteur
     form : la gorge du pot [Hz] · pan : écart des deux tuyaux dans les oreilles · poids : chance d'être tiré. */
  const FAM = [
    { id: 'v8x', nom: 'V8 CROISÉ', n: 8, slot: [[0, 1, 1, 0, 1, 0, 0, 1]], idle: [700, 820], limit: [6300, 7400], pipe: [.9, 1.25], lope: [.55, .95], rasp: [.45, .75], pop: [.45, .8], pitch: [.66, .78], form: [82, 108], pan: [.5, .7], turbo: .15, poids: 3 },
    { id: 'v8p', nom: 'V8 PLAT', n: 8, slot: [[0, 1, 0, 1, 0, 1, 0, 1]], idle: [850, 1000], limit: [8200, 9400], pipe: [.62, .86], lope: [.12, .3], rasp: [.65, .9], pop: [.25, .45], pitch: [.7, .82], form: [115, 140], pan: [.3, .5], turbo: .25, poids: 2 },
    { id: 'l4', nom: '4 EN LIGNE', n: 4, slot: [[0, 1, 0, 1], [0, 1, 1, 0]], idle: [780, 950], limit: [7000, 9000], pipe: [.7, 1.0], lope: [.1, .3], rasp: [.55, .85], pop: [.35, .7], pitch: [.8, .95], form: [100, 135], pan: [.12, .3], turbo: .4, poids: 2 },
    { id: 'box4', nom: 'BOXER 4', n: 4, slot: [[0, 0, 1, 1]], idle: [720, 860], limit: [6800, 7800], pipe: [.85, 1.15], lope: [.45, .8], rasp: [.5, .75], pop: [.4, .75], pitch: [.74, .86], form: [88, 112], pan: [.4, .6], turbo: .5, poids: 2 },
    { id: 'l5', nom: '5 CYLINDRES', n: 5, slot: [[0, 1, 1, 0, 1], [0, 0, 1, 1, 1]], idle: [760, 900], limit: [6800, 8000], pipe: [.85, 1.15], lope: [.3, .55], rasp: [.55, .8], pop: [.45, .8], pitch: [.72, .85], form: [92, 118], pan: [.3, .5], turbo: .45, poids: 2 },
    { id: 'l6', nom: '6 EN LIGNE', n: 6, slot: [[0, 1, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]], idle: [700, 820], limit: [6800, 7600], pipe: [1.05, 1.3], lope: [.15, .32], rasp: [.5, .7], pop: [.28, .5], pitch: [.68, .8], form: [80, 100], pan: [.15, .3], turbo: .4, poids: 2 },
    { id: 'v6', nom: 'V6', n: 6, slot: [[0, 1, 0, 1, 0, 1], [0, 1, 1, 0, 1, 0]], idle: [740, 880], limit: [7000, 8200], pipe: [.8, 1.1], lope: [.25, .5], rasp: [.55, .8], pop: [.35, .65], pitch: [.72, .84], form: [95, 120], pan: [.35, .55], turbo: .35, poids: 2 },
    { id: 'v10', nom: 'V10', n: 10, slot: [[0, 1, 0, 1, 0, 1, 0, 1, 0, 1]], idle: [900, 1050], limit: [8400, 9200], pipe: [.6, .82], lope: [.1, .25], rasp: [.7, .95], pop: [.25, .45], pitch: [.68, .78], form: [120, 150], pan: [.3, .5], turbo: .1, poids: 1 },
    { id: 'v12', nom: 'V12', n: 12, slot: [[0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]], idle: [850, 980], limit: [8200, 9300], pipe: [.6, .85], lope: [.06, .18], rasp: [.6, .85], pop: [.2, .4], pitch: [.6, .72], form: [118, 150], pan: [.25, .45], turbo: .1, poids: 1 },
    { id: 'l3', nom: '3 CYLINDRES', n: 3, slot: [[0, 1, 0]], idle: [800, 950], limit: [6400, 7600], pipe: [.8, 1.1], lope: [.3, .6], rasp: [.5, .75], pop: [.4, .7], pitch: [.85, 1.0], form: [100, 130], pan: [.15, .3], turbo: .45, poids: 1 }
  ];
  const SURNOMS = ['Taureau', 'Frelon', 'Comète', 'Vipère', 'Ouragan', 'Corbeau', 'Requin', 'Tonnerre', 'Brasier', 'Lynx', 'Fantôme', 'Cobra', 'Orage', 'Faucon', 'Volcan', 'Scorpion', 'Mistral', 'Dragon', 'Panthère', 'Météore', 'Grizzly', 'Piranha', 'Typhon', 'Bison', 'Spectre', 'Chacal', 'Titan', 'Éclair', 'Mammouth', 'Guêpe'];

  function tireFamille(r) {
    let tot = 0; for (const f of FAM) tot += f.poids;
    let x = r() * tot; for (const f of FAM) { x -= f.poids; if (x <= 0) return f; }
    return FAM[0];
  }

  function genere(graine) {
    graine = (graine >>> 0) || 1;
    const r = Rng(graine * 2654435761 + 12345);
    const F = tireFamille(r), E = r.entre;
    const pipe0 = E(F.pipe[0], F.pipe[1]);
    const limit = Math.round(E(F.limit[0], F.limit[1]) / 50) * 50;
    const turbo = r.pile(F.turbo * .6);  /* turbos plus rares : leur sifflet est la couche la plus aiguë du moteur */
    const mat = r(); /* 0 = mat et sourd, 1 = un peu plus clair : tire plusieurs réglages dans le même sens, sinon ils s'annulent */
    /* ⚠ LES PLAGES « DOUCES » (2026-11-05, après « tous les sons sont horribles ») : râpe divisée par deux, coups plus longs (ronds), corps et aigus
       coupés bas, admission discrète, saturation qui ne mord plus sous charge, hauteur descendue de 12 %, gorge du pot plus marquée (le ronron).
       Mesuré au banc (atelier-son/mini-cash/banc.cjs) : l'énergie au-dessus de 1,5 kHz tombe de ~10 dB avant même le filtre doux. */
    const fiche = {
      nom: F.nom, n: F.n, slot: r.choix(F.slot).slice(),
      idle: Math.round(E(F.idle[0], F.idle[1]) / 10) * 10, limit: limit, redline: limit - Math.round(E(250, 450) / 50) * 50,
      pipe: [arr(pipe0), arr(pipe0 * E(1.01, 1.1))],
      r: arr(-E(.5, .66)), damp: arr(.5 - .12 * mat + E(-.04, .04)),
      form: [Math.round(E(F.form[0], F.form[1]) * .9), arr(E(1.1, 1.6), 2), arr(E(4, 6.5), 1)],
      form2: [Math.round(E(160, 230)), arr(E(.9, 1.3), 2), arr(E(1.5, 3), 1)],
      bodyLP: Math.round(1600 + 900 * mat + E(-150, 150)), hp: Math.round(E(30, 38)),
      eq: [['ls', 110, 0, arr(-E(1, 3), 1)], ['hs', Math.round(E(1000, 1400)), 0, arr(-E(7, 11), 1)]],
      lope: arr(E(F.lope[0], F.lope[1])), rasp: arr(E(F.rasp[0], F.rasp[1]) * .5), tau: arr(E(.0011, .0017), 5),
      popRate: arr(E(F.pop[0], F.pop[1])), ticks: arr(E(.1, .3), 2), intake: arr(E(.08, .22), 2), pan: arr(E(F.pan[0], F.pan[1]), 2),
      cutMs: [Math.round(E(50, 66)), Math.round(E(72, 96))],
      pitch: arr(E(F.pitch[0], F.pitch[1]) * .88), sat: arr(E(.9, 1.05), 2), satLoad: arr(E(.3, .7), 2),
      tickF: Math.round(E(2200, 3000)), muff: arr(E(.22, .36)), clac: arr(E(.00025, .0004), 5), dryF: Math.round(E(600, 950)),
      knockF: Math.round(E(5200, 7200)), noiseMix: arr(E(.3, .5), 2)
    };
    if (turbo) fiche.turbo = { spool: arr(E(.4, .75), 2), whine: arr(E(.35, .6), 2) };
    /* LES COUCHES du moteur vivant (ses gains `G`) : le claquement direct du pot, le cliquetis, le raclement et le coup de bielle sont les sons qui
       FONT MAL ; on les baisse ou on les coupe. Le choc de tôle (atterrissage) reste, à moitié. */
    const couches = { dry: arr(E(.25, .45), 2), knock: 0, grind: 0, rod: .3, tick: arr(E(.2, .4), 2), tink: .5, clank: .5, turbo: .45, starter: .7, intake: .8, pipe: 1 };
    /* LE NITRO ASSORTI : chaud et rond (flamme grave, le ton qui chante dessous), le souffle et le sifflet en retrait, des crépitements feutrés
       (pops plus graves et moins forts, plus nombreux : un feu qui craque, pas un fusil). La flamme est d'autant plus grave que le moteur est gros. */
    const gros = F.n >= 8 ? 1 : F.n >= 6 ? .6 : .3;
    const nitro = {
      roarG: arr(E(.5, .7), 2), roarF: Math.round(E(150, 240) * (1.15 - .3 * gros)), roarBody: arr(E(.25, .5), 2), roarFlutHz: arr(E(12, 22), 1), roarFlut: arr(E(.2, .4), 2), roarTurb: arr(E(.25, .45), 2),
      hissG: arr(E(.04, .09), 2), hissF: Math.round(E(1100, 1700)), hissQ: arr(E(.6, .9), 2),
      whineG: arr(turbo ? E(.03, .06) : E(.015, .035), 3), whineF0: Math.round(E(500, 800)), whineF1: Math.round(E(1700, 2500)), whineQ: Math.round(E(14, 24)), whineWob: arr(E(.006, .015), 3),
      toneG: arr(E(.1, .16), 2), toneF0: Math.round(E(60, 100) * (1.15 - .3 * gros)), toneF1: Math.round(E(190, 300)), toneHarm: arr(E(.25, .5), 2),
      popRate: Math.round(E(10, 18)), popG: arr(E(.3, .45), 2), popTone: Math.round(E(420, 750)), popBig: arr(E(.06, .14), 2),
      boomG: arr(E(.45, .65), 2), boomF: Math.round(E(40, 54)), boomWhoosh: arr(E(.3, .5), 2),
      bovG: arr(turbo ? E(.15, .25) : E(.06, .12), 2), bovF: Math.round(E(1800, 2600)),
      attack: arr(E(.12, .2), 2), release: arr(E(.3, .5), 2), spool: arr(E(.5, .85), 2)
    };
    const surnom = r.choix(SURNOMS);
    return { graine: graine, nom: F.nom + (turbo ? ' TURBO' : '') + ' « ' + surnom + ' »', famille: F.id, fiche: fiche, nitro: nitro, couches: couches, sante: 1, mute: 0 };
  }

  /* UN COUSIN : même famille, même ordre d'allumage, les réglages bougent de ±force (0..1). Pour « j'aime bien, mais un peu plus ci ». */
  function mute(m, force, graine) {
    force = force == null ? .25 : force;
    const r = Rng((graine >>> 0) || (Date.now() >>> 0));
    const c = JSON.parse(JSON.stringify(m)), f = c.fiche, nz = c.nitro;
    const bouge = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v * (1 + force * (r() * 2 - 1)))); };
    f.pipe = [arr(bouge(f.pipe[0], .4, 1.6)), 0]; f.pipe[1] = arr(f.pipe[0] * (1.01 + .09 * r()));
    f.lope = arr(bouge(f.lope, .03, 1)); f.rasp = arr(bouge(f.rasp, .1, .5)); f.popRate = arr(bouge(f.popRate, .15, 1));
    f.damp = arr(bouge(f.damp, .2, .65)); f.pitch = arr(bouge(f.pitch, .48, .92)); f.intake = arr(bouge(f.intake, .05, .3), 2);
    f.bodyLP = Math.round(bouge(f.bodyLP, 1300, 2800)); f.form[0] = Math.round(bouge(f.form[0], 70, 160));
    f.satLoad = arr(bouge(f.satLoad, .2, .8), 2); f.tau = arr(bouge(f.tau, .0009, .002), 5);
    nz.roarF = Math.round(bouge(nz.roarF, 100, 300)); nz.popRate = Math.round(bouge(nz.popRate, 6, 22)); nz.popTone = Math.round(bouge(nz.popTone, 350, 900));
    nz.toneF0 = Math.round(bouge(nz.toneF0, 50, 160)); nz.roarFlutHz = arr(bouge(nz.roarFlutHz, 10, 34), 1);
    c.mute = (m.mute || 0) + 1;
    c.nom = m.nom.replace(/ · v\d+$/, '') + ' · v' + (c.mute + 1);
    return c;
  }

  const api = { genere: genere, mute: mute, FAM: FAM, Rng: Rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MiniGen = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
