/* LIENS CASSÉS (2026-11-09, chasse) : tout chemin de fichier cité dans index.html, dans les .js/.css/.html du jeu et dans sw.js qui n'existe pas sur le disque.
   node liens-casses.cjs   (lit VERSION PRINCIPALE/). Les chemins construits à l'exécution (concaténations) ne sont pas vus : seulement les littéraux. */
const fs = require('fs'), path = require('path');
const RACINE = path.resolve(__dirname, '..', '..', 'VERSION PRINCIPALE');
const EXT = 'png|webp|jpg|jpeg|gif|svg|ico|mp3|m4a|ogg|wav|woff2|woff|ttf|js|json|css|html|webmanifest|glb|bin|txt|wasm';
const re = new RegExp('["\'`(=\\s]((?:\\./|/)?(?:[A-Za-z0-9_\\-]+/)*[A-Za-z0-9_\\-.]+\\.(?:' + EXT + '))(?=[?#"\'`)\\s;,])', 'g');
const fichiers = [];
(function marche(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!/^(node_modules|vendor|\.git)$/.test(e.name)) marche(p); } else if (/\.(html|js|css|webmanifest)$/.test(e.name) && fs.statSync(p).size < 25e6) fichiers.push(p); } })(RACINE);
const manquants = new Map();
for (const f of fichiers) {
  const base = path.dirname(f), txt = fs.readFileSync(f, 'utf8'); let m; re.lastIndex = 0;
  while ((m = re.exec(txt))) {
    let c = m[1]; if (/^(https?:|\/\/|data:)/.test(c) || /^\//.test(c) && !/^\/(assets|vendor|creatures|figures)/.test(c)) continue;
    if (!/\//.test(c) && !/\.(js|css|html|json|webmanifest|png|svg|ico)$/.test(c)) continue;
    if (/^(window|document|navigator|Math|this|self|e|a|b|c|d|el|i18n|I18N)\./.test(c)) continue;
    const cand = [path.resolve(base, c.replace(/^\//, '')), path.resolve(RACINE, c.replace(/^\.?\//, ''))];
    if (cand.some(p => fs.existsSync(p))) continue;
    const k = c; if (!manquants.has(k)) manquants.set(k, []); const l = manquants.get(k); if (l.length < 3) l.push(path.relative(RACINE, f) + ':' + txt.slice(0, m.index).split('\n').length);
  }
}
console.log(fichiers.length + ' fichiers lus, ' + manquants.size + ' chemin(s) introuvable(s) :');
for (const [k, l] of manquants) console.log(' - ' + k + '   ← ' + l.join(', '));
