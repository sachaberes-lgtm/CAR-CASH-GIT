/* <<<VOLCAN>>> */
/* ======================= LE ROYAUME DE FEU — LA MAP DU VOLCAN (2026-10-14, Sacha : « fais une nouvelle map en mode royaume des flammes
   dans Adventure Time ou Mustafar dans Star Wars, avec une map volcanique, des lacs de lave, de volcan et tout » · « il faut qu'il se
   passe des choses cool, pas d'élément de gameplay trop bizarre (lac de lave tue bien sûr), mais sinon une génération de map qui descend
   le long du volcan, des lacs de lave et tout ; il faut une ambiance et des couleurs bien travaillées ») =======================
   Une planète de feu à l'échelle de CASH CAR. Le gameplay est celui de toujours (la route, les sauts, les pièces) : le volcan est un DÉCOR
   qui vit, et la lave TUE (on y tombe = 'lave', on s'écrase sur la roche = 'roche').
   · LA ROUTE v4 (`genVolcan` → `vlcTrace`, 15/10 — Sacha : « pas toute plate, qu'elle s'emmêle, qu'on visite la map et qu'on prenne des
     raccourcis ») : elle DESCEND en ondulant, de l'épaule du grand volcan au lac — la CORNICHE autour du GRAND VOLCAN (`VOLCAN.K`), l'ARCHE,
     LES FUMERONS (virages serrés cachés dans la fumée), LE LAC de lave ouverte (`VOLCAN.lac`), l'ARRIVÉE face au second volcan (`VOLCAN.K2`) ;
     quatre BOUCLES À RACCOURCI (`VOLCAN.sauts`) la font repasser sous elle-même. Sous la route haute, une ARÊTE de basalte (volcanSol).
   · LE RELIEF (`volcanSol`) : une grille de 26 m — la MER DE LAVE plate (`ySea`, 72 m sous le point le plus bas de la route) semée d'îles et
     de MESAS, les deux CÔNES qui en sortent (ravines, lèvre, cratère), coupés par le COULOIR de la dalle la plus basse (là où la route
     repasse sous elle-même) ; au-delà de la grille, la mer continue jusqu'à l'horizon (`vlcMerLoin`).
   · LA LAVE (`VLC_LAVE_FS`) : des plaques de croûte noire qui dérivent dans le sens de la pente, la lave vive entre elles (rouge → orange →
     jaune, assez forte pour que la bloom s'en empare), la croûte qui fige sur les rives ; elle perce le brouillard (une lave, ça se voit de
     loin). Les COULÉES (`vlcCoulee`) descendent la plus grande pente depuis les cratères et les mesas, passent SOUS la route, et deviennent des
     chutes de lave sur les à-pics.
   · LA ROCHE (`VLC_SOL_FS`) : basalte noir, cendre grise sur le plat, oxyde rouille sur les pentes, soufre jaune autour des bouches chaudes ;
     les rives ROUGEOIENT (la lave éclaire la roche par en dessous) et des fissures couvent là où la roche est chaude.
   · CE QUI SE PASSE : les ÉRUPTIONS du grand volcan (`vlcEruption`) — le cratère s'embrase, une fontaine de lave, des BOMBES qui passent
     au-dessus de la route et s'écrasent dans les lacs devant (décor : elles ne touchent jamais la caisse), le sol qui tremble ; les GEYSERS
     de lave des petits cônes au bord de la route (`VLC_GEY`) ; les PANACHES des volcans ; les braises qui montent et la cendre qui tombe
     autour de la caisse ; au loin, deux volcans qui luisent.
   · LES MÉTÉOS (`SF_CARTES.volcan`, `VLC_MET`) : MATIN (aube rose sur le basalte), MIDI (soleil blanc, brume de soufre), SOIR (le ciel rouge
     sang : la carte postale), NUIT (la lave est la seule lumière), PLUIE → PLUIE DE CENDRES (le ciel brun, la cendre qui tombe, la lave qui
     brille plus fort), ORAGE → ORAGE VOLCANIQUE (le panache noir, les éclairs d'orageTick, les éruptions plus fréquentes).
   · LA LUMIÈRE : des ShaderMaterial (0 programme compilé en course, aucune lumière ajoutée) qui relisent les lumières de bioApply ; leur
     direction de soleil est celle de la météo ; la lave éclaire (uLue), l'éruption aussi (uErupt), les phares de la caisse (uPhare).
   Console : `dbgVolcan()` (comptes, temps), `dbgVolcan('eruption')`, `dbgVolcan('meteo','nuit')`, `dbgVolcan('vue',{p,c})`,
   `dbgVolcan('aiguille'|'arche'|'volcan',{d,h})` (photos en pause). Lancer : `?carte=volcan&meteo=soir`. */
/* (v5, 2026-10-18 — Sacha : « la map volcan est la plus moche, lance une grosse refonte ») LA REFONTE VISUELLE : la route, les boucles, les
   collisions et le gameplay ne bougent pas ; tout ce qu'on VOIT est refait — la lave en plaques (VLC_LAVE_FS5), la roche en facettes (VLC_SOL_FS5),
   les ciels, la fumée, les braises. `?volcan=avant5` = l'aspect d'avant (la ROUTE, elle, se choisit avec `?volcan=v4`). */
const VLC5=!/[?&]volcan=avant5/.test(location.search);
/* (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map soit aléatoire avec des modules et des
   décors qui changent ») LE VOLCAN AU HASARD (vlcTraceH) et LE DÉCOR AU HASARD (vlcDecoTire) — `?sans=volcanhasard` = la route d'avant au point près,
   `?sans=volcandecor` = le décor d'avant au tirage près. */
const VLC_HZ=!/[?&]sans=([^&]*,)?volcanhasard(,|&|$)/.test(location.search),VLC_DECOR=!/[?&]sans=([^&]*,)?volcandecor(,|&|$)/.test(location.search);
const NIV_VOLCAN={id:'volcan',nm:'LE ROYAUME DE FEU',bio:['volcanSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.26,sheen:.14,piste:'volcan',pr:'LA LAVE NE PARDONNE PAS'};
const VOLCAN={root:null,Q:null,C:null,K:null,C2:null,K2:null,hand:1,sSp:0,plg:[],sol:null,solM:null,aig:[],arche:null,gcol:null,
  met:'soir',cur:null,de:null,to:null,k:1,dur:1,ms:0,n:{},fx:{},mats:null,graine:0,erup:{t:7,age:-1,n:0,b:0},son:{k:{}},loin:[]};
/* LES MÉTÉOS DU VOLCAN — el : hauteur du soleil (°) · lue : la roche qui rougeoie (rives, fissures) · lav : l'éclat de la lave · cen : la
   cendre qui tombe · bra : les braises qui montent · fum/fumC : le panache · bru/bC : la brume basse des lacs · gey : les geysers ·
   eru : la cadence des éruptions · phare : les phares sur la roche · sons · fu/fuF/fuC : les BANCS DE FUMÉE (densité, portée de la vue dedans, couleur) */
const VLC_MET={
  matin:{el:11,lue:.85,lav:1,  cen:.10,bra:.30,fum:.80,fumC:[.62,.52,.58],bru:.34,bC:[.30,.13,.16],gey:1,  eru:1,  phare:.05,sons:'jour',fu:.9, fuF:280,fuC:[.24,.08,.12]},
  midi: {el:58,lue:.62,lav:.9, cen:.06,bra:.18,fum:.85,fumC:[.64,.58,.54],bru:.16,bC:[.34,.27,.22],gey:1,  eru:1,  phare:0,  sons:'jour',fu:.85,fuF:300,fuC:[.26,.10,.11]},
  soir: {el:5, lue:1.05,lav:1.08,cen:.22,bra:.6,fum:.92,fumC:[.40,.19,.15],bru:.36,bC:[.36,.08,.06], gey:1.1,eru:1.1,phare:.4, sons:'soir',fu:1,  fuF:250,fuC:[.24,.06,.07]},
  nuit: {fu:1,fuF:220,fuC:[.14,.03,.06],el:34,lue:1.9,lav:1.75,cen:.22,bra:1, fum:1,  fumC:[.16,.08,.08],bru:.75,bC:[.36,.07,.03],gey:1.2,eru:1.3,phare:1,  sons:'nuit'},
  pluie:{el:48,lue:1.15,lav:1.12,cen:1,  bra:.45,fum:1, fumC:[.30,.26,.24],bru:.7, bC:[.26,.21,.18],gey:.9, eru:1,  phare:.6, sons:'cendre',fu:1,fuF:230,fuC:[.20,.08,.08]},
  orage:{el:48,lue:1.25,lav:1.18,cen:.55,bra:.85,fum:1, fumC:[.14,.10,.12],bru:.9, bC:[.22,.10,.10],gey:1.1,eru:1.6,phare:.9, sons:'orage',fu:1,fuF:220,fuC:[.13,.04,.09]}};
/* (v5) LA FUMÉE n'est plus un rouge plat : dans un banc tout l'écran virait au ROUGE PUR (même la route) — un air prune, plus froid que la lave,
   où les bords néon et la ligne or se lisent encore ; la brume basse des lacs, moins rouge aussi. Les braises et la cendre un cran plus rares. */
if(VLC5){const F9={matin:[.24,.14,.20],midi:[.32,.27,.29],soir:[.20,.08,.14],nuit:[.08,.04,.11],pluie:[.21,.16,.17],orage:[.10,.06,.12]};
  for(const k in F9){VLC_MET[k].fuC=F9[k];VLC_MET[k].bra*=.7;VLC_MET[k].cen*=.8;}
  /* la BRUME BASSE (celle qui stagne sous la route, sur les lacs) passait TOUT ce qui est en contrebas au rouge-brun : la plaine devenait une boue
     rouge ; elle s'allège de moitié et prend le violet de l'air */
  const B9={matin:[.18,[.30,.18,.26]],midi:[.10,[.34,.28,.30]],soir:[.16,[.24,.08,.16]],nuit:[.34,[.16,.05,.12]],pluie:[.40,[.24,.19,.20]],orage:[.45,[.14,.07,.14]]};
  for(const k in B9){VLC_MET[k].bru=B9[k][0];VLC_MET[k].bC=B9[k][1];}
  /* le PANACHE : des bouffées BRUNES sur ciel orange = des taches de suie collées au ciel ; une cendre claire, lavande au soir, qui prend la lumière */
  const P9={matin:[.80,.66,.74],midi:[.78,.74,.74],soir:[.66,.42,.52],nuit:[.34,.24,.36],pluie:[.46,.40,.40],orage:[.26,.20,.28]};for(const k in P9)VLC_MET[k].fumC=P9[k];}
const VLC_U={uSunDir:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uFillC:{value:new THREE.Color()},uFillD:{value:new THREE.Vector3(0,-1,0)},uCam:{value:new THREE.Vector3()},uCarP:{value:new THREE.Vector3(0,-1e5,0)},
  uCarF:{value:new THREE.Vector3(0,0,1)},uTime:{value:0},uPhare:{value:0},uFlash:{value:0},uLue:{value:1},uLav:{value:1},uErupt:{value:0},
  uCrat:{value:new THREE.Vector3(0,-1e5,0)},uBruC:{value:new THREE.Color(.8,.4,.3)},uBruK:{value:.5},uBruY:{value:0},uFumC:{value:new THREE.Color(.4,.2,.15)},uFum:{value:1},
  uCen:{value:0},uBra:{value:0},uBoxC:{value:new THREE.Vector3()},uPx:{value:1},uGey:{value:1},uVent:{value:new THREE.Vector2(1,.3)},uErupt2:{value:0},
  uLavT:{value:new THREE.Color(1,.42,.08)},uLavK:{value:0}}; // (2026-10-20, LE DÉCOR AU HASARD) LA PALETTE DE LA LAVE : la teinte (uLavT) et sa part (uLavK : 0 = l'orange d'avant, au bit près)
/* LES BUDGETS PAR PALIER (PAL : [ANCIEN, MOYEN, RÉCENT]) : maille et portée du relief, braises et cendres, bouffées du panache, geysers, orgues, coulées */
try{Object.assign(PAL.B,{volcanSolC:[34,30,26],volcanMarge:[1500,1900,2300],volcanPart:[350,650,1000],volcanFumee:[40,58,80],volcanGey:[6,9,12],volcanOrgues:[22,36,52],volcanRiv:[6,8,10]});}catch(e){}
/* LE CÔNE : le profil d'un stratovolcan (concave : raide au sommet, il s'étale au pied) et sa cuvette ; vlcConeR = l'inverse (le rayon
   où la pente passe à la hauteur y). K = {yP sommet, yB pied, rc rayon du cratère, cr sa profondeur, Rb rayon du pied, ex la courbure}. */
function vlcConeY(K,r){if(r<K.rc){const u=r/K.rc;return K.yP-K.cr*(1-u*u);}const u=Math.min(1,(r-K.rc)/(K.Rb-K.rc));return K.yB+(K.yP-K.yB)*Math.pow(1-u,K.ex);}
/* ---------------- LA ROUTE v4 : LA DESCENTE EMMÊLÉE (2026-10-15, Sacha : « la route ne doit pas être toute plate, mais doit quand même pouvoir
   s'emmêler, nous faire VISITER la map, permettre au joueur de s'amuser et de prendre des RACCOURCIS ») ----------------
   La balade de la v3 garde ses tableaux, mais on les VISITE EN DESCENDANT, de l'épaule du grand volcan jusqu'au lac de lave :
   0 · LE DÉPART, haut, et une première boucle (B0) ;
   1 · LE VOLCAN : la CORNICHE fait le tour du pied du grand volcan (`VOLCAN.K`, arc de 100-120° à `Rv` du cratère) en DESCENDANT (6 %) — le
       cône monte à côté de la caisse ; puis une boucle (B1) ;
   2 · L'ARCHE puis LES FUMERONS : des virages serrés cachés chacun dans un banc de fumée (`Q.tours`), coupés en deux groupes par une boucle (B2)
       posée dans une FENÊTRE dégagée (un raccourci se voit avant de sauter) ;
   3 · LA PLONGÉE sur le lac (B3), puis LE LAC (`VOLCAN.lac`) : de longues courbes qui ondulent à ~50 m au-dessus de la lave ouverte ;
   4 · L'ARRIVÉE face au second volcan (`VOLCAN.K2`).
   LE RELIEF (`pente`) : la route DESCEND (≈ 5 % de moyenne) mais en ONDULANT — deux houles (600 m et 230 m) qui creusent des bosses, des creux
   et de courtes remontées : jamais plat, jamais un mur. LES BOUCLES (`VOLCAN.sauts`, la mécanique éprouvée de la v2) : une ligne d'ÉLAN, l'entrée
   qui PLONGE (16 % sur 120 m), un tour COMPLET (le second demi-cercle plus large) qui descend de 36-44 m, et la SORTIE qui file dans l'axe de
   l'élan, 22-30 m à côté et ~40 m plus bas. LE RACCOURCI : au bout de l'élan, ne pas tourner — filer TOUT DROIT et retomber sur la sortie.
   Le cap reste à ±62° de l'axe (la route avance, les boucles s'emmêlent sur place) ; contrôle `conflits` (moins de 32 m d'air sous un croisement),
   6 essais dans un flux de hasard PROPRE (un seul tirage `rnd`). Les rayons suivent le palier (rM = 40 + 0,3·vw : sous rM, infranchissable). */
function* genVolcan(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais
  CAMPM.length=0;MODMARK.length=0;
  const LV=typeof lvPiste==='function'?lvPiste():1,gr=mulberry32((rnd()*4294967296)>>>0);
  let best=null;
  const V3=MODC_ON&&VLC_BALADE; // (2026-10-18, 2e tour) LA BALADE DES FLAMMES ET LA MONTÉE DU VOLCAN (voir vlcTrace3) ; `?volcan=v4` ou `?sans=modcartes` = avant
  for(let e=0;e<6;e++){if(e)yield;const r=V3&&VLC_HZ?vlcTraceH(gr,LV):V3?vlcTrace3(gr,LV):vlcTrace(gr,LV);if(!best||r.conflits<best.conflits)best=r;if(!r.conflits)break;}
  for(const k of ['K','C','K2','C2','Q','plg','sauts','sSp','ySea','conflits','croise','th0','th1','lac','hz'])VOLCAN[k]=best[k];
  if(VOLCAN.Q)VOLCAN.Q.c2=!!best.C2; // (LE DÉCOR AU HASARD) la route a-t-elle son second volcan à elle (v4) ? sinon le décor peut en poser un
  for(const m of best.mods||[])MODMARK.push(m); // (2026-10-18) LES MODULES DE CHAQUE MAP : ceux de l'essai gardé (voir vSlalom)
  return best.ctrl;}
function vlcTrace(rnd,LV){
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const Rs=()=>rM*(1.30+rnd()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,240);return a+rnd()*(b-a);},Rl=()=>Math.max(rM*2.2,240)+rnd()*120;
  /* LA PENTE (positive = on descend) : la houle (deux sinus) autour de 5 %, 6 % sur la corniche du volcan, 1,5 % ± 2 sur le lac, 1 % à l'arrivée ;
     les boucles ont la leur (gL l'entrée qui plonge, gF le tour) ; les 280 premiers mètres en douceur (le portail) */
  const ph1=rnd()*6.283,ph2=rnd()*6.283;let gF=null,gL=null,mode=0,gM=null; // gM : (2026-10-18) la HOULE DE LAVE (voir vHoule)
  const pente=s9=>{if(gL&&s9>=gL.s0&&s9<gL.s0+gL.l)return gL.a;if(gF!=null)return gF;
    let g=mode===1?.06+.012*Math.sin(s9/300*6.283+ph2):mode===2?.015+.022*Math.sin(s9/420*6.283+ph1):mode===3?.01:.044+.06*Math.sin(s9/560*6.283+ph1)+.03*Math.sin(s9/210*6.283+ph2);
    if(s9<280)g=.02+(g-.02)*THREE.MathUtils.smoothstep(s9,160,280);
    return Math.max(-.06,Math.min(.13,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);};
  let P=new THREE.Vector3(0,0,0),phi=0,s=0,y=0;
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=Math.max(2,Math.round(l/25));for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  const LIM=62,tourne=(aDeg,R)=>{const rel=wrap(phi)*57.2958;let a=aDeg;if(rel+a>LIM)a=LIM-rel;if(rel+a<-LIM)a=-LIM-rel;if(Math.abs(a)>2)arc(a,R);return a;}; // le cap borné : la route avance toujours
  const vers=(cible,R)=>{const a=wrap(cible*Math.PI/180-phi)*57.2958;if(Math.abs(a)>3)arc(a,R);};
  let sg=rnd()<.5?-1:1;
  /* LES MODULES DU ROYAUME DE FEU (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). Ils prennent TOUTE une case de `virages` (le niveau ne
     s'allonge presque pas) dès que la route a roulé 0,8-1,2 km × KV depuis le précédent (paquet mélangé, jamais deux fois de suite, hasard `rv` : un seul tirage de plus) :
       vSlalom  · LE SLALOM DE CENDRE : 4-6 virages alternés de 30-44° à 1,6-2 rM, une demi-porte pour entrer et pour sortir
       vCorde   · LA DOUBLE CORDE : de biais d'un côté, deux appuis du même côté (90-115° en tout) autour d'une coulée — on finit de biais de l'autre
       vChicane · LA CHICANE D'OBSIDIENNE : gauche-droite-gauche SERRÉE (1,3-1,5 rM), le défi de visibilité dans la fumée
       vHoule   · LA HOULE DE LAVE : 2 rouleaux (la pente ondule de ± 8-11 % sur 280-340 m × KV) en slalom (un virage de 44-56° par demi-vague) — le rouleur sent le rythme,
                  le voltigeur décolle aux crêtes dès le palier ~8
     Le cap reste dans ± LIM de l'axe (tourne) : la route avance toujours, les boucles, l'arche, les fumerons et le lac ne bougent pas. */
  const rv=MODC_ON?mulberry32((rnd()*4294967296)>>>0):null,MM=[],vmPaq=[];let vmNext=600*KV,vmLast=-1;
  const vAxe=()=>{if(Math.abs(wrap(phi)*57.2958)>20)vers((wrap(phi)>0?1:-1)*12,rM*(1.7+rv()*.3));};
  const vSlalom=()=>{vAxe();const n=4+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=wrap(phi)>0?-1:1;tourne(s9*a*.5,R);
    for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const vCorde=()=>{const T=90+rv()*25,s9=wrap(phi)>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((40+rv()*40)*KV);
    tourne(s9*a1,R);droite((40+rv()*50)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((40+rv()*40)*KV);};
  const vChicane=()=>{vAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=wrap(phi)>0?-1:1;droite(60*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(60*KV);};
  const vHoule=()=>{vAxe();const n=2,lam=(280+rv()*60)*KV,amp=.08+rv()*.03,L9=n*lam,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(s9){const u=(s9-s0)/L9;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);}};
    let s9=wrap(phi)>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;}; // chaque demi-vague est un virage de 44-56° (une demi-porte pour entrer et pour sortir)
  const vmJ=[vSlalom,vCorde,vChicane,vHoule];
  const vmTire=()=>{for(let e=0;e<6;e++){if(!vmPaq.length){const t=[0,1,2,3];for(let i=3;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)vmPaq.push(x);}
    const m=vmPaq.shift();if(m===vmLast)continue;return m;}return 0;};
  const vMod=()=>{const m=vmTire(),i0=ctrl.length-1;vmLast=m;vmJ[m]();MM.push({i0:i0,i1:ctrl.length-1});vmNext=s+(800+rv()*400)*KV;};
  // LES VIRAGES (règle RACCOURCIS : un virage compte sous 250 m de rayon) : 25-47°, un sur trois SERRÉ, une respiration de 40-100 m trois fois sur dix
  const virages=n=>{if(rv&&s>vmNext){vMod();n=0;} // (2026-10-18) LES MODULES DU ROYAUME DE FEU (voir vSlalom)
    for(let k=0;k<n;k++){const rel=wrap(phi)*57.2958;sg=Math.abs(rel)>25?(rel>0?-1:1):-sg;tourne(sg*(KV>1.3?22+rnd()*14:25+rnd()*22),rnd()<.33?Rs():Rn());if(rnd()<.3)droite(40+rnd()*60);}};
  // UNE BOUCLE À RACCOURCI (la v2, éprouvée au banc 10/10) : l'élan dans l'axe, l'entrée qui plonge, le tour complet, la sortie à côté de l'élan et plus bas
  const sauts=[],hand=rnd()<.5?-1:1;
  const boucle=b=>{{const a=wrap((rnd()-.5)*.6-phi)*57.2958;if(Math.abs(a)>3)arc(a,Math.max(220,rM*2)+rnd()*60);}
    droite(140*KV);
    const tb=(b%2?1:-1)*hand,R1=rM*(1.25+rnd()*.25),Dx=22+rnd()*8,R2=R1+Dx/2,len=Math.PI*(R1+R2),drop=36+rnd()*8,yE=y,pE=P.clone(),phE=phi,sE=s;
    const lP=120*KV;gL={s0:s,l:lP,a:.16};gF=Math.max(.02,(drop-.16*lP)/Math.max(50,len-lP));arc(tb*180,R1);arc(tb*180,R2);gF=null;gL=null;
    sauts.push({e:pE,phi:phE,sE:sE,sS:s,yE:yE,yS:y,D:Dx,tb:tb,R1:R1});ici('b'+b);
    droite(Math.max(250,vw*2.4)+rnd()*40);sg=rnd()<.5?-1:1;arc(sg*(18+rnd()*8),Rn());}; // la sortie se prolonge par un virage doux : à 1,25 × la vitesse du palier on se pose encore dans l'axe
  // 0 · LE DÉPART, et la première boucle
  /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : le cratère, l'arche, la plongée et le lac restent ; les boucles 1 et 2, les fumerons et les virages
     de liaison n'entrent que si la longueur visée les tient (`tient` : la part de LC9 déjà parcourue) — sinon la map d'avant, tirage pour tirage */
  const LC9=typeof longueurCible==='function'?longueurCible():0,tient=f=>!LC9||s<LC9*f;
  push();ici('depart');droite(240*KV*(LC9?.6:1));{const n9=2+Math.round((KV-1)*6);virages(LC9?1:n9);}boucle(0);
  // 1 · LE VOLCAN : on se place de biais, puis la corniche descend autour du cratère
  const hv=rnd()<.5?-1:1,Rv=Math.max(560,rM*3.2)+rnd()*120,aV=90+rnd()*20;
  droite(60*KV);vers(-hv*aV/2,Math.max(rM*1.9,210));droite(60*KV);
  const pV=P.clone(),phV=phi,yV0=y;ici('vlc0');mode=1;arc(hv*aV,Rv);mode=0;ici('vlc1');const sSp=s,yV1=y;
  const C=new THREE.Vector3(pV.x+hv*Rv*Math.cos(phV),0,pV.z-hv*Rv*Math.sin(phV)); // le centre de l'arc = le cratère
  {const n9=1+Math.round((KV-1)*4);if(tient(.32)){virages(LC9?1:n9);boucle(1);}}
  // 2 · L'ARCHE, puis LES FUMERONS (deux groupes, une boucle entre eux dans la fenêtre dégagée)
  virages(1);droite(60*KV);ici('arche0');droite(90*KV);ici('arche');droite(90*KV);ici('arche1');
  const tours=[],fumerons=n=>{for(let k=0;k<n;k++){droite((140+rnd()*80)*KV);const rel=wrap(phi)*57.2958;sg=Math.abs(rel)>12?(rel>0?-1:1):(rnd()<.5?-1:1);
    const s0=s,a=tourne(sg*(60+rnd()*35),Rs());tours.push({s0:s0,s1:s,a:Math.round(a)});}};
  {const f9=2+(rnd()<.5?1:0);if(tient(.5))fumerons(LC9?2:f9);if(tient(.5)){virages(1);boucle(2);}if(tient(.62)){virages(1);fumerons(2);}}
  Q.tours=tours;
  // 3 · LA PLONGÉE sur le lac, puis LE LAC : de grandes courbes qui ondulent au-dessus de la lave
  if(tient(.72)){virages(1);boucle(3);}else droite(80*KV);
  mode=2;const sL0=s;droite(80*KV);for(let k=0;k<3;k++){const rel=wrap(phi)*57.2958;sg=Math.abs(rel)>20?(rel>0?-1:1):-sg;tourne(sg*(26+rnd()*20),Rl());droite((50+rnd()*70)*KV);}
  const sL1=s;
  // 4 · L'ARRIVÉE
  mode=3;virages(2);droite(100*KV);ici('fin');droite(120*KV);
  // LE CONTRÔLE DES CROISEMENTS (points tous les 10 m, casiers de 40 m) : un passage à moins de 70 m d'un autre tronçon = un croisement ;
  // avec moins de 32 m d'air entre les deux dalles = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  // LE LAC : le cercle qui couvre la traversée (centre = barycentre, rayon = le point le plus loin + 220 m)
  let lac=null;{let sx=0,sz=0,n=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=sL0&&DN[i+3]<=sL1){sx+=DN[i];sz+=DN[i+2];n++;}
    if(n){const cx=sx/n,cz=sz/n;let r=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=sL0&&DN[i+3]<=sL1)r=Math.max(r,Math.hypot(DN[i]-cx,DN[i+2]-cz));lac={x:cx,z:cz,r:r+220};}}
  // LA LAVE, 48 m sous le point le plus bas de la route (le lac, l'arrivée) ; LE GRAND VOLCAN : 500-580 m au-dessus de la corniche, son pied plonge
  // dans la lave 160 m AVANT la route (on le longe sans le toucher) ; LE SECOND devant la fin, sa rive à ~250 m du portail
  let yMin=1e9;for(const p of ctrl)yMin=Math.min(yMin,p.y);const ySea=yMin-48;
  const cone=(yP,rc,cr,ex,rMer,yR)=>{const yB=ySea-380,f=Math.pow(((yR==null?ySea:yR)-yB)/(yP-yB),1/ex);return {yP:yP,yB:yB,rc:rc,cr:cr,ex:ex,Rb:rc+(rMer-rc)/Math.max(.05,1-f)};};
  const yV=(yV0+yV1)/2,K=cone(yV+500+rnd()*80,150,70,1.3,Rv-160,yV); // (le flanc passe à hauteur de la corniche 160 m avant elle : plus bas, il s'étale sous la route)
  const fin=Q.fin,K2=cone(fin.p.y+260+rnd()*120,130,65,1.35,900),C2=new THREE.Vector3(fin.p.x+Math.sin(fin.phi)*1150,0,fin.p.z+Math.cos(fin.phi)*1150);
  const a0=Math.atan2(pV.x-C.x,pV.z-C.z),a1=a0+wrap(Math.atan2(Q.vlc1.p.x-C.x,Q.vlc1.p.z-C.z)-a0);
  return {ctrl:ctrl,K:K,C:C,K2:K2,C2:C2,Q:Q,plg:[],sauts:sauts,sSp:sSp,ySea:ySea,conflits:conflits,croise:croise,th0:Math.min(a0,a1),th1:Math.max(a0,a1),lac:lac,mods:MM};
}
/* ---------------- LA ROUTE v5 : LA BALADE DES FLAMMES ET LA MONTÉE DU VOLCAN (2026-10-18, Sacha : « royaume de feu est de loin le plus nul :
   refonte totale de la map — je veux qu'on se balade dans le royaume des flammes, mais avec des virages, et où on monte autour du volcan et tout ») ----------------
   Deux temps, et c'est tout :
   1 · LA BALADE DANS LES PLAINES DE LAVE (~4,5 km × KV) : une route qui serpente au ras des coulées — des virages tout le temps (36-64°, un sur trois
       serré), l'ARCHE de basalte, le LAC DE LAVE qu'on traverse en grandes courbes, deux FUMERONS (leurs bancs de fumée, plus courts qu'avant), et
       trois MODULES du paquet (vSlalom, vCorde, vChicane, vHoule). Le relief ondule doucement (± 3 %), sans descendre : on est au pied du volcan.
   2 · LA MONTÉE DU VOLCAN : la route entre en tangente dans une SPIRALE qui grimpe autour du grand cône — 1,3 à 1,45 tour, le rayon qui se resserre
       de ~460 à ~260 m (× l'échelle du palier), ONDULÉE (six lobes par tour, comme les ravines du cône : on serre, on relâche), 5,5-6,5 % de
       montée continue (~170 m) : le cratère se rapproche à chaque tour, on voit d'en haut la plaine
       et la route qu'on vient de prendre. Le cône est TAILLÉ pour la spirale (vlc3Cone) : son flanc passe ~24 m sous la route à chaque rayon, le
       cratère ~200 m au-dessus du dernier tour, son pied plonge dans la mer de lave. La spirale se termine sous la lèvre, le PORTAIL est là-haut, sur la
       dernière corniche.
   Les tours de la spirale sont à ≥ 135 m l'un de l'autre (la règle d'or du terrain les tient : > 120 m). Plus de boucles à raccourci (sauts vide),
   plus de second volcan (K2/C2 null), les coulées partent du cratère et passent sous la spirale (th0/th1 = l'angle qu'elle couvre).
   `?volcan=v4` = la descente emmêlée d'avant (avec ses modules). */
/* (2026-10-19, session HASARD — Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») LE ROYAUME AU HASARD.
   MESURÉ (40 graines, palier 0 ; l'ÉCART DE FORME : les pistes rééchantillonnées en 64 points, départ à l'origine, la distance moyenne entre
   deux pistes / la longueur moyenne) : 0,085 — la graine changeait à chaque partie, la RECETTE jamais : plein nord, l'arche à 6-10 % du
   parcours, le lac au milieu, la montée du volcan toujours à 43-49 %. Désormais chaque royaume tire, dans son propre flux (`rh` : un seul
   tirage `rnd` de plus) :
   · son AXE (±45° autour du nord, comme la vallée de jade : la butée de cap ±72° et le « devant » du cône se comptent autour de lui) ;
   · l'ORDRE des tableaux de la balade — l'arche, le lac, un ou deux fumerons, un à trois modules (jamais l'arche juste avant la montée) —,
     ceux que la longueur visée tient, et la longueur des tronçons de virages qui les séparent ;
   · un CARACTÈRE par tronçon (`VLC_HUMEURS`), jamais deux fois le même de suite ;
   · LA MONTÉE : 0,9 à 1,55 tour, ses rayons (le dernier tour 1-1,25 × celui d'avant, ≥ 140 m d'un tour à l'autre), sa pente (5-7 %) — elle
     prend de ~35 à ~60 % du parcours ; le portail reste là-haut ;
   · LE COUDE DE LA PLAINE : au milieu de la balade, l'axe tourne une fois de 15-35° d'un côté.
   Gardés : le rayon tenable (les virages serrés à 1,3-1,5 rM, jamais moins), la butée de cap (la balade ne se recroise jamais), le contrôle
   des croisements (6 essais), le cône taillé pour la spirale, les décors posés autour de la route. `?sans=hasardvolcan` = le royaume d'avant,
   tirage pour tirage. */
const VLC_HASARD=!/[?&]sans=([^&]*,)?hasardvolcan(,|&|$)/.test(location.search);
const VLC_HUMEURS=[ // a : angle d'un virage (°, minimum + étendue) · t : la part de virages SERRÉS (Rs) · Rk : le rayon des autres (× rM, minimum + étendue ; 0 = Rn) · inv : la chance de changer de côté · dr : [chance d'une droite après, longueur minimum, étendue] (m × KV)
  {nm:'flammes', a:[36,28],t:.33,Rk:0,        inv:1,  dr:[.2,30,40]},  // la balade d'avant : on louvoie, on revient vers l'axe passé 30°
  {nm:'serpent', a:[46,26],t:.6, Rk:0,        inv:1,  dr:[.05,20,20]}, // des S serrés, presque sans répit
  {nm:'courbes', a:[24,22],t:0,  Rk:[2.4,1.6],inv:.7, dr:[.35,50,80]}, // de grandes courbes qui se prennent à fond
  {nm:'derive',  a:[20,18],t:.15,Rk:[1.8,1.2],inv:.18,dr:[.3,40,70]},  // la plaine part en biais d'un côté, jusqu'à la butée
  {nm:'balcon',  a:[30,22],t:.2, Rk:0,        inv:.6, dr:[1,110,120]}, // de longues droites cassées de coudes : on voit loin
  {nm:'chicanes',a:[30,16],t:.7, Rk:0,        inv:1,  dr:[.08,20,30]}];// gauche-droite-gauche, vite
function vlcTrace3(rnd,LV){
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const H9=VLC_HASARD,rh=H9?mulberry32((rnd()*4294967296)>>>0):null;let phi0=H9?(rh()-.5)*1.5708:0; // (LE ROYAUME AU HASARD) son flux, son axe (qui peut tourner une fois : le coude de la plaine)
  const Rs=()=>rM*(1.30+rnd()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,200);return a+rnd()*(b-a);},Rl=()=>Math.max(rM*2,200)+rnd()*90;
  // LA PENTE (positive = on descend) : la plaine ondule (± 3 %), le lac presque plat, la spirale grimpe (gF), l'arrivée à plat
  const ph1=rnd()*6.283,ph2=rnd()*6.283;let gF=null,mode=0,gM=null;
  const pente=s9=>{if(gF!=null)return gF;
    let g=mode===2?.008+.015*Math.sin(s9/420*6.283+ph1):mode===3?0:.006+.022*Math.sin(s9/520*6.283+ph1)+.012*Math.sin(s9/230*6.283+ph2);
    if(s9<280)g=.01+(g-.01)*THREE.MathUtils.smoothstep(s9,160,280);
    return Math.max(-.05,Math.min(.06,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);};
  let P=new THREE.Vector3(0,0,0),phi=phi0,s=0,y=0;
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=Math.max(2,Math.round(l/25));for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  const rel9=()=>wrap(phi-phi0)*57.2958; // le cap autour de l'AXE (0 = le nord d'avant)
  const LIM=72,tourne=(aDeg,R)=>{const rel=rel9();let a=aDeg;if(rel+a>LIM)a=LIM-rel;if(rel+a<-LIM)a=-LIM-rel;if(Math.abs(a)>2)arc(a,R);return a;};
  const vers=(cible,R)=>{const a=wrap(phi0+cible*Math.PI/180-phi)*57.2958;if(Math.abs(a)>3)arc(a,R);};
  let sg=rnd()<.5?-1:1;
  // LES VIRAGES DE LA BALADE : 36-64°, un sur trois serré, presque jamais une droite (une sur cinq, 30-70 m) ; le cap balaie ± 72° : la route louvoie
  const virages=n=>{for(let k=0;k<n;k++){const rel=rel9();sg=Math.abs(rel)>30?(rel>0?-1:1):-sg;tourne(sg*(36+rnd()*28),rnd()<.33?Rs():Rn());if(rnd()<.2)droite((30+rnd()*40)*KV);}};
  // LES MODULES (les mêmes que la descente d'avant — voir vSlalom dans vlcTrace), trois dans la balade
  const rv=mulberry32((rnd()*4294967296)>>>0),MM=[],vmPaq=[];let vmLast=-1;
  const vAxe=()=>{if(Math.abs(rel9())>20)vers((rel9()>0?1:-1)*12,rM*(1.7+rv()*.3));};
  const vSlalom=()=>{vAxe();const n=4+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=rel9()>0?-1:1;tourne(s9*a*.5,R);
    for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const vCorde=()=>{const T=90+rv()*25,s9=rel9()>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((30+rv()*30)*KV);
    tourne(s9*a1,R);droite((30+rv()*40)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((30+rv()*30)*KV);};
  const vChicane=()=>{vAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=rel9()>0?-1:1;droite(40*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(40*KV);};
  const vHoule=()=>{vAxe();const n=2,lam=(280+rv()*60)*KV,amp=.07+rv()*.03,L9=n*lam,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(s9){const u=(s9-s0)/L9;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);}};
    let s9=rel9()>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;};
  const vmJ=[vSlalom,vCorde,vChicane,vHoule];
  const vMod=()=>{let m=0;for(let e=0;e<6;e++){if(!vmPaq.length){const t=[0,1,2,3];for(let i=3;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)vmPaq.push(x);}m=vmPaq.shift();if(m!==vmLast)break;}
    vmLast=m;const i0=ctrl.length-1;vmJ[m]();MM.push({i0:i0,i1:ctrl.length-1});};
  // LES FUMERONS : un virage franc dans un banc de fumée (Q.tours : les bancs de buildVolcanG)
  const tours=[],fumeron=()=>{droite((70+rnd()*50)*KV);const rel=rel9();sg=Math.abs(rel)>12?(rel>0?-1:1):(rnd()<.5?-1:1);const s0=s,a=tourne(sg*(55+rnd()*30),Rs());tours.push({s0:s0,s1:s,a:Math.round(a)});};
  // ================= 1 · LA BALADE =================
  /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : la SPIRALE (~1,37 tour, estimée `Lsp9`), l'ARCHE et le LAC restent ; la balade ne garde de ses
     virages, modules et fumerons que ce que la longueur visée tient (`bal` : la part du budget de la balade déjà parcourue) — sinon la map d'avant */
  const LC9=typeof longueurCible==='function'?longueurCible():0,Lsp9=1.37*Math.PI*(Math.max(450,rM*3.8)+Math.max(250,rM*2.4)),B9=Math.max(1200,LC9-Lsp9-300),bal=f=>!LC9||s<B9*f;
  const lacDe=en=>{mode=2;sL0=s;droite(60*KV);for(let k=0;en(k);k++){const rel=rel9();sg=Math.abs(rel)>20?(rel>0?-1:1):-sg;tourne(sg*(30+rnd()*20),Rl());if(rnd()<.4)droite((30+rnd()*40)*KV);}sL1=s;mode=0;}; // LE LAC DE LAVE : de grandes courbes presque à plat
  let sL0=0,sL1=0,SP=null,HZ=null;
  if(!H9){
  push();ici('depart');droite(200*KV);virages(LC9?1:2);
  droite(50*KV);ici('arche0');droite(80*KV);ici('arche');droite(80*KV);ici('arche1'); // L'ARCHE de basalte, tôt : loin de la spirale
  if(bal(.35)){virages(LC9?1:2);vMod();}if(bal(.5)){virages(1);fumeron();}if(bal(.6)){virages(LC9?1:2);vMod();}
  lacDe(k=>k<(bal(.75)?4:2)); // (la condition relue à chaque courbe, comme avant)
  if(bal(.85)){virages(LC9?1:2);vMod();}if(bal(.92))fumeron();virages(LC9?1:2);
  }else{
  /* LE ROYAUME AU HASARD (voir VLC_HASARD). LA MONTÉE d'abord tirée (sa longueur fixe le budget de la balade) : 0,9 à 1,55 tour, le dernier tour à
     1-1,25 × le rayon d'avant, le premier à ≥ 140 m par tour au-dessus (l'écart entre les tours tient), jamais plus de 58 % de la longueur visée */
  SP=(function(){const Rb=Math.max(450,rM*3.8),R1=Math.max(250,rM*2.4)*(1+rh()*.25);let tr=.9+rh()*.65,R0=Math.max(R1+140*tr,Rb*(.9+rh()*.35));
    if(LC9){const Lx=tr*Math.PI*(R0+R1);if(Lx>.58*LC9){tr=Math.max(.9,tr*.58*LC9/Lx);R0=Math.max(R1+140*tr,Math.min(R0,Rb*1.1));}}
    return {R0:R0,R1:R1,TH:tr*Math.PI*2,pM:.05+rh()*.02,L:tr*Math.PI*(R0+R1)};})();
  /* LES TABLEAUX DE LA BALADE, dans un ordre tiré : l'arche, le lac, un fumeron et un module toujours ; puis, si la longueur visée les tient, le
     2e module, le 3e module, le 2e fumeron (au palier 0 : le plus souvent 1 fumeron et 2 modules, comme avant) ; entre eux (et avant la montée) des
     tronçons de virages, chacun SON caractère (VLC_HUMEURS) et sa part de la longueur libre */
  const Bb=LC9?Math.max(1200,LC9-SP.L-300):4500*KV,lib0=Bb-200*KV;let nLac=2+((rh()*3)|0);
  const E={arche:210*KV,lac:(60+nLac*190)*KV,fum:200*KV,mod:480*KV};
  let tot=E.arche+E.lac+E.fum+E.mod;if(tot>.95*lib0&&nLac>2){tot-=(nLac-2)*190*KV;nLac=2;} // (serré : le lac en deux courbes)
  const TB=['arche','lac','fum','mod'];for(const k of ['mod','mod','fum'])if(tot+E[k]<=.95*lib0){TB.push(k);tot+=E[k];}
  for(let i=TB.length-1;i>0;i--){const j=(rh()*(i+1))|0,x=TB[i];TB[i]=TB[j];TB[j]=x;}
  if(TB[TB.length-1]==='arche'){const j=(rh()*(TB.length-1))|0;TB[TB.length-1]=TB[j];TB[j]='arche';} // l'arche jamais juste avant la montée
  const W=[];for(let i=0;i<=TB.length;i++)W.push(.35+rh());const sw=W.reduce(function(a,b){return a+b;},0),free=Math.max(0,lib0-tot),HU=[];
  let hPrec=-1;const humeur=()=>{let i=(rh()*VLC_HUMEURS.length)|0;if(i===hPrec)i=(i+1+((rh()*(VLC_HUMEURS.length-1))|0))%VLC_HUMEURS.length;hPrec=i;return VLC_HUMEURS[i];}; // jamais deux fois le même de suite
  const tronH=(len,H)=>{const s0=s,dv=rh()<.5?-1:1;let n=0; // un tronçon de virages au caractère H (la DÉRIVE insiste d'un côté jusqu'à la butée)
    while((s-s0<len-40*KV||(!n&&len>60*KV))&&n<40){const r=rel9();
      if(H.nm==='derive')sg=r*dv>LIM-16?-dv:(rh()<H.inv?-dv:dv);else sg=Math.abs(r)>30?(r>0?-1:1):(rh()<H.inv?-sg:sg);
      const R=rh()<H.t?Rs():H.Rk?rM*(H.Rk[0]+rh()*H.Rk[1]):Rn();tourne(sg*(H.a[0]+rh()*H.a[1]),R);n++;
      if(rh()<H.dr[0])droite((H.dr[1]+rh()*H.dr[2])*KV);}};
  /* LE COUDE DE LA PLAINE : une fois, au milieu de la balade, l'axe tourne de 15-35° d'un côté (la butée de cap suit) — ni avant ni après le coude
     le cap ne s'écarte de plus de 90° de la bissectrice des deux axes : la balade ne se recroise toujours pas */
  const iC=1+((rh()*Math.max(1,TB.length-1))|0),dC=(rh()<.5?-1:1)*(15+rh()*20)*Math.PI/180;
  push();ici('depart');droite(200*KV);
  for(let i=0;i<=TB.length;i++){if(i===iC)phi0+=dC;const H=humeur();HU.push(H.nm);tronH(free*W[i]/sw,H);if(i===TB.length)break;const k=TB[i];
    if(k==='arche'){droite(50*KV);ici('arche0');droite(80*KV);ici('arche');droite(80*KV);ici('arche1');}
    else if(k==='lac')lacDe(j=>j<nLac);else if(k==='fum')fumeron();else vMod();}
  HZ={axe:phi0-(iC<=TB.length?dC:0),coude:Math.round(dC*57.2958),ordre:TB.slice(),humeurs:HU};
  }
  // ================= 2 · LA MONTÉE DU VOLCAN =================
  const hv0=rnd(),hv=rel9()>=0?1:-1,R0=SP?SP.R0:Math.max(450,rM*3.8)+rnd()*30,R1=SP?SP.R1:Math.max(250,rM*2.4)+rnd()*20,TH=SP?SP.TH:Math.min((1.3+rnd()*.15)*Math.PI*2,(R0-R1)/135*Math.PI*2),pM=SP?SP.pM:.055+rnd()*.01,
    AW=r=>Math.max(0,Math.min(25,(1/(1.5*rM)-1/r)*(r/6)*(r/6))),phW=rnd()*6.2832; // AW(r) : l'ONDULATION de la spirale (6 lobes par tour), plus franche sur les tours larges ; jamais un rayon sous 1,5 rM (d'un tour à l'autre elle change de < 15 m : l'écart entre les tours tient)
  vers(hv*90,Math.max(rM*2,220));droite(60*KV); // on se met EN TRAVERS de l'axe : le cône sera devant la plaine, jamais dessus
  const cA=new THREE.Vector3(P.x+R0*Math.cos(phi),0,P.z-R0*Math.sin(phi)),cB=new THREE.Vector3(P.x-R0*Math.cos(phi),0,P.z+R0*Math.sin(phi)),fx9=Math.sin(phi0),fz9=Math.cos(phi0),C=(cA.x*fx9+cA.z*fz9)>(cB.x*fx9+cB.z*fz9)?cA:cB; // le centre du cône : à R0 de la route, du côté où l'on va (DEVANT, le long de l'axe)
  const b0=Math.atan2(P.x-C.x,P.z-C.z),yH0=y,sH0=s;ici('vlc0');
  const Lh=TH*(R0+R1)/2;gF=-pM; // la montée continue (pente négative = on monte)
  { // LA SPIRALE : l'angle autour du cône avance de TH, le rayon se resserre de R0 à R1 ; le sens qui prolonge le cap actuel
    const t0x=Math.sin(phi),t0z=Math.cos(phi),dPos=sb=>[Math.cos(b0)*sb,-Math.sin(b0)*sb]; // d(pos)/dβ au départ (au facteur r près)
    const sgB=(dPos(1)[0]*t0x+dPos(1)[1]*t0z)>0?1:-1,nP=Math.max(60,Math.ceil(Lh/12));
    const t1=.12,eas=SP?(t=>(t<t1?t*t/(2*t1):t>1-t1?1-t1-(1-t)*(1-t)/(2*t1):t-t1/2)/(1-t1)):(t=>t); // (AU HASARD) le rayon se resserre en DOUCEUR à l'entrée et à la sortie : la spirale part et finit en tangente (sans ça, un cran de 4-7° quand elle se resserre vite)
    for(let k=1;k<=nP;k++){const t=k/nP,b=b0+sgB*TH*t,rL=R0+(R1-R0)*eas(t),r=rL+AW(rL)*Math.sin(6*(b-b0)+phW)*Math.min(1,t*8,(1-t)*8);
      const nx=C.x+Math.sin(b)*r,nz=C.z+Math.cos(b)*r;phi=Math.atan2(nx-P.x,nz-P.z);avance(nx,nz);}
    var bFin=b0+sgB*TH;}
  gF=null;mode=3;const yH1=y,sSp=s;ici('vlc1');
  droite(60*KV);ici('fin');droite(50*KV); // l'arrivée : en tangente, le portail sur la dernière corniche (courte : plus longue, elle repassait au-dessus du tour d'en dessous)
  // LE CONTRÔLE DES CROISEMENTS (le même que la descente) : un passage à moins de 70 m d'un autre tronçon ; avec moins de 32 m d'air = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  // LE LAC (même règle qu'avant)
  let lac=null;{let sx=0,sz=0,n=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=sL0&&DN[i+3]<=sL1){sx+=DN[i];sz+=DN[i+2];n++;}
    if(n){const cx=sx/n,cz=sz/n;let r=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=sL0&&DN[i+3]<=sL1)r=Math.max(r,Math.hypot(DN[i]-cx,DN[i+2]-cz));lac={x:cx,z:cz,r:r+180};}}
  // LA LAVE, 48 m sous le point le plus bas de la route ; LE CÔNE taillé pour la spirale
  let yMin=1e9;for(const p of ctrl)yMin=Math.min(yMin,p.y);const ySea=yMin-48;
  const rc9=Math.max(110,R1*.42),K=vlc3Cone(R0,yH0-24,R1,yH1-24,yH1-24+1.6*(yH1-yH0)/Math.max(60,R0-R1)*(R1-rc9)+40,rc9,70,ySea);
  const th0=Math.min(b0,bFin),th1=Math.max(b0,bFin);
  return {ctrl:ctrl,K:K,C:C,K2:null,C2:null,Q:Object.assign(Q,{tours:tours},HZ?{hasard:HZ}:{}),plg:[],sauts:[],sSp:sSp,ySea:ySea,conflits:conflits,croise:croise,th0:th0,th1:th1,lac:lac,mods:MM,
    spirale:{R0:R0,R1:R1,tours:+(TH/6.2832).toFixed(2),monte:Math.round(yH1-yH0),L:Math.round(Lh)}};
}
/* LE CÔNE TAILLÉ POUR LA SPIRALE : le profil de vlcConeY (yB + (yP−yB)·(1−u)^ex au-delà du cratère) qui passe par (rA, yA) — le 1er tour — et
   (rB, yB2) — le dernier. Pour un exposant donné, le pied (Rb, yB) se trouve par dichotomie ; on prend le plus GRAND exposant (2,8 → 1,4) dont le pied
   plonge sous la lave (yB < ySea − 8) : convexe, le flanc reste SOUS la corde entre les deux tours, donc ~24 m sous la route (banc : 10-25 m de plus
   au milieu), et le volcan sort de la mer de lave. */
function vlc3Cone(rA,yA,rB,yB2,yP,rc,cr,ySea){
  let best=null;
  for(const ex of [2.8,2.4,2,1.7,1.4]){
    const yBde=Rb=>{const wA=Math.pow(1-(rA-rc)/(Rb-rc),ex);return (yA-yP*wA)/(1-wA);};
    const res=Rb=>{const yB=yBde(Rb),wB=Math.pow(1-(rB-rc)/(Rb-rc),ex);return yB+(yP-yB)*wB-yB2;};
    let lo=rA+20,hi=30000,rl=res(lo),rh=res(hi);if(rl*rh>0)continue;
    for(let i=0;i<70;i++){const m=Math.sqrt(lo*hi),rm=res(m);if(rm*rl>0){lo=m;rl=rm;}else hi=m;}
    const Rb=Math.sqrt(lo*hi),yB=yBde(Rb);if(!isFinite(yB))continue;
    best={yP:yP,yB:yB,rc:rc,cr:cr,ex:ex,Rb:Rb};if(yB<ySea-8)break;}
  return best||{yP:yP,yB:ySea-380,rc:rc,cr:cr,ex:1.3,Rb:rA+(rA-rc)*1.5}; // (sans solution : un cône classique — la règle d'or du terrain garde la route)
}
/* ---------------- LE VOLCAN AU HASARD (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map
   soit aléatoire avec des modules et des décors qui changent ») ----------------
   MESURÉ AVANT (banc des tracés, 24 graines) : écart de forme 0,088 / 0,089 / 0,128 aux paliers 0 / 10 / 25 — la balade de vlcTrace3 partait toujours plein
   nord (cap −5°..+5°), l'arche toujours au même endroit, le lac au milieu, la spirale toujours à la fin. Désormais (`vlcTraceH`, la route bâtie dans
   l'axe puis TOURNÉE EN BLOC), dans un flux de hasard à elle (`rh`, né de la graine de l'essai ; les modules dans `rv`, né de `rh`) :
   · LA RECETTE (`hz.recette`) : LA MONTÉE (la balade, puis la spirale qui grimpe au cratère : le portail là-haut — celle d'avant) · LA DESCENTE (le
     départ sur la lèvre du cratère, la spirale qui DESCEND autour du cône, puis la balade jusqu'au portail dans la plaine) · LA CORNICHE (la route
     longe le flanc du grand volcan au milieu de la balade, en montant ou en descendant, comme la v4) ;
   · L'AXE (`hz.axe`) : tout le cercle ; les COUDES entre deux pièces (l'axe tourne de ±8-18°, ±18° au plus autour de l'axe de base : la route ne
     revient jamais sur elle-même — la butée de cap reste ±72° autour de l'axe du moment) ;
   · LES PIÈCES et leur ORDRE (`hz.plan`) : l'arche (1, ou 2 une fois sur trois), le lac (1, ou 2 une fois sur quatre), 1 à 3 groupes de fumerons, 2 à 4
     modules, mélangés (jamais deux lacs de suite), chacune derrière sa LIAISON — un CARACTÈRE tiré, jamais deux fois le même de suite : virages
     (ceux d'avant), houle (grandes courbes à 2,2-3 rM), serpent (S serrés à 1,3-1,6 rM), dérive (en biais vers la butée, et ça ondule), cassures
     (droites et coudes francs) ;
   · LES MODULES (`vmJ`, un paquet de HUIT, mélangé, jamais deux fois de suite) : les quatre d'avant et quatre du royaume de feu —
       vPont    · LE PONT DE BASALTE : une longue droite bombée (± 4-6 %) au-dessus d'un bras de lave ouvert (un lac sous elle : `Q.lacs`)
       vCoulee  · LA DESCENTE EN COULÉE : 7-9 % de descente sur 300-400 m × KV, en deux ou trois courbes larges — la lave se rapproche
       vGeysers · LE S DES GEYSERS : deux virages opposés de 48-64° à 1,7-2 rM ; le décor y pose un CHAMP de hornitos qui crachent (`Q.geyS`)
       vCrochet · LE CROCHET D'OBSIDIENNE : on se met en biais d'un côté, puis un grand virage de 112-132° à 1,45-1,7 rM vers l'autre ;
   · la PENTE de la plaine (×0,8-1,3) et le départ (140-260 m).
   GARDÉS : la longueur (`longueurCible()` : la balade se remplit jusqu'à son budget comme avant), les rayons (rM), le contrôle des croisements
   (`conflits`), la spirale et son cône (vlc3Cone), le portail sur la dernière corniche (la montée) ou dans la plaine (les deux autres). */
function vlcTraceH(rnd,LV){
  const rh=mulberry32((rnd()*4294967296)>>>0),rv=mulberry32((rh()*4294967296)>>>0);
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const Rs=()=>rM*(1.30+rh()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,200);return a+rh()*(b-a);},Rl=()=>Math.max(rM*2,200)+rh()*90;
  const ph1=rh()*6.283,ph2=rh()*6.283,kP=.8+rh()*.5;let gF=null,gR=null,mode=0,gM=null;
  const pente=s9=>{if(gF!=null)return gR!=null?gF*Math.min(1,Math.max(.15,(s9-gR)/120)):gF;
    let g=mode===2?.008+.015*Math.sin(s9/420*6.283+ph1):mode===3?0:(.006+.022*Math.sin(s9/520*6.283+ph1)+.012*Math.sin(s9/230*6.283+ph2))*kP;
    if(s9<280)g=.01+(g-.01)*THREE.MathUtils.smoothstep(s9,160,280);
    return Math.max(-.05,Math.min(.06,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);};
  let P=new THREE.Vector3(0,0,0),phi=0,s=0,y=0;
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=Math.max(2,Math.round(l/25));for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  let AX0=0,AX=0;const LIM=72,rel=()=>wrap(phi-AX)*57.2958;   // AX0 : l'axe de la balade (0, ou la sortie de la spirale qui descend) · AX : l'axe du moment (les coudes)
  const tourne=(aDeg,R)=>{const r9=rel();let a=aDeg;if(r9+a>LIM)a=LIM-r9;if(r9+a<-LIM)a=-LIM-r9;if(Math.abs(a)>2)arc(a,R);return a;};
  const vers=(cible,R)=>{const a=wrap(cible*Math.PI/180+AX-phi)*57.2958;if(Math.abs(a)>3)arc(a,R);}; // (cible : en degrés, autour de l'axe du moment)
  let sg=rh()<.5?-1:1;
  // LES CARACTÈRES DES LIAISONS
  const CAR=['virages','houle','serpent','derive','cassures'],PLAN=[];let cLast=-1;
  const liaison=n=>{let c=(rh()*5)|0;if(c===cLast)c=(c+1+((rh()*4)|0))%5;cLast=c;PLAN.push(CAR[c]);let dS=1;
    for(let k=0;k<n;k++){const r9=rel();
      if(c===0){sg=Math.abs(r9)>30?(r9>0?-1:1):-sg;tourne(sg*(36+rh()*28),rh()<.33?Rs():Rn());if(rh()<.2)droite((30+rh()*40)*KV);}
      else if(c===1){sg=Math.abs(r9)>25?(r9>0?-1:1):-sg;tourne(sg*(26+rh()*18),rM*(2.2+rh()*.8));droite((20+rh()*40)*KV);}
      else if(c===2){for(let j=0;j<2;j++){const r8=rel();sg=Math.abs(r8)>35?(r8>0?-1:1):-sg;tourne(sg*(46+rh()*18),rM*(1.3+rh()*.3));}}
      else if(c===3){if(!k){dS=(r9>0?1:-1)*(rh()<.7?1:-1);vers(dS*(48+rh()*14),rM*2.1);}sg=-sg;tourne(sg*(14+rh()*10),rM*(2+rh()*.6));droite((30+rh()*40)*KV);}
      else{droite((70+rh()*70)*KV);sg=Math.abs(r9)>20?(r9>0?-1:1):(rh()<.5?-1:1);tourne(sg*(28+rh()*22),Rn());}}};
  const coude=()=>{if(rh()<.55){const d=(rh()<.5?-1:1)*(8+rh()*10)/57.2958;AX=AX0+Math.max(-18/57.2958,Math.min(18/57.2958,wrap(AX+d-AX0)));}};
  // LES MODULES : les quatre d'avant (vlcTrace) et quatre du royaume de feu ; leur hasard : rv
  const MM=[],vmPaq=[];let vmLast=-1;const geyS=[],lacsS=[],ponts=[];
  const vAxe=()=>{if(Math.abs(rel())>20)vers((rel()>0?1:-1)*12,rM*(1.7+rv()*.3));};
  const vSlalom=()=>{vAxe();const n=4+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=rel()>0?-1:1;tourne(s9*a*.5,R);
    for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const vCorde=()=>{const T=90+rv()*25,s9=rel()>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((30+rv()*30)*KV);
    tourne(s9*a1,R);droite((30+rv()*40)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((30+rv()*30)*KV);};
  const vChicane=()=>{vAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=rel()>0?-1:1;droite(40*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(40*KV);};
  const vHoule=()=>{vAxe();const n=2,lam=(280+rv()*60)*KV,amp=.07+rv()*.03,L9=n*lam,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(s9){const u=(s9-s0)/L9;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);}};
    let s9=rel()>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;};
  const vPont=()=>{vAxe();vers(0,rM*(1.8+rv()*.3));droite(30*KV);const l9=(220+rv()*100)*KV,amp=.04+rv()*.02,s0=s; // la droite bombée : on monte, on redescend (même hauteur aux deux bouts)
    gM={s0:s0,s1:s0+l9,f:function(s9){return -amp*Math.cos((s9-s0)/l9*Math.PI);}};droite(l9);gM=null;ponts.push([s0,s]);lacsS.push([s0+l9*.15,s-l9*.15,40]);droite(30*KV);};
  const vCoulee=()=>{vAxe();const l9=(300+rv()*100)*KV,amp=.06+rv()*.015,s0=s,n=2+((rv()*2)|0);
    gM={s0:s0,s1:s0+l9,f:function(s9){const u=(s9-s0)/l9;return amp*Math.min(1,u*5,(1-u)*5);}};
    let s9=rel()>0?-1:1;for(let k=0;k<n;k++){const a=24+rv()*12;tourne(s9*a,Math.max(rM*2,l9/n/(a/57.2958)*.7));s9=-s9;}const res=s0+l9-s;if(res>10)droite(res);gM=null;};
  const vGeysers=()=>{vAxe();const s0=s,a=48+rv()*16,R=rM*(1.7+rv()*.3),s9=rel()>0?-1:1;droite(30*KV);tourne(s9*a,R);droite((30+rv()*20)*KV);tourne(-s9*a,R);droite(40*KV);geyS.push([s0,s]);};
  const vCrochet=()=>{const s9=rel()>0?-1:1;vers(-s9*(44+rv()*10),rM*(1.8+rv()*.3));droite((40+rv()*30)*KV);tourne(s9*(112+rv()*20),rM*(1.45+rv()*.25));droite((50+rv()*30)*KV);};
  const vmJ=[vSlalom,vCorde,vChicane,vHoule,vPont,vCoulee,vGeysers,vCrochet],vmN=['slalom','corde','chicane','houle','pont','coulee','geysers','crochet'];
  const vMod=()=>{let m=0;for(let e=0;e<6;e++){if(!vmPaq.length){const t=[0,1,2,3,4,5,6,7];for(let i=7;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)vmPaq.push(x);}m=vmPaq.shift();if(m!==vmLast)break;}
    vmLast=m;const i0=ctrl.length-1;vmJ[m]();MM.push({i0:i0,i1:ctrl.length-1});return vmN[m];};
  // LES PIÈCES
  const tours=[],fumeron=()=>{droite((70+rh()*50)*KV);const r9=rel();sg=Math.abs(r9)>12?(r9>0?-1:1):(rh()<.5?-1:1);const s0=s,a=tourne(sg*(55+rh()*30),Rs());tours.push({s0:s0,s1:s,a:Math.round(a)});};
  const arches=[],lacs=[];
  const pArche=()=>{vAxe();droite(50*KV);droite(80*KV);arches.push({p:P.clone(),phi:phi,s:s});droite(80*KV);};
  const pLac=n=>{mode=2;const sL0=s;droite(60*KV);for(let k=0;k<n;k++){const r9=rel();sg=Math.abs(r9)>20?(r9>0?-1:1):-sg;tourne(sg*(30+rh()*20),Rl());if(rh()<.4)droite((30+rh()*40)*KV);}
    lacs.push([sL0,s]);mode=0;};
  // LA RECETTE
  const LC9=typeof longueurCible==='function'?longueurCible():0,u9=rh(),recette=u9<.45?'montee':u9<.75?'descente':'corniche';
  const R0=Math.max(450,rM*3.8)+rh()*30,R1=Math.max(250,rM*2.4)+rh()*20,TH=Math.min((1.3+rh()*.15)*Math.PI*2,(R0-R1)/135*Math.PI*2),pM=.055+rh()*.01,phW=rh()*6.2832,
    AW=r=>Math.max(0,Math.min(25,(1/(1.5*rM)-1/r)*(r/6)*(r/6))),Lsp9=TH*(R0+R1)/2;
  const spirale=(desc,C,b0)=>{ // la spirale : montée (R0 → R1) ou descente (R1 → R0)
    const t0x=Math.sin(phi),t0z=Math.cos(phi),sgB=(Math.cos(b0)*t0x-Math.sin(b0)*t0z)>0?1:-1,Lh=TH*(R0+R1)/2,nP=Math.max(60,Math.ceil(Lh/12)),ra=desc?R1:R0,rb=desc?R0:R1;
    for(let k=1;k<=nP;k++){const t=k/nP,b=b0+sgB*TH*t,rL=ra+(rb-ra)*t,r=rL+AW(rL)*Math.sin(6*(b-b0)+phW)*Math.min(1,t*8,(1-t)*8);
      const nx=C.x+Math.sin(b)*r,nz=C.z+Math.cos(b)*r;phi=Math.atan2(nx-P.x,nz-P.z);avance(nx,nz);}
    return {bF:b0+sgB*TH,sgB:sgB};};
  let C=null,K=null,th0=0,th1=0,sSp=0,yH0=0,yH1=0,cor=null;
  push();ici('depart');
  if(recette==='descente'){ // LE DÉPART SUR LA LÈVRE : la spirale descend autour du cône, puis la balade file droit devant, loin de lui
    droite((150+rh()*40)*KV);const hv=rh()<.5?-1:1;C=new THREE.Vector3(P.x+hv*R1*Math.cos(phi),0,P.z-hv*R1*Math.sin(phi));
    const b0=Math.atan2(P.x-C.x,P.z-C.z);yH1=y;ici('vlc0');gF=pM;gR=s;const r=spirale(true,C,b0);gF=null;gR=null;yH0=y;sSp=s;ici('vlc1');
    th0=Math.min(b0,r.bF);th1=Math.max(b0,r.bF);AX0=AX=r.bF;vers(r.sgB*38,rM*2.2);droite(80*KV);}
  else droite((140+rh()*120)*KV);
  // LE PLAN DE LA BALADE : les pièces mélangées (jamais deux lacs de suite), chacune derrière sa liaison
  const PCS=['arche','lac'];if(rh()<.33)PCS.push('arche');if(rh()<.25)PCS.push('lac2');{const nf=1+((rh()*3)|0),nm=2+((rh()*3)|0);for(let k=0;k<nf;k++)PCS.push('fum');for(let k=0;k<nm;k++)PCS.push('mod');}
  for(let i=PCS.length-1;i>0;i--){const j=(rh()*(i+1))|0,x=PCS[i];PCS[i]=PCS[j];PCS[j]=x;}
  for(let i=1;i<PCS.length;i++)if(PCS[i][0]==='l'&&PCS[i-1][0]==='l'){const j=(i+1)%PCS.length;const x=PCS[i];PCS[i]=PCS[j];PCS[j]=x;}
  if(recette==='corniche')PCS.splice(1+((rh()*Math.max(1,PCS.length-2))|0),0,'corniche');
  const Lcor=recette==='corniche'?(Math.max(560,rM*3.2)+60)*1.75:0,B9=LC9?Math.max(1200,LC9-(recette==='montee'?Lsp9:0)-300):4300*KV+(recette==='descente'?Lsp9:0),
    EST={arche:260*KV,lac:750*KV,lac2:520*KV,fum:220*KV,mod:430*KV,mod1:430*KV,corniche:Lcor+260*KV},OBL={arche:1,lac:1,corniche:1};
  {let n9=0;for(let i=0;i<PCS.length&&n9<2;i++)if(PCS[i]==='mod'){PCS[i]='mod1';n9++;}} // (deux modules au moins, comme avant : ils passent avant les fumerons)
  if(B9-s-(recette==='corniche'?EST.corniche:0)>1600*KV)OBL.mod1=1; // (deux modules sûrs si la longueur les tient ; aux hauts paliers la longueur passe d'abord, comme avant)
  const reste=i=>{let r=0;for(let j=i+1;j<PCS.length;j++)if(OBL[PCS[j]]&&!(PCS[j]==='arche'&&arches.length))r+=EST[PCS[j]]+90*KV;return r;};
  const PL=[];
  for(let i=0;i<PCS.length;i++){const pc=PCS[i];if(!OBL[pc]&&s+EST[pc]+reste(i)>B9)continue;if(pc==='arche'&&arches.length&&s+EST.arche+reste(i)>B9)continue;
    liaison(LC9?1:1+((rh()*2)|0));coude();
    if(pc==='arche')pArche();else if(pc==='lac'){const n9=3+((rh()*2)|0);pLac(s+EST.lac+reste(i)>B9?2:n9);}else if(pc==='lac2')pLac(2);else if(pc==='fum'){fumeron();if(rh()<.4)fumeron();}else if(pc==='mod'||pc==='mod1'){PL.push('mod:'+vMod());continue;}
    else if(pc==='corniche'){ // LA CORNICHE : on se place de biais, puis la route longe le flanc du grand volcan (la v4), en montant ou en descendant
      const hv=rh()<.5?-1:1,Rv=Math.max(560,rM*3.2)+rh()*120,aV=90+rh()*20,gV=(rh()<.5?-1:1)*(.035+rh()*.02);
      droite(60*KV);vers(-hv*aV/2,Math.max(rM*1.9,210));droite(60*KV);const pV=P.clone(),phV=phi;yH0=y;ici('vlc0');gF=gV;arc(hv*aV,Rv);gF=null;ici('vlc1');sSp=s;yH1=y;
      C=new THREE.Vector3(pV.x+hv*Rv*Math.cos(phV),0,pV.z-hv*Rv*Math.sin(phV));cor={Rv:Rv,yV:(yH0+yH1)/2};
      const a0=Math.atan2(pV.x-C.x,pV.z-C.z),a1=a0+wrap(Math.atan2(P.x-C.x,P.z-C.z)-a0);th0=Math.min(a0,a1);th1=Math.max(a0,a1);}
    PL.push(pc);}
  {let n9=0;while(s<B9-200*KV&&n9++<12){liaison(1);if(n9%2)coude();}}
  if(recette==='montee'){ // LA MONTÉE DU VOLCAN (celle de vlcTrace3) : en travers de l'axe, le cône DEVANT la plaine, la spirale qui grimpe, le portail là-haut
    liaison(1);const hv=wrap(phi-AX0)>=0?1:-1;AX=AX0;vers(hv*90,Math.max(rM*2,220));droite(60*KV);
    const cA=new THREE.Vector3(P.x+R0*Math.cos(phi),0,P.z-R0*Math.sin(phi)),cB=new THREE.Vector3(P.x-R0*Math.cos(phi),0,P.z+R0*Math.sin(phi));C=cA.z>cB.z?cA:cB;
    const b0=Math.atan2(P.x-C.x,P.z-C.z);yH0=y;ici('vlc0');gF=-pM;const r=spirale(false,C,b0);gF=null;mode=3;yH1=y;sSp=s;ici('vlc1');
    th0=Math.min(b0,r.bF);th1=Math.max(b0,r.bF);droite(60*KV);ici('fin');droite(50*KV);}
  else{mode=3;liaison(1);droite(100*KV);ici('fin');droite(120*KV);} // l'arrivée dans la plaine
  // LE CONTRÔLE DES CROISEMENTS (le même) : un passage à moins de 70 m d'un autre tronçon ; avec moins de 32 m d'air = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  // LES LACS (la règle d'avant, un cercle par traversée ; ceux des ponts : marge 40 m au lieu de 180)
  const cercle=(a,b,m)=>{let sx=0,sz=0,n=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=a&&DN[i+3]<=b){sx+=DN[i];sz+=DN[i+2];n++;}if(!n)return null;
    const cx=sx/n,cz=sz/n;let r=0;for(let i=0;i<DN.length;i+=4)if(DN[i+3]>=a&&DN[i+3]<=b)r=Math.max(r,Math.hypot(DN[i]-cx,DN[i+2]-cz));return {x:cx,z:cz,r:r+m};};
  const LACS=[];for(const l of lacs){const c=cercle(l[0],l[1],180);if(c)LACS.push(c);}for(const l of lacsS){const c=cercle(l[0],l[1],l[2]);if(c){c.pont=1;LACS.push(c);}}
  let yMin=1e9;for(const p of ctrl)yMin=Math.min(yMin,p.y);const ySea=yMin-48;
  if(recette==='corniche'){const yB=ySea-380,ex=1.3,yP=cor.yV+500+rh()*80,f=Math.pow((cor.yV-yB)/(yP-yB),1/ex);K={yP:yP,yB:yB,rc:150,cr:70,ex:ex,Rb:150+(cor.Rv-160-150)/Math.max(.05,1-f)};} // (le cône de la v4 : son flanc passe à hauteur de la corniche 160 m avant elle)
  else{const lo=Math.min(yH0,yH1),hi=Math.max(yH0,yH1),rc9=Math.max(110,R1*.42);K=vlc3Cone(R0,lo-24,R1,hi-24,hi-24+1.6*(hi-lo)/Math.max(60,R0-R1)*(R1-rc9)+40,rc9,70,ySea);}
  // L'AXE : la route dessinée face à +z TOURNE EN BLOC autour du départ
  const AXE=rh()*6.2832-3.1416,c9=Math.cos(AXE),s9=Math.sin(AXE),ro=v=>{const x=v.x*c9+v.z*s9;v.z=v.z*c9-v.x*s9;v.x=x;};
  for(const p of ctrl)ro(p);ro(C);for(const k in Q){ro(Q[k].p);Q[k].phi+=AXE;}for(const a of arches){ro(a.p);a.phi+=AXE;}for(const l of LACS)ro(l);
  th0+=AXE;th1+=AXE;
  Q.tours=tours;Q.arches=arches;if(arches.length)Q.arche=arches[0];Q.lacs=LACS;Q.geyS=geyS;Q.ponts=ponts;
  const lac=LACS.find(function(l){return !l.pont;})||null;
  return {ctrl:ctrl,K:K,C:C,K2:null,C2:null,Q:Q,plg:[],sauts:[],sSp:sSp,ySea:ySea,conflits:conflits,croise:croise,th0:th0,th1:th1,lac:lac,mods:MM,
    hz:{recette:recette,axe:Math.round(AXE*57.2958),plan:PL,liaisons:PLAN,arches:arches.length,lacs:LACS.length,fumerons:tours.length,LC:Math.round(LC9),B9:Math.round(B9),L:Math.round(s)}};
}
/* ---------------- LE RELIEF : LA MER DE LAVE, LES CÔNES, LE COULOIR DE LA ROUTE ----------------
   Une grille (26 m) : la distance à la route (d), la hauteur de la route la plus proche (yn) et la PLUS BASSE à moins de 120 m (ym : là où la
   route repasse sous elle-même, c'est la dalle du dessous qui compte) ; puis la MER DE LAVE (`ySea`, plate) semée d'îles et de MESAS de
   basalte, les deux CÔNES qui en sortent (ravines, lèvre, cuvette du cratère) ; enfin le COULOIR : à 10 m du bord de la dalle la plus basse,
   le sol reste 16 m dessous. Au-delà de la grille, la mer continue jusqu'à l'horizon (`vlcMerLoin`). */
function vlcHash(i,j,s){let h=Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vlcNoise(x,z,s){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=vlcHash(i,j,s),b=vlcHash(i+1,j,s),c=vlcHash(i,j+1,s),d=vlcHash(i+1,j+1,s);
  return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*2-1;}
/* LE BRUIT DU RELIEF : un bruit de valeur fractal à octaves tournées (le bruit de la forêt, des produits de sinus, dessinait des lacs en RAYURES) */
function vlcB(x,z,s,o){let a=0,w=1,t=0;for(let k=0;k<(o||3);k++){const c=Math.cos(k*1.13),sn=Math.sin(k*1.13);a+=w*vlcNoise(x*c-z*sn+k*17.3,x*sn+z*c-k*9.1,s+k*31);t+=w;w*=.5;x*=2.03;z*=2.03;}
  return Math.max(-1,Math.min(1,a/t*1.8));}
function volcanSol(){
  const C=PAL_B9('volcanSolC',26),MARG=PAL_B9('volcanMarge',2300),R1=340,RY=ROAD_HALF+92,K=VOLCAN.K,VC=VOLCAN.C,K2=VOLCAN.K2,VC2=VOLCAN.C2,yS=VOLCAN.ySea;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  for(const c of [[VC,K],[VC2,K2]])if(c[0]){x0=Math.min(x0,c[0].x-900);x1=Math.max(x1,c[0].x+900);z0=Math.min(z0,c[0].z-900);z1=Math.max(z1,c[0].z+900);}
  x0-=MARG;x1+=MARG;z0-=MARG;z1+=MARG;
  const nx=Math.ceil((x1-x0)/C)+1,nz=Math.ceil((z1-z0)/C)+1,N=nx*nz,D=new Float32Array(N).fill(1e9),YN=new Float32Array(N),YM=new Float32Array(N).fill(1e9);
  const RS=[],pas=Math.max(1,Math.round(12/(L/(NP-1))));for(let i=0;i<NP;i+=pas)RS.push(i);
  const CG=C*4,gx=Math.ceil((x1-x0)/CG)+1,gz=Math.ceil((z1-z0)/CG)+1,GD=new Float32Array(gx*gz);
  for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){const x=x0+i*CG,z=z0+j*CG;let bd=1e18;for(let k=0;k<RS.length;k+=6){const p=pts[RS[k]],d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd)bd=d;}GD[i+j*gx]=Math.sqrt(bd);} // (la distance lointaine ne sert qu'au tri des morceaux : un point de route sur 6 suffit)
  const gBil=(A,x,z)=>{const fx=Math.max(0,Math.min(gx-1.001,(x-x0)/CG)),fz=Math.max(0,Math.min(gz-1.001,(z-z0)/CG)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*gx;
    return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+gx]*(1-u)+A[k+gx+1]*u)*v;};
  const rC=Math.ceil(R1/C);
  for(const ri of RS){const p=pts[ri],ci=Math.round((p.x-x0)/C),cj=Math.round((p.z-z0)/C);
    for(let b=-rC;b<=rC;b++){const j=cj+b;if(j<0||j>=nz)continue;const z=z0+j*C,dz=z-p.z;
      for(let a=-rC;a<=rC;a++){const i=ci+a;if(i<0||i>=nx)continue;const x=x0+i*C,dx=x-p.x,d2=dx*dx+dz*dz;if(d2>R1*R1)continue;const k=i+j*nx;
        if(d2<D[k]){D[k]=d2;YN[k]=p.y;}if(d2<RY*RY&&p.y<YM[k])YM[k]=p.y;}}}
  /* LES CASES, EN TRANCHES (14/10 au soir, règle de PILOTAGE : « construction en tranches < 60 ms ») : ~200 ms de calcul case par case. `S.rangee(j0,j1)`
     calcule des rangées (ou un rectangle de cases) ; buildVolcan fait tout de suite les morceaux du départ, les autres partent dans la file (`vlcTache`) du plus proche au plus loin.
     Une rangée pas encore calculée vaut la MER (H sous ySea, YL = ySea) : jamais de mort sur un sol qui n'existe pas encore. */
  const LACS9=VOLCAN.Q&&VOLCAN.Q.lacs||(VOLCAN.lac?[VOLCAN.lac]:[]),DZ9=VOLCAN.dz,IL9=DZ9&&DZ9.ile;
  const H=new Float32Array(N).fill(yS-12),YL=new Float32Array(N).fill(yS),HT=new Float32Array(N),CF=new Float32Array(N),FAIT=new Uint8Array(N),sd9=VOLCAN.graine|0,ss=THREE.MathUtils.smoothstep;
  const cone=(K9,c9,x,z)=>{const dx=x-c9.x,dz=z-c9.z,r=Math.hypot(dx,dz);if(r>=K9.Rb)return -1e9;let hc=vlcConeY(K9,r);
    if(r>K9.rc){const an=Math.atan2(dx,dz);hc-=22*Math.pow(Math.abs(Math.sin(an*9+vlcB(x/70,z/70,sd9+5,2)*1.6)),.6)*Math.sin(Math.min(1,(r-K9.rc)/300)*Math.PI*.5)*(1-.6*r/K9.Rb); // les RAVINES
      hc+=Math.max(0,1-(r-K9.rc)/26)*9;}                                                                                            // la lèvre du cratère
    return hc+6*vlcB(x/45,z/45,sd9+13,2);};
  const rangee=(ja,jb,ia,ib)=>{ia=ia||0;ib=ib==null?nx:ib;for(let j=ja;j<jb;j++)for(let i=ia;i<ib;i++){const k=i+j*nx;if(FAIT[k])continue;FAIT[k]=1;const x=x0+i*C,z=z0+j*C;let d;
    if(D[k]<1e8)d=Math.sqrt(D[k]);else{d=Math.max(R1,gBil(GD,x,z));YN[k]=yS+80;}
    D[k]=d;const ym=Math.min(YN[k],YM[k]);
    const n1=vlcB(x/380,z/380,sd9,3),n4=vlcB(x/1500,z/1500,sd9+11,2);
    let h=yS-10+24*n1-26*ss(n4,.1,.6)+30*vlcB(x/700,z/700,sd9+7,3)*ss(d,300,900)+5*vlcB(x/70,z/70,sd9+1,2); // la MER, ses îles
    h+=(DZ9?78*DZ9.mesa.k*ss(vlcB(x/900,z/900,sd9+17,3),.30+DZ9.mesa.sh,.52+DZ9.mesa.sh):78*ss(vlcB(x/900,z/900,sd9+17,3),.30,.52))*ss(d,150,320);                                                          // les MESAS
    if(ym<1e8&&ym>yS+90){const k9=Math.max(.45,(ym-yS-35)/(R1-40));h=Math.max(h,ym-55-k9*Math.max(0,d-40)+18*vlcB(x/160,z/160,sd9+29,2)+10*vlcB(x/55,z/55,sd9+31,2));} // (v4) L'ARÊTE : la route haute descend sur une échine de basalte qui plonge jusqu'à la lave avant 340 m (jamais de route qui flotte à 400 m)
    for(const lc of LACS9){const dl=Math.hypot(x-lc.x,z-lc.z)/lc.r+.12*vlcB(x/320,z/320,sd9+23,2);if(dl<1.2)h=yS-14+(h-yS+14)*ss(dl,.8,1.2);} // (2026-10-20, LE VOLCAN AU HASARD) un lac ou deux, et les bras de lave sous les PONTS (Q.lacs) // (v3) LE LAC : ni île ni mesa, la lave ouverte jusqu'à la rive
    {const c1=cone(K,VC,x,z),c2=VC2?cone(K2,VC2,x,z):-1e9,cc=Math.max(c1,c2); // (v5) CF : la part du CÔNE et la hauteur sur lui (0 la mer → 1 le sommet), lue par la roche en facettes
     if(VLC5&&cc>h-6){const K9=c1>=c2?K:K2;CF[k]=Math.max(.02,Math.min(1,(cc-yS)/Math.max(1,K9.yP-yS)));}h=Math.max(h,cc);}
    if(IL9){const r=Math.hypot(x-IL9.x,z-IL9.z);if(r<IL9.R*2.4)h=Math.max(h,IL9.y-Math.max(0,r-IL9.R)*1.6+2.5*vlcB(x/30,z/30,sd9+43,2));} // (LE DÉCOR AU HASARD) l'île plate du monument
    h=Math.min(h,ym-16+Math.max(0,d-ROAD_HALF-10)*1.2);                                                                       // jamais sous la dalle (la plus basse)
    H[k]=h;let yl=yS;
    for(const c of [[VC,K],[VC2,K2]])if(c[0]){const r=Math.hypot(x-c[0].x,z-c[0].z);if(r<c[1].rc)yl=Math.max(yl,c[1].yP-c[1].cr*.55);} // le LAC DU CRATÈRE
    YL[k]=yl;HT[k]=Math.max(0,Math.min(1,(yl+16-h)/16));}};
  return VOLCAN.sol={x0:x0,z0:z0,C:C,nx:nx,nz:nz,h:H,d:D,yn:YN,yl:YL,ht:HT,cf:CF,riv:new Uint8Array(N),MARG:MARG,fait:FAIT,rangee:rangee,gd:function(x,z){return gBil(GD,x,z);}};
}
function vlcBil(A,x,z){const S=VOLCAN.sol;if(!S)return 0;const fx=Math.max(0,Math.min(S.nx-1.001,(x-S.x0)/S.C)),fz=Math.max(0,Math.min(S.nz-1.001,(z-S.z0)/S.C)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,n=S.nx;
  return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+n]*(1-u)+A[k+n+1]*u)*v;}
function vlcH(x,z){return vlcBil(VOLCAN.sol.h,x,z);}
function vlcL(x,z){return vlcBil(VOLCAN.sol.yl,x,z);}
/* LES COULÉES : elles descendent la plus grande pente (pas de 10 m, un peu d'inertie, un méandre), creusent leur lit, chauffent la roche
   autour, et s'arrêtent dans un lac (ou dans un creux). Elles passent SOUS la route (le couloir) et tombent en cascade sur les à-pics. */
function vlcCoulee(x,z,maxL,fr){
  const S=VOLCAN.sol,P=[];let px=x,pz=z,dx0=0,dz0=0,bloque=0;const xM=S.x0+(S.nx-1)*S.C,zM=S.z0+(S.nz-1)*S.C;
  for(let k=0;k<maxL/10;k++){const h=vlcH(px,pz),yl=vlcL(px,pz);P.push([px,h,pz]);if(h<yl-1.5)break;
    const e=9,gx=(vlcH(px+e,pz)-vlcH(px-e,pz))/(2*e),gz=(vlcH(px,pz+e)-vlcH(px,pz-e))/(2*e),gl=Math.hypot(gx,gz);
    let mx,mz;if(gl<.012){if(++bloque>5||k===0)break;mx=dx0;mz=dz0;}else{mx=-gx/gl;mz=-gz/gl;bloque=0;}
    let nx=k?mx*.4+dx0*.6:mx,nz=k?mz*.4+dz0*.6:mz;const a=(fr()-.5)*.55,c=Math.cos(a),s9=Math.sin(a),t9=nx*c-nz*s9;nz=nx*s9+nz*c;nx=t9;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
    dx0=nx;dz0=nz;px+=nx*10;pz+=nz*10;if(px<S.x0||pz<S.z0||px>xM||pz>zM)break;}
  if(P.length<6)return null;
  // le LIT : la grille se creuse un peu sous la coulée, la roche chauffe autour (la lueur des rives)
  for(let k=0;k<P.length;k++){const p=P[k],w=5+Math.min(9,k*.09),ci=Math.round((p[0]-S.x0)/S.C),cj=Math.round((p[2]-S.z0)/S.C),rc=Math.ceil((w+22)/S.C);
    for(let b=-rc;b<=rc;b++)for(let a=-rc;a<=rc;a++){const i=ci+a,j=cj+b;if(i<0||j<0||i>=S.nx||j>=S.nz)continue;const q=i+j*S.nx,dd=Math.hypot(S.x0+i*S.C-p[0],S.z0+j*S.C-p[2]);
      if(dd<w+4){S.riv[q]=1;if(S.d[q]>ROAD_HALF+12)S.h[q]=Math.min(S.h[q],p[1]-1.5);}
      S.ht[q]=Math.max(S.ht[q],1-Math.max(0,dd-w)/24);}}
  for(const p of P)p[1]=vlcH(p[0],p[2]);
  return P;}
/* ---------------- LES MATIÈRES (ShaderMaterial : aucune lumière de three, rien qui dépende de la scène) ---------------- */
const VLC_LUM=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillC,uFillD,uCam,uCarP,uCarF,uBruC,uCrat,uLavT;uniform float uLavK;',
  'vec3 vTeinte(vec3 c){return mix(c,dot(c,vec3(.55,.35,.10))*uLavT*1.45,uLavK);}', // (LE DÉCOR AU HASARD) la braise reteinte : sa luminance × la teinte tirée
  'uniform float uTime,uPhare,uFlash,uLue,uLav,uErupt,uErupt2,uBruK,uBruY;',
  // les PHARES de la caisse sur la roche (la recette de la forêt)
  'vec3 vPhare(vec3 w,vec3 n){vec3 d=w-uCarP;float l=length(d);d/=max(l,.001);float c=smoothstep(.62,.93,dot(d,uCarF));',
  '  return vec3(1.,.93,.80)*uPhare*c*(2600./(l*l*.10+320.))*(.30+.70*max(dot(n,-d),0.));}',
  // la BRUME BASSE : elle stagne sur les lacs, sous la route, et s'épaissit au loin
  'float vBrume(vec3 w,float dist){return uBruK*smoothstep(uBruY-8.,uBruY-110.,w.y)*(1.-exp(-dist*.0032));}',
  // l'ÉRUPTION : le cratère qui s'embrase éclaire les flancs
  'vec3 vErupt(vec3 w,vec3 n){vec3 d=uCrat-w;float l=length(d);return vec3(1.,.40,.10)*(uErupt+uErupt2)*(120000./(l*l+80000.))*(.3+.7*max(dot(n,d/max(l,.001)),0.));}'].join('\n');
const VLC_SOL_VS=['attribute vec4 aS;varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normal;vS=aS;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
/* LA ROCHE : aS = (distance à la route, chaleur, hauteur au-dessus de la lave, genre : 0 relief · 2 volcan du loin) */
const VLC_SOL_FS=[FG_BRUIT,VLC_LUM,'varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec2 q=vW.xz;',
  /* (2026-10-17, continuité — Sacha : « la map volcan est la plus moche ») LE GRAIN QUI FOURMILLAIT : n3 (des cases de 2,3 m, sans filtrage) et les
     fissures fines (3,4 m) crépitaient en sel et poivre sur tout le cône dès 300 m — ils FONDENT avec la distance (plus rien au-delà de ~320 m) ;
     le BASALTE presque noir (,048) ne se lisait plus la nuit : une ARDOISE froide un cran plus claire (l'ombre bleu-violet commune des maps),
     la braise reste l'accent chaud. */
  '  float n1=fn2(q*.021),n2=fn2(q*.09),n3=fn2(q*.43),ht=clamp(vS.y,0.,1.),ab=vS.z,loin=smoothstep(260.,800.,dist);',
  ('  n3=mix(n3,.5,smoothstep(90.,320.,dist));vec3 alb=mix(vec3(.060,.054,.070),vec3(.15,.13,.14),n2*(.7+.3*n3));'), // le BASALTE (ardoise)
  '  float plat=smoothstep(.70,.94,N.y);',
  '  alb=mix(alb,mix(vec3(.15,.135,.125),vec3(.25,.22,.20),n1),plat*smoothstep(.30,.68,n1+.12*n3));',         // la CENDRE se pose sur le plat
  '  alb=mix(alb,vec3(.22,.075,.04)*(.7+.6*n3),smoothstep(.56,.8,n2)*(1.-plat)*'+('.32')+');',                        // l'OXYDE des pentes (continuité : plus de motif LÉOPARD sur le cône)
  '  alb=mix(alb,vec3(.52,.45,.10)*(.8+.4*n3),smoothstep(.55,.9,ht)*smoothstep(.55,.72,fn2(q*.05+7.))*.85);', // le SOUFRE des bouches chaudes
  '  alb=mix(alb,vec3(.018,.014,.014),smoothstep(9.,1.,ab));',                                                 // la croûte vitreuse de la rive
  '  float dif=clamp((dot(N,uSunDir)+.12)/1.12,0.,1.);',
  '  vec3 col=alb*(uSky*(.40+.42*N.y)+uGnd*(.28-.20*N.y)+uSunC*dif*.95+uFillC*max(dot(N,-uFillD),0.)*.35);',
  '  float bas=smoothstep(50.,0.,ab)*(.5+.5*(1.-N.y));',
  '  col+=alb*vTeinte(vec3(1.,.30,.07))*uLue*(bas*2.4+ht*1.2);',                                                        // la LAVE éclaire la roche par en dessous
  '  col+=alb*(vPhare(vW,N)+vErupt(vW,N)*3.+uFlash*vec3(.8,.82,1.)*1.3);',
  '  col+=uSky*alb*1.6*pow(1.-max(dot(N,V),0.),3.);',                                                        // le liseré froid du ciel (deux températures)
  '  col=mix(col,uBruC,vBrume(vW,dist));',
  '  float fi=abs(fn2(q*.11+vec2(3.1,7.7))-.5)+abs(fn2(q*.29)-.5)*.5'+('*(1.-loin)')+',fis=smoothstep(.05,0.,fi)*clamp(ht*1.3+smoothstep(26.,0.,ab)*.7,0.,1.);', // les FISSURES qui couvent (continuité : le détail fin fond au loin)
  '  vec3 feu=mix(vec3(.85,.09,.01),vec3(1.,.55,.08),fn2(q*.7+uTime*.2));',
  '  vec3 em=feu*uLue*(mix(fis*(1.3+.6*sin(uTime*1.7+n2*12.)),ht*.13,loin)+.06*smoothstep(4.,0.,ab));',
  '  if(vS.w>1.5)em+=vec3(1.,.28,.04)*uLue*smoothstep(.55,1.,ht)*1.4;',  // les coulées des volcans du loin
  '  em=vTeinte(em);','  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.65);','  #else','  col+=em;','  #endif', // la braise PERCE le brouillard
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* (v5) LA ROCHE EN FACETTES : le basalte n'est plus un bruit multiplié (du grain partout, illisible de nuit) mais un relief LOW-POLY — la
   normale de la FACETTE (dFdx/dFdy : chaque triangle de la grille porte sa propre lumière, une valeur un rien différente de sa voisine),
   adoucie au loin pour que les petites facettes ne scintillent pas. Trois matières, en aplats : le BASALTE indigo (l'ombre bleu nuit commune
   des maps), la CENDRE mauve sur les plats, l'OXYDE rouille qui monte sur les cônes (aS.w = la part du cône et la hauteur sur lui) jusqu'à
   une lèvre de soufre ; la rive en verre noir. Deux températures : la braise par en dessous, le ciel froid en liseré. Les FISSURES qui couvent
   sont de vraies cellules (les bords de plaques de la lave, en plus fin), seulement sur la roche chaude et seulement de près. */
const VLC_VOR=['vec3 vlcVor(vec2 x){vec2 n=floor(x),f=fract(x);float f1=9.,f2=9.,id=0.;',
  '  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j)),c=n+g,o=vec2(fh2(c),fh2(c+17.31));o=.5+.42*(o-.5);vec2 r=g+o-f;float d=dot(r,r);',
  '    if(d<f1){f2=f1;f1=d;id=fh2(c+41.7);}else if(d<f2)f2=d;}',
  '  return vec3(sqrt(f1),sqrt(f2),id);}'].join('\n');
const VLC_SOL_FS5=[FG_BRUIT,VLC_LUM,VLC_VOR,'varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_fragment>',
  'void main(){vec3 Ns=normalize(vN),Nf=normalize(cross(dFdx(vW),dFdy(vW)));if(dot(Nf,Ns)<0.)Nf=-Nf;',
  '  vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec2 q=vW.xz;float loin=smoothstep(280.,1000.,dist);',
  '  vec3 N=normalize(mix(Nf,Ns,.22+.6*loin));',                                                               // la facette de près, la pente lisse au loin
  '  float ht=clamp(vS.y,0.,1.),ab=vS.z,cn=vS.w>1.5?.55:clamp(vS.w,0.,1.);',
  '  float n1=fn2(q*.0042),n2=fn2(q*.016),fv=fh3(floor(Nf*6.)+floor(vW*.019));',                               // fv : la valeur propre de chaque facette
  '  vec3 alb=vec3(.100,.080,.135)*(.80+.40*fv);',                                                            // le BASALTE indigo (une ardoise : noir sur brume sombre, il ne se lisait plus)
  '  float plat=smoothstep(.80,.96,N.y);',
  '  alb=mix(alb,vec3(.29,.225,.245)*(.88+.24*fv),plat*smoothstep(.40,.66,n1+.14*n2)*(1.-smoothstep(.15,.45,cn)));', // la CENDRE sur les plats
  '  alb=mix(alb,vec3(.15,.055,.05)*(.85+.3*fv),smoothstep(.58,.80,cn)*(1.-plat*.5));',                       // l'OXYDE : une bande sous le sommet (partout, le cône virait au ROUGE sur ciel orange)
  '  alb=mix(alb,vec3(.42,.27,.06)*(.85+.3*fv),smoothstep(.86,.97,cn)*.85);',                                 // la lèvre de SOUFRE
  '  alb=mix(alb,vec3(.020,.014,.020),smoothstep(8.,1.,ab));',                                                // la rive : verre noir
  /* (2026-10-21, embellissement) LES STRATES : les flancs des cônes et des crêtes se lisent en COUCHES (des coulées empilées, ~12 m), un liseré clair-sombre qui épouse le relief ;
     seulement sur la pente et de près (la bande se mesure en pixels : plus rien ne crépite au loin) */
  '  {float ys=vW.y*.085+n2*2.6+n1*5.,fwy=fwidth(ys),ban=smoothstep(.10,.32,cn)*(1.-plat)*(1.-smoothstep(.05,.28,fwy))*(1.-loin);alb*=1.+ban*(.30*sin(ys*6.2832)+.14*sin(ys*18.85+n2*5.));}',
  '  float dif=clamp((dot(N,uSunDir)+.10)/1.10,0.,1.);',
  '  vec3 col=alb*(uSky*(1.+.45*N.y)+uGnd*(.30-.18*N.y)+uSunC*dif*.85+uFillC*max(dot(N,-uFillD),0.)*.45);',      // (le ciel froid remplit les ombres : l'ombre est indigo, jamais un aplat noir — mesuré : le flanc du grand volcan sortait NOIR PUR au soir, l'étalonnage écrase les sombres)
  '  float bas=smoothstep(60.,0.,ab)*(.45+.55*(1.-N.y));',
  '  col+=alb*vTeinte(vec3(1.,.32,.08))*uLue*(bas*2.6+ht*1.1);',                                                       // la LAVE éclaire la roche par en dessous
  '  col+=alb*(vPhare(vW,N)+vErupt(vW,N)*3.+uFlash*vec3(.8,.82,1.)*1.3);',
  '  float fre=pow(clamp(1.-dot(N,V),0.,1.),3.);col+=uSky*alb*2.6*fre;',                                         // le liseré froid du ciel (deux températures)
  '  col=mix(col,uBruC,vBrume(vW,dist));',
  '  float pres=1.-smoothstep(220.,480.,dist),fis=0.,aq=length(fwidth(q))/23.;',                              // (la largeur d'un pixel, prise HORS du if : une dérivée dans une branche ne vaut rien)
  '  if(pres>.01){vec3 vo=vlcVor(q/23.+(vec2(fn2(q*.03),fn2(q*.03+5.))-.5)*.8);float e=vo.y-vo.x;',
  '    fis=(1.-smoothstep(0.,.06+aq*2.2,e))*clamp(ht*1.5+smoothstep(20.,0.,ab)*.8,0.,1.)*pres;}',            // les FISSURES qui couvent
  '  vec3 feu=mix(vec3(.95,.12,.012),vec3(1.,.55,.10),fn2(q*.07+uTime*.15));',
  '  vec3 em=feu*uLue*(fis*(1.25+.45*sin(uTime*1.6+n2*14.))+ht*.10*loin+.05*smoothstep(4.,0.,ab));',
  '  if(vS.w>1.5)em+=vec3(1.,.28,.04)*uLue*smoothstep(.55,1.,ht)*1.4;',                                      // les coulées des volcans du loin
  '  em=vTeinte(em);','  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.65);','  #else','  col+=em;','  #endif',
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* LA LAVE : aV = (sens de l'écoulement x, z — sa longueur est la vitesse —, profondeur sous la surface (la rive fige), genre) */
const VLC_LAVE_VS=['attribute vec4 aV;varying vec3 vW;varying vec4 vV;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vV=aV;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const VLC_LAVE_FS=[FG_BRUIT,VLC_LUM,'varying vec3 vW;varying vec4 vV;','#include <fog_pars_fragment>',
  'void main(){vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float t=uTime;vec2 fl=vV.xy,q=vV.w>1.5?vec2(vW.x+vW.z,vW.y):vW.xz,bo=vec2(t*.004,-t*.003);', // (genre 2 : une CHUTE, sa texture est dans le plan vertical)
  '  float c1=fn2(q*.040-fl*t*.05+bo),c2=fn2(q*.105-fl*t*.09+vec2(5.2,1.3)-bo),c3=fn2(q*.33-fl*t*.16+vec2(c1,c2)*.8);',
  '  float n=c1*.62+c2*.30+c3*.08,cro=smoothstep(.42,.55,n);',                                                 // les PLAQUES de croûte qui dérivent
  '  cro=max(cro,smoothstep(3.5,.3,vV.z)*.9);',                                                                 // la rive fige
  '  float vei=smoothstep(.05,0.,abs(c3-.5))*cro*(1.-smoothstep(500.,1200.,dist));',                          // les veines qui fendent la croûte
  '  float ch=(1.-cro)*(.55+.45*c3)+vei*.55;',
  '  vec3 lv=mix(vec3(.50,.04,.006),vec3(1.,.40,.035),smoothstep(.15,.65,ch));lv=mix(lv,vec3(1.,.80,.34),smoothstep(.72,1.,ch));',
  '  vec3 em=lv*ch*uLav*(.86+.14*sin(t*1.25+c1*9.+c2*4.))*(2.1+(uErupt+uErupt2)*.6);',                        // assez fort pour que la bloom s'en empare
  '  vec3 cr=vec3(.030,.018,.016)*(.7+.6*c2),R=reflect(-V,vec3(0.,1.,0.));',
  '  vec3 col=cr*(uSky*.30+uGnd*.3+uFlash*1.2+vPhare(vW,vec3(0.,1.,0.)))+uSunC*pow(max(dot(R,uSunDir),0.),40.)*.12*cro;',
  '  col=mix(col,uBruC,vBrume(vW,dist)*.25);',
  '  em=vTeinte(em);','  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.78)*(1.-smoothstep(fogFar*.9,fogFar*1.7,fogDepth));','  #else','  col+=em;','  #endif', // la lave PERCE le brouillard (et s'y fond tout au loin)
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* (v5, 2026-10-18 — Sacha : « la map volcan est la plus moche, lance une grosse refonte ») LA LAVE EN PLAQUES : l'ancienne lave était un bruit
   noir et orange à grain fin, partout pareil — une PEAU DE LÉOPARD plein écran vue d'en haut, du sel et du poivre au ras de la route. Ici, de
   GRANDES formes qu'on lit de loin : des PLAQUES de croûte (cellules de ~40 m, bords déformés par un courant lent) qui dérivent dans le sens de
   la pente, séparées par des FENTES de lave vive (jaune au cœur, orange au bord) ; une cellule sur quatre reste OUVERTE (un bassin de lave
   claire) ; chaque plaque garde un liseré tiède le long de ses bords et un reflet froid du ciel (le verre noir). La rive fige ; au loin les
   plaques fondent en une nappe unie (rien ne crépite à 800 m). Les fentes s'élargissent avec la distance à l'écran (fwidth) : aucune ligne
   d'un pixel qui scintille. Les CHUTES (genre 2) : la même matière, étirée et qui file vers le bas. */
const VLC_LAVE_FS5=[FG_BRUIT,VLC_LUM,VLC_VOR,'varying vec3 vW;varying vec4 vV;','#include <fog_pars_fragment>',
  'void main(){vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float t=uTime;bool chute=vV.w>1.5;',
  '  vec2 q=chute?vec2((vW.x+vW.z)*2.2,vW.y+t*9.):vW.xz;',
  '  vec2 fl=chute?vec2(0.):vV.xy;',
  '  vec2 p=(q-fl*t*.9-vec2(t*.45,-t*.3))/(chute?60.:40.);',                                                  // le courant : tout dérive, lentement, vers le bas
  '  p+=(vec2(fn2(q*.011+3.1),fn2(q*.011+7.7))-.5)*1.5;',                                                     // des bords organiques (jamais une grille)
  '  float loin=smoothstep(320.,1100.,dist);vec3 vo=vec3(.45,.75,.5);',
  '  if(loin<.995)vo=vlcVor(p);float e=vo.y-vo.x,aa=fwidth(e);',                                             // (au-delà de 1,1 km les plaques ont fondu : on ne cherche plus les cellules)
  '  float ouv=step(.76,vo.z);',                                                                             // une cellule sur quatre : un BASSIN ouvert
  '  float fente=1.-smoothstep(0.,.13+aa*1.6,e);',                                                           // la fente entre deux plaques
  '  float pl=(1.-ouv)*smoothstep(.09,.19+aa*1.6,e);',                                                       // la PLAQUE
  '  pl=max(pl,smoothstep(3.2,.4,vV.z)*.96);pl=mix(pl,.9,loin);',                                           // la rive fige ; au loin les plaques fondent en une croûte sombre veinée
  '  float h=fn2(q*.006+vec2(t*.008,0.))*.65+fn2(q*.021-vec2(0.,t*.015))*.35;',
  '  vec3 liq=mix(vec3(1.,.20,.03),vec3(1.,.42,.06),smoothstep(.25,.75,h));',                               // la lave vive : rouge-orange → orange (jamais de jaune acide, la bible ; le rouge pur saturait tout l'écran)
  '  liq=mix(liq,vec3(1.,.66,.20),fente*fente*(1.-ouv)*.80+ouv*(1.-smoothstep(.05,.62,vo.x))*.50);',         // ambre au cœur des fentes et des bassins
  '  float bord=smoothstep(.34,.12,e)*pl;',                                                                   // le liseré tiède le long des bords
  '  vec3 cru=mix(vec3(.085,.055,.095),vec3(.13,.075,.10),vo.z)*(.85+.3*fn2(q*.05));',                     // la croûte : verre noir violacé, une teinte par plaque
  '  vec3 R=reflect(-V,vec3(0.,1.,0.));float fr=.04+.96*pow(clamp(1.-V.y,0.,1.),5.);',
  '  vec3 col=cru*(uSky*.8+uGnd*.4+uFlash*1.2+vPhare(vW,vec3(0.,1.,0.)))+mix(uGnd,uSky,clamp(R.y*.5+.5,0.,1.))*fr*.11*pl+uSunC*pow(max(dot(R,uSunDir),0.),60.)*.18*pl;',
  '  col=mix(col,uBruC,vBrume(vW,dist)*.25);',
  '  float pul=.88+.12*sin(t*1.1+vo.z*20.+h*6.);',
  '  vec3 em=(liq*(1.-pl)*pul+vec3(1.,.26,.04)*bord*.30)*uLav*(1.9+(uErupt+uErupt2)*.6);',                    // assez fort pour que la bloom s'en empare
  '  em=mix(em,liq*uLav*1.9*(.09+.08*smoothstep(.4,.8,h)),loin*.8);',                                       // au loin : une lueur basse — l'orange vif reste aux rivières et aux lacs proches
  /* (2026-10-21, embellissement) DES RIVIÈRES DE FEU À L'HORIZON : la mer lointaine n'était qu'une bande rose plate ; de grands méandres de lave vive (deux bruits lents, des lignes d'iso-valeur)
     la sillonnent au-delà de ~500 m ; leur largeur suit la taille d'un pixel (fwidth) et elles s'éteignent quand la mer rase se tasse (aucun scintillement) */
  '  float rv=abs(fn2(q*.00125+vec2(7.1,3.3))*.7+fn2(q*.0042+vec2(1.7,9.2))*.3-.5),fwr=fwidth(rv);',
  '  float riv=chute?0.:(1.-smoothstep(0.,.022+fwr*1.5,rv))*smoothstep(450.,1500.,dist)*(1.-smoothstep(.03,.09,fwr));',
  '  em+=vec3(1.,.40,.07)*uLav*riv*1.1*(.8+.2*sin(t*.9+q.x*.004));',
  '  em=vTeinte(em);','  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.78)*(1.-smoothstep(fogFar*.9,fogFar*1.7,fogDepth));','  #else','  col+=em;','  #endif',
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* LA ROCHE TAILLÉE (aiguilles, orgues, hornitos, l'arche) : le maillage de l'atelier des arbres (aA = partie, occlusion, hasard, hauteur
   relative ; aC = albédo) ; aI = (hasard, —, pied dans la lave, —). Parties : 0 basalte · 1 OBSIDIENNE (verre noir, veines de feu) ·
   2 orgue · 3 roche chaude (fissures qui luisent). */
const VLC_ROC_VS=['attribute vec4 aA;attribute vec3 aC;attribute vec4 aI;varying vec3 vW,vN,vO,vC;varying vec4 vA,vI;','#include <fog_pars_vertex>',
  'void main(){mat4 M=modelMatrix;','#ifdef USE_INSTANCING','M=modelMatrix*instanceMatrix;','#endif',
  '  vec4 wp=M*vec4(position,1.);vW=wp.xyz;vN=normalize((M*vec4(normal,0.)).xyz);vO=position+aI.x*vec3(71.3,13.7,37.1);vC=aC;vA=aA;vI=aI;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const VLC_ROC_FS=[FG_BRUIT,VLC_LUM,VLC_VOR,'varying vec3 vW,vN,vO,vC;varying vec4 vA,vI;','#include <fog_pars_fragment>',
  'void main(){float part=floor(vA.x+.5);vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec3 o=vO;',
  '#ifdef V5','  vec3 Nf=normalize(cross(dFdx(vW),dFdy(vW)));if(dot(Nf,N)<0.)Nf=-Nf;N=normalize(mix(Nf,N,.3));','#endif', // (v5) les facettes, comme la roche
  '  vec3 alb=vC*(.72+.56*fn3(o*.35));float ao=vA.y,gl=0.;',
  '#ifdef V5','  alb*=vec3(1.45,1.25,2.05);','#endif',                                                              // (v5) le basalte tiré vers l'indigo commun, une ardoise (l'arche sortait en aplat NOIR au matin)
  '  if(part<.5)alb*=.75+.5*fn3(o*vec3(.5,.12,.5));',
  '  else if(part<1.5){alb='+(VLC5?'vec3(.075,.058,.115)':'vec3(.016,.013,.02)')+'*(.8+.4*fn3(o*.4));float vn=abs(fn3(o*.21)-.5)+abs(fn3(o*.57)-.5)*.6;gl=smoothstep(.055,0.,vn)*(.35+.65*smoothstep(.45,0.,vA.w));}',
  '  else if(part<2.5)alb*=.8+.35*fn3(o*.9);',
  '  else{'+(VLC5?'vec3 vo=vlcVor(vec2(o.x+o.z*.7,o.y)/6.5);gl=(1.-smoothstep(0.,.07,vo.y-vo.x))*.85;ao=max(ao,.6);':'float vn=abs(fn3(o*.33)-.5);gl=smoothstep(.06,0.,vn)*.85;')+'}',  // (v5) la roche chaude FENDUE en plaques (les cellules de la lave) : les veines en boucles faisaient une peau de léopard sur l'arche
  '  float dif=clamp((dot(N,uSunDir)+.12)/1.12,0.,1.);',
  '  vec3 col=alb*(uSky*('+(VLC5?'.85+.40':'.42+.36')+'*N.y)*ao+uGnd*(.32-.24*N.y)*ao+uSunC*dif*mix(.5,.92,ao)+uFillC*max(dot(N,-uFillD),0.)*.4);', // (v5 : le ciel remplit les ombres, comme la roche)
  '  if(part>.5&&part<1.5){vec3 H=normalize(uSunDir+V);col+=uSunC*pow(max(dot(N,H),0.),80.)*.8;float fr=pow(1.-max(dot(N,V),0.),4.);col+=mix(uGnd,uSky,clamp(reflect(-V,N).y*.5+.5,0.,1.))*fr*'+(VLC5?'.55':'.30')+';}', // le VERRE NOIR (v5 : un verre violet qui prend le ciel — l'obsidienne noire sur brume sombre ne se lisait plus)
  '  col+=alb*vTeinte(vec3(1.,.30,.07))*uLue*vI.z*(1.-smoothstep(0.,.3,vA.w))*2.2*(.5+.5*(1.-N.y));',                  // le pied dans la lave rougeoie
  '  col+=alb*(vPhare(vW,N)+vErupt(vW,N)*3.+uFlash*vec3(.8,.82,1.)*1.2);',
  '  col=mix(col,uBruC,vBrume(vW,dist));',
  '  vec3 em=mix(vec3(.9,.1,.01),vec3(1.,.6,.1),fn3(o*.5+uTime*.15))*gl*uLue*(1.25+.5*sin(uTime*1.9+vI.x*20.));',
  '  em=vTeinte(em);','  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.65);','  #else','  col+=em;','  #endif',
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* LE PANACHE : des bouffées face à la caméra qui MONTENT le long d'une colonne penchée par le vent (aucun calcul sur le processeur) ;
   aC = (pied x, y, z, hauteur de la colonne) · aP = (phase, taille au pied, taille au sommet, volcan : 0 le grand · 1 le second · 2 du loin ·
   3 le PLAFOND DE CENDRE : de grandes nappes aplaties, immobiles, qui dérivent au vent).
   Le pied est éclairé par le cratère (orange), il S'EMBRASE à l'éruption ; le haut prend la lumière du ciel. */
const VLC_FUM_VS=['attribute vec4 aC,aP;uniform float uTime;uniform vec2 uVent;varying vec2 vUv;varying float vU,vA,vD,vK;',
  'void main(){float pl=step(2.5,aP.w),u=pl>.5?.5:fract(aP.x+uTime*.011);',
  '  vec3 c=aC.xyz+vec3(uVent.x,0.,uVent.y)*(pow(u,1.5)*aC.w*.6+pl*uTime*1.5)+vec3(0.,u*aC.w,0.);float s=mix(aP.y,aP.z,pow(u,.7));',
  '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
  '  float a=aP.x*6.283+uTime*.05*(fract(aP.x*7.)-.5),ca=cos(a),sa=sin(a);vec2 r2=uv-.5;vUv=vec2(r2.x*ca-r2.y*sa,r2.x*sa+r2.y*ca)+.5;',
  '  float bc=step(3.5,aP.w);vec3 P=c+(R*position.x+U*position.y*(1.-pl*.58*(1.-bc)))*s;vU=u;vA=smoothstep(0.,.07,u)*(1.-smoothstep(.78,1.,u))*(1.-pl*.45*(1.-bc));vK=aP.w;',
  '  vec4 mv=viewMatrix*vec4(P,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}'].join('\n');
const VLC_FUM_FS=[FG_BRUIT,'uniform vec3 uFumC,uSunC,uSky,fogColor,uLavT;uniform float uFum,uErupt,uErupt2,uLue,fogNear,fogFar,uLavK;varying vec2 vUv;varying float vU,vA,vD,vK;',
  'void main(){vec2 q=vUv-.5;float r=length(q);float n=fn2(vUv*3.1+vec2(vU*9.,vK*13.))*.62+fn2(vUv*7.3-vec2(vU*6.,0.))*.38;',
  '  float a=smoothstep(.5,.10,r+(n-.5)*.34)*vA*uFum;if(a<.004)discard;',
  '  float er=vK<.5?uErupt:vK<1.5?uErupt2:0.,bas=1.-smoothstep(0.,.32,vU);',
  '  vec3 c=uFumC*(uSky*.6+uSunC*.32*(.55+.9*clamp(q.y+.5,0.,1.)))*(.7+.6*n);',
  '  vec3 t9=vec3(1.,.30,.07);t9=mix(t9,dot(t9,vec3(.55,.35,.10))*uLavT*1.45,uLavK);c+=t9*(bas*(.18+er*1.6)*uLue+er*.18*(1.-vU));',
  /* (2026-10-21, embellissement) DEUX TEMPÉRATURES DANS LE PANACHE : le pied est chaud (la braise du cratère, au-dessus), le haut prend le froid du ciel (lavande, bleu) — la colonne
     se détache du ciel orange au lieu de s'y fondre en tube rouge, et elle sépare les plans */
  '  c=mix(c,c*vec3(.72,.86,1.30)+uSky*.08,smoothstep(.40,.95,vU)*(1.-clamp(er,0.,1.)*.8)*step(vK,2.5));',
  '  if(vK>2.5)c=uFumC*(uSky*.5+uSunC*.22*clamp(q.y+.5,0.,1.))*(.75+.5*n)+vec3(1.,.28,.06)*uLue*.07*clamp(.5-q.y,0.,1.);', // le plafond : le dessous rougeoie
  '  if(vK>3.5){c=fogColor*(.82+.36*n)+vec3(1.,.30,.07)*uLue*(.05+.10*clamp(.5-q.y,0.,1.))*(.6+.4*n);a*=.8*smoothstep(35.,130.,vD);}', // un BANC : (v3) LA COULEUR DE LA BRUME, le ventre à peine rougi (les cartes noir-violet tachaient l'image en plaques) ; il s'efface loin devant l'objectif, la brume prend le relais
  '  c=mix(c,fogColor,smoothstep(fogNear,fogFar*3.,vD)*.55);',
  '  gl_FragColor=vec4(c,a);}'].join('\n');
/* LES BRAISES (uK 0 : elles montent, vacillent, orange) et LA CENDRE (uK 1 : des flocons gris qui tombent) — une boîte qui suit la caisse */
const VLC_PART_VS=['attribute vec4 aR;uniform float uTime,uBra,uCen,uPx,uK,uLavK,uLue;uniform vec3 uBoxC,uLavT,uCarP,uCarF,uSky,uSunC,uFumC;varying vec3 vC;varying float vA,vG;',
  'void main(){vec3 B=vec3(240.,110.,280.);',
  '  vec3 pa=uK<.5?vec3(sin(uTime*.4+aR.y*9.)*7.,uTime*(5.+aR.x*6.),cos(uTime*.33+aR.z*7.)*7.):vec3(sin(uTime*.6+aR.y*9.)*4.+uTime*2.5,-uTime*(3.+aR.x*2.),cos(uTime*.5+aR.z*6.)*4.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  float fl=.5+.5*sin(uTime*(6.+aR.w*9.)+aR.x*40.);',
  '  vA=smoothstep(0.,.08,e)*(uK<.5?uBra*(.35+.65*fl):uCen*(.55+.45*aR.w));',
  '  vC=uK<.5?mix(vec3(1.,.22,.02),vec3(1.,.72,.22),aR.y)*2.2:vec3(.11,.10,.095);if(uK<.5)vC=mix(vC,dot(vC,vec3(.55,.35,.10))*uLavT*1.45,uLavK);',
  /* (2026-10-21, embellissement) LA CENDRE ÉCLAIRÉE : des flocons NOIRS sur un ciel clair se lisaient comme de la crasse sur l'objectif ; ils prennent la lumière du ciel,
     du soleil bas et de la lave (gris mauve, un peu plus sombres que l'air) — du pur noir ne reste qu'un fond. */
  '  if(uK>.5){vec3 lit=uFumC*(uSky*.85+uSunC*.14+vec3(.55,.18,.08)*uLue*.12)*.82;vC=mix(vC,lit,.72);}',
  /* LES ÉTINCELLES D'OR (le clin d'œil CASH, ~3,5 % des braises) : une braise sur trente est une étincelle dorée à quatre rais qui scintille — jamais dans le couloir
     (elles s'éteignent à moins de 26-42 m de l'axe de la caisse : elles dansent au-dessus du vide), toujours l'or de la marque, quelle que soit la lave tirée */
  '  float g9=0.;if(uK<.5&&aR.w>.965){vec2 f9=normalize(uCarF.xz+vec2(1e-4,0.)),d9=pos.xz-uCarP.xz;g9=smoothstep(26.,42.,abs(d9.x*f9.y-d9.y*f9.x));}',
  '  if(g9>.01){vC=vec3(1.,.80,.30)*2.7;vA=smoothstep(0.,.08,e)*(.40+.60*pow(.5+.5*sin(uTime*(5.+aR.w*40.)+aR.x*50.),2.))*max(uBra,.6)*g9;}vG=g9;',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.003?0.:(uK<.5?(.75+aR.z*.6)*(1.+g9*1.8):2.2+aR.z*1.2)*uPx*300./max(1.,-mv.z);'+(VLC5?'gl_PointSize=min(gl_PointSize,(uK<.5?(g9>.01?10.:4.5):7.)*uPx);':'')+'}'].join('\n'); // (continuité) des ÉTINCELLES, plus des pastilles orange plein écran
const VLC_PART_FS=['uniform float uK;varying vec3 vC;varying float vA,vG;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;',
  '  if(vG>.01){vec2 q9=abs(gl_PointCoord-.5);float st=max(max(0.,1.-q9.x*13.)*max(0.,1.-q9.y*2.3),max(0.,1.-q9.y*13.)*max(0.,1.-q9.x*2.3));a=max(a,st*st*1.3);}', // les quatre rais de l'étincelle d'or
  '  if(vA*a<.004)discard;',
  '  if(uK<.5)gl_FragColor=vec4(vC*vA*a,1.);else gl_FragColor=vec4(vC,min(1.,vA*a*1.6));}'].join('\n');
/* LES GEYSERS DE LAVE (et la FONTAINE du cratère à l'éruption) : chaque goutte vit sa parabole dans le shader ; aG = (période, phase,
   vitesse de jet, taille) — période < 0 : la fontaine d'un cratère (−1 le grand, −2 le second), allumée par l'éruption. */
const VLC_GEY_VS=['attribute vec4 aR,aG;uniform float uTime,uPx,uGey,uErupt,uErupt2,uLavK;uniform vec3 uLavT;varying vec3 vC;varying float vA;',
  'void main(){float v=aG.z,L=2.*v/26.*(.82+.3*aR.w)+.25,age=mod(uTime+aR.x*L,L),tb=uTime-age,g=fract(tb/max(.1,abs(aG.x))+aG.y);',
  '  float on=aG.x<-1.5?uErupt2:aG.x<0.?uErupt:smoothstep(0.,.04,g)*(1.-smoothstep(.26,.34,g))*uGey;',
  '  float sp=aG.x<0.?.30:.17;vec3 v0=vec3((aR.y-.5)*2.*sp*v,(.80+.25*aR.z)*v,(fract(aR.y*7.31)-.5)*2.*sp*v);',
  '  vec3 p=position+v0*age+vec3(0.,-13.*age*age,0.);float u=age/L;',
  '  vA=on*(1.-u*.7)*step(position.y-6.,p.y);',
  '  vC=mix(vec3(1.,.86,.42),vec3(.95,.14,.02),smoothstep(0.,.75,u))*2.4;vC=mix(vC,dot(vC,vec3(.55,.35,.10))*uLavT*1.45,uLavK);',
  '  vec4 mv=viewMatrix*vec4(p,1.);vA*=1.-smoothstep(1700.,2700.,-mv.z);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.003?0.:aG.w*(1.-u*.45)*uPx*300./max(1.,-mv.z);}'].join('\n');
const VLC_GEY_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d);if(vA*a<.004)discard;gl_FragColor=vec4(vC*vA*a,1.);}'].join('\n');
function volcanMats(){if(VOLCAN.mats)return VOLCAN.mats;const U=VLC_U,F=THREE.UniformsLib.fog;
  const sm=(vs,fs,o)=>{const m=new THREE.ShaderMaterial(Object.assign({uniforms:Object.assign(THREE.UniformsUtils.clone(F),U,o&&o.u||{}),vertexShader:vs,fragmentShader:fs,fog:true},o&&o.m||{}));m.dispose=function(){};return m;}; // jamais libérées : un seul jeu pour tous les volcans
  const M={};
  M.sol=VLC5?sm(VLC_SOL_VS,VLC_SOL_FS5,{m:{extensions:{derivatives:true}}}):sm(VLC_SOL_VS,VLC_SOL_FS);
  M.lave=VLC5?sm(VLC_LAVE_VS,VLC_LAVE_FS5,{m:{extensions:{derivatives:true}}}):sm(VLC_LAVE_VS,VLC_LAVE_FS);
  M.roc=VLC5?sm(VLC_ROC_VS,VLC_ROC_FS,{m:{extensions:{derivatives:true},defines:{V5:1}}}):sm(VLC_ROC_VS,VLC_ROC_FS);
  M.fum=sm(VLC_FUM_VS,VLC_FUM_FS,{m:{transparent:true,depthWrite:false}});
  M.bra=sm(VLC_PART_VS,VLC_PART_FS,{u:{uK:{value:0}},m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.cen=sm(VLC_PART_VS,VLC_PART_FS,{u:{uK:{value:1}},m:{transparent:true,depthWrite:false,fog:false}});
  M.gey=sm(VLC_GEY_VS,VLC_GEY_FS,{m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.bombe=new THREE.PointsMaterial({map:lampTex,color:0xffa648,size:11,sizeAttenuation:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});M.bombe.dispose=function(){};
  M.halo=[];for(let k=0;k<5;k++){const h=new THREE.SpriteMaterial({map:lampTex,color:k===4?0xffb050:0xff5a1a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:0});h.dispose=function(){};M.halo.push(h);} // 0 le grand · 1 le second · 2-3 du loin · 4 les éclaboussures
  return VOLCAN.mats=M;}
/* ---------------- LA ROCHE TAILLÉE : les prototypes (bâtis une fois) ----------------
   L'AIGUILLE (trois variantes) : une lame d'obsidienne à six pans, tordue, haute de 100 m nominaux (pied à −12 : enfoncé), des éclats
   autour du pied ; ses points et rayons gardés pour les collisions. L'ORGUE : une colonne hexagonale à faces NETTES (hauteur 1, rayon 1).
   LE HORNITO : un petit cône de scories (12 m) dont la bouche crache les geysers. */
function vlcGeos(){if(VOLCAN.geo)return VOLCAN.geo;const G={aig:[]};
  for(let v=0;v<3;v++){const K=fbNew(),rg=mulberry32(0xA16+v*977),H=100,pts=[],rad=[],lx=(rg()-.5)*12,lz=(rg()-.5)*12,n=7;
    for(let i=0;i<n;i++){const u=i/(n-1);pts.push([lx*u*u+(rg()-.5)*2.5*(1-u),-12+u*(H+12),lz*u*u+(rg()-.5)*2.5*(1-u)]);rad.push(Math.max(.4,14*Math.pow(1-u,1.25)*(1+(rg()-.5)*.25)));}
    fbTube(K,pts,rad,6,{col:[.05,.04,.045],ytop:H,rg:rg,rug:.10,part:1,cap:1});
    for(let k=0;k<4;k++){const an=k*1.57+rg()*.8,r0=10+rg()*6,x=Math.cos(an)*r0,z=Math.sin(an)*r0,h=18+rg()*26;
      fbTube(K,[[x,-8,z],[x*1.12+(rg()-.5)*2,h*.5,z*1.12],[x*1.25,h,z*1.25]],[5+rg()*2,2.6,.3],5,{col:[.05,.04,.045],ytop:H,rg:rg,rug:.12,part:1,cap:1});}
    const g=fbGeo(K);g.userData.meta={pts:pts,rad:rad};G.aig.push(g);}
  {const K=fbNew(),cs=[.07,.06,.058],ct=[.10,.09,.085];
   for(let k=0;k<6;k++){const a0=k/6*6.2832,a1=(k+1)/6*6.2832,am=(a0+a1)/2,nx=Math.cos(am),nz=Math.sin(am),i=K.n;
     for(const v of [[a0,0],[a1,0],[a1,1],[a0,1]])fbV(K,Math.cos(v[0]),v[1],Math.sin(v[0]),nx,0,nz,[2,v[1]?1:.45,(k*.37)%1,v[1]],cs,[0,0]);
     K.I.push(i,i+2,i+1,i,i+3,i+2);}
   const c=fbV(K,0,1.04,0,0,1,0,[2,1,.5,1],ct,[0,0]);
   for(let k=0;k<6;k++){const a0=k/6*6.2832,a1=(k+1)/6*6.2832,i=fbV(K,Math.cos(a0),1,Math.sin(a0),0,1,0,[2,1,.5,1],ct,[0,0]),j=fbV(K,Math.cos(a1),1,Math.sin(a1),0,1,0,[2,1,.5,1],ct,[0,0]);K.I.push(c,j,i);}
   G.org=fbGeo(K);}
  {const K=fbNew(),rg=mulberry32(0x40E);fbTube(K,[[0,-4,0],[.4,3,.2],[-.2,8,.1],[0,11.5,0]],[9.5,6.2,3.6,2.4],10,{col:[.11,.05,.035],ytop:12,rg:rg,rug:.18,part:3});
   fbTube(K,[[0,11.5,0],[0,12.6,0]],[2.4,2.9],10,{col:[.06,.03,.025],ytop:12,rg:rg,rug:.1,part:3});G.horn=fbGeo(K);}
  return VOLCAN.geo=G;}
/* l'instanciation : un prototype × des exemplaires (les attributs du prototype sont PARTAGÉS : volcanVide ne les libère pas) */
function vlcInst(root,geo,items,nom){if(!items.length)return null;const n=items.length,g=new THREE.BufferGeometry();
  for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);g.setIndex(geo.index);
  const aI=new Float32Array(n*4),im=new THREE.InstancedMesh(g,VOLCAN.mats.roc,n);
  for(let i=0;i<n;i++){im.instanceMatrix.array.set(items[i].m,i*16);aI.set(items[i].j,i*4);}
  g.setAttribute('aI',new THREE.InstancedBufferAttribute(aI,4));im.frustumCulled=false;im.matrixAutoUpdate=false;im.userData.jeter=true;im.userData.partage=true;im.name='volcan '+nom;root.add(im);return im;}
/* ---------------- LE SOL ET LA LAVE EN MORCEAUX DE ~1,1 KM (peu d'appels de dessin ; volcanTick éteint ceux qui sont au-delà de la brume) ----------------
   `vlcMorceau` bâtit UN morceau (et refait celui qui existait : les coulées ont creusé leur lit) ; `vlcMorceaux` les liste, du plus proche du départ au plus loin. */
const VLC_CH=44;
function vlcMorceaux(){const S=VOLCAN.sol,CH=VLC_CH,p0=pts[0],L9=[];
  for(let cj=0;cj<S.nz-1;cj+=CH)for(let ci=0;ci<S.nx-1;ci+=CH){const xc=S.x0+(ci+CH/2)*S.C,zc=S.z0+(cj+CH/2)*S.C;if(S.gd(xc,zc)>S.MARG+CH*S.C*.75)continue;
    const hc=CH*S.C/2;L9.push({ci:ci,cj:cj,d:Math.hypot(xc-p0.x,zc-p0.z),dr:Math.hypot(Math.max(0,Math.abs(xc-p0.x)-hc),Math.max(0,Math.abs(zc-p0.z)-hc))});}
  return L9.sort(function(a,b){return a.d-b.d;});}
function vlcMorceau(root,ci,cj){
  const S=VOLCAN.sol,M=VOLCAN.mats,CH=VLC_CH,cle=ci+','+cj,vieux=VOLCAN.morc.get(cle),out=[];
  if(vieux){for(const m of vieux){root.remove(m);m.geometry.dispose();const j=VOLCAN.solM.indexOf(m);if(j>=0)VOLCAN.solM.splice(j,1);}VOLCAN.morc.delete(cle);}
  {
    const i1=Math.min(S.nx-1,ci+CH),j1=Math.min(S.nz-1,cj+CH),w=i1-ci+1,hh=j1-cj+1;let ok=false;
    for(let j=cj;j<=j1&&!ok;j+=2)for(let i=ci;i<=i1;i+=2)if(S.d[i+j*S.nx]<S.MARG){ok=true;break;}
    if(!ok)return;
    const P=new Float32Array(w*hh*3),Nm=new Float32Array(w*hh*3),A=new Float32Array(w*hh*4),I=[],PL=new Float32Array(w*hh*3),AV=new Float32Array(w*hh*4),IL=[];
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const gi=ci+i,gj=cj+j,k=gi+gj*S.nx,q=i+j*w,x=S.x0+gi*S.C,z=S.z0+gj*S.C;
      P[q*3]=x;P[q*3+1]=S.h[k];P[q*3+2]=z;
      const kl=Math.max(0,gi-1)+gj*S.nx,kr=Math.min(S.nx-1,gi+1)+gj*S.nx,kd=gi+Math.max(0,gj-1)*S.nx,ku=gi+Math.min(S.nz-1,gj+1)*S.nx;
      let nx9=S.h[kl]-S.h[kr],ny9=2*S.C,nz9=S.h[kd]-S.h[ku];const l=Math.hypot(nx9,ny9,nz9);Nm[q*3]=nx9/l;Nm[q*3+1]=ny9/l;Nm[q*3+2]=nz9/l;
      A[q*4]=S.d[k];A[q*4+1]=S.ht[k];A[q*4+2]=S.h[k]-S.yl[k];A[q*4+3]=S.cf?S.cf[k]:0;
      // la LAVE : sa surface, le sens de sa pente (elle coule vers le bas de la vallée), la profondeur (la rive fige)
      PL[q*3]=x;PL[q*3+1]=S.yl[k];PL[q*3+2]=z;let fx=S.yl[kl]-S.yl[kr],fz=S.yl[kd]-S.yl[ku];const fl=Math.hypot(fx,fz);if(fl>.02){fx/=fl;fz/=fl;}else{fx=0;fz=0;}
      AV[q*4]=fx;AV[q*4+1]=fz;AV[q*4+2]=S.yl[k]-S.h[k];AV[q*4+3]=0;}
    for(let j=0;j<hh-1;j++)for(let i=0;i<w-1;i++){const k=(ci+i)+(cj+j)*S.nx,a=i+j*w;if(S.d[k]>S.MARG+120&&S.d[k+1+S.nx]>S.MARG+120)continue;
      I.push(a,a+w,a+1,a+1,a+w,a+w+1);
      if(VLC5&&Math.max(S.yl[k],S.yl[k+1],S.yl[k+S.nx],S.yl[k+S.nx+1])-Math.min(S.yl[k],S.yl[k+1],S.yl[k+S.nx],S.yl[k+S.nx+1])>6)continue; // (v5) au bord du LAC DU CRATÈRE la surface sautait de la mer au cratère : un MUR de lave de 600 m, rayé, plantait une « tour » noire et orange au sommet du grand volcan (ces cases-là sont sous la roche)
      if(S.h[k]<S.yl[k]+.6||S.h[k+1]<S.yl[k+1]+.6||S.h[k+S.nx]<S.yl[k+S.nx]+.6||S.h[k+S.nx+1]<S.yl[k+S.nx+1]+.6)IL.push(a,a+w,a+1,a+1,a+w,a+w+1);}
    if(!I.length)return;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nm,3));g.setAttribute('aS',new THREE.BufferAttribute(A,4));
    g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,M.sol);m.name='volcan sol';m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);out.push(m);VOLCAN.solM.push(m);VOLCAN.n.sol+=I.length/3;
    if(IL.length){const gl=new THREE.BufferGeometry();gl.setAttribute('position',new THREE.BufferAttribute(PL,3));gl.setAttribute('aV',new THREE.BufferAttribute(AV,4));gl.setIndex(IL);gl.computeBoundingSphere();
      const ml=new THREE.Mesh(gl,M.lave);ml.name='volcan lave';ml.matrixAutoUpdate=false;ml.userData.jeter=true;root.add(ml);out.push(ml);VOLCAN.solM.push(ml);VOLCAN.n.lave+=IL.length/3;}
  }
  VOLCAN.morc.set(cle,out);return out;}
/* LA FILE DES TRANCHES : des tâches exécutées DANS L'ORDRE, quelques millisecondes par image (volcanTick) */
function vlcTache(f){VOLCAN.file.push(f);}
function vlcTranches(ms){const F=VOLCAN.file;if(!F||VOLCAN.fi>=F.length)return 0;const t0=performance.now();let n=0;
  while(VOLCAN.fi<F.length){const f=F[VOLCAN.fi++];try{f();}catch(e){window.__volcanErr=e;console.warn('Volcan (tranche)',e);}n++;if(performance.now()-t0>ms)break;}
  VOLCAN.msFile=(VOLCAN.msFile||0)+performance.now()-t0;if(VOLCAN.fi>=F.length){VOLCAN.file=[];VOLCAN.fi=0;}return n;}
/* LA MER AU LOIN : au-delà de la grille, la lave continue jusqu'à l'horizon (un plan de 40 km, 0,6 m sous la mer : la grille le couvre partout où elle existe) */
function vlcMerLoin(root){const S=VOLCAN.sol,g=new THREE.PlaneGeometry(40000,40000,1,1);g.rotateX(-Math.PI/2);const n=g.attributes.position.count;
  g.setAttribute('aV',new THREE.Float32BufferAttribute(new Float32Array(n*4).map((v,i)=>i%4===2?20:0),4));const cx=S.x0+S.nx*S.C/2,cz=S.z0+S.nz*S.C/2;
  const m=new THREE.Mesh(g,VOLCAN.mats.lave);m.position.set(cx,VOLCAN.ySea-.6,cz);m.updateMatrix();m.matrixAutoUpdate=false;m.frustumCulled=false;m.renderOrder=-1;m.userData.jeter=true;m.name='volcan mer';root.add(m);return m;}
/* UNE COULÉE : un ruban de trois rangs (rive, cœur, rive) posé 0,9 m au-dessus de son lit ; la vitesse suit la pente (les chutes filent) */
function vlcRuban(root,P){const S=VOLCAN.sol,Pp=[],A=[],I=[];let n=0;
  for(let k=0;k<P.length;k++){const p=P[k],a=P[Math.max(0,k-1)],b=P[Math.min(P.length-1,k+1)];let tx=b[0]-a[0],tz=b[2]-a[2];const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
    const w=5+Math.min(9,k*.09),dy=(a[1]-b[1])/tl,sp=1+Math.min(6,Math.max(0,dy)*8),y=Math.max(vlcH(p[0],p[2]),vlcH(p[0]-tz*w*.7,p[2]+tx*w*.7),vlcH(p[0]+tz*w*.7,p[2]-tx*w*.7))+.9;
    for(const sd of [1,0,-1]){Pp.push(p[0]-tz*w*sd,y-(sd?.25:0),p[2]+tx*w*sd);A.push(tx*sp,tz*sp,sd?0:6,1);} // (dans cet ordre : les faces regardent le ciel)
    if(k>0){const a0=(k-1)*3,b0=k*3;I.push(a0,b0,a0+1,a0+1,b0,b0+1,a0+1,b0+1,a0+2,a0+2,b0+1,b0+2);}n++;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setAttribute('aV',new THREE.Float32BufferAttribute(A,4));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,VOLCAN.mats.lave);m.name='volcan coulée';m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);VOLCAN.solM.push(m);return m;}
/* L'ARCHE DE FEU : une arche de basalte qui ENJAMBE la route (au moins 30 m d'air sous elle), fendue de veines qui couvent, une
   chute de lave de chaque côté, à ses pieds (jamais sur la route). Les gélules de collision sont rendues. */
function vlcArche(root,fr,COL,A9,F9,off){const Q=VOLCAN.Q;A9=A9||(Q&&Q.arche);if(!A9)return null; // (2026-10-20) A9 : l'arche (Q.arches) · F9 : sa forme tirée ('haute' : élancée) · off : la jumelle, tant de m plus loin
  let ia=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(A9.p);if(d<bd){bd=d;ia=i;}}if(off)ia=Math.min(NP-1,ia+Math.round(off/(L/(NP-1))));
  {const ds9=L/(NP-1);for(let i=0;i<NP;i+=4)if(Math.abs(i-ia)*ds9>300&&Math.hypot(pts[i].x-pts[ia].x,pts[i].z-pts[ia].z)<ROAD_HALF+130)return null;} // une autre route passe dessous : pas d'arche (ses piliers la couperaient)
  const p=pts[ia],t=T[ia],hl=Math.hypot(t.x,t.z)||1,bx=-t.z/hl,bz=t.x/hl,K=fbNew(),HA=F9==='haute',top=HA?p.y+64:p.y+32+10;
  const A=[p.x-bx*(ROAD_HALF+78),0,p.z-bz*(ROAD_HALF+78)],B9=[p.x+bx*(ROAD_HALF+84),0,p.z+bz*(ROAD_HALF+84)];
  A[1]=Math.min(vlcH(A[0],A[2]),vlcL(A[0],A[2]))-6;B9[1]=Math.min(vlcH(B9[0],B9[2]),vlcL(B9[0],B9[2]))-6;
  const cp=[],rad=[],n=24,ph=fr()*6.28;
  for(let k=0;k<=n;k++){const u=k/n,arc=Math.sin(u*Math.PI),yl=A[1]+(B9[1]-A[1])*u;
    cp.push([A[0]+(B9[0]-A[0])*u+Math.sin(u*8+ph)*2.5,yl+(top-(A[1]+B9[1])/2)*Math.pow(arc,.55)+Math.sin(u*11+ph)*1.4,A[2]+(B9[2]-A[2])*u+Math.cos(u*7+ph)*2.5]);
    rad.push((HA?12-4.5*arc:15-6.5*arc)*(1+.16*Math.sin(k*1.7+ph)+.08*Math.sin(k*4.1+ph*2)));}
  const o=[cp[n>>1][0],0,cp[n>>1][2]];for(const q of cp){q[0]-=o[0];q[2]-=o[2];}
  fbTube(K,cp,rad,14,{col:[.07,.05,.045],ytop:1e4,rg:fr,rug:.16,part:3,aoK:.6});
  for(let k=0;k<10;k++){const j=1+((fr()*(n-2))|0),q=cp[j],r=rad[j],an=fr()*6.28;fbTouffe(K,[q[0]+Math.cos(an)*r*.8,q[1]+Math.sin(an)*r*.7,q[2]+Math.sin(an)*r*.5],r*(.3+fr()*.25),1,{rg:fr,cc:q,cr:r,col:[.06,.045,.04],ytop:1e4,part:3,bos:.35,mix:.3});} // les blocs
  for(let k=0;k<n;k++)COL.push({a:[cp[k][0]+o[0],cp[k][1],cp[k][2]+o[2]],b:[cp[k+1][0]+o[0],cp[k+1][1],cp[k+1][2]+o[2]],r:rad[k+1]*1.02});
  const g=fbGeo(K),aI=new Float32Array([fr(),0,0,0]);g.setAttribute('aI',new THREE.InstancedBufferAttribute(aI,4));
  const im=new THREE.InstancedMesh(g,VOLCAN.mats.roc,1);im.instanceMatrix.array.set([1,0,0,0,0,1,0,0,0,0,1,0,o[0],0,o[2],1]);im.frustumCulled=false;im.matrixAutoUpdate=false;im.userData.jeter=true;im.name='volcan arche';root.add(im);
  // les deux CHUTES : du flanc de l'arche, à ses pieds, jusqu'à la lave
  const CH=[];for(const e of [[A,.16],[B9,.84]]){const j=Math.round(e[1]*n),q=cp[j],x=q[0]+o[0],z=q[2]+o[2],y0=q[1]+rad[j]*.6,y1=Math.min(vlcH(x,z),vlcL(x,z))-2,dx=(e[0][0]-p.x),dz=(e[0][2]-p.z),dl=Math.hypot(dx,dz)||1;
    const Pt=[];for(let k=0;k<=8;k++){const u=k/8;Pt.push([x+dx/dl*(rad[j]*.9+u*u*6),y0+(y1-y0)*u,z+dz/dl*(rad[j]*.9+u*u*6)]);}CH.push(Pt);}
  for(const Pt of CH){const Pp=[],Av=[],I=[];for(let k=0;k<Pt.length;k++){const q=Pt[k];for(const sd of [-1,0,1]){Pp.push(q[0]+(t.x/hl)*sd*6,q[1],q[2]+(t.z/hl)*sd*6);Av.push(0,-6,sd?0:6,2);}
      if(k>0){const a0=(k-1)*3,b0=k*3;I.push(a0,b0,a0+1,a0+1,b0,b0+1,a0+1,b0+1,a0+2,a0+2,b0+1,b0+2,a0,a0+1,b0,a0+1,b0+1,b0,a0+1,a0+2,b0+1,a0+2,b0+2,b0+1);}} // (les deux faces : on la voit des deux côtés)
    // la chute coule vers le BAS (genre 2 : le shader lit sa texture dans le plan vertical et la fait défiler vers le bas)
    const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g2.setAttribute('aV',new THREE.Float32BufferAttribute(Av,4));g2.setIndex(I);g2.computeBoundingSphere();
    const m2=new THREE.Mesh(g2,VOLCAN.mats.lave);m2.name='volcan chute';m2.matrixAutoUpdate=false;m2.userData.jeter=true;root.add(m2);}
  const r9={c:new THREE.Vector3(o[0],top,o[2]),i:ia};if(!VOLCAN.arche)VOLCAN.arche=r9;(VOLCAN.arches||(VOLCAN.arches=[])).push(r9);return r9;}
/* LES PANACHES : une colonne par volcan (le grand, le second, ceux du loin), des bouffées qui montent sans fin */
function vlcPanaches(root,fr){const DZ9=VOLCAN.dz,nF0=PAL_B9('volcanFumee',80),nF=DZ9?Math.round(nF0*DZ9.fum.v):nF0,C9=[],P9=[]; // (LE DÉCOR AU HASARD) le volume de la fumée
  const col=(c,K,kind,H,s0,s1,n)=>{for(let k=0;k<n;k++){C9.push(c.x,K.yP-K.cr*.3,c.z,H);P9.push(k/n+fr()*.6/n,s0*(.8+fr()*.4),s1*(.75+fr()*.5),kind);}};
  col(VOLCAN.C,VOLCAN.K,0,1500,110,760,nF);if(VOLCAN.C2&&(!DZ9||DZ9.c2f||VOLCAN.Q.c2))col(VOLCAN.C2,VOLCAN.K2,1,1150,90,600,Math.round(nF*.6));
  for(const l of VOLCAN.loin)col(l.c,l.K,2,950,60,330,Math.round(nF*.25));
  {const R9=mulberry32((VOLCAN.graine*7919+11)>>>0),ds9=L/(NP-1),dens=TEL_NATIF?.07:.11; // les BANCS DE FUMÉE : des bouffées le long de la route, dessus, dessous, sur les côtés
   for(const b of VOLCAN.bancs||[]){const n=Math.max(6,Math.round((b.s1-b.s0)*dens));for(let k=0;k<n;k++){const i=Math.max(0,Math.min(NP-1,Math.round((b.s0+R9()*(b.s1-b.s0))/ds9))),t=T[i],hl=Math.hypot(t.x,t.z)||1,lat=(R9()*2-1)*(ROAD_HALF+80),sz=55+R9()*60;
     C9.push(pts[i].x-t.z/hl*lat,pts[i].y-28+R9()*72,pts[i].z+t.x/hl*lat,0);P9.push(R9(),sz,sz,4);}}}
  {const n=TEL_NATIF?6:14;for(let k=0;k<n;k++){const i=Math.round(fr()*(NP-1)),an=fr()*6.283,r=300+fr()*1500,sz=700+fr()*450; // le PLAFOND DE CENDRE
    const y9=pts[i].y+620+fr()*320,ph9=fr();if(VLC5)continue; // (v5) plus de PLAFOND DE CENDRE : ses grandes nappes faisaient des taches brunes dans le ciel (les tirages fr() sont gardés)
    C9.push(pts[i].x+Math.sin(an)*r,y9,pts[i].z+Math.cos(an)*r,0);P9.push(ph9,sz,sz,3);}}
  const g=new THREE.InstancedBufferGeometry(),pl=new THREE.PlaneGeometry(1,1);g.index=pl.index;g.setAttribute('position',pl.attributes.position);g.setAttribute('uv',pl.attributes.uv);
  g.setAttribute('aC',new THREE.InstancedBufferAttribute(new Float32Array(C9),4));g.setAttribute('aP',new THREE.InstancedBufferAttribute(new Float32Array(P9),4));g.instanceCount=P9.length/4;
  const m=new THREE.Mesh(g,VOLCAN.mats.fum);m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=3;m.userData.jeter=true;m.name='volcan panaches';root.add(m);VOLCAN.n.bouffees=g.instanceCount;return m;}
/* LES VOLCANS DU LOIN : deux cônes au-delà de la plaine (un maillage en anneaux, la matière de la roche), des coulées qui luisent sur
   leurs flancs (la chaleur du shader, genre 2), un halo au cratère. Rien ne les touche : ils sont à plus de 1,8 km de la route. */
function vlcLoin(root,fr){VOLCAN.loin=[];const fin=VOLCAN.Q&&VOLCAN.Q.fin;if(!fin)return;
  for(const sd of (VOLCAN.dz?[[],[-1],[-1,1],[-1,1,0]][VOLCAN.dz.loin]:[-1,1])){const an=fin.phi+sd*(.75+fr()*.5),dist=3000+fr()*1300;let x=fin.p.x+Math.sin(an)*dist,z=fin.p.z+Math.cos(an)*dist,ok=true;
    for(let i=0;i<NP;i+=20)if(Math.hypot(pts[i].x-x,pts[i].z-z)<1900){ok=false;break;}if(!ok)continue;
    const K={yP:fin.p.y+260+fr()*220,yB:fin.p.y-480,rc:110,cr:60,Rb:1400+fr()*300,ex:1.5},R=36,A9=56,Pp=[],Nm=[],As=[],I=[],ph=fr()*6.28;
    for(let j=0;j<=R;j++){const u=j/R,r=K.Rb*Math.pow(u,1.25);for(let k=0;k<=A9;k++){const a=k/A9*6.2832;let y=vlcConeY(K,r);if(r>K.rc)y-=12*Math.pow(Math.abs(Math.sin(a*7+ph)),.6)*Math.min(1,(r-K.rc)/200);
      Pp.push(Math.sin(a)*r,y,Math.cos(a)*r);const st=Math.pow(Math.max(0,Math.sin(a*4+ph*2+Math.sin(r*.004)*1.2)),24)*Math.pow(Math.max(0,1-r/(K.Rb*.75)),.6)+(r<K.rc*1.2?1:0);
      As.push(5000,Math.min(1,st),60,2);}}
    for(let j=0;j<=R;j++)for(let k=0;k<=A9;k++){const q=j*(A9+1)+k,qa=j*(A9+1)+(k+1)%(A9+1),qb=Math.min(R,j+1)*(A9+1)+k,qc=Math.max(0,j-1)*(A9+1)+k;
      const ex=Pp[qa*3]-Pp[q*3],ey=Pp[qa*3+1]-Pp[q*3+1],ez=Pp[qa*3+2]-Pp[q*3+2],fx=Pp[qb*3]-Pp[qc*3],fy=Pp[qb*3+1]-Pp[qc*3+1],fz=Pp[qb*3+2]-Pp[qc*3+2];
      let nx=ey*fz-ez*fy,ny=ez*fx-ex*fz,nz=ex*fy-ey*fx;const l=Math.hypot(nx,ny,nz)||1;if(ny<0){nx=-nx;ny=-ny;nz=-nz;}Nm.push(nx/l,ny/l,nz/l);}
    for(let j=0;j<R;j++)for(let k=0;k<A9;k++){const a=j*(A9+1)+k,b=a+A9+1;I.push(a,b,a+1,a+1,b,b+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(As,4));g.setIndex(I);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,VOLCAN.mats.sol);m.position.set(x,0,z);m.updateMatrix();m.matrixAutoUpdate=false;m.userData.jeter=true;m.name='volcan du loin';root.add(m);
    VOLCAN.loin.push({c:new THREE.Vector3(x,0,z),K:K,ph:fr()*6.28,m:m});}}
