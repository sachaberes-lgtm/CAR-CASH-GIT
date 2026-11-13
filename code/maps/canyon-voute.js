/* ===== LA VOÛTE (2026-11-13, Sacha : « la route pourrait être torsadée et longer les parois des canyons par moments, jouer sur le côté sans dessus dessous ») =====
   Le relief du canyon est un TERRAIN (une hauteur par point) : il ne sait pas faire un plafond. La route ne peut donc passer à l'envers que dans une STRUCTURE — un TUBE de grès cuit autour d'elle,
   comme la mine, l'arche ou le tunnel d'arrivée. Ici le tube TOURNE AVEC LA DALLE : sa section (un rectangle arrondi, une super-ellipse de 44 m de demi-largeur et 26 m de demi-hauteur, son fond à 2 m
   sous la surface de la route) est fixe dans le repère de la route — quand la dalle fait un tour complet (cyVouBank : 0 → 360°, 10 s de route), le tube tourne autour d'elle : on roule sur le fond,
   sur une paroi, au plafond, sur l'autre paroi, et de nouveau sur le fond. Le chemin, lui, reste droit (c'est le « coucher de la dalle » : la route ne dérive pas).
   · `cyVoute([s0, s1])` bâtit le maillage (cuit, sans éclairage : couleurs de sommet — le dedans est sombre, les deux bouches éclairées, le dehors au soleil) : une peau intérieure, une peau
     extérieure à 14 m, un anneau de façade à chaque bout. Il se pose dans CY.grp (libéré avec le reste) et se relit dans CY.vouT = {s0, s1}.
   · `cyVouteHeurt(p, V)` : en vol, la roche tue — un point dont la section (g > 1) sort du creux sans sortir de la coque (g < 5,5). Les deux bouches sont ouvertes (rien à s < s0 ni à s > s1).
   · le gabarit `tonneau` de cyBatitG écarte le relief (parois à 170 m, rivière à 120 m) et coupe le plan de roche des murs (S.mu = 0) ; `?sans=canyonvoute` retire la pièce.
   Console : `dbgCanyonVoute()` (où, combien) · `dbgCanyonVoute('test')` (les points de la section contre le creux) · `dbgCanyonVoute('vue', k)` (une photo de l'intérieur, au tiers k/4 du tube). */
const CY_VOU={A:44,B:26,hc:20,p:4,ep:14,R:40,G2:5.5,m:null};
function cyVouMat(){if(CY_VOU.m)return CY_VOU.m;const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:true});m.dispose=function(){};CY_VOU.m=m;return m;}
/* la section du creux : g(lat, up) ≤ 1 dedans (lat : en travers, up : le long de la normale de la dalle, 0 = la surface de la route) */
function cyVouG(lat,up){const V=CY_VOU;return Math.pow(Math.abs(lat)/V.A,V.p)+Math.pow(Math.abs(up-V.hc)/V.B,V.p);}
/* (V3, la supervision après les photos : « la bouche ressemble à un autocollant flou… l'intérieur est un flou olive et gris ») LE TUBE EN ROCHE : des FACETTES (une couleur par
   case : les gros pixels des parois), la couleur des STRATES à la hauteur de chaque case, des ANNEAUX (deux rangées sur quatre plus sombres : la vitesse et le sens du roulis
   se lisent), une LUEUR chaude qui monte vers la sortie (le soleil y entre), et à chaque bouche une LÈVRE de roche en relief — un collier déchiqueté qui déborde de la façade,
   plus épais en haut (le linteau), dans l'ombre vers le dedans. Une seule matière, sans lumière : les couleurs sont cuites. */
function cyVouteV3(iv){
  const V=CY_VOU,len=iv[1]-iv[0];if(!(len>60)||!CY.grp)return null;
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},step=Math.max(9,len/220),n=Math.ceil(len/step),R=V.R,P=[],C=[],st=[0,0,0],TW=[1,.80,.50];
  const hsh=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  const ray=[];for(let k=0;k<R;k++){const a=2*Math.PI*k/R,c=Math.cos(a),s=Math.sin(a);ray.push([c,s,1/Math.pow(Math.pow(Math.abs(c),V.p)+Math.pow(Math.abs(s),V.p),1/V.p)]);}
  const pt=(lat,up,fw)=>[F9.p.x+F9.b.x*lat+F9.n.x*up+F9.t.x*fw,F9.p.y+F9.b.y*lat+F9.n.y*up+F9.t.y*fw,F9.p.z+F9.b.z*lat+F9.n.z*up+F9.t.z*fw];
  const anneau=(i,m)=>{frameAt(iv[0]+len*i/n,F9);const o=[];for(let k=0;k<R;k++){const ry=ray[k],j=m?(hsh(i*.37+1,k*1.3)-.5)*5:0,A=V.A+m*V.ep+j,B=V.B+m*V.ep+j;o.push(pt(A*ry[2]*ry[0],V.hc+B*ry[2]*ry[1],0));}return o;};
  const quad=(a,b,c,d,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(let q=0;q<6;q++)C.push(col[0],col[1],col[2]);};
  const teinte=(y,br,w)=>{cyT2Strate(y,st);const o=[0,0,0];for(let c=0;c<3;c++){const v=st[c]*br;o[c]=Math.min(1,v*(1-w)+TW[c]*br*1.25*w);}return o;};
  let A0=[anneau(0,0),anneau(0,1)];const Z0=A0;
  for(let i=1;i<=n;i++){const A1=[anneau(i,0),anneau(i,1)],d0=len*(i-.5)/n,jour=Math.exp(-Math.min(d0,len-d0)/70),lueur=Math.exp(-(len-d0)/190),bande=((i>>1)&1)?.78:1;
    for(let k=0;k<R;k++){const k1=(k+1)%R,h=hsh(i,k);
      quad(A0[0][k],A1[0][k],A1[0][k1],A0[0][k1],teinte((A0[0][k][1]+A1[0][k1][1])/2,(.20+.70*jour+.30*lueur)*(.84+.3*h)*bande,Math.min(.8,lueur*.9))); /* le dedans */
      quad(A0[1][k],A0[1][k1],A1[1][k1],A1[1][k],teinte((A0[1][k][1]+A1[1][k1][1])/2,.70+.3*h,0));} /* le dehors, au soleil */
    A0=A1;}
  const ZN=A0;
  for(const e of [0,1]){const iE=e?n:0,rin=e?ZN[0]:Z0[0],sgT=e?1:-1,NR=4,rows=[rin];frameAt(iv[0]+len*iE/n,F9); /* LA LÈVRE : quatre rangées de cases du creux au collier déchiqueté, en avant de la
       bouche, plus épaisse en haut (le linteau), plus sombre vers le dedans (l'ombre s'y enfonce) — d'une seule rangée, ses longs quartiers alternés se lisaient comme un soleil */
    for(let r9=1;r9<=NR;r9++){const u=r9/NR,o=[];for(let k=0;k<R;k++){const ry=ray[k],lin=ry[1]>.35?(12+14*(ry[1]-.35))*u:0,j=(hsh(iE*7+r9,k)-.5)*(3+6*u),A=V.A+(V.ep+12)*u+lin+j,B=V.B+(V.ep+12)*u+lin+j;
        o.push(pt(A*ry[2]*ry[0],V.hc+B*ry[2]*ry[1],sgT*(u*(4+hsh(iE+3,k)*6)+(hsh(iE+r9*3,k)-.5)*3)));}rows.push(o);}
    for(let r9=0;r9<NR;r9++){const a=rows[r9],b=rows[r9+1];for(let k=0;k<R;k++){const k1=(k+1)%R;quad(a[k],b[k],b[k1],a[k1],teinte((a[k][1]+b[k1][1])/2,(.34+.40*(r9+1)/NR)*(.86+.24*hsh(iE*13+r9,k)),0));}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyVouMat());m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);
  return {s0:iv[0],s1:iv[1],tri:P.length/9};}
function cyVoute(iv){
  if(CY_V3.on)return cyVouteV3(iv);
  const V=CY_VOU,len=iv[1]-iv[0];if(!(len>60)||!CY.grp)return null;
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},step=Math.max(10,len/200),n=Math.ceil(len/step),R=V.R,P=[],C=[],I=[];
  const hsh=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  const ray=[];for(let k=0;k<R;k++){const a=2*Math.PI*k/R,c=Math.cos(a),s=Math.sin(a);ray.push([c,s,1/Math.pow(Math.pow(Math.abs(c),V.p)+Math.pow(Math.abs(s),V.p),1/V.p)]);}
  const roche=[.70,.44,.29],st9=[0,0,0],V3T=typeof CY_V3!=='undefined'&&CY_V3.on; /* le grès : un ocre rosé — (V3) la COULEUR DES STRATES du canyon à la hauteur de chaque sommet (cyT2Strate, comme le relief) : orange uni, le tube se lisait comme un objet posé là */
  for(let i=0;i<=n;i++){frameAt(iv[0]+len*i/n,F9);const d0=len*i/n,jour=Math.exp(-Math.min(d0,len-d0)/55);
    for(let k=0;k<R;k++){const ry=ray[k],bande=.9+.14*Math.sin(i*.55+ry[1]*5+hsh(Math.floor(i/3),k>>2)*3);
      for(let m=0;m<2;m++){const A=V.A+m*V.ep,B=V.B+m*V.ep,lat=A*ry[2]*ry[0],up=V.hc+B*ry[2]*ry[1],b=m?(.78+.3*hsh(i,k))*bande:(.30+.62*jour)*(.88+.24*hsh(i,k))*bande; /* dedans : sombre, clair aux bouches ; dehors : au soleil */
        const y9=F9.p.y+F9.b.y*lat+F9.n.y*up;P.push(F9.p.x+F9.b.x*lat+F9.n.x*up,y9,F9.p.z+F9.b.z*lat+F9.n.z*up);const rc=V3T?cyT2Strate(y9,st9):roche,k9=V3T?.82:1;C.push(Math.min(1,rc[0]*b*k9),Math.min(1,rc[1]*b*k9),Math.min(1,rc[2]*b*k9));}}}
  const id=(i,k,m)=>(i*R+(k%R))*2+m;
  for(let i=0;i<n;i++)for(let k=0;k<R;k++)for(let m=0;m<2;m++){const a=id(i,k,m),b9=id(i,k+1,m),c=id(i+1,k+1,m),d=id(i+1,k,m);I.push(a,b9,c,a,c,d);}
  for(const e of [0,n])for(let k=0;k<R;k++){const a=id(e,k,0),b9=id(e,k+1,0),c=id(e,k+1,1),d=id(e,k,1);I.push(a,b9,c,a,c,d);} /* l'anneau de façade : du creux à la coque */
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyVouMat());m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);
  return {s0:iv[0],s1:iv[1],tri:I.length/3};}
const CY_VF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},CY_VD=new THREE.Vector3();
function cyVouteHeurt(p,V){const S=CY.S;if(!V||!S)return false;
  const i0=Math.max(0,Math.floor(V.s0/S.ds)-1),i1=Math.min(S.n-1,Math.ceil(V.s1/S.ds)+1);let bi=-1,bd=1e18;
  for(let i=i0;i<=i1;i++){const d=(p.x-S.x[i])**2+(p.y-S.y[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>130*130)return false;const s9=bi*S.ds;if(s9<V.s0||s9>V.s1)return false;
  frameAt(s9,CY_VF);CY_VD.subVectors(p,CY_VF.p);const g=cyVouG(CY_VD.dot(CY_VF.b),CY_VD.dot(CY_VF.n));return g>1&&g<CY_VOU.G2;}
window.dbgCanyonVoute=function(k,a,c){ /* c : le numéro du tube (la phrase du mur en pose un par route, la voûte d'avant un) */
  if(!CY.on)return 'pas de canyon';
  if(k==='vueS'){ /* (V3) dbgCanyonVoute('vueS', s) : l'œil du joueur à l'abscisse s de la piste — derrière la caisse, dans le repère de la DALLE (sur la paroi, tête en bas) */
    if(started&&!gameOver&&!paused)togglePause();const F8={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(Math.max(0,Math.min(L-1,+a||0)),F8);
    camera.position.copy(F8.p).addScaledVector(F8.n,9).addScaledVector(F8.t,-34);camera.up.copy(F8.n);camera.lookAt(F8.p.x+F8.t.x*120+F8.n.x*6,F8.p.y+F8.t.y*120+F8.n.y*6,F8.p.z+F8.t.z*120+F8.n.z*6);camera.fov=60;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    return {s:Math.round(+a||0),ny:+F8.n.y.toFixed(2),rouliDeg:Math.round(Math.atan2(F8.b.y,F8.n.y)*57.2958)};}
  const VL=CY.vouT||[],V=VL[Math.max(0,Math.min(VL.length-1,c|0))];if(!V)return {vou:CY.vou||null,tube:false};
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},mid=(V.s0+V.s1)/2,q=new THREE.Vector3();
  const pt=(s9,lat,up)=>{frameAt(s9,F9);return q.copy(F9.p).addScaledVector(F9.b,lat).addScaledVector(F9.n,up).clone();};
  if(k==='test'){const r={};for(const c of [['centre',0,2],['bord',26,2],['haut',0,40],['dans le mur',60,20],['sous la dalle',0,-12],['hors du tube',0,200]])r[c[0]]=cyVouteHeurt(pt(mid,c[1],c[2]),V);return r;}
  if(k==='vue'){ /* dbgCanyonVoute('vue', j) : l'œil dans la dalle, au quart j/4 du tube, regard vers l'avant — la section tourne avec le roulis, la caméra aussi */
    if(started&&!gameOver&&!paused)togglePause();const s9=V.s0+(V.s1-V.s0)*Math.max(0,Math.min(1,(a==null?2:a)/4));frameAt(s9,F9);
    camera.position.copy(F9.p).addScaledVector(F9.n,9).addScaledVector(F9.t,-34);camera.up.copy(F9.n);camera.lookAt(F9.p.x+F9.t.x*120+F9.n.x*6,F9.p.y+F9.t.y*120+F9.n.y*6,F9.p.z+F9.t.z*120+F9.n.z*6);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
    return {s:Math.round(s9),ny:+F9.n.y.toFixed(2),rouliDeg:Math.round(Math.atan2(F9.b.y,F9.n.y)*57.2958)};}
  /* l'état : les abscisses, le triangle, et le profil du roulis (ny de la dalle tous les dixièmes du tube) */
  const roulis=[];for(let j=0;j<=10;j++){frameAt(V.s0+(V.s1-V.s0)*j/10,F9);roulis.push(+F9.n.y.toFixed(2));}
  return {vou:CY.vou,tube:true,tubes:VL.map(function(v){return [Math.round(v.s0),Math.round(v.s1)];}),s0:Math.round(V.s0),s1:Math.round(V.s1),long:Math.round(V.s1-V.s0),tri:V.tri,nY:roulis};};
