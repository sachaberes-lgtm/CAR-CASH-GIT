/* LE DAUPHIN — sorti d'index.html le 2026-10-15 (Léo : « enlève les dauphins et les singes ; avec les figures ça n'a plus sa place, ça prend trop de place
   dans le jeu ») — puis REVENU le jour même, par map (Léo : « les dauphins jouent, viennent dire coucou à la voiture dans l'eau du SOLEIL DE JADE ») :
   le JEU charge ce fichier pour mkDauphin et le banc (index.html : « LES DAUPHINS DE LA MER DE JADE ») ; ⚠ un nom global d'ici ne doit pas exister dans index.html.
   Le modèle du grand dauphin en VITRAIL (profil, cubes, peau, cœur, nage) et ses chorés ; la boîte à dauphins l'exécute à part (avec ses dolphins, dolTrail, dolSplash). Il a besoin de THREE. */
/* ============================================================================
   CRÉATURES DE FIGURE — UN BANC DE 3 DAUPHINS (LE DAUPHIN) + 1 SERPENT (SNAKE LOOP)
   Procédurales, oniriques. Montées UNE fois, cachées, animées seulement pendant
   leur figure (aucune allocation par figure → rien à disposer au rebuild).
   Chaque créature vit dans un « rig » calé sur la caisse (repère route : x=latéral,
   y=haut, z=avant), donc elle suit la piste sans recalcul de matrices lourd.
   ========================================================================== */
/* ---- LE DAUPHIN DE LÉO (2026-09-26, user : « l'animation du dauphin n'est pas la vraie qui était dans la version de Léo, et on ne la
   voit pas assez ») ----
   Le jeu n'avait gardé que le CORPS de la recette : un tube sans nageoires, deux bêtes qui se croisaient en ciseaux. La vraie animation
   vit dans `version-leolei-2026/dauphins.html` : un BANC de 3 dauphins à nageoires (dorsale, deux pectorales, caudale à deux lobes sur
   un pivot qui BAT), qui bondissent en arc l'un après l'autre, JAILLISSENT et REPLONGENT dans une gerbe d'eau, et laissent un sillage
   d'étincelles. On la porte ici telle quelle — mêmes profils, mêmes contours d'ailerons, mêmes tempos, mêmes couleurs — dans le repère
   du VOL (sans la vrille de la caisse), DEVANT elle, face caméra.
   LISIBILITÉ : la mise à l'échelle se RECALCULE sur la vraie caméra (distance, champ, orientation du téléphone) — le banc traverse
   l'écran (`W`, 80 % de la demi-largeur : on VOIT les gerbes) et chaque dauphin mesure ~un tiers de la plus PETITE dimension (`kS`) : sur téléphone en
   portrait, on ne voit plus trois têtes d'épingle.
   Les gerbes et le sillage vivent DANS le repère du banc (`dolPod`) : ils suivent la caisse lancée à 400 km/h au lieu de rester
   plantés dans le ciel derrière elle. */
/* ---- LES DAUPHINS, NOUVEAU DESIGN (2026-09-29, Sacha : « améliore le design des dauphins ») ----
   Le dauphin porté de Léo était un tube cyan pâle sous un halo additif laiteux, nageoires en PLAQUES extrudées : sur le ciel de jour il
   se fondait dans le bleu, de nuit il bavait. Il est refait en LOW-POLY NÉON, dans la DA des caisses à facettes :
   · UNE géométrie par dauphin (corps, dorsale, pectorales, caudale et yeux FUSIONNÉS : 1 appel de dessin au lieu de 8, ~790 triangles au
     lieu de ~4 200), facettes à plat et UNE couleur par facette — la robe se lit comme un logo : dos indigo, CAPE qui plonge en V sous la
     dorsale (le dessin du dauphin commun), flanc avant ROSE Vice City, flanc arrière CYAN, ventre nacré,
     nageoires qui virent au néon à la pointe ; le néon, c'est une couleur « trop pleine » (> 1) que le shader allume ;
   · il NAGE : l'ondulation dos-ventre du corps entier (la tête reste droite, le pédoncule pompe, la caudale suit la pente de la vague)
     et la cambrure qui épouse l'arc du bond vivent dans le vertex shader — zéro coût CPU, la géométrie reste partagée ;
   · il SORT DE L'EAU : la « surface » de la gerbe le coupe au pixel, avec une ligne d'écume lumineuse là où il la traverse — il ne
     gonfle plus depuis un point au milieu de la gerbe ;
   · un liseré néon (rose par-dessus, cyan par-dessous) dessine sa silhouette sur tous les ciels, jour comme nuit ;
   · un bond sur trois, une VRILLE sur son axe (le dauphin à long bec qui tourne sur lui-même).
   PERF : une matière par dauphin (6 clones, UN SEUL programme `dauphin2` : ils ne diffèrent que par leurs uniforms ; tout est en scène
   dès l'init, compilé au menu avec le reste), géométrie bâtie une fois, aucune lumière, aucune allocation par image. Les gerbes passent
   aux particules v2 (programme `pt2`, déjà compilé pour la fumée) : chaque goutte naît, vit et s'éteint en fondu, à sa propre taille. */
/* ---- LE DAUPHIN DE RÊVE (2026-10-09, Léo, dans la BOÎTE À DAUPHINS, une image de grand dauphin pastel à l'appui : « travaille encore
   plus dur ») ----
   Le dauphin néon à facettes devient un GRAND DAUPHIN (Tursiops) onirique :
   · LA FORME : rostre COURT et trapu, pli net, melon rond qui monte, poitrine pleine, dos qui file, pédoncule en LAME (plus haut que
     large, carènes dessus-dessous). Corps LISSE (normales douces, 56 anneaux de 28 pans, nez et bout arrondis) ; nageoires PROFILÉES
     (vrais profils d'aile symétriques NACA, lissées) : dorsale en faucille, pectorales en pagaie balayée, caudale à deux lobes et encoche.
   · LA PEAU est peinte AU PIXEL dans le shader (plus de couleur par facette) : cape bleu ardoise qui plonge sous la dorsale et vire au
     lavande vers la queue, flancs gris glacé, ventre nacré, gorge qui rosit ; la commissure (le « sourire »), l'évent, l'ŒIL sombre et
     son reflet. Par-dessus : la NACRE (un arc-en-ciel pastel qui glisse avec l'angle de vue), le liseré irisé (rose dessus, cyan
     dessous — la dark triad le passe au rouge sang) et des PAILLETTES qui scintillent (une case de 3 cm sur cinq en porte une ; elles
     s'allument selon le regard et l'horloge de la nage — sous le pixel, elles grossissent et pâlissent au lieu de clignoter).
   · LES ÉTOILES : le sillage est fait d'étoiles à quatre branches (`DOL_ETOILE`) nées le long du corps.
   PERF : ~4 900 triangles par dauphin (six : ~29 k, le jeu en dessine 250 k), une matière par dauphin, UN programme (`dauphin5`). */
const DOL_L=3.2; // longueur du corps (rostre → pédoncule) — le nez en +x, la queue en −x (le sillage, la chorégraphie et les photos s'y calent)
// LE PROFIL du grand dauphin, du bout du rostre (u 0) au pédoncule (u 1) : [u, dessus, dessous, demi-largeur]
const DOL_PR=[[0,-.135,-.225,.045],[.02,-.11,-.25,.065],[.045,-.095,-.27,.082],[.066,-.088,-.282,.095],[.082,-.025,-.296,.114],
  [.1,.055,-.31,.138],[.13,.14,-.325,.167],[.17,.215,-.34,.2],[.22,.275,-.352,.235],[.28,.315,-.36,.262],[.35,.34,-.358,.28],
  [.42,.345,-.345,.284],[.5,.335,-.32,.268],[.58,.31,-.285,.235],[.66,.27,-.235,.19],[.74,.225,-.18,.14],[.82,.175,-.125,.095],
  [.9,.12,-.075,.058],[.96,.075,-.04,.036],[1,.05,-.025,.027]];
const DOL_PRM=[1,2,3].map(k=>{ // les pentes de la courbe MONOTONE (Fritsch–Carlson) : lisse, et jamais de bosse entre deux points
  const P=DOL_PR,n=P.length,d=[],m=[];
  for(let i=0;i<n-1;i++)d.push((P[i+1][k]-P[i][k])/(P[i+1][0]-P[i][0]));
  m.push(d[0]);for(let i=1;i<n-1;i++)m.push(d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2);m.push(d[n-2]);
  for(let i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],h=a*a+b*b;
    if(h>9){const t=3/Math.sqrt(h);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
  return m;});
function dolPr(u,k){const P=DOL_PR,M=DOL_PRM[k-1];u=Math.max(0,Math.min(1,u));let i=0;while(i<P.length-2&&u>P[i+1][0])i++;
  const h=P[i+1][0]-P[i][0],t=(u-P[i][0])/h,t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*P[i][k]+(t3-2*t2+t)*h*M[i]+(-2*t3+3*t2)*P[i+1][k]+(t3-t2)*h*M[i+1];}
// LA PALETTE de la peau (lue par le shader) — DOUCE : l'étalonnage du jeu (saturation ×1,4) la ravive ; plus vive, le pastel sortait violet électrique
const DOL_C={dos:new THREE.Color(0x34446a),dosQ:new THREE.Color(0x3d3a72),flanc:new THREE.Color(0x7d93b6),ventre:new THREE.Color(0xdbe8f4),
  eau:new THREE.Color(0x8fd0f2),violet:new THREE.Color(0x6a58b4),bouche:new THREE.Color(0x1e2333),oeil:new THREE.Color(0x07080c),cerne:new THREE.Color(0x2b3346)}; /* (2026-10-09) la palette de l'AÉROGRAPHE (les deux images de Léo) : dos ardoise bleu nuit, bande violette, reflets d'eau cyan dessous */
const DOL_OEIL=(()=>{const u=.14,c=.16,yt=dolPr(u,1),yb=dolPr(u,2);return [DOL_L*.5-u*DOL_L,(yt+yb)/2+(yt-yb)/2*c,dolPr(u,3)*Math.sqrt(1-c*c)];})(); // l'œil, sur la peau, juste derrière la commissure
const DOL_EVENT=[DOL_L*.5-.19*DOL_L,dolPr(.19,1)]; // l'évent, sur le crâne derrière le melon
function mkDolphinGeo(){ // corps + nageoires en UNE géométrie indexée, normales DOUCES ; aRb = (u le long du corps, t = cos autour : 1 dos / −1 ventre, partie + envergure)
  const P=[],A=[],I=[],V=(x,y,z)=>new THREE.Vector3(x,y,z),xU=u=>DOL_L*.5-u*DOL_L,
    e1=new THREE.Vector3(),e2=new THREE.Vector3(),nn=new THREE.Vector3(),cc=new THREE.Vector3(),q0=new THREE.Vector3(),q1=new THREE.Vector3(),q2=new THREE.Vector3();
  const pt=(v,u,t,pa)=>{P.push(v.x,v.y,v.z);A.push(u,t,pa);return P.length/3-1;};
  const tri=(a,b,c,ref)=>{q0.fromArray(P,a*3);q1.fromArray(P,b*3);q2.fromArray(P,c*3); // TOUJOURS tournée vers l'extérieur (ref = un point intérieur)
    e1.subVectors(q1,q0);e2.subVectors(q2,q0);nn.crossVectors(e1,e2);cc.copy(q0).add(q1).add(q2).multiplyScalar(1/3).sub(ref);
    if(nn.dot(cc)<0)I.push(a,c,b);else I.push(a,b,c);};
  const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},bz=(a,b,c,s)=>a*(1-s)*(1-s)+2*b*s*(1-s)+c*s*s;
  const sec=(u,c,s)=>{const yt=dolPr(u,1),yb=dolPr(u,2),az=1+.9*sst(.55,.95,u); // la section : ellipse, qui se PINCE en carènes vers la queue
    return V(xU(u),(yt+yb)/2+(yt-yb)/2*c,dolPr(u,3)*Math.sign(s)*Math.pow(Math.abs(s),az));};
  // LE CORPS — anneaux plus serrés au rostre et à la queue
  const NU=56,SEG=28,R=[];
  for(let i=0;i<=NU;i++){const a=i/NU,u=a-.5*Math.sin(2*Math.PI*a)/(2*Math.PI),rg=[];
    for(let j=0;j<SEG;j++){const th=j/SEG*Math.PI*2,c=Math.cos(th);rg.push(pt(sec(u,c,Math.sin(th)),u,c,0));}
    rg.u=u;R.push(rg);}
  for(let i=0;i<NU;i++){const a=R[i],b=R[i+1],um=(a.u+b.u)/2,ref=V(xU(um),(dolPr(um,1)+dolPr(um,2))/2,0);
    for(let j=0;j<SEG;j++){const j1=(j+1)%SEG;tri(a[j],b[j],a[j1],ref);tri(a[j1],b[j],b[j1],ref);}}
  const bout=(rg,dx,rr,u)=>{const cx=xU(u),cy=(dolPr(u,1)+dolPr(u,2))/2,ref=V(cx,cy,0);let prev=rg; // le bout ARRONDI (le nez, le pédoncule)
    for(const ph of [.55,1.05]){const k=Math.cos(ph),o=dx*rr*Math.sin(ph),ring=[];
      for(let j=0;j<SEG;j++){q0.fromArray(P,rg[j]*3);ring.push(pt(V(cx+o,cy+(q0.y-cy)*k,q0.z*k),u,Math.cos(j/SEG*Math.PI*2),0));}
      for(let j=0;j<SEG;j++){const j1=(j+1)%SEG;tri(prev[j],ring[j],prev[j1],ref);tri(prev[j1],ring[j],ring[j1],ref);}prev=ring;}
    const tip=pt(V(cx+dx*rr,cy,0),u,0,0);for(let j=0;j<SEG;j++)tri(prev[j],tip,prev[(j+1)%SEG],ref);};
  bout(R[0],1,.05,0);bout(R[NU],-1,.03,1);
  // LES NAGEOIRES — des stations de corde (bord d'attaque `le`, bord de fuite `te`, épaisseur relative `th`), chacune un profil d'aile
  // symétrique (NACA 00xx, bord de fuite fermé) ; refermées en pointe sur `st.pointe`. pa : 1 dorsale · 2 pectorale · 3 caudale (+ l'envergure)
  const aile=(st,N,pa,tU,tH,tB)=>{const NC=8,rg=[];
    for(const S of st){const ch=S.te.clone().sub(S.le),L=ch.length(),r=[];r.cen=S.le.clone().addScaledVector(ch,.4);
      for(let k=0;k<2*NC;k++){const up=k<=NC,kk=up?k:2*NC-k,x=(1-Math.cos(Math.PI*kk/NC))/2,sd=up?1:-1;
        const yt=5*S.th*L*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
        r.push(pt(S.le.clone().addScaledVector(ch,x).addScaledVector(N,sd*yt),tU,N.y*sd>=0?tH:tB,pa+.9*S.s));}
      rg.push(r);}
    for(let i=0;i<rg.length-1;i++){const a=rg[i],b=rg[i+1],ref=a.cen.clone().add(b.cen).multiplyScalar(.5);
      for(let k=0;k<2*NC;k++){const k1=(k+1)%(2*NC);tri(a[k],b[k],a[k1],ref);tri(a[k1],b[k],b[k1],ref);}}
    const z=rg[rg.length-1],tip=pt(st.pointe,tU,tH,pa+.9);for(let k=0;k<2*NC;k++)tri(z[k],tip,z[(k+1)%(2*NC)],z.cen);};
  { // la DORSALE en faucille : bord d'attaque bombé, bord de fuite creusé
    const x0=xU(.40),y0=dolPr(.40,1)-.07,x1=xU(.62),y1=dolPr(.62,1)-.07,T=[-.46,.80],st=[];
    for(let i=0;i<=10;i++){const s=i/10*.95;st.push({s,le:V(bz(x0,.02,T[0],s),bz(y0,.66,T[1],s),0),te:V(bz(x1,-.27,T[0],s),bz(y1,.5,T[1],s),0),th:.2-.08*s});}
    st.pointe=V(T[0],T[1],0);aile(st,V(0,0,1),1,.5,.97,.97);}
  for(const sd of [1,-1]){ // les PECTORALES : des pagaies balayées vers l'arrière et le bas, attachées bas sur le flanc
    const o=sec(.255,-.5,sd*.866);o.z*=.8;
    const S=V(-.55,-.55,.63*sd).normalize(),C=V(1,0,0);C.addScaledVector(S,-C.dot(S)).normalize();
    const N=new THREE.Vector3().crossVectors(S,C),F=(a,b)=>o.clone().addScaledVector(S,a).addScaledVector(C,b),st=[];
    for(let i=0;i<=9;i++){const q=i/9*.94,a=bz(0,.27,.5,q);st.push({s:q,le:F(a,bz(.19,.19,-.04,q)),te:F(a,bz(-.21,-.16,-.04,q)),th:.2-.08*q});}
    st.pointe=F(.5,-.04);aile(st,N,2,.255,.62,-.65);}
  { // la CAUDALE : deux lobes balayés, pointes effilées, encoche au milieu du bord de fuite
    const yq=(dolPr(1,1)+dolPr(1,2))/2;
    for(const sd of [1,-1]){const st=[];
      for(let i=0;i<=11;i++){const q=i/11*.95;st.push({s:q,le:V(bz(-1.47,-1.68,-2.04,q),yq,sd*bz(0,.44,.6,q)),te:V(bz(-1.88,-1.76,-2.04,q),yq,sd*bz(0,.33,.6,q)),th:.15-.05*q});}
      st.pointe=V(-2.04,yq,sd*.6);aile(st,V(0,1,0),3,.7,.95,-.1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aRb',new THREE.Float32BufferAttribute(A,3));
  g.setAttribute('aLp',new THREE.Float32BufferAttribute(P,3)); // (cubes) le point de couleur = le sommet lui-même
  g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius+=.7; // + la marge de la vague et de la cambrure (le shader déplace les sommets)
  return g;
}
/* ---- LE DAUPHIN EN MINUSCULES CUBES (2026-10-09, Léo : « fais-le en minuscules cubes pour rajouter du réalisme ») ----
   La surface lisse (mkDolphinGeo) est ÉCHANTILLONNÉE : chaque case de DOL_VOX qu'elle touche devient un cube. Le DEHORS est rempli depuis
   un coin (6-voisinage : une peau 26-connexe ne laisse rien fuir) et seules les faces qui donnent dehors sont gardées — l'intérieur ne coûte
   rien. Chaque cube porte le centre de sa case (aLp) et la robe moyenne de sa case (aRb) : il a UNE couleur, la nage le déplace d'UN bloc,
   la surface de l'eau le coupe ENTIER ; le shader lui pose un biseau sombre sur les arêtes et une nuance à lui. 0 = le dauphin lisse. */
const DOL_VOX=.026,DOL_VOX_L=.045; // les cubes FINS (dauphin grand à l'écran) · les cubes du LOIN (même programme : on échange la géométrie)
function dolCubes(src,h){
  const P=src.attributes.position.array,A=src.attributes.aRb.array,I=src.index.array;
  src.computeBoundingBox();const o=src.boundingBox.min.clone().addScalar(-2*h),mx=src.boundingBox.max;
  const nx=Math.ceil((mx.x-o.x)/h)+3,ny=Math.ceil((mx.y-o.y)/h)+3,nz=Math.ceil((mx.z-o.z)/h)+3,N=nx*ny*nz,id=(i,j,k)=>i+nx*(j+ny*k);
  const cnt=new Uint16Array(N),sum=new Float32Array(N*3),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let f=0;f<I.length;f+=3){const ia=I[f],ib=I[f+1],ic=I[f+2];a.fromArray(P,ia*3);b.fromArray(P,ib*3);c.fromArray(P,ic*3);
    const n=Math.max(1,Math.ceil(Math.max(a.distanceTo(b),b.distanceTo(c),c.distanceTo(a))/(h*.4)));
    for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){const wa=i/n,wb=j/n,wc=1-wa-wb;
      const q=id(Math.floor((a.x*wa+b.x*wb+c.x*wc-o.x)/h),Math.floor((a.y*wa+b.y*wb+c.y*wc-o.y)/h),Math.floor((a.z*wa+b.z*wb+c.z*wc-o.z)/h));
      if(cnt[q]<65000){cnt[q]++;for(let k=0;k<3;k++)sum[q*3+k]+=A[ia*3+k]*wa+A[ib*3+k]*wb+A[ic*3+k]*wc;}}}
  const D6=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],dehors=new Uint8Array(N),pile=new Int32Array(N);let sp=0;dehors[0]=1;pile[sp++]=0;
  while(sp){const q=pile[--sp],i=q%nx,j=((q/nx)|0)%ny,k=(q/(nx*ny))|0;
    for(const d of D6){const i2=i+d[0],j2=j+d[1],k2=k+d[2];if(i2<0||j2<0||k2<0||i2>=nx||j2>=ny||k2>=nz)continue;
      const q2=id(i2,j2,k2);if(!dehors[q2]&&!cnt[q2]){dehors[q2]=1;pile[sp++]=q2;}}}
  // les faces : (u, v) tels que u × v = la normale — sommets dans le sens direct vu de dehors
  const UV=[[[0,1,0],[0,0,1]],[[0,0,1],[0,1,0]],[[0,0,1],[1,0,0]],[[1,0,0],[0,0,1]],[[1,0,0],[0,1,0]],[[0,1,0],[1,0,0]]];
  const pos=[],nor=[],lp=[],rb=[],ix=[];let nv=0;
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const q=id(i,j,k);if(!cnt[q])continue;
    const cx=o.x+(i+.5)*h,cy=o.y+(j+.5)*h,cz=o.z+(k+.5)*h,r0=sum[q*3]/cnt[q],r1=sum[q*3+1]/cnt[q],r2=sum[q*3+2]/cnt[q];
    for(let f=0;f<6;f++){const d=D6[f];if(!dehors[id(i+d[0],j+d[1],k+d[2])])continue;const u=UV[f][0],v=UV[f][1];
      for(const [su,sv] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
        pos.push(cx+(d[0]+su*u[0]+sv*v[0])*h/2,cy+(d[1]+su*u[1]+sv*v[1])*h/2,cz+(d[2]+su*u[2]+sv*v[2])*h/2);
        nor.push(d[0],d[1],d[2]);lp.push(cx,cy,cz);rb.push(r0,r1,r2);}
      ix.push(nv,nv+1,nv+2,nv,nv+2,nv+3);nv+=4;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('aLp',new THREE.Float32BufferAttribute(lp,3));g.setAttribute('aRb',new THREE.Float32BufferAttribute(rb,3));g.setIndex(ix);
  g.computeBoundingSphere();g.boundingSphere.radius+=.7;src.dispose();return g;
}
/* LA PEAU LISSE PAR-DESSUS LES CUBES (2026-10-09, Léo : « rajoute celui en lisse par-dessus celui en pixel, rends-le transparent, l'opacité
   qu'il faut pour mélanger, et laisse celui en pixel en dessous créer du volume ») — chaque dauphin en cubes porte une COQUE : le dauphin
   lisse, un peu gonflé (`uCoqG`, en m : il enveloppe les cubes), TRANSPARENT de face (`uCoqA0`) et presque opaque sur la silhouette
   (`uCoqA1`, selon l'angle — `uCoqP` la courbe) : de face on voit les cubes à travers une peau de verre mouillé, sur les bords la ligne est
   lisse. Même peau peinte, mêmes uniforms de nage et de surface que ses cubes (elle les suit au millimètre). `DOL_COQUE.on=false` l'enlève. */
/* LA STRUCTURE EN TROIS COUCHES (2026-10-10, Léo : « crée une structure en mélangeant les deux techniques fusionnées… un résultat encore
   plus, plus, plus impressionnant ») — de l'intérieur vers l'extérieur :
   · LE CŒUR (`coeur`) : le dauphin lisse RENTRÉ sous les écailles (`uCoeurIn`), une lumière pure (rose au rostre → violet → cyan à la
     queue, les couleurs du liseré : la dark triad le passe au rouge sang), qui bat avec l'ONDE ;
   · LES ÉCAILLES : les cubes, un peu ÉCARTÉS (`uEcart` .84) — la lumière du cœur passe dans les joints, une mosaïque de lanterne — et
     soulevés par une VAGUE qui court du rostre à la queue (`uVague`, le long de la normale hors de l'axe du corps) ;
   · LA PEAU DE VERRE (`coque`) : transparente de face, opaque sur la silhouette, avec le REFLET D'UN CIEL (dégradé zénith / horizon / sol
     sur la direction réfléchie), un ÉCLAT de studio net et un film IRISÉ sur les bords.
   L'ONDE (`uScan`) : une bande de lumière qui parcourt le corps du rostre à la queue (≈ 2 s, l'horloge de la nage) — elle allume le cœur,
   les arêtes des écailles et la peau à son passage. Chaque couche est réglable dans la boîte (carte « Structure »). */
const DOL_COQUE={on:true,coeur:true};
const DOL_NU=typeof SANS_DAUPHIN!=='undefined'&&SANS_DAUPHIN; // (2026-10-15, Sacha) dauphin coupé : rien à bâtir (typeof : la boîte à dauphins exécute ce bloc sans l'interrupteur)
const DOL_GEO=DOL_NU?null:DOL_VOX>0?dolCubes(mkDolphinGeo(),DOL_VOX):mkDolphinGeo(),DOL_GEO_L=DOL_NU?null:DOL_VOX>0?dolCubes(mkDolphinGeo(),DOL_VOX_L):DOL_GEO,DOL_GEO_S=DOL_NU?null:DOL_VOX>0?mkDolphinGeo():null; // la coque : le dauphin lisse // ~24 800 et ~8 000 triangles
// LES ÉTOILES du sillage : quatre branches fines + deux petites en biais, cœur doux (texture des particules)
const DOL_ETOILE=(function(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
  const coeur=c.createRadialGradient(32,32,0,32,32,11);coeur.addColorStop(0,'rgba(255,255,255,1)');coeur.addColorStop(.35,'rgba(255,255,255,.5)');coeur.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=coeur;c.fillRect(0,0,64,64);
  for(const [a,l,w] of [[0,31,2.6],[Math.PI/2,31,2.6],[Math.PI/4,15,1.7],[-Math.PI/4,15,1.7]]){
    c.save();c.translate(32,32);c.rotate(a);const g=c.createLinearGradient(-l,0,l,0);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(-l,0);c.lineTo(0,-w);c.lineTo(l,0);c.lineTo(0,w);c.closePath();c.fill();c.restore();}
  return new THREE.CanvasTexture(cv);})();
// uniforms PARTAGÉS : largeur de la ligne d'écume (m — suit la taille du banc) · force du liseré · ses couleurs (ventre, dos) et celle de l'écume
const DOL_U={uEcume:{value:.2},uRimK:{value:1.5},uRimA:{value:new THREE.Color(.55,.9,1)},uRimB:{value:new THREE.Color(1,.6,.88)},uEcC:{value:new THREE.Color(.75,.97,1)},
  uLum:{value:new THREE.Vector3(.3,1,.25).normalize()},uScene:{value:.5},
  uCoqA0:{value:.43},uCoqA1:{value:.95},uCoqP:{value:1.4},uCoqG:{value:DOL_VOX*1.3}, // la COQUE : opacité de face · sur la silhouette · courbe · gonflement (m)
  uEcart:{value:.89},uVague:{value:DOL_VOX*.45},uLueur:{value:1.4},uScan:{value:1},uCoeurIn:{value:DOL_VOX*1.6},uNoir:{value:0}}; // LA STRUCTURE (valeurs = le JUSTE MILIEU réglé par Léo dans la boîte, 10/10 : de face .43, écailles .89, vague .45 cube) : taille des écailles (1 = jointives) · leur vague (m) · la lumière du cœur · l'onde qui parcourt le corps · le cœur rentré sous les écailles (m) /* (2026-10-09, « plus réel ») uLum : SA lumière (direction MONDE : le haut du banc, un peu vers la caméra — posée par updateDolphins) ; uScene : la part des lumières du niveau qu'il garde */ /* la DARK TRIAD les passe au rouge sang, la robe au noir (dolNoirMaj) */
let dolNoir=false;
function dolNoirMaj(){const n=triNoir();if(n===dolNoir)return;dolNoir=n; /* (Sacha : « en dark triad […] les dauphins […] doivent être noirs ») uniforms et couleurs seulement : même programme */
  DOL_U.uNoir.value=n?1:0;DOL_U.uRimA.value.setRGB(n?1:.55,n?.08:.9,n?.14:1);DOL_U.uRimB.value.setRGB(n?.75:1,n?0:.6,n?.08:.88);DOL_U.uEcC.value.setRGB(n?1:.75,n?.22:.97,n?.28:1);
  for(const d of dolphins){d.material.color.setHex(n?0x0e0d12:0xffffff);if(d.userData.coque)d.userData.coque.material.color.setHex(n?0x0e0d12:0xffffff);}
  dolTrail.mesh.material.color.setHex(n?0xff1a30:0xffe6fb);dolSplash.mesh.material.color.setHex(n?0xb01424:0xd6faff);}
const DOL_G3=c=>'vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')',DOL_F=v=>(+v).toFixed(4);
function dolShader(sh){ // nage + surface d'eau + PEAU peinte + nacre, liseré, paillettes — appelée en méthode : `this` = la matière du dauphin, ses uniforms à lui
  const m=this.userData,C=DOL_C,E=DOL_OEIL,cq=!!m.coque,co=!!m.coeur;for(const k of ['uEcart','uVague','uLueur','uScan','uCoeurIn','uNoir'])sh.uniforms[k]=DOL_U[k];sh.uniforms.uCoqA0=DOL_U.uCoqA0;sh.uniforms.uCoqA1=DOL_U.uCoqA1;sh.uniforms.uCoqP=DOL_U.uCoqP;sh.uniforms.uCoqG=DOL_U.uCoqG;sh.uniforms.uLum=DOL_U.uLum;sh.uniforms.uScene=DOL_U.uScene;sh.uniforms.uDol=m.uDol;sh.uniforms.uSurf=m.uSurf;sh.uniforms.uEcume=DOL_U.uEcume;sh.uniforms.uRimK=DOL_U.uRimK;sh.uniforms.uRimA=DOL_U.uRimA;sh.uniforms.uRimB=DOL_U.uRimB;sh.uniforms.uEcC=DOL_U.uEcC;
  // uDol : x = amplitude de la vague, y = sa phase (l'horloge de la nage), z = son nombre d'onde sur le corps, w = la cambrure (le corps épouse l'arc du bond)
  sh.vertexShader='uniform float uCoqG;uniform float uEcart;uniform float uVague;uniform float uCoeurIn;attribute vec3 aRb;attribute vec3 aLp;uniform vec4 uDol;uniform vec4 uSurf;varying float vSurf9;varying vec3 vRb;varying vec3 vLp;varying vec3 vPo;\n'+sh.vertexShader
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvRb=aRb;vLp=aLp;vPo=position;\n'+ // (cubes) la vague se lit au CENTRE du cube : il bouge d'un bloc
      'float u9=clamp((1.6-aLp.x)/3.2,0.,1.3),e9=smoothstep(.2,1.05,u9),dy9=uDol.x*e9*e9*sin(uDol.y-u9*uDol.z)-uDol.w*aLp.x*aLp.x;\n'+
      (!cq&&!co&&DOL_VOX>0?'{vec3 dr9=normalize(vec3(0.,aLp.y+.02,aLp.z)+1e-4);float wv9=exp(-pow((aLp.x-(1.9-4.4*fract(uDol.y*.05)))/.3,2.));transformed=aLp+(transformed-aLp)*mix(uEcart,1.,wv9*.8)+dr9*uVague*wv9;}\n':'')+ // les ÉCAILLES : écartées (les joints laissent passer le cœur) et soulevées par la vague
      'transformed.y+=dy9;'+(cq?'\ntransformed+=normalize(objectNormal)*uCoqG;':'')+(co?'\ntransformed-=normalize(objectNormal)*uCoeurIn;':''))
    .replace('#include <project_vertex>','#include <project_vertex>\nvSurf9=dot(uSurf.xyz,(modelMatrix*vec4(aLp.x,aLp.y+dy9,aLp.z,1.)).xyz)-uSurf.w;'); // (cubes) l'eau coupe le cube ENTIER
  sh.fragmentShader='uniform float uNoir;uniform vec3 uLum;uniform float uScene;uniform float uEcume;uniform float uRimK;uniform vec3 uRimA;uniform vec3 uRimB;uniform vec3 uEcC;uniform vec4 uDol;varying float vSurf9;varying vec3 vRb;varying vec3 vLp;varying vec3 vPo;\n'+
    'uniform float uCoqA0;uniform float uCoqA1;uniform float uCoqP;uniform float uLueur;uniform float uScan;\nconst float dolVox='+DOL_F(cq||co?0:DOL_VOX)+';float dolE9=0.;\n'+ // (la coque est lisse : ni biseau ni éclats de cube)
    'float dolH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\n'+
    'float dolN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);\n'+
    '  return mix(mix(mix(dolH(i),dolH(i+vec3(1.,0.,0.)),f.x),mix(dolH(i+vec3(0.,1.,0.)),dolH(i+vec3(1.,1.,0.)),f.x),f.y),\n'+
    '             mix(mix(dolH(i+vec3(0.,0.,1.)),dolH(i+vec3(1.,0.,1.)),f.x),mix(dolH(i+vec3(0.,1.,1.)),dolH(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}\n'+
    'float dolReflet9=0.;\n'+
    'vec3 dolPeau(){float u=vRb.x,t=vRb.y,pa=floor(vRb.z+.001),corps=1.-step(.5,pa);\n'+
    // la CAPE : son bord part haut sur le rostre, descend derrière l'œil, plonge en V sous la dorsale, remonte vers la queue (fondu large : un dégradé, pas une ligne)
    '  float cape=.36-.24*exp(-pow((u-.42)/.12,2.))+.24*exp(-pow((u-.66)/.07,2.))-.08*exp(-pow((u-.15)/.05,2.))+.28*smoothstep(.76,1.,u);\n'+
    '  vec3 c=mix('+DOL_G3(C.flanc)+',mix('+DOL_G3(C.dos)+','+DOL_G3(C.dosQ)+',smoothstep(.3,1.,u)),smoothstep(cape-.15,cape+.13,t));\n'+
    '  float v=smoothstep(-.3,-.62,t);c=mix(c,'+DOL_G3(C.ventre)+',v);\n'+                                   // le ventre nacré
    '  c=mix(c,'+DOL_G3(C.violet)+',.4*exp(-pow((t-cape+.12)/.17,2.))*smoothstep(.15,.45,u));\n'+
    '  c=mix(c,'+DOL_G3(C.eau)+',.45*smoothstep(-.05,-.55,t)*(1.-.4*v));\n'+
    '  c*=.93+.1*(.6*dolN(vLp*vec3(2.5,5.,5.))+.4*dolN(vLp*13.));\n'+
    '  c=mix(c,c*1.18+.02,.3*smoothstep(.86,.92,dolN(vLp*vec3(1.4,46.,46.)+7.3))*smoothstep(-.4,.2,t)*corps);\n'+
    '  {vec2 a=vec2('+DOL_F(DOL_OEIL[0]-.06)+','+DOL_F(DOL_OEIL[1]-.03)+'),b=vec2('+DOL_F(DOL_L*.5-.25*DOL_L)+',-.16),pq=vLp.xy-a,ab=b-a;\n'+
    '   float h=clamp(dot(pq,ab)/dot(ab,ab),0.,1.),dl=length(pq-ab*h);c*=1.-.14*smoothstep(.045,.0,dl)*smoothstep(-.6,-.1,t)*smoothstep(-.1,-.6,t-.5)*corps;}\n'+  // la gorge et le bas-ventre qui rosissent
    '  c=mix(c,'+DOL_G3(C.ventre)+',(1.-smoothstep(.07,.1,u))*smoothstep(-.05,-.35,t)*.8*corps);\n'+         // la mâchoire, pâle
    '  float tm=-.1+.4*smoothstep(.07,.112,u),fw=dolVox>0.?.09:fwidth(t)*1.2+.022;\n'+                                     // la COMMISSURE, qui remonte en sourire
    '  c=mix(c,'+DOL_G3(C.bouche)+',.5*(1.-smoothstep(fw*.5,fw,abs(t-tm)))*(1.-smoothstep(.1,.112,u))*smoothstep(0.,.025,u)*corps);\n'+
    '  vec2 ev=vec2((vLp.x-'+DOL_F(DOL_EVENT[0])+')/.03,vLp.z/.055);float de=length(ev);\n'+                // l'ÉVENT, un croissant sur le crâne
    '  c*=1.-.35*smoothstep(1.,.8,de)*smoothstep(.45,.7,de)*step(vLp.x,'+DOL_F(DOL_EVENT[0]+.008)+')*step(.85,t)*corps;\n'+
    '  vec3 q=vLp-vec3('+DOL_F(E[0])+','+DOL_F(E[1])+',sign(vLp.z)*'+DOL_F(E[2])+');\n'+                       // l'ŒIL : amande sombre, cerne doux, reflet
    '  float eo=length(vec3(q.x/max(.036,dolVox*1.1),q.y/max(.024,dolVox*.85),q.z/.07));\n'+
    '  c=mix(c,'+DOL_G3(C.cerne)+',.45*smoothstep(1.7,1.1,eo)*corps);c=mix(c,'+DOL_G3(C.oeil)+',smoothstep(1.,.78,eo)*corps);\n'+
    '  vec3 qr=vPo-vec3('+DOL_F(E[0])+','+DOL_F(E[1])+',sign(vPo.z)*'+DOL_F(E[2])+');\n'+
    '  dolReflet9=smoothstep(1.,.35,length(vec3((qr.x-.01)/.011,(qr.y-.008)/.011,qr.z/.07)))*corps;\n'+
    '  if(dolVox>0.){vec3 qb=abs(vPo-vLp);qb/=max(qb.x,max(qb.y,qb.z));float e=qb.x+qb.y+qb.z-1.-min(qb.x,min(qb.y,qb.z));dolE9=smoothstep(.6,1.,e);\n'+ // (cubes) le biseau des arêtes + la nuance propre à chaque cube
    '    c*=(1.-.2*smoothstep(.6,1.,e))*(.95+.1*dolH(vLp*61.7));}\n'+
    '  return c;}\n'+sh.fragmentShader
    .replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=dolPeau();')
    .replace('#include <clipping_planes_fragment>','if(vSurf9<0.)discard;\n#include <clipping_planes_fragment>')
    // SA LUMIÈRE (« ils sont un peu fantômes ») : le ciel du jeu l'éclairait de partout pareil — plus de volume, il se fondait dedans.
    // Une lumière de studio qui suit le banc (d'en haut, un peu de face) + son reflet mouillé ; le niveau garde uScene de la sienne.
    .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+
      'vec3 lv9=normalize((viewMatrix*vec4(uLum,0.)).xyz);float dl9=dot(normal,lv9),wr9=max(0.,(dl9+.2)/1.2);\n'+
      'float sp9=pow(max(dot(normal,normalize(lv9+normalize(vViewPosition))),0.),70.);\n'+
      'reflectedLight.directDiffuse=reflectedLight.directDiffuse*uScene+diffuseColor.rgb*wr9*.95;\n'+
      'reflectedLight.indirectDiffuse=reflectedLight.indirectDiffuse*uScene*.7+diffuseColor.rgb*(.2+.1*dl9);\n'+
      'reflectedLight.directSpecular=reflectedLight.directSpecular*uScene+vec3(sp9*.5);')
    .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+
      'vec3 vd9=normalize(vViewPosition);float nv9=abs(dot(normal,vd9)),fr9=pow(1.-nv9,2.2);\n'+(cq?'diffuseColor.a=mix(uCoqA0,uCoqA1,pow(1.-nv9,uCoqP));\n':'')+ // la COQUE : du verre de face, une peau sur les bords
      // la NACRE : un arc-en-ciel PASTEL qui glisse avec l'angle de vue et le long du corps (elle teinte la peau, la lumière fait le reste)
      'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.92,.98,1.08)+vec3(.06,.07,.09),.45*fr9);\n'+
      'totalEmissiveRadiance=totalEmissiveRadiance*diffuseColor.rgb;\n'+
      // le LISERÉ irisé : rose par-dessus, cyan par-dessous, en vagues le long du corps — seulement sur la silhouette
      'totalEmissiveRadiance+=mix(uRimA,uRimB,smoothstep(-.45,.45,normal.y+.45*sin(vLp.x*2.3)))*pow(1.-nv9,3.)*max(0.,uRimK-1.2)*.22;\n'+
      'totalEmissiveRadiance+=vec3(1.)*dolReflet9*1.3;\n'+                                                   // le reflet dans l'œil
      // les PAILLETTES : une case de 3 cm sur cinq porte un grain qui s'allume selon l'horloge ; sous le pixel il grossit et pâlit
      'vec3 g9=vLp*34.,ci9=floor(g9);float hg9=dolH(ci9);\n'+
      'if(dolVox>0.){float hc9=dolH(vLp*47.3);if(hc9>.975)totalEmissiveRadiance+=vec3(1.)*pow(.5+.5*sin(uDol.y*(.3+.4*dolH(vLp*13.1))+hc9*80.),8.)*.9;}\n'+ // (cubes) l'éclat d'un cube entier
      'else if(hg9>.93){vec3 o9=vec3(dolH(ci9+1.7),dolH(ci9+3.1),dolH(ci9+5.3))-.5;float d9=length(fract(g9)-.5-o9*.5),r9=max(.16,length(fwidth(g9))*.9);\n'+
      '  float tw9=pow(.5+.5*sin(uDol.y*(.3+.4*dolH(ci9+9.))+hg9*80.),6.);\n'+
      '  totalEmissiveRadiance+=mix(vec3(1.),uRimB,.2)*smoothstep(r9,0.,d9)*tw9*(.16/r9)*.7;}\n'+
      'float sc9=uScan*exp(-pow((vLp.x-(1.9-4.4*fract(uDol.y*.05)))/.22,2.));vec3 gl9=mix(mix(mix(vec3(1.,.22,.62),vec3(.55,.28,1.),smoothstep(.15,.5,vRb.x)),vec3(.15,.8,1.),smoothstep(.5,.9,vRb.x)),uRimA,uNoir);\n'+ // L'ONDE et la couleur du cœur à cet endroit
      (cq?'vec3 rf9=reflect(-vd9,normal),rw9=(vec4(rf9,0.)*viewMatrix).xyz,ll9=normalize((viewMatrix*vec4(uLum,0.)).xyz);\n'+ // (vec × mat = la transposée : vue → monde, WebGL 1 compris) // LA PEAU DE VERRE : le ciel réfléchi, l'éclat, le film irisé
          'vec3 sky9=mix(mix(vec3(.30,.27,.40),vec3(.86,.92,1.),smoothstep(-.25,.05,rw9.y)),vec3(.42,.6,1.),smoothstep(.15,.9,rw9.y));\n'+
          'totalEmissiveRadiance+=sky9*(.03+.55*fr9);totalEmissiveRadiance+=vec3(1.,.98,.95)*pow(max(dot(rf9,ll9),0.),300.)*2.5;\n'+
          'totalEmissiveRadiance+=(.5+.5*cos(6.2832*(fr9*1.4+vLp.x*.15+vec3(0.,.33,.67))))*fr9*.28;\n'+
          'totalEmissiveRadiance+=gl9*sc9*.35;diffuseColor.a=min(1.,diffuseColor.a+sc9*.12);\n':'')+
      (!cq&&!co?'totalEmissiveRadiance+=gl9*(dolE9*(.25*uLueur+2.2*sc9)+sc9*.25);\n':'')+ // LES ÉCAILLES : leurs arêtes s'allument au passage de l'onde
      'float ec9=1.-smoothstep(0.,uEcume,vSurf9);totalEmissiveRadiance+=uEcC*ec9*ec9*2.2;')
    .replace('#include <tonemapping_fragment>',(co?'gl_FragColor=vec4(gl9*uLueur*(.55+.25*sin(uDol.y*.3)+2.2*sc9)+uEcC*ec9*ec9,1.);\n':'')+'#include <tonemapping_fragment>'); // LE CŒUR : de la lumière pure (rien d\'autre ne compte : on écrase la sortie)
}
function mkDauphin(){ // UN mesh, SA matière (clone) : le programme est partagé, les uniforms (vague, surface) sont les siens
  const m=new THREE.MeshPhongMaterial({color:0xffffff,shininess:85,specular:0x7c8590,emissive:0x262626}); // emissive = part de la peau qui s'éclaire seule (× la couleur, dans le shader) ; peau MOUILLÉE : reflet serré
  m.extensions={derivatives:true}; // fwidth (commissure, paillettes) — WebGL 1
  m.userData.uDol={value:new THREE.Vector4(0,0,2.3,0)};m.userData.uSurf={value:new THREE.Vector4(0,1,0,-1e9)};
  m.onBeforeCompile=dolShader;m.customProgramCacheKey=function(){return 'dauphin5';}; /* (2026-10-09) le dauphin de rêve : peau peinte, nacre, paillettes */
  const d=new THREE.Mesh(DOL_GEO,m);d.rotation.order='YZX'; // la VRILLE tourne autour du corps (x local), puis le tangage, puis le cap
  if(DOL_GEO_S&&DOL_COQUE.on){const m2=new THREE.MeshPhongMaterial({color:0xffffff,shininess:85,specular:0x7c8590,emissive:0x262626,transparent:true,depthWrite:false});
    m2.extensions={derivatives:true};m2.userData.uDol=m.userData.uDol;m2.userData.uSurf=m.userData.uSurf;m2.userData.coque=true; // les MÊMES uniforms : elle nage avec ses cubes
    m2.onBeforeCompile=dolShader;m2.customProgramCacheKey=function(){return 'dauphin5c';};
    const c2=new THREE.Mesh(DOL_GEO_S,m2);c2.renderOrder=1;d.add(c2);d.userData.coque=c2;}
  if(DOL_GEO_S&&DOL_COQUE.coeur){const m3=new THREE.MeshPhongMaterial({color:0xffffff});m3.extensions={derivatives:true}; // LE CŒUR : il ne se voit que par les joints des écailles et à travers la peau
    m3.userData.uDol=m.userData.uDol;m3.userData.uSurf=m.userData.uSurf;m3.userData.coeur=true;
    m3.onBeforeCompile=dolShader;m3.customProgramCacheKey=function(){return 'dauphin5h';};
    const c3=new THREE.Mesh(DOL_GEO_S,m3);d.add(c3);d.userData.coeur=c3;}
  d.visible=false;return d;
}
// LE BANC : les gabarits du `setPod` de Léo — vitesse (tempo du bond), amplitude, niveau de la « surface », profondeur
// (vers la caméra = positif, comme dans l'aperçu), taille. `p0` : où en est chacun au déclenchement (négatif = encore sous l'eau).
// (dauphin v4) les gabarits entrent DANS CET ORDRE, un toutes les DOL_PAS s de dauphin tenu (dolNb) — le banc grandit avec la tenue
/* (2026-10-09, Léo : « moins de dauphins, animations plus jolies ») TROIS au lieu de six, et ils sautent EN FORMATION : même tempo, chacun
   `lag` de cycle derrière le chef (le chef perce, le 2e le suit, le 3e ferme la vague), une plongée de durée fixe entre deux sauts (le
   rythme se tient au lieu de s'émietter), un qui rejoint attend sa place dans la vague. La vrille : une fois sur quatre, jamais deux à la fois. */
const DOL_CYCLE=1.6; // un cycle de nage : le saut (p 0 → 1,2) + la plongée (0,4)
const DOL_BANC=[
  {speed:.30,amp:3.6,base:-1.6,z:0,   scale:1.15,p0:0,   lag:0},
  {speed:.30,amp:3.0,base:-1.3,z:-3.2,scale:.88, p0:-.24,lag:.24},
  {speed:.30,amp:3.3,base:-1.5,z:2.4, scale:.95, p0:-.48,lag:.48}];
/* LES CHORÉS (2026-10-09, Léo : « donne-leur plusieurs chorés possibles ») — le banc en tire UNE à chaque apparition (jamais deux fois de
   suite la même). ⚠ Puis : « ils ne peuvent pas aller de la droite vers la gauche… celles qui viennent du milieu vont transpercer la route »
   → les dauphins nagent DE PART ET D'AUTRE de la route et sautent LE LONG d'elle (comme on escorte un bateau) : aucun ne la traverse, aucun
   ne sort du milieu. Pour le dauphin i : son côté `s` (±1, retourné d'une apparition à l'autre), sa distance au BORD du bitume (x0 → x1, en m
   × la taille du banc ; il peut s'écarter, jamais revenir sur la route), son saut le long de la route (z0 → z1, en longueurs W, + = devant,
   − = vers la caméra), sa hauteur (`a`), son retard dans la vague (`lag`, en cycle), ses tours forcés (`v`). Par choré : la chance d'une
   vrille par saut (`vr`, jamais deux à la fois), `sync` (les vrilles se décident ensemble). */
const DOL_CHORE=[
  {n:"L'ESCORTE",d:[{s:1,x:2.5,z0:-1,z1:1,a:1,lag:0},{s:-1,x:2.5,z0:-1.3,z1:.7,a:.9,lag:.24},{s:1,x:7,z0:-1.6,z1:.4,a:.85,lag:.48}],vr:.25},
  {n:"L'UNISSON",d:[{s:1,x:2.5,z0:-1,z1:1,a:1,lag:0},{s:1,x:6.5,z0:-1.25,z1:.75,a:1,lag:0},{s:1,x:10.5,z0:-1.5,z1:.5,a:1,lag:0}],vr:.3,sync:1},
  {n:'LE MIROIR',d:[{s:1,x:3,z0:-1,z1:1,a:1,lag:0},{s:-1,x:3,z0:-1,z1:1,a:1,lag:0},{s:1,x:9,z0:-.12,z1:.12,a:1.3,lag:.5,v:2}],vr:0,sync:1},
  {n:'LE SAUTE-MOUTON',d:[{s:1,x:4,z0:-.5,z1:.5,a:.42,lag:0},{s:1,x:4,z0:-1,z1:1,a:1.25,lag:0},{s:1,x:4,z0:-.5,z1:.5,a:.42,lag:.5}],vr:.2},
  {n:'LE CROISEMENT',d:[{s:1,x:3,z0:-1,z1:1,a:1,lag:0},{s:-1,x:3,z0:1.2,z1:-.8,a:1,lag:.15},{s:1,x:8,z0:1.4,z1:-.6,a:.9,lag:.4}],vr:.15},
  {n:"L'ÉVENTAIL",d:[{s:1,x0:1.5,x1:7,z0:-1,z1:.6,a:1,lag:0},{s:-1,x0:1.5,x1:7,z0:-1,z1:.6,a:1,lag:.12},{s:1,x0:5,x1:10,z0:-.6,z1:1,a:.9,lag:.3}],vr:.2},
  {n:"L'ESCALIER",d:[{s:1,x:3,z0:-1.3,z1:-.45,a:.5,lag:0},{s:1,x:4.5,z0:-.6,z1:.45,a:.85,lag:.2},{s:1,x:6,z0:0,z1:1.4,a:1.35,lag:.4,v:1}],vr:0},
  {n:'LA FONTAINE',d:[{s:1,x:3,z0:-.06,z1:.06,a:1.15,lag:0,v:1},{s:-1,x:3,z0:.34,z1:.46,a:1.4,lag:.33,v:2},{s:1,x:8,z0:.74,z1:.86,a:1.15,lag:.66,v:1}],vr:0},
  // (2026-10-09, Léo : « remets au moins deux chorés où ça passe au-dessus de la route, au-dessus de la voiture, comme avant ») — en travers
  // de l'écran (ax0 → ax1 : en demi-largeurs de l'écran), AU-DESSUS : la tranche des sauts est relevée hors de la route (dolHY), ils ne la touchent jamais
  {n:'LE PONT',d:[{ax0:-1,ax1:1,z:0,a:1.15,lag:0},{ax0:-1,ax1:1,z0:-.35,z1:-.35,a:1,lag:.22},{ax0:-1,ax1:1,z0:.3,z1:.3,a:.95,lag:.44}],vr:.25},
  {n:'LES CISEAUX',d:[{ax0:-1,ax1:1,z0:.3,z1:.3,a:1.15,lag:0},{ax0:1,ax1:-1,z0:-.3,z1:-.3,a:1.15,lag:0},{ax0:-1,ax1:1,z:0,a:1.45,lag:.5,v:1}],vr:0}];
// la POSE du dauphin i de la choré C à la phase p (repère du banc : x en travers, z le long de la route) : position, cap, tangage (le nez
// suit la trajectoire), l'axe du nez (nx,ny,nz), la portée horizontale du saut (hz : la cambrure) ; R = le demi-bitume + la marge, xr = l'axe
// de la route (en x du banc). Quand il vient vers la caméra, au sommet il tourne un peu la tête. Partagée par le jeu et la boîte.
function dolChorePose(C,i,b,p,k,W,dir,o,R,xr,ku,hx){ // ku : l'unité des écarts au bord (par défaut la taille du banc) · hx : la demi-largeur de la traversée (ax0/ax1)
  const c=C.d[i]||C.d[0],sd=(c.s||1)*dir,xa=c.x0!=null?c.x0:(c.x||3),xb=c.x1!=null?c.x1:(c.x||3),u9=ku||k,H9=hx||W,tr=c.ax0!=null,
    x0=(xr||0)+(tr?dir*c.ax0*H9:sd*((R||0)+xa*u9)),x1=(xr||0)+(tr?dir*c.ax1*H9:sd*((R||0)+xb*u9)),z0=(c.z0||0)*W,z1=(c.z1||0)*W,amp=b.amp*k*(c.a||1),base=b.base*k,arc=Math.sin(p*Math.PI);
  o.x=x0+(x1-x0)*p;o.z=z0+(z1-z0)*p;o.y=base+arc*amp;o.arc=arc;o.amp=amp;o.base=base;
  const vx=x1-x0,vz=z1-z0,vy=Math.cos(p*Math.PI)*amp*Math.PI,hz=Math.max(.05,Math.hypot(vx,vz));o.hz=hz;
  o.yaw=Math.atan2(-vz,vx);o.pitch=Math.atan2(vy,hz*.8);o.yaw+=.22*Math.max(0,arc)*Math.cos(o.yaw);
  const cp=Math.cos(o.pitch);o.nx=cp*Math.cos(o.yaw);o.ny=Math.sin(o.pitch);o.nz=-cp*Math.sin(o.yaw);return o;}
