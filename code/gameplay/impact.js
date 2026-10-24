/* ================= L'IMPACT (2026-10-15) — UNE SEULE ANIMATION POUR TOUT CE QU'ON PERCUTE =================
   Sacha : « quand on se prend un mur, un immeuble, un canyon, un glacier, une montagne chinoise, il faut que ça soit la MÊME animation —
   comme ça tu peux la travailler à fond. Il faut que ça soit presque FUN de s'écraser dans des trucs. Reprends le design de l'explosion
   quand tu meurs à cause de l'airtime et mets-le sur la ville, partout ; fais un truc beau une fois, on s'en servira pour tous les
   obstacles du jeu. » Chaque carte teste ses obstacles à sa façon (boîtes des tours, voxels du jade, cartes de hauteur du canyon et du
   glacier, capsules de la forêt et du volcan) et AUCUNE ne disait où ni dans quel sens on a tapé : la boule naissait dans le mur (à moitié
   cachée par lui), la ville avait son cratère à elle, le jade son craquement, le reste rien. `impPrep(test)` le retrouve pour toutes —
   on recule sur la trajectoire jusqu'à ressortir de l'obstacle (le POINT DE CONTACT), on tâte l'obstacle autour de ce point dans 26
   directions (la NORMALE de la paroi) — puis la même séquence partout :
     · LE COUP (0,13 s) — la caisse S'ÉCRASE contre la paroi (le nez au mur, c'est l'arrière qui vient s'écraser), une ÉTOILE de choc
       en pixels pousse au nez puis éclate, le monde passe 48 ms en NÉGATIF (la case de BD), la paroi se FISSURE, la caméra encaisse
       (elle plonge d'un demi-mètre, le champ se resserre), le craquement part et la musique se coupe net. Le temps ne ralentit pas
       (verdict du 26/09) : la caisse est arrêtée par le mur, c'est tout.
     · LA DÉTONATION — la boule DESSINÉE de l'airtime (volutes, dards, ondes), mais qui S'ÉCRASE contre la paroi (voir spawnBoomArt, `nW`),
       filmée de TROIS-QUARTS (BOOM_CAM.TROIS_QUARTS : de face, on ne lisait pas le mur) ;
       l'onde de choc court SUR le mur ; les pièces de la caisse et des éclats de roche calcinée REBONDISSENT sur la paroi ; une gerbe
       d'étincelles en jaillit puis DÉGOULINE le long du mur.
     · LE CRATÈRE — un trou noir au bord chauffé à blanc qui refroidit (or → rouge → suie), onze lézardes rougeoyantes qui courent, une
       traînée de suie vers le haut, le liseré d'encre des volutes : peint en PIXELS par le shader d'un seul quad posé sur la paroi. Il garde
       le feu : deux RÉPLIQUES (des mini-boules dessinées qui ressortent du trou, 0,34 et 0,78 s), des flammes qui lèchent, une fumée.
   Coût : un quad, un sprite, 14 éclats (une géométrie, deux matières) créés au chargement et dessinés une fois au menu (aucun programme
   à compiler sur l'explosion) ; zéro lumière ; zéro allocation à la mort. Liquides (rivière, Seine, lave) : tout pareil sauf le cratère
   et les éclats — il n'y a rien à fissurer. `dbgImpact()` au banc : la caisse lancée sur l'obstacle le plus proche. */
const IMP={frais:-1,on:false,coup:-1,COUP:.13,age:-1,rep:0,mou:false,test:null,v:0,R:4,ax:2,he:2,kE:1,
  INVERSE:true,neg:false, // l'image du coup en NÉGATIF (48 ms, canvas 3D seul) ; false = un éclair blanc · neg : posé à l'instant
  c:new THREE.Vector3(),n:new THREE.Vector3(0,1,0),d:new THREE.Vector3(0,0,1),s:new THREE.Vector3(),q:new THREE.Vector3(),
  t1:new THREE.Vector3(1,0,0),t2:new THREE.Vector3(0,0,1),p0:new THREE.Vector3(),cam0:new THREE.Vector3(),sc0:new THREE.Vector3(1,1,1),fov0:60};
const IMP_DIRS=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)IMP_DIRS.push(new THREE.Vector3(x,y,z).normalize());
const IMP_Y=new THREE.Vector3(0,1,0),IMP_M4=new THREE.Matrix4(),IMP_NEG='invert(1) saturate(0.35) contrast(1.3)';
/* LE POINT DE CONTACT ET LA NORMALE — juste avant explode. `test(p)` : vrai dans l'obstacle (celui de la carte : villeHeurt, jadeHeurt,
   canyonHeurt… — ils sont PURS ; celui du glacier ne l'est pas, on passe par sa surface, banqDans). `marge` : de combien ce test déborde
   de la vraie paroi (la caisse y compte pour un volume : 0,9 m pour les tours, 1,2 m pour les capsules de la forêt…) — le cratère se pose
   SUR la paroi, pas dans le vide devant ni caché derrière. */
function impPrep(test,cause,marge){
  IMP.frais=-1;
  try{
    const P=fallPos,V=IMP.d.copy(fallVel).multiplyScalar(SPD*AIR_RATE);let l=V.length(); // la vitesse MONDE du vol (la chute s'intègre ×SPD×AIR_RATE)
    if(!(l>2)){V.copy(PT_U.uVc.value);l=V.length();}
    if(!(l>.01)){V.set(0,-1,0);l=1;}
    V.multiplyScalar(1/l);IMP.v=Math.min(l,200);
    const q=IMP.q,n=IMP.n;let a=-1,b=0;
    for(let d=.3;d<=12;d+=.3){q.copy(P).addScaledVector(V,-d);if(!test(q)){a=d;break;}b=d;} // on recule jusqu'à ressortir…
    if(a<0){IMP.c.copy(P).addScaledVector(V,-1.5);n.copy(V).negate();}
    else{for(let k=0;k<6;k++){const m=(a+b)*.5;q.copy(P).addScaledVector(V,-m);if(test(q))b=m;else a=m;} // …au centimètre près
      IMP.c.copy(P).addScaledVector(V,-a);
      n.set(0,0,0);for(let r=.9;r<2;r+=.9)for(const D of IMP_DIRS){q.copy(IMP.c).addScaledVector(D,r);if(test(q))n.sub(D);} // on tâte autour
      if(n.lengthSq()<.05)n.copy(V).negate();
      n.normalize();}
    const k=n.dot(V);if(k>-.25)n.addScaledVector(V,-(k+.5)).normalize(); // une paroi fait FACE à la caisse (un coin rasé donnait une normale qui fuyait devant)
    IMP.s.copy(IMP.c).addScaledVector(n,-(marge||0)*.8);
    IMP.test=test;IMP.mou=/^(riviere|seine|lave)$/.test(cause||'');IMP.frais=performance.now();
  }catch(e){IMP.frais=-1;}
}
function banqDans(p){const S=banqSurf(p.x,p.z);return !!(S&&S.ok&&p.y<S.h+.3);} // le glacier : sous sa surface (banqHeurt écrit son état, on ne le rappelle pas)
/* EN CONDUITE, un MUR latéral (les couloirs du canyon, les façades de Paris) : la paroi est le bord de la route, côté `out` */
function impMur(out){
  IMP.frais=-1;
  try{const V=IMP.d.copy(PT_U.uVc.value);let l=V.length();if(!(l>1)){V.copy(F.b).multiplyScalar(out);l=1;}V.multiplyScalar(1/l);IMP.v=Math.min(l,200);
    IMP.c.copy(carGroup.position);IMP.n.copy(F.b).multiplyScalar(-out).normalize();
    IMP.s.copy(IMP.c).addScaledVector(IMP.n,-((CARS[level]||CARS[0]).w*.5+.1));
    IMP.test=null;IMP.mou=false;IMP.frais=performance.now();}catch(e){IMP.frais=-1;}
}
function impFrais(){const ok=IMP.frais>0&&performance.now()-IMP.frais<250;IMP.frais=-1;return ok;} // un impact préparé À L'INSTANT (consommé une fois)
function impBase(){ // le repère de la paroi : t1 horizontal, t2 « vers le haut » le long du mur (au sol : deux horizontales)
  const n=IMP.n,t1=IMP.t1,t2=IMP.t2;
  if(Math.abs(n.y)<.92)t1.crossVectors(IMP_Y,n).normalize();else t1.set(1,0,0).addScaledVector(n,-n.x).normalize();
  t2.crossVectors(n,t1).normalize();
}
/* L'ÉTOILE DU COUP : onze pointes irrégulières, quatre marches franches (blanc brûlant · or · feu · encre) en blocs de deux texels — le
   même grain que les volutes. Tirage FIXE. */
const IMP_ETOILE_TEX=(function(){
  const N=64,G=32,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d'),im=x.createImageData(N,N),d=im.data;
  let h9=91277;const rh=function(){h9=(h9*16807)%2147483647;return (h9-1)/2147483646;};
  const K=11,R=[];for(let i=0;i<K;i++)R.push([.8+rh()*.2,.3+rh()*.12]); // [pointe, creux]
  const C=[[255,250,232],[255,215,94],[255,122,36],[28,4,48]];
  for(let by=0;by<G;by++)for(let bx=0;bx<G;bx++){
    const px=(bx+.5)/G*2-1,py=(by+.5)/G*2-1,r=Math.hypot(px,py),f0=((Math.atan2(py,px)/6.2832)+1)%1*K,i=Math.floor(f0)%K,f=f0-Math.floor(f0);
    const rs=f<.5?R[i][1]+(R[i][0]-R[i][1])*f*2:R[i][0]+(R[(i+1)%K][1]-R[i][0])*(f-.5)*2,u=r/rs;
    const c=u<.4?C[0]:u<.64?C[1]:u<.85?C[2]:u<1?C[3]:null;if(!c)continue;
    for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){const o=((by*2+yy)*N+bx*2+xx)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;}}
  x.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;return t;})();
const IMP_ETOILE=new THREE.Sprite(new THREE.SpriteMaterial({map:IMP_ETOILE_TEX,transparent:true,depthTest:false,depthWrite:false,fog:false}));
IMP_ETOILE.renderOrder=12;IMP_ETOILE.frustumCulled=false;IMP_ETOILE.position.set(0,-1e5,0);scene.add(IMP_ETOILE);
IMP_ETOILE.onAfterRender=function(){if(IMP.age<0)this.visible=false;this.onAfterRender=function(){};}; // CHAUFFE : dessinée une fois, puis rangée
/* LE CRATÈRE, peint en pixels (56 de bord à bord) dans un seul quad : suie étirée vers le haut, onze lézardes qui courent et rougeoient,
   liseré d'encre, lèvre chauffée à blanc qui refroidit, fond noir où couve le brasier. Couleurs > 1 : le halo les prend. */
const IMP_CRAT=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
  uniforms:{uAge:{value:0},uSeed:{value:0},uOp:{value:0},uEtire:{value:1},uPull:{value:.25},uInk:{value:new THREE.Color(0x1c0430)}},
  // uPull : le quad AVANCE vers l'œil le long du rayon de vue (même place à l'écran, profondeur plus proche) — chaque carte a son écart
  // entre le volume de collision et ce qu'on voit (un tronc géant plus gros que sa capsule : le cratère tombait DEDANS, mesuré au banc)
  vertexShader:'uniform float uPull;varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);mv.xyz*=max(.05,1.-uPull/max(.1,length(mv.xyz)));gl_Position=projectionMatrix*mv;}',
  fragmentShader:['uniform float uAge;uniform float uSeed;uniform float uOp;uniform float uEtire;uniform vec3 uInk;varying vec2 vUv;',
    'float h1(float n){return fract(sin(n)*43758.5453);}',
    'void main(){',
    '  vec2 q=(floor((vUv*2.-1.)*28.)+.5)/28.;',
    '  float r=length(q),a=atan(q.y,q.x),cool=exp(-uAge*.5),rev=clamp(uAge/.13,0.,1.);',
    '  float rh=.26+.05*sin(a*5.+uSeed)+.035*sin(a*9.-uSeed*1.7)+.02*sin(a*17.+uSeed*3.1),lip=rh+.075;',
    '  float up=q.y*(q.y>0.?mix(1.,.5,uEtire):mix(1.,1.25,uEtire)),ds=length(vec2(q.x*1.05,up))+.05*sin(a*7.+uSeed);',
    '  vec4 c=vec4(.06,.035,.06,(1.-smoothstep(.3,.9,ds))*(1.-smoothstep(.62,.97,r))*.85*rev);',
    '  float hot=-1.;',
    '  for(int i=0;i<11;i++){float fi=float(i),ai=fi/11.*6.2832+(h1(fi+uSeed)-.5)*.45,L=.5+.48*h1(fi*3.1+uSeed);',
    '    float aw=ai+.16*sin(r*13.+fi*2.3)+.07*sin(r*31.+fi),da=abs(mod(a-aw+3.1416,6.2832)-3.1416)*r,w=.032*(1.-r/L)+.009;',
    '    if(r<L*rev&&r>rh*.85&&da<w)hot=max(hot,1.-r/L);}',
    '  if(hot>=0.)c=vec4(mix(uInk,vec3(2.,.72,.18),smoothstep(.2,.85,hot)*(.3+.7*cool)),1.);',
    '  if(r>=lip&&r<lip+.035)c=vec4(uInk,1.);',
    '  if(r>=rh&&r<lip){vec3 lc=mix(vec3(1.6,.55,.12),vec3(2.3,2.,1.5),cool*cool*cool);c=vec4(mix(vec3(.1,.05,.06),lc,.45+.55*cool),1.);}',
    '  if(r<rh){float f=1.-r/rh,fl=.72+.28*sin(uAge*17.+a*3.)*sin(uAge*11.-r*20.);',
    '    c=vec4(mix(vec3(.025,.01,.03),vec3(1.7,.55,.12)*fl,f*f*(.4+.6*min(1.,cool*1.4+.3))),1.);}',
    '  c.a*=uOp;if(c.a<.01)discard;',
    '  gl_FragColor=c;}'].join('\n'),
  transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8,fog:false}));
IMP_CRAT.renderOrder=2;IMP_CRAT.frustumCulled=false;IMP_CRAT.position.set(0,-1e5,0);scene.add(IMP_CRAT);
IMP_CRAT.onAfterRender=function(){if(IMP.age<0)this.visible=false;this.onAfterRender=function(){};};
/* LES ÉCLATS DE LA PAROI : de la roche CALCINÉE (charbon, et un sur trois encore en braise) — la même partout, ce qui saute d'un mur
   qu'une voiture vient de traverser en feu. Une géométrie, deux matières, quatorze morceaux recyclés. */
const IMP_ECL={geo:new THREE.DodecahedronGeometry(.3,0),
  m:[new THREE.MeshPhongMaterial({color:0x2b2228,shininess:6,flatShading:true}),new THREE.MeshPhongMaterial({color:0x2a140c,emissive:0xff5a1a,emissiveIntensity:1.3,shininess:30,flatShading:true})],L:[]};
for(let i=0;i<14;i++){const m=new THREE.Mesh(IMP_ECL.geo,IMP_ECL.m[i%3===0?1:0]);m.frustumCulled=false;m.position.set(0,-1e5,0);scene.add(m);
  m.onAfterRender=function(){if(IMP.age<0)this.visible=false;this.onAfterRender=function(){};};
  IMP_ECL.L.push({m:m,v:new THREE.Vector3(),s:new THREE.Vector3(1,1,1),rx:0,ry:0,t:0,life:0,on:false});}
function impRebond(p,v,e){ // un morceau qui touche la paroi (son plan tangent au point d'impact) rebondit dessus
  const N=IMP.n,S=IMP.s,h=(p.x-S.x)*N.x+(p.y-S.y)*N.y+(p.z-S.z)*N.z;if(h>=.15||h<-3)return false;
  const vn=v.dot(N);if(vn>=0)return false;
  p.addScaledVector(N,.15-h);v.addScaledVector(N,-(1+e)*vn).multiplyScalar(.7);return true;}
function impCoupPart(){ // explode vient de trouver un impact frais : LE COUP — la détonation suivra (boomDetone, à la fin du coup)
  IMP.on=true;IMP.coup=0;IMP.age=0;IMP.rep=0;impBase();
  const N=IMP.n,S=IMP.s,sp=CARS[level]||CARS[0];
  carGroup.updateMatrixWorld();const e=carGroup.matrixWorld.elements;let best=-1; // l'axe de la caisse le plus aligné sur le choc : c'est lui qui s'écrase
  for(let k=0;k<3;k++){const x=e[k*4],y=e[k*4+1],z=e[k*4+2],l=Math.hypot(x,y,z)||1,d=Math.abs(x*N.x+y*N.y+z*N.z)/l;if(d>best){best=d;IMP.ax=k;}}
  // de combien l'origine de la caisse se tient devant la paroi, à pleine longueur (he) — son origine est au centre en long et en large, mais
  // au RAS DES ROUES en hauteur : à plat ventre elle touche par les roues (rien à écraser sous l'origine), sur le dos par le toit
  const up9=IMP.ax===1?e[4]*N.x+e[5]*N.y+e[6]*N.z:0;
  IMP.he=IMP.ax===2?(sp.l||4.4)*.5:IMP.ax===0?(sp.w||2)*.5:up9>0?0:1.3;
  IMP.sc0.copy(carGroup.scale);IMP.cam0.copy(camera.position);IMP.fov0=camera.fov;
  IMP.R=Math.max(3.6,Math.min(5.8,3.2+IMP.v/28));IMP.kE=.85+Math.min(.5,IMP.v/160); // plus vite = plus gros trou, plus grosse étoile
  if(!IMP.mou){IMP_M4.makeBasis(IMP.t1,IMP.t2,N);IMP_CRAT.quaternion.setFromRotationMatrix(IMP_M4);
    IMP_CRAT.position.copy(S).addScaledVector(N,.12);IMP_CRAT.scale.set(IMP.R,IMP.R,1); // une paroi n'est jamais plane (voxels, cartes de hauteur, neige, troncs) : le reste de l'écart, c'est uPull qui le rattrape
    const U=IMP_CRAT.material.uniforms;U.uAge.value=0;U.uOp.value=0;U.uSeed.value=Math.random()*40;U.uEtire.value=1-Math.min(1,Math.abs(N.y)*1.1);IMP_CRAT.visible=true;}
  IMP_ETOILE.position.copy(S).addScaledVector(N,.35);IMP_ETOILE.material.rotation=Math.random()*6.28;IMP_ETOILE.material.opacity=1; // au NEZ, contre la paroi
  IMP_ETOILE.scale.setScalar(.7*IMP.kE);IMP_ETOILE.visible=true;
  try{if(!TUTO.on){sfx('pose.choc',{vol:6});sfx('impact.immeuble',{vol:IMP.mou?-8:0});}}catch(e){} // la tôle qui se plie + ce qui casse en face
  hap([38]);shake=Math.max(shake,1.6);
  // l'image du coup : le monde passe en NÉGATIF 48 ms (la case de BD) — sur le canvas 3D seul, le HUD reste lisible (le calque #flash en
  // `mix-blend-mode` ne voyait pas le canvas : écran blanc) ; la règle d'étalonnage `body>canvas` reprend la main ensuite
  // ⚠ un DRAPEAU, pas une comparaison de chaînes : le navigateur réécrit la valeur (« .35 » → « 0.35 ») et le négatif restait collé (banc)
  if(IMP.INVERSE&&!REDUCED_MOTION){renderer.domElement.style.filter=IMP_NEG;IMP.neg=true;setTimeout(impNegFin,48);}
  else{flashEl.style.transition='none';flashEl.style.background='#fff6dc';flashEl.style.opacity=REDUCED_MOTION?.2:.5;
    setTimeout(function(){flashEl.style.opacity=0;},48);setTimeout(function(){if(IMP.coup<0)return;flashEl.style.transition='';},90);}
}
function impCoupTick(dt){ // vrai pendant le coup : la boucle de l'explosion attend
  if(IMP.coup<0)return false;
  IMP.coup+=dt;const u=Math.min(1,IMP.coup/IMP.COUP),e=1-Math.pow(1-u,3),k=1-.4*e,g=1+.13*e;
  carGroup.scale.set(IMP.ax===0?k:g,IMP.ax===1?k:g,IMP.ax===2?k:g).multiply(IMP.sc0); // la caisse s'aplatit dans l'axe du choc, gonfle dans les deux autres
  carGroup.position.copy(IMP.s).addScaledVector(IMP.n,IMP.he*k+.05); // le nez contre la paroi : c'est l'ARRIÈRE qui vient s'écraser dessus
  const j=Math.sin(Math.PI*u)*(1-u*.35); // la caméra encaisse : elle plonge vers le mur et se reprend, le champ se resserre d'un coup
  camera.position.copy(IMP.cam0).addScaledVector(IMP.d,.6*j);
  const f=IMP.fov0*(1-.09*j);if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}
  if(u>=1){IMP.coup=-1;carGroup.scale.copy(IMP.sc0);camera.position.copy(IMP.cam0);camera.fov=IMP.fov0;camera.updateProjectionMatrix();boomDetone();}
  return true;
}
function impDetone(){ // la boule vient de partir (boomDetone) : ce qui rebondit, ce qui saute de la paroi, l'onde sur le mur
  const N=IMP.n,S=IMP.s,T1=IMP.t1,T2=IMP.t2,R=IMP.R,kv=.8+Math.min(.6,IMP.v/150);
  for(const d of debris){if(!d||!d.v)continue;const k=d.v.dot(N);d.v.addScaledVector(N,-k+1+Math.random()*2).addScaledVector(T2,1+Math.random()*3);} // les pièces de la caisse ne rentrent pas dans le mur : elles s'en décollent à peine et s'ÉTALENT le long de la paroi (renvoyées vers nous, un capot de 2 m passait en plaque plein cadre)
  for(const e of IMP_ECL.L){const m=e.m,a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.6,sp=(3+Math.random()*7)*kv;
    m.position.copy(S).addScaledVector(T1,Math.cos(a)*r).addScaledVector(T2,Math.sin(a)*r).addScaledVector(N,.35);
    e.v.copy(N).multiplyScalar(sp).addScaledVector(T1,Math.cos(a)*(3+Math.random()*7)).addScaledVector(T2,Math.sin(a)*(3+Math.random()*7));e.v.y+=2+Math.random()*6;
    const k=.5+Math.random()*1.1;e.s.set(k*(.7+Math.random()*.6),k*(.6+Math.random()*.5),k*(.7+Math.random()*.6));m.scale.copy(e.s);
    m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);e.rx=(Math.random()-.5)*12;e.ry=(Math.random()-.5)*12;
    e.t=0;e.life=2.2+Math.random()*1.4;e.on=!IMP.mou;m.visible=!IMP.mou;}
  for(let k=0;k<30;k++){const a=Math.random()*6.283,r=Math.random()*R*.8,s9=2+Math.random()*8; // la poussière soufflée hors du trou
    IMP.q.copy(S).addScaledVector(T1,Math.cos(a)*r).addScaledVector(T2,Math.sin(a)*r).addScaledVector(N,.3);
    spawnP(IMP.mou?spray:dust,IMP.q.x,IMP.q.y,IMP.q.z,N.x*s9+(Math.random()-.5)*4,N.y*s9+1+Math.random()*3,N.z*s9+(Math.random()-.5)*4,1+Math.random()*1.2);}
  for(let k=0;k<28;k++){const s9=8+Math.random()*16,u=(Math.random()-.5)*14,w=(Math.random()-.3)*12; // la gerbe qui gicle de la paroi
    spawnP(sparkGold,S.x+N.x*.3,S.y+N.y*.3,S.z+N.z*.3,N.x*s9+T1.x*u+T2.x*w,N.y*s9+T1.y*u+T2.y*w,N.z*s9+T1.z*u+T2.z*w,.3+Math.random()*.4);}
  bOndeU.copy(N);boomOnde.position.copy(S).addScaledVector(N,.12);boomOnde.quaternion.setFromUnitVectors(bOndeZ,N); // l'onde de choc court SUR la paroi
  boomOnde.userData.t=0;boomOnde.userData.R=IMP.mou?30:24;boomOnde.visible=true;
}
function impTick(dt){ // chaque image (porte de simulation de la boucle) : le cratère, l'étoile, les éclats, le feu qui couve
  if(IMP.age<0)return;
  IMP.age+=dt;const a=IMP.age,N=IMP.n,S=IMP.s,T1=IMP.t1,T2=IMP.t2,R=IMP.R,b=a-IMP.COUP;
  const U=IMP_CRAT.material.uniforms;U.uAge.value=a;U.uOp.value=IMP.mou?0:Math.min(1,a/.03)*(1-THREE.MathUtils.smoothstep(a,7,9));
  U.uPull.value=b<0?.25:1.6; // pendant le coup, à peine (il ne doit pas peindre SUR la caisse) ; la caisse partie, 1,6 m
  if(IMP_ETOILE.visible){ // l'étoile jaillit pendant le coup, puis se dissout dans la boule
    if(b<0){const e=1-Math.pow(1-a/IMP.COUP,2);IMP_ETOILE.scale.setScalar((.7+2.3*e)*IMP.kE);} // pendant l'écrasement : elle pousse au nez, la caisse reste lisible
    else{const w=b/.18;if(w>=1)IMP_ETOILE.visible=false;else{IMP_ETOILE.scale.setScalar((3+5.2*(1-(1-w)*(1-w)))*IMP.kE);IMP_ETOILE.material.opacity=1-w*w;}} // à la détonation : elle ÉCLATE
    IMP_ETOILE.material.rotation+=dt*.9;}
  if(b<0)return;
  for(const e of IMP_ECL.L){if(!e.on)continue;e.t+=dt;if(e.t>e.life){e.on=false;e.m.visible=false;continue;}
    const m=e.m;e.v.y-=22*dt;m.position.addScaledVector(e.v,dt);impRebond(m.position,e.v,.45);
    m.rotation.x+=e.rx*dt;m.rotation.y+=e.ry*dt;m.scale.copy(e.s).multiplyScalar(Math.min(1,(e.life-e.t)/.4)); // se replie en fin de vie
    m.visible=m.position.distanceToSquared(camera.position)>6; // à 2,5 m de l'objectif, un éclat n'est plus qu'un aplat
    if(m.material===IMP_ECL.m[1]&&e.t<1.4&&Math.random()<.5)spawnP(boomEmbO,m.position.x,m.position.y,m.position.z,e.v.x*.1,e.v.y*.1,e.v.z*.1,.25+Math.random()*.25);}
  IMP_ECL.m[1].emissiveIntensity=Math.max(.25,1.4-b*.45);
  if(b<.7&&!IMP.mou){const n9=Math.floor(dt*80+Math.random());for(let i=0;i<n9;i++){const x=(Math.random()-.5)*R*1.6,y=(Math.random()-.3)*R*1.2; // les étincelles DÉGOULINENT le long du mur
    spawnP(sparkGold,S.x+T1.x*x+T2.x*y+N.x*.25,S.y+T1.y*x+T2.y*y+N.y*.25,S.z+T1.z*x+T2.z*y+N.z*.25,
      N.x*(1+Math.random()*3)+T1.x*x*.8,N.y*(1+Math.random()*3)+T1.y*x*.8+(Math.random()-.2)*3,N.z*(1+Math.random()*3)+T1.z*x*.8,.35+Math.random()*.4);}}
  if(IMP.rep<2&&b>(IMP.rep?.78:.34)){IMP.rep++; // les RÉPLIQUES : le feu ressort du trou, en mini-boules dessinées
    IMP.q.copy(S).addScaledVector(N,1.1).addScaledVector(T2,.3);
    try{spawnBoomArt(IMP.q,IMP.rep===1?.42:.32,BOOM_MAT.feu,true,null,N);}catch(e){}
    for(let i=0;i<14;i++){const s9=4+Math.random()*8;spawnP(boomEmbO,IMP.q.x,IMP.q.y,IMP.q.z,N.x*s9+(Math.random()-.5)*6,N.y*s9+2+Math.random()*5,N.z*s9+(Math.random()-.5)*6,.5+Math.random()*.6);}
    shake=Math.max(shake,.5);try{if(!TUTO.on)sfx('explosion.loin',{vol:IMP.rep===1?-2:-6});}catch(e){}hap(IMP.rep===1?[20]:[12]);}
  if(b<6){const f9=1-THREE.MathUtils.smoothstep(b,3,6); // le feu qui COUVE : fumée, flammes qui lèchent la paroi, braises
    if(Math.random()<dt*7)spawnP(smokePool,S.x+N.x*1.2+T2.x*R*.55+(Math.random()-.5)*R*.6,S.y+N.y*1.2+T2.y*R*.55,S.z+N.z*1.2+T2.z*R*.55+(Math.random()-.5)*R*.6,N.x*1.6+(Math.random()-.5),3+Math.random()*3,N.z*1.6+(Math.random()-.5),2+Math.random()*1.4); // la fumée part du HAUT du trou : le cratère reste à vue
    if(!IMP.mou&&Math.random()<dt*24*f9){const x=(Math.random()-.5)*R*.9,y=R*(.05+Math.random()*.45),h=.5+Math.random()*.5;
      spawnP(flames,S.x+T1.x*x+T2.x*y+N.x*h,S.y+T1.y*x+T2.y*y+N.y*h,S.z+T1.z*x+T2.z*y+N.z*h,N.x*1.2+(Math.random()-.5)*.8,3.5+Math.random()*4,N.z*1.2+(Math.random()-.5)*.8,.3+Math.random()*.35);}
    if(Math.random()<dt*12*f9)spawnP(boomEmbO,S.x+N.x+(Math.random()-.5)*R*.7,S.y+N.y+(Math.random()-.5)*R*.5,S.z+N.z+(Math.random()-.5)*R*.7,N.x*2+(Math.random()-.5)*2,2+Math.random()*4,N.z*2+(Math.random()-.5)*2,.6+Math.random()*.6);}
  if(a>9)impFin();
}
function impFin(){ // le ménage (clearBoom, ou neuf secondes après) — rien n'est libéré : tout sert à la mort suivante
  if(IMP.age<0&&IMP.coup<0&&!IMP.on)return;
  if(IMP.coup>=0){carGroup.scale.copy(IMP.sc0);camera.fov=IMP.fov0;camera.updateProjectionMatrix();}
  IMP.on=false;IMP.coup=-1;IMP.age=-1;IMP.frais=-1;IMP_CRAT.visible=false;IMP_ETOILE.visible=false;
  for(const e of IMP_ECL.L){e.on=false;e.m.visible=false;}
  impNegFin();
}
function impNegFin(){if(IMP.neg){IMP.neg=false;renderer.domElement.style.filter='';}} // l'étalonnage `body>canvas` reprend la main
/* (2026-10-15 soir) L'IMPACT EN MINIATURE — Sacha : « fais le point 1 : étoile + éclats + étincelles au premier contact, sans boule ni
   cratère ». Ce qu'on percute SANS mourir — le coup d'épaule contre la paroi des couloirs du canyon (les Étroits, le tunnel, la mine) et
   les façades de Paris : tout ce qui passe par parisMur sous le seuil mortel — reprend L'IMPACT en petit, au PREMIER contact seulement
   (ensuite on frotte : les étincelles d'avant, rien de plus) : l'ÉTOILE de choc (la même texture en pixels) qui pousse au flanc puis
   éclate, quelques ÉCLATS de roche calcinée (la même forme, les mêmes matières, un sur trois en braise) qui sautent de la paroi — la moitié
   y retape et rebondit —, une GERBE d'étincelles. Plus le choc est franc (angle, vitesse), plus c'est gros. NI cratère, NI coup (la caisse
   ne s'arrête pas), NI négatif, NI boule, NI ralenti : rien n'explose, on frotte. Tout ce qui saute garde l'élan de la caisse (posé sur
   place, un éclat sortait du cadre en une image à 500 km/h) et l'étoile reste collée au flanc. SA PROPRE RÉSERVE (2 étoiles, 10 éclats) :
   jamais celle de la mort, qui peut tomber un instant après. Mêmes types de matériaux que L'IMPACT, chauffés à leur première image : aucun
   programme GPU neuf au choc. Console : dbgImpactMini(). */
const IMPM={E:[],L:[],ei:0,li:0,clk:0,tC:-1e9,n:0,der:null,K:{dt:.35,into:1.2}, // clk : l'horloge de JEU (la pause la gèle)
  N:new THREE.Vector3(),fw:new THREE.Vector3(),up:new THREE.Vector3(),s:new THREE.Vector3(),v:new THREE.Vector3(),
  m:IMP_ECL.m.map(function(m){return m.clone();})}; // ses matières à elle (la braise de la mort s'éteint pendant le plan) : même programme
for(let i=0;i<2;i++){const e=new THREE.Sprite(new THREE.SpriteMaterial({map:IMP_ETOILE_TEX,transparent:true,depthTest:false,depthWrite:false,fog:false})),u={on:false,t:0,k:1,o:new THREE.Vector3()};
  e.renderOrder=12;e.frustumCulled=false;e.position.set(0,-1e5,0);e.userData=u;scene.add(e);
  e.onAfterRender=function(){if(!u.on)e.visible=false;e.onAfterRender=function(){};}; // CHAUFFE : dessinée une fois, puis rangée
  IMPM.E.push(e);}
for(let i=0;i<10;i++){const m=new THREE.Mesh(IMP_ECL.geo,IMPM.m[i%3===0?1:0]),c={m:m,v:new THREE.Vector3(),s:new THREE.Vector3(1,1,1),p:new THREE.Vector3(),n:new THREE.Vector3(),rx:0,ry:0,t:0,life:0,on:false};
  m.frustumCulled=false;m.position.set(0,-1e5,0);scene.add(m);
  m.onAfterRender=function(){if(!c.on)m.visible=false;m.onAfterRender=function(){};};
  IMPM.L.push(c);}
function impMini(out,a,kmh,into){ // parisMur, sous le seuil mortel, à chaque image de contact : l'étoile ne part qu'au PREMIER (≥ 0,35 s de jeu sans toucher)
  const neuf=IMPM.clk-IMPM.tC>IMPM.K.dt;IMPM.tC=IMPM.clk;
  if(!neuf||!(into>IMPM.K.into)||mode!=='drive')return false;
  const sp=CARS[level]||CARS[0],N=IMPM.N.copy(F.b).multiplyScalar(-out).normalize(),fw=IMPM.fw.copy(F.t).multiplyScalar(driveDir),up=IMPM.up.copy(F.n),V=IMPM.v.copy(PT_U.uVc.value);
  const k=THREE.MathUtils.clamp(.45+.55*a/.52,.45,1)*(.8+.2*Math.min(1,kmh/700)); // le choc franc (angle) et la vitesse
  const S=IMPM.s.copy(carGroup.position).addScaledVector(N,-(sp.w*.5+.1)).addScaledVector(fw,(sp.l||4.4)*.42).addScaledVector(up,.8); // le coin AVANT du flanc, contre la paroi
  IMPM.n++;IMPM.der={a:+a.toFixed(3),kmh:Math.round(kmh),into:+into.toFixed(1),k:+k.toFixed(2)};
  const e=IMPM.E[IMPM.ei],u=e.userData;IMPM.ei=(IMPM.ei+1)%IMPM.E.length; // L'ÉTOILE, collée au flanc (elle suit la caisse)
  u.on=true;u.t=0;u.k=k;u.o.copy(S).sub(carGroup.position); // SUR la ligne de la paroi : la moitié de l'étoile déborde du flanc (plus en dedans, elle se lisait sur le toit)
  e.position.copy(carGroup.position).add(u.o);e.material.rotation=Math.random()*6.28;e.material.opacity=1;e.scale.setScalar(.6*k);e.visible=true;
  const nE=3+Math.round(2*(k-.45)/.55); // LES ÉCLATS : 3 à 5
  for(let i=0;i<nE;i++){const c=IMPM.L[IMPM.li],m=c.m;IMPM.li=(IMPM.li+1)%IMPM.L.length;const an=Math.random()*6.283,r=Math.random()*.5,sp9=(3+Math.random()*6)*(.8+.4*k);
    c.p.copy(S);c.n.copy(N); // SA paroi : le plan tangent au point de contact (un couloir tourne : chacun garde le sien)
    m.position.copy(S).addScaledVector(fw,Math.cos(an)*r).addScaledVector(up,Math.sin(an)*r).addScaledVector(N,.3);
    c.v.copy(V).multiplyScalar(.86+Math.random()*.1) // l'élan de la caisse, un peu moins : ils glissent vers l'arrière sous nos yeux
      .addScaledVector(N,i&1?-(2+Math.random()*3):sp9).addScaledVector(fw,(Math.random()-.5)*6).addScaledVector(up,2+Math.random()*5); // un sur deux retape la paroi
    const k9=(.7+Math.random()*.6)*(.8+.3*k);c.s.set(k9*(.7+Math.random()*.6),k9*(.6+Math.random()*.5),k9*(.7+Math.random()*.6));m.scale.copy(c.s);
    m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);c.rx=(Math.random()-.5)*14;c.ry=(Math.random()-.5)*14;
    c.t=0;c.life=.7+Math.random()*.5;c.on=true;m.visible=true;}
  const nS=18+Math.round(24*k); // LA GERBE qui gicle de la paroi
  for(let i=0;i<nS;i++){const s9=6+Math.random()*12,u9=(Math.random()-.5)*10,w9=Math.random()*7;
    spawnP(sparkGold,S.x+N.x*.25,S.y+N.y*.25,S.z+N.z*.25,V.x*.8+N.x*s9+fw.x*u9+up.x*w9,V.y*.8+N.y*s9+fw.y*u9+up.y*w9,V.z*.8+N.z*s9+fw.z*u9+up.z*w9,.22+Math.random()*.3);}
  return true;
}
function impMiniTick(dt){ // chaque image (porte de simulation de la boucle) : l'étoile qui pousse puis éclate, les éclats qui volent
  IMPM.clk+=dt;
  for(const e of IMPM.E){const u=e.userData;if(!u.on)continue;u.t+=dt;const t=u.t,k=u.k;
    e.position.copy(carGroup.position).add(u.o);
    if(t<.07){const g=1-Math.pow(1-t/.07,2);e.scale.setScalar((.6+2.2*g)*k);} // elle pousse au flanc (2,8 m au choc franc : la moitié de celle de la mort)
    else{const w=(t-.07)/.15;if(w>=1){u.on=false;e.visible=false;continue;}e.scale.setScalar((2.8+3*(1-(1-w)*(1-w)))*k);e.material.opacity=1-w*w;} // puis ÉCLATE
    e.material.rotation+=dt*.9;}
  for(const c of IMPM.L){if(!c.on)continue;c.t+=dt;if(c.t>c.life){c.on=false;c.m.visible=false;continue;}
    const m=c.m,P=m.position,N=c.n;c.v.y-=22*dt;P.addScaledVector(c.v,dt);
    const h=(P.x-c.p.x)*N.x+(P.y-c.p.y)*N.y+(P.z-c.p.z)*N.z,vn=c.v.dot(N);
    if(h<.15&&h>-3&&vn<0){P.addScaledVector(N,.15-h);c.v.addScaledVector(N,-1.45*vn);} // il retape la paroi et REBONDIT (l'élan le long du mur reste : la caisse file)
    m.rotation.x+=c.rx*dt;m.rotation.y+=c.ry*dt;m.scale.copy(c.s).multiplyScalar(Math.min(1,(c.life-c.t)/.25)); // se replie en fin de vie
    m.visible=P.distanceToSquared(camera.position)>6;
    if(m.material===IMPM.m[1]&&c.t<.6&&Math.random()<.35)spawnP(boomEmbO,P.x,P.y,P.z,c.v.x*.9,c.v.y*.9,c.v.z*.9,.2+Math.random()*.2);}
}
function impMiniFin(){IMPM.tC=-1e9;for(const e of IMPM.E){e.userData.on=false;e.visible=false;}for(const c of IMPM.L){c.on=false;c.m.visible=false;}} // le ménage (clearBoom)
/* console : dbgImpactMini() → l'état (chocs, dernier choc a/kmh/into/k, étoiles, éclats en vol, programmes GPU, couloirs du canyon) ;
   dbgImpactMini('force',out) → une miniature tout de suite contre le flanc out (±1) ; dbgImpactMini('seuil',x) → into minimal (1,2) */
window.dbgImpactMini=function(k,a){
  if(k==='force'&&started&&mode==='drive'){IMPM.tC=-1e9;impMini(a<0?-1:1,.3,Math.abs(vA)*3.6*SPD,9);}
  if(k==='seuil'&&a!=null)IMPM.K.into=+a;
  return {chocs:IMPM.n,der:IMPM.der,etoiles:IMPM.E.map(function(e){return e.userData.on?+e.scale.x.toFixed(2):0;}),eclats:IMPM.L.filter(function(c){return c.on;}).length,
    eclatsVus:IMPM.L.filter(function(c){return c.on&&c.m.visible;}).length,seuil:IMPM.K.into,programmes:renderer.info.programs?renderer.info.programs.length:null,
    couloirs:CY.on?{etroits:CY.cou,tunnel:CY.tun?[CY.tun[0]]:null,mine:CY.mineT?CY.mine:null}:null,s:+s.toFixed(1),lat:+lat.toFixed(2),demi:ROAD_HALF,mode:mode};};
function impTestIci(){ // l'obstacle de la carte en cours (le même ordre que la boucle de vol)
  if(PARIS.sol)return parisHeurt;if(FORET.root)return foretHeurt;if(GROTTE.root)return grotteHeurt;if(BANQ.root)return banqDans;
  if(JADE.col)return jadeHeurt;if(CY.on)return canyonHeurt;if(DN.on)return dunesHeurt;if(CITY.col)return villeHeurt;return null;}
/* console : dbgImpact(d,v,el) → la caisse lancée EN VOL à v m/s (60) sur l'obstacle le plus proche (cherché de 6 à 400 m, élévation el en
   radians, 0 = à l'horizontale ; 'sol' = droit dessous), d m avant (22) — la boucle fait le reste, exactement comme en jeu. */
window.dbgImpact=function(d,v,el){if(!started||gameOver||mode==='boom')return 'pas de course';
  const T=impTestIci();if(!T)return "pas d'obstacle dans cette carte";
  const o=carGroup.position.clone(),q=new THREE.Vector3(),dir=new THREE.Vector3();let best=1e9,bd=null;
  const els=el==='sol'?[-1.45]:el!=null?[+el]:[0,.06,-.06,.14,-.14,.25,-.25];
  for(const e9 of els)for(let i=0;i<96;i++){const a=i/96*6.2832;dir.set(Math.cos(a)*Math.cos(e9),Math.sin(e9),Math.sin(a)*Math.cos(e9));
    for(let r=6;r<Math.min(best,400);r+=1.2){q.copy(o).addScaledVector(dir,r);if(T(q)){best=r;bd=dir.clone();break;}}}
  if(!bd)return 'rien à moins de 400 m';
  if(paused)togglePause();
  startFall(10,1);const dd=Math.min(d||22,best-3);fallPos.copy(o).addScaledVector(bd,best-dd);fallVel.copy(bd).multiplyScalar((v||60)/SPD);
  carGroup.position.copy(fallPos);graceT=0;
  return {dist:+best.toFixed(1),dir:bd.toArray().map(function(x){return +x.toFixed(2);}),v:v||60};};
window.dbgImpactEtat=function(){const f=function(v){return v.toArray().map(function(x){return +x.toFixed(2);});};
  return {on:IMP.on,coup:+IMP.coup.toFixed(3),age:+IMP.age.toFixed(2),cause:mortCause,mou:IMP.mou,v:+IMP.v.toFixed(1),R:+IMP.R.toFixed(2),axe:IMP.ax,
    contact:f(IMP.c),paroi:f(IMP.s),normale:f(IMP.n),cam:+camera.position.distanceTo(IMP.s).toFixed(1),test:IMP.test&&IMP.test.name,
    cratere:{vis:IMP_CRAT.visible,op:+IMP_CRAT.material.uniforms.uOp.value.toFixed(2),ecran:f(IMP.q.copy(IMP.s).project(camera))},
    programmes:renderer.info.programs?renderer.info.programs.length:null,filtre:renderer.domElement.style.filter};};
window.dbgImpactNu=function(on){ // banc : la paroi SEULE (volutes, dards, fumée, feu cachés) — pour juger le cratère
  for(const o of [PAN_VOL.mesh,PAN_DARD.mesh,smokePool.mesh,boomPool.mesh,boomRed.mesh,boomYel.mesh,flames.mesh,dust.mesh])if(o&&o.material)o.material.visible=!on;return !!on;};
/* L'ONDE AU SOL (2026-09-26) : un anneau À PLAT sur la route (ou sous la caisse en vol) qui file jusqu'à ~40 m en 0,75 s. Les tores
   face caméra disent « choc » ; celui-ci donne l'ÉCHELLE — il court sur le bitume et passe sous l'objectif. Un disque texturé créé au
   chargement et CHAUFFÉ au menu (visible, opacité 0, rangé dès sa première image dessinée) : son programme ne compile jamais sur l'explosion. */
const boomOndeTex=(function(){const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  const g=x.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.8,'rgba(255,255,255,0)');g.addColorStop(.9,'rgba(255,255,255,.3)'); // (vague 2) un TRAIT :
  g.addColorStop(.96,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');                                          // la bande pleine de .6 à .94 faisait une NAPPE beige au sol
  x.fillStyle=g;x.fillRect(0,0,N,N);return new THREE.CanvasTexture(cv);})();
const boomOnde=new THREE.Mesh(new THREE.CircleGeometry(1,56),new THREE.MeshBasicMaterial({map:boomOndeTex,color:0xffc27a,transparent:true,opacity:0,
  blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
boomOnde.frustumCulled=false;boomOnde.scale.setScalar(1e-3);boomOnde.renderOrder=3;boomOnde.userData={t:-1};scene.add(boomOnde);
boomOnde.onAfterRender=function(){if(this.userData.t<0){this.visible=false;this.onAfterRender=function(){};}}; // CHAUFFE : dessinée une fois (invisible), puis rangée — le programme existe avant la première mort
const bOndeU=new THREE.Vector3(),bOndeZ=new THREE.Vector3(0,0,1);
function boomOndePart(pos){ // posée à plat sous l'explosion, dans le repère de la caisse (marche sous la dalle et en vol)
  bOndeU.set(0,1,0).applyQuaternion(carGroup.quaternion);
  boomOnde.position.copy(pos).addScaledVector(bOndeU,.25);boomOnde.quaternion.setFromUnitVectors(bOndeZ,bOndeU);
  boomOnde.userData.t=0;boomOnde.userData.R=40;boomOnde.visible=true; // R : son rayon final (L'IMPACT la pose SUR la paroi, plus courte)
}
/* LES ONDES FACE CAMÉRA (vague 2) : créées UNE fois, chauffées comme l'onde au sol. Trois TRAITS (le liseré de la texture de l'onde) :
   blanc-or, FEU, rouge, décalées de 0,12 s — la cadence des anciens tores, sans leurs 2 m d'aplat opaque. Le CŒUR de lumière (sphère
   additive) est parti : même bridée à 0,11 s, elle se lisait comme un DISQUE blanc plat — le cœur, ce sont désormais les premières volutes,
   blanches puis or, et le flash. */
const BOOM_ONDES=(function(){const geo=new THREE.CircleGeometry(1,48);
  return [[0xfff3b0,30,0,.85],[0xff7a24,20,.12,.7],[0xff3b2a,13,.26,.55]].map(function(q){
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:boomOndeTex,color:q[0],transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.frustumCulled=false;m.renderOrder=4;m.userData={t:-1,sp:q[1],dl:q[2],op:q[3]};scene.add(m);
    m.onAfterRender=function(){this.userData.chaud=true;if(this.userData.t<0)this.visible=false;delete this.onAfterRender;};
    return m;});})();
function spawnBoomArt(pos,power,mat,mini,iv,nW){
  // (2026-10-15) `mat` = la teinte (BOOM_MAT : fumée, dards) ; `mini` = un plot, une porte, une réplique du cratère — la même boule en petit,
  // posée sur les cases LIBRES (la mort, elle, reprend tout) ; `iv` = l'élan hérité (la caisse file à 40 m/s : née immobile, la boule restait
  // derrière avant même d'éclore) — il se perd vite (`dr`), la boule décroche de la caisse sur ~0,4 s
  // `nW` (L'IMPACT) = la normale de la paroi percutée : la boule S'ÉCRASE contre elle — couronne étalée dans le plan du mur (un champignon
  // couché), un peu décollée, qui FUIT le long de la paroi puis reprend sa montée ; les dards jaillissent du mur, jamais dedans. `pos` est
  // alors déjà devant la paroi (IMP.s) : pas de recul vers la caméra.
  mat=mat||BOOM_MAT.feu;
  const ivx=iv?iv.x*.9:0,ivy=iv?iv.y*.9:0,ivz=iv?iv.z*.9:0,dr=iv?1.8:nW?1.3:0;
  // le FOYER DES VOLUTES, reculé dans l'axe du regard (à plat) : la caméra de poursuite est collée à la caisse
  bvA.subVectors(pos,camera.position);bvA.y*=.3;const dl=bvA.length();if(dl>1e-3)bvA.multiplyScalar(1/dl);else bvA.set(0,0,1);
  const rc=nW?0:mini?.6:2.4,cx=pos.x+bvA.x*rc,cy=pos.y+bvA.y*rc+(nW?0:mini?.3:.4),cz=pos.z+bvA.z*rc;
  const T1=IMP.t1,T2=IMP.t2;
  // VOLUTES : trois au cœur, une couronne autour, chacune avec son retard (l'explosion se DÉPLOIE)
  const n=Math.min(VOLU_N,Math.round(18*power));
  for(let i=0,c=0;i<VOLU_N&&c<n;i++){
    const p=VOLU[i];if(mini&&p.on)continue; // une miniature ne vole JAMAIS la case d'une boule vivante
    const core=c<3,a=Math.random()*6.2832,el=(Math.random()-.3)*1.3,rr=core?Math.random()*.5:(.9+Math.random()*1.5)*power;c++;
    if(nW){const ca=Math.cos(a),sa0=Math.sin(a),sa=sa0>0?sa0*1.25:sa0*.55,hn=(core?.15:.3+Math.random()*1.1)*power,fu=core?.5:1.8+Math.random()*2.2; // le feu GRIMPE le long du mur (vers le bas, il s'écrase vite)
      p.x=cx+(T1.x*ca*1.3+T2.x*sa)*rr+nW.x*hn;p.y=cy+(T1.y*ca*1.3+T2.y*sa)*rr+nW.y*hn+(core?0:.35*power);p.z=cz+(T1.z*ca*1.3+T2.z*sa)*rr+nW.z*hn;
      const ex=T1.x*ca+T2.x*sa,ey=T1.y*ca+T2.y*sa,ez=T1.z*ca+T2.z*sa,kn=.7+Math.random()*1.1; // la fuite le long du mur + un souffle qui s'en décolle
      p.vy=(1.1+Math.random()*2.3)*(mini?.6:1)+ey*fu+nW.y*kn;p.dx=ex*fu+nW.x*kn;p.dz=ez*fu+nW.z*kn;}
    else{let ox=Math.cos(a)*Math.cos(el)*rr,oz=Math.sin(a)*Math.cos(el)*rr;const k9=ox*bvA.x+oz*bvA.z;
      if(k9<0){ox-=2*k9*bvA.x;oz-=2*k9*bvA.z;} // la couronne s'ouvre sur les côtés et vers le fond, jamais vers l'objectif
      p.x=cx+ox;p.y=cy+Math.sin(el)*rr*.6+(core?0:.7*power);p.z=cz+oz;
      p.vy=(1.1+Math.random()*2.3)*(mini?.6:1)+ivy;p.dx=(Math.random()-.5)*2+ivx;p.dz=(Math.random()-.5)*2+ivz;}
    p.t=-(core?0:Math.random()*(mini?.07:.14));p.life=mini?.55+Math.random()*.3:1.05+Math.random()*.7;
    p.r0=(core?2:1.3+Math.random()*.6)*power;p.r1=(core?3.8:2.4+Math.random()*1)*power; // ~4-5 m de boule vue à ~11 m : ≈ 10 % de l'écran
    p.dr=dr;p.f=i&3;p.on=true;
    p.cu=core?-.04:(Math.random()-.5)*.18; // chaque lobe a SA chaleur : certains brûlent encore quand d'autres fument déjà
    p.fu=mat.fuC; // …et retombe dans la fumée de SA teinte
  }
  // DARDS : des traits qui jaillissent droit et s'éteignent vite — la VIOLENCE du dessin, sans couvrir l'image
  const ns=Math.min(DARD_N,Math.round(12*power));
  for(let i=0,c=0;i<DARD_N&&c<ns;i++){
    const s=DARD[i];if(mini&&s.on)continue;
    const a=c/ns*6.2832+Math.random()*.4,el=(Math.random()-.3)*1.1;c++;
    s.dx=Math.cos(a)*Math.cos(el);s.dy=Math.sin(el)+.25;s.dz=Math.sin(a)*Math.cos(el);
    if(nW){const k9=s.dx*nW.x+s.dy*nW.y+s.dz*nW.z;if(k9<0){s.dx-=2*k9*nW.x;s.dy-=2*k9*nW.y;s.dz-=2*k9*nW.z;} // (L'IMPACT) hors du mur
      s.dx+=nW.x*.35;s.dy+=nW.y*.35;s.dz+=nW.z*.35;}
    const l9=Math.hypot(s.dx,s.dy,s.dz)||1;s.dx/=l9;s.dy/=l9;s.dz/=l9;
    s.rot=-a+Math.PI/2;s.t=0;s.life=(.26+Math.random()*.2)*(mini?.8:1);s.len=(2.6+Math.random()*3)*power;s.wid=(.34+Math.random()*.34)*Math.max(power,.5);s.on=true;
    s.ox=pos.x;s.oy=pos.y;s.oz=pos.z;s.vx=ivx;s.vy=ivy;s.vz=ivz;s.dr=dr;s.da=mat.da; // chaque dard part de SON foyer (avant : tous de boomPos)
  }
  if(!mini)for(const m of BOOM_ONDES){m.userData.t=0;m.position.copy(pos);}
}
function updateBoomArt(dt){
  if(paused)dt=0; // (vague 2) la pause fige la boule (elle continuait de gonfler derrière le panneau)
  const cp=camera.position,sm=THREE.MathUtils.smoothstep;
  // VOLUTES : vivantes, triées de loin en près (tri par insertion sur ≤ 26 : rien n'est alloué)
  let n=0;
  for(let i=0;i<VOLU_N;i++){const p=VOLU[i];if(!p.on)continue;
    p.t+=dt;if(p.t<0)continue;
    if(p.t>=p.life){p.on=false;continue;}
    if(p.dr){const k9=Math.exp(-p.dr*dt);p.dx*=k9;p.dz*=k9;p.vy=p.vy*k9+.8*(1-k9);} // (2026-10-15) l'élan hérité se perd, la volute reprend sa montée
    p.y+=p.vy*dt;p.x+=p.dx*dt;p.z+=p.dz*dt;
    const ex=p.x-cp.x,ey=p.y-cp.y,ez=p.z-cp.z;p.d2=ex*ex+ey*ey+ez*ez;
    let j=n++;while(j>0&&VOLU_ORD[j-1].d2<p.d2){VOLU_ORD[j]=VOLU_ORD[j-1];j--;}VOLU_ORD[j]=p;
  }
  {const P=PAN_VOL.P,S=PAN_VOL.S,C=PAN_VOL.C,F=PAN_VOL.F;
   // la poursuite RECULE pendant l'explosion (6 → 20 m en 0,4 s) : les lobes grossissent avec elle (×1,6 au plus) — la boule garde
   // sa lecture à l'écran au lieu de fondre en confetti, sans jamais couvrir plus qu'au départ
   const kD=n?Math.min(1.6,Math.max(1,Math.sqrt(VOLU_ORD[n>>1].d2)/9)):1;
   for(let k=0;k<n;k++){const p=VOLU_ORD[k],u=p.t/p.life,uc=Math.max(0,u+p.cu);
     const e=1-Math.pow(1-Math.min(1,u*4),3),r=(p.r0+(p.r1-p.r0)*e)*kD; // gonflement VIF (pleine taille à ~0,35 s) qui s'assagit
     bpTmpC.copy(BOOM_HOT).lerp(BOOM_OR,Math.min(1,uc*12)).lerp(BOOM_MID,Math.min(1,Math.max(0,(uc-.08)*7)))   // ça REFROIDIT…
       .lerp(BOOM_COLD,Math.min(1,Math.max(0,(uc-.28)*2.6))).lerp(p.fu||BOOM_SMOKE,Math.min(1,Math.max(0,(uc-.45)*2.8))); // (2026-10-15) la fumée de SA matière // …et retombe en CHARBON
     const a=(u<.05?u/.05:1)*(1-sm(u,.62,1))*sm(Math.sqrt(p.d2),2.5,6); // garde-objectif : 2,5 → 6 m (à 3,5-8 m la boule, née à ~6,5 m de la poursuite, restait à 20 %)
     P[k*3]=p.x;P[k*3+1]=p.y;P[k*3+2]=p.z;
     S[k*4]=r;S[k*4+1]=r;S[k*4+2]=0;S[k*4+3]=0;
     C[k*4]=bpTmpC.r;C[k*4+1]=bpTmpC.g;C[k*4+2]=bpTmpC.b;C[k*4+3]=a;
     F[k*2]=p.f;F[k*2+1]=Math.max(0,1-uc/.3);}   // le cœur brûle le premier tiers de la vie
   PAN_VOL.cnt=n;panPousse(PAN_VOL);}
  // DARDS (additifs : pas de tri)
  {const P=PAN_DARD.P,S=PAN_DARD.S,C=PAN_DARD.C,F=PAN_DARD.F;let m=0;
   for(let i=0;i<DARD_N;i++){const s=DARD[i];if(!s.on)continue;
     s.t+=dt;const u=s.t/s.life;if(u>=1){s.on=false;continue;}
     if(s.dr){const k9=Math.exp(-s.dr*dt);s.vx*=k9;s.vy*=k9;s.vz*=k9;s.ox+=s.vx*dt;s.oy+=s.vy*dt;s.oz+=s.vz*dt;} // (2026-10-15) le foyer d'une miniature file avec la caisse, puis décroche
     const ex9=s.ox-cp.x,ey9=s.oy-cp.y,ez9=s.oz-cp.z,near=sm(Math.sqrt(ex9*ex9+ey9*ey9+ez9*ez9),2,5),da=s.da||BOOM_MAT.feu.da;
     const len=s.len*(1-Math.pow(1-u,2.2));
     P[m*3]=s.ox+s.dx*len*.16;P[m*3+1]=s.oy+s.dy*len*.16;P[m*3+2]=s.oz+s.dz*len*.16;
     S[m*4]=s.wid*(1-u*.45);S[m*4+1]=len;S[m*4+2]=s.rot;S[m*4+3]=1;
     C[m*4]=da[0];C[m*4+1]=da[1];C[m*4+2]=da[2];C[m*4+3]=.95*Math.max(0,1-u*1.15)*near;
     F[m*2]=0;F[m*2+1]=0;m++;}
   PAN_DARD.cnt=m;panPousse(PAN_DARD);}
  // LES ONDES face caméra : des traits qui filent
  for(let i=0;i<BOOM_ONDES.length;i++){const m=BOOM_ONDES[i],o=m.userData;if(o.t<0)continue;
    o.t+=dt;const u=(o.t-o.dl)/.32;
    if(u>=1){o.t=-1;m.visible=false;continue;}
    if(u<0){if(m.visible)m.visible=false;continue;}
    m.visible=true;m.lookAt(cp);m.scale.setScalar(1+o.sp*(1-(1-u)*(1-u)));m.material.opacity=o.op*(1-u)*(1-u);}
  const od=boomOnde.userData; // L'ONDE AU SOL
  if(od.t>=0){od.t+=dt;const u=od.t/.75;
    if(u>=1){od.t=-1;boomOnde.visible=false;}
    else{const R=1.5+(1-Math.pow(1-u,2.4))*(od.R||40);boomOnde.scale.setScalar(R);
      // (vague 2) quand l'anneau passe SOUS l'objectif, la perspective étale son liseré en NAPPE beige sur le bas de l'écran : il s'y efface
      bvA.subVectors(cp,boomOnde.position);const h9=bvA.dot(bOndeU),dh=Math.sqrt(Math.max(0,bvA.lengthSq()-h9*h9));
      boomOnde.material.opacity=Math.pow(1-u,1.4)*.85*sm(Math.abs(R-dh),.6,5);}}
}
function clearBoomArt(){ // (vague 2) rien n'est libéré : tout est RANGÉ (les panneaux, le cœur et les ondes servent à la mort suivante)
  for(let i=0;i<VOLU_N;i++)VOLU[i].on=false;for(let i=0;i<DARD_N;i++)DARD[i].on=false;
  PAN_VOL.cnt=0;panPousse(PAN_VOL);PAN_DARD.cnt=0;panPousse(PAN_DARD);
  for(const m of BOOM_ONDES){m.userData.t=-1;if(m.userData.chaud)m.visible=false;}
}
const debris=[];
let boomT=-1,boomLight=null;
const boomPos=new THREE.Vector3(),bmCam=new THREE.Vector3(),bmCamD=new THREE.Vector3();
