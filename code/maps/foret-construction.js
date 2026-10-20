/* ---------------- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors de la forêt) ---------------- */
const FOR_GEANT_RB={chene:10.8,hetre:8.2,epicea:6.6,ancien:13,sequoia:14.6}; // (2026-10-15, LA PELOTE) le rayon du fût PRUDENT : à 85 % du pied — la route d'en dessous passe là où le tronc est plus épais
function forLot(items){ // trie les exemplaires par QUARTIER : chaque quartier = une plage contiguë (le tri par champ ne recopie que ce qu'il faut)
  items.sort(function(a,b){return a.q-b.q;});const n=items.length,o={n:n,M:new Float32Array(n*16),J:new Float32Array(n*4),rK:[],rA:[],rB:[]};
  let a=0;for(let i=0;i<n;i++){o.M.set(items[i].m,i*16);o.J.set(items[i].j,i*4);if(i===n-1||items[i+1].q!==items[i].q){o.rK.push(items[i].q);o.rA.push(a);o.rB.push(i+1);a=i+1;}}
  o.rK=Int32Array.from(o.rK);o.rA=Int32Array.from(o.rA);o.rB=Int32Array.from(o.rB);return o;}
function forFamille(root,geo,mat,lot,b0,b1,attr,ordre){if(!lot||!lot.n)return null;
  const g=new THREE.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);if(geo.index)g.setIndex(geo.index); // les attributs du prototype sont PARTAGÉS (voir foretVide)
  const F={lot:lot,b0:b0,b1:b1,attr:attr,sig:0,tri:(geo.index?geo.index.count:geo.attributes.position.count)/3};
  F.aJ=new THREE.InstancedBufferAttribute(new Float32Array(lot.n*4),4);F.aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute(attr,F.aJ);
  F.im=new THREE.InstancedMesh(g,mat,lot.n);F.im.frustumCulled=false;F.im.matrixAutoUpdate=false;F.im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);F.im.count=0;F.im.visible=false;
  if(ordre)F.im.renderOrder=ordre;root.add(F.im);FORET.fam.push(F);return F;}
function foretVide(){
  for(const F of FORET.fam){const g=F.im.geometry;for(const k in g.attributes)if(k!==F.attr)g.deleteAttribute(k);g.setIndex(null);g.dispose();F.im.dispose();}
  FORET.fam=[];FORET.quart=null;FORET.sig=0;FORET.geants=[];FORET.dz=null;FORET.deco=null;FORET.clr=[];FORET.gcol=null;FORET.arche=[];FORET.chaum=[];FORET.rocs=[];FORET.sol=null;FORET.solM=null;
  if(FORET.root){FORET.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});FORET.root=null;}
  if(FORET.loup){FORET.loup.t=0;FORET.loup.on=false;FORET.loup.roc=null;} // (2026-10-14, chasse aux bugs) un portail pendant un hurlement laissait `on` et le rocher de l'ANCIENNE piste : à la forêt suivante le loup-garou y réapparaissait jusqu'à 7,4 s
}
/* (2026-10-17, banc) dbgPleureurs(k) : rebâtit le décor de CETTE forêt (même graine) avec (1) ou sans (0) les pleureurs et re-rend une image. */
window.dbgVitrail=function(k,o){const u=foretMats().arb.uniforms;u.uVit.value=k==null?1:+k;o=o||{};if(o.L!=null)u.uVitL.value=+o.L;if(o.S!=null)u.uVitS.value=+o.S; // (2026-10-17) les arbres en VITRAIL : 0 = sans, 1 = avec (même image) ; {L,S} = la lumière des joints, l onde
  if(o.banc){const gl=renderer.getContext(),px=new Uint8Array(4),T=[];for(let i=0;i<o.banc;i++){const t0=performance.now();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-t0);}T.sort((a,b)=>a-b);return +T[T.length>>1].toFixed(1);} // (banc) ms d une image synchronisée
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {vit:u.uVit.value,L:u.uVitL.value,S:u.uVitS.value};};
window.dbgPleureurs=function(k){PLEUR.on=k==null?true:!!k;if(FORET.seed==null)return 'pas de forêt';buildForet(FORET.seed);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {pleureurs:PLEUR.on,n:FORET.n};};
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé de la forêt change depuis le 19/10, pas son décor — toujours la même forêt mêlée (épicéas, sapins, hêtres-saules), les
   mêmes géants pleureurs, un rocher du loup tous les ~700 m, deux chaumières, 2-3 ronds d'amanites, la même brume. Désormais, par piste, un TIRAGE
   DE DÉCOR dans un flux à lui (`dr`, né de la graine du décor : jamais le hasard de la route), treize choix indépendants (`FORET.dz`, lisible dans
   `dbgForet().deco`) — les placements neufs (clairières, cercles de pierres) dans un second flux (`dz2`) :
   · LE PEUPLEMENT (`ess`) : mêlé (celui d'avant), résineux, hêtraie, boulaie, pinède — la table des essences par distance à la route ;
   · LES SAULES (`pleur`) : combien de feuillus deviennent des pleureurs (peu / comme avant / partout) ;
   · LA SAISON (`sais`) : été (avant), automne (des hêtres, chênes, bouleaux d'or), printemps (vert tendre), sombre (bleuté) — la teinte par arbre et
     un uniform (uLeafT, multiplié) : même programme ;
   · LA DENSITÉ (`dens`) : clairsemée ×0,75, avant, dense ×1,1 ;
   · LES GÉANTS (`gea`) : la colonnade (serrée / avant / clairsemée) et leurs essences (pleureurs d'avant ou VIEUX CHÊNES tordus, dorés à l'automne) ;
   · LES ROCHERS DU LOUP (`rocs`) : aucun, rares, avant, nombreux ; leur taille ×0,8-1,3 ;
   · LES CHAUMIÈRES (`chaum`) : aucune, une ou deux (avant), un HAMEAU de 3-5 au bord de la route ;
   · LES RONDS DE SORCIÈRES (`ama`) : 0, 2-3 (avant), 5-8 ; leurs amanites ×1-1,8, plus près de la route ;
   · LES FLEURS (`fl`) : la fleur des prairies (digitales pourpres, coquelicots, marguerites, boutons d'or, ou le mélange d'avant), leur densité ;
   · LES CLAIRIÈRES (`clair`, NEUF) : 0-3 trous dans la forêt au bord de la route, fleuris, sans arbre ni géant ;
   · LE CERCLE DE PIERRES (`crom`, NEUF) : 0-2 cromlechs de menhirs (le rocher du loup, à 1/6 d'échelle), dans une clairière ou à 60-120 m ;
   · LA BRUME (`brume`) : légère / avant / épaisse — ses nappes et l'uniform uMistK ;
   · LES RAYONS ET LES YEUX (`ray`, `yeux`) : la densité des rayons de soleil, le nombre d'yeux la nuit.
   Rien ne touche la route : les menhirs gardent ROAD_HALF + 25 m et leurs gélules entrent dans les collisions ; les clairières ne font que retirer
   des arbres. `?sans=foretdecor` = le décor d'avant, au tirage près (aucun tirage de plus dans `fr` ni `fw`). */
const FOR_ESS={ // [près (< 175 m), milieu (< 620 m), loin] : des seuils cumulés sur r
  'résineux':[[[.35,'epicea'],[.62,'sapin'],[.8,'pin'],[.9,'bouleau'],[1,'hetre']],[[.5,'epicea'],[.8,'sapin'],[.95,'pin'],[1,'hetre']],[[.5,'epicea'],[.85,'sapin'],[1,'pin']]],
  'hêtraie':[[[.4,'hetre'],[.62,'chene'],[.8,'bouleau'],[.9,'pin'],[1,'epicea']],[[.5,'hetre'],[.75,'chene'],[.85,'bouleau'],[1,'epicea']],[[.6,'hetre'],[.8,'chene'],[1,'epicea']]],
  'boulaie':[[[.55,'bouleau'],[.75,'hetre'],[.88,'pin'],[1,'sapin']],[[.4,'bouleau'],[.6,'pin'],[.8,'epicea'],[1,'hetre']],[[.48,'epicea'],[.68,'sapin'],[.94,'hetre'],[1,'pin']]],
  'pinède':[[[.5,'pin'],[.7,'bouleau'],[.85,'epicea'],[1,'chene']],[[.55,'pin'],[.75,'epicea'],[1,'sapin']],[[.4,'pin'],[.8,'epicea'],[1,'hetre']]]};
function forDecoTire(seed){
  const dr=mulberry32((seed^0xDEC0F0)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  D.ess=pds([['mêlée',1.2],['résineux',1],['hêtraie',1],['boulaie',.8],['pinède',.8]])[0];li.push('forêt '+D.ess);
  {const p=pds([['peu de saules',1,[.35,.3,.15]],['saules',1.2,[.9,.75,.45]],['saules partout',.8,[1,.92,.6]]]);D.pleur=p[2];li.push(p[0]);}
  {const s=pds([['été',1.2,0,0,[1,1,1]],['automne',1,.42,.15,[1.04,.98,.86]],['printemps',1,.02,.35,[1.06,1.1,.9]],['sombre',.8,0,-.3,[.84,.92,1.02]]]);D.sais={nom:s[0],or:s[2],dt:s[3],leaf:s[4]};li.push('saison '+s[0]);}
  {const d=ch([[.75,'clairsemée'],[1,'normale'],[1.1,'dense']]);D.dens=d[0];li.push('densité '+d[1]);}
  {const c=ch([[.72,'serrée'],[1,'normale'],[1.6,'clairsemée']]),v=dr()<.4;D.gea={col:c[0],vieux:v};li.push('colonnade '+c[1]+(v?', vieux chênes':', géants pleureurs'));}
  {const r=pds([['aucun rocher',.5,0],['rochers rares',1,1.8],['rochers',1,1],['rochers nombreux',1,.55]]);D.rocs={pas:r[2],sc:.8+dr()*.5};li.push(r[0]+(r[2]?' ×'+D.rocs.sc.toFixed(2):''));}
  D.chaum=pds([['aucune',.6],['une ou deux',1.2],['hameau',1]])[0];li.push('chaumières : '+D.chaum);
  {const n=ch([0,2,3,5,7]);D.ama={n:n,sc:1+dr()*.8,lat:n>3?30:55};li.push(n+' ronds d\'amanites'+(n?' ×'+D.ama.sc.toFixed(1):''));}
  {const f=pds([['mélange',1.2,-1],['digitales',1,0],['coquelicots',1,1],['marguerites',1,2],['boutons d\'or',1,3]]),k=ch([.7,1,1.4]);D.fl={dom:f[2],k:k};li.push('fleurs '+f[0]+' ×'+k);}
  D.clair=(dr()*4)|0;li.push(D.clair+' clairière'+(D.clair>1?'s':''));
  D.crom=pds([[0,1],[1,1.2],[2,.6]])[0];li.push(D.crom+' cercle'+(D.crom>1?'s':'')+' de pierres');
  {const b=ch([[.55,.65,'légère'],[1,1,'normale'],[1.5,1.45,'épaisse']]);D.brume={n:b[0],k:b[1]};li.push('brume '+b[2]);}
  {const r=ch([.5,1,1.7]),y=ch([40,90,160]);D.ray=r;D.yeux=y;li.push('rayons ×'+r+', '+y+' yeux');}
  D.li=li;return D;}
function buildForet(seed){jadeFini(buildForetG(seed));} // (2026-10-17, LE PRÉ-BÂTI) d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildForetG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  foretVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='foret'||!(NP>1))return;
  const t0=performance.now(),M=foretMats(),PT=foretProtos(),fr=mulberry32((seed^0xF0E57)>>>0),fw=mulberry32((seed^0x5A01E)>>>0),MOB=PAL_B9('foretArbres',1)*(TEL_NATIF?.8:1),ds=L/(NP-1);FORET.b0=PAL_B9('foretB0',270);FORET.b1=PAL_B9('foretB1',760);
  FORET.graine=(seed>>>0)%100000;FORET.seed=seed;FORET.zonesNu=[];FORET.met=LVL.cur.meteo||'midi';FORET.n={};
  const DZ=FOR_DECOR?forDecoTire(seed):null,dz2=mulberry32((seed^0xB015E)>>>0);FORET.dz=DZ;FORET.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage, et le flux des placements neufs */
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);FORET.root=root;trackMeshes.push(root);
  const S=yield* foretSol(),tS=performance.now();
  foretSolMesh(root);if(performance.now()>JF.lim)yield;
  // ---- les QUARTIERS (150 m) ----
  const QC=150,QM=new Map(),QL=[];
  const qDe=(x,z)=>{const k=Math.floor(x/QC)*100003+Math.floor(z/QC);let q=QM.get(k);if(q===undefined){q=QL.length;QM.set(k,q);QL.push([1e9,-1e9,1e9,-1e9,1e9,-1e9]);}return q;};
  const ext=(q,x,y0,y1,z,r)=>{const b=QL[q];if(x-r<b[0])b[0]=x-r;if(x+r>b[1])b[1]=x+r;if(y0<b[2])b[2]=y0;if(y1>b[3])b[3]=y1;if(z-r<b[4])b[4]=z-r;if(z+r>b[5])b[5]=z+r;};
  const Mt=new THREE.Matrix4(),Qt=new THREE.Quaternion(),V3=new THREE.Vector3(),Sc=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  const mat=(x,y,z,ry,sx,sy,sz)=>{const c=Math.cos(ry),s=Math.sin(ry);return [c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1];}; // = compose(rotation Y, échelle) écrit à la main
  // ---- la route en grille (les règles de distance) ----
  const HB=100,grille=new Map(),pg=Math.max(1,Math.round(8/ds));
  for(let i=0;i<NP;i+=pg){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const lat9=i=>{const t=T[i],hl=Math.hypot(t.x,t.z)||1;return [-t.z/hl,t.x/hl];};
  // ---- les zones nues (pas d'arbre ordinaire dedans) : une grille de 60 m ----
  const ZG=new Map(),zone=(x,z,r)=>{FORET.zonesNu.push([x,z,r]);const c=Math.ceil(r/60);for(let a=-c;a<=c;a++)for(let b=-c;b<=c;b++){const k=(Math.floor(x/60)+a)*100003+(Math.floor(z/60)+b);let L9=ZG.get(k);if(!L9)ZG.set(k,L9=[]);L9.push([x,z,r]);}};
  const nu=(x,z,r)=>{const L9=ZG.get(Math.floor(x/60)*100003+Math.floor(z/60));if(L9)for(const o of L9)if(Math.hypot(x-o[0],z-o[1])<o[2]+r)return true;return false;};
  const COL=[]; // les collisions des décors : gélules et sphères en coordonnées MONDE
  const colPose=(meta,x,y,z,ry,sxz,sy)=>{const c=Math.cos(ry),s=Math.sin(ry),tr=(px,py,pz)=>[x+(px*c+pz*s)*sxz,y+py*sy,z+(-px*s+pz*c)*sxz],rr=Math.max(sxz,sy*.6);
    for(const k of meta.C||[]){const a=tr(k[0],k[1],k[2]),b=tr(k[3],k[4],k[5]);COL.push({g:1,a:a,b:b,r:k[6]*sxz});}
    for(const k of meta.S||[]){const a=tr(k[0],k[1],k[2]);COL.push({g:0,a:a,r:k[3]*rr});}};
  /* (2026-10-20, LE DÉCOR AU HASARD) LES CLAIRIÈRES (et celles des cercles de pierres) : un trou dans la forêt au bord de la route (ni arbre ni géant),
     fleuri plus bas — loin de toute AUTRE route (à plus de 500 m de piste de celle qui la longe) */
  const CLR=[];if(DZ)for(let k=0;k<DZ.clair+DZ.crom;k++){const cr9=k>=DZ.clair;for(let e=0;e<10;e++){const f=.08+dz2()*.84,i=Math.round(f*(NP-1)),l9=lat9(i),sd=dz2()<.5?-1:1,R=cr9?30+dz2()*10:48+dz2()*32,lat=ROAD_HALF+R+(cr9?35+dz2()*55:6+dz2()*40),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    let ok=true;for(const c of CLR)if(Math.hypot(c[0]-x,c[1]-z)<c[2]+R+60)ok=false;proches(x,z,R+ROAD_HALF+20,function(j){if(ok&&Math.abs(j-i)*ds>500&&Math.hypot(pts[j].x-x,pts[j].z-z)<R+ROAD_HALF+20)ok=false;});
    if(!ok)continue;CLR.push([x,z,R,i,cr9?1:0]);zone(x,z,R);break;}}
  FORET.clr=CLR;
  // ---- 1. LES GÉANTS : à la corde de chaque virage, en quinconce le long des droites, au cœur des boucles, en colonnade, et LA FUTAIE ----
  /* (2026-10-15, LA PELOTE — Sacha : « des arbres beaucoup, beaucoup plus hauts, beaucoup plus grands » · « qu'on puisse passer entre les
     arbres pour changer de route ») Un géant pose son pied au fond et ouvre sa couronne AU-DESSUS DE LA ROUTE LA PLUS HAUTE à sa portée
     (24-60 m au-dessus ; 45-195 m pour un séquoia) : sous une pelote à trois étages, un chêne monte à 400-500 m, un séquoia à 700. Son tronc
     (`FOR_GEANT_RB` : le rayon du fût sous la couronne, prudent) reste à 5 m au moins du bord de TOUTES les routes, à toutes les hauteurs. */
  const GE=[],ge=DZ&&DZ.gea.vieux?['ancien','ancien','ancien','chene','hetre']:FOR_GEANTS_N.filter(function(k){return k!=='sequoia';}); /* (LE DÉCOR AU HASARD) les VIEUX CHÊNES : l'ancien ne devient jamais pleureur */ // (les séquoias ont leurs passes à eux)
  const geantXZ=(x,z,sp)=>{if(CLR.length)for(const c of CLR)if(Math.hypot(c[0]-x,c[1]-z)<c[2]+12)return false;const meta=PT.geant[sp][0].m,base=solH(x,z)-3,cb=sp==='sequoia'?(meta.cb||178):(meta.cb||95),R9=meta.cr*2.2+ROAD_HALF+14;
    let yH=-1e9,dM=1e9,iM=-1;proches(x,z,R9,function(j){const q=pts[j],dh=Math.hypot(q.x-x,q.z-z);if(dh<R9&&q.y>yH)yH=q.y;if(dh<dM){dM=dh;iM=j;}});
    if(iM<0){const yb9=solBil(S.yb,x,z);yH=yb9<1e4?yb9:base+120;} // (aucune route à portée de couronne : la plus basse des environs sert de repère)
    const sy=THREE.MathUtils.clamp((yH-base+(sp==='sequoia'?45+fr()*150:24+fr()*36))/cb,sp==='sequoia'?.9:.7,4.4),sxz=Math.sqrt(sy)*(.84+fr()*.2),rT=FOR_GEANT_RB[sp]*sxz,cr=meta.cr*sxz;
    if(base+cb*sy-16<yH)return false; // (la couronne plafonnée passerait dans une route)
    for(const g of GE){const d=Math.hypot(g.x-x,g.z-z);if(d<Math.max((g.rT+rT)*2.4+25,(g.cr+cr)*.5))return false;}
    let ok=true;proches(x,z,rT+ROAD_HALF+6,function(j){if(!ok)return;const q=pts[j];if(Math.hypot(q.x-x,q.z-z)<rT+ROAD_HALF+5)ok=false;});
    if(!ok)return false;
    if(iM<0){let bd=1e18;for(let j=0;j<NP;j+=8){const q=pts[j],d2=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z);if(d2<bd){bd=d2;iM=j;}}}
    const q=pts[iM],ry=sp==='ancien'?Math.atan2(q.x-x,q.z-z):fr()*6.2832;
    GE.push({x:x,z:z,y:base,sp:sp,sy:sy,sxz:sxz,ry:ry,cr:cr,rT:rT,top:base+meta.h*sy,i:iM});zone(x,z,rT+9);return true;};
  const geant=(i,sg,lat,sp)=>{const p=pts[i],l9=lat9(i);return geantXZ(p.x+l9[0]*sg*lat,p.z+l9[1]*sg*lat,sp);};
  {const st=Math.max(1,Math.round(6/ds)),K9=[];
   for(let i=st;i<NP-st;i+=st){const a=T[i-st],b=T[i+st],th=Math.atan2(a.x*b.z-a.z*b.x,a.x*b.x+a.z*b.z);K9.push([i,th/(2*st*ds)]);} // la courbure signée (rad/m)
   const sm=K9.map(function(k,j){let s9=0,n9=0;for(let d=-4;d<=4;d++){const o=K9[j+d];if(o){s9+=o[1];n9++;}}return [k[0],s9/n9];});
   let der=-1e9;
   for(let j=1;j<sm.length-1;j++){if(performance.now()>JF.lim)yield;const k=sm[j],a=Math.abs(k[1]);if(a<1/1100||a<Math.abs(sm[j-1][1])||a<Math.abs(sm[j+1][1]))continue;
     const sK=k[0]*ds;if(sK-der<110||sK<260||sK>L-180)continue;
     const sg=k[1]>0?1:-1,sp=ge[(fr()*ge.length)|0]; // le côté INTÉRIEUR du virage (θ<0 : le cap tourne vers −latéral)
     if(geant(k[0],sg,ROAD_HALF+8+FOR_GEANT_RB[sp]*1.5+fr()*10,sp)||geant(k[0],sg,ROAD_HALF+22+FOR_GEANT_RB[sp]*1.6+fr()*14,ge[(fr()*ge.length)|0]))der=sK; // à la CORDE
     if(fr()<.5){const i2=Math.min(NP-1,k[0]+Math.round((55+fr()*45)/ds));geant(i2,-sg,ROAD_HALF+14+fr()*18+FOR_GEANT_RB.chene*1.6,ge[(fr()*ge.length)|0]);}}} // …et parfois, à la sortie, de l'autre côté
  {let sd=fr()<.5?-1:1;for(let s9=280;s9<L-200;s9+=95+fr()*70){if(performance.now()>JF.lim)yield;const i=Math.round(s9/ds);let pres=false;for(const g of GE){const d=Math.hypot(g.x-pts[i].x,g.z-pts[i].z);if(d<85){pres=true;break;}}
    if(pres)continue;sd=-sd;const sp=ge[(fr()*ge.length)|0];geant(i,sd,ROAD_HALF+10+FOR_GEANT_RB[sp]*1.5+fr()*22,sp);}}
  for(const o of FORET.boucles||[]){let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(o.e);if(d<bd){bd=d;bi=i;}}
    geant(bi,-o.sg,o.R,'sequoia');} // LE SÉQUOIA DE LA BOUCLE : au centre du premier demi-tour, la route tourne autour de lui
  /* LES SÉQUOIAS-TOURS (2026-10-14 soir) : une COLONNADE le long de la route — un fût tous les 70-115 m, d'un côté puis de l'autre, au ras
     du bord (la route serpente entre les troncs). */
  {let sd=fr()<.5?-1:1;for(let s9=300;s9<L-160;s9+=(70+fr()*45)*(DZ?DZ.gea.col:1)){if(performance.now()>JF.lim)yield;const i=Math.round(s9/ds);sd=-sd;
     geant(i,sd,ROAD_HALF+FOR_GEANT_RB.sequoia*1.6+16+fr()*34,'sequoia');}}
  /* LA FUTAIE (2026-10-15, LA PELOTE) : partout à moins de 360 m d'une route, un géant tous les ~95 m (une grille décalée) — séquoias,
     chênes, hêtres, épicéas, vieux chênes ; la pelote serpente entre des troncs de 20 à 50 m de diamètre, et l'air entre ses étages
     n'appartient qu'à eux : c'est entre ces fûts qu'on saute d'une route à l'autre. (`foretFutaie` : l'écart de la grille par palier) */
  {const PF=95*PAL_B9('foretFutaie',1);let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;for(let i=0;i<NP;i+=8){const p=pts[i];if(p.x<bx0)bx0=p.x;if(p.x>bx1)bx1=p.x;if(p.z<bz0)bz0=p.z;if(p.z>bz1)bz1=p.z;}
   for(let gx=bx0-360;gx<bx1+360;gx+=PF)for(let gz=bz0-360;gz<bz1+360;gz+=PF){if(performance.now()>JF.lim)yield;const x=gx+(fr()-.5)*PF*.8,z=gz+(fr()-.5)*PF*.8,d=solBil(S.d,x,z),r=fr();
     if(d>360||d<ROAD_HALF+24)continue;geantXZ(x,z,r<.42?'sequoia':ge[(fr()*ge.length)|0]);}}
  FORET.geants=GE;
  if(performance.now()>JF.lim)yield;
  // ---- 2. LES ROCHERS DU LOUP (les aiguilles de grès qui dominent la canopée) ----
  const RO=[];if(!DZ||DZ.rocs.pas){let sd=fr()<.5?-1:1;for(let s9=520+fr()*200;s9<L-450;s9+=(520+fr()*320)*(DZ?DZ.rocs.pas:1)){const i=Math.round(s9/ds),l9=lat9(i);sd=-sd;
    for(let e=0;e<4;e++){const lat=190+fr()*80,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(solBil(S.d,x,z)<150||nu(x,z,40))continue;
      const b=solH(x,z),sy=THREE.MathUtils.clamp((pts[i].y+30-b)/52,.8,2.4)*(DZ?DZ.rocs.sc:1),sxz=Math.sqrt(sy)*(.9+fr()*.25);
      RO.push({x:x,z:z,y:b,sy:sy,sxz:sxz,ry:fr()*6.283,top:b+52*sy,i:i,sd:sd});zone(x,z,26*sxz);
      COL.push({g:1,a:[x,b,z],b:[x,b+46*sy,z],r:9*sxz});break;}}}
  FORET.rocs=RO;
  // ---- 3. L'ARCHE ----
  for(const k9 of ['arche','archeB']){if(k9!=='arche'&&!(FORET.Q&&FORET.Q[k9]))continue; // (2026-10-19) une ou deux arches (la seconde : LA FORÊT AU HASARD)
    const AR=foretArche(root,fr,M,k9);if(AR){for(const c of AR.C)COL.push({g:1,a:[c[0],c[1],c[2]],b:[c[3],c[4],c[5]],r:c[6]});FORET.arche.push(AR);}}
  // ---- 4. LES CHAUMIÈRES (une ou deux, au fond, au bord d'une clairière) ----
  {const geo=FORET.geoChaum||(FORET.geoChaum=foretChaumiereGeo());
   const U9=!DZ||DZ.chaum==='une ou deux'?[.3+fr()*.15,.62+fr()*.18]:DZ.chaum==='aucune'?[]:(function(){const u0=.15+dz2()*.65,n=3+((dz2()*3)|0),o=[];for(let k=0;k<n;k++)o.push(u0+k*55/L);return o;})(); /* (LE DÉCOR AU HASARD) aucune, une ou deux, ou un HAMEAU */
   for(const u of U9){if((!DZ||DZ.chaum!=='hameau')&&fr()<.25)continue;const i=Math.round(u*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1;
     for(let e=0;e<6;e++){const lat=82+fr()*45,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,y=solH(x,z);
       if(Math.abs(solH(x+9,z)-solH(x-9,z))>5||Math.abs(solH(x,z+9)-solH(x,z-9))>5||nu(x,z,30))continue;
       const m=new THREE.Mesh(geo,M.arb);m.position.set(x,y-.6,z);m.rotation.y=Math.atan2(pts[i].x-x,pts[i].z-z);m.updateMatrix();m.matrixAutoUpdate=false;root.add(m);
       FORET.chaum.push(m);zone(x,z,30);canTampon(x,z,22,y+18);break;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 5. LA FORÊT ----
  const ESP={},LOINF=[],LOINC=[];for(const k of FOR_ESP_N)ESP[k]=[];
  /* (2026-10-15, LA PELOTE — « des arbres beaucoup plus grands ») la forêt ordinaire à l'échelle ×2,1 (des hêtres de 60 m, des épicéas de 80) :
     une case 2× plus large, 4× moins d'arbres pour le même couvert — et autant de triangles en moins. */
  const FE=2.1,cell=15*2/Math.sqrt(Math.min(1,MOB*1.25)),Rt=PAL_B9('foretRayon',1650),metaE={};for(const k of FOR_ESP_N)metaE[k]=PT.esp[k][0].m;
  const ES9=DZ&&FOR_ESS[DZ.ess],choix=(d,r)=>{if(ES9){for(const e of ES9[d<175?0:d<620?1:2])if(r<e[0])return e[1];return 'epicea';}if(d<175)return r<.30?'hetre':r<.52?'bouleau':r<.70?'chene':r<.82?'epicea':r<.92?'pin':'sapin';
    if(d<620)return r<.40?'epicea':r<.58?'sapin':r<.82?'hetre':r<.90?'pin':r<.95?'chene':'bouleau';
    return r<.48?'epicea':r<.68?'sapin':r<.94?'hetre':'pin';};
  let nArb=0;
  const nC=S.C*S.C/(cell*cell);
  for(let cj=0;cj<S.nz-1;cj++)for(let ci=0;ci<S.nx-1;ci++){if(!ci&&performance.now()>JF.lim)yield;if(S.d[ci+cj*S.nx]>Rt+S.C*1.5)continue;let nn=Math.floor(nC);if(fr()<nC-nn)nn++;
   for(let e9=0;e9<nn;e9++){
    const x=S.x0+(ci+fr())*S.C,z=S.z0+(cj+fr())*S.C,d=solBil(S.d,x,z);if(d>Rt)continue;
    const f=solBil(S.f,x,z)*(d>620?MOB*.7:MOB*.5+.5)*(d>1150?.55:1)*(DZ?DZ.dens:1);if(fr()>f)continue; // (le FLANC) au-delà de 1150 m, moins d'arbres mais plus hauts : la même masse de forêt
    const sp=choix(d,fr()),me=metaE[sp];let s=(.78+fr()*.5)*(d>1150?1.22:1)*FE,sxz=s*(.85+fr()*.3);
    if(d<ROAD_HALF+20)continue;
    if(nu(x,z,me.cr*sxz*.5))continue;
    const y=solH(x,z)-.4;
    {const yb9=solBil(S.yb,x,z);if(yb9<1e4){const lim=yb9-30;if(y+me.h*s>lim){s=(lim-y)/me.h;if(s<.6)continue;sxz=Math.min(sxz,s*1.15);}}} // (LA PELOTE) jamais dans l'air libre des étages : 30 m sous la route la plus BASSE à moins de 280 m
    const ry=fr()*6.2832,q=qDe(x,z);let tint=sp==='hetre'&&fr()<.04?2:(fr()*2-1)*.6;
    if(DZ){if(tint<1.5)tint=Math.max(-1,Math.min(1,tint+DZ.sais.dt));if(DZ.sais.or&&(sp==='hetre'||sp==='chene'||sp==='bouleau')&&dz2()<DZ.sais.or)tint=2;} /* (LE DÉCOR AU HASARD) LA SAISON */
    let spF=sp,sF=s,sxzF=sxz; // (2026-10-17) LES PLEUREURS : tirés de LEUR flux, le flux du décor ne voit rien
    if(PLEUR.on&&(sp==='hetre'||sp==='bouleau'||sp==='chene')&&fw()<(DZ?DZ.pleur[d<175?0:d<620?1:2]:d<175?.9:d<620?.75:.45)){const e9=fw()<.55?'saule':'pleureur',hF=metaE[e9].h;let k9=s*(e9==='saule'?1.3:1.25);
      const yb9=solBil(S.yb,x,z);if(yb9<1e4)k9=Math.min(k9,(yb9-30-y)/hF);if(k9>=.6){spF=e9;sF=k9;sxzF=k9*(sxz/s)*(e9==='pleureur'?1.08:1);}}
    const meF=metaE[spF];
    ESP[spF].push({q:q,m:mat(x,y,z,ry,sxzF,sF,sxzF),j:[fr(),tint,0,0]});
    {const fc=FC[spF],k9=tint>1.5?[1.35,1.12,.7]:[1+tint*.16,1+tint*.06,1-tint*.18],al=[fc[0]*k9[0]*.78,fc[1]*k9[1]*.78,fc[2]*k9[2]*.78],lo=FOR_LOIN[spF];
     if(fr()<.62){const g9=1.12; // au loin, 62 % des arbres, un peu plus gros : la même masse de forêt pour 40 % de triangles en moins
      if(lo)LOINF.push({q:q,m:mat(x,y+lo[0]*sF,z,ry,lo[1]*sxzF*g9,lo[1]*lo[2]*sF*g9,lo[1]*sxzF*g9),j:[fr(),al[0],al[1],al[2]]});
      else{const H9=sp==='epicea'?37:33,r9=sp==='epicea'?6.6:6;LOINC.push({q:q,m:mat(x,y+3*s,z,ry,r9*sxz*g9,(H9-2.5)*s,r9*sxz*g9),j:[fr(),al[0],al[1],al[2]]});}}}ext(q,x,y,y+meF.h*sF,z,meF.cr*sxzF);canTampon(x,z,meF.cr*sxzF,y+meF.h*sF-2.5);nArb++;}}
  FORET.n.arbres=nArb;
  if(performance.now()>JF.lim)yield;
  // les géants entrent dans les familles (même tri), et leurs collisions dans la liste
  const GES={};for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL))GES[k]=[];
  for(const g of GE){let sp=g.sp;if(PLEUR.on&&(sp==='chene'||sp==='hetre')&&fw()<.85)sp=fw()<.5?'gsaule':'gpleureur'; // (2026-10-17) LES PLEUREURS géants : même place, même échelle, leur flux à eux
    if((sp==='sequoia'||sp==='epicea'||sp==='chene'||sp==='hetre'))sp=fw()<.5?'gsaule':'gpleureur'; // (2026-10-17, Léo : « enlève tous les arbres qui ont des gros cylindres » → séquoias et épicéas géants) que des géants TORDUS et pleureurs
    if(FOR_PLEUR_VOL[sp]){ /* (2026-10-17 soir, LA PELOTE REVENUE) le pleureur prend la place d'un géant taillé pour SA couronne (un séquoia
       s'ouvre à 178, le rideau d'un saule tombe à 94) : une route d'un autre étage passait dans ses mèches. On le REHAUSSE jusqu'à ce que le bas des
       rideaux passe 16 m au-dessus de la plus haute route sous sa ramure (comme geantXZ) ; au-delà de ×1,45, l'autre pleureur ; sinon la clairière reste vide. */
      const pl=function(e){const P=FOR_PLEUR_VOL[e],rh=(P.r+8)*g.sxz+ROAD_HALF;let yH=-1e9;proches(g.x,g.z,rh,function(j){const q=pts[j];if(q.y>yH&&Math.hypot(q.x-g.x,q.z-g.z)<rh)yH=q.y;});
        return yH<-1e8?g.sy:Math.max(g.sy,(yH+16-g.y)/P.bas);};
      let e9=sp,k9=pl(sp);if(k9>g.sy*1.45){const o9=sp==='gsaule'?'gpleureur':'gsaule',k8=pl(o9);if(k8<k9){e9=o9;k9=k8;}}
      if(k9>g.sy*1.45||k9>5.6){g.vide=1;g.spV=sp;fr();fr();continue;} // (deux tirages : le décor qui suit ne bouge pas)
      sp=e9;g.sy=k9;g.top=Math.max(g.top,g.y+FOR_PLEUR_VOL[sp].h*k9);}
    g.spV=sp;const q=qDe(g.x,g.z),meta=PT.geant[sp][0].m;GES[sp].push({q:q,m:mat(g.x,g.y,g.z,g.ry,g.sxz,g.sy,g.sxz),j:[fr(),DZ?(DZ.sais.or&&dz2()<DZ.sais.or*.8?2:Math.max(-1,Math.min(1,(fr()*2-1)*.4+DZ.sais.dt))):(fr()*2-1)*.4,0,1]});
    ext(q,g.x,g.y,Math.max(g.top,g.y+meta.h*g.sy),g.z,Math.max(g.cr,meta.cr*g.sxz));colPose(meta,g.x,g.y,g.z,g.ry,g.sxz,g.sy);} // (pas de tampon de canopée : la case de 26 m déborderait sur la route — les gélules et sphères suffisent)
  // les rochers : une famille aussi
  const ROI=[];for(const r of RO){const q=qDe(r.x,r.z);ROI.push({q:q,m:mat(r.x,r.y,r.z,r.ry,r.sxz,r.sy,r.sxz),j:[fr(),0,0,0]});ext(q,r.x,r.y,r.top,r.z,20*r.sxz);canTampon(r.x,r.z,16*r.sxz,r.top-6);}
  /* (LE DÉCOR AU HASARD) LE CERCLE DE PIERRES : 7-11 menhirs (le rocher du loup à ~1/6) en anneau au cœur de sa clairière, un plus grand au milieu une fois sur deux */
  let nMen=0;for(const c of CLR){if(!c[4])continue;const n=7+((dz2()*5)|0),Rr=c[2]*(.5+dz2()*.15),a0=dz2()*6.283,pts9=[];for(let k=0;k<n;k++){const an=a0+k/n*6.2832;pts9.push([c[0]+Math.cos(an)*Rr,c[1]+Math.sin(an)*Rr,.13+dz2()*.06]);}
    if(dz2()<.5)pts9.push([c[0],c[1],.24]);
    for(const m of pts9){const x=m[0],z=m[1],sy=m[2],sxz=.22+sy*.6,y=solH(x,z)-1,q=qDe(x,z);ROI.push({q:q,m:mat(x,y,z,dz2()*6.283,sxz,sy,sxz),j:[dz2(),0,0,0]});ext(q,x,y,y+52*sy,z,20*sxz);COL.push({g:1,a:[x,y,z],b:[x,y+46*sy,z],r:9*sxz});nMen++;}}
  FORET.n.menhirs=nMen;
  if(performance.now()>JF.lim)yield;
  // ---- 6. LES AMANITES (des ronds de sorcières au fond), LES FLEURS DU BORD, LES PLANTES DU FOND, LE LIERRE ----
  const CHI=[];{const n0=2+((fr()*2)|0),n=DZ?DZ.ama.n:n0;for(let k=0;k<n;k++){const i=Math.round((.15+fr()*.7)*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1,lat=(DZ?DZ.ama.lat:55)+fr()*60,cx=pts[i].x+l9[0]*sd*lat,cz=pts[i].z+l9[1]*sd*lat,R9=9+fr()*6,nn=11+((fr()*5)|0);
    for(let j=0;j<nn;j++){const an=j/nn*6.283+fr()*.2,x=cx+Math.cos(an)*R9,z=cz+Math.sin(an)*R9,s=(1.1+fr()*1.2)*(DZ?DZ.ama.sc:1),y=solH(x,z)-.2,q=qDe(x,z);CHI.push({q:q,m:mat(x,y,z,fr()*6.28,s,s*(.9+fr()*.3),s),j:[fr(),0,0,0]});ext(q,x,y,y+5*s,z,3*s);}}}
  const FLE=[],LIE=[],TILE=[[0,.15],[1,.15],[2,.19],[3,.15],[4,.14],[5,.22]],tire=r=>{for(const t of TILE){r-=t[1];if(r<=0)return t[0];}return 5;};
  const Mb=new THREE.Matrix4(),Mr=new THREE.Matrix4(),vx=new THREE.Vector3(),vy=new THREE.Vector3(),vz=new THREE.Vector3(),Rq=new THREE.Quaternion();
  const pose=(p,up,side,spin,out)=>{vy.copy(up).normalize();vx.copy(side).addScaledVector(vy,-side.dot(vy)).normalize();vz.crossVectors(vx,vy);Mb.makeBasis(vx,vy,vz);Rq.setFromAxisAngle(vy,spin);
    Mb.premultiply(Mr.makeRotationFromQuaternion(Rq));Mb.setPosition(p);return Mb.toArray(out);};
  {const pf=Math.max(1,Math.round(PAL_B9('foretFleurs',1.1)/ds)),pl=Math.max(1,Math.round(3.2/ds));
   for(let i=Math.round(45/ds);i<NP-Math.round(30/ds);i+=pf)for(const sd of [-1,1]){if(sd<0&&performance.now()>JF.lim)yield;if(fr()<.2){fr();fr();fr();continue;}
     const p=pts[i],b=B[i],n=Nn[i],t=tire(fr()),h=(t===0?3.1:t===5?2.3:2.0)*(.85+fr()*.55),lat=sd*(ROAD_HALF-.9-fr()*1.4);
     V3.copy(p).addScaledVector(b,lat).addScaledVector(n,.03);const q=qDe(V3.x,V3.z);
     const m9=pose(V3,n,b,fr()*6.28,[]),j9=[t,h*.55,h,fr()];if(FORET_FLEURS_BORD){FLE.push({q:q,m:m9,j:j9});ext(q,V3.x,V3.y-1,V3.y+h,V3.z,2);}} /* (2026-10-15 soir, Sacha : « enlever les fleurs au bord de la route dans la forêt ») les tirages restent les mêmes (le reste de la forêt ne bouge pas), seule la pose saute */
   for(let i=Math.round(30/ds);i<NP-Math.round(20/ds);i+=pl)for(const sd of [-1,1]){if(fr()<.25)continue;const p=pts[i],b=B[i],n=Nn[i],lg=3+fr()*6;
     V3.copy(p).addScaledVector(b,sd*(ROAD_HALF+.15)).addScaledVector(n,-.2);const q=qDe(V3.x,V3.z);
     LIE.push({q:q,m:pose(V3,n,T[i],fr()*.6-.3,[]),j:[6,2.6+fr()*1.8,lg,fr()]});ext(q,V3.x,V3.y-lg-THICK,V3.y,V3.z,4);}
   for(const AR of FORET.arche)for(const l of AR.LI){ /* (2026-10-19) le lierre de CHAQUE arche (une ou deux : LA FORÊT AU HASARD) */V3.set(l[0],l[1],l[2]);const q=qDe(l[0],l[2]);LIE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),fr()*6.28,[]),j:[6,3.5+fr()*2,l[3],fr()]});ext(q,l[0],l[1]-l[3],l[1],l[2],4);}
   // les plantes du FOND (fougères géantes, digitales, jacinthes, et des fleurs dans les prairies) : on les voit d'en haut
   const pfF=Math.max(1,Math.round(PAL_B9('foretPlantes',4.2)/(DZ?DZ.fl.k:1)/ds));
   for(let i=0;i<NP;i+=pfF)for(let e=0;e<2;e++){if(!e&&performance.now()>JF.lim)yield;const l9=lat9(i),sd=fr()<.5?-1:1,lat=fr()*175,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,pr=solBil(S.pr,x,z);
     let t=pr>.3&&fr()<.7?[0,2,3,4,2][(fr()*5)|0]:fr()<.72?5:fr()<.55?0:fr()<.85?4:7;if(DZ&&DZ.fl.dom>=0&&pr>.3&&dz2()<.65)t=DZ.fl.dom;const h=(t===5?4.2:t===7?2.2:2.8)*(.75+fr()*.5),y=solH(x,z)-.3,q=qDe(x,z);
     V3.set(x,y,z);FLE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),fr()*6.28,[]),j:[t,h*.6,h,fr()]});ext(q,x,y,y+h,z,4);}}
  /* (LE DÉCOR AU HASARD) les CLAIRIÈRES en fleurs (la fleur tirée, ou le mélange), un rond d'amanites une fois sur deux */
  for(const c of CLR){const n=c[4]?18:Math.round(c[2]*c[2]/45);for(let k=0;k<n;k++){const a=dz2()*6.2832,r=Math.sqrt(dz2())*c[2]*.95,x=c[0]+Math.cos(a)*r,z=c[1]+Math.sin(a)*r,y=solH(x,z)-.3,q=qDe(x,z);
      if(c[4]&&r<c[2]*.4)continue;const t=DZ.fl.dom>=0&&dz2()<.7?DZ.fl.dom:[0,1,2,3,4][(dz2()*5)|0],h=(t===0?3.1:2.2)*(.8+dz2()*.6);V3.set(x,y,z);FLE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),dz2()*6.28,[]),j:[t,h*.6,h,dz2()]});ext(q,x,y,y+h,z,4);}
    if(!c[4]&&dz2()<.5){const cx=c[0]+(dz2()-.5)*c[2],cz=c[1]+(dz2()-.5)*c[2],nn=9+((dz2()*5)|0),R9=6+dz2()*4;for(let j=0;j<nn;j++){const an=j/nn*6.283,x=cx+Math.cos(an)*R9,z=cz+Math.sin(an)*R9,s9=1.2+dz2()*1.2,y=solH(x,z)-.2,q=qDe(x,z);CHI.push({q:q,m:mat(x,y,z,dz2()*6.28,s9,s9,s9),j:[dz2(),0,0,0]});ext(q,x,y,y+5*s9,z,3*s9);}}}
  FORET.n.fleurs=FLE.length;FORET.n.lierre=LIE.length;FORET.n.clairieres=CLR.length;
  if(performance.now()>JF.lim)yield;
  // ---- 7. LES FAMILLES (prototype × détail) ----
  const BANDE=[[0,0],[1,1],[2,2]];
  const PRES=PAL_B9('foretPres',0); // palier ancien : le détail MOYEN de près aussi (une famille par essence au lieu de deux)
  for(const k of FOR_ESP_N){const lot=forLot(ESP[k]);if(PRES){const F=forFamille(root,PT.esp[k][1].g,M.arb,lot,0,1,'aI');if(F)F.nom=k+'1';}else for(let l=0;l<2;l++){const F=forFamille(root,PT.esp[k][l].g,M.arb,lot,BANDE[l][0],BANDE[l][1],'aI');if(F)F.nom=k+l;}}
  {const F1=forFamille(root,PT.boule.g,M.arb,forLot(LOINF),2,2,'aI'),F2=forFamille(root,PT.cone.g,M.arb,forLot(LOINC),2,2,'aI');if(F1)F1.nom='loin-feuillus';if(F2)F2.nom='loin-coniferes';}
  for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL)){const lot=forLot(GES[k]);if(PAL_B9('foretGeantFin',1)){const F1=forFamille(root,PT.geant[k][0].g,M.arb,lot,0,1,'aI'),F2=forFamille(root,PT.geant[k][1].g,M.arb,lot,2,2,'aI');if(F1)F1.nom='G'+k+'0';if(F2)F2.nom='G'+k+'1';}
    else{const F=forFamille(root,PT.geant[k][1].g,M.arb,lot,0,2,'aI');if(F)F.nom='G'+k+'1';}} // palier ancien : un seul détail pour les géants
  {const lot=forLot(ROI);const gR=FORET.geoRoc||(FORET.geoRoc=foretRocherGeo());const F=forFamille(root,gR,M.arb,lot,0,2,'aI');if(F)F.nom='rochers';}
  if(PAL_B9('foretChampi',1)){const lot=forLot(CHI);const gC=FORET.geoChi||(FORET.geoChi=foretChampiGeo());const F=forFamille(root,gC,M.arb,lot,0,1,'aI');if(F)F.nom='amanites';}
  {const gF=FORET.geoFl||(FORET.geoFl=forCroixGeo(false)),gL=FORET.geoLi||(FORET.geoLi=forCroixGeo(true));const F=forFamille(root,gF,M.fleur,forLot(FLE),0,1,'aF');if(F)F.nom='fleurs';
   if(PAL_B9('foretLierre',1)){const F2=forFamille(root,gL,M.fleur,forLot(LIE),0,1,'aF');if(F2)F2.nom='lierre';}}
  if(performance.now()>JF.lim)yield;
  // ---- 8. LES RAYONS, LA BRUME, LES YEUX (des tampons entiers, sans tri : peu d'exemplaires, peu de triangles) ----
  {const pr9=Math.max(1,Math.round(PAL_B9('foretRayons',28)/(DZ?DZ.ray:1)/ds)),R9=[],L9=[];
   for(let i=Math.round(80/ds);i<NP;i+=pr9){const l9=lat9(i),sd=fr()<.5?-1:1,lat=fr()*150,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
     R9.push(x,pts[i].y+55+fr()*70,z,5+fr()*12);L9.push(130+fr()*90,fr());}
   const g=new THREE.InstancedBufferGeometry();const pl=new THREE.PlaneGeometry(1,1);pl.translate(0,.5,0);g.index=pl.index;g.setAttribute('position',pl.attributes.position);
   g.setAttribute('aR',new THREE.InstancedBufferAttribute(new Float32Array(R9),4));g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(L9),2));g.instanceCount=R9.length/4;
   const m=new THREE.Mesh(g,M.ray);m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=6;m.userData.jeter=true;root.add(m);FORET.rayons=m;FORET.n.rayons=g.instanceCount;}
  {const pb=Math.max(1,Math.round(PAL_B9('foretBrume',42)/(DZ?DZ.brume.n:1)/ds)),Bm=[];
   for(let i=0;i<NP;i+=pb){const l9=lat9(i);for(let e=0;e<2;e++){const sd=fr()<.5?-1:1,haut=e===1&&fr()<.4,lat=haut?ROAD_HALF+10+fr()*60:fr()*210,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,
     y=haut?pts[i].y+3+fr()*10:Math.max(solH(x,z)+12,pts[i].y-28-fr()*50),s=haut?40+fr()*40:70+fr()*90;Bm.push(mat(x,y,z,0,s,s,s));}}
   const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),M.brume,Bm.length);for(let k=0;k<Bm.length;k++)im.instanceMatrix.array.set(Bm[k],k*16);
   im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=4;im.geometry.userData=im.geometry.userData||{};im.userData.jeter=true;root.add(im);FORET.brume=im;}
  {const Ey=[],EyL=[];const ne=Math.round(PAL_B9('foretYeux',90)*(DZ?DZ.yeux/90:1));for(let k=0;k<ne;k++){const i=Math.round((.06+fr()*.9)*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1,lat=45+fr()*200,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
     const g9=solH(x,z),top=Math.max(g9+4,canH(x,z)-8),y=g9+3+fr()*Math.max(2,Math.min(16,top-g9)),sz=1+fr()*.7,c=fr()<.55?0:fr()<.6?1:2,w=fr(),dx=-l9[1],dz=l9[0];
     for(const e of [-1,1]){Ey.push(mat(x+dx*e*sz*1.1,y,z+dz*e*sz*1.1,0,1,1,1));EyL.push(1,c,sz,w);}}
   const g=new THREE.PlaneGeometry(1,1);g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(EyL),4));
   const im=new THREE.InstancedMesh(g,M.lueur,Ey.length);for(let k=0;k<Ey.length;k++)im.instanceMatrix.array.set(Ey[k],k*16);
   im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=7;im.userData.jeter=true;root.add(im);FORET.yeux=im;}
  // ---- les quartiers : leur boîte et leur sphère (le tri) ----
  FORET.quart=QL.map(function(b){return {c:new THREE.Vector3((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),r:Math.hypot(b[1]-b[0],b[3]-b[2],b[5]-b[4])/2+8,b:b};});
  // ---- les collisions en grille de 120 m ----
  {const CG=120,G=new Map();for(const c of COL){const xs=c.g?[c.a[0],c.b[0]]:[c.a[0]],zs=c.g?[c.a[2],c.b[2]]:[c.a[2]],r=c.r+2;
     const i0=Math.floor((Math.min.apply(null,xs)-r)/CG),i1=Math.floor((Math.max.apply(null,xs)+r)/CG),j0=Math.floor((Math.min.apply(null,zs)-r)/CG),j1=Math.floor((Math.max.apply(null,zs)+r)/CG);
     for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i+','+j;let a=G.get(k);if(!a)G.set(k,a=[]);a.push(c);}}
   FORET.gcol={CG:CG,G:G,n:COL.length};}
  for(const F of FORET.fam)F.im.name='forêt '+(F.nom||'?');if(FORET.rayons)FORET.rayons.name='forêt rayons';if(FORET.brume)FORET.brume.name='forêt brume';if(FORET.yeux)FORET.yeux.name='forêt yeux';
  FORET.n.geants=GE.length;FORET.n.rochers=RO.length;FORET.n.quartiers=QL.length;FORET.n.familles=FORET.fam.length;
  FORET.ms=Math.round(performance.now()-t0);FORET.msSol=Math.round(tS-t0);FORET.sig=0;
  foretMeteo(FORET.met,started?bioPortDur():.01);
}
/* deux quads croisés (fleurs, fougères : y de 0 à 1) — ou qui PENDENT (lierre : y de 0 à −1) ; uv.y = 1 en haut de la case */
function forCroixGeo(pend){const P=[],U=[],I=[];let n=0;
  for(const r of [0,Math.PI/2]){const c=Math.cos(r),s=Math.sin(r);for(const v of [[-.5,0],[.5,0],[.5,1],[-.5,1]]){const y=pend?-v[1]:v[1];P.push(v[0]*c,y,v[0]*s);U.push(v[0]+.5,pend?1-v[1]:v[1]);}I.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);return g;}
/* ---------------- LE TRI PAR QUARTIERS (chaîné sur scene.onBeforeRender, la recette de jadeTri) ----------------
   À chaque rendu : chaque quartier reçoit une BANDE (0 de près · 1 à mi-distance · 2 au loin · −1 hors champ ou derrière la brume) ;
   une famille ne réécrit ses exemplaires que si SA liste de quartiers a changé, et n'envoie que la partie utile. */
const FT={fr:new THREE.Frustum(),pv:new THREE.Matrix4(),s:new THREE.Sphere(),vis:null,ms:0,n:0,up:0};
function foretTri(cam){
  if(!FORET.root||!FORET.quart||!FORET.fam.length)return;const t0=performance.now();
  FT.fr.setFromProjectionMatrix(FT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const f=scene.fog,ff=(f&&f.isFog)?f.far:6000,cp=cam.position,Qs=FORET.quart,S=FT.s,B0=FORET.b0||270,B1=FORET.b1||760;
  if(!FT.vis||FT.vis.length!==Qs.length)FT.vis=new Int8Array(Qs.length);
  let sig=7;
  for(let k=0;k<Qs.length;k++){const q=Qs[k];S.center.copy(q.c);S.radius=q.r;let v=-1;
    if(FT.fr.intersectsSphere(S)){const b=q.b,ex=Math.max(b[0]-cp.x,0,cp.x-b[1]),ey=Math.max(b[2]-cp.y,0,cp.y-b[3]),ez=Math.max(b[4]-cp.z,0,cp.z-b[5]),d=Math.sqrt(ex*ex+ey*ey+ez*ez);
      if(d<ff+60)v=d<B0?0:d<B1?1:2;}
    FT.vis[k]=v;if(v>=0)sig=(Math.imul(sig,31)+k*4+v+1)|0;}
  if(sig!==FORET.sig){FORET.sig=sig;FT.up++;
    for(const F of FORET.fam){const lot=F.lot,RK=lot.rK,RA=lot.rA,RB=lot.rB,nR=RK.length;let fs=7;
      for(let i=0;i<nR;i++){const v=FT.vis[RK[i]];if(v<F.b0||v>F.b1)continue;fs=(Math.imul(fs,31)+RK[i]+1)|0;}
      if(fs===F.sig)continue;F.sig=fs;
      let w=0;const A=F.im.instanceMatrix.array,J=F.aJ.array;
      for(let i=0;i<nR;i++){const v=FT.vis[RK[i]];if(v<F.b0||v>F.b1)continue;const r0=RA[i],r1=RB[i];A.set(lot.M.subarray(r0*16,r1*16),w*16);J.set(lot.J.subarray(r0*4,r1*4),w*4);w+=r1-r0;}
      F.im.count=w;F.im.visible=w>0&&!F.coupe;
      if(w){F.im.instanceMatrix.updateRange.offset=0;F.im.instanceMatrix.updateRange.count=w*16;F.im.instanceMatrix.needsUpdate=true;F.aJ.updateRange.offset=0;F.aJ.updateRange.count=w*4;F.aJ.needsUpdate=true;}}}
  FT.ms+=performance.now()-t0;FT.n++;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{foretTri(cam);}catch(e){window.__foretErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* ---------------- LES MÉTÉOS : la forêt glisse d'un temps à l'autre au même fondu que le ciel ---------------- */
function foretMeteo(m,dur){const T9=FOR_MET[m]||FOR_MET.midi;FORET.met=FOR_MET[m]?m:'midi';
  if(!FORET.cur)FORET.cur=JSON.parse(JSON.stringify(T9));
  FORET.de=JSON.parse(JSON.stringify(FORET.cur));FORET.to=T9;FORET.k=0;FORET.dur=Math.max(.01,dur||1.2);}
function foretPas(dt){if(!FORET.cur||FORET.k>=1)return;FORET.k=Math.min(1,FORET.k+dt/FORET.dur);const e=FORET.k*FORET.k*(3-2*FORET.k),a=FORET.de,b=FORET.to,o=FORET.cur;
  for(const k in b){const v=b[k];if(typeof v==='number')o[k]=a[k]+(v-a[k])*e;else if(Array.isArray(v))for(let i=0;i<v.length;i++)o[k][i]=a[k][i]+(v[i]-a[k][i])*e;else o[k]=v;}}
/* ---------------- LES EFFETS QUI VIVENT AUTOUR DE LA CAISSE (bâtis une fois, cachés hors de la forêt) ---------------- */
function foretFx(){const fx=FORET.fx;if(fx.pap)return fx;const M=foretMats(),R=mulberry32(0xFA9);
  { // les PAPILLONS (et les chauves-souris)
    const nP=PAL_B9('foretPap',150),P=[],U=[],I=[];
    for(const sd of [1,-1]){const b=P.length/3;for(const v of [[0,-.5],[1,-.5],[1,.5],[0,.5]]){P.push(sd*v[0]*.999+sd*.001,0,v[1]);U.push(v[0],v[1]+.5);}I.push(b,b+1,b+2,b,b+2,b+3);}
    const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);
    const aR=new Float32Array(nP*4),aP=new Float32Array(nP*2);for(let k=0;k<nP;k++){aR[k*4]=R();aR[k*4+1]=R();aR[k*4+2]=R();aR[k*4+3]=R();aP[k*2]=(R()*4)|0;aP[k*2+1]=1.25+R()*1.15; /* des papillons de CONTE (2,5-4,8 m d'envergure) : à 65 m devant une caisse lancée, un vrai papillon ne fait pas un pixel */}
    g.setAttribute('aR',new THREE.InstancedBufferAttribute(aR,4));g.setAttribute('aP',new THREE.InstancedBufferAttribute(aP,2));g.instanceCount=nP;
    fx.pap=new THREE.Mesh(g,M.pap);fx.pap.name='forêt papillons';fx.pap.frustumCulled=false;fx.pap.matrixAutoUpdate=false;fx.pap.visible=false;scene.add(fx.pap);}
  { // les LUCIOLES et le POLLEN
    const nL=PAL_B9('foretLuc',900),g=new THREE.BufferGeometry(),aR=new Float32Array(nL*4);for(let k=0;k<nL*4;k++)aR[k]=R();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nL*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
    fx.luc=new THREE.Points(g,M.luc);fx.luc.name='forêt lucioles';fx.luc.frustumCulled=false;fx.luc.matrixAutoUpdate=false;fx.luc.visible=false;fx.luc.renderOrder=8;scene.add(fx.luc);}
  { // les FEUX FOLLETS
    const n=PAL_B9('foretFollets',14),g=new THREE.PlaneGeometry(1,1),aL=new Float32Array(n*4);for(let k=0;k<n;k++){aL[k*4]=0;aL[k*4+1]=R();aL[k*4+2]=2.4+R()*2.2;aL[k*4+3]=R();}
    g.setAttribute('aL',new THREE.InstancedBufferAttribute(aL,4));fx.fol=new THREE.InstancedMesh(g,M.lueur,n);fx.fol.name='forêt follets';fx.fol.frustumCulled=false;fx.fol.matrixAutoUpdate=false;fx.fol.visible=false;fx.fol.renderOrder=7;
    fx.folL=[];for(let k=0;k<n;k++)fx.folL.push({p:new THREE.Vector3(0,-1e5,0),v:new THREE.Vector3(),a:0,vie:0,ph:R()*6.28,fuit:false});scene.add(fx.fol);}
  // la LUNE, le LOUP-GAROU et son halo de lune
  fx.lune=new THREE.Sprite(M.lune);fx.lune.visible=false;fx.lune.renderOrder=-1;fx.lune.frustumCulled=false;scene.add(fx.lune);
  fx.halo=new THREE.Sprite(M.halo);fx.halo.visible=false;fx.halo.renderOrder=5;scene.add(fx.halo);
  fx.loup=new THREE.Sprite(M.loup);fx.loup.visible=false;fx.loup.renderOrder=6;fx.loup.center.set(.5,0);scene.add(fx.loup);
  FORET.loup={t:7,on:false,age:0,roc:null};
  return fx;}
const FOR_V=new THREE.Vector3(),FOR_V2=new THREE.Vector3(),FOR_M4=new THREE.Matrix4();
function foretFxCache(){const fx=FORET.fx;if(!fx.pap||!fx.on)return;fx.on=false;fx.pap.visible=fx.luc.visible=fx.fol.visible=fx.lune.visible=fx.halo.visible=fx.loup.visible=false;if(ABE.g)ABE.g.visible=false;
  if(FORET.amb){try{FORET.amb.stop(.8);}catch(e){}FORET.amb=null;}}
/* LA BOUCLE DE LA FORÊT (chaque image, après la caméra, juste avant le rendu) */
function foretTick(dt){
  const on=!!FORET.root&&!!LVL.cur&&LVL.cur.id==='foret'&&!PARK.on;
  if(!on){foretFxCache();return;}
  const fx=foretFx(),U=FOR_U,c=FORET.cur||(foretMeteo(FORET.met,.01),FORET.cur),M=FORET.mats;fx.on=true;
  const vit=!paused;foretPas(dt);if(vit)U.uTime.value+=dt;
  // LA LUMIÈRE DE LA FORÊT : l'azimut du soleil du ciel, la hauteur de la météo ; la nuit, la LUNE
  {const a=Math.atan2(SUN_DIR.x,SUN_DIR.z),el=c.el*Math.PI/180;FOR_V.set(Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el));
   U.uSunDir.value.copy(FOR_V).lerp(FOR_V2.copy(FOR_LUNE).setY(Math.max(.45,FOR_LUNE.y)).normalize(),c.lune).normalize();}
  U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize().negate();
  U.uCam.value.copy(camera.position);
  {const cg=carGroup;U.uCarP.value.copy(cg.position);U.uCarF.value.set(0,0,1).applyQuaternion(cg.quaternion);}
  U.uPhare.value=c.phare*(mode==='boom'||!carGroup.visible?0:1);U.uFlash.value=(LVL.cur&&LVL.cur.orage)?(CAMP_FLASH||0):0;U.uWet.value=LVL.pluie;
  U.uHante.value=c.hante;U.uMistK.value=c.mist*(FORET.dz?FORET.dz.brume.k:1);U.uMistC.value.setRGB(c.mC[0],c.mC[1],c.mC[2]);if(scene.fog)U.uMistC.value.lerp(scene.fog.color,.25);
  {const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1))));const y9=pts[i]?pts[i].y:0;U.uMistY.value+=(y9-U.uMistY.value)*Math.min(1,dt*2+(FORET.yRaz?1:0));FORET.yRaz=false;}
  U.uLeafT.value.set(c.leaf[0],c.leaf[1],c.leaf[2]);if(FORET.dz){const l9=FORET.dz.sais.leaf;U.uLeafT.value.x*=l9[0];U.uLeafT.value.y*=l9[1];U.uLeafT.value.z*=l9[2];} /* (LE DÉCOR AU HASARD) LA SAISON */U.uRos.value=c.ros;U.uVent.value=c.vent;U.uRay.value=c.ray*(1-LVL.pluie);U.uPap.value=c.pap;U.uLuc.value=c.luc;U.uPol.value=c.pol;U.uLune.value=c.lune;
  U.uPx.value=renderer.getPixelRatio();M.arb.uniforms.uFen.value=Math.min(1,c.hante*1.1+(FORET.met==='soir'?.55:0));
  M.pap.uniforms.uBat.value=c.hante>.4?c.hante:0;
  // la boîte des papillons : 65 m devant la caisse ; celle des lucioles : plus loin, plus bas, dans la vallée
  {const f=U.uCarF.value,p=U.uCarP.value;U.uBoxC.value.set(p.x+f.x*65,p.y+3,p.z+f.z*65);}
  fx.pap.visible=(c.pap>.01||c.hante>.4)&&!(PAL_B9('papillons',1)<.5);
  fx.luc.visible=c.luc>.01||c.pol>.01;if(fx.luc.visible){const f=U.uCarF.value,p=U.uCarP.value;M.luc.uniforms.uBoxL.value.set(p.x+f.x*90,p.y-18,p.z+f.z*90);}
  foretAbeilles(dt,c);
  if(FORET.solM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of FORET.solM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+40;if(m.visible!==v)m.visible=v;}}
  if(FORET.rayons)FORET.rayons.visible=U.uRay.value>.01;if(FORET.brume)FORET.brume.visible=c.mist>.01;if(FORET.yeux)FORET.yeux.visible=c.hante>.02;
  foretFollets(dt,c,fx);foretLuneTick(c,fx);foretLoupTick(dt,c,fx);
  if(vit)foretSons(dt,c);
}
/* (2026-10-17, Léo : « dans la forêt noire, le matin et la journée, qu'on croise deux-trois ABEILLES ») LES ABEILLES : trois petites abeilles EN
   CUBES (comme les arbres) — tête noire, corselet roux, abdomen rayé jaune et noir, dard, deux ailes de verre qui battent — qui naissent devant,
   à 70-150 m, sur un côté de la route, à 1,5-4 m de haut, et la TRAVERSENT en butinant (elles ondulent, montent, descendent), puis reviennent
   plus loin. Le matin et à midi, jamais sous la pluie. Le programme des arbres (M.arb, maillage simple : déjà compilé au menu) ; 9 petits
   maillages. Frôlée : `sfx('foret.abeille')` (le bourdonnement — à cuire par la session SON). */
const ABE={g:null,L:[]};
/* (2026-10-18, débogage NaN) ABEBOITE : la boîte des ABEILLES, par son centre et sa taille. Elle s'appelait fbBoite, comme celle de la CHAUMIÈRE (par ses coins) : deux déclarations du même nom dans la même portée, la DERNIÈRE gagne en silence — depuis le 17/10 la chaumière appelait celle-ci, ses murs sortaient en NaN (THREE : « Computed radius is NaN ») et il n'en restait que le toit. */
function abeBoite(K,c,sz,col,part){const h=[sz[0]/2,sz[1]/2,sz[2]/2];
  for(let a=0;a<3;a++)for(const sg of [-1,1]){const n=[0,0,0];n[a]=sg;const u=(a+1)%3,v=(a+2)%3,V9=[];
    for(const q of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[c[0],c[1],c[2]];p[a]+=sg*h[a];p[u]+=q[0]*h[u];p[v]+=q[1]*h[v];V9.push(fbV(K,p[0],p[1],p[2],n[0],n[1],n[2],[part,.9,0,0],col,[5,0]));}
    if(sg>0)K.I.push(V9[0],V9[1],V9[2],V9[0],V9[2],V9[3]);else K.I.push(V9[0],V9[2],V9[1],V9[0],V9[3],V9[2]);}}
function foretAbeilles(dt,c){
  const veut=(FORET.met==='matin'||FORET.met==='midi')&&!(LVL.pluie>.05)&&FORET.pel!==undefined;
  if(!veut){if(ABE.g)ABE.g.visible=false;return;}
  if(!ABE.g){const M=FORET.mats,K=fbNew(),W=fbNew(),noir=[.05,.045,.04],jaune=[.95,.72,.07];
    abeBoite(K,[0,0,.44],[.34,.32,.3],noir,3);abeBoite(K,[0,0,.14],[.42,.4,.36],[.42,.25,.06],3);
    abeBoite(K,[0,-.01,-.16],[.46,.42,.24],jaune,3);abeBoite(K,[0,-.02,-.38],[.44,.4,.22],noir,3);abeBoite(K,[0,-.03,-.58],[.36,.32,.2],jaune,3);abeBoite(K,[0,-.04,-.74],[.14,.14,.14],noir,3);
    abeBoite(K,[.13,.06,.56],[.1,.1,.06],[.02,.02,.02],3);abeBoite(K,[-.13,.06,.56],[.1,.1,.06],[.02,.02,.02],3); // les yeux
    abeBoite(W,[.3,0,0],[.6,.025,.3],[.86,.92,1.],3);const W2=fbNew();abeBoite(W2,[-.3,0,0],[.6,.025,.3],[.86,.92,1.],3); // (l'aile gauche bâtie en miroir : une échelle négative retournerait ses faces)
    const gC=fbGeo(K),gW=fbGeo(W),gW2=fbGeo(W2);ABE.g=new THREE.Group();ABE.g.name='forêt abeilles';scene.add(ABE.g);
    for(let k=0;k<3;k++){const b=new THREE.Group(),co=new THREE.Mesh(gC,M.arb),a1=new THREE.Mesh(gW,M.arb),a2=new THREE.Mesh(gW2,M.arb);
      a1.position.set(.12,.2,.14);a2.position.set(-.12,.2,.14);b.add(co,a1,a2);b.scale.setScalar(1.6);b.visible=false;ABE.g.add(b);
      ABE.L.push({b:b,a1:a1,a2:a2,on:false,att:1.5+k*3.2,p:new THREE.Vector3(),v:new THREE.Vector3(),o:new THREE.Vector3(),t:0,ph:k*2.1,fr:false});}}
  ABE.g.visible=true;
  if(paused)return;
  const ds=L/Math.max(1,NP-1),iC=Math.round(s/ds),cp=carGroup.position;
  for(const e of ABE.L){
    if(!e.on){e.att-=dt;if(e.att>0)continue;
      const i=Math.min(NP-2,iC+Math.round((70+Math.random()*80)/ds));if(i>=NP-2){e.att=2;continue;}
      const t=T[i],hl=Math.hypot(t.x,t.z)||1,lx=-t.z/hl,lz=t.x/hl,sd=Math.random()<.5?-1:1,off=ROAD_HALF*(.4+Math.random()*.5)+4,sp=3.2+Math.random()*2;
      e.o.set(pts[i].x+lx*sd*off,pts[i].y+1.5+Math.random()*2.5,pts[i].z+lz*sd*off);e.v.set(-lx*sd*sp,0,-lz*sd*sp).addScaledVector(t,(Math.random()-.5)*1.5);
      e.t=0;e.on=true;e.fr=false;e.dur=(2*off)/sp+1.5;e.b.visible=true;}
    e.t+=dt;const w=e.t;
    e.p.copy(e.o).addScaledVector(e.v,w);e.p.y+=Math.sin(w*2.6+e.ph)*.45+Math.sin(w*7.1+e.ph)*.12;
    e.p.x+=Math.sin(w*1.7+e.ph*1.3)*.7;e.p.z+=Math.cos(w*1.9+e.ph)*.7;
    e.b.position.copy(e.p);FOR_V.copy(e.p).add(e.v);FOR_V.y=e.p.y;e.b.lookAt(FOR_V);e.b.rotateZ(Math.sin(w*3.+e.ph)*.25);
    const f=Math.sin(w*170.)*.75;e.a1.rotation.z=f;e.a2.rotation.z=-f;
    const d=e.p.distanceTo(cp);if(!e.fr&&d<10){e.fr=true;typeof sfx==='function'&&sfx('foret.abeille');}
    const der=(e.p.x-cp.x)*carFwdX()+(e.p.z-cp.z)*carFwdZ();
    if(e.t>e.dur||der<-25){e.on=false;e.b.visible=false;e.att=3+Math.random()*7;}}}
window.dbgAbeilles=function(k,d){ // (banc) () relance les trois abeilles tout de suite · ('vue',d) : en pause, l'objectif à d m de la 1re abeille en vol, UNE image
  if(k==='vue'){const e=ABE.L.find(function(x){return x.on;});if(!e)return 'aucune en vol';if(started&&!gameOver&&!paused)togglePause();
    const p=e.b.position;camera.position.set(p.x+(d||3.2)*.8,p.y+(d||3.2)*.35,p.z+(d||3.2)*.6);camera.lookAt(p);camera.updateMatrixWorld();
    if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return [Math.round(p.x),Math.round(p.y),Math.round(p.z)];}
  for(const e of ABE.L){e.att=0;e.on=false;}return ABE.L.map(function(e){return [e.on,+e.att.toFixed(1)];});};
function carFwdX(){return FOR_U.uCarF.value.x;}function carFwdZ(){return FOR_U.uCarF.value.z;}
/* LES FEUX FOLLETS : ils naissent devant, sur les côtés de la route, flottent, et FUIENT quand la caisse arrive */
function foretFollets(dt,c,fx){
  const on=c.hante>.05&&started&&!gameOver;fx.fol.visible=on;if(!on)return;
  const A=fx.fol.instanceMatrix.array,p0=FOR_U.uCarP.value,f=FOR_U.uCarF.value,t=FOR_U.uTime.value;
  for(let k=0;k<fx.folL.length;k++){const o=fx.folL[k];
    if(o.vie<=0){const s9=Math.min(L-20,s+130+Math.random()*320),i=Math.round(s9/L*(NP-1)),tt=T[i],hl=Math.hypot(tt.x,tt.z)||1,sd=Math.random()<.5?-1:1,lat=ROAD_HALF+6+Math.random()*70;
      o.p.set(pts[i].x-tt.z/hl*sd*lat,pts[i].y-14+Math.random()*24,pts[i].z+tt.x/hl*sd*lat);o.v.set(0,0,0);o.vie=14+Math.random()*10;o.a=0;o.fuit=false;}
    o.vie-=dt;FOR_V.subVectors(o.p,p0);const d=FOR_V.length();
    if(d<48&&!o.fuit){o.fuit=true;o.v.copy(FOR_V).setY(Math.abs(FOR_V.y)+8).normalize().multiplyScalar(26);}
    if(FOR_V.dot(f)<-40)o.vie=0;
    o.p.x+=(o.v.x+Math.sin(t*.7+o.ph)*2.2)*dt;o.p.y+=(o.v.y+Math.sin(t*1.3+o.ph*2)*1.1)*dt;o.p.z+=(o.v.z+Math.cos(t*.6+o.ph)*2.2)*dt;
    o.a=o.fuit?Math.max(0,o.a-dt*.9):Math.min(1,o.a+dt*.6);if(o.fuit&&o.a<=0)o.vie=0;
    const sc=Math.max(.001,o.a);FOR_M4.makeScale(sc,sc,sc).setPosition(o.p);FOR_M4.toArray(A,k*16);}
  fx.fol.instanceMatrix.needsUpdate=true;}
/* LA LUNE : un disque énorme et pâle, là où le ciel la pose (FOR_LUNE), au-dessus des arbres */
function foretLuneTick(c,fx){const op=c.lune*(1-LVL.pluie)*(1-(LVL.cur&&LVL.cur.orage?1:0));fx.lune.visible=op>.01;if(!fx.lune.visible)return;
  fx.lune.position.copy(camera.position).addScaledVector(FOR_LUNE,5200);fx.lune.scale.setScalar(5200*.30);fx.lune.material.opacity=op;}
/* LE LOUP-GAROU : toutes les 26-48 s la nuit (et sous l'orage), sur le prochain ROCHER devant (entre 260 et 900 m), il se dresse en ombre
   chinoise devant un halo de lune, HURLE (le son vient de son côté), puis s'efface dans les arbres. */
function foretLoupTick(dt,c,fx){const W=FORET.loup;if(!W)return;
  if(c.hante<.45||!started||gameOver){if(W.on){W.on=false;}fx.loup.visible=fx.halo.visible=false;return;}
  if(!paused)W.t-=dt;
  if(W.t<=0&&!W.on){W.t=26+Math.random()*22;let r=null;for(const q of FORET.rocs){const sq=q.i/(NP-1)*L-s;if(sq>260&&sq<900){r=q;break;}}
    if(r){W.on=true;W.age=0;W.roc=r;}foretLoupCri(r);}
  if(!W.on){fx.loup.visible=fx.halo.visible=false;return;}
  if(!paused)W.age+=dt;const a=THREE.MathUtils.smoothstep(W.age,0,.7)*(1-THREE.MathUtils.smoothstep(W.age,6.2,7.4));if(W.age>7.4){W.on=false;}
  const r=W.roc,top=r.top-2;fx.loup.visible=fx.halo.visible=a>.01;
  fx.loup.position.set(r.x,top,r.z);fx.loup.scale.set(15*Math.max(1,r.sxz*.8),30*Math.max(1,r.sxz*.8),1);fx.loup.material.opacity=a;
  FOR_V.subVectors(fx.loup.position,camera.position).normalize();fx.halo.position.set(r.x,top+16,r.z).addScaledVector(FOR_V,14);fx.halo.scale.setScalar(95);fx.halo.material.opacity=a*.55*(1-LVL.pluie*.6);
  fx.loup.position.y+=Math.sin(W.age*1.7)*.3;}
function foretLoupCri(r){ // le hurlement : du côté du rocher (ou d'un côté au hasard s'il n'y en a pas devant)
  let pan=Math.random()*1.4-.7,vol=-6;
  if(r){FOR_V.set(r.x,r.top,r.z).sub(camera.position);const d=FOR_V.length();FOR_V2.set(1,0,0).applyQuaternion(camera.quaternion);pan=Math.max(-.9,Math.min(.9,FOR_V.normalize().dot(FOR_V2)*1.2));vol=-3-Math.min(9,d/120);}
  try{if(typeof sfx==='function')sfx('foret.loup',{vol:vol,pan:pan});}catch(e){}}
/* LES VOIX DE LA FORÊT : des cris épars selon l'heure (jamais une nappe de souffle par-dessus la musique : voir NUAGES_AMB) */
const FOR_SONS={jour:[['foret.oiseau',1.8,4.8,-15],['foret.pic',16,30,-17]],soir:[['foret.oiseau',3.5,8,-18],['foret.chouette',16,28,-16]],
  nuit:[['foret.chouette',9,17,-13],['foret.corbeau',13,26,-16],['foret.craque',8,16,-15]],pluie:[['foret.corbeau',18,32,-18],['foret.oiseau',9,18,-21]],orage:[['foret.corbeau',10,22,-15],['foret.craque',9,18,-15]]};
function foretSons(dt,c){
  const ok=SONV2&&started&&running&&!gameOver&&!garageOn&&mode!=='boom',L9=FOR_SONS[c.sons]||FOR_SONS.jour,T9=FORET.son;
  if(!ok){if(FORET.amb){try{FORET.amb.stop(.6);}catch(e){}FORET.amb=null;}return;}
  T9.k=T9.k||{};for(const e of L9){if(T9.k[e[0]]==null)T9.k[e[0]]=e[1]*Math.random();T9.k[e[0]]-=dt;if(T9.k[e[0]]<=0){T9.k[e[0]]=e[1]+Math.random()*(e[2]-e[1]);try{sfx(e[0],{vol:e[3],pan:Math.random()*1.6-.8});}catch(x){}}}
  const amb=c.hante>.5?'foret.nuitAmb':'foret.jourAmb';
  if(FORET.amb&&FORET.ambId!==amb){try{FORET.amb.stop(1.2);}catch(e){}FORET.amb=null;}
  if(!FORET.amb&&performance.now()>(FORET.ambT||0)){FORET.ambT=performance.now()+900;try{FORET.amb=sfx(amb,{loop:true,vol:-24});FORET.ambId=amb;}catch(e){FORET.amb=null;}}}
/* ---------------- EN VOL : CE QUI TUE ---------------- */
function foretHeurt(p){
  if(!FORET.root||!FORET.sol)return '';const G=FORET.gcol;
  if(G){const a=G.G.get(Math.floor(p.x/G.CG)+','+Math.floor(p.z/G.CG));
    if(a)for(let j=0;j<a.length;j++){const c=a[j];
      if(c.g){const ax=c.a[0],ay=c.a[1],az=c.a[2],bx=c.b[0]-ax,by=c.b[1]-ay,bz=c.b[2]-az,l2=bx*bx+by*by+bz*bz;let u=l2>0?((p.x-ax)*bx+(p.y-ay)*by+(p.z-az)*bz)/l2:0;u=Math.max(0,Math.min(1,u));
        const dx=p.x-ax-bx*u,dy=p.y-ay-by*u,dz=p.z-az-bz*u;if(dx*dx+dy*dy+dz*dz<(c.r+1.2)*(c.r+1.2))return 'arbre';}
      else{const dx=p.x-c.a[0],dy=p.y-c.a[1],dz=p.z-c.a[2];if(dx*dx+dy*dy+dz*dz<c.r*c.r)return 'arbre';}}}
  const S=FORET.sol;if(p.x<S.x0||p.z<S.z0||p.x>S.x0+S.nx*S.C||p.z>S.z0+S.nz*S.C)return '';
  if(p.y<solH(p.x,p.z)+1.2)return 'sousbois';
  if(p.y<canH(p.x,p.z))return 'arbre';
  return '';}
/* ---------------- LA CHAUFFE AU MENU : chaque matière compilée et dessinée une fois hors écran (0 programme en course) ---------------- */
function foretChauffe(){
  const M=foretMats(),PT=foretProtos(),fx=foretFx(),L9=[];
  const pr=PT.esp.hetre[1].g,g1=new THREE.BufferGeometry();for(const k in pr.attributes)g1.setAttribute(k,pr.attributes[k]);g1.setIndex(pr.index);g1.setAttribute('aI',new THREE.InstancedBufferAttribute(new Float32Array(4),4));
  const i1=new THREE.InstancedMesh(g1,M.arb,1);i1.setMatrixAt(0,new THREE.Matrix4());L9.push(i1);L9.push(new THREE.Mesh(pr,M.arb));
  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));g.setAttribute('aS',new THREE.Float32BufferAttribute(new Float32Array(12),4));L9.push(new THREE.Mesh(g,M.sol));
   const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g2.setAttribute('aU',new THREE.Float32BufferAttribute(new Float32Array(6),2));L9.push(new THREE.Mesh(g2,M.eau));}
  {const g=forCroixGeo(false).clone();g.setAttribute('aF',new THREE.InstancedBufferAttribute(new Float32Array([5,1,1,0]),4));const im=new THREE.InstancedMesh(g,M.fleur,1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);}
  {const g=new THREE.InstancedBufferGeometry();const pl=new THREE.PlaneGeometry(1,1);g.index=pl.index;g.setAttribute('position',pl.attributes.position);g.setAttribute('aR',new THREE.InstancedBufferAttribute(new Float32Array(4),4));g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(2),2));g.instanceCount=1;L9.push(new THREE.Mesh(g,M.ray));}
  {const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),M.brume,1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);}
  for(const o of L9)o.frustumCulled=false;
  const vus=[[fx.pap,fx.pap.visible],[fx.luc,fx.luc.visible],[fx.fol,fx.fol.visible],[fx.lune,fx.lune.visible],[fx.halo,fx.halo.visible],[fx.loup,fx.loup.visible]];
  for(const v of vus)v[0].visible=true;
  const g=new THREE.Group();for(const o of L9)g.add(o);scene.add(g);
  try{chauffeRendu([g,fx.pap,fx.luc,fx.fol,fx.lune,fx.halo,fx.loup]);}finally{scene.remove(g);for(const v of vus)v[0].visible=v[1];}
  for(const t of [M.fleur.uniforms.uTex.value,M.pap.uniforms.uTex.value,M.lune.map,M.loup.map])try{renderer.initTexture(t);}catch(e){}
}
/* ---------------- LA CONSOLE ---------------- */
window.dbgForet=function(k,o){
  if(k==='meteo'){foretMeteo(o||'nuit',.01);return FORET.met;}
  if(k==='regle'){if(!FORET.root)return null;const ds=L/(NP-1),st=Math.max(1,Math.round(4/ds)),V9=new THREE.Vector3();let n=0,t=0;const ex=[]; /* (2026-10-20, banc) LA RÈGLE D'OR : rien du décor sur la route — la caisse posée tous les 4 m, à 5 places de la largeur, à 1,5 et 4 m */
    for(let i=Math.round(30/ds);i<NP-Math.round(30/ds);i+=st)for(const f of [-.95,-.5,0,.5,.95])for(const h of [1.5,4]){V9.copy(pts[i]).addScaledVector(B[i],f*ROAD_HALF).addScaledVector(Nn[i],h);t++;const r=foretHeurt(V9);if(r){n++;if(ex.length<6)ex.push([Math.round(i*ds),f,h,r]);}}
    return {essais:t,heurts:n,ex:ex};}
  if(k==='heurt'&&o){FOR_V2.set(o[0],o[1],o[2]);return FORET.root?foretHeurt(FOR_V2):'';} // (la PELOTE, banc des sauts) ce point de l'air tue-t-il ?
  if(k==='loup'){if(FORET.loup)FORET.loup.t=0;return FORET.rocs.length+' rochers';}
  if(k==='rideaux'){const R={n:0,dedans:0,pire:0,ex:[]},ds=L/(NP-1); // (banc, la pelote sous les pleureurs) une route passe-t-elle DANS la couronne d'un géant pleureur (du bas des rideaux à la cime) ?
    for(const g of FORET.geants){const P=FOR_PLEUR_VOL[g.spV];if(g.vide)R.vides=(R.vides||0)+1;if(!P||g.vide)continue;R.n++;const rh=(P.r+8)*g.sxz+ROAD_HALF,y0=g.y+P.bas*g.sy-4,y1=g.y+P.h*g.sy;let pi=0;
      for(let i=0;i<NP;i+=2){const q=pts[i];if(q.y<y0||q.y>y1)continue;if(Math.hypot(q.x-g.x,q.z-g.z)<rh)pi=Math.max(pi,q.y-y0);}
      if(pi>0){R.dedans++;R.pire=Math.max(R.pire,Math.round(pi));if(R.ex.length<6)R.ex.push([g.sp,g.spV,+g.sy.toFixed(2),Math.round(pi),Math.round(g.i*ds)]);}}
    return R;}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);foretTick(0);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'geant' = le prochain géant devant (o.d m avant lui, o.h m de haut) · 'loup' = le rocher du loup, le loup dressé · 'arche' */
  if(k==='geant'||k==='rocher'||k==='arche'){const ds=L/(NP-1),d=(o&&o.d)||70,h=(o&&o.h)||7;let i=-1,cible=null;
    if(k==='geant'){for(const g of FORET.geants)if(g.i*ds>s+60){i=g.i;cible=[g.x,pts[g.i].y+(o&&o.y!=null?o.y:28),g.z];break;}}
    else if(k==='rocher'){for(const r of FORET.rocs)if(r.i*ds>s+60){i=r.i;cible=[r.x,r.top+10,r.z];if(FORET.loup){FORET.loup.on=true;FORET.loup.age=2;FORET.loup.roc=r;}break;}}
    else if(FORET.arche.length){const c=FORET.arche[0].c;let bd=1e18;for(let j=0;j<NP;j+=4){const q=pts[j].distanceToSquared(c);if(q<bd){bd=q;i=j;}}cible=[c.x,c.y-12,c.z];}
    if(i<0)return 'rien devant';const j=Math.max(0,i-Math.round(d/ds)),p=pts[j];foretTick(0);
    return window.dbgForet('vue',{p:[p.x,p.y+h,p.z],c:cible,fov:o&&o.fov});}
  if(k==='toiles'){foretMats();const o9={};for(const n of ['fl','ai','lu','lg']){const t=FORET.tex[n],im=t&&t.image;o9[n]=im&&im.width?im.toDataURL('image/png'):null;}return o9;}
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='coupe'){for(const F of FORET.fam)F.coupe=!!o;FORET.sig=0;return 'familles '+(o?'coupées':'rendues');}
  if(k==='flanc'){if(!FORET.sol)return null;const st=Math.max(1,Math.round(20/(L/(NP-1)))),P9=[];let pire=1e9,ou=0,n20=0; // (le FLANC) le tracé échantillonné + la marge route/sol (la route n'est jamais sous le versant)
    for(let i=0;i<NP;i+=st){const p=pts[i],t=T[i],m=p.y-solH(p.x,p.z);if(m<pire){pire=m;ou=i;}if(m<20)n20++;P9.push([+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1),+t.x.toFixed(3),+t.z.toFixed(3)]);}
    return {amont:FORET.amont,L:Math.round(L),pts:P9,marge:{min:Math.round(pire),s:Math.round(ou*L/(NP-1)),sous20:n20},n:FORET.n,ms:FORET.ms,msSol:FORET.msSol};}
  const tri=FORET.fam.reduce(function(a,F){return a+F.tri*F.im.count;},0),parFam={};for(const F of FORET.fam)if(F.im.count)parFam[F.nom||'?']=[F.im.count,Math.round(F.tri*F.im.count/1000)+'k'];
  return {on:!!FORET.root,deco:FORET.deco||null,mods:FORET.pel&&FORET.pel.mk||null,met:FORET.met,ms:FORET.ms,msSol:FORET.msSol,protos:FORET.protos&&FORET.protos.ms,n:FORET.n,pel:FORET.pel,axe:FORET.axe!=null?Math.round(FORET.axe*57.3):null,plan:FORET.plan||null,noeuds:(FORET.noeuds||[]).map(function(o){return [Math.round(o.c[0]),Math.round(o.c[1]),o.t];}),tri:Math.round(tri),fam:FORET.fam.filter(function(F){return F.im.visible;}).length,
    tri9:{ms:FT.n?+(FT.ms/FT.n).toFixed(3):0,maj:FT.up},cur:FORET.cur&&{hante:+FORET.cur.hante.toFixed(2),pap:+FORET.cur.pap.toFixed(2),ray:+FORET.cur.ray.toFixed(2)},
    loup:FORET.loup&&{t:+FORET.loup.t.toFixed(1),on:FORET.loup.on},geants:FORET.geants.length,col:FORET.gcol&&FORET.gcol.n,parFam:parFam};};
function PAL_B9(k,d){try{return (typeof PAL!=='undefined'&&PAL&&typeof PAL.b==='function')?PAL.b(k,d):d;}catch(e){return d;}} // les paliers d'optimisation (PAL), s'ils existent

/* <<<FIN FORET>>> */
