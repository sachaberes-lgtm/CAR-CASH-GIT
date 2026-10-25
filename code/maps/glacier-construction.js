/* ---------------- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors de la banquise) ---------------- */
/* (v4) LA PISTE NUE : cacher la route (béton, rails, nappe, ligne, tranche) — par `material.visible` (PISTE_LOD joue sur mesh.visible) ; ce qu'on a
   caché est NOTÉ et rendu à la piste suivante (banqVide : une matière peut être reprise par la piste neuve) */
const BK_NUE=[];
function bkPisteNue(on){
  for(const m of BK_NUE)m.visible=true;BK_NUE.length=0;if(!on)return;
  const cache=m=>{if(m&&m.visible){m.visible=false;BK_NUE.push(m);}};
  for(const m of NEON_RAILS)cache(m);for(const m of NEON_GLOW)cache(m);try{cache(JADE.flank);}catch(e){}
  for(const o of trackMeshes)if(o&&o.traverse)o.traverse(function(c){const mt=c.material;if(!mt||Array.isArray(mt)||c.name==='banquise verglas')return;if((mt.userData&&mt.userData.bitume)||(LIGNE_TEX&&mt.map===LIGNE_TEX))cache(mt);});}
/* (v4) LES PICS DE LA PISTE, AU SOL : la caisse entre dans un cristal = L'IMPACT (la même animation que tous les obstacles), face = du centre du pic vers la caisse */
/* (2026-10-20, Sacha : « des fois on traverse le mur ») LE CHOC SUR UN PIC, BALAYÉ ET À LA LARGEUR DE LA CAISSE : avant, un seul point (le centre) était
   testé, à l'image courante — un pic frôlé par le flanc ne comptait pas, et à grande vitesse (2-3 m par image) la caisse enjambait l'arête d'un pic mince
   entre deux images. Désormais on teste le centre, les deux flancs, le nez et l'arrière, et chaque point à 3 étapes du chemin parcouru depuis l'image
   d'avant. `?sans=glacechoc` = avant. */
const BK_CHOC=!/[?&]sans=([^&]*,)?glacechoc(,|&|$)/.test(location.search),BK_PP={x:0,z:0,ok:false},BK_PT=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
function banqPisteHeurt(){
  if(mode!=='drive'||!BANQ.obst||!BANQ.obst.length||!banqOk()){BK_PP.ok=false;return false;}
  const P=carGroup.position;
  if(graceT>0){BK_PP.x=P.x;BK_PP.z=P.z;BK_PP.ok=true;return false;}
  const ax=BK_PP.ok?BK_PP.x:P.x,az=BK_PP.ok?BK_PP.z:P.z;BK_PP.x=P.x;BK_PP.z=P.z;BK_PP.ok=true;
  const C=CARS[level]||CARS[0],hw=BK_CHOC?C.w*.5:0,hl=BK_CHOC?C.l*.42:0,fx=F.t.x,fz=F.t.z,rx=-fz,rz=fx; /* (F.t : le sens de la route ; le travers = sa perpendiculaire) */
  const dEc=Math.hypot(P.x-ax,P.z-az),nE=BK_CHOC&&dEc>.8?Math.min(16,Math.max(3,Math.ceil(dEc/1.2))):1; /* (2026-10-23, Sacha : « je traverse un pic sans mourir ») le pas du balayage : 3 étapes fixes = 2,2 m entre deux tests à 200 m/s et 30 i/s, 3,5 m à 20 i/s — un pic mince (rayon 5 m au sol) passait entre deux ; désormais un test tous les 1,2 m, quelle que soit la cadence */
  for(const o of BANQ.obst){if(Math.abs(o.s-s)>o.r+10+(BK_CHOC?6:0))continue;
    for(const Q of o.L9){let dx=0,dz=0,hit=false;
      for(let e=1;e<=nE&&!hit;e++){const u=e/nE,cx=ax+(P.x-ax)*u,cz=az+(P.z-az)*u;
        for(let q=0;q<(BK_CHOC?5:1)&&!hit;q++){const px=cx+rx*BK_PT[q][0]*hw+fx*BK_PT[q][1]*hl,pz=cz+rz*BK_PT[q][0]*hw+fz*BK_PT[q][1]*hl,ex=px-Q.cx,ez=pz-Q.cz;
          if(ex*ex+ez*ez>Q.r2)continue;if(bkPrimH(Q,px,pz)<P.y+.35)continue;hit=true;dx=cx-Q.cx;dz=cz-Q.cz;}}
      if(!hit)continue;
      IMP.frais=-1;try{const V=IMP.d.copy(PT_U.uVc.value);let l=V.length();if(!(l>1)){V.copy(F.t);l=1;}V.multiplyScalar(1/l);IMP.v=Math.min(l,200);
        IMP.n.set(dx,0,dz);if(IMP.n.lengthSq()<1e-4)IMP.n.copy(F.t).multiplyScalar(-1);IMP.n.normalize();IMP.c.copy(P);
        IMP.s.copy(P).addScaledVector(IMP.n,-((CARS[level]||CARS[0]).w*.5+.1));IMP.test=null;IMP.mou=true;IMP.frais=performance.now();}catch(e){IMP.frais=-1;}
      shake=Math.max(shake,1.2);explode('glace');return true;}}
  return false;}
function banqVide(){
  bkPisteNue(false);BANQ.obst=[];BANQ.kick=[]; // (v4) la route revient aux autres maps ; les pics et les becs partent avec leur piste
  BANQ.sol=null;BANQ.solM=[];BANQ.pics=[];BANQ.picG=null;BANQ.picM=[];BANQ.loinM=[];BANQ.file=[];BANQ.fi=0;BANQ.msFile=0;
  if(BANQ.root){BANQ.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});BANQ.root=null;}
  BANQ.dz=null;BANQ.deco=null;BANQ.glisse=false;BANQ.pou=false;BANQ.sur=0;BANQ.mort='';BANQ.dNow=9;bkTraceVide();BANQ.verg=[];BKV.sur=false;BKV.yaw=0;BKV.gl=0;BKV.gk=0;bkSkateRaz();BKB.k=0;BKB.enf=0;BKB.dans=false;
}
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé du glacier change depuis le 19/10 (l'axe, les tronçons), pas son décor — la même glace bleue, les mêmes densités de pics,
   de séracs et d'aiguilles, l'amphithéâtre de 7 géants, les aurores vert-violet. Désormais, par piste, un TIRAGE DE DÉCOR dans un flux à lui (`dr`,
   né de la graine du décor), treize choix indépendants (`BANQ.dz`, lisible dans `dbgBanq().deco`) ; les pièces neuves se placent dans `dz2` :
   · LA GLACE (`glace`) : azur (celle d'avant), turquoise, saphir, vert d'eau, laiteuse — l'uniform uIceT multiplié (pics, géants, verglas) : mêmes programmes ;
   · LES PICS OÙ L'ON GLISSE (`pic`) : ×0,6 / 1 / 1,45 et leur hauteur ×0,8-1,3 ;
   · LES SÉRACS (`ser`) : ×0,5 / 1 / 1,8 ;
   · LES AIGUILLES (`aig`) : ×0,5 / 1 / 1,6 et leur hauteur ×0,8-1,35 ;
   · LES GÉANTS DE L'HORIZON (`gea`) : bas / avant / hauts (×0,75-1,3), plus ou moins serrés ;
   · L'AMPHITHÉÂTRE (`amph`) : 4, 7 (avant) ou 11 géants au bout de la descente, plus près ou plus loin ;
   · LE MONUMENT (`mon`, NEUF) : rien, un CIRQUE (8-14 aiguilles en couronne autour d'un vide) ou une CATHÉDRALE (3-5 flèches de 450-900 m serrées) ;
   · LES ORGUES DE GLACE (`org`, NEUF) : 0-2 rangées de colonnes fines (40-95 m) le long de la piste, à ROAD_HALF + 120-170 m ;
   · LES PORTES DE GLACE (`porte`, NEUF) : 0-3 arches en A (deux lames penchées qui se touchent) à 180-320 m de la piste ;
   · LES AURORES (`aur`) : vert-violet (avant), rose-bleu, or-vert, cyan-magenta, et leur force ×0,7-1,5 (uAurC, uAurC2, uAur) ;
   · LA BRUME DE VALLÉE (`brume`) : ×0,6 / 1 / 1,45 (uMistK) ;
   · LA POUDRE DE DIAMANT (`dd`) : ×0,4 / 1 / 2 ;
   · L'ALPENGLOW (`alp`) : ×0,5 / 1 / 1,5, rose ou orangé.
   Rien ne touche la piste : les pièces neuves passent par `libre` (5 m d'air sous la dalle et ses bords) et restent loin d'elle (bkSolD). `?sans=glacierdecor`
   = le décor d'avant, au tirage près (aucun tirage de plus dans `fr`). */
const BK_GLACES=[['azur',1.2,[1,1,1]],['turquoise',1,[.74,1.14,.92]],['saphir',1,[.72,.8,1.32]],['vert d\'eau',.8,[.86,1.2,.78]],['laiteuse',.8,[1.6,1.3,1.12]]];
const BK_AURS=[['vert-violet',1.2,[.25,1,.62],[.75,.30,1]],['rose-bleu',1,[1,.35,.72],[.3,.5,1]],['or-vert',1,[1,.82,.3],[.3,1,.5]],['cyan-magenta',1,[.2,.95,1],[1,.25,.85]]];
function bkDecoTire(seed){
  const dr=mulberry32((seed^0xDEC0B4)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  {const g=pds(BK_GLACES);D.glace=g[2];li.push('glace '+g[0]);}
  {const n=ch([.6,1,1.45]),h=.8+dr()*.5;D.pic={n:n,h:h};li.push('pics ×'+n+' h×'+h.toFixed(2));}
  D.ser=ch([.5,1,1.8]);li.push('séracs ×'+D.ser);
  {const n=ch([.5,1,1.6]),h=.8+dr()*.55;D.aig={n:n,h:h};li.push('aiguilles ×'+n+' h×'+h.toFixed(2));}
  {const g=ch([[.75,1.3,'bas'],[1,1,'comme avant'],[1.3,.85,'hauts']]);D.gea={h:g[0],pas:g[1]};li.push('géants '+g[2]);}
  {const n=ch([4,7,11]),d=ch([.8,1,1.2]);D.amph={n:n,d:d};li.push('amphithéâtre de '+n+(d<1?' (près)':d>1?' (loin)':''));}
  D.mon=pds([['rien',1],['cirque',1.2],['cathédrale',1]])[0];li.push('monument : '+D.mon);
  D.org=pds([[0,1],[1,1.2],[2,.7]])[0];li.push(D.org+' orgue'+(D.org>1?'s':'')+' de glace');
  D.porte=(dr()*4)|0;li.push(D.porte+' porte'+(D.porte>1?'s':'')+' de glace');
  {const a=pds(BK_AURS),k=ch([.7,1,1.5]);D.aur={c:a[2],c2:a[3],k:k};li.push('aurores '+a[0]+' ×'+k);}
  D.brume=ch([.6,1,1.45]);li.push('brume ×'+D.brume);
  D.dd=ch([.4,1,2]);li.push('poudre de diamant ×'+D.dd);
  {const k=ch([.5,1,1.5]),c=dr()<.5?null:[1,.55,.28];D.alp={k:k,c:c};li.push('alpenglow ×'+k+(c?' orangé':''));}
  D.li=li;return D;}
function buildBanq(seed){jadeFini(buildBanqG(seed));} // (2026-10-17, LE PRÉ-BÂTI) d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildBanqG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  banqVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='banquise'||!(NP>1))return;
  const t0=performance.now(),M=banqMats(),fr=mulberry32((seed^0xB4A9C)>>>0),ds=L/(NP-1),KP=PAL_BK('banqPics',1)*(TEL_NATIF?.85:1)*.3; /* (2026-10-25, Sacha : « réduis de 70 % les pics de glace dans la map de glace ») dômes, séracs et aiguilles : 70 % de moins */
  BANQ.graine=(seed>>>0)%100000;BANQ.met=LVL.cur.meteo||'midi';BANQ.n={};
  const DZ=BK_DECOR?bkDecoTire(seed):null,dz2=mulberry32((seed^0xB4DEC)>>>0);BANQ.dz=DZ;BANQ.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage, et le flux des pièces neuves */
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);BANQ.root=root;trackMeshes.push(root);
  const TP=BANQ.tp={},tp=k=>{const n=performance.now();TP[k]=Math.round((n-(tp.t||t0))*10)/10;tp.t=n;};
  banqSol();tp('sol');if(performance.now()>JF.lim)yield;const tS=performance.now();
  banqSolMesh(root);tp('solMesh');if(performance.now()>JF.lim)yield;
  try{bkVerglasPose(root,seed);}catch(e){window.__banqErr=e;}try{bkCongerePose(root);}catch(e){window.__banqErr=e;}tp('verglas'); /* (2026-10-18) LA CONGÈRE du bord */if(performance.now()>JF.lim)yield;
  // ---- la route en grille (les règles de distance) ----
  const HB=100,grille=new Map(),pg=Math.max(1,Math.round(3/ds)); // un point tous les 3 m : un sérac de 8 m ne passe pas entre deux
  for(let i=0;i<NP;i+=pg){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+bz+dz);if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const lat9=i=>{const t=T[i],hl=Math.hypot(t.x,t.z)||1;return [-t.z/hl,t.x/hl];};
  // une grappe ne doit JAMAIS crever la dalle, ni ses bords, ni l'air de la caméra (14 m de chaque côté) : 5 m d'air au moins
  const libre=L9=>{let cx=0,cz=0,r=0;for(const P of L9){cx+=P.cx;cz+=P.cz;}cx/=L9.length;cz/=L9.length;for(const P of L9)r=Math.max(r,Math.hypot(P.cx-cx,P.cz-cz)+P.r);
    let ok=true;const W9=ROAD_HALF+14,LAT9=[-W9,-ROAD_HALF,-ROAD_HALF*.5,0,ROAD_HALF*.5,ROAD_HALF,W9];
    if(bkSolD(cx,cz)<r+W9+90)proches(cx,cz,r+W9,function(j){ /* (loin de toute route, rien à vérifier : la distance de la grille suffit, marge 90 m) */if(!ok)return;const p=pts[j],ex=p.x-cx,ez=p.z-cz;if(ex*ex+ez*ez>(r+W9)*(r+W9))return;const l9=lat9(j);
      for(let q=0;q<7;q++){const l=LAT9[q],x=p.x+l9[0]*l,z=p.z+l9[1]*l;if((x-cx)**2+(z-cz)**2>r*r)continue;
        for(const P of L9){if((x-P.cx)**2+(z-P.cz)**2>P.r2)continue;if(bkPrimH(P,x,z)>p.y-THICK-5){ok=false;return;}}}});
    return ok;};
  const PH=[],KN={},KF={},cle=(x,z,c)=>Math.floor(x/c)*100003+Math.floor(z/c);
  const pose=(L9,phys,loin)=>{for(const P of L9){const C=loin?1500:600,k=cle(P.cx,P.cz,C),D9=loin?KF:KN;(D9[k]||(D9[k]={L:[],x:(Math.floor(P.cx/C)+.5)*C,z:(Math.floor(P.cz/C)+.5)*C,r:C*.71})).L.push(P);if(phys)PH.push(P);}};
  // ---- 1. LES PICS OÙ L'ON GLISSE : des dômes et des pyramides de glace au bord de la route (pente ≤ 1 : 45° au plus) ----
  let nG=0,nS=0,nA=0,nL=0;
  {let sd=fr()<.5?-1:1;for(let s9=380+fr()*120;s9<L-220;s9+=(105+fr()*115)/KP/(DZ?DZ.pic.n:1)){const i=Math.round(s9/ds);if(fr()<.7)sd=-sd;
    let H=(34+fr()*96)*(DZ?DZ.pic.h:1);const pente=.55+fr()*.40,nv=1+((fr()*3)|0),lat=ROAD_HALF+24+H/pente*.5+fr()*120,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    for(let e=0;e<3;e++){const L9=bkGrappe(x,z,bkSolH(x,z)-1.5,H,pente,nv,fr,0);if(libre(L9)){pose(L9,true,false);nG++;break;}H*=.68;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 2. LES SÉRACS : des éclats de glace semés sur la neige, quelques-uns SOUS la route (on les frôle en plongeant) ----
  for(let s9=300+fr()*60;s9<L-150;s9+=(44+fr()*56)/KP/(DZ?DZ.ser:1)){const i=Math.round(s9/ds),sd=fr()<.5?-1:1,sous=fr()<.25,lat=sous?fr()*ROAD_HALF:ROAD_HALF+10+fr()*170,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    const H=sous?3+fr()*7:4+fr()*13,L9=bkGrappe(x,z,bkSolH(x,z)-.8,H,.6+fr()*.55,(fr()*3)|0,fr,0);if(libre(L9)){pose(L9,true,false);nS++;}}
  if(performance.now()>JF.lim)yield;
  // ---- 3. LES AIGUILLES : des flèches de 110 à 420 m, trop raides pour y glisser (on y meurt) ----
  {let sd=fr()<.5?-1:1;for(let s9=200+fr()*200;s9<L;s9+=(115+fr()*120)/KP/(DZ?DZ.aig.n:1)){const i=Math.min(NP-1,Math.round(s9/ds));sd=-sd;
    const H=(110+fr()*310)*(DZ?DZ.aig.h:1),lat=230+fr()*640,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<200)continue;
    const L9=bkGrappe(x,z,bkSolH(x,z)-6,H,2.2+fr()*1.8,3+((fr()*5)|0),fr,1);if(libre(L9)){pose(L9,true,false);nA++;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 4. LES GÉANTS : l'horizon de glace (400 m à 1,3 km de haut, de 1,1 à 3,6 km de la route) — décor, sans physique ----
  {const KL=PAL_BK('banqLoin',1);for(let s9=0;s9<L+600;s9+=230/KL*(DZ?DZ.gea.pas:1)){const i=Math.min(NP-1,Math.round(s9/ds));for(const sd of [-1,1]){if(fr()<.12)continue;
    const lat=1100+fr()*2500,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<900)continue;
    const H=(380+fr()*920)*(DZ?DZ.gea.h:1);pose(bkGrappe(x,z,bkSolH(x,z)-20,H,1.4+fr()*1.5,3+((fr()*5)|0),fr,2,420),false,true);nL++;}}
   // l'avant et l'arrière de la descente : le grand amphithéâtre au loin, dans l'axe
   for(const fin of [0,1]){const i=fin?NP-1:0,t=T[i],hl=Math.hypot(t.x,t.z)||1,dx=t.x/hl*(fin?1:-1),dz=t.z/hl*(fin?1:-1);
     const nA9=DZ?DZ.amph.n:7;for(let k=0;k<nA9;k++){const a=(DZ?(k-(nA9-1)/2)*2.24/nA9:(k-3)*.32)+(fr()-.5)*.2,c=Math.cos(a),s9=Math.sin(a),d=(2400+fr()*1800)*(DZ?DZ.amph.d:1),x=pts[i].x+(dx*c-dz*s9)*d,z=pts[i].z+(dz*c+dx*s9)*d;
       const H=600+fr()*900;pose(bkGrappe(x,z,bkSolH(x,z)-40,H,1.5+fr()*1.2,4+((fr()*4)|0),fr,2,520),false,true);nL++;}}}
  if(performance.now()>JF.lim)yield;
  /* ---- 4 ter (2026-10-20, LE DÉCOR AU HASARD) LES PIÈCES NEUVES : le monument, les orgues, les portes de glace (le flux dz2 ; mêmes cristaux, même matière) ---- */
  let nM9=0;
  if(DZ){const lieu=(f,lat0,lat1,dMin,e9)=>{for(let e=0;e<(e9||20);e++){const i=Math.max(0,Math.min(NP-1,Math.round((f+(e?(dz2()-.5)*.3:0))*(NP-1)))),l9=lat9(i),sd=dz2()<.5?-1:1,lat=lat0+dz2()*(lat1-lat0),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)>=dMin)return [x,z,i,sd];}return null;};
    if(DZ.mon==='cirque'){const o=lieu(.25+dz2()*.5,620,900,480);if(o){const R9=130+dz2()*60,n=8+((dz2()*7)|0),a0=dz2()*6.283;
      for(let k=0;k<n;k++){const an=a0+k/n*6.2832,x=o[0]+Math.cos(an)*R9,z=o[1]+Math.sin(an)*R9;if(bkSolD(x,z)<300)continue;const L9=bkGrappe(x,z,bkSolH(x,z)-6,(160+dz2()*220)*(.8+.4*Math.abs(Math.sin(an*1.5))),2.6+dz2()*1.4,2+((dz2()*3)|0),dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}}
    else if(DZ.mon==='cathédrale'){const o=lieu(.2+dz2()*.6,800,1150,650);if(o){const n=3+((dz2()*3)|0);
      for(let k=0;k<n;k++){const an=dz2()*6.283,r9=k?60+dz2()*90:0,x=o[0]+Math.cos(an)*r9,z=o[1]+Math.sin(an)*r9;const L9=bkGrappe(x,z,bkSolH(x,z)-10,(k?450:700)+dz2()*250,3+dz2()*1.5,3+((dz2()*3)|0),dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}}
    for(let r=0;r<DZ.org;r++){const f0=.12+dz2()*.7,sd=dz2()<.5?-1:1,lg=300+dz2()*220,i0=Math.round(f0*(NP-1)),lat=ROAD_HALF+120+dz2()*50;
      for(let s9=i0*ds;s9<Math.min(L-200,i0*ds+lg);s9+=30+dz2()*16){const i=Math.round(s9/ds),l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<ROAD_HALF+100)continue;
        const L9=bkGrappe(x,z,bkSolH(x,z)-3,40+dz2()*55,5+dz2()*2,(dz2()*2)|0,dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}
    for(let k=0;k<DZ.porte;k++){const o=lieu(.1+dz2()*.8,180,320,160);if(!o)continue;const t9=T[o[2]],hl=Math.hypot(t9.x,t9.z)||1,ux=t9.x/hl,uz=t9.z/hl,H=60+dz2()*55,w=H*(.55+dz2()*.25),yb=bkSolH(o[0],o[1])-4,L9=[];
      for(const sg of [-1,1])L9.push(bkPrim(o[0]+ux*sg*w,o[1]+uz*sg*w,yb,H,H/4.2,6,-ux*sg*w*.92,-uz*sg*w*.92,dz2()*6.28,dz2,1)); /* deux lames penchées l'une vers l'autre (sommet décalé de lx, lz) : elles se touchent en haut */
      if(libre(L9)){pose(L9,true,false);nM9++;}}}
  BANQ.n.decoNeuf=nM9;
  if(performance.now()>JF.lim)yield;
  // ---- 4 bis (v4). LA PISTE : LES BECS DE GLACE, puis LES PICS SUR LA PISTE, en figures ----
  BANQ.obst=[];BANQ.kick=[];
  {const fr=mulberry32((seed^0xB0B57AC)>>>0) /* (2026-10-22, DEBUGGING : LA PISTE a SON flux — les multiplicateurs du DÉCOR AU HASARD (pics, séracs, aiguilles, géants, amphithéâtre) changent le NOMBRE de tirages de `fr` des sections 1-4 : MESURÉ, même pistegraine, 16 pics sur la piste avec le décor contre 14 sans (23 contre 15), et les pièces qui les évitent — le décor rebattait les obstacles de la route) */,RH=ROAD_HALF,kRH=RH/61.6,O=BANQ.obst,KK=BANQ.kick,ou=(s9,la)=>{const i=Math.max(0,Math.min(NP-1,Math.round(s9/ds))),p=pts[i],b=B[i];return [p.x+b.x*la,p.y+b.y*la,p.z+b.z*la];};
    const libreK=(s9,la,r,ov)=>{for(const k of KK){if(s9>k.s-k.lg-60&&s9<k.s+260&&la+r>k.l0-8&&la-r<k.l1+8)return false;if(BK_RETOMBE&&s9+r>k.s&&s9-r<k.s+BK_BEC.retombe)return false;} /* (2026-10-18) 60 m d'approche dégagés devant la rampe (au banc, on percutait un pic en visant le tremplin), et sa retombée : 260 m (à 45°, on vole loin) — (2026-10-19) puis BK_BEC.retombe m sur TOUTE la largeur (voir BK_RETOMBE) */if(!ov)for(const o of O)if(Math.abs(o.s-s9)<o.r+r+8&&Math.abs(o.lat-la)<o.r+r+8)return false;return true;}; // ni sur un bec ni dans sa retombée, ni collé à un autre pic
    let gdPic=true; /* (2026-10-25) faux = la figure en cours n'a aucun pic */const pic=(s9,la,H,pente,ov)=>{if(!gdPic)return false;{const i=Math.max(3,Math.min(NP-4,Math.round(s9/ds))),a=pts[i-3],c=pts[i+3];pente+=Math.max(0,(a.y-c.y)/Math.max(1,Math.hypot(a.x-c.x,a.z-c.z)));} /* (2026-10-18) + la PENTE de la piste : à 45°, le flanc aval d'un pic à 55° (1,4) devenait presque parallèle à la glace — une lame basse de 30 à 50 m qu'on croyait franchir et qui tuait (« des problèmes de collision avec la glace ») ; sa face aval garde désormais, par rapport à la piste, la raideur qu'elle aurait sur le plat */const R=H/pente;if(Math.abs(la)>RH-R*.35-3||!libreK(s9,la,R,ov))return false;const q=ou(s9,la);
      const L9=bkGrappe(q[0],q[2],q[1]-.4,H,pente,(fr()*3)|0,fr,1.4,Math.max(9,R*1.1)); /* (pied profond : sur la pente raide, le côté aval ne flotte pas) fam 1,4 : une aiguille pour la physique, mais COIFFÉE DE NEIGE (BK_PIC_FS) */pose(L9,true,false);let r=0;for(const P of L9)r=Math.max(r,Math.hypot(P.cx-q[0],P.cz-q[2])+P.r);
      O.push({s:s9,lat:la,L9:L9,r:r,x:q[0],z:q[2]});return true;};
    const bec=(s9,c,w)=>{{const cap9=s=>{const t0=T[Math.min(NP-1,Math.round((s+BK_BEC.lg)/ds))],t1=T[Math.min(NP-1,Math.round((s+BK_BEC.lg+BK_BEC.droit)/ds))];return Math.abs(Math.atan2(t0.x*t1.z-t0.z*t1.x,t0.x*t1.x+t0.z*t1.z));};
      let o=0;while(o<=240&&cap9(s9+o)>.55)o+=30;if(o>240)return;s9+=o;} /* (2026-10-18) jamais devant un virage : à 45°, un vol couvre 250-450 m — posé avant une courbe, il retombait à côté de la piste ; on cherche la portion presque droite (< 31° de cap sur BK_BEC.droit m) jusqu'à 240 m plus loin */c=THREE.MathUtils.clamp(c,-RH+w/2+6,RH-w/2-6);KK.push({s:s9+BK_BEC.lg,l0:c-w/2,l1:c+w/2,lg:BK_BEC.lg,h:BK_BEC.h});return s9+BK_BEC.lg;}; // (2026-10-18) s = la LÈVRE du tremplin ; sa rampe monte sur les lg m d'avant
    /* (2026-10-18, Sacha : « moins d'obstacles sur la route ») une figure tous les ~0,6-1 km (0,3-0,5 avant) et moins de pics dans chacune (fourche 3-5,
       champ 5-7, îlot 2-3) — ~4 × moins de pics ; (« les tremplins doivent être plus beaux, gros et visibles ») un TREMPLIN avant deux figures sur trois,
       et un tremplin seul au milieu d'une longue descente sur deux (voir BK_BEC) */
    let sp=Math.max(560,3*(70+(lvPiste()-1)*100))+fr()*120; /* (2026-10-24, passe perf — Sacha : « tu peux mourir sans voir des obstacles arriver ») la 1re figure à 3 s de croisière du palier au moins (la croisière de la piste, vC9) : à 560 m elle tombait 1,2 à 2 s après le portail en fin de partie, voile compris ; au palier de départ rien ne change (210 m < 560) */
    while(sp<L-380){const f0=fr(),f=sp<1800?.5+f0*.5:sp>L*.6?f0*.85:f0;gdPic=f<.30||fr()<.3; /* (2026-10-25) la bifurcation, le massif et la fourche (f<.30) gardent leurs pics ; slalom, champ, porte et îlot : 30 % des figures seulement */ /* (2026-10-23, Sacha : « prends des initiatives ») LA COURBE DE DIFFICULTÉ : les 1 800 premiers mètres n'ont que des figures faciles (champ, porte, îlot — on apprend à lire la glace), puis tout arrive ; passé 60 % de la descente le tirage penche vers les grosses figures (bifurcation, massif, fourche, slalom) et les figures se resserrent (voir gap) */
      if(fr()<.65){const k9=bec(sp,(fr()*2-1)*RH*.45,36+fr()*22),j9=BK_BEC.lg+100+fr()*30;sp=k9!=null&&BK_RETOMBE?Math.max(sp+j9,k9+BK_BEC.retombe):sp+j9;} // un TREMPLIN, le plus souvent juste avant une figure : on peut la survoler — (2026-10-19) elle attend la fin de sa retombée (BK_RETOMBE)
      if(f<.10){ /* (2026-10-23, Sacha : « la route de verglas se sépare en deux routes et on doit choisir un chemin ») LA BIFURCATION : une longue crête (~400 m, jusqu'à 90 m de haut) coupe la
         piste en deux couloirs aux caractères opposés — l'un est LIBRE et finit sur un TREMPLIN (le chemin du plaisir), l'autre est SEMÉ de petits pics (le chemin du risque, pour qui aime
         tenir sa ligne) ; on voit les deux de loin, on choisit avant que la crête se referme sur soi */
        const c=(fr()-.5)*10,n=10+((fr()*3)|0),pas=34+fr()*6,sg=fr()<.5?-1:1,lc=c+sg*(RH+40)/2,la=c-sg*(RH+40)/2; // lc : le couloir du risque · la : le couloir libre
        for(let j=0;j<n;j++){const u=j/(n-1);pic(sp+j*pas,c+(fr()-.5)*5,(34+56*Math.sin(Math.PI*(.06+.88*u)))*(.92+fr()*.16),1.3+fr()*.4,true);}
        for(let j=0;j<5;j++)pic(sp+70+j*((n-1)*pas-140)/4,lc+(j%2?1:-1)*(10+fr()*5),10+fr()*7,1.8+fr()*.4);
        sp+=(n-1)*pas+80;
        {const k9=bec(sp,la,46);if(k9!=null)sp=BK_RETOMBE?Math.max(sp,k9+BK_BEC.retombe):k9+120;}}
      else if(f<.24){ /* (2026-10-21, Sacha : « rajoute des éléments sur la piste, comme une montagne au milieu qui sépare la route en deux ») LE MASSIF : une vraie montagne de 30 à 80 m
         dans l'axe de la piste, une crête de pics soudés (nez bas, sommet au milieu, queue qui retombe) ; on choisit son COULOIR — la voie large à gauche, le
         raccourci étroit à droite, ou l'inverse — et à la sortie du couloir large un TREMPLIN lance vers la suite (la montagne ne se franchit pas : on la contourne, ou on la grimpe en glissant sur ses flancs doux) */
        const c=(fr()-.5)*34,n=6+((fr()*3)|0),pas=34+fr()*8;
        for(let j=0;j<n;j++){const u=j/(n-1);pic(sp+j*pas,c+(fr()-.5)*7,(24+54*Math.sin(Math.PI*(.1+.8*u)))*(.92+fr()*.16),1.3+fr()*.45,true);}
        sp+=(n-1)*pas+80;
        {const wL=c-42+RH,wR=RH-c-42,cl=wL>wR?(-RH+(c-42))/2:(RH+(c+42))/2,wl=Math.max(wL,wR); // le couloir le plus large reçoit le tremplin de sortie
          if(wl>46&&fr()<.8){const k9=bec(sp,cl,Math.min(52,wl-14));if(k9!=null)sp=BK_RETOMBE?Math.max(sp,k9+BK_BEC.retombe):k9+120;}}}
      else if(f<.30){const c=(fr()-.5)*14,n=3+((fr()*3)|0),pas=34+fr()*16; // LA FOURCHE : une arête au milieu, deux couloirs
        for(let j=0;j<n;j++)pic(sp+j*pas,c+(fr()-.5)*8,12+fr()*14,1.7+fr()*.8);sp+=n*pas;}
      else if(f<.42){ /* (2026-10-23, Sacha : « ajoute d'autres éléments de gameplay sur le glacier ») LE SLALOM : des pics en quinconce, un à gauche puis un à droite de l'axe, assez
         serrés pour qu'il faille vraiment zigzaguer — la caisse qui glisse sur la glace se balance d'une trouée à l'autre, un rythme à prendre */
        const c=(fr()-.5)*20,n=6+((fr()*3)|0),pas=70+fr()*20,am=15+fr()*5,sg0=fr()<.5?-1:1;
        for(let j=0;j<n;j++)pic(sp+j*pas,c+sg0*(j%2?1:-1)*am,15+fr()*8,1.7+fr()*.5);
        sp+=n*pas;}
      else if(f<.64){const lg=140+fr()*80,n=Math.round((4+((fr()*3)|0))*kRH*1.05); // LE CHAMP : des pics semés, des trouées — (kRH : la largeur ÷ celle de 123 m) — (2026-10-18) 5-7 pics, au lieu de 11-18
        for(let j=0,e=0;j<n&&e<n*4;e++){if(pic(sp+fr()*lg,(fr()*2-1)*(RH-10),6+fr()*14,1.4+fr()*1.2))j++;}sp+=lg;}
      else if(f<.82){const gw=26+fr()*12,g=(fr()*2-1)*(RH*.45); // LA PORTE : deux géants, une trouée à viser
        for(const sg of [-1,1]){const H=26+fr()*14,pe=1.8+fr()*.6;pic(sp+(fr()-.5)*6,g+sg*(gw/2+H/pe*.85),H,pe);}sp+=40;}
      else{const sg=fr()<.5?-1:1,n=2+((fr()*2)|0); // L'ÎLOT : un massif d'un côté, le large de l'autre
        for(let j=0;j<n;j++)pic(sp+fr()*70,sg*(RH*.35+fr()*RH*.4),10+fr()*16,1.5+fr()*.9);sp+=70;}
      const gap=(270+fr()*300)*(1.2-.5*Math.min(1,sp/L));let kS=null;if(gap>400&&fr()<.5&&sp+gap*.5<L-380)kS=bec(sp+gap*.4,(fr()*2-1)*RH*.5,36+fr()*22); // un TREMPLIN seul, au milieu de la descente : pour le plaisir de voler
      sp=kS!=null&&BK_RETOMBE?Math.max(sp+gap,kS+BK_BEC.retombe):sp+gap;} // (2026-10-19) la figure suivante attend la fin de sa retombée
    if(KK.length)bkBecMesh(root,KK); // (2026-10-18) LE TREMPLIN DE GLACE : la rampe, sa lèvre, ses balises
    BANQ.n.pistePics=O.length;BANQ.n.becs=KK.length;}
  if(performance.now()>JF.lim)yield;
  BANQ.picM=[];BANQ.loinM=[];
  for(const k in KN){const o=KN[k];bkTache(o.x,o.z,function(){const K=bkLot();for(const P of o.L)bkPrimGeo(K,P);const m=bkMesh(root,K,M.pic,'banquise pics');if(m)BANQ.picM.push(m);});BANQ.file[BANQ.file.length-1].d=Math.max(0,BANQ.file[BANQ.file.length-1].d-o.r);}
  for(const k in KF){const o=KF[k];bkTache(o.x,o.z,function(){const K=bkLot();for(const P of o.L)bkPrimGeo(K,P);const m=bkMesh(root,K,M.loin,'banquise géants');if(m){m.renderOrder=-.5;BANQ.loinM.push(m);}});}
  tp('pics');
  if(performance.now()>JF.lim)yield;
  if(performance.now()>JF.lim)yield;
  // ---- la physique des pics en grille de 120 m ----
  {const CG=120,G=new Map();for(const P of PH){const r=P.r,i0=Math.floor((P.cx-r)/CG),i1=Math.floor((P.cx+r)/CG),j0=Math.floor((P.cz-r)/CG),j1=Math.floor((P.cz+r)/CG);
     for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*100003+j;let a=G.get(k);if(!a)G.set(k,a=[]);a.push(P);}}
   BANQ.picG={CG:CG,G:G};BANQ.pics=PH;}
  BANQ.n.glisse=nG;BANQ.n.seracs=nS;BANQ.n.aiguilles=nA;BANQ.n.geants=nL;BANQ.n.prims=PH.length;
  if(performance.now()>JF.lim)yield;
  BANQ.file.sort(function(a,b){return a.d-b.d;});BANQ.fi=0;bkTranches(1e9,BK_TOUT);tp('depart');BANQ.nFile=BANQ.file.length-BANQ.fi;
  bkPisteNue(true); // plus de route : la glace seule
  tp('grille');BANQ.ms=Math.round(performance.now()-t0);BANQ.msSol=Math.round(tS-t0);BANQ.yRaz=true;
  banqMeteo(BANQ.met,started?bioPortDur():.01);
}
/* ---------------- LA SURFACE : ce qu'il y a sous la caisse (neige, lac, pic) ---------------- */
const BKS={ok:false,h:0,nx:0,ny:1,nz:0,t:0,hs:0};
function banqSurf(x,z){
  const S=BANQ.sol;BKS.ok=false;if(!S)return BKS;
  const fx=(x-S.x0)/S.C,fz=(z-S.z0)/S.C;if(fx<0||fz<0||fx>S.nx-1.001||fz>S.nz-1.001)return BKS;
  const i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,H=S.h,a=H[k],b=H[k+1],c=H[k+S.nx],d=H[k+S.nx+1];
  const h=(a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v,gx=((b-a)*(1-v)+(d-c)*v)/S.C,gz=((c-a)*(1-u)+(d-b)*u)/S.C,nl=Math.hypot(gx,1,gz);
  BKS.ok=true;BKS.h=h;BKS.hs=h;BKS.nx=-gx/nl;BKS.ny=1/nl;BKS.nz=-gz/nl;BKS.t=1;
  const G=BANQ.picG;if(G){const A9=G.G.get(Math.floor(x/G.CG)*100003+Math.floor(z/G.CG));
    if(A9)for(let q=0;q<A9.length;q++){const P=A9[q];if((x-P.cx)*(x-P.cx)+(z-P.cz)*(z-P.cz)>P.r2)continue;const F=P.F;let hm=1e9,fi=0;
      for(let e=0;e<F.length;e+=4){const y=(F[e+3]-F[e]*x-F[e+2]*z)/F[e+1];if(y<hm){hm=y;fi=e;}}
      if(hm>P.by&&hm>BKS.h){BKS.h=hm;BKS.nx=F[fi];BKS.ny=F[fi+1];BKS.nz=F[fi+2];BKS.t=3;}}}
  return BKS;}
function banqOk(){return !!(BANQ.root&&BANQ.sol&&LVL.cur&&LVL.cur.id==='banquise'&&!PARK.on);}
/* ---------------- EN VOL : LA NEIGE ET LA GLACE (branche 'fall', AVANT que la position avance) ----------------
   On regarde la surface LÀ OÙ LA CAISSE SERA à la fin de l'image ; d = la profondeur du DESSOUS de la caisse sous cette surface.
   · LA GLACE (lac, pic) : contact → si la facette est trop raide ou le choc trop de face : 'glace' (relevé par banqHeurt) ; un gros choc
     à plat sur un lac : la caisse REBONDIT (le galet) ; sinon elle GLISSE : on retire la vitesse qui entre dans la glace, on la pose
     dessus, presque aucune friction, la pente accélère, et le volant ne tourne que 42 % de la trajectoire (le reste DÉRIVE la caisse).
   · LA POUDREUSE : dedans, elle porte (×g sur 1,4 m), elle TASSE (la vitesse qui entre est mangée en ~1/16 s), elle freine d'autant plus
     qu'on s'enfonce, et vite, la caisse PLANE dessus. La mort se lit dans banqHeurt (au-delà de BK_PH.prof). */
const BK_V=new THREE.Vector3(),BK_V2=new THREE.Vector3(),BK_N=new THREE.Vector3(),BK_R=new THREE.Vector3(),BK_M4=new THREE.Matrix4(),BK_Q=new THREE.Quaternion();
function banqLache(){if(BANQ.glisse)banqDecolle();BANQ.sur=0;BANQ.pou=false;}
/* LE VOLANT EN L'AIR AU GLACIER (2026-10-19, Sacha : « je meurs sans raison sur la route de glace dans la map montagne »). En vol, le lacet tourne
   la vitesse autour du HAUT DE LA CAISSE (FLY_U, « vol libre ») ; au glacier la caisse vole piquée de 35 à 45° (la pente) : son haut penche, et
   chaque coup de volant changeait un peu de CHUTE en dérive de côté, que le plafond de l'avance horizontale (fallVH0) rabotait ensuite. La
   caisse qu'on pilotait FLOTTAIT : sa vitesse vers la glace restait vers −15 pendant 3 s au lieu de croître. MESURÉ au banc (le pilote de vol,
   qui ramène vers l'axe, sur les mêmes tremplins) : à 500 km/h, 850 à 1 320 m et 4,8 à 7,1 s de vol (sans braquer : 500 m, 3 s) ; à 700 km/h
   la caisse ne se posait plus (sortie de piste, « vide ») ; nitro tenue, 8 s. Au-delà de la jauge d'air (6 s), on explosait en plein ciel, 50
   à 90 m au-dessus de la piste. Désormais, au glacier, le volant ne tourne que le CAP : la vitesse verticale et l'avance horizontale restent.
   MESURÉ (3 tremplins × 350, 500, 700 km/h, avec et sans nitro : 18 vols) : tous posés, de 0,9 à 2,9 s (4,1 s au plus nitro tenue), de 84 à
   705 m. `?sans=glacelacet` = avant. Ailleurs, rien ne change. */
const BK_LACET=!/[?&]sans=([^&]*,)?glacelacet(,|&|$)/.test(location.search);
function banqLacet(v,a){ // le lacet du vol, à chaque image (la boucle, VOL)
  if(!(BK_LACET&&banqOk())){v.applyAxisAngle(FLY_U,a);return;}
  const vy=v.y,h0=Math.hypot(v.x,v.z);v.applyAxisAngle(FLY_U,a);const h1=Math.hypot(v.x,v.z);v.y=vy;if(h1>1e-6){v.x*=h0/h1;v.z*=h0/h1;}}
function banqSolVol(dt,dtF){
  if(!banqOk()){if(BANQ.sur||BANQ.glisse)banqLache();return;}
  const p=fallPos,v=fallVel,k9=dtF*SPD,S=banqSurf(p.x+v.x*k9,p.z+v.z*k9);
  if(!S.ok){banqLache();return;}
  if(S.t===1&&curNear&&Math.abs(curLatOff)<ROAD_HALF+BK_CG.w+3&&curHOff>-6){if(BANQ.sur||BANQ.glisse||BANQ.pou)banqLache();return;} // (2026-10-18) au-dessus de la piste et de sa congère, c'est la PISTE qui reçoit (tryLand) : la grille de neige (cases de 34-40 m) y passait par endroits AU-DESSUS de la glace — « poudreuse » en plein vol, au-dessus de la piste
  const py=p.y+v.y*k9,d=S.h-py,nx=S.nx,ny=S.ny,nz=S.nz,vn=v.x*nx+v.y*ny+v.z*nz,g=FALL_G*gK();
  if(S.t>=2){ // ---- LA GLACE ----
    if(BANQ.pou)BANQ.pou=false;
    const colle=BANQ.glisse?BK_PH.colle:.04;
    if(d>-colle&&(vn<1.5||(BANQ.glisse&&vn<5))){
      if(!BANQ.glisse){
        const vv=Math.max(1,v.length()),sinA=-vn/vv;
        if(ny<BK_PH.nyMin||(-vn>BK_PH.vnMort&&sinA>BK_PH.sinMax)){BANQ.mort='glace';BANQ.pourquoi=(ny<BK_PH.nyMin?'raide ':'choc ')+ny.toFixed(2)+' vn '+(-vn).toFixed(0)+' sin '+sinA.toFixed(2);return;}
        banqTouche(S,-vn,vv);
        BANQ.glisse=true;BANQ.gT=0;BANQ.dT=0;BANQ.nS.set(nx,ny,nz);}
      if(vn<0){v.x-=nx*vn;v.y-=ny*vn;v.z-=nz*vn;}
      p.y=Math.max(p.y,S.h+.03-v.y*k9);                                                // posée SUR la glace à la fin de l'image
      {const kf=Math.exp(-BK_PH.frG*dtF);v.multiplyScalar(kf);}
      {const yi=veqVolant()*lacetVol(v.length())*dtF;if(yi)v.applyAxisAngle(FLY_U,-yi*(1-BK_PH.grip));} // le volant mord moins : la caisse DÉRIVE
      BK_N.set(nx,ny,nz);BANQ.nS.lerp(BK_N,Math.min(1,dt*14)).normalize();FLY_U.copy(BANQ.nS);
      fallVH0=Math.max(fallVH0,Math.hypot(v.x,v.z));fallTR=Math.max(0,fallTR-dt*3);
      BANQ.sur=S.t;BANQ.gT+=dt;BANQ.tG=S.t;
    }else if(BANQ.glisse&&(d<-1.8||vn>5))banqDecolle();
    return;}
  // ---- LA POUDREUSE ----
  if(BANQ.glisse){BANQ.glisse=false;BANQ.gFin=performance.now();if(vn<0&&d>-.6){v.x-=nx*vn*.85;v.y-=ny*vn*.85;v.z-=nz*vn*.85;}} // de la glace à la neige : on y entre À PLAT, la glisse continue en poudre
  if(d>0){
    const f=Math.min(1,d/BK_PH.H),hv=Math.hypot(v.x,v.z);
    if(!BANQ.pou){BANQ.pou=true;BANQ.pT=0;banqPlouf(-vn,hv);}
    v.x+=nx*g*BK_PH.flot*f*dtF;v.y+=ny*g*BK_PH.flot*f*dtF;v.z+=nz*g*BK_PH.flot*f*dtF;                       // la poudre PORTE
    {const vn2=v.x*nx+v.y*ny+v.z*nz;if(vn2<0){const kk=1-Math.exp(-BK_PH.kN*dtF*Math.min(1,.35+f));v.x-=nx*vn2*kk;v.y-=ny*vn2*kk;v.z-=nz*vn2*kk;}} // elle TASSE
    {const kt=Math.exp(-(BK_PH.kT+BK_PH.kTp*f*f)*dtF);v.x*=kt;v.z*=kt;}                               // elle freine (à peine au ras)
    if(hv>BK_PH.vPl){const pl=Math.min(1,(hv-BK_PH.vPl)/60);v.y+=g*BK_PH.lift*pl*pl*Math.min(1,f*3)*dtF;} // le PLANING : vite, on surfe
    if(d>BK_PH.prof*.7){p.y=Math.max(p.y,S.h-BK_PH.prof*.7-v.y*k9);const vn3=v.x*nx+v.y*ny+v.z*nz;if(vn3<0){v.x-=nx*vn3;v.y-=ny*vn3;v.z-=nz*vn3;}} // (2026-10-18, Sacha : « on s'enfonce dans la neige, ça ralentit mais ça tue pas ») la poudre du glacier ne t'avale plus : elle te tient sous la surface
    fallTR=Math.max(0,fallTR-dt*3);BANQ.sur=1;BANQ.pT+=dt;
  }else{BANQ.sur=d>-.7?1:0;if(BANQ.pou&&d<-1.2)BANQ.pou=false;}
  if(d>-1.5){BK_N.set(nx,ny,nz);FLY_U.lerp(BK_N,Math.min(1,dt*5)).normalize();} // au ras de la neige, la caisse SURFE : son haut suit la pente (et la caméra reste au-dessus)
}
function banqDecolle(){
  BANQ.glisse=false;BANQ.gFin=performance.now();
  if(BANQ.gT>.25&&fallVel.y*SPD>9){BANQ.figs.trp=(BANQ.figs.trp|0)+1;try{addTrick('bk_trp',sansAcc(TR('TREMPLIN DE GLACE !')),10,2);flowAdd(8,'risque');hap([10,20,30]);}catch(e){}} // l'arête d'un pic : un TREMPLIN
  BANQ.gT=0;}
/* LE CONTACT AVEC LA GLACE : le son, la gerbe de givre, la figure */
function banqTouche(S,vn,vv){
  const k=Math.min(1,vn/40);shake=Math.max(shake,.15+.35*k);fovPunch=Math.max(fovPunch,3+6*k);hap(k>.5?[14,20]:[8]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.craque')&&sfx('banq.craque',{vol:-6+6*k})))sfx('pose.choc',{vol:-10+6*k});}else noiseBurst(.22,.08+.08*k,3600);}catch(e){}
  banqGivre(fallPos,18+40*k,vv*SPD*.35);
  const fg=BANQ.figs;if(!fg.glace){fg.glace=1;try{addTrick('bk_glace',sansAcc(TR(S.t===3?'SUR LE PIC !':'GLISSE !')),8,1);flowAdd(5,'style');}catch(e){}}}
function banqPlouf(vn,hv){
  const k=Math.min(1,Math.max(0,vn)/50);shake=Math.max(shake,.2+.4*k);fovPunch=Math.max(fovPunch,4+7*k);hap(k>.5?[16,24]:[8]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.plouf')&&sfx('banq.plouf',{vol:-6+7*k})))sfx('nuage.entre',{vol:-2+4*k});}else noiseBurst(.4,.10+.08*k,700);}catch(e){}
  banqGerbe(fallPos,26+60*k,hv,1);
  const fg=BANQ.figs;if(!fg.pou){fg.pou=1;try{addTrick('bk_pou',sansAcc(TR('POUDREUSE !')),8,1);flowAdd(5,'risque');}catch(e){}}}
/* L'ASSIETTE SUR LA GLACE (après les figures) : le haut de la caisse = la normale de la glace, le nez = la trajectoire TOURNÉE de l'angle
   de dérive (`BANQ.drift`, qui suit le volant) — la caisse glisse de travers, comme un snowboard qui carve. */
function banqAssiette(dt){
  if(!BANQ.glisse)return;const n=BANQ.nS;
  BK_V.copy(fallVel).addScaledVector(n,-fallVel.dot(n));if(BK_V.lengthSq()<4){BK_V.set(0,0,1).applyQuaternion(carGroup.quaternion);BK_V.addScaledVector(n,-BK_V.dot(n));}
  BK_V.normalize();const tg=THREE.MathUtils.clamp(steer,-1,1)*1.05;BANQ.drift+=(tg-BANQ.drift)*(1-Math.exp(-dt*4));
  BK_V.applyAxisAngle(n,BANQ.drift);BK_R.crossVectors(n,BK_V).normalize();BK_V.crossVectors(BK_R,n).normalize();
  BK_M4.makeBasis(BK_R,n,BK_V);BK_Q.setFromRotationMatrix(BK_M4);carGroup.quaternion.slerp(BK_Q,Math.min(1,dt*14));airRoll=0;}
/* CE QUI TUE (après l'avance de la position, dans la chaîne des morts du vol) : s'enfoncer au-delà de BK_PH.prof dans la poudreuse ; percer la
   glace ; ce que banqSolVol a jugé (le choc de face, la facette trop raide). Note la surface sous la caisse pour les effets (banqTick). */
function banqHeurt(p){
  if(!BANQ.root)return '';
  if(BANQ.mort){const m=BANQ.mort;BANQ.mort='';banqMortFx(m);return m;}
  const S=banqSurf(p.x,p.z);if(!S.ok){BANQ.dNow=99;BANQ.tNow=0;return '';}
  const d=S.h-p.y;BANQ.dNow=d;BANQ.tNow=S.t;BANQ.hNow=S.h;
  // (2026-10-18) la poudre du glacier ne tue plus (on y est tenu sous la surface : banqSolVol) — était : au-delà de BK_PH.prof, 'poudreuse'
  if(S.t>=2&&d>1.6){BANQ.pourquoi='percée '+d.toFixed(1)+' ny '+S.ny.toFixed(2);banqMortFx('glace');return 'glace';}
  return '';}
function banqMortFx(m){bkSkateRaz();try{if(m==='poudreuse')banqGerbe(fallPos,120,Math.hypot(fallVel.x,fallVel.z),2.2);else banqGivre(fallPos,90,30);}catch(e){}banqLache();bkTraceCoupe();}
/* LA MONTAGNE TE RAMÈNE : arrêté dans la neige ou sur la glace, sans nitro (la chaîne seule est perdue, comme la mer de la jade) */
function banqRamene(){
  BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;BANQ.lent=0;bkSkateRaz();airPie.style.display='none';airFlash=0;bkTraceCoupe();
  
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0;
  try{popTexte(sansAcc(TR('LA MONTAGNE TE RAMENE')),'#9fe8ff',2);}catch(e){}try{if(SONV2)sfx('air.regain');}catch(e){}}
