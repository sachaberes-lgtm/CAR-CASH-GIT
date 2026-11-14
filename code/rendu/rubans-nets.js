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
window.dbgRubans=function(o){if(o){if('net' in o)RNET.net=!!o.net;if('masque' in o){RNET.masque=!!o.masque&&!!ACESShader._netNitro2;try{acesPass.uniforms.uRn2.value=RNET.masque?1:0;}catch(e){}}
    if('larg' in o)RNET.larg=!!o.larg;if('long' in o)RNET.long=!!o.long;if(o.kC)RNET.kC=+o.kC;if(o.minTx)RNET.minTx=+o.minTx;rnFab();
    if('garde' in o)RNET.garde=!!o.garde;if(o.compteur)loop._nu=false; /* (banc) le compteur de vitesse s'écrit (masqué sur téléphone) : kmh le lit */if(o.refait)rnRefait();if(o.sonde)return rnSonde(o.sonde===2);}
  return {profil:RNET.p,net:RNET.net,larg:RNET.larg,masque:RNET.masque,long:RNET.long,kC:RNET.kC,minTx:RNET.minTx,tex:RNET.tex?RNET.tex.image.width:0,nitro2:!!ACESShader._netNitro2,kmh:loop._spK|0,nuit:+(LUM.nuit||0).toFixed(2),mode:mode,stats:Object.assign({},RNET.st)};};
