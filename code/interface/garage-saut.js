/* ===== LA FIGURE AU GARAGE : UN VRAI SAUT (2026-10-23, Léo : « travailler la physique des tricks dans le garage, ainsi que dans la boutique… et peut-être, quand la voiture atterrit, un petit effet ») =====
   MESURÉ au banc (salto arrière, `dbgFigEssai('saltoa')`, horloge du jeu) : la caisse faisait son tour sur place PENDANT qu'elle montait de 1,5 m en sinus —
   la rotation, elle, partait à pleine vitesse dès la 1re image : à 0,17 s le nez était à 105° et le BAS de la caisse à −1,5 m, sous le plateau (la poupe
   traversait le plateau, puis le sol de l'atelier, pendant ~0,3 s). Et elle se posait sans rien : arrêt net à 3,3 m/s, ni ressort, ni poussière, ni son.
   Désormais la figure est un PLAN calculé au lancement (`figPlan`), joué à l'horloge du jeu (`figSaut`) :
   · LA ROTATION vient du même moteur (`FIG.Corps`, celui de la course), jouée d'avance par un Corps jetable et relevée à 60 Hz — la figure est la même ;
   · LE SAUT est une vraie PARABOLE (hauteur, durée et gravité tirées du plan, gravité entre `FIG_SAUT.gMin` et `gMax`), précédée d'un petit ACCROUPI (la suspension se tasse 0,1 s) ;
   · LE GOUVERNEUR : la rotation n'avance que si la caisse est assez HAUTE pour qu'aucun coin de sa boîte (pièces pleines, roues comprises) ne passe sous le
     plateau — au décollage elle monte d'abord, puis tourne ; le saut choisi est le meilleur compromis court / pas trop haut (T + 0,3 h, durées 1,2 → 3,3 s,
     hauteurs 1,3 → 2,4 m) qui laisse finir la figure avant la pose : une grande caisse ou un grand salto monte plus haut et plus longtemps. Le pivot est le centre
     de masse de la caisse. Un filet de sécurité relève la caisse de ce qui manque encore (jamais sous le plateau) ;
   · L'ATTERRISSAGE : la carrosserie encaisse sur ses roues (ressort amorti, 8 cm au plus), un nuage de poussière en pixels à chaque roue + l'anneau de fumée du garage,
     quelques étincelles si le choc est dur, le son de pose (`pose.nette`), un tic dans le pouce, et l'anneau du plateau qui s'allume (`GFIG.pulse`).
   Les figures À PLAT (tail whip, toupie : `GFIG.plat`) restent posées, avec leur gomme, comme avant. Banc : `dbgFigEssai`, `dbgFigEtat`, `dbgFigGel`, `dbgFigPlan` ; `?saut=ancien` rend l'ancien saut (un sinus de 1,5 m, la rotation à pleine vitesse dès la 1re image) pour comparer. */
const FIG_SAUT={on:!/[?&]saut=ancien\b/.test(location.search),gMin:1.8,gMax:9.5,tA:.1,tRec:.5,hMin:1.3,hMax:2.4,marge:.08,tPose:.12,accroupi:.055,ressort:{w:38,z:.3}}; /* gMin, gMax : la gravité du saut, tirée entre ces bornes (m/s²) · tA : l'accroupi · tRec : le temps du ressort après la pose · tPose : la figure finit au moins tPose avant de toucher */
function figPlan(f,plat){ // la figure `f` (déjà orientée) sur la caisse du plateau : la rotation relevée à 60 Hz, le saut qui la laisse passer, les instants
  const K=FIG_SAUT,B=figBoite(true)||{min:{x:-1,y:0,z:-2.2},max:{x:1,y:1.4,z:2.2}},hc=B.min.y+.45*(B.max.y-B.min.y), /* le pivot : son centre de masse, un peu sous le milieu de la boîte (avant : la moitié de la fiche `h`, trop bas — le toit balayait un grand cercle) */
    cs=[],ph0=hc-B.min.y; /* ph0 : la hauteur du pivot au-dessus du dessous de la caisse, au repos */
  for(const x of [B.min.x,B.max.x])for(const y of [B.min.y,B.max.y])for(const z of [B.min.z,B.max.z])cs.push(x,y-hc,z); /* les huit coins de la boîte, dans le repère du pivot */
  const C=new FIG.Corps(),Q=[],AN=[],NEED=[];C.lance(f,1,f.D*1.2);C.evts.length=0;
  const pousse=function(){const q=C.q,x=q[0],y=q[1],z=q[2],w=q[3],r0=2*(x*y+w*z),r1=1-2*(x*x+z*z),r2=2*(y*z-w*x);let mn=1e9; /* la ligne y de la matrice : la hauteur de chaque coin tourné */
    for(let k=0;k<24;k+=3){const v=r0*cs[k]+r1*cs[k+1]+r2*cs[k+2];if(v<mn)mn=v;}
    Q.push(x,y,z,w);AN.push(C.ecart());NEED.push(Math.max(0,-mn-ph0));}; /* NEED : de combien le pivot doit monter pour que le coin le plus bas reste sur le plateau */
  pousse();
  const Dref=f.D*1.2*(FIG.PHY.elan?1:1/.85)+.6; /* le temps que le garage lui donnait pour finir (le budget du Corps vivant) : sans lui un battement (shimmy) sonne 3 s */
  for(let i=1;i<260;i++){C.budget=Math.max(0,Dref-i/60);C.poseK=i/60>f.D*1.2?1:0;C.tick(1/120);C.tick(1/120);pousse();if(i>6&&C.occupe()===0&&C.ecart()<.02&&Math.hypot(C.w[0],C.w[1],C.w[2])<.3)break;} /* jusqu'au planté, jamais plus de 4 s */
  Q.push(0,0,0,1);AN.push(0);NEED.push(0);const N=Q.length/4;
  if(plat){const nR=N-1,QR=new Float32Array((N+1)*4);QR.set(Q);QR[N*4+3]=1;return {plat:true,vol:false,hc:hc,h:0,T:0,g:0,v0:0,tA:0,tRec:0,nR:nR,QR:QR,D:nR/60+.15,B:B,cs:cs,ph0:ph0};}
  const gouverne=function(h,T,force){const nR=Math.ceil(T*60),JJ=new Int32Array(nR+1),iF=force?nR-Math.round(K.tPose*60)-(N-1):1e9;let j=0,iFin=-1; /* iF : en dernier recours elle finit à l'heure, quoi qu'il arrive */
      for(let i=1;i<=nR;i++){const u=Math.min(1,i/60/T),p=4*h*u*(1-u); /* la levée de la parabole à cet instant */
        if(j<N-1&&(i>=iF||NEED[j+1]+K.marge*Math.min(1,AN[j+1]/.3)<=p))j++; /* l'image de rotation suivante n'est jouée que si la caisse est assez haute pour elle */
        JJ[i]=j;if(j>=N-1&&iFin<0)iFin=i;}
      return {JJ:JJ,nR:nR,iFin:iFin};},
    fini=function(g,T){return g.iFin>=0&&g.iFin<=Math.floor((T-K.tPose)*60);};
  let h=K.hMax,T=3.3,gv=null,ok=false,J=1e9; /* le meilleur saut : T + ,3 h le plus petit — court ET pas trop haut — parmi les durées (1,2 → 3,3 s) et les hauteurs (1,3 → 2,4 m) dont la gravité reste dans [gMin, gMax] et qui laissent finir la figure */
  for(let Tc=1.2;Tc<=3.31;Tc+=.05)for(let hh=K.hMin;hh<=K.hMax+1e-6;hh+=.1){const g=8*hh/(Tc*Tc);if(g>K.gMax||g<K.gMin||Tc+.3*hh>=J)continue;
    const g2=gouverne(hh,Tc,false);if(fini(g2,Tc)){ok=true;J=Tc+.3*hh;h=+hh.toFixed(2);T=+Tc.toFixed(2);gv=g2;}}
  if(!ok){h=K.hMax;T=2.2;gv=gouverne(h,T,true);} /* dernier recours (une limousine de 6 m ne fait pas un salto dans un atelier de 6 m de haut) : la figure finit à l'heure, le filet relève la caisse de ce qui manque */
  const nR=gv.nR,QR=new Float32Array((nR+2)*4);
  for(let i=0;i<=nR;i++){const j=gv.JJ[i]*4;QR[i*4]=Q[j];QR[i*4+1]=Q[j+1];QR[i*4+2]=Q[j+2];QR[i*4+3]=Q[j+3];}
  QR[(nR+1)*4+3]=1;
  return {plat:false,vol:true,hc:hc,h:h,T:T,g:8*h/(T*T),v0:4*h/T,tA:K.tA,tRec:K.tRec,nR:nR,QR:QR,D:K.tA+T+K.tRec,B:B,cs:cs,ph0:ph0,iFin:gv.iFin,sur:ok,N:N};}
function figSautRaz(){ // la carrosserie reprend sa place sur les roues (fin de la figure, nouvelle figure, garage quitté)
  if(GFIG.corps9){GFIG.corps9=false;if(!BURN.corps){carBody.position.y=0;carBody.rotation.x=0;}}
}
function figSaut(dt){ // une image de la figure : rend vrai tant qu'elle joue (appelée par garFigPas, juste après la pose de la caisse sur le plateau)
  const P=GFIG.pl;if(!P)return false;
  const now=performance.now();if(now-(GFIG.vu||0)>700&&GFIG.vu){GFIG.pl=null;GFIG.D=0;figSautRaz();GFIG.vu=0;return false;} /* le garage était fermé (une course, un autre écran) : la figure d'avant ne reprend pas au milieu de son saut */
  GFIG.vu=now;
  let d9=Math.min(dt,.05);if(GFIG.gel!=null)d9=Math.max(0,Math.min(d9,GFIG.gel-GFIG.t));
  GFIG.t+=d9;const t=GFIG.t,tv=t-P.tA;
  let lift=0,corps=0,x;
  if(P.vol){
    if(t<P.tA){corps=FIG_SAUT.accroupi*Math.sin(Math.PI*t/P.tA);x=0;} /* l'accroupi : la carrosserie se tasse sur ses roues, puis part */
    else if(tv<P.T){lift=P.v0*tv-.5*P.g*tv*tv;x=tv*60;if(!P.lance){P.lance=true;try{figDecolle(P);}catch(e){}}}
    else{x=1e9;if(!P.atterri){P.atterri=true;try{figAtterrit(P);}catch(e){}}
      const ta=tv-P.T,R=FIG_SAUT.ressort,wd=R.w*Math.sqrt(1-R.z*R.z),tp=Math.atan2(wd,R.z*R.w)/wd, /* le 1er creux du ressort amorti */
        pic=Math.exp(-R.z*R.w*tp)*Math.sin(wd*tp);
      corps=(P.encaisse||0)*Math.exp(-R.z*R.w*ta)*Math.sin(wd*ta)/pic;}} /* encaisse : de combien la carrosserie s'enfonce au plus (m) ; le ressort la fait remonter au-dessus de sa place (corps < 0), puis se poser */
  else x=t*60;
  // l'assiette : l'image de la rotation jouée à cet instant (interpolée), appliquée AUTOUR DU PIVOT comme avant
  const QR=P.QR,i0=Math.min(P.nR+1,Math.max(0,Math.floor(x))),i1=Math.min(P.nR+1,i0+1),fr=Math.max(0,Math.min(1,x-i0)),a=i0*4,b=i1*4;
  let qx=QR[a],qy=QR[a+1],qz=QR[a+2],qw=QR[a+3];const bx=QR[b],by=QR[b+1],bz=QR[b+2],bw=QR[b+3];
  if(fr>0){const sg=qx*bx+qy*by+qz*bz+qw*bw<0?-1:1;qx+=(sg*bx-qx)*fr;qy+=(sg*by-qy)*fr;qz+=(sg*bz-qz)*fr;qw+=(sg*bw-qw)*fr;const n=1/Math.hypot(qx,qy,qz,qw);qx*=n;qy*=n;qz*=n;qw*=n;}
  const hc=P.hc,y0=carGroup.position.y;
  VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);VEQ.qr.set(qx,qy,qz,qw);carGroup.quaternion.multiply(VEQ.qr);
  VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);carGroup.position.y+=lift;
  // le filet : aucun coin de la boîte ne passe sous le plateau (le plan l'évite ; ceci rattrape ce qui manque, d'un coup, sans à-coup visible)
  if(P.vol){const q=carGroup.quaternion,r0=2*(q.x*q.y+q.w*q.z),r1=1-2*(q.x*q.x+q.z*q.z),r2=2*(q.y*q.z-q.w*q.x),cs=P.cs;let mn=1e9;
    for(let k=0;k<24;k+=3){const v=r0*cs[k]+r1*cs[k+1]+r2*cs[k+2];if(v<mn)mn=v;}
    const manque=(y0+P.B.min.y)-(carGroup.position.y+hc*r1+mn);if(manque>.002){carGroup.position.y+=manque;P.filet=Math.max(P.filet||0,manque);}} /* y0 + min.y : le dessous au repos, sur le plateau ; position.y + hc·r1 : le pivot dans la salle ; + mn : son coin le plus bas */
  if(corps!==0||GFIG.corps9){carBody.position.y=-corps;GFIG.corps9=corps!==0;if(!GFIG.corps9)carBody.position.y=0;}
  if(P.plat)try{garFigGomme(d9,true);}catch(e){}
  if(t>=P.D){GFIG.pl=null;GFIG.D=0;figSautRaz();}
  return true;}
function figRoues(){ // le point de contact de chaque roue, dans la salle (repli : les quatre coins du dessous)
  const L=[],v=new THREE.Vector3();carGroup.updateMatrixWorld(true);
  for(const w of wheels){if(!w||!w.position||!w.parent)continue;v.set(w.position.x,w.position.y-(w.userData.R||.4)+.06,w.position.z);carGroup.localToWorld(v);L.push(v.x,v.y,v.z);}
  if(L.length<6){const B=figBoite();if(B)for(const sx of [B.min.x*.8,B.max.x*.8])for(const sz of [B.min.z*.75,B.max.z*.75]){v.set(sx,B.min.y+.1,sz);carGroup.localToWorld(v);L.push(v.x,v.y,v.z);}}
  return L;}
function figPoussiere(k,fort){ // un nuage de poussière en pixels à chaque roue (la fumée du burn-out : mêmes réservoirs, même style) — k : l'intensité (0,5 à 1,3)
  if(!BURN.fum)return;const L=figRoues(),c=carGroup.position,n=L.length/3;if(!n)return;
  for(let i=0;i<L.length;i+=3){const dx=L[i]-c.x,dz=L[i+2]-c.z,d=Math.hypot(dx,dz)||1,ox=dx/d,oz=dz/d,m=Math.round((fort?5:3)+3*k);
    for(let j=0;j<m;j++){const v=(.9+Math.random()*2.2)*k*(fort?1:.6),tg=(Math.random()-.5)*1.6;
      burnEmet(BURN.fum,L[i]+ox*.15,L[i+1]+.06,L[i+2]+oz*.15,(ox-oz*tg)*v,.25+Math.random()*(.5+.5*k),(oz+ox*tg)*v,1.6+Math.random()*1.2,.3+Math.random()*.2,.9+.5*k+Math.random()*.4,.2+Math.random()*.12,.86,.85,.93);}}}
function figAnneau(k){ // l'anneau de fumée qui s'ouvre autour de la caisse à la pose (celui du burn-out, mais à SON rayon et qui ne dure pas 4 s)
  const F=BURN.fum;if(!F)return;const c=carGroup.position,N=Math.round(10+8*k),R=garGabarit().R*.62;
  for(let i=0;i<N;i++){const a=(i+Math.random()*.4)/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),v=(1.8+Math.random()*1)*k;
    burnEmet(F,c.x+ca*R,GARAGE_Y+.3,c.z+sa*R,ca*v,.12+Math.random()*.3,sa*v,1.8+Math.random()*.9,.34,1+.3*k,.22,.8,.78,.88);}}
function figEtincelles(k){ // un dur atterrissage : quelques étincelles au ras du plateau, aux roues
  if(!BURN.feu)return;const L=figRoues(),c=carGroup.position;
  for(let i=0;i<L.length;i+=3){const dx=L[i]-c.x,dz=L[i+2]-c.z,d=Math.hypot(dx,dz)||1;
    for(let j=0;j<3;j++){const v=1.5+Math.random()*3*k;burnEmet(BURN.feu,L[i],L[i+1]+.05,L[i+2],dx/d*v+(Math.random()-.5)*1.5,1+Math.random()*2.2,dz/d*v+(Math.random()-.5)*1.5,.3+Math.random()*.35,.05+Math.random()*.05,0,1,1,.55+Math.random()*.35,.18);}}}
function figDecolle(P){ // l'instant où elle quitte le plateau : un petit nuage à chaque roue, un tic dans le pouce
  figPoussiere(.55,0);try{hap(6);}catch(e){}}
function figAtterrit(P){ // l'instant où elle touche : la carrosserie encaisse, la poussière, l'anneau, le son, le pouce
  const vi=P.g*P.T/2,k=Math.min(1.3,.35+vi*.14);P.vi=vi;P.k=k;P.encaisse=Math.min(.08,.016*vi);GFIG.pulse=1;GFIG.kick=k;
  try{figPoussiere(k,1);figAnneau(k);if(vi>4.2)figEtincelles(k);}catch(e){}
  try{if(SONV2)sfx('pose.nette',{vol:-4+2*k,t:.01});else{chimeNote(240,0,.06,.12);noiseBurst(.16,.08,900);}}catch(e){}
  try{hap([8,18]);}catch(e){}}
window.dbgFigPlan=function(){const P=GFIG.pl;return P&&{plat:P.plat,h:+P.h.toFixed(2),T:+P.T.toFixed(3),g:+P.g.toFixed(2),v0:+P.v0.toFixed(2),D:+P.D.toFixed(3),tA:P.tA,nR:P.nR,iFin:P.iFin,sur:P.sur,N:P.N,boite:P.B&&[+P.B.min.x.toFixed(2),+P.B.min.y.toFixed(2),+P.B.min.z.toFixed(2),+P.B.max.x.toFixed(2),+P.B.max.y.toFixed(2),+P.B.max.z.toFixed(2)],hc:+P.hc.toFixed(2),filet:+(P.filet||0).toFixed(3),vi:P.vi&&+P.vi.toFixed(2),encaisse:P.encaisse&&+P.encaisse.toFixed(3)};}; // (banc) le plan de la figure en cours
