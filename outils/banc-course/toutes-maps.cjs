/* Joue course.cjs sur chaque map, l'une après l'autre, et range un compte rendu par map dans out/. node toutes-maps.cjs <profil Chrome chaud> [maps séparées par des virgules] */
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const prof = process.argv[2], maps = (process.argv[3] || 'banquise,canyon,crypto,dunes,foret,grotte,jade,ville,vitree,espace,volcan,nuages').split(',');
const out = path.resolve(__dirname, '..', '..', 'out'); fs.mkdirSync(out, { recursive: true });
for (const m of maps) {
  const r = spawnSync('node', [path.join(__dirname, process.env.SCRIPT || 'course.cjs'), '--prof', prof, '--http', '9951', '--cdp', '9952', '--map', m.includes(':') ? m : m + ':matin'], { encoding: 'utf8', timeout: 420000 });
  fs.writeFileSync(path.join(out, (process.env.SCRIPT ? 'gl-' : 'map-') + m.replace(':', '-') + '.txt'), (r.stdout || '') + (r.stderr || '') + '\n[sortie ' + r.status + ' ' + (r.error ? r.error.message : '') + ']');
  console.log(m, 'fini', r.status); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); /* laisse Chrome rendre son port */
}
fs.writeFileSync(path.join(out, 'FINI'), 'ok');
