/* ===== SACRE, ETAPE C : LA REGLE D'AUJOURD'HUI, REFAITE (2026-11-27, l'etude « sacre ») =====
   La regle : 24 graines neuves, meneur et champion, note.comparer ; sacre si (a) dF > 2 se_dF, (b) dPalier > -se_dPalier, (c) dE < +se_dE.
   On mesure, pour un meneur qui vaut VRAIMENT delta paliers de plus que le champion (meme ressemblance), la part des validations qui sacrent.
   delta = 0 : le taux de faux sacres ; delta > 0 : la puissance ; delta < 0 : sacrer un MOINS BON (le vrai danger d'une cliquet).
   Quatre modeles de courses (commun.js) : 'evolution' (les vraies courses du 27/11, 900 s), 'bruit' (34 pilotes x 24 graines melanges),
   'gabarit' (un pilote reel par essai), et 'relecteur' : le modele de tests/relecture-statistique/d-sacre-nul.js (80 courses de 900 s de
   4 pilotes, chaque pilote tire une course entiere au hasard, plus un effet de graine commun N(0 ; 1,5)) pour retrouver ses 3,7 % et 12 %.
   Puis la multiplicite : sur 100 validations de pilotes egaux, combien de faux champions.
   usage : node c-sacre-actuel.js [essais=3000] > sorties/c-sacre-actuel.txt */
'use strict';
const path=require('path');
const S=require('./commun.js');
const essais=+(process.argv[2]||3000);
const rng=S.Gr.mulberry32(20261127);
const X=require(path.join(__dirname,'..','..','..','..','..','ml','ecurie','etude','selection-naturelle','bruit','courses-0.json'));
const reserve900=[];for(const x of X)if(x.tmax===900)for(const c of x.courses)reserve900.push({p:c.palier,v:S.vecteur(c.m||null)});
function paire(mod,T,delta){
  if(mod==='relecteur'){const A=[],B=[];for(let i=0;i<24;i++){const bg=Math.round(1.5*rng.normal()),x=reserve900[rng.entier(reserve900.length)],y=reserve900[rng.entier(reserve900.length)];
    A.push({p:x.p+bg+delta,v:x.v});B.push({p:y.p+bg,v:y.v});}return [A,B];}
  const R=T(rng);return [S.courses(R,delta,24,rng),S.courses(R,0,24,rng)];}
const DELTAS=[-1,-0.5,0,0.5,1,2,3];
const t0=Date.now();
const res={};
for(const mod of ['evolution','bruit','gabarit','relecteur']){
  const T=mod==='relecteur'?null:S.tireur(mod);res[mod]={};
  const lignes=[];
  for(const d of DELTAS){
    const n=d===0?essais*2:essais;let s=0,a=0,b=0,c=0;
    for(let t=0;t<n;t++){const [A,B]=paire(mod,T,d);const r=S.comparerRapide(A,B,{});if(r.sacre)s++;if(r.criteres.a)a++;if(r.criteres.b)b++;if(r.criteres.c)c++;}
    res[mod][d]=s/n;
    lignes.push('  vrai ecart '+(d>0?'+':'')+d+' palier : sacre '+S.pct(s,n).padStart(7)+' '+S.wilson(s,n)+' ; (a) '+S.pct(a,n)+', (b) '+S.pct(b,n)+', (c) '+S.pct(c,n)+' ('+n+' essais)');}
  console.log('== modele '+mod+' ==\n'+lignes.join('\n'));}
console.log('\n== la multiplicite : 100 validations de pilotes egaux (p = taux de faux sacres d\'une validation) ==');
for(const mod of Object.keys(res)){const p=res[mod][0];
  console.log('  '+mod.padEnd(10)+' p = '+(100*p).toFixed(1)+' % -> faux champions attendus sur 100 : '+(100*p).toFixed(1)+' ; au moins un : '+(100*(1-Math.pow(1-p,100))).toFixed(0)+' %');}
console.log('\n(duree '+((Date.now()-t0)/1000).toFixed(0)+' s)');
