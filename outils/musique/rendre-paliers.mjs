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
  { id: 'pal-aura-30', f: 'aura-30', depart: 6, mesures: 16 } ];   /* aura : sa variante B une phrase sur deux → la boucle entière = 2 phrases (16 mesures), plus son intro */
const NB = 10, GROUPES = Array(NB).fill(3);   /* 10 fichiers, 3 moteurs chacun */
const pbjTier = (m, mn) => m <= 1 ? mn : Math.round(mn + (Math.min(30, m) - 1) * (30 - mn) / 29);   /* = musique.js */
const paliersDe = mn => GROUPES.map((_, g) => pbjTier(g === 0 ? 1 : g === NB - 1 ? 30 : 3 * g + 2, mn));   /* le moteur représentatif de chaque groupe : le 1er = le départ, le dernier = le 30 */
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
const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; await c.send('Page.enable'); await c.send('Network.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_H}/__rendu.html` });
for (let i = 0; i < 60; i++) { await dormir(500); try { if (await c.ev('!!window.pret')) break; } catch (e) {} }
const ids = opt('ids', '').split(',').filter(Boolean), rapport = {};
const lit = f => new Float32Array(fs.readFileSync(f).buffer.slice(0));
function afValides(f) { const s = cp.execSync(`afinfo "${f}"`).toString(); const m = /audio (\d+) valid frames/.exec(s); return m ? +m[1] : null; }
for (const M of MORCEAUX) {
  if (ids.length && !ids.includes(M.id)) continue;
  const dos = path.join(SORTIE, M.id); if (!FORCE && fs.existsSync(path.join(dos, 'index.json'))) { console.log('— déjà rendu :', M.id); continue; }
  fs.mkdirSync(dos, { recursive: true }); const t0 = Date.now(), paliers = paliersDe(M.depart);
  console.log('▶', M.id, M.f, 'paliers', paliers.join(','));
  const spec = { id: M.id, fichier: D + 'direct/' + M.f + '.html', mesures: M.mesures || 0, paliers, det: flag('det') ? paliers[4] : 0, variantes: flag('variantes') ? [12, 30] : null };
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
  const fiche = { id: M.id, titre: R.titre, style: R.style, ton: R.ton, bpm: R.bpm, mesures: R.mesures, introMesures: R.introMesures, intro, depart: M.depart, moteurs: GROUPES, paliers, fichiers: fiches, gains: paliers.map(() => +(1 / echelle).toFixed(4)), sr: 44100, N, sauts, boucleS: +(N / 44100).toFixed(3), kbps: KBPS, patch: R.patch, octets };
  fs.writeFileSync(path.join(dos, 'index.json'), JSON.stringify(fiche, null, 1));
  rapport[M.id] = { fiche, rms: R.paliers.map(x => +x.rmsDb.toFixed(1)), pics: pics.map(x => +x.toFixed(3)), couture: R.paliers.map(x => +x.couture.toFixed(2)), ms: R.paliers.map(x => x.ms), validesAAC: valides, N, determinisme: R.determinisme || null, verifs, variantes: R.variantes || null, echelle: +echelle.toFixed(3), secondes: Math.round((Date.now() - t0) / 1000) };
  const ok = valides.every(v => v === N) && verifs.every(v => v.appleExact && v.chrome.exacte); console.log('  %s %d fichiers, %s Ko, N=%d, afinfo %s, Apple %s, Chrome %s, SNR Chrome min %s dB (couture %s dB), rms %s', ok ? '✔' : '⚠', NB, Math.round(octets / 1024), N, [...new Set(valides)].join('/'), verifs.every(v => v.appleExact) ? 'EXACT' : 'DIFFÉRENT', verifs.every(v => v.chrome.exacte) ? 'EXACT' : 'DIFFÉRENT', Math.min(...verifs.map(v => v.chrome.snrDb)), Math.min(...verifs.map(v => Math.min(v.chrome.snrDebutDb, v.chrome.snrFinDb))), rapport[M.id].rms.join(' '));
}
/* l'index lu par le jeu : tous les morceaux rendus présents dans le dossier */
const tous = {}; for (const d of fs.existsSync(SORTIE) ? fs.readdirSync(SORTIE) : []) { const f = path.join(SORTIE, d, 'index.json'); if (fs.existsSync(f)) tous[d] = JSON.parse(fs.readFileSync(f, 'utf8')); }
fs.writeFileSync(path.join(SORTIE, 'index.js'), '/* LA MUSIQUE DE COURSE FIGÉE DU TÉLÉPHONE (écrit par outils/musique/rendre-paliers.mjs, ne pas éditer à la main) */\nwindow.PALIERS_COURSE=' + JSON.stringify(tous) + ';\n');
const rf = path.join(SORTIE, 'rapport.json'); let ancien = {}; try { ancien = JSON.parse(fs.readFileSync(rf, 'utf8')); } catch (e) {} fs.writeFileSync(rf, JSON.stringify(Object.assign(ancien, rapport), null, 1));
console.log('index.js :', Object.keys(tous).length, 'morceaux ; rapport.json écrit'); fin(); process.exit(0);
