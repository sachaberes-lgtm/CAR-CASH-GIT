/* ===== LE POUF AÉRIEN (2026-11-13, Sacha : « une animation ultra belle et ultra optimisée, qui ne prenne aucune ressource sur téléphone, pour quand tu traverses un nuage dans la
   map nuage : un pouf avec les petits cubes qu'il y a dans l'air qui sortent ; il faut que ce soit très aérien ») =====
   Les cubes du pouf sont les petits cubes de l'air (même matière, même lumière que la ouate et que les cubes qui flottent : NPOU, nuages-casses.js), mais ils ne coûtent
   presque rien :
     · UN SEUL CUBE (24 sommets) DESSINÉ 256 FOIS (4 bouffées × 64 cubes, en instances) : chaque cube porte ses tirages (place, taille, vie, élan, phase) — ~10 Ko en tout ;
     · C'EST LA CARTE GRAPHIQUE QUI ANIME : le shader calcule chaque cube à partir de l'âge de sa bouffée — aucune boucle par cube, aucune matrice, aucun tampon renvoyé par
       image (l'ancien anneau recomposait et renvoyait ses cubes un par un à chaque image) ; le processeur ne touche, par image, que l'âge des bouffées et le repère de la caisse
       (13 nombres), et seulement tant qu'une bouffée vit ;
     · un seul appel de dessin, et seulement pendant qu'une bouffée vit (~2,5 s) : le reste du temps la forme est cachée (rien à préparer pour three) ;
     · cubes OPAQUES (rien à mélanger : le téléphone ne peint chaque point qu'une fois) qui rapetissent et S'ÉVAPORENT (leur couleur rejoint celle de l'air) au lieu de
       s'effacer en transparence ; près de l'objectif ils fondent (jamais un cube qui couvre l'écran) ; le programme se compile au menu, pas au premier nuage ;
     · rien n'est créé au moment du pouf (aucun objet, aucune closure) : rien pour le ramasse-miettes.
   LA FORME DU POUF (ce qu'on voit) :
     1. LA BOUFFÉE (0-0,3 s) : les cubes jaillissent en COURONNE de part et d'autre de la caisse — le rond de ouate qu'on vient de percer —, par-dessus la route (jamais dessous),
        plus denses sur les côtés que sur le toit ; ils naissent d'un coup (un rebond de taille) et brillent un instant (la lumière les attrape) ;
     2. LE FLOTTEMENT (0,3-1,5 s) : la couronne s'est posée, elle tourne lentement ; chaque cube tournoie de moins en moins vite, se balance (trois sinus à sa phase) et monte
        doucement — les plus petits, plus légers, plus haut ; elle accompagne la caisse puis se laisse distancer, comme l'air qu'on vient de traverser ;
     3. LA DISSIPATION : chaque cube rapetisse peu à peu et s'évapore, à son heure (vies de 1,4 à 2,5 s).
   La gerbe vit dans le REPÈRE DE LA CAISSE (sa place, sa marche, son haut, chaque image) : sur la route qui se tord et se retourne, à 400 km/h, elle reste autour d'elle et
   par-dessus la route (MESURÉ : posée dans le monde, elle filait tout droit et disparaissait sous la route en moins d'une demi-seconde). En vol, la couronne est entière et son
   haut est figé : les figures ne la font pas tourner.
   À la SORTIE d'un nuage où l'on est resté (plus de 0,45 s dedans) : une petite bouffée (la moitié des cubes, plus serrée) — la ouate qui se détache de la caisse.
   Le même sur l'ordinateur et sur le téléphone : à ce prix-là le téléphone a tout. `?poufgpu=0` : l'ancien anneau (cubes calculés par le processeur) ; `dbgPoufGpu()` : l'état,
   `dbgPoufGpu(1)` : un pouf à la caisse. La démo (le même code, copié tel quel) : outils/pouf-nuage/demo.html (fabrique.cjs). */
/*<pouf-gpu>*/
const POUF_GPU={S:4,N:64,LMAX:2.65,on:typeof location==='undefined'||!/[?&]poufgpu=0\b/.test(location.search),fx:null,n:0};
function poufGpuFab(U8){ /* la forme, la matière et les gestes (tir, tick, fini) — U8 : les uniformes de lumière de la ouate (N8_U) */
  const S=POUF_GPU.S,N=POUF_GPU.N,C=S*N,box=new THREE.BoxGeometry(1,1,1),aR=new Float32Array(C*4),aQ=new Float32Array(C*4);
  let h=0x2545f491;const rnd=function(){h^=h<<13;h^=h>>>17;h^=h<<5;return (h>>>0)/4294967296;}; /* tirages fixes : la forme est la même à chaque lancement */
  for(let s=0;s<S;s++)for(let j=0;j<N;j++){const o=(s*N+j)*4; /* aR.x : la place sur l arc, en suite d or (n importe quel début de liste couvre déjà tout l arc) · y : l avant-arrière · z : la taille · w : la vie */
    aR[o]=(j*.6180339887+rnd()*.1)%1;aR[o+1]=rnd()*2-1;aR[o+2]=rnd();aR[o+3]=rnd();aQ[o]=s;aQ[o+1]=(j+.5)/N;aQ[o+2]=rnd();aQ[o+3]=rnd();} /* aQ : la bouffée, le rang, l élan, la phase */
  const g=new THREE.InstancedBufferGeometry();g.index=box.index;g.setAttribute('position',box.attributes.position);g.setAttribute('normal',box.attributes.normal); /* UN cube (24 sommets), dessiné 256 fois : ~10 Ko en tout */
  g.setAttribute('aR',new THREE.InstancedBufferAttribute(aR,4));g.setAttribute('aQ',new THREE.InstancedBufferAttribute(aQ,4));g.instanceCount=C;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e9);
  const uO=[],uP=[];for(let s=0;s<S;s++){uO.push(new THREE.Vector4(0,0,1,99));uP.push(new THREE.Vector4());}
  const uC=new THREE.Vector3(),uT=new THREE.Vector3(0,0,1),uH=new THREE.Vector3(0,1,0);
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k of ['uSunW','uSunC','uSky','uGnd','uLav','uK','uR','uSym'])U[k]=U8[k];
  U.uO={value:uO};U.uP={value:uP};U.uC={value:uC};U.uT={value:uT};U.uH={value:uH}; /* par bouffée — uO : la force, la part des cubes, l échelle, l âge · uP : le tirage, l arc (1 au sol : la gerbe par-dessus la route, 0 en vol : la couronne entière), la vitesse au moment du pouf. Pour toutes : la caisse MAINTENANT (uC sa place, uT sa marche, uH son haut) — la gerbe vit dans le repère de la caisse : sur la route qui se tord, à 400 km/h, elle reste autour d elle au lieu de filer tout droit sous la route */
  const m=new THREE.ShaderMaterial({uniforms:U,fog:true,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','attribute vec4 aR,aQ;uniform vec4 uO['+S+'],uP['+S+'];uniform vec3 uC,uT,uH;varying vec3 vN;varying float vB,vE;',
      'vec3 tourne(vec3 v,vec3 a,float g){float c=cos(g),s=sin(g);return v*c+cross(a,v)*s+a*dot(a,v)*(1.-c);}',
      'void main(){int i=int(aQ.x+.5);vec4 O=uO[i],P=uP[i];',
      '  float t=O.w,k=O.x,ech=O.z,u=t/(ech*(1.4+1.1*aR.w));',
      '  if(u>=1.||aQ.y>O.y){gl_Position=vec4(0.,0.,2.,1.);vN=vec3(0.);vB=vE=0.;return;}',                                       /* bouffée éteinte, ou cube de trop : hors champ, rien à peindre */
      '  float sp=P.z;vec3 T=uT,H=uH,A=normalize(cross(T,H)+vec3(1e-4));',
      '  float a0=fract(aR.x+P.x),th=mix(a0*6.2832,-.26+a0*3.66,P.y);th-=.42*P.y*sin(2.*th);th+=(P.x>.5?.45:-.45)*(1.-exp(-t*1.2));',                   /* au sol, l arc de -15 à 195 degrés, plus dense sur les côtés : une COURONNE qui s ouvre de part et d autre de la caisse, par-dessus la route (pas dessous), sans lui tomber sur le toit ; elle tourne doucement */
      '  vec3 d=normalize(A*cos(th)+H*sin(th)+T*aR.y*.4);',
      '  float R=ech*(.9+2.3*aQ.z)*(.8+.4*k)*(1.25-.5*aR.z),e=.35+.65*(1.-exp(-t*5.));',                                     /* LA BOUFFÉE : vite, puis elle se pose — les petits cubes, plus légers, partent plus loin */
      '  float ph=aQ.w*6.2832,f=t*t;',
      '  vec3 p=uC+H*.7-T*((.4+.004*sp)*t+(1.+.01*sp)*f)+d*R*e',                                                          /* l air qu on a traversé : la gerbe accompagne la caisse, puis se laisse distancer */
      '    +(A*sin(t*1.7+ph)+H*.55*sin(t*1.3+ph*1.7)+T*.5*cos(t*1.9+ph*2.3))*(.5*t)+H*(.3*t+(.35+.5*aR.w)*(1.5-aR.z)*f);',            /* LE FLOTTEMENT : elle se balance et monte (vers le haut de la caisse) ; les plus petits cubes, plus légers, montent plus haut */
      '  float a=min(t/.2,1.),b=a-1.,ob=1.+2.70158*b*b*b+1.70158*b*b;',                                                        /* la naissance : un rebond de taille */
      '  float fin=1.-smoothstep(.2,1.,u),fc=smoothstep(1.8,4.6,distance(p,cameraPosition));',                                 /* la fin : chaque cube rapetisse peu à peu, à son heure ; près de l objectif, il fond */
      '  float sc=ech*mix(.06,.27,aR.z*aR.z)*(.85+.3*k)*ob*fin*fc;',
      '  vec3 ax=normalize(vec3(aR.z-.5,aQ.w-.5,aR.y)+vec3(.013));',
      '  float g=(5.+7.*aQ.z)*(1.-exp(-t*2.2))/2.2+(.45+.6*aR.w)*t+ph;',                                                      /* tournoie vite à la bouffée, puis lentement */
      '  vec3 w=p+tourne(position*sc,ax,g);vN=tourne(normal,ax,g);',
      '  vB=(.9+.1*aQ.w)*(1.+.16*exp(-t*5.5));vE=.6*smoothstep(.2,.95,u);',                                                                               /* la lumière les attrape à la naissance ; vE : en vieillissant, le cube S ÉVAPORE (sa couleur rejoint celle de l air : la transparence sans en payer le prix) */
      '  vec4 mvPosition=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uSunC,uSky,uGnd,uLav;uniform float uSym;uniform vec4 uK,uR;varying vec3 vN;varying float vB,vE;',
      'void main(){vec3 N=normalize(vN);float lit=smoothstep(uR.x,uR.y,dot(N,uSunW));',                                      /* la lumière de la ouate : celle des cubes de l air (nuCasseInit) */
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(uLav*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,mix(N.y,abs(N.y),uSym)));',
      '  vec3 ombre=ciel*uR.z*(.78+.22*max(dot(N,normalize(vec3(-uSunW.x,.55*mix(1.,N.y<0.?-1.:1.,uSym),-uSunW.z))),0.));',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
      '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',
      '  gl_FragColor=vec4(vB*mix(ombre,soleil,lit),1.);','#ifdef USE_FOG','  gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,vE);','#endif','#include <fog_fragment>','}'].join('\n')});
  const me=new THREE.Mesh(g,m);me.name='nuages pouf aérien';me.frustumCulled=false;me.matrixAutoUpdate=false;me.castShadow=me.receiveShadow=false;me.visible=false;
  const vie=function(s){return uO[s].w<POUF_GPU.LMAX*Math.max(1,uO[s].z);};
  const fx={mesh:me,mat:m,uO:uO,uC:uC,uT:uT,uH:uH,
    tir:function(k,part,ech,arc,sp){ /* une bouffée (force, part des cubes, échelle, arc, vitesse) : la plus vieille cède sa place */
      let s=0;for(let q=1;q<S;q++)if(uO[q].w>uO[s].w)s=q;
      uO[s].set(k,part,ech,0);uP[s].set(Math.random(),arc,sp,0);me.visible=true;POUF_GPU.n++;return s;},
    suit:function(x,y,z,tx,ty,tz,hx,hy,hz){uC.set(x,y,z);uT.set(tx,ty,tz);uH.set(hx,hy,hz);}, /* la caisse maintenant : sa place, sa marche, son haut (unitaires, perpendiculaires) */
    tick:function(dt){ /* l unique travail par image : l âge des bouffées */
      if(!me.visible)return;let v=false;for(let s=0;s<S;s++)if(vie(s)){uO[s].w+=dt;v=true;}if(!v)me.visible=false;},
    fini:function(){for(let s=0;s<S;s++)uO[s].w=99;me.visible=false;},
    vivantes:function(){let n=0;for(let s=0;s<S;s++)if(vie(s))n++;return n;}};
  return fx;}
/*</pouf-gpu>*/
function poufGpu(){ /* l'effet, créé une fois que la matière des cubes existe (ses uniformes de lumière sont alors posés), compilé tout de suite (doux en course) */
  if(POUF_GPU.fx||!POUF_GPU.on||typeof NCB==='undefined'||!NCB.mesh)return POUF_GPU.fx;
  try{const fx=POUF_GPU.fx=poufGpuFab(N8_U);scene.add(fx.mesh);fx.mesh.visible=true;try{renderer.compile(scene,camera);}catch(e9){}fx.mesh.visible=fx.vivantes()>0;}catch(e){POUF_GPU.on=false;POUF_GPU.fx=null;window.__poufGpuErr=e;}
  return POUF_GPU.fx;}
const POUF_REP={H:new THREE.Vector3(),T:new THREE.Vector3(0,0,1),Hs:new THREE.Vector3(0,1,0)};
function poufGpuSuit(){ /* chaque image où une bouffée vit : le repère de la caisse (sa marche = sa vitesse mesurée ; son haut = celui de la caisse au sol, figé en vol : les figures ne font pas tourner la gerbe) */
  const fx=POUF_GPU.fx,R=POUF_REP,cv=NCB.cv,v=cv.length(),cp=carGroup.position;if(v>4)R.T.copy(cv).multiplyScalar(1/v);
  if(mode==='drive')R.Hs.set(0,1,0).applyQuaternion(carGroup.quaternion);
  const H=R.H.copy(R.Hs).addScaledVector(R.T,-R.Hs.dot(R.T));if(H.lengthSq()<1e-4)H.set(0,1,0);H.normalize();
  fx.suit(cp.x,cp.y,cp.z,R.T.x,R.T.y,R.T.z,H.x,H.y,H.z);}
function poufGpuTir(cp,k,part,ech){ /* une bouffée à la caisse : au sol la gerbe par-dessus la route, en vol la couronne entière */
  const fx=poufGpu();if(!fx)return false;fx.tir(k,part,ech,mode==='drive'?1:0,Math.min(140,NCB.cv.length()));poufGpuSuit();return true;}
window.dbgPoufGpu=function(a){const fx=poufGpu();if(!fx)return {on:POUF_GPU.on,pret:false};
  if(a==='lum'){const o={};for(const k in fx.mat.uniforms){const v=fx.mat.uniforms[k].value;if(v&&v.toArray&&k[0]==='u'&&k.length<6)o[k]=v.toArray().map(function(x){return +x.toFixed(4);});else if(typeof v==='number')o[k]=v;}o.fog=scene.fog?{c:scene.fog.color.toArray().map(function(x){return +x.toFixed(4);}),n:scene.fog.near,f:scene.fog.far}:null;o.cam=camera.position.distanceTo(carGroup.position);o.fov=camera.fov;return o;} /* (banc) la lumière de la ouate, la brume, la distance de l objectif : de quoi régler la démo */
  if(a)poufGpuTir(carGroup.position,a===true?1:+a,1,1);
  return {on:POUF_GPU.on,pret:true,vivantes:fx.vivantes(),tirs:POUF_GPU.n,visible:fx.mesh.visible,ages:fx.uO.map(function(o){return +o.w.toFixed(2);})};};
