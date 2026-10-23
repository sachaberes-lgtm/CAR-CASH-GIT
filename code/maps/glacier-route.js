/* <<<BANQUISE>>> */
/* ======================= LA BANQUISE — LA DESCENTE DES PICS DE GLACE (2026-10-14, Sacha : « fais une nouvelle map en mode banquise, mais
   genre la route dévale une montagne au-dessus du sol, avec d'immenses pics de glace partout ; on peut faire des traces dans la poudreuse
   en frôlant le sol, mais on meurt si on va trop profondément ; et on doit pouvoir glisser de manière ultra stylée sur les lacs gelés et
   les pics de glace pas trop abrupts » · « fais une map absolument magnifique, bien sûr ») =======================
   Une montagne de glace à l'échelle de CASH CAR : le ruban de route DÉVALE la pente (7 à 14 %, et trois ou quatre CASSURES à 25-28 % où la
   caisse décolle), suspendu 10 à 45 m au-dessus d'un manteau de neige poudreuse ; tout autour, des PICS DE GLACE à facettes, des dômes
   où l'on glisse jusqu'aux aiguilles de 400 m et aux géants de 1 km qui ferment l'horizon.
   · LA ROUTE (`genBanq`) : un slalom GÉANT (grandes courbes R 260-500 m × l'échelle du moteur, des schuss où l'on voit loin dans la
     descente) ; la pente ne remonte JAMAIS ; les CASSURES (`BANQ.cas`) : 140 m de replat puis 220 m à 25-28 % — la caisse lancée décolle
     au-dessus de la poudreuse et des lacs gelés posés en contrebas.
   · LA POUDREUSE (`banqSol`, la neige sous la route) : on peut y DESCENDRE. Frôlée (le dessous de la caisse dans le premier mètre), elle
     laisse une TRACE (`BK_TR`, une tranchée bleue bordée de deux bourrelets qui scintillent) et lève une GERBE ; vite et à plat, la caisse
     SURFE dessus (la poudre porte) ; plus on s'enfonce, plus elle freine — et au-delà de `BK_PH.prof` (2,4 m) on y reste : 'poudreuse'.
   · LA GLACE (`banqSolVol`) : les FLANCS DES PICS (`BANQ.pics`, des pyramides de glace dont chaque facette est un vrai plan) : touchés à un angle pas
     trop abrupt, on GLISSE — la glace ne retient presque rien, la pente accélère, le volant fait DÉRIVER la caisse (elle tourne plus que
     sa trajectoire), une facette trop raide (> 60°) ou un choc de face, c'est 'glace'. Un pic fini en arête est un TREMPLIN.
   · REVENIR SUR LA ROUTE : cabrer (pouce / ↓) transforme l'élan en montée ; le contact (glace ou neige) RECHARGE la jauge d'air ; arrêté
     dans la neige plus de 2,6 s sans nitro, la montagne te ramène sur ta route (comme la mer de la jade : la chaîne seule est perdue).
   · LE DÉCOR : les pics en trois familles (glisse près de la route, aiguilles, géants à l'horizon — ceux-là gardent leur silhouette dans la
     brume : `BK_PIC_FS` LOIN), la brume de vallée, les AURORES BORÉALES la nuit (`BANQ.fx.aur`), la NEIGE
     qui tombe et le BLIZZARD (`BANQ.fx.flo`), la poussière de diamant au soleil (`BANQ.fx.dd`).
   · LES MÉTÉOS (`SF_CARTES.banquise`, `BK_MET`, `BIOMES.banq*`) : MATIN (alpenglow rose), MIDI (le bleu profond, la glace turquoise), SOIR
     (les pics s'embrasent), NUIT (les aurores, la lune, la glace qui reflète le vert), NEIGE, BLIZZARD.
   · LA LUMIÈRE : des ShaderMaterial (0 programme compilé en course : `banqChauffe` au menu, aucune lumière ajoutée) qui relisent chaque
     image les couleurs de bioApply ; les PHARES de la caisse éclairent neige et glace (`bPhare`).
   Console : `dbgBanq()` (comptes, temps), `dbgBanq('meteo','nuit')`, `dbgBanq('vue',{p,c,fov})`, `dbgBanq('pic',{d,h})`,
   `dbgBanq('poudre',{h,v})` (la caisse lâchée au-dessus de la poudreuse). Lancer : `?carte=banquise&meteo=nuit`. */
const NIV_BANQ={id:'banquise',nm:'LE GLACIER',bio:['banqMidi'],planete:0,espace:0,pluie:0,cielMusical:false,route:.34,sheen:.16,piste:'banquise',pr:'TOUTE LA ROUTE EST VERGLACEE'};
const BANQ={root:null,file:[],fi:0,Q:null,cas:[],sol:null,solM:null,pics:[],picG:null,met:'midi',cur:null,de:null,to:null,k:1,dur:1,ms:0,msSol:0,n:{},fx:{},mats:null,graine:0,
  sur:0,glisse:false,pou:false,heurt:'',mort:'',dNow:9,tNow:0,nS:new THREE.Vector3(0,1,0),drift:0,gT:0,pT:0,fT:0,lent:0,figs:{},son:{t:4},yRaz:true,boucles:{}};
// LES MÉTÉOS DE LA BANQUISE — el : hauteur de la lumière (°) · spark : la neige qui scintille · dd : la poussière de diamant · neige : la neige
// qui tombe (0-1) · vent · aur : les aurores · alp/alpC : l'alpenglow (le haut des pics qui rougit) · ice : la teinte de la glace · mist/mC :
// la brume de vallée · phare : les phares sur la neige · lune : la lumière vient de la lune · sons : la voix du vent
const BK_MET={
  matin:{el:9,spark:1.15,dd:.9,neige:0,vent:.3,aur:0,alp:.85,alpC:[1,.50,.62],ice:[.86,1,1.06],mist:.6,mC:[.98,.80,.84],phare:.05,lune:0,sons:'jour'},
  midi: {el:47,spark:1,dd:.35,neige:0,vent:.35,aur:0,alp:0,alpC:[1,.8,.7],ice:[1,1,1],mist:.25,mC:[.62,.74,1],phare:0,lune:0,sons:'jour'},
  soir: {el:5,spark:.9,dd:.45,neige:0,vent:.4,aur:.06,alp:1.25,alpC:[1,.40,.30],ice:[1.06,.90,.96],mist:.65,mC:[1,.60,.55],phare:.4,lune:0,sons:'soir'},
  nuit: {el:30,spark:.75,dd:.2,neige:0,vent:.3,aur:1,alp:0,alpC:[.5,.6,1],ice:[.70,1,.95],mist:.55,mC:[.05,.12,.15],phare:1,lune:1,sons:'nuit'},
  neige:{el:40,spark:.15,dd:0,neige:.7,vent:.6,aur:0,alp:0,alpC:[1,.8,.8],ice:[.92,.96,1.06],mist:.95,mC:[.70,.74,.90],phare:.5,lune:0,sons:'neige'},
  blizzard:{el:40,spark:0,dd:0,neige:1,vent:2.6,aur:0,alp:0,alpC:[1,.8,.8],ice:[.82,.90,1.02],mist:1,mC:[.56,.62,.78],phare:.85,lune:0,sons:'blizzard'}};
const BK_U={uSunDir:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uFillC:{value:new THREE.Color()},uFillD:{value:new THREE.Vector3(0,-1,0)},uCam:{value:new THREE.Vector3()},uCarP:{value:new THREE.Vector3(0,-1e5,0)},
  uCarF:{value:new THREE.Vector3(0,0,1)},uTime:{value:0},uPhare:{value:0},uFlash:{value:0},uSpark:{value:1},uAlp:{value:0},uAlpC:{value:new THREE.Color(1,.5,.6)},
  uAur:{value:0},uAurC:{value:new THREE.Color(.25,1,.62)},uAurC2:{value:new THREE.Color(.75,.30,1)},uIceT:{value:new THREE.Vector3(1,1,1)},uMistC:{value:new THREE.Color(.8,.88,1)},
  uMistK:{value:.3},uMistY:{value:0},uNeige:{value:0},uDD:{value:0},uVent:{value:.3},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uHazeC:{value:new THREE.Color(.7,.8,.95)},uHazeK:{value:.00028},uHazeM:{value:.8}};
const BK_LUNE=new THREE.Vector3(-.52,.40,-.72).normalize(); // la lune du dôme (cielLune)
// LA PHYSIQUE DE LA NEIGE ET DE LA GLACE (unités de fallVel ; la position avance de fallVel·SPD) — réglée au banc dbgBanq
//  prof : la profondeur qui tue · kN : la neige qui tasse (freine la vitesse vers le bas) · flot/H : la poudre qui porte (×g, sur H m)
//  kT/kTp : la traînée au ras / enfoncé · vPl/lift : le PLANING (vite, la caisse surfe) · nyMin : facette trop raide (> 60°) · vnMort/sinMax :
//  le choc de face qui tue · frG : la glace qui retient (presque rien) ·
//  grip : la part du volant qui tourne la trajectoire sur la glace (le reste fait DÉRIVER la caisse) · colle : la marge qui garde la glisse ·
//  rameneT/rameneV : arrêté plus de rameneT s sous rameneV, la montagne te ramène
const BK_PH={prof:2.4,kN:16,flot:2.3,H:1.4,kT:.6,kTp:2.2,vPl:70,lift:0,nyMin:.5,vnMort:105,sinMax:.88,frG:.03,grip:.42,colle:.9,rameneT:1.4,rameneV:60};
/* (2026-10-18, Sacha : « on s'enfonce dans la neige, ça ralentit beaucoup, mais ça tue pas ») la neige HORS de la piste, en vol : plus de PLANING (lift ,0 — au banc,
   une caisse sortie en vol touchait le bourrelet à 200 km/h, la poudre la relançait à 47 m et elle mourait « trop longtemps en l'air »), elle FREINE fort
   (kT ,10 → ,6, kTp ,75 → 2,2) et la montagne te ramène plus tôt (1,4 s sous 60, au lieu de 2,2 s sous 40). */
try{Object.assign(PAL.B,{banqSolC:[40,36,34],banqMarge:[1300,1500,1700],banqPics:[.55,.8,1],banqFlo:[700,1400,2400],banqDD:[160,300,500],
  banqPoudre:[260,400,520],banqTrace:[500,800,1100],banqLoin:[.5,.75,1]});}catch(e){}
function PAL_BK(k,d){return PAL_B9(k,d);}
/* ---------------- LA ROUTE : LA DESCENTE DU GLACIER ----------------
   (2026-10-15, Sacha : « fais une map qui descend beaucoup plus, mais sans module bizarre : la route doit juste faire une descente normale
   avec des virages et tout, mais toute la route doit être verglacée ; fais la route un peu plus large ».)
   Les SPIRALES superposées, leurs chicanes et les CASSURES (le replat puis le mur à 36 %) sont parties : la route DÉVALE la ligne de pente
   en grands virages enchaînés — gauche, droite, parfois deux du même côté, de 30 à 110° — entre deux droites où l'on voit loin. La pente
   ne remonte jamais : 17 à 28 % (≈ 22 % de moyenne, ~1,9 km de dénivelé sur ~9 km — l'ancienne en faisait 1,2). Le cap reste à moins de
   75° de la pente : la route ne se recroise pas. Toute la route est VERGLACÉE (bkVerglasPose) : les rayons gardent la marge du verglas
   (le volant ne mord qu'à BK_VG.grip) — 115 m × l'échelle du palier au plus serré, soit 1,8 × le rayon tenable sur le sec.
   La largeur : `BK_LARG4` × ROAD_HALF0 (2,0 partout ailleurs). `BANQ.cas` et `BANQ.spi` restent (vides) pour les bancs. */
/* ================= LE GLACIER v4 — LA PISTE DE GLACE (2026-10-17, Sacha : « en fait, dans la map montagne, on ne met même plus de route. Ça doit
   juste être une grande piste de glace — plus de neige, plus de route —, avec des pics de glace qu'il faut éviter, et plusieurs chemins ; une piste
   descendante le long d'une montagne, des pics de glace autour et un peu de neige pour décorer, sur les côtés, sur les obstacles ; il faut descendre la
   piste comme une piste de ski, mais sur de la glace : la voiture drifte, elle est compliquée à contrôler ; et de petits tremplins de glace, une sorte de
   petit rebord, qui permettent au joueur de s'envoler — sinon il ne peut pas décoller ») =================
   · LA PISTE : le ruban reste (la physique, les pièces, la caméra), mais il est LARGE (`BK_LARG4` : 196 m — 123 m avant le 2e tour) et il n'a plus rien d'une route — ni béton,
     ni rails, ni nappe, ni ligne, ni tranche (`bkPisteNue`) : seule la GLACE (le verglas de bkVerglasPose, opaque, sur toute la largeur, sa frange de
     givre fondue dans la neige). Plus raide (58-88 %, ~70 % de moyenne — « beaucoup plus pentue », Sacha, deux fois : voir BK_PENTE4) et à grands rayons (≥ 2,6 demi-largeurs : le bord intérieur ne se replie jamais).
   · SES BORDS : la neige se cale AU RAS de la glace puis monte en BOURRELET (13-19 m sur 45 m) — on ne tombe plus de la piste, on COGNE la neige :
     le mur des couloirs du canyon (`murCote`, coup d'épaule ; mort au-delà de ~30° et 200 km/h). Plus de lacs (ils creusaient la piste).
     (2026-10-18) PLUS DE MUR : LA CONGÈRE — 16 m de neige profonde où l'on s'enfonce et ralentit, sans mourir (voir bkCongere).
   · LES PICS SUR LA PISTE (`BANQ.obst`) : des cristaux de glace coiffés de neige, en QUATRE FIGURES qui ouvrent des chemins — la FOURCHE (une arête au
     milieu : deux couloirs), le CHAMP (des pics semés), la PORTE (deux géants, une trouée), l'ÎLOT (un massif d'un côté, le large de l'autre). Au sol,
     les toucher = L'IMPACT (`banqPisteHeurt` → impPic) ; en vol, ils sont dans la physique des pics (banqSurf : on glisse sur les doux, on se fracasse sur
     les raides).
   · LES BECS DE GLACE (`BANQ.kick`) — (2026-10-18) devenus de vrais TREMPLINS (voir BK_BEC) : un petit rebord de glace sur une partie de la largeur ; passé dessus au-dessus de 70 km/h, on S'ENVOLE (startFall,
     la poussée suit la vitesse) — souvent juste avant un champ de pics, pour le survoler.
   · LA GLISSE : un cran de plus (grip ,92 → ,86, dérive ,16 → ,21) — et la brume de vallée descend (on VOIT la montagne dévaler sous soi).
   */
/* (2026-10-17 nuit, Sacha : « la route de glace doit être beaucoup plus large et la map de glace doit être beaucoup plus pentue ») — 2e tour :
   la piste 123 → 196 m (`BK_LARG4` 4,4 → 7) ; la pente 36-58 % → 58-88 % (`BK_PENTE4` : [virage, +hasard, droite, +hasard, retour dans la pente,
   arrivée]). La caméra de course s'incline toujours avec la piste (gelée) : la pente se lit au paysage qui plonge et à l'horizon qui monte. */
/* (2026-10-18, Sacha : « je t'ai dit 100 fois de faire la map plus pentue, genre 40-50 degrés ») — 3e tour : BK_PENTE4 est une PENTE (tangente),
   pas un angle : 58-88 % ne faisait que 30-41°. Désormais 40-50° pour de vrai : virages tan 42-46° (,92-1,04), droites tan 46-51° (1,05-1,22) ;
   lissée aux raccords, la piste fait 43° de moyenne et 49-50° au plus (mesuré sur 16 pistes ; avant : 33° et 40°). LEN ×,75 (au lieu de ,89) :
   la même longueur de course en 3D (~9,5-10,5 km). */
const BK_LARG4=7,BK_PENTE4=[.92,.12,1.05,.17,.90,.72];
const BK_HASARD=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacierhasard(,|&|$)/.test(location.search);
const BK_MODULES=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glaciermodules(,|&|$)/.test(location.search); /* (2026-10-20) SIX MODULES (voir bkGodille) — `?sans=glaciermodules` = le paquet d'avant (slalom, grand S, double) */
const BK_DECOR=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacierdecor(,|&|$)/.test(location.search); /* (2026-10-20) LE DÉCOR AU HASARD (voir bkDecoTire) — `?sans=glacierdecor` = le décor d'avant, au tirage près */ // (2026-10-19) LE GLACIER AU HASARD (voir genBanq) — `?sans=glacierhasard` = la descente d'avant, à l'identique
function genBanq(rnd){
  const ctrl=[];CAMPM.length=0;MODMARK.length=0;
  ROAD_HALF=ROAD_HALF0*BK_LARG4; // la PISTE : 123 m, puis 196 m (« beaucoup plus large »)
  let P=new THREE.Vector3(0,0,0),phi=0,sC=0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi)),push=()=>ctrl.push(P.clone());
  const segs=[],note=(l,g,ty)=>{segs.push([sC,sC+l,g,ty||0]);sC+=l;};                       // le profil, tronçon par tronçon : [s0, s1, pente, type]
  const D=(l,g,ty)=>{const nn=Math.max(2,Math.round(l/60));for(let k=0;k<nn;k++){P.addScaledVector(dir(),l/nn);push();}note(l,g,ty);};
  const A=(aDeg,R,g,ty)=>{const nn=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),a=aDeg*Math.PI/180,st=a/nn,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<nn;k++){phi+=st/2;P.addScaledVector(dir(),ch);phi+=st/2;push();}note(R*Math.abs(a),g,ty);};
  const Q={},ici=k=>{Q[k]={p:P.clone(),phi:phi};};
  const LV=Math.min(3.2,typeof lvPiste==='function'?lvPiste():1),cas=[],spi=[];
  const KR=typeof rayonPalier==='function'?Math.max(1,rayonPalier()/63):LV; // (GAMEPLAY, RACCOURCIS.md) les rayons suivent le rayon tenable du palier (rayonPalier/63) ; sans lui, l'échelle du moteur
  const cap=a=>{phi=Math.atan2(Math.sin(phi),Math.cos(phi));const d=Math.atan2(Math.sin(a-phi),Math.cos(a-phi))*57.2958;if(Math.abs(d)>2)A(d,Math.max(ROAD_HALF*2.6,(140+rnd()*40)*KR),BK_PENTE4[4]);}; // (v4) le bord intérieur d'une piste large ne se replie jamais // se remettre dans la pente (phi = 0 : la ligne de pente, +z)
  const LIB=75*Math.PI/180,LC9=longueurCible(),LEN=LC9?Math.max(1800,(LC9-560)*.75):8600*Math.min(1.25,Math.sqrt(KR))*.75; /* (LA DURÉE DES MAPS) au JOUER : la longueur visée, à plat, moins le départ et l'arrivée */ // (2026-10-17 nuit) LEN se compte À PLAT : la pente du 2e tour allongeait la piste de 13 % — on garde la même course ; (2026-10-18, 3e tour à 45°) ×,75 au lieu de ,89
  const rh=BK_HASARD?mulberry32((rnd()*4294967296)>>>0):null; // (2026-10-19, LE GLACIER AU HASARD) son flux à lui
  push();ici('depart');D(rh?140+rh()*220:260,.10);
  let sg=rnd()<.5?-1:1;
  /* LES MODULES DU GLACIER (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). Du SKI, rien de bizarre (v3, Sacha : « une descente normale
     avec des virages ») ; ils prennent la place d'un virage + droite tous les ~0,35-0,65 km, paquet mélangé, jamais deux fois de suite :
       bkSlalom · LE SLALOM GÉANT : 4-5 portes — des virages alternés de 45-65° séparés de 20-45 m, une demi-porte pour entrer et pour sortir
       bkEsse   · LE GRAND S : deux virages opposés de 60-80° et une courte droite entre — le premier part vers la ligne de pente
       bkDouble · LE DOUBLE VIRAGE : deux appuis du même côté (le second 15 % plus serré), 95-120° en tout, pris d'un bord de la pente à l'autre
     Le cap reste à moins de LIB de la pente (la route ne se recroise jamais), rayons ≥ 2 demi-largeurs, pentes de BK_PENTE4 ; tirés dans `rm`
     (un seul `rnd` de plus). (2e tour, Sacha : « presque pas de virages » au glacier) avec les modules, les virages de la boucle de base sont aussi
     30 % plus grands en angle (jusqu'à 125°, toujours bornés par LIB) et 28 % plus serrés (plancher 2 demi-largeurs au lieu de 2,6 : 196 m pour
     une piste de 196 — le bord intérieur ne se replie toujours pas, et c'est 1,7 × le rayon tenable sur le verglas), les droites entre eux 65 % plus courtes. */
  const rm=MODC_ON?mulberry32((rnd()*4294967296)>>>0):null;
  const bkR=f=>Math.max(ROAD_HALF*2,f*KR*.8),bkGV=()=>BK_PENTE4[0]+rm()*BK_PENTE4[1],bkGD=()=>BK_PENTE4[2]+rm()*BK_PENTE4[3];
  const bkVers=h=>{phi=Math.atan2(Math.sin(phi),Math.cos(phi));const d=(h-phi)*57.2958;if(Math.abs(d)>2)A(d,bkR(200+rm()*40),BK_PENTE4[4]);}; // se mettre au cap h (radians, depuis la pente)
  const bkSlalom=()=>{const n=4+((rm()*2)|0),a=45+rm()*20,R=bkR(250+rm()*50);if(Math.abs(phi)>LIB-a/57.3*.6)bkVers(0);
    let s9=phi>0?-1:1;A(s9*a*.5,R,bkGV());for(let k=0;k<n;k++){s9=-s9;A(s9*a,R,bkGV());D(20+rm()*25,bkGD());}s9=-s9;A(s9*a*.5,R,bkGV());};
  const bkEsse=()=>{const a=Math.min(60+rm()*20,70+Math.abs(Math.atan2(Math.sin(phi),Math.cos(phi)))*57.2958),R=bkR(240+rm()*60),s9=phi>0?-1:1;A(s9*a,R,bkGV());D(30+rm()*30,bkGD());A(-s9*a,R,bkGV());D(60+rm()*60,bkGD());};
  const bkDouble=()=>{const T=95+rm()*25,s9=phi>0?-1:1,a1=T*(.5+rm()*.1),R=bkR(260+rm()*50);bkVers(-s9*T/2/57.2958); // on part du bord opposé
    A(s9*a1,R,bkGV());D(20+rm()*20,bkGD());A(s9*(T-a1),Math.max(ROAD_HALF*2.6,R*.85),bkGV());D(60+rm()*60,bkGD());};
  /* ===== TROIS MODULES DE PLUS (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
     Le paquet passe de 3 à 6 sortes, toujours du ski (même tirage `rm`, mélangé, jamais deux fois de suite) — `?sans=glaciermodules` = le paquet d'avant :
       bkGodille · LA GODILLE : 6-8 petits virages alternés de 22-32°, sans une droite — le rythme, pas l'appui
       bkBosses  · LES BOSSES : dans la ligne de pente, 4-6 creux et bosses (la pente alterne 0,55-0,65 / 1,25-1,35 tous les 45-65 m) — on s'allège
       bkCrochet · LE CROCHET : une longue traversée en biais (50-65°, 120-200 m), puis un seul virage SERRÉ (rayon plancher) de 95-120° vers l'autre bord
     Le cap reste dans LIB (le crochet finit à moins de 70° de la pente), les pentes ne remontent jamais, les rayons ≥ 2 demi-largeurs. */
  const bkGodille=()=>{const n=6+((rm()*3)|0),a=22+rm()*10,R=bkR(200+rm()*30);if(Math.abs(phi)>LIB-a/57.3)bkVers(0);let s9=phi>0?-1:1;A(s9*a*.5,R,bkGV());
    for(let k=0;k<n;k++){s9=-s9;A(s9*a,R,bkGV());}s9=-s9;A(s9*a*.5,R,bkGV());D(40+rm()*40,bkGD());};
  const bkBosses=()=>{bkVers((rm()-.5)*.3);const n=4+((rm()*3)|0);for(let k=0;k<n;k++){D(45+rm()*20,.55+rm()*.1);D(45+rm()*20,1.25+rm()*.1);}D(40+rm()*30,bkGD());};
  const bkCrochet=()=>{const s9=phi>0?-1:1,a0=50+rm()*15;bkVers(s9*a0/57.2958);D(120+rm()*80,bkGD());A(-s9*Math.min(95+rm()*25,a0+62),bkR(150),bkGV());D(60+rm()*60,bkGD());};
  const bkJ=BK_MODULES?[bkSlalom,bkEsse,bkDouble,bkGodille,bkBosses,bkCrochet]:[bkSlalom,bkEsse,bkDouble],bkPaq=[];let bkLast=-1,bkNext=700+(rm?rm()*300:0);
  const bkTire=()=>{for(let e=0;e<6;e++){if(!bkPaq.length){const t=bkJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rm()*(i+1))|0,x=t[i];t[i]=t[j];t[j]=x;}for(const x of t)bkPaq.push(x);}
    const m=bkPaq.shift();if(m===bkLast)continue;return m;}return 0;};
  let AXE=0;const PLAN=[];
  if(!rh){ // la descente d'avant (`?sans=glacierhasard`), à l'identique — au hasard : plus bas
  while(sC<LEN){
    if(rm&&sC>bkNext&&sC<LEN-700){const m=bkTire(),i9=ctrl.length-1;bkLast=m;bkJ[m]();MODMARK.push({i0:i9,i1:ctrl.length-1});bkNext=sC+350+rm()*300;continue;} // LES MODULES DU GLACIER (voir bkSlalom)
    if(rnd()<.78)sg=-sg;                                                                    // le plus souvent on change de côté ; parfois deux virages du même
    const big=rnd()<.3,a=big?70+rnd()*40:30+rnd()*40,R=Math.max(ROAD_HALF*2.6,(big?220+rnd()*140:175+rnd()*150)*KR); // (v4) grands rayons : la piste fait 196 m (le plancher 2,6 demi-largeurs l'emporte souvent)
    let lib=(LIB-sg*phi)*57.2958;if(lib<20){sg=-sg;lib=(LIB-sg*phi)*57.2958;}               // le cap reste dans la pente : la route ne se recroise jamais
    A(sg*Math.min(rm?Math.min(125,a*1.3+10):a,lib),rm?Math.max(ROAD_HALF*2,R*.72):R,BK_PENTE4[0]+rnd()*BK_PENTE4[1]);
    D((rm?.35:1)*(50+rnd()*140),BK_PENTE4[2]+rnd()*BK_PENTE4[3]);} // (v4) une piste NOIRE : 40-50° (2026-10-18, 3e tour — c'était 30-41°, puis 20-30°, et 12-20° avant)
  }else{
  /* LE GLACIER AU HASARD (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») — la graine changeait, pas la RECETTE :
     260 m plein nord, le même S d'ouverture (à un miroir près), puis des lacets qui descendent droit vers le nord (40 graines au palier 0 : écart de
     forme 0,14, l'arrivée entre −17° et +33° du nord, aucun repère). Désormais, dans son flux à lui (`rh`) :
     · L'AXE DE LA MONTAGNE, ±90° autour du nord : la descente se dessine dans son repère (la pente vers +z), puis la montagne entière TOURNE (AXE) — le
       manteau de neige, les pics, la congère, les tremplins se posent autour de la piste : ils tournent avec elle ; les aurores aussi (`BANQ.axe`) ;
       jamais face au soleil bas (il est au sud : ±90° lui laisse 67° au moins) ;
     · le départ (140-360 m), puis une suite de TRONÇONS, chacun son CARACTÈRE, jamais deux fois le même de suite — le premier fait l'OUVERTURE :
         `lacets`   · les virages serrés enchaînés (la descente d'avant) ;
         `courbes`  · de grandes courbes (R 420-800 m × le palier) entre de longues lignes ;
         `traverse` · la piste coupe la pente en biais (44-58°) sur 200-420 m, puis repart de l'autre côté : la trace en Z des skieurs ;
         `schuss`   · tout droit dans la ligne de pente, à la pente la plus raide, un ou deux coudes doux ;
       les MODULES (bkSlalom, bkEsse, bkDouble) s'intercalent entre eux, comme avant.
     · GARDÉS : la butée de cap (75° autour de l'axe : la piste avance toujours, elle ne se recroise jamais), les rayons (≥ 2 demi-largeurs, les
       grands virages ≥ 2,6), les pentes de BK_PENTE4, la longueur (LEN) ; et un essai dont deux bouts de piste (à plus de 700 m de piste l'un de
       l'autre) passent à moins de 440 m en plan est repris (6 essais au plus) — avant : 455 m au plus près.
     (Les lacets SUPERPOSÉS du 14/10, et leurs raccourcis, ne reviennent pas : Sacha les a ôtés le 15/10 — « sans module bizarre ».) */
    AXE=(rh()-.5)*Math.PI;
    const TR9=['lacets','courbes','traverse','schuss'],vers9=(h,R)=>{phi=Math.atan2(Math.sin(phi),Math.cos(phi));const d=(h-phi)*57.2958;if(Math.abs(d)>2)A(d,R,BK_PENTE4[4]);},
      gV=()=>BK_PENTE4[0]+rh()*BK_PENTE4[1],gD=()=>BK_PENTE4[2]+rh()*BK_PENTE4[3];
    const e0={n:ctrl.length,g:segs.length,m:MODMARK.length,P:P.clone(),phi:phi,sC:sC,sg:sg,bkNext:bkNext,bkLast:bkLast,paq:bkPaq.slice()};
    const pres=()=>{let m=1e9;const S9=[0];for(let k=1;k<ctrl.length;k++)S9.push(S9[k-1]+Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z)); // le plus près que passent deux bouts de piste (≥ 700 m de piste entre eux)
      for(let i=0;i<ctrl.length;i++)for(let j=i+1;j<ctrl.length;j++){if(S9[j]-S9[i]<700)continue;const d=Math.hypot(ctrl[i].x-ctrl[j].x,ctrl[i].z-ctrl[j].z);if(d<m)m=d;}return m;};
    for(let e=0;e<6;e++){
      if(e){ctrl.length=e0.n;segs.length=e0.g;MODMARK.length=e0.m;P.copy(e0.P);phi=e0.phi;sC=e0.sC;sg=e0.sg;bkNext=e0.bkNext;bkLast=e0.bkLast;bkPaq.length=0;for(const x9 of e0.paq)bkPaq.push(x9);PLAN.length=0;}
      let tP='';
      while(sC<LEN){
        if(rm&&tP&&sC>bkNext&&sC<LEN-700){const m=bkTire(),i9=ctrl.length-1;bkLast=m;bkJ[m]();MODMARK.push({i0:i9,i1:ctrl.length-1});PLAN.push(['module'+m,0]);bkNext=sC+350+rm()*300;continue;} // LES MODULES DU GLACIER (voir bkSlalom)
        let t=TR9[(rh()*4)|0];if(t===tP)t=TR9[(TR9.indexOf(t)+1+((rh()*3)|0))%4];tP=t;
        const s0=sC,lg=Math.min(LEN-sC+120,(420+rh()*560)*Math.sqrt(KR));
        if(t==='lacets'){while(sC-s0<lg&&sC<LEN){if(rh()<.78)sg=-sg;const a=30+rh()*45,R=Math.max(ROAD_HALF*2,(175+rh()*150)*KR*.72);
            let lib=(LIB-sg*phi)*57.2958;if(lib<20){sg=-sg;lib=(LIB-sg*phi)*57.2958;}A(sg*Math.min(a*1.3+10,125,lib),R,gV());D(.35*(50+rh()*140),gD());}}
        else if(t==='courbes'){while(sC-s0<lg&&sC<LEN){if(rh()<.85)sg=-sg;const a=45+rh()*50,R=Math.max(ROAD_HALF*2.6,(420+rh()*380)*KR);
            let lib=(LIB-sg*phi)*57.2958;if(lib<20){sg=-sg;lib=(LIB-sg*phi)*57.2958;}A(sg*Math.min(a,lib),R,gV());D(60+rh()*100,gD());}}
        else if(t==='traverse'){let sd=Math.abs(phi)>.3?-Math.sign(phi):(rh()<.5?-1:1);
          for(let k=0;k<2&&sC-s0<lg&&sC<LEN;k++){vers9(sd*(44+rh()*14)/57.2958,Math.max(ROAD_HALF*2.6,(260+rh()*80)*KR));D(200+rh()*220,gD());sd=-sd;}}
        else{vers9((rh()-.5)*.2,Math.max(ROAD_HALF*2.6,(260+rh()*80)*KR));const n9=1+((rh()*2)|0);
          for(let k=0;k<n9;k++){D(130+rh()*170,BK_PENTE4[2]+BK_PENTE4[3]);const a=(rh()<.5?-1:1)*(10+rh()*12),lib=(LIB-Math.sign(a)*phi)*57.2958;if(lib>Math.abs(a)+5)A(a,Math.max(ROAD_HALF*3,600*KR),gV());}
          D(80+rh()*120,BK_PENTE4[2]+BK_PENTE4[3]);}
        PLAN.push([t,Math.round(sC-s0)]);}
      BANQ.pres=Math.round(pres());BANQ.essais=e+1;if(BANQ.pres>=440)break;}
  }
  cap(0);D(160,BK_PENTE4[5]);ici('fin');D(120,.06); // l'arrivée : dans la pente, puis le replat de la ligne
  /* LE PROFIL : la pente de chaque tronçon (positive = on descend), lue sur la longueur de la polyligne, adoucie aux raccords (moyenne glissante
     de 60 m) ; les 300 premiers mètres en douceur. Intégrée tous les 10 m : aucun point ne remonte. */
  let acc=0;const sOf=[0];for(let k=1;k<ctrl.length;k++){acc+=Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z);sOf.push(acc);}
  const kS=acc/Math.max(1,sC); // la polyligne (cordes) est un peu plus courte que les arcs nominaux
  const brut=s9=>{const u=s9/kS;let lo=0,hi=segs.length-1;while(lo<hi){const m=(lo+hi)>>1;if(segs[m][1]<u)lo=m+1;else hi=m;}return segs[lo][2];};
  const pente=s9=>{let g=0;for(let q=-3;q<=3;q++)g+=brut(Math.max(0,s9+q*10));g/=7;if(s9<300)g=.06+(g-.06)*THREE.MathUtils.smoothstep(s9,180,300);return Math.max(.05,g);};
  let y=0;ctrl[0].y=0;
  for(let k=1;k<ctrl.length;k++){const a=sOf[k-1],b=sOf[k],n=Math.max(1,Math.ceil((b-a)/10));for(let j=0;j<n;j++){const s9=a+(b-a)*(j+.5)/n;y-=pente(s9)*(b-a)/n;}ctrl[k].y=y;}
  for(const k in Q){const o=Q[k];let bi=0,bd=1e18;for(let j=0;j<ctrl.length;j++){const d=(ctrl[j].x-o.p.x)**2+(ctrl[j].z-o.p.z)**2;if(d<bd){bd=d;bi=j;}}o.p.y=ctrl[bi].y;}
  if(AXE){const c9=Math.cos(AXE),s9=Math.sin(AXE); // (2026-10-19, LE GLACIER AU HASARD) la montagne dessinée face à +z TOURNE EN BLOC autour du départ
    for(const v of ctrl){const x9=v.x*c9+v.z*s9;v.z=v.z*c9-v.x*s9;v.x=x9;}for(const k in Q){const o=Q[k],x9=o.p.x*c9+o.p.z*s9;o.p.z=o.p.z*c9-o.p.x*s9;o.p.x=x9;o.phi+=AXE;}}
  BANQ.axe=AXE;BANQ.plan=rh?PLAN.map(function(o){return o[0]+(o[1]?':'+o[1]:'');}):null;
  BANQ.Q=Q;BANQ.cas=cas.map(function(x){return x*kS;});BANQ.spi=spi.map(function(o){return Object.assign(o,{s0:o.s0*kS,s1:o.s1*kS});});
  return ctrl;
}
/* ---------------- LE MANTEAU DE NEIGE : LA MONTAGNE SOUS LA ROUTE ----------------
   Une grille (26-36 m selon le palier) : pour chaque case, la distance à la route (d) et la hauteur de la route LISSÉE autour (noyau de
   ~130 m), puis le profil — la neige 10 à 45 m SOUS la dalle (`D0`, en bruit lent : des combes où l'on frôle facilement, des gorges), des
   flancs qui montent de 40 à 120 m au-dessus de la route à 520 m, des arêtes au-delà ; des bosses de poudreuse. Puis une passe de sûreté :
   jamais moins de 7 m d'air sous la dalle.
   (2026-10-14, soir — PILOTAGE : « descends la construction sous ~50 ms ») LA GRILLE v2 : la distance à la route de la grille grossière par
   TRANSFORMÉE DE DISTANCE (le point de route le plus proche voyage de case en case, deux passes : linéaire en cases, au lieu de cases ×
   points de route) ; le bruit seulement là où il compte (D0 sous 540 m, les arêtes au-delà de 420 m, les bosses sous 1 km) ; au-delà de
   `BK_DF` = 1 km, la neige vient de la grille grossière (le loin, sous la brume). Mesuré : 86-133 → voir JOURNAL. */
const BK_DF=1000;
/* ===== LE DÉCOR DU GLACIER, RECALÉ SUR LA PENTE À 45° (2026-10-20, Sacha : « la map montagne neige est super buggée, genre le décor, les montagnes et tout ») =====
   Le manteau de neige et les cristaux dataient de la descente à 7-14 % ; le 3e tour (18/10) l'a mise à 40-50° (mesuré : 103 % de moyenne,
   ~4 km de dénivelé) et trois règles « au plus bas dans un rayon » sont devenues des trous de la hauteur du rayon. MESURÉ au banc (piste de 6 km) :
   · LA SÛRETÉ (la neige jamais au-dessus de la glace) prenait le point de piste le plus BAS à moins de 98 m : la neige sous la glace était à −97 m
     (au lieu de −1,5), et au bord de −60 à +35 m — des fosses et des murs, rendus en roche noire ;
   · `YM` (la neige sous le PLUS BAS des tours superposés, du temps des spirales ôtées le 15/10) abaissait les flancs de ~110 m : une falaise à 228 m
     de l'axe ;
   · le DÉVERS de la piste (le repère de buildTrack roule dans les virages : 7,5° de médiane, 26° au plus, ±40 m aux bords d'une piste de 196 m)
     était ignoré : la neige suivait l'axe, la congère et la glace suivaient le dévers ;
   · les CRISTAUX (bkPrim) enterraient leur base d'une profondeur fixe sous leur CENTRE : côté aval, la base flottait — 43 dômes sur 61, 77 aiguilles
     sur 161, tous les pics de la piste, jusqu'à 360 m de vide ; les géants de l'horizon, au-delà de la neige, montraient leur dessous plat ;
   · la ROCHE noire des pentes raides (le shader de la neige) commençait vers 45° : la pente même de la montagne, partout en taches noires.
   Désormais : la neige proche se cale sur le PLAN de la piste au pied du point le plus proche (sa pente et son dévers, fondu à 130 m), la sûreté
   aussi ; plus de `YM` ; chaque sommet de base d'un cristal descend sous la neige qu'il touche (au-delà de la neige : d'un rayon de base plus bas,
   dans la brume) ; la roche ne vient qu'au-delà de ~55°. `?sans=glacerecale` = avant (même graine : même piste ; les cristaux, eux, tombent ailleurs —
   libre() ne refuse plus les mêmes grappes, et chaque essai refusé consomme le tirage). */
const BK_RECALE=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacerecale(,|&|$)/.test(location.search);
function bkProfil(x,z,d,ys,sd9){
  const W9=70+50*forBruit(x*.43,z*.43,sd9+3);let h;
  if(d<540)h=ys+13+(W9-13)*Math.pow(THREE.MathUtils.smoothstep(d,ROAD_HALF+46,520),1.3); // le BOURRELET puis les flancs : plus de combe sous la piste
  else h=ys+W9;
  if(d>420)h+=38*forBruit(x*.31,z*.31,sd9+5)*THREE.MathUtils.smoothstep(d,420,900);                      // les ARÊTES
  if(d>480)h+=170*Math.max(0,forBruit(x*.13,z*.13,sd9+7)+.25)*THREE.MathUtils.smoothstep(d,480,1500);
  return h;}
function banqSol(){
  const C=PAL_BK('banqSolC',26),MARG=PAL_BK('banqMarge',2200),R1=380,sd9=BANQ.graine*.001,T0=performance.now(),TQ=BANQ.tq={};let tq=T0;const tqm=k=>{const n=performance.now();TQ[k]=Math.round((n-tq)*10)/10;tq=n;};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  x0-=MARG;x1+=MARG;z0-=MARG;z1+=MARG;
  const nx=Math.ceil((x1-x0)/C)+1,nz=Math.ceil((z1-z0)/C)+1,N=nx*nz,D=new Float32Array(N).fill(1e9),WS=new Float32Array(N),YS=new Float32Array(N),YM=new Float32Array(N).fill(1e9),YN=new Float32Array(N).fill(-1e9),YI=new Int32Array(N).fill(-1); // YN (v4) : la hauteur du point de piste le plus proche ; YI (2026-10-20) : son indice (le plan de la piste à son pied)
  const RS=[],pas=Math.max(1,Math.round(12/(L/(NP-1))));for(let i=0;i<NP;i+=pas)RS.push(i);
  // 1. LA GRILLE GROSSIÈRE (4 C) : la transformée de distance — chaque case garde le point de route le plus proche (GI) ; on le propage
  const CG=C*4,gx=Math.ceil((x1-x0)/CG)+1,gz=Math.ceil((z1-z0)/CG)+1,G=gx*gz,GD=new Float32Array(G).fill(1e18),GY=new Float32Array(G),GI=new Int32Array(G).fill(-1);
  for(let q=0;q<RS.length;q++){const p=pts[RS[q]],ic=Math.round((p.x-x0)/CG),jc=Math.round((p.z-z0)/CG);
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const i=ic+a,j=jc+b;if(i<0||j<0||i>=gx||j>=gz)continue;const k=i+j*gx,dx=x0+i*CG-p.x,dz=z0+j*CG-p.z,d=dx*dx+dz*dz;if(d<GD[k]){GD[k]=d;GI[k]=RS[q];}}}
  tqm('graines');const essai=(k,i,j,n)=>{const r=GI[n];if(r<0)return;const p=pts[r],dx=x0+i*CG-p.x,dz=z0+j*CG-p.z,d=dx*dx+dz*dz;if(d<GD[k]){GD[k]=d;GI[k]=r;}};
  for(let tour=0;tour<2;tour++){
    for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){const k=i+j*gx;if(i>0)essai(k,i,j,k-1);if(j>0){essai(k,i,j,k-gx);if(i>0)essai(k,i,j,k-gx-1);if(i<gx-1)essai(k,i,j,k-gx+1);}}
    for(let j=gz-1;j>=0;j--)for(let i=gx-1;i>=0;i--){const k=i+j*gx;if(i<gx-1)essai(k,i,j,k+1);if(j<gz-1){essai(k,i,j,k+gx);if(i<gx-1)essai(k,i,j,k+gx+1);if(i>0)essai(k,i,j,k+gx-1);}}}
  for(let k=0;k<G;k++){GD[k]=Math.sqrt(GD[k]);GY[k]=GI[k]>=0?pts[GI[k]].y:0;}
  for(let it=0;it<5;it++){const T9=GY.slice();for(let j=1;j<gz-1;j++)for(let i=1;i<gx-1;i++){let s9=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)s9+=T9[i+a+(j+b)*gx];GY[i+j*gx]=s9/9;}}
  tqm('transfo');const gBil=(A,x,z)=>{const fx=Math.max(0,Math.min(gx-1.001,(x-x0)/CG)),fz=Math.max(0,Math.min(gz-1.001,(z-z0)/CG)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*gx;
    return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+gx]*(1-u)+A[k+gx+1]*u)*v;};
  // le LOIN : la neige des cases grossières (au-delà de BK_DF, la grille fine ne fait plus que les lire)
  const HF=new Float32Array(G);for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){const k=i+j*gx;HF[k]=GD[k]>BK_DF-260?bkProfil(x0+i*CG,z0+j*CG,GD[k],GY[k],sd9):0;}
  tqm('loin');
  // 2. le noyau fin (≤ R1 du ruban) : distance exacte, hauteur de la route lissée
  const rC=Math.ceil(R1/C),iR=1/(R1*R1);
  for(const ri of RS){const p=pts[ri],ci=Math.round((p.x-x0)/C),cj=Math.round((p.z-z0)/C);
    for(let b=-rC;b<=rC;b++){const j=cj+b;if(j<0||j>=nz)continue;const z=z0+j*C,dz=z-p.z;
      for(let a=-rC;a<=rC;a++){const i=ci+a;if(i<0||i>=nx)continue;const x=x0+i*C,dx=x-p.x,d2=dx*dx+dz*dz;if(d2>R1*R1)continue;const k=i+j*nx;
        if(d2<D[k]){D[k]=d2;YN[k]=p.y;YI[k]=ri;}const u=1-d2*iR,w=u*u*u;WS[k]+=w;YS[k]+=w*p.y;if(d2<14400&&p.y<YM[k])YM[k]=p.y;}}}
  tqm('noyau');
  // 3. chaque case fine
  const H=new Float32Array(N);
  // (2026-10-20, LE DÉCOR RECALÉ) la hauteur du PLAN de la piste au pied du point le plus proche : sa pente (le long) et son dévers (en travers, borné au
  // bord de la congère, fondu par fd) — et non plus la hauteur de son axe (à 45°, le bord d'une piste couchée de 26° est à ±40 m de l'axe). Le point
  // (x, z) = p + T·a + B·l : vus d'en haut, T et B ne sont PAS perpendiculaires (tous deux penchent) — on résout le 2 × 2, pas des produits scalaires
  const plan=(k,x,z,fd)=>{const r=YI[k],p=pts[r],t=T[r],b=B[r],ex=x-p.x,ez=z-p.z,dt=t.x*b.z-t.z*b.x;if(Math.abs(dt)<1e-4)return p.y;
    const a=(ex*b.z-ez*b.x)/dt,l=(t.x*ez-t.z*ex)/dt,lm=ROAD_HALF+40;return p.y+a*t.y+THREE.MathUtils.clamp(l,-lm,lm)*b.y*fd;};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=i+j*nx,x=x0+i*C,z=z0+j*C;let d,ys;
    if(D[k]<1e8){d=Math.sqrt(D[k]);const yc=gBil(GY,x,z),w0=.02;ys=(YS[k]+yc*w0)/(WS[k]+w0);if(!BK_RECALE&&YM[k]<1e8)ys=Math.min(ys,YM[k]+12);}else{ /* (2026-10-20) YM : plus de tours superposés depuis le 15/10 — à 45°, « le plus bas à 120 m » abaissait les flancs de ~110 m */d=Math.max(R1,gBil(GD,x,z));ys=gBil(GY,x,z);} // (le GLACIER) sous des tours superposés, la neige se cale sous le PLUS BAS
    D[k]=d;
    if(d>=BK_DF){H[k]=gBil(HF,x,z);continue;}
    let h=bkProfil(x,z,d,ys,sd9);
    if(d<ROAD_HALF+130&&YN[k]>-1e8){ // LA PISTE : la neige se cale au RAS de la glace (le point de piste le plus proche, pas la moyenne), puis le BOURRELET
      // (2026-10-18) le bourrelet part après la CONGÈRE (bkCongerePose : la bande de neige où l'on roule, 36 m) : jusque-là la grille reste SOUS le ruban — en cases
      // de 34-40 m, sa pente montait jusque dans la piste et y crevait la glace par endroits
      const y0=(BK_RECALE&&YI[k]>=0?plan(k,x,z,1-THREE.MathUtils.smoothstep(d,ROAD_HALF+82,ROAD_HALF+130)):YN[k])-.9,hb=y0+THREE.MathUtils.smoothstep(d,ROAD_HALF+34,ROAD_HALF+82)*(13+6*forBruit(x*.5,z*.5,sd9+9));
      h=d<ROAD_HALF+1?y0-.6:d<ROAD_HALF+82?hb:hb+(Math.max(hb,h)-hb)*THREE.MathUtils.smoothstep(d,ROAD_HALF+82,ROAD_HALF+130);}
    if(d>BK_DF-200)h+=(gBil(HF,x,z)-h)*THREE.MathUtils.smoothstep(d,BK_DF-200,BK_DF);                 // le raccord avec le loin
    const kb=1-THREE.MathUtils.smoothstep(d,700,BK_DF-200);
    if(kb>0)h+=kb*(2.4*forBruit(x*2.7,z*2.7,sd9+1)+(d<500?1.1*forBruit(x*6.1,z*6.1,sd9+2):0));     // les bosses de la poudreuse
    H[k]=h;}
  tqm('cases');
  // LA SÛRETÉ : jamais moins de 7 m d'air sous la dalle (ni sous ses bords, ni sous la caméra qui suit à 14 m)
  if(BK_RECALE){const W9=ROAD_HALF+.5;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=i+j*nx;if(D[k]>=W9||YI[k]<0)continue; // (2026-10-20) sous la glace : le PLAN de la piste au pied, pas le point le plus bas à 98 m (à 45° : 97 m de fosse sous la glace)
    const lim=plan(k,x0+i*C,z0+j*C,1)-.8;if(H[k]>lim)H[k]=lim;}}
  else{const W9=ROAD_HALF+.5,rr=Math.ceil(W9/C);for(let ii=0;ii<NP;ii+=Math.max(1,Math.round(6/(L/(NP-1))))){const p=pts[ii],ci=Math.round((p.x-x0)/C),cj=Math.round((p.z-z0)/C),lim=p.y-.8; // sous la glace : juste sous la surface (la piste EST le sol)
    for(let b=-rr;b<=rr;b++)for(let a=-rr;a<=rr;a++){const i=ci+a,j=cj+b;if(i<0||j<0||i>=nx||j>=nz)continue;const x=x0+i*C,z=z0+j*C;if((x-p.x)**2+(z-p.z)**2>W9*W9)continue;const k=i+j*nx;if(H[k]>lim)H[k]=lim;}}}
  tqm('surete');
  return BANQ.sol={x0:x0,z0:z0,C:C,nx:nx,nz:nz,h:H,d:D,MARG:MARG,gBil:gBil,GY:GY,GD:GD};
}
function bkSolH(x,z){const S=BANQ.sol;if(!S)return -1e9;const fx=Math.max(0,Math.min(S.nx-1.001,(x-S.x0)/S.C)),fz=Math.max(0,Math.min(S.nz-1.001,(z-S.z0)/S.C)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,n=S.nx,A=S.h;
  return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+n]*(1-u)+A[k+n+1]*u)*v;}
function bkSolD(x,z){const S=BANQ.sol;if(!S)return 1e9;const fx=(x-S.x0)/S.C,fz=(z-S.z0)/S.C;if(fx<0||fz<0||fx>S.nx-1.001||fz>S.nz-1.001)return S.gBil(S.GD,x,z);
  const i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,n=S.nx,A=S.d;return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+n]*(1-u)+A[k+n+1]*u)*v;}
/* ---------------- LES PICS DE GLACE : des pyramides dont chaque facette est un VRAI plan ----------------
   Un pic = une grappe de PRIMITIVES (un cristal principal et ses voisins). Une primitive = un sommet A et n sommets de base sur un cercle
   (enterrés), chaque facette (A, Vi, Vi+1) un plan ; la hauteur du cristal en (x, z) = le MIN des plans de ses facettes (le dessus d'un
   polyèdre convexe), la grappe = le MAX de ses cristaux. La physique lit exactement ce que l'on voit : une facette pas trop raide se
   glisse, son arête est un tremplin. */
/* (2026-10-24, Sacha : « des pics de glace mal imbriqués dans le sol, qui dépassent ») L'ANCRAGE : le plus bas des nœuds de la grille sous un disque de rayon r —
   le maillage de la neige est fait de triangles entre ces nœuds, il ne descend jamais plus bas. Un pic dont le pied (le cercle de base, enterré) restait AU-DESSUS
   de ce plancher pendait dans le vide (mesuré au rayon vertical sur le vrai maillage : 7 pics sur 441 flottaient de 1 à 14 m, au bord de la piste et sur les flancs raides). */
function bkSolMin(x,z,r){const S=BANQ.sol;if(!S)return -1e9;let m=1e9;const i0=Math.max(0,Math.floor((x-r-S.x0)/S.C)),i1=Math.min(S.nx-1,Math.ceil((x+r-S.x0)/S.C)),j0=Math.max(0,Math.floor((z-r-S.z0)/S.C)),j1=Math.min(S.nz-1,Math.ceil((z+r-S.z0)/S.C)),r2=(r+S.C)*(r+S.C);
  for(let j=j0;j<=j1;j++){const dz=S.z0+j*S.C-z;for(let i=i0;i<=i1;i++){const dx=S.x0+i*S.C-x;if(dx*dx+dz*dz>r2)continue;const h=S.h[i+j*S.nx];if(h<m)m=h;}}
  return m>1e8?-1e9:m;}
const BK_ANCRE=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacierancre(,|&|$)/.test(location.search);
function bkPrim(x,z,yb,H,R,n,lx,lz,rot,rg,fam,prof){
  const ay=yb+H;let by=yb-(prof||Math.max(8,R*.35)),Rb=R*(ay-by)/H;
  if(BK_ANCRE&&BANQ.sol){for(let it=0;it<6;it++){const g=bkSolMin(x,z,Rb);if(g<-1e8||by<=g-3)break;by=Math.max(g-4,yb-H*4-20);Rb=R*(ay-by)/H;}} /* le pied descend sous le point le plus bas de son emprise (au plus 4 H + 20 m plus bas) ; la pente du cône ne change pas */
  const ax=x+lx,az=z+lz,V=[];
  for(let i=0;i<n;i++){const th=rot+(i+(rg()-.5)*.38)/n*6.2832;V.push([x+Math.cos(th)*Rb,by,z+Math.sin(th)*Rb]);}
  /* (2026-10-20, LE DÉCOR RECALÉ) chaque sommet de base descend SOUS LA NEIGE QU'IL TOUCHE (6 m), et le milieu de chaque arête de base aussi : la base
     suit la pente (à 45°, le côté aval d'une base plate flottait) ; hors de la neige (les géants de l'horizon), un rayon de base plus bas, dans la brume.
     Aucun tirage de plus dans le cristal. La facette aval devient plus raide — la physique lit les mêmes plans (F, by). */
  let bm=by;
  if(BK_RECALE&&BANQ.sol){const MG=BANQ.sol.MARG,sous=(x9,z9)=>bkSolD(x9,z9)<MG?bkSolH(x9,z9)-6:null;
    for(const v of V){const h9=sous(v[0],v[2]);v[1]=Math.min(by,h9!=null?h9:by-Rb);}
    for(let e=0;e<2;e++)for(let i=0;i<n;i++){const a=V[i],b=V[(i+1)%n],h9=sous((a[0]+b[0])/2,(a[2]+b[2])/2);if(h9==null)continue;const ex=(a[1]+b[1])/2-h9;if(ex>0){a[1]-=ex;b[1]-=ex;}}
    for(const v of V)if(v[1]<bm)bm=v[1];}
  const F=new Float32Array(n*4);
  for(let i=0;i<n;i++){const a=V[i],b=V[(i+1)%n];const ux=a[0]-ax,uy=a[1]-ay,uz=a[2]-az,vx=b[0]-ax,vy=b[1]-ay,vz=b[2]-az;
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(ny<0){nx=-nx;ny=-ny;nz=-nz;}const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    F[i*4]=nx;F[i*4+1]=ny;F[i*4+2]=nz;F[i*4+3]=nx*ax+ny*ay+nz*az;}
  return {A:[ax,ay,az],V:V,F:F,n:n,by:bm,yb:yb,H:H,cx:x,cz:z,r:Rb+Math.hypot(lx,lz),r2:(Rb+Math.hypot(lx,lz))**2,fam:fam,sd:rg()};}
function bkPrimH(P,x,z){const F=P.F;let hm=1e9;for(let q=0;q<F.length;q+=4){const y=(F[q+3]-F[q]*x-F[q+2]*z)/F[q+1];if(y<hm)hm=y;}return hm>P.by?hm:-1e9;}
// UNE GRAPPE : `pente` = H/R du cristal principal (≤ 1 : on y glisse ; 2-4 : une aiguille) — des voisins plus petits, penchés vers l'extérieur
function bkGrappe(x,z,yb,H,pente,nv,rg,fam,prof){
  const L9=[],n0=5+((rg()*3)|0),R=H/pente,ln=fam?.12:.06;
  L9.push(bkPrim(x,z,yb,H,R,n0,(rg()-.5)*R*ln,(rg()-.5)*R*ln,rg()*6.28,rg,fam,prof));
  for(let k=0;k<nv;k++){const th=rg()*6.2832,dd=R*(.35+rg()*.55),h=H*(.28+rg()*.42),p=pente*(fam===0?.9+rg()*.5:1+rg()*.6),r=h/p;
    L9.push(bkPrim(x+Math.cos(th)*dd,z+Math.sin(th)*dd,yb,h,r,4+((rg()*3)|0),Math.cos(th)*r*.18,Math.sin(th)*r*.18,rg()*6.28,rg,fam,prof));}
  return L9;}
/* ---------------- LES MATIÈRES (ShaderMaterial : aucune lumière de three, aucun programme qui dépende de la scène) ---------------- */
const BK_LUM=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillC,uFillD,uCam,uCarP,uCarF,uMistC,uAlpC,uAurC,uAurC2,uIceT,uHazeC;',
  'uniform float uTime,uPhare,uFlash,uMistK,uMistY,uSpark,uAlp,uAur,uHazeK,uHazeM;',
  // les PHARES de la caisse : un cône, une portée de ~150 m, une flaque blanche-froide
  'vec3 bPhare(vec3 w,vec3 n){vec3 d=w-uCarP;float l=length(d);d/=max(l,.001);float c=smoothstep(.62,.93,dot(d,uCarF));',
  '  return vec3(.92,.96,1.)*uPhare*c*(2600./(l*l*.10+320.))*(.30+.70*max(dot(n,-d),0.));}',
  // la BRUME DE VALLÉE : elle dort dans les creux, sous la route
  'float bBrume(vec3 w,float dist){return uMistK*smoothstep(uMistY-90.,uMistY-620.,w.y)*(1.-exp(-dist*.0028));}', // la brume de vallée DESCEND : on voit la montagne dévaler sous soi
  // le CIEL qui se reflète (glace, lacs) : le bas = le sol de neige, l'horizon = la brume, le haut = le ciel ; la nuit, les aurores
  'vec3 bCiel(vec3 R){float h=R.y;vec3 c=mix(uGnd*.9+uMistC*.25,uMistC*.7+uSky*.5,smoothstep(-.35,.02,h));c=mix(c,uSky*1.25,smoothstep(.02,.55,h));',
  '  c+=mix(uAurC,uAurC2,smoothstep(.25,.7,h))*uAur*smoothstep(.06,.30,h)*(1.-smoothstep(.55,.95,h))*1.1;return c;}'].join('\n');
/* LA NEIGE : poudreuse, rides du vent (sastrugi), rochers noirs des pentes raides, ombres bleues, ÉTINCELLES (une case sur ~150 s'allume
   quand le soleil, elle et l'œil s'alignent — elles changent quand la caméra bouge, comme la vraie neige), l'alpenglow, les aurores. */
const BK_SOL_VS=['attribute vec2 aS;varying vec3 vW,vN;varying vec2 vS;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normal;vS=aS;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const BK_SOL_FS=[FG_BRUIT,BK_LUM,'varying vec3 vW,vN;varying vec2 vS;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec2 q=vW.xz;vec3 L=uSunDir;',
  '  float f1=1.-smoothstep(160.,700.,dist),f2=1.-smoothstep(20.,120.,dist);',
  // LE RELIEF DE LA NEIGE, en trois échelles (des pentes de bruit, pas de texture) : les DUNES (~40 m), les RIDES du vent (~7 m), le GRAIN (~1,5 m)
  '  float d0=fn2(q*.026),dx=fn2((q+vec2(1.5,0.))*.026)-d0,dz=fn2((q+vec2(0.,1.5))*.026)-d0;vec2 gr=vec2(dx,dz)*(9.5*f1);',
  '  vec2 W=vec2(.83,.56);float ph=dot(q,W)*.85+fn2(q*.045)*7.;gr+=W*cos(ph)*.24*(1.-smoothstep(25.,95.,dist))*(.45+.55*fn2(q*.017));',
  '  if(f2>0.){float g0=fn2(q*.75);gr+=vec2(fn2((q+vec2(.25,0.))*.75)-g0,fn2((q+vec2(0.,.25))*.75)-g0)*1.6*f2;}',
  '  vec3 Np=normalize(N-vec3(gr.x,0.,gr.y));',
  '  float n1=fn2(q*.019),n2=fn2(q*.083),sl=1.-N.y,roc=smoothstep('+(BK_RECALE?'.52,.68':'.40,.56')+',sl+(n1-.5)*.22);', // (2026-10-20) la roche au-delà de ~55° : 45°, c'est la pente même de la montagne
  '  vec3 neige=mix(vec3(.76,.82,.93),vec3(.66,.74,.90),smoothstep(.45,.75,fn2(q*.012)));',                  // la neige soufflée, plus tassée, plus bleue
  '  vec3 pierre=vec3(.065,.075,.12)*(.65+.7*n2);pierre=mix(pierre,neige*.9,smoothstep(.58,.80,fn2(q*vec2(.05,.21)+n1*2.))*.75);',
  '  vec3 alb=mix(neige,pierre,roc);',
  '  float cv=0.;{float b=abs(fract(q.y/170.+fn2(q*.0035)*1.8+fn2(q*.011)*.25)-.5),w=.010+.012*fn2(q*.021);',  // les CREVASSES (Steep) : des fentes bleues en travers de la pente (z = la ligne de pente), par plaques, jamais sur la roche ni les pentes raides
  '   cv=(1.-smoothstep(w*.35,w,b))*smoothstep(.52,.70,fn2(q*.0042+3.7))*(1.-roc)*(1.-smoothstep(.30,.45,sl));}',
  '  alb=mix(alb,vec3(.015,.07,.17),cv);',
  '  float ndl=dot(Np,L),dif=clamp((ndl+.08)/1.08,0.,1.);dif*=dif*(3.-2.*dif);',
  '  vec3 col=alb*(uSky*(.26+.30*Np.y)+uGnd*.08+uSunC*dif*.98+uFillC*max(dot(Np,-uFillD),0.)*.30);',
  '  col+=alb*uSky*(1.-dif)*vec3(.20,.42,.75)*.55*(1.-roc);',                                                // l'OMBRE BLEUE de la neige (le ciel qu'elle diffuse)
  '  col+=alb*uSunC*pow(1.-max(dot(Np,V),0.),4.)*.10*dif;',                                                  // le lustre rasant
  // les ÉTINCELLES : chaque cristal a sa facette (une normale au hasard) ; il s'allume quand le soleil s'y reflète vers l'œil — elles naissent et meurent quand la caméra bouge
  '  float sp=0.;if(f2>0.){vec2 g=q*2.2;vec2 c=floor(g);float h=fh2(c);vec3 nj=normalize(vec3(fh2(c+3.1)-.5,.9,fh2(c+7.7)-.5));',
  '    sp=step(.80,h)*pow(max(dot(reflect(-L,nj),V),0.),70.)*smoothstep(.36,.06,length(fract(g)-.5))*f2;}',
  '  {vec2 g=q*.42;vec2 c=floor(g);float h=fh2(c+5.);vec3 nj=normalize(vec3(fh2(c+1.3)-.5,.8,fh2(c+9.2)-.5));',
  '   sp+=step(.86,h)*pow(max(dot(reflect(-L,nj),V),0.),60.)*smoothstep(.30,.04,length(fract(g)-.5))*smoothstep(60.,140.,dist)*(1.-smoothstep(300.,650.,dist))*.8;}',
  '  sp*=(1.-roc)*uSpark;col+=(uSunC*2.2+vec3(.4,.6,1.)*.3)*sp*2.6+uAurC*sp*uAur*1.2;',
  '  col+=alb*uAlpC*uAlp*dif*.40*smoothstep(-40.,120.,vW.y-uMistY);',                                         // l'alpenglow sur les pentes hautes
  '  col+=alb*mix(uAurC,uAurC2,.3)*uAur*.12*(.4+.6*Np.y);',                                                    // le vert des aurores sur la neige
  '  col+=vec3(.10,.55,.80)*cv*(uSky*.35+uSunC*.12)*(.6+.4*fn2(q*.4));',  // le fond de la crevasse : la glace bleue qui luit
  '  col+=alb*bPhare(vW,Np)*1.1;col+=alb*uFlash*vec3(.8,.85,1.)*1.2;',
  '  col=mix(col,uMistC,bBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LA GLACE DES PICS : des facettes planes (normales plates), une glace BLEUE PROFONDE à la base, TURQUOISE vers les arêtes et le haut ;
   dedans, des FRACTURES qui glissent avec le regard (trois nappes à des profondeurs différentes : la parallaxe fait la profondeur) ;
   le ciel s'y reflète (Fresnel), le soleil allume une facette entière quand elle s'aligne, et la lumière TRAVERSE la glace à contre-jour ;
   les ARÊTES accrochent la lumière (barycentriques) ; la neige poudre les faces douces des aiguilles et des géants ; le givre au pied.
   `LOIN` (les géants de l'horizon) : leur propre brume plafonnée — ils gardent leur silhouette jusqu'au bout du monde. */
const BK_PIC_VS=['attribute vec3 aB;attribute vec4 aP;varying vec3 vW,vN,vB;varying vec4 vP;','#ifndef LOIN','#include <fog_pars_vertex>','#endif',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vB=aB;vP=aP;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;',
  '#ifndef LOIN','#include <fog_vertex>','#endif','}'].join('\n');
const BK_PIC_FS=[FG_BRUIT,BK_LUM,'varying vec3 vW,vN,vB;varying vec4 vP;','#ifndef LOIN','#include <fog_pars_fragment>','#endif',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec3 L=uSunDir;',
  '  float hf=clamp(vP.x,0.,1.),sd=vP.y,fam=vP.z;',
  '  vec3 o=vW*.035+sd*31.;float fr=0.,bu=0.;',
  '  for(int k=0;k<3;k++){float pk=float(k);vec3 pp=o-V*(.9+pk*2.1);float f=fn3(pp*vec3(1.,2.4,1.)+pk*7.3);',              // les FRACTURES (des nappes fines du bruit)
  '    fr+=(smoothstep(.472,.5,f)-smoothstep(.5,.528,f))*(1.-pk*.27);',
  '    float b=fh3(floor(pp*7.));bu+=step(.985,b)*(1.-pk*.3);}',                                                               // des BULLES prises dans la glace
  '  fr*=1.-smoothstep(120.,700.,dist);bu*=1.-smoothstep(40.,160.,dist);',
  '  vec3 deep=uIceT*vec3(.010,.085,.22),mid=uIceT*vec3(.06,.50,.76),clair=vec3(.60,.95,1.);float fv=fh3(floor(N*9.)+sd*13.);',
  '  float th=clamp(.18+.82*hf,0.,1.);vec3 alb=mix(deep,mid,th*th)*(.78+.44*fv);',
  '  if(fam>2.5)alb=mix(mid,clair*.8,.25+.5*(1.-hf));',                                                                         // les STALACTITES : plus fines, plus claires
  '  float ndv=max(dot(N,V),0.),fres=.04+.96*pow(1.-ndv,5.);vec3 R=reflect(-V,N);',
  '  float ndl=dot(N,L),dif=max(ndl,0.);',
  '  float tr=pow(max(dot(-V,L),0.),3.)*(.6+.4*(1.-th))+.22;',                                                                // la lumière qui TRAVERSE
  '  vec3 col=alb*(uSky*.42+uGnd*.10+uSunC*(.10+.95*dif))+mid*uSunC*tr*(.20+.60*hf)*vec3(.55,.92,1.)+clair*uSunC*hf*hf*.10;',
  '  col+=clair*(fr*.70+bu*.9)*(uSunC*.55+uSky*.45);',
  '  col=mix(col,bCiel(R),fres*.55);',
  '  float sr=max(dot(R,L),0.);col+=uSunC*(pow(sr,110.)*2.8+pow(sr,14.)*.16);',                                              // l'ÉCLAT de la facette
  '  float e=min(min(vB.x,vB.y),vB.z),w9=fwidth(e)*1.4;float ar=1.-smoothstep(0.,w9+.010,e);',                                 // les ARÊTES
  '  col+=clair*(uSunC*.55+uSky*.45)*ar*(.30+.70*dif)*(1.-smoothstep(900.,3000.,dist)*.6);',
  '  float nv=smoothstep(.70,.90,N.y+(fn3(vW*.018)-.5)*.40)*step(.5,fam)*step(fam,2.5)*smoothstep(.15,.5,hf);',              // la neige des aiguilles et des géants
  '  nv=max(nv,step(1.3,fam)*step(fam,1.5)*smoothstep(.70,.80,hf+(fn3(vW*.08)-.5)*.16));',                                   // (2026-10-17, glacier v4) les pics de la PISTE : une calotte de neige (Sacha : « un peu de neige pour décorer, sur les obstacles »)
  '  float gv=(1.-smoothstep(0.,.14,hf+(fn3(vW*.05)-.5)*.10))*step(fam,2.5);',                                                  // le givre au pied
  '  vec3 nc=vec3(.82,.88,.97)*(uSky*.55+uGnd*.1+uSunC*(.15+.85*dif));col=mix(col,nc,max(nv,gv*.85));',
  '  col+=mix(alb,vec3(1.),.4)*uAlpC*uAlp*smoothstep(.35,1.,hf)*(.25+.75*dif)*.9;',                                           // l'ALPENGLOW : le haut des pics s'embrase
  '  col+=mid*bPhare(vW,N)*1.8+clair*bPhare(vW,N)*ar*.6;col+=uFlash*vec3(.8,.85,1.)*.8;',
  '#ifdef LOIN',
  '  float hz=min(uHazeM,1.-exp(-dist*uHazeK));col=mix(col,uHazeC,hz);gl_FragColor=vec4(col,1.);',
  '#else',
  '  col=mix(col,uMistC,bBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>',
  '#endif','}'].join('\n');
/* LE VERGLAS (2026-10-15) : une glace noire posée SUR la route — le bleu profond des lacs, des fêlures, le ciel qui s'y reflète, le soleil qui
   y trace son chemin, un liseré de GIVRE blanc aux bords déchiquetés, des paillettes. aV = (travers -1..1, le long 0..1, graine, 0). */
const BK_VG_VS=['attribute vec4 aV;varying vec3 vW,vN;varying vec4 vV;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normal;vV=aV;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const BK_VG_FS=[FG_BRUIT,BK_LUM,'varying vec3 vW,vN;varying vec4 vV;','#include <fog_pars_fragment>',
  'vec2 bVor(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(fh2(i+g),fh2(i+g+17.3));vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return vec2(sqrt(d1),sqrt(d2));}',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec2 q=vW.xz+vV.z*97.;',
  '  float u=abs(vV.x),e=.88+.10*fn2(q*.23),al=1.-smoothstep(e-.06,e,u);',                                      // le bord déchiqueté
  '  float t=vV.y,en=.10+.08*fn2(q*.17+3.);al*=smoothstep(0.,en,t)*(1.-smoothstep(1.-en,1.,t));',
  '  e=1.06;al=1.;', // les bouts — la glace couvre tout, de bout en bout
  '  vec2 v1=bVor(q*.14);float c1=1.-smoothstep(0.,.05,v1.y-v1.x);vec2 v2=bVor(q*.45+3.1);float c2=(1.-smoothstep(0.,.06,v2.y-v2.x))*smoothstep(.5,.75,fn2(q*.08));',
  '  vec3 alb=uIceT*mix(vec3(.01,.06,.11),vec3(.04,.20,.30),fn2(q*.05));',
  '  vec3 R=reflect(-V,N);float fres=.05+.95*pow(1.-max(dot(V,N),0.),5.);',
  '  vec3 col=alb*(uSky*.8+uSunC*.45)+vec3(.78,.94,1.)*(uSky*.5+uSunC*.35)*(c1*.42+c2*.25);',
  '  col=mix(col,bCiel(R)*.95,fres*.9);',
  '  float sr=max(dot(R,uSunDir),0.);col+=uSunC*(pow(sr,500.)*6.+pow(sr,35.)*.35);',                               // le chemin du soleil
  '  float gv=smoothstep(e-.32,e-.02,u)*(.45+.55*fn2(q*1.9));col=mix(col,vec3(.88,.94,1.)*(uSky*.6+uSunC*.85),gv*.75);', // le givre des bords (v4 : la frange qui se fond dans la neige)
  '  {vec2 g=q*2.6;vec2 c=floor(g);float h=fh2(c);col+=(uSunC*1.6+uSky*.4)*step(.93,h)*smoothstep(.30,.05,length(fract(g)-.5))*(1.-smoothstep(25.,90.,dist))*uSpark;}', // les paillettes
  '  vec3 hd=normalize(uCarP+vec3(0.,1.,0.)-vW);col+=vec3(.9,.95,1.)*uPhare*pow(max(dot(R,hd),0.),60.)*2.5*(1.-smoothstep(10.,140.,distance(uCarP,vW)));',
  '  col+=bPhare(vW,N)*.3+uFlash*vec3(.8,.85,1.)*.5;',
  '  col=mix(col,uMistC,bBrume(vW,dist));gl_FragColor=vec4(col,al*.9);','  gl_FragColor.a=1.;','#include <fog_fragment>','}'].join('\n');
/* LES TRACES : la poudreuse (type 0) = une TRANCHÉE bleue d'ombre, deux bourrelets clairs qui scintillent ; la glace (type 1) = deux rayures
   blanches de patins, fines. Elles s'effacent avec l'âge (BK_TR.vie) et la distance. aT = (côté -1..1, naissance, profondeur, type). */
const BK_TR_VS=['attribute vec4 aT;varying vec4 vT;varying vec3 vW;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vT=aT;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const BK_TR_FS=[FG_BRUIT,BK_LUM,'uniform float uVie;varying vec4 vT;varying vec3 vW;','#include <fog_pars_fragment>',
  'void main(){float age=uTime-vT.y;if(age<0.||age>uVie)discard;float a=1.-smoothstep(uVie*.55,uVie,age);vec3 V=uCam-vW;float dist=length(V);',
  '  a*=1.-smoothstep(300.,700.,dist);float u=abs(vT.x),pr=clamp(vT.z,0.,1.);vec3 col;float al;',
  '  if(vT.w<.5){float tr=1.-smoothstep(.40,.78,u),bo=smoothstep(.56,.80,u)*(1.-smoothstep(.84,1.,u));',
  // (2026-10-15, Sacha : « rajoute une belle traîne dans la neige quand la voiture passe dedans ») LA TRANCHÉE v2 : plus large, plus
  // profonde (le bleu s'assombrit vers le fond), deux ORNIÈRES de pneus crantées, des bourrelets plus clairs qui scintillent, des paillettes au fond
  '    float g=fn2(vW.xz*1.3),rut=(1.-smoothstep(0.,.08,abs(u-.30)))*(.55+.45*step(.5,fract((vW.x+vW.z)*1.7)));',
  '    vec3 creux=vec3(.10,.24,.70)*(uSky*.72+uSunC*.10),ombre=vec3(.30,.48,.90)*(uSky*.75+uSunC*.18),clair=vec3(.96,.98,1.)*(uSky*.55+uSunC*1.12);',
  '    col=mix(ombre,creux,clamp(1.-u/.78,0.,1.)*(.35+.65*pr));col=mix(col,creux*.75,rut*tr*.65);col=mix(col,clair,bo);',
  '    col+=uSunC*step(.90,fh2(floor(vW.xz*3.)))*bo*1.8*uSpark+uSunC*step(.97,fh2(floor(vW.xz*5.)+7.))*tr*.9*uSpark;',
  '    al=a*(tr*(.72+.28*pr)+bo*.82)*(.85+.15*g);}',
  '  else{float l=1.-smoothstep(.0,.07,abs(u-.62))+(1.-smoothstep(0.,.05,abs(u-.34)))*.6;col=vec3(.86,.95,1.)*(uSky*.7+uSunC*.7);al=a*l*.55;}',
  '  col+=bPhare(vW,vec3(0.,1.,0.))*.6;col=mix(col,uMistC,bBrume(vW,dist));gl_FragColor=vec4(col,al);','#include <fog_fragment>','}'].join('\n');
/* LA NEIGE QUI TOMBE / LE BLIZZARD / LA POUSSIÈRE DE DIAMANT : des points dans une boîte qui suit la caméra (chaque flocon reste à sa
   place dans le monde : on les traverse). aR = (x, y, z, taille) au hasard. uDD > 0 : la poussière de diamant (fine, lente, qui scintille). */
const BK_FLO_VS=['attribute vec4 aR;uniform float uTime,uNeige,uVent,uPx,uDD;uniform vec3 uBoxC,uSunC,uSky;varying float vA;varying vec3 vC;',
  'void main(){float dd=0.;','#ifdef DD','dd=1.;','#endif','float S=mix(mix(72.,110.,step(1.5,uVent)),46.,dd);',
  '  float vit=mix(mix(3.2,6.5,aR.w),.35,dd)*(1.+uVent*.35*(1.-dd));',
  '  vec3 p=aR.xyz*S+vec3(uTime*uVent*mix(5.,1.,dd)*(.7+.6*aR.w)+sin(uTime*.7+aR.w*20.)*1.2,-uTime*vit,uTime*uVent*mix(1.6,.4,dd)+cos(uTime*.53+aR.x*30.)*1.);',
  '  vec3 w=uBoxC+mod(p-uBoxC+S*.5,S)-S*.5;',
  '  vec4 mv=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mv;float z=-mv.z;',
  '  float on=step(aR.w,mix(uNeige,uDD,dd));',
  '  float bord=smoothstep(S*.5,S*.36,length(w-uBoxC));',
  '  vA=on*bord*smoothstep(.6,2.2,z)*(dd>.5?(.35+.65*pow(max(sin(uTime*(2.+aR.x*5.)+aR.y*40.),0.),6.)):.85);',
  '  vC=dd>.5?uSunC*1.3+vec3(.4,.6,1.)*.3:(uSky*.6+uSunC*.5+vec3(.18));',
  '  gl_PointSize=dd>.5?min(uPx*5.,uPx*(.8+aR.w)*26./max(z,1.)):min(uPx*34.,uPx*mix(2.2,4.6,aR.w)*(1.+uVent*.12)*70./max(z,1.));if(on<.5)gl_Position=vec4(2.,2.,2.,1.);}'].join('\n');
const BK_FLO_FS=['varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.12,d);if(vA*a<.01)discard;gl_FragColor=vec4(vC,vA*a);}'].join('\n');
/* LES AURORES BORÉALES : trois rideaux à 6 km, qui suivent la caméra (à l'infini) ; des RAIS verticaux qui coulent, le bas vert vif, le haut
   qui vire au magenta, des plis qui ondulent lentement. Additives, sans brouillard. aU = (le long, la hauteur, graine). */
const BK_AUR_VS=['attribute vec3 aU;uniform float uTime;varying vec3 vU;',
  'void main(){vec3 p=position;vec2 nh=normalize(p.xz);float pl=sin(aU.x*31.+uTime*.21+aU.z*6.)*170.+sin(aU.x*11.-uTime*.13+aU.z*3.)*260.;p.xz+=nh*pl;',
  '  p.y+=sin(aU.x*7.+uTime*.1+aU.z)*120.*aU.y;vU=aU;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;}'].join('\n');
const BK_AUR_FS=[FG_BRUIT,'uniform float uTime,uAur;uniform vec3 uAurC,uAurC2;varying vec3 vU;',
  'void main(){float x=vU.x,y=vU.y;',
  '  float r=fn2(vec2(x*190.+vU.z*40.,uTime*.22))*.62+fn2(vec2(x*57.-uTime*.06+vU.z*9.,1.7+uTime*.05))*.38;r=pow(r,2.3)*2.1;',
  '  float bas=smoothstep(0.,.05,y)*exp(-y*3.2),haut=smoothstep(.05,.45,y)*(1.-smoothstep(.45,1.,y));',
  '  vec3 col=uAurC*bas*1.5+mix(uAurC,uAurC2,smoothstep(.12,.7,y))*haut*.8;',
  '  float bande=smoothstep(0.,.08,x)*smoothstep(1.,.92,x)*(.55+.45*sin(x*8.+uTime*.17+vU.z*4.));',
  '  gl_FragColor=vec4(col*(r*.85+.15)*bande*uAur,1.);}'].join('\n');
function banqMats(){if(BANQ.mats)return BANQ.mats;const U=BK_U,F=THREE.UniformsLib.fog;
  const sm=(vs,fs,o)=>{const m=new THREE.ShaderMaterial(Object.assign({uniforms:Object.assign(THREE.UniformsUtils.clone(F),U,o&&o.u||{}),vertexShader:vs,fragmentShader:fs,fog:true},o&&o.m||{}));m.dispose=function(){};return m;}; // jamais libérées : un seul jeu pour toutes les banquises
  const M={};
  M.sol=sm(BK_SOL_VS,BK_SOL_FS);
  M.pic=sm(BK_PIC_VS,BK_PIC_FS,{m:{extensions:{derivatives:true}}});
  M.loin=sm(BK_PIC_VS,BK_PIC_FS,{m:{extensions:{derivatives:true},fog:false,defines:{LOIN:1}}});
  M.vg=sm(BK_VG_VS,BK_VG_FS,{m:{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}}); // (2026-10-15) LE VERGLAS de la route — OPAQUE : c'est le sol
  M.tr=sm(BK_TR_VS,BK_TR_FS,{u:{uVie:{value:110}},m:{transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}});
  const flo=()=>new THREE.ShaderMaterial({uniforms:U,vertexShader:BK_FLO_VS,fragmentShader:BK_FLO_FS,transparent:true,depthWrite:false});
  M.flo=flo();M.flo.dispose=function(){};
  M.dd=flo();M.dd.defines={DD:1};M.dd.blending=THREE.AdditiveBlending;M.dd.dispose=function(){};
  M.aur=new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uAur:U.uAur,uAurC:U.uAurC,uAurC2:U.uAurC2},vertexShader:BK_AUR_VS,fragmentShader:BK_AUR_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});M.aur.dispose=function(){};
  return BANQ.mats=M;}
/* ---------------- LES MAILLAGES ---------------- */
/* LA FILE DES TRANCHES (2026-10-14, soir — PILOTAGE : « descends la construction sous ~50 ms ») : buildBanq ne bâtit tout de suite que la
   PHYSIQUE (la grille de neige, les cristaux) et le décor à moins de BK_TOUT m du départ ; le reste (morceaux de neige, pics,
   géants) part dans `BANQ.file`, trié du plus proche au plus loin, et banqTick en bâtit ~3 ms par image (8 en pause). */
const BK_TOUT=600;
function bkTache(x,z,f){const p0=pts[0];BANQ.file.push({d:Math.hypot(x-p0.x,z-p0.z),f:f});}
function bkTranches(ms,dMax){const F=BANQ.file;if(!F)return 0;const t0=performance.now();let n=0;
  while(BANQ.fi<F.length){const j=F[BANQ.fi];if(dMax!=null&&j.d>=dMax)break;BANQ.fi++;try{j.f();}catch(e){window.__banqErr=e;}n++;if(performance.now()-t0>ms)break;}
  BANQ.msFile=(BANQ.msFile||0)+performance.now()-t0;if(BANQ.fi>=F.length&&F.length){BANQ.file=[];BANQ.fi=0;}return n;}
function bkSolMorceau(root,ci,cj){
  const S=BANQ.sol,M=BANQ.mats,CH=40;if(!S||!BANQ.root)return;
  const i1=Math.min(S.nx-1,ci+CH),j1=Math.min(S.nz-1,cj+CH),w=i1-ci+1,hh=j1-cj+1;
  const P=new Float32Array(w*hh*3),Nm=new Float32Array(w*hh*3),A=new Float32Array(w*hh*2),I=[];
  for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const gi=ci+i,gj=cj+j,k=gi+gj*S.nx,q=i+j*w;
    P[q*3]=S.x0+gi*S.C;P[q*3+1]=S.h[k];P[q*3+2]=S.z0+gj*S.C;
    const hl=S.h[Math.max(0,gi-1)+gj*S.nx],hr=S.h[Math.min(S.nx-1,gi+1)+gj*S.nx],hd=S.h[gi+Math.max(0,gj-1)*S.nx],hu=S.h[gi+Math.min(S.nz-1,gj+1)*S.nx];
    let nx9=hl-hr,ny9=2*S.C,nz9=hd-hu;const l=Math.hypot(nx9,ny9,nz9);Nm[q*3]=nx9/l;Nm[q*3+1]=ny9/l;Nm[q*3+2]=nz9/l;A[q*2]=S.d[k];A[q*2+1]=0;}
  for(let j=0;j<hh-1;j++)for(let i=0;i<w-1;i++){const k=(ci+i)+(cj+j)*S.nx;if(S.d[k]>S.MARG+120&&S.d[k+1+S.nx]>S.MARG+120)continue;const a=i+j*w;I.push(a,a+w,a+1,a+1,a+w,a+w+1);}
  if(!I.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nm,3));g.setAttribute('aS',new THREE.BufferAttribute(A,2));
  g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,M.sol);m.name='banquise neige';m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);BANQ.solM.push(m);BANQ.n.sol=(BANQ.n.sol||0)+I.length/3;}
function banqSolMesh(root){
  const S=BANQ.sol,CH=40;BANQ.solM=[];BANQ.n.sol=0;
  for(let cj=0;cj<S.nz-1;cj+=CH)for(let ci=0;ci<S.nx-1;ci+=CH){
    const i1=Math.min(S.nx-1,ci+CH),j1=Math.min(S.nz-1,cj+CH);let ok=false;
    for(let j=cj;j<=j1&&!ok;j+=2)for(let i=ci;i<=i1;i+=2)if(S.d[i+j*S.nx]<S.MARG){ok=true;break;}
    if(!ok)continue;
    const cx=S.x0+(ci+i1)*.5*S.C,cz=S.z0+(cj+j1)*.5*S.C,dm=Math.hypot(i1-ci,j1-cj)*.5*S.C;
    bkTache(cx,cz,function(){bkSolMorceau(root,ci,cj);});BANQ.file[BANQ.file.length-1].d=Math.max(0,BANQ.file[BANQ.file.length-1].d-dm);}}
/* LA GÉOMÉTRIE DES CRISTAUX : des triangles NON indexés (normale plate par facette, barycentriques pour les arêtes) — aP = (hauteur
   relative, graine, famille, 0). Les familles : 0 glisse · 1 aiguille · 2 géant (LOIN) · 3 stalactite. Triés en morceaux de 600 m
   (1 500 m pour les géants) : three jette ceux qui sont hors champ. */
function bkLot(){return {P:[],N:[],B:[],A:[]};}
function bkTri(K,a,b,c,nx,ny,nz,ha,hb,hc,sd,fam){
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  if((uy*vz-uz*vy)*nx+(uz*vx-ux*vz)*ny+(ux*vy-uy*vx)*nz<0){const t=b;b=c;c=t;const th=hb;hb=hc;hc=th;}
  K.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);K.N.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);K.B.push(1,0,0,0,1,0,0,0,1);K.A.push(ha,sd,fam,0,hb,sd,fam,0,hc,sd,fam,0);}
function bkPrimGeo(K,P){const A=P.A,H=P.H,yb=P.yb;
  for(let i=0;i<P.n;i++){const a=P.V[i],b=P.V[(i+1)%P.n],q=i*4;bkTri(K,A,a,b,P.F[q],P.F[q+1],P.F[q+2],1,(a[1]-yb)/H,(b[1]-yb)/H,P.sd,P.fam);}}
function bkMesh(root,K,mat,nom){if(!K.P.length)return null;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(K.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(K.N,3));
  g.setAttribute('aB',new THREE.Float32BufferAttribute(K.B,3));g.setAttribute('aP',new THREE.Float32BufferAttribute(K.A,4));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.name=nom;m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);return m;}
