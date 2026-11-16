#!/usr/bin/env node
/* LA FIDÉLITÉ NOTE PAR NOTE D'UN MORCEAU FIGÉ EN SEGMENTS (2026-11-15, lot MUSIQUE3 tour 2) — sans Chrome, sans son.
   1. LE JOURNAL DE LA PAGE : le <script id="morceau"> de la page est exécuté dans un FAUX contexte audio qui note chaque oscillateur et chaque frappe (heure, hauteur, bus d'arrivée) :
      ce que la page PLANIFIE en direct, mesure par mesure, sur le cycle (ici 32 mesures = 4 phrases). Par phrase : les notes du saxo, la ligne de basse, l'arpège d'eau, les congas.
   2. L'ÉCOUTE : le DIRECT = le cycle brut rendu comme la page le joue (<id>-p<p>.f32) ; le FIGÉ = les segments .m4a décodés par le décodeur d'Apple (afconvert, celui du téléphone), mis bout à bout.
      Chaque instrument est ISOLÉ par soustraction : mélange − le même rendu SANS cet instrument (<id>-p<p>-sans-<instrument>.f32, rendre-paliers.mjs --sans). Dans le figé il reste, en plus, le bruit du codeur.
      · saxo, basse, arpège d'eau : à l'heure de chaque note du journal, la HAUTEUR entendue (la plus forte des hauteurs de la gamme chromatique) ; elle doit être celle du journal ;
      · congas : pour chacun des 128 pas d'une phrase, frappe haute, basse ou rien ; le motif entendu doit être celui du journal.
   3. LE TEST DU ZÉRO : figé(phrase q) − direct(phrase h), pour les 16 couples. Sur la diagonale il ne reste que le bruit du codeur ; ailleurs, tout ce qui change d'une phrase à l'autre.
   usage : node outils/musique/fidelite-notes.mjs --id bleu-9551 --page nenuphars-velours --paliers 3,5,8,16,30 --travail <dossier des .f32> [--json sortie.json] [--journal-seul] */
import fs from 'node:fs'; import path from 'node:path'; import cp from 'node:child_process'; import os from 'node:os'; import { fileURLToPath } from 'node:url';
const ICI = path.dirname(fileURLToPath(import.meta.url)), JEU = path.resolve(ICI, '../../VERSION PRINCIPALE');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const ID = opt('id', 'bleu-9551'), PAGE = opt('page', 'nenuphars-velours'), PALIERS = opt('paliers', '3,5,8,16,30').split(',').map(Number), TRAVAIL = opt('travail', null);
const F = JSON.parse(fs.readFileSync(opt('fiche', path.join(JEU, 'assets/audio/music/course', ID, 'index.json')), 'utf8')), SR = F.sr, MES = 240 / F.bpm, CYC = F.mesures, NPH = CYC / 8, PH = 8 * MES;
/* ---------------------------------------------------------------- 1. le journal de la page (faux contexte audio) */
const html = fs.readFileSync(path.join(JEU, 'assets/audio/music/direct', PAGE + '.html'), 'utf8'), code = /<script[^>]*\bid\s*=\s*["']?morceau["']?[^>]*>([\s\S]*?)<\/script>/i.exec(html)[1];
const MORCEAU = new Function(code + '\n;return MORCEAU;')();
function journalDe(p) {
  const J = [], par = v => ({ value: v, setValueAtTime() { return this; }, linearRampToValueAtTime() { return this; }, exponentialRampToValueAtTime() { return this; }, setTargetAtTime() { return this; }, cancelScheduledValues() { return this; } });
  const nd = (genre, x) => Object.assign({ genre, sorties: [], connect(d) { this.sorties.push(d); return d; }, disconnect() {} }, x);
  const ctx = { sampleRate: SR, currentTime: 0, destination: nd('sortie'),
    createGain: () => nd('gain', { gain: par(1) }), createBiquadFilter: () => nd('filtre', { frequency: par(350), Q: par(1), gain: par(0), detune: par(0), type: 'lowpass' }), createStereoPanner: () => nd('pan', { pan: par(0) }),
    createOscillator: () => nd('osc', { frequency: par(440), detune: par(0), type: 'sine', start(t) { this.t = t; J.push(this); }, stop(t) { this.tFin = t; } }),
    createBufferSource: () => nd('frappe', { buffer: null, loop: false, playbackRate: par(1), start(t) { this.t = t; J.push(this); }, stop() {} }),
    createBuffer: (c, n, sr) => ({ numberOfChannels: c, length: n, sampleRate: sr, d: Array.from({ length: c }, () => new Float32Array(n)), getChannelData(k) { return this.d[k]; } }),
    createConvolver: () => nd('salle', { buffer: null }), createWaveShaper: () => nd('chaud', {}), createDelay: () => nd('retard', { delayTime: par(0) }),
    createDynamicsCompressor: () => nd('comp', { threshold: par(0), ratio: par(1), attack: par(0), release: par(0), knee: par(0) }) };
  let g = F.graine >>> 0; const alea = () => { g = (g * 1664525 + 1013904223) >>> 0; return g / 4294967296; };
  const kit = MORCEAU.preparer(ctx, ctx.destination, alea), bus = new Map(Object.entries(kit.bus).map(([k, v]) => [v, k])); J.length = 0;
  for (let m = 0; m < CYC; m++) MORCEAU.jouer(ctx, kit, p, m * MES, m, 1, alea);
  const busDe = n => { const vus = new Set(), file = [n]; while (file.length) { const x = file.shift(); if (!x || vus.has(x)) continue; vus.add(x); if (bus.has(x)) return bus.get(x); (x.sorties || []).forEach(y => file.push(y)); } return null; };
  const N = { sax: [], basse: [], eau: [], conga: [] };
  for (const o of J) { const b = busDe(o); if (!N[b] || o.genre !== 'osc') continue; const f = o.frequency.value;
    if (b === 'sax' && o.type !== 'sawtooth') continue; if (b === 'basse' && o.type !== 'sine') continue;   /* une entrée par note : la scie du saxo, le sinus de la basse */
    N[b].push({ t: o.t, f, dur: (o.tFin || o.t + .2) - o.t, midi: Math.round(69 + 12 * Math.log2(f / 440)) }); }
  for (const k in N) N[k].sort((x, y) => x.t - y.t);
  return N;
}
/* ---------------------------------------------------------------- 2. l'écoute */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fidelite-'));
function litWav(f) { const b = fs.readFileSync(f); let o = 12; while (o < b.length - 8) { const id = b.toString('latin1', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer.slice(b.byteOffset + o + 8, b.byteOffset + o + 8 + Math.min(n, b.length - o - 8))); o += 8 + n + (n & 1); } throw new Error('wav sans data'); }
function figeDe(k) { const M = new Float32Array(F.N), g = F.gains[k] || 1; for (let j = 0; j < F.segments; j++) { const wav = path.join(tmp, 'd.wav'); cp.execFileSync('afconvert', [path.join(JEU, F.fichiers[F.seg[k][j]]), '-f', 'WAVE', '-d', 'LEI16', wav]); const d = litWav(wav); if (d.length / 2 !== F.segN) throw new Error('segment de longueur ' + d.length / 2);
    for (let i = 0; i < F.segN; i++) M[j * F.segN + i] = g * (d[2 * i] + d[2 * i + 1]) / 65534; } return M; }
function brut(nom) { const f = path.join(TRAVAIL, nom + '.f32'); if (!fs.existsSync(f)) return null; const X = new Float32Array(fs.readFileSync(f).buffer.slice(0)), N = X.length / 2, M = new Float32Array(N); for (let i = 0; i < N; i++) M[i] = (X[i] + X[N + i]) / 2; return M; }
/* l'énergie à la fréquence f sur [t, t+w] (Goertzel, fenêtre de Hann), le cycle étant une boucle */
function energie(M, t, w, f) { const n = Math.round(w * SR), d = Math.round(t * SR), N = M.length, c = 2 * Math.cos(2 * Math.PI * f / SR); let s1 = 0, s2 = 0;
  for (let i = 0; i < n; i++) { const x = M[(((d + i) % N) + N) % N] * (.5 - .5 * Math.cos(2 * Math.PI * i / n)), s = x + c * s1 - s2; s2 = s1; s1 = s; } return (s1 * s1 + s2 * s2 - c * s1 * s2) / (n * n); }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12), NOMS = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si'], nom = m => NOMS[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
/* la fenêtre d'écoute d'une note : après l'attaque, sur la tenue */
const FEN = { sax: n => [.05, Math.max(.08, Math.min(.22, n.dur - .3))], basse: n => [.035, Math.max(.1, Math.min(.2, n.dur - .04))], eau: n => [.04, .12] };
/* LA HAUTEUR ENTENDUE : la candidate la plus forte de la gamme chromatique (pour le saxo : l'énergie de ses 6 premiers harmoniques, un peigne). `dbNote` = le niveau à la hauteur du journal : il sert à comparer
   le figé au direct note par note, même quand deux notes sonnent ensemble (l'eau en octaves, le saxo doublé). */
function peigne(M, t, w, f) { let tot = 0, e1 = 0; for (let h = 1; h <= 6 && h * f < SR * .45; h++) { const e = energie(M, t, w, h * f); tot += e; if (h === 1) e1 = e; } return [tot, e1]; }
/* le saxo (une scie filtrée, riche en harmoniques) : le peigne, et la candidate doit porter sa FONDAMENTALE (sinon c'est un sous-multiple d'une note plus haute) ; la basse (un sinus) et l'eau (un pluck presque pur) : la fondamentale seule */
function hauteur(M, inst, t, n, lo, hi) { const [av, w] = FEN[inst](n), P = inst === 'sax'; let mx = -1, m0 = 0, e0 = 0; for (let m = lo; m <= hi; m++) { const [tot, e1] = P ? peigne(M, t + av, w, mtof(m)) : [energie(M, t + av, w, mtof(m)), 1]; if (m === n.midi) e0 = tot; if (P && e1 < .1 * tot) continue; if (tot > mx) { mx = tot; m0 = m; } } return { midi: m0, db: 10 * Math.log10(mx + 1e-14), dbNote: 10 * Math.log10(e0 + 1e-14) }; }
/* les congas : pour chaque pas (double croche, les pas impairs un peu en retard comme dans la page), haute (H : un sinus qui tombe de 330 à 290 Hz), basse (L : de 215 à 180) ou rien */
function motifConga(M, dec) { const SD = MES / 16, E = []; for (let i = 0; i < 128; i++) { const t = dec + i * SD + (i % 2 ? SD * .1 : 0); E.push([energie(M, t + .004, .07, 311), energie(M, t + .004, .07, 198)]); }
  const mx = Math.max(...E.map(e => Math.max(e[0], e[1]))), seuil = mx * Math.pow(10, -12 / 10); return E.map(e => Math.max(e[0], e[1]) < seuil ? '.' : e[0] > e[1] ? 'H' : 'L').join(''); }
/* ---------------------------------------------------------------- 3. les tableaux */
const cle = n => Math.round(n.t * 1000) + ':' + n.midi, sortie = { id: ID, paliers: {} }, S = F.N / NPH, db = x => +(10 * Math.log10(x + 1e-18)).toFixed(1);
if (a.includes('--journal-seul')) { for (const p of PALIERS) { const N = journalDe(p); console.log('palier ' + p + ' : ' + Object.entries(N).map(([k, v]) => k + ' ' + v.length).join(', '));
    for (const inst of ['sax', 'basse', 'eau', 'conga']) for (let q = 0; q < NPH && N[inst].length; q++) console.log('  ' + inst + ' phrase ' + (q + 1) + ' : ' + N[inst].filter(n => n.t >= q * PH - 1e-6 && n.t < q * PH + 2 * MES - 1e-6).map(n => (inst === 'conga' ? (n.f > 300 ? 'H' : 'L') : nom(n.midi)) + '@' + ((n.t - q * PH) / (MES / 16)).toFixed(1)).join(' ')); } process.exit(0); }
for (const p of PALIERS) { const k = F.paliers.indexOf(p), N = journalDe(p), DR = brut(ID + '-p' + p), FG = figeDe(k), res = { instruments: {} }; if (!DR) throw new Error('pas de rendu brut du palier ' + p + ' dans ' + TRAVAIL);
  console.log('\n=== palier ' + p + ' ===');
  /* le test du zéro */
  const zero = []; for (let q = 0; q < NPH; q++) { const l = []; for (let h = 0; h < NPH; h++) { let e = 0, x = 0; for (let i = 0; i < S; i++) { const d = FG[q * S + i] - DR[h * S + i]; e += d * d; x += DR[h * S + i] * DR[h * S + i]; } l.push(db(e / x)); } zero.push(l); }
  const dd = []; for (let q = 0; q < NPH; q++) { const l = []; for (let h = 0; h < NPH; h++) { let e = 0, x = 0; for (let i = 0; i < S; i++) { const d = DR[q * S + i] - DR[h * S + i]; e += d * d; x += DR[h * S + i] * DR[h * S + i]; } l.push(q === h ? null : db(e / x)); } dd.push(l); }
  res.zero = zero; res.directContreDirect = dd;
  console.log('test du zéro, figé(q) − direct(h), dB sous le direct (ligne = phrase du figé) :'); zero.forEach((l, q) => console.log('  figé ' + (q + 1) + ' : ' + l.map(v => String(v).padStart(6)).join(' ')));
  console.log('direct(q) − direct(h) :'); dd.forEach((l, q) => console.log('  direct ' + (q + 1) + ' : ' + l.map(v => String(v == null ? '—' : v).padStart(6)).join(' ')));
  for (const inst of ['sax', 'basse', 'eau', 'conga']) { if (!N[inst].length) continue; const SANS = brut(ID + '-p' + p + '-sans-' + inst); if (!SANS) { console.log(inst + ' : pas de rendu « sans » (' + ID + '-p' + p + '-sans-' + inst + '.f32)'); continue; }
    const sd = new Float32Array(F.N), sf = new Float32Array(F.N); let ed = 0, ef = 0; for (let i = 0; i < F.N; i++) { sd[i] = DR[i] - SANS[i]; sf[i] = FG[i] - SANS[i]; ed += sd[i] * sd[i]; ef += (sf[i] - sd[i]) * (sf[i] - sd[i]); }
    const parPh = Array.from({ length: NPH }, (_, q) => N[inst].filter(n => n.t >= q * PH - 1e-6 && n.t < (q + 1) * PH - 1e-6).map(n => ({ t: n.t - q * PH, f: n.f, midi: n.midi, dur: n.dur })));
    const motifs = parPh.map(L => L.map(cle).join(' ')), sign = motifs.map(m => 'ABCD'[[...new Set(motifs)].indexOf(m)]), lignes = [];
    console.log(inst.toUpperCase() + '  (motifs du journal par phrase : ' + sign.join(' ') + ' ; instrument isolé : bruit du codeur à ' + db(ef / ed) + ' dB de l\'instrument)');
    for (let q = 0; q < NPH; q++) { const L = parPh[q];
      if (inst === 'conga') { const plan = Array(128).fill('.'); L.forEach(n => { plan[Math.round((n.t - (Math.round(n.t / (MES / 16)) % 2 ? MES / 160 : 0)) / (MES / 16))] = n.f > 300 ? 'H' : 'L'; }); const P = plan.join(''), md = motifConga(sd, q * PH), mf = motifConga(sf, q * PH), ecart = (x, y) => { let n = 0; for (let i = 0; i < 128; i++) if (x[i] !== y[i]) n++; return n; };
        /* le croisement : le motif entendu comparé au journal des AUTRES phrases */
        const autres = []; for (let h = 0; h < NPH; h++) if (h !== q) { const pl = Array(128).fill('.'); parPh[h].forEach(n => { pl[Math.round((n.t - (Math.round(n.t / (MES / 16)) % 2 ? MES / 160 : 0)) / (MES / 16))] = n.f > 300 ? 'H' : 'L'; }); autres.push(ecart(mf, pl.join(''))); }
        lignes.push({ phrase: q + 1, motif: sign[q], frappes: L.length, pasFauxDirect: ecart(md, P), pasFauxFige: ecart(mf, P), pasDifferentsFigeDirect: ecart(mf, md), pasFauxContreAutresPhrases: autres, journal: P.slice(0, 32), direct: md.slice(0, 32), fige: mf.slice(0, 32) });
        console.log('  phrase ' + (q + 1) + ' [' + sign[q] + '] : ' + L.length + ' frappes ; pas faux sur 128 : direct ' + ecart(md, P) + ', figé ' + ecart(mf, P) + ' ; pas où le figé diffère du direct : ' + ecart(mf, md) + ' (contre le journal des 3 autres phrases : ' + autres.join(', ') + ')\n      journal ' + P.slice(0, 32) + '\n      figé    ' + mf.slice(0, 32));
        continue; }
      const lo = Math.min(...N[inst].map(n => n.midi)) - 14, hi = Math.max(...N[inst].map(n => n.midi)) + 14, hd = L.map(n => hauteur(sd, inst, q * PH + n.t, n, lo, hi)), hf = L.map(n => hauteur(sf, inst, q * PH + n.t, n, lo, hi));
      const okd = hd.filter((h, i) => h.midi === L[i].midi).length, okf = hf.filter((h, i) => h.midi === L[i].midi).length, faux = hf.map((h, i) => h.midi === L[i].midi ? null : nom(L[i].midi) + '→' + nom(h.midi) + '@' + (L[i].t / (MES / 16)).toFixed(1)).filter(Boolean);
      /* le croisement : les notes propres aux AUTRES phrases (heure + hauteur absentes de celle-ci), écoutées ici : la hauteur entendue ne doit PAS être la leur */
      const cles = new Set(L.map(cle)), etr = []; for (let h = 0; h < NPH; h++) if (h !== q) for (const x of parPh[h]) if (!cles.has(cle(x)) && !etr.some(y => cle(y) === cle(x))) etr.push(x);
      const med = hf.map(h => h.dbNote).sort((x, y) => x - y)[hf.length >> 1], etrOui = etr.filter(n => { const h = hauteur(sf, inst, q * PH + n.t, n, lo, hi); return h.midi === n.midi && h.dbNote > med - 12; }).length;
      /* LE FIGÉ CONTRE LE DIRECT, note par note : la même hauteur entendue, et le même niveau à la hauteur du journal (à 3 dB près) */
      const memes = hf.filter((h, i) => h.midi === hd[i].midi).length, dn = hf.map((h, i) => Math.abs(h.dbNote - hd[i].dbNote)), niv = dn.filter(d => d <= 3).length, dmed = dn.slice().sort((x, y) => x - y)[dn.length >> 1], dmax = Math.max(...dn);
      lignes.push({ phrase: q + 1, motif: sign[q], notes: L.length, justesDirect: okd, justesFige: okf, memeHauteurFigeDirect: memes, memeNiveauFigeDirect: niv, ecartNiveauMedianDb: +dmed.toFixed(2), ecartNiveauMaxDb: +dmax.toFixed(2), ecarts: faux, etrangeres: etr.length, etrangeresEntendues: etrOui, journal: L.map(n => nom(n.midi)).join(' '), fige: hf.map(h => nom(h.midi)).join(' ') });
      console.log('  phrase ' + (q + 1) + ' [' + sign[q] + '] : ' + L.length + ' notes ; hauteur juste : direct ' + okd + '/' + L.length + ', figé ' + okf + '/' + L.length + ' ; FIGÉ = DIRECT : même hauteur ' + memes + '/' + L.length + ', même niveau de la note (±3 dB) ' + niv + '/' + L.length + ' (écart médian ' + dmed.toFixed(2) + ' dB, max ' + dmax.toFixed(1) + ')' + (faux.length ? ' (' + faux.slice(0, 8).join(', ') + (faux.length > 8 ? '…' : '') + ')' : '') + ' ; notes des autres phrases entendues ici : ' + etrOui + '/' + etr.length
        + (inst === 'sax' ? '\n      journal ' + L.map(n => nom(n.midi)).join(' ') + '\n      figé    ' + hf.map(h => nom(h.midi)).join(' ') : '')); }
    res.instruments[inst] = lignes; }
  sortie.paliers[p] = res; }
if (opt('json', null)) fs.writeFileSync(opt('json'), JSON.stringify(sortie, null, 1));
fs.rmSync(tmp, { recursive: true, force: true });
