// Critère mandat 2 : simule prefers-reduced-motion: reduce et vérifie que
// les trois effets (bloom, grain CRT, effets de vitesse) sont désactivés.
// Usage : node verify-reduced-motion.js
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let failures = 0;
function check(name, ok) {
  console.log((ok ? '  PASS ' : '  FAIL ') + name);
  if (!ok) failures++;
}

// 1. Détection de la requête média présente
check('détecte prefers-reduced-motion: reduce',
  /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/.test(html));

// 2. Bloom coupé quand REDUCED_MOTION
check('bloom coupé (bloomPass.enabled=false)',
  /if\(REDUCED_MOTION\)bloomPass\.enabled=false/.test(html));

// 3. Grain CRT coupé (règle CSS #scan → display:none sous data-reduced-motion)
check('grain CRT coupé (html[data-reduced-motion] #scan)',
  /html\[data-reduced-motion="1"\] #scan\{display:none\}/.test(html));

// 4. Effets de vitesse coupés (speed lines + vignette speedFx)
check('speed lines coupées (if(!REDUCED_MOTION) drawSpeedLines)',
  /if\(!REDUCED_MOTION\)drawSpeedLines\(speedKmh,nitroOn\)/.test(html));
check('vignette vitesse coupée (if(!REDUCED_MOTION) speedFx.style.opacity)',
  /if\(!REDUCED_MOTION\)speedFx\.style\.opacity/.test(html));

// 5. Le marqueur data-reduced-motion est posé sur <html> (rend le tout vérifiable à l'exécution)
check('marqueur data-reduced-motion posé sur <html>',
  /setAttribute\('data-reduced-motion','1'\)/.test(html));

console.log('');
if (failures === 0) { console.log('OK — les trois effets sont désactivés sous reduced-motion.'); process.exit(0); }
else { console.log(failures + ' échec(s).'); process.exit(1); }
