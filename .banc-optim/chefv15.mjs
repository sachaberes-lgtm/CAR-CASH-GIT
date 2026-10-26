// LE CHEF DU BANC (remplace serveur.mjs) : sert à CC BANC UN scénario à la fois, la lance, attend son bilan, la ferme,
// puis attend que la batterie refroidisse avant le suivant. node chef.mjs <file.json> [seuil °C = 36]
import http from 'node:http';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
const DOS = new URL('.', import.meta.url).pathname;
const UDID = '00008120-000E494C34BBA01E', BUNDLE = 'com.sachaberes.carcash.banc';
const FILE = JSON.parse(fs.readFileSync(process.argv[2] || DOS + 'file-attente.json', 'utf8'));
const SEUIL = +(process.argv[3] || 36);
fs.mkdirSync(DOS + 'res-app', { recursive: true });
const h = () => new Date().toTimeString().slice(0, 8);
const log = (...a) => { const l = h() + ' ' + a.join(' '); console.log(l); fs.appendFileSync(DOS + 'chef15.log', l + '\n'); };
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
const lance = (cmd, args, ms = 90000) => new Promise((ok) => { execFile(cmd, args, { timeout: ms }, (e, so, se) => ok({ e, so: String(so || ''), se: String(se || '') })); });

async function temp() {
  const r = await lance(DOS + 'venv/bin/pymobiledevice3', ['diagnostics', 'battery', 'single'], 40000);
  try { const d = JSON.parse(r.so); return +(d.Temperature / 100).toFixed(1); } catch (e) { return null; }
}
async function cheminBanc() {
  const f = DOS + 'banc-app-info15.json';
  await lance('xcrun', ['devicectl', 'device', 'info', 'apps', '--device', UDID, '--bundle-id', BUNDLE, '--json-output', f]);
  try { return decodeURIComponent(JSON.parse(fs.readFileSync(f, 'utf8')).result.apps[0].url.replace('file://', '')); } catch (e) { return null; }
}
async function ferme() {
  const p = await cheminBanc(); if (!p) return;
  const r = await lance('xcrun', ['devicectl', 'device', 'info', 'processes', '--device', UDID]);
  for (const l of r.so.split('\n')) if (l.includes(p.replace(/\/$/, ''))) { const pid = l.trim().split(/\s+/)[0]; await lance('xcrun', ['devicectl', 'device', 'process', 'terminate', '--device', UDID, '--pid', pid]); log('CC BANC fermée (pid ' + pid + ')'); }
}

let courant = null, recu = null, demande = false;
http.createServer((q, r) => {
  if (q.method === 'GET' && q.url.startsWith('/scenario')) { r.writeHead(200, { 'Content-Type': 'application/json' }); if (courant) demande = true; r.end(JSON.stringify(courant)); log('scénario demandé →', courant ? courant.id : 'aucun'); return; }
  if (q.method === 'POST' && (q.url.startsWith('/resultat') || q.url.startsWith('/vie'))) {
    let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => {
      if (q.url.startsWith('/vie')) { log('VIE', b.slice(0, 200)); r.writeHead(200); r.end('ok'); return; }
      let j = null; try { j = JSON.parse(b); } catch (e) {}
      const id = (j && j.id) || 'inconnu'; fs.writeFileSync(`${DOS}res-app/${id}.json`, b);
      log('bilan reçu', id, b.length, 'octets', j && j.erreur ? 'ERREUR ' + j.erreur.slice(0, 300) : '');
      if (courant && id === courant.id) { recu = j; courant = null; }
      r.writeHead(200); r.end('ok');
    }); return;
  }
  if (q.url.startsWith('/ping')) { r.writeHead(200); r.end('pong'); return; }
  r.writeHead(404); r.end();
}).listen(8932, '0.0.0.0', () => log('chef du banc sur :8932,', FILE.length, 'scénarios, seuil', SEUIL, '°C'));

(async () => {
  for (const s of FILE) {
    if (fs.existsSync(`${DOS}res-app/${s.id}.json`)) { log('déjà fait :', s.id); continue; }
    let t = await temp(), n = 0;
    if (t == null && n === 0 && FILE.indexOf(s) > 0) { log('température illisible : 90 s de repos'); await dort(90000); }
    while (t != null && t > SEUIL) { if (n++ % 4 === 0) log('refroidit… batterie', t, '°C'); await dort(30000); t = await temp(); }
    log('▶', s.id, '· batterie', t, '°C');
    courant = { ...s, tAvant: t }; recu = null;
    let t0 = Date.now(); demande = false;
    for (let essai = 1; essai <= 3 && !demande; essai++) {
      const r1 = await lance('xcrun', ['devicectl', 'device', 'process', 'launch', '--device', UDID, '--terminate-existing', BUNDLE]);
      if (r1.e) log('lancement refusé :', (r1.se || r1.so).split('\n').filter(Boolean).slice(-2).join(' | ').slice(0, 200));
      const tw = Date.now(); while (!demande && Date.now() - tw < 45000) await dort(1000);
      if (!demande) log('app muette après 45 s (essai ' + essai + ')');
    }
    t0 = Date.now();
    const lim = ((s.menu || 12) + (s.course || 40) + 150) * 1000;
    while (!recu && Date.now() - t0 < lim) await dort(2000);
    await ferme();
    const t2 = await temp();
    log(recu ? '✓' : '✗ pas de bilan', s.id, 'en', Math.round((Date.now() - t0) / 1000), 's · batterie après', t2, '°C');
    if (recu) { const f = `${DOS}res-app/${s.id}.json`; const j = JSON.parse(fs.readFileSync(f, 'utf8')); j.temp = [t, t2]; fs.writeFileSync(f, JSON.stringify(j)); }
    courant = null;
  }
  log('file terminée'); process.exit(0);
})();
