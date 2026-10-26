/* LA GARDE DE SYNTAXE (2026-10-14, passe détail) — `node garde-syntaxe.js [dossier du jeu]` (par défaut : VERSION PRINCIPALE).
   Appelée par vercel-build.sh juste après la garde du burn-out. POURQUOI : le jeu est UN fichier de 5 Mo que plusieurs sessions
   fusionnent en même temps. Une accolade perdue dans une fusion, ou un marqueur de conflit git oublié, et le grand <script> meurt
   au PARSING : pas une ligne ne s'exécute, tous les joueurs reçoivent un écran noir — et la mise à jour toute seule les y amène.
   Ici la construction ÉCHOUE à la place : Vercel garde la version d'avant, rien n'est perdu (même principe que garde-burnout.sh).

   CE QUI FAIT ÉCHOUER (et rien d'autre) :
     1. un <script> inline de index.html que V8 refuse de compiler (le contrôle de `node --check`, fait ici sans fichier temporaire
        et avec le VRAI numéro de ligne dans index.html), ou un <script> jamais refermé (fichier tronqué) ;
     2. un marqueur de conflit git (`<<<<<<<`, `=======` seul sur sa ligne, `>>>>>>>`, `|||||||`) dans index.html, sw.js, sfx.js,
        le manifest, ou dans un script local que index.html charge ;
     3. sw.js, sfx.js ou un script local chargé par index.html qui ne compile pas ;
     4. un manifest.webmanifest qui n'est pas du JSON valide.
   CE QUI NE FAIT QU'AVERTIR : un script local introuvable, une icône du manifest absente, le jeton de version absent ou en double.
   JAMAIS BLOQUER POUR UNE RAISON D'OUTILLAGE : node trop vieux, erreur interne de cette garde → avertissement, et on publie.
   Publier quand même (on a VRAIMENT décidé) : GARDE_SYNTAXE=0 dans les variables de Vercel.
   Aucune dépendance : node seul. Durée : ~1 s. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process'), os = require('os');
const NOM = 'garde de syntaxe';
if (process.env.GARDE_SYNTAXE === '0') { console.log(NOM + ' : désactivée (GARDE_SYNTAXE=0)'); process.exit(0); }

const DIR = path.resolve(process.argv[2] || path.join(__dirname, 'VERSION PRINCIPALE'));
const rel = f => path.relative(process.cwd(), f) || f;
const erreurs = [], avert = [];
const court = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; };
const ligneDe = (txt, pos) => { let n = 1; for (let i = txt.indexOf('\n'); i >= 0 && i < pos; i = txt.indexOf('\n', i + 1)) n++; return n; };

/* --- 2. les marqueurs de conflit git : 7 signes en début de ligne, suivis d'un blanc ou de la fin de ligne (`=======` : seul).
   (les repères du jeu « <<<FLOW2>>> », « <<<VITRAIL>>> » n'ont que 3 signes et ne sont pas en début de ligne : jamais confondus) */
const RE_CONFLIT = /^(?:<{7}|>{7}|\|{7})(?=[ \t\r]|$).*$|^={7}\r?$/gm;
function conflits(fichier, txt) {
  RE_CONFLIT.lastIndex = 0; let m, n = 0;
  while ((m = RE_CONFLIT.exec(txt))) {
    if (++n <= 6) erreurs.push(rel(fichier) + ':' + ligneDe(txt, m.index) + ' — marqueur de conflit git « ' + court(m[0], 40) + ' »');
    if (m[0] === '') RE_CONFLIT.lastIndex++;
  }
  if (n > 6) erreurs.push(rel(fichier) + ' — … et ' + (n - 6) + ' autres marqueurs de conflit');
  return n;
}

/* --- 1 et 3. la compilation. Script classique : `new vm.Script` = le même analyseur que `node --check` (V8), en mode « script »
   comme dans le navigateur ; lineOffset/columnOffset → l'erreur porte la ligne de index.html. Module : `node --check` sur une copie .mjs. */
function dit(e, fichier) { // « fichier:ligne — message — …extrait… »
  const pile = String(e && e.stack || e).split('\n');
  const ou = (pile[0].match(/:(\d+)$/) || [])[1];
  let extrait = '';
  if (pile[2] && /^\s*\^+\s*$/.test(pile[2])) { const col = pile[2].indexOf('^'); extrait = ' — … ' + court(pile[1].slice(Math.max(0, col - 60), col + 60), 130) + ' …'; }
  return rel(fichier) + (ou ? ':' + ou : '') + ' — ' + court(e && e.message || e, 200) + extrait;
}
function compile(code, fichier, ligne0, col0, module) {
  if (module) {
    let tmp;
    try {
      tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'garde-syntaxe-')), 'module.mjs'); fs.writeFileSync(tmp, code);
      cp.execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe', timeout: 60000 });
    } catch (e) {
      const err = String(e && e.stderr || '');
      if (/SyntaxError/.test(err)) { const l = (err.match(/module\.mjs:(\d+)/) || [])[1]; erreurs.push(rel(fichier) + (l ? ':' + (+l + ligne0) : '') + ' — ' + court((err.match(/SyntaxError:[^\n]*/) || [err])[0], 200) + ' (module)'); }
      else avert.push(rel(fichier) + ' — module non vérifié (outillage : ' + court(e && e.message || e, 120) + ')');
    } finally { try { if (tmp) fs.rmSync(path.dirname(tmp), { recursive: true, force: true }); } catch (_) { } }
    return;
  }
  try { new vm.Script(code, { filename: fichier, lineOffset: ligne0, columnOffset: col0 }); }
  catch (e) { if (e && e.name === 'SyntaxError') erreurs.push(dit(e, fichier)); else throw e; }
}

/* --- le découpage de index.html, comme le fait le navigateur : un commentaire HTML ne contient pas de script (le mot « <script> »
   y est cité, l. ~2142), le contenu d'un <style> non plus (les feuilles citent « <style> » et « <script> » dans leurs commentaires),
   et un <script> court jusqu'au premier « </script » — ce qu'il contient (« <!-- », « <style> » dans une chaîne) est du script. */
function scriptsDe(h, fichier) {
  const liste = [], reOuvre = /<!--|<(script|style)(?=[\s>\/])/gi, reFerme = { script: /<\/script/gi, style: /<\/style/gi };
  let m;
  while ((m = reOuvre.exec(h))) {
    if (!m[1]) { const k = h.indexOf('-->', m.index + 4); if (k < 0) break; reOuvre.lastIndex = k + 3; continue; }
    const balise = m[1].toLowerCase();
    let k = reOuvre.lastIndex, q = ''; // la fin de la balise ouvrante (un « > » entre guillemets n'en est pas une)
    for (; k < h.length; k++) { const c = h[k]; if (q) { if (c === q) q = ''; } else if (c === '"' || c === "'") q = c; else if (c === '>') break; }
    const attrs = h.slice(reOuvre.lastIndex, k), debut = k + 1, re = reFerme[balise];
    re.lastIndex = debut; const f = re.exec(h), fin = f ? f.index : -1;
    if (balise === 'script') {
      const ligne = ligneDe(h, debut);
      if (fin < 0) { erreurs.push(rel(fichier) + ':' + ligne + ' — <script> jamais refermé (fichier tronqué ?)'); break; }
      liste.push({ attrs, code: h.slice(debut, fin), ligne, col: debut - (h.lastIndexOf('\n', debut - 1) + 1) });
    }
    if (fin < 0) break;
    reOuvre.lastIndex = fin + 2;
  }
  return liste;
}
const attr = (a, n) => { const m = new RegExp('(?:^|\\s)' + n + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(a); return m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : null; };

function garde() {
  const t0 = Date.now(), index = path.join(DIR, 'index.html');
  if (!fs.existsSync(index)) { erreurs.push(rel(index) + ' introuvable'); return ''; }
  const majeure = +process.versions.node.split('.')[0], syntaxeOk = majeure >= 18;
  if (!syntaxeOk) avert.push('node ' + process.versions.node + ' est trop vieux pour juger la syntaxe du jeu (il faut ≥ 18) : seuls les marqueurs de conflit et le manifest sont vérifiés');
  const h = fs.readFileSync(index, 'utf8');
  conflits(index, h);
  const scripts = scriptsDe(h, index); let inline = 0; const locaux = new Map(); // chemin → module ?
  for (const s of scripts) {
    const type = (attr(s.attrs, 'type') || '').toLowerCase(), src = attr(s.attrs, 'src');
    if (type && !/javascript|ecmascript|^module$/.test(type)) continue; // gabarit, JSON, shader… : pas du script
    if (src !== null) { if (!/^(?:[a-z]+:)?\/\//i.test(src) && !/^data:/i.test(src)) locaux.set(src.replace(/[?#].*$/, ''), type === 'module'); continue; }
    inline++;
    if (syntaxeOk) compile(s.code, index, s.ligne - 1, s.col, type === 'module');
  }
  if (!inline) erreurs.push(rel(index) + ' — aucun <script> inline trouvé (le jeu a disparu ?)');
  // les scripts que le jeu charge sans balise : le service worker, et ceux qu'il crée lui-même (import() = module)
  locaux.set('sw.js', false); if (!locaux.has('sfx.js')) locaux.set('sfx.js', false);
  let m; const reImp = /\bimport\(\s*['"]\.?\/?([^'"]+\.js)['"]\s*\)/g; while ((m = reImp.exec(h))) locaux.set(m[1], true);
  const reSrc = /\.src\s*=\s*['"]([^'"?#:]+\.js)[?'"]/g; while ((m = reSrc.exec(h))) if (!locaux.has(m[1])) locaux.set(m[1], false);
  let vus = 0;
  for (const [chemin, module] of locaux) {
    const f = path.join(DIR, decodeURIComponent(chemin));
    if (!fs.existsSync(f)) { avert.push(rel(f) + ' — chargé par le jeu mais absent de ce dossier'); continue; }
    const txt = fs.readFileSync(f, 'utf8'); vus++;
    conflits(f, txt);
    if (syntaxeOk) compile(txt, f, 0, 0, module);
  }
  // 4. le manifest
  const mf = path.join(DIR, (attr((/<link\b[^>]*\brel\s*=\s*["']?manifest["']?[^>]*>/i.exec(h) || [''])[0], 'href') || 'manifest.webmanifest').replace(/[?#].*$/, ''));
  if (!fs.existsSync(mf)) avert.push(rel(mf) + ' — manifest absent (le jeu ne sera pas installable)');
  else {
    const txt = fs.readFileSync(mf, 'utf8').replace(/^\uFEFF/, ''); conflits(mf, txt);
    try {
      const j = JSON.parse(txt);
      if (!j || typeof j !== 'object' || Array.isArray(j)) erreurs.push(rel(mf) + ' — le manifest n\'est pas un objet JSON');
      else for (const ic of Array.isArray(j.icons) ? j.icons : []) if (ic && typeof ic.src === 'string' && !/^(?:[a-z]+:)?\/\//i.test(ic.src) && !fs.existsSync(path.join(path.dirname(mf), ic.src))) avert.push(rel(mf) + ' — icône « ' + ic.src + ' » absente');
    } catch (e) { erreurs.push(rel(mf) + ' — JSON invalide : ' + court(e.message, 160)); }
  }
  // le jeton de la mise à jour toute seule : vercel-build.sh le remplace par l'empreinte du jeu (une seule occurrence attendue)
  const jetons = (h.match(/__CC_BUILD__/g) || []).length;
  if (jetons !== 1 && !/const CC_BUILD='[0-9a-f]{40}'/.test(h)) avert.push(rel(index) + ' — le jeton __CC_BUILD__ apparaît ' + jetons + ' fois (1 attendue : voir « LA MÊME VERSION POUR TOUT LE MONDE »)');
  return inline + ' <script> inline, ' + vus + ' scripts locaux, ' + h.split('\n').length + ' lignes, ' + (Date.now() - t0) + ' ms';
}

let bilan = '';
try { bilan = garde(); }
catch (e) { // une panne de la GARDE n'est pas une panne du JEU : on le dit, et on laisse publier
  console.log(NOM + ' : ⚠ erreur interne, NON VÉRIFIÉE (on publie quand même) — ' + court(e && e.stack || e, 400));
  process.exit(0);
}
for (const a of avert) console.log(NOM + ' : ⚠ ' + a);
if (erreurs.length) {
  console.log('\n  ✋ LE JEU NE SE CHARGERAIT PAS — publication refusée (' + erreurs.length + ' problème' + (erreurs.length > 1 ? 's' : '') + ') :\n' + erreurs.map(e => '    · ' + e).join('\n') + '\n' +
    '  Un script qui ne compile pas ou un marqueur de conflit git = écran noir pour tous les joueurs. Le site garde la version d\'avant.\n' +
    '  Réparer (souvent : une fusion à refaire en gardant les deux côtés), vérifier par `node garde-syntaxe.js`, puis repousser.\n' +
    '  Publier quand même (on a VRAIMENT décidé) : GARDE_SYNTAXE=0 dans les variables de Vercel.\n');
  process.exit(1);
}
console.log(NOM + ' : OK (' + bilan + ')');
