/* ===== L'ANNEAU DE FUSION (2026-10-22, Léo : « ajoute un anneau de fusion autour de la planète, stylé ; récupère ça quelque part et rends-le pixel, en cohérence avec le jeu ») =====
   RÉCUPÉRÉ du CŒUR À FUSION — le moteur 25 (`case 24` de voitures/constructeur-moteur.js, la carte `tore · bobinesD` : un TOKAMAK) : une petite étoile, un TORE de
   plasma qui la traverse, HUIT bobines de cristal passées autour du tube ; la fiche du moteur donne la palette (`col` 0xd8ff60 · `flam` 0xf0ff90 : le citron acide, le
   complémentaire exact du bleu de la Terre). Ici la planète est l'étoile et l'anneau l'enserre.
   RENDU EN PIXELS (le vocabulaire du jeu : les cubes du vitrail, des nuages, des flammes — « de loin lisse et brillant, de près le pixel avec ses joints de lumière ») :
     · le TUBE de plasma = huit cubes par tour de l'anneau (3 × 3 moins le cœur), à 88 % de leur taille : entre eux passent des JOINTS de lumière, qui sont l'arête de
       chaque face allumée et, au fond, le CŒUR — une file de cubes blancs-citron qui se touchent (le fil du plasma) ;
     · HUIT bobines comme sur le moteur (deux pas d'épaisseur) en cubes sombres, qui enserrent le tube : du métal qui ne prend que la lumière du soleil et de la Terre, dont les joints
       s'allument à tour de rôle (un chenillard qui court autour de l'anneau) ;
     · une onde lente et TROIS paquets de plasma plus vifs qui tournent, des cubes qui s'allument au hasard (les étincelles), le pouls de la musique ;
     · de loin, une coque lisse ADDITIVE le long du tube (le halo qui lie les pixels), et le bloom fait le reste.
   LE GLOBE LE CACHE À LA MAIN : la planète se peint sur le plan lointain, sans écrire de profondeur (voir planetGroup) — la moitié de l'anneau qui passe DERRIÈRE
   elle serait donc dessinée devant. Chaque fragment teste son rayon œil → fragment contre la sphère du globe (`uPC`, `uPR`) : derrière, il est jeté.
   Tout se calcule dans le sommet (aucune matrice d'instance : un attribut de 4 nombres par cube), UN appel de dessin pour les cubes + UN pour le halo, créés à l'init,
   cachés hors orbite, compilés au menu avec le reste. L'anneau est un enfant de `planetGroup` (il suit sa place, son échelle, son fondu) ; son plan se recale chaque
   image sur l'œil (`anneauTick`) : la même vue de l'anneau à chaque virage. `?anneau=0` : la planète seule, comme avant. Banc : `dbgAnneau({tilt,R,S,off})` (`off` pour les photos AVANT | APRÈS). */
const ANNEAU_ON=!/[?&]anneau=0\b/.test(location.search);
const ANN={R:2250,S:33,N:432,NB:8,tilt:.75}; /* R : le rayon du tore, en unités de la planète (PLANET_R = 1560 : ×1,44) · S : le côté d'un cube du tube (= 2πR/N : des cubes, pas des briques) · N : les pas
   autour du tour (≈ 4 400 cubes, un seul appel de dessin : le même sur téléphone) · NB : les bobines (8, comme le CŒUR À FUSION) · tilt : l'angle de l'axe de l'anneau avec la visée (0 = de face, un cercle ; π/2 = par la tranche) —
   MESURÉ en course (planches du 22/10) : R 2750 sort du cadre, tilt 1,2 passe à 500 unités de l'œil (une bande énorme) ; R 2250 · tilt ,75 = un arc qui enjambe la planète, sans écraser le ciel. */
const ANNEAU=(function(){
  if(!ANNEAU_ON)return null;
  const N=ANN.N,NB=ANN.NB,pasB=N/NB,L=[];
  for(let i=0;i<N;i++){
    for(let cx=-1;cx<=1;cx++)for(let cz=-1;cz<=1;cz++)L.push([i,cx,cz,(cx||cz)?0:2]);        // le tube : 8 écailles (0) autour du cœur (2)
    const b=((i%pasB)|0);if(b<2)for(let cx=-2;cx<=2;cx++)for(let cz=-2;cz<=2;cz++)if(Math.max(Math.abs(cx),Math.abs(cz))===2)
      L.push([i,cx,cz,(Math.abs(cx)===2&&Math.abs(cz)===2)?3:1]);}                             // une bobine : le cadre de 16 cubes (1), ses quatre coins en cristal (3)
  const n=L.length,I=new Float32Array(n*4),Rn=new Float32Array(n);let q=0x2F6E2B1;const r=()=>{q=(q*16807)%2147483647;return q/2147483647;};
  for(let k=0;k<n;k++){I[k*4]=L[k][0];I[k*4+1]=L[k][1];I[k*4+2]=L[k][2];I[k*4+3]=L[k][3];Rn[k]=r();}
  const box=new THREE.BoxGeometry(1,1,1),g=new THREE.InstancedBufferGeometry();
  g.setAttribute('position',box.attributes.position);g.setAttribute('normal',box.attributes.normal);g.setIndex(box.index);
  g.setAttribute('aI',new THREE.InstancedBufferAttribute(I,4));g.setAttribute('aR',new THREE.InstancedBufferAttribute(Rn,1));g.instanceCount=n;
  const U={uT:{value:0},uPC:{value:new THREE.Vector3()},uPR:{value:1},uSun:{value:new THREE.Vector3(-.55,.7,.4).normalize()},uOp:{value:0},uPulse:{value:0},
    uN:{value:N},uR:{value:ANN.R},uS:{value:ANN.S},
    uRot:{value:0},
    uG:{value:new THREE.Vector4(.75,1.5,1.2,1.3)},  // (vitre des écailles, joints, halo, paquets chauds)
    uH:{value:new THREE.Vector4(1.6,1,.9,0)}};      // (cœur, joints des bobines, coins de cristal)
  /* LES CUBES. `aI` = (pas autour du tour, case en travers, case en hauteur, genre : 0 écaille · 1 bobine · 2 cœur · 3 coin de bobine). Le cube se pose dans le repère de l'anneau
     (T la tangente, Rr le rayon, Z l'axe), puis `modelMatrix` (la planète : place et échelle). `vL` = la position dans le cube (±½) : la distance à l'arête de la face = le joint. */
  const VS=['attribute vec4 aI;attribute float aR;uniform float uN,uR,uS,uRot;varying vec3 vW,vN,vL;varying vec4 vK;varying float vRn;',
    'void main(){',
    '  float th=(aI.x+.5)/uN*6.2831853+uRot,ca=cos(th),sa=sin(th);vec3 Rr=vec3(ca,sa,0.),T=vec3(-sa,ca,0.),Z=vec3(0.,0.,1.);float k=aI.w;',   // uRot : l'anneau tourne, très lentement, sur son axe
    '  float arc=6.2831853*uR/uN,cur=(k>1.5&&k<2.5)?1.03:.88,cs=(k>.5&&k<1.5)||k>2.5?.95:.88;',     // le cœur est continu (les écailles laissent leurs joints) ; une bobine est un peu plus pleine
    '  vec3 sz=vec3(arc*cur,uS*cs,uS*cs),c=Rr*(uR+aI.y*uS)+Z*(aI.z*uS);',
    '  vec3 p=c+T*(position.x*sz.x)+Rr*(position.y*sz.y)+Z*(position.z*sz.z);',
    '  vec3 n=T*normal.x+Rr*normal.y+Z*normal.z;vec4 wp=modelMatrix*vec4(p,1.);',
    '  vW=wp.xyz;vN=normalize(mat3(modelMatrix)*n);vL=position;vK=vec4(k,aI.y,aI.z,aI.x/uN);vRn=aR;gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n');
  const OCC=['  vec3 ro=cameraPosition,rd=vW-ro;float len=length(rd);rd/=len;vec3 oc=ro-uPC;float b=dot(oc,rd),cc=dot(oc,oc)-uPR*uPR,h=b*b-cc;',
    '  if(h>0.){float ts=-b-sqrt(h);if(ts>0.&&ts<len)discard;}'].join('\n'); // derrière le globe : jeté (le globe n'écrit pas de profondeur)
  const FS=['uniform float uT,uOp,uPR,uPulse;uniform vec3 uPC,uSun;uniform vec4 uG,uH;varying vec3 vW,vN,vL;varying vec4 vK;varying float vRn;',
    'float h11(float x){return fract(sin(x*127.1)*43758.5453);}',
    'void main(){',
    '  vec3 a=abs(vL);float m=max(a.x,max(a.y,a.z));vec3 d=vec3(.5)-a;',
    '  float e=a.x>=m-1e-3?min(d.y,d.z):(a.y>=m-1e-3?min(d.x,d.z):min(d.x,d.y)),fw=fwidth(e);',     // la distance au bord de la face où l on est (les dérivées AVANT le discard)
    OCC,
    '  vec3 N=normalize(vN);float joint=1.-smoothstep(.012,.012+max(.04,fw*1.5),e);',                // le JOINT : un liseré FIN allumé le long de chaque arête
    '  float cen=smoothstep(0.,.5,e),k=vK.x,ph=vK.w,dif=max(dot(N,uSun),0.),ter=max(dot(N,normalize(uPC-vW)),0.);',                  // cen : 0 au bord de la face, 1 en son milieu
    '  float onde=.5+.5*sin(ph*31.4159-uT*2.4),paq=pow(max(sin(ph*18.8496+uT*1.3),0.),14.),etin=step(.988,h11(vRn*91.7+floor(uT*5.)*7.31));',
    '  vec3 lime=vec3(.847,1.,.376),flam=vec3(.94,1.,.565),col;',                                     // la palette du CŒUR À FUSION (0xd8ff60 · 0xf0ff90)
    '  if(k<.5){float lum=.55+.45*onde+uPulse*.5+etin*1.5;',                                                                                            // une écaille de plasma : une vitre sombre, des joints allumés
    '    col=lime*(.04+.20*dif+.07*ter)*(.55+.9*cen)*uG.x+lime*joint*uG.y*lum+flam*paq*uG.w*(.25+.75*joint+.35*cen);}',                                 // …et les paquets de plasma qui les embrasent au passage
    '  else if(k>1.5&&k<2.5){col=flam*uH.x*(.9+.7*onde+1.6*paq+uPulse*.6+etin*1.5)*(.6+.4*joint);}',                                                    // le cœur : le fil blanc-citron
    '  else{float ch=.5+.5*sin(vK.w*50.2655-uT*3.2);vec3 fer=vec3(.050,.058,.075)*(.35+2.4*dif)+vec3(.04,.09,.18)*ter*.8;',                              // une bobine : du métal sombre
    '    col=fer+lime*joint*uH.y*(.25+1.2*ch)+(k>2.5?lime*uH.z*(.15+.5*ch)*(.5+.5*cen):vec3(0.));}',                                                    // …aux joints qui courent, aux coins de cristal
    '  gl_FragColor=vec4(col*uOp,1.);}'].join('\n');
  const mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,fog:false,extensions:{derivatives:true}});
  const cubes=new THREE.Mesh(g,mat);cubes.frustumCulled=false;cubes.name='anneau cubes';
  /* LE HALO : une coque lisse et ADDITIVE le long du tube — de loin, c'est elle qui lie les pixels en un seul trait de lumière. */
  const tg=new THREE.TorusGeometry(ANN.R,ANN.S*1.9,10,N>300?200:140),
    HFS=['uniform float uT,uOp,uPR,uPulse;uniform vec3 uPC;uniform vec4 uG;varying vec3 vW,vN,vL;varying vec4 vK;varying float vRn;',
    'void main(){',OCC,
    '  float f=pow(1.-abs(dot(normalize(vN),normalize(cameraPosition-vW))),1.5);float ph=atan(vL.y,vL.x)*.159155+.5;',   // au LISERÉ de la coque seulement : le milieu laisse voir les cubes
    '  float onde=.5+.5*sin(ph*31.4159-uT*2.4),paq=pow(max(sin(ph*18.8496+uT*1.3),0.),14.);',
    '  gl_FragColor=vec4(vec3(.847,1.,.376)*f*uG.z*(.10+.10*onde+.30*paq+uPulse*.15)*uOp,1.);}'].join('\n'),
    HVS=['uniform float uR;varying vec3 vW,vN,vL;varying vec4 vK;varying float vRn;',
    'void main(){vL=position;vK=vec4(0.);vRn=0.;vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
    hm=new THREE.ShaderMaterial({uniforms:U,vertexShader:HVS,fragmentShader:HFS,fog:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const halo=new THREE.Mesh(tg,hm);halo.frustumCulled=false;halo.renderOrder=3;halo.name='anneau halo';
  const root=new THREE.Group();root.add(cubes);root.add(halo);root.visible=false;root.name='anneau de fusion';planetGroup.add(root);
  return {root:root,cubes:cubes,halo:halo,U:U,n:n,tilt:ANN.tilt,boost:0,off:false,v:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],m:new THREE.Matrix4()};
})();
function anneauTick(t,dt9,ok){ // appelée par orbiteTick à chaque image (zéro allocation)
  const A=ANNEAU;if(!A)return;
  const vis=ok&&!A.off&&planetGroup.visible&&LVL.planete>.05;A.root.visible=vis;if(!vis)return;
  const U=A.U,pg=planetGroup;
  U.uT.value=t%4096;U.uPC.value.copy(pg.position);U.uPR.value=PLANET_R*pg.scale.x;U.uSun.value.copy(ORB.cle);A.boost+=((nitroOn?1:0)-A.boost)*Math.min(1,dt9*3);U.uPulse.value=skyU.uPulse.value+A.boost*.55;                      // le nitro nourrit le plasma (monte vite, retombe doucement)
  U.uOp.value=Math.min(1,LVL.planete/1.2);                                                         // elle s'éteint avec la planète au portail
  U.uRot.value=(t*.022)%6.2831853;                                                                 // un tour en 285 s : une bobine passe toutes les 36 s
  /* LE PLAN DE L'ANNEAU suit l'ŒIL : `dP` va de la caméra au centre de la planète (qui suit le cap, avec retard — voir lvlPlanete), `X` est la droite de l'écran, l'axe de
     l'anneau penche de `tilt` vers le haut : 0 = de face (un cercle), π/2 = par la tranche (un trait). La même vue de l'anneau à chaque virage. */
  const dP=A.v[0].subVectors(pg.position,camera.position).normalize(),X=A.v[1].crossVectors(dP,ORB.haut);
  if(X.lengthSq()<1e-6)X.set(1,0,0);X.normalize();
  const Uy=A.v[2].crossVectors(X,dP).normalize(),Z=A.v[3].copy(dP).multiplyScalar(Math.cos(A.tilt)).addScaledVector(Uy,Math.sin(A.tilt)).normalize();
  Uy.crossVectors(Z,X).normalize();                                                                // Y = Z × X (le repère reste droit)
  A.m.makeBasis(X,Uy,Z);A.root.quaternion.setFromRotationMatrix(A.m);
}
window.dbgAnneau=function(o){ // (dev) dbgAnneau({tilt,R,S,fill,seam,halo,hot,core,coil,corner,off}) : règle l'anneau à chaud (R et S reconstruisent le halo) ; sans argument : l'état
  const A=ANNEAU;if(!A)return 'anneau éteint (?anneau=0)';
  if(o){if(o.tilt!=null)A.tilt=+o.tilt;if(o.off!=null){A.off=!!o.off;A.root.visible=!A.off&&planetGroup.visible&&LVL.planete>.05;} // `off` agit tout de suite : une paire AVANT | APRÈS dans UNE image du banc
    for(const c of [['fill','uG','x'],['seam','uG','y'],['halo','uG','z'],['hot','uG','w'],['core','uH','x'],['coil','uH','y'],['corner','uH','z']])if(o[c[0]]!=null)A.U[c[1]].value[c[2]]=+o[c[0]];
    if(o.S!=null||o.R!=null){if(o.S!=null)A.U.uS.value=+o.S;if(o.R!=null)A.U.uR.value=+o.R;A.halo.geometry.dispose();A.halo.geometry=new THREE.TorusGeometry(A.U.uR.value,A.U.uS.value*1.9,10,200);}}
  return {visible:A.root.visible,cubes:A.n,tilt:A.tilt,R:A.U.uR.value,S:A.U.uS.value,op:+A.U.uOp.value.toFixed(2),pr:Math.round(A.U.uPR.value),G:A.U.uG.value.toArray(),H:A.U.uH.value.toArray()};
};
