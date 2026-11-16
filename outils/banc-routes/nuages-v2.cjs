/* LES NUAGES, LA GRANDE DESCENTE (2026-11-12, Sacha : « une inclinaison globale de 30 degrés en moyenne, 35 même ; pas de grand demi-tour ; une vingtaine de petits modules ») : la route des nuages, mesurée.
   node nuages-v2.cjs [paliers=0,10,20] [graines=1-12] [detail=1]      · SEARCH="?sans=nuagesv2" : la route d'avant · SEARCH="?module=balcon" : un seul module · SEARCH="?pentenu=0.7"
   pente   : asin(dénivelé / longueur), en degrés — sur toute la route, puis sans les 4 s du départ et de l'arrivée (milieu) · pMax : la pente la plus forte (lissée sur ~60 m) · >50 : la part au-delà de 50°
   cap     : l'écart le plus grand du cap (en plan) à l'axe du départ, en degrés · recul : la part de la route qui REVIENT en arrière le long de l'axe · avance : distance à vol d'oiseau / longueur en plan
   modules : le nombre de petits modules (fig nu-…) et de sortes différentes par route, leur durée moyenne (s de croisière) · part : la part de la route dans un module · figs : les autres figures
   roulis  : la part hors de l'endroit (normale y < 0,5), le roulis le plus vif (°/s à la croisière) · contacts : deux dalles qui se touchent (pisteTordPropre) */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),V3=B.ctx.THREE.Vector3;
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),[g0,g1]=(arg('graines')||'1-12').split('-').map(Number);
const deg=x=>x*57.2958,moy=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
const sortes={};
for(const pal of PAL){const A={pente:[],mil:[],pMax:[],p50:[],cap:[],recul:[],avance:[],nMod:[],nSortes:[],dMod:[],part:[],hors:[],roulis:[],contacts:0,L:[],s:[],figs:{},mont:[]};
  for(let g=g0;g<=(g1||g0);g++){const r=B.piste('nuages',g,pal),Q=r.ctrl,N=r.N,n=Q.length,vC=Math.max(70,70+(B.ctx.lvPiste()-1)*100);
    const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const L=S[n-1];
    let ia=0,ib=n-1;for(let i=1;i<n;i++){if(S[i]<4*vC)ia=i;if(S[i]<L-4*vC)ib=i;}
    /* la pente lissée sur ~60 m, le cap en plan */
    const k=Math.max(1,Math.round(30/(L/n)));let pMax=0,n50=0,mont=0,capMax=0,recul=0,Lh=0;
    const ax=new V3().subVectors(Q[Math.min(n-1,4)],Q[0]);ax.y=0;ax.normalize();
    for(let i=k;i<n-k;i++){const d=new V3().subVectors(Q[i+k],Q[i-k]),l=d.length(),p=Math.asin(Math.max(-1,Math.min(1,-d.y/l)));if(p>pMax)pMax=p;if(p>50/57.2958)n50++;if(p<-.02)mont++;
      const h=new V3(d.x,0,d.z),lh=h.length();if(lh>1e-3){h.multiplyScalar(1/lh);const c=Math.acos(Math.max(-1,Math.min(1,h.dot(ax))));if(c>capMax)capMax=c;if(h.dot(ax)<0)recul++;}}
    for(let i=1;i<n;i++)Lh+=Math.hypot(Q[i].x-Q[i-1].x,Q[i].z-Q[i-1].z);
    const vol=Math.hypot(Q[n-1].x-Q[0].x,Q[n-1].z-Q[0].z);
    /* les modules */
    const mods=r.marks.filter(m=>m.fig&&m.fig.indexOf('nu-')===0),autres=r.marks.filter(m=>m.fig&&m.fig.indexOf('nu-')!==0),set={};let lm=0;
    for(const m of mods){set[m.fig]=1;sortes[m.fig]=(sortes[m.fig]||0)+1;lm+=S[Math.min(n-1,m.i1)]-S[Math.min(n-1,m.i0)];}
    for(const m of autres)A.figs[m.fig]=(A.figs[m.fig]||0)+1;
    /* le roulis */
    let hors=0,pointe=0;if(N)for(let i=1;i<n-1;i++){if(N[i].y<.5)hors++;const t=new V3().subVectors(Q[i+1],Q[i-1]).normalize(),a=new V3().copy(N[i-1]).addScaledVector(t,-N[i-1].dot(t)).normalize(),b=new V3().copy(N[i]).addScaledVector(t,-N[i].dot(t)).normalize();
      const w=Math.abs(Math.atan2(new V3().crossVectors(a,b).dot(t),a.dot(b)));pointe=Math.max(pointe,w/Math.max(1,S[i]-S[i-1])*vC);}
    const o={g:g,L:Math.round(L),s:Math.round(L/vC),pente:deg(Math.asin((Q[0].y-Q[n-1].y)/L)),mil:deg(Math.asin((Q[ia].y-Q[ib].y)/Math.max(1,S[ib]-S[ia]))),pMax:deg(pMax),p50:n50/n,cap:deg(capMax),recul:recul/n,avance:vol/Math.max(1,Lh),
      nMod:mods.length,nSortes:Object.keys(set).length,dMod:mods.length?lm/mods.length/vC:0,part:lm/L,hors:hors/n,roulis:deg(pointe),contacts:r.info?r.info.contacts:0,mont:mont/n};
    for(const q in o)if(A[q]&&Array.isArray(A[q]))A[q].push(o[q]);A.contacts+=o.contacts?1:0;
    if(arg('detail'))console.log('p'+pal,'g'+g,'L',o.L,'('+o.s+' s)','pente',o.pente.toFixed(1)+'°','milieu',o.mil.toFixed(1)+'°','pMax',o.pMax.toFixed(0)+'°','| cap',o.cap.toFixed(0)+'°','recul',(o.recul*100).toFixed(1)+'%','avance',o.avance.toFixed(2),
      '| modules',o.nMod,'('+o.nSortes+' sortes,',o.dMod.toFixed(1)+' s)','| hors',(o.hors*100).toFixed(0)+'%','roulis',o.roulis.toFixed(0)+'°/s','contacts',o.contacts,'essai',r.info&&r.info.essai,'|',r.marks.map(m=>(m.fig||'-').replace('nu-','')).join(' '));}
  const ng=(g1||g0)-g0+1;
  console.log('nuages p'+String(pal).padEnd(3),'n',ng,'| L',Math.round(moy(A.L)),'('+Math.round(moy(A.s))+' s)','| PENTE',moy(A.pente).toFixed(1)+'°','milieu',moy(A.mil).toFixed(1)+'°','pMax',moy(A.pMax).toFixed(0)+'° (pire '+Math.max.apply(null,A.pMax).toFixed(0)+'°)','>50°',(moy(A.p50)*100).toFixed(0)+'%','montée',(moy(A.mont)*100).toFixed(1)+'%',
    '| CAP',moy(A.cap).toFixed(0)+'° (pire '+Math.max.apply(null,A.cap).toFixed(0)+'°)','recul',(moy(A.recul)*100).toFixed(1)+'%','avance',moy(A.avance).toFixed(2),
    '| MODULES',moy(A.nMod).toFixed(1),'par route,',moy(A.nSortes).toFixed(1),'sortes,',moy(A.dMod).toFixed(1)+' s, part',(moy(A.part)*100).toFixed(0)+'%','| hors',(moy(A.hors)*100).toFixed(0)+'%','roulis',moy(A.roulis).toFixed(0)+'°/s','contacts',A.contacts+'/'+ng,'|',JSON.stringify(A.figs));}
console.log('sortes de modules vues :',Object.keys(sortes).length,JSON.stringify(sortes));
