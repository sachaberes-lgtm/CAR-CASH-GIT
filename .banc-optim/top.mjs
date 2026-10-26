// node top.mjs <profil.cpuprofile> [n] : temps propre et total par fonction
import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const N = +(process.argv[3] || 30);
const byId = new Map(p.nodes.map((n) => [n.id, n])); const par = new Map();
for (const n of p.nodes) for (const c of n.children || []) par.set(c, n.id);
const dt = p.timeDeltas || []; const cnt = new Map();
if (dt.some((x) => x > 0)) (p.samples || []).forEach((s, i) => cnt.set(s, (cnt.get(s) || 0) + (dt[i] || 0)));
else for (const n of p.nodes) if (n.hitCount) cnt.set(n.id, n.hitCount * 1000);
const tot = [...cnt.values()].reduce((a, b) => a + b, 0);
const self = new Map(), incl = new Map();
const nom = (n) => `${n.callFrame.functionName || '(anonyme)'} ${(n.callFrame.url || '').split('/').pop()}:${n.callFrame.lineNumber}`;
for (const [id, t] of cnt) {
  const n = byId.get(id); self.set(nom(n), (self.get(nom(n)) || 0) + t);
  const vu = new Set(); let x = id;
  while (x != null) { const m = nom(byId.get(x)); if (!vu.has(m)) { vu.add(m); incl.set(m, (incl.get(m) || 0) + t); } x = par.get(x); }
}
console.log('total échantillonné', (tot / 1000).toFixed(0), 'ms');
const aff = (mp, t) => { console.log('--', t); [...mp].sort((a, b) => b[1] - a[1]).slice(0, N).forEach(([k, v]) => console.log((v / tot * 100).toFixed(1).padStart(5) + ' %  ' + k)); };
aff(self, 'PROPRE'); aff(incl, 'TOTAL');
