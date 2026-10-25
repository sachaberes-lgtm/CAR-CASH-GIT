/* ==========================================================================
   LE PORTAIL DE CUBES (2026-10-17, Léo : « que les portails qui t'emmènent à la prochaine map soient une accumulation de cubes bien
   disposés, stylés, une sorte de portail au bout de la route, avec un peu de transparence, mais qui te laisse comprendre que tu vas
   aller ailleurs — et qui te donne une vue sur où tu vas aller »).
   ----------------------------------------------------------------------------
   L'ovule rose (une sphère additive de 55 m, la même pour toutes les maps) devient un ANNEAU DE CUBES DE VERRE posé en travers du bout
   de la route — un cercle tracé au pixel, trois couches (derrière, le plan, quelques cubes devant), des JOINTS de lumière entre les cubes
   (la recette du VITRAIL : chaque cube à ~90 % de sa case), une ONDE qui fait le tour, des cubes qui flottent autour et d'autres qui
   s'échappent de la fenêtre vers la caisse. Ses COULEURS sont celles de la map d'en face (jade et or, lave, glace, or et argent…).
   Dans l'anneau, LA FENÊTRE : la CARTE POSTALE de la map d'en face (`assets/portail/<map>-<météo>.webp`, la vue de la caméra au départ
   de cette map, tirée par le banc), lue PAR LA DIRECTION DU REGARD — c'est une fenêtre, pas une affiche : de loin on n'en voit que le
   centre, en approchant elle s'ouvre, l'horizon d'en face reste à hauteur d'œil. Vers le bord, l'image se PIXELISE en touchant les cubes.
   ⚠ La map d'en face est TIRÉE D'AVANCE (`portDest` remplit SF.tirage[zone+1] dès la construction de la piste ; lvlChoisir la reprend
   au portail) : c'est bien là qu'on arrive.
   Coût : 2 appels de dessin (les cubes en UNE instance, la fenêtre), ~3 k triangles, aucune lumière ajoutée (la PointLight du portail
   reste : le compte des lumières ne bouge pas), deux programmes compilés au menu, une image de 640² chargée par portail.
   L'ovule rose d'avant ne reste que dans le PARC (Freestyle). Console : `dbgPortailCubes()`, `dbgVuePortail(d,h)`, `dbgCartePostale()`.
   ========================================================================== */
const PCUBE_VITE=/[?&]portail=vite\b/.test(location.search); // (essai) `?portail=vite` : 2,5 s après chaque départ, la caisse est posée à 450 m du portail — pour enchaîner les passages sans rouler 2 minutes
const PCUBE={on:false,S:5.2,Ri:44,Ro:54,H:20,grp:null,cub:null,mem:null,halo:null,mU:null,cU:null,G:null,n:0,dest:null,cle:'',tex:null,img:{},
  inv:new THREE.Matrix3(),x:new THREE.Vector3(),y:new THREE.Vector3(),z:new THREE.Vector3(),M:new THREE.Matrix4(),asp:0};
/* LES COULEURS DE L'AUTRE CÔTÉ : [cube A, cube B, la lumière de la fenêtre] — la ville a les siennes par teinte */
const PCUBE_PAL={nuages:[0xff5ec8,0x5ee6ff,0xffd0f4],orage:[0x8a7bff,0x5ee6ff,0xd8d0ff],jade:[0x2fd39a,0xffd75e,0xb8ffe0],foret:[0x5fd35a,0xffb347,0xd8ff9a],
  crypto:[0xffd75e,0xe8eef8,0xfff1b0],espace:[0x8a5bff,0xe8e0ff,0xc8b0ff],
  canyon:[0xff9a3d,0xd8442a,0xffd09a],grotte:[0x3ef0ff,0xa45bff,0xc8fbff],paris:[0xffd75e,0x5e8bff,0xfff0c0],ville:[0xb04cff,0xff3ec8,0xf0b0ff],
  'ville-violet':[0xb04cff,0xff3ec8,0xf0b0ff],'ville-vert':[0x3dff9a,0x00d2ff,0xb8ffe0],'ville-jaune':[0xffd23d,0xff8a1c,0xfff0b0],'ville-bleu':[0x3d8bff,0x5ee6ff,0xc0e0ff],vitree:[0x2f8cff,0xffffff,0xcfe8ff],dunes:[0xffb43d,0x1fd6ff,0xffe2a0]}; // (2026-10-18) la VILLE VITRÉE : verre bleu, blanc, glace
/* LES CARTES POSTALES LIVRÉES (assets/portail/) — la liste est réécrite par le banc qui les tire (outils : carte-postale.py) */
const PCUBE_CP=new Set(['dunes-matin','dunes-midi','dunes-nuit','dunes-orage','dunes-pluie','dunes-soir','canyon-matin','canyon-midi','canyon-nuit','canyon-orage','canyon-pluie','canyon-soir','crypto-matin','crypto-midi','crypto-nuit','crypto-soir','espace-matin','espace-midi','espace-soir','foret-matin','foret-midi','foret-nuit','foret-orage','foret-pluie','foret-soir','grotte-matin','grotte-midi','grotte-nuit','grotte-soir','jade-matin','jade-midi','jade-nuit','jade-orage','jade-pluie','jade-soir','nuages-matin','nuages-midi','nuages-nuit','nuages-orage','nuages-pluie','nuages-soir','paris-soir','ville-brouillard-bleu','ville-brouillard-jaune','ville-brouillard-vert','ville-brouillard-violet','ville-nuit-bleu','ville-nuit-jaune','ville-nuit-vert','ville-nuit-violet','ville-orage-bleu','ville-orage-jaune','ville-orage-vert','ville-orage-violet','ville-pluie-bleu','ville-pluie-jaune','ville-pluie-vert','ville-pluie-violet','vitree-matin','vitree-midi','vitree-nuit','vitree-pluie','vitree-soir','volcan-matin','volcan-midi','volcan-nuit','volcan-orage','volcan-pluie','volcan-soir']);
function pcubeGabarit(){ // la disposition, UNE fois — repère du portail : x à droite, y en haut, z vers la caisse qui arrive
  const S=PCUBE.S,Ri=PCUBE.Ri,Ro=PCUBE.Ro,L9=[];let h=0x2545f491;
  const al=function(){h^=h<<13;h^=h>>>17;h^=h<<5;return (h>>>0)/4294967296;}; // un hasard À LUI : jamais rnd() (la piste est seedée)
  const n=Math.ceil(Ro/S)+1,sect=function(x,y){return ((Math.floor((Math.atan2(y,x)+Math.PI)/(Math.PI/8))%2)+2)%2;};
  // L'ANNEAU, trois couches dessinées de l'arrière vers l'avant (l'ordre de dessin du verre) : derrière, le plan, quelques cubes devant
  for(const C of [[-S*.92,Ri+S*.55,Ro-S*.15,1,.55],[0,Ri,Ro,1,1],[S*.92,Ri+S*.3,Ro-S*.5,.38,1.15]])
    for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const x=(i+.5)*S,y=(j+.5)*S,r=Math.hypot(x,y);if(r<C[1]||r>C[2]||al()>C[3])continue;
      const bord=r<Ri+S*.9?1:0; // la rangée qui touche la fenêtre : plus claire, c'est elle qui prend la lumière d'en face
      L9.push([x,y,C[0],S*(.86+.1*al()),0,al(),0,0,sect(x,y)?.85:.12,C[4]*(bord?1.25:1)]);}
  // LES FLOTTEURS : des cubes détachés qui tournent autour, l'accumulation qui n'a pas encore pris sa place
  for(let k=0;k<34;k++){const a=al()*Math.PI*2,r=Ro+2+al()*15;L9.push([Math.cos(a)*r,Math.sin(a)*r,-7+al()*16,S*(.3+.45*al()),1,al(),(al()<.5?-1:1)*(.025+.05*al()),.25+al()*.9,al(),1.1]);}
  // LES FUYARDS : de petits cubes qui s'échappent de la fenêtre vers la route (le monde d'en face déborde chez nous)
  for(let k=0;k<44;k++){const a=al()*Math.PI*2,r=Math.sqrt(al())*Ri*.88;L9.push([Math.cos(a)*r,Math.sin(a)*r,0,.55+al()*1.2,2,al(),1/(2.6+al()*3.2),.6+al()*2,al(),1.3]);}
  return L9;}
function pcubeInit(){ if(PCUBE.grp)return;
  const L9=pcubeGabarit(),n=L9.length;PCUBE.G=L9;PCUBE.n=n;
  const geo=new THREE.BoxGeometry(1,1,1);geo.dispose=function(){};
  const im=new THREE.InstancedMesh(geo,null,n),aC=new Float32Array(n*3),aK=new Float32Array(n*4),m4=new THREE.Matrix4();
  for(let i=0;i<n;i++){const g=L9[i];m4.makeScale(g[3],g[3],g[3]).setPosition(g[0],g[1],g[2]);im.setMatrixAt(i,m4);aK.set([g[4],g[5],g[6],g[7]],i*4);}
  geo.setAttribute('aC',new THREE.InstancedBufferAttribute(aC,3));geo.setAttribute('aK',new THREE.InstancedBufferAttribute(aK,4));
  PCUBE.cU={uT:{value:0},uAsp:{value:0},uG:{value:new THREE.Color(1,.8,.95)}};
  im.material=new THREE.ShaderMaterial({uniforms:PCUBE.cU,transparent:true,depthWrite:false,fog:false,
    vertexShader:
      'uniform float uT,uAsp;attribute vec3 aC;attribute vec4 aK;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;'+
      'vec3 tourne(vec3 v,vec3 a,float s){float c=cos(s),n=sin(s);return v*c+cross(a,v)*n+a*dot(a,v)*(1.-c);}'+
      'void main(){vec3 c=instanceMatrix[3].xyz;float sc=length(instanceMatrix[0].xyz),k=aK.x,ph=aK.y;vec3 p=position,nl=normal;float A=1.,lum=0.;'+
      'vec2 rd=normalize(c.xy+vec2(1e-4));'+
      'if(k<.5){float w=sin(atan(c.y,c.x)*2.-uT*2.3+ph*1.2);lum=smoothstep(.45,1.,w);'+             // L'ONDE fait le tour de l'anneau
        'c.xy+=rd*(.55*lum+.3*sin(uT*1.15+ph*6.283)-uAsp*2.2*(.4+.6*ph));c.z+=.7*sin(uT*.85+ph*19.)*step(.62,ph)+uAsp*3.*ph;}'+ // il RESPIRE ; près de la caisse, il se penche vers elle
      'else if(k<1.5){float r=length(c.xy),a=atan(c.y,c.x)+uT*aK.z;c=vec3(cos(a)*r,sin(a)*r,c.z+2.4*sin(uT*.55+ph*9.));'+        // les FLOTTEURS tournent
        'vec3 ax=normalize(vec3(.6,1.,.3+ph));float s=uT*aK.w+ph*6.283;p=tourne(p,ax,s);nl=tourne(nl,ax,s);lum=.35;}'+
      'else{float f=fract(uT*aK.z+ph);c.z+=f*f*62.;c.xy*=1.+f*.35;sc*=smoothstep(0.,.07,f)*(1.-f*.85);A=1.-f*f;'+               // les FUYARDS sortent de la fenêtre
        'vec3 ax=normalize(vec3(1.,ph,.4));float s=uT*aK.w+ph*6.283;p=tourne(p,ax,s);nl=tourne(nl,ax,s);lum=.6;}'+
      'vec4 mv=modelViewMatrix*vec4(c+p*sc,1.);gl_Position=projectionMatrix*mv;'+
      'vB=position;vC=aC;vA=A;vL=lum;vI=k<.5?max(0.,dot(nl,vec3(-rd,0.))):.5;vN=normalize(normalMatrix*nl);vV=normalize(-mv.xyz);}',
    fragmentShader:
      'uniform vec3 uG;varying vec3 vC,vB,vN,vV;varying float vA,vL,vI;'+
      'void main(){vec3 q=abs(vB)*2.;float mx=max(q.x,max(q.y,q.z)),mn=min(q.x,min(q.y,q.z)),md=q.x+q.y+q.z-mx-mn;'+
      'float e=smoothstep(.76,.93,md);'+                                                       // les ARÊTES : la lumière du joint
      'vec3 n=normalize(vN);float fr=pow(1.-abs(dot(n,normalize(vV))),2.),dif=.42+.58*max(0.,dot(n,normalize(vec3(.3,.85,.45))));'+
      'vec3 c=vC*(.26+.5*dif)+vC*fr*.55+mix(vC,vec3(1.),.6)*e*1.3+uG*(vI*.75+vL*.85);'+       // le verre, sa tranche, la lumière d'en face sur les faces intérieures, l'onde
      'gl_FragColor=vec4(c,clamp(.5+.5*max(e,fr)+vL*.25,0.,1.)*vA);}'});
  im.frustumCulled=false;im.renderOrder=7;im.matrixAutoUpdate=false;PCUBE.cub=im;
  /* LA FENÊTRE : un disque sous la rangée intérieure de l'anneau */
  PCUBE.mU={uTex:{value:null},uT:{value:0},uHas:{value:0},uTan:{value:Math.tan(58*Math.PI/180)},uR:{value:PCUBE.Ri+PCUBE.S*.5},uInv:{value:PCUBE.inv},uC:{value:PORTAL.c},uDv:{value:34},
    uC1:{value:new THREE.Color()},uC2:{value:new THREE.Color()},uG:{value:PCUBE.cU.uG.value},uInvOn:{value:0},
    uWE:{value:new THREE.Vector3(1,1,1)},uKC:{value:new THREE.Vector2(1,0)},uSat:{value:1},uSh:{value:new THREE.Vector3()},uHi:{value:new THREE.Vector3()}};
  /* LA CARTE POSTALE EST DÉJÀ ÉTALONNÉE (l'image finale de sa map) : l'étalonnage du monde d'ICI la repassait une 2e fois (mesuré : le volcan
     sortait rouge vif, saturé). La fenêtre la DÉFAIT d'avance — l'inverse approché de la chaîne de l'ACES (gain, courbe, contraste, saturation,
     virages), avec les MÊMES uniformes que lui (partagés : aucune écriture par image) — l'ACES la refait : on voit la photo telle quelle. */
  if(POST_ON&&acesPass){const A=acesPass.uniforms;for(const k of ['uWE','uKC','uSat','uSh','uHi'])if(A[k])PCUBE.mU[k]=A[k];PCUBE.mU.uInvOn.value=1;}
  {const d9=new THREE.DataTexture(new Uint8Array([40,20,60,255]),1,1);d9.needsUpdate=true;PCUBE.mU.uTex.value=d9;PCUBE.tex0=d9;}
  const LIRE=W2_POST?'textureGrad(uTex,uq,dFdx(uv),dFdy(uv))':'texture2D(uTex,uq)'; // (le pas du pixel vient de l'image NON pixelisée : pas de trait aux joints des cases)
  const mg=new THREE.CircleGeometry(PCUBE.Ri+PCUBE.S*.5,72);mg.dispose=function(){};
  const mm=new THREE.Mesh(mg,new THREE.ShaderMaterial({uniforms:PCUBE.mU,transparent:true,depthWrite:true,fog:false,
    vertexShader:'varying vec3 vW;varying vec2 vL;void main(){vL=position.xy;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:
      'uniform sampler2D uTex;uniform float uT,uHas,uTan,uR,uInvOn,uSat,uDv;uniform vec3 uC1,uC2,uG,uWE,uSh,uHi,uC;uniform vec2 uKC;uniform mat3 uInv;varying vec3 vW;varying vec2 vL;'+
      'const vec3 LU=vec3(.2126,.7152,.0722);'+
      'vec3 invAces(vec3 y){y=clamp(y,0.,.97);vec3 a=2.43*y-2.51,b=.59*y-.03,c=.14*y;return (-b-sqrt(max(b*b-4.*a*c,0.)))/(2.*a);}'+
      'vec3 versScene(vec3 y){'+(GRADE_ACES?'y=(y+.02425)/1.0185;y=mix(vec3(dot(y,LU)),y,1./1.12);':'')+
        'float l=dot(y,LU);y-=uSh*(1.-smoothstep(0.,.5,l))+uHi*smoothstep(.5,1.,l);l=dot(y,LU);y=mix(vec3(l),y,1./max(uSat,.05));'+
        'y=(y-uKC.y)/max(uKC.x,.05);return invAces(max(y,0.))/max(uWE,vec3(.05));}'+
      'float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
      /* LA FENÊTRE : la direction du regard, pas la place sur le disque — vue d'un ŒIL RAPPROCHÉ (jamais à plus de uDv m de l'anneau) : de loin
         on voit déjà TOUTE la map d'en face, comme une photo encadrée qui bouge avec nous ; à moins de uDv m, c'est la vraie fenêtre (la même
         image que le voile plein écran du passage) */
      'void main(){vec3 e=cameraPosition-uC;e=uC+e*min(1.,uDv/max(1.,length(e)));vec3 l=uInv*normalize(vW-e);vec2 v=l.xy/max(.05,-l.z)/uTan;'+
      'float r=length(vL)/uR,rim=smoothstep(.66,1.,r);'+
      'vec2 uv=.5+.5*v+.005*vec2(sin(vL.y*.21+uT*1.9),cos(vL.x*.19-uT*1.6))*(1.-rim);'+         // l'air d'en face tremble un peu
      'float N=mix(420.,56.,smoothstep(.78,1.,r));vec2 uq=(floor(uv*N)+.5)/N;'+                             // vers le bord, le monde d'en face se PIXELISE
      'vec3 img='+LIRE+'.rgb;if(uInvOn>.5)img=versScene(img*.94);float ins=step(abs(v.x),1.)*step(abs(v.y),1.);'+
      'vec3 fond=mix(uC2,uC1,clamp(.5+.5*v.y,0.,1.))*.4;vec3 c=mix(fond,img,uHas*ins);'+
      'float sp=step(.94,fract(h21(floor(vL/1.9))*7.+uT*.45))*rim;'+                          // des pixels qui scintillent au bord
      'c=c*(1.-rim*.3)+uG*(rim*rim*1.05+sp*1.1);'+
      'gl_FragColor=vec4(c,mix(.93,1.,rim));}'}));
  mm.frustumCulled=false;mm.renderOrder=5;mm.matrixAutoUpdate=false;PCUBE.mem=mm;
  const g=new THREE.Group();g.matrixAutoUpdate=false;g.add(mm);g.add(im);g.visible=false;PCUBE.grp=g;scene.add(g);
  PCUBE.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:0xff4fd8,transparent:true,opacity:.26,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  PCUBE.halo.renderOrder=4;PCUBE.halo.visible=false;PCUBE.halo.matrixAutoUpdate=false;scene.add(PCUBE.halo);
}
/* LA MAP D'EN FACE : le couple map × météo (× teinte) que le portail ouvre — tiré d'avance en mode classique */
function portDest(){
  if(PARK.on||TUTO.on)return null;
  if(BALADE||JADE_JEU)return {carte:'jade',meteo:'soir'};
  const z=runStats.zones|0,zn=Math.max(0,z-(LVL.tutoZ|0));
  if(SF.on&&(started||SF.pret)){let t=SF.tirage[zn+1];
    if(!t){const pv=SF.tirage[zn]||SF.der;t=SF.tirage[zn+1]=SF.force?sfImpose(pv):sfTire(pv);}
    return {carte:t.carte,meteo:t.meteo,teinte:t.teinte||null};}
  const n9=NIVEAUX[(zn+1)%NIVEAUX.length];return n9?{carte:n9.id==='ville'&&n9.nuit?'ville':n9.id,meteo:n9.nuit?'nuit':null}:null;}
function pcubeCle(d){ // la carte postale la plus proche qui existe : exacte, puis la map à une autre heure
  if(!d)return '';const a=d.carte+'-'+d.meteo+(d.teinte?'-'+d.teinte:''),b=d.carte+'-'+d.meteo;
  if(PCUBE_CP.has(a))return a;if(PCUBE_CP.has(b))return b;for(const k of PCUBE_CP)if(k.indexOf(d.carte+'-')===0)return k;return '';}
function pcubeDest(){ if(!PCUBE.grp)return;
  const d=PCUBE.dest=portDest();
  const P=(d&&(PCUBE_PAL[d.carte+'-'+d.teinte]||PCUBE_PAL[d.meteo==='orage'&&d.carte==='nuages'?'orage':d.carte]))||PCUBE_PAL.nuages;
  const cA=new THREE.Color(P[0]),cB=new THREE.Color(P[1]),cT=new THREE.Color(),aC=PCUBE.cub.geometry.attributes.aC;
  if(d&&d.meteo==='nuit'){cA.multiplyScalar(.8);cB.multiplyScalar(.8);}
  for(let i=0;i<PCUBE.n;i++){const g=PCUBE.G[i];cT.copy(cA).lerp(cB,g[8]).multiplyScalar(g[9]);aC.setXYZ(i,cT.r,cT.g,cT.b);}
  aC.needsUpdate=true;PCUBE.pal=P;PCUBE.cU.uG.value.setHex(P[2]);PCUBE.mU.uC1.value.setHex(P[0]);PCUBE.mU.uC2.value.setHex(P[1]);
  PCUBE.halo.material.color.setHex(P[2]);if(PORTAL.lum)PORTAL.lum.color.setHex(P[2]);
  const k=pcubeCle(d);PCUBE.cle=k;PCUBE.mU.uHas.value=0;PCUBE.mU.uTex.value=PCUBE.tex0;
  if(!k)return;
  let t=PCUBE.img[k];
  if(!t){t=PCUBE.img[k]=new THREE.Texture();t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;
    const im=new Image();im.onload=function(){t.image=im;t.needsUpdate=true;t.pret=true;if(PCUBE.cle===k){PCUBE.mU.uTex.value=t;PCUBE.mU.uHas.value=1;}};
    im.onerror=function(){t.rate=true;};im.src='assets/portail/'+k+'.webp';
    const cles=Object.keys(PCUBE.img);if(cles.length>4){const v=cles[0];if(v!==k){try{PCUBE.img[v].dispose();}catch(e){}delete PCUBE.img[v];}}} // on n'en garde que quelques-unes
  if(t.pret){PCUBE.mU.uTex.value=t;PCUBE.mU.uHas.value=1;}}
function pcubePose(F){ // le portail de la piste neuve : au bout de la route, centre à H m au-dessus du bitume, la fenêtre face à la caisse
  pcubeInit();
  PCUBE.z.copy(F.t).negate();PCUBE.y.copy(F.n);PCUBE.x.crossVectors(PCUBE.y,PCUBE.z);
  const g=PCUBE.grp;g.matrix.makeBasis(PCUBE.x,PCUBE.y,PCUBE.z).setPosition(PORTAL.c);g.visible=true;g.updateMatrixWorld(true);
  PCUBE.inv.setFromMatrix4(g.matrix).transpose(); // monde → portail (rotation pure)
  PCUBE.halo.position.copy(PORTAL.c);PCUBE.halo.scale.setScalar(PCUBE.Ro*2.5);PCUBE.halo.updateMatrix();PCUBE.halo.updateMatrixWorld(true);PCUBE.halo.visible=true;
  PCUBE.zp=null;PCUBE.on=true;
  if(PCUBE_VITE)setTimeout(function(){try{if(started&&!gameOver&&mode==='drive'&&L-s>900)window.dbgPortail(450);}catch(e){}},2500);}
const PCF=new THREE.Vector3();
function pcubeFranchi(p){ // la caisse TRAVERSE LA FENÊTRE (le plan de l'anneau, dans le disque) — dans un sens ou dans l'autre, au sol comme en vol
  PCF.copy(p).sub(PORTAL.c).applyMatrix3(PCUBE.inv);const z=PCF.z,z0=PCUBE.zp;PCUBE.zp=z;
  if(PCF.x*PCF.x+PCF.y*PCF.y>Math.pow(PCUBE.Ri+PCUBE.S*.6,2))return false;
  return (z0!=null&&((z0>0&&z<=0)||(z0<0&&z>=0)))||Math.abs(z)<.4;}
function pcubeTick(t,kmh){ if(!PCUBE.on)return;
  PCUBE.cU.uT.value=t;PCUBE.mU.uT.value=t;
  // L'ASPIRATION : à moins de ~4 s de la caisse, l'anneau se penche vers elle
  let a=0;if(started&&!gameOver){const v9=Math.max(15,(kmh||0)/3.6),d9=carGroup.position.distanceTo(PORTAL.c);a=THREE.MathUtils.clamp(1-(d9-PCUBE.Ri)/(v9*4),0,1);}
  PCUBE.asp+=(a-PCUBE.asp)*.08;PCUBE.cU.uAsp.value=PCUBE.asp*PCUBE.asp;
  PCUBE.halo.material.opacity=.2+.07*Math.sin(t*2.2);}
window.dbgPortailCubes=function(){const d=PCUBE.dest;let cam=null;
  try{frameAt(s,GF);const o=camera.position.clone().sub(carGroup.position);cam={avant:+o.dot(GF.t).toFixed(2),haut:+o.dot(GF.n).toFixed(2),cote:+o.dot(GF.b).toFixed(2),fov:+camera.fov.toFixed(1),aspect:+camera.aspect.toFixed(3)};}catch(e){cam=e.message;}
  return {on:PCUBE.on,cubes:PCUBE.n,dest:d,carte:PCUBE.cle,image:!!PCUBE.mU&&PCUBE.mU.uHas.value>0,c:PORTAL.c.toArray().map(Math.round),asp:+PCUBE.asp.toFixed(2),cam:cam,tirage:SF.tirage.slice()};};
/* (banc) LA VUE DU PORTAIL : l'œil posé sur la route à d m de la fenêtre, à h m au-dessus du bitume, regard le long de la route (pente de la caméra de poursuite) —
   rend UNE image et la renvoie en JPEG (sans le HUD) : la même pour l'ovule du parc et pour les cubes */
window.dbgVuePortail=function(d,h,q){if(started&&!gameOver&&!paused)togglePause();
  frameAt(Math.max(0,L-25-(d||200)),GF);camera.position.copy(GF.p).addScaledVector(GF.n,h==null?5.5:h);camera.up.copy(GF.n);
  CV1.copy(GF.p).addScaledVector(GF.t,60).addScaledVector(GF.n,(h==null?5.5:h)-3.2);camera.lookAt(CV1);camera.updateMatrixWorld();
  if(PCUBE.on)pcubeTick(performance.now()/1000);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  return renderer.domElement.toDataURL('image/jpeg',q||.86);};
/* (banc) LA CARTE POSTALE d'une map : à lancer en course juste après le départ (`?carte=jade&meteo=soir`) — l'œil de la caméra de poursuite
   (3,2 m au-dessus du bitume) au début de la piste, regard À L'HORIZONTALE le long de la route, champ carré de PCUBE_FOV°, caisse cachée ;
   rend l'image en WebP (taille n²). C'est ce que la fenêtre du portail montre, et ce qu'on voit en arrivant. */
const PCUBE_FOV=116;
window.dbgPortailPhoto=function(d,q){return new Promise(function(res){const t0=performance.now(); // (banc) la caméra de COURSE quand la caisse est à d m de la fenêtre : une image, sans le HUD
  const f=function(){if(gameOver||performance.now()-t0>20000){res('rate');return;}
    if(L-25-s<=d||mode!=='drive'){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);res({d:Math.round(L-25-s),mode:mode,url:renderer.domElement.toDataURL('image/jpeg',q||.88)});}
    else requestAnimationFrame(f);};requestAnimationFrame(f);});};
window.dbgCartePostale=function(o){o=o||{};if(started&&!gameOver&&!paused)togglePause();
  const n=o.n||640,s0=o.s==null?s+30:o.s,h=o.h==null?3.2:o.h;carGroup.visible=false; // (l'œil DEVANT la caisse : ni elle, ni ses traînées dans l'image)
  frameAt(s0,GF);camera.position.copy(GF.p).addScaledVector(GF.n,h);camera.up.copy(GF.n);CV1.copy(camera.position).addScaledVector(GF.t,100);camera.lookAt(CV1);
  const fov0=camera.fov,as0=camera.aspect;camera.fov=PCUBE_FOV;camera.aspect=renderer.domElement.width/renderer.domElement.height;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  const cv=renderer.domElement,W=cv.width,H=cv.height,m=Math.min(W,H),k=document.createElement('canvas');k.width=k.height=n;
  const g=k.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cv,(W-m)/2,(H-m)/2,m,m,0,0,n,n);
  camera.fov=fov0;camera.aspect=as0;camera.updateProjectionMatrix();carGroup.visible=true;
  return {url:k.toDataURL('image/webp',o.q||.8),W:W,H:H,niveau:LVL.cur&&{carte:LVL.cur.carte,meteo:LVL.cur.meteo,teinte:LVL.cur.teinte||null}};};
const trackMeshes=[];let PADS=[],PADL=[];let portalMesh=null;
/* LA ROUTE QUI TE RATTRAPE (2026-09-29, Sacha, après 4 vidéos : deux de VOLTIGEUR — en l'air 60 % du temps, sortie par le bord,
   pose sur la route du dessous — et deux de ROULEUR — au sol, nitro à fond, qui ne vole que quand il RATE un virage : « il faut une
   génération de map qui plaise aux deux et donne des sensations inoubliables » ; « pas de tourbillon, les rouleurs doivent kiffer
   aussi » ; « oui » à : un virage bien pris paie PLUS qu'une chute rattrapée ; essai au niveau NUAGES seul).
   LE VIRAGE À FILET (motif de genCtrl) : un virage RAPIDE, puis la route fait une grande boucle (avec une épingle au fond) et repasse
   30-60 m PLUS BAS, à l'EXTÉRIEUR du virage, dans le même sens — pile là où retombe une caisse qui sort du virage par le bord. Le
   filet est calculé sur la vraie physique du vol : sortie à l'angle α du virage, au bord extérieur (rayon R+RH), droit devant (la
   tangente) à la vitesse de croisière vN, poussée de décollage vers le haut (`kick`), gravité FALL_G×SPD ; la pose a lieu quand la
   caisse est descendue de `dh(α)` → le point de pose est à l'angle α + atan(x/Re) du centre, au rayon √(Re²+x²) : le filet est ce
   LIEU DES POSES, pour α de −15 % à 115 % du virage. Le rouleur qui passe : VIRAGE À FOND (et il roule SOUS le virage qu'il vient de
   prendre). Le rouleur qui sort : RATTRAPÉ (plus modeste). Le voltigeur : un tremplin qu'il voit venir.
   `on` : l'interrupteur · `kv` : vitesse de calcul = kv × croisière du palier moteur (celle de lvPiste) · `dh`/`dhS` : la chute
   visée au début/en plus à la fin du virage · `dip` : l'épingle au fond de la boucle (part du rayon) · `par` : filets par zone
   selon la visite du niveau NUAGES (1re, 2e, 3e et +) — de moins en moins de filets : la même vitesse devient un vrai pari.
   `vFond` : part de vN à tenir dans le virage pour VIRAGE À FOND. */
const FILET={on:true,kv:1.1,dh:42,dhS:12,kick:1.6,dev:.13,par:[3,2,1],vFond:.8,visite:null}; // dev : la caisse qui rate un virage part ÉCARTÉE de la tangente, vers le vide (~0,15 rad mesuré au banc)
const FILETMARK=[];
/* (2026-09-30, revue PISTE) LES MODULES SONT DES FIGURES, PAS DES CHANTIERS : genCtrl note ici {i0,i1} (index de points de contrôle) le
   début et la fin de chaque module des NUAGES (lacets, montagnes russes, grand plongeon, dos de chameau) et, pour chaque FILET, son
   virage rapide puis son filet — buildTrack les traduit en tronçons `s` (MODS) où ni plot ni huile ne sont tirés au hasard : ils
   tombaient pile au bord où le voltigeur sort, sur la crête où il décolle. Zéro tirage `rnd` : on lit ctrl.length, rien d'autre. */
const MODMARK=[];
/* (2026-10-20, Sacha : « refonte totale de la map Dune : des petits segments de route posés sur les dunes, on surfe de dune en dune ») LES TROUS DE LA ROUTE.
   La piste reste UNE courbe (la caisse, la caméra, la distance, le portail la lisent comme avant) ; mais genDunes y note, comme les modules, des TROUS
   {i0,i1} (index de points de contrôle : le bout d'un segment de route, le début du suivant). buildTrack les traduit en lignes de `pts` : `TROU[k]` = 1
   quand le ruban n'existe PAS entre le point k et le suivant (aucun triangle : pisteTranches, pisteMaigre) ; `TROUS` = {s0,s1,a,b} (abscisses et lignes
   de pts du vide). Une dalle absente ne reçoit rien : ni pad, ni pièce, ni atterrissage (dalleProche). null = aucune map à trous. */
const TROUMARK=[];
let TROUS=[],TROU=null;
function enTrou(s9,marge){if(!TROUS.length)return false;marge=marge||0;for(const t of TROUS)if(s9>t.s0-marge&&s9<t.s1+marge)return true;return false;} // l'abscisse s est-elle au-dessus d'un vide (à `marge` m près) ?
let FILETS=[],MODS=[]; // les filets de la piste courante, en distance le long de la piste : {sC0,sC1 (le virage), sN0,sN1 (le filet), cote (−1/+1 : le côté du vide)}
function filetDe(s0,s1){for(const q of FILETS)if(s0>q.sC0-80&&s0<q.sC1+60&&s1>q.sN0-160&&s1<q.sN1+260)return q;return null;} // un vol parti de ce virage et posé dans son filet ?
/* LES PLAQUES TURBO EN INSTANCES (2026-09-27, passe perf iPhone) — recensement des appels de dessin au sol : 82 pour les seules
   plaques d'or (~41 par face, toutes visibles d'un bout à l'autre du ruban qui s'enroule), soit un quart des appels de la scène, et
   chacun se paie en processeur (programme, uniforms, matrices) avant d'arriver au GPU. Elles sont IMMOBILES, partagent la même
   géométrie et la même matière opaque (PAD_MAT, jamais libérée) : buildTrack les pose comme avant, puis on les recopie ici dans UN
   InstancedMesh et on retire les originaux de la scène (ils restent dans trackMeshes : la libération au rebuild ne change pas).
   Même matrice, même matière, même profondeur → même image, en UN appel. Le programme instancié se compile au menu (1re piste). */
let PAD_IM=null;
function padsInstancier(){
  const L9=[];for(const m of trackMeshes)if(m.geometry===padGeo&&m.material===PAD_MAT&&m.parent===scene)L9.push(m);
  const n=L9.length;
  if(!PAD_IM||PAD_IM.instanceMatrix.count<n){
    if(PAD_IM){scene.remove(PAD_IM);PAD_IM.dispose();}
    PAD_IM=new THREE.InstancedMesh(padGeo,PAD_MAT,Math.max(128,Math.ceil(n*1.4)));
    PAD_IM.frustumCulled=false;PAD_IM.matrixAutoUpdate=false;scene.add(PAD_IM); // ⚠ la sphère englobante r128 ne couvre pas les instances
  }
  for(let i=0;i<n;i++){const m=L9[i];m.updateMatrix();PAD_IM.setMatrixAt(i,m.matrix);scene.remove(m);}
  PAD_IM.count=n;PAD_IM.visible=n>0;PAD_IM.instanceMatrix.needsUpdate=true; // (2026-10-14) une piste sans plaque (le Soleil de jade) : plus de dessin de zéro exemplaire à chaque image
}
scene.onBeforeRender=function(r9,s9,cam){pisteLoin(cam);}; // (passe perf) avant le tri de three : tranches de piste lointaines
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);lumVue(cam);};} // (2026-10-17) LES LUMIÈRES DE LA CAISSE v2 : monde → vue pour la caméra qui rend — CHAÎNÉ (jamais réassigné)
// flaques d'huile (rares, droites & plates uniquement) : disque sombre glacé + reflet irisé
let OILS=[];
const oilGeo=new THREE.CircleGeometry(1,22);
const oilMat=new THREE.MeshPhongMaterial({color:0x121419,shininess:320,specular:0xc79cff,envMap:null,transparent:true,opacity:.92,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); // la flaque boit le néon violet
const oilRimMat=new THREE.MeshBasicMaterial({color:0x4a3a72,transparent:true,opacity:.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}); // (2026-09-26) flaque et liseré à 4-5 cm du bitume : décalés en profondeur, sinon ils se mordaient au loin
// ---------- NUAGES VIVANTS : bancs volumétriques traversables (impostors en grappes) ----------
// Technique billboard-impostor (Harris, GDC 2002) : chaque nuage = grappe de bouffées montées sur
// RESSORT. On les FEND en passant — elles giclent, tourbillonnent, puis reprennent leur place.
// Trois familles : bancs posés SUR la route (ils masquent la piste : élément de gameplay),
// nuages de VOL à surfer (coussin d'air + regain d'airtime), et mer de nuages décorative.
// À l'intérieur : écran laiteux, brouillard resserré, son feutré, brume qui file — on VOLE.
let CLOUDS=[],cloudIn=0,cloudInS=0,flightId=0;
const cldV1=new THREE.Vector3(),cldV2=new THREE.Vector3();
/* `sceneRetire(liste)` (2026-09-28, chasse aux gels) — `scene.remove` cherche CHAQUE objet dans les enfants de la scène (indexOf) puis
   décale le tableau (splice) : retirer les ~2 000-4 000 pièces d'une piste un par un, dans une scène de ~5 000 enfants, coûtait à lui seul
   ~15 ms par portail (MESURÉ, profil). Ici : UN passage qui garde les autres enfants dans le MÊME ordre, puis, dans l'ordre de la liste,
   ce que fait `remove` pour chaque objet réellement enfant de la scène (parent à null, événement « removed »). Même résultat. */
const RETIRE_EV={type:'removed'};
function sceneRetire(liste){
  if(!liste.length)return;
  const S9=new Set(liste),k=scene.children,partis=new Set();let w=0;
  for(let i=0;i<k.length;i++){const o=k[i];if(S9.has(o))partis.add(o);else k[w++]=o;}
  k.length=w;
  for(const o of liste)if(partis.has(o)){partis.delete(o);o.parent=null;o.dispatchEvent(RETIRE_EV);}
}
function disposeClouds(){
  // ⚠ chaque nuage a sa PROPRE géométrie fusionnée : il FAUT la libérer, sinon chaque portail
  // laisse fuir quelques Mo de VRAM. Le matériau (CLOUD_MAT) est partagé : jamais disposé.
  sceneRetire(CLOUDS.map(function(c){return c.g;})); // (chasse aux gels) d'un seul passage
  for(const c of CLOUDS){if(c.mesh&&c.mesh.geometry)c.mesh.geometry.dispose();const u9=c.mesh&&c.mesh.userData;if(u9&&u9.peau)u9.peau.dispose(); /* (2026-10-22, DEBUGGING : la PEAU d'un nuage seul (v773, un enfant du maillage hors de u9.vit) n'était jamais libérée — MESURÉ : 12 à 16 géométries de plus au compteur à chaque sortie de la mer de nuages) */if(u9&&u9.vit){for(const o9 of u9.vit){nufJette(o9);o9.geometry.dispose();}if(u9.g8)u9.g8.dispose();if(u9.gVit)u9.gVit.dispose();}} // (vitrail) ses écailles, sa peau, ses deux surfaces
  CLOUDS=[];cloudIn=0;
}
let FLOU_OK=true; // (2026-09-26) le flou radial du boost — le palier BAS le coupe
let QUAL_LOW=false,QUAL_MED=IS_MOBILE||IS_LOW_END; // (lus par dbgPerf : MED = un allègement posé, LOW = bloom éteint — tenus par qlPose)
