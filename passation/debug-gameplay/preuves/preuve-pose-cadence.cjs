/* PREUVE PG-01 : le verdict de pose (PARFAIT si |vN| < 4,5 ; POSÉ LOURD si >= 10 ; perte landLoss ∝ impact) dépend de la cadence.
   Code : boucle-3-physique.js:296 (gravité ajoutée à fallVel AVANT le pas), :387 (fallPos += fallVel*dtF*SPD) ;
   demi-tour.js:404 (pose DÉCLARÉE à la 1re image où hOff < 3) puis :443 `impact=Math.abs(vN)` lu à CETTE image, et :517-519 (verdict).
   La caisse franchit le plan des 3 m à un instant quelconque ENTRE deux images : la déclaration arrive τ ∈ [0, dtF) plus tard, et entre-temps
   la gravité a ajouté gN·τ à |vN| (la vitesse est EXACTE en Euler semi-implicite : v(t)=v0−g·t, seul l'instant de lecture change).
   Donc impact = |vN au passage| + gN·τ, τ uniforme sur [0, 1/cadence). Biais moyen gN/(2·cadence). */
const FALL_G=33*1.45; // son/curseurs.js:219 (GRAV_K = 1.45)
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
console.log('gravité du vol FALL_G =',FALL_G.toFixed(2),'(réacteur bleu : ×0,25 ; orange : ×0,4)');
for(const [nom,k] of [['sans nitro',1],['réacteur orange',.4],['réacteur bleu',.25]]){
  console.log(`\n== ${nom} : biais moyen ajouté à |vN| (fenêtre PARFAIT = 4,5)`);
  for(const f of [120,60,30,20])console.log(`  ${String(f).padStart(3)} i/s : +${(FALL_G*k/(2*f)).toFixed(2)}  (jusqu'à +${(FALL_G*k/f).toFixed(2)})`);}
console.log('\n== une approche donnée : |vN| = 4,0 au passage des 3 m, sans nitro — part des phases jugées PARFAIT');
for(const f of [120,60,30,20]){const tauMax=(4.5-4)/FALL_G;console.log(`  ${String(f).padStart(3)} i/s : ${Math.round(100*Math.min(1,tauMax*f))} %`);}
console.log('\n== approches tirées au hasard, |vN| au passage uniforme sur [2 ; 8] (sans nitro) : PARFAIT / LOURD (sur [8 ; 12])');
const R=rnd(4242),N=200000,A={},B={};for(const f of [120,60,30,20]){A[f]=0;B[f]=0;}
const C={};for(const f of [60,30,20])C[f]=0;
for(let j=0;j<N;j++){const v=2+6*R(),w=8+4*R(),ph=R();
  for(const f of [120,60,30,20]){const tau=ph/f;if(v+FALL_G*tau<4.5)A[f]++;if(w+FALL_G*tau>=10)B[f]++;}
  for(const f of [60,30,20]){const tau=ph/f,tc=tau*Math.min(1,(1/60)*f);if(v+FALL_G*tc<4.5)C[f]++;}}
for(const f of [120,60,30,20])console.log(`  ${String(f).padStart(3)} i/s : PARFAIT ${(100*A[f]/N).toFixed(1)} %   LOURD ${(100*B[f]/N).toFixed(1)} %`);
console.log('\n== avec le correctif proposé (τ ramené à la loi de 60 i/s : τ·min(1, (1/60)/dtF)) — PARFAIT');
for(const f of [60,30,20])console.log(`  ${String(f).padStart(3)} i/s : ${(100*C[f]/N).toFixed(1)} %  (60 i/s inchangé au bit près : facteur 1)`);
