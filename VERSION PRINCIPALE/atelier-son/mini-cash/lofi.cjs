/* ===== LES PROPOSITIONS LOFI / ASMR (2026-11-08, session GÉNÉRATEUR DE MOTEUR ; Sacha : « génère des propositions de son de moteur, nitro et son de
   déplacement de la voiture. Lofi girl, ASMR, ça doit bien aller avec la musique : irrégularité, capotage, interaction avec l'environnement — quand on
   atterrit, quand on tourne, quand on appuie longtemps ou pas sur le nitro. Fais ça bien ») =====
   MÊMES CINQ MOTEURS que propositions.cjs (VELOURS, BRAISE, COTON TURBO, TONNERRE LOINTAIN, RONRON MUSICAL) ; ce qui change, c'est tout AUTOUR :
     IRRÉGULARITÉ   le régime ne tient jamais en place : deux lentes ondulations + un « raté » doux de temps en temps (le moteur hésite, reprend)
     ROUTE          le roulement sourd des pneus (monte avec la vitesse, disparaît en l'air), les joints de bitume « tu-dum » dont le rythme suit la vitesse,
                    le vent (coup de vent en l'air)
     VIRAGE         le chuintement des pneus, le grincement de la caisse qui se penche ; le son bascule vers l'EXTÉRIEUR du virage (stéréo, ASMR au casque)
     ATTERRISSAGE   choc sourd + ressort de suspension qui rebondit + cliquetis de la caisse + petit couinement de pneus ; le moteur se tasse
     NITRO COURT/LONG  un petit coup = un « pshh » et un seul craquement ; un appui long = le turbo monte, les crépitements s'accumulent, et au
                    relâchement la soupape souffle fort et le feu s'égrène plusieurs secondes (la pression « se souvient » de la durée : spool du nitro vivant)
     CAPOTAGE       la glisse, l'envol, 5 impacts de moins en moins forts (choc + ferraille), la tôle qui racle, le moteur qui s'étouffe en toussant, puis le
                    silence où le métal chaud « tique » en refroidissant
     GRAIN LOFI     sur toute la somme : un léger « wow & flutter » de cassette (la hauteur flotte à peine), un souffle de bande, et pour certains un craquement de vinyle
   TROIS SCÈNES : trajet (24 s, tout y passe), capotage (11 s), nitro (13 s : trois petits coups, puis un appui long).
   Rien d'aléatoire d'un rendu à l'autre (graines fixes). Usage : node lofi.cjs → echantillons-lofi/*.wav (hors git) + echantillons-lofi/index.html */
'use strict';
const fs = require('fs'), path = require('path');
const MV = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const NV = require('../../assets/audio/moteur-vivant/nitro-vivant.js');
const DX = require('./doux.js');
const P2 = require('./propositions.cjs');
const { PROPS, Ronron, MUSIQUES, rmsDb, wav, etat, SR, BLOC, COUCHES } = P2;
const Bq = MV.Bq, TAU = Math.PI * 2, clamp = MV.clamp;

/* grain lofi par moteur : vinyl = craquements de disque (0 = aucun) */
const GRAIN = { velours: .0, braise: .6, coton: .3, tonnerre: .0, ronron: .5 };

/* ===================== LES SCÈNES =====================
   k    : [temps, régime 0..1, pédale]           nit : [[début, fin]…]            cri : [[début, montée, fin, sens(-1 gauche, +1 droite)]…]
   air  : [[début, fin]…]                          ev  : [[temps, 'choc'|'pop'|'coup'|'tousse', force]…]
   gaz  : [[temps, gain moteur]…] (le moteur s'éteint)      glisse : [[début, fin]…] (tôle qui racle)      tic : [début, fin] (métal qui refroidit) */
const SCENES = {
  trajet: { dur: 24, k: [[0, .3, .5], [2.8, .34, .6], [3, .5, 1], [3.5, .56, 0.5], [5, .42, .7], [8.8, .5, .8], [9, .45, 0], [10.2, .22, 0], [10.5, .5, 1], [14.5, .86, 1], [14.9, .6, .5],
    [15.2, .96, 1], [16.6, .96, 1], [16.7, .5, 1], [18, .55, .8], [21, .6, .8], [21.8, .5, 0], [23, .12, 0], [24, 0, 0]],
    nit: [[3, 3.45], [10.5, 14.5]], cri: [[5.2, .5, 8.2, -1], [18, .5, 21, 1]], air: [[15.2, 16.6]], ev: [[16.6, 'choc', .85]] },
  capotage: { dur: 11, k: [[0, .5, .9], [1.4, .62, .9], [3.1, .6, 0], [4.5, .2, 0], [11, 0, 0]],
    cri: [[1.2, .25, 2.5, 1]], air: [[2.5, 3.0]], gaz: [[0, 1], [3.1, 1], [4.6, .5], [5.2, 0]],
    ev: [[3.0, 'choc', .95], [3.55, 'choc', .75], [4.0, 'choc', .55], [4.35, 'choc', .35], [4.6, 'choc', .18],
      [3.9, 'tousse', .5], [4.3, 'tousse', .4], [4.7, 'tousse', .3], [5.0, 'tousse', .25]],
    glisse: [[3.1, 5.9]], tic: [6.4, 11] },
  nitro: { dur: 13, k: [[0, .5, 1], [4.5, .55, 1], [5.2, .62, 1], [10, .86, 1], [10.2, .8, 0], [13, .1, 0]],
    nit: [[1, 1.3], [2.5, 3.1], [4.2, 4.4], [4.7, 4.9], [5.2, 10]] }
};

function rends(p, nomScene) {
  const sc = SCENES[nomScene], N = Math.round(sc.dur * SR), out = [new Float32Array(N), new Float32Array(N)];
  const voixMV = !p.voix;
  const e = voixMV ? new MV.MoteurVivant(p.fiche, SR, 20261108) : new Ronron(SR, p.voix);
  if (voixMV) { Object.assign(e.G, COUCHES); e.etat = 'run'; e.rpm = e.cfg.idle; e.rpmEff = e.rpm; e.health = 1; }
  const idle = voixMV ? e.cfg.idle : p.voix.idle, lim = voixMV ? e.cfg.limit : p.voix.limit;
  const nz = new NV.NitroVivant(SR, 7654321, p.nitro), dx = new DX.Doux(SR); dx.regle(p.douceur);
  let rs = 8675309; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };
  /* filtres de l'environnement */
  const rumb = new Bq().set('lp', 240, .7, 0, SR), joint = new Bq().set('lp', 170, .8, 0, SR);
  const pneuA = new Bq().set('bp', 620, .9, 0, SR), pneuB = new Bq().set('bp', 820, 4.5, 0, SR), vent = new Bq().set('bp', 700, .55, 0, SR);
  const grince = new Bq().set('bp', 190, 9, 0, SR), grince2 = new Bq().set('bp', 330, 12, 0, SR);
  const mtl = [420, 780, 1350].map((f, i) => new Bq().set('bp', f, [12, 14, 10][i], 0, SR));
  const racle = new Bq().set('bp', 950, 2.2, 0, SR), couin = new Bq().set('bp', 1500, 6, 0, SR);
  const tic = new Bq().set('bp', 2300, 7, 0, SR), grain = new Bq().set('hp', 1500, .7, 0, SR), souffle = new Bq().set('lp', 3200, .7, 0, SR);
  const ftEnv = [new Bq().set('lp', 1500, .6, 0, SR), new Bq().set('lp', 1500, .6, 0, SR)];
  const L = new Float32Array(BLOC), R = new Float32Array(BLOC), L2 = new Float32Array(BLOC), R2 = new Float32Array(BLOC);
  const evs = (sc.ev || []).slice().sort((a, b) => a[0] - b[0]);
  const lerpK = (tab, t, def) => { if (!tab) return def; let i = 0; while (i < tab.length - 1 && tab[i + 1][0] <= t) i++; const a = tab[i], b = tab[Math.min(i + 1, tab.length - 1)];
    return b[0] > a[0] ? a[1] + (b[1] - a[1]) * clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : a[1]; };
  /* l'état de l'environnement */
  /* LA FLAMME (Sacha : « le nitro, on doit capter les flammes, irrégulières, avec un son rond ») : un lit de feu (bruit brun qui ondule) + des grains de crépitement
     ronds (attaque 3 ms, bande 250-900 Hz, pas de claquement) dont la densité vient par RAFALES irrégulières ; plus l'appui est long, plus le feu est dense et
     profond, et il s'éteint en s'égrenant après le relâchement */
  const F = Object.assign({ dens: 1, gros: .18, grave: 1, lit: .5, vit: 1, mix: .55, whump: 0, souffle: 0, flick: 0 }, p.fl || {});
  const feu = new Bq().set('lp', 330, .7, 0, SR), feuMod = new Bq().set('lp', 6, .7, 0, SR), feuHi = new Bq().set('lp', 1100, .6, 0, SR); let flameA = 0, grains = [], feuLisse = 0, whE = 0, whAge = 0, whPh = 0, sfE = 0;
  const sfLP = new Bq().set('lp', 900, .7, 0, SR), flickLP = new Bq().set('lp', 11, .7, 0, SR), whLP = new Bq().set('lp', 380, .7, 0, SR);
  let choc = 0, chocPh = 0, chocN = 0, spr = 0, sprPh = 0, rat = 0, couinE = 0, jointE = 0, joint2T = -1, jointT = .3, popT = 0, stumbleT = 2 + rnd() * 2, dip = 0,
    racleE = 0, tickE = 0, tickT = sc.tic ? sc.tic[0] : 1e9, tickPan = .5, nitPrev = 0, nitDeb = 0, nitFin = -9, nitDur = 0, creakPh = 0, crackT = 0;
  /* wow & flutter : une ligne à retard qui bouge un peu */
  const DL = 4096, dl = [new Float32Array(DL), new Float32Array(DL)]; let wi = 0;
  for (let i0 = 0; i0 < N; i0 += BLOC) {
    const t = i0 / SR, n = Math.min(BLOC, N - i0), dt = BLOC / SR, s = etat(sc, t);
    const nitA = (sc.nit || []).find((w) => t >= w[0] && t < w[1]), nit = nitA ? 1 : 0;
    if (nit && !nitPrev) { nitDeb = t; whE = 1; whAge = 0; whPh = 0; } if (!nit && nitPrev) { nitFin = t; nitDur = t - nitDeb; sfE = Math.min(1, .3 + (t - nitDeb) / 3) * F.souffle; } nitPrev = nit;
    const held = nit ? t - nitDeb : 0;
    let cri = 0, dir = 0; for (const [a, m, z, d] of sc.cri || []) if (t >= a && t <= z) { cri = t < a + m ? (t - a) / m : t > z - .5 ? (z - t) / .5 : 1; dir = d; }
    const air = (sc.air || []).some((w) => t >= w[0] && t < w[1]);
    const v = clamp(s.rN, .04, 1), gaz = lerpK(sc.gaz, t, 1);
    /* IRRÉGULARITÉ : le régime flotte ; de temps en temps un raté doux */
    const wob = 1 + .016 * Math.sin(TAU * .31 * t + 1) + .011 * Math.sin(TAU * .83 * t + 2.3) + .006 * (rnd() - .5);
    if (t >= stumbleT && s.thr > .05 && gaz > .9) { dip = .06 + .05 * rnd(); e.coup(.18 + .2 * rnd()); stumbleT = t + 2.4 + rnd() * 3.8; }
    dip *= Math.exp(-dt / .12);
    const rpm = idle + s.rN * (lim - idle);
    e.rpmCmd = Math.min(lim - 20, rpm * (nit ? 1.04 : 1) * (wob - dip)); e.thr = nit ? 1 : s.thr;
    e.load = nit ? 1 : s.thr > .05 ? clamp((air ? .3 : .8 + .2 * s.rN) + .25 * cri, 0, 1) : 0;
    while (evs.length && evs[0][0] <= t) {
      const [, k, f] = evs.shift();
      if (k === 'choc') { choc = f; chocPh = 0; chocN = 0; spr = f; sprPh = 0; rat = f; couinE = f; e.coup(.5 * f); if (f > .4) e.pop(.4 * f, 0); }
      else if (k === 'tousse') { e.pop(f, 0); e.coup(f * .6); }
      else if (k === 'pop') e.pop(f, 0);
    }
    /* NITRO : crépitements qui s'accumulent avec la durée, puis une queue de feu proportionnelle */
    if (nit && t >= popT) { popT = t + (.5 + rnd()) / (p.popsNitro * (1 + 1.6 * clamp(held / 3, 0, 1))); e.pop(.08 + rnd() * .12, 0); }
    const queue = Math.min(3, nitDur * .7);
    if (!nit && t > nitFin && t < nitFin + queue && t >= popT) { popT = t + (.35 + 1.1 * rnd()) * (1 + 2.5 * (t - nitFin) / queue) / p.popsNitro; e.pop(.15 + rnd() * .3, 0); }
    const tailK = !nit && t > nitFin && t < nitFin + queue + 1 ? Math.max(0, 1 - (t - nitFin) / (queue + 1)) : 0;
    const flameT = nit ? .45 + .55 * clamp(held / 3, 0, 1) : tailK * clamp(nitDur / 2, .25, 1);
    flameA += (flameT - flameA) * (1 - Math.exp(-dt / (flameT > flameA ? .12 : .5)));
    const rafale = Math.pow(Math.max(0, .55 * Math.sin(TAU * .9 * F.vit * t + 1.7) + .35 * Math.sin(TAU * 2.3 * F.vit * t) + .3 * Math.sin(TAU * 5.1 * F.vit * t + .6) + .25), 1.5);
    const lamb = flameA * (30 + 110 * rafale) * (p.popsNitro / 2) * F.dens * (1 + .6 * clamp(held / 3, 0, 1));
    e.process(L, R, BLOC, 0); nz.nit = nit; nz.speed = v; nz.process(L2, R2, BLOC, 0);
    for (let j = 0; j < BLOC; j++) { L[j] = L[j] * gaz + L2[j] * .32; R[j] = R[j] * gaz + R2[j] * .32; }
    dx.process(L, R, BLOC);
    const gl = 1 + .5 * dir * cri, gr = 1 - .5 * dir * cri;   /* le son bascule vers l'extérieur du virage */
    for (let j = 0; j < n; j++) {
      const ts = t + j / SR, w = rnd() * 2 - 1, w2 = rnd() * 2 - 1, w3 = rnd() * 2 - 1;
      let x = 0, xl = 0, xr = 0, hi = 0;
      /* ROUTE */
      const sol = air ? 0 : 1;
      x += rumb.p(w3) * .5 * Math.pow(v, .8) * sol * (gaz > .3 ? 1 : gaz + .3) * (nomScene === 'capotage' && ts > 3 ? 0 : 1);
      if (ts >= jointT && !air && nomScene !== 'capotage') { jointE = .22 * (.35 + v); joint2T = ts + .065 + .02 * rnd(); jointT = ts + (.5 / (.3 + v)) * (.8 + .4 * rnd()); }
      if (joint2T > 0 && ts >= joint2T) { jointE = .15 * (.35 + v); joint2T = -1; }
      if (jointE > 1e-4) { x += joint.p(w3 * 3) * jointE; jointE *= Math.exp(-1 / (SR * .035)); }
      x += vent.p(w2) * (.006 + .05 * Math.pow(v, 3) + (air ? .03 : 0));
      /* VIRAGE */
      if (cri > 0) {
        creakPh += (150 + 40 * Math.sin(ts * .7)) / SR;
        xl += (pneuA.p(w) + .6 * pneuB.p(w2)) * cri * .065 * gl;
        const gr1 = (grince.p(w3) * (.6 + .4 * Math.sin(TAU * .9 * ts)) + .6 * grince2.p(w2)) * cri * cri * .14;
        xl += gr1 * gl; xr += gr1 * gr; xr += (pneuB.p(w3) * .6) * cri * .06 * gr;
      }
      /* CHOC / RESSORT / FERRAILLE / COUINEMENT */
      if (choc > 1e-4) { chocPh += (32 + 38 * Math.exp(-chocN / (SR * .1))) / SR; chocN++; x += Math.sin(TAU * chocPh) * choc * .4 * Math.min(1, chocN / (SR * .012)); choc *= Math.exp(-1 / (SR * .14)); }
      if (spr > 1e-4) { sprPh += (52 - 18 * Math.min(1, sprPh * 6)) / SR; x += Math.sin(TAU * sprPh * 3.2) * spr * .22; spr *= Math.exp(-1 / (SR * .32)); }
      if (rat > 1e-4) { const m = (mtl[0].p(w) + mtl[1].p(w2) + .8 * mtl[2].p(w3)) * rat * .55; xl += m; xr += m * .9; rat *= Math.exp(-1 / (SR * .22)); }
      if (couinE > 1e-4) { x += couin.p(w) * couinE * .16; couinE *= Math.exp(-1 / (SR * .09)); }
      /* TÔLE QUI RACLE et MÉTAL QUI REFROIDIT */
      const rac = (sc.glisse || []).some((g) => ts >= g[0] && ts < g[1]);
      racleE += ((rac ? 1 : 0) - racleE) * (1 / (SR * (rac ? .05 : .25)));
      if (racleE > 1e-3) { const asp = .6 + .4 * Math.sin(TAU * 7.3 * ts) * Math.sin(TAU * 2.9 * ts); xl += racle.p(w) * racleE * asp * .17; xr += racle.p(w2) * racleE * asp * .17; }
      if (ts >= tickT) { tickE = .5 + .5 * rnd(); tickPan = rnd(); tickT = ts + .15 + (ts - sc.tic[0]) * .22 * rnd() + .5 * rnd() * (ts - sc.tic[0]) / 4; }
      if (tickE > 1e-4) { const q = tic.p(w) * tickE * .9; out[0][i0 + j] += q * (1 - tickPan) * 1.4; out[1][i0 + j] += q * tickPan * 1.4; tickE *= Math.exp(-1 / (SR * .004)); }
      /* GRAIN LOFI : souffle de bande + craquement de vinyle */
      let gr0 = souffle.p(w2) * .0016;
      if (GRAIN[p.id] > 0 && rnd() < GRAIN[p.id] * 7 / SR) crackT = .35 + .65 * rnd();
      if (crackT > 1e-3) { gr0 += grain.p(w) * crackT * .02; crackT *= Math.exp(-1 / (SR * .0012)); }
      /* la flamme : naissance de grains ronds (graves = gros), pondérés par la rafale */
      if (flameA > .01 && rnd() < lamb / SR && grains.length < 48) {
        const gros = rnd() < F.gros, f = (gros ? 160 + 200 * rnd() : 300 + 700 * rnd()) * F.grave;
        grains.push({ a: 0, amp: (gros ? .5 : .12) * (.4 + .6 * rnd()), dec: gros ? .05 + .06 * rnd() : .012 + .03 * rnd(), q: new Bq().set('bp', f, gros ? 1.1 : 1.4, 0, SR), pan: rnd() });
      }
      let fl = 0, fd = 0;
      for (let gi = grains.length - 1; gi >= 0; gi--) {
        const g = grains[gi]; g.a++; const env = Math.min(1, g.a / (SR * .003)) * Math.exp(-g.a / (SR * g.dec));
        const o = g.q.p(w2) * env * g.amp; fl += o * (1.2 - g.pan * .4 - .2); fd += o * (.8 + g.pan * .4 - .2);
        if (g.a > SR * g.dec * 7) grains.splice(gi, 1);
      }
      feuLisse = feuMod.p(w3) * 14; const lit = feu.p(w) * (.45 + Math.max(0, feuLisse)) * (1 + F.flick * flickLP.p(w2) * 30) * flameA * F.lit;
      fl += lit + feuHi.p(w3) * flameA * .02 * Math.max(0, feuLisse); fd += lit * .95 + feuHi.p(w) * flameA * .02 * Math.max(0, feuLisse);
      /* l'allumage : un « whoumf » rond (sinus qui descend de 140 à 55 Hz + souffle grave) ; le relâchement : un souffle rond qui retombe */
      if (whE > 1e-4) { whAge++; whPh += (55 + 85 * Math.exp(-whAge / (SR * .12))) / SR; const wh = (Math.sin(TAU * whPh) * .8 + whLP.p(w) * 1.4) * whE * F.whump * Math.min(1, whAge / (SR * .015)); fl += wh; fd += wh; whE *= Math.exp(-1 / (SR * .22)); }
      if (sfE > 1e-4) { const sf = sfLP.p(w3) * sfE * .5; fl += sf; fd += sf; sfE *= Math.exp(-1 / (SR * .32)); }
      const al = ftEnv[0].p(x + xl) + gr0 + fl * F.mix, ar = ftEnv[1].p(x + xr) + gr0 * .9 + fd * F.mix;
      /* wow & flutter : retard 40 échantillons ± 18 (0,6 Hz) ± 3 (5,5 Hz) */
      const dly = 44 + 18 * Math.sin(TAU * .6 * ts) + 8 * Math.sin(TAU * .17 * ts + 1) + 3 * Math.sin(TAU * 5.5 * ts);
      dl[0][wi] = L[j] + al; dl[1][wi] = R[j] + ar;
      const rp = wi - dly, i1 = Math.floor(rp), fr = rp - i1, a1 = ((i1 % DL) + DL) % DL, a2 = (a1 + 1) % DL;
      out[0][i0 + j] += dl[0][a1] * (1 - fr) + dl[0][a2] * fr; out[1][i0 + j] += dl[1][a1] * (1 - fr) + dl[1][a2] * fr;
      wi = (wi + 1) % DL;
    }
  }
  return out;
}

const COTON = PROPS.find((q) => q.id === 'coton');
const vari = (id, nom, sous, fiche, nitro, fl, extra) => Object.assign({}, COTON, { id, nom, sous, fl, fiche: Object.assign({}, COTON.fiche, fiche), nitro: Object.assign({}, COTON.nitro, nitro) }, extra || {});
const COTONS = [
  COTON,
  vari('brume', 'COTON BRUME', 'Plus grave et soyeux · le nitro est un brasier qui ronfle : lit de feu épais, rares gros « floumps » ronds', { pitch: .64, bodyLP: 1700, lope: .6 }, { roarF: 160, whineG: .03 }, { dens: .6, gros: .32, grave: .75, lit: .85, vit: .6 }, { douceur: .9, popsNitro: 1.4 }),
  vari('nerveux', 'COTON NERVEUX', 'Plus vif, turbo plus présent · le nitro crépite fin et dense, comme des brindilles qui flambent', { pitch: .95, rasp: .34, lope: .7, turbo: { spool: .4, whine: .75 } }, { whineG: .07, whineF1: 3000, popRate: 14 }, { dens: 1.9, gros: .06, grave: 1.35, lit: .3, vit: 1.5 }, { popsNitro: 2.2 }),
  vari('buche', 'COTON BÛCHE', 'Ronron très inégal, le nitro claque rond comme une bûche : gros éclats graves par rafales, longs silences', { lope: .95, popRate: .8, pitch: .78 }, { roarF: 180, popRate: 8 }, { dens: .55, gros: .5, grave: .7, lit: .5, vit: .45 }, { popsNitro: 1.6 }),
  vari('siffleur', 'COTON SIFFLEUR', 'Le turbo chante, le nitro est un feu de gaz : souffle régulier, crépitements fins et ronds, peu de gros éclats', { turbo: { spool: .7, whine: .95 }, lope: .35 }, { whineG: .1, whineF0: 900, whineF1: 3200, bovG: .35 }, { dens: 1.1, gros: .1, grave: 1.1, lit: .65, vit: .8 }, { popsNitro: 1.2 })
];
const NERV = COTONS[2], BUCH = COTONS[3];
const vari2 = (base, id, nom, sous, nitro, fl, extra) => Object.assign({}, base, { id, nom, sous, fl, nitro: Object.assign({}, base.nitro, nitro) }, extra || {});
/* le nitro retravaillé : la flamme DEVIENT le son (la rugissante du nitro vivant est baissée), + un allumage rond et un souffle au relâchement */
const ROND = { roarG: .22, hissG: .02, toneG: .04, boomG: .18, boomWhoosh: .15, popG: .12, attack: .08, release: .5 };
const COTONS2 = [
  vari2(NERV, 'chalumeau', 'NERVEUX · CHALUMEAU', 'Nerveux · le nitro est une flamme vive qui vacille : lit de feu qui tremble, crépitements fins et ronds, whoumf à l’allumage', Object.assign({}, ROND, { whineG: .08, whineF1: 3000 }), { dens: 1.4, gros: .1, grave: 1.2, lit: 1.0, vit: 1.6, mix: .9, whump: .55, souffle: .6, flick: 1.1 }),
  vari2(NERV, 'brindilles', 'NERVEUX · BRINDILLES', 'Nerveux · le nitro est un feu de brindilles : averses de petits craquements ronds, en rafales qui montent et retombent', Object.assign({}, ROND, { whineG: .05 }), { dens: 2.6, gros: .05, grave: 1.5, lit: .5, vit: 1.1, mix: .95, whump: .35, souffle: .4, flick: .5 }),
  vari2(BUCH, 'buche-feu', 'BÛCHE · FEU DE CHEMINÉE', 'Bûche · le nitro est un feu de cheminée : lit ronflant, gros éclats graves bien ronds par rafales, longs silences, grosse flamme à l’allumage', Object.assign({}, ROND, { roarF: 170 }), { dens: .8, gros: .42, grave: .72, lit: 1.0, vit: .5, mix: .9, whump: .5, souffle: .8, flick: .6 }),
  vari2(BUCH, 'buche-braise', 'BÛCHE · BRAISE', 'Bûche · le nitro est une braise qui ronfle : lit profond et doux, petits éclats feutrés qui s’égrènent, très rond, très ASMR', Object.assign({}, ROND, { roarF: 140 }), { dens: 1.3, gros: .22, grave: .6, lit: 1.3, vit: .35, mix: .95, whump: .5, souffle: 1, flick: .3 })
];
function principal(liste, nomDos) {
  const dos = path.join(__dirname, nomDos || 'echantillons-lofi'); fs.mkdirSync(dos, { recursive: true });
  for (const p of liste || PROPS) {
    const r = {}; for (const s of Object.keys(SCENES)) r[s] = rends(p, s);
    const g = Math.pow(10, (-20 - rmsDb(r.trajet)) / 20);     /* chaque proposition au même volume : le trajet à −20 dBFS */
    const l = [p.nom.padEnd(18)];
    for (const s of Object.keys(SCENES)) {
      wav(path.join(dos, p.id + '-' + s + '.wav'), r[s], g);
      let pk = 0; for (const c of r[s]) for (let i = 0; i < c.length; i++) pk = Math.max(pk, Math.abs(c[i] * g));
      l.push(s + ' ' + (rmsDb(r[s]) + 20 * Math.log10(g)).toFixed(1) + ' dBFS pic ' + pk.toFixed(2));
    }
    console.log(l.join(' · '));
  }
  fs.writeFileSync(path.join(dos, 'index.html'), page(liste || PROPS));
}

function page(PROPS) {
  const SC = [['trajet', 'Trajet', 'ralenti irrégulier · petit nitro · virage · appui long sur le nitro · envol et atterrissage · virage · lâcher'],
    ['capotage', 'Capotage', 'glisse · envol · cinq impacts · la tôle racle · le moteur s’étouffe · le métal refroidit'],
    ['nitro', 'Nitro court / long', 'trois petits coups, puis un appui de 5 secondes et son feu qui s’égrène']];
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const cartes = PROPS.map((p, i) => '<section class="carte"><h2><span>' + (i + 1) + '</span>' + esc(p.nom) + '</h2><p>' + esc(p.sous) + '</p>' +
    SC.map(([id, t, d]) => '<div class="ech"><div><b>' + t + '</b><small>' + esc(d) + '</small></div><audio controls preload="none" src="' + p.id + '-' + id + '.wav"></audio></div>').join('') + '</section>').join('\n');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Propositions lofi</title>
<style>
/* LA PAGE D'ÉCOUTE lofi (écrite par lofi.cjs — ne pas éditer à la main) */
:root{--bg:#0d0f14;--pan:#161a22;--ln:#262c38;--tx:#eef1f7;--mu:#97a2b6;--ac:#ffb02e}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 60px}h1{margin:0;font-size:26px;letter-spacing:.06em}.chapo{color:var(--mu);margin:6px 0 20px}
.carte{background:var(--pan);border:1px solid var(--ln);border-radius:14px;padding:16px;margin-bottom:14px}
.carte h2{margin:0;font-size:19px;letter-spacing:.06em;display:flex;align-items:center;gap:10px}
.carte h2 span{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--ac);color:#1a1004;font-size:14px}
.carte>p{color:var(--mu);margin:4px 0 10px}.ech{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--ln);flex-wrap:wrap}
.ech b{display:block}.ech small{color:var(--mu);display:block;max-width:360px}.ech audio{height:36px;width:300px;max-width:100%}
#musique{position:sticky;top:0;z-index:5;background:rgba(13,15,20,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--ln);padding:10px 16px}
#musique div{max-width:760px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}#musique b{letter-spacing:.08em;font-size:13px}
#musique select,#musique button{font:inherit;color:var(--tx);background:#222936;border:1px solid var(--ln);border-radius:9px;padding:7px 10px;cursor:pointer}
#musique button.on{background:var(--ac);border-color:var(--ac);color:#1a1004;font-weight:700}#musique label{color:var(--mu);font-size:13px;display:flex;align-items:center;gap:6px}#musique input{width:120px;accent-color:var(--ac)}
</style></head><body>
<div id="musique"><div><b>♪ MUSIQUE DU JEU</b>
  <select id="mSel">${MUSIQUES.map((m, i) => '<option value="' + i + '">' + esc(m[0]) + '</option>').join('')}</select>
  <button id="mJoue">▶ Lancer</button><label>volume <input type="range" id="mVol" min="0" max="1" step="0.05" value="0.75"></label></div></div>
<main><h1>PROPOSITIONS LOFI / ASMR</h1>
<p class="chapo">Cinq moteurs, trois moments : un trajet complet (irrégularités, virages, nitro court puis long, atterrissage), un capotage, et le nitro seul. Lance la musique en haut et mets le casque : en virage le son bascule vers l’extérieur.</p>
${cartes}</main>
<script>
const MUS=${JSON.stringify(MUSIQUES)}, musBase='../../../assets/audio/music/';
const mus=new Audio();mus.loop=true;
const mSel=document.getElementById('mSel'),mJoue=document.getElementById('mJoue'),mVol=document.getElementById('mVol');
const volume=()=>{const m=MUS[+mSel.value];mus.volume=Math.min(1,Math.pow(10,(-15.5-m[2])/20)*(+mVol.value));};
const charge=()=>{mus.src=musBase+MUS[+mSel.value][1]+'.m4a';volume();};
const etiquette=()=>{const on=!mus.paused;mJoue.textContent=on?'❚❚ Pause':'▶ Lancer';mJoue.classList.toggle('on',on);};
mJoue.onclick=()=>{if(!mus.src)charge();if(mus.paused)mus.play().catch(()=>{});else mus.pause();};
mSel.onchange=()=>{const on=!mus.paused;charge();if(on)mus.play().catch(()=>{});};
mVol.oninput=volume;mus.onplay=etiquette;mus.onpause=etiquette;
const tous=[...document.querySelectorAll('audio')];
tous.forEach(a=>a.addEventListener('play',()=>tous.forEach(b=>{if(b!==a)b.pause();})));
</script></body></html>
`;
}
if (require.main === module) { if (process.argv[2] === 'coton') principal(COTONS, 'echantillons-coton'); else if (process.argv[2] === 'coton2') principal(COTONS2, 'echantillons-coton2'); else principal(); }
module.exports = { SCENES, rends };
