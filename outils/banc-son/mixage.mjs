// BANC DU MIXAGE (2026-11-11, LA RÉGIE) — enregistre ce qui SORT vraiment du jeu (Chrome sans fenêtre, muet pour les oreilles, graphe vivant) et le découpe en scènes :
// croisière, virage appuyé, drift, nitro bref, nitro tenu, vol, file de pièces. Quatre pistes : la sortie (après le limiteur), le moteur seul, la musique seule, tous les effets.
// Pour chaque scène : niveau RMS (dBFS), crête, centre du spectre, énergie par bande (grave < 150 · bas-médium 150-500 · médium 500-2k · présence 2-5k · aigu > 5k),
// et l'écart moteur − musique. Écrit aussi les .wav de chaque scène (--wav dossier) pour une écoute ou une analyse plus fine.
//   node outils/banc-son/mixage.mjs [--url "&x=1"] [--wav dossier] [--scenes croisiere,drift,…] [--jeu 9840] [--port 9841] [--json fichier]
// UN banc à la fois sur la machine (vérifier `uptime`).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const W = 844, H = 390, JEU = +opt('jeu', 9840), PORT = +opt('port', 9841), PLUS = opt('url', ''), WAV = opt('wav', ''), JSONF = opt('json', '');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICI = path.dirname(fileURLToPath(import.meta.url)), sleep = ms => new Promise(r => setTimeout(r, ms)), log = (...x) => console.log(...x);
const srv = spawn('python3', ['-m', 'http.server', String(JEU), '--bind', '127.0.0.1'], { cwd: path.resolve(ICI, '../../VERSION PRINCIPALE'), stdio: 'ignore', detached: true });
let chrome = null, prof = null;
const tue = () => { try { process.kill(-srv.pid, 'SIGKILL'); } catch (e) {} try { chrome && chrome.kill('SIGKILL'); } catch (e) {} try { prof && fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); });
prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-mix-'));
chrome = spawn(CHROME, ['--headless=new', '--mute-audio', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
let tabs; for (let i = 0; i < 80; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (tabs.find(t => t.type === 'page')) break; } catch (e) {} await sleep(250); }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const att = new Map(), erreurs = [];
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('ERR ' + m.params.args.map(x => x.value ?? x.description ?? '').join(' ').slice(0, 300)); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setBypassServiceWorker', { bypass: true });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result?.result?.value; };
const clic = async (x, y) => { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(60); for (const type of ['mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 }); await sleep(40); } };
const attends = async (test, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(test)) return true; } catch (e) {} await sleep(300); } return false; };
const touche = async (code, bas) => send('Input.dispatchKeyEvent', { type: bas ? 'rawKeyDown' : 'keyUp', code, key: code, windowsVirtualKeyCode: { ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, ArrowUp: 38, Space: 32 }[code] || 0 });

const save = JSON.stringify({ v: 2, sfx: true, mus: true, vox: true, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 } });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.ccBanc){sessionStorage.ccBanc=1;localStorage.cashcarSave=${JSON.stringify(save)};}}catch(e){}` });
await send('Page.navigate', { url: `http://127.0.0.1:${JEU}/index.html?colonne=0&garde=1${PLUS}` });
if (!await attends('!!window.__gameReady', 90000)) throw new Error('__gameReady jamais venu');
for (let i = 0; i < 30; i++) { const la = await ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;const cs=getComputedStyle(s);return (cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05)?1:0;})()`); if (!la) break; await clic(W / 2, H / 2); await sleep(500); }
await sleep(5000);
const pj = await ev(`(function(){var L=[].slice.call(document.querySelectorAll('[data-m="play"]'));for(var i=0;i<L.length;i++){var b=L[i].getBoundingClientRect();if(b.width>4&&b.height>4)return {x:b.left+b.width/2,y:b.top+b.height/2};}return null;})()`);
if (!pj) throw new Error('JOUER introuvable'); await clic(pj.x, pj.y);
if (!await attends('(function(){try{var s=dbgState();return s.started&&s.running&&!s.gameOver}catch(e){return false}})()', 60000)) throw new Error('la course ne part pas');
await ev('dbgAuto(true,0)');
// l'enregistreur : un AudioWorklet à 4 entrées mono, qui rend des blocs au fil de la page
await ev(`(async function(){const T=dbgSonTap(),ac=T.ac;
  const code='class R extends AudioWorkletProcessor{process(I){const o=[];for(let k=0;k<6;k++){const c=I[k];if(c&&c[0]){const n=c[0].length,m=new Float32Array(n);for(let ch=0;ch<c.length;ch++)for(let i=0;i<n;i++)m[i]+=c[ch][i]/c.length;o.push(m);}else o.push(new Float32Array(128));}this.port.postMessage(o);return true;}}registerProcessor("cc-rec",R);';
  await ac.audioWorklet.addModule(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
  const n=new AudioWorkletNode(ac,'cc-rec',{numberOfInputs:6,numberOfOutputs:0});window.__rec={n:n,on:false,P:[[],[],[],[],[],[]],T:T};
  n.port.onmessage=function(e){if(!window.__rec.on)return;for(let k=0;k<6;k++)window.__rec.P[k].push(e.data[k]);};
  T.sortie.connect(n,0,0);if(T.moteur)T.moteur.connect(n,0,1);T.master.connect(n,0,3);if(T.pneus)T.pneus.connect(n,0,4);if(T.gomme)T.gomme.connect(n,0,5);
  window.__recMus=function(){try{const m=dbgSonTap().musique;if(m&&m!==window.__rec.m){window.__rec.m=m;m.connect(n,0,2);}}catch(e){}};window.__recMus();
  window.__recDeb=function(){window.__recMus();window.__rec.P=[[],[],[],[],[],[]];window.__rec.on=true;};
  window.__recFin=function(){window.__rec.on=false;const out=[];for(let k=0;k<6;k++){const L=window.__rec.P[k],N=L.length*128,i16=new Int16Array(N);let p=0;for(const b of L)for(let i=0;i<128;i++){const v=Math.max(-1,Math.min(1,b[i]));i16[p++]=v*32767;}
    const u=new Uint8Array(i16.buffer);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));out.push(btoa(s));}return out;};
  return ac.sampleRate;})()`);
const SR = 48000;
// ---- l'analyse (node)
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const xr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, xi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k + len / 2] = re[i + k] - xr; im[i + k + len / 2] = im[i + k] - xi; re[i + k] += xr; im[i + k] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const BANDES = [[20, 150, 'grave'], [150, 500, 'basMed'], [500, 2000, 'medium'], [2000, 5000, 'presence'], [5000, 20000, 'aigu']];
function analyse(x) { const N = 4096, P = new Float64Array(N / 2); let nb = 0, q = 0, cr = 0; for (const v of x) { q += v * v; const a9 = Math.abs(v); if (a9 > cr) cr = a9; }
  for (let o = 0; o + N <= x.length; o += N / 2) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[o + i] * (.5 - .5 * Math.cos(2 * Math.PI * i / N)); fft(re, im); for (let i = 0; i < N / 2; i++) P[i] += re[i] * re[i] + im[i] * im[i]; nb++; }
  let tot = 0, cen = 0; const B = {}; for (const b of BANDES) B[b[2]] = 0; for (let i = 1; i < N / 2; i++) { const f = i * SR / N, p = P[i]; tot += p; cen += p * f; for (const b of BANDES) if (f >= b[0] && f < b[1]) B[b[2]] += p; }
  const r = { rms: +(10 * Math.log10(q / Math.max(1, x.length) + 1e-12)).toFixed(1), crete: +(20 * Math.log10(cr + 1e-9)).toFixed(1), centre: Math.round(cen / (tot || 1)) }; for (const k in B) r[k] = Math.round(100 * B[k] / (tot || 1)); return r; }
function wav(f, x) { const b = Buffer.alloc(44 + x.length * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40); for (let i = 0; i < x.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2); fs.writeFileSync(f, b); }
const PISTES = ['sortie', 'moteur', 'musique', 'effets', 'pneus', 'gomme'], RES = {};
async function scene(nom, avant, duree, apres) {
  if (avant) await avant(); await ev('window.__recDeb()'); await sleep(duree); const b64 = await ev('window.__recFin()');
  const et = await ev(`(function(){try{var s=dbgState();return {mode:s.mode,kmh:Math.round(s.speedKmh||s.kmh||0),go:s.gameOver,reg:(typeof dbgRegie==='function'?dbgRegie():null)}}catch(e){return {err:e.message}}})()`);
  if (apres) await apres();
  const R = RES[nom] = { etat: et };
  PISTES.forEach((p, k) => { const u = Buffer.from(b64[k], 'base64'), x = new Float32Array(u.length / 2); for (let i = 0; i < x.length; i++) x[i] = u.readInt16LE(i * 2) / 32767; R[p] = analyse(x); if (WAV) { fs.mkdirSync(WAV, { recursive: true }); wav(path.join(WAV, nom + '-' + p + '.wav'), x); } });
  const f = o => `${String(o.rms).padStart(6)} dB (crête ${String(o.crete).padStart(5)}) · centre ${String(o.centre).padStart(5)} Hz · ${BANDES.map(b => b[2] + ' ' + String(o[b[2]]).padStart(2) + '%').join(' ')}`;
  log(`\n== ${nom}  ${JSON.stringify(et)}`); for (const p of PISTES) log(`   ${p.padEnd(8)} ${f(R[p])}`); log(`   moteur − musique : ${(R.moteur.rms - R.musique.rms).toFixed(1)} dB · effets − musique : ${(R.effets.rms - R.musique.rms).toFixed(1)} dB`);
}
const vie = () => ev(`(function(){try{var s=dbgState();if(s.gameOver||!s.running){return false}return true}catch(e){return false}})()`);
const F = async o => ev(`(function(){try{return typeof dbgRegie==='function'?dbgRegie('force',${JSON.stringify(o)}):null}catch(e){return e.message}})()`);
const SC = (opt('scenes', 'croisiere,virage,drift,nitroBref,nitroTenu,vol,pieces')).split(',');
await sleep(9000);   // la musique de course entre, la caisse prend sa vitesse
try {
  for (const s of SC) {
    if (!await vie()) { log('(la caisse est morte : on arrête)'); break; }
    if (s === 'croisiere') await scene(s, null, 6000);
    if (s === 'virage') await scene(s, () => F({ glisse: .5 }), 4000, () => F(null));
    if (s === 'drift') await scene(s, () => F({ drift: 1, glisse: 1 }), 5000, () => F(null));
    if (s === 'nitroBref') await scene(s, async () => { setTimeout(async () => { await ev('dbgAuto(true,0,{nit:1})'); await sleep(250); await ev('dbgAuto(true,0)'); }, 500); }, 3000);
    if (s === 'nitroTenu') await scene(s, async () => { setTimeout(async () => { await ev('dbgAuto(true,0,{nit:1})'); await sleep(3200); await ev('dbgAuto(true,0)'); }, 300); }, 6500);
    if (s === 'vol') await scene(s, () => ev('dbgAuto(true,0,{saut:1.6})'), 4500, () => ev('dbgAuto(true,0)'));
    if (s === 'driftVrai') await scene(s, async () => { await ev('dbgAuto(false)'); await touche('ArrowLeft', 1); await touche('ArrowDown', 1); setTimeout(async () => { log('   pendant : ' + JSON.stringify(await ev('(function(){var r=dbgRegie(),g=dbgGomme();return {drift:r.drift,driftT:r.driftT,att:r.attention,quinte:r.gains.quinte,gomme:g.souffle,note:g.note}})()'))); }, 1100); setTimeout(async () => { await touche('ArrowDown', 0); await touche('ArrowLeft', 0); await ev('dbgAuto(true,0)'); setTimeout(async () => { log('   après : ' + JSON.stringify(await ev('(function(){var r=dbgRegie();return {drift:r.drift,coup:r.coup,coups:r.coups,rates:r.rates}})()'))); }, 350); }, 1500); }, 3500);
    if (s === 'pieces') await scene(s, () => ev(`(function(){var k=0;window.__pc=setInterval(function(){try{CCSON.play('piece',{st:[0,2,4,7,9,12,9,7,9,12][k%10],vol:-9});if(k%5===4)CCSON.play('piece.recolte',{vol:-9});k++;}catch(e){}},105);})()`), 4000, async () => { const d = await ev('(function(){clearInterval(window.__pc);try{return CCSON.densite?CCSON.densite():null}catch(e){return null}})()'); log('   densité à la fin : ' + JSON.stringify(d)); });
    await sleep(1500);
  }
} catch (e) { log('ERREUR ' + e.message); }
if (erreurs.length) log('\nerreurs console :\n  ' + [...new Set(erreurs)].slice(0, 12).join('\n  '));
if (JSONF) fs.writeFileSync(JSONF, JSON.stringify(RES, null, 1));
tue(); process.exit(0);
