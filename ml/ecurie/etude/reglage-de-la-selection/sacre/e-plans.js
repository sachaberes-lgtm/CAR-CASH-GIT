/* ===== SACRE, ETAPE E : LES PLANS DE VALIDATION, SUR LES MEMES TIRAGES (2026-11-27, l'etude « sacre ») =====
   Relit sorties/regards-<modele>.json (d-regards.js) : pour chaque essai, note.comparer sur 24, 36, … 96 graines neuves. z = dF / se_dF.
   Un plan dit, regard apres regard, s'il sacre, s'il s'arrete sans sacrer ou s'il ajoute des graines. Le sacre demande toujours (b) et (c) au
   regard ou l'on sacre (comme aujourd'hui).
   Les plans sont decrits dans plans.js.
   Pour chaque plan : la part des sacres par cas (d = vrai ecart de palier, e = vrai ecart de E), les graines jouees en moyenne (x2 = courses),
   et pour d = 0 la multiplicite sur 100 validations.
   usage : node e-plans.js [modele=evolution] > sorties/e-plans-<modele>.txt */
'use strict';
const fs=require('fs'),path=require('path');
const S=require('./commun.js');
const modele=process.argv[2]||'evolution';
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'sorties','regards-'+modele+'.json'),'utf8'));
const PL=require('./plans.js'),P=PL.P;
if(JSON.stringify(D.regards)!==JSON.stringify(PL.REG))throw new Error('regards differents de plans.js');

const cas=D.cas;
const nom=c=>'d'+(c.d>0?'+':'')+c.d+(c.e?' e'+(c.e>0?'+':'')+c.e:'');
function rapport(cb,cc,titre,complet){
PL.criteres(cb,cc);
const res={};
for(const [p,f] of Object.entries(P)){
  res[p]={};
  for(const c of cas){let s=0,g=0;for(const L of c.essais){const [a,n]=f(L);if(a)s++;g+=n;}res[p][nom(c)]={s,n:c.essais.length,g:g/c.essais.length};}}
const colonnes=['d-1','d-0.5','d0','d+0.5','d+1','d+2','d+3'];
console.log('\n\n########## CRITERES (b) ET (c) : '+titre+' ##########');
console.log('== modele '+modele+' : part des validations qui sacrent (vrai ecart de palier d, meme E) ; graines jouees en moyenne (d0 et d+1) ; courses = 2 x graines ==');
console.log('plan'.padEnd(30)+colonnes.map(c=>c.padStart(8)).join('')+'   graines d0  graines d+1  | faux champions sur 100 validations de pilotes egaux (attendus ; au moins un)');
const lignes=[];
for(const p of Object.keys(P)){
  const r=res[p],p0=r['d0'].s/r['d0'].n;
  lignes.push({p,txt:p.padEnd(30)+colonnes.map(c=>r[c]?(100*r[c].s/r[c].n).toFixed(1).padStart(8):'       -').join('')+
    r['d0'].g.toFixed(0).padStart(13)+r['d+1'].g.toFixed(0).padStart(13)+'  | '+(100*p0).toFixed(1)+' ; '+(100*(1-Math.pow(1-p0,100))).toFixed(0)+' %',p0,p1:r['d+1'].s/r['d+1'].n});}
if(complet)for(const l of lignes)console.log(l.txt);else for(const l of lignes.filter(l=>CLES.includes(l.p)))console.log(l.txt);
console.log('\nintervalles a 95 % (Wilson) pour quelques plans :');
for(const p of CLES)if(res[p])
  console.log('  '+p.padEnd(26)+colonnes.filter(c=>res[p][c]).map(c=>c+' '+S.wilson(res[p][c].s,res[p][c].n)).join(' '));
console.log('\n== la ressemblance : cas ou E bouge aussi (e > 0 : le meneur s\'eloigne des joueurs ; 4 x e est sa perte en F) ==');
const autres=cas.filter(c=>c.e!==0).map(nom);
console.log('plan'.padEnd(30)+autres.map(c=>c.padStart(14)).join(''));
for(const p of CLES)if(res[p])
  console.log(p.padEnd(30)+autres.map(c=>(100*res[p][c].s/res[p][c].n).toFixed(1).padStart(14)).join(''));
/* un classement : a faux champions par validation <= 1,5 %, la plus grande puissance a +1, puis le moins de graines */
console.log('\n== les plans a moins de 1,5 % de faux sacres (d0), classes par puissance a d+1 ==');
for(const l of lignes.filter(l=>l.p0<=0.015).sort((a,b)=>b.p1-a.p1).slice(0,12))console.log(l.txt);
return res;}
const CLES=['actuel (24, z>2)','fixe-24 z>2.33','2etages-1-96-2','2etages-1-96-2.33','2etages-0.5-96-2.33','seq-2.4-0.5-96','seq-2.6-0.5-96','seqOBF-2-0.5-96','seqOBF-2.2-0.5-96','fixe-96 z>2.33'];
const tout={c1:rapport(1,1,'a 1 se, comme aujourd\'hui',true),c2:rapport(2,2,'a 2 se (seulement les reculs nets)',true),sans:rapport(1e9,1e9,'aucun (le seul critere (a) sur F)',false)};
fs.writeFileSync(path.join(__dirname,'sorties','e-plans-'+modele+'.json'),JSON.stringify(tout));
