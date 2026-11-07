/* ===== LES PROPOSITIONS DE SON (2026-11-05, session SON ; Sacha : « le simu est bof ; propose-moi juste plusieurs propositions qui collent le mieux à
   mes attentes ; pour chacune, des échantillons : moteur seul, nitro, virage, moteur après atterrissage ») =====
   CE QUE SACHA ATTEND (ses mots, sur toute la session) : un beau son de moteur, un beau son de nitro, des VARIATIONS ; des pétarades, des flammes qui
   crépitent dans le nitro ; doux, lo-fi, ASMR — rien qui fasse mal aux oreilles, et ça doit vivre avec la musique ; que la conduite change le son.
   CINQ DIRECTIONS, toutes douces, chacune avec un caractère :
     1 VELOURS            un V12 soyeux qui chante haut, presque sans pétarade : le luxe tranquille
     2 BRAISE             un V8 croisé qui gargouille et CRÉPITE beaucoup au lâcher et au nitro, comme un feu de cheminée
     3 COTON TURBO        un boxer turbo : le ronron inégal, le turbo qui siffle doucement, le « pshh » au lâcher
     4 TONNERRE LOINTAIN  un gros V8 très grave, entendu de loin / de l'habitacle : le plus feutré, le plus ASMR
     5 RONRON MUSICAL     une VOIX (pas une mécanique) : une note chaude qui ronronne, dans l'esprit du moteur par défaut du jeu (voix-moteur.js)
   QUATRE SCÈNES, les mêmes pour tout le monde (rien d'aléatoire : deux rendus = les mêmes octets) :
     seul         ralenti · coup de gaz · départ pleins gaz sur trois rapports · lâcher (crépitements) · retour au ralenti        (8 s)
     nitro        pleins gaz · NITRO 3 s (allumage, flamme, crépitements) · relâché · lâcher                                       (7,5 s)
     virage       croisière · virage serré (les pneus glissent, le moteur force et patine) · sortie · lâcher                      (6,5 s)
     atterrissage en l'air pied au plancher (le moteur s'emballe) · ATTERRISSAGE (choc, il bute, le régime retombe) · il repart (6,5 s)
   Les quatre échantillons d'une proposition gardent leurs niveaux relatifs ; chaque proposition est calée au même volume (son « seul » à −20 dBFS),
   pour comparer les caractères et pas les volumes.
   Usage : node propositions.cjs   → echantillons/*.wav (32 kHz stéréo, hors git) ; la page d'écoute : echantillons/index.html */
'use strict';
const fs = require('fs'), path = require('path');
const MV = require('../../assets/audio/moteur-vivant/moteur-vivant.js');
const NV = require('../../assets/audio/moteur-vivant/nitro-vivant.js');
const DX = require('./doux.js');
const Bq = MV.Bq, TAU = Math.PI * 2, clamp = MV.clamp;
const SR = 32000, BLOC = 128;

/* ===================== LA VOIX « RONRON MUSICAL » =====================
   Une note, pas des explosions : la fréquence d'allumage (régime × cylindres / 120) chante sur six harmoniques douces, une SOUS-OCTAVE ronronne dessous,
   et le cycle du moteur la module en amplitude (le ronron, profond au ralenti, qui se lisse en montant). La hauteur est comprimée au-dessus de 190 Hz
   (le « genou » du jeu : pas de moustique). Un passe-bas suit la pédale (le pied ouvre le son). Au lâcher : des craquements feutrés (rafales de bruit
   filtré, denses puis qui s'égrènent). Même contrat que MoteurVivant : rpmCmd, thr, load ; process(L, R, N) ; pop(a) ; coup(f). */
function Ronron(sr, P) {
  this.sr = sr; this.P = P; this.rpmCmd = P.idle; this.thr = 0; this.load = 0; this.rpm = P.idle;
  this.ph = [0, 0]; this.phS = [0, 0]; this.phC = 0; this.lp = [new Bq(), new Bq()]; this.lp2 = [new Bq(), new Bq()];
  this.k = 0; this.cr = []; this.crF = new Bq(); this.age = 9; this.thrHi = 0; this.wasLift = false; this.dip = 0; this.th = 0; this.thPh = 0;
  let s = 99991; this.rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  this.lopeV = 1; this.lopeT = 0;
}
Ronron.prototype.pop = function (a) { this.cr.push({ e: a, d: Math.exp(-1 / (this.sr * (.008 + .02 * this.rnd()))), f: 450 + 450 * this.rnd(), q: new Bq() }); };
Ronron.prototype.coup = function (f) { this.dip = Math.max(this.dip, f); this.th = Math.max(this.th, f); this.thPh = 0; };
Ronron.prototype.process = function (L, R, N) {
  const P = this.P, sr = this.sr, H = P.h;
  for (let i = 0; i < N; i++) {
    if ((this.k++ & 63) === 0) {
      const dt = 64 / sr;
      this.rpm += (Math.max(P.idle, this.rpmCmd) - this.rpm) * Math.min(1, dt * 12);
      const rN = clamp((this.rpm - P.idle) / (P.limit - P.idle), 0, 1);
      const fc = 220 + P.ouvre * (.25 + .75 * this.thr) * Math.pow(rN, .7) + 120 * this.load;
      for (let c = 0; c < 2; c++) { this.lp[c].set('lp', fc, .7, 0, sr); this.lp2[c].set('lp', fc * 1.6, .6, 0, sr); }
      /* le lâcher : une salve, puis un grésillement qui s'égrène */
      this.thrHi = Math.max(this.thr, this.thrHi - dt * 3.5);
      const lift = this.thr < .06 && this.rpm > P.idle * 2.6;
      if (lift && !this.wasLift && this.thrHi > .5) { this.age = 0; for (let j = 0; j < 2 + Math.floor(this.rnd() * 2); j++) this.pop(.5 + .4 * this.rnd()); }
      if (lift) { this.age += dt; if (this.rnd() < P.crepite * 14 * Math.exp(-this.age / .9) * dt) this.pop(.2 + .45 * this.rnd()); }
      this.wasLift = lift;
      for (const c of this.cr) if (!c.set) { c.q.set('bp', c.f, 1.3, 0, sr); c.set = 1; }
      this.cr = this.cr.filter((c) => c.e > 1e-4);
      this.lopeT -= dt; if (this.lopeT <= 0) { this.lopeT = 120 / Math.max(300, this.rpm); this.lopeV = 1 - P.lope * (1 - rN) * this.rnd(); }
      this.dip *= Math.exp(-dt / .12);
    }
    const rN = clamp((this.rpm - P.idle) / (P.limit - P.idle), 0, 1);
    let f0 = this.rpm * P.n / 120 * P.hauteur; if (f0 > 190) f0 = 190 * Math.pow(f0 / 190, .42);
    const cyc = this.rpm / 120;
    this.phC += cyc / sr; if (this.phC >= 1) this.phC -= 1;
    const purr = 1 - (P.ronron * (1 - .75 * rN)) * (.5 + .5 * Math.sin(TAU * this.phC)) * this.lopeV;
    const amp = (.12 + .88 * (.15 + .85 * this.thr) * (.3 + .7 * rN)) * purr * (1 - .6 * this.dip);   /* ralenti ~12 dB sous les pleins gaz : la voix doit RESPIRER */
    let o = [0, 0];
    for (let c = 0; c < 2; c++) {
      const det = c ? 1.004 : 1;
      this.ph[c] += f0 * det / sr; if (this.ph[c] >= 1) this.ph[c] -= 1;
      this.phS[c] += f0 * .5 * det / sr; if (this.phS[c] >= 1) this.phS[c] -= 1;
      let v = Math.sin(TAU * this.phS[c]) * P.sous;
      for (let h = 0; h < H.length; h++) v += H[h] * Math.sin(TAU * (h + 1) * this.ph[c]);
      o[c] = this.lp2[c].p(this.lp[c].p(v)) * amp;
    }
    /* craquements et choc */
    let cr = 0; for (const c of this.cr) { cr += c.q.p(this.rnd() * 2 - 1) * c.e; c.e *= c.d; }
    let th = 0; if (this.th > 1e-4) { this.thPh += (38 + 30 * this.th) / sr; th = Math.sin(TAU * this.thPh) * this.th * .8; this.th *= Math.exp(-1 / (sr * .16)); }
    const dr = 1 + 1.2 * this.load;
    L[i] = Math.tanh((o[0] * .22 + cr * .9 + th) * dr) / dr; R[i] = Math.tanh((o[1] * .22 + cr * .9 + th) * dr) / dr;
  }
};

/* ===================== LES CINQ PROPOSITIONS ===================== */
const DOUX = { tau: .0014, noiseMix: .4, clac: .0003, dryF: 800, sat: 1, satLoad: .5, ticks: .2, intake: .15, muff: .3, tickF: 2600, bodyLP: 2000, hp: 34,
  eq: [['ls', 110, 0, -2], ['hs', 1200, 0, -9]], form2: [200, 1.1, 2] };
const COUCHES = { dry: .35, knock: 0, grind: 0, rod: .25, tick: .25, tink: .5, clank: .5, turbo: .5, starter: .7, intake: .8, pipe: 1 };
const alterne = (n) => Array.from({ length: n }, (_, i) => i % 2);
const NITRO_CHAUD = { roarG: .6, roarF: 200, roarBody: .35, roarFlutHz: 16, roarFlut: .3, roarTurb: .35, hissG: .05, hissF: 1400, hissQ: .8,
  whineG: .02, whineF0: 600, whineF1: 2000, whineQ: 18, whineWob: .01, toneG: .12, toneF0: 80, toneF1: 250, toneHarm: .4,
  popRate: 12, popG: .35, popTone: 560, popBig: .1, boomG: .5, boomF: 46, boomWhoosh: .4, bovG: .1, bovF: 2200, attack: .15, release: .4, spool: .7 };

const PROPS = [
  { id: 'velours', nom: 'VELOURS', sous: 'V12 soyeux · il chante haut, sans brutalité, presque pas de pétarades', douceur: .62,
    fiche: Object.assign({}, MV.CFG.flat, DOUX, { nom: 'V12', n: 12, slot: alterne(12), idle: 900, limit: 8600, redline: 8300, pipe: [.72, .76], r: -.6, damp: .45,
      form: [118, 1.4, 4], lope: .08, rasp: .22, popRate: .25, pitch: .6, pan: .35, cutMs: [50, 70], bodyLP: 2300 }),
    nitro: Object.assign({}, NITRO_CHAUD, { roarF: 230, toneG: .14, toneF0: 95, toneF1: 300, popRate: 7, popG: .25 }), popsNitro: 1.2 },
  { id: 'braise', nom: 'BRAISE', sous: 'V8 croisé · gros gargouillis, crépite beaucoup au lâcher et au nitro, comme un feu de cheminée', douceur: .8,
    fiche: Object.assign({}, MV.CFG.v8, DOUX, { lope: .9, rasp: .3, popRate: 1.0, pitch: .66, form: [88, 1.5, 6], pipe: [1.05, 1.14] }),
    nitro: Object.assign({}, NITRO_CHAUD, { popRate: 24, popG: .38, popTone: 480, roarF: 170, roarFlutHz: 14 }), popsNitro: 3.5 },
  { id: 'coton', nom: 'COTON TURBO', sous: 'Boxer 4 turbo · ronron inégal, le turbo siffle doucement, « pshh » quand on lâche', douceur: .72,
    fiche: Object.assign({}, MV.CFG.l6, DOUX, { nom: 'BOXER 4 TURBO', n: 4, slot: [0, 0, 1, 1], idle: 800, limit: 7400, redline: 7000, pipe: [.95, 1.02], r: -.58, damp: .44,
      form: [100, 1.4, 5], lope: .5, rasp: .28, popRate: .55, pitch: .8, pan: .5, cutMs: [55, 80], turbo: { spool: .55, whine: .45 } }),
    nitro: Object.assign({}, NITRO_CHAUD, { whineG: .05, whineF0: 800, whineF1: 2500, bovG: .25, bovF: 2200, popRate: 12 }), popsNitro: 1.8 },
  { id: 'tonnerre', nom: 'TONNERRE LOINTAIN', sous: 'Gros V8 très grave, entendu de l\'habitacle · le plus feutré, le plus ASMR', douceur: 1,
    fiche: Object.assign({}, MV.CFG.v8, DOUX, { lope: .8, rasp: .25, popRate: .6, pitch: .55, form: [78, 1.6, 6.5], bodyLP: 1500, pipe: [1.15, 1.22] }),
    nitro: Object.assign({}, NITRO_CHAUD, { roarF: 140, hissG: .03, toneF0: 55, toneF1: 180, popTone: 420, popRate: 14 }), popsNitro: 2 },
  { id: 'ronron', nom: 'RONRON MUSICAL', sous: 'Une voix chaude qui ronronne, plus « note » que mécanique · dans l\'esprit du moteur par défaut du jeu', douceur: .55,
    voix: { n: 8, idle: 780, limit: 7000, hauteur: .8, h: [1, .5, .28, .16, .09, .05], sous: .7, ronron: .55, lope: .35, ouvre: 1500, crepite: .8 },
    nitro: Object.assign({}, NITRO_CHAUD, { toneG: .18, toneF0: 70, toneF1: 220, popRate: 10, popG: .3 }), popsNitro: 1.5 }
];

/* ===================== LES QUATRE SCÈNES =====================
   k : [temps, régime (0 = ralenti, 1 = rupteur), pédale à partir de cet instant] — le régime est interpolé, la pédale tenue.
   nit : [début, fin] du nitro · cri : [début, montée, fin] de la glisse · air : [début, fin] en vol · ev : [temps, 'choc'|'pop'|'coup', force] */
const SCENES = {
  seul: { dur: 8, k: [[0, 0, 0], [1.1, 0, .7], [1.45, .5, 0], [2.1, .06, 1], [3.2, .93, 0], [3.36, .62, 1], [4.7, .93, 0], [4.86, .68, 1], [5.6, .9, 0], [7.2, .1, 0], [8, 0, 0]] },
  nitro: { dur: 7.5, k: [[0, .55, 1], [1.4, .62, 1], [4.6, .8, 1], [5.6, .85, 0], [7.5, .15, 0]], nit: [1.4, 4.6] },
  virage: { dur: 6.5, k: [[0, .5, .8], [1.2, .52, .9], [1.6, .66, .9], [3.8, .63, .9], [4.4, .52, .8], [5.2, .56, 0], [6.5, .15, 0]], cri: [1.2, .35, 4.2] },
  atterrissage: { dur: 6.5, k: [[0, .6, 1], [.6, .96, 1], [1.6, .96, 1], [1.7, .55, 1], [3.7, .9, 1], [4.2, .92, 0], [6.5, .15, 0]], air: [0, 1.6],
    ev: [[1.6, 'choc', .8], [1.6, 'coup', .45], [1.62, 'pop', .4]] }
};
function etat(sc, t) {
  const k = sc.k; let i = 0; while (i < k.length - 1 && k[i + 1][0] <= t) i++;
  const a = k[i], b = k[Math.min(i + 1, k.length - 1)], u = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0;
  return { rN: a[1] + (b[1] - a[1]) * u, thr: a[2] };
}

function rends(p, nomScene) {
  const sc = SCENES[nomScene], N = Math.round(sc.dur * SR), out = [new Float32Array(N), new Float32Array(N)];
  const voixMV = !p.voix;
  const e = voixMV ? new MV.MoteurVivant(p.fiche, SR, 20261105) : new Ronron(SR, p.voix);
  if (voixMV) { Object.assign(e.G, COUCHES); e.etat = 'run'; e.rpm = e.cfg.idle; e.rpmEff = e.rpm; e.health = 1; }
  const idle = voixMV ? e.cfg.idle : p.voix.idle, lim = voixMV ? e.cfg.limit : p.voix.limit;
  const nz = new NV.NitroVivant(SR, 7654321, p.nitro), dx = new DX.Doux(SR); dx.regle(p.douceur);
  /* les bruits de la caisse : glisse (« chhh » + une bande grave un peu chantante), vent, choc sourd ; feutrés à 1,2 kHz */
  const gA = new Bq().set('bp', 620, .9, 0, SR), gB = new Bq().set('bp', 820, 4.5, 0, SR), vt = new Bq().set('bp', 500, .6, 0, SR);
  const ft = [new Bq().set('lp', 1200, .6, 0, SR), new Bq().set('lp', 1200, .6, 0, SR)];
  let rs = 424242; const rnd = () => { rs ^= rs << 13; rs >>>= 0; rs ^= rs >>> 17; rs ^= rs << 5; rs >>>= 0; return rs / 4294967296; };
  const L = new Float32Array(BLOC), R = new Float32Array(BLOC), L2 = new Float32Array(BLOC), R2 = new Float32Array(BLOC);
  const evs = (sc.ev || []).slice(); let popT = 0, choc = 0, chocPh = 0, chocN = 0;
  for (let i0 = 0; i0 < N; i0 += BLOC) {
    const t = i0 / SR, s = etat(sc, t), n = Math.min(BLOC, N - i0);
    const nit = sc.nit && t >= sc.nit[0] && t < sc.nit[1] ? 1 : 0;
    let cri = 0; if (sc.cri) { const [a, m, z] = sc.cri; cri = t < a || t > z ? 0 : t < a + m ? (t - a) / m : t > z - .4 ? (z - t) / .4 : 1; }
    const air = sc.air && t >= sc.air[0] && t < sc.air[1];
    const rpm = idle + s.rN * (lim - idle);
    e.rpmCmd = Math.min(lim - 20, rpm * (nit ? 1.04 : 1)); e.thr = nit ? 1 : s.thr;
    e.load = nit ? 1 : s.thr > .05 ? clamp((air ? .35 : .8 + .2 * s.rN) + .25 * cri, 0, 1) : 0;
    while (evs.length && evs[0][0] <= t) {
      const [, k, f] = evs.shift();
      if (k === 'coup') e.coup(f); else if (k === 'pop') e.pop(f, 0); else if (k === 'choc') { choc = f; chocPh = 0; chocN = 0; }
    }
    if (nit && t >= popT) { popT = t + (.5 + rnd()) / p.popsNitro; e.pop(.2 + rnd() * .3, 0); }
    e.process(L, R, BLOC, 0); nz.nit = nit; nz.speed = .8; nz.process(L2, R2, BLOC, 0);
    for (let j = 0; j < BLOC; j++) { L[j] += L2[j] * .32; R[j] += R2[j] * .32; }
    dx.process(L, R, BLOC);
    for (let j = 0; j < n; j++) {
      const w = rnd() * 2 - 1, w2 = rnd() * 2 - 1;
      let x = (gA.p(w) + .6 * gB.p(w2)) * cri * .09 + vt.p(w2) * (air ? .05 : .012);
      if (choc > 1e-4) { chocPh += (32 + 38 * Math.exp(-chocN / (SR * .1))) / SR; chocN++; x += Math.sin(TAU * chocPh) * choc * .35 * Math.min(1, chocN / (SR * .012)); choc *= Math.exp(-1 / (SR * .14)); }
      out[0][i0 + j] = L[j] + ft[0].p(x); out[1][i0 + j] = R[j] + ft[1].p(x);
    }
  }
  return out;
}

function wav(nom, ch, g) {
  const n = ch[0].length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  const fade = Math.round(SR * .03);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) {
    const env = Math.min(1, i / fade, (n - 1 - i) / fade);
    const v = Math.tanh(ch[c][i] * g * 1.1) / 1.1 * env;
    b.writeInt16LE(Math.round(clamp(v, -1, 1) * 32767), 44 + (i * 2 + c) * 2);
  }
  fs.writeFileSync(nom, b);
}
const rmsDb = (ch) => { let s = 0; for (const c of ch) for (let i = 0; i < c.length; i++) s += c[i] * c[i]; return 10 * Math.log10(s / (ch.length * ch[0].length) + 1e-12); };

function principal() {
  const dos = path.join(__dirname, 'echantillons'); fs.mkdirSync(dos, { recursive: true });
  const bilan = [];
  for (const p of PROPS) {
    const r = {}; for (const s of Object.keys(SCENES)) r[s] = rends(p, s);
    const g = Math.pow(10, (-20 - rmsDb(r.seul)) / 20);     /* chaque proposition au même volume : « seul » à −20 dBFS */
    const ligne = [p.nom.padEnd(18)];
    for (const s of Object.keys(SCENES)) {
      wav(path.join(dos, p.id + '-' + s + '.wav'), r[s], g);
      let pk = 0; for (const c of r[s]) for (let i = 0; i < c.length; i++) pk = Math.max(pk, Math.abs(c[i] * g));
      ligne.push(s + ' ' + (rmsDb(r[s]) + 20 * Math.log10(g)).toFixed(1) + ' dBFS pic ' + pk.toFixed(2));
    }
    bilan.push(ligne.join(' · ')); console.log(bilan[bilan.length - 1]);
  }
  fs.writeFileSync(path.join(dos, 'index.html'), page());
}

/* LES MUSIQUES DU JEU pour la page d'écoute (Sacha : « dans ton truc mets un lecteur de musique du jeu ») — la même liste que mini-cash.js :
   [titre, fichier, niveau moyen mesuré en dBFS]. Chaque morceau est ramené à −15,5 dBFS au volume max (un <audio> ne monte pas au-dessus de 1 :
   le plus calme, −15,2, donne la cible) ; les échantillons sont à −20 : le moteur passe ~4 dB sous la musique, comme en jeu. */
const MUSIQUES = [
  ['Garage lo-fi', 'boucles/garage-lofi', -15.2], ['Nuit de velours', 'paliers/rendus/nuit-de-velours/p5', -12.4], ['Penthouse', 'paliers/rendus/penthouse/p5', -11.4],
  ['Néon noir', 'paliers/rendus/neon-noir/p5', -10.1], ['Glisse fusion', 'paliers/rendus/glisse-fusion/p5', -7.6], ['Ciel', 'paliers/rendus/ciel-30/p14', -11.4],
  ['Siffleur', 'paliers/rendus/siffleur-30/p14', -14.3], ['Neon drive', 'boucles/neon-drive', -15], ['Apesanteur', 'boucles/apesanteur', -15],
  ['Hypervitesse', 'boucles/hypervitesse', -15], ['Dark triad', 'boucles/dark-triad', -14.9]
];

/* LA PAGE D'ÉCOUTE (écrite à chaque rendu : elle suit toujours les propositions) */
function page() {
  const SC = [['seul', 'Moteur seul', 'ralenti, coup de gaz, départ, lâcher'], ['nitro', 'Nitro', 'pleins gaz, 3 s de nitro, lâcher'], ['virage', 'Virage', 'virage serré, les pneus glissent'], ['atterrissage', 'Après atterrissage', 'en l’air pied au plancher, choc, il repart']];
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const cartes = PROPS.map((p, i) => '<section class="carte"><h2><span>' + (i + 1) + '</span>' + esc(p.nom) + '</h2><p>' + esc(p.sous) + '</p>' +
    SC.map(([id, t, d]) => '<div class="ech"><div><b>' + t + '</b><small>' + d + '</small></div><audio controls preload="none" src="' + p.id + '-' + id + '.wav"></audio></div>').join('') +
    '<button class="suite">▶ Les quatre à la suite</button></section>').join('\n');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Propositions de son</title>
<style>
/* LA PAGE D'ÉCOUTE des propositions de son (écrite par propositions.cjs — ne pas éditer à la main) */
:root{--bg:#0d0f14;--pan:#161a22;--ln:#262c38;--tx:#eef1f7;--mu:#97a2b6;--ac:#ffb02e}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 60px}
h1{margin:0;font-size:26px;letter-spacing:.06em}.chapo{color:var(--mu);margin:6px 0 20px}
.carte{background:var(--pan);border:1px solid var(--ln);border-radius:14px;padding:16px;margin-bottom:14px}
.carte h2{margin:0;font-size:19px;letter-spacing:.06em;display:flex;align-items:center;gap:10px}
.carte h2 span{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--ac);color:#1a1004;font-size:14px}
.carte>p{color:var(--mu);margin:4px 0 10px}
.ech{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--ln);flex-wrap:wrap}
.ech b{display:block}.ech small{color:var(--mu)}.ech audio{height:36px;width:300px;max-width:100%}
.suite{margin-top:8px;font:inherit;color:var(--tx);background:#222936;border:1px solid var(--ln);border-radius:9px;padding:8px 12px;cursor:pointer}
.suite:hover{border-color:var(--ac)}
#musique{position:sticky;top:0;z-index:5;background:rgba(13,15,20,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--ln);padding:10px 16px}
#musique div{max-width:760px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
#musique b{letter-spacing:.08em;font-size:13px}
#musique select,#musique button{font:inherit;color:var(--tx);background:#222936;border:1px solid var(--ln);border-radius:9px;padding:7px 10px;cursor:pointer}
#musique button.on{background:var(--ac);border-color:var(--ac);color:#1a1004;font-weight:700}
#musique label{color:var(--mu);font-size:13px;display:flex;align-items:center;gap:6px}
#musique input{width:120px;accent-color:var(--ac)}
</style></head><body>
<div id="musique"><div>
  <b>♪ MUSIQUE DU JEU</b>
  <select id="mSel">${MUSIQUES.map((m, i) => '<option value="' + i + '">' + esc(m[0]) + '</option>').join('')}</select>
  <button id="mJoue">▶ Lancer</button>
  <label>volume <input type="range" id="mVol" min="0" max="1" step="0.05" value="0.75"></label>
</div></div>
<main>
<h1>PROPOSITIONS DE SON</h1>
<p class="chapo">Cinq directions, toutes douces. Pour chacune, les mêmes quatre moments. Chaque proposition est réglée au même volume : on compare les caractères, pas les volumes. Au casque, c'est mieux. La musique du jeu (en haut) continue pendant les échantillons : on entend le moteur comme en jeu.</p>
${cartes}
</main>
<script>
/* LA MUSIQUE : elle tourne en boucle SOUS les échantillons (elle ne s'arrête pas quand un moteur joue) ; chaque morceau ramené au même niveau */
const MUS=${JSON.stringify(MUSIQUES)}, musBase='../../../assets/audio/music/';
const mus=new Audio();mus.loop=true;
const mSel=document.getElementById('mSel'),mJoue=document.getElementById('mJoue'),mVol=document.getElementById('mVol');
const volume=()=>{const m=MUS[+mSel.value];mus.volume=Math.min(1,Math.pow(10,(-15.5-m[2])/20)*(+mVol.value));};
const charge=()=>{mus.src=musBase+MUS[+mSel.value][1]+'.m4a';volume();};
const etiquette=()=>{const on=!mus.paused;mJoue.textContent=on?'❚❚ Pause':'▶ Lancer';mJoue.classList.toggle('on',on);};
mJoue.onclick=()=>{if(!mus.src)charge();if(mus.paused)mus.play().catch(()=>{});else mus.pause();};
mSel.onchange=()=>{const on=!mus.paused;charge();if(on)mus.play().catch(()=>{});};
mVol.oninput=volume;mus.onplay=etiquette;mus.onpause=etiquette;
/* un seul échantillon à la fois ; « les quatre à la suite » enchaîne la carte */
const tous=[...document.querySelectorAll('audio')];
tous.forEach(a=>a.addEventListener('play',()=>tous.forEach(b=>{if(b!==a)b.pause();})));
document.querySelectorAll('.suite').forEach(bt=>bt.onclick=()=>{
  const l=[...bt.parentNode.querySelectorAll('audio')];let i=0;
  const joue=()=>{if(i>=l.length)return;const a=l[i++];a.currentTime=0;a.onended=()=>{a.onended=null;setTimeout(joue,500);};a.play();};
  joue();
});
</script></body></html>
`;
}
if (require.main === module) principal();   /* en bas : MUSIQUES et page() doivent exister avant */
module.exports = { PROPS, SCENES, rends };
