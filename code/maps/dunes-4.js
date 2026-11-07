/* ===== LES SCÈNES DES DUNES (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt ») =====
   Une MAP A DES LIEUX : jade a ses piliers, la forêt ses géants, la grotte ses salles. Les dunes en ont désormais — chaque tronçon calme de la route (le départ, un creux entre deux vagues, la dernière droite) peut recevoir une SCÈNE, tirée
   dans le flux du décor (`D.sd`) : LA PORTE DU DÉPART (deux pylônes de part et d'autre de la route, les mâts et leurs oriflammes), L'ALLÉE DES SPHINX (des paires qui regardent la route, des
   obélisques entre elles), LA RANGÉE DE COLOSSES (quatre pharaons assis, façon Abou Simbel), LA COLONNADE (deux files de géants à architraves, certains brisés, des tambours à terre : elle
   mène aux pyramides) et LES RUINES éparses. Le sable tombait trop vite au bord de la route (une crête, des flancs à 22-32°) pour qu'on y pose quoi que ce soit : chaque scène a son PLATEAU
   (S.pw : sa demi-largeur depuis l'axe, qui monte et s'élargit en douceur sur 120 m avant la scène, dnProfil le lit) — le sable s'y tient à hauteur de la dalle. Les colonnes, colosses,
   sphinx et pylônes TUENT en vol (ils entrent dans DN.mo). `?sans=dunesscenes` = sans elles. */
const DN_SCN={on:!/[?&]sans=([^&]*,)?dunesscenes(,|&|$)/.test(location.search)};
/* ===== LA DALLE PENCHÉE ET LE SOL SOUS L'EMPRISE (2026-11-07, Sacha : « génération aléatoire parfaite ») =====
   MESURÉ (dbgDunes('decor'), 10 graines) : (1) `yr` était la hauteur de l'AXE de la route ; dans un virage la dalle se couche jusqu'à 40° et la berme la suit (dnProfil) : un décor du côté bas
   montait sur un podium jusqu'à la hauteur de l'axe, 10 à 20 m au-dessus du bord de la route, et celui du côté haut s'enfonçait sous la berme. `yr` est désormais la hauteur de la dalle PROLONGÉE au
   décalage `lat` (comme la berme : bornée au plateau de la scène). (2) Le sol n'était lu qu'au CENTRE du décor : sur une pente, le podium, la maison, le bloc tombé « pendaient » du côté
   aval (jusqu'à 45 m de vide sous un coin). `dnSolBas` lit le sable le plus bas sous l'emprise tournée (5 × 5 points) : le podium et les blocs partent de là. */
function dnPos(S,s,lat){const i=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds))),lm=Math.max(ROAD_HALF+10,S.pw[i]||0),l9=Math.max(-lm,Math.min(lm,lat));
  return {x:S.x[i]-S.tz[i]*lat,z:S.z[i]+S.tx[i]*lat,yr:S.y[i]-l9*Math.tan(S.bk?S.bk[i]:0),t:Math.atan2(S.tx[i],S.tz[i]),i:i};}
const o9b={};
function dnSolBas(x,z,hx,hz,rot){const ca=Math.cos(rot||0),sa=Math.sin(rot||0);let lo=1e9;
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const lx=a/2*hx,lz=b/2*hz,g=dnHauteur(x+lx*ca+lz*sa,z-lx*sa+lz*ca,o9b);if(g<lo)lo=g;}return lo;}
// les tronçons CALMES de la route (2026-10-22, LA ROUTE CONTINUE : plus de sauts à contourner) — là où une scène peut se poser : le DÉPART (le belvédère, le 1er creux), chaque CREUX entre deux vagues,
// la DERNIÈRE droite : [{a, b, courbe, k}] — `courbe` = le cap total tourné (rad) : une longue droite = une scène de monuments
function dnTroncons(){const S=DN.S,out=[];if(!S)return out;const Q=DN.sQ||{};
  const add=(a9,b9,k)=>{a9=Math.max(20,a9);b9=Math.min(L-40,b9);if(b9-a9<150)return;let tot=0,p=null;for(let s9=a9;s9<=b9;s9+=24){const i=Math.max(0,Math.min(S.n-1,Math.round(s9/S.ds))),h=Math.atan2(S.tx[i],S.tz[i]);if(p!=null){let d=h-p;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;tot+=Math.abs(d);}p=h;}out.push({a:a9,b:b9,courbe:tot,k:k});};
  add(30,(Q.erg0!=null?Q.erg0:600)-70,'depart');
  (DN.fe||[]).forEach(function(fe,n){const sD=Q['d'+n],sN=Q['m'+(n+1)+'a'],n0=out.length;if(sD==null)return;if(fe.fin)add(sD+80,L-170,'fin');else if(sN!=null)add(sD+90,sN-50,'creux');if(out.length>n0)out[n0].sp=fe.sp||'';});
  return out;}
/* LE PLAN DES SCÈNES (dans buildDunes, avant le monde : les plateaux entrent dans la route) : DN.scn = [{k, a, b, pw, …}] et S.pw (la demi-largeur du plateau, par échantillon) */
function dnPlanScenes(S,K,RH,D){
  DN.scn=[];DN.scnV=[];S.pw.fill(0);if(!DN_SCN.on||!D)return;const seg=dnTroncons();if(!seg.length)return;
  const rs=mulberry32((D.sd^0x5CE9E)>>>0),R=()=>rs(),Kc=Math.min(1.3,K),Kd=Math.min(1.25,K);
  /* LES OMBRES : chaque scène donne ses volumes (x, z, rayon, hauteur) à la grille d'ombre du travailleur (dnOmbre) — les mêmes positions que le placement, au hasard près (±3 m : sous une case de 44 m) */
  DN.scnV=[];const vol=(c)=>{const RH9=RH;
    if(c.k==='allee'){const lat=RH9+c.len*.5+8,pas=c.len*2.2;for(let s9=c.a+c.len;s9<=c.b-c.len;s9+=pas)for(const sg of [-1,1]){const q=dnPos(S,s9,sg*lat);DN.scnV.push({x:q.x,z:q.z,r:c.len*.5,h:c.len*.5});}}
    // (2026-11-05, ARRAKIS) le village du désert et les rochers dressés : les mêmes volumes que leur bâtisseur (village/monolithes, plus bas) — approchés
    else if(c.k==='village'){const n9=Math.max(3,Math.round((c.b-c.a)/(c.H*.55)));for(let k=0;k<n9;k++)for(const sg of [-1,1]){const q=dnPos(S,c.a+(k+.5)*(c.b-c.a)/n9,sg*(RH9+c.H*.45+10));DN.scnV.push({x:q.x,z:q.z,r:3.6,h:2.8});}}
    else if(c.k==='ver'){for(const f of [-.88,.95]){const q=dnPos(S,(c.a+c.b)/2,f*c.s);DN.scnV.push({x:q.x,z:q.z,r:c.s*.2,h:c.s*.5});}} // (2026-11-05) le ver des sables : ses deux pieds (l'arche, elle, ombre la route)
    else if(c.k==='monolithes'){const mid=(c.a+c.b)/2,offs=[-.42,-.08,.30];for(let k=0;k<offs.length;k++)for(const sg of [-1,1]){if(k===1&&sg>0)continue;const q=dnPos(S,mid+offs[k]*(c.b-c.a)*.5,sg*(RH9+c.H*.55+12+k*c.H*.18));const h9=c.H*(.7+.5*((k*2+(sg<0?0:1))%3)/2);DN.scnV.push({x:q.x,z:q.z,r:h9*.32,h:h9});}}};
  const ajoute=(k,a,b,pw,ex)=>{DN.scn.push(Object.assign({k:k,a:Math.round(a),b:Math.round(b),pw:Math.round(pw)},ex||{}));vol(DN.scn[DN.scn.length-1]);
    for(let i=0;i<S.n;i++){const s9=i*S.ds,u=Math.max(0,Math.min(1,(s9-(a-120))/120))*Math.max(0,Math.min(1,((b+120)-s9)/120));if(u>0){const e=u*u*(3-2*u);if(S.pw[i]<pw*e)S.pw[i]=pw*e;}}};
  const faire=function(k,q){const L9=q.b-q.a;
    if(k==='allee'){const len=(34+R()*10)*Kd,a=q.a+50,b=Math.min(q.b-40,a+380+R()*160);if(b-a>len*3.4){ajoute('allee',a,b,RH+len*1.0+16,{len:len});return true;}return false;}
    // (2026-11-05, ARRAKIS) le village du désert (remplace les colosses) et les rochers dressés (remplacent le grand sphinx) : même gabarit que ce qu'ils remplacent
    if(k==='village'){const H=(70+R()*24)*Kd,a=q.a+60+R()*Math.max(0,L9-H*2.6-120),b=a+H*1.7+40;if(b<q.b-30){ajoute('village',a,b,RH+H*.55+16,{H:H});return true;}return false;}
    // (2026-11-05, LES MODULES DU DÉSERT) le VER DES SABLES : une arche de 60-100 m au-dessus de la route, dans un creux d'au moins 260 m (jamais plus d'une demi-largeur de plateau de 1,2 s + 24 m)
    if(k==='ver'){const s9=(60+R()*40)*Kd,mid=(q.a+q.b)/2+(R()-.5)*Math.max(0,L9-260)*.5;if(L9<260)return false;ajoute('ver',mid-20,mid+20,s9*1.2+24,{s:s9});return true;}
    if(k==='monolithes'){const H=(58+R()*18)*Kd,a=q.a+70+R()*Math.max(0,L9-H*3.2-130),b=a+H*1.9+40;if(b<q.b-30){ajoute('monolithes',a,b,RH+H*.9+18,{H:H});return true;}return false;}
    return false;};
  // LES ACTES (2026-10-23, Léo : « brouillon : l'organisation et l'harmonie ») : UN décor par lieu, du VIDE entre les actes. I le désert nu (le départ, la 1re vague : rien près de la route) · II LA PLACE : le village du désert ou les rochers ·
  // III L'ALLÉE : les monolithes · IV LA VALLÉE D'ARGILE : le village · V la fin : rien près de la route. (ARRAKIS, 2026-11-05 : plus aucune scène égyptienne)
  if(DN_ACTES.on){const vlei=seg.some(function(q){return q.sp==='vlei';});
    for(const q of seg){if(q.sp==='plaza'){if(!faire('village',q))faire('monolithes',q);}
      else if(q.sp==='avenue'){if(!faire('allee',q))faire('monolithes',q);}
      else if(q.sp==='vlei')faire('village',q);}
    if(!vlei){const ry=seg.filter(function(q){return q.sp==='rythme'||q.sp==='chapelet';});for(const q of ry)if(faire('monolithes',q))break;}
    /* (2026-11-05, LES MODULES DU DÉSERT) la CUVETTE de sable reçoit toujours son ver ; les creux sans lieu en ont un une fois sur deux (deux au plus) ; le SLALOM, ses rochers dressés en portes (une fois sur deux) */
    {let nv=0;for(const q of seg)if(q.sp==='cuvette'&&nv<2&&faire('ver',q))nv++;
     for(const q of seg)if(q.k==='creux'&&!q.sp&&nv<2&&R()<.5&&faire('ver',q))nv++;
     for(const q of seg)if(q.sp==='slalom'&&R()<.5)faire('monolithes',q);}/* pas de vallée d'argile : les rochers prennent un creux de bosses (jamais l'oasis) */
    return;}
  // (le plan d'avant, sans actes, est retiré avec les pharaons : `?sans=dunesactes` ne pose plus de scène)
}
// un décor posé à (x, z) : le plateau le tient à la hauteur de la dalle ; sinon un PODIUM de pierre rattrape le sable (jamais plus de 26 m) — rend la hauteur de la base
const o9s={};
function dnAssise(cuis,x,z,yr,larg,rot){const h=dnHauteur(x,z,o9s);if(o9s.eau)return null;let yb=Math.max(h-.3,yr-1.2);if(yb-h>26)return null;
  const w9=larg*1.15+(yb-h)*.12,lo=Math.min(h,dnSolBas(x,z,w9*.56,w9*.56,rot)); /* (2026-11-07) le sable le plus bas sous le podium (et sa corniche), pas celui du centre */
  if(yb-lo>1.2){cuis(dnMod('bloc'),x,lo-2,z,w9,yb-lo+2,w9,rot,0,0,[.90,.80,.62]);cuis(dnMod('bloc'),x,yb-.5,z,w9*1.08,.9,w9*1.08,rot,0,0,[.96,.86,.68]);}
  else yb=Math.min(yb,lo+.3); /* (pas de podium : le pied descend au sable le plus bas, rien ne pend) */
  return yb;}
function dnScenes(X){return jadeFini(dnScenesG(X));}
function* dnScenesG(X){ /* (2026-11-01) en pas : voir dnMonumentsTiresG */
  if(!DN_SCN.on||!DN.S||!DN.scn||!DN.scn.length)return;const S=DN.S,rg=X.rg,cuis=X.cuis,K=X.K,RH=X.RH,N=X.N,mo=DN.mo,M=n=>dnMod(n);N.sc=[];
  const kill=(k,x,y,z,r,h)=>{mo.push({k:k,x:x,y:y,z:z,r:r,h:h,a:0,t:0});};
  // L'ALLÉE DES MONOLITHES (2026-11-05, ARRAKIS) : des paires de rochers dressés tous les ~2,2 longueurs, un monolithe plus haut entre deux paires
  const allee=(a,b,len)=>{const lat=RH+len*.5+8,pas=len*2.2;let n=0,pi=0;
    for(let s=a+len;s<=b-len;s+=pas,pi++){for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat);if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,Math.max(len*.55,.3*len*(1.05+.22*((pi+(sg<0?0:1))%3))),q.t); /* (2026-11-07) le podium au moins aussi large que le socle du monolithe (0,31 de sa hauteur) */if(yb==null)continue;
        const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z),hs=len*(1.05+.22*((pi+(sg<0?0:1))%3)),sc=hs/64;cuis(M('monolithe'),q.x,yb,q.z,sc*1.15,sc,sc*1.15,ar+(sg<0?.22:-.22));kill('monolithe',q.x,yb,q.z,4.4*sc,hs);n++;}
      const m=dnPos(S,s+pas/2,(rg()<.5?-1:1)*(RH+len*.55+10));if(S.gd[m.i]<=.01){const yb=dnAssise(cuis,m.x,m.z,m.yr,9.5,m.t);if(yb!=null){const hs=22+rg()*10,sc=hs/64;cuis(M('monolithe'),m.x,yb,m.z,sc*1.1,sc,sc*1.1,m.t);kill('monolithe',m.x,yb,m.z,4*sc,hs);}}}
    for(let s=a+30;s<=b-20;s+=48)braise(s,RH+5,3.6);
    N.allee=n;N.sc.push(['allee',Math.round(a),Math.round(b)]);};
  // LE VILLAGE DU DÉSERT (2026-11-05, ARRAKIS, Sacha : « un petit village à l'arrache, pas comme Minecraft ») : un hameau de pisé clairsemé des deux côtés de la route — tailles, orientations et parcelles jamais pareilles
  const village=(a,b,H)=>{const lat=RH+H*.45+10,n9=Math.max(3,Math.round((b-a)/(H*.55)));let n=0;
    for(let k=0;k<n9;k++)for(const sg of [-1,1]){if(rg()<.18)continue; // (un hameau clairsemé, pas une rangée : des parcelles sautées)
      const jig=(rg()-.5)*H*.5,q=dnPos(S,a+(k+.5)*(b-a)/n9+jig,sg*(lat+(rg()-.5)*H*.35));if(S.gd[q.i]>.01)continue;const sc=.85+rg()*.5,yb=dnAssise(cuis,q.x,q.z,q.yr,6.4*sc,q.t);if(yb==null)continue;
      const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z)+(rg()-.5)*1.7; // (jamais face à la route : les maisons se tournent n'importe comment)
      cuis(M(dnMaisonNom(k+(sg<0?0:1))),q.x,yb,q.z,sc,sc,sc,ar);kill('maison',q.x,yb,q.z,3.6*sc,2.8*sc);n++;}
    N.village=n;N.sc.push(['village',Math.round(a),Math.round(b)]);};
  // LES ROCHERS D'ARRAKIS (2026-11-05 — remplacent le grand sphinx et sa pyramide) : un groupe de rochers dressés, de tailles différentes, jamais symétrique — un passage spectaculaire et contemplatif
  const monolithes=(a,b,H)=>{const lat=RH+H*.55+12,mid=(a+b)/2,offs=[-.42,-.08,.30];let n=0;
    for(let k=0;k<offs.length;k++)for(const sg of [-1,1]){if(k===1&&sg>0)continue; // (un rocher de moins d'un côté : jamais une paire bien rangée)
      const s=mid+offs[k]*(b-a)*.5,q=dnPos(S,s,sg*(lat+k*H*.18));if(S.gd[q.i]>.01)continue;const h9=H*(.7+.5*((k*2+(sg<0?0:1))%3)/2),yb=dnAssise(cuis,q.x,q.z,q.yr,h9*.78,q.t); /* (2026-11-07) le rocher est tourné au hasard : le podium couvre la diagonale de sa dalle */if(yb==null)continue;
      const ar=rg()*6.28;cuis(M(dnRocherNom(k+(sg<0?0:1))),q.x,yb,q.z,h9*.3,h9,h9*.3,ar);kill('rocher',q.x,yb,q.z,h9*.32,h9*1.05);n++;}
    N.rochers=n;N.sc.push(['monolithes',Math.round(a),Math.round(b)]);};
  // LE VER DES SABLES (dunes-ver.js) : l'arche enjambe la route, au milieu de la scène ; son axe (x local) est en travers de la route
  /* (2026-11-07) MESURÉ (graine 4) : dnAssise posait, SOUS la route, le podium de pierre de 30 m de large qui rattrape le sable (la dalle est à 10 m au-dessus) : dans un virage couché, sa corniche
     perçait le bitume du côté bas. Le ver n'a pas de podium : sa base est la dalle ; puis on l'enfonce jusqu'à ce que sa QUEUE (x = −0,88 s, 0,36 s sous la base) et sa TÊTE entrent dans le sable — au plus 0,3 s (le ventre reste à plus de 30 m au-dessus de la route) */
  const ver=(c)=>{const q=dnPos(S,(c.a+c.b)/2,0),h0=dnHauteur(q.x,q.z,o9s);if(o9s.eau)return;let yb=Math.max(h0-.3,q.yr-1.2);
    /* (2026-11-07) LE VER SUIT LA DALLE : dans un virage couché (jusqu'à 40°), la berme et le sable du plateau sont penchés comme la dalle (dnProfil) ; un ver DROIT y pendait d'un côté (queue 6-14 m au-dessus du sable)
       et frôlait le bord haut de l'autre. Il est désormais incliné de l'angle de la dalle (autour de l'axe de la route) : son arche garde la même hauteur au-dessus du bitume partout, ses deux bouts la même distance au sable. */
    const bk=S.bk?S.bk[q.i]:0,cb=Math.cos(bk),sb=Math.sin(bk),tb=Math.tan(bk),lx=S.tz[q.i],lz=-S.tx[q.i];let enf=0,mx=.3*c.s; /* l'axe x local du ver, tourné de q.t : (tz, −tx) ; le côté +x local est le côté haut de la dalle (tan bk) */
    for(let k=0;k<=48;k++){const t9=k/48,th=-.16*Math.PI+1.06*Math.PI*t9,x0=-Math.cos(th)*c.s,y0=.74*Math.sin(th)*c.s-(.095+.075*t9)*1.1*c.s,X=x0*cb-y0*sb,Y=x0*sb+y0*cb; /* le dessous du corps, penché */
      if(Math.abs(X)<=ROAD_HALF+3)mx=Math.min(mx,(yb-1+Y)-(S.y[q.i]+X*tb)-9); /* le ventre : à 9 m au moins de la dalle */
      else if(y0<.05*c.s){const g9=dnHauteur(q.x+lx*X,q.z+lz*X,o9s);enf=Math.max(enf,yb-1+Y-(g9-2));}} /* la queue et la tête : 2 m dans le sable */
    yb-=Math.max(0,Math.min(mx,enf));
    cuis(M('ver'),q.x,yb-1,q.z,c.s,c.s,c.s,q.t,0,bk);N.ver=(N.ver|0)+1;N.sc.push(['ver',c.a,c.b]);};
  // LES BRASEROS (2026-10-22) : des paires de vasques sur la berme, de part et d'autre de la route — la nuit, ce sont elles qui éclairent la procession
  const braise=(s,lat0,h)=>{for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat0);if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,h*.62,q.t);if(yb==null)continue;cuis(M('brasero'),q.x,yb,q.z,h,h,h,q.t);N.braseros=(N.braseros|0)+1;}};
  // LES BALISES DES CRÊTES (2026-10-22, Léo : « le joueur peut piquer en bas ou décoller ») : à chaque crête, deux monolithes de part et d'autre de la route, juste avant l'apex — le tremplin se lit de loin (la porte du ciel)
  {let n=0;for(const v of DN.lev||[]){if(performance.now()>JF.lim)yield;if(v.tag==='bosse')continue;if(DN_ACTES.on&&v.tag!=='grande'){braise(v.s-40,RH+5,3.4);continue;}for(const sg of [-1,1]){const q=dnPos(S,v.s-12,sg*(RH+9.5)); /* (2026-11-07) 1,5 m plus loin : la corniche de son podium (aussi large que le socle) restait au bord du couloir (graine 9) */if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,11,q.t);if(yb==null)continue;
      const hs=(26+rg()*8)*Math.min(1.2,K);cuis(M('monolithe'),q.x,yb,q.z,hs/64*1.1,hs/64,hs/64*1.1,q.t);kill('monolithe',q.x,yb,q.z,4.6,hs);n++;}braise(v.s-40,RH+5,3.4);braise(v.s+30,RH+5,3.4);}N.portiques=n;}
  for(const c of DN.scn){if(performance.now()>JF.lim)yield;if(c.k==='allee')allee(c.a,c.b,c.len);else if(c.k==='village')village(c.a,c.b,c.H);else if(c.k==='monolithes')monolithes(c.a,c.b,c.H);else if(c.k==='ver')ver(c);}
  // LES ÉBOULIS : des blocs et des éclats de roche, de part et d'autre, à 10-70 m du bord, sur chaque tronçon calme
  const seg=dnTroncons();let nr=0;for(const q of seg){if(performance.now()>JF.lim)yield;const n9=Math.round((q.b-q.a)/38*PAL.b('dnRuines',1)*(DN_ACTES.on?((q.sp==='vlei'||q.sp==='avenue')?.6:0):1));for(let k=0;k<n9;k++){if((k&7)===7&&performance.now()>JF.lim)yield;const s=q.a+rg()*(q.b-q.a),sg=rg()<.5?-1:1,lat=RH+10+rg()*rg()*60,p=dnPos(S,s,sg*lat);if(S.gd[p.i]>.01)continue;const g=dnHauteur(p.x,p.z,o9s);if(o9s.eau)continue;
      const r=rg();if(r<.45){const sc=(3+rg()*4)*K*.8,lo=dnSolBas(p.x,p.z,sc*1.25,sc*1.25,0);cuis(M(dnTeteNom(p)),p.x,Math.min(g-sc*.42,lo-sc*.32),p.z,sc,sc,sc,rg()*6.28,(rg()-.5)*.5,(rg()-.4)*.4);}
      else{const sc=(2+rg()*4)*K*.8,bx=sc*(1+rg()),by=sc*(.6+rg()*.6),bz=sc*(1+rg()),ry=rg()*6.28,tx=(rg()-.5)*.4,tz=(rg()-.5)*.4,lo=dnSolBas(p.x,p.z,bx*.5,bz*.5,ry); /* (2026-11-07) le même tirage, dans le même ordre ; le bloc s'enfonce sous le sable le plus bas de son emprise (et de quoi cacher son inclinaison) */
        cuis(M('bloc'),p.x,Math.min(g,lo)-.4-.1*Math.max(bx,bz),p.z,bx,by,bz,ry,tx,tz,[.88,.76,.58]);}nr++;}}N.ruines=nr;}
/* <<<FIN DUNES>>> */
