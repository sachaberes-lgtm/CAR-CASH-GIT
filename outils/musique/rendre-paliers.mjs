#!/usr/bin/env node
/* LA CHAÎNE DE RENDU DE LA MUSIQUE DE COURSE FIGÉE (2026-11-09, étape 2) — rend HORS LIGNE les paliers des 10 morceaux de la course téléphone.
   Chrome sans fenêtre + les fonctions du JEU (palLitMorceau, palRendPalier : OfflineAudioContext, graine fixe, élan, couture), le texte PATCHÉ par RYTHMIQUE pour asphalte et aura ;
   chaque palier → .f32 → boucle AAC sans couture (boucle_aac_pur.py : liste d'édition, durée exacte) → assets/audio/music/course/<id>/p<k>.m4a + index.json ; puis course/index.js.
   usage : node outils/musique/rendre-paliers.mjs [--ids bleu-4830,pal-aura-30] [--force] [--kbps 96] [--sortie <dossier>] [--det] [--variantes]
   UN banc à la fois : sh ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. Reprend là où il s'est arrêté (un morceau déjà rendu est sauté sans --force). */
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import cp from 'node:child_process'; import os from 'node:os';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), ICI = path.dirname(fileURLToPath(import.meta.url)), DEPOT = path.resolve(ICI, '../..'), JEU = path.join(DEPOT, 'VERSION PRINCIPALE');
const { lanceChrome, tueChrome, CDP, portLibre, dormir } = require('../banc-trainees/cdp.cjs');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; }, flag = k => a.includes('--' + k);
const D = 'assets/audio/music/', SORTIE = path.resolve(opt('sortie', path.join(JEU, D, 'course'))), KBPS = +opt('kbps', 96), FORCE = flag('force');
/* les 10 de la course téléphone (choix d'OPTI ULTIME) : id du tirage, page « tout », palier de départ du morceau (PBJ_DEPART_PAR_MORCEAU, 6 par défaut), nombre de mesures de la boucle rendue */
const MORCEAUX = [
  { id: 'bleu-4830', f: 'flamme-de-tonnerre', depart: 1 }, { id: 'pal-asphalte', f: 'asphalte-emeraude', depart: 6 }, { id: 'bleu-7299', f: 'enseigne-de-jade', depart: 1 },
  { id: 'bleu-9664', f: 'mirage', depart: 1 }, { id: 'bleu-8338', f: 'rubis-ultra', depart: 1 }, { id: 'bleu-6562', f: 'pluie-d-argent', depart: 1 },
  { id: 'bleu-1275', f: 'feu-de-luxe', depart: 1 }, { id: 'bleu-2221', f: 'cobra-ultra', depart: 1 }, { id: 'bleu-6104', f: 'tonnerre-deluxe', depart: 1 },
  { id: 'pal-aura-30', f: 'aura-30', depart: 6, mesures: 16 },   /* aura : sa variante B une phrase sur deux → la boucle entière = 2 phrases (16 mesures), plus son intro */
  /* (2026-11-15, lot MUSIQUE3, Sacha : « on les retire pas du tirage, cherche des solutions ») NÉNUPHARS VELOURS, au tirage de Léo (favoris.json) et resté en direct sur le téléphone.
     Ses 30 PALIERS, un fichier chacun (nb: 30) : le jeu lui demande le palier m, il joue le palier m — exactement ce que faisait la page en direct (pas de regroupement par 3). */
  /* (2026-11-15, tour 2, Sacha : « fige le ») LE CYCLE ENTIER. Le thème du saxo, la basse, l'arpège et les congas tournent sur 4 phrases (A, B, A orné, B à l'octave) : 32 mesures, pas 8.
     `mesures: 32` = le cycle rendu ; `segMesures: 4` = chaque palier est coupé en 8 fichiers de 4 mesures (10 s) enchaînés à l'échantillon près par le lecteur (joueurSegments de pouce-bleu-jeu.js),
     qui ne garde décodés que le segment joué, le suivant et ceux des paliers voisins ; `sr: 48000` = la cadence du contexte du jeu (graphe-audio.js) : aucun rééchantillonnage au décodage. */
  { id: 'bleu-9551', f: 'nenuphars-velours', depart: 1, nb: 30, direct: true, mesures: 32, segMesures: 4, sr: 48000 } ];   /* direct : rendu mené comme la page en direct (son hasard, sa salle) — voir rendDirect dans rendu.html */
const NB0 = 10;   /* par défaut 10 fichiers, 3 moteurs chacun ; `nb: 30` = un fichier par palier */
const pbjTier = (m, mn) => m <= 1 ? mn : Math.round(mn + (Math.min(30, m) - 1) * (30 - mn) / 29);   /* = musique.js */
const groupesDe = nb => nb === 30 ? Array(30).fill(1) : Array(nb).fill(3);
const paliersDe = (mn, nb) => nb === 30 ? groupesDe(30).map((_, g) => pbjTier(g + 1, mn)) : groupesDe(nb).map((_, g) => pbjTier(g === 0 ? 1 : g === nb - 1 ? 30 : 3 * g + 2, mn));   /* le moteur représentatif de chaque groupe : le 1er = le départ, le dernier = le 30 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rendu-musique-'));
const srv = http.createServer((rq, rs) => {
  const u = new URL(rq.url, 'http://x'); if (rq.method === 'POST' && u.pathname === '/__sauve') { const ch = []; rq.on('data', c => ch.push(c)); rq.on('end', () => { fs.writeFileSync(path.join(tmp, u.searchParams.get('f') + '.f32'), Buffer.concat(ch)); rs.writeHead(200); rs.end('ok'); }); return; }
  let p = decodeURIComponent(u.pathname); if (p.startsWith('/__out/')) { const f = path.join(SORTIE, p.slice(7)); if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': 'application/octet-stream' }); return rs.end(fs.readFileSync(f)); }
  if (p.startsWith('/__tmp/')) { const f = path.join(tmp, p.slice(7)); if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': 'application/octet-stream' }); return rs.end(fs.readFileSync(f)); }
  if (p === '/__rendu.html') { rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return rs.end(fs.readFileSync(path.join(ICI, 'rendu.html'))); }
  const f = path.join(JEU, p); if (!f.startsWith(JEU)) { rs.writeHead(403); return rs.end(); }
  fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
    rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
});
const PORT_H = +opt('http', 9741), PORT_C = +opt('cdp', 9742);
for (const p of [PORT_H, PORT_C]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
await new Promise(ok => srv.listen(PORT_H, '127.0.0.1', ok));
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'rendu-chrome-')); const { ch, pg } = await lanceChrome(PORT_C, prof, 800, 600);
const fin = () => { try { tueChrome(ch); } catch (e) {} try { srv.close(); } catch (e) {} try { fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; await c.send('Page.enable');
/* (tour 2) le domaine Network de CDP n'est PAS ouvert pour un morceau en segments : avec lui, l'envoi d'un cycle brut (30 Mo) au serveur de l'outil ne rendait jamais la main (le serveur répond déjà « no-store ») */
if (!MORCEAUX.some(M => M.segMesures && (!opt('ids', '') || opt('ids', '').split(',').includes(M.id)))) { await c.send('Network.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true }); }
await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_H}/__rendu.html` });
for (let i = 0; i < 60; i++) { await dormir(500); try { if (await c.ev('!!window.pret')) break; } catch (e) {} }
const ids = opt('ids', '').split(',').filter(Boolean), rapport = {};
const lit = f => new Float32Array(fs.readFileSync(f).buffer.slice(0));
function afValides(f) { const s = cp.execSync(`afinfo "${f}"`).toString(); const m = /audio (\d+) valid frames/.exec(s); return m ? +m[1] : null; }
/* ---------------------------------------------------------------- (tour 2) LE MORCEAU EN SEGMENTS : un cycle entier par palier, coupé en fichiers de `segMesures` mesures */
const DEBORD = 8128;
/* un segment [deb, deb+len[ du cycle, encodé AVEC son contexte cyclique (la fin du segment d'avant devant, le début du suivant derrière : le codeur voit la musique continue, chaque
   couture entre deux fichiers vaut une couture du milieu) ; puis iTunSMPB réécrit : amorce = 2112 + débord, durée = len exactement. Même mécanisme que boucle_aac_pur.py (lu par CoreAudio/WebKit et Chrome). */
function encodeSegment(L, R, deb, len, sortie, kbps, sr) {
  const N = L.length, n = len + 2 * DEBORD, w = Buffer.alloc(44 + n * 4), q = v => v >= 1 ? 32767 : v <= -1 ? -32767 : Math.trunc(v * 32767);
  w.write('RIFF', 0); w.writeUInt32LE(36 + n * 4, 4); w.write('WAVEfmt ', 8); w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(2, 22); w.writeUInt32LE(sr, 24); w.writeUInt32LE(sr * 4, 28); w.writeUInt16LE(4, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { const k = (((deb - DEBORD + i) % N) + N) % N; w.writeInt16LE(q(L[k]), 44 + 4 * i); w.writeInt16LE(q(R[k]), 46 + 4 * i); }
  const wav = path.join(tmp, 'seg.wav'), m4a = path.join(tmp, 'seg.m4a'); fs.writeFileSync(wav, w);
  cp.execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', String(kbps * 1000), '-q', '127', wav, m4a]);
  const b = fs.readFileSync(m4a), i = b.indexOf('iTunSMPB'); if (i < 0) throw new Error('pas de iTunSMPB'); const j = b.indexOf(' 00000000 ', i), ch = b.subarray(j, j + 90).toString('latin1').trim().split(/\s+/);
  const amorce = parseInt(ch[1], 16), reste = parseInt(ch[2], 16), valides = parseInt(ch[3], 16), total = amorce + valides + reste, na = amorce + DEBORD, nr = total - na - len; if (nr < 0) throw new Error('reste négatif');
  const hx = (v, k) => v.toString(16).toUpperCase().padStart(k, '0'); Buffer.from(' 00000000 ' + hx(na, 8) + ' ' + hx(nr, 8) + ' ' + hx(len, 16), 'latin1').copy(b, j); fs.writeFileSync(sortie, b);
  return { amorce: na, reste: nr };
}
function litWav(f) { const b = fs.readFileSync(f); let o = 12; while (o < b.length - 8) { const id = b.toString('latin1', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(b.buffer.slice(b.byteOffset + o + 8, b.byteOffset + o + 8 + Math.min(n, b.length - o - 8))); o += 8 + n + (n & 1); } throw new Error('wav sans data'); }
async function rendSegments(M, dos) {
  const paliers = opt('seulement', null) ? opt('seulement').split(',').map(Number) : paliersDe(M.depart, M.nb), NB = paliers.length, sr = M.sr,   /* --seulement 3,16 : un essai sur quelques paliers (avec --sortie ailleurs) */
    KB = KBPS, TRAVAIL = path.resolve(opt('travail', tmp)); fs.mkdirSync(TRAVAIL, { recursive: true });
  const verrou = setInterval(() => { try { const q = '/private/tmp/cashcar-banc.lock/qui', t = fs.readFileSync(q, 'utf8').trim().split(' '); if (/musique3/.test(t.slice(2).join(' '))) fs.writeFileSync(q, t[0] + ' ' + Math.floor(Date.now() / 1000) + ' ' + t.slice(2).join(' ') + '\n'); } catch (e) {} }, 120000);   /* un verrou de plus de 15 min est repris par les autres : on le tient à jour pendant le long rendu */
  const t0 = Date.now(), ST = [];
  /* 1. le rendu des cycles (deux rendus égaux par palier), gardés en .f32 dans le dossier de travail : repris là où il s'est arrêté */
  /* (les rendus se font sur les fils audio de Chrome, pas sur celui de la page : `--ensemble 3` paliers à la fois, chacun ses deux rendus de contrôle) */
  const rendUn = async p => { const brut = path.join(TRAVAIL, M.id + '-p' + p + '.f32'), js = brut + '.json';
    if (!flag('refaire') && fs.existsSync(js) && fs.existsSync(brut)) return JSON.parse(fs.readFileSync(js, 'utf8'));
    const spec = { id: M.id, fichier: D + 'direct/' + M.f + '.html', mesures: M.mesures, paliers: [p], direct: true, sr };
    const R = await c.ev(`window.rendre(${JSON.stringify(spec)})`, 40 * 60 * 1000); fs.copyFileSync(path.join(tmp, M.id + '-p' + p + '.f32'), brut); fs.rmSync(path.join(tmp, M.id + '-p' + p + '.f32'));
    const st = Object.assign({ N: R.N, titre: R.titre, style: R.style, ton: R.ton, bpm: R.bpm, mesures: R.mesures, graine: R.graine, essais: R.essais[p] }, R.paliers[0]); fs.writeFileSync(js, JSON.stringify(st));
    console.log('  rendu p%d : %d s, %d essais, pic %s, rms %s dB, couture %s', p, Math.round(st.ms / 1000), st.essais, st.pic.toFixed(3), st.rmsDb.toFixed(1), st.couture.toFixed(2)); return st; };
  { let suivant = 0; const fil = async () => { while (suivant < paliers.length) { const i = suivant++; ST[i] = await rendUn(paliers[i]); } }; await Promise.all(Array.from({ length: Math.max(1, +opt('ensemble', 3)) }, fil)); }
  /* (outil de fidélité) `--sans "3:basse 8:sax+sax2"` : le cycle du palier rendu SANS ces instruments → <id>-p<p>-sans-<nom>.f32 dans le dossier de travail (fidelite-notes.mjs en tire l'instrument seul par soustraction) */
  if (opt('sans', null)) { const L = opt('sans').split(/\s+/).filter(Boolean).map(x => x.split(':')); let suivant = 0;
    const un = async ([p, g]) => { const suf = '-sans-' + g.split('+')[0], brut = path.join(TRAVAIL, M.id + '-p' + p + suf + '.f32'); if (fs.existsSync(brut)) return;
      const spec = { id: M.id, fichier: D + 'direct/' + M.f + '.html', mesures: M.mesures, paliers: [+p], direct: true, sr, sans: g.split('+'), suffixe: suf };
      const R = await c.ev(`window.rendre(${JSON.stringify(spec)})`, 40 * 60 * 1000); fs.copyFileSync(path.join(tmp, M.id + '-p' + p + suf + '.f32'), brut); fs.rmSync(path.join(tmp, M.id + '-p' + p + suf + '.f32')); console.log('  rendu p%s sans %s : %d s, %d essais', p, g, Math.round(R.paliers[0].ms / 1000), R.essais[p]); };
    const fil = async () => { while (suivant < L.length) await un(L[suivant++]); }; await Promise.all(Array.from({ length: Math.max(1, +opt('ensemble', 3)) }, fil)); }
  if (flag('rendu-seul')) { clearInterval(verrou); return null; }
  const N = ST[0].N, NS = M.mesures / M.segMesures, SEG = N / NS; if (!Number.isInteger(SEG)) throw new Error('segment non entier : ' + SEG);
  const pic = Math.max(...ST.map(x => x.pic)), echelle = pic > 0.944 ? 0.944 / pic : 1;
  /* 2. l'encodage : un fichier par segment ; deux segments du même palier ÉGAUX au demi-pas de quantification près (16 bits, la résolution donnée au codeur), contexte compris, ne font qu'un fichier */
  for (const x of fs.readdirSync(dos)) if (/\.m4a$/.test(x)) fs.rmSync(path.join(dos, x));
  const fichiers = [], seg = [], amorces = new Set(), verifs = [], egaux = []; let pireApple = 999, pireBord = 999, pireChrome = 999, pireBordChrome = 999, exact = true;
  for (let k = 0; k < NB; k++) { const p = paliers[k], F = lit(path.join(TRAVAIL, M.id + '-p' + p + '.f32')); if (echelle < 1) for (let i = 0; i < F.length; i++) F[i] *= echelle; const L = F.subarray(0, N), R = F.subarray(N); const ligne = [];
    fs.copyFileSync(path.join(TRAVAIL, M.id + '-p' + p + '.f32'), path.join(tmp, M.id + '-p' + p + '.f32'));
    for (let j = 0; j < NS; j++) { let meme = -1, ecMin = 9;
      for (let j2 = 0; j2 < j && meme < 0; j2++) { let mx = 0; const d = (j - j2) * SEG; for (let i = -DEBORD; i < SEG + DEBORD && mx <= 1 / 65536; i++) { const a = (((j * SEG + i) % N) + N) % N, b = (((a - d) % N) + N) % N, e1 = Math.abs(L[a] - L[b]), e2 = Math.abs(R[a] - R[b]); if (e1 > mx) mx = e1; if (e2 > mx) mx = e2; } if (mx <= 1 / 65536) { meme = j2; ecMin = mx; } }
      if (meme >= 0) { ligne.push(ligne[meme]); egaux.push({ p, seg: j, comme: meme, ecartMax: +ecMin.toExponential(2) }); continue; }
      const nom = 'p' + (k + 1) + '-' + (j + 1) + '.m4a', sortie = path.join(dos, nom), enc = encodeSegment(L, R, j * SEG, SEG, sortie, KB, sr); amorces.add(enc.amorce);
      /* le décodeur d'APPLE (celui du téléphone) : longueur exacte, SNR, SNR aux deux bords */
      const wav = path.join(tmp, 'dec.wav'); cp.execFileSync('afconvert', [sortie, '-f', 'WAVE', '-d', 'LEI16', wav]); const dec = litWav(wav), nd = dec.length / 2;
      const snr = (a0, a1) => { let e = 0, x = 0; for (let i = a0; i < a1 && i < nd; i++) { const u = L[j * SEG + i], v = dec[2 * i] / 32767, u2 = R[j * SEG + i], v2 = dec[2 * i + 1] / 32767; e += (u - v) * (u - v) + (u2 - v2) * (u2 - v2); x += u * u + u2 * u2; } return 10 * Math.log10((x + 1e-18) / (e + 1e-18)); };
      const va = { n: nd, snr: +snr(0, SEG).toFixed(1), deb: +snr(0, 4096).toFixed(1), fin: +snr(SEG - 4096, SEG).toFixed(1) };
      const vc = await c.ev(`window.verifierSegment(${JSON.stringify('__out/' + M.id + '/' + nom)}, ${JSON.stringify(M.id + '-p' + p)}, ${j * SEG}, ${SEG}, ${echelle}, ${sr})`, 120000);
      if (nd !== SEG || !vc.exacte) exact = false; pireApple = Math.min(pireApple, va.snr); pireBord = Math.min(pireBord, va.deb, va.fin); pireChrome = Math.min(pireChrome, vc.snrDb); pireBordChrome = Math.min(pireBordChrome, vc.snrDebutDb, vc.snrFinDb);
      verifs.push({ p, seg: j, apple: va, chrome: vc }); ligne.push(fichiers.length); fichiers.push('assets/audio/music/course/' + M.id + '/' + nom); }
    fs.rmSync(path.join(tmp, M.id + '-p' + p + '.f32')); seg.push(ligne); console.log('  encodé p%d : %d fichiers neufs', p, new Set(ligne).size); }
  clearInterval(verrou);
  const octets = fs.readdirSync(dos).filter(f => f.endsWith('.m4a')).reduce((s, f) => s + fs.statSync(path.join(dos, f)).size, 0), S0 = ST[0];
  const fiche = { id: M.id, titre: S0.titre, style: S0.style, ton: S0.ton, bpm: S0.bpm, mesures: M.mesures, introMesures: 0, intro: null, depart: M.depart, moteurs: groupesDe(NB), paliers, segments: NS, segMesures: M.segMesures, segN: SEG, seg, fichiers, gains: paliers.map(() => +(1 / echelle).toFixed(4)), sr, N, amorce: [...amorces], boucleS: +(N / sr).toFixed(3), kbps: KB, patch: false, direct: true, graine: S0.graine, octets };
  fs.writeFileSync(path.join(dos, 'index.json'), JSON.stringify(fiche, null, 1));
  rapport[M.id] = { fiche: Object.assign({}, fiche, { seg: undefined, fichiers: fichiers.length + ' fichiers' }), rms: ST.map(x => +x.rmsDb.toFixed(1)), pics: ST.map(x => +x.pic.toFixed(3)), couture: ST.map(x => +x.couture.toFixed(2)), ms: ST.map(x => x.ms), essais: Object.fromEntries(ST.map((x, i) => [paliers[i], x.essais])), N, segN: SEG, echelle: +echelle.toFixed(3), egaux, exact, snrAppleMinDb: pireApple, snrAppleBordMinDb: pireBord, snrChromeMinDb: pireChrome, snrChromeBordMinDb: pireBordChrome, verifs, secondes: Math.round((Date.now() - t0) / 1000) };
  console.log('  %s %d fichiers (%d segments dont %d égaux à un autre), %s Ko, segment = %d échantillons à %d Hz, longueurs %s, SNR Apple min %s dB (bords %s), Chrome min %s dB (bords %s)', exact ? '✔' : '⚠', fichiers.length, NB * NS, egaux.length, Math.round(octets / 1024), SEG, sr, exact ? 'EXACTES (Apple et Chrome)' : 'DIFFÉRENTES', pireApple, pireBord, pireChrome, pireBordChrome);
}
for (const M of MORCEAUX) {
  if (ids.length && !ids.includes(M.id)) continue;
  const dos = path.join(SORTIE, M.id); if (!FORCE && fs.existsSync(path.join(dos, 'index.json'))) { console.log('— déjà rendu :', M.id); continue; }
  if (M.segMesures) { fs.mkdirSync(dos, { recursive: true }); console.log('▶', M.id, M.f, 'en segments :', M.mesures, 'mesures,', M.segMesures, 'par fichier,', M.sr, 'Hz'); await rendSegments(M, dos); continue; }
  fs.mkdirSync(dos, { recursive: true }); const t0 = Date.now(), NB = M.nb || NB0, GROUPES = groupesDe(NB), paliers = paliersDe(M.depart, NB);
  console.log('▶', M.id, M.f, 'paliers', paliers.join(','));
  const spec = { id: M.id, fichier: D + 'direct/' + M.f + '.html', mesures: M.mesures || 0, paliers, det: flag('det') ? paliers[4] : 0, variantes: flag('variantes') ? [12, 30] : null, direct: !!M.direct };
  const R = await c.ev(`window.rendre(${JSON.stringify(spec)})`, 40 * 60 * 1000);
  const N = R.N, pics = R.paliers.map(x => x.pic), pic = Math.max(...pics, R.intro ? R.intro.pic : 0), echelle = pic > 0.944 ? 0.944 / pic : 1;   /* une seule échelle par morceau : l'équilibre composé ne bouge pas, `gains` la rend à la lecture */
  const fiches = [], valides = [], sauts = [];
  for (let k = 0; k < NB; k++) {
    const p = paliers[k], brut = path.join(tmp, M.id + '-p' + p + '.f32'); let F = lit(brut); if (echelle < 1) for (let i = 0; i < F.length; i++) F[i] *= echelle;
    const f32 = path.join(tmp, 'x.f32'); fs.writeFileSync(f32, Buffer.from(F.buffer)); const sortie = path.join(dos, 'p' + (k + 1) + '.m4a');
    const enc = JSON.parse(cp.execSync(`python3 "${path.join(ICI, 'boucle_aac_pur.py')}" "${f32}" ${N} "${sortie}" ${KBPS * 1000}`, { stdio: 'pipe' }).toString().trim().split('\n').pop()); sauts.push(enc.amorce); valides.push(afValides(sortie)); fiches.push('assets/audio/music/course/' + M.id + '/p' + (k + 1) + '.m4a');
  }
  let intro = null; if (R.intro) { const brut = lit(path.join(tmp, M.id + '-intro.f32')), Ni = R.intro.N; if (echelle < 1) for (let i = 0; i < brut.length; i++) brut[i] *= echelle;
    const sortie = path.join(dos, 'intro.m4a'); fs.writeFileSync(path.join(tmp, 'y.f32'), Buffer.from(brut.buffer)); cp.execSync(`python3 "${path.join(ICI, 'boucle_aac_pur.py')}" "${path.join(tmp, 'y.f32')}" ${Ni} "${sortie}" ${KBPS * 1000}`, { stdio: 'pipe' }); intro = 'assets/audio/music/course/' + M.id + '/intro.m4a'; }
  const verifs = []; for (let k = 0; k < NB; k++) { const f = path.join(dos, 'p' + (k + 1) + '.m4a'), wav = path.join(tmp, 'dec.wav'); cp.execSync(`afconvert "${f}" -f WAVE -d LEI16 "${wav}"`);
    const dur = /estimated duration: ([\d.]+) sec/.exec(cp.execSync(`afinfo "${wav}"`).toString()), apple = dur ? Math.round(+dur[1] * 44100) : null;
    const chrome = await c.ev(`window.verifierDecodage(${JSON.stringify('__out/' + M.id + '/p' + (k + 1) + '.m4a')}, ${JSON.stringify(M.id + '-p' + paliers[k])}, ${echelle})`, 120000);
    verifs.push({ p: paliers[k], apple, appleExact: apple === N, chrome }); }
  const octets = fs.readdirSync(dos).filter(f => f.endsWith('.m4a')).reduce((s, f) => s + fs.statSync(path.join(dos, f)).size, 0);
  const fiche = { id: M.id, titre: R.titre, style: R.style, ton: R.ton, bpm: R.bpm, mesures: R.mesures, introMesures: R.introMesures, intro, depart: M.depart, moteurs: GROUPES, paliers, fichiers: fiches, gains: paliers.map(() => +(1 / echelle).toFixed(4)), sr: 44100, N, sauts, boucleS: +(N / 44100).toFixed(3), kbps: KBPS, patch: R.patch, direct: R.direct || undefined, graine: R.graine || undefined, octets };
  fs.writeFileSync(path.join(dos, 'index.json'), JSON.stringify(fiche, null, 1));
  rapport[M.id] = { fiche, rms: R.paliers.map(x => +x.rmsDb.toFixed(1)), pics: pics.map(x => +x.toFixed(3)), couture: R.paliers.map(x => +x.couture.toFixed(2)), ms: R.paliers.map(x => x.ms), validesAAC: valides, N, determinisme: R.determinisme || null, verifs, variantes: R.variantes || null, essais: R.essais || null, echelle: +echelle.toFixed(3), secondes: Math.round((Date.now() - t0) / 1000) };
  const ok = valides.every(v => v === N) && verifs.every(v => v.appleExact && v.chrome.exacte); console.log('  %s %d fichiers, %s Ko, N=%d, afinfo %s, Apple %s, Chrome %s, SNR Chrome min %s dB (couture %s dB), rms %s', ok ? '✔' : '⚠', NB, Math.round(octets / 1024), N, [...new Set(valides)].join('/'), verifs.every(v => v.appleExact) ? 'EXACT' : 'DIFFÉRENT', verifs.every(v => v.chrome.exacte) ? 'EXACT' : 'DIFFÉRENT', Math.min(...verifs.map(v => v.chrome.snrDb)), Math.min(...verifs.map(v => Math.min(v.chrome.snrDebutDb, v.chrome.snrFinDb))), rapport[M.id].rms.join(' '));
}
/* l'index lu par le jeu : tous les morceaux rendus présents dans le dossier */
const tous = {}; for (const d of fs.existsSync(SORTIE) ? fs.readdirSync(SORTIE) : []) { const f = path.join(SORTIE, d, 'index.json'); if (fs.existsSync(f)) tous[d] = JSON.parse(fs.readFileSync(f, 'utf8')); }
fs.writeFileSync(path.join(SORTIE, 'index.js'), '/* LA MUSIQUE DE COURSE FIGÉE DU TÉLÉPHONE (écrit par outils/musique/rendre-paliers.mjs, ne pas éditer à la main) */\nwindow.PALIERS_COURSE=' + JSON.stringify(tous) + ';\n');
const rf = path.join(SORTIE, 'rapport.json'); let ancien = {}; try { ancien = JSON.parse(fs.readFileSync(rf, 'utf8')); } catch (e) {} fs.writeFileSync(rf, JSON.stringify(Object.assign(ancien, rapport), null, 1));
console.log('index.js :', Object.keys(tous).length, 'morceaux ; rapport.json écrit'); fin(); process.exit(0);
