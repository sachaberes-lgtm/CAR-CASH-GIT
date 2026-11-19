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
const ROCHE_U=Object.assign({},SAT_U,{uPlan:{value:new THREE.Color(.62,.47,.30)},uOcre:{value:0}}); /* uOcre : (2026-11-13) les roches OCRE de Mars (geantsPose) */ /* tout est partagé avec les satellites (soleil, planète, brume, fondu) sauf la couleur de la planète */
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
  fragmentShader:['uniform vec3 uSol,uTerre,uFog,uPlan;uniform float uOp,uOcre;varying vec3 vVP,vLoc;varying float vTon,vSd;',ROCHE_GLSL,
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
    '  alb=mix(alb,mix(vec3(.40,.19,.09),vec3(.70,.40,.19),m)*(.8+.4*vTon),uOcre);',                                /* (2026-11-13) MARS : l'ocre, ses taches plus claires */
    '  float d=dot(N,uSol),dif=max(d,0.),occ=.5+.5*smoothstep(.62,1.12,length(vLoc));',                           /* les creux (rayon local bas) restent sombres */
    '  vec3 sunC=vec3(1.,.96,.90);',
    '  vec3 col=alb*sunC*dif*2.1*mix(1.,occ,.7);',                                                                  /* UN soleil, dur : pas d\'air, pas de pénombre */
    '  vec3 H=normalize(uSol+V);col+=sunC*pow(max(dot(N,H),0.),38.)*.10*step(0.,d);',                              /* un reflet sec sur les arêtes */
    '  col+=alb*uPlan*max(dot(N,uTerre),0.)*.55*occ;',                                                              /* le reflet de la PLANÈTE, dans sa couleur (ambre sous Jupiter) */
    '  col+=alb*vec3(.010,.012,.020)+alb*uPlan*.22*(1.-max(d,0.))*(.6+.4*occ);',                                 /* (2026-11-14) la face sombre lisible : la lumière de la planète y reste (plus d\'icosaèdre noir) */                                                                             /* la lueur des étoiles : l\'ombre n\'est jamais un aplat */
    '  col+=alb*sunC*pow(1.-max(dot(Nv,normalize(-vVP)),0.),3.)*.40*smoothstep(-.1,.4,d);',                        /* le liseré côté soleil */
    '  col=mix(col,uFog,smoothstep(1800.,7500.,length(vVP)));',
    '  gl_FragColor=vec4(mix(uFog,col,uOp),1.);}'].join('\n')});
/* ===== LES ROCHES INDEXÉES (2026-11-14, v7.2, passe optimiseur de l'espace) =====
   L'icosphère de three arrive NON indexée : chaque coin de triangle est un sommet à part, et le vertex shader (trois octaves de bruit) tourne six fois par point de la
   sphère. Ici les coins aux positions IDENTIQUES AU BIT PRÈS deviennent un seul sommet (index) : mêmes triangles, mêmes positions, même ordre des coins — l'image ne change
   pas (la normale vient des dérivées, pas d'un attribut ; seul `position` est lu). MESURÉ (outils/banc-routes/roches-index.cjs) : 960 → 162 sommets par roche à l'ordi (320 triangles),
   240 → 42 au téléphone. `?orbidx=0` = la géométrie d'avant. */
function rochesIndexe(g){
  const P=g.attributes.position.array,n=P.length/3,F=new Float32Array(1),U=new Uint32Array(F.buffer),vu=new Map(),I=new Uint16Array(n),Q=[];
  const bits=function(x){F[0]=x;return U[0];};
  for(let k=0;k<n;k++){const key=bits(P[k*3])+','+bits(P[k*3+1])+','+bits(P[k*3+2]);let j=vu.get(key);
    if(j===undefined){j=Q.length/3;vu.set(key,j);Q.push(P[k*3],P[k*3+1],P[k*3+2]);}I[k]=j;}
  const gi=new THREE.BufferGeometry();gi.setAttribute('position',new THREE.Float32BufferAttribute(Q,3));gi.setIndex(new THREE.BufferAttribute(I,1));
  gi.computeBoundingSphere();return gi;
}
const ROCHES=(function(){
  const g0=new THREE.IcosahedronGeometry(1,!ALLEGE?3:1),g1=g0.index?g0.toNonIndexed():g0,g=ORB_IDX?rochesIndexe(g1):g1; /* (selon la version de three, déjà non indexée) */
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
  if(ESP_SANS_GEANTS)return ''; /* (2026-11-18, L'ESPACE SANS GÉANTS) les amas sont loin de la route, décor pur : plus rien n'est dur, ni roche ni satellite */
  /* (même jour, audit JB-02) LES SATELLITES FLOTTANTS ET PASSANTS de l'orbite terrestre aussi : une sphère au CŒUR de chaque engin (ORB.durs, posée par orbiteBuild — le corps, pas l'envergure des panneaux : on ne meurt jamais dans le vide entre deux panneaux) */
  {const D=ORB.durs;if(D&&D.length&&ORB.actif&&(SATS[0].visible||SATS[1].visible))for(let j=0;j<D.length;j+=4){const x=p.x-D[j],y=p.y-D[j+1],z=p.z-D[j+2];if(x*x+y*y+z*z<D[j+3]*D[j+3])return 'satellite';}}
  if(!ROCHES.count||!ROCHES.visible)return '';const C=ROCHE_COL;if(C.vu!==C.v||C.n!==ROCHES.count)rochesGrille();
  const a=C.g.get(Math.floor(p.x/C.CG)+','+Math.floor(p.y/C.CG)+','+Math.floor(p.z/C.CG));if(!a)return '';const d=C.d;
  for(let j=0;j<a.length;j++){const o=a[j],x=p.x-d[o],y=p.y-d[o+1],z=p.z-d[o+2],qx=d[o+3],qy=d[o+4],qz=d[o+5],qw=d[o+6];
    const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x); /* v' = v + qw·t + q×t, t = 2·q×v */
    const lx=(x+qw*tx+(qy*tz-qz*ty))/d[o+7],ly=(y+qw*ty+(qz*tx-qx*tz))/d[o+8],lz=(z+qw*tz+(qx*ty-qy*tx))/d[o+9];
    if(lx*lx+ly*ly+lz*lz<1)return 'roche';}
  return '';}
try{Object.assign(I18N,{'CONTRE UN SATELLITE':'HIT A SATELLITE'});}catch(e){}
function rochesPose(c){ /* c : {r (le flux dérivé), libre, x0…, dS} d'orbiteBuild — écrit les matrices UNE fois, sur tout le niveau */
  const r=c.r,libre=c.libre,A=ROCHES.geometry.attributes,Mx=ROCHE_N;let n=c.n0|0; /* (v5.4) n0 : les roches des modules, déjà posées (rochesModules) */
  const a9=LVL.cur&&LVL.cur.astre;if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72); /* la couleur de la planète du niveau */
  const pose=function(x,y,z,rad,fx,fy,fz){if(n>=Mx)return false;
    ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));ORB.S.set(rad*fx,rad*fy,rad*fz);ORB.P.set(x,y,z);ORB.M.compose(ORB.P,ORB.Q,ORB.S);
    ROCHES.setMatrixAt(n,ORB.M);A.aVar.setXYZW(n,r(),r(),0,0);n++;return true;};
  const forme=function(){return .75+r()*.6;}; /* l'écrasement d'une roche : de .75 à 1,35 par axe */
  if(c.amas){ /* (2026-11-18, L'ESPACE SANS GÉANTS) QUELQUES MÉTÉORITES, en amas à l'écart de la route (espAmasLieux) : une grosse, une moyenne une fois sur deux, trois à six petites */
    ORB.amas=[];for(const C of espAmasLieux(r,c.libreH)){const n0=n;
      const met=function(rad){const P=espAmasPoint(r,C,rad*1.7,c.libreH);if(P)pose(P[0],P[1],P[2],rad,forme(),forme(),forme());};
      met(10+r()*10);if(r()<.5)met(6+r()*4);for(let j=0,m=3+((r()*4)|0);j<m;j++)met(2.5+Math.pow(r(),1.5)*4.5);
      ORB.amas.push({s:C.s,n:n-n0});}
    ROCHES.count=n;ROCHE_COL.v++;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;return;}
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
  ROCHES.count=n;ROCHE_COL.v++;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;
}
/* ===== LES AMAS (2026-11-18, L'ESPACE SANS GÉANTS — Sacha : « laisse juste quelques satellites et météorites à des endroits ») =====
   Trois à six amas par route (un par tranche de route, sa place tirée dans la tranche, ni dans l'entrée ni au portail), chacun À L'ÉCART : son centre à 150-360 m de la route
   en plan, de côté et un peu devant (on le voit venir), sept fois sur dix au-dessus d'elle (la caméra plonge). Chaque objet est tenu à ESP_AMAS.dLib m au moins (plus son
   enveloppe) de TOUTE portion de route EN PLAN (libreH, la grille d'orbiteBuild sans la hauteur) : jamais au-dessus ni au-dessous d'une autre portion, jamais en travers
   d'un vol. Les satellites (orbiteBuild) et les météorites (rochesPose) gardent leurs maillages, leurs matières et leurs couleurs. Rend [{x, y, z, s (l'abscisse de la route)}]. */
const ESP_AMAS={R:55,dLib:62};
function espAmasLieux(r,libreH){const out=[];if(!(L>1200)||NP<3)return out;
  const n=Math.max(3,Math.min(6,Math.round(L/2000+r()-.5))),a0=650,a1=L-450;
  for(let k=0;k<n;k++)for(let e=0;e<16;e++){const s9=a0+(a1-a0)*(k+.15+.7*r())/n;frameAt(s9,F);const hl=Math.hypot(F.t.x,F.t.z);if(hl<.3)continue;
    const tx=F.t.x/hl,tz=F.t.z/hl,sg=r()<.5?-1:1,lat=150+r()*210,av=60+r()*220,dy=r()<.7?30+r()*170:-(50+r()*90);
    const x=F.p.x-tz*sg*lat+tx*av,z=F.p.z+tx*sg*lat+tz*av;
    if(!libreH(x,z,ESP_AMAS.R+ROAD_HALF+ESP_AMAS.dLib))continue;out.push({x:x,y:F.p.y+dy,z:z,s:Math.round(s9)});break;}
  return out;}
function espAmasPoint(r,C,ext,libreH){ /* un objet de l'amas (ext : son enveloppe), autour du centre C — null s'il n'a pas sa place */
  for(let e=0;e<6;e++){const u=r()*2-1,a=r()*6.283,q=Math.sqrt(1-u*u),d=(.25+.75*Math.sqrt(r()))*Math.max(8,ESP_AMAS.R-ext*.5),x=C.x+q*Math.cos(a)*d,y=C.y+u*d*.7,z=C.z+q*Math.sin(a)*d;
    if(libreH(x,z,ext+ROAD_HALF+ESP_AMAS.dLib))return [x,y,z];}
  return null;}
function rochesModules(r){ /* (v6, 2026-11-13 nuit) LES GÉANTS DES MODULES (MODS[k].nu, voir orbite-modules.js : la fronde, la ceinture des géants) : UN astéroïde géant au CENTRE de chaque grand virage,
   sa surface à ~45 m de la chaussée au plus près (le rayon du dessin, q.R), posé avant tout le reste et sur toutes les planètes. Plus d'anneaux ni de petites roches autour d'un module (Sacha :
   « les anneaux autour de la route avec des mini astéroïdes, n'importe quoi, c'est horrible » ; la supervision : peu d'objets mais GROS, au centre du virage). Rend le nombre posé. */
  if(!MODS||!MODS.length)return 0;
  const A=ROCHES.geometry.attributes,Mx=ROCHE_N,Q=new THREE.Vector3();let n=0,any=false,rgMax=0;const GROS=[];
  const pose=function(rg){ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));ORB.S.set(rg*(.9+r()*.2),rg*(.85+r()*.2),rg*(.9+r()*.2));ORB.P.copy(Q);ORB.M.compose(ORB.P,ORB.Q,ORB.S);
    ROCHES.setMatrixAt(n,ORB.M);A.aVar.setXYZW(n,r(),r(),0,0);n++;};
  for(const m of MODS){if(!m.nu||(m.fig!=='ceinture'&&m.fig!=='fronde'&&m.fig!=='rentree'&&m.fig!=='s-retourne'))continue; /* (v7.3) + le S retourné */
    if(!any){any=true;const a9=LVL.cur&&LVL.cur.astre;if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72);}
    for(const q of m.nu){if(q.t!=='geant'||!q.R||n>=Mx||(q.k&&q.k!=='asteroide'))continue;if(q.gros){GROS.push(q);continue;} /* (2026-11-13) seulement les géants tirés ASTÉROÏDE (les autres : orbite-geants.js) */const rg=Math.min(300,(q.R-ROAD_HALF-45)/1.24);if(rg<20)continue;
      frameAt(q.s,F);Q.copy(F.p).addScaledVector(F.b,q.s9*q.R).addScaledVector(F.n,-.15*rg);pose(rg);rgMax=Math.max(rgMax,rg);q.rg=Math.round(rg);q.c=[Math.round(Q.x),Math.round(Q.y),Math.round(Q.z)];}}
  /* (v6, 2026-11-14) LE PLUS GROS GÉANT — celui de LA RENTRÉE (le climax) : au centre du virage VU DE DESSUS (le cercle de trois points de la route, la dalle y étant couchée jusqu'à
     la verticale et au-delà), son haut au-dessus de la chaussée ; plus gros que tous les autres (1,2 fois le plus gros, 560 m au plus), et jamais à moins de 40 m du bord de la route où qu'elle passe */
  const P0=new THREE.Vector3(),P2=new THREE.Vector3(),G9=new THREE.Vector3();
  for(const q of GROS){if(n>=Mx)break;const d=Math.min(260,.22*q.R);frameAt(Math.max(0,q.s-d),F);P0.copy(F.p);frameAt(Math.min(L,q.s+d),F);P2.copy(F.p);frameAt(q.s,F);
    const ax=P0.x,az=P0.z,bx=F.p.x,bz=F.p.z,cx=P2.x,cz=P2.z,D=2*(ax*(bz-cz)+bx*(cz-az)+cx*(az-bz));if(Math.abs(D)<1e-6)continue;
    const ux=((ax*ax+az*az)*(bz-cz)+(bx*bx+bz*bz)*(cz-az)+(cx*cx+cz*cz)*(az-bz))/D,uz=((ax*ax+az*az)*(cx-bx)+(bx*bx+bz*bz)*(ax-cx)+(cx*cx+cz*cz)*(bx-ax))/D,Rh=Math.hypot(bx-ux,bz-uz);
    if(Rh>2.2*q.R)continue; /* le cercle n'est pas celui du virage (la route quasi droite là) : rien */
    const y0=F.p.y;let rg=Math.min(560,Math.max(1.2*rgMax,(Rh-95)/.96));
    for(let e=0;e<3;e++){G9.set(ux,y0-.3*rg,uz);let dm=1e9;for(let s9=Math.max(0,q.s-2600);s9<=Math.min(L,q.s+2600);s9+=20){frameAt(s9,F);dm=Math.min(dm,F.p.distanceTo(G9));}const r9=(dm-ROAD_HALF-40)/1.1;if(r9>=rg)break;rg=r9;} /* la route qui tourne autour en descendant : on rétrécit jusqu'à ce qu'elle passe partout à 40 m de lui */
    if(rg<40)continue;Q.set(ux,y0-.3*rg,uz);pose(rg);q.rg=Math.round(rg);q.c=[Math.round(Q.x),Math.round(Q.y),Math.round(Q.z)];}
  /* (2026-11-14, v7.2) LE COULOIR TENU PARTOUT : un géant n'était contrôlé que contre SA portion de route (q.R au point du module), et son relief va jusqu'à 1,24 fois le plus
     grand axe — MESURÉ (dbgOrbAudit, Saturne g4) : le géant n° 0 (345 m) entrait de 4,6 m dans le couloir d'une AUTRE portion (s 7 360). Chaque géant est relu contre toute la
     route (pas de 10 m) et, s'il le faut, réduit juste assez (sa sphère + la demi-route + 12 m) : il garde sa place au centre du virage. `?orbroc=0` = sans ce contrôle. */
  if(ORB_ROC&&n){const M9=new THREE.Matrix4(),P9=new THREE.Vector3(),Q9=new THREE.Quaternion(),S9=new THREE.Vector3();
    for(let i=0;i<n;i++){ROCHES.getMatrixAt(i,M9);M9.decompose(P9,Q9,S9);const r9=1.24*Math.max(S9.x,S9.y,S9.z);let dm=1e9;for(let s9=0;s9<=L;s9+=10){frameAt(s9,F);dm=Math.min(dm,F.p.distanceTo(P9));}
      const lib=dm-ROAD_HALF-12;if(r9>lib&&lib>20){S9.multiplyScalar(lib/r9);M9.compose(P9,Q9,S9);ROCHES.setMatrixAt(i,M9);}}}
  if(n){ROCHES.count=n;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;}return n;}
