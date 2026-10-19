/* L'ATELIER FERMÉ (2026-10-12, Léo : « quand on appuie sur INVENTAIRE, ça ferme la porte du garage ; une petite lumière allumée vers la
   voiture ; des petits trucs robotiques attrapent les jambes de la voiture pour la fixer au sol, qu'on puisse seulement la tourner ; tous les
   autres boutons disparaissent, seul un bouton en bas à gauche, RETOUR ; on ne laisse plus d'espace — pour l'inventaire, ça déclenche un
   petit truc ») : `#garage.atelierInv` (CSS « L'ATELIER FERMÉ ») — INVENTAIRE devient ◀ RETOUR à la place de HOME, les autres touches et le
   rappel s'effacent, l'inventaire passe en grille de trois qui prend la place. Dans la scène (garAtelierTick, après les lampes de
   garageRender) : la PORTE descend (GATL.c → garPorte), une LAMPE d'atelier descend du plafond au-dessus du plateau et s'allume en
   grésillant (cône et flaque additifs, la clé `stallKey` passe au-dessus de la caisse — aucune lumière ajoutée), les tubes du plafond
   baissent ; puis une PINCE ROBOT par roue sort d'une trappe du plateau, tend son bras jusqu'au moyeu et serre (sa diode passe du cyan
   au vert : la caisse est tenue) — elles tournent avec le plateau, lâchent pendant un échange de caisse et reviennent sur la nouvelle.
   Le doigt ne fait plus que TOURNER la caisse (ni burn-out, ni coup). RETOUR : tout se défait, la porte remonte. dbgAtelierInv() pour le banc. */
function gAtelier(on){on=!!on;if(!gEl||GATL.on===on)return;
  if(on&&GMODE.m!=='inv')return;
  GATL.on=on;garLibre._r=null;
  if(on){try{gVueSeule(false);if(BURN.hold)burnFin();}catch(e){}}
  try{if(SONV2)sfx(on?'fourgon.porte':'ui.retour');}catch(e){}try{hap(on?10:6);}catch(e){}
  const st=$('gStrip');if(st)st.scrollTop=0;
  gModeBoutons();}
function garAtelierBatir(){
  const g=new THREE.Group();g.visible=false;GAR.root.add(g);GATL.g=g;
  const L=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0,flatShading:true,fog:false}); // le programme des Lambert de l'atelier : rien à compiler
  const M=GATL.M={fer:L(0x232a38,0x070910),jaune:L(0xefb52a,0x2e2005),chrome:L(0xc2cbd8,0x171b21),noir:L(0x15181f,0x040609),led:L(0x5ff0ff,0x2fb8d0)};
  GATL.BX=new THREE.BoxGeometry(1,1,1);GATL.CY=new THREE.CylinderGeometry(.5,.5,1,8);
  const pg=new THREE.Group();g.add(pg);GATL.pg=pg;
  const lp=new THREE.Group();g.add(lp);GATL.lp=lp;
  const mk=(geo,mat,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.scale.set(sx,sy,sz);lp.add(m);return m;};
  GATL.cord=mk(GATL.CY,M.noir,.035,1,.035);
  GATL.abat=mk(new THREE.ConeGeometry(.5,1,10,1,true),new THREE.MeshLambertMaterial({color:0x2a3242,emissive:0x070910,flatShading:true,fog:false,side:THREE.DoubleSide}),.78,.4,.78);
  GATL.cul=mk(GATL.CY,M.fer,.22,.12,.22);
  GATL.ampM=new THREE.MeshBasicMaterial({color:0x2a2620,fog:false});GATL.amp=mk(GATL.CY,GATL.ampM,.2,.14,.2);
  GATL.rayM=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide});
  GATL.ray=new THREE.Mesh(new THREE.ConeGeometry(.5,1,18,1,true),GATL.rayM);g.add(GATL.ray); // ⚠ FrontSide : la caméra peut entrer dans le cône (voir les tubes)
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,240,210,1)');gr.addColorStop(.45,'rgba(255,226,180,.55)');gr.addColorStop(1,'rgba(255,220,170,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);
  GATL.flaqM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending});
  GATL.flaq=new THREE.Mesh(new THREE.PlaneGeometry(1,1),GATL.flaqM);GATL.flaq.rotation.x=-Math.PI/2;GATL.flaq.renderOrder=2;g.add(GATL.flaq);
  GATL.v=new THREE.Vector3();GATL.c0=new THREE.Color();GATL.cK=new THREE.Color(0xfff1dc);
}
function garPinceNeuve(hy,R,lw){ // une pince : repère local x = vers l'EXTÉRIEUR de la roue (le groupe est mis en miroir à gauche), 0 = le flanc du pneu
  const M=GATL.M,o=new THREE.Group(),b=(mat,sx,sy,sz)=>{const m=new THREE.Mesh(GATL.BX,mat);m.scale.set(sx,sy,sz);o.add(m);return m;};
  const x0=.34,H=hy+.16,P={o:o,x0:x0,H:H,hy:hy,R:R,lw:lw};
  P.cadre=b(M.jaune,.6,.012,.6);P.cadre.position.set(x0,.004,0);P.trou=b(M.noir,.48,.014,.48);P.trou.position.set(x0,.006,0); // la TRAPPE du plateau
  P.col=new THREE.Mesh(GATL.CY,M.fer);P.col.scale.set(.13,H,.13);o.add(P.col);
  P.cap=b(M.jaune,.22,.13,.22);P.led=b(M.led,.08,.035,.08);
  P.bras=b(M.chrome,1,.075,.075);P.poing=b(M.fer,.08,.16,.16);
  P.barre=b(M.chrome,.06,.07,1);                                  // la BARRE en travers de la jante, à hauteur du moyeu
  P.gAv=b(M.jaune,1,.09,.07);P.gAr=b(M.jaune,1,.09,.07);           // les deux GRIFFES qui se referment sur la bande du pneu, devant et derrière
  return P;}
function garRoues(){ /* (2026-10-12, Léo : « les trucs tournaient et traversaient la voiture ») les roues de la caisse AFFICHÉE, mesurées sur
     elle : chaque ESSIEU (groupe userData.essieu) porte ses deux roues SOUDÉES en un maillage — sa boîte donne le flanc extérieur de chaque
     côté, la hauteur du moyeu et le rayon. La liste globale `wheels` ne tient que les roues d'avant la soudure (détachées). Repli : des
     roues encore à part (userData.R) avant la soudure. Rend un côté par entrée : {sx, xo (flanc, |x|), y, z, R}. */
  const L=[],bb=GATL._bb||(GATL._bb=new THREE.Box3()),b9=GATL._b9||(GATL._b9=new THREE.Box3());
  for(const o of carGroup.children){const u=o.userData||{};
    if(u.essieu){bb.makeEmpty();for(const m of o.children){if(!m.geometry)continue;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();b9.copy(m.geometry.boundingBox).applyMatrix4(m.matrix);bb.union(b9);}
      if(bb.isEmpty())continue;const R=Math.max(.2,(bb.max.y-bb.min.y)/2),y=o.position.y+(bb.max.y+bb.min.y)/2,z=o.position.z+(bb.max.z+bb.min.z)/2;
      L.push({sx:1,xo:Math.max(.05,o.position.x+bb.max.x),y:y,z:z,R:R});L.push({sx:-1,xo:Math.max(.05,-(o.position.x+bb.min.x)),y:y,z:z,R:R});}
    else if(u.R!=null&&o.children.length){const x=o.position.x,lw=u.large||.3;
      for(const sx of (Math.abs(x)<.05?[-1,1]:[Math.sign(x)]))L.push({sx:sx,xo:Math.abs(x)+lw/2,y:o.position.y,z:o.position.z,R:u.R});}}
  return L;}
function garPincesPose(cle){
  GATL.cle=cle;const pg=GATL.pg;GATL.pinces.length=0;while(pg.children.length)pg.remove(pg.children[0]); // géométries et matières partagées : rien à libérer
  for(const w of garRoues()){const P=garPinceNeuve(w.y,w.R,.3);P.o.position.set(w.sx*(w.xo+.02),0,w.z);P.o.scale.x=w.sx;pg.add(P.o);GATL.pinces.push(P);}}
function garAtelierTick(dt,ay){
  const on=GATL.on&&garageOn&&!GAR.go&&!!gEl&&!gEl.classList.contains('menu');
  if(GATL.on&&!on&&GAR.go){GATL.on=false;try{gModeBoutons();}catch(e){}} // JOUER (clavier) : l'atelier se rouvre d'un coup, la porte suit le lâcher
  const ap=(v,t,r)=>v+Math.max(-r*dt,Math.min(r*dt,t-v)),sm=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u);};
  GATL.c=ap(GATL.c,on?1:0,on?1/.9:1/.7);GATL.cs=sm(GATL.c);
  GATL.l=ap(GATL.l,on&&GATL.c>.5?1:0,on?1/.45:1/.3);
  const cle=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length,veut=on&&GATL.c>.62&&!GAR.sw&&GATL.cle===cle&&!(brasVoulu()||BRB.p>.02); /* (2026-10-19) onglet FIGURES : les pinces rentrent, LE BRAS DES FIGURES sort */
  GATL.p=ap(GATL.p,veut?1:0,veut?1/.9:1/.4);
  if(GATL.l>.06&&!GATL.sonL){GATL.sonL=1;try{if(SONV2)sfx('ui.on');}catch(e){}}if(GATL.l<.01)GATL.sonL=0;
  if(GATL.p>.985&&!GATL.sonP){GATL.sonP=1;try{if(SONV2)sfx('garage.tole');}catch(e){}try{hap(8);}catch(e){}}if(GATL.p<.5)GATL.sonP=0;
  const vis=GATL.c>.001||GATL.l>.001||GATL.p>.001,t=performance.now()*.001;
  // le plafond baisse : les tubes et leurs cônes (la lampe éclaire seule)
  if(GATL.dim!==GATL.cs&&GAR.tubes.length){GATL.dim=GATL.cs;const k=1-.62*GATL.cs;
    if(!GATL.tc0)GATL.tc0=GAR.tubes[0].material.color.clone();for(const m of GAR.tubes)m.material.color.copy(GATL.tc0).multiplyScalar(k);
    for(const h of GAR.halos)h.material.opacity=.05*(1-.75*GATL.cs);}
  if(!GATL.g){if(!vis)return;garAtelierBatir();}
  GATL.g.visible=vis;if(!vis)return;
  if(GATL.cle!==cle&&GATL.p<.02)garPincesPose(cle);
  // LA LAMPE : elle descend pendant que la porte ferme, puis s'allume en grésillant
  const l=GATL.l,b=GATL.lb=l<=0?0:l>=1?1:l*(Math.sin(t*57)+Math.sin(t*23)>-.3?1:.2),H=GAR.H,dr=(.25+2.15*GATL.cs)*(1-BRB.p)-.75*BRB.p, /* (2026-10-19) le bras des figures est là : la lampe RENTRE dans le plafond (place aux grands saltos) */yA=H-dr;
  GATL.cord.scale.y=Math.max(.001,dr);GATL.cord.position.set(0,H-dr/2,0);GATL.cul.position.set(0,yA-.02,0);GATL.abat.position.set(0,yA-.24,0);GATL.amp.position.set(0,yA-.42,0);
  GATL.ampM.color.setRGB(.16+.84*b,.15+.8*b,.12+.68*b);
  const hR=yA-.44-GAR.POD,rB=2.5;GATL.ray.position.set(0,GAR.POD+hR/2,0);GATL.ray.scale.set(2*rB,hR,2*rB);GATL.rayM.opacity=.075*b*(1-BRB.p);GATL.ray.visible=b*(1-BRB.p)>.01;
  GATL.flaq.position.set(0,GAR.POD+.016,0);GATL.flaq.scale.set(6.4,6.4,1);GATL.flaqM.opacity=.42*b*(1-BRB.p);GATL.flaq.visible=b*(1-BRB.p)>.01; // (le bras des figures : la lampe rentrée, sa clé éclaire encore la caisse)
  // la clé passe AU-DESSUS de la caisse (la lampe), plus chaude et plus forte ; le contre-jour baisse
  if(b>0){GATL.v.set(0,ay+yA-.6,.35);stallKey.position.lerp(GATL.v,b);stallKey.intensity+=.85*b;stallKey.color.lerp(GATL.cK,b);stallKey.distance=Math.max(stallKey.distance,22);}
  stallRim.intensity*=1-.5*GATL.cs;
  // LES PINCES : elles tournent avec le plateau, sous la caisse
  const pg=GATL.pg;pg.position.set(carGroup.position.x,carGroup.position.y-ay,carGroup.position.z);pg.quaternion.copy(carGroup.quaternion); /* (2026-10-12, Léo : « les trucs tournaient avec la plaque et traversaient la voiture ») l'orientation ENTIÈRE : dès qu'un quaternion oriente la caisse (la boutique qui la fait flotter), son angle Y d'Euler n'est plus son cap (au-delà de 90° il se décompose en (π, π−θ, π)) — les pinces tournaient à l'envers du plateau */pg.visible=GATL.p>.001;
  const p=GATL.p,ouv=sm(p/.12),mo=sm((p-.08)/.45),br=sm((p-.5)/.3),se=sm((p-.8)/.2),tenu=p>.985;
  GATL.M.led.color.setHex(tenu?0x3dff8a:0x5ff0ff);GATL.M.led.emissive.setHex(tenu?0x1fb85a:0x2fb8d0);
  for(const P of GATL.pinces){const H9=P.H,dz=-(H9+.3)*(1-mo),xb=P.x0-(P.x0-.02)*br,L9=Math.max(.001,(P.x0-.02)*br);
    P.cadre.scale.set(.6*ouv+.001,.012,.6*ouv+.001);P.trou.scale.set(.48*ouv+.001,.014,.48*ouv+.001);
    P.col.position.set(P.x0,dz+H9/2,0);P.cap.position.set(P.x0,dz+H9,0);P.led.position.set(P.x0,dz+H9+.08,0);
    P.bras.scale.x=L9;P.bras.position.set(P.x0-L9/2,dz+P.hy,0);P.poing.position.set(xb,dz+P.hy,0);
    const zB=(P.R+.05)*(.08+.92*br),lg=.02+(P.lw*.75+.04)*se;P.barre.scale.z=2*zB;P.barre.position.set(xb-.01,dz+P.hy,0);P.barre.visible=br>.01;
    P.gAv.scale.x=P.gAr.scale.x=lg;P.gAv.position.set(xb+.02-lg/2,dz+P.hy,zB);P.gAr.position.set(xb+.02-lg/2,dz+P.hy,-zB);P.gAv.visible=P.gAr.visible=br>.01;}
}
/* LE BRAS DES FIGURES (2026-10-19, Léo : « dans l'inventaire, quand on regarde les tricks, au lieu d'avoir une machine qui tient les roues,
   une machine prête à soulever la voiture et à la faire tourner — faire attention à la physique, que le truc ne passe pas à travers la
   voiture, cohérent avec ce qu'on a déjà dans le jeu » ; aux choix : « elle fait la figure » · « onglet FIGURES seulement »).
   À l'ATELIER FERMÉ (GATL.on), onglet FIGURES (SHOP.tab 'figure') : les pinces des roues rentrent (garAtelierTick), un grand BRAS ROBOT jaune
   (les matières des pinces, GATL.M : aucun programme de plus) sort replié d'une trappe du plateau, sur un RAIL posé sur le plateau (il tourne
   avec lui), et se met EN ATTENTE : son outil au-dessus du toit, de trois-quarts arrière vu de la caméra (on le voit sans qu'il cache la
   caisse) — il glisse sur son rail quand on tourne la caisse.
   Une figure touchée (garFigEssai → brasFigure) : c'est LUI qui la fait, sans jamais lâcher la caisse.
   LA RÈGLE QUI GARANTIT QUE RIEN NE TRAVERSE : une rotation laisse son AXE immobile. Le bras prend la caisse LÀ OÙ SORT L'AXE de la figure —
   le flanc pour un salto, la poupe pour un tonneau, le toit pour une toupie, le haut du flanc pour la vrille penchée : un PATIN au bout d'une
   TIGE couchée sur l'axe ; patin et tige tournent avec la caisse (le poignet les entraîne), le BOÎTIER du poignet est au-delà de la caisse sur
   l'axe, le reste du bras derrière lui. Deux mouvements à la fois :
   · le 1er autour de la verticale (rodéo, shimmy) : c'est le PLATEAU qui le fait (bras et caisse tournent ensemble, BRB.yaw), le bras ne fait
     que le 2e ;
   · sinon (tire-bouchon, salto cosmique) : une ÉQUERRE — l'outil se DÉPLIE en trois temps — tenue par le poignet sur le 1er axe, qui tient la
     tige sur le 2e ; elle passe plus loin que le rayon de la caisse autour du 2e axe, comme les anneaux d'un gyroscope.
   Il la SOULÈVE juste assez pour que rien ne touche le plateau en tournant (mesuré sur la figure échantillonnée), la fait tourner (FIG.quat :
   les courbes du Lecteur, au rythme d'une machine), la repose, replie l'outil, revient en attente. Chaque plan est VÉRIFIÉ avant de partir
   (brasPlan : le bras en capsules contre la boîte de la caisse et contre l'équerre, à chaque instant de la figure, de la montée, de l'approche) ;
   pas de plan sûr (figure à trois axes, axes parallèles) : le bras se range au bord de son rail et la caisse fait la figure comme avant.
   La caméra recule pendant la démonstration (BRB.cK, lu par le recul de garageRender) et la place de la caisse à l'écran monte avec la levée (BRB.cY, lu par garCadre). dbgBras() pour le banc. */
const BRB={L1:2.5,L2:2.4,Hs:1.05,Rr:3.95,Lh:.3,jeu:.12,pre:.55,elHaut:1.25,cote:2.0,plafond:5.85,
  p:0,g:null,M:null,m:{},phi:0,TP:null,plan:null,et:-1,t:0,attente:null,esquive:0,eK:0,libre:null,lieu:'atelier',y0:0,dSol:0,bqVeut:false,bqK:0,habit:'',joue:false,yaw:0,serre:0,cK:0,cY:0,
  mes:null,hovX:0,hovK:'',verif:false,vmin:9,vsol:9,vcoll:0,vmot:'',stat:{plans:0,refus:0,replis:0,chemins:0},
  qC:new THREE.Quaternion(),qY:new THREE.Quaternion(),qW:new THREE.Quaternion(),q9:new THREE.Quaternion(),q8:new THREE.Quaternion(),
  v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),v4:new THREE.Vector3(),v5:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0),
  M9:new THREE.Matrix4(),A:[0,0,0,1],F1:{m:[null]},R:null,Rk:null,caps:[]};
function brasVoulu(){return !!(GATL.on&&garageOn&&!GAR.go&&gEl&&!gEl.classList.contains('menu')&&SHOP.tab==='figure');}
function brasBqVoulu(){return !!(garageOn&&!GAR.go&&GBQ.on&&GBQ.k>.5&&GBQ.grp&&GBQ.grp.visible&&GBQ.cat==='figure'&&(GBQ.ong||'cat')==='cat');} // la BOUTIQUE, catégorie FIGURES (2026-10-19)
/* (2026-10-19, soir — Léo : « enlève les bras robots ; quand il y a les tricks, on enlève le truc qui bloque les roues, on le remet sur une
   autre catégorie ; dans la boutique aussi : le bras enlevé, la voiture posée au sol, elle fait la figure, tout simplement ») LE BRAS DES
   FIGURES EST RANGÉ : il ne sort plus (BRAS_FIG faux ; `?bras=1` le rend tel quel, pour comparer). Dès qu'on ARRIVE dans FIGURES — l'onglet
   de l'inventaire, la catégorie de la boutique — les pinces des roues rentrent (garAtelierTick) ; en boutique les deux bras d'argent posent
   la caisse sur le plateau et rentrent dans le sol (BRB.bqK, sans attendre la 1re figure). La figure touchée, la caisse la fait SEULE
   (garFigEssai : l'animation d'avant le bras), une fois posée (figPosee ; touchée trop tôt, elle attend dans BRB.libre). Une autre
   catégorie : les pinces et les bras d'argent reviennent. */
const BRAS_FIG=/[?&]bras=1\b/.test(location.search);
function figPosee(){return brasBqVoulu()?(BRB.bqK>.98&&(GBQ.ba||0)<.03&&Math.abs(GBQ.lev||0)<.04):!(GATL.p>.06);} // la caisse est libre : posée sur le plateau de la boutique, ou les pinces rentrées
function brasYaw0(){return garRot()+(BRB.lieu==='boutique'?(GBQ.yaw||0):0);} // le cap de la caisse posée (en boutique, le doigt la tourne : GBQ.yaw)
function brasSm(u){u=u<0?0:u>1?1:u;return u*u*(3-2*u);}
function brasDep(u){u=u<0?0:u>1?1:u;const c=1.25;return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2);} // monte, dépasse de ~4 %, se pose (sortie « en arrière »)
function brasAng(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));} // a − b, ramené dans ]−π, π]
function brasDir(az,el,o){const c=Math.cos(el);return o.set(c*Math.sin(az),Math.sin(el),c*Math.cos(az));}
function brasAxe(a){const v=new THREE.Vector3(+a[0]||0,+a[1]||0,+a[2]||0);return v.lengthSq()>1e-9?v.normalize():null;}
/* LA CAISSE, mesurée une fois (repère de la caisse = celui du plateau au repos) : la boîte de toutes ses pièces pleines (roues comprises, ni
   halos ni flaques), son centre (le pivot des figures), ses huit coins, et les maillages que visent les rayons (le contact du patin). */
function brasMesure(){const k=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length;if(BRB.mes&&BRB.mes.k===k)return BRB.mes;
  const p0=BRB.v1.copy(carGroup.position),q0=BRB.q9.copy(carGroup.quaternion),s0=BRB.v2.copy(carGroup.scale);
  carGroup.position.set(0,0,0);carGroup.quaternion.set(0,0,0,1);carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);
  const bb=new THREE.Box3(),b9=new THREE.Box3(),ms=[];
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)return;
    const mt=Array.isArray(o.material)?o.material[0]:o.material;if((mt&&(mt.blending===THREE.AdditiveBlending||(mt.transparent&&mt.opacity<.05)))||(o.userData&&o.userData.sol))return; // les vitres et le verre comptent (une caisse de verre mesurée sans elles faisait 30 cm)
    b9.setFromBufferAttribute(o.geometry.attributes.position).applyMatrix4(o.matrixWorld);if(b9.isEmpty())return;bb.union(b9);ms.push(o);}); // (les sommets eux-mêmes : la boîte gardée par certaines géométries soudées est vide)
  if(bb.isEmpty())bb.set(new THREE.Vector3(-1,0,-2.2),new THREE.Vector3(1,1.3,2.2));
  const C=bb.getCenter(new THREE.Vector3()),K=[];for(let i=0;i<8;i++)K.push(new THREE.Vector3(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z));
  const M=BRB.mes={k:k,bb:bb,C:C,K:K,ms:ms,R:0,cont:{}};for(const v of K)M.R=Math.max(M.R,v.distanceTo(C));
  BRB.Hs=Math.max(1.05,Math.min(2.9,bb.max.y-.3)); // une caisse haute (LE MASTODONTE, 3 m) : la colonne du bras s'allonge pour passer par-dessus
  carGroup.position.copy(p0);carGroup.quaternion.copy(q0);carGroup.scale.copy(s0);carGroup.updateMatrixWorld(true);
  return M;}
function brasExt(K,pv,d){let m=-1e9;for(const k of K)m=Math.max(m,(k.x-pv.x)*d.x+(k.y-pv.y)*d.y+(k.z-pv.z)*d.z);return m;} // ce que la caisse avance le long de d
function brasRay(K,pv,d){let m=0;for(const k of K){const t=(k.x-pv.x)*d.x+(k.y-pv.y)*d.y+(k.z-pv.z)*d.z;m=Math.max(m,k.distanceToSquared(pv)-t*t);}return Math.sqrt(m);} // son rayon autour de l'axe (pv, d)
/* le CONTACT du patin : un rayon qui arrive par l'axe, de l'extérieur, sur la vraie carrosserie (repère de la caisse) → sa distance au pivot */
function brasContact(pv,d,e){const M=BRB.mes,ck=pv.x.toFixed(3)+','+pv.y.toFixed(3)+','+pv.z.toFixed(3)+'|'+d.x.toFixed(3)+','+d.y.toFixed(3)+','+d.z.toFixed(3);if(M.cont[ck]!=null)return M.cont[ck];
  const p0=BRB.v1.copy(carGroup.position),q0=BRB.q9.copy(carGroup.quaternion),s0=BRB.v2.copy(carGroup.scale);
  carGroup.position.set(0,0,0);carGroup.quaternion.set(0,0,0,1);carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);
  // le rayon, triangle par triangle (pas de Raycaster : il se fie aux sphères englobantes, vides sur certaines géométries soudées)
  const ray=new THREE.Ray(),loc=new THREE.Ray(),inv=new THREE.Matrix4(),A=new THREE.Vector3(),B=new THREE.Vector3(),Cc=new THREE.Vector3(),h=new THREE.Vector3(),hw=new THREE.Vector3();
  ray.set(BRB.v3.copy(pv).addScaledVector(d,e+.6),BRB.v4.copy(d).negate());let best=1e9;
  for(const o of M.ms){inv.copy(o.matrixWorld).invert();loc.copy(ray).applyMatrix4(inv);const ps=o.geometry.attributes.position,ix=o.geometry.index,n=ix?ix.count:ps.count;
    for(let t=0;t+2<n;t+=3){const i0=ix?ix.getX(t):t,i1=ix?ix.getX(t+1):t+1,i2=ix?ix.getX(t+2):t+2;A.fromBufferAttribute(ps,i0);B.fromBufferAttribute(ps,i1);Cc.fromBufferAttribute(ps,i2);
      if(loc.intersectTriangle(A,B,Cc,false,h)){hw.copy(h).applyMatrix4(o.matrixWorld);const dd=hw.distanceTo(ray.origin);if(dd<best)best=dd;}}}
  carGroup.position.copy(p0);carGroup.quaternion.copy(q0);carGroup.scale.copy(s0);carGroup.updateMatrixWorld(true);
  let r=best<1e8?e+.6-best:e;if(r>e)r=e;return M.cont[ck]=Math.max(.02,r);}
/* LA ROTATION de la figure à la progression x : BRB.qC (la caisse), BRB.qY (l'équerre), BRB.yaw (le plateau) — repère du plateau */
function brasMv(mv,x,o){BRB.F1.m[0]=mv;FIG.quat(BRB.F1,x,1,BRB.A);return o.set(BRB.A[0],BRB.A[1],BRB.A[2],BRB.A[3]);}
function brasRot(pl,x){
  if(pl.kind==='plateau'){brasMv(pl.f.m[0],x,BRB.q8);BRB.yaw=2*Math.atan2(BRB.q8.y,BRB.q8.w);if(pl.f.m[1])brasMv(pl.f.m[1],x,BRB.qC);else BRB.qC.identity();BRB.qY.identity();return;}
  FIG.quat(pl.f,x,1,BRB.A);BRB.qC.set(BRB.A[0],BRB.A[1],BRB.A[2],BRB.A[3]);BRB.yaw=0;if(pl.kind==='equerre')brasMv(pl.f.m[0],x,BRB.qY);else BRB.qY.identity();}
function brasBas(pl){let mn=1e9,mx=-1e9;const C=pl.pv,K=BRB.mes.K,v=BRB.v5; // le plus bas (et le plus haut, pl.hi) que vont la caisse et l'équerre pendant la figure, sans levée
  for(let i=0;i<=96;i++){brasRot(pl,i/96);for(const k of K){v.copy(k).sub(C).applyQuaternion(BRB.qC);mn=Math.min(mn,C.y+v.y);mx=Math.max(mx,C.y+v.y);}
    if(pl.kind==='equerre')for(const Q of [pl.Q1,pl.Q2,pl.Wa]){v.copy(Q).sub(C).applyQuaternion(BRB.qY);mn=Math.min(mn,C.y+v.y-.14);mx=Math.max(mx,C.y+v.y+.14);}}
  BRB.yaw=0;pl.hi=mx;return mn;}
/* LE BRAS : chariot sur le rail (azimut phi), tourelle, épaule à Hs, bras L1, coude, avant-bras L2, poignet au centre Wc ; le BOÎTIER part du
   poignet vers la caisse le long de d (sa face W). Coude toujours en haut. */
function brasIK(phi,Wc,dir,R){R=R||{T:new THREE.Vector3(),S:new THREE.Vector3(),E:new THREE.Vector3(),W2:new THREE.Vector3(),Wc:new THREE.Vector3(),W:new THREE.Vector3(),d:new THREE.Vector3()};
  R.phi=phi;R.Wc.copy(Wc);R.d.copy(dir);R.T.set(Math.sin(phi)*BRB.Rr,0,Math.cos(phi)*BRB.Rr);R.S.set(R.T.x,BRB.Hs,R.T.z);
  let hx=Wc.x-R.S.x,hz=Wc.z-R.S.z;const d=Math.hypot(hx,hz),v=Wc.y-R.S.y,D=Math.hypot(d,v),L1=BRB.L1,L2=BRB.L2;
  if(d>1e-4){hx/=d;hz/=d;}else{hx=-Math.sin(phi);hz=-Math.cos(phi);}R.hx=hx;R.hz=hz;R.ok=D<=L1+L2-.03&&D>=Math.abs(L1-L2)+.05;
  const Dc=Math.min(L1+L2-1e-3,Math.max(Math.abs(L1-L2)+1e-3,D)),al=Math.atan2(v,d)+Math.acos(Math.max(-1,Math.min(1,(L1*L1+Dc*Dc-L2*L2)/(2*L1*Dc))));
  R.E.set(R.S.x+L1*Math.cos(al)*hx,R.S.y+L1*Math.sin(al),R.S.z+L1*Math.cos(al)*hz);
  R.W2.copy(Wc).sub(R.E).setLength(L2).add(R.E);R.W.copy(R.W2).addScaledVector(dir,-BRB.Lh);return R;}
function brasCaps(R){const c=BRB.caps;c.length=0;const p=(a,b,r)=>{c.push(a.x,a.y,a.z,b.x,b.y,b.z,r);};
  p(BRB.v4.set(R.T.x,.35,R.T.z),R.S,.45);p(R.S,R.E,.24);p(R.E,R.W2,.18);return c;}
function brasBoite(x,y,z,bb){const dx=Math.max(bb.min.x-x,0,x-bb.max.x),dy=Math.max(bb.min.y-y,0,y-bb.max.y),dz=Math.max(bb.min.z-z,0,z-bb.max.z);
  if(dx>0||dy>0||dz>0)return Math.sqrt(dx*dx+dy*dy+dz*dz);return -Math.min(x-bb.min.x,bb.max.x-x,y-bb.min.y,bb.max.y-y,z-bb.min.z,bb.max.z-z);}
function brasSeg(px,py,pz,A,B){const vx=B.x-A.x,vy=B.y-A.y,vz=B.z-A.z,l2=vx*vx+vy*vy+vz*vz;let t=l2>1e-9?((px-A.x)*vx+(py-A.y)*vy+(pz-A.z)*vz)/l2:0;t=t<0?0:t>1?1:t;
  const dx=px-A.x-vx*t,dy=py-A.y-vy*t,dz=pz-A.z-vz*t;return Math.sqrt(dx*dx+dy*dy+dz*dz);}
/* LE JEU entre le bras et la caisse (sa boîte, posée par qC autour de pv levé de L) et l'équerre (posée par qY) : le plus petit écart, en
   mètres (négatif = il la traverse). x < 0 : la caisse au repos. */
function brasJeu(R,pl,x,L){const M=BRB.mes,bb=M.bb;let mn=9;const pv=BRB.pvJ||(BRB.pvJ=new THREE.Vector3());pv.copy(pl?pl.pv:M.C);const sk=pl&&pl.sh&&pl.L>0?Math.min(1,L/pl.L):0;
  if(x<0||!pl){BRB.qC.identity();BRB.qY.identity();}else brasRot(pl,x);
  BRB.q9.copy(BRB.qC).invert();const c=brasCaps(R),v=BRB.v5,eq=pl&&pl.kind==='equerre'&&x>=0;let Y1,Y2,Ya;
  if(eq){const C=pl.pv;Y1=BRB.yq1||(BRB.yq1=new THREE.Vector3());Y2=BRB.yq2||(BRB.yq2=new THREE.Vector3());Ya=BRB.yqa||(BRB.yqa=new THREE.Vector3());
    for(const [o,Q] of [[Y1,pl.Q1],[Y2,pl.Q2],[Ya,pl.Wa]]){o.copy(Q).sub(C).applyQuaternion(BRB.qY).add(C);o.y+=L;}}
  for(let i=0;i<c.length;i+=7){const ax=c[i],ay=c[i+1],az=c[i+2],bx=c[i+3],by=c[i+4],bz=c[i+5],r=c[i+6],l=Math.hypot(bx-ax,by-ay,bz-az),n=Math.max(1,Math.ceil(l/.12));
    for(let j=0;j<=n;j++){const t=j/n,px=ax+(bx-ax)*t,py=ay+(by-ay)*t,pz=az+(bz-az)*t;
      v.set(px-pv.x-(sk?pl.sh.x*sk:0),py-pv.y-L,pz-pv.z-(sk?pl.sh.z*sk:0)).applyQuaternion(BRB.q9).add(pv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,bb)-r);
      if(eq&&(px-R.Wc.x)**2+(py-R.Wc.y)**2+(pz-R.Wc.z)**2>.25)mn=Math.min(mn,Math.min(brasSeg(px,py,pz,Y1,Y2),brasSeg(px,py,pz,Y2,Ya))-r-.11);}}
  BRB.yaw=0;return mn;}
function brasSur(pv,dir){return brasExt(BRB.mes.K,pv,dir)+BRB.Lh+.26;} // assez loin pour que l'outil REPLIÉ ne touche jamais la boîte
function brasCamAz(){return garCamA()-(brasYaw0()+BRB.yaw);} // où est la caméra, vue du plateau
function brasVue(ph,cam){return Math.min(Math.abs(brasAng(ph,cam+BRB.cote)),Math.abs(brasAng(ph,cam-BRB.cote)));} // la place qui MONTRE le bras sans cacher la caisse : de trois-quarts arrière (cote), d'un côté ou de l'autre
function brasPhis(d,cam){const h=Math.hypot(d.x,d.z),L=[];if(h>.35){const a=Math.atan2(d.x,d.z);L.push(a,a+.32,a-.32);}else for(let k=0;k<12;k++)L.push(k*Math.PI/6);return L;}
/* LE PLAN d'une figure : le genre de prise, l'axe, le patin, la levée, la place sur le rail — le premier plan SÛR, côté opposé à la caméra */
function brasPlan(f){
  const mv=f&&f.m;if(!mv||!mv.length||mv.length>2||!window.FIG||!FIG.quat)return null;
  const M=brasMesure(),C=M.C,K=M.K,a0=brasAxe(mv[0].a),a1=mv[1]?brasAxe(mv[1].a):null;if(!a0||(mv[1]&&!a1))return null;
  let kind,inner,outer;
  if(!a1){kind=f.piv&&Math.abs(a0.y)>.9?'plateau':'axe';inner=kind==='plateau'?BRB.Y.clone():a0;}else if(Math.abs(a0.y)>.9&&Math.abs(a0.dot(a1))<.3){kind='plateau';inner=a1;}else if(Math.abs(a0.dot(a1))<.95){kind='equerre';inner=a1;outer=a0;}else return null;
  const cam=brasCamAz(),cands=[];
  if(kind!=='equerre'){
    const pv=C.clone();if(f.piv&&Math.abs(a0.y)>.9)pv.z+=f.piv*(M.bb.max.z-C.z); // le TAIL WHIP : le point fixe vers le nez
    for(const sg of [1,-1]){const d=inner.clone().multiplyScalar(sg);if(d.y<-.35||(Math.abs(inner.y)>.9&&d.y<0))continue; // jamais par en dessous : la caisse est posée
      const e=brasExt(K,pv,d),pc=brasContact(pv,d,e);
      const pl={f:f,kind:kind,pv:pv,d:d,az:Math.atan2(d.x,d.z),el:Math.asin(Math.max(-1,Math.min(1,d.y))),rho:e+BRB.jeu+BRB.Lh,stub:e+BRB.jeu-pc,sh:kind==='plateau'?new THREE.Vector3(-pv.x,0,-pv.z):null};
      for(const ph of brasPhis(d,cam))cands.push([pl,ph]);
      if(kind==='axe'&&Math.abs(inner.y)>.9){const p2=Object.assign({},pl,{kind:'plateau',sh:new THREE.Vector3(-pv.x,0,-pv.z),alt:1,L:null}); // une toupie trop longue pour le poignet (sa poupe balaierait le bras) : c'est le plateau qui la fait tourner
        for(const ph of brasPhis(d,cam))cands.push([p2,ph]);}}}
  else for(const sa of [1,-1])for(const sb of [1,-1]){const a=outer.clone().multiplyScalar(sa),b=inner.clone().multiplyScalar(sb);if(b.y<-.35)continue;
    const cr=BRB.v1.crossVectors(a,b).length();if(cr<.3)continue;
    const eb=brasExt(K,C,b),Rb=brasRay(K,C,b),r=Rb+.24,s=r/cr,u=a.clone().addScaledVector(b,-a.dot(b)).normalize();
    const Q1=C.clone().addScaledVector(b,eb+BRB.jeu),Q2=Q1.clone().addScaledVector(u,r),Wa=C.clone().addScaledVector(a,s);
    if(Math.min(Q1.y,Q2.y,Wa.y)<.2)continue; // l'équerre passerait sous la caisse posée
    const pc=brasContact(C,b,eb);
    const pl={f:f,kind:kind,pv:C.clone(),d:a,b:b,az:Math.atan2(a.x,a.z),el:Math.asin(Math.max(-1,Math.min(1,a.y))),rho:s+BRB.Lh,Q1:Q1,Q2:Q2,Wa:Wa,stub:eb+BRB.jeu-pc};
    for(const ph of brasPhis(a,cam))cands.push([pl,ph]);}
  cands.sort(function(A,B){return ((A[0].alt?10:0)+brasVue(A[1],cam))-((B[0].alt?10:0)+brasVue(B[1],cam));});
  const Wc=BRB.v2,R=BRB.Rk||(BRB.Rk=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null));let essais=0;const pq=BRB.pq={}; // (banc) pourquoi chaque essai a été refusé
  const no=function(k){pq[k]=(pq[k]||0)+1;};
  for(const cd of cands){const pl=cd[0],ph=cd[1];essais++;
    if(pl.L==null){pl.L=Math.max(.45,.1-brasBas(pl));}if(pl.L>2.7||pl.L+pl.hi>BRB.plafond){no('plafond');continue;} // sous la lampe remontée et le plafond de l'atelier
    const d=pl.d,ok=function(rho,L,x){Wc.copy(pl.pv).addScaledVector(d,rho);Wc.y+=L;if(pl.sh)Wc.addScaledVector(pl.sh,Math.min(1,L/pl.L));brasIK(ph,Wc,d,R);return R.ok&&brasJeu(R,pl,x,L)>.04;};
    if(!ok(pl.rho+BRB.pre,0,-1)||!ok(pl.rho,0,-1)){no('prise');continue;}
    let bon=true;for(let i=1;i<=4&&bon;i++)bon=ok(pl.rho,pl.L*i/4,-1);bon=bon&&ok(pl.rho,pl.L*1.06,-1);if(!bon){no('levee');continue;} // (1,06 : la levée dépasse un poil avant de se poser, brasDep)
    Wc.copy(pl.pv).addScaledVector(d,pl.rho);Wc.y+=pl.L;if(pl.sh)Wc.add(pl.sh);brasIK(ph,Wc,d,R);if(!R.ok){no('portee');continue;}
    for(let i=0;i<=60&&bon;i++)bon=brasJeu(R,pl,i/60,pl.L)>.04;if(!bon){no('rotation');continue;}
    const A9=BRB.TP?brasTPcopie(BRB.TP):brasAttente(cam+BRB.cote),B9={pv:pl.pv.clone(),az:pl.az,el:pl.el,rho:pl.rho+BRB.pre,phi:ph,u:0,L:0},
      phR=brasHovCible(cam,ph),Ca=brasCheminSur(A9,B9),Cr=Ca&&brasCheminSur(B9,brasAttente(phR));
    if(!Ca||!Cr){BRB.stat.chemins++;no(Ca?'retour':'aller');continue;}
    let rs=0;for(const k of K)rs=Math.max(rs,k.distanceTo(pl.pv));if(pl.sh)rs=Math.max(rs,pl.sh.length()+1);if(pl.kind==='equerre')rs=Math.max(rs,pl.Q2.distanceTo(C)+.15,pl.Wa.distanceTo(C)+.3);
    return Object.assign({},pl,{k:M.k,phi:ph,phiR:phR,Ca:Ca,Cr:Cr,Rsw:rs,D:Math.max(.95,(f.D||.7)*1.6),essais:essais});}
  BRB.stat.refus++;return null;}
/* LES POSES de l'outil : {pv (le pivot, repère du plateau), az, el, rho (le poignet à rho de pv, sur la direction az/el), phi (le chariot), u
   (l'outil déplié, 0 → 1), L (la levée)}. L'ATTENTE : au-dessus du toit, côté opposé à la caméra, 18 cm au-dessus de la boîte. */
function brasTP(){return {pv:new THREE.Vector3(),az:0,el:Math.PI/2,rho:2,phi:0,u:0,L:0};}
function brasTPcopie(a,o){o=o||brasTP();o.pv.copy(a.pv);o.az=a.az;o.el=a.el;o.rho=a.rho;o.phi=a.phi;o.u=a.u;o.L=a.L;return o;}
function brasAttente(phi,o){const M=brasMesure();o=o||brasTP();o.pv.copy(M.C);o.az=phi;o.el=Math.PI/2;o.rho=M.bb.max.y-M.C.y+BRB.jeu+BRB.Lh+.18+BRB.hovX;o.phi=phi;o.u=0;o.L=0;return o;}
/* LES PLACES D'ATTENTE SÛRES : pour chaque cran de 5° du rail, le bras en attente touche-t-il la caisse posée ? Une caisse très longue (L'ICEBERG,
   LE MUR DU SON) dépasse presque jusqu'au rail : devant son nez et sa poupe, le chariot n'a pas sa place. On prend la plus petite hauteur
   d'attente (hovX) qui libère le plus de crans ; le bras ne s'arrête jamais sur un cran interdit, ni ne le traverse (brasHovCible). */
function brasHovCale(){const M=brasMesure();if(BRB.hovK===M.k)return;BRB.hovK=M.k;const R=BRB.Rk||(BRB.Rk=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),T=brasTP();let mx=-1,hb=0,tb=null;
  for(let h=0;h<=1.6001;h+=.2){BRB.hovX=h;const t=[];let n=0;for(let k=0;k<72;k++){brasAttente(k*Math.PI/36,T);brasDir(T.az,T.el,BRB.v3);BRB.v2.copy(T.pv).addScaledVector(BRB.v3,T.rho);brasIK(T.phi,BRB.v2,BRB.v3,R);const ok=R.ok&&brasJeu(R,null,-1,0)>.08;t.push(ok);if(ok)n++;}
    if(n>mx){mx=n;hb=h;tb=t;}if(n===72)break;}
  BRB.hovX=hb;BRB.hovOk=tb;}
function brasHovSur(ph){const t=BRB.hovOk;if(!t)return true;return t[((Math.round(ph/(Math.PI/36))%72)+72)%72];}
function brasHovCible(cam,from){ // la place d'attente : la plus proche des deux trois-quarts arrière qu'on atteint depuis from sans passer par un cran interdit
  if(!brasHovSur(from)){for(let i=1;i<=36;i++)for(const sg of [1,-1]){const p=from+sg*i*Math.PI/36;if(brasHovSur(p))return p;}return from;}
  let best=from,bs=9;for(const c of [cam+BRB.cote,cam-BRB.cote]){const d=brasAng(c,from),n=Math.max(1,Math.ceil(Math.abs(d)/(Math.PI/72)));let last=from;
    for(let i=1;i<=n;i++){const p=from+d*i/n;if(!brasHovSur(p))break;last=p;}const sc=Math.abs(brasAng(c,last));if(sc<bs-.05){bs=sc;best=last;}}
  return best;}
/* LE CHEMIN d'une pose à l'autre : il MONTE (au-dessus, côté de son chariot), tourne là-haut (le chariot glisse sur le rail), puis DESCEND
   vers la suivante — le poignet reste du côté de son chariot, l'outil replié jamais plus près de la caisse que brasSur. */
function brasChemin(A,B,s,o,eH9,rX){eH9=eH9||BRB.elHaut;rX=rX||0;const dA=brasAng(B.az,A.az),dP=brasAng(B.phi,A.phi),loin=Math.abs(dA)>.25||Math.abs(dP)>.25||rX>0;
  o.pv.lerpVectors(A.pv,B.pv,brasSm(s));o.u=A.u+(B.u-A.u)*s;o.L=A.L+(B.L-A.L)*s;
  if(!loin){const k=brasSm(s);o.az=A.az+dA*k;o.el=A.el+(B.el-A.el)*k;o.phi=A.phi+dP*k;o.rho=A.rho+(B.rho-A.rho)*k;}
  else{const eH=Math.max(A.el,B.el,eH9),u=brasSm(s); // en haut, l'outil replié passe AU PLUS PRÈS (brasSur + rX) : plus loin, le bras ne l'atteindrait pas
    // (2026-10-19, Léo : « travailler un tout petit peu l'animation ») les trois temps se CHEVAUCHENT : il monte en commençant à tourner, descend en finissant — un seul geste continu
    const k1=brasSm(u/.42),k2=brasSm((u-.24)/.52),k3=brasSm((u-.58)/.42);
    o.az=A.az+dA*k2;o.phi=A.phi+dP*k2;o.el=A.el+(eH-A.el)*k1+(B.el-eH)*k3;
    const rs=brasSur(o.pv,brasDir(o.az,o.el,BRB.v3))+rX;o.rho=rs+(A.rho-rs)*(1-k1)+(B.rho-rs)*k3;}
  if(o.u<.01)o.rho=Math.max(o.rho,brasSur(o.pv,brasDir(o.az,o.el,BRB.v3)));return o;}
/* un chemin est SÛR si, à 24 instants, le bras l'atteint et ne touche pas la caisse posée ; sinon on essaie plus haut, plus loin */
const BR_CHEMINS=[[1.25,0],[1.45,0],[1.5708,0],[1.5708,.45],[1.5708,.9],[1.5708,1.4]];
function brasCheminSur(A,B){const R=BRB.Rc||(BRB.Rc=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),T=BRB.Tc||(BRB.Tc=brasTP()),W=BRB.Wc9||(BRB.Wc9=new THREE.Vector3()),d=BRB.dc9||(BRB.dc9=new THREE.Vector3());
  for(const c of BR_CHEMINS){let bon=true;for(let i=0;i<=24&&bon;i++){brasChemin(A,B,i/24,T,c[0],c[1]);brasDir(T.az,T.el,d);W.copy(T.pv).addScaledVector(d,T.rho);brasIK(T.phi,W,d,R);bon=R.ok&&brasJeu(R,null,-1,0)>.03;}
    if(bon)return c;}
  return null;}
function brasCheminDur(A,B){return Math.min(1.3,.5+.22*Math.abs(brasAng(B.phi,A.phi))+.25*Math.abs(B.el-A.el)+.12*Math.abs(B.rho-A.rho));}
/* LA DÉMONSTRATION : les étapes (nom, durée) ; chacune pose BRB.TP (et la caisse quand elle est tenue) */
function brasFigure(f){if(!f)return false;
  if(BRB.plan&&BRB.et===0&&BRB.t<.25){BRB.TP=brasTPcopie(BRB.plan.A,BRB.TP);BRB.plan=null;BRB.joue=false;} // le même toucher la demande deux fois (shopShow, puis avec son sens) : la 2e remplace la 1re
  if(BRB.plan||BRB.p<.999||!BRB.TP){BRB.attente=f;return true;} // il finit celle-ci (ou finit de sortir), puis enchaîne
  const pl=brasPlan(f);if(!pl){BRB.stat.replis++;return 'libre';} // pas de plan sûr : il rentre dans sa trappe, la caisse la fait seule (garFigEssai, libre)
  brasLance(pl);return true;}
function brasDemande(f){const r=brasFigure(f);if(r==='libre')BRB.libre={id:(f.src||f).id,c:f.sens==='avant'?0:f.sens==='arriere'?1:null,t:.5};return r;} // une figure qui attendait : sans plan, la caisse la fera seule
function brasLance(pl){BRB.stat.plans++;pl.A=brasTPcopie(BRB.TP);pl.Bp={pv:pl.pv.clone(),az:pl.az,el:pl.el,rho:pl.rho+BRB.pre,phi:pl.phi,u:0,L:0};
  pl.et=[['transit',brasCheminDur(pl.A,pl.Bp)+.25*pl.Ca[1]],['approche',.28],['deplie',pl.kind==='equerre'?.62:.32],['serre',.2],['leve',.62],['tourne',pl.D],['pose',.45],['replie',pl.kind==='equerre'?.42:.26],['recul',.22],['retour',.9+.25*pl.Cr[1]]];
  BRB.plan=pl;BRB.et=0;BRB.t=0;try{if(SONV2)sfx('garage.bascule',{vol:-10});}catch(e){}}
function brasEtape(dt){const pl=BRB.plan,TP=BRB.TP;let e=pl.et[BRB.et];if(BRB.fige&&e[0]===BRB.fige[0]){BRB.t=Math.min(BRB.t+dt,e[1]*BRB.fige[1]);dt=0;}BRB.t+=dt;
  while(BRB.t>=e[1]){BRB.t-=e[1];BRB.et++;
    if(e[0]==='deplie'){BRB.serre=1;try{if(SONV2)sfx('garage.tole');}catch(er){}try{hap(8);}catch(er){}}
    if(e[0]==='tourne'){BRB.yaw=0;}
    if(BRB.et>=pl.et.length){BRB.plan=null;BRB.joue=false;BRB.yaw=0;if(BRB.attente){const f=BRB.attente;BRB.attente=null;brasDemande(f);}return;}
    e=pl.et[BRB.et];
    if(e[0]==='tourne'){try{if(SONV2)sfx('turbo.mini',{vol:-6});GSON9=true;}catch(er){}}
    if(e[0]==='replie'){BRB.serre=0;try{if(SONV2)sfx('ui.on',{vol:-6});}catch(er){}}
    if(e[0]==='recul'&&BRB.attente){ // une autre figure attend : on enchaîne d'ici, sans repasser par l'attente
      const f=BRB.attente;BRB.attente=null;BRB.plan=null;BRB.joue=false;TP.u=0;TP.rho=pl.rho;const r9=brasPlan(f);
      if(r9){BRB.plan=null;brasLance(r9);return;}BRB.plan=pl;BRB.attente=f;}
    if(e[0]==='retour')pl.Br=brasAttente(pl.phiR,pl.Br);}
  const s=Math.min(1,BRB.t/e[1]),k=brasSm(s),n=e[0];
  BRB.joue=n==='serre'||n==='leve'||n==='tourne'||n==='pose';
  if(n==='transit')brasChemin(pl.A,pl.Bp,s,TP,pl.Ca[0],pl.Ca[1]);
  else if(n==='retour')brasChemin(pl.Bp,pl.Br,s,TP,pl.Cr[0],pl.Cr[1]);
  else{TP.pv.copy(pl.pv);TP.az=pl.az;TP.el=pl.el;TP.phi=pl.phi;
    TP.rho=n==='approche'?pl.rho+BRB.pre*(1-k):n==='recul'?pl.rho+BRB.pre*k:pl.rho;
    TP.u=n==='deplie'?s:n==='replie'?1-s:(n==='approche'||n==='recul')?0:1;
    TP.L=n==='serre'?.025*Math.sin(Math.PI*Math.min(1,s*1.4)):n==='leve'?pl.L*brasDep(s):n==='tourne'?pl.L:n==='pose'?pl.L*(1-k):0;}
  if(n==='tourne')brasRot(pl,s);else{BRB.qC.identity();BRB.qY.identity();BRB.yaw=0;}}
/* chaque image du garage (dans garFigTick, juste après la pose de la caisse sur le plateau) — rend vrai si c'est lui qui tient la caisse */
function brasTick(dt){dt=Math.min(.05,dt||0)*(BRB.lent||1); // (banc) dbgBras('lent',.25) : la démonstration au ralenti
  if(GAR.go&&(BRB.plan||BRB.libre||BRB.attente)){BRB.plan=null;BRB.libre=null;BRB.attente=null;BRB.joue=false;BRB.yaw=0;BRB.serre=0;} // JOUER : il lâche tout, le lâcher du garage prend la caisse
  const enA=brasVoulu(),enB=brasBqVoulu(),l9=enA?'atelier':enB?'boutique':BRB.lieu;
  const salle9=l9==='boutique'?!!(GBQ.on&&GBQ.k>.5):!!GATL.on;
  if(l9!==BRB.lieu||(!salle9&&(BRB.plan||BRB.libre||BRB.attente))){BRB.plan=null;BRB.libre=null;BRB.attente=null;BRB.joue=false;BRB.yaw=0;BRB.serre=0;if(l9!==BRB.lieu){BRB.p=0;BRB.TP=null;}} // on change de salle (ou on la quitte) : il lâche tout — une autre catégorie de la même salle : il finit sa figure
  BRB.lieu=l9;if(!enB)BRB.bqVeut=false;
  /* EN BOUTIQUE (Léo : « les autres posent la voiture et un autre bras apparaît ») : à la 1re figure demandée, les deux bras d'argent posent la
     caisse sur le plateau et rentrent dans le socle (BRB.bqK, lu par garBqIndus et garBqBras) ; le grand bras ne sort qu'une fois la caisse posée.
     On quitte la catégorie : il rentre d'abord, puis les deux bras ressortent et la relèvent. */
  if(!BRAS_FIG&&!enA&&!enB)BRB.libre=null; // (sans le bras) on quitte FIGURES : la figure qui attendait la pose tombe
  BRB.bqK=Math.max(0,Math.min(1,BRB.bqK+((BRB.lieu==='boutique'&&(BRAS_FIG?(BRB.bqVeut||BRB.p>.02):enB))?dt/.55:-dt/.55))); // (sans le bras) posée dès qu'on ARRIVE dans la catégorie
  const posee=BRAS_FIG?(BRB.lieu!=='boutique'||(BRB.bqK>.98&&(GBQ.ba||0)<.03&&Math.abs(GBQ.lev||0)<.04)):figPosee(),veut=BRAS_FIG&&(enA||(enB&&BRB.bqVeut));
  const c9=((veut&&posee&&(enB||(GATL.c>.62&&GATL.p<.06))&&!GAR.sw&&!BRB.libre&&!(BRB.esquive>0))||!!BRB.plan)?1:0;
  BRB.p=Math.max(0,Math.min(1,BRB.p+(c9?dt/1.3:-dt/.9)));
  BRB.esquive=Math.max(0,BRB.esquive-dt);
  if(BRB.libre&&BRB.p<=0&&posee){const L9=BRB.libre;BRB.libre=null;try{garFigEssai(L9.id,L9.c,true);}catch(e){}BRB.esquive=(GFIG.D||1.2)+.4;} // RENTRÉ : la caisse fait sa figure seule ; il ressortira après
  if(BRB.p<=0){if(BRB.g)BRB.g.visible=false;BRB.joue=false;BRB.yaw=0;BRB.cK*=Math.max(0,1-dt*3);BRB.cY*=Math.max(0,1-dt*3);BRB.plan=null;BRB.TP=null;return false;}
  if(!BRB.g)brasBatir();const M=brasMesure();brasHovCale();brasHabille(BRB.lieu);
  if(BRB.lieu==='boutique'){BRB.y0=GARAGE_Y+(GBQ.socleH||0)+.06-M.bb.min.y;BRB.dSol=BRB.y0-GARAGE_Y;GBQ.pit=GBQ.pitV=GBQ.rol=GBQ.rolV=0;}else{BRB.y0=GARAGE_Y+GAR.POD;BRB.dSol=0;} // en boutique la caisse posée repose 6 cm au-dessus du socle (garBqIndus) ; ni tangage ni roulis au doigt tant qu'il est là
  if(BRB.plan&&BRB.plan.k!==undefined&&BRB.plan.k!==M.k){BRB.plan=null;BRB.joue=false;BRB.yaw=0;} // la caisse a changé sous lui
  const cam=brasCamAz();
  if(!BRB.TP){BRB.phi=brasHovCible(cam,cam+BRB.cote);BRB.TP=brasAttente(BRB.phi);}
  if(!BRB.plan&&BRB.attente&&BRB.p>=.999&&BRB.TP){const f=BRB.attente;BRB.attente=null;brasDemande(f);}
  if(BRB.plan)brasEtape(dt);
  else{const T=BRB.TP,ci=brasHovCible(cam,T.phi),ph=T.phi+brasAng(ci,T.phi)*(1-Math.exp(-dt*2.2));brasAttente(ph,T);BRB.joue=false;BRB.yaw=0;BRB.serre=0;}
  const yw=brasYaw0()+BRB.yaw;
  BRB.g.position.set(0,BRB.y0,0);BRB.g.rotation.set(0,yw,0);BRB.g.visible=true;
  // la caisse, quand il la tient : tournée par qC autour du pivot levé de L (repère du plateau → monde)
  if(BRB.joue){const pl=BRB.plan,T=BRB.TP;BRB.qW.setFromAxisAngle(BRB.Y,yw);
    BRB.v1.copy(pl.pv).applyQuaternion(BRB.qC);BRB.v2.copy(pl.pv);BRB.v2.y+=T.L;if(pl.sh&&pl.L>0)BRB.v2.addScaledVector(pl.sh,Math.min(1,T.L/pl.L));BRB.v2.sub(BRB.v1).applyQuaternion(BRB.qW);
    carGroup.position.set(BRB.v2.x,BRB.y0+BRB.v2.y,BRB.v2.z);carGroup.quaternion.copy(BRB.qW).multiply(BRB.qC);}
  brasDessine(dt);
  // la caméra : un peu de recul pour le bras en attente, beaucoup pendant la démonstration
  let tK=0,tY=0;if(BRB.plan){const pl=BRB.plan,G=garGabarit(),e9=pl.et[BRB.et][0];tK=Math.min(1.5,Math.max(.25,.36*(pl.L+pl.Rsw)/Math.max(1.2,G.R)));if(e9!=='retour')tY=pl.L*.9+(pl.kind==='equerre'?.25:0);}
  tK*=BRB.p;tY*=BRB.p;BRB.cK+=(tK-BRB.cK)*Math.min(1,dt*2.2);BRB.cY+=(tY-BRB.cY)*Math.min(1,dt*2.2);
  if(BRB.verif)brasVerif();
  return BRB.joue;}
/* L'HABIT (Léo : « faut pas qu'il soit orange, faut qu'il soit comme dans la boutique ») : chaque pièce a un RÔLE ; à l'atelier le jaune des
   pinces, en boutique l'argent, le graphite, le chrome et la diode ambre des deux bras de la boutique (GBQ.matB : leurs programmes existent déjà). */
function brasHabille(l){if(BRB.habit===l||!BRB.g)return;if(l==='boutique'&&!GBQ.matB)return;
  if(!BRB.roles){BRB.roles=[];const A=GATL.M,mp=new Map([[A.jaune,'jaune'],[A.fer,'fer'],[A.chrome,'chrome'],[A.noir,'noir'],[BRB.M.led,'led']]);BRB.g.traverse(function(o){if(o.isMesh&&mp.has(o.material))BRB.roles.push([o,mp.get(o.material)]);});}
  if(!BRB.M.ledB){BRB.M.ledB=new THREE.MeshBasicMaterial({color:0xffb347,fog:false});BRB.M.ledB.color.setRGB(1.9,1.05,.38);}
  const B=GBQ.matB,P=l==='boutique'?{jaune:B.argent,fer:B.graph,chrome:B.chrome,noir:B.graph,led:BRB.M.ledB}:{jaune:GATL.M.jaune,fer:GATL.M.fer,chrome:GATL.M.chrome,noir:GATL.M.noir,led:BRB.M.led};
  for(const r of BRB.roles)r[0].material=P[r[1]];BRB.habit=l;}
/* LE MODÈLE (bâti au 1er besoin, matières de l'atelier) */
function brasBatir(){if(BRB.g)return BRB.g;if(!GATL.g)garAtelierBatir();
  const G=new THREE.Group();G.visible=false;scene.add(G);BRB.g=G;const M=GATL.M,BX=GATL.BX,CY=GATL.CY,m=BRB.m; // dans la SCÈNE : en boutique GAR.root est éteint
  BRB.M={led:new THREE.MeshLambertMaterial({color:0x5ff0ff,emissive:0x2fb8d0,flatShading:true,fog:false})}; // sa diode à lui (celle des pinces est partagée)
  const mk=(geo,mat)=>{const o=new THREE.Mesh(geo,mat);G.add(o);return o;};
  m.gorge=mk(new THREE.RingGeometry(BRB.Rr-.24,BRB.Rr+.24,72,1),M.noir);m.gorge.rotation.x=-Math.PI/2;m.gorge.position.y=.004; // la GORGE du rail, dans le plateau
  m.rails=[];for(const dr of [-.16,.16]){const t=mk(new THREE.TorusGeometry(BRB.Rr+dr,.028,4,96),M.chrome);t.rotation.x=-Math.PI/2;t.position.y=.012;m.rails.push(t);}
  m.trappe=mk(BX,M.jaune);m.trou=mk(BX,M.noir);
  m.chariot=mk(BX,M.fer);m.chBande=mk(BX,M.jaune);m.chRoues=[mk(CY,M.noir),mk(CY,M.noir)];
  m.tourBas=mk(CY,M.fer);m.colonne=mk(CY,M.fer);m.colBague=mk(CY,M.jaune);m.tourelle=mk(CY,M.jaune);m.epaule=mk(BX,M.jaune);m.tEpaule=mk(CY,M.fer);
  m.bras=mk(BX,M.jaune);m.brasFil=mk(BX,M.noir);m.verin=mk(CY,M.chrome);m.verinC=mk(CY,M.fer);
  m.tCoude=mk(CY,M.fer);m.avBras=mk(BX,M.jaune);m.avFil=mk(BX,M.noir);
  m.poignet=mk(CY,M.fer);m.boitier=mk(CY,M.jaune);m.led=mk(CY,BRB.M.led);m.bague=mk(CY,M.noir);
  m.tige=mk(CY,M.chrome);m.patin=mk(CY,M.noir);m.patinB=mk(CY,M.jaune);
  m.eq1=mk(BX,M.jaune);m.eq2=mk(BX,M.jaune);m.eqC=mk(CY,M.fer);m.boitB=mk(CY,M.jaune);m.ledB=mk(CY,BRB.M.led);
  return G;}
function brasTube(o,A,B,r){const d=BRB.v4.subVectors(B,A),l=d.length();o.visible=l>.004;if(!o.visible)return;o.position.addVectors(A,B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(BRB.Y,d.multiplyScalar(1/l));o.scale.set(2*r,l,2*r);}
function brasPoutre(o,A,B,w,h,up){const l=A.distanceTo(B);o.visible=l>.004;if(!o.visible)return;o.position.addVectors(A,B).multiplyScalar(.5);BRB.M9.lookAt(B,A,up||BRB.Y);o.quaternion.setFromRotationMatrix(BRB.M9);o.scale.set(w,h,l);}
function brasDisque(o,P,ax,r,ep){o.visible=true;o.position.copy(P);o.quaternion.setFromUnitVectors(BRB.Y,BRB.v4.copy(ax).normalize());o.scale.set(2*r,ep,2*r);}
const BRV=[...Array(14)].map(function(){return new THREE.Vector3();});
function brasDessine(dt){const m=BRB.m,T=BRB.TP,pl=BRB.plan,P=BRB.p,R=BRB.R||(BRB.R=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),V=BRV;
  // la pose du poignet : au repos, sorti de sa trappe (P < .5 : il monte replié ; puis il se déplie vers l'attente)
  const dir=brasDir(T.az,T.el,V[0]),Wc=V[1].copy(T.pv).addScaledVector(dir,T.rho);Wc.y+=T.L;if(pl&&pl.sh&&pl.L>0)Wc.addScaledVector(pl.sh,Math.min(1,T.L/pl.L));
  let yOff=0;if(P<1){const k=brasSm((P-.45)/.55);if(k<1){const Wp=V[2],dp=V[3];brasPark(T.phi,Wp,dp);Wc.lerp(Wp,1-k);dir.lerp(dp,1-k).normalize();}yOff=-(1-brasSm(P/.45))*4.4;}
  if(!pl)Wc.y+=.025*Math.sin(performance.now()*.0017)*P; // il respire, prêt
  brasIK(T.phi,Wc,dir,R);
  const Y=BRB.Y,tr=V[4].set(R.T.x,yOff,R.T.z),rad=V[5].set(Math.sin(T.phi),0,Math.cos(T.phi)),tg=V[6].set(Math.cos(T.phi),0,-Math.sin(T.phi));
  const up=(a)=>a+yOff,ds=BRB.dSol,upB=(a)=>a+yOff-ds;
  // le rail, la trappe
  const vr=P>.02;m.gorge.visible=vr&&BRB.lieu!=='boutique';for(const r of m.rails)r.visible=vr;const ks=Math.min(1,P*3);m.gorge.scale.set(1,1,1);m.gorge.position.y=.004-ds;
  for(const r of m.rails)r.position.y=.012*ks-ds;
  const ouv=P<1?Math.sin(Math.PI*Math.min(1,P/.7)):0;m.trappe.visible=m.trou.visible=ouv>.01;
  if(m.trappe.visible){m.trappe.position.set(R.T.x,.006-ds,R.T.z);m.trappe.rotation.set(0,T.phi,0);m.trappe.scale.set(1.5*ouv,.012,1.2*ouv);m.trou.position.set(R.T.x,.008-ds,R.T.z);m.trou.rotation.set(0,T.phi,0);m.trou.scale.set(1.3*ouv,.014,1.0*ouv);}
  // le chariot, la tourelle, l'épaule
  m.chariot.position.set(R.T.x,upB(.15),R.T.z);m.chariot.rotation.set(0,T.phi,0);m.chariot.scale.set(1.15,.24,.82);
  m.chBande.position.copy(m.chariot.position).addScaledVector(rad,.415);m.chBande.rotation.set(0,T.phi,0);m.chBande.scale.set(1.1,.08,.02);
  for(let i=0;i<2;i++){const w=m.chRoues[i];w.position.copy(tr).addScaledVector(tg,i?.42:-.42);w.position.y=upB(.07);w.quaternion.setFromUnitVectors(Y,rad);w.scale.set(.16,.86,.16);}
  m.tourBas.position.set(R.T.x,upB(.32),R.T.z);m.tourBas.rotation.set(0,0,0);m.tourBas.scale.set(1.0,.14,1.0);
  const hx9=BRB.Hs-1.05,lc9=hx9+ds;m.colonne.visible=m.colBague.visible=lc9>.02;if(lc9>.02){m.colonne.position.set(R.T.x,up(.36+(hx9-ds)/2),R.T.z);m.colonne.rotation.set(0,0,0);m.colonne.scale.set(.5,lc9+.05,.5);m.colBague.position.set(R.T.x,upB(.36+.04),R.T.z);m.colBague.rotation.set(0,0,0);m.colBague.scale.set(.66,.08,.66);} // la colonne télescopique
  m.tourelle.position.set(R.T.x,up(.58+hx9),R.T.z);m.tourelle.rotation.set(0,Math.atan2(R.hx,R.hz),0);m.tourelle.scale.set(.86,.38,.86);
  const ax=V[7].set(-R.hz,0,R.hx),S=V[8].copy(R.S);S.y+=yOff;const E=V[9].copy(R.E);E.y+=yOff;const W2=V[10].copy(R.W2);W2.y+=yOff;const W=V[11].copy(R.W);W.y+=yOff;
  m.epaule.position.set(R.T.x,up(.86+hx9),R.T.z);m.epaule.rotation.set(0,Math.atan2(R.hx,R.hz),0);m.epaule.scale.set(.62,.5,.78);
  brasDisque(m.tEpaule,S,ax,.3,.84);
  // le bras, son vérin, le coude, l'avant-bras (le câble noir le long du dos)
  brasPoutre(m.bras,S,E,.4,.34,ax);brasPoutre(m.brasFil,V[12].copy(S).addScaledVector(Y,.2),V[13].copy(E).addScaledVector(Y,.2),.07,.07,ax);
  const vb=V[12].copy(tr).addScaledVector(V[13].set(R.hx,0,R.hz),-.38);vb.y=up(.95+hx9);const vh=V[13].lerpVectors(S,E,.42);
  brasTube(m.verinC,vb,V[2].lerpVectors(vb,vh,.55),.085);brasTube(m.verin,vb,vh,.05);
  brasDisque(m.tCoude,E,ax,.25,.6);
  brasPoutre(m.avBras,E,W2,.3,.27,ax);brasPoutre(m.avFil,V[12].copy(E).addScaledVector(Y,.17),V[13].copy(W2).addScaledVector(Y,.15),.06,.06,ax);
  // le poignet, le boîtier (sa diode : cyan prêt, verte quand il tient), la tige et le patin
  const fa=V[2].subVectors(W2,E).normalize(),pa=V[3].crossVectors(fa,dir);if(pa.lengthSq()<1e-4)pa.copy(ax);
  brasDisque(m.poignet,W2,pa,.24,.44);brasTube(m.boitier,W2,W,.21);
  brasDisque(m.bague,V[12].copy(W).addScaledVector(dir,.1),dir,.225,.06);brasDisque(m.led,V[13].copy(W).addScaledVector(dir,.025),dir,.218,.045);
  BRB.M.led.color.setHex(BRB.serre?0x3dff8a:0x5ff0ff);BRB.M.led.emissive.setHex(BRB.serre?0x1fb85a:0x2fb8d0);if(BRB.M.ledB){if(BRB.serre)BRB.M.ledB.color.setRGB(.45,1.9,.75);else BRB.M.ledB.color.setRGB(1.9,1.05,.38);}
  const eq=pl&&pl.kind==='equerre'&&(BRB.et>=1&&BRB.et<=7);
  for(const o of [m.eq1,m.eq2,m.eqC,m.boitB,m.ledB])o.visible=false;
  let tA,tB;
  if(eq){ // l'ÉQUERRE, posée par qY autour du pivot levé, dépliée en trois temps
    const C=pl.pv,u1=Math.min(1,T.u*3),u2=Math.min(1,Math.max(0,T.u*3-1)),u3=Math.min(1,Math.max(0,T.u*3-2)),L=T.L;
    const pose=(Q,o)=>{o.copy(Q).sub(C).applyQuaternion(BRB.qY).add(C);o.y+=L+yOff;return o;};
    const Ya=pose(pl.Wa,V[12]),Y2=pose(pl.Q2,V[13]),Y1=pose(pl.Q1,V[4]),bw=V[5].copy(pl.b).applyQuaternion(BRB.qY);
    const e1=V[6].lerpVectors(Ya,Y2,u1);brasPoutre(m.eq1,Ya,e1,.2,.2);
    if(u1>=1){brasDisque(m.eqC,Y2,V[7].crossVectors(bw,V[3].subVectors(Ya,Y2).normalize()),.17,.26);const e2=V[3].lerpVectors(Y2,Y1,u2);brasPoutre(m.eq2,Y2,e2,.19,.19);}
    if(u2>=1){brasTube(m.boitB,V[3].copy(Y1).addScaledVector(bw,.1),V[7].copy(Y1).addScaledVector(bw,-.12),.17);brasDisque(m.ledB,V[7].copy(Y1).addScaledVector(bw,-.09),bw,.18,.04);}
    tA=V[2].copy(Y1).addScaledVector(bw,-.12);tB=V[3].copy(tA).addScaledVector(bw,-Math.max(0,pl.stub-.12)*u3);if(u3<=0)tB=null;}
  else{tA=W;tB=V[2].copy(W).addScaledVector(dir,-(pl?pl.stub:0)*T.u);if(!pl||T.u<=0)tB=null;}
  if(tB){const dd=V[5].subVectors(tB,tA);const l=dd.length();brasTube(m.tige,tA,tB,.07);const nd=l>1e-4?dd.multiplyScalar(1/l):dir;
    brasDisque(m.patin,V[6].copy(tB).addScaledVector(nd,-.03),nd,.2,.06);brasDisque(m.patinB,V[7].copy(tB).addScaledVector(nd,-.075),nd,.23,.03);}
  else{m.tige.visible=false;const pd=eq?null:dir;if(pd){brasDisque(m.patin,V[6].copy(W).addScaledVector(pd,-.01),pd,.2,.06);brasDisque(m.patinB,V[7].copy(W).addScaledVector(pd,.035),pd,.23,.03);}else{m.patin.visible=m.patinB.visible=false;}}
}
function brasPark(phi,Wc,dir){Wc.set(Math.sin(phi)*(BRB.Rr-.7),Math.max(2.55,(BRB.mes?BRB.mes.bb.max.y:1.4)+1.05),Math.cos(phi)*(BRB.Rr-.7));dir.set(0,1,0);} // REPLIÉ au-dessus de son chariot (la sortie de la trappe, l'esquive)
/* LE BANC : à chaque image, le vrai écart entre le bras dessiné et la caisse dessinée (et l'équerre), et la caisse contre le plateau */
function brasVerif(){const M=BRB.mes,R=BRB.R;if(!M||!R||!BRB.g.visible||BRB.p<.999)return;BRB.g.updateMatrixWorld(true);carGroup.updateMatrixWorld(true);
  const inv=BRB.M9.copy(carGroup.matrixWorld).invert(),c=brasCaps(R).slice(),v=BRB.v5;let mn=9;
  for(let i=0;i<c.length;i+=7){const n=Math.max(1,Math.ceil(Math.hypot(c[i+3]-c[i],c[i+4]-c[i+1],c[i+5]-c[i+2])/.08));
    for(let j=0;j<=n;j++){const t=j/n;v.set(c[i]+(c[i+3]-c[i])*t,c[i+1]+(c[i+4]-c[i+1])*t,c[i+2]+(c[i+5]-c[i+2])*t);BRB.g.localToWorld(v).applyMatrix4(inv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,M.bb)-c[i+6]);}}
  const m=BRB.m;for(const o of [m.eq1,m.eq2])if(o.visible){for(let j=0;j<=10;j++){v.set(0,0,j/10-.5).applyMatrix4(o.matrix);BRB.g.localToWorld(v).applyMatrix4(inv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,M.bb)-.085);}}
  BRB.vmin=Math.min(BRB.vmin,mn);if(mn<-.005){BRB.vcoll++;BRB.vmot=(BRB.plan?BRB.plan.f.id+':'+BRB.plan.et[BRB.et][0]:'attente')+' '+mn.toFixed(3);}
  if(BRB.joue){let lo=9;const sol9=BRB.lieu==='boutique'?GARAGE_Y+(GBQ.socleH||0)+.05:GARAGE_Y+GAR.POD;for(const k of M.K){v.copy(k).applyMatrix4(carGroup.matrixWorld);lo=Math.min(lo,v.y-sol9);}BRB.vsol=Math.min(BRB.vsol,lo);}}
window.dbgBras=function(a,b,c){if(a==='caisse'){const i=b|0;if(!CARS[i])return null;SAVE.d.equipped=i;level=i;try{garageSaute(i);}catch(e){return String(e);}return CARS[i].name;} // (banc) la caisse équipée change comme à l'inventaire (bascule du plateau)
  if(a==='pieces'){const L=[];carGroup.updateMatrixWorld(true);carGroup.traverse(function(o){if(!o.isMesh&&!o.isSprite&&!o.isPoints&&!o.isLine)return;let vis=true;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)vis=false;const mt=Array.isArray(o.material)?o.material[0]:o.material,g=o.geometry;if(g&&!g.boundingBox&&g.computeBoundingBox)g.computeBoundingBox();const sz=g&&g.boundingBox?g.boundingBox.getSize(new THREE.Vector3()).toArray().map(x=>+x.toFixed(2)):null;
    const bx=g&&g.attributes&&g.attributes.position?new THREE.Box3().setFromBufferAttribute(g.attributes.position).getSize(new THREE.Vector3()).toArray().map(x=>+x.toFixed(2)):null;L.push([o.type,vis,mt&&mt.type,sz,bx,g&&g.attributes?Object.keys(g.attributes).join(','):'',o.parent===carGroup?'top':(o.parent&&o.parent.type),o.frustumCulled]);});return L;}
  if(a==='remesure'){BRB.mes=null;BRB.hovK='';return true;}if(a==='lent'){BRB.lent=+b||1;return BRB.lent;}if(a==='fige'){BRB.fige=b?[b,c==null?.5:+c]:null;return BRB.fige;} // (banc) dbgBras('fige','tourne',.4) : la démonstration s'arrête là
  if(a==='cam'){const M=BRB.mes;if(!M)return null;carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);let x0=9,x1=-9,y0=9,y1=-9;const v=new THREE.Vector3();
    for(const k of M.K){v.copy(k).applyMatrix4(carGroup.matrixWorld).project(camera);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
    const lb=garLibre();return {pos:camera.position.toArray().map(x=>+x.toFixed(2)),fov:+camera.fov.toFixed(1),caisse:[x0,x1,y0,y1].map(x=>+x.toFixed(2)),libre:{y0:+(1-2*lb.y0/VP.h).toFixed(2),y1:+(1-2*lb.y1/VP.h).toFixed(2),cx:+(2*lb.cx/VP.w-1).toFixed(2)},dVs:+(GAR.dVs||0).toFixed(2)};}
  if(a==='verif'){BRB.verif=b!==false;BRB.vmin=9;BRB.vsol=9;BRB.vcoll=0;BRB.vmot='';return 'verif '+BRB.verif;}
  if(a==='plan'){const f=window.FIG&&FIG.par[b];const p=f&&brasPlan(f);if(!p)return {refus:BRB.pq};return {kind:p.kind,L:+p.L.toFixed(2),phi:+p.phi.toFixed(2),az:+p.az.toFixed(2),el:+p.el.toFixed(2),rho:+p.rho.toFixed(2),stub:+p.stub.toFixed(2),Rsw:+p.Rsw.toFixed(2),essais:p.essais,kind2:p.alt?'plateau (toupie trop longue)':''};}
  if(a==='fig'){const f=window.FIG&&FIG.par[b];if(f&&brasBqVoulu())BRB.bqVeut=true;return f?brasDemande(f):false;}
  const M=BRB.mes;return {p:+BRB.p.toFixed(2),voulu:brasVoulu(),lieu:BRB.lieu,bqK:+BRB.bqK.toFixed(2),bqVeut:BRB.bqVeut,file:!!BRB.attente||!!BRB.libre,etape:BRB.plan?BRB.plan.et[BRB.et][0]:(BRB.esquive>0||BRB.libre?'esquive':'attente'),fig:BRB.plan&&BRB.plan.f.id,kind:BRB.plan&&BRB.plan.kind,
    L:BRB.TP?+BRB.TP.L.toFixed(2):0,joue:BRB.joue,serre:BRB.serre,yaw:+BRB.yaw.toFixed(2),cK:+BRB.cK.toFixed(2),cY:+BRB.cY.toFixed(2),hovX:BRB.hovX,
    boite:M&&[M.bb.min.toArray().map(x=>+x.toFixed(2)),M.bb.max.toArray().map(x=>+x.toFixed(2))],vmin:+BRB.vmin.toFixed(3),vsol:+BRB.vsol.toFixed(3),vcoll:BRB.vcoll,vmot:BRB.vmot,stat:BRB.stat};}; // (banc)
/* LE RAPPEL DE LA BOUTIQUE (2026-10-12, Léo : « qu'est-ce qu'on pourrait mettre au-dessus de HOME, tout ça ? » → « rappel de la boutique ») :
   au garage replié, une fine bande au-dessus des cinq touches — OFFRES ÉPHÉMÈRES, le compte à rebours, un reflet qui passe ; touchée, elle
   ouvre la BOUTIQUE. Visible replié (#garage.consoleCachee) et en INVENTAIRE (.modeInv, la vue d arrivée : sous l inventaire, au-dessus des touches). */
/* (2026-10-15 soir, Sacha : « enlève offre éphémère du garage ») le bandeau n'est plus posé : GAR_RAPPEL, `?rappel=1` le rend (la boutique garde ses offres) */
const GAR_RAPPEL=/[?&]rappel=1\b/.test(location.search);
try{if(gEl&&GAR_RAPPEL){const gb=document.getElementById('gBottom'),ga=document.getElementById('gAct');if(gb&&ga&&!document.getElementById('gRappel')){
  const r=document.createElement('div');r.id='gRappel';r.className='pbtn';r.setAttribute('role','button');r.setAttribute('aria-label',sansAcc(TR('OFFRES ÉPHÉMÈRES')));
  r.innerHTML=pxi('cadeau')+'<span data-fr="OFFRES ÉPHÉMÈRES">'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><b class="grT">'+pxi('horloge')+'<i>'+bqReste()+'</i></b>'+pxi('droite');
  gb.insertBefore(r,ga);
  r.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(r);uiClic('nav');gModeVa('shop');});
  setInterval(function(){if(!garageOn||!r.offsetParent)return;const t=r.querySelector('.grT i:not(.pxi)');const v=bqReste();if(t&&t.textContent!==v)t.textContent=v;},1000);}}}catch(e){}
/* LA PILE D'APLOMB (2026-10-15 après-midi, Sacha : « les boutons sont toujours pas très bien placés ») : chaque plaque penche de --sk
   autour de SON centre — trois rangées de hauteurs différentes (bandeau 34, portes 44, barre 56) donnaient trois bords gauches décalés,
   une pile en escalier. On penche toutes les plaques autour du MÊME axe (le milieu de la pile) : les bords tombent sur une seule ligne
   oblique, comme une seule plaque découpée. Le bandeau OFFRES ÉPHÉMÈRES prend aussi la largeur exacte de la grille. 4 Hz, garage ouvert. */
function garAplomb(){try{if(!garageOn)return;const ga=document.getElementById('gAct'),gr=document.getElementById('gRappel');if(!ga||!ga.offsetParent)return;
  const hy=function(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetTop;return t;},hx=function(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetLeft;return t;};
  const L=[];for(const e of ga.querySelectorAll(':scope>*,:scope>#gRang1>*'))if(e.offsetParent&&e.offsetHeight>0)L.push(e);
  if(gr){if(gr.offsetParent&&gr.offsetHeight>0){const d=hx(ga)-hx(gr),dw=(hx(gr)+gr.offsetWidth)-(hx(ga)+ga.offsetWidth);
    if(Math.abs(d)<24&&Math.abs(dw)<24){const ml=(parseFloat(gr.style.marginLeft)||0)+d,mr=(parseFloat(gr.style.marginRight)||0)+dw;
      if(Math.abs(d)>.5||Math.abs(dw)>.5){gr.style.marginLeft=ml+'px';gr.style.marginRight=mr+'px';}}L.push(gr);}}
  if(!L.length)return;let t0=1e9,t1=-1e9;const T=L.map(function(e){const t=hy(e);t0=Math.min(t0,t);t1=Math.max(t1,t+e.offsetHeight);return t;});
  const m=(t0+t1)/2;L.forEach(function(e,k){const o='50% '+(m-T[k]).toFixed(1)+'px';if(e.style.transformOrigin!==o)e.style.transformOrigin=o;});
  /* la pile penche d'un bloc : le haut part à droite, le bas à gauche, de la moitié de sa hauteur × la pente — on la rentre d'autant, moins 10 px de jeu (debout, la barre du bas touchait le bord ; tout le retrait rognait ACCUEIL) */
  const gb=ga.parentNode,ap=Math.max(0,Math.round(Math.tan(11*Math.PI/180)*(t1-t0)/2)-10);if(gb&&gb._apl!==ap){const cs=getComputedStyle(gb),a0=gb._apl||0;
    gb.style.paddingLeft=(parseFloat(cs.paddingLeft)-a0+ap)+'px';gb.style.paddingRight=(parseFloat(cs.paddingRight)-a0+ap)+'px';gb._apl=ap;}}catch(e){}}
setInterval(garAplomb,250);
/* LE RETOUR DE LA BOUTIQUE (2026-10-12, Léo : « le bouton BOUTIQUE devient RETOUR quand on appuie dessus, et enlève tous les autres —
   accessibles grâce à la flèche RETOUR, bien placée ; le but : laisser plus de place à la boutique ») : en BOUTIQUE (et SEE ALL ITEMS), la
   touche devient ◀ RETOUR (gModeBoutons), HOME · INVENTAIRE · l'œil · JOUER s'effacent ; ACHETER reste à côté quand il y a un achat.
   RETOUR : SEE ALL ITEMS → la vitrine du jour → le garage REPLIÉ (ta caisse revient, l'essai s'efface). */
function gGarageReplie(){GMODE.m='tout';GMODE.paye=false;GMODE.fam=null;
  try{if(SHOP.tab!=='voiture')shopTab('voiture');else SHOP.prev=null;const eq=equippedCar();if(garageI!==eq)garageSaute(eq);}catch(e){}
  const bar0=$('gRar'),st0=$('gStrip');if(bar0)bar0._k=null;if(st0)st0._r=null;gConsoleCache(true);gModeBoutons();}
/* CACHER / VOIR (2026-10-09, Léo) : replier la partie boutique / inventaire de la console pour voir le garage (voir le CSS « HOME ET CACHER ») */
/* L'ŒIL (2026-10-10, Léo : « à la place du HOME, un bouton œil, un peu comme HIDE mais qui enlève tout sauf l'œil : on voit juste la voiture »).
   `#garage.vueSeule` (+ `html.vueSeule` pour la jauge, qui vit hors du garage couchée) : tout le garage passe en visibility:hidden SAUF l'œil
   (une visibilité se rallume sur un enfant) ; le doigt sur le décor tourne toujours la vue. Le cadrage NE BOUGE PAS (essayé : rendre tout l'écran
   à la caisse la reculait — plus petite) : la même image, sans rien par-dessus. */
function gVueSeule(on){if(!gEl)return;on=!!on;if(gEl.classList.contains('vueSeule')===on)return;gEl.classList.toggle('vueSeule',on);document.documentElement.classList.toggle('vueSeule',on);garLibre._r=null;
  if(on){const p0=garagePitch,t0=performance.now();(function k9(){if(!garageOn||garageDrag||!gEl.classList.contains('vueSeule'))return;const e=Math.min(1,(performance.now()-t0)/600),s9=e*e*(3-2*e);
    garagePitch=p0+(.2-p0)*s9;if(e<1)requestAnimationFrame(k9);})();} /* (2026-10-11, passe UX) l'œil RECADRE : l'inclinaison d'ouverture du garage, en 0,6 s */
  const b=document.getElementById('gOeil');if(b)b.setAttribute('aria-pressed',on?'true':'false');}
/* (2026-10-11, passe UX) LE PANNEAU QUI FLOTTE : HOME et l'ŒIL quittent la console (#gAct, coupée par le clip-path du panneau) pour #gFlot,
   posé sur la scène (voir <style id="uxPasse">). Mêmes éléments, mêmes écouteurs. --gPanB = la hauteur du panneau depuis le bas de l'écran :
   debout, la paire se pose juste au-dessus. */
/* (2026-10-11, Léo : « remets comme avant ») HOME et l'ŒIL restent dans la console (#gAct) : plus de #gFlot */
/* (2026-10-11, Léo : « reviens comme avant : l'argent et l'aura à leur place, HOME et l'œil au-dessus d'INVENTAIRE · BOUTIQUE ») le coin #gCoin est retiré ;
   (même soir) HOME et l'ŒIL dans leur rangée à eux (#gRang1), au-dessus d'INVENTAIRE · BOUTIQUE, sur la largeur des deux : voir « LA RANGÉE HOME + ŒIL » */
try{if(gEl){const ac=document.getElementById('gAct'),r1=document.createElement('div');r1.id='gRang1';
  for(const id of ['gHomeBas','gOeil']){const b9=document.getElementById(id);if(b9)r1.appendChild(b9);}
  if(ac)ac.insertBefore(r1,ac.firstChild);}}catch(e){}
try{document.getElementById('gOeil').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic(gEl.classList.contains('vueSeule')?'on':'off');gVueSeule(!gEl.classList.contains('vueSeule'));});}catch(e){}
function gConsoleCache(on){if(!gEl)return;gEl.classList.toggle('consoleCachee',!!on);garLibre._r=null;
  const b=document.getElementById('gCache');if(b){b.setAttribute('aria-pressed',on?'true':'false');const sp=b.querySelector('span');if(sp){sp.dataset.fr=on?'VOIR':'CACHER';sp.textContent=TR(sp.dataset.fr);}}}
try{document.getElementById('gCache').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic('onglet');gConsoleCache(!gEl.classList.contains('consoleCachee'));});
  document.getElementById('gHomeBas').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);const c=$('gClose');if(c)c.click();});
  if(!I18N['CACHER'])I18N['CACHER']='HIDE';}catch(e){}
/* le plateau suit le mode : en BOUTIQUE le 1er objet à acheter (si celui qu'on voit ne l'est pas), en INVENTAIRE ta caisse / le 1er objet
   à toi (si celui qu'on voit ne l'est pas) — au changement de mode ET d'onglet (shopTab) */
function gModeCale(){const m=gModeM();if(m==='tout'||m==='shop'||m==='tous')return; // (2026-10-10, Léo : « quand tu appuies sur SHOP, ça ne change pas automatiquement ta voiture : ça attend que tu appuies sur une voiture ») la BOUTIQUE ne saute plus sur la 1re caisse (ou le 1er habillage) à vendre
  if(SHOP.tab==='voiture'){if(m==='inv'){if(!gPossede(garageI))garageSaute(SAVE.d.equipped|0);return;}const L=gModeListeVoitures(m);if(L.length&&L.indexOf(garageI)<0)garageSaute(L[0]);return;}
  const cat=SHOP.tab,Lc=COSM[cat],cur=Lc[SHOP.i[cat]],ok=function(d){const a=shopOwned(cat,d.id);return m==='inv'?a:(!a&&!!(d.p||d.eur));};
  if(cur&&!ok(cur)){const j=Lc.findIndex(ok);if(j>=0)shopShow(cat,j);}}
try{Object.keys({'RIEN ICI':1,'TOUT EST A TOI':1}).forEach(function(k){if(!I18N[k])I18N[k]=k==='RIEN ICI'?'NOTHING HERE':'ALL YOURS';});}catch(e){}
// LA FILE DU STUDIO PHOTO : une vignette par image, jamais pendant la bascule du plateau ni hors du garage
/* LE STUDIO SANS À-COUPS (2026-10-16, Léo : « le garage dans la boutique, ça rame de ouf ») — MESURÉ au banc (iPhone simulé, processeur ×4) :
   à l'ouverture de la boutique, la grille demandait ses 48 photos d'un coup et la file en prenait UNE PAR IMAGE, ~150 ms chacune (la caisse
   bâtie, rendue, relue, développée, puis la caisse regardée rebâtie) : 5 à 9 images/s pendant 8 s. Désormais :
   · une carte de la grille donne son ÉLÉMENT (`el`) : sa photo attend d'être EN VUE — on ne photographie que ce qu'on regarde, défiler en
     amène d'autres ; une carte sortie de la page (rayon changé) est oubliée ;
   · la file RESPIRE : après une photo de d ms, rien pendant 2 × d (150 à 400 ms) ; rien pendant la bascule garage ⇄ boutique (voile
     compris), sous un doigt (garage, boutique), ni pendant qu'on fait défiler la grille (photoCalme) ;
   · à l'entrée de la boutique, SOUS LE VOILE, les vignettes en vue se prennent à la chaîne (photoRafale) : la caisse regardée n'est rebâtie
     qu'une fois, à la fin, et la grille se découvre déjà remplie ;
   · les photos sont GARDÉES d'une session à l'autre pour la version publiée (PHDB) : la 2e ouverture n'en prend plus aucune. */
const PHQ={q:[],on:false,pret:0,defile:0};
function photoFile(i,cb,el){if(PHOTO.cache[i]){cb(PHOTO.cache[i]);return;}PHQ.q.push([i,cb,undefined,el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
function photoCalme(){const t=performance.now();
  if(document.hidden||ecranWipe._on||garageDrag||t-PHQ.defile<260)return false;
  if(typeof GBQ!=='undefined'&&(GBQ.drag||GBQ.veut!==GBQ.on||!GBQ.bascule||t<(bqVoile._fin||0)))return false;
  return true;}
/* la photo suivante : une vignette EN VUE d'abord ; sinon une demande sans élément (bande du garage, inventaire, missions) — `stricte` (la
   rafale) : seulement les caisses en vue */
function photoChoix(stricte){let lib=-1;
  for(let j=0;j<PHQ.q.length;j++){const it=PHQ.q[j],el=it[3];
    if(!el){if(lib<0&&!stricte)lib=j;continue;}
    if(!el.isConnected){PHQ.q.splice(j--,1);continue;}
    if(stricte&&it[2])continue;
    const b=el.getBoundingClientRect();if(!b.width)continue;const sc=el.closest('.bqRail');let y0=0,y1=VP.h,x0=0,x1=VP.w;
    if(sc){const r=sc.getBoundingClientRect();y0=Math.max(y0,r.top);y1=Math.min(y1,r.bottom);x0=Math.max(x0,r.left);x1=Math.min(x1,r.right);}
    if(b.bottom>y0-8&&b.top<y1+8&&b.right>x0&&b.left<x1)return j;}
  return lib;}
function photoPrends(it){const u=PHOTO.cache[it[0]];
  if(u)it[1](u);else try{const a9=it[2];if(a9&&a9.fig)figFilm(a9,function(u9){if(u9)it[1](u9);});else carPhoto(a9?equippedCar():it[0],function(u9){if(u9)it[1](u9);},a9);}catch(e){} /* (2026-10-15 soir) a9.fig : la photo d'une FIGURE (figFile) — (2026-10-18) son FILM (figFilm) */ // (2026-10-15) it[2] : la photo d'une AILE (aileFile) // (OPTIMISATION) encodée hors du fil (toBlob), posée à son arrivée
}
function photoTour(){
  if(!PHQ.q.length||!garageOn||gEl.classList.contains('quiet')){PHQ.on=false;return;} // (2026-09-26) garage fermé : la file attend le prochain passage (openGarage la relance) — (2026-09-28, chasse aux gels) et le garage du JOUER (`quiet`) n'affiche aucune vignette : MESURÉ, il y prenait 2 à 3 photos pendant le fondu (chacune reconstruit deux caisses, ~200 ms et 4 programmes) pour une bande que personne ne voit
  requestAnimationFrame(photoTour);
  if(GAR.sw||GAR.go)return;
  const t=performance.now();if(t<PHQ.pret||!photoCalme())return;
  const j=photoChoix(false);if(j<0){PHQ.pret=t+200;return;} // que des vignettes hors de vue : on regarde de nouveau dans 200 ms (pas de mesure de la page à chaque image)
  const it=PHQ.q.splice(j,1)[0];photoPrends(it);const d=performance.now()-t;PHQ.pret=performance.now()+Math.min(400,Math.max(150,d*2));
}
/* LA RAFALE SOUS LE VOILE : `ms` de photos d'affilée (les caisses en vue), la caisse regardée rebâtie une seule fois à la fin */
const PHOTO_RAFALE_MS=300;
function photoRafale(ms){if(!PHQ.q.length||(started&&!gameOver))return 0;
  const t0=performance.now(),av=carGroup.userData.lvl;let n=0;PHOTO.chaine=true;PHOTO.avant=av;
  try{while(performance.now()-t0<ms){const j=photoChoix(true);if(j<0)break;const it=PHQ.q.splice(j,1)[0];
      if(PHOTO.cache[it[0]]){it[1](PHOTO.cache[it[0]]);continue;}
      carPhoto(it[0],function(u9){if(u9)it[1](u9);});n++;}}
  catch(e){console.warn('photoRafale',e);}
  finally{PHOTO.chaine=false;if(n)try{buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);}catch(e){console.warn('photoRafale',e);}}
  PHQ.pret=performance.now()+120;PHQ.rafale={n:n,ms:Math.round(performance.now()-t0)};return n;}
window.dbgPhotoCar=function(i){delete PHOTO.cache[i];return carPhoto(i|0);}; // (banc) la photo de la caisse i, refaite, en data: (pour comparer deux pellicules)
window.dbgPhotoFile=function(){return {file:PHQ.q.length,on:PHQ.on,rafale:PHQ.rafale||null,gardees:PHDB.n,db:PHDB.db?'ouverte':String(PHDB.db),calme:photoCalme()};}; // (banc)
function gBankPaint(){const gb=$('gBank');
  if(gb)gb.innerHTML=TR('COMPTE')+' : '+fmtSolde(bank())+'<span class="aura">'+pxi('etoile')+' '+fmtAura(SAVE.d.aura||0)+'</span>';
  gCompteur();}
/* LE COMPTEUR DU GARAGE, FAÇON GTA (2026-09-25, user : « trop de texte — mets le prix en haut, joliment, avec un vrai
   compteur comme GTA »). Le solde en chiffres COMPLETS (« $35,850 », pas « 35,9 k »), vert, contour noir, en haut à
   gauche. Quand il change, il DÉFILE jusqu'à la nouvelle valeur ; une dépense fait tomber « −$6,000 » en rouge dessous. */
function gAuraMaj(){ // (2026-10-09, Léo) LA JAUGE AURA sous le compte : le total, le rang, et la jauge vers le rang suivant
  const el=$('gAuraC');if(!el)return;const au=SAVE.d.aura||0,r=auraRank(au),lo=AURA_RANKS[r].v,nx=AURA_RANKS[r+1];
  const k=nx?Math.max(0,Math.min(1,(au-lo)/(nx.v-lo))):1,cle=au+'|'+r+'|'+LANG;if(cle===gAuraMaj._k)return;gAuraMaj._k=cle;
  el.querySelector('b').textContent=fmtAura(au);el.querySelector('small').textContent='';
  el.querySelector('u em').style.width=Math.round(k*100)+'%';el.setAttribute('aria-label','Aura '+fmtAura(au));}
function gCompteur(){
  try{gAuraMaj();}catch(e){}
  const el=$('gCompteur');if(!el)return;const b=el.querySelector('b'),v=Math.floor(bank()),v0=gCompteur._v;
  // (2026-09-26) chiffres COMPLETS façon GTA, mais au format de la LANGUE : en français « $42,000 » se lisait 42 dollars.
  // Les espaces insécables de fr-FR deviennent des espaces simples (la police pixel n'a pas U+202F).
  const fmt=fmtSolde; /* (2026-10-14) l'écriture du SOLDE PRÉCIS, partagée par toutes les plaques */ // (2026-09-28) \u00ab $ 48 250 \u00bb : la m\u00eame \u00e9criture que l'\u00e9cran de mort et les annonces
  if(v0==null||REDUCED_MOTION){soldeTxt(b,v);gCompteur._v=v;return;}
  if(v===v0)return;
  if(v<v0){const d=document.createElement('i');d.className='gcMoins';d.textContent='-'+fmt(v0-v);el.appendChild(d);setTimeout(function(){d.remove();},1400);}
  el.classList.remove('bouge');void el.offsetWidth;el.classList.add('bouge');
  if(v<v0&&garageOn&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching'))try{sfx('ui.compteur');}catch(e){} // (console de son) la DÉPENSE qui défile (0,9 s) : la liasse qui se compte, la note qui descend — vitrine visible seulement
  const t0=performance.now(),D=900;gCompteur._v=v;
  (function f(){const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,3);soldeTxt(b,v0+(v-v0)*e);if(k<1&&gCompteur._v===v)requestAnimationFrame(f);})();
}
// les PASTILLES sous le nom : où on est dans la liste, ce qui est à toi (plein), ce que tu portes (or)
function gDots(L){const el=$('gDots');if(!el)return;
  el.innerHTML=L.map(function(d){return '<i class="'+(d.on?'on ':'')+(d.a?'a ':'')+(d.eq?'eq':'')+'"></i>';}).join('');}
/* ---- LA BOUTIQUE DANS L'ATELIER (2026-09-25) ------------------------------------------------------------
   Même fiche, mêmes flèches, même caisse au milieu : l'onglet change ce qu'on feuillette. Dans une catégorie
   d'habillage, la caisse montrée est TA caisse équipée (on habille ce qu'on conduit), et l'article feuilleté
   est ESSAYÉ dessus (`SHOP.prev`) — qu'il soit à toi ou pas. Fermer l'atelier retire l'essai. */
const SHOP_LBL={voiture:'CAISSE',peinture:'PEINTURE',aile:'AILES',trainee:'TRAÎNÉE',figure:'FIGURE'};
/* LE CIEL DU MENU DANS LE HOME DU GARAGE (2026-10-11, Léo : « le bouton HOME doit être le MÊME ciel que le ciel du menu, en plus petit ;
   quand c'est la nuit, il faut que ce soit la nuit aussi dans le HOME du garage ») : l'atelier ne dessine pas le ciel du menu (il a sa
   propre lumière) — alors, tant que l'ACCUEIL est à l'écran, on recopie toutes les 3 s un morceau du VRAI ciel rendu (le haut de l'image,
   au centre : au-dessus de la caisse) dans une petite toile posée au fond de HOME. Au garage, HOME montre donc le ciel tel qu'on l'a
   quitté — jour, couchant ou nuit — et il vit d'un lent travelling (CSS). Avant la 1re prise, le ciel peint en CSS reste en secours.
   La copie se fait DANS la même image que le rendu (après, le tampon WebGL peut être vidé). */
function homeCielPrise(now){
  const ciel=(garageOn&&!!gEl&&gEl.classList.contains('menu'))||(!garageOn&&((!started||gameOver)||MENUV.retour)); // l'ACCUEIL : le garage en mode « menu » (le ciel), ou l'ancien menu hors garage
  if(!ciel||(typeof stallOn!=='undefined'&&stallOn))return;
  if(now-(homeCielPrise._t||0)<3000)return; // toutes les 3 s : le ciel change lentement, et relire l'image WebGL coûte un peu sur iPhone
  homeCielPrise._t=now; // (2026-10-12, passe qualité) cette pose était collée DERRIÈRE le « // » : la relecture GPU→CPU tournait à CHAQUE image au menu
  let cv=homeCielPrise._cv;
  if(!cv){const b=document.getElementById('gHomeBas');if(!b)return;cv=homeCielPrise._cv=document.createElement('canvas');cv.className='gHomeCielCv';cv.width=160;cv.height=210;cv.setAttribute('aria-hidden','true');b.insertBefore(cv,b.firstChild);}
  const src=renderer.domElement,W=src.width,H=src.height;if(!(W>8&&H>8))return;
  const a=cv.width/cv.height;let sh=H*.34,sw=sh*a;if(sw>W){sw=W;sh=W/a;}
  const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src,(W-sw)/2,0,sw,sh,0,0,cv.width,cv.height);cv.classList.add('on');
  /* LES BOUTONS SUIVENT LE CIEL (2026-10-11, Léo : « change la colorimétrie des boutons selon que c'est la nuit : tous un peu plus sombres et
     sobres — et vice versa ») : la luminosité moyenne de la vignette (un pixel sur 16) dit le moment — NUIT sous ,22 (html.cielNuit : boutons
     plus sombres et sobres), JOUR au-dessus de ,38 (html.cielJour : un cran plus clairs et vifs), entre les deux (couchant) : tels quels. */
  try{const d=cx.getImageData(0,0,cv.width,cv.height).data;let l=0,n=0;for(let i=0;i<d.length;i+=64){l+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];n++;}l=l/n/255;
    const h=document.documentElement;h.classList.toggle('cielNuit',l<.22);h.classList.toggle('cielJour',l>.38);homeCielPrise._l=+l.toFixed(3);}catch(e){}}
/* LA CAISSE SE TOURNE VERS CE QU'ON REGARDE (2026-10-11, Léo : « quand on appuie sur TRAÎNÉES et PEINTURE, au lieu de faire TP de position,
   la voiture se tourne pour montrer les différentes features — TRAÎNÉES : la vue de l'arrière ») : l'onglet ne POSE plus l'angle d'un coup
   (garageAng=3.5), il le fait TOURNER en ~0,9 s par le plus court chemin (garTourneVers, joué dans garageRender, prioritaire sur la rotation
   lente ; le doigt l'interrompt). TRAÎNÉES 3,5 (trois-quarts arrière) · PEINTURE ,42 (trois-quarts avant) · AILES 1,2 (de profil). */
const GAR_TAB_ANG={trainee:3.5,peinture:.42,aile:1.2,figure:1.25}; // (FIGURES : de profil, on voit les saltos)
function garTourneVers(a,D){if(!garageOn||GAR.go)return;const a0=garageAng,T=2*Math.PI,d=((a-a0)%T+T*1.5)%T-T/2;if(Math.abs(d)<.02)return;GAR.angTw={a0:a0,d:d,t:0,D:D||.9};}
function shopTab(tab){
  if(SHOP_CATS.indexOf(tab)<0)tab='voiture';
  SHOP.tab=tab;
  document.querySelectorAll('#gTabs .gTab').forEach(function(b){const on=b.getAttribute('data-tab')===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  const gt=$('gTitle');if(gt)gt.textContent=TR('GARAGE'); // la personnalisation fait partie du GARAGE (la BOUTIQUE, c'est le vrai argent)
  if(gEl){gEl.classList.toggle('shopMode',tab!=='voiture');gEl.classList.toggle('figTab',tab==='figure');}if(tab!=='figure'&&window.GFS)GFS.arme=-1; // (2026-10-15) figTab : le sélecteur des trois figures (#gFigSel) au-dessus de la grille
  if(GAR_TAB_ANG[tab]!=null)garTourneVers(GAR_TAB_ANG[tab]); // TRAÎNÉES : la caméra passe derrière la caisse (trois-quarts arrière) — on regarde ce qui SORT des tuyères ; (2026-10-11) en TOURNANT, et chaque onglet a son angle
  if(tab==='voiture'){SHOP.prev=null;{const bar=$('gRar');if(bar)bar._k=null;}garageShow(garageI);try{gModeCale();}catch(e){}return;}
  SHOP.filtre='tout'; // chaque catégorie s'ouvre sur TOUT
  const eqI=COSM[tab].indexOf(shopEqD(tab));shopShow(tab,eqI<0?0:eqI);try{gModeCale();}catch(e){} // (2026-10-09) en INVENTAIRE / BOUTIQUE, l'onglet s'ouvre sur un objet du mode
}
function shopShow(cat,i){
  const L=COSM[cat];i=((i%L.length)+L.length)%L.length;
  SHOP.i[cat]=i;SHOP.prev={cat:cat,i:i};
  if(cat==='figure'&&garageOn)try{garFigEssai(L[i].id);}catch(e){} // (2026-10-14) la caisse FAIT la figure qu'on regarde
  const eqC=equippedCar();garageI=eqC;buildCar(CARS[eqC]);
  const d=L[i],a=shopOwned(cat,d.id),eq=shopEqD(cat)===d,Lg=LANG==='en'?1:0;
  gNomEntre(TR(d.n));
  gLvlEl.textContent=(i+1)+' / '+L.length;gSpdEl.textContent='';
  {const pl=$('gRarPill');if(pl){pl.textContent=sansAcc(TR(SHOP_LBL[cat]));pl.style.removeProperty('--rc');}} // (charte v4) la pastille dit la CATÉGORIE — la fiche garde ses trois étages
  if(!a&&d.mis2)gDescEl.innerHTML=m2DebloqueHtml(m2Def(d.mis2)); // (2026-10-16) LES MISSIONS v2 : SE DÉBLOQUE + VOIR LA MISSION
  else gDescEl.textContent=(d.fig&&window.FIG&&FIG.par[d.id])?figDesc(FIG.par[d.id],LANG):TR(d.d); // (2026-10-14) une FIGURE se décrit dans la langue du joueur // (2026-10-15, UNE SEULE POLICE) la fiche est en pixel : TR (majPix) retire l'accent des seuls mots en capitales
  $('gCard').classList.toggle('defis',!a&&!!(d.mis||d.mis2));$('gCard').classList.remove('verrou');
  const sw=$('gSw');
  if(sw){ // LE NUANCIER : la teinte (ou le dégradé) de la peinture, le ruban de la traînée
    let bg='';
    const hx=function(c){return '#'+c.toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
    if(cat==='peinture'){const c9=d.id==='usine'?CARS[eqC].color:d.c;bg=d.mot?motFond(d):d.grad?'linear-gradient(90deg,'+d.grad.map(hx).join(',')+')':hx(c9);}
    else if(cat==='trainee')bg=d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 30%,'+(d.rgb?rg(d.rgb):'#ffb040')+')';
    sw.style.display=bg?'':'none';sw.className=cat;sw.innerHTML=bg?'<i style="background:'+bg+'"></i>':'';
  }
  const bt=$('gEquip'),bb=$('gBuy'),row=$('gBuyRow');
  if(row)row.style.display=(!a&&(d.p||d.eur))?'':'none';
  if(bb){bb.dataset.bout='';if(!a&&d.eur){bb.innerHTML='<span>'+TR('ACHETER')+'</span><b class="gPrix">'+eurTxt(d.eur)+'</b>';bb.dataset.px=eurTxt(d.eur);bb.dataset.eur='1';bb.classList.remove('pauvre');} /* (2026-10-16) une peinture en EUROS */ else if(!a&&d.p){const peut=bank()>=d.p;bb.innerHTML=gPrixHtml(peut,d.p);bb.dataset.px=fmtC(d.p);bb.dataset.eur='';bb.classList.toggle('pauvre',!peut);}}
  if(bt){
    bt.style.display=(!a&&(d.p||d.eur))?'none':'';
    bt.disabled=false;
    if(!a)gEtat(bt,'verrou','verrou','À GAGNER');
    else if(cat==='figure')gEtat(bt,'eq','coche','ACQUISE'); // (2026-10-14) une figure à toi joue d'office
    else if(eq)gEtat(bt,'eq','coche','ÉQUIPÉE');
    else gEtat(bt,'',null,'ÉQUIPER');
  }
  gActSync();
  $('gCard').style.setProperty('--rc',cat==='peinture'?'#ff9ad8':cat==='aile'?'#9fe8ff':'#ffb040');
  gDots(L.map(function(x,j){return {on:j===i,a:shopOwned(cat,x.id),eq:shopEqD(cat)===x};}));
  gStripHabits(cat,i);
  gBankPaint();
}
/* ---- LA CHARTE v4 AU GARAGE (2026-09-26) ------------------------------------------------------------------------------
   `gEtat` : la touche ÉQUIPER dit son état par sa MATIÈRE (voir CSS `#gEquip[data-etat]`) — et plus par une opacité posée
   à la main. `gPrixHtml` : le verbe à gauche, le PRIX en gros à droite, dans le lingot (ou en rouge « il manque »). */
function gEtat(bt,etat,ic,txt){bt.dataset.etat=etat;bt.setAttribute('aria-disabled',etat?'true':'false');
  bt.innerHTML=(ic?pxi(ic):'')+'<span>'+TR(txt)+'</span>';}
function gNomEntre(t){ // le NOM entre en glissant (seulement s'il CHANGE : rafraîchir la fiche ne le fait pas rejouer)
  gNameEl.style.setProperty('--nL',Math.max(8,String(t).length)); /* (garage v6) la taille du nom suit sa longueur — posée même si le nom ne change pas */
  if(gNameEl.textContent===t)return;gNameEl.textContent=t;if(REDUCED_MOTION)return;
  gNameEl.classList.remove('entre');void gNameEl.offsetWidth;gNameEl.classList.add('entre');}
function eurTxt(s){if(!s||LANG==='fr')return s;const v=parseFloat(String(s).replace(',','.'));return isFinite(v)?'€'+v.toFixed(2):s;}
function gTampon(t){const c=$('gCard');if(!c)return;if(REDUCED_MOTION){toast(pxi('coche')+' '+t);return;} /* « réduire les animations » : l'achat se DIT quand même */ c.dataset.tampon=t;c.classList.remove('tampon');void c.offsetWidth;c.classList.add('tampon');
  {const e=$('gEclat');if(e){e.style.setProperty('--rc',getComputedStyle(c).getPropertyValue('--rc')||'#ffd75e');e.classList.remove('on');void e.offsetWidth;e.classList.add('on');}} // et un éclair de SA couleur derrière la caisse
  clearTimeout(gTampon._t);gTampon._t=setTimeout(function(){c.classList.remove('tampon');},2000);} // l'achat se FÊTE : le tampon d'or « À TOI ! »
function gPrixHtml(peut,prix){return '<span>'+TR(peut?'ACHETER':'IL MANQUE')+'</span><b class="gPrix">'+fmtC(peut?prix:prix-bank())+'</b>';}
/* L'INVENTAIRE ILLUSTRÉ (2026-10-15, Sacha : « les peintures, ça va, mais les traînées, les ailes et les figures, il n'y a pas les images —
   il n'y a qu'à mettre une illustration ») : chaque objet de la console a SON dessin, plus un pictogramme commun à toute la famille.
   · les AILES et les TRAÎNÉES d'origine (les POP ont déjà le leur : `ico`/`col`) : un pictogramme et une couleur chacune (ILLU_COS) ; la nitro
     et l'arc-en-ciel sont peints d'un dégradé À TRAVERS le masque du pictogramme (illuPx) ;
   · une AILE passe en PHOTO dès que `aileFile` existe (la caisse équipée qui la porte, la photo de la boutique) — d'ici là, son pictogramme ;
   · une FIGURE = la caisse vue sous l'axe de son mouvement — de PROFIL pour un salto, une chandelle, une toupie ; de DOS pour un tonneau — au
     milieu de son ANNEAU (rond = salto ou tonneau, à plat = toupie, penché = deux axes, deux pointes = 720), dans la couleur de sa rareté
     (ILLU_FIG, illuFig). Le sens se lit : salto avant dans le sens des aiguilles, arrière à l'envers (l'anneau en miroir). La vignette choisie
     et les cases du sélecteur JOUENT la figure : la caisse du calque tourne (`--fgA` = le geste, `--sg` = le sens).
   ⚠ `ILLU_FIG` connaît les 13 figures de figures.js : une figure ajoutée sans sa ligne prend l'anneau du salto (rien ne casse, elle ressemble au salto). */
const ILLU_COS={aile:{panneaux:['ai_panneaux','#e0b56a'],helices:['ai_helices','#9fe8ff'],plumes:['ai_plumes','#ffffff'],chauve:['ai_chauve','#a98bd8']},
  trainee:{nitro:['tr_nitro','linear-gradient(90deg,#d8400c,#ff8a24 50%,#fff1c2)'],rose:['tr_rose'],or:['tr_or'],wow:['tr_wow','#e8b04a'],
    arcenciel:['tr_arc','radial-gradient(circle at 50% 80%,#9b5bff 0 24%,#3bb4ff 24% 38%,#3bff6a 38% 52%,#ffe23a 52% 66%,#ff9b1a 66% 80%,#ff3b3b 80%)']}};
const ILLU_FIG={tailwhip:['fg_demi',0,'voiture','fgWhip'],tonneau:['fg_rond',0,'cv_dos','fgRoll'],toupie:['fg_plat',0,'voiture','fgSpin'],shimmy:['fg_danse',0,'voiture','fgShim'],
  chandelle:['fg_arc',1,'voiture','fgChand'],saltoa:['fg_rond',1,'voiture','fgSalto'],saltov:['fg_rond',0,'voiture','fgSalto'],double:['fg_rond2',0,'cv_dos','fgRoll2'],
  tirebouchon:['fg_ovale',1,'cv_dos','fgTire'],helico:['fg_plat2',0,'voiture','fgSpin2'],penche:['fg_ovale',0,'voiture','fgPenche'],rodeo:['fg_ovale',1,'voiture','fgRodeo'],
  cosmique:['fg_rond2',1,'voiture','fgSalto2']}; // [anneau, miroir (1 = à l'envers), vue de la caisse, geste joué]
try{Object.assign(I18N,{'FIGURES ÉQUIPÉES':'EQUIPPED TRICKS','VIDE':'EMPTY'});}catch(e){}
function illuTr(d){if(d.ico)return {ic:d.ico,c:d.col||'#ffb040'};const I=ILLU_COS.trainee[d.id];if(!I)return null;
  return {ic:I[0],c:I[1]||(d.rgb?'rgb('+d.rgb.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')':'#ff8a24')};}
function illuAile(d){if(d.ico)return {ic:d.ico,c:d.col||'#dff6ff'};const I=ILLU_COS.aile[d.id];return I?{ic:I[0],c:I[1]}:{ic:'aile',c:'#dff6ff'};}
function illuPx(o,cl,eteint){return '<i class="pxi pxi-'+o.ic+(cl?' '+cl:'')+'" style="'+(eteint?'color:#6c6390':(/gradient/.test(o.c)?'background:'+o.c:'color:'+o.c))+'" aria-hidden="true"></i>';}
/* la figure `id` en dessin : son anneau + la caisse (calque) ; `av` = jouée vers l'AVANT — une figure à deux sens (rodéo, tire-bouchon,
   cosmique) tourne alors à l'endroit, comme la caisse la fait dans cet emplacement (FIG.oriente) */
function illuFig(id,c,av,cl){const I=ILLU_FIG[id]||['fg_rond',0,'voiture','fgSalto'],f=window.FIG&&FIG.par[id];let m=I[1];
  if(av&&f&&FIG.dirs&&FIG.dirs(f).length>1)m=1-m;
  return '<i class="fgIl'+(cl?' '+cl:'')+'" style="--fc:'+c+';--sg:'+(m?-1:1)+';--fgA:'+I[3]+(I[3]==='fgWhip'?';--fgO:88% 62%':I[3]==='fgChand'?';--fgO:22% 88%':'')+'" aria-hidden="true"><i class="pxi pxi-'+I[0]+' fgAn'+(m?' mir':'')+'"></i><i class="pxi pxi-'+I[2]+' fgCv"></i></i>';}
/* LES TROIS FIGURES ÉQUIPÉES, AU-DESSUS DE LA GRILLE (2026-10-15, Sacha : « dans l'onglet FIGURES, un bouton un peu stylé : le truc du NITRO
   et trois cases en forme d'hexagone, avec les figures sélectionnées et les flèches du joystick — haut, bas, côté — pour qu'on puisse
   sélectionner les trois figures qu'on veut ; au-dessus des figures ») — #gFigSel, montré par le CSS en INVENTAIRE (atelierInv), onglet
   FIGURES seulement (`figTab`). À gauche l'ÉCLAIR du bouton NITRO (sa grille NX3_G, sa palette) et « ×2 » : le double-tap ; puis les trois
   emplacements dans l'ordre du jeu (FIG_FAM : ↑ avant, ↓ arrière, ◄► côté), chacun sa case hexagonale, sa figure qui tourne, son joystick.
   · toucher une CASE l'ARME (elle bat ; la grille éteint les figures qui n'y vont pas) ; retouchée, elle se désarme ;
   · toucher une FIGURE l'équipe (gFigTouche) : dans la case armée si elle y va, sinon dans sa direction (figEquipe : une par direction, celle
     qui y était laisse sa place) ; la case qui la reçoit s'allume, la caisse du plateau fait la figure dans ce sens.
   Une direction sans figure : la case dit VIDE (son geste, en vol, ne fait rien). */
var GFS={arme:-1,flash:-1,k:''};
function gFigNitroSvg(){if(gFigNitroSvg._s)return gFigNitroSvg._s;
  const G=NX3_G,P=NX3_PAL.or,w=G[0].length,h=G.length,on=function(x,y){return y>=0&&y<h&&x>=0&&x<w&&G[y][x]==='#';},
    ep=function(x,y){return !on(x,y)&&(on(x,y-1)||on(x,y-2));},plein=function(x,y){return on(x,y)||ep(x,y);},cs=function(x,y){return 'M'+(x+1)+' '+(y+1)+'h1v1h-1z';};
  let O='',E='',F='',B='';
  for(let y=-1;y<=h+2;y++)for(let x=-1;x<=w;x++){
    if(on(x,y)){if(!on(x,y-1)||!on(x-1,y))B+=cs(x,y);else F+=cs(x,y);}   // le biseau clair sur l'arête haute-gauche, le plein dessous
    else if(ep(x,y))E+=cs(x,y);                                          // l'ÉPAISSEUR : deux cases sous l'éclair, comme le vrai bouton
    else{let v=false;for(let j=-1;j<=1&&!v;j++)for(let i=-1;i<=1;i++)if(plein(x+i,y+j)){v=true;break;}if(v)O+=cs(x,y);}} // le contour d'encre
  return gFigNitroSvg._s='<svg class="fsBolt" viewBox="0 0 '+(w+2)+' '+(h+4)+'" shape-rendering="crispEdges" aria-hidden="true"><path fill="'+P[7]+'" d="'+O+'"/><path fill="'+P[4]+'" d="'+E+'"/><path fill="'+P[1]+'" d="'+F+'"/><path fill="'+P[0]+'" d="'+B+'"/></svg>';}
function gFigSelEl(){let el=document.getElementById('gFigSel');if(el)return el;const st=document.getElementById('gStrip');if(!st||!st.parentNode)return null;
  el=document.createElement('div');el.id='gFigSel';el.setAttribute('role','group');
  el.innerHTML='<div class="fsNitro" aria-hidden="true">'+gFigNitroSvg()+'<b>×2</b></div>'
    +FIG_FAM.map(function(F,k){return '<button type="button" class="fsHex" data-k="'+k+'"><span class="fsCase"><span class="fsIn"></span></span><i class="fsJoy">'+pxi(F[2])+'</i><b class="fsNom"></b></button>';}).join('');
  st.parentNode.insertBefore(el,st);
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fsHex');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;
    const k=+b.getAttribute('data-k');uiPop(b);uiClic('onglet');hap(6);GFS.arme=GFS.arme===k?-1:k;GFS.k='';gFigSelMaj();gFigGrilleArme();});
  return el;}
function gFigSelMaj(){const el=gFigSelEl();if(!el||!window.FIG)return;const S=figSlots(),k=S.join(',')+':'+GFS.arme+':'+GFS.flash+':'+LANG;if(GFS.k===k)return;GFS.k=k;
  el.setAttribute('aria-label',sansAcc(TR('FIGURES ÉQUIPÉES')));el.classList.toggle('arme',GFS.arme>=0);
  el.querySelectorAll('.fsHex').forEach(function(b){const s=+b.getAttribute('data-k'),id=S[s],f=id&&FIG.par[id],c=f?rarInfo(cosmRar('figure',f)).c:'#6c6390',nm=f?sansAcc(TR(f.n)):sansAcc(TR('VIDE'));
    b.style.setProperty('--fc',c);b.classList.toggle('vide',!f);b.classList.toggle('on',GFS.arme===s);b.setAttribute('aria-pressed',GFS.arme===s);
    b.querySelector('.fsIn').innerHTML=f?illuFig(id,c,s===0):'<b class="fsQ">?</b>';
    b.querySelector('.fsNom').textContent=nm;b.setAttribute('aria-label',sansAcc(TR(FIG_FAM[s][0]))+' : '+nm);
    if(GFS.flash===s){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}});
  GFS.flash=-1;}
function gFigGrilleArme(){const st=document.getElementById('gStrip'),a=GFS.arme;if(!st)return;
  st.querySelectorAll('.gT.c-figure[data-cos]').forEach(function(el){const d=COSM.figure[+el.getAttribute('data-cos')];el.classList.toggle('horsDir',a>=0&&!!d&&figPeut(d.id).indexOf(a)<0);});}
function gFigTouche(j){const d=COSM.figure&&COSM.figure[j];if(!FIGV2.on||!d||!figPossede(d.id))return false; // pas à toi : la console l'ESSAIE (comme avant)
  const P=figPeut(d.id),k=GFS.arme>=0&&P.indexOf(GFS.arme)>=0?GFS.arme:null;
  figEqToast(d.id,k);const s=k!=null?k:figSlots().indexOf(d.id);
  GFS.arme=-1;GFS.flash=s;GFS.k='';GSON9=true;shopShow('figure',j);try{garFigEssai(d.id,s);}catch(e){}return true;}
