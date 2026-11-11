/* LA DESCENTE ET LES RACCOURCIS (2026-11-11, Sacha : « ça ne descend pas assez — le but du jeu est aussi de s'envoler pour prendre des raccourcis ») : par carte × palier, sur N graines.
   node descente.cjs [cartes=nuages,espace] [paliers=0,10] [graines=1-12] [detail=1]     · cartes : nuages, espace, ville, crypto (2026-11-11, LA DESCENTE DES VILLES)
   ⚠ ce banc ne voit NI les tours NI les parois : en ville, ses raccourcis hors des modules saut / grandsaut finissent dans une tour — la preuve est dans le vrai jeu (raccourcis-page.js)     · SEARCH="?torsion=hasard" (ou autre) pour comparer
   pente : (y départ − y arrivée) / longueur, en % (règle : ≥ 4 %) · milieu : la même, sans les 600 m du départ ni de l'arrivée · montée : part de la longueur qui monte de plus de 2 %
   rac/km : les raccourcis rentables par km (banc raccourcis.cjs : sortie par le bord, gain ≥ 150 m, pose à ±55°, vol ≤ 6 s ; règle : ≥ 0,6) · robustes : ceux qui marchent à 3 vitesses sur 4
   gros : la part des routes qui ont un raccourci de 400 m ou plus · figs : les modules marqués */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),R=require('./raccourcis.cjs');
const CARTES=(arg('cartes')||'nuages,espace').split(','),PAL=(arg('paliers')||'0,10').split(',').map(Number),[g0,g1]=(arg('graines')||'1-12').split('-').map(Number);
for(const c of CARTES)for(const pal of PAL){const A={pente:[],mil:[],mont:[],rac:[],rob:[],gros:0,n:0,figs:{},L:[]};
  for(let g=g0;g<=(g1||g0);g++){const r=B.piste(c,g,pal);r.espace=c==='espace';const Q=r.ctrl,n=Q.length;A.n++;
    const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const L=S[n-1];let mont=0,ia=0,ib=n-1;
    for(let i=1;i<n;i++){if(S[i]<600)ia=i;if(S[i]<L-600)ib=i;}
    for(let i=4;i<n;i+=4){const ds=S[i]-S[i-4];if((Q[i].y-Q[i-4].y)/ds>.02)mont+=ds;}
    const a=R.analyse(r),s=R.resume(r,a);
    A.pente.push((Q[0].y-Q[n-1].y)/L*100);A.mil.push((Q[ia].y-Q[ib].y)/Math.max(1,S[ib]-S[ia])*100);A.mont.push(mont/L);A.rac.push(s.parKm);A.rob.push(s.robustes);if(s.gainMax>=400)A.gros++;A.L.push(L);
    for(const m of r.marks)if(m.fig)A.figs[m.fig]=(A.figs[m.fig]||0)+1;
    if(arg('detail'))console.log(c,'p'+pal,'g'+g,'L',Math.round(L),'pente',A.pente[A.pente.length-1].toFixed(1)+'%','milieu',A.mil[A.mil.length-1].toFixed(1)+'%','montée',(mont/L*100).toFixed(0)+'%','rac',s.raccourcis,'('+s.parKm+'/km) robustes',s.robustes,'gainMax',s.gainMax,'|',r.marks.map(m=>m.fig||'-').join(','),'|',s.seaux.map(o=>{const mk=r.marks.find(m=>o.i>=m.i0&&o.i<=m.i1);return Math.round(o.s)+':'+Math.round(o.gain)+(mk&&mk.fig?'('+mk.fig+')':'');}).join(' '));}
  const m=a=>(a.reduce((x,y)=>x+y,0)/Math.max(1,a.length));
  console.log(c.padEnd(7),'p'+String(pal).padEnd(3),'n',A.n,'| L',Math.round(m(A.L)),'| pente',m(A.pente).toFixed(1)+'%','milieu',m(A.mil).toFixed(1)+'%','montée',(m(A.mont)*100).toFixed(0)+'%','| rac/km',m(A.rac).toFixed(2),'robustes/route',m(A.rob).toFixed(2),'gros',A.gros+'/'+A.n,'|',JSON.stringify(A.figs));}
