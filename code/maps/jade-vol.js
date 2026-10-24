/* ---- LE TRI : à chaque rendu (chaîné sur scene.onBeforeRender), les quartiers dans le champ et en deçà de la brume, chacun à sa BANDE
   de distance (jadeBande) ; chaque famille dessine les bandes qui sont les siennes. Les tampons ne repartent que si la liste a changé. ---- */
const JT={fr:new THREE.Frustum(),pv:new THREE.Matrix4(),vis:null,ms:0,n:0,up:0,fam:0};
/* (v8) LES MONTAGNES PROCHES (≤ FIN.D, +25 m pour en sortir) passent aux cubes minuscules — rend une signature (le tri ne recopie que si elle change) */
function finProches(cp){
  if(!FIN.on||!JADE.col||!FIN.stamp)return 7;FIN.veut.clear();
  const C=JADE.col,P=C.P,D=FIN.D,r=Math.ceil((D+110)/C.CG),bx=Math.floor(cp.x/C.CG),bz=Math.floor(cp.z/C.CG),gen=++FIN.gen,o=FIN.near,par=FIN.par||(FIN.par=[]);
  o.length=0;par.length=0;
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=C.g.get((bx+dx)+','+(bz+dz));if(!a)continue;
    for(let j=0;j<a.length;j++){const k=a[j];if(k<0||FIN.stamp[k]===gen)continue;FIN.stamp[k]=gen;const q=P[k];if(!FIN.fam[q[5]]){FIN.veut.add(q[5]);continue;}
      const dh=Math.max(0,Math.hypot(q[0]-cp.x,q[1]-cp.z)-q[2]),dv=cp.y<q[3]?q[3]-cp.y:cp.y>q[4]?cp.y-q[4]:0;
      if(Math.hypot(dh,dv)<(FIN.was[k]?D+25:D))o.push(k);}}
  for(const k of FIN.dans)FIN.was[k]=0;FIN.dans.clear();
  o.sort(function(a,b){return a-b;});const n9=new Map();let sg=7;
  for(const k of o){const t=P[k][5],c=n9.get(t)||0;if(c>=FIN.fam[t].cap)continue;n9.set(t,c+1);FIN.dans.add(k);FIN.was[k]=1;sg=(Math.imul(sg,31)+k+1)|0;}
  return sg;}
function finFamille(t){const T9=JADE.geos.p[t],cap=FIN.cap&&FIN.cap[t];if(!T9||!T9.fin||!cap||!JADE.root||FIN.fam[t])return; // la famille fine d'un gabarit (quand il est prêt)
  const M9=jadeMats(),g=jadeVueGeo(T9.fin),aJ=new THREE.InstancedBufferAttribute(new Float32Array(cap*4),4);aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aJ',aJ);
  const mk=(mat,ro)=>{const im=new THREE.InstancedMesh(g,mat,cap);im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=ro;im.count=0;im.visible=false;JADE.root.add(im);return im;};
   // (v10) les ÉCAILLES du vitrail : une passe opaque
  const im=mk(M9.vr,3),im2=mk(M9.vrX,2),im3=mk(M9.vrP,2.5);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im2.instanceMatrix=im.instanceMatrix;im3.instanceMatrix=im.instanceMatrix;
  FIN.fam[t]={t:t,im:im,im2:im2,im3:im3,aJ:aJ,cap:cap,tri:T9.fin.index.count/3};}
function finTravail(budget){ // (v8) les gabarits fins se bâtissent À LA VOLÉE, quelques ms par image (le départ n'attend pas) — d'abord ceux qu'on approche
  if(!FIN.on||!JADE.geos||!JADE.root)return;const P9=JADE.geos.p,t0=performance.now();
  while(performance.now()-t0<budget){
    if(!FIN.job){let t=-1;for(const k of FIN.veut)if(!P9[k].fin&&!P9[k].finX){t=k;break;}
      if(t<0)for(let k=0;k<P9.length;k++)if(!P9[k].fin&&!P9[k].finX&&FIN.cap&&FIN.cap[k]){t=k;break;}
      if(t<0)return;FIN.job={t:t,it:voxPilierFin(P9[t]),t0:performance.now(),ms:0};}
    const j9=FIN.job,a9=performance.now();let r;
    try{r=j9.it.next();}catch(e){P9[j9.t].finX=1;FIN.job=null;console.warn('cubes fins',e);continue;}
    j9.ms+=performance.now()-a9;
    if(r.done){P9[j9.t].fin=r.value;P9[j9.t].finMs=Math.round(j9.ms);FIN.job=null;finFamille(j9.t);JADE.sig=0;}}}
function finMat(pi){let m=FIN.mats.get(pi);if(m)return m;const q=JADE.col.P[pi],T9=JADE.geos.p[q[5]],K=FIN.k;
  m=new Float32Array(new THREE.Matrix4().makeTranslation(q[0],q[3],q[1]).multiply(new THREE.Matrix4().makeRotationY(q[6]*Math.PI/2)).multiply(new THREE.Matrix4().makeScale(VX/K,VX/K,VX/K)).multiply(new THREE.Matrix4().makeTranslation(-T9.M*K,0,-T9.M*K)).elements);
  FIN.mats.set(pi,m);return m;}
function jadeTri(cam){
  if(!JADE.root||!JADE.quart||!JADE.fam.length)return;const t0=performance.now();
  JT.fr.setFromProjectionMatrix(JT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const f=scene.fog,ff=(f&&f.isFog)?f.far:9000,cp=cam.position,Qs=JADE.quart,S=JT._s||(JT._s=new THREE.Sphere());
  if(!JT.vis||JT.vis.length!==Qs.length)JT.vis=new Int8Array(Qs.length);
  let sig=finProches(cp);
  for(let k=0;k<Qs.length;k++){const q=Qs[k];S.center.copy(q.c);S.radius=q.r;let v=-1;
    if(JT.fr.intersectsSphere(S)){const b=q.b,ex=Math.max(b[0]-cp.x,0,cp.x-b[1]),ey=Math.max(b[2]-cp.y,0,cp.y-b[3]),ez=Math.max(b[4]-cp.z,0,cp.z-b[5]),d=Math.sqrt(ex*ex+ey*ey+ez*ez);if(d<ff+60)v=jadeBande(d);} // (v17) la distance à la BOÎTE du quartier (la sphère comptait la hauteur des montagnes : tout restait en détail max à 700 m)
    JT.vis[k]=v;if(v>=0)sig=(Math.imul(sig,31)+k*8+v+1)|0;}
  /* (v17, Léo : « ça bugue énormément ») — MESURÉ : un tiers du temps de l'image partait dans bufferSubData — à chaque quartier qui changeait de
     bande, TOUTES les familles renvoyaient TOUT leur tampon (les 60 000 arbres compris). Désormais une famille ne se réécrit que si SA liste
     change (sa signature : ses quartiers retenus + ses montagnes cédées) ou si l'effondrement l'a salie, et n'envoie que la partie utile
     (updateRange). Les montagnes cédées aux cubes fins sont RETIRÉES de la liste (l'ordre des instances ne compte pas : multiplier, ajouter,
     écrire la profondeur ne dépendent pas de l'ordre) — écrasées en un point, leurs sommets passaient encore trois fois par le GPU. */
  if(sig!==JADE.sig||JADE.sale){const tout=JADE.sig===0;JADE.sig=sig;JADE.sale=false;JT.up++;
    for(const F of JADE.fam){let fs=7;
      const RK=F.rK,RA=F.rA,RB=F.rB,nR=RK.length; /* (2026-10-14, passe mobile) MESURÉ (échantillonneur du tas, course au pilote) : jadeTri jetait ~7 Mo/s — `for(const [k,r] of F.r)`
         fabrique un tableau [clé, valeur] par quartier, pour chaque famille, à chaque changement de signature. Le ramasse-miettes passait
         sans cesse (des à-coups). Mêmes quartiers, même ordre (celui de la Map), lus dans trois tableaux d'entiers. */
      for(let i=0;i<nR;i++){const k=RK[i],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;fs=(Math.imul(fs,31)+k+1)|0;}
      if(F.pidx&&FIN.dans.size)for(const pi of FIN.dans)if(F.pidx.has(pi))fs=(Math.imul(fs,17)+pi+3)|0;
      if(!tout&&!F.sale&&fs===F.sig)continue;F.sig=fs;F.sale=false;JT.fam++;
      let w=0;const A=F.im.instanceMatrix.array,J=F.aJ.array;
      for(let i=0;i<nR;i++){const k=RK[i],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;if(F.dst)F.dst.set(k,w);const r0=RA[i],r1=RB[i];
        A.set(F.M.subarray(r0*16,r1*16),w*16);J.set(F.J.subarray(r0*4,r1*4),w*4);w+=r1-r0;}
      if(F.pidx&&FIN.dans.size){const ds=JT.ds||(JT.ds=[]);ds.length=0;
        for(const pi of FIN.dans){const si=F.pidx.get(pi);if(si===undefined)continue;const k=F.qk[si],v=JT.vis[k];if(v<F.b0||v>F.b1)continue;const d0=F.dst.get(k);if(d0===undefined)continue;ds.push(d0+si-F.r.get(k)[0]);}
        ds.sort(function(a,b){return b-a;});
        for(const d of ds){w--;if(d!==w){A.copyWithin(d*16,w*16,w*16+16);J.copyWithin(d*4,w*4,w*4+4);}}}
      F.im.count=w;if(F.im2){F.im2.count=w;F.im3.count=w;}
      /* (2026-10-14, passe mobile) VIDE = INVISIBLE. MESURÉ (dbgAppels, départ du Soleil de jade) : 47 des 269 appels de dessin de l'image
         étaient des familles à ZÉRO montagne — three les prépare quand même (programme, uniformes, tampons) et lance un dessin de 0 exemplaire :
         17 % du travail de rendu du processeur pour rien. Les cubes fins (FIN, plus bas) le faisaient déjà. F.coupe = les bancs dbgJadePoste. */
      F.im.visible=w>0&&!F.coupe;if(F.im2)F.im2.visible=F.im3.visible=w>0&&!F.coupe&&!F.coupeV;
      if(w){F.im.instanceMatrix.updateRange.offset=0;F.im.instanceMatrix.updateRange.count=w*16;F.im.instanceMatrix.needsUpdate=true;F.aJ.updateRange.offset=0;F.aJ.updateRange.count=w*4;F.aJ.needsUpdate=true;}}
    for(const FF of FIN.fam){if(!FF)continue;let n=0,fs=7;for(const pi of FIN.dans)if(JADE.col.P[pi][5]===FF.t)fs=(Math.imul(fs,31)+pi+1)|0; // les CUBES MINUSCULES
      if(!tout&&!FIN.sale&&fs===FF.sig)continue;FF.sig=fs;const A=FF.im.instanceMatrix.array,J=FF.aJ.array;
      for(const pi of FIN.dans){const q=JADE.col.P[pi];if(q[5]!==FF.t)continue;A.set(finMat(pi),n*16);J[n*4]=q[7];J[n*4+1]=q[8]<2000||q[8]===1e9?1:.85;J[n*4+2]=0;J[n*4+3]=0;n++;}
      FF.im.count=FF.im2.count=FF.im3.count=n;FF.im.visible=FF.im2.visible=FF.im3.visible=n>0;
      if(n){FF.im.instanceMatrix.updateRange.offset=0;FF.im.instanceMatrix.updateRange.count=n*16;FF.im.instanceMatrix.needsUpdate=true;FF.aJ.updateRange.offset=0;FF.aJ.updateRange.count=n*4;FF.aJ.needsUpdate=true;}}
    FIN.sale=false;}
  JT.ms+=performance.now()-t0;JT.n++;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{jadeTri(cam);if(JADE.root&&NUVOX.L)nuvoxTri(cam);}catch(e){window.__jadeErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* ---- LA LUMIÈRE FANTÔME (v5) ----
   · LES RAYONS : de longs pans de lumière pâle qui tombent en biais à travers la brume entre les montagnes (additifs, tournés vers la
     caméra autour de leur axe, effilés aux deux bouts, qui ondulent lentement) — posés le long de la route à chaque vallée (`jadeRayons`).
   · LES ESPRITS : des poussières de lumière qui flottent et montent doucement autour de la caméra, scintillent, s'éteignent près de
     l'objectif (un nuage de points qui se replie autour d'elle : l'espace en est rempli sans en poser des millions). */
const JADE_RAYON_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{uTime:JADE_U.uTime,uAx:{value:new THREE.Vector3(SUN_DIR.x,.55,SUN_DIR.z).normalize()},uCol:{value:new THREE.Color(1,.96,.86)}},
  vertexShader:['attribute vec3 aC;attribute vec4 aW;uniform vec3 uAx;varying vec2 vP;varying vec4 vWw;varying float vF;',
    'void main(){vec3 tc=normalize(cameraPosition-aC),W=normalize(cross(uAx,tc)+vec3(1e-4,0.,0.));',
    '  vec3 wp=aC+uAx*position.y*aW.y+W*position.x*aW.x*(1.+.6*(position.y+.5));vP=position.xy;vWw=aW;',
    '  float d=length(cameraPosition-wp);vF=smoothstep(2600.,900.,d)*smoothstep(40.,220.,d);',
    '  gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}'].join('\n'),
  fragmentShader:['uniform float uTime;uniform vec3 uCol;varying vec2 vP;varying vec4 vWw;varying float vF;',
    'void main(){float ac=1.-abs(vP.x*2.),al=sin((vP.y+.5)*3.1416);float n=.55+.45*sin(vP.y*6.+uTime*.25+vWw.z*20.)*sin(vP.x*9.+vWw.z*7.+uTime*.15);',
    '  float a=ac*ac*al*n*vWw.w*vF;gl_FragColor=vec4(mix(vec3(1.,.62,.84),uCol,smoothstep(0.,.55,ac))*a,a);}'].join('\n')});m.dispose=function(){};return m;})(); /* (2026-10-21, embellie) deux températures : le cœur du rai prend la couleur du soleil (jadeTick : doré au soir, bleu pâle la nuit), ses franges le rose */
function jadeRayons(L9){ // [x, y, z, largeur, longueur, graine, intensité]
  const P=[],C=[],W=[],I=[];
  for(let k=0;k<L9.length;k++){const q=L9[k],b=P.length/3;for(const v of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){P.push(v[0],v[1],0);C.push(q[0],q[1],q[2]);W.push(q[3],q[4],q[5],q[6]);}I.push(b,b+1,b+2,b,b+2,b+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aC',new THREE.Float32BufferAttribute(C,3));
  g.setAttribute('aW',new THREE.Float32BufferAttribute(W,4));g.setIndex(I);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);return g;}
const JADE_ESPRITS=(function(){const N=TEL_NATIF?900:2400,S=700,P=new Float32Array(N*3),A=new Float32Array(N),rg=mulberry32(0xE5B1);
  for(let k=0;k<N;k++){P[k*3]=(rg()-.5)*S;P[k*3+1]=(rg()-.5)*S;P[k*3+2]=(rg()-.5)*S;A[k]=rg();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aS',new THREE.BufferAttribute(A,1));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);
  /* (2026-10-21, embellie — le DÉTAIL VIVANT de Jade) la même volée de points, trois genres : les lucioles d'avant (elles montent, rondes) ; des PÉTALES rose et or
     (aS < .16 : ils TOMBENT en tournoyant, ovales) ; des ÉCLATS DE JADE CARRÉS (aS > .90 : de petits pixels de lumière verte, l'écho des cubes). Aucun point de plus,
     aucun programme de plus, aucun travail par point côté processeur : tout est dans le vertex shader (le genre sort de aS). */
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uTime:JADE_U.uTime,uCam:{value:new THREE.Vector3()},uPx:{value:1},uK:{value:0}},
    vertexShader:['attribute float aS;uniform vec3 uCam;uniform float uTime,uPx;varying float vA,vG,vR;varying vec3 vC;',
      'void main(){vec3 p=position;float pe=step(aS,.16),px=step(.90,aS);',
      '  p.y+=uTime*mix(1.5+aS*3.5,-(1.1+aS*6.),pe);p.x+=sin(uTime*.3+aS*30.)*14.*(1.+pe*.9);p.z+=cos(uTime*.25+aS*20.)*14.*(1.+pe*.9);',
      '  vec3 rel=mod(p-uCam+350.,700.)-350.;vec4 mv=viewMatrix*vec4(uCam+rel,1.);float d=-mv.z;',
      '  vA=(.35+.65*(.5+.5*sin(uTime*(.8+aS*2.)+aS*50.)))*smoothstep(345.,140.,length(rel))*smoothstep(3.,14.,d);',
      '  float h9=fract(aS*7.31);vC=h9<.45?vec3(1.,.82,.45):h9<.75?vec3(1.,.60,.86):vec3(.62,.96,1.);', // (v17) FÉERIQUE : des lucioles d or, de rose et de turquoise
      '  if(pe>.5)vC=h9<.5?vec3(1.,.60,.80):vec3(1.,.84,.46);if(px>.5)vC=vec3(.40,1.,.72);',                // les pétales : le rose et l or de la marque ; les éclats : le vert jade
      '  vG=pe+2.*px;vR=uTime*(.7+aS*2.2)+aS*40.;',
      '  gl_PointSize=uPx*(1.9+aS*3.2)*(1.+pe*.7)*min(8.,340./max(d,1.));gl_Position=projectionMatrix*mv;}'].join('\n'),
    fragmentShader:['uniform float uK;varying float vA,vG,vR;varying vec3 vC;void main(){vec2 q=gl_PointCoord-.5;float a;',
      '  if(vG>1.5){q=abs(q)*2.;float r=max(q.x,q.y);a=(smoothstep(1.,.6,r)*.8+exp(-r*r*3.)*.25)*vA*uK;}',                                  // l éclat : un carré net
      '  else if(vG>.5){float c=cos(vR),s=sin(vR);q=vec2(c*q.x-s*q.y,s*q.x+c*q.y)*2.;q.y*=2.3;float r=length(q);a=(exp(-r*r*3.5)+.3*exp(-r*r*20.))*vA*uK;}', // le pétale : un ovale qui tourne
      '  else{float r=length(q)*2.;a=(exp(-r*r*4.5)+.35*exp(-r*r*40.))*vA*uK;}',
      '  gl_FragColor=vec4(vC*a*1.25,a);}'].join('\n')});
  const pt=new THREE.Points(g,m);pt.frustumCulled=false;pt.renderOrder=6;pt.visible=false;scene.add(pt);return pt;})();
const JADE_C9=new THREE.Color();
const JADE_NUAGE_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uTex:{value:null},uTime:JADE_U.uTime,uTeinte:{value:new THREE.Color(1,1,1)},uFogC:{value:new THREE.Color(.8,.86,.88)},uSunD:JADE_U.uSunDir,uSunC:JADE_U.uSunC},
  vertexShader:['attribute vec4 aJ;uniform float uTime;varying vec2 vUv;varying float vD,vFl,vC;varying vec3 vR,vU,vF;',
    'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float sd=fract(aJ.w);vC=floor(aJ.w);', // la graine ; la couche (0 devant, 1 le voile de derrière)
    '  c.y+=sin(uTime*.07+sd*40.)*aJ.y*.03;c.x+=sin(uTime*.013+sd*9.)*40.;',
    '  vec3 f=normalize(c-cameraPosition),R=normalize(cross(f,vec3(0.,1.,0.))+vec3(1e-4,0.,0.)),U=cross(R,f);vR=R;vU=U;vF=-f;', // face à la caméra, debout
    '  vec3 wp=c+R*position.x*aJ.x+U*position.y*aJ.y;vD=length(wp-cameraPosition);',
    '  float k=aJ.z,col=mod(k,4.),row=floor(k/4.),u=position.x+.5;vFl=1.;if(sd>.5){u=1.-u;vFl=-1.;}',
    '  vUv=vec2((col+u)*.25,1.-(row+1.)*.25+(position.y+.5)*.25);',
    '  gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}'].join('\n'),
  fragmentShader:['uniform sampler2D uTex;uniform vec3 uTeinte,uFogC,uSunD,uSunC;varying vec2 vUv;varying float vD,vFl,vC;varying vec3 vR,vU,vF;',
    'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.01)discard;',
    '  vec2 e=vec2(1.5/2048.,1.5/1024.);',
    '  float hx=(texture2D(uTex,vUv+vec2(e.x,0.)).r-texture2D(uTex,vUv-vec2(e.x,0.)).r)*vFl,hy=texture2D(uTex,vUv+vec2(0.,e.y)).r-texture2D(uTex,vUv-vec2(0.,e.y)).r;',
    '  vec3 n=normalize(vec3(-hx*18.,-hy*18.,1.)),L=normalize(vec3(dot(uSunD,vR),dot(uSunD,vU),dot(uSunD,vF)));', // la normale du relief, le soleil dans le repère du panneau
    '  float h=t.r,dif=max((dot(n,L)+.3)/1.3,0.);',
    '  vec3 amb=mix(vec3(.50,.64,.70),vec3(.93,.96,.97),n.y*.5+.5);',                     // l ombre jade-bleue dessous, le ciel dessus
    '  vec3 col=vec3(.97,.97,.94)*(amb*.62+uSunC*dif*.48);',
    '  col*=1.-t.g*.2;col+=uSunC*pow(1.-h,3.)*max(-L.z,0.)*.22;',                        // la spirale un peu plus sombre ; le contre-jour dans les bords minces
    '  col*=uTeinte;col=mix(col,uFogC,smoothstep(1500.,7500.,vD)*.55+vC*.2);',
    '  float a=t.a*(.22+.58*smoothstep(0.,.45,h))*(1.-vC*.5);',                          // l opacité suit l épaisseur ; le voile de derrière à moitié
    '  gl_FragColor=vec4(col,a*smoothstep(80.,320.,vD)*(1.-smoothstep(7800.,9400.,vD)));}'].join('\n')});m.dispose=function(){};return m;})();
/* (v13, Léo : « les nuages en cubes minuscules ») LES VOLUTES EN CUBES — les seize dessins en relief deviennent de vrais VOLUMES de petits
   cubes : la grille 96 × 48 relit la carte de hauteur (épaisseur = la hauteur, de part et d'autre d'un plan médian : des lobes ronds, la
   base en coussins, la queue en tube), les spirales creusées gardent leur ombre (matière 2), le maillage glouton pose l'ombre aux coins
   (`aAO`). Un cube = la largeur du nuage ÷ 96 (8-20 m). Chaque nuage est TOURNÉ vers la route (sa face large vers qui passe) ; le
   « miroir » d'un dessin, c'est le même vu de l'autre côté (le volume est symétrique). Éclairés au soleil de la map, une ombre jade-lavande,
   chaque cube sa nuance, la perspective aérienne du loin. */
const NUVOX={GX:96,GY:48,geos:null};
/* (2026-10-14, passe perf mobile) LES VOLUTES PAR PALIER — MESURÉ (iPhone 7 émulé, Soleil de jade) : 353 000 triangles par image rien que
   pour les nuages en cubes (un tiers de l'image ; la puce d'un iPhone 7 souffre au-delà de ~300 000 en tout). On garde TOUS les nuages, à
   la même place et à la même taille ; seuls leurs cubes grossissent sur les vieux appareils (chaque cran = ¼ des triangles) :
     jadeNuvoxPres  : en deçà, les petits cubes (avant : 2 500 m). De là à 2 500 m, les cubes DOUBLES posés à l'échelle ×2 (même volume).
     jadeNuvoxQuart : au-delà, les cubes QUADRUPLES (grille ÷ 4, posés ×2 : la carrure exacte du nuage lointain d'avant, 1/16 des triangles).
   Palier 2 : 2 500 / jamais = le tri d'avant, au triangle près (le 3e jeu de maillages n'est même pas construit). */
PAL.B.jadeNuvoxPres=[0,1500,2500];PAL.B.jadeNuvoxQuart=[2500,5000,1e9];
NUVOX.pres=PAL.b('jadeNuvoxPres',2500);NUVOX.qd=PAL.b('jadeNuvoxQuart',1e9);NUVOX.pas=NUVOX.qd<1e8?3:2; // pas = maillages par dessin (petits, doubles[, quadruples])
/* LE TRI DES VOLUTES (à chaque rendu, chaîné sur jadeTri) : seules celles dans le champ partent au GPU, de près en petits cubes, de loin en gros */
function nuvoxM2(n){const m=n.m2=Float32Array.from(n.m);for(let i=0;i<12;i++)m[i]*=2;return m;} // la même pose, les trois axes doublés (la grille ÷ 2 retrouve sa taille) — fait une fois par nuage, à la demande
function nuvoxTri(cam){const N9=NUVOX.L;if(!N9||!N9.length)return;let sg=7;
  for(let i=0;i<N9.length;i++){const n=N9[i];NUVOX.S.center.copy(n.c);NUVOX.S.radius=n.r;let v=0;if(JT.fr.intersectsSphere(NUVOX.S)){const d9=cam.position.distanceTo(n.c);v=d9<NUVOX.pres?1:d9<2500?(NUVOX.pres<2500?3:1):d9<NUVOX.qd?2:4;}n.v=v;sg=(Math.imul(sg,31)+v)|0;}
  if(sg===NUVOX.sig)return;NUVOX.sig=sg;
  for(const im of NUVOX.ims){im.count=0;}
  for(const n of N9){if(!n.v)continue;const v=n.v,im=NUVOX.ims[n.t*NUVOX.pas+(v===1?0:v===4?2:1)];im.instanceMatrix.array.set(v>2?(n.m2||nuvoxM2(n)):n.m,im.count*16);im.count++;} // (2026-10-14, passe perf mobile) v : 1 petits cubes · 2 doubles (le lointain d'avant) · 3 doubles à l'échelle ×2 · 4 quadruples à l'échelle ×2
  for(const im of NUVOX.ims){imEnvoi(im,im.count);im.visible=im.count>0;}} // (2026-10-14, passe perf mobile) [0,count) vient d'être réécrit : seul ce bout part (et rien pour un jeu vide)
const JADE_NUVOX_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:true,
  uniforms:{uTeinte:JADE_NUAGE_M.uniforms.uTeinte,uFogC:JADE_NUAGE_M.uniforms.uFogC,uSunD:JADE_U.uSunDir,uSunC:JADE_U.uSunC},
  vertexShader:['attribute float aM,aAO;varying vec3 vO,vNo,vN;varying float vM,vAO,vD;',
    'void main(){mat4 mw=modelMatrix*instanceMatrix;vec4 wp=mw*vec4(position,1.);vO=position;vNo=normal;vN=normalize(mat3(mw)*normal);vM=aM;vAO=aAO;',
    '  vD=length(wp.xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
  fragmentShader:['uniform vec3 uTeinte,uFogC,uSunD,uSunC;varying vec3 vO,vNo,vN;varying float vM,vAO,vD;',
    'void main(){vec3 N=normalize(vN);float dif=max((dot(N,uSunD)+.35)/1.35,0.);',
    '  vec3 c=mix(vec3(.62,.68,.78),vec3(1.,.98,.94)*uTeinte,dif)*mix(.72,1.,vAO);',                    // (v17) féerique : le ventre lilas, le dessus crème doré                   // la lumière dessus, l ombre jade-lavande dessous, l ombre des coins
    '  vec3 q=floor(vO-vNo*.5+.001);c*=.95+.09*fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);', // chaque cube sa nuance
    '  if(vM>1.5)c*=.80;c*=mix(vec3(1.),uSunC*.6+.4,.25);',                               // la spirale creusée ; le soleil de la map
    '  c+=vec3(.06,.01,.05)*(1.-dif)*(1.-dif);',                                                       // une pointe de rose dans l ombre
    '  c=mix(c,uFogC,smoothstep(1500.,7500.,vD)*.55);',
    '  gl_FragColor=vec4(c,.88*smoothstep(80.,320.,vD)*(1.-smoothstep(7800.,9400.,vD)));}'].join('\n')});m.dispose=function(){};return m;})();
/* ---- CHAQUE IMAGE : les lumières du niveau dans la matière (une Lambert les lirait d'elle-même), l'horloge, la brume ---- */
function jadeTick(dt){
  {const on=!!JADE.root&&LVL.cur&&LVL.cur.id==='jade';if(JADE_ESPRITS.visible!==on)JADE_ESPRITS.visible=on;if(on){const u=JADE_ESPRITS.material.uniforms;u.uCam.value.copy(camera.position);u.uPx.value=renderer.getPixelRatio();u.uK.value=Math.min(1,u.uK.value+dt*.5);}}
  if(!JADE.root)return;
  if(JADE.photo&&paused&&acesPass){acesPass.uniforms.uSpeed.value=0;loop._sfx=0;}
  if(BALADE&&running&&!gameOver){
    {const m9=Math.min(ENGINE_TIERS.length-1,BALADE_MOTEUR);if(engTier!==m9){engTier=m9;coinsGot=ENGINE_TIERS[m9].coins;}} // le moteur de la balade, posé tel quel (sans la scène du palier)
    if(!nitroOn)nitroR=Math.min(nitroCap(),nitroR+.30*dt);} // sans pièces ni fruits, la nitro se recharge seule // (dev) dbgJadeVue : une image NETTE (le flou de vitesse figé par la pause)
  JADE_U.uTime.value+=dt;if(!paused)skyU.uEauT.value+=dt;
  finTravail(paused?12:4);
  try{jadeEauTick(dt);}catch(e){window.__jadeErr=e;}
  if(!paused){try{jadeChuteTick(dt);}catch(e){window.__jadeErr=e;}}
  if(!JADE.t0&&started)JADE.t0=performance.now();
  if(JADE.monu)for(const o of JADE.monu)if(o.loIt){jadeMonuLoinPas(o);break;} // (2026-10-14, passe perf mobile) une tranche du monument de loin par image (voir jadeMonuLoinPas)
  if(JADE.monu){const ff=(scene.fog&&scene.fog.far)||2600;for(const o of JADE.monu){const d9=camera.position.distanceTo(o.c)-o.r,v=d9<ff+80;if(o.g.visible!==v)o.g.visible=v; // (v17) au-delà de la brume : pas dessinés…
    let dv9=d9;if(o.dP){const P9=o.dP,cp=camera.position,u9=(cp.x-P9.c.x)*P9.t.x+(cp.z-P9.c.z)*P9.t.z;dv9=Math.max(d9,u9<0?-u9-P9.D/2:(u9-P9.D/2>30?1e9:0));} /* (2026-10-14, passe perf mobile) la Porte allégée : la distance à sa façade, et rien derrière soi (voir jadePorteVerre) */
    const lo=dv9>(JADE_LOD.mv||450);if(o.L&&lo!==o.loin){o.loin=lo;o.L[1].visible=o.L[2].visible=!lo;o.L[0].material=lo?JADE_M.vrOM:JADE_M.vrM;o.L[0].renderOrder=lo?0:3;if(o.lo){o.lo.visible=lo;o.L[0].visible=!lo;}/* (2026-10-14, passe perf mobile) de loin, le maillage allégé à la place du plein (jadeMonuLoin) */}}} // …et à plus de 450 m, une seule passe opaque (le verre en trois passes, de près)
  for(let i9J=0;i9J<2;i9J++){const M9=i9J?JADE.pont:JADE.porte;/* (2026-10-14, passe perf mobile) même ordre (porte, pont), sans tableau neuf par image */if(!M9||!M9.mF)continue;const d=camera.position.distanceTo(M9.c),n=d<(M9===JADE.porte?780:650)+(M9.pres?40:0); // (v8) de près, les cubes fins
    if(n!==M9.pres){M9.pres=n;for(const m of M9.mF)m.visible=n;for(const m of M9.mL)m.visible=!n;}}
  JADE_U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);
  {const rc=JADE_RAYON_M.uniforms.uCol.value,v9=JADE_U.uSunC.value,m9=Math.max(v9.r,v9.g,v9.b,1e-3),k9=Math.min(1,.5+.5*m9)/m9;rc.setRGB(v9.r*k9,v9.g*k9,v9.b*k9);} /* (2026-10-21, embellie) les rais prennent la couleur du soleil du moment (doré au soir, bleu pâle la nuit) — trois flottants, rien d'alloué */
  JADE_U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);JADE_U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  JADE_U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);JADE_U.uFillD.value.copy(fill.position).normalize().negate();
  JADE_U.uMist.value.fromArray(BIO.cur.jdB||[.86,.87,.82]);
  {const b=JADE_U.uMist.value,fc=scene.fog&&scene.fog.color;if(fc)b.lerp(fc,.25);}
  {const h=BIO.cur.jdH||[.9,.9,.85],z=BIO.cur.jdZ||[.48,.66,.8];JADE_VIT_U.uCielH.value.setRGB(h[0],h[1],h[2]);JADE_VIT_U.uCielZ.value.setRGB(z[0],z[1],z[2]);} // (v10) le ciel qui se reflète dans la peau de verre
  {const u=JADE_NUAGE_M.uniforms,h=BIO.cur.jdH||[.9,.9,.85],sc=BIO.cur.jdS||[1,.95,.85],fc=scene.fog&&scene.fog.color; // les volutes suivent le ciel du niveau
   u.uTeinte.value.setRGB(.42+.58*(h[0]*.45+sc[0]*.55),.42+.58*(h[1]*.45+sc[1]*.55),.42+.58*(h[2]*.45+sc[2]*.55)); /* (v17) plus blanc : le ciel rose-or teintait les nuages en saumon */if(fc)u.uFogC.value.copy(fc).lerp(JADE_C9.setRGB(h[0],h[1],h[2]),.4);}
}
/* LES GRUES (2026-10-09) — l'oiseau des rouleaux peints : des vols de grues du Japon (blanches, rémiges noires, calotte rouge, pattes
   tendues derrière) qui traversent la vallée en V, battent lentement puis planent. Lambert à couleurs par sommet sur des facettes (géométrie
   sans index : normales plates), trois maillages par oiseau, au plus deux vols à la fois. Hors des PICS DE JADE : rien. */
const GRUE={L:[],t:9,M:null,gC:null,gA:null};
function grueGeos(){if(GRUE.gC)return;
  const K=jadeKit(),bl=[.94,.94,.92],no=[.08,.08,.09],ro=[.85,.12,.10],be=[.62,.58,.42],pa=[.20,.20,.22];
  K.tube([0,0,-.55],[0,.02,.42],.16,.13,6,bl);K.tube([0,.01,-.56],[0,.03,-.98],.15,.02,6,no);   // le corps, la queue noire (les tertiaires) qui s'effile
  K.tube([0,.04,.40],[0,.13,.85],.07,.045,5,no);K.tube([0,.13,.85],[0,.15,1.05],.045,.05,5,no); // le cou noir
  K.tube([0,.15,1.05],[0,.16,1.17],.06,.05,5,bl);K.tube([0,.205,1.08],[0,.205,1.15],.03,.025,4,ro); // la tête, la calotte rouge
  K.tube([0,.15,1.17],[0,.13,1.42],.025,.006,4,be);                                            // le bec
  for(const sd of [-1,1])K.tube([sd*.05,-.08,-.35],[sd*.04,-.12,-1.15],.018,.012,4,pa);         // les pattes tendues
  const toC=g=>{g.setAttribute('color',g.getAttribute('aCol'));g.deleteAttribute('aCol');g.computeVertexNormals();return g;};
  GRUE.gC=toC(K.geo());
  const A=jadeKit(); // UNE AILE (le côté +x) : bras blanc, main aux rémiges noires — deux pans, une articulation
  A.tri([0,0,.18],[.75,.02,.12],[.75,.0,-.30],bl);A.tri([0,0,.18],[.75,0,-.30],[0,0,-.28],bl);
  A.tri([.75,.02,.12],[1.45,.03,-.08],[1.38,0,-.46],no);A.tri([.75,.02,.12],[1.38,0,-.46],[.75,0,-.30],no);
  A.tri([0,0,-.28],[.75,0,-.30],[.55,0,-.42],no);
  GRUE.gA=toC(A.geo());
  GRUE.M=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});}
function grueVol(){grueGeos();
  const fw=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);fw.y=0;if(fw.lengthSq()<1e-4)fw.set(0,0,1);fw.normalize();
  const rt=new THREE.Vector3(fw.z,0,-fw.x),sg=Math.random()<.5?-1:1;
  const base=carGroup.position.clone().addScaledVector(fw,260+Math.random()*260).addScaledVector(rt,sg*(260+Math.random()*120));base.y+=10+Math.random()*70;
  const dir=rt.clone().multiplyScalar(-sg).addScaledVector(fw,(Math.random()-.3)*.6).normalize(),n=5+((Math.random()*5)|0),sp=15+Math.random()*5,S=5.5+Math.random()*1.5;
  const side=new THREE.Vector3(dir.z,0,-dir.x);
  for(let k=0;k<n;k++){const g=new THREE.Group(),rang=Math.ceil(k/2),cote=k%2?1:-1;
    const c=new THREE.Mesh(GRUE.gC,GRUE.M),wl=new THREE.Mesh(GRUE.gA,GRUE.M),wr=new THREE.Mesh(GRUE.gA,GRUE.M);
    wr.position.set(.12,.05,.2);wl.position.set(-.12,.05,.2);wl.scale.x=-1;g.add(c,wl,wr);g.scale.setScalar(S);
    g.position.copy(base).addScaledVector(dir,-rang*S*2.6).addScaledVector(side,cote*rang*S*2.2);g.position.y+=rang*S*.25;
    g.lookAt(g.position.clone().add(dir));scene.add(g);
    GRUE.L.push({g:g,wl:wl,wr:wr,v:dir.clone().multiplyScalar(sp),ph:k*.35+Math.random()*.3,life:42});}
}
function grueTick(dt){
  const ici=!!JADE.root&&LVL.cur&&LVL.cur.id==='jade'&&mode!=='boom';
  GRUE.t-=dt;if(ici&&GRUE.t<=0&&GRUE.L.length<20){grueVol();GRUE.t=16+Math.random()*16;}
  const t=JADE_U.uTime.value;
  for(let i=GRUE.L.length-1;i>=0;i--){const b=GRUE.L[i];b.life-=dt;if(!ici)b.life=0;
    b.g.position.addScaledVector(b.v,dt);b.g.position.y+=Math.sin(t*.6+b.ph)*.6*dt;
    const pl=Math.max(0,Math.sin(t*.35+b.ph*.5)),a=(.15+.55*(1-pl))*Math.sin(t*5.2+b.ph*2.4)+.08*pl; // battements lents… puis le vol plané
    b.wr.rotation.z=a;b.wl.rotation.z=-a;
    if(b.life<=0){scene.remove(b.g);GRUE.L.splice(i,1);}}
}
/* ---- EN VOL : les CUBES sont durs — la montagne et le rocher (la grille de leur gabarit, au quart de tour près), la muraille, l'arche.
   La caisse compte pour cinq points (son centre et ±1,4 m de chaque côté). ---- */
const JH=[[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]];
function jadePilierDans(q,x,y,z){const T9=JADE.geos.p[q[5]],a=-q[6]*Math.PI/2,c=Math.round(Math.cos(a)),s=Math.round(Math.sin(a)),lx=(x-q[0])/VX,lz=(z-q[1])/VX;
  return voxAt(T9.G,Math.floor(lx*c+lz*s+T9.M),Math.floor((y-q[3])/VX),Math.floor(-lx*s+lz*c+T9.M))>0;}
const V9J=new THREE.Vector3();
function jadeHeurt(p){
  const C=JADE.col;if(!C||!JADE.root)return false;
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1];
    const a=C.g.get(Math.floor(x/C.CG)+','+Math.floor(z/C.CG));
    if(a)for(let j=0;j<a.length;j++){if(C.mort&&C.mort.has(a[j]))continue;const q=C.P[a[j]];if(p.y<q[3]-1||p.y>q[4]+1)continue;const dx=x-q[0],dz=z-q[1];if(dx*dx+dz*dz>(q[2]+1)*(q[2]+1))continue;
      if(jadePilierDans(q,x,p.y,z))return true;}
    /* (2026-10-21, Léo : « on traverse les montagnes qui tombent ») les montagnes en chute gardent leur hitbox : le point est ramené dans leur repère d'origine */
    for(const c of JCH.L){if(!c.t0||c.fin||!c.inv)continue;const q=c.q;V9J.set(x,p.y,z).applyMatrix4(c.inv);
      if(V9J.y<q[3]-1||V9J.y>q[4]+1)continue;const dx=V9J.x-q[0],dz=V9J.z-q[1];if(dx*dx+dz*dz>(q[2]+1)*(q[2]+1))continue;
      if(jadePilierDans(q,V9J.x,V9J.y,V9J.z))return true;}
    V9J.set(x,p.y,z);
    if(JADE.porte&&jadeDansGrille(JADE.porte,V9J))return true;
    if(JADE.pont&&jadeDansGrille(JADE.pont,V9J))return true;}
  return false;
}
/* (2026-10-14, passe mobile) LE SOLEIL DE JADE NE COMPILE PLUS EN PLEINE COURSE. MESURÉ (dbgProgsListe, course au pilote) : un programme
   naissait vers 8 s (les GRUES, fabriquées à leur premier vol) et TROIS d'un coup vers 3 km (les matières du MONUMENT, cachées jusqu'à ce qu'on
   l'approche — `chauffeRendu` laisse caché ce qui n'a jamais été compilé). Sur iPhone, chacun fige l'image ~0,1-0,3 s. Au départ du niveau
   (avec la chauffe de la piste, 120 ms après newTrack) : tout le sous-arbre de la map, caché compris, plus une grue, compilé et dessiné une
   fois hors écran — sous l'éclairage de la course, donc les mêmes programmes. */
function jadeChauffeNiveau(){ if(!JADE.root||!JADE.root.parent)return;
  try{for(const o of JADE.monu||[])jadeMonuLoin(o);}catch(e){console.warn('monument de loin',e);} // (2026-10-14, passe perf mobile) le monument allégé de loin, paliers 0-1 (une fois par carte)
  let g=null;const eau=[],vu=[];
  try{grueGeos();g=new THREE.Group();g.add(new THREE.Mesh(GRUE.gC,GRUE.M));
    const m0=JADE.monu&&JADE.monu.find(function(o){return o.L&&o.L[0];}); // les monuments changent de matière à 450 m (vrOM au loin → vrM de près) : la matière de PRÈS aussi
    if(m0)g.add(new THREE.Mesh(m0.L[0].geometry,m0.L[0].material===JADE_M.vrM?JADE_M.vrOM:JADE_M.vrM));
    scene.add(g);
    // LA MER : ses effets naissent au PREMIER PLONGEON (couronne, rides, gouttes, bulles, brume, sillon, peau) — mesuré : deux programmes
    // compilés pile au moment de l'éclaboussure. Fabriqués ici (comme jadeChauffe, qui n'était appelée nulle part) et compilés avec le reste.
    try{eau.push(jadePeau(),sillonMesh(),jadeBullesIm(),eauPIm(),eauBIm());eauRide(0,-1e5,0,0);eauCouronne(0,-1e5,0,{r0:1,r1:2,h:1,fl:0,d:1,fx:0,fz:0});
      for(const r9 of EAUR.L)eau.push(r9.m);for(const r9 of COUR.L)eau.push(r9.m);}catch(e){}
    const haut=function(o){while(o&&o.parent&&o.parent!==scene)o=o.parent;return o&&o.parent===scene?o:null;},Q=[JADE.root,g];
    for(const o of eau){if(!o)continue;vu.push([o,o.visible]);o.visible=true;const h=haut(o);if(h&&Q.indexOf(h)<0)Q.push(h);}
    chauffeRendu(Q);}
  catch(e){console.warn('jadeChauffeNiveau',e);}
  finally{if(g)scene.remove(g);for(const v of vu)v[0].visible=v[1];
    try{for(const r9 of EAUR.L){r9.t=9;r9.m.visible=false;}for(const r9 of COUR.L){r9.t=9;r9.m.visible=false;}}catch(e){}} }
/* (2026-10-14, passe perf mobile) LES PROGRAMMES DU SOLEIL DE JADE COMPILÉS AU MENU, SANS BÂTIR LA CARTE. MESURÉ (iPhone 7 émulé, ×4) : au
   portail ville → jade, 17 programmes naissaient d'un coup (163 → 180 liens, une image de ~580 ms ; 6,1 s vue au REJOUER tiré sur le jade) —
   jadeChauffeNiveau ne compile la carte qu'une fois BÂTIE, donc sous le voile du portail. Ici : les MÊMES instances de matière (jadeMats,
   JADE_*_M, la mer, la grue) posées sur de petits maillages du MÊME GENRE (instancié ou seul : USE_INSTANCING change le programme), compilées
   sous les lumières de la scène par chauffeRendu (comme cryptoChauffe) : au portail la clé est la même, le programme est déjà là. Quatre étapes
   de chauffeDivers (~4 programmes chacune). Les objets de la mer sont ceux que jadeChauffeNiveau fabrique (dans la scène, cachés : l'état
   d'après une course au jade). La Lambert de l'écume des effondrements (JCH.splash, instanciée sans teinte) : une jumelle gardée (jamais
   libérée : libérer une matière peut détruire son programme). `dbgJadeProgs()` (banc) : attendus, compilés, manquants. */
const JADE_CHP={fait:0,lam:null,m:new THREE.Matrix4(),v:new THREE.Vector3()};
function jadeChauffeLots(){const M9=jadeMats();return [
  [['vr','I',M9.vr],['vrX','I',M9.vrX],['vrP','I',M9.vrP],['vrO','I',M9.vrO]],                  // les familles des montagnes (verre en trois passes ; opaque au loin) et les cubes fins
  [['arb','I',M9.arb],['vrM','M',M9.vrM],['vrXM','M',M9.vrXM],['vrPM','M',M9.vrPM]],              // la forêt peinte ; la Porte du ciel et les monuments de près
  [['vrOM','M',M9.vrOM],['chute','M',JADE_CHUTE_M],['rayon','M',JADE_RAYON_M],['brume','I',JADE_BRUME_M]], // le monument de loin, les cascades, les rayons, la brume
  [['mer','E',null]]];}                                                                           // la mer (peau, sillon, bulles, écume, brume d'eau, rides, couronnes), la grue, l'écume des chutes
function jadeChauffeProgs(k){const lots=jadeChauffeLots();if(k>=lots.length)return;
  const L9=[],tmp=[],vu=[];let box=null;
  try{box=new THREE.BoxGeometry(1,1,1);
    if(lots[k][0][1]==='E'){
      try{grueGeos();tmp.push(new THREE.Mesh(GRUE.gC,GRUE.M));}catch(e){}
      try{if(!JADE_CHP.lam)JADE_CHP.lam=new THREE.MeshLambertMaterial({color:0xf4f8fa,emissive:0x2a3238});const im=new THREE.InstancedMesh(box,JADE_CHP.lam,1);im.setMatrixAt(0,JADE_CHP.m.identity());tmp.push(im);}catch(e){}
      try{const eau=[jadePeau(),sillonMesh(),jadeBullesIm(),eauPIm(),eauBIm()];eauRide(0,-1e5,0,0);eauCouronne(0,-1e5,0,{r0:1,r1:2,h:1,fl:0,d:1,fx:0,fz:0});
        for(const r9 of EAUR.L)eau.push(r9.m);for(const r9 of COUR.L)eau.push(r9.m);
        for(const o of eau){if(!o||o.parent!==scene||L9.indexOf(o)>=0)continue;vu.push([o,o.visible]);o.visible=true;L9.push(o);}}catch(e){}}
    else for(const q of lots[k]){if(!q[2])continue;let o;
      if(q[1]==='I'){o=new THREE.InstancedMesh(box,q[2],1);o.setMatrixAt(0,JADE_CHP.m.identity());}else o=new THREE.Mesh(box,q[2]);tmp.push(o);}
    camera.getWorldDirection(JADE_CHP.v);
    for(const o of tmp){o.frustumCulled=false;o.position.copy(camera.position).addScaledVector(JADE_CHP.v,30);scene.add(o);L9.push(o);}
    if(L9.length)chauffeRendu(L9);}
  catch(e){console.warn('jadeChauffeProgs',e);}
  finally{for(const o of tmp){scene.remove(o);if(o.isInstancedMesh&&o.dispose)o.dispose();}if(box)box.dispose();for(const v of vu)v[0].visible=v[1];
    if(lots[k][0][1]==='E')try{for(const r9 of EAUR.L){r9.t=9;r9.m.visible=false;}for(const r9 of COUR.L){r9.t=9;r9.m.visible=false;}}catch(e){}
    JADE_CHP.fait=Math.max(JADE_CHP.fait,k+1);} }
window.dbgJadeProgs=function(){ // (banc) les programmes du jade attendus et déjà compilés — au portail ville → jade, `liens` ne doit pas bouger
  const L=[],nb=function(m){const p=m&&renderer.properties.get(m);return p&&p.programs?(p.programs.size!==undefined?p.programs.size:1):0;};
  try{for(const lot of jadeChauffeLots())for(const q of lot)if(q[1]!=='E')L.push({nom:q[0],genre:q[1]==='I'?'instancie':'seul',programmes:nb(q[2])});
    for(const q of [['peau',JSOUS.peau],['sillon',SILL.mesh],['bulles',JEAU.im],['ecume',EAUP.im],['brumeEau',EAUB.im],['ride',EAUR.L[0]&&EAUR.L[0].m],['couronne',COUR.L[0]&&COUR.L[0].m],['grue',GRUE.M&&{material:GRUE.M}],['ecumeChute',JADE_CHP.lam&&{material:JADE_CHP.lam}]])
      L.push({nom:q[0],genre:'mer/grue',programmes:nb(q[1]&&q[1].material)});}catch(e){L.push({nom:'erreur',programmes:0,e:String(e)});}
  return {liens:renderer.info.programs?renderer.info.programs.length:-1,etapes:JADE_CHP.fait+'/4',attendus:L.length,manquants:L.filter(function(o){return !o.programmes;}).map(function(o){return o.nom;}),liste:L};};
window.dbgFin=function(v,nu){ // (banc) v : les cubes minuscules on/off ; nu : les nuages en volutes on/off
  if(v!==undefined&&v!==null){FIN.on=!!v&&!TEL_NATIF;if(!FIN.on){FIN.dans.clear();for(const FF of FIN.fam)if(FF)FF.im.visible=FF.im2.visible=FF.im3.visible=false;}JADE.sig=0;}
  if(nu!==undefined&&JADE.root)for(const o of JADE.root.children)if(o.material===JADE_NUAGE_M)o.visible=!!nu;
  return {on:FIN.on,dans:FIN.dans.size,D:FIN.D};};
window.dbgJadePoste=function(k,on){if(!JADE.root)return 'pas de map';on=!!on;
  if(k==='bandes'){const o={};for(const F of JADE.fam){const kk=F.b0+'-'+F.b1+(F.im2?'v':'');o[kk]=(o[kk]||0)+F.im.count*F.tri*(F.im2?3:1);}for(const FF of FIN.fam)if(FF)o.fins=(o.fins||0)+FF.im.count*FF.tri*3;for(const kk in o)o[kk]=Math.round(o[kk]/1000)+'k';return o;}
  if(k==='ramasse'){const o={pieces:0,fruits:{},pouvoirs:0};for(const p of pickups){if(p.pow)o.pouvoirs++;else if(p.nitro){const n9=(FRUIT_DEFS[p.fruit]||{}).n||'?';o.fruits[n9]=(o.fruits[n9]||0)+1;}else o.pieces++;}o.pads=PADS.length;o.flaques=OILS.length;o.coinIM=coinIM.count;o.fruitsS=pickups.filter(function(p){return p.nitro&&p.face===1;}).map(function(p){return [Math.round(p.s),+p.lat.toFixed(1),(FRUIT_DEFS[p.fruit]||{}).n];});o.coinVis=coinIM.visible;o.s=Math.round(s);o.prochaines=pickups.filter(function(p){return p.s>s;}).slice(0,4).map(function(p){const m=p.mesh;return {s:Math.round(p.s),lat:+p.lat.toFixed(1),vis:m&&m.visible,par:!!(m&&m.parent),y:m?Math.round(m.position.y):null,sc:m?+m.scale.x.toFixed(2):null};});const P9=new THREE.Vector3();frameAt(s,F);o.routeY=Math.round(F.p.y);return o;}
  if(k==='bitume'){scene.traverse(function(o){if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.bitume)o.visible=on;});return 'bitume '+on;}
  if(k==='lod'){JADE_LOD.r0=+arguments[1];JADE.sig=0;return JADE_LOD.r0;}
  if(k==='gros'){const o=[],seuil=+arguments[1]||20000;scene.traverse(function(x){if(!(x.isMesh||x.isPoints||x.isLine)||!x.geometry)return; // (banc, 2026-10-22) les plus gros objets VISIBLES de la scène : triangles, nom, genre, matière, parent
    let v=true,p=x;while(p){if(!p.visible){v=false;break;}p=p.parent;}if(!v)return;const g=x.geometry,n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3*(x.isInstancedMesh?x.count:1);if(n<seuil)return;
    o.push([Math.round(n/1000)+'k',x.name||'',x.type+(x.isInstancedMesh?'[I'+x.count+']':''),x.material&&(x.material.type+(x.material.name?':'+x.material.name:'')),x.parent===scene?'scène':x.parent===JADE.root?'jade':(x.parent&&x.parent.name)||'sous',x.frustumCulled?'cull':'-',x.castShadow?'ombre':'',(function(){const ch=[];let q=x.parent;while(q&&q!==scene){ch.push((q.name||q.type)+(q.children?'('+q.children.length+')':''));q=q.parent;}return ch.join('<');})(),Object.keys(x.userData||{}).join(','),x.geometry.attributes?Object.keys(x.geometry.attributes).join(','):'',x.geometry.boundingSphere?Math.round(x.geometry.boundingSphere.radius):'',[x.position.x,x.position.y,x.position.z].map(Math.round).join(','),x.renderOrder]);});
    o.sort(function(a,b){return parseFloat(b[0])-parseFloat(a[0]);});return o.slice(0,40);}
  if(k==='temps'){const n=+arguments[1]||20,gl=renderer.getContext(),px=new Uint8Array(4); // (banc, 2026-10-22) ms d'une image de la scène (sans post), la puce attendue par une lecture d'un pixel : à faire sur une image figée, un poste éteint puis rallumé
    renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return +((performance.now()-t0)/n).toFixed(2);}
  if(k==='monu'){const t9=function(m){return m&&m.geometry?Math.round((m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3/1000)+'k'+(m.visible?'+':'-'):'∅';},d9=function(o){return o?Math.round(camera.position.distanceTo(o.c)):null;}; // (banc, 2026-10-22) la Porte et le Pont : leurs maillages, leur taille, lequel est dessiné
    return {monu:(JADE.monu||[]).map(function(o){return {d:Math.round(camera.position.distanceTo(o.c)),g:o.g.visible,loin:!!o.loin,L:o.L&&o.L.map(t9),lo:o.lo?t9(o.lo):null,r:Math.round(o.r||0)};}),
      porte:JADE.porte&&{d:d9(JADE.porte),pres:!!JADE.porte.pres,mL:(JADE.porte.mL||[]).map(t9),mF:(JADE.porte.mF||[]).map(t9)},pont:JADE.pont&&{d:d9(JADE.pont),pres:!!JADE.pont.pres,mL:(JADE.pont.mL||[]).map(t9),mF:(JADE.pont.mF||[]).map(t9)}};}
  if(k==='liste'){const o=[];JADE.root.traverse(function(x){if(!x.visible||!x.isMesh||x.isInstancedMesh)return;const g=x.geometry;const n=(g.index?g.index.count:g.attributes.position.count)/3;if(n>5000)o.push([x.name||(x.material&&x.material.type),Math.round(n/1000)+'k',x.frustumCulled,x.parent===JADE.root?'root':'sous',JADE.porte&&JADE.porte.mF&&JADE.porte.mF.indexOf(x)>=0?'porteF':JADE.porte&&JADE.porte.mL&&JADE.porte.mL.indexOf(x)>=0?'porteL':JADE.pont&&JADE.pont.mF&&JADE.pont.mF.indexOf(x)>=0?'pontF':JADE.pont&&JADE.pont.mL&&JADE.pont.mL.indexOf(x)>=0?'pontL':'']);});return o;}
  if(k==='scene'){const o={};scene.traverse(function(x){if(!x.visible||!(x.isMesh||x.isPoints||x.isLine))return;const g=x.geometry;if(!g)return;const n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3*(x.isInstancedMesh?x.count:1);const kk=(x.material&&x.material.type)+(x.isInstancedMesh?'I':'')+(x.parent===JADE.root?'J':'');o[kk]=(o[kk]||0)+n;});for(const kk in o)o[kk]=Math.round(o[kk]/1000)+'k';return o;}
  if(k==='cout'){const r=renderer.info;r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true;return [r.render.calls,r.render.triangles];}
  if(k==='coutOmbre'){const r=renderer.info,au=renderer.shadowMap.autoUpdate;r.autoReset=false;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;r.reset();renderer.render(scene,camera);const sans=[r.render.calls,r.render.triangles];renderer.shadowMap.needsUpdate=true;r.reset();renderer.render(scene,camera);const avec=[r.render.calls,r.render.triangles];renderer.shadowMap.autoUpdate=au;r.autoReset=true;const L={};scene.traverse(function(o){if(!o.visible||!o.castShadow||!(o.isMesh))return;const g=o.geometry;const n=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);const kk=(o.name||o.material&&o.material.type||'?')+(o.isInstancedMesh?'I':'')+(o.parent===JADE.root?'J':'');L[kk]=(L[kk]||0)+Math.round(n);});return {passeOmbre:[avec[0]-sans[0],avec[1]-sans[1]],ecran:sans,lanceurs:L};} // (2026-10-14, banc) ce que coûte la passe d'ombre, et qui y jette son ombre // (banc) éteindre un poste pour mesurer ce qu'il coûte
  if(k==='mer'){if(!on){if(JADE.merSv===undefined)JADE.merSv=skyU.uJMerY.value;skyU.uJMerY.value=-1e7;}else if(JADE.merSv!==undefined){skyU.uJMerY.value=JADE.merSv;JADE.merSv=undefined;}}
  else if(k==='ciel'){skyDome.visible=on;}
  else if(k==='verre'){for(const F of JADE.fam){F.coupeV=!on;if(F.im2){F.im2.visible=on&&F.im.count>0;F.im3.visible=on&&F.im.count>0;}}}
  else if(k==='piliers'){for(const F of JADE.fam){F.coupe=!on;F.im.visible=on&&F.im.count>0;if(F.im2){F.im2.visible=on&&F.im.count>0&&!F.coupeV;F.im3.visible=on&&F.im.count>0&&!F.coupeV;}}}
  else if(k==='fins')dbgFin(on);
  else if(k==='nuages'){JADE_NUVOX_M.visible=on;JADE.root.children.forEach(function(o){if(o.material===JADE_NUAGE_M)o.visible=on;});}
  else if(k==='brume'){if(JADE.brume)JADE.brume.visible=on;}
  else if(k==='rayons'||k==='chutes'){const M=k==='rayons'?JADE_RAYON_M:JADE_CHUTE_M;JADE.root.children.forEach(function(o){if(o.material===M)o.visible=on;});}
  else if(k==='esprits'){JADE_ESPRITS.material.visible=on;}
  else if(k==='monuments'){for(const o of JADE.monu||[])o.g.visible=on;} // (banc) la Porte et le Pont (jadeTick les remet à chaque image : éteindre et mesurer dans le même appel)
  else if(k==='coton'){if(typeof COTON!=='undefined'&&COTON.root)COTON.root.visible=on;} // (banc) le coton des nuages
  else if(k==='singes'){JSG.node.visible=on&&!!JSG.cur;} // (banc) la rencontre de singe en cours
  return k+' '+on;};
window.dbgTemps=function(n){const gl=renderer.getContext(),px=new Uint8Array(4);n=n||20; // (banc, 2026-10-22) ms d'une image de la scène (sans post), la puce attendue par une lecture d'un pixel : à faire sur une image figée (n'importe quelle map)
  renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t0=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return +((performance.now()-t0)/n).toFixed(2);};
window.dbgAppels=function(n){ // (2026-10-14, banc) QUI fait les appels de dessin d'une image : chaque appel compté par objet (nom, matière, parent) — n = combien en rendre
  const o=renderer.renderBufferDirect,C={};let tot=0,tri=0;
  renderer.renderBufferDirect=function(cam,sc,geo,mat,obj,grp){tot++;const g=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0);const t=g/3*(obj.isInstancedMesh?obj.count:1);tri+=t;
    let p=obj.parent,ch=obj.name||'';for(let k=0;k<3&&p&&!ch;k++){ch=p.name||'';p=p.parent;}
    if(!ch&&typeof JADE!=='undefined'&&JADE.fam){for(const F of JADE.fam){if(F.im===obj||F.im2===obj||F.im3===obj){ch='jade '+F.b0+'-'+F.b1+(F.im2===obj?' absorption':F.im3===obj?' profondeur':'');break;}}if(!ch&&typeof NUVOX!=='undefined'&&NUVOX.ims&&NUVOX.ims.indexOf(obj)>=0)ch='nuages-cubes';if(!ch&&typeof FIN!=='undefined'&&FIN.fam&&FIN.fam.some(function(F){return F&&F.im===obj;}))ch='cubes-fins';}
    if(obj.isInstancedMesh&&obj.count===0)ch+=' VIDE';
    if(window.__appelsDetail&&obj.parent===scene)ch+=' {'+(geo.type||'')+' ro'+obj.renderOrder+(mat.transparent?' T':'')+(mat.blending===THREE.AdditiveBlending?' add':'')+' '+Object.keys(obj.userData||{}).join(',')+' '+(mat.color?mat.color.getHexString():'')+'}';
    const kk=(mat.type||'?')+(mat.name?':'+mat.name:'')+(obj.isInstancedMesh?'[I]':'')+(ch?' <'+ch+'>':'')+(obj.parent===scene?' (scène)':'');const e=C[kk]||(C[kk]={n:0,tri:0});e.n++;e.tri+=t;
    return o.apply(this,arguments);};
  try{renderer.render(scene,camera);}finally{renderer.renderBufferDirect=o;}
  const L=Object.keys(C).map(function(k){return [C[k].n,Math.round(C[k].tri/1000)+'k',k];}).sort(function(a,b){return b[0]-a[0];});
  return {appels:tot,triangles:Math.round(tri/1000)+'k',liste:L.slice(0,n||40)};};
window.dbgJadeRegle=function(){if(!JADE.root)return null;const ds=L/(NP-1),st=Math.max(1,Math.round(5/ds)),V9=new THREE.Vector3();let n=0,t=0;const ex=[]; /* (2026-10-20, banc) LA RÈGLE D'OR : aucun pilier ni rocher sur la route — la caisse tous les 5 m, à 3 places de la largeur, à 0,5 et 3 m */
  for(let i=0;i<NP;i+=st)for(const f of [-.9,0,.9])for(const h of [.5,3]){V9.copy(pts[i]).addScaledVector(B[i],f*ROAD_HALF).addScaledVector(Nn[i],h);t++;if(jadeHeurt(V9)){n++;if(ex.length<6)ex.push([Math.round(i*ds),f,h]);}}
  return {essais:t,heurts:n,ex:ex};};
window.dbgJade=function(){let tri=0;for(const F of JADE.fam)tri+=F.im.count*F.tri;
  let triF=0;for(const FF of FIN.fam)if(FF)triF+=FF.im.count*FF.tri;
  return Object.assign({},JADE.n,{deco:JADE.deco||null,mods:JADE.mk||null,fins:FIN.dans.size,triFins:Math.round(triF),finPrets:JADE.geos?JADE.geos.p.filter(function(T9){return T9.fin;}).length+'/'+JADE.geos.p.length:0,finMs:JADE.geos&&JADE.geos.p.map(function(T9){return T9.finMs||0;}),triFinGab:JADE.geos&&JADE.geos.p.map(function(T9){return T9.fin?T9.fin.index.count/3:0;}),triangles:Math.round(tri+triF)+(JADE.porte?JADE.porte.tri:0)+(JADE.pont?JADE.pont.tri:0),porteFin:JADE.porte&&JADE.porte.triF,nuTri:JADE.nuTri,msPorte:JADE.msPorte,tPorte:JADE.tPorte,msPont:JADE.msPont,pontFin:JADE.pont&&JADE.pont.triF,appels:JADE.fam.filter(function(F){return F.im.count>0;}).length,
    tri:{ms:JT.n?+(JT.ms/JT.n).toFixed(3):0,envois:JT.up},garde:{reprises:JADE_GARDE.reprises,msReprise:JADE_GARDE.ms,rangee:!!JADE_GARDE.m},grues:GRUE.L.length,balade:BALADE,niveau:LVL.cur&&LVL.cur.id,err:window.__jadeErr?String(window.__jadeErr):null});};
window.dbgJadeAller=function(k,d){if(typeof k==='number'){if(!started||gameOver)return 'non';if(paused)togglePause();s=Math.max(0,Math.min(L-40,k));lat=0;psi=0;prevTvalid=false;mode='drive';return Math.round(s);} // (v14) un nombre : la caisse à s m
  const P=k==='pont'?JADE.pont:JADE.porte;if(!P||!started||gameOver)return 'non';if(paused)togglePause(); // (dev) la caisse d m avant un monument, sur la route
  s=Math.max(0,P.i/(NP-1)*L-(d||350));lat=0;psi=0;prevTvalid=false;mode='drive';return Math.round(s);};
// `dbgJadeVue(k,d,h)` (dev) : MODE PHOTO — 'route' (derrière la caisse, haut), 'porte', 'pont', 'haut' (vue plongeante), 'loin'
window.dbgJadeVue=function(k,d,h,cap){if(!JADE.root)return 'pas de map';
  if(started&&!gameOver&&!paused)togglePause();JADE.photo=true;
  const C=new THREE.Vector3(),V=new THREE.Vector3();
  if(k&&typeof k==='object'&&k.p){C.fromArray(k.p);V.fromArray(k.c);if(k.fov){camera.fov=k.fov;camera.updateProjectionMatrix();}} /* (2026-10-20, banc) un cadrage donné : {p, c, fov} (les photos du décor au hasard) */
  else if((k==='porte'&&JADE.porte)||(k==='pont'&&JADE.pont)){const P=k==='porte'?JADE.porte:JADE.pont,sP=P.i/(NP-1)*L; // depuis la ROUTE, d m avant le monument
    frameAt(Math.max(0,sP-(d||600)),F);C.copy(F.p).addScaledVector(F.n,h||12);V.copy(P.c);V.y+=k==='porte'?110:90;}
  else if(k==='grue'&&GRUE.L.length){const g=GRUE.L[0].g.position;V.copy(g);C.copy(g).addScaledVector(GRUE.L[0].v.clone().normalize(),-(d||120));C.y+=(h||25);}
  else if(k==='pres'&&JADE.col){frameAt(Math.min(L-10,s),F);const o9=F.p;let bq=null,bd=1e9;for(const q of JADE.col.P){if(q[5]>=JADE_NTPL)continue;const e=Math.hypot(q[0]-o9.x,q[1]-o9.z)-q[2];if(e<bd&&o9.y>q[3]+20&&o9.y<q[4]-10){bd=e;bq=q;}} // (dev) la montagne la plus proche de la route, de près
    if(bq){const a9=(cap||0)+Math.atan2(o9.z-bq[1],o9.x-bq[0]);C.set(bq[0]+Math.cos(a9)*(bq[2]+(d||40)),o9.y+(h||0),bq[1]+Math.sin(a9)*(bq[2]+(d||40)));V.set(bq[0],C.y-(h||0)*.3,bq[1]);}}
  else if(k==='eau'&&JADE.eauPil&&JADE.eauPil.length){const o9=carGroup.position;let be=null,bd=-1;for(const e of JADE.eauPil){const d9=(e.x-o9.x)*(e.x-o9.x)+(e.z-o9.z)*(e.z-o9.z);if(d9<1500*1500&&e.r>bd){bd=e.r;be=e;}}if(!be)be=JADE.eauPil[0]; // (v17, dev) le pied d'une montagne que l'eau frappe
    const a9=(cap||0)+Math.atan2(o9.z-be.z,o9.x-be.x);C.set(be.x+Math.cos(a9)*(be.r+(d||110)),JADE.eauY+(h||22),be.z+Math.sin(a9)*(be.r+(d||110)));V.set(be.x,JADE.eauY+(h||22)*.6,be.z);camera.position.copy(C);JADE.eauT=0;jadeEauTick(0);}
  else if(k==='bord'){frameAt(Math.min(L-10,s+(d||0)),F);C.copy(F.p).addScaledVector(F.b,ROAD_HALF+(cap||6)).addScaledVector(F.n,h||3).addScaledVector(F.t,-6);V.copy(F.p).addScaledVector(F.b,ROAD_HALF-2).addScaledVector(F.t,30);} // (dev) le BORD de la route, de côté
  else if(k==='haut'){C.copy(carGroup.position);C.y+=(h||260);V.copy(carGroup.position).addScaledVector(new THREE.Vector3(Math.sin(cap||0),0,Math.cos(cap||0)),600);}
  else if(k==='loin'){C.copy(carGroup.position);C.y+=(h||30);V.copy(carGroup.position).addScaledVector(new THREE.Vector3(Math.sin(cap||0),0,Math.cos(cap||0)),1000);V.y+=(d||0);}
  else{frameAt(Math.min(L-10,s+(d||0)),F);C.copy(F.p).addScaledVector(F.t,-18).addScaledVector(F.n,(h||8));V.copy(F.p).addScaledVector(F.t,120);}
  camera.position.copy(C);camera.up.set(0,1,0);camera.lookAt(V);camera.updateMatrixWorld();skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);
  if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:C.toArray().map(Math.round)};};
