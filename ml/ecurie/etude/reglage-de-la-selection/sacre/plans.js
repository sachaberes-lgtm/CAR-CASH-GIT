/* ===== SACRE : LES PLANS DE VALIDATION (2026-11-27, l'etude « sacre ») =====
   Un plan relit les « regards » d'une validation : L[k] = [dF, se_dF, dPalier, se_dPalier, dE, se_dE] sur les REG[k] premieres graines neuves
   (24, 36, … 96), et rend [sacre, graines jouees]. Le sacre demande (b) dPalier > -CB.se_dPalier et (c) dE < CC.se_dE au regard ou l'on sacre ;
   CB = CC = 1 aujourd'hui (note.comparer). Utilise par e-plans.js et f-population.js.
   - actuel        : 24 graines, z > 2 (la regle d'aujourd'hui) ; fixe-N-s : N graines, z > s
   - 2etages-s1-T-s2 : 24 graines ; si z <= s1, pas de sacre ; sinon on va a T graines en tout (T = 72 ou 96 : 48 ou 72 de plus), sacre si z > s2
     (sur l'ensemble des T graines). Variante « +direct » : z > 3 des 24 graines sacre tout de suite.
   - seq-h-l-Nmax  : sequentiel apparie, regards a 24, 36, 48, … Nmax : sacre des que z > h ; arret sans sacre des que z < l ; au plafond, sacre
     si z > h. Variante « OBF » (O'Brien-Fleming) : borne h_k = h x sqrt(Nmax / n_k) (exigeante au debut, plus douce a la fin). */
'use strict';
const REG=[24,36,48,60,72,84,96],ix=n=>REG.indexOf(n);
const z=x=>x[1]>0?x[0]/x[1]:(x[0]>0?Infinity:-Infinity);
let CB=1,CC=1;
const ok=(x,s)=>z(x)>s&&x[2]>-CB*x[3]&&x[4]<CC*x[5];
const P={};
P['actuel (24, z>2)']=L=>[ok(L[0],2),24];
P['fixe-24 z>2.33']=L=>[ok(L[0],2.33),24];
P['fixe-48 z>2']=L=>[ok(L[ix(48)],2),48];
P['fixe-96 z>2']=L=>[ok(L[ix(96)],2),96];
P['fixe-96 z>2.33']=L=>[ok(L[ix(96)],2.33),96];
for(const s1 of [0.5,1,1.5])for(const T of [72,96])for(const s2 of [2,2.33])for(const direct of [false,true]){
  P['2etages-'+s1+'-'+T+'-'+s2+(direct?' +direct':'')]=L=>{
    if(direct&&ok(L[0],3))return [true,24];
    if(!(z(L[0])>s1))return [false,24];
    return [ok(L[ix(T)],s2),T];};}
for(const Nmax of [72,96])for(const h of [2.2,2.4,2.6])for(const l of [0,0.5])
  P['seq-'+h+'-'+l+'-'+Nmax]=L=>{
    for(let k=0;k<REG.length&&REG[k]<=Nmax;k++){const x=L[k];if(ok(x,h))return [true,REG[k]];if(z(x)<l||REG[k]===Nmax)return [false,REG[k]];}
    return [false,Nmax];};
for(const h of [1.8,2.0,2.2])for(const l of [0,0.5])
  P['seqOBF-'+h+'-'+l+'-96']=L=>{
    for(let k=0;k<REG.length;k++){const x=L[k],hk=h*Math.sqrt(96/REG[k]);if(ok(x,hk))return [true,REG[k]];if(z(x)<l||REG[k]===96)return [false,REG[k]];}
    return [false,96];};
module.exports={P,REG,z,criteres:(b,c)=>{CB=b;CC=c;}};
