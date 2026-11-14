/* ===== LA SONDE DES NUAGES, côté page (2026-11-14) — évaluée par traverse.cjs une fois la course lancée =====
   Exige window.__NU (posé par serveur-sonde.cjs). Pose :
     __NUaudit()  : l'audit statique — pour chaque nuage, le rayon du tri de champ de cotonTick contre l'étendue RÉELLE de ses lobes ; les nuages au ras de la route (dérive au vent comprise) ;
     __NUS        : le relevé image par image (une boucle requestAnimationFrame à nous, qui ne fait que LIRE) ;
     __NUSfin()   : le résumé (pops, changements de finesse, poufs, entrées sans pouf, doubles, voile, coûts).
   Un « pop » = un nuage dessiné à l'image N-1 et plus à l'image N (ou l'inverse) ALORS QU'un de ses lobes est encore dans le champ de la caméra (sphère inscrite au lobe, ×0,85). */
(function(){
  const NU=window.__NU;if(!NU)return 'pas de sonde (__NU) : servir par outils/banc-nuages/serveur-sonde.cjs';
  const T3=window.THREE,C=NU.COTON,ST=NU.COTON_ST,sc=dbgScene(),cam=sc.cam,rdr=sc.rdr;
  const fr=new T3.Frustum(),pv=new T3.Matrix4(),sph=new T3.Sphere(),v3=new T3.Vector3();
  const nuage=function(j){const I=C.I,o=j*ST,tt=NU.N8_U.uTps.value,ph=I[o+6],k=I[o+5]|0;
    return {j:j,x:I[o]+Math.sin(tt*.05+ph)*6,y:I[o+1],z:I[o+2]+Math.cos(tt*.04+ph)*6,x0:I[o],z0:I[o+2],r:I[o+3],cap:I[o+4],k:k,S:C.S[k],h:I[o+7],sx:I[o+8]||1,sy:I[o+9]||1};};
  const lobes=function(n,f){ /* f(wx,wy,wz,rInscrit,rMax) pour chaque lobe (et son reflet si le ciel est sans dessus dessous) */
    const c=Math.cos(n.cap),s=Math.sin(n.cap),S=n.S,ym=S.base+S.top,sym=!!C.sym;
    for(const b of S.B){const lx=b[0]*n.r*n.sx,lz=b[2]*n.r,fy=(b[4]||1)*n.sy,rh=b[3]*n.r,ri=rh*Math.min(1,n.sx,fy),rm=rh*Math.max(1,n.sx,fy),wx=n.x+lx*c+lz*s,wz=n.z-lx*s+lz*c;
      if(f(wx,n.y+b[1]*n.r*n.sy,wz,ri,rm)===false)return;if(sym&&f(wx,n.y+(ym-b[1])*n.r*n.sy,wz,ri,rm)===false)return;}};
  const tri=function(n){const yc=n.y+n.S.base*n.r*n.sy+n.h*.5,R=Math.max(n.r*1.08*n.sx,n.h*.56);return {x:n.x,y:yc,z:n.z,R:R};}; /* le centre et le rayon du tri de champ, comme cotonTick */
  const genre=function(k){const G=['humilis','meduse','mediocris','mediocris','mediocris','congestus','congestus','congestus','castellanus','spirale','arche','stratocumulus','gateau','altocumulus','anneau','cisaille','vague','champignon'];return k<6?'classique'+k:(G[k-6]||('g'+k));};
  window.__NUaudit=function(){const R=dbgRoute(),out={n:C.n,cap:C.cap,sym:!!C.sym,ratio:[],pire:[],ras:[],err:{mod:String(window.__nuModErr||''),pouf:String(window.__nuPoufErr||''),gpu:String(window.__poufGpuErr||''),emb:String(window.__nuEmbErr||'')}};
    const ds=R.L/Math.max(1,R.NP-1),pas=Math.max(1,Math.round(6/ds));
    for(let j=0;j<C.n;j++){const n=nuage(j),t=tri(n);let Rv=0;lobes(n,function(x,y,z,ri,rm){const d=Math.hypot(x-t.x,y-t.y,z-t.z)+rm;if(d>Rv)Rv=d;});
      const q=Rv/t.R;out.ratio.push(+q.toFixed(2));out.pire.push({j:j,g:genre(n.k),r:Math.round(n.r),Rtri:Math.round(t.R),Rvrai:Math.round(Rv),q:+q.toFixed(2),deborde:Math.round(Rv-t.R)});
      /* au ras de la route : la plus petite marge entre un lobe (dérive ±6 m comprise : on gonfle de 8,5 m) et la bande de la dalle (axe ± demi, de 0 à 6 m au-dessus) */
      let mg=1e9,sMin=0;const Rb=1.9*n.r*Math.max(1,n.sx)+R.demi+30;
      for(let i=0;i<R.NP;i+=pas){const p=R.pts[i],dx=p.x-n.x0,dz=p.z-n.z0;if(dx*dx+dz*dz>Rb*Rb)continue;const Bv=R.B[i],Nv=R.Nn[i];
        for(const a of [-1,0,1])for(const hh of [0,3,6]){const px=p.x+Bv.x*a*R.demi+Nv.x*hh,py=p.y+Bv.y*a*R.demi+Nv.y*hh,pz=p.z+Bv.z*a*R.demi+Nv.z*hh;
          lobes(n,function(x,y,z,ri,rm){const d=Math.hypot(px-x,py-y,pz-z)-ri;if(d<mg){mg=d;sMin=i*ds;}});}}
      if(mg<12)out.ras.push({j:j,g:genre(n.k),r:Math.round(n.r),sy:+n.sy.toFixed(2),s:Math.round(sMin),marge:+mg.toFixed(1),avecVent:+(mg-8.5).toFixed(1)});}
    out.pire.sort(function(a,b){return b.deborde-a.deborde;});out.pire=out.pire.slice(0,12);
    const q=out.ratio.slice().sort(function(a,b){return a-b;});out.ratioMed=q[q.length>>1];out.ratioMax=q[q.length-1];out.ratioSup12=q.filter(function(x){return x>1.2;}).length;delete out.ratio;
    out.ras.sort(function(a,b){return a.s-b.s;});out.mod=dbgNuaModules();return out;};
  const S=window.__NUS={on:true,frames:0,t0:performance.now(),tPrev:0,dts:[],calls:[],tris:[],cotonTri:[],cotonMs:[],vus:new Int8Array(C.cap).fill(-1),prets:false,nPrev:-1,x0Prev:NaN,
    pops:[],nPop:0,lod:0,lodPres:0,lodEx:[],poufs:[],nPoufPrev:NU.NUA_POUF.n,tirsPrev:NU.POUF_GPU.n,tirs:[],D:new Uint8Array(C.cap),entrees:[],sorties:0,sansPouf:[],doubles:[],derEntree:{},
    sDedansSansVoile:0,sDedans:0,sCamDedans:0,sCamDedansSansVoile:0,voileMax:0,rebatis:0,trous:0,trouMax:0,cubesMax:0,sVol:0,sSol:0};
  const cur=new Int8Array(C.cap);
  const dansLobe=function(n,px,py,pz){let k=false;const c=Math.cos(n.cap),s=Math.sin(n.cap),Sg=n.S,ym=Sg.base+Sg.top,dx=px-n.x,dz=pz-n.z,lx=(dx*c-dz*s)/(n.r*n.sx),lz=(dx*s+dz*c)/n.r,ly=(py-n.y)/(n.r*n.sy);
    for(const b of Sg.B){const ex=lx-b[0],ez=lz-b[2],h2=(ex*ex+ez*ez)/(b[3]*b[3]);if(h2>=1)continue;const fy=b[3]*(b[4]||1);let ey=(ly-b[1])/fy;if(h2+ey*ey<1){k=true;break;}if(C.sym){ey=(ly-(ym-b[1]))/fy;if(h2+ey*ey<1){k=true;break;}}}return k;};
  const tick=function(){if(!S.on)return;requestAnimationFrame(tick);
    const now=performance.now(),dt=S.tPrev?(now-S.tPrev)/1000:0;S.tPrev=now;const st=NU.st();if(!dbgState().running||dbgState().paused)return;
    S.frames++;if(dt>0)S.dts.push(+(dt*1000).toFixed(1));S.calls.push(rdr.info.render.calls);S.tris.push(rdr.info.render.triangles);S.cotonTri.push(C.tri);S.cotonMs.push(+C.ms.toFixed(3));
    if(st.mode==='fall')S.sVol+=dt;else S.sSol+=dt;
    /* ---- qui est dessiné, en quelle finesse ---- */
    cur.fill(-1);const Ls=C.L;for(let q=0;q<Ls.length;q++){const Lq=Ls[q];for(let a=0;a<Lq.n;a++)cur[Lq.i[a]]=q&3;}
    if(C.LV)for(let q=0;q<C.LV.length;q++){const Lv=C.LV[q];for(let a=0;a<Lv.n;a++)if(cur[Lv.i[a]]<0)cur[Lv.i[a]]=4+(q&1);}
    const rebati=C.n!==S.nPrev||C.I[0]!==S.x0Prev;if(rebati){if(S.nPrev>=0)S.rebatis++;S.nPrev=C.n;S.x0Prev=C.I[0];S.prets=false;S.D.fill(0);}
    if(S.prets&&C.root&&C.root.visible){cam.updateMatrixWorld();pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(pv);
      const cx=cam.position.x,cy=cam.position.y,cz=cam.position.z,tanF=Math.tan(cam.fov*Math.PI/360),Hpx=rdr.domElement.clientHeight||800;
      for(let j=0;j<C.n;j++){const a=S.vus[j],b=cur[j];if(a===b)continue;
        if((a<0)!==(b<0)){const n=nuage(j),t=tri(n);let nIn=0,pxMax=0,dMin=1e9;
          lobes(n,function(x,y,z,ri){sph.center.set(x,y,z);sph.radius=ri*.85;if(fr.intersectsSphere(sph)){nIn++;const d=Math.hypot(x-cx,y-cy,z-cz);if(d<dMin)dMin=d;const px=ri/(Math.max(1,d)*tanF)*(Hpx/2);if(px>pxMax)pxMax=px;}});
          const d=Math.hypot(t.x-cx,t.y-cy,t.z-cz);
          if(nIn>0&&pxMax>=10&&(d-t.R)<st.fogF){S.nPop++;if(S.pops.length<400)S.pops.push({t:+((now-S.t0)/1000).toFixed(2),s:Math.round(st.s),sens:b<0?'disparait':'apparait',j:j,g:genre(n.k),r:Math.round(n.r),d:Math.round(d),Rtri:Math.round(t.R),lobes:nIn,px:Math.round(pxMax),mode:st.mode,
            cam:[+cx.toFixed(1),+cy.toFixed(1),+cz.toFixed(1)],vise:(function(){cam.getWorldDirection(v3);return [+(cx+v3.x*100).toFixed(1),+(cy+v3.y*100).toFixed(1),+(cz+v3.z*100).toFixed(1)];})(),fov:cam.fov,nu:[Math.round(n.x),Math.round(t.y),Math.round(n.z)]});}}
        else{S.lod++;const n=nuage(j),t=tri(n),d=Math.hypot(t.x-cx,t.y-cy,t.z-cz);if(d<t.R+400){S.lodPres++;if(S.lodEx.length<30)S.lodEx.push({s:Math.round(st.s),j:j,de:a,a:b,d:Math.round(d),r:Math.round(n.r)});}}}}
    S.vus.set(cur);S.prets=true;
    /* ---- dedans / dehors (la caisse), la caméra, le voile ---- */
    const cp=sc.car.position,D=NU.NUA_POUF.dans;let dedans=0,camIn=0;
    if(D){for(let j=0;j<C.n;j++){if(D[j])dedans++;if(D[j]&&!S.D[j]){const n=nuage(j),der=S.derEntree[j];S.entrees.push({t:+((now-S.t0)/1000).toFixed(2),s:Math.round(st.s),j:j,g:genre(n.k),r:Math.round(n.r),sy:+n.sy.toFixed(2),mode:st.mode,v:Math.round(Math.abs(st.vA)*st.SPD*3.6),pouf:NU.NUA_POUF.n!==S.nPoufPrev,ecart:+(now/1000-NU.NUA_POUF.t).toFixed(2)});
          if(NU.NUA_POUF.n===S.nPoufPrev)S.sansPouf.push({s:Math.round(st.s),j:j,r:Math.round(n.r),mode:st.mode});
          if(der&&now-der<4000)S.doubles.push({s:Math.round(st.s),j:j,r:Math.round(n.r),ecart:+((now-der)/1000).toFixed(2),repouf:NU.NUA_POUF.n!==S.nPoufPrev});S.derEntree[j]=now;}
        if(!D[j]&&S.D[j])S.sorties++;S.D[j]=D[j];}}
    if(NU.NUA_POUF.n!==S.nPoufPrev){S.poufs.push({t:+((now-S.t0)/1000).toFixed(2),s:Math.round(st.s),mode:st.mode,n:NU.NUA_POUF.n});S.nPoufPrev=NU.NUA_POUF.n;}
    if(NU.POUF_GPU.n!==S.tirsPrev){S.tirs.push({t:+((now-S.t0)/1000).toFixed(2),s:Math.round(st.s),n:NU.POUF_GPU.n,vivantes:NU.POUF_GPU.fx?NU.POUF_GPU.fx.vivantes():0});S.tirsPrev=NU.POUF_GPU.n;}
    {const cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;for(let j=0;j<C.n;j++){const I=C.I,o=j*ST,rb=1.9*I[o+3]*Math.max(1,I[o+8]||1),dx=cx-I[o],dz=cz-I[o+2];if(dx*dx+dz*dz<rb*rb&&dansLobe(nuage(j),cx,cy,cz)){camIn=1;break;}}}
    if(dedans){S.sDedans+=dt;if(st.cloudInS<.03)S.sDedansSansVoile+=dt;}if(camIn){S.sCamDedans+=dt;if(st.cloudInS<.03)S.sCamDedansSansVoile+=dt;}if(st.cloudInS>S.voileMax)S.voileMax=st.cloudInS;
    {let nt=0;const H=NU.NHOLE.uHole.value;for(let i=0;i<H.length;i++)if(H[i].w>.01)nt++;if(nt){S.trous++;if(nt>S.trouMax)S.trouMax=nt;}}
    if(NU.NCB.n>S.cubesMax)S.cubesMax=NU.NCB.n;};
  requestAnimationFrame(tick);
  window.__NUpopVue=function(j,p,fov){ /* la preuve d'un pop en deux photos : depuis p, on cherche le cap où le nuage j est REFUSÉ par le tri de champ (sa sphère de tri hors du champ) alors que ses lobes y sont le plus ; B = le même cap tourné de 4 degrés vers lui (il est dessiné) */
    const n=nuage(j),t=tri(n),c=new T3.PerspectiveCamera(fov,cam.aspect,cam.near,cam.far);c.position.fromArray(p);const az0=Math.atan2(t.x-p[0],t.z-p[2]),dh=Math.hypot(t.x-p[0],t.z-p[2]),tanF=Math.tan(fov*Math.PI/360),Hpx=rdr.domElement.clientHeight||800;let best=null;
    const vise=function(a){const az=az0+a*Math.PI/180;return [p[0]+Math.sin(az)*dh,t.y,p[2]+Math.cos(az)*dh];};
    for(let a=-120;a<=120;a+=.5){const g=vise(a);c.lookAt(g[0],g[1],g[2]);c.updateMatrixWorld();pv.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);fr.setFromProjectionMatrix(pv);
      sph.center.set(t.x,t.y,t.z);sph.radius=t.R;if(fr.intersectsSphere(sph))continue;let px=0,nIn=0;
      lobes(n,function(x,y,z,ri){sph.center.set(x,y,z);sph.radius=ri*.85;if(fr.intersectsSphere(sph)){nIn++;const q=ri/(Math.max(1,Math.hypot(x-p[0],y-p[1],z-p[2]))*tanF)*(Hpx/2);if(q>px)px=q;}});
      if(nIn&&(!best||px*nIn>best.q))best={a:a,q:px*nIn,px:Math.round(px),lobes:nIn,c:g};}
    if(!best)return null;return {j:j,r:Math.round(n.r),Rtri:Math.round(t.R),d:Math.round(Math.hypot(t.x-p[0],t.y-p[1],t.z-p[2])),A:best,B:{c:vise(best.a-Math.sign(best.a)*4)}};};
  window.__NUdessine=function(j){let d=false;for(const L of C.L)for(let a=0;a<L.n;a++)if(L.i[a]===j)d=true;if(C.LV)for(const L of C.LV)for(let a=0;a<L.n;a++)if(L.i[a]===j)d=true;return d;};
  const med=function(a,f){if(!a.length)return null;const b=a.slice().sort(function(x,y){return x-y;});return b[Math.min(b.length-1,Math.floor(b.length*(f==null?.5:f)))];};
  window.__NUSfin=function(){S.on=false;const dur=(performance.now()-S.t0)/1000;S.pops.sort(function(a,b){return b.px-a.px;});
    return {dur:+dur.toFixed(1),images:S.frames,sSol:+S.sSol.toFixed(1),sVol:+S.sVol.toFixed(1),dtMed:med(S.dts),dtP95:med(S.dts,.95),dtMax:med(S.dts,1),
      appels:{med:med(S.calls),max:med(S.calls,1)},triangles:{med:med(S.tris),max:med(S.tris,1)},cotonTri:{med:med(S.cotonTri),max:med(S.cotonTri,1)},cotonMs:{med:med(S.cotonMs),max:med(S.cotonMs,1)},
      nPop:S.nPop,popsParMin:+(S.nPop/Math.max(1,dur)*60).toFixed(1),popsDisparait:S.pops.filter(function(p){return p.sens==='disparait';}).length,pops:S.pops.slice(0,25),
      lod:S.lod,lodPres:S.lodPres,lodParMin:+(S.lodPres/Math.max(1,dur)*60).toFixed(1),lodEx:S.lodEx.slice(0,10),
      poufs:S.poufs,tirs:S.tirs,entrees:S.entrees,sorties:S.sorties,sansPouf:S.sansPouf,doubles:S.doubles,
      sDedans:+S.sDedans.toFixed(2),sDedansSansVoile:+S.sDedansSansVoile.toFixed(2),sCamDedans:+S.sCamDedans.toFixed(2),sCamDedansSansVoile:+S.sCamDedansSansVoile.toFixed(2),voileMax:+S.voileMax.toFixed(2),
      rebatis:S.rebatis,imagesAvecTrou:S.trous,trouMax:S.trouMax,cubesMax:S.cubesMax,
      err:{mod:String(window.__nuModErr||''),pouf:String(window.__nuPoufErr||''),gpu:String(window.__poufGpuErr||''),emb:String(window.__nuEmbErr||'')}};};
  return 'sonde posée';
})()
