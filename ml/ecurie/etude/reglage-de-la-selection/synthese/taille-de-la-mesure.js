#!/usr/bin/env node
/* ===== LA SYNTHESE : COMBIEN D'ENFANTS FAUT-IL POUR SAVOIR SI LES MUTATIONS COMPTENT ? (28/11/2026, la synthese) =====
   La question que les cinq etudes laissent ouverte : τ, l'ecart des effets VRAIS entre enfants (effets/ : 0,32 [0 ; 1,07]). Le test qui le
   mesure sans hypothese de forme : « moitie contre moitie » (effets/ § 1) — pour m enfants, la difference enfant − parent sur un premier lot
   de n graines et sur un second lot de n graines neuves ; leur correlation r sur les m enfants vaut, si les effets vrais ont l'ecart τ et le
   bruit d'une course l'ecart σ :  r(τ) = τ² / (τ² + s²/n), avec s² la variance d'UNE difference appariee enfant − parent par graine.
   Deux valeurs de s, toutes deux mesurees (effets/resultats.txt § 3) : 4,33 = enfant − son propre parent (le bruit des deux pilotes) ;
   3,26 = enfant juge contre une reference COMMUNE a tous (le meme temoin, ou le modele pilote + graine) : le bruit de la reference est alors
   le meme pour tous les enfants et ne change pas leur correlation.
   Precision : z de Fisher, erreur-type 1/√(m − 3). On cherche le m tel que l'ecart attendu entre τ = 0 (r = 0) et τ vise soit vu a
   2 erreurs-types 8 fois sur 10 (z(r)·√(m − 3) ≥ 1,96 + 0,84).
   CONTROLE A REPONSE CONNUE : reference commune, n = 12, τ = 1 doit redonner r ≈ 0,56 (le chiffre d'effets/ § 1) : 1/(1+10,63/12) = 0,53.
   Puis une simulation (mode « verifier ») : m enfants tires, r calcule, la part des tirages ou r depasse 1,96/√(m−3) doit etre ≈ 80 % au m trouve.
   Usage : node taille-de-la-mesure.js > sorties/taille-de-la-mesure.txt   (< 10 s, aucune course) */
'use strict';
let s=4.33;
const r=(tau,n)=>tau*tau/(tau*tau+s*s/n);
const zf=x=>0.5*Math.log((1+x)/(1-x));
function mNeces(tau,n){for(let m=4;m<20000;m++)if(zf(r(tau,n))*Math.sqrt(m-3)>=1.96+0.8416)return m;return Infinity;}
/* le generateur (mulberry32) et une loi normale */
function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const R=mb(161);
const nor=()=>{const u=R()+1e-12,v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
function corr(X,Y){const n=X.length;let mx=0,my=0;for(let i=0;i<n;i++){mx+=X[i];my+=Y[i];}mx/=n;my/=n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(X[i]-mx)*(Y[i]-my);sxx+=(X[i]-mx)**2;syy+=(Y[i]-my)**2;}return sxy/Math.sqrt(sxx*syy);}
function puissance(tau,n,m,essais){
  let ok=0;const seuil=Math.tanh(1.96/Math.sqrt(m-3));
  for(let e=0;e<essais;e++){
    const X=[],Y=[];
    for(let i=0;i<m;i++){const v=tau*nor();X.push(v+s/Math.sqrt(n)*nor());Y.push(v+s/Math.sqrt(n)*nor());}
    if(corr(X,Y)>seuil)ok++;
  }
  return ok/essais;
}
const L=[];
L.push('COMBIEN D\'ENFANTS POUR VOIR τ (moitie contre moitie, enfant − parent apparie, s = 4,33 par graine)');
s=3.26;L.push('controle : reference commune (s = 3,26), n = 12, τ = 1 -> r = '+r(1,12).toFixed(3)+' (effets/ § 1 attend ≈ 0,56 avec les erreurs-types reelles de chaque mutant)');
L.push('');
L.push('n graines par moitie | τ vise | r attendu | enfants m (2 erreurs-types, 8 fois sur 10) | courses en plus si on les jouait expres (m × 2n, parent deja joue) | puissance simulee a ce m (2 000 tirages)');
for(const sv of [3.26,4.33]){s=sv;L.push('--- s = '+s+(s===3.26?' : enfant juge contre une reference commune (le modele pilote + graine, ou le meme temoin pour tous)':' : enfant − son propre parent'));
for(const n of [8,12,24]){
  for(const tau of [0.3,0.5,0.7,1.0]){
    const m=mNeces(tau,n);
    L.push(String(n).padStart(20)+' | '+tau.toFixed(1).padStart(6)+' | '+r(tau,n).toFixed(3).padStart(9)+' | '+String(m).padStart(6)+' | '+String(m*2*n).padStart(7)+' | '+(m<=2000?puissance(tau,n,m,2000).toFixed(3):'(trop grand, non simule)'));
  }
}
}
L.push('');
L.push('Lecture : dans la vraie evolution (A, 12 graines), chaque enfant joue 12 graines a sa naissance et 12 neuves a la generation suivante');
L.push('(il ne peut pas etre renvoye avant) : la mesure moitie contre moitie est GRATUITE, 6 enfants par generation, jugee contre le modele');
L.push('pilote + graine (reference commune). A 8 graines (l\'economie), n = 8. Sous B4, la seconde moitie d\'un enfant n\'a plus que 4 graines');
L.push('(il est devenu un ancien) : la mesure ralentit (non chiffre ici : moities inegales).');
process.stdout.write(L.join('\n')+'\n');
