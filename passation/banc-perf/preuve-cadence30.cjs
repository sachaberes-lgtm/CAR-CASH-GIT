#!/usr/bin/env node
/* (chef) V13 : LA CAISSE TRAVERSE-T-ELLE ENCORE QUELQUE CHOSE À 30 i/s ?  — la preuve avant de rouvrir la cadence 30 (PAL.B.cadence30)
   usage : node v13.cjs [port] [palier] [--rapide] [--n=20] [--graine=13] [--fichier=/chemin/index.html]
     (port et palier : acceptés par convention des v*.cjs, IGNORÉS — AUCUN navigateur, AUCUN serveur : tout tourne dans des bacs `vm` de node)
   MÉTHODE = celle de DEBUGGING (debug/banc/preuve-balayage.cjs, ligne `debug:preuve-balayage` du journal) :
     le test EXTRAIT du fichier du jeu le texte réel de `traficTick` (heure de pointe, niv. 19) et de `satHard` (pluie de satellites, EN ORBITE),
     avec SATOB / VTR_F / VTR_T / la boîte de pose0, et les exécute avec des bouchons minimaux (explode, traficChoc, frole, Vector3 de 6 méthodes).
     La caisse est POSÉE sur une trajectoire droite qui doit toucher l'obstacle, et avance de V·dt par image ; on compte « choc oui/non ».
   POURQUOI PAS dbgCadence : forcer 30 i/s fait sauter une image d'écran sur deux (cadSaute) → la simulation reçoit dt = 1/30 au lieu de 1/60
     (le plafond dt ≤ 0,05 s de loop n'est pas atteint). Donc « 30 i/s » = un pas de 1/30, « 60 i/s » = un pas de 1/60 : même chose, sans navigateur.
   CE QU'ON MESURE, pour chaque système × vitesse × cadence :
     · FRONTAL : trajectoire dans l'axe (écart latéral 0, cap 0, piqué 0) ; phase du sous-pas tirée au hasard → doit choquer N fois sur N.
     · BIAIS   : cap ±0,2 rad, écart latéral et (en vol) piqué tirés au hasard, mais GARANTIS traverser le plan médian de l'obstacle DANS sa boîte
                 (même oracle `classe` que DEBUGGING) → doit choquer N fois sur N. (Le « coin », qui écorne la boîte sans franchir le plan médian dedans,
                 est exclu : c'est la tolérance du bord, mesurée par DEBUGGING, pas un défaut.)
     · FAUX POSITIFS : N trajectoires qui passent HORS de la boîte → 0 choc attendu.
     · CONTRÔLE : l'ANCIEN code (git show 0c1ecee, sinon le correctif retiré du texte) à 30 i/s plein axe → DOIT rater, sinon la preuve ne prouve rien.
   Vitesses (m/s « monde », km/h = ×3,6 comme le compteur de DEBUGGING) : NORMALE (moteur 0, gaz de croisière, sans nitro) · 400 km/h (111 m/s) ·
     MAX atteignable (tout empilé : pad, frénésie, réserve bleue, NITROOO ×2,6 ; en vol : + éjection et 3 s de réacteur).
     Trafic : la vitesse du joueur est la vitesse ABSOLUE ; on en retranche la voiture du trafic (CV·SPD) pour la vitesse relative simulée.
   Sortie : mesures/v13-cadence.json + tableau ; PREUVE OK / PREUVE KO (code de sortie 0 / 1). Durée : ~1-3 s (N=20), ~1 s (--rapide). */
'use strict';
const fs = require('fs'), vm = require('vm'), cp = require('child_process');
const path = require('path'), DEPOT = path.resolve(__dirname, '../..'), RACINE = DEPOT, OUT = path.join(require('os').tmpdir(), 'v13-cadence.json'); // (passation) chemins relatifs au dépôt : lancer depuis n'importe où
const ARGS = process.argv.slice(2), opt = {};
for (const a of ARGS) { const m = /^--([a-z]+)(?:=(.*))?$/.exec(a); if (m) opt[m[1]] = m[2] === undefined ? true : m[2]; }
const N = +opt.n || (opt.rapide ? 5 : 20), GRAINE = +opt.graine || 13;
const FICHIER = opt.fichier || path.join(DEPOT, 'VERSION PRINCIPALE', 'index.html');
const DEPOT_DEBUG = DEPOT, ANCIEN = '0c1ecee';
const log = (...a) => console.log(...a);
const src = fs.readFileSync(FICHIER, 'utf8');

// ---------- PRNG déterministe ----------
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const alea = mulberry(GRAINE), entre = (a, b) => a + (b - a) * alea();

// ---------- EXTRACTION PAR REPÈRES DE TEXTE (copie de preuve-balayage.cjs) ----------
function finBloc(t, i0) {
  let d = 0;
  for (let i = i0; i < t.length; i++) {
    const c = t[i], n = t[i + 1];
    if (c === '/' && n === '/') { i = t.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && n === '*') { i = t.indexOf('*/', i + 2) + 1; continue; }
    if (c === "'" || c === '"' || c === '`') { i++; while (i < t.length && t[i] !== c) { if (t[i] === '\\') i++; i++; } continue; }
    if (c === '{') d++; else if (c === '}') { d--; if (d === 0) return i + 1; }
  }
  throw new Error('bloc non fermé');
}
function unique(t, rep) { const i = t.indexOf(rep); if (i < 0) throw new Error('repère introuvable : ' + rep); if (t.indexOf(rep, i + 1) >= 0) throw new Error('repère non unique : ' + rep); return i; }
function fonction(t, entete) { const i = unique(t, entete); return t.slice(i, finBloc(t, i + entete.length - 1)); }
function ligne(t, rep) { const i = unique(t, rep); let j = t.indexOf('\n', i); if (j < 0) j = t.length; return t.slice(i, j); }
function extrait(t) {
  const X = {};
  X.satob = ligne(t, 'const SATOB={'); X.satHard = fonction(t, 'function satHard(){');
  X.trafic = fonction(t, 'function traficTick(dt,sp){'); X.vtrF = ligne(t, 'const VTR_F=['); X.vtrT = ligne(t, 'const VTR_T=[');
  X.boite = ligne(t, 'const hw=(k===0?rad:rad*.8)'); X.pousse = ligne(t, 'SATOB.list.push({');
  return X;
}
const X = extrait(src);
function constantes(t) {
  const K = {};
  K.SPD = +/const SPD=([0-9.]+)/.exec(t)[1];
  K.NTR = +/function vitMult\(\)\{return Math\.min\(([0-9.]+),/.exec(t)[1] - 1; /* (18/10) le plafond ×2,6 : NTR_BOOST_MAX est parti avec NITROOO, vitMult porte le 2,6 */
  const iC = t.indexOf('const CARS='); const mC = /maxKmh:([0-9.]+),accel:([0-9.]+)/.exec(t.slice(iC < 0 ? 0 : iC)); K.maxKmh = +mC[1]; K.accel = +mC[2];
  const iE = unique(t, 'const ENGINE_TIERS=['); const blocE = t.slice(iE, t.indexOf('\n];', iE)); K.push = (blocE.match(/push:([0-9.]+)/g) || []).map(function (x) { return +x.slice(5); });
  return K;
}
const K = constantes(src), SPD = K.SPD, MULT = 1 + K.NTR, CV = 62, VC_TRAFIC = CV * SPD; // CV : la vitesse d'une voiture du trafic (unités de vA), comme DEBUGGING
function plafond(tier, th, nit) { const p = K.push[tier], late = 1 + Math.min(.5, Math.max(0, tier - 8) * .035), maxSp = K.maxKmh / 3.6 * late * p, acc9 = K.accel * late * (1 + (p - 1) * .6); return maxSp * Math.sqrt(5.8 * (th + nit * p / acc9)) * SPD * MULT; }
const TMAX = K.push.length - 1;
const V_NORMALE = Math.round(plafond(0, .55, 0) / MULT * 10) / 10;                 // moteur 0, gaz de croisière, sans nitro, sans NITROOO
const V_400 = Math.round(400 / 3.6 * 10) / 10;                                     // 400 km/h
const V_THEO = Math.round(plafond(TMAX, .55 * 1.5 * 2.8 * 1.24, 48));               // tout empilé, au sol
const V_VOL = Math.round(V_THEO + (46 + 96 * 1.4 * 3) * K.push[TMAX] * SPD);        // en vol : + éjection + 3 s de réacteur bleu
const PALIERS = [['normale', V_NORMALE], ['400 km/h', V_400], ['max', V_THEO]];
const DTS = [['60', 1 / 60], ['30', 1 / 30]];

// ---------- LES BOUCHONS (copie de preuve-balayage.cjs) ----------
class V3 {
  constructor(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; } length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  addScaledVector(v, k) { this.x += v.x * k; this.y += v.y * k; this.z += v.z * k; return this; } clone() { return new V3(this.x, this.y, this.z); }
}
const v3 = function (x, y, z) { return new V3(x, y, z); }, comb = function () { const r = new V3(); for (let i = 0; i < arguments.length; i += 2) r.addScaledVector(arguments[i], arguments[i + 1]); return r; },
  unit = function (v) { const l = v.length(); return v3(v.x / l, v.y / l, v.z / l); }, croix = function (a, b) { return v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); };
function bacSat(code) {
  const sb = {
    Math: Math, THREE: { Vector3: V3 }, ORB: { actif: true }, started: true, gameOver: false, mode: 'drive', graceT: 0, carGroup: { position: new V3() }, shake: 0,
    sparkGold: {}, sparkBurst: function () { }, vA: 0, SPD: SPD, fallVel: new V3(), mult: 1, nBoom: 0, nFrole: 0
  };
  sb.vitMult = function () { return sb.mult; }; sb.explode = function (c) { sb.nBoom++; sb.cause = c; }; sb.frole = function () { sb.nFrole++; };
  vm.createContext(sb); vm.runInContext(code.satob + '\n' + code.satHard + '\n;globalThis.__S=SATOB;globalThis.__f=satHard;', sb); return sb;
}
function bacTrafic(code) {
  const im = function () { return { count: 0, instanceMatrix: {}, instanceColor: null, setMatrixAt: function () { }, setColorAt: function () { } }; };
  const sb = {
    Math: Math, mode: 'drive', side: 1, s: 0, lat: 0, vA: 0, SPD: SPD, L: 1e9, THICK: 2.6, mult: 1, VC: { gel: 0 }, CITY: { uT: { value: 0 } }, VQ: { setFromEuler: function () { return this; } },
    VF: { p: new V3(), b: new V3(), n: new V3(), t: new V3() }, VM4: {}, VV1: new V3(), VV2: new V3(), VZ: { bouchons: [] },
    VTR: { on: true, klaxT: 0, o: {}, o2: {}, cars: [], N: 0, im: im(), imL: im(), cl: im(), eu: { set: function () { return this; } }, col: { setHex: function () { return this; } }, du: { mesh: { position: new V3() } }, chocN: 0, froN: 0 },
    nChoc: 0, nFrole: 0, nKlax: 0
  };
  sb.vitMult = function () { return sb.mult; }; sb.frameAt = function () { }; sb.traficLibre = function () { return false; }; sb.klaxon = function () { sb.nKlax++; }; sb.vChip = function () { }; sb.TR = function (x) { return x; };
  sb.frole = function () { sb.nFrole++; };
  sb.traficChoc = function (c, dl) { sb.nChoc++; c.fly = 1.7; sb.vA *= .62; sb.VC.gel = .3; c.vel = new V3(); c.p = new V3(); c.q = { multiply: function () { } }; c.w = new V3(); }; // (transcrit) les effets de jeu du vrai traficChoc
  vm.createContext(sb); vm.runInContext(code.vtrF + '\n' + code.vtrT + '\n' + code.trafic + '\n;globalThis.__f=traficTick;globalThis.__F=VTR_F;globalThis.__T=VTR_T;', sb); return sb;
}

// ---------- L'ORACLE (copie) : la droite du trajet contre la boîte ----------
const MARGE = .01;
function droiteCoupe(c0, dv, h, m) {
  let lo = -Infinity, hi = Infinity;
  for (let i = 0; i < c0.length; i++) {
    const H = h[i] + m; if (Math.abs(dv[i]) < 1e-12) { if (Math.abs(c0[i]) >= H) return false; }
    else { let a = (-H - c0[i]) / dv[i], b = (H - c0[i]) / dv[i]; if (a > b) { const t = a; a = b; b = t; } if (a > lo) lo = a; if (b < hi) hi = b; }
  }
  return lo < hi;
}
function classe(c0, dv, h) { // axe 0 = le long (plan médian = 0). 'dedans' : plan médian franchi dans la boîte · 'dehors' : la droite ne coupe pas la boîte · 'coin' : le reste
  const k = -c0[0] / dv[0]; let ok = true; for (let i = 1; i < c0.length; i++) { const v = Math.abs(c0[i] + dv[i] * k); if (v >= h[i] - MARGE) ok = false; }
  if (ok) return 'dedans'; if (!droiteCoupe(c0, dv, h, MARGE)) return 'dehors'; return 'coin';
}

// ====================================================================================================================
// SATELLITES (satHard) — la caisse roule sur la piste d'orbite ('drive') ou arrive en vol ('fall')
// ====================================================================================================================
const REP = (function () { const t = unit(v3(.6, .2, .77)), n0 = v3(.1, 1, .05), n = unit(comb(n0, 1, t, -n0.dot(t))), b = croix(n, t); return { t: t, n: n, b: b, p: v3(1840, 212, -960) }; })();
const fabBoite = new Function('k', 'rad', 's9', 'la', 'q', 'W', 'U', 'Tt', 'haut', X.boite + '\nconst SATOB={list:[]};\n' + X.pousse + '\nreturn SATOB.list[0];');
function satellite(k, rad, al, be, la, h, haut) { // (transcrit de pose0)
  const ca = Math.cos(al), sa = Math.sin(al), cb = Math.cos(be), sb = Math.sin(be); let W, U, T;
  if (k === 0) { W = comb(REP.b, ca, REP.n, sa); U = comb(REP.n, ca, REP.b, -sa); T = REP.t.clone(); } else { W = comb(REP.b, cb, REP.t, sb); U = REP.n.clone(); T = comb(REP.t, cb, REP.b, -sb); }
  const q = comb(REP.p, 1, REP.b, la, REP.n, h), o = fabBoite(k, rad, 1000, la, q, unit(W), unit(U), unit(T), haut); o.__la = la; o.__h = h; o.__Xs = Math.sqrt(o.R2) + 8; return o;
}
const SATS = [['panneau 14 m penché 8°', satellite(0, 7, .14, 0, 3, 1.15, false)], ['panneau 20 m penché -28°', satellite(0, 10, -.49, 0, -5, 1.15, false)],
['étage 10 m biais +17°', satellite(1, 6, 0, .3, 2, 6 * .24 + .3, false)], ['étage 14 m biais -14°', satellite(1, 9, 0, -.25, -4, 9 * .24 + .3, false)],
["panneau EN L'AIR 16 m penché 29°", satellite(0, 8, .5, 0, 6, 12, true)]];
function geoSat(o, tr) { // tr = [psi, piqué, hauteur de passage, écart latéral d]
  const C = comb(REP.p, 1, REP.b, o.__la + tr[3], REP.n, tr[2]), D = unit(comb(REP.t, 1, REP.b, Math.tan(tr[0]), REP.n, Math.tan(tr[1])));
  const r = v3(C.x - o.q.x, C.y - o.q.y, C.z - o.q.z), c0 = [r.dot(o.T), r.dot(o.W), r.dot(o.U)], dv = [D.dot(o.T), D.dot(o.W), D.dot(o.U)];
  return { C: C, D: D, cl: classe(c0, dv, [o.ht, o.hw, o.hu]) };
}
function essaiSat(sb, o, G, V, dt, phi, vol) {
  const S = sb.__S, P = sb.carGroup.position, pas = V * dt, Xs = o.__Xs, x0 = -Xs - (1 + phi) * pas, C = G.C, D = G.D;
  o.fait = false; o.pres = 0; o.min = 99; S.pv = false; S.on = true; sb.nBoom = 0; sb.nFrole = 0; sb.graceT = 0; sb.gameOver = false; sb.started = true;
  if (vol) { sb.mode = 'fall'; sb.vA = 0; sb.mult = 1; sb.fallVel.set(D.x * V / SPD, D.y * V / SPD, D.z * V / SPD); } else { sb.mode = 'drive'; sb.mult = V > 500 ? MULT : 1; sb.vA = V / (SPD * sb.mult); sb.fallVel.set(0, 0, 0); }
  for (let i = 0; ; i++) { const x = x0 + i * pas; if (x > Xs + 2 * pas) break; P.set(C.x + D.x * x, C.y + D.y * x, C.z + D.z * x); sb.__f(); if (sb.nBoom) return 1; }
  return 0;
}
/* Une trajectoire de classe voulue ('dedans' ou 'dehors') pour le mode demandé. Retourne {o, G, tr} ou null.
   frontal = dans l'axe ; biais = cap ±0,2 rad, écart latéral et (vol) piqué aléatoires ; dehors = écart latéral au-delà de hw + 3 m. */
function tireSat(mode, vol, genre) {
  const liste = SATS.filter(function (s) { return vol ? true : !s[1].haut; });
  for (let essai = 0; essai < 200; essai++) {
    const o = liste[Math.floor(alea() * liste.length)][1], hw = o.hw; let tr;
    const hc = o.haut ? o.__h : o.__h;
    if (genre === 'dehors') tr = [mode === 'frontal' ? 0 : entre(-.2, .2), vol ? entre(-.8, 0) : 0, vol ? hc : 0, (alea() < .5 ? -1 : 1) * (hw + 3 + alea() * 4)];
    else if (mode === 'frontal') tr = [0, 0, vol ? hc : 0, 0];
    else tr = [entre(-.2, .2), vol ? entre(-.8, -.1) : 0, vol ? hc + entre(0, 2.5) : 0, entre(-hw, hw)];
    const G = geoSat(o, tr);
    if (G.cl === genre || (genre === 'dedans' && G.cl === 'dedans')) return { o: o, G: G, tr: tr };
  }
  return null;
}

// ====================================================================================================================
// TRAFIC DE L'HEURE DE POINTE (traficTick, niv. 19)
// ====================================================================================================================
function essaiTrafic(sb, ty, tr, V, dt, phi, cote) { // V = vitesse RELATIVE (m/s) ; tr = [pente, l0]
  const T9 = sb.__T[ty], W9 = T9[3] + 2.1, Vc = CV * SPD, Vp = V + Vc, pas = V * dt, c = { s: 5000, lane: 3, f0: 3, f1: 3, u: 1, lat: sb.__F[3], v: CV, ty: ty, col: 0, ch: 1e9, bl: 0, dm: 9, fr: false, klax: 0, fly: 0, mort: false };
  sb.VTR.cars.length = 0; sb.VTR.cars.push(c); sb.nChoc = 0; sb.nFrole = 0; sb.VC.gel = 0; sb.mode = 'drive'; sb.side = cote; sb.mult = Vp > 500 ? MULT : 1; sb.vA = Vp / (SPD * sb.mult);
  const g0 = -(W9 + (2 + phi) * pas), fin = T9[3] + 2.6 + 2 * pas; sb.s = c.s + g0;
  for (let i = 1; ; i++) { const g = g0 + i * pas; if (g > fin + pas) break; sb.s += Vp * dt; sb.lat = cote * (c.lat + tr[1] + tr[0] * g); sb.__f(dt, sb.s); if (sb.nChoc) return 1; }
  return 0;
}
function tireTrafic(sb, mode, genre) {
  for (let essai = 0; essai < 200; essai++) {
    const ty = Math.floor(alea() * 3), T9 = sb.__T[ty], h = [T9[3] + 2.1, T9[4] + 1.15], E = h[1];
    let pente, l0;
    if (genre === 'dehors') { pente = mode === 'frontal' ? 0 : entre(-.1, .1); l0 = (alea() < .5 ? -1 : 1) * (E + 3 + alea() * 4); }
    else if (mode === 'frontal') { pente = 0; l0 = 0; }
    else { pente = entre(-.3, .3); l0 = entre(-E, E); }
    if (classe([0, l0], [1, pente], h) === genre) return { ty: ty, tr: [pente, l0], cote: alea() < .5 ? 1 : -1 };
  }
  return null;
}

// ====================================================================================================================
// LA CAMPAGNE
// ====================================================================================================================
/* Pour un code donné (courant ou ancien), un système, une vitesse : N essais frontaux, N de biais, N hors-boîte (faux positifs),
   chacun rejoué à 60 puis à 30 i/s sur la MÊME géométrie et la même phase. Retourne {frontal:{60:[choc,N],30:[…]}, biais:{…}, faux:{…}, ecartes}. */
function campagne(code, systeme, V, n, seulementFrontal) {
  const R = { frontal: {}, biais: {}, faux: {}, ecartes: 0, pasM: {} };
  for (const d of DTS) { R.pasM[d[0]] = +(V * d[1]).toFixed(1); for (const g of ['frontal', 'biais', 'faux']) R[g][d[0]] = [0, 0]; }
  const sbS = systeme !== 'trafic' ? bacSat(code) : null, sbT = systeme === 'trafic' ? bacTrafic(code) : null;
  const familles = seulementFrontal ? [['frontal', 'frontal', 'dedans']] : [['frontal', 'frontal', 'dedans'], ['biais', 'biais', 'dedans'], ['faux', 'biais', 'dehors']];
  for (const fam of familles) {
    for (let i = 0; i < n; i++) {
      const phi = alea();
      let t;
      if (systeme === 'trafic') t = tireTrafic(sbT, fam[1], fam[2]); else t = tireSat(fam[1], systeme === 'sat-vol', fam[2]);
      if (!t) { R.ecartes++; continue; }
      for (const d of DTS) {
        let c;
        if (systeme === 'trafic') c = essaiTrafic(sbT, t.ty, t.tr, V - VC_TRAFIC, d[1], phi, t.cote);
        else { sbS.__S.list.length = 0; sbS.__S.list.push(t.o); c = essaiSat(sbS, t.o, t.G, V, d[1], phi, systeme === 'sat-vol'); }
        R[fam[0]][d[0]][0] += c; R[fam[0]][d[0]][1]++;
      }
    }
  }
  return R;
}
const SYSTEMES = [['trafic', 'trafic niv. 19'], ['sat-sol', 'satellites EN ORBITE (roule)'], ['sat-vol', 'satellites EN ORBITE (vol)']];
const vitessesDe = function (sys) { return PALIERS.map(function (p, i) { return [p[0], (sys === 'sat-vol' && i === 2) ? V_VOL : p[1]]; }); };

function ancienCode() { // le code d'AVANT le balayage (DEBUGGING) pour le CONTRÔLE ; git d'abord, sinon le correctif retiré du texte courant
  try {
    const t = cp.execFileSync('git', ['-C', DEPOT_DEBUG, 'show', ANCIEN + ':VERSION PRINCIPALE/index.html'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const A = extrait(t); A.src = 'git show ' + ANCIEN; return A;
  } catch (e) { }
  const A = Object.assign({}, X); A.src = 'reconstruit : le correctif retiré du texte courant';
  { const i = A.satHard.indexOf('if(bal){'); if (i < 0) throw new Error('ancien code : if(bal){ introuvable'); A.satHard = A.satHard.slice(0, i) + A.satHard.slice(finBloc(A.satHard, i + 7)); }
  { const a = 'if((Math.abs(dS)<W9||saut9)&&dlB<T9[4]+1.15){traficChoc(c,dlB);continue;}'; if (A.trafic.indexOf(a) < 0) throw new Error('ancien code : test du trafic introuvable'); A.trafic = A.trafic.replace(a, 'if(Math.abs(dS)<W9&&dl<T9[4]+1.15){traficChoc(c,dl);continue;}'); }
  return A;
}

const t0 = Date.now(), KO = [], res = { quand: new Date().toISOString(), fichier: FICHIER, n: N, graine: GRAINE, rapide: !!opt.rapide, methode: 'bac vm : traficTick/satHard extraits du fichier (méthode DEBUGGING preuve-balayage.cjs) ; 30 i/s = pas de 1/30, 60 i/s = pas de 1/60',
  vitesses: { normale: V_NORMALE, '400': V_400, max: V_THEO, maxVol: V_VOL, kmh: { normale: Math.round(V_NORMALE * 3.6), '400': 400, max: Math.round(V_THEO * 3.6), maxVol: Math.round(V_VOL * 3.6) }, traficCV: +VC_TRAFIC.toFixed(1) }, cases: [], controle: [] };
log('V13 — la caisse traverse-t-elle encore quelque chose à 30 i/s ?   fichier : ' + FICHIER);
log('N = ' + N + ' essais par case et par famille · graine ' + GRAINE + ' · aucun navigateur (bacs vm)');
log('vitesses (m/s monde = km/h compteur DEBUGGING / 3,6) : normale ' + V_NORMALE + ' (' + Math.round(V_NORMALE * 3.6) + ' km/h) · 400 km/h ' + V_400 + ' · max ' + V_THEO + ' (' + Math.round(V_THEO * 3.6) + ' km/h) · max en vol ' + V_VOL + ' · voiture du trafic ' + VC_TRAFIC.toFixed(1) + ' m/s');
log('');
const pad = function (x, n) { x = String(x); return x.length >= n ? x : x + ' '.repeat(n - x.length); };
const cel = function (a) { return a[0] + '/' + a[1]; };
log(pad('système', 30) + pad('vitesse', 22) + pad('m/image 60·30', 14) + pad('FRONTAL 60', 12) + pad('FRONTAL 30', 12) + pad('BIAIS 60', 11) + pad('BIAIS 30', 11) + pad('FAUX+ 60', 10) + 'FAUX+ 30');
for (const sy of SYSTEMES) {
  for (const vv of vitessesDe(sy[0])) {
    const R = campagne(X, sy[0], vv[1], N, false);
    const ligneCase = { systeme: sy[0], vitesse: vv[0], ms: vv[1], kmh: Math.round(vv[1] * 3.6), pasM: R.pasM, frontal: R.frontal, biais: R.biais, fauxPositifs: R.faux, ecartes: R.ecartes };
    res.cases.push(ligneCase);
    log(pad(sy[1], 30) + pad(vv[0] + ' ' + Math.round(vv[1] * 3.6) + ' km/h', 22) + pad(R.pasM['60'] + '·' + R.pasM['30'] + ' m', 14)
      + pad(cel(R.frontal['60']), 12) + pad(cel(R.frontal['30']), 12) + pad(cel(R.biais['60']), 11) + pad(cel(R.biais['30']), 11) + pad(cel(R.faux['60']), 10) + cel(R.faux['30']) + (R.ecartes ? '   (' + R.ecartes + ' tirages écartés)' : ''));
    for (const d of DTS) {
      if (R.frontal[d[0]][1] === 0 || R.biais[d[0]][1] === 0) KO.push(sy[0] + ' ' + vv[0] + ' ' + d[0] + ' i/s : aucun essai généré');
      if (R.frontal[d[0]][0] < R.frontal[d[0]][1]) KO.push(sy[0] + ' ' + vv[0] + ' (' + Math.round(vv[1] * 3.6) + ' km/h) ' + d[0] + ' i/s : plein axe TRAVERSÉ ' + (R.frontal[d[0]][1] - R.frontal[d[0]][0]) + '/' + R.frontal[d[0]][1]);
      if (R.biais[d[0]][0] < R.biais[d[0]][1]) KO.push(sy[0] + ' ' + vv[0] + ' (' + Math.round(vv[1] * 3.6) + ' km/h) ' + d[0] + ' i/s : biais TRAVERSÉ ' + (R.biais[d[0]][1] - R.biais[d[0]][0]) + '/' + R.biais[d[0]][1]);
      if (R.faux[d[0]][0] > 0) KO.push(sy[0] + ' ' + vv[0] + ' ' + d[0] + ' i/s : FAUX POSITIF ' + R.faux[d[0]][0] + '/' + R.faux[d[0]][1]);
    }
  }
}

// CONTRÔLE : l'ancien code à 30 i/s, plein axe, aux mêmes vitesses — DOIT rater, sinon la preuve ne prouve rien
log('\nCONTRÔLE — l\'ANCIEN code (avant le choc balayé), plein axe : choc/essais (doit RATER à 30 i/s aux vitesses élevées)');
let A = null; try { A = ancienCode(); } catch (e) { KO.push('contrôle : ancien code indisponible : ' + e.message); log('  ancien code indisponible : ' + e.message); }
if (A) {
  res.controleSource = A.src; log('  source : ' + A.src);
  log(pad('système', 30) + pad('vitesse', 22) + pad('60 i/s', 10) + '30 i/s');
  const raté = { trafic: 0, 'sat-sol': 0, 'sat-vol': 0 };
  for (const sy of SYSTEMES) for (const vv of vitessesDe(sy[0])) {
    const R = campagne(A, sy[0], vv[1], N, true);
    res.controle.push({ systeme: sy[0], vitesse: vv[0], ms: vv[1], frontal: R.frontal });
    raté[sy[0]] += R.frontal['30'][1] - R.frontal['30'][0];
    log(pad(sy[1], 30) + pad(vv[0] + ' ' + Math.round(vv[1] * 3.6) + ' km/h', 22) + pad(cel(R.frontal['60']), 10) + cel(R.frontal['30']));
  }
  for (const sy of SYSTEMES) if (!raté[sy[0]]) { // DEBUGGING ne contrôlait que le sol : pour le vol, l'ancien code peut ne rien rater (information, pas un échec)
    const m = 'contrôle : l\'ancien code ne rate rien à 30 i/s pour ' + sy[0] + ' (aux vitesses testées) : la preuve ne prouve rien pour ce système';
    if (sy[0] === 'sat-vol') log('  INFO ' + m); else KO.push(m);
  }
  res.controleRates30 = raté;
}

res.duree_s = +((Date.now() - t0) / 1000).toFixed(1);
res.verdict = KO.length ? 'KO' : 'OK'; res.ko = KO;
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
log('\n(' + res.duree_s + ' s) écrit ' + OUT);
if (KO.length) { log(KO.length + ' cas en échec ; les premiers :'); for (const m of KO.slice(0, 12)) log('  · ' + m); log('PREUVE KO — ' + KO[0]); process.exit(1); }
log('PREUVE OK — à 30 i/s la caisse ne traverse plus rien (trafic niv. 19, satellites roulant et en vol), à 3 vitesses, plein axe et de biais ; l\'ancien code, lui, rate.');
process.exit(0);
