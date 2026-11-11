/* LE BILAN DE TORSION DE LA GROTTE (2026-11-11, LA TORSION EN MODULES) : node grotte-torsion.cjs palier graines(1-12)   · SEARCH="?torsion=hasard" pour la route d'avant
   par graine : les figures, la part hors de l'endroit (N.y < 0,5) et à l'envers (N.y < −0,2), le nombre de PASSAGES hors de l'endroit, le plus long (s), le roulis du chemin (tours),
   la pointe de roulis (°/s), la plus longue droite (s), les contacts. */
const G=require('./grotte.cjs'),V3=G.ctx.THREE.Vector3;
const [pal,gr]=process.argv.slice(2);const [g0,g1]=(gr||'1-12').split('-').map(Number);const A=[];
for(let g=g0;g<=g1;g++){const r=G.piste(g,pal||0);if(r.tordErr){console.log('graine',g,'ERREUR',r.tordErr);continue;}
  const Q=r.ctrl,N=r.N,n=Q.length,m=G.mesures({ctrl:r.ctrl0,vw:r.vw});let hors=0,env=0,pas=0,long=0,cur=0,pointe=0,L=0;
  for(let i=1;i<n;i++){const ds=Q[i].distanceTo(Q[i-1]);L+=ds;const t=new V3().subVectors(Q[Math.min(n-1,i+1)],Q[i-1]).normalize();
    if(N[i].y<.5){hors+=ds;if(!cur)pas++;cur+=ds;long=Math.max(long,cur);}else cur=0;if(N[i].y<-.2)env+=ds;
    const a=new V3().copy(N[i-1]).addScaledVector(t,-N[i-1].dot(t)).normalize(),b=new V3().copy(N[i]).addScaledVector(t,-N[i].dot(t)).normalize();
    pointe=Math.max(pointe,Math.abs(Math.atan2(new V3().crossVectors(a,b).dot(t),a.dot(b)))/Math.max(1,ds)*r.vw);}
  const o={g:g,s:Math.round(L/r.vw),figs:r.marks.filter(x=>x.fig).map(x=>x.fig).join(','),hors:+(hors/L).toFixed(2),envers:+(env/L).toFixed(2),passages:pas,longS:+(long/r.vw).toFixed(1),chemin:r.info.tours,pointe:Math.round(pointe*57.3),droiteS:+m.dMaxS.toFixed(1),contacts:r.info.contacts,conflits:r.conflits};
  A.push(o);console.log(JSON.stringify(o));}
const moy=k=>(A.reduce((a,x)=>a+x[k],0)/A.length).toFixed(2);
console.log('MOYENNE hors',moy('hors'),'envers',moy('envers'),'passages',moy('passages'),'le plus long (s)',moy('longS'),'chemin (tours)',moy('chemin'),'pointe °/s',moy('pointe'),'droite max (s)',moy('droiteS'),'contacts',moy('contacts'),'conflits',moy('conflits'));
