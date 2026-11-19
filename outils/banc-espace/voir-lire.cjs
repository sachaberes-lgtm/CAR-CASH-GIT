/* (2026-11-18, rôle VOIR) lecture d'une passe : node outils/banc-espace/voir-lire.cjs <resultat.json> [cas] [module] [pas=1] */
const R = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8')), CAS = process.argv[3], MOD = process.argv[4], PAS = +(process.argv[5] || 1);
console.log('exc', R.exc.length, JSON.stringify(R.exc.slice(0, 3)).slice(0, 500), 'con', R.con.length, JSON.stringify(R.con.slice(0, 4)).slice(0, 500));
for (const C of R.cas) { if (CAS && C.nom !== CAS) continue;
  const d = C.etat && C.etat.voy && C.etat.voy.decor; console.log('##', C.nom, 'prep', JSON.stringify(C.prep), 'décor', JSON.stringify(d && { j: d.jante, r: d.roc, n: d.neb, info: d.info, zs: d.zonesSaut, err: d.err }), 'fen', C.fenetres.join(' '));
  for (const M of C.modules) { if (MOD && M.g !== MOD) continue;
    console.log(' MOD', M.g, M.s0, M.s1, 'kmh0', M.kmh0, 'n', M.n, 'sauts', JSON.stringify(M.sauts.map(x => [x[0], x[1], x[2] && x[2].ok, x[2] && (x[2].voy ? 'voy' : '') + (x[2].esp ? 'esp' : '')])), 'tue', M.tue || '', 'fin', M.fin || '', 'err', M.err || '');
    if (MOD) M.images.forEach((r, i) => { if (i % PAS && r.mode === 'drive') return; console.log('  ', r.k, r.t, r.s, r.mode, r.mod || '-', 'h', r.h, 'b', r.b, 'up', r.carUpN, 'ny', r.nyC, 'cU', r.camUpN, 'cY', r.camUpY, 'camN', r.camN, 'ch', r.champ, 'dC', r.dCam, r.obs || '', r.camDansLune != null ? 'L' + r.camDansLune : '', r.dLune != null ? 'dL' + r.dLune : '', r.dNeb != null ? 'nb' + r.dNeb : '', r.refus, r.volUN != null ? 'vu' + r.volUN : '', r.hOff != null ? 'hO' + r.hOff : '', 'kmh', r.kmh, 'nit', r.nit, r.nitOn ? 'N' : ''); });
    for (const m of M.morts) { console.log('   MORT', m.s, m.cause, 'prov', m.provoquee, 'chance', m.chance && m.chance.ok, 'joue', m.joue, m.photos);
      for (const r of (m.reprise || [])) console.log('     rep', r.s, r.mode, r.side, r.kmh, r.mod, 'h', r.h, 'b', r.b, 'up', r.carUpN, 'ny', r.nyC, 'cU', r.camUpN, 'ch', r.champ, 'go', r.go, r.obs || ''); } } }
