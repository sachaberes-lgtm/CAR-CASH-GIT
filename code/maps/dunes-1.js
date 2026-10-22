/* <<<DUNES>>> */
/* =========================== LES DUNES D'OR — LE SURF (2026-10-20, Sacha : « refonte totale de la map Dune : plein de petits segments de route posés sur les dunes,
   on surfe de dune en dune ; on démarre en haut, sur de grosses collines, et on descend peu à peu ; le portail se voit au loin entre trois pyramides ») ===========================
   LE CONCEPT : il n'y a plus UNE route continue. Un désert de dunes géantes, vallonné ; des ÎLES DE ROUTE (des segments de 100 à 500 m) posées sur le dos des dunes, séparées
   par des SAUTS : on roule une face d'avalanche (on s'y pose), un creux (on y tourne), la face au vent qui remonte, et la LÈVRE de la crête — où la route s'arrête net.
   On décolle (toujours, même sans nitro : `dnLevre`), on survole une cuvette de sable, et on se pose sur le segment de la dune d'en face, plus bas. Départ tout en haut
   (de grosses collines, le portail et ses trois pyramides AU LOIN), arrivée en bas, à l'oasis.
   · LA ROUTE (`genDunes`) reste UNE courbe (la caisse, la caméra, la distance, le pilote la lisent comme avant) ; les sauts y sont des TROUS (TROUMARK → TROU/TROUS dans
     buildTrack : le ruban n'a aucun triangle entre la lèvre et le segment suivant, la dalle absente ne reçoit ni pad ni pièce ni atterrissage — `dalleProche`).
     Un saut est une DROITE descendante (12 à 19 %) entre deux droites : la lèvre et le début de la face d'atterrissage sont sur le MÊME cap (rien à braquer en l'air) ;
     sa longueur = la vitesse de croisière × ~1,2 à 1,6 s (VN = 1,35 × vPalier : la longueur suit le moteur, comme les virages).
   · LES PIÈCES (mélangées, jamais deux fois de suite) : LA DUNE (face, creux en virage, remontée, lèvre), LES PAS JAPONAIS (3 à 5 îlots de ~90 m, un saut court entre chacun :
     le rythme), LE GRAND SAUT (une cuvette d'argile blanche et ses acacias morts, 2 s de vol), L'ALLÉE DES OBÉLISQUES (un long segment droit), LA CRÊTE (la caravane,
     un long segment en S) ; entre elles, des dunes. Le DÉPART (le belvédère) en tête, L'OASIS (le portail au-dessus de l'eau, entre les trois pyramides) en queue.
   Console : `dbgDunes()` (état, temps, sauts) · `dbgDunes('test')` · `dbgDunes('vue',d,h,cap,pente)` (photo figée, d m devant la caisse) · `dbgDunes('vueA',s,h,cap,pente)` ·
   `dbgDunes('sauts')` · `?carte=dunes&meteo=soir`. */
const NIV_DUNES={id:'dunes',nm:"LES DUNES D'OR",bio:['dunesSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'dunes',pr:'DE DUNE EN DUNE'};
const DUNES_OK=CANYON_OK; // les mêmes besoins que le canyon : textures de données en flottants, lecture de textures au sommet
PAL.B.dnFin=[16,14,12];PAL.B.dnPlat=[96,80,64];PAL.B.dnOmbre=[60,52,44];PAL.B.dnGrille=[16,16,32];PAL.B.dnR0=[85,100,118];PAL.B.dnArbres=[50,90,140];PAL.B.dnPalmes=[22,34,48];PAL.B.dnPart=[600,1100,1600];PAL.B.dnMo=[0,.75,1];PAL.B.dnRuines=[.35,.7,1]; // (2026-10-22) la mosaïque du sable et des pierres (0 = éteinte sur les vieux téléphones) · le nombre de ruines éparses // la finesse par palier [ancien, moyen, récent]
const DN={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,S:null,job:0,attente:null,grp:null,
  ombre:1,ecrit:false,ob:[],pyr:null,pyrs:[],gp:[],lev:[],mo:[],deco:null,tor:[],oa:null,rac:[],vent:[1,0,1,0],lam:560,car:[],sep:0,rmin:0}; // (les textes : avec les ambiances des dunes, I18N n'existe pas encore ici)
/* ===== LE DÉSERT AU HASARD (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map soit aléatoire
   avec des modules et des décors qui changent ») ===== — MESURÉ (16 graines) : le TRACÉ changeait déjà (écart de forme 0,22), mais d'une partie à l'autre on
   retrouvait la MÊME composition : l'allée des obélisques en paires, une grande pyramide près de l'oasis, l'oasis, les acacias de la vallée, trois caravanes
   de sept chameaux sur les mêmes crêtes, le sable or. Désormais chaque erg tire son DÉCOR (`dnTirage`, un flux à lui né de la graine : jamais `rnd` ni `r`) —
   la couleur du sable (or, rouge, blanc d'argile, rose), le vent (direction, longueur des dunes, force des rides, sable qui vole), l'allée (en paires, d'un
   seul côté, alternée, brisée ; son pas, sa hauteur), les obélisques épars (combien, brisés ou non), 0 à 3 pyramides (à gradins, lisses de calcaire,
   à degrés ; petites ou géantes ; près de l'oasis ou le long de la route), un sphinx, des colosses assis, un temple en ruine à colonnes, des portes de
   pierre (pylônes), un village de terre en ruine, des campements (tentes, feu, chameaux couchés), 1 à 4 caravanes de 4 à 11 bêtes, la flore (acacias de la
   vallée et épars, palmeraies, touffes d'herbe sèche, cactus), l'oasis (petite, grande, ou un MIRAGE : pas d'eau du tout), des diables de sable, un mur de
   tempête au loin, des squelettes géants, des épaves (un avion, un boutre échoué). Tout est posé AUTOUR de la route (jamais dessus : dbgDunes('test')) ;
   les grands monuments ombrent le sable et TUENT en vol, comme les obélisques. Les pièces neuves sont CUITES en une géométrie (une seule instance, la
   matière des décors : aucun programme neuf). Et les MODULES : trois de plus (dCreteS, dToboggan, dGue) — 7 sortes dans le paquet.
   `?sans=dunesdecor` = le décor d'avant ; `?sans=dunesmodules` = le paquet d'avant (4 sortes) ; `dbgDunes().deco` = le tirage. */
const DN_DECO={on:!/[?&]sans=([^&]*,)?dunesdecor(,|&|$)/.test(location.search),mods:!/[?&]sans=([^&]*,)?dunesmodules(,|&|$)/.test(location.search)};
const DN_MOSA=!/[?&]mosaique=0\b/.test(location.search),DN_BUTTES=!/[?&]buttes=0\b/.test(location.search); // (2026-10-22) `?mosaique=0` : le sable et la pierre sans mosaïque · `?buttes=0` : sans les buttes de grès (banc : ce que coûte chaque matière)
const DN_HZ={axe:20,kL:.92,lim:40},DN_SEG={D:2.6,H:26,A:150,haut:260}; // DN_SEG : le sable sous un segment (air sous la dalle, profondeur et hauteur des dunes) · `haut` : de combien le désert lointain est plus bas au départ (m)
function* genDunes(rnd){ // (LE PRÉ-BÂTI) un générateur, comme genCanyon : il rend la main entre deux étapes
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;TROUMARK.length=0;
  const LV=lvPiste(),LL=1+Math.min(1.3,(LV-1)*.5),g0=(rnd()*4294967296)>>>0;
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);DN.rmin=Math.round(RMIN);
  const VN=1.35*VW,LC9=typeof longueurCible==='function'?longueurCible():0;
  const r=mulberry32(g0),C=[],Q={},GP=[],P=new THREE.Vector3(0,0,0),LIM=DN_HZ.lim*Math.PI/180;let phi=0;
  const push=()=>C.push(P.clone()),ici=k=>{Q[k]={p:P.clone(),phi:phi};},lib=sg=>(LIM-sg*phi)*57.2958,fait=()=>{let a=0;for(let k=1;k<C.length;k++)a+=Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);return a;};
  const droite=(l,pe,n)=>{n=n||Math.max(2,Math.round(l/60));for(let k=0;k<n;k++){P.x+=Math.sin(phi)*l/n;P.z+=Math.cos(phi)*l/n;P.y+=pe*l/n;push();}};
  const arc=(aDeg,R,pe)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi)*ch;P.z+=Math.cos(phi)*ch;P.y+=pe*ch;phi+=st/2;push();}};
  const vir=(sg,a,R,pe)=>{let l9=lib(sg);if(l9<12){sg=-sg;l9=lib(sg);}arc(sg*Math.max(6,Math.min(a,l9)),R,pe);return sg;}; // un virage, jamais au-delà de la butée du cap ; rend le sens pris
  const recentre=pe=>{if(Math.abs(phi)>.10)arc(-phi*57.2958,RMIN*(2.2+r()*.6),pe);};
  // LE CREUX d'une dune : là où l'on tourne (la face et la remontée, elles, sont droites)
  const creux=(t,pe)=>{
    if(t==='S'){const a=26+r()*20,R=RMIN*(1.45+r()*.7);const sg=vir(r()<.5?-1:1,a,R,pe);vir(-sg,a*(.85+r()*.35),R,pe);}
    else if(t==='balayage'){const a=42+r()*28,R=RMIN*(2.1+r()*.8);vir(r()<.5?-1:1,a,R,pe);}
    else if(t==='serpent'){let sg=r()<.5?-1:1;for(let k=0;k<3;k++){const a=24+r()*14;sg=vir(sg,a,RMIN*(1.3+r()*.4),pe);sg=-sg;}}
    else droite((90+r()*60)*LL,pe);};
  // UN SAUT : une droite sans route (TROUMARK) — T = le temps de vol visé (s) à la vitesse de conception, pe = la pente (la face d'en face la prolonge)
  let nTr=0;
  const trou=(tag,o)=>{o=o||{};const T=o.T!=null?o.T:1.25+r()*.4,pe=o.pe!=null?o.pe:.12+r()*.07,len=Math.max(70,VN*T*.80*(o.k||1)),iA=C.length-1;
    droite(len,-pe,Math.max(3,Math.round(len/55)));GP.push({i0:iA,i1:C.length-1,len:Math.round(len),pe:+pe.toFixed(3),tag:tag||'saut'});nTr++;};
  // UN SEGMENT : la face d'avalanche (droite : on s'y pose), le creux, la face au vent (droite, remonte), la LÈVRE (droite : on y décolle)
  const face=(l,sf)=>droite(l*LL,-sf),levre=(l,sm)=>{droite(l*LL,sm);droite(46*LL,.012,1);};
  const segment=(kind)=>{
    if(kind==='ilot'){face(38+r()*10,.13);droite((40+r()*12)*LL,.03,1);return;}                                           // un îlot : ~90 m, on s'y pose et on repart
    if(kind==='avenue'){face(80+r()*30,.12);ici('obel0');droite((440+r()*80)*LL,-.045);ici('obel1');levre(60,.05);return;}  // l'allée : un long segment droit
    if(kind==='crete'){face(80+r()*30,.12);ici('cr2a');{let sg=r()<.5?-1:1,f9=0;const L9=(360+r()*90)*LL;while(f9<L9){const a=24+r()*16,R=RMIN*(1.8+r()*.9);sg=vir(sg,a,R,-.03);sg=-sg;f9+=R*a/57.2958;}}ici('cr2b');recentre(-.03);levre(56,.055);return;}
    face(84+r()*44,.11+r()*.07);creux(['S','S','balayage','serpent','droit'][(r()*5)|0],-.03-r()*.02);recentre(-.03);levre(96+r()*56,.05+r()*.04);};
  // LES PIÈCES : chacune se pose APRÈS un saut (le précédent finit sur une lèvre)
  const PC={
    dune:()=>{trou('saut');segment('dune');},
    ilots:()=>{const i0=C.length-1,n=3+((r()*3)|0);for(let k=0;k<n;k++){trou('ilot',{T:.95+r()*.2,pe:.10+r()*.04});segment('ilot');}MODMARK.push({i0:i0,i1:C.length-1});},
    vlei:()=>{recentre(-.04);ici('vlei0');trou('vlei',{T:2.0+r()*.25,pe:.085+r()*.02});ici('vlei1');segment('dune');},
    avenue:()=>{recentre(-.04);const i0=C.length-1;trou('saut');segment('avenue');MODMARK.push({i0:i0,i1:C.length-1});},
    crete:()=>{recentre(-.04);const i0=C.length-1;trou('saut');segment('crete');MODMARK.push({i0:i0,i1:C.length-1});}};
  const mel=a=>{for(let i=a.length-1;i>0;i--){const j=(r()*(i+1))|0,x9=a[i];a[i]=a[j];a[j]=x9;}return a;};
  const B=LC9?LC9*DN_HZ.kL*(.92+r()*.16):5300*LL,FIN=1000*LL,pieces=[];
  // LE DÉPART : le belvédère, tout en haut — une droite pour s'élancer, un virage, la remontée, la première lèvre
  push();ici('depart');droite(190*LL,-.035,3);ici('erg0');creux(r()<.5?'S':'balayage',-.035);recentre(-.035);levre(110,.055);
  // le jeu : le grand saut, les pas japonais, un décor, puis des dunes — l'ordre est tiré ; la longueur visée dit combien en entrent
  const ess=mel(['vlei','ilots',r()<.5?'avenue':'crete']);
  const jeu=['dune'];for(const p of ess){jeu.push(p);const n=1+((r()*2)|0);for(let k=0;k<n;k++)jeu.push('dune');} // (une première dune d'abord : le départ domine, la vallée morte ne vient pas en tête)
  jeu.push(r()<.5?'crete':'avenue');if(r()<.6)jeu.push('dune');
  const vus={};
  for(const p of jeu){if(fait()>B-FIN-120&&pieces.length>=3)break;if((p==='crete'||p==='avenue')&&vus[p])continue;vus[p]=1;PC[p]();pieces.push(p);yield;}
  for(let k=0;k<12&&fait()<B-FIN-480;k++){PC.dune();pieces.push('dune');}
  // L'OASIS : la dernière face, une longue descente, deux virages, la droite d'arrivée
  recentre(-.05);trou('fin',{T:1.35,pe:.13});face(130+r()*30,.12);droite(300*LL,-.05);
  ici('oasis0');{const sg=r()<.5?-1:1;vir(sg,30+r()*14,RMIN*(2.4+r()*.5),-.05);vir(-sg,22+r()*10,RMIN*(2.7+r()*.4),-.04);}ici('fin');droite(150,-.02,2);
  // l'AXE : toute la route tournée autour du départ (le soleil de l'heure, lui, reste celui du monde)
  const ax=(r()-.5)*2*DN_HZ.axe/57.2958,ca=Math.cos(ax),sa=Math.sin(ax),tr=v=>{const x=v.x;v.x=x*ca+v.z*sa;v.z=v.z*ca-x*sa;};
  for(const v of C)tr(v);for(const k in Q){tr(Q[k].p);Q[k].phi+=ax;}
  lisserRaccords(C);adoucirCretes(C,1);
  for(const k in Q){const o=Q[k];let bi=0,bd=1e18;for(let j=0;j<C.length;j++){const d=C[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.copy(C[bi]);}
  for(const g of GP)TROUMARK.push({i0:g.i0,i1:g.i1});
  DN.Q=Q;DN.gp=GP;DN.sep=0;DN.hz={axe:Math.round(ax*57.2958),B:Math.round(B),LL:+LL.toFixed(2),RMIN:Math.round(RMIN),VN:Math.round(VN),sauts:nTr,pieces:pieces};
  return C;
}
/* LA DUNE — la même fonction que la puce (dnDune du GLSL), lue dans le même bruit (cyNz) : W = [vent x, vent z, houle x, houle z], lam = la longueur
   d'onde (m). Rend la hauteur relative (0 au creux, ~1 au sommet) ; o.du (facultatif) = le profil de la grande dune seule (1 sur la crête). */
function dnDune(x,z,W,lam,o){ /* (le bruit lu aux SEULES grandes échelles, canal 0 : la 1re version lisait les canaux fins — 3 à 100 m — et faisait de la roche, MESURÉ au relief ombré hors GPU) */
  const u=(x*W[0]+z*W[1])/lam,v=-x*W[1]+z*W[0],w1=cyNz(x/30000,z/30000,0)-.5,w2=cyNz(x/11000+.37,z/11000+.61,0)-.5,w3=cyNz(x/5200+.83,z/5200+.17,0)-.5;
  const a=u+1.4*w1+1.05*w2+.34*w3,f=a-Math.floor(a);                                                       // les crêtes serpentent sur 1 à 7 km
  const p=f<.72?Math.pow(Math.max(f/.72,1e-5),1.5):Math.pow(Math.max((1-f)/.28,1e-5),1.15),n1=cyNz(v/9000+.13,a*.13+.5,0),m=.30+.70*Math.max(0,Math.min(1,(n1-.22)*1.9)); // face au vent douce, face d'avalanche raide ; pics et cols le long des crêtes
  const a2=(x*W[2]+z*W[3])/(lam*.40)+1.6*w2+.5*w3,f2=a2-Math.floor(a2);
  const p2=f2<.68?Math.pow(Math.max(f2/.68,1e-5),1.4):Math.pow(Math.max((1-f2)/.32,1e-5),1.1);              // la houle en biais, dans les creux surtout
  if(o)o.du=p*m;return p*m+.08*p2*(1-.75*p);}
/* LA HAUTEUR DU SABLE — la même que la puce (dnHt), lue dans les mêmes données : le fond B, l'amplitude A, la cuvette `pan` (grille de 64 m),
   le plafond C et le plancher G (grille fine), l'oasis. `o` (facultatif) reçoit eau (0/1). */
/* LES BUTTES (2026-10-22, Léo : « le niveau dune n'est pas au niveau — regarde jade, la grotte, la forêt » : des masses qui dressent l'horizon, comme les pics de jade) — des plateaux de grès à flancs raides, ajoutés
   au sable LOIN de la route (dr = la distance à la route, 260 m → rien, 520 m → plein) : le masque est un seuil du bruit (canal 1, tuile de 6 km), le haut (70 à 180 m) un autre bruit (canal 2). Même
   fonction dans le GLSL de la puce (dnMesa de DN_VS) : toute retouche ici se refait là-bas. */
function dnMesa(x,z,dr){if(DN.sb)return 0;const n=cyNz(x/6000+.21,z/6000+.73,1),e=Math.max(0,Math.min(1,(n-.60)/.012)),m0=e*e*(3-2*e);if(m0<=0)return 0;
  const t=cyNz(x/1700+.5,z/1700+.1,2),f=Math.max(0,Math.min(1,(dr-260)/260)),w=f*f*(3-2*f),F9=DN.fin;let fe=1;if(F9){const q=Math.max(0,Math.min(1,(Math.hypot(x-F9.x,z-F9.z)-1800)/1200));fe=q*q*(3-2*q);} // (aucune butte autour de l'arrivée : les pyramides, l'oasis, le portail)
  return m0*w*fe*(70+110*t);}
const DN_O9={};
function dnHauteur(x,z,o){const Z=DN.Z,F=DN.F;o=o||DN_O9;
  const zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts,B=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz),A=cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz),pan=cyBil(Z.d,Z.nx,Z.nz,4,3,zx,zz);
  const me=dnMesa(x,z,cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz)),mk=Math.max(0,Math.min(1,me/20)); // la butte : son haut est plat (les dunes s'effacent dessus)
  let h=B+A*(dnDune(x,z,DN.vent,DN.lam)-.35)*(1-.85*pan)*(1-.92*mk)+me;
  const fx=(x-(F.x0-F.ts*.5))/(F.nx*F.ts),fz=(z-(F.z0-F.ts*.5))/(F.nz*F.ts);
  if(fx>0&&fz>0&&fx<1&&fz<1){const px=fx*F.nx,pz=fz*F.nz,c=cyBil(F.c,F.nx,F.nz,2,0,px,pz),g=cyBil(F.c,F.nx,F.nz,2,1,px,pz);h=Math.min(Math.max(h,g),c);}
  o.eau=0;const A9=DN.oa;if(A9){const rr=Math.hypot(x-A9.x,z-A9.z)/A9.r;if(rr<2.4){const q=rr<1?A9.y-12*(1-rr*rr):A9.y+(rr-1)*A9.r*.2;if(q<h)h=q;if(h<A9.y-.05){h=A9.y;o.eau=1;}}}
  return h;}
/* le profil en travers d'UN bras de route, vu depuis l'échantillon i0 (affiné ±4) : o.C = le plafond, o.G = le plancher — faux hors de portée */
function dnProfil(S,RE,i0,x,z,o,RH,TH){
  let bd=1e18,bj=-1,bu=0;const a=Math.max(0,i0-4),b=Math.min(S.n-2,i0+4);
  for(let j=a;j<=b;j++){const ax=S.x[j],az=S.z[j],dx=S.x[j+1]-ax,dz=S.z[j+1]-az,l2=dx*dx+dz*dz||1;let u=((x-ax)*dx+(z-az)*dz)/l2;u=u<0?0:u>1?1:u;
    const px=ax+dx*u-x,pz=az+dz*u-z,d=px*px+pz*pz;if(d<bd){bd=d;bj=j;bu=u;}}
  if(bj<0)return false;const j=bj,u=bu,j1=j+1,d=Math.sqrt(bd);if(d>RE[j]+20)return false;
  const v=1-u,y=S.y[j]*v+S.y[j1]*u,D=S.D[j]*v+S.D[j1]*u,zC=S.zC[j]*v+S.zC[j1]*u,gd=S.gd[j]*v+S.gd[j1]*u,top=y-TH-D,sl=.75-.63*gd;
  o.C=top+Math.max(0,d-(RH+6))*sl;                                                       // le sable au repos (37°) — presque plat dans les boucles
  o.G=zC>.01?top-1-Math.max(0,d-8)*.40-Math.max(0,d-(RH+3))*.24-(1-zC)*300:-1e5;          // la dune qui porte la route : une crête sous l'axe, ses flancs à 22° puis 32°
  /* LE PLATEAU DE LA SCÈNE (2026-10-22) : sur une scène (colonnade, allée…) le sable s'étend à plat jusqu'à pw (m depuis l'axe), à 1,6 m sous la dalle, puis retombe comme avant ; le plateau monte en douceur (tp) */
  const pw=S.pw?(S.pw[j]*v+S.pw[j1]*u)*zC:0;if(pw>2){const bw=Math.min(1,pw/(RH*.7)),yP=(top-1)+((y-1.6)-(top-1))*bw,dg=Math.max(0,d-Math.max(pw,8)),Gp=yP-dg*.40-Math.max(0,dg-(RH-5))*.24,Cp=yP+.7+Math.max(0,d-Math.max(pw,RH+6))*sl;
    if(zC>.01){o.G+=(Gp-o.G)*bw;}o.C+=(Cp-o.C)*bw;}
  return true;}
/* LES DÉCORS QUI COMPTENT POUR L'OMBRE ET LA COLLISION (ici ou dans le travailleur) : les obélisques et la grande pyramide — jamais près d'une route */
/* LES TROIS PYRAMIDES (2026-10-20, Sacha : « on voit le portail au loin, entre trois pyramides ») : au bout de la route, derrière le portail — deux grandes de chaque
   côté du cap d'arrivée (le portail passe entre elles), la plus haute au fond, dans l'axe : du départ, le portail se lit devant la grande, entre les deux. `st` : le style tiré
   (le décor au hasard : à gradins, lisse, étagée) — celui de la 1re, 2e, 3e pyramide du tirage, sinon à gradins. */
function dnPyr3(S,K,RH,r,sts){
  const pyrs=[],iE=S.n-1,i1=Math.max(0,iE-18);let hx=S.x[iE]-S.x[i1],hz=S.z[iE]-S.z[i1];const hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;const Ex=S.x[iE],Ez=S.z[iE]; // le cap d'arrivée (les 150 derniers mètres)
  const def=[[(370+r()*60)*K,-1,1.25,150+r()*80],[(400+r()*60)*K,1,1.25,330+r()*120],[(560+r()*60)*K,0,0,1500+r()*300]]; // [demi-base, côté, écart latéral en demi-bases, recul derrière le portail]
  def.forEach(function(d,k){const hw=d[0],lat=d[1]?d[1]*(hw*d[2]+RH+80+r()*40):(r()-.5)*70,x=Ex+hx*d[3]-hz*lat,z=Ez+hz*d[3]+hx*lat,a=Math.atan2(hx,hz)+(r()-.5)*.5,st=sts&&sts[k]?sts[k]:'';
    let y=1e9,X=x,Z9=z;for(let t9=0;t9<10;t9++){let bute=false;for(const q of [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]])if(dnMesa(X+q[0]*hw*1.1,Z9+q[1]*hw*1.1,1e9)>1.5)bute=true;if(!bute)break;X+=hx*hw*.5;Z9+=hz*hw*.5;} // (une butte sous une pyramide : on la repousse derrière)
    for(const q of [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]])y=Math.min(y,dnHauteur(X+q[0]*hw*.9,Z9+q[1]*hw*.9));
    pyrs.push({x:X,z:Z9,y:y-14,hw:hw,h:hw*(st==='etagee'?.95:1.27),a:a,st:st});});
  return pyrs;}
function dnPrevoir(S,sQ,K,RH,r,D){
  if(D)return dnPrevoirDeco(S,sQ,K,RH,D);
  const ob=[],L9=(S.n-1)*S.ds,pres=(x,z,lim)=>{if(dnMesa(x,z,1e9)>1.5)return true;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lim*lim)return true;}return false;};
  const a0=sQ.obel0,a1=sQ.obel1;
  if(a0!=null&&a1!=null)for(let s9=a0+40;s9<a1-20;s9+=120*K){const i=Math.min(S.n-1,Math.round(s9/S.ds));  // L'ALLÉE : une paire tous les ~120 m
    for(const sg of [-1,1]){const lat=RH+(26+r()*6)*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,rr=(4.2+r()*.8)*K;
      if(pres(x,z,RH+rr+12))continue;ob.push({x:x,z:z,y:dnHauteur(x,z)-2,h:(58+r()*16)*K,r:rr,a:Math.atan2(S.tx[i],S.tz[i])});}}
  for(let s9=520;s9<L9-700;s9+=(560+r()*320)*K){const i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01||S.ob[i]>.5){r();r();r();continue;} // LES ÉPARS : un tous les ~700 m, sur les dunes
    const sg=r()<.5?-1:1,lat=RH+(70+r()*150)*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,rr=(3.6+r()*1.4)*K;
    if(pres(x,z,RH+rr+45))continue;ob.push({x:x,z:z,y:dnHauteur(x,z)-3,h:(40+r()*36)*K,r:rr,a:r()*6.28});}
  const pyrs=dnPyr3(S,K,RH,r,null);
  return {ob:ob,pyr:pyrs[0],pyrs:pyrs};}
/* (2026-10-20, LE DÉSERT AU HASARD) les décors qui OMBRENT et qui TUENT, selon le tirage D (ici ou dans le travailleur) : l'allée (en paires, d'un côté,
   alternée, brisée), les épars, 0 à 3 pyramides, les grands monuments `mo` (sphinx, colosses, temple, portes : un cylindre pour la collision et l'ombre).
   Rien à moins de RH + rayon + 28 m d'une route (les deux bras d'une boucle compris), rien sur la garde des raccourcis. Son hasard : `D.sd`. */
function dnPrevoirDeco(S,sQ,K,RH,D){
  const rp=mulberry32((D.sd^0x0B5E11)>>>0),ob=[],pyrs=[],mo=[],L9=(S.n-1)*S.ds,pres=(x,z,lim)=>{if(dnMesa(x,z,1e9)>1.5)return true;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lim*lim)return true;}return false;};
  const loin=(x,z,rr)=>{for(const p of pyrs)if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+rr+40)return false;for(const m of mo)if(Math.hypot(m.x-x,m.z-z)<m.r+rr+40)return false;return true;};
  const ou=(s9,sg,lat)=>{const i=Math.max(0,Math.min(S.n-1,Math.round(s9/S.ds)));return {i:i,x:S.x[i]-S.tz[i]*sg*lat,z:S.z[i]+S.tx[i]*sg*lat};};
  const A=D.allee,a0=sQ.obel0,a1=sQ.obel1;                                                                     // L'ALLÉE
  if(a0!=null&&a1!=null){let k9=0;for(let s9=a0+40;s9<a1-20;s9+=A.pas*K,k9++){const C9=A.mode==='gauche'?[-1]:A.mode==='droite'?[1]:A.mode==='alternee'?[k9&1?1:-1]:[-1,1];
    for(const sg of C9){const q=ou(s9,sg,RH+(26+rp()*8)*K),rr=(4.2+rp()*.8)*K*A.rK,br=A.mode==='brisee'&&rp()<.55;if(pres(q.x,q.z,RH+rr+12))continue;
      ob.push({x:q.x,z:q.z,y:dnHauteur(q.x,q.z)-2,h:(58+rp()*16)*K*A.hK*(br?.22+rp()*.3:1),r:rr,a:Math.atan2(S.tx[q.i],S.tz[q.i]),br:br?1:0});}}}
  if(D.epars.k>0)for(let s9=520;s9<L9-700;s9+=(560+rp()*320)*K/D.epars.k){const i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01||S.ob[i]>.5)continue; // LES ÉPARS
    const sg=rp()<.5?-1:1,q=ou(s9,sg,RH+(60+rp()*170)*K),rr=(3.6+rp()*1.4)*K,br=rp()<D.epars.br;if(pres(q.x,q.z,RH+rr+45))continue;
    ob.push({x:q.x,z:q.z,y:dnHauteur(q.x,q.z)-3,h:(40+rp()*36)*K*(br?.2+rp()*.35:1),r:rr,a:rp()*6.28,br:br?1:0});}
  {const P3=dnPyr3(S,K,RH,rp,D.pyr.map(function(p){return p.st;}));for(const P of P3)pyrs.push(P);}                  // LES TROIS PYRAMIDES (autour du portail)
  const poser=(k,r9,h9,lat0,lat1)=>{for(let e=0;e<16;e++){const s9=L9*(.06+.86*rp()),i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01)continue; // LES GRANDS MONUMENTS
      const sg=rp()<.5?-1:1,q=ou(s9,sg,RH+r9+(lat0+rp()*(lat1-lat0))*K);if(pres(q.x,q.z,RH+r9+28)||!loin(q.x,q.z,r9))continue;
      let y=1e9;for(const o of [[0,0],[1,0],[-1,0],[0,1],[0,-1]])y=Math.min(y,dnHauteur(q.x+o[0]*r9*.8,q.z+o[1]*r9*.8));
      mo.push({k:k,x:q.x,z:q.z,y:y-2,r:r9,h:h9,a:Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z),t:Math.atan2(S.tx[q.i],S.tz[q.i])});return;}};
  if(D.sphinx){const l=(56+rp()*26)*K;poser('sphinx',l*.55,l*.5,40,140);}                                          // il regarde la route
  for(let k=0;k<D.colosses;k++){const h=(30+rp()*22)*K;poser('colosse',h*.4,h,30,120);}
  if(D.temple){const l=(46+rp()*20)*K;poser('temple',l*.62,(15+rp()*6)*K,35,130);}
  for(let k=0;k<D.portes;k++){const h=(20+rp()*12)*K;poser('porte',h*.8,h,25,90);}
  return {ob:ob,pyr:pyrs[0]||null,pyrs:pyrs,mo:mo};}
/* L'OMBRE (grille de 44-60 m, le domaine fin + 1,4 km) : hS(p) = max(H, hS) relu 2 cases plus près du soleil − 2 cases × tan(hauteur), comme cyOmbre —
   les obélisques et la pyramide lèvent la hauteur (ils ombrent le sable) */
function dnOmbre(elDeg,azDeg,pv){const F=DN.F,TS=PAL.b('dnOmbre',44),M9=1400,x0=F.x0-M9,z0=F.z0-M9,nx=Math.ceil((F.nx*F.ts+2*M9)/TS)+1,nz=Math.ceil((F.nz*F.ts+2*M9)/TS)+1,O={ts:TS,x0:x0,z0:z0,nx:nx,nz:nz};
  const H=new Float32Array(nx*nz),M=new Float32Array(nx*nz),hS=new Float32Array(nx*nz);
  for(let jz=0;jz<nz;jz++)for(let jx=0;jx<nx;jx++)H[jz*nx+jx]=dnHauteur(x0+jx*TS,z0+jz*TS);
  const lever=(x,z,rr,y)=>{const i0=Math.max(0,Math.floor((x-rr-x0)/TS)),i1=Math.min(nx-1,Math.ceil((x+rr-x0)/TS)),j0=Math.max(0,Math.floor((z-rr-z0)/TS)),j1=Math.min(nz-1,Math.ceil((z+rr-z0)/TS));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const dx=x0+jx*TS-x,dz=z0+jz*TS-z;if(dx*dx+dz*dz<=rr*rr){const o=jz*nx+jx;if(y>H[o])H[o]=y;}}};
  for(const b of pv.ob)lever(b.x,b.z,Math.max(TS*.6,b.r),b.y+b.h);
  for(const m of pv.mo||[])lever(m.x,m.z,Math.max(TS*.6,m.r*.7),m.y+m.h); // (2026-10-20) les grands monuments du tirage
  for(const m of pv.sv||[])lever(m.x,m.z,Math.max(TS*.6,m.r*.8),dnHauteur(m.x,m.z)+m.h); // (2026-10-22) les scènes (colonnade, allée des sphinx, colosses, porte) : leurs volumes ombrent le sable (dunes-4.js)
  for(const P of pv.pyrs||(pv.pyr?[pv.pyr]:[])){const ca=Math.cos(P.a),sa=Math.sin(P.a),R9=P.hw*1.45,i0=Math.max(0,Math.floor((P.x-R9-x0)/TS)),i1=Math.min(nx-1,Math.ceil((P.x+R9-x0)/TS)),j0=Math.max(0,Math.floor((P.z-R9-z0)/TS)),j1=Math.min(nz-1,Math.ceil((P.z+R9-z0)/TS));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const dx=x0+jx*TS-P.x,dz=z0+jz*TS-P.z,u=Math.abs(dx*ca-dz*sa),w=Math.abs(dx*sa+dz*ca),e=Math.max(u,w)/P.hw; /* (le repère de la pyramide : l'inverse de sa rotation three autour de y) */
      if(e<1){const o=jz*nx+jx,y=P.y+P.h*(1-e);if(y>H[o])H[o]=y;}}}
  const el=Math.max(1,elDeg)*Math.PI/180,az=azDeg*Math.PI/180,sx=Math.sin(az),sz=Math.cos(az),te=Math.tan(el)*2*TS,sh=2;
  const bil=(fx,fz)=>{const i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=nx-1||j>=nz-1){const ci=Math.max(0,Math.min(nx-1,Math.round(fx))),cj=Math.max(0,Math.min(nz-1,Math.round(fz)));return H[cj*nx+ci];}
    const u=fx-i,v=fz-j,a=M[j*nx+i],b=M[j*nx+i+1],c=M[(j+1)*nx+i],d=M[(j+1)*nx+i+1];return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;};
  const fait=(jx,jz)=>{const o=jz*nx+jx,v=bil(jx+sx*sh,jz+sz*sh)-te;hS[o]=v;M[o]=Math.max(H[o],v);};
  if(Math.abs(sx)>=Math.abs(sz)){const dx=sx>0?-1:1;for(let jx=sx>0?nx-1:0;jx>=0&&jx<nx;jx+=dx)for(let jz=0;jz<nz;jz++)fait(jx,jz);}
  else{const dz=sz>0?-1:1;for(let jz=sz>0?nz-1:0;jz>=0&&jz<nz;jz+=dz)for(let jx=0;jx<nx;jx++)fait(jx,jz);}
  O.h=hS;DN.O=O;}
/* LE MONDE (ici ou dans le travailleur) : n'utilise que CY.nz, ses arguments et les fonctions recopiées — rend tout ce que la pose et la collision lisent */
function dnMondeCalc(S,opt){
  const K=opt.K,NS=S.n,x0=S.bb[0],x1=S.bb[1],z0=S.bb[2],z1=S.bb[3],RE=S.RE,ms={},r=mulberry32((opt.seed^0x51ED7A)>>>0),RH=opt.RH,TH=opt.TH;
  DN.vent=opt.vent;DN.lam=opt.lam;DN.oa=opt.oa;DN.fin=opt.fin;DN.sb=opt.sb;
  // ---- 4. LE FOND (grille de 64 m, jusqu'à 7 km) : le plus proche échantillon de la route (propagé), le fond B, l'amplitude A, la cuvette, puis adouci ----
  const t1=performance.now(),TZ=PAL.b('dnPlat',64),MZ=7000;
  const Z={ts:TZ,x0:x0-MZ,z0:z0-MZ},znx=Math.ceil((x1-x0+2*MZ)/TZ)+1,znz=Math.ceil((z1-z0+2*MZ)/TZ)+1;Z.nx=znx;Z.nz=znz;
  const zi=new Int32Array(znx*znz).fill(-1),zd=new Float32Array(znx*znz).fill(1e18),RZ=1500;
  for(let i=0;i<NS;i+=6){const cx=(S.x[i]-Z.x0)/TZ,cz=(S.z[i]-Z.z0)/TZ,rr=Math.ceil(RZ/TZ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(znz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(znx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,d2=(ex*ex+ez*ez)*TZ*TZ;if(d2>RZ*RZ)continue;const o=jz*znx+jx;if(d2<zd[o]){zd[o]=d2;zi[o]=i;}}}
  for(let o=0;o<zd.length;o++)if(zi[o]>=0)zd[o]=Math.sqrt(zd[o]);
  {let X9=0,Z9=0;const pr=(o,o2)=>{const i=zi[o2];if(i<0||i===zi[o])return;const ex=X9-S.x[i],ez=Z9-S.z[i],d=ex*ex+ez*ez;if(d<zd[o]*zd[o]){zd[o]=Math.sqrt(d);zi[o]=i;}};
   for(let jz=0;jz<znz;jz++){Z9=Z.z0+jz*TZ;for(let jx=0;jx<znx;jx++){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx>0)pr(o,o-1);if(jz>0){pr(o,o-znx);if(jx>0)pr(o,o-znx-1);if(jx<znx-1)pr(o,o-znx+1);}}}
   for(let jz=znz-1;jz>=0;jz--){Z9=Z.z0+jz*TZ;for(let jx=znx-1;jx>=0;jx--){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx<znx-1)pr(o,o+1);if(jz<znz-1){pr(o,o+znx);if(jx<znx-1)pr(o,o+znx+1);if(jx>0)pr(o,o+znx-1);}}}}
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  let zdat=new Float32Array(znx*znz*4);
  for(let o=0;o<znx*znz;o++){const i=Math.max(0,zi[o]),d=zd[o],wf=sm(500*K,1500*K,d);
    zdat[o*4]=S.B[i]+(S.Yf[i]-S.B[i])*wf;zdat[o*4+1]=d;zdat[o*4+2]=S.A[i]+(opt.Af-S.A[i])*wf;zdat[o*4+3]=S.pan[i]*(1-sm(380*K,700*K,d));}
  // l'ADOUCI : trois passes d'une moyenne 3 × 3 sur le fond, l'amplitude et la cuvette (une frontière entre deux bras de route lointains ne fait plus de falaise)
  {const tmp=new Float32Array(zdat.length);
   for(let ps=0;ps<3;ps++){for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=(jz*znx+jx)*4;tmp[o+1]=zdat[o+1];
       for(const c of [0,2,3]){let s9=0,n9=0;for(let dz=-1;dz<=1;dz++){const kz=jz+dz;if(kz<0||kz>=znz)continue;for(let dx=-1;dx<=1;dx++){const kx=jx+dx;if(kx<0||kx>=znx)continue;s9+=zdat[(kz*znx+kx)*4+c];n9++;}}tmp[o+c]=s9/n9;}}
     zdat.set(tmp);}}
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=(jz*znx+jx)*4,x=Z.x0+jx*TZ,z=Z.z0+jz*TZ,wf=sm(500*K,1500*K,zdat[o+1]);
    zdat[o]+=(60*(cyNz(x/40000+.5,z/40000+.2,0)-.5)+22*(cyNz(x/14000+.3,z/14000+.9,0)-.5))*wf;} // la houle lointaine de l'erg (canal 0 : les grandes échelles seulement)
  Z.d=zdat;DN.Z=Z;ms.fond=Math.round(performance.now()-t1);
  // ---- 5. LA GRILLE FINE (12 m) : le plafond et le plancher, des deux bras de route les plus proches ----
  const t2=performance.now(),TF=PAL.b('dnFin',12);let reach=0;for(let i=0;i<NS;i++)if(RE[i]>reach)reach=RE[i];const ME=reach+80;
  const F={ts:TF,x0:x0-ME,z0:z0-ME},fnx=Math.ceil((x1-x0+2*ME)/TF)+1,fnz=Math.ceil((z1-z0+2*ME)/TF)+1;F.nx=fnx;F.nz=fnz;
  const fc=new Float32Array(fnx*fnz*2);for(let o=0;o<fnx*fnz;o++){fc[o*2]=1e5;fc[o*2+1]=-1e5;}
  const TQ=32,qnx=Math.ceil((fnx*TF)/TQ)+1,qnz=Math.ceil((fnz*TF)/TQ)+1,q1=new Int32Array(qnx*qnz).fill(-1),q2=new Int32Array(qnx*qnz).fill(-1),d1=new Float32Array(qnx*qnz).fill(1e9),d2=new Float32Array(qnx*qnz).fill(1e9),LEG=Math.round(560/S.ds);
  for(let i=0;i<NS;i+=4){const cx=(S.x[i]-F.x0)/TQ,cz=(S.z[i]-F.z0)/TQ,R9=RE[i]+48,rr=Math.ceil(R9/TQ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(qnz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(qnx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,dq=(ex*ex+ez*ez)*TQ*TQ;if(dq>R9*R9)continue;const d=Math.sqrt(dq),o=jz*qnx+jx;
      if(q1[o]<0||Math.abs(i-q1[o])<LEG){if(d<d1[o]){d1[o]=d;q1[o]=i;}}
      else if(d<d1[o]){q2[o]=q1[o];d2[o]=d1[o];q1[o]=i;d1[o]=d;}
      else if((q2[o]<0||Math.abs(i-q2[o])<LEG||d<d2[o])&&d<d2[o]){q2[o]=i;d2[o]=d;}}}
  const pf={};let nc=0;
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const qo=Math.min(qnz-1,Math.round(jz*TF/TQ))*qnx+Math.min(qnx-1,Math.round(jx*TF/TQ));
    if(q1[qo]<0)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF;let C9=1e5,G9=-1e5,bo=0;
    for(let c=0;c<2;c++){const i0=c?q2[qo]:q1[qo];if(i0<0||(c&&d2[qo]>RE[i0]+48))continue;if(!dnProfil(S,RE,i0,x,z,pf,RH,TH))continue;bo=1;if(pf.C<C9)C9=pf.C;if(pf.G>G9)G9=pf.G;}
    if(!bo)continue;nc++;const o=jz*fnx+jx;fc[o*2]=C9;fc[o*2+1]=G9;}
  F.c=fc;DN.F=F;ms.fin=Math.round(performance.now()-t2);ms.texels=nc;
  const pv=dnPrevoir(S,opt.sQ,K,RH,r,opt.deco);DN.ob=pv.ob;DN.pyr=pv.pyr;
  // ---- 6. L'OMBRE : balayée une fois dans le sens du soleil de l'heure ----
  pv.sv=opt.vol||[];const t3=performance.now();dnOmbre(opt.sun[0],opt.sun[1],pv);ms.ombre=Math.round(performance.now()-t3);
  let yMax=-1e9,yMin=1e9;for(let o=0;o<znx*znz;o++){const b=zdat[o*4],a=zdat[o*4+2];if(b+a>yMax)yMax=b+a;if(b-a*.4<yMin)yMin=b-a*.4;}
  if(pv.pyr)yMax=Math.max(yMax,pv.pyr.y+pv.pyr.h);for(const b of pv.ob)yMax=Math.max(yMax,b.y+b.h);
  for(const b of pv.pyrs||[])yMax=Math.max(yMax,b.y+b.h);for(const b of pv.mo||[])yMax=Math.max(yMax,b.y+b.h);
  if(opt.oa)yMin=Math.min(yMin,opt.oa.y-20);
  const R={Z:Z,F:F,O:DN.O,ob:pv.ob,pyr:pv.pyr,yMin:yMin-40,yMax:yMax+40,ms:ms};if(pv.pyrs){R.pyrs=pv.pyrs;R.mo=pv.mo;}return R;
}
/* ---- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors des dunes) : les échantillons de la route ici, le MONDE dans un travailleur ---- */
function dnEteindre(){DN.on=false;DN.lev=[];if(DN.mesh)DN.mesh.visible=false;if(DN.grp)DN.grp.visible=false;DN.oa=null;if(DN.mat)DN.mat.uniforms.uOA.value.set(0,0,0,0);}
/* LE TIRAGE DU DÉCOR (2026-10-20, LE DÉSERT AU HASARD) : des choix INDÉPENDANTS, dans un flux né de la graine de la piste (ni `rnd`, ni `r`, ni le tracé) —
   un objet simple (il part au travailleur avec le reste). Les PALETTES restent dans la DA : le sable or / rouge / blanc d'argile / rose. */
function dnTirage(seed){let h9=Math.imul((seed^0xDEC0D5)>>>0,0x9E3779B1);h9^=h9>>>15;h9=Math.imul(h9,0x85EBCA6B);h9^=h9>>>13;const rd=mulberry32(h9>>>0), /* (la graine brassée) */ch=(L9,P9)=>{let t=rd()*P9.reduce((a,b)=>a+b,0);for(let i=0;i<L9.length;i++){t-=P9[i];if(t<0)return L9[i];}return L9[L9.length-1];},
    ent=(a,b)=>a+Math.floor(rd()*(b-a+1)),D={sd:(rd()*4294967296)>>>0};
  D.sable=ch(['or','rouge','blanc','rose'],[4,2.6,1.7,1.7]);
  D.vent={a:+((rd()-.5)*2.4).toFixed(2),b:+(.3+rd()*.7).toFixed(2),lamK:+(.78+rd()*.55).toFixed(2),rides:+(.6+rd()*1).toFixed(2),vole:rd()<.3?+(.22+rd()*.3).toFixed(2):0};
  D.allee={mode:ch(['paires','gauche','droite','alternee','brisee'],[3,1.2,1.2,1.5,1.6]),pas:Math.round(90+rd()*80),hK:+(.7+rd()*.65).toFixed(2),rK:+(.85+rd()*.35).toFixed(2)};
  D.epars={k:+ch([0,.5,1,1.8],[1,1.5,2,1.2]).toFixed(2),br:+(rd()*.6).toFixed(2)};
  {const n=ch([0,1,2,3],[1.2,3.5,2.6,1.4]);D.pyr=[];for(let k=0;k<n;k++)D.pyr.push({st:ch(['gradins','lisse','etagee'],[2,1.6,1.2]),k:+(k?.38+rd()*.55:.6+rd()*.55).toFixed(2),ou:k===0&&rd()<.7?'oasis':'route'});}
  D.sphinx=rd()<.45;D.colosses=ch([0,1,2],[2,1.4,.8]);D.temple=rd()<.45;D.portes=ch([0,1,2],[2,1.3,.6]);D.village=rd()<.38;
  D.camps=ch([0,1,2,3],[1.4,2,1.3,.6]);
  {const n=ch([1,2,3,4],[1.6,2,1.4,.8]);D.caravanes=[];for(let k=0;k<n;k++)D.caravanes.push({n:ent(4,11),k:+(.8+rd()*.5).toFixed(2),v:+(.8+rd()*.7).toFixed(2)});}
  D.flore={acacias:+ch([0,.5,1,1.6],[.8,1.5,2,1.2]).toFixed(2),epars:ch([0,12,30],[1.5,1.5,1]),palmeraies:ch([0,1,2],[1.4,1.6,.8]),touffes:ch([0,90,220],[1,1.6,1.4]),cactus:rd()<.22?ent(10,30):0};
  D.oasis={nm:ch(['normale','petite','grande','mirage'],[2,1.3,1.3,1]),k:1};D.oasis.k={normale:1,petite:.62,grande:1.4,mirage:0}[D.oasis.nm];
  D.tornades=ch([0,1,2,3],[1.6,1.4,1,.6]);D.tempete=rd()<.3?{a:+(rd()*6.28).toFixed(2)}:null;D.os=ch([0,1,3,5],[1.4,1.5,1.2,.7]);D.avion=rd()<.25;D.bateau=rd()<.25;
  return D;}
function buildDunes(seed){
  dnEteindre();DN.job=(DN.job||0)+1;
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='dunes'||!(NP>1)||!DUNES_OK)return;
  const t0=performance.now(),LV=lvPiste(),K=Math.sqrt(LV),r=mulberry32((seed^0xD0E5A7)>>>0);
  cyBruits();dnTerrain();
  // ---- 1. LES ÉCHANTILLONS : la route tous les 8 m ----
  const DS=8,NS=Math.max(3,Math.floor(L/DS)+1),st9=L/(NP-1),A9=n=>new Float32Array(n);
  const S={n:NS,ds:DS,x:A9(NS),z:A9(NS),y:A9(NS),tx:A9(NS),tz:A9(NS),H:A9(NS),A:A9(NS),D:A9(NS),zC:A9(NS),pan:A9(NS),ob:A9(NS),gd:A9(NS),B:A9(NS),Yf:A9(NS),RE:A9(NS),pw:A9(NS)};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];
  // ---- 2. LES SECTIONS : par échantillon, H = la profondeur de la mer de dunes sous la route, A = la hauteur des dunes, D = l'air sous la dalle, zC = la dune qui porte
  //      la route, pan = la cuvette d'argile, ob = l'allée. LES SEGMENTS sont POSÉS sur le sable (D ~ 2,6 m : une dune sous la dalle) ; sous chaque SAUT (TROUS) la mer de dunes
  //      descend en cuvette (D jusqu'à 22-52 m sous la ligne de vol), le sable ne porte plus rien : la caisse la survole ----
  const sQ={};if(DN.Q)for(const k in DN.Q){const p=DN.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  DN.sQ=sQ;const gp=DN.gp||[],TV=TROUS||[],sm=(a9,b9,x)=>{const t=Math.max(0,Math.min(1,(x-a9)/(b9-a9)));return t*t*(3-2*t);};
  const SEG9={D:DN_SEG.D,H:DN_SEG.H,A:DN_SEG.A*K};
  {const ph=[r()*6.28,r()*6.28,r()*6.28],so=sQ.oasis0!=null?sQ.oasis0:L-420,ob0=sQ.obel0,ob1=sQ.obel1;
   for(let i=0;i<NS;i++){const s9=i*DS;let ej=-1,dOut=1e9,jn=-1;
     for(let j=0;j<TV.length;j++){const t=TV[j];if(s9>=t.s0&&s9<=t.s1){ej=Math.min(s9-t.s0,t.s1-s9);jn=j;dOut=0;break;}const d=s9<t.s0?t.s0-s9:s9-t.s1;if(d<dOut){dOut=d;jn=j;}}
     const dedans=ej>=0,g=jn>=0?gp[jn]||{}:{},tag=g.tag||'saut',len=jn>=0?TV[jn].s1-TV[jn].s0:100,
       w=dedans?1:1-sm(0,110,dOut),                                        // la cuvette se devine avant la lèvre
       bump=dedans?sm(6,Math.max(20,Math.min(95,len*.45)),ej):0,           // 0 aux deux bouts (la lèvre, la pose), 1 au milieu
       Dv=tag==='vlei'?52:tag==='ilot'?22:tag==='fin'?30:36,Hv=tag==='vlei'?96:tag==='ilot'?40:56,Av=tag==='vlei'?90:130*K;
     let H=SEG9.H+(Hv-SEG9.H)*w,A=SEG9.A+(Av-SEG9.A)*w,D=SEG9.D+(Dv-SEG9.D)*bump,pan=tag==='vlei'?w:0,zC=dedans?1-sm(0,46,ej):1;
     const dep=1-sm(300,1000,s9);H+=46*dep;A=Math.max(70*K,A-60*K*dep);        // LE DÉPART : le belvédère — la route domine les collines, la vue s'ouvre sur le désert d'en bas
     const wo=sm(so-220,so+120,s9);if(wo>0){H+=(38-H)*wo;A+=(90*K-A)*wo;D+=(14-D)*wo;pan=pan+(.5-pan)*wo;zC*=1-wo*.35;} // L'OASIS : la cuvette sous les derniers mètres
     S.H[i]=H*(1+.10*Math.sin(s9/870+ph[0]));S.A[i]=A*(1+.12*Math.sin(s9/610+ph[1]));S.D[i]=D;S.zC[i]=zC;S.pan[i]=Math.min(1,pan);S.gd[i]=0;
     S.ob[i]=(ob0!=null&&ob1!=null&&s9>=ob0-120&&s9<=ob1+120)?1:0;}}
  // le FOND : la route lissée sur ±300 m, moins la profondeur ; au loin, une mer plus haute (90 m sous la route, bien plus bas au départ : on domine le désert) et plus calme
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.y[i];
   for(let i=0;i<NS;i++){const a9=Math.max(0,i-w),b9=Math.min(NS,i+w+1),ys=(c[b9]-c[a9])/(b9-a9);S.B[i]=ys-S.H[i];S.Yf[i]=ys-90-DN_SEG.haut*(1-sm(0,2600,i*DS));}}
  // la PORTÉE de chaque échantillon : jusqu'où le plafond ou le plancher a encore un mot à dire
  const RH=ROAD_HALF,TH=THICK;
  for(let i=0;i<NS;i++){const top=S.y[i]-TH-S.D[i],Pm=S.B[i]+S.A[i]*.9*(1-.85*S.pan[i]),Pn=S.B[i]-S.A[i]*.35,sl=.75-.63*S.gd[i]; // (la dune monte jusqu'à 0,82 A : marge)
    let re=RH+6+Math.max(0,Pm+20-top)/sl;if(S.zC[i]>.01)re=Math.max(re,RH+3+Math.max(0,top-1-Pn-.40*(RH-5))/.64);
    S.RE[i]=Math.min(900*K,Math.max(re,RH+40)+30);}
  // L'OASIS : un lac sous les derniers mètres de la route, 16 m sous la dalle au plus bas
  let oa=null;{const sC=Math.max(0,L-200*K),iC=Math.min(NS-1,Math.round(sC/DS));let yb=1e9;for(let i=Math.max(0,Math.round((L-700*K)/DS));i<NS;i++)yb=Math.min(yb,S.y[i]-TH-16);
    oa={x:S.x[iC],z:S.z[iC],r:210*K,y:yb-2};}
  const D9=DN_DECO.on?dnTirage(seed):null;DN.deco=D9; // (2026-10-20) LE DÉSERT AU HASARD : le tirage du décor (son flux à lui)
  if(D9){if(D9.oasis.k>0)oa.r*=D9.oasis.k;else oa=null;}                                    // l'oasis : petite, grande… ou un mirage (pas d'eau)
  // LES RACCOURCIS (pour le banc) : la zone de saut et la sortie, l'écart, la chute
  DN.rac=[];for(const nm of Object.keys(sQ).filter(function(k){return /^rac[A-Z]0$/.test(k);}).map(function(k){return k.slice(0,4);}).sort()){const a0=sQ[nm+'0'],a1=sQ[nm+'1'],b0=sQ[nm+'2'],b1=sQ[nm+'3'];if(a0==null||a1==null||b0==null||b1==null)continue;
    const o={nm:nm,haut:[a0,a1],bas:[b0,b1],gain:Math.round(b0-a1),dh:1e9,lat:0};
    for(let s9=a0;s9<=a1;s9+=40){const i=Math.min(NS-1,Math.round(s9/DS));let bj=-1,bd=1e18;for(let j=Math.round(b0/DS);j<=Math.min(NS-1,Math.round(b1/DS));j++){const d=(S.x[j]-S.x[i])**2+(S.z[j]-S.z[i])**2;if(d<bd){bd=d;bj=j;}}
      if(bj<0)continue;const lat=Math.sqrt(bd),dh=S.y[i]-S.y[bj];if(lat<120&&dh<o.dh){o.dh=Math.round(dh);o.lat=Math.round(lat);}}
    DN.rac.push(o);}
  // LE VENT de la map : il souffle à peu près dans l'axe de la descente (les crêtes coupent la route en travers), à ±35°
  {const dx=S.x[NS-1]-S.x[0],dz=S.z[NS-1]-S.z[0],a=Math.atan2(dx,dz)+(r()-.5)*1.2,b=a+.49;DN.vent=[Math.sin(a),Math.cos(a),Math.sin(b),Math.cos(b)];DN.lam=(520+r()*90)*K;
   if(D9){const a2=Math.atan2(dx,dz)+D9.vent.a,b2=a2+D9.vent.b;DN.vent=[Math.sin(a2),Math.cos(a2),Math.sin(b2),Math.cos(b2)];DN.lam*=D9.vent.lamK;}} // (2026-10-20) le vent TIRÉ : sa direction, la houle en biais, la longueur des dunes (les rides suivent)
  /* LES LÈVRES (une par saut) : s = la lèvre (la dernière dalle du segment), e = la première dalle du suivant, aim = la distance visée depuis la lèvre — le saut + 30 % du segment
     d'en face (60 m au plus) : la caisse s'y pose, à n'importe quelle vitesse (voir dnLevre) */
  DN.lev=[];TV.forEach(function(t,j){const sN=j+1<TV.length?TV[j+1].s0:L,seg=Math.max(30,sN-t.s1);DN.lev.push({s:t.s0,e:t.s1,aim:(t.s1-t.s0)+Math.min(60,seg*.3),seg:Math.round(seg),tag:(gp[j]&&gp[j].tag)||'saut'});});
  DN.S=S;DN.ms={ech:Math.round(performance.now()-t0)};
  dnPlanScenes(S,K,RH,D9);for(let i=0;i<NS;i++)if(S.pw[i]>0)S.RE[i]=Math.min(900*K,S.RE[i]+S.pw[i]+120); // (2026-10-22) les scènes : leurs plateaux entrent dans le profil de la route (dunes-4.js)
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'dunesSoir']||BIOMES.dunesSoir,cA=bio9.cyA||[6,-110,0,0];
  const opt={K:K,seed:seed,RH:RH,TH:TH,sQ:sQ,sun:[cA[0],cA[1]],vent:DN.vent,lam:DN.lam,oa:oa,fin:{x:S.x[NS-1],z:S.z[NS-1]},sb:!DN_BUTTES,vol:DN.scnV||[],Af:150*K,deco:D9,pal:{dnPlat:PAL.b('dnPlat',64),dnFin:PAL.b('dnFin',12),dnOmbre:PAL.b('dnOmbre',44)}};
  DN.oa=oa;DN.fin=opt.fin;DN.sb=opt.sb;DN.t0=t0;
  const W=started&&!/[?&]dnw=0\b/.test(location.search)?dnTravailleur():null;
  if(W){const job=DN.job;DN.attente={job:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz});return;}catch(e){console.warn('dunes : travailleur',e);DN.attente=null;}}
  dnMondePose(dnMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function dnTravailleur(){if(DN.w!==undefined)return DN.w;
  try{const fns=[mulberry32,cyNz,cyBil,dnDune,dnMesa,dnHauteur,dnProfil,dnPyr3,dnPrevoir,dnPrevoirDeco,dnOmbre,dnMondeCalc].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var CY={},DN={},DN_O9={},PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};\n"+fns+
      "\nonmessage=function(e){var m=e.data;CY={nz:m.nz};DN={};PAL.B=m.opt.pal;var R=dnMondeCalc(m.S,m.opt);R.job=m.job;"+
      "postMessage(R,[R.Z.d.buffer,R.F.c.buffer,R.O.h.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const R=e.data;if(!DN.attente||R.job!==DN.job)return;DN.attente=null;try{dnMondePose(R);}catch(er){console.warn('dunes : pose',er);}};
    W.onerror=function(e){console.warn('dunes : travailleur en erreur',e.message);DN.w=null;const a=DN.attente;DN.attente=null;if(a&&a.job===DN.job)try{dnMondePose(dnMondeCalc(a.S,a.opt));}catch(er){console.warn('dunes',er);}};
    DN.w=W;}catch(e){DN.w=null;}
  return DN.w;}
/* LA POSE : les données du monde dans DN (la collision), à la puce (trois textures), les décors — et le sable s'allume */
function dnMondePose(R){
  if(!DN.mat||!(LVL.cur&&LVL.cur.piste==='dunes'))return;const t4=performance.now();
  DN.Z=R.Z;DN.F=R.F;DN.O=R.O;DN.ob=R.ob||[];DN.pyr=R.pyr||null;DN.pyrs=R.pyrs||(DN.pyr?[DN.pyr]:[]);DN.mo=R.mo||[];DN.yMin=R.yMin;DN.yMax=R.yMax;Object.assign(DN.ms,R.ms);
  const F=R.F,Z=R.Z,O=R.O;
  const dt=(d,w,h,fmt,typ,inf)=>{const t=new THREE.DataTexture(d,w,h,fmt,typ);if(inf)t.internalFormat=inf;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  for(const k of ['tC','tZ','tS'])if(DN[k])DN[k].dispose();
  DN.tC=dt(F.c,F.nx,F.nz,THREE.RGFormat,THREE.FloatType,'RG32F'); /* (comme le canyon) r128 ne connaît pas RG + flottant sans le format nommé */
  DN.tZ=dt(Z.d,Z.nx,Z.nz,THREE.RGBAFormat,THREE.FloatType);DN.tS=dt(O.h,O.nx,O.nz,THREE.RedFormat,THREE.FloatType,'R32F');
  const U=DN.mat.uniforms;U.uTC.value=DN.tC;U.uTZ.value=DN.tZ;U.uTS.value=DN.tS;
  U.uFD.value.set(F.x0-F.ts*.5,F.z0-F.ts*.5,1/(F.nx*F.ts),1/(F.nz*F.ts));U.uFN.value.set(F.nx,F.nz);
  U.uZD.value.set(Z.x0-Z.ts*.5,Z.z0-Z.ts*.5,1/(Z.nx*Z.ts),1/(Z.nz*Z.ts));U.uZN.value.set(Z.nx,Z.nz);
  U.uSD.value.set(O.x0-O.ts*.5,O.z0-O.ts*.5,1/(O.nx*O.ts),1/(O.nz*O.ts));U.uSN.value.set(O.nx,O.nz);
  U.uW.value.fromArray(DN.vent);U.uLam.value=DN.lam;if(DN.fin)U.uFin.value.set(DN.fin.x,DN.fin.z,0,DN.sb?1:0);const oa=DN.oa;if(oa)U.uOA.value.set(oa.x,oa.z,oa.r,oa.y);else U.uOA.value.set(0,0,0,0);
  DN.on=true;DN.mesh.visible=true;
  try{dnMonuments(DN.job);}catch(e){console.warn('dunes : décors',e);}
  DN.ms.pose=Math.round(performance.now()-t4);DN.ms.total=Math.round(performance.now()-(DN.t0||t4));
}
