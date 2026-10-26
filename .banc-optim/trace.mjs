// Trace WebKit (Timeline + échantillons JS) d'une fenêtre de N secondes dans l'app, via le pont CDP.
// node cdp.mjs trace.mjs <fichier.json> <secondes>  → écrit la trace (format Chrome) et un résumé par type d'événement
import fs from 'node:fs';
export default async function (c, [f = 'trace.json', s = '8']) {
  const ev = []; let fini;
  const termine = new Promise((r) => (fini = r));
  c.sur('Tracing.dataCollected', (p) => ev.push(...p.value));
  c.sur('Tracing.tracingComplete', () => fini());
  await c.cmd('Tracing.start', { traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute'] } });
  console.log('trace en cours', s, 's');
  await new Promise((r) => setTimeout(r, +s * 1000));
  await c.cmd('Tracing.end');
  await Promise.race([termine, new Promise((r) => setTimeout(r, 120000))]);
  fs.writeFileSync(f, JSON.stringify({ traceEvents: ev }));
  const par = new Map(); let t0 = Infinity, t1 = 0;
  for (const e of ev) {
    if (e.ph !== 'X' || !e.dur) continue;
    t0 = Math.min(t0, e.ts); t1 = Math.max(t1, e.ts + e.dur);
    const k = e.name; const o = par.get(k) || { n: 0, d: 0, max: 0 }; o.n++; o.d += e.dur / 1000; o.max = Math.max(o.max, e.dur / 1000); par.set(k, o);
  }
  const duree = (t1 - t0) / 1000;
  console.log(ev.length, 'événements sur', (duree / 1000).toFixed(1), 's');
  [...par].sort((a, b) => b[1].d - a[1].d).slice(0, 25).forEach(([k, o]) => console.log(k.padEnd(28), String(o.n).padStart(6), 'fois', (o.d).toFixed(0).padStart(7), 'ms', (o.d / duree * 100).toFixed(1).padStart(5), '%  max', o.max.toFixed(1)));
}
