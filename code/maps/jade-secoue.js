/* ===== JADE : LE CROCHET DES MODULES (2026-11-12, banc) =====
   (Ce morceau portait la route sous la mer — jadeNoie, la piste coupée à la ligne d'eau. Sacha : « plus de mer dans les pics de jade », puis « j'en veux plus » : retirée.)
   `dbgJadeMods()` : les modules de la vallée, la vrille, les pics posés (JADE.pose), la descente, les sections des modules (MODS) ;
   `dbgJadeMods(s)` : les montagnes au droit de la route à l'abscisse s (leur rang dans JADE.col.P, leur cercle, pied, sommet, distance de pose q[8]) et les autres passages de la route tout près.
   `?jmod=plongee,vrille,…` impose les premiers modules, `?asc=1` l'ascension, `?sans=jadefun` rend la vallée d'avant. */
/* (2026-11-12, L'ENDROIT ET L'ENVERS) LE SAUT REFUSÉ TÊTE EN BAS : sur Jade (pas de TORD.on : le vol garde le haut du monde), décoller d'une dalle qui regarde vers le bas
   (le retournement, le milieu de la vrille), c'est partir vers le vide — refusé comme sous la dalle (veqSaut, frEnvol). */
function jadeEnversRefuse(){if(!JADE.root||!LVL.cur||LVL.cur.piste!=='jade'||TORD.on||!(NP>1))return false; /* REGARD DEVANT (mesuré au banc : 4 sauts sur 4 partis juste AVANT le retournement finissaient dans le vide — en l'air, la caisse ne se pose pas sur une route qui s'est retournée sous elle) : refusé si la dalle regarde vers le bas n'importe où sur la distance d'un vol : 4 s, 200 m au moins — sur une descente de 20 à 40 %, la route fuit sous la caisse et un saut dure 3 à 4 s (t ≈ 2 (v_saut + pente · v) / g) */
  const ds=L/(NP-1),i0=Math.max(0,Math.round((s-20)/ds)),i1=Math.min(NP-1,Math.round((s+Math.max(200,4*Math.abs(vA)*SPD))/ds));for(let i=i0;i<=i1;i+=2)if(Nn[i].y<.5)return true;return false;}
window.dbgJadeMods=function(s9){const ds=L/Math.max(1,NP-1);
  if(typeof s9==='number'&&JADE.col){const i=Math.max(0,Math.min(NP-1,Math.round(s9/ds))),p=pts[i],o=[];
    for(let k=0;k<JADE.col.P.length;k++){const q=JADE.col.P[k],d=Math.hypot(q[0]-p.x,q[1]-p.z);if(d<q[2]+ROAD_HALF+5&&p.y>q[3]-30&&p.y<q[4]+30)o.push({k:k,x:Math.round(q[0]),z:Math.round(q[1]),r:Math.round(q[2]),pied:Math.round(q[3]),sommet:Math.round(q[4]),tpl:q[5],dR:Math.round(q[8]),d:Math.round(d),dans:jadePilierDans(q,p.x,p.y+1.5,p.z)});}
    let lo=1e9,hi=-1e9;const et=[];for(let j=0;j<NP;j+=4){const a9=pts[j];if(Math.hypot(a9.x-p.x,a9.z-p.z)<150){lo=Math.min(lo,a9.y);hi=Math.max(hi,a9.y);if(!et.length||Math.abs(j*ds-et[et.length-1][0])>60)et.push([Math.round(j*ds),Math.round(a9.y)]);}}
    return {p:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],montagnes:o,routeProche:{lo:Math.round(lo),hi:Math.round(hi),passages:et},pose:(JADE.pose||[]).map(function(q){return {c:q.c||0,x:Math.round(q.x),z:Math.round(q.z),y:Math.round(q.y),R:q.R?Math.round(q.R):0,h:Math.round(q.h),bas:q.bas};})};}
  let env=0,bas=1e9,haut=-1e9,yMin=1e9;
  if(JADE.root&&isFinite(JADE.eauY))for(let i=0;i<NP;i+=2){const d=pts[i].y-JADE.eauY;if(d<bas)bas=d;if(d>haut)haut=d;if(pts[i].y<yMin)yMin=pts[i].y;if(Nn[i].y<0)env+=2;}
  const centres=(JADE.pose||[]).filter(function(o){return o.c;}).map(function(o){let bd=1e9,bq=null;for(const q of (JADE.col&&JADE.col.P)||[]){const d=Math.hypot(q[0]-o.x,q[1]-o.z);if(d<bd){bd=d;bq=q;}}
    return bq?{ecart:Math.round(bd),rayon:Math.round(bq[2]),R:Math.round(o.R),sommet:Math.round(bq[4]-o.y),pied:Math.round(bq[3]-o.y)}:null;}); /* le pic au centre de chaque tour : son écart au centre voulu, son rayon contre celui du tour, son sommet et son pied comptés depuis la route */
  return {centres:centres,mods:JADE.mk||null,vrille:JADE.vrille||null,pose:JADE.pose?JADE.pose.length:0,poses:JADE.posees||0,renversees:JADE.col?JADE.col.P.filter(function(q){return q.inv;}).length:0,pontSaute:JADE.pontSaute||0,lev:JADE.lev?JADE.lev.length:0,desc:JADE.desc,
    descente:NP>1&&yMin<1e9?Math.round(pts[0].y-yMin):0,eauY:JADE.root?Math.round(JADE.eauY):null,sousEauM:0,aLEnversM:Math.round(env*ds),plusBas:Math.round(bas),plusHaut:Math.round(haut),L:Math.round(L),
    mods9:(typeof MODS!=='undefined'&&MODS||[]).map(function(m){return [Math.round(m.s0),Math.round(m.s1),m.fig||''];})};};
/* (2026-11-12, banc) `dbgUniformes()` : les matières de la scène (et le ciel) dont le programme lit un uniforme que la matière ne fournit pas — la cause d'un « needsUpdate of undefined » dans three, l'écran noir */
window.dbgUniformes=function(){const out=[],vus=new Set();const voir=function(o,m){if(!m||vus.has(m))return;vus.add(m);const p=renderer.properties.get(m),pr=p&&p.currentProgram;if(!pr||!m.uniforms)return;
    const manque=pr.getUniforms().seq.map(function(u){return u.id;}).filter(function(id){return !(id in m.uniforms)&&!/^(modelMatrix|modelViewMatrix|projectionMatrix|viewMatrix|normalMatrix|cameraPosition|isOrthographic|logDepthBufFC|bindMatrix|bindMatrixInverse|boneTexture|boneTextureSize|toneMappingExposure)$/.test(id);}); /* sans les matrices que three fournit lui-même */if(manque.length)out.push({objet:o.name||o.type,matiere:m.type,manque:manque.slice(0,6)});};
  scene.traverse(function(o){const L9=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of L9)voir(o,m);});
  if(typeof skyDome!=='undefined'&&skyDome)voir(skyDome,skyDome.material);return out;};

/* (2026-11-13, banc) `dbgJadeProx()` : LA ROUTE ET SES PICS — tous les 15 m de route, la distance au pic le plus proche (bord du gabarit, à la hauteur de la route ± 12 m) :
   frole = part de la route à moins de 14 m d'un pic · vide = le plus long tronçon sans pic à moins de 28 m · droite = part de la route dont le cap change de moins de 6° sur ±60 m · droiteMax = la plus longue de ces droites (m) */
window.dbgJadeProx=function(){if(!JADE.col||!(NP>1))return null;const ds=L/(NP-1),P=JADE.col.P,pas=Math.max(1,Math.round(15/ds)),k9=Math.max(1,Math.round(60/ds));
  let tot=0,fr=0,vc=0,vm=0,dt=0,dc=0,dm=0,d0=0;const runs=[];
  for(let i=k9;i<NP-k9;i+=pas){const p=pts[i];let bd=1e9;
    for(const q of P){const dx=q[0]-p.x,dz=q[1]-p.z;if(dx>260||dx<-260||dz>260||dz<-260||p.y<q[3]-12||p.y>q[4]+12)continue;const d=Math.hypot(dx,dz)-q[2]-ROAD_HALF;if(d<bd)bd=d;}
    tot++;if(bd<14)fr++;if(bd<28)vc=0;else{vc+=pas*ds;if(vc>vm)vm=vc;}
    const a=pts[i-k9],b=pts[i+k9],h1=Math.atan2(p.x-a.x,p.z-a.z),h2=Math.atan2(b.x-p.x,b.z-p.z),dh=Math.abs(Math.atan2(Math.sin(h2-h1),Math.cos(h2-h1)));
    if(dh<.105){dt++;if(dc===0)d0=Math.round(i*ds);dc+=pas*ds;if(dc>dm)dm=dc;}else{if(dc>=150)runs.push([d0,Math.round(dc)]);dc=0;}}
  return {frole:+(fr/tot).toFixed(2),vide:Math.round(vm),droite:+(dt/tot).toFixed(2),droiteMax:Math.round(dm),pics:P.length,frol:JADE.frol||0,frolD:JADE.frolD,rase:JADE.rase||0,runs:runs};};
