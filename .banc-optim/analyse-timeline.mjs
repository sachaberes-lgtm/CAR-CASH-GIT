// Lit le journal brut du pont (pymobiledevice3 webinspector cdp --trace x.jsonl) : les enregistrements Timeline de WebKit, avec leurs DURÉES.
// node analyse-timeline.mjs x.jsonl [t0 t1 en s du journal] → temps propre par type, peintures par zone, images (RenderingFrame)
import fs from 'node:fs';
const [f, a0, a1] = process.argv.slice(2);
const T0 = a0 != null ? +a0 : -Infinity, T1 = a1 != null ? +a1 : Infinity;
const recs = [];
for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
  if (!l.includes('Timeline.eventRecorded')) continue;
  let j; try { j = JSON.parse(l); } catch (e) { continue; }
  if (j.t < T0 || j.t > T1) continue;
  let m = j.msg; if (typeof m === 'string') try { m = JSON.parse(m); } catch (e) { continue; }
  if (m && m.method === 'Timeline.eventRecorded') recs.push(m.params.record);
}
const types = new Map(), zones = new Map(); let frames = [];
const vu = (r, d) => {
  const dur = (r.endTime != null && r.startTime != null) ? (r.endTime - r.startTime) * 1000 : 0;
  let enf = 0; for (const c of r.children || []) enf += vu(c, d + 1);
  const o = types.get(r.type) || { n: 0, tot: 0, propre: 0, max: 0 }; o.n++; o.tot += dur; o.propre += Math.max(0, dur - enf); o.max = Math.max(o.max, dur); types.set(r.type, o);
  if (r.type === 'Paint' && r.data) {
    const q = r.data.clip || r.data; const k = Array.isArray(q) ? [q[0], q[1], q[4] - q[0], q[5] - q[1]].map(Math.round).join(',') : [q.x, q.y, q.width, q.height].map(Math.round).join(',');
    const z = zones.get(k) || { n: 0, d: 0 }; z.n++; z.d += dur; zones.set(k, z);
  }
  if (r.type === 'RenderingFrame') frames.push(dur);
  return dur;
};
for (const r of recs) vu(r, 0);
const st = recs.map((r) => r.startTime).filter((x) => x != null), fen = st.length ? (Math.max(...st) - Math.min(...st)) : 0;
console.log(recs.length, 'enregistrements racines sur', fen.toFixed(1), 's ·', frames.length, 'RenderingFrame');
console.log('-- par type (temps propre, total, par seconde)');
[...types].sort((x, y) => y[1].propre - x[1].propre).slice(0, 22).forEach(([k, o]) => console.log(k.padEnd(26), String(o.n).padStart(6), 'fois', o.propre.toFixed(0).padStart(7), 'ms propres', o.tot.toFixed(0).padStart(7), 'ms', (o.propre / fen).toFixed(1).padStart(6), 'ms/s  max', o.max.toFixed(1)));
if (frames.length) { const s = [...frames].sort((x, y) => x - y); console.log('RenderingFrame méd', s[s.length >> 1].toFixed(1), 'p90', s[Math.floor(s.length * .9)].toFixed(1), 'max', s[s.length - 1].toFixed(1)); }
console.log('-- peintures par zone (x,y,l,h)');
[...zones].sort((x, y) => y[1].d - x[1].d).slice(0, 18).forEach(([k, z]) => console.log(String(z.n).padStart(5), '×', k.padEnd(22), z.d.toFixed(1).padStart(7), 'ms', (z.d / Math.max(1, z.n)).toFixed(2), 'ms/peinture'));
