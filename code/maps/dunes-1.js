/* <<<DUNES>>> */
/* =========================== LES DUNES D'OR — LA ROUTE CONTINUE (2026-10-22, Léo : « les sauts sont ignobles, la route se coupe comme avec un ciseau digital — j'aimerais que les routes qui font sauter EMBRASSENT
   une haute colline de sable, et le joueur peut à la fois piquer en bas ou décoller… je veux niveau 100 ») ===========================
   (Avant : le SURF de Sacha, 2026-10-20 — des îlots de route séparés par des sauts, des trous dans le ruban.) LE CONCEPT : UN RUBAN CONTINU, posé sur de grosses dunes. Un désert de dunes géantes ; la route y est une suite de
   VAGUES. Chaque vague : la MONTÉE (un arc qui ENLACE une colline — le sable monte au-dedans de l'arc, il tombe au-dehors), la CRÊTE (la courbe verticale s'arrondit ; l'APEX est le tremplin, `dnLevre`), la DESCENTE (une droite
   sur l'ÉPERON, l'avalanche de chaque côté), le CREUX (on y tourne, entre deux collines ; les LIEUX : l'allée des obélisques, la cuvette d'argile, la place des colosses). Départ tout en haut (le belvédère), arrivée à l'oasis,
   le portail se voit au loin entre les trois pyramides de Gizeh.
   · LA ROUTE (`genDunes`) : UNE courbe (la caisse, la caméra, la distance, le pilote la lisent comme avant), sans aucun TROU. La pente est la courbe `GN` (u → pente, linéaire entre ses nœuds : des raccords PARABOLIQUES, jamais
     d'angle) ; l'altitude en est l'intégrale. `DN.fe` = les vagues, `DN.Q` = leurs repères (voir buildDunes).
   · LE TERRAIN (`buildDunes`, `dnProfil`) : le sable est PRESCRIT près de la route (une berme plate 1,6 m sous le bitume, puis la colline, l'encoche de la crête ou l'éperon qui tombe jusqu'à la mer), fondu dans le désert
     (grille fine F : [hauteur, poids]).
   · LES TREMPLINS : une caisse qui franchit l'apex à plus de 90 km/h est lancée pour retomber SUR la route de la descente ; en l'air, le pouce vers le bas pique, sinon on plane.
   Console : `dbgDunes()` (état) · `dbgDunes('test')` (le sable sous le bitume ?) · `dbgDunes('ech', s0, s1)` (le terrain prescrit) · `dbgDunes('sauts')` · `dbgDunes('vueA', s, h, cap, pente)` (photo figée) · `?carte=dunes&meteo=soir`. */
const NIV_DUNES={id:'dunes',nm:"LES DUNES D'OR",bio:['dunesSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'dunes',pr:'DE CRETE EN CRETE'};
const DUNES_OK=CANYON_OK; // les mêmes besoins que le canyon : textures de données en flottants, lecture de textures au sommet
PAL.B.dnFin=[16,14,12];PAL.B.dnPlat=[96,80,64];PAL.B.dnOmbre=[60,52,44];PAL.B.dnGrille=[16,16,32];PAL.B.dnR0=[85,100,118];PAL.B.dnArbres=[50,90,140];PAL.B.dnPalmes=[22,34,48];PAL.B.dnPart=[600,1100,1600];PAL.B.dnMo=[0,.75,1];PAL.B.dnRuines=[.35,.7,1];PAL.B.dnMat=[0,.5,1];PAL.B.dnTors=[10,18,28];PAL.B.dnTouffes=[30,70,120];PAL.B.dnMorts=[8,18,28]; /* (2026-10-21, embellissement) dnMat = le grain / les crêtes qui filent (0 = éteint sur les vieux téléphones) ; dnTors, dnTouffes, dnMorts : le plan moyen */ // (2026-10-22) la mosaïque du sable et des pierres (0 = éteinte sur les vieux téléphones) · le nombre de ruines éparses // la finesse par palier [ancien, moyen, récent]
const DN={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,S:null,job:0,attente:null,grp:null,
  ombre:1,ecrit:false,ob:[],pyr:null,pyrs:[],gp:[],fe:[],lev:[],mo:[],deco:null,tor:[],oa:null,rac:[],vent:[1,0,1,0],lam:560,car:[],sep:0,rmin:0}; // (les textes : avec les ambiances des dunes, I18N n'existe pas encore ici)
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
/* (2026-10-25, Sacha : « des dunes beaucoup plus larges, de grandes descentes, de grandes remontées, des virages où la route est très penchée puis redescend — surfer dans le Sahara ») LES GRANDES DUNES : quand la map est allongée (longueurCible,
   route-sans-haut.js : 3 fois la durée), chaque vague grandit — k : toutes les longueurs (montée, crête, épaule, descente, creux), rk : les rayons des virages, hk : la hauteur et la largeur des collines (buildDunes),
   lamK : la longueur d'onde des dunes du désert — et la route se couche jusqu'à `bank` dans les grands virages, avec des HOULES (deux grands virages de sens opposé, la dalle qui bascule d'un bord à l'autre).
   `?sans=dunesgrandes` = les vagues d'avant. */
const DN_BIG={on:!/[?&]sans=([^&]*,)?dunesgrandes(,|&|$)/.test(location.search),k:1.8,rk:1.5,hk:1.4,lamK:1.5,bank:36};
const DN_BANK={on:!/[?&]sans=([^&]*,)?dunesbank(,|&|$)/.test(location.search),max:(DN_BIG.on?DN_BIG.bank:22)*Math.PI/180}; /* (2026-10-23) L'INCLINAISON de la route dans les virages : max = l'angle plafond (les nuages montent à 50°) · `?sans=dunesbank` = la route plate d'avant */
const DN_HZ={axe:20,kL:.94,lim:64},DN_SEG={D:2.6,H:34,A:150,haut:260}; // DN_SEG : la profondeur de la mer de dunes sous la route, sa hauteur, et `haut` : de combien le désert lointain est plus bas au départ (m)
/* (2026-10-22, Léo : « les routes qui font sauter embrassent une haute colline de sable… le joueur peut piquer en bas ou décoller… je veux niveau 100 » — LA ROUTE CONTINUE) Plus de trou, plus de lèvre coupée :
   la route est UN ruban, posé sur de grosses dunes. Chaque VAGUE : la MONTÉE (un arc qui ENLACE une colline : le sable monte au-dedans, tombe au-dehors), la CRÊTE (la courbe verticale
   s'arrondit, l'apex est le tremplin — `dnLevre`), la DESCENTE (une droite sur l'éperon, l'avalanche de chaque côté : on s'y pose), le CREUX (on y tourne, entre deux collines). La pente est la
   COURBE `GN` (u → pente, linéaire entre ses nœuds : des raccords PARABOLIQUES, jamais d'angle) ; l'altitude en est l'intégrale. Les caractéristiques de chaque vague (`DN.fe`) disent à buildDunes
   où le sable monte, de quel côté, de combien. */
function* genDunes(rnd){ // (LE PRÉ-BÂTI) un générateur, comme genCanyon : il rend la main entre deux étapes
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;TROUMARK.length=0; /* (aucun TROU : la route est continue) */
  const LV=lvPiste(),g0=(rnd()*4294967296)>>>0,LC9=typeof longueurCible==='function'?longueurCible():0;
  const LL0=1+Math.min(1.3,(LV-1)*.5),WK=DN_BIG.on&&LC9?DN_BIG.k/(1+(LL0-1)*.35):1,LL=LL0*WK; // WK : l'échelle des grandes dunes (1 = les vagues d'avant, hors du JOUER) — elle fond avec le palier : la route y grandit déjà avec la vitesse, il doit rester 5 vagues et plus
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);DN.rmin=Math.round(RMIN);
  const RM=RMIN*(WK>1?DN_BIG.rk:1); // le rayon des virages des vagues (RMIN reste le plancher de arc : le rayon que la caisse tient)
  const r=mulberry32(g0),C=[],U=[],Q={},FE=[],GN=[],P=new THREE.Vector3(0,0,0),LIM=DN_HZ.lim*Math.PI/180;let phi=0,uh=0,gP=-.04;
  const push=()=>{C.push(P.clone());U.push(uh);},ici=k=>{Q[k]={p:P.clone(),phi:phi,i:C.length-1};},lib=sg=>(LIM-sg*phi)*57.2958,gn=(u,g)=>GN.push([u,g]);
  const droite=(l,n)=>{n=n||Math.max(2,Math.round(l/34));for(let k=0;k<n;k++){P.x+=Math.sin(phi)*l/n;P.z+=Math.cos(phi)*l/n;uh+=l/n;push();}};
  const arc=(aDeg,R)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi)*ch;P.z+=Math.cos(phi)*ch;uh+=ch;phi+=st/2;push();}};
  const vir=(sg,a,R)=>{let l9=lib(sg);if(l9<12){sg=-sg;l9=lib(sg);}arc(sg*Math.max(6,Math.min(a,l9)),R);return sg;}; // un virage, jamais au-delà de la butée du cap ; rend le sens pris
  const recentre=()=>{if(Math.abs(phi)>.10)arc(-phi*57.2958,RM*(2.1+r()*.6));};
  // LE CREUX d'une vague : là où l'on tourne (la descente et la montée, elles, sont des arcs et des droites posés)
  const creux=t=>{
    if(t==='S'){const a=26+r()*22,R=RM*(1.45+r()*.7);const sg=vir(r()<.5?-1:1,a,R);vir(-sg,a*(.85+r()*.35),R);}
    else if(t==='balayage'){const a=42+r()*26,R=RM*(2.0+r()*.8);vir(r()<.5?-1:1,a,R);}
    else if(t==='houle'){const a=46+r()*16,R=RM*(2.3+r()*.8),s1=vir(r()<.5?-1:1,a,R);droite((70+r()*70)*LL);vir(-s1,a*(.9+r()*.25),R);} // LA HOULE (grandes dunes) : deux larges virages de sens opposé, la dalle bascule d'un bord à l'autre
    else if(t==='serpent'){let sg=r()<.5?-1:1;for(let k=0;k<3;k++){const a=24+r()*14;sg=vir(sg,a,RM*(1.3+r()*.4));sg=-sg;}}
    else{const sg=vir(r()<.5?-1:1,26+r()*20,RM*(1.7+r()*.6));droite((30+r()*30)*LL);vir(-sg,16+r()*14,RM*(1.7+r()*.6));}}; /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : le creux « droit » est un S souple */
  const ond=l=>{const s0=r()<.5?-1:1;droite(l*.3);const s1=vir(s0,12+r()*10,RM*(3+r()*1.2));droite(l*.2);vir(-s1,12+r()*10,RM*(3+r()*1.2));droite(l*.3);}; /* l'allée et la place ondulent : deux souples virages de 12-22° au lieu d'une droite de 310-400 m */
  // le fond d'une vague : on tourne, ou (l'allée, la cuvette d'argile) on roule droit entre deux rangées de décors
  const valle=fe=>{const u0=uh;
    if(fe.sp==='avenue'){recentre();ici('obel0');ond((310+r()*60)*LL);ici('obel1');}
    else if(fe.sp==='plaza'){recentre();ond((340+r()*70)*LL);}
    else if(fe.sp==='rythme'){recentre();droite(84*LL);const nH=4+((r()*2)|0),W=(100+r()*22)*LL,gH=.20+r()*.05,uS=uh;ici('w'+fe.n+'a');
      gn(uS-30,fe.gv);for(let j=0;j<=2*nH;j++)gn(uS+j*W/2,(j&1?-1:1)*gH);                       // LE RYTHME : une onde triangulaire de pente ±gH (les crêtes arrondies par le ruban lui-même) — chaque bosse est un petit tremplin
      droite(W/4);for(let k=0;k<nH;k++){ici('w'+fe.n+'_'+k);droite(k<nH-1?W:W*.75);}ici('w'+fe.n+'b');gn(uh+30,fe.gv);droite(70*LL);fe.nh=nH;}
    else if(fe.sp==='vlei'){ici('vlei0');creux('balayage');recentre();droite((60+r()*40)*LL);ici('vlei1');}
    else{creux(fe.vt);recentre();}
    const pl=fe.sp==='avenue'||fe.sp==='plaza'||fe.sp==='vlei'||fe.sp==='rythme';
    const mn=fe.pt?100:pl?130:180;if(uh-u0<mn*LL)droite(mn*LL-(uh-u0));
    if(fe.sp!=='rythme'&&!fe.pt){const rl=pl?.04:.11+r()*.07,u1=u0+55,u2=u0+105,u3=u0+150;gn(u1,fe.gv+rl);gn(u2,fe.gv-rl*.9);gn(u3,fe.gv+rl*.5);} /* (Sacha, v827 : montagnes russes) */ /* LE CREUX ROULE : deux petites ondulations (± 4 m) avant la vague suivante — le sol n'est plus plat */
    };
  // UNE VAGUE : montée (le chemin enlace une colline), crête (l'apex = le tremplin), descente (l'éperon), puis le creux — `o.sg` : le côté où tourne l'arc, `o.fin` : la dernière (l'oasis)
  let sgC=r()<.5?-1:1;
  const vague=o=>{const n=FE.length,kb=o.big?1.3:1,kv=o.big?1.14:1,pt=o.petite?1:0,fe={n:n,S:!pt&&r()<.30,notch:r()<.5,ferme:r()<.6,gm:(pt?.10+r()*.05:(.115+r()*.085)*kv)*1.3,gl:(pt?.15+r()*.06:(.195+r()*.09)*kv)*1.3,g1:pt?.04+r()*.03:.05+r()*.04,Lc:0,gv:-(.020+r()*.028),
      vt:pt?['S','balayage','droit'][(r()*3)|0]:(WK>1?['S','balayage','serpent','houle','houle','droit']:['S','S','balayage','serpent','droit'])[(r()*(WK>1?6:5))|0],sp:o.sp||'',big:o.big?1:0,fin:o.fin?1:0,sg:0,sg2:0,K:kb,pt:pt};fe.Lc=(72+r()*30)*LL*(pt?.8:1+Math.max(0,fe.gm+fe.g1-.2)*1.6);FE.push(fe); /* (2026-10-23, Léo : « la route est trop plate… comme le jeu du pingouin ») des collines 2 fois plus hautes : des montées à 12-20 %, des descentes à 20-30 %, la crête plus longue pour que sa courbe reste franche mais jamais coupée */
    ici('m'+n+'a');{const uM=uh;gn(uM-40,gP);gn(uM+40,fe.gm);}
    droite((14+r()*30)*LL*kb);
    if(!fe.S){const a=(pt?32:44)+r()*(pt?22:30),R=RM*(pt?1.2+r()*.8:1.35+r()*1.25)*kb,s9=vir(sgC,a,R);fe.sg=-s9;}                                   // l'arc : la colline est AU-DEDANS (le côté σ = −signe du virage)
    else{const a=34+r()*22,R=RM*(1.5+r()*.5),s1=vir(sgC,a,R);droite((16+r()*20)*LL);ici('m'+n+'s');const s2=vir(-s1,a*(.8+r()*.4),RM*(1.5+r()*.6));fe.sg=-s1;fe.sg2=-s2;}
    ici('m'+n+'b');
    droite(14*LL+fe.Lc/2);ici('c'+n);{const uA=uh;gn(uA-fe.Lc/2,fe.gm);gn(uA+fe.Lc/2,-fe.g1);}                         // l'apex, au milieu de sa courbe verticale
    /* L'ÉPAULE (2026-10-23, Léo : « comme le jeu du pingouin où il faut atterrir pour prendre la vitesse ») — MESURÉ : à la vitesse de la caisse (190 m/s) une descente à 17 % file sous la parabole du vol, la caisse ne se pose qu'en BAS (2 s, choc de 67) ;
       pour qu'elle atterrisse SUR la pente il faut une pente DOUCE (5-9 %) pendant ~200 m après l'apex : l'ÉPAULE, où l'on se pose — puis la DESCENTE RAIDE (20-29 %, qui zigzague) où la gravité rend la vitesse : décoller, se poser sur l'épaule, plonger. */
    {const Ls=(o.fin?110:pt?95+r()*30:125+r()*55)*LL*kb;droite(Ls);ici('e'+n);gn(uh,-fe.g1);gn(uh+80,-fe.gl);}
    {const dl=(o.fin?330+r()*60+(o.xtra||0)*.5:pt?105+r()*40:125+r()*55)*LL*kb;if(o.fin)droite(dl);else{const f1=.45+r()*.12;droite(dl*f1);{const s9=vir(r()<.5?-1:1,20+r()*18,RM*(2+r()*1.1));vir(-s9,14+r()*14,RM*(2+r()*1.1));}droite(Math.max(dl*(1-f1)*.6,60*LL));}} /* la descente zigzague toujours : un virage et son contre-virage */ /* LA DESCENTE ZIGZAGUE : un balayage entre deux dunes */
    ici('d'+n);{const uL=uh,gv=o.fin?-.015:fe.gv;gn(uL-50,-fe.gl);gn(uL+50,gv);gP=gv;}
    if(o.fin){ici('oasis0');creux('S');recentre();droite(170*LL+(o.xtra||0)*.5);ici('fin');droite(150,2);}
    else valle(fe);
    sgC=r()<.75?-sgC:sgC;};
  const B=LC9?LC9*DN_HZ.kL*(.92+r()*.16):5300*LL,FIN=1120*LL,LEN9={'':900,avenue:1300,vlei:900,plaza:1400,rythme:1300}; // FIN : la dernière vague (l'oasis) et la route d'après · LEN9 : la longueur d'une vague selon son lieu (mesurée au banc)
  // LE DÉPART : le belvédère, tout en haut — une droite pour s'élancer, un virage, puis la 1re colline
  push();ici('depart');gn(0,gP);droite(160*LL);creux('balayage');recentre();ici('erg0'); // (l'ouverture est DOUCE : un seul grand balayage — la caisse part très vite)
  /* LES LIEUX : des creux LONGS (la place où se posent les scènes) — l'allée des obélisques, la cuvette d'argile, la place des colosses —, tirés dans l'ordre ; le premier creux reste calme */
  const plan=['avenue','vlei','rythme','rythme'];for(let i=plan.length-1;i>0;i--){const j=(r()*(i+1))|0,x9=plan[i];plan[i]=plan[j];plan[j]=x9;}plan.unshift('plaza');plan.unshift(''); // (la PLACE des colosses : toujours le 1er lieu — la signature de la map ; les autres lieux sont tirés)
  const grande=1+((r()*2)|0);let nv=0;
  while(nv<(WK>1?16:9)){const sp9=plan[nv]||'',pt=!sp9&&nv>=2&&nv!==grande&&r()<.6;if(!(nv<2||B-(uh+FIN)>(pt?640:LEN9[sp9])*LL*.4))break;vague({sp:sp9,big:nv===grande,petite:pt});nv++;yield;} // (2026-10-23) des PETITES vagues entre les grandes : une colline plus basse, un creux court — pas deux fois la même vague
  vague({fin:true,xtra:Math.max(0,Math.min(500*WK,B-(uh+FIN)))}); // (le reste du budget de longueur va à la descente finale et à la droite d'arrivée)
  // LES ALTITUDES : GN = (u, pente), linéaire entre deux nœuds (des raccords PARABOLIQUES : crêtes et creux arrondis) ; y est l'intégrale de la pente le long de la route
  {const gAt=u=>{if(u<=GN[0][0])return GN[0][1];for(let k=1;k<GN.length;k++)if(u<=GN[k][0]){const a=GN[k-1],b=GN[k],t=(u-a[0])/Math.max(1e-6,b[0]-a[0]);return a[1]+(b[1]-a[1])*t;}return GN[GN.length-1][1];};
   C[0].y=0;for(let k=1;k<C.length;k++){const a=U[k-1],b=U[k],du=b-a;C[k].y=C[k-1].y+du*(gAt(a)+4*gAt(a+du/2)+gAt(b))/6;}}
  // l'AXE : toute la route tournée autour du départ (le soleil de l'heure, lui, reste celui du monde)
  const ax=(r()-.5)*2*DN_HZ.axe/57.2958,ca=Math.cos(ax),sa=Math.sin(ax),tr=v=>{const x=v.x;v.x=x*ca+v.z*sa;v.z=v.z*ca-x*sa;};
  for(const v of C)tr(v);for(const k in Q){tr(Q[k].p);Q[k].phi+=ax;}
  for(const k in Q){const o=Q[k];o.p.copy(C[Math.max(0,Math.min(C.length-1,o.i))]);} // (le repère = le point de contrôle où il a été posé : l'index, pas la plus proche distance — le y du repère n'était pas tenu)
  /* L'INCLINAISON (2026-10-23, Léo : « la route qui se plie un peu, la voiture qui peut rouler en biais petit à petit, moins que dans les nuages, histoire de zigzaguer autour des dunes ») — dans chaque virage la dalle se couche vers
     l'INTÉRIEUR (la courbure du plan, moyennée sur ±55 m, pliée par un tanh : 22° au plus, les nuages vont à 50°), jamais autour d'un tremplin (de 70 m avant l'apex à 150 m après : la caisse décolle et se pose à plat). Les NORMALES
     (une par point de contrôle) servent à buildTrack comme celles de la route des nuages (TORD.N, sans le reste : la gravité reste la gravité) ; buildDunes en tire l'angle de chaque échantillon (S.bk) pour que le sable suive la dalle. */
  DN.bankN=null;
  if(DN_BANK.on){const n=C.length,sc=new Float32Array(n),kap=new Float32Array(n),hh=new Float32Array(n),bk=new Float32Array(n),sm9=(a9,b9,x)=>{const t=Math.max(0,Math.min(1,(x-a9)/(b9-a9)));return t*t*(3-2*t);};
    for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
    for(let i=0;i<n;i++){const a9=C[Math.max(0,i-1)],b9=C[Math.min(n-1,i+1)];hh[i]=Math.hypot(b9.x-a9.x,b9.z-a9.z)/2||1;}
    for(let i=1;i<n-1;i++){const ax=C[i].x-C[i-1].x,az=C[i].z-C[i-1].z,bx=C[i+1].x-C[i].x,bz=C[i+1].z-C[i].z,la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;kap[i]=Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((la+lb)/2);}
    const kref=1/((WK>1?3.2:2.4)*RM),W9=WK>1?55*WK:55; // (grandes dunes : l'angle se prend sur une plus longue portion, et les larges virages le gagnent aussi)
    for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W9;j--){sw+=hh[j];sk+=kap[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W9;j++){sw+=hh[j];sk+=kap[j]*hh[j];}bk[i]=DN_BANK.max*Math.tanh((sk/sw)/kref);}
    const sA=[];for(const k in Q)if(/^(c\d+|w\d+_\d+)$/.test(k))sA.push(sc[Q[k].i]);
    DN.bankN=[];let mx=0;
    for(let i=0;i<n;i++){let m=1;for(const s9 of sA){const d=sc[i]-s9,o9=Math.max(-70-d,d-150,0);m=Math.min(m,sm9(0,50,o9));}
      m*=sm9(0,70,sc[i]);const b9=bk[i]*m,a9=C[Math.max(0,i-1)],c9=C[Math.min(n-1,i+1)],tl=Math.hypot(c9.x-a9.x,c9.z-a9.z)||1,tx=(c9.x-a9.x)/tl,tz=(c9.z-a9.z)/tl;
      DN.bankN.push(new THREE.Vector3(-tz*Math.sin(b9),Math.cos(b9),tx*Math.sin(b9)));if(Math.abs(b9)>mx)mx=Math.abs(b9);}
    DN.bankMax=Math.round(mx*57.2958);}
  DN.Q=Q;DN.fe=FE;DN.gp=[];DN.sep=0;DN.hz={axe:Math.round(ax*57.2958),B:Math.round(B),LL:+LL.toFixed(2),WK:WK,hk:WK>1?DN_BIG.hk:1,lamK:WK>1?DN_BIG.lamK:1,RMIN:Math.round(RMIN),VN:Math.round(1.35*VW),sauts:FE.length,vagues:FE.length,pieces:FE.map(function(f){return f.sp||(f.big?'grande':f.fin?'fin':'vague');})};
  return C;
}
/* LA DUNE — la même fonction que la puce (dnDune du GLSL), lue dans le même bruit (cyNz) : W = [vent x, vent z, houle x, houle z], lam = la longueur
   d'onde (m). Rend la hauteur relative (0 au creux, ~1 au sommet) ; o.du (facultatif) = le profil de la grande dune seule (1 sur la crête). */
const DN_ACTES={on:!/[?&]sans=([^&]*,)?dunesactes(,|&|$)/.test(location.search)}; /* (2026-10-23, Léo : « brouillon… l'organisation et l'harmonie » → un VOYAGE EN ACTES) `?sans=dunesactes` = le tirage d'avant (un peu de tout partout) */
const DN_STAR=!/[?&]sans=([^&]*,)?dunesetoile(,|&|$)/.test(location.search); /* `?sans=dunesetoile` : le désert d'avant (crêtes parallèles partout) */
function dnDune(x,z,W,lam,o){ /* (le bruit lu aux SEULES grandes échelles, canal 0 : la 1re version lisait les canaux fins — 3 à 100 m — et faisait de la roche, MESURÉ au relief ombré hors GPU) */
  const u=(x*W[0]+z*W[1])/lam,v=-x*W[1]+z*W[0],w1=cyNz(x/30000,z/30000,0)-.5,w2=cyNz(x/11000+.37,z/11000+.61,0)-.5,w3=cyNz(x/5200+.83,z/5200+.17,0)-.5;
  const a=u+1.4*w1+1.05*w2+.34*w3,f=a-Math.floor(a);                                                       // les crêtes serpentent sur 1 à 7 km
  const p=f<.72?Math.pow(Math.max(f/.72,1e-5),1.5):Math.pow(Math.max((1-f)/.28,1e-5),1.15),n1=cyNz(v/9000+.13,a*.13+.5,0),m=.30+.70*Math.max(0,Math.min(1,(n1-.22)*1.9)); // face au vent douce, face d'avalanche raide ; pics et cols le long des crêtes
  const a2=(x*W[2]+z*W[3])/(lam*.40)+1.6*w2+.5*w3,f2=a2-Math.floor(a2);
  const p2=f2<.68?Math.pow(Math.max(f2/.68,1e-5),1.4):Math.pow(Math.max((1-f2)/.32,1e-5),1.1);              // la houle en biais, dans les creux surtout
  let h=p*m+.08*p2*(1-.75*p),du=p*m;
  /* LES DUNES ÉTOILÉES (2026-10-23, Léo : « les dunes sont trop répétitives ») — par plaques (un bruit de 16 km, ~30 % du désert) les crêtes parallèles cèdent la place à des PYRAMIDES de sable : trois houles à 120° dont les crêtes se croisent
     (la même fonction dans le GLSL de la puce : toute retouche ici se refait là-bas), les phases bougées par le bruit pour que le réseau ne se lise pas. */
  if(DN_STAR){const ts0=(cyNz(x/16000+.71,z/16000+.29,0)-.5-.20)/.14,ts=ts0<=0?0:ts0>=1?1:ts0*ts0*(3-2*ts0);
    if(ts>0){const k=6.2832/(lam*1.9),d2x=-.5*W[0]-.866*W[1],d2z=.866*W[0]-.5*W[1],d3x=-.5*W[0]+.866*W[1],d3z=-.866*W[0]-.5*W[1];
      const s1=Math.cos(k*(x*W[0]+z*W[1])+9*w3+5*w1),s2=Math.cos(k*(x*d2x+z*d2z)+8*w2+4*w3),s3=Math.cos(k*(x*d3x+z*d3z)+7*w3+5*w2);
      let st=(s1+s2+s3+1.5)/4.5;st=st<=0?0:st>=1?1:st;st=Math.pow(st,2.2);const hs=st*.95+.05*p2*(1-.5*st);h+=(hs-h)*ts;du+=(st-du)*ts;}}
  if(o)o.du=du;return h;}
/* LES BUTTES (2026-10-22, Léo : « le niveau dune n'est pas au niveau — regarde jade, la grotte, la forêt » : des masses qui dressent l'horizon, comme les pics de jade) — des plateaux de grès à flancs raides, ajoutés
   au sable LOIN de la route (dr = la distance à la route, 260 m → rien, 520 m → plein) : le masque est un seuil du bruit (canal 1, tuile de 6 km), le haut (70 à 180 m) un autre bruit (canal 2). Même
   fonction dans le GLSL de la puce (dnMesa de DN_VS) : toute retouche ici se refait là-bas. */
function dnMesa(x,z,dr){if(DN.sb)return 0;const n=cyNz(x/11000+.21,z/11000+.73,1),e=Math.max(0,Math.min(1,(n-.58)/.14)),m0=e*e*(3-2*e);if(m0<=0)return 0;
  const t=cyNz(x/1700+.5,z/1700+.1,2),f=Math.max(0,Math.min(1,(dr-260)/260)),w=f*f*(3-2*f),F9=DN.fin;let fe=1;if(F9){const q=Math.max(0,Math.min(1,(Math.hypot(x-F9.x,z-F9.z)-1800)/1200));fe=q*q*(3-2*q);} // (aucune butte autour de l'arrivée : les pyramides, l'oasis, le portail)
  return m0*w*fe*(70+110*t);}
const DN_O9={};
function dnFar(x,z,o){const Z=DN.Z;o=o||DN_O9;
  const zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts,B=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz),A=cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz),pan=cyBil(Z.d,Z.nx,Z.nz,4,3,zx,zz);
  const me=dnMesa(x,z,cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz)),mk=Math.max(0,Math.min(1,me/20)); // la butte : son haut est plat (les dunes s'effacent dessus)
  const dun=A*(dnDune(x,z,DN.vent,DN.lam)-.35)*(1-.85*pan)*(1-.92*mk)+me;o.dun=dun;o.B=B;return B+dun;}
/* LA HAUTEUR DU SABLE (2026-10-22, LA ROUTE CONTINUE) — la même que la puce (dnHt) : le DÉSERT (dnFar : le fond B, l'amplitude A, la cuvette `pan`, les buttes — grille de 64 m) et le TERRAIN PRESCRIT près de la
   route (grille fine : Hn = la hauteur voulue, w = son poids) : h = désert + w × (Hn − désert). Plus de plafond ni de plancher : la route porte son sable, il l'enlace. `o` (facultatif) reçoit eau (0/1), dun, B. */
function dnHauteur(x,z,o){const F=DN.F;o=o||DN_O9;let h=dnFar(x,z,o);
  const fx=(x-(F.x0-F.ts*.5))/(F.nx*F.ts),fz=(z-(F.z0-F.ts*.5))/(F.nz*F.ts);
  if(fx>0&&fz>0&&fx<1&&fz<1){const px=fx*F.nx,pz=fz*F.nz,w=cyBil(F.c,F.nx,F.nz,2,1,px,pz);if(w>0)h+=(cyBil(F.c,F.nx,F.nz,2,0,px,pz)-h)*w;}
  o.eau=0;const A9=DN.oa;if(A9){const rr=Math.hypot(x-A9.x,z-A9.z)/A9.r;if(rr<2.4){const q=rr<1?A9.y-12*(1-rr*rr):A9.y+(rr-1)*A9.r*.2;if(q<h)h=q;if(h<A9.y-.05){h=A9.y;o.eau=1;}}}
  return h;}
/* LE PROFIL EN TRAVERS : à dd mètres du bord de la berme, de combien le sable est au-dessus (ou au-dessous : négatif) du niveau de la berme. Hh > 0 : une COLLINE — le sable monte (~10° au bord, 25° au plus),
   arrive à Hh à Wh mètres (la crête), puis retombe à 31° vers le désert ; Hh < 0 : l'ÉPERON — il tombe de |Hh| (17° puis 33°) jusqu'à la mer ; Dn : la profondeur de la mer sous la berme. */
function dnPf(dd,Hh,Wh,Dn,sh){if(dd<=0)return 0;
  if(Hh>0){const t=dd/Wh;if(t<1){const dome=.45*t+.275*(1-Math.cos(Math.PI*t));return Hh*(sh>0?dome+(Math.pow(t,1.7)-dome)*sh:dome);} /* sh : 0 = le DÔME (rond, doux), 1 = la CRÊTE (plat près de la route, pointue au sommet) */const q=Hh-.60*(dd-Wh),k=16,hh=Math.max(k-Math.abs(q+Dn),0)/k;return Math.max(q,-Dn)+hh*hh*k/4;}
  const F=-Hh,dr=.30*dd+.36*(dd>26?dd-26:0),k=14,hh=Math.max(k-Math.abs(dr-F),0)/k;return -(Math.min(dr,F)-hh*hh*k/4*(dd<10?dd/10:1));}
/* le terrain PRESCRIT d'UN bras de route, vu depuis l'échantillon i0 (affiné ±4) : o.H = sa hauteur, o.d = la distance à l'axe, o.w = son poids contre le désert — faux hors de portée.
   La berme : le sable se tient 1,6 m sous le bitume sur 10 m au-delà du bord (la caisse qui décolle ne le voit pas, la dalle n'a qu'un liseré de tranche), puis le profil du côté (hP/wP, hM/wM). */
function dnProfil(S,RE,i0,x,z,o,RH,TH){
  let bd=1e18,bj=-1,bu=0;const a=Math.max(0,i0-4),b=Math.min(S.n-2,i0+4);
  for(let j=a;j<=b;j++){const ax=S.x[j],az=S.z[j],dx=S.x[j+1]-ax,dz=S.z[j+1]-az,l2=dx*dx+dz*dz||1;let u=((x-ax)*dx+(z-az)*dz)/l2;u=u<0?0:u>1?1:u;
    const px=ax+dx*u-x,pz=az+dz*u-z,d=px*px+pz*pz;if(d<bd){bd=d;bj=j;bu=u;}}
  if(bj<0)return false;const j=bj,u=bu,j1=j+1,d=Math.sqrt(bd);if(d>RE[j]+20)return false;
  const v=1-u,qx=x-(S.x[j]*v+S.x[j1]*u),qz=z-(S.z[j]*v+S.z[j1]*u),sg=(qz*(S.tx[j]*v+S.tx[j1]*u)-qx*(S.tz[j]*v+S.tz[j1]*u))>=0?1:-1, // le côté : le décalage (−tz, tx) est le côté +1
    Wf=Math.max(0,S.pw[j]*v+S.pw[j1]*u-RH-10),bkv=S.bk?S.bk[j]*v+S.bk[j1]*u:0,yb=S.y[j]*v+S.y[j1]*u-1.6-3*Math.abs(Math.sin(bkv))-7*Math.abs(S.y[j1]-S.y[j])/(S.ds||8)-sg*Math.min(d,RH+10+Wf)*Math.tan(bkv), /* la berme suit la dalle penchée (S.bk), puis garde son niveau ; +3·sin : la marge perdue quand l'angle bouge vite entre deux échantillons ; +7·pente : dans un arc sur une pente raide, le sable du bord extérieur lit l'échantillon voisin, plus haut (MESURÉ : 2 m à 20 %) */Dn=Math.max(2,yb-(S.B[j]*v+S.B[j1]*u)),
    Hh=sg>0?S.hP[j]*v+S.hP[j1]*u:S.hM[j]*v+S.hM[j1]*u,Wh=Math.max(24,sg>0?S.wP[j]*v+S.wP[j1]*u:S.wM[j]*v+S.wM[j1]*u);
  const p=dnPf(Math.max(0,d-RH-10-Wf),Hh,Wh,Dn,S.sP?(sg>0?S.sP[j]*v+S.sP[j1]*u:S.sM[j]*v+S.sM[j1]*u):0),rc=RH+10+Wf+(Hh>0?Wh+Hh/.6:-Hh/.34)+40,t9=Math.max(0,Math.min(1,(d-rc)/200)); // rc : où le profil a fini de dire son mot, puis 200 m de fondu vers le désert
  o.H=yb+p;o.d=d;o.w=1-t9*t9*(3-2*t9);return true;}
/* LES DÉCORS QUI COMPTENT POUR L'OMBRE ET LA COLLISION (ici ou dans le travailleur) : les obélisques et la grande pyramide — jamais près d'une route */
/* LES TROIS PYRAMIDES (2026-10-20, Sacha : « on voit le portail au loin, entre trois pyramides ») : au bout de la route, derrière le portail — deux grandes de chaque
   côté du cap d'arrivée (le portail passe entre elles), la plus haute au fond, dans l'axe : du départ, le portail se lit devant la grande, entre les deux. `st` : le style tiré
   (le décor au hasard : à gradins, lisse, étagée) — celui de la 1re, 2e, 3e pyramide du tirage, sinon à gradins. */
function dnPyr3(S,K,RH,r,sts){
  const pyrs=[],iE=S.n-1,i1=Math.max(0,iE-18);let hx=S.x[iE]-S.x[i1],hz=S.z[iE]-S.z[i1];const hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;const Ex=S.x[iE],Ez=S.z[iE]; // le cap d'arrivée (les 150 derniers mètres)
  const def=[[(370+r()*60)*K,-1,1.25,150+r()*80],[(400+r()*60)*K,1,1.25,330+r()*120],[(560+r()*60)*K,0,0,S.solD||(1500+r()*300)]]; // [demi-base, côté, écart latéral en demi-bases, recul derrière le portail]
  def.forEach(function(d,k){const hw=d[0],lat=d[1]?d[1]*(hw*d[2]+RH+80+r()*40):(r()-.5)*70,x=Ex+hx*d[3]-hz*lat,z=Ez+hz*d[3]+hx*lat,a=Math.atan2(hx,hz)+(r()-.5)*.5,st=sts&&sts[k]?sts[k]:'';
    let y=1e9,X=x,Z9=z;for(let t9=0;t9<(S.solD&&k===2?0:10);t9++){let bute=false;for(const q of [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]])if(dnMesa(X+q[0]*hw*1.1,Z9+q[1]*hw*1.1,1e9)>1.5)bute=true;if(!bute)break;X+=hx*hw*.5;Z9+=hz*hw*.5;} // (une butte sous une pyramide : on la repousse derrière)
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
  const fc=new Float32Array(fnx*fnz*2);
  const TQ=32,qnx=Math.ceil((fnx*TF)/TQ)+1,qnz=Math.ceil((fnz*TF)/TQ)+1,q1=new Int32Array(qnx*qnz).fill(-1),q2=new Int32Array(qnx*qnz).fill(-1),d1=new Float32Array(qnx*qnz).fill(1e9),d2=new Float32Array(qnx*qnz).fill(1e9),LEG=Math.round(560/S.ds);
  for(let i=0;i<NS;i+=4){const cx=(S.x[i]-F.x0)/TQ,cz=(S.z[i]-F.z0)/TQ,R9=RE[i]+48,rr=Math.ceil(R9/TQ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(qnz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(qnx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,dq=(ex*ex+ez*ez)*TQ*TQ;if(dq>R9*R9)continue;const d=Math.sqrt(dq),o=jz*qnx+jx;
      if(q1[o]<0||Math.abs(i-q1[o])<LEG){if(d<d1[o]){d1[o]=d;q1[o]=i;}}
      else if(d<d1[o]){q2[o]=q1[o];d2[o]=d1[o];q1[o]=i;d1[o]=d;}
      else if((q2[o]<0||Math.abs(i-q2[o])<LEG||d<d2[o])&&d<d2[o]){q2[o]=i;d2[o]=d;}}}
  /* (2026-10-22, LA ROUTE CONTINUE) Hn : la hauteur PRESCRITE (la berme, la colline, l'éperon, plus un peu du relief du désert qui revient avec la distance), w : son poids contre le désert — le
     désert lui-même (dnFar) PARTOUT ailleurs, pour que l'interpolation de Hn ne mélange jamais une case prescrite à une case sans valeur */
  const pf={},fo={},NC=fnx*fnz,fw=new Float32Array(NC),fh=new Float32Array(NC),fd=new Float32Array(NC);let nc=0,fymax=-1e9;
  // passe 1 : le terrain PRESCRIT de chaque case près de la route (la hauteur fh, son poids fw, la distance fd à l'axe) — deux bras proches se MÊLENT, le plus proche l'emporte (jamais le plus haut : une colline ne doit pas enterrer la route d'à côté)
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const qo=Math.min(qnz-1,Math.round(jz*TF/TQ))*qnx+Math.min(qnx-1,Math.round(jx*TF/TQ));if(q1[qo]<0)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF;let sa=0,sh=0,w9=0,d9=1e9;
    for(let c=0;c<2;c++){const i0=c?q2[qo]:q1[qo];if(i0<0||(c&&d2[qo]>RE[i0]+48))continue;if(!dnProfil(S,RE,i0,x,z,pf,RH,TH)||pf.w<=0)continue;
      const a9=pf.w*Math.exp(-pf.d/14);sa+=a9;sh+=a9*pf.H;if(pf.w>w9)w9=pf.w;if(pf.d<d9)d9=pf.d;}
    if(w9<=0||sa<=0)continue;const o=jz*fnx+jx;fw[o]=w9;fh[o]=sh/sa;fd[o]=d9;}
  /* passe 2 : Hn (le prescrit + un peu du relief du désert qui revient avec la distance) là où w > 0 ; le DÉSERT (dnFar) sur les cases voisines — l'interpolation de Hn ne mélange jamais une case prescrite à une case sans valeur ;
     partout ailleurs rien (w = 0 : le désert seul, et il n'est pas calculé : 3/4 de la grille d'une route en diagonale) */
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const o=jz*fnx+jx;let proche=fw[o]>0;
    if(!proche){const j0=Math.max(0,jz-1),j1=Math.min(fnz-1,jz+1),i0=Math.max(0,jx-1),i1=Math.min(fnx-1,jx+1);for(let jj=j0;jj<=j1&&!proche;jj++)for(let ii=i0;ii<=i1;ii++)if(fw[jj*fnx+ii]>0){proche=true;break;}}
    if(!proche)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF,hf=dnFar(x,z,fo);
    if(fw[o]>0){nc++;const rp=Math.max(0,Math.min(1,(fd[o]-RH-20)/90)),rr=rp*rp*(3-2*rp),hn=fh[o]+.40*rr*fo.dun;fc[o*2]=hn;fc[o*2+1]=fw[o];if(hn>fymax)fymax=hn;}
    else{fc[o*2]=hf;fc[o*2+1]=0;}}
  F.c=fc;DN.F=F;ms.fin=Math.round(performance.now()-t2);ms.texels=nc;
  const pv=dnPrevoir(S,opt.sQ,K,RH,r,opt.deco);DN.ob=pv.ob;DN.pyr=pv.pyr;
  // ---- 6. L'OMBRE : balayée une fois dans le sens du soleil de l'heure ----
  pv.sv=opt.vol||[];const t3=performance.now();dnOmbre(opt.sun[0],opt.sun[1],pv);ms.ombre=Math.round(performance.now()-t3);
  let yMax=-1e9,yMin=1e9;for(let o=0;o<znx*znz;o++){const b=zdat[o*4],a=zdat[o*4+2];if(b+a>yMax)yMax=b+a;if(b-a*.4<yMin)yMin=b-a*.4;}if(fymax>yMax)yMax=fymax;
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
  {D.pyr=[];for(let k=0;k<3;k++)D.pyr.push({st:k===0?ch(['cap','gradins','lisse','etagee'],[6,1.4,1.2,.8]):k===1?ch(['rouge','gradins','lisse','etagee'],[6,1.4,1.2,.8]):ch(['giza','lisse','gradins','etagee'],[7,1.4,1.4,1]),k:+(k?.38+rd()*.55:.6+rd()*.55).toFixed(2),ou:k===0&&rd()<.7?'oasis':'route'});} // (2026-10-22) le TRIO : Khéphren (le haut blanc), Mykérinos (la base rouge), Khéops (le parement lisse et l'électrum) — le tirage en garde d'autres de temps en temps
  D.sphinx=rd()<.45;D.colosses=ch([0,1,2],[2,1.4,.8]);D.temple=rd()<.45;D.portes=ch([0,1,2],[2,1.3,.6]);D.village=rd()<.38;
  D.camps=ch([0,1,2,3],[1.4,2,1.3,.6]);
  {const n=ch([1,2,3,4],[1.6,2,1.4,.8]);D.caravanes=[];for(let k=0;k<n;k++)D.caravanes.push({n:ent(4,11),k:+(.8+rd()*.5).toFixed(2),v:+(.8+rd()*.7).toFixed(2)});}
  D.flore={acacias:+ch([0,.5,1,1.6],[.8,1.5,2,1.2]).toFixed(2),epars:ch([0,12,30],[1.5,1.5,1]),palmeraies:ch([0,1,2],[1.4,1.6,.8]),touffes:ch([0,90,220],[1,1.6,1.4]),cactus:rd()<.22?ent(10,30):0};
  D.oasis={nm:ch(['normale','petite','grande','mirage'],[2,1.3,1.3,1]),k:1};D.oasis.k={normale:1,petite:.62,grande:1.4,mirage:0}[D.oasis.nm];
  D.tornades=ch([0,1,2,3],[1.6,1.4,1,.6]);D.tempete=rd()<.3?{a:+(rd()*6.28).toFixed(2)}:null;D.os=ch([0,1,3,5],[1.4,1.5,1.2,.7]);D.avion=rd()<.25;D.bateau=rd()<.25;
  /* LES ACTES : un décor DOMINANT par lieu (dunes-4.js, dnPlanScenes : le grand sphinx sur la place, l'allée, les dieux dans la vallée d'argile…) ; ici on retire l'éparpillement — plus de grands monuments isolés (les scènes les remplacent), ni village,
     campements, obélisques épars, os, épave, cactus, palmeraies éparses ; UN seul élément d'ambiance par map (une caravane au loin OU un diable de sable, ou rien : tiré par D.sd) */
  if(DN_ACTES.on){D.sphinx=false;D.colosses=0;D.temple=false;D.portes=0;D.village=false;D.camps=0;D.epars={k:0,br:0};D.os=0;D.avion=false;D.bateau=false;
    const am=D.sd%3;D.caravanes=am===0&&D.caravanes.length?[D.caravanes[0]]:[];D.tornades=am===1?1:0;D.flore.epars=0;D.flore.cactus=0;D.flore.palmeraies=0;D.flore.acacias=Math.min(D.flore.acacias,.5);}
  return D;}
/* ===== LES DUNES D'AVANCE (2026-10-24, passe perf 3e tour — le canyon l'a depuis le 23/10, les dunes non) =====
   Au 1er JOUER (started faux) puis au passage, buildDunes calculait le monde (dnMondeCalc : le fond, le relief fin, l'ombre) d'un bloc sur le fil
   principal, ou l'envoyait au travailleur APRÈS le passage (le sable apparaît alors une demi-seconde plus tard, sur une route sans collision).
   Le pré-bâti (prebDunes, dans prebJob) fait la PRÉPARATION sur la route fantôme — le module DN est échangé EN ENTIER le temps de la préparation
   (prebObj), seules les clés CHANGÉES sont gardées (W.dunes.chg) —, confie le calcul au travailleur et l'attend image après image ; au départ
   (ou au portail), buildDunes(seed,W.dunes) reprend ces clés et pose le monde. Pas arrivé à temps, ou `?dnw=0` : tout comme avant. */
function prebDunes(sd,W){ // (le pré-bâti, DANS une tranche : la route fantôme est en place) la préparation, puis le calcul chez le travailleur — W.dunes tient le résultat
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='dunes'||!(NP>1)||!DUNES_OK||/[?&]dnw=0\b/.test(location.search))return null;
  const w=dnTravailleur();if(!w)return null;
  cyBruits();
  const av=Object.assign({},DN),ghost=Object.assign({},DN);prebObj(DN,ghost);let r=null;
  try{r=buildDunes(sd,true);}finally{prebObj(DN,ghost);} // DN revient tel qu'il était ; ghost tient l'état préparé
  if(!r)return null;
  const chg={};for(const k of Object.keys(ghost))if(k!=='job'&&k!=='attente'&&ghost[k]!==av[k])chg[k]=ghost[k];
  const a={job:-(DN.jav=(DN.jav||0)+1),R:null,chg:chg,S:r.S,opt:r.opt,cle:[sd,L,NP,lvPiste(),ROAD_HALF].join('|')};
  try{w.postMessage({job:a.job,S:r.S,opt:r.opt,nz:CY.nz});}catch(e){console.warn('dunes : travailleur',e);return null;}
  DN.pre=a;return a;}
function buildDunes(seed,pre){
  const av=pre===true; // true : le pré-bâti prépare (rien n'est écrit dans DN, rien ne part) ; un objet : ce qu'il a préparé (W.dunes)
  if(!av){dnEteindre();DN.job=(DN.job||0)+1;}
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='dunes'||!(NP>1)||!DUNES_OK)return;
  if(pre&&!av){const a=pre;
    if(a.cle===[seed,L,NP,lvPiste(),ROAD_HALF].join('|')){Object.assign(DN,a.chg);DN.t0=performance.now();cyBruits();dnTerrain();
      if(a.R){DN.ms.avance='pret';dnMondePose(a.R);return;}
      const W9=started&&!/[?&]dnw=0\b/.test(location.search)?dnTravailleur():null; // pas revenu : on le lui redemande, comme avant
      if(W9){const job=DN.job;DN.attente={job:job,S:a.S,opt:a.opt};try{W9.postMessage({job:job,S:a.S,opt:a.opt,nz:CY.nz});return;}catch(e){DN.attente=null;}}
      dnMondePose(dnMondeCalc(a.S,a.opt));return;}}
  const t0=performance.now(),LV=lvPiste(),K=Math.sqrt(LV),r=mulberry32((seed^0xD0E5A7)>>>0);
  cyBruits();dnTerrain();
  // ---- 1. LES ÉCHANTILLONS : la route tous les 8 m ----
  const DS=8,NS=Math.max(3,Math.floor(L/DS)+1),st9=L/(NP-1),A9=n=>new Float32Array(n);
  const S={n:NS,ds:DS,x:A9(NS),z:A9(NS),y:A9(NS),tx:A9(NS),tz:A9(NS),H:A9(NS),A:A9(NS),D:A9(NS),zC:A9(NS),pan:A9(NS),ob:A9(NS),gd:A9(NS),B:A9(NS),Yf:A9(NS),RE:A9(NS),pw:A9(NS),hP:A9(NS),wP:A9(NS),hM:A9(NS),wM:A9(NS),bk:A9(NS),sP:A9(NS),sM:A9(NS)};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    {const na=Nn[k],nb=Nn[k+1],sx9=-S.tz[i],sz9=S.tx[i],la9=(na.x*sx9+na.z*sz9)*(1-u)+(nb.x*sx9+nb.z*sz9)*u,ny9=na.y*(1-u)+nb.y*u;S.bk[i]=Math.atan2(la9,Math.max(.2,ny9));} /* l'angle de la dalle : + = la dalle penche vers le côté +1 (ce côté est plus BAS) */
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];S.zC.fill(1);
  // ---- 2. LES SECTIONS : par échantillon, H = la profondeur de la mer de dunes sous la route, A = la hauteur des dunes, pan = la cuvette d'argile, ob = l'allée. (Plus de segments ni de saut : le sable
  //      porte la route d'un bout à l'autre, voir les COLLINES plus bas.) ----
  const sQ={};if(DN.Q)for(const k in DN.Q){const p=DN.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  DN.sQ=sQ;const sm=(a9,b9,x)=>{const t=Math.max(0,Math.min(1,(x-a9)/(b9-a9)));return t*t*(3-2*t);};
  const SEG9={H:DN_SEG.H,A:DN_SEG.A*K};
  {const ph=[r()*6.28,r()*6.28,r()*6.28],so=sQ.oasis0!=null?sQ.oasis0:L-420,ob0=sQ.obel0,ob1=sQ.obel1,v0=sQ.vlei0,v1=sQ.vlei1;
   for(let i=0;i<NS;i++){const s9=i*DS;let H=SEG9.H,A=SEG9.A,pan=0;
     if(v0!=null&&v1!=null)pan=sm(v0-80,v0+70,s9)*(1-sm(v1-70,v1+90,s9));                                  // la cuvette d'argile (le grand saut d'avant : la route la traverse maintenant)
     const dep=1-sm(300,1000,s9);H+=46*dep;A=Math.max(70*K,A-60*K*dep);                                        // LE DÉPART : le belvédère — la route domine les collines, la vue s'ouvre sur le désert d'en bas
     const wo=sm(so-220,so+120,s9);if(wo>0){H+=(22-H)*wo;A+=(90*K-A)*wo;pan=pan+(.5-pan)*wo;}                   // L'OASIS : la plaine sous les derniers mètres
     S.H[i]=H*(1+.10*Math.sin(s9/870+ph[0]));S.A[i]=A*1.4*(1+.12*Math.sin(s9/610+ph[1]));S.pan[i]=Math.min(1,pan);S.gd[i]=0;
     S.ob[i]=(ob0!=null&&ob1!=null&&s9>=ob0-120&&s9<=ob1+120)?1:0;}}
  // le FOND : la route lissée sur ±300 m, moins la profondeur ; au loin, une mer plus haute (90 m sous la route, bien plus bas au départ : on domine le désert) et plus calme
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.y[i];
   for(let i=0;i<NS;i++){const a9=Math.max(0,i-w),b9=Math.min(NS,i+w+1),ys=(c[b9]-c[a9])/(b9-a9);S.B[i]=ys-S.H[i];S.Yf[i]=ys-90-DN_SEG.haut*(1-sm(0,2600,i*DS));}}
  // ---- 3. LES COLLINES (2026-10-22, LA ROUTE CONTINUE) : de chaque côté de la route, le sable — l'ÉPERON (il tombe jusqu'à la mer) partout, sauf où la vague veut une COLLINE : au DEDANS de l'arc de la
  //      montée, aux deux flancs de l'encoche de la crête, aux murs du creux. hP/wP : le côté +1 (le décalage (−tz, tx)), hM/wM : le côté −1 ; h > 0 : la colline (sa crête au-dessus de la berme), w : sa largeur ----
  for(let i=0;i<NS;i++){S.hP[i]=S.hM[i]=-Math.max(5,S.y[i]-1.6-S.B[i]);S.wP[i]=S.wM[i]=0;}
  {let hsW=.2;const rf=mulberry32((seed^0x7E11A5)>>>0),mur=(sd,i,h,w,t)=>{if(t<=0)return;const A=sd>0?S.hP:S.hM,W=sd>0?S.wP:S.wM,Q9=sd>0?S.sP:S.sM;A[i]+=(h-A[i])*t;W[i]+=(w-W[i])*t;Q9[i]+=(hsW-Q9[i])*t;};
   (DN.fe||[]).forEach(function(fe,n){
     const sA=sQ['m'+n+'a'],sB=sQ['m'+n+'b'],sS=sQ['m'+n+'s'],sC=sQ['c'+n],sD=sQ['d'+n],sN=sQ['m'+(n+1)+'a']!=null?sQ['m'+(n+1)+'a']:(sQ.fin!=null?sQ.fin:L);
     if(sA==null||sB==null||sC==null||sD==null)return;
     hsW=rf()*.22; /* (2026-10-23, Léo : « brouillon… l'harmonie ») un seul langage de collines : des dômes doux, plus de crêtes pointues */ /* la FORME des collines de cette vague : crête (pointue) ou dôme (rond) */
     const kb=(fe.K||1)*((DN.hz&&DN.hz.hk)||1),pk=fe.pt?.62:1,Hc=(46+34*rf())*K*kb*pk,Wc=Hc*(2.9+.6*rf()),Hn=(18+12*rf())*K*kb*pk,Hv=(14+14*rf())*K*pk,vs=rf()<.5?1:-1,closed=fe.ferme||fe.sp==='avenue'||fe.sp==='vlei'||fe.sp==='rythme';
     for(let i=0;i<NS;i++){const s9=i*DS;
       if(fe.S&&sS!=null){mur(fe.sg,i,Hc,Wc,sm(sA-30,sA+50,s9)*(1-sm(sS-10,sS+30,s9)));mur(fe.sg2,i,Hc*.75,Wc*.8,sm(sS-30,sS+10,s9)*(1-sm(sB-20,sB+60,s9)));} // la colline de la montée : le dedans de l'arc (deux arcs : une colline chacun)
       else mur(fe.sg,i,Hc,Wc,sm(sA-30,sA+50,s9)*(1-sm(sB-20,sB+60,s9)));
       if(fe.notch){const t=sm(sB-10,sB+50,s9)*(1-sm(sC+10,sC+80,s9));mur(1,i,Hn,Hn*2.9,t);mur(-1,i,Hn,Hn*2.9,t);}                                           // l'encoche de la crête : un mur de chaque côté, il retombe derrière l'apex
       const tv=sm(sD+30,sD+120,s9)*(1-sm(sN-120,sN-30,s9)),hv=fe.sp==='avenue'?Hv*.55:fe.sp==='vlei'?Hv*.4:fe.sp==='rythme'?Hv*.5:Hv;                                              // les murs du creux
       if(closed){mur(1,i,hv,hv*3,tv);mur(-1,i,hv,hv*3,tv);}else mur(vs,i,hv,hv*3,tv);}});
   if(sQ.erg0!=null&&sQ.erg0>420)for(let i=0;i<NS;i++){const s9=i*DS,t=sm(250,360,s9)*(1-sm(sQ.erg0-120,sQ.erg0-30,s9));mur(1,i,18*K,54*K,t);mur(-1,i,18*K,54*K,t);}} // le départ : le premier creux, entre le belvédère et la 1re colline
  const D9=DN_DECO.on?dnTirage(seed):null;DN.deco=D9; // (2026-10-20) LE DÉSERT AU HASARD : le tirage du décor (son flux à lui)
  // L'OASIS : un lac AU BORD de la dernière droite — la route le longe, la berge descend en pente douce, 15 m sous la dalle ; petite, grande… ou un MIRAGE (pas d'eau)
  let oa=null;{const s0=sQ.oasis0!=null?sQ.oasis0:L-700,s1=sQ.fin!=null?sQ.fin:L-150,iL=Math.min(NS-1,Math.round(Math.max(0,(s0+s1)/2)/DS)),sd=r()<.5?-1:1,rl=210*K*(D9?D9.oasis.k:1);
    if(rl>0)oa={x:S.x[iL]-S.tz[iL]*sd*(rl+62),z:S.z[iL]+S.tx[iL]*sd*(rl+62),r:rl,y:S.y[iL]-15};}
  DN.rac=[];
  // LE VENT de la map : il souffle à peu près dans l'axe de la descente (les crêtes coupent la route en travers), à ±35°
  {const dx=S.x[NS-1]-S.x[0],dz=S.z[NS-1]-S.z[0],a=Math.atan2(dx,dz)+(r()-.5)*1.2,b=a+.49;DN.vent=[Math.sin(a),Math.cos(a),Math.sin(b),Math.cos(b)];DN.lam=(520+r()*90)*K*((DN.hz&&DN.hz.lamK)||1);
   if(D9){const a2=Math.atan2(dx,dz)+D9.vent.a,b2=a2+D9.vent.b;DN.vent=[Math.sin(a2),Math.cos(a2),Math.sin(b2),Math.cos(b2)];DN.lam*=D9.vent.lamK;}} // (2026-10-20) le vent TIRÉ : sa direction, la houle en biais, la longueur des dunes (les rides suivent)
  /* LES TREMPLINS (un par vague) : s = l'APEX (le haut de la crête), e = s + 6, aim = la distance visée depuis l'apex — le vol dure ~1,6 s à la vitesse de conception, jamais plus de 60 % de la descente : la
     caisse retombe SUR la route (la descente, juste derrière), à n'importe quelle vitesse (voir dnLevre) */
  DN.lev=[];(DN.fe||[]).forEach(function(fe,n){const sC=sQ['c'+n],sD=sQ['d'+n];if(sC==null||sD==null)return;const ll=sD-sC;DN.lev.push({s:sC,e:sC+6,aim:sQ['e'+n]!=null?Math.max(60,(sQ['e'+n]-sC)*.85):Math.min(ll*.6,1.15*((DN.hz&&DN.hz.VN)||105)),seg:Math.round(ll),tag:fe.big?'grande':'crete'}); // aim : au milieu de l'ÉPAULE (la pente douce où l'on se pose)
    for(let k=0;k<(fe.nh|0);k++){const sw=sQ['w'+n+'_'+k];if(sw!=null)DN.lev.push({s:sw,e:sw+6,aim:Math.min(52,.46*((DN.hz&&DN.hz.VN)||105)),seg:110,tag:'bosse'});}}); // les BOSSES du rythme : de petits tremplins (un vol de ~0,8 s)
  DN.lev.sort(function(a,b){return a.s-b.s;});
  DN.S=S;DN.ms={ech:Math.round(performance.now()-t0)};
  dnPlanScenes(S,K,ROAD_HALF,D9);
  // la PORTÉE de chaque échantillon : jusqu'où le profil (la berme, la colline ou l'éperon, puis 200 m de fondu) a encore un mot à dire
  const RH=ROAD_HALF,TH=THICK;
  for(let i=0;i<NS;i++){const Wf=Math.max(0,S.pw[i]-RH-10),rc=(h,w)=>RH+10+Wf+(h>0?w+h/.6:-h/.34)+40;S.RE[i]=Math.min(900*K,Math.max(rc(S.hP[i],S.wP[i]),rc(S.hM[i],S.wM[i]))+210);}
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'dunesSoir']||BIOMES.dunesSoir,cA=(bio9.cyA||[6,-110,0,0]).slice();
  /* (2026-10-23, Léo : « une belle grande pyramide qui cache le soleil ») LE SOLEIL COUCHANT DANS L'AXE : au soir le soleil est à l'azimut du cap d'arrivée de la route, et la grande pyramide (la 3e du trio) est reculée à 2 200 m dans cet axe — le soleil se pose juste derrière son sommet (DN.sunEl, calé en dnMondePose). `?sans=dunessoleil` = le soleil d'avant. */
  DN.sunAz=null;DN.sunEl=null;
  if(DN_SOL&&cA[0]<14&&NS>20){const i1=NS-1,i0=Math.max(0,i1-18),hx=S.x[i1]-S.x[i0],hz=S.z[i1]-S.z[i0];if(hx*hx+hz*hz>1){DN.sunAz=Math.atan2(hx,hz)*57.29578;cA[1]=DN.sunAz;S.solD=2200;}}
  const opt={K:K,seed:seed,RH:RH,TH:TH,sQ:sQ,sun:[cA[0],cA[1]],vent:DN.vent,lam:DN.lam,oa:oa,fin:{x:S.x[NS-1],z:S.z[NS-1]},sb:!DN_BUTTES,vol:DN.scnV||[],Af:210*K,deco:D9,pal:{dnPlat:PAL.b('dnPlat',64),dnFin:PAL.b('dnFin',12),dnOmbre:PAL.b('dnOmbre',44)}};
  DN.oa=oa;DN.fin=opt.fin;DN.sb=opt.sb;DN.t0=t0;
  if(av)return {S:S,opt:opt}; // (LES DUNES D'AVANCE) la préparation s'arrête ici : prebDunes envoie le calcul au travailleur
  const W=started&&!/[?&]dnw=0\b/.test(location.search)?dnTravailleur():null;
  if(W){const job=DN.job;DN.attente={job:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz});return;}catch(e){console.warn('dunes : travailleur',e);DN.attente=null;}}
  dnMondePose(dnMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function dnTravailleur(){if(DN.w!==undefined)return DN.w;
  try{const fns=[mulberry32,cyNz,cyBil,dnDune,dnMesa,dnFar,dnHauteur,dnPf,dnProfil,dnPyr3,dnPrevoir,dnPrevoirDeco,dnOmbre,dnMondeCalc].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var CY={},DN={},DN_O9={},DN_STAR="+DN_STAR+",PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};\n"+fns+
      "\nonmessage=function(e){var m=e.data;CY={nz:m.nz};DN={};PAL.B=m.opt.pal;var R=dnMondeCalc(m.S,m.opt);R.job=m.job;"+
      "postMessage(R,[R.Z.d.buffer,R.F.c.buffer,R.O.h.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const R=e.data;if(R.job<0){if(DN.pre&&DN.pre.job===R.job)DN.pre.R=R;return;} /* (LES DUNES D'AVANCE) le monde du pré-bâti */if(!DN.attente||R.job!==DN.job)return;DN.attente=null;try{dnMondePose(R);}catch(er){console.warn('dunes : pose',er);}};
    W.onerror=function(e){console.warn('dunes : travailleur en erreur',e.message);DN.w=null;const a=DN.attente;DN.attente=null;if(a&&a.job===DN.job)try{dnMondePose(dnMondeCalc(a.S,a.opt));}catch(er){console.warn('dunes',er);}};
    DN.w=W;}catch(e){DN.w=null;}
  return DN.w;}
/* LA POSE : les données du monde dans DN (la collision), à la puce (trois textures), les décors — et le sable s'allume */
const DN_SOL=!/[?&]sans=([^&]*,)?dunessoleil(,|&|$)/.test(location.search);
/* (2026-10-24, Sacha : « pareil dans les dunes » — les décors mal imbriqués dans le sol) L'ANCRAGE DES MONUMENTS : ils étaient posés à la hauteur du sable de LEUR CENTRE ; sur une
   dune en pente, leur côté bas pendait dans le vide (mesuré : la grande pyramide, 443 m de demi-base, flottait de 21 m ; un obélisque de 8 m). Le pied descend sous le point le plus
   bas de son emprise (au plus 40 % de la hauteur pour un obélisque, 25 % pour une pyramide). `?sans=dunesancre` = comme avant. */
const DN_ANCRE=typeof location==='undefined'||!/[?&]sans=([^&]*,)?dunesancre(,|&|$)/.test(location.search);
function dnPlancher(x,z,r){let lo=1e9;for(const f of [0,.5,1])for(let a=0;a<(f?16:1);a++){const th=a/16*6.2832,g=dnHauteur(x+Math.cos(th)*r*f,z+Math.sin(th)*r*f);if(g<lo)lo=g;}return lo;}
function dnAncreDecors(){if(!DN_ANCRE||!DN.Z||!DN.F)return;
  for(const b of DN.ob||[]){const lo=dnPlancher(b.x,b.z,b.r*1.42);if(b.y>lo-.6)b.y=Math.max(lo-.6,b.y-Math.max(6,b.h*.4));}
  for(const P of DN.pyrs||[]){const lo=dnPlancher(P.x,P.z,P.hw*1.4142);if(P.y>lo-3)P.y=Math.max(lo-3,P.y-P.h*.25);}
  for(const m of DN.mo||[]){const lo=dnPlancher(m.x,m.z,m.r);if(m.y>lo-1)m.y=Math.max(lo-1,m.y-Math.max(6,m.h*.3));}}
function dnMondePose(R){
  if(!DN.mat||!(LVL.cur&&LVL.cur.piste==='dunes'))return;const t4=performance.now();
  DN.Z=R.Z;DN.F=R.F;DN.O=R.O;DN.ob=R.ob||[];DN.pyr=R.pyr||null;DN.pyrs=R.pyrs||(DN.pyr?[DN.pyr]:[]);DN.mo=R.mo||[];DN.yMin=R.yMin;DN.yMax=R.yMax;Object.assign(DN.ms,R.ms);dnAncreDecors();
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
  if(DN.sunAz!=null&&DN.pyrs&&DN.pyrs[2]&&DN.S){const P=DN.pyrs[2],S9=DN.S,e=S9.n-1,d=Math.hypot(P.x-S9.x[e],P.z-S9.z[e]);DN.sunEl=Math.max(2.5,Math.min(21,Math.atan2(P.y+P.h-(S9.y[e]+4),d)*57.29578-3.2));} /* le soleil juste sous le sommet : caché par la pyramide, son halo la couronne */
  DN.on=true;DN.mesh.visible=true;
  try{dnMonuments(DN.job);}catch(e){console.warn('dunes : décors',e);}
  DN.ms.pose=Math.round(performance.now()-t4);DN.ms.total=Math.round(performance.now()-(DN.t0||t4));
}
