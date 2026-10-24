/* ===== LA POUSSIÈRE DU CANYON (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map ») =====
   Le détail vivant du canyon : des grains de poussière dorée en suspension dans une boîte de 130 m qui suit la caméra (devant elle : dans la gorge, les parois cachent le reste), poussés par un vent
   lent. TOUT le mouvement est dans le sommet (`uTime`) : une seule instance (UN appel de dessin), aucun tirage du jeu (le générateur est local, une graine
   fixe), aucune allocation par image. Ils brillent quand le soleil est bas (le contre-jour : la poussière dans les rais), se ternissent en argent la nuit,
   s'éteignent sous la pluie, et s'effacent près de la caméra (jamais un grain entre elle et la caisse). Leur nombre suit le palier (`PAL.B.cyPous`).
   La matière du RELIEF, elle, a gagné ses cannelures, ses fissures, ses filons d'or et sa lueur d'altitude dans CY_FS (voir LA ROCHE VIVANTE). */
const CY_POUS_VS=['attribute vec4 aR;uniform float uTime,uK,uPx;uniform vec3 uBoxC,uCol;varying float vA;varying vec3 vC;',
  'void main(){vec3 B=vec3(130.,50.,130.);',
  '  vec3 pa=vec3(1.7,.30,.9)*uTime*(.6+.8*aR.w)+vec3(sin(uTime*.7+aR.y*9.)*2.5,sin(uTime*.9+aR.x*7.)*1.8,cos(uTime*.6+aR.z*8.)*2.5);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  vec4 mv=viewMatrix*vec4(pos,1.);float d=max(-mv.z,.001);',
  '  vA=smoothstep(0.,.10,e)*uK*(.35+.65*aR.w)*smoothstep(14.,32.,d)*(1.-smoothstep(100.,140.,d));vC=uCol*(.8+.4*aR.z);',
  '  gl_Position=projectionMatrix*mv;gl_PointSize=vA<.004||mv.z>0.?0.:(.5+aR.z*.9)*uPx*300./d;}'].join('\n');
const CY_POUS_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5),a=smoothstep(.5,0.,d);a*=a;if(vA*a<.004)discard;gl_FragColor=vec4(vC,min(1.,vA*a*1.6));}'].join('\n');
const CY_POUS={p:null,v:new THREE.Vector3()};
function cyPousPoints(){if(CY_POUS.p)return CY_POUS.p;
  const n=PAL.b('cyPous',160),R=mulberry32(0xD057C4),g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
  const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uK:{value:0},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uCol:{value:new THREE.Color()}},
    vertexShader:CY_POUS_VS,fragmentShader:CY_POUS_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});m.dispose=function(){};
  const p=new THREE.Points(g,m);p.name='canyon poussière';p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return CY_POUS.p=p;}
/* chaque image (depuis canyonTick) : la force (le fondu du niveau × le sec × le soleil bas), la couleur (celle du soleil, poudrée d'or), le centre de la boîte */
function cyPousTick(dt,c){
  const k=CY.on&&started&&!gameOver?(LVL.canyon||0):0,P9=CY_POUS.p;
  if(!(k>.01)){if(P9&&P9.visible)P9.visible=false;return;}
  const p9=cyPousPoints(),u=p9.material.uniforms,wet=c.cyQ?c.cyQ[2]:0,bas=Math.max(0,Math.min(1,1-(SUN_DIR.y-.04)/.46)),nuit=Math.min(1,LVL.nuit||0);
  const k9=k*(1-wet)*(.5+.5*bas)*(1-.45*nuit);p9.visible=k9>.02;if(!p9.visible)return;
  u.uK.value=k9;if(!paused)u.uTime.value=(u.uTime.value+dt)%600;u.uPx.value=renderer.getPixelRatio();
  u.uCol.value.setRGB(sun.color.r*.7+.30,sun.color.g*.7+.24,sun.color.b*.7+.14).multiplyScalar(.85);
  camera.getWorldDirection(CY_POUS.v);u.uBoxC.value.copy(camera.position).addScaledVector(CY_POUS.v,45);}
