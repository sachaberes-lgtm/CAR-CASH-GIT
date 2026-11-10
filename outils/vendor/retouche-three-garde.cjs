/* ===== LA RETOUCHE DE three.min.js : LE GARDE DES PROGRAMMES (2026-11-10, Sacha : « aucun gel de plus de 120 ms en course ») =====
   node outils/vendor/retouche-three-garde.cjs [--verifier]
   Trois points de three r128 (minifié), tout-ou-rien ; relancer ne change rien (déjà retouché = dit et laissé).
   1. initMaterial (Pt) : avant de CRÉER un programme, `renderer.__ccBudget(clé du programme)` peut dire non → null (l'objet n'est pas dessiné cette image, le programme naîtra à la suivante).
   2. setProgram (It) : un programme pas encore lié (`renderer.__ccAttend(p)` faux) → null, sans lire ses uniformes (la lecture ATTEND la puce : c'est le gel).
   3. renderBufferDirect : null → l'objet n'est pas dessiné cette image.
   Sans `__ccBudget` / `__ccAttend` posés sur le moteur de rendu (hors course, ?garde=0), three se comporte exactement comme avant. Le jeu les pose dans interface/vignette-moteur.js (lierCourse). */
const fs = require('fs'), path = require('path');
const F = path.join(__dirname, '..', '..', 'VERSION PRINCIPALE', 'vendor', 'three.min.js');
let t = fs.readFileSync(F, 'utf8');
const R = [
  ['o.uniforms=et.getUniforms(t),t.onBuild(o,f),t.onBeforeCompile(o,f),h=et.acquireProgram(o,l),c.set(l,h),i.uniforms=o.uniforms;',
   '{if(void 0!==f.__ccBudget&&!f.__ccBudget(l))return null;o.uniforms=et.getUniforms(t),t.onBuild(o,f),t.onBeforeCompile(o,f),h=et.acquireProgram(o,l),c.set(l,h),i.uniforms=o.uniforms}'],
  ['let p=c.currentProgram;!0===u&&(p=Pt(n,e,i));let m=!1,g=!1,v=!1;',
   'let p=c.currentProgram;if(!0===u&&(p=Pt(n,e,i)),null===p)return c.__version=-1,null;if(void 0!==f.__ccAttend&&!0!==p.__ccPret&&!f.__ccAttend(p))return null;let m=!1,g=!1,v=!1;'],
  ['o=It(t,e,i,r);q.setMaterial(i,a);', 'o=It(t,e,i,r);if(null===o)return;q.setMaterial(i,a);'],
];
const fait = R.filter(([a, b]) => t.includes(b)).length;
if (fait === R.length) { console.log('three.min.js : garde déjà posé (3/3)'); process.exit(0); }
if (fait) { console.error('three.min.js : retouche PARTIELLE (' + fait + '/3) — fichier à reprendre à la main'); process.exit(1); }
for (const [a] of R) { const n = t.split(a).length - 1; if (n !== 1) { console.error('three.min.js : repère trouvé ' + n + ' fois (1 attendue) : ' + a.slice(0, 60)); process.exit(1); } }
if (process.argv.includes('--verifier')) { console.log('three.min.js : garde ABSENT, les 3 repères sont là'); process.exit(2); }
for (const [a, b] of R) t = t.replace(a, () => b);
fs.writeFileSync(F, t);
console.log('three.min.js : garde posé (3 points)');
