/* lecture de vivant.cjs : node outils/banc-portv/vivant-lire.cjs <après.json> [<avant.json>]
   les routes (bâtie en course contre d'un trait), la mémoire GPU, les cas ; avec deux fichiers : les routes aux MÊMES entrées (map, graine, palier, mémoire des grottes) comparées. */
const fs = require('fs');
const lis = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const F = process.argv.slice(2).map(f => [f, lis(f)]);
for (const [f, R] of F) {
  console.log(`\n=== ${f}  q="${R.q}" bride ×${R.bride}  exceptions ${R.exc.length}  erreurs console ${R.con.filter(x => x.startsWith('error')).length}${R.err ? '  ERREUR ' + R.err.slice(0, 200) : ''}`);
  const V = R.verif || { l: [] };
  console.log(`routes vérifiées ${V.n}, différentes ${V.ko}${V.err ? ', err ' + V.err : ''}`);
  for (const x of V.l) console.log(`  ${x.k.padEnd(7)} ${x.carte.padEnd(16)} sd ${x.sd} pal ${x.eng} z ${x.z} vus[${x.vus}] ref ${x.ref} inst ${x.inst} ${x.egal ? 'ÉGALE' : 'DIFFÉRENTE'}${x.egalMk ? '' : ' (marques ≠)'}${x.etale ? ' étalée' : ''} (${x.ms} ms d'un trait)`);
  console.log(`pré-bâtis annulés qui avaient écrit dans la mémoire des routes (fantômes) : ${(V.fantomes || []).length}${V.memoire === false ? ' (gardés : sans le lot)' : ' (mémoire remise)'}`);
  for (const x of V.fantomes || []) console.log(`  ${x.carte} (${x.r}) : ${x.quoi}${x.remis ? ' → remise' : ' → GARDÉE'}`);
  console.log('mémoire GPU (géométries / textures / programmes) :');
  for (const m of R.fuite) console.log(`  ${String(m.quand).padEnd(22)} ${m.geo} / ${m.tex} / ${m.progs}  lieu ${m.lieu}  à libérer ${m.lib} tâches ${m.apres}`);
  for (const P of R.cas) {
    if (P.err) { console.log(`cas ${P.nom} : ERREUR ${P.err}`); continue; }
    const e = P.etat || {};
    console.log(`cas ${P.nom} (${P.de}→${P.cible}) portail ${P.tp ? 'oui' : 'NON'} pret ${P.pret} → lieu ${e.lieu} mode ${e.mode} st ${e.started} go ${e.gameOver} pause ${e.paused} ph ${e.ph} att ${e.att} s ${e.s}/${e.L} kmh ${P.kmhPassage}`);
    if (P.ev2 && P.ev2.length) console.log('   piège', JSON.stringify(P.ev2).slice(0, 900));
    if (P.etale) console.log('   règles', JSON.stringify(P.etale.regles), 'suspensions', P.etale.suspensions, 'derniers', JSON.stringify(P.etale.derniers.slice(-1)));
    for (const k of ['coupe', 'apresMort', 'reanime', 'apresReanime', 'roule', 'second', 'apresQuitte', 'nouvelle', 'avant', 'quitte', 'moteur', 'kmh0', 'kmhApproche', 'vApproche'])
      if (P[k] !== undefined) console.log(`   ${k} ${typeof P[k] === 'string' ? P[k].slice(0, 300) : JSON.stringify(P[k]).slice(0, 300)}`);
    for (const k of ['rv', 'rv2']) if (P[k]) console.log(`   ${k} ${P[k].map(x => x.k + ':' + x.carte + ':' + (x.egal ? 'ÉGALE' : 'DIFF')).join(' ')}`);
    if (P.portailApres) console.log(`   portail suivant ${(P.portailApres.rv || []).map(x => x.k + ':' + x.carte + ':' + (x.egal ? 'ÉGALE' : 'DIFF')).join(' ')} → ${P.portailApres.etat.lieu} ${P.portailApres.etat.mode}`);
  }
  if (R.exc.length) console.log('exceptions :', R.exc.slice(0, 5));
}
if (F.length === 2) {
  const cle = x => [x.carte, x.sd, x.eng, x.vus].join('|');
  const [a, b] = F.map(([, R]) => new Map(((R.verif || {}).parts || []).map(x => [cle(x), x.ref])));
  let n = 0, eg = 0; for (const [k, r] of a) if (b.has(k)) { n++; if (b.get(k) === r) eg++; else console.log('AVANT ≠ APRÈS aux mêmes entrées :', k, r, b.get(k)); }
  console.log(`\nroutes d'un trait aux mêmes entrées (map, graine, palier, mémoire des grottes) dans les deux pages : ${eg}/${n} identiques`);
}
