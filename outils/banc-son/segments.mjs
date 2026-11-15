#!/usr/bin/env node
/* LE BANC DU LECTEUR EN SEGMENTS (2026-11-15, lot MUSIQUE3 tour 2) — Chrome sans fenêtre et MUET ; rien n'est branché à la sortie son (voir segments.html).
   usage : node outils/banc-son/segments.mjs [--essais chaine,reel,cadence,pb] [--http 9891] [--cdp 9892]
   Sous le verrou du banc : sh ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. */
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import os from 'node:os';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), ICI = path.dirname(fileURLToPath(import.meta.url)), JEU = path.resolve(ICI, '../../VERSION PRINCIPALE');
const { lanceChrome, tueChrome, CDP, portLibre, dormir } = require('../banc-trainees/cdp.cjs');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const ESSAIS = opt('essais', 'chaine,reel,cadence,pb').split(','), PORT_H = +opt('http', 9891), PORT_C = +opt('cdp', 9892);
for (const p of [PORT_H, PORT_C]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const srv = http.createServer((rq, rs) => { let p = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
  const f = p === '/__segments.html' ? path.join(ICI, 'segments.html') : path.join(JEU, p); if (!f.startsWith(JEU) && !f.startsWith(ICI)) { rs.writeHead(403); return rs.end(); }
  fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
await new Promise(ok => srv.listen(PORT_H, '127.0.0.1', ok));
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'segments-')); const { ch, pg } = await lanceChrome(PORT_C, prof, 400, 300);
const fin = () => { try { tueChrome(ch); } catch (e) {} try { srv.close(); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_H}/__segments.html` });
for (let i = 0; i < 60; i++) { await dormir(500); try { if (await c.ev('!!window.pret')) break; } catch (e) {} }
const lance = async (f, ...x) => { try { const r = await c.ev(`${f}(${x.map(v => JSON.stringify(v)).join(', ')})`, 20 * 60 * 1000); console.log(JSON.stringify(r)); return r; } catch (e) { console.log('ÉCHEC', f, String(e.message).slice(0, 600)); } };
if (ESSAIS.includes('chaine')) {
  /* un palier tenu sur plus d'un cycle (96 s : les 8 segments, puis le retour au premier) */
  for (const m of [3, 16, 30]) await lance('chaine', { nom: 'tenu p' + m, depart: 0, duree: 99, demandes: [{ t: .1, m }], plan: [{ k: 0, p: 0 }, { k: 1, p: m - 1 }] });
  /* départ tardif (T0 = 97,5 s) et bascules : voisin, saut, à 20 ms d'une mesure (→ la suivante), sur un bord de segment, annulée, remplacée, sur le retour du cycle */
  await lance('chaine', { nom: 'bascules', depart: 97.3, duree: 97, demandes: [{ t: .1, m: 8 }, { t: 6.1, m: 9 }, { t: 13, m: 12 }, { t: 19.98, m: 11 }, { t: 29.95, m: 12 }, { t: 41, m: 13 }, { t: 41.5, m: 12 }, { t: 51, m: 13 }, { t: 51.6, m: 14 }, { t: 58, m: 15 }, { t: 78.5, m: 16 }],
    plan: [{ k: 0, p: 0 }, { k: 1, p: 7 }, { k: 3, p: 8 }, { k: 6, p: 11 }, { k: 9, p: 10 }, { k: 12, p: 11 }, { k: 21, p: 13 }, { k: 24, p: 14 }, { k: 32, p: 15 }] });
}
if (ESSAIS.includes('reel')) await lance('reel', { nom: 'temps réel', duree: 96, pause: { t: 55, s: 3 }, demandes: [{ t: 3, m: 2 }, { t: 8.2, m: 3 }, { t: 13.1, m: 4 }, { t: 18, m: 5 }, { t: 24, m: 4 }, { t: 33, m: 5 }, { t: 38.6, m: 6 }, { t: 47, m: 10 }, { t: 60, m: 11 }, { t: 66, m: 12 }, { t: 71, m: 13 }, { t: 78.9, m: 14 }, { t: 85, m: 13 }] });
if (ESSAIS.includes('cadence')) { await lance('cadence', 'bleu-7299', ''); await lance('cadence', 'bleu-7299', '&sans=cadence'); await lance('cadence', 'pal-aura-30', ''); }
if (ESSAIS.includes('pb')) { await lance('viaPB', 'bleu-9551', '', 30, 16); await lance('viaPB', 'bleu-9551', '&sans=musique3', 12, 16); await lance('viaPB', 'bleu-9551', '&musique=live', 12, 16); await lance('viaPB', 'bleu-7299', '', 12, 16); }
fin(); process.exit(0);
