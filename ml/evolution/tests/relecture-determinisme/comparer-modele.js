/* relecture (determinisme) : applique en memoire les retouches de faire-pR.js a pilote-voltige.js, puis ecrit, ICI seulement, trois textes a comparer :
   pR.js (voltige + faire-pR), modele-temoin.js (genome temoin ecrit par ecrirePilote), voltige.js (copie). Rien d'ecrit ailleurs. */
'use strict';
const fs=require('fs'),path=require('path');
const ICI=__dirname,RAC=path.join(ICI,'..','..','..','..');
const re=(s,a,b)=>{if(!s.includes(a))throw new Error('introuvable '+a.slice(0,80));return s.replace(a,()=>b);};
const src=fs.readFileSync(path.join(RAC,'ml','ecurie','etude','selection-naturelle','outils-27nov','faire-pR.js'),'utf8');
/* on extrait les appels p=re(p,...) de faire-pR.js et on les rejoue (sans --diag, sans cle=val) */
const debut=src.indexOf('p=re(p,'),fin=src.indexOf('if(DIAG)');
const corps=src.slice(debut,fin);
let p=fs.readFileSync(path.join(RAC,'ml','ecurie','pilote-voltige.js'),'utf8');
p=(new Function('p','re',corps+'\nreturn p;'))(p,re);
fs.writeFileSync(path.join(ICI,'pR.js'),p);
fs.writeFileSync(path.join(ICI,'voltige.js'),fs.readFileSync(path.join(RAC,'ml','ecurie','pilote-voltige.js'),'utf8'));
const Gn=require(path.join(RAC,'ml','evolution','genome.js'));
const T=Gn.genomeTemoin();
const t=Gn.ecrirePilote(T);
fs.writeFileSync(path.join(ICI,'modele-temoin.js'),t);
console.log('CR dans le pilote ecrit :',/\r/.test(t),' longueur',t.length,' sha',Gn.shaPilote(t).slice(0,12));
for(const mot of ['Math.random','Date','require(','eval(','Function(','process','globalThis','setTimeout'])console.log('  interdit '+mot+' :',t.split(mot).length-1);
