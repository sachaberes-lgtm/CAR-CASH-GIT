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
  const cle=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length,veut=on&&GATL.c>.62&&!GAR.sw&&GATL.cle===cle;
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
  const l=GATL.l,b=GATL.lb=l<=0?0:l>=1?1:l*(Math.sin(t*57)+Math.sin(t*23)>-.3?1:.2),H=GAR.H,dr=.25+2.15*GATL.cs,yA=H-dr;
  GATL.cord.scale.y=dr;GATL.cord.position.set(0,H-dr/2,0);GATL.cul.position.set(0,yA-.02,0);GATL.abat.position.set(0,yA-.24,0);GATL.amp.position.set(0,yA-.42,0);
  GATL.ampM.color.setRGB(.16+.84*b,.15+.8*b,.12+.68*b);
  const hR=yA-.44-GAR.POD,rB=2.5;GATL.ray.position.set(0,GAR.POD+hR/2,0);GATL.ray.scale.set(2*rB,hR,2*rB);GATL.rayM.opacity=.075*b;GATL.ray.visible=b>.01;
  GATL.flaq.position.set(0,GAR.POD+.016,0);GATL.flaq.scale.set(6.4,6.4,1);GATL.flaqM.opacity=.42*b;GATL.flaq.visible=b>.01;
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
