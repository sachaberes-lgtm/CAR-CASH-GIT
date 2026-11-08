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
   Photo rangée sous `vt<ver>_<largeur>_<caisse>[s]` (PHOTO.cache + PHDB, comme les autres). `?vitrine=1` = la vitrine (éteinte par défaut depuis le 07/11, voir VITM).
   Banc : dbgVitrine(i) (photo refaite, en data:), dbgVitrine({az, el, …}) (réglages), dbgVitrine('cartes') (les cartes de la grille). */
/* (2026-11-07, Léo : « il y a un push qui a annulé le travail de la voiture dans le cube, il y a une plaque noire ; reviens sur le travail final sur les boîtes transparentes avec le sol quadrillé et les voitures ») LA VITRINE EST ÉTEINTE PAR DÉFAUT : la boutique garde le cube de verre à sol quadrillé et les voitures posées dedans (boites-blister.css, bqBas). Elle reste intacte et s'allume avec `?vitrine=1`. */
/* (2026-11-07, Léo : « fais encore mieux, plus vendeur, que Sacha kiffe : son idée de boîte n'est pas dégueu, mais mon rendu est cool ; faire différent des autres cosmétiques ») DEUX STYLES, UN MOTEUR : `leo` (par défaut) = la vitrine de Sacha (la caisse photographiée sous l'angle exact de la boîte, son socle NOIR VERNI et son vrai reflet) habillée du langage de Léo — le QUADRILLAGE du sol en fils clairs, le fond de studio lumineux teinté de la rareté, les arêtes franches à la couleur de la rareté, l'ombre sous les roues ; `sacha` (`?vitrine=sacha`) = le socle noir verni d'origine. */
/* (2026-11-07, Léo : « la plaque noire, c'est un bloc de route du jeu ; on essaie sur une branche ») TROISIÈME STYLE, `route` (par défaut) : le socle est un BLOC DE LA ROUTE DU JEU — son béton brut (asphTex, BETON), ses flancs, la ligne jaune du milieu, les lignes de bord — rendu en 3D par la même caméra que la caisse (vitBloc), avec le verre, le fond de studio et les arêtes du style `leo` ; `?vitrine=leo` = socle noir verni + quadrillage, `?vitrine=sacha` = l'original. */
/* (2026-11-07, Léo : « oui, sur le main ») LA VITRINE BLOC DE ROUTE EST ALLUMÉE PAR DÉFAUT ; `?vitrine=0` = le cube CSS d'avant. */
const VITM={on:!/[?&]vitrine=0\b/.test(location.search),style:/[?&]vitrine=sacha\b/.test(location.search)?'sacha':/[?&]vitrine=route\b/.test(location.search)?'route':'leo',ver:10, /* ver 10 (2026-11-08) : lampes de vitrine, faisceau, arêtes derrière la caisse */ /* ver 9 (2026-11-07) : le fond de boîte opaque, la vitre sur toutes les caisses */ /* (2026-11-07, Sacha : « les boîtes donnent pas envie ») ver 8 : la boîte de verre resserrée sur la caisse (L, P, Hc, po, remp ci-dessous) — les photos d'avant (ver 7) ne servent plus ; */ /* (2026-11-07, Léo : « laisse le socle noir de Sacha ; je ne vois plus les vitres ») le style par défaut redevient `leo` (socle noir verni + quadrillage, verre de Léo) ; le bloc de route : `?vitrine=route` */
  az:.52,el:.36,fov:17,       /* l'objectif : 30° d'azimut (on voit l'avant et le côté droit), 21° de plongée (le dessus du socle et le toit), objectif long */
  L:4.5,P:2.2,Hc:1.5,          /* le capot de verre : longueur (axe de la caisse), profondeur, hauteur — en mètres du jeu. (2026-11-07, Sacha : « ça peut être beaucoup mieux ») resserré sur la caisse : 5,3 × 2,6 × 1,95 laissait la voiture à 60 % de la carte, elle en prend ~80 % ; la plus longue est réduite pour tenir */
  ph:.42,po:.16,              /* le socle : hauteur, débord autour du verre (0,30 avant : un rebord noir épais) */
  remp:.97,                   /* la caisse prend au plus 97 % de la longueur du verre (et 84 % de sa hauteur, 90 % de sa profondeur) */
  cam:null,rt:null,fit:null};
function vitLarg(){return (typeof ALLEGE!=='undefined'&&ALLEGE)?480:640;}
function vitrineCle(i,sec,own,w){return 'vt'+VITM.ver+({leo:'L',route:'R'}[VITM.style]||'')+'_'+(w||vitLarg())+'_'+i+(sec?'s':'');} /* s : la silhouette d'une SECRÈTE · o : une caisse À TOI, sortie de sa boîte · w : une largeur à part (2026-11-07, la grande boîte de la page ACHAT : 720, voir shopRender) */
function vitrineFile(i,sec,own,cb,el){const k=vitrineCle(i,sec,own);if(PHOTO.cache[k]){cb(PHOTO.cache[k]);return;}
  PHQ.q.push([k,cb,{vt:1,i:i,sec:!!sec,own:!!own,k:k},el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
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
/* LE BLOC DE ROUTE (style `route`) : une dalle de la route du jeu, aux dimensions du socle — dessus en béton brut (la tuile du jeu, asphTex), flancs plus sombres, tirets jaunes au milieu, lignes blanches de bord, liseré de la rareté sur l'arête avant et l'arête droite. Le nez de la caisse est vers +x : la route file dans le sens de la caisse. */
function vitBloc(rc){const a=VITM.L/2+VITM.po,b=VITM.P/2+VITM.po,ph=VITM.ph,G=new THREE.Group();
  const t=asphTex().clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2*a*.3,2*b*.3);
  const dessus=new THREE.MeshLambertMaterial({color:0x4a4741,map:t}),av=new THREE.MeshLambertMaterial({color:0x2e2c28}),co=new THREE.MeshLambertMaterial({color:0x201f1c}); /* le studio photo éclaire fort (il est réglé pour les caisses) : le béton est foncé ici pour sortir du gris de la route en course */
  const bx=new THREE.Mesh(new THREE.BoxGeometry(2*a,ph,2*b),[co,co,dessus,co,av,co]);bx.position.y=-ph/2;G.add(bx);
  const ligne=function(w,d,x,z,col){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:col}));m.rotation.x=-Math.PI/2;m.position.set(x,.006,z);G.add(m);};
  for(let X=-a+.3;X+.55<a-.2;X+=1.0)ligne(.55,.09,X+.275,0,0xffc61a);
  ligne(2*a-.24,.055,0,b-.2,0xf0f0ec);ligne(2*a-.24,.055,0,-(b-.2),0xf0f0ec);
  const n=parseInt(String(rc).replace('#',''),16);const cl=new THREE.MeshBasicMaterial({color:isFinite(n)?n:0xb9c4d6});
  const l1=new THREE.Mesh(new THREE.BoxGeometry(2*a+.01,.05,.05),cl);l1.position.set(0,-.025,b);G.add(l1);
  const l2=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,2*b+.01),cl);l2.position.set(a,-.025,0);G.add(l2);
  return G;}
function vitBlocJette(G){if(!G)return;if(G.parent)G.parent.remove(G);G.traverse(function(o){if(o.geometry)o.geometry.dispose();const m=o.material;(Array.isArray(m)?m:m?[m]:[]).forEach(function(q){if(q.map&&q.map!==ASPH_TEX)q.map.dispose();q.dispose();});});}
function vitHex(c,a){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));const n=m?parseInt(m[1],16):0xb9c4d6;return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function vitMix(c,k,al){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));const n=m?parseInt(m[1],16):0xb9c4d6,f=function(v){return Math.round(v+(255-v)*k);};return (al==null?'rgb(':'rgba(')+f(n>>16&255)+','+f(n>>8&255)+','+f(n&255)+(al==null?'':','+al)+')';} /* al : une transparence (rgba) */
function vitFonce(c,k){const m=/^#?([0-9a-f]{6})$/i.exec(String(c||''));const n=m?parseInt(m[1],16):0xb9c4d6,D=[18,15,30],f=function(v,d){return Math.round(v+(d-v)*k);};return 'rgb('+f(n>>16&255,D[0])+','+f(n>>8&255,D[1])+','+f(n&255,D[2])+')';} /* la teinte vers l'encre de nuit du jeu (k = 1 : l'encre) */
function vitrinePhoto(o,cb){const i=o.i|0,sec=!!o.sec,own=false,ck=vitrineCle(i,sec,own,o.w); /* (2026-11-07, Sacha : « certaines voitures n'ont pas de vitres, c'est lamentable ») TOUTES les boîtes ont leur verre, à toi ou pas : `own` n'enlève plus rien */ /* o.w : la largeur de l'image (par défaut vitLarg) */
  if(PHOTO.cache[ck]){if(cb)cb(PHOTO.cache[ck]);return PHOTO.cache[ck];}
  if(started&&!gameOver){if(cb)cb(null);return null;}
  if(cb&&PHOTO.att&&PHOTO.att[ck]){PHOTO.att[ck].push(cb);return null;}
  const T9=VITM.ms={i:i,t0:performance.now()},W=o.w||vitLarg(),H=Math.round(W*440/720);
  photoStudio();
  const par=carGroup.parent,pos=carGroup.position.clone(),rot=carGroup.rotation.clone(),sc0=carGroup.scale.clone(),vis=carGroup.visible;
  if(!PHOTO.chaine)PHOTO.avant=carGroup.userData.lvl;
  PHOTO_USINE=true;const sig9=phdbSig();let asy=false,url=null,blocR=null,cvB=null,blocLampes=null;
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
    /* (2026-11-08, Sacha : « améliore comment les voitures sont présentées et éclairées, ça donne pas assez envie ») LES LAMPES DE VITRINE : un spot chaud
       au-dessus de la caisse (le toit et le capot accrochent la lumière) et un contre-jour à la couleur de la rareté (un liseré brillant sur le haut des
       ailes et du toit, la caisse se détache du fond). Posées pour les prises de la vitrine seulement, retirées juste après (voir plus bas). */
    const rcL=(sec?'#ff3ec8':(rarInfo(carRar(i)).c||'#b9c4d6')),lSpot=new THREE.SpotLight(0xfff1d8,.75,18,.62,.6,1.4),lRim=new THREE.DirectionalLight(new THREE.Color(rcL).lerp(new THREE.Color(0xffffff),.35),.7);
    lSpot.position.set(-.6,5.2,1.2);lSpot.target.position.set(0,0,0);lRim.position.set(-4.5,3.2,-5.5);PHOTO.scene.add(lSpot,lSpot.target,lRim);blocLampes=[lSpot,lSpot.target,lRim];
    /* 0. (style route) le BLOC DE ROUTE, rendu seul (la caisse cachée) : il passe sous la caisse au montage */
    if(VITM.style==='route'){blocR=vitBloc(sec?'#ff3ec8':(rarInfo(carRar(i)).c||'#b9c4d6'));PHOTO.scene.add(blocR);const v0=carGroup.visible;carGroup.visible=false;cvB=vitRend(PHOTO.scene,cam,W,H);carGroup.visible=v0;blocR.visible=false;}
    /* 1. le REFLET : la caisse en miroir sous le plan du socle (y = 0) — le moteur retourne lui-même le sens des faces (déterminant négatif) */
    let cvR=null;if(!sec&&VITM.style!=='route'){ /* le béton est mat : pas de reflet sur un bloc de route */carGroup.scale.set(s,-s,s);carGroup.position.y=-py;carGroup.updateMatrixWorld(true);cvR=vitRend(PHOTO.scene,cam,W,H);
      carGroup.scale.set(s,s,s);carGroup.position.y=py;carGroup.updateMatrixWorld(true);}
    /* 2. la caisse */
    const cvC=vitRend(PHOTO.scene,cam,W,H);T9.rendu=performance.now()-T9.t0;
    /* 3. le montage : socle, verre du fond, reflet, caisse, verre de devant */
    const rc=(sec?'#ff3ec8':(rarInfo(carRar(i)).c||'#b9c4d6')),u=W/240;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
    const v9=new THREE.Vector3(),P=function(X,Y,Z){v9.set(X,Y,Z).project(cam);return [(v9.x*.5+.5)*W,(1-(v9.y*.5+.5))*H];};
    const poly=function(L){x.beginPath();x.moveTo(L[0][0],L[0][1]);for(let k=1;k<L.length;k++)x.lineTo(L[k][0],L[k][1]);x.closePath();};
    const a=VITM.L/2,b=VITM.P/2,A=a+VITM.po,B=b+VITM.po,h=VITM.Hc,ph=VITM.ph;
    if(VITM.style!=='sacha'){ /* styles leo ET route — (2026-11-07, Léo : « sa règle compte : quand on appuie ACHETER la vitre se casse, et elle disparaît ») une caisse À TOI n'a pas de verre ; à l'achat, bqVitreBrise (vitre-brisee.js) fait éclater la vitre et la carte reçoit sa vitrine sans verre */
    /* ===== LE STYLE DE LÉO : sol de verre quadrillé, fond de studio, ombre douce ===== */
    const a=VITM.L/2,b=VITM.P/2,A=a+VITM.po,B=b+VITM.po,h=VITM.Hc,ph=VITM.ph,c=function(X,Y,Z){return P(X,Y,Z);};
    const arete=function(p,q,w,col){x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.stroke();};
    x.lineJoin='round';x.lineCap='round';
    const Q={bk:[c(-a,0,-b),c(a,0,-b),c(a,h,-b),c(-a,h,-b)],lf:[c(-a,0,b),c(-a,0,-b),c(-a,h,-b),c(-a,h,b)],
       fr:[c(-a,0,b),c(a,0,b),c(a,h,b),c(-a,h,b)],rt:[c(a,0,b),c(a,0,-b),c(a,h,-b),c(a,h,b)],tp:[c(-a,h,-b),c(a,h,-b),c(a,h,b),c(-a,h,b)]};
    /* le socle NOIR VERNI de Sacha (2026-11-07, Léo : « laisse la plaque noire de Sacha ») : dessus, avant, côté */
    const sT=[c(-A,0,-B),c(A,0,-B),c(A,0,B),c(-A,0,B)],sF=[c(-A,0,B),c(A,0,B),c(A,-ph,B),c(-A,-ph,B)],sR=[c(A,0,B),c(A,0,-B),c(A,-ph,-B),c(A,-ph,B)];
    if(VITM.style==='route'){if(cvB){x.drawImage(cvB,0,0);toileRend(cvB);}}else
    {let g=x.createLinearGradient(sF[0][0],sF[0][1],sF[3][0],sF[3][1]);g.addColorStop(0,'#1d2029');g.addColorStop(1,'#0b0c10');x.fillStyle=g;poly(sF);x.fill();
     g=x.createLinearGradient(sR[0][0],sR[0][1],sR[1][0],sR[1][1]);g.addColorStop(0,'#101218');g.addColorStop(1,'#060709');x.fillStyle=g;poly(sR);x.fill();
     g=x.createLinearGradient(sT[0][0],sT[0][1],sT[2][0],sT[2][1]);g.addColorStop(0,'#3a3f4c');g.addColorStop(.45,'#1a1d25');g.addColorStop(1,'#0e1015');x.fillStyle=g;poly(sT);x.fill();}
    /* (2026-11-07, Sacha : « les voitures font toujours pas envie, retravaille la boîte, encore mieux ») LE FOND DE LA BOÎTE : un carton imprimé,
       OPAQUE, à la couleur de la rareté — profond en haut, une lumière qui tombe derrière la caisse, plus clair au ras du sol — et la paroi de
       gauche dans son ombre. La caisse se détache dessus comme dans une boîte de collection, et la carte n'a plus besoin de fond à elle. */
    {const fo=vitFonce(rc,.74),mi=vitFonce(rc,.5),cl=vitFonce(rc,.3);
     let g=x.createLinearGradient(0,Q.bk[2][1],0,Q.bk[0][1]);g.addColorStop(0,fo);g.addColorStop(.6,mi);g.addColorStop(1,cl);x.fillStyle=g;poly(Q.bk);x.fill();
     const m0=c(-a*.08,h*.5,-b),R0=Math.hypot(Q.bk[1][0]-Q.bk[0][0],Q.bk[1][1]-Q.bk[0][1])*.46;x.save();poly(Q.bk);x.clip();
     g=x.createRadialGradient(m0[0],m0[1],0,m0[0],m0[1],R0);g.addColorStop(0,vitMix(rc,.6,.9));g.addColorStop(.42,vitHex(rc,.42));g.addColorStop(1,vitHex(rc,0));x.fillStyle=g;x.fillRect(0,0,W,H);
     /* le bandeau de lumière du plafond : la rampe qui éclaire la caisse, au haut du fond */
     g=x.createLinearGradient(0,Q.bk[2][1],0,Q.bk[2][1]+(Q.bk[1][1]-Q.bk[2][1])*.14);g.addColorStop(0,'rgba(255,255,255,.32)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H);x.restore();
     g=x.createLinearGradient(Q.lf[1][0],0,Q.lf[0][0],0);g.addColorStop(0,vitFonce(rc,.62));g.addColorStop(1,vitFonce(rc,.84));x.fillStyle=g;poly(Q.lf);x.fill();
     /* l'arête du fond et du sol, et celle du coin : un pli plus sombre */
     x.save();x.lineCap='round';x.strokeStyle='rgba(10,8,20,.45)';x.lineWidth=1.4*u;x.beginPath();x.moveTo(Q.bk[0][0],Q.bk[0][1]);x.lineTo(Q.bk[3][0],Q.bk[3][1]);x.stroke();x.restore();}
    /* le QUADRILLAGE du sol (le sol du cube de Léo), dans l'emprise du verre, qui s'efface vers le fond */
    if(VITM.style!=='route'){x.save();poly([c(-a,0,-b),c(a,0,-b),c(a,0,b),c(-a,0,b)]);x.clip();const nx=10,nz=5;
     const gc=vitMix(rc,.45).replace('rgb(','').replace(')','');for(let k=0;k<=nx;k++){const X=-a+2*a*k/nx;arete(c(X,0,-b),c(X,0,b),.7*u,'rgba('+gc+',.20)');}
     for(let k=0;k<=nz;k++){const Z=-b+2*b*k/nz;arete(c(-a,0,Z),c(a,0,Z),.7*u,'rgba('+gc+','+(.10+.22*k/nz).toFixed(2)+')');} /* le quadrillage de Léo, en fils clairs teintés de la rareté sur le noir verni, plus marqués vers l'avant */
     x.restore();}
    if(!own){const col=vitHex(rc,.60);arete(c(-a,0,-b),c(a,0,-b),1.1*u,col);arete(c(-a,0,-b),c(-a,0,b),1.1*u,col);arete(c(-a,0,-b),c(-a,h,-b),1.1*u,col);}
    /* la flaque de lumière de la rampe sur le sol, autour de la caisse */
    {const o9=c(0,0,0),e1=c(a*.95,0,0),e2=c(0,0,b*.95);x.save();poly([c(-a,0,-b),c(a,0,-b),c(a,0,b),c(-a,0,b)]);x.clip();x.setTransform(e1[0]-o9[0],e1[1]-o9[1],e2[0]-o9[0],e2[1]-o9[1],o9[0],o9[1]);
     const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,vitMix(rc,.5,.55));g.addColorStop(.6,vitMix(rc,.2,.18));g.addColorStop(1,vitMix(rc,.3,0));x.fillStyle=g;x.fillRect(-1.2,-1.2,2.4,2.4);x.restore();}
    /* le reflet dans le sol de verre : la prise en miroir, discrète, qui s'éteint en s'éloignant des roues */
    const yb=P(0,0,0)[1];
    if(cvR){const t=document.createElement('canvas');t.width=W;t.height=H;const tx=t.getContext('2d');tx.drawImage(cvR,0,0);
      tx.globalCompositeOperation='destination-in';const g=tx.createLinearGradient(0,yb-H*.06,0,yb+H*.16);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(0,0,W,H);
      x.save();poly(sT);x.clip();x.drawImage(t,0,0);x.restore();toileRend(t);toileRend(cvR);}
    /* l'OMBRE douce sous la caisse : une ellipse posée sur le sol, à la taille de son empreinte (la même caméra la met en perspective) */
    {const o9=c(0,0,0),e1=c(sz.x*s*.58,0,0),e2=c(0,0,sz.z*s*.70);x.save();x.setTransform(e1[0]-o9[0],e1[1]-o9[1],e2[0]-o9[0],e2[1]-o9[1],o9[0],o9[1]);
     const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(.55,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(-1.1,-1.1,2.2,2.2);x.restore();}
    /* le liseré de rareté sur l'arête avant du sol, et le fil clair de la tranche */
    if(VITM.style!=='route'){arete(sT[3],sT[2],1.6*u,vitHex(rc,.95));arete(sT[2],sT[1],1.6*u,vitHex(rc,.75));arete(sF[3],sF[2],.8*u,'rgba(0,0,0,.6)');}
    /* (2026-11-08) LE FAISCEAU de la lampe de vitrine : un cône de lumière qui tombe du plafond sur la caisse, deux couches pour un bord doux (la toile n'a pas de flou sur iPhone) */
    {const bm=function(k,al){const g=x.createLinearGradient(0,Q.tp[0][1],0,P(0,0,0)[1]);g.addColorStop(0,vitMix(rc,.75,al));g.addColorStop(.7,vitMix(rc,.55,al*.35));g.addColorStop(1,vitMix(rc,.5,0));x.fillStyle=g;
       poly([c(-a*.3*k,h,-b*.1),c(a*.2*k,h,-b*.1),c(a*(.95+.1*k),0,b*.35),c(-a*(.95+.1*k),0,b*.35)]);x.fill();};bm(1.9,.07);bm(1.35,.09);bm(.8,.10);}
    /* (2026-11-08) le LUSTRE du sol sous la caisse : l'ellipse chaude que le spot dessine, plus vive que la flaque d'avant */
    {const o9=c(0,0,0),e1=c(a*.8,0,0),e2=c(0,0,b*.8);x.save();poly([c(-a,0,-b),c(a,0,-b),c(a,0,b),c(-a,0,b)]);x.clip();x.setTransform(e1[0]-o9[0],e1[1]-o9[1],e2[0]-o9[0],e2[1]-o9[1],o9[0],o9[1]);
     const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(255,248,232,.34)');g.addColorStop(.5,vitMix(rc,.55,.16));g.addColorStop(1,vitMix(rc,.5,0));x.fillStyle=g;x.fillRect(-1.2,-1.2,2.4,2.4);x.restore();}
    /* (2026-11-08, Sacha : « les arêtes des boîtes passent par-dessus les voitures ») LES ARÊTES DE LA BOÎTE PASSENT DERRIÈRE LA CAISSE : tracées AVANT elle,
       la caisse les recouvre (l'arête du toit et celle du coin avant coupaient le capot et les vitres) ; elles ne se voient que de part et d'autre */
    if(!own){const E=[[c(-a,0,b),c(a,0,b)],[c(a,0,b),c(a,0,-b)],[c(-a,0,b),c(-a,h,b)],[c(a,0,b),c(a,h,b)],[c(a,0,-b),c(a,h,-b)],
              [c(-a,h,b),c(a,h,b)],[c(a,h,b),c(a,h,-b)],[c(-a,h,-b),c(a,h,-b)],[c(-a,h,-b),c(-a,h,b)]],col=vitMix(rc,.06);
     for(const e of E)arete(e[0],e[1],2.6*u,col);for(const e of E)arete(e[0],e[1],.8*u,'rgba(255,255,255,.92)');}
    /* la caisse (une SECRÈTE : sa silhouette noire, détourée de rose) */
    if(sec){const t=document.createElement('canvas');t.width=W;t.height=H;const tx=t.getContext('2d');tx.drawImage(cvC,0,0);tx.globalCompositeOperation='source-in';tx.fillStyle='#0b0b12';tx.fillRect(0,0,W,H);
      x.save();x.shadowColor='rgba(255,62,200,.95)';x.shadowBlur=2.2*u;x.drawImage(t,0,0);x.restore();toileRend(t);}
    else x.drawImage(cvC,0,0);
    toileRend(cvC);
    /* le verre de devant, clair (la caisse reste nette) : deux reflets en biais, les arêtes à la couleur de la rareté avec leur cœur blanc */
    if(!own){let g=x.createLinearGradient(Q.rt[0][0],0,Q.rt[1][0],0);g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(255,255,255,.04)');x.fillStyle=g;poly(Q.rt);x.fill();
     g=x.createLinearGradient(0,Q.tp[0][1],0,Q.tp[2][1]);g.addColorStop(0,'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(255,255,255,.15)');x.fillStyle=g;poly(Q.tp);x.fill();
     const f0=Q.fr[3],f1=Q.fr[1];g=x.createLinearGradient(f0[0],f0[1],f1[0],f1[1]);
     g.addColorStop(0,'rgba(255,255,255,.06)');g.addColorStop(.14,'rgba(255,255,255,.15)');g.addColorStop(.21,'rgba(255,255,255,.02)');g.addColorStop(.27,'rgba(255,255,255,.07)');g.addColorStop(.31,'rgba(255,255,255,0)');
     g.addColorStop(.72,'rgba(255,255,255,0)');g.addColorStop(.86,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(255,255,255,.02)');x.fillStyle=g;poly(Q.fr);x.fill();
     /* les arêtes sont tracées plus haut, derrière la caisse ; ici seulement l'éclat du coin le plus proche, petit et discret */
     const k0=c(a,h,b),g2=x.createRadialGradient(k0[0],k0[1],0,k0[0],k0[1],6*u);g2.addColorStop(0,'rgba(255,255,255,.7)');g2.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g2;x.fillRect(k0[0]-7*u,k0[1]-7*u,14*u,14*u);}
    }else{
    /* le socle : dessus (y = 0), avant (z = +B), côté (x = +A) */
    const sT=[P(-A,0,-B),P(A,0,-B),P(A,0,B),P(-A,0,B)],sF=[P(-A,0,B),P(A,0,B),P(A,-ph,B),P(-A,-ph,B)],sR=[P(A,0,B),P(A,0,-B),P(A,-ph,-B),P(A,-ph,B)];
    {let g=x.createLinearGradient(sF[0][0],sF[0][1],sF[3][0],sF[3][1]);g.addColorStop(0,'#1d2029');g.addColorStop(1,'#0b0c10');x.fillStyle=g;poly(sF);x.fill();
     g=x.createLinearGradient(sR[0][0],sR[0][1],sR[1][0],sR[1][1]);g.addColorStop(0,'#101218');g.addColorStop(1,'#060709');x.fillStyle=g;poly(sR);x.fill();
     g=x.createLinearGradient(sT[0][0],sT[0][1],sT[2][0],sT[2][1]);g.addColorStop(0,'#3a3f4c');g.addColorStop(.45,'#1a1d25');g.addColorStop(1,'#0e1015');x.fillStyle=g;poly(sT);x.fill();}
    /* le verre du fond (vitre du fond z = -b, vitre de gauche x = -a), à peine teinté de la rareté, et ses arêtes cachées, fines */
    const c=function(X,Y,Z){return P(X,Y,Z);},
      Q={bk:[c(-a,0,-b),c(a,0,-b),c(a,h,-b),c(-a,h,-b)],lf:[c(-a,0,b),c(-a,0,-b),c(-a,h,-b),c(-a,h,b)],
         fr:[c(-a,0,b),c(a,0,b),c(a,h,b),c(-a,h,b)],rt:[c(a,0,b),c(a,0,-b),c(a,h,-b),c(a,h,b)],tp:[c(-a,h,-b),c(a,h,-b),c(a,h,b),c(-a,h,b)]};
    if(!own){let g=x.createLinearGradient(0,Q.bk[2][1],0,Q.bk[0][1]);g.addColorStop(0,vitHex(rc,.22));g.addColorStop(1,vitHex(rc,.08));x.fillStyle=g;poly(Q.bk);x.fill();
     g=x.createLinearGradient(Q.lf[1][0],0,Q.lf[0][0],0);g.addColorStop(0,vitHex(rc,.20));g.addColorStop(1,vitHex(rc,.06));x.fillStyle=g;poly(Q.lf);x.fill();}
    x.lineJoin='round';x.lineCap='round';
    const arete=function(p,q,w,col){x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(q[0],q[1]);x.stroke();};
    if(!own){const col=vitHex(rc,.45);arete(c(-a,0,-b),c(a,0,-b),1.2*u,col);arete(c(-a,0,-b),c(-a,0,b),1.2*u,col);arete(c(-a,0,-b),c(-a,h,-b),1.2*u,col);}
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
    /* le verre de devant : côté droit, dessus, vitre de devant — un voile blanc à peine, deux reflets en biais sur la vitre de devant.
       Une caisse À TOI n'a plus de verre : la vitre s'est brisée à l'achat (vitre-brisee.js), elle trône à l'air libre sur son socle. */
    if(!own){let g=x.createLinearGradient(Q.rt[0][0],0,Q.rt[1][0],0);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,.05)');x.fillStyle=g;poly(Q.rt);x.fill();
     g=x.createLinearGradient(0,Q.tp[0][1],0,Q.tp[2][1]);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,.30)');x.fillStyle=g;poly(Q.tp);x.fill();
     const f0=Q.fr[3],f1=Q.fr[1];g=x.createLinearGradient(f0[0],f0[1],f1[0],f1[1]);
     g.addColorStop(0,'rgba(255,255,255,.10)');g.addColorStop(.14,'rgba(255,255,255,.34)');g.addColorStop(.21,'rgba(255,255,255,.05)');g.addColorStop(.27,'rgba(255,255,255,.16)');g.addColorStop(.31,'rgba(255,255,255,0)');
     g.addColorStop(.70,'rgba(255,255,255,0)');g.addColorStop(.86,'rgba(255,255,255,.10)');g.addColorStop(1,'rgba(255,255,255,.02)');x.fillStyle=g;poly(Q.fr);x.fill();}
    /* les arêtes de devant : la couleur de la rareté, un cœur blanc (la tranche du verre qui prend la lumière) */
    if(!own){const E=[[c(-a,0,b),c(a,0,b)],[c(a,0,b),c(a,0,-b)],[c(-a,0,b),c(-a,h,b)],[c(a,0,b),c(a,h,b)],[c(a,0,-b),c(a,h,-b)],
              [c(-a,h,b),c(a,h,b)],[c(a,h,b),c(a,h,-b)],[c(-a,h,-b),c(a,h,-b)],[c(-a,h,-b),c(-a,h,b)]],col=vitMix(rc,.25);
     for(const e of E)arete(e[0],e[1],2.4*u,col);for(const e of E)arete(e[0],e[1],.9*u,'rgba(255,255,255,.9)');
     /* l'éclat du coin le plus proche */
     const k0=c(a,h,b),g=x.createRadialGradient(k0[0],k0[1],0,k0[0],k0[1],7*u);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(k0[0]-8*u,k0[1]-8*u,16*u,16*u);}
    }
    T9.montage=performance.now()-T9.t0;
    if(cb&&cv.toBlob&&window.URL&&URL.createObjectURL){asy=true;(PHOTO.att||(PHOTO.att={}))[ck]=[cb];
      cv.toBlob(function(bl){let u9=null;try{if(bl)u9=URL.createObjectURL(bl);}catch(e){}toileRend(cv);
        if(u9){if(PHOTO.cache[ck]){try{URL.revokeObjectURL(u9);}catch(e){}u9=PHOTO.cache[ck];}else{PHOTO.cache[ck]=u9;phdbEcrit(ck,bl,sig9);photoGarde(ck,u9,bl.size);}}
        const L9=PHOTO.att[ck]||[];delete PHOTO.att[ck];for(const f of L9)try{f(u9);}catch(e){console.warn('vitrine',e);}},'image/png');}
    else{url=cv.toDataURL('image/png');toileRend(cv);}
  }catch(e){console.warn('vitrine',e);if(asy&&PHOTO.att)delete PHOTO.att[ck];asy=false;}
  PHOTO_USINE=false;vitBlocJette(blocR);if(blocLampes)blocLampes.forEach(function(l){if(l.parent)l.parent.remove(l);if(l.dispose)l.dispose();});
  if(par)par.add(carGroup);carGroup.position.copy(pos);carGroup.rotation.copy(rot);carGroup.scale.copy(sc0);carGroup.visible=vis;
  if(!PHOTO.chaine){const av=PHOTO.avant;buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);}
  T9.total=performance.now()-T9.t0;
  if(url)PHOTO.cache[ck]=url;
  if(cb&&!asy)cb(url);
  return url;}
/* la carte reçoit sa vitrine : UNE image posée sur la place du cube (le cube CSS de la carte est caché par `.vt`, voir vitrine-miniature.css) */
function vitrinePose(x,i){const k=x.closest('.bqK');if(!k)return;const sec=k.classList.contains('m2sec'),own=!sec&&bqA('v:'+i);
  if(!x.firstChild)x.appendChild(document.createElement('i')); /* le cube caché n'est plus « vide » : garBqPanneau re-demande les photos des cases [data-ph]:empty À CHAQUE IMAGE tant qu'il en reste une */
  /* (finition) un prix en pièces que la banque ne couvre pas encore : l'étiquette le dit avant le toucher (.trop, voir vitrine-miniature.css) */
  {const u=CAR_UNLOCK[i]||{};k.classList.toggle('trop',!own&&!sec&&u.k!=='premium'&&!!u.p&&bank()<u.p);}
  vitrineFile(i,sec,own,function(url){if(!url||!k.isConnected)return;let im=k.querySelector(':scope>.vtI');
    if(!im){im=document.createElement('img');im.className='vtI';im.alt='';im.decoding='async';im.draggable=false;k.insertBefore(im,k.firstChild);}
    if(im.getAttribute('src')!==url){im.onload=function(){k.classList.add('vt');};im.src=url;if(im.complete&&im.naturalWidth)k.classList.add('vt');}else k.classList.add('vt');},k);} /* la file regarde si la CARTE est en vue (le cube, caché, n'a pas de taille) */ /* la carte ne montre la vitrine qu'une fois l'image décodée (pas de case vide entre deux) */
if(VITM.on){document.documentElement.classList.add('vtOn');if(VITM.style==='leo')document.documentElement.classList.add('vtLeo');}
/* LA CAISSE ÉQUIPÉE SE LIT DANS LA GRILLE (2026-11-07, finition) : toutes les caisses à toi disaient « À TOI » ; celle que tu portes dit « ÉQUIPÉE ».
   Mise à jour SUR PLACE (garBqPanneau l'appelle à chaque image, elle ne travaille que si la grille ou la caisse portée a changé) : équiper ne
   reconstruit pas la grille, donc pas de vitrines qui clignotent. */
function vitrineEq(rail){const eq=SAVE.d.equipped|0,cle=GBQ.rk+'|'+eq+'|'+LANG;if(VITM.eqk===cle)return;VITM.eqk=cle;
  rail.querySelectorAll('.bqK.vo .bqKp.acq').forEach(function(p){const c=p.closest('.bqK'),i=+String(c.getAttribute('data-k')).slice(2),e=i===eq,t=sansAcc(TR(e?'ÉQUIPÉE':'À TOI'));
    if(p.textContent!==t)p.textContent=t;p.classList.toggle('eqp',e);});}
window.dbgVitrine=function(o){
  if(o&&typeof o==='object'){Object.assign(VITM,o);VITM.fit=null;for(const k in PHOTO.cache)if(/^vt/.test(k))delete PHOTO.cache[k];return {az:VITM.az,el:VITM.el,fov:VITM.fov,L:VITM.L,P:VITM.P,Hc:VITM.Hc,ph:VITM.ph,po:VITM.po,remp:VITM.remp};}
  if(o==='cartes'){const L=[];document.querySelectorAll('#gBqPan .bqK.vo').forEach(function(k){L.push({k:k.getAttribute('data-k'),vt:k.classList.contains('vt')});});return L;}
  if(o==='mesure')return VITM.ms||null;
  const i=o|0,own=arguments[1]==='o';delete PHOTO.cache[vitrineCle(i,false,own)];const u=vitrinePhoto({i:i,own:own});return {url:u,ms:VITM.ms};}; /* dbgVitrine(i, 'o') : la même, sortie de sa boîte */
