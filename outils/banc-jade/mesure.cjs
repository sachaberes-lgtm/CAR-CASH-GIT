/* (2026-11-14, optimiseur de Jade) MESURE ALTERNÉE référence / branche : pour chaque cas (graine × météo × ordi|tél.), lance sonde-tel.cjs sur la
   RÉFÉRENCE puis sur la BRANCHE (ou l'inverse, un cas sur deux), avec le même fichier d'audit, et range les résultats dans un JSON.
   node outils/banc-jade/mesure.cjs <sortie.json> <racine réf.> <racine branche> <port> <cdp> <audit abs> <cas…>
   un cas : "tel=1&meteo=nuit&pistegraine=9" (le &carte=jade est mis par sonde-tel) ; un drapeau de plus pour la branche seule : BR:<q> en tête de liste. */
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const [out, refR, brR, port, cdp, audit, ...cas0] = process.argv.slice(2);
let brQ = ''; const cas = [];
for (const c of cas0) { if (c.startsWith('BR:')) brQ = c.slice(3); else cas.push(c); }
const res = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : [];
const un0 = (racine, dp, q) => {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'sonde-tel.cjs'), racine, String(+port + dp), String(+cdp + dp), q, '150', audit], { encoding: 'utf8', timeout: 900000, env: Object.assign({}, process.env, { INJECTE: path.join(__dirname, 'inj-memoire.js') }) });
  const l = (r.stdout || '').split(/\r?\n/), a = l.find(x => x.startsWith('AUDIT '));
  const exc = l.filter(x => x.startsWith('EXC')).length;
  let v = null; try { v = a ? JSON.parse(a.slice(6)) : null; } catch (e) { v = { brut: a && a.slice(0, 300) }; }
  return { q, exc, audit: v, fin: l.slice(-3).join(' | ').slice(0, 300) };
};
const un = (racine, dp, q) => { let r; for (let e = 0; e < 3; e++) { r = un0(racine, dp, q); if (r.audit && r.audit.moy && r.audit.moy.g && r.audit.moy.g.jO) return r; spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},8000)']); } return r; }; /* une page qui n'a pas monté (Chrome encore occupé par le profil) ou sans montagne dessinée (la vallée pas en scène) : deux reprises */
cas.forEach((c, i) => {
  const ordre = i % 2 ? ['br', 'ref'] : ['ref', 'br'];
  const ligne = { cas: c };
  for (const k of ordre) { const t0 = Date.now(); ligne[k] = un(k === 'ref' ? refR : brR, k === 'ref' ? 0 : 1, k === 'br' && brQ ? c + '&' + brQ : c); ligne[k].s = Math.round((Date.now() - t0) / 1000);
    const A = ligne[k].audit; console.log(c, k, ligne[k].s + ' s', 'exc', ligne[k].exc, A && A.moy ? JSON.stringify({ a: A.moy.appels, amax: A.moy.appelsMax, tri: A.moy.tri, som: A.moy.som, ms: A.moy.ms, mem: A.mem, memJ: A.memJ, bati: A.bati && [A.bati.ms, A.bati.gabaritsMs] }) : ligne[k].fin); }
  res.push(ligne); fs.writeFileSync(out, JSON.stringify(res, null, 1));
});
