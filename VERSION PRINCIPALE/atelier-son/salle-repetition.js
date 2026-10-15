// salle-repetition.js — LA SALLE DE RÉPÉTITION (14/10, Léo : « c'est moins bien qu'avant le générateur : prends le temps d'apprendre tes
// nouveaux instruments et effets, révise dans une salle de musique avec un public imaginaire réaliste »).
//
// On fait JOUER des musiques (muettes) et on les ÉCOUTE avec des mesures, image par image (FFT 4096, toutes les 120 ms) :
//   · sonie (RMS dB) et sa MONTÉE du 1er au 30e moteur · crête / RMS (la dynamique) ;
//   · l'équilibre en 6 bandes : sous-grave < 60 Hz · grave 60-250 · BOUE 250-500 · médium 500-2 k · présence 2-6 k · air > 6 k ;
//   · la brillance (centroïde) · la RUGOSITÉ (Plomp-Levelt sur les 24 pics les plus forts entre 80 Hz et 5 kHz : deux notes trop proches
//     battent — les fausses notes, les timbres qui frottent, les accords trop serrés) · la DENSITÉ (pics nets) · le MOUVEMENT (flux).
// Puis un PUBLIC IMAGINAIRE note chaque musique sur 10, chacun avec ses oreilles :
//   · LÉO (ses goûts) : proche du profil de SES 👍 (équilibre, brillance, rugosité, montée) ;
//   · LE JOUEUR : ça monte clairement avec les moteurs, ça ne fatigue pas (présence/air), le volume ne saute pas ;
//   · LE MUSICIEN : peu de rugosité, peu de boue, une densité lisible ;
//   · L'INGÉ SON : l'équilibre spectral d'un vrai mix (celui des morceaux figés qu'il aime), une dynamique vivante (pas écrasée).
// Les morceaux de référence (fichiers) se mesurent hors temps réel, image par image, avec la même FFT.
//
// Utilisation (depuis bibliotheque.html, servie) :
//   const S = await import('/atelier-son/salle-repetition.js');
//   const r = await S.joue({ fichier: 'assets/audio/music/direct/musique-trente.js', n: 4821, W, duree: … });  // une musique du générateur
//   const f = await S.fichier(url);                                                                            // un fichier de référence
//   S.public(mesures, profil)                                                                                 // les quatre notes

const BANDES = [[20, 60], [60, 250], [250, 500], [500, 2000], [2000, 6000], [6000, 16000]], NOMS_B = ['sous', 'grave', 'boue', 'medium', 'presence', 'air'];
const N = 4096;

// la rugosité de Plomp-Levelt (Sethares) entre deux partiels
function pl(f1, a1, f2, a2) { const fm = Math.min(f1, f2), s = .24 / (.021 * fm + 19), d = Math.abs(f2 - f1); return a1 * a2 * (Math.exp(-3.5 * s * d) - Math.exp(-5.75 * s * d)); }

// UNE IMAGE : spectre en dB (Float32Array, N/2 cases) + RMS du signal → les mesures de l'image
function image(spDb, sr, rmsLin, pkLin) {
  const bin = sr / N, P = new Float64Array(spDb.length); let tot = 0;
  for (let i = 1; i < spDb.length; i++) { P[i] = Math.pow(10, spDb[i] / 10); tot += P[i]; }
  const bandes = BANDES.map(([a, b]) => { let e = 0; for (let i = Math.max(1, Math.floor(a / bin)); i < Math.min(P.length, Math.ceil(b / bin)); i++) e += P[i]; return e; });
  let cn = 0; for (let i = 1; i < P.length; i++) cn += P[i] * i * bin; const centre = tot > 0 ? cn / tot : 0;
  // les pics nets (maxima locaux à +9 dB au-dessus de leurs voisins à ±6 cases), entre 80 Hz et 5 kHz
  const pics = []; const i0 = Math.floor(80 / bin), i1 = Math.min(spDb.length - 7, Math.ceil(5000 / bin));
  for (let i = i0; i < i1; i++) { const v = spDb[i]; if (v > spDb[i - 1] && v >= spDb[i + 1] && v > -90) { const voisin = Math.max(spDb[i - 6], spDb[i + 6]); if (v - voisin > 9) pics.push([i * bin, Math.pow(10, v / 20)]); } }
  pics.sort((a, b) => b[1] - a[1]); const top = pics.slice(0, 24); let r = 0, a2 = 0;
  for (let j = 0; j < top.length; j++) { a2 += top[j][1] * top[j][1]; for (let k = j + 1; k < top.length; k++) r += pl(top[j][0], top[j][1], top[k][0], top[k][1]); }
  return { rms: 20 * Math.log10(rmsLin + 1e-9), pk: pkLin, tot, bandes, centre, rug: a2 > 0 ? r / a2 : 0, densite: pics.length };
}
function resume(img, tiers) {   // les images d'une musique → ses mesures
  const ok = img.filter(x => x.rms > -60); if (!ok.length) return null;
  const moy = f => ok.reduce((p, x) => p + f(x), 0) / ok.length;
  const totB = NOMS_B.map((_, b) => ok.reduce((p, x) => p + x.bandes[b], 0)), S9 = totB.reduce((p, q) => p + q, 0);
  const parts = {}; NOMS_B.forEach((nom, b) => parts[nom] = +(100 * totB[b] / S9).toFixed(1));
  let flux = 0; for (let i = 1; i < ok.length; i++) flux += Math.abs(ok[i].rms - ok[i - 1].rms) + Math.abs(ok[i].centre - ok[i - 1].centre) / 200; flux /= Math.max(1, ok.length - 1);
  const rmsL = ok.map(x => Math.pow(10, x.rms / 20)), rmsG = 20 * Math.log10(Math.sqrt(rmsL.reduce((p, q) => p + q * q, 0) / rmsL.length)), pkG = Math.max(...ok.map(x => x.pk));
  const m = { sonie: +rmsG.toFixed(1), crete: +(20 * Math.log10(pkG + 1e-9) - rmsG).toFixed(1), bandes: parts, centre: Math.round(moy(x => x.centre)), rugosite: +moy(x => x.rug).toFixed(4),
    densite: +moy(x => x.densite).toFixed(1), mouvement: +flux.toFixed(2), images: ok.length };
  if (tiers) {   // la montée : sonie et brillance par tranche de moteurs
    const tr = (a, b) => { const L = ok.filter(x => x.tier >= a && x.tier <= b); return L.length ? { rms: 20 * Math.log10(Math.sqrt(L.reduce((p, x) => p + Math.pow(10, x.rms / 10), 0) / L.length)), c: L.reduce((p, x) => p + x.centre, 0) / L.length, d: L.reduce((p, x) => p + x.densite, 0) / L.length } : null; };
    const deb = tr(1, 4), mil = tr(12, 18), fin = tr(25, 30);
    m.parTier = {}; [...new Set(ok.map(x => x.tier))].forEach(k => { const q = tr(k, k); if (q) m.parTier[k] = [+q.rms.toFixed(1), Math.round(q.c), +q.d.toFixed(1)]; });   // (v6.0) moteur par moteur : sonie, brillance, densité
    if (deb && fin) m.montee = { sonie: +(fin.rms - deb.rms).toFixed(1), brillance: Math.round(fin.c - deb.c), densite: +(fin.d - deb.d).toFixed(1), milieu: mil ? +(mil.rms - deb.rms).toFixed(1) : null };
  }
  return m; }

// JOUER une musique du générateur (muette) et la mesurer
export async function joue({ fichier, n, W, da, moteurs = [[1, 6], [2, 1.2], [4, 1.2], [6, 1.2], [8, 4], [10, 1.2], [12, 1.2], [14, 4], [16, 1.2], [18, 1.2], [20, 1.2], [22, 4], [24, 1.2], [26, 1.2], [28, 4], [30, 5]], ctx } = {}) {
  const mod = await import(new URL(fichier + (fichier.includes('?') ? '&' : '?') + 't=' + Date.now(), location.href).href);
  const ac = ctx || new AudioContext(), an = ac.createAnalyser(), mu = ac.createGain(); an.fftSize = N; an.smoothingTimeConstant = 0; mu.gain.value = 0; an.connect(mu); mu.connect(ac.destination);
  const m = mod.createTrenteMusic(Object.assign({ audioContext: ac, destination: an, renouvelle: 0 }, da ? { da } : {})); m.setTier(1, 30); m.start(n, W || undefined);
  const dort = ms => new Promise(r => setTimeout(r, ms)); let w = 0; while (!m.tirage && w++ < 150) await dort(200);
  if (!m.tirage) { ac.close(); return null; }
  const T = m.tirage, img = [], sp = new Float32Array(N / 2), td = new Float32Array(N); let tier = 1;
  const it = setInterval(() => { an.getFloatFrequencyData(sp); an.getFloatTimeDomainData(td); let e = 0, pk = 0; for (const x of td) { e += x * x; if (Math.abs(x) > pk) pk = Math.abs(x); }
    const x = image(sp, ac.sampleRate, Math.sqrt(e / td.length), pk); x.tier = tier; img.push(x); }, 120);
  for (const [t9, s] of moteurs) { tier = t9; m.setTier(t9, 30); await dort(s * 1000); }
  clearInterval(it); const res = resume(img, true); res.titre = T.titre; res.style = T.styleId || T.style; res.n = n; res.version = fichier.split('/').pop();
  res.univers = T.univers || ''; res.vrais = (T.vrais || []).join(', '); try { res.voix = Object.assign({}, m._voix); res.styleNom = T.style; } catch (e) {}
  m.stop(); await dort(250); if (!ctx) ac.close(); return res; }

// MESURER un fichier (référence) hors temps réel, image par image
export async function fichier(url, ctx) {
  const ac = ctx || new AudioContext(), b = await fetch(url).then(r => r.arrayBuffer()).then(a => ac.decodeAudioData(a)); if (!ctx) ac.close();
  const sr = b.sampleRate, L = b.getChannelData(0), R = b.numberOfChannels > 1 ? b.getChannelData(1) : L, pas = Math.round(sr * .12), img = [];
  const re = new Float64Array(N), im = new Float64Array(N), win = new Float64Array(N); for (let i = 0; i < N; i++) win[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1));
  for (let s = 0; s + N < L.length; s += pas) {
    let e = 0, pk = 0; for (let i = 0; i < N; i++) { const x = (L[s + i] + R[s + i]) / 2; re[i] = x * win[i]; im[i] = 0; e += x * x; if (Math.abs(x) > pk) pk = Math.abs(x); }
    fft(re, im); const sp = new Float32Array(N / 2); for (let i = 0; i < N / 2; i++) { const p = (re[i] * re[i] + im[i] * im[i]) / (N * N / 4); sp[i] = 10 * Math.log10(p + 1e-14); }
    img.push(image(sp, sr, Math.sqrt(e / N), pk)); }
  const res = resume(img, false); res.titre = url.split('/').slice(-2).join('/'); return res; }
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
      re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }

// LE PROFIL d'un groupe (moyenne de ses mesures) — ex. ses 👍 du générateur, ses morceaux figés aimés
export function profil(L) { L = L.filter(Boolean); const moy = f => L.reduce((p, x) => p + f(x), 0) / L.length, P = { n: L.length, bandes: {} };
  ['sonie', 'crete', 'centre', 'rugosite', 'densite', 'mouvement'].forEach(k => P[k] = +moy(x => x[k]).toFixed(4)); NOMS_B.forEach(b => P.bandes[b] = +moy(x => x.bandes[b]).toFixed(1));
  const M = L.filter(x => x.montee); if (M.length) P.montee = { sonie: +(M.reduce((p, x) => p + x.montee.sonie, 0) / M.length).toFixed(1), brillance: Math.round(M.reduce((p, x) => p + x.montee.brillance, 0) / M.length) };
  return P; }

// LE PUBLIC IMAGINAIRE : quatre oreilles, une note sur 10 chacune (et la raison principale)
export function publicJuge(m, goutsP, mixP) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)), notes = {}, raisons = {};
  const ecartBandes = P => NOMS_B.reduce((p, b) => p + Math.abs(m.bandes[b] - P.bandes[b]), 0);   // en points de %
  // LÉO : proche de ses 👍 (bandes, brillance, rugosité, montée)
  { const eb = ecartBandes(goutsP), ec = Math.abs(m.centre - goutsP.centre) / goutsP.centre, er = Math.max(0, m.rugosite - goutsP.rugosite) / (goutsP.rugosite + 1e-4), em = m.montee && goutsP.montee ? Math.abs(m.montee.sonie - goutsP.montee.sonie) : 0;
    notes.leo = +cl(10 - eb * .12 - ec * 6 - er * 3 - em * .4, 0, 10).toFixed(1); raisons.leo = [['équilibre', eb * .12], ['brillance', ec * 6], ['rugosité', er * 3], ['montée', em * .4]].sort((a, b) => b[1] - a[1])[0][0]; }
  // LE JOUEUR : ça MONTE avec les moteurs (ses 👍 : +19 dB du début à la fin — moins de +10 dB, ça plafonne), ça ne fatigue pas (présence + air < 22 %)
  { const mo = m.montee ? m.montee.sonie : 0, fat = Math.max(0, m.bandes.presence + m.bandes.air - 22);
    notes.joueur = +cl(10 - Math.max(0, 12 - mo) * .6 - fat * .35, 0, 10).toFixed(1); raisons.joueur = mo < 12 ? 'ça ne monte pas assez' : fat > 0 ? 'ça fatigue (aigus)' : 'bien'; }
  // LE MUSICIEN : rugosité, boue, densité lisible
  { const ru = m.rugosite / (goutsP.rugosite + 1e-4), bo = Math.max(0, m.bandes.boue - goutsP.bandes.boue), de = Math.max(0, m.densite - goutsP.densite * 1.3);
    notes.musicien = +cl(10 - Math.max(0, ru - 1) * 4 - bo * .5 - de * .25, 0, 10).toFixed(1); raisons.musicien = ru > 1.2 ? 'ça frotte' : bo > 2 ? 'boueux' : de > 2 ? 'trop chargé' : 'bien'; }
  // L'INGÉ SON : l'équilibre d'un vrai mix (ses morceaux figés), la dynamique (crête/RMS 9-15 dB)
  { const eb = ecartBandes(mixP), cr = m.crete < 8 ? 8 - m.crete : m.crete > 17 ? m.crete - 17 : 0;
    notes.inge = +cl(10 - eb * .1 - cr * .6, 0, 10).toFixed(1); raisons.inge = cr > 1 ? (m.crete < 8 ? 'écrasé' : 'trop de crêtes') : 'équilibre'; }
  notes.moyenne = +((notes.leo + notes.joueur + notes.musicien + notes.inge) / 4).toFixed(1);
  return { notes, raisons }; }
