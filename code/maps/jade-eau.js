/* ===== (2026-10-14, passe SENSATIONS) L'EAU SE SENT — Sacha : « quand tu vas dans l'eau, que tu ressors, la flottaison… que toutes les
   petites sensations trouvent des petits détails pour les améliorer » =====
   La physique de la mer (Léo, 13/10) n'est PAS touchée : ces quatre détails ne lisent que JEAU / fallVel et n'écrivent que la CARROSSERIE
   (`carBody`, au repos pendant tout le vol), des gouttes de la réserve existante (`eauP`), des bulles, un bloop, un tic dans la main.
   · LE BOUCHON : à flot, la carrosserie ROULE et TANGUE sur ses flotteurs (deux ondes lentes par axe, ±4° / ±3°, ±7 cm de pilonnement) ;
     plus elle va vite (glisse, jet-ski), plus elle se cale — le bouchon, c'est à l'arrêt. Avant, à flot, elle était figée comme sur un socle.
   · LE BOUILLON : à flot et lente, le moteur brasse — un bouillon d'écume sort de la poupe, et l'eau CLAPOTE contre la coque (bloop rare).
   · LE CREUX DU PLONGEON : au point le plus bas d'un vrai plongeon, à l'instant où la mer la REPOUSSE, une gerbe de bulles et un tic léger
     dans la main — on sent le moment où ça repart vers le haut.
   · MOUILLÉE : sortie de l'eau, elle se POSE trempée — une gerbe aux roues au contact, puis les pneus crachent l'eau ~2,5 s (ça s'éteint). */
const SEAU={k:0,t:0,vy0:0,pose:false,clap:0,mouP:false};
function sensEau(dt){ // chaque image de VOL, après l'orientation de la caisse
  const flot=JEAU.dans&&JEAU.f>.04&&JEAU.f<1,hv=Math.hypot(fallVel.x,fallVel.z);
  SEAU.k+=((flot?1:0)-SEAU.k)*(1-Math.exp(-dt*(flot?2.2:5)));
  if(SEAU.k>.01){SEAU.t+=dt;const a=SEAU.k*(1-.6*Math.min(1,hv/120)),t=SEAU.t;
    carBody.rotation.set(a*(.045*Math.sin(t*3.1)+.02*Math.sin(t*5.3+1.3)),0,a*(.07*Math.sin(t*2.3+.7)+.025*Math.sin(t*4.1)));
    carBody.position.y=(VEQ.on?VEQ.ext:0)+a*.07*Math.sin(t*2.7+2.1);SEAU.pose=true;} // (2026-10-14, gameplay · accord) le pilonnement s'AJOUTE à la suspension pendante du vol de Léo (veqCorps : VEQ.ext, posée juste avant) — il l'écrasait : la carrosserie tombait de 11 cm d'un coup en touchant l'eau, et y remontait d'un coup en la quittant
  else if(SEAU.pose){carBody.rotation.set(0,0,0);carBody.position.y=VEQ.on?VEQ.ext:0;SEAU.pose=false;}
  if(flot&&hv<EAU.vB&&isFinite(JEAU.syF)){const sy=JEAU.syF,c=JEAU.cap;
    if(Math.random()<dt*(22+hv*.3)){eauPIm();eauP(fallPos.x-c.x*2+(Math.random()-.5)*1.5,sy+.15,fallPos.z-c.z*2+(Math.random()-.5)*1.5,-c.x*(2+Math.random()*3)+(Math.random()-.5)*2,1.4+Math.random()*2.4,-c.z*(2+Math.random()*3)+(Math.random()-.5)*2,.07+Math.random()*.1,.45+Math.random()*.4,sy,0);}
    SEAU.clap-=dt;if(SEAU.clap<=0){SEAU.clap=.7+Math.random()*1.1;eauBloop(.3);}}
  if(JEAU.dans&&JEAU.f>=1&&SEAU.vy0<0&&fallVel.y>=0&&JEAU.prof>EAU.plonge){jadeBullesJet(carGroup.position,14,2.2);eauBloop(.9);sensHap(12,1);}
  SEAU.vy0=JEAU.dans?fallVel.y:0;
  if(JEAU.dans)SEAU.mouP=false;}
function sensMouille(dt){ // chaque image de CONDUITE, dans les 2,6 s qui suivent une sortie de l'eau (JEAU.sorti, tenu par jadeSousTick)
  const k=Math.max(0,1-JEAU.sorti/2.6),v=Math.min(1,Math.abs(vA)/20),hw=CARS[level].w*.46,hl=CARS[level].l*.34;
  if(!SEAU.mouP){SEAU.mouP=true;for(let w=-1;w<=1;w+=2){DRIFT_V.set(w*hw,.1,-hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,5,7);DRIFT_V.set(w*hw,.1,hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,4,6);}}
  if(Math.random()<dt*(8+44*k)*v){DRIFT_V.set((Math.random()<.5?-1:1)*hw,.12,-hl);carGroup.localToWorld(DRIFT_V);sparkBurst(spray,DRIFT_V,1,2.5+3*k);}}
/* LES CUBES D'EAU — (2026-10-13, 4e passe, Léo : « la vague en bas doit glisser du milieu vers les côtés, comme une voiture qui va vite sous la
   pluie ; le splash d'entrée plus smooth ; fais le peintre maître du réalisme technique ») : des GOUTTES FINES (5-30 cm) de quatre teintes
   (blanc d'écume, aqua, turquoise clair, vert d'eau), qui héritent d'une part de la vitesse de la caisse ; la gerbe se lit comme une NAPPE. */
const EAUP={L:[],im:null,max:1800,cols:[new THREE.Color(0xf4fbff),new THREE.Color(0xd2f4f6),new THREE.Color(0xa8e6ea),new THREE.Color(0x86d2cf)]};
function eauPIm(){if(EAUP.im)return EAUP.im;const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x3a6670});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,EAUP.max);im.count=0;im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.setColorAt(0,EAUP.cols[0]);im.instanceColor.setUsage(THREE.DynamicDrawUsage); // la teinte par goutte : posée dès la création (le programme se compile une fois, au menu)
  scene.add(im);EAUP.im=im;return im;}
function eauP(x,y,z,vx,vy,vz,sz,l,y0,c){if(EAUP.L.length<EAUP.max)EAUP.L.push({x:x,y:y,z:z,vx:vx,vy:vy,vz:vz,sz:sz,t:0,l:l,y0:y0,c:c===undefined?(Math.random()*4)|0:c});}
function jadeCouronne(x,y,z,k,vel){eauPIm();eauRide(x,y,z,k);eauRide(x,y,z,k*.6); // L'ENTRÉE : la COURONNE lisse, la nappe qui glisse vers les côtés, les gouttes fines
  const fx=vel?vel.x*SPD*.3:0,fz=vel?vel.z*SPD*.3:0,R=1.2+1.6*k;
  eauCouronne(x,y,z,{r0:R,r1:4+10*k,h:2.2+7.5*k,fl:.55,d:.85+.6*k,fx:fx,fz:fz});
  for(let i=0,n=(70+150*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=R*(.85+Math.random()*.3),vo=3+Math.random()*9*k; // les gouttes lancées par le bord de la couronne
    eauP(x+c*r,y+.6+Math.random()*2*k,z+s*r,c*vo+fx,9+Math.random()*16*k,s*vo+fz,.05+Math.random()*.13,1.1+Math.random()*1.1,y,(Math.random()*3)|0);}
  for(let i=0,n=(50+90*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=Math.random()*R,vo=8+Math.random()*14*k; // LA NAPPE qui glisse du milieu vers les côtés, au ras de l'eau
    eauP(x+c*r,y+.2,z+s*r,c*vo+fx*1.4,1.5+Math.random()*4,s*vo+fz*1.4,.06+Math.random()*.16,.7+Math.random()*.7,y,1+((Math.random()*3)|0));}
  for(let i=0;i<24*k;i++){const a=Math.random()*6.2832,r=Math.random()*R*.4;eauP(x+Math.cos(a)*r,y+.4,z+Math.sin(a)*r,(Math.random()-.5)*2,18+Math.random()*26*k,(Math.random()-.5)*2,.08+Math.random()*.16,1+Math.random()*.6,y,0);}} // le jet du milieu
function jadeColonne(x,y,z,vyW,k){eauPIm();eauRide(x,y,z,k);eauRide(x,y,z,k*.55); // LA SORTIE : la COLONNE lisse qui suit la caisse, l'eau qui ruisselle et retombe sur les côtés
  if(k>.12)eauCouronne(x,y,z,{r0:1.1,r1:1.8+1.5*k,h:3+Math.min(11,vyW*.22),fl:-.3,d:.8+.5*k,fx:0,fz:0});
  for(let i=0,n=(60+120*k)|0;i<n;i++){const a=Math.random()*6.2832,r=Math.random()*1.5;eauP(x+Math.cos(a)*r,y+.3+Math.random()*2,z+Math.sin(a)*r,Math.cos(a)*(1+Math.random()*4),vyW*(.2+Math.random()*.55),Math.sin(a)*(1+Math.random()*4),.05+Math.random()*.15,1.1+Math.random()*1,y,(Math.random()*3)|0);}
  for(let i=0,n=(40+70*k)|0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=.8+Math.random()*1.4,vo=6+Math.random()*12*k;eauP(x+c*r,y+.2,z+s*r,c*vo,1+Math.random()*4,s*vo,.06+Math.random()*.15,.7+Math.random()*.6,y,1+((Math.random()*3)|0));}}
function jadeSillage(sy,hv,dt,d){eauPIm();const p=fallPos,vx=fallVel.x/hv,vz=fallVel.z/hv,px=-vz,pz=vx,vW=hv*SPD*AIR_RATE,k=Math.min(1,hv/170); // LE SILLAGE : deux nappes qui partent du dessous de la caisse vers les côtés (la voiture rapide sous la pluie)
  const kh=d<0?Math.max(0,1+d/2.5):1;if(kh<=0)return; // en glisse au-dessus de l'eau : moins d'eau soulevée
  const taux=(26+hv*1.25)*kh*dt;let n=Math.floor(taux);if(Math.random()<taux-n)n++;n=Math.min(n,22);
  for(const sd of [-1,1])for(let i=0;i<n;i++){const al=-2.2+Math.random()*3.4,lt=.5+Math.random()*.7,vo=(3+vW*.28)*(.55+Math.random()*.6);
    eauP(p.x+vx*al+px*sd*lt,sy+.1,p.z+vz*al+pz*sd*lt,px*sd*vo+vx*vW*(.15+Math.random()*.25),1.2+Math.random()*(2+5*k),pz*sd*vo+vz*vW*(.15+Math.random()*.25),.08+Math.random()*(.12+.14*k),.45+Math.random()*.55,sy,1+((Math.random()*3)|0));}
  if(k>.45){const m=Math.min(10,Math.round(n*.6));for(let i=0;i<m;i++){const al=-2.6-Math.random()*1.5; // la QUEUE DE COQ derrière, à grande vitesse
    eauP(p.x+vx*al+(Math.random()-.5)*.8,sy+.2,p.z+vz*al+(Math.random()-.5)*.8,vx*vW*.35+(Math.random()-.5)*2,5+Math.random()*12*k,vz*vW*.35+(Math.random()-.5)*2,.05+Math.random()*.14,.7+Math.random()*.6,sy,(Math.random()*2)|0);}}
  sillonPose(p.x,sy,p.z,vx,vz,hv,dt,kh);eauBrume(p,vx,vz,px,pz,vW,k,kh,sy,dt);} // le V d'écume derrière elle, la brume de la gerbe
function eauPTick(dt){const im=EAUP.im;if(!im)return;const L9=EAUP.L;if(!L9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;} // (2026-10-14) vide = caché : un dessin de zéro exemplaire coûte sa préparation à chaque image
  let n=0;const M9=JCH_M,dr=Math.exp(-.5*dt),cp=camera.position; // (2026-10-14, chasse aux bugs) ces déclarations étaient collées au commentaire ci-dessus, donc avalées : ReferenceError dès qu il y avait des gouttes (signalé par SON)
  for(let i=L9.length-1;i>=0;i--){const p=L9[i];if(!paused){p.t+=dt;p.vy-=24*dt;p.vx*=dr;p.vz*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
    if(p.t>p.l||(p.vy<0&&p.y<p.y0-.5)){L9[i]=L9[L9.length-1];L9.pop();continue;}
    let k=p.sz*(1-Math.pow(p.t/p.l,3));{const dx=p.x-cp.x,dy=p.y-cp.y,dz=p.z-cp.z,d2=dx*dx+dy*dy+dz*dz;if(d2<36)k*=Math.max(.15,Math.sqrt(d2)/6);} // près de l'objectif, la goutte rapetisse
    const st=Math.min(2.4,1+Math.abs(p.vy)*.06);M9.makeScale(k,k*st,k).setPosition(p.x,p.y,p.z); // une goutte qui file s'étire
    if(n<EAUP.max){im.setMatrixAt(n,M9);im.setColorAt(n,EAUP.cols[p.c]);n++;}}
  im.count=n;im.visible=n>0;imEnvoi(im,n,true);}
/* LE SILLAGE EN V (Kelvin) : la trace de la caisse sur l'eau, un point toutes les 45 ms ; chaque point s'écarte de l'axe à ~19,5° (la vitesse
   × 0,354 × son âge) et s'élargit — deux bandes d'écume en PETITS CARRÉS de 50 cm, la crête blanche côté intérieur, qui s'éteignent en 1,8 s. */
const SILL={P:[],mesh:null,N:48,acc:0};
const SILL_VS='attribute vec3 aF;varying vec3 vF;varying vec3 vW;void main(){vF=aF;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const SILL_FS=['varying vec3 vF;varying vec3 vW;',
  'void main(){float age=vF.x,ac=vF.y,k=vF.z;vec2 c=floor(vW.xz*2.);float h=fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);',
  '  float cr=exp(-pow((ac-.22)/.2,2.));float a=(1.-age)*(1.-age)*k*(.3+.7*cr)*step(.22+.5*age,h+.3*cr);',
  '  if(a<.02)discard;gl_FragColor=vec4(mix(vec3(.62,.88,.90),vec3(.97,1.,1.),cr*(1.-age)),min(1.,a*.9));}'].join('\n');
function sillonMesh(){if(SILL.mesh)return SILL.mesh;const N=SILL.N,g=new THREE.BufferGeometry(),I=[];
  for(let i=0;i<N-1;i++)for(let sd=0;sd<2;sd++){const a=i*4+sd*2,b=a+1,c=a+4,d=c+1;I.push(a,b,c,b,d,c);}
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*4*3),3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aF',new THREE.BufferAttribute(new Float32Array(N*4*3),3).setUsage(THREE.DynamicDrawUsage));g.setIndex(I);g.setDrawRange(0,0);
  const m=new THREE.ShaderMaterial({vertexShader:SILL_VS,fragmentShader:SILL_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});m.dispose=function(){};
  const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=8;me.matrixAutoUpdate=false;me.visible=false;scene.add(me);SILL.mesh=me;return me;}
function sillonPose(x,y,z,vx,vz,hv,dt,kh){SILL.acc+=dt;if(SILL.acc<.045)return;SILL.acc=0;
  SILL.P.unshift({x:x,y:y,z:z,px:-vz,pz:vx,t:0,v:hv*SPD*AIR_RATE,k:kh});if(SILL.P.length>SILL.N)SILL.P.pop();}
function sillonTick(dt){const P=SILL.P;if(!paused)for(const p of P)p.t+=dt;while(P.length&&P[P.length-1].t>1.8)P.pop();
  const me=SILL.mesh;if(P.length<2){if(me&&me.visible)me.visible=false;return;}sillonMesh();const g=SILL.mesh.geometry,pa=g.attributes.position.array,fa=g.attributes.aF.array;
  for(let i=0;i<P.length;i++){const p=P[i],sp=.8+p.t*p.v*.354,w=.5+p.t*1.8,u=Math.min(1,p.t/1.8);
    for(let sd=0;sd<2;sd++){const s9=sd?1:-1,o=(i*4+sd*2)*3;
      pa[o]=p.x+p.px*s9*sp;pa[o+1]=p.y+.12;pa[o+2]=p.z+p.pz*s9*sp;pa[o+3]=p.x+p.px*s9*(sp+w);pa[o+4]=p.y+.12;pa[o+5]=p.z+p.pz*s9*(sp+w);
      fa[o]=u;fa[o+1]=0;fa[o+2]=p.k;fa[o+3]=u;fa[o+4]=1;fa[o+5]=p.k;}}
  g.attributes.position.needsUpdate=true;g.attributes.aF.needsUpdate=true;g.setDrawRange(0,(P.length-1)*12);if(!SILL.mesh.visible)SILL.mesh.visible=true;}
/* LA BRUME DE LA GERBE : de grands cubes translucides qui partent des flancs, gonflent et s'effacent — la nappe d'eau soulevée se lit
   comme un voile (une voiture rapide sous la pluie), les gouttes fines passent devant. */
const EAUB={L:[],im:null,max:320};
function eauBIm(){if(EAUB.im)return EAUB.im;const m=new THREE.MeshBasicMaterial({color:0xeefcff,transparent:true,opacity:.17,depthWrite:false,fog:true});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,EAUB.max);im.count=0;im.frustumCulled=false;im.renderOrder=8;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);EAUB.im=im;return im;}
function eauBrume(p,vx,vz,px,pz,vW,k,kh,sy,dt){eauBIm();const taux=(5+vW*.45)*kh*dt;let n=Math.floor(taux);if(Math.random()<taux-n)n++;n=Math.min(n,6);
  for(const sd of [-1,1])for(let i=0;i<n;i++){const al=-1.8+Math.random()*2.6,vo=(1.5+vW*.16)*(.6+Math.random()*.6),s0=.45+k*.7+Math.random()*.4;
    if(EAUB.L.length<EAUB.max)EAUB.L.push({x:p.x+vx*al+px*sd*1.1,y:sy+.5,z:p.z+vz*al+pz*sd*1.1,vx:px*sd*vo+vx*vW*.25,vy:.8+Math.random()*(1.5+2*k),vz:pz*sd*vo+vz*vW*.25,s:s0,t:0,l:.6+Math.random()*.5});}}
function eauBTick(dt){const im=EAUB.im;if(!im)return;const L9=EAUB.L;if(!L9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;}let n=0;const M9=JCH_M,dr=Math.exp(-1.6*dt),cp=camera.position;
  for(let i=L9.length-1;i>=0;i--){const b=L9[i];if(!paused){b.t+=dt;b.vx*=dr;b.vz*=dr;b.vy*=dr;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;}
    if(b.t>b.l){L9[i]=L9[L9.length-1];L9.pop();continue;}const u=b.t/b.l;let k=b.s*(1+2.2*u)*(1-u*u);
    {const dx=b.x-cp.x,dy=b.y-cp.y,dz=b.z-cp.z,d2=dx*dx+dy*dy+dz*dz;if(d2<64)k*=Math.max(.1,Math.sqrt(d2)/8);} // jamais un voile plein écran
    M9.makeScale(k,k*.7,k).setPosition(b.x,b.y,b.z);if(n<EAUB.max)im.setMatrixAt(n++,M9);}
  im.count=n;im.visible=n>0;imEnvoi(im,n);}
/* LA COURONNE LISSE : une gerbe d'eau translucide (un cylindre ouvert déformé dans le vertex shader) qui s'ouvre, monte, s'évase en lobes et
   retombe — à l'entrée large et basse, à la sortie étroite et haute (la colonne). Des filets clairs, l'éclat du soleil, le bord blanc. */
const COUR_VS=['uniform float uU,uR0,uR1,uH,uS,uFl;varying float vV,vA;varying vec3 vW;',
  'void main(){float v=position.y+.5,a=atan(position.z,position.x),e=1.-pow(1.-uU,2.6);',
  '  float lob=1.+.22*sin(a*9.+uS)*smoothstep(.45,1.,v)+.10*sin(a*17.-uS*2.)*v;',
  '  float r=mix(uR0,uR1,e)*(1.+uFl*v*v*(.5+.5*e))*mix(1.,lob,.35*v);',
  '  float h=uH*sin(3.14159*min(1.,uU*1.2))*v*mix(1.,lob,v);',
  '  vec4 w=modelMatrix*vec4(cos(a)*r,h,sin(a)*r,1.);vW=w.xyz;vV=v;vA=a;gl_Position=projectionMatrix*viewMatrix*w;}'].join('\n');
const COUR_FS=['uniform float uU;uniform vec3 uC,uSun;varying float vV,vA;varying vec3 vW;',
  'void main(){vec3 V=normalize(vW-cameraPosition);',
  '  float al=pow(1.-uU,1.2)*(.22+.62*vV)*(1.-smoothstep(.9,1.,vV)*.5);',
  '  float fil=.78+.22*sin(vA*29.+vV*7.)*sin(vA*11.-vV*3.);',          // les filets d eau
  '  vec3 c=mix(uC,vec3(.97,.99,1.),.2+.7*vV*vV)*fil;',
  '  vec3 N=normalize(vec3(cos(vA),.5,sin(vA)));c+=vec3(1.,.95,.86)*pow(max(dot(reflect(V,N),uSun),0.),24.)*.9;', // l éclat du soleil sur la paroi
  '  c+=vec3(.9,1.,1.)*smoothstep(.86,.97,vV)*.35;',                    // le bord blanc
  '  if(al<.01)discard;gl_FragColor=vec4(c,al);}'].join('\n');
const COUR={L:[],geo:null};
function eauCouronne(x,y,z,o){let c=null;for(const q of COUR.L)if(q.t>=q.d){c=q;break;}
  if(!c){if(COUR.L.length>=4)return;if(!COUR.geo)COUR.geo=new THREE.CylinderGeometry(1,1,1,56,10,true);
    const m=new THREE.ShaderMaterial({uniforms:{uU:{value:0},uR0:{value:1},uR1:{value:4},uH:{value:3},uS:{value:0},uFl:{value:.5},uC:{value:new THREE.Color(.46,.80,.82)},uSun:{value:SUN_DIR}},vertexShader:COUR_VS,fragmentShader:COUR_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    m.dispose=function(){};const me=new THREE.Mesh(COUR.geo,m);me.frustumCulled=false;me.renderOrder=9;me.visible=false;scene.add(me);c={m:me,t:9,d:1};COUR.L.push(c);}
  const u=c.m.material.uniforms;u.uR0.value=o.r0;u.uR1.value=o.r1;u.uH.value=o.h;u.uFl.value=o.fl;u.uS.value=Math.random()*6.28;u.uU.value=0;
  c.t=0;c.d=o.d;c.vx=o.fx;c.vz=o.fz;c.m.position.set(x,y-.2,z);c.m.updateMatrix();c.m.visible=true;}
function eauCouronneTick(dt){for(const c of COUR.L){if(c.t>=c.d){if(c.m.visible)c.m.visible=false;continue;}if(!paused){c.t+=dt;c.m.position.x+=(c.vx||0)*dt*.5;c.m.position.z+=(c.vz||0)*dt*.5;}
  c.m.material.uniforms.uU.value=Math.min(1,c.t/c.d);}}
/* LES ONDES : des disques d'eau (un shader) — une crête blanche, une seconde plus faible derrière, un creux plus sombre ; elles s'élargissent
   et s'éteignent. Une réserve de 10. */
const RIDE_FS=['uniform float uU;varying vec2 vUv;',
  'void main(){float r=length(vUv*2.-1.);if(r>1.)discard;',
  '  float c1=exp(-pow((r-.88)/.055,2.)),c2=exp(-pow((r-.66)/.045,2.))*.45,c3=exp(-pow((r-.48)/.04,2.))*.2,tr=exp(-pow((r-.78)/.05,2.));',
  '  float a=(c1*.75+c2+c3)*pow(1.-uU,1.3)*smoothstep(1.,.96,r);',
  '  vec3 c=mix(vec3(.55,.84,.86),vec3(.98,1.,1.),c1);if(a<.01)discard;gl_FragColor=vec4(c-vec3(.08)*tr,a);}'].join('\n');
const EAUR={L:[],geo:null};
function eauRide(x,y,z,k){let r=null;for(const q of EAUR.L)if(q.t>=q.l){r=q;break;}
  if(!r){if(EAUR.L.length>=10)return;if(!EAUR.geo){EAUR.geo=new THREE.PlaneGeometry(2,2,1,1);EAUR.geo.rotateX(-Math.PI/2);}
    const m=new THREE.ShaderMaterial({uniforms:{uU:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:RIDE_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    m.dispose=function(){};const me=new THREE.Mesh(EAUR.geo,m);me.renderOrder=9;me.frustumCulled=false;scene.add(me);r={m:me,t:9,l:1};EAUR.L.push(r);}
  r.t=0;r.l=1.2+1.2*k;r.s=1.5+3*k;r.S=10+34*k;r.m.position.set(x,y+.2,z);r.m.visible=true;}
function eauRideTick(dt){for(const r of EAUR.L){if(r.t>=r.l){if(r.m.visible)r.m.visible=false;continue;}if(!paused)r.t+=dt;const u=Math.min(1,r.t/r.l),e=1-(1-u)*(1-u);
  r.m.scale.setScalar(r.s+(r.S-r.s)*e);r.m.material.uniforms.uU.value=u;}}
/* L'OBJECTIF MOUILLÉ (2e version — Léo : « l'effet écran quand tu ressors de l'eau, travaille-le encore plus ») — DEUX toiles au tiers de
   l'écran : la VISIBLE (#eauCv, sans lissage : le liseré sombre du bas de chaque goutte, son éclat, la ligne claire de la nappe) et celle des
   NORMALES (LENS.cvN, jamais affichée : recopiée dans le post-traitement, elle y RÉFRACTE l'image — voir uLens dans l'ACES).
   · LA NAPPE : en sortant, tout l'objectif est sous un film d'eau qui s'égoutte vers le bas en 0,75 s ; sa lèvre (le ménisque) dévie fort
     l'image, le film l'ondule.
   · LES GOUTTES (trois familles) : 8-14 GROSSES (5-11 px de toile) qui glissent vite en laissant une traînée d'eau, 14-24 MOYENNES qui
     glissent plus tard ou restent, et une BUÉE de 90-150 micro-gouttelettes qui s'évaporent sur place. Chacune est une lentille : l'image
     derrière elle est retournée et grossie. Elles rétrécissent en fin de vie (elles sèchent) au lieu de s'effacer.
   · L'ENTRÉE dans l'eau : un voile clair bref, et l'objectif se vide de ses gouttes. */
const LENS={cv:null,cx:null,cvN:null,cxN:null,img:null,tex:null,W:0,H:0,g:[],nappe:0,flash:0,t:0,k:0};
function lensInit(){if(LENS.cv)return;const cv=document.createElement('canvas');cv.id='eauCv';cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;visibility:hidden';
  const j=document.getElementById('juiceCv');if(j&&j.parentNode)j.parentNode.insertBefore(cv,j.nextSibling);else document.body.appendChild(cv);LENS.cv=cv;LENS.cx=cv.getContext('2d');
  LENS.cvN=document.createElement('canvas');LENS.cvN.width=LENS.cvN.height=4;LENS.cxN=LENS.cvN.getContext('2d');
  LENS.tex=new THREE.CanvasTexture(LENS.cvN);LENS.tex.minFilter=LENS.tex.magFilter=THREE.LinearFilter;LENS.tex.generateMipmaps=false;
  if(acesPass&&acesPass.uniforms.uLens)acesPass.uniforms.uLens.value=LENS.tex;}
function lensSortie(k){if(REDUCED_MOTION)return;lensInit();LENS.nappe=1;LENS.t=0;LENS.k=k;LENS.g.length=0;const R=Math.random;
  for(let i=0,n=8+((6*k)|0);i<n;i++)LENS.g.push({x:R(),y:.05+R()*.75,r:5+R()*6,t:0,l:1.8+R()*1.4,d:.08+R()*.35,v:0,vx:(R()-.5)*6,tr:[],f:0}); // les GROSSES
  for(let i=0,n=14+((10*k)|0);i<n;i++)LENS.g.push({x:R(),y:R()*.92,r:2.2+R()*2.8,t:0,l:1.6+R()*1.6,d:R()<.5?.5+R()*.9:99,v:0,vx:(R()-.5)*3,tr:[],f:1}); // les MOYENNES
  for(let i=0,n=90+((60*k)|0);i<n;i++)LENS.g.push({x:R(),y:R(),r:.6+R()*1.1,t:0,l:.7+R()*1.3,d:99,v:0,vx:0,tr:null,f:2});} // la BUÉE
function lensEntree(){if(REDUCED_MOTION)return;lensInit();LENS.flash=1;LENS.g.length=0;LENS.nappe=0;}
function lensTick(dt){const cv=LENS.cv;if(!cv)return;const U=acesPass&&acesPass.uniforms;const vide=!LENS.g.length&&LENS.nappe<=0&&LENS.flash<=0;
  if(vide){if(cv.style.visibility!=='hidden'){cv.style.visibility='hidden';LENS.cx.clearRect(0,0,LENS.W,LENS.H);}if(U&&U.uLensK)U.uLensK.value=0;return;}
  const W=Math.max(1,Math.ceil(VP.w/3)),H=Math.max(1,Math.ceil(VP.h/3)); // (2026-10-14, OPTIMISATION — relevé par GENERAL) VP au lieu d'innerWidth : la lecture forçait une mise en page à chaque image (piège n° 11)
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}if(LENS.cvN.width!==W||LENS.cvN.height!==H){LENS.cvN.width=W;LENS.cvN.height=H;LENS.img=null;}
  if(!LENS.img)LENS.img=LENS.cxN.createImageData(W,H);LENS.W=W;LENS.H=H;
  if(cv.style.visibility!=='visible')cv.style.visibility='visible';const x=LENS.cx;x.clearRect(0,0,W,H);LENS.t+=dt;
  const D=LENS.img.data; // la toile des normales, au repos : aucun décalage — (OPTIMISATION) recopiée d'un modèle (une copie mémoire) au lieu de 4 écritures par pixel à chaque image
  if(!LENS.rep||LENS.rep.length!==D.length){const R9=LENS.rep=new Uint8ClampedArray(D.length);for(let i=0;i<R9.length;i+=4){R9[i]=128;R9[i+1]=128;R9[i+2]=0;R9[i+3]=255;}}D.set(LENS.rep);
  const N=function(px,py,nx,ny){if(px<0||py<0||px>=W||py>=H)return;const o=(py*W+px)*4;D[o]=Math.max(0,Math.min(255,128+nx*7.94));D[o+1]=Math.max(0,Math.min(255,128-ny*7.94));}; // (nx, ny en pixels de toile ; ÷16 → ±127)
  if(LENS.flash>0){LENS.flash=Math.max(0,LENS.flash-dt/.22);x.fillStyle='rgba(215,252,255,'+(.55*LENS.flash).toFixed(3)+')';x.fillRect(0,0,W,H);}
  let lens=0;
  if(LENS.nappe>0){LENS.nappe=Math.max(0,LENS.nappe-dt/.75);const p=1-LENS.nappe,top=H*Math.pow(p,1.15),T=LENS.t;lens=1; // LA NAPPE : elle s'égoutte vers le bas
    for(let c=0;c<W;c++){const e=Math.round(top+3*Math.sin(c*.17+T*13)+2.2*Math.sin(c*.053-T*8.5)+1.4*Math.sin(c*.31+T*21));if(e>=H)continue;const e0=Math.max(0,e);
      for(let y=e0;y<H;y++){const dz=y-e;const m=dz<9?(1-dz/9):0; // la LÈVRE (ménisque) dévie fort, le film ondule doucement
        N(c,y,1.6*Math.sin(y*.21+c*.07+T*11)*(1-p*.6)+m*1.5*Math.sin(c*.4),-m*7-.9*Math.sin(c*.13+y*.09-T*9)*(1-p*.6));}
      if((c&1)===0){x.fillStyle='rgba(165,228,236,'+(.16*(1-.5*p)).toFixed(3)+')';x.fillRect(c,e0,2,H-e0);
        if(e>=0){x.fillStyle='rgba(240,255,255,'+(.7*(1-p)).toFixed(3)+')';x.fillRect(c,e,2,1);x.fillStyle='rgba(20,90,105,'+(.35*(1-p)).toFixed(3)+')';x.fillRect(c,e+2,2,1);}}}}
  for(let i=LENS.g.length-1;i>=0;i--){const d=LENS.g[i];d.t+=dt;if(d.t>d.l){LENS.g.splice(i,1);continue;}lens=1;
    if(d.f<2&&d.t>d.d){d.v=Math.min(85,d.v+(d.f?55:110)*dt*(d.r/6));const y0=d.y;d.y+=d.v*dt/H;d.x+=d.vx*dt/W*Math.sin(d.t*3+i);d.r=Math.max(1.2,d.r*(1-.06*dt));
      if(d.tr){d.tr.push(y0);if(d.tr.length>26)d.tr.shift();}}
    const ev=Math.min(1,(d.l-d.t)/.45),r=Math.max(.5,d.r*ev),cx=Math.round(d.x*W),cy=Math.round(d.y*H),ri=Math.ceil(r);
    if(d.tr&&d.tr.length){x.fillStyle='rgba(225,250,255,.10)';const tw=Math.max(1,Math.round(r*.35));for(const ty of d.tr){const yy=Math.round(ty*H);x.fillRect(cx-tw,yy,tw*2,2);N(cx-tw,yy,-.6,0);N(cx+tw-1,yy,.6,0);}} // la traînée d'eau : un mince filet qui dévie un peu
    if(d.f===2){N(cx,cy,(Math.random()-.5)*.8,.8);x.fillStyle='rgba(235,252,255,'+(.2*ev).toFixed(3)+')';x.fillRect(cx,cy,1,1);continue;} // la buée : un point
    for(let dy=-ri;dy<=ri;dy++){const w=Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy)));for(let dx=-w;dx<=w;dx++)N(cx+dx,cy+dy,dx*1.45,dy*1.45); // LA LENTILLE : retournée, grossie ×2
      if(dy>r*.2){x.fillStyle='rgba(18,80,95,'+(.42*ev).toFixed(3)+')';x.fillRect(cx-w,cy+dy,1,1);x.fillRect(cx+w,cy+dy,1,1);}}
    x.fillStyle='rgba(18,80,95,'+(.42*ev).toFixed(3)+')';x.fillRect(cx-Math.floor(r*.55),cy+ri,Math.floor(r*1.1)+1,1);
    x.fillStyle='rgba(255,255,255,'+(.75*ev).toFixed(3)+')';x.fillRect(cx-Math.round(r*.45),cy-Math.round(r*.5),r>6?2:1,r>6?2:1); // l'éclat
    if(r>4){x.fillStyle='rgba(255,255,255,'+(.35*ev).toFixed(3)+')';x.fillRect(cx+Math.round(r*.3),cy+Math.round(r*.45),1,1);}}
  LENS.cxN.putImageData(LENS.img,0,0);LENS.tex.needsUpdate=true;
  if(U&&U.uLensK){U.uLensK.value=lens;U.uLensA.value.set(16*3/Math.max(1,VP.w),16*3/Math.max(1,VP.h));if(U.uLens.value!==LENS.tex)U.uLens.value=LENS.tex;}}
/* LE SON SOUS L'EAU : un passe-bas devant la sortie (grand ouvert hors de l'eau), des bloups de bulles */
function eauFiltre(sous,net){if(!AC||!MASTER||typeof BUSOUT==='undefined'||!BUSOUT)return;
  if(!MASTER._eauLp){if(!sous)return;try{const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=AC.sampleRate/2;lp.Q.value=.6;MASTER.disconnect(BUSOUT);MASTER.connect(lp);lp.connect(BUSOUT);MASTER._eauLp=lp;}catch(e){return;}}
  const f=MASTER._eauLp.frequency,v=sous?620:AC.sampleRate/2;
  if(net){try{f.cancelScheduledValues(AC.currentTime);f.setValueAtTime(v,AC.currentTime);f._s9=v;}catch(e){}}else stt(f,v,AC.currentTime,sous?.04:.12);}
function eauBloop(k){if(!sfxOk())return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),f0=180+Math.random()*260;
  o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*(2.2+Math.random()*1.4),t+.07);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05*k,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.11);
  o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+.13);}catch(e){}}
function jadeBullesIm(){if(JEAU.im)return JEAU.im;
  const m=new THREE.MeshBasicMaterial({color:0xd6fbff,transparent:true,opacity:.62,depthWrite:false,fog:true});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,320);im.count=0;im.frustumCulled=false;im.renderOrder=7;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(im);JEAU.im=im;return im;}
function jadeBullesJet(p,n,r){jadeBullesIm();for(let k=0;k<n&&JEAU.bul.length<320;k++){const a=Math.random()*6.2832,rr=Math.random()*r;
  JEAU.bul.push({x:p.x+Math.cos(a)*rr,y:p.y+(Math.random()-.5)*r,z:p.z+Math.sin(a)*rr,v:3+Math.random()*7,s:.12+Math.random()*.38,t:0,l:1.2+Math.random()*1.8,ph:Math.random()*6.28});}}
function jadeBullesTick(dt){const im=JEAU.im;if(!im)return;const B9=JEAU.bul;if(!B9.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;}let n=0;const M9=JCH_M;
  for(let i=B9.length-1;i>=0;i--){const b=B9[i];if(!paused){b.t+=dt;b.v=Math.min(14,b.v+6*dt);b.y+=b.v*dt;b.x+=Math.sin(b.t*5+b.ph)*dt*.9;b.z+=Math.cos(b.t*4.3+b.ph)*dt*.9;}
    if(b.t>b.l||b.y>jadeSurfCase(b.x,b.z)){B9.splice(i,1);continue;}
    const k=b.s*(1-Math.pow(b.t/b.l,4));M9.makeScale(k,k,k).setPosition(b.x,b.y,b.z);if(n<320)im.setMatrixAt(n++,M9);}
  im.count=n;im.visible=n>0;imEnvoi(im,n);}
const JADE_MERP_VS=['uniform float uMerY,uEauT,uN;uniform vec2 uO;attribute vec2 aCell;attribute float aFace;varying vec3 vW,vNo;varying float vEd,vH;',
  JADE_EAU_GLSL,
  'void main(){vec2 c=uO+aCell;float h=jMerH(c),top=uMerY+h*JMS;',
  '  vec2 dn=aFace<.5?vec2(0.):aFace<1.5?vec2(1.,0.):aFace<2.5?vec2(-1.,0.):aFace<3.5?vec2(0.,1.):vec2(0.,-1.);',
  '  float yb=top;if(aFace>.5)yb=min(top,uMerY+jMerH(c+dn)*JMS);',                 // un flanc ne descend que jusqu au dessus de sa voisine plus basse
  '  vW=vec3((uO.x+position.x)*JMS,mix(yb,top,position.y),(uO.y+position.z)*JMS);',
  '  vNo=aFace<.5?vec3(0.,1.,0.):vec3(dn.x,0.,dn.y);vH=h;',
  '  vEd=max(abs(aCell.x+.5-uN*.5),abs(aCell.y+.5-uN*.5))/(uN*.5);',
  '  gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}'].join('\n');
const JADE_MERP_FS=['uniform float uSous,uK,uFogN,uFogF,uEauT;uniform vec3 uFogC,uCielH,uCielZ,uSunDir;varying vec3 vW,vNo;varying float vEd,vH;',
  'float cau(vec2 p,float t){vec2 q=p*.11;float a=sin(q.x+t*1.1+sin(q.y*1.7+t*.8))*sin(q.y*1.3-t*.9+sin(q.x*1.4-t*.7));return pow(1.-abs(a),6.);}',
  'void main(){vec3 D=vW-cameraPosition;float dist=length(D);vec3 V=D/max(dist,1e-3);vec3 col;float a;float pxw=length(fwidth(vW.xz));', // (dérivées hors des branches)
  '  if(uSous>.5){',                                                                     // VUE D EN DESSOUS : le miroir de l eau, et la fenêtre sur le ciel
  '    float cs=cau(vW.xz,uEauT),win=smoothstep(.55,.80,V.y)*step(.5,vNo.y);',
  '    vec3 tir=uFogC*1.45+vec3(.10,.24,.22)*cs,sk=mix(uCielH,uCielZ,.35)*1.12+vec3(.22,.26,.24)*cs;',
  '    col=mix(tir,sk,win);a=mix(.93,.38,win);if(vNo.y<.5){col=uFogC*1.2+vec3(.05,.10,.10)*cs;a=.88;}',
  '  }else{',                                                                           // VUE D AU-DESSUS : la mer en cubes du ciel, translucide (la caisse plongée s y devine)
  '    float hn=clamp((vH+5.)/9.,0.,1.);vec3 wc=mix(vec3(.03,.18,.27),vec3(.20,.58,.64),hn);vec3 Ns=vNo;float sub=0.,s1=0.,s2=0.,sb=1.;',
  '    if(vNo.y>.5){vec2 sq=vW.xz,si=floor(sq),sf=fract(sq);s1=fract(sin(dot(si,vec2(127.1,311.7)))*43758.5453);s2=fract(sin(dot(si,vec2(269.5,183.3)))*43758.5453);float s3=fract(sin(dot(si,vec2(419.2,371.9)))*43758.5453);', // (2026-10-13) les PETITS CUBES de 1 m, comme la mer peinte
  '      sub=1.-smoothstep(.22,.85,pxw);vec3 tn=s2<.2?vec3(.04,.21,.34):s2<.42?vec3(.07,.38,.45):s2<.62?vec3(.15,.57,.61):s2<.80?vec3(.11,.47,.40):s2<.93?vec3(.30,.66,.70):vec3(.52,.80,.82);',
  '      wc=mix(wc,mix(tn,wc,.5)*(.94+.12*s3),sub*.5);sb=min(min(sf.x,1.-sf.x),min(sf.y,1.-sf.y));vec2 bo=sign(sf-.5)*(1.-smoothstep(.02,.09,sb));',
  '      Ns=normalize(mix(vNo,normalize(vec3((s1-.5)*.14+bo.x*.18,1.,(s3-.5)*.14+bo.y*.18)),sub));}',
  '    float F=.03+.97*pow(1.-abs(dot(V,Ns)),5.);vec3 Rf=reflect(V,Ns),sk=mix(uCielH,uCielZ,smoothstep(0.,.6,Rf.y));',
  '    float dif=max(dot(Ns,uSunDir),0.)*.5+.5;col=mix(wc*(.78+.3*dif),sk,F*.8);if(vNo.y<.5)col*=.72;a=mix(.6,.95,F);',
  '    float tw=pow(.5+.5*sin(uEauT*(1.6+3.2*s2)+s1*41.),7.);col+=vec3(1.,.93,.80)*pow(max(dot(Rf,uSunDir),0.),260.)*tw*7.*sub;a=max(a,min(1.,pow(max(dot(Rf,uSunDir),0.),260.)*tw*7.*sub));', // les éclats
  '    col*=mix(1.,.90+.10*smoothstep(0.,.06,sb),sub);}',
  '  col=mix(col,uFogC,smoothstep(uFogN,uFogF,dist));',
  '  a*=(1.-smoothstep(.70,1.,vEd))*uK;if(a<.004)discard;',
  '  gl_FragColor=vec4(col,a);}'].join('\n');
function jadePeau(){if(JSOUS.peau)return JSOUS.peau;const N=JSOUS.N,P=[],A=[],F=[],I=[];let v=0;
  const Q=[[0,[[0,1,0],[1,1,0],[1,1,1],[0,1,1]]],[1,[[1,0,0],[1,0,1],[1,1,1],[1,1,0]]],[2,[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]],[3,[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]],[4,[[0,0,0],[1,0,0],[1,1,0],[0,1,0]]]];
  for(let ix=0;ix<N;ix++)for(let iz=0;iz<N;iz++)for(const q of Q){for(const c of q[1]){P.push(ix+c[0],c[1],iz+c[2]);A.push(ix,iz);F.push(q[0]);}I.push(v,v+1,v+2,v,v+2,v+3);v+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aCell',new THREE.Float32BufferAttribute(A,2));g.setAttribute('aFace',new THREE.Float32BufferAttribute(F,1));g.setIndex(I);
  const m=new THREE.ShaderMaterial({uniforms:{uMerY:JADE_U.uMerY,uEauT:skyU.uEauT,uN:{value:N},uO:{value:new THREE.Vector2()},uSous:{value:0},uK:{value:0},uFogN:{value:2},uFogF:{value:200},
    uFogC:{value:new THREE.Color()},uCielH:{value:new THREE.Color()},uCielZ:{value:new THREE.Color()},uSunDir:{value:SUN_DIR}},vertexShader:JADE_MERP_VS,fragmentShader:JADE_MERP_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide,extensions:{derivatives:true}});
  m.dispose=function(){};const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=8;me.visible=false;me.matrixAutoUpdate=false;scene.add(me);JSOUS.peau=me;return me;}
function jadeSousTick(dt){ // fin de jadeTick (après la caméra et la brume de updateClouds, juste avant le rendu)
  const f=scene.fog,W=JSOUS.w;
  if(W.ok&&f&&f.near===W.n&&f.far===W.f&&f.color.equals(W.c)){f.color.copy(JSOUS.base.c);f.near=JSOUS.base.n;f.far=JSOUS.base.f;} // personne n'a réécrit la brume depuis l'image d'avant : on rend la sienne
  W.ok=false;
  const ok=jadeEauOk()&&started;let sous=false,prof=0;
  if(ok){const cp=camera.position;prof=jadeSurfCase(cp.x,cp.z)-cp.y;sous=prof>0;}
  JSOUS.sous=sous;JSOUS.prof=prof;skyU.uSous.value=sous?1:0;JADE_U.uSous.value=sous?1:0;
  if(sous!==JSOUS.sous0){if(JSOUS.bascT>.25&&ok){if(sous){lensEntree();jadeBullesJet(camera.position,70,5);}else lensSortie(Math.min(1,Math.abs(fallVel.y)/150));}JSOUS.bascT=0;JSOUS.sous0=sous;}JSOUS.bascT+=dt; // l'objectif passe la surface : mouillé en sortant, un voile en entrant
  eauFiltre(sous&&ok,false); // le son passe sous l'eau avec l'objectif
  JEAU.sorti+=dt;JEAU.k+=(((JEAU.dans||sous)?1:0)-JEAU.k)*Math.min(1,dt*6);
  if(sous&&f){JSOUS.base.c.copy(f.color);JSOUS.base.n=f.near;JSOUS.base.f=f.far;
    const dp=Math.min(1,prof/260);JSOUS.c.copy(JSOUS.cA).lerp(JSOUS.cB,dp);
    {const h=BIO.cur.jdH||[.9,.9,.85];JSOUS.c.r=JSOUS.c.r*.9+h[0]*.1*(1-dp);JSOUS.c.g=JSOUS.c.g*.9+h[1]*.1*(1-dp);JSOUS.c.b=JSOUS.c.b*.9+h[2]*.1*(1-dp);} // près de la surface, un peu du ciel
    f.color.copy(JSOUS.c);f.near=2;f.far=230-80*dp;W.c.copy(f.color);W.n=f.near;W.f=f.far;W.ok=true;
    skyU.uSousC.value.set(JSOUS.c.r,JSOUS.c.g,JSOUS.c.b);}
  const want=ok&&(sous||JEAU.dans||(mode==='fall'&&JEAU.sorti<.8));
  JSOUS.uK+=((want?1:0)-JSOUS.uK)*Math.min(1,dt*(want?12:3));
  if(JSOUS.uK>.01||want){const pe=jadePeau(),u=pe.material.uniforms,cp=camera.position,N=JSOUS.N;pe.visible=true;
    u.uO.value.set(Math.floor(cp.x/4)-N/2,Math.floor(cp.z/4)-N/2);u.uSous.value=sous?1:0;u.uK.value=JSOUS.uK;
    if(f){u.uFogC.value.copy(f.color);u.uFogN.value=f.near;u.uFogF.value=f.far;}
    const h=BIO.cur.jdH||[.9,.9,.85],z=BIO.cur.jdZ||[.48,.66,.8];u.uCielH.value.setRGB(h[0],h[1],h[2]);u.uCielZ.value.setRGB(z[0],z[1],z[2]);}
  else if(JSOUS.peau&&JSOUS.peau.visible)JSOUS.peau.visible=false;
  if(JEAU.im){if(!ok&&JEAU.bul.length)JEAU.bul.length=0;jadeBullesTick(dt);}
  eauPTick(dt);eauRideTick(dt);eauCouronneTick(dt);sillonTick(dt);eauBTick(dt);if(!paused)lensTick(dt);}
window.dbgEau=function(o){if(o==='profil'&&JADE.root){const r=[];for(let k=0;k<=40;k++){const i=Math.min(NP-1,Math.round(k/40*(NP-1)));r.push(Math.round(pts[i].y-JADE.eauY));}return r;} // (banc) o = {h:hauteur au-dessus de l'eau, vy, vh} : lâche la caisse au-dessus de la mer ; sans argument : l'état
  if(o&&jadeEauOk()){const p=carGroup.position,sy=jadeSurf(p.x,p.z);if(mode!=='fall')startFall(0,0,false);fallPos.set(p.x,sy+(o.h==null?40:o.h),p.z);fallVel.y=o.vy==null?0:o.vy;if(o.vh!=null){const hx=Math.hypot(fallVel.x,fallVel.z)||1;fallVel.x*=o.vh/hx;fallVel.z*=o.vh/hx;fallVH0=Math.max(fallVH0,o.vh);}carGroup.position.copy(fallPos);}
  const p=mode==='fall'?fallPos:carGroup.position;
  return {ok:jadeEauOk(),mode:mode,cause:mortCause,dans:JEAU.dans,n:JEAU.n,t:+JEAU.t.toFixed(2),prof:+JEAU.prof.toFixed(1),vIn:+JEAU.vIn.toFixed(1),vRef:+JEAU.vRef.toFixed(1),
    y:+p.y.toFixed(1),surf:JADE.root?+(isFinite(JEAU.syF)?JEAU.syF:jadeSurf(p.x,p.z)).toFixed(1):null,vy:+fallVel.y.toFixed(1),fallTR:+fallTR.toFixed(2),camSous:JSOUS.sous,camProf:+JSOUS.prof.toFixed(1),peau:+JSOUS.uK.toFixed(2),bulles:JEAU.bul.length,rico:JEAU.rico,f:+JEAU.f.toFixed(2),wB:+JEAU.wB.toFixed(2),flot:+JEAU.flotT.toFixed(1),hv:+Math.hypot(fallVel.x,fallVel.z).toFixed(1),gouttes:EAUP.L.length,ondes:EAUR.L.filter(function(r){return r.t<r.l;}).length,vitre:LENS.g.length,nappe:+LENS.nappe.toFixed(2),filtre:MASTER&&MASTER._eauLp?Math.round(MASTER._eauLp.frequency.value):null,
    brume:scene.fog?[Math.round(scene.fog.near),Math.round(scene.fog.far),'#'+scene.fog.color.getHexString()]:null};};
function jadeChuteRaz(){for(const c of JCH.L){if(c.orig)for(const o of c.orig)o.F.M.set(o.m,o.si*16);if(c.fo)FIN.mats.delete(c.pi);c.t0=0;c.fin=false;c.spl=false;c.orig=null;c.fo=null;}
  if(JADE.col&&JADE.col.mort)JADE.col.mort.clear();JCH.sp.length=0;if(JCH.splash)JCH.splash.count=0;for(const c of JCH.L)c.vu=false;JADE.sig=0;}
/* L'ARRIVÉE : au portail, l'annonce (et le temps), puis — sous le volet — le niveau repart du départ, les montagnes remises debout */
function jadeAnn(){const h=document.documentElement;h.classList.add('jadeAnn');clearTimeout(jadeAnn.t);jadeAnn.t=setTimeout(function(){h.classList.remove('jadeAnn');},3600);}
function jadeFinale(){if(JADE.fini){if(s>L-6)s=L-6;return;}JADE.fini=true;jadeAnn();
  const tps=Math.max(0,(performance.now()-(JADE.t0||performance.now()))/1000),mm=Math.floor(tps/60),ss=Math.floor(tps%60);
  try{slam('ARRIVÉE',TR(JADE_JEU?JADE_NOM:'PICS DE JADE')+' · '+mm+':'+(ss<10?'0':'')+ss,null,null,null,3,true);}catch(e){}shake=Math.max(shake,.25);
  setTimeout(function(){if(!started||gameOver||mode==='boom')return;try{ecranWipe(jadeRedemarre);}catch(e){jadeRedemarre();}},2800);}
function jadeRedemarre(){if(!started||gameOver||mode==='boom')return; // (2026-10-12, passe qualité) JOUER lance le SOLEIL DE JADE : une caisse qui EXPLOSE (ou une partie finie) dans les 2,8 s après l'ARRIVÉE était remise en 'drive' au départ — ressuscitée sous l'écran de fin
  s=0;lat=0;psi=0;prevTvalid=false;mode='drive';vA=0;jadeChuteRaz();JADE.fini=false;JADE.t0=performance.now();} // (v17, « enlève les intros ») plus de « DÉPART » : on repart, c'est tout
/* une GRILLE posée dans un repère (o : coin, axes x = b, y = haut, z = −t ; en cubes de VX) — la muraille, l'arche */
function jadeRepere(o,b,t,sc){const m=new THREE.Matrix4(),z=t.clone().negate(),k=sc||VXG;
  m.set(b.x*k,0,z.x*k,o.x, b.y*k,k,z.y*k,o.y, b.z*k,0,z.z*k,o.z, 0,0,0,1);return m;}
function jadeMonument(root,g,Mr,jx,M9){ // un monument en verre de jade : ses trois passes (lumière, absorption, profondeur) — rend les trois maillages
  const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=jx;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));
  /* (v17, « ça bugue énormément ») MESURÉ : la porte du ciel (519 k triangles × 3 passes) était dessinée À CHAQUE IMAGE, de n'importe où dans
     le niveau (frustumCulled faux). Désormais chaque monument vit dans un groupe éteint au-delà de la brume, et le champ le trie. */
  if(!g.boundingSphere)g.computeBoundingSphere();const gr=new THREE.Group();gr.matrixAutoUpdate=false;root.add(gr);
  const L9=[];for(const k of ([[M9.vrM,3],[M9.vrXM,2],[M9.vrPM,2.5]])){const m=new THREE.Mesh(g,k[0]);m.matrixAutoUpdate=false;m.matrix.copy(Mr);m.matrixWorldNeedsUpdate=true;m.renderOrder=k[1];m.frustumCulled=true;if(!L9.length)m.userData.jeter=true;gr.add(m);L9.push(m);}
  const c=g.boundingSphere.center.clone().applyMatrix4(Mr);(JADE.monu||(JADE.monu=[])).push({g:gr,c:c,r:g.boundingSphere.radius*Mr.getMaxScaleOnAxis(),L:L9,loin:false});
  return L9;}
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN, ALLÉGÉ — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : la Porte du ciel, seule en
   matière opaque au-delà de 450 m, pesait ~158 000 triangles à CHAQUE image (grille 224×218×34 en cubes de 5 m, maillée avec ses faces
   intérieures — qu'on ne voit qu'à travers le verre, donc jamais en opaque). De loin, elle prend un 4e maillage : la DEMI-grille (voxDemi,
   le niveau de détail des montagnes) SANS faces intérieures, posée à l'échelle ×2 — le sommet (x,y,z) de la demi-grille tombe sur
   o+2·VXG·(x,y,z), là où tombait (2x,2y,2z) de la grille : même endroit, même taille, des cubes de 10 m — ~30 000 triangles (calculé hors
   navigateur sur la même grille : 158 k → 29-31 k). De près (< 450 m) : le verre en trois passes, intact. Bâti UNE fois, dans la chauffe du
   niveau (jadeChauffeNiveau, l'image déjà sacrifiée 120 ms après newTrack) — jamais au palier RÉCENT, jamais en course ; tant qu'il n'est
   pas bâti, le maillage plein reste (comme avant). 1 = allégé, 0 = comme avant. */
PAL.B.jadeMonuLoin=[1,1,0];
/* (2026-10-14, passe perf mobile) LE VERRE DU MONUMENT, DE TOUT PRÈS SEULEMENT — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : à 1 250 m du
   centre de la Porte du ciel la scène prenait +729 000 triangles d'un coup (469 k → 1 198 k) : la bascule comparait « distance au CENTRE −
   RAYON de la sphère » à 450 m, et la sphère de la Porte (1 120 × 1 090 × 170 m) a ~790 m de rayon — le verre en trois passes (3 × 158 k)
   s'allumait donc à 1 240 m, et restait allumé ~1 240 m après (la sphère coupe toujours le champ) : ~30 s à 300 km/h. Deux leviers, par palier :
   · jadePorteVerre : le seuil (m) à la place du 450 en dur, pour tous les monuments ;
   · pour la Porte allégée (celle qui a son maillage de loin, o.dP), la distance est celle de sa FAÇADE le long de la route (|u| − D/2, la
     route la traverse droit), et passé 30 m derrière sa face arrière elle est tout entière dans le dos de la caméra : opaque allégée aussitôt.
   Reste en verre plein : 150 m (300 m) avant la façade + les 170 m de l'arche + 30 m ≈ 350 m (500 m), soit ~4 s (~6 s) à 300 km/h.
   Palier RÉCENT : 450 m sur la sphère, comme avant (o.dP n'y existe pas). */
PAL.B.jadePorteVerre=[150,300,450];JADE_LOD.mv=PAL.b('jadePorteVerre',450);
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN EN TRANCHES. MESURÉ (node, Mac) : voxDemi ~17 ms + voxMesh ~18 ms d'un seul bloc dans
   la chauffe, soit ~150 ms figés sur iPhone 7 — au ras du voile du portail (~280 ms). voxDemiG et voxMeshG sont déjà des GÉNÉRATEURS à
   échéance (JF.lim, état tout local) : jadeMonuLoin ne fait plus que préparer la file (o.loIt), jadeTick en mène UNE tranche par image
   (jadeMonuLoinPas, budget jadeMonuLoinMs), JF.lim posé le temps de la tranche puis rendu. Même maillage au bit près (banc node : un trait
   contre des tranches forcées à chaque échéance). Tant que ce n'est pas fini, le maillage plein reste (o.lo absent : jadeTick ne bascule pas).
   Carte rangée (JADE_GARDE) : la file attend (jadeTick ne voit que la carte en place) et reprend avec elle ; carte jetée : jadeJette ferme la
   file (le finally de voxMeshG rend VOXM). Cible ~40 tranches ≈ 1,3 s sur iPhone 7 au lieu d'un bloc de ~150 ms. dbgMonuLoin() : l'état. */
PAL.B.jadeMonuLoinMs=[4,3,3];
function* jadeMonuLoinG(G){const H=yield* voxDemiG(G);return yield* voxMeshG(H);} // = voxMesh(voxDemi(G)), en tranches
function jadeMonuLoin(o){if(!o||!o.dG||o.lo||!o.L||o.loIt)return;const G=o.dG;o.dG=null; // (une seule tentative : une exception laisse le maillage plein)
  o.loIt=jadeMonuLoinG(G);o.loS={t0:performance.now(),ms:0,n:0,mur:0,err:null};}
function jadeMonuLoinPas(o){const it=o.loIt,S=o.loS,t=performance.now(),l0=JF.lim;let r;
  JF.lim=t+PAL.b('jadeMonuLoinMs',3);
  try{r=it.next();}catch(e){o.loIt=null;S.err=String(e);console.warn('monument de loin',e);return;}finally{JF.lim=l0;S.ms+=performance.now()-t;S.n++;}
  if(!r.done)return;o.loIt=null;S.mur=performance.now()-S.t0;
  try{jadeMonuLoinPose(o,r.value);}catch(e){S.err=String(e);console.warn('monument de loin',e);}}
window.dbgMonuLoin=function(){return (JADE.monu||[]).filter(function(o){return o.loS||o.dG;}).map(function(o){const S=o.loS||{};
  return {etat:o.lo?'pret':o.loIt?'tranche '+S.n:S.err?'erreur':S.n?'vide':'en attente',tranches:S.n||0,msTravail:+(S.ms||0).toFixed(1),msMur:Math.round(S.mur||0),tri:o.loTri||0,loin:!!o.loin,err:S.err||null};});};
function jadeMonuLoinPose(o,g){
  if(!g.index||!g.index.count)return;
  const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=o.dJ;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));
  const m=new THREE.Mesh(g,jadeMats().vrOM);m.matrixAutoUpdate=false;m.matrix.copy(o.dM);m.matrixWorldNeedsUpdate=true;m.renderOrder=0;m.frustumCulled=true;m.userData.jeter=true;
  m.visible=!!o.loin;if(o.loin)o.L[0].visible=false;o.g.add(m);o.lo=m;o.loTri=g.index.count/3;}
function jadeDansGrille(R,p){const dx=p.x-R.o.x,dy=p.y-R.o.y,dz=p.z-R.o.z; // un point du monde est-il dans un cube de cette grille ?
  return voxAt(R.G,Math.floor((dx*R.b.x+dz*R.b.z)/VXG),Math.floor(dy/VXG),Math.floor(-(dx*R.t.x+dz*R.t.z)/VXG))>0;}
/* LA PORTE DU CIEL — un massif FLOTTANT en cubes, percé d'une arche (176 m) : faces bosselées, crête en pitons, un DESSOUS en pointes
   d'escalier d'où pendent des lianes ; rouille, herbe, touffes ; rogné si la route repasse derrière ; des montagnes soudées à ses faces. */
function* jadePorte(root,i0,jr,M9,pose){ // (LE PRÉ-BÂTI) un générateur : ses cubes (voxMeshG, colMeshG) rendent la main à l'échéance JF.lim
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),D=170;
  let wG=560,wD=560;
  for(let i=0;i<NP;i+=4){if(Math.abs(i-i0)<Math.round(420/(L/(NP-1))))continue;const q=pts[i],dx=q.x-p.x,dz=q.z-p.z,u=dx*t.x+dz*t.z,v=dx*b.x+dz*b.z;
    if(Math.abs(u)>D/2+ROAD_HALF+40)continue;if(v>0)wD=Math.min(wD,v-ROAD_HALF-50);else wG=Math.min(wG,-v-ROAD_HALF-50);}
  if(wG<180||wD<180)return;
  wG=Math.floor(wG/VXG)*VXG;wD=Math.floor(wD/VXG)*VXG;
  const y0=p.y,hb=-55,ht=215,hw=88,top=520,W=wG+wD,ab=ht-hw*.9;
  const ph=[jr()*6.28,jr()*6.28,jr()*6.28],crete=f=>{const cr=Math.sin(Math.max(0,Math.min(1,f))*Math.PI);return top*(.62+.38*Math.sqrt(cr))-(1-cr)*90+
      70*Math.pow(Math.abs(Math.sin(f*5.1+ph[0])),2.5)+35*Math.sin(f*13.7+ph[1])+18*Math.sin(f*31.+ph[2]);};
  const vn=rocNoise2(jr()*100),vb=rocNoise2(jr()*100);
  const oy=Math.floor((y0-440)/VXG)*VXG,nx=Math.round(W/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+top+130-oy)/VXG),G=voxG(nx,ny,nz);
  const cretes=new Float32Array(nx);for(let x=0;x<nx;x++)cretes[x]=crete((x+.5)/nx)+(jr()-.5)*10;
  const basT=new Float32Array(nx*nz);for(let x=0;x<nx;x++){const v=-wG+(x+.5)*VXG,xn=(v-(wD-wG)/2)/(W/2);for(let z=0;z<nz;z++)basT[x*nz+z]=-300+180*xn*xn+90*(vb(x*VXG/5*.09,z*VXG/5*.12)-.5);} // le DESSOUS, en pointes : le massif flotte
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const v=-wG+(x+.5)*VXG;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr>cretes[x])break;
      if(Math.abs(v)<hw&&yr>hb&&(yr<ab||(v/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=x*VXG/5,ys=y*VXG/5,kz=5/VXG,z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3)*kz),z1=nz-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3)*kz); // les faces BOSSELÉES (en mètres) + (v7) une rugosité fine : la façade se lit en petits cubes, comme les montagnes
      for(let z=z0;z<z1;z++)if(yr>=basT[x*nz+z])G.d[x+nx*(z+nz*y)]=JM.roche;}}
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const ru=vn(x*VXG/5*.3,3.3)>.83;
    for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;const yr=oy+(y+.5)*VXG-y0;
      if(!voxAt(G,x,y+1,z)&&yr>-60){G.d[k0]=JM.herbe;continue;}
      if(ru&&(!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&jr()<.9)G.d[k0]=JM.rouille;}}
  const o=p.clone().addScaledVector(b,-wG).addScaledVector(t,D/2);o.y=oy;
  JADE.porte={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,hw:hw,hb:y0+hb,ht:y0+ht,G:G,o:o,i:i0,tri:0};
  // (v8) LES CUBES MINUSCULES de la porte : la RÉGION que la route traverse (l'arche ± 110 m, de 140 m sous la route à 360 m au-dessus) devient
  // FANTÔME dans la muraille (ni faces ni trou, voxMesh) ; elle a deux habits : de LOIN ses cubes de 2,5 m (une petite grille découpée autour
  // d'elle), de PRÈS (< 780 m) ses colonnes fines (colMesh, les marches avec la muraille posées des deux côtés). Les chocs lisent toujours G.
  let fin9=false;const T0=performance.now(),TT=JADE.tPorte={};
  if(FIN.on){try{const K=FIN.k,RW=hw+110,xa=Math.max(0,Math.floor((wG-RW)/VXG)),xb=Math.min(nx,Math.ceil((wG+RW)/VXG)),ya=Math.max(0,Math.floor((y0-140-oy)/VXG)),yb=Math.min(ny,Math.ceil((y0+360-oy)/VXG));
    const Gc={nx:nx,ny:ny,nz:nz,d:G.d.slice()};for(let y=ya;y<yb;y++)for(let z=0;z<nz;z++)for(let x=xa;x<xb;x++){const k=x+nx*(z+nz*y);if(Gc.d[k])Gc.d[k]=255;}
    TT.ghost=Math.round(performance.now()-T0);const gA=yield* voxMeshG(Gc,4);TT.A=Math.round(performance.now()-T0);
    const x0=Math.max(0,Math.floor((xa-1)/4)*4),y09=Math.max(0,Math.floor((ya-1)/4)*4),x1=Math.min(nx,xb+1),y1=Math.min(ny,yb+1),Gb=voxG(x1-x0,y1-y09,nz); // la région seule, en 2,5 m (de loin)
    for(let y=y09;y<y1;y++)for(let z=0;z<nz;z++)for(let x=x0;x<x1;x++){const m9=G.d[x+nx*(z+nz*y)];if(!m9)continue;Gb.d[(x-x0)+Gb.nx*(z+nz*(y-y09))]=(x>=xa&&x<xb&&y>=ya&&y<yb)?m9:255;}
    const gB=yield* voxMeshG(Gb,4);TT.B=Math.round(performance.now()-T0);const oB=o.clone().addScaledVector(b,x0*VXG);oB.y+=y09*VXG;
    const NU=(xb-xa)*K,NV=(yb-ya)*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),kz=5/VXG;
    for(let v=0;v<NV;v++){if(performance.now()>JF.lim)yield;for(let u=0;u<NU;u++){const x=(xa*K+u+.5)/K,y=(ya*K+v+.5)/K,vv=-wG+x*VXG,yr=oy+y*VXG-y0;
      const xi=Math.min(nx-1,Math.max(0,Math.floor(x-.5))),fx=Math.min(1,Math.max(0,x-.5-xi)),cr=cretes[xi]*(1-fx)+cretes[Math.min(nx-1,xi+1)]*fx;if(yr>=cr)continue;
      if(Math.abs(vv)<hw&&yr>hb&&(yr<ab||(vv/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=(x-.5)*VXG/5,ys=(y-.5)*VXG/5;
      const z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3+.5*vn(xs*2.3+7,ys*1.8+2))*kz*K),
            z1=nz*K-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3+.5*vn(xs*2.3+17,ys*1.8+9))*kz*K);
      if(z1>z0){LO[u+NU*v]=z0;HI[u+NU*v]=z1;}}}
    TT.cols=Math.round(performance.now()-T0);const cache=new Map(),nb=(u,v)=>{const cx=Math.floor((xa*K+u)/K),cy=Math.floor((ya*K+v)/K);if(cx<0||cy<0||cx>=nx||cy>=ny)return null;const kk=cx*4096+cy;
      if(!cache.has(kk)){let z0=-1,z1=-1;for(let z=0;z<nz;z++)if(G.d[cx+nx*(z+nz*cy)]){if(z0<0)z0=z;z1=z;}cache.set(kk,z0<0?null:[z0*K,(z1+1)*K]);}return cache.get(kk);};
    const mat=(kind,u,v,sg)=>{if(kind==='w')return vn((xa*K+u)/K*VXG/5*.3,3.3)>.83?JM.rouille:1;if(kind==='v'&&sg>0)return oy+(ya*K+v+1)/K*VXG-y0>-60?JM.herbe:1;return 1;};
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,1,2],mat,nb,12);TT.F=Math.round(performance.now()-T0);const oF=o.clone().addScaledVector(b,xa*VXG);oF.y+=ya*VXG;
    jadeMonument(root,gA,jadeRepere(o,b,t),.37,M9);JADE.porte.mL=jadeMonument(root,gB,jadeRepere(oB,b,t),.37,M9);JADE.porte.mF=jadeMonument(root,gF,jadeRepere(oF,b,t,VXG/K),.37,M9);
    for(const m of JADE.porte.mF)m.visible=false;JADE.porte.pres=false;JADE.porte.tri=gA.index.count/3+gB.index.count/3;JADE.porte.triF=gF.index.count/3;fin9=true;}catch(e){console.warn('porte fine',e);}}
  if(!fin9){const g=yield* voxMeshG(G,4);jadeMonument(root,g,jadeRepere(o,b,t),.37,M9);JADE.porte.tri=g.index.count/3;
    if(PAL.b('jadeMonuLoin',0)){const e9=JADE.monu[JADE.monu.length-1];e9.dG=G;e9.dM=jadeRepere(o,b,t,VXG*2);e9.dJ=.37;e9.dP=JADE.porte;}} // (2026-10-14, passe perf mobile) de loin : la demi-grille posée ×2 (voir jadeMonuLoin)
  if(pose){for(const sg of [-1,1]){const W9=sg<0?wG:wD;
      for(const fa of [-1,1])pose(p.x+b.x*sg*(hw+62)+t.x*fa*(D*.5-18),p.z+b.z*sg*(hw+62)+t.z*fa*(D*.5-18),40,y0+crete(.5+sg*(hw+62)/W)+40+jr()*80);
      for(let v=hw+140;v<W9-40;v+=75+jr()*60)for(const fa of [-1,1])if(jr()<.7){const r=24+jr()*26,f9=(v*sg+wG)/W;
        pose(p.x+b.x*sg*v+t.x*fa*(D*.5-r*.3),p.z+b.z*sg*v+t.z*fa*(D*.5-r*.3),r,y0+crete(f9)-60+jr()*170);}}}
}
/* LE PONT DU CIEL — deux montagnes flottantes en cubes, une arche de cubes qui les relie (72-150 m au-dessus de la route), herbe,
   touffes et pins peints dessus, lianes dessous. */
function* jadePont(root,i0,jr,M9,pose,ARB){ // (LE PRÉ-BÂTI) un générateur (voir jadePorte)
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),y0=p.y;
  const ec=ROAD_HALF+66,G9=JADE.geos,tp=jadeTplDe(40),Tp=G9.p[tp];
  for(const sg of [-1,1]){const cx=Math.round((p.x+b.x*sg*ec)/VX)*VX,cz=Math.round((p.z+b.z*sg*ec)/VX)*VX,yt=Math.floor((y0+205+(sg>0?24:0))/VX)*VX;
    pose([cx,cz,Tp.rmax*VX,yt-Tp.yTop*VX,yt,tp,(jr()*4)|0,jr(),ec]);}
  const xa=Math.ceil((ec+12)/VXG)*VXG,D=66,PR={b0:72,bC:104,t0:132,tC:150};
  const yB=f=>PR.b0+(PR.bC-PR.b0)*Math.sin(f*Math.PI),yH=f=>PR.t0+(PR.tC-PR.t0)*Math.pow(Math.sin(f*Math.PI),.6);
  const oy=Math.floor((y0+PR.b0-12)/VXG)*VXG,nx=Math.round(2*xa/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+PR.tC+20-oy)/VXG),G=voxG(nx,ny,nz);
  for(let x=0;x<nx;x++){const f=(x+.5)/nx,a=yB(f)+(jr()-.5)*5,c=yH(f)+(jr()-.5)*5;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr<a||yr>c)continue;for(let z=0;z<nz;z++){if((z===0||z===nz-1)&&jr()<.3)continue;G.d[x+nx*(z+nz*y)]=JM.roche;}}}
  const tops=[];
  for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;
    if(!voxAt(G,x,y+1,z)){G.d[k0]=JM.herbe;tops.push([x,y,z]);}
    else if((!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&x%7===3&&jr()<.8)G.d[k0]=JM.rouille;}
  const o=p.clone().addScaledVector(b,-xa).addScaledVector(t,D/2);o.y=oy;
  const g=yield* voxMeshG(G,4),Mr=jadeRepere(o,b,t),mL=jadeMonument(root,g,Mr,.81,M9);
  const V3=new THREE.Vector3();
  for(let k=0;k<14&&tops.length;k++){const c=tops[(jr()*tops.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(Mr);const h=9+jr()*9,pin=jr()<.7;ARB.push({x:V3.x,y:V3.y,z:V3.z,j:[h*(pin?.95:1.35),h,pin?(jr()*4)|0:4,jr()]});}
  JADE.pont={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,xa:xa,yB:yB,yH:yH,G:G,o:o,i:i0,tri:g.index.count/3,mL:mL};
  // (v8) LES CUBES MINUSCULES du pont : l'arche entière en colonnes fines (de près, < 650 m)
  if(FIN.on){try{const K=FIN.k,cv=VXG/K,NU=nx*K,NV=nz*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),na=rocNoise2(31.7),nc=rocNoise2(77.1);
    const hs=(u,v,s9)=>{const x=Math.sin(u*127.1+v*311.7+s9)*43758.5453;return x-Math.floor(x);};
    for(let u=0;u<NU;u++){const f=(u+.5)/NU,a=yB(f)+5*(na(u*cv*.07,1.3)-.5)*2,c=yH(f)+5*(nc(u*cv*.07,4.1)-.5)*2;
      for(let v=0;v<NV;v++){if((v<2||v>=NV-2)&&hs(u,v,1)<.3)continue;const a9=a+(hs(u,v,2)-.5)*1.2,c9=c+(hs(u,v,3)-.5)*1.2;
        const lo=Math.ceil((a9+y0-oy)/cv-.5),hi=Math.floor((c9+y0-oy)/cv-.5)+1;if(hi>lo){LO[u+NU*v]=lo;HI[u+NU*v]=hi;}}}
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,2,1],function(kind,u,v,sg){return kind==='w'&&sg>0?JM.herbe:1;},null,12);
    JADE.pont.mF=jadeMonument(root,gF,jadeRepere(o,b,t,cv),.81,M9);for(const m of JADE.pont.mF)m.visible=false;JADE.pont.pres=false;JADE.pont.triF=gF.index.count/3;}catch(e){console.warn('pont fin',e);}}
}
