/* <<<GROTTE>>> */
/* ======================= LES PROFONDEURS — LA MAP DES GROTTES (2026-10-18, Sacha : « fais une nouvelle map en mode dans les grottes, en mode
   Minecraft mais bien — mets-toi dans la peau d'un designer senior de jeu vidéo et fais un truc parfait ») =======================
   Une DESCENTE sous la terre, en BLOCS : la route plonge de la mine jusqu'aux abysses à travers cinq grottes — chacune SA lumière, pour que
   l'œil sache toujours où il est (chaud → vert → violet → ocre → rouge → cyan), et que la vitesse se lise sur la roche qui défile.
   · LA ROUTE (`genGrotte` → `grtTrace`) : elle DESCEND (≈ 4-5 %) de salle en salle —
       0 · L'ENTRÉE ET LA MINE : une galerie CARRÉE, des cadres de bois, des torches (la lumière chaude, le décor qu'on reconnaît) ;
       1 · LA GROTTE LUXURIANTE : une grande salle, la mousse, les lianes aux baies qui luisent, le lac d'eau (vert et orange) ;
       2 · LE PUITS DE LA GÉODE : la route entre en tangente dans un ENTONNOIR et en fait 1¼ tour autour d'un pilier dont le cœur est une GÉODE
           d'améthyste géante (violet) ; chaque tour passe ~60 m sous le précédent et ~34 m plus à l'intérieur : sauter du bord intérieur =
           retomber sur le tour d'en dessous (LE RACCOURCI de la map) ; on ressort dans l'axe ;
       3 · LES STALACTITES : une cathédrale ocre hérissée de concrétions (dessus, dessous, en colonnes) — jamais sur la route ;
       4 · LE LAC DE LAVE : la plus grande salle, l'ardoise profonde, la lave PLATE ~48 m sous la route, les chutes de lave, les diamants ;
       5 · LES ABYSSES : le noir, le sculk qui pulse en cyan, les piliers d'une cité oubliée, la salle du portail.
     ≥ 3 MODULES tirés au hasard (`gSlalom`, `gCorde`, `gChicane`, `gHoule` — LES MODULES DE CHAQUE MAP), dans leur propre flux de hasard
     (un seul tirage `rnd`) ; contrôle des croisements (moins de 32 m d'air entre deux passages = conflit, nouvel essai).
   · LA DA (2026-10-18, Sacha, au premier banc : « non, arrête, ça fait pas Minecraft — je veux une grotte, les biomes de grotte de Minecraft,
     mais avec la MÊME DA que les autres maps ») : des biomes de Minecraft, AUCUN cube ni texture pixel — la roche LOW-POLY À FACETTES des pics du
     glacier et du cône du volcan, des couleurs pleines et saturées par salle, la recette commune des maps (CONTI), des décors à facettes.
   · LA GROTTE (`grtCreuse1`, `grtPuits`, `grtLacs`, `grtPiliers`) : un CHAMP DE DENSITÉ sur une grille de 8 m (`GRT.B` ; 12 m depuis LA GROTTE VASTE, 19/10), creusé autour de la route :
     chaque échantillon vide un ellipsoïde (demi-largeur, plafond, fond — par salle, fondus aux frontières, mordus par un bruit de roche) ; la
     galerie de la mine est carrée (exposant 6) ; puis le PUITS (cône, pilier, géode, bassin), le LAC DE LAVE et le LAC D'EAU (des surfaces
     plates), les PILIERS de basalte et les colonnes de concrétion. Stockage creux en tronçons de 16³ cases. RÈGLE D'OR : un NOYAU autour de la
     route est toujours vide, le bruit ne mord jamais la route (`dbgGrotte('test')`).
   · LE RENDU (`grtMailleNets`, `GRT_VS`/`GRT_FS`) : la surface est tirée du champ par « surface nets » (un sommet par cube traversé, des
     facettes de ~8 m), une maille par tronçon cachée au-delà du brouillard ; UNE matière : la normale de la FACETTE (dérivées), la paroi et le
     sol de chaque salle (`GRT_MUR`/`GRT_SOL`), des strates douces, l'OCCLUSION (la part de roche autour du sommet), la lumière CUITE en deux
     canaux — les TORCHES et la LUMIÈRE DU LIEU (l'air de la salle, la lave par en dessous, la géode, l'eau, les baies, les chutes de lave, les
     capteurs, les feux d'âme, les gemmes) —, dosée par la météo en uniforms ; la LANTERNE de la caisse allume la roche autour d'elle. Les
     décors (cadres, torches, gemmes de diamant et d'or, lianes et baies, azalées, cristaux, concrétions, chutes de lave, capteurs, piliers) sont
     des formes à facettes (prismes, boîtes, octaèdres) dans la même matière. Zéro image, zéro lumière three.
   · LES MÉTÉOS (`SF_CARTES.grotte`, `GRT_MET`) : sous la terre, pas de ciel — TORCHES (matin : la grotte explorée, bien éclairée), CRISTAUX
     (midi : peu de torches, cristaux et minerais à pleine lumière), MAGMA (soir : la lave déborde), NOIR COMPLET (nuit : torches éteintes, tes
     phares et la lave). Chaque SALLE a son ambiance (`grtBiomes` : brume, lumières de la caisse, bloom) fondue en 2,4 s quand on y entre (bioGo)
     — la caisse prend la couleur du lieu.
   · CE QUI TUE : en vol, la roche, la lave, l'eau du puits, les gros décors (`grotteHeurt` → L'IMPACT). La route n'a rien de plus.
   Console : `dbgGrotte()` (comptes, temps) · `dbgGrotte('test')` (la règle d'or) · `dbgGrotte('vue',{p,c,fov})` · `dbgGrotte('salle',{k,d,h})`
   (photo en pause au début d'une salle) · `dbgGrotte('puits')` (le raccourci vu du bord) · `dbgGrotte('meteo','nuit')`.
   Lancer : `?carte=grotte&meteo=matin`. */
const NIV_GROTTE={id:'grotte',nm:'LES PROFONDEURS',bio:['grt-matin-mine'],planete:0,espace:0,pluie:0,cielMusical:false,route:.34,sheen:.14,piste:'grotte',nuit:1,pr:'LA ROCHE NE PARDONNE PAS'};
const GROTTE={root:null,Q:null,salles:null,spi:null,conflits:0,croise:0,hz:null, // la génération (prebChampsDe) — hz : LES PROFONDEURS AU HASARD (20/10)
  V:null,met:'matin',cur:null,de:null,to:null,k:1,dur:1,ms:0,msFile:0,n:{},file:null,fi:0,pret:false,grp:[],salle:-1,sl:null,col:null,heurt:'',part:null,R:null,puits:null,lac:null,eau:null};
const GRT_SALLES=['mine','luxe','geode','stal','lave','abysse'];
/* LA FORME DE CHAQUE SALLE (mètres) — rh : la demi-largeur de l'air autour de la route · up : le plafond au-dessus d'elle · dn : le fond en
   dessous · ex : la forme (2 = ellipse, 6 = galerie presque carrée) · nz : la morsure du bruit (±). entree / fin : la salle d'arrivée (le
   portail d'où l'on vient) et la salle du portail (son anneau fait ~70 m de rayon, 21 m au-dessus de la route). */
const GRT_FORME={
  entree:{rh:96, up:92, dn:52, ex:2,nz:.14},
  mine:  {rh:44, up:33, dn:15, ex:6,nz:.05},
  luxe:  {rh:122,up:80, dn:64, ex:2,nz:.30},
  geode: {rh:94, up:82, dn:78, ex:2,nz:.22},
  stal:  {rh:106,up:104,dn:78, ex:2,nz:.26},
  lave:  {rh:178,up:86, dn:70, ex:2,nz:.22},
  abysse:{rh:98, up:68, dn:72, ex:2,nz:.30},
  fin:   {rh:138,up:140,dn:86, ex:2,nz:.18}};
/* LA GROTTE VASTE (2026-10-19, Sacha : « la map grotte doit être plus longue et la grotte beaucoup plus vaste ») — les salles ~2,5 × plus larges
   et plus hautes (la MINE reste la galerie étroite : c'est l'ouverture sur la première salle qui donne l'échelle), le puits de la géode en
   entonnoir géant, la map 1,7 × plus longue (le remplissage des quatre salles : l'entrée, la mine, le puits et la salle du portail restent).
   La grille passe de 8 à 12 m (`GRT.B`) : à 8 m, construction, mémoire et triangles auraient été multipliés par 4-6 ; à 12 m ils restent
   ceux d'avant à ~1,5 × près, et les facettes, rapportées à des salles 2,5 × plus grandes, sont même plus fines qu'avant. Le bruit de la roche,
   les torches, les gemmes, les décors, la lumière de la lave et de la géode et le brouillard suivent l'échelle (`GRV`). `?sans=grottevaste` =
   la grotte d'avant, à l'identique. */
const GRT_VASTE=!/[?&]sans=([^&]*,)?grottevaste(,|&|$)/.test(location.search);
if(GRT_VASTE)Object.assign(GRT_FORME,{
  entree:{rh:140,up:130,dn:80, ex:2,nz:.14},
  luxe:  {rh:290,up:200,dn:150,ex:2,nz:.20},
  stal:  {rh:250,up:290,dn:150,ex:2,nz:.18},
  lave:  {rh:400,up:210,dn:170,ex:2,nz:.16},
  abysse:{rh:260,up:180,dn:220,ex:2,nz:.22},
  fin:   {rh:230,up:210,dn:160,ex:2,nz:.16}});
/* long : la longueur · ent : l'entonnoir du puits au-delà de la spirale (m) · voute / bassin / eauP : sa voûte au-dessus du 1er tour, son fond et
   son eau sous le dernier · nzK : l'échelle du bruit de la roche · lacP, eauL : la lave et le lac sous le point le plus bas de leur salle ·
   lavL, geoL : la portée de la lumière de la lave (dans sa salle seulement : la cathédrale voisine virait à l'orange à midi et le soir) et de la géode · torR (tR2, tF), torK : la portée (son carré, sa décroissance) et la taille des torches · fog : le brouillard ·
   cull : la marge des tronçons cachés au-delà du brouillard (la demi-diagonale d'un tronçon) · amb : la lumière de l'air des salles (hors de la
   mine) · fogS (par salle, × fogC), fogN : la couleur de la brume et son départ (la perspective de l'air : une paroi à 300 m se lit dans la
   brume, pas dans le noir — banc du 19/10, quatre réglages comparés sur la même graine : ×2 / ×1,6 / départ ×0,4 retenu, ×2,6 délavait).
   `?grv=amb:2.6,fogC:1.3` : un réglage à l'essai (le banc). */
const GRV=GRT_VASTE?{long:1.7,ent:200,voute:300,bassin:190,eauP:170,nzK:2,lacP:70,eauL:60,lavL:85,geoL:110,torR:66,tR2:4356,tF:166,torK:1.7,fog:1.3,cull:170,amb:2,fogC:1,fogN:.4,fogS:[1,1.6,1.6,1.6,1.6,2.2]}
  :{long:1,ent:92,voute:150,bassin:112,eauP:96,nzK:1,lacP:48,eauL:44,lavL:38,geoL:70,torR:46,tR2:2100,tF:80,torK:1,fog:1,cull:120,amb:1,fogC:1,fogN:1,fogS:[1,1,1,1,1,1]};
/* ===== LES PROFONDEURS AU HASARD (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map
   soit aléatoire avec des modules et des décors qui changent ») =====
   MESURÉ AVANT (banc des tracés, 24 graines × paliers 0/10/25) : écart de forme 0,07, cap de départ −7°…+7°, TOUJOURS les mêmes six salles dans
   le même ordre. Désormais, dans un hasard à elle (`rh`, né de la graine de l'essai — jamais un `rnd()` de plus dans l'ordre d'avant) :
   · LE TRACÉ (`GRT_HZ`, `?sans=grottehasard` = la route d'avant au point près) : l'AXE tiré sur tout le cercle (la route part dans l'axe : tout ce
     qui lit la route — roche, puits, lacs, décors, lumière — suit), des COUDES de l'axe entre deux salles (±22° au plus au total : le cap reste à
     moins de 90° de l'axe de départ), l'ORDRE des salles du milieu tiré (la mine d'abord, la salle du portail au bout ; la lave jamais contre le
     puits, jamais deux fois la même de suite), parfois une salle en MOINS (luxuriante, stalactites ou abysses) ou en PLUS (deux lacs de lave, deux
     cathédrales…) selon la longueur visée, la part de chacune tirée ; un CARACTÈRE par salle, jamais deux fois le même de suite (virages, courbes,
     serpent, dérive, cassures) ; huit sortes de MODULES au paquet : les quatre d'avant + LE PONT (une longue droite à plat au-dessus d'un gouffre,
     sur des piles de basalte), LE TIRE-BOUCHON (un tour complet qui descend de ~62 m : la route repasse sous elle-même), L'ÉQUERRE (la galerie à
     angles presque droits), LA PORTE (un goulet entre deux piliers de roche). `dbgGrotte().hz` = l'axe, l'ordre, les caractères, les modules.
   · LE DÉCOR (`GRT_DECO`, `?sans=grottedecor` = le décor d'avant au tirage près) : voir `grtDecoTire` (grottes-2). */
const GRT_HZ=!/[?&]sans=([^&]*,)?grottehasard(,|&|$)/.test(location.search);
const GRT_DECO=!/[?&]sans=([^&]*,)?grottedecor(,|&|$)/.test(location.search);
{const m=/[?&]grv=([^&]*)/.exec(location.search);if(m&&GRT_VASTE)for(const kv of decodeURIComponent(m[1]).split(',')){const a=kv.split(':');if(a.length===2&&a[0] in GRV&&!Array.isArray(GRV[a[0]])&&isFinite(+a[1]))GRV[a[0]]=+a[1];}}
/* LES MÉTÉOS — torche : les torches (lumière cuite et flammes) · lieu : la lumière du lieu · amb : le plancher de lumière · lant : la lanterne
   de la caisse · emi : minerais, cristaux, sculk · lav : la lave · part : les poussières · flam : les flammes des torches */
const GRT_MET={
  matin:{torche:1,  lieu:.9,  amb:.05, lant:1,   emi:1,   lav:1,   part:1,   flam:1},
  midi: {torche:.3, lieu:1.3, amb:.042,lant:.95, emi:1.8, lav:1.05,part:1.35,flam:.3},
  soir: {torche:.65,lieu:1.15,amb:.055,lant:1,   emi:1.1, lav:1.75,part:1.2, flam:.65},
  nuit: {torche:0,  lieu:.55, amb:.014,lant:1.5, emi:.9,  lav:1.2, part:.6,  flam:0}};
/* ---------------- LA ROUTE : LA DESCENTE DE SALLE EN SALLE ----------------
   Les aides de la balade du volcan (avance, droite, arc, tourne, vers, virages), un AXE qui borne le cap (la route avance toujours), la pente
   par salle (houle douce), les modules. LE PUITS : on se met en travers de l'axe, le centre est DEVANT ; 1¼ tour (±14°) ramène la route dans
   l'axe ; le rayon se resserre de 34 m par tour (le tour d'en dessous est sous le BORD INTÉRIEUR de celui d'au-dessus : on y tombe en sautant
   vers l'intérieur) ; le PAS (58-64 m par tour) laisse > 50 m d'air entre deux tours. */
function* genGrotte(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais
  CAMPM.length=0;MODMARK.length=0;
  const LV=typeof lvPiste==='function'?lvPiste():1,g0=(rnd()*4294967296)>>>0,gr=mulberry32(g0),rh=GRT_HZ?mulberry32((g0^0x47A0E5)>>>0):null;let best=null; // rh : LE HASARD DES PROFONDEURS (né de la graine, à part)
  for(let e=0;e<(rh?8:6);e++){if(e)yield;const r=grtTrace(gr,LV,rh);if(!best||r.conflits<best.conflits)best=r;if(!r.conflits)break;}
  for(const k of ['Q','salles','spi','conflits','croise','hz'])GROTTE[k]=best[k];
  for(const m of best.mods||[])MODMARK.push(m);
  return best.ctrl;}
function grtTrace(rnd,LV,rh){ /* rh : LE HASARD DES PROFONDEURS (null : la recette d'avant, au tirage près) */
  const vw=70+100*(LV-1),rM=40+.3*vw,KV=Math.sqrt(Math.max(1,vw/78)),ctrl=[],RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DN=[];
  const Rs=()=>rM*(1.30+rnd()*.2),Rn=()=>{const a=rM*1.55,b=Math.max(a+25,200);return a+rnd()*(b-a);},Rl=()=>Math.max(rM*2.1,230)+rnd()*110;
  // LA PENTE (positive = on descend) par salle, une houle douce par-dessus ; les 300 premiers mètres en douceur (le portail d'arrivée)
  const PENTE={mine:.032,luxe:.052,geode:.045,stal:.062,lave:.024,abysse:.046};
  const ph1=rnd()*6.283,ph2=rnd()*6.283;let gF=null,sa='mine',gM=null;
  const pente=s9=>{if(gF!=null)return gF;
    let g=PENTE[sa]+(sa==='mine'?0:sa==='lave'?.012*Math.sin(s9/430*6.283+ph1):.024*Math.sin(s9/520*6.283+ph1)+.012*Math.sin(s9/230*6.283+ph2));
    if(s9<300)g=.008+(g-.008)*THREE.MathUtils.smoothstep(s9,170,300);
    return Math.max(-.03,Math.min(.10,g))+(gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);};
  let P=new THREE.Vector3(0,0,0),phi=0,s=0,y=0,axe=0;
  const push=()=>ctrl.push(P.clone());
  const avance=(nx,nz)=>{const dh=Math.hypot(nx-P.x,nz-P.z),n=Math.max(1,Math.ceil(dh/10)),x0=P.x,z0=P.z;
    for(let j=0;j<n;j++){y-=pente(s+dh*(j+.5)/n)*dh/n;DN.push(x0+(nx-x0)*(j+1)/n,y,z0+(nz-z0)*(j+1)/n,s+dh*(j+1)/n);}s+=dh;P.set(nx,y,nz);push();};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi,s:s};};
  const droite=l=>{const nn=Math.max(2,Math.round(l/25));for(let k=0;k<nn;k++)avance(P.x+Math.sin(phi)*l/nn,P.z+Math.cos(phi)*l/nn);};
  const arc=(aDeg,R)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;const nx=P.x+Math.sin(phi)*ch,nz=P.z+Math.cos(phi)*ch;phi+=st/2;avance(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  const rel=()=>wrap(phi-axe)*57.2958;
  const LIM=68,tourne=(aDeg,R)=>{const r=rel();let a=aDeg;if(r+a>LIM)a=LIM-r;if(r+a<-LIM)a=-LIM-r;if(Math.abs(a)>2)arc(a,R);return a;};
  const vers=(cible,R)=>{const a=wrap(axe+cible/57.2958-phi)*57.2958;if(Math.abs(a)>3)arc(a,R);};
  let sg=rnd()<.5?-1:1;
  const virages=n=>{for(let k=0;k<n;k++){const r=rel();sg=Math.abs(r)>30?(r>0?-1:1):-sg;tourne(sg*(36+rnd()*28),rnd()<.33?Rs():Rn());if(rnd()<.2)droite((30+rnd()*40)*KV);}};
  const SL=[],salle=k=>{sa=k;SL.push({k:k,p:P.clone(),s:s});};
  // LES MODULES DES PROFONDEURS (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON) : les quatre du volcan, cap borné par l'axe, hasard `rv`
  const rv=mulberry32((rnd()*4294967296)>>>0),MM=[],paq=[];let mLast=-1;
  const gAxe=()=>{if(Math.abs(rel())>20)vers((rel()>0?1:-1)*12,rM*(1.7+rv()*.3));};
  const gSlalom=()=>{gAxe();const n=4+((rv()*3)|0),a=30+rv()*14,R=rM*(1.6+rv()*.4);let s9=rel()>0?-1:1;tourne(s9*a*.5,R);
    for(let k=0;k<n;k++){s9=-s9;tourne(s9*a,R);}tourne(-s9*a*.5,R);};
  const gCorde=()=>{const T=90+rv()*25,s9=rel()>0?-1:1,R=rM*(1.6+rv()*.4),a1=T*(.45+rv()*.1);vers(-s9*T/2,rM*(1.7+rv()*.3));droite((30+rv()*30)*KV);
    tourne(s9*a1,R);droite((30+rv()*40)*KV);tourne(s9*(T-a1),Math.max(rM*1.4,R*.9));droite((30+rv()*30)*KV);};
  const gChicane=()=>{gAxe();const a=32+rv()*12,R=rM*(1.3+rv()*.2),s9=rel()>0?-1:1;droite(40*KV);tourne(s9*a,R);tourne(-s9*2*a,R);tourne(s9*a,R);droite(40*KV);};
  const gHoule=()=>{gAxe();const n=2,lam=(280+rv()*60)*KV,amp=.07+rv()*.03,L9=n*lam,s0=s;
    gM={s0:s0,s1:s0+L9,f:function(s9){const u=(s9-s0)/L9;return amp*Math.sin(u*n*6.2832)*Math.min(1,u*n*2,(1-u)*n*2);}};
    let s9=rel()>0?-1:1;tourne(s9*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){s9=-s9;const a=44+rv()*12;tourne(s9*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}tourne(-s9*22,lam*.25/(22/57.2958));gM=null;};
  /* (LES PROFONDEURS AU HASARD, 20/10) quatre modules de plus, propres à la grotte — seulement au hasard (rh) :
     LE PONT : une longue droite presque à plat (son gouffre et ses piles : grtEchantillons, grtDecors) · LE TIRE-BOUCHON : un tour complet de
     rayon ≥ 2,2 × le rayon mini, qui descend de 62-70 m (la route repasse sous elle-même : un croisement, jamais un conflit) · L'ÉQUERRE : la
     galerie à angles presque droits (62-76° au rayon serré), simple ou double · LA PORTE : un goulet entre deux piliers de roche (grtPiliers). */
  const PONT=[],PORTE=[],MODN=[];
  const gPont=()=>{gAxe();droite(30*KV);const a=P.clone(),L9=(240+rv()*160)*KV;gF=.006;droite(L9);gF=null;PONT.push([a.x,a.y,a.z,P.x,P.y,P.z]);droite(30*KV);};
  const gSpire=()=>{gAxe();const R=Math.max(rM*2.2,190)+rv()*50,sgn=rel()>0?-1:1,pas=62+rv()*8;droite(40*KV);gF=pas/(2*Math.PI*R);arc(sgn*360,R);gF=null;droite(40*KV);};
  const gEquerre=()=>{gAxe();const s9=rel()>0?-1:1,R=rM*(1.3+rv()*.15),a=62+rv()*14;droite((40+rv()*30)*KV);tourne(s9*a,R);droite((50+rv()*50)*KV);tourne(-s9*a,R);droite((40+rv()*30)*KV);
    if(rv()<.5){tourne(-s9*a,R);droite((50+rv()*40)*KV);tourne(s9*a,R);droite(30*KV);}};
  const gPorte=()=>{gAxe();droite(50*KV);PORTE.push([P.x,P.y,P.z]);droite(70*KV);const s9=rel()>0?-1:1;tourne(s9*(14+rv()*10),Rn());tourne(-s9*(14+rv()*10),Rn());};
  const MJ=rh?[gSlalom,gCorde,gChicane,gHoule,gPont,gSpire,gEquerre,gPorte]:[gSlalom,gCorde,gChicane,gHoule];
  const MNOM=['slalom','corde','chicane','houle','pont','tire-bouchon','equerre','porte'];
  const gMod=()=>{let m=0;for(let e=0;e<6;e++){if(!paq.length){const t=[];for(let i=0;i<MJ.length;i++)t.push(i);for(let i=t.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)paq.push(x);}m=paq.shift();if(m!==mLast)break;}
    mLast=m;const i0=ctrl.length-1,s0=s;MJ[m]();MM.push({i0:i0,i1:ctrl.length-1});MODN.push([MNOM[m],Math.round(s0),Math.round(s-s0)]);};
  /* (au hasard) un module qui TIENT dans ce qui reste de la salle (r m) : le premier du paquet dont la longueur estimée tient, les autres gardent leur
     tour ; aucun : false (la salle se remplit de son caractère) */
  const EST=m=>m===5?2*Math.PI*(Math.max(rM*2.2,190)+25)+80*KV:m===4?380*KV:m===3?720*KV:m===0?560*KV:m===1?520*KV:m===2?300*KV:m===6?420*KV:260*KV;
  const gModH=r=>{if(!paq.length){const t=[];for(let i=0;i<MJ.length;i++)t.push(i);for(let i=t.length-1;i>0;i--){const j=(rv()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)paq.push(x);}
    let k=-1;for(let i=0;i<paq.length;i++)if(paq[i]!==mLast&&EST(paq[i])<=r*1.05){k=i;break;}if(k<0)return false;
    const m=paq.splice(k,1)[0];mLast=m;const i0=ctrl.length-1,s0=s;MJ[m]();MM.push({i0:i0,i1:ctrl.length-1});MODN.push([MNOM[m],Math.round(s0),Math.round(s-s0)]);return true;};
  /* LA PLACE DE CHAQUE SALLE (LA DURÉE DES MAPS, 2026-10-18 — voir DUREE) : l'entrée, la mine, le PUITS (la pièce maîtresse) et la salle du portail
     sont fixes ; les quatre autres salles se partagent le reste de la longueur visée (luxuriante 27 %, stalactites 20 %, lave 30 %, abysses 23 %),
     chacune remplie de virages et d'un module quand il tient (au moins un module dans la map). Hors du JOUER : la longueur pleine (~4,2 km × KV). */
  const LC9=(typeof longueurCible==='function'?longueurCible():0)*GRV.long; // (LA GROTTE VASTE, 19/10 : 1,7 × la longueur visée)
  const R0=Math.max(LC9?205:250,rM*(LC9?1.9:2.7))+rnd()*30,dR=34,TH=(1.25+(rnd()-.5)*.08)*Math.PI*2,R1=R0-dR*TH/(Math.PI*2),PAS=58+rnd()*6;
  const Lsp=TH*(R0+R1)/2+50*KV+1.6*Math.max(rM*2,220),KM=Math.sqrt(KV),FIXE=170*KM+330*KM+Lsp+80*KV+250*KV,B9=LC9?Math.max(1500,LC9-FIXE):4200*KV*GRV.long;
  let nMod=0;
  const remplir=(len,mods)=>{const s0=s;let m=0;while(s-s0<len-70){const r=len-(s-s0);if(m<mods&&(r>430*KV||nMod===0)){gMod();m++;nMod++;}else virages(1);}};
  if(rh){axe=rh()*6.2832-3.1416;phi=axe;} /* (AU HASARD) L'AXE : n'importe où sur le cercle — la route part dans l'axe */
  // ================= 0 · L'ENTRÉE ET LA MINE =================
  push();salle('mine');ici('depart');droite(170*KM);ici('mine0'); // (la mine ne grandit qu'en √KV : c'est un décor qu'on reconnaît, pas un tronçon de vitesse)
  {const a=sg*(24+rnd()*10);tourne(a,Rn());droite(70*KM);tourne(-a*1.25,Rn());droite(90*KM);tourne(a*.7,Rn());droite(40*KM);}ici('mine1');
  // ================= 2 · LE PUITS DE LA GÉODE (sa recette : `puits`) =================
  let C=null,b0=0,yH0=0,sH0=0,yH1=0,sH1=0,sgB=1;
  const puits=()=>{
  const hv=rel()>=0?1:-1;vers(hv*90,Math.max(rM*2,220));droite(50*KV);
  const fx=Math.sin(axe),fz=Math.cos(axe),cA=new THREE.Vector3(P.x+R0*Math.cos(phi),0,P.z-R0*Math.sin(phi)),cB=new THREE.Vector3(P.x-R0*Math.cos(phi),0,P.z+R0*Math.sin(phi));
  C=((cA.x-P.x)*fx+(cA.z-P.z)*fz)>((cB.x-P.x)*fx+(cB.z-P.z)*fz)?cA:cB; /* le centre DEVANT : 1¼ tour plus tard, la route repart dans l'axe */
  b0=Math.atan2(P.x-C.x,P.z-C.z);yH0=y;sH0=s;ici('puits0');
  {const t0x=Math.sin(phi),t0z=Math.cos(phi);sgB=(Math.cos(b0)*t0x-Math.sin(b0)*t0z)>0?1:-1;const Lh=TH*(R0+R1)/2,nP=Math.max(60,Math.ceil(Lh/12));
   gF=PAS/(Math.PI*(R0+R1)); // la descente continue (PAS par tour)
   for(let k=1;k<=nP;k++){const t=k/nP,b=b0+sgB*TH*t,r=R0+(R1-R0)*t,nx=C.x+Math.sin(b)*r,nz=C.z+Math.cos(b)*r;phi=Math.atan2(nx-P.x,nz-P.z);avance(nx,nz);}}
  gF=null;yH1=y;sH1=s;ici('puits1');
  droite(80*KV);};
  /* ---- LES SALLES AU HASARD (rh) : l'ordre, une de moins ou de plus, les parts, les caractères, les coudes ---- */
  const CARS=['virages','courbes','serpent','derive','cassures'];
  const pas1=(car,r,dd)=>{const s1=s; /* un pas du caractère de la salle (r : ce qui reste, dd : le côté de la dérive) */
    if(car==='courbes'){const rr=rel();sg=Math.abs(rr)>20?(rr>0?-1:1):-sg;tourne(sg*(30+rh()*24),Rl());if(rh()<.45&&r>260)droite((40+rh()*50)*KV);}
    else if(car==='serpent'){const rr=rel();sg=Math.abs(rr)>34?(rr>0?-1:1):-sg;tourne(sg*(38+rh()*26),Rs());}
    else if(car==='derive'){const rr=rel();if(rr*dd<44)tourne(dd*(16+rh()*14),Rn());else tourne(-dd*(14+rh()*12),Rn());droite((30+rh()*40)*KV);}
    else if(car==='cassures'){droite((50+rh()*70)*KV);const rr=rel();sg=Math.abs(rr)>30?(rr>0?-1:1):(rh()<.5?-sg:sg);tourne(sg*(26+rh()*22),Rs());}
    else virages(1);
    if(s-s1<5)droite(30*KV);};
  const remplirH=(len,mods,car)=>{const s0=s,dd=rh()<.5?-1:1;let m=0;while(s-s0<len-70){const r=len-(s-s0);if(m<mods&&nMod<7&&(r>430*KV||nMod===0)&&gModH(r)){m++;nMod++;}else pas1(car,r,dd);}};
  const grtSuite=()=>{
    const ax0=axe,B9r=B9/(KV*6000),pM=B9r<.8?.5:B9r>1.25?.1:.25,pP=B9r<.8?.12:B9r>1.25?.55:.33,u=rh();
    let mil=['luxe','geode','stal','lave','abysse'],moins=null,plus=null;
    if(u<pM){moins=['luxe','stal','abysse'][(rh()*3)|0];mil=mil.filter(function(k){return k!==moins;});}
    else if(u<pM+pP){plus=['stal','lave','luxe','abysse'][(rh()*4)|0];mil.push(plus);}
    let ord=null; /* mélangé : la lave jamais contre le puits (son lac et l'entonnoir), jamais deux fois la même de suite */
    for(let e=0;e<80&&!ord;e++){const t=mil.slice();for(let i=t.length-1;i>0;i--){const j=(rh()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}
      let ok=true;for(let i=1;i<t.length;i++)if(t[i]===t[i-1]||(t[i]==='lave'&&t[i-1]==='geode')||(t[i]==='geode'&&t[i-1]==='lave'))ok=false;if(ok)ord=t;}
    if(!ord){ord=['luxe','geode','stal','lave','abysse'].filter(function(k){return k!==moins;});plus=null;}
    const W0={luxe:.27,stal:.2,lave:.3,abysse:.23},w=ord.map(function(k){return k==='geode'?0:W0[k]*(.75+.5*rh());}),sw=w.reduce(function(a,b){return a+b;},0);
    const car=[];let cD=null;for(const k of ord){if(k==='geode'){car.push('puits');continue;}let c=k==='lave'&&rh()<.6?'courbes':CARS[(rh()*CARS.length)|0];
      if(c===cD)c=CARS[(CARS.indexOf(c)+1+((rh()*(CARS.length-1))|0))%CARS.length];car.push(c);cD=c;}
    let nC=0;
    for(let i=0;i<ord.length;i++){const k=ord[i];
      if(i&&rh()<.62){const c=(rh()<.5?-1:1)*(10+rh()*15)/57.2958;axe=Math.max(ax0-.384,Math.min(ax0+.384,axe+c));nC++;} /* LE COUDE : l'axe tourne (±22° au plus autour de celui du départ) */
      salle(k);
      if(k==='geode')puits();
      else{if(k==='lave')droite(60*KV);const len=B9*w[i]/sw;remplirH(len,len>1500*KV?2:1,car[i]);}
      if(i+1<ord.length&&ord[i+1]==='geode')droite(40*KV);}
    if(!nMod){if(!gModH(1e9))gMod();nMod++;} /* (au moins un module dans la map) */
    return {axe:Math.round(ax0*57.2958),axeFin:Math.round(axe*57.2958),ordre:['mine'].concat(ord,['fin']),moins:moins,plus:plus,car:car,parts:w.map(function(v){return +(v/sw).toFixed(2);}),coudes:nC,
      mods:MODN,ponts:PONT,portes:PORTE};};
  let hz=null;
  if(!rh){
  // ================= 1 · LA GROTTE LUXURIANTE =================
  salle('luxe');remplir(B9*.27,B9*.27>950*KV?2:1);droite(40*KV);
  salle('geode');puits();
  // ================= 3 · LES STALACTITES =================
  salle('stal');remplir(B9*.2,1);
  // ================= 4 · LE LAC DE LAVE : de longues courbes au-dessus de la lave =================
  salle('lave');{const s0=s,len=B9*.3;droite(60*KV);let m=0;
    while(s-s0<len-80){const r=len-(s-s0);if(!m&&(nMod<2||r>700*KV)&&r>430*KV){gMod();m=1;nMod++;continue;}
      const rr=rel();sg=Math.abs(rr)>20?(rr>0?-1:1):-sg;tourne(sg*(30+rnd()*24),Rl());if(rnd()<.45&&r>260)droite((40+rnd()*50)*KV);}}
  // ================= 5 · LES ABYSSES =================
  salle('abysse');remplir(B9*.23,nMod?1:2);if(!nMod){gMod();nMod++;} // (au moins un module dans la map)
  }else hz=grtSuite();
  droite(90*KV);ici('fin');SL.push({k:'fin',p:P.clone(),s:s});droite(150*KV); // la salle du portail
  // LE CONTRÔLE DES CROISEMENTS (celui du volcan) : un passage à moins de 2·RH+14 m d'un autre tronçon ; avec moins de 32 m d'air = un CONFLIT
  let conflits=0,croise=0;{const G=new Map(),n=DN.length/4,cle=(x,z)=>Math.floor(x/40)+','+Math.floor(z/40),vu=new Set();
    for(let i=0;i<n;i++){const k=cle(DN[i*4],DN[i*4+2]);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i);}
    for(let i=0;i<n;i+=2){const x=DN[i*4],yy=DN[i*4+1],z=DN[i*4+2],si=DN[i*4+3],bx=Math.floor(x/40),bz=Math.floor(z/40);
      for(let a9=-2;a9<=2;a9++)for(let b9=-2;b9<=2;b9++){const L9=G.get((bx+a9)+','+(bz+b9));if(!L9)continue;
        for(const j of L9){const sj=DN[j*4+3];if(sj-si<300)continue;const dh=Math.hypot(DN[j*4]-x,DN[j*4+2]-z);if(dh>2*RH+14)continue;
          const t=Math.round(si/150)+':'+Math.round(sj/150);if(vu.has(t))continue;vu.add(t);if(Math.abs(yy-DN[j*4+1])<32)conflits++;else croise++;}}}}
  return {ctrl:ctrl,Q:Q,salles:SL,conflits:conflits,croise:croise,mods:MM,hz:hz,
    spi:{cx:C.x,cz:C.z,R0:R0,R1:R1,TH:TH,sgB:sgB,b0:b0,y0:yH0,y1:yH1,s0:sH0,s1:sH1,pas:PAS,tours:+(TH/6.2832).toFixed(3)}};
}
/* ---------------- LA ROCHE : un CHAMP DE DENSITÉ creusé autour de la route ----------------
   (2026-10-18, Sacha, au premier banc : « non, arrête, ça fait pas Minecraft — je veux une grotte, les biomes de grotte de Minecraft, mais avec la
   MÊME DA que les autres maps ») — plus de cubes ni de texture pixel : la roche est une surface LOW-POLY À FACETTES, comme les pics du glacier et
   le cône du volcan. Une grille de 8 m (`GRT.B`, 12 m pour LA GROTTE VASTE) en tronçons de 16³ cases, alloués seulement là où la route creuse : `pool` (0 roche, 1 air,
   4 lave, 5 eau) et `dn` (la DENSITÉ, ~ la distance signée à la paroi × 1,6 : > 0 dans l'air) ; la surface en est tirée par « surface nets »
   (un sommet par cube traversé, les facettes sont des quads de ~8 m). Par tronçon, 64 sous-cubes de 32 m gardent l'échantillon de route le plus
   proche (`si`) : la salle d'un point et son abscisse s'en déduisent. `chS` : le premier échantillon qui a creusé le tronçon (l'ordre de construction). */
const GRT={B:GRT_VASTE?12:8,K:1.6}; // K : la densité par mètre — (LA GROTTE VASTE, 19/10) des cases de 12 m
function grtH3(i,j,k,s){let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263)+Math.imul(k|0,1274126177)+Math.imul(s|0,1442695041);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function grtN3(x,y,z,s){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const a=grtH3(i,j,k,s),b=grtH3(i+1,j,k,s),c=grtH3(i,j+1,k,s),d=grtH3(i+1,j+1,k,s),e=grtH3(i,j,k+1,s),f=grtH3(i+1,j,k+1,s),g=grtH3(i,j+1,k+1,s),h=grtH3(i+1,j+1,k+1,s);
  return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)*(1-w)+(e+(f-e)*u+(g-e)*v+(e-f-g+h)*u*v)*w;}
function grtRoche(x,y,z){const k=GRV.nzK;return (grtN3(x/(46*k),y/(34*k),z/(46*k),11)*2-1)*.72+(grtN3(x/(17*k),y/(14*k),z/(17*k),23)*2-1)*.28;} // la morsure de la roche, −1…1 (GROTTE VASTE : des bosses deux fois plus larges, à l'échelle des salles)
function grtMonde(x0,y0,z0,x1,y1,z1){const B=GRT.B,C=B*16,ox=Math.floor(x0/C)*C,oy=Math.floor(y0/C)*C,oz=Math.floor(z0/C)*C;
  const CX=Math.ceil((x1-ox)/C)+1,CY=Math.ceil((y1-oy)/C)+1,CZ=Math.ceil((z1-oz)/C)+1;
  return {B:B,ox:ox,oy:oy,oz:oz,CX:CX,CY:CY,CZ:CZ,NX:CX*16,NY:CY*16,NZ:CZ*16,dir:new Int32Array(CX*CY*CZ).fill(-1),pool:[],dn:[],nzc:[],si:[],sd:[],chS:[],cle:[],nAir:0};}
function grtCh(V,ci,cj,ck){const d=ci+V.CX*(cj+V.CY*ck);let c=V.dir[d];
  if(c<0){c=V.pool.length;V.dir[d]=c;V.pool.push(new Uint8Array(4096));V.dn.push(new Int8Array(4096).fill(-127));V.nzc.push(null);V.si.push(new Int32Array(64).fill(-1));V.sd.push(new Float32Array(64).fill(1e12));V.chS.push(1e9);V.cle.push(d);}return c;}
function grtLit(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return 0;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?0:V.pool[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtD(V,i,j,k){if(i<0||j<0||k<0||i>=V.NX||j>=V.NY||k>=V.NZ)return -127;const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(k>>4))];return c<0?-127:V.dn[c][(i&15)|((j&15)<<4)|((k&15)<<8)];}
function grtIci(V,x,y,z){return grtLit(V,Math.floor((x-V.ox)/V.B),Math.floor((y-V.oy)/V.B),Math.floor((z-V.oz)/V.B));} // la case d'un point (mètres)
function grtDensIci(V,x,y,z){ // la densité au point (trilinéaire entre les centres des cases) : < 0 = dans la roche — la collision lit la même surface que l'image
  const gx=(x-V.ox)/V.B-.5,gy=(y-V.oy)/V.B-.5,gz=(z-V.oz)/V.B-.5,i=Math.floor(gx),j=Math.floor(gy),k=Math.floor(gz),fx=gx-i,fy=gy-j,fz=gz-k;
  const a=grtD(V,i,j,k),b=grtD(V,i+1,j,k),c=grtD(V,i,j+1,k),d=grtD(V,i+1,j+1,k),e=grtD(V,i,j,k+1),f=grtD(V,i+1,j,k+1),g=grtD(V,i,j+1,k+1),h=grtD(V,i+1,j+1,k+1);
  return ((a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy)*(1-fz)+((e*(1-fx)+f*fx)*(1-fy)+(g*(1-fx)+h*fx)*fy)*fz;}
/* LES ÉCHANTILLONS DE ROUTE (tous les ~6 m) : position, tangente, abscisse, salle, forme fondue (90 m de part et d'autre d'une frontière),
   plus 20 échantillons prolongés avant le départ (la caméra du portail d'arrivée) et après l'arrivée (le portail). */
function grtEchantillons(){
  const ds=L/(NP-1),st=Math.max(1,Math.round(6/ds)),SL=GROTTE.salles||[],Q=GROTTE.Q||{},o0=Q.depart?Q.depart.p:null;
  const ox=o0?pts[0].x-o0.x:0,oy=o0?pts[0].y-o0.y:0,oz=o0?pts[0].z-o0.z:0; // (le repère de la génération → celui de la route bâtie)
  const near=function(p){let bd=1e18,bi=0;for(let i=0;i<NP;i+=4){const q=pts[i],d=(q.x-p.x-ox)**2+(q.y-p.y-oy)**2+(q.z-p.z-oz)**2;if(d<bd){bd=d;bi=i;}}
    let b2=bi;for(let i=Math.max(0,bi-4);i<=Math.min(NP-1,bi+4);i++){const q=pts[i],d=(q.x-p.x-ox)**2+(q.y-p.y-oy)**2+(q.z-p.z-oz)**2;if(d<bd){bd=d;b2=i;}}return b2*ds;};
  const F=[{k:'entree',s:-1e9}];for(const b of SL)F.push({k:b.k,s:b.k==='mine'?180:near(b.p)});
  const SI={entree:0,mine:0,luxe:1,geode:2,stal:3,lave:4,abysse:5,fin:5},bornes={};for(let j=1;j<F.length;j++)if(!GRT_HZ||!(F[j].k in bornes))bornes[F[j].k]=F[j].s; /* (AU HASARD) une salle deux fois : sa 1re */
  /* LES TRONÇONS DE CHAQUE SORTE (AU HASARD : une salle peut venir deux fois, dans n'importe quel ordre) : [début, fin pour les décors (la dernière
     salle du milieu va jusqu'au bout, comme les abysses d'avant), début de la suivante, la sorte d'avant, celle d'après] */
  const segs={};for(let j=1;j<F.length;j++){const k=F[j].k;if(k==='fin')continue;const nx=j+1<F.length?F[j+1].s:1e9,kn=j+1<F.length?F[j+1].k:'fin';(segs[k]||(segs[k]=[])).push([F[j].s,kn==='fin'?1e9:nx,nx,F[j-1].k,kn]);}
  const sm=THREE.MathUtils.smoothstep,ns=Math.floor((NP-1)/st)+1,n=ns+40,R={segs:segs,n:n,X:new Float32Array(n),Y:new Float32Array(n),Z:new Float32Array(n),S:new Float32Array(n),TX:new Float32Array(n),TZ:new Float32Array(n),
    SAL:new Uint8Array(n),RH:new Float32Array(n),UP:new Float32Array(n),DN:new Float32Array(n),EX:new Float32Array(n),NZ:new Float32Array(n),EXT:new Uint8Array(n),i0:20,bornes:bornes,ds:ds};
  const pose=function(q,x,y,z,tx,tz,s9,ext){R.X[q]=x;R.Y[q]=y;R.Z[q]=z;R.S[q]=s9;const l=Math.hypot(tx,tz)||1;R.TX[q]=tx/l;R.TZ[q]=tz/l;R.EXT[q]=ext;
    let rh=0,up=0,dn=0,ex=0,nz=0,wb=-1,kb=0;
    for(let j=0;j<F.length;j++){const a=j?sm(s9,F[j].s-90,F[j].s+90):1,b=j+1<F.length?sm(s9,F[j+1].s-90,F[j+1].s+90):0,m=a-b;if(m<=0)continue;
      const f=GRT_FORME[F[j].k];rh+=f.rh*m;up+=f.up*m;dn+=f.dn*m;ex+=f.ex*m;nz+=f.nz*m;if(m>wb){wb=m;kb=SI[F[j].k];}}
    R.RH[q]=rh;R.UP[q]=up;R.DN[q]=dn;R.EX[q]=ex;R.NZ[q]=nz;R.SAL[q]=kb;};
  const T0=T[0],T1=T[NP-1],p0=pts[0],p1=pts[NP-1];
  for(let k=0;k<20;k++){const d=(20-k)*6;pose(k,p0.x-T0.x*d,p0.y-T0.y*d,p0.z-T0.z*d,T0.x,T0.z,-d,1);}
  for(let k=0;k<ns;k++){const i=Math.min(NP-1,k*st),p=pts[i];pose(20+k,p.x,p.y,p.z,T[i].x,T[i].z,i*ds,0);}
  for(let k=0;k<20;k++){const d=(k+1)*6;pose(20+ns+k,p1.x+T1.x*d,p1.y+T1.y*d,p1.z+T1.z*d,T1.x,T1.z,L+d,1);}
  // LES LACS : la lave PLATE 48 m sous le point le plus bas de la salle de lave (elle déborde 300 m dans les salles voisines) ; l'eau de la grotte luxuriante
  const yMinDe=function(a,b){let m=1e9;for(let q=0;q<n;q++)if(!R.EXT[q]&&R.S[q]>=a&&R.S[q]<=b)m=Math.min(m,R.Y[q]);return m;};
  if(!GRT_HZ){
  if(bornes.lave!=null&&bornes.abysse!=null){const y9=yMinDe(bornes.lave,bornes.abysse);GROTTE.lac={y:y9-GRV.lacP,s0:bornes.lave-300,s1:bornes.abysse+300};
    for(let q=0;q<n;q++)if(R.S[q]>=GROTTE.lac.s0&&R.S[q]<=GROTTE.lac.s1)R.DN[q]=Math.max(R.DN[q],R.Y[q]-GROTTE.lac.y+14);}
  if(bornes.luxe!=null&&bornes.geode!=null){const y9=yMinDe(bornes.luxe,bornes.geode);GROTTE.eau={y:y9-GRV.eauL,s0:bornes.luxe,s1:bornes.geode+120};}
  GROTTE.lacs=GROTTE.lac?[GROTTE.lac]:[];GROTTE.eaux=GROTTE.eau?[GROTTE.eau]:[];}
  else{ /* (AU HASARD) UN LAC PAR SALLE DE LAVE : il déborde de 300 m chez ses voisines (jamais dans la mine, le puits ou la salle du portail) — vois :
     les salles où sa lueur monte ; UN LAC D'EAU par grotte luxuriante (120 m chez la suivante, comme avant) */
    const H9=GROTTE.hz;R.ponts=[];R.portes=[];
    if(H9){for(const a of H9.ponts||[])R.ponts.push([near({x:a[0],y:a[1],z:a[2]}),near({x:a[3],y:a[4],z:a[5]})]);for(const a of H9.portes||[])R.portes.push(near({x:a[0],y:a[1],z:a[2]}));}
    for(const pn of R.ponts)for(let q=0;q<n;q++)if(R.S[q]>=pn[0]-40&&R.S[q]<=pn[1]+40)R.DN[q]=R.DN[q]*1.6; /* LE PONT : le gouffre sous lui */
    GROTTE.lacs=[];GROTTE.eaux=[];
    for(const sg of segs.lave||[]){const y9=yMinDe(sg[0],sg[2]),kb=sg[3]==='mine'||sg[3]==='geode',kf=sg[4]==='geode'||sg[4]==='fin',l={y:y9-GRV.lacP,s0:sg[0]-(kb?0:300),s1:sg[2]+(kf?0:300),vois:[4]};
      if(!kb)l.vois.push(SI[sg[3]]);if(!kf)l.vois.push(SI[sg[4]]);GROTTE.lacs.push(l);
      for(let q=0;q<n;q++)if(R.S[q]>=l.s0&&R.S[q]<=l.s1)R.DN[q]=Math.max(R.DN[q],R.Y[q]-l.y+14);}
    for(const sg of segs.luxe||[]){const y9=yMinDe(sg[0],sg[2]);GROTTE.eaux.push({y:y9-GRV.eauL,s0:sg[0],s1:sg[2]+120});}
    GROTTE.lac=GROTTE.lacs[0]||null;GROTTE.eau=GROTTE.eaux[0]||null;}
  // le PUITS dans le repère de la route
  const P=GROTTE.spi;if(P){const rg=Math.min(150,P.R1-ROAD_HALF-52);GROTTE.puits={cx:P.cx+ox,cz:P.cz+oz,y0:P.y0+oy,y1:P.y1+oy,R0:P.R0,R1:P.R1,gy:(P.y0+P.y1)/2+oy,rg:rg,rp:34,
    yB:P.y1+oy-GRV.bassin,yW:P.y1+oy-GRV.eauP,yT:P.y0+oy+GRV.voute,s0:P.s0,s1:P.s1};}
  // la grille des échantillons (48 m) : les questions « suis-je sur la route ? » des décors
  const G=new Map();for(let q=0;q<n;q++){const k=Math.floor(R.X[q]/48)+','+Math.floor(R.Z[q]/48);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(q);}R.G=G;
  return R;}
/* un décor (colonne verticale de x,z, de y0 à y1, de rayon r) est-il LIBRE de la route ? — loin d'elle, ou franchement au-dessus (36 m :
   l'air du vol) ou au-dessous de la dalle (14 m) */
function grtLibre(R,x,z,y0,y1,r){const lim=ROAD_HALF+r+10,bx=Math.floor(x/48),bz=Math.floor(z/48),nn=Math.ceil(lim/48);
  for(let a=-nn;a<=nn;a++)for(let b=-nn;b<=nn;b++){const L9=R.G.get((bx+a)+','+(bz+b));if(!L9)continue;
    for(const q of L9){if((R.X[q]-x)**2+(R.Z[q]-z)**2>lim*lim)continue;if(!(y0>R.Y[q]+36||y1<R.Y[q]-THICK-14))return false;}}
  return true;}
/* ---------------- CREUSER : l'ellipsoïde d'un échantillon ----------------
   Le rayon normalisé r̂ = ((dh/rh)^ex + (dy/H)^ex)^(1/ex) (H = plafond au-dessus de la route, fond au-dessous) ; la paroi est à r̂ = 1 + nz·bruit ;
   la DENSITÉ = la marge (1 + nz·bruit − r̂) × rh × K, gardée au plus grand de tous les échantillons (l'union des creux). Le NOYAU
   (ROAD_HALF + 10 m de large, 30 m au-dessus, THICK + 9 m au-dessous) est vide quoi qu'il arrive : la règle d'or. Le bruit d'une case est
   calculé une fois (cache Int8 : ~10 échantillons la revisitent) et seulement dans la COQUILLE (près de la paroi). */
function grtCreuse1(V,R,q){
  const B=V.B,inv=1/B,K=GRT.K,px=R.X[q],py=R.Y[q],pz=R.Z[q],rh=R.RH[q],up=R.UP[q],dn=R.DN[q],ex=R.EX[q],nz=R.NZ[q];
  const rc=ROAD_HALF+10,hcU=30,hcD=THICK+9,e2=Math.abs(ex-2)<.01,he=ex/2,ie=1/ex,M=1+nz,ME=Math.pow(M,ex),BO=2.5*B,Rm=rh*M+BO,sur=1-nz-2*B/rh,SAT=GRT_VASTE?3*B:1e9;
  // 1 · LES SOUS-CUBES (32 m) qu'il touche : l'échantillon le plus proche (la salle, l'abscisse)
  {const S=4*B,a0=Math.floor((px-Rm-V.ox)/S),a1=Math.floor((px+Rm-V.ox)/S),c0=Math.floor((pz-Rm-V.oz)/S),c1=Math.floor((pz+Rm-V.oz)/S),b0=Math.floor((py-dn*M-BO-V.oy)/S),b1=Math.floor((py+up*M+BO-V.oy)/S);
   for(let c=Math.max(0,c0);c<=Math.min(V.NZ/4-1,c1);c++)for(let a=Math.max(0,a0);a<=Math.min(V.NX/4-1,a1);a++){const x=V.ox+(a+.5)*S-px,z=V.oz+(c+.5)*S-pz,dh=Math.max(0,Math.hypot(x,z)-28);if(dh>Rm)continue;
     for(let b=Math.max(0,b0);b<=Math.min(V.NY/4-1,b1);b++){const y=V.oy+(b+.5)*S-py,dy=Math.max(0,Math.abs(y)-28),H=(y>0?up:dn)*M+BO;if(dh*dh/(Rm*Rm)+dy*dy/(H*H)>1)continue;
       const ch=grtCh(V,a>>2,b>>2,c>>2),qq=(a&3)|((b&3)<<2)|((c&3)<<4),d2=x*x+y*y+z*z;if(d2<V.sd[ch][qq]){V.sd[ch][qq]=d2;V.si[ch][qq]=q;}if(q<V.chS[ch])V.chS[ch]=q;}}}
  // 2 · LES COLONNES : la marge en MÈTRES (la fraction de rayon × la distance au centre / r̂) ; au-delà de 2,5 cases hors de la paroi la plus lointaine, rien
  const i0=Math.max(0,Math.floor((px-Rm-V.ox)*inv)),i1=Math.min(V.NX-1,Math.floor((px+Rm-V.ox)*inv)),k0=Math.max(0,Math.floor((pz-Rm-V.oz)*inv)),k1=Math.min(V.NZ-1,Math.floor((pz+Rm-V.oz)*inv));
  for(let k=k0;k<=k1;k++){const cz=V.oz+(k+.5)*B,dz=cz-pz,dz2=dz*dz;
    for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,dx=cx-px,dh2=dx*dx+dz2;if(dh2>Rm*Rm)continue;
      const u=e2?dh2/(rh*rh):Math.pow(dh2/(rh*rh),he),vt=ME-u,kv=vt>0?(e2?Math.sqrt(vt):Math.pow(vt,ie)):0,uc=dh2/(rc*rc);
      const ja=Math.max(0,Math.ceil((py-dn*kv-BO-V.oy)*inv-.5)),jb=Math.min(V.NY-1,Math.floor((py+up*kv+BO-V.oy)*inv-.5));let cj=-1,A=null,DN=null,NZ=null;
      for(let j=ja;j<=jb;j++){if((j>>4)!==cj){cj=j>>4;const d=(i>>4)+V.CX*(cj+V.CY*(k>>4));let c=V.dir[d];if(c<0)c=grtCh(V,i>>4,cj,k>>4);A=V.pool[c];DN=V.dn[c];NZ=V.nzc[c]||(V.nzc[c]=new Int8Array(4096).fill(-128));}
        const o=(i&15)|((j&15)<<4)|((k&15)<<8);if(DN[o]===127)continue;
        const cy=V.oy+(j+.5)*B,dy=cy-py,dy2=dy*dy,H=dy>0?up:dn,w=e2?dy2/(H*H):Math.pow(dy2/(H*H),he),rr=e2?Math.sqrt(u+w):Math.pow(u+w,ie),ds=Math.sqrt(dh2+dy2)/Math.max(rr,.05);
        if((rr-M)*ds>BO)continue; // (loin dehors : la roche, rien à écrire)
        let m;if(rr<sur)m=1-nz-rr;else{let n8=NZ[o];if(n8===-128)n8=NZ[o]=Math.round(grtRoche(cx,cy,cz)*127);m=1+nz*n8/127-rr;}
        m*=ds; // (en mètres)
        if(m>SAT)m=128/K; /* (GROTTE VASTE) à plus de 3 cases de la paroi, seul le SIGNE sert (surface, collision, décors, occlusion) : la case est saturée
           tout de suite et les échantillons suivants la sautent (`DN===127`) — le creusement des grandes salles 1,8 → ~1,3 × celui d'avant */
        if(uc<1){const c2=uc+dy2/(dy>0?hcU*hcU:hcD*hcD);if(c2<1)m=Math.max(m,1+(1-Math.sqrt(c2))*12);}
        const dv=Math.max(-127,Math.min(127,Math.round(m*K)));if(dv>DN[o])DN[o]=dv;
        if(m>0&&A[o]!==1){A[o]=1;V.nAir++;}}}}}
/* LE PUITS DE LA GÉODE : un entonnoir (le rayon de la spirale + 92 m, voûté au-dessus du premier tour), le PILIER central (34 m), la GÉODE
   (une sphère d'améthyste à mi-hauteur des tours, ≥ 52 m du bord intérieur de la route), le BASSIN au fond. La densité = la plus petite des marges. */
function grtPuits(V,R){const P=GROTTE.puits;if(!P)return;const B=V.B,K=GRT.K,EN=GRV.ent,Rmax=Math.max(P.R0,P.R1)+EN*1.12+2*B,yd=P.y0+55;
  const qm=(function(){let b=-1,bd=1e18;for(let q=0;q<R.n;q++){const d=Math.abs(R.S[q]-(P.s0+P.s1)/2);if(d<bd){bd=d;b=q;}}return b;})(); // l'échantillon du milieu de la spirale : la salle des cases du puits
  const rAt=function(y){const t=Math.max(-.6,Math.min(1.6,(y-P.y1)/(P.y0-P.y1)));let r=P.R1+(P.R0-P.R1)*t+EN;if(y>yd)r*=Math.sqrt(Math.max(0,1-((y-yd)/(P.yT-yd))**2));return r;};
  const i0=Math.max(0,Math.floor((P.cx-Rmax-V.ox)/B)),i1=Math.min(V.NX-1,Math.floor((P.cx+Rmax-V.ox)/B)),k0=Math.max(0,Math.floor((P.cz-Rmax-V.oz)/B)),k1=Math.min(V.NZ-1,Math.floor((P.cz+Rmax-V.oz)/B));
  const j0=Math.max(0,Math.floor((P.yB-3*B-V.oy)/B)),j1=Math.min(V.NY-1,Math.floor((P.yT+2*B-V.oy)/B));
  for(let k=k0;k<=k1;k++){const cz=V.oz+(k+.5)*B,dz=cz-P.cz;
    for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,dx=cx-P.cx,r=Math.hypot(dx,dz);if(r>Rmax)continue;
      for(let j=j0;j<=j1;j++){const cy=V.oy+(j+.5)*B,ra=rAt(cy),dg=Math.hypot(dx,cy-P.gy,dz);
        if(r>ra*1.09+2*B||r<P.rp*.82-2*B||dg<P.rg*.96-2*B)continue; // (sûrement de la roche, loin de toute paroi)
        const n=grtRoche(cx,cy,cz),mW=ra*(1+.09*n)-r,mP=r-P.rp*(1+.18*n),mG=dg-P.rg*(1+.04*(grtN3(cx/20,cy/20,cz/20,4)*2-1)),mF=cy-P.yB,mS=Math.min(mW,mP,mG,mF);
        let m=mS;if(mS>0&&cy<P.yW+B)m=Math.min(m,cy-P.yW); // le bassin : sa surface à yW
        const c=grtCh(V,i>>4,j>>4,k>>4),o=(i&15)|((j&15)<<4)|((k&15)<<8),A=V.pool[c],DN=V.dn[c],qq=((i&15)>>2)|(((j&15)>>2)<<2)|(((k&15)>>2)<<4);
        if(V.si[c][qq]<0){V.si[c][qq]=qm;V.sd[c][qq]=1e9;}if(qm<V.chS[c])V.chS[c]=qm;
        if(A[o]===1)continue; // (l'air de la route garde sa densité : la spirale n'est jamais refermée)
        const dv=Math.max(-127,Math.min(127,Math.round(m*K)));if(dv>DN[o])DN[o]=dv;
        if(m>0){A[o]=1;V.nAir++;}else if(mS>0&&cy<P.yW)A[o]=5;}}}}
/* LES LACS : sous le niveau, dans la portée du lac (l'échantillon le plus proche), la densité devient celle d'une surface PLATE au niveau — la
   lave (ou l'eau) est le dessus de ce « sol » ; ses cases sont marquées 4 (5) pour la collision et la matière */
function grtLacs(V,R){const LA=GROTTE.lacs||[],EA=GROTTE.eaux||[],B=V.B,K=GRT.K;if(!LA.length&&!EA.length)return;let yMax=-1e9;for(const l of LA.concat(EA))yMax=Math.max(yMax,l.y);yMax+=2*B; /* (AU HASARD) un lac par salle de lave, un d'eau par grotte luxuriante */
  for(let c=0;c<V.pool.length;c++){const d=V.cle[c],cj=((d/V.CX)|0)%V.CY,y0=V.oy+cj*16*B;if(y0>yMax)continue;const A=V.pool[c],DN=V.dn[c],SI=V.si[c];
    /* (AU HASARD) les échantillons de route qui peuvent passer dans ce tronçon (en plan à moins de RH + B + 10 m, en hauteur dans sa tranche) : une liste courte, souvent vide */
    let CD=null;if(GRT_HZ){const C9=16*B,x0=V.ox+(d%V.CX)*C9,z0=V.oz+((d/(V.CX*V.CY))|0)*C9,lm=ROAD_HALF+B+10;CD=[];
      for(let a9=Math.floor((x0-lm)/48);a9<=Math.floor((x0+C9+lm)/48);a9++)for(let b9=Math.floor((z0-lm)/48);b9<=Math.floor((z0+C9+lm)/48);b9++){const L8=R.G.get(a9+','+b9);if(!L8)continue;
        for(const q of L8){const Y=R.Y[q];if(Y+36<y0-B||Y-THICK-14>Math.min(y0+C9,yMax)+B)continue;if(R.X[q]<x0-lm||R.X[q]>x0+C9+lm||R.Z[q]<z0-lm||R.Z[q]>z0+C9+lm)continue;CD.push(q);}}}
    for(let o=0;o<4096;o++){if(DN[o]<=0)continue;const j=(o>>4)&15,cy=y0+(j+.5)*B,q=SI[((o&15)>>2)|((j>>2)<<2)|(((o>>8)>>2)<<4)];if(q<0)continue;const S=R.S[q];
      let L9=null,lv=false;for(const l of LA)if(S>=l.s0&&S<=l.s1){L9=l;lv=true;break;}if(!L9)for(const l of EA)if(S>=l.s0&&S<=l.s1){L9=l;break;}if(!L9||cy>L9.y+2*B)continue;
      if(CD&&CD.length){const x=V.ox+(((d%V.CX)*16+(o&15))+.5)*B,z=V.oz+(((d/(V.CX*V.CY)|0)*16+(o>>8))+.5)*B,lm=ROAD_HALF+B+10;let pres=false;
        for(const q of CD){if((R.X[q]-x)**2+(R.Z[q]-z)**2>lm*lm)continue;if(!(cy-B>R.Y[q]+36||cy+B<R.Y[q]-THICK-14)){pres=true;break;}}if(pres)continue;} /* (AU HASARD, banc du 20/10) une route qui repasse PLUS BAS sous la salle d'un lac
        (le tire-bouchon, une salle qui revient) : la case la plus proche d'un échantillon d'en haut se remplissait de lave sur elle — jamais près d'une route */
      const dv=Math.max(-127,Math.round((cy-L9.y)*K));if(dv<DN[o])DN[o]=dv;if(cy<L9.y&&A[o]===1){A[o]=lv?4:5;V.nAir--;}}}}
/* LES PILIERS (après les lacs) : des colonnes de BASALTE qui sortent de la lave jusqu'à la voûte, des COLONNES de concrétion (en sablier) dans la
   cathédrale — loin de toutes les routes (règle d'or), dans l'air de la salle. La densité les refait roche (la physique = l'image). */
function grtPiliers(V,R,fr,DC){const L9=[],B=V.B,K=GRT.K,VZ=GRT_VASTE,H9=VZ?560:260,SG=R.segs; // (GROTTE VASTE : plus nombreux, plus gros, dans toute la largeur des salles)
  /* une liste de piliers par tronçon de salle (au hasard une salle peut venir deux fois) ; DC (LE DÉCOR AU HASARD) : combien de colonnes dans la
     cathédrale, de piliers de basalte dans la lave ; puis (LA PORTE, un module) deux piliers de part et d'autre de la route */
  const T9=[];for(const [k,nb,ra,rb] of VZ?[['stal',11,14,14],['lave',16,18,16]]:[['stal',6,9,9],['lave',9,12,11]])for(const sg of SG[k]||[])T9.push([k,sg[0],sg[2],DC?(k==='stal'?DC.stal.col:DC.lave.pil):nb,ra,rb]);
  for(const [k,s0,s1,nb,ra,rb] of T9){if(s0==null||s1==null)continue;
    let n=0;for(let e=0;e<nb*12&&n<nb;e++){const q=R.i0+((fr()*(R.n-R.i0-20))|0);if(R.S[q]<s0+60||R.S[q]>s1-60)continue;
      const sd=fr()<.5?-1:1,lat=ROAD_HALF+48+fr()*(VZ?Math.max(110,R.RH[q]*.75):110),x=R.X[q]+R.TZ[q]*sd*lat,z=R.Z[q]-R.TX[q]*sd*lat,y=R.Y[q],r=ra+fr()*rb;
      if(grtIci(V,x,y,z)!==1||!grtLibre(R,x,z,-1e9,1e9,r+8))continue;
      if(grtPilier(V,L9,x,y,z,r,k,H9,R))n++;}}
  for(const s9 of R.portes||[]){let q=R.i0;while(q<R.n-21&&R.S[q]<s9)q++;const r=VZ?22:12; /* LA PORTE : les deux piliers du goulet, au plus près de la route */
    const rL=r*1.25+2*B; /* (la marge : la bosse du bruit et l'interpolation des cases de 12 m — banc du 20/10 : à r + 8, une graine sur 72 mordait le bord de la route) */
    for(const sd of [-1,1])for(let lat=ROAD_HALF+rL+12;lat<ROAD_HALF+rL+90;lat+=6){const x=R.X[q]+R.TZ[q]*sd*lat,z=R.Z[q]-R.TX[q]*sd*lat;
      if(grtIci(V,x,R.Y[q],z)!==1||!grtLibre(R,x,z,-1e9,1e9,rL))continue;if(grtPilier(V,L9,x,R.Y[q],z,r,'porte',H9,R))break;}}
  return L9;}
function grtPilier(V,L9,x,y,z,r,k,H9,R){const B=V.B,K=GRT.K;{
      let yb=y,yt=y;while(yb>y-H9&&grtIci(V,x,yb-B,z)===1)yb-=B;while(yt<y+H9&&grtIci(V,x,yt+B,z)===1)yt+=B;
      if(yt-yb<40)return false;yb-=B*1.5;yt+=B*1.5;
      const R9=r*1.3+2*B,i0=Math.floor((x-R9-V.ox)/B),i1=Math.floor((x+R9-V.ox)/B),k0=Math.floor((z-R9-V.oz)/B),k1=Math.floor((z+R9-V.oz)/B),j0=Math.floor((yb-V.oy)/B),j1=Math.floor((yt-V.oy)/B);
      for(let j=j0;j<=j1;j++){const cy=V.oy+(j+.5)*B,u=(cy-yb)/(yt-yb),rr=k==='stal'?r*(1-.42*Math.sin(Math.PI*Math.max(0,Math.min(1,u)))):r*(1+.25*(grtN3(x/9,cy/14,z/9,8)-.5));
        for(let kk=k0;kk<=k1;kk++)for(let i=i0;i<=i1;i++){const cx=V.ox+(i+.5)*B,cz=V.oz+(kk+.5)*B,dd=Math.hypot(cx-x,cz-z);if(dd>rr+2*B)continue;
          const c=V.dir[(i>>4)+V.CX*((j>>4)+V.CY*(kk>>4))];if(c<0)continue;const o=(i&15)|((j&15)<<4)|((kk&15)<<8),dv=Math.round((dd-rr)*K);
          if(dv<V.dn[c][o])V.dn[c][o]=Math.max(-127,dv);if(dd<rr&&V.pool[c][o]===1){V.pool[c][o]=0;V.nAir--;}}}
      let ly=null;if(k==='lave'&&GROTTE.lacs){let bd=1e18;for(const l of GROTTE.lacs){const d=Math.abs(l.y-(yb+B*1.5));if(d<bd){bd=d;ly=l.y;}}} /* le lac à son pied */
      L9.push({x:x,z:z,r:r*1.3+B,yb:yb,yt:yt,k:k,ly:ly});return true;}}
/* ---------------- LA LUMIÈRE CUITE ----------------
   Canal 1 (aL.x) : les TORCHES (rayon 45 m). Canal 2 (aL.yzw, ×2 dans le shader) : la LUMIÈRE DU LIEU — l'air de la salle (GRT_AMB), la lave
   (par en dessous, elle décroît en 38 m), l'eau, la géode (en 70 m), et les lumières ponctuelles (baies, chutes de lave, capteurs, âmes, gemmes).
   Chaque tronçon a sa liste (`grtLumListes`) : un sommet ne regarde que les lumières qui peuvent l'atteindre. */
const GRT_GEOC0=[.62,.28,1.0]; /* la lumière de la géode d'améthyste (celle d'avant) */
const GRT_AMB=[[.30,.19,.10],[.13,.38,.24],[.24,.10,.40],[.34,.24,.14],[.30,.09,.045],[.04,.15,.20]]; // (banc 18/10 : au tiers, les grandes salles étaient noires au-delà de la lanterne)
function grtLumListes(V,T9,P9){const M=new Map(),C=16*V.B;
  const add=function(o,r,cle){const i0=Math.floor((o.x-r-V.ox)/C),i1=Math.floor((o.x+r-V.ox)/C),j0=Math.floor((o.y-r-V.oy)/C),j1=Math.floor((o.y+r-V.oy)/C),k0=Math.floor((o.z-r-V.oz)/C),k1=Math.floor((o.z+r-V.oz)/C);
    for(let k=Math.max(0,k0);k<=Math.min(V.CZ-1,k1);k++)for(let j=Math.max(0,j0);j<=Math.min(V.CY-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(V.CX-1,i1);i++){
      const d=i+V.CX*(j+V.CY*k);let a=M.get(d);if(!a)M.set(d,a={t:[],p:[]});a[cle].push(o);}};
  for(const o of T9)add(o,GRV.torR,'t');for(const o of P9)add(o,o.r,'p');return M;}
function grtLum(x,y,z,sal,LL,out){
  const a=GRT_AMB[sal]||GRT_AMB[0],ka=sal?GRV.amb:1;let t=0,r=a[0]*ka,g=a[1]*ka,b=a[2]*ka;
  if(LL){for(const o of LL.t){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<GRV.tR2)t+=1.3/(1+d2/GRV.tF)*(1-d2/GRV.tR2);}
    for(const o of LL.p){const dx=x-o.x,dy=y-o.y,dz=z-o.z,d2=dx*dx+dy*dy+dz*dz;if(d2<o.r2){let k=1-d2/o.r2;k*=k*o.I;r+=o.c[0]*k;g+=o.c[1]*k;b+=o.c[2]*k;}}}
  if(!GRT_HZ){
  const lac=GROTTE.lac;if(lac&&sal>=3&&y>lac.y-8){const k=(sal===4?1.65:.9)*Math.exp(-Math.max(0,y-lac.y)/(sal===4?GRV.lavL:38));r+=1.0*k;g+=.32*k;b+=.055*k;}
  const e=GROTTE.eau;if(e&&sal===1&&y>e.y-8){const k=.6*Math.exp(-Math.max(0,y-e.y)/16);r+=.04*k;g+=.22*k;b+=.26*k;}}
  else{ /* (AU HASARD) chaque lac de lave éclaire sa salle et celles où il déborde ; chaque lac d'eau, sa grotte luxuriante */
    for(const l of GROTTE.lacs)if(y>l.y-8&&(sal===4||l.vois.indexOf(sal)>=0)){const k=(sal===4?1.65:.9)*Math.exp(-Math.max(0,y-l.y)/(sal===4?GRV.lavL:38));r+=1.0*k;g+=.32*k;b+=.055*k;}
    if(sal===1)for(const e of GROTTE.eaux)if(y>e.y-8){const k=.6*Math.exp(-Math.max(0,y-e.y)/16);r+=.04*k;g+=.22*k;b+=.26*k;}}
  const P=GROTTE.puits;if(P&&sal===2){const gc=GROTTE.geoC||GRT_GEOC0,dg=Math.hypot(x-P.cx,y-P.gy,z-P.cz)-P.rg,k=1.4*Math.exp(-Math.max(0,dg)/GRV.geoL);r+=gc[0]*k;g+=gc[1]*k;b+=gc[2]*k; /* gc : la teinte de la géode (LE DÉCOR AU HASARD) */
    const kw=.55*Math.exp(-Math.max(0,y-P.yW)/22);r+=.10*kw;g+=.24*kw;b+=.42*kw;}
  out[0]=Math.min(1,t);out[1]=Math.min(2,r);out[2]=Math.min(2,g);out[3]=Math.min(2,b);}
/* ---------------- LA SURFACE À FACETTES (surface nets) ----------------
   Sur les centres des cases : un SOMMET par cube dont les 8 coins changent de signe (la moyenne des points où ses arêtes traversent la
   paroi), un QUAD par arête qui traverse (les 4 cubes autour). Les facettes se voient par le shader (normale de la facette, dérivées). Par
   sommet : la matière (roche, lave, eau, améthyste, basalte, concrétion, magma), la salle, l'OCCLUSION (la part de roche dans les 4 × 4 × 4
   cases autour : les creux s'assombrissent, les arêtes s'éclairent) et la lumière cuite. Un tronçon lit une bordure de 2 cases chez ses voisins. */
const GRT_ARETES=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
const GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null};
function grtTampons(){const T=GRT_TMP;if(!T.loc){T.loc=new Float32Array(20*20*20);T.vid=new Int32Array(17*17*17);const NV=40000;T.P=new Float32Array(NV*3);T.F=new Uint8Array(NV*4);T.Lt=new Uint8Array(NV*4);T.I=new Uint32Array(NV*6);}return T;}
const GT={ROCHE:0,LAVE:1,EAU:2,AMETHYSTE:3,BOIS:4,FLAMME:5,CRISTAL:6,BAIE:7,FEUILLE:8,FLEUR:9,CONCRETION:10,BASALTE:11,SCULK:12,CAPTEUR:13,BRIQUE:14,AME:15,DIAMANT:16,OR:17,MAGMA:18};
function grtMatieres(x,y,z,sal,lv){ // la matière d'un sommet de la roche (lv : un coin voisin est de la lave 4 ou de l'eau 5)
  const lac=GROTTE.lac,eau=GROTTE.eau,P=GROTTE.puits;
  if(!GRT_HZ){if(lv===4&&lac&&Math.abs(y-lac.y)<3.5)return GT.LAVE;if(lv===5&&((eau&&Math.abs(y-eau.y)<3.5)||(P&&Math.abs(y-P.yW)<3.5)))return GT.EAU;}
  else{if(lv===4)for(const l of GROTTE.lacs)if(Math.abs(y-l.y)<3.5)return GT.LAVE;if(lv===5){for(const l of GROTTE.eaux)if(Math.abs(y-l.y)<3.5)return GT.EAU;if(P&&Math.abs(y-P.yW)<3.5)return GT.EAU;}}
  if(P&&sal===2){if(Math.hypot(x-P.cx,y-P.gy,z-P.cz)<P.rg+12)return GT.AMETHYSTE;if(Math.hypot(x-P.cx,z-P.cz)<P.rp*1.3+10)return GT.BASALTE;}
  if((sal===3||sal===4)&&GROTTE.piliers)for(const c of GROTTE.piliers)if((x-c.x)**2+(z-c.z)**2<c.r*c.r&&y>c.yb-8&&y<c.yt+8)return c.k==='stal'?GT.CONCRETION:(c.ly!=null&&y<c.ly+14?GT.MAGMA:GT.BASALTE);
  if(sal===4&&!GRT_HZ&&lac&&y<lac.y+9)return GT.MAGMA; // le rivage rougeoie
  if(sal===4&&GRT_HZ)for(const l of GROTTE.lacs)if(y<l.y+9&&y>l.y-90)return GT.MAGMA; /* (au hasard : le rivage de SON lac, s'il y en a deux) */
  return GT.ROCHE;}
function grtMailleNets(V,c,LL){
  const T=grtTampons(),d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,I0=ci*16,J0=cj*16,K0=ck*16,B=V.B,lum=T.lum,loc=T.loc,vid=T.vid,R=GROTTE.R;
  // 1 · les densités du tronçon et de sa bordure (−2 … 17)
  for(let k=0;k<20;k++)for(let j=0;j<20;j++)for(let i=0;i<20;i++)loc[i+20*(j+20*k)]=grtD(V,I0+i-2,J0+j-2,K0+k-2);
  const L=function(i,j,k){return loc[(i+2)+20*((j+2)+20*(k+2))];};
  // 2 · les sommets (cubes −1 … 15)
  vid.fill(-1);let nv=0;const MAXV=39990,cv=new Float32Array(8);
  for(let cc=-1;cc<16&&nv<MAXV;cc++)for(let b=-1;b<16&&nv<MAXV;b++)for(let a=-1;a<16;a++){
    let m=0;for(let q=0;q<8;q++){const v=L(a+(q&1),b+((q>>1)&1),cc+((q>>2)&1));cv[q]=v;if(v>0)m|=1<<q;}
    if(m===0||m===255)continue;
    let sx=0,sy=0,sz=0,ne=0;
    for(let e=0;e<12;e++){const q0=GRT_ARETES[e][0],q1=GRT_ARETES[e][1],v0=cv[q0],v1=cv[q1];if((v0>0)===(v1>0))continue;const t=v0/(v0-v1);
      sx+=(q0&1)+((q1&1)-(q0&1))*t;sy+=((q0>>1)&1)+(((q1>>1)&1)-((q0>>1)&1))*t;sz+=((q0>>2)&1)+(((q1>>2)&1)-((q0>>2)&1))*t;ne++;}
    const lx=(a+.5+sx/ne)*B,ly=(b+.5+sy/ne)*B,lz=(cc+.5+sz/ne)*B,wx=V.ox+I0*B+lx,wy=V.oy+J0*B+ly,wz=V.oz+K0*B+lz;
    // la normale (vers l'air), l'occlusion, la salle, la matière
    const gx=(cv[1]+cv[3]+cv[5]+cv[7])-(cv[0]+cv[2]+cv[4]+cv[6]),gy=(cv[2]+cv[3]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[4]+cv[5]),gz=(cv[4]+cv[5]+cv[6]+cv[7])-(cv[0]+cv[1]+cv[2]+cv[3]),gl=Math.hypot(gx,gy,gz)||1;
    let roc=0;for(let z9=-1;z9<=2;z9++)for(let y9=-1;y9<=2;y9++)for(let x9=-1;x9<=2;x9++)if(L(a+x9,b+y9,cc+z9)<=0)roc++;
    let sal=0,lv=0;{let q9=-1;for(let q=0;q<8&&q9<0;q++){if(cv[q]<=0)continue;const ii=I0+a+(q&1),jj=J0+b+((q>>1)&1),kk=K0+cc+((q>>2)&1),ch=V.dir[(ii>>4)+V.CX*((jj>>4)+V.CY*(kk>>4))];
        if(ch>=0)q9=V.si[ch][((ii&15)>>2)|(((jj&15)>>2)<<2)|(((kk&15)>>2)<<4)];}
      if(q9>=0&&R)sal=R.SAL[q9];
      for(let q=0;q<8&&!lv;q++){const p=grtLit(V,I0+a+(q&1),J0+b+((q>>1)&1),K0+cc+((q>>2)&1));if(p===4||p===5)lv=p;}}
    const p3=nv*3,p4=nv*4;T.P[p3]=lx;T.P[p3+1]=ly;T.P[p3+2]=lz;
    T.F[p4]=grtMatieres(wx,wy,wz,sal,lv);T.F[p4+1]=sal;T.F[p4+2]=Math.round(Math.max(.3,Math.min(1,1.28-roc/64))*255);T.F[p4+3]=0;
    grtLum(wx+gx/gl*1.5,wy+gy/gl*1.5,wz+gz/gl*1.5,sal,LL,lum);T.Lt[p4]=lum[0]*255;T.Lt[p4+1]=lum[1]*127.5;T.Lt[p4+2]=lum[2]*127.5;T.Lt[p4+3]=lum[3]*127.5;
    vid[(a+1)+17*((b+1)+17*(cc+1))]=nv++;}
  // 3 · les quads : chaque arête (points 0 … 15 du tronçon) qui traverse la paroi — tournés vers l'air
  let ni=0;const V9=function(a,b,cc){return vid[(a+1)+17*((b+1)+17*(cc+1))];};
  for(let cc=0;cc<16;cc++)for(let b=0;b<16;b++)for(let a=0;a<16;a++){const v0=L(a,b,cc),s0=v0>0;
    for(let ax=0;ax<3;ax++){const v1=ax===0?L(a+1,b,cc):ax===1?L(a,b+1,cc):L(a,b,cc+1);if((v1>0)===s0)continue;
      let q0,q1,q2,q3;
      if(ax===0){q0=V9(a,b-1,cc-1);q1=V9(a,b,cc-1);q2=V9(a,b,cc);q3=V9(a,b-1,cc);}
      else if(ax===1){q0=V9(a-1,b,cc-1);q1=V9(a-1,b,cc);q2=V9(a,b,cc);q3=V9(a,b,cc-1);}
      else{q0=V9(a-1,b-1,cc);q1=V9(a,b-1,cc);q2=V9(a,b,cc);q3=V9(a-1,b,cc);}
      if(q0<0||q1<0||q2<0||q3<0||ni+6>T.I.length)continue;
      if(s0){T.I[ni++]=q0;T.I[ni++]=q1;T.I[ni++]=q2;T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q3;}
      else{T.I[ni++]=q0;T.I[ni++]=q2;T.I[ni++]=q1;T.I[ni++]=q0;T.I[ni++]=q3;T.I[ni++]=q2;}}}
  /* 4 · UNE MATIÈRE PAR FACETTE : les sommets sont dédoublés par triangle et la facette prend la matière de la majorité de ses coins (le numéro
     de matière interpolé sur un triangle à cheval passait par toutes les matières entre les deux : un liseré arc-en-ciel le long des bords —
     banc du 18/10). La lumière et l'occlusion restent celles des coins (fondues sur la facette). */
  const nt=ni/3,P=new Float32Array(nt*9),F=new Uint8Array(nt*12),Lt=new Uint8Array(nt*12);
  for(let t=0;t<nt;t++){const a=T.I[t*3],b=T.I[t*3+1],c9=T.I[t*3+2],ma=T.F[a*4],mb=T.F[b*4],mc=T.F[c9*4],mt=(ma===mb||ma===mc)?ma:(mb===mc?mb:(ma||mb||mc));
    for(let k=0;k<3;k++){const v=k===0?a:k===1?b:c9,o=t*3+k;P[o*3]=T.P[v*3];P[o*3+1]=T.P[v*3+1];P[o*3+2]=T.P[v*3+2];
      F[o*4]=mt;F[o*4+1]=T.F[v*4+1];F[o*4+2]=T.F[v*4+2];F[o*4+3]=mt===GT.AMETHYSTE?(GROTTE.geoW|0):0;Lt[o*4]=T.Lt[v*4];Lt[o*4+1]=T.Lt[v*4+1];Lt[o*4+2]=T.Lt[v*4+2];Lt[o*4+3]=T.Lt[v*4+3];}}
  return {P:P,F:F,L:Lt,I:null,nv:nt*3,nt:nt};}
/* LES DÉCORS : des FORMES low-poly (prismes à n pans qui s'affinent, boîtes orientées, octaèdres), rangées par tronçon, dessinées dans la même
   matière que la roche (matière, lumière cuite à leurs coins). Les grosses entrent aussi dans les COLLISIONS (boîtes orientées, grille de 64 m). */
function grtRange(D,V,x,y,z,f){const C=16*V.B,d=Math.floor((x-V.ox)/C)+V.CX*(Math.floor((y-V.oy)/C)+V.CY*Math.floor((z-V.oz)/C));let a=D.get(d);if(!a)D.set(d,a=[]);a.push(f);}
function grtCol(x,y,z,hx,hy,hz,yaw,k){const G=GROTTE.col,cs=Math.cos(yaw||0),sn=Math.sin(yaw||0),rx=Math.abs(cs)*hx+Math.abs(sn)*hz,rz=Math.abs(sn)*hx+Math.abs(cs)*hz,o={x:x,y:y,z:z,hx:hx,hy:hy,hz:hz,c:cs,s:sn,k:k};
  for(let i=Math.floor((x-rx)/64);i<=Math.floor((x+rx)/64);i++)for(let j=Math.floor((z-rz)/64);j<=Math.floor((z+rz)/64);j++){const k9=i+','+j;let L9=G.G.get(k9);if(!L9)G.G.set(k9,L9=[]);L9.push(o);}G.n++;}
function grtBoite(D,V,x,y,z,hx,hy,hz,t,yaw,col){grtRange(D,V,x,y,z,['b',x,y,z,hx,hy,hz,t,yaw||0]);if(col)grtCol(x,y,z,hx,hy,hz,yaw,col);}
function grtPrisme(D,V,x,y,z,dir,n,r0,r1,h,t,rot,col){ // la base au point, l'axe dir (unitaire), n pans, rayon r0 → r1 (0 : une pointe)
  grtRange(D,V,x,y,z,['p',x,y,z,dir[0],dir[1],dir[2],n,r0,r1,h,t,rot||0]);
  if(col){const m=Math.max(r0,r1)*.8;grtCol(x+dir[0]*h/2,y+dir[1]*h/2,z+dir[2]*h/2,Math.abs(dir[0])*h/2+m,Math.abs(dir[1])*h/2+m,Math.abs(dir[2])*h/2+m,0,col);}}
function grtOcta(D,V,x,y,z,r,h,t,rot){grtRange(D,V,x,y,z,['o',x,y,z,r,h,t,rot||0]);}
function grtMailleDecor(V,c,L9,LL,sal){ // les formes d'un tronçon → triangles {P (mètres du tronçon),F,L,I}
  const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,C=16*V.B,ox=V.ox+ci*C,oy=V.oy+cj*C,oz=V.oz+ck*C,lum=GRT_TMP.lum;
  const P=[],F=[],Lt=[],I=[];
  const sommet=function(x,y,z,nx,ny,nz,t){grtLum(x+nx*.8,y+ny*.8,z+nz*.8,sal,LL,lum);P.push(x-ox,y-oy,z-oz);F.push(t&31,sal,255,t>>5);Lt.push(lum[0]*255,lum[1]*127.5,lum[2]*127.5,lum[3]*127.5);return P.length/3-1;};
  const tri=function(a,b,c9){I.push(a,b,c9);};
  const nrm=function(a,b,c9){const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c9[0]-a[0],c9[1]-a[1],c9[2]-a[2]],n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],l=Math.hypot(n[0],n[1],n[2])||1;return [n[0]/l,n[1]/l,n[2]/l];};
  const face=function(Q,t){const n=nrm(Q[0],Q[1],Q[2]),ix=Q.map(function(p){return sommet(p[0],p[1],p[2],n[0],n[1],n[2],t);});tri(ix[0],ix[1],ix[2]);if(ix.length>3)tri(ix[0],ix[2],ix[3]);};
  for(const f of L9){
    if(f[0]==='b'){const x=f[1],y=f[2],z=f[3],h=[f[4],f[5],f[6]],t=f[7],cs=Math.cos(f[8]),sn=Math.sin(f[8]);
      const w=function(q){const lx=q[0]*h[0],ly=q[1]*h[1],lz=q[2]*h[2];return [x+lx*cs+lz*sn,y+ly,z-lx*sn+lz*cs];};
      for(const Q of [[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],
        [[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]])face(Q.map(w),t);}
    else if(f[0]==='p'){const x=f[1],y=f[2],z=f[3],dv=[f[4],f[5],f[6]],n=f[7],r0=f[8],r1=f[9],h=f[10],t=f[11],rot=f[12];
      const ref=Math.abs(dv[1])<.9?[0,1,0]:[1,0,0];let u=[dv[1]*ref[2]-dv[2]*ref[1],dv[2]*ref[0]-dv[0]*ref[2],dv[0]*ref[1]-dv[1]*ref[0]];const ul=Math.hypot(u[0],u[1],u[2]);u=[u[0]/ul,u[1]/ul,u[2]/ul];
      const v=[dv[1]*u[2]-dv[2]*u[1],dv[2]*u[0]-dv[0]*u[2],dv[0]*u[1]-dv[1]*u[0]];
      const anneau=function(r,hh){const A=[];for(let k=0;k<n;k++){const a=rot+k/n*6.2832,ca=Math.cos(a)*r,sa=Math.sin(a)*r;A.push([x+u[0]*ca+v[0]*sa+dv[0]*hh,y+u[1]*ca+v[1]*sa+dv[1]*hh,z+u[2]*ca+v[2]*sa+dv[2]*hh]);}return A;};
      const A0=anneau(r0,0),A1=r1>.01?anneau(r1,h):null,tip=[x+dv[0]*h,y+dv[1]*h,z+dv[2]*h];
      for(let k=0;k<n;k++){const k2=(k+1)%n;if(A1)face([A0[k],A1[k],A1[k2],A0[k2]],t);else face([A0[k],tip,A0[k2]],t);}
      if(A1)for(let k=0;k<n;k++)face([tip,A1[(k+1)%n],A1[k]],t);
      for(let k=0;k<n;k++)face([[x,y,z],A0[k],A0[(k+1)%n]],t);}
    else{const x=f[1],y=f[2],z=f[3],r=f[4],h=f[5],t=f[6],cs=Math.cos(f[7]),sn=Math.sin(f[7]); // l'octaèdre (une gemme, une baie, un buisson)
      const pt=[[x+r*cs,y,z-r*sn],[x-r*sn,y,z-r*cs],[x-r*cs,y,z+r*sn],[x+r*sn,y,z+r*cs]],H=[x,y+h,z],Bs=[x,y-h,z];
      for(let k=0;k<4;k++){const a=pt[k],b=pt[(k+1)%4];face([a,H,b],t);face([a,b,Bs],t);}}}
  const nv=P.length/3;return {P:new Float32Array(P),F:new Uint8Array(F),L:new Uint8Array(Lt),I:nv<65536?new Uint16Array(I):new Uint32Array(I),nv:nv};}
