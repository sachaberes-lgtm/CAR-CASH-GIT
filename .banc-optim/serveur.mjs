// Le serveur du banc autonome : l'app CC BANC lui demande le prochain scénario (file.json) et lui renvoie ses bilans (res-app/).
// node serveur.mjs   (port 8931, toutes interfaces : l'iPhone le joint par son partage de connexion)
import http from 'node:http';
import fs from 'node:fs';
const DOS = new URL('.', import.meta.url).pathname;
fs.mkdirSync(DOS + 'res-app', { recursive: true });
const file = () => { try { return JSON.parse(fs.readFileSync(DOS + 'file.json', 'utf8')); } catch (e) { return []; } };
const faits = () => { try { return JSON.parse(fs.readFileSync(DOS + 'faits.json', 'utf8')); } catch (e) { return []; } };
http.createServer((q, r) => {
  const t = new Date().toISOString().slice(11, 19);
  if (q.method === 'GET' && q.url.startsWith('/scenario')) {
    const f = faits(); const s = file().find((x) => !f.includes(x.id)) || null;
    console.log(t, 'scénario demandé →', s ? s.id : 'aucun');
    r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(s)); return;
  }
  if (q.method === 'POST' && q.url.startsWith('/resultat')) {
    let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => {
      let j = null; try { j = JSON.parse(b); } catch (e) {}
      const id = (j && j.id) || 'inconnu';
      fs.writeFileSync(`${DOS}res-app/${id}.json`, b);
      const f = faits(); if (!f.includes(id)) { f.push(id); fs.writeFileSync(DOS + 'faits.json', JSON.stringify(f)); }
      console.log(t, 'résultat reçu', id, b.length, 'octets', j && j.erreur ? 'ERREUR ' + j.erreur.slice(0, 200) : '');
      r.writeHead(200); r.end('ok');
    }); return;
  }
  if (q.method === 'POST' && q.url.startsWith('/vie')) { let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => { console.log(t, 'VIE', b); r.writeHead(200); r.end('ok'); }); return; }
  if (q.url.startsWith('/ping')) { r.writeHead(200); r.end('pong'); return; }
  r.writeHead(404); r.end();
}).listen(8931, '0.0.0.0', () => console.log('serveur du banc sur :8931'));
