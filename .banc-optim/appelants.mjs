// node appelants.mjs <profil> <nom de fonction> : les chemins d'appel qui y mènent, avec leurs échantillons
import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const cible = process.argv[3];
const byId = new Map(p.nodes.map((n) => [n.id, n])); const par = new Map();
for (const n of p.nodes) for (const c of n.children || []) par.set(c, n.id);
const incl = new Map(); const sub = (id) => { const n = byId.get(id); let t = n.hitCount || 0; for (const c of n.children || []) t += sub(c); incl.set(id, t); return t; }; sub(p.nodes[0].id);
const chemins = new Map();
for (const n of p.nodes) if (n.callFrame.functionName === cible) {
  const ch = []; let x = par.get(n.id); while (x != null && ch.length < 6) { const m = byId.get(x); ch.push(m.callFrame.functionName || '(anon:' + m.callFrame.columnNumber + ')'); x = par.get(x); }
  const k = ch.join(' ← '); chemins.set(k, (chemins.get(k) || 0) + incl.get(n.id));
}
[...chemins].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log(String(v).padStart(5), cible, '←', k));
