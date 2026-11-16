/* (2026-11-14, optimiseur de Jade) LES COURSES AU PILOTE, référence et branche ALTERNÉES : course-pilote.js (toute la vallée au pilote de mesure, sauts toutes les
   4 s au milieu puis une passe au ras du bord ; morts relevées ; gels = écarts entre images) par sonde-tel.cjs, sur chaque cas.
   node outils/banc-jade/courses.cjs <sortie.json> <racine réf.> <racine branche> <port> <cdp> <cas…>   (la branche sur port+1 / cdp+1)
   un cas : "tel=1&meteo=nuit&pistegraine=9" */
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const [out, refR, brR, port, cdp, ...cas] = process.argv.slice(2);
const res = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : [];
const un = (racine, dp, q) => {
  for (let e = 0; e < 3; e++) {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'sonde-tel.cjs'), racine, String(+port + dp), String(+cdp + dp), q, '200', path.join(__dirname, 'course-pilote.js')], { encoding: 'utf8', timeout: 1500000 });
    const l = (r.stdout || '').split(/\r?\n/), a = l.find(x => x.startsWith('AUDIT '));
    let v = null; try { v = a ? JSON.parse(a.slice(6)) : null; } catch (x) {}
    if (v && v.passes && v.passes.length) return { exc: l.filter(x => x.startsWith('EXC')).length, excs: l.filter(x => x.startsWith('EXC')).slice(0, 3).map(x => x.slice(0, 200)), r: v };
    spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},8000)']);
  }
  return { exc: -1, r: null };
};
cas.forEach((c, i) => {
  const ligne = { cas: c };
  for (const k of (i % 2 ? ['br', 'ref'] : ['ref', 'br'])) {
    ligne[k] = un(k === 'ref' ? refR : brR, k === 'ref' ? 0 : 1, c);
    const R = ligne[k].r;
    console.log(c, k, 'exc', ligne[k].exc, R ? 'carte ' + R.niveau + (R.racine ? '' : ' (VALLÉE ABSENTE)') + ' · ' : '', R ? R.passes.map(p => 'lat ' + p.latK + ' : ' + p.morts.length + ' morts ' + JSON.stringify(p.morts.map(m => [m.s, m.cause, m.mode])) + ' couvert ' + p.couvert + '/' + p.L + ' vols ' + p.vols + ' ips ' + p.ips + ' p99 ' + p.p99 + ' gels>100 ' + p.gels100 + ' >250 ' + p.gels250 + ' pire ' + p.pire).join(' | ') : 'ÉCHEC');
  }
  res.push(ligne); fs.writeFileSync(out, JSON.stringify(res, null, 1));
});
