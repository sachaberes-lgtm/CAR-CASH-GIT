#!/usr/bin/env node
/* LE BANC DU LOT MUSIQUECALME (2026-11-18) — EN NODE, SANS AUCUN SON, sans Chrome.
   Le VRAI lecteur en segments (assets/audio/pouce-bleu-jeu.js, POUCE_JEU._joueurSegments) chargé dans un contexte vm, sur une horloge VIRTUELLE :
   faux AudioContext (sources posées et arrêtées, gains suivis), faux fetch, faux decodeAudioData qui COMPTE les décodages (heure, durée simulée, en parallèle ou non).
   Rien n'est décodé ni joué : on compte et on vérifie l'enchaînement à l'échantillon près (heures de départ exactes, une seule voix audible par mesure, le bon fichier).
   · chaud simulé : décodage 150-400 ms ; chaque fin de décodage bloque le fil 100-250 ms (le gel vu dans la boîte de vol) ; en plus des gels au hasard (50/min, 90-200 ms).
   · froid : décodage 18 ms, pas de gel.
   usage : node outils/banc-musiquecalme/sim.cjs [--duree 180] [--pas 5] [--graine 7] [--json] [--source fichier.js] [--qs '?sans=musiquecalme' (ajouté à chaque régime)]
   Trois régimes comparés : FROID (lecteur d'avant, au frais), CHAUD-AVANT (?sans=musiquecalme, chaud), CHAUD-CALME (le lot, chaud). Scénarios : moteur +1 toutes les `pas` s
   (dents de scie 1→30→1), et « boosts » (sauts de 1 à 4 paliers à intervalles irréguliers). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const JEU = path.resolve(__dirname, '../../VERSION PRINCIPALE');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const DUREE = +opt('duree', 180), PAS = +opt('pas', 5), GRAINE = +opt('graine', 7), JSON_OUT = a.includes('--json');
const SRC = fs.readFileSync(opt('source', path.join(JEU, 'assets/audio/pouce-bleu-jeu.js')), 'utf8');   /* --source <fichier> : un autre lecteur (ex. celui d'avant le lot, pour la preuve au bit près du ?sans=) */
const PC = (() => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(JEU, 'assets/audio/music/course/index.js'), 'utf8'), { window: w }); return w.PALIERS_COURSE; })();
const F = PC['bleu-9551'];

function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

async function essai(nom, qs, env, chaud, scen, flux) {
  if (opt('qs')) qs = qs ? qs + '&' + opt('qs').replace(/^\?/, '') : opt('qs');
  const R = mulberry(GRAINE);
  let now = 0, bloque = 0, seq = 0; const Q = [];   /* l'horloge virtuelle (ms), le fil bloqué jusqu'à `bloque`, les minuteries */
  const pose = (t, f, iv) => { const o = { t: Math.max(t, now), f, iv, id: ++seq, mort: false }; Q.push(o); return o; };
  const ctx = { console, URL, Blob, Promise, Math, JSON, Date, Number, String, Set, Map, Object, Array, Error, Proxy, Reflect, Float32Array, Float64Array, Uint32Array };
  ctx.window = ctx; ctx.globalThis = ctx;
  ctx.location = { search: qs, href: 'http://127.0.0.1/', pathname: '/' };
  ctx.performance = { now: () => now };
  ctx.setTimeout = (f, d) => pose(now + (d || 0), f, 0); ctx.clearTimeout = o => { if (o) o.mort = true; };
  ctx.setInterval = (f, d) => pose(now + d, f, d); ctx.clearInterval = o => { if (o) o.mort = true; };
  ctx.localStorage = { getItem: () => null, setItem() {} };
  ctx.document = { createElement: () => ({}), head: { appendChild() {} }, body: { appendChild() {} } };
  ctx.fetch = u => new Promise(ok => pose(now + 2, () => ok({ ok: true, arrayBuffer: () => Promise.resolve({ byteLength: 126000, __f: u }) }), 0));
  Object.assign(ctx, env);
  vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const PB = ctx.POUCE_JEU;
  /* le faux contexte audio */
  const SR = 48000, LEN = Math.round(F.segN * SR / F.sr), VOIX = [], DEC = [], BLOCS = [];
  let enVol = 0, enVolMax = 0;
  class Param { constructor(v) { this.value = v; this.ev = []; }
    setValueAtTime(v, t) { this.ev.push({ k: 's', v, t }); } linearRampToValueAtTime(v, t) { this.ev.push({ k: 'r', v, t }); }
    setTargetAtTime(v, t, tau) { this.ev.push({ k: 's', v, t: t + 3 * tau }); } cancelScheduledValues(t) { this.ev = this.ev.filter(e => e.t < t); }
    a(t) { let v = this.value, lt = -1e9; for (const e of this.ev) { if (e.t <= t) { v = e.v; lt = e.t; } else { if (e.k === 'r') v = v + (e.v - v) * (t - lt) / (e.t - lt); break; } } return v; } }
  const noeud = () => ({ connect() {}, disconnect() {} });
  const ac = { sampleRate: SR, get currentTime() { return now / 1000; },
    createGain() { return Object.assign(noeud(), { gain: new Param(1) }); },
    createBiquadFilter() { return Object.assign(noeud(), { type: '', frequency: new Param(350), Q: new Param(1), gain: new Param(0) }); },
    createConvolver() { return Object.assign(noeud(), { buffer: null }); },
    createOscillator() { return Object.assign(noeud(), { type: '', frequency: new Param(440), start() {}, stop() {} }); },
    createBuffer(n, l, sr) { return { numberOfChannels: n, length: l, sampleRate: sr, getChannelData: () => new Float32Array(1) }; },
    createBufferSource() { const s = Object.assign(noeud(), { buffer: null, onended: null, _fin: Infinity, _stop: Infinity, _g: null,
      start(t, off) { s.t = t; s.off = off; s._fin = t + (s.buffer.length / SR - off); arme(); },
      stop(t) { s._stop = t == null ? now / 1000 : t; arme(); } });
      const arme = () => { const e = Math.min(s._fin, s._stop); if (isFinite(e)) pose(e * 1000, () => { if (s.onended && Math.min(s._fin, s._stop) <= now / 1000 + 1e-9) { const f = s.onended; s.onended = null; f(); } }, 0); };
      s.connect = n => { s._g = n; }; VOIX.push(s); return s; },
    decodeAudioData(ab) { const t0 = now, d = chaud ? 150 + R() * 250 : 18; enVol++; if (enVol > enVolMax) enVolMax = enVol;
      return new Promise(ok => pose(now + d, () => { enVol--; DEC.push({ t: t0 / 1000, d, f: ab.__f });
        if (chaud) { const b = 100 + R() * 150; bloque = Math.max(bloque, now + b); BLOCS.push([now / 1000, (now + b) / 1000]); }
        ok({ numberOfChannels: 2, length: LEN, sampleRate: SR, __f: ab.__f }); }, 0)); } };
  /* les gels au hasard (chaud) : 50 par minute */
  if (chaud) { let t = 0; while (t < DUREE * 1000 + 5000) { t += -Math.log(1 - R()) * 1200; const b = 90 + R() * 110; pose(t, () => { bloque = Math.max(bloque, now + b); BLOCS.push([now / 1000, (now + b) / 1000]); }, 0); } }
  /* la boucle de l'horloge : la prochaine minuterie (repoussée tant que le fil est bloqué), puis les promesses */
  const tourne = async jusqua => { for (;;) { Q.sort((x, y) => x.t - y.t || x.id - y.id); const o = Q.shift(); if (!o) break; if (o.mort) continue; if (o.t > jusqua) { Q.unshift(o); now = jusqua; break; }
      now = o.t; if (now < bloque && o.iv >= 0) { o.t = bloque; Q.push(o); continue; } try { o.f(); } catch (e) { console.error('ERREUR', e); } if (o.iv) { o.t = now + o.iv; Q.push(o); }
      await new Promise(r => setImmediate(r)); } };
  const E = { id: 'bleu-9551', type: 'paliers', figee: true, titre: F.titre, fiche: F };
  let J = null, tDeb = 0, decLobby = 0;
  if (flux === 'pb') {
    /* LE VRAI CHEMIN DU JEU : le lobby du menu (PB.lobby, 30 s, une image toutes les 33 ms), puis le JOUER (PB.transforme → regle + prepare), puis la course (PB.moteur) */
    ctx.pbjTier = m => m; PB.liste = [E];
    PB.lobby(ac, noeud(), {}); for (let i = 0; i < 20 && !PB.J; i++) await tourne(now + 500); if (!PB.J) throw new Error('lobby pas prêt ' + PB.err);
    pose(now, () => { PB.niveau(.5); PB.moteur(1); }, 33).lobby = true; await tourne(30000);
    Q.forEach(o => { if (o.lobby) o.mort = true; }); decLobby = DEC.length;
    PB.transforme({}); J = PB.J; await tourne(now + 2000); PB.course(); tDeb = now / 1000;   /* le JOUER, 2 s de piqué, puis la course (musicStartRun → PB.course) */
  } else {
    /* le départ : comme PB.depart (lecteur créé, puis prepare) */
    PB._joueurSegments(ac, noeud(), E).then(j => { J = j; if (J.prepare) J.prepare(); });
    await tourne(600); if (!J) await tourne(2000); if (!J) throw new Error('lecteur pas prêt');
  }
  /* le jeu : une image toutes les 33 ms (PB.niveau puis PB.moteur → regle) */
  const T0 = J.etat().T0, mes = 240 / F.bpm, MS = F.segMesures, NS = F.segments;
  const demandes = scen(R); let di = 0, m = 1; const vues = [];
  const T1 = flux === 'pb' ? tDeb : T0, image = () => { const t = now / 1000 - T1; while (di < demandes.length && demandes[di].t <= t) { m = demandes[di].m; demandes[di].fait = now / 1000; di++; } PB.niveau(.5); if (flux === 'pb') PB.moteur(m); else J.regle(m); };
  pose(now, image, 33);
  pose(now + 250, () => { const e = J.etat(); vues.push(e.memoireMo); }, 250);
  await tourne(T1 * 1000 + DUREE * 1000);
  const et = J.etat(); J.stop(); await tourne(now + 1000);
  /* l'enchaînement : pour chaque mesure, les voix audibles en son milieu */
  const fichier = (p, j) => F.fichiers[F.seg[p][((j % NS) + NS) % NS]];
  let trousM = 0, doubles = 0, mauvais = 0, inexact = 0; const jouePal = [];
  const kDeb = Math.ceil((T1 - T0) / mes), nbM = Math.floor((T1 + DUREE - T0) / mes) - 1;
  const infos = VOIX.filter(s => s.t != null).map(s => { const k = Math.round((s.t - T0) / mes), j = Math.floor(k / MS); return { s, k, j, g: s._g && s._g.gain, f: s.buffer.__f }; });
  for (const v of infos) { if (v.s.t !== T0 + v.k * mes || Math.abs(v.s.off - (v.k - v.j * MS) * mes) > 1e-12) inexact++; }
  for (let k = 0; k < kDeb; k++) jouePal.push(-1);
  for (let k = kDeb; k < nbM; k++) { const tm = T0 + (k + .5) * mes, jk = Math.floor(k / MS);
    const au = infos.filter(v => v.s.t <= tm && v.k <= k && k < (v.j + 1) * MS && v.s._stop > tm && (!v.g || v.g.a(tm) > .5));
    if (!au.length) { trousM++; jouePal.push(null); continue; } if (au.length > 1) doubles++;
    const pal = F.seg.findIndex(L => L.some(x => F.fichiers[x] === au[0].f)); if (au[0].f !== fichier(pal, jk)) mauvais++; jouePal.push(pal); }
  /* le retard des bascules : de la demande au premier début de mesure où le palier joué est le demandé */
  const ret = [];
  for (let i = 0; i < demandes.length; i++) { const d = demandes[i]; if (d.fait == null) continue; const p = ctx.window.POUCE_JEU && F.paliers.indexOf(d.m); const k0 = Math.ceil((d.fait - T0) / mes);
    const fin = i + 1 < demandes.length && demandes[i + 1].fait != null ? demandes[i + 1].fait : T1 + DUREE; let k = k0; while (k < jouePal.length && jouePal[k] !== p && T0 + k * mes < fin) k++;
    if (k < jouePal.length && jouePal[k] === p) ret.push(T0 + k * mes - d.fait); else ret.push(null); }
  const ok = ret.filter(x => x != null).sort((x, y) => x - y), q = f => ok.length ? +ok[Math.min(ok.length - 1, Math.floor(f * ok.length))].toFixed(1) : null;
  /* les décodages EN COURSE (après les 4 s du départ) et leur voisinage avec les gels */
  const tC = T1 + 4, decC = DEC.filter(x => x.t >= tC), sousGel = decC.filter(x => BLOCS.some(b => x.t - .002 >= b[1] - 1e-9 && x.t - .002 < b[1] + 1)).length;
  /* par raison (journal du lot) : les lancements tombés dans la seconde qui suit la fin d'un gel */
  const apresGel = {}; if (et.calme && et.calme.journal) for (const [t, r] of et.calme.journal) if (t >= tC) { apresGel[r] = apresGel[r] || [0, 0]; apresGel[r][0]++; if (BLOCS.some(b => t >= b[1] - 1e-9 && t < b[1] + 1)) apresGel[r][1]++; }
  return { nom, flux: flux || 'lecteur', decodagesLobby30s: flux === 'pb' ? decLobby : undefined, decodagesTotal: DEC.length, decodagesDepart: DEC.length - decC.length - decLobby, decodagesEnCourse: decC.length, parMinute: +(decC.length / ((DUREE - 4) / 60)).toFixed(1),
    parSegment: +(decC.length / ((DUREE - 4) / (MS * mes))).toFixed(2), enParallele: enVolMax, lancesDansLaSecondeApresUnGel: sousGel, enCourseParRaison_lances_apresGel: et.calme && et.calme.on ? apresGel : undefined,
    raisons: et.calme && et.calme.on ? { prep: et.calme.prep, suivant: et.calme.suivant, force: et.calme.force, secours: et.calme.secours } : null,
    mesures: nbM - kDeb, mesuresSansVoix: trousM, mesuresADeuxVoix: doubles, mauvaisFichier: mauvais, departsInexacts: inexact, trousNotes: et.trous,
    picMo: et.picMo, memoireMaxVueMo: Math.max(...vues), basculesDemandees: demandes.length, basculesFaites: ok.length, retardMedianS: q(.5), retardP90S: q(.9), retardMaxS: ok.length ? +ok[ok.length - 1].toFixed(1) : null };
}
const scie = R => { const L = []; let m = 1, s = 1; for (let t = PAS; t < DUREE; t += PAS) { m += s; if (m >= 30) { m = 30; s = -1; } if (m <= 1) { m = 1; s = 1; } L.push({ t, m }); } return L; };
const cran15 = R => { const L = [{ t: .05, m: 15 }]; let m = 15; for (let t = 6; t < DUREE; t += PAS) { m = Math.min(30, m + 1); L.push({ t, m }); } return L; };   /* le départ au cran 15 (VITESSE DE DÉPART du garage), comme Sacha cette nuit */
const boosts = R => { const L = []; let m = 1; for (let t = 1.5; t < DUREE;) { t += 1 + R() * 8; m = Math.max(1, Math.min(30, m + (R() < .8 ? 1 + Math.floor(R() * 4) : -1 - Math.floor(R() * 3)))); L.push({ t, m }); } return L; };
(async () => {
  const OUT = [];
  for (const [sn, sc] of [['scie ' + PAS + ' s', scie], ['boosts', boosts]]) {
    OUT.push(Object.assign({ scenario: sn }, await essai('FROID (avant)', '', { __ccAllege: true, __ccThermique: 0 }, false, sc)));
    OUT.push(Object.assign({ scenario: sn }, await essai('CHAUD-AVANT (?sans=musiquecalme)', '?sans=musiquecalme', { __ccAllege: true, __ccThermique: 2 }, true, sc)));
    OUT.push(Object.assign({ scenario: sn }, await essai('CHAUD-CALME (le lot)', '', { __ccAllege: true, __ccThermique: 2 }, true, sc)));
    OUT.push(Object.assign({ scenario: sn }, await essai('ÉCO FROID (allégé + économie)', '', { __ccAllege: true, __ccThermique: 0, __ccEco: 1 }, false, sc)));
    OUT.push(Object.assign({ scenario: sn }, await essai('FROID (le lot, rien ne change)', '', { __ccAllege: true, __ccThermique: 1 }, false, sc)));
  }
  for (const [sn, sc] of [['pb scie ' + PAS + ' s', scie], ['pb boosts', boosts], ['pb cran15', cran15]]) {
    OUT.push(Object.assign({ scenario: sn }, await essai('PB CHAUD-AVANT (?sans=musiquecalme)', '?sans=musiquecalme', { __ccAllege: true, __ccThermique: 2 }, true, sc, 'pb')));
    OUT.push(Object.assign({ scenario: sn }, await essai('PB CHAUD-CALME (le lot)', '', { __ccAllege: true, __ccThermique: 2 }, true, sc, 'pb')));
  }
  if (JSON_OUT) console.log(JSON.stringify(OUT, null, 1));
  else for (const o of OUT) console.log(JSON.stringify(o));
})().catch(e => { console.error(e); process.exit(1); });
