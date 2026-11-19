// Compare les photos posées de deux passes (empreintes de gel.cjs) : même clé → égalité exacte des pixels (h) et écart moyen sur la vignette 60 px (0-255).
//   node outils/banc-boutiquegel/compare.cjs a.json b.json
const fs = require('fs');
const lit = f => { const r = JSON.parse(fs.readFileSync(f)); return typeof r.empreintes === 'string' ? JSON.parse(r.empreintes) : r.empreintes || {}; };
const A = lit(process.argv[2]), B = lit(process.argv[3]); const L = [];
for (const k of Object.keys(A)) { if (!B[k]) { L.push([k, 'absente de b']); continue; }
  const a = A[k].v.split(',').map(Number), b = B[k].v.split(',').map(Number); let d = 0, m = 0; for (let i = 0; i < a.length; i++) { const e = Math.abs(a[i] - b[i]); d += e; if (e > m) m = e; }
  L.push([k, A[k].h === B[k].h ? 'identique' : 'diff', +(d / a.length).toFixed(2), m]); }
for (const k of Object.keys(B)) if (!A[k]) L.push([k, 'absente de a']);
console.log(JSON.stringify({ n: L.length, identiques: L.filter(x => x[1] === 'identique').length, pireEcartMoyen: Math.max(0, ...L.filter(x => typeof x[2] === 'number').map(x => x[2])), lignes: L }));
