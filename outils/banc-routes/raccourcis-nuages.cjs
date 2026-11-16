/* LES RACCOURCIS DU PARCOURS (2026-11-13, la charte des routes R6 : « ≥ 2 raccourcis par route au palier 0, dont ≥ 1 qui marche à 3 vitesses ») : depuis chaque lèvre marquée
   (MODMARK {rac:1, i0 : la lèvre, i1 : la pose}), le geste du raccourci : NE PAS TOURNER. La caisse file tout droit dans le cap de la lèvre — sur la dalle tant qu'elle y est (elle en suit la
   surface), en vol dès qu'elle en sort par le bord ; et si elle part au saut nitro (10 m/s), elle vole d'abord, se repose, reprend sa ligne. À 1 ×, 1,4 × et 1,8 × la croisière du palier.
   Réussi : posée sur la route plus loin que la fin du tour, dans son sens (±55°), avec un gain (la route sautée moins le chemin parcouru) d'au moins 150 m. Vol : gravité de la route survolée
   (23 m/s², vols-sim.cjs) ; au plus ±20° de lacet en l'air (la charte) pour corriger la ligne vers la piste.
   node raccourcis-nuages.cjs [palier=0] [graines=1-8] */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),V3=B.ctx.THREE.Vector3;
const pal=+(arg('palier')||0),G=(arg('graines')||'1-8').split('-').map(Number),H=28,g0=23,dt=1/60;
let nRac=0,nRoutes=0,routesOk=0,rac3=0;const lignes=[];
for(let g=G[0];g<=(G[1]||G[0]);g++){const r=B.piste('nuages',g,pal),C=r.ctrl,Nc=r.N,vw=r.vw;nRoutes++;
  const cv=new B.ctx.THREE.CatmullRomCurve3(C,false,'centripetal');cv.arcLengthDivisions=C.length*16;const L=cv.getLength(),NP=Math.round(L)+1,ds=L/(NP-1);
  const P=cv.getSpacedPoints(NP-1),T=[],N=[],Bn=[];for(let i=0;i<NP;i++)T.push(cv.getTangentAt(Math.min(1,i/(NP-1))));
  const lg=cv.getLengths(),nC=C.length-1,sOfC=[];for(let j=0;j<=nC;j++){const f=j/nC*(lg.length-1),k=Math.min(lg.length-2,Math.floor(f));sOfC.push(lg[k]+(lg[k+1]-lg[k])*(f-k));}
  {let j=0;for(let i=0;i<NP;i++){const si=i*ds;while(j<nC-1&&sOfC[j+1]<si)j++;const u=(si-sOfC[j])/Math.max(1e-6,sOfC[j+1]-sOfC[j]);const n=new V3().copy(Nc[j]).lerp(Nc[j+1],Math.max(0,Math.min(1,u)));n.addScaledVector(T[i],-n.dot(T[i])).normalize();N.push(n);Bn.push(new V3().crossVectors(T[i],n));}}
  const proche=function(p,j0){let jb=j0,db=1e18;for(let k=Math.max(0,j0-60);k<=Math.min(NP-1,j0+2500);k+=2){const d=P[k].distanceToSquared(p);if(d<db){db=d;jb=k;}}return jb;};
  const racs=r.marks.filter(m=>m.rac);let okRoute=0;
  for(const m of racs){nRac++;const sL=sOfC[Math.min(nC,m.i0)],iL=Math.round(sL/ds),mod=r.marks.find(x=>!x.rac&&x.racs&&x.i0<=m.i0&&x.i1>=m.i0),sFin=mod?sOfC[Math.min(nC,mod.i1)]:sL+200;let ok=0;const det=[];
    /* la fin du tour : là où la route repasse sous la lèvre — tout ce qui se pose avant n'a rien sauté */
    for(const kv of [1,1.4,1.8])for(const vj of [0,10]){const v=vw*kv,T0=T[iL].clone(),p=new V3().copy(P[iL]).addScaledVector(N[iL],.6),w=new V3().copy(T0).multiplyScalar(v),q=new V3(),u=new V3().copy(N[iL]);
      let j=iL,t=0,vol=false,res='air',chemin=0;if(vj){w.addScaledVector(N[iL],vj);vol=true;}
      while(t<12){t+=dt;const pp=p.clone();
        if(!vol){ /* SUR LA DALLE, tout droit : le cap de la lèvre, la surface de la route sous la caisse */
          const hz=new V3(T0.x,0,T0.z).normalize();p.addScaledVector(hz,v*dt);j=proche(p,j);q.subVectors(p,P[j]);const lat=q.dot(Bn[j]);
          if(Math.abs(lat)>H){vol=true;u.copy(N[j]);w.copy(T[j]).multiplyScalar(v);w.addScaledVector(Bn[j],-Bn[j].dot(w));const hzw=new V3(w.x,0,w.z),l9=hzw.length();w.multiplyScalar(1);w.addScaledVector(Bn[j],0);
            const dir=new V3().copy(hz).multiplyScalar(v);dir.y=T[j].y/Math.max(.2,Math.hypot(T[j].x,T[j].z))*v;w.copy(dir);} /* elle quitte la dalle par le bord, avec la pente de la route */
          else{p.copy(P[j]).addScaledVector(Bn[j],lat).addScaledVector(N[j],.6);}}
        else{j=proche(p,j);const n=N[j],sg=n.dot(u)>=0?1:-1;u.copy(n).multiplyScalar(sg);q.subVectors(p,P[j]);const lat=q.dot(Bn[j]);
          {const wn=w.dot(u),wh=new V3().copy(w).addScaledVector(u,-wn),lh=wh.length();if(lh>1){const d=new V3().copy(T[j]).addScaledVector(Bn[j],-Math.max(-.5,Math.min(.5,lat/60)));d.addScaledVector(u,-d.dot(u)).normalize();
            let a=Math.atan2(new V3().crossVectors(wh,d).dot(u),wh.dot(d)/lh);const t0h=new V3().copy(T0).addScaledVector(u,-T0.dot(u)).normalize(),dev=Math.atan2(new V3().crossVectors(t0h,new V3().copy(wh).normalize()).dot(u),t0h.dot(wh)/lh);
            if(Math.abs(dev+a)>20/57.3)a=Math.sign(a)*Math.max(0,20/57.3-Math.abs(dev))*(Math.sign(a)===Math.sign(dev)?1:2); /* ±20° autour du cap de la lèvre, au plus */
            const om=1.5*(1.15+Math.min(.9,w.length()/.48*.004)),rr=Math.max(-om*dt,Math.min(om*dt,a));wh.applyAxisAngle(u,rr);w.copy(wh).addScaledVector(u,wn);}}
          w.addScaledVector(u,-g0*dt);p.addScaledVector(w,dt);
          /* la dalle SOUS la caisse (le radar de pose du jeu) : un tronçon que la caisse traverse dans sa largeur, juste au-dessus de sa surface — pas seulement le plus proche (en tombant
             à côté du tour, le plus proche est le tour lui-même : la piste d'en dessous passait inaperçue) */
          let jP=-1,hP=0;for(let k=Math.max(0,j-80);k<=Math.min(NP-1,j+2500);k+=1){q.subVectors(p,P[k]);if(Math.abs(q.dot(T[k]))>1.5)continue;if(Math.abs(q.dot(Bn[k]))>H)continue;const hh=q.dot(N[k])*(N[k].dot(u)>=0?1:-1);if(hh<=0&&hh>-8){jP=k;hP=hh;break;}}
          if(jP>=0){j=jP;const sP=j*ds;if(sP<sFin-60){vol=false;w.set(0,0,0);continue;} /* reposée sur le tour : elle reprend sa ligne (tout droit) */
            const cap=Math.acos(Math.max(-1,Math.min(1,new V3(w.x,0,w.z).normalize().dot(new V3(T[j].x,0,T[j].z).normalize()))))*57.3,gain=(sP-sL)-chemin;
            res=gain>=150&&cap<=55?'OK':'court';det.push((vj?'saut':'bord')+'×'+kv+':'+res+' +'+Math.round(gain)+'m '+t.toFixed(1)+'s');if(res==='OK')ok++;break;}
          {q.subVectors(p,P[iL]);if(q.dot(N[iL])<-400){res='vide';det.push((vj?'saut':'bord')+'×'+kv+':vide');break;}}} /* à côté de la dalle, elle tombe encore (sous SA dalle : la gravité de la route quittée) — perdue bien plus bas que la lèvre */
        chemin+=p.distanceTo(pp);}
      if(res==='air')det.push((vj?'saut':'bord')+'×'+kv+':air');}
    const vit=[1,1.4,1.8].filter((kv,k)=>(det[2*k]||'').indexOf(':OK')>0||(det[2*k+1]||'').indexOf(':OK')>0).length;if(vit===3)rac3++;if(ok)okRoute++;
    lignes.push('  g'+g+' '+m.nom+' @'+Math.round(sL)+' : '+ok+'/6 '+(vit===3?'(3 vitesses)':'')+' | '+det.join(' · '));}
  if(okRoute>=2)routesOk++;}
console.log('palier',pal,'|',nRoutes,'routes,',nRac,'raccourcis ('+(nRac/nRoutes).toFixed(1)+' par route), '+routesOk+' routes avec ≥ 2 raccourcis qui marchent, '+rac3+' raccourcis à 3 vitesses');
for(const l of lignes)console.log(l);
