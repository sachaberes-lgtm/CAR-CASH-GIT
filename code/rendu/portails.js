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
  banquise:[0x8fe8ff,0xffffff,0xd8f6ff],crypto:[0xffd75e,0xe8eef8,0xfff1b0],espace:[0x8a5bff,0xe8e0ff,0xc8b0ff],
  canyon:[0xff9a3d,0xd8442a,0xffd09a],grotte:[0x3ef0ff,0xa45bff,0xc8fbff],paris:[0xffd75e,0x5e8bff,0xfff0c0],ville:[0xb04cff,0xff3ec8,0xf0b0ff],
  'ville-violet':[0xb04cff,0xff3ec8,0xf0b0ff],'ville-vert':[0x3dff9a,0x00d2ff,0xb8ffe0],'ville-jaune':[0xffd23d,0xff8a1c,0xfff0b0],'ville-bleu':[0x3d8bff,0x5ee6ff,0xc0e0ff],vitree:[0x2f8cff,0xffffff,0xcfe8ff],dunes:[0xffb43d,0x1fd6ff,0xffe2a0]}; // (2026-10-18) la VILLE VITRÉE : verre bleu, blanc, glace
/* LES CARTES POSTALES LIVRÉES (assets/portail/) — la liste est réécrite par le banc qui les tire (outils : carte-postale.py) */
const PCUBE_CP=new Set(['dunes-matin','dunes-midi','dunes-nuit','dunes-orage','dunes-pluie','dunes-soir','banquise-blizzard','banquise-matin','banquise-midi','banquise-neige','banquise-nuit','banquise-soir','canyon-matin','canyon-midi','canyon-nuit','canyon-orage','canyon-pluie','canyon-soir','crypto-matin','crypto-midi','crypto-nuit','crypto-soir','espace-matin','espace-midi','espace-soir','foret-matin','foret-midi','foret-nuit','foret-orage','foret-pluie','foret-soir','grotte-matin','grotte-midi','grotte-nuit','grotte-soir','jade-matin','jade-midi','jade-nuit','jade-orage','jade-pluie','jade-soir','nuages-matin','nuages-midi','nuages-nuit','nuages-orage','nuages-pluie','nuages-soir','paris-soir','ville-brouillard-bleu','ville-brouillard-jaune','ville-brouillard-vert','ville-brouillard-violet','ville-nuit-bleu','ville-nuit-jaune','ville-nuit-vert','ville-nuit-violet','ville-orage-bleu','ville-orage-jaune','ville-orage-vert','ville-orage-violet','ville-pluie-bleu','ville-pluie-jaune','ville-pluie-vert','ville-pluie-violet','vitree-matin','vitree-midi','vitree-nuit','vitree-pluie','vitree-soir','volcan-matin','volcan-midi','volcan-nuit','volcan-orage','volcan-pluie','volcan-soir']);
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
function pcubeTick(t,kmh,dt){ if(!PCUBE.on)return;
  PCUBE.cU.uT.value=t;PCUBE.mU.uT.value=t;
  // L'ASPIRATION : à moins de ~4 s de la caisse, l'anneau se penche vers elle
  let a=0;if(started&&!gameOver){const v9=Math.max(15,(kmh||0)/3.6),d9=carGroup.position.distanceTo(PORTAL.c);a=THREE.MathUtils.clamp(1-(d9-PCUBE.Ri)/(v9*4),0,1);}
  PCUBE.asp+=(a-PCUBE.asp)*(1-Math.pow(.92,(dt>0?Math.min(dt,.1):1/60)*60));PCUBE.cU.uAsp.value=PCUBE.asp*PCUBE.asp;
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
let QUAL_LOW=false,QUAL_MED=ALLEGE||IS_LOW_END; // (lus par dbgPerf : MED = un allègement posé, LOW = bloom éteint — tenus par qlPose)
/* ====================== LA NETTETÉ EN DERNIER — l'échelle de qualité QL (2026-09-27, passe perf iPhone) ======================
   Sacha joue en NETTE (DPR 1,5 sur iPhone 13 Pro) et la voyait fondre « surtout quand on s'envole » : dès que l'image tirait (> 19 ms),
   la résolution adaptative sabrait la RÉSOLUTION d'abord — la seule chose qu'on voit sur chaque pixel — jusqu'à 0,5, pendant que les
   paliers MOYEN/BAS (ombre, bloom) attendaient 3 à 5 s puis tombaient POUR TOUTE LA SESSION. L'ordre est retourné, et tout se RÉTABLIT.
   UNE échelle, un seul curseur `QL.k` : chaque cran enlève la chose la MOINS visible qui reste, et on remonte dans l'ordre inverse
   (la netteté revient donc la PREMIÈRE). Tous les crans sont sans recompilation (tailles de cibles, uniformes, drapeaux) :
     1 · l'ombre ne se redessine qu'une image sur deux quand la caisse vole LOIN de toute dalle (> 14 m : l'ombre qu'elle jette est à des
         dizaines de mètres, le décalage d'une image ne se voit pas — et c'est EN VOL que la passe d'ombre coûte double) ;
     2 · carte d'ombre 768 (PCF doux : le bord est déjà flouté sur ~3 texels, 6,6 → 8,9 cm par texel ne se lit pas) ;
     3 · bloom à ¾ de sa résolution (c'est un flou : il a déjà perdu ses détails) ;
     4 · carte d'ombre 512 ;
     5 · plus de flou radial au boost (le champ, les filés et le tunnel sombre gardent la sensation) ;
     puis la RÉSOLUTION, par petits crans jusqu'au PLANCHER NET — en NETTE 1,25 : ~70 % des pixels de 1,5 ; sur un iPhone de 390 pt,
     un pixel 3D y fait 0,8 pt, plus fin que le plus fin des traits dessinés (liserés néon, pointillés ~2 px), et le FXAA + le grain
     masquent l'écart ; sous 1,2 la différence avec le HUD (DOM, toujours net) commence à se lire. En RAPIDE, pas de plancher net :
     l'échelle descend jusqu'à DPR_MIN comme avant — mais seulement après les cinq crans invisibles.
     Sous le plancher net, puis le bloom éteint en tout dernier : réservés à l'EFFONDREMENT (> 24 ms, 6 s d'affilée, au plancher, hors
     chargement / onglet / cadence 30 Hz). C'est l'ancien palier BAS — mais il se RELÈVE quand la marge revient.
   ANTI-YOYO (repris de la résolution v3) : on ne descend que « calme » (ni reconstruction de zone, ni retour d'onglet, ni 30 Hz
   imposé) ; on remonte d'UN cran après ~4,5 s de marge (< 17,8 ms ou cadence 30 Hz) ; un cran remonté qui retombe en < 6 s
   devient un MUR pendant 45 s. `dbgPin(true)` fige l'échelle ; `dbgQual(k)` la force (banc) ; `?perf=1` l'affiche à l'écran. */
const QLR={a:new Float32Array(60),s:new Float32Array(60),i:0,n:0,p50:16,p75:16,p90:16, // (tour 2) les 60 dernières durées d'image, et leurs centiles
  t0:0,sN:0,sA:[],vrai:0,vraiT:0,px:new Uint8Array(4),S:{pend:0},dern:null,cg:null,sync:0}; // (tour 2) LA SONDE : le vrai coût d'une image (voir qlSonde) ; sync = banc seulement (dbgSonde('sync') rejoue l'ancienne sonde bloquante)
/* LA SONDE (2026-09-28) — MESURÉ SUR L'IPHONE 13 PRO DE SACHA (banc ?banc=1, reçu par mail) : une image lui coûte 8 à 13 ms en NETTE,
   mais l'écran n'en montre que 30 par seconde, PILE, partout — même à DPR 1,0. Ce n'était pas le jeu qui ramait : c'était l'iPhone qui
   bridait Safari à 30 i/s (mode économie d'énergie, ou surchauffe). Et la règle de qualité, qui ne voyait que « 33 ms par image »,
   sacrifiait la netteté pour rien — le « mode pixel ». Désormais, avant de baisser quoi que ce soit, on MESURE le vrai coût : cinq
   images synchronisées (un `readPixels` d'un pixel oblige le processeur à attendre la puce : le temps mesuré est ce que coûte vraiment
   l'image, hors de la grille de l'écran). Sous 14,5 ms, le téléphone POURRAIT tenir 60 i/s : c'est l'écran qui bride, on ne touche à rien
   (et on remonte ce qui aurait été baissé). La sonde ne tourne que quand des images sont ratées, au plus toutes les 8 s. */
/* (2026-10-08, Léo : « le jeu rame ») LA SONDE NE FIGE PLUS L'IMAGE — là où la puce a un CHRONOMÈTRE. MESURÉ au banc (course de 40 s,
   Chrome sur Mac M2) : chaque `readPixels` de la sonde obligeait le processeur à ATTENDRE que la puce ait tout fini — 15 lectures, 510 ms
   de jeu gelé, jusqu'à 120 ms d'un coup. Et elle ne se réveille que quand des images sont déjà ratées : sur une machine chargée, elle
   aggravait l'à-coup qu'elle venait mesurer. Là où le navigateur offre `EXT_disjoint_timer_query_webgl2` (Chrome, Edge, Android), la
   puce chronomètre elle-même son travail de l'image (une requête TIME_ELAPSED autour de la boucle) et rend le résultat quelques images
   plus tard, sans que personne n'attende ; le coût de l'image = le travail du processeur (début → fin de la boucle) + celui de la puce.
   Même seuil (14,5 ms), même décision, zéro gel. Ailleurs (Safari, iPhone) : l'ancienne lecture synchrone, INCHANGÉE.
   ⚠ Essayé d'abord : une barrière (`fenceSync`) guettée entre deux tâches — plus de gel, mais le signal « fini » arrive en retard dans
   Chrome : ~21 ms lus au calme là où l'ancienne sonde lisait ~8 → la règle aurait baissé la netteté à tort. Écarté. Aucun pixel ne change. */
const QLT={ext:null,ok:undefined,q:null,rate:0};
function qlChrono(g9){ if(QLT.ok===undefined){try{QLT.ext=renderer.capabilities.isWebGL2?g9.getExtension('EXT_disjoint_timer_query_webgl2'):null;}catch(e){QLT.ext=null;}QLT.ok=!!QLT.ext;}
  return QLT.ok&&!QLR.sync;}
function qlSondeArme(){QLR.sN=5;QLR.sA.length=0;QLR.S={pend:0};} // une SÉRIE : cinq images mesurées
function qlSondeFin(){ if(QLR.sN<=0&&QLR.S.pend<=0&&QLR.sA.length){const s9=QLR.sA.slice().sort((a,c)=>a-c);QLR.dern=s9;QLR.vrai=s9[s9.length>>1];QLR.vraiT=performance.now();QLR.sA.length=0;}}
function qlSondeDebut(){ // en TÊTE de boucle, sonde armée : la puce déclenche son chrono
  try{const g9=renderer.getContext();if(!qlChrono(g9))return;
    if(QLT.q){g9.endQuery(QLT.ext.TIME_ELAPSED_EXT);g9.deleteQuery(QLT.q);QLT.q=null;} // l'image d'avant s'est interrompue (erreur avalée) : ce chrono-là ne vaut rien
    const q=g9.createQuery();if(!q)return;g9.beginQuery(QLT.ext.TIME_ELAPSED_EXT,q);QLT.q=q;}
  catch(e){QLT.ok=false;QLT.q=null;}}
function qlSonde(){ try{ const g9=renderer.getContext();
  if(QLT.q){const q=QLT.q,S=QLR.S,cpu=performance.now()-QLR.t0,t1=performance.now();QLT.q=null;g9.endQuery(QLT.ext.TIME_ELAPSED_EXT);QLR.sN--;S.pend++;
    const pas=function(){let av=false;try{av=g9.getQueryParameter(q,g9.QUERY_RESULT_AVAILABLE);}catch(e){}
      if(!av&&performance.now()-t1<1500){setTimeout(pas,8);return;} // le résultat arrive quelques images plus tard : on repasse, sans attendre
      let gpu=null;try{if(av&&!g9.getParameter(QLT.ext.GPU_DISJOINT_EXT))gpu=g9.getQueryParameter(q,g9.QUERY_RESULT)/1e6;g9.deleteQuery(q);}catch(e){}
      S.pend--;if(gpu==null&&++QLT.rate>=5)QLT.ok=false; // une puce qui ne rend jamais son chrono : retour à l'ancienne sonde
      if(S!==QLR.S)return;if(gpu!=null){QLR.sA.push(Math.min(120,cpu+gpu));(QLR.cg||(QLR.cg=[])).push([+cpu.toFixed(1),+gpu.toFixed(1)]);if(QLR.cg.length>10)QLR.cg.shift();}qlSondeFin();};
    setTimeout(pas,8);return;}
  if(qlChrono(g9))return; // chrono pas encore lancé (la sonde vient d'être armée en cours d'image) : il partira à l'image suivante
  renderer.setRenderTarget(null);g9.readPixels(0,0,1,1,g9.RGBA,g9.UNSIGNED_BYTE,QLR.px);QLR.sN--;QLR.sA.push(performance.now()-QLR.t0);qlSondeFin();
  }catch(e){QLR.sN=0;try{if(QLT.q){renderer.getContext().endQuery(QLT.ext.TIME_ELAPSED_EXT);QLT.q=null;}}catch(e2){QLT.ok=false;}} }
const QL={k:0,mur:0,murT:0,roseT:0,up:0,efT:0,effondre:false,fr:0,N_EFF:5,ombre0:sun.shadow.mapSize.x,essai:null,plafK:0,plafT:0,
  nom:['ombre en vol ½','ombre 768','bloom ¾','ombre 512','flou radial']};
/* (2026-09-27, tour 2 — « on repasse en mode pixel assez vite après avoir lancé ») LE MODE PIXEL, C'ÉTAIT LE PLANCHER : sous l'effondrement,
   l'échelle descendait jusqu'à DPR_MIN 0,5 — un pixel 3D pour six pixels d'écran sur un iPhone. Désormais DEUX planchers par réglage :
   le NET (où l'on s'arrête en régime normal) et le BAS (qu'on ne franchit JAMAIS, même effondré) — NETTE 1,25 / 1,0 · RAPIDE 0,85 / 0,7.
   Sous 1,0 en NETTE, le joueur a choisi la netteté : on garde l'image, quitte à perdre des images par seconde. */
/* NETTE PAR PALIER (2026-10-14, passe perf mobile — GRAPHISME : « l'iPhone tourne en RAPIDE par défaut, DPR 1 : flou sur un Retina »).
   Le départ d'une course se fait AU PLAFOND (qlDepart ≤ 5 = les crans invisibles : qlDpr rend `cap`) ; pl/bas ne sont que les PLANCHERS.
   Pixels dessinés en course = largeur × hauteur (points CSS) × curDPR² ; au départ curDPR = DPR_CAP = min(densité, RAPIDE 1 · NETTE 1,5).
   NETTE d'avant sur un iPhone 7 (667×375 pt) : 1,5 → 563 000 px, 2,25 × RAPIDE, au-dessus du budget de l'ANCIEN (vhdPx 0,45 M) avant même
   la première image. Par palier [ANCIEN, MOYEN, RÉCENT] (3e colonne = avant, identique) :
     · dprNetCap : le PLAFOND en NETTE — ANCIEN 1,25 (iPhone 7 : 391 000 px · 8 Plus / X : 476 000 ≈ le budget 0,45 M) ; MOYEN 1,35
       (iPhone 11 : 676 000 px · XS : 555 000 · SE 2 : 456 000) ;
     · dprNet / dprNetBas : le plancher NET (régime normal) et le plancher BAS (effondrement) — ANCIEN 1,0 / 0,85 (iPhone 7 : 250 000 px
       = le départ RAPIDE / 181 000 = le plancher net RAPIDE) ; MOYEN 1,15 / 0,9 (iPhone 11 : 491 000 / 300 000) ;
     · qNetDefaut : 1 = une sauvegarde qui n'a JAMAIS choisi (SAVE.d.qChoisi absent ou 0) part en NETTE sur ce palier. Tout à 0 tant que
       Sacha n'a pas tranché : RAPIDE reste le défaut partout. RAPIDE n'est touché par AUCUNE de ces lignes. `dbgNette()` décrit. */
PAL.B.dprNetCap=[1.25,1.35,1.5];PAL.B.dprNet=[1,1.15,1.25];PAL.B.dprNetBas=[.85,.9,1];/* (2026-10-14 11 h 30, passe perf mobile) NETTE PAR DÉFAUT sur le palier RÉCENT seulement (sauvegarde neuve ou jamais choisie) : mesuré (perf/mesures/v10.log, iPhone émulé) — au palier 2 NETTE = 2,25× les pixels, la puce tient (le contrôle QL redescend de lui-même s il faut) ; paliers 0-1 restent RAPIDE (vieux iPhone fluides), NETTE au choix. */PAL.B.qNetDefaut=[0,0,1];
/* (2026-10-14, passe perf mobile) ⚠ `typeof SAVE` NE PROTÈGE PAS d'un `const` encore en zone morte : au chargement, le départ au bon cran
   (`qlPose(qlDepart)`, plus bas) levait « Cannot access 'SAVE' before initialization », avalé par son try — les paliers 0-1 ne partaient
   jamais à leur cran (MOYEN au cran 0 au lieu de 2, ANCIEN au 4 de qlMin au lieu de 5). Avant la sauvegarde = RAPIDE. Palier 2 : inchangé. */
function qlNet(){try{return !!(SAVE.d&&(SAVE.d.q==='net'||SAVE.d.q==='haute'));}catch(e){return false;}}
/* L'IMAGE EN AUTOMATIQUE, SUR TÉLÉPHONE SEULEMENT (2026-10-14, session OPTIMISATION — Sacha, relayé par PILOTAGE : « oui, en automatique » :
   sur TÉLÉPHONE et seulement quand ça rame, le jeu baisse un peu le rendu pour rester fluide ; sur PC, et quand tout va bien, rien ne change ;
   le réglage IMAGE garde la main, et si le joueur choisit HAUTE, on ne baisse jamais). L'échelle QL faisait déjà le travail (crans les moins
   visibles d'abord — ombre, halo, puis la résolution EN DERNIER : verdict du 27/09 contre le « mode pixel » —, sonde contre la bride à 30 i/s,
   remontée sans yoyo). Elle ne décide plus que : sur un VRAI téléphone (TEL_NATIF : l'ordi, colonne comprise, ne bouge plus), en COURSE
   (ni menus, ni atelier, ni photos), et pas en HAUTE. IMAGE : RAPIDE → NETTE → HAUTE (RAPIDE et NETTE restent automatiques ; HAUTE = la
   résolution NETTE, tout au plus haut, jamais baissé). */
function qHaute(){try{return !!(SAVE.d&&SAVE.d.q==='haute');}catch(e){return false;}}
function qlAuto(){return TEL_NATIF&&!qHaute()&&started&&!gameOver;}
function qSuivant(q){return q==='fast'?'net':q==='net'?'haute':'fast';}
function qLbl(){const q=SAVE.d.q;return q==='haute'?'HAUTE':q==='net'?'NETTE':'RAPIDE';}
function qlBornes(){ // les crans de résolution se recalculent (RAPIDE/NETTE, écran)
  const cap=DPR_CAP,net=qlNet(),pl=Math.min(cap,net?PAL.b('dprNet',1.25):.85),bas=Math.min(pl,Math.max(DPR_MIN,net?PAL.b('dprNetBas',1):.7)), // (2026-10-14, passe perf mobile) planchers NETTE par palier — voir NETTE PAR PALIER
        nA=Math.max(0,Math.ceil((cap-pl)/.08-1e-6)),nB=Math.max(0,Math.ceil((pl-bas)/.08-1e-6)),kNet=QL.N_EFF+nA,kBas=kNet+nB;
  return {cap,pl,bas,nA,nB,kNet,kBas,kMax:kBas+1};}
function qlDpr(k,b){ // la résolution que vaut le cran k
  if(k<=QL.N_EFF)return b.cap;
  if(k<=b.kNet)return b.cap-(b.cap-b.pl)*(k-QL.N_EFF)/Math.max(1,b.nA);
  return Math.max(b.bas,b.pl-(b.pl-b.bas)*(k-b.kNet)/Math.max(1,b.nB));}
function qlPose(k){ const b=qlBornes();k=Math.max((VHD.on||QL.force)?0:PAL.b('qlMin',0),Math.min(b.kMax,k|0));if(qHaute())k=0;QL.k=k; /* (OPTIMISATION) HAUTE : jamais baissé */ // (2026-10-14, passe perf mobile) le cran sous lequel ce palier ne remonte pas — voir LE DÉPART AU BON CRAN
  const om=VHD.on?VHD.ombre:k>=4?512:k>=2?768:QL.ombre0; // (2026-09-28) l'ACCUEIL en haute définition a sa carte d'ombre à lui (voir VHD)
  if(sun.shadow.mapSize.x!==om){if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.mapSize.set(om,om);} // recrée la carte, zéro recompilation
  const br=k>=3?.75:1;if(br!==BLOOM_RES){BLOOM_RES=br;if(bloomPass&&bloomPass._W)bloomPass.setSize(bloomPass._W,bloomPass._H);}
  FLOU_OK=k<5;
  if(bloomPass)bloomPass.enabled=!REDUCED_MOTION&&k<b.kMax&&!PAL.b('bloomOff',0); /* (2026-10-24, allègement mobile) palier 0 : plus de bloom du tout (une passe plein écran de moins) — `?bloom=1` le rend */
  if(k<1&&renderer.shadowMap.autoUpdate===false)renderer.shadowMap.autoUpdate=true;
  const d=VHD.on?VHD.dpr:Math.min(qlDpr(k,b),devicePixelRatio);if(Math.abs(d-curDPR)>.001){curDPR=d;applyDPR();}
  QUAL_MED=k>0;QUAL_LOW=!!bloomPass&&!bloomPass.enabled&&!REDUCED_MOTION;return k;}
function qlReprise(){ // RAPIDE⇄NETTE : le choix du joueur rend la pleine résolution tout de suite (les crans invisibles restent, l'échelle redescendra si besoin)
  QL.mur=0;QL.murT=0;QL.roseT=0;QL.up=0;QL.efT=0;QL.effondre=false;QL.essai=null;QL.plafT=0;curDPR=-1;qlPose(Math.min(QL.k,QL.N_EFF));}
window.dbgNette=function(){ const b=qlBornes(),pt=innerWidth*innerHeight,S9=(typeof SAVE!=='undefined'&&SAVE.d)||{}; // (2026-10-14, passe perf mobile) banc : la définition et ce qu'elle coûte en pixels — voir NETTE PAR PALIER
  return {palier:PAL.n,q:S9.q,choisi:S9.qChoisi|0,netDefaut:PAL.b('qNetDefaut',0),dpr:+devicePixelRatio.toFixed(2),cap:+DPR_CAP.toFixed(2),pl:+b.pl.toFixed(2),bas:+b.bas.toFixed(2),
    curDPR:+curDPR.toFixed(2),cran:QL.k,kNet:b.kNet,kBas:b.kBas,vhd:VHD.on,px:Math.round(pt*curDPR*curDPR),pxCap:Math.round(pt*b.cap*b.cap),pxPl:Math.round(pt*b.pl*b.pl),pxBas:Math.round(pt*b.bas*b.bas),
    budgets:{dprNetCap:PAL.B.dprNetCap,dprNet:PAL.B.dprNet,dprNetBas:PAL.B.dprNetBas,qNetDefaut:PAL.B.qNetDefaut}};};
/* L'ACCUEIL EN HAUTE DÉFINITION — VHD (2026-09-28, Sacha : « est-ce que tu peux pousser les graphismes au max, juste pour l'écran
   d'accueil »). Toute l'échelle QL est taillée pour la COURSE (60 i/s sous la pluie de particules, à 1 400 km/h) ; la vitrine, elle,
   c'est une caisse arrêtée sur une route, sous un ciel — une AFFICHE. Tant que l'accueil est à l'écran (vitrine qui tourne : ni
   garage, ni course), on y met tout ce que la machine a :
     · la RÉSOLUTION PLEINE de l'écran — et au-delà sur l'ordi : sur-échantillonnée ×1,5 (anticrénelage par le haut), sous un
       budget de pixels (8,3 M = la 4K sur l'ordi, 3,2 M = un iPhone plein sur téléphone, où l'on s'arrête à la densité de l'écran).
       ⚠ Dans la COLONNE de l'ordi, `devicePixelRatio` = le zoom du cadre (2,3 sur 1 920 px) : le jeu d'ordinaire calculait sa 3D à
       1 ou 1,5 et l'ÉTIRAIT — c'est le gros du flou que l'on voyait sur PC ;
     · l'OMBRE en carte 4096 (2048 sur téléphone) au lieu de 1024-1280 : la caisse pose sur le bitume avec une ombre au trait ;
     · le FILTRAGE de la route et de sa peinture au maximum de la carte (×16) — on la regarde rasante, c'est là qu'elle se lit ;
     · l'échelle QL au cran 0 (bloom plein, flou, ombre pleine) et MISE EN VEILLE : c'est VHD qui tient la résolution.
   FILET : si la machine ne suit pas (plus d'un quart des images au-delà de 22 ms, hors cadence 30 Hz imposée), la résolution de
   la vitrine descend d'un cran (×0,8) toutes les 1,5 s, jamais sous le plafond ordinaire. En sortant (garage, départ de course),
   tout revient À L'IDENTIQUE : l'échelle reprend le cran qu'elle avait, sa carte d'ombre et sa résolution. Les bascules tombent
   sous le volet (ecranWipe) : la réallocation des cibles ne se voit pas. `?hd=0` coupe le mode (comparer) ; `dbgVHD()` le décrit. */
const VHD={on:false,dpr:1,max:1,ombre:2048,t:0,k0:0,lT:0,bT:0,sT:0,mur:0,murT:0,monteT:0,bride:0,log:[],bas:0,haut:0,off:/[?&]hd=0/.test(location.search)}; // (2026-10-13) max = la pleine définition de cet écran ; lT/bT = lenteur/marge TENUES ; sT = sonde en cours ; mur = le cran qui vient d'échouer (voir LE FILET v2)
/* ===== LA VITRINE À LA MESURE DE L'ÉCRAN (2026-10-24, passe perf PC : « la carte graphique sature au menu et à l'écran de fin ») =====
   MESURÉ par le chef (Mac M4, Chrome, colonne 844×390 zoomée ×1,536 → devicePixelRatio 3,07 DANS le jeu, l'écran en montre 2592×1198) :
   le sur-échantillonnage ×1,5 de l'ordi (voir VHD : l'anticrénelage par le haut) bute sur le plafond 4 → toile 3376×1560 = 5,27 M de
   pixels, 1,69× ce que l'écran affiche (la page les réduit ensuite en bilinéaire), ombre 4096 → GPU 22 ms/image au menu (p90 42) et
   49,5 ms à l'écran de fin (p90 62), où la lecture de la carte moteur attend la puce (34 % du fil principal).
   `?vhdecran=1` (ORDI seulement, TEL_NATIF faux) : la vitrine jamais au-delà des pixels RÉELS de l'écran — plafond = devicePixelRatio du
   document du jeu, zoom du cadre compris → 2591×1197 = 3,10 M de pixels (−41 %, halo compris : sa base est taillée sur la toile) ;
   `?vhdecran=2` : pareil + ombre de la vitrine 2048 au lieu de 4096 (4× moins de texels de profondeur remplis et écrits à chaque image).
   C'est un changement d'image (anticrénelage, bord de l'ombre) : Sacha l'a regardé en ligne et l'a gardé — `=2` par défaut (voir VHE_MODE). Le téléphone
   (TEL_NATIF) et les tables PAL ne changent pas d'un bit. `dbgVhdEcran()` chiffre la toile d'avant/après sur l'écran du banc. */
/* (2026-10-24, Sacha, après avoir regardé ?vhdecran=2 sur le site : « c'est bon, active-le par défaut sur ordi ») LA VARIANTE 2 PAR DÉFAUT sur l'ordi :
   les pixels de l'écran + ombre 2048 (menu : GPU 16 → 6,4 ms, 53 → 59 i/s). `?vhdecran=0` = l'ancienne vitrine (×1,5, ombre 4096), `?vhdecran=1` = sans l'ombre 2048. */
const VHE_MODE=TEL_NATIF?0:(function(){const m=/[?&]vhdecran=([012])\b/.exec(location.search);return m?+m[1]:2;})();
window.dbgVhdEcran=function(){ const px=Math.max(1,innerWidth*innerHeight),bud=TEL_NATIF?PAL.b('vhdPx',3.2e6):8.3e6,f9=function(d){return Math.max(DPR_CAP,Math.min(d,Math.sqrt(bud/px),4));},a9=f9(devicePixelRatio*(TEL_NATIF?1:1.5)),b9=f9(devicePixelRatio);
  return {mode:VHE_MODE,tel:TEL_NATIF,vhd:VHD.on,dprEcran:+devicePixelRatio.toFixed(3),dprAvant:+a9.toFixed(3),dprApres:+b9.toFixed(3),pxEcran:Math.round(px*devicePixelRatio*devicePixelRatio),pxAvant:Math.round(px*a9*a9),pxApres:Math.round(px*b9*b9),
    toile:[renderer.domElement.width,renderer.domElement.height],ombre:sun.shadow.mapSize.x,bloom:bloomPass&&bloomPass.renderTargetsHorizontal?[bloomPass.renderTargetsHorizontal[0].width,bloomPass.renderTargetsHorizontal[0].height]:null};};
/* ===== L'ÉCRAN DE FIN DE L'ORDI À LA RÉSOLUTION DE LA COURSE (2026-10-24, passe perf PC : « la carte graphique sature à l'écran de fin ») =====
   MESURÉ (Mac M4, cadre bureau, `dbgCout`) : à la mort la vitrine HD s'allume (`vhdMort` RÉCENT) — toile 3376×1560 (5,27 M de pixels), ombre 4096,
   halo 1418×655 — et la carte graphique passe de 4 ms (course) à 49,5 ms par image (p90 62) ; la lecture de la carte moteur attend derrière
   (34 % du fil principal, 48 images > 50 ms en 13 s). Or dans la colonne le voile de l'écran de fin (`body.touch #overlay[data-ecran="dead"]::before`,
   opacité .9, charte-2-ecrans.css) couvre la scène à 90 % : on payait la haute définition d'une image qu'on voit à 10 %. Sur l'ORDI (TEL_NATIF faux),
   l'écran de fin garde la toile, l'ombre et le halo de la course (×7 moins de pixels), et ni la mort ni le REJOUER ne réallouent plus les cibles.
   Le téléphone et les tables PAL ne changent pas. `?pcmort=0` = la haute définition à la mort, comme avant. */
/* ===== LE TÉLÉPHONE AU FRAIS (2026-10-24, passe perf, Sacha : « trouve un moyen de ne plus le faire chauffer » — et, pour le menu à 30 i/s : « oui, 30 i/s hors course ») =====
   Sa partie enregistrée sur l'iPhone 13 Pro (enregistreur, 164 s) : 30-40 i/s dès la 1re minute, 17-22 à la fin, la qualité qui descend au cran 9 — un téléphone qui chauffe
   se bride, et tout ce qu'il calcule pour rien hors course le chauffe pour la partie suivante. Sur un VRAI téléphone (TEL_NATIF), tous paliers : l'accueil, le garage et la
   boutique à 30 i/s (le `hors30` des vieux paliers, voir HC dans cadence.js) ; l'écran de fin à la résolution de la course (PCM_ON, ci-dessous : la vitrine HD ne s'y allume
   plus sous le voile à 90 %) ; la scène derrière l'écran de fin une image sur deux au moins (`mortImg`). La COURSE n'est pas touchée. L'ordi ne change pas.
   `?frais=0` = comme avant. */
const PFR_ON=TEL_NATIF&&!/[?&]frais=0\b/.test(location.search);
const PCM_ON=(!TEL_NATIF||PFR_ON)&&!/[?&]pcmort=0\b/.test(location.search); /* (2026-10-24) le téléphone aussi, par le mode frais */
function vhdDpr(){ const px=Math.max(1,innerWidth*innerHeight),bud=TEL_NATIF?PAL.b('vhdPx',3.2e6):VHD_PX_PC; // (2026-10-14) le budget du téléphone se taille sur son palier (voir LE DÉPART AU BON CRAN)
  return Math.max(DPR_CAP,Math.min(devicePixelRatio*(TEL_NATIF||VHE_MODE?1:1.5),Math.sqrt(bud/px),4));} /* (2026-10-24, passe perf PC) `?vhdecran=1|2` : sans le ×1,5 sur l'ordi (voir LA VITRINE À LA MESURE DE L'ÉCRAN) */
function vhdAniso(on){ const m=renderer.capabilities.getMaxAnisotropy(),n=on?m:Math.min(ALLEGE?4:8,m);
  for(const t of [ASPH_TEX,LIGNE_TEX])if(t&&t.anisotropy!==n){t.anisotropy=n;t.needsUpdate=true;}}
function vhdBascule(on){ if(VHD.off||on===VHD.on)return;
  if(on){VHD.k0=QL.k;VHD.dpr=VHD.max=vhdDpr();VHD.lT=VHD.bT=VHD.sT=0;VHD.ombre=Math.min(TEL_NATIF?PAL.b('vhdOmbre',2048):VHE_MODE===2?2048:4096,renderer.capabilities.maxTextureSize);VHD.t=0;VHD.on=true;curDPR=-1;qlPose(0);}
  else{VHD.on=false;curDPR=-1;qlPose(VHD.k0);}
  vhdAniso(on);}
function vhdMonte(now,vrai){ // (2026-10-13, LE FILET v2) un cran de netteté qui revient (×1,25), jamais au-delà de l'écran ni vers le cran qui vient d'échouer ;
  // vrai = le coût mesuré par la sonde (ms) : on ne monte que si l'image agrandie (coût ∝ pixels, pessimiste) tient encore sous 14 ms
  const d9=Math.min(VHD.max,VHD.dpr*1.25);if(VHD.murT&&now-VHD.murT<45000&&d9>VHD.mur-.02)return false;
  if(d9<VHD.dpr+.02||(vrai&&vrai*(d9/VHD.dpr)*(d9/VHD.dpr)>14))return false;VHD.dpr=d9;VHD.haut++;VHD.monteT=now;vhdNote(now,'monte');curDPR=-1;qlPose(0);return true;}
function vhdNote(now,quoi){VHD.log.push([Math.round(now/100)/10,quoi,+VHD.dpr.toFixed(2),+QLR.vrai.toFixed(1),+QLR.p75.toFixed(1),+QLR.p90.toFixed(1)]);if(VHD.log.length>12)VHD.log.shift();} // (banc) dbgVHD().journal
addEventListener('resize',function(){if(VHD.on){VHD.dpr=VHD.max=vhdDpr();VHD.murT=0;curDPR=-1;qlPose(0);}}); // téléphone tourné, fenêtre retaillée : le budget de pixels se recalcule
/* LE DÉPART AU BON CRAN, PAR PALIER (2026-10-14, passe perf mobile — voir PAL). MESURÉ (iPhone 7 émulé 667×375, avant) : l'accueil était
   calculé en 1067×600 avec une carte d'ombre 2048 (le budget VHD « téléphone » = 3,2 M de pixels, celui d'un iPhone 15 Pro), l'écran de fin
   de partie pareil — avec le niveau entier derrière (~1 M de triangles) —, puis chaque course repartait du cran 0 (ombre 1024, halo plein,
   flou radial) et l'échelle QL mettait des dizaines de secondes de saccades à redescendre, un cran toutes les 1,1 s. À CHAQUE partie.
   Un vieux téléphone commence désormais LÀ OÙ IL FINISSAIT :
     · qlDepart : le cran posé au démarrage — ANCIEN : les 5 allègements « invisibles » d'emblée (ombre 512, halo ¾, plus de flou radial) ;
       MOYEN : ombre ½ en vol + ombre 768 ; RÉCENT : cran 0, comme avant. L'échelle descend toujours plus bas si besoin ;
     · qlMin : le cran sous lequel l'échelle ne REMONTE pas. Sur l'ANCIEN, 4 (ombre 512 + halo ¾ tenus) : chaque remontée réalloue une carte
       d'ombre et des cibles — un à-coup — pour les reperdre dix secondes plus tard au premier envol. Le flou radial, lui, peut revenir ;
     · vhdPx / vhdOmbre : l'accueil haute définition garde sa belle caisse (Léo, 10/10) mais à la mesure de la puce — ANCIEN : 0,45 M de
       pixels (≈ densité 1,3 sur un iPhone 7) et ombre 1024 ; MOYEN et RÉCENT : 1,4 M et 2048 (3,2 M jusqu'au 20/10 : accrocs au garage sur iPhone 15). Le FILET de VHD
       (baisse ×0,8 si l'image traîne) reste par-dessus ;
     · vhdMort : l'écran de fin de partie en haute définition ? RÉCENT seulement — sur les deux autres il garde la résolution et les crans
       de la course (plus de réallocation des cibles et de la carte d'ombre à chaque mort ET à chaque REJOUER).
   `dbgQual(k)` (banc) passe outre qlMin. `?palier=2` rend exactement le comportement d'avant. */
PAL.B.bloomOff=[/[?&]bloom=1/.test(location.search)?0:1,0,0];PAL.B.qlDepart=[5,2,0];PAL.B.qlMin=[4,0,0];PAL.B.vhdPx=[.45e6,1.4e6,1.4e6]; /* (2026-10-20, Léo) MOYEN et RÉCENT plafonnés à 1,4 M (densité ~2 sur iPhone 15) : à 3,2 M (densité 3) le garage et la boutique tombaient à 41-58 i/s avec des accrocs de 200-700 ms, mesuré sur l'iPhone 15 de Léo le 16/10 ; c'est le réglage de son appli */PAL.B.vhdOmbre=[1024,2048,2048];PAL.B.vhdMort=[0,0,1];
if(PAL.b('qlDepart',0)>0){try{qlPose(PAL.b('qlDepart',0));}catch(e){}}
window.dbgVHD=function(){return {on:VHD.on,dpr:+curDPR.toFixed(2),max:+VHD.max.toFixed(2),baisses:VHD.bas,remontees:VHD.haut,bride:VHD.bride?Math.round((performance.now()-VHD.bride)/1000)+' s':null,mur:(VHD.murT&&performance.now()-VHD.murT<45000)?+VHD.mur.toFixed(2):null,vrai:QLR.vraiT?+QLR.vrai.toFixed(1):null,journal:VHD.log,dprEcran:+devicePixelRatio.toFixed(2),plafondCourse:+DPR_CAP.toFixed(2),
  px:Math.round(innerWidth*innerHeight*curDPR*curDPR),ombre:sun.shadow.mapSize.x,aniso:ASPH_TEX?ASPH_TEX.anisotropy:null,bloom:bloomPass?(bloomPass.enabled?BLOOM_RES:0):null,crans:QL.k};};
window.dbgDPR=function(d,sansPique){RESPIN=true;curDPR=+d;applyDPR();if(sansPique&&acesPass&&acesPass.uniforms.uSharp)acesPass.uniforms.uSharp.value=0;return {dpr:curDPR,pique:acesPass&&acesPass.uniforms.uSharp?+acesPass.uniforms.uSharp.value.toFixed(3):null};}; // (tour 2) banc : une résolution, sans rien d'autre (fige l'échelle)
/* (2026-09-28, passe graphismes mobile) BANC : chaque petite technique s'éteint et se rallume À CHAUD (des uniformes : zéro recompilation),
   pour comparer la même image avec et sans. `dbgGfx({coeur:0,trame:0,pique:0})` = le rendu d'avant ; `dbgGfx()` décrit. */
window.dbgGfx=function(o){
  if(o){if(o.coeur!=null)GFX_U.uCoeur.value=o.coeur===true?1.16:(+o.coeur||1);if(o.glace!=null)GLACE.k=o.glace===true?1:+o.glace;
    if(o.cotonOpaque!=null&&COTON.mat){COTON.mat.transparent=!o.cotonOpaque;COTON.mat.depthWrite=true;}
    if(o.trame!=null&&acesPass)acesPass.uniforms.uTrame.value=o.trame?1/255:0;
    if(o.pivot!=null)POST_PIVOT=+o.pivot; // (2026-10-14, chaîne de couleur) le pivot du contraste, à chaud (.5 = l'image d'avant)
    if(o.haloNorme!=null&&bloomPass)bloomPass.norme=!!o.haloNorme; // (2026-10-14, chaîne de couleur) le halo à largeur d'écran constante, à chaud
    if(o.pique!=null&&acesPass){RESPIN=true;acesPass.uniforms.uSharp.value=+o.pique;}}
  return {coeur:GFX_U.uCoeur.value,glace:+ROAD_U.uGlace.value.toFixed(3),trame:acesPass?+(acesPass.uniforms.uTrame.value*255).toFixed(2):null,pique:acesPass?+acesPass.uniforms.uSharp.value.toFixed(3):null,dpr:curDPR,natif:devicePixelRatio,daSat:+DA.sat.toFixed(4)};};
window.dbgSonde=function(go){if(go){QLR.sync=go==='sync'?1:0;qlSondeArme();}return {vrai:+QLR.vrai.toFixed(2),age:QLR.vraiT?Math.round(performance.now()-QLR.vraiT):null,mesures:QLR.dern&&QLR.dern.map(function(x){return +x.toFixed(1);}),cpuGpu:QLR.cg,chrono:!!QLT.ok,sN:QLR.sN,enRoute:QLR.S.pend};}; // (banc) dbgSonde(1) lance la sonde, dbgSonde() la lit
window.dbgQual=function(k){ if(k!=null){QL.force=true;qlPose(k);RESPIN=true;} const b=qlBornes(); // dbgQual(k) force le cran k ET fige (dbgPin(false) relâche)
  const al=[];for(let i=0;i<QL.N_EFF&&i<QL.k;i++)al.push(QL.nom[i]);
  return {k:QL.k,kNet:b.kNet,kMax:b.kMax,plancher:+b.pl.toFixed(2),dpr:+curDPR.toFixed(3),effondre:QL.effondre,mur:(QL.murT&&performance.now()-QL.murT<45000)?QL.mur:0,
    ombre:sun.shadow.mapSize.x,ombreVolDemi:renderer.shadowMap.autoUpdate===false,bloom:bloomPass?(bloomPass.enabled?BLOOM_RES:0):null,flou:FLOU_OK,allege:al};};
/* LE MONITEUR (?perf=1 dans l'adresse) — une ligne de texte en haut à gauche, rien d'autre : ms/image (moyenne lissée + pire de la
   dernière seconde), images/s, résolution (actuelle/plafond), cran de l'échelle et ce qui est allégé. Éteint par défaut (charte :
   rien de développement à l'écran). Réécrit 4 fois par seconde, et seulement si le texte change. */
const PERF_MON=/[?&]perf=1/.test(location.search)?(function(){const e=document.createElement('div');e.id='perfMon';
  e.style.cssText='position:fixed;left:calc(var(--sL) + 6px);top:calc(var(--sT) + 4px);z-index:2147483000;pointer-events:none;'+
    'font:var(--f0)/1.6 var(--pix);color:var(--tx);background:var(--k1);padding:2px 5px;white-space:pre;max-width:70vw';
  document.body.appendChild(e);return {el:e,t:0,pire:0,txt:''};})():null;
/* (2026-10-14, session OPTIMISATION — Sacha : « la version mobile saccade, juste de quoi tester en bonne condition ») LE RELEVÉ DES À-COUPS :
   le moniteur ne disait que la dernière seconde. Il garde maintenant chaque image de plus de 50 ms depuis l'ouverture : combien (> 50,
   > 100, > 250 ms), et les 5 dernières avec ce qui se passait — l'écran (menu, atelier, course, fin), le niveau, une construction de
   niveau (newTrack il y a < 1 s), les PROGRAMMES compilés et les TEXTURES envoyées pendant l'image. Une capture d'écran suffit. */
function perfAcoup(now,rawMs){const M=PERF_MON,I=renderer.info,np=(I.programs||[]).length,nt=I.memory.textures,dp=np-(M.np|0),dt9=nt-(M.nt|0);M.np=np;M.nt=nt;
  if(!M.t0)M.t0=now;if(rawMs<=50||!M.vu){M.vu=1;return;}
  M.n50=(M.n50|0)+1;if(rawMs>100)M.n100=(M.n100|0)+1;if(rawMs>250)M.n250=(M.n250|0)+1;if(rawMs>(M.max|0))M.max=rawMs;
  const ou=started&&!gameOver?'course':gameOver?'fin':(typeof garageOn!=='undefined'&&garageOn)?'atelier':'menu';
  const cs=[];if(loop._rebuildT&&now-loop._rebuildT<1000)cs.push('construction');if(dp>0)cs.push('+'+dp+' prog');if(dt9>0)cs.push('+'+dt9+' tex');
  (M.L||(M.L=[])).push(Math.round((now-M.t0)/1000)+' s · '+Math.round(rawMs)+' ms · '+ou+(LVL.cur?' '+LVL.cur.id:'')+(cs.length?' · '+cs.join(' '):''));if(M.L.length>5)M.L.shift();}
function perfMonTick(now,rawMs){const M=PERF_MON;if(rawMs>M.pire)M.pire=rawMs;try{perfAcoup(now,loop._brut||rawMs);}catch(e){}if(now-M.t<250)return;M.t=now;
  const ms=loop._ms||16,al=[];for(let i=0;i<QL.N_EFF&&i<QL.k;i++)al.push(QL.nom[i]);const b=qlBornes();
  if(QL.k>b.kNet)al.push(QL.k>=b.kMax?'SOUS LE PLANCHER + BLOOM OFF':'SOUS LE PLANCHER');
  const tx=ms.toFixed(1)+' ms  pire '+M.pire.toFixed(0)+'  '+Math.round(1000/Math.max(1,ms))+' i/s'+(loop._r30?'  (30 Hz)':'')+(CAD.on?'  30 i/s CALÉ':'')+(QLR.vraiT?'  vrai '+QLR.vrai.toFixed(1):'')+(QL.bride&&now-QL.bride<3000?'  ÉCRAN BRIDÉ':'')+'  p50/75/90 '+QLR.p50.toFixed(0)+'/'+QLR.p75.toFixed(0)+'/'+QLR.p90.toFixed(0)+(QL.essai?'  essai':'')+
    '\nPALIER '+PAL.n+' ('+PAL.src+')  DPR '+curDPR.toFixed(2)+'/'+DPR_CAP.toFixed(2)+'  cran '+QL.k+'/'+b.kMax+(RESPIN?'  FIGE':'')+(bloomPass&&!bloomPass.fuse?'  bloom ancien':'')+'\n'+(al.length?al.join(' · '):'plein')
    +'\nÀ-COUPS en '+Math.round((now-(M.t0||now))/1000)+' s : '+(M.n50|0)+' > 50 ms · '+(M.n100|0)+' > 100 · '+(M.n250|0)+' > 250 · pire '+Math.round(M.max|0)+' ms'+(M.L&&M.L.length?'\n'+M.L.join('\n'):'');
  if(now-(M.p0||0)>1000){M.p0=now;M.pire=0;}
  if(tx!==M.txt){M.txt=tx;M.el.textContent=tx;}}
// ============================================================================
//  NUAGES — MESH SIMPLES (refonte 2026-07-20, décision de Sacha)
//  Le raymarch volumétrique est SUPPRIMÉ. Pourquoi, précisément : après six rondes
//  de correctifs ratés sur le clignotement, la capture vidéo a montré la panne
//  réelle — quand la caméra entrait dans la MATIÈRE d'un nuage, le shader basculait
//  l'alpha à 1.0 D'UN COUP (`if(tHit<=t0+0.002)a=1.0`), donc PLEIN ÉCRAN blanchi sur
//  une frame, puis retour. Mesuré sur la vidéo : 10 frames blanchies sur 411, soit un
//  flash toutes les ~1,3 s. Aucun réglage ne pouvait corriger ça : ce n'était pas un
//  réglage, c'était une marche d'escalier dans le shader.
//  Avec des mesh OPAQUES, ce bug devient STRUCTURELLEMENT impossible : plus de
//  transparence (donc plus d'ordre de tri entre nuages), plus de gl_FragDepth, plus
//  de discard, plus de raymarch, plus d'uniformes poussés à chaque frame.
//  Un nuage = quelques SPHÈRES FUSIONNÉES en UN seul mesh, éclairé par les lumières
//  du biome (Lambert → il suit les 10 ambiances tout seul). On le TRAVERSE toujours :
//  DoubleSide et aucune collision — dedans, on voit sa paroi, c'est le white-out.
//  ⚠ NE PAS réintroduire de transparence ni de shader ici sans demande explicite.
// ============================================================================
// BRILLANCE (2026-07-30) : Lambert → Phong. Un spéculaire LARGE et doux (shininess bas) fait NAPPER la
// lumière sur les bourgeons au lieu de piquer — c'est ce qui donne l'ourlet lumineux des vraies photos.
// + un soupçon d'emissive pour que la ouate ne meure jamais en gris dans les biomes sombres.
/* LE MODELÉ DES NUAGES v2 (2026-09-26) — MESURÉ sur captures : les nuages se lisaient en PILES D'ASSIETTES (des stries horizontales
   dans chaque boule) et on voyait leur intérieur. Deux causes, aucune n'était un réglage :
   (1) DoubleSide + transparent : les faces ARRIÈRE de chaque sphère se peignaient dans l'ordre des triangles, tantôt devant tantôt
       derrière les faces avant de l'anneau voisin → des bandes. Hors du nuage, on n'a AUCUNE raison de voir l'envers de la ouate :
       `CLOUD_MAT` est en FrontSide (moitié moins de pixels à mélanger : un titan plein écran ne se paie plus deux fois).
       DEDANS (la caméra dans l'ellipsoïde, voir updateClouds), le nuage prend `CLOUD_MAT_IN` — la même matière en DoubleSide :
       le white-out d'avant, paroi comprise. Les DEUX programmes sont chauffés au menu (`nuageChauffe`).
   (2) les boules fusionnées gardaient leurs morceaux ENFOUIS dans les voisines : à 82 % d'opacité on les voyait par transparence.
       `mergeSpheres` jette désormais tout triangle entièrement noyé dans une autre boule (moins de sommets, en prime).
   LE MODELÉ : une couleur par sommet cuite une fois (ventre ombré bleuté → sommet blanc, creux entre deux bourgeons assombris)
   et, dans le shader, la LISIÈRE D'ARGENT — face au soleil, le bord de la ouate s'embrase (diffusion avant) — plus un bord
   à peine plus léger. Coût : zéro par image côté CPU, quelques instructions par pixel côté GPU (et deux fois moins de pixels). */
const GFX_U={uCoeur:{value:1.16},uNearF:{value:new THREE.Vector2(10,40)},uUpV:{value:new THREE.Vector3(0,1,0)},uNuSun:{value:new THREE.Vector3(1.1,.98,.84)},uNuSky:{value:new THREE.Vector3(.9,.98,1.2)},uNuGnd:{value:new THREE.Vector3(.98,.94,1.2)},uDragon:{value:new THREE.Vector3(1,.92,1.08)}}; // uNearF : le fondu des nuages de coton près de l'objectif (m) — 10-40 au sol, 30-110 en vol (posé par la boucle) // (2026-09-28, passe graphismes mobile) le cœur plein des nuages (1 = l'ancienne ouate à 82 % partout) — voir dbgGfx
/* (2026-10-20, Léo : « ils seraient interactifs quand la voiture les touche : ça les dégage ») LES TROUÉES : huit sphères de monde (xyz, rayon) où la ouate est EFFACÉE, par marches de cubes
   (la grille `uHoleC` m : le bord d'une trouée est fait de cubes, pas rond) ; posées et animées par nuCasseTick (nuages-casses.js) — un tunnel qui se referme derrière la caisse. */
/* (2026-10-21, Léo : « c'est pas tout le nuage qui flashe, c'est en fonction de où la lumière va ») LES LUMIÈRES D'ÉCLAIR : douze points de monde (xyz, intensité w) posés le long des fils et des coups ; la ouate s'éclaire
   AUTOUR d'eux (gaussienne de rayon uBoltR), pas en bloc. */
const NBOLT={uBolt:{value:[0,1,2,3,4,5,6,7,8,9,10,11].map(function(){return new THREE.Vector4(0,0,0,0);})},uBoltR:{value:95}};
const NHOLE={uHole:{value:[0,1,2,3,4,5,6,7].map(function(){return new THREE.Vector4(0,0,0,0);})},uHoleC:{value:3.2}};
function nuageShader(sh){
  sh.uniforms.uHole=NHOLE.uHole;sh.uniforms.uHoleC=NHOLE.uHoleC;sh.fragmentShader=sh.fragmentShader.replace('void main() {','void main() {\n{vec3 w9=cameraPosition+(-vViewPosition)*mat3(viewMatrix);for(int i9=0;i9<8;i9++){vec4 h9=uHole[i9];if(h9.w>.01&&distance((floor(w9/uHoleC)+.5)*uHoleC,h9.xyz)<h9.w)discard;}}').replace('#include <common>','#include <common>\nuniform vec4 uHole[8];uniform float uHoleC;');
  sh.uniforms.uSunV=RIM_U.uSunV;sh.uniforms.uSunC={value:sun.color};sh.uniforms.uCoeur=GFX_U.uCoeur;sh.uniforms.uNearF=GFX_U.uNearF;
  sh.uniforms.uUpV=GFX_U.uUpV;sh.uniforms.uNuSun=GFX_U.uNuSun;sh.uniforms.uNuSky=GFX_U.uNuSky;sh.uniforms.uNuGnd=GFX_U.uNuGnd;sh.uniforms.uDragon=GFX_U.uDragon; // (Dragons) la lumière de peintre // la direction du soleil en espace vue (posée chaque image pour les caisses) et SA couleur de biome
  sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_begin>',LFB_SANS_PL) // (2026-09-26) les nuages ne paient plus les lumières ponctuelles (voir LFB_SANS_PL)
    .replace('#include <common>','#include <common>\nuniform vec3 uSunV,uSunC,uUpV,uNuSun,uNuSky,uNuGnd,uDragon;uniform float uCoeur;uniform vec2 uNearF;')
    .replace('#include <envmap_fragment>',[
      '#ifdef NUAGE_DEDANS',                                              // DEDANS : ni liseré ni bord — la paroi se fond dans la brume du nuage (white-out uni)
      '#ifdef USE_FOG',
      '  outgoingLight=mix(outgoingLight,fogColor,.55);',
      '#endif',
      '#else',
      '{ vec3 V9=normalize(vViewPosition);float fr9=1.-abs(dot(normal,V9));',
      '  float cs9=max(dot(-V9,uSunV),0.);',                              // 1 = on regarde droit vers le soleil
      // LA LUMIÈRE DE PEINTRE (2026-09-29, « Dragons ») : la ouate garde SA luminance (Phong + modelé cuit) mais sa TEINTE suit la lumière
      // du film — côté soleil crème-or (uNuSun), côté ombre bleu ciel sur les flancs (uNuSky) et lavande sous le ventre (uNuGnd), avec
      // une frontière douce (wr9) et un vrai contraste (.84 à l ombre, ×1,1 au soleil). Couleurs du biome, normalisées en luminance (bioApply).
      '  { float nl9=dot(normal,uSunV),wr9=smoothstep(-.3,.75,nl9),up9=smoothstep(.15,.85,dot(normal,uUpV)*.5+.5);',
      '    float lm9=dot(outgoingLight,vec3(.299,.587,.114));',
      '    vec3 pt9=lm9*mix(mix(uNuGnd,uNuSky,up9)*uDragon.y,uNuSun*uDragon.z,wr9)*mix(vec3(1.),outgoingLight/max(lm9,.001),.5);', // (v6) la moitié de la teinte PROPRE du nuage reste (sa couleur par instance)
      '    outgoingLight=mix(outgoingLight,pt9,uDragon.x);}',
      '  outgoingLight+=uSunC*pow(fr9,2.6)*(.07+.75*cs9*cs9*cs9);',     // LA LISIÈRE D ARGENT : le bord s embrase à contre-jour
      // LE CŒUR PLEIN (2026-09-28, « plus beau sur iPhone sans coût en plus ») : à 82 % partout, un bourgeon peint AVANT son voisin
      // de devant restait visible au travers — on lisait les boules empilées dans la ouate (arcs et bords internes, mesuré sur captures).
      // Le cœur, vu de face, monte à ~95 % ; la vapeur garde ses 82 % là où la ouate tourne (fr9 > .62) puis s allège au liseré.
      '  diffuseColor.a=min(1.,diffuseColor.a*mix(uCoeur,1.,smoothstep(.12,.62,fr9)))*(1.-pow(fr9,7.)*.45);', // le tout dernier liseré de la silhouette s allège
      '#ifdef NUAGE_INST',
      '  diffuseColor.a*=smoothstep(uNearF.x,uNearF.y,length(vViewPosition));',     // (ciel de coton) traversé, le nuage s efface AUTOUR de l objectif au lieu de claquer (10-40 m : à 60 m de l accueil il restait fantôme)
      '#endif',
      '}',
      '#endif',
      '#include <envmap_fragment>'].join('\n'));
}
// plus VAPOREUX (.9→.82) et un éclat un peu plus net sur les bourgeons
const CLOUD_MAT=new THREE.MeshPhongMaterial({color:0xeae6f2,side:THREE.FrontSide,transparent:true,opacity:.82,depthWrite:true,vertexColors:true,
  shininess:14,specular:0x8f89a4,emissive:0x201d2c,emissiveIntensity:.62,flatShading:false});
CLOUD_MAT.onBeforeCompile=nuageShader;
CLOUD_MAT.customProgramCacheKey=function(){return 'nuageV2';};
const CLOUD_MAT_IN=CLOUD_MAT.clone();CLOUD_MAT_IN.side=THREE.DoubleSide;CLOUD_MAT_IN.opacity=.93;CLOUD_MAT_IN.defines={NUAGE_DEDANS:''}; // DEDANS : la même ouate, paroi comprise (white-out) — une seule épaisseur de paroi (les boules enfouies ont sauté) : plus dense, et fondue dans la brume du nuage, sinon on y lisait les facettes
CLOUD_MAT_IN.color=CLOUD_MAT.color;CLOUD_MAT_IN.emissive=CLOUD_MAT.emissive;CLOUD_MAT_IN.specular=CLOUD_MAT.specular; // MÊMES objets couleur : bioApply teinte les deux d'un coup
CLOUD_MAT_IN.onBeforeCompile=nuageShader;CLOUD_MAT_IN.customProgramCacheKey=function(){return 'nuageV2dedans';};
const CLOUD_MAT_IN8=CLOUD_MAT_IN.clone();CLOUD_MAT_IN8.vertexColors=false;CLOUD_MAT_IN8.color=CLOUD_MAT.color;CLOUD_MAT_IN8.emissive=CLOUD_MAT.emissive;CLOUD_MAT_IN8.specular=CLOUD_MAT.specular;CLOUD_MAT_IN8.onBeforeCompile=nuageShader;CLOUD_MAT_IN8.customProgramCacheKey=function(){return 'nuageV2dedans8';}; // (v8) le white-out d'un nuage v8 : ses couleurs de sommet sont un MODELÉ cuit (creux, ombre, hauteur), pas une teinte
let nuageChaud=false,nuageFondu=1; // nuageFondu : 0→1, la ouate d'une nouvelle zone APPARAÎT au lieu de surgir (voir buildClouds)
function nuageChauffe(){ // (2026-09-26) les deux programmes de nuage compilés AU MENU — jamais au premier nuage traversé en pleine course
  nuageChaud=true;cotonInit(); // (ciel de coton) ses instances sont dans la scène : renderer.compile les prend avec
  const g=mergeSpheres([[0,0,0,.6,1],[.4,.1,0,.45,1]],2,2,2),a=new THREE.Mesh(g,CLOUD_MAT),b=new THREE.Mesh(g,CLOUD_MAT_IN),c9=new THREE.Mesh(g,nuage8Solo()),d9=new THREE.Mesh(g,CLOUD_MAT_IN8);
  a.position.copy(camera.position);b.position.copy(camera.position);a.frustumCulled=b.frustumCulled=false;if(c9){c9.position.copy(camera.position);c9.frustumCulled=false;scene.add(c9);d9.position.copy(camera.position);d9.frustumCulled=false;scene.add(d9);} // (v8) la matière des maillages seuls
  const vt9=[];{const MS=nuVitMats(true);for(const m9 of [MS.cub,MS.coe,MS.pea,MS.fan]){const x=new THREE.Mesh(g,m9);x.position.copy(camera.position);x.frustumCulled=false;scene.add(x);vt9.push(x);}} // (vitrail) les trois matières des nuages seuls
  scene.add(a);scene.add(b);try{renderer.compile(scene,camera);}catch(e){}scene.remove(a);scene.remove(b);if(c9){scene.remove(c9);scene.remove(d9);}for(const x of vt9)scene.remove(x);g.dispose();
}
// FINESSE : à 16×11 les grosses boules (r 200-700) montraient leurs FACETTES — d'où les « formes
// triangulaires ». On monte la définition sur desktop (mobile reste au gabarit léger).
const CLOUD_SPH_LO=new THREE.SphereGeometry(1,10,7); // (2026-09-30) l'ÉBAUCHE d'un coussin ou d'une tour, le temps que l'ouvrier rende la forme fine
const CLOUD_SPH=new THREE.SphereGeometry(1,(ALLEGE||IS_LOW_END)?16:20,(ALLEGE||IS_LOW_END)?11:14); // gabarit recopié/fusionné (24×16 mangeait 25 fps : 20×14 lisse assez)
// Fusionne N sphères (x,y,z,rayon en coords locales) en UNE géométrie : un nuage = un draw call.
function mergeSpheres(blobs,rx,ry,rz){
  const src=CLOUD_SPH, sp=src.attributes.position.array, sn=src.attributes.normal.array, si=src.index.array;
  const nv=sp.length/3, nb=blobs.length;
  const pos=new Float32Array(nv*3*nb), nor=new Float32Array(nv*3*nb), col=new Float32Array(nv*3*nb);
  const idx=(nv*nb<65535)?new Uint16Array(si.length*nb):new Uint32Array(si.length*nb),noy=new Uint8Array(nv*nb);let ni=0;
  // les boules en coordonnées locales : centre + demi-axes (pour savoir si un sommet est ENFOUI dans une voisine, ou s'il la frôle)
  const E=blobs.map(function(B){const fy=(B[4]===undefined?1:B[4]);return [B[0]*rx,B[1]*ry,B[2]*rz,B[3]*rx,B[3]*ry*fy,B[3]*rz];});
  const VR=.72,VG=.76,VB=.93; // (2026-09-26) le VENTRE : un bleu-lavande, l'ombre du ciel sous la ouate (jamais un gris sale)
  for(let b=0;b<nb;b++){
    // 5e composante = APLATISSEMENT VERTICAL de CETTE boule : c'est elle qui donne les bases plates
    // de cumulus et l'ENCLUME étalée du cumulonimbus (sans elle, tout est sphérique = bonbons).
    const B=blobs[b], fy=(B[4]===undefined?1:B[4]);
    const ox=B[0]*rx, oy=B[1]*ry, oz=B[2]*rz, sx=B[3]*rx, sy=B[3]*ry*fy, sz=B[3]*rz;
    const vo=b*nv*3, vb=b*nv, Eb=E[b], rb=Math.max(Eb[3],Eb[4],Eb[5]);
    const voi=[];for(let c=0;c<nb;c++){if(c===b)continue;const Ec=E[c],dx=Ec[0]-Eb[0],dy=Ec[1]-Eb[1],dz=Ec[2]-Eb[2],rc=Math.max(Ec[3],Ec[4],Ec[5]);
      if(dx*dx+dy*dy+dz*dz<(rb+rc*1.4)*(rb+rc*1.4))voi.push(Ec);} // seules les voisines qui peuvent toucher cette boule
    for(let i=0;i<nv;i++){
      const px=sp[i*3]*sx+ox, py=sp[i*3+1]*sy+oy, pz=sp[i*3+2]*sz+oz;
      pos[vo+i*3]=px; pos[vo+i*3+1]=py; pos[vo+i*3+2]=pz;
      // normale corrigée du non-uniforme (inverse des échelles), sinon l'éclairage ment sur les nuages aplatis
      let nx=sn[i*3]/sx, ny=sn[i*3+1]/sy, nz=sn[i*3+2]/sz;
      const l=Math.hypot(nx,ny,nz)||1; nor[vo+i*3]=nx/l; nor[vo+i*3+1]=ny/l; nor[vo+i*3+2]=nz/l;
      // (2026-09-26) ENFOUI dans une voisine → noté (le triangle entier sautera) ; À LA FRONTIÈRE d'une voisine → le creux s'assombrit
      let ao=0;
      for(let k=0;k<voi.length;k++){const e=voi[k],dx=(px-e[0])/e[3],dy=(py-e[1])/e[4],dz=(pz-e[2])/e[5],d2=dx*dx+dy*dy+dz*dz;
        if(d2<.9409){noy[vb+i]=1;break;} if(d2<1.96)ao+=(1.4-Math.sqrt(d2))/.43;} // (.97² et 1,4² : la racine seulement quand elle sert)
      const h=Math.max(0,Math.min(1,(py/ry+.85)/1.2)),hh=h*h*(3-2*h),o=1-.26*Math.min(1,ao); // hh : 0 au ventre, 1 passé la mi-hauteur
      col[vo+i*3]=(VR+(1-VR)*hh)*o; col[vo+i*3+1]=(VG+(1-VG)*hh)*o; col[vo+i*3+2]=(VB+(1-VB)*hh)*o;
    }
    for(let i=0;i<si.length;i+=3){const a=si[i]+vb,c1=si[i+1]+vb,c2=si[i+2]+vb;
      if(noy[a]&&noy[c1]&&noy[c2])continue; // triangle entièrement ENFOUI dans une voisine : invisible, on ne le dessine plus
      idx[ni++]=a;idx[ni++]=c1;idx[ni++]=c2;}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); // (2026-09-28, chasse aux gels) tableaux neufs et à nous : posés TELS QUELS (Float32BufferAttribute en refaisait une copie chacun)
  g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3)); // (2026-09-26) le modelé cuit (ventre, creux)
  g.setIndex(new THREE.BufferAttribute(idx.slice(0,ni),1));
  sphere9(g); // = computeBoundingSphere, au flottant près (voir pisteTranches)
  return g;
}
/* LE CIEL DE COTON — NUAGES v3 (2026-09-28, Sacha : « lance une refonte des nuages : plus de nuages, plus jolis, plus dans la forme
   classique qu'on imagine ; il faut qu'ils soient magnifiques et un peu partout autour de la route — donc ils doivent être légers »).
   AVANT : ~90 nuages, chacun SON maillage (5 à 20 boules souvent APLATIES : des « piles d'assiettes »), ~90 appels de dessin, jusqu'à
   6 000 triangles pièce même au bout du ciel.
   · LA FORME CLASSIQUE (`cotonBlobs`) : le nuage qu'on dessine enfant — une rangée de BASE aux bourgeons aplatis (le dessous plat, le
     niveau de condensation), un étage de bourgeons RONDS, un DÔME qui domine et de petits bourgeons qui débordent. Six gabarits :
     classique, bas et large, tour (congestus), flocon, banc, double dôme. Au-dessus de la base, plus aucune boule aplatie.
   · LE MODELÉ (`cotonGeo`, cuit une fois) : ventre lavande → sommet blanc sur la HAUTEUR du nuage, creux assombris entre deux
     bourgeons, le liseré d'argent du shader des nuages (inchangé) ; les faces enfouies dans une voisine ne sont pas gardées.
   · LÉGER : le décor devient des INSTANCES de six gabarits × quatre finesses (7×5 · 10×7 · 16×11 · 22×15) — ~12 appels de dessin
     pour ~350 nuages. À chaque rendu (`cotonTick`, chaîné sur scene.onBeforeRender) : hors du champ = pas envoyé, la finesse suit la
     TAILLE À L'ÉCRAN (une facette sous ~1,7° : un titan au loin garde sa rondeur, un petit nuage au loin se contente de 7×5), et
     chaque lot TRIÉ du plus loin au plus près (la ouate est translucide). Programme compilé au menu (`nuageChauffe`), 0 en course.
   · PARTOUT AUTOUR DE LA ROUTE, JAMAIS DESSUS : une couronne proche (50-350 m du bord, du dessous au-dessus du ruban), des nuages
     au-dessus et en dessous de la route, une couronne du milieu (0,4-1,3 km) et le lointain (1,3-3 km) ; les massifs et les titans du
     ciel organisé y passent aussi (gabarit tour). Garde `cotonTouche` = nuageTouche sur une grille de 120 m.
   · Restent des maillages À PART (ils ont un rôle) : les bancs SUR la route, les coussins de VOL (recharge d'airtime) et les tours
     géantes qu'on traverse (white-out) — eux aussi prennent la forme classique —, la mer, les voiles et tout ce que pose la campagne.
   · Traversé, un nuage de coton s'efface autour de l'objectif (fondu 10-40 m dans le shader) au lieu de claquer.
   Hook : `dbgCoton()` (nuages, envoyés près/loin, triangles, ms). */
const COTON={S:[],im:[],I:null,n:0,cap:560,mat:null,grid:null,root:null,L:null,M:new THREE.Matrix4(),Q:new THREE.Quaternion(),Sc:new THREE.Vector3(), // (v4) 420 → 480 : les petits nuages en plus
  P:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0),fr:new THREE.Frustum(),pv:new THREE.Matrix4(),nN:0,nF:0,tri:0,ms:0,
  SEG:[[7,5],[10,7],[16,11],[22,15]],FAC:73,CH:.45}; // les QUATRE finesses d'un gabarit ; FAC : on prend la plus légère dont une facette reste sous ~1,7° à l'écran (segments ≥ 73·R/d)
/* (2026-10-14, passe graphismes — Sacha : « dans la map chinoise il faut les mêmes nuages que dans la map normale ») LES PICS DE JADE
   PRENNENT LE CIEL DE COTON : les volutes en cubes (NUVOX, 353 000 triangles / 26 appels) ne sont plus bâties ni dessinées ; à leur place,
   les cumulus de la Mer de nuages (mêmes gabarits, mêmes instances, même matière déjà compilée au menu — rien de neuf pour la puce),
   posés par `cotonJade` ENTRE et DERRIÈRE les pics, à l'altitude de la brume. `?nucubes=1` (ou true ici) : les cubes reviennent, tels quels. */
/* LE BUDGET (session OPTIMISATION) : palier 0 ≤ 40 000 triangles / 6 appels · 1 ≤ 90 000 / 10 · 2 ≤ 180 000 / 16, par image. Tenu par
   construction : `K` = les gabarits permis (3 pour la 1re tranche, 5 ensuite), `f` = la finesse la plus fine permise par palier (donc
   3×2, 5×2, 5×3 lots au plus), `n` = nuages par km de piste dans chaque TRANCHE — les tranches sont posées l'une après l'autre et
   cotonTick n'envoie que les `lim[palier]` premiers : le palier peut changer en course sans rien rebâtir. */
const COTON_JADE={n:[3.6,3.8,5],f:[1,1,2],K:[[1,4,0],[1,4,0,2,3]],lim:[0,0,0],force:null}; // gabarits : 1 humilis · 4 stratocumulus · 0 mediocris · 2 congestus · 3 humilis
function cotonPalier(){ // 0 ancien iPhone · 1 moyen · 2 récent — `PAL.n` (socle de la passe perf) s'il existe, sinon les crans de qualité
  if(COTON_JADE.force!=null)return COTON_JADE.force;
  try{if(typeof PAL==='object'&&PAL&&typeof PAL.n==='number')return Math.max(0,Math.min(2,PAL.n|0));}catch(e){}
  return QUAL_LOW?0:QUAL_MED?1:2;}
const N8_FIN=(/[?&]nufin=(\d+)/.exec(location.search)||[])[1]==='2'?[12,18,26,48]:PAL.n===0?[10,14,20,32]:PAL.n===1?[12,16,24,40]:[12,18,26,48]; /* (2026-10-24, allègement mobile) la finesse des nuages par palier : ANCIEN 10/14/20/32 · MOYEN 12/16/24/40 · RÉCENT 12/18/26/48 (l'image d'avant) ; `?nufin=2` = celle d'avant sur tous les paliers (essai) */ // (SON, mesuré : de près, en vol, une surface lisse « en plastique ») la finesse du tout près monte à 48 : les petits bourgeons s'y dessinent // (mesuré, banc perf de DEBUGGING : 14/22/32/46 avec des seuils trop fins = 449 k triangles au sol, contre 153 k avant)
const N8_GENRE6=['mediocris','humilis','congestus','humilis','stratocumulus','mediocris'];
const N8_GENRE_V={champignon:'congestus'}; // (v8) le « champignon » (une tête sur un cou) se lisait comme un ARBRE de près : un congestus de plus ; l'ENCLUME est réservée aux titans lointains (kind 24) // (v8) le « champignon » (une tête sur un cou) se lisait comme un ARBRE : c'est un congestus de plus // (v8) les six gabarits « classiques » deviennent des cumulus de ces genres
const N8_OPT={K:5.5,det:.3,fq:1}; // (v8) le champ : netteté des bourgeons, force et finesse du chou-fleur // les quatre finesses de la surface (cellules sur la plus grande dimension du nuage)
const COTON_KINDS=25; // (v8) + le 25e : le CUMULONIMBUS des titans et du colosse (jamais tiré au hasard, jamais près de la route) // (v6) les 6 gabarits classiques + 18 tirés au hasard (cotonAleat : neuf genres)
const COTON_ST=13;    // (v4) une instance = x, dessous, z, r, cap, gabarit, phase, hauteur, ÉTIREMENT largeur, ÉTIREMENT hauteur — (v6) + sa TEINTE r, v, b
function cotonBlobs(k,rng){ // un gabarit : [x,y,z,rayon,aplatissement] en unités du nuage (demi-largeur ~1), base à y = −.35
  const B=[],J=function(a){return (rng()-.5)*a;},base=-.35;
  const bas=function(x,z,r,fy){fy=fy||.55;B.push([x+J(.06),base+r*fy,z+J(.1),r,fy]);};    // bourgeon de BASE : aplati, posé sur le niveau de condensation
  const rond=function(x,y,z,r){B.push([x+J(.05),y+J(.05),z+J(.08),r*(.92+rng()*.16),1]);}; // bourgeon ROND
  if(k===0){ // CLASSIQUE
    for(const x of [-.66,-.33,0,.33,.66])bas(x,0,Math.abs(x)>.5?.25:.31);bas(0,.26,.3,.6);bas(-.1,-.24,.28,.6);
    rond(-.40,-.02,0,.35);rond(-.04,.02,.05,.40);rond(.33,-.03,0,.34);
    rond(-.08,.32,0,.40);rond(.27,.24,.02,.26);rond(-.44,.16,-.02,.22);}
  else if(k===1){ // BAS ET LARGE
    for(const x of [-.8,-.48,-.16,.16,.48,.8])bas(x,J(.2),Math.abs(x)>.6?.22:.27);
    rond(-.35,-.08,0,.30);rond(.05,-.05,0,.33);rond(.42,-.1,0,.27);rond(-.02,.16,0,.30);}
  else if(k===2){ // TOUR (congestus) : elle monte à ~1,2
    for(const x of [-.5,-.17,.17,.5])bas(x,J(.2),.30,.6);
    rond(-.3,.05,0,.38);rond(.25,.07,0,.37);rond(0,.12,.12,.34);
    rond(-.16,.44,0,.36);rond(.18,.46,0,.33);
    rond(0,.78,0,.34);rond(-.26,.66,0,.22);rond(.27,.64,0,.20);rond(.06,.98,0,.20);}
  else if(k===3){ // FLOCON
    for(const x of [-.4,0,.4])bas(x,0,.30,.6);
    rond(-.2,.06,0,.34);rond(.22,.08,0,.32);rond(0,.30,0,.33);}
  else if(k===4){ // BANC
    for(let i=0;i<8;i++)bas(-.88+i*.25,J(.3),.22);
    for(let i=0;i<5;i++)rond(-.66+i*.33,-.1,J(.1),.25);
    rond(-.2,.08,0,.26);rond(.28,.06,0,.24);}
  else{ // DOUBLE DÔME
    for(const x of [-.7,-.36,0,.36,.7])bas(x,0,Math.abs(x)>.5?.25:.30);
    rond(-.42,0,0,.34);rond(0,-.04,0,.33);rond(.42,0,0,.34);
    rond(-.36,.30,0,.34);rond(.38,.28,0,.32);rond(0,.20,0,.24);}
  let top=base;for(const b of B)top=Math.max(top,b[1]+b[3]*b[4]);
  return {B:B,base:base,top:top};
}
const COTON_GENRES=['humilis','meduse','mediocris','mediocris','mediocris','congestus','congestus','congestus','castellanus','spirale','arche',
  'stratocumulus','gateau','altocumulus','anneau','cisaille','vague','champignon']; // (2026-10-21) six FORMES D'AUTEUR prennent la place de six gabarits tirés (voir cumulus8) : // (v6) les 18 gabarits tirés (indices 6 à 23)
function cotonGenre(k){return k<6?'classique':COTON_GENRES[k-6];}
function cotonDe(cr,gs){const L9=[];for(const g of gs){if(typeof g==='number')L9.push(g);else for(let k=0;k<COTON_GENRES.length;k++)if(COTON_GENRES[k]===g)L9.push(6+k);}return L9[cr()*L9.length|0];} // un gabarit parmi ces genres (ou ces classiques)
function cotonR(cr,a,b,p){return a*Math.pow(b/a,Math.pow(cr(),p||1.7));} // une TAILLE en loi de puissance : beaucoup de petits, quelques géants
function cotonCalc(Bb,base,top,sp,sn,si,CH){ // (2026-09-30) le CALCUL d'une forme de nuage, PUR (aucune variable du jeu, ni THREE) : il tourne aussi dans l'OUVRIER
  const nv=sp.length/3,nb=Bb.length;
  const pos=new Float32Array(nv*3*nb),nor=new Float32Array(nv*3*nb),col=new Float32Array(nv*3*nb),noy=new Uint8Array(nv*nb);
  const idx=(nv*nb<65535)?new Uint16Array(si.length*nb):new Uint32Array(si.length*nb);let ni=0;
  const H=Math.max(.1,top-base),VR=.70,VG=.74,VB=.93;
  for(let b=0;b<nb;b++){const e=Bb[b],ox=e[0],oy=e[1],oz=e[2],r=e[3],ry=e[3]*e[4],vo=b*nv*3,vb=b*nv;
    const voi=[];for(let c=0;c<nb;c++){if(c===b)continue;const q=Bb[c],dx=q[0]-ox,dy=q[1]-oy,dz=q[2]-oz,rr=r+q[3]*1.4;if(dx*dx+dy*dy+dz*dz<rr*rr)voi.push(q);}
    for(let i=0;i<nv;i++){const px=sp[i*3]*r+ox,py=sp[i*3+1]*ry+oy,pz=sp[i*3+2]*r+oz;
      pos[vo+i*3]=px;pos[vo+i*3+1]=py;pos[vo+i*3+2]=pz;
      const nx=sn[i*3]/r,ny=sn[i*3+1]/ry,nz=sn[i*3+2]/r,l=Math.hypot(nx,ny,nz)||1;
      /* (v7) LA NORMALE DE CHAMP : la lumière suit le gradient d'un champ LISSE (une gaussienne par bourgeon — le sien et ses voisins),
         mêlée à la normale de la boule (COTON.CH) — le nuage prend la lumière comme UNE masse de ouate aux bosses rondes, plus comme
         une grappe de ballons qui ont chacun leur reflet et une ligne sombre à chaque soudure. La silhouette ne change pas. */
      let gx=0,gy=0,gz=0;
      for(let k=-1;k<voi.length;k++){const q=k<0?e:voi[k],qy=q[3]*q[4],dx=(px-q[0])/q[3],dy=(py-q[1])/qy,dz=(pz-q[2])/q[3],w=Math.exp(-1.3*(dx*dx+dy*dy+dz*dz));gx+=w*dx/q[3];gy+=w*dy/qy;gz+=w*dz/q[3];}
      const lg=Math.hypot(gx,gy,gz),C9=CH;
      let mx=nx/l,my=ny/l,mz=nz/l;if(lg>1e-6){mx=mx*(1-C9)+gx/lg*C9;my=my*(1-C9)+gy/lg*C9;mz=mz*(1-C9)+gz/lg*C9;}
      const lm=Math.hypot(mx,my,mz)||1;nor[vo+i*3]=mx/lm;nor[vo+i*3+1]=my/lm;nor[vo+i*3+2]=mz/lm;
      let ao=0;for(let k=0;k<voi.length;k++){const q=voi[k],qy=q[3]*q[4],dx=(px-q[0])/q[3],dy=(py-q[1])/qy,dz=(pz-q[2])/q[3],d2=dx*dx+dy*dy+dz*dz;
        if(d2<.9409){noy[vb+i]=1;break;}if(d2<1.96)ao+=(1.4-Math.sqrt(d2))/.43;}
      const h=Math.max(0,Math.min(1,(py-base)/(H*.62))),hh=h*h*(3-2*h),o=1-.17*Math.min(1,ao); // (v7) le creux d'une soudure .3 → .17 : il dessinait une LIGNE entre deux bourgeons
      col[vo+i*3]=(VR+(1-VR)*hh)*o;col[vo+i*3+1]=(VG+(1-VG)*hh)*o;col[vo+i*3+2]=(VB+(1-VB)*hh)*o;}
    for(let i=0;i<si.length;i+=3){const a=si[i]+vb,c1=si[i+1]+vb,c2=si[i+2]+vb;if(noy[a]&&noy[c1]&&noy[c2])continue;idx[ni++]=a;idx[ni++]=c1;idx[ni++]=c2;}}
  return {pos:pos,nor:nor,col:col,idx:idx.slice(0,ni)};
}
/* ============================== LES NUAGES v8 — UNE SEULE MATIÈRE (2026-09-30, nuit, session GAMEPLAY) ==============================
   Sacha : « les nuages dans le premier niveau sont toujours aussi moches, il faut que tu reprennes tout à zéro et que tu me fasses une vraie
   génération de nuages adaptée au jeu et à la DA — pousse-toi dans tes limites, prends tout ton temps et surprends-moi ».
   LE DIAGNOSTIC : sept versions (v1-v7) ont retouché les FORMES et les COULEURS d'un même principe — des sphères fusionnées, chacune avec
   sa lumière (Phong). Un nuage restait une GRAPPE : on comptait les boules, chaque soudure faisait une ligne, et la « normale de champ »
   de la v7 n'en corrigeait que l'éclairage, pas la silhouette. Le problème était la technique, pas le réglage.
   LA v8 : un nuage est une SURFACE — l'isosurface d'un CHAMP DE DENSITÉ lisse (bourgeons gaussiens qui se fondent les uns dans les autres,
   base PLATE au niveau de condensation, chou-fleur en bruit de valeur plus fort vers le haut), maillée par SURFACE NETS (un sommet par
   cellule traversée, un quad par arête traversée : pas de table, un maillage étanche et régulier) dans l'OUVRIER. Les normales sont le
   gradient du champ (une seule masse, aucune couture). Le MODELÉ est cuit une fois dans la couleur des sommets : R = occlusion (on sonde
   le champ le long de la normale : un creux est un creux), G = le ciel au-dessus (on sonde vers le haut : les bourgeons du dessus portent
   leur OMBRE sur ceux du dessous), B = la hauteur. Coût en course : les triangles, rien d'autre. */
function nuage8Calc(B, base, top, N, opt) {
  opt = opt || {};
  const K = opt.K || 2.6, T = Math.exp(-K), DET = opt.det == null ? .9 : opt.det, FQ = opt.fq || 1;
  // l'emprise
  let x0 = 1e9, x1 = -1e9, y0 = base - .02, y1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const b of B) { const r = b[3] * 1.25, ry = b[3] * b[4] * 1.25; x0 = Math.min(x0, b[0] - r); x1 = Math.max(x1, b[0] + r); y1 = Math.max(y1, b[1] + ry); z0 = Math.min(z0, b[2] - r); z1 = Math.max(z1, b[2] + r); }
  const ext = Math.max(x1 - x0, y1 - y0, z1 - z0), h = ext / N;
  x0 -= h * 1.5; y0 -= h * 1.5; z0 -= h * 1.5;
  const nx = Math.ceil((x1 - x0) / h) + 2, ny = Math.ceil((y1 - y0) / h) + 2, nz = Math.ceil((z1 - z0) / h) + 2;
  // un bruit de valeur 3D (hachage), pour le chou-fleur
  const hs = function (i, j, k) { let n = (i * 374761393 + j * 668265263 + k * 1274126177) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = function (x, y, z) { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z); let fx = x - i, fy = y - j, fz = z - k; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const a = hs(i, j, k), b = hs(i + 1, j, k), c = hs(i, j + 1, k), d = hs(i + 1, j + 1, k), e = hs(i, j, k + 1), f = hs(i + 1, j, k + 1), g = hs(i, j + 1, k + 1), m = hs(i + 1, j + 1, k + 1);
    const l1 = a + (b - a) * fx, l2 = c + (d - c) * fx, l3 = e + (f - e) * fx, l4 = g + (m - g) * fx, q1 = l1 + (l2 - l1) * fy, q2 = l3 + (l4 - l3) * fy; return q1 + (q2 - q1) * fz; };
  const sd = (opt.seed || 0) * 17.13, VOXF = !!opt.vox, FAR = DET * .5 + .02;
  // le champ : > 0 dedans
  const champ = function (x, y, z, LB) { // LB (cubes) : la liste des lobes qui comptent dans la région interrogée
    let f = 0;
    for (let ii = 0, nb = LB ? LB.length : B.length; ii < nb; ii++) { const i = LB ? LB[ii] : ii, b = B[i], r = b[3], ry = b[3] * b[4], dx = (x - b[0]) / r, dy = (y - b[1]) / ry, dz = (z - b[2]) / r, q = dx * dx + dy * dy + dz * dz; if (q < 9) f += Math.exp(-K * q); }
    let g = Math.log(Math.max(f, 1e-9) / T); // 0 à la surface, en « unités de rayon » (le log rend le champ presque linéaire près de la surface)
    if (VOXF && (g > FAR || g < -FAR)) return g - Math.max(0, (base + .015 - y)) * 40; // (cubes) le bruit ne vaut que ±DET/2 : loin de la surface il ne change aucun signe, on ne le calcule pas
    // le chou-fleur : deux octaves de bosses, plus fortes vers le haut (la base reste lisse)
    const hy = Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base)));
    g += DET * (0.55 * (vn(x * 4.1 * FQ + sd, y * 4.1 * FQ, z * 4.1 * FQ) - .5) + 0.3 * (vn(x * 9.3 * FQ, y * 9.3 * FQ + sd, z * 9.3 * FQ) - .5) + 0.15 * (vn(x * 19.7 * FQ, y * 19.7 * FQ, z * 19.7 * FQ + sd) - .5)) * (.3 + .7 * hy);
    // la BASE PLATE : le niveau de condensation
    g -= Math.max(0, (base + .015 - y)) * 40;
    return g;
  };
  /* (2026-10-20, Léo : « le niveau nuage a l'air déchiqueté — une refonte, avec toutes les techniques, entre réalisme et cubes pixel de tailles
     variables ») LE CUMULUS EN CUBES DE TAILLES VARIABLES : du MÊME champ lisse (donc les mêmes formes, la même base plate), la surface n'est plus
     maillée en surface nets mais en CUBES posés sur une grille emboîtée (régions de 4 unités : des cubes de 1, 2 ou 4 unités selon un bruit lisse
     par région — petits sur les bourgeons du haut, gros vers le ventre) ; seules les faces tournées vers le dehors sont émises, une par
     « patch » si le voisin change de taille (jamais de trou entre un gros et un petit cube). La LUMIÈRE reste celle du nuage lisse : la normale
     d'un cube = sa face mêlée au gradient du champ (opt.vox.kn), le modelé cuit (creux, ombre des bourgeons du haut, hauteur) est lu en son
     centre, et chaque cube a SA nuance (opt.vox.jit) : c'est elle qui fait lire la mosaïque. Aucun fantôme, aucune poussière : un seul objet opaque. */
  if (opt.vox) {
    const VX = opt.vox, hv = ext / (N * (VX.k || 1.5) * (N > 40 ? (VX.kf || .75) : 1)), RG = hv * 4, kn = VX.kn == null ? .5 : VX.kn, jit = VX.jit == null ? .16 : VX.jit;
    const gx0 = Math.floor(x0 / RG) * RG, gz0 = Math.floor(z0 / RG) * RG, gy0 = base - RG; // la base du nuage sur une frontière de région : le dessous est PLAT
    const NRX = Math.ceil((x1 + hv * 2 - gx0) / RG) + 1, NRZ = Math.ceil((z1 + hv * 2 - gz0) / RG) + 1, NRY = Math.ceil((y1 + hv * 2 - gy0) / RG) + 1;
    const NCX = NRX * 4, NCY = NRY * 4;
    const RL = new Int8Array(NRX * NRY * NRZ), RS = new Int8Array(NRX * NRY * NRZ), memo = new Map();
    const t0v = VX.t0 == null ? .36 : VX.t0, t1v = VX.t1 == null ? .7 : VX.t1, hbv = VX.hb == null ? .35 : VX.hb, hh0 = Math.max(.1, top - base);
    for (let k = 0; k < NRZ; k++) for (let j = 0; j < NRY; j++) for (let i = 0; i < NRX; i++) { // la taille des cubes de chaque région : un bruit LISSE (des plaques), plus petite vers le haut
      const rv = vn(i * .83 + sd + 3.1, j * .83 + 1.7, k * .83 - 2.3) * .65 + hs(i * 7 + 1, j * 13 + 5, k * 11 + 3) * .35, yy = Math.min(1, Math.max(0, (gy0 + (j + .5) * RG - base) / hh0)), t = rv + (.5 - yy) * hbv;
      RL[i + NRX * (j + NRY * k)] = t < t0v ? 0 : t < t1v ? 1 : 2; }
    const RBL = new Array(NRX * NRY * NRZ), bl = function (i, j, k) { const q = i + NRX * (j + NRY * k); let L9 = RBL[q]; if (L9) return L9; // les lobes dont la portée (3 rayons : q < 9) touche cette région
      const ccx = gx0 + (i + .5) * RG, ccy = gy0 + (j + .5) * RG, ccz = gz0 + (k + .5) * RG, rr = RG * .87; L9 = [];
      for (let b9 = 0; b9 < B.length; b9++) { const b = B[b9], R9 = 3 * Math.max(b[3], b[3] * b[4]) + rr; if (Math.abs(ccx - b[0]) < R9 && Math.abs(ccy - b[1]) < R9 && Math.abs(ccz - b[2]) < R9) L9.push(b9); }
      RBL[q] = L9; return L9; };
    const rstate = function (i, j, k) { const q = i + NRX * (j + NRY * k); let s = RS[q]; if (s) return s;
      let mn = 1e9, mx = -1e9; const xa = gx0 + i * RG, ya = gy0 + j * RG, za = gz0 + k * RG;
      const L9 = bl(i, j, k); for (let c = 0; c < 9; c++) { const g = champ(c === 8 ? xa + RG * .5 : xa + (c & 1) * RG, c === 8 ? ya + RG * .5 : ya + ((c >> 1) & 1) * RG, c === 8 ? za + RG * .5 : za + ((c >> 2) & 1) * RG, L9); if (g < mn) mn = g; if (g > mx) mx = g; }
      s = mn > 2.5 ? 2 : mx < -2.5 ? 1 : 3; RS[q] = s; return s; };
    const cellSolid = function (l, ci, cj, ck) { const key = ((ck * NCY + cj) * NCX + ci) * 3 + l, m = memo.get(key); if (m !== undefined) return m;
      const s = hv * (1 << l), sh = 2 - l, v = champ(gx0 + (ci + .5) * s, gy0 + (cj + .5) * s, gz0 + (ck + .5) * s, bl(ci >> sh, cj >> sh, ck >> sh)) > 0; memo.set(key, v); return v; };
    const solidAt = function (x, y, z) { const i = Math.floor((x - gx0) / RG), j = Math.floor((y - gy0) / RG), k = Math.floor((z - gz0) / RG);
      if (i < 0 || j < 0 || k < 0 || i >= NRX || j >= NRY || k >= NRZ) return false;
      const st = rstate(i, j, k); if (st === 1) return false; if (st === 2) return true;
      const l = RL[i + NRX * (j + NRY * k)], s = hv * (1 << l); return cellSolid(l, Math.floor((x - gx0) / s), Math.floor((y - gy0) / s), Math.floor((z - gz0) / s)); };
    const VP = [], VN = [], VC = [], VI = [], VQ = [], DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], QQ = [[-1, -1], [1, -1], [1, 1], [-1, 1]], eps = hv * .25;
    const quad = function (cx, cy, cz, ax, sg, hs9, cu, cw, hu, hw, nn, md) { const u = (ax + 1) % 3, w = (ax + 2) % 3, b0 = VP.length / 3;
      for (const q of QQ) { const P = [cx, cy, cz]; P[ax] += sg * hs9; P[u] += cu + q[0] * hu; P[w] += cw + q[1] * hw; VP.push(P[0], P[1], P[2]); VN.push(nn[0], nn[1], nn[2]); VC.push(md[0], md[1], md[2]); VQ.push(ax, sg); }
      if (sg > 0) VI.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); else VI.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2); };
    const e1 = hv * .6;
    for (let k = 0; k < NRZ; k++) for (let j = 0; j < NRY; j++) for (let i = 0; i < NRX; i++) {
      if (rstate(i, j, k) !== 3) continue;
      const l = RL[i + NRX * (j + NRY * k)], n = 4 >> l, s = hv * (1 << l), m = 1 << l;
      for (let c = 0; c < n; c++) for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
        const ci = i * n + a, cj = j * n + b, ck = k * n + c; if (!cellSolid(l, ci, cj, ck)) continue;
        const cx = gx0 + (ci + .5) * s, cy = gy0 + (cj + .5) * s, cz = gz0 + (ck + .5) * s; let dat = null;
        for (const d of DIRS) { const ax = d[0] ? 0 : d[1] ? 1 : 2, u = (ax + 1) % 3, w = (ax + 2) % 3, sg = d[ax], ex = [];
          let nex = 0; for (let q = 0; q < m; q++) for (let p = 0; p < m; p++) { const P = [cx, cy, cz]; P[ax] += sg * (s * .5 + eps); P[u] += ((p + .5) / m - .5) * s; P[w] += ((q + .5) / m - .5) * s;
            const e = !solidAt(P[0], P[1], P[2]); ex.push(e); if (e) nex++; }
          if (!nex) continue;
          if (!dat) { let gx = champ(cx + e1, cy, cz) - champ(cx - e1, cy, cz), gy = champ(cx, cy + e1, cz) - champ(cx, cy - e1, cz), gz = champ(cx, cy, cz + e1) - champ(cx, cy, cz - e1);
            const gl = Math.hypot(gx, gy, gz) || 1; gx = -gx / gl; gy = -gy / gl; gz = -gz / gl;
            let o9 = 0; for (const s9 of [.04, .09, .17, .3]) { const w9 = champ(cx + gx * s9, cy + gy * s9, cz + gz * s9); if (w9 > -1.4) o9 += (w9 + 1.4) / 1.4 * (s9 === .04 ? .35 : s9 === .09 ? .3 : s9 === .17 ? .22 : .13); }
            let u9 = 0; for (const s9 of [.1, .22, .38, .6]) { const w9 = champ(cx + gx * .03, cy + s9, cz + gz * .03); if (w9 > 0) u9 += Math.min(1, w9) * .5; }
            const hz = hs(ci * 7 + 3, cj * 13 + 5, ck * 11 + 1 + l * 31) - .5;
            dat = { g: [gx, gy, gz], md: [Math.max(0, Math.min(1, (.25 + .75 * Math.max(0, Math.min(1, 1 - o9 * 1.15))) * (1 + hz * jit))), Math.min(1, Math.exp(-u9 * 1.6) * (1 + hz * jit * .5)), Math.max(0, Math.min(1, (cy - base) / hh0))] }; }
          const nn = [d[0] * (1 - kn) + dat.g[0] * kn, d[1] * (1 - kn) + dat.g[1] * kn, d[2] * (1 - kn) + dat.g[2] * kn], nl = Math.hypot(nn[0], nn[1], nn[2]) || 1; nn[0] /= nl; nn[1] /= nl; nn[2] /= nl;
          if (nex === m * m) quad(cx, cy, cz, ax, sg, s * .5, 0, 0, s * .5, s * .5, nn, dat.md);
          else { const hp = s / m * .5; let ii = 0; for (let q = 0; q < m; q++) for (let p = 0; p < m; p++, ii++) if (ex[ii]) quad(cx, cy, cz, ax, sg, s * .5, ((p + .5) / m - .5) * s, ((q + .5) / m - .5) * s, hp, hp, nn, dat.md); } } } }
    const nvv = VP.length / 3, idxv = nvv < 65535 ? new Uint16Array(VI) : new Uint32Array(VI);
    /* (2026-10-21, Léo : « couche par-dessus les cubes, pas gonflé, embrasse la forme des cubes ») LA PEAU : les MÊMES faces que les cubes, décalées de 7 % de cube le long de leur normale de face (une pellicule collée sur chaque marche,
       qui en épouse tous les angles), avec les normales lissées du corps (elle luit comme un vernis) — plus de surface lisse gonflée */
    const off = hv * (VX.skin == null ? .07 : VX.skin), sp = new Float32Array(VP.length);
    for (let i = 0; i < nvv; i++) { const ax = VQ[i * 2], sg = VQ[i * 2 + 1]; sp[i * 3] = VP[i * 3]; sp[i * 3 + 1] = VP[i * 3 + 1]; sp[i * 3 + 2] = VP[i * 3 + 2]; sp[i * 3 + ax] += sg * off; }
    return { pos: new Float32Array(VP), nor: new Float32Array(VN), col: new Float32Array(VC), idx: idxv, vit: null, fant: null, skin: { pos: sp, nor: new Float32Array(VN), idx: idxv.slice() } };
  }
  // les coins
  const NX = nx + 1, NY = ny + 1, NZ = nz + 1, V = new Float32Array(NX * NY * NZ);
  for (let k = 0; k < NZ; k++) for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) V[i + NX * (j + NY * k)] = champ(x0 + i * h, y0 + j * h, z0 + k * h);
  // les sommets (un par cellule traversée : la moyenne des croisements d'arêtes)
  const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const co = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], c8 = new Float32Array(8);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let m = 0; for (let c = 0; c < 8; c++) { const v = V[(i + co[c][0]) + NX * ((j + co[c][1]) + NY * (k + co[c][2]))]; c8[c] = v; if (v > 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const e of E) { const a = c8[e[0]], b = c8[e[1]]; if ((a > 0) === (b > 0)) continue; const t = a / (a - b), A = co[e[0]], Bc = co[e[1]];
      sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; n++; }
    vid[i + nx * (j + ny * k)] = P.length / 3; P.push(x0 + (i + sx / n) * h, y0 + (j + sy / n) * h, z0 + (k + sz / n) * h);
  }
  // les faces : un quad par arête de la grille qui traverse la surface
  const I = [];
  const cell = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) ? -1 : vid[i + nx * (j + ny * k)]; };
  for (let k = 1; k < NZ - 1; k++) for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
    const v0 = V[i + NX * (j + NY * k)], in0 = v0 > 0;
    // arête +x
    if (i < NX - 1) { const v1 = V[(i + 1) + NX * (j + NY * k)]; if (in0 !== (v1 > 0)) { const a = cell(i, j - 1, k - 1), b = cell(i, j, k - 1), c = cell(i, j, k), d = cell(i, j - 1, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
    if (j < NY - 1) { const v1 = V[i + NX * ((j + 1) + NY * k)]; if (in0 !== (v1 > 0)) { const a = cell(i - 1, j, k - 1), b = cell(i - 1, j, k), c = cell(i, j, k), d = cell(i, j, k - 1); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
    if (k < NZ - 1) { const v1 = V[i + NX * (j + NY * (k + 1))]; if (in0 !== (v1 > 0)) { const a = cell(i - 1, j - 1, k), b = cell(i, j - 1, k), c = cell(i, j, k), d = cell(i - 1, j, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) I.push(a, b, c, a, c, d); else I.push(a, c, b, a, d, c); } } }
  }
  // normales (gradient du champ), et le modelé cuit : R = occlusion ambiante, G = ciel au-dessus (ombre portée des bourgeons du haut), B = hauteur
  const nv = P.length / 3, pos = new Float32Array(P), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), e2 = h * .5;
  for (let v = 0; v < nv; v++) { const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let gx = champ(x + e2, y, z) - champ(x - e2, y, z), gy = champ(x, y + e2, z) - champ(x, y - e2, z), gz = champ(x, y, z + e2) - champ(x, y, z - e2);
    const l = Math.hypot(gx, gy, gz) || 1; const nx9 = -gx / l, ny9 = -gy / l, nz9 = -gz / l; nor[v * 3] = nx9; nor[v * 3 + 1] = ny9; nor[v * 3 + 2] = nz9;
    let oc = 0; for (const s of [.04, .09, .17, .3]) { const w = champ(x + nx9 * s, y + ny9 * s, z + nz9 * s); if (w > -1.4) oc += (w + 1.4) / 1.4 * (s === .04 ? .35 : s === .09 ? .3 : s === .17 ? .22 : .13); }
    let up = 0; for (const s of [.1, .22, .38, .6]) { const w = champ(x + nx9 * .03, y + s, z + nz9 * .03); if (w > 0) up += Math.min(1, w) * .5; }
    col[v * 3] = Math.max(0, Math.min(1, 1 - oc * 1.15)); col[v * 3 + 1] = Math.exp(-up * 1.6); col[v * 3 + 2] = Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base))); }
  const idx = nv < 65535 ? new Uint16Array(I) : new Uint32Array(I);
  /* (2026-10-18, Léo : « les nuages avec la technique des mini-cubes et de la couche transparente lisse — la glisse transparente peut EMBRASSER
     la forme des cubes ») LE NUAGE EN VITRAIL : du MÊME champ, (1) les ÉCAILLES — chaque case de `hc` (ext / opt.vit) dont le centre est dedans et
     qui touche le dehors ; seules ses faces vers le dehors, réduites à 89 % autour du centre (la lumière du cœur passe dans les joints) ; une
     écaille = UNE normale (le gradient du champ en son centre), UN modelé, un hasard ; (2) la PEAU — l'isosurface des cubes ADOUCIS (occupation
     floutée [¼ ½ ¼] puis lue en trilinéaire, seuil opt.iso) : elle suit les marches des cubes en les arrondissant, un peu au-dessus d'eux. */
  let vit = null;
  if (opt.vit) {
    const nc = opt.vit, hc = ext / nc, sc = hc * (opt.ecart || .47), ISO = opt.iso || .36;
    const cnx = Math.ceil(nx * h / hc) + 1, cny = Math.ceil(ny * h / hc) + 1, cnz = Math.ceil(nz * h / hc) + 1, ci = function (i, j, k) { return i + cnx * (j + cny * k); };
    const occ = new Uint8Array(cnx * cny * cnz);
    for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) occ[ci(i, j, k)] = champ(x0 + (i + .5) * hc, y0 + (j + .5) * hc, z0 + (k + .5) * hc) > 0 ? 1 : 0;
    const oc = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= cnx || j >= cny || k >= cnz) ? 0 : occ[ci(i, j, k)]; };
    const modele = function (x, y, z, a, b, c) { // le modelé cuit, comme la surface : R creux, G ciel au-dessus, B hauteur
      let o9 = 0; for (const s of [.04, .09, .17, .3]) { const w = champ(x + a * s, y + b * s, z + c * s); if (w > -1.4) o9 += (w + 1.4) / 1.4 * (s === .04 ? .35 : s === .09 ? .3 : s === .17 ? .22 : .13); }
      let u9 = 0; for (const s of [.1, .22, .38, .6]) { const w = champ(x + a * .03, y + s, z + c * .03); if (w > 0) u9 += Math.min(1, w) * .5; }
      return [Math.max(0, Math.min(1, 1 - o9 * 1.15)), Math.exp(-u9 * 1.6), Math.max(0, Math.min(1, (y - base) / Math.max(.1, top - base)))]; };
    const CP = [], CN = [], CG = [], CC = [], CU = [], CI = [], DIR = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], QD = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) {
      if (!occ[ci(i, j, k)]) continue;
      let ex = 0; for (const d of DIR) if (!oc(i + d[0], j + d[1], k + d[2])) { ex = 1; break; }
      if (!ex) continue;
      const x = x0 + (i + .5) * hc, y = y0 + (j + .5) * hc, z = z0 + (k + .5) * hc, e = hc * .5;
      let gx = champ(x + e, y, z) - champ(x - e, y, z), gy = champ(x, y + e, z) - champ(x, y - e, z), gz = champ(x, y, z + e) - champ(x, y, z - e);
      const l = Math.hypot(gx, gy, gz) || 1; gx = -gx / l; gy = -gy / l; gz = -gz / l;
      const md = modele(x, y, z, gx, gy, gz), hz = hs(i * 7 + 3, j * 13 + 5, k * 11 + 1);
      // (2026-10-18, « pas comme Minecraft, fais le peintre ») LES TOUCHES : opt.jit > 0 → chaque cube décalé, tourné, à sa taille — la grille se casse, des touches de pinceau
      const JT = opt.jit || 0, r1 = hs(i * 3 + 11, j * 5 + 2, k * 7 + 9), r2 = hs(i * 17 + 1, j * 3 + 7, k * 5 + 4), r3 = hs(i + 5, j * 19 + 3, k * 2 + 8), sk9 = sc * (1 - JT * .7 * r1);
      const ox = x + (r2 - .5) * JT * hc, oy = y + (r3 - .5) * JT * hc, oz = z + (r1 - .5) * JT * hc, an = (r2 - .5) * JT * 1.6, bn = (r3 - .5) * JT * 1.6, ca = Math.cos(an), sa = Math.sin(an), cb = Math.cos(bn), sb = Math.sin(bn);
      const rot = function (v) { const x1 = v[0] * ca - v[2] * sa, z1 = v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [x1, y2, z2]; }; // deux petites rotations (lacet, tangage)
      for (const d of DIR) { if (oc(i + d[0], j + d[1], k + d[2])) continue; // (touches) les faces tournées vers l intérieur restent jetées : entre deux touches, on voit le CŒUR (la lumière)
        const ax = d[0] ? 0 : d[1] ? 1 : 2, u = (ax + 1) % 3, w = (ax + 2) % 3, b0 = CP.length / 3, dn = JT ? rot(d) : d;
        for (const q of QD) { const L9 = [0, 0, 0]; L9[ax] = d[ax]; L9[u] = q[0]; L9[w] = q[1]; const P9 = JT ? rot([L9[0] * sk9, L9[1] * sk9, L9[2] * sk9]) : [L9[0] * sc, L9[1] * sc, L9[2] * sc];
          CP.push(ox + P9[0], oy + P9[1], oz + P9[2]); CN.push(dn[0], dn[1], dn[2]); CG.push(gx, gy, gz); CC.push(md[0], md[1], md[2]); CU.push(L9[0], L9[1], L9[2], hz); }
        if (d[ax] > 0) CI.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); else CI.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2); } }
    // la peau : l'occupation floutée [¼ ½ ¼] sur les trois axes, puis lue en trilinéaire
    let ob = new Float32Array(occ.length), t9 = new Float32Array(occ.length); for (let q = 0; q < occ.length; q++) ob[q] = occ[q];
    for (let ax = 0; ax < 3; ax++) { const st = ax === 0 ? 1 : ax === 1 ? cnx : cnx * cny, nn = ax === 0 ? cnx : ax === 1 ? cny : cnz;
      for (let k = 0; k < cnz; k++) for (let j = 0; j < cny; j++) for (let i = 0; i < cnx; i++) { const q = ci(i, j, k), c9 = ax === 0 ? i : ax === 1 ? j : k;
        t9[q] = ob[q] * .5 + (c9 > 0 ? ob[q - st] : 0) * .25 + (c9 < nn - 1 ? ob[q + st] : 0) * .25; }
      const s9 = ob; ob = t9; t9 = s9; }
    const obv = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= cnx || j >= cny || k >= cnz) ? 0 : ob[ci(i, j, k)]; };
    const otri = function (x, y, z) { const fx = (x - x0) / hc - .5, fy = (y - y0) / hc - .5, fz = (z - z0) / hc - .5, i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz), a = fx - i, b = fy - j, c = fz - k;
      const l1 = obv(i, j, k) + (obv(i + 1, j, k) - obv(i, j, k)) * a, l2 = obv(i, j + 1, k) + (obv(i + 1, j + 1, k) - obv(i, j + 1, k)) * a,
        l3 = obv(i, j, k + 1) + (obv(i + 1, j, k + 1) - obv(i, j, k + 1)) * a, l4 = obv(i, j + 1, k + 1) + (obv(i + 1, j + 1, k + 1) - obv(i, j + 1, k + 1)) * a;
      const q1 = l1 + (l2 - l1) * b, q2 = l3 + (l4 - l3) * b; return q1 + (q2 - q1) * c; };
    const hsk = opt.nsk ? Math.max(hc, ext / opt.nsk) : hc * (opt.peau || .9), sX = Math.ceil(cnx * hc / hsk) + 2, sY = Math.ceil(cny * hc / hsk) + 2, sZ = Math.ceil(cnz * hc / hsk) + 2, s0 = hsk, SX = sX + 1, SY = sY + 1, SZ = sZ + 1; // la peau sur SA grille, à la taille des cubes (la finesse de la surface n'y ajoute rien)
    const V2 = new Float32Array(SX * SY * SZ);
    for (let k = 0; k < SZ; k++) for (let j = 0; j < SY; j++) for (let i = 0; i < SX; i++) V2[i + SX * (j + SY * k)] = otri(x0 - s0 + i * hsk, y0 - s0 + j * hsk, z0 - s0 + k * hsk) - ISO;
    const vid2 = new Int32Array(sX * sY * sZ).fill(-1), SP = [];
    for (let k = 0; k < sZ; k++) for (let j = 0; j < sY; j++) for (let i = 0; i < sX; i++) {
      let m = 0; for (let c = 0; c < 8; c++) { const v = V2[(i + co[c][0]) + SX * ((j + co[c][1]) + SY * (k + co[c][2]))]; c8[c] = v; if (v > 0) m |= 1 << c; }
      if (m === 0 || m === 255) continue;
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (const e of E) { const a = c8[e[0]], b = c8[e[1]]; if ((a > 0) === (b > 0)) continue; const t = a / (a - b), A = co[e[0]], Bc = co[e[1]];
        sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; n++; }
      vid2[i + sX * (j + sY * k)] = SP.length / 3; SP.push(x0 - s0 + (i + sx / n) * hsk, y0 - s0 + (j + sy / n) * hsk, z0 - s0 + (k + sz / n) * hsk); }
    const SI = [], cel2 = function (i, j, k) { return (i < 0 || j < 0 || k < 0 || i >= sX || j >= sY || k >= sZ) ? -1 : vid2[i + sX * (j + sY * k)]; };
    for (let k = 1; k < SZ - 1; k++) for (let j = 1; j < SY - 1; j++) for (let i = 1; i < SX - 1; i++) {
      const v0 = V2[i + SX * (j + SY * k)], in0 = v0 > 0;
      { const v1 = V2[(i + 1) + SX * (j + SY * k)]; if (in0 !== (v1 > 0)) { const a = cel2(i, j - 1, k - 1), b = cel2(i, j, k - 1), c = cel2(i, j, k), d = cel2(i, j - 1, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } }
      { const v1 = V2[i + SX * ((j + 1) + SY * k)]; if (in0 !== (v1 > 0)) { const a = cel2(i - 1, j, k - 1), b = cel2(i - 1, j, k), c = cel2(i, j, k), d = cel2(i, j, k - 1); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } }
      { const v1 = V2[i + SX * (j + SY * (k + 1))]; if (in0 !== (v1 > 0)) { const a = cel2(i - 1, j - 1, k), b = cel2(i, j - 1, k), c = cel2(i, j, k), d = cel2(i - 1, j, k); if (a >= 0 && b >= 0 && c >= 0 && d >= 0) { if (in0) SI.push(a, b, c, a, c, d); else SI.push(a, c, b, a, d, c); } } } }
    const ns = SP.length / 3, snor = new Float32Array(ns * 3), scol = new Float32Array(ns * 3), e3 = hc * .3;
    for (let v = 0; v < ns; v++) { const x = SP[v * 3], y = SP[v * 3 + 1], z = SP[v * 3 + 2];
      let gx = otri(x + e3, y, z) - otri(x - e3, y, z), gy = otri(x, y + e3, z) - otri(x, y - e3, z), gz = otri(x, y, z + e3) - otri(x, y, z - e3);
      const l = Math.hypot(gx, gy, gz) || 1; gx = -gx / l; gy = -gy / l; gz = -gz / l;
      { const e4 = h * .5; let hx = champ(x + e4, y, z) - champ(x - e4, y, z), hy = champ(x, y + e4, z) - champ(x, y - e4, z), hz9 = champ(x, y, z + e4) - champ(x, y, z - e4); const l4 = Math.hypot(hx, hy, hz9) || 1; const kN = opt.peauN == null ? .65 : opt.peauN; // la peau a la FORME des cubes, mais la LUMIÈRE du nuage lisse (la normale du champ) : sinon chaque marche faisait un liseré blanc, un filet
        gx = gx * (1 - kN) - hx / l4 * kN; gy = gy * (1 - kN) - hy / l4 * kN; gz = gz * (1 - kN) - hz9 / l4 * kN; const l5 = Math.hypot(gx, gy, gz) || 1; gx /= l5; gy /= l5; gz /= l5; }
      snor[v * 3] = gx; snor[v * 3 + 1] = gy; snor[v * 3 + 2] = gz;
      const md = modele(x, y, z, gx, gy, gz); scol[v * 3] = md[0]; scol[v * 3 + 1] = md[1]; scol[v * 3 + 2] = md[2]; }
    const nc4 = CP.length / 3;
    vit = { hc: hc, cpos: new Float32Array(CP), cnor: new Float32Array(CN), cg: new Float32Array(CG), ccol: new Float32Array(CC), ccu: new Float32Array(CU), cidx: nc4 < 65535 ? new Uint16Array(CI) : new Uint32Array(CI),
      spos: new Float32Array(SP), snor: snor, scol: scol, sidx: ns < 65535 ? new Uint16Array(SI) : new Uint32Array(SI) };
  }
  /* (2026-10-18, Léo : « rends les cubes encore plus minuscules et encore plus FANTOMATIQUES pour vraiment construire de nouveaux nuages ; joue sur
     les teintes comme un peintre ») LES CUBES FANTÔMES : autour de chaque sommet de la surface, opt.fant / nv petits cubes posés le long de la
     normale — la plupart DEDANS (le corps qui se construit), quelques-uns dehors (la vapeur qui s'effiloche) —, décalés dans le plan, de tailles
     variables (ext / opt.fsz), chacun son voile (q.y : plus faible dehors), son hasard (q.z, la teinte du peintre) et sa profondeur (q.w). */
  let fant = null;
  if (opt.fant) {
    /* (2026-10-18, Léo : « éparpille mieux les cubes ») LE TIRAGE ÉPARPILLÉ : plus un paquet par sommet de la surface (une grille : des rangées et
       des grappes régulières) — chaque cube tombe au HASARD sur la surface (un triangle tiré selon son aire, un point dedans), avec des GRAPPES et des
       TROUÉES (un bruit de densité : on garde plus de cubes là où il est haut), une VAPEUR qui part plus loin (dehors, de plus en plus rare et
       légère) et des tailles très variées. Tirés dans le désordre : un lot lointain qui n'en dessine qu'une partie garde le même éparpillement. */
    const n4 = opt.fant, sz = ext / (opt.fsz || 110), nt = idx.length / 3, AC = new Float64Array(nt);
    let at = 0; for (let f = 0; f < nt; f++) { const a = idx[f * 3] * 3, b = idx[f * 3 + 1] * 3, c = idx[f * 3 + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      at += .5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx); AC[f] = at; }
    let s9 = ((opt.seed || 1) * 2654435761) | 0; const rnd = function () { s9 = (s9 * 1664525 + 1013904223) | 0; return (s9 >>> 0) / 4294967296; };
    const FP = new Float32Array(n4 * 3), FN = new Float32Array(n4 * 3), FC = new Float32Array(n4 * 3), FQ = new Float32Array(n4 * 4);
    let q = 0, essais = 0;
    while (q < n4 && essais < n4 * 6) { essais++;
      const u = rnd() * at; let lo = 0, hi = nt - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (AC[m] < u) lo = m + 1; else hi = m; } // le triangle, selon son aire
      let b1 = rnd(), b2 = rnd(); if (b1 + b2 > 1) { b1 = 1 - b1; b2 = 1 - b2; } const b0 = 1 - b1 - b2, A = idx[lo * 3] * 3, B = idx[lo * 3 + 1] * 3, C = idx[lo * 3 + 2] * 3;
      const x = pos[A] * b0 + pos[B] * b1 + pos[C] * b2, y = pos[A + 1] * b0 + pos[B + 1] * b1 + pos[C + 1] * b2, z = pos[A + 2] * b0 + pos[B + 2] * b1 + pos[C + 2] * b2;
      let a = nor[A] * b0 + nor[B] * b1 + nor[C] * b2, b = nor[A + 1] * b0 + nor[B + 1] * b1 + nor[C + 1] * b2, c = nor[A + 2] * b0 + nor[B + 2] * b1 + nor[C + 2] * b2; const nl = Math.hypot(a, b, c) || 1; a /= nl; b /= nl; c /= nl;
      const dn = vn(x * 5.3 + 11, y * 5.3, z * 5.3 - 7) * .65 + vn(x * 13.1, y * 13.1 + 3, z * 13.1) * .35; // les grappes et les trouées
      if (rnd() > .55 + .45 * Math.min(1, Math.max(0, (dn - .3) * 2.2))) continue; // des grappes légères : jamais de grande trouée lisse
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd();
      const fd = opt.fdeh || .34, dl = opt.fdeh ? 10 : 6, dep = r1 < 1 - fd ? -Math.pow(r2, 1.3) * 7.5 : Math.pow(r2, 1.7) * dl; // la profondeur (en tailles de cube) : le corps dedans, la VAPEUR dehors (plus loin, plus rare) — (mélange) surtout dehors, plus loin : le nuage qui se défait
      const jx = (rnd() - .5) * sz * 2.2, jy = (rnd() - .5) * sz * 2.2, jz = (rnd() - .5) * sz * 2.2; // un peu de désordre en 3D
      FP[q * 3] = x + a * dep * sz + jx; FP[q * 3 + 1] = y + b * dep * sz + jy; FP[q * 3 + 2] = z + c * dep * sz + jz;
      FN[q * 3] = a; FN[q * 3 + 1] = b; FN[q * 3 + 2] = c;
      FC[q * 3] = col[A] * b0 + col[B] * b1 + col[C] * b2; FC[q * 3 + 1] = col[A + 1] * b0 + col[B + 1] * b1 + col[C + 1] * b2; FC[q * 3 + 2] = col[A + 2] * b0 + col[B + 2] * b1 + col[C + 2] * b2;
      FQ[q * 4] = sz * (.35 + 1.25 * Math.pow(r3, 1.6)) * (dep > 0 ? .8 : 1); FQ[q * 4 + 1] = dep > 0 ? (opt.fdeh ? .22 + .4 * r4 : .07 + .2 * r4) * (1 - dep / (dl + .5)) : .24 + .32 * r4; FQ[q * 4 + 2] = r4; FQ[q * 4 + 3] = dep;
      q++; }
    const fin = function (A9, k) { return A9.subarray(0, q * k); };
    fant = { pos: fin(FP, 3), nor: fin(FN, 3), col: fin(FC, 3), q: fin(FQ, 4), k: sz * 3 }; // k : de combien le CORPS du nuage rentre (les fantômes du dessus se voient)
  }
  return { pos: pos, nor: nor, col: col, idx: idx, vit: vit, fant: fant };
}
/* LE SCULPTEUR DE CUMULUS v8 — les FORMES refaites (les gabarits v4-v7 étaient des piles de bourgeons étroites : au banc, des « fantômes »).
   Un vrai cumulus : une BASE plate (des lobes aplatis posés sur le plancher de condensation, répartis dans une empreinte elliptique), un DÔME
   (des lobes plus hauts vers le centre), selon le genre une TOUR qui rétrécit en montant (congestus), cisaillée par le vent, coiffée d'une
   enclume (champignon), une rangée de tourelles (castellanus), un rouleau bas (stratocumulus), un troupeau (altocumulus), des lambeaux (fractus) ;
   puis le CHOU-FLEUR : chaque lobe du haut porte 2-3 enfants ronds posés sur sa calotte, vers le haut et le dehors, et les enfants du sommet
   leurs petits-enfants. 70 lobes au plus. Fonction pure : la surface (nuage8Calc) les fond ensuite en une seule masse. */
function cumulus8(genre, rng) {
  const B = [], U = function (a, b) { return a + (b - a) * rng(); }, MAXB = 70; let base = -.35;
  const add = function (x, y, z, r, fy) { if (B.length < MAXB) B.push([x, y, z, r, fy || 1]); return B.length - 1; };
  let d = .7, H = .55, n0 = 9, rb = .3, tour = 0, enclume = 0, cis = 0, kidsK = 1;
  /* (2026-10-21, Léo : « donne des formes encore plus originales à tes nuages ») SIX FORMES D'AUTEUR, en plus des cumulus : chacune est une silhouette qu'on reconnaît de loin et qui reste un nuage (lobes ronds qui se soudent,
     base plate sauf la méduse) — ARCHE (une porte de ouate), MÉDUSE (un dôme et ses filaments qui pendent), ANNEAU (un beignet), SPIRALE (une vis qui monte et s'amincit), GÂTEAU (des étages qui rétrécissent), VAGUE (une crête qui déferle). */
  if (genre === 'arche') { // deux piliers et une voûte : on voit le ciel dans le trou
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) for (const z of [-.14, .14]) add(sd * .64 + U(-.03, .03), base + .22 + i * .26, z + U(-.04, .04), .3 - i * .012, 1);
    for (let i = 0; i <= 8; i++) { const t = i / 8 * Math.PI; for (const z of [-.13, .13]) add(Math.cos(t) * .64, base + 1.0 + Math.sin(t) * .36, z + U(-.04, .04), .27 + Math.sin(t) * .04, 1); }
    enfants(B.length, .4); return fin();
  }
  if (genre === 'meduse') { // un dôme bombé, et dessous des filaments qui pendent et ondulent
    base = -.95;
    add(0, base + 1.18, 0, .5, .8);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + U(-.2, .2); add(Math.cos(a) * .5, base + 1.0 + U(-.05, .05), Math.sin(a) * .42, .34, .7); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + U(-.3, .3), ox = Math.cos(a) * .42, oz = Math.sin(a) * .36, sw = U(-.12, .12);
      for (let k = 0; k < 4; k++) add(ox + sw * k, base + .74 - k * .17, oz + sw * k * .6, .12 - k * .012, 1); }
    enfants(8, .5); return fin();
  }
  if (genre === 'anneau') { // un beignet de ouate : le ciel passe au milieu
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; add(Math.cos(a) * .74, base + .34 + U(-.04, .06), Math.sin(a) * .62, .26 + U(-.02, .03), 1); }
    for (let i = 0; i < 7; i++) { const a = (i + .5) / 7 * 6.283; add(Math.cos(a) * .74, base + .6, Math.sin(a) * .62, .2, 1); }
    enfants(B.length, .5); return fin();
  }
  if (genre === 'spirale') { // une vis qui monte en s'amincissant
    for (let i = 0; i < 19; i++) { const t = i / 18, a = t * 3.4 * Math.PI, r = .62 * (1 - .62 * t); add(Math.cos(a) * r, base + .24 + t * 1.75, Math.sin(a) * r * .8, .31 * (1 - .5 * t) + .04, 1); }
    enfants(B.length, .35); return fin();
  }
  if (genre === 'gateau') { // des étages de ouate, de plus en plus petits
    for (let t = 0; t < 3; t++) { const R = .92 - t * .27, y = base + .26 + t * .44, n = 9 - t * 2, rr = .31 - t * .06;
      add(0, y, 0, rr * 1.4, .7); for (let i = 0; i < n; i++) { const a = i / n * 6.283 + t * .4; add(Math.cos(a) * R, y, Math.sin(a) * R * .8, rr, .62); } }
    enfants(B.length, .4); return fin();
  }
  if (genre === 'vague') { // une crête qui monte et déferle vers l'avant
    for (let i = 0; i < 8; i++) { const t = i / 7; for (const z of [-.2, .2]) add(-.95 + i * .25, base + .25 + Math.pow(t, 1.6) * .8, z + U(-.04, .04), .3 - t * .02, 1); }
    for (let k = 0; k < 4; k++) for (const z of [-.18, .18]) add(.82 + k * .12, base + 1.12 - k * .14, z + U(-.04, .04), .22 - k * .02, 1);
    enfants(B.length, .45); return fin();
  }
  if (genre === 'humilis') { d = U(.55, .8); H = U(.28, .42); n0 = 11; rb = U(.22, .3); kidsK = .8; }
  else if (genre === 'mediocris') { d = U(.6, .8); H = U(.5, .7); n0 = 10; rb = U(.27, .34); }
  else if (genre === 'congestus') { d = U(.65, .85); H = U(.55, .75); n0 = 9; rb = U(.3, .36); tour = U(.9, 1.5); }
  else if (genre === 'castellanus') { d = U(.5, .7); H = U(.3, .4); n0 = 10; rb = U(.24, .3); tour = -1; }
  else if (genre === 'cisaille') { d = U(.6, .8); H = U(.5, .65); n0 = 9; rb = U(.28, .34); tour = U(.8, 1.2); cis = U(.18, .3) * (rng() < .5 ? -1 : 1); }
  else if (genre === 'champignon') { d = U(.7, .9); H = U(.5, .6); n0 = 8; rb = U(.3, .36); tour = U(1, 1.4); enclume = 1; }
  else if (genre === 'cumulonimbus') { d = U(.75, .9); H = U(.6, .75); n0 = 10; rb = U(.32, .38); tour = U(2, 2.6); enclume = 2; kidsK = .6; } // le géant d'orage : une tour massive, son ENCLUME large et plate
  else if (genre === 'stratocumulus') { d = U(.3, .45); H = U(.2, .3); n0 = 14; rb = U(.18, .24); kidsK = .7; }
  else if (genre === 'altocumulus') { // un TROUPEAU de petits cumulus détachés
    const np = 4 + Math.floor(rng() * 4);
    for (let p = 0; p < np; p++) { const cx = U(-.85, .85), cz = U(-.5, .5), s = U(.12, .22);
      for (let q = 0; q < 4; q++) add(cx + U(-1, 1) * s, base + s * U(.5, 1.1), cz + U(-1, 1) * s * .6, s * U(.7, 1.1), q < 2 ? .6 : 1); }
    enfants(B.length, .8); return fin();
  }
  else if (genre === 'fractus') { // des lambeaux : quelques lobes aplatis, sans base franche
    const np = 3 + Math.floor(rng() * 3);
    for (let p = 0; p < np; p++) { const cx = U(-.8, .8), cy = base + U(.05, .35), cz = U(-.3, .3);
      for (let q = 0; q < 3; q++) add(cx + U(-.2, .2), cy + U(-.05, .08), cz + U(-.12, .12), U(.1, .2), U(.45, .7)); }
    return fin();
  }
  // LA BASE : des lobes aplatis posés sur le plancher de condensation, répartis dans l'empreinte (une ellipse 1 × d), pas trop serrés
  const P = [];
  for (let t = 0; t < 400 && P.length < n0; t++) { const x = U(-1, 1), z = U(-d, d); if (x * x + (z / d) * (z / d) > 1) continue;
    let ok = true; for (const q of P) if (Math.hypot(q[0] - x, (q[1] - z) * 1.2) < rb * .95) { ok = false; break; } if (ok) P.push([x, z]); }
  for (const q of P) { const rho = Math.sqrt(q[0] * q[0] + (q[1] / d) * (q[1] / d)), hd = H * Math.pow(Math.max(0, 1 - rho * rho), .7);
    const r = rb * U(.8, 1.15) * (1 + .35 * (1 - rho));
    add(q[0], base + Math.max(r * .5, hd + base * 0 - r * .45), q[1], r, 1); }
  // LE DÔME : une couronne de lobes plus hauts vers le centre
  const nd = Math.max(2, Math.round(n0 * .45));
  for (let i = 0; i < nd; i++) { const a = rng() * 6.283, rr = Math.sqrt(rng()) * .55, x = Math.cos(a) * rr, z = Math.sin(a) * rr * d;
    const r = rb * U(1.0, 1.35), hd = H * Math.pow(Math.max(0, 1 - rr * rr), .7); add(x, base + hd + r * .1, z, r, 1); }
  // LA TOUR (congestus, cisaillé, champignon) : des lobes empilés qui rétrécissent, le chou-fleur sur les épaules
  if (tour > 0) { let x = U(-.15, .15), z = U(-.1, .1) * d, y = base + H * .7, r = rb * 1.6; const top = base + H + tour;
    while (y < top && B.length < MAXB - 22) { add(x, y, z, r, 1); add(x + r * U(.55, .8), y - r * .2, z + U(-.3, .3) * r, r * U(.7, .85), 1); add(x - r * U(.55, .8), y - r * .15, z + U(-.3, .3) * r, r * U(.68, .82), 1);
      add(x + U(-.3, .3) * r, y - r * .2, z + r * U(.45, .65) * (rng() < .5 ? -1 : 1), r * U(.65, .8), 1);
      y += r * U(.55, .7); r *= U(.88, .96); x += cis + U(-.05, .05); }
    if (enclume === 1) { const yc = y - r * .35; add(x, yc + r * .15, z, r * 1.1, .6); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + U(-.2, .2), rr = U(.45, .9); add(x + Math.cos(a) * rr, yc + U(-.06, .06), z + Math.sin(a) * rr * .85, U(.28, .38), U(.5, .62)); } }
    if (enclume === 2) { const yc = y - r * .1, dw = U(1.3, 1.8); add(x, yc, z, r * 1.3, .45); // l'ENCLUME : une large table de ouate, étirée sous le vent
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + U(-.15, .15), rr = U(.35, 1) * dw, sx = Math.cos(a) > 0 ? 1.25 : .75; add(x + Math.cos(a) * rr * sx, yc + U(-.04, .05) - rr * .04, z + Math.sin(a) * rr * .7, U(.3, .42), U(.38, .5)); } }
  }
  if (tour < 0) { // castellanus : une rangée de TOURELLES sur la base plate
    const nt = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < nt; i++) { const x = -.7 + 1.4 * (i + .5) / nt + U(-.08, .08); let y = base + H, r = rb * U(.8, 1); const h = U(.35, .7);
      while (y < base + H + h) { add(x, y, U(-.1, .1), r, 1); y += r * .8; r *= .82; } }
  }
  enfants(B.length, kidsK * (ARC_ON ? KIDS_ARC : 1)); // (2026-10-20, Léo : « trop de nuages, vomitif » ; modèles 3D libres CC0 de Quaternius : UNE masse calme, base plate, un dôme, peu de lobes) moins de chou-fleur
  return fin();
  // LE CHOU-FLEUR : chaque lobe du haut porte des enfants ronds (×.38-.55), eux-mêmes des petits-enfants — posés sur sa calotte, vers le haut et le dehors
  function enfants(n, k) {
    let top = base; for (const b of B) top = Math.max(top, b[1] + b[3] * b[4]);
    const Hs = Math.max(.1, top - base), L0 = B.slice(0, n);
    const pose = function (b, nk, f0, f1) { const out = [];
      for (let c = 0; c < nk; c++) { const ox = b[0], oz = b[2], ol = Math.hypot(ox, oz) || 1;
        let dx = U(-1, 1) + ox / ol * .7, dy = U(.5, 1.4), dz = U(-1, 1) + oz / ol * .5; const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        const rc = b[3] * U(f0, f1), i = add(b[0] + dx * b[3] * .78, b[1] + dy * b[3] * .78 * b[4], b[2] + dz * b[3] * .78, rc, 1); if (i >= 0) out.push(B[i]); }
      return out; };
    for (const b of L0) { if (b[4] < .9 || b[1] + b[3] < base + Hs * .3) continue;
      const nk = Math.round((b[3] > .25 ? 3 : 2) * k * U(.7, 1.3)), ks = pose(b, nk, .38, .55);
      for (const c of ks) if (c[1] > base + Hs * .55 && c[3] > .08 && rng() < .7) pose(c, 1 + (rng() < .5 ? 1 : 0), .4, .55); }
  }
  function fin() { let top = base; for (const b of B) top = Math.max(top, b[1] + b[3] * b[4]); return { B: B, base: base, top: top }; }
}
function cotonBuf(r){const g=new THREE.BufferGeometry(); // les tableaux d'un calcul → une géométrie
  g.setAttribute('position',new THREE.BufferAttribute(r.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(r.nor,3));g.setAttribute('color',new THREE.BufferAttribute(r.col,3));
  g.setIndex(new THREE.BufferAttribute(r.idx,1));g.computeBoundingSphere();for(const k in g.attributes)nuLibre(g.attributes[k]);nuLibre(g.index);return g;} // (2026-10-18) la copie JavaScript jetée une fois au GPU (voir nuLibre)
function cotonGeo(S,sph){ // les bourgeons fusionnés, en unités du nuage : modelé cuit (ventre lavande → sommet blanc, creux), faces enfouies jetées — TOUT DE SUITE
  const A=sph.attributes;return cotonBuf(cotonCalc(S.B,S.base,S.top,A.position.array,A.normal.array,sph.index.array,COTON.CH));}
/* L'OUVRIER DES NUAGES (2026-09-30, revue GAMEPLAY, mesuré : cotonInit gelait le fil principal 2,1 à 2,9 s au lancement — 96 formes d'un bloc,
   la plus fine en pèse la moitié — et chaque portail 0,2 s, les coussins et les tours refaisant chacun sa forme). Le calcul d'une forme
   (cotonCalc, pur) part dans un Web Worker bâti depuis sa propre source (un seul code, pas de copie) ; en attendant, une ÉBAUCHE légère
   tient la place. Si le navigateur refuse l'ouvrier (page locale stricte), la file repart sur le fil principal PAR TRANCHES (~8 ms). */
const COTON_OUV={w:null,ko:false,id:0,att:new Map(),file:[],t:0};
function cotonOuvrier(){
  if(COTON_OUV.w||COTON_OUV.ko)return COTON_OUV.w;
  try{const src='const cotonCalc='+cotonCalc.toString()+';const nuage8Calc='+nuage8Calc.toString()+';const nufDemi='+nufDemi.toString()+';self.onmessage=function(e){const q=e.data,r=q.n8?nuage8Calc(q.B,q.base,q.top,q.n8,q.o8):cotonCalc(q.B,q.base,q.top,q.sp,q.sn,q.si,q.CH);if(q.hf&&r.fant){r.fant.D=nufDemi(r.fant,q.dy||0,q.hf);r.fant.Dy=q.dy||0;}self.postMessage({id:q.id,r:r},[r.pos.buffer,r.nor.buffer,r.col.buffer,r.idx.buffer].concat(r.skin?[r.skin.pos.buffer,r.skin.nor.buffer,r.skin.idx.buffer]:[]).concat(r.fant&&r.fant.D?[r.fant.D.buffer]:[]));};';
    const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    w.onmessage=function(e){const a=COTON_OUV.att.get(e.data.id);if(!a)return;COTON_OUV.att.delete(e.data.id);a.cb(e.data.r);};
    w.onerror=function(ev){try{ev.preventDefault();}catch(e9){}cotonOuvrierKo();};COTON_OUV.w=w;
  }catch(e){COTON_OUV.ko=true;}
  return COTON_OUV.w;}
function cotonOuvrierKo(){COTON_OUV.ko=true;if(COTON_OUV.w){try{COTON_OUV.w.terminate();}catch(e){}COTON_OUV.w=null;} // refusé : sa file repart sur le fil principal
  for(const a of COTON_OUV.att.values())cotonTranche(a.job,a.cb);COTON_OUV.att.clear();}
function cotonTranche(job,cb){COTON_OUV.file.push({job:job,cb:cb});if(!COTON_OUV.t)COTON_OUV.t=setTimeout(cotonTrancheSuite,0);}
function cotonTrancheSuite(){COTON_OUV.t=0;const t0=performance.now();
  while(COTON_OUV.file.length&&performance.now()-t0<8){const a=COTON_OUV.file.shift(),q=a.job;a.cb(q.n8?nuage8Calc(q.B,q.base,q.top,q.n8,q.o8):cotonCalc(q.B,q.base,q.top,q.sp,q.sn,q.si,q.CH));}
  if(COTON_OUV.file.length)COTON_OUV.t=setTimeout(cotonTrancheSuite,16);}
function cotonCalcAsync(S,sph,cb){ // cb(le calcul), PLUS TARD : dans l'ouvrier si possible, sinon par tranches
  const A=sph.attributes,job={B:S.B,base:S.base,top:S.top,sp:A.position.array,sn:A.normal.array,si:sph.index.array,CH:COTON.CH},w=cotonOuvrier();
  if(w){const id=++COTON_OUV.id;COTON_OUV.att.set(id,{job:job,cb:cb});try{w.postMessage({id:id,B:job.B,base:job.base,top:job.top,sp:job.sp,sn:job.sn,si:job.si,CH:job.CH});}catch(e){COTON_OUV.att.delete(id);cotonTranche(job,cb);}}
  else cotonTranche(job,cb);}
function nuage8Async(S,N,cb,vit,dyF){ // dyF : le décalage vertical de ses cubes fantômes (nuFantGeo), pour que l'ouvrier les convertisse // (v8) une finesse de la NOUVELLE surface : dans l'ouvrier si possible, sinon par tranches — vit : la taille des écailles du VITRAIL (nombre de cubes sur la plus grande dimension), 0 = sans
  const job={n8:N,o8:Object.assign({seed:S.seed||0},N8_OPT,NUVIT.vox?{vox:NUVIT.vox,det:NUVIT.vox.det==null?N8_OPT.det:NUVIT.vox.det}:vit?(NUVIT.fant?{fant:NUVIT.fant,fsz:NUVIT.fsz,fdeh:NUVIT.fdeh}:Object.assign({vit:vit,iso:NUVIT.iso,nsk:NUVIT.nsk,ecart:NUVIT.ecart,jit:NUVIT.jit||0},NUVIT.mix?{fant:NUVIT.mix,fsz:NUVIT.fsz,fdeh:NUVIT.fdeh}:{})):{}),B:S.B,base:S.base,top:S.top},w=cotonOuvrier();
  if(w){const id=++COTON_OUV.id;COTON_OUV.att.set(id,{job:job,cb:cb});let hf=0;try{hf=NUF_TEX&&job.o8.fant?NUF_W:0;}catch(e){} /* (NUF_TEX est déclarée plus bas : jamais lue en zone morte) */try{w.postMessage({id:id,n8:N,o8:job.o8,B:job.B,base:job.base,top:job.top,hf:hf,dy:dyF||0});}catch(e){COTON_OUV.att.delete(id);cotonTranche(job,cb);}}
  else cotonTranche(job,cb);}
function cotonFinesse(k,f,g){ // une finesse est arrivée : elle remplace l'ébauche dans SON lot et dans les lots plus fins encore en attente
  COTON.pret[k*4+f]=1;const tri=g.index.count/3;
  for(let f2=f;f2<4;f2++){const j=k*4+f2;if(f2>f&&COTON.pret[j])break;const im=COTON.im[j];im.geometry=g;im.userData.tri=tri;}
  let n=0;for(let i=0;i<COTON.pret.length;i++)n+=COTON.pret[i];if(n===COTON.pret.length&&!COTON.msPret)COTON.msPret=performance.now()-COTON.t0;}
/* LA MATIÈRE v8 — la lumière d'un peintre (Ghibli, Zelda : Tears of the Kingdom) : une frontière d'ombre DOUCE mais franche (wrap puis rampe),
   le côté soleil crème, le côté ombre pris par le CIEL (bleu, lavande sous le ventre), l'ombre PORTÉE des bourgeons du haut (G cuit),
   les creux (R cuit), la base plus sourde, et à contre-jour la LISIÈRE qui s'embrase (diffusion avant). Les couleurs sont celles de
   l'ambiance (le soleil, l'hémisphère : bioApply) — aucune couleur écrite ici. Les bords s'allègent (la vapeur). Instanciée (COTON). */
/* (2026-10-14, passe graphismes, coton-blanc) LA MATIÈRE DES NUAGES v2 — Sacha : « des cumulus blancs et vaporeux, pas beige sable / lavande,
   pas du plastique ». Trois choses :
   (1) la teinte PAR NUAGE (cotonPose) devient un blanc NEUTRE à ±3 % de luminance — c'était elle qui mêlait sable et lavande dans la même
       image (±20 % de rouge contre ±22 % de bleu, vue à 30 % par le shader) ; tous paliers, gratuit (même nombre de tirages `cr`) ;
   (2) au palier 2 SEULEMENT (`N8_VAP`) : une toile de bruit 256² (`n8Vap`, fabriquée UNE fois, 128 Ko) lue UNE fois par pixel de nuage
       (bruit 3D de valeur en une lecture : deux tranches côte à côte dans la toile) — les bords s'effilochent sur 3-8 % du rayon, le cœur
       prend un grain de vapeur ; éteint au loin (une cellule sous ~3 px : pas de scintillement) ; paliers 0-1 = le programme d'aujourd'hui ;
   (3) la lisière d'OR seulement à contre-jour (de face, l'allègement du bord reste blanc neutre). Réglage à chaud : `dbgCotonV2({…})`. */
const N8_VAP=PAL.n===2;
function n8Vap(){ const N=256,A=new Uint8Array(N*N),D=new Uint8Array(N*N*2),rg=mulberry32(0x7A9E5C01);
  for(let i=0;i<N*N;i++)A[i]=(rg()*256)|0;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;D[i*2]=A[i];D[i*2+1]=A[((y+17)&255)*N+((x+37)&255)];} // L = la tranche z, A = la tranche z+1 (décalée de 37,17)
  const t=new THREE.DataTexture(D,N,N,THREE.LuminanceAlphaFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}
const N8_U={uFondu:{value:1},uTps:{value:0},uSunW:{value:SUN_DIR},uNearF:GFX_U.uNearF,uAlb:{value:CLOUD_MAT.color},uSunC:{value:null},uSky:{value:null},uGnd:{value:null},uK:{value:new THREE.Vector4(1,1,1,1)},uR:{value:new THREE.Vector4(-.25,.5,.64,1)}}; // uR : la frontière d'ombre (début, fin en N·L), la clarté du côté ombre, (libre)
if(N8_VAP){N8_U.uVap={value:null};N8_U.uVapK={value:new THREE.Vector4(1,1,1,1)};} // (coton-blanc) la toile de vapeur et ses doses : x érosion du bord, y grain du cœur, z or du contre-jour, w tout (palier 2)
N8_U.uHole=NHOLE.uHole;N8_U.uHoleC=NHOLE.uHoleC;N8_U.uMood={value:new THREE.Vector4(1,0,0,0)};N8_U.uBolt=NBOLT.uBolt;N8_U.uBoltR=NBOLT.uBoltR;N8_U.uInC={value:new THREE.Vector3(.6,.7,1)};
N8_U.uLav={value:new THREE.Vector3(.72,.78,.97)}; // (2026-10-14, passe graphismes · nuages-jour) la teinte de l'ombre des cumulus (était la constante vec3(.72,.78,.97) du GLSL, un bleu-lavande franc) : un uniforme, posé par ambiance (champ `nuLav`), même valeur par défaut
/* LES NUAGES SANS COUTURES BLEUES (2026-10-15 soir, Sacha : « les nuages sont encore buggés ») — VU au banc (mer de nuages, rafales de photos) : des
   LISERÉS BLEUS et des trous dans la ouate là où deux cumulus se chevauchent. La cause : le bord d'un nuage est à demi transparent (la silhouette
   qui s'allège, le fondu près de l'objectif, le fondu d'une zone neuve) mais il ÉCRIT sa profondeur ; les nuages sont rangés en ~100 lots
   (gabarit × finesse) triés du plus loin au plus près DANS chaque lot, mais pas d'un lot à l'autre — un nuage proche dessiné avant un nuage
   lointain d'un autre lot le masquait, et le ciel passait par son bord. Depuis la map SANS HAUT NI BAS (des nuages tout autour, très près de la
   route qui se tord), on ne voyait plus que ça. Le bord devient une TRAME ordonnée (Bayer 4 × 4) : chaque fragment est opaque ou jeté — l'ordre
   de dessin ne compte plus. Les nuages en instances seulement (le nuage du titre garde son fondu). `?nuages=fondus` = avant. */
const N8_TRAME=!/[?&]nuages=fondus\b/.test(location.search);
function nuage8Mat(){ if(COTON.mat8)return COTON.mat8;
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k in N8_U)U[k]=N8_U[k];
  U.uSunC.value=sun.color;U.uSky.value=hemi.color;U.uGnd.value=hemi.groundColor;
  if(N8_VAP)U.uVap.value=n8Vap(); // (coton-blanc) fabriquée une fois, à la 1re matière (au menu : nuageChauffe → cotonInit)
  const m=new THREE.ShaderMaterial({uniforms:U,vertexColors:true,fog:true,transparent:true,depthWrite:true,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','varying vec3 vN,vW,vA,vT;varying float vNvF;uniform float uTps;',...(N8_VAP?['varying vec3 vP;varying float vQ;']:[]),
      'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);',
      '  float ph=0.;vNvF=0.;',
      '#ifdef USE_INSTANCING',
      '  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));vNvF=instanceMatrix[0][3];',
      '#endif',
      ...(N8_VAP?['  vP=position*13.+vec3(fract(ph*.71),fract(ph*.53),fract(ph*.37))*256.;']:[]), /* (coton-blanc) la vapeur ACCROCHÉE au nuage (avant le bouillonnement) : une cellule = 7,7 % du rayon ; chaque nuage son décalage */
      /* LA OUATE QUI BOUILLONNE (v8) : chaque lobe gonfle et se retire très lentement (deux ondes lentes le long de la normale, 1,5 % du nuage),
         déphasées par nuage — le ciel vit sans qu'aucun nuage ne bouge de place. Un calcul par sommet, zéro par pixel. */
      '  tr+=nn*(sin(uTps*.33+ph+dot(position,vec3(3.1,4.7,2.3)))*.011+sin(uTps*.19-ph+dot(position,vec3(-5.3,2.9,3.7)))*.007)*step(-.33,position.y);',
      '#ifdef USE_INSTANCING',
      '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz;',
      '  nn=mat3(instanceMatrix)*(nn/vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2)));',   // la normale suit l étirement de l instance (inverse transposée)
      '  tr=(instanceMatrix*vec4(tr,1.)).xyz;',
      '#endif',
      '#ifdef USE_INSTANCING_COLOR',
      '  vT=instanceColor;',
      '#endif',
      '  vA=color;vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);',
      '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;',
      ...(N8_VAP?['  float sc9=length(modelMatrix[0].xyz);','#ifdef USE_INSTANCING','  sc9*=length(c0);','#endif','  vQ=sc9*.077/max(length(cameraPosition-wp.xyz),1.);']:[]), /* (coton-blanc) la taille d une cellule de vapeur à l écran (rad) : sous ~3 px elle s éteint */
      '#include <fog_vertex>',
      '}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uAlb,uSunC,uSky,uGnd;uniform vec2 uNearF;uniform vec4 uK,uR;uniform float uFondu;uniform vec4 uHole[8];uniform float uHoleC;uniform vec4 uMood;uniform vec3 uInC;uniform float uTps;uniform vec4 uBolt[12];uniform float uBoltR;varying vec3 vN,vW,vA,vT;varying float vNvF;',...(N8_VAP?['uniform sampler2D uVap;uniform vec4 uVapK;varying vec3 vP;varying float vQ;','float n8vap(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.-2.*f);vec2 uv=mod(p.xy+vec2(37.,17.)*p.z,256.)+f.xy;vec2 rg=texture2D(uVap,(uv+.5)/256.).ra;return mix(rg.x,rg.y,f.z);}']:[]),
      'void main(){vec3 N=normalize(vN),N0=N,V=normalize(cameraPosition-vW);',
      '  for(int i9=0;i9<8;i9++){vec4 h9=uHole[i9];if(h9.w>.01&&distance((floor(vW/uHoleC)+.5)*uHoleC,h9.xyz)<h9.w)discard;}',
      /* LE RELIEF DE PRÈS (SON et DEBUGGING, mesuré : en vol, un grand nuage tout proche était un MUR lisse « en plastique ») : sous ~300 m, la
         normale ondule (deux champs de sinus déformés, en espace monde, des bosses de ~50 m) — le mur redevient de la ouate bosselée. Au loin, rien. */
      '  float dd=length(cameraPosition-vW),kd=smoothstep(320.,70.,dd);',
      '  if(kd>.01){vec3 q=vW*.045;vec3 w=sin(q.zxy*1.3+sin(q.yzx*2.1));vec3 g=cos(q*2.7+w*1.6)+.5*cos(q.yzx*6.1+w.zxy*2.);N=normalize(N+(g-N*dot(g,N))*.32*kd);}',
      '  float ao=vA.r,tv=vA.g,hh=vA.b,nl=dot(N,uSunW),sh=smoothstep(-.1,.5,uSunW.y);',
      '  float lit=smoothstep(uR.x,uR.y,nl);',                                                    /* la frontière d ombre : douce mais FRANCHE (le trait d un peintre) */
      '  lit*=mix(1.,tv,.6*sh)*mix(.32,1.,ao);',                                                  /* l ombre portée des lobes du haut, les creux du chou-fleur */
      /* (2026-10-01, Sacha : « les nuages, j'aime pas l'effet Van Gogh, remets un effet normal ») la touche sur la ouate — la lumière posée en
         aplats de peintre aux bords brisés, le contour sombre — est RETIRÉE : les nuages gardent leur modelé doux. */
      '  vec3 alb=uAlb*mix(vec3(1.),vT,.3)*uK.x;',                                                /* la teinte propre du nuage, en sourdine (à plein, les « chauds » sortaient ORANGE) */
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(vec3(.72,.78,.97)*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',   /* (SON, mesuré) l ombre tirait au BRUN (le sol de l hémisphère) : un bleu-LAVANDE franc sous le ventre et sur les flancs */                   /* le côté ombre pris par le CIEL : bleu-lavande (et le rebond de la mer sous le ventre) */
      '  vec3 Fd=normalize(vec3(-uSunW.x,.55,-uSunW.z));float fl=.72+.38*max(dot(N,Fd),0.)+.12*max(-N.y,0.);',     /* le côté OMBRE a son modelé : le ciel à l opposé du soleil l éclaire, la mer de nuages renvoie par en dessous */
      '  vec3 ombre=ciel*uR.z*fl*mix(.55,1.,ao)*mix(.84,1.,hh);',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',                                        /* la CHALEUR du soleil : nulle au matin et à midi, l or n arrive qu en fin d après-midi */
      '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',   /* (SON, mesuré) au matin les nuages sortaient BEIGE-SABLE : un blanc franc côté soleil */
      '  vec3 col=alb*mix(ombre,soleil,lit);',
      '  float fr=1.-max(dot(N,V),0.),bk=pow(max(dot(-V,uSunW),0.),3.);',
      ...(N8_VAP?['  float nz=n8vap(vP),kq=smoothstep(.0045,.013,vQ)*uVapK.w,e9=smoothstep(.62,.95,fr)*kq;']:[]), /* (coton-blanc) UNE lecture : nz la vapeur, e9 la frange (3-8 % du rayon au bord de la silhouette) */
      N8_VAP?'  col+=soleil*mix(vec3(1.),vec3(1.,.9,.7),uVapK.z*smoothstep(.3,.8,dot(uSunC,vec3(.3,.59,.11))))*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;':'  col+=soleil*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;',   /* (SON, mesuré) la lueur de contre-jour ne teinte plus TOUTE la face en sable : le liseré, et un voile léger */                                  /* à contre-jour : la LISIÈRE d argent, et la vapeur éclairée par derrière */
      N8_VAP?'  col+=alb*vec3(dot(soleil,vec3(.3,.59,.11)))*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);':'  col+=alb*soleil*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);',                                     /* de face, le bord qui tourne s ALLÈGE (la vapeur mince diffuse la lumière) */
      /* (2026-10-21, Léo : « utilise la technique de la forêt, la transparence, pour que chaque nuage soit adapté à sa météo ») L'HUMEUR : un souffle de lumière DE L'INTÉRIEUR (uInC × uMood.y), qui monte aux éclairs (uMood.z)
         et ne se voit que dans l'ombre et les creux — la ouate devient un verre dépoli éclairé du dedans, comme la peau du vitrail de la forêt ; + de petits éclairs lointains propres à chaque quartier de ciel. */
      '  {float ob=1.-lit*.8,cr9=.3+.7*(1.-ao),lo9=pow(.5+.5*sin(uTps*.9+dot(floor(vW/190.),vec3(1.7,2.3,3.1))),40.);col+=uInC*uMood.y*(.35+uMood.z*1.7+lo9*.5)*ob*cr9;}',
      '  {vec3 bl=vec3(0.);float R2=uBoltR*uBoltR;for(int i9=0;i9<12;i9++){vec4 b=uBolt[i9];if(b.w>.01){vec3 dv=vW-b.xyz;float g=b.w*exp(-dot(dv,dv)/R2);bl+=vec3(.55,.44,1.)*g+vec3(.5)*g*g;}}col+=bl*(.55+.45*(1.-lit))*1.15;}', /* la ouate s éclaire AUTOUR des fils : violet, blanc au plus près (g²) */
      '  float a=(1.-pow(fr,6.)*.45*uK.w)*uFondu;',
      ...(N8_VAP?['  col*=mix(1.,.955+.09*nz,kq*uVapK.y*(1.-e9));','  a*=mix(1.,smoothstep(e9*.9-.15,e9*.9+.15,nz),e9*uVapK.x);']:[]), /* (coton-blanc) le grain du cœur (±4,5 %), puis le bord qui s effiloche : plus on va vers la silhouette, plus la vapeur doit être dense pour rester */
      '#ifdef NUAGE8_INST',
      '  a*=uMood.x*smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));',
      ...(N8_TRAME?['  {vec2 q9=floor(gl_FragCoord.xy),h9=floor(q9*.5);float b9=fract(h9.x*.5+h9.y*h9.y*.75)*.25+fract(q9.x*.5+q9.y*q9.y*.75);if(a<=b9+.03125||(vNvF<0.?-vNvF<=b9+.03125:vNvF>b9+.03125))discard;a=1.;}']:['  a*=vNvF<0.?-vNvF:1.-vNvF;']), /* (2026-10-15 soir) LE BORD EN TRAME : opaque ou rien (voir N8_TRAME) */ /* (2026-10-18, LE FONDU) la v8 (part ≥ 0) cède ces points-là ; le corps rentré d'un fantôme (part < 0) les prend */
      '#endif',
      ...(N8_VAP?['  if(e9>.01&&a<.02)discard;']:[]), /* (coton-blanc) un bord effiloché n écrit pas sa profondeur : le lobe de derrière le remplit */
      '  gl_FragColor=vec4(col,a);',
      '#include <fog_fragment>',
      '}'].join('\n')});
  {m.fragmentShader=m.fragmentShader.replace('uniform vec3 uSunW,','uniform vec3 uLav,uSunW,').replace('vec3(.72,.78,.97)','uLav');m.uniforms.uLav=N8_U.uLav;} // (2026-10-14, passe graphismes · nuages-jour) même coût (un uniforme au lieu d'une constante), source différente = programme à part
  m.defines={NUAGE8_INST:''};m.customProgramCacheKey=function(){return N8_VAP?'nuage8inst2':'nuage8inst';}; /* (coton-blanc) la solo garde 'nuage8solo' : le titre (CHUTE.nuM) en partage le programme — sa source change déjà la clé de three */
  return (COTON.mat8=m);}
function nuage8Solo(){ if(COTON.mat8s)return COTON.mat8s; // (v8) la même matière pour un maillage seul (bancs de route, coussins de vol, tours) — chauffée au menu (nuageChauffe)
  const m=nuage8Mat().clone();m.uniforms=nuage8Mat().uniforms;m.defines={};m.customProgramCacheKey=function(){return 'nuage8solo';};return (COTON.mat8s=m);}
/* ============================== LES NUAGES EN VITRAIL (2026-10-18, Léo) ==============================
   « Sacha avait beaucoup de mal à avoir les nuages comme il voulait : essaie la technique des mini-cubes et de la couche transparente lisse
   — la glisse transparente peut embrasser la forme des cubes — garde toutes les qualités qu'on a déjà, et crée encore plus de relief, de
   profondeur, d'immersion. » (au questionnaire : TOUS les nuages.) La recette VITRAIL (voir la mémoire « vitrail ») sur la v8, sans rien
   lui retirer : du MÊME champ que la surface v8 (nuage8Calc, opt.vit), trois maillages par nuage, de près (finesses 2 et 3) :
     · LES ÉCAILLES (`nuVitCub`) : des cubes de ext/NUVIT.nc à 89 %, OPAQUES, éclairés par la lumière v8 (`n8lum`, la même fonction) sur le
       gradient du champ en leur centre, un peu de leur face (`uRel` : le relief), une nuance chacun, un biseau, un éclat de temps en temps ;
     · LE CŒUR (`nuVitCoe`) : la surface v8 rentrée de 1,15 cube, de la LUMIÈRE pure (le soleil de l'ambiance) — c'est elle qu'on voit
       dans les joints ;
     · LA PEAU (`nuVitPea`) : l'isosurface des cubes adoucis (elle EMBRASSE leurs marches), transparente de face (`uCoqA0`) et opaque sur la
       silhouette (`uCoqA1`), la ouate v8 en lumière + le ciel au bord + l'éclat du soleil + un film irisé ;
     · L'ONDE (`uScan`) qui monte le long du nuage (chacun la sienne) et allume les joints, les arêtes, la peau.
   De LOIN (finesses 0 et 1) : le nuage v8 tel quel (de loin lisse et brillant, de près le pixel — le juste milieu de Léo). Tri, fondu
   près de l'objectif (la trame) et fondu d'une zone neuve gardés. `dbgNuVit(0|1,{…})` = A/B sur la même image. */
/* LE FONDU (2026-10-18, Sacha : « c'est bien l'effet des nuages pixelisés mais ça bug par moment, quand on s'éloigne ou on se rapproche les
   nuages ont parfois l'ancienne texture parfois les pixels ») : les seuils de distance (de loin → la v8, puis 40 % des fantômes, puis tous ;
   tout près → la v8) BASCULAIENT un nuage d'une image à l'autre — mesuré : ~100 nuages bien vus basculés d'un coup sur 4 km de route, autant en vol.
   Chaque nuage a maintenant DEUX PARTS (`nuvPoids`, x = (d−R)/R, c = un cube à l'écran en rad) : celle du CORPS (v8 → corps rentré, ou
   vitrail) et celle des CUBES. En vitrail, une seule rampe, de x = `bLoin` (4,06 : l'ancien seuil du lot 2) à 2,53. En fantôme, les deux
   PALIERS de Léo gardés, en fondu : 0 → 37 % des cubes (et le corps) de x 4,06 à 3,5, puis 37 → 100 % de 2,05 à 1,78 (l'ancien seuil du
   lot 3) — le lot lointain (40 % des fantômes) prend tout le palier : le coût reste celui d'avant. Tout près, tout redescend quand un cube
   dépasse `bPres` à l'écran (vitrail 0,06 → 0,09 rad ; fantôme 0,035 → 0,09 : ses cubes sont petits, la rampe en mètres serait trop
   courte) ; jamais plus gros qu'avant. Entre les deux, la v8 et le corps (ou le vitrail) se partagent les points de la MÊME trame
   (complémentaires : jamais deux fois le même point) ; les fantômes arrivent un par un dans leur ordre tiré au hasard (le rang : `cu/uFN`
   dans la texture `NUF_TEX`, l'attribut `aR` sinon ; un cube se montre quand la part le dépasse) ; la peau du vitrail suit en alpha. Les parts voyagent dans la ligne du bas de la matrice
   d'instance (inutilisée : les shaders ne gardent que xyz) : [0][3] = le corps (≥ 0 pour la v8, en négatif pour le corps rentré et le
   vitrail), [1][3] = −les cubes ; une matrice ordinaire = rien ne change. Nuages seuls fantômes (`mkCloud`) : les cubes
   s'effacent tout près (`uNvW`, posé par objet dans `onBeforeRender`), le corps reste. Écarté : le vitrail PARTOUT (dalles grises de près,
   bords carrés de loin, jusqu'à ×6 triangles). `?sans=nuvitfondu` = les bascules d'avant ; `dbgNuVit(1,{fondu:0|1})` = A/B. */
const CDENS=(function(){const m=/[?&]cdens=([0-9.]+)/.exec(location.search);return m?+m[1]:.14;})(); // (2026-10-20, Léo : « trop de nuages… trop chaotique, plus paisible »)
const GROS=(function(){const m=/[?&]gros=([0-9.]+)/.exec(location.search);return m?+m[1]:.4;})(); // la part gardée des GRANDES masses (cathédrales, massifs, titans, tours) sur la map NUAGES // (2026-10-20, Léo : « il y a trop de nuages, c'est un peu vomitif ») la part des nuages de décor gardée sur la map NUAGES (1 = le semis d'avant ; ?cdens=)
const ARC_ON=!/[?&]arc=0\b/.test(location.search);
const KIDS_ARC=(function(){const m=/[?&]kids=([0-9.]+)/.exec(location.search);return m?+m[1]:.4;})(); // la part du chou-fleur gardée sur les gabarits de nuages (1 = d'avant) // (2026-10-19, essai ARC) le fond en photo + la mer de cumulus + les nuages en VERRE ; ?arc=0 = le main d avant
const NUVIT={on:true,nc:36,iso:.3,ang:.09,nsk:0,ecart:.47,
  fondu:!/[?&]sans=([^&]*,)?nuvitfondu(,|&|$)/.test(location.search),bLoin:4.06,bPres:[.06,.09],bPresF:[.035,.09]}; // (2026-10-18) LE FONDU : voir au-dessus
function nuvLisse(a,b,v){const q=Math.min(1,Math.max(0,(v-a)/(b-a)));return q*q*(3-2*q);}
const NUVP=new Float32Array(2); // [le corps, les cubes]
function nuvPoids(x,c){const b=NUVIT.fant?NUVIT.bPresF:NUVIT.bPres,n=1-nuvLisse(b[0],b[1],c); // les deux parts d'un nuage (dans NUVP) : x = (d−R)/R, c = un cube à l'écran (rad)
  if(NUVIT.fant){const p=NUVIT.loin*.93,wc=p*(1-nuvLisse(3.5,NUVIT.bLoin,x))+(1-p)*(1-nuvLisse(1.78,2.05,x));NUVP[0]=Math.min(1,wc/p)*n;NUVP[1]=wc*n;} // les paliers de Léo, en fondu (p < 40 % : le lot lointain suffit)
  else NUVP[0]=NUVP[1]=(1-nuvLisse(2.53,NUVIT.bLoin,x))*n;return NUVP;}
const NV_U={uLueur:{value:1.08},uScan:{value:.7},uScanV:{value:.07},uCoqA0:{value:.5},uCoqA1:{value:.92},uRel:{value:.12},uEcl:{value:1},uBis:{value:.08},uTache:{value:0},uChaud:{value:0},uTrans:{value:0},uBordC:{value:0},uFant:{value:1},uPeint:{value:1},uVerre:{value:0}};
const NV_DOSES={doux:{uCoqA0:.5,uCoqA1:.92,uRel:.12,uLueur:1.08,uBis:.08,uTache:0,uChaud:0,uTrans:0,uBordC:0},moyen:{uCoqA0:.3,uCoqA1:.9,uRel:.3,uLueur:1.16,uBis:.13,uTache:0,uChaud:0,uTrans:0,uBordC:0},fort:{uCoqA0:.12,uCoqA1:.85,uRel:.45,uLueur:1.26,uBis:.18,uTache:0,uChaud:0,uTrans:0,uBordC:0},
  verre:{uCoqA0:.2,uCoqA1:.86,uRel:.3,uLueur:1.16,uBis:.13,uTache:0,uChaud:0,uTrans:.25,uBordC:.6,uVerre:.5}, // (2026-10-19, Léo : « les nuages devant, c'était mieux l'avant-dernière version [le vitrail MOYEN] ; joue plus la transparence ») : les écailles et le cœur s'ouvrent de FACE (trame), pleins sur la silhouette ; la peau plus claire
  fantome:{uFant:1,uPeint:1}, // (2026-10-18, Léo : « encore plus minuscules, encore plus fantomatiques, construire de nouveaux nuages, les teintes comme un peintre »)
  peintre:{uCoqA0:.34,uCoqA1:.9,uRel:.05,uLueur:1.2,uBis:0,uTache:.12,uChaud:.6,uTrans:.55,uBordC:.85}}; // (2026-10-18, Léo : « pas comme Minecraft ; triche pour obtenir une sorte de réalisme ; fais le peintre ») chaque cube une TOUCHE (chaude au soleil, froide à l ombre), plus de faces dures, le contour en vapeur, la lumière qui TRAVERSE à contre-jour // (2026-10-18) trois dosages du vitrail, à montrer à Léo
{const m9=/[?&]nuvit=(doux|moyen|fort|peintre|fantome|verre|voxel)\b/.exec(location.search);NUVIT.dose=m9?m9[1]:(ARC_ON?'voxel':'fantome');if(NUVIT.dose==='voxel'){NUVIT.on=false;NUVIT.vox={k:+((/[?&]vk=([0-9.]+)/.exec(location.search)||[0,2.4])[1]),kn:+((/[?&]vkn=([0-9.]+)/.exec(location.search)||[0,.9])[1]),jit:+((/[?&]vjit=([0-9.]+)/.exec(location.search)||[0,.045])[1]),det:.22,t0:.42,t1:.84,hb:.35};} /* (2026-10-20, Léo : « le niveau nuage a l'air déchiqueté… entre réalisme et cubes pixel de tailles variables ») LE CUMULUS EN CUBES : un seul corps opaque, voir nuage8Calc (opt.vox) ; ?nuvit=fantome = l'avant */if(NUVIT.dose==='fantome'){NUVIT.fant=ARC_ON?(function(){const q=/[?&]fant=(\d+)/.exec(location.search);return q?+q[1]:1400;})():8000;NUVIT.fsz=ARC_ON?100:110;NUVIT.loin=.4;if(ARC_ON)NUVIT.fdeh=.4;} /* (2026-10-20, Sacha : « trop chelou, il y a trois types de nuages différents ») le vitrail en verre ne vivait qu'entre deux distances (lisse près, grille de verre au milieu, lisse loin) : trois aspects dans une vue. UN type : le corps lisse v8 et sa poussière de cubes, partout */if(NUVIT.dose==='verre'){NUVIT.mix=(function(){const m=/[?&]mix=(\d+)/.exec(location.search);return m?+m[1]:2400;})();NUVIT.fsz=95;NUVIT.loin=.5;NUVIT.fdeh=.75;} /* (2026-10-19, Léo : « reste sur ce que tu as fait, mais un tout petit peu éparpillé — le côté trash de la version d'avant, les petits cubes qui s'éparpillent : le gros nuage condensé qui se sépare en plein de trucs ») LE MÉLANGE : le vitrail en verre + des cubes fantômes, surtout DEHORS */if(NUVIT.dose==='peintre'){NUVIT.nc=48;NUVIT.nsk=34;NUVIT.ecart=.52;NUVIT.jit=.3;NUVIT.coeur=.25;} /* (2026-10-18, Léo : « essaie en mode vitrail » → au questionnaire : PLUS VISIBLE, le dosage FORT par défaut — MOYEN le 18/10 au matin) */for(const q in NV_DOSES[NUVIT.dose])NV_U[q].value=NV_DOSES[NUVIT.dose][q];} // ?nuvit=doux|moyen|fort
function nuVitGLSL(){ // les déclarations et la lumière v8 (copie de nuage8Mat : SANS la vapeur du palier 2)
  return ['uniform vec3 uSunW,uAlb,uSunC,uSky,uGnd'+(',uLav')+';uniform vec2 uNearF;uniform vec4 uK,uR;uniform float uFondu,uTps,uLueur,uScan,uScanV,uCoqA0,uCoqA1,uRel,uEcl,uBis,uTache,uChaud,uTrans,uBordC,uFant,uPeint,uVerre;',
    'float nvVerre(vec3 N,vec3 V){return mix(1.-uVerre,1.,smoothstep(.12,.8,1.-abs(dot(N,V))));}', // (essai ARC) LE VERRE : ouvert de face, plein sur la silhouette
    'vec3 n8lum(vec3 N,vec3 V,vec3 A,vec3 T,out float fr,out float lit){',
    '  float ao=A.r,tv=A.g,hh=A.b,nl=dot(N,uSunW),sh=smoothstep(-.1,.5,uSunW.y);',
    '  lit=smoothstep(uR.x,uR.y,nl);lit*=mix(1.,tv,.6*sh)*mix(.32,1.,ao);',
    '  vec3 alb=uAlb*mix(vec3(1.),T,.3)*uK.x;',
    '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
    '  vec3 ciel=mix('+('uLav')+'*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',
    '  vec3 Fd=normalize(vec3(-uSunW.x,.55,-uSunW.z));float fl=.72+.38*max(dot(N,Fd),0.)+.12*max(-N.y,0.);',
    '  vec3 ombre=ciel*uR.z*fl*mix(.55,1.,ao)*mix(.84,1.,hh);',
    '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
    '  vec3 soleil=mix(vec3(1.,.99,.975),uSunC/max(uSunC.r,.01),ch)*dot(uSunC,vec3(.3,.59,.11))*uK.y;',
    '  vec3 col=alb*mix(ombre,soleil,lit);',
    '  fr=1.-max(dot(N,V),0.);float bk=pow(max(dot(-V,uSunW),0.),3.);',
    '  col+=soleil*(pow(fr,3.)*1.5*bk+bk*.07*(1.-ao*.5))*uK.z;',
    '  col+=alb*soleil*pow(fr,2.)*.16*(1.-bk)*(.4+.6*lit);',
    '  return col;}',
    'vec3 n8glow(){return mix(vec3(1.,.97,.9),uSunC/max(max(uSunC.r,uSunC.g),.01),.35)*(.4+.75*min(1.,dot(uSunC,vec3(.3,.59,.11))));}', // le cœur : la lumière de l ambiance (la nuit, plus sourde)
    'float n8onde(float h,float ph){return uScan*exp(-pow((h-fract(uTps*uScanV+ph))/.09,2.));}'].join('\n');}
function nuVitVS(k){ // k : 0 écailles · 1 cœur · 2 peau
  return ['#include <common>','#include <fog_pars_vertex>','uniform float uTps;varying vec3 vN,vW,vA,vT;varying float vPh,vNvF;',...(k===0?['attribute vec3 aG;attribute vec4 aCu;varying vec3 vG,vL;varying float vH;']:[]),
    'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);float ph=0.;vNvF=1.;',
    '#ifdef USE_INSTANCING','  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));{float s9=instanceMatrix[0][3];vNvF=s9<0.?-s9:1.;}','#endif',
    ...(k?['  tr+=nn*(sin(uTps*.33+ph+dot(position,vec3(3.1,4.7,2.3)))*.011+sin(uTps*.19-ph+dot(position,vec3(-5.3,2.9,3.7)))*.007)*step(-.33,position.y);']:[]), // la ouate qui bouillonne (pas les cubes : leurs faces se sépareraient)
    ...(k===0?['  vec3 gg=aG;vL=aCu.xyz;vH=aCu.w;']:[]),
    '#ifdef USE_INSTANCING',
    '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz,iv=1./vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2));',
    '  nn=mat3(instanceMatrix)*(nn*iv);',...(k===0?['  gg=mat3(instanceMatrix)*(gg*iv);']:[]),
    '  tr=(instanceMatrix*vec4(tr,1.)).xyz;',
    '#endif',
    '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
    '  vA=color;vPh=fract(ph*3.7);vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);',...(k===0?['  vG=normalize(mat3(modelMatrix)*gg);']:[]),
    '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');}
const NV_TRAME=['#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
  '  {vec2 q9=floor(gl_FragCoord.xy),h9=floor(q9*.5);float b9=fract(h9.x*.5+h9.y*h9.y*.75)*.25+fract(q9.x*.5+q9.y*q9.y*.75);if(a<=b9+.03125)discard;}'].join('\n'); // opaque ou jeté (la trame de la v8 : l ordre de dessin ne compte pas)
function nuVitFS(k){
  const tete=['#include <common>','#include <fog_pars_fragment>',nuVitGLSL(),'varying vec3 vN,vW,vA,vT;varying float vPh,vNvF;',...(k===0?['varying vec3 vG,vL;varying float vH;']:[])];
  if(k===0)return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(mix(normalize(vG),normalize(vN),uRel));float fr,lit;',
    '  vec3 col=n8lum(N,V,vA,vT,fr,lit)*(.96+.08*vH);',                                                                         // chaque écaille sa nuance
    '  {float h1=fract(vH*13.7),h2=fract(vH*71.3);col*=mix(vec3(1.),mix(vec3(.93,.97,1.07),vec3(1.05,1.01,.93),lit),uChaud);col*=1.+uTache*((h2-.5)*vec3(1.)+(h1-.5)*vec3(.5,.05,-.5));}',
    '  vec3 qb=abs(vL);qb/=max(max(qb.x,max(qb.y,qb.z)),1e-5);float eb=smoothstep(.6,1.,qb.x+qb.y+qb.z-1.-min(qb.x,min(qb.y,qb.z)));',  // le biseau : on lit le cube
    '  float sc=n8onde(vA.b,vPh);vec3 gl=n8glow();',
    '  col=col*(1.-uBis*eb)+gl*(eb*(.04*uLueur+1.1*sc)+sc*.1);',
    '  if(vH>.975)col+=vec3(1.)*pow(.5+.5*sin(uTps*(3.+4.*fract(vH*13.1))+vH*80.),8.)*.6*uEcl;',                                 // un éclat de temps en temps
    '  float a=uFondu*vNvF*(1.-uBordC*smoothstep(.5,.82,1.-abs(dot(normalize(vG),V))))*nvVerre(normalize(vN),V);',NV_TRAME,'  gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}']).join('\n');
  if(k===1)return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW);float fr,lit,sc=n8onde(vA.b,vPh);vec3 gl=n8glow();',
    '  vec3 col=n8lum(normalize(vN),V,vA,vT,fr,lit)*uLueur*(.93+.07*sin(uTps*1.7+vPh*6.2832))+gl*1.5*sc+uSunC*uTrans*pow(max(dot(-V,uSunW),0.),3.)*(1.2-vA.r*.6);',
    '  float a=uFondu*vNvF*nvVerre(normalize(vN),V);',NV_TRAME,'  gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}']).join('\n');
  return tete.concat(['void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(vN);float fr,lit;vec3 base=n8lum(N,V,vA,vT,fr,lit);',
    '  vec3 rf=reflect(-V,N),sky=mix(uGnd*.85,uSky*1.15,smoothstep(-.3,.5,rf.y));float sc=n8onde(vA.b,vPh);',
    '  vec3 col=mix(base,sky,.18*fr)+uSunC*pow(max(dot(rf,uSunW),0.),220.)*1.6+(.5+.5*cos(6.2832*(fr*1.4+vW.y*.004+vec3(0.,.33,.67))))*fr*.05+n8glow()*sc*.25;', // le ciel au bord, l éclat, le film irisé
    '  float a=min(1.,mix(uCoqA0,uCoqA1,pow(fr,1.5))*(1.-uBordC*.55*smoothstep(.8,1.,fr))+sc*.1)*uFondu*vNvF;',
    '#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
    '  gl_FragColor=vec4(col,a);','#include <fog_fragment>','}']).join('\n');}
/* (2026-10-18, Léo : « le même rendu avec moins de RAM ») LES FANTÔMES EN TEXTURE (`NUF_TEX`, WebGL2) : MESURÉ, les cubes fantômes coûtaient
   ~90 Mo de tampons au GPU et autant de copies en JavaScript — chaque cube était écrit QUATRE fois (un sommet par coin : 240 octets). Désormais
   un cube = 3 texels en demi-précision (24 octets) dans une texture par gabarit ; le sommet retrouve son cube et son coin par gl_VertexID ; un
   seul tampon d'indices pour tous (`NUF_IDX`) ; les copies JavaScript sont jetées une fois envoyées (`nuLibre`). Même image. Sans WebGL2 : les
   attributs d'avant. `?fant=attr` force l'ancien chemin (A/B). */
const NUF_TEX=!!(renderer.capabilities&&renderer.capabilities.isWebGL2)&&!/[?&]fant=attr\b/.test(location.search),NUF_W=1024;
function NU_LIBRE(){this.array=null;} // une fois au GPU, la copie JavaScript ne sert plus (la page se recharge si le contexte est perdu)
function nuLibre(a){if(a&&a.array&&!a.__bpe){a.__bpe=a.array.BYTES_PER_ELEMENT;a.onUpload(NU_LIBRE);}return a;}
let NUF_IDX=null;
function nufIdx(){if(NUF_IDX)return NUF_IDX;const M=10920,I=new Uint16Array(M*6); // les indices de 10 920 carrés : UN tampon pour tous les nuages
  for(let i=0;i<M;i++){const b=i*4,o=i*6;I[o]=b;I[o+1]=b+1;I[o+2]=b+2;I[o+3]=b;I[o+4]=b+2;I[o+5]=b+3;}return (NUF_IDX=nuLibre(new THREE.BufferAttribute(I,1)));}
function nuFantVS(tex){return ['#include <common>','#include <fog_pars_vertex>','uniform float uTps,uNvW;varying vec3 vN,vW,vA,vT;varying vec4 vQ;varying vec2 vUv;varying float vPh;',
  ...(tex?['uniform highp sampler2D uFTex;uniform float uFN;']:['attribute vec4 aQ;attribute vec2 aCo;attribute float aR;']),
  'void main(){',
  ...(tex?['  int cu=gl_VertexID/4,co=gl_VertexID-cu*4,t9=cu*3;',
           '  vec4 T0=texelFetch(uFTex,ivec2(t9%'+NUF_W+',t9/'+NUF_W+'),0),T1=texelFetch(uFTex,ivec2((t9+1)%'+NUF_W+',(t9+1)/'+NUF_W+'),0),T2=texelFetch(uFTex,ivec2((t9+2)%'+NUF_W+',(t9+2)/'+NUF_W+'),0);',
           '  vec3 P9=T0.xyz,N9=T1.xyz,C9=T2.xyz;vec4 Q9=vec4(T0.w,T1.w,T2.w,0.);vec2 O9=vec2(co==1||co==2?1.:-1.,co>=2?1.:-1.);float rk=float(cu)/uFN;']  // le cube : sa place et sa taille, sa normale et son voile, son modelé et sa teinte ; le coin
        :['  vec3 P9=position,N9=normal,C9=color;vec4 Q9=aQ;vec2 O9=aCo;float rk=aR;']), // rk : le RANG du cube (ils sont tirés dans le désordre) — le fondu les montre un par un
  '  vec3 tr=P9;vec3 nn=N9;vT=vec3(1.);float ph=0.,sc=1.,w9=uNvW;',
  '#ifdef USE_INSTANCING','  ph=dot(instanceMatrix[3].xyz,vec3(.013,.007,.011));{float s9=instanceMatrix[1][3];w9=s9<0.?-s9:1.;}','#endif',
  '  tr+=nn*sin(uTps*.45+Q9.z*31.+ph)*Q9.x*.7;',                                                         // le fantôme RESPIRE (chacun son temps)
  '#ifdef USE_INSTANCING',
  '  vec3 c0=instanceMatrix[0].xyz,c1=instanceMatrix[1].xyz,c2=instanceMatrix[2].xyz,iv=1./vec3(dot(c0,c0),dot(c1,c1),dot(c2,c2));nn=mat3(instanceMatrix)*(nn*iv);tr=(instanceMatrix*vec4(tr,1.)).xyz;sc=length(c0);',
  '#endif',
  '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
  '  vA=C9;vQ=Q9;vQ.y*=clamp((w9*1.06-rk)/.06,0.,1.);vUv=O9;vPh=fract(ph*3.7);vec4 wp=modelMatrix*vec4(tr,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*nn);sc*=length(modelMatrix[0].xyz);',
  '  vec4 mvPosition=viewMatrix*wp;mvPosition.xy+=O9*Q9.x*sc;gl_Position=projectionMatrix*mvPosition;if(vQ.y<=0.)gl_Position=vec4(2.,2.,2.,1.);','#include <fog_vertex>','}'].join('\n');}  // un petit carré face à l objectif : le cube minuscule
function nuFantFS(){return ['#include <common>','#include <fog_pars_fragment>',nuVitGLSL(),'varying vec3 vN,vW,vA,vT;varying vec4 vQ;varying vec2 vUv;varying float vPh;',
  'void main(){vec3 V=normalize(cameraPosition-vW);float fr,lit;vec3 col=n8lum(normalize(vN),V,vA,vT,fr,lit);',
  '  float r=vQ.z;vec3 chaud=mix(vec3(1.08,1.,.9),vec3(1.06,.93,.97),step(.74,r)),froid=mix(vec3(.9,.92,1.05),vec3(.92,.99,1.05),step(.5,r));', // LES TEINTES DU PEINTRE : crème ou rose au soleil, lavande ou bleu ciel à l ombre
  '  col*=mix(vec3(1.),mix(froid,chaud,smoothstep(.12,.62,lit)),uPeint)*1.05;col*=.95+.1*fract(r*7.3);',
  '  vec2 e=abs(vUv);float ed=max(e.x,e.y);col*=(1.-.14*smoothstep(.55,1.,ed))*(1.+.035*(vUv.y-vUv.x));',  // le cube minuscule : un biseau, la lumière d en haut
  '  float sc=n8onde(vA.b,vPh);col+=n8glow()*sc*.2;',
  '  float a=vQ.y*uFant*uFondu*(1.-smoothstep(.88,1.,ed));',
  '#ifdef NUAGE8_INST','  a*=smoothstep(uNearF.x,uNearF.y,length(vW-cameraPosition));','#endif',
  '  if(a<.004)discard;gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n');}
/* (2026-10-24, passe perf 3e tour) LES FANTÔMES CONVERTIS DANS LE TRAVAILLEUR : la toile des cubes fantômes (3 texels demi-précision par cube,
   NUF_TEX) se remplissait sur le fil principal à l'arrivée de chaque nuage — ~8 000 cubes × 12 conversions (toHalfFloat de three) : plusieurs
   nuages arrivés dans la même image la figeaient. nufDemi fait la MÊME conversion (la même formule que THREE.DataUtils.toHalfFloat de r128, bit à
   bit, vérifié sur 6 millions de valeurs) dans l'ouvrier des nuages, qui l'envoie avec le calcul (F.D, pour le décalage F.Dy) ; sans ouvrier, ou
   pour un autre décalage, nuFantGeo la refait ici comme avant. */
function nufDemi(F,dy,W){const n=F.q.length/4,H=Math.ceil(n*3/W),D=new Uint16Array(W*H*4),f=new Float32Array(1),u=new Int32Array(f.buffer);
  const h=function(t){f[0]=t;const e=u[0];let b=e>>16&32768,m=e>>12&2047;const x=e>>23&255;return x<103?b:x>142?(b|=31744,b|=(255==x?0:1)&&8388607&e,b):x<113?(m|=2048,b|=(m>>114-x)+(m>>113-x&1),b):(b|=x-112<<10|m>>1,b+=1&m,b);}; // = THREE.DataUtils.toHalfFloat (r128)
  for(let i=0;i<n;i++){const o=i*12;D[o]=h(F.pos[i*3]);D[o+1]=h(F.pos[i*3+1]+(dy||0));D[o+2]=h(F.pos[i*3+2]);D[o+3]=h(F.q[i*4]);
    D[o+4]=h(F.nor[i*3]);D[o+5]=h(F.nor[i*3+1]);D[o+6]=h(F.nor[i*3+2]);D[o+7]=h(F.q[i*4+1]);D[o+8]=h(F.col[i*3]);D[o+9]=h(F.col[i*3+1]);D[o+10]=h(F.col[i*3+2]);D[o+11]=h(F.q[i*4+2]);}
  return D;}
function nuFantGeo(r,dy,g8){ // les cubes fantômes d'un calcul (r.fant) et le CORPS rentré — g8 : la géométrie v8 de ce calcul (le corps en partage les normales, le modelé, les indices)
  const F=r.fant;if(!F)return null;const n=F.q.length/4,BA=function(a,k){return nuLibre(new THREE.BufferAttribute(a,k));},g=new THREE.BufferGeometry();let tex=null;
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=0;i<n;i++){const x=F.pos[i*3],y=F.pos[i*3+1]+(dy||0),z=F.pos[i*3+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
  if(NUF_TEX){const H=Math.ceil(n*3/NUF_W),D=F.D&&F.Dy===(dy||0)&&F.D.length===NUF_W*H*4?F.D:nufDemi(F,dy,NUF_W);F.D=null; // (converti par l'ouvrier, s'il l'a fait pour CE décalage)
    tex=new THREE.DataTexture(D,NUF_W,H,THREE.RGBAFormat,THREE.HalfFloatType);tex.minFilter=tex.magFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
    tex.onUpdate=function(x){x.image.data=null;}; // (la copie JavaScript jetée une fois envoyée)
    g.setIndex(nufIdx());g.setDrawRange(0,n*6);g.userData.idxPartage=true;}
  else{const P=new Float32Array(n*12),N=new Float32Array(n*12),C=new Float32Array(n*12),Q=new Float32Array(n*16),O=new Float32Array(n*8),RK=new Float32Array(n*4),I=n*4<65535?new Uint16Array(n*6):new Uint32Array(n*6),CO=[-1,-1,1,-1,1,1,-1,1];
    for(let i=0;i<n;i++){for(let c=0;c<4;c++){const v=i*4+c;for(let j=0;j<3;j++){P[v*3+j]=F.pos[i*3+j]+(j===1?(dy||0):0);N[v*3+j]=F.nor[i*3+j];C[v*3+j]=F.col[i*3+j];}for(let j=0;j<4;j++)Q[v*4+j]=F.q[i*4+j];O[v*2]=CO[c*2];O[v*2+1]=CO[c*2+1];RK[v]=i/n;}
      const b=i*4,o=i*6;I[o]=b;I[o+1]=b+1;I[o+2]=b+2;I[o+3]=b;I[o+4]=b+2;I[o+5]=b+3;}
    g.setAttribute('position',BA(P,3));g.setAttribute('normal',BA(N,3));g.setAttribute('color',BA(C,3));g.setAttribute('aQ',BA(Q,4));g.setAttribute('aCo',BA(O,2));g.setAttribute('aR',BA(RK,1));g.setIndex(BA(I,1));}
  const e9=F.k*3;g.boundingSphere=new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+e9); // (posée à la main : sans attribut de position three ne la calcule pas)
  const c=new THREE.BufferGeometry();
  if(g8){const P0=g8.attributes.position.array,N0=g8.attributes.normal.array,PB=new Float32Array(P0.length);for(let i=0;i<PB.length;i++)PB[i]=P0[i]-N0[i]*F.k; // le corps PARTAGE normales, modelé et indices de la surface v8 (déjà à sa place)
    c.setAttribute('position',BA(PB,3));c.setAttribute('normal',g8.attributes.normal);c.setAttribute('color',g8.attributes.color);c.setIndex(g8.index);c.userData.partage=true;}
  else{const PB=new Float32Array(r.pos.length);for(let i=0;i<PB.length;i++)PB[i]=r.pos[i]-r.nor[i]*F.k;c.setAttribute('position',BA(PB,3));c.setAttribute('normal',BA(r.nor,3));c.setAttribute('color',BA(r.col,3));c.setIndex(BA(r.idx,1));if(dy)c.translate(0,dy,0);}
  c.computeBoundingSphere();
  return {fan:g,corps:c,tex:tex,n:n,tri:(n*6+(c.index.count))/3};}
function nufMat(base,G){if(!G.tex)return base;const K=base===nuVitMats(true).fan?'mS':'mI';if(G[K])return G[K]; // la matière d'un gabarit : la même (même programme), avec SA texture
  const m=base.clone();m.uniforms=Object.assign({},base.uniforms,{uFTex:{value:G.tex},uFN:{value:G.n}});m.defines=Object.assign({},base.defines);m.customProgramCacheKey=base.customProgramCacheKey;return (G[K]=m);}
function nufJette(m){ // un nuage seul qui disparaît : sa texture, sa matière ; le tampon d'indices partagé n'est JAMAIS détruit
  const g=m.geometry;if(g&&g.userData.idxPartage)g.setIndex(null);const u=m.material&&m.material.uniforms;if(u&&u.uFTex&&u.uFTex.value){u.uFTex.value.dispose();m.material.dispose();}}
function nuVitMats(solo){ const cle=solo?'s':'i',K='mv'+cle;if(COTON[K])return COTON[K];
  const m8=nuage8Mat(),U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k in N8_U)U[k]=m8.uniforms[k]||N8_U[k];for(const k in NV_U)U[k]=NV_U[k];U.uNvW={value:1}; /* (2026-10-18, fondu) la part de cubes d'un nuage SEUL (posée par objet) */
  const R={};['cub','coe','pea','fan'].forEach(function(n,k){
    const tx=k===3&&NUF_TEX;if(tx)U.uFTex={value:null};
    const m=new THREE.ShaderMaterial({uniforms:U,vertexColors:!tx,fog:true,transparent:k>=2,depthWrite:k<2,vertexShader:k===3?nuFantVS(tx):nuVitVS(k),fragmentShader:k===3?nuFantFS():nuVitFS(k)});
    m.defines=solo?{}:{NUAGE8_INST:''};const ck='nuvit'+n+cle+(tx?'t':'');m.customProgramCacheKey=function(){return ck;};R[n]=m;});
  R.corps=solo?nuage8Solo():nuage8Mat(); // (fantôme) le corps rentré garde la matière v8
  return (COTON[K]=R);}
function nuVitGeo(r,dy){ // les trois maillages d'un calcul (r.vit) — dy : le décalage vertical d'un nuage seul
  const v=r.vit;if(!v)return null;const BA=function(a,n){return new THREE.BufferAttribute(a,n);};
  const c=new THREE.BufferGeometry();c.setAttribute('position',BA(v.cpos,3));c.setAttribute('normal',BA(v.cnor,3));c.setAttribute('aG',BA(v.cg,3));c.setAttribute('color',BA(v.ccol,3));c.setAttribute('aCu',BA(v.ccu,4));c.setIndex(BA(v.cidx,1));
  const P=new Float32Array(r.pos.length),k9=v.hc*(NUVIT.coeur||.6);for(let i=0;i<P.length;i++)P[i]=r.pos[i]-r.nor[i]*k9; // le cœur : la surface v8 rentrée
  const o=new THREE.BufferGeometry();o.setAttribute('position',BA(P,3));o.setAttribute('normal',BA(r.nor,3));o.setAttribute('color',BA(r.col,3));o.setIndex(BA(r.idx,1));
  const s=new THREE.BufferGeometry();s.setAttribute('position',BA(v.spos,3));s.setAttribute('normal',BA(v.snor,3));s.setAttribute('color',BA(v.scol,3));s.setIndex(BA(v.sidx,1));
  for(const g of [c,o,s]){if(dy)g.translate(0,dy,0);g.computeBoundingSphere();}
  return {cub:c,coe:o,pea:s,tri:(v.cidx.length+r.idx.length+v.sidx.length)/3};}
function nuVitPose(k,f,r){const V=COTON.vit&&COTON.vit[k*4+f];if(!V)return;const G=r._nv||(r._nv=nuVitGeo(r,0));if(!G)return; // le vitrail d'un gabarit est arrivé : ses trois maillages (les mêmes géométries pour les deux lots fins)
  V.c.geometry=G.cub;V.o.geometry=G.coe;V.p.geometry=G.pea;V.tri=G.tri;V.ok=true;}
function nuFantPose(k,f,r,g8){const V=COTON.vit&&COTON.vit[k*4+f];if(!V)return;const G=r._nf||(r._nf=nuFantGeo(r,0,g8));if(!G)return;V.g.material=nufMat(V.g.material,G); // les cubes fantômes d'un gabarit : les mêmes pour les deux lots fins
  if(NUVIT.mix&&r.vit){const nl9=Math.floor(G.n*NUVIT.loin);let gf=G.fan;if(f===2){gf=new THREE.BufferGeometry();for(const a in G.fan.attributes)gf.setAttribute(a,G.fan.attributes[a]);gf.setIndex(G.fan.index);gf.setDrawRange(0,nl9*6);gf.boundingSphere=G.fan.boundingSphere;gf.userData.idxPartage=!!G.tex;}
    V.g.geometry=gf;V.gOk=true;V.tri+=(f===2?nl9:G.n)*2;return;} // (mélange) le vitrail garde son cœur : seuls les cubes éparpillés s'ajoutent
  const nl9=Math.floor(G.n*NUVIT.loin);let gf=G.fan;if(f===2){gf=new THREE.BufferGeometry();for(const a in G.fan.attributes)gf.setAttribute(a,G.fan.attributes[a]);gf.setIndex(G.fan.index);gf.setDrawRange(0,nl9*6);gf.boundingSphere=G.fan.boundingSphere;gf.userData.idxPartage=!!G.tex;} // (perf) le lot LOINTAIN : une partie des fantômes (mêmes tampons, même texture)
  V.b.geometry=G.corps;V.g.geometry=gf;V.tri=(G.corps.index.count+(f===2?nl9:G.n)*6)/3;V.ok=true;V.fan=true;}
window.dbgRamNuages=function(){ // (banc, 2026-10-18) la mémoire des NUAGES : octets des tampons et textures envoyés au GPU (uniques) et copies gardées côté JavaScript
  const A=new Set(),T=new Set();let gpu=0,js=0,tg=0,tj=0,nG=0;
  const at=function(x){if(!x||A.has(x))return;A.add(x);const bpe=x.array?x.array.BYTES_PER_ELEMENT:(x.__bpe||4);gpu+=x.count*x.itemSize*bpe;if(x.array)js+=x.array.byteLength;};
  const vu=function(o){o.traverse(function(m){if(!m.geometry)return;nG++;const g=m.geometry;for(const k in g.attributes)at(g.attributes[k]);at(g.index);if(m.isInstancedMesh){at(m.instanceMatrix);at(m.instanceColor);}
    const u=m.material&&m.material.uniforms;if(u)for(const k in u){const v=u[k]&&u[k].value;if(v&&v.isDataTexture&&!T.has(v)){T.add(v);const im=v.image;tg+=im.width*im.height*(v.type===THREE.HalfFloatType?8:16);if(im.data)tj+=im.data.byteLength;}}});};
  if(COTON.root)vu(COTON.root);for(const c of CLOUDS)if(c.g)vu(c.g);
  const Mo=function(x){return +(x/1048576).toFixed(1);};return {gpuMo:Mo(gpu+tg),jsMo:Mo(js+tj),tamponsMo:Mo(gpu),texturesMo:Mo(tg),maillages:nG,nuagesApart:CLOUDS.length};};
window.dbgNuVue=function(k,a,p,h){ // (banc) la même vue, vitrail 0/1 : la caméra posée à h m au-dessus de la caisse, tournée de a (rad) par rapport à son cap, levée de p (rad)
  if(started&&!gameOver&&!paused)togglePause();
  if(typeof a==='string'&&a.indexOf('nuage')===0){const n9=+a.slice(5)||0,L9=[];for(let j=0;j<COTON.n;j++)L9.push(j);L9.sort(function(x,y){return COTON.I[y*COTON_ST+3]-COTON.I[x*COTON_ST+3];}); // (banc) 'nuageN' : le N-ième plus grand nuage, vu à h × son rayon, de l angle p
    const o=L9[Math.min(n9,L9.length-1)]*COTON_ST,r=COTON.I[o+3],S=COTON.S[COTON.I[o+5]],cx=COTON.I[o],cz=COTON.I[o+2],cy=COTON.I[o+1]+S.base*r*COTON.I[o+9]+COTON.I[o+7]*.5,d=(+h||2.5)*r,an=+p||0;
    const x=cx+Math.sin(an)*d,z=cz+Math.cos(an)*d,y=cy+d*.12;dbgNuVue.v={x:x,y:y,z:z,yaw:Math.atan2(cx-x,cz-z),p:Math.atan2(cy-y,Math.hypot(cx-x,cz-z))};}
  else   if(a!=null){const cp=carGroup.position,f=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);f.y=0;f.normalize();dbgNuVue.v={x:cp.x,y:cp.y+(+h||6),z:cp.z,yaw:Math.atan2(f.x,f.z)+(+a),p:+p||0};}
  const v=dbgNuVue.v;if(v){camera.position.set(v.x,v.y,v.z);camera.up.set(0,1,0);camera.lookAt(v.x+Math.sin(v.yaw)*Math.cos(v.p)*100,v.y+Math.sin(v.p)*100,v.z+Math.cos(v.yaw)*Math.cos(v.p)*100);camera.updateMatrixWorld();}
  return dbgNuVit(k,{rendre:1});};
window.dbgNuVit=function(k,o){o=o||{};if(k!=null)NUVIT.on=!!+k;if(o.fondu!=null)NUVIT.fondu=!!+o.fondu; /* (banc) fondu 0 = les bascules d'avant */if(o.dose&&NV_DOSES[o.dose]){NUVIT.dose=o.dose;for(const q in NV_DOSES[o.dose])NV_U[q].value=NV_DOSES[o.dose][q];}for(const n in o)if(NV_U[n])NV_U[n].value=+o[n]; // (banc) A/B sur la même image : 0 = la v8 seule, 1 = en vitrail ; {uLueur, uScan, uCoqA0, uCoqA1, uRel…}
  for(const c of CLOUDS){const m=c.mesh;if(!m||!m.userData.vit)continue;const on=NUVIT.on;m.userData.vitOn=on;for(const o9 of m.userData.vit)o9.visible=on;m.geometry=on?m.userData.gVit:m.userData.g8;m.material=on?m.userData.mVit:nuage8Solo();m.userData.m8=m.material;}
  if(COTON.root)cotonTick(camera);if(paused||o.rendre){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  if(o.banc){const gl=renderer.getContext(),px=new Uint8Array(4),T=[];for(let i=0;i<o.banc;i++){const t0=performance.now();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-t0);}T.sort((a,b)=>a-b);return +T[T.length>>1].toFixed(1);} // (banc) ms d une image synchronisée
  let n=0;if(COTON.vit)for(const V of COTON.vit)if(V&&V.ok)n++;
  if(o.detail&&COTON.vit){const D=[];for(let q=0;q<COTON.vit.length;q++){const V=COTON.vit[q];if(V&&V.ok)D.push([q>>2,q&3,V.c.geometry.index.count/3,V.o.geometry.index.count/3,V.p.geometry.index.count/3,COTON.im[q].userData.tri]);}return D;} // (banc) [gabarit, finesse, écailles, cœur, peau, v8]
  return {on:NUVIT.on,fondu:NUVIT.fondu,lotsPrets:n,tri:COTON.tri,seuls:CLOUDS.filter(function(c){return c.mesh&&c.mesh.userData.vit;}).length,u:Object.keys(NV_U).reduce(function(a,q){a[q]=NV_U[q].value;return a;},{})};};
window.dbgNet=function(on){FLOU_OK=!on;if(on&&acesPass)acesPass.uniforms.uSpeed.value=0;return !FLOU_OK;}; // (dev) une image NETTE pour les bancs (le flou de vitesse coupé)
let FLOU_ON=true;window.dbgFlou=function(o){o=o||{};if(!acesPass)return null;const U=acesPass.uniforms; // (2026-10-14, flou-vitesse) BANC : v = le flou v2/v1 (une recompilation : jamais en course), s = une vitesse d'effet forcée sur l'image figée, fv = [rayon,force,warp,courbe]
  if(o.v!=null&&!!o.v!==FLOU_ON){FLOU_ON=!!o.v;acesPass.material.fragmentShader=flouFS(acesPass.material.fragmentShader,FLOU_ON);acesPass.material.needsUpdate=true;}
  if(o.fv)U.uFv.value.fromArray(o.fv);if(o.s!=null){loop._sfx=+o.s;U.uSpeed.value=+o.s;postCaisse(U);}
  if(o.s!=null&&paused&&POST_ON&&composer)composer.render();return {v:FLOU_ON,s:+U.uSpeed.value.toFixed(3),fv:U.uFv.value.toArray()};};
window.dbgCotonV2=function(o){if(o&&N8_U.uVapK)for(const k of ['x','y','z','w'])if(o[k]!=null)N8_U.uVapK.value[k]=o[k];return {vap:N8_VAP,palier:PAL.n,k:N8_U.uVapK?N8_U.uVapK.value.toArray():null,tex:!!(N8_U.uVap&&N8_U.uVap.value)};}; // (banc, coton-blanc) doses de la vapeur à chaud : x érosion · y grain · z or · w tout
function cotonInit(){ if(COTON.root)return; // une fois par session : 24 gabarits × 4 finesses, en instances
  COTON.t0=performance.now();COTON.pret=new Uint8Array(COTON_KINDS*4);
  const rg=mulberry32(0xC07070),SPH=COTON.SEG.map(function(s){return new THREE.SphereGeometry(1,s[0],s[1]);}),m=nuage8Mat();
  COTON.root=new THREE.Group();COTON.root.name='coton';COTON.root.visible=false;scene.add(COTON.root);COTON.L=[];
  COTON.vit=[];const MV=nuVitMats(false); // (2026-10-18) LE VITRAIL : trois maillages de plus par lot fin (finesses 2 et 3), mêmes instances
  COTON.W=new Float32Array(COTON.cap);COTON.WC=new Float32Array(COTON.cap);COTON.LV=MV?Array.from({length:COTON_KINDS*2},function(){return {i:new Int32Array(COTON.cap),d:new Float32Array(COTON.cap),n:0};}):null; // (2026-10-18, LE FONDU) les parts (corps, cubes) de chaque nuage, et, par jeu de cubes (gabarit × lot 2|3), ceux qui en ont une
  const rgC=mulberry32(0xC0F1E5); // (v7) le hasard du chou-fleur, à part
  for(let k=0;k<COTON_KINDS;k++){let S;{S=cumulus8(k===24?'cumulonimbus':k<6?N8_GENRE6[k]:(N8_GENRE_V[COTON_GENRES[k-6]]||COTON_GENRES[k-6]),rg);S.fin=1;}COTON.S.push(S);
    const g0=NUVIT.vox?nuVide():cotonGeo(({B:S.B.slice(0,12),base:S.base,top:S.top}),SPH[0]);COTON.pret[k*4]=1; /* (2026-10-21, Léo : « enlève tous les ronds qui n'ont plus rien à voir avec les nouveaux nuages ») plus de BOULES provisoires : un nuage n'existe à l'image que fini */ /* (v8) l'ébauche sur les 12 premiers lobes (base et dôme) : 70 lobes coûtaient 160 ms au lancement */ // (2026-09-30) la finesse la plus LÉGÈRE tout de suite (7 % du calcul) : elle tient la place des trois autres, qui arrivent de l'ouvrier
    for(let f9=0;f9<4;f9++){const im=new THREE.InstancedMesh(g0,m,COTON.cap);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled=false;im.count=0;im.castShadow=im.receiveShadow=false;im.matrixAutoUpdate=false;im.userData.tri=im.geometry.index.count/3;
      im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*3).fill(1),3);im.instanceColor.setUsage(THREE.DynamicDrawUsage); // (v6) la teinte par nuage — sur TOUS les lots dès la création : un seul programme
      COTON.root.add(im);COTON.im.push(im);COTON.L.push({i:new Int32Array(COTON.cap),d:new Float32Array(COTON.cap),n:0});
      if(MV&&f9>=2){const V={g0:g0,ok:false,tri:0,A:new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*16),16),C:new THREE.InstancedBufferAttribute(new Float32Array(COTON.cap*3).fill(1),3)};V.A.setUsage(THREE.DynamicDrawUsage);V.C.setUsage(THREE.DynamicDrawUsage);
        for(const q9 of [['c',MV.cub],['o',MV.coe],['p',MV.pea],['b',MV.corps],['g',MV.fan]]){const x=new THREE.InstancedMesh(g0,q9[1],COTON.cap);x.instanceMatrix=V.A;x.instanceColor=V.C; // les trois maillages partagent LEURS instances (les nuages trop proches restent dans le lot v8)
        x.frustumCulled=false;x.count=0;x.visible=false;x.castShadow=x.receiveShadow=false;x.matrixAutoUpdate=false;COTON.root.add(x);V[q9[0]]=x;}COTON.vit[k*4+f9]=V;}}}
  {for(let k=0;k<COTON_KINDS;k++)COTON.S[k].seed=k*7+1;COTON.pret.fill(0); // (v8) les QUATRE finesses de la surface arrivent de l'ouvrier ; l'ébauche en sphères tient la place
    for(let f=0;f<4;f++)for(let k=0;k<COTON_KINDS;k++)nuage8Async(COTON.S[k],N8_FIN[f],function(r){const g9=cotonBuf(r);cotonFinesse(k,f,g9);if(r.skin)nuSkinPose(k,f,r.skin);if(r.vit){nuVitPose(k,2,r);nuVitPose(k,3,r);}if(r.fant){nuFantPose(k,2,r,g9);nuFantPose(k,3,r,g9);}},f===2?NUVIT.nc:0);} // (vitrail) calculé UNE fois par gabarit (avec la finesse 2 : le cœur n'est vu que dans les joints), les deux lots fins le partagent // les plus légères d'abord : le ciel s'affine en quelques instants, sans jamais geler
  for(const s of SPH)s.dispose();COTON.I=new Float32Array(COTON.cap*COTON_ST);COTON.msInit=performance.now()-COTON.t0;
}
function cotonGrille(){ // la piste en cases de 120 m : un point tous les ~18 m (la garde ne teste que les cases voisines)
  const st=Math.max(1,Math.round(18/Math.max(.5,L/Math.max(1,NP-1)))),g=new Map();
  for(let i=0;i<NP;i+=st){const p=pts[i],k=Math.floor(p.x/120)+','+Math.floor(p.z/120);let a=g.get(k);if(!a)g.set(k,a=[]);a.push(i);}
  return g;}
function cotonTouche(x,y,z,r,ry){ // ce nuage (ellipsoïde r × ry autour de x,y,z) mord-il sur la route ? — même mesure que nuageTouche
  const g=COTON.grid;if(!g)return false;const rh=r+ROAD_HALF+18+(COTON.corrH||0),rv=ry+22+(COTON.corrV||0),ih=1/(rh*rh),iv=1/(rv*rv),n=Math.ceil(rh/120),cx=Math.floor(x/120),cz=Math.floor(z/120);
  for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const L9=g.get((cx+a)+','+(cz+b));if(!L9)continue;
    for(let j=0;j<L9.length;j++){const p=pts[L9[j]],dx=p.x-x,dz=p.z-z,dy=p.y-y;if((dx*dx+dz*dz)*ih+dy*dy*iv<1)return true;}}
  return false;}
function cotonPose(x,yB,z,r,k,cr,syF){ // un nuage dont le DESSOUS est à yB — refusé s'il toucherait le ruban · syF : étirement vertical imposé (les colonnes des cathédrales)
  if(COTON.n>=COTON.cap)return false;const S=COTON.S[k];
  const gn=cotonGenre(k),sx=.86+cr()*.44,sy0=(gn==='fractus'||gn==='altocumulus'||gn==='stratocumulus')?.75+cr()*.25:.85+cr()*.3,sy=syF||sy0,h=(S.top-S.base)*r*sy; // (v4) chaque nuage a SON étirement : deux nuages du même gabarit ne se ressemblent plus
  if(cotonTouche(x,yB+h*.5,z,r*1.02*sx,h*.5+r*.05))return false;
  const o=COTON.n*COTON_ST,I=COTON.I;I[o]=x;I[o+1]=yB-S.base*r*sy;I[o+2]=z;I[o+3]=r;I[o+4]=cr()*6.2832;I[o+5]=k;I[o+6]=cr()*6.28;I[o+7]=h;I[o+8]=sx;I[o+9]=sy;
  {const l9=.82+cr()*.22,w9=(cr()-.5)*2,lourd=cr()<.12;{const g9=(.88+(l9-.82)*.727)*(lourd?.94:1);I[o+10]=I[o+11]=I[o+12]=g9;}} /* (coton-blanc) un BLANC neutre .83-1,04 (vu à 30 % par le shader : ±3 % de luminance, 0 % de teinte) — mêmes trois tirages `cr` */ // (v6) SA TEINTE : clair/sourd, chaud/froid, parfois lourd (la moitié passe la lumière de peintre)
  COTON.n++;return true;}
function cotonVide(){COTON.n=0;if(COTON.root){COTON.root.visible=false;for(const im of COTON.im)im.count=0;}try{nuEmbVide();}catch(e9){}} /* (2026-10-21, embellissement) les poussières de lumière et les oiseaux s'en vont avec les nuages : voir nuages-embellie.js */
// classique · bas · tour · flocon · banc · double | (v4) humilis ×2 · mediocris ×2 · congestus ×2 · castellanus · fractus
const COTON_POIDS=(function(){ // (v6) près · milieu · loin — les classiques pèsent moins (on les revoyait à chaque partie), chaque genre a sa distance
  const C={pres:[2,1,.3,2,.8,1.2],mil:[1.4,1,1,1,1,1.4],loin:[1,1.2,2,.4,1.2,1]},W={humilis:[2.2,1,.8],mediocris:[1.6,1.4,1.2],congestus:[.3,1.3,2.2],castellanus:[.8,1.2,1],fractus:[1.6,.6,.2],
    stratocumulus:[.8,1.3,1.6],altocumulus:[1.2,1.4,.6],cisaille:[.3,1,1.4],champignon:[.1,.6,1.6],
    arche:[.35,1,1.5],meduse:[.5,1.3,.9],anneau:[.35,1,1.3],spirale:[.25,.9,1.6],gateau:[.4,1.1,1.3],vague:[.3,1,1.5]},o={pres:[],mil:[],loin:[]};
  ['pres','mil','loin'].forEach(function(q,j){for(let k=0;k<6;k++)o[q].push(C[q][k]*.55);for(const g of COTON_GENRES)o[q].push(W[g][j]);});return o;})();
function cotonKind(cr,w){let s=0;for(const x of w)s+=x;let u=cr()*s;for(let k=0;k<w.length;k++){u-=w[k];if(u<=0)return k;}return 0;}
function cotonJade(cr){ // (2026-10-14, passe graphismes) le coton des PICS DE JADE — tiré sur `cr` (le flux des nuages : la piste et la vallée ne bougent pas)
  const J=COTON_JADE,km=L/1000,perp=function(i){const t=T[i],l=Math.hypot(t.x,t.z)||1;return [-t.z/l,t.x/l];};
  let yMin=1e9;for(let i=0;i<NP;i+=4)if(pts[i].y<yMin)yMin=pts[i].y;const sol=yMin-45+24; // l'eau est à yMin-45 (JADE.eauY, bâtie après) : aucun dessous de nuage dans le fleuve
  for(let pa=0;pa<3;pa++){const KS=J.K[pa?1:0],plats=KS.slice(0,2),N=Math.max(2,Math.round(J.n[pa]*km));
    for(let k=0;k<N;k++){const i=Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/N)*NP)),p=pts[i],q=perp(i),t9=T[i],sg=cr()<.5?-1:1,u=cr(),al=(cr()-.5)*420,x0=p.x+t9.x*al,z0=p.z+t9.z*al;
      if(u<.36){ // (a) LES BANCS ENTRE LES PICS : des cumulus plats, au niveau de la brume (du fleuve à la route), à 250-900 m du ruban
        const r=cotonR(cr,80,200,1.3),kk=cr()<.7?plats[cr()*2|0]:KS[cr()*KS.length|0],yB=Math.max(sol,p.y-150+cr()*170),sy=.68+cr()*.24;let d=ROAD_HALF+r+230+cr()*600;
        for(let t=0;t<3;t++,d+=150)if(cotonPose(x0+q[0]*sg*d,yB,z0+q[1]*sg*d,r,kk,cr,sy))break;}
      else if(u<.72){ // (b) LES MASSES DERRIÈRE LES PICS : 1-2,3 km, de grands cumulus dont la base trempe dans la brume
        const r=cotonR(cr,240,520,1.4),kk=KS[cr()*KS.length|0],d=1000+cr()*1300;cotonPose(x0+q[0]*sg*d,Math.max(sol,p.y-170+cr()*480),z0+q[1]*sg*d,r,kk,cr);}
      else{ // (c) CEUX D'EN HAUT, au-dessus des cimes, qui se découpent sur le ciel du rouleau — jamais au-dessus du ruban (≥ 450 m de côté) ; vus à l'image : sans eux le ciel restait vide, les pics cachent les bancs
        const r=cotonR(cr,160,380,1.4),d=450+cr()*1500;cotonPose(x0+q[0]*sg*d,p.y+330+cr()*500,z0+q[1]*sg*d,r,cr()<.6?plats[cr()*2|0]:KS[cr()*KS.length|0],cr,.7+cr()*.25);}}
    J.lim[pa]=COTON.n;}
  {const c=LVL.cur,t=c.nuit?([.14,.17,.19]):(c.orage?([.62,.66,.70]):null); // de NUIT, la ouate prenait la lune en plein (vue à l'image : lavande claire devant des pics noirs) — sa teinte par nuage la rentre dans l'ombre ; sous l'ORAGE, un peu
    if(t)for(let j=0;j<COTON.n;j++){const o=j*COTON_ST;COTON.I[o+10]*=t[0];COTON.I[o+11]*=t[1];COTON.I[o+12]*=t[2];}}
  COTON.jd=J;COTON.root.visible=COTON.n>0;}
/* ============================== LE PLAN D'AVION (2026-10-21, Léo : « tu te perds un peu, fais un point de vue avion vu de haut ; l'impression que tu n'arrives pas à bien
   ranger tout ça : la voiture se retrouve parfois dans un truc avec que des nuages, c'est trop chaotique ») ==============================
   Mesuré au plan (`dbgPlanNuages`, vue de dessus) sur la mer de nuages du matin : 56 nuages de toutes tailles semés au hasard par six couronnes superposées, la route
   à moins d'un demi-rayon d'un nuage 25 % du temps et dedans 2,4 %. Désormais, aux NUAGES (toutes les météos), un PLAN :
     · UN COULOIR LIBRE autour du ruban (NU_ORD : 95 m de côté, 55 m de haut en plus de la garde d'avant) — plus de nuage de décor sur la route ;
     · QUATRE RANGÉES, de chaque côté en alternance, au pas régulier le long de la piste (un peu de jeu) : PROCHE (r 55-90, ~230 m du bord, une île tous les 2,3 km),
       MILIEU (r 130-210, 480-640 m, tous les 1,9 km), LOINTAINE (r 260-420, 1,1-1,5 km, tous les 1,7 km), HAUTE (r 120-210, 700-1 100 m de côté, 240-300 m au-dessus,
       tous les 2,8 km) ; chaque rangée a SON plafond (le dessous des nuages suit la route : -100 · -190 · -280 m) et sa taille : plus on est loin, plus c'est gros ;
     · les cathédrales, massifs, titans et le colosse (ancres de fond) sont gardés. L'orage garde son plafond, perd ses murs au ras de la route.
   `?ordre=0` = le semis d'avant. */
const NU_ORD={corrH:95,corrV:55};
function cotonOrdonne(cr,perp){
  const R=[ // [pas (m), rayon min, rayon max, côté min, côté max, plafond (dessous du nuage par rapport à la route), poids]
    {pas:2300,r:[60,95],d:[210,300],y:-100,w:COTON_POIDS.pres},
    {pas:1900,r:[130,210],d:[480,640],y:-190,w:COTON_POIDS.mil},
    {pas:1700,r:[260,420],d:[1100,1500],y:-280,w:COTON_POIDS.loin},
    {pas:2800,r:[120,210],d:[700,1100],y:260,w:COTON_POIDS.mil}];
  const libre=function(x,y,z,r){ // jamais deux nuages qui se chevauchent à la même altitude (sinon : un tas, pas un plan)
    const I=COTON.I;for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,dx=I[o]-x,dz=I[o+2]-z,rr=(I[o+3]*I[o+8]+r)*.8;if(dx*dx+dz*dz<rr*rr&&Math.abs(I[o+1]+I[o+7]*.5-y)<(I[o+7]*.5+r*.5)+60)return false;}return true;};
  R.forEach(function(t){const K=Math.max(2,Math.round(L/t.pas)),ph=cr()<.5?0:1;
    for(let k=0;k<K;k++){const i=Math.max(0,Math.min(NP-1,Math.round(((k+.5+(cr()-.5)*.5)/K)*(NP-1)))),p=pts[i],q=perp(i),sg=((k+ph)&1)?1:-1,
      r=t.r[0]+(t.r[1]-t.r[0])*cr(),kk=cotonKind(cr,t.w);let d=t.d[0]+(t.d[1]-t.d[0])*cr();
      for(let e=0;e<3;e++,d*=1.25){const x=p.x+q[0]*sg*d,y=p.y+t.y+(cr()-.5)*40,z=p.z+q[1]*sg*d;if(libre(x,y+r*.35,z,r)&&cotonPose(x,y,z,r,kk,cr))break;}}});}
function buildCoton(cr){
  cotonInit();cotonVide();COTON.jd=null;COTON.corrH=0;COTON.corrV=0;if(!(NP>1)||!pts.length)return;COTON.grid=cotonGrille();
  if(LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&!LVL.cur.sansNuages){cotonJade(cr);return;} // (2026-10-14, passe graphismes) LES PICS DE JADE : le ciel de coton, à leur mesure
  const okD=lvlNuageOk({deco:true}),okG=lvlNuageOk({giant:true});if(!okD&&!okG)return;
  const ORD=!!(ARC_ON&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!/[?&]ordre=0\b/.test(location.search));if(ORD){COTON.corrH=NU_ORD.corrH;COTON.corrV=NU_ORD.corrV;} // (2026-10-21) LE PLAN D'AVION : voir cotonOrdonne
  const strat=function(k,K){return Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/K)*NP));};
  const perp=function(i){const t=T[i],l=Math.hypot(t.x,t.z)||1;return [-t.z/l,t.x/l];}; // le travers HORIZONTAL du ruban (jamais B[i] : piste inclinée)
  if(okD){
    const OR=LVL.cur&&LVL.cur.id==='orage',A9=ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?CDENS:1,M9=OR?1.6:1,KK=function(n){return Math.max(1,Math.round(n*M9*A9*(LVL.cur&&LVL.cur.id==='nuages'?.5:1)));}; // (2026-09-30) ×0,5 aux NUAGES (NZ, plus bas)
    /* (2026-09-30, Sacha : « retravaille les nuages dans le premier niveau, il en faut des plus gros ») GZ : aux NUAGES, les couronnes proche, du
       milieu, haute et lointaine grossissent de ~45 % (bornes de la loi de puissance ×1,45) — même nombre de nuages, mais des MASSES qui
       remplissent le cadre ; la garde de la route rejette toujours ceux qui la toucheraient (on en perd un peu : c'est voulu). */
    /* (2026-09-30, 2e passe, Sacha : « moins de nuages dans le premier niveau, mais il faut qu'ils soient plus gros ») : aux NUAGES, DEUX fois moins
       de nuages dans chaque couronne (NZ) et des tailles ×1,9 (GZ, 1,45 à la 1re passe) — de grandes masses, et du ciel entre elles. */
    const GZ=LVL.cur&&LVL.cur.id==='nuages'?1.9:1,NZ=(LVL.cur&&LVL.cur.id==='nuages'?.5:1)*A9; // (2026-09-29) L'ORAGE : plus de nuages partout — (2026-09-30, « au point que ça gêne la visibilité ») ×1,25 → ×1,6
    for(let k=0;k<(ORD?0:KK(30));k++){ // (1) LA COURONNE PROCHE, EN ARCHIPELS (Dragons) : des îlots de 2-3 nuages (un grand, ses satellites au même plafond),
      // et du CIEL OUVERT entre deux — 80 nuages semés un par un encombraient tout le champ (« liberté » = des vides qu'on traverse)
      const i=strat(k,KK(30)),p=pts[i],q=perp(i),sg=cr()<.5?-1:1,r=cotonR(cr,30*GZ,160*GZ,1.5),kk=cotonKind(cr,COTON_POIDS.pres),yB=p.y-130+cr()*300; // (v4) tailles en loi de puissance
      let d=ROAD_HALF+r+50+cr()*300,cx=0,cz=0,ok=false;for(let t=0;t<3;t++,d+=110){cx=p.x+q[0]*sg*d;cz=p.z+q[1]*sg*d;if(cotonPose(cx,yB,cz,r,kk,cr)){ok=true;break;}}
      if(ok){const ns=A9<1?(cr()*2|0):1+(cr()*2|0),t9=T[i];for(let m=0;m<ns;m++){const a=(m?-1:1)*(1.5+cr()*1.1)*r,rs=r*(.4+cr()*.3); // les satellites, le long de la route et un peu en travers
        cotonPose(cx+t9.x*a+q[0]*sg*(cr()-.3)*r,yB+(cr()-.5)*r*.3,cz+t9.z*a+q[1]*sg*(cr()-.3)*r,rs,cotonKind(cr,COTON_POIDS.pres),cr);}}}
    for(let k=0;k<(ORD?0:KK(26));k++){ // (2) AU-DESSUS et EN DESSOUS du ruban (la garde garde 18-22 m de ciel libre autour de la route)
      const i=strat(k,KK(26)),p=pts[i],q=perp(i),r=cotonR(cr,24*GZ,130*GZ,1.5),kk=cotonKind(cr,COTON_POIDS.pres),S=COTON.S[kk],h=(S.top-S.base)*r*1.3,lat=(cr()-.5)*120;
      const yB=cr()<.6?p.y+70+cr()*190:p.y-(THICK+60+cr()*170)-h;cotonPose(p.x+q[0]*lat,yB,p.z+q[1]*lat,r,kk,cr);}
    for(let k=0;k<(ORD?0:KK(116));k++){ // (3) LA COURONNE DU MILIEU : 0,35-1,3 km, tout autour, de la mer jusqu'à ~300 m au-dessus de la route
      const i=strat(k,KK(116)),p=pts[i],a=cr()*6.2832,d=(350+cr()*950)*(GZ>1?1.12:1),r=cotonR(cr,50*GZ,330*GZ,1.6);
      cotonPose(p.x+Math.cos(a)*d,p.y-210+cr()*520,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
    for(let k=0,K4=ORD?0:Math.round(44*NZ);k<K4;k++){ // (4) LA COUCHE HAUTE : des cumulus qui se DÉCOUPENT sur le ciel (le haut d'un écran portrait, c'est du ciel)
      const i=strat(k,K4),p=pts[i],a=cr()*6.2832,d=260+cr()*1700,r=cotonR(cr,60*GZ,300*GZ,1.5);
      cotonPose(p.x+Math.cos(a)*d,p.y+230+cr()*420,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
    if(OR&&!ORD)for(let k=0;k<30;k++){ // (2026-09-30) LES MURS : au RAS de la route (la garde lui laisse ses 18-22 m), de chaque côté, à hauteur de caisse — la route file dans un
      // couloir de ouate : on ne voit plus d'où vient le virage, seulement la route devant soi, et l'éclair qui éclaire le couloir
      const i=strat(k,30),p=pts[i],q=perp(i),sg=cr()<.5?-1:1,r=cotonR(cr,40,120,1.3),kk=cotonKind(cr,COTON_POIDS.pres);let dd=ROAD_HALF+r*.8+20+cr()*40;
      for(let t=0;t<3;t++,dd+=40)if(cotonPose(p.x+q[0]*sg*dd,p.y-r*.45+cr()*30,p.z+q[1]*sg*dd,r,kk,cr))break;}
    if(OR)for(let k=0;k<42;k++){ // (4 bis) L'ORAGE : LE PLAFOND — de grands nuages plats et bas (rouleaux, humilis) 110-240 m au-dessus de la route, sur elle et
      // autour : le ciel se referme (des trouées entre deux), la lumière passe par en dessous — et l'éclair les allume
      const i=strat(k,42),p=pts[i],q=perp(i),lat=(cr()-.5)*900,r=cotonR(cr,110,230,1.2); // (2026-09-30) 26 → 42, et plus BAS (70-170 m) : le ciel se ferme
      cotonPose(p.x+q[0]*lat,p.y+70+cr()*100,p.z+q[1]*lat,r,cotonDe(cr,['stratocumulus','stratocumulus','humilis',1,4]),cr,.8+cr()*.25);}
    for(let k=0,K5=ORD?0:Math.round(80*NZ);k<K5;k++){ // (5) LE LOINTAIN : 1,2-2,6 km — l'horizon a ses nuages
      const i=strat(k,K5),p=pts[i],a=cr()*6.2832,d=1200+cr()*1400,r=cotonR(cr,120*GZ,560*GZ,1.4);
      cotonPose(p.x+Math.cos(a)*d,p.y-260+cr()*700,p.z+Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.loin),cr);}
    if(ORD)cotonOrdonne(cr,perp);
    if(TORD.on)for(let k=0,K6=Math.max(1,Math.round(56*A9));k<K6;k++){ // (2026-10-15) LA SPHÈRE : sur la route SANS HAUT NI BAS, des nuages dans TOUTES les directions — sous la dalle comme au zénith,
      // tirés uniformément sur la sphère autour de la route (plus de plafond ni de plancher : où que la route regarde, du ciel et de la ouate)
      const i=strat(k,K6),p=pts[i],u=cr()*2-1,a=cr()*6.2832,w=Math.sqrt(1-u*u),d=420+cr()*1500,r=cotonR(cr,70*GZ,320*GZ,1.5);
      cotonPose(p.x+w*Math.cos(a)*d,p.y+u*d,p.z+w*Math.sin(a)*d,r,cotonKind(cr,COTON_POIDS.mil),cr);}
  }
  if(okG){ // (7) LES CATHÉDRALES (2026-09-29, Sacha : « encore plus beau et artistique, qu'on ressente la LIBERTÉ comme dans Dragons 1 ») :
    // de GRANDS CONGESTUS qui montent de l'abîme (base 220-340 m sous la route) et dominent la route de ~150-250 m, à 300-650 m de son
    // bord — une PORTE (les deux côtés : on file entre deux géants) ou une FALAISE (un seul côté : on longe un mur de ouate). Toutes les
    // ~1,4 km. ⚠ Essayé puis retiré : étirer la tour en hauteur (×1,5) et lui poser une COURONNE — les bourgeons devenaient des œufs
    // empilés, une « chenille » ; la hauteur vient de la TAILLE (r 220-340), l'étirement reste celui des autres nuages (×1-1,15).
    const K7=Math.max(ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?2:3,Math.floor(L/(LVL.cur&&LVL.cur.id==='nuages'?2000:1400)*(ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?GROS:1))); // (2026-09-30) aux NUAGES : moins de cathédrales, plus grosses
    for(let k=0;k<K7;k++){const i=strat(k,K7),p=pts[i],q=perp(i),cotes=cr()<.45?[-1,1]:[cr()<.5?-1:1];
      for(const sg of cotes){const r=(220+cr()*120)*(LVL.cur&&LVL.cur.id==='nuages'?1.45:1),kk=cotonDe(cr,['congestus','cisaille','champignon',2]),yB=p.y-(220+cr()*120);let dd=ROAD_HALF+r*1.25+60+cr()*230;
        for(let t=0;t<3;t++,dd+=90)if(cotonPose(p.x+q[0]*sg*dd,yB,p.z+q[1]*sg*dd,r,kk,cr,1+cr()*.15))break;}}
  }
  if(okG){ // (6) MASSIFS et TITANS (ex-« ciel organisé ») : des tours de 300-1 200 m, au large, hors du couloir du couchant
    const sunAz=Math.atan2(SUN_DIR.z,SUN_DIR.x),loinSol=function(){for(let t=0;t<5;t++){const a=cr()*6.2832;let d9=(a-sunAz)%6.2832;if(d9>3.1416)d9-=6.2832;if(d9<-3.1416)d9+=6.2832;if(Math.abs(d9)>.62)return a;}return sunAz+3.1416;};
    const GN=ARC_ON&&LVL.cur&&LVL.cur.id==='nuages'?GROS:1,N6=Math.max(1,Math.round(6*GN)),N3=Math.max(1,Math.round(3*GN));
    for(let k=0;k<N6;k++){const i=strat(k,N6),p=pts[i],a=loinSol(),d=900+cr()*1300,r=280+cr()*300;cotonPose(p.x+Math.cos(a)*d,p.y-320+cr()*160,p.z+Math.sin(a)*d,r,cotonDe(cr,[2,0,'congestus','champignon','stratocumulus']),cr);} // (v4) les massifs piochent aussi dans les congestus tirés — (v6) et les champignons, les rouleaux
    for(let k=0;k<N3;k++){const i=strat(k,N3),p=pts[i],a=loinSol(),d=1700+cr()*1500,r=600+cr()*450,k9=cotonDe(cr,[2,'congestus','champignon']);cotonPose(p.x+Math.cos(a)*d,p.y-420+cr()*200,p.z+Math.sin(a)*d,(r*.7),24,cr);} // (v8) les titans : des CUMULONIMBUS à enclume (plus hauts que larges : r ×0,7)
    for(let k=0;k<N3;k++){const i=strat(k,N3),p=pts[i],a=loinSol(),d=520+cr()*380,r=(200+cr()*140)*(LVL.cur&&LVL.cur.id==='nuages'?1.5:1); // (v4) les TOURS HÉROÏQUES : trois congestus qui montent TOUT PRÈS du couloir — le niveau a ses montagnes
      for(let t=0;t<3;t++)if(cotonPose(p.x+Math.cos(a)*(d+t*160),p.y-300+cr()*80,p.z+Math.sin(a)*(d+t*160),r,cotonDe(cr,['congestus','cisaille']),cr))break;}
    {const i=Math.min(NP-1,Math.floor(NP*(.6+cr()*.15))),p=pts[i],a=sunAz+3.1416+(cr()-.5)*.9,d=1500+cr()*700;cotonPose(p.x+Math.cos(a)*d,p.y-380,p.z+Math.sin(a)*d,(760+cr()*300)*(.75),24,cr);} // LE COLOSSE, à l'opposé du couchant
  }
  COTON.root.visible=COTON.n>0;
  try{nuEmbBati();}catch(e9){window.__nuEmbErr=e9;} /* (2026-10-21, embellissement) du vivant dans le ciel : poussières de lumière, oiseaux lointains, éclats rose et or (nuages-embellie.js ; hasard local, la piste ne bouge pas) */
}
const COTON_T0=performance.now();
function cotonInst(o,A,C,b,tt){const I=COTON.I,r=I[o+3];C[b*3]=I[o+10];C[b*3+1]=I[o+11];C[b*3+2]=I[o+12]; // une instance de nuage : sa teinte, la dérive au vent, son cap
  COTON.P.set(I[o]+Math.sin(tt*.05+I[o+6])*6,I[o+1],I[o+2]+Math.cos(tt*.04+I[o+6])*6);COTON.Q.setFromAxisAngle(COTON.Y,I[o+4]);COTON.Sc.set(r*I[o+8],r*I[o+9],r); // (v4) l'étirement du nuage
  COTON.M.compose(COTON.P,COTON.Q,COTON.Sc);COTON.M.toArray(A,b*16);}
function cotonTick(cam){ // à chaque rendu de la scène : ce qui est dans le champ, en quelle finesse, du plus loin au plus près
  if(!COTON.root||!COTON.root.visible)return;
  const t00=performance.now(),I=COTON.I,Ls=COTON.L,J=COTON.jd,pj=J?cotonPalier():2,fm=J?J.f[pj]:3,n=J?Math.min(COTON.n,J.lim[pj]):COTON.n,tt=(t00-COTON_T0)*.001; /* (2026-10-14, passe graphismes) J : les Pics de Jade — les `lim[palier]` premiers nuages, jusqu'à la finesse `fm` */N8_U.uTps.value=tt;for(let j=0;j<Ls.length;j++)Ls[j].n=0;
  COTON.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);COTON.fr.setFromProjectionMatrix(COTON.pv);
  const pl=COTON.fr.planes,cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;
  const LV=(NUVIT.on&&!J&&COTON.LV)?COTON.LV:null,W9=COTON.W,WC9=COTON.WC;if(LV)for(const Lv of LV)Lv.n=0; // (2026-10-18, LE FONDU) pas aux Pics de Jade
  const fF=((J||(LVL.cur&&LVL.cur.id==='orage'))&&scene.fog)?scene.fog.far*1.02:1e9; // (2026-09-29) L'ORAGE : sa brume est à ~1 km — un nuage ENTIÈREMENT au-delà est de la brume pure : pas envoyé (mesuré : 407k triangles → voir CLAUDE.md) ; l'éclair qui ouvre la brume les fait revenir
  for(let j=0;j<n;j++){const o=j*COTON_ST,r=I[o+3],h=I[o+7],ph=I[o+6],k=I[o+5],S=COTON.S[k];
    const x=I[o]+Math.sin(tt*.05+ph)*6,z=I[o+2]+Math.cos(tt*.04+ph)*6,yc=I[o+1]+S.base*r*I[o+9]+h*.5,R=Math.max(r*1.08*I[o+8],h*.56); // la ouate DÉRIVE au vent
    let vis=true;for(let q=0;q<6;q++){const P9=pl[q];if(P9.normal.x*x+P9.normal.y*yc+P9.normal.z*z+P9.constant<-R){vis=false;break;}}
    if(!vis)continue;
    const dx=x-cx,dy=yc-cy,dz=z-cz,d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d-R>fF)continue;const sg=COTON.FAC*R*(S.fin||1)/Math.max(1,d-R*.5); // les segments qu'il faut pour que la facette ne se voie pas — (v4) à la taille de SES bourgeons
    const fq=Math.min(fm,(sg<=10?0:sg<=16?1:sg<=32?2:3)),Lq=Ls[k*4+fq]; /* (v8) la surface : ~10 px par cellule à l'écran */
    let w=0,wc=0,vq=3;if(LV){const V9=COTON.vit[k*4+3];if(V9&&V9.ok){const x=Math.max(1,d-R)/R,c=2/((NUVIT.fant?NUVIT.fsz:NUVIT.nc)*x); /* (2026-10-18, Sacha) LE FONDU : les parts du corps (w) et des cubes (wc) ; avant, des bascules (lot 2 : 40 % des fantômes, lot 3 : tous, tout près : la v8) */
      if(NUVIT.fondu){const P9=nuvPoids(x,c);w=P9[0];wc=P9[1];vq=(NUVIT.fant&&wc*1.06<=NUVIT.loin)?2:3;}else if(fq>=2&&c<=NUVIT.ang){w=wc=1;vq=fq;}}} // le lot lointain (40 % des fantômes) suffit tant que les cubes n'en demandent pas plus
    W9[j]=w;WC9[j]=wc;if(w<1){Lq.i[Lq.n]=j;Lq.d[Lq.n]=d;Lq.n++;}if(w>0){const Lv=LV[k*2+vq-2];Lv.i[Lv.n]=j;Lv.d[Lv.n]=d;Lv.n++;}}
  let nN=0,nF=0,tri=0;
  for(let q=0;q<Ls.length;q++){const Lq=Ls[q],im=COTON.im[q],A=im.instanceMatrix.array,ii=Lq.i,dd=Lq.d,m=Lq.n;
    for(let a=1;a<m;a++){const vi=ii[a],vd=dd[a];let b=a-1;while(b>=0&&dd[b]<vd){ii[b+1]=ii[b];dd[b+1]=dd[b];b--;}ii[b+1]=vi;dd[b+1]=vd;} // du plus LOIN au plus près
    const Cq=im.instanceColor.array;let mA=0;
    for(let a=0;a<m;a++){const j9=ii[a];cotonInst(j9*COTON_ST,A,Cq,mA,tt);A[mA*16+3]=W9[j9];mA++;} // (2026-10-18, LE FONDU) la part de cubes dans la ligne du bas de la matrice : la v8 leur cède autant de points de sa trame
    im.count=mA;im.visible=mA>0;if(mA){im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=mA*16;im.instanceMatrix.needsUpdate=true;
      im.instanceColor.updateRange.offset=0;im.instanceColor.updateRange.count=mA*3;im.instanceColor.needsUpdate=true;} // (vide : pas d'appel de dessin)
    if((q&3)>=2)nN+=m;else nF+=m;tri+=mA*im.userData.tri;}
  if(COTON.vit)for(let q=0;q<COTON.vit.length;q++){const V9=COTON.vit[q];if(!V9)continue;const Lv=LV?LV[(q>>2)*2+(q&3)-2]:null,ii=Lv?Lv.i:null,dd=Lv?Lv.d:null,m=Lv?Lv.n:0; // (vitrail / fantôme) un jeu par gabarit et par lot fin : ses maillages partagent LEURS instances
    for(let a=1;a<m;a++){const vi=ii[a],vd=dd[a];let b=a-1;while(b>=0&&dd[b]<vd){ii[b+1]=ii[b];dd[b+1]=dd[b];b--;}ii[b+1]=vi;dd[b+1]=vd;} // du plus LOIN au plus près (la peau, les fantômes sont transparents)
    const AB=V9.A.array,CB=V9.C.array;for(let a=0;a<m;a++){const j9=ii[a];cotonInst(j9*COTON_ST,AB,CB,a,tt);AB[a*16+3]=-W9[j9];AB[a*16+7]=-WC9[j9];} // les parts en NÉGATIF : le corps rentré (matière v8) prend les points que la v8 cède ; les cubes, leur rang
    const fa9=!!V9.fan;V9.c.count=V9.o.count=V9.p.count=V9.b.count=V9.g.count=m;V9.c.visible=V9.o.visible=V9.p.visible=!fa9&&m>0;V9.b.visible=fa9&&m>0;V9.g.visible=(fa9||!!V9.gOk)&&m>0; // (fantôme) le corps rentré + les cubes fantômes
    if(m){V9.A.updateRange.offset=0;V9.A.updateRange.count=m*16;V9.A.needsUpdate=true;V9.C.updateRange.offset=0;V9.C.updateRange.count=m*3;V9.C.needsUpdate=true;}
    tri+=m*V9.tri;}
  if(COTON.skin)for(let q=0;q<COTON.skin.length;q++){const S9=COTON.skin[q];if(S9){S9.m.count=COTON.im[q].count;S9.m.visible=COTON.root.visible&&S9.m.count>0;}} // la peau suit son lot (mêmes instances) — (2026-10-22) VIDE = INVISIBLE : MESURÉ aux Pics de Jade, 92 des 316 appels de dessin d'une image étaient des peaux à ZÉRO nuage (three prépare programme, uniformes et tampons pour ne rien dessiner)
  COTON.nN=nN;COTON.nF=nF;COTON.tri=tri;COTON.ms=COTON.ms*.95+(performance.now()-t00)*.05;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);cotonTick(cam);};} // CHAÎNÉ (jamais réassigné)
window.dbgCoton=function(q){ // q = 'max' : le plus gros nuage (centre du dessous, rayon) — pour le photographier
  if(q==='max'){const st=COTON_ST;let b=-1;for(let j=0;j<COTON.n;j++)if(b<0||COTON.I[j*st+3]>COTON.I[b*st+3])b=j;if(b<0)return null;const o=b*st,S=COTON.S[COTON.I[o+5]];
    return {x:COTON.I[o],y:COTON.I[o+1]+S.base*COTON.I[o+3]*COTON.I[o+9],z:COTON.I[o+2],r:COTON.I[o+3],h:COTON.I[o+7]};}
  return {nuages:COTON.n,pres:COTON.nN,loin:COTON.nF,triangles:COTON.tri,ms:+COTON.ms.toFixed(3),visible:!!(COTON.root&&COTON.root.visible),
  maillagesApart:CLOUDS.length,gabarits:COTON.im.map(function(im){return im.userData.tri;}),
  initMs:COTON.msInit==null?null:Math.round(COTON.msInit),toutPretMs:COTON.msPret?Math.round(COTON.msPret):null,prets:COTON.pret?COTON.pret.reduce(function(a,b){return a+b;},0):0,finsApart:CLOUDS.filter(function(c){return c.mesh&&c.mesh.userData.fin;}).length,ouvrier:COTON_OUV.ko?'refuse':COTON_OUV.w?'oui':'non'};};
// Boules d'un nuage (metaballs) — coords LOCALES [-1,1] dans la boîte (x,y,z,rayon).
// Chaque famille a sa silhouette : cumulus bourgeonnant, tour empilée, mer plate, voile épars.
function mkBlobs(o,rng){
  const B=[];
  // ⚠⚠ CONNEXITÉ GARANTIE — c'était LE défaut des formes d'avant (« les nuages sont vides ») :
  // un bourgeon pouvait être posé à 0,99 du corps pour une somme de rayons de 0,72, donc
  // TOTALEMENT DÉTACHÉ. Le nuage se lisait comme des saucisses qui flottent côte à côte.
  // Ici, toute boule fille naît SOUDÉE à sa mère : distance = (r_mère+r_fille)×0.50, donc
  // recouvrement franc. Un nuage est une MASSE, jamais un tas de billes.
  const push=(x,y,z,r,fy)=>{const b=[x,y,z,r,fy===undefined?1:fy];B.push(b);return b;};
  const grow=(p,ax,ay,az,rm)=>{ // bourgeon soudé à sa mère
    const r=Math.max(0.10,p[3]*rm),L=Math.hypot(ax,ay,az)||1,d=(p[3]+r)*0.50;
    return push(p[0]+ax/L*d,p[1]+ay/L*d,p[2]+az/L*d,r);
  };
  const R=()=>rng()-0.5;
  if(o.giant){
    // ---- CUMULONIMBUS : socle lourd → colonne qui bourgeonne → ENCLUME étalée au sommet ----
    // La silhouette la plus spectaculaire du ciel réel, et la plus lisible de loin : on la
    // reconnaît à sa tête plate qui déborde. Elle PENCHE (cisaillement du vent), jamais droite.
    const lean=R()*0.34;
    push(0,-0.70,0,0.44,0.80);                                    // socle large, aplati par en dessous
    push(0.28,-0.68,R()*0.22,0.34,0.80); push(-0.27,-0.66,R()*0.22,0.34,0.80);
    let cur=push(lean*0.3,-0.44,0,0.42);
    const nE=4+Math.floor(rng()*2);
    for(let i=0;i<nE;i++){
      cur=grow(cur,lean+R()*0.30,1,R()*0.30,0.93);                // l'étage suivant, soudé au précédent
      if(rng()<0.5)grow(cur,R()*2,0.25,R()*2,0.50);               // bourgeon latéral : le chou-fleur
    }
    const ya=Math.min(0.78,cur[1]+cur[3]*0.45);                   // L'ENCLUME : la tour bute et s'étale
    const an=push(lean*1.1,ya,0,0.50,0.30);
    for(let k=0;k<4;k++){const a=k*1.5708+rng();
      push(an[0]+Math.cos(a)*0.36,ya-0.03,an[2]+Math.sin(a)*0.36,0.33,0.28);}
  }else if(o.sea){
    // ---- STRATUS : une NAPPE CONTINUE, pas des galettes éparpillées ----
    let cur=push(0,-0.35,0,0.46,0.42);
    for(let i=0;i<7;i++){const a=rng()*6.2832;
      cur=grow(cur,Math.cos(a),R()*0.10,Math.sin(a),0.95);cur[4]=0.42;} // chaînée : aucun trou possible
  }else if(o.veil){
    // ---- CIRRUS : un voile ÉTIRÉ dans le vent, en une seule traînée continue ----
    const a=rng()*6.2832,ux=Math.cos(a),uz=Math.sin(a);
    let cur=push(-ux*0.55,0,-uz*0.55,0.40,0.22);
    for(let i=0;i<5;i++){cur=grow(cur,ux+R()*0.5,R()*0.15,uz+R()*0.5,0.98);cur[4]=0.22;}
  }else{
    // ---- CUMULUS : BASE PLATE (le niveau de condensation) + chou-fleur qui bourgeonne ----
    // Le vrai cumulus a un dessous RECTILIGNE — c'est ça qui le rend crédible d'un coup d'œil.
    const nb=3+Math.floor(rng()*2),base=[];
    for(let i=0;i<nb;i++){const a=i/nb*6.2832+rng()*0.6,sp=(i===0?0:0.30+rng()*0.12);
      base.push(push(Math.cos(a)*sp,-0.42,Math.sin(a)*sp*0.85,0.40+rng()*0.10,0.78));}
    let lvl=base.slice();
    for(let g=0;g<2&&B.length<14;g++){ // deux générations : ça monte et ça s'arrondit
      const nxt=[];
      for(const p of lvl){ if(B.length>=14)break;
        if(rng()<(g?0.55:0.85))nxt.push(grow(p,R()*1.1,1,R()*1.1,0.80-g*0.08));}
      if(!nxt.length)break; lvl=nxt;
    }
  }
  // tout reste DANS la boîte : le test « dedans » (fog/white-out) et la dérive se basent sur r/ry
  return B.map(b=>{const m=Math.hypot(b[0],b[1],b[2]),mx=0.99;
    if(m+b[3]>mx){const s=(mx-b[3])/Math.max(m,1e-3);if(s<1){b[0]*=s;b[1]*=s;b[2]*=s;}}return b;}).slice(0,20);
}
/* (2026-09-26, user : « moins de nuages en contact avec la route ») LA GARDE DU RUBAN : ce nuage (ellipsoïde r × ry) mord-il sur la
   route, n'importe où ? On balaie la ligne centrale tous les ~18 m, avec la demi-largeur de la route et une marge. Seuls les BANCS
   (onRoad : la percée à l'aveugle, voulue) y échappent — tout le reste qui toucherait le ruban n'est simplement pas posé. */
function nuageTouche(c,r,ry){
  if(!(NP>1)||!pts.length)return false;
  const st=Math.max(1,Math.round(18/Math.max(.5,L/(NP-1)))),rh=r+ROAD_HALF+18,rv=ry+22,ih=1/(rh*rh),iv=1/(rv*rv);
  for(let i=0;i<NP;i+=st){const p=pts[i],dx=p.x-c.x,dz=p.z-c.z,dy=p.y-c.y;if((dx*dx+dz*dz)*ih+dy*dy*iv<1)return true;}
  return false;
}
function mkCloud(center,r,o,rr){ // un nuage = ses boules fusionnées en UN mesh opaque, point.
  if(!lvlNuageOk(o))return; // LES NIVEAUX : chaque monde garde ses familles de nuages (voir NIVEAUX)
  let ry=r*(o.giant?.55+rr()*.18:o.veil?.16:o.sea?.15:.36+rr()*.16);
  if(o.baseY!==undefined)center.y=o.baseY+ry*0.64; // plafond de condensation commun
  if(!o.onRoad&&nuageTouche(center,r,ry))return; // (2026-09-26) jamais un nuage de décor posé SUR le ruban
  const g=new THREE.Group();g.position.copy(center);
  let geo9,fin9=null;const v8=!o.sea&&!o.veil&&!o.deco;
  if(v8){ /* (2026-09-30) LES NUAGES v8 : le banc de route, le coussin de vol, la tour — un cumulus sculpté (cumulus8), sa surface (nuage8Calc) dans
            l'ouvrier ; l'ÉBAUCHE en boules tient la place en attendant. Le maillage est à l'échelle du nuage (mesh.scale = r) : la ouate bouillonne. */
    cotonInit();const gn=o.onRoad?(r>34?'mediocris':'humilis'):o.giant?'congestus':['mediocris','humilis','mediocris','humilis','congestus'][Math.floor(rr()*5)];
    const S=cumulus8(gn,rr);S.seed=Math.floor(rr()*997);const dyU=-(S.base+S.top)*.5;
    if(!o.onRoad&&nuageTouche(center,r,(S.top-S.base)*r*.5)){rr();return;} /* (2026-10-18, DEBUGGING : la garde du ruban ci-dessus mesurait l'ellipsoïde PROVISOIRE — une tour v8 est ~2 fois plus haute (ry ≈ r au lieu de 0,55-0,73 r) : MESURÉ, 1 nuage de décor sur ~450 laissait passer la route DANS lui, que la caisse « défonçait » (la tour de 370 m réduite à rien puis reformée). On reteste avec sa VRAIE hauteur ; le rr() rend le tirage `ph` qu'il aurait pris : les nuages suivants ne bougent pas) */
    geo9=NUVIT.vox?nuVide():cotonGeo({B:S.B.slice(0,12),base:S.base,top:S.top},CLOUD_SPH_LO);geo9.translate(0,dyU,0);geo9.computeBoundingSphere();fin9={S:S,dyU:dyU,v8:1};
    ry=(S.top-S.base)*r*.5;}
  else if(!o.onRoad&&!o.sea&&!o.veil&&!o.deco){ // (ciel de coton) les COUSSINS de vol et les TOURS qu'on traverse : la forme classique,
    cotonInit();const S=cotonBlobs(o.giant?2:[0,5,3][Math.floor(rr()*3)],rr),h=(S.top-S.base)*r; // bourgeons ronds, ventre lavande (voir cotonBlobs)
    fin9={S:S,r:r,dy:-(S.base+S.top)*.5*r};geo9=cotonGeo(S,CLOUD_SPH_LO);geo9.scale(r,r,r);geo9.translate(0,fin9.dy,0);geo9.computeBoundingSphere(); // (2026-09-30) une ÉBAUCHE légère tout de suite, la forme fine arrive de l'ouvrier (≈10 ms par nuage : 0,2 s de gel à chaque portail)
    ry=h*.5;} // l'ellipsoïde « dedans » (white-out, airtime) suit la vraie hauteur du nuage
  else geo9=mergeSpheres(mkBlobs(o,rr),r,ry,r); // les 5-10 boules de CE nuage (RNG isolé : ne rebrasse pas la génération)
  const mesh=new THREE.Mesh(geo9,v8?nuage8Solo():CLOUD_MAT);if(v8){mesh.scale.set(r,r,r);mesh.updateMatrix();mesh.userData.m8=nuage8Solo();}
  // Opaque : il s'occlut par le z-buffer comme n'importe quel décor. Aucun tri, aucun mélange,
  // donc AUCUN ordre de dessin ne peut le faire clignoter. Le frustum culling de three.js
  // redevient sûr (la géométrie est réelle et sa sphère englobante est exacte).
  mesh.castShadow=false;mesh.receiveShadow=false; // la ouate ne projette rien : c'est du décor
  mesh.userData.trav=!!(o.onRoad||(!o.giant&&!o.sea&&!o.veil&&!o.deco));
  mesh.matrixAutoUpdate=false; // (2026-09-27, passe perf iPhone) le maillage ne bouge JAMAIS dans son groupe (repère identité) : c'est le groupe qui dérive — plus 90 matrices recomposées pour rien à chaque image
  g.add(mesh);scene.add(g);
  if(fin9&&fin9.v8)nuage8Async(fin9.S,r>150?N8_FIN[3]:N8_FIN[2],function(q){if(!g.parent)return;const g2=cotonBuf(q);g2.translate(0,fin9.dyU,0);g2.computeBoundingSphere();const o9=mesh.geometry;mesh.geometry=g2;o9.dispose();mesh.userData.fin=true;
    if(q.skin&&NUSKIN.on){const sk9=new THREE.Mesh(nuSkinGeo(q.skin,fin9.dyU),nuSkinMat());sk9.renderOrder=1;sk9.matrixAutoUpdate=false;sk9.frustumCulled=false;sk9.castShadow=sk9.receiveShadow=false;mesh.add(sk9);mesh.userData.peau=sk9.geometry; /* (2026-10-22, DEBUGGING : sa géométrie est NEUVE pour chaque nuage — disposeClouds la libère, voir u9.peau) */} // la peau du nuage seul (coussin, tour)
    if(q.vit){const G=nuVitGeo(q,fin9.dyU),MS=nuVitMats(true),c9=new THREE.Mesh(G.cub,MS.cub),p9=new THREE.Mesh(G.pea,MS.pea); /* (2026-10-18) LE VITRAIL des bancs, coussins et tours : le maillage du nuage devient son CŒUR, les écailles et la peau sont ses enfants */
      for(const x of [c9,p9]){x.castShadow=x.receiveShadow=false;x.updateMatrix();x.matrixAutoUpdate=false;mesh.add(x);}p9.renderOrder=1;
      const u9=mesh.userData;u9.vit=[c9,p9];u9.g8=g2;u9.hcw=q.vit.hc*r;u9.gVit=G.coe;u9.mVit=MS.coe;if(NUVIT.on){mesh.geometry=G.coe;if(mesh.material===nuage8Solo())mesh.material=MS.coe;u9.m8=MS.coe;}else c9.visible=p9.visible=false;
      if(q.fant&&NUVIT.mix){const G2=nuFantGeo(q,fin9.dyU,g2),f9=new THREE.Mesh(G2.fan,nufMat(MS.fan,G2));f9.castShadow=f9.receiveShadow=false;f9.updateMatrix();f9.matrixAutoUpdate=false;f9.renderOrder=2;mesh.add(f9);u9.vit.push(f9); /* (mélange) les cubes éparpillés du nuage seul */
        f9.onBeforeRender=function(r9,s9,c9b,g9,m9){m9.uniforms.uNvW.value=1;m9.uniformsNeedUpdate=true;};if(!NUVIT.on)f9.visible=false;}}
    else if(q.fant){const G=nuFantGeo(q,fin9.dyU,g2),MS=nuVitMats(true),f9=new THREE.Mesh(G.fan,nufMat(MS.fan,G)); /* (fantôme) les bancs, coussins et tours : le maillage devient le CORPS rentré, les cubes fantômes sont son enfant */
      f9.castShadow=f9.receiveShadow=false;f9.updateMatrix();f9.matrixAutoUpdate=false;mesh.add(f9);
      const u9=mesh.userData;u9.vit=[f9];u9.g8=g2;u9.hcw=r/NUVIT.fsz;u9.fan=true;u9.nvw=1;f9.onBeforeRender=function(r9,s9,c9,g9,m9){m9.uniforms.uNvW.value=u9.nvw;m9.uniformsNeedUpdate=true;}; /* (2026-10-18, LE FONDU) la part de cubes de CE nuage */u9.gVit=G.corps;u9.mVit=nuage8Solo();if(NUVIT.on)mesh.geometry=G.corps;else f9.visible=false;}},Math.max(NUVIT.nc,Math.min(40,Math.round(r/8))),fin9.dyU);
  else if(fin9)cotonCalcAsync(fin9.S,CLOUD_SPH,function(q){if(!g.parent)return; /* jeté entre-temps (portail) */ const g2=cotonBuf(q);g2.scale(fin9.r,fin9.r,fin9.r);g2.translate(0,fin9.dy,0);g2.computeBoundingSphere();const o9=mesh.geometry;mesh.geometry=g2;o9.dispose();mesh.userData.fin=true;});
  CLOUDS.push({g:g,c:center.clone(),r:r,ry:ry,onRoad:!!o.onRoad,puffs:[],mesh:mesh,ph:rr()*6.28,refT:0,fid:-1,wasIn:false});
}
// (le repli SPRITES a été supprimé avec le raymarch : il n'y a plus qu'UN seul chemin de nuage)
let BANC_LOG=[];
function bancCourbe(s){ // la courbure de la piste (rad/m) autour de s, mesurée sur ±8 m
  const ds=L/(NP-1),a=Math.max(1,Math.round(8/ds)),i=Math.round(Math.max(0,Math.min(L,s))/ds),i0=Math.max(0,i-a),i1=Math.min(NP-1,i+a);
  return Math.acos(Math.min(1,T[i0].dot(T[i1])))/Math.max(1,(i1-i0)*ds);}
function bancVirage(s0,deja){ // l'entrée du prochain VIRAGE (rayon < 200 m) précédé d'une portion DROITE (courbure moyenne < 1/330 sur 200 m), entre s0+150 et s0+1200 — ou −1
  /* ⚠ (banc bancs.js) la piste des NUAGES n'a presque pas de droite pure (courbure médiane 3,4 mrad/m, rayon ~290 m) : « droite » = en MOYENNE */
  for(let c=s0+150;c<Math.min(L-320,s0+1200);c+=8){
    if(bancCourbe(c)<1/200||bancCourbe(c-12)>=1/200)continue; if(Math.abs(c-deja)<120)continue; // l'ENTRÉE du virage (juste avant, ça ne tournait pas encore)
    let m=0,n=0;for(let q=c-210;q<c-10;q+=10){m+=bancCourbe(q);n++;}
    if(m/n<1/330)return c;}
  return -1;}
function buildClouds(rr){
  disposeClouds();
  nuageFondu=started?0:1; // (2026-09-26) en course (portail), les nuages de la nouvelle zone montent en fondu avec le ciel — au menu, tout de suite
  // RNG local : retoucher les nuages ne rebrasse plus la génération en aval (piège rnd séquentiel)
  const cr=mulberry32((rr()*1e9)|0);
  // RÉPARTITION HARMONIEUSE (2026-07-30) : les positions étaient tirées AU HASARD sur toute la piste
  // (`cr()*NP`) — donc en grappes, avec de longs vides entre. On passe à un ÉCHANTILLONNAGE STRATIFIÉ :
  // une tranche de piste par nuage + un jitter contenu → espacement régulier, sans régularité mécanique.
  const strat=(k,K)=>Math.min(NP-1,Math.floor(((k+.18+cr()*.64)/K)*NP));
  const stratAz=(k,K)=>((k+.15+cr()*.7)/K)*6.2832; // idem pour les azimuts : le ciel est peuplé TOUT AUTOUR
  // bancs SUR la route — espacés : on en traverse PARFOIS, jamais en continu. Un MUR intégral (la caisse
  // disparaît dans le blanc) reste l'exception spectaculaire, pas la règle.
  const OR9=!!(LVL.cur&&LVL.cur.id==='orage'); // (2026-09-29) L'ORAGE : « plein de gros nuages sur la route » — le niveau dur se roule À L'AVEUGLE
  /* (2026-10-21, Léo : « évite de faire des gueules sur la route si tu n'arrives pas à les faire dégager de manière satisfaisante ») PLUS DE BANCS SUR LA ROUTE aux NUAGES (toutes les météos) :
     la voiture ne s'y noie plus (les nuages de décor restent hors du couloir libre). `?bancs=1` rend les bancs (la règle de Sacha « les nuages cachent les virages »). */
  const SANS_BANCS=!!(ARC_ON&&LVL.cur&&(LVL.cur.id==='nuages'||LVL.cur.id==='orage')&&!/[?&]bancs=1\b/.test(location.search));
  let cBanc=-1e9;BANC_LOG=[]; // (2026-09-30) le dernier virage caché : deux bancs ne cachent jamais le même
  for(let sp=(OR9?420:1600)+cr()*(OR9?300:900);sp<L-300&&!SANS_BANCS;sp+=OR9?300+cr()*300:1900+cr()*1400){ /* (2026-09-30, Sacha : « beaucoup plus de nuages, au point que ça gêne la visibilité ») : à l'ORAGE un banc tous les 300-600 m (560-1180 avant) */ // (2026-09-26, user : « moins de nuages en contact avec la route ») : ~2× plus rares — à l'ORAGE ~3× plus serrés
    if(cr()<(OR9?.06:.4))continue; // 2 bancs sur 5 sautés (orage : ~1 sur 16)
    frameAt(sp,F);
    const mega=cr()<(OR9?.45:.1);
    const dl9=OR9&&!mega&&cr()<.5?(cr()<.5?-1:1)*ROAD_HALF*(.35+cr()*.3):0; // (2026-09-30) à l'orage, un banc sur quatre couvre UN côté de la route : on le frôle, on ne sait pas ce qu'il cache
    /* (2026-09-30, Sacha : « oui » — relevé par la revue de GAMEPLAY : ~la moitié des bancs tombaient EN virage) hors de l'ORAGE, le banc CACHE LE
       VIRAGE SUIVANT : au bout d'une vraie droite, son bord ~160 m avant l'entrée de la courbe — on le voit venir, on en ressort avec le temps
       de lire le virage (la règle du niveau 8 de la campagne). Aucun tirage de plus ni de moins : sans virage à cacher, il garde sa place. */
    let s9=sp;if(!OR9){const r9=mega?55:25,c9=bancVirage(sp,cBanc);if(c9>=0){cBanc=c9;s9=Math.max(sp,c9-160-r9);frameAt(s9,F);}
      else if(bancCourbe(sp)>=1/300){for(let q=sp+20;q<Math.min(L-320,sp+600);q+=20)if(bancCourbe(q)<1/330){s9=q;frameAt(s9,F);break;}}} // pas de virage à cacher : au moins PAS EN virage
    BANC_LOG.push([Math.round(s9),Math.round(bancCourbe(s9)*1e4)/10,Math.round(bancCourbe(sp)*1e4)/10]); // (banc) où il est tombé, sa courbure (mrad/m) — et celle de sa place d'avant
    mkCloud(cldV1.copy(F.p).addScaledVector(F.n,mega?6+cr()*4:2.5+cr()*2).addScaledVector(F.b,dl9),
      mega?(OR9?58+cr()*36:40+cr()*30):(OR9?30+cr()*18:18+cr()*14),{onRoad:true,dense:true},cr);
  }
  // CHAMPS de nuages de VOL : les coussins vont par 2-3, échelonnés le long de la piste —
  // une vraie FENÊTRE de recharge d'airtime qu'on lit de loin, pas des miettes perdues
  for(let k=0;k<5;k++){ // 5 champs au lieu de 6, mais des coussins qui se VOIENT
    const i0=strat(k,5),above=cr()<.62,n9=2+Math.floor(cr()*2);
    for(let m9=0;m9<n9;m9++){
      const i=Math.min(NP-1,i0+m9*(40+Math.floor(cr()*50)));
      // rayon 16-36 → 34-62 : à 16 d'envergure c'était du CONFETTI à côté de tours de 400.
      // Un coussin d'airtime doit se lire de loin pour qu'on aille le chercher.
      const r9=34+cr()*28; // (2026-09-26) décollé de la dalle d'au moins 30 m au-dessus de son ventre (il ne touche plus la route)
      mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*70)
        .addScaledVector(Nn[i],above?r9*.55+30+cr()*44:-(r9*.55+THICK+32+cr()*60)),r9,{},cr);
    }
  }
  // TOURS GÉANTES façon simulateur de vol : des montagnes de ouate — une sur quatre est
  // PLANTÉE sur la piste (rayon PLAFONNÉ : le white-out dure 2 s, pas 10)
  for(let k=0;k<5;k++){ // 8→5 : moins de tours (le ciel était trop chargé)
    const i=strat(k,5);
    cr();const cross=false; // (2026-09-26) plus de tour plantée sur la piste
    const r9=cross?Math.min(120+cr()*140,190):200+cr()*220; // les tours libres DOUBLENT de taille
    const off=cross?(cr()*2-1)*40:(r9+ROAD_HALF+60+cr()*420)*(k%2?1:-1); // ALTERNÉES gauche/droite — écartées de TOUT leur rayon (×0,68 : elles mordaient la route)
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],off)
      .addScaledVector(Nn[i],cross?-r9*.25+cr()*30:-140+cr()*330),r9,{giant:true,onRoad:cross,noFog:!cross},cr);
  }
  // MER DE NUAGES sous la piste : le tapis à perte de vue du vol au-dessus des nuages
  for(let k=0;k<6;k++){ // 10→6
    const i=strat(k,6);
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*1100)
      .addScaledVector(Nn[i],-(170+cr()*220)),170+cr()*150,{sea:true,noFog:true},cr);
  }
  // (ciel de coton, 2026-09-28) la ouate à mi-distance, les RUES de nuages, les électrons libres, le banc haut, les MASSIFS, les TITANS,
  // les coussins de décor du niveau NUAGES et l'ARCHIPEL sont devenus le CIEL DE COTON (buildCoton, plus bas) : trois fois plus de
  // nuages, en forme classique, pour une douzaine d'appels de dessin. Ne restent ici que les nuages qui ont une FORME à eux (mer, voiles).
  // voiles d'altitude : nappes roses étirées très haut — le plafond féerique
  for(let k=0;k<4;k++){ // 7→4
    const i=strat(k,4);
    mkCloud(cldV1.copy(pts[i]).addScaledVector(B[i],(cr()*2-1)*1400)
      .addScaledVector(Nn[i],230+cr()*220),150+cr()*120,{veil:true,noFog:true},cr);
  }
  const roadY=37; // altitude moyenne du ruban (repère stable pour poser le plancher de nuages)
  // L'OCÉAN : l'undercast — un tapis PLAT à perte de vue, loin sous la piste (bande d'altitude serrée : une MER avec un niveau)
  for(let k=0;k<7;k++){ // 12→7 : l'undercast reste un tapis, en moins dense
    const i=strat(k,7),a=stratAz(k,7),d=800+cr()*1600; // l'undercast couvre tout l'horizon, sans trou ni paquet
    cldV1.set(pts[i].x+Math.cos(a)*d,roadY-245+cr()*75,pts[i].z+Math.sin(a)*d);
    mkCloud(cldV1,200+cr()*180,{sea:true,noFog:true},cr);
  }
  /* LE NIVEAU NUAGES (2026-09-24) : la mer se referme sous la route — un second plancher, plus proche, qu'on survole au ras. Espace
     MONDE (jamais B[i]/Nn[i]), tiré sur `cr` : ça ne décale que les nuages, jamais la piste. */
  if(LVL.cur&&LVL.cur.id==='nuages'){
    for(let k=0;k<7;k++){
      const i=strat(k,7),a=stratAz(k,7),d=cr()*900;
      cldV1.set(pts[i].x+Math.cos(a)*d,pts[i].y-(130+cr()*110),pts[i].z+Math.sin(a)*d);
      mkCloud(cldV1,170+cr()*140,{sea:true,noFog:true},cr);
    }
  }
  buildCoton(cr); // LE CIEL DE COTON : tout le décor de nuages, en instances (voir cotonBlobs / cotonTick)
}
/* (2026-10-14, sensations ; Sacha : « oui pouf, mais travaille-le très bien ») LE POUF DE LA OUATE, dans la MAIN seulement — le nuage ne
   touche toujours pas à la caisse (Sacha, 30/09 : « juste bloquer la vue, rien d'autre ») : ni ressort, ni secousse, ni particule en plus.
   · ENTRER : la ouate cède puis se referme — un tic très doux, un silence, un tic un rien plus plein (« p…ouf »). Il se DOSE à la vitesse : traversé
     lentement, un seul tic à peine posé ; pris vite, le pouf entier (≥ 260 km/h). Jamais plus fort que LÉGER.
   · DÉFONCER un banc posé sur la route : un coup rond et son écho (le seul qui monte à MOYEN) — c'est un geste, il se paie.
   · RESSORTIR à l'air libre après un vrai passage (≥ 0,4 s dedans) : un tic minuscule, l'air qui se rouvre. Un banc juste effleuré n'en a pas.
   · JAMAIS DE BOURDON : un champ de bancs enfilés à pleine vitesse (l'ORAGE) ne donne qu'un pouf toutes les 0,5 s ; les autres sont muets. */
const SENS_NU={t:-1e9,te:-1e9};
function sensNuage(k,casse){
  if(!SENS||!started||gameOver||paused||!running)return;
  const n9=performance.now();
  if(casse){SENS_NU.t=n9;sensHap([15,24,10],2);return;}
  if(n9-SENS_NU.t<500)return;
  SENS_NU.t=n9;
  const v9=(mode==='fall'?fallVel.length():Math.abs(vA))*3.6*SPD,d9=Math.min(1,v9/260); // dosé par la VITESSE seule : à l'image d'entrée la profondeur k ne vaut encore presque rien
  sensHap(d9<.35?6:[5,24+Math.round(10*(1-d9)),7+Math.round(4*d9)],1);
}
function sensNuageSort(c){
  if(!SENS||!started||gameOver||paused||!running)return;
  const n9=performance.now();
  if(n9-(c.sensT||0)<400||n9-SENS_NU.t<300||n9-SENS_NU.te<500)return;
  SENS_NU.te=n9;sensHap(5,1);
}
function updateClouds(dt,t){
  cloudIn=0;let prox=0; // prox : la CAMÉRA frôle un banc (0 = loin · 1 = à la paroi) — l'œil s'y prépare avant d'y entrer
  // Plus rien à pousser dans un shader : les nuages sont des mesh opaques ordinaires. On ne fait
  // plus que (1) les faire dériver doucement et (2) détecter qu'on est DEDANS (fog/son/airtime).
  // Le frustum culling de three.js s'occupe du reste : la géométrie est réelle, sa sphère
  // englobante est exacte, donc aucun pop possible.
  const cp=carGroup.position;
  if(nuageFondu<1){nuageFondu=Math.min(1,nuageFondu+dt/2.4);const e9=nuageFondu*nuageFondu*(3-2*nuageFondu);CLOUD_MAT.opacity=.82*e9;CLOUD_MAT_IN.opacity=.93*e9;CLOUD_MAT_IN8.opacity=.93*e9;if(COTON.mat)COTON.mat.opacity=.82*e9;N8_U.uFondu.value=e9;} // (2026-09-26) la ouate d'une nouvelle zone monte en fondu (2,4 s, le temps que le ciel bascule)
  for(const c of CLOUDS){
    cldV1.subVectors(cp,c.g.position);
    const dh2=cldV1.x*cldV1.x+cldV1.z*cldV1.z,dv=cldV1.y;
    const d2=dh2/(c.r*c.r)+(dv*dv)/(c.ry*c.ry);
    if(c.brokenT>0){ // DÉFONCÉ : éclate vite (×.08), reste en miettes, puis se reforme sur la fin
      c.brokenT-=dt;const bt=c.brokenT;
      const sc=bt>4.0?1-(4.5-bt)/0.5*0.92:bt>1.5?0.08:0.08+(1.5-bt)/1.5*0.92;
      if(!NUVIT.vox)c.g.scale.setScalar(bt<=0?1:Math.max(0.06,sc)); // (cubes) le banc ne rétrécit plus : il est TROUÉ (nuCasseBurst) et se referme
    }
    {const ex=camera.position.x-c.g.position.x,ey=camera.position.y-c.g.position.y,ez=camera.position.z-c.g.position.z,
      dc=(ex*ex+ez*ez)/(c.r*c.r)+(ey*ey)/(c.ry*c.ry);if(dc<2.6){const q=Math.min(1,(2.6-dc)/1.6);if(q>prox)prox=q;}
      c.mesh.material=dc<1.1?(c.mesh.userData.m8?CLOUD_MAT_IN8:CLOUD_MAT_IN):(c.mesh.userData.m8||c.mesh.userData.mm||CLOUD_MAT);if(c.mesh.userData.vit&&NUVIT.on){const u9=c.mesh.userData,dd9=Math.sqrt(ex*ex+ey*ey+ez*ez)-c.r,cq9=2*(u9.hcw||0)/Math.max(1,dd9),v9=!(dc<1.1)&&cq9<=NUVIT.ang;
      if(u9.fan&&NUVIT.fondu){u9.nvw=dc<1.1?0:1-nuvLisse(NUVIT.bPresF[0],NUVIT.bPresF[1],cq9);for(const o9 of u9.vit)o9.visible=u9.nvw>0;if(!(dc<1.1)&&c.mesh.geometry!==u9.gVit){c.mesh.geometry=u9.gVit;c.mesh.material=u9.mVit;}}else{ /* (2026-10-18, LE FONDU) le fantôme seul : ses cubes s'effacent en approchant, le corps reste (plus de bascule vers la v8) */ // (vitrail) dedans : le white-out seul ; TOUT PRÈS (écaille trop grosse à l écran) : le nuage lisse, comme les instances
      for(const o9 of u9.vit)o9.visible=v9;if(!(dc<1.1)){const m9=v9?u9.mVit:nuage8Solo(),g9=v9?u9.gVit:u9.g8;if(c.mesh.material!==m9)c.mesh.material=m9;if(c.mesh.geometry!==g9)c.mesh.geometry=g9;}}}} /* (vitrail) dedans : le white-out seul, sans écailles ni peau */ /* (2026-10-14, œil) mm : la laine plus blanche d'un mouton (moutonTete) */ // (2026-09-26) la caméra DANS l'ellipsoïde : la paroi intérieure se montre (white-out) ; dehors, l'endroit seul
    c.g.position.x=c.c.x+Math.sin(t*.07+c.ph)*4;   // le banc respire et dérive au vent
    c.g.position.z=c.c.z+Math.cos(t*.05+c.ph)*4;
    if(d2<1){ // ---- DEDANS ----
      const k=1-Math.sqrt(d2);
      if(k>cloudIn)cloudIn=k;
      if(!c.wasIn){
        c.wasIn=true;
        if(SONV2){if(!(mode==='drive'&&(c.brokenT||0)<=0))sfx('nuage.entre');}else noiseBurst(.5,.10,520); // on plonge dans la ouate (console de son : défoncé au sol, c'est nuage.defonce qui parle)
        /* (2026-09-30, Sacha : « les nuages doivent juste BLOQUER LA VUE, rien d'autre ») plus de budget d'airtime rendu par un banc (1,2 s — à l'ORAGE, un vol bas rechargeait toutes les 2-4 s) */
        if(NUVIT.vox)nuCasseBurst(cp,Math.min(1,k+.35),c);else shatterCloud(cp,Math.min(1,k+.35)); // MILLE MORCEAUX au point de contact (où l'on touche le banc)
        if(mode==='drive'&&(c.brokenT||0)<=0){c.brokenT=4.5;if(SONV2)sfx('nuage.defonce');else whoosh();addStyle(3);} // la caisse DÉFONCE le banc → il éclate puis se reforme
        if(SENS)try{c.sensT=performance.now();sensNuage(k,mode==='drive'&&c.brokenT===4.5);}catch(e){} // (2026-10-14, sensations) le POUF dans la main, dosé par la profondeur et la vitesse — la caisse, elle, ne sent rien
      }
      /* (2026-09-30, Sacha : « les nuages doivent juste bloquer la vue, rien d'autre ») le nuage ne touche plus à la CAISSE : plus de coussin
         d'air (portance), plus de turbulence (vitesse et vrille chahutées), plus de regain d'airtime ; au sol plus de tangage ni de frein.
         Il reste ce qui se VOIT et s'ENTEND : le voile blanc, la paroi vue de dedans, le son feutré — et la caméra qui tremble à peine. */
      shake=Math.max(shake,(mode==='fall'?.1:.07)*k);
      if(NUVIT.vox)nuCasseDans(c,k,cp);
      // (zéro particule à la traversée — demande de Sacha : la paroi du mesh fait tout le travail)
    }else if(c.wasIn&&d2>1.3){ // ---- SORTIE ----
      c.wasIn=false;
      if(SONV2)sfx('nuage.sort');else noiseBurst(.22,.07,1500); // l'air se rouvre d'un coup
      if(SENS)try{sensNuageSort(c);}catch(e){} // (2026-10-14, sensations) l'air se rouvre : un tic minuscule, seulement après un vrai passage
      if(c.onRoad&&mode==='drive'&&Math.abs(vA)*3.6*SPD>140)addStyle(7); // percée à l'aveugle
    }
  }
  if(NUVIT.vox)nuCasseTick(dt,t);
  if(NUVIT.vox)nuMoodTick(dt);
  cloudInS+=(cloudIn-cloudInS)*Math.min(1,dt*(cloudIn>cloudInS?9:3.5));
  if(cloudInS<.004)cloudInS=0;
  {const o9=(cloudInS*.26).toFixed(3);if(updateClouds._o!==o9){updateClouds._o=o9;cloudFxEl.style.opacity=o9;}} // (2026-09-27) écrit seulement quand il change (hors nuage : « 0.000 » à chaque image) // JOUABLE : voile discret (était .92 = white-out aveuglant, puis .40 — encore trop blanc sous le bloom)
  cloudNearS+=(prox-cloudNearS)*Math.min(1,dt*2.5);
  // CONTRE-JOUR : face au soleil (au carré : ±30° seulement), la brume se dore, l'horizon avance, l'expo respire
  camera.getWorldDirection(cjV);
  const cj9=Math.max(0,cjV.dot(SUN_DIR))*(1-LVL.pluie),cj2=cj9*cj9, // (ville sous la pluie : pas de soleil, pas de contre-jour)
        fogN9=FOG_N*(1-cj2*.18);
  scene.fog.near=fogN9-(fogN9-Math.min(fogN9,120))*cloudInS+CAMP_FOG*.5; /* (2026-09-30) jamais plus clair qu'avant d'entrer : à l'ORAGE (70/660) le banc ÉCLAIRCISSAIT la brume */   // on garde de la profondeur DANS le nuage (26→120 : la route reste lisible) · (2026-09-27) l'ÉCLAIR de l'orage ouvre le brouillard (CAMP_FOG)
  scene.fog.far=FOG_F-(FOG_F-Math.min(FOG_F,820))*cloudInS+CAMP_FOG;     // (340→820)
  fogTmp.copy(FOG_BASE).lerp(FOG_CJ,cj2*.5).lerp(FOG_CLOUD,cloudInS);
  scene.fog.color.copy(fogTmp);
  /* L'ADAPTATION DE L'ŒIL (2026-09-25, user : « la lumière peut être éblouissante, dans les nuages notamment »). Une ouate
     blanche éclairée plein soleil, c'est déjà du blanc pur AVANT le post ; le bloom l'étale et l'ACES le cloue au plafond :
     l'écran entier devenait blanc. Comme une vraie caméra, l'exposition BAISSE quand l'œil s'approche d'un banc, y entre,
     ou regarde le soleil — et le bloom se retient d'autant. Lissé : on ne voit pas le réglage, on voit que ça ne brûle plus. */
  GLARE=Math.min(1,Math.max(cloudInS,cloudNearS*.75,cj2*.45));
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO*(1+cj2*.07)*(1-.24*GLARE)*(1+CAMP_FLASH); // (2026-09-27) + le flash de l'éclair (niveau 9)
}
let cloudNearS=0,GLARE=0;
window.dbgProgs=function(cles){const P=renderer.info.programs||[];if(cles==='h')return P.map(function(p){const k=p.cacheKey;let h=5381;for(let i=0;i<k.length;i++)h=(h*33+k.charCodeAt(i))|0;return (h>>>0).toString(36)+' '+k.slice(0,40).replace(/\s+/g,' ')+' … '+k.slice(-50).replace(/\s+/g,' ');}); // (banc) chaque programme : une empreinte + son début et sa fin
  if(cles)return P.filter(function(p){return /nuageV\d|globeJourNuit/.test(p.cacheKey);}).map(function(p){return p.cacheKey;});return {n:P.length,ciel:P.filter(function(p){return /nuageV\d|globeJourNuit|an\*5\.-q\.y\*11/.test(p.cacheKey);}).map(function(p){return /nuageV\ddedans/.test(p.cacheKey)?'nuage-dedans':/nuageV\d/.test(p.cacheKey)?'nuage':/globe/.test(p.cacheKey)?'globe':'portail';})};};
/* ============================== LES NUAGES QUI SE DÉGAGENT (2026-10-20, Léo) ==============================
   « Ce qui serait cool, c'est qu'ils soient interactifs quand la voiture les touche : ça les dégage. Les plus gros blocs se cassent en petits
   blocs. Et ils sont fluides, donc ça bouge. » Deux gestes, tous les deux de la matière des cumulus en cubes (voir nuage8Calc, opt.vox) :
     · LA TROUÉE : à l'entrée dans un banc, puis tous les ~0,22 s tant qu'on y roule, une sphère de monde (NHOLE, huit places) où la ouate est
       effacée PAR MARCHES DE CUBES ; elle s'ouvre en 0,3 s, tient ~1,4 s, se referme en ~1,2 s (le tunnel derrière la caisse, qui se rebouche) ;
     · LES BLOCS : une gerbe de cubes (NCB, une seule InstancedMesh, ≤ 420) éclairés comme la ouate (mêmes uniformes N8_U) — les GROS (3-13 m, selon
       le nuage) éclatent en QUATRE plus petits (×.58) après ~0,35-0,9 s, jusqu'à ~1 m ; chacun tournoie, suit un remous (sinus lents), est tiré dans
       le sillage de la caisse, puis rétrécit et disparaît. Aucun ne touche au jeu : tout est visuel (la défonce de gameplay, brokenT, n'a pas changé).
   Le matériau est compilé au menu (la mesh existe, à zéro instance, dès que la matière des nuages existe : count 0 compile quand même). */
const NCB={cap:700,n:0,mesh:null,P:new Float32Array(700*3),V:new Float32Array(700*3),R:new Float32Array(700*3),W:new Float32Array(700*3),S:new Float32Array(700),A:new Float32Array(700),L:new Float32Array(700),SP:new Float32Array(700),PH:new Float32Array(700),B:new Float32Array(700),ct:new Map(),
  lp:new THREE.Vector3(),cv:new THREE.Vector3(),has:false,acc:0,hs:[],hi:0,tm:new THREE.Matrix4(),tq:new THREE.Quaternion(),te:new THREE.Euler(),tp:new THREE.Vector3(),ts:new THREE.Vector3()};
function nuCasseInit(){
  if(NCB.mesh||!COTON.mat8||!N8_U.uSunC.value)return;
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog]);for(const k of ['uSunW','uSunC','uSky','uGnd','uLav','uK','uR'])U[k]=N8_U[k];
  const m=new THREE.ShaderMaterial({uniforms:U,fog:true,
    vertexShader:['#include <common>','#include <fog_pars_vertex>','varying vec3 vN,vT;',
      'void main(){vec3 tr=position;vec3 nn=normal;vT=vec3(1.);',
      '#ifdef USE_INSTANCING','  nn=mat3(instanceMatrix)*nn;tr=(instanceMatrix*vec4(tr,1.)).xyz;','#endif',
      '#ifdef USE_INSTANCING_COLOR','  vT=instanceColor;','#endif',
      '  vN=normalize(mat3(modelMatrix)*nn);vec4 mvPosition=viewMatrix*modelMatrix*vec4(tr,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
    fragmentShader:['#include <common>','#include <fog_pars_fragment>','uniform vec3 uSunW,uSunC,uSky,uGnd,uLav;uniform vec4 uK,uR;varying vec3 vN,vT;',
      'void main(){vec3 N=normalize(vN);float lit=smoothstep(uR.x,uR.y,dot(N,uSunW));', // la lumière de la ouate (nuage8Mat), sans le modelé cuit : un cube = une face
      '  vec3 sk=mix(vec3(dot(uSky,vec3(.3,.59,.11))),uSky,.6)*vec3(.9,.95,1.05);',
      '  vec3 ciel=mix(uLav*(.6+.5*dot(uGnd,vec3(.3,.59,.11))),sk,smoothstep(-.35,.8,N.y));',
      '  vec3 ombre=ciel*uR.z*(.78+.22*max(dot(N,normalize(vec3(-uSunW.x,.55,-uSunW.z))),0.));',
      '  float ch=clamp((uSunC.r-uSunC.b-.18)*3.5,0.,.45);',
