/* LECTURE DU BANC DU PORTAIL ÉTALÉ (lot portv) : node outils/banc-portv/lire.cjs <sortie.json> [<autre.json> …] [--prof 1] [--long 50]
   Par portail : la pire image autour du passage (2,5 s avant le voile → 6 s après), les images > 50 ms, la plus longue tranche de pré-bâti d'une image pendant
   l'approche, la construction (temps actif, durée sous le voile, tranches, pire tranche) et ses étapes. --prof : pour chaque image > --long ms autour du passage,
   les fonctions qui y ont pris le plus de temps (temps inclusif des fonctions du jeu nommées, temps propre des autres). */
const fs = require('fs');
const A = process.argv.slice(2), fic = A.filter(x => x.endsWith('.json')), prof = A.includes('--prof'), LONG = +(A[A.indexOf('--long') + 1] || 50);
const CLES = ['portvPorte', 'pveTick', 'pvePas', 'newTrack', 'newTrack0G', 'buildTrackG', 'prebGraine', 'prebTravaille', 'pisteInstalle', 'buildClouds', 'buildVoxCity', 'buildJade', 'jadeReprend', 'jadeCle', 'jadeCleG', 'buildCanyon', 'buildDunes',
  'buildGrotte', 'prebDecor', 'grotteMeteo', 'buildBanq', 'orbiteBuild', 'padsInstancier', 'bioGo', 'lvlGo', 'lvlAnnonce', 'computeMinimap', 'spawnPickups', 'musicSuitLieu', 'campDebut',
  'chauffeRendu', 'jadeChauffeNiveau', 'render', 'compile', 'pcVoileSort', 'pcPrepare', 'pcDessine', 'matSursisTick', 'pveLib', 'prebTick', 'prebLie', 'loop', 'sceneRetire', 'jadeJette', 'jadeOublie', 'jadeRange'];
for (const f of fic) {
  const R = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`\n=== ${f}  q="${R.q}"  bride ×${R.bride}  exceptions ${R.exc.length}  erreurs console ${R.con.length}`);
  for (const e of R.exc.slice(0, 5)) console.log('   EXC ' + e.slice(0, 300));
  console.log('tour  de → vers       pire  >50 >100  méd.av  tranche-pb  constr.actif  sous-voile  tranches pire-tranche   étapes > 5 ms');
  for (const P of R.portails) {
    const c = (P.pv && P.pv.l || []).filter(x => x.st).slice(-1)[0] || {};
    const et = Object.entries(c.m || {}).filter(x => x[1] > 5).map(x => x[0] + ' ' + Math.round(x[1])).join(', ');
    console.log(`${P.tour}  ${String(P.de).padEnd(7)}→ ${String(P.vers).padEnd(7)} ${String(P.pire).padStart(5)} ${String(P.sup50).padStart(4)} ${String(P.sup100).padStart(4)} ${String(P.medAvant).padStart(7)} ${String(P.trMx).padStart(10)} ${String(c.actif).padStart(12)} ${String(c.sousVoile != null ? c.sousVoile : c.duree).padStart(11)} ${String(c.pas || '').padStart(9)} ${String(c.pasMx || '').padStart(11)}   ${et}`);
    if (P.longues && P.longues.length) console.log('      images > 50 ms (t depuis le voile, ms) : ' + P.longues.map(x => x[0] + ':' + Math.round(x[1])).join(' '));
    if (P.trL && P.trL.length) console.log('      tranches de pré-bâti > 30 ms : ' + P.trL.map(x => x[1] + (x[2] ? ' ' + x[2] : '')).join(', '));
    if (P.pb && P.pb.pasLongs && P.pb.pasLongs.length) console.log('      pas du pré-bâti > 20 ms (PREB.pas) : ' + P.pb.pasLongs.map(x => x[0]).join(', '));
    if (P.scene) { let s = P.scene; try { if (typeof s === 'string') s = JSON.parse(s); } catch (e) {} console.log('      scène à l\'arrivée : ' + (s.err ? s.err : `${s.objets} objets · route ${s.route} · géométries ${s.geo} · tout ${s.tout}`)); }
    if (prof && P.profil && fs.existsSync(P.profil) && P.tp) {
      const pr = JSON.parse(fs.readFileSync(P.profil, 'utf8')), N = new Map(); for (const n of pr.nodes) N.set(n.id, n);
      const par = new Map(); for (const n of pr.nodes) for (const k of n.children || []) par.set(k, n.id);
      /* le temps du profil → performance.now() : on cale le début du profil sur P.t0 (horloges différentes : on se sert des images longues pour caler) */
      let t = pr.startTime; const T = []; for (let i = 0; i < pr.samples.length; i++) { t += pr.timeDeltas[i]; T.push(t); }
      /* calage : timeDeltas en µs ; le profil a démarré juste avant P.t0 (performance.now ms) */
      let off = P.t0 - pr.startTime / 1000;
      if (P.marque != null) for (let i = 0; i < pr.samples.length; i++) { let id = pr.samples[i], ok = false; while (id != null) { if (N.get(id).callFrame.functionName === '__marque') { ok = true; break; } id = par.get(id); } if (ok) { off = P.marque - T[i] / 1000; break; } }
      const fen = (P.longues || []).map(L => ['image', P.tp + L[0] - L[1], P.tp + L[0], L[0], L[1]]).concat((P.trL || []).map(x => ['tranche de pré-bâti', x[0], x[0] + x[1], x[0] - P.tp, x[1]]));
      for (const F of fen) {
        const t0 = F[1], t1 = F[2], L = [F[3], F[4]], quoi = F[0]; const inc = new Map(), self = new Map(), rac = new Map(); let n = 0;
        for (let i = 0; i < pr.samples.length; i++) { const tm = T[i] / 1000 + off; if (tm < t0 || tm > t1) continue; n++;
          let id = pr.samples[i]; const vus = new Set(); const nd = N.get(id); const nm0 = nd.callFrame.functionName || '(' + nd.callFrame.url.split('/').pop() + ')';
          self.set(nm0, (self.get(nm0) || 0) + 1);
          let r0 = ''; while (id != null) { const nd2 = N.get(id); const nm = nd2.callFrame.functionName; if (nm && nm !== '(root)') r0 = nm; if (CLES.includes(nm) && !vus.has(nm)) { vus.add(nm); inc.set(nm, (inc.get(nm) || 0) + 1); } id = par.get(id); } rac.set(r0, (rac.get(r0) || 0) + 1); }
        const dt = n ? L[1] / n : 0, fmt = m => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x[0] + ' ' + Math.round(x[1] * dt)).join(', ');
        console.log(`      ◦ ${quoi} ${Math.round(L[1])} ms à ${Math.round(L[0])} : ${n} échantillons · racines : ${fmt(rac)}\n        inclusif : ${fmt(inc)}\n        propre : ${fmt(self)}`);
      }
    }
  }
}
