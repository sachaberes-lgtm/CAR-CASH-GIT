/* LE LANCER DOSÉ (2026-10-15, Léo : la voiture lancée au doigt doit tourner un peu plus — « satisfaisant », mais « c'est pas non plus
   l'espace »). Avant, l'élan s'éteignait en exp(−2,4 t) : la moitié de la vitesse perdue en 0,29 s — elle freinait sec puis traînait — et
   sans plafond (un lancer de 4 000 px/s faisait 2,8 tours). Au lâcher (bqLance), la vitesse du doigt v (rad/s, la même qu'avant) devient un
   ÉLAN PLANIFIÉ : une distance D = 2 tours × tanh(0,8 v / 2 tours) — ~0,5 tour pour un petit lancer, ~1,5 pour un moyen, jamais 2 —, une
   durée qui grandit avec elle (1,45 s → 2,05 s ; avant le 15/10 au soir : 0,65 et 1,3 s, Léo en voulait « un tout petit peu moins de
   friction »), et la courbe v (1 − t/T)^(q−1) : elle part EXACTEMENT à la vitesse du doigt (aucun à-coup au
   lâcher), ralentit comme par frottement et s'arrête en douceur (q ≥ 2,5 : la décélération s'éteint avec elle). Pas de rebond. Un doigt
   posé pendant qu'elle tourne l'ATTRAPE net (GBQ.lan à null), et ce toucher-là ne la remet pas en vitrine. Doigt arrêté avant le lâcher
   (90 ms) : pas d'élan, comme avant. */
const BQ_GLISSE=.8; // (2026-10-15, Léo : « un tout petit peu moins de friction que là ») 0,65 → 0,8 : le même lancer va ~20 % plus loin (+23 % petit, +14 % moyen), ~0,2 s de plus
function bqLance(v){GBQ.lan=null;const a=Math.abs(v);if(a<.05){GBQ.yawV=0;return;}
  const DM=4*Math.PI,D=DM*Math.tanh(BQ_GLISSE*a/DM),T0=1.45+.6*D/DM,q=Math.max(2.5,T0*a/D);GBQ.lan={y0:GBQ.yaw,D:Math.sign(v)*D,T:q*D/a,q:q,t:0};}
function bqLanceTick(dt){const L=GBQ.lan;L.t+=dt;const u=Math.min(1,L.t/L.T),r=Math.pow(1-u,L.q-1);
  GBQ.yaw=L.y0+L.D*(1-r*(1-u));GBQ.yawV=L.D*L.q*r/L.T;if(u>=1){GBQ.lan=null;GBQ.yawV=0;}}
/* chaque image du garage, juste après la pose de la caisse sur le plateau */
function garBqIndus(dt,ay,t9){
  dt=Math.min(.05,dt);const veut=bqIndusVoulu();
  /* (v3, Léo : « au lieu d'un glitch, la voiture se décolle de la plateforme de manière cool et lévite ; une grosse lueur blanche derrière
     elle ; il ne reste que son ombre ; après, la page de vente ») LE TEMPS DU GESTE : 0 → 0,12 s elle s'enfonce, puis se DÉCOLLE (ressort doux) ;
     0,3 s la LUEUR naît derrière elle et grandit ; 0,8 s l'ÉCLAT blanc monte (pic à ~0,95 s) : dessous, l'atelier laisse place au blanc ;
     puis la page de vente. Au retour : un éclat bref, l'atelier revient dessous, elle se repose. */
  /* (2026-10-14, Léo : « la transition entre les deux, c'est peut-être un peu lourd ; reviens sur le truc glitch ») LE GLITCH revient : le
     geste lance garGlitch (0,72 s de bandes et de tressauts), le décor BASCULE dessous à son pic (0,16 s) ; la caisse décolle aussitôt
     (plus de petit coup, ni de lueur blanche, ni d'éclat). Au retour, pareil, à l'envers. */
  try{bqSon(dt,veut&&!GAR.go);}catch(e){} // (2026-10-14) la boutique a sa voix (voir LE SON DE LA BOUTIQUE)
  /* (2026-10-15, Sacha : « la transition entre le garage et la boutique est pas smooth ») vu au banc : au toucher, l'interface du garage
     disparaissait d'un coup et les touches BLANCHES de la boutique se posaient sur l'atelier noir ; 0,16 s plus tard le décor passait au blanc
     d'une image à l'autre (bioApply ne fond pas) et la page de vente sautait en place. Désormais LE VOILE (bqVoile) monte en 0,16 s — blanc
     vers la boutique, nuit vers l'atelier —, les DEUX bascules (l'interface : bqClasses, le décor : garBqAmbiance) tombent ENSEMBLE sous lui,
     puis il se lève en --t-slow sur l'écran déjà en place. Le glitch de Léo reste par-dessus. */
  if(veut!==GBQ.veut){const avant=GBQ.on;GBQ.veut=veut;GBQ.t=0;GBQ.bascule=false;GBQ.eclat=0;GBQ.coupT=-1;const dedans=!GAR.go&&garageOn&&!!gEl&&!['menu','missions','quiet','launching'].some(function(c){return gEl.classList.contains(c);});
    GBQ.v0=performance.now();if(dedans&&(veut||avant))bqVoile(veut);else{bqClasses(veut);GBQ.v0=0;} /* on sort du garage (HOME, missions, départ) : la bascule d'avant, d'un coup, sous le volet de l'écran */
    if(veut){garBqBatit();garBqLueurBatit();GBQ.boum=1;GBQ.levV=2.6;}} /* (2026-10-16, Léo : « j'aime pas trop la transition glitch ») plus de garGlitch : LE SOUFFLE DE LUMIÈRE (bqVoile) fait seul la bascule */
  GBQ.t+=dt;
  if(GBQ.pose){if(!veut||GAR.go)bqPoseLache('sort');else if(garageI!==GBQ.poseI)bqPoseLache('caisse');else if((GBQ.ong||'cat')!==GBQ.poseO||(GBQ.cat||'voiture')!==GBQ.poseC)bqPoseLache();} // (2026-10-15) LA POSE TENUE : une autre caisse, un autre onglet, la sortie → le plateau
  GBQ.platK=(GBQ.pose||BRB.p>0||BRB.bqK>0)?0:Math.min(1,GBQ.platK+dt/.9); // (2026-10-19) le bras des figures est là : la vitrine ne tourne plus d'elle-même
  if(veut&&GBQ.coupT>=0){GBQ.coupT+=dt;if(GBQ.coupT>=.12&&!GBQ.boum){GBQ.boum=1;GBQ.levV=3.4;garBqChoc();try{if(SONV2)sfx('ui.volet');}catch(e){}try{hap(10);}catch(e){}}}
  GBQ.lueur=0;
  if(!GBQ.bascule&&GBQ.t>.26&&performance.now()-(GBQ.v0||0)>285){ /* (2026-10-15) en temps RÉEL : le voile est monté, même si la 1re image de la boutique (garBqBatit) a toussé — (2026-10-16) 285 ms : LE SOUFFLE DE LUMIÈRE couvre tout l'écran */GBQ.bascule=true;GBQ.on=veut;bqClasses(veut);garBqAmbiance(veut);bqVoile(null);GBQ.rafale=veut;}
  if(GAR.go&&(GBQ.on||GBQ.veut)){GBQ.on=GBQ.veut=false;GBQ.bascule=true;bqClasses(false);garBqAmbiance(false);GBQ.lueur=0;}
  try{garBqLueur(ay);garBqGloire(dt,t9);}catch(e){}
  const on=GBQ.on;
  if(GBQ.grp){GBQ.grp.visible=on;if(on){GAR.root.visible=false;GBQ.grp.position.set(0,ay,0);GBQ.grp.rotation.y=garCamA();}}
  {const c=on?1:0,w=3;GBQ.kv+=(w*w*(c-GBQ.k)-2*w*GBQ.kv)*dt;GBQ.k+=GBQ.kv*dt;}
  // LA LÉVITATION : le petit coup (elle s'enfonce), le BOUM (elle bondit, dépasse), puis elle flotte
  if(veut&&GBQ.coupT>=0&&GBQ.coupT<.12){GBQ.lev=-.06*Math.sin(Math.PI*.5*GBQ.coupT/.12);GBQ.levV=0;}
  else{const c=veut?.95*(1-BRB.bqK):0,w=veut?5.6:5.5,z=veut?.55:1; /* (2026-10-19) BRB.bqK : les deux bras la POSENT sur le plateau (le bras des figures va la prendre) */GBQ.levV+=(w*w*(c-GBQ.lev)-2*z*w*GBQ.levV)*dt;GBQ.lev+=GBQ.levV*dt;}
  if(!veut&&Math.abs(GBQ.lev)<.002&&Math.abs(GBQ.levV)<.01){GBQ.lev=0;GBQ.levV=0;}
  // LE DOIGT : lacet libre avec élan, tangage qui revient doucement ; au retour, elle se repose à plat
  if(!GBQ.drag&&GBQ.pose){if(GBQ.lan)bqLanceTick(dt);else{GBQ.yaw+=GBQ.yawV*dt;GBQ.yawV*=Math.exp(-2.4*dt);}GBQ.pitV=GBQ.rolV=0;} /* (2026-10-15) POSÉE À LA MAIN : l'élan du lancer (bqLanceTick), puis elle garde sa pose — ni ressort, ni plateau */
  else if(!GBQ.drag){if(GBQ.lan)bqLanceTick(dt);else{GBQ.yaw+=GBQ.yawV*dt;GBQ.yawV*=Math.exp(-2.4*dt);}const pw=1.7;GBQ.pitV+=(pw*pw*(0-GBQ.pit)-2*pw*GBQ.pitV)*dt;GBQ.pit+=GBQ.pitV*dt;GBQ.rol=GBQ.rol||0;GBQ.rolV=GBQ.rolV||0;GBQ.rolV+=(pw*pw*(0-GBQ.rol)-2*pw*GBQ.rolV)*dt;GBQ.rol+=GBQ.rolV*dt;}
  if(GBQ.yawGo){if(GBQ.drag)GBQ.yawGo=0;else{const tg=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;GBQ.yaw+=(tg-GBQ.yaw)*Math.min(1,dt*4);if(Math.abs(tg-GBQ.yaw)<.01){GBQ.yaw=tg;GBQ.yawGo=0;}}}
  if(!veut){const tg=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;GBQ.yaw+=(tg-GBQ.yaw)*Math.min(1,dt*5);GBQ.yawV=0;GBQ.lan=null;}
  const fl=Math.max(0,Math.min(1,GBQ.lev/.95));
  if(Math.abs(GBQ.lev)>1e-4||Math.abs(GBQ.yaw)>1e-4||Math.abs(GBQ.pit)>1e-4||Math.abs(GBQ.rol||0)>1e-4){
    {const b9=GBQ.ba||0;GBQ.levB=.38*b9*b9*(3-2*b9);}if(GBQ.tapT<.32)GBQ.tapT+=dt;const tu9=Math.min(1,GBQ.tapT/.32);carGroup.position.y+=GBQ.lev+GBQ.levB+(GBQ.hop||0)+Math.sin(Math.PI*tu9)*.07*(1-tu9)+Math.sin(t9*1.6)*.05*fl; // (2026-10-20) + le bond du TAP (bqTape)
    // (2026-10-13) +38 cm quand les BRAS la tiennent : la place de les voir
    const cA=garCamA(),q=GBQ._q||(GBQ._q=new THREE.Quaternion()),q2=GBQ._q2||(GBQ._q2=new THREE.Quaternion()),ax=GBQ._ax||(GBQ._ax=new THREE.Vector3()),Y=GBQ._Y||(GBQ._Y=new THREE.Vector3(0,1,0));
    q.setFromAxisAngle(Y,carGroup.rotation.y+GBQ.yaw);ax.set(1,0,0);q2.setFromAxisAngle(ax,GBQ.pit+Math.sin(t9*1.1)*.025*fl);q.multiply(q2);if(GBQ.rol){ax.set(0,0,1);q2.setFromAxisAngle(ax,GBQ.rol);q.multiply(q2);} /* (13/10) le ROULIS : saisie par le flanc, elle bascule vers nous (voir bqPrise) */ /* (2026-10-13, Léo : « penchée vers le bas, capot vers l'avant ») le glissé vertical la fait TANGUER sur son propre axe (l'axe de ses roues : le nez, à +z, plonge quand on tire vers le bas) — avant, elle basculait vers la caméra (de profil : le toit, puis le ventre) */
    ax.set(Math.sin(cA),0,Math.cos(cA));q2.setFromAxisAngle(ax,THREE.MathUtils.clamp(GBQ.yawV*.03,-.12,.12)*fl); /* (2026-10-14, Léo : « un peu penchée ») plus de roulis permanent : elle flotte DROITE */q.premultiply(q2);carGroup.quaternion.copy(q);}
  /* (2026-10-12, Léo : « la voiture passe à travers la plateforme ») penchée, elle se SOULÈVE de ce qu'il faut. (2026-10-13, Léo : « penchée
     capot vers l'avant, elle passe toujours à travers ») mesuré au banc : la levée suivait en RESSORT (×14/s) — un geste rapide la laissait 30 cm
     DANS le socle pendant quelques images ; et la boîte de garGabarit (carrosserie seule, supposée centrée) se trompait dans les deux sens (1,7 m
     de levée pour rien, ou un nez qui dépasse). Désormais : son vrai FOND (bqDessous, roues et pare-chocs compris), tourné comme elle, à l'échelle,
     et la levée MONTE à l'instant (elle redescend en douceur) */
  if(GBQ.socleH&&GBQ.grp&&GBQ.grp.visible){const F=bqDessous().fond,q=carGroup.quaternion,s9=carGroup.scale,c=GBQ._cc||(GBQ._cc=new THREE.Vector3());let bas=1e9;
    for(let i=0;i<F.length;i+=3){c.set(F[i]*s9.x,F[i+1]*s9.y,F[i+2]*s9.z).applyQuaternion(q);if(c.y<bas)bas=c.y;}
    if(bas>1e8){const G=garGabarit();for(const sx of [-1,1])for(const sz of [-1,1])for(const sy of [0,1]){c.set(sx*G.b,sy*G.H,sz*G.a).applyQuaternion(q);if(c.y<bas)bas=c.y;}}
    const sol=ay+GBQ.socleH+.06,besoin=Math.max(0,sol-(carGroup.position.y+bas));GBQ.leve=besoin>=(GBQ.leve||0)?besoin:GBQ.leve+(besoin-GBQ.leve)*Math.min(1,dt*4);
    GBQ.basY=carGroup.position.y+bas+GBQ.leve;carGroup.position.y+=GBQ.leve;}else GBQ.leve=0;
  // l'ombre sous la caisse et l'onde du boum
  if(GBQ.anneaux&&on){GBQ.anneaux[0].rotation.z+=dt*.12;GBQ.anneaux[1].rotation.z-=dt*.22;}
  if(!veut&&Math.abs(GBQ.lev)<.002){GBQ.yaw-=Math.round(GBQ.yaw/(2*Math.PI))*2*Math.PI;if(Math.abs(GBQ.yaw)<.002)GBQ.yaw=0;if(Math.abs(GBQ.pit)<.002){GBQ.pit=0;GBQ.pitV=0;}if(Math.abs(GBQ.rol||0)<.002){GBQ.rol=0;GBQ.rolV=0;}} // reposée : plus rien n'oriente la caisse que le plateau
  if(GBQ.omb){const s=4.2-.9*fl;GBQ.omb.scale.set(s,s,1);GBQ.omb.material.opacity=.42-.12*fl;}
  if(GBQ.choc){GBQ.chocT+=dt;const u=GBQ.chocT/.55;GBQ.choc.visible=u<1;if(u<1){const s=1.2+4.2*(1-Math.pow(1-u,3));GBQ.choc.scale.set(s,s,s);GBQ.choc.position.set(0,ay+GAR.POD+.06,0);GBQ.choc.material.opacity=.85*(1-u);}}
  try{garBqBras(dt,t9,ay);}catch(e){window.__brasErr=e;}
  try{bqOutilTick(dt,t9,ay);}catch(e){window.__outilErr=e;}
  try{bqGesteTick(dt,t9);bqPoussiere(t9);}catch(e){window.__gesteErr=e;}
  try{garBqPanneau(dt,t9);}catch(e){}
  if(GBQ.rafale){GBQ.rafale=false;if(GBQ.on)try{photoRafale(PHOTO_RAFALE_MS);}catch(e){}} // (2026-10-16) sous le voile plein : les vignettes en vue, à la chaîne (voir LE STUDIO SANS À-COUPS) — la grille se découvre remplie
}
/* LE DESSOUS DE LA CAISSE (bqDessous) — relevé une fois par caisse, dans SON repère : le FOND (le point le plus bas de chaque case de 8 cm,
   toutes pièces pleines comprises — roues, pare-chocs, becquet : la levée qui l'empêche de traverser le socle) et le PLANCHER (sans les roues,
   une case de marge autour d'elles : là où les bras la prennent). */
function bqDessous(){const k=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length;if(GBQ.hm&&GBQ.hm.k===k)return GBQ.hm;
  carGroup.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(carGroup.matrixWorld).invert(),v=new THREE.Vector3(),w=new THREE.Vector3(),u=new THREE.Vector3(),bb=new THREE.Box3(),b9=new THREE.Box3(),PC=[];
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const mt=Array.isArray(o.material)?o.material[0]:o.material;
    if((mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))||(o.userData&&o.userData.sol))return;
    let roue=false;for(let q9=o;q9&&q9!==carGroup;q9=q9.parent){if(!q9.visible)return;const u9=q9.userData;if(u9&&(u9.essieu||u9.R!=null))roue=true;} // (une roue : son empreinte est notée à part)
    const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b9.copy(o.geometry.boundingBox).applyMatrix4(M);bb.union(b9);PC.push([o,M,roue]);});
  if(bb.isEmpty())return GBQ.hm={k:k,fond:new Float32Array(0),H:null};
  // (2026-10-13, Léo : « penchée capot vers l'avant, elle passe à travers ») la grille couvre la VRAIE boîte des pièces (garGabarit ne mesurait que la
  // carrosserie, supposée centrée : un nez plus long que l'arrière en sortait)
  const P=.08,x0=bb.min.x-P,z0=bb.min.z-P,nx=Math.ceil((bb.max.x-bb.min.x)/P)+3,nz=Math.ceil((bb.max.z-bb.min.z)/P)+3,H=new Float32Array(nx*nz).fill(1e9),Ro=new Uint8Array(nx*nz),
    FY=new Float32Array(nx*nz).fill(1e9),FX=new Float32Array(nx*nz),FZ=new Float32Array(nx*nz);
  let roue=false;const pose=function(p){const ix=Math.round((p.x-x0)/P),iz=Math.round((p.z-z0)/P);if(ix<0||iz<0||ix>=nx||iz>=nz)return;const j=iz*nx+ix;
    if(p.y<FY[j]){FY[j]=p.y;FX[j]=p.x;FZ[j]=p.z;}if(roue)Ro[j]=1;else if(p.y<H[j])H[j]=p.y;};
  for(const e of PC){const o=e[0],M=e[1];roue=e[2];const a=o.geometry.attributes.position,idx=o.geometry.index,nT=idx?idx.count/3:a.count/3,st=nT>9000?Math.ceil(nT/9000):1;
    if(st>1)for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(M);pose(v);} // (pièce très fine : tous ses sommets comptent pour le fond, même ceux des triangles sautés)
    for(let t=0;t<nT;t+=st){const i0=idx?idx.getX(3*t):3*t,i1=idx?idx.getX(3*t+1):3*t+1,i2=idx?idx.getX(3*t+2):3*t+2;
      v.fromBufferAttribute(a,i0).applyMatrix4(M);w.fromBufferAttribute(a,i1).applyMatrix4(M);u.fromBufferAttribute(a,i2).applyMatrix4(M);pose(v);pose(w);pose(u);
      // le triangle RASTÉRISÉ vu de dessous : chaque centre de case qu'il couvre prend sa hauteur exacte (une grande face de plancher n'a pas de sommets au milieu)
      const ar=(w.x-v.x)*(u.z-v.z)-(u.x-v.x)*(w.z-v.z);if(Math.abs(ar)<1e-7)continue;
      const ia=Math.max(0,Math.ceil((Math.min(v.x,w.x,u.x)-x0)/P)),ib=Math.min(nx-1,Math.floor((Math.max(v.x,w.x,u.x)-x0)/P)),ka=Math.max(0,Math.ceil((Math.min(v.z,w.z,u.z)-z0)/P)),kb=Math.min(nz-1,Math.floor((Math.max(v.z,w.z,u.z)-z0)/P));
      for(let ix=ia;ix<=ib;ix++)for(let iz=ka;iz<=kb;iz++){const cx=x0+ix*P,cz=z0+iz*P,l1=((w.x-cx)*(u.z-cz)-(u.x-cx)*(w.z-cz))/ar,l2=((u.x-cx)*(v.z-cz)-(v.x-cx)*(u.z-cz))/ar,l3=1-l1-l2;
        if(l1<-1e-4||l2<-1e-4||l3<-1e-4)continue;const j=iz*nx+ix,y=l1*v.y+l2*w.y+l3*u.y;if(y<FY[j]){FY[j]=y;FX[j]=cx;FZ[j]=cz;}if(roue){Ro[j]=1;continue;}if(y<H[j])H[j]=y;}}}
  {const R2=Ro.slice();for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++)if(R2[iz*nx+ix])for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const X=ix+a,Z=iz+b;if(X>=0&&Z>=0&&X<nx&&Z<nz)Ro[Z*nx+X]=1;}} // l'empreinte des roues, une case de marge
  for(let j=0;j<H.length;j++)if(Ro[j])H[j]=1e9;
  const F=[];for(let j=0;j<FY.length;j++)if(FY[j]<1e8)F.push(FX[j],FY[j],FZ[j]);
  // LE FOND : penchée de moins de 90°, le point le plus bas d'une verticale de la caisse est toujours celui du bas — ces points suffisent pour savoir exactement où elle touche
  return GBQ.hm={k:k,fond:new Float32Array(F),H:H,nx:nx,nz:nz,x0:x0,z0:z0,P:P,bb:bb};}
/* le PLANCHER sous un point de la caisse (repère caisse) : la case la plus proche qui en a un, en cherchant d'abord vers le milieu */
function bqPlancher(hm,lx,lz,out){if(!hm.H)return null;const P=hm.P,ix0=Math.round((lx-hm.x0)/P),iz0=Math.round((lz-hm.z0)/P),zc=Math.round(((hm.bb.min.z+hm.bb.max.z)/2-hm.z0)/P),sz=iz0>zc?-1:1;
  for(let r=0;r<14;r++)for(const dz of [r*sz,-r*sz])for(const dx of [0,1,-1,2,-2]){const ix=ix0+dx,iz=iz0+dz;if(ix<0||iz<0||ix>=hm.nx||iz>=hm.nz)continue;const y=hm.H[iz*hm.nx+ix];
    if(y<1e8)return out.set(hm.x0+ix*P,y,hm.z0+iz*P);}
  return null;}
/* LES BRAS (2026-10-13, Léo : « tu as mal compris l'ondulation : il fallait juste régler le bug des trucs blancs qui tiennent la voiture ; sinon
   des bras mécaniques argentés qui tournent et manipulent la voiture, ça serait cool » ; « ça fait Blade Runner, sur fond blanc néoclassique »)
   — le coussin de cubes et l'onde sont retirés. Deux bras robots d'argent sortent du socle, posés sur un PLATEAU TOURNANT d'argent cranté de
   graphite : chacun tient la caisse par son plancher (un tiers devant, un tiers derrière, jamais une roue), une pince à plat contre elle.
   Le plateau tourne avec la caisse (les bras la font tourner), et quand elle plonge ou se cabre, chaque bras se plie ou s'allonge (deux
   segments, coude vers l'extérieur ; trop loin : l'avant-bras sort son vérin chromé). Un vérin le long du bras, une diode ambre au poignet.
   Ils montent du socle à l'arrivée et y rentrent au départ. Hors du reflet du sol, comme la caisse. */
const BQB={L1:.62,L2:.58,hB:.2};
function garBqBrasBatit(){if(GBQ.bras)return GBQ.bras;
  const g=new THREE.Group();g.visible=false;scene.add(g);GBQ.bras=g;
  // le métal reflète la SALLE BLANCHE (pas le ciel du jeu, rosé) : six faces peintes — plafond blanc, murs blancs qui fondent au gris perle, un trait
  // d'horizon graphite (ce qui fait lire le chrome), le sol gris
  const envB=(function(){const f=function(k){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');
      if(k===2){x.fillStyle='#ffffff';x.fillRect(0,0,64,64);}else if(k===3){x.fillStyle='#7d838d';x.fillRect(0,0,64,64);}
      else{const gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#ffffff');gr.addColorStop(.46,'#eef1f5');gr.addColorStop(.5,'#3a3f48');gr.addColorStop(.56,'#c9ced6');gr.addColorStop(1,'#8d939c');x.fillStyle=gr;x.fillRect(0,0,64,64);}
      return cv;};const t=new THREE.CubeTexture([f(0),f(1),f(2),f(3),f(4),f(5)]);t.needsUpdate=true;return t;})();
  const argent=new THREE.MeshPhongMaterial({color:0xd5dbe3,specular:0xffffff,shininess:150,envMap:envB,reflectivity:.5,combine:THREE.MixOperation,flatShading:true,fog:false}),
    chrome=new THREE.MeshPhongMaterial({color:0xf3f5f8,specular:0xffffff,shininess:300,envMap:envB,reflectivity:.85,combine:THREE.MixOperation,fog:false}),
    graph=new THREE.MeshPhongMaterial({color:0x2b2f37,specular:0x7c838e,shininess:70,flatShading:true,fog:false}),
    diode=new THREE.MeshBasicMaterial({color:0xffb347,fog:false});diode.color.setRGB(1.9,1.05,.38); // (au-delà de 1 : le halo du jeu la fait luire)
  GBQ.matB={argent:argent,chrome:chrome,graph:graph,diode:diode}; // (les bras d'atelier les reprennent)
  const cyl=new THREE.CylinderGeometry(1,1,1,8),sph=new THREE.SphereGeometry(1,10,8),box=new THREE.BoxGeometry(1,1,1),M=function(geo,mt){const m=new THREE.Mesh(geo,mt);g.add(m);return m;};
  // le plateau tournant : un disque d'argent, douze crans de graphite sur sa tranche
  const pl=new THREE.Group();g.add(pl);GBQ.brasPl=pl;
  /* (2026-10-14, Léo : « la plateforme aussi grosse que celle du garage, plus fixe ») le plateau a la TAILLE de celui de l'atelier (rayon 4,4,
     12 cm d'épaisseur, son dessus = le haut du « socle » : GBQ.socleH), un anneau de graphite à mi-rayon, douze crans sur le bord — et il ne
     tourne plus avec la caisse (voir garBqBras) */
  {const d=new THREE.Mesh(new THREE.CylinderGeometry(1.83,1.89,.04,64),argent);d.position.y=.02;pl.add(d); /* (même jour, Léo : « c'était mieux avant, juste le socle un tout petit peu plus grand, 1,5× ») le disque d'avant ×1,5 */
   const c=new THREE.Mesh(new THREE.TorusGeometry(.9,.028,4,64),graph);c.rotation.x=Math.PI/2;c.position.y=.042;pl.add(c);
   for(let i=0;i<12;i++){const n=new THREE.Mesh(box,graph);const a=i/12*Math.PI*2;n.scale.set(.08,.045,.2);n.position.set(Math.sin(a)*1.74,.025,Math.cos(a)*1.74);n.rotation.y=a;pl.add(n);}}
  GBQ.brasL=[0,1].map(function(){const A={
      pied:M(cyl,graph),tour:M(cyl,argent),epaule:M(sph,graph),bras:M(cyl,argent),verin:M(cyl,chrome),coude:M(cyl,graph),
      avant:M(cyl,argent),tige:M(cyl,chrome),poignet:M(sph,graph),main:new THREE.Group()};
    g.add(A.main);const pad=new THREE.Mesh(box,graph);pad.scale.set(.32,.035,.2);pad.position.y=-.03;A.main.add(pad);
    for(const s of [-1,1]){const d9=new THREE.Mesh(box,argent);d9.scale.set(.035,.08,.17);d9.position.set(s*.16,-.02,0);A.main.add(d9);}
    const led=new THREE.Mesh(box,diode);led.scale.set(.05,.02,.02);led.position.set(0,-.05,.105);A.main.add(led);
    return A;});
  return g;}
function bqSeg(m,A,B,r){const Y=bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),d=bqSeg._d||(bqSeg._d=new THREE.Vector3());d.subVectors(B,A);const L=d.length();if(L<1e-5){m.visible=false;return;}m.visible=true;
  m.position.addVectors(A,B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,d.multiplyScalar(1/L));m.scale.set(r,L,r);}
function garBqBras(dt,t9,ay){
  const vis=!!(GBQ.grp&&GBQ.grp.visible&&GBQ.socleH),rentre9=BRB.bqK>.02&&Math.abs(GBQ.lev||0)<.12;GBQ.ba=Math.max(0,Math.min(1,(GBQ.ba||0)+(GBQ.on&&vis&&!rentre9?dt*1.6:-dt*2.4))); // (2026-10-19) la caisse posée, ils rentrent dans le socle : le bras des figures prend la suite
  if(!vis||(GBQ.ba<=0&&!(BRB.bqK>0))){if(GBQ.bras)GBQ.bras.visible=false;return;} // (2026-10-19) rentrés pour le bras des figures : le PLATEAU reste (la caisse y est posée), eux sont sous le sol
  const g=garBqBrasBatit(),hm=bqDessous();g.visible=true;
  const V=GBQ._bv||(GBQ._bv=[0,1,2,3,4,5,6,7,8,9].map(function(){return new THREE.Vector3();})),[G,S,W,E,D,o,n,up,T,X]=V;
  const e=GBQ.ba*GBQ.ba*(3-2*GBQ.ba),y0=ay+GBQ.socleH,q=carGroup.quaternion,s9=carGroup.scale,p0=carGroup.position,mont=(1-e)*.75; // ils montent du socle
  // le plateau suit le cap de la caisse
  X.set(0,0,1).applyQuaternion(q);g.position.set(0,0,0);GBQ.brasPl.position.set(0,y0-mont*.05,0);GBQ.brasPl.rotation.y=0; /* (14/10) FIXE : il ne suit plus le cap de la caisse */
  up.set(0,1,0).applyQuaternion(q);
  const bb=hm.bb,zc=bb?(bb.min.z+bb.max.z)/2:0,lg=bb?(bb.max.z-bb.min.z):4;
  for(let i=0;i<2;i++){const A=GBQ.brasL[i],sg=i?-1:1;
    if(!bqPlancher(hm,0,zc+sg*.14*lg,G))G.set(0,0,zc+sg*.14*lg);
    G.set(G.x*s9.x,G.y*s9.y,G.z*s9.z).applyQuaternion(q).add(p0);     // la prise, dans le monde
    // le pied, sur le plateau, sous la prise (rayon fixe, dans l'axe du cap)
    const rb=Math.min(1.25,Math.max(.6,.14*lg+.42));T.set(X.x,0,X.z);if(T.lengthSq()<1e-6)T.set(0,0,1);T.normalize().multiplyScalar(sg*rb);
    const yB=y0-mont;S.set(T.x,yB+BQB.hB,T.z);
    A.pied.position.set(T.x,yB+.03,T.z);A.pied.scale.set(.19,.06,.19);A.pied.quaternion.identity();
    A.tour.position.set(T.x,yB+BQB.hB*.55,T.z);A.tour.scale.set(.13,BQB.hB*.9,.13);A.tour.quaternion.identity();
    A.epaule.position.copy(S);A.epaule.scale.setScalar(.11);
    // le poignet sous la pince ; replié (à l'arrivée) : au-dessus du pied, vers l'extérieur
    W.copy(G).addScaledVector(up,-.1);o.set(T.x,0,T.z).normalize();
    D.copy(S).addScaledVector(o,.32).add(n.set(0,.38,0));W.lerpVectors(D,W,e);
    // les deux segments : le coude vers l'extérieur, en haut
    D.subVectors(W,S);let d=D.length();const L1=BQB.L1;let L2=BQB.L2;if(d<1e-4){d=1e-4;D.set(0,1e-4,0);}D.multiplyScalar(1/d);
    n.copy(o).addScaledVector(D,-o.dot(D));if(n.lengthSq()<1e-5)n.set(0,1,0).addScaledVector(D,-D.y);n.normalize();
    let a1=0;if(d>=L1+L2)L2=d-L1;else{const c=(L1*L1+d*d-L2*L2)/(2*L1*d);a1=Math.acos(Math.max(-1,Math.min(1,c)));}
    E.copy(S).addScaledVector(D,Math.cos(a1)*L1).addScaledVector(n,Math.sin(a1)*L1);
    bqSeg(A.bras,S,E,.075);
    {const p1=(GBQ._bp1||(GBQ._bp1=new THREE.Vector3())).copy(S).addScaledVector(n,.1).addScaledVector(D,.05),p2=(GBQ._bp2||(GBQ._bp2=new THREE.Vector3())).lerpVectors(S,E,.62).addScaledVector(n,.075);bqSeg(A.verin,p1,p2,.026);}
    A.coude.position.copy(E);{const ax=(GBQ._bax||(GBQ._bax=new THREE.Vector3())).crossVectors(D,n).normalize();A.coude.quaternion.setFromUnitVectors(bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),ax);}A.coude.scale.set(.09,.19,.09);
    {const f=(GBQ._bf||(GBQ._bf=new THREE.Vector3())).subVectors(W,E),Lf=f.length();f.multiplyScalar(1/Math.max(1e-5,Lf));
     const m1=(GBQ._bm1||(GBQ._bm1=new THREE.Vector3())).copy(E).addScaledVector(f,Math.min(Lf,BQB.L2*.62));bqSeg(A.avant,E,m1,.064);
     const m2=(GBQ._bm2||(GBQ._bm2=new THREE.Vector3())).copy(E).addScaledVector(f,Math.min(Lf,BQB.L2*.45));bqSeg(A.tige,m2,W,.034);} // le vérin chromé sort quand il faut aller plus loin
    A.poignet.position.copy(W);A.poignet.scale.setScalar(.075);
    A.main.position.copy(W).addScaledVector(up,.065*e);A.main.quaternion.copy(q);A.main.scale.setScalar(.4+.6*e);}
}
/* LES GESTES DE LA BOUTIQUE (2026-10-13, Léo : « quand on change de voiture, d'aile ou de traînée, chaque action doit avoir une animation propre
   à elle, en respectant la DA de la boutique, néoclassique digitale ») — des CUBES DE LUMIÈRE (un seul maillage instancié, additif) et une lame :
   · VOITURE — LA MATÉRIALISATION : l'ancienne s'écrase (la bascule du garage), un éclat de cubes blancs part du socle, puis un ANNEAU de cubes
     de lumière court sur le toit de la nouvelle pendant qu'elle se dresse : elle s'imprime sous nos yeux, des étincelles carrées s'en échappent.
   · PEINTURE — LE BAIN : une LAME de lumière de la couleur traverse la caisse de l'arrière à l'avant, des cubes de couleur s'en détachent.
   · AILE — L'ENVOL : la caisse bondit, deux gerbes de cubes nacre et or partent en V de l'arrière, la gloire s'ouvre un instant.
   · TRAÎNÉE — LA COMÈTE : une comète de la couleur fait un tour et quart en spirale autour de la caisse et finit dans ses pots, sa traîne en cubes.
   `dbgGeste('voiture'|'peinture'|'aile'|'trainee')` le rejoue. */
const BQG={a:null,t:0,n:0};
function bqGesteBatit(){if(BQG.m)return;
  const N=420,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}),N); // des cubes PLEINS : sur le blanc, une lumière additive ne se voit pas
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.renderOrder=6;m.setColorAt(0,new THREE.Color(1,1,1));m.count=0;scene.add(m);BQG.m=m;BQG.N=N;
  BQG.p=new Float32Array(N*3);BQG.v=new Float32Array(N*3);BQG.l=new Float32Array(N);BQG.l0=new Float32Array(N);BQG.s=new Float32Array(N);BQG.c=new Float32Array(N*3);
  BQG.lame=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));
  BQG.lame.visible=false;BQG.lame.renderOrder=6;scene.add(BQG.lame);
  BQG.M=new THREE.Matrix4();BQG.C=new THREE.Color();BQG.v1=new THREE.Vector3();BQG.v2=new THREE.Vector3();BQG.Q=new THREE.Quaternion();BQG.S=new THREE.Vector3();BQG.r=mulberry32(0x6E57);}
function bqPart(x,y,z,vx,vy,vz,l,s,r,g,b){if(BQG.n>=BQG.N-60)return;const i=BQG.n++;BQG.p[3*i]=x;BQG.p[3*i+1]=y;BQG.p[3*i+2]=z;BQG.v[3*i]=vx;BQG.v[3*i+1]=vy;BQG.v[3*i+2]=vz;
  BQG.l[i]=BQG.l0[i]=l;BQG.s[i]=s;BQG.c[3*i]=r;BQG.c[3*i+1]=g;BQG.c[3*i+2]=b;}
const BQ_OR=[.91,.70,.34],BQ_GRAPH=[.17,.18,.22]; // l'or pâle de la gloire, le graphite des bras
function bqGesteCoul(cat,d){if(!d)return BQ_OR;
  if(cat==='trainee'){if(d.rainbow)return null;if(d.rgb){const m9=Math.max(1,...d.rgb);return d.rgb.map(function(x){return x/m9;});}return [1,.45,.12];}
  const h=d.c!=null?d.c:(d.grad?d.grad[0]:null);if(h==null)return BQ_OR;const c=new THREE.Color(h);return [c.r,c.g,c.b];}
function bqGeste(k,d){bqGesteBatit();BQG.a=k;BQG.t=0;BQG.f=0;BQG.col=bqGesteCoul(k,d);BQG.th0=Math.random()*Math.PI*2;
  if(k==='aile')GBQ.gFlash=1;try{if(SONV2)sfx(k==='voiture'?'ui.feuille':'ui.carte',k==='voiture'?undefined:{vol:-3});}catch(e){}} /* (2026-10-14, session SON) ui.carte −3 : feuilleter (−34, bus rec) sonnait plus fort que valider (ui.tap −35) — rangé avec ui.equipe (−37) */
function bqGesteTick(dt,t9){if(!BQG.m)return;const B=BQG,m=B.m,M=B.M,C=B.C,r=B.r;
  const vis=!!(GBQ.grp&&GBQ.grp.visible);if(!vis){m.visible=false;B.lame.visible=false;B.n=0;B.a=null;GBQ.hop=0;return;}m.visible=true;
  const hm=bqDessous(),bb=hm.bb,q=carGroup.quaternion,sc=carGroup.scale,p0=carGroup.position,v1=B.v1,v2=B.v2;
  const L=function(x,y,z,out){return out.set(x*sc.x,y*sc.y,z*sc.z).applyQuaternion(q).add(p0);}; // repère caisse → monde
  const x0=bb?bb.min.x:-1,x1=bb?bb.max.x:1,y0=bb?bb.min.y:0,y1=bb?bb.max.y:1.3,z0=bb?bb.min.z:-2.2,z1=bb?bb.max.z:2.2,cx=(x0+x1)/2,cz=(z0+z1)/2;
  GBQ.gFlash=Math.max(0,(GBQ.gFlash||0)-dt*1.6);
  // le geste en cours
  if(B.a){B.t+=dt;const t=B.t,col=B.col||[1.5,1.5,1.55];
    if(B.a==='voiture'){
      if(t>=.34&&!(B.f&1)){B.f|=1;for(let i=0;i<46;i++){const a=r()*Math.PI*2,sp=1.6+r()*2.6;L(cx+Math.cos(a)*(x1-x0)*.45,y0,cz+Math.sin(a)*(z1-z0)*.45,v1);
        const g9=i%3?BQ_OR:BQ_GRAPH;bqPart(v1.x,v1.y,v1.z,Math.cos(a)*sp,1.2+r()*2.2,Math.sin(a)*sp,.5+r()*.5,.05+r()*.06,g9[0],g9[1],g9[2]);}}
      if(t>=.34&&t<1.32){const u=Math.min(1,(t-.34)/.72),al=t<1.06?1:1-(t-1.06)/.26,n=48,ry=y0+(y1-y0)*Math.min(1,u*1.04),ax=(x1-x0)/2+.2,az=(z1-z0)/2+.2;
        for(let i=0;i<n;i++)if(r()<.09*al){const a=i/n*Math.PI*2+t*1.8;L(cx+Math.cos(a)*ax,ry,cz+Math.sin(a)*az,v1); // des étincelles carrées s'échappent de l'anneau
          bqPart(v1.x,v1.y,v1.z,(r()-.5)*1.4,.4+r()*.9,(r()-.5)*1.4,.35+r()*.3,.035+r()*.03,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}
        B.ring={ry:ry,ax:ax,az:az,al:al};}else B.ring=null;
      if(t>1.4)B.a=null;}
    else if(B.a==='peinture'){const u=Math.min(1,t/.75),z=z0-.25+(z1-z0+.5)*u*u*(3-2*u),al=Math.sin(Math.PI*u);
      const la=B.lame;la.visible=al>.01;L(cx,(y0+y1)/2,z,v1);la.position.copy(v1);la.quaternion.copy(q);la.scale.set((x1-x0+.5)*sc.x,(y1-y0+.45)*sc.y,.05);
      la.material.color.setRGB(col[0],col[1],col[2]);la.material.opacity=al*.55;
      for(let i=0;i<7;i++){L(x0-.2+(x1-x0+.4)*r(),y0+(y1-y0+.2)*r(),z,v1);v2.set((r()-.5)*.6,.3+r()*.8,(r()<.5?-1:1)*(.4+r()*.9)).applyQuaternion(q);
        bqPart(v1.x,v1.y,v1.z,v2.x,v2.y,v2.z,.45+r()*.4,.04+r()*.05,col[0],col[1],col[2]);}
      if(t>.8){B.a=null;la.visible=false;}}
    else if(B.a==='aile'){GBQ.hop=Math.sin(Math.PI*Math.min(1,t/.62))*.3;
      if(t>=.06&&!(B.f&1)){B.f|=1;for(const sg of [-1,1])for(let i=0;i<46;i++){const sp=2.6+r()*3.2,o=i%3?1:0;
        v2.set(sg*(.8+r()*.5),1+r()*.9,-.5-r()*.6).normalize().multiplyScalar(sp).applyQuaternion(q);L(cx+sg*(x1-x0)*.32,y1*.82,z0+.35,v1);
        const g9=o?BQ_OR:BQ_GRAPH;bqPart(v1.x,v1.y,v1.z,v2.x,v2.y,v2.z,.65+r()*.55,.06+r()*.06,g9[0],g9[1],g9[2]);}}
      if(t>1.1){B.a=null;GBQ.hop=0;}}
    else if(B.a==='trainee'){const T=1.25,u=Math.min(1,t/T),R=Math.max((x1-x0),(z1-z0))/2+.55;
      let px,py,pz;const th=B.th0+u*Math.PI*2.5,yH=y0+.15+(y1-y0)*.55*Math.sin(Math.PI*Math.min(1,u*1.2));
      L(cx,y0+.45,z0-.1,v2); // les pots (l'arrière, à hauteur de tuyère)
      px=p0.x+Math.sin(th)*R;pz=p0.z+Math.cos(th)*R;py=p0.y+yH;
      const k9=Math.max(0,(u-.78)/.22),e9=k9*k9*(3-2*k9);px+=(v2.x-px)*e9;py+=(v2.y-py)*e9;pz+=(v2.z-pz)*e9;
      const rb=col?null:new THREE.Color().setHSL((t*1.4)%1,1,.55);const c3=col||[rb.r,rb.g,rb.b];
      if(u<1){for(let i=0;i<5;i++)bqPart(px+(r()-.5)*.12,py+(r()-.5)*.12,pz+(r()-.5)*.12,(r()-.5)*.25,(r()-.5)*.25,(r()-.5)*.25,.45+r()*.35,.05+r()*.04,c3[0],c3[1],c3[2]);
        B.tete={x:px,y:py,z:pz,c:c3};}else B.tete=null;
      if(u>=1&&!(B.f&1)){B.f|=1;for(let i=0;i<26;i++){v1.set((r()-.5)*1.2,r()*.8,-1-r()*1.5).applyQuaternion(q);bqPart(v2.x,v2.y,v2.z,v1.x*1.6,v1.y*1.6,v1.z*1.6,.4+r()*.4,.04+r()*.05,c3[0],c3[1],c3[2]);}}
      if(t>T+.5){B.a=null;B.tete=null;}}}
  else{B.lame.visible=false;B.ring=null;B.tete=null;}
  // les cubes : la gerbe vit, rétrécit et s'éteint
  let n=0;
  for(let i=0;i<B.n;i++){B.l[i]-=dt;if(B.l[i]<=0)continue;const k=B.l[i]/B.l0[i],j=n++;
    if(j!==i){for(let a=0;a<3;a++){B.p[3*j+a]=B.p[3*i+a];B.v[3*j+a]=B.v[3*i+a];B.c[3*j+a]=B.c[3*i+a];}B.l[j]=B.l[i];B.l0[j]=B.l0[i];B.s[j]=B.s[i];}
    B.v[3*j]*=Math.exp(-dt*1.4);B.v[3*j+2]*=Math.exp(-dt*1.4);B.v[3*j+1]=B.v[3*j+1]*Math.exp(-dt*1.4)-dt*2.2;
    for(let a=0;a<3;a++)B.p[3*j+a]+=B.v[3*j+a]*dt;
    const s9=B.s[j]*Math.sqrt(k);M.makeScale(s9,s9,s9);M.setPosition(B.p[3*j],B.p[3*j+1],B.p[3*j+2]);m.setMatrixAt(j,M);C.setRGB(B.c[3*j],B.c[3*j+1],B.c[3*j+2]);m.setColorAt(j,C);}
  B.n=n;let c=n;
  if(B.ring){const R9=B.ring,nR=48;for(let i=0;i<nR&&c<B.N;i++){const a=i/nR*Math.PI*2+B.t*1.8;L(cx+Math.cos(a)*R9.ax,R9.ry,cz+Math.sin(a)*R9.az,v1);
    const s9=.08*R9.al;M.makeScale(s9,s9*.6,s9);M.setPosition(v1.x,v1.y,v1.z);m.setMatrixAt(c,M);C.setRGB(BQ_OR[0],BQ_OR[1],BQ_OR[2]);m.setColorAt(c,C);c++;}}
  if(B.tete&&c<B.N-6){const T9=B.tete;for(let i=0;i<5;i++){const s9=i?.07:.16;M.makeScale(s9,s9,s9);M.setPosition(T9.x+(i?(r()-.5)*.2:0),T9.y+(i?(r()-.5)*.2:0),T9.z+(i?(r()-.5)*.2:0));m.setMatrixAt(c,M);
    C.setRGB(i?T9.c[0]:BQ_OR[0],i?T9.c[1]:BQ_OR[1],i?T9.c[2]:BQ_OR[2]);m.setColorAt(c,C);c++;}}
  m.count=c;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
/* la poussière d'or dérive : un lent tourbillon autour de la caisse, chaque grain respire */
function bqPoussiere(t9){const pt=GBQ.poussiere;if(!pt)return;const P=pt.geometry.attributes.position,A=P.array,A0=GBQ.poussP0,n=A.length/3,a=t9*.05,ca=Math.cos(a),sa=Math.sin(a);
  for(let i=0;i<n;i++){const x=A0[3*i],z=A0[3*i+2];A[3*i]=x*ca+z*sa;A[3*i+2]=-x*sa+z*ca;A[3*i+1]=A0[3*i+1]+Math.sin(t9*.6+i*1.7)*.18;}
  P.needsUpdate=true;}
/* LES BRAS D'ATELIER (2026-10-13, Léo : « je pensais plutôt à des bras mécaniques qui apparaissent, se déplacent et accrochent les ailes,
   ou quoi, en fonction de ce qu'on équipe, ce qu'on déséquipe ») — deux grands bras d'argent sur un RAIL autour du socle (un par flanc de la
   caisse). Ils sortent du socle, glissent sur le rail jusqu'à leur pièce, la travaillent, puis rentrent. L'essai n'est APPLIQUÉ qu'au moment
   où le bras touche la caisse (`apply`) :
   · AILE — ils prennent chaque aile à sa racine et la DÉPLIENT (ils suivent son bout pendant qu'elle s'ouvre) ; déséquiper : ils l'arrachent,
     l'emportent en l'air (une plaque d'or dans la pince) et rentrent avec ; équiper : un tour de clé à la racine, étincelles d'or.
   · PEINTURE — un pistolet au poing, ils longent chaque flanc de l'arrière à l'avant en crachant des cubes de la couleur ; équiper : ils lustrent.
   · TRAÎNÉE — une prise à la couleur de la traînée se BRANCHE sur les pots, la bague se charge, ils débranchent : la traînée jaillit.
   `dbgOutil('aile'|'peinture'|'trainee', 'essai'|'serre'|'retire')` rejoue un geste (sans rien changer). */
const BQT={L1:.82,L2:.78,hB:.3,rail:2.0,task:null};
function garBqOutilBatit(){if(BQT.g)return BQT.g;garBqBrasBatit();bqGesteBatit();const Mt=GBQ.matB,g=new THREE.Group();g.visible=false;scene.add(g);BQT.g=g;
  const cyl=new THREE.CylinderGeometry(1,1,1,8),sph=new THREE.SphereGeometry(1,10,8),box=new THREE.BoxGeometry(1,1,1),M=function(geo,mt,par){const m=new THREE.Mesh(geo,mt);(par||g).add(m);return m;};
  const rail=new THREE.Mesh(new THREE.TorusGeometry(BQT.rail,.03,4,96),Mt.graph);rail.rotation.x=Math.PI/2;g.add(rail);BQT.railM=rail;
  const rail2=new THREE.Mesh(new THREE.TorusGeometry(BQT.rail,.012,4,96),Mt.chrome);rail2.rotation.x=Math.PI/2;g.add(rail2);BQT.railM2=rail2;
  BQT.bras=[0,1].map(function(){const A={chariot:M(box,Mt.graph),tour:M(cyl,Mt.argent),epaule:M(sph,Mt.graph),bras:M(cyl,Mt.argent),verin:M(cyl,Mt.chrome),coude:M(cyl,Mt.graph),
      avant:M(cyl,Mt.argent),tige:M(cyl,Mt.chrome),poignet:M(sph,Mt.graph),tete:new THREE.Group(),phi:0,on:false};g.add(A.tete);
    // la PINCE : une paume, deux doigts (+ la plaque d'or qu'elle emporte)
    A.pince=new THREE.Group();A.tete.add(A.pince);{const pa=M(box,Mt.graph,A.pince);pa.scale.set(.17,.07,.12);pa.position.y=.035;
      A.doigts=[-1,1].map(function(sg){const d=M(box,Mt.argent,A.pince);d.scale.set(.035,.17,.055);d.position.set(sg*.07,.15,0);return d;});
      A.fant=M(box,null,A.pince);A.fant.material=new THREE.MeshPhongMaterial({color:0xe2b45c,specular:0xfff2c8,shininess:120,flatShading:true,fog:false});A.fant.scale.set(.62,.035,.22);A.fant.position.y=.24;A.fant.visible=false;}
    // le PISTOLET : un bidon, une buse
    A.buse=new THREE.Group();A.tete.add(A.buse);{const b=M(cyl,Mt.graph,A.buse);b.scale.set(.065,.13,.065);b.position.y=.065;const n=M(new THREE.CylinderGeometry(.018,.05,1,8),Mt.chrome,A.buse);n.scale.set(1,.16,1);n.position.y=.21;}
    // la PRISE : un fût, une bague à la couleur
    A.prise=new THREE.Group();A.tete.add(A.prise);{const f=M(cyl,Mt.argent,A.prise);f.scale.set(.055,.2,.055);f.position.y=.1;A.bague=new THREE.Mesh(new THREE.TorusGeometry(.065,.022,6,20),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));A.bague.rotation.x=Math.PI/2;A.bague.position.y=.17;A.prise.add(A.bague);}
    const led=M(box,Mt.diode,A.tete);led.scale.set(.05,.02,.02);led.position.set(0,.02,.075);
    return A;});
  BQT.v=[0,1,2,3,4,5,6,7,8,9,10,11].map(function(){return new THREE.Vector3();});BQT.q=new THREE.Quaternion();BQT.q2=new THREE.Quaternion();
  return g;}
/* un geste : s'il en restait un à moitié, sa pièce est posée tout de suite */
function bqOutil(k,mode,d,apply){const T=BQT.task;if(T&&!T.fait&&T.apply){T.fait=true;try{T.apply();}catch(e){}}
  if(!(GBQ.on&&GBQ.grp&&GBQ.grp.visible)){BQT.task=null;if(apply)apply();return;}
  garBqOutilBatit();BQT.task={k:k,mode:mode||'essai',d:d,apply:apply||null,fait:!apply,t:0,col:bqGesteCoul(k,d)||[1,.4,.8],f:0};
  try{if(SONV2){sfx('ui.feuille');GSON9=true;}}catch(e){}}
const BQT_T={monte:.24,va:.32,touche:.15,retour:.22,plie:.32,rentre:.26}; // la pièce est posée à 0,71 s du toucher
function bqOutilDuree(T){return T.k==='aile'?(T.mode==='essai'?.75:T.mode==='retire'?.55:.6):T.k==='peinture'?(T.mode==='serre'?.6:1.0):(T.mode==='serre'?.5:.5);}
function bqOutilTick(dt,t9,ay){const T=BQT.task;
  if(!T||!(GBQ.grp&&GBQ.grp.visible)){if(T&&!T.fait&&T.apply){T.fait=true;try{T.apply();}catch(e){}}BQT.task=null;if(BQT.g)BQT.g.visible=false;return;}
  const g=garBqOutilBatit(),V=BQT.v,hm=bqDessous(),bb=hm.bb,q=carGroup.quaternion,sc=carGroup.scale,p0=carGroup.position,r=BQG.r||(BQG.r=mulberry32(0x6E57));
  const L=function(x,y,z,out){return out.set(x*sc.x,y*sc.y,z*sc.z).applyQuaternion(q).add(p0);};
  const x0=bb?bb.min.x:-1,x1=bb?bb.max.x:1,y0=bb?bb.min.y:0,y1=bb?bb.max.y:1.3,z0=bb?bb.min.z:-2.2,z1=bb?bb.max.z:2.2,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;
  const ySoc=ay+GBQ.socleH,up=V[0].set(0,1,0),ax=V[1].set(1,0,0).applyQuaternion(q),az=V[2].set(0,0,1).applyQuaternion(q),ss=function(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  g.visible=true;g.position.set(0,0,0);BQT.railM.position.set(0,ySoc+.012,0);BQT.railM2.position.set(0,ySoc+.03,0);
  T.t+=dt;const t=T.t,D=bqOutilDuree(T),t1=BQT_T.monte,t2=t1+BQT_T.va,t3=t2+BQT_T.touche,t4=t3+D,t5=t4+BQT_T.retour,t6=t5+BQT_T.plie,t7=t6+BQT_T.rentre;
  if(t>=t3&&!T.fait){T.fait=true;try{if(T.apply)T.apply();}catch(e){}try{if(SONV2)sfx('ui.ok');}catch(e){}try{hap(6);}catch(e){}}
  const ta=Math.max(0,Math.min(1,(t-t3)/D)); // l'avancée du travail
  // les pots (traînée) : les plus à gauche et à droite
  let pots=null;if(T.k==='trainee'){pots=[];const P9=(typeof CAR_POTS!=='undefined'&&CAR_POTS.length)?CAR_POTS:null;
    if(P9){let a=P9[0],b=P9[0];for(const p of P9){if(p.x>a.x)a=p;if(p.x<b.x)b=p;}pots.push(a);if(Math.abs(a.x-b.x)>.25)pots.push(b);}else pots.push(new THREE.Vector3(cx,y0+.4,z0));}
  for(let i=0;i<2;i++){const A=BQT.bras[i],sg=i?-1:1,out=V[3].copy(ax).multiplyScalar(sg),C=V[4],P=V[5],off=V[6];let on=true,outil='pince',grip=0,spin=0,fant=false;
    // LA PIÈCE : où la toucher (C), dans quel sens pointer l'outil (P, vers la caisse), d'où l'approcher (off)
    if(T.k==='aile'){const piv=i?carWingR:carWingL,span=(x1-x0)*.6;if(piv){piv.getWorldPosition(C);}else L(cx+sg*(x1-x0)/2,cy,cz,C);
      let u=.15;if(T.mode==='essai')u=t<t3?.12:.12+span*(typeof wingT==='number'?wingT:1);else if(T.mode==='retire')u=span*.55;else u=.2;
      C.addScaledVector(out,u);P.copy(out).multiplyScalar(-1).addScaledVector(up,-.35).normalize();off.copy(out).multiplyScalar(.45).addScaledVector(up,.4);
      grip=t>=t3-.08?1:0;if(T.mode==='retire'&&t>=t3){const e=ss((t-t3)/D);C.addScaledVector(up,.55*e).addScaledVector(out,.35*e);fant=true;}
      if(T.mode==='serre'&&t>=t3&&t<t4)spin=ss(ta)*Math.PI*4;}
    else if(T.k==='peinture'){const zz=t<t3?z0-.05:z0-.05+(z1-z0+.1)*(T.mode==='serre'?.5:ss(ta));L(cx+sg*((x1-x0)/2+.5),cy+.05,zz,C);
      if(T.mode==='serre'&&t>=t3&&t<t4){const a9=ta*Math.PI*6;C.addScaledVector(az,Math.cos(a9)*.18).addScaledVector(up,Math.sin(a9)*.1);}
      outil='buse';P.copy(out).multiplyScalar(-1).normalize();off.copy(out).multiplyScalar(.4).addScaledVector(up,.3);
      if(t>=t3&&t<t4&&T.mode!=='serre'){const c9=T.mode==='retire'?[.93,.94,.97]:T.col;for(let n=0;n<4;n++){V[7].copy(P).multiplyScalar(2.6+r()*1.6).addScaledVector(az,(r()-.5)*.8).addScaledVector(up,(r()-.3)*.9);
        V[8].copy(C).addScaledVector(P,.24);bqPart(V[8].x,V[8].y,V[8].z,V[7].x,V[7].y,V[7].z,.28+r()*.18,.035+r()*.035,c9[0],c9[1],c9[2]);}}
      if(T.mode==='serre'&&t>=t3&&t<t4&&r()<.4){V[8].copy(C).addScaledVector(P,.3);bqPart(V[8].x,V[8].y,V[8].z,(r()-.5),r()*.8,(r()-.5),.4,.04,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}}
    else{ // la traînée
      if(!pots||i>=pots.length)on=false;else{const pt=pots[i];L(pt.x,pt.y,pt.z,C);const back=V[7].copy(az).multiplyScalar(-1);C.addScaledVector(back,.06);
        outil='prise';P.copy(az).normalize();off.copy(back).multiplyScalar(.5).addScaledVector(up,.3).addScaledVector(out,.15);
        if(T.mode==='retire'&&t>=t3){const e=ss((t-t3)/D);C.addScaledVector(back,.4*e).addScaledVector(up,.4*e);}
        if(T.mode==='serre'&&t>=t3&&t<t4)spin=ss(ta)*Math.PI*3;
        const c9=T.col;const pu=t>=t3&&t<t4&&T.mode!=='retire'?.6+.4*Math.sin(t*28):.35;A.bague.material.color.setRGB(c9[0]*pu,c9[1]*pu,c9[2]*pu);
        if(T.mode==='essai'&&i===0&&t>=t4&&!(T.f&1)){T.f|=1;for(const pp of pots){L(pp.x,pp.y,pp.z,V[8]);for(let n=0;n<34;n++){V[9].copy(back).multiplyScalar(2.4+r()*2.4).addScaledVector(up,(r()-.4)*.9).addScaledVector(ax,(r()-.5)*.9);
          bqPart(V[8].x,V[8].y,V[8].z,V[9].x,V[9].y,V[9].z,.5+r()*.45,.045+r()*.05,c9[0],c9[1],c9[2]);}}}}}
    if(!on){A.on=false;for(const k9 of ['chariot','tour','epaule','bras','verin','coude','avant','tige','poignet'])A[k9].visible=false;A.tete.visible=false;continue;}
    // LE CHARIOT glisse sur le rail jusque sous la pièce
    const phiC=Math.atan2(C.x,C.z);if(!A.on){A.phi=phiC;A.on=true;}let dphi=phiC-A.phi;dphi=Math.atan2(Math.sin(dphi),Math.cos(dphi));A.phi+=dphi*Math.min(1,dt*7);
    const mo=t<t1?ss(t/t1):t>t6?1-ss((t-t6)/BQT_T.rentre):1,yB=ySoc-(1-mo)*1.1,bx=Math.sin(A.phi)*BQT.rail,bz=Math.cos(A.phi)*BQT.rail;
    const S=V[8].set(bx,yB+BQT.hB,bz),rad=V[9].set(Math.sin(A.phi),0,Math.cos(A.phi)),W=V[10],F=V[11].copy(S).addScaledVector(rad,.3).add(V[7].set(0,.6,0)); // F : replié
    if(t<t1)W.copy(F);else if(t<t2)W.copy(F).lerp(V[7].copy(C).add(off),ss((t-t1)/BQT_T.va));else if(t<t3)W.copy(C).add(off).lerp(C,ss((t-t2)/BQT_T.touche));
    else if(t<t4)W.copy(C);else if(t<t5)W.copy(C).addScaledVector(off,ss((t-t4)/BQT_T.retour));else if(t<t6)W.copy(C).add(off).lerp(F,ss((t-t5)/BQT_T.plie));else W.copy(F);
    W.addScaledVector(P,-.2); // le poignet, en retrait de l'outil
    A.chariot.position.set(bx,yB+.05,bz);A.chariot.rotation.set(0,A.phi,0);A.chariot.scale.set(.42,.12,.32);
    A.tour.position.set(bx,yB+BQT.hB*.55,bz);A.tour.quaternion.identity();A.tour.scale.set(.2,BQT.hB*.9,.2);A.epaule.position.copy(S);A.epaule.scale.setScalar(.17);
    // deux segments : le coude en haut et vers l'extérieur
    const Dv=V[3].subVectors(W,S);let d=Dv.length();const L1=BQT.L1;let L2=BQT.L2;if(d<1e-4){d=1e-4;Dv.set(0,1e-4,0);}Dv.multiplyScalar(1/d);
    const n=V[4].copy(rad).multiplyScalar(.45).add(V[7].set(0,1,0));n.addScaledVector(Dv,-n.dot(Dv));if(n.lengthSq()<1e-5)n.set(0,1,0).addScaledVector(Dv,-Dv.y);n.normalize();
    let a1=0;if(d>=L1+L2)L2=d-L1;else{const c=(L1*L1+d*d-L2*L2)/(2*L1*d);a1=Math.acos(Math.max(-1,Math.min(1,c)));}
    const E=V[6].copy(S).addScaledVector(Dv,Math.cos(a1)*L1).addScaledVector(n,Math.sin(a1)*L1);
    bqSeg(A.bras,S,E,.12);{const p1=V[7].copy(S).addScaledVector(n,.18).addScaledVector(Dv,.06),p2=V[9].lerpVectors(S,E,.62).addScaledVector(n,.14);bqSeg(A.verin,p1,p2,.045);}
    A.coude.position.copy(E);{const axe=V[7].crossVectors(Dv,n).normalize();A.coude.quaternion.setFromUnitVectors(bqSeg._y||(bqSeg._y=new THREE.Vector3(0,1,0)),axe);}A.coude.scale.set(.15,.3,.15);
    {const f=V[9].subVectors(W,E),Lf=f.length();f.multiplyScalar(1/Math.max(1e-5,Lf));const m1=V[7].copy(E).addScaledVector(f,Math.min(Lf,BQT.L2*.6));bqSeg(A.avant,E,m1,.1);
     const m2=V[3].copy(E).addScaledVector(f,Math.min(Lf,BQT.L2*.42));bqSeg(A.tige,m2,W,.055);}
    A.poignet.position.copy(W);A.poignet.scale.setScalar(.11);
    // l'outil, au bout, pointé sur la pièce (et qui tourne pour le tour de clé)
    A.tete.visible=true;A.tete.position.copy(W);A.tete.scale.setScalar(1.35);BQT.q.setFromUnitVectors(bqSeg._y,P);BQT.q2.setFromAxisAngle(P,spin);A.tete.quaternion.copy(BQT.q).premultiply(BQT.q2);
    A.pince.visible=outil==='pince';A.buse.visible=outil==='buse';A.prise.visible=outil==='prise';
    if(outil==='pince'){A.doigts[0].position.x=-.07+.03*grip;A.doigts[1].position.x=.07-.03*grip;A.fant.visible=fant;}
    for(const k9 of ['chariot','tour','epaule','bras','verin','coude','avant','tige','poignet'])A[k9].visible=true;
    if(spin>0&&r()<.35){V[7].copy(W).addScaledVector(P,.3);bqPart(V[7].x,V[7].y,V[7].z,(r()-.5)*1.2,.4+r()*.8,(r()-.5)*1.2,.35+r()*.3,.035+r()*.03,BQ_OR[0],BQ_OR[1],BQ_OR[2]);}}
  if(t>=t7){BQT.task=null;g.visible=false;}}
function garBqLumiere(){if(!GBQ.on)return; // la lumière du magasin : blanche, sans le contre-jour du feu
  stallKey.color.setHex(0xffffff);stallKey.intensity=1.45;stallKey.distance=30;stallRim.color.setHex(0xe8eef5);stallRim.intensity=.7;stallRim.distance=30;}
/* LE DOIGT SUR LA SCÈNE tourne la caisse (le garage ne reçoit plus le glissé : pris en capture) */
/* (2026-10-13, Léo : « inverse le sens : quand on tire la voiture vers le bas, ça tire l'endroit qu'on appuie vers le bas », puis « en tirant
   le côté de la voiture vers le bas, on peut la pivoter, le capot vers nous ») LA PRISE : la caisse se comporte comme un objet qu'on SAISIT.
   Au pointerdown, un rayon de la caméra trouve le POINT touché sur la carrosserie ; tirer vers le bas fait tourner la caisse autour de son
   centre dans le sens qui fait descendre CE point (axe = bras × bas de l'écran), ramené sur ses deux axes : le TANGAGE (axe des roues :
   saisie par le nez ou la poupe, ce bout-là descend) et le ROULIS (axe long : saisie par le flanc, le flanc descend et le dessus — capot,
   toit — bascule vers nous). Les deux reviennent en ressort. Rien sous le doigt : le côté le plus proche du nez ou de la poupe, à l'écran. */
function bqPrise(e){const R={kp:1,kr:0,sur:false};try{
  const cv=renderer.domElement.getBoundingClientRect(),T=bqPrise._t||(bqPrise._t={rc:new THREE.Raycaster(),m:new THREE.Vector2(),c:new THREE.Vector3(),r:new THREE.Vector3(),d:new THREE.Vector3(),a:new THREE.Vector3(),q:new THREE.Quaternion(),Y:new THREE.Vector3(0,1,0),v:[new THREE.Vector3(),new THREE.Vector3()]});
  carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  T.c.set(0,.55,0);carGroup.localToWorld(T.c);                                   // son centre (la boîte englobante ramassait halos et lueurs, à 5 m)
  T.m.set((e.clientX-cv.left)/cv.width*2-1,-((e.clientY-cv.top)/cv.height)*2+1);T.rc.setFromCamera(T.m,camera);
  const H9=T.rc.intersectObject(carGroup,true),hit=H9.find(function(h){const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;return h.object.visible&&!(mt&&mt.transparent&&mt.opacity<.2);});
  R.sur=H9.some(bqPlein); // (2026-10-15, LA POSE TENUE) le doigt est-il SUR la caisse ? (sa carrosserie, ses vitres, ses roues — pas ses halos)
  if(hit){
    carGroup.getWorldQuaternion(T.q).invert();                                      // dans le repère de la caisse (⚠ pas rotation.y : relu d'un quaternion penché, l'Euler bascule de 180°)
    T.r.copy(hit.point).sub(T.c).applyQuaternion(T.q);T.d.set(0,-1,0).applyQuaternion(camera.quaternion).applyQuaternion(T.q);
    T.a.crossVectors(T.r,T.d);const n=Math.hypot(T.a.x,T.a.z);
    if(n>.05){R.kp=T.a.x/n;R.kr=T.a.z/n;return R;}}
  // rien sous le doigt (ou pile au-dessus du centre) : le bout le plus proche, à l'écran
  const V=T.v;V[0].set(0,.5,0);carGroup.localToWorld(V[0]);V[1].set(0,.5,1.6);carGroup.localToWorld(V[1]);V[0].project(camera);V[1].project(camera);
  const mx=(V[0].x+1)/2*cv.width+cv.left,my=(1-V[0].y)/2*cv.height+cv.top,nx=(V[1].x+1)/2*cv.width+cv.left-mx,ny=(1-V[1].y)/2*cv.height+cv.top-my;
  if(nx*nx+ny*ny>=400)R.kp=((e.clientX-mx)*nx+(e.clientY-my)*ny)>=0?1:-1;}catch(er){}
  return R;}
/* une pièce PLEINE de la caisse, vraiment montrée (le Raycaster de three ne regarde pas `visible` des parents) : ni halo additif, ni lueur
   presque transparente, ni ombre posée au sol */
function bqPlein(h){const o=h.object,mt=Array.isArray(o.material)?o.material[0]:o.material;
  if(!mt||mt.blending===THREE.AdditiveBlending||(mt.transparent&&mt.opacity<.2)||(o.userData&&o.userData.sol))return false;
  for(let q9=o;q9&&q9!==carGroup;q9=q9.parent)if(!q9.visible)return false;return true;}
window.dbgSonde=(function(ql){return function(x0,y0,x1,y1,st){if(arguments.length<4)return ql(x0); // (2026-10-14) DEUX bancs portaient ce nom : celui-ci écrasait la SONDE de la règle de qualité (dbgSonde(), dbgSonde(1), dbgSonde('sync')) — moins de quatre arguments, c'est elle
  st=st||4;const cv=renderer.domElement.getBoundingClientRect(),rc=new THREE.Raycaster(),m=new THREE.Vector2(),out={};carGroup.updateMatrixWorld(true); // (banc, 13/10) ce que la caméra voit de la caisse dans un rectangle de l'écran : matière (famille) et couleur de facette, avec quelques points
  for(let y=y0;y<y1;y+=st)for(let x=x0;x<x1;x+=st){m.set((x-cv.left)/cv.width*2-1,-((y-cv.top)/cv.height)*2+1);rc.setFromCamera(m,camera);const vu=function(o){for(;o;o=o.parent)if(!o.visible)return false;return true;},h=rc.intersectObject(carGroup,true).find(function(x){return vu(x.object);});if(!h)continue; // (le Raycaster de three ne regarde pas `visible`)
    const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material,g=(mt&&mt.userData&&mt.userData.g)||(mt&&mt.type)||'?';let col='';const ca=h.object.geometry&&h.object.geometry.attributes.color;
    if(ca&&h.face){const i=h.face.a;col=[ca.getX(i),ca.getY(i),ca.getZ(i)].map(function(v){return Math.round(Math.min(1,v)*255).toString(16).padStart(2,'0');}).join('');}
    const lp=carGroup.worldToLocal(h.point.clone()),k=g+':'+col;out[k]=out[k]||{n:0,p:[]};out[k].n++;if(out[k].p.length<5)out[k].p.push([x,y,+lp.x.toFixed(2),+lp.y.toFixed(2),+lp.z.toFixed(2)]);}
  return out;};})(window.dbgSonde);
window.dbgBqVoir=function(i){if(!GBQ.on)return 'boutique fermée';bqEssaie('v:'+(i|0));return CARS[i|0]&&CARS[i|0].name;}; // (banc) pose la caisse i sur le plateau de la boutique
