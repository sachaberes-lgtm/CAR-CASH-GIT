/* LA MINE ABANDONNÉE (2026-10-15, Sacha : « rajoute un module tunnel, une mine abandonnée comme dans Minecraft ») — un tronçon de ~600 m
   (les repères `mine0`/`mine1` de genCanyon, deux grandes courbes) passe dans une galerie CARRÉE taillée dans la roche : murs, plafond et sol
   en BLOCS de 8 × 6 m (pierre en quatre gris, charbon, et du minerai d'OR et de DIAMANT — c'est CASH CAR), des CADRES de bois tous les 16 m
   (deux poteaux + la poutre), des TORCHES sur un poteau sur deux, des RAILS et leurs traverses au milieu de la route, une entrée boisée dans
   une façade de falaise à chaque bout. Tout est en couleurs de sommet CUITES (matière sans éclairage : la galerie est noire, seules les
   torches et la lumière du jour aux deux bouches l'éclairent) — zéro lumière ajoutée à la scène, trois maillages, une matière chacun.
   Dedans, le soleil et le ciel baissent sur la caisse (canyonTick). Les murs touchent presque la route : on FROTTE comme aux Étroits ;
   en vol, le plafond et les murs sont durs (cyMineHeurt). */
const CY_MINE={g:3.5,MH:30,BH:6,cad:2,tor:4,m:null,f:null};
function cyMineIci(){return CY.on&&!!CY.mine&&s>=CY.mine[0]&&s<=CY.mine[1];}
function cyMineMats(){if(CY_MINE.m)return CY_MINE.m;
  const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:true});m.dispose=function(){};
  const f=new THREE.MeshBasicMaterial({color:0xffc04a,fog:false,side:THREE.DoubleSide});f.dispose=function(){};
  CY_MINE.m=m;CY_MINE.f=f;return m;}
function cyMine(iv){const S=CY.S;if(!S)return null;const i0=Math.max(1,Math.round(iv[0]/S.ds)),i1=Math.min(S.n-2,Math.round(iv[1]/S.ds));if(i1-i0<8)return null;
  const M=CY_MINE,L0=ROAD_HALF+M.g,MH=M.MH,FL=-THICK-.6,rg=mulberry32(0x3157E^(CY.job||0)),P=[],C=[],I=[],FP=[],FI=[];
  const DM=CY.deco&&CY.deco.mine,cad=DM?DM.cad:M.cad,tq=DM?DM.tq:2; // (2026-10-20, LE DÉCOR TIRÉ) les cadres tous les 16 ou 24 m, une torche par cadre ou un sur deux, les filons, le bois
  const at=(i,l,h)=>[S.x[i]-S.tz[i]*l,S.y[i]+h,S.z[i]+S.tx[i]*l];
  // LES TORCHES (sur un cadre sur deux, en quinconce) : la lumière se cuit dans les blocs voisins
  const TO=[];for(let i=i0+cad,n=0;i<=i1-cad;i+=cad,n++)if(n%tq===0)TO.push([i,((n/tq)|0)%2?1:-1]);
  const lum=(i,l,h)=>{let b=.10,w=0;for(const t of TO){const di=(i-t[0])*S.ds;if(di>60||di<-60)continue;const dl=l-t[1]*(L0-2.6),dh=h-10,d2=di*di+dl*dl+dh*dh;w+=Math.exp(-d2/420);}
    const jour=Math.max(Math.exp(-(i-i0)*S.ds/34),Math.exp(-(i1-i)*S.ds/34));b+=.80*Math.min(1.3,w)+.75*jour;return [b,w];};
  const teinte=(col,i,l,h)=>{const q=lum(i,l,h),b=q[0],w=Math.min(1,q[1]);return [col[0]*b+.16*w,col[1]*b+.08*w,col[2]*b+.01*w];};
  const quad=(a,b,c,d,col,i,l,h)=>{const o=P.length/3,k=teinte(col,i,l,h);P.push(...a,...b,...c,...d);for(let q=0;q<4;q++)C.push(k[0],k[1],k[2]);I.push(o,o+1,o+2,o,o+2,o+3);};
  const PIER=[[.46,.46,.48],[.38,.38,.40],[.53,.52,.51],[.32,.32,.34],[.42,.40,.38]];
  const bloc=DM?(()=>{const u=rg(),a1=.025*DM.or,a2=a1+.01*DM.or;if(u<a1)return [.92,.74,.22];if(u<a2)return [.38,.92,.90];if(u<a2+.055)return [.16,.16,.17];if(u<a2+.095)return [.45,.36,.27];return PIER[(rg()*PIER.length)|0];}):
    ()=>{const u=rg();if(u<.025)return [.92,.74,.22];if(u<.035)return [.38,.92,.90];if(u<.09)return [.16,.16,.17];if(u<.13)return [.45,.36,.27];return PIER[(rg()*PIER.length)|0];}; // or · diamant · charbon · terre · pierre
  // LES MURS, LE PLAFOND, LE SOL — un bloc par échantillon de route (8 m) et par rangée de 6 m
  for(let i=i0;i<i1;i++){
    for(const sd of [-1,1]){const l=sd*L0;for(let h=FL;h<MH-.01;h+=M.BH){const h2=Math.min(MH,h+M.BH);quad(at(i,l,h),at(i+1,l,h),at(i+1,l,h2),at(i,l,h2),bloc(),i,l,h+3);}}
    const NC=8;for(let c=0;c<NC;c++){const la=-L0+2*L0*c/NC,lb=-L0+2*L0*(c+1)/NC,lm=(la+lb)/2;
      quad(at(i,la,MH),at(i+1,la,MH),at(i+1,lb,MH),at(i,lb,MH),bloc(),i,lm,MH);
      quad(at(i,la,FL),at(i+1,la,FL),at(i+1,lb,FL),at(i,lb,FL),rg()<.3?[.40,.33,.25]:PIER[(rg()*PIER.length)|0],i,lm,FL);}}
  // une BOÎTE posée dans le repère de la route (le long, en travers, en hauteur) — les faces du haut un peu plus claires
  const boite=(i,l,h,a,w,hh,col)=>{const tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx,cx=S.x[i]+bx*l,cz=S.z[i]+bz*l,cy=S.y[i]+h;
    const v=(sa,sw,sh)=>[cx+tx*a*sa+bx*w*sw,cy+hh*sh,cz+tz*a*sa+bz*w*sw];
    const F=[[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],.8],[[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1],1.15],[[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1],.9],
      [[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1],.9],[[-1,-1,-1],[-1,-1,1],[1,-1,1],[1,-1,-1],1],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],1]];
    for(const f of F)quad(v(...f[0]),v(...f[1]),v(...f[2]),v(...f[3]),[col[0]*f[4],col[1]*f[4],col[2]*f[4]],i,l,h);};
  const BV={clair:[[.56,.39,.21],[.44,.30,.16]],sombre:[[.34,.24,.15],[.26,.18,.11]],rouge:[[.62,.24,.16],[.48,.18,.12]]}[DM?DM.bois:'clair'],BOIS=BV[0],BOIS2=BV[1];
  // LES CADRES : deux poteaux contre les murs, la poutre sous le plafond, deux jambes de force
  for(let i=i0+cad;i<=i1-cad;i+=cad){
    for(const sd of [-1,1]){boite(i,sd*(L0-1),(FL+MH)/2,.8,.8,(MH-FL)/2,BOIS);boite(i,sd*(L0-4),MH-3.2,.6,2.6,.6,BOIS2);}
    boite(i,0,MH-1,.85,L0,1,BOIS2);}
  // LES TORCHES : le bâton sur le poteau, la flamme en cube qui brille (sa propre matière, sans brouillard)
  for(const t of TO){const i=t[0],l=t[1]*(L0-2.6);boite(i,l,9,.22,.22,1.1,[.42,.30,.16]);
    const tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx,cx=S.x[i]+bx*l,cz=S.z[i]+bz*l,cy=S.y[i]+10.5,r=.55,o=FP.length/3;
    for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1])FP.push(cx+tx*r*a+bx*r*b,cy+r*c,cz+tz*r*a+bz*r*b);
    FI.push(o,o+1,o+3,o,o+3,o+2, o+4,o+6,o+7,o+4,o+7,o+5, o,o+4,o+5,o,o+5,o+1, o+2,o+3,o+7,o+2,o+7,o+6, o,o+2,o+6,o,o+6,o+4, o+1,o+5,o+7,o+1,o+7,o+3);}
  // LES RAILS : deux fers au milieu de la route et leurs traverses tous les ~2,7 m (décor : la caisse roule dessus)
  for(let i=i0;i<i1;i++){for(const l of [-2.1,2.1])quad(at(i,l-.22,.26),at(i+1,l-.22,.26),at(i+1,l+.22,.26),at(i,l+.22,.26),[.62,.62,.66],i,l,.3);
    for(let q=0;q<3;q++){const u=q/3,ix=i,cx=S.x[i]+(S.x[i+1]-S.x[i])*u,cz=S.z[i]+(S.z[i+1]-S.z[i])*u,cy=S.y[i]+(S.y[i+1]-S.y[i])*u+.12,tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx;
      const v=(a,w)=>[cx+tx*a+bx*w,cy,cz+tz*a+bz*w];quad(v(-.5,-3.2),v(.5,-3.2),v(.5,3.2),v(-.5,3.2),[.40,.28,.15],ix,0,.2);}}
  // LES BOUCHES : la façade de falaise (un cadre de quatre pans autour de l'ouverture, aussi large que la place le permet) et le portique de bois
  const FAC=[],FJ=[];
  for(const e of [i0,i1]){const tx=S.tx[e],tz=S.tz[e],yb=Math.min(S.F[e],S.y[e]-40)-10,top=Math.max(S.y[e]+MH+90,S.R[e]+30);let W=320;
    for(;W>L0+30;W-=40){let ok=true;for(let j=0;j<S.n&&ok;j+=2){if(Math.abs(j-e)*S.ds<260)continue;const dx=S.x[j]-S.x[e],dz=S.z[j]-S.z[e],al=dx*tx+dz*tz,la=-dx*tz+dz*tx;
      if(Math.abs(al)<30&&Math.abs(la)<W+40&&S.y[j]>yb-20&&S.y[j]<top+20)ok=false;}if(ok)break;}
    const pt=(l,y)=>[S.x[e]-tz*l,y,S.z[e]+tx*l],pan=(la,lb,ya,yb2)=>{const o=FAC.length/3;FAC.push(...pt(la,ya),...pt(lb,ya),...pt(lb,yb2),...pt(la,yb2));FJ.push(o,o+1,o+2,o,o+2,o+3);};
    pan(-W,-L0,yb,top);pan(L0,W,yb,top);pan(-L0,L0,S.y[e]+MH,top);pan(-L0,L0,yb,S.y[e]+FL);
    for(const sd of [-1,1])boite(e,sd*(L0-1.4),(FL+MH)/2,1.6,1.4,(MH-FL)/2+.5,BOIS2);boite(e,0,MH-.4,1.6,L0+1,1.6,BOIS);}
  const mk=(P9,I9,mat,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(I9);
    g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);return m;};
  mk(P,I,cyMineMats(),C);mk(FP,FI,CY_MINE.f);mk(FAC,FJ,cyMonuMats().b);
  return {i0:i0,i1:i1,L0:L0};}
function cyMineHeurt(p,M){const S=CY.S;if(!M)return false;let bi=-1,bd=1e18;
  for(let i=Math.max(0,M.i0-3);i<=Math.min(S.n-1,M.i1+3);i++){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>(M.L0+60)**2)return false;const yr=S.y[bi],lt=(p.x-S.x[bi])*-S.tz[bi]+(p.z-S.z[bi])*S.tx[bi],a=Math.abs(lt);
  if(bi<M.i0||bi>M.i1){ // devant une bouche : la façade (hors de l'ouverture) est dure
    const e=bi<M.i0?M.i0:M.i1,al=(p.x-S.x[e])*S.tx[e]+(p.z-S.z[e])*S.tz[e];if(Math.abs(al)<3&&(a>M.L0-1||p.y>S.y[e]+CY_MINE.MH-1))return true;return false;}
  if(a<M.L0&&p.y>yr+CY_MINE.MH-1.5)return true;                               // le plafond
  return a>M.L0-1.2&&a<M.L0+20&&p.y<yr+CY_MINE.MH+2&&p.y>yr-THICK-3;}       // les murs
/* LA ROUTE 66 (2026-10-15 soir, Sacha : « le niveau dans le canyon doit commencer par une longue ligne droite, une vieille station-service
   et un panneau ROUTE 66 ») — au départ, sur le plateau de la vallée des Mitaines (genCanyon : la droite de 820 m), deux décors posés au
   sol, à côté de la route (jamais dessus : ils restent à ROAD_HALF + 6 m au moins) :
   · le PANNEAU ROUTE 67 (rebaptisé le 17/10 par Sacha) à 150 m, à gauche : le bouclier blanc bordé de noir sur ses deux poteaux, « ROUTE » et un grand « 67 » en pixels
     (une police 3 × 5 et 5 × 7 en petits pavés), tourné vers la caisse qui arrive ;
   · la VIEILLE STATION-SERVICE à 430 m, à droite : le bâtiment crème au bandeau rouge passé, sa porte, sa vitrine, la porte du garage, l'auvent
     sur deux piliers, l'îlot et ses deux pompes rétro (rouge et turquoise, globes blancs), des fûts rouillés, le dallage fissuré, et le
     grand mât « GAS » visible de loin.
   Tout est en pavés à couleurs de sommets, cuits en UNE géométrie aux coordonnées du monde, dessinée par la matière des arbres du canyon
   (`cyMonuMats().t` : la lumière, l'ombre portée des parois et le brouillard du canyon — aucun programme neuf). Console : dbgCanyon('r66'). */
const CY_FONTE={R:['XX.','X.X','XX.','X.X','X.X'],O:['.X.','X.X','X.X','X.X','.X.'],U:['X.X','X.X','X.X','X.X','XXX'],T:['XXX','.X.','.X.','.X.','.X.'],
  E:['XXX','X..','XX.','X..','XXX'],G:['.XX','X..','X.X','X.X','.XX'],A:['.X.','X.X','XXX','X.X','X.X'],S:['.XX','X..','.X.','..X','XX.'],
  6:['.XXX.','X....','X....','XXXX.','X...X','X...X','.XXX.'],7:['XXXXX','....X','...X.','..X..','.X...','.X...','.X...'],
  M:['X...X','XX.XX','X.X.X','X...X','X...X'],L:['X..','X..','X..','X..','XXX'],N:['X..X','XX.X','X.XX','X..X','X..X'],I:['XXX','.X.','.X.','.X.','XXX'],D:['XX.','X.X','X.X','X.X','XX.']}; // (2026-10-20) + M, L, N, I, D : le MOTEL, le DINER
function cyRoute66(){
  const S=CY.S;if(!S||S.n<80)return null;
  const P=[],C=[],I=[],O=new THREE.Vector3(),Ax=new THREE.Vector3(),Az=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0),g0=new THREE.BoxGeometry(1,1,1);
  let sd=1,ks=1;const rep=(s9,lat,cote)=>{const i=Math.min(S.n-2,Math.max(1,Math.round(s9/S.ds))),tx=S.tx[i],tz=S.tz[i];sd=cote; // le repère : x vers le dehors de la route, z le long de la route, y en haut
    Ax.set(-tz*cote,0,tx*cote);Az.set(tx,0,tz);O.set(S.x[i],0,S.z[i]).addScaledVector(Ax,lat);return {i:i,yr:S.y[i]};};
  const pave=(x,y,z,sx,sy,sz,col,rx,G)=>{const g1=G||g0,b=P.length/3,p=g1.attributes.position,n=g1.index,ca=Math.cos(rx||0),sa=Math.sin(rx||0);
    for(let k=0;k<p.count;k++){let lx=p.getX(k)*sx,ly=p.getY(k)*sy,lz=p.getZ(k)*sz;if(rx){const t=lx*ca-lz*sa;lz=lx*sa+lz*ca;lx=t;}
      const wx=(x+lx)*ks,wy=(y+ly)*ks,wz=(z+lz)*ks, /* ks : l'échelle du décor en cours (la station ×1,6 : la route fait 56 m de large) */v=.9+.18*Math.abs(Math.sin((b+k)*12.9898)); // un grain de vieillesse, sommet par sommet
      P.push(O.x+Ax.x*wx+Az.x*wz,O.y+wy,O.z+Ax.z*wx+Az.z*wz);C.push(col[0]*v,col[1]*v,col[2]*v);}
    if(n)for(let k=0;k<n.count;k++)I.push(b+n.getX(k));else for(let k=0;k<p.count;k++)I.push(b+k);};
  const solMin=(pts)=>{let m=1e9;for(const q of pts){const x=O.x+Ax.x*q[0]+Az.x*q[1],z=O.z+Ax.z*q[0]+Az.z*q[1];m=Math.min(m,cyHauteur(x,z));}return m;};
  const texte=(mot,x0,y0,z,cel,col,ep)=>{let x=x0;for(const ch of mot){const G=CY_FONTE[ch];if(!G){x+=cel*2;continue;}const w=G[0].length; // les pavés d'un mot, lus de GAUCHE à DROITE pour qui regarde vers +z
      for(let r=0;r<G.length;r++)for(let c=0;c<w;c++)if(G[r][c]==='X')pave(sd*(x+(c+.5)*cel),y0-(r+.5)*cel,z,cel*1.02,cel*1.02,ep,col);x+=(w+1)*cel;}};
  const larg=mot=>{let n=0;for(const ch of mot){const G=CY_FONTE[ch];n+=(G?G[0].length:1)+1;}return n-1;};
  const NOIR=[.08,.08,.09],BLANC=[.93,.92,.88],CREME=[.88,.80,.64],ROUGE=[.70,.20,.15],GRIS=[.55,.53,.50],BETON=[.62,.59,.53],ROUILLE=[.52,.26,.13],TURQ=[.22,.62,.60],VITRE=[.20,.32,.38],BOIS=[.42,.30,.20];
  const DR=CY.deco&&CY.deco.r66,rr=DR?mulberry32((CY.deco.sd^0x6606)>>>0):null;CY.r66m2=[]; // (2026-10-20, LE DÉCOR TIRÉ) la Route 67 tirée — DR nul : celle d'avant
  // ---- LE PANNEAU ROUTE 66 (à gauche, à 150 m) ----
  if(!DR||DR.panneau){const R9=rep(150,ROAD_HALF+5,DR?DR.pc:-1),sol=solMin([[0,-1],[0,1],[1,0],[-1,0]]),cel=.42,haut=R9.yr+2.2+17*cel*.5; O.y=0;
   const bas=haut-17*cel*.5;for(const px of [-1.5,1.5])pave(px,(sol+bas)/2,0,.3,Math.max(.5,bas-sol+.3),.3,GRIS);
   const M=['..KKKKKKKKKKK..','.KWWWWWWWWWWWK.','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KKKKKKKKKKKKKKK',
     'KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','.KWWWWWWWWWWWK.','..KWWWWWWWWWK..','...KKWWWWWKK...','.....KKKKK.....'];
   const y0=haut+17*cel*.5;for(let r=0;r<M.length;r++)for(let c=0;c<15;c++){const k=M[r][c];if(k==='.')continue;pave((c-7)*cel,y0-(r+.5)*cel,0,cel,cel,.18,k==='K'?NOIR:BLANC);}
   const zf=-.13,ct=cel*.47;texte('ROUTE',-larg('ROUTE')*ct/2,y0-1.4*cel,zf,ct,NOIR,.06); // la face tournée vers la caisse qui arrive (−z)
   const c6=cel*1.07;texte('67',-larg('67')*c6/2,y0-7.6*cel,zf,c6,NOIR,.06);} // (2026-10-17, Sacha : « doit s'appeler la route 67 ») : ROUTE 67
  // ---- LA VIEILLE STATION-SERVICE (à droite, à 430 m) ----
  if(!DR||DR.station){const KS=1.6,R9=rep(DR?DR.ss:430,ROAD_HALF+25,DR?DR.sc:1),RM=26,cx=4*KS,sol=solMin([[cx,0],[cx+RM,0],[cx-RM,0],[cx,RM],[cx,-RM]]),top=R9.yr-.3;
   /* LA MESA : la route flotte au moins 18 m au-dessus du plateau (la règle d'or du canyon) — posée au sol, la station était cachée sous le
      bord. Elle trône sur un petit piton de grès aux strates du canyon, son sommet au ras du bitume, à 4 m du bord (elle ne le touche pas). */
   const STR=[[.96,.89,.78],[.96,.81,.49],[.95,.67,.55],[.89,.50,.34],[.67,.29,.20],[.96,.81,.49],[.69,.61,.72],[.95,.67,.55]];
   O.y=0;{let y=sol-4,k=0;while(y<top-1.2){const h=Math.min(top-1.2-y,5+((k*37)%5)),r0=RM*(1+.05*Math.sin(k*2.1))+(top-y)*.035,r1=RM*(1+.05*Math.sin(k*2.1+1.3))+(top-y-h)*.035;
       const cy9=new THREE.CylinderGeometry(r1,r0,h,9,1,false,k*.4);pave(cx,y+h/2,0,1,1,1,STR[k%STR.length],0,cy9);cy9.dispose();y+=h;k++;}
     const cap=new THREE.CylinderGeometry(RM+.9,RM+.4,1.4,9,1,false,.2);pave(cx,top-.6,0,1,1,1,[.58,.30,.20],0,cap);cap.dispose();} // la corniche : la dalle de grès brun
   CY.r66m={x:O.x+Ax.x*cx,z:O.z+Ax.z*cx,r:RM+.9,y0:sol-4,y1:top};
   O.y=top;ks=KS; /* la station, à l'échelle 1,6 */
   pave(4,-1.2,0,25,2.6,21,BETON);                                                     // le dallage (il descend dans le sol : jamais en l'air)
   for(let k=0;k<5;k++)pave(-6+k*4.8,.11,-5+((k*7)%10),.12,.02,3.2,[.36,.33,.30],.6); // ses fissures
   // le bâtiment
   pave(10,2.2,1,9,4.4,12,CREME);pave(10,3.75,1,9.12,.65,12.12,ROUGE);pave(10,4.55,1,9.8,.35,12.8,[.48,.43,.38]);
   pave(5.47,1.2,-1.6,.08,2.4,1.5,BOIS);pave(5.47,2.1,2.6,.08,1.5,3.4,VITRE);pave(5.46,2.1,2.6,.1,1.66,.12,CREME);
   pave(5.47,1.55,-5,.08,3.1,3.3,[.66,.64,.58]);for(let k=0;k<5;k++)pave(5.43,.4+k*.62,-5,.04,.06,3.3,[.48,.46,.42]); // la porte du garage et ses lattes
   pave(10,5.5,4.5,.5,1.8,.5,[.55,.42,.36]);                                           // la cheminée
   // l'auvent et l'îlot des pompes
   pave(-1,4.65,1,8.6,.5,10.5,BLANC);pave(-1,4.95,1,8.7,.12,10.6,ROUGE);for(const pz of [-3.4,5.4])pave(-1,2.2,pz,.38,4.4,.38,BLANC);
   pave(-1,.13,1,1.6,.26,8.2,BETON);
   const pompe=(pz,col)=>{pave(-1,1.15,pz,.85,1.9,.62,col);pave(-1.44,1.35,pz,.03,.55,.4,[.92,.88,.74]);pave(-1,2.15,pz,.6,.12,.5,[.2,.2,.2]);
     const b=P.length/3,gi=new THREE.IcosahedronGeometry(.36,1),p=gi.attributes.position;for(let k=0;k<p.count;k++){const x=(-1+p.getX(k))*ks,y=(2.55+p.getY(k))*ks,z=(pz+p.getZ(k))*ks;P.push(O.x+Ax.x*x+Az.x*z,O.y+y,O.z+Ax.z*x+Az.z*z);C.push(.97,.96,.9);}for(let k=0;k<p.count;k++)I.push(b+k);gi.dispose();
     pave(-1.3,.9,pz+.42,.06,.06,.5,NOIR);};                                         // le tuyau
   pompe(-1.2,ROUGE);pompe(3.4,TURQ);
   for(const f of [[15.6,-4.2],[15.4,-3.2],[16.2,-3.6]])pave(f[0],.45,f[1],.7,.9,.7,ROUILLE); // des fûts rouillés
   pave(15.8,.95,-3.7,.74,.08,.74,[.4,.2,.1]);
   // le grand mât « GAS », visible de loin, au bord du dallage
   pave(-7.5,6,8,.4,12,.4,GRIS);pave(-7.5,12.4,8,4.6,2.6,.36,ROUGE);pave(-7.5,12.4,7.78,4.1,2.1,.1,BLANC);
   texte('GAS',-7.5*sd-larg('GAS')*.42/2*(DR?1:sd)+0,13.45,7.7,.42,ROUGE,.08);ks=1;}
  if(DR){ /* (2026-10-20) LE MOTEL sur son piton (en face de la station), LES CARCASSES de voitures, LES CACTUS, LES PANNEAUX publicitaires — au sol du plateau,
             à côté de la route (jamais dessus : ROAD_HALF + 10 m au moins ; seuls les panneaux montent plus haut que la dalle, à 30 m du bord) */
    const STR=[[.96,.89,.78],[.96,.81,.49],[.95,.67,.55],[.89,.50,.34],[.67,.29,.20],[.96,.81,.49]],ROUX=[[.52,.26,.13],[.44,.30,.22],[.36,.40,.42],[.58,.44,.30],[.30,.42,.52]],VERT=[.30,.48,.24];
    const B9=Math.min(820,(CY.sQ&&CY.sQ.breche0!=null?CY.sQ.breche0:600)+120),bas=(R9,sol,m)=>sol<R9.yr-THICK-m; // (la vallée des Mitaines seulement : au-delà, la route plonge dans la gorge)
    if(DR.motel){const KS=1.5,s9=130+rr()*120,R9=rep(s9,ROAD_HALF+25,DR.panneau?-DR.pc:(rr()<.5?-1:1)),RM=26,cx=5*KS,sol=solMin([[cx,0],[cx+RM,0],[cx-RM,0],[cx,RM],[cx,-RM]]),top=R9.yr-.3;
      O.y=0;{let y=sol-4,k=0;while(y<top-1.2){const h=Math.min(top-1.2-y,5+((k*37)%5)),r0=RM*(1+.05*Math.sin(k*2.3))+(top-y)*.035,r1=RM*(1+.05*Math.sin(k*2.3+1.3))+(top-y-h)*.035;
          const cy9=new THREE.CylinderGeometry(r1,r0,h,9,1,false,k*.5);pave(cx,y+h/2,0,1,1,1,STR[(k+2)%STR.length],0,cy9);cy9.dispose();y+=h;k++;}
        const cap=new THREE.CylinderGeometry(RM+.9,RM+.4,1.4,9,1,false,.2);pave(cx,top-.6,0,1,1,1,[.58,.30,.20],0,cap);cap.dispose();}
      CY.r66m2.push({x:O.x+Ax.x*cx,z:O.z+Ax.z*cx,r:RM+.9,y0:sol-4,y1:top});
      O.y=top;ks=KS;const MUR=[.90,.70,.52],TOIT=rr()<.5?TURQ:[.80,.30,.22];
      pave(5,-1.2,0,22,2.6,30,BETON);pave(11,1.7,0,8,3.4,26,MUR);pave(11,3.6,0,8.8,.45,26.8,TOIT);pave(11,3.95,0,9.4,.25,27.4,[.48,.43,.38]);
      for(let k=0;k<6;k++){const z=-11+k*4.4;pave(6.96,1.15,z,.08,2.3,1.3,k&1?TURQ:[.80,.30,.22]);pave(6.96,1.9,z+1.7,.08,.9,1.3,VITRE);}
      pave(4.6,.12,0,2.2,.24,26,BETON);for(let k=0;k<7;k++)pave(4,1.9,-12.6+k*4.2,.25,3.6,.25,BLANC);pave(4,3.75,0,3.4,.18,27,TOIT); // la galerie couverte
      pave(-4,7,-11,.45,14,.45,GRIS);pave(-4,13.2,-11,7.4,2.8,.4,[.15,.35,.55]);pave(-4,13.2,-11.22,6.9,2.3,.1,[.96,.86,.40]);
      texte('MOTEL',-4*sd-larg('MOTEL')*.32/2,14.0,-11.3,.32,[.80,.18,.14],.08);ks=1;}
    for(let k=0;k<DR.carcasses;k++){const s9=60+rr()*(B9-60),R9=rep(s9,ROAD_HALF+14+rr()*60,rr()<.5?-1:1),sol=solMin([[0,0],[2,2],[-2,-2]]),col=ROUX[(rr()*ROUX.length)|0],ro=rr()*6.28,kr=1.3; // la carcasse
      if(!bas(R9,sol,6))continue;O.y=sol-.3;ks=kr;pave(0,.75,0,2.1,.9,4.6,col,ro);pave(Math.sin(ro)*.3,1.55,Math.cos(ro)*-.3,1.9,.75,2.3,[col[0]*.8,col[1]*.8,col[2]*.8],ro);
      for(const w of [[-1,1.5],[1,1.5],[-1,-1.5],[1,-1.5]]){const wx=w[0]*Math.cos(ro)-w[1]*Math.sin(ro),wz=w[0]*Math.sin(ro)+w[1]*Math.cos(ro);if(rr()<.75)pave(wx,.35,wz,.35,.7,.7,NOIR,ro);}ks=1;}
    for(let k=0;k<DR.cactus;k++){const s9=40+rr()*(B9-40),R9=rep(s9,ROAD_HALF+10+rr()*rr()*150,rr()<.5?-1:1),sol=solMin([[0,0]]),h=6+rr()*7,ro=rr()*6.28; // le saguaro
      if(!bas(R9,sol+h,2))continue;O.y=sol-.3;pave(0,h/2,0,.9,h,.9,VERT,ro);pave(0,h+.15,0,.6,.3,.6,VERT,ro);
      for(const sx of [-1,1]){if(rr()<.3)continue;const ya=h*(.35+rr()*.25),ha=h*(.25+rr()*.2),ex=sx*1.6;const wx=ex*Math.cos(ro),wz=ex*Math.sin(ro);
        pave(wx*.5,ya,wz*.5,1.6,.65,.65,VERT,ro);pave(wx,ya+ha/2,wz,.65,ha,.65,VERT,ro);}}
    for(let k=0;k<DR.pubs;k++){const s9=110+rr()*(B9-110),R9=rep(s9,ROAD_HALF+30+rr()*30,rr()<.5?-1:1),sol=solMin([[0,0],[3,0],[-3,0]]),mot=['EAT','MOTEL','GAS','DINER'][(rr()*4)|0],
        hb=R9.yr+8,cel=.9,W=larg(mot)*cel+3,fond=rr()<.5?[.95,.82,.30]:[.88,.30,.22];O.y=0;if(!bas(R9,sol,6))continue;
      for(const px of [-W*.35,W*.35])pave(px,(sol+hb)/2,0,.5,hb-sol,.5,GRIS);pave(0,hb+2.6,0,W,5.2,.4,fond);pave(0,hb+2.6,-.25,W-.6,4.6,.1,BLANC);
      texte(mot,-larg(mot)*cel/2,hb+2.6+2.5*cel,-.36,cel,fond===BLANC?NOIR:[.10,.10,.12],.1);}}
  g0.dispose();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();return g;}
function cyMonuments(seed){
  if(CY.grp){for(const o of CY.grp.children.slice()){CY.grp.remove(o);if(o.geometry&&o.userData.jeter)o.geometry.dispose();}}
  const M9=cyMonuMats();CY.grp.visible=true;
  try{cyCouloir();}catch(e){console.warn('canyon : couloir',e);} // les parois du COULOIR et la galerie du TUNNEL d'arrivée
  if(CY.arche){const m=new THREE.Mesh(cyArcheGeo(CY.arche),M9.a);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);}
  const D9=CY.deco;
  {const S=CY.S,N9=Math.round(PAL.b('cyArbres',700)*(D9?D9.arbres.k:1)),rg=mulberry32((seed^0x7A33)>>>0),L9=[]; // (2026-10-20) × la ripisylve tirée
   if(S)for(let k=0;k<N9*6&&L9.length<N9;k++){const i=Math.floor(rg()*(S.n-1));if(S.zS[i]>.5)continue;const sg=rg()<.5?-1:1,lat=S.wR[i]+3+rg()*26,tx=S.tx[i],tz=S.tz[i],x=S.x[i]-tz*sg*lat,z=S.z[i]+tx*sg*lat,o9={};
     const h=cyHauteur(x,z,o9);if(o9.eau||o9.rk>.3||h>S.F[i]+6||TUN2_ON&&i*S.ds>L-CY_TUN2.ev0-80)continue;const ht=(9+rg()*13)*(1+.4*rg());if(h+ht>S.y[i]-THICK-4)continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}
   const gA=D9&&D9.arbres.nm!=='vert'?(CY_ARB.g[D9.arbres.nm]||(CY_ARB.g[D9.arbres.nm]=cyArbreGeo(CY_ARB[D9.arbres.nm]))):(CY.gArb||(CY.gArb=cyArbreGeo())); // les peupliers : verts, dorés d'automne, sombres
   if(L9.length){const im=new THREE.InstancedMesh(gA,M9.t,L9.length),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0);
     L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(new THREE.Vector3(a[0],a[1],a[2]),q9,new THREE.Vector3(a[3]*.9,a[3],a[3]*.9));im.setMatrixAt(k,mt);});
     im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;CY.grp.add(im);mobgCoupe(im,CY.grp);}CY.nArb=L9.length;}
  if(CY.chem.length){if(!CY.gChem)CY.gChem=[cyChemGeo(0),cyChemGeo(1)];const mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),s9=new THREE.Vector3(),p9=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0);
    for(let v=0;v<2;v++){const L9=CY.chem.filter(c=>c.v===v);if(!L9.length)continue;const im=new THREE.InstancedMesh(CY.gChem[v],M9.i,L9.length);
      L9.forEach(function(c,k){q9.setFromAxisAngle(ax,c.a);s9.set(c.r/.5,c.h,c.r/.5);p9.set(c.x,c.y,c.z);mt.compose(p9,q9,s9);im.setMatrixAt(k,mt);});
      im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;CY.grp.add(im);mobgCoupe(im,CY.grp);}}
  CY.r66=0;CY.r66m=null;CY.r66m2=[];try{const g9=cyRoute66();if(g9){const m=new THREE.InstancedMesh(g9,M9.t,1);m.setMatrixAt(0,new THREE.Matrix4());m.instanceMatrix.needsUpdate=true;m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.frustumCulled=false;m.name='canyon route 66';CY.grp.add(m);CY.r66=g9.attributes.position.count;}}catch(e){console.warn('canyon : route 66',e);} /* une INSTANCE : le même programme que les arbres (canyonChauffe le compile au menu) — un Mesh simple en compilait un neuf en course */ // (2026-10-15 soir) la station-service et le panneau ROUTE 66 du départ
  CY.rais=null; // (14/10 soir) les RAIS DE LUMIÈRE retirés : sur la paroi ils se lisaient comme des traînées de ciel étalé (verdict de Sacha)
  CY.decoN=null;if(D9){try{cyEboulis(D9,M9);}catch(e){console.warn('canyon : éboulis',e);}}
  CY_VAU.n=D9?D9.vautours:5; // (2026-10-20) 2 à 9 vautours (5 avant)
  CY.grp.updateMatrixWorld(true);
  CY.monu=!!(CY.arche||CY.chem.length||CY.r66m2&&CY.r66m2.length);
}
/* (2026-10-20, LE DÉSERT AU HASARD) LE CUISEUR : des pièces à l'unité (positions, couleurs de sommet ; indexées ou non) posées par une matrice et une teinte,
   CUITES en UNE géométrie aux coordonnées du monde — dessinée en une instance par la matière des décors (canyon : M9.t ; dunes : leur M9.t) : aucun programme
   neuf, un appel de dessin. Rien d'alloué par sommet (un vecteur). */
function decoCuiseur(){const P=[],C=[],v=new THREE.Vector3();
  return {ajoute:function(g,mt,te){const p=g.attributes.position,c=g.attributes.color,ix=g.index,n=ix?ix.count:p.count,r=te?te[0]:1,gg=te?te[1]:1,b=te?te[2]:1;
      for(let k=0;k<n;k++){const j=ix?ix.getX(k):k;v.fromBufferAttribute(p,j).applyMatrix4(mt);P.push(v.x,v.y,v.z);if(c)C.push(c.getX(j)*r,c.getY(j)*gg,c.getZ(j)*b);else C.push(r,gg,b);}},
    n:function(){return P.length/3;},
    fin:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g;}};}
const CY_ARB={automne:[[.86,.66,.16],[.78,.54,.12],[.94,.76,.26]],sombre:[[.22,.40,.14],[.18,.34,.10],[.27,.45,.16]],g:{}}; // (2026-10-20) les houppiers des peupliers tirés
/* LES ÉBOULIS (2026-10-20) : des blocs tombés des parois, sur le fond de la gorge (et dans le lit quand la rivière est à sec), dans les couleurs des strates
   de leur hauteur — jamais à moins de 4 m sous la dalle ; cuits en une géométrie */
function cyEboulis(D,M9){const S=CY.S,t9=performance.now();if(!S||!D.eboulis)return;
  const rg=mulberry32((D.sd^0xEB0E1)>>>0),o9={},c9=[0,0,0],CU=decoCuiseur(),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(),v9=new THREE.Vector3(),s9=new THREE.Vector3(),K=Math.sqrt(lvPiste());
  if(!CY.gBloc)CY.gBloc=new THREE.IcosahedronGeometry(1,0);let n=0;
  for(let k=0;k<D.eboulis*4&&n<D.eboulis;k++){const i=1+Math.floor(rg()*(S.n-2));if(S.zS[i]>.5||TUN2_ON&&i*S.ds>L-CY_TUN2.ev0-80)continue;
    const sg=rg()<.5?-1:1,l0=D.eau>0?S.wR[i]+1:2,lat=l0+rg()*Math.max(4,S.wF[i]-l0),x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=cyHauteur(x,z,o9),sz=(2+rg()*rg()*9)*Math.sqrt(K);
    if(o9.eau||o9.rk>.5||h+sz>S.y[i]-THICK-4)continue;cyT2Strate(h+rg()*40,c9);const f=.78+rg()*.2;
    e9.set(rg()*3,rg()*6.28,rg()*3);q9.setFromEuler(e9);mt.compose(v9.set(x,h-sz*.3,z),q9,s9.set(sz,sz*(.6+rg()*.3),sz*(.8+rg()*.4)));CU.ajoute(CY.gBloc,mt,[c9[0]*f,c9[1]*f,c9[2]*f]);n++;}
  if(CU.n()){const g=CU.fin(),im=new THREE.InstancedMesh(g,M9.t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;
    im.userData.jeter=1;im.name='canyon éboulis';CY.grp.add(im);}
  CY.decoN={blocs:n,sommets:CU.n(),ms:Math.round(performance.now()-t9)};}
const CY_VAU={n:5,im:null,L:[],m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),sc:new THREE.Vector3()};
function cyVautourGeo(){const P=[],C=[],t=(a,b,c,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let k=0;k<3;k++)C.push(col[0],col[1],col[2]);};
  const nr=[.10,.08,.07],br=[.18,.14,.11],pl=[.30,.24,.20],ro=[.55,.24,.20];
  t([0,0,1.1],[-.18,0,-.2],[.18,0,-.2],nr);t([0,.12,.5],[-.16,0,-.1],[.16,0,-.1],br);t([0,0,-.2],[-.2,0,-.85],[.2,0,-.85],nr); // le corps, la queue
  t([0,.02,1.1],[-.05,.04,1.35],[.05,.04,1.35],ro); // la tête nue
  for(const sd of [-1,1]){const W=[[sd*.15,0,.35],[sd*1.6,.30,.45],[sd*2.9,.62,.10],[sd*3.2,.66,-.20],[sd*1.6,.30,-.35],[sd*.15,0,-.25]];
    t(W[0],W[1],W[5],nr);t(W[1],W[4],W[5],br);t(W[1],W[2],W[4],nr);t(W[2],W[3],W[4],pl); // l'aile, les rémiges écartées au bout
    for(let k=0;k<4;k++){const z=.05-k*.08;t([sd*2.9,.62,z],[sd*3.5,.70,z+.02],[sd*3.45,.68,z-.06],nr);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;}
function cyVautours(dt){const V=CY_VAU,on=CY.on&&started&&!gameOver&&mode!=='boom';
  if(!V.im){if(!on)return;V.im=new THREE.InstancedMesh(cyVautourGeo(),cyMonuMats().t,9); /* (2026-10-20) la place de 9 : le tirage en pose de 2 à 9 (count = V.n) */V.im.frustumCulled=false;V.im.matrixAutoUpdate=false;V.im.count=0;scene.add(V.im);}
  V.im.visible=on;if(!on){V.L.length=0;return;}
  const S=CY.S,cp=carGroup.position,i0=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));
  for(let k=0;k<V.n;k++){let b=V.L[k];
    if(!b||cp.distanceTo(V.v.set(b.cx,b.cy,b.cz))>2200){const i=Math.min(S.n-1,i0+Math.round((350+Math.random()*900)/S.ds)),lat=(Math.random()-.5)*S.wF[i]*1.6;
      b=V.L[k]={cx:S.x[i]-S.tz[i]*lat,cz:S.z[i]+S.tx[i]*lat,cy:Math.min(S.R[i]-40,S.y[i]+120+Math.random()*260),r:55+Math.random()*80,a:Math.random()*6.28,w:(.16+Math.random()*.12)*(Math.random()<.5?-1:1),k:6+Math.random()*3};}
    if(!paused)b.a+=b.w*dt;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=b.cy+Math.sin(b.a*2.3)*6;
    V.e.set(Math.sin(b.a*1.7)*.05,b.w>0?-b.a:Math.PI-b.a,b.w>0?.32:-.32);V.q.setFromEuler(V.e);V.m4.compose(V.v.set(x,y,z),V.q,V.sc.set(b.k,b.k,b.k));V.im.setMatrixAt(k,V.m4);}
  V.im.count=V.n;V.im.instanceMatrix.needsUpdate=true;}
function cyMonuHeurt(p){
  const A=CY.arche;if(A){const dx=p.x-A.cx,dz=p.z-A.cz,u=dx*A.px+dz*A.pz,al=dx*A.tx+dz*A.tz;
    if(Math.abs(al)<A.W*1.6&&Math.abs(u)<A.Ua){const P=A.P,f=(u+A.Ua)/(2*A.Ua)*(P.length-1),k=Math.max(0,Math.min(P.length-2,Math.floor(f))),w=f-k,yc=P[k].y+(P[k+1].y-P[k].y)*w,e=Math.abs(u/A.Ua),ab=1+1.4*e*e*e;
      if(Math.abs(al)<A.W*.5*ab+1&&Math.abs(p.y-yc)<A.T*.5*ab+1)return true;}}
  for(const c of CY.chem){const dx=p.x-c.x,dz=p.z-c.z;if(dx*dx+dz*dz<(c.r*1.1+1.2)*(c.r*1.1+1.2)&&p.y>c.y&&p.y<c.y+c.h+1)return true;}
  {const M=CY.r66m;if(M){const dx=p.x-M.x,dz=p.z-M.z;if(dx*dx+dz*dz<(M.r+1.2)*(M.r+1.2)&&p.y>M.y0&&p.y<M.y1+.6)return true;}} // (2026-10-15 soir) la mesa de la station-service : du grès, comme le reste
  for(const M of CY.r66m2||[]){const dx=p.x-M.x,dz=p.z-M.z;if(dx*dx+dz*dz<(M.r+1.2)*(M.r+1.2)&&p.y>M.y0&&p.y<M.y1+.6)return true;} // (2026-10-20) celle du motel
  return false;}
function canyonChauffe(){ // au menu (chauffeDivers) : la matière du relief compilée et dessinée une fois hors écran — 0 programme en course
  if(!CANYON_OK)return;cyTerrain();const m=CY.mesh,v=m.visible,n=CY.geo.instanceCount;CY.geo.instanceCount=1;CY.aN.array[2]=64;m.visible=true;
  /* (2026-10-18, PASSE PERF, Léo : « optimisation des performances ») + les deux matières DOUBLE FACE des pièces du canyon (`.b` le grès, `.g` la roche
     à couleurs ; mesas, voûtes, tunnels) : MESURÉ, à chaque 1re visite du canyon leurs 2 programmes naissaient EN COURSE (banc ×4, dbgProgs) —
     `.g` sur une géométrie qui porte des COULEURS (celle des arbres) : sans attribut `color`, la clé du programme diffère d'un détail (vertexAlphas) */
  const M9=cyMonuMats(),g9=new THREE.Group(),bx9=new THREE.BoxGeometry(1,1,1);g9.add(new THREE.Mesh(bx9,M9.a));g9.add(new THREE.Mesh(bx9,M9.b));g9.add(new THREE.Mesh(bx9,CY_RAI_M));{const a9=cyArbreGeo(),i9=new THREE.InstancedMesh(a9,M9.t,1);i9.setMatrixAt(0,new THREE.Matrix4());g9.add(i9);g9.add(new THREE.Mesh(a9,M9.g));if(TUN2_ON){const T9=cyT2Mats();g9.add(new THREE.Mesh(a9,T9.m));g9.add(new THREE.Mesh(bx9,T9.o));}} /* (2026-10-19) + LE TUNNEL DE GRÈS : la roche cuite sans brume et l'or des anneaux */const im9=new THREE.InstancedMesh(bx9,M9.i,1);im9.setMatrixAt(0,new THREE.Matrix4());g9.add(im9);g9.traverse(function(o){o.frustumCulled=false;});scene.add(g9);
  const P9=cyPousPoints(),pv9=P9.visible;P9.visible=true; /* (2026-10-21) + la poussière dorée : son programme compilé au menu, lui aussi */
  try{chauffeRendu([m,g9,P9]);}finally{m.visible=v;P9.visible=pv9;CY.geo.instanceCount=n;scene.remove(g9);bx9.dispose();}
  try{const C=skyDome.userData.ciel;if(C.cy){const sc=new THREE.Scene(),me=new THREE.Mesh(skyDome.geometry,C.cy),t=cielCible(8,8,true),cib=renderer.getRenderTarget();me.frustumCulled=false;sc.add(me);renderer.setRenderTarget(t);renderer.render(sc,camera);renderer.setRenderTarget(cib);t.dispose();}}catch(e){console.warn('canyonChauffe ciel',e);}}
window.dbgCanyon=function(k,a,b,c){
  if(k==='test'){if(!CY.on)return 'pas de canyon';let dessus=0,dessous=0,pire=1e9,ou=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,h=cyHauteur(x,z);
      if(h>y-THICK-1.5){dessous++;if(ou.length<40)ou.push('D'+s9+(lt?(lt>0?'d':'g'):'c')+'('+(y-THICK-h).toFixed(1)+')');}if(h>y+1.5){dessus++;if(ou.length<40)ou.push(s9+(lt?(lt>0?'d':'g'):'c'));}pire=Math.min(pire,y-THICK-h);}}
    return {dessus:dessus,dessous:dessous,margeMin:+pire.toFixed(1),sep:CY.sep,ou:ou.join(' ')};}
  if(k==='parois'){if(!CY.on)return 'pas de canyon';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},G9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},D=[]; // (2026-10-15) à hauteur de dalle : à combien du BORD la roche monte (tous les 40 m, deux côtés) · la GARDE : la roche la plus haute entre zone de saut et sortie, au-dessus de la droite qui les relie
    for(let s9=200;s9<L-500;s9+=40){frameAt(s9,F9);for(const sg of [-1,1]){let d=999;for(let e=0;e<=120;e+=2){const lt=sg*(ROAD_HALF+e);if(cyHauteur(F9.p.x+F9.b.x*lt,F9.p.z+F9.b.z*lt)>F9.p.y){d=e;break;}}D.push(d);}}
    D.sort((a,b)=>a-b);const q=f=>D[Math.floor(f*(D.length-1))];
    const gar=(CY.rac||[]).map(o=>{let pire=-1e9;for(let s9=o.haut[0];s9<=o.haut[1];s9+=20){frameAt(s9,F9);let bd=1e18,bx=0,by=0,bz=0;for(let s2=o.bas[0];s2<=o.bas[1];s2+=8){frameAt(s2,G9);const d=(G9.p.x-F9.p.x)**2+(G9.p.z-F9.p.z)**2;if(d<bd){bd=d;bx=G9.p.x;by=G9.p.y;bz=G9.p.z;}}
      for(let u=.15;u<=.86;u+=.1){const x=F9.p.x+(bx-F9.p.x)*u,z=F9.p.z+(bz-F9.p.z)*u;pire=Math.max(pire,cyHauteur(x,z)-(F9.p.y+(by-F9.p.y)*u));}}return o.nm+':'+Math.round(pire);});
    return {bord:{p10:q(.1),med:q(.5),p90:q(.9),libres:D.filter(d=>d===999).length+'/'+D.length},garde:gar.join(' '),mine:CY.mineT?{de:Math.round(CY.mine[0]),a:Math.round(CY.mine[1])}:null,L:Math.round(L)};}
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='frag'){if(!CY.mat)return 'pas de matière';if(typeof a==='string'){CY.mat.fragmentShader=a;CY.mat.needsUpdate=true;}return CY.mat.fragmentShader;} /* (banc) la matière du relief relue / remplacée à chaud */
  if(k==='raccourcis')return CY.rac||[];
  if(k==='vue'||k==='vueA'){if(!CY.on)return 'pas de canyon';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9); /* 'vueA' : à l'abscisse a de la piste (sinon a mètres devant la caisse) */const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(a!=null&&arguments[4]!=null?arguments[4]:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:CY.n};}
  return {on:CY.on,r66:CY.r66|0,ms:CY.ms,noeuds:CY.n,sep:CY.sep,hz:CY.hz||null,deco:CY.deco?Object.assign({},CY.deco,{pose:CY.decoN,mine:Object.assign({},CY.deco.mine,{posee:!!CY.mineT}),mitaines:(CY.mit||[]).length,cheminees:(CY.chem||[]).length,nArbres:CY.nArb|0}):null,F:CY.F?[CY.F.nx,CY.F.nz,CY.F.ts]:null,Z:CY.Z?[CY.Z.nx,CY.Z.nz,CY.Z.ts]:null,O:CY.O?[CY.O.nx,CY.O.nz,CY.O.ts]:null,
    ciel:CIEL2.mode,attente:!!CY.attente,sQ:CY.sQ,L:Math.round(L),buttes:CY.buttes?CY.buttes.length:0,soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+CY.ombre.toFixed(2),prof:+CY.prof.toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    carHaut:CY.on?+(carGroup.position.y-cyHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
