/* ==== PARIS AU SOL (2026-09-28, Léo : « le niveau Paris doit être un niveau à TERRE, avec un ciel travaillé ; premium, très différent
   de la ville futuriste ; le Paris que tous les Parisiens connaissent ; un rendu affiné ; trois quartiers distincts en un niveau ») ====
   Fini la route suspendue au-dessus des toits : on ROULE dans Paris, entre les façades, de la Concorde au Sacré-Cœur.
   · LE PARCOURS (`genParis`, ~15 km dessinés à la main, zéro tirage) — une traversée, une HEURE du jour par quartier :
       1 LES CHAMPS-ÉLYSÉES, HEURE DORÉE — la Concorde ouverte (l'obélisque), 1,9 km d'avenue ORIENTÉE PILE vers le soleil
         couchant (SUN_DIR est à 5,9° : il se couche dans l'axe et se cadre dans l'Arc en approche), l'Étoile : 240° autour de
         l'ARC DE TRIOMPHE, puis l'avenue d'Iéna qui descend vers la Seine.
       2 LA SEINE, HEURE BLEUE — le quai (le fleuve à droite, parapet, bouquinistes), la Tour dorée de l'autre côté, les jardins
         du Trocadéro, le pont d'IÉNA… et la route passe SOUS LA TOUR EIFFEL, entre ses quatre piliers (56 m de route, 8 m de marge),
         le Champ-de-Mars, l'esplanade des Invalides (le dôme d'or) et le pont ALEXANDRE-III (pylônes, Renommées d'or).
       3 MONTMARTRE, LA NUIT — le boulevard de Clichy et le MOULIN-ROUGE (les ailes tournent), la BUTTE en lacets (+92 m),
         petites maisons pastel à volets, cafés à stores, la bruine sur les pavés, et le SACRÉ-CŒUR illuminé au sommet.
     Deux tronçons ne s'approchent jamais à moins de 250 m (banc du 28/09) : aucune façade n'en chevauche une autre rue.
   · LA LUMIÈRE (`PSU.uT` : 0 or · 1 bleue · 2 nuit, fondue sur la distance) : or chaud / ombre bleue, puis orange-sarcelle, puis or
     sur bleu profond — complémentaires. Les façades s'éclairent dans LEUR shader (soleil rasant qui dore les étages hauts, réverbères
     qui lèchent le bas, fenêtres qui s'allument avec l'heure) ; les biomes `parisOr/parisBleu/parisNuit` tiennent le reste.
   · LE JEU : les façades sont des MURS (on frotte : étincelles, vitesse perdue ; de face à pleine vitesse, on s'encastre) ; en vol,
     retomber hors de la rue sous les toits = la façade, dans le fleuve = « À LA SEINE ! ». Ni trous, ni tremplins, ni bancs de nuages.
   Hooks : `dbgParis()` (comptes, zones, heure), `dbgParisVue(k)` (photo d'un monument), `dbgParisPhoto(k,d,h)` (un immeuble). */
const PARIS={meshes:[],t:0,n:null,Q:null,Z:null,sol:false,scint:null,phare:null,texT:null,texF:null,tourPos:null,qBio:-1,qAnn:-1,
  grille:null,HB:120,ailes:null,drapeau:null,bateaux:[],matsNuit:[],mFlaque:null,mHalo:null,murT:0,murAnn:0};
const PSU={uT:{value:0},uTime:{value:0},uSun:{value:SUN_DIR},uFen:{value:new THREE.Color(0xffc672)}}; // les uniforms PARTAGÉS de Paris
const PARIS_SW=7; // le trottoir (m) : la ligne des façades est à ROAD_HALF + 7
function parisColline(x,z){const Q=PARIS.Q;if(!Q||!Q.sc)return 0;const d=Math.hypot(x-Q.sc.x,z-Q.sc.z);return 92*(1-THREE.MathUtils.smoothstep(d,170,950));} // la BUTTE Montmartre
function genParis(){
  const ctrl=[];CAMPM.length=0; // aucun trou : on roule sur le PAVÉ de Paris
  let P=new THREE.Vector3(0,0,0),phi=0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi)),push=()=>ctrl.push(P.clone());
  const droite=(l,nn)=>{nn=nn||Math.max(2,Math.round(l/110));for(let k=0;k<nn;k++){P.addScaledVector(dir(),l/nn);push();}};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/9)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;P.addScaledVector(dir(),ch);phi+=st/2;push();}};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi};};
  const cote=(v,d)=>new THREE.Vector3(Math.cos(phi),0,-Math.sin(phi)).multiplyScalar(d).add(v); // B = haut × T : le côté « lat > 0 »
  push();ici('depart');
  // ---- 1. LES CHAMPS-ÉLYSÉES — HEURE DORÉE ----
  droite(320,3);ici('champs0');                        // la CONCORDE, grande ouverte
  droite(1900,17);ici('champs1');                      // l'AVENUE, pile vers le soleil (voir la rotation, en fin de tracé)
  // L'ENTRÉE DE L'ÉTOILE : l'avenue file TOUT DROIT sur l'Arc (essai du 28/09 : un S qui décalait la route le cachait derrière les
  // façades), puis une courbe TANGENTE au rond-point — deux cercles tangents : d1 = √((R2+r1)²−r1²), angle = acos(r1/(R2+r1))
  const r1=150,R2=170,d1=Math.sqrt((R2+r1)*(R2+r1)-r1*r1),th=Math.acos(r1/(R2+r1))*57.29578;
  droite(951-d1,6);ici('etoile0');
  arc(th,r1);Q.arc={p:cote(P,-R2)};ici('ring0');      // on entre sur l'ÉTOILE : l'Arc au centre, côté « lat < 0 »
  arc(-(th+150),R2);ici('etoile1');
  arc(90,160);droite(700);arc(-30,400);ici('quai0');  // l'avenue d'Iéna, qui descend vers la Seine
  // ---- 2. LA SEINE — HEURE BLEUE ----
  droite(1200,11);ici('quai1');                       // le QUAI : le fleuve côté « lat > 0 »
  const th2=Math.acos(1-192/640)*57.29578;arc(-th2,320);arc(th2,320);ici('troca'); // les jardins du Trocadéro
  arc(90,200);ici('iena0');
  {const n=dir();Q.seine={b:P.clone().addScaledVector(n,120),n:n.clone(),r:new THREE.Vector3(-n.z,0,n.x)};} // le fleuve : un axe, sa normale (vers la Tour)
  droite(240,3);ici('iena1');                          // le pont d'IÉNA
  Q.tour={p:P.clone().addScaledVector(dir(),170),phi:phi};
  droite(820,8);ici('mars1');                          // SOUS la Tour, puis le Champ-de-Mars
  arc(-90,260);droite(900,8);arc(-90,260);ici('invalides');
  {const d0=P.clone().sub(Q.seine.b).dot(Q.seine.n);droite(Math.max(200,d0-120),6);} // l'esplanade des Invalides, droit sur le fleuve
  ici('alex0');droite(240,3);ici('alex1');            // le pont ALEXANDRE-III
  droite(300,3);ici('q3');
  // ---- 3. MONTMARTRE — LA NUIT ----
  arc(-40,420);ici('clichy0');droite(700,7);ici('clichy1'); // le boulevard de Clichy, le Moulin-Rouge
  arc(60,300);droite(320);arc(-150,200);droite(260);arc(140,210);droite(220);arc(-70,260);ici('parvis');droite(300,3);ici('fin');
  { // le SACRÉ-CŒUR : au sommet, À CÔTÉ du portail (derrière lui, la sphère le cachait) — du côté le plus dégagé, tourné vers la route
    let best=null;for(const sg of [-1,1]){const c=cote(P,sg*165).addScaledVector(dir(),200);let dm=1e9;for(let k=0;k<ctrl.length-4;k++)dm=Math.min(dm,Math.hypot(ctrl[k].x-c.x,ctrl[k].z-c.z));
      if(!best||dm>best.dm)best={c:c,dm:dm};}
    Q.sc={p:best.c,phi:Math.atan2(best.c.x-P.x,best.c.z-P.z)};}
  // LA ROTATION : l'avenue des Champs-Élysées file vers le soleil couchant (SUN_DIR est fixe dans le monde)
  const da=Math.atan2(SUN_DIR.x,SUN_DIR.z)-Q.champs0.phi,ca=Math.cos(da),sa=Math.sin(da);
  const tourne=v=>{const x=v.x,z=v.z;v.x=x*ca+z*sa;v.z=-x*sa+z*ca;return v;};
  for(const q of ctrl)tourne(q);
  for(const k in Q){const o=Q[k];if(o.p)tourne(o.p);if(o.phi!=null)o.phi+=da;}
  tourne(Q.seine.b);tourne(Q.seine.n);tourne(Q.seine.r);
  PARIS.Q=Q;Q.sc.x=Q.sc.p.x;Q.sc.z=Q.sc.p.z;
  for(const q of ctrl)q.y=parisColline(q.x,q.z);     // la BUTTE : seul relief de Paris
  Q.sc.p.y=parisColline(Q.sc.x,Q.sc.z);
  return ctrl;
}
function parisRepere(){ // les repères du tracé → leur abscisse s sur la piste réelle, puis les ZONES de chaque côté
  const Q=PARIS.Q;if(!Q)return;
  const sDe=v=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi/(NP-1)*L;};
  for(const k in Q){const o=Q[k];if(o.p&&k!=='arc'&&k!=='tour'&&k!=='sc')o.s=sDe(o.p);}
  const z=[],Z=(a,b,g,d,st)=>{if(b>a)z.push({s0:a,s1:b,g:g,d:d,st:st||0});}; // st : 0 haussmannien · 1 faubourg · 2 luxe
  Z(0,Q.champs0.s,'place','place');
  Z(Q.champs0.s,Q.champs0.s+820,'jardin','jardin');
  Z(Q.champs0.s+820,Q.ring0.s,'bati','bati',2);
  Z(Q.ring0.s,Q.etoile1.s,'ile','bati',2);
  Z(Q.etoile1.s,Q.quai0.s,'bati','bati');
  Z(Q.quai0.s,Q.quai1.s,'bati','quai');
  Z(Q.quai1.s,Q.iena0.s,'bati','jardin');
  Z(Q.iena0.s,Q.iena1.s,'pont','pont');
  Z(Q.iena1.s,Q.mars1.s,'jardin','jardin');
  Z(Q.mars1.s,Q.invalides.s,'bati','bati');
  Z(Q.invalides.s,Q.alex0.s,'jardin','jardin');
  Z(Q.alex0.s,Q.alex1.s,'pont','pont');
  Z(Q.alex1.s,Q.clichy1.s,'bati','bati');
  Z(Q.clichy1.s,L-170,'bati','bati',1);
  Z(L-170,L+1,'place','place');
  PARIS.Z=z;
  Q.t1a=Q.etoile1.s;Q.t1b=Q.quai0.s+200;Q.t2a=Q.alex1.s;Q.t2b=Q.clichy0.s+300; // l'HEURE : or → bleue sur l'avenue d'Iéna, bleue → nuit après le pont
}
function parisZone(s9){const Z=PARIS.Z;if(!Z)return null;for(let k=0;k<Z.length;k++)if(s9<Z[k].s1)return Z[k];return Z[Z.length-1];}
function parisCote(s9,sg){const z=parisZone(s9);return z?(sg<0?z.g:z.d):null;}
function parisScintMat(){return new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPx:{value:Math.min(2,renderer.getPixelRatio())}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float aR;uniform float uTime,uPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float ph=fract(aR*7.31+uTime*(.35+aR*.7));'+
      'vA=smoothstep(0.,.05,ph)*smoothstep(.2,.05,ph);gl_PointSize=uPx*(1.5+7.*vA)*min(3.,420./max(1.,-mv.z));gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c),a=(smoothstep(.5,0.,d)+smoothstep(.07,0.,abs(c.x))*smoothstep(.5,.0,abs(c.y))*.6+smoothstep(.07,0.,abs(c.y))*smoothstep(.5,.0,abs(c.x))*.6)*vA;gl_FragColor=vec4(vec3(1.,.97,.9)*a*1.7,a);}'});} // (2026-09-30) le SCINTILLEMENT de la tour — en fabrique : parisChauffe le compile au menu
function parisHaloMat(){return new THREE.ShaderMaterial({uniforms:{uI:{value:0},uPx:{value:Math.min(2,renderer.getPixelRatio())}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
     vertexShader:'uniform float uPx;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=uPx*min(90.,2600./max(1.,-mv.z));vF=smoothstep(900.,120.,-mv.z);gl_Position=projectionMatrix*mv;}',
     fragmentShader:'uniform float uI;varying float vF;void main(){float d=length(gl_PointCoord-.5)*2.;float a=(exp(-d*d*6.)*.9+exp(-d*d*30.)*.8)*uI*vF;gl_FragColor=vec4(vec3(1.,.72,.42)*a,a);}'});} // (2026-09-30) les HALOS des réverbères — en fabrique, idem
/* (2026-09-30) LA CHAUFFE DE PARIS — au menu (chauffeDivers), une instance de CHAQUE matière que Paris dessinera, compilée hors écran puis
   retirée : les vraies reprennent le programme. MESURÉ avant : 16 programmes liés au 1er portail de Paris, en pleine course (tous les autres
   niveaux : 0). Les matières de chauffe ne sont JAMAIS libérées (libérer un matériau relâche son programme). ⚠ r128 garde le 1er programme
   d'un matériau : une matière PAR combinaison (maillage simple / instances / instances avec couleur), jamais partagée. */
function parisDrapeauMat(tx){ // LE DRAPEAU de l'Arc : il ondule (vertex shader) — une fabrique, pour que la chauffe compile le MÊME programme
  const fm=parisMatNuit(0xffffff,0x604838,.0,.25,.55,{map:tx,side:THREE.DoubleSide});
  fm.onBeforeCompile=function(sh){sh.uniforms.uTime=PSU.uTime;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\nfloat pend=(8.5-position.y)/17.;transformed.z+=sin(position.x*.5+uTime*2.1+position.y*.3)*.55*pend+sin(uTime*1.3+position.y*.2)*.35*pend;');};
  fm.customProgramCacheKey=function(){return 'parisDrapeau';};
  return fm;}
const PARIS_CHAUD=[];
function parisChauffe(){
  if(PARIS_CHAUD.length)return;
  const g=new THREE.Group(),box=new THREE.BoxGeometry(1,1,1),pl=new THREE.PlaneGeometry(1,1),M=new THREE.Matrix4(),c1=new THREE.Color(1,1,1);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0],3));
  const garde=m=>{PARIS_CHAUD.push(m);return m;};
  const im=(mat,col)=>{const m=new THREE.InstancedMesh(box,mat,1);m.setMatrixAt(0,M);if(col)m.setColorAt(0,c1);return m;};
  const trois=f=>{g.add(new THREE.Mesh(box,garde(f())),im(garde(f()),false),im(garde(f()),true));};
  for(const f of [parisFacade,parisZinc,parisFerMat,parisSolMat])trois(f);
  trois(function(){return parisEauMat(new THREE.Vector3(),new THREE.Vector3(0,0,1),new THREE.Vector3(1,0,0));});
  const tx=parisTex('dalles');
  for(const map of [null,tx])for(const side of [THREE.FrontSide,THREE.DoubleSide])trois(function(){return new THREE.MeshLambertMaterial({map:map,side:side});});
  trois(function(){return new THREE.MeshLambertMaterial({flatShading:true});});
  g.add(new THREE.Mesh(pl,garde(new THREE.MeshBasicMaterial({map:parisTexTreillis(),transparent:true,alphaTest:.4,side:THREE.DoubleSide,fog:true}))));
  g.add(new THREE.Points(pg,garde(parisScintMat())),new THREE.Points(pg,garde(parisHaloMat())));
  {const tx9=parisTex('rond');g.add(new THREE.Mesh(pl,garde(parisDrapeauMat(tx9))),new THREE.Mesh(box,garde(new THREE.MeshLambertMaterial({map:tx9,emissiveMap:tx9,emissive:0x902020}))));PARIS.matsNuit=[];} // le drapeau (programme à lui) et l'enseigne lumineuse (texture ET émissive)
  g.traverse(function(o){o.frustumCulled=false;});
  g.position.copy(camera.position).add(new THREE.Vector3(0,0,-9).applyQuaternion(camera.quaternion));scene.add(g);g.updateMatrixWorld(true);
  try{renderer.compile(scene,camera);}catch(e){}
  scene.remove(g);box.dispose();pl.dispose();pg.dispose();
}
function parisTexTreillis(){ // le treillis de la tour : croisillons, montants, traverses — sur fond transparent (alphaTest)
  if(PARIS.texT)return PARIS.texT;
  const cv=document.createElement('canvas');cv.width=64;cv.height=128;const x=cv.getContext('2d');
  x.strokeStyle='#fff';x.lineCap='square';
  x.lineWidth=7;x.strokeRect(3.5,3.5,57,121);
  x.lineWidth=3.2;x.beginPath();x.moveTo(4,4);x.lineTo(60,64);x.moveTo(60,4);x.lineTo(4,64);x.moveTo(4,64);x.lineTo(60,124);x.moveTo(60,64);x.lineTo(4,124);x.stroke();
  x.lineWidth=4;x.beginPath();x.moveTo(4,64);x.lineTo(60,64);x.stroke();
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;PARIS.texT=t;return t;
}
function parisTexFaisceau(){ // le faisceau du phare : plein près de la lampe, qui s'éteint au loin
  if(PARIS.texF)return PARIS.texF;
  const cv=document.createElement('canvas');cv.width=4;cv.height=128;const x=cv.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)'); // (v=1 = le haut du canvas = la lampe)
  x.fillStyle=gr;x.fillRect(0,0,4,128);PARIS.texF=new THREE.CanvasTexture(cv);return PARIS.texF;
}
function parisPrisme(a0,h0,y0,a1,h1,y1,cel){ // un tronc de pyramide CARRÉ (4 faces, sans fond) entre deux sections : centre (x,z), demi-côté, altitude
  const P=[],U=[],I=[];let v=0;
  const C=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let f=0;f<4;f++){const c0=C[f],c1=C[(f+1)%4];
    const pa=[a0[0]+c0[0]*h0,y0,a0[1]+c0[1]*h0],pb=[a0[0]+c1[0]*h0,y0,a0[1]+c1[1]*h0],pc=[a1[0]+c1[0]*h1,y1,a1[1]+c1[1]*h1],pd=[a1[0]+c0[0]*h1,y1,a1[1]+c0[1]*h1];
    const w=2*Math.max(h0,h1)/cel,hh=Math.hypot(y1-y0,h0-h1)/(cel*2);
    P.push(...pa,...pb,...pc,...pd);U.push(0,0,w,0,w*h1/h0,hh,0,hh);I.push(v,v+1,v+2,v,v+2,v+3);v+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  g.setIndex(I);g.computeVertexNormals();return g;
}
function parisTour(cx,cy,cz,H,solide){ // LA DAME DE FER — proportions de la vraie (324 m), mise à l'échelle H · solide : posée au SOL (pas de pied dans la brume)
  const g=new THREE.Group();g.position.set(cx,cy,cz);scene.add(g);trackMeshes.push(g);PARIS.meshes.push(g);
  const cel=H*.022,tex=parisTexTreillis();
  const or=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.4,side:THREE.DoubleSide,fog:true});or.color.setRGB(1.25,.74,.26); // l'or de l'illumination (au-dessus de 1 : le halo la prend)
  const plein=new THREE.MeshBasicMaterial({color:0xb4631e,fog:true});
  // LE PIED DANS LA BRUME : sous ~25 % de sa hauteur la tour se fond dans la couleur du brouillard (on la voit souvent d'EN HAUT)
  const pied=function(m){m.onBeforeCompile=function(sh){sh.uniforms.uBase={value:cy};sh.uniforms.uFade={value:H*.26};
    sh.vertexShader='varying float vYw;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nvYw=(modelMatrix*vec4(transformed,1.)).y;');
    sh.fragmentShader='varying float vYw;uniform float uBase,uFade;\n'+sh.fragmentShader.replace('#include <fog_fragment>','if(smoothstep(0.,uFade,vYw-uBase)<fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))))discard;\n#include <fog_fragment>');};
    m.customProgramCacheKey=function(){return 'parisPied';};};
  if(!solide){pied(or);pied(plein);}
  const add=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);if(y!=null)m.position.y=y;g.add(m);trackMeshes.push(m);return m;};
  for(const sx of [-1,1])for(const sz of [-1,1])                                      // les QUATRE PILIERS, qui se penchent l'un vers l'autre
    add(parisPrisme([sx*.152*H,sz*.152*H],.042*H,0,[sx*.094*H,sz*.094*H],.024*H,.178*H,cel),or);
  add(new THREE.BoxGeometry(.25*H,.012*H,.25*H),plein,.184*H);                           // le 1er étage
  add(parisPrisme([0,0],.105*H,.19*H,[0,0],.064*H,.354*H,cel),or);                      // la taille de guêpe
  add(new THREE.BoxGeometry(.15*H,.01*H,.15*H),plein,.359*H);                            // le 2e étage
  add(parisPrisme([0,0],.058*H,.364*H,[0,0],.017*H,.85*H,cel),or);                     // la flèche
  add(new THREE.BoxGeometry(.05*H,.022*H,.05*H),plein,.861*H);                           // le sommet
  add(new THREE.CylinderGeometry(.0035*H,.006*H,.13*H,6),or,.937*H);                     // l'antenne
  const arc=new THREE.TorusGeometry(.105*H,.007*H,6,24,Math.PI);                          // les ARCHES entre les piliers
  for(let k=0;k<4;k++){const m=add(arc,or,0);m.rotation.y=k*Math.PI/2;m.position.set(Math.sin(k*Math.PI/2)*.152*H,0,Math.cos(k*Math.PI/2)*.152*H);m.scale.y=.85;}
  // LE SCINTILLEMENT : des éclats qui naissent sur le treillis (points au hasard sur les quatre piliers, la taille de guêpe et la flèche)
  const N=IS_MOBILE?520:900,pos=new Float32Array(N*3),rr=new Float32Array(N),pr=mulberry32(0x5C1117);
  const prof=[[0,.152,.042],[.178,.094,.024],[.19,0,.105],[.354,0,.064],[.364,0,.058],[.85,0,.017]];
  for(let i=0;i<N;i++){const t=pr()*.85;let x0,h0;
    if(t<.178){const k=t/.178,sx=pr()<.5?-1:1,sz=pr()<.5?-1:1;x0=[sx*(.152+(.094-.152)*k),sz*(.152+(.094-.152)*k)];h0=.042+(.024-.042)*k;}
    else if(t<.354){const k=(t-.19)/(.354-.19);x0=[0,0];h0=.105+(.064-.105)*Math.max(0,k);}
    else{const k=(t-.364)/(.85-.364);x0=[0,0];h0=.058+(.017-.058)*Math.max(0,k);}
    const f=(pr()*4)|0,a=pr()*2-1,px=f<2?(f?1:-1)*h0:a*h0,pz=f<2?a*h0:(f===2?1:-1)*h0;
    pos[i*3]=(x0[0]+px)*H;pos[i*3+1]=t*H;pos[i*3+2]=(x0[1]+pz)*H;rr[i]=pr();}
  const gp=new THREE.BufferGeometry();gp.setAttribute('position',new THREE.BufferAttribute(pos,3));gp.setAttribute('aR',new THREE.BufferAttribute(rr,1));
  const ms=parisScintMat();
  const pts9=new THREE.Points(gp,ms);pts9.frustumCulled=false;g.add(pts9);trackMeshes.push(pts9);PARIS.scint=ms;
  // LE PHARE : deux faisceaux opposés qui tournent depuis le sommet (additifs, sans brouillard : on les voit de loin)
  const ph=new THREE.Group();ph.position.y=.86*H;g.add(ph);PARIS.phare=ph;
  const fg=new THREE.CylinderGeometry(1.5,H*.16,H*2.4,16,1,true);fg.translate(0,-H*1.2,0);fg.rotateZ(Math.PI/2);
  const fm=new THREE.MeshBasicMaterial({map:parisTexFaisceau(),color:0xfff0c8,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  for(const s of [0,Math.PI]){const b=new THREE.Mesh(fg,fm);b.rotation.y=s;b.rotation.z=-.08;ph.add(b);trackMeshes.push(b);}
  return g;
}
/* LES MATIÈRES DE PARIS — un immeuble = une instance, tout son décor PEINT dans le shader à la cote réelle, et ÉCLAIRÉ PAR L'HEURE :
   `lumiere(alb,nw,h)` = le ciel froid dans l'ombre + le soleil rasant qui dore les étages hauts (heure dorée), le ciel bleu et les
   réverbères qui lèchent le bas (heure bleue), l'or des lampadaires sur le bleu profond (nuit). Les fenêtres s'allument avec l'heure.
   aSty (par instance) : x = style (0 haussmannien · 1 faubourg de Montmartre · 2 luxe des Champs), y = teinte, z = hauteur de façade
   (corniche → trottoir), w = hasard. */
const PARIS_VS=['attribute vec4 aSty;varying vec3 vL,vN,vSc,vNw;varying vec4 vSty;varying float vD;','#include <fog_pars_vertex>','void main(){',
  '#ifdef USE_INSTANCING','mat4 im=instanceMatrix;','#else','mat4 im=mat4(1.);','#endif',
  'vSc=vec3(length(im[0].xyz),length(im[1].xyz),length(im[2].xyz));vL=position*vSc;vN=normal;vNw=normalize(mat3(im)*normal);vSty=aSty;',
  'vec4 mvPosition=modelViewMatrix*im*vec4(position,1.);vD=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const PARIS_FS0=['uniform vec3 uFen,uSun;uniform float uT,uTime;','#include <fog_pars_fragment>',
  'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'vec3 brume(){',
  '#ifdef USE_FOG','return fogColor;','#else','return vec3(0.);','#endif','}',
  'float nuitF(){return smoothstep(.55,1.6,uT);}',
  // LA LUMIÈRE DE L HEURE (h : hauteur au-dessus du trottoir)
  'vec3 lumiere(vec3 alb,vec3 nw,float h){',
  '  vec3 sh=normalize(vec3(uSun.x,0.,uSun.z));float sd=max(0.,dot(nw,sh)),gr=1.-abs(dot(nw,sh)),up=max(0.,nw.y);',
  '  float haut=smoothstep(4.,15.,h);',
  '  vec3 cO=alb*(vec3(.34,.38,.52)+vec3(1.30,.80,.46)*(sd*.95+gr*.2+up*.3)*(.3+.7*haut)+vec3(.10,.06,.03)*(1.-haut));',
  '  vec3 cB=alb*(vec3(.16,.19,.33)+up*vec3(.05,.06,.12)+vec3(.44,.28,.13)*exp(-max(h,0.)/5.5));',
  '  vec3 cN=alb*(vec3(.045,.05,.095)+vec3(.64,.39,.17)*exp(-max(h,0.)/5.)+vec3(.10,.07,.05)*exp(-max(h,0.)/14.));',
  '  return uT<1.?mix(cO,cB,uT):mix(cB,cN,uT-1.);}'].join('\n');
const PARIS_VFS='varying vec3 vL,vN,vSc,vNw;varying vec4 vSty;varying float vD;';
function parisU(){return Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uT:PSU.uT,uTime:PSU.uTime,uSun:PSU.uSun,uFen:PSU.uFen});} // les uniforms PARTAGÉS (mêmes objets)
function parisFacade(){
  return new THREE.ShaderMaterial({fog:true,uniforms:parisU(),vertexShader:PARIS_VS,
    fragmentShader:[PARIS_FS0,PARIS_VFS,
      'float fer(float u,float dT,float r,float b,float det){',
      '  float m=max(step(dT,r+.07),step(b-.06,dT)),br=step(abs(fract(u/.14)-.5),.11);',
      '  vec2 q=vec2((fract(u/.56)-.5)*.56,dT-(r+b)*.5);float an=step(abs(length(q)-.19),.028);',
      '  return mix(.42,max(m,max(br,an)),det);}',
      'void main(){vec3 n=normalize(vN),nw=normalize(vNw);vec3 col;',
      ' float Hf=vSty.z,dT=vSc.y*.5-vL.y,h=Hf-dT,sty=vSty.x,nf=nuitF();',
      ' if(n.y<-.5)discard;',
      ' if(n.y>.5)col=lumiere(vec3(.2,.2,.22),nw,30.);',                                                  // le toit-terrasse (sous la mansarde)
      ' else{bool fx=abs(n.x)>.5;float u=fx?vL.z:vL.x,W=fx?vSc.z:vSc.x;',
      '  float det=1.-smoothstep(45.,140.,vD),loin=smoothstep(280.,760.,vD);',
      '  vec3 alb,em=vec3(0.);',
      '  if(sty<.5||sty>1.5){',                                                                           // ---- HAUSSMANN (et le LUXE des Champs) ----
      '   float nb=max(1.,floor(W/3.4)),bw=W/nb,ub=(u+W*.5)/bw,bi=floor(ub),ax=abs((fract(ub)-.5)*bw);',
      '   vec3 pierre=vec3(.86,.79,.64)*(.94+.1*vSty.y);',                                                   // la pierre de taille, un rien plus chaude ou plus froide
      '   pierre*=1.-.08*det*smoothstep(.88,.97,fract(dT/.52));',                                             // les assises
      '   if(dT>14.1)pierre*=1.-.26*det*smoothstep(.8,.93,fract(dT/.55));',                                  // le bossage du bas
      '   alb=pierre;float a=0.,b=0.,r=0.,fi=-1.;',
      '   if(dT<.9)alb=pierre*1.12;else if(dT<1.2)alb=pierre*.55;',                                         // la corniche et son ombre
      '   else if(dT<4.05){a=1.55;b=3.85;fi=5.;}',
      '   else if(dT<7.15){a=4.5;b=6.95;r=6.45;fi=4.;}',
      '   else if(dT<10.35){a=7.6;b=10.05;r=9.55;fi=3.;}',
      '   else if(dT<14.1){a=10.95;b=13.9;fi=2.;}',
      '   else if(dT<17.1){a=14.55;b=16.6;fi=1.;}',
      '   else if(h>0.)fi=0.;',
      '   else alb=pierre*.55;',                                                                              // le soubassement (les rues qui montent)
      '   float hl=h21(vec2(bi,fi)+vSty.w*37.),w2=h21(vec2(bi*1.3,fi*.7)+vSty.w);',
      '   if(fi>.5){',
      '    if(fi==2.&&dT>a-.6&&dT<a-.1&&ax<1.08)alb=pierre*1.14;',                                          // le fronton de l étage noble
      '    if(dT>a-.17&&dT<b+.02&&ax<.84)alb=pierre*1.07;',                                                  // le chambranle
      '    if(dT>a&&dT<b&&ax<.66){',
      '     float allume=step(hl,mix(.1,.58,nf));',                                                           // les fenêtres s allument avec l heure
      '     alb=mix(vec3(.10,.12,.18),vec3(.55,.42,.30),.35*(1.-nf))*(.6+.4*w2);',                             // la vitre renvoie le ciel
      '     em=allume*uFen*mix(vec3(1.),vec3(1.,.72,.52),w2)*(.35+.6*w2)*(.35+.65*nf);',
      '     float cr=max(step(ax,.035),step(abs(dT-a-(b-a)*.3),.035))*det;alb=mix(alb,pierre*.5,cr);em*=1.-cr;', // les croisillons
      '     if(r>0.&&dT>r){float fm=fer(u,dT,r,b,det);alb=mix(alb,vec3(.03),fm);em*=1.-fm;}}',                 // le garde-corps de la porte-fenêtre
      '    if((fi==2.||fi==5.)&&dT>b+.1&&dT<b+.55)alb*=.62;}',                                                // l ombre portée du balcon filant (le vrai est en géométrie)
      '   else if(fi>-.5){',                                                                                   // LES BOUTIQUES
      '    float sb=bw*.39,hb=h21(vec2(bi,9.)+vSty.w*37.),lx=step(1.5,sty);',
      '    if(ax<sb+.14&&h<4.9)alb=mix(vec3(.05,.07,.06),vec3(.09,.07,.04),lx);',                             // la devanture
      '    if(ax<sb&&h>.25&&h<3.65){',
      '     vec3 bq=lx>.5?vec3(1.,.84,.58):hb<.3?vec3(1.,.8,.52):hb<.5?uFen*.9:hb<.62?vec3(1.,.55,.3):hb<.72?vec3(.45,.95,.8):hb<.8?vec3(1.,.4,.3):hb<.86?vec3(.7,.8,1.):vec3(.04,.05,.07);',
      '     float vit=step(.06,abs(fract(ax/.9)-.5)*2.);',
      '     alb=vec3(.05,.05,.06);em=bq*(.3+.5*smoothstep(3.65,.25,h))*mix(.3,1.,vit)*(mix(.45,1.,nf)+lx*.5);}',
      '    if(ax<sb&&h>3.72&&h<4.3&&hb<.93){float ens=step(.55,h21(floor(vec2(u/.22,dT/.12))+bi))*det;alb=mix(vec3(.03),vec3(.9,.7,.3),ens);em=uFen*ens*(.3+.9*nf);}}', // l ENSEIGNE
      '  }else{',                                                                                               // ---- LE FAUBOURG DE MONTMARTRE ----
      '   float nb=max(1.,floor(W/3.)),bw=W/nb,ub=(u+W*.5)/bw,bi=floor(ub),ax=abs((fract(ub)-.5)*bw),k=floor(vSty.y*6.);',
      '   vec3 enduit=k<1.?vec3(.93,.86,.72):k<2.?vec3(.93,.72,.70):k<3.?vec3(.90,.75,.52):k<4.?vec3(.95,.90,.68):k<5.?vec3(.92,.91,.87):vec3(.78,.86,.74);',
      '   enduit*=.93+.1*h21(floor(vec2(u/2.3,h/1.7))+vSty.w);alb=enduit;',                                  // l enduit, jamais tout à fait uni
      '   if(h<0.)alb=enduit*.55;',
      '   else if(dT<.45)alb=enduit*.6;',                                                                       // la corniche simple
      '   else if(h>3.8){float fy=(h-3.8)/2.9,fli=floor(fy),ff=fract(fy),hl=h21(vec2(bi,fli)+vSty.w*37.),w2=h21(vec2(bi*1.7,fli)+vSty.w);',
      '    vec3 volet=hl<.33?vec3(.22,.38,.28):hl<.66?vec3(.33,.42,.52):vec3(.45,.24,.20);float lames=.8+.2*step(.5,fract(ff*14.));',
      '    if(ax<.55&&ff>.22&&ff<.82){',                                                                        // la fenêtre
      '     alb=vec3(.10,.11,.15);em=step(h21(vec2(bi,fli*3.1)+vSty.w),mix(.1,.55,nf))*uFen*(.4+.6*w2)*(.35+.65*nf);',
      '     if(ax<.04||abs(ff-.5)<.03){alb=enduit*.5;em*=.2;}',
      '     if(w2>.78){alb=volet*lames;em=vec3(0.);}}',                                                         // les volets fermés, à lames
      '    else if(ax<1.08&&ff>.22&&ff<.82&&w2<=.78)alb=volet*lames;}',                                         // …et ouverts
      '   else{float hb=h21(vec2(bi,7.)+vSty.w*29.);',                                                           // le rez-de-chaussée : cafés, épiceries
      '    alb=hb<.5?vec3(.35,.06,.05):hb<.8?vec3(.08,.18,.12):vec3(.12,.1,.08);',
      '    if(ax<bw*.38&&h>.3&&h<3.1){alb=vec3(.05);em=vec3(1.,.72,.42)*(.35+.65*nf)*(.8+.4*hb);}}',
      '   if(vSty.w>.72){float lr=h21(floor(vec2(u/.35,h/.35)))*.6+.4*h21(floor(vec2(u/1.4,h/1.4))+3.);if(lr>.55+.25*(h/Hf)){alb=mix(alb,vec3(.14,.24,.11),.9);em*=.1;}}', // le LIERRE
      '  }',
      '  col=lumiere(alb,nw,h)+em;',
      '  col=mix(col,lumiere(vec3(.7,.64,.54),nw,10.)+uFen*.08*nf,loin*.8);}',                                 // au loin, la moyenne (plus de moiré)
      ' gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n')});
}
function parisZinc(){ // LES TOITS DE ZINC : brisis à joints debout, gouttière, LUCARNES à fronton, œils-de-bœuf, terrasson — le zinc prend le couchant
  return new THREE.ShaderMaterial({fog:true,uniforms:parisU(),vertexShader:PARIS_VS,
    fragmentShader:[PARIS_FS0,PARIS_VFS,
      'void main(){vec3 n=normalize(vN),nw=normalize(vNw);float det=1.-smoothstep(40.,130.,vD),nf=nuitF();vec3 zc=vec3(.36,.40,.46),alb,em=vec3(0.);',
      ' if(n.y<-.8)discard;',
      ' if(n.y>.8)alb=zc*.62*(1.+.3*det*smoothstep(.9,1.,fract(vL.x/.6)));',
      ' else{bool fx=abs(n.x)>abs(n.z);float u=fx?vL.z:vL.x,W=(fx?vSc.z:vSc.x)*.93,v=vL.y+vSc.y*.5;',
      '  alb=zc*(.75+.35*v/vSc.y)*(1.+.3*det*smoothstep(.9,1.,fract(u/.55)));',
      '  if(v<.42)alb=vec3(.64,.59,.5);',
      '  float nb=max(1.,floor(W/3.4)),bw=W/nb,ub=(u+W*.5)/bw,bi=floor(ub),ax=abs((fract(ub)-.5)*bw);',
      '  if(vSty.x<.5||vSty.x>1.5){',                                                                         // la mansarde haussmannienne
      '   if(v>.9&&v<3.35&&ax<.78)alb=vec3(.8,.73,.6);',
      '   if(v>3.3&&v<3.95&&ax<.86*(1.-(v-3.3)/.65))alb=vec3(.82,.75,.62);',
      '   if(v>1.1&&v<3.12&&ax<.55){alb=vec3(.1,.11,.15);em=step(h21(vec2(bi,vSty.w*91.)),mix(.12,.55,nf))*uFen*(.35+.5*h21(vec2(bi,vSty.w*13.)))*(.35+.65*nf);',
      '    if(ax<.03||abs(v-2.)<.03){alb*=.4;em*=.3;}}',
      '   if(mod(bi,2.)<1.&&vSc.y>6.6){float o=length(vec2(ax,v-5.15));if(o<.5)alb=vec3(.8,.73,.6);if(o<.34){alb=vec3(.1,.11,.15);em=step(h21(vec2(bi,vSty.w*7.)),mix(.1,.5,nf))*uFen*.7*(.35+.65*nf);}}}',
      '  else if(mod(bi,3.)<1.&&v>.8&&v<2.3&&ax<.45){alb=vec3(.1,.11,.15);em=step(h21(vec2(bi,vSty.w*5.)),mix(.1,.5,nf))*uFen*.6*(.35+.65*nf);}', // les tabatières du faubourg
      ' }',
      ' vec3 col=lumiere(alb,nw,28.)+em;col=mix(col,lumiere(zc*.8,nw,28.),smoothstep(260.,700.,vD)*.8);',
      ' gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n')});
}
function parisFerMat(){ // LES BALCONS FILANTS en fer forgé : une boîte ajourée autour de l'immeuble (barreaux, volutes, lisses) — en trame au loin
  return new THREE.ShaderMaterial({fog:true,uniforms:parisU(),vertexShader:PARIS_VS,
    fragmentShader:[PARIS_FS0,PARIS_VFS,
      'void main(){vec3 n=normalize(vN);if(abs(n.y)>.5)discard;',
      ' bool fx=abs(n.x)>.5;float u=fx?vL.z:vL.x,y=vL.y+vSc.y*.5,det=1.-smoothstep(40.,170.,vD);',
      ' float m=max(step(.86,y),step(y,.07)),br=step(abs(fract(u/.13)-.5),.13);',
      ' vec2 q=vec2((fract(u/.52)-.5)*.52,y-.46);float an=step(abs(length(q)-.17),.03);',
      ' float a=max(m,mix(.42,max(br,an),det));',
      ' if(a<.5+.49*fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.25*(1.-det))discard;',
      ' vec3 col=lumiere(vec3(.045,.045,.05),normalize(vNw),10.);',
      ' gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n')});
}
function parisSolMat(){ // LE SOL de Paris (vu depuis la Butte, les places, les jardins) : le stabilisé beige — la nuit, les lumières de la ville
  return new THREE.ShaderMaterial({fog:true,uniforms:parisU(),
    vertexShader:['varying vec3 vW;','#include <fog_pars_vertex>','void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:[PARIS_FS0,'varying vec3 vW;',
      'void main(){vec2 p=vW.xz;float nf=nuitF(),g=h21(floor(p/1.8))*.4+h21(floor(p/7.))*.6;',
      ' vec3 col=lumiere(mix(vec3(.63,.58,.48),vec3(.52,.48,.40),g),vec3(0.,1.,0.),20.);',
      ' vec2 c=floor(p/22.),f=fract(p/22.)-.5;col+=uFen*step(.7,h21(c+3.7))*smoothstep(.2,.04,length(f))*nf*.9;', // la ville la nuit, vue d en haut
      ' gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n')});
}
function parisEauMat(b,n,r){ // LA SEINE : l'eau renvoie le ciel de l'heure, la RIVE d'en face (façades, fenêtres, réverbères étirés par les vaguelettes)
  const U=parisU();U.uB={value:new THREE.Vector2(b.x,b.z)};U.uN={value:n.clone()};U.uR={value:r.clone()};
  return new THREE.ShaderMaterial({fog:true,uniforms:U,
    vertexShader:['varying vec3 vW;','#include <fog_pars_vertex>','void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:[PARIS_FS0,'uniform vec2 uB;uniform vec3 uN,uR;varying vec3 vW;',
      'void main(){vec3 V=normalize(vW-cameraPosition);float t=uTime,nf=nuitF();',
      ' float al=dot(vW.xz-uB,uR.xz),u=dot(vW.xz-uB,uN.xz);',
      ' float wa=sin(al*.21+t*1.1+sin(u*.13+t*.4)*2.)+sin(al*.53-t*1.6+u*.21)*.6+sin(al*1.37+t*2.3-u*.4)*.25;',
      ' float wb=sin(u*.35-t*.9+sin(al*.1)*1.5)+sin(u*.9+al*.3+t*1.7)*.4;',
      ' vec3 nr=normalize(vec3(0.,1.,0.)+uR*wa*.035+uN*wb*.03),R=reflect(V,nr);',
      ' float ry=max(R.y,0.);',
      ' vec3 c0=mix(vec3(.95,.66,.48),vec3(.30,.46,.74),smoothstep(0.,.5,ry)),c1=mix(vec3(.42,.40,.62),vec3(.08,.13,.34),smoothstep(0.,.5,ry)),c2=mix(vec3(.16,.11,.14),vec3(.015,.02,.05),smoothstep(0.,.4,ry));',
      ' vec3 refl=uT<1.?mix(c0,c1,uT):mix(c1,c2,uT-1.);',
      ' float Ru=dot(R.xz,uN.xz);',
      ' if(abs(Ru)>.02){float sg=Ru>0.?1.:-1.,tt=(sg*126.-u)/Ru,hy=vW.y+R.y*tt,a2=al+dot(R.xz,uR.xz)*tt;',
      '  if(hy>0.&&hy<29.){vec3 fac=uT<1.?mix(vec3(.85,.62,.42),vec3(.22,.24,.36),uT):mix(vec3(.22,.24,.36),vec3(.06,.06,.1),uT-1.);', // la rive d en face
      '   vec2 cw=floor(vec2(a2/3.4,hy/3.3));fac+=uFen*step(h21(cw),mix(.12,.55,nf))*step(.3,fract(a2/3.4))*step(.25,fract(hy/3.3))*(.4+.6*nf)*.7;',
      '   if(hy>22.)fac=mix(fac,refl,.5);refl=fac;}',
      '  else if(hy>-8.&&hy<=0.)refl=uT<1.?mix(vec3(.55,.48,.38),vec3(.15,.16,.22),uT):mix(vec3(.15,.16,.22),vec3(.04,.04,.06),uT-1.);', // le mur du quai
      '  refl+=uFen*smoothstep(1.3,0.,abs(fract(a2/26.)-.5)*26.)*smoothstep(2.5,0.,abs(hy-5.))*(.25+2.6*nf);}',          // les RÉVERBÈRES, étirés par les vaguelettes
      ' float fres=.22+.78*pow(1.-max(0.,-V.y),4.);',
      ' vec3 deep=uT<1.?mix(vec3(.10,.16,.18),vec3(.03,.06,.11),uT):mix(vec3(.03,.06,.11),vec3(.01,.015,.03),uT-1.);',
      ' gl_FragColor=vec4(mix(deep,refl,fres),1.);','#include <fog_fragment>','}'].join('\n')});
}
function parisTex(k){ // les petites textures (une fois par session) : 'dalles' du trottoir, 'rond' (flaques, halos), 'zebre' du passage piéton
  const T=PARIS.tex||(PARIS.tex={});if(T[k])return T[k];
  const cv=document.createElement('canvas'),x=cv.getContext('2d'),r9=mulberry32(0xDA11E5);let t;
  if(k==='dalles'){cv.width=cv.height=128;x.fillStyle='#8f887c';x.fillRect(0,0,128,128);
    for(let j=0;j<4;j++)for(let i=0;i<2;i++){const g=168+Math.floor(r9()*34);x.fillStyle='rgb('+g+','+(g-5)+','+(g-15)+')';x.fillRect(i*64+(j%2)*32+1,j*32+1,62,30);x.fillRect(i*64+(j%2)*32-127,j*32+1,62,30);}
    t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;}
  else if(k==='rond'){cv.width=cv.height=64;const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);t=new THREE.CanvasTexture(cv);}
  else if(k==='zebre'){cv.width=16;cv.height=4;x.fillStyle='rgba(235,235,230,.92)';x.fillRect(0,0,8,4);t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;}
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());T[k]=t;return t;
}
