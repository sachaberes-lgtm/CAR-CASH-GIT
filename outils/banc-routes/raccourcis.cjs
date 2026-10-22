/* banc des RACCOURCIS d'une route : on sort par le bord, on tombe selon −N (le haut du vol = la normale au décollage), on se pose sur la dalle la plus proche.
   Règle (passation/RACCOURCIS.md) : gain ≥ 150 m (s pose − s décollage − distance volée), vol ≤ 6 s, pose à ±55° du sens de la route, pas à contresens.
   node raccourcis.cjs carte graine palier [--v] */
const B=require('./charge.cjs');
const THREE=B.ctx.THREE;
function analyse(r,opt){
  opt=opt||{};const g0=23*(r.espace?.5:1),HALF=28,Q=r.ctrl,N=r.N||Q.map(()=>new THREE.Vector3(0,1,0)),n=Q.length;
  const T=[],Bv=[],S=[0];
  for(let i=0;i<n;i++){T.push(new THREE.Vector3().subVectors(Q[Math.min(n-1,i+1)],Q[Math.max(0,i-1)]).normalize());if(i)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));}
  for(let i=0;i<n;i++){Bv.push(r.Bv?r.Bv[i]:new THREE.Vector3().crossVectors(T[i],N[i]).normalize());}
  const C=70,grid=new Map(),key=(x,y,z)=>((x&2047)*2048+(y&2047))*2048+(z&2047);
  for(let i=0;i<n;i++){const k=key(Math.floor(Q[i].x/C),Math.floor(Q[i].y/C),Math.floor(Q[i].z/C));let l=grid.get(k);if(!l)grid.set(k,l=[]);l.push(i);}
  const cache=new Map(),vide=[];const near=p=>{const cx=Math.floor(p.x/C),cy=Math.floor(p.y/C),cz=Math.floor(p.z/C),k=key(cx,cy,cz);let o=cache.get(k);if(o)return o;o=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const l=grid.get(key(cx+a,cy+b,cz+c));if(l)for(const j of l)o.push(j);}cache.set(k,o);return o;};
  const vC=r.vw,mults=opt.mults||[.9,1.1,1.4,1.8],offs=opt.offs||[-30,-12,0,12,30],res=[];
  const p=new THREE.Vector3(),v=new THREE.Vector3(),d=new THREE.Vector3(),pp=new THREE.Vector3(),u=new THREE.Vector3();
  for(let i=4;i<n-4;i+=2)for(const side of [-1,1]){
    for(const m of mults)for(const off of offs){
      p.copy(Q[i]).addScaledVector(Bv[i],side*(HALF+.5));
      v.copy(T[i]).multiplyScalar(vC*m);v.applyAxisAngle(N[i],off*Math.PI/180); // un braquage de `off`° (le lacet en l'air)
      const g=g0;let t=0,dist=0,landed=-1;pp.copy(p);
      while(t<6){const dt=1/40;pp.copy(p);v.addScaledVector(N[i],-g*dt);p.addScaledVector(v,dt);t+=dt;dist+=v.length()*dt;
        let hit=-1;for(const j of near(p)){if(Math.abs(S[j]-S[i])<120)continue;
          d.subVectors(p,Q[j]);const h=d.dot(N[j]),lat=d.dot(Bv[j]),ds=d.dot(T[j]);d.subVectors(pp,Q[j]);const h0=d.dot(N[j]);
          if(h0>0&&h<=0&&Math.abs(lat)<HALF&&Math.abs(ds)<14&&h>-6){hit=j;break;}}
        if(hit>=0){landed=hit;break;}}
      if(landed<0)continue;
      const j=landed,cosA=v.clone().normalize().dot(T[j]),gain=S[j]-S[i]-dist;
      if(cosA<Math.cos(55*Math.PI/180))continue; // contresens ou pose ratée
      if(gain<150)continue;
      res.push({i:i,s:S[i],side:side,m:m,off:off,j:j,gain:gain,t:t});}}
  return {res:res,S:S,n:n};}
function resume(r,a){
  // regroupe par seau de 90 m de départ : un raccourci = un seau avec au moins un tir réussi
  const seaux=new Map();for(const x of a.res){const k=Math.floor(x.s/90);let o=seaux.get(k);if(!o)seaux.set(k,o={s:x.s,n:0,gain:0,ms:new Set(),i:x.i});o.n++;o.gain=Math.max(o.gain,x.gain);o.ms.add(x.m);}
  const L=a.S[a.n-1];return {L:Math.round(L),raccourcis:seaux.size,parKm:+(seaux.size/(L/1000)).toFixed(2),gainMax:Math.round([...seaux.values()].reduce((m,o)=>Math.max(m,o.gain),0)),seaux:[...seaux.values()],
    robustes:[...seaux.values()].filter(o=>o.ms.size>=3).length};}
module.exports={analyse,resume};
if(require.main===module){const [c,sd,pal]=process.argv.slice(2);const r=B.piste(c,+sd,+pal||0);r.espace=c==='espace';const a=analyse(r),s=resume(r,a);
  console.log(c,sd,'pal',pal,'L',s.L,'raccourcis',s.raccourcis,'par km',s.parKm,'gainMax',s.gainMax,'robustes(≥3 vitesses)',s.robustes,'figs',r.marks.map(m=>m.fig||'-').join(','));
  if(process.argv.includes('--v'))for(const o of s.seaux){const mk=r.marks.find(m=>o.i>=m.i0&&o.i<=m.i1);console.log('  s',Math.round(o.s),'tirs',o.n,'vit',[...o.ms].join('/'),'gain',Math.round(o.gain),mk&&mk.fig?mk.fig:'');}}
