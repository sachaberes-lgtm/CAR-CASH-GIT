/* ---------- VIGNETTE MOTEUR : on VOIT ce qui nous pousse, en 3D, pendant la course ----------
   ⚠ POURQUOI CETTE RÉÉCRITURE. La 1re version dessinait la vignette DIRECTEMENT dans le framebuffer
   principal avec `setViewport`/`setScissor`, entre deux passes du composer. Le composer garde sa
   propre idée du viewport : au tour suivant il rendait la scène dans un cadre laissé en place par
   la vignette — d'où l'image déformée qui a fait désactiver la fonction. Le viewport de la passe
   finale ne doit JAMAIS être touché.
   LA RECETTE ICI : (1) le moteur est rendu dans un RenderTarget qui lui appartient — un framebuffer
   à part, sa taille est la sienne, le viewport principal n'est même pas au courant ; (2) le résultat
   est recollé APRÈS le composer comme un simple quad en caméra orthographique, autoClear coupé :
   un draw call, zéro changement d'état de viewport ou de scissor.
   Et la POSITION vient du DOM : le quad lit le rectangle de `#engVig` à chaque frame, donc le CSS
   (y compris la règle mobile) décide seul de la place — pas une coordonnée en dur dans le JS. */
const engVigEl=document.getElementById('engVig'),engVigCapEl=document.getElementById('engVigCap'),engVigTierEl=document.getElementById('engVigTier');
// la seconde maison du moteur : l'ecran de fin de partie
const engEndEl=document.getElementById('endEng'),engEndCapEl=document.getElementById('endEngCap'),engEndTierEl=document.getElementById('endEngTier');
const engEndCv=document.getElementById('endEngCv'),engEndCtx=engEndCv?engEndCv.getContext('2d'):null;
let engEndT=0,engEndBuf=null,engEndImg=null; // rapatriement GPU→CPU pour l'écran de fin (voir engVigRender)
/* (perf, lot 4) LA RELECTURE ASYNCHRONE. `readPixels` direct fait ATTENDRE le processeur jusqu'à ce que le GPU ait fini tout ce qu'on
   lui a demandé (mesuré : 3,7 % du processeur pendant la carte MOTEUR, bridé ×4 — sur iPhone, une vidange complète du GPU 30 fois par
   seconde). En WebGL2 on lit dans un tampon GPU (PBO) marqué d'une barrière (`fenceSync`) : l'image arrive à la recopie SUIVANTE, 33 ms
   plus tard — invisible sur une pièce qui tourne — et personne n'attend. Repli : la lecture directe (WebGL1, ou refus du pilote). */
const ENG_PBO={b:null,f:null,ctx:null,ko:false};
/* (2026-10-14, passe perf mobile) LA CARTE MOTEUR DE L'ÉCRAN DE MORT, À LA CADENCE DU PALIER. Mesuré sur iPhone 7 émulé : engVigRender 23 % du
   JavaScript de l'écran de fin + engLit 9 % + engVigRendRT 7 % — le moteur redessiné dans son tampon, relu depuis la puce (480×321 = 616 Ko)
   et recopié dans la toile 2D, 30 fois par seconde. La pièce fait un tour en ~10 s : à 10 images/s elle avance de 3,4° par image, ça se lit
   encore comme une rotation. `engVigMs` = l'écart en ms entre deux recopies au téléphone : ANCIEN 100 (10/s), MOYEN 66 (15/s), RÉCENT 33 (comme avant). */
PAL.B.engVigMs=[100,66,33];
function engPose(ctx,w,h){ // l'image lue → le <canvas> de la carte (les lignes arrivent de bas en haut : retournement, une ligne d'un bloc)
  const d=engEndImg.data,l9=w*4;for(let y=0;y<h;y++)d.set(engEndBuf.subarray((h-1-y)*l9,(h-y)*l9),y*l9);ctx.putImageData(engEndImg,0,0);}
function engLit(w,h,ctx){
  if(ENG_PBO.ko||!renderer.capabilities.isWebGL2)return false;
  const gl=renderer.getContext();
  try{
    if(!ENG_PBO.b){ENG_PBO.b=gl.createBuffer();gl.bindBuffer(gl.PIXEL_PACK_BUFFER,ENG_PBO.b);gl.bufferData(gl.PIXEL_PACK_BUFFER,w*h*4,gl.STREAM_READ);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);}
    if(ENG_PBO.f){ // la lecture d'avant est-elle arrivée ? on la pose
      const st=gl.clientWaitSync(ENG_PBO.f,0,0);
      if(st===gl.TIMEOUT_EXPIRED)return true; // pas encore : l'image d'avant reste à l'écran
      gl.deleteSync(ENG_PBO.f);ENG_PBO.f=null;
      if(st!==gl.WAIT_FAILED){gl.bindBuffer(gl.PIXEL_PACK_BUFFER,ENG_PBO.b);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,engEndBuf);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);engPose(ENG_PBO.ctx,w,h);}
    }
    renderer.setRenderTarget(engRT); // la nouvelle lecture part vers le tampon GPU…
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER,ENG_PBO.b);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,0);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
    renderer.setRenderTarget(null);
    ENG_PBO.f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);ENG_PBO.ctx=ctx; // …et on la ramassera au prochain passage
    return true;
  }catch(e){ENG_PBO.ko=true;try{gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);renderer.setRenderTarget(null);}catch(e2){}return false;}
}
const ENG_MORT={cv:null,ctx:null}; // (2026-09-26) le <canvas> du moteur 3D de l'écran de mort (téléphone) — posé par la carte MOTEUR
const engVigScene=new THREE.Scene();
const engVigCam=new THREE.PerspectiveCamera(34,1.5,.1,80);
// ⚠ POSÉE ICI, PAS DANS LA BOUCLE : elle ne bouge jamais, et le cadrage automatique (engVigBuild) lit
// sa distance pour calculer l'échelle. Quand elle était réglée en fin de engVigRender, le TOUT PREMIER
// build tombait sur une caméra encore en (0,0,0) → champ nul → échelle 0 → vignette VIDE jusqu'au
// premier changement de palier. Le point visé est SOUS le moteur : il remonte dans le cadre, au-dessus
// de la légende (sinon la bande de texte du bas lui mange le carter).
engVigCam.position.set(0,1.05,4.05);engVigCam.lookAt(0,-.06,0);
/* (vague 2, H7) LA LUMIÈRE DU MOTEUR — à 1,15 d'ambiance + 1,55 de clé + ,9 de contre-jour, sans courbe de tons (la vignette ne passe
   pas par l'ACES), l'alu brûlait en « mousse rose surexposée » (gt1-06/07/12/17). Une clé franche, une ambiance d'ENCRE : le métal
   retrouve ses noirs, le chrome accroche un seul filet de lumière. (Cette scène n'a rien à voir avec celle du jeu.) */
engVigScene.add(new THREE.HemisphereLight(0xd8ecff,0x241c3e,.55));
{const k=new THREE.DirectionalLight(0xffffff,1.1);k.position.set(3.5,5,4.5);engVigScene.add(k);
 const r=new THREE.DirectionalLight(0x7fd8ff,.6);r.position.set(-4,1.5,-3);engVigScene.add(r);
 const b=new THREE.DirectionalLight(0xff7a3c,.55);b.position.set(-2,-3,-4);engVigScene.add(b);} // contre-jour braise : la silhouette se détache du fond sombre
/* (v5, 2026-09-28, Sacha : « jolie, avec de belles couleurs ») LE LISERÉ NÉON : une lumière de plus, posée UNE fois ici (jamais en course : le
   nombre de lumières d'une scène change ses programmes), éteinte au repos. La carte MOTEUR l'allume à la couleur néon du moteur : le métal
   accroche un filet de sa couleur sur la tranche, le moteur n'est plus un bloc cuivré terne au-dessus de la caisse. */
const engRim=new THREE.DirectionalLight(0xffffff,0);engRim.position.set(-4.2,1.2,2.4);engVigScene.add(engRim); // de trois-quarts avant-gauche : il teinte les faces qu'on VOIT
const engRT=new THREE.WebGLRenderTarget(480,321,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
// le quad de recollage — caméra ortho en coordonnées NDC (-1..1), donc positionner = convertir un rect DOM
const engVigQuadScene=new THREE.Scene();
const engVigQuadCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const engVigQuadMat=new THREE.MeshBasicMaterial({map:engRT.texture,transparent:true,depthTest:false,depthWrite:false});
const engVigQuad=new THREE.Mesh(new THREE.PlaneGeometry(1,1),engVigQuadMat);
engVigQuad.frustumCulled=false;engVigQuad.renderOrder=1;engVigQuadScene.add(engVigQuad);
/* (vague 2, H6) LA CARTE MOTEUR DU TÉLÉPHONE, RECOLLÉE DANS L'IMAGE — elle faisait, 30 fois par seconde en pleine course : rendu 480×321,
   lecture GPU→CPU (asynchrone depuis la passe perf), copie JS de 616 Ko, `putImageData`, puis un <canvas> DOM filtré (contraste,
   saturation, deux ombres floues recalculées à chaque image). Désormais le moteur est rendu dans SON tampon (384×256, à peine plus que
   la taille où on le voit) et recollé par deux quads APRÈS le composer, à la place de `.ebScene` : un halo à la couleur du moteur (35 %), puis le
   moteur. Zéro lecture, zéro copie, zéro calque filtré ; mêmes programmes que le quad existant (MeshBasic + texture : chauffés au menu
   par `chauffeDivers`). Le tampon est PRÉMULTIPLIÉ (fond noir transparent, moteur opaque, flamme additive) : on le pose en ONE /
   ONE_MINUS_SRC_ALPHA. L'écran de mort, lui, garde la relecture — son moteur vit dans un écran DOM posé par-dessus l'image. */
const engRTc=new THREE.WebGLRenderTarget(384,256,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
// ENG_QK : le quad DÉBORDE de sa scène (×1,6). Le cadrage du tampon garde 24 % d'air pour que la flamme dépasse (engVigBuild) : recollé
// à la taille exacte de `.ebScene`, le moteur n'en occupait qu'un tiers. L'air débordant est transparent — il passe sous les textes.
const ENG_Q={x:0,y:0,w:0,h:0,op:0},ENG_CC=new THREE.Color(),ENG_QK=1.6,ENG_TEINTE=new THREE.Color();
const engCarteMat=new THREE.MeshBasicMaterial({map:engRTc.texture,transparent:true,depthTest:false,depthWrite:false,
  blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor});
/* (2026-09-28, user : « le moteur doit apparaître au niveau de la voiture, au-dessus, et donner l'impression de rétrécir et de rentrer
   dans le capot ») LA LIGNE DU CAPOT : le moteur est une image recollée par-dessus la scène — il ne peut pas passer DERRIÈRE la tôle.
   Pendant la plongée, tout ce qui descend sous la ligne du capot à l'écran est effacé : le bas du moteur disparaît le premier, il
   s'ENFONCE. `uClipY` en pixels du tampon, depuis le bas (−1 = rien de coupé). Compilé au menu avec le reste de la carte. */
engCarteMat.userData.uClip={value:-1};
engCarteMat.onBeforeCompile=function(sh){sh.uniforms.uClipY=engCarteMat.userData.uClip;
  sh.fragmentShader='uniform float uClipY;\n'+sh.fragmentShader.replace('void main() {','void main() {\n\tif(gl_FragCoord.y<uClipY)discard;');};
engCarteMat.customProgramCacheKey=function(){return 'moteurCapot';};
const engCarteQuad=new THREE.Mesh(engVigQuad.geometry,engCarteMat);engCarteQuad.frustumCulled=false;engCarteQuad.renderOrder=1;engCarteQuad.visible=false;
const engHaloMat=new THREE.MeshBasicMaterial({transparent:true,depthTest:false,depthWrite:false,
  blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
  map:(function(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);
    const t=new THREE.CanvasTexture(cv);t.premultiplyAlpha=true;return t;})()}); // prémultipliée à l'envoi : le halo se fond, il ne dessine pas de carré
const engHalo=new THREE.Mesh(engVigQuad.geometry,engHaloMat);engHalo.frustumCulled=false;engHalo.renderOrder=0;engHalo.visible=false;
/* (v4) LE DISQUE D'ENCRE : le halo coloré additif délavait le moteur sur les ciels clairs (vu en capture : un moteur gris-rose sur un
   ciel rose). Même texture, couleur NOIRE en mélange prémultiplié = elle ASSOMBRIT ce qui est dessous ; posé sur le halo de couleur,
   plus petit, il ne laisse de la couleur qu'un LISERÉ. Le moteur se lit sur n'importe quel fond. Même programme : rien à compiler. */
const engNoirMat=engHaloMat.clone();engNoirMat.color.setHex(0x000000);
const engNoir=new THREE.Mesh(engVigQuad.geometry,engNoirMat);engNoir.frustumCulled=false;engNoir.renderOrder=0;engNoir.visible=false;
engVigQuadScene.add(engHalo);engVigQuadScene.add(engNoir);engVigQuadScene.add(engCarteQuad);
function engVigRendRT(rt){ // le moteur dans SON tampon — fond NOIR transparent (le recollage prémultiplié l'exige), état du renderer restauré
  renderer.getClearColor(ENG_CC);const ca=renderer.getClearAlpha();
  renderer.setClearColor(0x000000,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(engVigScene,engVigCam);
  if(engVigVieux){jeteEngin(engVigVieux);engVigVieux=null;} // (perf) le nouveau moteur est rendu : ses programmes sont pris, l'ancien peut partir
  renderer.setRenderTarget(null);renderer.setClearColor(ENG_CC,ca); // ⚠ restaure le framebuffer ET son viewport
}
function engQuadDraw(){ // chaque image (le framebuffer est redessiné à chaque image), à la place que engBigSuit a calculée
  const Q=ENG_Q;if(!(Q.op>.01&&Q.w>4))return;
  const W=VP.w||1,H=VP.h||1,cx=Q.x/W*2-1,cy=1-Q.y/H*2,hs=Q.w*.78;
  engCarteQuad.position.set(cx,cy,0);engCarteQuad.scale.set(Q.w/W*2,Q.h/H*2,1);
  engCarteMat.color.setHex(0xffffff).lerp(ENG_TEINTE.setHex(engBig.col||0xffd75e),.42).multiplyScalar(Q.op*(1+1.3*(Q.fl||0)));engCarteMat.opacity=Q.op; // (v4) l'ÉCLAT d'apparition : le moteur arrive blanc-chaud et retombe à sa couleur — (v5) le métal prend la teinte NÉON du palier (il sortait blanc rosé sur tous les ciels)
  engHalo.position.set(cx,cy,0);engHalo.scale.set(hs*1.18/W*2,hs*1.18/H*2,1);
  engHaloMat.color.setHex(engBig.col||0xffd75e).multiplyScalar(.9*Q.op);engHaloMat.opacity=.8*Q.op; // (v5) le halo néon, plus franc
  engNoir.position.set(cx,cy,0);engNoir.scale.set(hs*.7/W*2,hs*.7/H*2,1);engNoirMat.opacity=.5*Q.op*(engBig.plonge?0:1); // l'encre s'efface dès la plongée : dans le capot, pas de disque — (v5) plus petite : il reste un anneau de couleur
  engVigQuad.visible=false;engCarteQuad.visible=engHalo.visible=engNoir.visible=true;
  const ac=renderer.autoClear;renderer.autoClear=false;renderer.render(engVigQuadScene,engVigQuadCam);renderer.autoClear=ac;
  engVigQuad.visible=true;engCarteQuad.visible=engHalo.visible=engNoir.visible=false;
}
let engVigMesh=null,engVigTierShown=-1,engVigSpin=0,engVigForce=null; // engVigForce : palier imposé par la console (visuel pur)
// LA VIE DU MOTEUR : horloge du battement, chaleur lissée, matériaux qui rougissent, flamme.
let engVigT=0,engVigHeat=0,engVigBaseY=0,engVigMats=[],engVigFeu=null,engVigFeuBase=1;
// le cône de flamme, construit UNE fois et re-parenté à chaque palier (pas une allocation par build).
// Base à l'origine et pointe vers l'arrière : le scale.y le fait pousser vers l'extérieur au lieu
// de l'étirer depuis son centre (sinon il rentre dans le bloc à chaque battement).
// ⚠ la géométrie reste alignée sur +Y (base à l'origine) et c'est le MESH qu'on tourne : ainsi
// `scale.y` étire toujours la flamme dans sa longueur. Tourner la géométrie aurait déplacé l'axe
// et l'animation aurait gonflé la flamme en largeur au lieu de l'allonger.
const engVigFeuGeo=(function(){const g=new THREE.ConeGeometry(.19,.72,14,1,true); // (partagée : voir jeteEngin)
  g.translate(0,.36,0);return g;})();
// ⚠ `depthTest` RESTE ACTIF. Le couper faisait dessiner la flamme PAR-DESSUS le bloc : un cône
// jaune collé sur la face avant, effet autocollant. La bonne réponse n'était pas de tricher sur
// la profondeur mais de LAISSER DE LA PLACE : le cadrage automatique remplit désormais 76 % du
// cadre au lieu de 92 %, et la flamme, couchée en biais vers l'arrière-gauche, dépasse de la
// silhouette pour de vrai.
// ⚠ ET SURTOUT : une TEXTURE le long de la flamme. Un cône en couleur pleine, même en additif,
// garde une silhouette nette — ça lit « cône en carton », pas « feu ». Le dégradé éteint la pointe
// et blanchit le cœur près de la tuyère : la forme se dissout dans l'air, ce que fait une flamme.
const engVigFeuTex=(function(){
  const cv=document.createElement('canvas');cv.width=8;cv.height=64;
  const c=cv.getContext('2d'),g=c.createLinearGradient(0,64,0,0); // v=0 en bas = la sortie
  // ⚠ PAS DE BLANC PUR au cœur : en additif sur un ciel clair, le blanc écrase tout et la flamme
  // ressort GRISE. On reste dans l'ambre — c'est la superposition qui fera le point chaud.
  g.addColorStop(0,'rgba(255,232,176,.88)');
  g.addColorStop(.20,'rgba(255,176,72,.62)');
  g.addColorStop(.58,'rgba(255,104,26,.26)');
  g.addColorStop(1,'rgba(255,70,16,0)');     // la pointe se perd dans l'air
  c.fillStyle=g;c.fillRect(0,0,8,64);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t;
})();
const engVigFeuMat=new THREE.MeshBasicMaterial({map:engVigFeuTex,color:0xffa855,transparent:true,opacity:0,
  blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
function engVigTier(){return engVigForce!=null?engVigForce:engTier;}
let engVigVieux=null;
function jeteEngin(m){m.traverse(o=>{if(o.isMesh){if(o.geometry&&!(o.geometry.userData&&o.geometry.userData.partage))o.geometry.dispose();if(o.material)o.material.dispose();}});}
/* LES SHADERS DES MOTEURS SE PRÉPARENT AU MENU (2026-09-26, passe perf, lot 4). MESURÉ : la 1re montée de moteur d'une session
   figeait l'image 180 ms EN PLEINE COURSE (5 shaders compilés pour la scène du moteur — ses 4 lumières font des programmes à part), la
   2e encore 70 ms. Au menu et à l'écran de mort, on construit donc chaque palier HORS écran, une pièce par image, on compile, et on garde
   EN VIE la première matière de chaque programme (`ENG_GARDE`) : tant qu'elle vit, three ne détruit pas le programme, et le vrai moteur
   le retrouve tout prêt. Tout le reste de la pièce est libéré aussitôt. Coût : quelques programmes gardés (quelques Ko). */
/* L'ATELIER SE PRÉPARE D'ABORD (2026-09-28, chasse aux gels) — c'est lui que JOUER montre dans la seconde. MESURÉ avant : 36 programmes
   compilés APRÈS le tap (l'atelier bâti et compilé à sa 1re image, sous un autre éclairage, plus le studio photo), ~1,1 s de gel sur PC.
   Désormais, au menu, AVANT tout le reste et une étape par image : (1) l'atelier est BÂTI, caché — dès que la police pixel est prête (son
   néon « CASH CAR » est peint avec ; en attendant, la chauffe continue ailleurs) ; (2) il est compilé SEUL, sous le MÊME éclairage que le
   garage (voir atelierLampes), puis dessiné une fois hors écran (états de pipeline de la puce) — `chauffeRendu([GAR.root])`. Un joueur
   plus rapide que la chauffe ne casse rien : openGarage bâtit ce qui manque et la 1re image compile ce qui reste, comme avant. */
function atelierChauffe(){ // vrai si elle a travaillé à cette image (la chauffe s'arrête là pour cette image)
  if(GAR.chaud||garageOn)return false;
  if(!GAR.root){const f=document.fonts;atelierChauffe.n=(atelierChauffe.n|0)+1;
    if(f&&f.check&&atelierChauffe.n<150&&!f.check('26px "Press Start 2P"')){if(atelierChauffe.n===1&&f.load)f.load('26px "Press Start 2P"').catch(function(){});return false;} // 2,5 s au plus
    try{buildGarageRoom();}catch(e){console.warn('atelier',e);GAR.chaud=true;}
    return true;}
  GAR.chaud=true;let q9=[GAR.root];try{q9=q9.concat(burnPools());}catch(e){} // (2026-10-08) les réservoirs du burn-out (la fumée en pixels…) compilés avec l'atelier : rien au 1er burn-out
  chauffeRendu(q9);return true;
}
/* UNE ÉTAPE DE CHAUFFE EST UN CHARGEMENT, PAS UNE LENTEUR (2026-09-28, chasse aux gels). Sur iPhone chaque étape (un moteur compilé, une
   fournée de programmes) dure 30 à 250 ms : une trentaine d'images d'affilée au menu, passé les 3,5 s de grâce du chargement, et la
   qualité auto y lisait une puce à genoux — elle pouvait descendre d'un cran AU MENU, et la course partait moins nette. Chaque étape qui
   travaille repousse donc la grâce, comme une construction de niveau (`loop._rebuildT`, lu par la qualité auto). */
function chauffeGrace(){loop._rebuildT=performance.now();}
const ENG_GARDE=new Map();let engChaudI=-1;
function engChauffe(){
  if(atelierChauffe()){chauffeGrace();return;} // (chasse aux gels) L'ATELIER D'ABORD : c'est lui que JOUER montre dans la seconde
  if(engChaudI<0){chauffeGrace();if(!chauffeDivers(CHAUFFE_R.div++))engChaudI=0;return;} // d'abord ce qui peut naître à N'IMPORTE quel moment de la course (pigeons, trace, ville) — (chasse aux gels) une étape par image
  if(engChaudI>ENGINE_TIERS.length){if(!CHAUFFE_R.fait){CHAUFFE_R.fait=true;CHAUFFE_R.tFait=performance.now();chauffeGrace();chauffeRendu();return;} // (tour 2) les moteurs prêts : toute la scène passe une fois par la puce
    if(CHAUFFE_R.ap>=0&&!ecranWipe._on&&(PREB.W?PREB.fait:(!PREB.on||!prebDepCible()||performance.now()-CHAUFFE_R.tFait>15000))){chauffeGrace();if(!chauffeApres(CHAUFFE_R.ap++))CHAUFFE_R.ap=-1;} // (2026-10-24) les tôles des voitures, une par image, le départ d'avance prêt (voir chauffeApres)
    return;}
  chauffeGrace();
  try{
    const g=engChaudI<ENGINE_TIERS.length?mkEngine(engChaudI):new THREE.Mesh(engVigFeuGeo,engVigFeuMat); // dernier tour : la flamme
    engChaudI++;
    engVigScene.add(g);renderer.compile(engVigScene,engVigCam);engVigScene.remove(g);
    const vus=new Set(); // ⚠ une matière sert souvent à PLUSIEURS pièces du moteur : on ne la juge qu'une fois (sinon la matière gardée était libérée à la pièce suivante)
    g.traverse(function(o){if(!o.isMesh)return;
      if(o.geometry&&o.geometry!==engVigFeuGeo&&!(o.geometry.userData&&o.geometry.userData.partage))o.geometry.dispose();
      const m=o.material;if(!m||Array.isArray(m)||vus.has(m))return;vus.add(m);
      const p=renderer.properties.get(m).currentProgram,k=p&&p.cacheKey;
      if(k&&!ENG_GARDE.has(k)){ENG_GARDE.set(k,m);return;} // la 1re matière de ce programme reste en vie
      if(m!==engVigFeuMat)m.dispose();});
  }catch(e){engChaudI=ENGINE_TIERS.length+1;}
}
/* (perf, lot 4) CE QUI NAÎT EN COURSE POUR LA 1re FOIS se compile au menu aussi — MESURÉ : le 1er vol de PIGEONS (2 shaders, à une
   heure aléatoire en pleine course) et la 1re TRACE de gomme (1 shader, au 1er dérapage). Un pigeon est posé le temps d'une compilation
   (géométries et matières partagées : rien à libérer), la trace est créée d'avance (900 quads à zéro, invisibles). Et la chauffe de la
   VILLE, qui attendait 2,5 s de menu : un joueur pressé la ratait, et la 1re ville compilait en pleine course (3 shaders, ~200 ms). */
/* LA CHAUFFE DE LA PUCE (2026-09-27, tour 2 — « on repasse en mode pixel assez vite après avoir lancé »). `renderer.compile` ne fait
   que LIER les programmes WebGL. Sur iPhone, Safari traduit en Metal, et Metal ne fabrique le vrai programme de la puce (l'« état de
   pipeline ») qu'au PREMIER DESSIN, pour chaque combinaison programme × mélange × profondeur × format de cible : 10 à 50 ms de gel
   chacun, invisibles à notre compteur `linkProgram`. Les premières secondes de course en empilaient des dizaines (chaque objet vu pour
   la 1re fois : dauphins, tranches de piste lointaines, nuages, gerbes…), et les à-coups faisaient dévaler la résolution. Désormais on
   DESSINE tout une fois, HORS écran (une cible 8×8 au MÊME format que la vraie — les états de pipeline en dépendent), tout rendu
   visible et sans tri de champ, les lumières intouchées (leur nombre changerait les programmes) : au menu une fois, et à chaque
   construction de niveau. Les géométries montent au GPU du même coup (elles montaient elles aussi au 1er dessin, en plein vol). */
const CHAUFFE_R={t:0,rt:null,fait:false,div:0,ap:0}; // ap : l'étape des tôles des voitures (chauffeApres ; -1 = finies)
function chauffeRendu(que){ try{ // `que` (chasse aux gels) : ne dessiner QUE ces sous-arbres, sous l'éclairage de la scène (l'atelier, au menu)
  if(!CHAUFFE_R.rt){const t9=(composer&&composer.renderTarget1)?composer.renderTarget1.texture.type:THREE.UnsignedByteType;
    CHAUFFE_R.rt=new THREE.WebGLRenderTarget(8,8,{format:THREE.RGBAFormat,type:t9,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});}
  // ⚠ `que` : la scène ne garde, le temps du dessin, que ses LUMIÈRES et ces sous-arbres — toutes les lumières sont des enfants DIRECTS de la
  // scène (leur nombre est écrit dans les programmes : en perdre une ferait compiler pour rien). Pas de passe d'ombre : la carte d'ombre
  // de l'image suivante reste celle de la vraie scène.
  const kids=scene.children,sm=renderer.shadowMap,sa=sm.autoUpdate,sn=sm.needsUpdate;
  if(que){scene.children=kids.filter(function(o){return o.isLight||que.indexOf(o)>=0;});sm.autoUpdate=false;sm.needsUpdate=false;}
  try{
  if(que)renderer.compile(scene,camera); // le sous-arbre compilé SEUL (compile() parcourt aussi le caché) — pas toute la scène
  // Un objet CACHÉ dont la matière n'a encore jamais été compilée reste caché : on prépare le dessin de ce qui existe, on ne compile
  // rien d'inutile (mesuré : 4 programmes au 1er portail pour des objets qui ne s'affichent jamais — 100-400 ms perdus sur iPhone).
  const vis=[],cul=[],off=[],vus=new Set();
  /* (2026-09-28, chasse aux gels) UN DESSIN PAR COUPLE (matière, géométrie). L'état de pipeline de la puce ne dépend que du programme, de la
     disposition des sommets, du mélange et de la cible ; la géométrie monte au GPU une fois : dessiner les 2 000-4 000 PIÈCES d'une piste
     (une géométrie, une matière) ne préparait rien de plus que d'en dessiner UNE. MESURÉ : ~4 700 appels de dessin → ~450 à chaque chauffe. */
  (function walk(o,h0){ if(o.isLight||(o===GAR.root&&!que))return;const h=h0||!o.visible; // l'ATELIER ne s'affiche jamais en course : il n'est dessiné qu'une fois, au menu (`que`) — (avant la chasse aux gels, son éclairage à lui recompilait 2 programmes au 1er portail)
    if(o.isMesh||o.isPoints||o.isSprite||o.isLine){const m=Array.isArray(o.material)?o.material[0]:o.material,pr=m&&renderer.properties.get(m).currentProgram;
      const cle=m&&o.geometry?(o.isInstancedMesh?'I':o.isSprite?'S':o.isPoints?'P':o.isLine?'L':'M')+m.id+':'+o.geometry.id:null;
      if((h&&!pr)||(cle&&vus.has(cle))){if(o.visible){o.visible=false;off.push(o);}}
      else{if(cle)vus.add(cle);if(!o.visible){o.visible=true;vis.push(o);}if(o.frustumCulled){o.frustumCulled=false;cul.push(o);}}}
    else if(!o.visible){o.visible=true;vis.push(o);}
    for(let i=0;i<o.children.length;i++)walk(o.children[i],h);})(scene,false);
  const ob9=scene.onBeforeRender;scene.onBeforeRender=function(){}; // pisteLoin remettrait ses visibilités pendant le rendu
  const cible=renderer.getRenderTarget(),t9=performance.now();renderer.setRenderTarget(CHAUFFE_R.rt);renderer.render(scene,camera);renderer.setRenderTarget(cible);
  CHAUFFE_R.appels=renderer.info.render.calls;CHAUFFE_R.ms=+(performance.now()-t9).toFixed(1); // (dev) dbgChauffe()
  scene.onBeforeRender=ob9;
  for(const o of vis)o.visible=false;for(const o of off)o.visible=true;for(const o of cul)o.frustumCulled=true;
  }finally{if(que){scene.children=kids;sm.autoUpdate=sa;sm.needsUpdate=sn;}}
}catch(e){console.warn('chauffeRendu',e);} }
function chauffeDivers(k){ // (2026-09-28, chasse aux gels) UNE étape par image (elles tenaient toutes dans la même : ~1,8 s d'un bloc au chargement, MESURÉ) — rend vrai s'il en reste
  const E=[
  function(){orbiteChauffe();}, // (vague 3) la lune peinte et montée au GPU, lune + rochers compilés : rien ne naît au portail de l'orbite
  function(){if(!CITY.chaud){CITY.chaud=true;villeChauffe();}},
  function(){if(SPIN.on){const m9=mkJeton(1);scene.add(m9);chauffeRendu([m9]);scene.remove(m9);}}, /* (2026-10-14) LE JETON DU FINAL SPIN : texture et matières montées au menu */
  function(){try{canyonChauffe();}catch(e){console.warn('canyonChauffe',e);}}, // (2026-10-14) LE CANYON DES GÉANTS : le relief et son ciel compilés au menu
  function(){try{dunesChauffe();}catch(e){console.warn('dunesChauffe',e);}}, // (2026-10-18) LES DUNES D'OR : le sable et ses décors compilés au menu
  function(){campChauffe();},
  function(){try{cryptoChauffe();}catch(e){console.warn('cryptoChauffe',e);}}, // (2026-10-13) CRYPTO CITY et la pluie d'argent : leurs matières compilées au menu
  function(){try{vitreChauffe();}catch(e){console.warn('vitreChauffe',e);}}, // (2026-10-17) LA VILLE VITRÉE : le verre, ses tours au loin, la couche de nuages
  function(){try{foretChauffe();}catch(e){console.warn('foretChauffe',e);}}, // (2026-10-14) LA FORÊT NOIRE : arbres, sol, torrent, fleurs, papillons, lucioles, rayons, brume, feux follets, lune, loup — compilés au menu
  function(){try{grotteChauffe();}catch(e){console.warn('grotteChauffe',e);}}, // (2026-10-18) LES PROFONDEURS : la roche en blocs (un programme) et les poussières, compilées au menu
  function(){if(carWingL&&carWingR&&carGroup.parent===scene){const v9=carWingL.visible;carWingL.visible=carWingR.visible=true;chauffeRendu([carGroup]);carWingL.visible=carWingR.visible=v9;}}, // (2026-10-16, LES AILES VIVANTES) les AILES de la caisse équipée, cachées au sol, compilées au menu : rien ne naît au 1er envol (MESURÉ : 1 à 2 programmes par aile, au 1er déploiement de la session)
  function(){try{bqChauffe(0);}catch(e){console.warn('bqChauffe',e);}},function(){try{bqChauffe(1);}catch(e){console.warn('bqChauffe',e);}},function(){try{bqChauffe(2);}catch(e){console.warn('bqChauffe',e);}}, // (2026-10-16, « la boutique rame de ouf ») LA BOUTIQUE bâtie et compilée au menu, en trois étapes : MESURÉ, sa 1re ouverture figeait l'image 1,2 s (10 programmes, la salle blanche, les bras, le trône) // (2026-10-16) LA PERLE : les traits de son plan projetés UNE fois ici (~0,2 s ordi), pas au 1er affichage de la caisse
  function(){const F=nyanPixPool();F.o.visible=true;chauffeRendu([F.o]);F.o.visible=false;}, // (2026-10-06) les PIXELS du chat (le programme du feu du burn-out) compilés au menu
  function(){const fx9=FX_EFF||(CARS[level]&&CARS[level].fx);if(fx9&&fx9.wow){wowPool();for(const q9 of wowTex())renderer.initTexture(q9.tx);}}, // (2026-10-14, passe perf mobile) LA TRAÎNÉE WOW (le DOGE, ou la traînée WOW) : ses 12 toiles en Comic Sans, ses 18 sprites et l'envoi des textures se faisaient à la 1re NITRO, en pleine course (~20-40 ms sur iPhone 7) — au menu, seulement si la caisse la porte (sinon rien ne change)
  function(){const fx9=FX_EFF||(CARS[level]&&CARS[level].fx);if(fx9&&fx9.pop){const T=trxBati(),M9=T.L.map(function(Y){return Y.m;});for(const m9 of M9)m9.visible=true;chauffeRendu(M9);for(const Y of T.L)Y.m.visible=Y.n>0;renderer.initTexture(T.L[0].m.material.uniforms.uMap.value);}}, /* (2026-10-18, HYPERESPACE v2) LES TRAÎNÉES POP (TRX) : leur programme et leur planche de 1 024 px naissaient à la 1re NITRO — MESURÉ au banc, 1 programme compilé pile au SAUT de l'hyperespace — au menu, seulement si la caisse en porte une */
  function(){if(!TRACE.pos)traceInit();const p=mkPigeon();scene.add(p);renderer.compile(scene,camera);scene.remove(p);},
  function(){const L9=[];for(let i=0;i<FRUIT_DEFS.length;i++){const m=mkFruit(i);scene.add(m);L9.push(m);}const pd=new THREE.Mesh(padGeo,PAD_MAT);scene.add(pd);L9.push(pd); // (2026-09-29) LA LIGNE PARFAITE pose ses fruits et ses pads EN COURSE : leurs programmes et leurs géométries sont prêts dès le menu
    chauffeRendu(L9);for(const m of L9)scene.remove(m);},
  function(){jadeChauffeProgs(0);},function(){jadeChauffeProgs(1);},function(){jadeChauffeProgs(2);},function(){jadeChauffeProgs(3);}, // (2026-10-14, passe perf mobile) LE SOLEIL DE JADE : ses 17 programmes compilés au menu, ~4 par étape (jadeChauffeProgs) — plus rien ne naît au portail vers le jade ni au REJOUER tiré sur lui
  function(){engCarteQuad.visible=engHalo.visible=true;renderer.compile(engVigQuadScene,engVigQuadCam);engCarteQuad.visible=engHalo.visible=false; // (vague 2) le recollage de la carte MOTEUR (sinon son programme naît au 1er palier)
    renderer.initTexture(engHaloMat.map);renderer.setRenderTarget(engRTc);renderer.setRenderTarget(null);}]; // …et son halo et son tampon montent au GPU dès le menu
  if(k<E.length)try{E[k]();}catch(e){}
  return k+1<E.length;
}
/* (2026-10-24, passe perf 2e tour) LES TÔLES DES VOITURES APRÈS LE DÉPART. MESURÉ (banc processeur ×4, MOYEN) : la Perle 1,9 s (deux étapes), les japonaises
   2,0 s, les rondes 0,5 s — chacune UNE image du menu, et toutes AVANT le départ d'avance (qui attend la fin de la chauffe). Elles ne servent qu'au garage et à
   la boutique (la tôle gardée sur le gabarit : sa 1re construction est instantanée) : elles passent après la chauffe utile à la course, quand le départ
   d'avance est prêt (voir engChauffe). Sans elles, une caisse se bâtit comme avant leur préchauffe. */
function chauffeApres(k){
  const E=[
  function(){try{perleTraits();}catch(e){console.warn('perleTraits',e);}},
  function(){try{perleTraits();   /* (la tôle découpée au plan) */}catch(e){console.warn('perleTraits',e);}},
  function(){try{japChauffe();}catch(e){}},function(){try{japChauffe();}catch(e){}},function(){try{japChauffe();}catch(e){}},function(){try{japChauffe();}catch(e){}},function(){try{japChauffe();}catch(e){}}, // (2026-10-18, JAPONAISES) la tôle des japonaises découpée au plan, une caisse par étape (voir japChauffe)
  function(){try{if(typeof rondesChauffe==='function')rondesChauffe();}catch(e){console.warn('rondesChauffe',e);}},function(){try{if(typeof rondesChauffe==='function')rondesChauffe();}catch(e){console.warn('rondesChauffe',e);}}, // (2026-10-18, RONDES) la tôle de LA QUEUE DE CANARD puis de LA GRANDE ANGLAISE découpée au plan (~60-90 ms chacune) : au menu, une caisse par étape, pas au premier garage
  ];
  if(k<E.length)try{E[k]();}catch(e){}
  return k+1<E.length;
}
