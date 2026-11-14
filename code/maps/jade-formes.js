/* ===== LES FORMES DES ÎLOTS DE JADE (2026-11-14, Sacha : « pour jade travaille la variété de forme d'îlot ») =====
   MESURÉ AVANT (outils/banc-jade/formes.cjs, 8 vallées, passation/MAPS-PRO-JADE.md) : 19 gabarits pour 3 silhouettes — dix « carottes » à sommet plat, quatre fois
   le même cône, deux massifs, trois petits fûts. De près : 81 % de tours, une voisine sur cinq est le MÊME gabarit, jusqu'à 39 tours d'affilée au bord de la route.
   La cause : voxPilierG n'empile que des couches rondes autour d'UN axe vertical, et le rayon demandé choisissait le gabarit (jadeTplDe : 10 rayons, 10 montagnes).
   DÉSORMAIS :
   · LE MOULE À PLUSIEURS CORPS (voxFormeG) : une forme est une liste de CORPS (un fût : sa place, sa tranche de hauteur, son rayon, son profil le long de la hauteur,
     la course de son centre, sa part de dessous qui s'effile) coulés dans UNE grille. La hauteur est recoupée en TRANCHES ; dans chaque tranche, l'union des disques
     des corps présents. Tout ce qui lit un gabarit suit sans rien savoir : les chocs (jadePilierDans lit la grille), les arbres et les lianes (tops, cor, des),
     les quatre niveaux de détail (voxDemiG, voxMeshG) et les cubes fins (voxPilierFin lit les tranches : `ly[6]` = les disques EN PLUS du premier, unis par finUnionS).
   · QUINZE FAMILLES (JADE_FDEF) : la flèche (une vraie pointe), la mésa (le plateau à cascades), le champignon, le sablier, le croc penché, la toupie (le pic
     renversé natif), l'empilement (des blocs en équilibre), la table, l'île à deux étages, les pitons jumeaux reliés, la grappe, l'arche, la roche percée, le pont d'îles, et trois rochers
     (dalle, éclat, boule) — plus les sortes d'avant (colonne, gradins, tête large, île, massif), taillées par voxPilierG à la même graine : les mêmes au cube près.
   · LE CATALOGUE (JADE_CAT, 39 gabarits) : les 19 premiers gardent leur place et leur taille (les scènes de la descente Alléluia les demandent par leur rang).
   · LA PALETTE (jadePalette) : chaque vallée ne met en service que 19 gabarits (autant qu'avant : les appels de dessin bougent peu), sur l'ordinateur comme
     sur le téléphone, tirés par SA graine — deux vallées ne montrent plus les mêmes montagnes. Un gabarit n'est taillé que s'il sert (jadeGabUnG) ; au menu, le fond
     taille tout le catalogue tranche après tranche (jadeGabFond).
   · LE CHOIX (jadeFormeChoix) : plus « le rayon le plus proche » mais une NOTE — jamais le gabarit d'une voisine à moins de 260 m si un autre convient, pas la classe
     des voisines, pas la classe déjà trop vue dans la vallée (les tours d'avant plafonnées), pas trois fois la même classe d'affilée au bord ; et le quart de tour
     d'une jumelle inévitable est changé. Il tire sur SON générateur : jamais `jr`.
   · LA MÉMOIRE (jadeGeoCompacte) : les sommets d'un gabarit sont des ENTIERS (des coins de cubes) — positions sur 16 bits, normales et matière sur 8 : 11 octets par
     sommet au lieu de 32, la même image. C'est ce qui paie les vingt gabarits de plus.
   `?sans=jadeformes` : les 19 gabarits d'avant, le choix d'avant, les mêmes tirages de `jr` — la vallée d'avant au cube près (empreintes dans la passation).
   `?sans=jadecompact` : les tampons en flottants d'avant. Crochets : dbgJadePil(), dbgJadePan() (jade-secoue.js). */
const JADE_FORMES=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadeformes(,|&|$)/.test(location.search);
const JADE_JUM=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadejumelles(,|&|$)/.test(location.search);
const JADE_COMPACT=typeof location==='undefined'||!/[?&]sans=([^&]*,)?jadecompact(,|&|$)/.test(location.search);
function jfLisse(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x);}
/* LES FAMILLES — chacune rend ses CORPS : x, z (la place, en rayons) · y0, y1 (la tranche de hauteur, de 0 à 1) · r (le rayon, en rayons) · p(v) (le profil : le
   rayon le long du corps, v de 0 à 1) · lx(v), lz(v) (la course du centre, en rayons) · bas (la part du corps qui s'effile en dessous) · pb (la puissance de cet
   effilement : < 1 ventru, > 1 pointu) · rw (l'ampleur de la marche au hasard du rayon) · der (la dérive du centre) · dec (le décentrement de la pointe).
   ha, ca : les harmoniques et les cannelures du contour, adoucies pour les corps fins ; can : le nombre de cannelures. */
const JADE_FDEF={
  fleche:function(){return {ha:.7,ca:.7,corps:[{bas:.2,rw:.3,der:.1,p:function(v){return .1+1.04*Math.pow(1-v,.85);}}]};},
  mesa:function(rg){const e=.64+rg()*.14;return {ha:.8,corps:[{bas:.34,pb:.4,rw:.22,der:.06,p:function(v){return v>e?1:.88;}}]};}, /* la corniche : le haut déborde */
  champi:function(rg){const a=.54+rg()*.08;return {ha:.6,ca:.6,corps:[{bas:.14,rw:.2,der:.08,p:function(v){return v<a?.36:v<a+.14?.36+.64*jfLisse((v-a)/.14):1-.1*jfLisse((v-a-.14)/(1-a-.14));}}]};},
  sablier:function(rg){const c=.46+rg()*.12;return {corps:[{bas:.12,rw:.3,der:.1,p:function(v){const d=Math.abs(v-c)/(v<c?c:1-c);return .46+.54*Math.pow(d,1.5);}}]};},
  croc:function(rg){const a=rg()*6.283,k=1.15+rg()*.4,ca=Math.cos(a),sa=Math.sin(a);return {ha:.7,ca:.6,corps:[{bas:.18,rw:.3,der:.05,p:function(v){return .98-.72*v;},lx:function(v){return ca*k*Math.pow(v,1.7);},lz:function(v){return sa*k*Math.pow(v,1.7);}}]};},
  toupie:function(rg){return {ha:.8,corps:[{bas:.84+rg()*.06,pb:1.2,rw:.3,der:.06}]};},
  pile:function(rg,R,H){const n=H*VX>300?5:H*VX>150?4:3,B=[0],W=[];let s=0;for(let k=0;k<n;k++){s+=.7+rg()*.6;B.push(s);W.push(k?(.76+rg()*.3)*(1-.5*k/n):1);}for(let k=0;k<=n;k++)B[k]/=s; /* des blocs en équilibre l'un sur l'autre : des bulbes inégaux, un col entre deux */
    return {ha:.6,ca:.5,can:1,corps:[{bas:.1,rw:.2,der:.12,p:function(v){let k=0;while(k<n-1&&v>=B[k+1])k++;const u=Math.min(1,Math.max(0,(v-B[k])/(B[k+1]-B[k])));return W[k]*(.42+.58*Math.pow(Math.sin(Math.PI*u),.6));}}]};},
  table:function(){return {ha:.8,ca:.5,corps:[{bas:.72,pb:.42,rw:.15,der:.04}]};},
  etages:function(rg){const a=rg()*6.283;return {ha:.8,corps:[{y1:.62,bas:.78,pb:.85,rw:.25,der:.05},{x:Math.cos(a)*.3,z:Math.sin(a)*.3,y0:.5,r:.56,rw:.25,der:.05,p:function(v){return 1-.18*v;}}]};},
  jumeaux:function(rg){const z=(rg()-.5)*.3,hB=.72+rg()*.14,yp=.46+rg()*.14,C=[{x:-.6,r:.42,bas:.24,rw:.3,der:.08,p:function(v){return 1.04-.3*v;}},{x:.62,z:z,y0:.06+rg()*.08,y1:hB,r:.36,bas:.28,rw:.3,der:.08,p:function(v){return 1.02-.28*v;}}];
    for(let k=0;k<5;k++){const u=k/2-1;C.push({x:-.22+k*.125,z:z*k/4,y0:yp-.035*u*u,y1:yp+.1-.02*u*u,r:.17,bas:.6,pb:.5,rw:.12,der:.02,dec:.05});} /* le pont de roche : une chaîne de disques, le dessous en voûte */
    return {ha:.7,ca:.6,can:1,corps:C};},
  grappe:function(rg){const n=4+((rg()*2)|0),a0=rg()*6.283,C=[{y1:.3,r:.78,bas:.82,pb:.8,rw:.25,der:.05},{y0:.14,r:.36,rw:.25,der:.05,p:function(v){return 1-.78*v;}}];
    for(let k=0;k<n;k++){const a=a0+k*6.283/n+(rg()-.5)*.5,d=.46+rg()*.1,ca=Math.cos(a),sa=Math.sin(a),h=.48+rg()*.42,w=.26+rg()*.1,l=.12+rg()*.2;
      C.push({x:ca*d,z:sa*d,y0:.12,y1:h,r:w,rw:.25,der:.05,p:function(v){return 1-.74*Math.pow(v,1.2);},lx:function(v){return ca*l*v;},lz:function(v){return sa*l*v;}});}
    return {ha:.6,ca:.5,can:1,corps:C};},
  arche:function(rg){const ou=.7+rg()*.08,yc=.72+rg()*.06,C=[];
    for(const sg of [-1,1])C.push({x:sg*ou,z:(rg()-.5)*.12,y1:.92,r:.3,bas:.2,rw:.22,der:.04,dec:.1,p:function(v){return 1-.12*v;},lx:function(v){return -sg*.34*Math.pow(v,2.2);}}); /* deux jambes qui se penchent l'une vers l'autre */
    for(let k=-3;k<=3;k++){const u=k/3;C.push({x:u*(ou-.26),y0:yc+.07*(1-u*u),y1:1-.05*u*u-rg()*.02,r:.27,bas:.55,pb:.5,rw:.15,der:.03,dec:.05});} /* le linteau : sept disques, la clé plus haute */
    return {ha:.5,ca:.4,can:1,corps:C};},
  percee:function(rg){const w=.36+rg()*.06,C=[{y1:.36,r:.6,bas:.86,pb:.75,rw:.25,der:.05},{y0:.72,r:.62,bas:.5,pb:.5,rw:.25,der:.05,p:function(v){return 1-.32*v;}}];
    for(const sg of [-1,1])C.push({x:sg*.3,y0:.24,y1:.84,r:.33,rw:.2,der:.03,lx:function(v){return sg*w*Math.sin(Math.PI*v);}}); /* deux arcs qui s'écartent puis se rejoignent : l'œil */
    return {ha:.5,ca:.4,can:1,corps:C};},
  pont:function(rg){const z=(rg()-.5)*.3,yp=.6+rg()*.08,C=[{x:-.56,r:.44,bas:.72,pb:1,rw:.25,der:.05},{x:.62,z:z,y0:.1,y1:.84,r:.36,bas:.72,pb:1,rw:.25,der:.05}];
    for(let k=0;k<4;k++)C.push({x:-.2+k*.16,z:z*k/3,y0:yp-(k===0||k===3?.04:0),y1:yp+.12,r:.13,bas:.55,pb:.5,rw:.1,der:.02,dec:.05});
    return {ha:.7,ca:.5,corps:C};},
  dalle:function(){return {ha:.9,corps:[{bas:.6,pb:.4,rw:.2,der:.05}]};},
  boule:function(){return {ha:.8,corps:[{rw:.2,der:.05,p:function(v){return Math.sqrt(Math.max(.06,1-(2*v-1)*(2*v-1)));}}]};}
};
/* LE CATALOGUE — r, h : rayon et hauteur (m) · k : la sorte d'AVANT (taillée par voxPilierG, à la graine g d'avant) ou f : la famille (voxFormeG) · cl : la classe de
   silhouette (ce que l'œil distingue de loin) · grp : G les grandes (rangs 0 à 9, celles que les scènes demandent), R les rochers, I les îles, M les massifs, X les
   moyennes · haut : elle peut se dresser au bord de la route ou servir de tour à une scène · des : elle peut flotter au-dessus de la route ou servir d'île ·
   plat : son sommet est son plus grand rayon (une cascade peut en tomber) · casc : ses cascades à elle · droit : jamais renversée. */
const JADE_CAT=(function(){const C=[],a=function(o){C.push(o);};
  a({r:10,h:190,f:'fleche',cl:'flèche',grp:'G',haut:1});a({r:14,h:250,k:0,cl:'tour',grp:'G',haut:1});a({r:16,h:220,k:3,cl:'tour',grp:'G',haut:1});a({r:18,h:300,k:2,cl:'tour',grp:'G',haut:1});
  a({r:23,h:350,f:'sablier',cl:'sablier',grp:'G',haut:1});a({r:24,h:330,f:'croc',cl:'croc',grp:'G',haut:1});a({r:29,h:400,k:0,cl:'tour',grp:'G',haut:1});
  a({r:36,h:440,f:'pile',cl:'empilement',grp:'G',haut:1});a({r:45,h:490,f:'fleche',cl:'flèche',grp:'G',haut:1});a({r:56,h:540,k:3,cl:'tour',grp:'G',haut:1});
  for(let v=0;v<3;v++)a({r:6.5+v*2.2,h:20+v*7.5,k:v%3,g:0xCA11+v*71,cl:'rocher',grp:'R'});
  a({r:8,h:16,k:4,g:0x11E0,cl:'île',grp:'I',des:1,plat:1});a({r:13,h:11,f:'table',cl:'table',grp:'I',des:1,plat:1});a({r:21,h:64,f:'toupie',cl:'toupie',grp:'I',des:1,plat:1});a({r:31,h:58,f:'etages',cl:'étages',grp:'I',des:1});
  a({r:64,h:128,k:5,g:0x11E0+4*97,cl:'massif',grp:'M'});a({r:78,h:96,f:'mesa',cl:'mésa',grp:'M',casc:3,droit:1,plat:1});
  a({r:34,h:44,f:'mesa',cl:'mésa',grp:'X',casc:2,droit:1,plat:1,des:1});a({r:47,h:60,f:'mesa',cl:'mésa',grp:'X',casc:2,droit:1,plat:1});
  a({r:22,h:120,f:'champi',cl:'champignon',grp:'X'});a({r:30,h:215,f:'champi',cl:'champignon',grp:'X',haut:1});
  a({r:38,h:150,f:'arche',cl:'arche',grp:'X',haut:1});a({r:46,h:100,f:'arche',cl:'arche',grp:'X'});a({r:34,h:130,f:'percee',cl:'percée',grp:'X'});
  a({r:26,h:230,f:'grappe',cl:'grappe',grp:'X',haut:1});a({r:30,h:280,f:'jumeaux',cl:'jumeaux',grp:'X',haut:1});
  a({r:15,h:165,f:'croc',cl:'croc',grp:'X',haut:1});a({r:25,h:115,f:'toupie',cl:'toupie',grp:'X',des:1,plat:1});a({r:22,h:200,f:'pile',cl:'empilement',grp:'X',haut:1});
  a({r:19,h:165,f:'sablier',cl:'sablier',grp:'X',haut:1});a({r:15,h:150,f:'fleche',cl:'flèche',grp:'X',haut:1});a({r:40,h:70,f:'pont',cl:'pont',grp:'X',des:1});
  a({r:21,h:40,k:4,g:0x11E0+2*97,cl:'île',grp:'X',des:1,plat:1});a({r:40,h:380,f:'jumeaux',cl:'jumeaux',grp:'X',haut:1});
  a({r:10,h:7,f:'dalle',cl:'rocher',grp:'R'});a({r:6,h:30,f:'croc',cl:'rocher',grp:'R'});a({r:8,h:16,f:'boule',cl:'rocher',grp:'R'});
  for(let k=0;k<C.length;k++){const c=C[k];if(c.g==null)c.g=c.k!=null?0x51A0+k*131:0xF0A0+k*193;c.nom=c.f||['colonne','aiguille','gradins','tête large','île','massif'][c.k];}
  return C;})();
function jadeRocher(t){return JADE_FORMES?!!(JADE_CAT[t]&&JADE_CAT[t].grp==='R'):t>=JADE_NTPL;} /* un rocher qui flotte autour d'une montagne ; `?sans=jadeformes` : le test d'avant (« tout ce qui suit JADE_NTPL », îles et massifs compris), compteurs et étiquettes d'avant (vérificateur du 2026-11-14) */
/* LA MÉMOIRE D'UN GABARIT : ses sommets sont des coins de cubes (des entiers), ses normales −1/0/1, sa matière 1 à 10, son ombre 0, 1/3, 2/3 ou 1 — 6 + 3 + 1 + 1
   octets au lieu de 32, les mêmes valeurs dans le programme. Une géométrie qui ne s'y prête pas (un sommet non entier) est rendue telle quelle ; une ombre qui
   ne tombe pas sur un 255e (les cubes fins : 0,92) reste en flottant. */
function jadeGeoCompacte(g){if(!JADE_COMPACT||!g||!g.attributes.position||!g.attributes.aM)return g;
  const P=g.attributes.position.array,Nm=g.attributes.normal.array,M=g.attributes.aM.array,A=g.attributes.aAO.array,n=M.length;
  if(!(P instanceof Float32Array))return g;
  for(let i=0;i<P.length;i++){const v=P[i];if(v!==Math.round(v)||v<-32768||v>32767)return g;}
  const c=new THREE.BufferGeometry(),A8=new Uint8Array(n);let ok=true;
  for(let i=0;i<n&&ok;i++){const b=Math.round(A[i]*255);if(Math.fround(b/255)!==A[i])ok=false;A8[i]=b;}
  c.setAttribute('position',new THREE.BufferAttribute(Int16Array.from(P),3));c.setAttribute('normal',new THREE.BufferAttribute(Int8Array.from(Nm),3));
  c.setAttribute('aM',new THREE.BufferAttribute(Uint8Array.from(M),1));c.setAttribute('aAO',ok?new THREE.BufferAttribute(A8,1,true):g.attributes.aAO);
  c.setIndex(g.index);c.boundingSphere=g.boundingSphere;return c;}
/* L'UNION de deux listes d'intervalles triés [a,b, a,b…] (voir finDiff, finInter), puis de deux contours {j0, R : les rangs} — les cubes fins d'une forme à plusieurs corps */
function finUnion(A,B){const o=[];let i=0,j=0;
  while(i<A.length||j<B.length){let a,b;if(j>=B.length||(i<A.length&&A[i]<=B[j])){a=A[i];b=A[i+1];i+=2;}else{a=B[j];b=B[j+1];j+=2;}
    const n=o.length;if(n&&o[n-1]>=a){if(b>o[n-1])o[n-1]=b;}else o.push(a,b);}
  return o;}
function finUnionS(A,B){const j0=Math.min(A.j0,B.j0),j1=Math.max(A.j0+A.R.length,B.j0+B.R.length),R=[];
  for(let j=j0;j<j1;j++){const a=j>=A.j0&&j<A.j0+A.R.length?A.R[j-A.j0]:FIN_VIDE,b=j>=B.j0&&j<B.j0+B.R.length?B.R[j-B.j0]:FIN_VIDE;R.push(!a.length?b:!b.length?a:finUnion(a,b));}
  return {j0:j0,R:R};}
/* UNE FORME EN CUBES — F : sa famille (JADE_FDEF), Rm, Hm : rayon et hauteur (m). Rend la même fiche que voxPilierG (G, M, H, Hb, yTop, rmax, N, ly, harm, can, tr,
   graine, tops, cor, des, geo), plus `coeur` (une case pleine connue : le témoin de l'audit — le centre d'une arche est vide), `parts` (le nombre de corps, s'il y en
   a plusieurs), `fmin` (le plancher du contour, pour les cubes fins) et `trous` (les tranches sans roche : il ne doit pas y en avoir). Un GÉNÉRATEUR (voir LES TRANCHES). */
function* voxFormeG(F,Rm,Hm,graine){
  const rg=mulberry32(graine),R=Rm/VX,H=Math.max(3,Math.round(Hm/VX)),D=F(rg,R,H),FMIN=.2;
  const harm=[];for(let k=2;k<=5;k++)harm.push([k,(.05+rg()*.11)*(k===2?1.35:1)*(D.ha||1),rg()*6.283]);
  const can=[];for(let k=0,nc=D.can!=null?D.can:2+((rg()*2.6)|0);k<nc;k++)can.push([rg()*6.283,.18+rg()*.2,(.22+rg()*.2)*(D.ca||1)]);
  const tr=[];for(let k=0,nt=1+((rg()*2.4)|0);k<nt;k++)tr.push([rg()*6.283,.12+rg()*.14,(.4+rg()*.55)*H,(.15+rg()*.3)*H]);
  /* le contour, lu dans une table de 720 angles (le même f(angle) que voxPilierG, plancher FMIN) */
  const NA=720,FA=new Float32Array(NA);let fHi=0;
  for(let a=0;a<NA;a++){const an=-Math.PI+(a+.5)/NA*6.283185307179586;let f=1;for(const hq of harm)f+=hq[1]*Math.cos(hq[0]*an+hq[2]);
    for(const c of can){const da=Math.abs(((an-c[0])%6.2832+9.4248)%6.2832-3.1416);if(da<c[1])f-=c[2]*(1-da/c[1]);}
    FA[a]=f<FMIN?FMIN:f;if(FA[a]>fHi)fHi=FA[a];}
  /* les COUCHES de chaque corps : [y0, y1, cx, cz, rayon, dessous] */
  const LA=[];let Hb0=0;
  for(let n=0;n<D.corps.length;n++){const c=D.corps[n],Y0=Math.max(0,Math.min(H-1,Math.round((c.y0||0)*H))),Y1=Math.max(Y0+1,Math.min(H,Math.round((c.y1==null?1:c.y1)*H))),hc=Y1-Y0,
      Hb=c.bas?Math.max(1,Math.round(hc*c.bas)):0,Rc=R*(c.r==null?1:c.r),bA=rg()*6.283,bK=c.dec==null?.22+rg()*.3:c.dec,pb=c.pb||.62,am=c.rw==null?.5:c.rw,dv=(c.der==null?.25:c.der)*Rc,mince=hc<10;
    if(n===0)Hb0=Hb;let y=Y0,dx=0,dz=0,rw=0;
    while(y<Y1){const bas=y<Y0+Hb,h=bas||mince?1+((rg()*1.6)|0):2+((rg()*5)|0),y1=Math.min(Y1,y+h),ym=(y+y1)/2-Y0,v=ym/hc;
      rw=rw*.6+(rg()-.5)*.17;let s=(c.p?c.p(v):1)+rw*am,ox=0,oz=0;
      if(bas){const t=Math.min(1,ym/Hb);s*=Math.pow(t,pb)*(.82+.18*t);const k9=(1-t)*(1-t)*bK*Rc;ox=Math.cos(bA)*k9;oz=Math.sin(bA)*k9;}
      else{dx=Math.max(-dv,Math.min(dv,dx+(rg()-.5)*.7));dz=Math.max(-dv,Math.min(dv,dz+(rg()-.5)*.7));}
      LA.push([y,y1,(c.x||0)*R+(c.lx?c.lx(v)*R:0)+dx+ox,(c.z||0)*R+(c.lz?c.lz(v)*R:0)+dz+oz,Math.max(bas?.55:1.15,Rc*s),bas?1:0]);y=y1;}}
  /* la grille : l'emprise de tous les disques, recentrée */
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,yM=0;for(const l of LA){const e=l[4]*fHi;if(l[2]-e<x0)x0=l[2]-e;if(l[2]+e>x1)x1=l[2]+e;if(l[3]-e<z0)z0=l[3]-e;if(l[3]+e>z1)z1=l[3]+e;if(l[1]>yM)yM=l[1];}
  const M=2*Math.ceil((Math.max(x1-x0,z1-z0)/2+2)/2),N=2*M,ax=M-(x0+x1)/2,az=M-(z0+z1)/2;for(const l of LA){l[2]+=ax;l[3]+=az;}
  const G=voxG(N,yM+2,N),D9=G.d,NN=N*N;
  /* les TRANCHES : entre deux bords de couche, l'union des disques présents (le plus large d'abord : c'est lui que lisent la rouille et la silhouette) */
  const bords=new Set([0]);for(const l of LA){bords.add(l[0]);bords.add(l[1]);}
  const BR=Array.from(bords).sort(function(p,q){return p-q;}),LY=[],msk=new Uint8Array(NN);let trous=0;
  for(let b=0;b+1<BR.length;b++){if(performance.now()>JF.lim)yield;const ya=BR[b],yb=BR[b+1],ds=[];for(const l of LA)if(l[0]<=ya&&l[1]>=yb)ds.push(l);
    if(!ds.length){trous++;continue;}
    ds.sort(function(p,q){return q[4]-p[4];});const m=ds[0];
    LY.push(ds.length>1?[ya,yb,m[2],m[3],m[4],m[5],ds.slice(1).map(function(l){return [l[2],l[3],l[4]];})]:[ya,yb,m[2],m[3],m[4],m[5]]);
    msk.fill(0);
    for(const l of ds){const cx=l[2],cz=l[3],rr=l[4],e=rr*fHi,e2=e*e,i0=Math.max(0,Math.floor(cx-e)),i1=Math.min(N-1,Math.ceil(cx+e)),j0=Math.max(0,Math.floor(cz-e)),j1=Math.min(N-1,Math.ceil(cz+e));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const ex=i+.5-cx,ez=j+.5-cz,d2=ex*ex+ez*ez;if(d2>e2)continue;
        let a9=((Math.atan2(ez,ex)+Math.PI)/6.283185307179586*NA)|0;if(a9>=NA)a9=NA-1;const lim=rr*FA[a9];if(d2<lim*lim)msk[i+N*j]=1;}}
    for(let yy=ya;yy<yb;yy++){const o=NN*yy;for(let k=0;k<NN;k++)if(msk[k])D9[o+k]=JM.roche;}}
  /* LA ROUILLE en coulées sur la peau (comme voxPilierG) */
  for(let yy=0;yy<yM;yy++){if(!(yy&15)&&performance.now()>JF.lim)yield;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy);if(D9[k0]!==JM.roche)continue;
    if((i+1<N&&D9[k0+1])&&(i>0&&D9[k0-1])&&(j+1<N&&D9[k0+N])&&(j>0&&D9[k0-N]))continue;
    const an=Math.atan2(j+.5-M,i+.5-M);
    for(const t of tr){const da=Math.abs(((an-t[0])%6.2832+9.4248)%6.2832-3.1416);if(da<t[1]&&yy<t[2]&&yy>t[2]-t[3]&&rg()<.9){D9[k0]=JM.rouille;break;}}}}
  /* LA VIE : l'herbe sur ce qui regarde le ciel ; `tops` : les cases d'un plateau à ciel ouvert (la forêt) ; `cor` : les corniches qui ont 14 m d'air au-dessus
     d'elles (pas de pin sous un chapeau) ; `des` : les dessous qui ont 20 m de vide sous eux (les lianes pendent dans l'air, sous un chapeau ou un linteau aussi) */
  if(performance.now()>JF.lim)yield;
  const tops=[],cor=[],des=[],air=Math.max(2,Math.ceil(14/VX)),vide=Math.max(2,Math.ceil(20/VX)),ny=G.ny;
  for(let yy=Hb0;yy<yM;yy++)for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy);if(!D9[k0]||D9[k0+NN])continue;
    D9[k0]=JM.herbe;let lib=0,ciel=true;for(let y2=yy+1;y2<ny;y2++){if(D9[k0+(y2-yy)*NN]){ciel=false;break;}lib++;}
    if(!ciel&&lib<air)continue;
    const nv=(i>0&&D9[k0-1]?1:0)+(i+1<N&&D9[k0+1]?1:0)+(j>0&&D9[k0-N]?1:0)+(j+1<N&&D9[k0+N]?1:0);
    (ciel&&nv>=3?tops:cor).push([i,yy,j]);}
  for(let yy=1;yy<yM;yy++)for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k0=i+N*(j+N*yy),m=D9[k0];if(m!==JM.roche&&m!==JM.rouille)continue;if(D9[k0-NN])continue;
    let lib=0;for(let y2=yy-1;y2>=0&&lib<vide;y2--){if(D9[k0-(yy-y2)*NN])break;lib++;}
    if(lib>=Math.min(vide,yy))des.push([i,yy,j]);}
  let yTop=0,rmax=0;for(let i=0;i<N;i++)for(let j=0;j<N;j++){let yh=-1;for(let yy=ny-1;yy>=0;yy--)if(D9[i+N*(j+N*yy)]){yh=yy;break;}
    if(yh>=0){yTop=Math.max(yTop,yh+1);rmax=Math.max(rmax,Math.hypot(i+.5-M,j+.5-M)+.71);}}
  /* le témoin : une case pleine, au cœur du disque le plus large vers les 3/5 de la hauteur */
  let coeur=null;{const yc=Math.min(yM-1,Math.floor(yM*.6));for(const l of LY)if(yc>=l[0]&&yc<l[1]){const i=Math.max(0,Math.min(N-1,Math.floor(l[2]))),j=Math.max(0,Math.min(N-1,Math.floor(l[3])));if(D9[i+N*(j+N*yc)])coeur=[i,yc,j];break;}
    if(!coeur)for(let k=0;k<D9.length&&!coeur;k++)if(D9[k])coeur=[k%N,Math.floor(k/NN),Math.floor((k%NN)/N)];}
  if(performance.now()>JF.lim)yield;
  const G1=(yield* voxDemiG(G)),G2=(yield* voxDemiG(G1)),G3=(yield* voxDemiG(G2));
  const geo=[yield* voxMeshG(G,4),yield* voxMeshG(G1,2),yield* voxMeshG(G2,1),yield* voxMeshG(G3)];
  return {G:G,M:M,H:yM,Hb:Hb0,yTop:yTop,rmax:rmax,N:N,ly:LY,harm:harm,can:can,tr:tr,graine:graine,tops:tops,cor:cor,des:des,geo:geo,coeur:coeur,parts:D.corps.length>1?D.corps.length:0,fmin:FMIN,trous:trous};}
/* ---- LES GABARITS, UN PAR UN (formes allumées) : GABF.p est LA liste (JADE.geos.p), à trous — un gabarit n'existe que s'il a servi ou que le fond l'a taillé ---- */
const GABF={p:[],it:null,k:-1,n:0};
function* jadeGabUnG(k){if(GABF.p[k])return GABF.p[k];const c=JADE_CAT[k];
  const T9=c.k!=null?(yield* voxPilierG(c.r/VX,Math.max(4,Math.round(c.h/VX)),c.k,c.g)):(yield* voxFormeG(JADE_FDEF[c.f],c.r,c.h,c.g));
  if(GABF.p[k])return GABF.p[k]; /* (taillé entre-temps par un autre chemin : celui-là est déjà en service) */
  T9.geo=T9.geo.map(jadeGeoCompacte);T9.fam=c.nom;T9.classe=c.cl;if(T9.trous)T9.finX=1; /* (une forme trouée ne passe pas aux cubes fins : ils supposent des tranches jointives) */
  GABF.p[k]=T9;GABF.n++;return T9;}
function jadeGeosBase(){return JADE.geos||{p:GABF.p,pag:jadeTempleGeo(5),pav:jadeTempleGeo(1),arbreQ:new THREE.PlaneGeometry(1,1),ms:0};}
function* jadeGabPalG(L9){ /* les gabarits d'une palette (ou d'une liste), là où ils en sont — d'abord celui que le fond a laissé en cours */
  const t0=performance.now();if(GABF.it){const it=GABF.it;GABF.it=null;yield* it;}
  for(const k of L9)if(!GABF.p[k])yield* jadeGabUnG(k);
  GAB_FOND.ms+=performance.now()-t0;if(JADE.geos)JADE.geos.ms=Math.round(GAB_FOND.ms);}
function jadeGabFondFormes(){ /* une tranche par image, au menu : tout le catalogue, les grandes d'abord (voir jadeGabFond) */
  const t=performance.now(),l0=JF.lim;
  if(!GABF.it){let k=-1;for(let i=0;i<JADE_CAT.length;i++)if(!GABF.p[i]){k=i;break;}
    if(k<0){GAB_FOND.fini=true;const g=jadeGeosBase();g.ms=Math.round(GAB_FOND.ms);JADE.geos=g;return;}
    GABF.it=jadeGabUnG(k);}
  JF.lim=t+PAL.b('gabFondMs',6);chauffeGrace();
  let r;try{r=GABF.it.next();}catch(e){GABF.it=null;GAB_FOND.fini=true;console.warn('gabarits',e);return;}finally{JF.lim=l0;GAB_FOND.ms+=performance.now()-t;GAB_FOND.n++;}
  if(r.done)GABF.it=null;}
/* LA PALETTE D'UNE VALLÉE : les gabarits en service, tirés par sa graine — 19 sur l'ordinateur comme sur le téléphone, autant qu'avant (les appels de dessin) :
   5 grandes, 3 rochers, 3 îles, 1 massif, 7 moyennes (banc 2026-11-14 : 24 sur l'ordi coûtait trop d'appels ; 16 sur le téléphone laissait 13 % de jumelles). Toujours deux petites grandes (le bord de la route), deux très grandes (les tours des scènes), une mésa, un champignon,
   une arche ou une roche percée, une forme à plusieurs fûts, une fine qui tient au bord. */
function jadePalette(seed){
  {const m=typeof location!=='undefined'&&/[?&]jpal=(tout|[0-9,]+)/.exec(location.search); /* (banc) `?jpal=tout` : tout le catalogue en service ; `?jpal=19,23,25` : cette palette-là (les rochers 10, 11, 12 s'y ajoutent s'il n'y en a pas) */
   if(m){const t=m[1]==='tout'?JADE_CAT.map(function(c,k){return k;}):m[1].split(',').map(Number).filter(function(k){return JADE_CAT[k];});let R9=t.filter(function(k){return JADE_CAT[k].grp==='R';});if(!R9.length){R9=[10,11,12];for(const k of R9)t.push(k);}t.sort(function(p,q){return p-q;});return {t:t,R:R9};}}
  const r=mulberry32((seed^0x9A1E77E)>>>0),pio=function(a,n){a=a.slice();const o=[];while(o.length<n&&a.length)o.push(a.splice((r()*a.length)|0,1)[0]);return o;};
  const G9=pio([0,1,2,3],2).concat(pio([4,5,6],1),pio([7,8,9],2)),R9=pio([10,11,12,36,37,38],3),I9=pio([13,14,15,16],3),M9=pio([17,18],1);
  const X9=pio([19,20],1).concat(pio([21,22],1),pio([23,24,25],1),pio([26,27,35],1),pio([28,30,31,32],1)),reste=[];
  for(let k=19;k<=35;k++)if(X9.indexOf(k)<0)reste.push(k);
  const t=G9.concat(R9,I9,M9,X9,pio(reste,2));t.sort(function(p,q){return p-q;});
  return {t:t,R:R9.slice().sort(function(p,q){return p-q;})};}
/* LE CHOIX D'UNE FORME (une par pose) — PG : la grille des montagnes posées (jadeBatit), PGC : son pas. Contextes : `rang` (les rangs au hasard), `bord` (au ras de
   la route : une forme haute), `dessus` (au-dessus de la route) et `ile` (une forme basse), `massif`. */
function jadeFormeChoix(seed,G,PG,PGC){
  const fr=mulberry32((seed^0x51F07E)>>>0),PAL9=jadePalette(seed),C=JADE_CAT,nT=new Map(),nC=new Map();let nTot=0,dern=['',''];
  const tous=PAL9.t.filter(function(k){return C[k].grp!=='R';});
  const vois=function(cx,cz,D,cb){const n=Math.ceil(D/PGC),bx=Math.floor(cx/PGC),bz=Math.floor(cz/PGC);
    for(let dx=-n;dx<=n;dx++)for(let dz=-n;dz<=n;dz++){const a=PG.get((bx+dx)+','+(bz+dz));if(a)for(const q of a){const d=Math.hypot(q[0]-cx,q[1]-cz);if(d<D)cb(q,d);}}};
  const note=function(L9,r,cx,cz){const dT=new Map(),dC=new Map();
    vois(cx,cz,260,function(q,d){const t=q[5],c=C[t];if(!c||c.grp==='R')return;if(!(dT.get(t)<=d))dT.set(t,d);dC.set(c.cl,(dC.get(c.cl)||0)+(1-d/260));});
    return L9.map(function(k){const c=C[k],d=dT.get(k);let p=fr()*3;
      if(d!=null)p+=45+60*(1-d/260);                                                                /* une voisine du même gabarit : presque un refus */
      p+=9*(dC.get(c.cl)||0);                                                                       /* la classe des voisines */
      p+=40*Math.max(0,((nC.get(c.cl)||0)+1)/(nTot+4)-(c.cl==='tour'?.3:.16));                      /* la classe déjà trop vue dans la vallée */
      p+=5*((nT.get(k)||0)+1)/(nTot/L9.length+2);                                                   /* le gabarit déjà trop servi */
      p+=7*Math.abs(Math.log(c.r/r));                                                               /* la taille demandée */
      return [p,k];}).sort(function(a,b){return a[0]-b[0];}).map(function(a){return a[1];});};
  const CTX={rang:function(c){return c.grp!=='M';},bord:function(c){return !!c.haut;},dessus:function(c){return !!c.des;},ile:function(c){return c.grp==='I'||!!c.des;},massif:function(c){return c.grp==='M'||(c.cl==='mésa'&&c.r>40);}};
  const proches9=function(L9,r,n){return L9.slice().sort(function(a,b){return Math.abs(Math.log(C[a].r/r))-Math.abs(Math.log(C[b].r/r));}).slice(0,n);};
  const O={pal:PAL9,nT:nT,nC:nC,
    liste:function(r,ctx,cx,cz,rmM){let L9=tous.filter(function(k){return CTX[ctx](C[k])&&G.p[k]&&(!rmM||G.p[k].rmax*VX<=rmM);});if(!L9.length)return L9;
      let W=L9.filter(function(k){return C[k].r>=r*.6&&C[k].r<=r*1.5;});if(!W.length)W=proches9(L9,r,2);
      if(JADE_JUM){const J=new Set();vois(cx,cz,260,function(q){J.add(q[5]);});if(W.every(function(k){return J.has(k);})){const W3=L9.filter(function(k){return !J.has(k)&&C[k].r>=r*.4&&C[k].r<=r*2.2;});if(W3.length)W=W.concat(W3);}} /* (2026-11-14, vérificateurs : « jamais deux voisins identiques ») toute la fenêtre de taille a déjà sa jumelle à moins de 260 m : on élargit la taille plutôt que de reposer le même gabarit — `?sans=jadejumelles` */
      if(ctx==='bord'&&dern[0]&&dern[0]===dern[1]){let W2=W.filter(function(k){return C[k].cl!==dern[0];});if(!W2.length)W2=proches9(L9.filter(function(k){return C[k].cl!==dern[0];}),r,2);if(W2.length)W=W2;} /* jamais trois fois la même classe d'affilée au bord */
      return note(W,r,cx,cz);},
    choix:function(r,ctx,cx,cz,rmM){const L9=O.liste(r,ctx,cx,cz,rmM);return L9.length?L9[0]:-1;},
    /* la suite des essais d'une pose au bord : les mieux notées autour du rayon demandé, puis toutes les autres du contexte, de la plus fine à la plus large */
    suite:function(r,ctx,cx,cz,rmM){const A=O.liste(r,ctx,cx,cz,rmM);return A.concat(tous.filter(function(k){return CTX[ctx](C[k])&&G.p[k]&&A.indexOf(k)<0&&(!rmM||G.p[k].rmax*VX<=rmM);}).sort(function(a,b){return G.p[a].rmax-G.p[b].rmax;}));},
    /* les tours d'une scène : assez hautes d'abord (span), dans le cercle demandé (rM, m), puis à la note */
    tours:function(rM,span,cx,cz){const L9=tous.filter(function(k){return C[k].haut&&G.p[k]&&G.p[k].rmax*VX<=rM;});if(!L9.length)return L9;
      const N9=note(L9,rM/1.2,cx,cz);return N9.filter(function(k){return G.p[k].yTop*VX>=span;}).concat(N9.filter(function(k){return G.p[k].yTop*VX<span;}));},
    /* les îles d'une scène : la mieux notée autour du rayon demandé, puis de plus petites (trois essais, comme avant) */
    iles:function(r,massif,plat,cx,cz){let L9=tous.filter(function(k){return CTX[massif?'massif':'ile'](C[k])&&G.p[k]&&(!plat||C[k].plat);});if(!L9.length)L9=tous.filter(function(k){return CTX.ile(C[k])&&G.p[k];});if(!L9.length)return L9;
      let W=L9.filter(function(k){return C[k].r>=r*.6&&C[k].r<=r*1.5;});if(!W.length)W=proches9(L9,r,2);
      const t0=note(W,r,cx,cz)[0];return [t0].concat(L9.filter(function(k){return k!==t0&&C[k].r<C[t0].r;}).sort(function(a,b){return C[b].r-C[a].r;})).slice(0,3);},
    roc:function(u){return PAL9.R[Math.min(PAL9.R.length-1,(u*PAL9.R.length)|0)];},
    /* le quart de tour : pas celui d'une jumelle (même gabarit, même sens) à moins de 420 m */
    rot:function(t,cx,cz,rot,inv){const dm=[1e9,1e9,1e9,1e9];vois(cx,cz,420,function(q,d){if(q[5]===t&&(!!q.inv)===(!!inv)&&d<dm[q[6]&3])dm[q[6]&3]=d;});
      if(dm[rot]>=1e9)return rot;let b=rot;for(let k=1;k<4;k++){const r2=(rot+k)&3;if(dm[r2]>dm[b])b=r2;}return b;}, /* (les quatre déjà pris : celui dont la jumelle est la plus loin) */
    pose:function(q){const c=C[q[5]];if(!c||c.grp==='R')return;nT.set(q[5],(nT.get(q[5])||0)+1);nC.set(c.cl,(nC.get(c.cl)||0)+1);nTot++;},
    bord:function(t){dern=[dern[1],C[t].cl];},
    droit:function(t){return !!C[t].droit;}};
  return O;}
/* un panneau (arbre, liane, cristal : un cylindre vertical de rayon r, de y0 à y1) qui n'entre PAS dans le couloir de conduite, DANS LE REPÈRE DE LA DALLE (demi-largeur + 1,5 m, de 0 à 7,5 m
   au-dessus d'elle) — la garde d'avant comptait des hauteurs verticales depuis l'axe de la route : dans un dévers ou un demi-tonneau, le bord de la dalle est ailleurs */
function jadePanLibre(proches,x,z,r,y0,y1){let ok=true;const rr=r+ROAD_HALF+16;
  proches(x,z,rr,function(i){if(!ok)return;const p=pts[i];if(p.y<y0-40||p.y>y1+40)return;const ex=x-p.x,ez=z-p.z;if(ex*ex+ez*ez>rr*rr)return;const t=T[i],b=B[i],n=Nn[i];
    for(let y=y0;;y+=2){if(y>y1)y=y1;const ey=y-p.y;
      for(let k=-1;k<8;k++){const ax=k<0?ex:ex+Math.cos(k*.7854)*r,az=k<0?ez:ez+Math.sin(k*.7854)*r,lo=ax*t.x+ey*t.y+az*t.z;if(lo>8||lo<-8)continue;
        const la=ax*b.x+ey*b.y+az*b.z;if(la>ROAD_HALF+1.5||la<-ROAD_HALF-1.5)continue;const h=ax*n.x+ey*n.y+az*n.z;if(h>0&&h<7.5){ok=false;return;}}
      if(y>=y1)break;}});
  return ok;}
/* une cascade qui ne traverse PAS le couloir de conduite (le chemin de sa nappe, comme le shader : voir jadeChutes) — `proches` : la grille de la route de jadeBatit */
function jadeCascLibre(proches,c){
  const dt=Math.min(.05,5/Math.max(1,c[6])); /* un point tous les 5 m de chute au plus : la nappe est un ruban de la largeur r autour de son axe, quel que soit le regard (jadePanLibre : l'axe et 8 points du bord) */
  for(let t=0;t<=1.0001;t+=dt){const e=c[5]*.4+t*t*c[6]*.07,y=c[1]-t*c[6];if(!jadePanLibre(proches,c[0]+c[3]*e,c[2]+c[4]*e,c[5]*(.5+t*1.4)*.5,y-3,y+3))return false;}
  return true;}
