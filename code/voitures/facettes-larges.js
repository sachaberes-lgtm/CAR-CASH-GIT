/* ===== LES FACETTES LARGES (2026-10-22, Léo : « les facettes scintillantes sont magnifiques mais certaines ont des facettes trop petites — la queue de canard, la dolce vita, la fidèle, la Mazda, le GMC… un peu trop réaliste : rends-les comme la Rosso, le hot rod, le shark, le trône central, en gardant le charme ; je ne veux pas que tu les changes, il faut juste traduire : des facettes plus larges, mieux calculées, pour éviter les amas de petits pixels de lumière ») =====
   Les caisses « au plan » posent une tranche tous les 2 à 8 cm (jusqu'à 170 tranches de 25 points) : chaque case de tôle ne mesure que 6 cm de côté et sa lumière
   devient un grain (un damier de petits points clairs sur l'aile et la portière). `lpLarges` RETAILLE la grille d'un loft sans toucher au dessin :
   · une rangée (une tranche) ne reste que si, ôtée, la tôle bouge de plus de `e` mètres par rapport à la droite tendue entre ses voisines — la facette
     s'allonge où la ligne est droite (pavillon, capot, flanc) et se resserre dans les courbes (nez, hanches, pare-brise) : « mieux calculées » ;
   · une colonne (un point de section) de même ; l'épaule, la ceinture, l'arête du toit, le plancher — là où la section plie — restent d'elles-mêmes ;
   · une rangée ou une colonne où la MATIÈRE change (`paint`) est toujours gardée : aucune arête de peinture ne se déplace ; les caps (le nez, la poupe) sont gardés.
   Rien n'est modifié dans les gabarits : `lpKit.loft` passe ici tout seul quand le gabarit est dans `LP_LARGES` (`K.forme` = son nom, posé par buildCar) ;
   les roues, les détails et les gabarits hors du tableau gardent leurs facettes. `?facettes=ancien` rend la grille d'avant ; `?fl=2` règle la tolérance
   à 2 cm pour toutes les caisses du tableau (banc) ; `dbgLarges()` lit ce qui a été retaillé (rangées et colonnes, avant → après). */
var FACETTES_LARGES=true,FL_FORCE=0;try{if(/[?&]facettes=ancien/.test(location.search))FACETTES_LARGES=false;const m9=/[?&]fl=([0-9.]+)/.exec(location.search);if(m9)FL_FORCE=+m9[1]/100;}catch(e){}
var LP_LARGES={ /* gabarit : {e : tolérance (m) · ec : tolérance des colonnes si autre · eo : tolérance vers l'EXTÉRIEUR (m, 4 mm) · fin : [d1 (m), coefficient, d2 (m)] tolérance × coefficient sur les d1 premiers mètres des deux bouts, rampe jusqu'à d2 (0 = non) · hi : [hauteur (m) ou null, tolérance (m)] au-dessus de cette hauteur, dans la cabine (les vitres : la découpe y est exigeante), la tolérance ne dépasse pas la valeur — 0 : la cabine garde toutes ses tranches (hi:0 = aucune protection) · col : [indices de colonnes à garder : une arête de couleur dessinée à la main] · L : longueur maximale d'une facette (m)} */
  /* (23/10) VIDE EN LIGNE : seule La Fidèle change (par ses couches), les autres caisses gardent leurs facettes tant que Léo n'a pas dit oui — le banc les règle à chaud (dbgLarges) */};
var LP_LARGES_BILAN={};
function lpLarges(zs,sec,paint,o){
  const M=zs.length,N=sec[0].length;if(M<6||N<5)return null;
  for(const s of sec)if(s.length!==N)return null;   /* (un loft dont les sections n'ont pas toutes le même nombre de points : on n'y touche pas) */
  let yMax=0;for(const s of sec)for(const q of s)if(q[1]>yMax)yMax=q[1];
  const e=FL_FORCE||o.e,eC=FL_FORCE||o.ec||e,Lmax=o.L||.6,z0=zs[0],z1=zs[M-1],
    fin=o.fin===0?null:o.fin||[.45,.2,.9],                          /* (les bouts : les 45 cm du nez et de la poupe à 20 % de la tolérance, puis la rampe jusqu'à 90 cm) */
    yH=o.hi===0?1e9:o.hi&&o.hi[0]!=null?o.hi[0]:.62*yMax,eH=o.hi&&o.hi[1]!=null?o.hi[1]:.012;     /* (la cabine : au-dessus de 62 % de la hauteur, la tolérance ne dépasse pas 1,2 cm) */
  const eo=o.eo||Math.min(e,.01);   /* (la tolérance vers l'EXTÉRIEUR : 1 cm au plus — la tôle retaillée ne déborde jamais de plus de 1 cm de la vraie, aucune pièce posée dessus, essuie-glaces, lamelles, optiques, ne s'enterre ; vers l'intérieur elle peut rentrer jusqu'à `e`) */
  const nrm=sec.map(s=>s.map((q,j)=>{const a=s[Math.max(0,j-1)],b=s[Math.min(N-1,j+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.sqrt(dx*dx+dy*dy);return l>1e-9?[dy/l,-dx/l]:[0,0];}));   /* (la normale SORTANTE de la demi-section : à droite du sens de marche, du dessous vers le toit) */
  const tolZ=z=>{if(!fin)return 1;const d=Math.min(z-z0,z1-z);return d<=fin[0]?fin[1]:d>=fin[2]?1:fin[1]+(1-fin[1])*(d-fin[0])/(fin[2]-fin[0]);};   /* (nez et poupe : c'est là que les phares, la calandre et les feux, découpés dans la tôle, s'appuient sur ses facettes) */
  const cab=[];for(let i=0;i<M;i++){let t=0;for(const q of sec[i])if(q[1]>t)t=q[1];cab.push(t>yH+.2);}   /* (les tranches de la CABINE : leur haut dépasse la ceinture de 20 cm — le capot et la malle n'en sont pas) */
  const cabM=cab.map((c,i)=>{if(c)return true;for(let k=i-1;k>=0&&zs[i]-zs[k]<.15;k--)if(cab[k])return true;for(let k=i+1;k<M&&zs[k]-zs[i]<.15;k++)if(cab[k])return true;return false;});
  const tolY=(y,i)=>y>yH&&cabM[i]?Math.min(1,eH/e):1;   /* (au-dessus de `hi`, dans la cabine seulement — les vitres, les montants, le pavillon, dont la découpe en dépend — la tolérance ne dépasse pas `eH`) */
  // la CLÉ DE PEINTURE de chaque case d'origine (rangée i entre les tranches i et i+1, colonne j entre les points j et j+1)
  const K0=[];for(let i=0;i<M-1;i++){const A=sec[i],C=sec[i+1],r=[];
    for(let j=0;j<N-1;j++){const a=A[j],b=A[j+1],c=C[j+1],d=C[j];r.push(paint(j,(zs[i]+zs[i+1])/2,(a[1]+b[1]+c[1]+d[1])/4,(a[0]+b[0]+c[0]+d[0])/4));}K0.push(r);}
  const crit=new Array(M).fill(false);   /* (une tranche où une matière change de l'une à l'autre case : sa frontière doit rester là) */
  for(let i=1;i<M-1;i++)for(let j=0;j<N-1;j++)if(K0[i-1][j]!==K0[i][j]){crit[i]=true;break;}
  // ---- LES RANGÉES : coupe récursive (Douglas-Peucker) de la suite des sections, l'écart se lit sur le point de section qui bouge le plus
  const garde=new Array(M).fill(false);garde[0]=garde[M-1]=true;
  const ecart=(a,b,i)=>{const t=(zs[i]-zs[a])/((zs[b]-zs[a])||1),A=sec[a],B=sec[b],C=sec[i],kz=tolZ(zs[i]);let m=0;   /* (l'écart de chaque point est rapporté à SA tolérance : 1 = la limite) */
    for(let j=0;j<N;j++){const dx=C[j][0]-(A[j][0]+(B[j][0]-A[j][0])*t),dy=C[j][1]-(A[j][1]+(B[j][1]-A[j][1])*t),n=nrm[i][j],sg=dx*n[0]+dy*n[1],   /* sg > 0 : la tôle retaillée rentre ; sg < 0 : elle déborde */
        d=sg>=0?sg/(e*kz*tolY(C[j][1],i)):-sg/(eo*kz);if(d>m)m=d;}return m;};
  const coupe=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let i=a+1;i<b;i++){if(crit[i]){bi=i;bd=1e9;break;}const d=ecart(a,b,i);if(d>bd){bd=d;bi=i;}}
    if(bd>1||zs[b]-zs[a]>Lmax){garde[bi]=true;coupe(a,bi);coupe(bi,b);}};
  coupe(0,M-1);
  const rows=[];for(let i=0;i<M;i++)if(garde[i])rows.push(i);
  // ---- LES COLONNES : on retire, une à une, celle qui coûte le moins, tant que la tôle reste à `eC` près et que la matière est la même des deux côtés
  const seg=(P,A,B,n)=>{const dx=B[0]-A[0],dy=B[1]-A[1],l2=dx*dx+dy*dy;let t=l2>1e-12?((P[0]-A[0])*dx+(P[1]-A[1])*dy)/l2:0;t=t<0?0:t>1?1:t;
    const ex=P[0]-A[0]-t*dx,ey=P[1]-A[1]-t*dy;return ex*n[0]+ey*n[1];};   /* (l'écart du point P à la corde AB, lu sur la normale sortante n : > 0 la corde rentre, < 0 elle déborde) */
  const meme=(l,r)=>{for(let q=0;q+1<rows.length;q++){const k0=K0[rows[q]][l];for(let j=l+1;j<r;j++)if(K0[rows[q]][j]!==k0)return false;}return true;};
  const cout=(l,r)=>{let m=0;for(let k=l+1;k<r;k++)for(const i of rows){const sg=seg(sec[i][k],sec[i][l],sec[i][r],nrm[i][k]),kz=tolZ(zs[i]),d=sg>=0?sg/(eC*kz*tolY(sec[i][k][1],i)):-sg/(eo*kz);if(d>m)m=d;}return m;};   /* (rapporté à la tolérance du point : 1 = la limite) */
  const tient=o.col||[];
  const cols=[];for(let j=0;j<N;j++)cols.push(j);
  for(;;){let bc=-1,bv=1e9;
    for(let c=1;c<cols.length-1;c++){if(tient.indexOf(cols[c])>=0)continue;const l=cols[c-1],r=cols[c+1];if(!meme(l,r))continue;const v=cout(l,r);if(v<=1&&v<bv){bv=v;bc=c;}}
    if(bc<0)break;cols.splice(bc,1);}
  return {zs:rows.map(i=>zs[i]),sec:rows.map(i=>cols.map(k=>sec[i][k])),
          paint:(j,z,y,x)=>j<0?paint(j,z,y,x):paint(cols[j],z,y,x),   /* (la bande j de la nouvelle grille porte la clé de la bande d'origine qu'elle commence) */
          bilan:[M,N,rows.length,cols.length]};
}
/* LA MÊME RETAILLE POUR LES CAISSES EN GRILLE (le Caïd, le Combi : `G[c][j]` = le point [x, y, z] de la colonne c — le long de la caisse — et de la rangée j —
   la hauteur). Une rangée ou une colonne ne reste que si, ôtée, ses points bougent de plus de `e` mètres par rapport à la droite tendue entre ses voisines
   (distance du point à la corde, en 3D) ; `jtient` : les rangées à garder (le dessous, repéré par son indice), `ctient(c)` : les colonnes à garder (le nez et la
   poupe, où la découpe au plan s'appuie sur la tôle). Rend {G, js, cs} : la grille retaillée et les indices d'origine des rangées et des colonnes gardées. */
var LP_GRILLES={};   /* (vide en ligne, voir LP_LARGES) */
function lpGrilleLarge(G,o){
  const NC=G.length,NR=G[0].length,e=FL_FORCE||o.e;if(NC<4||NR<4)return null;
  const d3=(P,A,B)=>{const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],l2=dx*dx+dy*dy+dz*dz;let t=l2>1e-12?((P[0]-A[0])*dx+(P[1]-A[1])*dy+(P[2]-A[2])*dz)/l2:0;t=t<0?0:t>1?1:t;
    const ex=P[0]-A[0]-t*dx,ey=P[1]-A[1]-t*dy,ez=P[2]-A[2]-t*dz;return Math.sqrt(ex*ex+ey*ey+ez*ez);};
  const gj=new Array(NR).fill(false),gc=new Array(NC).fill(false);gj[0]=gj[NR-1]=gc[0]=gc[NC-1]=true;
  for(const j of o.jtient||[])if(j<NR)gj[j]=true;
  if(o.ctient)for(let c=0;c<NC;c++)if(o.ctient(c))gc[c]=true;
  const rj=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let j=a+1;j<b;j++){if(gj[j]){bi=j;bd=1e9;break;}let m=0;for(let c=0;c<NC;c++){const d=d3(G[c][j],G[c][a],G[c][b]);if(d>m)m=d;}if(m>bd){bd=m;bi=j;}}
    if(bd>e){gj[bi]=true;rj(a,bi);rj(bi,b);}};
  rj(0,NR-1);
  const js=[];for(let j=0;j<NR;j++)if(gj[j])js.push(j);
  const cc=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let c=a+1;c<b;c++){if(gc[c]){bi=c;bd=1e9;break;}let m=0;for(const j of js){const d=d3(G[c][j],G[a][j],G[b][j]);if(d>m)m=d;}if(m>bd){bd=m;bi=c;}}
    if(bd>e){gc[bi]=true;cc(a,bi);cc(bi,b);}};
  cc(0,NC-1);
  const cs=[];for(let c=0;c<NC;c++)if(gc[c])cs.push(c);
  return {G:cs.map(c=>js.map(j=>G[c][j])),js:js,cs:cs,bilan:[NC,NR,cs.length,js.length]};
}
window.dbgLarges=function(o){if(o)for(const k in o){const T=k.charAt(0)==='_'?LP_GRILLES:LP_LARGES,n=k.charAt(0)==='_'?k.slice(1):k;if(o[k]===null)delete T[n];else T[n]=o[k];}   /* (« _caid » règle la grille du Caïd) */   /* (banc : dbgLarges({corolla:{e:.03,hi:[.9,.4]}}) règle à chaud, puis refaire la caisse) */
  return {actif:FACETTES_LARGES,force:FL_FORCE,bilan:LP_LARGES_BILAN,gabarits:LP_LARGES,grilles:LP_GRILLES};};
