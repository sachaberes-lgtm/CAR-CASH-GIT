/* ===== LA VITRINE MINIATURE (2026-11-07, Sacha : « le truc des boîtes de Léo pour les voitures, tu peux les améliorer pour faire un truc qui donne plus un effet 3D en mode voiture miniature ») =====
   Le cube de Léo (six faces CSS) recevait une photo de catalogue prise sous SON angle à elle (trois-quarts, 40° d'azimut) : une image plate
   collée dans une boîte vue sous un AUTRE angle ne s'y pose jamais (la voiture flottait, penchait, ses roues passaient sous le plancher —
   vingt réglages le 07/11 sans en sortir). Ici, chaque voiture de la boutique a SA photo de vitrine, prise par le studio (photoStudio) sous
   l'angle exact de la boîte, comme une miniature de collection :
   · un SOCLE noir verni (le dessus, l'avant, le côté), son liseré à la couleur de la rareté, la caisse qui s'y REFLÈTE (une vraie prise
     en miroir sous le plan du socle, pas l'image retournée) ;
   · la caisse posée dessus, alignée sur la boîte (nez à droite), à l'échelle commune (les petites restent petites) ;
   · le capot de verre par-dessus : les vitres du fond (teintées de la rareté), puis celles de devant, du dessus et du côté, avec leurs arêtes
     éclairées et deux reflets en biais.
   Tout est calculé avec la MÊME caméra : les coins du socle et du verre sont projetés par l'objectif qui photographie la caisse, donc la
   voiture est DANS la boîte au pixel près. La carte n'a plus qu'UNE image (au lieu de six faces 3D et cinq tranches par carte : moins de
   calques à composer sur téléphone). Les ailes, traînées, figures et peintures gardent le cube CSS de Léo.
   Photo rangée sous `vt<ver>_<largeur>_<caisse>[s]` (PHOTO.cache + PHDB, comme les autres). `?vitrine=0` = le cube d'avant.
   Banc : dbgVitrine(i) (photo refaite, en data:), dbgVitrine({az, el, …}) (réglages), dbgVitrine('cartes') (les cartes de la grille). */
const VITM={on:!/[?&]vitrine=0\b/.test(location.search),ver:2,
  az:.52,el:.36,fov:17,       /* l'objectif : 30° d'azimut (on voit l'avant et le côté droit), 21° de plongée (le dessus du socle et le toit), objectif long */
  L:5.3,P:2.6,Hc:1.95,         /* le capot de verre : longueur (axe de la caisse), profondeur, hauteur — en mètres du jeu */
  ph:.42,po:.30,              /* le socle : hauteur, débord autour du verre */
  remp:.9,                    /* la caisse prend au plus 90 % de la longueur du verre (et 84 % de sa hauteur, 90 % de sa profondeur) */
  cam:null,rt:null,fit:null};
function vitLarg(){return (typeof ALLEGE!=='undefined'&&ALLEGE)?480:640;}
function vitrineCle(i,sec){return 'vt'+VITM.ver+'_'+vitLarg()+'_'+i+(sec?'s':'');}
function vitrineFile(i,sec,cb,el){const k=vitrineCle(i,sec);if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}
  PHQ.q.push([k,cb,{vt:1,i:i,sec:!!sec,k:k},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
/* les huit coins d'une boîte [x0,x1]×[y0,y1]×[z0,z1] */
function vitCoins(x0,x1,y0,y1,z0,z1){const C=[];for(let k=0;k<8;k++)C.push(new THREE.Vector3(k&1?x1:x0,k&2?y1:y0,k&4?z1:z0));return C;}
/* l'objectif de la vitrine : son angle, puis son cadrage CALCULÉ une fois sur le socle et le verre (les mêmes pour toutes les caisses : les cartes s'alignent) */
function vitObjectif(W,H){
  if(!VITM.cam)VITM.cam=new THREE.PerspectiveCamera(VITM.fov,W/H,.1,400);const cam=VITM.cam,cle=[W,H,VITM.az,VITM.el,VITM.fov,VITM.L,VITM.P,VITM.Hc,VITM.ph,VITM.po].join('|');
  if(VITM.fit===cle)return cam;
  cam.fov=VITM.fov;cam.aspect=W/H;cam.updateProjectionMatrix();cam.quaternion.setFromEuler(new THREE.Euler(-VITM.el,VITM.az,0,'YXZ'));
  const a=VITM.L/2+VITM.po,b=VITM.P/2+VITM.po,PTS=vitCoins(-a,a,-VITM.ph,VITM.Hc,-b,b),fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion),
    rt9=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion),up9=new THREE.Vector3(0,1,0).applyQuaternion(cam.quaternion),v9=new THREE.Vector3();
  let D=30,tg=new THREE.Vector3(0,VITM.Hc*.4,0);
  for(let it=0;it<6;it++){cam.position.copy(tg).addScaledVector(fw,-D);cam.updateMatrixWorld();
    let x0=9,x1=-9,y0=9,y1=-9;for(const c of PTS){v9.copy(c).project(cam);x0=Math.min(x0,v9.x);x1=Math.max(x1,v9.x);y0=Math.min(y0,v9.y);y1=Math.max(y1,v9.y);}
    D*=Math.max((x1-x0)/1.97,(y1-y0)/1.93); /* 98,5 % de la largeur, 96,5 % de la hauteur : la carte la pose déjà avec sa marge */
    const tV=Math.tan(cam.fov*Math.PI/360),tH=tV*cam.aspect;
    tg.addScaledVector(rt9,(x0+x1)/2*tH*D).addScaledVector(up9,((y0+y1)/2+.025)*tV*D);} /* calé sur le BAS : le socle touche le bas de l'image (la plaque du nom est dessous) */
  cam.position.copy(tg).addScaledVector(fw,-D);cam.updateMatrixWorld();VITM.fit=cle;return cam;}
function vitRend(sc,cam,W,H){ /* une prise dans la pellicule de la vitrine, développée (photoDev) : la toile W × H revient */
  const SS=PHOTO_SS;if(!VITM.rt||VITM.rt.width!==W*SS||VITM.rt.height!==H*SS){if(VITM.rt)VITM.rt.dispose();VITM.rt=new THREE.WebGLRenderTarget(W*SS,H*SS);}
  const prt=renderer.getRenderTarget();renderer.setRenderTarget(VITM.rt);renderer.setClearColor(0x000000,0);renderer.clear();
  photoLie(sc,cam);{const h9=FSTU.uHdr.value;FSTU.uHdr.value=Math.min(h9,BQ_HDR);try{renderer.render(sc,cam);}finally{FSTU.uHdr.value=h9;}}
  const r0=PHOTO.rt;PHOTO.rt=VITM.rt;let cv=null;try{cv=photoDev(W,H);}finally{PHOTO.rt=r0;renderer.setRenderTarget(prt);}return cv;}
function vitHex(c,a){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));const n=m?parseInt(m[1],16):0xb9c4d6;return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function vitMix(c,k){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));const n=m?parseInt(m[1],16):0xb9c4d6,f=function(v){return Math.round(v+(255-v)*k);};return 'rgb('+f(n>>16&255)+','+f(n>>8&255)+','+f(n&255)+')';}
function vitrinePhoto(i,sec,cb){const ck=vitrineCle(i,sec);
  if(PHOTO.cache[ck]){if(cb)cb(PHOTO.cache[ck]);return PHOTO.cache[ck];}
  if(started&&!gameOver){if(cb)cb(null);return null;}
  if(cb&&PHOTO.att&&PHOTO.att[ck]){PHOTO.att[ck].push(cb);return null;}
  const T9=VITM.ms={i:i,t0:performance.now()},W=vitLarg(),H=Math.round(W*440/720);
  photoStudio();
  const par=carGroup.parent,pos=carGroup.position.clone(),rot=carGroup.rotation.clone(),sc0=carGroup.scale.clone(),vis=carGroup.visible;
  if(!PHOTO.chaine)PHOTO.avant=carGroup.userData.lvl;
  PHOTO_USINE=true;const sig9=phdbSig();let asy=false,url=null;
  try{
    buildCar(CARS[i]);T9.caisse=performance.now()-T9.t0;
    PHOTO.scene.add(carGroup);carGroup.position.set(0,0,0);carGroup.rotation.set(0,Math.PI/2,0);carGroup.scale.set(1,1,1);carGroup.visible=true;photoPropre(); /* le nez (+z de la caisse) vers +x : vers la droite de la boîte */
    carGroup.updateMatrixWorld(true);
    const bx=new THREE.Box3(),b9=new THREE.Box3();
    carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||o.userData.fx||o.isInstancedMesh)return;for(let a=o;a;a=a.parent){if(!a.visible)return;if(a===carGroup)break;}
      if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b9.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);bx.union(b9);});
    if(bx.isEmpty())bx.set(new THREE.Vector3(-2,0,-1),new THREE.Vector3(2,1.3,1));
    const sz=bx.getSize(new THREE.Vector3()),ctr=bx.getCenter(new THREE.Vector3());T9.box=sz.toArray().map(function(v){return +v.toFixed(2);});
    const s=Math.min(1,VITM.L*VITM.remp/sz.x,VITM.Hc*.84/sz.y,VITM.P*.9/sz.z);T9.ech=+s.toFixed(3);
    const py=-bx.min.y*s;carGroup.scale.set(s,s,s);carGroup.position.set(-ctr.x*s,py,-ctr.z*s);carGroup.updateMatrixWorld(true);
    const cam=vitObjectif(W,H);
    /* 1. le REFLET : la caisse en miroir sous le plan du socle (y = 0) — le moteur retourne lui-même le sens des faces (déterminant négatif) */
    let cvR=null;if(!sec){carGroup.scale.set(s,-s,s);carGroup.position.y=-py;carGroup.updateMatrixWorld(true);cvR=vitRend(PHOTO.scene,cam,W,H);
      carGroup.scale.set(s,s,s);carGroup.position.y=py;carGroup.updateMatrixWorld(true);}
    /* 2. la caisse */
    const cvC=vitRend(PHOTO.scene,cam,W,H);T9.rendu=performance.now()-T9.t0;
    /* 3. le montage : socle, verre du fond, reflet, caisse, verre de devant */
    const rc=(sec?'#ff3ec8':(rarInfo(carRar(i)).c||'#b9c4d6')),u=W/240;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
    const v9=new THREE.Vector3(),P=function(X,Y,Z){v9.set(X,Y,Z).project(cam);return [(v9.x*.5+.5)*W,(1-(v9.y*.5+.5))*H];};
    const poly=function(L){x.beginPath();x.moveTo(L[0][0],L[0][1]);for(let k=1;k<L.length;k++)x.lineTo(L[k][0],L[k][1]);x.closePath();};
    const a=VITM.L/2,b=VITM.P/2,A=a+VITM.po,B=b+VITM.po,h=VITM.Hc,ph=VITM.ph;
    /* le socle : dessus (y = 0), avant (z = +B), côté (x = +A) */
    const sT=[P(-A,0,-B),P(A,0,-B),P(A,0,B),P(-A,0,B)],sF=[P(-A,0,B),P(A,0,B),P(A,-ph,B),P(-A,-ph,B)],sR=[P(A,0,B),P(A,0,-B),P(A,-ph,-B),P(A,-ph,B)];
    {let g=x.createLinearGradient(sF[0][0],sF[0][1],sF[3][0],sF[3][1]);g.addColorStop(0,'#1d2029');g.addColorStop(1,'#0b0c10');x.fillStyle=g;poly(sF);x.fill();
     g=x.createLinearGradient(sR[0][0],sR[0][1],sR[1][0],sR[1][1]);g.addColorStop(0,'#101218');g.addColorStop(1,'#060709');x.fillStyle=g;poly(sR);x.fill();
     g=x.createLinearGradient(sT[0][0],sT[0][1],sT[2][0],sT[2][1]);g.addColorStop(0,'#3a3f4c');g.addColorStop(.45,'#1a1d25');g.addColorStop(1,'#0e1015');x.fillStyle=g;poly(sT);x.fill();}
    /* le verre du fond (vitre du fond z = -b, vitre de gauche x = -a), à peine teinté de la rareté, et ses arêtes cachées, fines */
    const c=function(X,Y,Z){return P(X,Y,Z);},
      Q={bk:[c(-a,0,-b),c(a,0,-b),c(a,h,-b),c(-a,h,-b)],lf:[c(-a,0,b),c(-a,0,-b),c(-a,h,-b),c(-a,h,b)],
         fr:[c(-a,0,b),c(a,0,b),c(a,h,b),c(-a,h,b)],rt:[c(a,0,b),c(a,0,-b),c(a,h,-b),c(a,h,b)],tp:[c(-a,h,-b),c(a,h,-b),c(a,h,b),c(-a,h,b)]};
    {let g=x.createLinearGradient(0,Q.bk[2][1],0,Q.bk[0][1]);g.addColorStop(0,vitHex(rc,.22));g.addColorStop(1,vitHex(rc,.08));x.fillStyle=g;poly(Q.bk);x.fill();
     g=x.createLinearGradient(Q.lf[1][0],0,Q.lf[0][0],0);g.addColorStop(0,vitHex(rc,.20));g.addColorStop(1,vitHex(rc,.06));x.fillStyle=g;poly(Q.lf);x.fill();}
    x.lineJoin='round';x.lineCap='round';
    const arete=function(p,q,w,col){x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.stroke();};
    {const col=vitHex(rc,.45);arete(c(-a,0,-b),c(a,0,-b),1.2*u,col);arete(c(-a,0,-b),c(-a,0,b),1.2*u,col);arete(c(-a,0,-b),c(-a,h,-b),1.2*u,col);}
    /* le REFLET dans le dessus verni : la prise en miroir, à 30 %, qui s'éteint en s'éloignant des roues */
    const yb=P(0,0,0)[1];
    if(cvR){const t=document.createElement('canvas');t.width=W;t.height=H;const tx=t.getContext('2d');tx.drawImage(cvR,0,0);
      tx.globalCompositeOperation='destination-in';const g=tx.createLinearGradient(0,yb-H*.08,0,yb+H*.2);g.addColorStop(0,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(0,0,W,H);
      x.save();poly(sT);x.clip();x.drawImage(t,0,0);x.restore();toileRend(t);toileRend(cvR);}
    /* le liseré de rareté sur l'arête avant et l'arête droite du dessus du socle, et le biseau clair */
    arete(sT[3],sT[2],1.6*u,vitHex(rc,.95));arete(sT[2],sT[1],1.6*u,vitHex(rc,.75));
    arete(sF[3],sF[2],.8*u,'rgba(0,0,0,.6)');
    /* la caisse (une SECRÈTE : sa silhouette noire, détourée de rose) */
    if(sec){const t=document.createElement('canvas');t.width=W;t.height=H;const tx=t.getContext('2d');tx.drawImage(cvC,0,0);tx.globalCompositeOperation='source-in';tx.fillStyle='#0b0b12';tx.fillRect(0,0,W,H);
      x.save();x.shadowColor='rgba(255,62,200,.95)';x.shadowBlur=2.2*u;x.drawImage(t,0,0);x.restore();toileRend(t);}
    else x.drawImage(cvC,0,0);
    toileRend(cvC);
    /* le verre de devant : côté droit, dessus, vitre de devant — un voile blanc à peine, deux reflets en biais sur la vitre de devant */
    {let g=x.createLinearGradient(Q.rt[0][0],0,Q.rt[1][0],0);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,.05)');x.fillStyle=g;poly(Q.rt);x.fill();
     g=x.createLinearGradient(0,Q.tp[0][1],0,Q.tp[2][1]);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,.30)');x.fillStyle=g;poly(Q.tp);x.fill();
     const f0=Q.fr[3],f1=Q.fr[1];g=x.createLinearGradient(f0[0],f0[1],f1[0],f1[1]);
     g.addColorStop(0,'rgba(255,255,255,.10)');g.addColorStop(.14,'rgba(255,255,255,.34)');g.addColorStop(.21,'rgba(255,255,255,.05)');g.addColorStop(.27,'rgba(255,255,255,.16)');g.addColorStop(.31,'rgba(255,255,255,0)');
     g.addColorStop(.70,'rgba(255,255,255,0)');g.addColorStop(.86,'rgba(255,255,255,.10)');g.addColorStop(1,'rgba(255,255,255,.02)');x.fillStyle=g;poly(Q.fr);x.fill();}
    /* les arêtes de devant : la couleur de la rareté, un cœur blanc (la tranche du verre qui prend la lumière) */
    {const E=[[c(-a,0,b),c(a,0,b)],[c(a,0,b),c(a,0,-b)],[c(-a,0,b),c(-a,h,b)],[c(a,0,b),c(a,h,b)],[c(a,0,-b),c(a,h,-b)],
              [c(-a,h,b),c(a,h,b)],[c(a,h,b),c(a,h,-b)],[c(-a,h,-b),c(a,h,-b)],[c(-a,h,-b),c(-a,h,b)]],col=vitMix(rc,.25);
     for(const e of E)arete(e[0],e[1],2.4*u,col);for(const e of E)arete(e[0],e[1],.9*u,'rgba(255,255,255,.9)');
     /* l'éclat du coin le plus proche */
     const k0=c(a,h,b),g=x.createRadialGradient(k0[0],k0[1],0,k0[0],k0[1],7*u);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(k0[0]-8*u,k0[1]-8*u,16*u,16*u);}
    T9.montage=performance.now()-T9.t0;
    if(cb&&cv.toBlob&&window.URL&&URL.createObjectURL){asy=true;(PHOTO.att||(PHOTO.att={}))[ck]=[cb];
      cv.toBlob(function(bl){let u9=null;try{if(bl)u9=URL.createObjectURL(bl);}catch(e){}toileRend(cv);
        if(u9){if(PHOTO.cache[ck]){try{URL.revokeObjectURL(u9);}catch(e){}u9=PHOTO.cache[ck];}else{PHOTO.cache[ck]=u9;phdbEcrit(ck,bl,sig9);photoGarde(ck,u9,bl.size);}}
        const L9=PHOTO.att[ck]||[];delete PHOTO.att[ck];for(const f of L9)try{f(u9);}catch(e){console.warn('vitrine',e);}},'image/png');}
    else{url=cv.toDataURL('image/png');toileRend(cv);}
  }catch(e){console.warn('vitrine',e);if(asy&&PHOTO.att)delete PHOTO.att[ck];asy=false;}
  PHOTO_USINE=false;
  if(par)par.add(carGroup);carGroup.position.copy(pos);carGroup.rotation.copy(rot);carGroup.scale.copy(sc0);carGroup.visible=vis;
  if(!PHOTO.chaine){const av=PHOTO.avant;buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);}
  T9.total=performance.now()-T9.t0;
  if(url)PHOTO.cache[ck]=url;
  if(cb&&!asy)cb(url);
  return url;}
/* la carte reçoit sa vitrine : UNE image posée sur la place du cube (le cube CSS de la carte est caché par `.vt`, voir vitrine-miniature.css) */
function vitrinePose(x,i){const k=x.closest('.bqK');if(!k)return;const sec=k.classList.contains('m2sec');
  vitrineFile(i,sec,function(url){if(!url||!k.isConnected)return;let im=k.querySelector(':scope>.vtI');
    if(!im){im=document.createElement('img');im.className='vtI';im.alt='';im.decoding='async';im.draggable=false;k.insertBefore(im,k.firstChild);}
    if(im.getAttribute('src')!==url){im.onload=function(){k.classList.add('vt');};im.src=url;if(im.complete&&im.naturalWidth)k.classList.add('vt');}else k.classList.add('vt');},k);} /* la file regarde si la CARTE est en vue (le cube, caché, n'a pas de taille) */ /* la carte ne montre la vitrine qu'une fois l'image décodée (pas de case vide entre deux) */
if(VITM.on)document.documentElement.classList.add('vtOn');
window.dbgVitrine=function(o){
  if(o&&typeof o==='object'){Object.assign(VITM,o);VITM.fit=null;for(const k in PHOTO.cache)if(/^vt/.test(k))delete PHOTO.cache[k];return {az:VITM.az,el:VITM.el,fov:VITM.fov,L:VITM.L,P:VITM.P,Hc:VITM.Hc,ph:VITM.ph,po:VITM.po,remp:VITM.remp};}
  if(o==='cartes'){const L=[];document.querySelectorAll('#gBqPan .bqK.vo').forEach(function(k){L.push({k:k.getAttribute('data-k'),vt:k.classList.contains('vt')});});return L;}
  if(o==='mesure')return VITM.ms||null;
  const i=o|0,sec=false;delete PHOTO.cache[vitrineCle(i,sec)];const u=vitrinePhoto(i,sec);return {url:u,ms:VITM.ms};};
