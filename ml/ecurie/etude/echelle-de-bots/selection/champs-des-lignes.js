/* ===== CE QUE GARDENT LES LIGNES DES COURSES (28/11/2026, lecteur de la selection, etude « echelle de bots ») =====
   Lecture seule. Usage : node ml/ecurie/etude/echelle-de-bots/selection/champs-des-lignes.js <courses.jsonl> [...]
   Rend : les champs presents (part des lignes mesurees ou ils sont non nuls), les causes de fin, la loi du palier, la duree, les cles de mesures,
   de causesMorts et de declenchements. */
'use strict';
const fs=require('fs');
for(const f of process.argv.slice(2)){
  const L=fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x);}catch(e){return null;}}).filter(Boolean);
  const M=L.filter(l=>l.mesuree===true);
  const champs={};for(const l of M)for(const k of Object.keys(l))if(l[k]!=null)champs[k]=(champs[k]||0)+1;
  const compte=(A,fn)=>{const r={};for(const x of A){const v=fn(x);r[v]=(r[v]||0)+1;}return r;};
  const pal=M.map(l=>l.palier).filter(x=>typeof x==='number');
  const tm=compte(M,l=>l.tmax);
  const finAuBout=M.filter(l=>typeof l.survie_s==='number'&&l.survie_s>=l.tmax-1).length;
  const clesM={},clesC={},clesD={};
  for(const l of M){if(l.mesures)for(const k of Object.keys(l.mesures))clesM[k]=1;
    if(l.causesMorts)for(const k of Object.keys(l.causesMorts))clesC[k]=1;
    if(l.declenchements)for(const k of Object.keys(l.declenchements))clesD[k]=1;}
  const exC=M.find(l=>l.causesMorts);
  console.log('== '+f);
  console.log('lignes '+L.length+', mesurees '+M.length+', usages '+JSON.stringify(compte(L,l=>l.usage))+', tmax '+JSON.stringify(tm));
  console.log('champs non nuls (sur les mesurees) : '+Object.entries(champs).map(([k,n])=>k+' '+n).join(', '));
  console.log('cause de fin : '+JSON.stringify(compte(M,l=>l.cause)));
  console.log('morts par course : '+JSON.stringify(compte(M,l=>l.morts)));
  console.log('palier : min '+Math.min(...pal)+', max '+Math.max(...pal)+', loi '+JSON.stringify(compte(M,l=>l.palier)));
  console.log('courses allees jusqu\'a tmax : '+finAuBout+' / '+M.length);
  console.log('cles de mesures : '+Object.keys(clesM).join(' '));
  console.log('cles de causesMorts : '+Object.keys(clesC).join(' ')+(exC?' ; exemple '+JSON.stringify(exC.causesMorts):''));
  console.log('cles de declenchements : '+Object.keys(clesD).length+' ('+Object.keys(clesD).slice(0,30).join(' ')+')');
  console.log('chancePrise : '+JSON.stringify(compte(M,l=>JSON.stringify(l.chancePrise))));
}
