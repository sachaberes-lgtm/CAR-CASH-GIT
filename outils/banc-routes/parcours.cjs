/* LE PARCOURS CARTE POSTALE (2026-11-13, voir code/maps/nuages-parcours.js) : la route des nuages, mesurée — route par route puis la moyenne par palier.
   node parcours.cjs [paliers=0,10,20,27] [graines=1-12] [detail=1]     · SEARCH="?parcours=0" : la route d'avant · SEARCH="?tableau=spirale" : un seul tableau
   VIRAGE   : le cap cumulé en plan (°/km) · droit : la part de la route à moins de 1,5° de cap par 100 m, qui ne plonge pas (> −40°) et dont la pente ne change pas (< 3°/100 m) · droiteMax : la plus longue tenue « droite » (s de croisière)
   PENTE    : la descente moyenne (°) · plat : |assiette| < 6° · raide : piqué de plus de 40° · monte : assiette > 3° · pMax : le piqué le plus fort (°)
   ROULIS   : envers (normale y < −0,5) · tranche (|y| < 0,5) · contacts : deux dalles qui se touchent (tordContacts) · refus : les tableaux que pisteTord n'a pas pu jouer (trop près du départ ou de l'arrivée)
   TABLEAUX : dans chaque zone de tableau — chute : le piqué le plus fort · tours : le cap cumulé (spirale) · envers : la normale la plus basse (voltige) · pont : le vide le plus petit
             entre la route et elle-même dans la zone (m) · ss : les fenêtres sans saut (nombre, longueur moyenne en m) */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),vm=require('vm'),V3=B.ctx.THREE.Vector3;
const PAL=(arg('paliers')||'0,10,20,27').split(',').map(Number),[g0,g1]=(arg('graines')||'1-12').split('-').map(Number),DET=!!arg('detail');
const deg=x=>x*57.2958,moy=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
const vus={};
for(const pal of PAL){const A={};const ajoute=(k,v)=>{(A[k]=A[k]||[]).push(v);};let nC=0,nRef=0,nR=0,err=0;
  for(let g=g0;g<=(g1||g0);g++){let r;try{r=B.piste('nuages',g,pal);}catch(e){err++;console.log('p'+pal,'g'+g,'ERREUR',e.stack.split('\n').slice(0,3).join(' | '));continue;}
    nR++;const Q=r.ctrl,N=r.N,n=Q.length,I=r.info||{},vC=Math.max(70,70+(B.ctx.lvPiste()-1)*100),d=vm.runInContext('NUA_PC.der',B.ctx)||{};
    const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const L=S[n-1];
    /* le cap en plan et l'assiette, par pas */
    let cap=0,Ld=0,run=0,runMax=0,plat=0,raide=0,monte=0,pMax=0,env=0,tr=0;const H=[],Pt=[];
    for(let i=0;i<n-1;i++){const d9=new V3().subVectors(Q[i+1],Q[i]),l=d9.length();H.push(Math.atan2(d9.x,d9.z));Pt.push(Math.asin(Math.max(-1,Math.min(1,d9.y/Math.max(1e-6,l)))));}
    for(let i=1;i<n-1;i++){const l=S[i+1]-S[i];let da=H[i]-H[i-1];while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
      const hz=Math.cos(Pt[i]);cap+=Math.abs(da)*(hz>.2?1:0);const k=Math.abs(da)*57.3/Math.max(1,l)*100;
      const dp=Math.abs(Pt[i]-Pt[i-1])*57.3/Math.max(1,l)*100; /* la pente qui change (°/100 m) : une crête, un creux */
      if(k<1.5&&hz>.2&&deg(Pt[i])>-40&&dp<3){Ld+=l;run+=l;if(run>runMax)runMax=run;}else run=0; /* « droit » : ni virage, ni plongée (> 40°), ni crête — ce qu'on vit comme du tout droit */
      const p=deg(Pt[i]);if(Math.abs(p)<6)plat+=l;if(p<-40)raide+=l;if(p>3)monte+=l;if(-p>pMax)pMax=-p;
      if(N){if(N[i].y<-.5)env+=l;else if(Math.abs(N[i].y)<.5)tr+=l;}}
    const descente=deg(Math.asin((Q[0].y-Q[n-1].y)/L));
    const o={L:L,s:L/vC,virKm:deg(cap)/(L/1000),droit:Ld/L,droiteMax:runMax/vC,descente:descente,plat:plat/L,raide:raide/L,monte:monte/L,pMax:pMax,env:env/L,tranche:tr/L};
    for(const k in o)ajoute(k,o[k]);
    if(I.contacts)nC++;const ref=(I.zones||[]).filter(z=>!z[5]);nRef+=ref.length;
    /* les tableaux */
    const marks=r.marks||[],tab=[];
    for(const m of marks){if(!m.fig)continue;const f=m.fig.replace('nu-','');vus[f]=(vus[f]||0)+1;const a=Math.max(0,m.i0),b=Math.min(n-1,m.i1);let ch=0,ny=1,capZ=0;
      for(let i=a;i<b;i++){ch=Math.max(ch,-deg(Pt[i]));if(N)ny=Math.min(ny,N[i].y);if(i>a){let da=H[i]-H[i-1];while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;capZ+=da;}}
      let vide=1e9;if(f==='pont'||f==='spirale'){for(let i=a;i<=b;i+=2)for(let j=i+12;j<=b;j+=2){const dx=Q[j].x-Q[i].x,dz=Q[j].z-Q[i].z;if(dx*dx+dz*dz<70*70)vide=Math.min(vide,Math.abs(Q[j].y-Q[i].y)-0);}}
      const ss=m.ss?m.ss.length:0;
      tab.push(f+'['+Math.round((S[b]-S[a])/vC)+'s'+(ch>45?' chute '+Math.round(ch)+'°':'')+(Math.abs(capZ)>5.5?' '+(Math.abs(deg(capZ))/360).toFixed(1)+'tr':'')+(ny<-.5?' envers':'')+(vide<1e9?' vide '+Math.round(vide)+'m':'')+(ss?' ss'+ss:'')+']');
      if(f==='spirale'||f==='pont')ajoute('vide_'+f,vide);if(f==='voltige'||f==='grand-huit'||f==='toboggan'||f==='rideau'||f==='plafond')ajoute('chute_'+f,ch);}
    if(DET)console.log('p'+pal,'g'+g,'L',Math.round(L),'('+Math.round(L/vC)+' s)','prog',d.prog,'| vir',o.virKm.toFixed(0)+'°/km','droit',(o.droit*100).toFixed(0)+'%','droiteMax',o.droiteMax.toFixed(1)+'s',
      '| desc',o.descente.toFixed(1)+'°','plat',(o.plat*100).toFixed(0)+'%','raide',(o.raide*100).toFixed(0)+'%','monte',(o.monte*100).toFixed(0)+'%','pMax',o.pMax.toFixed(0)+'°',
      '| env',(o.env*100).toFixed(0)+'%','| essai',I.essai,'contacts',I.contacts,'refus',ref.map(z=>z[0]).join(',')||0,'portNy',I.portailNy,'\n     ',tab.join(' '));}
  console.log('PALIER '+pal+' · '+nR+' routes'+(err?' · '+err+' ERREURS':'')+' | L '+Math.round(moy(A.L||[]))+' ('+Math.round(moy(A.s||[]))+' s) | VIRAGE '+moy(A.virKm||[]).toFixed(0)+'°/km, droit '+(moy(A.droit||[])*100).toFixed(0)+'%, droiteMax '+moy(A.droiteMax||[]).toFixed(1)+'s (pire '+Math.max(0,...(A.droiteMax||[0])).toFixed(1)+') | PENTE '+moy(A.descente||[]).toFixed(1)+'°, plat '+(moy(A.plat||[])*100).toFixed(0)+'%, raide '+(moy(A.raide||[])*100).toFixed(0)+'%, monte '+(moy(A.monte||[])*100).toFixed(0)+'%, pMax '+moy(A.pMax||[]).toFixed(0)+'° | envers '+(moy(A.env||[])*100).toFixed(1)+'% tranche '+(moy(A.tranche||[])*100).toFixed(0)+'% | contacts '+nC+'/'+nR+' refus '+nRef+
    (A.vide_spirale?' | vide spirale min '+Math.round(Math.min(...A.vide_spirale)):'')+(A.vide_pont?' | vide pont min '+Math.round(Math.min(...A.vide_pont))+' moy '+Math.round(moy(A.vide_pont)):'')+
    ['voltige','grand-huit','toboggan','rideau','plafond'].map(f=>A['chute_'+f]?' | chute '+f+' '+Math.round(moy(A['chute_'+f]))+'°':'').join(''));}
console.log('tableaux vus :',JSON.stringify(vus));
