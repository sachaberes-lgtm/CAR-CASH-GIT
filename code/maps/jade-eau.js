/* ===== JADE : L'ARRIVÉE, LA PORTE DU CIEL, LE PONT DU CIEL =====
   (Le début de ce morceau portait les effets de la mer — gouttes, couronnes, sillage, objectif mouillé, son sous l'eau, la peau de l'eau, le ciel d'en dessous. Retirés le 2026-11-12 : plus de mer dans les pics de jade.) */
function jadeChuteRaz(){for(const c of JCH.L){if(c.orig)for(const o of c.orig)o.F.M.set(o.m,o.si*16);if(c.fo)FIN.mats.delete(c.pi);c.t0=0;c.fin=false;c.spl=false;c.orig=null;c.fo=null;}
  if(JADE.col&&JADE.col.mort)JADE.col.mort.clear();JCH.sp.length=0;if(JCH.splash)JCH.splash.count=0;for(const c of JCH.L)c.vu=false;JADE.sig=0;}
/* L'ARRIVÉE : au portail, l'annonce (et le temps), puis — sous le volet — le niveau repart du départ, les montagnes remises debout */
function jadeAnn(){const h=document.documentElement;h.classList.add('jadeAnn');clearTimeout(jadeAnn.t);jadeAnn.t=setTimeout(function(){h.classList.remove('jadeAnn');},3600);}
function jadeFinale(){if(JADE.fini){if(s>L-6)s=L-6;return;}JADE.fini=true;jadeAnn();
  const tps=Math.max(0,(performance.now()-(JADE.t0||performance.now()))/1000),mm=Math.floor(tps/60),ss=Math.floor(tps%60);
  try{slam('ARRIVÉE',TR(JADE_JEU?JADE_NOM:'PICS DE JADE')+' · '+mm+':'+(ss<10?'0':'')+ss,null,null,null,3,true);}catch(e){}shake=Math.max(shake,.25);
  setTimeout(function(){if(!started||gameOver||mode==='boom')return;try{ecranWipe(jadeRedemarre);}catch(e){jadeRedemarre();}},2800);}
function jadeRedemarre(){if(!started||gameOver||mode==='boom')return; // (2026-10-12, passe qualité) JOUER lance le SOLEIL DE JADE : une caisse qui EXPLOSE (ou une partie finie) dans les 2,8 s après l'ARRIVÉE était remise en 'drive' au départ — ressuscitée sous l'écran de fin
  s=0;lat=0;psi=0;prevTvalid=false;mode='drive';vA=0;jadeChuteRaz();JADE.fini=false;JADE.t0=performance.now();} // (v17, « enlève les intros ») plus de « DÉPART » : on repart, c'est tout
/* une GRILLE posée dans un repère (o : coin, axes x = b, y = haut, z = −t ; en cubes de VX) — la muraille, l'arche */
function jadeRepere(o,b,t,sc){const m=new THREE.Matrix4(),z=t.clone().negate(),k=sc||VXG;
  m.set(b.x*k,0,z.x*k,o.x, b.y*k,k,z.y*k,o.y, b.z*k,0,z.z*k,o.z, 0,0,0,1);return m;}
function jadeMonument(root,g,Mr,jx,M9){ // un monument en verre de jade : ses trois passes (lumière, absorption, profondeur) — rend les trois maillages
  if(!(g.attributes.aJ&&g.attributes.aJ.array[0]===jx)){const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=jx;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));} /* (B2) le maillage gardé a déjà son aJ */
  /* (v17, « ça bugue énormément ») MESURÉ : la porte du ciel (519 k triangles × 3 passes) était dessinée À CHAQUE IMAGE, de n'importe où dans
     le niveau (frustumCulled faux). Désormais chaque monument vit dans un groupe éteint au-delà de la brume, et le champ le trie. */
  if(!g.boundingSphere)g.computeBoundingSphere();const gr=new THREE.Group();gr.matrixAutoUpdate=false;root.add(gr);
  const L9=[];for(const k of ([[M9.vrM,3],[M9.vrXM,2],[M9.vrPM,2.5]])){const m=new THREE.Mesh(g,k[0]);m.matrixAutoUpdate=false;m.matrix.copy(Mr);m.matrixWorldNeedsUpdate=true;m.renderOrder=k[1];m.frustumCulled=true;if(!L9.length)m.userData.jeter=true;gr.add(m);L9.push(m);}
  const c=g.boundingSphere.center.clone().applyMatrix4(Mr);(JADE.monu||(JADE.monu=[])).push({g:gr,c:c,r:g.boundingSphere.radius*Mr.getMaxScaleOnAxis(),L:L9,loin:false});
  return L9;}
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN, ALLÉGÉ — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : la Porte du ciel, seule en
   matière opaque au-delà de 450 m, pesait ~158 000 triangles à CHAQUE image (grille 224×218×34 en cubes de 5 m, maillée avec ses faces
   intérieures — qu'on ne voit qu'à travers le verre, donc jamais en opaque). De loin, elle prend un 4e maillage : la DEMI-grille (voxDemi,
   le niveau de détail des montagnes) SANS faces intérieures, posée à l'échelle ×2 — le sommet (x,y,z) de la demi-grille tombe sur
   o+2·VXG·(x,y,z), là où tombait (2x,2y,2z) de la grille : même endroit, même taille, des cubes de 10 m — ~30 000 triangles (calculé hors
   navigateur sur la même grille : 158 k → 29-31 k). De près (< 450 m) : le verre en trois passes, intact. Bâti UNE fois, dans la chauffe du
   niveau (jadeChauffeNiveau, l'image déjà sacrifiée 120 ms après newTrack) — jamais au palier RÉCENT, jamais en course ; tant qu'il n'est
   pas bâti, le maillage plein reste (comme avant). 1 = allégé, 0 = comme avant. */
PAL.B.jadeMonuLoin=[1,1,0];
/* (2026-10-14, passe perf mobile) LE VERRE DU MONUMENT, DE TOUT PRÈS SEULEMENT — paliers ANCIEN et MOYEN. MESURÉ (iPhone 7 émulé) : à 1 250 m du
   centre de la Porte du ciel la scène prenait +729 000 triangles d'un coup (469 k → 1 198 k) : la bascule comparait « distance au CENTRE −
   RAYON de la sphère » à 450 m, et la sphère de la Porte (1 120 × 1 090 × 170 m) a ~790 m de rayon — le verre en trois passes (3 × 158 k)
   s'allumait donc à 1 240 m, et restait allumé ~1 240 m après (la sphère coupe toujours le champ) : ~30 s à 300 km/h. Deux leviers, par palier :
   · jadePorteVerre : le seuil (m) à la place du 450 en dur, pour tous les monuments ;
   · pour la Porte allégée (celle qui a son maillage de loin, o.dP), la distance est celle de sa FAÇADE le long de la route (|u| − D/2, la
     route la traverse droit), et passé 30 m derrière sa face arrière elle est tout entière dans le dos de la caméra : opaque allégée aussitôt.
   Reste en verre plein : 150 m (300 m) avant la façade + les 170 m de l'arche + 30 m ≈ 350 m (500 m), soit ~4 s (~6 s) à 300 km/h.
   Palier RÉCENT : 450 m sur la sphère, comme avant (o.dP n'y existe pas). */
PAL.B.jadePorteVerre=[150,300,450];JADE_LOD.mv=PAL.b('jadePorteVerre',450);
/* (2026-10-14, passe perf mobile) LE MONUMENT DE LOIN EN TRANCHES. MESURÉ (node, Mac) : voxDemi ~17 ms + voxMesh ~18 ms d'un seul bloc dans
   la chauffe, soit ~150 ms figés sur iPhone 7 — au ras du voile du portail (~280 ms). voxDemiG et voxMeshG sont déjà des GÉNÉRATEURS à
   échéance (JF.lim, état tout local) : jadeMonuLoin ne fait plus que préparer la file (o.loIt), jadeTick en mène UNE tranche par image
   (jadeMonuLoinPas, budget jadeMonuLoinMs), JF.lim posé le temps de la tranche puis rendu. Même maillage au bit près (banc node : un trait
   contre des tranches forcées à chaque échéance). Tant que ce n'est pas fini, le maillage plein reste (o.lo absent : jadeTick ne bascule pas).
   Carte rangée (JADE_GARDE) : la file attend (jadeTick ne voit que la carte en place) et reprend avec elle ; carte jetée : jadeJette ferme la
   file (le finally de voxMeshG rend VOXM). Cible ~40 tranches ≈ 1,3 s sur iPhone 7 au lieu d'un bloc de ~150 ms. dbgMonuLoin() : l'état. */
PAL.B.jadeMonuLoinMs=[4,3,3];
function* jadeMonuLoinG(G){const H=yield* voxDemiG(G);return yield* voxMeshG(H);} // = voxMesh(voxDemi(G)), en tranches
function jadeMonuLoin(o){if(!o||!o.dG||o.lo||!o.L||o.loIt)return;const G=o.dG;o.dG=null; // (une seule tentative : une exception laisse le maillage plein)
  o.loIt=jadeMonuLoinG(G);o.loS={t0:performance.now(),ms:0,n:0,mur:0,err:null};}
function jadeMonuLoinPas(o){const it=o.loIt,S=o.loS,t=performance.now(),l0=JF.lim;let r;
  JF.lim=t+PAL.b('jadeMonuLoinMs',3);
  try{r=it.next();}catch(e){o.loIt=null;S.err=String(e);console.warn('monument de loin',e);return;}finally{JF.lim=l0;S.ms+=performance.now()-t;S.n++;}
  if(!r.done)return;o.loIt=null;S.mur=performance.now()-S.t0;
  try{jadeMonuLoinPose(o,r.value);}catch(e){S.err=String(e);console.warn('monument de loin',e);}}
window.dbgMonuLoin=function(){return (JADE.monu||[]).filter(function(o){return o.loS||o.dG;}).map(function(o){const S=o.loS||{};
  return {etat:o.lo?'pret':o.loIt?'tranche '+S.n:S.err?'erreur':S.n?'vide':'en attente',tranches:S.n||0,msTravail:+(S.ms||0).toFixed(1),msMur:Math.round(S.mur||0),tri:o.loTri||0,loin:!!o.loin,err:S.err||null};});};
function jadeMonuLoinPose(o,g){
  if(!g.index||!g.index.count)return;
  if(!(g.attributes.aJ&&g.attributes.aJ.array[0]===o.dJ)){const aJ=new Float32Array(g.attributes.position.count*4);for(let k=0;k<aJ.length;k+=4){aJ[k]=o.dJ;aJ[k+1]=1;}g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));}
  if(o.dP&&JADE_PORTE_C.G&&o.dP.G===JADE_PORTE_C.G)JADE_PORTE_C.gLoin=g; /* (B2) le monument de loin est gardé avec la porte */
  const m=new THREE.Mesh(g,jadeMats().vrOM);m.matrixAutoUpdate=false;m.matrix.copy(o.dM);m.matrixWorldNeedsUpdate=true;m.renderOrder=0;m.frustumCulled=true;m.userData.jeter=true;
  m.visible=!!o.loin;if(o.loin)o.L[0].visible=false;o.g.add(m);o.lo=m;o.loTri=g.index.count/3;}
function jadeDansGrille(R,p){const dx=p.x-R.o.x,dy=p.y-R.o.y,dz=p.z-R.o.z; // un point du monde est-il dans un cube de cette grille ?
  return voxAt(R.G,Math.floor((dx*R.b.x+dz*R.b.z)/VXG),Math.floor(dy/VXG),Math.floor(-(dx*R.t.x+dz*R.t.z)/VXG))>0;}
/* LA PORTE DU CIEL — un massif FLOTTANT en cubes, percé d'une arche (176 m) : faces bosselées, crête en pitons, un DESSOUS en pointes
   d'escalier d'où pendent des lianes ; rouille, herbe, touffes ; rogné si la route repasse derrière ; des montagnes soudées à ses faces. */
/* (2026-11-05, passe perf mobile 2, B2) LA PORTE GARDÉE d'une visite à l'autre. MESURÉ : la muraille (grille + voxMeshG + colMeshG) est le plus gros
   poste de la jade, et elle était refaite à chaque visite (jadeOublie libère la carte dès qu'on joue une autre map). Même vallée (`jadeCle` : même
   graine, même ruban, mêmes réglages) = même grille et mêmes maillages au bit près : on les GARDE (côté processeur seulement : la carte graphique
   les rend déjà à jadeRendGPU/jadeJette) et la visite d'après les repose sans les recalculer. Le hasard `jr` doit tomber dans le même ordre : on
   compte les tirages de la muraille et on les rejoue (nJr) — les montagnes, le pont et les rochers sont donc exactement les mêmes.
   `?jadegarde=0` : la porte est refaite à chaque fois, comme avant. Une seule entrée (la dernière vallée vue). */
const JADE_PORTE_GARDE_ON=!/[?&]jadegarde=0\b/.test(location.search);
const JADE_PORTE_C={cle:null,fin:false,nJr:0,G:null,o:null,P:null,gs:null,gLoin:null,reprises:0,ms:0};
function jadePorteOublie(){JADE_PORTE_C.cle=null;JADE_PORTE_C.G=JADE_PORTE_C.o=JADE_PORTE_C.P=JADE_PORTE_C.gs=JADE_PORTE_C.gLoin=null;}
/* (2026-11-05, passe perf mobile 2, B2) LES TRANCHES DE LA PORTE : l'attribut aJ d'un monument (4 flottants par sommet, ~1 M de sommets pour la muraille) se remplissait d'un coup dans jadeMonument ; ici il est rempli par tranches (rendez-vous JF.lim), jadeMonument le trouve fait. Même valeurs, même ordre : le maillage ne change pas. */
function* jadeAJG(g,jx){if(g.attributes.aJ&&g.attributes.aJ.array[0]===jx)return;const n=g.attributes.position.count,aJ=new Float32Array(n*4);
  for(let k=0;k<n;k++){aJ[k*4]=jx;aJ[k*4+1]=1;if((k&16383)===16383&&performance.now()>JF.lim)yield;}
  g.setAttribute('aJ',new THREE.BufferAttribute(aJ,4));}
function* jadePorte(root,i0,jr,M9,pose,cle9){ // (LE PRÉ-BÂTI) un générateur : ses cubes (voxMeshG, colMeshG) rendent la main à l'échéance JF.lim
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),D=110; /* (2026-11-06, Léo : « la montagne de Jade fait bugger, pas une énorme forêt : une colline beaucoup plus petite avec des arbustes, comme en Thaïlande (Koh Phi Phi, Koh Lanta) ») la porte devient un îlot KARSTIQUE : 230 m de chaque côté (avant 560), 110 m d'épaisseur (170), 270 m de haut (520), arche de 124 m × 150 m (176 × 215) — environ le tiers des cubes */
  let wG=230,wD=230;
  for(let i=0;i<NP;i+=4){if(Math.abs(i-i0)<Math.round(420/(L/(NP-1))))continue;const q=pts[i],dx=q.x-p.x,dz=q.z-p.z,u=dx*t.x+dz*t.z,v=dx*b.x+dz*b.z;
    if(Math.abs(u)>D/2+ROAD_HALF+40)continue;if(v>0)wD=Math.min(wD,v-ROAD_HALF-50);else wG=Math.min(wG,-v-ROAD_HALF-50);}
  if(wG<130||wD<130)return;
  wG=Math.floor(wG/VXG)*VXG;wD=Math.floor(wD/VXG)*VXG;
  const y0=p.y,hb=-55,ht=150,hw=62,top=270,W=wG+wD,ab=ht-hw*.9;
  const ph=[jr()*6.28,jr()*6.28,jr()*6.28],crete=f=>{const cr=Math.sin(Math.max(0,Math.min(1,f))*Math.PI);return top*(.62+.38*Math.sqrt(cr))-(1-cr)*90+
      70*Math.pow(Math.abs(Math.sin(f*5.1+ph[0])),2.5)+35*Math.sin(f*13.7+ph[1])+18*Math.sin(f*31.+ph[2]);};
  const vn=rocNoise2(jr()*100),vb=rocNoise2(jr()*100);
  const cle0=JADE_PORTE_GARDE_ON&&cle9?cle9+'|'+(FIN.on?1:0)+'|'+i0+'|'+wG+'|'+wD:null,tG0=performance.now(),jr1=jr;let nJ=0;jr=function(){nJ++;return jr1();}; /* (B2) le compte des tirages de la muraille */
  const hit=cle0&&JADE_PORTE_C.cle===cle0&&JADE_PORTE_C.gs;
  let G,o;
  if(hit){const C=JADE_PORTE_C;for(let k=0;k<C.nJr;k++)jr1();G=C.G;o=C.o.clone();const P0=C.P;
    JADE.porte={c:P0.c.clone(),t:P0.t,b:P0.b,D:P0.D,hw:P0.hw,hb:P0.hb,ht:P0.ht,G:G,o:o,i:P0.i,tri:P0.tri,triF:P0.triF};
    if(C.fin){const gs=C.gs;jadeMonument(root,gs.gA,jadeRepere(o,b,t),.37,M9);JADE.porte.mL=jadeMonument(root,gs.gB,jadeRepere(gs.oB,b,t),.37,M9);JADE.porte.mF=jadeMonument(root,gs.gF,jadeRepere(gs.oF,b,t,VXG/gs.K),.37,M9);
      for(const m of JADE.porte.mF)m.visible=false;JADE.porte.pres=false;JADE.porte.tT={garde:1};}
    else{jadeMonument(root,C.gs.g,jadeRepere(o,b,t),.37,M9);
      if(PAL.b('jadeMonuLoin',0)){const e9=JADE.monu[JADE.monu.length-1];e9.dG=G;e9.dM=jadeRepere(o,b,t,VXG*2);e9.dJ=.37;e9.dP=JADE.porte;if(C.gLoin){e9.dG=null;jadeMonuLoinPose(e9,C.gLoin);}}}
    C.reprises++;C.ms=Math.round(performance.now()-tG0);}
  else{const nJ0=nJ;
  const oy=Math.floor((y0-440)/VXG)*VXG,nx=Math.round(W/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+top+130-oy)/VXG);G=voxG(nx,ny,nz);
  const cretes=new Float32Array(nx);for(let x=0;x<nx;x++)cretes[x]=crete((x+.5)/nx)+(jr()-.5)*10+(vn(x*VXG/5*.9,7.7)>.52?6+9*vn(x*VXG/5*.4,2.2):0); /* (2026-11-06) les ARBUSTES : des boules de verdure sur la crête (la tête de la colline, comme les îlots de Thaïlande) */
  const basT=new Float32Array(nx*nz);for(let x=0;x<nx;x++){const v=-wG+(x+.5)*VXG,xn=(v-(wD-wG)/2)/(W/2);for(let z=0;z<nz;z++)basT[x*nz+z]=-300+180*xn*xn+90*(vb(x*VXG/5*.09,z*VXG/5*.12)-.5);} // le DESSOUS, en pointes : le massif flotte
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const v=-wG+(x+.5)*VXG;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr>cretes[x])break;
      if(Math.abs(v)<hw&&yr>hb&&(yr<ab||(v/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=x*VXG/5,ys=y*VXG/5,kz=5/VXG,z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3)*kz),z1=nz-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3)*kz); // les faces BOSSELÉES (en mètres) + (v7) une rugosité fine : la façade se lit en petits cubes, comme les montagnes
      for(let z=z0;z<z1;z++)if(yr>=basT[x*nz+z])G.d[x+nx*(z+nz*y)]=JM.roche;}}
  for(let x=0;x<nx;x++){if(performance.now()>JF.lim)yield;const ru=vn(x*VXG/5*.3,3.3)>.83;
    for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;const yr=oy+(y+.5)*VXG-y0;
      if(!voxAt(G,x,y+1,z)&&yr>-60){G.d[k0]=vn(x*VXG/5*.9,7.7)>.52?JM.feuille:JM.herbe;continue;}
      if(ru&&(!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&jr()<.9)G.d[k0]=JM.rouille;}}
  o=p.clone().addScaledVector(b,-wG).addScaledVector(t,D/2);o.y=oy;
  JADE.porte={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,hw:hw,hb:y0+hb,ht:y0+ht,G:G,o:o,i:i0,tri:0};
  // (v8) LES CUBES MINUSCULES de la porte : la RÉGION que la route traverse (l'arche ± 110 m, de 140 m sous la route à 360 m au-dessus) devient
  // FANTÔME dans la muraille (ni faces ni trou, voxMesh) ; elle a deux habits : de LOIN ses cubes de 2,5 m (une petite grille découpée autour
  // d'elle), de PRÈS (< 780 m) ses colonnes fines (colMesh, les marches avec la muraille posées des deux côtés). Les chocs lisent toujours G.
  let PG9=null;let fin9=false;const T0=performance.now(),TT=JADE.tPorte={};
  if(FIN.on){try{const K=FIN.k,RW=hw+110,xa=Math.max(0,Math.floor((wG-RW)/VXG)),xb=Math.min(nx,Math.ceil((wG+RW)/VXG)),ya=Math.max(0,Math.floor((y0-140-oy)/VXG)),yb=Math.min(ny,Math.ceil((y0+360-oy)/VXG));
    const Gc={nx:nx,ny:ny,nz:nz,d:G.d.slice()};for(let y=ya;y<yb;y++){if(performance.now()>JF.lim)yield;for(let z=0;z<nz;z++)for(let x=xa;x<xb;x++){const k=x+nx*(z+nz*y);if(Gc.d[k])Gc.d[k]=255;}}
    TT.ghost=Math.round(performance.now()-T0);const gA=yield* voxMeshG(Gc,4);TT.A=Math.round(performance.now()-T0);
    const x0=Math.max(0,Math.floor((xa-1)/4)*4),y09=Math.max(0,Math.floor((ya-1)/4)*4),x1=Math.min(nx,xb+1),y1=Math.min(ny,yb+1),Gb=voxG(x1-x0,y1-y09,nz); // la région seule, en 2,5 m (de loin)
    for(let y=y09;y<y1;y++){if(performance.now()>JF.lim)yield;for(let z=0;z<nz;z++)for(let x=x0;x<x1;x++){const m9=G.d[x+nx*(z+nz*y)];if(!m9)continue;Gb.d[(x-x0)+Gb.nx*(z+nz*(y-y09))]=(x>=xa&&x<xb&&y>=ya&&y<yb)?m9:255;}}
    const gB=yield* voxMeshG(Gb,4);TT.B=Math.round(performance.now()-T0);const oB=o.clone().addScaledVector(b,x0*VXG);oB.y+=y09*VXG;
    const NU=(xb-xa)*K,NV=(yb-ya)*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),kz=5/VXG;
    for(let v=0;v<NV;v++){if(performance.now()>JF.lim)yield;for(let u=0;u<NU;u++){const x=(xa*K+u+.5)/K,y=(ya*K+v+.5)/K,vv=-wG+x*VXG,yr=oy+y*VXG-y0;
      const xi=Math.min(nx-1,Math.max(0,Math.floor(x-.5))),fx=Math.min(1,Math.max(0,x-.5-xi)),cr=cretes[xi]*(1-fx)+cretes[Math.min(nx-1,xi+1)]*fx;if(yr>=cr)continue;
      if(Math.abs(vv)<hw&&yr>hb&&(yr<ab||(vv/hw)**2+((yr-ab)/(hw*.9))**2<1))continue; // L'ARCHE
      const xs=(x-.5)*VXG/5,ys=(y-.5)*VXG/5;
      const z0=Math.floor((vn(xs*.14,ys*.11)*3.6+vn(xs*.05+9,ys*.04)*2.4+vn(xs*.7+3,ys*.45)*1.3+.5*vn(xs*2.3+7,ys*1.8+2))*kz*K),
            z1=nz*K-Math.floor((vn(xs*.14+40,ys*.11+7)*3.6+vn(xs*.05+19,ys*.04+3)*2.4+vn(xs*.7+23,ys*.45+5)*1.3+.5*vn(xs*2.3+17,ys*1.8+9))*kz*K);
      if(z1>z0){LO[u+NU*v]=z0;HI[u+NU*v]=z1;}}}
    TT.cols=Math.round(performance.now()-T0);const cache=new Map(),nb=(u,v)=>{const cx=Math.floor((xa*K+u)/K),cy=Math.floor((ya*K+v)/K);if(cx<0||cy<0||cx>=nx||cy>=ny)return null;const kk=cx*4096+cy;
      if(!cache.has(kk)){let z0=-1,z1=-1;for(let z=0;z<nz;z++)if(G.d[cx+nx*(z+nz*cy)]){if(z0<0)z0=z;z1=z;}cache.set(kk,z0<0?null:[z0*K,(z1+1)*K]);}return cache.get(kk);};
    const mat=(kind,u,v,sg)=>{if(kind==='w')return vn((xa*K+u)/K*VXG/5*.3,3.3)>.83?JM.rouille:1;if(kind==='v'&&sg>0)return oy+(ya*K+v+1)/K*VXG-y0>-60?(vn((xa*K+u)/K*VXG/5*.9,7.7)>.52?JM.feuille:JM.herbe):1;return 1;};
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,1,2],mat,nb,12);TT.F=Math.round(performance.now()-T0);const oF=o.clone().addScaledVector(b,xa*VXG);oF.y+=ya*VXG;
    yield* jadeAJG(gA,.37);if(performance.now()>JF.lim)yield;jadeMonument(root,gA,jadeRepere(o,b,t),.37,M9);yield* jadeAJG(gB,.37);if(performance.now()>JF.lim)yield;JADE.porte.mL=jadeMonument(root,gB,jadeRepere(oB,b,t),.37,M9);yield* jadeAJG(gF,.37);if(performance.now()>JF.lim)yield;JADE.porte.mF=jadeMonument(root,gF,jadeRepere(oF,b,t,VXG/K),.37,M9);
    for(const m of JADE.porte.mF)m.visible=false;JADE.porte.pres=false;JADE.porte.tri=gA.index.count/3+gB.index.count/3;JADE.porte.triF=gF.index.count/3;fin9=true;PG9={gA:gA,gB:gB,gF:gF,oB:oB,oF:oF,K:K};}catch(e){console.warn('porte fine',e);}}
  if(!fin9){const g=yield* voxMeshG(G,4);yield* jadeAJG(g,.37);if(performance.now()>JF.lim)yield;jadeMonument(root,g,jadeRepere(o,b,t),.37,M9);JADE.porte.tri=g.index.count/3;
    if(PAL.b('jadeMonuLoin',0)){const e9=JADE.monu[JADE.monu.length-1];e9.dG=G;e9.dM=jadeRepere(o,b,t,VXG*2);e9.dJ=.37;e9.dP=JADE.porte;}} // (2026-10-14, passe perf mobile) de loin : la demi-grille posée ×2 (voir jadeMonuLoin)
    if(cle0&&JADE.porte){const C=JADE_PORTE_C;C.cle=cle0;C.fin=fin9;C.nJr=nJ-nJ0;C.G=G;C.o=o.clone();C.P=JADE.porte;C.gLoin=null;
      C.gs=fin9?Object.assign({},PG9):{g:JADE.monu[JADE.monu.length-1].L[0].geometry};}} /* (B2) la muraille est gardée (le prochain jadePorte de la même vallée la repose) */
  if(pose){for(const sg of [-1,1]){const W9=sg<0?wG:wD;
      for(const fa of [-1,1])pose(p.x+b.x*sg*(hw+62)+t.x*fa*(D*.5-18),p.z+b.z*sg*(hw+62)+t.z*fa*(D*.5-18),40,y0+crete(.5+sg*(hw+62)/W)+40+jr()*80);
      for(let v=hw+140;v<W9-40;v+=75+jr()*60)for(const fa of [-1,1])if(jr()<.7){const r=24+jr()*26,f9=(v*sg+wG)/W;
        pose(p.x+b.x*sg*v+t.x*fa*(D*.5-r*.3),p.z+b.z*sg*v+t.z*fa*(D*.5-r*.3),r,y0+crete(f9)-60+jr()*170);}}}
}
/* LE PONT DU CIEL — deux montagnes flottantes en cubes, une arche de cubes qui les relie (72-150 m au-dessus de la route), herbe,
   touffes et pins peints dessus, lianes dessous. */
function* jadePont(root,i0,jr,M9,pose,ARB){ // (LE PRÉ-BÂTI) un générateur (voir jadePorte)
  const p=pts[i0],t=new THREE.Vector3(T[i0].x,0,T[i0].z).normalize(),b=new THREE.Vector3(-t.z,0,t.x),y0=p.y;
  const ec=ROAD_HALF+66,G9=JADE.geos,tp=jadeTplDe(40),Tp=G9.p[tp];
  /* (2026-10-31, Sacha : « l'arche grise sur une moitié ») ses deux piliers sont loin l'un de l'autre (2×ec) : sans le 10e champ ci-dessous,
     ils tombent dans deux quartiers différents et peuvent recevoir chacun leur propre niveau de détail — l'un fin, l'autre grossier (gris)
     au même instant. Un même repère ('pont'+i0) force jadeBatit à les mettre dans UN SEUL quartier : même boîte, même détail. */
  const qPont='pont'+i0;
  /* (2026-11-12, JADE QUI SECOUE) LA RÈGLE D'OR DES PILIERS : ils étaient posés sans regarder le reste de la route. Mesuré au banc (graine 28) : après un colimaçon, la route tourne et repasse
     à 30 m d'un pilier de 440 m de haut — un mur sur la route. Une autre portion de la route (à plus de 420 m du Pont) dans la colonne du pilier : sous l'arche, le pilier est REHAUSSÉ
     (son pied 20 m au-dessus d'elle : il tient toujours l'arche) ; au-dessus ou dedans, il n'est pas posé (JADE.pontSaute). */
  const ds9=L/(NP-1),loin9=Math.round(420/ds9),rmP=Tp.rmax*VX,HsP=Tp.yTop*VX;
  { /* L'ARCHE AUSSI : une autre portion de la route dans son volume (le long de la route ± 33 m + la demi-largeur, en travers jusqu'aux piliers, de 40 à 200 m au-dessus) — graine 28 sans mer :
       l'approche d'un colimaçon passait dans l'arche. Pas de Pont dans cette vallée (sa droite reste). */
    const lo9=ROAD_HALF+48,la9=ec+12+ROAD_HALF+10;
    for(let i=0;i<NP;i+=4){if(Math.abs(i-i0)<loin9)continue;const q=pts[i],dx=q.x-p.x,dz=q.z-p.z,u=dx*t.x+dz*t.z,v=dx*b.x+dz*b.z;
      if(Math.abs(u)<lo9&&Math.abs(v)<la9&&q.y>y0+40-15&&q.y<y0+200){JADE.pontSaute=(JADE.pontSaute||0)+10;return;}}}
  const autres=function(cx,cz,y0b,y1b){let lo=1e9,hi=-1e9;const c9=rmP+ROAD_HALF+12;for(let i=0;i<NP;i+=4){if(Math.abs(i-i0)<loin9)continue;const q=pts[i];if(q.y<y0b-15||q.y>y1b+15)continue;if(Math.hypot(q.x-cx,q.z-cz)<c9){lo=Math.min(lo,q.y);hi=Math.max(hi,q.y);}}return hi>-1e9?[lo,hi]:null;};
  for(const sg of [-1,1]){const cx=Math.round((p.x+b.x*sg*ec)/VX)*VX,cz=Math.round((p.z+b.z*sg*ec)/VX)*VX;let yt=Math.floor((y0+205+(sg>0?24:0))/VX)*VX;
    const g9=autres(cx,cz,yt-HsP,yt);
    if(g9){const y2=Math.ceil((g9[1]+20+HsP)/VX)*VX;if(g9[1]<y0+60&&!autres(cx,cz,y2-HsP,y2))yt=y2;else{JADE.pontSaute=(JADE.pontSaute||0)+1;continue;}}
    pose([cx,cz,rmP,yt-HsP,yt,tp,(jr()*4)|0,jr(),ec,qPont]);}
  const xa=Math.ceil((ec+12)/VXG)*VXG,D=66,PR={b0:72,bC:104,t0:132,tC:150};
  const yB=f=>PR.b0+(PR.bC-PR.b0)*Math.sin(f*Math.PI),yH=f=>PR.t0+(PR.tC-PR.t0)*Math.pow(Math.sin(f*Math.PI),.6);
  const oy=Math.floor((y0+PR.b0-12)/VXG)*VXG,nx=Math.round(2*xa/VXG),nz=Math.round(D/VXG),ny=Math.ceil((y0+PR.tC+20-oy)/VXG),G=voxG(nx,ny,nz);
  for(let x=0;x<nx;x++){const f=(x+.5)/nx,a=yB(f)+(jr()-.5)*5,c=yH(f)+(jr()-.5)*5;
    for(let y=0;y<ny;y++){const yr=oy+(y+.5)*VXG-y0;if(yr<a||yr>c)continue;for(let z=0;z<nz;z++){if((z===0||z===nz-1)&&jr()<.3)continue;G.d[x+nx*(z+nz*y)]=JM.roche;}}}
  const tops=[];
  for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){const k0=x+nx*(z+nz*y);if(G.d[k0]!==JM.roche)continue;
    if(!voxAt(G,x,y+1,z)){G.d[k0]=JM.herbe;tops.push([x,y,z]);}
    else if((!voxAt(G,x,y,z-1)||!voxAt(G,x,y,z+1))&&x%7===3&&jr()<.8)G.d[k0]=JM.rouille;}
  const o=p.clone().addScaledVector(b,-xa).addScaledVector(t,D/2);o.y=oy;
  const g=yield* voxMeshG(G,4),Mr=jadeRepere(o,b,t),mL=jadeMonument(root,g,Mr,.81,M9);
  const V3=new THREE.Vector3();
  for(let k=0;k<14&&tops.length;k++){const c=tops[(jr()*tops.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(Mr);const h=9+jr()*9,pin=jr()<.7;ARB.push({x:V3.x,y:V3.y,z:V3.z,j:[h*(pin?.95:1.35),h,pin?(jr()*4)|0:4,jr()]});}
  JADE.pont={c:new THREE.Vector3(p.x,y0,p.z),t:t,b:b,D:D,xa:xa,yB:yB,yH:yH,G:G,o:o,i:i0,tri:g.index.count/3,mL:mL};
  // (v8) LES CUBES MINUSCULES du pont : l'arche entière en colonnes fines (de près, < 650 m)
  if(FIN.on){try{const K=FIN.k,cv=VXG/K,NU=nx*K,NV=nz*K,LO=new Int32Array(NU*NV),HI=new Int32Array(NU*NV),na=rocNoise2(31.7),nc=rocNoise2(77.1);
    const hs=(u,v,s9)=>{const x=Math.sin(u*127.1+v*311.7+s9)*43758.5453;return x-Math.floor(x);};
    for(let u=0;u<NU;u++){const f=(u+.5)/NU,a=yB(f)+5*(na(u*cv*.07,1.3)-.5)*2,c=yH(f)+5*(nc(u*cv*.07,4.1)-.5)*2;
      for(let v=0;v<NV;v++){if((v<2||v>=NV-2)&&hs(u,v,1)<.3)continue;const a9=a+(hs(u,v,2)-.5)*1.2,c9=c+(hs(u,v,3)-.5)*1.2;
        const lo=Math.ceil((a9+y0-oy)/cv-.5),hi=Math.floor((c9+y0-oy)/cv-.5)+1;if(hi>lo){LO[u+NU*v]=lo;HI[u+NU*v]=hi;}}}
    const gF=yield* colMeshG(NU,NV,LO,HI,[0,2,1],function(kind,u,v,sg){return kind==='w'&&sg>0?JM.herbe:1;},null,12);
    JADE.pont.mF=jadeMonument(root,gF,jadeRepere(o,b,t,cv),.81,M9);for(const m of JADE.pont.mF)m.visible=false;JADE.pont.pres=false;JADE.pont.triF=gF.index.count/3;}catch(e){console.warn('pont fin',e);}}
}
