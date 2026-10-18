// LA PREUVE DES ÉCHANTILLONS vrais/ (2026-10-18) — node outils/preuve-vrais/rejoue.mjs [dossier VERSION PRINCIPALE]
// Rejoue, hors navigateur, CHAQUE musique du générateur que Pouce bleu peut tirer (la liste de pouce-bleu-jeu.js, avec ses retouches `direct`),
// note les échantillons « vrais/ » demandés, et écrit outils/vrais-jeu.json = { empreinte, fichiers }. publie-audio.cjs n'ôte de la copie
// publiée que les échantillons ABSENTS de cette liste, et seulement tant que l'empreinte colle encore (retouchez Pouce bleu : relancer).
// Contrôles en plus : deux rejeux donnent la même liste ; aucun fichier demandé ne manque sur le disque ; aucune composition en erreur.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { monde } from './harnais.mjs';
const ICI = path.dirname(fileURLToPath(import.meta.url));
const VP = path.resolve(process.argv[2] || path.join(ICI, '..', '..', 'VERSION PRINCIPALE'));
const DIRECT = VP + '/assets/audio/music/direct/';
const pa = createRequire(import.meta.url)('../publie-audio.cjs');
const L = pa.liste(VP).filter(e => e.type === 'genv');
const R = await import(pathToFileURL(DIRECT + 'retouches-bleu.js').href);
const V2 = R.V2 || [];
const W = monde(DIRECT);
const mods = {}, vus = [];
async function passe() {
  const tout = new Set();
  for (const E of L) {
    const f = pa.fichierVersion(E.v).split('/').pop();
    if (!/vrais/.test(fs.readFileSync(DIRECT + f, 'utf8'))) continue;       // ce générateur ne charge aucun échantillon
    const m = mods[f] || (mods[f] = await W.charge(f));
    const ret = V2.find(d => d.base === E.n && d.direct) || null, O = {};
    if (E.style) O.style = E.style; if (ret) { O.retouche = ret.retouche; O.voix = ret.voix; O.acc = ret.acc; }
    const inst = W.instance(m, E.da || undefined); inst._vide(); W.raz();
    const Mx = await inst._rejoue(E.n, E.g || undefined, Object.keys(O).length ? O : undefined);
    if (Mx._rates) throw new Error('composition en erreur : ' + E.id);
    const S = [...W.demandes()]; S.forEach(x => tout.add(x)); vus.push(E.id + ' ' + S.length);
  }
  return [...tout].sort();
}
const a = await passe(), b = await passe();
if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('deux rejeux différents : la composition n\'est pas déterministe');
if (W.ABSENTS.size) throw new Error('échantillons demandés mais absents du disque : ' + [...W.ABSENTS].join(' '));
const J = { empreinte: pa.empreinte(VP, pa.liste(VP)), genere: new Date().toISOString().slice(0, 10), morceaux: L.length, fichiers: a };
fs.writeFileSync(path.join(ICI, '..', 'vrais-jeu.json'), JSON.stringify(J) + '\n');
console.log(L.length + ' musiques du générateur rejouées deux fois (identiques) : ' + a.length + ' échantillons demandés → outils/vrais-jeu.json');
W.nettoie();
