/* ===== LES AUTRES PLANÈTES DE L'ORBITE (2026-10-22, Sacha : « refais l'orbite avec plusieurs planètes de tailles différentes (Mars, Jupiter...) ») =====
   Mars (variante midi) et Jupiter (variante soir) n'existaient que comme LA planète du niveau, posée sous la route : on ne les voyait pas. Ici, en plus de la grande
   planète, CINQ astres dans le CIEL HAUT, de tailles très différentes : JUPITER (le géant), SATURNE (bandes pâles, son anneau mince), MARS (rouille), NEPTUNE (bleu), MERCURE (un caillou gris).
   Chacun est une sphère peinte (les peintres de Mars et de Jupiter sont ceux de la planète du niveau : maps/continuite.js), posée à 6,4 km sur le plan lointain comme le globe
   (z = w, test de profondeur, aucune écriture) : la route, la caisse, les nuages la cachent. Placés dans le repère de la visée LISSÉE (un gros retard : ils glissent comme des
   astres, ne collent jamais à l'écran), AU-DESSUS de la visée : la caméra de poursuite plonge, le haut du cadre reste du ciel. La planète déjà peinte en grand n'est pas doublée.
   Éclairage du globe (la face visible est toujours le jour, une nuit bleutée sur le bord), liseré d'atmosphère à la couleur de chacun. 5 sphères, 5 appels, aucun tirage dans `rnd`.
   `?planetes=0` : sans (comme avant). Banc : `dbgPlanetesCiel()` (états), `dbgPlanetesCiel({vue:'nom'})` (regarde cet astre). */
const PLX_ON=!/[?&]planetes=0\b/.test(location.search);
const PLX_D=6400;
const PLX={liste:[],g:null,ok:false,f:new THREE.Vector3(),fo:false,r:new THREE.Vector3(),u:new THREE.Vector3(),d:new THREE.Vector3(),
  DEF:[ /* nom · peintre · teinte (rentrée sombre : le grade final rallume) · liseré · rayon apparent (°) · cap (° à droite de la visée) · hauteur (° au-dessus) · inclinaison */
    {nom:'jupiter',teinte:0x6c6050,rim:[.80,.62,.40],rad:7.2,yaw:38,haut:13,incl:.1},
    {nom:'mars',teinte:0x7c6a62,rim:[.82,.50,.30],rad:2.7,yaw:-30,haut:20,incl:.4},
    {nom:'saturne',teinte:0x74684c,rim:[.90,.80,.55],rad:4.6,yaw:-12,haut:24,incl:.3,anneau:1},
    {nom:'neptune',teinte:0x4c6890,rim:[.35,.58,1.],rad:1.9,yaw:20,haut:29,incl:.5},
    {nom:'mercure',teinte:0x6c6a68,rim:[.70,.68,.64],rad:.95,yaw:-48,haut:10,incl:.2}]};
function plxPeint(nom,x,W,H){
  if(nom==='mars'){planetesMars(x,W,H);return;}
  if(nom==='jupiter'){planetesJupiter(x,W,H);return;}
  const R=planetesAlea(nom==='saturne'?1610:nom==='neptune'?8030:5150);
  if(nom==='saturne'){x.fillStyle='#d8c08a';x.fillRect(0,0,W,H);planetesBandes(x,W,H,R,['#f0e0b4','#d2b47c','#b8955c','#f6ebc8','#c8a56c'],17,4,34);return;} /* des bandes douces, peu de contraste */
  if(nom==='neptune'){x.fillStyle='#3a62c0';x.fillRect(0,0,W,H);planetesBandes(x,W,H,R,['#4a78d6','#2f55b0','#5a8ae0','#3a62c0'],9,5,24);
    x.fillStyle='rgba(20,34,90,.55)';x.beginPath();x.ellipse(W*.3,H*.42,52,26,0,0,6.2832);x.fill();return;} /* la Grande Tache sombre */
  /* MERCURE : un gris de roche, des cratères */
  const fond=x.createLinearGradient(0,0,0,H);fond.addColorStop(0,'#9a9690');fond.addColorStop(.5,'#8a8680');fond.addColorStop(1,'#9a9690');x.fillStyle=fond;x.fillRect(0,0,W,H);
  for(let i=0;i<150;i++){const cx=R()*W,cy=30+R()*(H-60),r=4+R()*R()*34,cl=R()<.5;
    x.fillStyle=cl?'rgba(60,58,56,.35)':'rgba(190,186,178,.30)';x.beginPath();x.arc(cx,cy,r,0,6.2832);x.fill();
    x.strokeStyle='rgba(215,210,200,.35)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,r*.92,.3,2.6);x.stroke();}
}
function plxBati(){ /* UNE fois, quand l'orbite s'ouvre : les toiles (1024 × 512, relâchées après l'envoi) et les sphères */
  PLX.ok=true;PLX.g=new THREE.Group();PLX.g.visible=false;
  const W=1024,H=512;
  for(const d of PLX.DEF){
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');plxPeint(d.nom,x,W,H);
    const tex=new THREE.CanvasTexture(cv);tex.wrapS=THREE.RepeatWrapping;texLibere(tex);
    const R=PLX_D*Math.tan(d.rad*Math.PI/180);
    const m=new THREE.MeshBasicMaterial({map:tex,fog:false,color:d.teinte});
    m.depthWrite=false;m.depthTest=true;
    const rim=new THREE.Vector3(d.rim[0],d.rim[1],d.rim[2]);
    m.onBeforeCompile=function(sh){
      sh.uniforms.uRim9={value:rim};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWN9,vWP9,vL9;')
        .replace('#include <project_vertex>','#include <project_vertex>\nvWN9=normalize(mat3(modelMatrix)*normal);vWP9=(modelMatrix*vec4(transformed,1.)).xyz;'+
          'vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vL9=normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);'+
          'gl_Position.z=gl_Position.w;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uRim9;\nvarying vec3 vWN9,vWP9,vL9;')
        .replace('#include <envmap_fragment>',[
          '{ vec3 N=normalize(vWN9),V=normalize(cameraPosition-vWP9);float ndl=dot(N,normalize(vL9));',
          '  float jour=smoothstep(-.20,.32,ndl);vec3 c0=outgoingLight;',
          '  vec3 c=mix(c0*vec3(.26,.28,.40)+vec3(.003,.005,.016),c0*1.12,jour);',
          '  c+=uRim9*pow(1.-max(dot(N,V),0.),3.)*(.10+.34*jour);',
          '  outgoingLight=c; }',
          '#include <envmap_fragment>'].join('\n'));
    };
    m.customProgramCacheKey=function(){return 'planetesCiel1';};
    const s=new THREE.Mesh(new THREE.SphereGeometry(R,36,24),m);s.renderOrder=21;s.rotation.z=d.incl;s.frustumCulled=false;
    const un=new THREE.Group();un.add(s);un.userData={d:d,globe:s,R:R};
    if(d.anneau){ /* l'anneau de Saturne : un disque mince, deux liserés clairs, penché comme le globe */
      const ac=document.createElement('canvas');ac.width=256;ac.height=2;const a=ac.getContext('2d');
      const gr=a.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.30,'rgba(214,196,150,.0)');gr.addColorStop(.34,'rgba(220,202,156,.75)');gr.addColorStop(.52,'rgba(190,170,126,.55)');gr.addColorStop(.58,'rgba(40,30,20,.12)');gr.addColorStop(.64,'rgba(222,206,164,.7)');gr.addColorStop(.92,'rgba(214,196,150,.0)');gr.addColorStop(1,'rgba(0,0,0,0)');
      a.fillStyle=gr;a.fillRect(0,0,256,2);
      const at=new THREE.CanvasTexture(ac);
      const rg=new THREE.RingGeometry(R*1.25,R*2.25,72,1);const pos=rg.attributes.position,uv=rg.attributes.uv;
      for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-R*1.25)/(R*1.0),.5);}
      const am=new THREE.MeshBasicMaterial({map:at,transparent:true,side:THREE.DoubleSide,depthWrite:false,fog:false,color:0x9c8e6c});
      am.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ngl_Position.z=gl_Position.w;');};
      am.customProgramCacheKey=function(){return 'planetesCielAnneau1';};
      const ar=new THREE.Mesh(rg,am);ar.rotation.x=-Math.PI/2+.34;ar.rotation.z=.18;ar.renderOrder=22;ar.frustumCulled=false;un.add(ar);
      un.userData.anneau=ar;
    }
    PLX.g.add(un);PLX.liste.push(un);
  }
  scene.add(PLX.g);
}
function plxTick(t,dt,ok){ /* appelée par orbiteTick à chaque image (zéro allocation) */
  if(!PLX_ON)return;
  if(!ok){if(PLX.g)PLX.g.visible=false;return;}
  if(!PLX.ok)plxBati();
  const f=PLX.d;camera.getWorldDirection(f);
  if(!PLX.fo){PLX.f.copy(f);PLX.fo=true;}else PLX.f.lerp(f,Math.min(1,dt*.5)).normalize(); /* la visée lissée : l'astre glisse */
  PLX.r.crossVectors(PLX.f,ORB.haut).normalize();PLX.u.crossVectors(PLX.r,PLX.f).normalize();
  const e=Math.max(0,Math.min(1,LVL.espace)),main=planetGroup.userData.peint;
  PLX.g.visible=e>.02;
  for(const un of PLX.liste){
    const d=un.userData.d,Y=d.yaw*Math.PI/180,P=d.haut*Math.PI/180,cp=Math.cos(P);
    un.visible=d.nom!==main; /* Mars sous le grand Mars, non */
    un.position.copy(camera.position)
      .addScaledVector(PLX.f,PLX_D*Math.cos(Y)*cp).addScaledVector(PLX.r,PLX_D*Math.sin(Y)*cp).addScaledVector(PLX.u,PLX_D*Math.sin(P));
    un.scale.setScalar(Math.max(.02,e));
    un.userData.globe.rotation.y=t*.02;
  }
}
window.dbgPlanetesCiel=function(o){ /* banc : les états ; {vue:'nom'} regarde l'astre et re-rend une image */
  const r=PLX.liste.map(function(un){return {nom:un.userData.d.nom,vis:un.visible&&PLX.g.visible,R:Math.round(un.userData.R),pos:un.position.toArray().map(Math.round)};});
  if(o&&o.vue){const un=PLX.liste.find(function(u){return u.userData.d.nom===o.vue;});if(un){camera.lookAt(un.position);camera.updateMatrixWorld();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}}
  return r;};
