/* ===== LES RUBANS NETS (2026-11-14, Sacha : « les traînées de lumière sont mal foutues, elles sont assez floues » — la voiture et ses traînées doivent être PARFAITES, sur tout iPhone) =====
   CE QUI LES RENDAIT FLOUES (carte passation/qualite/carte/caisse-trainees.md §3) : le CŒUR du ruban était une gaussienne SANS bord (exp(−10u²) + une jupe 0,3·exp(−2,5u²)) :
   un trait doux par construction, que l'agrandissement ×2,4, le flou radial du nitro et le FXAA amollissaient encore. Désormais, sur le téléphone PROFILÉ seulement :
   · (A) `rubannet` — LE PROFIL : la moitié « cœur » de la texture devient un PLATEAU à bord raide (plein jusqu'à 20 % de la demi-bande, nul à 36 %) ; une 2e rangée de la texture a le bord doux
     (10 %→50 %, même mi-hauteur) et chaque rangée du ruban glisse de l'une à l'autre (uv.y) pour que le bord tienne `RNET.bordT` (1,5) texels de la scène : franc de près, sans marches au loin + une jupe légère (0,22·exp(−5u²)) ; la moitié « halo » ne change pas (même gaussienne, plus finement échantillonnée : 256 texels au lieu
     de 128). Le cœur perd ~22 % d'énergie à la même crête : il est rendu ×1,15 (`RNET.kC`) — même intensité perçue, même couleur, même bloom à ±10 %. Même géométrie, même matière
     (une autre texture — une DataTexture : la toile 2D prémultiplie et perdait la couleur sous un alpha nul — posée sur SILS[i].m/.mi : aucun programme compilé ; seuls les uv
     du ruban sont renvoyés en plus, 8 flottants par rangée dessinée), le garage et la boutique (silApercu, encre de la salle blanche) prennent le même ruban.
   · (B) `rubanlarg` — LE PLANCHER : au loin, la bande du cœur ne descend plus sous `RNET.minTx` texels de la scène (4,4 : le plateau en garde ~1,3) ; ce qu'on lui ajoute en
     largeur est retiré en éclat (même énergie : un fil sous le texel grésillait puis bavait, il reste un trait calme). Quelques opérations par rangée, rien par pixel.
   · (C) `netnitro2` — LE CŒUR HORS DU FLOU RADIAL : le cœur rend NÉGATIF l'alpha de la cible demi-flottante de la scène (alpha − 20·plateau ; la couleur garde exactement son additif) ;
     la passe finale (triptyque-bloom.js, NET_NITRO2) y rend le pixel net quand il est plus clair que le flou. Voir là-bas.
   · (D) `loupelong` — LA LOUPE LE LONG DES RUBANS : voir loupe-caisse.js (capsules d'écran le long des premiers mètres de chaque ruban).
   Hors profil (ordinateur, palier 0-1, iPhone sans modèle connu : `PRF.on` faux, ou PRF absent) : rien ne change d'un pixel. `?rubans=1` force le tout (banc, sur ALLEGE seulement : téléphone ou `?tel=1`), `?rubans=0` le coupe.
   dbgRubans() : l'état ; dbgRubans({net,larg,masque,long,kC,minTx}) : bascule à chaud (même image : dbgLoupe({rendre:1})). */
function rnProfil(){ /* (fonction hissée : triptyque-bloom.js la lit au chargement, avant ce morceau) */
  const q=location.search;if(/[?&]rubans=0\b/.test(q))return false;if(/[?&]rubans=1\b/.test(q))return !!ALLEGE; /* (2026-11-14, intégration) le forçage du banc : téléphone ou `?tel=1` seulement, l'ordinateur n'en voit rien */
  try{return typeof PRF!=='undefined'&&!!PRF&&!!PRF.on;}catch(e){return false;}}
const RNET=(function(){const q=location.search,p=rnProfil(),s=function(n){return new RegExp('[?&]sans=[^&]*\\b'+n+'\\b').test(q);};
  let mq=false;try{mq=!!(typeof NET_NITRO2!=='undefined'&&NET_NITRO2&&ACESShader._netNitro2);}catch(e){}
  return {p:p,net:p&&!s('rubannet'),larg:p&&!s('rubanlarg'),masque:mq,long:p&&!s('loupelong'),kC:1.15,op:20,minTx:4.4,bordT:1.5,P:[.2,.36,.9,.22,5,.08,.2,.1,.5],
    tex:null,garde:false,v9:new THREE.Vector2(),st:{rangees:0,elargies:0,bandeMin:1e9,txAng:0}};})();
/* ===== LES RUBANS EN VOL (2026-11-14 soir, Sacha, build 115 sur son 13 Pro : « retravaille encore les shaders, je trouve qu'en mode AIR TIME les traînées rouges qui partent
   des feux arrière sont mal gérées ») — VU AU BANC (outils/banc-qualite-vol/vol.cjs, image par image, passation/qualite/vol.md) :
   · au sol la caméra est à 4-5 m des feux : le ruban passe sous elle après 3-4 m, on n'en voit que la tête. EN VOL la caméra recule et la TRAJECTOIRE ENTIÈRE se
     déroule entre la caisse et l'objectif : deux barres qui s'élargissent jusqu'au bas de l'écran (la largeur du cœur passe de ~4 à 40-60 px CSS : la perspective
     d'un ruban qui frôle la caméra), saturées, qui lavent le bas de l'image — les « fils de marionnette » ;
   · en vrille / tonneau, les feux tournent autour de la caisse : le sillage d'une image plus tôt est ENTRE la caméra et la caisse, et le ruban additif la traverse
     et la lave (l'orange couvrait la carrosserie trois images de suite).
   Sur le téléphone PROFILÉ seulement (RNET.vol ; rien au sol : `vf` = 0) — `?sans=rubanvol` coupe tout, `?sans=volfin` (E) ou `?sans=volcaisse` (F) un seul :
   · (E) `volfin` LA LARGEUR TENUE À L'ÉCRAN : en vol, les plafonds d'angle du cœur et du halo (SIL.capC / capG) descendent vers RNET.capV (0,021 / 0,055 rad × la
     largeur du sillage : le cœur rejoint le plancher B, 4,4 texels) — le ruban garde à l'écran à peu près la largeur de sa tête jusqu'à l'objectif, un trait de lumière au lieu d'un coin — et le fondu près de
     l'objectif s'allonge (cœur 1,4-2,7 m → 3-7,5 m ; halo 1,9-3,8 → 3,5-9 m) : le trait s'éteint en approchant de la caméra au lieu de lui passer dessus ;
   · (F) `volcaisse` LA CAISSE RESTE LISIBLE : une rangée du ruban qui est DEVANT la caisse (entre elle et l'objectif, à plus de 0,6 m) et dont le rayon de vue
     traverse le cœur de la carrosserie (sa boîte ramenée à 55 % / 80 %, la tranche basse épargnée : le départ du ruban sous le pare-chocs reste) perd jusqu'à
     85 % de son éclat ; les couleurs de sommets s'interpolent d'une rangée à l'autre : un fondu, pas un trou.
   Le passage sol ↔ vol glisse en ~0,4 s (`tr.vf`, comme la coupe) : pas de bout de ruban qui claque au décollage ni à la pose.
   Coût : quelques opérations par rangée (F : un test de rayon contre une boîte, sur les rangées des 20 premiers mètres seulement), rien par pixel, aucun appel de
   dessin, aucune allocation par image (tableaux pré-alloués). */
RNET.vol=RNET.p&&!/[?&]sans=[^&]*\brubanvol\b/.test(location.search);
RNET.volFin=RNET.vol&&!/[?&]sans=[^&]*\bvolfin\b/.test(location.search);
RNET.volCaisse=RNET.vol&&!/[?&]sans=[^&]*\bvolcaisse\b/.test(location.search);
RNET.capV=[.021,.055];RNET.fondV=[3,7.5,3.5,9];RNET.occK=.85;
/* (F) la boîte de la caisse pour l'image : centre, trois axes unitaires et demi-côtés (repère de la carrosserie qui penche, à travers potMonde) — une fois par image */
const RNV={ok:false,n:0,fx:0,fy:0,B:new Float32Array(16),v0:new THREE.Vector3(),v1:new THREE.Vector3(),vc:new THREE.Vector3(),st:{rangees:0,voilees:0}};
function rnCaisse(fi){RNV.ok=false;if(fi===0){RNV.st.rangees=0;RNV.st.voilees=0;}if(!RNET.volCaisse||!carGroup.visible||!(fi>=0)||fi>=CAR_FEUX.length)return false;
  const S9=CARS[level]||{},B=RNV.B,c=RNV.vc,v=RNV.v0,o=RNV.v1,h=S9.h||1.2;
  potMonde(v.set(0,h*.5,0),c);B[0]=c.x;B[1]=c.y;B[2]=c.z;
  const L=[(S9.w||2)*.5,h*.5,(S9.l||4.2)*.5];
  for(let k=0;k<3;k++){potMonde(v.set(k===0?1:0,h*.5+(k===1?1:0),k===2?1:0),o);o.sub(c);const n=o.length()||1;B[3+k*3]=o.x/n;B[4+k*3]=o.y/n;B[5+k*3]=o.z/n;B[12+k]=L[k]*n;}
  potMonde(CAR_FEUX[fi],o);o.sub(c);RNV.fx=o.x*B[3]+o.y*B[4]+o.z*B[5];RNV.fy=o.x*B[6]+o.y*B[7]+o.z*B[8]; /* le feu de ce ruban, dans le plan de la caisse */
  RNV.ok=true;return true;}
/* (F) un point du ruban voile-t-il la caisse ? 0 (non) … 1 (en plein dans le cœur de la carrosserie). Trois conditions : le point est DEVANT toute la boîte (le rayon de
   l'objectif, prolongé, n'y entre qu'à plus de 0,5 m derrière lui) ; ce rayon traverse la boîte RÉDUITE (55 % puis 80 % : un bord doux ; la tranche basse, sous 35 %
   de la hauteur, jamais comptée) ; et le point s'est ÉCARTÉ de son feu dans le plan de la caisse (fx, fy : le feu, en mètres, repère de la carrosserie) — le ruban qui
   file droit derrière ses feux n'est jamais touché, seul celui que la vrille fait passer EN TRAVERS de la caisse s'efface. */
function rnOcc(x,y,z,fx,fy){const B=RNV.B,cam=camera.position,dx=x-cam.x,dy=y-cam.y,dz=z-cam.z,ox=cam.x-B[0],oy=cam.y-B[1],oz=cam.z-B[2],L=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
  const px=x-B[0],py=y-B[1],pz=z-B[2],lx=px*B[3]+py*B[4]+pz*B[5]-fx,ly=px*B[6]+py*B[7]+pz*B[8]-fy,ec=THREE.MathUtils.smoothstep(Math.sqrt(lx*lx+ly*ly),B[12]*.35,B[12]*.8);
  if(ec<=0)return 0;
  let r=0;for(let s=0;s<3;s++){const k=s===0?1:s===1?.8:.55;let t0=-1e9,t1=1e9;
    for(let a=0;a<3;a++){const ux=B[3+a*3],uy=B[4+a*3],uz=B[5+a*3],o=ox*ux+oy*uy+oz*uz,d=dx*ux+dy*uy+dz*uz,e=B[12+a]*k,lo=(a===1&&s)?-B[13]*.3:-e;
      if(Math.abs(d)<1e-6){if(o<lo||o>e){t0=2e9;break;}continue;}let ta=(lo-o)/d,tb=(e-o)/d;if(ta>tb){const q=ta;ta=tb;tb=q;}if(ta>t0)t0=ta;if(tb<t1)t1=tb;}
    if(s===0){if(!(t0<t1)||(t0-1)*L<.5)return 0;}else if(t0<t1)r+=.5;}
  return r*ec;}
/* la texture du ruban : rangée 0 = bord RAIDE (plateau 20 %→36 % de la demi-bande), rangée 1 = bord DOUX (10 %→50 %, même mi-hauteur) — silRuban choisit entre les deux
   par rangée du ruban (uv.y) pour que le bord tienne RNET.bordT texels de la scène : franc de près, sans marches d'escalier au loin ; moitié gauche = le HALO, moitié droite = le CŒUR ; alpha = le plateau du cœur (le masque de C), 0 sous le halo */
function rnTex(net,masque){
  const P=RNET.P,W=net?256:128,D=W/4,im={data:new Uint8Array(W*2*4)},SM=THREE.MathUtils.smoothstep; /* une DataTexture, pas une toile : la toile 2D garde ses pixels PRÉMULTIPLIÉS — un alpha 0 y efface la couleur (le halo disparaissait) */
  for(let y=0;y<2;y++)for(let x=0;x<W;x++){const h=x<W/2,u=((h?x:x-W/2)+.5)/D-1,a=Math.abs(u),bd=Math.max(0,1-Math.pow(a,6)),pl=1-(y&&net?SM(a,P[7],P[8]):SM(a,P[0],P[1]));
    const v=h?Math.exp(-u*u*4.5):net?P[2]*pl+P[3]*Math.exp(-u*u*P[4]):Math.exp(-u*u*10)+.3*Math.exp(-u*u*2.5);
    const g=Math.round(255*Math.min(1,v*bd)),al=masque?(h?0:Math.round(255*pl*bd)):255,o=(y*W+x)*4;im.data[o]=im.data[o+1]=im.data[o+2]=g;im.data[o+3]=al;}
  const t=new THREE.DataTexture(im.data,W,2,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;t.image.width=W;return t;}
function rnFab(){if(!RNET.net&&!RNET.masque){RNET.tex=null;return;}const k=(RNET.net?1:0)+(RNET.masque?2:0);RNET._tx=RNET._tx||{};RNET.tex=RNET._tx[k]||(RNET._tx[k]=rnTex(RNET.net,RNET.masque));}
rnFab();
/* les mélanges : le ruban garde son additif exact sur la couleur (src·1 + dst : la texture porte désormais un alpha, l'additif de three l'aurait multiplié) et pose
   alpha × (1 − masque) ; le voile d'encre garde son mélange de couleur et ne touche plus à l'alpha */
function rnMelange(M,encre){const mq=RNET.masque;M.blending=THREE.CustomBlending;M.blendEquation=THREE.AddEquation;M.blendEquationAlpha=THREE.AddEquation;
  if(encre){M.blendSrc=THREE.ZeroFactor;M.blendDst=THREE.OneMinusSrcColorFactor;M.blendSrcAlpha=THREE.ZeroFactor;M.blendDstAlpha=mq?THREE.OneFactor:THREE.OneMinusSrcAlphaFactor;}
  else{M.blendSrc=THREE.OneFactor;M.blendDst=THREE.OneFactor;M.blendSrcAlpha=mq?THREE.OneFactor:THREE.SrcAlphaFactor;M.blendDstAlpha=THREE.OneFactor;
    if(mq)M.blendEquationAlpha=THREE.ReverseSubtractEquation;M.opacity=mq?RNET.op:1;}} /* sans masque : l'alpha suit les mélanges d'avant (additif : a·a + dst ; encre : dst·(1 − a)).
   AVEC le masque : alpha := dst − op·plateau (op = 20 : l'opacité ne touche que l'alpha de MeshBasic, jamais sa couleur) — le cœur du ruban est le SEUL objet de la scène
   qui rend l'alpha NÉGATIF (la cible est demi-flottante, rien n'y est borné) : le masque ne peut pas confondre une encre, une ombre ou un voile qui baisserait l'alpha. */
function rnPose(tr){ /* appelée par silRuban à chaque ruban : ne fait rien tant que l'état posé est le bon */
  const on=RNET.tex?(RNET.masque?2:1):0,T=on?RNET.tex:SIL_TEX,M=tr.m.material,Mi=tr.mi.material;if(M.map===T&&(M._rnA|0)===on)return;
  M.map=T;Mi.map=T;M._rnA=on;
  if(on){if(!M._encre)rnMelange(M,false);rnMelange(Mi,true);}
  else{M.opacity=1;if(!M._encre)M.blending=THREE.AdditiveBlending;Mi.blendEquationAlpha=Mi.blendSrcAlpha=Mi.blendDstAlpha=null;M.blendEquationAlpha=M.blendSrcAlpha=M.blendDstAlpha=null;}}
/* (B) la taille d'un texel de la scène, en radians, au centre de l'image (fov vertical, hauteur de la cible que la scène remplit) */
function rnTexel(){let h=0;try{if(POST_ON&&composer&&composer.renderTarget1)h=composer.renderTarget1.height;}catch(e){}
  if(!(h>0))h=renderer.getSize(RNET.v9).y*renderer.getPixelRatio();
  return 2*Math.tan((camera.fov||72)*Math.PI/360)/Math.max(1,h);}
/* (banc) LA MÊME IMAGE : RNET.garde (dbgRubans({garde:1})) garde la courbe de chaque ruban, dbgRubans({refait:1}) les redessine sans avancer la partie (dt 0) — le plancher (B) se
   compare ainsi sur la même image. Hors banc RNET.garde est faux : rien n'est copié ni alloué. */
function rnGarde(tr,R9,emet,wm,wu){if(!tr._q)tr._q=new Float32Array(SIL_Q.length);tr._q.set(SIL_Q.subarray(0,R9*8));tr._g9=[R9,emet,wm,wu];}
function rnRefait(){let n=0;for(const tr of SILS){if(!tr._g9||!tr.m.visible)continue;SIL_Q.set(tr._q.subarray(0,tr._g9[0]*8));silRuban(tr,tr._g9[0],tr._g9[1],0,tr._g9[2],tr._g9[3]);n++;}return n;}
/* (banc) la SONDE : l'alpha de la cible de la scène (ce que lit le masque de C) — combien de pixels sous ,9, et combien de ceux-là sous un ruban visible ou non */
function rnSonde(sans){const vu=[];if(sans){for(const tr of SILS)if(tr.m.visible){tr.m.visible=false;vu.push(tr);}try{if(POST_ON&&composer)composer.render();}catch(e){}}
  try{const rt=composer.readBuffer,p=renderer.properties.get(rt),gl=renderer.getContext(),w=rt.width,h=rt.height,b=new Float32Array(w*h*4);
  renderer.setRenderTarget(rt);gl.readPixels(0,0,w,h,gl.RGBA,gl.FLOAT,b);renderer.setRenderTarget(null);
  let n9=0,n5=0,n0=0,mn=9,mx=-9;for(let i=3;i<b.length;i+=4){const a=b[i];if(a<.9)n9++;if(a<.5)n5++;if(a<-.5)n0++;if(a<mn)mn=a;if(a>mx)mx=a;}
  return {w:w,h:h,sous09:n9,sous05:n5,negatifs:n0,aMin:+mn.toFixed(3),aMax:+mx.toFixed(3),fb:!!(p&&p.__webglFramebuffer),rubansCaches:vu.length};}catch(e){return String(e);}
  finally{for(const tr of vu)tr.m.visible=true;}}
/* (banc, 2026-11-14 soir, LE VOL) LE RELEVÉ D'ÉCRAN des rubans : pour chaque ruban visible, où il part par rapport à SON feu (pixels CSS), la largeur à l'écran du cœur et du halo
   rangée par rangée, les cassures (angle entre deux segments à l'écran), les vrilles (le côté de la bande qui se retourne à l'écran) et l'éclat. Banc seulement : alloue. */
function rnReleve(){const V=new THREE.Vector3(),A9=new THREE.Vector3(),B9=new THREE.Vector3(),W=innerWidth,H=innerHeight,px=function(x,y,z,o){V.set(x,y,z).project(camera);o[0]=(V.x*.5+.5)*W;o[1]=(-V.y*.5+.5)*H;o[2]=V.z;return o;};
  camera.updateMatrixWorld();const out=[];
  for(let i=0;i<SILS.length;i++){const tr=SILS[i];if(!tr.m.visible)continue;const P=tr.pos,C=tr.col,n=Math.round(tr.m.geometry.drawRange.count/12)+1,rg=[];
    let feu=null;if(i<CAR_FEUX.length){potMonde(CAR_FEUX[i],A9);feu=px(A9.x,A9.y,A9.z,[0,0,0]);}
    let pr=null,sP=null,aMax=0,aR=-1,vr=0,wMin=1e9,wMax=0,saut=0,lg=0,dMax=0;
    for(let r=0;r<n;r++){const v=r*12,c=px((P[v+6]+P[v+9])/2,(P[v+7]+P[v+10])/2,(P[v+8]+P[v+11])/2,[0,0,0]),e1=px(P[v+6],P[v+7],P[v+8],[0,0,0]),e2=px(P[v+9],P[v+10],P[v+11],[0,0,0]),
        h1=px(P[v],P[v+1],P[v+2],[0,0,0]),h2=px(P[v+3],P[v+4],P[v+5],[0,0,0]),sx=e1[0]-e2[0],sy=e1[1]-e2[1],w=Math.hypot(sx,sy),wh=Math.hypot(h1[0]-h2[0],h1[1]-h2[1]),k=C[v+6];
      if(pr){const dx=c[0]-pr[0],dy=c[1]-pr[1],l=Math.hypot(dx,dy);lg+=l;if(l>dMax)dMax=l;
        if(pr.d&&l>.5){const ca=(dx*pr.d[0]+dy*pr.d[1])/l,a=Math.acos(Math.max(-1,Math.min(1,ca)))*57.3;if(a>aMax&&k>.02){aMax=a;aR=r;}}
        if(l>.5)c.d=[dx/l,dy/l];else c.d=pr.d;
        /* la bande à l'écran : la composante du côté perpendiculaire à l'axe du ruban — un retournement de signe d'une rangée à l'autre = une vrille (la bande passe par la tranche) */
        if(c.d){const s9=sx*c.d[1]-sy*c.d[0];if(sP!=null&&s9*sP<0&&k>.02)vr++;sP=s9;}}
      if(k>.02){if(w<wMin)wMin=w;if(w>wMax)wMax=w;}
      if(r>0&&rg.length&&k>.02){const w0=rg[rg.length-1][2];if(w0>1&&w>1){const j=Math.max(w/w0,w0/w);if(j>saut)saut=j;}}
      rg.push([+c[0].toFixed(1),+c[1].toFixed(1),+w.toFixed(2),+wh.toFixed(2),+k.toFixed(3),+c[2].toFixed(4)]);pr=c;}
    out.push({i:i,n:n,feu:feu?[+feu[0].toFixed(1),+feu[1].toFixed(1)]:null,tete:rg[0]?[rg[0][0],rg[0][1]]:null,ecart:feu&&rg[0]?+Math.hypot(feu[0]-rg[0][0],feu[1]-rg[0][1]).toFixed(1):null,
      long:+lg.toFixed(0),segMax:+dMax.toFixed(1),angleMax:+aMax.toFixed(1),angleR:aR,vrilles:vr,wMin:+(wMin<1e9?wMin:0).toFixed(2),wMax:+wMax.toFixed(2),sautLarg:+saut.toFixed(2),
      coul:[+C[18].toFixed(3),+C[19].toFixed(3),+C[20].toFixed(3)],cut:+tr.cut.toFixed(2),lg:+tr.lg.toFixed(0),pts:tr.n,rangs:rg.filter(function(x,j){return j<40||j%4===0;})});}
  return out;}
window.dbgRubans=function(o){if(o){if('net' in o)RNET.net=!!o.net;if('masque' in o){RNET.masque=!!o.masque&&!!ACESShader._netNitro2;try{acesPass.uniforms.uRn2.value=RNET.masque?1:0;}catch(e){}}
    if('larg' in o)RNET.larg=!!o.larg;if('vol' in o)RNET.vol=!!o.vol;if('volFin' in o)RNET.volFin=!!o.volFin;if('volCaisse' in o)RNET.volCaisse=!!o.volCaisse;if('long' in o)RNET.long=!!o.long;if(o.kC)RNET.kC=+o.kC;if(o.minTx)RNET.minTx=+o.minTx;rnFab();
    if('garde' in o)RNET.garde=!!o.garde;if(o.compteur)loop._nu=false; /* (banc) le compteur de vitesse s'écrit (masqué sur téléphone) : kmh le lit */if(o.refait)rnRefait();if(o.releve)return rnReleve();if(o.sonde)return rnSonde(o.sonde===2);}
  return {vol:RNET.vol,volFin:RNET.volFin,volCaisse:RNET.volCaisse,volSt:Object.assign({},RNV.st),profil:RNET.p,net:RNET.net,larg:RNET.larg,masque:RNET.masque,long:RNET.long,kC:RNET.kC,minTx:RNET.minTx,tex:RNET.tex?RNET.tex.image.width:0,nitro2:!!ACESShader._netNitro2,kmh:loop._spK|0,nuit:+(LUM.nuit||0).toFixed(2),mode:mode,stats:Object.assign({},RNET.st)};};
