#!/usr/bin/env node
/* LE COÛT DES MUSIQUES DE COURSE (2026-11-15, lot MUSIQUE3) — Chrome sans fenêtre et MUET, tout rendu HORS LIGNE (OfflineAudioContext) : jamais de son.
   Compare, au même palier et sur la même durée : le fichier figé en boucle, la page « tout » en direct, le générateur en direct.
   usage : node outils/banc-son/cout-musique.mjs [--s 60] [--palier 16] [--http 9881] [--cdp 9882] [--plan '<json>']
   Sous le verrou du banc : sh ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. */
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import os from 'node:os';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url), ICI = path.dirname(fileURLToPath(import.meta.url)), JEU = path.resolve(ICI, '../../VERSION PRINCIPALE');
const { lanceChrome, tueChrome, CDP, portLibre, dormir } = require('../banc-trainees/cdp.cjs');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const S = +opt('s', 60), P = +opt('palier', 16), PORT_H = +opt('http', 9881), PORT_C = +opt('cdp', 9882);
const PLAN = opt('plan', null) ? JSON.parse(opt('plan')) : [
  ['coutFige', 'bleu-7299', 6], ['coutFige', 'pal-aura-30', 5],
  ['coutPage', 'assets/audio/music/direct/nenuphars-velours.html', P], ['coutPage', 'assets/audio/music/direct/enseigne-de-jade.html', P],
  ['coutGen', 'bleu-6167', P], ['coutGen', 'avant:bleu-8154', P] ];
for (const p of [PORT_H, PORT_C]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const srv = http.createServer((rq, rs) => { let p = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
  const f = p === '/__cout.html' ? path.join(ICI, 'cout-musique.html') : path.join(JEU, p); if (!f.startsWith(JEU) && !f.startsWith(ICI)) { rs.writeHead(403); return rs.end(); }
  fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); }); });
await new Promise(ok => srv.listen(PORT_H, '127.0.0.1', ok));
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cout-musique-')); const { ch, pg } = await lanceChrome(PORT_C, prof, 400, 300);
const fin = () => { try { tueChrome(ch); } catch (e) {} try { srv.close(); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(1); });
const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; await c.send('Page.enable'); await c.send('Runtime.enable');
await c.send('Page.navigate', { url: `http://127.0.0.1:${PORT_H}/__cout.html` });
for (let i = 0; i < 60; i++) { await dormir(500); try { if (await c.ev('!!window.pret')) break; } catch (e) {} }
const out = [];
for (const [f, x, p, g] of PLAN) { try { const r = await c.ev(`${f}(${JSON.stringify(x)}, ${p}, ${S}${g != null ? ', ' + g : ''})`, 20 * 60 * 1000); out.push(r); console.log(JSON.stringify(r)); } catch (e) { console.log('ÉCHEC', f, x, String(e.message).slice(0, 400)); } }
if (opt('compare', null)) for (const [x, y] of JSON.parse(opt('compare'))) console.log('compare', x, y, JSON.stringify(await c.ev(`compare(${JSON.stringify(x)}, ${JSON.stringify(y)})`)));
fin(); process.exit(0);
