/* PREUVE PG-02 : en VOL, les heurts de décor sont testés en UN point par image (boucle-3-physique.js:574-581 : foretHeurt, grotteHeurt,
   banqHeurt, jadeHeurt, canyonHeurt, dunesHeurt, sol vitré, villeHeurt sur fallPos). Un obstacle de rayon efficace R traversé en ligne
   droite à une distance d de son axe n'est vu que si un point d'image tombe dans la corde 2·sqrt(R²−d²). Pas d'image = v·dtF (m, monde :
   fallPos += fallVel·dtF·SPD ; v monde en m/s = km/h affichés / 3,6, voir speedKmh = volH(fallVel)·3,6·SPD).
   Rayons : séquoia de la forêt, segments du fût r = 17·…·0,6 × 1,04 (foret-decor.js:12-14) + 1,2 de marge (foret-construction.js:512) → la
   cime ≈ 1,8 m, le haut du fût ≈ 5,8 m ; pilier de jade : q[2]+1 ; pic du glacier « rayon 5 m au sol » (glacier-construction.js:22). */
function pRate(R,step){ // proba qu'une traversée (décalage d uniforme sur [0,R], phase uniforme) passe ENTRE deux images
  let s=0;const N=4000;for(let i=0;i<N;i++){const d=R*(i+.5)/N,c=2*Math.sqrt(R*R-d*d);s+=Math.max(0,1-c/step);}return s/N;}
console.log('traversées NON vues (en % des passages qui touchent) :');
console.log('R (m) | km/h  |  60 i/s | 30 i/s | 20 i/s');
for(const R of [1.8,3,5.8])for(const kmh of [300,600,1000,1500]){const v=kmh/3.6;
  console.log(`${String(R).padStart(5)} | ${String(kmh).padStart(5)} | ${(100*pRate(R,v/60)).toFixed(1).padStart(6)} | ${(100*pRate(R,v/30)).toFixed(1).padStart(6)} | ${(100*pRate(R,v/20)).toFixed(1).padStart(6)}`);}
console.log('\navec le sous-échantillonnage proposé (n = ceil(dtF·60) points par image) : le pas retombe à v/60 → la colonne 60 i/s pour toutes les cadences.');
