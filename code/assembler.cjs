#!/usr/bin/env node
/* L'ASSEMBLEUR DE CASH CAR (2026-10-19, Sacha : « découpe le code en plusieurs fichiers pour réduire les tokens »).
   VERSION PRINCIPALE/index.html = la concaténation EXACTE, octet pour octet, des morceaux listés dans code/ORDRE.txt.
   Rien n'est ajouté entre deux morceaux : un morceau est une tranche brute d'index.html (balises <style>/<script> comprises).

   node code/assembler.cjs                    synchronise, dans le bon sens :
                                                morceaux modifiés            → réécrit index.html
                                                index.html modifié à la main → redécoupe ses changements dans les morceaux
                                                les deux modifiés            → fusion à trois (base = HEAD), refus s'il y a conflit
   node code/assembler.cjs --verifier         dit seulement si index.html et les morceaux sont d'accord (sortie 0 / 1)
   node code/assembler.cjs --depuis-morceaux  force : index.html := morceaux
   node code/assembler.cjs --depuis-index     force : morceaux := index.html (les changements sont rangés dans le morceau où ils tombent) */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ICI = __dirname, RACINE = path.dirname(ICI);
const INDEX_REL = 'VERSION PRINCIPALE/index.html';
const INDEX = path.join(RACINE, INDEX_REL);
const arg = new Set(process.argv.slice(2));

const nomsDe = txt => txt.split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim()).filter(Boolean); // « chemin   # ce qu'il contient »
const egal = (a, b) => !!a && !!b && a.length === b.length && a.equals(b);
function lignes(buf) { // lignes AVEC leur \n (la dernière peut ne pas en avoir)
  const out = []; let d = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] === 10) { out.push(buf.subarray(d, i + 1)); d = i + 1; }
  if (d < buf.length) out.push(buf.subarray(d));
  return out;
}
function ecrit(f, buf) { const t = f + '.assemblage-tmp'; fs.writeFileSync(t, buf); fs.renameSync(t, f); }
function stop(msg) { console.error('⛔ ' + msg); process.exit(2); }

const noms = nomsDe(fs.readFileSync(path.join(ICI, 'ORDRE.txt'), 'utf8'));
for (const n of noms) if (!fs.existsSync(path.join(ICI, n))) stop(`ORDRE.txt cite code/${n}, qui n'existe pas.`);
const lus = () => noms.map(n => fs.readFileSync(path.join(ICI, n)));
let pieces = lus();
const A = Buffer.concat(pieces);
const I = fs.readFileSync(INDEX);

if (egal(A, I)) { console.log(`✔ index.html et les ${noms.length} morceaux sont d'accord (${I.length} octets).`); process.exit(0); }
if (arg.has('--verifier')) { console.error(`✘ index.html (${I.length} octets) ≠ morceaux assemblés (${A.length} octets) : lancer  node code/assembler.cjs`); process.exit(1); }

function git(args, entree) {
  const r = cp.spawnSync('git', args, { cwd: RACINE, input: entree, maxBuffer: 1 << 30 });
  if (r.error) return null;
  return r;
}
function tete() { // index.html et morceaux tels que HEAD les a
  const ordre = git(['show', 'HEAD:code/ORDRE.txt']);
  const noms0 = ordre && ordre.status === 0 ? nomsDe(ordre.stdout.toString('utf8')) : null;
  const objets = [INDEX_REL].concat(noms0 ? noms0.map(n => 'code/' + n) : []);
  const r = git(['cat-file', '--batch'], objets.map(o => 'HEAD:' + o).join('\n') + '\n');
  if (!r || r.status !== 0) return null;
  const out = r.stdout, res = []; let p = 0;
  for (let k = 0; k < objets.length; k++) {
    const fin = out.indexOf(10, p); const tetiere = out.subarray(p, fin).toString('utf8'); p = fin + 1;
    if (/ missing$/.test(tetiere)) { res.push(null); continue; }
    const taille = +tetiere.split(' ')[2]; res.push(out.subarray(p, p + taille)); p += taille + 1;
  }
  return { I: res[0], A: noms0 && res.slice(1).every(Boolean) ? Buffer.concat(res.slice(1)) : null };
}
function fusion3(base, nous, eux) { // git merge-file : nos morceaux + les changements d'index.html faits ailleurs
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'assemblage-'));
  const f = n => path.join(d, n);
  fs.writeFileSync(f('nous'), nous); fs.writeFileSync(f('base'), base); fs.writeFileSync(f('eux'), eux);
  const r = git(['merge-file', '-p', f('nous'), f('base'), f('eux')]);
  fs.rmSync(d, { recursive: true, force: true });
  if (!r || r.status !== 0) stop('index.html ET les morceaux ont changé, et leurs changements se chevauchent : fusion impossible. Garder un seul des deux côtés (git checkout), puis relancer.');
  return r.stdout;
}
function rapatrie(cible) { // range dans les morceaux les différences entre leur assemblage et `cible`
  const avant = Buffer.concat(pieces);
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'assemblage-'));
  fs.writeFileSync(path.join(d, 'a'), avant); fs.writeFileSync(path.join(d, 'b'), cible);
  const r = git(['diff', '--no-index', '--no-color', '--no-ext-diff', '-a', '-U0', path.join(d, 'a'), path.join(d, 'b')]);
  fs.rmSync(d, { recursive: true, force: true });
  if (!r || r.status > 1) stop('git diff a échoué : impossible de redécouper index.html.');
  const L = pieces.map(lignes), neuves = lignes(cible), touches = new Set();
  const blocs = [...r.stdout.toString('utf8').matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)]
    .map(m => ({ a: +m[1], b: m[2] === undefined ? 1 : +m[2], c: +m[3], dd: m[4] === undefined ? 1 : +m[4] }));
  for (const h of blocs.reverse()) { // de la fin vers le début : les positions d'avant restent justes
    const ajout = neuves.slice(h.c - 1, h.c - 1 + h.dd);
    let deb = h.b ? h.a - 1 : h.a; // indice global (0) de la 1re ligne ôtée, ou point d'insertion
    let reste = h.b, pose = false, cumul = 0;
    for (let k = 0; k < L.length; k++) {
      const n = L[k].length;
      const dedans = h.b ? (deb >= cumul && deb < cumul + n) : (deb === 0 ? k === 0 : deb > cumul && deb <= cumul + n);
      if (dedans) {
        const o = deb - cumul, ote = Math.min(reste, n - o);
        L[k] = L[k].slice(0, o).concat(pose ? [] : ajout, L[k].slice(o + ote)); pose = true; touches.add(noms[k]);
        reste -= ote; deb += ote;
        if (!reste) break;
      }
      cumul += n;
    }
    if (!pose) stop('un changement d\'index.html ne tombe dans aucun morceau : redécoupage abandonné, rien n\'est écrit.');
  }
  const neufs = L.map(l => Buffer.concat(l));
  if (!egal(Buffer.concat(neufs), cible)) stop('redécoupage incohérent : rien n\'est écrit.');
  neufs.forEach((b, k) => { if (!egal(b, pieces[k])) ecrit(path.join(ICI, noms[k]), b); });
  pieces = neufs;
  console.log(`↩ index.html → morceaux : ${[...touches].join(', ') || '(aucun)'}`);
}
function versIndex(buf) { ecrit(INDEX, buf); console.log(`→ index.html réécrit depuis les morceaux (${buf.length} octets).`); }

if (arg.has('--depuis-morceaux')) versIndex(A);
else if (arg.has('--depuis-index')) rapatrie(I);
else {
  const h = tete();
  if (!h) stop('pas de git ici : dire le sens avec --depuis-morceaux ou --depuis-index.');
  const morceauxTouches = !egal(A, h.A), indexTouche = !egal(I, h.I);
  if (!morceauxTouches) rapatrie(I); // quelqu'un a modifié index.html directement : les morceaux suivent
  else if (!indexTouche && (!h.A || egal(h.A, h.I))) versIndex(A); // le cas normal : on a modifié des morceaux
  else if (h.A && (!indexTouche || egal(h.A, h.I))) { // morceaux modifiés + index.html changé ailleurs : fusion à trois
    const M = fusion3(h.A, A, indexTouche ? I : h.I);
    rapatrie(M); versIndex(M);
  } else stop('index.html ET les morceaux ont changé depuis HEAD, sans base commune sûre. Garder un seul des deux côtés, puis relancer.');
}
const fin = Buffer.concat(lus());
if (!egal(fin, fs.readFileSync(INDEX))) stop('après synchronisation, index.html ≠ morceaux : à examiner.');
console.log(`✔ index.html et les ${noms.length} morceaux sont d'accord.`);
