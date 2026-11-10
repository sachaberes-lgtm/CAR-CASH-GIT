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
/* ===== LES ROCHES SONT DURES (2026-11-10, Sacha : « les météorites ont pas de physique ») =====
   En vol, entrer dans une roche tue (cause 'roche'), comme une tour ou un pic. Rien n'est tiré ni posé en plus : le choc relit les matrices des instances (posées une
   fois par rochesPose), rangées dans une grille de 120 m refaite à chaque pose (ROCHE_COL.v). La forme testée : l'ellipsoïde de la roche à .86 de son rayon nominal
   (le relief va de .60 à 1.24 : on meurt DANS la pierre, jamais dans le vide devant un creux), plus la demi-caisse (0,9 m). Actif seulement quand les roches se voient. */
const ROCHE_COL={v:0,vu:-1,n:0,d:new Float32Array(ROCHE_N*10),g:new Map(),CG:120,M:new THREE.Matrix4(),P:new THREE.Vector3(),Q:new THREE.Quaternion(),S:new THREE.Vector3()};
function rochesGrille(){const C=ROCHE_COL,d=C.d,CG=C.CG;C.g.clear();C.n=ROCHES.count;C.vu=C.v;
  for(let i=0;i<C.n;i++){ROCHES.getMatrixAt(i,C.M);C.M.decompose(C.P,C.Q,C.S);const o=i*10,sx=C.S.x*.86+.9,sy=C.S.y*.86+.9,sz=C.S.z*.86+.9,e=Math.max(sx,sy,sz);
    d[o]=C.P.x;d[o+1]=C.P.y;d[o+2]=C.P.z;d[o+3]=-C.Q.x;d[o+4]=-C.Q.y;d[o+5]=-C.Q.z;d[o+6]=C.Q.w;d[o+7]=sx;d[o+8]=sy;d[o+9]=sz; /* le quaternion INVERSE : du monde vers la roche */
    for(let gx=Math.floor((C.P.x-e)/CG);gx<=Math.floor((C.P.x+e)/CG);gx++)for(let gy=Math.floor((C.P.y-e)/CG);gy<=Math.floor((C.P.y+e)/CG);gy++)for(let gz=Math.floor((C.P.z-e)/CG);gz<=Math.floor((C.P.z+e)/CG);gz++){
      const k=gx+','+gy+','+gz;let a=C.g.get(k);if(!a)C.g.set(k,a=[]);a.push(o);}}}
function rochesHeurt(p){ /* la caisse est-elle DANS une roche de Jupiter ? (pur : aucun état de jeu touché) */
  if(!ROCHES.count||!ROCHES.visible)return '';const C=ROCHE_COL;if(C.vu!==C.v||C.n!==ROCHES.count)rochesGrille();
  const a=C.g.get(Math.floor(p.x/C.CG)+','+Math.floor(p.y/C.CG)+','+Math.floor(p.z/C.CG));if(!a)return '';const d=C.d;
  for(let j=0;j<a.length;j++){const o=a[j],x=p.x-d[o],y=p.y-d[o+1],z=p.z-d[o+2],qx=d[o+3],qy=d[o+4],qz=d[o+5],qw=d[o+6];
    const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x); /* v' = v + qw·t + q×t, t = 2·q×v */
    const lx=(x+qw*tx+(qy*tz-qz*ty))/d[o+7],ly=(y+qw*ty+(qz*tx-qx*tz))/d[o+8],lz=(z+qw*tz+(qx*ty-qy*tx))/d[o+9];
    if(lx*lx+ly*ly+lz*lz<1)return 'roche';}
  return '';}
function rochesPose(c){ /* c : {r (le flux dérivé), libre, x0…, dS} d'orbiteBuild — écrit les matrices UNE fois, sur tout le niveau */
  const r=c.r,libre=c.libre,A=ROCHES.geometry.attributes,Mx=ROCHE_N;let n=0;
  const a9=LVL.cur&&LVL.cur.astre;if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72); /* la couleur de la planète du niveau */
  const pose=function(x,y,z,rad,fx,fy,fz){if(n>=Mx)return false;
    ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));ORB.S.set(rad*fx,rad*fy,rad*fz);ORB.P.set(x,y,z);ORB.M.compose(ORB.P,ORB.Q,ORB.S);
    ROCHES.setMatrixAt(n,ORB.M);A.aVar.setXYZW(n,r(),r(),0,0);n++;return true;};
  const forme=function(){return .75+r()*.6;}; /* l'écrasement d'une roche : de .75 à 1,35 par axe */
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
  ROCHES.count=n;ROCHE_COL.v++;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;
}
