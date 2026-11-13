/* ===== LE CANYON V3 : LE RELIEF JOUE AVEC LA ROUTE (2026-11-13, Sacha : « sois beaucoup plus créatif, ça doit beaucoup plus être intégré avec l'environnement… là c'est juste un
   couloir, la route est plate, il n'y a même pas de virage… tu peux courber la route, faire rider les murs, faire arriver dans des gorges, prendre des tunnels, arriver dans une gorge,
   prendre un tunnel, voir qu'il y a un autre chemin en dessous… faut que ça soit aussi fun à rouler qu'à voler… fais ça de manière très optimisée, en one shot, pas de bug ») =====
   Le relief du canyon était creusé AUTOUR de la route (une gorge qui la suit) : rien n'y était posé POUR elle. Désormais la génération plante des ROCHERS dans le relief (les mêmes
   données que les Mitaines : la taille fine, canal G — même roche, mêmes strates, même ombre, la collision gratuite) et des OUVRAGES cuits (la matière de l'arche) :
   · LES ROCHERS DE CORDE : à l'intérieur des virages des passages ouverts, une aiguille ou un rocher — on tourne AUTOUR de quelque chose ;
   · LE SLALOM DES AIGUILLES (`aiguilles`) : 4-5 virages enchaînés, une aiguille de 110-220 m à la corde de chacun ;
   · LA BOUCLE DE LA BUTTE (`butte`) : un balcon d'où l'on voit, 70-86 m plus bas, la route qui file dans l'axe ; la route fait le tour d'une butte (le fond de la boucle couché à 74°
     contre la paroi : on ride le mur), repasse SOUS le balcon et file dans l'axe. Le raccourci : ne pas tourner, voler tout droit et se poser sur la route d'en bas ;
   · LA PORTE DE GRÈS (`porte`) : un aileron de roche de 400 à 900 m barre le canyon, la route le traverse par un tunnel (une ou deux portes d'affilée) ;
   · LA GALERIE (`galerie`) : la route taillée dans la falaise, un toit de roche au-dessus, des piliers et des fenêtres ouvertes sur le vide ;
   · LE PONT NATUREL : la traversée passe sur une arche de grès qui plonge jusqu'à la rivière ;
   · LE DÉVERS PARTOUT, EN BOBSLEIGH : chaque virage se relève (jusqu'à ~32° dans les serrés : à 58°, plus rien n'était à plat — 24 % de la route, Sacha en veut 35-55 %) — au-delà de 28° le plan de roche des murs se pose derrière la dalle : la paroi
     extérieure du virage EST la route (Sacha, après avoir joué : « la route est tout le temps plate… ça n'exploite pas du tout les murs ») ;
   · LE SERRÉ EST LA RÈGLE : la gorge par défaut a ses parois collées (zL0 = 0 — un essai à mi-ouverte : Sacha, « c'est trop large maintenant, plus aucun challenge comme quand
     les murs étaient proches ») ; le large n'est plus qu'une révélation (le cirque de la boucle, la vallée, la corniche, le pont).
   LA RÈGLE D'OR tient par construction : à moins de ROAD_HALF + 18 m (en plan) d'un tronçon de route, un rocher reste sous le bitume (le sol d'un tunnel, le pied d'une butte),
   jamais à côté ni dessus ; les aiguilles et les rochers ne se posent que là où aucune route ne passe (cyV3Plan : libre).
   `?sans=canyonv3` = le canyon d'avant (v1541). Console : dbgCanyonV3() · dbgCanyonV3('test') (les ouvrages contre des points sûrs) · dbgCanyonV3('rel', k) (le k-ième rocher). */
/* (2026-11-13, Sacha, en cours de route : « pas de torsade trop serrée, et pas plus de 10 secondes dans une même direction ») LA RÈGLE DES DIX SECONDES, mesurée COMME LE JUGE
   COMMUN de la charte des routes (passation/CHARTE-ROUTES.md, juge-page.js) :
   · R1 : la plus longue course où la tangente 3D reste dans un cône de 30° autour de sa direction d'entrée (et le cap en plan à moins de 30°) — en secondes à la vitesse RÉELLE
     (la croisière × l'élan : 1,8 au palier 0 → 1 au palier 25). ⚠ Un S qui revient au cap (0 → 50° → 0) ne la casse PAS : depuis son milieu, la route ne s'écarte que de 25°
     (MESURÉ : 13 à 16 s « dans la même direction » dans un pipe, une gorge, des courbes). Les pièces et les liaisons V3 BALANCENT donc d'un côté de l'axe à l'autre (±35-42° : vise, zig) ;
   · R2 : la même course dans un cône de 8° (le tout droit qui ennuie) ;
   · jamais plus de `tourne` s à tourner du même côté (la boucle de la butte fait son tour en ~9 s : son rayon est borné à 1,45 × la croisière) ;
   · la VOÛTE fait le TOUR COMPLET du tube (sens dessus dessous) à VITESSE CONSTANTE : ~38°/s ressentis à tous les paliers (cyVouProfil) — au smoothstep d'avant, 75°/s au palier 0.
     (Un essai à 180° — monter au plafond par une paroi et redescendre par la même — a fait disparaître l'envers des routes : la supervision l'a relevé, Sacha veut le tour.)
   cyDix mesure le dessin de chaque essai de genCanyon ; un essai qui dépasse coûte des points (le directeur de rythme garde le meilleur). */
const CY_V3={on:!/[?&]sans=([^&]*,)?canyonv3(,|&|$)/.test(location.search),zL0:0,doux:32,douxK:3.2,rochers:.62,rochersMax:14,butMax:74,porteHc:32,porteHk:8,galHb:28,galHt:16,galP:36,tourne:9.5,t30:6.5,t30dur:8.5,t8:2.2,roulisV:40,butT:1.45,vouteV:10.4,vouteP:0,kL:2.05,phrW:85,phrR:37,phrSol:.8,phrMur:2.5,phrEnv:2.4,phrMur2:2,tubeR:70};
const CY_V3_ARD=new THREE.Color(.58,.66,.80); /* l'ARDOISE : la brume du fond tire vers elle (la charte de l'image : jamais de violet en dominante de jour — c'est un gris bleu) */
/* l'ÉLAN (route-sans-haut.js, DUREE_ELAN) : la vitesse que le joueur ressent = la croisière × 1,8 au palier 0, × 1 au palier 25 — le juge commun mesure les secondes à cette vitesse */
function cyElan(){return 1.8-.8*Math.min(1,Math.max(0,(typeof engTier==='number'?engTier:0)/25));}
/* LA TENUE comme le juge (juge-page.js, R1/R2) : la route (la ligne brisée C) rééchantillonnée tous les `pas` m, la tangente CENTRÉE sur deux pas (aux sommets, elle mêle les deux
   segments : une entrée à mi-chemin d'un virage — MESURÉ, graine 12 : 16 s au juge, 5,9 s mesurés sur les seuls segments) ; la plus longue course où la direction 3D reste dans un cône
   de `deg`° autour de celle d'entrée et le cap en plan à moins de `deg`° du sien. Rend {s (secondes à vP), at (m)} */
function cyTenue(C,vP,deg,pas){const n=C.length;if(n<3)return {s:0,at:0};pas=pas||6;const S0=new Float64Array(n);for(let i=1;i<n;i++)S0[i]=S0[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].y-C[i-1].y,C[i].z-C[i-1].z);
  const L=S0[n-1],m=Math.max(3,Math.floor(L/pas)+1),X=new Float64Array(m),Y=new Float64Array(m),Z=new Float64Array(m),S=new Float64Array(m);let k=0;
  for(let r=0;r<m;r++){const s=Math.min(L,r*pas);while(k<n-2&&S0[k+1]<s)k++;const t=Math.max(0,Math.min(1,(s-S0[k])/((S0[k+1]-S0[k])||1)));X[r]=C[k].x+(C[k+1].x-C[k].x)*t;Y[r]=C[k].y+(C[k+1].y-C[k].y)*t;Z[r]=C[k].z+(C[k+1].z-C[k].z)*t;S[r]=s;}
  const dx=new Float64Array(m),dy=new Float64Array(m),dz=new Float64Array(m),cp=new Float64Array(m),hz=new Float64Array(m);
  for(let r=0;r<m;r++){const a9=Math.max(0,r-1),b9=Math.min(m-1,r+1),ax=X[b9]-X[a9],ay=Y[b9]-Y[a9],az=Z[b9]-Z[a9],l=Math.hypot(ax,ay,az)||1;dx[r]=ax/l;dy[r]=ay/l;dz[r]=az/l;hz[r]=Math.hypot(dx[r],dz[r]);cp[r]=Math.atan2(dx[r],dz[r]);}
  const c=Math.cos(deg/57.2958),a=deg/57.2958;let best=0,at=0;
  let bs=0; /* (2026-11-13, LE TIRAGE MOINS CHER : canyon-route.js) la meilleure tenue en pas */
  for(let i=0;i<m-1;i++){if(CY_ELAG){const k9=i+bs+1;if(k9>=m)break;if(dx[i]*dx[k9]+dy[i]*dy[k9]+dz[i]*dz[k9]<c)continue;if(hz[i]>=.35&&hz[k9]>=.35){let d=cp[k9]-cp[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)>a)continue;}} /* ce départ ne peut pas battre la meilleure tenue : son point à bs + 1 pas sort déjà du cône */
    let j=i+1;for(;j<m;j++){if(dx[i]*dx[j]+dy[i]*dy[j]+dz[i]*dz[j]<c)break;if(hz[i]>=.35&&hz[j]>=.35){let d=cp[j]-cp[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)>a)break;}}
    const d=S[j-1]-S[i];if(d>best){best=d;at=S[i];bs=j-1-i;}if(j>=m)break;}
  return {s:best/vP,at:at};}
/* LA VOÛTE (la charte, R3 : 45°/s au plus au 95e centile, à la vitesse réelle ; R8 : l'envers ≤ 9,5 s) : le TOUR COMPLET à vitesse CONSTANTE — une rampe linéaire adoucie sur ses
   10 % de bout, `vouteV` s à la vitesse ressentie (vouteV × l'élan s de croisière) : 360° / (10,4 × 0,9) = 38°/s au plus, l'envers (90° → 270°) ~5 s. cyVouteT : sa durée (s de
   croisière) ; cyVouProfil(u) : la part du tour à la part u de la voûte parcourue */
/* l'abscisse s9 est-elle autour d'un tube (la voûte, le tunnel d'une phrase du mur) : ni arbre ni décor dans 90 m */
function cyDansTube(s9){const L9=CY.vou?(Array.isArray(CY.vou[0])?CY.vou:[CY.vou]):[];for(const v9 of L9)if(s9>v9[0]-90&&s9<v9[1]+90)return true;return false;}
function cyVouteT(){return CY_V3.vouteV*cyElan();}
function cyVouProfil(u){const e=.1,x=u<0?0:u>1?1:u;return x<e?x*x/(2*e*(1-e)):x>1-e?1-(1-x)*(1-x)/(2*e*(1-e)):(x-e/2)/(1-e);}
/* LE DESSIN TEL QU'ON LE ROULERA : genCanyon lisse les pentes du tracé gardé (lisserRaccords, adoucirCretes) APRÈS le choix de l'essai — la mesure se fait sur une copie lissée
   (MESURÉ : une cassure de −10 % à −25 % au milieu de la piste d'une boucle se fondait en rampe, et le juge y voyait 4 s « tout droit » dans un cône de 8°) */
function cyLisse(C){const P=C.map(function(p){return p.clone();});lisserRaccords(P);adoucirCretes(P,1);return P;}
/* le dessin d'un essai (les points de contrôle C) : R1 et R2 comme le juge (t30, t8 : secondes à la vitesse réelle) et le plus long virage d'un même côté (rayon < 5 RMIN, secondes de croisière) */
function cyDix(C,VW,RMIN){const n=C.length;if(n<4)return {t30:0,t8:0,tourne:0};const S=new Float64Array(n),H=new Float64Array(n);
  for(let i=1;i<n;i++)S[i]=S[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n-1;i++)H[i]=Math.atan2(C[i+1].x-C[i].x,C[i+1].z-C[i].z);H[n-1]=H[n-2];
  for(let i=1;i<n;i++){let d=H[i]-H[i-1];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;H[i]=H[i-1]+d;}
  let tourne=0,run=0,sg0=0;const thr=1/(5*RMIN);
  for(let k=1;k<n-1;k++){const l=S[k+1]-S[k],rate=(H[k]-H[k-1])/Math.max(1,(S[k+1]-S[k-1])*.5),sg=Math.abs(rate)>=thr?(rate>0?1:-1):0;
    if(sg&&sg===sg0)run+=l;else run=sg?l:0;sg0=sg;if(run>tourne)tourne=run;}
  const vP=VW*cyElan(),a30=cyTenue(C,vP,30),a8=cyTenue(C,vP,8);
  return {t30:+a30.s.toFixed(2),t30At:Math.round(a30.at),t8:+a8.s.toFixed(2),t8At:Math.round(a8.at),tourne:+(tourne/VW).toFixed(1)};}
/* la note : la charte veut ≤ 10 s au pire et ≤ 7 s en moyenne (R1), ≤ 5 s et ≤ 3 s (R2) — chaque essai vise sous t30 (6,5 s) et t8 (2,8 s), au-delà de t30dur (8,5 s) le prix triple */
function cyDixNote(d){if(!CY_V3.on)return 0;return (d.tourne>CY_V3.tourne?(d.tourne-CY_V3.tourne)*10:0)+(d.t30>CY_V3.t30?(d.t30-CY_V3.t30)*12:0)+(d.t30>CY_V3.t30dur?(d.t30-CY_V3.t30dur)*30:0)+(d.t8>CY_V3.t8?(d.t8-CY_V3.t8)*10:0);}

/* ---- LE RELIEF POSÉ (dans le travailleur, après les Mitaines) ----
   Chaque rocher de `opt.rel` se lève dans la taille fine (canal G : le relief vaut le plus haut des deux). `k` : 'pil' (rond : aiguille, rocher, butte) ou 'aile' (l'aileron : un mur
   long et épais aux bouts arrondis). LA ROUTE PASSE : à moins de RH + 18 m (en plan) d'un tronçon de route, la roche reste à TH + 6 m sous le bitume (+ RH × sin(dévers) quand la dalle
   penche, + RH à l'envers) — le sol d'un tunnel, le pied d'une butte — et la case perd sa marque de roche (les corniches du relief remontent le sol de 2-3 m). Rend le nombre de cases levées.
   Recopiée dans le travailleur par sa source : n'utilise que ses arguments, cyNz et CY.yMaxM. */
function cyReliefs(S,F,opt){const rel=opt.rel;if(!rel||!rel.length)return 0;
  const fc=F.c,fm=F.m,TF=F.ts,RH=opt.RH||28,TH=opt.TH||5.2,CL=RH+18,NS=S.n,hasN=!!S.ny;let nc=0;
  for(let q=0;q<rel.length;q++){const f=rel[q],R9=f.R9;
    const j0=Math.max(0,Math.floor((f.z-R9-F.z0)/TF)),j1=Math.min(F.nz-1,Math.ceil((f.z+R9-F.z0)/TF)),i0=Math.max(0,Math.floor((f.x-R9-F.x0)/TF)),i1=Math.min(F.nx-1,Math.ceil((f.x+R9-F.x0)/TF));
    if(i1<i0||j1<j0)continue;
    const cand=[],m2=(R9+CL+16)*(R9+CL+16);for(let i=0;i<NS-1;i++){const dx=S.x[i]-f.x,dz=S.z[i]-f.z;if(dx*dx+dz*dz<m2)cand.push(i);}
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const x=F.x0+jx*TF,z=F.z0+jz*TF,qx=x-f.x,qz=z-f.z;let p=0,rk=1;
      if(f.k==='aile'){const u=qx*f.ux+qz*f.uz,v=-qx*f.uz+qz*f.ux,nz=.5*(cyNz(x/90,z/90,1)-.5)+.3*(cyNz(x/33,z/33,2)-.5),du=Math.abs(u)/f.Lh,dv=Math.abs(v)/f.Th*(1+.08*nz);
        if(du>=1.1||dv>=1.2)continue;
        const hu=du<.8?1:Math.sqrt(Math.max(0,1-((du-.8)/.3)*((du-.8)/.3))),hv=dv<1?1:1-(dv-1)/.2;p=hu*hv*(1+.05*nz);rk=dv<.93&&du<.82?.3:1;}
      else{const an=Math.atan2(qz,qx);let d=Math.sqrt(qx*qx+qz*qz)/f.r;d*=1+.08*Math.sin(an*5+f.n)+.05*Math.sin(an*11+f.n*1.7)+.06*(cyNz(x/50,z/50,2)-.5);
        if(d>=f.dm)continue;p=d<.9?1:d<1.06?1-.72*(d-.9)/.16:.28*Math.pow(Math.max(0,1-(d-1.06)/(f.dm-1.06)),2);rk=d<.84?f.rkT:d<1.12?1:.45;}
      if(p<=.002)continue;let g=f.yb+(f.yt-f.yb)*p,cl=false;
      for(let c=0;c<cand.length;c++){const i=cand[c],ax=S.x[i],az=S.z[i],dx=S.x[i+1]-ax,dz=S.z[i+1]-az,l2=dx*dx+dz*dz||1;let w=((x-ax)*dx+(z-az)*dz)/l2;w=w<0?0:w>1?1:w;
        const px=ax+dx*w-x,pz=az+dz*w-z;if(px*px+pz*pz>=CL*CL)continue;
        let sb=0;if(hasN){const ny=S.ny[i]+(S.ny[i+1]-S.ny[i])*w;sb=ny<0?1:Math.sqrt(Math.max(0,1-Math.min(1,ny*ny)));}
        const yr=S.y[i]+(S.y[i+1]-S.y[i])*w-TH-6-RH*sb;if(g>yr){g=yr;cl=true;}}
      if(g<=f.yb+.5)continue;const o=jz*F.nx+jx;if(g>fc[o*2+1]){fc[o*2+1]=g;fm[o*4+1]=cl?0:Math.round(rk*255);nc++;}}
    if(f.yt>CY.yMaxM)CY.yMaxM=f.yt;}
  return nc;}

/* ---- LE PLAN (cyBatitG, sur le fil principal) : les rochers et les ouvrages de CE canyon, tirés de la route posée (S), de ses gabarits (ZA : tous, avec leurs abscisses), de ses
   repères (sQ) et d'un hasard né de la graine — rien d'autre (le même canyon se rebâtit au bit près). Rend {rel (pour le travailleur), toits (les ouvrages cuits à la pose), lev (leurs
   disques d'ombre pour le balayage du soleil), n (le compte par sorte), ext (jusqu'où un rocher s'éloigne de la route : la taille fine doit le contenir)} ---- */
function cyV3Plan(S,ZA,sQ,K,seed){
  const out={rel:[],toits:[],lev:[],n:{},ext:0};if(!CY_V3.on||!S||!(S.n>8))return out;
  const RH=ROAD_HALF,TH=THICK,CL=RH+18,NS=S.n,DS=S.ds,K4=Math.pow(K,.4),r=mulberry32((seed^0x3C4E9A11)>>>0);
  const ix=s9=>Math.max(0,Math.min(NS-1,Math.round(s9/DS))),compte=k=>{out.n[k]=(out.n[k]||0)+1;};
  /* la place : aucun tronçon de route à moins de `rad` (en plan) dont le bitume passe sous `top` + 14 m — sauf l'intervalle [sa, sb] (le tunnel de l'aileron lui-même) */
  const libre=(x,z,rad,top,sa,sb)=>{const R2=rad*rad;for(let j=0;j<NS;j++){const s9=j*DS;if(sa!=null&&s9>=sa&&s9<=sb)continue;const dx=S.x[j]-x,dz=S.z[j]-z;if(dx*dx+dz*dz<R2&&top>S.y[j]-TH-14)return false;}return true;};
  const fond=i=>{let m=1e9;for(let j=Math.max(0,i-14);j<=Math.min(NS-1,i+14);j++)if(S.F[j]<m)m=S.F[j];return m;};
  const ext=(x,z,R9)=>{let d=1e18;for(let j=0;j<NS;j+=2){const dx=S.x[j]-x,dz=S.z[j]-z,e=dx*dx+dz*dz;if(e<d)d=e;}const e9=Math.sqrt(d)+R9;if(e9>out.ext)out.ext=e9;};
  const pose=(f,nom,s9)=>{f.s=Math.round(s9);f.nom=nom;out.rel.push(f);compte(nom);ext(f.x,f.z,f.R9);};
  /* une aiguille (ou un rocher) à l'intérieur d'un virage : n = la direction du centre du virage ; elle recule de 22 m en 22 m (trois fois) tant qu'une route est trop près */
  const aiguille=(i,nx,nz,rN,ht,nom)=>{const top=S.y[i]+ht,yb=fond(i)-40;
    for(let e=0;e<3;e++){const d=CL+rN*1.35+6+e*22+(e?0:r()*10),x=S.x[i]+nx*d,z=S.z[i]+nz*d;
      if(libre(x,z,CL+rN*1.45,top)){pose({k:'pil',x:x,z:z,r:rN,yb:yb,yt:top,dm:1.7,R9:rN*1.75+4,n:r()*6.28,rkT:nom==='rocher'?.2:.35},nom,i*DS);return true;}}
    return false;};
  const dirIn=(ia,ib)=>{let nx=S.tx[ib]-S.tx[ia],nz=S.tz[ib]-S.tz[ia];const nl=Math.hypot(nx,nz);if(nl<.05)return null;return [nx/nl,nz/nl];};
  // 1) LES ZONES DES PIÈCES : pas de rocher de corde dedans (elles ont leurs ouvrages, ou leurs parois sont déjà collées)
  const occ=new Uint8Array(NS),marque=(a,b,pad)=>{if(a==null||b==null||!isFinite(a)||!isFinite(b))return;for(let i=ix(a-(pad||0));i<=ix(b+(pad||0));i++)occ[i]=1;};
  for(const z of ZA)if(/^(fente|serre|tonneau|porte|galerie|boucle|aiguille|pont|phrase|tube)$/.test(z.t))marque(z.a,z.b,70);
  marque(0,sQ.breche1!=null?sQ.breche1+120:600);marque(sQ.etroit0,sQ.etroit1,120);marque(sQ.mine0,sQ.mine1,80);marque(sQ.mur0,sQ.mur2,80);marque(sQ.arche0,sQ.arche1,80);
  marque(sQ.amphi0!=null?sQ.amphi0-170:null,sQ.amphi1!=null?sQ.amphi1+260:null,0);marque(sQ.finale0!=null?sQ.finale0-120:L-900,L,0);
  for(const k in sQ){const m=/^(rac[A-H])0$/.exec(k);if(m)marque(sQ[m[1]+'0']-80,sQ[m[1]+'3']+300,0);}
  // 2) LE SLALOM DES AIGUILLES : une grande aiguille à la corde de chaque virage de la pièce
  for(const z of ZA){if(z.t!=='aiguille')continue;const ia=ix(z.a),ib=ix(z.b),im=ix((z.a+z.b)/2),n9=dirIn(ia,ib);if(!n9)continue;
    if(!aiguille(im,n9[0],n9[1],(14+r()*10)*K4,(110+r()*110)*K4,'aiguille'))compte('aiguilleKO');}
  // 3) LA BOUCLE DE LA BUTTE : la butte au centre de la boucle (son pied sous la route qui en fait le tour : la route semble taillée dans son flanc)
  for(const z of ZA){if(z.t!=='boucle')continue;const gf=z.v==='gouffre',a=gf?sQ.gf0:sQ.bt0,b=gf?sQ.gf1:sQ.bt1;if(a==null||b==null||b-a<300){compte(gf?'gouffreKO':'butteKO');continue;}
    let cx=0,cz=0,n=0;for(let i=ix(a);i<=ix(b);i++){cx+=S.x[i];cz+=S.z[i];n++;}cx/=n;cz/=n;let Rl=0;for(let i=ix(a);i<=ix(b);i++)Rl+=Math.hypot(S.x[i]-cx,S.z[i]-cz);Rl/=n;
    const Rb=Rl-CL-10;if(Rb<30){compte(gf?'gouffreKO':'butteKO');continue;}const i0=ix(a),yb=Math.min(fond(i0),fond(ix((a+b)/2)))-60;
    if(!gf){const top=S.y[i0]+(150+r()*80)*K4;pose({k:'pil',x:cx,z:cz,r:Rb,yb:yb,yt:top,dm:1.4,R9:Rb*1.42+4,n:r()*6.28,rkT:.22},'butte',a);continue;}
    /* LE GOUFFRE : pas de butte — un puits profond au milieu du tour, trois aiguilles dressées au fond (leur cime reste 25 m sous la route la plus basse du tour) */
    let ylo=1e9;for(let i=ix(a);i<=ix(b);i++)if(S.y[i]<ylo)ylo=S.y[i];compte('gouffre');
    for(let q=0;q<3;q++){const an=r()*6.28,dd=Rb*(.15+r()*.55),x=cx+Math.cos(an)*dd,z9=cz+Math.sin(an)*dd,rN=(10+r()*8)*K4,top=ylo-25-r()*40;if(top<yb+30)continue;
      if(libre(x,z9,CL+rN*1.45,top))pose({k:'pil',x:x,z:z9,r:rN,yb:yb,yt:top,dm:1.7,R9:rN*1.75+4,n:r()*6.28,rkT:.35},'aiguille du gouffre',a);}}
  // 3 bis) L'ÉPERON DU TROMBONE : un piton au centre du second demi-tour (le serré : la route en fait le tour ; aucune autre route ne passe dans ce cercle)
  for(const k in sQ){const m=/^(rac[A-H])r$/.exec(k);if(!m)continue;const a=sQ[k],b=sQ[m[1]+'2'];if(a==null||b==null)continue;const ia=ix(a),ib=ix(b),cx=(S.x[ia]+S.x[ib])/2,cz=(S.z[ia]+S.z[ib])/2,
      Rd=Math.hypot(S.x[ib]-S.x[ia],S.z[ib]-S.z[ia])/2,Re=Rd-CL-10;if(Re<24){compte('eperonKO');continue;}
    pose({k:'pil',x:cx,z:cz,r:Re,yb:fond(ia)-60,yt:S.y[ia]+(90+r()*70)*K4,dm:1.4,R9:Re*1.42+4,n:r()*6.28,rkT:.25},'éperon',a);}
  // 4) LES PORTES DE GRÈS : l'aileron (en travers de la route, centré sur elle) et le BOUCHON qui ferme sa fente au-dessus du tunnel
  for(const z of ZA){if(z.t!=='porte')continue;const a=z.a,b=z.b,m=(a+b)/2,im=ix(m),tx=S.tx[im],tz=S.tz[im],ux=tz,uz=-tx,Th=Math.max(20,(b-a)/2-8),yt=S.y[im]+(190+r()*90)*K4,yb=fond(im)-90;
    let Lh=(340+r()*120)*K4;
    const ok=Lh9=>{for(let j=0;j<NS;j++){const s9=j*DS;if(s9>=a-260&&s9<=b+260)continue; /* l'approche et la sortie de CETTE porte (droites, en travers de l'aileron) : la fente les épargne — MESURÉ : à ±40 m la porte ne se posait jamais */const qx=S.x[j]-S.x[im],qz=S.z[j]-S.z[im],u=Math.abs(qx*ux+qz*uz),v=Math.abs(-qx*uz+qz*ux);
      if(u<Lh9*1.12+CL&&v<Th*1.25+CL&&S.y[j]<yt+TH+14)return false;}return true;};
    while(Lh>200*K4&&!ok(Lh))Lh-=40;if(!ok(Lh)){compte('porteKO');continue;}
    pose({k:'aile',x:S.x[im],z:S.z[im],ux:ux,uz:uz,Lh:Lh,Th:Th,yb:yb,yt:yt,R9:Math.hypot(Lh*1.12,Th*1.25)+12},'porte',m);
    const s0=m-Th+1.5,s1=m+Th-1.5;out.toits.push({t:'bouchon',s0:s0,s1:s1,hc:CY_V3.porteHc,hk:CY_V3.porteHk,W:CL+8,yt:yt-1,ombre:.18});
    for(let s9=s0;s9<=s1+.1;s9+=8){const i=ix(s9);out.lev.push([S.x[i],S.z[i],CL+18,yt]);}}
  // 4 bis) LE BOUCHON DE LA PHRASE DU MUR : la roche qui FERME la gorge au-dessus du tunnel (le tube de la phrase y est percé, la gorge le serre de ses parois) — de la bouche à la sortie
  for(const z of ZA){if(z.t!=='tube')continue;const s0=z.a,s1=z.b;if(s1-s0<80){compte('tunnelKO');continue;}let ym=-1e9;for(let i=ix(s0);i<=ix(s1);i++)if(S.y[i]>ym)ym=S.y[i];
    const yt=ym+(160+r()*90)*K4;out.toits.push({t:'bouchon',s0:s0,s1:s1,hc:CY_V3.tubeR+2,hk:10,W:CY_V3.tubeR+24,yt:yt,ombre:.2});compte('tunnel');
    for(let s9=s0;s9<=s1+.1;s9+=10){const i=ix(s9);out.lev.push([S.x[i],S.z[i],CY_V3.tubeR+30,yt]);}}
  // 5) LA GALERIE : le toit (accroché à la falaise, côté -sg) et ses piliers (côté du vide)
  for(const z of ZA){if(z.t!=='galerie')continue;const cs=-(z.sg||1),s0=z.a+18,s1=z.b-18;if(s1-s0<120){compte('galerieKO');continue;}
    out.toits.push({t:'galerie',s0:s0,s1:s1,cs:cs,hb:CY_V3.galHb,ht:CY_V3.galHt,P:CY_V3.galP*Math.pow(K,.3),ombre:.5});compte('galerie');
    for(let s9=s0;s9<=s1+.1;s9+=10){const i=ix(s9),lc=cs*12;out.lev.push([S.x[i]+S.tz[i]*lc,S.z[i]-S.tx[i]*lc,46,S.y[i]+CY_V3.galHb+CY_V3.galHt]);}}
  // 6) LE PONT NATUREL : une arche de grès sous la traversée, du lit de la rivière jusque sous le bitume (la clé suit la route ; les culées plongent)
  for(const z of ZA){if(z.t!=='pont')continue;const a=z.a,b=z.b,m=(a+b)/2,im=ix(m),tx=S.tx[im],tz=S.tz[im],Ua=(b-a)/2+46,T=(26+r()*8)*K4,W=2*(RH+9);
    const yF=Math.min(fond(ix(a)),fond(im),fond(ix(b)))-30,P=[],NK=36;let bon=true;
    for(let k=0;k<=NK&&bon;k++){const u=-Ua+2*Ua*k/NK,e=Math.abs(u)/Ua,ab=1+1.4*e*e*e,x=S.x[im]+tx*u,z9=S.z[im]+tz*u,yr=S.y[ix(Math.max(0,Math.min(L,m+u)))]-TH-2-T*.5;
      let y=e<=.36?yr:yr-(yr-yF)*Math.pow((e-.36)/.64,1.7);
      for(let j=0;j<NS;j++){const dx=S.x[j]-x,dz=S.z[j]-z9,rr=W*.5*ab+RH+6;if(dx*dx+dz*dz>rr*rr)continue;const lim=S.y[j]-TH-3-T*.5*ab;if(y>lim){if(e>.5&&y-lim>15){bon=false;break;}y=lim;}}
      P.push({x:x,y:y,z:z9,u:u});}
    if(!bon){compte('pontKO');continue;}
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);}const mg=W+20;
    out.toits.push({t:'pont',P:P,ux:tx,uz:tz,lx:tz,lz:-tx,W:W,T:T,Ua:Ua,cx:S.x[im],cz:S.z[im],bb:[x0-mg,x1+mg,z0-mg,z1+mg],s0:a,s1:b});compte('pont');
    for(let k=0;k<P.length;k+=2)out.lev.push([P[k].x,P[k].z,W*.5,P[k].y+T*.5]);}
  // 7) LES ROCHERS DE CORDE : à l'intérieur des virages des passages ouverts (hors pièces), une aiguille (62 %) ou un rocher — 14 au plus, à 260 m l'un de l'autre au moins
  {const hd=new Float32Array(NS);let pv=Math.atan2(S.tx[0],S.tz[0]);hd[0]=pv;for(let i=1;i<NS;i++){const h=Math.atan2(S.tx[i],S.tz[i]);let d=h-pv;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;hd[i]=hd[i-1]+d;pv=h;}
   const W=Math.max(6,Math.round(110/DS)),dH=i=>hd[Math.min(NS-1,i+W)]-hd[Math.max(0,i-W)];let last=-1e9,n=0;
   for(let i=W;i<NS-W&&n<CY_V3.rochersMax;i++){const d=Math.abs(dH(i));if(d<.5||occ[i])continue;if(d<Math.abs(dH(i-1))||d<Math.abs(dH(i+1)))continue;
     if(i*DS-last<260||S.zL[i]<.3||S.zS[i]>.3)continue;
     if(r()>CY_V3.rochers){last=i*DS;continue;}
     const n9=dirIn(Math.max(0,i-W),Math.min(NS-1,i+W));if(!n9)continue;const big=r()<.62,rN=(big?11+r()*12:20+r()*16)*K4,ht=(big?70+r()*120:24+r()*40)*K4;
     if(aiguille(i,n9[0],n9[1],rN,ht,big?'aiguille':'rocher')){n++;last=i*DS;}}}
  // les boîtes des ouvrages (le rejet rapide de la collision)
  for(const T of out.toits){if(T.bb)continue;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=ix(T.s0-20);i<=ix(T.s1+20);i++){x0=Math.min(x0,S.x[i]);x1=Math.max(x1,S.x[i]);z0=Math.min(z0,S.z[i]);z1=Math.max(z1,S.z[i]);}
    const mg=T.t==='bouchon'?T.W+20:RH+60;T.bb=[x0-mg,x1+mg,z0-mg,z1+mg];}
  return out;}

/* ---- LES OUVRAGES (à la pose, dans CY.grp : la matière du relief, ses strates, son ombre) ---- */
function cyV3Fr(s9,o){const S=CY.S,n=S.n,f=Math.max(0,Math.min(n-1.001,s9/S.ds)),i=Math.floor(f),u=f-i,j=Math.min(n-1,i+1);
  o.x=S.x[i]+(S.x[j]-S.x[i])*u;o.y=S.y[i]+(S.y[j]-S.y[i])*u;o.z=S.z[i]+(S.z[j]-S.z[i])*u;let tx=S.tx[i]+(S.tx[j]-S.tx[i])*u,tz=S.tz[i]+(S.tz[j]-S.tz[i])*u;const tl=Math.hypot(tx,tz)||1;o.tx=tx/tl;o.tz=tz/tl;return o;}
/* le BOUCHON d'une porte : la fente de l'aileron fermée au-dessus du tunnel — un plafond voûté (hc au bord, hc + hk au milieu), deux flancs pris dans la roche (±W), un dessus au sommet de l'aileron */
function cyBouchonGeo(T){const n=Math.max(2,Math.ceil((T.s1-T.s0)/6)),NA=12,R=NA+3,P=[],I=[],o={};
  for(let k=0;k<=n;k++){cyV3Fr(T.s0+(T.s1-T.s0)*k/n,o);const rx=o.tz,rz=-o.tx,pt=(lat,y)=>{P.push(o.x+rx*lat,y,o.z+rz*lat);};
    pt(-T.W,T.yt);for(let a=0;a<=NA;a++){const e=-1+2*a/NA;pt(e*T.W,o.y+T.hc+T.hk*(1-e*e));}pt(T.W,T.yt);}
  for(let k=0;k<n;k++)for(let q=0;q<R;q++){const a=k*R+q,b=k*R+(q+1)%R,c=a+R,d=b+R;I.push(a,c,b,b,c,d);}
  for(const k of [0,n]){const ci=P.length/3;cyV3Fr(T.s0+(T.s1-T.s0)*k/n,o);P.push(o.x,(T.yt+o.y+T.hc+T.hk)*.5,o.z);for(let q=0;q<R;q++)I.push(ci,k*R+q,k*R+(q+1)%R);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);const g2=g.toNonIndexed();g.dispose();g2.computeVertexNormals();g2.computeBoundingSphere();return g2;}
/* la GALERIE : le toit (de la falaise à 13 m au-delà du bord, son bord extérieur plus mince), le seuil sous le bord de la dalle, les piliers tous les P m côté vide */
function cyGalerieGeo(T){const P=[],I=[],o={},RH=ROAD_HALF,TH=THICK,cs=T.cs,n=Math.max(2,Math.ceil((T.s1-T.s0)/6)),Li=cs*(RH+34),Lo=-cs*(RH+13),Ls=-cs*(RH-4),hb=T.hb,ht=T.ht;
  const at=(lat,up)=>[o.x+o.tz*lat,o.y+up,o.z-o.tx*lat],quad=(a,b,c,d)=>{const q=P.length/3;P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);I.push(q,q+1,q+2,q,q+2,q+3);};
  let pr=null;
  for(let k=0;k<=n;k++){cyV3Fr(T.s0+(T.s1-T.s0)*k/n,o);const c={ib:at(Li,hb+3),ob:at(Lo,hb),ot:at(Lo,hb+ht*.7),it:at(Li,hb+ht+8),si:at(Ls,-TH-.5),so:at(Lo,-TH-.5),sb:at(Lo,-TH-9),sib:at(Ls,-TH-9)};
    if(pr){quad(pr.ib,pr.ob,c.ob,c.ib);quad(pr.ob,pr.ot,c.ot,c.ob);quad(pr.ot,pr.it,c.it,c.ot);quad(pr.si,pr.so,c.so,c.si);quad(pr.so,pr.sb,c.sb,c.so);quad(pr.sb,pr.sib,c.sib,c.sb);}
    pr=c;
    if(k===0||k===n){quad(c.ib,c.ob,c.ot,c.it);quad(c.si,c.so,c.sb,c.sib);}}
  for(let k=0;;k++){const sp=T.s0+T.P*(k+.5);if(sp>T.s1-T.P*.4)break;cyV3Fr(sp,o);const ax=o.tx,az=o.tz,bx=o.tz,bz=-o.tx,y0=o.y-TH-9,y1=o.y+hb+1,
      v=(al,lat,y)=>[o.x+ax*al+bx*lat,y,o.z+az*al+bz*lat],a0=-cs*(RH+3),a1=-cs*(RH+12),w=5.5;
    const c000=v(-w,a0,y0),c100=v(w,a0,y0),c010=v(-w,a1,y0),c110=v(w,a1,y0),c001=v(-w,a0,y1),c101=v(w,a0,y1),c011=v(-w,a1,y1),c111=v(w,a1,y1);
    quad(c000,c100,c101,c001);quad(c010,c110,c111,c011);quad(c000,c010,c011,c001);quad(c100,c110,c111,c101);quad(c000,c100,c110,c010);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);const g2=g.toNonIndexed();g.dispose();g2.computeVertexNormals();g2.computeBoundingSphere();return g2;}
/* le PONT NATUREL : un tube de grès à section arrondie le long de sa courbe (dans le plan vertical de la route), plus épais aux culées */
function cyPontGeo(T){const P=T.P,NR=16,pos=[],idx=[],rg=mulberry32(0xB0A7E5);
  for(let k=0;k<P.length;k++){const p=P[k],q=P[Math.min(P.length-1,k+1)],o=P[Math.max(0,k-1)];let tu=q.u-o.u,ty=q.y-o.y;const tl=Math.hypot(tu,ty)||1;tu/=tl;ty/=tl;
    const nu=-ty,ny=tu,e=Math.abs(p.u)/T.Ua,ab=1+1.4*e*e*e;
    for(let j=0;j<NR;j++){const an=j/NR*Math.PI*2,c=Math.cos(an),sn=Math.sin(an),sq=Math.pow(Math.abs(c),.55)*Math.sign(c),sq2=Math.pow(Math.abs(sn),.55)*Math.sign(sn),
        w=T.W*.5*ab*(1+.08*(rg()-.5)),t=T.T*.5*ab*(1+.10*(rg()-.5)),uu=p.u+nu*t*sq2,yy=p.y+ny*t*sq2,la=w*sq;
      pos.push(T.cx+T.ux*uu+T.lx*la,yy,T.cz+T.uz*uu+T.lz*la);}}
  for(let k=0;k<P.length-1;k++)for(let j=0;j<NR;j++){const a=k*NR+j,b=k*NR+(j+1)%NR,c=a+NR,d=b+NR;idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;}
function cyToits(){CY.toitsN=0;const L9=CY.toits;if(!L9||!L9.length||!CY.grp||!CY.S)return;const M9=cyMonuMats();
  for(const T of L9){let g=null;try{g=T.t==='bouchon'?cyBouchonGeo(T):T.t==='galerie'?cyGalerieGeo(T):T.t==='pont'?cyPontGeo(T):null;}catch(e){console.warn('canyon : ouvrage',T.t,e);}
    if(!g)continue;const m=new THREE.Mesh(g,T.t==='pont'?M9.a:M9.b);m.name='ouvrage '+T.t;m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);CY.toitsN++;}}
/* EN VOL : la roche des ouvrages tue (canyonHeurt, cinq points de la caisse) — un rejet par boîte, puis le repère de la route au plus près */
const CY_V3O={};
function cyToitHeurt(p){const L9=CY.toits;if(!L9||!L9.length||!CY.S)return false;const S=CY.S,RH=ROAD_HALF,TH=THICK;
  for(let q=0;q<L9.length;q++){const T=L9[q];if(T.bb&&(p.x<T.bb[0]||p.x>T.bb[1]||p.z<T.bb[2]||p.z>T.bb[3]))continue;
    if(T.t==='pont'){const dx=p.x-T.cx,dz=p.z-T.cz,u=dx*T.ux+dz*T.uz,la=dx*T.lx+dz*T.lz;if(Math.abs(u)>T.Ua)continue;
      const f=(u+T.Ua)/(2*T.Ua)*(T.P.length-1),k=Math.max(0,Math.min(T.P.length-2,Math.floor(f))),w=f-k,yc=T.P[k].y+(T.P[k+1].y-T.P[k].y)*w,e=Math.abs(u/T.Ua),ab=1+1.4*e*e*e;
      if(Math.abs(la)<T.W*.5*ab+1&&Math.abs(p.y-yc)<T.T*.5*ab+1)return true;continue;}
    const i0=Math.max(0,Math.floor((T.s0-14)/S.ds)),i1=Math.min(S.n-1,Math.ceil((T.s1+14)/S.ds));let bi=-1,bd=1e18;
    for(let i=i0;i<=i1;i++){const dx=p.x-S.x[i],dz=p.z-S.z[i],d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i;}}
    if(bi<0)continue;const o=cyV3Fr(bi*S.ds,CY_V3O),s9=bi*S.ds+(p.x-o.x)*o.tx+(p.z-o.z)*o.tz;cyV3Fr(s9,o);const lat=(p.x-o.x)*o.tz-(p.z-o.z)*o.tx,up=p.y-o.y;
    if(T.t==='bouchon'){if(s9<T.s0-1||s9>T.s1+1||Math.abs(lat)>T.W)continue;const e=lat/T.W;if(up>T.hc+T.hk*(1-e*e)-1.6&&p.y<T.yt+2)return true;continue;}
    if(T.t==='galerie'){if(s9<T.s0-1||s9>T.s1+1)continue;const lc=lat*T.cs; /* + : vers la falaise */
      if(up>T.hb-1.4&&up<T.hb+T.ht+10&&lc>-(RH+14)&&lc<RH+40)return true;                                    // le toit
      if(lc<-(RH-5)&&lc>-(RH+14)&&up>-TH-10&&up<-TH+.5)return true;                                           // le seuil (sous le bord de la dalle)
      if(lc<-(RH+2)&&lc>-(RH+13)&&up>-TH-10&&up<T.hb+2){const k=Math.round((s9-T.s0)/T.P-.5),sp=T.s0+T.P*(k+.5);if(k>=0&&sp<=T.s1-T.P*.4&&Math.abs(s9-sp)<6.6)return true;} // un pilier
      continue;}}
  return false;}
/* la lumière sous les ouvrages : 1 dehors, `ombre` dedans (fondu sur 24 m aux deux bouches) */
function cyToitOmbre(s9){const L9=CY.toits;if(!L9||!L9.length)return 1;let k=1;for(const T of L9){if(T.ombre==null||s9<T.s0||s9>T.s1)continue;const d=Math.min(s9-T.s0,T.s1-s9),f=Math.min(1,d/24);k=Math.min(k,1-(1-T.ombre)*f);}return k;}
/* ===== LA PHRASE DU MUR (2026-11-13, Sacha, après avoir joué : « aucune torsade, ça n'exploite pas du tout les murs, à l'endroit, à l'envers » ; la supervision : « le canyon se ride
   par ses murs ») — sur CHAQUE route : un plat au fond de la gorge serrée → la dalle MONTE sur la paroi (85° : le plan de roche des murs se pose derrière elle, le vide dessous) →
   elle entre dans le TUNNEL percé sous le bouchon de roche qui ferme la gorge et y passe TÊTE EN BAS → elle ressort sur l'AUTRE paroi (`traversee`) ou sur la MÊME (`arche` :
   le demi-tour sous l'arche) → elle redescend au fond. Le roulis tourne à vitesse CONSTANTE (rampes linéaires adoucies sur 15 % : ≤ ~44°/s ressentis, la charte R3) ; les tenues
   sont des temps de jeu. L'envers dure ~7 s (la charte R13 : ≥ 6 % de chaque route), le tunnel ne couvre que la partie au-delà de la verticale.
   cyPhraseCles(v) : les clés [durée (s, à la vitesse ressentie), angle visé (°)] depuis 0° ; cyPhraseAngle : l'angle à x m du début ; cyPhraseBank : le roulis de la route. */
function cyPhraseCles(v){const W=CY_V3.phrW,R=CY_V3.phrR/1.18,r=d=>Math.abs(d)/R; /* une rampe : l'angle / la vitesse moyenne (le pic vaut 1,18 × la moyenne) */
  const K=[[CY_V3.phrSol,0],[r(W),W],[CY_V3.phrMur,W],[r(180-W),180],[CY_V3.phrEnv,180]];
  if(v==='arche')K.push([r(180-W),W],[CY_V3.phrMur2,W],[r(W),0],[CY_V3.phrSol,0]);else K.push([r(180-W),360-W],[CY_V3.phrMur2,360-W],[r(W),360],[CY_V3.phrSol,360]);
  return K;}
function cyPhraseAngle(K,vP,x){let t0=0,a0=0;for(const k of K){const L9=k[0]*vP;if(x<=t0+L9){const u=L9>0?(x-t0)/L9:1,e=.15,f=u<e?u*u/(2*e*(1-e)):u>1-e?1-(1-u)*(1-u)/(2*e*(1-e)):(u-e/2)/(1-e);return a0+(k[1]-a0)*f;}t0+=L9;a0=k[1];}return a0;}
function cyPhraseBank(C,i0,i1,sg,v,vP){const n=C.length,sc=new Float32Array(n),N=[],B9=new Float32Array(n),K=cyPhraseCles(v);for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n;i++){const a9=C[Math.max(0,i-1)],c9=C[Math.min(n-1,i+1)],tl=Math.hypot(c9.x-a9.x,c9.z-a9.z)||1,tx=(c9.x-a9.x)/tl,tz=(c9.z-a9.z)/tl,d=i<=i0?0:cyPhraseAngle(K,vP,sc[i]-sc[i0]),b=sg*d/57.2958;B9[i]=b;
    N.push(new THREE.Vector3(-tz*Math.sin(b),Math.cos(b),tx*Math.sin(b)));}
  return {N:N,b:B9,maxDeg:180,mur:0,de:Math.round(sc[i0]),a:Math.round(sc[i1]),W:0,kref:0};}
/* le DÉVERS PARTOUT : la courbure de la route, lissée comme celle des murs, pliée par un tanh — `doux`° au plus pour un virage serré (rayon ~2 RMIN), la moitié pour un grand */
function cyDouxBank(C,VW){const n=C.length,sc=new Float32Array(n),kap=new Float32Array(n),hh=new Float32Array(n),b=new Float32Array(n),RM=CY.rmin||1.08*(40+.3*VW),mx=CY_V3.doux*Math.PI/180;
  for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n;i++){const a9=C[Math.max(0,i-1)],b9=C[Math.min(n-1,i+1)];hh[i]=Math.hypot(b9.x-a9.x,b9.z-a9.z)/2||1;}
  for(let i=1;i<n-1;i++){const ax=C[i].x-C[i-1].x,az=C[i].z-C[i-1].z,bx=C[i+1].x-C[i].x,bz=C[i+1].z-C[i].z,la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;
    kap[i]=Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((la+lb)/2);}
  const W9=Math.max(60,1.2*RM),kl=cyMurLisse(cyMurLisse(kap,sc,hh,W9),sc,hh,W9); /* la fenêtre du lissage suit le RAYON des courbes (à 3,8 × 0,35 × la croisière : 453 m au palier 20, les S s'y annulaient — 12-16 s « à plat ») */
  for(let i=0;i<n;i++)b[i]=mx*Math.tanh(kl[i]*(CY_V3.douxK||1.9)*RM);return b;} /* douxK : le gain — à 1,9, les grandes courbes restaient sous 15° (« à plat » : 10-13 s d'affilée) */
/* ---- LA CONSOLE ---- */
window.dbgCanyonV3=function(k,a){
  if(!CY.on)return 'pas de canyon';const T9=CY.toits||[],R9=CY.rel||[];
  if(k==='test'){ /* chaque ouvrage contre des points dont on connaît la réponse : dedans (la route, la fenêtre) → libre ; la roche (plafond, pilier, arche) → dure */
    const res=[],o={},pt=(s9,lat,up)=>{cyV3Fr(s9,o);return {x:o.x+o.tz*lat,y:o.y+up,z:o.z-o.tx*lat};},RH=ROAD_HALF,TH=THICK;let faux=0;
    const ok=(nom,p,att)=>{const v=cyToitHeurt(p);if(v!==att)faux++;res.push([nom,v===att?'ok':'FAUX']);};
    for(const T of T9){const m=(T.s0+T.s1)/2;
      if(T.t==='bouchon'){ok('bouchon route',pt(m,0,3),false);ok('bouchon bord',pt(m,RH-1,4),false);ok('bouchon plafond',pt(m,0,T.hc+T.hk+3),true);ok('bouchon plafond bord',pt(m,RH,T.hc+T.hk+2),true);ok('bouchon avant',pt(T.s0-30,0,T.hc+T.hk+3),false);}
      if(T.t==='galerie'){const sp=T.s0+T.P*.5;ok('galerie route',pt(m,0,3),false);ok('galerie toit',pt(m,0,T.hb+3),true);ok('galerie pilier',pt(sp,-T.cs*(RH+7),6),true);
        ok('galerie fenêtre',pt(sp+T.P*.5,-T.cs*(RH+7),6),false);ok('galerie seuil',pt(m,-T.cs*(RH+6),-TH-4),true);}
      if(T.t==='pont'){const p=T.P[Math.floor(T.P.length/2)];ok('pont arche',{x:p.x,y:p.y,z:p.z},true);ok('pont route',pt(m,0,3),false);ok('pont à côté',{x:p.x+T.lx*(T.W+30),y:p.y,z:p.z+T.lz*(T.W+30)},false);}}
    return {faux:faux,n:res.length,res:res};}
  if(k==='rel'){const f=R9[a|0];if(!f)return null;return Object.assign({},f,{sol:Math.round(cyHauteur(f.x,f.z))});}
  if(k==='car'){const p=carGroup.position;return {x:+p.x.toFixed(1),y:+p.y.toFixed(1),z:+p.z.toFixed(1),mode:mode,s:Math.round(s),sol:+cyHauteur(p.x,p.z).toFixed(1)};} /* (banc) la caisse : où elle est, au-dessus de quoi */
  return {n:CY.v3n||{},rel:R9.length,ouvrages:T9.map(function(T){return {t:T.t,s0:Math.round(T.s0),s1:Math.round(T.s1)};}),maillages:CY.toitsN|0,
    rochers:R9.map(function(f){return [f.nom,f.s,Math.round(f.r||f.Lh),Math.round(f.yt-(CY.S?CY.S.y[Math.max(0,Math.min(CY.S.n-1,Math.round(f.s/CY.S.ds)))]:0))];})};};
