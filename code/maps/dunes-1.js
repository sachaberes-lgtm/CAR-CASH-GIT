/* <<<DUNES>>> */
/* =========================== LES DUNES D'OR (2026-10-18, Sacha : « fais les dunes d'or de manière parfaite ») ===========================
   La proposition retenue le 18/10 : « un désert ouvert (pas de parois, contrairement au Canyon) : on dévale des dunes géantes, d'une crête à
   l'autre ; obélisques, caravane, mirages au loin ; l'orage = tempête de sable ; sable orange + ciel turquoise, la base même de la DA ».
   · LA ROUTE (`genDunes`) : elle DESCEND un erg géant, sur l'ossature de genCanyon (droites et arcs ≤ 8° par point, cap dans ±58° hors
     boucles, rayons en multiples du rayon tenable RMIN : de 1,3 à 3 × — au-delà, pour Sacha, c'est « du tout droit »). Les sections :
     LA CRÊTE DU GRAND ERG (la route posée sur le fil d'une dune, en S), LE TOBOGGAN (la face d'avalanche, en virage, dans sa tranchée de
     sable), LES VAGUES (« d'une crête à l'autre » : la montée tourne, la CRÊTE est droite — on y décolle, de +2 % à −19 %, sous le seuil
     d'adoucirCretes —, la face d'avalanche est droite et assez longue pour qu'on y retombe), LA VALLÉE MORTE (le fond d'argile blanche et
     ses acacias morts, façon Deadvlei, cernée de dunes plus hautes que la route), LA DEUXIÈME CRÊTE (la caravane), L'ALLÉE DES OBÉLISQUES,
     L'OASIS d'arrivée (le portail au-dessus de l'eau). Sept BOUCLES à raccourci (le trombone du canyon : la sortie repasse sous l'approche).
     LES MODULES (≥ 3, voir MODC_ON) : dSlalom (entre les barkhanes), dVagues (deux ou trois rouleaux), dCorde (la double corde autour d'une
     dune étoile), dChicane — dans leur propre hasard `rm`.
   · LE SABLE (`dnMondeCalc`, dans un travailleur comme le canyon) : la mer de dunes est une FONCTION (`dnDune` : des dunes poussées par UN
     vent — face au vent douce, face d'avalanche raide, crêtes vives qui serpentent, des pics et des cols le long des crêtes, une seconde houle
     en biais) posée sur un FOND qui descend avec la route (grille de 64 m, adoucie : la route lissée moins la profondeur de la section ; au loin
     une mer plus haute et plus calme). Près de la route, la grille FINE (12 m) tient un PLAFOND (le sable reste à D m sous la dalle, puis peut
     remonter à 37°, la pente du sable au repos : la route creuse sa tranchée dans les dunes plus hautes qu'elle) et, sur les crêtes et les
     vagues, un PLANCHER (la dune qui porte la route). Dans les boucles, le plafond reste presque PLAT (la garde : rien ne monte entre la zone
     de saut et la sortie). Le processeur (collision, ombre) et la puce lisent les MÊMES données et le même bruit (`CY.nz`).
   · LE RENDU (`DN_VS`/`DN_FS`) : le terrain GPU du canyon (CDLOD morphé, une grille en instances) ; le sable doré → rouge, les RIDES du vent
     (dans la normale), la crête plus claire, le SATIN du sable au rasant, les PAILLETTES au soleil, l'ombre portée des crêtes (balayée une fois
     au soleil de l'heure) qui tire au VIOLET (la bible), l'argile blanche craquelée des cuvettes, l'herbe et l'eau de l'oasis, et au loin le
     MIRAGE (le sable presque plat, vu en rasant, renvoie le ciel en tremblant).
   · LE CIEL : celui du canyon (`canyonCiel` : le soleil de l'heure `cyA`, la ceinture de Vénus, la Voie lactée, la lune) — `LVL.canyonA` vaut 1
     ici aussi ; son horizon de mesas devient un horizon de DUNES et trois PYRAMIDES (`uCyDn`, fondu par LVL.dunes).
   · LES DÉCORS (`dnMonuments`, low-poly à facettes, même lumière et même ombre que le sable : DN_MVS/DN_AFS) : les OBÉLISQUES (l'allée en
     paires, d'autres épars sur les dunes ; pyramidion d'or), LA GRANDE PYRAMIDE près de l'oasis (coiffe d'or), les ACACIAS MORTS de la vallée,
     les PALMIERS de l'oasis, deux CARAVANES de chameaux qui marchent sur les crêtes (dnCaravane).
   · RÈGLE D'OR : aucun sable ne touche la route, dessus ni dessous (`dbgDunes('test')`). En vol, le sable, l'eau de l'oasis, les obélisques et
     la pyramide TUENT (`dunesHeurt` → « ENSEVELI DANS LE SABLE », « AU FOND DE L'OASIS », « CONTRE L'OBELISQUE », « CONTRE LA PYRAMIDE »).
   Console : `dbgDunes()` (état, temps) · `dbgDunes('test')` · `dbgDunes('vue',d,h,cap,pente)` (photo figée, d m devant la caisse) ·
   `dbgDunes('vueA',s,h,cap,pente)` (à l'abscisse s) · `dbgDunes('raccourcis')` · `?carte=dunes&meteo=soir`. */
const NIV_DUNES={id:'dunes',nm:"LES DUNES D'OR",bio:['dunesSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'dunes',pr:'DE CRETE EN CRETE'};
const DUNES_OK=CANYON_OK; // les mêmes besoins que le canyon : textures de données en flottants, lecture de textures au sommet
PAL.B.dnFin=[16,14,12];PAL.B.dnPlat=[96,80,64];PAL.B.dnOmbre=[60,52,44];PAL.B.dnGrille=[16,16,32];PAL.B.dnR0=[85,100,118];PAL.B.dnArbres=[50,90,140];PAL.B.dnPalmes=[22,34,48];PAL.B.dnPart=[600,1100,1600]; // la finesse par palier [ancien, moyen, récent]
const DN={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,S:null,job:0,attente:null,grp:null,
  ombre:1,ecrit:false,ob:[],pyr:null,pyrs:[],mo:[],deco:null,tor:[],oa:null,rac:[],vent:[1,0,1,0],lam:560,car:[],sep:0,rmin:0}; // (les textes : avec les ambiances des dunes, I18N n'existe pas encore ici)
/* LES DUNES AU HASARD (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») — MESURÉ (40 graines, palier 0) : genDunes suivait
   toujours la même RECETTE : plein nord (−13° à +8°), erg → toboggan → raccourci → vagues → vallée morte → obélisques → oasis aux mêmes % du parcours
   (écart de forme 0,06). Désormais chaque erg tire, comme le canyon (CY_HZ) : son AXE (±`axe`°) ; ses PIÈCES et leur ORDRE entre l'ouverture (la crête
   du Grand Erg + le toboggan, gardés) et l'oasis (l'arrivée) — un raccourci, les vagues et deux décors toujours (parmi la vallée morte, l'allée des
   obélisques et la deuxième crête), puis, mélangés, ce que la longueur tient parmi le 3e, des deuxièmes vagues et un 2e raccourci (hors JOUER : tout) ; un
   CARACTÈRE par liaison (virages, houle, serpent, dérive) ou un module ; sa PENTE (×0,85-1,2) et sa LONGUEUR (longueurCible() × `kL` ±8 % : la
   longueur réelle d'avant au palier 0). Le sable, le vent (il souffle dans l'axe de la descente), l'oasis, la pyramide, les obélisques, les acacias et
   les caravanes sont posés AUTOUR de la route : ils suivent ; le soleil de l'heure reste celui du monde, et les trois pyramides de l'horizon (le ciel
   du canyon) aussi. `?sans=duneshasard` = la recette d'avant, au tirage près ; `dbgDunes().hz` = l'axe, la pente, la longueur visée, les pièces. */
const DN_HZ={on:!/[?&]sans=([^&]*,)?duneshasard(,|&|$)/.test(location.search),axe:55,kL:1.1,mod:.6,lien:150,pl:.35,coude:.65,cmax:28};
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
function* genDunes(rnd){ // (LE PRÉ-BÂTI) un générateur, comme genCanyon : il rend la main entre deux essais et pendant la mesure des écarts
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;
  const LV=lvPiste(),RS=1.25+.3*(LV-1),LL=1+Math.min(1.3,(LV-1)*.5),SQ=Math.sqrt(LV),g0=(rnd()*4294967296)>>>0;
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);DN.rmin=Math.round(RMIN);
  let best=null,bestSep=-1;
  for(let essai=0;essai<14;essai++){if(essai)yield;
    const r=mulberry32((g0+essai*0x9E3779B1)>>>0),C=[],Q={},P=new THREE.Vector3(0,0,0),BO=[];let phi=0,AX9=0;const LIM=58*Math.PI/180; /* AX9 : (AU HASARD) le COUDE de l'axe — 0 dans la recette d'avant */
    const push=()=>C.push(P.clone()),ici=k=>{Q[k]={p:P.clone(),phi:phi+AX9};},lib=sg=>(LIM-sg*phi)*57.2958;
    const droite=(l,pe,n)=>{n=n||Math.max(2,Math.round(l/90));for(let k=0;k<n;k++){P.x+=Math.sin(phi+AX9)*l/n;P.z+=Math.cos(phi+AX9)*l/n;P.y+=pe*l/n;push();}};
    const arc=(aDeg,R,pe)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
      for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi+AX9)*ch;P.z+=Math.cos(phi+AX9)*ch;P.y+=pe*ch;phi+=st/2;push();}};
    const recentre=pe=>{if(Math.abs(phi)>.06)arc(-phi*57.2958,RMIN*(2.2+r()*.7),pe);};
    // LES VIRAGES DE COURSE : alternés, de 1,35 à 3 × RMIN (4 sur 10 sont des grands virages qu'on tient longtemps)
    const virages=(len,p0,p1)=>{let fait=0,sg=r()<.5?-1:1;
      while(fait<len){if(r()<.8)sg=-sg;const lg=r()<.35;let a=lg?40+r()*35:28+r()*42;const R=RMIN*(lg?2.2+r()*.8:1.35+r()*.85);
        const l9=lib(sg);if(l9<18){sg=-sg;a=Math.min(a,lib(sg));}else a=Math.min(a,l9);
        arc(sg*a,R,-(p0+r()*(p1-p0)));fait+=R*a/57.2958;
        if(r()<.10){const l=(40+r()*45)*LL;droite(l,-(p0+r()*(p1-p0))*.8);fait+=l;}}};
    // LA CRÊTE : la route sur le fil d'une dune — des S qui suivent la crête, à peine en pente
    const crete=(len,pe)=>{let fait=0,sg=r()<.5?-1:1;while(fait<len){sg=-sg;let a=24+r()*16;const R=RMIN*(1.8+r()*.9),l9=lib(sg);if(l9<14){sg=-sg;a=Math.min(a,lib(sg));}else a=Math.min(a,l9);
      arc(sg*a,R,pe*(.6+.8*r()));fait+=R*a/57.2958;}};
    // UNE VAGUE : la montée en virage (au creux, la caisse est sur la route), la crête droite (le décollage), la face d'avalanche droite (la pose)
    /* LA VAGUE (v3, MESURÉ au pilote automatique, palier 0) : à 0,27 de cassure la caisse ne décollait jamais (le lissage de la route arrondit la crête) ;
       à 0,35 elle ne décollait toujours pas à la croisière, mais à la NITRO elle volait 3,4 s et retombait dans le sable (la face trop courte, la vague
       suivante tournait). Désormais : la cassure (0,24, moins à haut palier) fait décoller la caisse LANCÉE — à ~1,6 × la croisière, la nitro — pour
       ~2,6 s ; la face d'avalanche, DROITE, fait 1,12 × ce saut-là (on retombe dessus) ; le virage est dans la MONTÉE (au creux, la caisse roule).
       g monde ~23 m/s² (FALL_G × SPD). */
    const GB=Math.min(.23,17/VW),VN=1.35*VW,LD=1.12*VN*2*GB*VN/23; /* (MESURÉ au palier 7 : à 1,6 × la croisière, deux vagues faisaient 1,7 km et la map 6,3-7,3 km pour 5,4 visés) */
    let nLv=0;const levre=()=>ici('lv'+nLv),pied=()=>ici('lf'+(nLv++)); // (2026-10-19) LES LÈVRES : la crête où l'on décolle, le pied de la face (voir dnLevre)
    const vague=sg=>{const R=RMIN*(1.6+r()*.7);let a=26+r()*14;if(lib(sg)<a+4)sg=-sg;a=Math.max(8,Math.min(a,lib(sg)));
      arc(sg*a,R,.07+r()*.03);droite((34+r()*14)*LL,.04,1);levre();const ld=LD*(1+r()*.12);droite(ld,-(GB-.04+r()*.02),Math.max(3,Math.round(ld/45)));pied();return sg;};
    const vagues=n=>{let sg=phi>0?-1:1;for(let k=0;k<n;k++)sg=-vague(sg);};
    /* LES MODULES DES DUNES (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). 4 ou 5 des 5 liaisons (tirées au sort) deviennent un module —
       jamais les boucles, les crêtes, les vagues de section, la vallée, l'allée ni l'oasis. Paquet mélangé, jamais deux fois de suite ; leur hasard
       `rm` naît de la graine de l'essai (aucun tirage de plus, ni dans `rnd` ni dans `r`) :
         dSlalom  · LE SLALOM DES BARKHANES : 4-5 virages alternés de 34-52° à 1,25-1,6 × RMIN
         dVagues  · LES ROULEAUX : deux ou trois vagues (crête droite, face d'avalanche où l'on retombe)
         dCorde   · LA DOUBLE CORDE : deux appuis du même côté autour d'une dune étoile (95-110° en tout), une courte droite entre
         dChicane · LA CHICANE : gauche-droite-gauche serrée (1,1-1,3 × RMIN) */
    const rm=MODC_ON?mulberry32(((g0^0x0D0E5A11)+Math.imul(essai+1,0x85EBCA6B))>>>0):null,MM=[],dmPaq=[],dmCase=new Set();let dmK=0,dmLast=-1;
    if(rm){const t=[0,1,2,3,4];for(let i=4;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}const nb=4+(rm()<.5?1:0);for(let i=0;i<nb;i++)dmCase.add(t[i]);}
    const dmPe=(p0,p1)=>-(p0+rm()*(p1-p0)),dmRe=(lim,pe)=>{if(Math.abs(phi)>lim)arc(-(phi-Math.sign(phi)*lim*.3)*57.2958,RMIN*(2+rm()*.6),pe);};
    const dSlalom=(p0,p1)=>{const n=4+(rm()<.5?1:0),a=34+rm()*18,R=RMIN*(1.25+rm()*.35);dmRe(LIM-a/57.3*.6,dmPe(p0,p1));let sg=phi>0?-1:1;arc(sg*a*.5,R,dmPe(p0,p1));
      for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R,dmPe(p0,p1));}arc(-sg*a*.5,R,dmPe(p0,p1));};
    const dVagues=(p0,p1)=>{dmRe(.5,dmPe(p0,p1));let sg=phi>0?-1:1;const n=(LC9?1:2)+(rm()<.4?1:0); /* (LA DURÉE DES MAPS : une vague fait ~500 m au palier 0 — MESURÉ, trois rouleaux allongeaient la map de 1,5 km) */
      for(let k=0;k<n;k++){const R=RMIN*(1.6+rm()*.6);let a=26+rm()*14;if(lib(sg)<a+4)sg=-sg;a=Math.max(8,Math.min(a,lib(sg)));
        arc(sg*a,R,.07+rm()*.03);droite((34+rm()*12)*LL,.04,1);levre();const ld=LD*(1+rm()*.12);droite(ld,-(GB-.04+rm()*.02),Math.max(3,Math.round(ld/45)));pied();sg=-sg;}};
    const dCorde=(p0,p1)=>{const T=95+rm()*15,sg=phi>0?-1:1,a1=T*(.5+rm()*.1),R=RMIN*(1.5+rm()*.4);{const d=(-sg*T/2/57.2958-phi)*57.2958;if(Math.abs(d)>3)arc(d,RMIN*(2.2+rm()*.5),dmPe(p0,p1));}
      arc(sg*a1,R,dmPe(p0,p1));droite((40+rm()*40)*LL,dmPe(p0,p1)*.8);arc(sg*(T-a1),Math.max(RMIN*1.15,R*.8),dmPe(p0,p1));};
    const dChicane=(p0,p1)=>{const a=30+rm()*10,R=RMIN*(1.1+rm()*.2);dmRe(LIM-a/57.3-.05,dmPe(p0,p1));const sg=phi>0?-1:1;droite(50*LL,dmPe(p0,p1)*.6);
      arc(sg*a,R,dmPe(p0,p1));arc(-sg*2*a,R,dmPe(p0,p1));arc(sg*a,R,dmPe(p0,p1));droite(50*LL,dmPe(p0,p1)*.6);};
    /* (2026-10-20, LE DÉSERT AU HASARD) TROIS MODULES DE PLUS — seulement avec le tracé au hasard (`?sans=duneshasard` reste la recette d'avant) :
         dCreteS   · LA CRÊTE EN S : 4-5 S doux (24-36° à 1,6-2 × RMIN), presque à plat, la route sur le fil d'une dune étroite (le sable tombe des deux côtés)
         dToboggan · LE TOBOGGAN DOUBLE : deux plongées en virage (48-64° à 1,9-2,3 × RMIN, −28 à −34 %), un replat entre, dans leur tranchée de sable
         dGue      · LE GUÉ : on descend entre deux dunes étoiles (55-70°), on traverse leur cuvette d'argile en droite, on remonte de l'autre côté */
    let nMk=0;
    const dCreteS=(p0,p1)=>{dmRe(.45,dmPe(p0,p1));const n=4+(rm()<.5?1:0),R=RMIN*(1.6+rm()*.4),k=nMk++;let sg=phi>0?-1:1;ici('crm'+k+'a');droite((40+rm()*30)*LL,dmPe(p0,p1)*.3,2);
      for(let j=0;j<n;j++){let a=24+rm()*12;if(lib(sg)<a+4)sg=-sg;a=Math.max(8,Math.min(a,lib(sg)));arc(sg*a,R,dmPe(p0,p1)*.35);sg=-sg;}{const a=Math.max(4,Math.min(30,lib(-sg)-6));arc(-sg*a,R,dmPe(p0,p1)*.35);}ici('crm'+k+'b');}; /* (le dernier S ne revient pas : on quitte la crête de biais) */
    const dToboggan=(p0,p1)=>{dmRe(.4,dmPe(p0,p1));let sg=phi>0?-1:1;const k=nMk++;ici('tbm'+k+'a');
      for(let j=0;j<2;j++){let a=48+rm()*16;if(lib(sg)<a+4)sg=-sg;a=Math.max(10,Math.min(a,lib(sg)));arc(sg*a,RMIN*(1.9+rm()*.4),-(.28+rm()*.06));droite((45+rm()*20)*LL,-.05,2);if(lib(sg)<56)sg=-sg;}ici('tbm'+k+'b');}; /* (deux plongées du même côté si le cap le permet) */
    const dGue=(p0,p1)=>{dmRe(.35,dmPe(p0,p1));let sg=phi>0?-1:1;const k=nMk++,R=RMIN*(1.6+rm()*.4);ici('gum'+k+'a');
      {let a=55+rm()*15;if(lib(sg)<a)sg=-sg;a=Math.max(10,Math.min(a,lib(sg)));arc(sg*a,R,-(.12+rm()*.06));}droite((50+rm()*30)*LL,-.01,2);
      {sg=-sg;let a=(55+rm()*15)*.3;if(lib(sg)<a)sg=-sg;a=Math.max(10,Math.min(a,lib(sg)));arc(sg*a,R,.02+rm()*.02);}ici('gum'+k+'b');};
    const dmJ=[dSlalom,dVagues,dCorde,dChicane,dCreteS,dToboggan,dGue],dmN=DN_HZ.on&&DN_DECO.mods?7:4;
    const dmPose=(p0,p1)=>{let m=0;for(let e=0;e<6;e++){if(!dmPaq.length){const t=[];for(let i=0;i<dmN;i++)t.push(i);for(let i=dmN-1;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)dmPaq.push(x9);}m=dmPaq.shift();if(m!==dmLast)break;}
      dmLast=m;const i0=C.length-1;dmJ[m](p0,p1);MM.push({i0:i0,i1:C.length-1});}; // le module suivant du paquet (jamais deux fois le même de suite)
    const lien=(len,p0,p1)=>{const k=dmK++;if(!rm||!dmCase.has(k)){virages(len,p0,p1);return;}dmPose(p0,p1);};
    // LA BOUCLE (le raccourci) — le trombone de genCanyon, tel quel (mesuré là-bas) : approche droite (la zone de saut), demi-tour R1, retour,
    // demi-tour SERRÉ R2 = R1 − e/2, la SORTIE 94 m à côté de l'approche et 55 à 90 m plus bas, qui passe sous le premier demi-tour
    const boucle=(nm,sg)=>{const k0=C.length;if(Math.abs(phi)>.06)arc(-phi*57.2958,(200+r()*80)*RS,-.20);
      const e=2*ROAD_HALF+32+r()*12,R1=Math.max((100+r()*20)*RS,RMIN+e/2),R2=R1-e/2,La=(200+r()*50)*LL,Lb=(140+r()*30)*LL,pa=.10,dh=55+r()*35,
        pl=Math.max(.02,(dh-pa*Lb)/(Math.PI*(R1+R2)+Lb));
      ici(nm+'0');droite(La,-pa,Math.max(3,Math.round(La/70)));ici(nm+'1');
      arc(sg*180,R1,-pl);droite(Lb,-pl,Math.max(2,Math.round(Lb/70)));arc(sg*180,R2,-pl);phi-=sg*2*Math.PI;
      ici(nm+'2');droite(Lb,-pa,Math.max(2,Math.round(Lb/70)));
      {const R3=(400+r()*100)*RS;arc(-sg*150*LL/R3*57.2958,R3,-pa);}ici(nm+'3');
      arc(-sg*(18+r()*14),RMIN*(2.4+r()*.6),-pa);
      BO.push([k0,C.length-1]);};
    let sg0=r()<.5?1:-1;const sens=()=>(sg0=-sg0);
    /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : la crête du Grand Erg (raccourcie, la caravane y marche), le toboggan, le raccourci A, les vagues,
       la vallée morte, l'allée des obélisques et l'oasis restent ; les raccourcis B à G, la deuxième crête et les deuxièmes vagues n'entrent que
       si la longueur visée les tient (`tient`) — comme genCanyon. Hors JOUER : tout, tirages compris. */
    const LC9=typeof longueurCible==='function'?longueurCible():0,kC=LC9?.5:1,fait=()=>{let a=0;for(let k=1;k<C.length;k++)a+=Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);return a;},tient=f=>!LC9||fait()<LC9*f;
    let ax=0,hz=null;
    if(DN_HZ.on){ /* LES DUNES AU HASARD (2026-10-19) — voir DN_HZ. Comme le canyon : `rh` né de la graine de l'essai, la route bâtie dans l'axe puis tournée de `ax` */
      const rh=mulberry32(((g0^0x0D0E5A5A)+Math.imul(essai+1,0x27D4EB2F))>>>0),kP=.85+rh()*.35,mel=a=>{for(let i=a.length-1;i>0;i--){const j=(rh()*(i+1))|0,x9=a[i];a[i]=a[j];a[j]=x9;}return a;};
      ax=(rh()-.5)*2*DN_HZ.axe/57.2958;
      // LES CARACTÈRES DES LIAISONS : les virages d'avant, la houle (grandes courbes entre les dunes), le serpent (S serrés entre les barkhanes), la dérive
      // (la route part en biais jusqu'à la butée et y ondule) — jamais deux fois le même de suite ; ou un MODULE (dmPose)
      const cote=(sg,a)=>{const l9=lib(sg);if(l9<15){sg=-sg;a=Math.min(a,lib(sg));}else a=Math.min(a,l9);return [sg,a];};
      const houle=(len,p0,p1)=>{let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,35+r()*25),R=RMIN*(2.2+r()*.8);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const serpent=(len,p0,p1)=>{let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,30+r()*16),R=RMIN*(1.25+r()*.35);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const derive=(len,p0,p1)=>{const sg=r()<.5?-1:1,c9=sg*(LIM*57.2958-6-r()*12)-phi*57.2958,R0=RMIN*(2.2+r()*.6);arc(c9,R0,-(p0+r()*(p1-p0)));let f9=R0*Math.abs(c9)/57.2958;
        while(f9<len){const s9=sg*phi*57.2958>LIM*57.2958-24?-sg:sg,a=Math.min(10+r()*14,lib(s9)),R=RMIN*(1.8+r()*.8);arc(s9*a,R,-(p0+r()*(p1-p0)));f9+=R*a/57.2958;}};
      const CAR9=[virages,houle,serpent,derive],CARN=['virages','houle','serpent','derive'];let hPrec=-1;
      const lienH=(len,p0,p1)=>{p0*=kP;p1*=kP;if(rm&&rm()<DN_HZ.mod){dmPose(p0,p1);return 'module';}
        let i=(rh()*CAR9.length)|0;if(i===hPrec)i=(i+1+((rh()*(CAR9.length-1))|0))%CAR9.length;hPrec=i;CAR9[i](len,p0,p1);return CARN[i];};
      // LES PIÈCES (celles d'avant, telles quelles) — chacune derrière sa liaison
      let nRac=0;
      const PC={rac:()=>{boucle('rac'+'ABCDEFG'[nRac],sens());nRac++;},
        vagues:()=>{recentre(-.06);ici('vag0');vagues(LC9?2:4);ici('vag1');},
        vagues2:()=>{recentre(-.06);ici('vag2');vagues(LC9?2:3);ici('vag3');},
        vlei:()=>{recentre(-.08);ici('vlei0');{let sg=sens();for(let k=0;k<(LC9?4:5);k++){let a=30+r()*16;if(lib(sg)<a)sg=-sg;arc(sg*Math.max(8,Math.min(a,lib(sg))),RMIN*(1.45+r()*.6),-.05);sg=-sg;}}ici('vlei1');},
        cr2:()=>{ici('cr2a');crete(560*LL*(LC9?.6:1),-.06);ici('cr2b');},
        obel:()=>{recentre(-.08);ici('obel0');{const sg=sens();arc(sg*(46+r()*14),RMIN*(2.5+r()*.5),-.07);arc(-sg*(46+r()*14),RMIN*(2.5+r()*.5),-.07);}ici('obel1');}};
      // LA LONGUEUR de chaque pièce, en moyenne (MESURÉ au banc des tracés, 40 graines × paliers 0 à 25) ; une liaison : un module (~6,4 × RMIN) ou un
      // caractère (~1,45 × la longueur demandée) — entre deux pièces, une fois sur `pl` seulement (comme avant : la vallée suivait les vagues, l'allée la vallée)
      const LIEN=(LC9?DN_HZ.lien:300)*LL,VG=1.08*(1.12*RMIN+41*LL+1.06*LD),EST={rac:684*LL+857*RS-249,vagues:(LC9?2:4)*VG,vagues2:(LC9?2:3)*VG,vlei:(LC9?6.1:7.6)*RMIN,cr2:1.13*560*LL*(LC9?.6:1),obel:6.3*RMIN},
        LI9=(rm?DN_HZ.mod*6.4*RMIN:0)+(1-(rm?DN_HZ.mod:0))*1.45*LIEN,FIN=LI9+30+5*RMIN+150,B=LC9?LC9*DN_HZ.kL*(.92+rh()*.16):0;
      // LE JEU DE PIÈCES : un raccourci, les vagues (« de crête en crête ») et DEUX décors DUS parmi la vallée morte, l'allée des obélisques et la deuxième
      // crête (avant : toujours la vallée et l'allée) ; les autres, prises dans un ordre mélangé, entrent si la longueur visée les tient ; puis l'ORDRE de
      // toutes est mélangé à son tour
      const PDS={vlei:3,obel:3,cr2:1.5},tire=L9=>{let t=rh()*L9.reduce((a,k)=>a+PDS[k],0);for(const k of L9){t-=PDS[k];if(t<0)return k;}return L9[0];};
      const d1=tire(['vlei','obel','cr2']),d2=tire(['vlei','obel','cr2'].filter(k=>k!==d1));
      const autres=['vlei','obel','cr2'].filter(k=>k!==d1&&k!==d2).concat(['vagues2']);let jeu=['rac','vagues',d1,d2];
      const OUV=200*LL*(LC9?.6:1)+640*LL*(LC9?.4:1)+62*RMIN*2.55/57.2958+70*LL;
      if(!LC9)jeu=jeu.concat(autres,['rac','rac','rac','rac','rac','rac']);
      else{let u=FIN+OUV+(1+3*DN_HZ.pl)*LI9+EST.rac+EST.vagues+EST[d1]+EST[d2];for(const p of mel(autres.concat(['rac'])))if(u+DN_HZ.pl*LI9+EST[p]<=B){jeu.push(p);u+=DN_HZ.pl*LI9+EST[p];}}
      mel(jeu);
      hz={axe:Math.round(ax*57.2958),pente:+kP.toFixed(2),B:Math.round(B),LL:+LL.toFixed(2),RS:+RS.toFixed(2),RMIN:Math.round(RMIN),LD:Math.round(LD),p:[]};
      push();ici('depart');
      droite(200*LL*(LC9?.6:1),-.02,3);ici('erg0');crete(640*LL*(LC9?.4:1),-.05);ici('erg1');           // LA CRÊTE DU GRAND ERG
      {let sg=sens();if(lib(sg)<60)sg=-sg;ici('tob0');arc(sg*Math.max(20,Math.min(lib(sg)-4,52+r()*20)),RMIN*(2.3+r()*.5),-.40);droite(70*LL,-.24,2);ici('tob1');} // LE TOBOGGAN
      // LE COUDE (comme le canyon) : entre deux pièces, l'axe de l'erg tourne de ±10-25° (±`cmax`° au plus autour de l'axe tiré)
      const coude=()=>{if(rh()>=DN_HZ.coude)return;let d=(rh()<.5?-1:1)*(10+rh()*15)/57.2958;const M9=DN_HZ.cmax/57.2958;if(Math.abs(AX9+d)>M9)d=-d;
        if(Math.abs(AX9+d)<=M9&&Math.abs(phi-d)<LIM-.09){AX9+=d;phi-=d;hz.c.push(Math.round(d*57.2958));}};hz.c=[];
      jeu.forEach(function(p,k){if(k)coude();const f0=fait(),c9=!k||!LC9||rh()<DN_HZ.pl?lienH(LIEN*(.7+rh()*.6),.10,.20):'',f1=fait();PC[p]();if(c9)hz.p.push([c9,Math.round(f1-f0)]);hz.p.push([p,Math.round(fait()-f1)]);});
      coude();{const f0=fait(),c9=lienH(LC9?Math.max(.6*LIEN,Math.min(900*LL,(B-fait()-(FIN-LI9))/1.45)):220*LL,.10,.18);hz.p.push([c9,Math.round(fait()-f0)]);}recentre(-.12); // la dernière liaison prend ce qui manque
      ici('oasis0');{const sg=sens();arc(sg*(30+r()*14),RMIN*(2.4+r()*.5),-.30);arc(-sg*(22+r()*10),RMIN*(2.7+r()*.4),-.04);}ici('fin');droite(150,-.02,2); // L'OASIS
    }else{
    push();ici('depart');
    droite(200*LL*(LC9?.6:1),-.02,3);ici('erg0');crete(640*LL*(LC9?.4:1),-.05);ici('erg1');           // LA CRÊTE DU GRAND ERG
    {let sg=sens();if(lib(sg)<60)sg=-sg;ici('tob0');arc(sg*Math.max(20,Math.min(lib(sg)-4,52+r()*20)),RMIN*(2.3+r()*.5),-.40);droite(70*LL,-.24,2);ici('tob1');} // LE TOBOGGAN
    lien(360*LL*kC,.10,.20);
    boucle('racA',sens());
    recentre(-.06);ici('vag0');vagues(LC9?2:4);ici('vag1');                                             // LES VAGUES
    if(tient(.42))boucle('racB',sens());
    if(tient(.5)){lien(300*LL,.10,.20);boucle('racC',sens());}
    recentre(-.08);ici('vlei0');{let sg=sens();for(let k=0;k<(LC9?4:5);k++){let a=30+r()*16;if(lib(sg)<a)sg=-sg;arc(sg*Math.max(8,Math.min(a,lib(sg))),RMIN*(1.45+r()*.6),-.05);sg=-sg;}}ici('vlei1'); // LA VALLÉE MORTE
    if(tient(.6))boucle('racD',sens());
    if(tient(.66)){lien(280*LL,.12,.22);ici('cr2a');crete(560*LL,-.06);ici('cr2b');}                     // LA DEUXIÈME CRÊTE (une autre caravane)
    if(tient(.72))boucle('racE',sens());
    recentre(-.08);ici('obel0');{const sg=sens();arc(sg*(46+r()*14),RMIN*(2.5+r()*.5),-.07);arc(-sg*(46+r()*14),RMIN*(2.5+r()*.5),-.07);}ici('obel1'); // L'ALLÉE DES OBÉLISQUES
    if(tient(.8))boucle('racF',sens());
    if(tient(.84)){recentre(-.06);ici('vag2');vagues(3);ici('vag3');}
    if(tient(.88)){lien(260*LL,.12,.22);boucle('racG',sens());}
    lien(220*LL*kC,.10,.18);recentre(-.12);
    ici('oasis0');{const sg=sens();arc(sg*(30+r()*14),RMIN*(2.4+r()*.5),-.30);arc(-sg*(22+r()*10),RMIN*(2.7+r()*.4),-.04);}ici('fin');droite(150,-.02,2); // L'OASIS
    }
    // LE CONTRÔLE (celui du canyon) : deux tronçons à plus de 1,2 km l'un de l'autre sur la route ne passent jamais à moins de ~560 m — sauf dans une même boucle
    const n=C.length,acc=new Float32Array(n),bo=new Int16Array(n).fill(-1);for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);
    BO.forEach(function(q,m){for(let k=q[0];k<=q[1];k++)bo[k]=m;});
    let sep=1e9;for(let i=0;i<n;i++){if((i&63)===63)yield;for(let j=i+1;j<n;j++){if(acc[j]-acc[i]<1200*LL||(bo[i]>=0&&bo[i]===bo[j]))continue;const d=Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z);if(d<sep)sep=d;}}
    if(sep>bestSep){bestSep=sep;best={C:C,Q:Q,MM:MM,ax:ax,hz:hz};}
    if(sep>560*SQ)break;}
  if(best.ax){const ca=Math.cos(best.ax),sa=Math.sin(best.ax),tr=v=>{const x=v.x;v.x=x*ca+v.z*sa;v.z=v.z*ca-x*sa;}; // (LES DUNES AU HASARD) l'AXE : la route tournée autour du départ
    for(const v of best.C)tr(v);for(const k in best.Q){tr(best.Q[k].p);best.Q[k].phi+=best.ax;}}
  DN.hz=best.hz||null;if(DN.hz)DN.hz.sep=Math.round(bestSep);
  lisserRaccords(best.C);adoucirCretes(best.C,1);
  for(const k in best.Q){const o=best.Q[k];let bi=0,bd=1e18;for(let j=0;j<best.C.length;j++){const d=best.C[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.copy(best.C[bi]);}
  DN.Q=best.Q;DN.sep=Math.round(bestSep);
  for(const m of best.MM||[])MODMARK.push(m);
  return best.C;
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
const DN_O9={};
function dnHauteur(x,z,o){const Z=DN.Z,F=DN.F;o=o||DN_O9;
  const zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts,B=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz),A=cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz),pan=cyBil(Z.d,Z.nx,Z.nz,4,3,zx,zz);
  let h=B+A*(dnDune(x,z,DN.vent,DN.lam)-.35)*(1-.85*pan);
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
  return true;}
/* LES DÉCORS QUI COMPTENT POUR L'OMBRE ET LA COLLISION (ici ou dans le travailleur) : les obélisques et la grande pyramide — jamais près d'une route */
function dnPrevoir(S,sQ,K,RH,r,D){
  if(D)return dnPrevoirDeco(S,sQ,K,RH,D);
  const ob=[],L9=(S.n-1)*S.ds,pres=(x,z,lim)=>{for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lim*lim)return true;}return false;};
  const a0=sQ.obel0,a1=sQ.obel1;
  if(a0!=null&&a1!=null)for(let s9=a0+40;s9<a1-20;s9+=120*K){const i=Math.min(S.n-1,Math.round(s9/S.ds));  // L'ALLÉE : une paire tous les ~120 m
    for(const sg of [-1,1]){const lat=RH+(26+r()*6)*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,rr=(4.2+r()*.8)*K;
      if(pres(x,z,RH+rr+12))continue;ob.push({x:x,z:z,y:dnHauteur(x,z)-2,h:(58+r()*16)*K,r:rr,a:Math.atan2(S.tx[i],S.tz[i])});}}
  for(let s9=520;s9<L9-700;s9+=(560+r()*320)*K){const i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01||S.ob[i]>.5){r();r();r();continue;} // LES ÉPARS : un tous les ~700 m, sur les dunes
    const sg=r()<.5?-1:1,lat=RH+(70+r()*150)*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,rr=(3.6+r()*1.4)*K;
    if(pres(x,z,RH+rr+45))continue;ob.push({x:x,z:z,y:dnHauteur(x,z)-3,h:(40+r()*36)*K,r:rr,a:r()*6.28});}
  let pyr=null;{const hw=(210+r()*50)*K,h=hw*1.27,c9=[];                                                   // LA GRANDE PYRAMIDE, près de l'oasis
    for(let s9=Math.max(0,L9-1900);s9<L9-250;s9+=140)for(const sg of [-1,1])c9.push([s9,sg]);
    for(let k=c9.length-1;k>0;k--){const j=(r()*(k+1))|0,x9=c9[k];c9[k]=c9[j];c9[j]=x9;}
    for(const c of c9){const i=Math.min(S.n-1,Math.round(c[0]/S.ds)),lat=RH+hw*1.45+(150+r()*120)*K,x=S.x[i]-S.tz[i]*c[1]*lat,z=S.z[i]+S.tx[i]*c[1]*lat;
      if(pres(x,z,hw*1.45+RH+70))continue;const a=r()*1.57;let y=1e9;for(const q of [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]])y=Math.min(y,dnHauteur(x+q[0]*hw*.9,z+q[1]*hw*.9));
      pyr={x:x,z:z,y:y-14,hw:hw,h:h,a:a};break;}}
  return {ob:ob,pyr:pyr};}
/* (2026-10-20, LE DÉSERT AU HASARD) les décors qui OMBRENT et qui TUENT, selon le tirage D (ici ou dans le travailleur) : l'allée (en paires, d'un côté,
   alternée, brisée), les épars, 0 à 3 pyramides, les grands monuments `mo` (sphinx, colosses, temple, portes : un cylindre pour la collision et l'ombre).
   Rien à moins de RH + rayon + 28 m d'une route (les deux bras d'une boucle compris), rien sur la garde des raccourcis. Son hasard : `D.sd`. */
function dnPrevoirDeco(S,sQ,K,RH,D){
  const rp=mulberry32((D.sd^0x0B5E11)>>>0),ob=[],pyrs=[],mo=[],L9=(S.n-1)*S.ds,pres=(x,z,lim)=>{for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lim*lim)return true;}return false;};
  const loin=(x,z,rr)=>{for(const p of pyrs)if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+rr+40)return false;for(const m of mo)if(Math.hypot(m.x-x,m.z-z)<m.r+rr+40)return false;return true;};
  const ou=(s9,sg,lat)=>{const i=Math.max(0,Math.min(S.n-1,Math.round(s9/S.ds)));return {i:i,x:S.x[i]-S.tz[i]*sg*lat,z:S.z[i]+S.tx[i]*sg*lat};};
  const A=D.allee,a0=sQ.obel0,a1=sQ.obel1;                                                                     // L'ALLÉE
  if(a0!=null&&a1!=null){let k9=0;for(let s9=a0+40;s9<a1-20;s9+=A.pas*K,k9++){const C9=A.mode==='gauche'?[-1]:A.mode==='droite'?[1]:A.mode==='alternee'?[k9&1?1:-1]:[-1,1];
    for(const sg of C9){const q=ou(s9,sg,RH+(26+rp()*8)*K),rr=(4.2+rp()*.8)*K*A.rK,br=A.mode==='brisee'&&rp()<.55;if(pres(q.x,q.z,RH+rr+12))continue;
      ob.push({x:q.x,z:q.z,y:dnHauteur(q.x,q.z)-2,h:(58+rp()*16)*K*A.hK*(br?.22+rp()*.3:1),r:rr,a:Math.atan2(S.tx[q.i],S.tz[q.i]),br:br?1:0});}}}
  if(D.epars.k>0)for(let s9=520;s9<L9-700;s9+=(560+rp()*320)*K/D.epars.k){const i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01||S.ob[i]>.5)continue; // LES ÉPARS
    const sg=rp()<.5?-1:1,q=ou(s9,sg,RH+(60+rp()*170)*K),rr=(3.6+rp()*1.4)*K,br=rp()<D.epars.br;if(pres(q.x,q.z,RH+rr+45))continue;
    ob.push({x:q.x,z:q.z,y:dnHauteur(q.x,q.z)-3,h:(40+rp()*36)*K*(br?.2+rp()*.35:1),r:rr,a:rp()*6.28,br:br?1:0});}
  for(const P9 of D.pyr){const hw=(210+rp()*50)*K*P9.k,h=hw*(P9.st==='etagee'?.95:1.27),c9=[];                    // LES PYRAMIDES
    if(P9.ou==='oasis')for(let s9=Math.max(0,L9-1900);s9<L9-250;s9+=140)for(const sg of [-1,1])c9.push([s9,sg]);
    else for(let k=0;k<26;k++)c9.push([L9*(.1+.75*rp()),rp()<.5?-1:1]);
    for(let k=c9.length-1;k>0;k--){const j=(rp()*(k+1))|0,x9=c9[k];c9[k]=c9[j];c9[j]=x9;}
    for(const c of c9){const q=ou(c[0],c[1],RH+hw*1.45+(120+rp()*200)*K);if(pres(q.x,q.z,hw*1.45+RH+70)||!loin(q.x,q.z,hw*1.45))continue;
      let y=1e9;for(const o of [[0,0],[1,1],[1,-1],[-1,1],[-1,-1]])y=Math.min(y,dnHauteur(q.x+o[0]*hw*.9,q.z+o[1]*hw*.9));pyrs.push({x:q.x,z:q.z,y:y-14,hw:hw,h:h,a:rp()*1.57,st:P9.st});break;}}
  const poser=(k,r9,h9,lat0,lat1)=>{for(let e=0;e<16;e++){const s9=L9*(.06+.86*rp()),i=Math.min(S.n-1,Math.round(s9/S.ds));if(S.gd[i]>.01)continue; // LES GRANDS MONUMENTS
      const sg=rp()<.5?-1:1,q=ou(s9,sg,RH+r9+(lat0+rp()*(lat1-lat0))*K);if(pres(q.x,q.z,RH+r9+28)||!loin(q.x,q.z,r9))continue;
      let y=1e9;for(const o of [[0,0],[1,0],[-1,0],[0,1],[0,-1]])y=Math.min(y,dnHauteur(q.x+o[0]*r9*.8,q.z+o[1]*r9*.8));
      mo.push({k:k,x:q.x,z:q.z,y:y-2,r:r9,h:h9,a:Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z),t:Math.atan2(S.tx[q.i],S.tz[q.i])});return;}};
  if(D.sphinx){const l=(56+rp()*26)*K;poser('sphinx',l*.55,l*.34,40,140);}                                          // il regarde la route
  for(let k=0;k<D.colosses;k++){const h=(30+rp()*22)*K;poser('colosse',h*.4,h,30,120);}
  if(D.temple){const l=(46+rp()*20)*K;poser('temple',l*.62,(15+rp()*6)*K,35,130);}
  for(let k=0;k<D.portes;k++){const h=(20+rp()*12)*K;poser('porte',h*1.1,h,25,90);}
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
  DN.vent=opt.vent;DN.lam=opt.lam;DN.oa=opt.oa;
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
  const t3=performance.now();dnOmbre(opt.sun[0],opt.sun[1],pv);ms.ombre=Math.round(performance.now()-t3);
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
  const S={n:NS,ds:DS,x:A9(NS),z:A9(NS),y:A9(NS),tx:A9(NS),tz:A9(NS),H:A9(NS),A:A9(NS),D:A9(NS),zC:A9(NS),pan:A9(NS),ob:A9(NS),gd:A9(NS),B:A9(NS),Yf:A9(NS),RE:A9(NS)};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];
  // ---- 2. LES SECTIONS (repères de genDunes → leur abscisse) : H = la profondeur de la mer de dunes sous la route, A = la hauteur des dunes,
  //      D = l'air sous la dalle, zC = la dune qui porte la route, pan = la cuvette d'argile, ob = l'allée — fondus d'une clé à l'autre ----
  const sQ={};if(DN.Q)for(const k in DN.Q){const p=DN.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  const KEYS=[],q=k=>sQ[k]!=null?sQ[k]:null,key=(s9,o)=>{if(s9!=null&&isFinite(s9))KEYS.push([Math.max(0,Math.min(L,s9)),o]);};
  const B0={H:85,A:100,D:30,zC:0,pan:0,ob:0},G=o=>Object.assign({},B0,o),CRE=G({H:100,A:95,D:11,zC:1}),VAG=G({H:75,A:80,D:10,zC:1});
  key(0,CRE);key(q('erg1'),CRE);
  key(q('tob0'),G({H:30,A:90,D:12,zC:1}));key(q('tob1'),G({H:-5,A:85,D:12,zC:1}));{const t=q('tob1');if(t!=null)key(t+280,B0);}  // le toboggan : la route plonge dans sa tranchée
  for(const [a,b] of [['vag0','vag1'],['vag2','vag3']]){const s0=q(a),s1=q(b);if(s0==null||s1==null)continue;key(s0-140,B0);key(s0,VAG);key(s1,VAG);key(s1+200,B0);}
  {const s0=q('vlei0'),s1=q('vlei1');if(s0!=null&&s1!=null){key(s0-260,B0);key(s0,G({H:40,A:125,D:22,pan:1}));key(s1,G({H:40,A:125,D:22,pan:1}));key(s1+300,B0);}}
  {const s0=q('cr2a'),s1=q('cr2b');if(s0!=null&&s1!=null){key(s0-200,B0);key(s0,CRE);key(s1,CRE);key(s1+220,B0);}}
  {const s0=q('obel0'),s1=q('obel1');if(s0!=null&&s1!=null){key(s0-180,B0);key(s0,G({H:46,A:60,D:16,pan:.6,ob:1}));key(s1,G({H:46,A:60,D:16,pan:.6,ob:1}));key(s1+200,B0);}}
  {const s0=q('oasis0');if(s0!=null){key(s0-200,B0);key(s0+120,G({H:38,A:90,D:14,pan:.5}));}key(L,G({H:38,A:90,D:14,pan:.5}));}
  for(const k0 in sQ){const m=/^(crm|tbm|gum)(\d+)a$/.exec(k0);if(!m)continue;const s0=sQ[k0],s1=sQ[m[1]+m[2]+'b'];if(s1==null||!(s1>s0))continue; // (2026-10-20) LES MODULES NEUFS et leur sable
    if(m[1]==='crm'){key(s0-160,B0);key(s0,CRE);key(s1,CRE);key(s1+180,B0);}                                             // la crête en S : une dune sous la route
    else if(m[1]==='tbm'){key(s0-120,B0);key(s0,G({H:30,A:90,D:12,zC:1}));key(s1,G({H:5,A:85,D:12,zC:1}));key(s1+240,B0);} // le toboggan double : sa tranchée
    else{key(s0-200,B0);key(s0,G({H:40,A:125,D:22,pan:.8}));key(s1,G({H:40,A:125,D:22,pan:.8}));key(s1+240,B0);}}        // le gué : la cuvette d'argile entre deux grandes dunes
  KEYS.sort(function(a,b){return a[0]-b[0];});DN.sQ=sQ;
  // LA GARDE DES RACCOURCIS (comme le canyon) : de l'approche à la sortie de chaque boucle, la mer de dunes descend loin sous la route et le plafond reste presque plat
  const GD=new Float32Array(NS);
  for(const k0 in sQ){const m=/^(rac[A-Z])0$/.exec(k0);if(!m)continue;const nm=m[1],iv=[sQ[nm+'0']-60,sQ[nm+'3']+80];if(!isFinite(iv[0])||!isFinite(iv[1]))continue;
    const i0=Math.max(0,Math.floor((iv[0]-160)/DS)),i1=Math.min(NS-1,Math.ceil((iv[1]+160)/DS));
    for(let i=i0;i<=i1;i++){const s9=i*DS,d=s9<iv[0]?iv[0]-s9:s9>iv[1]?s9-iv[1]:0,g=Math.max(0,1-d/160);if(g>GD[i])GD[i]=g;}}
  {let kk=0;const ph=[r()*6.28,r()*6.28,r()*6.28];
   for(let i=0;i<NS;i++){const s9=i*DS;while(kk<KEYS.length-2&&KEYS[kk+1][0]<s9)kk++;const a=KEYS[kk],b=KEYS[Math.min(KEYS.length-1,kk+1)];
     let u=b[0]>a[0]?(s9-a[0])/(b[0]-a[0]):1;u=Math.max(0,Math.min(1,u));u=u*u*u*(u*(u*6-15)+10);const v=f=>a[1][f]+(b[1][f]-a[1][f])*u,g=GD[i];
     S.H[i]=(v('H')+(135-v('H'))*g)*(1+.10*Math.sin(s9/870+ph[0]));S.A[i]=(v('A')+(70-v('A'))*g)*K*(1+.12*Math.sin(s9/610+ph[1]));S.D[i]=v('D')+(52-v('D'))*g;
     S.zC[i]=v('zC')*(1-g);S.pan[i]=v('pan')*(1-g);S.ob[i]=v('ob');S.gd[i]=g;}}
  // le FOND : la route lissée sur ±300 m, moins la profondeur ; au loin, une mer plus haute (90 m sous la route) et plus calme
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.y[i];
   for(let i=0;i<NS;i++){const a=Math.max(0,i-w),b=Math.min(NS,i+w+1),ys=(c[b]-c[a])/(b-a);S.B[i]=ys-S.H[i];S.Yf[i]=ys-90;}}
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
  DN.lev=[];for(const k in sQ){const m=/^lv(\d+)$/.exec(k);if(!m||sQ['lf'+m[1]]==null)continue;const a=sQ[k],e=sQ['lf'+m[1]];if(!(e>a+40))continue;
    const ia=Math.min(NS-1,Math.round(a/DS)),ie=Math.min(NS-1,Math.round(e/DS));DN.lev.push({s:a,e:e,g:Math.max(0,(S.y[ia]-S.y[ie])/(e-a))});}
  DN.lev.sort(function(p,q){return p.s-q.s;}); // (2026-10-19) LES LÈVRES des vagues (dnLevre)
  DN.S=S;DN.ms={ech:Math.round(performance.now()-t0)};
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'dunesSoir']||BIOMES.dunesSoir,cA=bio9.cyA||[6,-110,0,0];
  const opt={K:K,seed:seed,RH:RH,TH:TH,sQ:sQ,sun:[cA[0],cA[1]],vent:DN.vent,lam:DN.lam,oa:oa,Af:120*K,deco:D9,pal:{dnPlat:PAL.b('dnPlat',64),dnFin:PAL.b('dnFin',12),dnOmbre:PAL.b('dnOmbre',44)}};
  DN.oa=oa;DN.t0=t0;
  const W=started&&!/[?&]dnw=0\b/.test(location.search)?dnTravailleur():null;
  if(W){const job=DN.job;DN.attente={job:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz});return;}catch(e){console.warn('dunes : travailleur',e);DN.attente=null;}}
  dnMondePose(dnMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function dnTravailleur(){if(DN.w!==undefined)return DN.w;
  try{const fns=[mulberry32,cyNz,cyBil,dnDune,dnHauteur,dnProfil,dnPrevoir,dnPrevoirDeco,dnOmbre,dnMondeCalc].map(function(f){return f.toString();}).join('\n');
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
  U.uW.value.fromArray(DN.vent);U.uLam.value=DN.lam;const oa=DN.oa;if(oa)U.uOA.value.set(oa.x,oa.z,oa.r,oa.y);else U.uOA.value.set(0,0,0,0);
  DN.on=true;DN.mesh.visible=true;
  try{dnMonuments(DN.job);}catch(e){console.warn('dunes : décors',e);}
  DN.ms.pose=Math.round(performance.now()-t4);DN.ms.total=Math.round(performance.now()-(DN.t0||t4));
}
