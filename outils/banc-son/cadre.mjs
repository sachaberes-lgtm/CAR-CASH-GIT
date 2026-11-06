// FUMÉE DANS LE CADRE DE L'ORDINATEUR (2026-11-05, DEBUG-TOTAL) — la page telle que Vercel la sert à un ordinateur : le jeu dans l'iframe
// #colonne (le « téléphone » zoomé), couché ou debout. Vrais clics de souris dans l'iframe (titre, JOUER, REJOUER, MAISON), pilote auto,
// mort, REJOUER, retour à l'accueil ; la sonde du son (sonde.js) tourne DANS l'iframe. Vert si : 0 erreur console (page et iframe),
// un seul AudioContext ouvert, une musique au plus, et la course part.
//   node outils/banc-son/cadre.mjs [--debout] [--jeu 9832] [--port 9833]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const JEU = +opt('jeu', 9832), PORT = +opt('port', 9833), DEBOUT = a.includes('--debout');
const W = 1280, H = 820;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICI = path.dirname(fileURLToPath(import.meta.url));
const SONDE = fs.readFileSync(path.join(ICI, 'sonde.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...x) => console.log(...x);
const srv = spawn('python3', ['-m', 'http.server', String(JEU), '--bind', '127.0.0.1'], { cwd: path.resolve(ICI, '../../VERSION PRINCIPALE'), stdio: 'ignore', detached: true });
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-cadre-'));
const chrome = spawn(CHROME, ['--headless=new', '--mute-audio', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
const tue = () => { try { process.kill(-srv.pid, 'SIGKILL'); } catch (e) {} try { chrome.kill('SIGKILL'); } catch (e) {} try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); });

let tabs; for (let i = 0; i < 80; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (tabs.find(t => t.type === 'page')) break; } catch (e) {} await sleep(250); }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const att = new Map(), erreurs = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('ERR ' + m.params.args.map(x => x.value ?? x.description ?? '').join(' ').slice(0, 300));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) erreurs.push('LOG ' + (m.params.entry.text + ' ' + (m.params.entry.url || '')).slice(0, 300)); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result?.result?.value; };
/* une expression évaluée DANS l'iframe du jeu (même origine) */
const evj = e => ev(`(function(){var f=document.getElementById('colonne');if(!f||!f.contentWindow)return null;var w=f.contentWindow;with(w){return (${e});}})()`);
const clic = async (x, y) => { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(60);
  for (const type of ['mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 }); await sleep(40); } };
/* le centre d'un élément de l'iframe, en coordonnées de la page (l'iframe est zoomée : son échelle = largeur affichée / largeur intérieure) */
const vise = sel => ev(`(function(){var f=document.getElementById('colonne');if(!f)return null;var R=f.getBoundingClientRect(),w=f.contentWindow,k=R.width/w.innerWidth;
  var L=[].slice.call(w.document.querySelectorAll(${JSON.stringify(sel)}));for(var i=0;i<L.length;i++){var b=L[i].getBoundingClientRect(),cs=w.getComputedStyle(L[i]);
  if(b.width>4&&b.height>4&&cs.visibility!=='hidden'&&cs.display!=='none')return {x:R.left+(b.left+b.width/2)*k,y:R.top+(b.top+b.height/2)*k};}return null;})()`);
const touche = async (sel, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await vise(sel); if (r) { await clic(r.x, r.y); return true; } await sleep(400); } return false; };
const attends = async (e, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await evj(e)) return true; } catch (x) {} await sleep(400); } return false; };

const pb = [];
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable'); await send('Network.setBypassServiceWorker', { bypass: true });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  const save = JSON.stringify({ v: 2, sfx: true, mus: true, vox: true, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 } });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!localStorage.ccBancCadre){localStorage.ccBancCadre=1;localStorage.cashcarSave=${JSON.stringify(save)};}}catch(e){}` });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: SONDE });
  await send('Page.navigate', { url: `http://127.0.0.1:${JEU}/index.html?garde=1${DEBOUT ? '&colonne=portrait' : ''}` });
  if (!await attends('!!window.__gameReady&&typeof dbgState==="function"', 90000)) throw new Error('le jeu de l\'iframe ne démarre pas');
  const cadre = await ev(`(function(){var f=document.getElementById('colonne');if(!f)return null;var R=f.getBoundingClientRect();return {x:R.left,y:R.top,w:R.width,h:R.height,iw:f.contentWindow.innerWidth,ih:f.contentWindow.innerHeight};})()`);
  log('cadre', JSON.stringify(cadre));
  if (!cadre) throw new Error('pas de cadre #colonne');
  for (let i = 0; i < 30; i++) { const la = await evj(`(function(){var s=document.getElementById('splash');if(!s)return 0;var cs=getComputedStyle(s);return (cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05)?1:0;})()`); if (!la) break; await clic(cadre.x + cadre.w / 2, cadre.y + cadre.h / 2); await sleep(600); }
  await sleep(7000);
  const e0 = await evj('__SONBANC.etat()'); const ouv = e0.contextes.filter(x => x.etat !== 'closed');
  log('accueil : contextes ' + e0.contextes.map(x => x.etat) + ' · lobby ' + JSON.stringify((await evj('dbgPouce()')) && (await evj('dbgPouce()')).phase));
  if (ouv.length !== 1) pb.push('accueil : ' + ouv.length + ' AudioContext ouverts');
  else if (ouv[0].etat !== 'running') pb.push('accueil : contexte audio ' + ouv[0].etat + ' après le clic du titre (on n\'entend pas le lobby)');
  if (!await touche('[data-m="play"]')) throw new Error('JOUER introuvable dans le cadre');
  if (!await attends('(function(){var s=dbgState();return s.started&&s.running&&!s.gameOver})()', 60000)) throw new Error('la course ne part pas dans le cadre');
  await evj('dbgAuto(true,0)'); await sleep(15000);
  const e1 = await evj('__SONBANC.etat()'); const p1 = await evj('dbgPouce()');
  log('course : contextes ' + e1.contextes.map(x => x.etat) + ' · musique ' + (p1 && p1.titre) + ' (' + (p1 && p1.phase) + ') · sons joués ' + e1.nPlays);
  if (!(p1 && p1.actif)) pb.push('course : aucune musique dans le cadre');
  await evj(`(function(){dbgAuto(false);return dbgDauphin('boom');})()`);
  await attends('dbgState().gameOver', 30000); await sleep(4000);
  let parti = false; for (let k = 0; k < 4 && !parti; k++) { if (!await touche('[data-m="replay"]')) { pb.push('REJOUER introuvable'); break; } parti = await attends('(function(){var s=dbgState();return s.started&&s.running&&!s.gameOver})()', 15000); }
  if (!parti) pb.push('REJOUER ne relance pas dans le cadre');
  else { await evj('dbgAuto(true,0)'); await sleep(8000); await evj(`(function(){dbgAuto(false);return dbgDauphin('boom');})()`); await attends('dbgState().gameOver', 30000); await sleep(4000);
    if (!await touche('[data-m="menu"]')) pb.push('MAISON introuvable'); await sleep(6000); }
  const e2 = await evj('__SONBANC.etat()'); const p2 = await evj('dbgPouce()');
  log('accueil 2 : contextes ' + e2.contextes.map(x => x.etat) + ' · musique ' + (p2 && p2.titre) + ' (' + (p2 && p2.phase) + ') · rejets ' + e2.rejets.length);
  if (e2.rejets.length) pb.push('promesses rejetées : ' + JSON.stringify(e2.rejets.slice(-5)));
} catch (e) { pb.push('PARCOURS : ' + e.message); }
for (const e of erreurs) pb.push('console : ' + e);
log(pb.length ? 'CADRE ' + (DEBOUT ? 'DEBOUT' : 'COUCHÉ') + ' : ROUGE\n  - ' + pb.join('\n  - ') : 'CADRE ' + (DEBOUT ? 'DEBOUT' : 'COUCHÉ') + ' : VERT');
process.exit(pb.length ? 1 : 0);
