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
    const turbo = r.pile(F.turbo);
    const mat = r(); /* 0 = mat et sourd, 1 = clair et métallique : tire plusieurs réglages dans le même sens, sinon ils s'annulent */
    const fiche = {
      nom: F.nom, n: F.n, slot: r.choix(F.slot).slice(),
      idle: Math.round(E(F.idle[0], F.idle[1]) / 10) * 10, limit: limit, redline: limit - Math.round(E(250, 450) / 50) * 50,
      pipe: [arr(pipe0), arr(pipe0 * E(1.01, 1.1))],
      r: arr(-E(.5, .7)), damp: arr(.48 - .2 * mat + E(-.05, .05)),
      form: [Math.round(E(F.form[0], F.form[1])), arr(E(1.2, 1.9), 2), arr(E(2.8, 5), 1)],
      form2: [Math.round(E(170, 260)), arr(E(.9, 1.3), 2), arr(E(1.2, 3), 1)],
      bodyLP: Math.round(2800 + 2000 * mat + E(-300, 300)), hp: Math.round(E(32, 42)),
      eq: [['ls', 110, 0, arr(-E(2.5, 5), 1)], ['hs', Math.round(E(1300, 1900)), 0, arr(-E(4, 9), 1)]],
      lope: arr(E(F.lope[0], F.lope[1])), rasp: arr(E(F.rasp[0], F.rasp[1])), tau: arr(E(.0006, .0011), 5),
      popRate: arr(E(F.pop[0], F.pop[1])), ticks: arr(E(.5, 1.1), 2), intake: arr(E(.18, .5), 2), pan: arr(E(F.pan[0], F.pan[1]), 2),
      cutMs: [Math.round(E(40, 62)), Math.round(E(66, 92))],
      pitch: arr(E(F.pitch[0], F.pitch[1])), sat: arr(E(.95, 1.25), 2), satLoad: arr(E(.6, 1.3), 2),
      tickF: Math.round(E(2600, 4000)), muff: arr(E(.18, .34)), clac: arr(E(.0004, .0008), 5), dryF: Math.round(E(850, 1500)),
      knockF: Math.round(E(5200, 7200)), noiseMix: arr(E(.55, .85), 2)
    };
    if (turbo) fiche.turbo = { spool: arr(E(.4, .75), 2), whine: arr(E(.6, 1.2), 2) };
    /* LE NITRO ASSORTI : la flamme est d'autant plus grave que le moteur est gros ; les crépitements (pops) sont TOUJOURS là, c'est la demande */
    const gros = F.n >= 8 ? 1 : F.n >= 6 ? .6 : .3;
    const nitro = {
      roarG: arr(E(.45, .7), 2), roarF: Math.round(E(180, 320) * (1.2 - .35 * gros)), roarBody: arr(E(.2, .5), 2), roarFlutHz: arr(E(14, 30), 1), roarFlut: arr(E(.2, .45), 2), roarTurb: arr(E(.3, .6), 2),
      hissG: arr(E(.1, .22), 2), hissF: Math.round(E(1800, 3200)), hissQ: arr(E(.5, .9), 2),
      whineG: arr(turbo ? E(.1, .2) : E(.04, .12), 2), whineF0: Math.round(E(700, 1200)), whineF1: Math.round(E(3200, 5600)), whineQ: Math.round(E(18, 36)), whineWob: arr(E(.006, .02), 3),
      toneG: arr(E(.06, .14), 2), toneF0: Math.round(E(70, 130) * (1.15 - .3 * gros)), toneF1: Math.round(E(260, 420)), toneHarm: arr(E(.3, .7), 2),
      popRate: Math.round(E(14, 30)), popG: arr(E(.5, .8), 2), popTone: Math.round(E(700, 1400)), popBig: arr(E(.12, .3), 2),
      boomG: arr(E(.55, .85), 2), boomF: Math.round(E(42, 64)), boomWhoosh: arr(E(.35, .65), 2),
      bovG: arr(turbo ? E(.4, .6) : E(.15, .35), 2), bovF: Math.round(E(3400, 5000)),
      attack: arr(E(.07, .14), 2), release: arr(E(.22, .4), 2), spool: arr(E(.45, .8), 2)
    };
    const surnom = r.choix(SURNOMS);
    const sante = r.pile(.12) ? arr(E(.45, .75), 2) : 1; /* une fois sur huit : une vieille caisse qui tousse */
    return { graine: graine, nom: F.nom + (turbo ? ' TURBO' : '') + ' « ' + surnom + ' »', famille: F.id, fiche: fiche, nitro: nitro, sante: sante, mute: 0 };
  }

  /* UN COUSIN : même famille, même ordre d'allumage, les réglages bougent de ±force (0..1). Pour « j'aime bien, mais un peu plus ci ». */
  function mute(m, force, graine) {
    force = force == null ? .25 : force;
    const r = Rng((graine >>> 0) || (Date.now() >>> 0));
    const c = JSON.parse(JSON.stringify(m)), f = c.fiche, nz = c.nitro;
    const bouge = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v * (1 + force * (r() * 2 - 1)))); };
    f.pipe = [arr(bouge(f.pipe[0], .4, 1.6)), 0]; f.pipe[1] = arr(f.pipe[0] * (1.01 + .09 * r()));
    f.lope = arr(bouge(f.lope, .03, 1)); f.rasp = arr(bouge(f.rasp, .3, 1)); f.popRate = arr(bouge(f.popRate, .15, 1));
    f.damp = arr(bouge(f.damp, .2, .65)); f.pitch = arr(bouge(f.pitch, .55, 1.05)); f.intake = arr(bouge(f.intake, .1, .6), 2);
    f.bodyLP = Math.round(bouge(f.bodyLP, 2200, 5500)); f.form[0] = Math.round(bouge(f.form[0], 70, 160));
    f.satLoad = arr(bouge(f.satLoad, .4, 1.5), 2); f.tau = arr(bouge(f.tau, .0005, .0013), 5);
    nz.roarF = Math.round(bouge(nz.roarF, 120, 420)); nz.popRate = Math.round(bouge(nz.popRate, 8, 36)); nz.popTone = Math.round(bouge(nz.popTone, 500, 1700));
    nz.toneF0 = Math.round(bouge(nz.toneF0, 50, 160)); nz.roarFlutHz = arr(bouge(nz.roarFlutHz, 10, 34), 1);
    c.mute = (m.mute || 0) + 1;
    c.nom = m.nom.replace(/ · v\d+$/, '') + ' · v' + (c.mute + 1);
    return c;
  }

  const api = { genere: genere, mute: mute, FAM: FAM, Rng: Rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MiniGen = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
