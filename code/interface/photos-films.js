/* LA PHOTO D'UNE AILE (2026-10-15, Sacha : « pour les ailes il n'y a pas de photo, c'est pas bien ») : la caisse équipée, l'aile essayée,
   DÉPLOYÉE comme en vol (pleine envergure, léger dièdre), vue de trois quarts en plongée — même studio, même pellicule que les caisses */
// le studio (pellicule, scène, objectif, lumières), monté à la première photo — caisse, aile ou figure (2026-10-15 soir : sorti de carPhoto pour figPhoto)
function photoStudio(){if(PHOTO.rt)return;const W=PHOTO_W,H=PHOTO_H;
  PHOTO.rt=new THREE.WebGLRenderTarget(W*PHOTO_SS,H*PHOTO_SS);PHOTO.scene=new THREE.Scene();PHOTO.cam=new THREE.PerspectiveCamera(24,W/H,.1,400);
  const hemi=new THREE.HemisphereLight(0xdfe6ff,0x281a40,.62),key=new THREE.DirectionalLight(0xfff4e6,1.75),
        rim=new THREE.DirectionalLight(0xff5ad0,1.35),rim2=new THREE.DirectionalLight(0x5ad8ff,.9),bas=new THREE.PointLight(0x8a5cff,.7,16);
  key.position.set(-3,8,7);rim.position.set(7,3.5,-6);rim2.position.set(-7,2.5,-5);bas.position.set(0,-.4,3);
  PHOTO.scene.add(hemi,key,rim,rim2,bas);PHOTO.key=key;}
function photoAiles(){for(const w of [carWingL,carWingR]){if(!w)continue;w.visible=true;w.scale.x=w.userData.k||1;w.rotation.z=(w===carWingL?.16:-.16);w.traverse(function(o){o.visible=true;});}
  try{ailvPose();}catch(e){}} // (2026-10-16, LES AILES VIVANTES) l'aile au plus beau de son geste : boost tenu (les ailes en X ouvertes, la lave qui flambe…)
function aileFile(id,cb,el){const j=COSM.aile.findIndex(function(d){return d.id===id;});if(j<0)return;const c=equippedCar(),k='a:'+id+':'+c;
  if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}PHQ.q.push([k,cb,{k:k,j:j},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
/* (2026-10-14, OPTIMISATION — passation perf : « BOUTIQUE ~400 ms à l'ouverture = shopPhotoTour : 8 toDataURL 164 ms + 8 readPixels 66 ms ») —
   `carPhoto(i, cb)` : avec un rappel, la photo finit en `toBlob` (l'encodage PNG part hors du fil, le rappel reçoit une adresse `blob:` d'une
   soixantaine de caractères) au lieu de `toDataURL` (encodage sur place + ~400 Ko de base64 par photo, recopiés dans chaque innerHTML de la
   vitrine, de l'inventaire, des missions). Même PNG, même image. Les deux toiles de travail (5 Mo et 1,3 Mo) sont rendues aussitôt (toileRend).
   Sans rappel : comme avant (data: URL, synchrone). Une photo déjà en cours d'encodage n'est pas reprise : le rappel attend la même.
   `dbgPhoto()` : les temps de la dernière photo (caisse, rendu + lecture, pellicule, montage, caisse rendue). */
/* LA PELLICULE SUR LA PUCE (2026-10-16, « la boutique rame de ouf ») — MESURÉ au banc (processeur ×4) : la moitié d'une photo (61 ms sur 121)
   était la boucle JavaScript de la pellicule, pixel par pixel sur 1 440 × 880, puis la réduction de moitié par la toile. La même recette passe
   dans un petit programme : il lit la photo rendue au double, développe chaque pixel EXACTEMENT comme la boucle (relève sur la luminance,
   épaule au-dessus de .82, saturation ×1,14, plafond qui garde la teinte), en moyenne quatre (la réduction de moitié, alpha pondéré comme une
   toile), retourne l'image, et la toile reçoit 720 × 440 pixels déjà prêts. Même photo (écart ≤ 2/255, mesuré) ; `?photo=ancien` = la boucle. */
let PHOTO_DEV_JS=/[?&]photo=ancien\b/.test(location.search);
function photoDevPrep(){ /* (2026-10-18) le programme de la pellicule, seul : photoDev le lance sur une photo, figFilm sur chaque image d'un film */
  if(!PHOTO.dev){const m=new THREE.ShaderMaterial({uniforms:{t:{value:null},px:{value:new THREE.Vector2()}},depthTest:false,depthWrite:false,blending:THREE.NoBlending,toneMapped:false,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:'uniform sampler2D t;uniform vec2 px;varying vec2 vUv;'
        +'vec3 dev(vec3 c){float L=dot(c,vec3(.2126,.7152,.0722));if(L>1e-4){float L2=pow(L,1./1.22);if(L2>.82)L2=.82+(L2-.82)/(1.+(L2-.82)*2.6);c*=L2/L;}'
        +'float l=dot(c,vec3(.2126,.7152,.0722));c=max(vec3(0.),l+(c-l)*1.14);float m=max(c.r,max(c.g,c.b));if(m>1.)c/=m;return c;}'
        +'void main(){vec2 u=vec2(vUv.x,1.-vUv.y),h=px*.5;vec3 s=vec3(0.);float a=0.;vec4 c;'
        +'c=texture2D(t,u+vec2(-h.x,-h.y));if(c.a>0.){s+=dev(c.rgb)*c.a;a+=c.a;}'
        +'c=texture2D(t,u+vec2(h.x,-h.y));if(c.a>0.){s+=dev(c.rgb)*c.a;a+=c.a;}'
        +'c=texture2D(t,u+vec2(-h.x,h.y));if(c.a>0.){s+=dev(c.rgb)*c.a;a+=c.a;}'
        +'c=texture2D(t,u+vec2(h.x,h.y));if(c.a>0.){s+=dev(c.rgb)*c.a;a+=c.a;}'
        +'gl_FragColor=a>0.?vec4(s/a,a*.25):vec4(0.);}'});
    const sc=new THREE.Scene(),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m);q.frustumCulled=false;sc.add(q);sc.matrixAutoUpdate=false;
    PHOTO.dev={m:m,sc:sc,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),rt:null,buf:null};}
  return PHOTO.dev;}
function photoDev(W,H){
  const D=photoDevPrep();
  if(!D.rt||D.rt.width!==W||D.rt.height!==H){if(D.rt)D.rt.dispose();D.rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false,stencilBuffer:false,format:THREE.RGBAFormat,type:THREE.UnsignedByteType});D.buf=new Uint8ClampedArray(W*H*4);}
  D.m.uniforms.t.value=PHOTO.rt.texture;D.m.uniforms.px.value.set(1/PHOTO.rt.width,1/PHOTO.rt.height);
  renderer.setRenderTarget(D.rt);renderer.render(D.sc,D.cam);renderer.readRenderTargetPixels(D.rt,0,0,W,H,D.buf);
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.putImageData(new ImageData(D.buf,W,H),0,0);return cv;}
function carPhoto(i,cb,aile){
  const ck=aile?aile.k:i; // (2026-10-15) LA PHOTO D'UNE AILE (aileFile) : la caisse i qui la porte, ailes déployées — rangée sous SA clé
  if(PHOTO.cache[ck]){if(cb)cb(PHOTO.cache[ck]);return PHOTO.cache[ck];}
  if(started&&!gameOver){if(cb)cb(null);return null;}
  if(cb&&PHOTO.att&&PHOTO.att[ck]){PHOTO.att[ck].push(cb);return null;}
  const T9=PHOTO.ms={i:i,t0:performance.now()};
  const W=PHOTO_W,H=PHOTO_H,SS=PHOTO_SS,RW=W*SS,RH=H*SS;
  photoStudio();
  const par=carGroup.parent,pos=carGroup.position.clone(),rot=carGroup.rotation.clone(),sc=carGroup.scale.clone(),vis=carGroup.visible;
  if(!PHOTO.chaine)PHOTO.avant=carGroup.userData.lvl; // la caisse montée avant la photo (voir la fin) — (2026-10-16) en RAFALE, posée une fois par photoRafale
  const sig9=phdbSig();let url=null,asy=false;
  try{
    if(aile){const pv=SHOP.prev;SHOP.prev={cat:'aile',i:aile.j};try{buildCar(CARS[i]);if(!carWingL&&i)buildCar(CARS[0]);}finally{SHOP.prev=pv;}} // une caisse sans ailes (gabarit `none`) : la 1re de la gamme les porte
    else buildCar(CARS[i]);T9.caisse=performance.now()-T9.t0;
    PHOTO.scene.add(carGroup);carGroup.position.set(0,0,0);carGroup.rotation.set(0,PHOTO_ROT,0);carGroup.scale.set(1,1,1);carGroup.visible=true;photoPropre();if(aile)photoAiles();
    carGroup.updateMatrixWorld(true);
    // LA BOÎTE de ce qu'on voit (maillages visibles seulement : les halos cachés gonfleraient le cadre)
    const bx=new THREE.Box3(),b9=new THREE.Box3();
    carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||o.userData.fx)return;for(let a=o;a;a=a.parent){if(!a.visible)return;if(a===carGroup)break;}
      if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b9.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);bx.union(b9);});
    if(bx.isEmpty())bx.set(new THREE.Vector3(-1,0,-2),new THREE.Vector3(1,1.3,2));
    const EL9=aile?PHOTO_AILE.el:PHOTO_EL,AZ9=aile?PHOTO_AILE.az:PHOTO_AZ,cam=PHOTO.cam,ctr=bx.getCenter(new THREE.Vector3()),dir=new THREE.Vector3(Math.sin(AZ9)*Math.cos(EL9),Math.sin(EL9),Math.cos(AZ9)*Math.cos(EL9));T9.box=bx.getSize(new THREE.Vector3()).toArray().map(function(v){return +v.toFixed(2);});T9.ailes=!!carWingL;
    const C8=[];for(let k=0;k<8;k++)C8.push(new THREE.Vector3(k&1?bx.max.x:bx.min.x,k&2?bx.max.y:bx.min.y,k&4?bx.max.z:bx.min.z));
    let D=bx.getSize(new THREE.Vector3()).length()*2.4,tg=ctr.clone(),ymin=0;const v9=new THREE.Vector3();
    let PTS=C8;if(aile){PTS=[];carGroup.traverse(function(o){const pa=o.isMesh&&o.geometry&&o.geometry.attributes.position;if(!pa||o.userData.fx)return;for(let a=o;a;a=a.parent){if(!a.visible)return;if(a===carGroup)break;} // une AILE : le cadre se cale sur la vraie silhouette (des sommets), pas sur les coins de sa boîte — les ailes ne la remplissent pas, la caisse sortait à moitié de la taille
      const st=Math.max(1,Math.floor(pa.count/400));for(let q=0;q<pa.count;q+=st)PTS.push(new THREE.Vector3().fromBufferAttribute(pa,q).applyMatrix4(o.matrixWorld));});if(!PTS.length)PTS=C8;}
    for(let it=0;it<4;it++){ // le cadrage : la caisse remplit le cadre (86 % de large, 70 % de haut au plus), un peu haute (la place du reflet)
      cam.position.copy(tg).addScaledVector(dir,D);cam.lookAt(tg);cam.updateMatrixWorld();cam.updateProjectionMatrix();
      let x0=9,x1=-9,y0=9,y1=-9;for(const c of PTS){v9.copy(c).project(cam);x0=Math.min(x0,v9.x);x1=Math.max(x1,v9.x);y0=Math.min(y0,v9.y);y1=Math.max(y1,v9.y);}
      ymin=y0;const k=aile?Math.max((x1-x0)/1.92,(y1-y0)/1.62):Math.max((x1-x0)/1.86,(y1-y0)/1.46);D*=k; // (une aile : pas de reflet à loger, elle remplit plus le cadre)
      const tV=Math.tan(cam.fov*Math.PI/360),tH=tV*cam.aspect,rt9=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),up9=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
      tg.addScaledVector(rt9,(x0+x1)/2*tH*D).addScaledVector(up9,((y0+y1)/2-(aile?-.05:.10))*tV*D);} // (une aile, un peu BASSE : l'étiquette de rareté couvre le haut à droite de la carte)
    cam.position.copy(tg).addScaledVector(dir,D);cam.lookAt(tg);cam.updateMatrixWorld();
    {v9.set(ctr.x,bx.min.y,ctr.z).project(cam);ymin=v9.y;} // le sol SOUS le centre de la caisse, à l'écran (le coin avant de la boîte tombait plus bas : l'ombre se décollait)
    const cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha(),prt=renderer.getRenderTarget();
    renderer.setRenderTarget(PHOTO.rt);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(PHOTO.scene,cam);
    let gros=null;if(!PHOTO_DEV_JS)try{gros=photoDev(W,H);}catch(e){console.warn('photoDev',e);gros=null;PHOTO_DEV_JS=true;} // (2026-10-16) LA PELLICULE SUR LA PUCE (photoDev) : la toile sort déjà développée, retournée et réduite
    let buf=null;if(!gros){buf=new Uint8Array(RW*RH*4);renderer.readRenderTargetPixels(PHOTO.rt,0,0,RW,RH,buf);}
    renderer.setRenderTarget(prt);renderer.setClearColor(cc,ca);T9.rendu=performance.now()-T9.t0;
    // la PELLICULE : retournée, relevée sur la LUMINANCE (la teinte ne bouge pas), une ÉPAULE au-dessus de .82 (les vifs gardent leur modelé), un soupçon de saturation
    if(!gros){gros=document.createElement('canvas');gros.width=RW;gros.height=RH;const gx=gros.getContext('2d'),im=gx.createImageData(RW,RH),dd=im.data;
    for(let y=0;y<RH;y++){const s0=(RH-1-y)*RW*4,d0=y*RW*4;for(let k=0;k<RW*4;k+=4){const al=buf[s0+k+3];if(!al){dd[d0+k+3]=0;continue;}
      let r=buf[s0+k]/255,g=buf[s0+k+1]/255,bl=buf[s0+k+2]/255;const L=.2126*r+.7152*g+.0722*bl;
      if(L>1e-4){let L2=Math.pow(L,1/1.22);if(L2>.82)L2=.82+(L2-.82)/(1+(L2-.82)*2.6);const q=L2/L;r*=q;g*=q;bl*=q;}
      const l2=.2126*r+.7152*g+.0722*bl;r=Math.max(0,l2+(r-l2)*1.14);g=Math.max(0,l2+(g-l2)*1.14);bl=Math.max(0,l2+(bl-l2)*1.14);
      const m=Math.max(r,g,bl);if(m>1){r/=m;g/=m;bl/=m;}
      dd[d0+k]=r*255;dd[d0+k+1]=g*255;dd[d0+k+2]=bl*255;dd[d0+k+3]=al;}}
    gx.putImageData(im,0,0);}T9.pellicule=performance.now()-T9.t0;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
    const yb=Math.round((1-(ymin*.5+.5))*H); // la ligne du sol, en pixels de la photo
    // L'OMBRE DE CONTACT, douce, sous la caisse
    {x.save();x.translate(W/2,yb);x.scale(1,.13);const g9=x.createRadialGradient(0,0,0,0,0,W*.44);g9.addColorStop(0,'rgba(0,0,0,.62)');g9.addColorStop(.55,'rgba(0,0,0,.30)');g9.addColorStop(1,'rgba(0,0,0,0)');
     x.fillStyle=g9;x.fillRect(-W*.5,-W*.5,W,W);x.restore();}
    // LE REFLET d'un sol verni : la photo retournée sous la ligne du sol, qui s'éteint en 20 % de la hauteur
    /* (2026-10-15) pas de reflet sous une AILE : en plongée, le sol verni dessinait un fantôme d'aile */
    if(!aile){const rf=document.createElement('canvas');rf.width=W;rf.height=H;const rx=rf.getContext('2d');rx.imageSmoothingQuality='high';
     rx.save();rx.translate(0,2*yb);rx.scale(1,-1);rx.drawImage(gros,0,0,W,H);rx.restore();
     rx.globalCompositeOperation='destination-in';const gr=rx.createLinearGradient(0,yb,0,yb+H*.18);gr.addColorStop(0,'rgba(0,0,0,.26)');gr.addColorStop(1,'rgba(0,0,0,0)');
     rx.fillStyle=gr;rx.fillRect(0,0,W,H);x.drawImage(rf,0,0);toileRend(rf);}
    x.drawImage(gros,0,0,W,H);toileRend(gros);
    if(cb&&cv.toBlob&&window.URL&&URL.createObjectURL){asy=true;(PHOTO.att||(PHOTO.att={}))[ck]=[cb];
      cv.toBlob(function(b){let u=null;try{if(b)u=URL.createObjectURL(b);}catch(e){}toileRend(cv);
        if(u){if(PHOTO.cache[ck]){try{URL.revokeObjectURL(u);}catch(e){}u=PHOTO.cache[ck];}else{PHOTO.cache[ck]=u;phdbEcrit(ck,b,sig9);}}
        const L9=PHOTO.att[ck]||[];delete PHOTO.att[ck];for(const f of L9)try{f(u);}catch(e){console.warn('photo',e);}},'image/png');}
    else{url=cv.toDataURL('image/png');toileRend(cv);}
    T9.montage=performance.now()-T9.t0;
  }catch(e){console.warn('photo',e);if(asy&&PHOTO.att)delete PHOTO.att[ck];asy=false;}
  if(par)par.add(carGroup);carGroup.position.copy(pos);carGroup.rotation.copy(rot);carGroup.scale.copy(sc);carGroup.visible=vis;
  if(!PHOTO.chaine){const av=PHOTO.avant;buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);} // on rend la caisse qu'on regardait (au garage : la feuilletée) — (2026-10-16) en RAFALE, photoRafale la rend une fois à la fin
  T9.total=performance.now()-T9.t0;
  if(url)PHOTO.cache[ck]=url;
  if(cb&&!asy)cb(url);
  return url;
}
window.dbgAiles=function(id){ /* (banc, 2026-10-16, LES AILES VIVANTES) porter une aile et compter ce qui BOUGE : groupes animés, pièces animées, groupes VIDÉS (la soudure ne doit en vider aucun) */
  if(id)window.dbgHab('aile',id);const L=[];
  for(const w of [carWingL,carWingR]){if(!w)continue;let gb=0,pb=0,vides=0,maillages=0;w.traverse(function(o){if(o.isMesh)maillages++;if(o!==w&&o.userData.bouge){if(o.isGroup){gb++;if(!o.children.length)vides++;}else pb++;}});L.push({enfants:w.children.length,maillages:maillages,groupes:gb,pieces:pb,vides:vides});}
  return {aile:id||null,cotes:L,anim:BLING.anim.length,AILV:{t:+AILV.t.toFixed(2),n:+AILV.n.toFixed(2),vir:+AILV.vir.toFixed(2),mon:+AILV.mon.toFixed(2),vitr:AILV.vitr},wingT:+wingT.toFixed(2)};};
window.dbgAilesVue=function(az,d,h){ /* (banc) MODE PHOTO dans le repère de la CAISSE : az = 0 derrière elle, ±π/2 de côté, π devant ; d = distance, h = hauteur — en pause, une image (les ailes continuent de vivre : la rappeler) */
  if(az==='reprend'){if(started&&!gameOver&&paused)togglePause();return 'reprend';} // (2026-10-18, banc SANS AILES) la course repart : les ailes revivent entre deux photos
  if(started&&!gameOver&&!paused)togglePause();carGroup.updateMatrixWorld(true);
  const p=new THREE.Vector3().setFromMatrixPosition(carGroup.matrixWorld),q=new THREE.Quaternion().setFromRotationMatrix(carGroup.matrixWorld),
    o=new THREE.Vector3(Math.sin(az||0)*(d||7),h==null?2.2:h,-Math.cos(az||0)*(d||7)).applyQuaternion(q),up=new THREE.Vector3(0,1,0).applyQuaternion(q);
  camera.position.copy(p).add(o);camera.up.copy(up);camera.lookAt(p.x+up.x*.8,p.y+up.y*.8,p.z+up.z*.8);camera.updateMatrixWorld();camera.up.set(0,1,0);
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';};
window.dbgAilesForce=function(o){AILV.force=o||null;return AILV.force;}; // (banc) forcer l'état des ailes : {n:1} = le boost tenu, {vir:±1}, {mon:±1}, {ouvre:1} = dépliées même en roulant ; dbgAilesForce() rend la main
/* LE FILM D'UNE FIGURE (2026-10-18, Sacha : « pour la boutique des tricks fais des mini animations au ralenti pour voir la figure plutôt
   que les images stop motion ») — la photo-séquence du 15/10 (cinq à sept poses figées sur une seule image) devient un petit FILM AU
   RALENTI : la caisse équipée, au même studio et sur la même pellicule que les caisses, fait la VRAIE figure (FIG.quat, dans le sens de sa
   carte : FIG.oriente) le long d'un petit saut, vue de trois quarts avant — d'un peu plus haut pour une figure À PLAT (toupie, tail whip,
   hélico : l'axe vertical seul, de profil on ne la lit pas).
   · FILM_FIG.cols × rows images sur une PLANCHE : le temps du geste, son lissage compris, à mi-chemin d'une rotation régulière (`regu`) —
     au ralenti, le milieu d'un salto ne saute plus de quart de tour en quart de tour ; le TAIL WHIP tourne autour du NEZ (`piv`) ;
   · sous la caisse son OMBRE (elle pâlit et rétrécit quand la caisse monte) ; le saut est PETIT, presque sur place (la case est petite :
     un grand saut rapetissait la caisse ; le pointillé du saut, essayé, flottait au-dessus de la caisse posée : retiré) ;
   · prises d'une traite sur la puce : chaque image rendue au double, développée et réduite par la pellicule (photoDevPrep, le programme de
     photoDev) dans SA case de la planche, une seule lecture à la fin (plus de boucle de pixels en JavaScript) ;
   · la carte JOUE la planche dans une toile (filmPose → filmJoue, appelé à chaque image par garBqPanneau, rayon FIGURES seulement) : un
     temps posé avant l'envol (`avant`), le geste à `ms` par image (`ms2` pour deux tours et plus) — environ trois fois plus lent qu'en
     course —, un temps posé après la réception (`apres`), et ça recommence ; entre deux images un FONDU (`fondu`), le flou de bougé d'un
     ralenti au lieu d'une saccade ; une carte hors de vue ne se redessine pas. « Réduire les animations » : une image fixe, au milieu du geste.
   Cache `fa:<figure>:<sens>:<caisse>` (PHOTO.cache + PHDB ; l'ancienne clé `f:` était la photo-séquence). Banc : dbgFigFilm(id, sens, o). */
const FILM_FIG={w:224,h:112,cols:8,rows:4,el:.26,elPlat:.58,az:.42,span:.3,haut:.22,bas:-.9,fx:1.88,fy:1.5,regu:.5,avant:450,ms:62,ms2:76,apres:800,fondu:1}; /* span, haut : le saut en longueurs de caisse — PETIT, la caisse saute presque sur place : un grand saut la rapetissait (la case fait 113 × 50 couché) ; fx, fy : la part du cadre qu'occupent toutes les images */
function figFile(id,dir,cb,el){if(!(window.FIG&&FIG.par[id]))return;const k='fa:'+id+':'+dir+':'+equippedCar();
  if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}PHQ.q.push([k,cb,{k:k,fig:id,dir:dir},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
function figTours(f){let t=0;if(f&&f.m)for(const m of f.m)if(m.t!=null)t=Math.max(t,Math.abs(m.t));return t;}
function figFilm(o,cb){const ck=o.k;
  if(PHOTO.cache[ck]){if(cb)cb(PHOTO.cache[ck]);return PHOTO.cache[ck];}
  if(started&&!gameOver){if(cb)cb(null);return null;}
  if(cb&&PHOTO.att&&PHOTO.att[ck]){PHOTO.att[ck].push(cb);return null;}
  const f0=window.FIG&&FIG.par[o.fig];if(!f0){if(cb)cb(null);return null;}
  const f=FIG.oriente?FIG.oriente(f0,o.dir):f0,P=FILM_FIG,W=P.w,H=P.h,NC=P.cols,NR=P.rows,N=NC*NR,SS=PHOTO_SS,RW=W*SS,RH=H*SS,PW=W*NC,PH=H*NR,i=equippedCar(),T9=PHOTO.msF={fig:o.fig,dir:o.dir,t0:performance.now()};
  photoStudio();
  if(!PHOTO.rtF||PHOTO.rtF.width!==RW||PHOTO.rtF.height!==RH){if(PHOTO.rtF)PHOTO.rtF.dispose();PHOTO.rtF=new THREE.WebGLRenderTarget(RW,RH);}
  if(!PHOTO.rtP||PHOTO.rtP.width!==PW||PHOTO.rtP.height!==PH){if(PHOTO.rtP)PHOTO.rtP.dispose();
    PHOTO.rtP=new THREE.WebGLRenderTarget(PW,PH,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false,stencilBuffer:false,format:THREE.RGBAFormat,type:THREE.UnsignedByteType});}
  if(!PHOTO.camF)PHOTO.camF=new THREE.PerspectiveCamera(24,W/H,.1,900);PHOTO.camF.aspect=W/H;PHOTO.camF.updateProjectionMatrix();
  const par=carGroup.parent,pos=carGroup.position.clone(),rot=carGroup.rotation.clone(),sc=carGroup.scale.clone(),vis=carGroup.visible;
  PHOTO.avant=carGroup.userData.lvl;const sig9=phdbSig();
  const cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha(),prt=renderer.getRenderTarget(),ac=renderer.autoClear;
  let url=null,asy=false;
  try{
    buildCar(CARS[i]);T9.caisse=performance.now()-T9.t0;
    PHOTO.scene.add(carGroup);carGroup.position.set(0,0,0);carGroup.rotation.set(0,0,0);carGroup.scale.set(1,1,1);carGroup.visible=true;photoPropre();
    carGroup.updateMatrixWorld(true);
    // la BOÎTE et un semis de SOMMETS de ce qu'on voit, au repos (repère de la caisse : le cadrage se cale sur la vraie silhouette de chaque image)
    const bx=new THREE.Box3(),b9=new THREE.Box3(),SOM=[];
    carGroup.traverse(function(m){if(!m.isMesh||!m.geometry)return;for(let a=m;a;a=a.parent){if(!a.visible)return;if(a===carGroup)break;}
      if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();b9.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);bx.union(b9);
      const pa=m.geometry.attributes.position;if(!pa)return;const st=Math.max(1,Math.floor(pa.count/120));
      for(let q=0;q<pa.count;q+=st)SOM.push(new THREE.Vector3().fromBufferAttribute(pa,q).applyMatrix4(m.matrixWorld));});
    if(bx.isEmpty())bx.set(new THREE.Vector3(-1,0,-2),new THREE.Vector3(1,1.3,2));
    const ctr=bx.getCenter(new THREE.Vector3()),L=Math.max(1,bx.max.z-bx.min.z),La=Math.max(.5,bx.max.x-bx.min.x),sol=bx.min.y;
    // LES IMAGES : le chemin (une parabole, de gauche à droite, le nez devant) et la rotation de la figure à chaque image, autour du milieu — du nez pour le tail whip
    let plat=true;for(const m of f.m)if(Math.abs(m.a[1])<Math.max(Math.abs(m.a[0]),Math.abs(m.a[2]))+.01)plat=false;
    const tours=figTours(f),span=L*P.span,haut=L*P.haut,pv=new THREE.Vector3(0,ctr.y,ctr.z+(f.piv||0)*L*.5),qa=[0,0,0,1],Q=[],
      arc=function(u,v){return v.set(0,haut*4*u*(1-u),(u-.5)*span);};
    for(let k=0;k<N;k++){const u=k/(N-1),x=tours?(1-P.regu)*u+P.regu*(.5-Math.sin(Math.asin(1-2*u)/3)):u;FIG.quat(f,x,1,qa);
      const q=new THREE.Quaternion(qa[0],qa[1],qa[2],qa[3]),c=arc(u,new THREE.Vector3());
      c.add(pv).sub(pv.clone().applyQuaternion(q));Q.push([c,q,u]);}
    T9.images=N;
    // LE CADRAGE : toutes les images dans le cadre (fx, fy), POSÉES EN BAS (`bas`) : l'étiquette de rareté couvre le haut de la carte
    const EL=plat?P.elPlat:P.el,cam=PHOTO.camF,dc=new THREE.Vector3(-Math.cos(EL)*Math.cos(P.az),Math.sin(EL),Math.cos(EL)*Math.sin(P.az)),PTS=[],v9=new THREE.Vector3();
    for(const p of Q)for(const s of SOM)PTS.push(s.clone().applyQuaternion(p[1]).add(p[0]));
    let D=(span+L)*3;const tg=ctr.clone().add(arc(.5,v9));tg.y-=haut*.4;
    for(let it=0;it<4;it++){
      cam.position.copy(tg).addScaledVector(dc,D);cam.lookAt(tg);cam.updateMatrixWorld();cam.updateProjectionMatrix();
      let x0=9,x1=-9,y0=9,y1=-9;for(const c of PTS){v9.copy(c).project(cam);x0=Math.min(x0,v9.x);x1=Math.max(x1,v9.x);y0=Math.min(y0,v9.y);y1=Math.max(y1,v9.y);}
      D*=Math.max((x1-x0)/P.fx,(y1-y0)/P.fy);
      const tV=Math.tan(cam.fov*Math.PI/360),tH=tV*cam.aspect,rt9=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),up9=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
      tg.addScaledVector(rt9,(x0+x1)/2*tH*D).addScaledVector(up9,(y0-P.bas)*tV*D);}
    cam.position.copy(tg).addScaledVector(dc,D);cam.lookAt(tg);cam.updateMatrixWorld();
    // LES PRISES : une image rendue au double, développée et réduite par la pellicule dans SA case de la planche ; une seule lecture à la fin
    const DV=photoDevPrep(),rtP=PHOTO.rtP,buf=new Uint8ClampedArray(PW*PH*4);
    DV.m.uniforms.t.value=PHOTO.rtF.texture;DV.m.uniforms.px.value.set(1/RW,1/RH);
    try{renderer.setClearColor(0x000000,0);rtP.scissorTest=false;rtP.viewport.set(0,0,PW,PH);renderer.setRenderTarget(rtP);renderer.clear();renderer.autoClear=false;
      for(let k=0;k<N;k++){carGroup.position.copy(Q[k][0]);carGroup.quaternion.copy(Q[k][1]);carGroup.updateMatrixWorld(true);
        renderer.setRenderTarget(PHOTO.rtF);renderer.clear();renderer.render(PHOTO.scene,cam);
        rtP.viewport.set((k%NC)*W,Math.floor(k/NC)*H,W,H);renderer.setRenderTarget(rtP);renderer.render(DV.sc,DV.cam);}
      renderer.readRenderTargetPixels(rtP,0,0,PW,PH,buf);}
    finally{renderer.autoClear=ac;rtP.viewport.set(0,0,PW,PH);renderer.setRenderTarget(prt);renderer.setClearColor(cc,ca);}
    T9.rendu=performance.now()-T9.t0;
    // LA PLANCHE : case par case, l'OMBRE de la caisse sur le sol DERRIÈRE, puis les images de la caisse par-dessus
    const pl=document.createElement('canvas');pl.width=PW;pl.height=PH;const x=pl.getContext('2d'),ecr=function(v){v.project(cam);return [(v.x*.5+.5)*W,(.5-v.y*.5)*H];};
    for(let k=0;k<N;k++){const ox=(k%NC)*W,oy=Math.floor(k/NC)*H,u=Q[k][2],h=haut*4*u*(1-u),lv=haut>0?Math.min(1,h/haut):0;
      x.save();x.beginPath();x.rect(ox,oy,W,H);x.clip();x.translate(ox,oy);
      // l'OMBRE sur le sol, sous le milieu de la caisse
      {const g0=new THREE.Vector3(ctr.x,sol,ctr.z+(u-.5)*span),p0=ecr(g0.clone()),pz=ecr(g0.clone().setZ(g0.z+L*.5)),px=ecr(g0.clone().setX(g0.x+La*.5)),
         kk=1-.35*lv,rx=Math.max(4,(Math.abs(pz[0]-p0[0])+Math.abs(px[0]-p0[0]))*kk),ry=Math.max(2,(Math.abs(pz[1]-p0[1])+Math.abs(px[1]-p0[1]))*kk);
       x.save();x.translate(p0[0],p0[1]);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba(0,0,0,'+(.5*(1-.65*lv)).toFixed(3)+')');g.addColorStop(1,'rgba(0,0,0,0)');
       x.fillStyle=g;x.fillRect(-rx,-rx,2*rx,2*rx);x.restore();}
      x.restore();}
    {const cl=document.createElement('canvas');cl.width=PW;cl.height=PH;cl.getContext('2d').putImageData(new ImageData(buf,PW,PH),0,0);x.drawImage(cl,0,0);toileRend(cl);}
    T9.montage=performance.now()-T9.t0;
    if(cb&&pl.toBlob&&window.URL&&URL.createObjectURL){asy=true;(PHOTO.att||(PHOTO.att={}))[ck]=[cb];
      pl.toBlob(function(b){let u=null;try{if(b)u=URL.createObjectURL(b);}catch(e){}toileRend(pl);
        if(u){if(PHOTO.cache[ck]){try{URL.revokeObjectURL(u);}catch(e){}u=PHOTO.cache[ck];}else{PHOTO.cache[ck]=u;phdbEcrit(ck,b,sig9);}}
        const L9=PHOTO.att[ck]||[];delete PHOTO.att[ck];for(const fn of L9)try{fn(u);}catch(e){console.warn('film figure',e);}},'image/png');}
    else{url=pl.toDataURL('image/png');toileRend(pl);}
  }catch(e){console.warn('film figure',e);if(asy&&PHOTO.att)delete PHOTO.att[ck];asy=false;}
  if(par)par.add(carGroup);carGroup.position.copy(pos);carGroup.rotation.copy(rot);carGroup.scale.copy(sc);carGroup.visible=vis;
  {const av=PHOTO.avant;buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);}
  T9.total=performance.now()-T9.t0;
  if(url)PHOTO.cache[ck]=url;
  if(cb&&!asy)cb(url);
  return url;
}
/* la carte JOUE son film : une toile à la place du pictogramme, dès que la planche est décodée */
const FILM={l:[]};
function filmPose(el,url,id){const im=new Image(),cv=document.createElement('canvas');cv.className='fgFilm';cv.setAttribute('aria-hidden','true');
  im.onload=function(){if(!el.isConnected)return;const P=FILM_FIG,nc=Math.max(1,Math.round(im.naturalWidth/P.w)),nr=Math.max(1,Math.round(im.naturalHeight/P.h)),
      F={cv:cv,im:im,nc:nc,nr:nr,n:nc*nr,fw:im.naturalWidth/nc,fh:im.naturalHeight/nr,ms:figTours(window.FIG&&FIG.par[id])>=2?P.ms2:P.ms,t0:performance.now(),k:'',tm:0,vis:true,cw:0,ch:0};
    el.textContent='';el.appendChild(cv);FILM.l.push(F);filmDessine(F,F.t0);};
  im.src=url;}
function filmJoue(){const L=FILM.l;if(!L.length)return;const t=performance.now();
  for(let j=L.length-1;j>=0;j--){const F=L[j];if(!F.cv.isConnected){L.splice(j,1);continue;}filmDessine(F,t);}}
function filmDessine(F,t){const P=FILM_FIG,cv=F.cv;
  if(!F.tm||t-F.tm>250){F.tm=t;const b=cv.getBoundingClientRect(),R=F.rail||(F.rail=cv.closest('.bqRail'));let v=b.width>1&&b.height>1;
    if(v&&R){const r=R.getBoundingClientRect();v=b.bottom>r.top&&b.top<r.bottom&&b.right>r.left&&b.left<r.right;}
    const dp=Math.min(2.5,window.devicePixelRatio||1);F.vis=v;F.mw=Math.round(b.width*dp);F.mh=Math.round(b.height*dp);}
  if(!F.vis||!F.mw||!F.mh)return;
  const G=F.n*F.ms,e=(t-F.t0)%(P.avant+G+P.apres);
  const fk=REDUCED_MOTION?Math.round((F.n-1)*.45):e<P.avant?0:e<P.avant+G?(e-P.avant)/F.ms:F.n-1;
  let k=Math.min(F.n-1,Math.floor(fk)),a=P.fondu&&k<F.n-1?Math.round((fk-k)*6)/6:0;if(a>=1){k++;a=0;}
  const cle=k+':'+a;if(cle===F.k&&F.mw===F.cw&&F.mh===F.ch)return;F.k=cle;
  if(cv.width!==F.mw||cv.height!==F.mh){cv.width=F.mw;cv.height=F.mh;}F.cw=F.mw;F.ch=F.mh;
  const x=cv.getContext('2d'),cw=F.cw,ch=F.ch,s=Math.min(cw/F.fw,ch/F.fh),dw=F.fw*s,dh=F.fh*s,dx=(cw-dw)/2,dy=ch-dh, /* l'image ENTIÈRE, posée en bas de la case */
    img=function(n,al){x.globalAlpha=al;x.drawImage(F.im,(n%F.nc)*F.fw,Math.floor(n/F.nc)*F.fh,F.fw,F.fh,dx,dy,dw,dh);};
  x.clearRect(0,0,cw,ch);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
  if(a>0){x.globalCompositeOperation='lighter';img(k,1-a);img(k+1,a);x.globalCompositeOperation='source-over';} /* le FONDU : les deux images additionnées, pondérées (couleurs prémultipliées : la transparence reste juste) */
  else img(k,1);
  x.globalAlpha=1;}
window.dbgFigFilm=function(id,dir,o){if(o)Object.assign(FILM_FIG,o);if(!id){for(const k9 in PHOTO.cache)if(k9.indexOf('fa:')===0)delete PHOTO.cache[k9];return 'films des figures oublies';} /* (banc) le film d'une figure, refait (o : {w, h, cols, rows, el, elPlat, az, span, haut, bas, regu} du studio ; avant, ms, ms2, apres, fondu : le jeu de la carte) — rend la planche (dataURL) et les temps ; sans id : oublie tous les films (la boutique les refait) */
  const k='fa:'+id+':'+(dir||'cote')+':'+equippedCar();delete PHOTO.cache[k];
  const u=figFilm({k:k,fig:id,dir:dir||'cote'},null);const T=PHOTO.msF||{},r=function(v){return v==null?null:Math.round(v);};
  return {url:u,images:T.images,msCaisse:r(T.caisse),msRendu:r(T.rendu),msMontage:r(T.montage),msTotal:r(T.total),cartes:FILM.l.length,reglage:Object.assign({},FILM_FIG)};};
window.dbgAile=function(id,o){if(o)Object.assign(PHOTO_AILE,o);const j=COSM.aile.findIndex(function(d){return d.id===id;});if(j<0)return 'aile inconnue';const c=equippedCar(),k='a:'+id+':'+c;delete PHOTO.cache[k]; // (banc) la photo d'une aile, refaite (o : {el, az} du studio)
  const u=carPhoto(c,null,{k:k,j:j});return {url:u,box:PHOTO.ms&&PHOTO.ms.box,ailes:PHOTO.ms&&PHOTO.ms.ailes,caisse:CARS[c].name,reglage:Object.assign({},PHOTO_AILE)};};
window.dbgPhoto=function(){const T=PHOTO.ms;if(!T)return 'aucune photo';const r=v=>v==null?null:Math.round(v);return {caisse:CARS[T.i]&&CARS[T.i].name,msCaisse:r(T.caisse),msRendu:r(T.rendu),msPellicule:r(T.pellicule),msMontage:r(T.montage),msTotal:r(T.total),enAttente:PHOTO.att?Object.keys(PHOTO.att).length:0,enCache:Object.keys(PHOTO.cache).length};}; // (banc) le détail de la dernière photo
/* L'ATELIER DES CAISSES (dev, 2026-09-26) — `dbgEssaiCaisse(src, fiche, vues)` : essaie un gabarit ÉCRIT EN TEXTE (une expression
   `function(K){…}` au format de SHAPES — ou le nom d'un gabarit existant, pour comparer) sur une fiche, et rend des PHOTOS de studio
   720 × 440 (dataURL) sous les angles demandés (rotation Y de la caisse, en radians), plus le nombre de facettes et le hors-tout.
   C'est le banc des agents qui modèlent la gamme : on juge une caisse à l'œil, sans toucher au jeu. Refusé en pleine course. */
/* `dbgEssaiObjets()` (dev, 2026-09-26) — la planche des OBJETS DE LA ROUTE sous le studio photo : pièce, fruits, pouvoirs, plot.
   Une vignette 240 × 200 par objet, rendue à l'ÉCHELLE DU JEU (même taille relative), pour juger taille et facture d'un coup d'œil. */
/* `dbgEssaiFruit(src, pal)` (dev, 2026-09-26) — essaie un FRUIT écrit en texte (`function(K){…}` au format de FRUIT_DEFS[i].lp, avec la
   palette FRUIT_PAL complétée par `pal`) : 4 vues de studio 360 × 300, à l'échelle du jeu (×2,7), + facettes. Le banc de l'atelier. */
window.dbgEssaiFruit=function(src,pal){
  if(started&&!gameOver)return {err:'en course'};
  let f;try{f=(new Function('THREE','SPH','LPU','return ('+src+');'))(THREE,SPH,LPU);}catch(e){return {err:'SYNTAXE : '+e.message};}
  let geo;try{const K=lpKit(Object.assign({},FRUIT_PAL,pal||{}));f(K);geo=K.done().f;}catch(e){return {err:'CONSTRUCTION : '+e.message};}
  if(!geo)return {err:'aucune facette en matière f'};
  if(!FRUIT_MAT){FRUIT_MAT=lpMat('f');FRUIT_MAT.userData.lp=0;}
  carPhoto(0);const W=360,H=300,rt=new THREE.WebGLRenderTarget(W,H),cam=new THREE.PerspectiveCamera(30,W/H,.1,200);
  const m=new THREE.Mesh(geo,FRUIT_MAT);m.scale.setScalar(2.7);const vis=carGroup.visible;carGroup.visible=false;PHOTO.scene.add(m);
  const out={photos:[],facettes:Math.round(geo.attributes.position.count/3)};
  for(const a of [.5,2.1,3.7,5.3]){m.rotation.set(0,a,0);cam.position.set(6.5,3.2,8);cam.lookAt(0,.2,0);
    const prt=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.setClearColor(0x1e1838,1);renderer.clear();renderer.render(PHOTO.scene,cam);
    const buf=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(rt,0,0,W,H,buf);renderer.setRenderTarget(prt);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),im=x.createImageData(W,H);
    for(let y=0;y<H;y++){const s0=(H-1-y)*W*4;for(let k=0;k<W*4;k++)im.data[y*W*4+k]=buf[s0+k];}
    x.putImageData(im,0,0);out.photos.push(cv.toDataURL('image/png'));}
  PHOTO.scene.remove(m);geo.dispose();carGroup.visible=vis;rt.dispose();renderer.setClearColor(0x000000,0);
  return out;
};
window.dbgEssaiObjets=function(){
  if(started&&!gameOver)return {err:'en course'};
  carPhoto(0);const W=240,H=200,rt=new THREE.WebGLRenderTarget(W,H),cam=new THREE.PerspectiveCamera(30,W/H,.1,200);
  const objs=[['PIÈCE',()=>new THREE.Mesh(pickGeo,pickMat)]];
  for(let i=0;i<FRUIT_DEFS.length;i++)objs.push([FRUIT_DEFS[i].n,()=>mkFruit(i)]);
  for(const k of ['n','a','v'])objs.push(['POUVOIR '+k,()=>mkPower(k,1)]);
  const out=[];const vis=carGroup.visible;carGroup.visible=false;
  for(const o of objs){const m=o[1]();PHOTO.scene.add(m);m.position.set(0,0,0);m.rotation.y=.6;
    cam.position.set(4.2,2.4,5.2);cam.lookAt(0,.6,0);
    const prt=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.setClearColor(0x2a2140,1);renderer.clear();renderer.render(PHOTO.scene,cam);
    const buf=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(rt,0,0,W,H,buf);renderer.setRenderTarget(prt);
    PHOTO.scene.remove(m);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),im=x.createImageData(W,H);
    for(let y=0;y<H;y++){const s0=(H-1-y)*W*4;for(let k=0;k<W*4;k++){let v2=buf[s0+k];if((k&3)!==3)v2=Math.min(255,Math.pow(v2/255,1/1.3)*255);im.data[y*W*4+k]=v2;}}
    x.putImageData(im,0,0);x.fillStyle='#fff';x.font='8px "Press Start 2P",monospace';x.fillText(o[0],6,16);out.push(cv.toDataURL('image/png'));}
  carGroup.visible=vis;rt.dispose();renderer.setClearColor(0x000000,0);
  return {photos:out};
};
window.dbgEssaiCaisse=function(src,fiche,vues){
  if(started&&!gameOver)return {err:'en course : essai refusé'};
  const nom='__essai',W=window.__essaiW||720,H=window.__essaiH||440;let f;   /* (banc : `window.__essaiW/H` agrandit la photo — fixés avant le 1er essai) */
  if(typeof src==='string'&&SHAPES[src])f=SHAPES[src];
  else{try{f=(new Function('LPU','THREE','lpKit','return ('+src+');'))(LPU,THREE,lpKit);}catch(e){return {err:'SYNTAXE : '+e.message};}}
  if(typeof f!=='function')return {err:'le source ne rend pas une fonction'};
  SHAPES[nom]=f;if(fiche&&fiche.pot&&ECH_POTS[fiche.pot])ECH_POTS[nom]=ECH_POTS[fiche.pot];if(fiche&&fiche.pot&&LP_LARGES[fiche.pot])LP_LARGES[nom]=LP_LARGES[fiche.pot]; /* (facettes larges : l'essai prend la tolérance de son gabarit) */ /* (2026-10-17, banc) `fiche.pot` : l'essai porte LE POT d'un gabarit existant (sans lui, le pot générique) */
  const sp=Object.assign({name:'ESSAI',color:0xffffff,accent:0x222222,maxKmh:300,accel:30,turn:2.6,h:1.3,w:1.9,l:4.5,spoiler:0,desc:''},fiche||{});sp.shape=nom;
  CARS.push(sp);const i=CARS.length-1,out={photos:[]};
  const par=carGroup.parent,pos=carGroup.position.clone(),rot=carGroup.rotation.clone(),sc=carGroup.scale.clone(),vis=carGroup.visible;
  try{
    carPhoto(0); // le studio (scène + lumières) existe après la 1re photo
    if(!PHOTO.rt2){PHOTO.rt2=new THREE.WebGLRenderTarget(W,H);PHOTO.cam2=new THREE.PerspectiveCamera(30,W/H,.1,200);}
    const w0=[];const oc=console.warn;console.warn=function(){w0.push([].join.call(arguments,' '));oc.apply(console,arguments);};
    try{buildCar(sp);}catch(e){console.warn=oc;return {err:'CONSTRUCTION : '+e.message+' | '+String(e.stack||'').split('\n').slice(1,3).join(' ¶ ')};}
    console.warn=oc;if(w0.length)out.avert=w0;
    PHOTO.scene.add(carGroup);carGroup.position.set(0,0,0);carGroup.rotation.set(0,0,0);carGroup.scale.set(1,1,1);carGroup.visible=true;photoPropre();
    let tri=0;const bb=new THREE.Box3(),dim=new THREE.Vector3();carGroup.updateMatrixWorld(true);
    carGroup.traverse(o=>{let v=o,vu=true;while(v){if(!v.visible){vu=false;break;}v=v.parent;}
      if(vu&&o.isMesh&&o.userData&&o.userData.lp&&o.geometry&&o.geometry.attributes.position){tri+=o.geometry.attributes.position.count/3;bb.expandByObject(o);}});
    out.facettes=Math.round(tri);bb.getSize(dim);out.horsTout=[+dim.x.toFixed(2),+dim.y.toFixed(2),+dim.z.toFixed(2)]; // la carrosserie et les roues (visibles) seulement
    const L=Math.max(3.2,sp.l||4.5,(sp.h||1.3)*1.7),yv=Math.max(.62,(sp.h||1.3)*.45);
    for(const v0 of (vues||[.72])){const v=Array.isArray(v0)?v0[0]:v0,kh=Array.isArray(v0)?v0[1]:1,kd=Array.isArray(v0)&&v0[2]||1; /* (2026-10-17, banc) une vue [rotation, ×hauteur, ×distance] : de plus haut (la poursuite), de plus près (un détail) */
      carGroup.rotation.set(0,v,0);PHOTO.cam2.position.set(L*1.05*kd,L*.42*kh*kd,L*1.18*kd);PHOTO.cam2.lookAt(0,yv,0);
      const cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha(),prt=renderer.getRenderTarget();
      renderer.setRenderTarget(PHOTO.rt2);renderer.setClearColor(0x2a2140,1);renderer.clear();renderer.render(PHOTO.scene,PHOTO.cam2);
      const buf=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(PHOTO.rt2,0,0,W,H,buf);
      renderer.setRenderTarget(prt);renderer.setClearColor(cc,ca);
      const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),im=x.createImageData(W,H);
      for(let y=0;y<H;y++){const s0=(H-1-y)*W*4;for(let k=0;k<W*4;k++){let v2=buf[s0+k];if((k&3)!==3)v2=Math.min(255,Math.pow(v2/255,1/1.3)*255);im.data[y*W*4+k]=v2;}}
      x.putImageData(im,0,0);out.photos.push(cv.toDataURL('image/png'));
    }
  }finally{
    CARS.pop();delete SHAPES[nom];delete ECH_POTS[nom];delete LP_LARGES[nom];
    if(par)par.add(carGroup);carGroup.position.copy(pos);carGroup.rotation.copy(rot);carGroup.scale.copy(sc);carGroup.visible=vis;
    try{buildCar(CARS[equippedCar()]);}catch(e){}
  }
  return out;
};
/* (2026-10-20, Sacha : « il faut que ça soit plus clair que Pop-Tart-Cat est vendu avec la traînée arc-en-ciel ») LA PASTILLE ARC-EN-CIEL : le CHAT POP-TART
   s'achète AVEC la traînée arc-en-ciel (voir chatPackI) ; la vitrine et la fenêtre d'achat le disent par une pastille aux couleurs de la traînée, « INCLUSE »
   (le prix couvre les deux). Rien tant qu'on a déjà le chat. Le style : `.shArc` dans <style id="achatPop">. */
function shArcHtml(i,a){return (i===chatPackI()&&!a)?'<i class="shArc">'+insec(sansAcc(TR('+ TRAÎNÉE ARC-EN-CIEL INCLUSE')))+'</i>':'';}
// LA VITRINE : l'offre à la une (la premium marquée `une`) et la grille des autres, par rareté
function shopRender(){
  const une=document.getElementById('shUne'),gr=document.getElementById('shGrille');if(!une||!gr)return;
  const RAR={leg:'LÉGENDAIRE',epi:'ÉPIQUE',rar:'RARE'};let hU='',hG=''; // (2026-09-26) toutes LÉGENDAIRES : la boutique est leur seule porte
  for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(!u||u.k!=='premium'||carRetiree(i))continue; // (2026-10-06) une caisse RETIRÉE quitte aussi la vitrine
    const ph=PHOTO.cache[i],img=ph?'<img src="'+ph+'" alt="">':'<i class="pxi pxi-voiture shAttente"></i>',a=carOwned(i);if(!ph)shopPhotoVeut(i); // (revue GAMEPLAY) plus de carPhoto EN SYNCHRONE : 13 photos d'un bloc = 1,1 s de gel sur PC (2-3 s sur iPhone) à la 1re ouverture
    if(u.une&&!hU&&!a){ // (charte v4) la VITRINE DE LÉGENDE : cadre d'or qui scintille autour (`.shUne`), le décor dedans (`.shUneCadre`)
      hU='<div class="shUneCadre"><div class="shPhoto big">'+img+'</div>'
        +'<div class="shUneTx"><b>'+insec(TR(CARS[i].name))+'</b>'+shArcHtml(i,a)+'</div>' /* (2026-10-15 soir, Sacha : « enlève le texte super long au-dessous de CHAT POP-TART, ça sert à rien ») plus de phrase sous le nom : la fenêtre d'achat la garde */
        +'<div class="shUneBas"><em>'+eurTxt(u.eur)+'</em><span class="shBtn'+(a?' aToi':'')+'">'+pxi(a?'coche':'panier')+TR(a?'À TOI':'ACHETER')+'</span></div></div>';
      une.setAttribute('data-car',i);continue;}
    hG+='<div class="shCase '+(u.rar||'rar')+'" data-m="shopSoon" data-car="'+i+'" role="button"><span class="shRare">'+TR(RAR[u.rar||'rar'])+'</span>'
      +'<div class="shPhoto">'+img+'</div><b class="shNom">'+TR(CARS[i].name)+'</b><span class="shPrix'+(a?' aToi':'')+'">'+(a?TR('À TOI'):eurTxt(u.eur))+'</span></div>';
  }
  une.innerHTML=hU;gr.innerHTML=hG;
}
