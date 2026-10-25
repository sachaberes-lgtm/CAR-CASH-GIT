/* LA PISTE EN TRANCHES (2026-09-27, passe perf iPhone) — MESURÉ : la piste ENTIÈRE (~9 000 m, un point par mètre) partait au GPU à chaque
   image, ~560 000 triangles sur les ~750 000 de l'image, et aucun tri possible : une seule sphère englobante pour 9 km de ruban, elle est
   TOUJOURS dans le champ. Chaque maillage de la piste est désormais bâti ENTIER comme avant (mêmes sommets, mêmes couleurs, mêmes UV, mêmes
   trous, normales calculées sur l'ensemble — donc identiques aux coutures), puis DÉCOUPÉ en tranches de `PISTE_CH` points : chaque tranche
   a sa sphère, et le tri par champ de vision de three jette ce qu'on ne voit pas. Un triangle va à la tranche de son plus petit point ; la
   rangée frontière est DUPLIQUÉE (mêmes flottants des deux côtés : zéro fissure). Les matières restent PARTAGÉES par toutes les tranches.
   `att` : {nom:[Float32Array,taille]} · `idx` : l'index complet · `lay` : la disposition des sommets (blocs de rangées) · `o` : {ombre, ordre, marge}
   (`marge` : les traits néon s'ÉLARGISSENT au loin dans le vertex shader — voir traitMat — la sphère prend de quoi les couvrir).
   AU-DELÀ DU BROUILLARD, UNE TRANCHE MAIGRE (`o.loin`). Passé `scene.fog.far` en PROFONDEUR de vue (c'est elle que lit le fog de three, pas
   la distance), le fog vaut exactement 1 : le bitume et la peinture sortent à la couleur PURE du brouillard — grain, stries, couleurs par
   sommet, reflets n'y comptent plus. Seule la SILHOUETTE reste, et le bitume la garde à l'identique avec ses deux seules colonnes de BORD
   (la dalle est plate en travers : même surface, mêmes rangées — 5 fois moins de triangles). La peinture centrale s'efface (du brouillard
   posé sur du brouillard). MESURÉ (images figées, tri contre témoin) : 0 pixel de différence. ⚠ `PISTE_PAS` (une rangée sur N) maigrirait
   aussi les rails, les flancs et la nappe, mais les cordes déplacent la silhouette lointaine de quelques pixels (20 à 130 px sur 740 000,
   mesuré à 4) : laissé à 1, ces trois-là n'ont pas de tranche maigre.
   `o.loin` : {blocs, pr (sommets par rangée et par bloc), cols (colonnes gardées)} · 0 = rien au loin · absent = pas de LOD.
   Bascule par tranche, à chaque rendu (`pisteLoin`, appelée par scene.onBeforeRender). */
/* (2026-10-24, passe perf, 2e tour) DES TRANCHES DE 1 200 POINTS (600 avant). Chaque tranche visible coûte CINQ appels de dessin (bitume, flancs, rail,
   lueur additive, ligne) : 9 à 15 tranches visibles = 45 à 75 appels pour la seule route, sur 160-220. MESURÉ (banc processeur ×4, mêmes pistes
   `pistegraine=777`, 4 relevés par map) : rendu de la scène crypto 14,5 → 10,4 ms, forêt 20,2 → 9,8, nuages 16,3 → 10,8, jade 12,8 → 9,9, ville 8,3 → 7,7 ;
   la boucle forêt 66 → 39 ms, nuages 71 → 49. L'image ne change pas (le découpage ne sert qu'au tri par le champ de vision). `?tranche=600` = avant. */
const PISTE_CH=Math.max(100,+((/[?&]tranche=(\d+)/.exec(location.search)||[])[1])||1200),PISTE_PAS=1,PISTE_LOD=[]; // `?tranche=n` : la taille des tranches (banc)
const TEINTE9={c:null,n:0}; // (chasse aux gels) la teinte du bitume par (point, colonne) — ne dépend pas de la piste : voir buildTrack
function sphere9(g){ // (2026-09-28, chasse aux gels) computeBoundingSphere de three r128 recopié sur le tableau brut (même boîte, même centre
  // (min+max)×0,5, même plus grand carré de distance par Math.max, même racine) : mêmes flottants, sans Vector3 ni getX par sommet
  const a=g.attributes.position.array,n=a.length;let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
  for(let k=0;k<n;k+=3){const x=a[k],y=a[k+1],z=a[k+2];if(x<x0)x0=x;if(y<y0)y0=y;if(z<z0)z0=z;if(x>x1)x1=x;if(y>y1)y1=y;if(z>z1)z1=z;}
  const S=g.boundingSphere||(g.boundingSphere=new THREE.Sphere()),c=S.center;
  if(x1<x0||y1<y0||z1<z0)c.set(0,0,0);else c.set((x0+x1)*.5,(y0+y1)*.5,(z0+z1)*.5);
  const cx=c.x,cy=c.y,cz=c.z;let m=0;
  for(let k=0;k<n;k+=3){const dx=cx-a[k],dy=cy-a[k+1],dz=cz-a[k+2];m=Math.max(m,dx*dx+dy*dy+dz*dz);}
  S.radius=Math.sqrt(m);
}
function pisteMaigre(att,c,lz,pas9){ // la tranche lointaine : mêmes attributs, une rangée sur PISTE_PAS (+ bords de tranche et de trou), colonnes choisies
  const P9=lz.pas||1,np9=lz.np||NP,CH9=PISTE_CH/P9,r0=c*CH9,r1=Math.min((c+1)*CH9,np9-1),R=[],pas=pas9||PISTE_PAS; /* (MOBG_RUBANS) lz.pas/lz.np : un ruban à une rangée tous les P9 points (la ligne) ; absents = comme avant (pas 1, NP rangées) */
  for(let r=r0;r<r1;r+=pas)R.push(r);R.push(r1);
  if(pas>1&&TROU)for(let r=r0+1;r<r1;r++)if(TROU[r*P9]!==TROU[(r-1)*P9]&&r%pas)R.push(r); // (la tranche MOYENNE) chaque bord de trou est une rangée : un quad ne chevauche jamais un trou
  R.sort((a,b)=>a-b);
  const nb=lz.blocs,pr=lz.pr,cols=lz.cols,nc=cols.length,nR=R.length,nv=nb*nR*nc,g=new THREE.BufferGeometry(),ix=[];
  for(const nm in att){const A=att[nm][0],sz=att[nm][1],B9=new Float32Array(nv*sz);let w=0;
    for(let b=0;b<nb;b++)for(let k=0;k<nR;k++)for(let j=0;j<nc;j++){const s0=((b*np9+R[k])*pr+cols[j])*sz;for(let q=0;q<sz;q++)B9[w++]=A[s0+q];}
    g.setAttribute(nm,new THREE.BufferAttribute(B9,sz));}
  for(let b=0;b<nb;b++){const inv=lz.inv&&lz.inv[b];for(let k=0;k<nR-1;k++){
    if(TROU&&TROU[R[k]*P9])continue; // (LES TROUS) le vide entre deux segments de route : aucun triangle
    for(let j=0;j<nc-1;j++){const a2=(b*nR+k)*nc+j,b2=a2+1,c2=a2+nc,d2=c2+1;if(inv)ix.push(a2,b2,c2,b2,d2,c2);else ix.push(a2,c2,b2,b2,c2,d2);}}} // `inv` : le bloc retourné (voir BITUME)
  if(!ix.length)return null;
  g.setIndex(ix);sphere9(g);return g;
}
/* ===== LA TRANCHE MOYENNE (2026-10-24, passe perf iPhone — Sacha : « après quelques maps passées on arrive presque à 1 image/seconde ») =====
   MESURÉ (banc Chrome, triangles DESSINÉS par image) : la route seule fait 274 000 à 528 000 triangles selon la map, 50 à 70 % de l'image, et elle gonfle
   avec le niveau (72 000 → 400 000 entre la 1re et la 11e map) ; sur l'iPhone 13 Pro la course tombe de 60 à 7 i/s au niveau 9 (1,0-1,3 M de triangles).
   Le bitume a 11 colonnes × une rangée PAR MÈTRE ; une tranche (1 200 m) n'était maigre que TOUTE au-delà du brouillard — or le brouillard est à 2 à 9 km :
   quatre à huit tranches entières à l'écran. Sur TÉLÉPHONE, une tranche dont le point le plus proche est à plus de PISTE_MOY_D mètres de profondeur passe
   en MOYENNE : les mêmes 11 colonnes, une rangée sur PISTE_MOY (4 m), les bords de trou gardés — 4 fois moins de triangles de bitume. À 400 m un pas de
   4 m fait moins d'un vingtième de pixel en profondeur, la flèche d'un virage serré (R 110 m) 2 cm : l'image ne bouge pas. Sur l'ordinateur : rien ne
   change (règle d'or). `?pistemoy=0` = avant ; `dbgPiste()` compte les tranches moyennes. */
const PISTE_MOY=(TEL_NATIF&&!/[?&]pistemoy=0\b/.test(location.search))?4:0,PISTE_MOY_D=400;
/* ===== LES RUBANS MOYENS ET LA NAPPE ÉTEINTE (2026-10-25, passe perf mobile A2 : « la route fait 50 à 70 % des triangles ») =====
   MOBG_RUBANS : la tranche MOYENNE (une rangée sur 4 m, bords de trou gardés) vaut aussi pour les FLANCS, les RAILS, la NAPPE de lueur et la LIGNE
   centrale, comme pour le bitume. Mêmes rangées que le bitume : les rubans restent collés à lui ; un point gardé est EXACTEMENT le sommet d'avant
   (mêmes attributs recopiés), seul l'entre-deux devient la corde (flèche 2 cm à 400 m en virage de 110 m, 5 cm à 40 m). La largeur écran des traits
   ne dépend pas des rangées (le vertex shader élargit chaque sommet pour tenir `minPx` pixels). Téléphone seulement (PISTE_MOY=0 ailleurs).
   `?mobg_rubans=0` = avant. MOBG_NAPPE : la nappe de lueur (additive, opacité 0 de plein jour sec sur la ville) n'est pas dessinée quand son opacité
   est sous .001 (sa contribution additive reste sous une demi-teinte 8 bits) ; partout, sans effet visible. `?mobg_nappe=0` = avant. */
const MOBG_RUBANS=!/[?&]mobg_rubans=0\b/.test(location.search),MOBG_NAPPE=!/[?&]mobg_nappe=0\b/.test(location.search);
/* ===== LES DÉCORS INSTANCIÉS ÉCARTÉS AU CHAMP (2026-10-25, passe perf mobile A2 : « écarter par le champ de vision les décors du canyon et des dunes ») =====
   Les arbres, cheminées, buttes, touffes… du canyon et des dunes étaient UN InstancedMesh à `frustumCulled=false` : tous les exemplaires de la
   piste (des centaines) partaient au GPU à chaque image, devant, derrière et hors champ. three r128 ne sait pas écarter un InstancedMesh par
   instance (sa sphère est celle de la géométrie seule). `mobgCoupe` range les exemplaires en cases de MOBG_CASE m (x, z) — un InstancedMesh par
   case, MÊMES géométrie, matière et matrices —, calcule la sphère exacte de la case (sphère de la géométrie passée dans chaque matrice + MOBG_MARGE m
   pour le balancement des shaders), et `mobgChamp(cam)` (avant chaque rendu de la scène, voir portails.js) ne montre que les cases dont la sphère
   touche le champ : les cases visibles sont dessinées EXACTEMENT comme avant (mêmes sommets), celles qu'on écarte étaient hors de l'image. Les décors
   qui bougent (caravanes, tornades, mur de tempête) ne passent pas par là. `?mobg_champ=0` = avant (un seul maillage, jamais écarté). */
const MOBG_CHAMP=!/[?&]mobg_champ=0\b/.test(location.search),MOBG_CASE=1500,MOBG_MARGE=8,MOBG_GRP=[],MOBG_FR=new THREE.Frustum(),MOBG_PM=new THREE.Matrix4(),MOBG_SP=new THREE.Sphere();
function mobgCoupe(im,grp){ /* im : InstancedMesh STATIQUE déjà ajouté à grp, matrices écrites ; rend la liste des mailles (im si rien à couper) */
  if(!MOBG_CHAMP||!im||!im.isInstancedMesh||!grp||im.count<16||im.instanceColor||!im.geometry||im.geometry.isInstancedBufferGeometry)return [im];
  const g=im.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
  const gs=g.boundingSphere,ma=im.instanceMatrix.array,n=im.count,cases=new Map();
  for(let k=0;k<n;k++){const key=Math.floor(ma[k*16+12]/MOBG_CASE)*65536+Math.floor(ma[k*16+14]/MOBG_CASE);let a=cases.get(key);if(!a)cases.set(key,a=[]);a.push(k);}
  const sortie=[];if(MOBG_GRP.indexOf(grp)<0)MOBG_GRP.push(grp);
  const boule=function(mesh,idx){ /* centre = milieu de la boîte des centres ; rayon = le plus loin (centre + rayon de chaque exemplaire) */
    let x0=1e30,y0=1e30,z0=1e30,x1=-1e30,y1=-1e30,z1=-1e30;const cs=new Float32Array(idx.length*4),A=mesh.instanceMatrix.array;
    for(let j=0;j<idx.length;j++){const e=j*16,cx=gs.center.x,cy=gs.center.y,cz=gs.center.z;
      const x=A[e]*cx+A[e+4]*cy+A[e+8]*cz+A[e+12],y=A[e+1]*cx+A[e+5]*cy+A[e+9]*cz+A[e+13],z=A[e+2]*cx+A[e+6]*cy+A[e+10]*cz+A[e+14];
      const sc=Math.sqrt(Math.max(A[e]*A[e]+A[e+1]*A[e+1]+A[e+2]*A[e+2],A[e+4]*A[e+4]+A[e+5]*A[e+5]+A[e+6]*A[e+6],A[e+8]*A[e+8]+A[e+9]*A[e+9]+A[e+10]*A[e+10]));
      cs[j*4]=x;cs[j*4+1]=y;cs[j*4+2]=z;cs[j*4+3]=gs.radius*sc;
      if(x<x0)x0=x;if(y<y0)y0=y;if(z<z0)z0=z;if(x>x1)x1=x;if(y>y1)y1=y;if(z>z1)z1=z;}
    const cx=(x0+x1)*.5,cy=(y0+y1)*.5,cz=(z0+z1)*.5;let R=0;
    for(let j=0;j<idx.length;j++){const d=Math.hypot(cs[j*4]-cx,cs[j*4+1]-cy,cs[j*4+2]-cz)+cs[j*4+3];if(d>R)R=d;}
    mesh.userData.mobgB=[cx,cy,cz,R+MOBG_MARGE];};
  if(cases.size<2){boule(im,{length:n});sortie.push(im);return sortie;}
  grp.remove(im);
  cases.forEach(function(idx){const c=new THREE.InstancedMesh(g,im.material,idx.length);
    for(let j=0;j<idx.length;j++)c.instanceMatrix.array.set(ma.subarray(idx[j]*16,idx[j]*16+16),j*16);
    c.instanceMatrix.needsUpdate=true;c.matrixAutoUpdate=false;c.updateMatrix();c.frustumCulled=false;
    c.name=im.name;c.renderOrder=im.renderOrder;c.castShadow=im.castShadow;c.receiveShadow=im.receiveShadow;c.userData=Object.assign({},im.userData);
    boule(c,idx);grp.add(c);sortie.push(c);});
  return sortie;}
/* ===== LE GLACIER EN TRANCHES COUPABLES AU CHAMP (2026-10-25, passe perf mobile A2 : G1) =====
   Le verglas, la congère et les becs du glacier étaient chacun UN maillage de toute la piste à `frustumCulled=false` (~9 triangles par mètre pour le
   verglas, ~3,5 pour la congère). `mobgTranches` découpe l'INDEX de la géométrie finie en tranches contiguës de `run` indices (multiple de 6 : des quads
   entiers) ; chaque tranche est un Mesh qui PARTAGE les attributs (mêmes sommets, mêmes normales, un seul envoi au GPU), avec sa sphère exacte
   (boîte des sommets qu'elle touche + 2 m) et le culling natif de three : les triangles dessinés au-dessus du champ sont les mêmes qu'avant, seuls
   ceux qui sont hors de l'image ne partent plus. `props(m)` pose nom, matière, ordre. Rend false (rien fait) si `?mobg_champ=0` ou si trop court. */
function mobgTranches(root,g,mat,props,run){
  if(!MOBG_CHAMP||!g.index||g.index.array.length<=run*2||!g.attributes.position)return false;
  const ix=g.index.array,pos=g.attributes.position.array;
  for(let i0=0;i0<ix.length;i0+=run){const sub=ix.slice(i0,Math.min(ix.length,i0+run));
    let x0=1e30,y0=1e30,z0=1e30,x1=-1e30,y1=-1e30,z1=-1e30;
    for(let k=0;k<sub.length;k++){const v=sub[k]*3,x=pos[v],y=pos[v+1],z=pos[v+2];if(x<x0)x0=x;if(y<y0)y0=y;if(z<z0)z0=z;if(x>x1)x1=x;if(y>y1)y1=y;if(z>z1)z1=z;}
    const cx=(x0+x1)*.5,cy=(y0+y1)*.5,cz=(z0+z1)*.5;let R=0;
    for(let k=0;k<sub.length;k++){const v=sub[k]*3,d=Math.hypot(pos[v]-cx,pos[v+1]-cy,pos[v+2]-cz);if(d>R)R=d;}
    const g2=new THREE.BufferGeometry();for(const nm in g.attributes)g2.setAttribute(nm,g.attributes[nm]);
    g2.setIndex(new THREE.BufferAttribute(sub,1));g2.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),R+2);
    const m=new THREE.Mesh(g2,mat);props(m);m.frustumCulled=true;root.add(m);}
  return true;}
function mobgChamp(cam){ /* avant chaque rendu de la scène : les cases hors champ ne sont pas dessinées */
  if(!MOBG_GRP.length)return;
  MOBG_PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);MOBG_FR.setFromProjectionMatrix(MOBG_PM);
  for(let i=0;i<MOBG_GRP.length;i++){const gr=MOBG_GRP[i];if(!gr.visible)continue;const ch=gr.children;
    for(let k=0;k<ch.length;k++){const b=ch[k].userData.mobgB;if(!b)continue;MOBG_SP.center.set(b[0],b[1],b[2]);MOBG_SP.radius=b[3];ch[k].visible=MOBG_FR.intersectsSphere(MOBG_SP);}}}
function pisteLoin(cam){ // chaque tranche : entière de près, moyenne au-delà de PISTE_MOY_D (téléphone), maigre (ou absente) quand elle est TOUTE au-delà du brouillard
  if(!PISTE_LOD.length)return;
  if(PISTE_TEMOIN||PISTE_SANSLOIN){for(const E of PISTE_LOD){E.loin=false;E.et=0;E.nul=false;E.hi.visible=true;if(E.lo)E.lo.visible=false;if(E.mo)E.mo.visible=false;}return;}
  const f=scene.fog,far=f&&f.isFog?f.far:Infinity,e=cam.matrixWorld.elements;
  const il=1/Math.hypot(e[8],e[9],e[10]),fx=-e[8]*il,fy=-e[9]*il,fz=-e[10]*il,px=e[12],py=e[13],pz=e[14];
  for(let i=0;i<PISTE_LOD.length;i++){const E=PISTE_LOD[i],c=E.s.center;
    const p9=(c.x-px)*fx+(c.y-py)*fy+(c.z-pz)*fz-E.s.radius; // la profondeur de vue de son point le plus proche
    const et0=p9-1>=far?2:(E.mo&&!PISTE_SANSMOY&&p9>=PISTE_MOY_D)?1:0; // (1 m de garde au brouillard, comme avant)
    const et=(et0===2&&E.garde)?((E.mo&&!PISTE_SANSMOY)?1:0):et0; // (MOBG_RUBANS) flancs, rails, nappe : jamais cachés par le brouillard (la nappe n'en a pas), seulement allégés
    const nul=E.nap!==null&&E.nap.opacity<.001; // (MOBG_NAPPE) la nappe éteinte ne se dessine pas
    if(et!==E.et||nul!==E.nul){E.et=et;E.nul=nul;E.loin=et===2;E.hi.visible=et===0&&!nul;if(E.lo)E.lo.visible=et===2&&!nul;if(E.mo)E.mo.visible=et===1&&!nul;}}
}
/* `dbgPiste(false)` : le TÉMOIN — tranches toutes entières et jamais triées, tous les plots envoyés, comme avant la passe. Sert à mesurer
   (et à comparer l'image) sur la MÊME image figée ; `dbgPiste(true,false)` : le tri sans les tranches maigres ; `dbgPiste()` rend l'état. */
let PISTE_TEMOIN=false,PISTE_SANSLOIN=false,PISTE_SANSMOY=false; // (banc) dbgPiste(null,null,false) : sans les tranches moyennes, le reste tel quel
window.dbgPiste=function(on,loin,moy){if(loin!=null)PISTE_SANSLOIN=!loin;if(moy!=null)PISTE_SANSMOY=!moy;if(on!=null){PISTE_TEMOIN=!on;for(const m of trackMeshes)if(m.isMesh&&!m.isInstancedMesh&&m.matrixAutoUpdate===false&&m.geometry&&m.geometry.boundingSphere)m.frustumCulled=!PISTE_TEMOIN;}
  let n=0,m=0;for(const E of PISTE_LOD){if(E.loin)n++;else if(E.et===1)m++;}
  return {tri:!PISTE_TEMOIN,tranches:PISTE_LOD.length,auLoin:n,moyennes:m,pasMoyen:PISTE_MOY};};
/* ===== LE BILAN DE LA ROUTE (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit ») =====
   (banc) dbgPisteBilan() mesure la piste courante ; dbgPisteBilan(n) en rebâtit n (newTrack, mêmes map et météo) et rend la moyenne.
   Cap = direction horizontale sur 20 m ; « droit » = rayon > 450 m ; « virage » = un changement de cap ≥ 25° d'un seul sens. */
function pisteBilan1(P,Lm){
  const pp=P||pts,LL=Lm||L,nn=pp.length,st=Math.max(1,Math.round(nn/Math.max(1,LL)*20)),pas=LL/(nn-1);const runs=[];let droit=0,run=0,maxRun=0,vir=0,cumul=0,sens=0,tot=0,serre=0;
  for(let i=st;i<nn-st;i+=st){const a=pp[i-st],b=pp[i],c=pp[i+st];
    const h1=Math.atan2(b.x-a.x,b.z-a.z),h2=Math.atan2(c.x-b.x,c.z-b.z);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
    const ds=pas*st,R=Math.abs(d)>1e-5?ds/Math.abs(d):1e9;tot+=ds;
    if(R>450){droit+=ds;run+=ds;if(run>maxRun)maxRun=run;}else{if(run>=250)runs.push(Math.round((tot-ds-run)/10)*10+'+'+Math.round(run));run=0;if(R<110)serre+=ds;}
    const sg=d>0?1:-1;if(Math.abs(d)>1e-4){if(sg===sens)cumul+=Math.abs(d);else{if(cumul>=25*Math.PI/180)vir++;cumul=Math.abs(d);sens=sg;}}}
  if(cumul>=25*Math.PI/180)vir++;
  const km=LL/1000;return {km:+km.toFixed(2),droit:+(100*droit/tot).toFixed(1),plusLongueDroite:Math.round(maxRun),virages_km:+(vir/km).toFixed(1),serre:+(100*serre/tot).toFixed(1),runs:runs};}
window.dbgGenBilan=function(n,graine0,carte,detail){const cur0=LVL.cur,TAB={nuages:()=>NIVEAUX[0],orage:()=>NIVEAUX[3],ville:()=>NIVEAUX[1],minuit:()=>NIVEAUX[4],espace:()=>NIVEAUX[2],jade:()=>NIV_JADE,foret:()=>NIV_FORET,banquise:()=>NIV_BANQ,canyon:()=>NIV_CANYON,dunes:()=>NIV_DUNES,grotte:()=>NIV_GROTTE,crypto:()=>NIV_CRYPTO,vitre:()=>NIV_VITRE};try{if(carte&&TAB[carte])LVL.cur=TAB[carte]();return dbgGenBilan1(n,graine0,detail);}finally{LVL.cur=cur0;}};
function dbgGenBilan1(n,graine0,detail){ /* la génération SEULE (sans décor ni mailles) : ~ms par piste, pour des centaines de graines. Mêmes générateurs que pisteRoute. */
  const rs=[];for(let k=0;k<(n||20);k++){const seed=((graine0|0)||12345)+k*7919,rnd=mulberry32(seed),c=LVL.cur,pi=c&&c.piste;
    const run=it=>{let r=it.next();while(!r.done)r=it.next();return r.value;};
    let ctrl=pi==='tuto'?genTuto():pi==='paris'?genParis():pi==='jade'?genJade(rnd):pi==='foret'?run(genForet(rnd)):pi==='canyon'?run(genCanyon(rnd)):pi==='dunes'?run(genDunes(rnd)):pi==='banquise'?genBanq(rnd):pi==='grotte'?run(genGrotte(rnd)):genCtrl(rnd,new THREE.Vector3(0,0,0),0);
    if(hautOn()){ctrl=pisteTordPropre(ctrl,seed|0).ctrl;}
    const cv=new THREE.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,ctrl.length*16);const Lm=cv.getLength(),N=Math.max(3000,Math.round(Lm));
    const P=[];for(let d=0;d<=N;d++)P.push(cv.getPointAt(d/N));{const b9=pisteBilan1(P,Lm);if(detail){b9.graine=seed;b9.plan=(pi==='banquise'&&BANQ.plan)?BANQ.plan.join(','):'';b9.marks=MODMARK.map(m=>(m.fig||'m')+'@'+Math.round(m.i0/Math.max(1,ctrl.length)*Lm/10)*10).join(',');}rs.push(b9);}}
  if(detail)return rs;
  const m={};for(const key of Object.keys(rs[0])){if(key==='runs'||key==='plan'||key==='graine')continue;m[key]=+(rs.reduce((a,x)=>a+x[key],0)/rs.length).toFixed(1);}m.n=rs.length;m.pire=Math.max.apply(null,rs.map(x=>x.plusLongueDroite));return m;};
window.dbgPisteBilan=function(n){if(!n)return pisteBilan1();const r=[];for(let k=0;k<n;k++){newTrack();r.push(pisteBilan1());}
  const m={};for(const key of Object.keys(r[0])){m[key]=+(r.reduce((a,x)=>a+x[key],0)/r.length).toFixed(1);}m.n=n;m.pire=Math.max.apply(null,r.map(x=>x.plusLongueDroite));return m;};
function* pisteTranches(att,lay,mat,o){ // lay : {blocs, pr (sommets par rangée), np (rangées par bloc), pas (points de piste par rangée)}
  // (l'index de chaque tranche est écrit DIRECTEMENT, bloc après bloc, rangée après rangée : le même ordre et le même motif de quads
  //  a,c,b · b,c,d que l'index complet d'origine — et zéro remappage, la reconstruction du portail n'a pas à le payer)
  const pr=lay.pr,np=lay.np,nq=pr-1,CHr=PISTE_CH/lay.pas,nC=Math.ceil((np-1)/CHr),noms=Object.keys(att);
  for(let c=0;c<nC;c++){if(c)yield; // (LE PRÉ-BÂTI) une tranche par pas
    const r0=c*CHr,r1=Math.min(np-1,(c+1)*CHr),nr=r1-r0+1,nv=lay.blocs*nr*pr; // segments r0..r1-1, rangées r0..r1 (la frontière est dupliquée)
    const ns=r1-r0;
    const li=nv>65535?new Uint32Array(ns*nq*6*lay.blocs):new Uint16Array(ns*nq*6*lay.blocs);let w=0;
    for(let b=0;b<lay.blocs;b++){const inv=lay.inv&&lay.inv[b];for(let k=r0;k<r1;k++){
      if(TROU&&TROU[k*lay.pas])continue; // (LES TROUS) le vide entre deux segments de route : aucun triangle (le ruban existe d'une ligne de pts à la suivante, sauf là)
      for(let j=0,a2=(b*nr+k-r0)*pr;j<nq;j++,a2++){const c2=a2+pr; // `inv` : le bloc retourné (sens inverse — voir BITUME)
        if(inv){li[w++]=a2;li[w++]=a2+1;li[w++]=c2;li[w++]=a2+1;li[w++]=c2+1;li[w++]=c2;}
        else{li[w++]=a2;li[w++]=c2;li[w++]=a2+1;li[w++]=a2+1;li[w++]=c2;li[w++]=c2+1;}}}}
    if(TROU&&!w)continue; // (LES TROUS) une tranche entièrement au-dessus du vide n'existe pas
    yield; // (2026-10-24) la tranche de 1 200 points en trois pas : l'index, les sommets, la tranche maigre
    const g=new THREE.BufferGeometry();
    for(const nm of noms){const A=att[nm][0],sz=att[nm][1],B9=new Float32Array(nv*sz);
      for(let b=0;b<lay.blocs;b++)B9.set(A.subarray((b*np+r0)*pr*sz,(b*np+r1+1)*pr*sz),b*nr*pr*sz);
      g.setAttribute(nm,new THREE.BufferAttribute(B9,sz));}
    g.setIndex(new THREE.BufferAttribute(w<li.length?li.subarray(0,w):li,1));
    sphere9(g);if(o.marge)g.boundingSphere.radius+=o.marge; // (chasse aux gels) sphere9 = computeBoundingSphere, au flottant près
    const m=new THREE.Mesh(g,mat);if(o.ombre)m.receiveShadow=true;if(o.ordre)m.renderOrder=o.ordre;
    m.updateMatrix();m.matrixAutoUpdate=false; // sommets en coordonnées MONDE : la tranche ne bouge jamais
    trackMeshes.push(m); /* (LE PRÉ-BÂTI) elle entre dans la scène à l'installation (pisteInstalle) */
    const moy9=PISTE_MOY>1&&MOBG_RUBANS&&!!o.moy,nap9=MOBG_NAPPE&&o.nap?o.nap:null;
    if(o.loin===undefined&&!moy9&&!nap9)continue; /* (MOBG_RUBANS) un ruban à tranche moyenne ou à nappe entre aussi dans PISTE_LOD */
    yield;
    let lo=null;const g2=o.loin?pisteMaigre(att,c,o.loin):null;
    if(g2){lo=new THREE.Mesh(g2,mat);lo.receiveShadow=m.receiveShadow;lo.renderOrder=m.renderOrder;lo.visible=false;lo.userData.maigre=true;
      lo.updateMatrix();lo.matrixAutoUpdate=false;trackMeshes.push(lo);}
    let mo=null; // (LA TRANCHE MOYENNE, téléphone) toutes les colonnes, une rangée sur PISTE_MOY
    const st9=Math.round(PISTE_MOY/lay.pas); /* rangées entre deux gardées : 4 pour le bitume (pas 1), 2 pour la ligne (pas 2) */
    if(PISTE_MOY>1&&st9>1&&((o.loin&&lay.pas===1)||moy9)){yield;const cols9=[];for(let j=0;j<lay.pr;j++)cols9.push(j);
      const g3=pisteMaigre(att,c,{blocs:lay.blocs,pr:lay.pr,cols:cols9,inv:lay.inv,np:lay.np,pas:lay.pas},st9);
      if(g3&&o.marge)g3.boundingSphere.radius+=o.marge; /* (la sphère des rubans élargis en VS, comme celle de la tranche entière) */
      if(g3){mo=new THREE.Mesh(g3,mat);mo.receiveShadow=m.receiveShadow;mo.renderOrder=m.renderOrder;mo.visible=false;mo.userData.moyenne=true;
        mo.updateMatrix();mo.matrixAutoUpdate=false;trackMeshes.push(mo);}}
    if(o.loin!==undefined||mo||nap9)PISTE_LOD.push({hi:m,lo,mo,s:g.boundingSphere,loin:false,et:0,garde:!!o.moy&&o.loin===undefined,nap:nap9,nul:false});
  }
}
/* LE PRÉ-BÂTI (2026-10-17, Léo : « la pause du passage est beaucoup trop longue » — le portail de cubes, 3e tour). MESURÉ (banc : téléphone
   simulé 390 × 844, processeur ×4) : au passage, newTrack bloquait le script 0,4 à 1,1 s d'un bloc — la ROUTE (génération, courbe, repères,
   bitume, flancs, rails, nappe, ligne : 0,2 à 0,45 s ; la génération du canyon seule jusqu'à 0,49 s) puis le DÉCOR (la jade 0,6 à 1,1 s, la
   forêt 0,25 à 0,5 s, le glacier ~0,2 s…). Or la map d'en face est connue D'AVANCE (portDest la tire pour la fenêtre du portail) : on la BÂTIT
   pendant qu'on roule vers le portail, quelques millisecondes par image, et au passage on l'ÉCHANGE.
   · LA ROUTE est un générateur, `pisteRoute` : le code de buildTrack tel quel, qui rend la main entre deux tranches (`yield`). Il travaille sur
     un état FANTÔME : le temps d'une tranche, l'état de la piste vivante (pts, T, Nn, B, L, NP, trous, filets, pads, plots, flaques, tremplins,
     trackMeshes et les tranches de rendu, les repères que pose la génération, l'épaisseur, la largeur… — la map choisie et le portail franchi
     aussi) est ÉCHANGÉ avec celui du travail (`prebEchange`), puis rendu : la course ne voit jamais la piste d'en face, et rien n'entre dans la
     scène avant le passage (`pisteInstalle` : l'ancienne route sort, la neuve entre, dans l'ordre où elle a été bâtie). Les tirages `rnd()`
     sont ceux de buildTrack, dans le même ordre : une graine donne la même piste au bit près, bâtie d'avance ou au passage.
   · LA JADE se bâtissait déjà en tranches (`jadeBatit`, LES TRANCHES) et sait se GARDER hors de la scène (JADE_GARDE, LA CARTE GARDÉE) : on la
     bâtit d'avance sur la route fantôme, son état (jadeEtatLit) échangé de la même façon, et buildJade la REPREND au passage en quelques ms.
   · LA FORÊT, LE GLACIER : leur build devient un générateur (ses rendez-vous ne rendent la main qu'à une échéance finie, JF.lim :
     jamais au passage) ; d'avance (prebDecorG), leur module est échangé EN ENTIER le temps d'une tranche (prebObj), ce qu'ils mettent dans la
     scène est noté au lieu d'être ajouté — au passage, prebDecor l'installe là où leur build l'aurait bâti. La VILLE, le CANYON (son relief
     se calcule déjà dans un travailleur), les nuages et les pièces se bâtissent encore au passage (0,05 à 0,1 s à ×4).
   · CE DONT LA PISTE DÉPEND, en plus de sa graine : la map d'en face (le tirage du mode classique), le portail franchi (la largeur, la 2e vague
     de plots), le palier moteur (son échelle : lvPiste). Le travail commence quand le portail est à moins de PREB_AVANCE (20 s) de route,
     au palier de ce moment-là, qu'il garde jusqu'au passage (décor compris : prebPalier) — un palier gagné dans les dernières secondes
     n'y change rien, comme si le portail avait été franchi un peu plus tôt. La map d'en face change (dbgClassique) : le travail repart. Au
     passage, ce qui n'est pas fini se finit d'un trait — le travail fait reste fait. Hors du mode classique (carrière, campagne, auto-école, parc,
     balade) et pour tout autre newTrack (rejouer, dbgSaut…), rien ne change : la route se bâtit d'un trait, par le même générateur.
   · LE BUDGET : 3 à 6 ms par image (moins quand l'image est déjà lourde), seulement en course, hors pause, hors passage, la chauffe du monde
     neuf faite. `?prebati=0` : tout se bâtit au passage, comme avant. Console : dbgPrebati() (état, temps), dbgPrebati(0|1). */
const PREB={on:!/[?&]prebati=0\b/.test(location.search),W:null,g:null,fait:false,prend:false,porte:false,sd:0,t:null,z:0,eng:0,rh:0,carte:'',v:0,sT:0,sP:0,
  tNeuf:0,t0:0,tFin:0,cpu:0,img:0,jadeM:null,non:null,echecs:0,pris:0,finis:0,annules:0,der:'',msFin:0,
  dep:false,ctx:null,depPorte:false,fin0:0,ntLeger:false,cam:false,depPris:0,legers:0}; // (LE DÉPART D'AVANCE, voir prebDepTick)
const PREB_V=new THREE.Vector3();
const PREB_TAB=['trackMeshes','PISTE_LOD','NEON_RAILS','NEON_GLOW','PAD_MATS','MODMARK','FILETMARK','CAMPM','TROUMARK'];
function prebTabDe(k){return k==='trackMeshes'?trackMeshes:k==='PISTE_LOD'?PISTE_LOD:k==='NEON_RAILS'?NEON_RAILS:k==='NEON_GLOW'?NEON_GLOW:k==='PAD_MATS'?PAD_MATS:k==='MODMARK'?MODMARK:k==='FILETMARK'?FILETMARK:k==='TROUMARK'?TROUMARK:CAMPM;}
function prebChampsDe(piste){ // les champs de module qu'écrit la construction de la route : toutes les maps, plus ceux de la génération de CETTE map
  const L9=[[TORD,['on','N','ctrl0','seed','info']],[JADE,['flank','ligne']],[LIGNE_PER,['v']]];
  if(piste==='jade')L9.push([JADE,['Q','mk']]); /* (2026-10-20) mk : les modules de la vallée */
  else if(piste==='foret')L9.push([FORET,['Q','plg','boucles','noeuds','pel','plan','axe']]); // (2026-10-19) plan, axe : LA FORÊT AU HASARD
  else if(piste==='canyon')L9.push([CY,['Q','rmin','sep','hz']]); // (+ hz : LE CANYON AU HASARD)
  else if(piste==='dunes')L9.push([DN,['Q','rmin','sep','hz','gp','fe']]); // (2026-10-18) LES DUNES D'OR (+ hz : LES DUNES AU HASARD · + fe : les vagues de LA ROUTE CONTINUE)
  else if(piste==='banquise')L9.push([BANQ,['Q','cas','spi','axe','plan','pres','essais']]); // (2026-10-19) axe, plan, pres, essais : LE GLACIER AU HASARD (l'axe tourne les aurores)
  else if(piste==='grotte')L9.push([GROTTE,['Q','salles','spi','conflits','croise']]); // (2026-10-18) LES PROFONDEURS
  return L9;}
function pisteTravail(c){ // l'état de travail d'une route : celle d'en face (c, le pré-bâti), ou celle que newTrack vient de choisir (null, d'un trait)
  const W={pts:[],T:[],Nn:[],B:[],L:0,NP:0,trackMinY:-1e9,FILETS:[],MODS:[],TROUS:[],TROU:null,PADS:[],PADL:[],OILS:[],
    VILLE_ENTREE:null,THICK:THICK,ROAD_HALF:ROAD_HALF,KAPB:KAPB,zoneArch:zoneArch,tab:{},
    cur:LVL.cur,n:LVL.n,zones:runStats.zones,eng:engTier,F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},jade:null,jadeFait:false};
  if(c){W.cur=sfNiveau(c.t.carte,c.t.meteo,c.t.teinte);W.n=c.zn+1;W.zones=c.z;W.ROAD_HALF=ROAD_HALF0*LARGEUR[Math.min(LARGEUR.length-1,c.z)];W.KAPB=new Float32Array(1);
    if(c.dep){W.eng=c.eng;W.ctx={started:c.st,gameOver:false,pret:true};}} // (LE DÉPART D'AVANCE) le palier et l'état de la partie au moment où elle partira (voir prebDepCible)
  for(const k of PREB_TAB)W.tab[k]=/MARK|CAMPM/.test(k)?prebTabDe(k).slice():[]; // les repères de la génération partent de leur état vivant (une génération qui ne les touche pas les laisse tels quels, comme avant)
  W.piste=W.cur&&!PARK.on?(W.cur.piste||''):'';
  W.champs=prebChampsDe(W.piste);W.ch=W.champs.map(function(e){const o={};for(const k of e[1])if(k in e[0])o[k]=e[0][k];return o;}); // (au départ : les valeurs vivantes — une clé absente reste absente)
  return W;}
function prebEchange(W,entrees){ // l'état de la piste vivante ⇄ celui du travail W (deux appels se défont) · entrees : aussi la map choisie, le portail franchi, F (le temps d'une tranche)
  let x;
  x=pts;pts=W.pts;W.pts=x;x=T;T=W.T;W.T=x;x=Nn;Nn=W.Nn;W.Nn=x;x=B;B=W.B;W.B=x;x=L;L=W.L;W.L=x;x=NP;NP=W.NP;W.NP=x;x=trackMinY;trackMinY=W.trackMinY;W.trackMinY=x;
  x=FILETS;FILETS=W.FILETS;W.FILETS=x;x=MODS;MODS=W.MODS;W.MODS=x;x=TROUS;TROUS=W.TROUS;W.TROUS=x;x=TROU;TROU=W.TROU;W.TROU=x;x=PADS;PADS=W.PADS;W.PADS=x;x=PADL;PADL=W.PADL;W.PADL=x;
  x=OILS;OILS=W.OILS;W.OILS=x;
  x=VILLE_ENTREE;VILLE_ENTREE=W.VILLE_ENTREE;W.VILLE_ENTREE=x;x=THICK;THICK=W.THICK;W.THICK=x;
  x=ROAD_HALF;ROAD_HALF=W.ROAD_HALF;W.ROAD_HALF=x;x=KAPB;KAPB=W.KAPB;W.KAPB=x;x=zoneArch;zoneArch=W.zoneArch;W.zoneArch=x;
  for(const k of PREB_TAB){const A=prebTabDe(k),B9=W.tab[k];W.tab[k]=A.slice();A.length=0;for(let i=0;i<B9.length;i++)A.push(B9[i]);}
  for(let i=0;i<W.champs.length;i++){const O=W.champs[i][0],S=W.ch[i];for(const k of W.champs[i][1]){const a=k in O,b=k in S;x=O[k];if(b)O[k]=S[k];else delete O[k];if(a)S[k]=x;else delete S[k];}}
  if(entrees){if(W.jade){const m=jadeEtatLit();jadeEtatEcrit(W.jade);W.jade=m;} // la jade en construction (voir prebJade)
    if(W.mods)for(const e of W.mods)prebObj(e[0],e[1]); // le module du décor en construction, en entier (voir prebDecorG)
    if(W.tabs)for(const e of W.tabs){const A=e[0],B9=e[1];e[1]=A.slice();A.length=0;for(let i=0;i<B9.length;i++)A.push(B9[i]);} // …et ses listes
    if(W.add){x=scene.add;scene.add=W.add;W.add=x;} // …et ce qu'il met dans la scène est noté, pas ajouté
    x=LVL.cur;LVL.cur=W.cur;W.cur=x;x=LVL.n;LVL.n=W.n;W.n=x;x=runStats.zones;runStats.zones=W.zones;W.zones=x;x=engTier;engTier=W.eng;W.eng=x;
    if(W.ctx){const C=W.ctx;x=started;started=C.started;C.started=x;x=gameOver;gameOver=C.gameOver;C.gameOver=x;x=SF.pret;SF.pret=C.pret;C.pret=x;} // (LE DÉPART D'AVANCE) bâtie au menu comme si la partie partait (hautOn, la météo des décors)
    for(const k of ['p','t','n','b']){PREB_V.copy(F[k]);F[k].copy(W.F[k]);W.F[k].copy(PREB_V);}}
}
function prebObj(O,S){const ks=new Set(Object.keys(O).concat(Object.keys(S)));for(const k of ks){const a=k in O,b=k in S,x=O[k];if(b)O[k]=S[k];else delete O[k];if(a)S[k]=x;else delete S[k];}} // deux états d'un module ⇄ (toutes ses clés)
function prebAvec(W,fn){prebEchange(W,true);try{return fn();}finally{prebEchange(W,true);}} // une tranche : le travail sur l'état de W, puis la piste vivante revient
function pisteDirecte(seed){const W=pisteTravail(null),g=pisteRoute(seed,W);prebAvec(W,function(){while(!g.next().done);});return W;} // la route d'un trait (tout newTrack qui n'a rien de bâti d'avance)
function pisteInstalle(W){ // la route bâtie (d'un trait ou d'avance) devient LA route : l'ancienne sort de la scène, la neuve y entre dans l'ordre où elle a été bâtie
  sceneRetire(trackMeshes); // (chasse aux gels) d'un seul passage (voir sceneRetire)
  for(const m of trackMeshes){if(m.geometry)m.geometry.dispose();if(m.material&&m.material.dispose)MAT_SURSIS.add(m.material);} // (perf) matières en sursis : voir MAT_SURSIS
  matSursisN=3;trackMeshes.length=0;
  prebEchange(W,false);
  for(let i=0;i<trackMeshes.length;i++)scene.add(trackMeshes[i]);
  ROAD_U.uAcc.value.copy(W.accC); // le bitume mouillé reflète l'accent de la zone
  if(W.bords)bordsTick(); // (bords-route) la 1re image du rail est déjà à la bonne couleur
  ligneRaz(); // LA LIGNE PARFAITE : ses pads et ses fruits se posent EN COURSE (ligneTick)
  PREB.tNeuf=performance.now();}
function prebCible(){ // la piste d'en face, quand on sait la bâtir d'avance : le mode classique en course (la map que le portail a tirée d'avance)
  if(!SF.on||PARK.on||TUTO.on||BALADE||JADE_JEU)return null;
  if(LVL.cur&&LVL.cur.piste==='tuto')return null;
  const z=(runStats.zones|0)+1,zn=Math.max(0,z-(LVL.tutoZ|0));
  let t=SF.tirage[zn];if(!t){portDest();t=SF.tirage[zn];}
  if(!t||!SF_CARTES[t.carte])return null;
  return {t:t,z:z,zn:zn};}
function* prebJade(seed,W){ // LA JADE d'avance (voir buildJade, LA CARTE GARDÉE) : bâtie sur la route fantôme, gardée hors de la scène, reprise au passage
  if(JADE.root)return; // (la jade en place ne se bâtit pas par-dessus elle-même : le mode classique n'enchaîne jamais deux fois la même map)
  if(!JADE.geos){if(!GAB_FOND.it)GAB_FOND.it=jadeGabaritsG(); // les GABARITS de la session, s'ils ne sont pas encore taillés (voir LES GABARITS TAILLÉS AU MENU) : là où ils en sont
    for(;;){const t9=performance.now(),r=GAB_FOND.it.next();GAB_FOND.ms+=performance.now()-t9;GAB_FOND.n++;if(r.done){GAB_FOND.it=null;GAB_FOND.fini=true;r.value.ms=Math.round(GAB_FOND.ms);JADE.geos=r.value;break;}yield;}}
  const vivant=jadeEtatLit();jadeEtatVide();W.jade=vivant; // l'état de la carte : vide, comme buildJade le pose avant de bâtir — l'état vivant attend dans W
  const cle=jadeCle(seed),it=jadeBatit(seed,cle);yield;
  for(;;){const r=it.next();if(r.done)break;yield;} // jadeBatit rend la main à l'échéance JF.lim (celle de la tranche)
  W.jadeFait=true;}
function* prebDecorG(W,nom,O,gen){ // UN DÉCOR d'avance : gen (son build, en générateur) sur la route fantôme — son module O échangé EN ENTIER le temps d'une
  // tranche (prebObj), ce qu'il met dans la scène noté au lieu d'être ajouté (W.add), ce qu'il pousse dans trackMeshes mis de côté (W.decorTM) :
  // au passage, prebDecor l'installe là où son build l'aurait bâti. (Ce que son « Vide » touche EN PLACE hors du module a son double fantôme.)
  if(O.root)return; // (le décor en place ne se bâtit pas par-dessus lui-même : le mode classique n'enchaîne jamais deux fois la même map)
  const nA=trackMeshes.length,vivant=Object.assign({},O),k9=W.champs.findIndex(function(e){return e[0]===O;});
  if(k9>=0){for(const k of W.champs[k9][1])if(k in W.ch[k9])vivant[k]=W.ch[k9][k];else delete vivant[k];W.champs.splice(k9,1);W.ch.splice(k9,1);} // (les champs que sa génération a écrits passent dans l'état entier)
  W.mods=[[O,vivant]];W.tabs=[];
  if(nom==='foret'&&FORET.loup)FORET.loup=Object.assign({},FORET.loup); // foretVide remet le loup à zéro en place : le fantôme a le sien
  if(nom==='banquise'){const b9=Object.assign({},BKV);W.mods.push([BKV,b9]); // banqVide remet la glisse à zéro en place
    const t9=BK_NUE.slice();BK_NUE.length=0;W.tabs.push([BK_NUE,t9]);} // …et la route nue du glacier (bkPisteNue) a sa liste à elle
  W.scn=[];W.add=function(){for(let i=0;i<arguments.length;i++)W.scn.push(arguments[i]);return this;};
  {const x=scene.add;scene.add=W.add;W.add=x;} // (cette tranche-ci : la scène interceptée dès maintenant)
  const it=gen();
  for(;;){let r;try{r=it.next();}catch(e){W.decorErr=e;break;}if(r.done)break;yield;} // une exception dans son build : elle est rendue au passage, au même endroit (prebDecor), comme si le build s'était fait là
  W.decorTM=trackMeshes.splice(nA);W.decor=nom;}
function prebDecor(W,nom){ // (buildTrack) le décor bâti d'avance entre en scène là où son build l'aurait bâti
  if(!W||W.decor!==nom)return false;W.decor=null;
  const O=W.mods[0][0],S=W.mods[0][1],GARDE={foret:['loup'],banquise:[],grotte:[]}[nom]; // (le loup, l'éruption : ceux du module vivant, que son « Vide » vient de remettre à zéro)
  if(nom==='foret')foretVide();else if(nom==='grotte')grotteVide();else banqVide();
  for(const k of Object.keys(O))if(!(k in S)&&GARDE.indexOf(k)<0)delete O[k];
  for(const k of Object.keys(S))if(GARDE.indexOf(k)<0)O[k]=S[k];
  if(nom==='banquise'){const t9=W.tabs[0][1];BK_NUE.length=0;for(const m of t9)BK_NUE.push(m);} // la route nue du glacier (bkPisteNue(true), fait d'avance)
  for(const o of W.decorTM)trackMeshes.push(o);for(const o of W.scn)scene.add(o);
  if(W.decorErr){const e=W.decorErr;W.decorErr=null;W.mods=null;W.tabs=null;throw e;} // (le build s'était arrêté là : sa météo n'était pas posée)
  const d9=started?bioPortDur():.01; // (la météo : sa durée est celle du passage)
  if(nom==='foret')foretMeteo(FORET.met,d9);else if(nom==='grotte')grotteMeteo(GROTTE.met,d9);else banqMeteo(BANQ.met,d9);
  W.mods=null;W.tabs=null;return true;}
function* prebJob(sd,W){yield* pisteRoute(sd,W);if(PARK.on)return;
  if(W.piste==='jade')yield* prebJade(sd,W);
  else if(W.piste==='foret')yield* prebDecorG(W,'foret',FORET,function(){return buildForetG(sd);});
  else if(W.piste==='banquise')yield* prebDecorG(W,'banquise',BANQ,function(){return buildBanqG(sd);});
  else if(W.piste==='grotte')yield* prebDecorG(W,'grotte',GROTTE,function(){return buildGrotteG(sd);}); // (2026-10-18) LES PROFONDEURS
  else if(W.piste==='canyon')yield* cyBatitG(sd,W); // (2026-10-23) LE CANYON D'AVANCE : son monde part au travailleur pendant l'approche (voir cyAvPart)
  else if(W.piste==='dunes'){W.dunes=prebDunes(sd,W);const a=W.dunes;if(a){yield;while(!a.R){if(JF.lim===Infinity||!DN.w)break;yield;}}}} // (2026-10-24) LES DUNES D'AVANCE : la préparation puis le calcul du monde chez le travailleur, attendu image après image (voir prebDunes)
const PREB_PISTES=['','jade','foret','canyon','banquise','grotte','dunes']; // les pistes dont on sait ce que la génération écrit (prebChampsDe) — une map NEUVE n'est pas bâtie d'avance tant qu'elle n'y est pas
function prebPart(c){ // on commence la piste d'en face
  const W=pisteTravail(c);
  try{for(const b of (W.cur&&W.cur.bio)||[])envPrepare(BIOMES[b]||BIOMES.golden);if(W.piste==='grotte')for(const m in GRT_MET)for(let k=0;k<GRT_SALLES.length;k++)envPrepare(BIOMES[grtBioNom(m,k)]);}catch(e){} // (+ la grotte : les ciels de ses salles, voir grotteTick) // (2026-10-24) LE CIEL DES REFLETS D'AVANCE : le ciel de la map d'en face part au travailleur (voir envPrepare)
  if(PREB_PISTES.indexOf(W.piste)<0){PREB.non=c.t;return;}
  PREB.W=W;PREB.sd=(Math.random()*1e9)|0;PREB.t=c.t;PREB.z=c.z;PREB.eng=c.dep?c.eng:engTier;PREB.rh=W.ROAD_HALF;PREB.carte=c.t.carte+'-'+c.t.meteo;
  PREB.dep=!!c.dep;PREB.ctx=c.dep?c.st:null;
  if(c.dep){const g9=+((/[?&]pistegraine=(\d+)/.exec(location.search)||[])[1])||0;if(g9)PREB.sd=g9;} // (banc) ?pistegraine=n : la 1re piste aussi (comme newTrack0)
  PREB.fait=false;PREB.prend=false;PREB.t0=performance.now();PREB.tFin=0;PREB.cpu=0;PREB.img=0;PREB.jadeM=null;
  PREB.g=prebJob(PREB.sd,W);}
function prebTravaille(lim){ // une tranche de travail, jusqu'à l'échéance lim (Infinity : jusqu'au bout)
  const W=PREB.W,g=PREB.g,t0=performance.now();let r=null;
  try{prebAvec(W,function(){const l0=JF.lim;JF.lim=lim;try{do{r=g.next();}while(!r.done&&performance.now()<lim);}finally{JF.lim=l0;}});}
  catch(e){console.warn('pré-bâti',e);window.__prebErr=e;PREB.echecs++;prebAnnule('erreur');return;}
  PREB.cpu+=performance.now()-t0;PREB.img++;
  if(r&&r.done){PREB.fait=true;PREB.tFin=performance.now();
    if(W.jade&&W.jadeFait){if(JADE_GARDE.m)jadeJette(JADE_GARDE.m);JADE_GARDE.m=W.jade;PREB.jadeM=W.jade;W.jade=null;}}} // la jade bâtie rejoint la CARTE GARDÉE : buildJade la reprendra
function prebAnnule(r){ // le travail en cours est jeté (la map d'en face a changé, un newTrack d'ailleurs, la fin de la partie, une erreur)
  if(!PREB.W)return;
  const W=PREB.W,g=PREB.g;PREB.W=null;PREB.g=null;PREB.fait=false;PREB.prend=false;PREB.dep=false;PREB.annules++;PREB.der=r||'';
  try{if(g)prebAvec(W,function(){g.return();});}catch(e){} // (les finally des générateurs : les tampons partagés des cubes de jade rendus)
  for(const m of W.tab.trackMeshes||[])if(m.geometry)m.geometry.dispose(); // jamais dessinées ; leurs matières non plus (et certaines sont partagées : on n'y touche pas)
  if(W.jade&&W.jade.J)try{jadeJette(W.jade);}catch(e){}
  if(PREB.jadeM&&JADE_GARDE.m===PREB.jadeM){jadeJette(JADE_GARDE.m);JADE_GARDE.m=null;}
  PREB.jadeM=null;CY.av=null;} // (le canyon d'avance : son monde ne servira plus)
function prebPorte(fn){PREB.porte=true;try{fn();}finally{PREB.porte=false;PREB.prend=false;}} // c'est le PORTAIL qui construit : la piste bâtie d'avance peut servir
function prebGraine(niv){ // (newTrack0, après lvlChoisir) la piste d'en face est-elle celle qu'on a bâtie d'avance ? → sa graine
  if(!PREB.W)return null;
  if(PREB.dep){ // (LE DÉPART D'AVANCE) la 1re piste de la partie, bâtie au menu ou à l'écran de fin : le JOUER (sous9) ou resetGame la prennent
    const ok=PREB.depPorte&&!!niv&&niv===LVL.cur&&!niv.graine&&!PARK.on&&(runStats.zones|0)===0&&!(LVL.tutoZ|0)&&SF.tirage[0]===PREB.t&&PREB.rh===ROAD_HALF
      &&PREB.eng===engTier&&PREB.ctx===started&&!gameOver&&(started||SF.pret); // même map, même départ, même palier, même état de la partie qu'au moment où elle a été bâtie
    if(!ok){prebAnnule(PREB.depPorte?'départ':'hors départ');return null;}}
  else{const zn=Math.max(0,(runStats.zones|0)-(LVL.tutoZ|0));
  const ok=PREB.porte&&!!niv&&niv===LVL.cur&&!niv.graine&&!PARK.on&&SF.tirage[zn]===PREB.t&&PREB.z===(runStats.zones|0)&&PREB.rh===ROAD_HALF;
  if(!ok){prebAnnule(PREB.porte?'portail':'hors portail');return null;}}
  if(!PREB.fait){const t0=performance.now();PREB.finis++;prebTravaille(Infinity);PREB.msFin=Math.round(performance.now()-t0);if(!PREB.fait)return null;} // pas fini à temps : le reste d'un trait
  else PREB.msFin=0;
  PREB.prend=true;return PREB.sd;}
function prebPrend(seed){ // (buildTrack) la route bâtie d'avance, si c'est elle qu'on construit
  if(!(PREB.prend&&PREB.W&&PREB.fait&&PREB.sd===seed))return null;
  const W=PREB.W;PREB.W=null;PREB.g=null;PREB.prend=false;PREB.fait=false;PREB.pris++;if(PREB.dep)PREB.depPris++;PREB.der=PREB.dep?'pris au départ':'pris';PREB.dep=false;return W;}
function prebPalier(){ // (newTrack0) la piste bâtie d'avance l'a été à SON palier moteur : son décor se bâtit au même (le temps de buildTrack)
  if(!PREB.prend||PREB.eng===engTier)return null;const e=engTier;engTier=PREB.eng;return e;}
const PREB_AVANCE=20; // (s) la map d'en face commence quand le portail est à moins de 20 s de route : son palier moteur (l'échelle de la piste) est celui de ce moment-là
function prebTick(now){ // à chaque image (fin de loop) : commencer, vérifier, travailler
  PREB.cam=false; // (voir sous9 : resetGame l'a lu dans cette image, ou rien ne l'a lu)
  if(!started||gameOver){prebDepTick(now);return;}
  if(mode==='boom'){prebDepTick(now);return;} // (2026-10-24, passe perf) la caisse explose : la partie est finie, le départ suivant se bâtit DÈS MAINTENANT (1,8 s avant l'écran de fin — voir prebDepTick) // (LE DÉPART D'AVANCE) au menu et à l'écran de fin
  PREB.fin0=0;
  if(PREB.W&&PREB.dep){prebAnnule('départ');return;} // la partie est partie sans prendre la piste du départ
  if(mode==='drive'&&PREB.sT){const d9=(now-PREB.sT)/1000,v9=(s-PREB.sP)/Math.max(1e-3,d9);if(d9>0&&d9<.5&&v9>0)PREB.v=PREB.v?PREB.v+(v9-PREB.v)*Math.min(1,d9*2):v9;} // la vitesse le long de la piste (m/s), lissée
  PREB.sT=now;PREB.sP=s;
  if(paused||!running||garageOn||PCV.fen||PORTV.att||CHAUFFE_R.t)return;
  if(mode!=='drive'&&mode!=='fall')return;
  if(now-PREB.tNeuf<700)return; // le monde neuf vient d'entrer : il s'installe d'abord
  const c=prebCible();
  if(!PREB.W){if(c&&c.t!==PREB.non&&PREB.echecs<3&&(L-s)/Math.max(20,PREB.v||60)<PREB_AVANCE)prebPart(c);return;} // (l'image suivante travaille)
  if(!c||c.t!==PREB.t||c.z!==PREB.z){prebAnnule(!c?'cible':c.t!==PREB.t?'map':'zone');return;} // (un palier gagné en route ne change rien : la piste garde celui du départ)
  if(PREB.fait)return;
  const tr=typeof QLR!=='undefined'&&QLR.t0?performance.now()-QLR.t0:8;
  /* (2026-10-24, passe perf 3e tour) L'URGENCE : la grotte se bâtit en tranches fines (grtMailleNetsG) et peut ne pas être finie au portail quand l'image
     est lourde (MESURÉ ×4 : une grotte après la jade, 3,2 s de calcul : le reste d'un trait au passage, 900 ms figées). Le portail à moins de 10 s :
     la tranche monte à 9 ms, à moins de 5 s à 14 ms (une image de 25-33 ms au lieu d'un bloc). */
  const r9=(L-s)/Math.max(20,PREB.v||60),u9=r9<5?14:r9<10?9:0;
  prebTravaille(performance.now()+Math.max(u9,3,Math.min(6,14-tr)));}
