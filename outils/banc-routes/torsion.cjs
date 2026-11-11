/* LE BILAN DE TORSION (2026-11-11, LA TORSION EN MODULES) : par carte × palier, sur N graines — ce que le pilote subit en roulis.
   node torsion.cjs [cartes=nuages,espace] [paliers=0,10,20] [graines=1-30] [search="?torsion=hasard"] [detail=1]
   · figs      : les figures tirées (compte par nom, sur toutes les graines)
   · tors/route: le nombre de figures de torsion par route (mur, surf, couloir, tonneau, envers)
   · hors      : la part de la route où la dalle penche de plus de 60° (N.y < 0,5) · envers : N.y < −0,2
   · chemin    : les tours de roulis du CHEMIN par route (rho : tonneau, envers, rappels) — ce qui fait basculer le monde
   · derive    : l'écart le plus grand entre la pente de la route rendue et celle du plan (°) hors figures — la route qui part à la verticale
   · pointe    : le roulis le plus vif de la dalle (°/s à la croisière), sa médiane sur les graines
   · sens      : dans les figures couchées (mur, surf, couloir), la part des pas où la dalle penche bien vers l'INTÉRIEUR du virage
   · contacts  : les routes dont deux dalles se touchent */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=arg('search')?require('./charge.cjs').creer(arg('search')):require('./charge.cjs'),V3=B.ctx.THREE.Vector3;
const CARTES=(arg('cartes')||'nuages,espace').split(','),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),[g0,g1]=(arg('graines')||'1-30').split('-').map(Number);
const TORS={mur:1,surf:1,couloir:1,tonneau:1,envers:1,vague:1,ruban:1,survol:1,rase:1,velodrome:1};
for(const c of CARTES)for(const pal of PAL){const A={figs:{},tors:[],hors:[],envers:[],chemin:[],derive:[],pointe:[],sensOk:0,sensN:0,contacts:0,n:0,genres:{}};
  for(let g=g0;g<=(g1||g0);g++){const r=B.piste(c,g,pal),Q=r.ctrl,N=r.N,n=Q.length;if(!N)continue;A.n++;
    const fig=new Uint8Array(n);for(const m of r.marks)if(m.fig||m.g)for(let i=m.i0;i<=m.i1&&i<n;i++)fig[i]=1;
    let hors=0,env=0,pointe=0,derive=0,nt=0;const T=[];for(let i=0;i<n;i++)T.push(new V3().subVectors(Q[Math.min(n-1,i+1)],Q[Math.max(0,i-1)]).normalize());
    for(let i=1;i<n;i++){if(N[i].y<.5)hors++;if(N[i].y<-.2)env++;const ds=Q[i].distanceTo(Q[i-1]),t=T[i],a=new V3().copy(N[i-1]).addScaledVector(t,-N[i-1].dot(t)).normalize(),b=new V3().copy(N[i]).addScaledVector(t,-N[i].dot(t)).normalize();
      pointe=Math.max(pointe,Math.abs(Math.atan2(new V3().crossVectors(a,b).dot(t),a.dot(b)))/Math.max(1,ds)*r.vw);
      if(!fig[i])derive=Math.max(derive,Math.abs(Math.asin(Math.max(-1,Math.min(1,t.y))))*57.3);}
    for(const m of r.marks){if(m.fig){A.figs[m.fig]=(A.figs[m.fig]||0)+1;if(TORS[m.fig])nt++;}
      if(m.c)for(let i=m.i0+2;i<m.i1-2&&i<n-1;i++){const acc=new V3().subVectors(T[i+1],T[i-1]);if(acc.length()<.02)continue;const d=N[i].dot(acc.normalize());if(Math.abs(N[i].y)<.92){A.sensN++;if(d>0)A.sensOk++;}}}
    const gn=B.ctx.window.__phrase&&B.ctx.window.__phrase.genre;if(gn)A.genres[gn]=(A.genres[gn]||0)+1;
    A.tors.push(nt);A.hors.push(hors/n);A.envers.push(env/n);A.chemin.push(r.info.toursChemin!=null?r.info.toursChemin:r.info.tours);A.derive.push(derive);A.pointe.push(pointe*57.3);if(r.info.contacts)A.contacts++;
    if(arg('detail'))console.log(c,'p'+pal,'g'+g,gn||'',r.marks.map(m=>m.fig||'-').join(','),'tors',nt,'hors',(hors/n).toFixed(2),'envers',(env/n).toFixed(2),'chemin',A.chemin[A.chemin.length-1],'dérive°',derive.toFixed(0),'pointe°/s',(pointe*57.3).toFixed(0),'contacts',r.info.contacts,'essai',r.info.essai);}
  const m=a=>(a.reduce((x,y)=>x+y,0)/Math.max(1,a.length)).toFixed(2),mx=a=>Math.max.apply(null,a).toFixed(2),med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1].toFixed(0);
  console.log(c.padEnd(7),'p'+String(pal).padEnd(3),'n',A.n,'| tors/route',m(A.tors),'max',mx(A.tors),'| hors',m(A.hors),'envers',m(A.envers),'| chemin',m(A.chemin),'tours (max',mx(A.chemin)+')','| dérive',m(A.derive)+'°','(max',mx(A.derive)+')','| pointe',med(A.pointe)+'°/s','(max',mx(A.pointe)+')','| sens',A.sensN?(A.sensOk/A.sensN).toFixed(2):'-','| contacts',A.contacts,'|',JSON.stringify(A.genres),JSON.stringify(A.figs));}
