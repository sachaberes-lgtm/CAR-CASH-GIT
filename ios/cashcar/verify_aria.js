// Critère mandat 4 : tout élément cliquable porte un label accessible.
const fs = require('fs');
const BASE = '/home/sacha/projets/sandbox';
const html = fs.readFileSync(BASE + '/index.html', 'utf8');
let failures = 0;
function check(name, ok){ console.log((ok?'  PASS ':'  FAIL ')+name); if(!ok) failures++; }

// extraire les attributs d'un id donné
function attrs(id){
  const m = html.match(new RegExp('<[^>]*id="'+id+'"[^>]*>'));
  return m ? m[0] : '';
}
function has(tag, needle){ return tag.indexOf(needle) !== -1; }

// Éléments interactifs attendus : chacun doit avoir aria-label (via data-i18n-aria) et/ou role.
const targets = [
  ['overlay',  'role="button"', 'aria-label'],
  ['splash',   'role="button"', 'aria-label'],
  ['goTxt',    'role="button"', 'aria-label'],
  ['tGear',    'role="button"', 'aria-label'],
  ['tSteer',   'role="button"', 'aria-label'],
  ['tLeft',    'role="button"', 'aria-label'],
  ['tRight',   'role="button"', 'aria-label'],
  ['tNitro',   'role="button"', 'aria-label'],
  ['resetBtn', 'aria-label',   'data-i18n-aria'],
  ['sndBtn',   'aria-label',   'data-i18n-aria'],
  ['voxBtn',   'aria-label',   'data-i18n-aria'],
  ['nameSave', 'aria-label',   'data-i18n-aria'],
  ['survBtn',  'aria-label',   'data-i18n-aria'],
  ['saveExp',  'aria-label',   'data-i18n-aria'],
  ['saveImp',  'aria-label',   'data-i18n-aria'],
];

for (const [id, ...needles] of targets) {
  const t = attrs(id);
  const ok = needles.every(n => t.indexOf(n) !== -1);
  check(id + ' : ' + needles.map(n=>n.replace(/"/g,'')).join(' + '), ok);
  if (!ok) console.log('    -> ' + t.slice(0,140));
}

// Rôles de navigation sur les conteneurs
check('ctrlRow a role="navigation"', /id="ctrlRow"[^>]*role="navigation"/.test(html));
check('saveRow a role="navigation"', /id="saveRow"[^>]*role="navigation"/.test(html));
check('tPanel a role="navigation"', /id="tPanel"[^>]*role="navigation"/.test(html));
check('touchCtl a role="group"', /id="touchCtl"[^>]*role="group"/.test(html));

// Le mini-apply remplit aria-label
check('remplissage aria-label au chargement', /setAttribute\('aria-label',t\(el\.getAttribute\('data-i18n-aria'\)\)\)/.test(html));

console.log('');
if (failures === 0){ console.log('OK — mandat 4 : tous les éléments cliquables ont un label accessible.'); process.exit(0); }
else { console.log(failures + ' échec(s).'); process.exit(1); }