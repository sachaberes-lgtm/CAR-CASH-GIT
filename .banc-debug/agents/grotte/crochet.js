/* CROCHET DE BANC (agent debug-grotte, test seulement) */
window.dbgGrtX=function(k){const V=GROTTE.V;
  if(k==='etat'||!V)return {V:!!V,root:!!GROTTE.root,lvl:+((LVL.grotte||0).toFixed(3)),part:!!(GRT_FX.part&&GRT_FX.part.visible),bio:BIO.name,fogF:scene.fog?Math.round(scene.fog.far):null,geo:renderer.info.memory.geometries};
  if(k==='cone'){let N=0,pts=0,tues=0,lat=0,latT=0;const ex=[],p=new THREE.Vector3();
    for(const L9 of GROTTE.dec.values())for(const f of L9){if(f[0]!=='p'||f[11]!==GT.CONCRETION)continue;N++;
      const dv=[f[4],f[5],f[6]],r0=f[8],h=f[10],tip=[f[1]+dv[0]*h,f[2]+dv[1]*h,f[3]+dv[2]*h];
      for(const t of [2,4,6,8,10]){p.set(tip[0]+dv[0]*t,tip[1]+dv[1]*t,tip[2]+dv[2]*t);if(grtDensIci(V,p.x,p.y,p.z)<=0)continue;pts++;
        if(grotteHeurt(p)){tues++;if(ex.length<8)ex.push({t:t,tip:tip.map(Math.round),r0:+r0.toFixed(1),h:Math.round(h),q:dv[1]>0?'mite':'tite'});}}
      for(const u of [.8,.9]){const rc=r0*(1-u),c=[f[1]+dv[0]*h*u,f[2]+dv[1]*h*u,f[3]+dv[2]*h*u];
        for(const a of [0,1.571,3.142,4.712]){p.set(c[0]+Math.cos(a)*(rc+3),c[1],c[2]+Math.sin(a)*(rc+3));if(grtDensIci(V,p.x,p.y,p.z)<=0)continue;lat++;if(grotteHeurt(p))latT++;}}}
    return {cones:N,bout:{pts:pts,tues:tues},cote:{pts:lat,tues:latT},ex:ex};}
  if(k==='trous'){let n=0;const ex=[];for(let c=0;c<V.pool.length;c++){const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,DN=V.dn[c];
      for(let o=0;o<4096;o++){if(DN[o]<=0)continue;const i=o&15,j=(o>>4)&15,kk=o>>8;
        const nx=i===0&&(ci===0||V.dir[(ci-1)+V.CX*(cj+V.CY*ck)]<0),ny=j===0&&(cj===0||V.dir[ci+V.CX*((cj-1)+V.CY*ck)]<0),nz=kk===0&&(ck===0||V.dir[ci+V.CX*(cj+V.CY*(ck-1))]<0);
        if(nx||ny||nz){n++;const x=V.ox+(ci*16+i+.5)*V.B,y=V.oy+(cj*16+j+.5)*V.B,z=V.oz+(ck*16+kk+.5)*V.B,R=GROTTE.R,P=GROTTE.puits,qq=V.si[c][(i>>2)|((j>>2)<<2)|((kk>>2)<<4)];
          let dr=1e9,qr=-1;for(let q=0;q<R.n;q++){const d2=(R.X[q]-x)**2+(R.Z[q]-z)**2;if(d2<dr){dr=d2;qr=q;}}
          if(ex.length<8)ex.push({p:[x,y,z].map(Math.round),f:nx?'x':ny?'y':'z',dens:V.dn[c][o],sal:qq>=0?R.SAL[qq]:-1,dRoute:Math.round(Math.sqrt(dr)),yRoute:Math.round(y-R.Y[qr]),sRoute:Math.round(R.S[qr]),
            puits:P?{dAxe:Math.round(Math.hypot(x-P.cx,z-P.cz)),Rmax:Math.round(Math.max(P.R0,P.R1)+GRV.ent*1.12+2*V.B),y0:Math.round(P.y0),y1:Math.round(P.y1),yB:Math.round(P.yB),yT:Math.round(P.yT)}:null});}}}
    return {trous:n,ex:ex};}
  if(k==='trouvue'){const t=window.dbgGrtX('trous');if(!t.trous)return t;const h=t.ex[0],ax=h.f==='x'?0:h.f==='y'?1:2,out={t:t,shots:[]};
    for(const d of [40,80,140]){const p=h.p.slice();p[ax]+=d;const q=h.p.slice();q[ax]+=V.B*.6;let ok=grtDensIci(V,p[0],p[1],p[2])>0;
      if(!ok)continue;const c=h.p.slice();if(ax!==1)c[1]-=6;window.dbgGrotte('vue',{p:p,c:c,fov:75});out.shots.push({d:d,img:renderer.domElement.toDataURL('image/jpeg',.8)});if(out.shots.length>=2)break;}
    return out;}
  if(k==='conevue'){const R=GROTTE.R;let best=null,bd=1e18;
    for(const L9 of GROTTE.dec.values())for(const f of L9){if(f[0]!=='p'||f[11]!==GT.CONCRETION||f[5]>0)continue;const h=f[10],tip=[f[1],f[2]-h,f[3]];if(grtDensIci(V,tip[0],tip[1]-8,tip[2])<=0)continue;
      for(let q=R.i0;q<R.n-20;q+=3){const d2=(R.X[q]-tip[0])**2+(R.Z[q]-tip[2])**2;if(d2<bd){bd=d2;best={f:f,q:q,tip:tip};}}}
    if(!best)return 'pas de stalactite';const f=best.f,h=f[10],m=Math.max(f[8],f[9])*.8,tip=best.tip,cy=f[2]-h/2,hy=h/2+m+1,hx=m+1;
    const g=new THREE.BoxGeometry(2*hx,2*hy,2*hx),ls=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0xff2020,depthTest:false}));ls.position.set(f[1],cy,f[3]);ls.renderOrder=99;scene.add(ls);
    const mk=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),new THREE.MeshBasicMaterial({color:0xffff00,depthTest:false}));const pm=[f[1],tip[1]-(m+1)*.6,f[3]];mk.position.fromArray(pm);mk.renderOrder=99;scene.add(mk);
    const o=new THREE.Vector3().fromArray(pm),out={tip:tip.map(Math.round),r0:+f[8].toFixed(1),h:Math.round(h),boiteSousPointe:+(m+1).toFixed(1),dRoute:Math.round(Math.sqrt(bd)),yRoute:Math.round(tip[1]-R.Y[best.q]),
      point:{p:pm.map(Math.round),air:grtDensIci(V,o.x,o.y,o.z)>0,heurt:grotteHeurt(o)||'(rien)'},shots:[]};
    const dx=R.TX[best.q],dz=R.TZ[best.q];for(const sd of [1,-1]){const cam=[pm[0]+dz*sd*45-dx*10,pm[1]-6,pm[2]-dx*sd*45-dz*10];if(grtDensIci(V,cam[0],cam[1],cam[2])<=0)continue;
      window.dbgGrotte('vue',{p:cam,c:[pm[0],pm[1]+h*.25,pm[2]],fov:70});out.shots.push(renderer.domElement.toDataURL('image/jpeg',.82));break;}
    scene.remove(ls);scene.remove(mk);ls.geometry.dispose();g.dispose();mk.geometry.dispose();return out;}
  if(k==='lacs'){const P=GROTTE.puits,lac=GROTTE.lac,eau=GROTTE.eau,out={},pt=new THREE.Vector3();
    for(let c=0;c<V.pool.length;c++){const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,A=V.pool[c];
      for(let o=0;o<4096;o++){const a=A[o];if(a!==4&&a!==5)continue;const i=o&15,j=(o>>4)&15,kk=o>>8,up=grtLit(V,ci*16+i,cj*16+j+1,ck*16+kk);if(up===4||up===5)continue;
        const cx=V.ox+(ci*16+i+.5)*V.B,cy=V.oy+(cj*16+j+.5)*V.B,cz=V.oz+(ck*16+kk+.5)*V.B;let Ly,nm;
        if(a===4){Ly=lac.y;nm='lave';}else if(eau&&Math.abs(cy-eau.y)<2*V.B){Ly=eau.y;nm='eau';}else{Ly=P.yW;nm='bassin';}
        for(const e of [.3,1.5]){pt.set(cx+(e-.9)*3,Ly-e,cz);if(grtDensIci(V,pt.x,pt.y,pt.z)>0){out[nm+':air']=(out[nm+':air']|0)+1;continue;}const h=grotteHeurt(pt)||'rien';out[nm+'>'+h]=(out[nm+'>'+h]|0)+1;}}}
    return {lacs:out,lacY:lac&&Math.round(lac.y*10)/10,eauY:eau&&Math.round(eau.y*10)/10,bassinY:P&&Math.round(P.yW*10)/10,oy:V.oy,B:V.B};}
  if(k==='fantomes'){let n=0,nd=0;const t={};for(const [d,L9] of GROTTE.dec){nd+=L9.length;if(V.dir[d]>=0)continue;for(const f of L9){n++;const ty=f[0]+(f[0]==='b'?f[7]:f[0]==='p'?f[11]:f[6]);t[ty]=(t[ty]|0)+1;}}return {decors:nd,invisibles:n,types:t};}
  if(k==='empreinte'){let sd=0,sp=0;for(let c=0;c<V.pool.length;c++){const D9=V.dn[c],A=V.pool[c];for(let o=0;o<4096;o++){sd=(sd+D9[o]*((o%97)+1))%1000000007;sp+=A[o];}}
    return {pret:GROTTE.pret,troncons:V.pool.length,air:V.nAir,col:GROTTE.col&&GROTTE.col.n,lum:GROTTE.n.lumieres,tri:GROTTE.n.triangles,dec:GROTTE.n.decors,sd:sd,sp:sp,L:Math.round(L),met:GROTTE.met,salles:GROTTE.R&&GROTTE.R.bornes,ox:V.ox,oz:V.oz};}
  if(k==='veille'){const W9=window.__grtV={n:0,camMin:1e9,camRoche:0,margeMin:1e9,heurts:[],der:''};
    const f9=function(){if(window.__grtV!==W9)return;requestAnimationFrame(f9);const V2=GROTTE.V;if(!V2||!started||gameOver||paused)return;W9.n++;
      const cp=camera.position,dc=grtDensIci(V2,cp.x,cp.y,cp.z);if(dc<W9.camMin)W9.camMin=dc;if(dc<=0){W9.camRoche++;if(!W9.camEx)W9.camEx={s:Math.round(s),mode:mode,d:dc};}
      if(GROTTE.file&&GROTTE.fi<GROTTE.file.length){const m9=GROTTE.R.S[Math.min(GROTTE.R.n-1,V2.chS[GROTTE.file[GROTTE.fi]])]-s;if(m9<W9.margeMin){W9.margeMin=m9;W9.margeS=Math.round(s);}}
      if(GROTTE.heurt&&GROTTE.heurt!==W9.der){const P=carGroup.position;W9.heurts.push({h:GROTTE.heurt,dens:Math.round(grtDensIci(V2,P.x,P.y,P.z)),s:Math.round(s),near:Math.round(lastNearS),p:[P.x,P.y,P.z].map(Math.round)});}W9.der=GROTTE.heurt;};
    requestAnimationFrame(f9);return 'veille';}
  if(k==='bilan'){const W9=window.__grtV||{};return {images:W9.n,camMin:Math.round(W9.camMin),camRoche:W9.camRoche,camEx:W9.camEx,margeMin:Math.round(W9.margeMin),margeS:W9.margeS,heurts:W9.heurts};}
  return null;};
