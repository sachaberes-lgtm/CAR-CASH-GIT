/* ===== LES GÉANTS DE L'ORBITE (2026-11-13 nuit, la supervision des routes pour Sacha — « la désorbitation » : « le décor est le CENTRE du virage, peu d'objets mais GROS, et la route tourne autour ») =====
   Chaque grand virage d'un module qui le déclare (MODMARK.nu {t:'geant', s le côté, R le rayon du virage, g le genre voulu — facultatif} : la fronde, la ceinture des géants…) reçoit UN géant,
   tiré pour la route par geantsPose (appelée par orbiteBuild, avant rochesModules) : jamais deux fois le même sur une route, au poids du CARACTÈRE de la planète (GT_POIDS) —
   la Terre : l'épave et les satellites · Mars : la poussière rouge et les rochers ocre · Saturne : la glace et le plan des anneaux.
     L'ASTÉROÏDE        (asteroide) · la roche géante teintée par la planète (rochesModules, orbite-roches.js) ; sur Mars, OCRE, dans un nuage de poussière rouge, ses gros rochers autour ;
     LA LUNE GLACÉE     (lune)      · une lune de glace (fractures couleur rouille, cratères, reflet de la glace, liseré bleu) au CENTRE VRAI du virage (le cercle par trois points de la route) :
                                      la dalle couchée vers elle, on rase sa surface à ~24 m du bord de la route ; elle tue en vol ;
     L'ÉPAVE DE STATION (epave)     · une station en roue brisée : le moyeu au centre, ses rayons, des morceaux de couronne arrachés, des ailes solaires (une tordue), des feux rouges — et
                                      l'arc de la couronne où passe la route : on la traverse par le HANGAR (40 × 25 m de creux, il tourne avec la dalle), le virage dedans ; la coque tue en vol ;
     LA COMÈTE          (comete)    · le noyau au centre, sa chevelure, deux queues de gaz (poussière dorée, large ; ions bleus, fine, ~17° plus loin) qui passent EN TRAVERS de la route :
                                      on plonge dedans, on en ressort (le voile de l'image) — le gaz est INTÉGRÉ le long du regard (la formule de la gaussienne, sans pas de marche), ses grains filent ;
     LE PLAN DES ANNEAUX (anneaux, Saturne) · une nappe d'anneaux (le profil des anneaux de Saturne, orbite-saturne.js) autour d'un petit berger de glace au centre du virage : on longe
                                      l'anneau B ~30 m au-dessus, puis on le perce (la nappe s'ouvre devant l'œil) ; trois feuilles sur l'ordinateur (l'épaisseur), une sur le téléphone.
   Et sur toute la route : la PLANÈTE GROSSIT du départ au portail (geantsPlaneteK, lvlPlanete : ×1,28, ×1,45 sous Saturne) ; à la fin, la LUEUR DE LA RENTRÉE (le bord de l'image s'embrase).
   Tout est dans la scène dès le chargement, invisible : orbiteChauffe compile ces programmes AU MENU, rien ne naît au portail. Aucune lumière ajoutée (les shaders prennent la clé de l'orbite,
   ORB.cle, et le reflet de la planète). Le téléphone (ALLEGE) en a moins : sphères plus grossières, hangar en moins de facettes, une seule nappe, moins de grains, pas de cratères au shader.
   `?geant=lune|epave|comete|anneaux|asteroide` : tous les géants de ce genre (banc) · `?geant=0` : les astéroïdes seulement (la v6 d'avant).
   Hooks : `dbgGeants()` (la liste : genre, abscisses, centre, taille, le voile, la rentrée) · `dbgGeants('heurt')` (la coque du hangar contre ses points d'essai) · `dbgGeants('vue',j)` (une image du géant j). */
const GT_TEL=ALLEGE;
const GT_FORCE=(function(){const m=typeof location!=='undefined'&&/[?&]geant=([a-z0-9]+)/.exec(location.search);return m?m[1]:'';})();
const GT_POIDS=[{epave:3,comete:2.4,lune:1.4,asteroide:1},{asteroide:3,comete:2.2,epave:1.2,lune:.8},{anneaux:3,lune:2.6,comete:1.6,asteroide:1,epave:.8}]; /* le CARACTÈRE de chaque planète (astre.typ : 0 la Terre, 1 Mars, 2 Saturne) */
const GT_EP={A:40,B:25,hc:17,ep:3.5,p:4,G2:6}; /* LE HANGAR : le creux, une super-ellipse de 40 m de demi-largeur et 25 de demi-hauteur, centrée 17 m au-dessus de la route (le plafond à 42 m : le saut nitro monte à ~19), la coque de 3,5 m */
const GEANTS={liste:[],col:false,heurt:'',ep:null,lunes:[],com:null,nap:null,pous:[],typ:0,voile:0,rentree:0,ms:0,r:null};
const GT_F={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},GT_F2={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const GT_V=[0,1,2,3,4,5,6].map(function(){return new THREE.Vector3();}),GT_E=new THREE.Euler();
const GT_U=Object.assign({},SAT_U,{uPlan:ROCHE_U.uPlan}); /* la lumière de l'orbite, PARTAGÉE (la clé ORB.cle, la direction de la planète, sa couleur, la brume, le fondu, l'horloge) */
/* ---- LA LUNE GLACÉE : une sphère lisse, tout le relief est au fragment (les plaques, les fractures, les cratères — une normale bossée par les dérivées du relief) ---- */
const GT_LUNE_VS=['varying vec3 vW,vO,vN;',
  'void main(){vO=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const GT_LUNE_FS=['uniform vec3 uSol,uTerre,uFog,uPlan,uTeinte;uniform float uOp,uR,uGr,uRel;varying vec3 vW,vO,vN;',ROCHE_GLSL,
  'void main(){',
  '  vec3 o=normalize(vO)*3.+uGr;',
  '  float m=vn(o*1.1)*.55+vn(o*2.3+7.1)*.3+vn(o*4.7+3.7)*.15;',
  '  float n1=vn(o*6.3+vec3(0.,1.7,0.)),n2=vn(o*15.+5.),d1=abs(n1-.5),d2=abs(n2-.5);',
  '  float lin=1.-smoothstep(.006,.006+fwidth(n1)*1.2+.003,d1),lin2=1.-smoothstep(.004,.004+fwidth(n2)*1.2+.002,d2);',
  '  lin=max(lin*(.75+.25*vn(o*2.1)),lin2*.6*smoothstep(.3,.6,vn(o*1.7+9.)));',
  '  float h=smoothstep(.3,.8,m)*.35,ej=0.,kb=9.;',
  '#ifndef TEL',
  '  vec3 q=o*2.2,qi=floor(q),qf=fract(q);',
  '  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(float(x),float(y),float(z)),c=qi+g;',
  '    if(h31(c+19.7)<.3)continue;',
  '    vec3 ce=g+vec3(h31(c),h31(c+11.3),h31(c+27.1))*.7+.15;float rc=.10+.30*h31(c+41.9);kb=min(kb,length(ce-qf)/rc);}',
  '  h+=kb<1.?(kb*kb-1.)*.9:.3*exp(-(kb-1.)*(kb-1.)*12.);',
  '  ej=kb<1.?.06:max(0.,1.-(kb-1.)/1.6)*.32*(.5+vn(o*9.));',
  '#endif',
  '  vec3 N=normalize(vN),V=normalize(cameraPosition-vW);',
  '  float hm=h*uR*uRel;vec3 dpx=dFdx(vW),dpy=dFdy(vW);float hx=dFdx(hm),hy=dFdy(hm);',
  '  vec3 r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);',
  '  N=normalize(abs(det)*N-sign(det)*(hx*r1+hy*r2));',
  '  vec3 alb=mix(vec3(.84,.89,.95),vec3(.62,.70,.82),smoothstep(.45,.8,m))*uTeinte*(kb<1.?.9:1.);',
  '  alb=mix(alb,vec3(.44,.31,.25),min(1.,lin)*.7);alb*=1.+ej;',
  '  float d=dot(N,uSol),dif=clamp((d+.12)/1.12,0.,1.);vec3 sunC=vec3(1.,.97,.92);',
  '  vec3 col=alb*sunC*dif*1.45;',
  '  vec3 H=normalize(uSol+V);col+=sunC*pow(max(dot(N,H),0.),56.)*.40*step(0.,d)*(1.-min(1.,lin)*.7);',
  '  float fr=pow(1.-max(dot(N,V),0.),4.);col+=vec3(.35,.62,1.)*fr*(.18+.55*max(d,0.));',
  '  col+=alb*uPlan*max(dot(N,uTerre),0.)*.5;',
  '  col+=alb*vec3(.05,.08,.14)*(1.-max(d,0.));',
  '  col=mix(col,uFog,smoothstep(2600.,8500.,length(vW-cameraPosition)));',
  '  gl_FragColor=vec4(mix(uFog,col,uOp),1.);}'].join('\n');
const GT_LUNE_G=GT_TEL?new THREE.SphereGeometry(1,64,40):new THREE.SphereGeometry(1,128,80);
const GT_LUNES=[0,1].map(function(i){ /* [0] la lune glacée · [1] le berger du plan des anneaux */
  const mt=new THREE.ShaderMaterial({fog:false,extensions:{derivatives:true},defines:GT_TEL?{TEL:''}:{},vertexShader:GT_LUNE_VS,fragmentShader:GT_LUNE_FS,
    uniforms:Object.assign({},GT_U,{uGr:{value:0},uR:{value:300},uRel:{value:.035},uTeinte:{value:new THREE.Color(1,1,1)}})});
  const m=new THREE.Mesh(GT_LUNE_G,mt);m.visible=false;m.name='orbite géant : lune '+i;m.userData.on=false;scene.add(m);return m;});
/* ---- L'ÉPAVE : un seul maillage par route (bâti à la pose, comme la voûte du canyon), une seule matière — la lumière des lampes du dedans est CUITE dans la couleur (aK.x : la part du soleil) ---- */
const GT_EP_VS=['attribute vec3 aCol,aK;varying vec3 vW,vN,vC,vK;',
  'void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vC=aCol;vK=aK;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const GT_EP_FS=['uniform vec3 uSol,uTerre,uFog,uPlan;uniform float uOp,uT;varying vec3 vW,vN,vC,vK;',
  'void main(){',
  '  vec3 V=normalize(cameraPosition-vW),N=normalize(vN);if(dot(N,V)<0.)N=-N;',
  '  float d=dot(N,uSol),sv=vK.x,sp=vK.z;vec3 sunC=vec3(1.,.96,.9);',
  '  vec3 col=vC*sunC*max(d,0.)*1.9*sv;',
  '  vec3 H=normalize(uSol+V);col+=sunC*pow(max(dot(N,H),0.),mix(24.,140.,sp))*mix(.12,1.1,sp)*sv*step(0.,d);',
  '  col+=vC*uPlan*max(dot(N,uTerre),0.)*.45*sv;',
  '  col+=vC*(1.-sv)*.95+vC*vec3(.05,.055,.07);',
  '  float e=vK.y;if(e>1.5)e=step(.62,fract(uT*.7+dot(vW,vec3(.0031,.0017,.0023))))*1.6;',
  '  col+=vC*e*1.5;',
  '  col=mix(col,uFog,smoothstep(2600.,8500.,length(vW-cameraPosition)));',
  '  gl_FragColor=vec4(mix(uFog,col,uOp),1.);}'].join('\n');
const GT_EPAVE=(function(){const g=new THREE.BufferGeometry(),z=[0,0,0,0,0,0,0,0,0];for(const k of ['position','normal','aCol','aK'])g.setAttribute(k,new THREE.Float32BufferAttribute(z,3));
  const m=new THREE.Mesh(g,new THREE.ShaderMaterial({fog:false,side:THREE.DoubleSide,uniforms:GT_U,vertexShader:GT_EP_VS,fragmentShader:GT_EP_FS}));
  m.visible=false;m.name='orbite géant : épave';scene.add(m);return m;})();
/* ---- LE GAZ (les queues de la comète, sa chevelure, la poussière de Mars) : une coque (un cône tronqué, vu de DOS : chaque pixel a un seul fragment, au fond) — le fragment intègre
   la densité le long du regard, de l'œil à ce fond : queue = gaussienne autour de l'axe (largeur w = w0 + k z), chevelure = boule gaussienne. Additif, sans écrire la profondeur. ---- */
const GT_VOL_VS=['uniform vec3 uO,uD,uE1,uE2;uniform vec4 uH;varying vec3 vW;',
  'void main(){float z=mix(uH.x,uH.y,position.z),r=mix(uH.z,uH.w,position.z);vec3 w=uO+uD*z+(uE1*position.x+uE2*position.y)*r;vW=w;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}'].join('\n');
const GT_VOL_FS=['uniform vec3 uO,uD,uE1,uE2,uCol,uCol2;uniform vec4 uW,uC;uniform float uOp;varying vec3 vW;',
  'float erfA(float x){float x2=x*x;return sign(x)*sqrt(max(0.,1.-exp(-x2*(1.2732395+.147*x2)/(1.+.147*x2))));}',
  'void main(){',
  '  vec3 c=cameraPosition,dv=vW-c;float T=length(dv);vec3 v=dv/T,e=c-uO;',
  '  float ez=dot(e,uD),vz=dot(v,uD),Iq=0.,Ic=0.,t0=min(T,50.);',
  '  if(uW.w>0.){float a=max(1.-vz*vz,1e-3),b=dot(e,v)-ez*vz,c0=dot(e,e)-ez*ez,sa=sqrt(a),tm=-b/a;',
  '    float zs=ez+vz*clamp(tm,0.,T),w=uW.x+uW.y*max(zs,0.);',
  '    float Bz=uW.w*exp(-max(zs,0.)/uW.z)*smoothstep(-uW.x,uW.x*2.,zs),m=max(c0-b*b/a,0.);',
  '    Iq=Bz*exp(-m/(w*w))*(erfA(sa*(T-tm)/w)-erfA(sa*(t0-tm)/w))/(2.*sa);',
  '    vec3 pk=e+v*clamp(tm,0.,T);float ph=atan(dot(pk,uE2),dot(pk,uE1)),st=.5+.5*sin(ph*7.+zs*.0045+sin(ph*3.+zs*.002)*2.2);',
  '    Iq*=mix(.35,1.3,st*st);}',
  '  if(uC.y>0.){float ev=dot(e,v),mc=max(dot(e,e)-ev*ev,0.),s=uC.x,s2=uC.z;',
  '    Ic=uC.y*exp(-mc/(s*s))*(erfA((T+ev)/s)-erfA((t0+ev)/s))*.5+uC.w*exp(-mc/(s2*s2))*(erfA((T+ev)/s2)-erfA((t0+ev)/s2))*.5;}',
  '  vec3 col=uCol*(1.-exp(-Iq))+uCol2*(1.-exp(-Ic*1.2));',
  '  gl_FragColor=vec4(col*uOp,1.);}'].join('\n');
const GT_VOL_G=(function(){const g=new THREE.CylinderGeometry(1,1,1,GT_TEL?20:32,1,false);g.translate(0,.5,0);g.rotateX(Math.PI/2);return g;})(); /* l'axe sur +Z, de 0 à 1, rayon 1 : le sommet place tout */
const GT_VOLS=[0,1,2].map(function(i){ /* [0] la queue de poussière + la chevelure · [1] la queue d'ions · [2] la poussière rouge de Mars */
  const mt=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,side:THREE.BackSide,fog:false,vertexShader:GT_VOL_VS,fragmentShader:GT_VOL_FS,
    uniforms:{uO:{value:new THREE.Vector3()},uD:{value:new THREE.Vector3(0,0,1)},uE1:{value:new THREE.Vector3(1,0,0)},uE2:{value:new THREE.Vector3(0,1,0)},uH:{value:new THREE.Vector4(0,1,1,1)},
      uW:{value:new THREE.Vector4(1,0,1,0)},uC:{value:new THREE.Vector4(1,0,0,0)},uCol:{value:new THREE.Color()},uCol2:{value:new THREE.Color()},uOp:SAT_U.uOp}});
  const m=new THREE.Mesh(GT_VOL_G,mt);m.visible=false;m.frustumCulled=false;m.renderOrder=4;m.name='orbite géant : gaz '+i;m.userData.on=false;scene.add(m);return m;});
/* ---- LES GRAINS DE LA COMÈTE : ils filent le long des queues, vers le large ; six sur dix autour du passage de la route (on les traverse) ---- */
const GT_GRAIN_VS=['attribute vec4 aP;uniform vec3 uO,uD1,uD2,uN;uniform vec4 uW1,uW2,uZ;uniform float uT,uPx,uOp;varying vec3 vC;varying float vA;',
  'void main(){bool io=aP.w>.5;vec3 D=io?uD2:uD1;vec4 W=io?uW2:uW1;',
  '  vec3 e1=normalize(cross(D,uN)),e2=cross(D,e1);',
  '  float ph=fract(aP.x+uT*(io?.05:.03)*(.6+.8*fract(abs(aP.y)*7.31)));',
  '  float pres=step(fract(abs(aP.z)*13.7),.62);',
  '  float z=pres>.5?uZ.x+(ph*2.-1.)*uZ.y:ph*uZ.z;',
  '  float w=W.x+W.y*max(z,0.);',
  '  vec3 p=uO+D*z+(e1*aP.y+e2*aP.z)*w*.9;',
  '  vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;',
  '  vA=sin(ph*3.1416)*uOp*exp(-max(z,0.)/(uZ.z*.6));',
  '  vC=io?vec3(.55,.8,1.3):vec3(1.,.86,.62);',
  '  gl_PointSize=clamp(uPx*(io?1.6:2.6)/max(1.,-mv.z),1.,34.);vA*=1.6;}'].join('\n');
const GT_GRAIN_FS='varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord*2.-1.;float a=max(0.,1.-dot(q,q));gl_FragColor=vec4(vC*a*a*vA,1.);}';
const GT_GRAINS=(function(){const N=GT_TEL?360:1400,g=new THREE.BufferGeometry(),a=new Float32Array(N*4),r=mulberry32(0x6C0E7E);
  const gs=function(){return (r()+r()+r()-1.5)*1.1;};
  for(let i=0;i<N;i++){a[i*4]=r();a[i*4+1]=gs();a[i*4+2]=gs();a[i*4+3]=i%3===0?1:0;}
  g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(N*3),3));g.setAttribute('aP',new THREE.Float32BufferAttribute(a,4));
  const m=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,vertexShader:GT_GRAIN_VS,fragmentShader:GT_GRAIN_FS,
    uniforms:{uO:{value:new THREE.Vector3()},uD1:{value:new THREE.Vector3(0,0,1)},uD2:{value:new THREE.Vector3(0,0,1)},uN:{value:new THREE.Vector3(0,1,0)},uW1:{value:new THREE.Vector4(1,0,1,1)},
      uW2:{value:new THREE.Vector4(1,0,1,1)},uZ:{value:new THREE.Vector4(1,1,1,0)},uT:SAT_U.uT,uPx:{value:500},uOp:SAT_U.uOp}}));
  m.visible=false;m.frustumCulled=false;m.renderOrder=6;m.name='orbite géant : grains';scene.add(m);return m;})();
/* ---- LA NAPPE DES ANNEAUX : un disque plat, les bandes du profil des anneaux de Saturne (SATU, la même toile) en cercles autour du berger ; des grumeaux, des paillettes de près,
   la face éclairée ou la lumière qui traverse, le contre-jour qui allume la glace ; elle s'ouvre devant l'œil (on la perce sans mur) et se perd au loin ---- */
const GT_NAP_VS=['uniform vec3 uP0,uN,uE1,uE2;uniform float uRr,uOff;varying vec3 vW;varying vec2 vQ;',
  'void main(){vQ=position.xy*uRr;vec3 w=uP0+uE1*vQ.x+uE2*vQ.y+uN*uOff;vW=w;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}'].join('\n');
const GT_NAP_FS=['uniform sampler2D uProf;uniform vec3 uSol,uN,uFog;uniform vec2 uBd;uniform float uOp,uRr,uOff;varying vec3 vW;varying vec2 vQ;',ROCHE_GLSL,
  'void main(){',
  '  float rq=length(vQ),u=(rq-uBd.x)/(uBd.y-uBd.x);if(u<0.||u>1.)discard;',
  '  vec4 p=texture2D(uProf,vec2(u,.5));',
  '  vec3 V=cameraPosition-vW;float dC=length(V);V/=dC;',
  '  float g=vn(vec3(vQ*.045,uOff))*.6+vn(vec3(vQ*.21,uOff*1.7+3.))*.4;',
  '  float rl=.5+.5*sin(rq*.24+vn(vec3(rq*.011,uOff,1.))*6.),rl2=.5+.5*sin(rq*.73+g*4.);',
  '  float a=p.a*(.45+.75*g)*.7*mix(.35,1.25,rl*rl)*mix(.8,1.1,rl2);',
  '  a*=smoothstep(4.,60.,dC)*(1.-smoothstep(.8,1.,u))*smoothstep(0.,.04,u);',
  '  float sN=dot(uN,uSol),vNn=dot(uN,V),face=sN*vNn>0.?1.:.42;',
  '  float av=pow(max(dot(-V,uSol),0.),6.)*.9;',
  '  float sc=pow(h31(floor(vec3(vQ*.7,uOff))),60.)*smoothstep(400.,60.,dC)*2.5;',
  '  vec3 col=mix(p.rgb,vec3(.86,.9,.97),.3)*(.55+.6*abs(sN))*face*(1.05+.3*rl)+vec3(1.,.95,.85)*(av+sc)*p.a;',
  '  col=mix(col,uFog,smoothstep(3000.,8500.,dC));',
  '  gl_FragColor=vec4(col,a*uOp);}'].join('\n');
const GT_NAP_G=new THREE.CircleGeometry(1,GT_TEL?72:128);
const GT_NAPPES=(GT_TEL?[0]:[-5.5,0,5.5]).map(function(off,i){
  const mt=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,vertexShader:GT_NAP_VS,fragmentShader:GT_NAP_FS,
    uniforms:{uProf:{value:null},uSol:SAT_U.uSol,uFog:SAT_U.uFog,uOp:SAT_U.uOp,uN:{value:new THREE.Vector3(0,1,0)},uE1:{value:new THREE.Vector3(1,0,0)},uE2:{value:new THREE.Vector3(0,0,1)},
      uP0:{value:new THREE.Vector3()},uRr:{value:1000},uOff:{value:off},uBd:{value:new THREE.Vector2(100,1000)}}});
  const m=new THREE.Mesh(GT_NAP_G,mt);m.visible=false;m.frustumCulled=false;m.renderOrder=3;m.name='orbite géant : nappe '+i;scene.add(m);return m;});
/* ---- LE VOILE DE L'IMAGE : dans le gaz de la comète (ou la poussière de Mars), l'image s'allume ; à la fin de la route, la LUEUR DE LA RENTRÉE (le bord de l'image s'embrase) ---- */
const GT_VOILE=(function(){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
    uniforms:{uCol:{value:new THREE.Color()},uCol2:{value:new THREE.Color(1,.42,.16)},uK:{value:0},uBord:{value:0},uT:SAT_U.uT},
    vertexShader:'varying vec2 vU;void main(){vU=position.xy;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:['uniform vec3 uCol,uCol2;uniform float uK,uBord,uT;varying vec2 vU;',
      'void main(){float r=length(vU*vec2(1.,.8)),e=smoothstep(.45,1.3,r);',
      '  float fl=.8+.2*sin(uT*9.+atan(vU.y,vU.x)*6.)*sin(uT*5.3+r*7.);',
      '  gl_FragColor=vec4(uCol*uK*(.7+.3*e)+uCol2*uBord*e*e*fl,1.);}'].join('\n')}));
  m.frustumCulled=false;m.renderOrder=9990;m.visible=false;m.name='orbite géants : le voile';scene.add(m);return m;})();
/* ---- LA POSE ---- */
function geantsVide(){GEANTS.liste=[];GEANTS.col=false;GEANTS.ep=null;GEANTS.lunes=[];GEANTS.com=null;GEANTS.nap=null;GEANTS.pous=[];
  for(const m of GT_LUNES){m.visible=false;m.userData.on=false;}GT_EPAVE.visible=false;for(const m of GT_VOLS){m.visible=false;m.userData.on=false;}GT_GRAINS.visible=false;
  for(const m of GT_NAPPES)m.visible=false;GT_VOILE.visible=false;if(ROCHE_U.uOcre)ROCHE_U.uOcre.value=0;}
function gtPas(){return Math.max(1,Math.round(6/(L/(NP-1))));}
function gtDistRoute(P,x0,x1){ /* la distance de P à l'AXE de la route, hors de l'intervalle d'abscisses ]x0, x1[ */
  const dS=L/(NP-1),st=gtPas();let d2=1e18;
  for(let i=0;i<NP;i+=st){const s9=i*dS;if(s9>x0&&s9<x1)continue;const q=pts[i],dx=q.x-P.x,dy=q.y-P.y,dz=q.z-P.z,e=dx*dx+dy*dy+dz*dz;if(e<d2)d2=e;}
  return Math.sqrt(d2);}
function gtDistDalle(P,x0,x1){ /* la distance de P à la DALLE (ses deux bords, et la caisse posée dessus) dans [x0, x1] */
  let d2=1e18;const F9=GT_F2;
  for(let s9=Math.max(0,x0);s9<=Math.min(L,x1);s9+=6){frameAt(s9,F9);
    for(let k=-1;k<=1;k+=2)for(let h=0;h<=8;h+=8){const x=F9.p.x+F9.b.x*k*ROAD_HALF+F9.n.x*h-P.x,y=F9.p.y+F9.b.y*k*ROAD_HALF+F9.n.y*h-P.y,z=F9.p.z+F9.b.z*k*ROAD_HALF+F9.n.z*h-P.z,e=x*x+y*y+z*z;if(e<d2)d2=e;}}
  return Math.sqrt(d2);}
function gtCentre(q,o){ /* LE CENTRE VRAI du virage : le cercle par trois points de la route autour de q.s (repli : le côté du dessin, F.b × R) · nO la normale du plan du virage (du côté de la dalle) · [sa, sb] l'arc */
  const R=q.R,D9=Math.min(.42*R,300);
  frameAt(q.s-D9,GT_F);const A=GT_V[0].copy(GT_F.p);frameAt(q.s+D9,GT_F);const B=GT_V[1].copy(GT_F.p);frameAt(q.s,GT_F);const Cc=GT_V[2].copy(GT_F.p);
  const a=GT_V[3].subVectors(A,Cc),b=GT_V[4].subVectors(B,Cc),axb=GT_V[5].crossVectors(a,b),l2=axb.lengthSq();
  o.p=Cc.clone();o.t=GT_F.t.clone();o.n=GT_F.n.clone();o.b=GT_F.b.clone();
  if(l2>1e-6){const u=GT_V[6].copy(b).multiplyScalar(a.lengthSq()).addScaledVector(a,-b.lengthSq());o.C=new THREE.Vector3().crossVectors(u,axb).multiplyScalar(1/(2*l2)).add(Cc);}
  else o.C=Cc.clone().addScaledVector(GT_F.b,q.s9*R);
  o.Rc=o.C.distanceTo(Cc);o.nO=l2>1e-6?axb.clone().normalize():GT_F.n.clone();if(o.nO.dot(GT_F.n)<0)o.nO.negate();
  if(!(o.Rc>60&&o.Rc<3*R+300)){o.C=Cc.clone().addScaledVector(GT_F.b,q.s9*R);o.Rc=R;o.nO=GT_F.n.clone();} /* un cercle aberrant (la route presque droite là) : le côté du dessin */
  o.w=o.C.clone().sub(Cc).normalize();
  const lo=.82*o.Rc,hi=1.2*o.Rc;let sa=q.s,sb=q.s;
  for(let d=10;d<1.7*o.Rc;d+=10){frameAt(q.s-d,GT_F);const e=GT_F.p.distanceTo(o.C);if(e<lo||e>hi||q.s-d<=0)break;sa=q.s-d;}
  for(let d=10;d<1.7*o.Rc;d+=10){frameAt(q.s+d,GT_F);const e=GT_F.p.distanceTo(o.C);if(e<lo||e>hi||q.s+d>=L)break;sb=q.s+d;}
  o.sa=sa;o.sb=sb;return o;}
function gtTirage(reste,r,pref){ /* l'ordre des essais : le genre voulu par le module d'abord, puis un tirage sans remise au poids de la planète ; l'astéroïde en dernier recours */
  const c=[],o=[];for(const k in reste)c.push([k,reste[k]]);if(pref&&reste[pref]!=null)o.push(pref);
  while(c.length){let tot=0;for(const q of c)tot+=q[1];let x=r()*tot,j=0;for(;j<c.length-1;j++){x-=c[j][1];if(x<0)break;}const k=c.splice(j,1)[0][0];if(k!==pref)o.push(k);}
  if(o.indexOf('asteroide')<0)o.push('asteroide');return o;}
function gtVol(i,O,D,H,W,Cm,col,col2){ /* une coque de gaz : O l'origine, D l'axe · H [z0, z1, r0, r1] · W [w0, k, fondu, brillance] de la queue · Cm [σ, brillance] de la boule */
  const m=GT_VOLS[i],u=m.material.uniforms;u.uO.value.copy(O);u.uD.value.copy(D).normalize();
  const e1=u.uE1.value.set(1,0,0);if(Math.abs(u.uD.value.x)>.8)e1.set(0,1,0);e1.addScaledVector(u.uD.value,-e1.dot(u.uD.value)).normalize();u.uE2.value.crossVectors(u.uD.value,e1);
  u.uH.value.set(H[0],H[1],H[2],H[3]);u.uW.value.set(W[0],W[1],W[2],W[3]);u.uC.value.set(Cm[0],Cm[1],Cm[2]||1,Cm[3]||0);u.uCol.value.setRGB(col[0],col[1],col[2]);u.uCol2.value.setRGB(col2[0],col2[1],col2[2]);
  m.userData.on=true;}
function gtSortieCoque(g,C,dir){ /* le long de C + dir·t : où commence la coque du hangar (sa face du dehors), vue depuis le centre */
  frameAt(g.s,GT_F2);const V=GT_EP,X=GT_V[6];
  for(let t=0;t<g.Rc+60;t+=2){X.copy(C).addScaledVector(dir,t).sub(GT_F2.p);const lat=X.dot(GT_F2.b),up=X.dot(GT_F2.n);
    if(Math.pow(Math.abs(lat)/(V.A+V.ep),V.p)+Math.pow(Math.abs(up-V.hc)/(V.B+V.ep),V.p)<1)return t;}
  return g.Rc*.8;}
const GT_FAB={
  asteroide:function(g){g.rad=Math.min(300,(g.q.R-ROAD_HALF-45)/1.24); /* le rayon et la place de rochesModules (orbite-roches.js) */
    frameAt(g.q.s,GT_F);g.Ca=GT_F.p.clone().addScaledVector(GT_F.b,g.q.s9*g.q.R).addScaledVector(GT_F.n,-.15*g.rad);
    if(GEANTS.typ===1&&g.rad>=20&&!GT_VOLS[2].userData.on){const sg=1.4*g.rad; /* MARS : la poussière rouge autour de la roche ocre (la route la traverse) */
      gtVol(2,g.Ca,g.w,[-3*sg,3*sg,3*sg,3*sg],[1,0,1,0],[sg,.55],[0,0,0],[1,.45,.24]);GEANTS.pous.push(g);}
    return true;},
  lune:function(g,r){const m=GT_LUNES[0];if(m.userData.on)return false;
    const R=Math.min(gtDistDalle(g.C,g.sa-150,g.sb+150)-24,gtDistRoute(g.C,g.sa-150,g.sb+150)-ROAD_HALF-45,1100);if(!(R>=Math.max(80,.3*g.Rc)))return false;
    m.position.copy(g.C);m.scale.setScalar(R);m.quaternion.setFromEuler(GT_E.set(r()*6.28,r()*6.28,r()*6.28));
    const u=m.material.uniforms;u.uGr.value=r()*50;u.uR.value=R;u.uRel.value=.05;u.uTeinte.value.setRGB(1,1,1);
    m.userData.on=true;g.rad=R;GEANTS.lunes.push({C:g.C,R:R});GEANTS.col=true;return true;},
  anneaux:function(g,r){if(GEANTS.nap)return false;
    const prof=typeof SATU!=='undefined'&&SATU.ann&&SATU.ann.material.uniforms.uProf.value;if(!prof)return false;
    const sx=Math.min(g.sb-100,g.s+.25*(g.sb-g.s));frameAt(sx,GT_F);const P0=GT_F.p.clone(),tx=GT_F.t.clone(),Np=g.nO.clone();
    frameAt(Math.max(0,sx-300),GT_F);if(GT_V[0].subVectors(GT_F.p,P0).dot(Np)<0)Np.negate(); /* la route AU-DESSUS avant le perçage (on la longe), dessous après */
    const be=Math.max(-.3,Math.min(.3,.075+tx.dot(Np)));Np.addScaledVector(tx,-be).normalize(); /* on l'approche à ~7,5 % : ~30 m au-dessus 400 m avant */
    const Pc=g.C.clone().addScaledVector(Np,-GT_V[1].subVectors(g.C,P0).dot(Np)),rRoute=P0.distanceTo(Pc);
    const rIn=.3*rRoute,rOut=Math.min(GT_TEL?4200:5600,rIn+(rRoute-rIn)/.33); /* la route longe l'anneau B (le tiers du profil) */
    const e1=tx.clone().addScaledVector(Np,-tx.dot(Np)).normalize(),e2=new THREE.Vector3().crossVectors(Np,e1);
    for(const m of GT_NAPPES){const u=m.material.uniforms;u.uProf.value=prof;u.uP0.value.copy(Pc);u.uN.value.copy(Np);u.uE1.value.copy(e1);u.uE2.value.copy(e2);u.uRr.value=rOut;u.uBd.value.set(rIn,rOut);}
    GEANTS.nap={P0:P0,Pc:Pc,N:Np,rIn:rIn,rOut:rOut,sx:sx};g.rad=rOut;
    /* LE BERGER : une petite lune de glace grise au centre, dans le plan, s'il y a la place */
    const mb=GT_LUNES[1],Rb=Math.min(.22*rRoute,gtDistDalle(Pc,g.sa-150,g.sb+150)-60,gtDistRoute(Pc,g.sa-150,g.sb+150)-ROAD_HALF-60);
    if(Rb>=40){mb.position.copy(Pc);mb.scale.setScalar(Rb);mb.quaternion.setFromEuler(GT_E.set(r()*6.28,r()*6.28,r()*6.28));const u=mb.material.uniforms;u.uGr.value=r()*50;u.uR.value=Rb;u.uRel.value=.05;u.uTeinte.value.setRGB(.8,.8,.83);
      mb.userData.on=true;GEANTS.lunes.push({C:Pc,R:Rb});GEANTS.col=true;}
    return true;},
  comete:function(g,r){if(GEANTS.com)return false;
    const sg=Math.max(55,Math.min(120,.16*g.Rc)),up=g.nO,O=g.C.clone().addScaledVector(up,-.28*g.Rc); /* le NOYAU sous le centre du virage : ses queues passent PAR la route, puis montent dans le ciel (~16°) */
    if(gtDistRoute(O,-1,-1)<sg*1.6+ROAD_HALF+20)return false;
    const ar=g.sb-g.sa;frameAt(g.s-.03*ar,GT_F);const Xd=GT_F.p.clone();frameAt(Math.min(g.sb,g.s+.3*g.Rc),GT_F);const Xi=GT_F.p.clone(); /* où chaque queue coupe la route : la poussière juste avant le milieu du virage, les ions ~17° plus loin */
    const Dd=Xd.clone().sub(O),dd=Dd.length();Dd.multiplyScalar(1/dd);const Di=Xi.clone().sub(O),di=Di.length();Di.multiplyScalar(1/di);
    const Lt=Math.max(4000,Math.min(7200,13*g.Rc)),kd=Math.max(.02,(.25*g.Rc-sg)/dd),ki=Math.max(.006,(.07*g.Rc-.4*sg)/di);
    gtVol(0,O,Dd,[-9*sg,Lt,9*sg,2.8*(sg+kd*Lt)],[sg,kd,.5*Lt,.85],[sg,2.6,3*sg,.5],[1,.86,.62],[1,.93,.8]);
    gtVol(1,O,Di,[-sg,Lt,2.8*.4*sg+4,2.8*(.4*sg+ki*Lt)],[.4*sg,ki,.4*Lt,.9],[1,0],[.45,.75,1.35],[0,0,0]);
    const u=GT_GRAINS.material.uniforms;u.uO.value.copy(O);u.uD1.value.copy(Dd);u.uD2.value.copy(Di);u.uN.value.copy(up);u.uW1.value.set(sg,kd,0,0);u.uW2.value.set(.4*sg,ki,0,0);
    u.uZ.value.set(dd,3*(sg+kd*dd),Lt,0);
    GEANTS.com={C:O,sg:sg,Dd:Dd,Di:Di,kd:kd,ki:ki,Lt:Lt,dd:dd,di:di};g.rad=sg;g.C=O;return true;},
  epave:function(g,r){if(GEANTS.ep)return false;
    const V=GT_EP,Lh=Math.max(240,Math.min(GT_TEL?420:560,.55*(g.sb-g.sa))),h0=g.s-Lh/2,h1=g.s+Lh/2;if(h0<g.sa-40||h1>g.sb+40||h0<200||h1>L-200)return false;
    for(let s9=h0;s9<=h1;s9+=20){frameAt(s9,GT_F);const P=GT_V[0].copy(GT_F.p).addScaledVector(GT_F.n,V.hc);if(gtDistRoute(P,h0-260,h1+260)<V.A+V.ep+ROAD_HALF+12)return false;} /* le hangar ne touche aucune autre portion de route */
    g.rH=Math.max(28,Math.min(60,.08*g.Rc));if(gtDistRoute(g.C,-1,-1)<g.rH*1.6+ROAD_HALF+30)return false;
    g.h0=h0;g.h1=h1;const geo=gtEpaveBatit(g,r);const old=GT_EPAVE.geometry;GT_EPAVE.geometry=geo;if(old)old.dispose();
    const dS=L/(NP-1);frameAt(g.s,GT_F);
    GEANTS.ep={h0:h0,h1:h1,i0:Math.max(0,Math.floor(h0/dS)-1),i1:Math.min(NP-1,Math.ceil(h1/dS)+1),c:GT_F.p.clone().addScaledVector(GT_F.n,V.hc),r2:Math.pow(Lh/2+90,2),tri:geo.index.count/3};
    GEANTS.col=true;g.rad=g.rH;return true;}};
function gtEpaveBatit(g,r){ /* L'ÉPAVE : le hangar le long de la route (deux peaux, ses côtes, ses lampes, ses brèches, ses bouches rayées), le moyeu, les rayons, la couronne arrachée, les ailes, les feux */
  const P=[],Nr=[],Co=[],K=[],I=[],V=GT_EP,NK=GT_TEL?20:44,st=GT_TEL?8:4,len=g.h1-g.h0,ns=Math.max(4,Math.ceil(len/st));
  const vx=function(x,y,z,nx,ny,nz,c,sv,em,sp){P.push(x,y,z);Nr.push(nx,ny,nz);Co.push(c[0],c[1],c[2]);K.push(sv,em,sp);return P.length/3-1;};
  const hs=function(a,b){const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x);};
  const SEC=[];for(let k=0;k<NK;k++){const a=2*Math.PI*k/NK,c=Math.cos(a),sn=Math.sin(a),rr=1/Math.pow(Math.pow(Math.abs(c),V.p)+Math.pow(Math.abs(sn),V.p),1/V.p),lx=rr*c,ly=rr*sn;
    const nx=Math.sign(lx)*Math.pow(Math.abs(lx),V.p-1)/V.A,ny=Math.sign(ly)*Math.pow(Math.abs(ly),V.p-1)/V.B,l=Math.hypot(nx,ny)||1;SEC.push([lx,ly,nx/l,ny/l]);}
  const trous=[];for(let j=0,nj=GT_TEL?3:6;j<nj;j++)trous.push([3+((r()*Math.max(1,ns-6))|0),Math.round(NK*.25+(r()-.5)*NK*.28),1+((r()*2)|0),1+((r()*2)|0)]); /* les BRÈCHES : des tôles arrachées en haut, on voit les étoiles */
  const trou=function(i,k){for(const t of trous){let dk=((k-t[1])%NK+NK)%NK;if(dk>NK/2)dk-=NK;if(Math.abs(i-t[0])<=t[2]&&Math.abs(dk)<=t[3])return true;}return false;};
  const kL1=Math.round(NK*.16),kL2=Math.round(NK*.34),kF1=Math.round(NK*.58),kF2=Math.round(NK*.92),F9=GT_F2; /* les lampes : deux rangs au plafond (blanc chaud), deux près du sol (bleu) */
  for(let i=0;i<=ns;i++){const d0=len*i/ns;frameAt(g.h0+d0,F9);const jour=Math.exp(-Math.min(d0,len-d0)/40),rib=((d0+1.5)%24)<3.2?1:0,ins=rib*2.2;
    for(let k=0;k<NK;k++){const S=SEC[k];
      for(let m=0;m<2;m++){const A9=m?V.A+V.ep:V.A-ins,B9=m?V.B+V.ep:V.B-ins,lat=A9*S[0],up=V.hc+B9*S[1],sg=m?1:-1;
        let c,sv,em=0,sp=.25;
        if(m){const h=hs(i>>2,k>>1);c=h<.12?[.80,.62,.24]:h<.3?[.42,.43,.45]:[.74,.75,.74];sv=1;sp=h<.12?.6:.25;} /* le dehors : des tôles blanches, d'autres grises, des couvertures dorées */
        else{const h=hs(i>>1,k>>2),b9=(.42+.3*Math.max(0,S[1]))*(rib?.7:1)*(.9+.2*h);c=[.30*b9,.32*b9,.36*b9];sv=jour*.85;sp=.15;
          if((k===kL1||k===kL2)&&(i%4)<2){c=[1,.9,.72];em=1;}else if((k===kF1||k===kF2)&&(i%6)<2){c=[.55,.8,1];em=.8;}}
        vx(F9.p.x+F9.b.x*lat+F9.n.x*up,F9.p.y+F9.b.y*lat+F9.n.y*up,F9.p.z+F9.b.z*lat+F9.n.z*up,(F9.b.x*S[2]+F9.n.x*S[3])*sg,(F9.b.y*S[2]+F9.n.y*S[3])*sg,(F9.b.z*S[2]+F9.n.z*S[3])*sg,c,sv,em,sp);}}}
  const id=function(i,k,m){return (i*NK+((k+NK)%NK))*2+m;};
  for(let i=0;i<ns;i++)for(let k=0;k<NK;k++){if(trou(i,k))continue;for(let m=0;m<2;m++){const a=id(i,k,m),b=id(i,k+1,m),c=id(i+1,k+1,m),d=id(i+1,k,m);I.push(a,b,c,a,c,d);}}
  for(const e of [0,ns]){frameAt(g.h0+len*e/ns,F9);const tn=e?1:-1; /* les BOUCHES : un cadre rayé jaune et noir, plus large que la coque */
    const pt=function(S,A9,B9){const lat=A9*S[0],up=V.hc+B9*S[1];return [F9.p.x+F9.b.x*lat+F9.n.x*up,F9.p.y+F9.b.y*lat+F9.n.y*up,F9.p.z+F9.b.z*lat+F9.n.z*up];};
    for(let k=0;k<NK;k++){const S0=SEC[k],S1=SEC[(k+1)%NK],cS=((k>>1)%2)?[.86,.66,.08]:[.07,.07,.07],q=[pt(S0,V.A,V.B),pt(S1,V.A,V.B),pt(S1,V.A+V.ep+6,V.B+V.ep+6),pt(S0,V.A+V.ep+6,V.B+V.ep+6)];
      const b0=P.length/3;for(const v of q)vx(v[0],v[1],v[2],F9.t.x*tn,F9.t.y*tn,F9.t.z*tn,cS,1,0,.3);I.push(b0,b0+1,b0+2,b0,b0+2,b0+3);}}
  const cyl=function(p0,p1,rad,nseg,nring,c,band,cap){ /* un fût de p0 à p1 (rayon rad) ; band : l'anneau des hublots (−1 : aucun) ; cap : les deux fonds */
    const ax=new THREE.Vector3().subVectors(p1,p0),Lc=ax.length();if(!(Lc>.1))return;ax.multiplyScalar(1/Lc);const e1=new THREE.Vector3(1,0,0);if(Math.abs(ax.x)>.8)e1.set(0,1,0);e1.addScaledVector(ax,-e1.dot(ax)).normalize();const e2=new THREE.Vector3().crossVectors(ax,e1);
    const b0=P.length/3;
    for(let j=0;j<=nring;j++){const u=j/nring,hb=j===band;for(let k=0;k<nseg;k++){const a=2*Math.PI*k/nseg,cs=Math.cos(a),sn=Math.sin(a),nx=e1.x*cs+e2.x*sn,ny=e1.y*cs+e2.y*sn,nz=e1.z*cs+e2.z*sn;
      vx(p0.x+ax.x*Lc*u+nx*rad,p0.y+ax.y*Lc*u+ny*rad,p0.z+ax.z*Lc*u+nz*rad,nx,ny,nz,hb?[1,.85,.55]:c,1,hb?.9:0,.25);}}
    for(let j=0;j<nring;j++)for(let k=0;k<nseg;k++){const a=b0+j*nseg+k,b=b0+j*nseg+(k+1)%nseg;I.push(a,b,b+nseg,a,b+nseg,a+nseg);}
    if(cap)for(const j of [0,1]){const o=j?p1:p0,sg=j?1:-1,cc=vx(o.x,o.y,o.z,ax.x*sg,ax.y*sg,ax.z*sg,c,1,0,.25),b1=P.length/3;
      for(let k=0;k<nseg;k++){const a=2*Math.PI*k/nseg,cs=Math.cos(a),sn=Math.sin(a);vx(o.x+(e1.x*cs+e2.x*sn)*rad,o.y+(e1.y*cs+e2.y*sn)*rad,o.z+(e1.z*cs+e2.z*sn)*rad,ax.x*sg,ax.y*sg,ax.z*sg,c,1,0,.25);}
      for(let k=0;k<nseg;k++)I.push(cc,b1+k,b1+(k+1)%nseg);}};
  const boite=function(c,ex,ey,ez,col,em,sp){const T3=[ex,ey,ez]; /* un pavé : centre c, demi-axes ex, ey, ez */
    for(let f=0;f<3;f++)for(const sg of [-1,1]){const A=T3[f],U=T3[(f+1)%3],W=T3[(f+2)%3],l=A.length()||1,b0=P.length/3;
      for(const uw of [[-1,-1],[1,-1],[1,1],[-1,1]])vx(c.x+sg*A.x+uw[0]*U.x+uw[1]*W.x,c.y+sg*A.y+uw[0]*U.y+uw[1]*W.y,c.z+sg*A.z+uw[0]*U.z+uw[1]*W.z,sg*A.x/l,sg*A.y/l,sg*A.z/l,col,1,em,sp);
      I.push(b0,b0+1,b0+2,b0,b0+2,b0+3);}};
  const loin=function(X,m9){return gtDistRoute(X,-1,-1)>m9+ROAD_HALF+25;}; /* rien du dehors ne s'approche d'une route */
  const C=g.C,nO=g.nO,rH=g.rH,Lhub=2.4*rH,NS=GT_TEL?14:28;
  const dir0=new THREE.Vector3().subVectors(g.p,C);dir0.addScaledVector(nO,-dir0.dot(nO)).normalize(); /* vers le milieu du hangar, dans le plan du virage */
  const w1=new THREE.Vector3().crossVectors(nO,dir0).normalize();
  cyl(C.clone().addScaledVector(nO,-Lhub/2),C.clone().addScaledVector(nO,Lhub/2),rH,NS,GT_TEL?4:8,[.72,.73,.72],GT_TEL?2:4,true); /* le MOYEU, sa rangée de hublots */
  cyl(C.clone().addScaledVector(nO,-.2*Lhub),C.clone().addScaledVector(nO,.2*Lhub),rH*1.4,NS,2,[.55,.56,.58],-1,true); /* l'anneau d'amarrage */
  const fin=gtSortieCoque(g,C,dir0);cyl(C.clone().addScaledVector(dir0,rH*.9),C.clone().addScaledVector(dir0,fin+1.5),5.5,GT_TEL?6:10,2,[.6,.61,.62],-1,false); /* le RAYON qui tient le hangar */
  for(const sgA of [1,-1]){const dd=dir0.clone().applyAxisAngle(nO,sgA*2.0944),tg=new THREE.Vector3().crossVectors(nO,dd),D=.2+r()*.16,pts9=[];let ok=true; /* les deux autres rayons et leur morceau de COURONNE, arraché */
    for(let j=0;j<=10;j++){const ph=-D+2*D*j/10,X=C.clone().addScaledVector(dd,g.Rc*Math.cos(ph)).addScaledVector(tg,g.Rc*Math.sin(ph));if(!loin(X,V.B+V.ep+8)){ok=false;break;}pts9.push(X);}
    if(ok){const nR=GT_TEL?10:20,b0=P.length/3;
      for(let j=0;j<=10;j++){const X=pts9[j],rd=X.clone().sub(C).normalize(),dch=j===0||j===10?.55+r()*.4:1; /* les bouts déchirés */
        for(let k=0;k<nR;k++){const a=2*Math.PI*k/nR,cs=Math.cos(a),sn=Math.sin(a),rr=1/Math.pow(Math.pow(Math.abs(cs),V.p)+Math.pow(Math.abs(sn),V.p),1/V.p),lA=(V.A+V.ep)*rr*cs*dch*(j===0||j===10?.8+.4*r():1),lB=(V.B+V.ep)*rr*sn*dch;
          const nx=rd.x*cs+nO.x*sn,ny=rd.y*cs+nO.y*sn,nz=rd.z*cs+nO.z*sn,h=hs(j,k>>1);vx(X.x+rd.x*lA+nO.x*lB,X.y+rd.y*lA+nO.y*lB,X.z+rd.z*lA+nO.z*lB,nx,ny,nz,h<.15?[.80,.62,.24]:h<.4?[.42,.43,.45]:[.72,.73,.72],1,0,.25);}}
      for(let j=0;j<10;j++)for(let k=0;k<nR;k++){const a=b0+j*nR+k,b=b0+j*nR+(k+1)%nR;I.push(a,b,b+nR,a,b+nR,a+nR);}
      cyl(C.clone().addScaledVector(dd,rH*.9),C.clone().addScaledVector(dd,g.Rc-(V.A+V.ep)*.7),5,GT_TEL?6:10,2,[.6,.61,.62],-1,false);}
    else{const Lb=g.Rc*(.35+.25*r()),X=C.clone().addScaledVector(dd,Lb);if(loin(X,10))cyl(C.clone().addScaledVector(dd,rH*.9),X,5,GT_TEL?6:10,2,[.5,.5,.52],-1,true);}} /* sinon : un moignon */
  for(const sgN of [1,-1]){const T0=C.clone().addScaledVector(nO,sgN*Lhub/2),T1=C.clone().addScaledVector(nO,sgN*(Lhub/2+2.6*rH)); /* les AILES SOLAIRES : une poutre, quatre panneaux (un tordu) */
    if(!loin(T1,rH*2))continue;boite(T0.clone().lerp(T1,.5),w1.clone().multiplyScalar(2.2),dir0.clone().multiplyScalar(2.2),nO.clone().multiplyScalar(1.3*rH*sgN),[.5,.5,.5],0,.3);
    const Wp=2.2*rH,Hp=.8*rH;
    for(const sgW of [1,-1])for(const fr of [.45,.9]){const c9=C.clone().addScaledVector(nO,sgN*(Lhub/2+2.6*rH*fr)).addScaledVector(w1,sgW*(Wp/2+5));
      let ex=w1.clone().multiplyScalar(Wp/2),ey=nO.clone().multiplyScalar(Hp/2),ez=dir0.clone().multiplyScalar(.45);
      if(sgN<0&&sgW>0&&fr>.5){const q=new THREE.Quaternion().setFromAxisAngle(w1,.55);ey.applyQuaternion(q);ez.applyQuaternion(q);c9.addScaledVector(dir0,Hp*.3);} /* le panneau tordu */
      if(loin(c9,Wp*.6))boite(c9,ex,ey,ez,[.07,.11,.26],0,1);}}
  for(const X of [C.clone().addScaledVector(nO,Lhub/2+3),C.clone().addScaledVector(nO,-Lhub/2-3)])boite(X,new THREE.Vector3(1.6,0,0),new THREE.Vector3(0,1.6,0),new THREE.Vector3(0,0,1.6),[1,.12,.08],2,0); /* les FEUX ROUGES */
  for(const e of [0,len]){frameAt(g.h0+e,F9);const X=F9.p.clone().addScaledVector(F9.n,V.hc+V.B+V.ep+2);boite(X,F9.b.clone().multiplyScalar(1.5),F9.n.clone().multiplyScalar(1.5),F9.t.clone().multiplyScalar(1.5),[1,.12,.08],2,0);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(Nr,3));
  geo.setAttribute('aCol',new THREE.Float32BufferAttribute(Co,3));geo.setAttribute('aK',new THREE.Float32BufferAttribute(K,3));geo.setIndex(I);geo.computeBoundingSphere();return geo;}
function geantsPose(seed,libre){ /* (orbiteBuild, avant rochesModules) le genre et la place de chaque géant de la route ; libre : la grille de la piste d'orbiteBuild (gardée pour la suite) */
  geantsVide();
  try{const c=LVL.cur,a9=c&&c.astre,typ=a9&&a9.typ!=null?(a9.typ|0):0;GEANTS.typ=typ;
    if(!ORB.actif||!MODS||!MODS.length||!(NP>2))return;
    const t0=performance.now(),r=mulberry32((seed|0)^0x6EA17E5);GEANTS.r=r;
    if(a9&&a9.atmo!=null)ROCHE_U.uPlan.value.setHex(a9.atmo).multiplyScalar(.72);
    if(ROCHE_U.uOcre)ROCHE_U.uOcre.value=typ===1?1:0; /* Mars : les roches sont OCRE */
    const L9=[];for(const m of MODS){if(!m.nu)continue;for(const q of m.nu)if(q.t==='geant'&&q.R>0)L9.push(q);}
    L9.sort(function(a,b){return a.s-b.s;});
    const reste=Object.assign({},GT_POIDS[Math.max(0,Math.min(2,typ))]);
    for(const q of L9){const g={q:q,s:q.s};gtCentre(q,g);let k='asteroide';
      if(GT_FORCE!=='0'){const essais=GT_FORCE&&GT_FAB[GT_FORCE]?[GT_FORCE]:gtTirage(reste,r,q.g);
        for(const k9 of essais){if(!GT_FAB[k9]||k9==='asteroide')continue;if(k9==='anneaux'&&typ!==2&&GT_FORCE!=='anneaux')continue;if(GT_FAB[k9](g,r)){k=k9;break;}}}
      if(k==='asteroide')GT_FAB.asteroide(g,r);
      delete reste[k];q.k=k;g.k=k;GEANTS.liste.push(g);}
    GEANTS.ms=Math.round(performance.now()-t0);
  }catch(e){window.__geantsErr=e;console.warn('Géants',e);}}
function geantsRoches(n){ /* (orbiteBuild, après rochesModules) le noyau de la comète, les rochers ocre de Mars — dans les roches de l'orbite, à la suite des astéroïdes. Rend le nombre posé */
  try{const A=ROCHES.geometry.attributes,Mx=ROCHE_N,r=GEANTS.r||Math.random;let k=n|0;
    const pose=function(P,rad,ton){if(k>=Mx)return;ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));ORB.S.set(rad*(.9+r()*.25),rad*(.8+r()*.25),rad*(.9+r()*.25));ORB.P.copy(P);ORB.M.compose(ORB.P,ORB.Q,ORB.S);
      ROCHES.setMatrixAt(k,ORB.M);A.aVar.setXYZW(k,r(),ton,0,0);k++;};
    if(GEANTS.com)pose(GEANTS.com.C,GEANTS.com.sg*.42,.05); /* le NOYAU : sombre, dans sa chevelure */
    for(const g of GEANTS.pous){for(let j=0,m=3+((r()*3)|0);j<m;j++){const u=r()*2-1,a=r()*6.283,q=Math.sqrt(1-u*u),d=g.rad*(1.5+r()*1.1),rr=g.rad*(.10+r()*.14); /* MARS : les gros rochers ocre autour de la roche */
      const P=GT_V[0].set(g.Ca.x+q*Math.cos(a)*d,g.Ca.y+u*d,g.Ca.z+q*Math.sin(a)*d);if(gtDistRoute(P,-1,-1)>rr*1.4+ROAD_HALF+35)pose(P,rr,r());}}
    if(k>(n|0)){ROCHES.count=k;ROCHES.instanceMatrix.needsUpdate=true;A.aVar.needsUpdate=true;}return k;}catch(e){window.__geantsErr=e;return n|0;}}
/* ---- CHAQUE IMAGE (orbiteTick) : la visibilité, le voile (le gaz autour de l'œil), la rentrée ---- */
function geantsTick(t,dt,vr){
  const on=!!vr&&GEANTS.liste.length>0;
  for(const m of GT_LUNES)m.visible=on&&m.userData.on;
  GT_EPAVE.visible=on&&!!GEANTS.ep;
  for(const m of GT_VOLS)m.visible=on&&m.userData.on;
  GT_GRAINS.visible=on&&!!GEANTS.com;
  for(const m of GT_NAPPES)m.visible=on&&!!GEANTS.nap;
  const cv=GT_VOILE.material.uniforms;let kr=0,R9=0,G9=0,B9=0;
  if(on&&GEANTS.com){const C=GEANTS.com,cp=camera.position; /* DANS LA QUEUE : l'image s'allume de la couleur du gaz */
    const dens=function(D,w0,k9,Lf){const ex=cp.x-C.C.x,ey=cp.y-C.C.y,ez=cp.z-C.C.z,z=ex*D.x+ey*D.y+ez*D.z,r2=Math.max(0,ex*ex+ey*ey+ez*ez-z*z),w=w0+k9*Math.max(z,0);return z<-w0?0:Math.exp(-r2/(w*w))*Math.exp(-Math.max(z,0)/Lf);};
    const dd=dens(C.Dd,C.sg,C.kd,.5*C.Lt)*.17,di=dens(C.Di,.4*C.sg,C.ki,.4*C.Lt)*.2;R9+=dd+di*.45;G9+=dd*.86+di*.75;B9+=dd*.62+di*1.35;
    GT_GRAINS.material.uniforms.uPx.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));}
  if(on)for(const g of GEANTS.pous){const d2=camera.position.distanceToSquared(g.Ca),sg=1.4*g.rad,k9=Math.exp(-d2/(sg*sg))*.12;R9+=k9;G9+=k9*.45;B9+=k9*.24;} /* dans la poussière de Mars */
  if(vr&&L>0&&typeof s==='number'){kr=Math.max(0,Math.min(1,(s-(L-1700))/1450));kr=kr*kr*(3-2*kr);} /* LA RENTRÉE : les ~1,5 derniers km avant le portail */
  GEANTS.voile=Math.max(R9,G9,B9);GEANTS.rentree=kr;cv.uCol.value.setRGB(R9,G9,B9);cv.uK.value=1;cv.uBord.value=kr*.55;
  GT_VOILE.visible=GEANTS.voile>.004||kr>.004;}
function geantsPlaneteK(){ /* (lvlPlanete) LA PLANÈTE GROSSIT du départ au portail : ×1,28 (×1,45 sous Saturne, plus petite) — la désorbitation */
  if(!ORB.actif||!(L>0)||typeof s!=='number')return 1;const u=Math.max(0,Math.min(1,s/L)),G=GEANTS.typ===2?.45:.28;return 1+G*u*u*(3-2*u);}
function gtG(lat,up){const V=GT_EP;return Math.pow(Math.abs(lat)/V.A,V.p)+Math.pow(Math.abs(up-V.hc)/V.B,V.p);}
function geantsHeurt(p){ /* EN VOL : la coque du hangar (dans sa longueur, entre le creux et 6 fois sa section), la lune glacée, le berger — renvoie la cause, ou '' */
  const E=GEANTS.ep;
  if(E&&p.distanceToSquared(E.c)<E.r2){let bi=-1,bd=1e18;for(let i=E.i0;i<=E.i1;i++){const q=pts[i],d=(p.x-q.x)*(p.x-q.x)+(p.y-q.y)*(p.y-q.y)+(p.z-q.z)*(p.z-q.z);if(d<bd){bd=d;bi=i;}}
    if(bi>=0&&bd<130*130){const s9=bi*L/(NP-1);if(s9>=E.h0&&s9<=E.h1){frameAt(s9,GT_F2);const dx=p.x-GT_F2.p.x,dy=p.y-GT_F2.p.y,dz=p.z-GT_F2.p.z;
      const g=gtG(dx*GT_F2.b.x+dy*GT_F2.b.y+dz*GT_F2.b.z,dx*GT_F2.n.x+dy*GT_F2.n.y+dz*GT_F2.n.z);if(g>1&&g<GT_EP.G2)return 'paroi';}}}
  for(const q of GEANTS.lunes)if(p.distanceToSquared(q.C)<q.R*q.R)return 'paroi';
  return '';}
window.dbgGeants=function(k,a){ /* (banc) l'état des géants · 'heurt' : la coque du hangar contre ses points d'essai · 'vue', j : une image du géant j (la course en pause, l'œil sur la route avant lui) */
  if(k==='chauffe'){const o={};for(const m of [GT_LUNES[0],GT_LUNES[1],GT_EPAVE,GT_VOLS[0],GT_GRAINS,GT_NAPPES[0],GT_VOILE,ROCHES]){const P9=renderer.properties.get(m.material);o[m.name]=!!(P9.currentProgram||(P9.programs&&P9.programs.size));};return o;} /* les programmes sont-ils compilés (au menu : orbiteChauffe) ? */
  if(k==='heurt'){const E=GEANTS.ep;if(!E)return 'pas d\'épave';const m=(E.h0+E.h1)/2,o={},P=new THREE.Vector3();frameAt(m,GT_F);
    for(const c of [['centre',0,2],['plafond',0,40],['bord',30,4],['dans la coque',43,12],['dehors loin',0,200],['sous la dalle',0,-4]]){P.copy(GT_F.p).addScaledVector(GT_F.b,c[1]).addScaledVector(GT_F.n,c[2]);o[c[0]]=geantsHeurt(P)||'libre';}return o;}
  if(k==='vue'){const g=GEANTS.liste[a|0];if(!g)return 'pas de géant '+(a|0);if(started&&!gameOver&&!paused)togglePause();frameAt(Math.max(0,g.sa-120),GT_F);
    camera.position.copy(GT_F.p).addScaledVector(GT_F.n,110).addScaledVector(GT_F.t,-220);camera.up.copy(GT_F.n);camera.lookAt(g.C);camera.updateMatrixWorld();skyDome.position.copy(camera.position);
    orbiteTick(skyU.uTime.value);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);camera.up.set(0,1,0);return {k:g.k,s:Math.round(g.s)};}
  const f=function(v){return v?v.toArray().map(function(x){return Math.round(x);}):null;};
  return {typ:GEANTS.typ,force:GT_FORCE,ms:GEANTS.ms,err:window.__geantsErr?String(window.__geantsErr&&window.__geantsErr.stack||window.__geantsErr).slice(0,400):null,col:GEANTS.col,
    voile:+GEANTS.voile.toFixed(3),rentree:+GEANTS.rentree.toFixed(3),planeteK:+geantsPlaneteK().toFixed(3),
    liste:GEANTS.liste.map(function(g){return {k:g.k,fig:g.q.fig||null,s:Math.round(g.s),sa:Math.round(g.sa),sb:Math.round(g.sb),R:Math.round(g.q.R),Rc:Math.round(g.Rc),rad:Math.round(g.rad||0),C:f(g.C)};}),
    epave:GEANTS.ep?{h0:Math.round(GEANTS.ep.h0),h1:Math.round(GEANTS.ep.h1),tri:GEANTS.ep.tri}:null,nappe:GEANTS.nap?{sx:Math.round(GEANTS.nap.sx),rIn:Math.round(GEANTS.nap.rIn),rOut:Math.round(GEANTS.nap.rOut)}:null,
    visibles:{lunes:GT_LUNES.map(function(m){return m.visible;}),epave:GT_EPAVE.visible,gaz:GT_VOLS.map(function(m){return m.visible;}),grains:GT_GRAINS.visible,nappes:GT_NAPPES[0].visible,voile:GT_VOILE.visible}};};
