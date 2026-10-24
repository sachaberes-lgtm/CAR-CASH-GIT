/* LE SOLEIL HORS CADRE — dans l'espace, pas d'air pour diffuser : le soleil est un point aveuglant, et ce qu'on voit de lui, c'est ce
   que l'OBJECTIF en fait. Il est sur la gauche, juste hors champ (ORB.cle) : son VOILE déborde par le bord de l'image, et un TRAIT
   anamorphique bleuté court à sa hauteur. S'il entre dans le cadre (vrille, looping), c'est une étoile à cœur blanc et quatre
   branches. Deux quads en espace écran, additifs, sans profondeur, dessinés en dernier : seuls les pixels du voile se paient. */
const FLARE=(function(){
  const P=[],K=[],I=[];for(let k=0;k<2;k++){P.push(-1,-1,0,1,-1,0,1,1,0,-1,1,0);K.push(k,k,k,k);I.push(k*4,k*4+1,k*4+2,k*4,k*4+2,k*4+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.setIndex(I);
  const m=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
    uniforms:{uS:{value:new THREE.Vector2(-1.6,.5)},uAsp:{value:1},uOp:{value:0}},
    vertexShader:['attribute float aK;uniform vec2 uS;uniform float uAsp;varying vec2 vQ;varying float vK;',
      'void main(){vK=aK;vQ=position.xy;vec2 c=uS,h=vec2(1.45/uAsp,1.45);',              // le voile : un disque d 1,45 hauteur d écran autour du soleil
      '  if(aK>.5){c=vec2(0.,uS.y);h=vec2(1.,.05);}',                                         // le trait : toute la largeur, à la hauteur du soleil
      '  gl_Position=vec4(c+position.xy*h,0.,1.);}'].join('\n'),
    fragmentShader:['uniform vec2 uS;uniform float uAsp,uOp;varying vec2 vQ;varying float vK;',
      'void main(){vec3 col;',
      '  if(vK<.5){float r=length(vQ)*1.45,a=abs(vQ.x),b=abs(vQ.y);',
      '    float br=(exp(-b*260.)*exp(-a*5.)+exp(-a*260.)*exp(-b*5.))*.8;',                      // les branches (si le soleil entre dans le cadre)
      '    col=vec3(1.,.94,.84)*(exp(-r*2.2)*.21+exp(-r*r*6.)*.27)+vec3(1.,.97,.9)*(exp(-r*r*900.)*4.+br);}',
      '  else{col=vec3(.50,.70,1.)*exp(-vQ.y*vQ.y*9.)*exp(-abs(vQ.x-uS.x)*1.1)*.42;}', // le trait anamorphique, bleuté
      '  gl_FragColor=vec4(col*uOp,1.);}'].join('\n')});
  const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.visible=false;me.renderOrder=9999;scene.add(me);return me;})();
/* (2026-09-30) LES PASSAGES OBLIGÉS : aucun satellite ne se pose là où l'on n'a pas le choix de sa route — le couloir d'un tremplin, les
   abords d'un trou. */
function satPassage(s9){
  return false;
}
function orbiteBuild(seed){ // appelée par buildTrack : pose Starlink et débris autour de la piste d'orbite (et les retire partout ailleurs)
  const c=LVL.cur;ORB.actif=!!(c&&c.id==='espace'&&!PARK.on&&NP>1);if(ORB.actif){ORB.lune=!c.sansLune;ORB.capOk=false;} // en quittant l'orbite la lune reste allumée : elle s'efface avec le fondu du niveau (LVL.espace)
  for(let i=0;i<SATS.length;i++){SATS[i].count=0;SATS[i].visible=false;}GLINT.count=0;GLINT.visible=false;
  if(!ORB.actif)return;
  if(!ORB.peinte)lunePeint();
  const t00=performance.now();
  const r=mulberry32(seed^0x0A57E401); // flux DÉRIVÉ : la piste en aval ne bouge pas
  // LA GRILLE DE LA PISTE (un point tous les ~10 m, cases de 150 m) : un objet n'approche AUCUNE portion de route
  const HB=150,grille=new Map(),pas=Math.max(1,Math.round(10/(L/(NP-1))));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,ys=0,ny=0;
  const cle=(gx,gz)=>(gx+4096)*8192+gz+4096; // une clé NUMÉRIQUE par case (les chaînes coûtaient la moitié de la pose)
  for(let i=0;i<NP;i+=pas){const p=pts[i],k=cle(Math.floor(p.x/HB),Math.floor(p.z/HB));let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);
    if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;ys+=p.y;ny++;}
  const libre=(x,y,z,Rl)=>{const rr=Math.ceil(Rl/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB),R2=Rl*Rl;
    for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const a=grille.get(cle(bx+dx,bz+dz));if(!a)continue;
      for(let j=0;j<a.length;j++){const p=pts[a[j]],ex=p.x-x,ey=p.y-y,ez=p.z-z;if(ex*ex+ey*ey+ez*ez<R2)return false;}}
    return true;};
  const cnt=[0,0,0];
  const pose=(k,x,y,z,rad,spd,vr,q)=>{const im=SATS[k],i=cnt[k];if(i>=SAT_MAX[k])return -1;cnt[k]++;
    if(q)ORB.Q.copy(q);else ORB.Q.setFromEuler(ORB.E.set(r()*6.283,r()*6.283,r()*6.283));
    const fl=k===2?(vr===2?[1.6,.9,.45]:[1,.8,1]):[1,1,1]; // les tiges d'argent s'étirent
    ORB.S.set(rad*(.9+r()*.2)*fl[0],rad*(.9+r()*.2)*fl[1],rad*(.9+r()*.2)*fl[2]);if(k<2)ORB.S.set(rad,rad,rad); // un satellite garde ses proportions
    ORB.P.set(x,y,z);ORB.M.compose(ORB.P,ORB.Q,ORB.S);im.setMatrixAt(i,ORB.M);
    const ax=r()*2-1,ay=r()*2-1,az=r()*2-1,l=Math.hypot(ax,ay,az)||1,A=im.geometry.attributes;
    A.aRot.setXYZW(i,ax/l,ay/l,az/l,spd*(r()<.5?-1:1));A.aVar.setXYZW(i,r(),r()*6.283,vr,0);A.aMov.setXYZW(i,0,0,0,0);A.aTr.setXY(i,0,1);return i;};
  const tire=w=>{let u=r()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){u-=w[i];if(u<=0)return i;}return w.length-1;};
  const dS=L/(NP-1);
  /* 0 bis. LES SATELLITES QUI FLOTTENT AU BORD DE LA ROUTE (2026-10-17 soir, Sacha : « dans la map espace il y a des satellites sur la route, je
     voulais juste qu'ils flottent proche de la route »). Les obstacles de l'après-midi quittent la chaussée (ceux posés dessus sont retirés le 18/10) : les
     mêmes grands engins — Starlink de 18-26 m d'envergure, étage de fusée, satellite mort, pan de panneau, petit satellite d'or — DÉRIVENT à 4-16 m
     du bord, de 8 m sous la dalle à 16 m au-dessus (repère de la route : F.b en travers, F.n vers le haut), et tournent lentement sur
     eux-mêmes. Trois figures : le SEUL (un côté), la PORTE (un de chaque côté, la route passe entre les deux) et la FILE (deux ou trois à la suite du
     même côté, en escalier). Décor pur : rien sur la chaussée, rien à percuter, les pièces ne s'écartent plus. `libre` les garde loin de TOUTES les
     autres portions de piste (un virage serré, un looping au-dessus) ; un quart des Starlink et un cinquième des débris au plus — les passants, le
     champ et les trains gardent leur part. */
  {const espK=Math.max(1,.45+.4*lvPiste()),M0=Math.round(SAT_MAX[0]*.25),M1=Math.round(SAT_MAX[1]*.2);
    const flotte=function(s9,sg,dh){if(satPassage(s9))return;
      const st=cnt[0]<M0&&(cnt[1]>=M1||r()<.6),k=st?0:1;if(!st&&cnt[1]>=M1)return;
      frameAt(s9,F);const rad=st?9+r()*4:7+r()*4,lat=ROAD_HALF+rad+4+r()*12,h=dh+(r()-.5)*4;
      const x=F.p.x+F.b.x*sg*lat+F.n.x*h,y=F.p.y+F.b.y*sg*lat+F.n.y*h,z=F.p.z+F.b.z*sg*lat+F.n.z*h;
      if(!libre(x,y,z,ROAD_HALF+rad+3.5))return; // sa propre route est à ≥ lat : ce test ne vise que les AUTRES portions
      pose(k,x,y,z,rad,.04+r()*.12,st?(r()<.5?0:1):tire([.30,.20,.25,.25]));};
    let sp=650+r()*200;
    while(sp<L-450){const f=tire([.45,.30,.25]),sg=r()<.5?-1:1,dh=-6+r()*20; // (banc) à −12 m sous la dalle, la caméra plongeante ne les voyait plus : la route les cachait
      if(f===0)flotte(sp,sg,dh);                                                   // LE SEUL
      else if(f===1){flotte(sp,-1,dh);flotte(sp+(r()-.5)*30,1,-6+r()*20);}         // LA PORTE
      else{const n=2+(r()<.4?1:0),e9=45+r()*30,mh=(r()-.5)*10;                     // LA FILE
        for(let j=0;j<n;j++)flotte(sp+j*e9,sg,dh+j*mh);sp+=(n-1)*e9;}
      sp+=(200+r()*200)*espK;}}
  // 1. LES PASSANTS : de grands Starlink au bord de la route, du côté EXTÉRIEUR du virage qui vient (ils ne cachent jamais la route qui tourne)
  {const pasP=(L-900)/SAT_PASS;
   for(let k=0;k<SAT_PASS;k++){const i=Math.min(NP-2,Math.round((420+pasP*(k+.15+r()*.7))/dS)),t9=T[i],hl=Math.hypot(t9.x,t9.z);
     const t2=T[Math.min(NP-1,i+Math.round(170/dS))],tr=t9.z*t2.x-t9.x*t2.z,sg=Math.abs(tr)<.06?(r()<.5?-1:1):(tr<0?-1:1);
     const rad=16+r()*24,lat=ROAD_HALF+rad*1.1+14+r()*38,dy=r()<.5?6+r()*30:-(rad*.35+r()*46); // une moitié dressée au bord (en silhouette sur le noir), l'autre en contrebas
     if(hl<.5)continue; // haut de looping : pas de « côté »
     const x=pts[i].x-t9.z/hl*sg*lat,y=pts[i].y+dy,z=pts[i].z+t9.x/hl*sg*lat;
     if(!libre(x,y,z,rad*1.1+ROAD_HALF+14))continue;
     pose(0,x,y,z,rad,.03+r()*.10,r()<.5?0:1);}}
  /* 2. LE CHAMP : le long de la piste, jusqu'à 1,2 km — la parallaxe. MESURÉ (vague 3, dbgOrbite('vue')) : semé à hauteur de route,
     il tombait tout entier SOUS le centre de l'image (la caméra plonge) : six objets sur dix montent donc AU-DESSUS de la route (90 à
     590 m), et ceux-là peuvent passer à la verticale du ruban (dégagement 3D ≥ 140 m). Les gros (> 12 m) : un Starlink sur trois, les
     autres des débris (satellite mort, étage de fusée, pan de panneau, petit satellite d'or) ; les petits : des éclats. */
  {const N0=SAT_MAX[0]-SAT_TRAINS[0]*SAT_TRAINS[1],N1=SAT_MAX[1],N2=Math.round(SAT_MAX[2]*.38);
   for(let tr=0;(cnt[1]<N1||cnt[2]<N2)&&tr<(N1+N2)*4;tr++){const i=(r()*NP)|0,t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.3)continue;
     const sg=r()<.5?-1:1,rad=3+Math.pow(r(),2.2)*46,haut=r()<.6,al=(r()-.5)*260;
     const dy=haut?90+Math.pow(r(),1.2)*500:-(60+r()*400),lat=haut?Math.pow(r(),1.1)*900:ROAD_HALF+100+Math.pow(r(),1.3)*1000;
     const gros=rad>12,sat=gros&&cnt[0]<N0&&r()<.34;if(gros?(!sat&&cnt[1]>=N1):cnt[2]>=N2)continue;
     const x=pts[i].x+(-t9.z*sg*lat+t9.x*al)/hl,y=pts[i].y+dy,z=pts[i].z+(t9.x*sg*lat+t9.z*al)/hl;
     if(!libre(x,y,z,rad*1.3+ROAD_HALF+110))continue;
     if(sat)pose(0,x,y,z,rad*.9,.04+r()*.18,r()<.5?0:1);
     else if(gros)pose(1,x,y,z,rad*.85,.08+r()*.30,tire([.30,.20,.25,.25]));
     else pose(2,x,y,z,rad*.8,.25+r()*.9,tire([.40,.26,.20,.14]));}}
  /* 3. LES TRAINS STARLINK — des files de satellites alignés qui glissent dans le ciel, haut au-dessus de la piste. Chaque train :
     une direction, une longueur (1,5 à 2,6 km), 20-26 satellites à pas régulier, tous orientés pareil ; leurs panneaux tournent
     autour de l'axe du train, en phase décalée : l'éclat du soleil COURT d'un satellite au suivant. Toute la file doit rester libre
     (échantillonnée tous les ~150 m) — sinon on la remonte de 150 m, quatre fois au plus. */
  {const cx=(x0+x1)/2,cz=(z0+z1)/2,cy=ys/Math.max(1,ny),ex=Math.max(400,(x1-x0)*.35),ez=Math.max(400,(z1-z0)*.35);
   for(let t=0;t<SAT_TRAINS[0];t++){const n=SAT_TRAINS[1],Lt=1500+r()*1100,rad=19+r()*7,v=38+r()*26;
     const an=r()*6.283,inc=(r()-.5)*.28,d=ORB.t1.set(Math.cos(an)*Math.cos(inc),Math.sin(inc),Math.sin(an)*Math.cos(inc)).normalize();
     let px=cx+(r()-.5)*2*ex-d.x*Lt/2,py=cy+240+r()*320,pz=cz+(r()-.5)*2*ez-d.z*Lt/2,ok=false;
     for(let e=0;e<5&&!ok;e++){ok=true;for(let u=0;u<=Lt;u+=150)if(!libre(px+d.x*u,py+d.y*u,pz+d.z*u,rad+ROAD_HALF+140)){ok=false;break;}if(!ok)py+=150;}
     if(!ok)continue;
     ORB.t2.set(0,1,0).addScaledVector(d,-d.y).normalize(); // le « haut » du train : les panneaux regardent le ciel, alignés sur la file
     ORB.M.makeBasis(d,ORB.t2,ORB.t3.crossVectors(d,ORB.t2));const q=ORB.Q.setFromRotationMatrix(ORB.M).clone();
     const sens=r()<.5?-1:1,ph0=r()*6.283,vr=r()<.5?0:1;
     for(let j=0;j<n;j++){const s9=Lt*(j+.5)/n,i=pose(0,px+d.x*s9,py+d.y*s9,pz+d.z*s9,rad,0,vr,q);if(i<0)break;
       const A=SATS[0].geometry.attributes;A.aRot.setXYZW(i,d.x,d.y,d.z,.30*sens);A.aVar.setY(i,ph0+j*.42);
       A.aMov.setXYZW(i,d.x,d.y,d.z,v);A.aTr.setXY(i,s9,Lt);}}}
  /* 4. LES ANNEAUX DE DÉBRIS — deux anneaux autour de la piste, la nuée d'éclats (le syndrome de Kessler). MESURÉ (vague 3) : un seul
     anneau presque à plat se couchait sur l'horizon, derrière la route et la Terre ; le second, incliné de 26 à 37°, monte en
     DIAGONALE dans le noir au-dessus de la route : un fleuve d'éclats en travers du ciel. Même InstancedMesh, même appel de rendu. */
  {const N=SAT_MAX[2],nB0=cnt[2];
   const cx=(x0+x1)/2,cz=(z0+z1)/2,cy=ys/Math.max(1,ny)+160,Rb0=Math.min(2600,Math.max(1000,Math.max(x1-x0,z1-z0)*.5+250));
   const ta0=r()*6.283,ti0=.13+r()*.12,ta1=ta0+1.57+(r()-.5),ti1=.45+r()*.2;
   const gs=()=>(r()+r()+r()-1.5)*1.15; // ≈ une gaussienne
   let e1=null,nz=null,e2=null,Rb=Rb0;
   for(let tr=0;cnt[2]<N&&tr<N*3;tr++){const n=cnt[2];if(n===nB0||n===nB0+Math.round((N-nB0)*.5)){const B9=n===nB0;Rb=B9?Rb0:Rb0*1.15; // l'anneau couché, puis l'anneau dressé
       e1=ORB.t1.set(Math.cos(B9?ta0:ta1),0,Math.sin(B9?ta0:ta1));nz=ORB.t2.set(0,1,0).applyAxisAngle(e1,B9?ti0:ti1);e2=ORB.t3.crossVectors(nz,e1);}
     const th=r()*6.283,rr=Rb+gs()*380,hh=gs()*120,rad=6+Math.pow(r(),2.4)*40,cs=Math.cos(th),sn=Math.sin(th);
     const x=cx+e1.x*cs*rr+e2.x*sn*rr+nz.x*hh,y=cy+e1.y*cs*rr+e2.y*sn*rr+nz.y*hh,z=cz+e1.z*cs*rr+e2.z*sn*rr+nz.z*hh;
     if(!libre(x,y,z,rad*1.3+ROAD_HALF+90))continue;
     pose(2,x,y,z,rad,.12+r()*.8,tire([.40,.26,.20,.14]));}}
  for(let k=0;k<SATS.length;k++){const im=SATS[k],A=im.geometry.attributes;im.count=cnt[k];
    im.instanceMatrix.needsUpdate=true;A.aRot.needsUpdate=true;A.aVar.needsUpdate=true;A.aMov.needsUpdate=true;A.aTr.needsUpdate=true;}
  GLINT.count=cnt[0];
  ORB.ms=Math.round(performance.now()-t00);
}
const L_DIR=new THREE.Vector3().copy(SUN_DIR),L_PERP=new THREE.Vector3(),L_UP=new THREE.Vector3(),ESP_RIM=new THREE.Color(.40,.72,1.45); // la lumière de la BOUCLE (ombres, liseré) : le couchant, ou le soleil de l'orbite
const FILL_P0=fill.position.clone(),KICK_P0=kick.position.clone();
function orbiteLumiere(dt9){ // LA LUMIÈRE SPATIALE : le soleil dur, la Terre qui éclaire par-dessous, le clair de lune — pondérés par LVL.espace
  const e=LVL.espace;
  if(e<.001){if(ORB.lumOn){fill.position.copy(FILL_P0);kick.position.copy(KICK_P0);ORB.lumOn=false;}L_DIR.copy(SUN_DIR);FLARE.visible=false;return;}
  ORB.lumOn=true;
  const cf=ORB.t3;camera.getWorldDirection(cf);cf.y=0;if(cf.lengthSq()<1e-6)cf.set(0,0,-1);cf.normalize();
  const dr=ORB.dr.crossVectors(cf,ORB.haut).normalize(); // la droite de l'image, à plat
  // LE SOLEIL : une lumière RASANTE de côté — à gauche de l'image, ~20° au-dessus de l'horizon, un rien devant l'œil (hors cadre) — rejoint avec retard (comme la lune).
  // Rasant : la route reste sombre, le flanc de la caisse prend tout, les ombres s'allongent en travers de la chaussée.
  ORB.cleC.copy(dr).multiplyScalar(-.92).addScaledVector(ORB.haut,.34).addScaledVector(cf,.16).normalize();
  if(!ORB.cleOk){ORB.cle.copy(ORB.cleC);ORB.cleOk=true;}else ORB.cle.lerp(ORB.cleC,Math.min(1,dt9*1.1)).normalize();
  L_DIR.copy(SUN_DIR).lerp(ORB.cle,e).normalize();
  ORB.terre.subVectors(planetGroup.position,camera.position).normalize();
  fill.position.copy(FILL_P0).lerp(ORB.t1.copy(ORB.terre).multiplyScalar(450),e); // la Terre éclaire depuis LA Terre (la cible de `fill` est l'origine)
  kick.position.copy(KICK_P0).lerp(ORB.t1.copy(ORB.dm).multiplyScalar(600),e);   // le clair de lune vient de la lune
  // LE SOLEIL À L'ÉCRAN : sa direction dans le repère de la caméra ; hors champ, on le ramène juste derrière le bord (1,45) pour que son voile y déborde
  const lv=ORB.t1.copy(ORB.cle).transformDirection(camera.matrixWorldInverse),fu=FLARE.material.uniforms,dev=Math.max(.05,-lv.z);
  let sx=lv.x/dev*camera.projectionMatrix.elements[0],sy=lv.y/dev*camera.projectionMatrix.elements[5];const sl=Math.hypot(sx,sy);if(sl>1.45){sx*=1.45/sl;sy*=1.45/sl;}
  fu.uS.value.set(sx,sy);fu.uAsp.value=camera.aspect;fu.uOp.value=e*Math.max(0,Math.min(1,(-lv.z+.55)/.6))*(garageOn||stallOn?0:1); // loin derrière l'oeil, l'objectif ne le voit plus
  FLARE.visible=fu.uOp.value>.01;
}
function orbiteTick(t){ // chaque image : lumière, visibilité, place et regard de la lune — zéro allocation
  if(ORB.pinceau&&!ORB.peinte&&(!started||gameOver))luneAvance(); // au menu : une étape du pinceau de la lune par image
  const dt9=Math.min(.1,Math.max(0,t-ORB.tp));ORB.tp=t;
  orbiteLumiere(dt9);
  skyU.uEtK.value=renderer.getPixelRatio(); // (2026-10-22) les étoiles se comptent en pixels CSS : voir `pous` (la voûte profonde)
  const ok=LVL.espace>.01&&!garageOn&&!stallOn&&!MENUV.bio,vr=ok&&ORB.actif; // les satellites partent avec leur piste ; la lune, elle, s'efface avec le fondu du niveau
  for(let i=0;i<SATS.length;i++)SATS[i].visible=vr&&SATS[i].count>0;
  GLINT.visible=vr&&GLINT.count>0;
  const lunOk=ok&&ORB.lune; // (2026-10-22, la lune retirée du ciel : LUNE_ON) elle reste « dans le niveau » : sa direction (ORB.dm) pilote toujours la clé froide, la caisse est éclairée comme avant
  LUNE.visible=lunOk&&LUNE_ON;
  if(!lunOk&&!vr)return;
  // LE SOLEIL DE LA TERRE (la formule du globe, à l'identique) — gardé pour qui le lit ; les satellites prennent celui de la caisse (ORB.cle)
  const tc=ORB.t1.subVectors(camera.position,planetGroup.position).normalize(),sd=ORB.t2.crossVectors(tc,ORB.haut).normalize();
  ORB.sol.copy(tc).multiplyScalar(.5).addScaledVector(ORB.haut,.75).addScaledVector(sd,.45).normalize();
  SAT_U.uTerre.value.copy(tc).negate();SAT_U.uT.value=t%4096;SAT_U.uOp.value=Math.min(1,LVL.espace);SAT_U.uFog.value.copy(scene.fog.color);
  if(!lunOk)return;
  /* LA LUNE, SA PLACE DANS LE CADRE — MESURÉ : la caméra de poursuite plonge de 10° à 50° selon la pente, et son champ va de 74° à
     135° avec la vitesse : une direction fixe la faisait tomber tantôt sous le HUD, tantôt sur le bout de la route, tantôt hors
     cadre (et un simple cap retardé la sortait par le bord dans chaque longue courbe). Elle vise donc un point de l'IMAGE — le tiers
     haut-droit : 30 % à droite, 40 % au-dessus du centre, dans le repère de la caméra redressé sur l'horizon du monde (le roulis des
     vrilles ne l'emporte pas) — et le rejoint avec RETARD (2/s, plus vif que la Terre, 0,35/s) : un coup de volant, une vrille la
     font glisser comme un astre, elle revient ensuite à sa place, sans jamais s'en écarter de plus de 9°. C'est CE retard qui la fait
     « suivre le joueur » — gardé (verdict du 2026-09-27 : « c'est un bug mais j'aime bien »). Si le retard de la Terre les rapproche,
     la lune s'ÉCARTE le long du grand cercle : jamais l'une devant l'autre. */
  const cf=ORB.t3;camera.getWorldDirection(cf);
  const dr=ORB.dr.crossVectors(cf,ORB.haut);
  if(dr.lengthSq()>1e-4){dr.normalize();const du=ORB.du.crossVectors(dr,cf),tv=Math.tan(camera.fov*Math.PI/360);
    ORB.cible.copy(cf).addScaledVector(dr,.30*tv*camera.aspect).addScaledVector(du,.40*tv).normalize();} // (regard à la verticale : la cible d'avant reste)
  if(!ORB.capOk){ORB.dm.copy(ORB.cible);ORB.capOk=true;}
  else{ORB.dm.lerp(ORB.cible,Math.min(1,dt9*2)).normalize();const cc=ORB.dm.dot(ORB.cible);
    if(cc<Math.cos(.16)){const pr=ORB.du.copy(ORB.dm).addScaledVector(ORB.cible,-cc).normalize();ORB.dm.copy(ORB.cible).multiplyScalar(Math.cos(.16)).addScaledVector(pr,Math.sin(.16));}}
  const A=ORB.A.copy(ORB.dm);
  const P=ORB.t2.copy(tc).negate(),c9=A.dot(P),mini=Math.asin(Math.min(.99,PLANET_R*LVL.planete*1.06/PLANET_D))+LUNE_R/LUNE_D+.05;
  if(c9>Math.cos(mini)){const pr=ORB.t3.copy(A).addScaledVector(P,-c9);if(pr.lengthSq()<1e-6)pr.set(0,1,0);pr.normalize();A.copy(P).multiplyScalar(Math.cos(mini)).addScaledVector(pr,Math.sin(mini)).normalize();}
  const u=LUNE.material.uniforms;u.uA.value.copy(A);u.uC.value.copy(camera.position).addScaledVector(A,LUNE_D);
  /* SON SOLEIL : la formule du globe appliquée à SA direction (au-dessus, un peu à gauche, derrière l'œil) — MESURÉ : avec le soleil
     de la Terre tel quel, la lune (placée ailleurs dans le ciel) passait en fin croissant dès que la Terre prenait du retard. Ainsi,
     à l'écran, Terre et lune sont éclairées du même côté (haut-gauche), et la lune reste gibbeuse (64 à 76 % éclairée). */
  const tm=ORB.t2.copy(A).negate(),sm=ORB.t3.crossVectors(tm,ORB.haut);if(sm.lengthSq()<1e-6)sm.set(1,0,0);sm.normalize();
  u.uSol.value.copy(tm).multiplyScalar(.5).addScaledVector(ORB.haut,.75).addScaledVector(sm,.45).normalize();
  u.uTerre.value.subVectors(planetGroup.position,u.uC.value).normalize(); // d'où vient le clair de Terre
  u.uLib.value=Math.sin(t*.023)*.09+Math.sin(t*.0071+1.3)*.05; // la LIBRATION : la lune se balance, les cratères glissent sur le terminateur
  u.uOp.value=Math.min(1,LVL.espace);
  /* SON REGARD : la direction, à l'écran, de la lune vers la CAISSE — lissée (les yeux rattrapent vite, sans sauter), plus de petites
     saccades (un regard fixe n'est jamais immobile). Pendant le vol, la nitro, et surtout l'explosion, la stupeur monte. */
  const pc=ORB.pc.copy(carGroup.position).project(camera),pm=ORB.pm.copy(u.uC.value).project(camera);
  let ex=(pc.x-pm.x)*camera.aspect,ey=pc.y-pm.y;const el=Math.hypot(ex,ey);
  if(el>1e-4&&pc.z<1)ORB.oeilC.set(ex/el*.95,ey/el*.95);
  if(t>ORB.sacT){ORB.sacT=t+.35+orbAlea()*1.1;ORB.sac.set((orbAlea()-.5)*.26,(orbAlea()-.5)*.20);}
  ORB.sac.multiplyScalar(Math.max(0,1-dt9*2.5));
  ORB.oeil.lerp(ORB.oeilC,Math.min(1,dt9*9));u.uOeil.value.copy(ORB.oeil).add(ORB.sac);
  if(u.uOeil.value.lengthSq()>1)u.uOeil.value.normalize();
  const boom=mode==='boom'||gameOver,choc=!started?.45:(boom?1:.55+(mode==='fall'?.28:0)+(nitroOn?.17:0));
  ORB.choc+=(Math.min(1,choc)-ORB.choc)*Math.min(1,dt9*(choc>ORB.choc?6:1.5));u.uChoc.value=ORB.choc;
  if(t>ORB.cligProchain&&ORB.choc<.9){ORB.cligT=t;ORB.cligProchain=t+3.5+orbAlea()*5.5;} // un clignement rare — pas quand il est pétrifié
  const kc=(t-ORB.cligT)/.17;u.uCligne.value=kc>=0&&kc<1?Math.sin(kc*Math.PI):0;
  u.uT.value=t%1000;
}
function orbiteChauffe(){ // au menu (chauffeDivers) : le pinceau de la lune lancé, les programmes compilés — rien ne naît au portail
  luneAvance(); // la 1re étape du pinceau ; la boucle peint le reste, une étape par image (voir orbiteTick)
  renderer.compile(scene,camera); // lune, satellites et éclats sont DANS la scène (invisibles) : compile() les prend (il parcourt tout, visible ou non)
}
window.dbgOrbite=function(k){if(k==='carte'){lunePeint();return LUNE.userData.cv.toDataURL('image/png');} // (dev) dbgOrbite('carte') : la carte de la lune (R albédo, G relief, B mers)
  if(k==='cout'){const r=renderer.info,m=()=>{r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true;return [r.render.calls,r.render.triangles];}; // (dev) dbgOrbite('cout') : ce que coûtent lune + satellites dans l'image vue
    const a=m(),v=SATS.map(im=>im.visible),gv=GLINT.visible,fv=FLARE.visible,lv=LUNE.visible;for(const im of SATS)im.visible=false;GLINT.visible=false;FLARE.visible=false;LUNE.visible=false;const s=m();SATS.forEach((im,i)=>im.visible=v[i]);GLINT.visible=gv;FLARE.visible=fv;LUNE.visible=lv;
    return {appels:a[0]-s[0],triangles:a[1]-s[1],poseMs:ORB.ms,pireEtapePeintureMs:ORB.pireMs,sommets:SATS.map(im=>im.geometry.attributes.position.count),instances:SATS.map(im=>im.count),
      sommetsTraites:SATS.reduce((t,im)=>t+im.geometry.attributes.position.count*im.count,0)};}
  if(k==='vue'){const v=new THREE.Vector3(),o={};SATS.forEach(function(im,f){const a=im.instanceMatrix.array;let dans=0,haut=0,dm=0; // (dev) dbgOrbite('vue') : combien d'objets dans l'image, dont au-dessus du centre
      let pp=1e9;for(let i=0;i<im.count;i++){v.set(a[i*16+12],a[i*16+13],a[i*16+14]);const d=v.distanceTo(camera.position);v.project(camera);if(v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1){dans++;dm+=d;if(v.y>0)haut++;if(d<pp)pp=d;}}
      o[['starlink','debris','eclats'][f]]=[dans,haut,dans?Math.round(dm/dans):0,Math.round(pp)];});return o;}
  if(k==='sat'){ // (dev) dbgOrbite('sat',variante,angle) : un Starlink (variante 0/1) ou un débris (10+v) posé devant la caméra, la caméra passe côté SOLEIL (3/4) — puis dbgOrbite('rendu',fov)
    if(started&&!gameOver&&!paused)togglePause();
    const vr=arguments[1]|0,kk=vr>=10?1:0,im=SATS[kk],an=+arguments[2]||0,d=camera.getWorldDirection(new THREE.Vector3());
    if(ORB.dbgI)for(const q of ORB.dbgI){ORB.M.makeScale(0,0,0);SATS[q[0]].setMatrixAt(q[1],ORB.M);SATS[q[0]].instanceMatrix.needsUpdate=true;}ORB.dbgI=ORB.dbgI||[];
    const p=camera.position.clone().addScaledVector(d,400),L9=ORB.cle.clone(),sd=new THREE.Vector3().crossVectors(L9,ORB.haut).normalize();
    const vw=L9.clone().multiplyScalar(.75).addScaledVector(sd,.55*Math.cos(an)).addScaledVector(ORB.haut,.30+.4*Math.sin(an)).normalize(); // l'oeil : côté soleil, de trois quarts
    const n=L9.clone().add(vw).normalize().applyAxisAngle(sd,.35);                           // les cellules regardent presque le demi-vecteur : un reflet, pas un éclat
    ORB.Q.setFromUnitVectors(new THREE.Vector3(0,1,0),n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),.6));
    ORB.S.set(24,24,24);ORB.M.compose(p,ORB.Q,ORB.S);
    const i=im.count<SAT_MAX[kk]?im.count:im.count-1;im.setMatrixAt(i,ORB.M);im.geometry.attributes.aVar.setXYZW(i,.5,0,vr%10,0);im.geometry.attributes.aRot.setXYZW(i,0,1,0,0);
    im.geometry.attributes.aMov.setXYZW(i,0,0,0,0);if(i===im.count)im.count++;if(!kk)GLINT.count=im.count;ORB.dbgI.push([kk,i]);
    im.instanceMatrix.needsUpdate=true;for(const a of ['aVar','aRot','aMov'])im.geometry.attributes[a].needsUpdate=true;
    camera.position.copy(p).addScaledVector(vw,kk?62:70);camera.lookAt(p);camera.updateMatrixWorld();skyDome.position.copy(camera.position);return 'posé '+i;}
  if(k==='lum')return {espace:LVL.espace,soleilIdentique:L_DIR.equals(SUN_DIR)&&L_PERP.equals(SUN_PERP)&&L_UP.equals(SUN_UP), // (dev) dbgOrbite('lum') : hors orbite, la lumière est-elle EXACTEMENT celle d'avant ?
    fillIdentique:fill.position.equals(FILL_P0),kickIdentique:kick.position.equals(KICK_P0),flare:FLARE.visible,sats:SATS.map(im=>im.visible),lune:LUNE.visible,
    rim:RIM_U.uSunV.value.equals(ORB.t1.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse)),rimC:RIM_U.uRimC.value.getHexString(),sunPos:sun.position.clone().sub(sun.target.position).normalize().toArray().map(v=>+v.toFixed(4)),sunDir:SUN_DIR.toArray().map(v=>+v.toFixed(4))};
  if(k==='train'){if(started&&!gameOver&&!paused)togglePause(); // (dev) dbgOrbite('train',j,dist,cap,fov,temps) : le train Starlink n° j cadré de loin, UNE image (temps : l'horloge des satellites imposée)
    const im=SATS[0],A=im.geometry.attributes,a=im.instanceMatrix.array,c=new THREE.Vector3(),j0=+arguments[1]||0;let n=0,tj=-1,pl=null;
    for(let i=0;i<im.count;i++){if(A.aMov.getW(i)===0)continue;const Lt=A.aTr.getY(i);if(pl!==Lt){tj++;pl=Lt;}if(tj!==j0)continue;c.x+=a[i*16+12];c.y+=a[i*16+13];c.z+=a[i*16+14];n++;}
    if(!n)return 'pas de train '+j0;c.divideScalar(n);const d=+arguments[2]||1100,f0=camera.fov;
    camera.position.copy(c).add(new THREE.Vector3(0,-d*.30,d*.95).applyAxisAngle(ORB.haut,+arguments[3]||0));camera.lookAt(c);camera.fov=+arguments[4]||60;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);orbiteTick(skyU.uTime.value);if(arguments[5]!=null)SAT_U.uT.value=+arguments[5];
    if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);camera.fov=f0;camera.updateProjectionMatrix();return {n:n,trains:tj+1};}
  if(k==='force'){SAT_U.uForce.value=+arguments[1]||0;return SAT_U.uForce.value;} // (dev) dbgOrbite('force',1) : tous les éclats de soleil allumés (vérifier qu'ils se dessinent)
  if(k==='rendu'){if(started&&!gameOver&&!paused)togglePause();const f0=camera.fov;if(arguments[1]){camera.fov=+arguments[1];camera.updateProjectionMatrix();} // (dev) dbgOrbite('rendu',fov) : UNE image, caméra en place
    orbiteTick(skyU.uTime.value);camera.updateMatrixWorld();if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);camera.fov=f0;camera.updateProjectionMatrix();return 'ok';}
  if(k==='portrait'){if(started&&!gameOver&&!paused)togglePause();const f0=camera.fov;camera.fov=+arguments[1]||40;camera.updateProjectionMatrix(); // (dev) dbgOrbite('portrait',fov) : la lune ENTIÈRE au centre, UNE image
    orbiteTick(skyU.uTime.value);camera.lookAt(LUNE.material.uniforms.uC.value);camera.updateMatrixWorld();skyDome.position.copy(camera.position);orbiteTick(skyU.uTime.value);
    const u9=LUNE.material.uniforms;if(arguments[2])u9.uOeil.value.fromArray(arguments[2]);if(arguments[3]!=null)u9.uChoc.value=+arguments[3]; // regard [x,y] et stupeur imposés
    if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);camera.fov=f0;camera.updateProjectionMatrix();return 'ok';}
  if(k==='photo'){if(started&&!gameOver&&!paused)togglePause();const f0=camera.fov;camera.fov=24;camera.updateProjectionMatrix(); // (dev) dbgOrbite('photo') : la lune au téléobjectif (24°), UNE image rendue
    orbiteTick(skyU.uTime.value);camera.lookAt(LUNE.material.uniforms.uC.value);camera.updateMatrixWorld();skyDome.position.copy(camera.position);
    if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);camera.fov=f0;camera.updateProjectionMatrix();return 'ok';}
  const A=ORB.A;return {actif:ORB.actif,lune:LUNE.visible,starlink:SATS[0].count,debris:SATS[1].count,eclats:SATS[2].count,
  visibles:SATS[0].visible,espace:+LVL.espace.toFixed(2),luneCap:+Math.atan2(-A.x,-A.z).toFixed(3),luneSite:+Math.asin(Math.max(-1,Math.min(1,A.y))).toFixed(3),
  soleil:ORB.cle.toArray().map(v=>+v.toFixed(2)),regard:LUNE.material.uniforms.uOeil.value.toArray().map(v=>+v.toFixed(2)),choc:+ORB.choc.toFixed(2),peinte:ORB.peinte,
  luneEcran:(function(){const v=LUNE.material.uniforms.uC.value.clone().project(camera);return [Math.round((v.x*.5+.5)*VP.w),Math.round((.5-v.y*.5)*VP.h),v.z<1?'devant':'derriere'];})(),
  camSite:+Math.asin(camera.getWorldDirection(new THREE.Vector3()).y).toFixed(3),fov:+camera.fov.toFixed(1)};};
const PLANETE_DEF={teinte:0x55708c,atmo:0x8fd4ff};
function lvlAstre(a){ // la planète du niveau d'espace : teinte du globe + couleur du limbe
  const g=planetGroup.userData;a=a||PLANETE_DEF;
  if(PLANETES_ON&&planetesGarde(a))return; // (2026-10-14, passe graphismes) PLANETES
  g.globe.material.color.setHex(a.teinte);g.atmo.material.color.setHex(a.atmo);
  if(PLANETES_ON)planetesPeint(a); // la toile et le limbe suivent la planète du niveau
}
window.dbgNiveau=function(){return LVL.cur?{niveau:LVL.n,lieu:LVL.cur.id,ciel:BIO.name,largeurRoute:+(ROAD_HALF*2).toFixed(1),uSpace:+LVL.espace.toFixed(2),
  planete:+LVL.planete.toFixed(2),ville:!!CITY.root,nuages:CLOUDS.length,nuit:+LVL.nuit.toFixed(2),graine:LVL.cur.graine|0,pr:LVL.cur.pr||''}:'parc freestyle (pas de niveaux)';}; // (2026-09-30) + nuit, graine, promesse
window.dbgEtatLum=function(){ /* (2026-10-14, passe graphismes · hasard-bugs) banc : l'ÉTAT CHIFFRÉ de la lumière d'un couple map × météo — comparé entre « arrivé par un portail » et « démarré dessus » pour trouver les fuites d'état */ const n=function(v){return typeof v==='number'?+v.toFixed(4):typeof v==='boolean'?v:v&&v.isColor?[+v.r.toFixed(4),+v.g.toFixed(4),+v.b.toFixed(4)]:v&&(v.isVector3||v.isVector2||v.isVector4)?v.toArray().map(function(x){return +x.toFixed(4);}):Array.isArray(v)&&typeof v[0]==='number'?v.map(function(x){return +x.toFixed(4);}):undefined;},U=function(u){const o={};for(const k in u){let x;try{x=n(u[k]&&u[k].value!==undefined?u[k].value:u[k]);}catch(e){}if(x!==undefined)o[k]=x;}return o;},r={},T=function(k,f){try{r[k]=f();}catch(e){r[k]='ERR '+e.message;}},Lm=function(l){return {c:n(l.color),g:l.groundColor?n(l.groundColor):undefined,i:n(l.intensity),p:n(l.position),vis:l.visible,ombre:!!l.castShadow};};
  T('amb',function(){return BIO.name;});T('bioK',function(){return n(BIO.k);});T('lvlK',function(){return n(LVL.k);});T('lvl',function(){return U(LVL);});T('cur',function(){const o={};for(const k in LVL.cur){const v=LVL.cur[k];if(typeof v!=='object'||v===null)o[k]=v;else if(k==='bio')o.bio=v.join();}delete o.graine;return o;});
  T('bio',function(){const o=U(BIO.cur);o.env=JSON.stringify(BIO.to&&BIO.to.env);o.eS=JSON.stringify([BIO.to&&BIO.to.eS1,BIO.to&&BIO.to.eS2]);return o;});T('ciel',function(){return U(skyU);});T('post',function(){return U(acesPass.uniforms);});T('gfx',function(){return U(GFX_U);});T('rim',function(){return U(RIM_U);});T('route',function(){return U(ROAD_U);});
  T('sun',function(){return Lm(sun);});T('hemi',function(){return Lm(hemi);});T('fill',function(){return Lm(fill);});T('kick',function(){return Lm(kick);});T('carLight',function(){return Lm(carLight);});
  T('brume',function(){return {c:n(scene.fog.color),near:n(scene.fog.near),far:n(scene.fog.far),base:n(FOG_BASE),N:FOG_N,F:FOG_F,banc:n(FOG_CLOUD),cj:n(FOG_CJ)};});T('expo',function(){return {POST_EXPO:n(POST_EXPO),tone:n(renderer.toneMappingExposure),ombres:renderer.shadowMap.enabled};});
  T('bloom',function(){return {base:n(musicTick._bloom),force:n(bloomPass.strength),seuil:n(bloomPass.threshold),rayon:n(bloomPass.radius)};});
  T('planete',function(){const g=planetGroup.userData;return {vis:planetGroup.visible,ech:n(planetGroup.scale.x),globe:n(g.globe.material.color),atmo:n(g.atmo.material.color),peint:g.peint||''};});
  T('nuages',function(){return {n:CLOUDS.length,mat:n(CLOUD_MAT.color)};});T('ville',function(){return !!CITY.root;});T('soleil',function(){return {disque:n(sunSprite.material.opacity),dVis:sunSprite.visible,nappe:n(horizonGlow.material.opacity),nVis:horizonGlow.visible,rayons:n(RAYS[0].material.opacity)};});
  T('camp',function(){return {fog:n(CAMP_FOG),flash:n(CAMP_FLASH)};});T('lumieres',function(){const o={};scene.traverse(function(x){if(x.isLight){const k=x.type+(x.visible?'':'(cachée)');o[k]=+(((o[k]||0)+x.intensity).toFixed(3));}});return o;});
  T('fond',function(){return {bg:scene.background&&scene.background.isColor?n(scene.background):!!scene.background,env:!!scene.environment,dome:skyDome.visible};});return r;};
paintEnv(BIOMES.golden.env,BIOMES.golden.eS1,BIOMES.golden.eS2); // premier reflet = golden hour (la vitrine du menu)
const carGroup=new THREE.Group();scene.add(carGroup);SCENE_TOUJOURS.add(carGroup); // (2026-09-27) sa matrice monde est LUE même cachée (voir scene.updateMatrixWorld)
const carLight=new THREE.PointLight(0xfff2ea,1,12,2);scene.add(carLight); // (2026-09-25) blanc NEUTRE (le rosé 0xffe6f4 rosissait tout), portée courte en décroissance quadratique : elle éclaire la CARROSSERIE, plus la route (c'était la tache rose)
// PHARES RÉELS (la nuit tombe) : UN spot chaud qui balaie le bitume devant la caisse — ajouté à l init, jamais togglé (zéro recompilation)
const headSpot=new THREE.SpotLight(0xffd9a0,1.2,72,.5,.6,1.2);
headSpot.position.set(0,4,0);scene.add(headSpot);scene.add(headSpot.target);
/* (2026-09-30) LES FAISCEAUX DE MINUIT EN VILLE — deux cônes de lumière qui partent des phares (70 m, 6 m d'ouverture au bout), additifs,
   un dégradé qui meurt au bout : la pluie et la brume de minuit les rendent visibles. Créés ICI (compilés avec le reste), cachés tant que
   LVL.nuit est nul. En FrontSide : la caméra est derrière, elle ne passe jamais dedans (la leçon des cônes de l'atelier). */
const PHARE_FX=(function(){
  const cv=document.createElement('canvas');cv.width=4;cv.height=64;const c=cv.getContext('2d'),g=c.createLinearGradient(0,0,0,64);
  {g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(.06,'rgba(255,255,255,.5)');g.addColorStop(.22,'rgba(255,255,255,.42)');g.addColorStop(.6,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');} /* (2026-10-17, les lumières de la caisse v2) le faisceau NAÎT au phare au lieu d'y flamber : vu de la poursuite, le pied du cône faisait un éventail blanc posé sur le capot */
  c.fillStyle=g;c.fillRect(0,0,4,64);const tx=new THREE.CanvasTexture(cv);
  const geo=new THREE.ConeGeometry(6,70,18,1,true);geo.translate(0,-35,0);geo.rotateX(-Math.PI/2);geo.rotateX(.045); // la pointe au phare, l'ouverture 70 m devant, un rien vers le bitume
  const m=new THREE.MeshBasicMaterial({map:tx,color:0xdfe9ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.FrontSide});
  const L=[new THREE.Mesh(geo,m),new THREE.Mesh(geo,m)];for(const o of L){o.visible=false;o.frustumCulled=false;o.renderOrder=7;scene.add(o);} // 7 : au-dessus du museau du dragon de NITROOO (renderOrder 6) — les phares restent nets
  return {L:L,m:m,d:new THREE.Vector3(),u:new THREE.Vector3(),r:new THREE.Vector3()};})();
// REFLET NITRO/BOOST : la flamme éclaire VRAIMENT le bitume — pool de lumière derrière la caisse,
// orange nitro / bleu réserve / or pad turbo, intensité 0 au repos (à l init, zéro recompilation)
const nitroLight=new THREE.PointLight(0xff7a24,0,18);scene.add(nitroLight); // portée courte : une FLAQUE de feu sous l'échappement, pas une rivière jusqu'à la caméra
const trailLight=new THREE.PointLight(0xff7a24,0,34);scene.add(trailLight); // le REFLET DE LA TRAÎNÉE : une lueur qui GLISSE sur le bitume 9 m derrière la caisse
/* ---- LA SCÈNE DU CHANGEMENT DE MOTEUR (2026-08-05) ----
   ⚠ TOUT EST CRÉÉ ICI, à l'init, intensité 0 et `visible=false`. Ajouter une lumière ou un
   matériau EN COURS DE PARTIE force une recompilation de shader, donc un hoquet — et il
   tomberait précisément sur l'instant qu'on essaie de rendre jouissif. */
const swapLight=new THREE.PointLight(0xffd06a,0,30);scene.add(swapLight); // le flash doré de la pose
const swapRing=(function(){                                               // l'onde qui s'ouvre au ras de la caisse
  const m=new THREE.Mesh(new THREE.RingGeometry(.80,1,48,1),
    new THREE.MeshBasicMaterial({color:0xffd75e,transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.frustumCulled=false;m.visible=false;scene.add(m);return m;})();
// repères de la caisse pour la spirale — dédiés, car `tmp/tmp2/tmp3` sont partagés et la boucle
// continue après nous (musique, créatures) : les écraser ici se paierait ailleurs
const sw1=new THREE.Vector3(),sw2=new THREE.Vector3(),sw3=new THREE.Vector3();
const T_SWAP=1.7;   // la durée de TOUTE la scène — une seule constante, lue par le son, la
                    // vignette, l'onde et le badge : ils ne peuvent plus se désynchroniser
const hsF=new THREE.Vector3(),hsU=new THREE.Vector3(),hsR=new THREE.Vector3(); // nez + toit + flanc de la caisse (repère monde), réutilisés chaque frame
// ---- TRAÎNÉE DE NITRO : deux RUBANS de lumière accrochés aux tuyères — le « swoosh » qui reste dans l'air.
// Buffers fixes (zéro allocation en boucle), largeur orientée face caméra, fondu au carré de l'âge.
const TRAIL_N=26;
const TRAIL_TEX=(function(){ // le profil du ruban en travers : bords éteints, cœur franc
  const cv=document.createElement('canvas');cv.width=64;cv.height=2;const c=cv.getContext('2d');
  const g=c.createLinearGradient(0,0,64,0);g.addColorStop(0,'#000');g.addColorStop(.28,'#3a3a3a');g.addColorStop(.5,'#fff');g.addColorStop(.72,'#3a3a3a');g.addColorStop(1,'#000');
  c.fillStyle=g;c.fillRect(0,0,64,2);return new THREE.CanvasTexture(cv);
})();
function mkTrail(){
  const g=new THREE.BufferGeometry();
  const pos=new Float32Array(TRAIL_N*2*3),col=new Float32Array(TRAIL_N*2*3);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const idx=[];for(let i=0;i<TRAIL_N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  g.setIndex(idx);
  // (2026-09-26, audit rendu) deux sommets en travers, une couleur uniforme, en additif : vu dans l'axe, c'était un TAPIS jaune plat.
  // Une texture en travers (noire aux bords, blanche au cœur) sculpte le ruban sans un sommet de plus.
  const uv=new Float32Array(TRAIL_N*2*2);for(let i=0;i<TRAIL_N;i++){uv[i*4]=0;uv[i*4+1]=i/(TRAIL_N-1);uv[i*4+2]=1;uv[i*4+3]=i/(TRAIL_N-1);}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:TRAIL_TEX,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.frustumCulled=false;m.visible=false;m.renderOrder=2;scene.add(m);
  const hist=[];for(let i=0;i<TRAIL_N;i++)hist.push(new THREE.Vector3());
  return {m,pos,col,hist,init:false};
}
/* ---- LE SILLAGE — LA TRAÎNÉE DE NITRO DU JOUEUR ----
   v3 (2026-09-29, Sacha : « beaucoup plus belle, lisse et lumineuse — deux longues traînées — il faut que ce soit magnifique »), puis
   v4 le même soir (Sacha : « plus belles et plus longues : de longues traînées RÉGULIÈRES jusqu'à 50 mètres derrière ; et selon les
   voitures, la nitro doit être adaptée pour SORTIR DU POT »).
   · UNE TRAÎNÉE PAR POT : chaque sillage naît dans la bouche d'un pot de la caisse (`CAR_POTS` : les mêmes points que les plumes
     `JETS`, relevés sur le modèle ou déclarés par la fiche — jusqu'à 4). Une caisse à UN pot (la Postière, la Deuche, le Monospace…)
     en tire une seule, plus large — la v3 en tirait deux, de part et d'autre, qui ne sortaient d'AUCUN pot. Une caisse à 4 pots en
     tire 4, un peu plus fines.
   · 50 MÈTRES RÉGULIERS : la longueur se compte en MÈTRES de chemin, plus en secondes — lent ou à fond, le sillage couvre les 50
     derniers mètres, même largeur et presque même éclat de bout en bout, et ne s'éteint que dans ses 10 derniers mètres (`QUEUE`).
     Lâcher la nitro l'éteint EN ENTIER en ~0,9 s, là où il est : il reste dans l'air, il ne se rembobine pas.
   · LISSE : un point tous les 0,6 m (45 par seconde au plus, quel que soit l'écran), Catmull-Rom entre eux ; jamais de courbe tendue
     à travers une coupure.
   · LUMINEUX : deux couches dans le même ruban (un seul appel de dessin) — un CŒUR fin qui blanchit à la tuyère (c'est lui que le
     bloom attrape) et un HALO doux qui s'élargit au loin ; le feu tire vers le rouge-magenta vers le bout (l'orange nitro finit braise,
     le bleu de réserve finit violet, le violet infini finit pourpre).
   · Au SOL il file jusqu'au bas de l'écran (une traînée de lumière sur le bitume) et s'efface avant l'objectif. EN VOL, ce qui PEND
     tout droit sous la caisse est coupé plus tôt (`cutV`) et n'y reste qu'en halo — deux traits sous une caisse en l'air, ce sont deux
     « fils de marionnette » (critique du 29/09) ; dès qu'on vire ou qu'on vrille, il part sur le côté et on le voit sur toute sa longueur.
   · Pas de « tapis » (vu pile dans l'axe il s'efface), pas de faisceau aveuglant (le halo est sombre, ×.74 sur la couleur).
   · Même matériau que les rubans d'avant (MeshBasic, texture + couleurs de sommets, additif) : 0 programme compilé en course ;
     zéro allocation (tableaux fixes, une rangée de travail partagée). Réglages vivants : `SIL`, hook `dbgSillage()` (bancs sil*.js). */
/* v5 (2026-09-29, Sacha : « la traînée n'est pas assez belle : plus longue, plus large, que les flammes du pot suivent la ligne de nitro,
   fais un truc parfait ») : 75 m au lieu de 50 (N 150 : ~90 m de points même au pas de 0,6 m), la queue s'éteint sur 18 m ; le cœur ×1,6
   et le halo ×1,5 (×2 au bout) ; les plafonds près de l'objectif (capC, capG — ce qui empêchait tout voile) relevés d'un cran : c'est
   LÀ qu'on regarde la traînée au sol, elle file vers le bas de l'écran. La TÊTE donne sa direction à la plume du pot (dX/dY/dZ, voir la
   boucle) : la flamme se couche dans le sillage en virage, en glisse, en vrille — plus de cassure entre le feu et le ruban. */
/* v6 (2026-09-29, même soir, Sacha : « en l'air on voit que les bandes s'arrêtent, je veux qu'elles continuent sur 50 mètres — et fais-les
   plus grosses, plus travaillées, qu'elles émettent VRAIMENT de la lumière ») :
   · EN VOL PLUS DE COUPE : `cutV` = `cutB` (la coupe des « fils de marionnette » du 29/09 matin est levée à SA demande) ; le fondu « vu pile
     dans l'axe » (anti-tapis, pensé pour le SOL) est bien plus doux en vol (`axeV`) — la caméra suit le vol, le sillage file vers elle ;
   · PLUS GROSSES : cœur .21, halo .56 (+.9 au bout), plafonds près de l'objectif .03 / .13 ;
   · DE LA LUMIÈRE : le cœur brûle plus fort et blanchit plus loin (`coeur` 1.3, `chaud` .9 — c'est lui que le bloom attrape), le halo .62 ;
     des POULS d'énergie coulent de la tuyère vers la queue (`pouls`, vitesse `poulsV`) ; et le sillage crache des BRAISES sur toute sa
     longueur (`braise` par image et par sillage, réserve `silBraises` à la couleur du feu). Pas de lampe au sol : la tache ronde a été
     refusée (26/09) — la lumière vient du bloom et des braises. */
const SIL={N:200,SUB:2,PAS:.6,DTM:1/45,LONG:100,QUEUE:24, /* (v6b, 29/09 soir, Sacha : « encore plus longue, 100 mètres ») : 100 m, la queue s'éteint sur 24 m, 200 points (~120 m de réserve même au pas de 0,6 m) */OFF:.9,VMAX:12,cutA:.3,cutK:.55,cutB:9,cutV:9,kx:.9,wC:.21,wG:.56,wGa:.9,capC:.03,capG:.13,halo:.62,coeur:1.3,chaud:.9,froid:.55,un:1.4,tete:1.8,pres:.6,axeV:.02,pouls:.55,poulsV:30,braise:1.1};
/* LES TRAÎNÉES DE LUMIÈRE (2026-10-15, Sacha : « améliore les traînées, elles partent des feux arrière, ce sont des traînées de lumière ;
   qu'elles matchent avec les nouvelles particules de nitro, bien reconnaissables et cool — c'est un produit à vendre ») :
   · elles naissent dans les FEUX ARRIÈRE (`CAR_FEUX`), plus dans les pots — le feu de pixels (NFEU) garde les pots ;
   · elles VIVENT dès qu'on roule : un trait rouge de pose longue (`k`, `lg` m, largeur `w`), qui s'embrase au frein (`kF`) ;
   · au nitro elles prennent l'ÉNERGIE du feu : 100 m, la tête chauffée à blanc, les pouls, et des CUBES de feu (les étincelles de NFEU)
     qu'elles crachent sur leur longueur ; en refroidissant elles suivent la palette des cubes (orange → vermillon → rouge profond) ;
   · la lumière est ENREGISTRÉE au passage (comme une photo de nuit) : le morceau de nitro file derrière, brillant, puis la queue l'avale. */
const LUMT={k:.58,kF:.7,lg:46,w:.72,r:[1.5,.1,.07],rF:[1.75,.16,.08],rDn:30};
/* LA TRAÎNÉE SE LIT DE JOUR (2026-10-18, Sacha : « améliore toutes les traînées en cherchant globalement à les améliorer ») — une passe
   COMMUNE à toutes les traînées. De jour, une lumière ADDITIVE posée sur du bitume clair ou sur le ciel ne fait qu'éclaircir : la traînée
   virait au pastel (l'orange du nitro en beige, MENTHE en blanc verdâtre), alors que la nuit elle brille. Sous le halo de chaque ruban, un
   voile d'ENCRE (la même que la salle blanche, `silEncre`) teinte le fond de la couleur de la traînée — le bitume gris devient orange sous
   l'orange — puis la lumière s'y pose : de jour on lit une couleur FRANCHE, comme un néon en plein soleil. Le voile suit la lumière du lieu
   (`LUM.nuit`, la même que les phares) : nul la nuit (rien ne change), plein en plein jour. Même chose pour ce qui brille dans les traînées
   POP (code, foudre, filés, paillettes, néons : `uInk` du maillage additif de TRX). Mêmes programmes (le mélange n'entre pas dans leur clé),
   un appel de dessin de plus par ruban visible. `?sans=encrejour` = avant. */
const TRJ={on:!/[?&]sans=encrejour\b/.test(location.search),k:1.15,max:.78,trx:1.1};
const SIL_TEX=(function(){ // le profil EN TRAVERS : moitié gauche = le HALO (gaussienne large), moitié droite = le CŒUR (gaussienne serrée + une jupe)
  const cv=document.createElement('canvas');cv.width=128;cv.height=2;const c=cv.getContext('2d'),im=c.createImageData(128,2);
  for(let x=0;x<128;x++){const h=x<64,u=((h?x:x-64)+.5)/32-1,v=h?Math.exp(-u*u*4.5):Math.exp(-u*u*10)+.3*Math.exp(-u*u*2.5);
    const g=Math.round(255*Math.min(1,v*Math.max(0,1-Math.pow(Math.abs(u),6)))); // les bords tombent à ZÉRO : pas de liseré entre les deux moitiés
    for(let y=0;y<2;y++){const o=(y*128+x)*4;im.data[o]=im.data[o+1]=im.data[o+2]=g;im.data[o+3]=255;}}
  c.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t; // sans mipmaps : le halo et le cœur ne se mélangent jamais au loin
})();
const SIL_CD=new THREE.Vector3(),SIL_ROWS=(SIL.N-1)*SIL.SUB+1,SIL_Q=new Float32Array(SIL_ROWS*8); // la rangée de travail : x y z k r g b (+1)
function mkSillage(){
  const Rm=SIL_ROWS,g=new THREE.BufferGeometry();
  const pos=new Float32Array(Rm*12),col=new Float32Array(Rm*12),uv=new Float32Array(Rm*8);
  for(let j=0;j<Rm;j++){const o=j*8;uv[o]=0;uv[o+2]=.5;uv[o+4]=.5;uv[o+6]=1;uv[o+1]=uv[o+3]=uv[o+5]=uv[o+7]=.5;} // 4 sommets par rangée : halo G/D, cœur G/D
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  const idx=[];for(let j=0;j<Rm-1;j++){const a=j*4,b=a+4;idx.push(a,a+1,b,a+1,b+1,b,a+2,a+3,b+2,a+3,b+3,b+2);}
  g.setIndex(idx);g.setDrawRange(0,0);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:SIL_TEX,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.frustumCulled=false;m.visible=false;m.renderOrder=2;scene.add(m);
  const gi=new THREE.BufferGeometry(),coli=new Float32Array(Rm*12); // (2026-10-18) LE VOILE DE JOUR (voir TRJ) : la même géométrie, ses couleurs à lui
  gi.setAttribute('position',g.attributes.position);gi.setAttribute('uv',g.attributes.uv);gi.setAttribute('color',new THREE.BufferAttribute(coli,3));gi.setIndex(g.index);gi.setDrawRange(0,0);
  const mi=new THREE.Mesh(gi,new THREE.MeshBasicMaterial({map:SIL_TEX,vertexColors:true,transparent:true,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.OneMinusSrcColorFactor,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  mi.frustumCulled=false;mi.visible=false;mi.renderOrder=1;m.add(mi);
  const F=function(){return new Float32Array(SIL.N);};
  return {m,mi,coli,pos,col,X:F(),Y:F(),Z:F(),T:F(),K:F(),CR:F(),CG:F(),CB:F(),n:0,emit:false,clk:0,init:false,cut:SIL.cutB,g:0,tOff:0,long:0,dOk:false,dX:0,dY:0,dZ:-1,lg:LUMT.lg,hk:0};
}
const SILS=[mkSillage(),mkSillage(),mkSillage(),mkSillage()],trailL=SILS[0],trailR=SILS[1];let trailK=0; // (2026-09-29) les sillages DU JOUEUR, un par pot (4 au plus, comme les plumes) ; mkTrail/trailStep restent ceux de la meute, du fantôme et du fourgon
/* ---- L'ARC-EN-CIEL DU CHAT POP-TART, EN CUBES DE FEU (2026-10-07, Léo : « le boost de la Nyan Cat avec la méthode des flammes de la
   porte — les cubes, la transparence, l'accumulation —, un arc-en-ciel COMPLET en vagues de pixels qui changent de taille, toute la
   traînée comme le vrai Nyan Cat », puis « greffe-le, mais pas aussi plat ; adapté à la nouvelle voiture »).
   Le ruban à six bandes lisses d'avant (retiré du chat le 06/10) revient fait de la MATIÈRE DES FLAMMES DE LA PORTE (`FEU_CUBES`) :
   · DES CUBES, PAS UN RUBAN : six bandes d'UN cube chacune (30 cm : 6 × 30 = 1,8 m, la carrure de la pop-tart), une TRANCHE de six cubes
     tous les 30 cm de chemin. Chaque cube est le bloc de la porte — faces ombrées comme un jeu de cubes (dessus clair, flancs, dessous
     sombre), couleurs au-delà de 1 que le halo du post attrape — et son HALO (le même cube ×1,9, additif, translucide), qui partage ses
     matrices et ses couleurs : là où les cubes s'entassent, la lumière S'ACCUMULE. Mêmes matières que la porte : zéro programme en plus.
   · LE FEU : une tranche NAÎT à la poupe chauffée à blanc, puis vieillit — sa couleur passe du cœur blanc au plein puis à la braise, ses
     cubes FONDENT par crans (la taille de la porte : 1 · ,95 · ,84 · ,7 · ,55 · ,38) et S'ÉMIETTENT un à un : la queue part en braises. Nitro
     lâchée, plus rien ne naît et ce qui reste brûle sur place. Des ÉTINCELLES (des petits cubes de la bande) sautent hors des rangs.
   · LES VAGUES DU NYAN : l'ESCALIER (tronçons de quatre tranches, un demi-cube plus haut une fois sur deux, qui bascule ~7 fois par seconde),
     des HOULES qui partent de la caisse et GROSSISSENT les cubes sur leur passage (des vagues de pixels qui changent de taille), et la
     banderole qui lève, plonge et serpente — par demi-cubes : les cubes sautent de case en case, comme ceux de la porte.
   · POSÉE DANS LE MONDE : la traînée reste où le chat l'a semée ; sa tranche se tourne vers l'objectif autour de l'axe du chemin (rouge EN
     HAUT vu de côté, comme le vrai Nyan Cat ; vue de derrière, six bandes côte à côte). Près de l'objectif, les cubes s'effacent. */
const ARC_C=.3,ARC_D=.3,ARC_NS=52,ARC_NE=360,ARC_VIE=1.15,ARC_N=ARC_NS*6+ARC_NE;
const ARC_COL=[[1.75,.16,.2],[1.8,.72,.06],[1.7,1.5,.14],[.34,1.6,.22],[.14,.66,1.85],[.82,.3,1.85]]; // rouge orange jaune vert bleu violet — au-delà de 1, comme le feu de la porte
const ARC_TAILLE=[1,.95,.84,.7,.55,.38],ARC_SEUIL=[.1,.3,.5,.66,.82]; // la taille fond par crans avec l'âge (la porte)
const rainbow=(function(){
  const bx=new THREE.BoxGeometry(1,1,1),ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
  for(let i=0;i<ps.count;i++){const ny=nm.getY(i),nz=nm.getZ(i),v=ny>.5?1:ny<-.5?.42:nz<-.5?.6:nz>.5?.5:.78;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;} // l'ombrage de la porte, face par face — plus tranché : sur le ciel clair et vue d'en haut (le dessus et la face −Z), il faut LIRE un bloc
  bx.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const A=new THREE.InstancedMesh(bx,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}),ARC_N); // ⚠ les réglages EXACTS des cubes de la porte : même programme
  const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1.5,1.5,1.5),new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:.075,
    blending:THREE.AdditiveBlending,depthWrite:false}),ARC_N); // le HALO (×1,5, .075 : la porte est dans un atelier SOMBRE — sous le ciel, ×1,9 à .17 noyait les cubes dans un brouillard pastel ; l'opacité n'entre pas dans le programme)
  A.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(ARC_N*3),3);
  A.instanceMatrix.setUsage(THREE.DynamicDrawUsage);A.instanceColor.setUsage(THREE.DynamicDrawUsage);
  B.instanceMatrix=A.instanceMatrix;B.instanceColor=A.instanceColor;                    // le halo suit le cube : mêmes tampons
  A.count=B.count=0;A.frustumCulled=B.frustumCulled=false;A.visible=B.visible=false;B.renderOrder=2;scene.add(A);scene.add(B);
  const P=[];for(let i=0;i<ARC_NS;i++)P.push(new THREE.Vector3());
  return {m:A,h:B,P,age:new Float32Array(ARC_NS),k0:new Float32Array(ARC_NS),id:new Int32Array(ARC_NS),vp:new Float32Array(ARC_NS),nid:0,emet:false,fade:false,kp:0,ev:new THREE.Vector3(),
    e:new Float32Array(ARC_NE*10),ne:0,eT:0,init:false,ph:0,phT:0,sg:1,ms:0,ech:1,ond:1,lim:ARC_NS,apercu:false,dPv:0,tPv:0,vie:false,
    up:new THREE.Vector3(0,1,0),dr:new THREE.Vector3(1,0,0),M:new THREE.Matrix4(),S:new THREE.Vector3(),Y:new THREE.Vector3(),Z:new THREE.Vector3(),C:new THREE.Vector3()};
})();
const arcV1=new THREE.Vector3(),arcV2=new THREE.Vector3(),arcV3=new THREE.Vector3();
function arcVis(v){rainbow.m.visible=rainbow.h.visible=v;}
function arcQ(x,h){return Math.round(x/h)*h;} // une case de la grille
function arcH(a,b){return (Math.imul(a*73^b*151,-1640531535)>>>24)/256;} // un tirage FIXÉ par (tranche, bande) : un cube s'émiette toujours au même endroit
function arcHoule(i,t){const s=Math.sin((i/21-t*1.15)*6.2832);return s>0?s*s:0;} // une HOULE toutes les 21 tranches (6,3 m), qui part de la caisse à ~7 m/s
function arcNait(i,k){const R=rainbow;R.age[i]=0;R.k0[i]=k;R.vp[i]=0;R.id[i]=R.nid=(R.nid+1)&0xffffff;}
function arcGlisse(){const R=rainbow;for(let i=ARC_NS-1;i>1;i--){R.age[i]=R.age[i-1];R.k0[i]=R.k0[i-1];R.id[i]=R.id[i-1];R.vp[i]=R.vp[i-1];}} // la traînée recule d'une tranche (la 1 se libère)
function arcEtincelle(px,py,pz,b,vx,vy,vz,sz,vie){ // un petit cube de la bande qui saute hors des rangs, monte, fond et scintille
  const R=rainbow;if(R.ne>=ARC_NE)return;const o=R.ne*10;R.ne++;
  R.e[o]=px;R.e[o+1]=py;R.e[o+2]=pz;R.e[o+3]=vx;R.e[o+4]=vy;R.e[o+5]=vz;R.e[o+6]=0;R.e[o+7]=vie||.45+Math.random()*.45;R.e[o+8]=b;R.e[o+9]=sz||.35+Math.random()*.3;
}
/* (2026-10-08, Léo : « travaille l'intro et l'outro du trail arc-en-ciel, il disparaît bizarrement — inspire-toi des petites étincelles
   multicolores ») LA GERBE : quand la traînée NAÎT (et quand elle s'éteint), la poupe lâche un bouquet de ces étincelles, toutes les
   bandes mêlées — vers l'arrière, un peu vers le haut, ouvert comme une poignée de confettis. (ax, ay, az) = l'arrière de la caisse,
   (vx, vy, vz) = l'élan qu'elles emportent. */
function arcGerbe(px,py,pz,nb,ax,ay,az,vx,vy,vz){
  const U=rainbow.up;
  for(let i=0;i<nb;i++){const b=i%6,f=1.5+Math.random()*3.5,h=.8+Math.random()*2.2;
    arcEtincelle(px+(Math.random()-.5)*.5,py+(Math.random()-.5)*.3,pz+(Math.random()-.5)*.5,b,
      vx+ax*f+U.x*h+(Math.random()-.5)*3.4,vy+ay*f+U.y*h+(Math.random()-.5)*3.4,vz+az*f+U.z*h+(Math.random()-.5)*3.4,.5+Math.random()*.4,.55+Math.random()*.5);}
}
/* LA POSE : chaque tranche se tourne vers l'objectif autour de l'axe du chemin (S = la direction des bandes), lève, plonge, serpente, et
   pose ses six cubes ; les étincelles vivent par-dessus. `cam` = l'objectif du rendu ; R.up / R.dr = le toit et le flanc de la caisse. */
function arcPose(cx,cy,cz,cam,t,dt){
  const R=rainbow,P=R.P,U=R.up,Dr=R.dr,M=R.M,S=R.S,Y=R.Y,Z=R.Z,me=M.elements,col=R.m.instanceColor.array,c=ARC_C*R.ech,hc=c*.5;
  /* LE SENS DES BANDES : le rouge va vers le toit de la caisse + un peu de son flanc — vu de côté il est EN HAUT, vu de derrière toujours
     du même côté. UN signe pour toute la traînée (pris à un mètre de la tête), retourné seulement quand il est franchement faux. */
  {const i=Math.min(4,ARC_NS-2);arcV1.subVectors(P[i+1],P[i-1]);if(arcV1.lengthSq()<1e-8)arcV1.set(cx,cy,cz);
    arcV2.subVectors(P[i],cam.position);arcV3.crossVectors(arcV1,arcV2);const l=arcV3.length();
    if(l>1e-7&&(arcV3.x*(U.x-.3*Dr.x)+arcV3.y*(U.y-.3*Dr.y)+arcV3.z*(U.z-.3*Dr.z))/l*R.sg>.15)R.sg=-R.sg;} // (le rouge = la bande 0, côté −S)
  let n=0;const L=R.lim;
  for(let i=0;i<L;i++){
    const k0=R.k0[i];if(k0<.03)continue;
    const vi=Math.max(R.age[i]/ARC_VIE,i/L),v0=R.vp[i],meurt=vi>=1;R.vp[i]=vi; // l'âge, ou le bout de la traînée : ce qui fond le plus vite gagne
    if(meurt&&v0>=1)continue;                                         // morte depuis une image : il n'en reste rien (ses cubes sont partis en étincelles)
    const p=P[i],pa=P[Math.max(i-1,0)],pb=P[Math.min(i+1,ARC_NS-1)];  // (2026-10-08) la direction du chemin ignore un TROU (la nitro reprise plus loin, la tête qui file pendant l'extinction)
    arcV1.subVectors(pb.distanceToSquared(p)>ARC_D*ARC_D*6?p:pb,pa.distanceToSquared(p)>ARC_D*ARC_D*6?p:pa);
    if(arcV1.lengthSq()<1e-8)arcV1.set(cx,cy,cz);arcV1.normalize();
    arcV2.subVectors(p,cam.position);const dC=arcV2.length();
    const fC=THREE.MathUtils.smoothstep(dC,1.3,2.8);if(fC<=0)continue; // sous l'objectif, les cubes s'effacent
    S.crossVectors(arcV1,arcV2);const l=S.length();if(l<1e-7)continue;S.multiplyScalar(R.sg/l);
    {const sa=l/dC;if(sa<.4){const w9=Math.max(0,(sa-.12)/.28);       // l'objectif PILE dans l'axe du chemin : la tranche n'a plus de « côté » et se dressait en colonne —
      Y.copy(Dr).addScaledVector(arcV1,-arcV1.dot(Dr)).normalize();S.multiplyScalar(w9).addScaledVector(Y,1-w9).normalize();}} // elle se couche à plat, les six bandes côte à côte
    /* LE CUBE reste DEBOUT dans le repère de la caisse (il ne se tourne pas avec les bandes) : dessus = le toit (la face claire), la face
       −Z regarde la queue — là où est la caméra de poursuite (la 2e plus claire) ; (X, Y, Z) direct : pas de miroir, pas de faces retournées */
    Z.copy(arcV1).negate();Y.copy(U).addScaledVector(arcV1,-arcV1.dot(U));if(Y.lengthSq()<1e-6)Y.set(0,1,0);Y.normalize();arcV3.crossVectors(Y,Z);
    const id=R.id[i];                                                   // les ondulations par DEMI-CUBES : ils sautent de case en case
    const on=arcQ(R.ond*.5*Math.min(1,i/5)*Math.sin(i*.37-t*4.6),hc),ol=arcQ(R.ond*.42*Math.min(1,i/7)*Math.sin(i*.25-t*3.7+1.3),hc);
    const st=(((id>>2)+R.ph)&1)*hc*(R.sg>0?1:-1);                       // l'ESCALIER du Nyan : un demi-cube, une tranche sur deux de quatre, qui bascule
    const ho=arcHoule(i,t),gro=ho>.66?1.42:ho>.25?1.2:1;                // la HOULE : les cubes grossissent par crans sur son passage
    const ba=vi<ARC_SEUIL[0]?0:vi<ARC_SEUIL[1]?1:vi<ARC_SEUIL[2]?2:vi<ARC_SEUIL[3]?3:vi<ARC_SEUIL[4]?4:5;
    const sz0=c*.84*ARC_TAILLE[ba]*gro*fC,eclat=ba===0?.3:0,K=ba<2?1.08:ba<4?.92:.62; // ×.84 : un JOINT entre les cubes (on lit des blocs) — la houle le referme en passant
    for(let b=0;b<6;b++){
      const th=.4+arcH(id,b)/1.25,off=(b-2.5)*c+st;                     // ils s'ÉMIETTENT un à un en vieillissant : ce cube-ci, passé l'âge `th`
      const x=p.x+U.x*on+Dr.x*ol+S.x*off,y=p.y+U.y*on+Dr.y*ol+S.y*off,z=p.z+U.z*on+Dr.z*ol+S.z*off;
      if(meurt||vi>th){                                                 // (2026-10-08) …et le cube qui meurt PART EN ÉTINCELLE de sa couleur : la traînée
        if(v0<=th&&Math.random()<(R.fade?.75:.1))arcEtincelle(x,y,z,b,R.ev.x+U.x*(.6+Math.random())+S.x*(b-2.5)*.3+(Math.random()-.5)*1.4, // ne disparaît plus, elle se dissout en confettis qui montent et scintillent
          R.ev.y+U.y*(.6+Math.random())+S.y*(b-2.5)*.3+(Math.random()-.5)*1.4,R.ev.z+U.z*(.6+Math.random())+S.z*(b-2.5)*.3+(Math.random()-.5)*1.4,.55+Math.random()*.3,.45+Math.random()*.5);
        continue;} // (en pleine émission, la queue qui s'émiette n'en lâche qu'une sur dix : la réserve d'étincelles reste pour l'extinction ;
                   // elles emportent une part de l'élan de la caisse `R.ev` — sinon la caméra de poursuite les dépasse avant qu'on les voie)
      const sz=sz0*(.93+.14*arcH(id,b+7));
      me[0]=arcV3.x*sz;me[1]=arcV3.y*sz;me[2]=arcV3.z*sz;me[4]=Y.x*sz;me[5]=Y.y*sz;me[6]=Y.z*sz;me[8]=Z.x*sz;me[9]=Z.y*sz;me[10]=Z.z*sz;
      me[3]=me[7]=me[11]=0;me[12]=x;me[13]=y;me[14]=z;me[15]=1;R.m.setMatrixAt(n,M);
      const C9=ARC_COL[b],j=n*3;                                        // la couleur de la BANDE, chauffée à blanc à la poupe, en braise au bout
      col[j]=(C9[0]+(2.1-C9[0])*eclat)*K;col[j+1]=(C9[1]+(1.9-C9[1])*eclat)*K;col[j+2]=(C9[2]+(1.7-C9[2])*eclat)*K;
      if(++n>=ARC_NS*6)break;}
    if(n>=ARC_NS*6)break;}
  // LES ÉTINCELLES : elles montent, ralentissent, fondent et SCINTILLENT (une sur cinq s'éteint à chaque image)
  const dr=Math.exp(-dt*1.8);
  for(let i=0;i<R.ne;i++){const o=i*10;R.e[o+6]+=dt;
    if(R.e[o+6]>=R.e[o+7]){R.ne--;if(i<R.ne){R.e.copyWithin(o,R.ne*10,R.ne*10+10);i--;}continue;}
    R.e[o+3]*=dr;R.e[o+4]=R.e[o+4]*dr+1.1*dt;R.e[o+5]*=dr;
    R.e[o]+=R.e[o+3]*dt;R.e[o+1]+=R.e[o+4]*dt;R.e[o+2]+=R.e[o+5]*dt;
    if(Math.random()<.2)continue;
    const dx9=R.e[o]-cam.position.x,dy9=R.e[o+1]-cam.position.y,dz9=R.e[o+2]-cam.position.z,fe=THREE.MathUtils.smoothstep(Math.sqrt(dx9*dx9+dy9*dy9+dz9*dz9),1.6,4);if(fe<=0)continue; // une étincelle qui frôle l'objectif ne bouche pas l'écran
    const g=R.e[o+6]/R.e[o+7],sz=c*R.e[o+9]*(g<.5?1:g<.8?.7:.4)*R.ech*fe;
    me[0]=sz;me[1]=me[2]=me[4]=0;me[5]=sz;me[6]=me[8]=me[9]=0;me[10]=sz;me[12]=R.e[o];me[13]=R.e[o+1];me[14]=R.e[o+2];
    R.m.setMatrixAt(n,M);const C9=ARC_COL[R.e[o+8]|0],j=n*3,K=g<.3?1.25:1;col[j]=C9[0]*K;col[j+1]=C9[1]*K;col[j+2]=C9[2]*K;n++;}
  R.m.count=R.h.count=n;imEnvoi(R.m,n,true); // (2026-10-14, passe perf mobile) seules les n premières instances partent (672 places) — le halo partage les mêmes tampons
  return n;
}
function arcEmet(dt,k,vx,vy,vz){ // les étincelles naissent dans les tranches jeunes, à la poupe — avec l'élan du chemin
  const R=rainbow;if(k<.05)return;R.eT+=dt*48*k;
  while(R.eT>=1){R.eT-=1;const i=(Math.random()*Math.min(6,R.lim))|0,p=R.P[i],b=(Math.random()*6)|0,off=(b-2.5)*ARC_C*R.ech;
    arcEtincelle(p.x+R.S.x*off,p.y+R.S.y*off+.1,p.z+R.S.z*off,b,vx+(Math.random()-.5)*2.4,1+Math.random()*2.2,vz+(Math.random()-.5)*2.4);}
}
function arcAvance(dt){const R=rainbow;for(let i=0;i<ARC_NS;i++)R.age[i]+=dt;R.phT+=dt;if(R.phT>=.14){R.phT=0;R.ph^=1;}} // l'escalier bascule ~7 fois par seconde
function rainbowCoupe(){if(typeof wowCoupe==='function')wowCoupe();if(typeof trxCoupe==='function')trxCoupe();const R=rainbow;R.init=false;R.emet=false;arcVis(false);R.k0.fill(0);R.vp.fill(0);R.ne=0;R.m.count=R.h.count=0;} // replacement, piste neuve, fin de partie : plus rien ne traîne
function rainbowStep(px,py,pz,k,t,dt,fx,fy,fz){
  const R=rainbow,P=R.P,t0=performance.now();dt=dt||0;
  if(R.apercu)return; // l'aperçu du garage a la main
  const emet=k>=.03;
  if(!R.init){if(!emet){arcVis(false);return;}for(const q of P)q.set(px,py,pz);R.k0.fill(0);R.vp.fill(0);R.ne=0;R.init=true;R.emet=false;R.kp=0;}
  P[0].set(px,py,pz);R.k0[0]=k;R.age[0]=0;                          // la tête colle à la poupe, toujours neuve
  arcV1.subVectors(P[0],P[1]);let L=arcV1.length(),n=0;
  if(emet&&R.emet&&L>40){for(const q of P)q.set(px,py,pz);R.k0.fill(0);L=0;} // téléportée EN PLEINE ÉMISSION : pas de pont de cubes jusqu'ici (portail et replacement la coupent déjà, voir rainbowCoupe)
  /* (2026-10-08, Léo : « il disparaît bizarrement ») ÉTEINTE, LA TRAÎNÉE NE RECULE PLUS : des tranches invisibles continuaient de naître à
     la poupe et poussaient ce qui restait hors de ses 52 places, et la queue (déjà rétrécie à 60 %) sautait d'un coup. Ce qui reste brûle
     sur place et part en étincelles. Reprise plus loin (la caisse a filé) : une tranche vide fait le TROU — pas de pont de cubes. */
  if(emet&&!R.emet&&L>ARC_D*2.5){const v=P[ARC_NS-1];arcGlisse();for(let i=ARC_NS-1;i>1;i--)P[i]=P[i-1];v.copy(P[0]);P[1]=v;arcNait(1,0);L=0;}
  if(emet&&L>=ARC_D){arcV1.multiplyScalar(1/L);
    while(L>=ARC_D&&n<ARC_NS){const v=P[ARC_NS-1];                  // une tranche tous les 30 cm, posée EXACTEMENT sur le chemin
      arcGlisse();for(let i=ARC_NS-1;i>1;i--)P[i]=P[i-1];
      v.copy(P[2]).addScaledVector(arcV1,ARC_D);P[1]=v;arcNait(1,k);L-=ARC_D;n++;}}
  arcAvance(dt);
  /* L'INTENSITÉ FAIT LA LONGUEUR (2026-10-08) : la caméra de poursuite dépasse en un clin d'œil ce qui reste derrière — une traînée qui
     s'éteint doit s'éteindre ACCROCHÉE à la caisse. Elle RACCOURCIT donc depuis le bout vers la poupe (ses cubes, pleins, partent en
     étincelles au fur et à mesure), et naît en s'allongeant depuis la poupe ; à mi-intensité (le boost qui suit la nitro), une traînée
     moitié moins longue. */
  R.lim=emet?Math.max(2,Math.round(ARC_NS*Math.min(1,k*1.25))):1;R.ech=1;R.ond=1;R.up.copy(hsU);R.dr.copy(hsR);
  R.fade=!emet||k<R.kp-1e-4;R.kp=k;R.ev.set(EXV.x*.7,EXV.y*.7,EXV.z*.7);
  if(emet!==R.emet){R.emet=emet;arcGerbe(px,py,pz,emet?30:16,fx==null?0:fx,fy==null?0:fy,fz==null?-1:fz,EXV.x*.8,EXV.y*.8,EXV.z*.8);} // la GERBE : la traînée naît d'un bouquet d'étincelles, et s'éteint dans un plus petit
  arcEmet(dt,k,EXV.x*.6,EXV.y*.6,EXV.z*.6);
  const nv=arcPose(fx==null?0:fx,fy==null?0:fy,fz==null?1:fz,camera,t,dt);
  if(!emet&&nv===0){arcVis(false);R.init=false;return;}            // la dernière étincelle est éteinte
  arcVis(true);
  R.ms=R.ms*.95+(performance.now()-t0)*.05;                         // (dbgArc) ce que coûte l'arc-en-ciel à chaque image
}
/* L'APERÇU AU GARAGE (traînées de l'inventaire / de la boutique, et le BURN-OUT du chat) : la caisse ne bouge pas, donc on lui dessine un
   CHEMIN de 9 m qui ondule derrière elle, et des tranches y naissent comme si elle roulait à 14 m/s — l'arc-en-ciel sort de la poupe et
   file vers le fond, et suit la caisse quand elle tourne (le donut). */
function rainbowApercu(dt,on,cam,k9){
  const R=rainbow;
  if(!on){if(!R.apercu)return;if(!dt){R.apercu=false;rainbowCoupe();return;}} // (2026-10-08) on QUITTE l'écran (dt = 0) : coupé net ; sinon (fin du burn-out, autre traînée essayée) elle s'éteint en étincelles
  if(!R.apercu){R.apercu=true;R.k0.fill(0);R.vp.fill(0);R.ne=0;R.dPv=0;R.tPv=0;R.age.fill(9);R.emet=false;}
  R.tPv+=dt;const sp=CARS[garageI]||CARS[0],T=R.tPv,z0=NYAN.on?NYAN.arc.z:-(sp.l/2+.18),y0=NYAN.on?NYAN.arc.y:.62,kk=on?(k9==null?1:k9):0;
  R.dPv+=dt*14;while(R.dPv>=ARC_D){R.dPv-=ARC_D;arcGlisse();arcNait(1,kk);} // la grille de tranches glisse comme si elle roulait
  R.k0[0]=kk;R.age[0]=0;
  for(let i=0;i<ARC_NS;i++){const u=Math.min(1,i/30),j=Math.min(i,30)+R.dPv/ARC_D;             // 30 tranches = 9 m : le chemin, lui, ne bouge pas
    R.P[i].set(Math.sin(j*.21-T*2.4)*.4*u,y0+u*.2,z0-j*ARC_D);carGroup.localToWorld(R.P[i]);}
  arcAvance(dt);
  R.up.set(0,1,0).applyQuaternion(carGroup.quaternion);R.dr.set(1,0,0).applyQuaternion(carGroup.quaternion);
  R.lim=Math.max(2,Math.round(30*Math.min(1,kk*1.25)));R.ech=.62;R.ond=.7; // ×.62 : de trois-quarts, à quelques mètres, la banderole garde la carrure du chat · (2026-10-08) la longueur suit l'intensité
  R.fade=kk<R.kp-1e-4||!on;R.kp=kk;R.ev.set(0,0,0);
  {const em=kk>=.03;if(em!==R.emet){R.emet=em;arcV2.set(0,0,-1).applyQuaternion(carGroup.quaternion);arcGerbe(R.P[0].x,R.P[0].y,R.P[0].z,em?18:10,arcV2.x*.6,arcV2.y*.6,arcV2.z*.6,0,0,0);}} // la gerbe, à l'échelle du garage
  arcEmet(dt,kk*.6,0,0,0);
  const nv=arcPose(0,0,1,cam||camera,T,dt);arcVis(true);
  if(!on&&nv===0){R.apercu=false;rainbowCoupe();} // tout est parti en étincelles : l'aperçu rend la main
}
/* LA TRAÎNÉE WOW (2026-10-14, Léo, sur LE DOGE : « les textes à ajouter en trail carrément ») — les phrases du mème du shiba, en Comic Sans
   de toutes les couleurs (« wow », « such speed », « much nitro »…), SORTENT DES POTS à la nitro et filent derrière la caisse : c'est la
   traînée d'origine du DOGE (`fx.wow`) et une traînée de la boutique (`COSM.trainee` « WOW ») pour toutes les caisses. Comme l'arc-en-ciel :
   seulement à la nitro (`loop._arcK`), éteinte en réserve bleue, en nitro infinie et à l'explosion ; coupée avec lui (`rainbowCoupe`).
   Des sprites posés dans le MONDE (18 au plus, matières créées une fois, textures cuites une fois) : ils gardent 86 % de l'élan de la
   caisse et prennent du retard — ils s'écartent, grossissent d'un coup, et passent à côté de la caméra en s'effaçant. Au garage (onglet
   TRAÎNÉES) : `wowApercu`. Console : `dbgWow()`. */
var DOGE_GUEULE=null;window.dbgDoge=function(v){DOGE_GUEULE=v==null?null:+v;return DOGE_GUEULE;}; // (2026-10-14) le DOGE : forcer la gueule (0 → 1), null rend la main
var WOWT={sp:[],tx:null,acc:0,mi:0,der:-1,caisse:false,n:0,p0:null,vx:0,vy:0,vz:0};
function wowTex(){if(WOWT.tx)return WOWT.tx;WOWT.tx=[];
  const MOTS=['wow','such speed','much fast','very nitro','so car','many coin','amaze','such drift','much aura','very vroom','excite','wow'],
        TEINTES=['#ff3ec8','#5ee6ff','#7dff5a','#ffe25a','#ff8a2a','#c07bff'];
  MOTS.forEach(function(m9,n){const cv=document.createElement('canvas'),x=cv.getContext('2d'),F='40px "Press Start 2P",monospace';
    x.font=F;const w=Math.ceil(x.measureText(m9).width)+28;cv.width=w;cv.height=96;x.font=F;x.textBaseline='middle';x.lineJoin='round';
    x.lineWidth=9;x.strokeStyle='#1c0430';x.strokeText(m9,14,50);x.fillStyle=TEINTES[n%TEINTES.length];x.fillText(m9,14,50);
    const tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;tx.generateMipmaps=false;WOWT.tx.push({tx:tx,a:w/96});});
  return WOWT.tx;}
function wowPool(){if(WOWT.sp.length)return;const T=wowTex();
  for(let n=0;n<18;n++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:T[0].tx,transparent:true,depthWrite:false,fog:false}));
    sp.visible=false;sp.renderOrder=8;sp.frustumCulled=false;scene.add(sp);WOWT.sp.push({sp:sp,v:0});}}
function wowLance(x,y,z,vx,vy,vz,big){wowPool();let o=null;for(const q of WOWT.sp)if(q.v<=0){o=q;break;}if(!o)return;
  const T=wowTex();let n;do{n=Math.random()*T.length|0;}while(n===WOWT.der&&T.length>1);WOWT.der=n;
  o.sp.material.map=T[n].tx;o.sp.material.rotation=(Math.random()-.5)*.4;o.a=T[n].a;o.h=(.55+Math.random()*.3)*big;
  o.x=x;o.y=y;o.z=z;o.vx=vx;o.vy=vy;o.vz=vz;o.v=o.v0=1.4+Math.random()*.4;o.sp.visible=true;}
function wowTick(dt){let n=0;
  for(const o of WOWT.sp){if(o.v<=0)continue;o.v-=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;
    const u=o.v0-o.v,p=u<.12?u/.12*1.15:u<.2?1.15-(u-.12)/.08*.15:1,f=o.v<.5?Math.max(0,o.v/.5):1;                    // il SURGIT (un rebond), puis s'efface
    o.sp.position.set(o.x,o.y,o.z);o.sp.scale.set(o.h*o.a*p,o.h*p,1);o.sp.material.opacity=f;if(o.v<=0)o.sp.visible=false;else n++;}
  WOWT.n=n;}
function wowCoupe(){for(const o of WOWT.sp){o.v=0;o.sp.visible=false;}WOWT.n=0;WOWT.p0=null;WOWT.acc=0;}
// la caisse : ses axes (monde) lus sur sa matrice — l'avant est +z, le flanc +x, le toit +y
function wowAxes(){const e=carGroup.matrixWorld.elements;return [e[8],e[9],e[10],e[0],e[1],e[2],e[4],e[5],e[6]];}
function wowStep(px,py,pz,k,dt,big){
  if(WOWT.p0&&dt>0){const iv=1/Math.max(dt,1e-3);WOWT.vx=(px-WOWT.p0[0])*iv;WOWT.vy=(py-WOWT.p0[1])*iv;WOWT.vz=(pz-WOWT.p0[2])*iv;}else{WOWT.p0=[0,0,0];WOWT.vx=WOWT.vy=WOWT.vz=0;}
  WOWT.p0[0]=px;WOWT.p0[1]=py;WOWT.p0[2]=pz;
  if(k>.05){const A=wowAxes(),gar=big<1;WOWT.acc+=dt*(gar?3.2:7)*k;
    while(WOWT.acc>=1){WOWT.acc-=1;const sd=(WOWT.mi++%2?1:-1),lat=sd*(.45+Math.random()*.9),up=.25+Math.random()*.75,ar=gar?1.6:1.1,ou=sd*(gar?.35:1.1),vk=gar?.86:.955; /* (2026-10-16, TRAÎNÉES) en course les mots gardaient 86 % de l'élan : ils passaient l'objectif en un tiers de seconde, on ne lisait rien — 95,5 %, plus écartés, plus hauts */
      wowLance(px+A[3]*lat+A[6]*up-A[0]*.2,py+A[4]*lat+A[7]*up-A[1]*.2,pz+A[5]*lat+A[8]*up-A[2]*.2,
        WOWT.vx*vk-A[0]*ar+A[3]*ou+A[6]*(gar?.35:.8),WOWT.vy*vk-A[1]*ar+A[4]*ou+A[7]*(gar?.35:.8),WOWT.vz*vk-A[2]*ar+A[5]*ou+A[8]*(gar?.35:.8),big);}}
  else WOWT.acc=Math.min(WOWT.acc,.7);                                                                                  // le premier mot part à l'appui
  wowTick(dt);}
const WOW_V=new THREE.Vector3();
function wowApercu(dt,on){ // au garage (onglet TRAÎNÉES) : la caisse est posée, les mots sortent de la poupe et s'en vont
  if(!on&&!WOWT.n)return;
  potMonde(typeof CAR_POT_C!=='undefined'?CAR_POT_C:WOW_V.set(0,.5,-2),WOW_V);const A=wowAxes();
  wowStep(WOW_V.x+A[6]*.2,WOW_V.y+A[7]*.2,WOW_V.z+A[8]*.2,on?1:0,dt,.9);} // (2026-10-16, TRAÎNÉES) ,75 → ,9 : sur la vitrine les mots se lisaient à peine
