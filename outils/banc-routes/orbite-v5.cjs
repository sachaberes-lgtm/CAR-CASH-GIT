/* L'ORBITE V5, LE RUBAN, AU BANC NODE (2026-11-13) — par palier, sur N graines : l'humeur des routes, leurs modules (et ceux que pisteTord refuse), les contacts (la route qui se touche),
   la part de la route hors de l'endroit / à l'envers, la pente moyenne, la plus longue « droite » vue de dessus (le cap y tourne de moins de 8°/s à la croisière : à toute vitesse un virage de 700 m de rayon se sent, en s de croisière) et sa part, l'écart de cap maximal à l'axe.
   node outils/banc-routes/orbite-v5.cjs [paliers=0,10,20] [graines=1-16] [orb=torsade] [espace=v4] [detail=1]
   Et (2026-11-13, Sacha : « pas de torsade trop serrée, pas plus de 10 secondes dans une même direction ») : la plus longue durée à tourner du même côté (s), le plus long tour de dalle
   d'affilée dans le même sens (s), le roulis le plus vif (°/s), la plus longue tenue à l'envers (s) — tout en s de croisière (à toute vitesse, moins).
   Règles visées : 0 zone refusée, 0 contact, aucune droite de plus de ~3 s hors des figures dessinées droites (faille, cascade, faille à l'envers), cap toujours < 90° de l'axe (hors looping),
   jamais plus de ~9 s du même côté ni ~8 s de roulis dans le même sens, roulis ≤ ~45°/s. */
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const q=[];if(arg('orb'))q.push('orb='+arg('orb'));if(arg('espace'))q.push('espace='+arg('espace'));
const B=require('./charge.cjs').creer(q.length?'?'+q.join('&'):'');
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-16').split('-').map(Number),detail=arg('detail')==='1';
const DROITS={faille:1,cascade:1,'faille-envers':1,boucle:1};
const V3=null; /* les figures dessinées droites en plan : leur relief est vertical */
const med=function(a){if(!a.length)return 0;const b=a.slice().sort(function(x,y){return x-y;});return b[b.length>>1];},mx=function(a){return a.length?Math.max.apply(null,a):0;};
for(const p of PAL){const A={sens:[],roul:[],rv:[],env9:[],L:[],nM:[],refus:0,contacts:0,essais:[],hors:[],env:[],pente:[],droite:[],partDroite:[],cap:[],figs:{},hum:{},climax:0,s:[]};
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl,N=r.N,n=Q.length,vw=r.vw*(1.8-.8*Math.min(1,p/25)),rP=40+.3*r.vw; /* (v5.3) les temps en secondes RÉELLES : la croisière × l'élan (DUREE_ELAN, 1,8 au palier 0 → 1 au palier 25) */
    const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const L=S[n-1];
    const info=r.info||{},z=info.zones||[],ref=z.filter(function(x){return !x[5];});
    let hors=0,env=0;for(let i=0;i<n;i++){if(N[i].y<.5)hors++;if(N[i].y<-.2)env++;}
    const pente=(Q[0].y-Q[n-1].y)/L;
    const ax=Math.atan2(Q[n-1].x-Q[0].x,Q[n-1].z-Q[0].z),hd=[];for(let i=1;i<n;i++)hd.push(Math.atan2(Q[i].x-Q[i-1].x,Q[i].z-Q[i-1].z));
    const dAng=function(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
    const enBoucle=new Uint8Array(n);for(const m of (r.marks||[]))if(m.fig==='boucle'||m.fig==='tour')for(let i=Math.max(0,m.i0);i<=Math.min(n-1,m.i1);i++)enBoucle[i]=1; /* le haut d'un looping repart en arrière par construction : hors de la mesure du cap */
    let capM=0;for(let i=0;i<hd.length;i++){const a=Math.abs(dAng(hd[i],ax))*57.2958;if(!enBoucle[i+1]&&S[i+1]>300&&S[i+1]<L-300&&a>capM)capM=a;}
    const marks=r.marks||[],inFig=new Uint8Array(n);for(const m of marks)if(m.fig&&DROITS[m.fig])for(let i=Math.max(0,m.i0);i<=Math.min(n-1,m.i1);i++)inFig[i]=1;
    let run=0,best=0,tot=0;const kMin=(8/57.2958)/vw;for(let i=2;i<hd.length;i++){const ds=S[i]-S[i-1],k9=Math.abs(dAng(hd[i-1],hd[i-2]))/Math.max(1,ds);
      if(k9<kMin&&!inFig[i]&&S[i]>500&&S[i]<L-500){run+=ds;tot+=ds;if(run>best)best=run;}else run=0;}
    /* LES DIRECTIONS (voir la règle plus haut) */
    let sR=0,tR=0,neu=0,sensM=0;for(let i=1;i<hd.length;i++){const ds=S[i+1]-S[i],y9=dAng(hd[i],hd[i-1])/Math.max(1,ds)*vw*57.2958,t9=ds/vw;if(enBoucle[i]){sR=0;tR=0;neu=0;continue;}
      if(Math.abs(y9)<3){neu+=t9;if(neu>=.8){sR=0;tR=0;}else tR+=t9;}else{const sg=y9>0?1:-1;neu=0;if(sg===sR)tR+=t9;else{sR=sg;tR=t9;}}if(tR>sensM)sensM=tR;}
    let rS=0,rT=0,rN=0,roulM=0,rvM=0,eT=0,envM=0;for(let i=0;i<n-1;i++){const ds=S[i+1]-S[i],t9=ds/vw,Ti=new B.ctx.THREE.Vector3().subVectors(Q[Math.min(n-1,i+1)],Q[Math.max(0,i-1)]).normalize(),c9=new B.ctx.THREE.Vector3().crossVectors(N[i],N[i+1]);
      const bk=function(j,t){const ux=-t.y*t.x,uy=1-t.y*t.y,uz=-t.y*t.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz);if(ul<.2)return null;const U9=new B.ctx.THREE.Vector3(ux/ul,uy/ul,uz/ul),C9=new B.ctx.THREE.Vector3().crossVectors(U9,N[j]);return Math.atan2(C9.dot(t),U9.dot(N[j]));}, /* L'INCLINAISON SUR L'HORIZON (le roulis qu'on voit) : une route qui descend en virage fait tourner le repère de la caisse autour de son axe (lacet × sin pente) sans pencher l'horizon */
        Tj=new B.ctx.THREE.Vector3().subVectors(Q[Math.min(n-1,i+2)],Q[i]).normalize(),b0=bk(i,Ti),b1=bk(i+1,Tj); /* chaque point avec SA tangente */let db9=b0==null||b1==null?0:b1-b0;while(db9>Math.PI)db9-=2*Math.PI;while(db9<-Math.PI)db9+=2*Math.PI;
      const rr=db9/Math.max(1,ds)*vw*57.2958;void c9;if(!enBoucle[i]&&Math.abs(rr)>rvM)rvM=Math.abs(rr);
      if(enBoucle[i]||Math.abs(rr)<6){rN+=t9;if(rN>=.6){rS=0;rT=0;}}else{const sg=rr>0?1:-1;rN=0;if(sg===rS)rT+=t9;else{rS=sg;rT=t9;}if(rT>roulM)roulM=rT;}
      if(N[i].y<-.5&&!enBoucle[i]){eT+=t9;if(eT>envM)envM=eT;}else eT=0;}
    A.sens.push(sensM);A.roul.push(roulM);A.rv.push(rvM);A.env9.push(envM);
    const figs=marks.filter(function(m){return m.fig;}).map(function(m){return m.fig+'@'+Math.round(S[Math.min(n-1,Math.max(0,m.i0))]);});
    for(const m of marks)if(m.fig){A.figs[m.fig]=(A.figs[m.fig]|0)+1;if(m.climax)A.climax++;}
    const hum=(B.ctx.__orbe&&B.ctx.__orbe.humeur)||'?';A.hum[hum]=(A.hum[hum]|0)+1;
    A.L.push(L);A.nM.push(figs.length);A.refus+=ref.length;A.contacts+=info.contacts|0;A.essais.push(info.essai);A.hors.push(hors/n);A.env.push(env/n);A.pente.push(pente);A.droite.push(best/vw);A.partDroite.push(tot/L);A.cap.push(capM);A.s.push(L/vw);
    if(detail)console.log('g'+g,'p'+p,hum,'L',Math.round(L),'('+Math.round(L/vw)+' s)','pente',(pente*100).toFixed(0)+'%','hors',(hors/n*100).toFixed(0)+'%','envers',(env/n*100).toFixed(0)+'%','droite max',(best/vw).toFixed(1)+' s','cap max',capM.toFixed(0)+'°','même côté',sensM.toFixed(1)+' s','roulis',roulM.toFixed(1)+' s',rvM.toFixed(0)+'°/s','envers',envM.toFixed(1)+' s','contacts',info.contacts|0,'essai',info.essai,ref.length?'REFUS '+ref.map(function(x){return x[0]+'@'+x[1];}).join(','):'','·',figs.join(' '));}
  const pc=function(a){return (med(a)*100).toFixed(0)+'%';};
  console.log('palier',p,'· routes',A.L.length,'· durée méd',med(A.s).toFixed(0)+' s · modules/route méd',med(A.nM),'(min '+Math.min.apply(null,A.nM)+')','· refusés',A.refus,'· contacts',A.contacts,'· essais',JSON.stringify(A.essais.filter(function(e){return e;})),
    '· pente méd',pc(A.pente),'(min '+(Math.min.apply(null,A.pente)*100).toFixed(0)+'%)','· hors méd',pc(A.hors),'max',(mx(A.hors)*100).toFixed(0)+'%','· envers méd',pc(A.env),'max',(mx(A.env)*100).toFixed(0)+'%',
    '· droite max méd',med(A.droite).toFixed(1)+' s (pire '+mx(A.droite).toFixed(1)+' s) · part droite méd',pc(A.partDroite),'· cap max',mx(A.cap).toFixed(0)+'°','· même côté max',mx(A.sens).toFixed(1)+' s (méd '+med(A.sens).toFixed(1)+')','· roulis de suite max',mx(A.roul).toFixed(1)+' s','· roulis max',mx(A.rv).toFixed(0)+'°/s (méd '+med(A.rv).toFixed(0)+')','· envers de suite max',mx(A.env9).toFixed(1)+' s','· climax',A.climax,'· humeurs',JSON.stringify(A.hum),'· figs',JSON.stringify(A.figs));}
