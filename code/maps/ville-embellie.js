/* ===== LA VILLE EMBELLIE (2026-10-20, Sacha : « apporter des améliorations visuelles à chaque map — des éléments, des textures, des lumières — sans que ce soit trop gourmand pour le téléphone ») =====
   LA VILLE reste LA VILLE : la nuit ROSE (intouchable, DA-CARCASH §3 bis), ses quatre temps, ses quatre teintes, sa piste au bit près — rien ici ne tire dans `rnd` ni dans `vr`
   (les rais ont leur générateur LOCAL `mulberry32(graine ^ 0x7A15E5)`). Cinq ajouts, tous DANS le rose et les couleurs de la teinte (l'accent `NEON[0]`, remappé avec elle) :
   · LES RAIS DE PROJECTEUR (pilier 2 · la lumière-vedette, pilier 4 · le détail vivant) : quelques faisceaux montent des toits lointains (380 à 1 100 m de la route, jamais dans le couloir) et
     balaient lentement le ciel — rose de la teinte (clé) et cyan #3EE8FF (remplissage), un sur sept en OR sodium (l'éclat CASH). UNE géométrie fusionnée (1 appel de dessin), UN programme de
     shader, zéro lumière : le tube est un cylindre ouvert dont le shader calcule l'épaisseur traversée (cœur clair, bords fondus), le balayage se fait au sommet d'après CITY.uT (zéro travail
     processeur par image) ; additifs, fondus de près (pas de grand voile près de l'œil) et de très loin ;
   · L'ÉCHO DES NÉONS DANS LE VERRE (pilier 3 · la matière) : dans les tours, le verre ÉTEINT renvoie des bandes verticales de la teinte et de cyan, plus fortes sous l'œil (la rue) que
     plus haut ; le noir plat des grandes baies devient un verre qui vit (palier MOYEN et RÉCENT — au palier ANCIEN le verre garde son ancien calcul) ;
   · LES ÉTAGES TECHNIQUES (pilier 3) : une tour haute sur deux et demie (40 %) porte, tous les 12 à 21 étages, une BANDE de LED continue (teinte, cyan ou, une fois sur cinq, or) : le rythme d'un
     vrai gratte-ciel, et ça se lit de loin quand les fenêtres se fondent en lueur ; mêmes bandes sur les géantes de verre (leur aplat prend des étages) ;
   · L'OR (pilier 5 · l'éclat CASH, rare) : une enseigne verticale sur dix passe à l'or sodium, un panneau holographique sur seize devient la pièce ₿ ; un rai sur sept est or.
   Budget : voir le rapport (calls / triangles / programmes mesurés). Paliers : `PAL.B.vilRaisPas` (pas de route entre deux rais, m) · `vilRaisSeg` (côtés du tube).
   `dbgVilleEmb()` (état) · `dbgVilleEmb('rais',0|1)` (montrer / cacher les rais) · `dbgVilleEmb('fac',0|1)` (écho et bandes des façades coupés / rendus). */
PAL.B.vilRaisPas=[3200,1900,1200];PAL.B.vilRaisSeg=[5,6,8]; /* [ANCIEN, MOYEN, RÉCENT] : ~5 · 8 · 13 rais sur 16 km de piste ; 5 · 6 · 8 côtés */
CITY.uEmb={value:1}; /* 1 = les façades embellies (écho du verre, étages techniques) · 0 = comme avant (banc) */
const VEMB={mat:null,mesh:null,n:0,tris:0,pos:[],cy:[.24,.91,1],or:[1,.78,.34]};
/* L'ÉCHO DANS LE VERRE (tours de béton — branche GTA, `gl9` = ce que le verre éteint renvoie) : à poser JUSTE APRÈS la déclaration de `gl9`. `ux9` : le long de la façade (m) ·
   bandes de 8 à 24 m, un quart d'entre elles seulement, en cloche (fondues aux bords) · `gr9` : fort sous l'œil (la rue et ses néons), nul 280 m plus haut. */
const VEMB_ECHO='float ux9=(an.x>an.z?vLoc9.z:vLoc9.x),bw9=8.+s2*16.,gb9=floor(ux9/bw9),hb9=fract(sin(gb9*12.9898+vSeed9*78.233)*43758.5453),sb9=sin(3.14159*fract(ux9/bw9)),'+
  'pk9=smoothstep(.5,.9,hb9)*sb9*sb9,gr9=smoothstep(280.,-140.,vW9.y-uCamE9.y);'+
  'gl9+=mix(uAcc9,vec3(.24,.91,1.),step(.5,fract(hb9*7.3)))*pk9*gr9*.38*(1.-.5*bur)*uEmb9;';
/* LES ÉTAGES TECHNIQUES (tours de béton) : dans le bloc des façades GTA (G9 = la nuit) — une tour sur 2,5 (s4 < .40, l'autre bloc, s4 > .8, porte déjà les LED des arêtes), de plus de 110 m.
   Période np étages, le filet en fait 0,8 (et son halo ~1,5) ; la hauteur se lit depuis le pied du volume (les retraits emboîtés partagent le pied : mêmes étages). Au loin (la bande sous le pixel) : sa moyenne. */
const VEMB_BANDE='if(s4<.40&&vSc9.y>110.){float np=12.+floor(s2*10.),yy9=vB9/(cel.y*np),fy9=max(fwidth(yy9),1e-5),dq=abs(fract(yy9+.5)-.5),hbd=.4/np;'+
  'float lb=1.-smoothstep(hbd,hbd+fy9*1.5,dq);lb=mix(lb,2.*hbd,smoothstep(.4,1.5,fy9));lb+=.20*exp(-dq*np/1.2)*(1.-smoothstep(.4,1.5,fy9));'+ /* un filet de 0,8 étage et son halo (~1,5 étage) : une LED, pas un panneau */
  'vec3 bc9=s5>.8?vec3(1.,.78,.34):mix(uAcc9,vec3(.24,.91,1.),step(.5,s5));gl_FragColor.rgb+=bc9*lb*1.05*uCour9*G9*uEmb9;}';
/* LES RAIS — la matière : un tube ouvert (cos, sin, t) dont le sommet pose le rai (pied `aB.xyz`, longueur `aB.w`, inclinaison `aP.x`, phase `aP.y`, vitesse `aP.z`, couleur `aP.w`),
   le balayage : un cône lent autour de la verticale (+ un léger tangage). Au pixel : l'épaisseur traversée (1 au milieu du tube, 0 au bord), un cœur qui s'éteint avec la hauteur. */
function villeRaisMat(){
  if(VEMB.mat)return VEMB.mat;
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    uniforms:{uT:CITY.uT,uCa:{value:new THREE.Vector3(1,.25,.78)},uCb:{value:new THREE.Vector3(.24,.91,1)},uCg:{value:new THREE.Vector3(1,.78,.34)},uK:{value:1}},
    vertexShader:'attribute vec4 aB;attribute vec4 aP;uniform float uT;varying vec3 vR,vD,vW;varying float vT,vK;'+
      'void main(){float az=aP.y+uT*aP.z,tl=aP.x+.05*sin(uT*.17+aP.y*3.);vec3 d=vec3(sin(tl)*cos(az),cos(tl),sin(tl)*sin(az));'+
      'vec3 u=normalize(cross(d,vec3(0.,0.,1.))),v=cross(d,u);float t=position.z;vec3 rad=u*position.x+v*position.y;'+
      'vec3 w=aB.xyz+d*(aB.w*t)+rad*mix(4.,40.,t);vR=rad;vD=d;vW=w;vT=t;vK=aP.w;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}',
    fragmentShader:'uniform vec3 uCa,uCb,uCg;uniform float uK;varying vec3 vR,vD,vW;varying float vT,vK;'+
      'void main(){vec3 V=cameraPosition-vW;float dist=length(V);V/=dist;vec3 Vp=V-vD*dot(V,vD);float lp=length(Vp);'+
      'float c=abs(dot(normalize(vR),Vp))/max(lp,1e-3);'+ /* l'épaisseur du tube traversée par le regard : 1 au milieu, 0 au bord */
      'float len=1.-vT,a=pow(c,1.7)*pow(len,1.25)*smoothstep(0.,.05,vT)*smoothstep(.04,.3,lp)*smoothstep(240.,720.,dist)*(1.-.65*smoothstep(1400.,3000.,dist));'+
      'vec3 col=vK<.5?uCa:vK<1.5?uCb:uCg;gl_FragColor=vec4(col*(.55+.9*len*len),a*.42*uK);}'});
  m.customProgramCacheKey=function(){return 'villeRais1';};m.dispose=function(){}; /* partagé : le rebuild d'une piste ne le jette pas (comme les matières de la ville) */
  VEMB.mat=m;return m;
}
function villeRaisGeo(R){ /* R : x, y, z (le pied), longueur, inclinaison, phase, vitesse, couleur — par rai (8 nombres) */
  const n=R.length/8,seg=PAL.b('vilRaisSeg',8),nv=n*seg*2,P=new Float32Array(nv*3),B=new Float32Array(nv*4),Q=new Float32Array(nv*4),I=[];
  for(let k=0;k<n;k++){const o=k*8,v0=k*seg*2;
    for(let j=0;j<seg;j++){const a=j/seg*6.283185,ca=Math.cos(a),sa=Math.sin(a);
      for(let r=0;r<2;r++){const v=v0+j*2+r;P[v*3]=ca;P[v*3+1]=sa;P[v*3+2]=r;B[v*4]=R[o];B[v*4+1]=R[o+1];B[v*4+2]=R[o+2];B[v*4+3]=R[o+3];Q[v*4]=R[o+4];Q[v*4+1]=R[o+5];Q[v*4+2]=R[o+6];Q[v*4+3]=R[o+7];}}
    for(let j=0;j<seg;j++){const a=v0+j*2,b=v0+((j+1)%seg)*2;I.push(a,b,a+1,b,b+1,a+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aB',new THREE.BufferAttribute(B,4));g.setAttribute('aP',new THREE.BufferAttribute(Q,4));g.setIndex(I);
  return g;}
function villeRaisChauffe(){ /* un rai de rien, pour compiler le programme au menu (voir villeChauffe) — 0 programme compilé en course */
  const o=new THREE.Mesh(villeRaisGeo([0,0,0,100,0,0,0,0]),villeRaisMat());o.frustumCulled=false;return o;}
/* LA POSE (appelée par buildVoxCity, une fois la ville bâtie) : le long de la piste, une station tous les `pas` mètres ; à chacune, un toit HAUT (≥ 180 m) à 380-1 100 m de l'axe et au plus
   520 m au-dessus de la route (le rai se lit depuis la route, il part d'un toit qu'on voit), pas deux rais à moins de 300 m l'un de l'autre. Hasard LOCAL : la piste et la ville ne bougent pas. */
function villeRais(root,seed,corps,genre,NEON){
  VEMB.mesh=null;VEMB.n=0;VEMB.tris=0;VEMB.pos=[];
  if(!(NP>1)||!(L>0))return;
  const pas=PAL.b('vilRaisPas',1200),rg=mulberry32(((seed|0)^0x7A15E5)>>>0),tops=new Map();
  for(let i=0;i<genre.length;i++){if(genre[i]!==0)continue;const o=i*6,h=corps[o+4];if(h<180)continue; /* les retraits d'une tour partagent son centre : on garde le plus haut (le toit de la tour) */
    const top=corps[o+1]+h/2,k=Math.round(corps[o])+','+Math.round(corps[o+2]),a=tops.get(k);if(!a||top>a[1])tops.set(k,[corps[o],top,corps[o+2]]);}
  const T9=Array.from(tops.values()),R=[],ns=Math.max(1,Math.round(L/pas));
  for(let k=0;k<ns;k++){
    const ip=Math.min(NP-1,Math.max(0,Math.floor(((k+.5+(rg()-.5)*.5)/ns)*(NP-1)))),p=pts[ip],C=[];
    for(let pass=0;pass<2&&!C.length;pass++){const d0=pass?300:380,d1=pass?1500:1100,hMin=pass?-40:30;
      for(const t of T9){const dx=t[0]-p.x,dz=t[2]-p.z,d2=dx*dx+dz*dz,dy=t[1]-p.y;if(d2<d0*d0||d2>d1*d1||dy<hMin||dy>520)continue;
        let ok=true;for(let q=0;q<R.length;q+=8){const ex=R[q]-t[0],ez=R[q+2]-t[2];if(ex*ex+ez*ez<300*300){ok=false;break;}}if(ok)C.push(t);}}
    if(!C.length){rg();rg();rg();rg();rg();continue;}
    const t=C[(rg()*C.length)|0],kd=(k%7===3)?2:(rg()<.5?0:1); /* l'OR : un rai sur sept (le 4e, le 11e…) — le reste, la teinte (clé) ou le cyan (remplissage) */
    R.push(t[0],t[1]+1,t[2],1300+rg()*500,(8+rg()*12)*Math.PI/180,rg()*6.2832,(.022+rg()*.05)*(rg()<.5?-1:1),kd);}
  if(!R.length)return;
  const m=villeRaisMat(),U=m.uniforms,a=NEON[0];U.uCa.value.set(Math.min(1,a.r*1.05),Math.min(1,a.g*1.05),Math.min(1,a.b*1.05)); /* la clé : l'accent de la teinte (NEON[0] : magenta, ou son remappage) */
  U.uCb.value.set(VEMB.cy[0],VEMB.cy[1],VEMB.cy[2]);U.uCg.value.set(VEMB.or[0],VEMB.or[1],VEMB.or[2]);
  const g=villeRaisGeo(R),me=new THREE.Mesh(g,m);me.frustumCulled=false;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=2;me.name='ville rais';
  root.add(me);trackMeshes.push(me);VEMB.mesh=me;VEMB.n=R.length/8;VEMB.tris=g.index.count/3;for(let q=0;q<R.length;q+=8)VEMB.pos.push([Math.round(R[q]),Math.round(R[q+1]),Math.round(R[q+2]),R[q+7]]);
}
window.dbgVilleEmb=function(k,v){
  if(k==='rais'&&VEMB.mesh)VEMB.mesh.visible=v==null?!VEMB.mesh.visible:!!v;
  if(k==='fac')CITY.uEmb.value=v==null?(CITY.uEmb.value?0:1):+v;
  return {rais:VEMB.n,visible:!!(VEMB.mesh&&VEMB.mesh.visible),triangles:VEMB.tris,fac:CITY.uEmb.value,palier:PAL.n,pas:PAL.b('vilRaisPas',0),cotes:PAL.b('vilRaisSeg',0),pos:VEMB.pos,
    programmes:renderer.info.programs?renderer.info.programs.length:null,ville:CITY.n};};
