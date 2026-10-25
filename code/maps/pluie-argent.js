/* ======================= LA PLUIE D'ARGENT v2 — `PLA` (2026-10-13, Léo : « ramène la pluie d'argent, et augmente la qualité ») =======================
   L'averse de glyphes (startMoneyRain : des « $ € ¥ » en sprites, 3 s) ne tombait plus que passé 4 000 $ × ECO3.gain dans UNE partie — on ne
   la voyait plus. Elle revient en VRAIS objets : les billets de la pluie de richesse (la série de sept couleurs, recto dessiné, + le billet
   ₿ de CRYPTOCITY) qui tombent en FEUILLE MORTE ou en CULBUTE et se courbent dans l'air, des pièces ₿ et Ξ en métal qui voilent et FLASHENT
   au soleil, des confettis verts et or. Tout est calculé par la puce : chaque objet a sa place (aO) et son caractère (aR) une fois pour
   toutes ; le sommet calcule la chute, le vent, la rotation, la flexion et la lumière (soleil, ciel, reflet), et replie l'objet dans une
   BOÎTE de 120 × 70 × 160 m qui suit la caméra (le monde est rempli à l'infini, on traverse le rideau à n'importe quelle vitesse) ; les bords
   de la boîte et l'objectif fondent l'objet en trame (aucun tri, aucune transparence). Deux appels de dessin, zéro calcul par objet et par
   image. `PLA.dens` (0 → 1, une part des objets) : à CRYPTOCITY une pluie de fond (.5), une AVERSE (1) à chaque NOUVEL ATH et à chaque
   pièce géante traversée ; ailleurs elle remplace l'averse de glyphes (même déclencheur : startMoneyRain). */
const PLA={N:ALLEGE?900:1400,NP:ALLEGE?220:360,B:new THREE.Vector3(120,70,160),dens:0,surge:0,mB:null,mP:null,u:null,c:new THREE.Vector3(),f:new THREE.Vector3()};
PAL.B.memTexBillets=[.5,1,1]; // (2026-10-14, passe perf mobile) l'échelle de l'atlas des billets de la PLUIE : 1024 × 384 au palier ancien (un billet qui tombe fait quelques dizaines de pixels à l'écran) — 8,4 Mo de puce → 2,1 Mo ; paliers 1-2 : 2048 × 768 comme avant
function plaTexBillets(){ // l'atlas 4 × 3 : la série des sept billets (pluie de richesse) + le billet ₿ · la rangée du bas : les confettis
  if(PLA.texB)return PLA.texB;
  const kT=PAL.b('memTexBillets',1),cv=document.createElement('canvas');cv.width=2048*kT;cv.height=768*kT;const x=cv.getContext('2d');if(kT!==1)x.scale(kT,kT); // (2026-10-14, passe perf mobile) même dessin, mêmes coordonnées, toile taillée au palier
  for(let k=0;k<8;k++){let t=null;try{t=k<7?richTexBillet(RICH_BILLETS[k%RICH_BILLETS.length]):plaBilletBtc();}catch(e){} // (2026-10-16) la série a 5 billets : les cases restantes la répètent
    if(t&&t.image)x.drawImage(t.image,(k%4)*512,Math.floor(k/4)*256+10,512,236);if(t&&t.image)toileRend(t.image);if(t&&t.dispose)t.dispose();} // (2026-10-14, passe perf mobile) les 8 toiles de travail 512 × 236 (3,9 Mo) rendues tout de suite : elles ne vont jamais à la puce
  ['#2bff88','#ffd23e','#ffffff','#ff9a2e'].forEach(function(c,i){const g=x.createLinearGradient(i*512,512,i*512+512,768);g.addColorStop(0,c);g.addColorStop(1,'#ffffff');x.fillStyle=c;x.fillRect(i*512+40,552,432,176);x.globalAlpha=.35;x.fillStyle=g;x.fillRect(i*512+40,552,432,60);x.globalAlpha=1;});
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;PLA.texB=texLibere(t);return t; // (2026-10-14, passe perf mobile) 2048 × 768 : 6,3 Mo rendus après l'envoi (paliers 0-1)
}
function plaBilletBtc(){ // le billet de CRYPTOCITY : vert billet et or, un ₿ dans la rosace, « 1 BITCOIN »
  return richCv(512,236,function(x,w,h){
    const G=x.createLinearGradient(0,0,w,h);G.addColorStop(0,'#0a3a1c');G.addColorStop(.55,'#127a3a');G.addColorStop(1,'#0c4f26');x.fillStyle=G;x.fillRect(0,0,w,h);
    x.strokeStyle='rgba(160,255,200,.12)';x.lineWidth=1;for(let k=0;k<26;k++){x.beginPath();for(let i=0;i<=w;i+=6)x.lineTo(i,h/2+Math.sin(i*.03+k*.5)*h*.42*Math.sin(k*.21+1));x.stroke();}
    x.strokeStyle='rgba(255,215,94,.6)';x.lineWidth=3;x.strokeRect(10,10,w-20,h-20);x.lineWidth=1;x.strokeRect(18,18,w-36,h-36);
    for(let i=0;i<14;i++){x.strokeStyle='rgba(255,215,94,'+(.07+i*.014)+')';x.beginPath();x.arc(118,118,62-i*4,0,6.2832);x.stroke();}
    cryptoPicto(x,'btc',118,118,92,'#ffb347');
    x.fillStyle='rgba(255,236,170,.9)';x.font='44px "Press Start 2P",monospace';x.textAlign='left';x.textBaseline='middle';x.fillText('1',30,48);x.textAlign='right';x.fillText('1',w-30,h-44);
    x.font='14px "Press Start 2P",monospace';x.textAlign='center';x.fillStyle='rgba(255,236,170,.85)';x.fillText('CASH CAR',w*.6,h*.42); /* (2026-10-14, revue des idées de Léo) le niveau CRYPTOCITY est retiré : le billet ₿ de la pluie d'argent, lui, pleut partout — il porte la marque du jeu */
    x.font='7px "Press Start 2P",monospace';x.fillStyle='rgba(200,255,220,.6)';x.fillText('1 BITCOIN · TO THE MOON',w*.6,h*.56);
    const Bd=x.createLinearGradient(w*.78,0,w*.86,0);Bd.addColorStop(0,'rgba(255,215,94,0)');Bd.addColorStop(.5,'rgba(255,230,140,.55)');Bd.addColorStop(1,'rgba(255,215,94,0)');x.fillStyle=Bd;x.fillRect(w*.78,0,w*.08,h);});
}
function plaTexPieces(){ // l'atlas des pièces : en haut la ₿ (la pièce de la pluie de richesse), en bas l'Ξ d'argent bleuté
  if(PLA.texP)return PLA.texP;
  const cv=document.createElement('canvas');cv.width=512;cv.height=512;const x=cv.getContext('2d');
  try{const b=richTexBtc();x.drawImage(b[0].image,0,0,512,256);for(const t of b){toileRend(t.image);t.dispose();}}catch(e){x.fillStyle='#e8a030';x.fillRect(0,0,512,256);}
  x.fillStyle='#9aa6c8';x.fillRect(0,256,512,256);
  for(const cx of [128,384]){const cy=256+122,R=120;const G=x.createRadialGradient(cx-38,cy-40,10,cx,cy,R);G.addColorStop(0,'#f4f7ff');G.addColorStop(1,'#7c88b0');x.fillStyle=G;x.beginPath();x.arc(cx,cy,R,0,6.283);x.fill();
    x.lineWidth=8;x.strokeStyle='rgba(255,255,255,.4)';x.beginPath();x.arc(cx,cy,R*.95,0,6.283);x.stroke();
    const O=x.createRadialGradient(cx-25,cy-23,8,cx,cy,R*.79);O.addColorStop(0,'#8f7dff');O.addColorStop(1,'#3b2fa8');x.fillStyle=O;x.beginPath();x.arc(cx,cy,R*.79,0,6.283);x.fill();
    cryptoPicto(x,'eth',cx,cy,150,'#eef1ff');}
  x.fillStyle='#c9d2ee';x.fillRect(0,500,512,12);x.fillStyle='#e8b048';x.fillRect(0,244,512,12);for(let i=0;i<512;i+=8){x.fillStyle='rgba(40,28,8,.3)';x.fillRect(i,244,4,12);x.fillStyle='rgba(30,30,60,.3)';x.fillRect(i,500,4,12);}
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;PLA.texP=t;return t;
}
// une PIÈCE : deux faces (le disque gauche de l'atlas en haut, le droit en bas… de sa moitié) et la tranche — faces perpendiculaires à y
function plaGeoPiece(seg,ep){
  const P=[],N=[],U=[],h=ep/2,face=function(y,ny,cu){const cx=cu,cy=.523,ru=.234,rv=.469,s=ny>0?-1:1,su=ny>0?1:-1; // (le dessus tourné vers le haut, le dessous vers le bas ; aucune face en miroir)
    for(let i=0;i<seg;i++){const a0=i/seg*6.2832,a1=(i+1)/seg*6.2832;
      P.push(0,y,0,Math.cos(a0),y,Math.sin(a0)*s,Math.cos(a1),y,Math.sin(a1)*s);
      for(let k=0;k<3;k++)N.push(0,ny,0);
      U.push(cx,cy,cx+Math.cos(a0)*ru*su,cy+Math.sin(a0)*rv*su,cx+Math.cos(a1)*ru*su,cy+Math.sin(a1)*rv*su);}};
  face(h,1,.25);face(-h,-1,.75);
  for(let i=0;i<seg;i++){const a0=i/seg*6.2832,a1=(i+1)/seg*6.2832,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    P.push(c0,h,s0,c1,-h,s1,c0,-h,s0,c0,h,s0,c1,h,s1,c1,-h,s1);
    N.push(c0,0,s0,c1,0,s1,c0,0,s0,c0,0,s0,c1,0,s1,c1,0,s1);
    const u0=i/seg,u1=(i+1)/seg;U.push(u0,.04,u1,.005,u0,.005,u0,.04,u1,.04,u1,.005);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
  g.computeBoundingSphere();return g;
}
function plaInstances(base,n,piece){ // la géométrie instanciée : aO = la place dans la boîte + la phase · aR = vitesse, culbute, taille, case de l'atlas
  const g=new THREE.InstancedBufferGeometry();g.index=base.index;for(const k in base.attributes)g.setAttribute(k,base.attributes[k]);
  const aO=new Float32Array(n*4),aR=new Float32Array(n*4),rnd=mulberry32(piece?0xC01A5:0xB1115);
  for(let i=0;i<n;i++){aO[i*4]=rnd();aO[i*4+1]=rnd();aO[i*4+2]=rnd();aO[i*4+3]=rnd();
    const conf=!piece&&rnd()<.24; // un sur quatre : un confetti
    aR[i*4]=.6+rnd()*.8;aR[i*4+1]=rnd();
    aR[i*4+2]=piece?.62+rnd()*.38:conf?.16+rnd()*.12:1.45+rnd()*.7; // la taille : un billet 1,45-2,15 m (lisible en course), une pièce 0,62-1 m de rayon
    aR[i*4+3]=piece?(rnd()<.62?0:1):conf?8+((rnd()*4)|0):(rnd()<.2?7:(rnd()*7)|0);} // la case : pièce ₿/Ξ · billets 0-7 · confettis 8-11
  g.setAttribute('aO',new THREE.InstancedBufferAttribute(aO,4));g.setAttribute('aR',new THREE.InstancedBufferAttribute(aR,4));g.instanceCount=n;
  return g;
}
const PLA_VS=
  'uniform float uT9,uDens9,uFall9;uniform vec3 uC9,uB9,uSunD9,uSunC9,uAmb9,uGnd9;attribute vec4 aO,aR;varying vec3 vLit9,vSpec9;varying float vFade9;\n'+
  'mat3 rX9(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 rY9(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}mat3 rZ9(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}\n';
const PLA_BEGIN=
  'float ph9=aO.w*6.2832,tt9=uT9*aR.x+ph9,cul9=step(.72,aR.y);'+
  'vec3 p9=aO.xyz*uB9+vec3(sin(tt9*.9)*2.4,-uFall9*(.78+.44*fract(aO.w*7.31))*uT9,cos(tt9*.7)*2.4);'+
  'vec3 rel9=mod(p9-uC9+.5*uB9,uB9)-.5*uB9,w9=uC9+rel9,e9=abs(rel9)/(.5*uB9);'+
  'float d9=distance(w9,cameraPosition);vFade9=(1.-smoothstep(.72,.97,max(e9.x,max(e9.y,e9.z))))*smoothstep(2.,5.5,d9)*step(fract(aO.w*91.7),uDens9);'+
  '\n#ifdef PIECE9\nmat3 R9=rY9(tt9*.4)*rX9(tt9*(5.+5.*aR.y)+ph9)*rZ9(.4*sin(tt9));vec3 lp9=position;\n'+
  '#else\nmat3 R9=rY9(tt9*.35+ph9)*rX9(mix(sin(tt9*.9)*.95,tt9*2.6,cul9))*rZ9(mix(cos(tt9*.8)*.5,tt9*.7,cul9));vec3 lp9=position;lp9.y+=sin(lp9.x*2.8+uT9*6.+ph9)*.07+lp9.x*lp9.x*.12*sin(tt9*1.3);\n#endif\n'+
  'vec3 transformed=w9+R9*(lp9*aR.z*step(.001,vFade9));\n'+
  'vec3 n9=normalize(R9*normal),v9=normalize(cameraPosition-w9);if(dot(n9,v9)<0.)n9=-n9;'+
  'float l9=dot(n9,uSunD9);'+
  '\n#ifdef PIECE9\nvLit9=uAmb9*mix(.55,1.,n9.y*.5+.5)+uGnd9*.25+uSunC9*max(l9,0.);vec3 h9=normalize(uSunD9+v9);vSpec9=uSunC9*(pow(max(dot(n9,h9),0.),70.)*3.2+pow(max(dot(n9,h9),0.),8.)*.25);\n'+
  '#else\nvLit9=uAmb9*mix(.6,1.,n9.y*.5+.5)+uGnd9*.2+uSunC9*(max(l9,0.)+max(-l9,0.)*.35);vec3 h9=normalize(uSunD9+v9);vSpec9=uSunC9*pow(max(dot(n9,h9),0.),24.)*.22;\n#endif\n'+
  /* (2026-10-15, Sacha : « les particules d'argent, de crypto, en mode confettis m'apparaissent en NOIR ») LE PLANCHER DE LUMIÈRE. La pluie
     ne vivait QUE de la lumière de la scène : de nuit (ville × nuit, mesuré au banc) soleil et ciel tombent presque à zéro, billets, pièces ₿/Ξ
     et confettis sortaient en silhouettes NOIRES — et Léo, qui la voyait de jour, en couleurs. Comme les pièces de la route (pickMat ÉMET),
     ce qui rapporte garde sa couleur : on ajoute le BLANC qui manque pour que la lumière reçue ne descende jamais sous .8 de luminance.
     De jour (soleil + ciel bien au-dessus), rien ne change. */
  '{float lu9=dot(vLit9,vec3(.299,.587,.114));vLit9+=vec3(max(0.,.8-lu9));}\n';
const PLA_UV=
  '#ifdef USE_UV\n#ifdef PIECE9\nvUv.y=vUv.y*.5+.5-.5*step(.5,aR.w);\n#else\n{float c9=aR.w;vUv=(vUv+vec2(mod(c9,4.),2.-floor(c9/4.)))/vec2(4.,3.);}\n#endif\n#endif\n';
function plaMat(piece){
  const m=new THREE.MeshBasicMaterial({map:piece?plaTexPieces():plaTexBillets(),side:THREE.DoubleSide,alphaTest:piece?0:.5});
  m.defines=piece?{PIECE9:''}:{};
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,PLA.u);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+PLA_VS).replace('#include <begin_vertex>',PLA_BEGIN)
    sh.vertexShader=sh.vertexShader.replace('#include <morphtarget_vertex>',PLA_UV+'#include <morphtarget_vertex>');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLit9,vSpec9;varying float vFade9;')
      .replace('#include <alphatest_fragment>','if(vFade9<fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))))discard;\n#include <alphatest_fragment>\ndiffuseColor.rgb*=vLit9;')
      .replace('#include <envmap_fragment>','#include <envmap_fragment>\noutgoingLight+=vSpec9;');};
  m.customProgramCacheKey=function(){return piece?'plaPiece1':'plaBillet1';};m.dispose=function(){};
  return m;
}
function plaInit(){
  if(PLA.mB)return;
  PLA.u={uT9:{value:0},uDens9:{value:0},uFall9:{value:2.6},uC9:{value:new THREE.Vector3()},uB9:{value:PLA.B},uSunD9:{value:new THREE.Vector3().copy(SUN_DIR)},
    uSunC9:{value:new THREE.Vector3(1,1,1)},uAmb9:{value:new THREE.Vector3(.5,.5,.5)},uGnd9:{value:new THREE.Vector3(.2,.2,.2)}};
  const gb=new THREE.PlaneGeometry(1,.46,6,1);gb.rotateX(-Math.PI/2); // le billet, couché (une feuille qui tombe), coupé en six pour se courber
  const mB=new THREE.Mesh(plaInstances(gb,PLA.N,false),plaMat(false));
  const mP=new THREE.Mesh(plaInstances(plaGeoPiece(14,.16),PLA.NP,true),plaMat(true));
  for(const m of [mB,mP]){m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.renderOrder=2;scene.add(m);}
  PLA.mB=mB;PLA.mP=mP;
}
function plaSurge(s){plaInit();PLA.surge=Math.max(PLA.surge,s||4);}
function plaTick(dt,sim){
  if(!PLA.mB){if(!(PLA.surge>0)&&!cryptoOn())return;plaInit();}
  const cr9=cryptoOn()&&started&&!gameOver,cible=PLA.surge>0?1:cr9?(CITY.dz&&CITY.dz.genre==='crypto'?CITY.dz.pluie:.5):0; /* (2026-10-20, LE DÉCOR AU HASARD) la pluie de fond tirée : fine, normale, averse */
  if(sim){PLA.surge=Math.max(0,PLA.surge-dt);PLA.dens+=(cible-PLA.dens)*Math.min(1,dt*(cible>PLA.dens?2.2:.9));PLA.u.uT9.value+=dt;}
  if(!started||gameOver&&PLA.surge<=0)PLA.dens=Math.max(0,PLA.dens-dt*.8);
  const vis=PLA.dens>.004&&!PLA.off;PLA.mB.visible=PLA.mP.visible=vis;if(!vis)return; // PLA.off : le banc la coupe (dbgCrypto('sansPluie'))
  const U=PLA.u;U.uDens9.value=PLA.dens;
  camera.getWorldDirection(PLA.f);U.uC9.value.copy(camera.position).addScaledVector(PLA.f,PLA.B.z*.3);U.uC9.value.y+=PLA.B.y*.12;
  U.uSunD9.value.copy(sun.position).normalize();
  U.uSunC9.value.set(sun.color.r,sun.color.g,sun.color.b).multiplyScalar(sun.intensity*.85);
  U.uAmb9.value.set(hemi.color.r,hemi.color.g,hemi.color.b).multiplyScalar(hemi.intensity*.9);
  U.uGnd9.value.set(hemi.groundColor.r,hemi.groundColor.g,hemi.groundColor.b).multiplyScalar(hemi.intensity);
}
