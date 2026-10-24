/* ===== LE BOUTON ROUGE ET SES OUTILS (2026-10-05, Léo : « enlève le bouton coffre ; mets un bouton rouge sur la plateforme qui tourne, à
   côté de la voiture ; quand on appuie, de chaque côté, différents outils se mettent à côté et construisent directement les objets qu'on a
   déjà — pas pour le shop ») =====
   LE BOUTON : un champignon d'arcade rouge sur son socle noir cerclé de jaune et noir, posé SUR le plateau (enfant de `GAR.pod` : il tourne
   avec la caisse), à l'avant droit de la caisse ; son halo rouge respire pour appeler le doigt. Un tap dessus l'enfonce → l'inventaire
   s'ouvre (le même `invOuvre`), un second le referme. En dérapage il s'enfonce dans le plateau (la caisse balaie).
   LES OUTILS : deux bras-robots jaunes d'atelier, un de chaque côté de la caisse — à gauche le PISTOLET À PEINTURE (corps chromé, pot bleu),
   à droite le POSTE À SOUDER (torche, buse de cuivre). Ils SORTENT du plateau à l'ouverture de l'inventaire (0,6 s, bras dépliés), vivent
   (servo qui respire, diode qui clignote), et RENTRENT à sa fermeture. Choisir un objet le fait CONSTRUIRE (`atlConstruit`, ~1,1 s) : la
   PEINTURE → le pistolet balaie la caisse dans un nuage de SA couleur ; l'AILE → le poste soude à l'arrière, gerbes d'étincelles ; la
   TRAÎNÉE → les deux bras aux pots, bouffées ; une CAISSE → les deux bras balaient, le scanner fait le reste. Tout est fait avec le KIT des
   caisses (lpKit / lpMat : zéro programme de plus) et les réservoirs du BURN-OUT (fumée en pixels, feu additif).
   Console : dbgAtelier() → l'état · dbgAtelier(1|0) ouvre / ferme · dbgAtelier('peinture'|'aile'|'trainee'|'voiture') → une construction. */
const ATL_POS={x:-3.54,z:3.54}; // (2026-10-06) la place du bouton rouge, au sol de l'atelier : 5 m du centre (le disque fait 4,5 m, la caisse en dérapage ≤ 4,3), à 135° — à droite de la caisse côté porte. Mesuré (dbgAtelier('pos',x,z)) : debout (343, 388), couché (464, 190) — dans l'image, loin des jauges et de la pile
const ATL={on:false,k:0,press:0,appui:null,btn:null,cap:null,halo:null,bras:[],mats:{},cons:0,cat:'',t:0,v:new THREE.Vector3(),w:new THREE.Vector3(),c:null};
const ATL_PAL={Ro:{g:'p',c:0xff3ec8},Rf:{g:'p',c:0xa8166e},R:{g:'p',c:0xd8262e},Rs:{g:'p',c:0x8e141a},N:{g:'p',c:0x1d2027},K:{g:'p',c:0x626b79},J:{g:'p',c:0xefb52a},Jf:{g:'p',c:0xb9861a},
  B:{g:'p',c:0x2f6cb8},C:{g:'c',c:0xe6e9ee},A:{g:'s',c:0x8792a4},Or:{g:'o',c:0xffc24a},Cu:{g:'o',c:0xd9824a},V:{g:'p',c:0x2f9e63}};
function atlMat(f){return ATL.mats[f]||(ATL.mats[f]=lpMat(f));}
function atlPiece(fn){const K=lpKit(ATL_PAL);fn(K);const G=K.done(),g=new THREE.Group();for(const f in G)g.add(new THREE.Mesh(G[f],atlMat(f)));return g;}
function atlBuild(){
  if(ATL.btn||!GAR.pod)return;
  /* LE BOUTON (2026-10-06, Léo : « un bouton plus minimaliste, sur le côté, plus éloigné de la voiture, qu'il n'ait pas à se rétracter ») :
     une colonne fine d'encre, un filet de néon rouge, la calotte rouge — rien d'autre. Posé HORS du plateau, au-delà de ce que la caisse
     balaie en dérapage (≤ 4,3 m du centre ; le disque fait 4,5 m) : il ne rentre plus jamais. Sa place : `ATL_POS` (réglable à chaud :
     dbgAtelier('pos', x, z)). */
  /* LE BOUTON DANS LA DA DU JEU (2026-10-06, Sacha : « tu peux garder son bouton inventaire, mais retravaille-le dans la DA du reste du jeu ») :
     plus de champignon d'arcade rouge générique — une BORNE de l'atelier, taillée comme ses meubles (le kit des caisses, huit pans à plat) :
     socle d'encre cerclé d'OR, colonne à huit pans baguée d'or, une platine sertie d'or et dessous le filet de NÉON cyan du plateau ; le
     bouton est une calotte À FACETTES rose néon (la couleur du coffre et de la BOUTIQUE), son halo rose respire. Au-dessus flotte le COFFRE
     en pixels (le pictogramme `PXI_G.coffre` de l'interface, en or cerné d'encre) : on sait ce qu'il ouvre. */
  const b=new THREE.Group();
  b.add(atlPiece(function(K){K.cyl('N',.22,.05,8,0,.025,0,'y',.25);K.cyl('Or',.235,.014,8,0,.057,0,'y');K.cyl('N',.08,.44,8,0,.29,0,'y',.095);
    K.cyl('Or',.088,.02,8,0,.4,0,'y');K.cyl('N',.19,.045,8,0,.535,0,'y',.15);K.cyl('Or',.196,.014,8,0,.565,0,'y');}));
  const neon=new THREE.Mesh(new THREE.CylinderGeometry(.155,.155,.012,8),new THREE.MeshBasicMaterial({color:0x5ee6ff,fog:false}));neon.position.y=.505;b.add(neon);
  const cap=atlPiece(function(K){K.lathe('Ro',[[0,0],[.15,0],[.15,.03],[.125,.075],[.065,.105],[0,.11]],8,0,0,0,'y');K.lathe('Rf',[[0,0],[.158,0],[.158,.012],[0,.012]],8,0,-.004,0,'y');});
  cap.position.y=.59;b.add(cap);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.2,.3,8),new THREE.MeshBasicMaterial({color:0xff3ec8,transparent:true,opacity:.4,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  halo.rotation.x=-Math.PI/2;halo.position.y=.6;b.add(halo);
  {const cv=document.createElement('canvas'),S=8,rows=PXI_G.coffre.split('|');cv.width=cv.height=(rows.length+1)*S;const x=cv.getContext('2d'); // le COFFRE en pixels
   for(const [dx,dy,col] of [[1,1,'#0b0730'],[0,0,'#ffd75e']]){x.fillStyle=col;rows.forEach(function(r,j){for(let i=0;i<r.length;i++)if(r[i]==='#')x.fillRect((i+dx)*S,(j+dy)*S,S,S);});}
   const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
   const ico=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));ico.scale.set(.3,.3,1);ico.position.y=.98;b.add(ico);ATL.ico=ico;}
  b.scale.setScalar(1.6);
  b.position.set(ATL_POS.x,0,ATL_POS.z);GAR.pod.parent.add(b);ATL.btn=b;ATL.cap=cap;ATL.halo=halo;ATL.y0=0;
  // LES DEUX BRAS : pied, colonne, épaule → bras → coude → avant-bras → l'outil
  for(const s of [1,-1]){
    const rig=new THREE.Group(),pied=atlPiece(function(K){K.cyl('N',.3,.12,8,0,.06,0,'y',.34);K.cyl('J',.2,.7,8,0,.47,0,'y',.22);K.cyl('Jf',.23,.06,8,0,.83,0,'y');
      K.box('N',.06,.18,.02,0,.45,.215);});                                    // la plaque du constructeur
    rig.add(pied);
    const ep=new THREE.Group();ep.position.y=.88;rig.add(ep);
    ep.add(atlPiece(function(K){K.cyl('K',.14,.26,10,0,0,0,'x');K.cyl('C',.06,.3,8,0,0,0,'x');}));
    const b1=atlPiece(function(K){K.box('J',.16,.72,.16,0,.36,0);K.box('Jf',.17,.06,.17,0,.7,0);K.box('N',.02,.4,.12,.09,.36,0);});ep.add(b1);
    const co=new THREE.Group();co.position.y=.72;ep.add(co);
    co.add(atlPiece(function(K){K.cyl('K',.11,.22,10,0,0,0,'x');}));
    const b2=atlPiece(function(K){K.box('J',.13,.58,.13,0,.29,0);K.box('Jf',.14,.05,.14,0,.56,0);});co.add(b2);
    const tete=new THREE.Group();tete.position.y=.6;co.add(tete);
    tete.add(atlPiece(s>0?function(K){ // le PISTOLET À PEINTURE
        K.box('C',.12,.2,.1,0,.08,0);K.cyl('C',.035,.18,8,0,.24,0,'y');K.cyl('Or',.02,.06,6,0,.35,0,'y');K.lathe('B',[[0,0],[.08,0],[.08,.14],[.05,.17],[0,.17]],10,0,-.16,0,'y');}
      :function(K){ // le POSTE À SOUDER
        K.box('K',.12,.18,.12,0,.07,0);K.cyl('N',.04,.2,8,0,.24,0,'y');K.cyl('Cu',.022,.1,8,0,.38,0,'y',.012);K.cyl('V',.015,.02,6,.07,.12,0,'x');}));
    const diode=new THREE.Mesh(new THREE.SphereGeometry(.03,6,4),new THREE.MeshBasicMaterial({color:s>0?0x5ff0ff:0xffb347,fog:false}));diode.position.set(0,.2,.06);tete.add(diode);
    rig.visible=false;GAR.pod.add(rig);ATL.bras.push({s:s,rig:rig,ep:ep,co:co,tete:tete,diode:diode});
  }
}
function atlBoutonEcran(){ // où est le bouton à l'écran (px) et son rayon — pour le doigt
  if(!ATL.btn||!ATL.btn.visible)return null;
  ATL.btn.updateMatrixWorld(true);ATL.cap.getWorldPosition(ATL.v);ATL.v.y+=.08;const d=camera.position.distanceTo(ATL.v);ATL.v.project(camera);if(ATL.v.z>1)return null; // (2026-10-06) la CALOTTE, où qu'elle soit (sur son pied)
  const r=.5/(d*Math.tan(camera.fov*Math.PI/360))*VP.h*.5;return {x:(ATL.v.x*.5+.5)*VP.w,y:(.5-ATL.v.y*.5)*VP.h,r:Math.max(26,r)};
}
function atlVise(e){if(GAR.go||!garAtelierLibre()||e.button>0)return false;
  const B=atlBoutonEcran();return !!B&&Math.hypot(e.clientX-B.x,e.clientY-B.y)<B.r;}
function atlPresse(){ // le bouton est enfoncé : l'inventaire s'ouvre (ou se ferme)
  ATL.press=1;hap([12,24,10]);
  try{uiClic(INV.on?'retour':'nav');}catch(e){} // (2026-10-14, session SON) ouvrir / fermer l'inventaire = nav / retour, comme le COFFRE et le ✕ (c'était ui.equipe : « équiper » pour ouvrir un tiroir)
  if(INV.on)invFerme();else invOuvre();
}
function atlConstruit(cat){ATL.cons=1.1;ATL.cat=cat;ATL.t=0;}
function atlTick(dt){
  if(!GAR.pod)return;atlBuild();
  const G=garGabarit(),vit=garAtelierLibre(),t=performance.now()*.001; /* (2026-10-06) la vitrine de Léo OU la console de Sacha */
  // le bouton : sur son pied, à la place de l'ancien socle des missions ; il respire, s'enfonce sous le doigt, et RENTRE dans le sol pendant un
  // dérapage (la caisse balaie jusqu'au bord du plateau) ou un lâcher
  ATL.btn.visible=false; // (2026-10-10, Léo : « enlève le bouton rouge au sol, l'inventaire, il n'a plus aucune utilité ») — l'INVENTAIRE vit dans la console ; la borne ne se montre plus (atlBoutonEcran → null : le doigt ne la trouve plus)
  ATL.press=Math.max(0,ATL.press-dt*3.2);const ap=ATL.appui!=null?1:0;ATL.cap.position.y=.59-.04*Math.max(ap,Math.sin(Math.min(1,ATL.press)*Math.PI*.5));
  ATL.halo.material.opacity=(.22+.18*Math.sin(t*3.4))*(INV.on?.4:1)+ATL.press*.5;ATL.halo.scale.setScalar(1+.06*Math.sin(t*3.4)+ATL.press*.25);
  if(ATL.ico){ATL.ico.position.y=.98+.035*Math.sin(t*2.1)-ATL.press*.05;ATL.ico.material.opacity=INV.on?.45:1;const s9=.3*(1+ATL.press*.18);ATL.ico.scale.set(s9,s9,1);} // le COFFRE flotte, il plonge quand on appuie
  // les bras : ils sortent avec l'inventaire
  const cib=vit&&INV.on&&!GAR.go?1:0;ATL.k+=(cib-ATL.k)*Math.min(1,dt*(cib?4.5:5.5));if(ATL.k<.002)ATL.k=0;
  if(ATL.cons>0)ATL.cons=Math.max(0,ATL.cons-dt);ATL.t+=dt;
  const k=ATL.k,e=k*k*(3-2*k),cons=ATL.cons>0?Math.sin(Math.min(1,(1.1-ATL.cons)/1.1)*Math.PI):0;
  for(const A of ATL.bras){
    A.rig.visible=k>.003;if(!A.rig.visible)continue;
    A.rig.position.set(A.s*(G.b+1.05),GAR.POD-1.25*(1-e),-.15);
    let lev=.35,coude=1.15,sw=0,tx=0; // (repère du plateau) le bras GAUCHE (s = +1, en +x) penche vers −x, le droit vers +x : l'inclinaison porte le signe s
    if(cons>0){ // LA CONSTRUCTION : le bras se tend vers la caisse et balaie
      const actif=ATL.cat==='voiture'||ATL.cat==='trainee'||(ATL.cat==='peinture'&&A.s>0)||(ATL.cat==='aile'&&A.s<0);
      if(actif){sw=Math.sin(ATL.t*(ATL.cat==='aile'?14:5))*(ATL.cat==='aile'?.08:.55);lev=.35+.55*cons;coude=1.15-.55*cons;
        if(ATL.cat==='trainee'||ATL.cat==='aile')tx=-.9*cons;}}
    const vie=Math.sin(t*1.3+A.s)*.04;                                          // le servo qui respire
    A.ep.rotation.set(0,sw+tx*.7*A.s,A.s*(-(1-e)*1.0+e*lev+vie));                // Euler XYZ : on PENCHE (z) puis on BALAIE (y)
    A.co.rotation.z=A.s*(e*coude-(1-e)*.3+vie*.5);A.tete.rotation.z=A.s*(.4*e+cons*.3);
    A.diode.material.color.setHex(Math.sin(t*6+A.s*2)>0?(A.s>0?0x5ff0ff:0xffb347):0x222222);
    A.eA=(A.eA||0)+(cons>0&&k>.3?dt*70*Math.max(.35,cons):0);let n9=0;while(A.eA>=1&&n9<8){A.eA-=1;n9++;} // ~70 jets par seconde et par bras, quelle que soit la cadence
    for(let q9=0;q9<n9;q9++){A.tete.updateMatrixWorld(true);ATL.w.set(0,.36,0);A.tete.localToWorld(ATL.w); // la BUSE (au bout de l'outil)
      const dx9=carGroup.position.x-ATL.w.x,dz9=carGroup.position.z-ATL.w.z,dn=Math.max(.3,Math.hypot(dx9,dz9)),ux=dx9/dn*1.4,uz=dz9/dn*1.4; // vers la caisse
      burnPools();
      if(ATL.cat==='peinture'&&A.s>0){const c=ATL.c||{r:.9,g:.4,b:.7};
        burnEmet(BURN.fum,ATL.w.x,ATL.w.y,ATL.w.z,ux+(Math.random()-.5)*.8,-.4+(Math.random()-.5)*.5,uz+(Math.random()-.5)*.8,1.6+Math.random(),.14,.55,.42,c.r,c.g,c.b);}
      else if(ATL.cat==='aile'&&A.s<0){for(let i=0;i<3;i++)burnEmet(BURN.feu,ATL.w.x,ATL.w.y,ATL.w.z,ux*.6+(Math.random()-.5)*3.4,1+Math.random()*2.8,uz*.6+(Math.random()-.5)*3.4,.3+Math.random()*.4,.08+Math.random()*.07,0,1,1,.75+Math.random()*.25,.45);}
      else{burnEmet(BURN.feu,ATL.w.x,ATL.w.y,ATL.w.z,(Math.random()-.5)*2,.6+Math.random()*1.4,(Math.random()-.5)*2,.25+Math.random()*.25,.05+Math.random()*.04,0,.6,.95,1,.4);
        if(ATL.cat!=='voiture'&&Math.random()<.4)burnEmet(BURN.fum,ATL.w.x,ATL.w.y,ATL.w.z,(Math.random()-.5)*.8,.4,(Math.random()-.5)*.8,1.4,.12,.45,.3,.8,.82,.9);}}
  }
  /* (2026-10-07, soir) plus de burnPas ici : burnTick fait vivre les réservoirs à CHAQUE image du garage — burn-out ou pas. Les deux à la fois (quand BURN.k retombait à 0), la fumée VIEILLISSAIT DEUX FOIS PLUS VITE après le lâcher. */
}
window.dbgAtelier=function(a,x,z){
  if(a==='pos'){ATL_POS.x=x;ATL_POS.z=z;if(ATL.btn)ATL.btn.position.set(x,0,z);}
  else if(a===1)invOuvre();else if(a===0)invFerme();else if(typeof a==='string')atlConstruit(a);
  const B=atlBoutonEcran();return {inventaire:!!INV.on,bras:+ATL.k.toFixed(2),construit:+ATL.cons.toFixed(2),cat:ATL.cat,bouton:B?[Math.round(B.x),Math.round(B.y),Math.round(B.r)]:null};
};
document.querySelectorAll('#gInv .ivTab').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();const c=b.getAttribute('data-c');if(!INV.on||c===INV.cat)return;
  uiPop(b);uiClic('onglet');INV.cat=c;if(GAR_TAB_ANG[c]!=null)garTourneVers(GAR_TAB_ANG[c]); /* comme la console : la caisse TOURNE vers ce qu'on habille (TRAÎNÉES : les tuyères) — (2026-10-24, Léo) elle sautait aux traînées et ne bougeait pas pour le reste */
  const g=$('ivGrille');if(g)g.scrollTop=0;invRender();});});
$('ivGrille').addEventListener('click',function(e){const t=e.target.closest('.ivT');if(!t)return;e.stopPropagation();invEquipe(+t.getAttribute('data-i'),t);});
$('ivFerme').addEventListener('click',function(e){e.stopPropagation();uiPop(e.currentTarget);uiClic('retour');invFerme();});
window.dbgInv=function(a,b){if(a==='ouvre')return invOuvre();if(a==='D'){INV.D=+b||.45;return INV.D;}if(a==='cam'){Object.assign(VITRINE_CAM,b||{});return VITRINE_CAM;}if(a==='gabarit')return garGabarit();if(a==='rect'){const r=garCaisseRect();return r&&{x0:Math.round(r.x0),x1:Math.round(r.x1),y0:Math.round(r.y0),y1:Math.round(r.y1)};}if(a==='ferme'){invFerme();return true;}
  if(a==='mvt')return [GAR.vA||0,GAR.vAv||0,GAR.vAc||0,GAR.vD||0]; // (2026-10-05) le banc du tour au doigt : angle, vitesse, cible, décalage
  if(a==='etat')return {vA:GAR.vA||0,vAv:GAR.vAv||0,vD:GAR.vD||0,vDv:GAR.vDv||0,e:GAR.cErr||0,on:GAR.vDon?1:0,ret:GAR.ret?1:0,dV:GAR.dVs||0,cx:GAR.cdx||0,cy:GAR.cdy||0,b:BURN.k||0,inv:INV.on?1:0,vit:GAR.vit||0,gm:GMIS.e||0,vDw:GAR.vDw||0,pose:GAR.vuePose||0}; // (2026-10-06) le banc de la caméra image par image (lisse.mjs)
  if(a==='cat'&&b){INV.cat=b;if(INV.on)invRender();return INV.cat;}
  const g=$('ivGrille');return {on:INV.on,cat:INV.cat,hold:!!INV.hold,tuiles:g?g.querySelectorAll('.ivT').length:0,eq:g?g.querySelectorAll('.ivT.eq').length:0,
    vitrine:!!(gEl&&gEl.classList.contains('vitrine')),aide:!!(gEl&&gEl.classList.contains('aideInv')),vit:+(GAR.vit||0).toFixed(2),vD:+(GAR.vD||0).toFixed(3),wD:+(GAR.wD||0).toFixed(2),cErr:+(GAR.cErr||0).toFixed(3),porte:GAR.porte?+GAR.porte.e.toFixed(2):null,
    compte:['voiture','peinture','aile','trainee'].map(function(c){return c+':'+invListe(c).length;}).join(' ')};};
function garMode(m){
  if(!gEl)return;
  try{uiGarde(320);}catch(e){} // (2026-10-14, chasse aux bugs) changer d'écran de l'atelier (menu ↔ missions ↔ boutique) arme le verrou du double-tap, comme gModeVa : sans volet (HOME des missions, porte MISSIONS de l'accueil), le 2e tap tombait sur l'écran d'arrivée — le JOUER de l'accueil lançait une course
  invFerme(true);invHoldFin();burnFin();gEl.classList.remove('vitrine','deplie','aideInv');const menu=m==='menu'||m==='missions',mis=m==='missions'; // (2026-09-30) MISSIONS = le menu, vu d'en haut, avec la constellation
  if(menu){if(SHOP.tab!=='voiture'||SHOP.prev)shopTab('voiture');const eq=equippedCar();if(garageI!==eq&&!GAR.sw)garageShow(eq);try{gVueSeule(false);}catch(e){}} // au menu : TA caisse, sans essai — (2026-10-12, passe qualité) et l'ŒIL éteint : Échap depuis la vue seule laissait #garage caché, MISSIONS devenait un ciel sans aucun bouton
  const deMenu9=gEl.classList.contains('menu')||gEl.classList.contains('missions');
  gEl.classList.toggle('menu',menu);gEl.classList.toggle('missions',mis);garLibre._r=null;
  if(!menu&&deMenu9){try{gVueSeule(false);gGarageReplie();}catch(e){}} // (2026-10-14, Léo) de l'accueil au garage : REPLIÉ (l'inventaire ne s'ouvre plus tout seul)
  document.body.classList.toggle('garMenuH',menu&&!mis); // (2026-09-30, Sacha) au MENU, ses boutons : l'accueil #mHome par-dessus l'atelier (voir « LE MENU = LE GARAGE + LES BOUTONS DE SACHA »)
  if(menu&&!mis&&window.__mHomeSur)try{window.__mHomeSur();}catch(e){}
  if(menu)try{m2Portes();}catch(e){}
  if(mis)try{gmRender();}catch(e){console.warn('missions',e);}
}
