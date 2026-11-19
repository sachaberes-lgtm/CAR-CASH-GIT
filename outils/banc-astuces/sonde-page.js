/* LA SONDE DU TRAVAIL INVISIBLE (2026-11-19, astuces-chauffe) — posée dans la page en course. Compte, par image, chaque appel de dessin
   (renderBufferDirect) : caméra de la scène, ombre ou post ; triangles ; et pour la caméra de la scène, si l'objet est DERRIÈRE la caméra
   (sa sphère entière), HORS du champ (tri désactivé), ou dessiné en partie derrière (instances). Une fois par seconde : le graphe de la scène
   (objets, visibles, matrices auto, tri coupé, objets passés : sphère entière à plus de 30 m derrière la caméra). */
(function(){if(window.__sd)return 1;
 const D=dbgScene(),R=D.rdr,cam=D.cam,sc=D.scene;
 const S=window.__sd={on:false,img:0,par:{},graphe:[],cle:new Map(),ex:{}};const CAR=D.car;
 const fr=new THREE.Frustum(),pm=new THREE.Matrix4(),v=new THREE.Vector3(),m4=new THREE.Matrix4(),sp=new THREE.Sphere();
 let fx=0,fy=0,fz=-1,px=0,py=0,pz=0,ok=false;
 const pose=()=>{const e=cam.matrixWorld.elements,il=1/Math.hypot(e[8],e[9],e[10]);fx=-e[8]*il;fy=-e[9]*il;fz=-e[10]*il;px=e[12];py=e[13];pz=e[14];
   pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);ok=true;};
 const nom=o=>{let p=o,n='';for(let k=0;k<4&&p;k++){if(p.name){n=p.name;break;}p=p.parent;}if(!n){let q=o;while(q.parent&&q.parent!==sc)q=q.parent;n='sc#'+sc.children.indexOf(q)+(q.name?':'+q.name:'');}
   const g=o.geometry,mt=o.material;return (n||'?')+'|'+(g?g.type.replace('BufferGeometry','BG'):'')+'|'+(mt?(mt.type||'').replace('Material','')+(mt.name?':'+mt.name:''):'')+(o.isInstancedMesh?'|inst':'')+(o.frustumCulled===false?'|sansTri':'');};
 const tri=(g,o)=>{if(!g)return 0;const ix=g.index,n=ix?ix.count:(g.attributes.position?g.attributes.position.count:0);let c=Math.min(n,g.drawRange.count);
   if(o.isPoints||o.isLine)return c;return c/3;};
 const ajoute=(k,f,t,q)=>{let a=S.par[k];if(!a)a=S.par[k]={n:0,t:0,der:0,hors:0,tder:0,instDer:0,inst:0,ombre:0,tombre:0,ombreDer:0,post:0};
   if(q==='ombre'){a.ombre+=f;a.tombre+=t;}else if(q==='ombreDer'){a.ombre+=f;a.tombre+=t;a.ombreDer+=f;}else if(q==='post'){a.post+=f;}else{a.n+=f;a.t+=t;}return a;};
 const orig=R.renderBufferDirect;
 R.renderBufferDirect=function(camera,scene,geometry,material,object,group){
  if(S.on&&object){try{
   const k=nom(object);if(!S.ex[k])S.ex[k]=object;let t=tri(geometry,object);const ni=object.isInstancedMesh?object.count:1;t*=ni;
   if(camera===cam){
    if(!ok)pose();
    const a=ajoute(k,1,t,'scene');let der=false,hors=false;
    const bs=geometry.boundingSphere;
    if(bs&&!object.isInstancedMesh){sp.copy(bs).applyMatrix4(object.matrixWorld);const d=(sp.center.x-px)*fx+(sp.center.y-py)*fy+(sp.center.z-pz)*fz;
      if(d+sp.radius<0)der=true;else if(!fr.intersectsSphere(sp))hors=true;}
    if(object.isInstancedMesh&&bs){const A=object.instanceMatrix.array;let nd=0;
      for(let i=0;i<ni;i++){m4.fromArray(A,i*16).premultiply(object.matrixWorld);sp.copy(bs).applyMatrix4(m4);const d=(sp.center.x-px)*fx+(sp.center.y-py)*fy+(sp.center.z-pz)*fz;if(d+sp.radius<0)nd++;}
      a.instDer+=nd;a.inst+=ni;if(nd===ni)der=true;}
    if(der){a.der++;a.tder+=t;}if(hors)a.hors++;
    {let p=object,car=false;while(p){if(p===CAR){car=true;break;}p=p.parent;}const nm=object.name||'',cat=car?'caisse':/^(piste|pays)/.test(nm)?'route':'decor';
     let db=-1;if(bs&&!object.isInstancedMesh){const dx=sp.center.x-px,dy=sp.center.y-py,dz=sp.center.z-pz,dd=Math.sqrt(dx*dx+dy*dy+dz*dz)-sp.radius;db=dd<200?0:dd<400?1:dd<800?2:dd<1600?3:4;}
     const C=S.cat[cat]||(S.cat[cat]={n:0,t:0,d:[0,0,0,0,0,0],dt:[0,0,0,0,0,0]});C.n++;C.t+=t;C.d[db+1]++;C.dt[db+1]+=t;(a.db||(a.db=[0,0,0,0,0,0]))[db+1]++;}
   }else if(scene==null&&camera.isOrthographicCamera||camera.isPerspectiveCamera&&scene==null){
    let q='ombre';const bs=geometry.boundingSphere;if(bs&&ok){sp.copy(bs).applyMatrix4(object.matrixWorld);const d=(sp.center.x-px)*fx+(sp.center.y-py)*fy+(sp.center.z-pz)*fz;if(d+sp.radius<0)q='ombreDer';}
    ajoute(k,1,t,q);
   }else ajoute(k,1,0,'post');
  }catch(e){S.err=String(e);}}
  return orig.apply(this,arguments);};
 const rr=R.render;S.ms={rendu:0,post:0,matrices:0,ombre:0};R.render=function(s9,c9){if(!S.on)return rr.apply(this,arguments);const t0=performance.now();let r;
   if(c9===cam){pose();S.nImg++;r=rr.apply(this,arguments);S.ms.rendu+=performance.now()-t0;}else{r=rr.apply(this,arguments);S.ms.post+=performance.now()-t0;}return r;};
 const um=sc.updateMatrixWorld;sc.updateMatrixWorld=function(){if(!S.on)return um.apply(this,arguments);const t0=performance.now();const r=um.apply(this,arguments);S.ms.matrices+=performance.now()-t0;return r;};
 const sm=R.shadowMap,smr=sm.render;sm.render=function(){if(!S.on)return smr.apply(this,arguments);const t0=performance.now();const r=smr.apply(this,arguments);S.ms.ombre+=performance.now()-t0;return r;};
 S.graphe1=function(){let tot=0,vis=0,mesh=0,auto=0,sansTri=0,passe=0,passeObj=0,invis=0;const e=cam.matrixWorld.elements;
   (function f(o,vu){tot++;if(o.matrixAutoUpdate)auto++;const v9=vu&&o.visible;if(!o.visible)invis++;if(v9)vis++;
     if(v9&&(o.isMesh||o.isPoints||o.isLine||o.isSprite)){mesh++;if(o.frustumCulled===false)sansTri++;const g=o.geometry,bs=g&&g.boundingSphere;
       if(bs){sp.copy(bs).applyMatrix4(o.matrixWorld);const d=(sp.center.x-px)*fx+(sp.center.y-py)*fy+(sp.center.z-pz)*fz;if(d+sp.radius<-30){passe++;}}}
     for(const c of o.children)f(c,v9);})(sc,true);
   return {tot,vis,mesh,auto,sansTri,passe,invis};};
 S.go=function(ms){S.par={};S.ex={};S.cat={};S.img=0;S.nImg=0;for(const k in S.ms)S.ms[k]=0;S.tr=[0,0,0,0,0,0,0,0];S.nL=0;let vu=window.dbgJsImage?dbgJsImage().nLoop:0;S.graphe=[];S.on=true;const t0=performance.now();
   return new Promise(okk=>{const iv=setInterval(()=>{S.graphe.push(S.graphe1());},1000);
     (function f(){ok=false;if(window.dbgJsImage){const g=dbgJsImage();if(g.nLoop!==vu){vu=g.nLoop;S.nL++;for(let k=0;k<8;k++)S.tr[k]+=g.tr[k];}}if(performance.now()-t0<ms){requestAnimationFrame(f);}else{clearInterval(iv);S.on=false;S.img=S.nImg;okk(S.res());}})();});};
 S.chemin=function(o){const L=[];let p=o,car=false;while(p&&p!==sc){if(p===CAR)car=true;L.push((p.name||p.type)+(p.parent?'#'+p.parent.children.indexOf(p):''));p=p.parent;}
   const u=Object.keys(o.userData||{}).slice(0,6).join(',');const mt=o.material||{};
   return (car?'CAISSE ':'')+L.slice(0,5).join(' < ')+' {'+u+'} mat:'+(mt.name||'')+(mt.blending===2?' add':'')+(mt.transparent?' tr':'')+(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender?' obr':'')+' pos:'+o.position.toArray().map(Math.round).join(',');};
 S.autoPar=function(){const out=[];sc.children.forEach(function(g,i){let a=0,ai=0,t=0;(function f(o,vu){t++;const v9=vu&&o.visible;if(o.matrixAutoUpdate){a++;if(!v9)ai++;}for(const c of o.children)f(c,v9);})(g,true);if(a>=8)out.push(['sc#'+i+(g.name?':'+g.name:''),t,a,ai]);});return out.sort((x,y)=>y[2]-x[2]).slice(0,25);};
 /* LA MESURE APPARIÉE : `bascule(on)` alterne toutes les `k` images ; les 2 images après chaque bascule ne comptent pas */
 S.alt=function(ms,bascule,k){k=k||20;const A={on:{img:0,n:0,t:0,rendu:0,mat:0,omb:0,boucle:0},off:{img:0,n:0,t:0,rendu:0,mat:0,omb:0,boucle:0}};let etat=true,fr=0,skip=2;bascule(true);
   let n0=0,t0=0,r0=0,m0=0,o0=0;const tot=()=>{let n=0,t=0;for(const k9 in S.par){n+=S.par[k9].n;t+=S.par[k9].t;}return [n,t];};
   S.par={};S.ex={};S.cat={};S.on=true;for(const q in S.ms)S.ms[q]=0;let vu=window.dbgJsImage?dbgJsImage().nLoop:0;const T0=performance.now();
   return new Promise(ok9=>{(function f(){ok=false;const P=tot();const c=etat?A.on:A.off;let bo=0;if(window.dbgJsImage){const g=dbgJsImage();if(g.nLoop!==vu){vu=g.nLoop;for(let q=0;q<8;q++)bo+=g.tr[q];}}
     if(skip>0)skip--;else{c.img++;c.n+=P[0]-n0;c.t+=P[1]-t0;c.rendu+=S.ms.rendu-r0;c.mat+=S.ms.matrices-m0;c.omb+=S.ms.ombre-o0;c.boucle+=bo;}
     n0=P[0];t0=P[1];r0=S.ms.rendu;m0=S.ms.matrices;o0=S.ms.ombre;
     if(++fr%k===0){etat=!etat;bascule(etat);skip=2;}
     if(performance.now()-T0<ms)requestAnimationFrame(f);else{S.on=false;bascule(true);const R={};for(const q of ['on','off']){const c=A[q],d=Math.max(1,c.img);R[q]={images:c.img,appels:+(c.n/d).toFixed(2),tri:Math.round(c.t/d),rendu:+(c.rendu/d).toFixed(3),matrices:+(c.mat/d).toFixed(3),ombre:+(c.omb/d).toFixed(3),boucle:+(c.boucle/d).toFixed(3)};}ok9(R);}})();});};
 /* LA MESURE SUR IMAGE FIGÉE : rAF coupé, la course avance par dbgStep ; à chaque cliché, la MÊME image (dt ≈ 0) redessinée dans chaque état de `etats`
    ({nom:fn(…)}), `rep` fois chacun ; rend par état : appels, triangles de la passe principale, ms du rendu et de la boucle entière, et le mode (sol/vol). */
 S.fige=async function(K,pas,etats,rep,photos){S.photos=[];const dors=ms=>new Promise(r=>setTimeout(r,ms));rep=rep||2;const R={},noms=Object.keys(etats);for(const e of noms)R[e]={n:0,app:0,tri:0,rendu:0,boucle:0,vol:0};
   const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(){return 0;};
   const tot=()=>{let n=0,t=0;for(const k9 in S.par){n+=S.par[k9].n;t+=S.par[k9].t;}return [n,t];};
   S.par={};S.ex={};S.cat={};S.on=true;
   try{for(let k=0;k<K;k++){for(let q=0;q<pas;q++){dbgStep(1,33);await dors(36);}const vol=dbgState().mode==='fall';
     for(let r=0;r<rep;r++)for(const e of noms){etats[e]();await dors(40);dbgStep(1,.001);/* l'état posé, une image pour que le LOD le prenne (la cadence saute une image trop proche : on attend 40 ms) */
       await dors(40);const P0=tot(),r0=S.ms.rendu,t0=performance.now();dbgStep(1,.001);const dt=performance.now()-t0,P1=tot();if(P1[0]===P0[0])continue;if(photos&&r===0&&photos.indexOf(k)>=0){try{S.photos.push([k,e,D.rdr.domElement.toDataURL('image/jpeg',.72)]);}catch(x){}} /* image sautée : ne compte pas */
       const c=R[e];c.n++;c.app+=P1[0]-P0[0];c.tri+=P1[1]-P0[1];c.rendu+=S.ms.rendu-r0;c.boucle+=dt;if(vol)c.vol++;}}}
   finally{S.on=false;window.requestAnimationFrame=raf;for(const e of noms){}}
   for(const e of noms){const c=R[e],d=Math.max(1,c.n);R[e]={images:c.n,partVol:+(c.vol/d).toFixed(2),appels:+(c.app/d).toFixed(2),tri:Math.round(c.tri/d),rendu:+(c.rendu/d).toFixed(3),boucle:+(c.boucle/d).toFixed(3)};}
   return R;};
 S.res=function(){const n=Math.max(1,S.img),L=[];let T={n:0,t:0,der:0,tder:0,hors:0,ombre:0,tombre:0,ombreDer:0,post:0,inst:0,instDer:0};
   for(const k in S.par){const a=S.par[k];for(const q in T)T[q]+=a[q];L.push([k+' ⟶ '+(S.ex[k]?S.chemin(S.ex[k]):'')+(a.db?' dist:'+a.db.map(x=>+(x/n).toFixed(1)).join('/'):''),+(a.n/n).toFixed(2),Math.round(a.t/n),+(a.der/n).toFixed(2),Math.round(a.tder/n),+(a.hors/n).toFixed(2),+(a.ombre/n).toFixed(2),+(a.ombreDer/n).toFixed(2),a.inst?+(a.instDer/a.inst).toFixed(2):null]);}
   for(const q in T)T[q]=+(T[q]/n).toFixed(1);
   L.sort((x,y)=>(y[1]+y[6])-(x[1]+x[6]));
   const G=S.graphe,gm={};if(G.length)for(const q in G[0])gm[q]=Math.round(G.reduce((s,x)=>s+x[q],0)/G.length);
   const ms={};for(const k in S.ms)ms[k]=+(S.ms[k]/n).toFixed(3);
   const cat={};for(const k in S.cat){const C=S.cat[k];cat[k]={appels:+(C.n/n).toFixed(1),tri:Math.round(C.t/n),parDistance:C.d.map(x=>+(x/n).toFixed(1)),triParDistance:C.dt.map(x=>Math.round(x/n))};}
   return {autoPar:S.autoPar(),images:S.img,ms:ms,cat:cat,distances:'[inst/sans sphère, <200, 200-400, 400-800, 800-1600, >1600 m]',tranches:S.tr.map(x=>+(x/Math.max(1,S.nL)).toFixed(3)),parImage:T,graphe:gm,err:S.err||null,colonnes:'nom,appels,tri,appelsDerriere,triDerriere,horsChamp,ombre,ombreDerriere,partInstDerriere',objets:L.slice(0,70)};};
 return 1;})()
