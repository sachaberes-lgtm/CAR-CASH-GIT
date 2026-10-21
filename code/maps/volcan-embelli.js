/* ===== LE ROYAUME DE FEU EMBELLI : LES CRÊTES DU LOIN (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments,
   améliorer des textures, améliorer les lumières ») =====
   PILIER 1, LA PROFONDEUR EN TROIS PLANS. Avant : la route et le ciel, deux volcans minuscules, et entre les deux une bande rose plate (la mer de lave).
   Maintenant, tout autour de la plaine, à 2,3-3,3 km de la route : une COURONNE DE CRÊTES de basalte (un anneau de pitons qui sortent de la mer),
   fondue dans la brume teintée de la météo (le plan lointain est plus clair et plus froid, le proche plus chaud) ; de leurs arêtes, des coulées
   luisent (la même chaleur `aS.y` que les volcans du loin) et percent la brume : la nuit, des filets de feu à l'horizon.
   COÛT : UN maillage fusionné (1 appel de dessin), la matière de la roche DÉJÀ compilée (`M.sol` : 0 programme de plus), aucune texture, aucune lumière ;
   le nombre de pièces passe par PAL (ANCIEN 14 · MOYEN 26 · RÉCENT 40). ⚠ Le hasard : un flux À LUI (`mulberry32(seed^0xC4E7E5)`) — ni `fr` (la
   file des aiguilles, des orgues, des geysers en dépend) ni le `rnd` de la route : la piste et les décors d'avant restent identiques au bit près. */
try{Object.assign(PAL.B,{volcanCretes:[14,26,40]});}catch(e){}
function vlcCretes(root,seed){
  const S=VOLCAN.sol,M=VOLCAN.mats;if(!S||!M||!(NP>1))return;
  const NPC=PAL_B9('volcanCretes',40),R=mulberry32((seed^0xC4E7E5)>>>0),yS=VOLCAN.ySea,K=VOLCAN.K,C=VOLCAN.C,K2=VOLCAN.K2,C2=VOLCAN.C2;
  let cx=0,cz=0,n9=0;for(let i=0;i<NP;i+=24){cx+=pts[i].x;cz+=pts[i].z;n9++;}cx/=n9;cz/=n9;
  const PR=[];for(let i=0;i<NP;i+=24)PR.push(pts[i].x,pts[i].z);
  const dRoute=(x,z)=>{let b=1e18;for(let j=0;j<PR.length;j+=2){const d=(PR[j]-x)*(PR[j]-x)+(PR[j+1]-z)*(PR[j+1]-z);if(d<b)b=d;}return Math.sqrt(b);};
  const NC=18,P=[],A=[],I=[];let nv=0;
  for(let k=0;k<NPC;k++){
    const th=(k+R()*.7)/NPC*6.2832,dx=Math.sin(th),dz=Math.cos(th),dmin=2300+R()*500,h0=150+R()*330,notch=R(),ph9=R()*6.28,tl=R(); /* (les six premiers tirages sont faits À CHAQUE tour, pièce écartée ou non) */
    let r=500;while(r<16000&&dRoute(cx+dx*r,cz+dz*r)<dmin)r+=140;
    const x0=cx+dx*r,z0=cz+dz*r;
    if(r>=16000)continue;
    if(C&&K&&Math.hypot(x0-C.x,z0-C.z)<K.Rb+300)continue;
    if(C2&&K2&&Math.hypot(x0-C2.x,z0-C2.z)<K2.Rb+300)continue;
    let pres=false;for(const l of VOLCAN.loin||[])if(Math.hypot(x0-l.c.x,z0-l.c.z)<1400){pres=true;break;}if(pres)continue;
    const dc=dRoute(x0,z0),W=Math.max(800,Math.min(2600,6.2832*r/NPC*1.3)),ux=dz,uz=-dx; /* la pièce suit l'anneau : sa tangente (ux,uz), sa face vers la route = -(dx,dz) */
    const col=[];
    for(let j=0;j<=NC;j++){const t=j/NC,xu=(t-.5)*W,wx=x0+ux*xu,wz=z0+uz*xu,env=Math.pow(Math.sin(Math.PI*t),.55),
        nz=vlcB(wx/230,wz/230,VOLCAN.graine+41,3),h=h0*env*(.38+.95*Math.pow(nz,1.5))*((j%5===2&&notch<.5)?.62:1),lava=R()<.2?.62+.33*R():0;
      col.push({wx:wx,wz:wz,h:Math.max(6,h),T:Math.max(300,Math.min(h*1.7,dc-1500)),lava:lava*env*(tl<.7?1:.4),j9:R()});}
    const base=nv;
    for(let j=0;j<=NC;j++){const c=col[j],yc=yS+c.h,vx=-dx,vz=-dz; /* (vx,vz) : vers la route */
      const row=[[c.T,yS-10,0],[c.T*.46,yS+c.h*(.40+.12*c.j9),c.lava*.9],[0,yc,c.lava],[-c.T*1.1,yS-10,0]];
      for(const q of row){P.push(c.wx+vx*q[0],q[1],c.wz+vz*q[0]);A.push(5000,q[2],q[1]-yS,2);nv++;}}
    for(let j=0;j<NC;j++)for(let q=0;q<3;q++){const a=base+j*4+q,b=a+4,c9=a+1,d9=a+5; /* a,b : colonnes j, j+1 ; c9,d9 : la rangée du dessus */
      for(const T9 of [[a,b,c9],[c9,b,d9]]){const A9=T9[0]*3,B9=T9[1]*3,C9=T9[2]*3,ux9=P[B9]-P[A9],uy9=P[B9+1]-P[A9+1],uz9=P[B9+2]-P[A9+2],vx9=P[C9]-P[A9],vy9=P[C9+1]-P[A9+1],vz9=P[C9+2]-P[A9+2];
        const ny=uz9*vx9-ux9*vz9;if(ny<0)I.push(T9[0],T9[2],T9[1]);else I.push(T9[0],T9[1],T9[2]);}}}
  if(!I.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));g.setIndex(I);g.computeVertexNormals();
  const m=new THREE.Mesh(g,M.sol);m.name='volcan crêtes du loin';m.frustumCulled=false;m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);
  VOLCAN.n.cretes=I.length/3;}
/* <<<FIN VOLCAN>>> */
