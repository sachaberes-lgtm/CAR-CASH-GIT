const R=require('../../../../../bot/ressemblance.js');
const M=R.joueurs?R.joueurs('clavier'):null;
console.log(Object.keys(R));
if(M){console.log('parties',M.length);
const ref=R.reference(M);for(const k in ref)console.log(k,ref[k]&&ref[k].m.toFixed(3),ref[k]&&ref[k].s.toFixed(3),ref[k]&&ref[k].n);
/* leave-one-out */
const Z=M.map((m,i)=>R.ecart(null,{mesures:[m],reference:R.reference(M.filter((_,j)=>j!==i))}).ecart);console.log('LOO',Z.join(' '));}
