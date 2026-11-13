/* ===== LES ROCHES DE JUPITER (2026-11-10, Sacha : « jupiter des roches spatiales immobiles ») =====
   Sous Jupiter (le SOIR de l'orbite) il n'y a ni satellite ni débris : des ROCHES, posées dans le vide et qui ne bougent JAMAIS (pas de rotation propre, pas de train, pas de dérive —
   la matrice de chaque instance est écrite une fois par la pose, comme le reste de l'orbite).
   · UNE géométrie (une icosphère non indexée) et UN InstancedMesh : la forme de chaque roche naît dans le vertex shader — un rayon tiré d'un bruit 3D dont la graine est celle de
     l'instance (`aVar.x`) — donc deux roches ne se ressemblent pas, sans un sommet de plus. Les facettes sont franches (normale tirée des dérivées, comme les satellites).
   · LA LUMIÈRE SPATIALE y est complète : UN soleil dur et blanc (`uSol` = ORB.cle, le même que la caisse), le noir franc côté ombre (à peine la lueur des étoiles), le reflet de la
     PLANÈTE en couleur (`uPlan` : l'ambre de Jupiter) sur les faces qui la regardent, les creux plus sombres (le rayon local fait l'occlusion), un liseré de contre-jour, la brume
     du lointain qui se noie dans le noir. Aucune lumière ajoutée à la scène (téléphone), `fog:false`, compilé au menu avec le reste de l'orbite.
   · LA POSE (`rochesPose`, appelée par orbiteBuild) : trois couches — les roches du BORD de la route (4 à 18 m, seules ou en porte), le CHAMP (de 2 à 36 m, au-dessus et au-dessous,
     les grosses suivies de leurs éclats), de GRANDS BLOCS lointains qui se découpent sur Jupiter. Chaque roche est tenue hors de TOUTE portion de route (`libre`, le rayon est
     celui de la roche la plus déformée). Aucun tirage dans le flux de la piste : le flux `r` d'orbiteBuild est dérivé.
   Hooks : `dbgOrbite()` (champ `roches`), `dbgOrbAudit()` (`sats.roches` : dégagement, dedans, frôle). */
const ROCHE_N=!ALLEGE?280:mapsSobres()?36:120; /* le téléphone en a moins, comme les satellites */
const ROCHE_U=Object.assign({},SAT_U,{uPlan:{value:new THREE.Color(.62,.47,.30)}}); /* tout est partagé avec les satellites (soleil, planète, brume, fondu) sauf la couleur de la planète */
const ROCHE_GLSL=['float h31(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}',
  'float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  '  return mix(mix(mix(h31(i),h31(i+vec3(1.,0.,0.)),f.x),mix(h31(i+vec3(0.,1.,0.)),h31(i+vec3(1.,1.,0.)),f.x),f.y),',
  '             mix(mix(h31(i+vec3(0.,0.,1.)),h31(i+vec3(1.,0.,1.)),f.x),mix(h31(i+vec3(0.,1.,1.)),h31(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}'].join('\n');
const ROCHE_MAT=new THREE.ShaderMaterial({fog:false,extensions:{derivatives:true},uniforms:ROCHE_U,
  vertexShader:['attribute vec4 aVar;varying vec3 vVP,vLoc;varying float vTon,vSd;',ROCHE_GLSL,
    'void main(){vec3 n=normalize(position);float s=aVar.x*41.;',
    '  float d=vn(n*1.5+s)*.55+vn(n*3.6+s*1.7)*.30+vn(n*8.1+s*2.3)*.15;',                                        /* le relief de la roche : trois octaves */
    '  vec3 p=n*(.60+.64*d);',                                                                                    /* rayon de .60 à 1.24 : jamais une bille */
    '  vec4 mv=modelViewMatrix*(instanceMatrix*vec4(p,1.));vVP=mv.xyz;vLoc=p;vTon=aVar.y;vSd=s;',
    '  gl_Position=projectionMatrix*mv;}'].join('\n'),
  fragmentShader:['uniform vec3 uSol,uTerre,uFog,uPlan;uniform float uOp;varying vec3 vVP,vLoc;varying float vTon,vSd;',ROCHE_GLSL,
    'void main(){',
    '  vec3 Nv=normalize(cross(dFdx(vVP),dFdy(vVP)));mat3 iv=mat3(viewMatrix);',
    '  vec3 N=normalize(Nv*iv),V=normalize(-vVP)*iv;',                                                            /* la FACETTE et l\'oeil, ramenés dans le monde */
    '  vec3 q=vLoc*5.+vSd;float b0=vn(q);',
    '  vec3 gb=vec3(vn(q+vec3(.35,0.,0.))-b0,vn(q+vec3(0.,.35,0.))-b0,vn(q+vec3(0.,0.,.35))-b0)*2.8;gb-=N*dot(gb,N);',
    '  N=normalize(N-.55*gb);',                                                                                    /* le grain de la pierre : une bosse fine sur chaque facette */
    '  float m=vn(q*.35+3.)*.6+vn(q*1.1)*.4,st=sin(vLoc.y*9.+vn(vLoc*1.3+vSd)*6.)*.5+.5;',                        /* taches larges, strates */
    '  vec3 alb=mix(vec3(.16,.14,.125),vec3(.34,.27,.21),m);',
    '  alb=mix(alb,alb*vec3(1.28,1.,.78),st*.28)*(.78+.5*vTon);',                                                  /* basalte rouillé, des roches plus claires que d\'autres */
    '  alb=mix(alb,vec3(.56,.51,.45),smoothstep(.80,1.,vTon)*.55*m);',                                            /* quelques roches pâles : de la glace poussiéreuse */
    '  float d=dot(N,uSol),dif=max(d,0.),occ=.5+.5*smoothstep(.62,1.12,length(vLoc));',                           /* les creux (rayon local bas) restent sombres */
    '  vec3 sunC=vec3(1.,.96,.90);',
    '  vec3 col=alb*sunC*dif*2.1*mix(1.,occ,.7);',                                                                  /* UN soleil, dur : pas d\'air, pas de pénombre */
    '  vec3 H=normalize(uSol+V);col+=sunC*pow(max(dot(N,H),0.),38.)*.10*step(0.,d);',                              /* un reflet sec sur les arêtes */
    '  col+=alb*uPlan*max(dot(N,uTerre),0.)*.55*occ;',                                                              /* le reflet de la PLANÈTE, dans sa couleur (ambre sous Jupiter) */
    '  col+=alb*vec3(.010,.012,.020);',                                                                             /* la lueur des étoiles : l\'ombre n\'est jamais un aplat */
    '  col+=alb*sunC*pow(1.-max(dot(Nv,normalize(-vVP)),0.),3.)*.40*smoothstep(-.1,.4,d);',                        /* le liseré côté soleil */
    '  col=mix(col,uFog,smoothstep(1800.,7500.,length(vVP)));',
    '  gl_FragColor=vec4(mix(uFog,col,uOp),1.);}'].join('\n')});
const ROCHES=(function(){
  const g0=new THREE.IcosahedronGeometry(1,!ALLEGE?3:1),g=g0.index?g0.toNonIndexed():g0; /* (selon la version de three, déjà non indexée) */
  g.setAttribute('aVar',new THREE.InstancedBufferAttribute(new Float32Array(ROCHE_N*4),4));
  const im=new THREE.InstancedMesh(g,ROCHE_MAT,ROCHE_N);im.count=0;im.visible=false;im.frustumCulled=false;im.name='orbite roches';scene.add(im);return im;})();
function rochesPose(c){ /* c : {r (le flux dérivé), libre, x0…, dS} d'orbiteBuild — écrit les matrices UNE fois, sur tout le niveau */
  const r=c.r,libre=c.libre,A=ROCHES.geometry.attributes,Mx=ROCHE_N;let n=c.n0|0; /* (v5.4) n0 : les roches des modules, déjà posées (rochesModules) */
  const a9=LVL.cur&&LVL.cur.astre;if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72); /* la couleur de la planète du niveau */
  const pose=function(x,y,z,rad,fx,fy,fz){if(n>=Mx)return false;
    ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));ORB.S.set(rad*fx,rad*fy,rad*fz);ORB.P.set(x,y,z);ORB.M.compose(ORB.P,ORB.Q,ORB.S);
    ROCHES.setMatrixAt(n,ORB.M);A.aVar.setXYZW(n,r(),r(),0,0);n++;return true;};
  const forme=function(){return .75+r()*.6;}; /* l'écrasement d'une roche : de .75 à 1,35 par axe */
  /* 0. LA ROCHE AU CŒUR DU MUR (2026-11-11, LA TORSION EN MODULES) : là où la dalle se couche (le mur, le couloir), une grande roche tient le CENTRE du virage — la route en fait le tour (voir torsMurs) */
  for(const w of torsMurs()){const rad=Math.min(60,(w.R-ROAD_HALF-50)/1.7);if(rad>14&&libre(w.cx,w.cy,w.cz,rad*1.7+ROAD_HALF+20))pose(w.cx,w.cy,w.cz,rad,forme(),forme(),forme());}
  /* 1. LE BORD DE LA ROUTE : à 4-20 m du bord, de 6 m sous la dalle à 18 m au-dessus (repère de la route) — seules ou en PORTE (une de chaque côté) */
  {const cible=Math.round(Mx*.22);let sp=360+r()*160;
   const bord=function(s9,sg){if(n>=cible)return;frameAt(s9,F);const rad=4+Math.pow(r(),1.6)*14,ext=rad*1.7,lat=ROAD_HALF+ext+4+r()*16,h=-6+r()*24;
     const x=F.p.x+F.b.x*sg*lat+F.n.x*h,y=F.p.y+F.b.y*sg*lat+F.n.y*h,z=F.p.z+F.b.z*sg*lat+F.n.z*h;
     if(!libre(x,y,z,ROAD_HALF+ext+3.5))return;pose(x,y,z,rad,forme(),forme(),forme());};
   while(sp<L-380&&n<cible){const sg=r()<.5?-1:1;bord(sp,sg);if(r()<.28)bord(sp+(r()-.5)*40,-sg);sp+=70+r()*130;}}
  /* 2. LE CHAMP : jusqu'à 1,1 km, 6 roches sur 10 AU-DESSUS de la route (la caméra plonge) ; les grosses sont suivies de quelques éclats */
  {const cible=Math.round(Mx*.82);
   for(let tr=0;n<cible&&tr<Mx*10;tr++){const i=(r()*NP)|0,t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.3)continue;
     const sg=r()<.5?-1:1,rad=2.5+Math.pow(r(),2.4)*34,haut=r()<.6,al=(r()-.5)*260;
     const dy=haut?70+Math.pow(r(),1.2)*480:-(50+r()*380),lat=haut?Math.pow(r(),1.1)*850:ROAD_HALF+90+Math.pow(r(),1.3)*950,ext=rad*1.7;
     const x=pts[i].x+(-t9.z*sg*lat+t9.x*al)/hl,y=pts[i].y+dy,z=pts[i].z+(t9.x*sg*lat+t9.z*al)/hl;
     if(!libre(x,y,z,ext+ROAD_HALF+90))continue;
     if(!pose(x,y,z,rad,forme(),forme(),forme()))break;
     if(rad>14)for(let j=0,m=2+((r()*4)|0);j<m&&n<cible;j++){ /* les éclats de la grosse roche : dans les 2,4 rayons */
       const rr=rad*(.10+r()*.2),a1=r()*6.283,a2=(r()-.5)*2,o=ext*(1.1+r()*1.3),ex=x+Math.cos(a1)*o*Math.sqrt(1-a2*a2),ey=y+a2*o,ez=z+Math.sin(a1)*o*Math.sqrt(1-a2*a2);
       if(libre(ex,ey,ez,rr*1.7+ROAD_HALF+90))pose(ex,ey,ez,rr,forme(),forme(),forme());}}}
  /* 3. LES GRANDS BLOCS : de 50 à 120 m, très loin de la route, en silhouette sur la planète */
  for(let tr=0,k=0;n<Mx&&k<Math.max(3,Math.round(Mx*.06))&&tr<300;tr++){const i=(r()*NP)|0,t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.3)continue;
    const sg=r()<.5?-1:1,rad=50+r()*70,ext=rad*1.7,lat=450+r()*1050,dy=(r()<.5?1:-1)*(150+r()*450),al=(r()-.5)*400;
    const x=pts[i].x+(-t9.z*sg*lat+t9.x*al)/hl,y=pts[i].y+dy,z=pts[i].z+(t9.x*sg*lat+t9.z*al)/hl;
    if(!libre(x,y,z,ext+ROAD_HALF+160))continue;if(pose(x,y,z,rad,forme(),forme(),forme()))k++;}
  ROCHES.count=n;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;
}
function rochesModules(r){ /* (2026-11-13 soir, L'ORBITE V5.4 — Sacha : « des modules où ça interagit avec l'environnement, les astéroïdes, les débris : l'exploration et le fun ») LES ROCHES DES MODULES
   (MODS[k].nu, voir orbite-modules.js) : les ANNEAUX (une couronne de roches autour de la route, son centre à ANN_H au-dessus de la dalle), la CEINTURE (un géant au cœur de chaque virage, que
   la route frôle, et le champ autour), le TOUR DE L'ASTÉROÏDE (une grosse roche au centre du looping). Posées avant tout le reste, sur TOUTES les planètes (Mars comprise : sans elles ces modules
   n'ont pas de sens), jamais sur la chaussée ni dans le vol d'un saut (le sommet d'un saut est à ~19 m). Le téléphone en pose moins (ROCHE_N, comme le reste). Rend le nombre posé. */
  if(!MODS||!MODS.length)return 0;
  const A=ROCHES.geometry.attributes,Mx=ROCHE_N,kN=Mx>=200?1:Mx>=100?.7:.45,Q=new THREE.Vector3();let n=0,any=false;
  const pose=function(x,y,z,rad){if(n>=Mx)return false;ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));const f1=.82+r()*.4,f2=.82+r()*.4,f3=.82+r()*.4;
    ORB.S.set(rad*f1,rad*f2,rad*f3);ORB.P.set(x,y,z);ORB.M.compose(ORB.P,ORB.Q,ORB.S);ROCHES.setMatrixAt(n,ORB.M);A.aVar.setXYZW(n,r(),r(),0,0);n++;return true;};
  const rep=function(s9,lat,h){frameAt(s9,F);return Q.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,h);}; /* un point du repère de la route : lat (à gauche +), h (au-dessus de la dalle) */
  const loin=function(lat,h,rad){const e=rad*1.6;return Math.abs(lat)-e>ROAD_HALF+12||h-e>ANN_H+16||h+e<-THICK-14;}; /* hors de la chaussée et du vol d'un saut */
  for(const m of MODS){const f=m.fig;if(!m.nu||(f!=='anneaux'&&f!=='ceinture'&&f!=='tour'))continue;
    if(!any){any=true;const a9=LVL.cur&&LVL.cur.astre;if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72);}
    if(f==='anneaux'){const nb=Math.max(10,Math.round(24*kN)); /* (MESURÉ en photo : 13 roches par couronne se lisaient comme des cailloux épars ; 24, serrées, font un ANNEAU) */
      for(const q of m.nu){if(q.t!=='anneau')continue;const r0=7+r()*2.5,Rc=48+1.24*r0,ph=r()*6.283;
        for(let j=0;j<nb;j++){const a=ph+j/nb*6.283,P=rep(q.s,Math.cos(a)*Rc,ANN_H+Math.sin(a)*Rc);pose(P.x,P.y,P.z,r0*(.85+r()*.3));}}}
    else if(f==='ceinture'){
      for(const q of m.nu){
        if(q.t==='geant'){const rg=(36+r()*22)*(kN<1?.9:1),lat=q.s9*(ROAD_HALF+1.6*rg+16),h=-12+r()*30,P=rep(q.s,lat,h);pose(P.x,P.y,P.z,rg);
          for(let j=0,nj=Math.round((4+r()*4)*kN);j<nj;j++){const rr=3+r()*7,la=lat+q.s9*(r()*1.4+.2)*rg,hh=h+(r()-.5)*2.4*rg,ds=(r()-.5)*3*rg;if(loin(la,hh,rr)){const P2=rep(q.s+ds,la,hh);pose(P2.x,P2.y,P2.z,rr);}}}
        else if(q.t==='champ'){for(let j=0,nj=Math.round((7+r()*5)*kN);j<nj;j++){const rr=3+Math.pow(r(),1.6)*20,sg=r()<.5?-1:1,haut=r()<.45,la=haut?(r()-.5)*2*(ROAD_HALF+60):sg*(ROAD_HALF+40+r()*170),hh=haut?ANN_H+30+r()*110:-140+r()*170,ds=(r()-.5)*260;
          if(loin(la,hh,rr)){const P2=rep(q.s+ds,la,hh);pose(P2.x,P2.y,P2.z,rr);}}}}}
    else{ /* le tour : le sommet du looping (le point le plus haut du module), son rayon par trois points, le centre sous la dalle retournée */
      const k=L/Math.max(1,NP-1),i0=Math.max(1,Math.round((m.s0+60)/k)),i1=Math.min(NP-2,Math.round(m.s1/k));let it=i0;for(let i=i0;i<=i1;i++)if(pts[i].y>pts[it].y)it=i;
      const d=Math.max(2,Math.round(60/k));if(it-d<1||it+d>NP-2)continue;const a=pts[it-d],b=pts[it],c=pts[it+d],ab=a.distanceTo(b),bc=b.distanceTo(c),ca=c.distanceTo(a);
      const ar=Q.subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).length()/2;if(ar<1e-3)continue;const R=ab*bc*ca/(4*ar);if(R<90||R>700)continue;
      const C=new THREE.Vector3().copy(pts[it]).addScaledVector(Nn[it],R),rr=Math.min(95,.55*(R-40)/1.24);pose(C.x,C.y,C.z,rr);
      for(let j=0,nj=Math.round(6*kN);j<nj;j++){const u=r()*2-1,w=r()*6.283,q9=Math.sqrt(1-u*u),o=rr*(1.5+r()*.6);if(o+8>R-40)continue;pose(C.x+q9*Math.cos(w)*o,C.y+u*o,C.z+q9*Math.sin(w)*o,2.5+r()*5);}}
  }
  if(n){ROCHES.count=n;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;}return n;}
