#!/usr/bin/env node
/* LE BANC CHROME DU LOT MUSIQUECALME (2026-11-18) — Chrome sans fenêtre et MUET (--mute-audio ; rien n'est branché à la sortie : la page de outils/banc-son/segments.html
   n'enregistre que dans un AudioWorklet). Le VRAI lecteur en segments, les VRAIS fichiers décodés par Chrome, en temps réel : l'essai `reel` de segments.html compare ce qui
   est rendu, échantillon par échantillon, à ce qu'on attend (les fichiers mis bout à bout, palier par palier, fondu de 8 ms aux bascules vues).
   On le lance deux fois : `?musiquecalme=1` (le régime chaud forcé) et `?sans=musiquecalme` (le lecteur d'avant) ; on compte les décodages (decodagesMs).
   usage : sh ~/cash-car/verrou-banc.sh prendre "<qui>" ; node outils/banc-musiquecalme/chrome.mjs [--http 9893] [--cdp 9894] [--duree 96] ; sh ~/cash-car/verrou-banc.sh rendre */
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import os from 'node:os';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), ICI = path.dirname(fileURLToPath(import.meta.url)), JEU = path.resolve(ICI, '../../VERSION PRINCIPALE'), BANC = path.resolve(ICI, '../banc-son');
const { lanceChrome, tueChrome, CDP, portLibre, dormir } = require('../banc-trainees/cdp.cjs');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const PORT_H = +opt('http', 9893), PORT_C = +opt('cdp', 9894), DUREE = +opt('duree', 96);
for (const p of [PORT_H, PORT_C]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const srv = http.createServer((rq, rs) => { const p = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
  const f = p === '/__segments.html' ? path.join(BANC, 'segments.html') : path.join(JEU, p); if (!f.startsWith(JEU) && !f.startsWith(BANC)) { rs.writeHead(403); return rs.end(); }
  fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
await new Promise(ok => srv.listen(PORT_H, '127.0.0.1', ok));
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'musiquecalme-')); const { ch, pg } = await lanceChrome(PORT_C, prof, 400, 300);
const fin = () => { try { tueChrome(ch); } catch (e) {} try { srv.close(); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; await c.send('Page.enable'); await c.send('Runtime.enable');
/* le moteur : +1 toutes les 5 s, avec un saut de 3 (un boost) à 41 s et une descente à 70 s */
const demandes = []; for (let t = 3, m = 1; t < DUREE - 3; t += 5) { m = t > 40 && t < 46 ? m + 3 : t > 69 && t < 75 ? m - 2 : m + 1; demandes.push({ t, m: Math.max(1, Math.min(30, m)) }); }
for (const qs of ['?musiquecalme=1', '?sans=musiquecalme']) {
  await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_H}/__segments.html${qs}` });
  for (let i = 0; i < 60; i++) { await dormir(500); try { if (await c.ev('!!window.pret')) break; } catch (e) {} }
  try { const r = await c.ev(`reel(${JSON.stringify({ nom: 'reel ' + qs, duree: DUREE, demandes })})`, 10 * 60 * 1000);
    const o = { nom: r.nom, T0: r.T0, exact: r.exact, trous: r.trous, picMo: r.picMo, memoireMaxVueMo: r.memoireMaxVueMo, tamponsMax: r.tamponsMax, decodages: r.decodagesMs.length, decodagesMs: r.decodagesMs,
      bascules: r.bascules.length, phrases: r.phrases, secondes: r.secondes, mesures: r.mesures, ecartMaxHorsFondu: r.ecartMaxHorsFondu, echantillonsDifferents: r.echantillonsDifferents, premierEcart: r.premierEcart,
      ecartMaxDansFondu: r.ecartMaxDansFondu, rmsAttenduDb: r.rmsAttenduDb, gelMaxMs: r.gelMaxMs, notes: r.notes };
    console.log(JSON.stringify(o)); } catch (e) { console.log('ÉCHEC', qs, String(e.message).slice(0, 600)); }
}
fin(); process.exit(0);
