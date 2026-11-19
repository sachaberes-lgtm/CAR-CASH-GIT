// AVANT / APRÈS des bougies de l'AURA (lot « hudmort ») : lit les fin.png d'une passe à deux variantes (passe.sh, VARIANTES="defaut sans=hudmort")
// et fait, pour chaque mort, la planche zoomée ×4 (pixels de l'écran, deviceScaleFactor 3) du bas du graphe : en haut AVANT, en bas APRÈS,
// plus l'écran entier réduit. Les boîtes des bougies viennent d'etat.json (bougies).
//   node outils/banc-hudmort/avant-apres.cjs dossier-de-passe dossier-de-sortie [--z 4]
const fs = require('fs'), path = require('path');
const { lit, ecrit, coupe, reduit, planche } = require('./png.cjs');
const [, , DOS, SORT] = process.argv; const Z = +(process.argv[5] || 4);
fs.mkdirSync(SORT, { recursive: true });
const AV = path.join(DOS, 'sans=hudmort'), AP = path.join(DOS, 'defaut');
for (const m of fs.readdirSync(AP).filter(f => /^\d\d-/.test(f))) {
  const e = JSON.parse(fs.readFileSync(path.join(AV, m, 'etat.json'))), dsf = 3;
  const b = e.bougies.filter(x => x.cls); if (!b.length) continue;
  /* la boîte : des trois colonnes, du bas des chiffres des petites bougies à 14 px sous la ligne de base */
  const x0 = Math.min(...b.map(x => x.chiffre[0])) - 14, x1 = Math.max(...b.map(x => x.chiffre[0])) + 40, base = Math.max(...b.map(x => x.barre ? x.barre[1] + x.barre[3] : 0));
  const box = [Math.round(x0 * dsf), Math.round((base - 26) * dsf), Math.round((x1 - x0) * dsf), Math.round(36 * dsf)];
  const ia = lit(path.join(AV, m, 'fin.png')), ip = lit(path.join(AP, m, 'fin.png'));
  ecrit(path.join(SORT, m + '-zoom-avant.png'), coupe(ia, ...box, Z));
  ecrit(path.join(SORT, m + '-zoom-apres.png'), coupe(ip, ...box, Z));
  ecrit(path.join(SORT, m + '-avant-apres.png'), planche([coupe(ia, ...box, Z), coupe(ip, ...box, Z)], 1, 12));
  ecrit(path.join(SORT, m + '-ecran-avant-apres.png'), planche([reduit(ia, 3), reduit(ip, 3)], ia.w > ia.h ? 1 : 2, 8));
  console.log(m, 'boîte', box.join(','), 'avant', JSON.stringify(b.map(x => x.val + ':' + (x.barre ? x.barre[3] + 'px' : '—'))));
}
