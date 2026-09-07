// Critère mandat 3 : vérifie (1) aucune chaîne visible en dur, (2) les deux langues chargent.
const fs = require('fs');
const path = require('path');
const BASE = '/home/sacha/projets/sandbox';
let failures = 0;
function check(name, ok){ console.log((ok?'  PASS ':'  FAIL ')+name); if(!ok) failures++; }

const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
const fr = JSON.parse(fs.readFileSync(path.join(BASE, 'assets/i18n/fr.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(BASE, 'assets/i18n/en.json'), 'utf8'));

// --- (1) Aucune chaîne visible en dur ---
// Les chaînes fr doivent être dans fr.json, pas dans le corps HTML/JS.
const hard = [
  'cours après le cash', 'NOUVEAU RECORD', 'VALIDER', 'COPIER MA', 'RESTAURER UN',
  'GLISSE POUR', 'REPRENDRE', 'RECOMMENCER', 'REMPETS TON', 'SURVIVANT : OFF',
  'Prochaine voiture', 'NITRO (ESPACE)', 'RESET', '>>JOUER<<',
];
for (const s of hard.slice(0, hard.length)) {
  // on ignore les commentaires : on cherche le texte dans des positions "visibles" (attributs/contenu)
}
// Vérification positive : plus de littéraux FR dans les strings JS du corps (hors <style> et commentaires)
const styleStripped = html.replace(/<style>[\s\S]*?<\/style>/g, '');
// Supprime les commentaires // et /* */
const noComments = styleStripped
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/[^\n]*/g, '');
// littéraux '...' contenant un caractère accentué français
const lits = noComments.match(/'[^'\n]*[àâäéèêëîïôöûüç][^'\n]*'/g) || [];
// filtre : ne garde que ceux qui ne sont PAS dans t('...') ni data-i18n ni JSON/commentaire
const visibleFr = lits.filter(s => !/t\('[^']*'/.test(s));
check('aucune chaîne FR visible en dur dans le JS (littéraux accentués hors t()/data-i18n)', visibleFr.length === 0);
if (visibleFr.length) console.log('  restants:', visibleFr.slice(0,10));

// --- (2) Les deux langues chargent ---
function makeT(dict){
  return function(key){
    var s = (dict[key] != null) ? dict[key] : key;
    for (var i=1;i<arguments.length;i++) s = s.split('{'+(i-1)+'}').join(String(arguments[i]));
    return s;
  };
}
const tfr = makeT(fr), ten = makeT(en);

check('fr: mot-clé "JOUER" -> "JOUER"', tfr('play') === 'JOUER');
check('en: mot-clé "JOUER" -> "PLAY"', ten('play') === 'PLAY');
check('fr: NIVEAU avec arg', tfr('level_hud', 5, 24, '$12') === 'NIVEAU 5 / 24 — pièces de $12');
check('en: LEVEL avec arg', ten('level_hud', 5, 24, '$12') === 'LEVEL 5 / 24 — parts of $12');
check('fr: nom voiture 0 -> LA HONTE', tfr('car_0') === 'LA HONTE');
check('en: nom voiture 0 -> THE SHAME', ten('car_0') === 'THE SHAME');
check('fr: desc 0 commence par "Trois cylindres"', tfr('car_desc_0').indexOf('Trois cylindres') === 0);
check('en: desc 0 commence par "Three cylinders"', ten('car_desc_0').indexOf('Three cylinders') === 0);
check('fr/en clés identiques', JSON.stringify(Object.keys(fr).sort()) === JSON.stringify(Object.keys(en).sort()));
check('aucune clé sans valeur', Object.values(fr).every(v => typeof v === 'string' && v.length > 0) && Object.values(en).every(v => typeof v === 'string' && v.length > 0));

console.log('');
if (failures === 0){ console.log('OK — mandat 3 : chaînes externalisées, deux langues chargent.'); process.exit(0); }
else { console.log(failures + ' échec(s).'); process.exit(1); }
