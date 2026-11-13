/* LA CHARTE DES ROUTES, MESURÉE SUR L'ORBITE (2026-11-13) — passation/CHARTE-ROUTES.md (session « Supervision génération de routes ») : R1, R2, R3, R4, R5, R7, R8, R10 sur graines × paliers,
   à la vitesse du palier (vPalier). En attendant le banc juge commun (outils/banc-juge/juge.cjs) : mêmes définitions, lues dans la charte.
   node outils/banc-routes/charte-espace.cjs [paliers=0,10,20] [graines=1-8] [espace=v4] [detail=1]
   R1 : plus longue tenue où la tangente 3D reste dans un cône de 30° autour de sa direction d'entrée (s) · R2 : idem, cône de 8° · R3 : roulis de la dalle SUR L'HORIZON lissé sur 0,5 s
   (max, 95e centile, °/s) · R4 : temps max entre deux temps forts, modules par route · R5 : variété (modules nommés) · R7 : part de la route d'où un saut nitro (impulsion 21, gravité du vol
   d'orbite, haut du vol = la dalle si elle est couchée de plus de 25°, sinon le monde ; ±20° de lacet en l'air au plus) se repose sur la route devant, en moins de 4,6 s · R8 : part de la route
   à plus de 90° de roulis, plus longue tenue · R10 : contacts. */
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const q=[];if(arg('espace'))q.push('espace='+arg('espace'));const B=require('./charge.cjs').creer(q.length?'?'+q.join('&'):'');const V3=B.ctx.THREE.Vector3;
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-8').split('-').map(Number),detail=arg('detail')==='1';
const SPD=.48,GI=33*1.45*.5,IMP=21,DEMI=28,SOUS={'envers-entree':1,'envers-sortie':1}; /* la faille à l'envers compte pour UN module (sa faille) */
const pct=function(a,p){if(!a.length)return 0;const b=a.slice().sort(function(x,y){return x-y;});return b[Math.min(b.length-1,Math.floor(p*b.length))];};
const tous=[];
for(const p of PAL){const RT=[];
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl,N=r.N,n=Q.length,vw=r.vw;const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const L=S[n-1];
    const T=[];for(let i=0;i<n;i++)T.push(new V3().subVectors(Q[Math.min(n-1,i+1)],Q[Math.max(0,i-1)]).normalize());
    /* R1, R2 */
    const cone=function(deg){const c=Math.cos(deg/57.2958);let m=0;for(let i=0;i<n;i++){let j=i;while(j+1<n&&T[j+1].dot(T[i])>=c)j++;m=Math.max(m,(S[j]-S[i])/vw);}return m;};
    const r1=cone(30),r2=cone(8);
    /* R3 : le roulis sur l'horizon, lissé sur 0,5 s */
    const bk=function(i){const t=T[i],ux=-t.y*t.x,uy=1-t.y*t.y,uz=-t.y*t.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz);if(ul<.2)return null;const U9=new V3(ux/ul,uy/ul,uz/ul),C9=new V3().crossVectors(U9,N[i]);return Math.atan2(C9.dot(t),U9.dot(N[i]));};
    const bks=[];for(let i=0;i<n;i++)bks.push(bk(i));const rates=[];
    for(let i=0;i<n;i++){let j=i;while(j+1<n&&S[j]-S[i]<.5*vw)j++;if(j===i||bks[i]==null||bks[j]==null)continue;let d=bks[j]-bks[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;rates.push(Math.abs(d)/((S[j]-S[i])/vw)*57.2958);}
    const r3m=rates.length?Math.max.apply(null,rates):0,r3p=pct(rates,.95);
    /* R4, R5 */
    const mk0=(r.marks||[]).filter(function(m){return m.fig;}).map(function(m){return {nom:m.fig,a:S[Math.max(0,m.i0)],b:S[Math.min(n-1,m.i1)]};}).sort(function(x,y){return x.a-y.a;}),mk=[];for(const m of mk0){if(m.nom==='envers-entree'){mk.push({nom:'faille-envers',a:m.a,b:m.b});continue;}if(SOUS[m.nom]||m.nom==='faille-envers'){const p9=mk[mk.length-1];if(p9&&p9.nom==='faille-envers')p9.b=m.b;else if(m.nom==='faille-envers')mk.push(m);continue;}mk.push(m);} /* la faille à l'envers = UN module, de son entrée à sa sortie */
    let gap=mk.length?mk[0].a/vw:L/vw;for(let k=1;k<mk.length;k++)gap=Math.max(gap,(mk[k].a-mk[k-1].b)/vw);if(mk.length)gap=Math.max(gap,0);
    const noms=mk.map(function(m){return m.nom;});let rep=0;for(let k=1;k<noms.length;k++)if(noms[k]===noms[k-1])rep++;const cnt={};for(const x of noms)cnt[x]=(cnt[x]|0)+1;const maxN=Math.max.apply(null,[0].concat(Object.values(cnt)));
    /* R7 : le saut nitro de chaque point (tous les ~40 m, hors départ et arrivée tenus) */
    let nS=0,nOk=0,nRef=0;const vc=vw/SPD;
    for(let i=0;i<n-1;i++){if(S[i]<450||S[i]>L-500)continue;if(i&&Math.floor(S[i]/40)===Math.floor(S[i-1]/40))continue;nS++;
      const t9=T[i],ux=-t9.y*t9.x,uy=1-t9.y*t9.y,uz=-t9.y*t9.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz)||1,couche=uy<.04||(N[i].x*ux+N[i].y*uy+N[i].z*uz)/ul<.906;
      if(!couche&&N[i].y>.5&&t9.y>.12){nRef++;continue;} /* espSautRefuse : une dalle à l'endroit qui monte de plus de 7° */
      const U=couche?N[i].clone():new V3(0,1,0),P=Q[i].clone().addScaledVector(N[i],.6),Vv=t9.clone().multiplyScalar(vc).addScaledVector(N[i],IMP);
      let yaw=0,jc=i,ok=false;const h=1/30,yawMax=20/57.2958;
      for(let t=h;t<4.6;t+=h){Vv.addScaledVector(U,-GI*h);
        let bj=-1,bd=1e12;for(let j=jc;j<Math.min(n,jc+40);j++){const dd=P.distanceToSquared(Q[j]);if(dd<bd){bd=dd;bj=j;}}if(bj<0)break;if(bj>jc+3)jc=bj-3;
        const Bj=new V3().crossVectors(T[bj],N[bj]).normalize(),D=new V3().subVectors(P,Q[bj]),hh=D.dot(N[bj]),la=D.dot(Bj);
        if(t>.25&&hh<=.3&&hh>-6&&Math.abs(la)<DEMI&&bj>i){ok=true;break;}
        if(hh<-30&&Math.abs(la)<DEMI*3)break;
        /* le pilote vise la route : il tourne vers la ligne médiane devant lui, au plus ±20° en tout */
        if(yaw<yawMax&&Math.abs(la)>2){const aim=new V3().copy(Q[Math.min(n-1,bj+2)]).sub(P);aim.addScaledVector(U,-aim.dot(U));const vh=Vv.clone().addScaledVector(U,-Vv.dot(U));
          if(aim.lengthSq()>1&&vh.lengthSq()>1){const sg=Math.sign(new V3().crossVectors(vh,aim).dot(U)),rate=1.5*(1.15+Math.min(.9,Vv.length()*.004)),da=Math.min(rate*h,yawMax-yaw,Math.acos(Math.max(-1,Math.min(1,vh.normalize().dot(aim.normalize())))));if(da>1e-4){Vv.applyAxisAngle(U,sg*da);yaw+=da;}}}
        P.addScaledVector(Vv,h*SPD);}
      if(ok)nOk++;}
    const r7=nS?nOk/nS:0;
    /* R8 */
    let env=0,eT=0,eM=0;for(let i=0;i<n-1;i++){const b9=bks[i],inv=b9!=null&&Math.abs(b9)>Math.PI/2,ds=S[i+1]-S[i];if(inv){env+=ds;eT+=ds/vw;eM=Math.max(eM,eT);}else eT=0;}
    const info=r.info||{};
    RT.push({g:g,noms:noms,r1:r1,r2:r2,r3m:r3m,r3p:r3p,r4:gap,nM:noms.length,rep:rep,maxN:maxN,r7:r7,ref:nS?nRef/nS:0,r8:env/L,r8t:eM,r10:info.contacts|0});
    if(detail)console.log('g'+g,'p'+p,'R1',r1.toFixed(1),'R2',r2.toFixed(1),'R3',r3m.toFixed(0)+'/'+r3p.toFixed(0),'R4',gap.toFixed(1)+' s',noms.length+' mod','R5 répét.',rep,'max/route',maxN,'R7',(r7*100).toFixed(0)+'% (refusés '+(nS?nRef/nS*100:0).toFixed(0)+'%)','R8',(env/L*100).toFixed(0)+'% '+eM.toFixed(1)+' s','R10',info.contacts|0,'·',noms.join(' '));}
  /* R5 entre graines voisines */
  const part=[];for(let k=1;k<RT.length;k++){const a=new Set(RT[k-1].noms),b=new Set(RT[k].noms);let c=0;for(const x of a)if(b.has(x))c++;part.push(c/Math.max(1,Math.min(a.size,b.size)));}
  const diff=new Set();for(const x of RT)for(const y of x.noms)diff.add(y);
  const mx=function(k){return Math.max.apply(null,RT.map(function(x){return x[k];}));},mn=function(k){return Math.min.apply(null,RT.map(function(x){return x[k];}));},moy=function(k){return RT.reduce(function(a,x){return a+x[k];},0)/RT.length;};
  console.log('palier',p,'· R1 pire',mx('r1').toFixed(1)+' s (moy '+moy('r1').toFixed(1)+')','· R2 pire',mx('r2').toFixed(1)+' s (moy '+moy('r2').toFixed(1)+')','· R3 max',mx('r3m').toFixed(0)+'°/s, p95 pire',mx('r3p').toFixed(0)+'°/s',
    '· R4 trou max',mx('r4').toFixed(1)+' s, modules min',mn('nM'),'· R5 répétitions',RT.reduce(function(a,x){return a+x.rep;},0),'max même module/route',mx('maxN'),'voisines partagent max',(Math.max.apply(null,[0].concat(part))*100).toFixed(0)+'%','différents',diff.size,
    '· R7 min',(mn('r7')*100).toFixed(0)+'% (moy '+(moy('r7')*100).toFixed(0)+'%, refusés moy '+(moy('ref')*100).toFixed(0)+'%)','· R8 max',(mx('r8')*100).toFixed(0)+'% tenue max '+mx('r8t').toFixed(1)+' s','· R10',RT.reduce(function(a,x){return a+x.r10;},0));
  tous.push(RT);}
