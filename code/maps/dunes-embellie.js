/* ===== LES DUNES, LE PLAN MOYEN (2026-10-21, Sacha : « amélioration visuelle des maps — ajouter des éléments, chaque map un peu plus belle ») ; ARRAKIS (2026-11-05, Sacha : « on enlève toutes les références à l'Égypte ») =====
   Ce que la mer de dunes n'avait pas : un étage MOYEN. Entre les monolithes de la route et la ligne d'horizon, rien ne dépassait du sable — donc aucune échelle, aucune profondeur.
   · LES BUTTES (des massifs de grès sombres aux strates rose-brun, comme les falaises d'Arrakis) : 7 à 28 de 14 à 70 m, à 250 m-2 km de la route — des silhouettes que la brume teinte
     (l'étage lointain, plus clair et plus froid) ; une seule géométrie, étirée en tour ou en mesa par l'échelle de l'instance.
   (Plus d'arbres morts ni de touffes d'herbe : le désert est nu.) Même matière, mêmes ombres, mêmes programmes que les décors (DN_MVS / DN_AFS : aucun programme de plus), un appel de dessin.
   Tout naît dans le temps de construction (dnMonuments), dans un générateur LOCAL (`mulberry32` du tracé lui-même : aucun tirage dans le hasard de la piste, ni dans celui des décors) ; rien n'est posé près d'une dalle ni dans le couloir. */
function dnGeos2(){if(DN.geos2)return DN.geos2;const G9={};
  {const g=dnGeo(),n=8,hh=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v);}, /* l'irrégularité des facettes : un hasard FIXE (pas de tirage) */
     R=[[0,1.06],[.30,.90],[.32,.99],[.55,.86],[.57,.94],[.80,.80],[1,.68]],  /* [hauteur, rayon] des anneaux : des strates qui avancent et reculent (des corniches) */
     C=[[.46,.22,.20],[.54,.27,.21],[.62,.31,.23],[.70,.37,.26],[.78,.45,.30],[.86,.58,.36]]; /* terre cuite sombre au pied → grès chaud et clair au sommet (l'or du couchant y accroche) */
    const P=(k,j)=>{const a=k/n*6.2832+.4*(j%2),r=R[j][1]*(.90+.20*hh(k,j));return [Math.cos(a)*r,R[j][0]*(.97+.06*hh(k+7,j)),Math.sin(a)*r];};
    for(let j=0;j<R.length-1;j++)for(let k=0;k<n;k++)g.quad(P(k,j),P(k,j+1),P(k+1,j+1),P(k+1,j),C[j]);
    for(let k=0;k<n;k++)g.tri(P(k,R.length-1),[0,1.02,0],P(k+1,R.length-1),[.90,.70,.44]);G9.butte=g.fin();}              /* LA BUTTE (h = 1, rayon = 1) */
  DN.geos2=G9;return G9;}
function dnEmbellir(){
  const S=DN.S;if(!S||!DN.grp||!DN.Z)return;
  const M9=dnMats(),G=dnGeos2(),K=Math.sqrt(lvPiste()),L9=(S.n-1)*S.ds,RH=ROAD_HALF,o9={},o1={},o2={},
    mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0),v9=new THREE.Vector3(),s9=new THREE.Vector3();
  let h9=0x9E3779B1;for(const i of [S.n>>2,S.n>>1,(S.n*3)>>2]){h9=Math.imul(h9^Math.round(S.x[i]*8),0x85EBCA6B);h9=Math.imul(h9^Math.round(S.z[i]*8),0xC2B2AE35);}
  const r=mulberry32((h9>>>0)^0x3E5B1A); /* le hasard de l'embellissement : né du TRACÉ (trois points de la route), jamais du hasard de la piste */
  const inst=(geo,L,nom)=>{if(!L.length)return null;const im=new THREE.InstancedMesh(geo,M9.t,L.length);
    L.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  const dmin=(x,z)=>{let b=1e18;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z,d=dx*dx+dz*dz;if(d<b)b=d;}return Math.sqrt(b);}; /* la distance à la route la plus proche (toutes les dalles, à toute hauteur) */
  const pente=(x,z,h)=>Math.hypot(dnHauteur(x+3,z,o1)-h,dnHauteur(x,z+3,o2)-h)/3;
  const oa=DN.oa;
  /* les BUTTES : loin, grandes, sombres */
  const Lb=[],Nb=DN_BATI?PAL.b('dnTors',28):0; /* (2026-11-08) plus de buttes strates rose-brun au plan moyen : elles faisaient des pyramides */
  for(let k=0;k<Nb*14&&Lb.length<Nb;k++){const i=Math.min(S.n-1,Math.round(r()*L9/S.ds)),sg=r()<.5?-1:1,lat=RH+(250+r()*r()*1750)*K,tour=r()<.35,
      rr=(tour?9+r()*13:34+r()*86)*Math.sqrt(K),hh=tour?26+r()*44:14+r()*26,a=r()*6.28,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat;
    if(dmin(x,z)<RH+rr+170)continue;if(oa&&Math.hypot(x-oa.x,z-oa.z)<oa.r*2.6+rr)continue;if(DN.pyr&&Math.hypot(x-DN.pyr.x,z-DN.pyr.z)<DN.pyr.hw*2.2+rr)continue;
    const h=dnHauteur(x,z,o9);if(o9.eau)continue;Lb.push([x,h-hh*.12,z,rr,a,hh,rr]);}
  inst(G.butte,Lb,'buttes');
  DN.emb={buttes:Lb.length};}
