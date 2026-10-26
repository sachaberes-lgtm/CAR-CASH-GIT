/* <<<FORET>>> */
/* ======================= LA FORÊT NOIRE — LA MAP DES CONTES (2026-10-14, Sacha : « fais une autre map en mode forêt européenne
   allemande, un peu fantaisie, un peu hantée, où la route doit slalomer entre les arbres, toujours en étant en descente ; en journée la
   forêt doit être belle, ensoleillée, verdoyante, avec des fleurs et des papillons, et la nuit ce doivent être les mêmes arbres mais avec
   plutôt une ambiance de forêt hantée, avec des effets hantés et des bruits de loup-garou ; fais un truc magnifique, toujours en
   travaillant bien une variété d'arbres jolie et magnifique ; regarde que toutes les heures et les météos sont bien comprises » · « il
   faut que ce soit magnifique du premier coup ») =======================
   La Forêt-Noire des frères Grimm, à l'échelle de CASH CAR : le ruban de route file dans une VALLÉE boisée, à mi-hauteur des arbres
   (un « Baumwipfelpfad », le sentier des cimes) — depuis le 2026-10-15, une PELOTE : il monte, descend et repasse sur lui-même.
   · LA ROUTE (`genForet` → `forPelote`, 2026-10-15 : LA PELOTE — « le concept, c'est de SE PERDRE ») : une enfilade de NŒUDS où la route
     trace une étoile et repasse au-dessus et en dessous d'elle-même (≥ 32 m entre deux étages), qui DESCENDENT, MONTENT ou font la vague —
     sauter sur la route d'en dessous, c'est un raccourci… ou un retour en arrière. Voir l'en-tête de `genForet`.
   · LES GÉANTS (`FOR_GEANTS`) : à la corde des virages, au cœur des boucles, en colonnade, et LA FUTAIE (un géant tous les ~95 m à moins de
     360 m d'une route) ; chacun pose son pied au fond et ouvre sa couronne au-dessus de la route la plus HAUTE à sa portée (un chêne de
     400-500 m sous trois étages, un séquoia de 700) ; le fût reste à 5 m du bord de toutes les routes. En vol, un tronc ou une couronne
     TUE (`foretHeurt` → 'arbre') : on saute d'un étage à l'autre ENTRE les fûts.
   · LA FORÊT (`FOR_ESP`) : épicéas et sapins, hêtres, chênes, bouleaux, pins sylvestres, et des érables d'or çà et là, à l'échelle ×2,1
     (2026-10-15) ; trois niveaux de détail, triés par QUARTIERS de 150 m (`foretTri`, la recette de jadeTri). LE RELIEF (`foretSol`) : le
     fond de la forêt sous l'enveloppe BASSE de la pelote (~130 m sous la route la plus basse), qui remonte en collines tout autour ; aucun
     arbre ordinaire ne monte dans l'air libre entre les étages (`yb`). Tomber dans les arbres ou au fond TUE ('arbre', 'sousbois').
   · LE JOUR : rayons de soleil entre les géants (`FOR_RAYONS`), fleurs le long des deux bords (digitales, coquelicots, marguerites,
     boutons d'or, jacinthes, fougères) qui s'écartent quand la caisse les frôle, lierre qui pend sous la dalle, PAPILLONS (`FOR_PAP`),
     pollen dans la lumière, oiseaux et pic-vert.
   · LA NUIT, LES MÊMES ARBRES, HANTÉS : la lune pleine, la brume qui monte du fond, des FEUX FOLLETS qui fuient la caisse, des LUCIOLES,
     des YEUX qui s'allument dans les sous-bois et se ferment quand on approche, des chauves-souris (les papillons changent d'aile), les
     fleurs du bord qui luisent, le vieux chêne dont le VISAGE s'éclaire, la chaumière aux fenêtres orange, et LE LOUP-GAROU qui hurle sur
     la crête, en ombre chinoise devant un halo de lune (`foretLoup`), chouettes, corbeaux, branches qui craquent.
   · LES MÉTÉOS (le mode classique, `SF_CARTES.foret`) : MATIN (soleil bas, brume dorée, rosée), MIDI (plein soleil vert), SOIR (heure
     dorée, premières lucioles), NUIT (hantée), PLUIE (forêt sombre et mouillée), ORAGE (les éclairs blanchissent la forêt, les loups
     hurlent après le tonnerre). Chaque météo règle `FOR_MET` (lumière de la forêt, rayons, brume, papillons, lucioles, hantise, phares)
     et son ambiance `BIOMES.foret*` (ciel, brouillard, lumières de la caisse).
   · LA LUMIÈRE : les matières de la forêt sont des ShaderMaterial (0 programme compilé en course, aucune lumière ajoutée) ; elles relisent
     chaque image les couleurs du soleil / ciel / sol de bioApply, mais leur DIRECTION de lumière est celle de la forêt (`FOR_U.uSunDir` :
     haute à midi, rasante le soir, la LUNE la nuit) ; les PHARES de la caisse éclairent troncs, fleurs et sol devant elle (`uPhare`).
   Console : `dbgForet()` (comptes, temps de construction), `dbgForet('vue',{p,c})`, `dbgForet('loup')`, `dbgForet('meteo','nuit')`.
   Lancer : `?carte=foret&meteo=nuit` (le 1er niveau du JOUER), ou `dbgClassique('foret','soir')` puis `dbgSaut()`. */
const FORET_FLEURS_BORD=/[?&]fleurs=1\b/.test(location.search); // (2026-10-15 soir, Sacha : « enlever les fleurs au bord de la route dans la forêt ») plus de fleurs le long des deux bords (les plantes du fond et le lierre restent) — `?fleurs=1` les rend
const NIV_FORET={id:'foret',nm:'LA FORÊT NOIRE',bio:['foretMidi'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'foret',pr:'SLALOME ENTRE LES GEANTS'};
/* (2026-10-15, Sacha : « certains éléments manquent de cohérence entre eux, couleurs, formes, textures ; travaille sur toutes les maps les textures
   des éléments de décor, sans que ça prenne trop d'espace sur l'iPhone ») LA MATIÈRE COMMUNE : le décor du jeu parle en APLATS PROPRES et en
   dégradés doux (la ville, les nuages, les pics du glacier, le volcan) ; trois matières faisaient bande à part — les strates RAYÉES du canyon,
   la prairie FLUO de la forêt, la roche GRISE et granuleuse du jade. Elles rentrent dans le rang : des nombres dans leurs shaders, aucune image
   de plus (zéro octet de mémoire graphique en plus). Voir « LA MATIÈRE COMMUNE » au JOURNAL. */
const FORET={root:null,Q:null,plg:[],fam:[],quart:null,sig:0,sol:null,can:null,geants:[],gcol:null,arche:[],chaum:[],loup:null,
  met:'midi',cur:null,de:null,k:1,ms:0,n:{},t:0,son:{t:3,loupT:9,pT:0},fx:{},bat:null,mats:null,protos:null,tex:{}};
// LES MÉTÉOS DE LA FORÊT — el : hauteur de la lumière (°) · ray : rayons de soleil · mist/mC : la brume du fond · pap : papillons · luc :
// lucioles · pol : pollen · hante : la hantise (feux follets, yeux, visage, fleurs qui luisent, chauves-souris) · phare : les phares
// sur la forêt · leaf : la teinte des feuilles · ros : la rosée (éclats) · vent · sons : 'jour' | 'nuit' | 'pluie'
// (2026-10-20, embellir) lant : les lanternes ambre (0-1) · vg : la couleur de la lueur des joints de vitrail (or le jour, bleu-lune la nuit)
const FOR_MET={
  matin:{el:15,ray:1.2,mist:.9,mC:[.92,.88,.78],pap:.75,luc:0,pol:.8,hante:0,phare:.04,leaf:[1.02,1.02,.94],ros:1,vent:.5,lune:0,sons:'jour',lant:.12,vg:[1,.84,.46]},
  midi: {el:55,ray:.62,mist:.25,mC:[.78,.88,.84],pap:1,luc:0,pol:.5,hante:0,phare:0,leaf:[1.04,1.08,.94],ros:.3,vent:.6,lune:0,sons:'jour',lant:0,vg:[1,.86,.45]},
  soir: {el:8,ray:1.35,mist:.55,mC:[1,.70,.46],pap:.4,luc:.45,pol:.9,hante:.12,phare:.35,leaf:[1.1,.98,.78],ros:.2,vent:.45,lune:0,sons:'soir',lant:.8,vg:[1,.76,.40]},
  nuit: {el:34,ray:.3,mist:1,mC:[.09,.14,.19],pap:0,luc:1,pol:0,hante:1,phare:1,leaf:[.62,.82,.92],ros:0,vent:.7,lune:1,sons:'nuit',lant:1,vg:[.50,.62,1]},
  pluie:{el:62,ray:0,mist:.85,mC:[.44,.50,.50],pap:0,luc:0,pol:0,hante:.18,phare:.55,leaf:[.84,.96,.90],ros:0,vent:1.1,lune:0,sons:'pluie',lant:.5,vg:[.76,.88,.96]},
  orage:{el:62,ray:0,mist:.95,mC:[.14,.17,.22],pap:0,luc:.15,pol:0,hante:.75,phare:.9,leaf:[.70,.84,.92],ros:0,vent:1.6,lune:0,sons:'orage',lant:.45,vg:[.62,.55,1]}};
const FOR_U={uSunDir:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},
  uFillC:{value:new THREE.Color()},uFillD:{value:new THREE.Vector3(0,-1,0)},uCam:{value:new THREE.Vector3()},uCarP:{value:new THREE.Vector3(0,-1e5,0)},
  uCarF:{value:new THREE.Vector3(0,0,1)},uTime:{value:0},uPhare:{value:0},uFlash:{value:0},uWet:{value:0},uHante:{value:0},uMistC:{value:new THREE.Color(.8,.88,.84)},
  uMistK:{value:.3},uMistY:{value:0},uLeafT:{value:new THREE.Vector3(1,1,1)},uRos:{value:0},uVent:{value:.5},uRay:{value:0},uPap:{value:0},uLuc:{value:0},uPol:{value:0},
  uBoxC:{value:new THREE.Vector3()},uPx:{value:1},uLune:{value:0},uLant:{value:0},uRayK:{value:1},uAir:{value:1}};
/* LES BUDGETS PAR PALIER (PAL : [ANCIEN, MOYEN, RÉCENT] — la 3e colonne est le rendu de référence) : densité et portée de la forêt, détail des
   géants, pas des fleurs, des plantes du fond, des rayons et de la brume, papillons, lucioles, feux follets, yeux, taille des toiles. */
const FOR_LUNE=new THREE.Vector3(-.52,.40,-.72).normalize(); // la lune du dôme (cielLune) : la forêt pose la sienne au même endroit
try{Object.assign(PAL.B,{foretArbres:[.42,.66,1],foretRayon:[900,1250,1650],foretMarge:[1700,2200,2800],foretSolC:[32,28,26],foretB0:[150,180,200],foretB1:[400,480,540],
  foretGeantFin:[0,1,1],foretFleurs:[2.2,1.6,1.1],foretPlantes:[8,6,4.2],foretRayons:[46,36,28],foretBrume:[70,55,42],foretYeux:[50,70,90],foretPap:[50,100,150],
  foretFutaie:[1.45,1.15,1],foretLuc:[300,560,900],foretLant:[30,60,90],foretFollets:[8,11,14],foretTex:[.5,.75,1],foretLierre:[0,1,1],foretChampi:[0,1,1],foretSolCh:[999,64,64],foretPres:[1,0,0]});}catch(e){}
/* ---------------- LA ROUTE v3 : LA PELOTE — LA FORÊT OÙ L'ON SE PERD ----------------
   (2026-10-15, Sacha : « le concept de la forêt, ça va être de SE PERDRE. Soit tu suis la route — plein de virages, vers le bas, vers le
   haut — et tu es sûr d'arriver un jour ; soit tu prends des raccourcis, mais tu ne sais pas si ce sont des bons raccourcis » · « comme dans
   la ville : la route allait en dessus, en dessous ; je prenais la route d'en bas et je ne savais pas si je gagnais du terrain ou si je
   revenais sur mes pas » · « que la route soit emmêlée, qu'elle aille vers le haut, vers le bas, pas que descendre ou que monter »)
   LE PLAN (`forPelote`) : la route traverse une enfilade de 3 (ou 4) NŒUDS, des quartiers de forêt d'~450 m de rayon (× l'échelle du palier)
   où elle trace une ÉTOILE — 4 ou 5 pointes visitées en sautant d'un bord à l'autre (135-155° à chaque pointe, comme on dessine un
   pentagramme), en slalom, parfois une BOUCLE à une pointe : chaque branche recoupe les précédentes. Entre deux nœuds, une LIAISON de
   virages ; la ligne des nœuds louvoie (±70°) et la forêt s'étale sur des kilomètres. L'ARCHE est à mi-course, sur une droite.
   LE RELIEF : chaque nœud a le sien — il DESCEND (la route d'en dessous est DEVANT : sauter, c'est un raccourci), il MONTE (elle est DERRIÈRE :
   sauter, c'est revenir en arrière), ou il fait LA VAGUE (descend puis remonte : les deux). Un grain par-dessus (bosses, une branche sur cinq
   à contre-pente). Au total on descend un peu ; jamais une majorité de nœuds qui montent.
   LES CROISEMENTS : partout où la route repasse sur elle-même (à moins de 78 m en plan, 250 m de route au moins entre les deux), les deux
   dalles sont écartées d'AU MOINS 32 m en hauteur (`DY`) : des bosses gaussiennes relèvent la route du dessus et creusent celle du dessous.
   Le sens d'un croisement ambigu (< 8 m) est tiré au sort, 6 fois sur 10 un raccourci ; un croisement qui résiste change de sens.
   MESURÉ (banc raccourcis, palier 0, 12 graines) : 9-15 km, 11-27 croisements, 1-4 raccourcis RENTABLES/km et 0-2,5 PIÈGES/km (pose propre
   ≥ 300 m en arrière), 4,3-5,2 virages/km, 0 croisement dangereux, 0 virage infranchissable ; construite en ~25 ms (8 essais au pire).
   Tout à l'échelle du palier (rayons × rayonPalier()/63) ; un seul `rnd` consommé (le flux propre `gr`), le meilleur des essais gagne (`note`).
   LA PELOTE AU LARGE (2026-10-17, Sacha : « la génération de route dans la map forêt est bof, car trop de virages serrés — mais on a bien l'idée d'être
   perdu en forêt ») : MESURÉ avant (8 graines, palier 0) 4,75 virages/km dont 2,62 SERRÉS/km (plus de la moitié braqués à fond, rayon d'axe 70 m pour
   rMin 63). Le DESSIN ne change pas (les nœuds en étoile, les pointes visitées d'un bord à l'autre, les boucles, les croisements, le relief) : seuls
   les RAYONS s'ouvrent — plancher des arcs 1,18 → 1,4 × rMin, virage d'alignement 1,25-2,3 → 1,5-2,7 × rMin, S de slalom plus larges (rayon
   1,25-2,45 → 1,55-2,85 × rMin), boucles 1,45 → 1,6 × rMin ; l'étoile garde sa taille. Aucun tirage ajouté (même flux `gr`). MESURÉ après (12 graines,
   palier 0, racc2) : 3,9 virages/km (on tourne toujours beaucoup), plus AUCUNE épingle à fond (sous 1,2 × rMin : 1,0/km → 0 ; sous 1,35 × rMin :
   1,9/km → 0,23/km ; les « serrés » qui restent sont surtout à 1,35-1,5 × rMin), 10-15 km comme avant, 0 croisement dangereux, 0 infranchissable
   (palier 22 : 5 → 0). Au palier 10 les pistes s'allongent d'~20 % (mêmes virages, plus grands). Un pas plus loin (plancher 1,62) tuait les virages :
   2,9/km, pistes de 15-17 km. `?foret=serre` = la pelote d'avant. */
const FORET_LARGE=typeof location==='undefined'||!/[?&]foret=serre\b/.test(location.search);
const FORET_HASARD=typeof location==='undefined'||!/[?&]sans=([^&]*,)?forethasard(,|&|$)/.test(location.search); // (2026-10-19) LA FORÊT AU HASARD (voir le dessin de forPelote) — `?sans=forethasard` = la recette d'avant, à l'identique
const FOR_MODULES=typeof location==='undefined'||!/[?&]sans=([^&]*,)?foretmodules(,|&|$)/.test(location.search); // (2026-10-20) SIX MODULES (voir fToboggan) — `?sans=foretmodules` = le paquet d'avant (slalom, corde, racines)
const FOR_DECOR=typeof location==='undefined'||!/[?&]sans=([^&]*,)?foretdecor(,|&|$)/.test(location.search); // (2026-10-20) LE DÉCOR AU HASARD (voir forDecoTire) — `?sans=foretdecor` = le décor d'avant, au tirage près
function* genForet(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais
  CAMPM.length=0;MODMARK.length=0;
  const LV=Math.min(4.4,typeof lvPiste==='function'?lvPiste():1),vP9=70+(LV-1)*100;
  let kR=(40+.3*vP9)/63,kV=vP9/70;try{if(typeof rayonPalier==='function')kR=rayonPalier()/63;if(typeof vPalier==='function')kV=vPalier()/70;}catch(e){}
  kR=Math.max(1,Math.min(2.8,kR||1));kV=Math.max(1,Math.min(3.2,kV||1));
  const gr=mulberry32((rnd()*4294967296)>>>0);let best=null,ne=0;
  for(let e=0;e<8;e++){if(e)yield;const r=forPelote(gr,kR,kV);ne++;if(!best||r.note<best.note)best=r;if(r.note<1)break;}
  for(const m of best.mods||[])MODMARK.push(m); // (2026-10-18) LES MODULES DE CHAQUE MAP : ceux de l'essai gardé (voir fSlalom)
  FORET.Q=best.Q;FORET.plg=[];FORET.boucles=best.BO;FORET.noeuds=best.NO;FORET.plan=best.plan;FORET.axe=best.axe;FORET.pel={dsM:best.dsM,note:+best.note.toFixed(2),essais:ne,croise:best.croise,dyMin:best.dyMin,L:Math.round(best.L),mk:best.mk};
  return best.ctrl;}
function forPelote(rnd,kR,kV){kV=Math.min(kV,kR*1.15); // (les longueurs suivent les rayons : à haute vitesse le nœud grandit en entier, sans s'étirer en lignes droites)
  const rM=63*kR,v9=70*kV,LT=9600*(.55+.45*kR),RH=(typeof ROAD_HALF==='number'&&ROAD_HALF>0)?ROAD_HALF:28,DY=32;
  // ---- LA TORTUE : le plan (x, z), l'abscisse s, et un relevé fin tous les ~10 m pour les croisements ----
  let x=0,z=0,phi=0,s=0,cib=null;const C=[[0,0]],SC=[0],D=[0,0,0],ZO=[],Q={},BO=[],NO=[];
  const pas=(nx,nz)=>{const dh=Math.hypot(nx-x,nz-z),n=Math.max(1,Math.ceil(dh/10));for(let j=1;j<=n;j++)D.push(x+(nx-x)*j/n,z+(nz-z)*j/n,s+dh*j/n);s+=dh;x=nx;z=nz;C.push([x,z]);SC.push(s);};
  const droite=l=>{const n=Math.max(1,Math.round(l/30));for(let k=0;k<n;k++)pas(x+Math.sin(phi)*l/n,z+Math.cos(phi)*l/n);};
  const arc=(aDeg,R,R2,ond)=>{if(R2==null)R2=R;const n=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),st=aDeg*Math.PI/180/n,o9=rnd()*6.283;
    for(let k=0;k<n;k++){let r=R+(R2-R)*(k+.5)/n;if(ond)r=Math.max(rM*(FORET_LARGE?1.4:1.18),r*(1+ond*Math.sin((k+.5)/n*9.4+o9)));const ch=2*r*Math.sin(Math.abs(st)/2);phi+=st/2;const nx=x+Math.sin(phi)*ch,nz=z+Math.cos(phi)*ch;phi+=st/2;pas(nx,nz);}};
  const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a;};
  const rel=()=>cib?wrap(Math.atan2(cib[0]-x,cib[1]-z)-phi):0,dist=()=>cib?Math.hypot(cib[0]-x,cib[1]-z):0; // l'angle (signé) et la distance vers la cible
  const ici=k=>{Q[k]={x:x,z:z,phi:phi,s:s};};
  let zg=0;const zone=(g,f)=>{const s0=s,z9=zg;zg=g;f();zg=z9;ZO.push([s0,s,g]);}; // zg : la pente de la zone en cours (2026-10-18 : les modules ne vont que dans celles qui DESCENDENT)
  let sgV=rnd()<.5?-1:1;
  /* LES MODULES DE LA FORÊT NOIRE (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). Ils prennent la place d'un S dans l'axe de `vers` quand la
     cible est encore loin (> 620 m × kR : plus près, le module la dépassait et la route revenait en épingle — la forêt s'allongeait d'un quart) et que la route a roulé 0,7-1,1 km × kV depuis le précédent ; `vers` se réaligne ensuite sur la cible —
     ils vivent DANS la zone du nœud, seulement quand elle DESCEND (sinon la forêt, rallongée là où elle monte, perdait sa descente : banc). Paquet mélangé, jamais deux fois de suite, hasard `rf9` :
       fSlalom · LE SLALOM DES GÉANTS : 4-6 virages alternés de 26-44° à 1,6-2,2 rM — les troncs géants se posent d'eux-mêmes à chaque corde
       fLacets · LES LACETS : deux épingles opposées de 160-175° (un Z), les jambes à 2 rayons l'une de l'autre (jamais elles ne se touchent)
       fCorde  · LA DOUBLE CORDE : de biais d'un côté, deux appuis du même côté (100-120° en tout) et une courte droite entre, de biais de l'autre
       fRacines· LES RACINES : 3-4 bosses (± 5 % de pente, longueur d'onde ≥ 8 lissages) en slalom (un virage de 40-55° par demi-bosse) — par-dessus le relief du nœud (ZM)
     Leurs tronçons vont dans MODMARK (ni plot ni huile dedans). */
  const rf9=MODC_ON?mulberry32((rnd()*4294967296)>>>0):null,MM=[],ZM=[],fmPaq=[],MK=[];let fmNext=600*kV,fmLast=-1;
  let mNeed=3,LMOD=LT*.3,LVISE=0,AXE=0,PLAN=null; // (2026-10-19, LA FORÊT AU HASARD) les modules visés et l'abscisse où on les force (3 et LT × 0,3 : comme avant), la longueur visée, l'axe, le plan — fixés par le dessin au hasard
  const fSlalom=()=>{const n=4+((rf9()*3)|0),a=26+rf9()*18,R=rM*(1.6+rf9()*.6);let sg=rf9()<.5?-1:1;arc(sg*a*.5,R);
    for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R);}arc(-sg*a*.5,R);};
  const fLacets=()=>{const sg=rf9()<.5?-1:1,a=160+rf9()*15,R=rM*(1.7+rf9()*.3);droite((40+rf9()*30)*kV);arc(sg*a,R);droite((60+rf9()*50)*kV);arc(-sg*a,R*(.95+rf9()*.15));droite((40+rf9()*30)*kV);};
  const fCorde=()=>{const sg=rf9()<.5?-1:1,R=rM*(1.6+rf9()*.4),T=100+rf9()*20,a1=T*(.45+rf9()*.1);arc(-sg*T/2,R*1.2);arc(sg*a1,R);droite((40+rf9()*40)*kV);arc(sg*(T-a1),Math.max(rM*1.45,R*.9));}; // de biais d'un côté, deux appuis, de biais de l'autre : la route avance
  const fRacines=()=>{const n=3+(rf9()<.5?1:0),lam=Math.max(240,8*Math.max(22,.17*v9*v9/(1.3*15.84)/2.5)),amp=.05,s0=s;let sg=rf9()<.5?-1:1;
    arc(sg*22,lam*.25/(22/57.2958));for(let k=0;k<2*n-1;k++){sg=-sg;const a=40+rf9()*15;arc(sg*a,Math.max(rM*1.55,lam*.5/(a/57.2958)));}arc(-sg*22,lam*.25/(22/57.2958));ZM.push([s0,s,amp,n]);};
  /* ===== TROIS MODULES DE PLUS (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =====
     Le paquet passe de 3 à 6 sortes (même tirage : mélangé dans `rf9`, jamais deux fois de suite) — `?sans=foretmodules` = le paquet d'avant :
       fToboggan · LE TOBOGGAN : une droite de 280-380 m × kV qui monte puis PLONGE (une seule bosse, ± 8 % par-dessus la pente de la zone : ZM) —
                   on s'allège sur la crête, on dévale sous les géants
       fChicane  · LA CHICANE DES TRONCS : gauche-droite-gauche serré (30 / 60 / 30° à 1,45-1,6 rM), une courte droite, et la même en miroir
       fBalcon   · LE BALCON : une longue courbe rapide de 80-110° à 2,6-3,2 rM (à fond, en appui), puis un contre-virage de moitié */
  const fToboggan=()=>{const l=(280+rf9()*100)*kV,s0=s;droite(l);ZM.push([s0,s,.08,1]);};
  const fChicane=()=>{const sg=rf9()<.5?-1:1,R=rM*(1.45+rf9()*.15);arc(sg*30,R);arc(-sg*60,R);arc(sg*30,R);droite((50+rf9()*50)*kV);arc(-sg*30,R);arc(sg*60,R);arc(-sg*30,R);};
  const fBalcon=()=>{const sg=rf9()<.5?-1:1,a=80+rf9()*30,R=rM*(2.6+rf9()*.6);droite(40*kV);arc(sg*a,R);arc(-sg*a*.5,R*.9);};
  const fmJ=FOR_MODULES?[fSlalom,fCorde,fRacines,fToboggan,fChicane,fBalcon]:[fSlalom,fCorde,fRacines]; // (2e tour) plus de LACETS en Z : la forêt était « un peu trop complexe » (fLacets reste écrit, hors du paquet)
  const FM_NOM=['slalom','corde','racines','toboggan','chicane','balcon'];
  const fmTire=()=>{for(let e=0;e<6;e++){if(!fmPaq.length){const t=fmJ.map(function(_,i){return i;});for(let i=t.length-1;i>0;i--){const j=(rf9()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)fmPaq.push(x9);}
    const m=fmPaq.shift();if(m===fmLast)continue;return m;}return 0;};
  const fMod=()=>{const m=fmTire(),i0=C.length-1;fmLast=m;fmJ[m]();MM.push({i0:i0,i1:C.length-1});MK.push(FM_NOM[m]);fmNext=s+(700+rf9()*400)*kV;};
  // LES VIRAGES : 38-80° (un sur trois SERRÉ), vers la cible quand elle n'est pas devant, sinon en slalom ; une respiration de 40-110 m une fois sur trois
  const virages=n=>{for(let k=0;k<n;k++){const r9=rel(),fort=Math.abs(r9)>.5;
    sgV=fort?(r9>0?1:-1):-sgV;let a=38+rnd()*42,R=rM*(1.3+rnd()*1.3);
    if(rnd()<.32){R=rM*(1.15+rnd()*.2);a=30+rnd()*30;}
    if(fort){a=Math.max(30,Math.min(110,Math.abs(r9)*57.3*(.6+rnd()*.5)));if(Math.abs(r9)>2)R=rM*(1.6+rnd()*1.2);} // demi-tour : un GRAND virage, pas une épingle
    else if(rnd()<.4)a*=.6;
    arc(sgV*a,R,R*(.8+rnd()*.4),.12);if(rnd()<.3)droite((40+rnd()*70)*kV);}};
  // ALLER VERS une cible : hors de l'axe, UN virage qui s'y aligne (rayon à la mesure de la distance) ; dans l'axe, un S (deux virages
  // opposés de 22-48°, parfois une respiration) — on avance en slalom, jamais en zigzag sur place
  const vers=(c,ra)=>{cib=c;for(let k=0;k<12&&dist()>ra;k++){const r9=rel(),d=dist();
    if(Math.abs(r9)>.35){const R=FORET_LARGE?Math.max(rM*1.5,Math.min(rM*2.7,d*.29)):Math.max(rM*1.25,Math.min(rM*2.3,d*.26));arc((r9>0?1:-1)*Math.abs(r9)*57.3*(.85+rnd()*.2),R,R*(.85+rnd()*.3),.1);}
    else if(rf9&&s>fmNext&&(zg<-.02&&d>620*kR||MM.length<mNeed&&s>LMOD&&d>300*kR))fMod(); // (2026-10-18) LES MODULES DE LA FORÊT NOIRE (voir fSlalom) — dans une zone qui descend : la forêt garde sa pente
    else{const a=FORET_LARGE?20+rnd()*26:22+rnd()*26,R=rM*(FORET_LARGE?1.55+rnd()*1.3:1.25+rnd()*1.2),sg=rnd()<.5?-1:1;arc(sg*a,R,null,.1);arc(-sg*a*(.8+rnd()*.5),R*(.9+rnd()*.3),null,.1);if(rnd()<.3)droite((40+rnd()*60)*kV);}}};
  // LA BOUCLE : un tour complet (la sortie au-dessus ou en dessous de l'entrée) — le FILET (360°, le rayon qui s'ouvre : la sortie court
  // à côté de l'entrée, ~70 m à l'extérieur) ou le NOEUD (300-330° ou 390-430° : la sortie recoupe l'entrée en biais)
  const boucle=()=>{const r9=rel(),sg=Math.abs(r9)>.3?(r9>0?1:-1):(rnd()<.5?-1:1),R=rM*((FORET_LARGE?1.6:1.45)+rnd()*.5);
    if(rnd()<.62){droite((50+rnd()*40)*kV);const e={x:x,z:z,phi:phi,s:s};arc(sg*360,R,R+30+rnd()*15,.1);BO.push({e:e,sg:sg,R:R});droite((60+rnd()*50)*kV);}
    else{droite((30+rnd()*40)*kV);const e={x:x,z:z,phi:phi,s:s};const a=rnd()<.5?300+rnd()*30:390+rnd()*40;arc(sg*a,R,R*(.85+rnd()*.35),.15);BO.push({e:e,sg:sg,R:R});}};
  const pente=(lo,hi)=>lo+rnd()*(hi-lo);
  /* ---- LE DESSIN : LES NŒUDS ----
     La route traverse une enfilade de NŒUDS — des quartiers de forêt (~600 m de large × l'échelle) où elle trace une ÉTOILE : 4 ou 5 pointes
     visitées en sautant d'un bord à l'autre (135-155° de rotation à chaque pointe, comme on dessine un pentagramme), en slalom, parfois une
     boucle à une pointe — chaque branche recoupe les précédentes. Entre deux nœuds, une LIAISON de virages ; la ligne des nœuds ondule à
     travers une forêt de plusieurs kilomètres. CHAQUE NŒUD A SON RELIEF : il DESCEND (sauter sur la route d'en dessous = un raccourci), il
     MONTE (sauter = revenir en arrière), ou il fait LA VAGUE (descend puis remonte : les deux à la fois). Vu d'en haut, rien ne les distingue. */
  if(!FORET_HASARD){ // la recette d'avant (`?sans=forethasard`), à l'identique — le dessin au hasard est plus bas
  const nN0=3+(kR>1.6&&rnd()<.35?1:0),RHO=225*kR,LC9=typeof longueurCible==='function'?longueurCible():0;let ca=0,cN=[0,RHO+380];
  const nN=LC9?Math.max(1,Math.min(nN0,Math.round((LC9-1200*kR)/(3600*kR)))):nN0; // (LA DURÉE DES MAPS) au JOUER, autant de nœuds (~3,6 km × l'échelle chacun) que la longueur visée en tient — au moins UN : l'étoile qui se recroise et l'arche restent
  const TY=[rnd()<.7?'desc':'vague'],SAC=['desc','monte','vague','desc','monte','vague','desc'];for(let n=1;n<nN;n++)TY.push(SAC.splice(rnd()*SAC.length|0,1)[0]);
  if(!TY.includes('monte'))TY[1+(rnd()*(nN-1)|0)]='monte';{let nm=0;for(let n=0;n<nN;n++)if(TY[n]==='monte'&&++nm>Math.ceil((nN-1)/2))TY[n]='desc';} // TOUJOURS un nœud qui MONTE (le doute : la route d'en dessous peut être derrière), jamais une majorité
  ici('depart');zone(-.02,()=>droite(300*Math.sqrt(kV)));
  for(let n=0;n<nN;n++){
    if(n){ca=Math.max(-1.25,Math.min(1.25,ca+(rnd()<.5?-1:1)*(.5+rnd()*.6)));const e9=2*RHO+(260+rnd()*380)*kR;cN=[cN[0]+Math.sin(ca)*e9,cN[1]+Math.cos(ca)*e9];} // (la ligne des nœuds louvoie : la forêt s'étale sur des kilomètres)
    const ty=TY[n],th9=Math.atan2(x-cN[0],z-cN[1]);
    zone(-pente(.03,.05),()=>vers([cN[0]+Math.sin(th9)*RHO*.9,cN[1]+Math.cos(th9)*RHO*.9],110*kR)); // la LIAISON jusqu'au bord du nœud
    const m0=(rf9?3:4)+(rnd()<.3?1:0),m=LC9?(rf9?3:4):m0,sr=rnd()<.5?-1:1,th0=Math.atan2(x-cN[0],z-cN[1]),jB=rnd()<(rf9?.3:.55)?1+(rnd()*(m-1)|0):-1,s0=s; // (2e tour, Sacha : « la forêt noire est un peu trop complexe ») avec les modules : 3-4 pointes au lieu de 4-5, une boucle complète trois fois sur dix au lieu de 5,5
    for(let j=1;j<=m;j++){const th=th0+sr*j*(135+rnd()*20)*Math.PI/180,r=RHO*(.62+rnd()*.38),c=[cN[0]+Math.sin(th)*r,cN[1]+Math.cos(th)*r];
      let g=ty==='desc'?-pente(.06,.08):ty==='monte'?pente(.045,.06):(j<=m/2?-pente(.07,.09):pente(.05,.065));
      g+=(rnd()-.5)*.05;if(rnd()<.2)g=-Math.sign(g)*pente(.02,.04); // le GRAIN du relief : des bosses, et une branche sur cinq à contre-pente
      zone(g,()=>{vers(c,110*kR);if(j===jB)boucle();});}
    NO.push({c:cN,t:ty,s0:s0,s1:s});
    if(n===(nN>>1)){zone(-.03,()=>{const c9=[cN[0]+Math.sin(ca)*(RHO+700),cN[1]+Math.cos(ca)*(RHO+700)];cib=c9;const a9=rel()*57.3;if(Math.abs(a9)>5)arc(a9,Math.max(rM*2.4,220));
      droite(50);ici('arche0');droite(100);ici('arche');droite(100);ici('arche1');droite(40);});} // L'ARCHE, une fois, à mi-course, sur une droite
  }
  zone(-.03,()=>{cib=[cN[0]+Math.sin(ca)*(RHO+900),cN[1]+Math.cos(ca)*(RHO+900)];vers(cib,500*kR);for(let k=0;k<3&&Math.abs(rel())>.25;k++)arc((rel()>0?1:-1)*Math.min(70,Math.abs(rel())*57.3),Math.max(rM*2,200));});
  zone(-.02,()=>{droite(180);ici('fin');droite(100);});
  }else{
  /* LA FORÊT AU HASARD (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement » — la graine changeait, pas la RECETTE) :
     au JOUER, la forêt partait toujours plein nord (±15°) par ~300 m de droite, UNE pelote au même endroit (~1 km plus loin), l'arche à sa sortie, puis
     une fuite vers le nord (40 graines : écart de forme 0,07 ; l'arche à 57-86 % du parcours). Désormais chaque forêt tire, dans son flux (`gr`) :
     · son AXE, n'importe où sur le cercle (la forêt n'a pas de pente qui la tienne au nord) : le plan se dessine face à +z, puis TOURNE EN BLOC (AXE) ;
     · le nombre de PELOTES — une, ou deux plus petites quand la longueur visée les tient (trois ou quatre hors du JOUER, comme avant) —, leur taille,
       leurs pointes (3-4), leur relief (desc / vague ; avec deux pelotes, l'une MONTE : le doute, jamais la majorité) ;
     · les TRAVERSÉES entre le départ, les pelotes et l'arrivée, la longueur partagée au hasard (la pelote peut venir tout de suite, ou en fin de course),
       chacune avec son CARACTÈRE, jamais deux fois le même de suite : `allee` (le slalom vers la cible, d'avant), `detour` (un grand coude),
       `lacets` (des virages en chaîne), `boucle` (un tour complet au milieu : un pont de plus) ;
     · une ARCHE, ou deux (`arche`, `archeB`), n'importe où sur une traversée (ou à la sortie d'une pelote, s'il n'y a pas de traversée assez longue) ;
     · la ligne des pelotes louvoie (±72° de l'axe) : la forêt avance, elle ne revient jamais sur ses pas.
     Gardé : l'étoile et ses boucles, les croisements (DY) et leur résolution, le relief, les rayons ; les modules, dont le nombre visé suit la longueur
     (`mNeed` : 3 au-delà de ~7 km, sinon 1-2 — avant, au JOUER, on en voulait 3 et la note ne passait jamais : 8 essais à chaque forêt). La note
     écarte aussi un essai qui s'écarte de la longueur visée (au-delà de ×1,3 ou en deçà de ×0,75). */
  const LC9=typeof longueurCible==='function'?longueurCible():0,dA=(a,l)=>[Math.sin(a)*l,Math.cos(a)*l],RHO=225*kR;
  LVISE=LC9||LT*(.9+rnd()*.3);AXE=rnd()*6.2832-3.1416;PLAN=[];
  mNeed=3;LMOD=LC9?1e9:LVISE*.3; // (au JOUER, plus de module FORCÉ n'importe où — 0,7-1 km chacun, la forêt débordait : ils sont PLACÉS, voir MO9)
  const K=LC9?(LVISE>=5000*kR&&rnd()<.5?2:1):3+(kR>1.6&&rnd()<.35?1:0),NK=[];
  for(let n=0;n<K;n++){const rho=RHO*(K>1&&LC9?.58+rnd()*.2:LC9?.72+rnd()*.3:.8+rnd()*.3),m=3+(rnd()<(LC9&&(K>1||LVISE<6000*kR)?.12:.35)?1:0);NK.push({rho:rho,m:m,est:3.4*rho*m,c:null});}
  const TY=NK.map(()=>rnd()<.62?'desc':'vague');if(K>1)TY[(rnd()*K)|0]='monte';
  const nR=K+1,nA=1+((!LC9||LVISE>=4500*kR)&&rnd()<.45?1:0),W=[];for(let i=0;i<nR;i++)W.push(!i?.1+rnd()*1.6:i<nR-1?.4+rnd()*1.1:.7+rnd()*1.1); // (les poids : la première peut être très courte — la pelote tout de suite —, la dernière jamais)
  let sNK=0;for(const o of NK)sNK+=o.est;
  const sW=W.reduce((a,b)=>a+b,0),lib9=Math.max(nR*300*kR,LVISE-(260+nA*290+280)-sNK),RL=W.map(w=>Math.max(250*kR,lib9*w/sW)); // (le partage prévu : il choisit où vont les arches ; la longueur de chaque traversée est reprise en route, voir plus bas)
  const MO9=RL.map(()=>false);if(LC9&&rf9){const n9=1+(LVISE>=5200*kR?1:0)+(LVISE>=8000*kR&&rnd()<.5?1:0),cd=RL.map((l,i)=>i).filter(i=>RL[i]>=500*kR).sort((a,b)=>RL[b]-RL[a]);
    for(let j=0;j<n9&&j<cd.length;j++)MO9[cd[j]]=true;mNeed=Math.max(1,Math.min(n9,cd.length));} // LES MODULES, PLACÉS : un, deux (≥ 5,2 km), parfois trois (≥ 8 km), dans les traversées les plus longues
  const CAR9=['allee','detour','lacets','boucle'],RC=[];{let cP='';for(let i=0;i<nR;i++){let c='';for(let e=0;e<8;e++){c=CAR9[(rnd()*4)|0];if(c!==cP&&(c!=='boucle'||RL[i]>=800*kR))break;}
    if(c===cP||c==='boucle'&&RL[i]<800*kR)c=cP==='allee'?'detour':'allee';RC.push(c);cP=c;}}
  const AR9=[];{const ok=RL.map(l=>l>=450*kR?l:0);
    for(let a=0;a<nA;a++){const k=a?'archeB':'arche',cd=[];for(let i=0;i<nR;i++)if(ok[i]&&!AR9.some(q=>q.i===i))cd.push(i);
      if(!cd.length){AR9.push({i:-1,n:(rnd()*K)|0,k:k});continue;} // pas de traversée assez longue : à la sortie d'une pelote
      let tot=0;for(const i of cd)tot+=ok[i];let u=rnd()*tot,ch=cd[cd.length-1];for(const i of cd){u-=ok[i];if(u<=0){ch=i;break;}}AR9.push({i:ch,n:-1,f:ch===nR-1?.15+rnd()*.4:.2+rnd()*.5,k:k});}} // (sur la dernière traversée, jamais collée à l'arrivée : sinon arche + arrivée = 600 m de droite)
  const arche=k=>zone(-.03,()=>{const a9=rel()*57.3;if(Math.abs(a9)>5)arc(a9,Math.max(rM*2.4,220));droite(50);ici(k+'0');droite(100);ici(k);droite(100);ici(k+'1');droite(40);}); // L'ARCHE, sur une droite (comme avant)
  const leg=(car,T,ra,mo)=>{if(mo&&rf9){const v=[T[0]-x,T[1]-z];vers([x+v[0]*.3,z+v[1]*.3],100*kR);fMod();} // un bout de traversée vers T : son module (s'il en porte un), puis son caractère
    const v=[T[0]-x,T[1]-z],d=Math.hypot(v[0],v[1]);
    if(car==='detour'&&d>520*kR){const b=(rnd()<.5?-1:1)*(.6+rnd()*.5),f=.45+rnd()*.2,c9=Math.cos(b),s9=Math.sin(b);vers([x+(v[0]*c9+v[1]*s9)*f,z+(v[1]*c9-v[0]*s9)*f],150*kR);}
    else if(car==='lacets'&&d>300*kR){cib=T;virages(2+((rnd()*3)|0));}
    else if(car==='boucle'&&d>380*kR){const f=.35+rnd()*.25;vers([x+v[0]*f,z+v[1]*f],120*kR);cib=T;boucle();}
    vers(T,ra);};
  const traversee=(i,T,ra)=>{const car=RC[i],aa=AR9.find(q=>q.i===i),g=-pente(.025,.05),s0=s;
    if(aa){const v=[T[0]-x,T[1]-z],dv=Math.hypot(v[0],v[1])||1,f9=Math.max(0,Math.min(aa.f,(dv-290-350*kR)/dv)),A=[x+v[0]*f9,z+v[1]*f9]; // (l'arche finit toujours ~350 m avant la cible : jamais arche + arrivée en une seule droite)
      zone(g,()=>{if(f9>=.5)leg(car,A,90*kR,MO9[i]);else vers(A,90*kR);});cib=T;arche(aa.k);zone(g,()=>{if(f9<.5)leg(car,T,ra,MO9[i]);else vers(T,ra);});}
    else zone(g,()=>leg(car,T,ra,MO9[i]));
    PLAN.push(car+(aa?'+'+aa.k:'')+':'+Math.round(s-s0));}; // (le plan, pour dbgForet / dbgTrace : chaque morceau et sa longueur)
  const noeud=n=>{const o=NK[n],cN=o.c,ty=TY[n],m=o.m,sr=rnd()<.5?-1:1,th0=Math.atan2(x-cN[0],z-cN[1]),jB=rnd()<(rf9?.3:.55)?1+(rnd()*(m-1)|0):-1,s0=s; // L'ÉTOILE (comme avant, à la taille de SA pelote)
    for(let j=1;j<=m;j++){const th=th0+sr*j*(130+rnd()*28)*Math.PI/180,r=o.rho*(.62+rnd()*.38),c=[cN[0]+Math.sin(th)*r,cN[1]+Math.cos(th)*r];
      let g=ty==='desc'?-pente(.06,.08):ty==='monte'?pente(.045,.06):(j<=m/2?-pente(.07,.09):pente(.05,.065));
      g+=(rnd()-.5)*.05;if(rnd()<.2)g=-Math.sign(g)*pente(.02,.04);
      zone(g,()=>{vers(c,110*kR);if(j===jB)boucle();});}
    NO.push({c:cN,t:ty,s0:s0,s1:s});PLAN.push('pelote:'+ty+m+(jB>0?'b':'')+':'+Math.round(s-s0));};
  ici('depart');zone(-.02,()=>droite((150+rnd()*230)*Math.sqrt(kV)));
  let ca=(rnd()-.5)*2,cP9=[x,z]; // la LIGNE : son cap autour de l'axe, et d'où elle repart (le départ, puis le centre de la dernière pelote)
  for(let i=0;i<nR;i++){
    if(i)ca=Math.max(-1.3,Math.min(1.3,ca+(rnd()<.5?-1:1)*(.5+rnd()*.65)));
    /* LA LONGUEUR, REPRISE EN ROUTE : ce qui reste de la longueur visée, moins les pelotes à venir (≈ 3,4 × rayon × pointes : mesuré), les arches à
       venir et l'arrivée, partagé entre les traversées qui restent selon leurs poids ; une traversée roule ~1,5 × sa corde (ses S, ses coudes, ses
       modules : mesuré) — la dernière rattrape ce que les pelotes ont pris de plus ou de moins. */
    let fx9=280+(i===nR-1?250:0),sw9=0;for(let n=i;n<K;n++)fx9+=NK[n].est;for(const q of AR9)if(q.i>=i||q.n>=i)fx9+=290;for(let j=i+1;j<nR;j++)if(MO9[j])fx9+=600*kR;for(let j=i;j<nR;j++)sw9+=W[j];
    const part=Math.max(220*kR,(LVISE-s-fx9)*W[i]/sw9); // la part de CETTE traversée
    if(MO9[i]&&part<1100*kR){MO9[i]=false;if(i<nR-1)MO9[i+1]=true;} // trop courte pour son module : il passe à la suivante
    if(RC[i]==='boucle'&&part-(MO9[i]?600*kR:0)<1000*kR||RC[i]==='lacets'&&part-(MO9[i]?600*kR:0)<700*kR){const p9=i?RC[i-1]:'',n9=i<nR-1?RC[i+1]:'';RC[i]=['detour','allee'].find(c=>c!==p9&&c!==n9)||(p9==='allee'?'detour':'allee');} // trop courte pour son caractère : un plus sobre
    const D=Math.max(220*kR,part-(RC[i]==='boucle'?650*kR:RC[i]==='lacets'?350*kR:0)-(MO9[i]?600*kR:0))/(i===nR-1?1.5:1.8); // (la boucle, les lacets, le module : leur longueur en plus ; avant la dernière, on compte large — c'est elle qui rattrape)
    if(i<K){const o=NK[i],rP=i?NK[i-1].rho:0,v=dA(ca,D+o.rho);o.c=[x+v[0],z+v[1]]; // (comptée depuis LA SORTIE de la pelote d'avant…
      if(i&&Math.hypot(o.c[0]-cP9[0],o.c[1]-cP9[1])<rP+o.rho+120*kR){const v2=dA(ca,rP+o.rho+120*kR);o.c=[cP9[0]+v2[0],cP9[1]+v2[1]];} // …mais jamais deux pelotes l'une dans l'autre)
      const th9=Math.atan2(x-o.c[0],z-o.c[1]);traversee(i,[o.c[0]+Math.sin(th9)*o.rho*.9,o.c[1]+Math.cos(th9)*o.rho*.9],110*kR);noeud(i);cP9=o.c;
      const an=AR9.find(q=>q.n===i);if(an){const w=dA(ca,o.rho+700);cib=[o.c[0]+w[0],o.c[1]+w[1]];arche(an.k);PLAN.push(an.k);}}
    else{const u9=dA(ca,1),pj=(x-cP9[0])*u9[0]+(z-cP9[1])*u9[1],v=dA(ca,Math.max(D,(K?150*kR:0)-(K?pj:0))),T=[x+v[0],z+v[1]];traversee(i,T,140*kR); // (depuis la sortie de la dernière pelote ; si elle sort par l'arrière, l'arrivée passe devant elle)
      zone(-.03,()=>{const w=dA(ca,700);cib=[T[0]+w[0],T[1]+w[1]];for(let k=0;k<3&&Math.abs(rel())>.25;k++)arc((rel()>0?1:-1)*Math.min(70,Math.abs(rel())*57.3),Math.max(rM*2,200));});}}
  zone(-.02,()=>{droite(180);ici('fin');droite(100);});
  if(LC9&&rf9)mNeed=MO9.filter(Boolean).length;
  }
  // ---- LE RELIEF : la pente de chaque tronçon, intégrée tous les 10 m ----
  const L=s,nY=Math.ceil(L/10)+2,GY=new Float64Array(nY);
  for(const o of ZO){const a=Math.floor(o[0]/10),b=Math.min(nY-1,Math.ceil(o[1]/10));for(let k=a;k<=b;k++)GY[k]=o[2];}
  for(const o of ZM){const L9=o[1]-o[0];for(let k=Math.ceil(o[0]/10);k<=Math.min(nY-1,Math.floor(o[1]/10));k++){const u=(k*10-o[0])/L9;GY[k]+=o[2]*Math.sin(u*o[3]*6.2832)*Math.min(1,u*o[3]*2,(1-u)*o[3]*2);}} // (2026-10-18) LES RACINES (voir fRacines)
  for(let k=0;k<30&&k<nY;k++)GY[k]=Math.max(GY[k],-.02-.004*k); // le sas du portail en douceur
  const Y=new Float64Array(nY);for(let k=1;k<nY;k++)Y[k]=Y[k-1]+(GY[k-1]+GY[k])*5;
  // le LISSAGE des crêtes et des creux : la caisse ne décolle pas d'une simple cassure de pente (κ·v² ≤ ~1,3 g)
  const lisse=(sig)=>{const r=Math.ceil(sig*2.5/10),w=[];let sw=0;for(let k=-r;k<=r;k++){const v=Math.exp(-(k*10)*(k*10)/(2*sig*sig));w.push(v);sw+=v;}
    const T9=Float64Array.from(Y);for(let k=0;k<nY;k++){let a=0,ww=0;for(let j=-r;j<=r;j++){const q=Math.max(0,Math.min(nY-1,k+j));a+=T9[q]*w[j+r];ww+=w[j+r];}Y[k]=a/ww;}};
  const SIG=Math.max(22,.17*v9*v9/(1.3*15.84)/2.5);lisse(SIG);
  // ---- LES CROISEMENTS : les paires du relevé fin à moins de 78 m en plan, 250 m de route au moins entre les deux ----
  const nD=D.length/3,CG=80,H=new Map(),cle=(a,b)=>a*100003+b;
  for(let i=0;i<nD;i++){const k=cle(Math.floor(D[3*i]/CG),Math.floor(D[3*i+1]/CG));let a=H.get(k);if(!a)H.set(k,a=[]);a.push(i);}
  const PR=[],DC=2*RH+22;
  for(let i=0;i<nD;i+=2){const cx=Math.floor(D[3*i]/CG),cz=Math.floor(D[3*i+1]/CG);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L9=H.get(cle(cx+a,cz+b));if(!L9)continue;
      for(const j of L9){if(D[3*j+2]-D[3*i+2]<250)continue;const d=Math.hypot(D[3*i]-D[3*j],D[3*i+1]-D[3*j+1]);if(d<DC)PR.push([i,j,d]);}}}
  // regroupement : les paires tombent dans des cases (i/6, j/6) — une case garde sa paire la plus serrée ; des cases voisines = UN croisement
  const CA=new Map();for(const p of PR){const k=Math.floor(p[0]/6)*1e5+Math.floor(p[1]/6),o=CA.get(k);if(!o||p[2]<o[2])CA.set(k,p);}
  const vu=new Set(),CR=[];
  for(const [k0] of CA){if(vu.has(k0))continue;const pile=[k0],mem=[];vu.add(k0);
    while(pile.length){const k=pile.pop();mem.push(CA.get(k));const a0=Math.floor(k/1e5),b0=k-a0*1e5;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const q=(a0+a)*1e5+b0+b;if(CA.has(q)&&!vu.has(q)){vu.add(q);pile.push(q);}}}
    CR.push(mem);}
  const yA=i=>{const f=D[3*i+2]/10,k=Math.min(nY-2,Math.floor(f)),w=f-k;return Y[k]*(1-w)+Y[k+1]*w;};
  // le SENS de chaque croisement : celui que le relief lui donne ; s'il hésite (< 8 m), tiré au sort — 6 fois sur 10 la route d'en dessous est
  // DEVANT (un raccourci), 4 fois DERRIÈRE (un piège)
  const SGN=CR.map(mem=>{let m=0;for(const p of mem)m+=yA(p[0])-yA(p[1]);m/=mem.length;return Math.abs(m)>8?Math.sign(m):(rnd()<.6?1:-1);});
  // la RÉSOLUTION : des bosses gaussiennes (σ = 200 m × kR, 12 m au plus par passe) relèvent la route du dessus et creusent celle du dessous, jusqu'à DY
  const SB=200*kR,rB=Math.ceil(SB*2.6/10),WB=[];for(let k=-rB;k<=rB;k++)WB.push(Math.exp(-(k*10)*(k*10)/(2*SB*SB)));
  const bosse=(s9,h)=>{const c=Math.round(s9/10);for(let k=-rB;k<=rB;k++){const q=c+k;if(q>=0&&q<nY)Y[q]+=h*WB[k+rB];}};
  const VI=new Float64Array(CR.length),BA=new Uint8Array(CR.length);
  for(let it=0;it<70;it++){let pire=0;
    for(let c=0;c<CR.length;c++){const sg=SGN[c];let vm=0,pm=null;for(const p of CR[c]){const v=DY+1-sg*(yA(p[0])-yA(p[1]));if(v>vm){vm=v;pm=p;}}
      VI[c]=vm;if(pm){pire=Math.max(pire,vm);const h=Math.min(12,vm*.5);bosse(D[3*pm[0]+2],sg*h);bosse(D[3*pm[1]+2],-sg*h);}}
    if(pire<.5)break;
    if(it===30)for(let c=0;c<CR.length;c++)if(VI[c]>14&&!BA[c]){SGN[c]=-SGN[c];BA[c]=1;}} // un croisement qui résiste : l'autre route passe dessus
  // ---- LA NOTE : croisements encore trop serrés, pentes hors bornes (descente > 15 %, montée > 12 % sur 40 m), pelote trop lâche ----
  let note=0,dyMin=1e9;
  for(let c=0;c<CR.length;c++){for(const p of CR[c]){const dy=Math.abs(yA(p[0])-yA(p[1]));if(dy<dyMin)dyMin=dy;if(dy<DY-1)note+=(DY-1-dy)*.5;}}
  for(let k=4;k<nY;k++){const g=(Y[k]-Y[k-4])/40;if(g<-.15)note+=(-.15-g)*40;if(g>.12)note+=(g-.12)*40;}
  const nKm=CR.length/(L/1000),nKmV=rf9?.7:1.1;if(nKm<nKmV)note+=(nKmV-nKm)*8; // (2e tour) moins emmêlée : 0,7 croisement/km suffit avec les modules
  if(rf9&&MM.length<mNeed)note+=(mNeed-MM.length)*4; // (2026-10-18) au moins TROIS modules (voir fSlalom) : un essai qui en a moins est repris — (2026-10-19, au hasard) autant que la longueur en tient (mNeed)
  if(LVISE){const r9=L/LVISE;if(r9>1.3)note+=(r9-1.3)*12;else if(r9<.75)note+=(.75-r9)*12;} // (2026-10-19, LA FORÊT AU HASARD) près de la longueur visée
  if(LVISE)for(const k of ['arche','archeB']){const q=Q[k];if(!q)continue; // (2026-10-19) LA PLACE DE L'ARCHE : aucune autre route à moins de 200 m (foretArche renonce à une arche dont le tronc croise un autre étage — au hasard, ça arrivait une fois sur deux)
    for(let i=0;i<nD;i+=2){if(Math.abs(D[3*i+2]-q.s)<330)continue;if(Math.hypot(D[3*i]-q.x,D[3*i+1]-q.z)<200){note+=3;break;}}}
  // ---- LES POINTS DE CONTRÔLE ----
  const yS=s9=>{const f=s9/10,k=Math.max(0,Math.min(nY-2,Math.floor(f))),w=f-k;return Y[k]*(1-w)+Y[k+1]*w;};
  if(AXE){const c9=Math.cos(AXE),s9=Math.sin(AXE),ro=p=>{const x9=p[0]*c9+p[1]*s9;p[1]=p[1]*c9-p[0]*s9;p[0]=x9;}; // (2026-10-19, LA FORÊT AU HASARD) le plan dessiné face à +z TOURNE EN BLOC autour du départ
    for(const c of C)ro(c);for(const k in Q){const o=Q[k],q=[o.x,o.z];ro(q);o.x=q[0];o.z=q[1];o.phi+=AXE;}for(const o of BO){const q=[o.e.x,o.e.z];ro(q);o.e.x=q[0];o.e.z=q[1];}for(const o of NO){o.c=o.c.slice();ro(o.c);}}
  const ctrl=C.map((c,k)=>new THREE.Vector3(c[0],yS(SC[k]),c[1]));
  for(const k in Q){const o=Q[k];Q[k]={p:new THREE.Vector3(o.x,yS(o.s),o.z),phi:o.phi,s:o.s};}
  const BO9=BO.map(o=>({e:new THREE.Vector3(o.e.x,yS(o.e.s),o.e.z),sg:o.sg,R:o.R}));
  let dsM=0;for(const m of CR)for(const p of m)dsM=Math.max(dsM,D[3*p[1]+2]-D[3*p[0]+2]);
  return {dsM:Math.round(dsM),ctrl:ctrl,Q:Q,BO:BO9,note:note,croise:CR.length,dyMin:Math.round(dyMin),L:L,NO:NO,mods:MM,mk:MK,plan:PLAN,axe:AXE};}
/* ---------------- L'ATELIER DES ARBRES : un petit maillage indexé (position, normale, aA, aC, aB) ----------------
   aA = (partie, occlusion, hasard, hauteur relative) · aC = la couleur de base · aB = (écorce, mousse).
   Parties : 0 écorce · 1 feuilles · 2 aiguilles · 3 peint (chaumière, champignon) · 4 fenêtre (luit la nuit) · 5 VISAGE (luit la nuit)
   · 6 points de champignon (luisent la nuit) · 7 pierre. Écorces : 0 épicéa · 1 hêtre · 2 chêne · 3 bouleau · 4 pin · 5 bois peint. */
function fbNew(){return {P:[],N:[],A:[],C:[],B:[],I:[],n:0};}
function fbV(K,x,y,z,nx,ny,nz,a,c,b){K.P.push(x,y,z);K.N.push(nx,ny,nz);K.A.push(a[0],a[1],a[2],a[3]);K.C.push(c[0],c[1],c[2]);K.B.push(b[0],b[1]);return K.n++;}
function fbGeo(K){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(K.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(K.N,3));
  g.setAttribute('aA',new THREE.Float32BufferAttribute(K.A,4));g.setAttribute('aC',new THREE.Float32BufferAttribute(K.C,3));g.setAttribute('aB',new THREE.Float32BufferAttribute(K.B,2));
  g.setIndex(K.n>65535?new THREE.Uint32BufferAttribute(K.I,1):new THREE.Uint16BufferAttribute(K.I,1));g.computeBoundingSphere();return g;}
/* LE TUBE : un tronc, une branche, une racine — une ligne de points et un rayon par point, des anneaux transportés (sans vrille), le
   relief d'écorce (`rug` : des côtes verticales, `noeud` : des bosses), la mousse qui monte du pied. ytop : la hauteur de l'arbre (pour aA.w). */
function fbTube(K,pts,rad,sides,o){
  const n=pts.length,col=o.col,ec=o.ec|0,mo=o.mousse||0,rug=o.rug||0,ytop=o.ytop||1,rg=o.rg||Math.random,part=o.part||0,cap=o.cap;
  const T=[],U=[],W=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];const t=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();T.push(t);}
  let u=Math.abs(T[0].y)<.9?new THREE.Vector3(0,1,0).cross(T[0]).normalize():new THREE.Vector3(1,0,0).cross(T[0]).normalize();
  for(let i=0;i<n;i++){if(i>0){const q=new THREE.Quaternion().setFromUnitVectors(T[i-1],T[i]);u.applyQuaternion(q);u.addScaledVector(T[i],-u.dot(T[i])).normalize();}
    U.push(u.clone());W.push(new THREE.Vector3().crossVectors(T[i],u));}
  const ph=rg()*6.283,base=K.n;
  for(let i=0;i<n;i++){const p=pts[i],r=rad[i];
    for(let k=0;k<=sides;k++){const an=k/sides*6.2832,c=Math.cos(an),s=Math.sin(an);
      let rr=r*(1+rug*(.5*Math.sin(an*7+ph+i*.4)+.3*Math.sin(an*13+ph*2)));
      const nx=U[i].x*c+W[i].x*s,ny=U[i].y*c+W[i].y*s,nz=U[i].z*c+W[i].z*s;
      const hy=p[1]/ytop,ao=Math.min(1,.42+.58*Math.min(1,hy*2.2+(o.aoK||0)));
      fbV(K,p[0]+nx*rr,p[1]+ny*rr,p[2]+nz*rr,nx,ny,nz,[part,ao,rg(),o.fixe?0:Math.max(0,hy)],col,[ec,o.fixe?mo:mo*(1-Math.min(1,hy*1.6))]);}}
  for(let i=0;i<n-1;i++)for(let k=0;k<sides;k++){const a=base+i*(sides+1)+k,b=a+sides+1;K.I.push(a,a+1,b,a+1,b+1,b);} // (faces tournées vers l'extérieur)
  if(cap){const p=pts[n-1],t=T[n-1],c0=fbV(K,p[0]+t.x*rad[n-1]*.6,p[1]+t.y*rad[n-1]*.6,p[2]+t.z*rad[n-1]*.6,t.x,t.y,t.z,[part,.8,rg(),p[1]/ytop],col,[ec,0]);
    const r0=base+(n-1)*(sides+1);for(let k=0;k<sides;k++)K.I.push(r0+k,r0+k+1,c0);}
}
/* LA TOUFFE : une boule de feuillage bosselée (icosphère subdivisée, bosses de bruit = les grappes de feuilles). Sa normale est mêlée
   à celle de la COURONNE entière (cc, cr) : la lumière modèle l'arbre comme un volume doux, pas comme un tas de balles. */
const FB_ICO={};
function fbIco(det){if(FB_ICO[det])return FB_ICO[det];
  const t=(1+Math.sqrt(5))/2;let V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(function(v){const l=Math.hypot(v[0],v[1],v[2]);return [v[0]/l,v[1]/l,v[2]/l];});
  let F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  for(let d=0;d<det;d++){const mid=new Map(),F2=[];const m=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;let i=mid.get(k);if(i===undefined){const p=V[a],q=V[b],x=p[0]+q[0],y=p[1]+q[1],z=p[2]+q[2],l=Math.hypot(x,y,z);i=V.length;V.push([x/l,y/l,z/l]);mid.set(k,i);}return i;};
    for(const f of F){const a=m(f[0],f[1]),b=m(f[1],f[2]),c=m(f[2],f[0]);F2.push([f[0],a,c],[f[1],b,a],[f[2],c,b],[a,b,c]);}F=F2;}
  return FB_ICO[det]={V:V,F:F};}
function fbTouffe(K,c,r,det,o){
  const I=fbIco(det),rg=o.rg,cc=o.cc,cr=o.cr,col=o.col,ytop=o.ytop,part=o.part||1,bos=o.bos==null?.22:o.bos,sq=o.sq||1,mix=o.mix==null?.55:o.mix;
  const s1=rg()*50,s2=rg()*50,base=K.n,pos=[],nrm=[];
  for(const v of I.V){const bump=1+bos*(Math.sin(v[0]*4.1+s1)*Math.sin(v[1]*3.7+s2)*Math.sin(v[2]*4.3+s1*.7)+.45*Math.sin(v[0]*9+v[1]*7+s2)*Math.sin(v[2]*8+s1));
    pos.push([c[0]+v[0]*r*bump,c[1]+v[1]*r*bump*sq,c[2]+v[2]*r*bump]);nrm.push([0,0,0]);}
  for(const f of I.F){const a=pos[f[0]],b=pos[f[1]],d=pos[f[2]],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const k of f){nrm[k][0]+=nx;nrm[k][1]+=ny;nrm[k][2]+=nz;}}
  const tint=o.tint?o.tint(rg):1;
  for(let i=0;i<pos.length;i++){const p=pos[i];let n=nrm[i],l=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/l,n[1]/l,n[2]/l];
    let gx=p[0]-cc[0],gy=(p[1]-cc[1])*1.15,gz=p[2]-cc[2];const gl=Math.hypot(gx,gy,gz)||1;gx/=gl;gy/=gl;gz/=gl;
    let nx=n[0]*(1-mix)+gx*mix,ny=n[1]*(1-mix)+gy*mix,nz=n[2]*(1-mix)+gz*mix;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    const ext=Math.min(1,gl/cr),ao=Math.max(.18,Math.min(1,.30+.55*ext+.32*gy)); // le cœur et le dessous de la couronne dans l'ombre
    fbV(K,p[0],p[1],p[2],nx,ny,nz,[part,ao,rg(),o.fixe?0:p[1]/ytop],[col[0]*tint,col[1]*tint,col[2]*tint],[0,o.mousse||0]);}
  for(const f of I.F)K.I.push(base+f[0],base+f[1],base+f[2]);
}
/* L'ÉTAGE DE CONIFÈRE : une jupe en étoile — `nb` branches dont la pointe RETOMBE, un sommet au-dessus, un dessous creusé ; les étages
   empilés font la silhouette de l'épicéa (pointes qui pendent) ou du sapin (étages plus plats). */
function fbJupe(K,y,r,h,nb,o){
  const rg=o.rg,col=o.col,ytop=o.ytop,drp=o.drp==null?.45:o.drp,ph=rg()*6.283,base=K.n,cy=y+h*.62,tint=.88+rg()*.24;
  const cT=fbV(K,0,cy,0,0,1,0,[2,.95,rg(),cy/ytop],[col[0]*tint*1.08,col[1]*tint*1.08,col[2]*tint*1.08],[0,0]);
  const cB=fbV(K,0,y-h*.15,0,0,-1,0,[2,.25,rg(),y/ytop],[col[0]*.6,col[1]*.6,col[2]*.6],[0,0]);
  const R=[];for(let k=0;k<nb*2;k++){const tip=k%2===0,an=ph+k/(nb*2)*6.2832+(rg()-.5)*.18,rr=tip?r*(.9+rg()*.22):r*(.52+rg()*.12),yy=tip?y-h*drp*(.8+rg()*.4):y+h*.08;
    const ox=Math.cos(an),oz=Math.sin(an);const nx=ox*.72,ny=.69,nz=oz*.72;
    R.push(fbV(K,ox*rr,yy,oz*rr,nx,ny,nz,[2,tip?.85:.55,rg(),yy/ytop],[col[0]*tint*(tip?1.06:.9),col[1]*tint*(tip?1.06:.9),col[2]*tint*(tip?1.02:.9)],[0,0]));}
  const m=R.length;for(let k=0;k<m;k++){const a=R[k],b=R[(k+1)%m];K.I.push(cT,b,a,cB,a,b);}
}
/* LE RIDEAU (2026-10-17, les PLEUREURS) : une jupe de MÈCHES qui pendent — `n` colonnes sur l'arc [a0, a0+ar] (un cercle
   entier : la jupe se referme), chacune sa longueur (le bas DÉCHIQUETÉ), un pli sur deux rentré et sa normale penchée (les mèches se lisent
   dans la lumière), un évasement puis la chute ; les pointes un peu plus claires. Faces tournées vers l'EXTÉRIEUR (FrontSide, le programme
   des arbres). aA.w dépasse 1 vers le bas : le vent du shader (∝ h²) balance le bas des mèches bien plus que le haut. */
function fbRideau(K,o){
  const rg=o.rg,n=o.n,m=o.m,R=o.R,L=o.L,y0=o.y0,cx=o.cx||0,cz=o.cz||0,a0=o.a0||0,ar=o.ar==null?6.2832:o.ar,plein=ar>=6.28,col=o.col,ytop=o.ytop,pli=o.pli==null?.07:o.pli,ev=o.ev==null?.12:o.ev,vt=o.vent||1,pas=ar/n;
  // (v2, même jour) des MÈCHES séparées — la jupe pleine se lisait comme un mur vert : chaque colonne est sa propre lanière qui s'affine vers la
  // pointe ; entre elles, du jour — et un second rang, plus court et plus sombre, en quinconce derrière (la profondeur du rideau)
  for(let c9=0;c9<2;c9++){const nn=plein?n:n-c9;
   for(let k=0;k<nn;k++){const a=a0+pas*(k+(c9?(plein?0:1):.5)+(rg()-.5)*.3),ca=Math.cos(a),sa=Math.sin(a),hw=pas*(c9?.34:.29)*(.85+rg()*.3),
      rk=R*(c9?.87:1)*(.94+rg()*.12)*(k%2?1-pli:1+pli*.4),lk=L*(c9?.74:1)*(.7+rg()*.45)*(!plein&&!c9&&(k===0||k===nn-1)?.6:1),tk=(.82+rg()*.36)*(c9?.86:1),g=k%2?.3:-.3;
     let nx=ca-sa*g,nz=sa+ca*g;{const l9=Math.hypot(nx,nz);nx/=l9;nz/=l9;}
     for(let f9=0;f9<(o.deux?2:1);f9++){const sg=f9?-1:1,b0=K.n; // (o.deux : la face du DEDANS aussi — sous un géant, on roule sous son rideau)
      for(let j9=0;j9<=m;j9++){const t=j9/m,r=rk*(1+ev*Math.sin(Math.min(1,t*2.2)*1.5708)),y=y0-lk*t,h9=hw*(1-.62*t),ny=.22*(1-t),sh=(.9+.3*t)*tk*(f9?.92:1);
        const ao=(c9?.48+.36*Math.min(1,t*1.6):.56+.42*Math.min(1,t*1.6))*(f9?.9:1),A9=[1,ao,rg(),Math.max(0,y0/ytop)*.8+t*.55*vt],C9=[col[0]*sh*(1+.18*t),col[1]*sh*(1+.08*t),col[2]*sh];
        for(const d9 of [-h9,h9]){const b9=a+d9;fbV(K,cx+Math.cos(b9)*r,y,cz+Math.sin(b9)*r,sg*nx,ny,sg*nz,A9,C9,[1,0]);}}
      for(let j9=0;j9<m;j9++){const l=b0+j9*2,rr=l+1,l2=l+2,r2=l+3;if(f9)K.I.push(l,l2,rr,rr,l2,r2);else K.I.push(l,rr,l2,rr,r2,l2);}}}}
}
/* LES MINI-CUBES (2026-10-17, Léo : « moins Minecraft, notre touche à nous ; évite le cube ; tous les arbres un tronc à peu près cylindrique ; fais
   des mini-cubes ; encore plus de brillance ; que la scène soit belle, l'obscurité belle aussi ; joue sur le contraste ») : les arbres gardent leurs
   formes (troncs ronds, couronnes, rideaux) et le FEUILLAGE se peint en cubes de 42 cm — la grille suit l'arbre (position sans le vent × l'échelle
   de l'exemplaire), chaque mini-cube lit les peintures en son centre (une teinte), prend sa nuance et sa propre facette (sa normale penchée au
   hasard : il attrape la lumière à sa façon), un reflet serré (la BRILLANCE) et parfois un ÉCLAT qui scintille ; tout se fond quand le cube tombe
   sous ~2 px (aucun fourmillement au loin). Zéro triangle de plus, le même programme. */
/* ---------------- LES ESSENCES : six arbres de la Forêt-Noire, trois niveaux de détail chacun ----------------
   Chaque bâtisseur dessine l'arbre « nominal » (pied en 0, mètres) et rend {h : sa hauteur, cr : le rayon de sa couronne, cy : le centre
   de la couronne}. lod 0 = de près (touffes bosselées, écorce à côtes) · 1 = à mi-distance · 2 = au loin (une masse, quelques triangles).
   Les couleurs sont des ALBÉDOS (l'étalonnage du jeu passe après) ; la teinte par arbre, l'automne des érables, la nuit : dans le shader. */
const FC={hetre:[.12,.235,.07],chene:[.085,.175,.055],bouleau:[.18,.28,.08],epicea:[.032,.085,.055],sapin:[.036,.096,.074],pin:[.075,.145,.06],
  eHetre:[.36,.36,.335],eChene:[.31,.26,.21],eBouleau:[.86,.85,.81],eEpicea:[.32,.21,.16],ePin:[.56,.31,.19],eSeq:[.38,.16,.10],seq:[.07,.165,.075],
  saule:[.20,.30,.065],pleureur:[.14,.26,.07],eSaule:[.30,.27,.22]}; // (2026-10-17) les PLEUREURS : le saule vert-jaune clair, le hêtre pleureur vert tendre, l'écorce grise du saule
const FOR_ESP={
  hetre:function(K,lod,rg){const H=28,cy=19,cr=8.6,o={ytop:H,rg:rg};
    fbTube(K,[[0,0,0],[.15,5,.1],[.1,10,-.15],[-.1,13.5,0]],[.62,.48,.40,.30],lod?5:8,{col:FC.eHetre,ec:1,mousse:.6,ytop:H,rg:rg,rug:lod?0:.03});
    if(lod===0)for(let k=0;k<4;k++){const an=k*1.57+rg()*.6,x=Math.cos(an),z=Math.sin(an);fbTube(K,[[0,10+k*.8,0],[x*2.5,14+k*.6,z*2.5],[x*4.6,17.5,z*4.6]],[.26,.18,.10],5,{col:FC.eHetre,ec:1,ytop:H,rg:rg});}
    const cc=[0,cy,0];
    if(lod===2){fbTouffe(K,[0,cy+.5,0],cr*1.02,0,Object.assign(o,{cc:cc,cr:cr,col:FC.hetre,bos:.12,sq:.82}));return {h:H,cr:cr,cy:cy};}
    const n=lod?4:7;for(let k=0;k<n;k++){const top=k===0,an=k*2.39996+rg()*.5,el=top?1.4:-.35+rg()*.95,rr=top?0:6.0;
      const c=[Math.cos(an)*rr*Math.cos(el),cy+(top?4.6:Math.sin(el)*5),Math.sin(an)*rr*Math.cos(el)];
      fbTouffe(K,c,(top?4.8:3.9+rg()*1.4)*(lod?1.15:1),lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.hetre,sq:.88}));}
    return {h:H,cr:cr,cy:cy};},
  chene:function(K,lod,rg){const H=25,cy=15.5,cr=10.5,o={ytop:H,rg:rg};
    fbTube(K,[[0,0,0],[.4,3.5,.2],[-.2,7,.4],[.2,9,0]],[1.0,.78,.66,.55],lod?5:9,{col:FC.eChene,ec:2,mousse:.9,ytop:H,rg:rg,rug:lod?0:.07});
    const cc=[0,cy,0],L9=[];
    for(let k=0;k<(lod===2?0:5);k++){const an=k*1.2566+rg()*.5,x=Math.cos(an),z=Math.sin(an),e=[x*(6+rg()*2.5),12+rg()*3.5,z*(6+rg()*2.5)];
      L9.push(e);if(lod===0)fbTube(K,[[0,8,0],[x*2.4+(rg()-.5)*1.5,10.2,z*2.4+(rg()-.5)*1.5],e],[.42,.30,.16],6,{col:FC.eChene,ec:2,mousse:.4,ytop:H,rg:rg});}
    if(lod===2){fbTouffe(K,[0,cy,0],cr,0,Object.assign(o,{cc:cc,cr:cr,col:FC.chene,bos:.15,sq:.62}));return {h:H,cr:cr,cy:cy};}
    for(const e of L9)fbTouffe(K,[e[0]*1.05,e[1]+1.6,e[2]*1.05],(3.6+rg()*1.3)*(lod?1.2:1),lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.chene,sq:.78}));
    for(let k=0;k<(lod?1:2);k++)fbTouffe(K,[(rg()-.5)*5,cy+2.5+rg()*2,(rg()-.5)*5],4.6+rg()*1.2,lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.chene,sq:.8}));
    return {h:H,cr:cr,cy:cy};},
  bouleau:function(K,lod,rg){const H=22,cy=16,cr=4.6,o={ytop:H,rg:rg},lx=(rg()-.5)*1.4;
    fbTube(K,[[0,0,0],[lx*.3,6,0],[lx*.7,12,.2],[lx,18,.1],[lx*1.1,21,0]],[.32,.26,.20,.13,.06],lod?4:7,{col:FC.eBouleau,ec:3,mousse:.15,ytop:H,rg:rg});
    const cc=[lx,cy,0];
    if(lod===2){fbTouffe(K,[lx,cy,0],cr,0,Object.assign(o,{cc:cc,cr:cr,col:FC.bouleau,bos:.12,sq:1.6}));return {h:H,cr:cr,cy:cy};}
    const n=lod?3:6;for(let k=0;k<n;k++){const an=k*2.39996+rg(),rr=k===0?0:1.8+rg()*1.2,yy=11.5+k*(lod?3:1.7)+rg()*1.2;
      fbTouffe(K,[lx*yy/21+Math.cos(an)*rr,yy,Math.sin(an)*rr],(2.1+rg()*.8)*(lod?1.25:1),lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.bouleau,sq:1.35,bos:.28}));}
    return {h:H,cr:cr,cy:cy};},
  epicea:function(K,lod,rg){const H=37,o={ytop:H,rg:rg};
    fbTube(K,[[0,0,0],[0,H*.5,0],[0,H-1,0]],[.52,.30,.06],lod?4:6,{col:FC.eEpicea,ec:0,mousse:.5,ytop:H,rg:rg});
    const n=lod===0?11:lod===1?4:2,y0=4.5,y1=H-2.2;
    for(let k=0;k<n;k++){const t=k/(n-1),y=y0+(y1-y0)*t,r=.45+6.4*Math.pow(1-t,1.02),hh=(y1-y0)/(n-1)*(lod?1.25:1.5);
      fbJupe(K,y,r,hh,lod?Math.max(5,Math.round(6-t*1)):Math.max(5,Math.round(9-t*4)),{rg:rg,col:FC.epicea,ytop:H,drp:.58});}
    fbTube(K,[[0,H-3,0],[0,H+.6,0]],[.25,.02],4,{col:FC.epicea,ec:0,ytop:H,rg:rg,part:2});
    return {h:H,cr:6.8,cy:H*.42};},
  sapin:function(K,lod,rg){const H=33,o={ytop:H,rg:rg};
    fbTube(K,[[0,0,0],[0,H*.5,0],[0,H-1,0]],[.55,.33,.08],lod?4:6,{col:FC.eEpicea,ec:1,mousse:.6,ytop:H,rg:rg});
    const n=lod===0?9:lod===1?4:2,y0=5,y1=H-2;
    for(let k=0;k<n;k++){const t=k/(n-1),y=y0+(y1-y0)*t,r=.5+5.6*Math.pow(1-t,.85),hh=(y1-y0)/(n-1)*(lod?1.2:1.35);
      fbJupe(K,y,r,hh,lod?5:Math.max(5,Math.round(8-t*3)),{rg:rg,col:FC.sapin,ytop:H,drp:.22});}
    fbTouffe(K,[0,H-1.2,0],1.3,lod?0:1,{rg:rg,cc:[0,H-1.2,0],cr:1.3,col:FC.sapin,ytop:H,part:2,sq:1.6,bos:.1});
    return {h:H,cr:6.1,cy:H*.45};},
  pin:function(K,lod,rg){const H=29,cy=24,cr=6.4,o={ytop:H,rg:rg},bx=(rg()-.5)*2.4,bz=(rg()-.5)*2.4;
    fbTube(K,[[0,0,0],[bx*.2,7,bz*.2],[bx*.6,14,bz*.5],[bx,20,bz],[bx*1.1,24.5,bz*1.1]],[.48,.40,.32,.24,.14],lod?4:7,{col:FC.ePin,ec:4,mousse:.3,ytop:H,rg:rg});
    const cc=[bx,cy,bz];
    if(lod===2){fbTouffe(K,[bx,cy+.8,bz],cr,0,Object.assign(o,{cc:cc,cr:cr,col:FC.pin,bos:.12,sq:.55}));return {h:H,cr:cr,cy:cy};}
    if(lod===0)for(let k=0;k<3;k++){const an=k*2.1+rg(),x=Math.cos(an),z=Math.sin(an);fbTube(K,[[bx*.95,21+k,bz*.95],[bx+x*3.5,23.5+k*.8,bz+z*3.5]],[.16,.08],4,{col:FC.ePin,ec:4,ytop:H,rg:rg});}
    const n=lod?2:4;for(let k=0;k<n;k++){const an=k*2.39996+rg(),rr=k===0?0:3.2+rg()*.8;
      fbTouffe(K,[bx+Math.cos(an)*rr,cy+(k===0?2.2:rg()*1.5),bz+Math.sin(an)*rr],(3.3+rg()*1.1)*(lod?1.25:1),lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.pin,sq:.6,bos:.26}));}
    return {h:H,cr:cr,cy:cy};},
  /* (2026-10-17, Léo : « des ARBRES PLEUREURS » + ses photos) LE SAULE PLEUREUR : un tronc court, creusé, un peu penché, cinq maîtresses
     branches qui montent en gerbe, un dôme aplati — et le RIDEAU, une jupe plissée de mèches qui tombent jusqu'au sol en s'évasant. */
  saule:function(K,lod,rg){const H=18,cy=11.5,cr=9.2,o={ytop:H,rg:rg},lx=(rg()-.5)*1.2,lz=(rg()-.5)*1.2;
    fbTube(K,[[0,0,0],[lx*.3,2.2,lz*.3],[lx*.7,4.4,lz*.7],[lx,6,lz]],[1.05,.86,.74,.62],lod?6:9,{col:FC.eSaule,ec:2,mousse:.7,ytop:H,rg:rg,rug:lod?0:.08});
    const nb=lod?3:5;
    for(let k=0;k<nb;k++){const an=k*6.2832/nb+rg()*.7,x=Math.cos(an),z=Math.sin(an);
      fbTube(K,[[lx,5.4,lz],[lx+x*1.7,8.4+rg(),lz+z*1.7],[lx+x*3.6,11.6+rg()*1.2,lz+z*3.6],[lx+x*5.2,12.4,lz+z*5.2]],[.44,.32,.2,.08],lod?4:6,{col:FC.eSaule,ec:2,mousse:.25,ytop:H,rg:rg});}
    const cc=[lx,cy,lz];
    fbTouffe(K,[lx,13.2,lz],6.8,lod?0:1,Object.assign(o,{cc:cc,cr:cr,col:FC.saule,sq:.5,bos:.2}));
    fbRideau(K,{rg:rg,cx:lx,cz:lz,n:lod?18:36,m:lod?3:5,R:7.4,L:12.6,y0:13.2,col:FC.saule,ytop:H,pli:.08,ev:.14});
    return {h:H,cr:cr,cy:cy};},
  /* LE HÊTRE PLEUREUR (« le tortillard ») : un tronc énorme, tordu, moussu, ses racines, des branches SERPENTINES qui partent à l'horizontale
     puis plongent, une canopée plate — et des rideaux de feuilles seulement au BOUT des branches : entre eux, on voit le bois. */
  pleureur:function(K,lod,rg){const H=20,cy=12,cr=11.5,o={ytop:H,rg:rg};
    fbTube(K,[[0,0,0],[.7,2.6,.3],[-.4,5.2,.6],[.3,7.6,-.2],[0,9,0]],[1.75,1.45,1.25,1.12,1.0],lod?7:11,{col:FC.eHetre,ec:1,mousse:1,ytop:H,rg:rg,rug:lod?.05:.14,aoK:-.1});
    if(lod===0)fgRacines(K,5,1.5,rg,FC.eHetre,1,0,H);
    const nb=lod?4:6,ends=[];
    for(let k=0;k<nb;k++){const an=k*6.2832/nb+(rg()-.5)*.6,x=Math.cos(an),z=Math.sin(an),px=-z,pz=x,w1=(rg()-.5)*2.6,w2=(rg()-.5)*3,yb=7.4+rg()*1.6;
      const L9=[[0,yb,0],[x*2.8+px*w1*.5,yb+2.2,z*2.8+pz*w1*.5],[x*5.6+px*w1,yb+3.1,z*5.6+pz*w1],[x*8.4+px*w2,yb+2.4,z*8.4+pz*w2],[x*10.4+px*w2*.6,yb+.4,z*10.4+pz*w2*.6]];
      fbTube(K,L9,[.78,.62,.46,.32,.16],lod?4:6,{col:FC.eHetre,ec:1,mousse:.7,ytop:H,rg:rg,rug:lod?0:.1});
      ends.push([L9[3],Math.atan2(L9[3][2],L9[3][0])]);}
    fbTouffe(K,[0,12.6,0],10.8,lod?0:1,Object.assign(o,{cc:[0,cy,0],cr:cr,col:FC.pleureur,sq:.34,bos:.28}));
    for(const e of ends){const p=e[0];fbRideau(K,{rg:rg,n:lod?4:6,m:lod?2:4,R:Math.hypot(p[0],p[2])+1.2,L:8.5,y0:p[1]+.8,a0:e[1]-.42,ar:.84,col:FC.pleureur,ytop:H,pli:.1,ev:.06});}
    return {h:H,cr:cr,cy:cy};}};
/* (2026-10-17, Léo : « la forêt noire, je l'imaginais plus avec des ARBRES PLEUREURS » + deux photos — des saules pleureurs, un hêtre pleureur)
   LES PLEUREURS : deux essences de plus (saule, pleureur) sur le programme des arbres (M.arb : zéro programme en plus). Elles REMPLACENT une
   part des FEUILLUS (hêtre, bouleau, chêne) — 90 % près de la route, 75 % à mi-distance, 45 % au loin ; et 85 % des chênes et
   hêtres GÉANTS deviennent un SAULE GÉANT ou un HÊTRE PLEUREUR GÉANT (FOR_GEANTS_PL, même place, même échelle) — tirée d'un flux À PART : le flux du
   décor ne bouge pas (mêmes places, mêmes rejets, mêmes tailles de départ ; le saule ×1,3, le pleureur ×1,25, toujours sous le plafond des
   étages). Les conifères restent : leur sombre fait briller le vert clair des rideaux. */
const PLEUR={on:true}; // PLEUR.on : le banc (dbgPleureurs) rebâtit la même forêt avec ou sans
const FOR_ESP_N=['hetre','chene','bouleau','epicea','sapin','pin','saule','pleureur'];
/* ---------------- LES GÉANTS DU CONTE : quatre arbres-monuments (pied = 0, la ROUTE passe vers y ≈ 70) ----------------
   Leurs couronnes commencent vers 95 m (buildForet les met à l'échelle pour qu'elles soient 25-35 m AU-DESSUS de la dalle). Chacun rend
   aussi ses COLLISIONS : des gélules [x0,y0,z0,x1,y1,z1,r] (tronc, branches maîtresses, arche) et des sphères [x,y,z,r] (la couronne,
   prise à 78 % : on frôle le feuillage sans mourir, on meurt dans le bois). */
function fgRacines(K,n,r0,rg,col,ec,lod,ytop){for(let k=0;k<n;k++){const an=k/n*6.283+rg()*.4,x=Math.cos(an),z=Math.sin(an),L9=r0*(1.7+rg()*.8);
  fbTube(K,[[x*r0*.55,r0*.9,z*r0*.55],[x*r0*1.05,r0*.35,z*r0*1.05],[x*L9,-1.5,z*L9]],[r0*.42,r0*.30,r0*.10],lod?5:8,{col:col,ec:ec,mousse:1,ytop:ytop,rg:rg,rug:lod?0:.05,aoK:-.2});}}
const FOR_GEANTS={
  /* (2026-10-14 soir, Sacha : « BEAUCOUP plus d'arbres, BEAUCOUP plus grands, un peu comme la ville ») LE SÉQUOIA-TOUR : un fût droit et
     cannelé, rouge, sans une branche sur les deux premiers tiers — la route passe ENTRE les troncs comme entre des immeubles — puis une
     couronne étroite en étages de touffes, tout là-haut. 320 m au gabarit, ×0,9-1,8 à la pose : de 290 à 570 m. */
  sequoia:function(K,lod,rg){const H=320,C=[],S=[],col=FC.eSeq,cc=[0,262,0];
    const tr=[[0,0,0],[0,36,0],[.6,100,0],[0,170,.5],[-.5,236,0],[0,290,0],[0,H-3,0]],rr=[17,13.4,11.6,9.8,7.6,4.4,.6];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:1,mousse:.5,ytop:H,rg:rg,rug:lod?.05:.16});
    for(let i=0;i<tr.length-2;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.04]);
    fgRacines(K,lod?6:10,17,rg,col,1,lod,H);
    const et=lod?5:8;for(let e=0;e<et;e++){const t=e/(et-1),y=184+t*(H-198),R9=(1-t)*30+5,nb=Math.max(2,Math.round((lod?3:5)*(1-t*.6)));
      for(let k=0;k<nb;k++){const an=k/nb*6.283+e*1.1+rg()*.5,c=[Math.cos(an)*R9,y+rg()*8,Math.sin(an)*R9],r=(1-t)*13+7+rg()*3;
        fbTouffe(K,c,r*(lod?1.2:1),lod?1:(t<.3?2:1),{rg:rg,cc:cc,cr:40,col:FC.seq,ytop:H,sq:.7});
        if(k%2===0)S.push([c[0]*.7,c[1],c[2]*.7,r*.7]);}}
    return {h:H,cr:40,cy:262,cb:178,C:C,S:S};},
  chene:function(K,lod,rg){const H=168,C=[],S=[],col=FC.eChene,cc=[0,140,0];
    const tr=[[0,0,0],[2,30,1],[-1,62,3],[3,92,0],[1,112,-2]],rr=[12.5,9,7.4,6.2,4.6];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:2,mousse:1,ytop:H,rg:rg,rug:lod?.02:.08});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:8,12,rg,col,2,lod,H);
    const nl=lod?5:7;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.5,x=Math.cos(an),z=Math.sin(an),y0=96+rg()*14,L9=34+rg()*16;
      const p=[[x*3,y0,z*3],[x*L9*.5,y0+12+rg()*8,z*L9*.5],[x*L9,y0+22+rg()*10,z*L9]];
      fbTube(K,p,[3.6,2.4,1.1],lod?5:8,{col:col,ec:2,mousse:.6,ytop:H,rg:rg,rug:lod?0:.05});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2.4]);
      fbTouffe(K,[p[2][0]*1.08,p[2][1]+6,p[2][2]*1.08],15+rg()*5,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.chene,ytop:H,sq:.72});S.push([p[2][0]*1.08,p[2][1]+6,p[2][2]*1.08,(15+2.5)*.78]);}
    for(let k=0;k<(lod?3:6);k++){const an=rg()*6.283,r9=rg()*18,c=[Math.cos(an)*r9,138+rg()*16,Math.sin(an)*r9],r=16+rg()*5;
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.chene,ytop:H,sq:.75});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:48,cy:140,C:C,S:S};},
  hetre:function(K,lod,rg){const H=172,C=[],S=[],col=FC.eHetre,cc=[0,142,0];
    const tr=[[0,0,0],[0,40,.5],[1,80,0],[0,105,0],[0,120,1]],rr=[9.5,7.6,6.4,5.4,4.2];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:1,mousse:.8,ytop:H,rg:rg,rug:lod?0:.025});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:7,9.5,rg,col,1,lod,H);
    const nl=lod?4:6;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.4,x=Math.cos(an),z=Math.sin(an),y0=100+rg()*10,L9=26+rg()*10;
      const p=[[x*2.5,y0,z*2.5],[x*L9*.55,y0+16,z*L9*.55],[x*L9,y0+30+rg()*8,z*L9]];
      fbTube(K,p,[3,2,.9],lod?5:8,{col:col,ec:1,ytop:H,rg:rg});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2]);}
    const n=lod?9:17;for(let k=0;k<n;k++){const top=k===0,an=k*2.39996+rg()*.4,el=top?1.5:-.25+rg()*1.05,R9=top?0:30;
      const c=[Math.cos(an)*R9*Math.cos(el),142+(top?22:Math.sin(el)*22),Math.sin(an)*R9*Math.cos(el)],r=(top?18:13+rg()*5)*(lod?1.15:1);
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:44,col:FC.hetre,ytop:H,sq:.85});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:44,cy:142,C:C,S:S};},
  epicea:function(K,lod,rg){const H=214,C=[],S=[],col=FC.eEpicea;
    fbTube(K,[[0,0,0],[0,70,0],[0,140,0],[0,H-2,0]],[7.5,5.6,3.4,.5],lod?7:12,{col:col,ec:0,mousse:.9,ytop:H,rg:rg,rug:lod?0:.05});
    C.push([0,0,0,0,140,0,6],[0,140,0,0,H,0,3.4]);
    fgRacines(K,lod?4:6,7.5,rg,col,0,lod,H);
    const n=lod?9:18,y0=96,y1=H-5;
    for(let k=0;k<n;k++){const t=k/(n-1),y=y0+(y1-y0)*t,r=2+31*Math.pow(1-t,1.05),hh=(y1-y0)/(n-1)*(lod?1.2:1.45);
      fbJupe(K,y,r,hh,Math.max(6,Math.round(13-t*7)),{rg:rg,col:FC.epicea,ytop:H,drp:.55});
      if(k>=2&&k%2===0)S.push([0,y+hh*.35,0,r*.5]);} // (pas les deux plus bas étages : on passe SOUS les branches qui surplombent le bord de route)
    fbTube(K,[[0,H-6,0],[0,H+3,0]],[1.2,.05],5,{col:FC.epicea,ec:0,ytop:H,rg:rg,part:2});
    return {h:H,cr:33,cy:140,C:C,S:S};},
  ancien:function(K,lod,rg){const H=160,C=[],S=[],col=[.28,.25,.21],cc=[0,135,0];
    const tr=[[0,0,0],[-3,22,2],[2,46,-2],[-2,72,2],[3,96,0],[0,110,-3]],rr=[15,11.5,10,9.4,7,5];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:2,mousse:1.3,ytop:H,rg:rg,rug:lod?.03:.13});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:9,14,rg,col,2,lod,H);
    /* LE VISAGE (côté +z, vers la route : buildForet tourne l'arbre) : deux orbites creuses et une bouche tordue — des noeuds sombres
       le jour, des braises la nuit (partie 5) ; deux arcades d'écorce au-dessus. Hauteur 74 m : la route passe juste dessous. */
    const fz=(y)=>{let b=0,i=0;for(;i<tr.length-1;i++)if(y<=tr[i+1][1])break;const a=tr[i],c=tr[Math.min(i+1,tr.length-1)],u=(y-a[1])/Math.max(1,c[1]-a[1]);
      return [a[0]+(c[0]-a[0])*u,a[2]+(c[2]-a[2])*u,rr[i]+(rr[Math.min(i+1,rr.length-1)]-rr[i])*u];};
    const fy=74,f0=fz(fy),fc=[f0[0],fy,f0[1]+f0[2]*.93],vis={rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,part:5,bos:.08,mix:.2};
    for(const sx of [-1,1]){fbTouffe(K,[fc[0]+sx*3.4,fy+2.6,fc[2]-.7],2.0,1,Object.assign({},vis,{col:[.05,.035,.03],sq:.75}));
      fbTouffe(K,[fc[0]+sx*3.6,fy+5.1,fc[2]+.35],1.9,1,{rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,col:col,part:0,sq:.45,bos:.2,mix:.3});}
    fbTouffe(K,[fc[0]+.4,fy-4.2,fc[2]-.6],2.3,1,Object.assign({},vis,{col:[.04,.03,.025],sq:.55}));
    fbTouffe(K,[fc[0],fy-.4,fc[2]+.9],1.3,1,{rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,col:col,part:0,sq:1.5,bos:.15,mix:.3}); // le nez : un noeud
    const nl=lod?5:8;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.6,x=Math.cos(an),z=Math.sin(an),y0=92+rg()*16,L9=30+rg()*18;
      const p=[[x*3,y0,z*3],[x*L9*.4+(rg()-.5)*8,y0+8+rg()*10,z*L9*.4+(rg()-.5)*8],[x*L9*.8,y0+6+rg()*14,z*L9*.8],[x*L9,y0+20+rg()*10,z*L9]];
      fbTube(K,p,[3.4,2.6,1.8,.9],lod?5:8,{col:col,ec:2,mousse:.9,ytop:H,rg:rg,rug:lod?0:.09});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2.6]);
      if(k%2===0){fbTouffe(K,[p[3][0],p[3][1]+5,p[3][2]],12+rg()*4,lod?1:2,{rg:rg,cc:cc,cr:42,col:[.08,.15,.05],ytop:H,sq:.7});S.push([p[3][0],p[3][1]+5,p[3][2],12*.78]);}}
    for(let k=0;k<(lod?2:4);k++){const an=rg()*6.283,r9=rg()*14,c=[Math.cos(an)*r9,128+rg()*12,Math.sin(an)*r9],r=14+rg()*4;
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:42,col:[.08,.15,.05],ytop:H,sq:.7});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:42,cy:135,C:C,S:S,face:[fc[0],fy,fc[2]]};},
  /* (2026-10-17, Léo : « des ARBRES PLEUREURS ») LE SAULE GÉANT : un fût creusé qui penche, des maîtresses branches en gerbe, un dôme
     aplati — et son RIDEAU de mèches (deux faces) qui tombe de 146 m jusqu'au-dessus de la route : on roule dessous, il ondule au vent. */
  gsaule:function(K,lod,rg){const H=172,C=[],S=[],col=FC.eSaule,X=6,Z=1.5,cc=[X,146,Z];
    const tr=[[0,0,0],[2.5,30,1],[5,62,2.5],[6.5,90,2],[X,104,Z]],rr=[13,10.6,9.2,8,6.6];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:2,mousse:1,ytop:H,rg:rg,rug:lod?.03:.1});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:8,13,rg,col,2,lod,H);
    const nl=lod?5:8;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.5,x=Math.cos(an),z=Math.sin(an),y0=96+rg()*8;
      const p=[[X+x*3,y0,Z+z*3],[X+x*13,y0+18+rg()*6,Z+z*13],[X+x*26,y0+36+rg()*8,Z+z*26]];
      fbTube(K,p,[3.4,2.2,.9],lod?5:8,{col:col,ec:2,mousse:.5,ytop:H,rg:rg,rug:lod?0:.06});C.push([p[0][0],p[0][1],p[0][2],p[1][0],p[1][1],p[1][2],2.2]);}
    fbTouffe(K,[X,152,Z],34,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.saule,ytop:H,sq:.5,bos:.2});S.push([X,152,Z,26]);
    for(let k=0;k<(lod?3:6);k++){const an=k/(lod?3:6)*6.283+rg()*.5,c=[X+Math.cos(an)*26,142+rg()*6,Z+Math.sin(an)*26],r=15+rg()*4;
      fbTouffe(K,c,r,1,{rg:rg,cc:cc,cr:46,col:FC.saule,ytop:H,sq:.55,bos:.22});S.push([c[0],c[1],c[2],r*.7]);}
    fbRideau(K,{rg:rg,cx:X,cz:Z,n:lod?36:84,m:lod?3:6,R:42,L:52,y0:146,col:FC.saule,ytop:H,pli:.06,ev:.12,deux:true,vent:1.7});
    return {h:H,cr:48,cy:146,C:C,S:S};},
  /* LE HÊTRE PLEUREUR GÉANT (« le tortillard ») : un tronc énorme, tordu, moussu, huit branches SERPENTINES qui partent à l'horizontale, se
     tordent, puis plongent ; une canopée plate posée dessus, et un rideau de feuilles au bout de chaque branche — entre eux, le bois. */
  gpleureur:function(K,lod,rg){const H=150,C=[],S=[],col=FC.eHetre,cc=[0,124,0];
    const tr=[[0,0,0],[-4,22,3],[3,46,-2],[-3,70,3],[2,90,0],[0,100,-2]],rr=[15.5,12,10.5,9.6,8.4,7];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:1,mousse:1.2,ytop:H,rg:rg,rug:lod?.04:.15});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:9,15,rg,col,1,lod,H);
    const nl=lod?5:8,ends=[];for(let k=0;k<nl;k++){const an=k/nl*6.283+(rg()-.5)*.5,x=Math.cos(an),z=Math.sin(an),px=-z,pz=x,w1=(rg()-.5)*16,w2=(rg()-.5)*18,y0=94+rg()*10;
      const p=[[x*4,y0,z*4],[x*14+px*w1*.5,y0+12,z*14+pz*w1*.5],[x*26+px*w1,y0+16,z*26+pz*w1],[x*38+px*w2,y0+10,z*38+pz*w2],[x*46+px*w2*.6,y0-4,z*46+pz*w2*.6]];
      fbTube(K,p,[4.2,3.3,2.4,1.6,.7],lod?5:8,{col:col,ec:1,mousse:1,ytop:H,rg:rg,rug:lod?0:.12});
      C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],3.3]);ends.push([p[3],Math.atan2(p[3][2],p[3][0])]);
      const c=[p[2][0]*1.05,p[2][1]+12,p[2][2]*1.05];fbTouffe(K,c,16+rg()*4,lod?1:2,{rg:rg,cc:cc,cr:48,col:FC.pleureur,ytop:H,sq:.45,bos:.28});S.push([c[0],c[1],c[2],12]);}
    fbTouffe(K,[0,126,0],26,lod?1:2,{rg:rg,cc:cc,cr:48,col:FC.pleureur,ytop:H,sq:.42,bos:.25});S.push([0,126,0,20]);
    for(const e of ends){const p=e[0];fbRideau(K,{rg:rg,n:lod?6:13,m:lod?2:5,R:Math.hypot(p[0],p[2])+4,L:34,y0:p[1]+6,a0:e[1]-.36,ar:.72,col:FC.pleureur,ytop:H,pli:.1,ev:.05,deux:true,vent:1.6});}
    return {h:H,cr:50,cy:124,C:C,S:S};}};
const FOR_GEANTS_N=['chene','hetre','epicea','ancien','sequoia'];
/* (2026-10-17 soir) le VOLUME des géants pleureurs, en unités du prototype : du bas des rideaux (bas) à la cime (h), rayon r — pour la pelote, où une route d'un autre étage peut passer à côté */
const FOR_PLEUR_VOL={gsaule:{bas:94,h:172,r:48},gpleureur:{bas:76,h:150,r:50}};
const FOR_GEANTS_PL=['gsaule','gpleureur']; // (2026-10-17) les géants PLEUREURS — à part : la liste du tirage des géants (FOR_GEANTS_N) ne bouge pas
/* LE LOIN (au-delà de la bande moyenne) : la couronne seule — une boule bosselée pour les feuillus, un cône à deux pentes pour les conifères */
const FOR_LOIN={hetre:[19.5,8.8,.85],chene:[15.5,10.5,.62],bouleau:[16,4.8,1.5],pin:[24.5,6.4,.55],saule:[9.5,9,1],pleureur:[11,11.5,.55]}; // (2026-10-17) les pleureurs : un grand dôme qui touche presque le sol
function foretLoin(k,K,rg){const H=k==='epicea'?37:33,o=FOR_LOIN[k];
  if(!o){fbTube(K,[[0,3,0],[0,H*.55,0],[0,H+.5,0]],[k==='epicea'?6.6:6,k==='epicea'?3.3:3.4,.15],6,{col:FC[k],ec:0,ytop:H,rg:rg,part:2});return;}
  fbTouffe(K,[0,o[0],0],o[1],0,{rg:rg,cc:[0,o[0],0],cr:o[1],col:FC[k],ytop:o[0]+o[1],bos:.12,sq:o[2]});}
/* LES PROTOTYPES (une fois par session : la géométrie ne dépend pas de la piste) */
function foretProtos(){if(FORET.protos)return FORET.protos;const t0=performance.now(),P={esp:{},geant:{}};
  for(const k of FOR_ESP_N){P.esp[k]=[];for(let l=0;l<2;l++){let K=fbNew();const rg=mulberry32(0xF0E5+k.length*977+l*31);let m;if(l===2){foretLoin(k,K,rg);m=P.esp[k][0].m;}else m=FOR_ESP[k](K,l,rg);
    P.esp[k].push({g:fbGeo(K),m:m,tri:K.I.length/3});}}
  for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL)){P.geant[k]=[];for(let l=0;l<2;l++){let K=fbNew();const m=FOR_GEANTS[k](K,l,mulberry32(0x6EA7+k.length*131));P.geant[k].push({g:fbGeo(K),m:m,tri:K.I.length/3});}} // même graine aux deux détails : mêmes branches, mêmes collisions
  // LE LOIN, EN DEUX FAMILLES SEULEMENT (toutes essences) : une boule unité (feuillus) et un cône unité (conifères), blancs — l'albédo de
  // chaque arbre voyage dans son exemplaire (aI.yzw, voir FOR_ARB_VS) : 2 appels de dessin au lieu de 6
  {let K=fbNew();const rg=mulberry32(0x10A1);fbTouffe(K,[0,0,0],1,0,{rg:rg,cc:[0,0,0],cr:1,col:[1,1,1],ytop:1,bos:.12,sq:1});P.boule={g:fbGeo(K),tri:K.I.length/3};}
  {let K=fbNew();const rg=mulberry32(0x10A2);fbTube(K,[[0,0,0],[0,1,0]],[1,.02],6,{col:[1,1,1],ec:0,ytop:1,rg:rg,part:2,fixe:1});P.cone={g:fbGeo(K),tri:K.I.length/3};}
  P.ms=Math.round(performance.now()-t0);return FORET.protos=P;}
/* ---------------- LES PEINTURES : fleurs, papillons, lune, loup-garou, brume (des canvas, cuits une fois) ---------------- */
function forTex(cv,mip){const t=new THREE.CanvasTexture(cv);t.generateMipmaps=mip!==false;t.minFilter=mip===false?THREE.LinearFilter:THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  try{t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}catch(e){}return typeof texLibere==='function'?texLibere(t):t;} // peintes une fois : la toile est rendue après l'envoi (paliers ancien et moyen)
/* LES FLEURS DU BORD (8 cases de 128 × 256, la plante pousse depuis le bas) : 0 DIGITALE · 1 COQUELICOTS · 2 MARGUERITES · 3 BOUTONS D'OR ·
   4 JACINTHES DES BOIS · 5 FOUGÈRE · 6 LIERRE (il pend depuis le haut) · 7 AMANITES. La nuit, ce qui n'est pas vert luit (FOR_FLEUR). */
function forFleursTex(){if(FORET.tex.fl)return FORET.tex.fl;
  const W=128,H=256,K9=PAL_B9('foretTex',1),cv=document.createElement('canvas');cv.width=W*8*K9;cv.height=H*K9;const g=cv.getContext('2d'),R=mulberry32(0xF1E0);g.scale(K9,K9);
  const tige=(x0,y0,x1,y1,cx,cy,w,c)=>{g.strokeStyle=c||'#3f6e1c';g.lineWidth=w||3;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.stroke();};
  const feuille=(x,y,a,l,w,c)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c||'#4a8a22';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(l*.5,-w,l,0);g.quadraticCurveTo(l*.5,w,0,0);g.fill();
    g.strokeStyle='rgba(20,50,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(l*.92,0);g.stroke();g.restore();};
  const disque=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();};
  for(let t=0;t<8;t++){g.save();g.translate(t*W,0);g.beginPath();g.rect(1,0,W-2,H);g.clip();
    if(t===0){ // DIGITALE : une hampe, des cloches pourpres tachetées qui pendent d'un côté
      for(let k=0;k<5;k++)feuille(64,250,-Math.PI/2+(k-2)*.5,46+R()*14,9,k%2?'#3f7a1e':'#4f8f28');
      tige(64,252,62,22,70,140,4);
      for(let k=0;k<13;k++){const y=40+k*15+R()*4,s=1-k*.035,x=62+(k%2?6:-2);
        g.save();g.translate(x,y);g.rotate(.5+(k%2?.3:-.1));const gr=g.createLinearGradient(0,0,22*s,0);gr.addColorStop(0,'#7a2a78');gr.addColorStop(1,'#e070c8');
        g.fillStyle=gr;g.beginPath();g.moveTo(0,-5*s);g.quadraticCurveTo(14*s,-10*s,23*s,-7*s);g.lineTo(23*s,8*s);g.quadraticCurveTo(14*s,9*s,0,5*s);g.fill();
        g.fillStyle='#fbe8f6';g.beginPath();g.ellipse(22*s,0,3*s,7*s,0,0,6.283);g.fill();
        for(let j=0;j<3;j++)disque(17*s+R()*4,-2+R()*5,1.1,'#5a1440');g.restore();}
      for(let k=0;k<4;k++)disque(63+R()*4,22+k*5,3-k*.5,'#8a3a8a');}
    else if(t===1){ // COQUELICOTS
      for(let k=0;k<3;k++)feuille(64,252,-Math.PI/2+(k-1)*.9,40,7,'#4c7f26');
      const P9=[[40,70],[86,52],[66,120],[30,150]];
      for(const p of P9){tige(64,254,p[0],p[1]+10,(64+p[0])/2+(R()-.5)*30,170,2.5,'#557f2c');
        for(let j=0;j<4;j++){g.fillStyle=j%2?'#e3271c':'#ff3d24';g.beginPath();g.ellipse(p[0]+Math.cos(j*1.57+.4)*7,p[1]+Math.sin(j*1.57+.4)*5,13,10,j*1.57,0,6.283);g.fill();}
        disque(p[0],p[1],5,'#1c140c');for(let j=0;j<8;j++)disque(p[0]+Math.cos(j*.785)*6,p[1]+Math.sin(j*.785)*6,1.2,'#2a1a10');}
      tige(64,254,100,96,90,180,2,'#557f2c');g.fillStyle='#6b8f3a';g.beginPath();g.ellipse(100,92,4,7,.2,0,6.283);g.fill();}
    else if(t===2){ // MARGUERITES
      for(let k=0;k<6;k++)feuille(64,252,-Math.PI/2+(k-2.5)*.42,34,6,'#4f8a2a');
      const P9=[[34,64],[78,40],[98,92],[56,110],[24,128]];
      for(const p of P9){tige(64,254,p[0],p[1]+6,(64+p[0])/2,190,2.2,'#5a8f30');
        for(let j=0;j<16;j++){const a=j/16*6.283;g.save();g.translate(p[0],p[1]);g.rotate(a);g.fillStyle=j%2?'#ffffff':'#f2f0ea';g.beginPath();g.ellipse(9,0,8,2.6,0,0,6.283);g.fill();g.restore();}
        disque(p[0],p[1],5.5,'#f7c21a');disque(p[0]-1,p[1]-1,3,'#ffd84a');}}
    else if(t===3){ // BOUTONS D'OR
      for(let k=0;k<5;k++)feuille(64,252,-Math.PI/2+(k-2)*.55,30,10,'#3f7f22');
      const P9=[[30,80],[60,54],[92,70],[46,118],[84,124],[70,96]];
      for(const p of P9){tige(64,254,p[0],p[1]+6,(64+p[0])/2,180,1.8,'#4f8a28');
        for(let j=0;j<5;j++){const a=j/5*6.283-1.57;g.fillStyle='#ffd21a';g.beginPath();g.ellipse(p[0]+Math.cos(a)*5,p[1]+Math.sin(a)*5,6,5,a,0,6.283);g.fill();}
        disque(p[0],p[1],3,'#e8a10a');g.fillStyle='rgba(255,255,220,.8)';g.beginPath();g.ellipse(p[0]-3,p[1]-4,2.5,1.5,-.6,0,6.283);g.fill();}}
    else if(t===4){ // JACINTHES DES BOIS : des hampes qui se courbent, des clochettes bleues qui pendent
      for(let k=0;k<6;k++)feuille(64,254,-Math.PI/2+(k-2.5)*.3,90,6,k%2?'#3f7a24':'#4c8c2c');
      for(let s9=0;s9<3;s9++){const x0=50+s9*14,tx=x0+28+s9*6,ty=40+s9*22;tige(64,254,tx,ty,x0-10,120,2.4,'#4a7a2a');
        for(let j=0;j<8;j++){const u=.25+j*.09,x=64+(tx-64)*u+(1-u)*u*(x0-10-64)*2,y=254+(ty-254)*u+(1-u)*u*(120-254)*2*.0;
          const yy=254-(254-ty)*u-Math.sin(u*3.1)*20;g.save();g.translate(x+6,yy+4);g.rotate(.4);const gr=g.createLinearGradient(0,-6,0,8);gr.addColorStop(0,'#3a3ab0');gr.addColorStop(1,'#7a7aff');
          g.fillStyle=gr;g.beginPath();g.moveTo(-4,-6);g.quadraticCurveTo(-6,4,-6,8);g.lineTo(6,8);g.quadraticCurveTo(6,4,4,-6);g.fill();g.restore();}}}
    else if(t===5){ // FOUGÈRE : des frondes arquées, des pennes alternées
      for(let f=0;f<7;f++){const a=-Math.PI/2+(f-3)*.36,L9=170+R()*60,cx=64+Math.cos(a)*L9*.55,cy=254+Math.sin(a)*L9*.7;
        const ex=64+Math.cos(a)*L9*(.8+Math.abs(f-3)*.06)+(f-3)*8,ey=254+Math.sin(a)*L9*.92+Math.abs(f-3)*18;
        tige(64,254,ex,ey,cx,cy,2,'#3f6f1c');
        for(let j=1;j<18;j++){const u=j/18,x=(1-u)*(1-u)*64+2*(1-u)*u*cx+u*u*ex,y=(1-u)*(1-u)*254+2*(1-u)*u*cy+u*u*ey;
          const dx=2*(1-u)*(cx-64)+2*u*(ex-cx),dy=2*(1-u)*(cy-254)+2*u*(ey-cy),an=Math.atan2(dy,dx),l=(1-u)*22+4;
          for(const sd of [-1,1])feuille(x,y,an+sd*1.25,l,3.2,j%2?'#5a9a2c':'#4a8a24');}}}
    else if(t===6){ // LIERRE : des brins qui pendent depuis le haut, des feuilles en coeur
      for(let b=0;b<4;b++){let x=20+b*28+R()*8,y=0;g.strokeStyle='#4a3a22';g.lineWidth=2;g.beginPath();g.moveTo(x,y);
        const pts9=[];for(let j=0;j<12;j++){x+=(R()-.5)*10;y+=18+R()*6;g.lineTo(x,y);pts9.push([x,y]);}g.stroke();
        for(const p of pts9){for(const sd of [-1,1]){g.save();g.translate(p[0]+sd*5,p[1]);g.rotate(sd*.6+(R()-.5)*.6);
          g.fillStyle=R()<.5?'#2f6a1c':'#3f7f26';g.beginPath();g.moveTo(0,-7);g.bezierCurveTo(8,-12,12,0,0,9);g.bezierCurveTo(-12,0,-8,-12,0,-7);g.fill();
          g.strokeStyle='rgba(180,220,140,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(0,-6);g.lineTo(0,7);g.stroke();g.restore();}}}}
    else { // AMANITES TUE-MOUCHES
      const P9=[[44,188,22],[84,170,28],[66,216,15],[100,222,12]];
      for(let k=0;k<4;k++)feuille(64,254,-Math.PI/2+(k-1.5)*.7,26,5,'#4a7a22');
      for(const p of P9){g.fillStyle='#efe8dc';g.beginPath();g.moveTo(p[0]-p[2]*.22,256);g.lineTo(p[0]-p[2]*.16,p[1]);g.lineTo(p[0]+p[2]*.16,p[1]);g.lineTo(p[0]+p[2]*.22,256);g.fill();
        g.fillStyle='#f6f0e4';g.beginPath();g.ellipse(p[0],p[1]+p[2]*.45,p[2]*.3,p[2]*.08,0,0,6.283);g.fill();
        const gr=g.createRadialGradient(p[0]-p[2]*.3,p[1]-p[2]*.4,2,p[0],p[1],p[2]);gr.addColorStop(0,'#ff5a3a');gr.addColorStop(1,'#b8140c');
        g.fillStyle=gr;g.beginPath();g.ellipse(p[0],p[1],p[2],p[2]*.62,0,Math.PI,0);g.quadraticCurveTo(p[0],p[1]+p[2]*.12,p[0]-p[2],p[1]);g.fill();
        for(let j=0;j<7;j++)disque(p[0]+(R()-.5)*p[2]*1.4,p[1]-R()*p[2]*.5,p[2]*.07+R()*1.5,'#fffaf0');}}
    g.restore();}
  return FORET.tex.fl=forTex(cv);}
/* LES AILES (5 cases de 128 × 128, l'aile DROITE, le corps à gauche) : 0 CITRON · 1 PAON DU JOUR · 2 AZURÉ · 3 VULCAIN · 4 CHAUVE-SOURIS */
function forAilesTex(){if(FORET.tex.ai)return FORET.tex.ai;
  const S=128,K9=PAL_B9('foretTex',1),cv=document.createElement('canvas');cv.width=S*5*K9;cv.height=S*K9;const g=cv.getContext('2d');g.scale(K9,K9);
  const aile=(fx,fy,hx,hy,c1,c2)=>{ // l'aile antérieure (vers l'avant, en haut) et la postérieure (en bas)
    let gr=g.createLinearGradient(0,64,S,64);gr.addColorStop(0,c2);gr.addColorStop(.35,c1);gr.addColorStop(1,c1);g.fillStyle=gr;
    g.beginPath();g.moveTo(4,60);g.bezierCurveTo(30,10,fx*.7,fy-6,fx,fy);g.bezierCurveTo(fx+6,fy+24,fx-20,58,40,64);g.closePath();g.fill();
    g.beginPath();g.moveTo(4,66);g.bezierCurveTo(30,64,hx+8,hy-28,hx,hy);g.bezierCurveTo(hx-22,hy+14,26,104,6,74);g.closePath();g.fill();};
  const disque=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();};
  for(let t=0;t<5;t++){g.save();g.translate(t*S,0);g.beginPath();g.rect(0,0,S,S);g.clip();
    if(t===0){aile(118,18,98,112,'#f2ec6a','#c9d64a');disque(64,44,4,'#e8902a');disque(58,88,3,'#e8902a');g.strokeStyle='rgba(120,130,40,.35)';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.moveTo(6,62);g.lineTo(40+k*14,20+k*7);g.stroke();}}
    else if(t===1){aile(116,20,100,110,'#b83a1e','#5a2414');g.fillStyle='rgba(40,20,14,.9)';g.beginPath();g.moveTo(100,20);g.lineTo(118,22);g.lineTo(104,52);g.fill();
      disque(98,34,15,'#2a1a40');disque(98,34,12,'#3d6ad8');disque(98,34,7,'#f2d24a');disque(99,34,4,'#1a1018');
      disque(80,96,12,'#1a1418');disque(80,96,9,'#4a7ae0');disque(80,96,5,'#e8e0d0');}
    else if(t===2){aile(112,22,96,104,'#4aa2ff','#2a5ad0');g.strokeStyle='#1a2448';g.lineWidth=3;g.beginPath();g.moveTo(40,64);g.bezierCurveTo(90,58,112,30,112,22);g.stroke();
      g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.moveTo(112,24);g.bezierCurveTo(116,44,100,58,44,64);g.stroke();for(let k=0;k<4;k++)disque(60+k*9,92+k*3,2,'#1a2448');}
    else if(t===3){aile(118,16,98,110,'#141210','#2a2420');g.strokeStyle='#e8401c';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(52,58);g.quadraticCurveTo(86,30,104,50);g.stroke();
      g.lineWidth=6;g.beginPath();g.moveTo(40,96);g.quadraticCurveTo(70,108,94,102);g.stroke();for(const p of [[104,26],[112,34],[96,22]])disque(p[0],p[1],3.5,'#f4f0e8');}
    else {g.fillStyle='#120e14';g.beginPath();g.moveTo(2,48);g.lineTo(40,30);g.lineTo(78,18);g.lineTo(122,10);g.quadraticCurveTo(116,36,110,52);g.quadraticCurveTo(96,48,90,66);
      g.quadraticCurveTo(76,62,70,82);g.quadraticCurveTo(54,78,46,96);g.quadraticCurveTo(30,86,2,84);g.closePath();g.fill();
      g.strokeStyle='#2a2230';g.lineWidth=2;for(const p of [[122,10],[110,52],[90,66],[70,82]]){g.beginPath();g.moveTo(4,50);g.lineTo(p[0],p[1]);g.stroke();}}
    g.restore();}
  return FORET.tex.ai=forTex(cv);}
/* LA LUNE PLEINE (le disque, ses mers, son halo — un sprite au-dessus des arbres, la nuit) */
function forLuneTex(){if(FORET.tex.lu)return FORET.tex.lu;const S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d'),R=mulberry32(0x10E);
  let gr=g.createRadialGradient(S/2,S/2,S*.16,S/2,S/2,S/2);gr.addColorStop(0,'rgba(220,240,255,.55)');gr.addColorStop(.35,'rgba(150,200,220,.18)');gr.addColorStop(1,'rgba(80,120,160,0)');
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  gr=g.createRadialGradient(S*.46,S*.44,S*.02,S/2,S/2,S*.2);gr.addColorStop(0,'#fffdf2');gr.addColorStop(.8,'#efe9d4');gr.addColorStop(1,'#d8d2bc');g.fillStyle=gr;g.beginPath();g.arc(S/2,S/2,S*.2,0,6.2832);g.fill();
  g.save();g.beginPath();g.arc(S/2,S/2,S*.2,0,6.2832);g.clip();
  for(const m of [[.44,.42,.07],[.55,.47,.05],[.5,.58,.06],[.41,.55,.035],[.58,.38,.03]]){g.fillStyle='rgba(150,150,140,.35)';g.beginPath();g.ellipse(S*m[0],S*m[1],S*m[2],S*m[2]*.8,R()*3,0,6.283);g.fill();}
  for(let k=0;k<40;k++){const x=S*(.32+R()*.36),y=S*(.32+R()*.36),r=1+R()*5;g.strokeStyle='rgba(120,120,110,.3)';g.lineWidth=1;g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();}
  g.restore();return FORET.tex.lu=forTex(cv,false);}
/* LE LOUP-GAROU (une ombre chinoise : dressé sur un rocher, la tête renversée, la gueule ouverte, il hurle à la lune) — pattes de loup
   (digitigrades), dos voûté hérissé, crinière, longs bras griffus, queue en panache. Chaque contour POILU est un tracé dont les segments
   reçoivent des mèches pointues vers l'extérieur (`poils`). */
function forLoupTex(){if(FORET.tex.lg)return FORET.tex.lg;const W=256,H=512,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),R=mulberry32(0x7011);
  g.fillStyle='#05060a';g.strokeStyle='#05060a';g.lineJoin='round';
  const poly=(P)=>{g.beginPath();g.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1]);g.closePath();g.fill();};
  const poils=(P,amp,dens)=>{for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,n=Math.max(1,Math.round(l/dens));
    for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,um=(u0+u1)/2+(R()-.5)*.2,h=amp*(.6+R()*.8);g.beginPath();g.moveTo(a[0]+dx*u0,a[1]+dy*u0);
      g.lineTo(a[0]+dx*um+nx*h+dx/l*h*.35,a[1]+dy*um+ny*h+dy/l*h*.35);g.lineTo(a[0]+dx*u1,a[1]+dy*u1);g.closePath();g.fill();}}};
  poly([[8,512],[22,458],[58,436],[110,442],[168,430],[214,438],[246,470],[254,512]]);                               // le rocher
  poly([[84,300],[116,306],[112,348],[94,378],[104,416],[130,428],[132,438],[86,438],[80,420],[66,380],[72,334]]);    // la patte arrière
  poly([[114,304],[150,300],[154,346],[138,382],[150,418],[176,428],[178,438],[130,438],[126,422],[116,384],[112,342]]); // la patte avant
  for(const x of [128,174]){g.lineWidth=2.5;g.beginPath();g.moveTo(x,436);g.lineTo(x+6,440);g.stroke();}            // les griffes des pieds
  const dos=[[84,300],[70,262],[72,222],[86,188],[108,164],[130,150]];
  poly([[84,300]].concat(dos.slice(1)).concat([[150,148],[172,164],[178,204],[168,248],[156,300]]));                 // le torse voûté
  poils(dos,15,9);                                                                                                       // le dos hérissé
  const queue=[[82,292],[56,306],[34,340],[24,388],[30,412]];poly([[86,312]].concat(queue).concat([[46,404],[50,372],[66,338],[90,318]]));poils(queue,12,8); // la queue
  // le bras de derrière, puis celui de devant (longs, les griffes ouvertes)
  poly([[104,176],[90,214],[86,256],[94,290],[106,296],[104,258],[110,222],[120,190]]);
  for(let k=0;k<4;k++){g.lineWidth=2.2;g.beginPath();g.moveTo(98,292);g.lineTo(90+k*5,312+(k%2)*4);g.stroke();}
  const bras=[[156,168],[184,196],[198,236],[202,276]];poly(bras.concat([[214,300],[204,306],[190,282],[184,244],[170,212],[150,190]]));poils(bras,8,9);
  for(let k=0;k<4;k++){g.lineWidth=2.4;g.beginPath();g.moveTo(206,298);g.quadraticCurveTo(214+k*3,306+k*2,210+k*6,322+(k%2)*5);g.stroke();}
  // le cou et la crinière, la tête renversée vers la lune (museau vers le haut à droite), la gueule OUVERTE
  const criniere=[[128,152],[136,118],[150,92],[166,74]];
  poly([[126,156]].concat(criniere).concat([[184,70],[196,92],[184,118],[172,150],[170,172]]));poils(criniere,13,8);
  poly([[162,82],[176,64],[192,58],[202,70],[198,86],[182,96]]);                                                    // le crâne
  poly([[160,72],[146,36],[170,64]]);poly([[170,64],[166,30],[184,60]]);                                             // les oreilles couchées en arrière
  poly([[186,62],[214,34],[234,22],[230,34],[204,60],[196,74]]);                                                     // la mâchoire du haut
  poly([[196,86],[220,58],[230,50],[228,60],[208,82],[200,94]]);                                                     // la mâchoire du bas (la gueule s'ouvre entre les deux)
  poils([[196,96],[178,130],[172,160]],7,8);                                                                          // le poitrail
  return FORET.tex.lg=forTex(cv,false);}
/* ---------------- LES MATIÈRES (ShaderMaterial : aucune lumière de three, aucun programme qui dépende de la scène) ---------------- */
const FG_BRUIT=['float fh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'float fn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
  ' return mix(mix(mix(fh3(i),fh3(i+vec3(1.,0.,0.)),f.x),mix(fh3(i+vec3(0.,1.,0.)),fh3(i+vec3(1.,1.,0.)),f.x),f.y),',
  '            mix(mix(fh3(i+vec3(0.,0.,1.)),fh3(i+vec3(1.,0.,1.)),f.x),mix(fh3(i+vec3(0.,1.,1.)),fh3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
  'float fh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
  'float fn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(fh2(i),fh2(i+vec2(1.,0.)),f.x),mix(fh2(i+vec2(0.,1.)),fh2(i+vec2(1.,1.)),f.x),f.y);}'].join('\n');
const FG_LUM=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillC,uFillD,uCam,uCarP,uCarF,uMistC,uLeafT;',
  'uniform float uTime,uPhare,uFlash,uWet,uHante,uMistK,uMistY,uRos,uLune,uVent,uAir;',
  // les PHARES de la caisse sur la forêt : un cône (cos .62-.93), une portée de ~150 m, une flaque blanche-chaude
  'vec3 fPhare(vec3 w,vec3 n){vec3 d=w-uCarP;float l=length(d);d/=max(l,.001);float c=smoothstep(.62,.93,dot(d,uCarF));',
  '  return vec3(1.,.93,.80)*uPhare*c*(2600./(l*l*.10+320.))*(.30+.70*max(dot(n,-d),0.));}',
  // la BRUME DU FOND : elle s'épaissit sous la route, et avec la distance
  'float fBrume(vec3 w,float dist){return uMistK*smoothstep(uMistY-6.,uMistY-95.,w.y)*(1.-exp(-dist*.0042));}'].join('\n');
const FOR_ARB_VS=['attribute vec4 aA;attribute vec3 aC;attribute vec2 aB;','#ifdef USE_INSTANCING','attribute vec4 aI;','#endif',
  'uniform float uTime,uVent;varying vec3 vW,vN,vO,vC,vNo;varying vec4 vA,vI;varying vec2 vB;varying float vS9;','#include <fog_pars_vertex>',
  'void main(){vec4 I=vec4(0.);mat4 M=modelMatrix;','#ifdef USE_INSTANCING','I=aI;M=modelMatrix*instanceMatrix;','#endif',
  '  vec3 p=position;float h=aA.w,sw=uVent*h*h*(aA.x>.5&&aA.x<2.5?1.:.35);vS9=length(M[0].xyz);',
  '  p.x+=sin(uTime*1.05+I.x*31.+p.y*.04)*sw*.9;p.z+=sin(uTime*.83+I.x*17.+p.y*.05)*sw*.7;',              // le vent : tout l'arbre se balance
  '  if(aA.x>.5&&aA.x<2.5)p+=normal*sin(uTime*3.3+dot(p,vec3(.6,.4,.5))+I.x*9.)*.10*uVent;',   // …et le feuillage frissonne
  '  vec4 wp=M*vec4(p,1.);vW=wp.xyz;vN=normalize((M*vec4(normal,0.)).xyz);vO=position+I.x*vec3(71.3,13.7,37.1);vNo=normal;vC=aC;vA=aA;vB=aB;vI=I;', // (2026-10-17) vO SANS le vent : les peintures ne glissent plus sur l arbre qui se balance (et le cube garde sa case)
  '  if(I.z>0.){vC=aC*I.yzw;vI=vec4(I.x,0.,0.,0.);vO=wp.xyz*.15;}',                                   // le LOIN : l'albédo de l'arbre est dans son exemplaire
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_ARB_FS=[FG_BRUIT,FG_LUM,'uniform float uFen,uMini,uCon,uVit,uVitL,uVitS;uniform vec3 uVitG;varying vec3 vW,vN,vO,vC,vNo;varying vec4 vA,vI;varying vec2 vB;varying float vS9;','#include <fog_pars_fragment>',
  'void main(){float part=floor(vA.x+.5);vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec3 L=uSunDir;',
  '  vec3 alb=vC;float ao=vA.y,leaf=0.;vec3 o=vO;',
  '  float mk9=0.,mh9=0.;vec3 mn9=vec3(0.),mp9=vec3(0.);bool br9=part<.5||part>6.5;float ts9=vI.z<=0.&&vI.w>.5&&uVit>0.?1.45:.42;',
  '  if(uMini>0.||uVit>0.){vec3 jm9=vI.x*vec3(71.3,13.7,37.1);mp9=(vO-jm9)*vS9/ts9;vec3 ce9=floor(mp9);mk9=1.-smoothstep(.3,.85,length(fwidth(mp9)));', // (2026-10-17) LES MINI-CUBES : la case de 42 cm de ce pixel ; mk9 s efface quand elle tombe sous ~2 px
  '    mh9=fract(sin(dot(ce9+vI.x*31.,vec3(12.9898,78.233,37.719)))*43758.5453);mn9=vec3(fract(mh9*17.31),fract(mh9*43.17),fract(mh9*91.7))-.5;',
  '    if((part>.5&&part<2.5)||(uVit>0.&&br9))o=mix(vO,(ce9+.5)*ts9/max(vS9,.01)+jm9,mk9);}',   // (vitrail) l ÉCORCE aussi lue au centre de son écaille : une écaille, une teinte                                    // le feuillage lu au CENTRE de son mini-cube : une teinte par cube
  '  if(part<.5||part>6.5){float st=vB.x;',                                                                        // L'ÉCORCE
  '    if(st<.5){float pl=fn3(o*vec3(1.6,.55,1.6));alb*=.66+.66*pl;}',                                                 // épicéa : des écailles
  '    else if(st<1.5){float b=fn3(o*vec3(.45,.2,.45));alb*=.84+.28*b;float li=fn3(o*.9+vec3(3.1,0.,1.7))*.6+fn3(mat3(.8,.6,0.,-.6,.8,0.,0.,0.,1.)*o*2.3)*.4;alb=mix(alb,alb*vec3(.80,.97,.80),smoothstep(.55,.75,li));}', // hêtre : gris lisse, des lichens (deux octaves tournées : pas de pavés)
  '    else if(st<2.5){float r=fn3(o*vec3(2.1,.26,2.1))*.65+fn3(o*vec3(5.3,.7,5.3))*.35;alb*=.55+.6*smoothstep(.25,.75,r);}',                          // chêne : des sillons (deux octaves : plus de zébrures)
  '    else if(st<3.5){float ba=step(.70,fn3(vec3(o.x*2.2,o.y*5.,o.z*2.2)));alb=mix(alb,vec3(.07,.06,.055),ba*.92);alb=mix(vec3(.13,.11,.09),alb,smoothstep(.02,.14,vA.w));}', // bouleau : blanc, des tirets noirs, le pied sombre
  '    else if(st<4.5){float r=fn3(o*vec3(1.4,.4,1.4));alb=mix(vec3(.30,.27,.24)*(.55+.6*r),alb*(.82+.35*r),smoothstep(.35,.62,vA.w));}', // pin : gris en bas, saumon en haut
  '    else alb*=.9+.2*fn3(o*2.);',
  '    float mo=clamp(vB.y*(smoothstep(-.2,.6,N.y+fn3(o*.35)*.7-.35)+.32)+uWet*.3*vB.y,0.,1.);alb=mix(alb,vec3(.15,.30,.07)*(.8+.4*fn3(o*1.7)),mo*.85);}', // la MOUSSE (plus verte sous la pluie)
  /* (2026-10-17, Sacha, sur une capture de la forêt : « on voit clairement un problème de texture des feuilles des arbres ») LE FEUILLAGE EN CAMOUFLAGE :
     le bruit multipliait la couleur de ×,32 à ×1,22 (3,8 fois d'écart, en taches franches) — des TROUS NOIRS dans des grappes vert fluo. Désormais un écart
     doux (×,74 à ×1,06) sur des grappes plus larges, et la variation passe par DEUX VERTS (plus jaune au soleil, plus froid dans le creux) ; le relief
     bosselé de la touffe et la lumière font le reste. */
  ('  else if(part<2.5){float fin=1.-smoothstep(60.,170.,dist);leaf=fn3(o*.26)*.50+fn3(o*.80)*.34+mix(.5,fn3(o*2.1),fin)*.16;float lk=smoothstep(.18,.82,leaf);alb*=mix(.74,1.06,lk)*mix(vec3(.92,.97,1.06),vec3(1.06,1.03,.90),lk);ao*=mix(.82,1.,smoothstep(.15,.65,leaf));'
          ), // LE FEUILLAGE : des grappes de feuilles
  '    if(mk9>0.){vec3 fm9=fract(mp9);vec3 em9=min(fm9,1.-fm9);float eb9=uVit>0.?1.:smoothstep(.0,.16,min(min(em9.x,em9.y),em9.z));alb*=mix(1.,(.76+.48*mh9)*mix(.52,1.,eb9),mk9);}', // (mini-cubes) chaque cube sa nuance, et son bord un peu dans l ombre : on lit les petits cubes                                                                   // (mini-cubes) chaque cube sa nuance
  '    if(vI.y>1.5)alb*=vec3(1.35,1.12,.7);',                           // l'érable d'or
  '    else alb*=1.+vI.y*vec3(.16,.06,-.18);alb*=uLeafT;}',
  '  else if(part<3.5)alb*=.92+.16*fn3(o*1.5);',
  '  else if(part>5.5)alb=mix(alb*(.8+.3*fn3(o*.9)),vec3(.96,.94,.88),step(.62,fn3(o*3.)));',                       // l'amanite : rouge, points blancs
  '  float vj9=0.;vec3 cg9=vec3(0.);bool vb9=uVit>0.&&vI.z<=0.&&(part<2.5||part>6.5);',
  '  if(vb9){cg9=mix(alb/max(max(alb.r,max(alb.g,alb.b)),.04),uVitG,.42+.38*uHante);',
  '    if(mk9>0.){vec3 fq9=fract(mp9),eq9=min(fq9,1.-fq9),no9=abs(normalize(vNo)),sq9=sqrt(max(1.-no9*no9,.05)),es9=eq9/sq9,fw9=fwidth(mp9)/sq9+.002,w9=vec3(.05);',
  '      vec3 jl9=(1.-smoothstep(w9-fw9,w9+fw9,es9))*min(vec3(1.),w9/fw9);if(!(part>.5&&part<2.5&&vB.x>.5))vj9=max(jl9.x,max(jl9.y,jl9.z))*mk9;',
  '      float bv9=smoothstep(.0,.17,min(es9.x,min(es9.y,es9.z)));alb*=mix(1.,(br9?.8+.4*mh9:1.)*mix(.74,1.,bv9),mk9);if(br9)N=normalize(N+mn9*.62*mk9);}}',
  '  if(part>.5&&part<2.5&&mk9>0.)N=normalize(N+mn9*.85*mk9);',                                                    // (mini-cubes) chaque cube sa facette : il attrape la lumière à sa façon
  '  if(uCon>0.)ao=mix(ao,pow(ao,1.6),uCon);',                                                                     // (contraste) le creux des couronnes plus profond
  '  float ndl=dot(N,L),wr=(part>.5&&part<2.5)?.55:.25,dif=clamp((ndl+wr)/(1.+wr),0.,1.);',
  '  vec3 col=alb*((uSky*(.42+.36*N.y)*ao+uGnd*(.40-.30*N.y)*ao)*(1.-.12*uCon)+uSunC*dif*mix(.45,.86,ao)*(1.+.15*uCon)+uFillC*max(dot(N,-uFillD),0.)*.4);', // (contraste) moins de lumière du ciel dans l ombre, plus de soleil
  '  if(part>.5&&part<2.5){float tr=pow(max(dot(-V,L),0.),5.)*(1.-.45*ao);col+=alb*uSunC*tr*vec3(1.35,1.3,.6)*.85;', // le CONTRE-JOUR à travers les feuilles
  '    col+=uSunC*pow(max(dot(reflect(-L,N),V),0.),24.)*step(.72,leaf)*.35*uRos;',                                     // la rosée qui scintille
  '    if(mk9>0.){col+=uSunC*pow(max(dot(reflect(-L,N),V),0.),16.)*(.2+.55*mh9)*mk9*.72;',                           // (mini-cubes) la BRILLANCE : un reflet serré par cube (la nuit, celui de la lune)
  '      col+=uSunC*alb*2.*step(.985,fract(mh9*7.31+floor(uTime*.9+mh9*13.)*.618))*max(ndl,0.)*mk9;}}',               // …et des ÉCLATS : un cube sur soixante-dix s allume, puis un autre
  '  if(vb9){vec3 Ns9=normalize(vN);float nv9=max(dot(Ns9,V),0.),fr9=pow(1.-nv9,2.2);vec3 rf9=reflect(-V,Ns9),sk9=mix(uGnd*.7,uSky*1.25,smoothstep(-.3,.4,rf9.y));',
  '    col=col*(1.-.22*fr9*uVit)+uVit*(sk9*(.03+.5*fr9)+uSunC*pow(max(dot(rf9,L),0.),260.)*2.4+(.5+.5*cos(6.2832*(fr9*1.4+vW.y*.02+vec3(0.,.33,.67))))*fr9*.14);',
  '    float sc9=uVitS*exp(-pow((vA.w-fract(uTime*.16+vI.x*.37))/.09,2.)),lu9=uVitL*(1.+.5*uHante);vj9*=1.-uHante*.85*smoothstep(28.,105.,dist);',
  '    col+=cg9*uVit*(nv9*.05*(1.+uHante)+sc9*(.1+.25*mk9));col=mix(col,mix(col,cg9*lu9*mix(.42+.58*dif,1.,uHante),.52)*(1.+2.2*sc9),vj9*uVit);col=mix(col,mix(sk9,vec3(1.,.98,.92),.45*(1.-uHante))*(.75+.5*uSunC.g),pow(fr9,1.5)*.38*(1.-.55*uHante)*uVit);}',
  '  float rim=pow(1.-max(dot(N,V),0.),3.);col+=alb*uSunC*rim*(.20+.14*uCon)*dif;',
  '  col+=vec3(.55,.68,.92)*rim*uHante*(.14+.18*uCon)*step(part,2.5);',                                            // (contraste) la nuit, la lisière de lune plus franche : de belles silhouettes                                                          // la nuit, une lisière de LUNE (argent bleuté)
  '  col+=alb*fPhare(vW,N)*(part>.5&&part<2.5&&vB.x>.5?.3:1.);col+=alb*uFlash*vec3(.8,.85,1.)*(1.2+.8*max(N.y,0.));',             // (2026-10-17) les MÈCHES des pleureurs (aB.x = 1) : les phares les effleurent (pleins, elles faisaient une pluie de fils verts fluo la nuit)
  '  if(part>3.5&&part<4.5)col=mix(col,vec3(1.,.60,.22)*(1.3+.25*sin(uTime*7.+vI.x*20.+o.x)),uFen);',               // la FENÊTRE de la chaumière
  '  if(part>4.5&&part<5.5)col+=vec3(1.,.36,.08)*uHante*(1.6+.8*sin(uTime*2.2+vI.x*9.))*(.6+.4*fn3(o*2.+uTime*.8));', // le VISAGE du vieux chêne
  '  if(part>5.5&&part<6.5)col+=mix(vec3(.55,.95,.80),vec3(1.,.34,.66),step(.78,fract(vI.x*5.3)))*uHante*.9*step(.62,fn3(o*3.));',                                 // les champignons qui luisent
  '  {float pa9=smoothstep(180.,1500.,dist)*(1.-uHante)*uAir;col=mix(col,col*vec3(.84,.96,1.12)+vec3(0.,.012,.04),pa9*.55);col*=mix(vec3(1.,1.,1.),vec3(1.05,1.01,.93),(1.-smoothstep(0.,260.,dist))*(1.-uHante)*uAir);}', /* (2026-10-20, embellir) TROIS PLANS : le proche plus chaud, le lointain plus froid et plus clair */
  '  col=mix(col,uMistC,fBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LE SOL : humus, mousse, fougères, prairies fleuries, roche des pentes raides ; sous les arbres, des taches de soleil ; la nuit, des
   champignons qui luisent. aS = (distance à la route, prairie, densité de forêt, hasard). */
const FOR_SOL_VS=['attribute vec4 aS;varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normal;vS=aS;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_SOL_FS=[FG_BRUIT,FG_LUM,'varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float f=vS.z,pr=vS.y;vec2 q=vW.xz;',
  '  float n1=fn2(q*.031),n2=fn2(q*.12),n3=fn2(q*.55);',
  '  vec3 humus=mix(vec3(.09,.07,.045),vec3(.16,.115,.065),n2),mousse='+('mix(vec3(.06,.14,.065),vec3(.12,.23,.10),n1)')+',herbe='+('mix(vec3(.09,.21,.09),vec3(.18,.30,.13),n2)*(.84+.32*n1)')+';',
  '  vec3 alb=mix(mousse,humus,f*.6*(.55+.45*n3));alb=mix(alb,vec3(.11,.22,.05),smoothstep(.55,.75,n2)*(1.-pr)*.55);alb=mix(alb,herbe,pr);', // fougères, prairies
  '  float sl=1.-N.y;alb=mix(alb,vec3(.33,.32,.29)*(.8+.3*n3),smoothstep(.38,.62,sl+n1*.16));',                     // la roche des pentes
  '  vec2 c9=floor(q*1.3),g9=fract(q*1.3)-.5;float h9=fh2(c9),k9=step(1.-pr*.6,h9)*(1.-smoothstep(70.,190.,dist));',  // les FLEURS des prairies, de près…
  '  vec3 fc=h9<.3?vec3(.78,.24,.66):h9<.55?vec3(.98,.84,.12):h9<.8?vec3(.97,.97,.94):vec3(.50,.58,1.);alb=mix(alb,fc,k9*smoothstep(.34,.12,length(g9)));',
  '  alb=mix(alb,alb*vec3(1.10,.96,1.08)+vec3(.05,.03,.04),pr*smoothstep(90.,240.,dist)*.6);',                      // …et une teinte, au loin
  '  float ao=1.-f*.42,dif=clamp((dot(N,uSunDir)+.2)/1.2,0.,1.),ta=smoothstep(.42,.72,fn2(q*.085+vec2(uTime*.02,0.))),omb=mix(1.,.22+.78*ta,f*.85);', // l'ombre de la canopée, percée de taches de soleil
  '  vec3 col=alb*(uSky*(.45+.40*N.y)*ao+uGnd*.18+uSunC*dif*omb*.95);col+=alb*fPhare(vW,N);col+=alb*uFlash*vec3(.8,.85,1.)*1.4;',
  '  float gh=fh2(floor(q*.8));col+=mix(vec3(.2,1.,.72),vec3(1.,.28,.62),step(.75,fract(gh*37.)))*step(.982,gh)*f*uHante*.9*(.6+.4*sin(uTime*1.3+gh*30.));',      // la nuit : des champignons qui luisent
  '  col=mix(col,uMistC,fBrume(vW,dist)*1.1);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LE TORRENT : un ruban d'eau au fond de la vallée — le ciel s'y reflète, le soleil y scintille, l'écume sur les bords */
const FOR_EAU_VS=['attribute vec2 aU;varying vec3 vW;varying vec2 vU;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vU=aU;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_EAU_FS=[FG_BRUIT,FG_LUM,'varying vec3 vW;varying vec2 vU;','#include <fog_pars_fragment>',
  'void main(){vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float t=uTime;',
  '  vec2 r=vec2(fn2(vec2(vU.y*.22-t*1.6,vU.x*3.)),fn2(vec2(vU.y*.45-t*2.3,vU.x*5.+3.)))-.5;vec3 N=normalize(vec3(r.x*.5,1.,r.y*.5));',
  '  vec3 R=reflect(-V,N);float fr=.12+.88*pow(1.-max(dot(N,V),0.),4.);',
  '  vec3 ciel=mix(uGnd*.5,uSky*1.05,clamp(R.y*1.5+.3,0.,1.)),fond=vec3(.03,.09,.08)+uSky*.05;',
  '  vec3 col=mix(fond,ciel,fr)+uSunC*pow(max(dot(R,uSunDir),0.),180.)*3.;',
  '  float ec=smoothstep(.62,1.,abs(vU.x))+smoothstep(.72,.9,fn2(vec2(vU.y*.6-t*2.,vU.x*4.)))*.35;col=mix(col,(uSky+uSunC)*.55,ec*.6);', // l'écume
  '  col+=fPhare(vW,N)*.4;col+=uFlash*vec3(.8,.85,1.)*.8;col=mix(col,uMistC,fBrume(vW,dist));',
  '  gl_FragColor=vec4(col,smoothstep(1.,.78,abs(vU.x)));','#include <fog_fragment>','}'].join('\n');
/* LES FLEURS, LES FOUGÈRES, LE LIERRE : deux quads croisés, une case de la planche ; le vent les berce, la caisse les ÉCARTE en passant ;
   la nuit, leurs pétales luisent (des fleurs de conte). aF = (case, largeur, hauteur, hasard). */
const FOR_FLEUR_VS=['attribute vec4 aF;uniform float uTime,uVent;uniform vec3 uCarP;varying vec2 vUv;varying vec3 vW;varying float vY,vK;','#include <fog_pars_vertex>',
  'void main(){vec3 p=position;float y=uv.y;p.x*=aF.y;p.z*=aF.y;p.y*=aF.z;',
  '  mat4 M=modelMatrix*instanceMatrix;vec4 wp=M*vec4(p,1.);vec3 b=(M*vec4(0.,0.,0.,1.)).xyz;',
  '  float k=abs(position.y);float sw=sin(uTime*2.2+aF.w*40.+b.x*.05)*.10*uVent*k*k*aF.z;wp.x+=sw;wp.z+=sw*.6;',
  '  vec3 d=b-uCarP;float l=length(d);wp.xyz+=normalize(d+vec3(.001,.3,.001))*(1.-smoothstep(2.5,9.,l))*k*k*aF.z*.9;', // la caisse passe : les fleurs s'écartent
  '  vW=wp.xyz;vUv=vec2((floor(aF.x+.5)+uv.x)/8.,uv.y);vY=k;vK=aF.x;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_FLEUR_FS=[FG_BRUIT,FG_LUM,'uniform sampler2D uTex;varying vec2 vUv;varying vec3 vW;varying float vY,vK;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.5)discard;vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);',
  '  vec3 alb=t.rgb,N=vec3(0.,1.,0.);float pe=clamp((max(t.r,t.b)-t.g)*3.,0.,1.);',                      // pe : un pétale (ce qui n'est pas vert)
  '  float dif=clamp((dot(N,uSunDir)+.6)/1.6,0.,1.),tr=pow(max(dot(-V,uSunDir),0.),4.);',
  '  vec3 col=alb*(uSky*.62*(.55+.45*vY)+uGnd*.22+uSunC*dif*.9)+alb*uSunC*tr*.7;col+=alb*fPhare(vW,N)*1.2;col+=alb*uFlash*1.2;',
  '  col+=(alb*1.4+vec3(.10,.25,.35))*pe*uHante*.85;',                                                    // la nuit, les fleurs luisent
  '  col=mix(col,uMistC,fBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LES PAPILLONS (et, la nuit, les CHAUVES-SOURIS) : une boîte qui suit la caisse, chacun vole sur sa courbe ; deux ailes qui battent.
   Aucun calcul sur le processeur : la position naît dans le shader (le temps, son hasard, la boîte). aR = hasard · aP = (case, taille). */
const FOR_PAP_VS=['attribute vec4 aR;attribute vec2 aP;uniform float uTime,uPap,uBat;uniform vec3 uBoxC;varying vec2 vUv;varying float vBat;varying vec3 vW;','#include <fog_pars_vertex>',
  'void main(){vec3 B=vec3(150.,30.,200.);float bat=uBat*step(aR.w,.4),vis=max(uPap*(1.-step(.001,uBat)),bat);',
  '  float t=uTime*(.55+.45*aR.w)+aR.x*50.;',
  '  vec3 pa=vec3(sin(t*.31)*16.+sin(t*.9+aR.y*6.)*3.,sin(t*1.7+aR.z*9.)*1.5+sin(t*.43)*4.,cos(t*.27)*16.+t*(bat>0.?9.:1.6));',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;',
  '  float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z),fade=smoothstep(0.,.07,e)*vis;',
  '  vec3 ve=vec3(cos(t*.31)*.31*16.,0.,-sin(t*.27)*.27*16.+(bat>0.?9.:1.6));float hd=atan(ve.x,ve.z);',
  '  float fl=sin(uTime*(bat>0.?13.:18.)*(.8+.4*aR.w)+aR.x*30.),an=bat>0.?fl*.7:fl*1.15+.25;',
  '  float sd=sign(position.x),sx=abs(position.x),sz=aP.y*(bat>0.?1.9:1.)*fade;',
  '  vec3 w=vec3(sd*sx*cos(an),sx*sin(an),position.z)*sz;float c=cos(hd),s=sin(hd);w=vec3(w.x*c+w.z*s,w.y,-w.x*s+w.z*c);',
  '  vec4 wp=vec4(pos+w,1.);vW=wp.xyz;float k=bat>0.?4.:floor(aP.x+.5);vUv=vec2((k+sx)/5.,uv.y);vBat=bat;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_PAP_FS=['uniform sampler2D uTex;uniform vec3 uSunC,uSky;varying vec2 vUv;varying float vBat;varying vec3 vW;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.5)discard;vec3 col=vBat>0.?t.rgb*.6:t.rgb*(uSky*.75+uSunC*.75)+t.rgb*.12;gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LES LUCIOLES (la nuit, vert-jaune, elles clignotent au fond de la vallée) et le POLLEN (le jour, une poussière d'or dans la lumière) */
const FOR_LUC_VS=['attribute vec4 aR;uniform float uTime,uLuc,uPol,uPx;uniform vec3 uBoxL,uBoxB;uniform vec3 uSunC;varying vec3 vC;varying float vA;',
  'void main(){vec3 B=uBoxB;float luc=step(aR.w,.55);',
  '  vec3 pa=vec3(sin(uTime*.23+aR.y*6.)*7.,sin(uTime*.5+aR.x*9.)*3.+uTime*(luc>0.?.6:.25),cos(uTime*.19+aR.z*6.)*7.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxL+B*.5,B)-B*.5,pos=uBoxL+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  float bl=pow(max(sin(uTime*(1.1+aR.w*2.4)+aR.x*40.),0.),5.);',
  '  vA=smoothstep(0.,.08,e)*(luc>0.?uLuc*bl:uPol*(.55+.45*sin(uTime*2.+aR.y*30.)));',
  '  float hc=fract(aR.x*91.7+aR.z*13.1);vec3 am=hc<.78?vec3(1.,.74,.40):hc<.92?vec3(1.,.86,.40):vec3(.96,.30,.64);', /* (2026-10-20, embellir) les lucioles : AMBRE (#FFC477), un peu d'OR, et de rares ROSES néon */
  '  vC=luc>0.?am*2.3:uSunC*vec3(1.,.9,.6)*1.1;',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min((luc>0.?1.6:.7)*uPx*320./max(1.,-mv.z),1e4);}'].join('\n');
const FOR_LUC_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;if(vA*a<.004)discard;gl_FragColor=vec4(vC*vA*a,1.);}'].join('\n');
/* LES RAYONS DE SOLEIL : des pans de lumière qui tombent en biais entre les géants (additifs). Leur axe suit la lumière de la forêt ;
   ils s'éteignent à moins de 40 m de l'objectif (sinon un voile plein écran quand la caméra passe dedans). aR = (sommet, largeur) · aL = (longueur, hasard) */
const FOR_RAY_VS=['attribute vec4 aR;attribute vec2 aL;uniform vec3 uSunDir,uCam;uniform float uTime;varying vec2 vQ;varying float vA,vD;',
  'void main(){vec3 ax=-normalize(uSunDir+vec3(0.,.08,0.));vec3 P=aR.xyz+ax*aL.x*position.y;vec3 vw=normalize(P-uCam);vec3 sd=normalize(cross(ax,vw)+vec3(1e-4,0.,0.));',
  '  P+=sd*position.x*aR.w*(1.+position.y*.7);vQ=vec2(position.x*2.,position.y);vA=.55+.45*sin(uTime*.35+aL.y*20.);',
  '  vec4 mv=viewMatrix*vec4(P,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_RAY_FS=['uniform vec3 uSunC;uniform float uRay,uRayK,fogNear,fogFar;varying vec2 vQ;varying float vA,vD;',
  'void main(){float x=1.-vQ.x*vQ.x;float a=x*x*smoothstep(0.,.18,vQ.y)*smoothstep(1.,.45,vQ.y)*vA*uRay*uRayK*smoothstep(40.,110.,vD)*(1.-smoothstep(fogNear,fogFar,vD));',
  '  vec3 rc=mix(vec3(.50,.72,1.),vec3(1.,.80,.46),smoothstep(.15,.85,x));gl_FragColor=vec4(uSunC*rc*a*.16,1.);}'].join('\n'); /* (2026-10-20, embellir) DEUX TEMPÉRATURES : le cœur du rai est ambre, sa lisière bleutée (le remplissage froid du ciel) */
/* LA BRUME EN NAPPES : de grands flocons face à la caméra, qui dérivent au fond de la vallée et traversent la route la nuit */
const FOR_BRUME_VS=['uniform vec3 uCam,uSunDir;uniform float uTime;varying vec2 vUv;varying float vD,vS,vG;',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float s=length(instanceMatrix[0].xyz);vS=fract(c.x*.013+c.z*.007);',
  '  c.x+=sin(uTime*.05+vS*20.)*25.;c.z+=cos(uTime*.04+vS*13.)*25.;',
  '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
  '  vG=dot(normalize(c-uCam),uSunDir);', /* (2026-10-20, embellir) vG : la nappe est-elle devant le soleil (ou la lune) ? */
  '  vec3 P=c+(R*position.x+U*position.y*.45)*s;vUv=uv;vec4 mv=viewMatrix*vec4(P,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_BRUME_FS=[FG_BRUIT,'uniform vec3 uMistC,uSky,uSunC;uniform float uMistK,uHante,uTime,fogNear,fogFar;varying vec2 vUv;varying float vD,vS,vG;',
  'void main(){vec2 q=vUv-.5;float a=smoothstep(.5,.08,length(q*vec2(1.,1.6)))*(.35+.65*fn2(vUv*3.2+vS*17.+vec2(uTime*.03,0.)))*.24*uMistK*smoothstep(25.,90.,vD)*(1.-smoothstep(fogFar*.7,fogFar,vD))*1.6;if(a<.003)discard;',
  '  vec3 c=uMistC*.75+(uSky*.18+uSunC*.12)+vec3(.05,.20,.16)*uHante;',
  '  float so=smoothstep(-.1,.9,vG);c+=mix(uSunC*vec3(1.,.70,.38)*.20,vec3(.20,.16,.42),uHante)*so*so;c+=vec3(.03,.06,.16)*(1.-so)*(1.-uHante*.5);', /* (embellir) la brume au contre-jour s'allume (ambre, la nuit violet-lune), à l'opposé elle se refroidit */
  '  gl_FragColor=vec4(c,a);}'].join('\n');
/* LES LUEURS DE LA NUIT : les FEUX FOLLETS (type 0 : un coeur bleu-vert, un halo, ils vacillent) et les YEUX (type 1 : deux amandes
   rouges ou ambrées qui clignent, et se ferment quand la caisse approche). aL = (type, couleur, taille, hasard). */
const FOR_LUEUR_VS=['attribute vec4 aL;uniform vec3 uCarP,uCam;uniform float uTime,uHante,uLant;varying vec2 vQ;varying vec4 vL;varying float vO;',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
  '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
  '  float op=uHante;if(aL.x>1.5){float dc=distance(c,uCam);op=uLant*(.88+.12*sin(uTime*3.1+aL.w*40.))*smoothstep(32.,95.,dc)*(1.-smoothstep(480.,820.,dc));}', /* (2026-10-20, embellir) type 2 : les LANTERNES de conte — fixes, ambre, elles ne brillent que le soir, la nuit et sous la pluie */
  '  else if(aL.x>.5){float bl=step(.06,fract(uTime*(.11+aL.w*.07)+aL.w*7.));op*=bl*smoothstep(40.,85.,distance(c,uCarP))*(1.-smoothstep(380.,520.,distance(c,uCarP)));}', // les yeux CLIGNENT, se ferment quand on approche
  '  else op*=(.75+.25*sin(uTime*9.+aL.w*40.))*(.8+.2*sin(uTime*2.3+aL.w*9.));vO=op;',
  '  vec3 P=c+(R*position.x*(aL.x>1.5?1.:aL.x>.5?1.6:1.)+U*position.y)*aL.z;vQ=position.xy*2.;vL=aL;vec4 mv=viewMatrix*vec4(P,1.);gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_LUEUR_FS=['varying vec2 vQ;varying vec4 vL;varying float vO;',
  'void main(){if(vO<.003)discard;vec3 col;float a;',
  '  if(vL.x>1.5){float r=length(vQ),co=exp(-r*r*30.),ha=exp(-r*r*3.6)*.62*(1.-smoothstep(.55,1.,r));vec3 hu=vL.y<.5?vec3(1.,.60,.24):vL.y<1.5?vec3(1.,.80,.40):vec3(.96,.30,.62);', /* ambre · or · rose néon (rare) */
  '    col=hu*1.25+vec3(.9,.8,.62)*co*1.3;a=ha+co;}',
  '  else if(vL.x>.5){float e=abs(vQ.y)/max(.001,1.-vQ.x*vQ.x*.95);a=smoothstep(.55,.25,e)*(1.-smoothstep(.8,1.,abs(vQ.x)));float p=smoothstep(.2,0.,length(vQ*vec2(1.,1.6)));',
  '    col=(vL.y<.5?vec3(1.,.12,.05):vL.y<1.5?vec3(1.,.62,.08):vec3(.6,1.,.2))*(1.6+2.*p);}',
  '  else{float r=length(vQ);a=exp(-r*r*9.)+.42*exp(-r*r*2.2);col=mix(vec3(.55,.95,.82),vec3(.62,.80,1.),vL.y)*1.35;}',
  '  gl_FragColor=vec4(col*a*vO,1.);}'].join('\n');
function foretMats(){if(FORET.mats)return FORET.mats;const U=FOR_U,F=THREE.UniformsLib.fog;
  const sm=(vs,fs,o)=>{const m=new THREE.ShaderMaterial(Object.assign({uniforms:Object.assign(THREE.UniformsUtils.clone(F),U,o&&o.u||{}),vertexShader:vs,fragmentShader:fs,fog:true},o&&o.m||{}));m.dispose=function(){};return m;}; // jamais libérées : un seul jeu pour toutes les forêts
  const M={};
  /* ===== LES ARBRES EN WEBGL 1 (24/10, relecture : « les shaders qui lisent fwidth sans l'extension des dérivées ») ===== FOR_ARB_FS lit fwidth (les
     mini-cubes, le vitrail) : en WebGL 1 il faut GL_OES_standard_derivatives, sinon le programme ne compile pas — plus un arbre, ni géant, ni
     chaumière, ni rocher, ni abeille. three ne pose la directive qu'en WebGL 1 (en WebGL 2 le programme est le même) ; comme M.pic du glacier. */
  M.arb=sm(FOR_ARB_VS,FOR_ARB_FS,{u:{uFen:{value:0},uMini:{value:1},uCon:{value:1},uVit:{value:1},uVitL:{value:.95},uVitS:{value:.85},uVitG:{value:new THREE.Color(1,.86,.45)}},m:{extensions:{derivatives:true}}});
  M.sol=sm(FOR_SOL_VS,FOR_SOL_FS);
  M.eau=sm(FOR_EAU_VS,FOR_EAU_FS,{m:{transparent:true,depthWrite:false}});
  M.fleur=sm(FOR_FLEUR_VS,FOR_FLEUR_FS,{u:{uTex:{value:forFleursTex()}},m:{side:THREE.DoubleSide}});
  M.pap=sm(FOR_PAP_VS,FOR_PAP_FS,{u:{uTex:{value:forAilesTex()},uBat:{value:0}},m:{side:THREE.DoubleSide}});
  M.luc=sm(FOR_LUC_VS,FOR_LUC_FS,{u:{uBoxL:{value:new THREE.Vector3()},uBoxB:{value:new THREE.Vector3(320,110,340)}},m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.ray=sm(FOR_RAY_VS,FOR_RAY_FS,{m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}});
  M.brume=sm(FOR_BRUME_VS,FOR_BRUME_FS,{m:{transparent:true,depthWrite:false}}); // (la brume est calculée : pas de toile)
  M.lueur=sm(FOR_LUEUR_VS,FOR_LUEUR_FS,{m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.lune=new THREE.SpriteMaterial({map:forLuneTex(),transparent:true,depthWrite:false,fog:false,opacity:0});M.lune.dispose=function(){};
  M.loup=new THREE.SpriteMaterial({map:forLoupTex(),transparent:true,depthWrite:false,fog:true,opacity:0,alphaTest:.02});M.loup.dispose=function(){};
  M.halo=new THREE.SpriteMaterial({map:lampTex,color:0xcfe6ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:0});M.halo.dispose=function(){};
  return FORET.mats=M;}
/* ---------------- LE RELIEF : LE FOND DE LA FORÊT, SOUS LA ROUTE LA PLUS BASSE ----------------
   (2026-10-15, LA PELOTE) La route repasse sur elle-même à plusieurs hauteurs : le sol ne suit plus « la route la plus proche » (la hauteur
   moyenne des routes voisines aurait mis le fond AU-DESSUS de la route du dessous). Il suit l'ENVELOPPE BASSE des routes : en chaque case,
   le minimum, sur les points de route à moins de 520 m, de (hauteur de la route + la remontée `mont(d)` : 24 % jusqu'à 650 m, 5 % au-delà) —
   un cône renversé sous chaque tronçon ; le fond est 120-145 m sous cette enveloppe. Sous la route la plus basse : ~130 m de vide jusqu'au
   sol, les cimes juste sous la dalle ; sous une route haute, le gouffre. En s'éloignant de la pelote, la forêt remonte en collines tout
   autour (on roule au fond d'une cuvette boisée, la forêt ferme l'horizon). Au-delà de 520 m, une grille grossière (×4) prend le relais.
   Deux grilles de plus servent aux arbres : `yn`, la route la plus BASSE à moins de 150 m (le plafond des arbres du bord) et `yb`, la plus
   basse à moins de 280 m (l'AIR LIBRE entre les étages de la pelote : aucun arbre ordinaire n'y monte — seuls les géants traversent les
   étages, et c'est entre leurs troncs qu'on saute d'une route à l'autre). Zéro rnd() consommé. */
function forBruit(x,z,s){const a=Math.sin(x*.0123+s)*Math.sin(z*.0107-s*.7),b=Math.sin(x*.031+z*.027+s*2.1)*.5,c=Math.sin(x*.0047-z*.0051+s*.3);return (a+b+c)/2.5;}
function* foretSol(){ // (LE PRÉ-BÂTI) un générateur : rendez-vous à l'échéance JF.lim (au passage, d'un trait)
  const C=PAL_B9('foretSolC',24),MARG=PAL_B9('foretMarge',2800),R1=520,mont=d=>d<650?.24*d:156+.05*(d-650);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  x0-=MARG;x1+=MARG;z0-=MARG;z1+=MARG;
  const nx=Math.ceil((x1-x0)/C)+1,nz=Math.ceil((z1-z0)/C)+1,N=nx*nz,D=new Float32Array(N).fill(1e12),HM=new Float32Array(N).fill(1e9),YN=new Float32Array(N).fill(1e5),YB=new Float32Array(N).fill(1e5);
  const RS=[],pas=Math.max(1,Math.round(12/(L/(NP-1))));for(let i=0;i<NP;i+=pas)RS.push(i);
  // la grille grossière : distance à la route et enveloppe basse, sur un point de route sur trois — floutée
  const CG=C*4,gx=Math.ceil((x1-x0)/CG)+1,gz=Math.ceil((z1-z0)/CG)+1,GD=new Float32Array(gx*gz),GH=new Float32Array(gx*gz);
  for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){if(!i&&performance.now()>JF.lim)yield;const x=x0+i*CG,z=z0+j*CG;let bd=1e18,bh=1e9;for(let k=0;k<RS.length;k+=3){const p=pts[RS[k]],d2=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d2<bd)bd=d2;const h=p.y+mont(Math.sqrt(d2));if(h<bh)bh=h;}
    const o=i+j*gx;GD[o]=Math.sqrt(bd);GH[o]=bh;}
  for(let it=0;it<3;it++){const T9=GH.slice();for(let j=1;j<gz-1;j++)for(let i=1;i<gx-1;i++){let s9=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)s9+=T9[i+a+(j+b)*gx];GH[i+j*gx]=Math.min(T9[i+j*gx],s9/9);}} // (le flou ne remonte jamais l'enveloppe)
  const gBil=(A,x,z)=>{const fx=Math.max(0,Math.min(gx-1.001,(x-x0)/CG)),fz=Math.max(0,Math.min(gz-1.001,(z-z0)/CG)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*gx;
    return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+gx]*(1-u)+A[k+gx+1]*u)*v;};
  // le tampon fin, autour de chaque point de route (≤ 520 m) : la distance exacte, l'enveloppe basse, les deux plafonds des arbres
  const rC=Math.ceil(R1/C),R2=R1*R1,N2=150*150,B2=280*280;
  for(const ri of RS){if(performance.now()>JF.lim)yield;const p=pts[ri],ci=Math.round((p.x-x0)/C),cj=Math.round((p.z-z0)/C);
    for(let b=-rC;b<=rC;b++){const j=cj+b;if(j<0||j>=nz)continue;const z=z0+j*C,dz=z-p.z;
      for(let a=-rC;a<=rC;a++){const i=ci+a;if(i<0||i>=nx)continue;const x=x0+i*C,dx=x-p.x,d2=dx*dx+dz*dz;if(d2>R2)continue;const k=i+j*nx;
        if(d2<D[k])D[k]=d2;const h=p.y+.24*Math.sqrt(d2);if(h<HM[k])HM[k]=h;if(d2<B2&&p.y<YB[k]){YB[k]=p.y;if(d2<N2&&p.y<YN[k])YN[k]=p.y;}}}}
  const H=new Float32Array(N),PR=new Float32Array(N),FD=new Float32Array(N),sd9=FORET.graine*.001;
  /* (2026-10-14, session PERF) LE BRUIT EN DEUX MOITIÉS. Le terme a = sin(x·.0123+s)·sin(z·.0107−.7s) de forBruit ne dépend que de la
     colonne OU de la rangée : ses sinus sont lus dans des tables (une par échelle), calculés avec EXACTEMENT les mêmes opérandes que
     forBruit (x9 = x·e, puis x9·.0123+s) — mêmes flottants au bit ; b et c (mêlés x et z) restent calculés. ~2 sinus sur 4 de moins par appel. */
  const BE=[[1,sd9],[.43,sd9+3],[.31,sd9+7],[3.1,sd9+1],[1.7,sd9+5],[2.3,sd9+9]],BX=BE.map(()=>new Float64Array(nx)),BZ=BE.map(()=>new Float64Array(nz));
  for(let e=0;e<BE.length;e++){const m=BE[e][0],s=BE[e][1];for(let i=0;i<nx;i++){const x=x0+i*C,x9=m===1?x:x*m;BX[e][i]=Math.sin(x9*.0123+s);}
    for(let j=0;j<nz;j++){const z=z0+j*C,z9=m===1?z:z*m;BZ[e][j]=Math.sin(z9*.0107-s*.7);}}
  const fB=(e,i,j,x,z)=>{const s=BE[e][1],a=BX[e][i]*BZ[e][j],b=Math.sin(x*.031+z*.027+s*2.1)*.5,c=Math.sin(x*.0047-z*.0051+s*.3);return (a+b+c)/2.5;}; // = forBruit(x,z,s), x et z déjà mis à l'échelle
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(!i&&performance.now()>JF.lim)yield;const k=i+j*nx,x=x0+i*C,z=z0+j*C;let d,hb;
    if(D[k]<1e11){d=Math.sqrt(D[k]);hb=HM[k];if(d>R1-160){const w=THREE.MathUtils.smoothstep(d,R1-160,R1);hb=Math.min(hb,hb*(1-w)+gBil(GH,x,z)*w);}}
    else{d=Math.max(R1,gBil(GD,x,z));hb=gBil(GH,x,z);}
    D[k]=d;
    const n1=fB(0,i,j,x,z),D0=132+13*n1; // la PROFONDEUR sous l'enveloppe : 120-145 m
    if(d>MARG+150){H[k]=hb-D0+52*fB(2,i,j,x*.31,z*.31);PR[k]=0;FD[k]=.62;continue;} // hors du maillage : les collines seules (rien d'autre ne lit si loin)
    H[k]=hb-D0+40*fB(2,i,j,x*.31,z*.31)*THREE.MathUtils.smoothstep(d,380,900)+4.5*fB(3,i,j,x*3.1,z*3.1);
    const pr=d<220?THREE.MathUtils.smoothstep(fB(4,i,j,x*1.7,z*1.7),.05,.42)*(1-THREE.MathUtils.smoothstep(d,160,220)):0;PR[k]=pr;
    FD[k]=Math.max(0,Math.min(1,(d<ROAD_HALF+60?.25:d<280?.45:d<700?.86:.62)+.18*fB(5,i,j,x*2.3,z*2.3)-pr*.9));}
  return FORET.sol={x0:x0,z0:z0,C:C,nx:nx,nz:nz,h:H,d:D,yn:YN,yb:YB,pr:PR,f:FD,can:new Float32Array(N).fill(-1e9),MARG:MARG};
}
function solBil(A,x,z){const S=FORET.sol;if(!S)return 0;const fx=Math.max(0,Math.min(S.nx-1.001,(x-S.x0)/S.C)),fz=Math.max(0,Math.min(S.nz-1.001,(z-S.z0)/S.C)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,n=S.nx;
  return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+n]*(1-u)+A[k+n+1]*u)*v;}
function solH(x,z){return solBil(FORET.sol.h,x,z);}
/* LA CANOPÉE QUI TUE : chaque arbre « tamponne » sa cime (−2 m, 75 % de son rayon) dans la grille du relief ; en vol, passer sous la
   cime de la case = dans les arbres. Les prairies et le fond du torrent restent ouverts : on peut y plonger (jusqu'au sol). */
function canTampon(x,z,r,top){const S=FORET.sol,C=S.C,ci=Math.round((x-S.x0)/C),cj=Math.round((z-S.z0)/C),rc=Math.max(0,Math.round(r*.75/C));
  for(let b=-rc;b<=rc;b++)for(let a=-rc;a<=rc;a++){const i=ci+a,j=cj+b;if(i<0||j<0||i>=S.nx||j>=S.nz)continue;const k=i+j*S.nx;if(top>S.can[k])S.can[k]=top;}}
function canH(x,z){const S=FORET.sol,i=Math.round((x-S.x0)/S.C),j=Math.round((z-S.z0)/S.C);if(i<0||j<0||i>=S.nx||j>=S.nz)return -1e9;return S.can[i+j*S.nx];}
function foretSolMesh(root){
  const S=FORET.sol,M=FORET.mats,CH=PAL_B9('foretSolCh',44),out=[];let tri=0; // des morceaux de ~1,1 km : peu d'appels de dessin, le tri par champ de three les jette encore
  for(let cj=0;cj<S.nz-1;cj+=CH)for(let ci=0;ci<S.nx-1;ci+=CH){
    const i1=Math.min(S.nx-1,ci+CH),j1=Math.min(S.nz-1,cj+CH),w=i1-ci+1,hh=j1-cj+1;let ok=false;
    for(let j=cj;j<=j1&&!ok;j+=2)for(let i=ci;i<=i1;i+=2)if(S.d[i+j*S.nx]<S.MARG){ok=true;break;}
    if(!ok)continue;
    const P=new Float32Array(w*hh*3),Nm=new Float32Array(w*hh*3),A=new Float32Array(w*hh*4),I=new Uint32Array(6*(w-1)*(hh-1));let nI=0,mI=0;
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const gi=ci+i,gj=cj+j,k=gi+gj*S.nx,q=i+j*w;
      P[q*3]=S.x0+gi*S.C;P[q*3+1]=S.h[k];P[q*3+2]=S.z0+gj*S.C;
      const hl=S.h[Math.max(0,gi-1)+gj*S.nx],hr=S.h[Math.min(S.nx-1,gi+1)+gj*S.nx],hd=S.h[gi+Math.max(0,gj-1)*S.nx],hu=S.h[gi+Math.min(S.nz-1,gj+1)*S.nx];
      let nx9=hl-hr,ny9=2*S.C,nz9=hd-hu;const l=Math.hypot(nx9,ny9,nz9);Nm[q*3]=nx9/l;Nm[q*3+1]=ny9/l;Nm[q*3+2]=nz9/l;
      A[q*4]=S.d[k];A[q*4+1]=S.pr[k];A[q*4+2]=S.f[k];A[q*4+3]=0;}
    for(let j=0;j<hh-1;j++)for(let i=0;i<w-1;i++){const k=(ci+i)+(cj+j)*S.nx;if(S.d[k]>S.MARG+120&&S.d[k+1+S.nx]>S.MARG+120)continue;const a=i+j*w;I[nI]=a;I[nI+1]=a+w;I[nI+2]=a+1;I[nI+3]=a+1;I[nI+4]=a+w;I[nI+5]=a+w+1;nI+=6;if(a+w+1>mI)mI=a+w+1;}
    if(!nI)continue;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nm,3));g.setAttribute('aS',new THREE.BufferAttribute(A,4));
    g.setIndex(new THREE.BufferAttribute(mI>65535?I.slice(0,nI):new Uint16Array(I.subarray(0,nI)),1));g.computeBoundingSphere();const m=new THREE.Mesh(g,M.sol);m.name='forêt sol';m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);out.push(m);tri+=nI/3;} // (PERF) l'index écrit en place, pas en push : même type que setIndex(tableau) aurait choisi
  FORET.n.sol=tri;FORET.solM=out;return out;} // (foretTick éteint les morceaux au-delà de la brume : le plan lointain de la caméra est à 9,8 km)
/* LE TORRENT : il serpente au fond, décalé de la route (on le voit, il n'est pas caché sous la dalle) */
/* ---------------- LES DÉCORS DU CONTE ---------------- */
function fbBoite(K,x0,y0,z0,x1,y1,z1,col,part,ytop){const f=(a,b,c,d,n)=>{const i=K.n;for(const v of [a,b,c,d])fbV(K,v[0],v[1],v[2],n[0],n[1],n[2],[part,.9,Math.random(),0],col,[5,0]);K.I.push(i,i+1,i+2,i,i+2,i+3);};
  f([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0]);f([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);f([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]);
  f([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]);f([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);}
/* LA CHAUMIÈRE DE LA FORÊT-NOIRE (la maison de la sorcière, si l'on veut) : soubassement de pierre, colombages, l'immense toit à quatre
   pans moussu qui descend presque au sol, des fenêtres à jardinières de géraniums — le jour une ferme de carte postale, la nuit les
   fenêtres orange (partie 4). Origine : le pied de la façade, la façade regarde +z. */
function foretChaumiereGeo(){const K=fbNew(),Y=20,pierre=[.42,.40,.36],enduit=[.86,.82,.72],bois=[.24,.15,.09],toit=[.22,.20,.17],mousse=[.20,.30,.10];
  fbBoite(K,-9,0,-7,9,2.2,7,pierre,7,Y);fbBoite(K,-8.6,2.2,-6.6,8.6,7.5,6.6,enduit,3,Y);
  for(const x of [-8.7,-4.3,0,4.3,8.7])fbBoite(K,x-.3,2.2,6.55,x+.3,7.5,6.85,bois,0,Y);           // les colombages de la façade
  fbBoite(K,-8.7,4.7,6.55,8.7,5.1,6.85,bois,0,Y);for(const x of [-6.5,-2.1,2.1,6.5]){fbBoite(K,x-1.1,3.4,6.6,x+1.1,5.6,6.9,[.08,.06,.05],4,Y);fbBoite(K,x-1.3,3.1,6.6,x+1.3,3.5,7.4,bois,0,Y);
    for(let k=0;k<5;k++)fbBoite(K,x-1.1+k*.5,3.5,6.95,x-.8+k*.5,3.85,7.3,k%2?[.85,.10,.08]:[.95,.25,.20],3,Y);} // les géraniums
  for(const sx of [-1,1])for(const z of [-3.5,0,3.5]){fbBoite(K,sx*8.6-.15,3.6,z-1,sx*8.6+.15,5.4,z+1,[.08,.06,.05],4,Y);}
  fbBoite(K,-1,2.2,6.62,1,6.2,7,[.20,.12,.07],0,Y); // la porte
  // LE TOIT : un tronc de pyramide à quatre pans, moussu, l'égout à 4 m du sol, le faîtage à 17 m
  const e=[[-11.5,4,-9.5],[11.5,4,-9.5],[11.5,4,9.5],[-11.5,4,9.5]],r=[[-5,17,-1],[5,17,-1],[5,17,1],[-5,17,1]];
  const pan=(a,b,c,d)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    const i=K.n;for(const v of [a,b,c,d]){const m9=v[1]<6?.6:.15;fbV(K,v[0],v[1],v[2],nx,ny,nz,[3,.85,Math.random(),0],[toit[0]*(1-m9)+mousse[0]*m9,toit[1]*(1-m9)+mousse[1]*m9,toit[2]*(1-m9)+mousse[2]*m9],[5,.8]);}K.I.push(i,i+1,i+2,i,i+2,i+3);};
  pan(e[3],e[2],r[2],r[3]);pan(e[1],e[0],r[0],r[1]);pan(e[2],e[1],r[1],r[2]);pan(e[0],e[3],r[3],r[0]);pan(r[3],r[2],r[1],r[0]);
  fbBoite(K,3.5,12,-3,5.5,20,-1,pierre,7,Y); // la cheminée
  return fbGeo(K);}
/* LE ROCHER DU LOUP : une aiguille de grès qui crève la canopée sur le flanc de la vallée (le jour un belvédère, la nuit le perchoir du
   loup-garou). Origine au pied, sommet vers 52 m. */
function foretRocherGeo(){const K=fbNew(),rg=mulberry32(0x0C1E),col=[.46,.38,.33];
  fbTube(K,[[0,-8,0],[1.5,14,.5],[-1,30,1.5],[1,44,-.5],[0,52,0]],[15,12,9.5,7,3],12,{col:col,ec:5,mousse:.45,ytop:52,rg:rg,rug:.16,part:7,cap:1,fixe:1,aoK:.4});
  for(let k=0;k<5;k++){const an=k*1.26+rg(),x=Math.cos(an),z=Math.sin(an);fbTouffe(K,[x*11,4+rg()*14,z*11],6+rg()*4,1,{rg:rg,cc:[0,10,0],cr:16,col:col,ytop:52,part:7,bos:.3,mix:.2,fixe:1});}
  fbTouffe(K,[0,50,0],5.5,1,{rg:rg,cc:[0,48,0],cr:6,col:col,ytop:52,part:7,bos:.25,sq:.5,mix:.2,fixe:1});
  return fbGeo(K);}
/* L'AMANITE (pour les ronds de sorcières, au fond de la vallée) : un pied blanc, un chapeau rouge, ses points luisent la nuit (partie 6) */
function foretChampiGeo(){const K=fbNew(),rg=mulberry32(0xA3A);
  fbTube(K,[[0,0,0],[0,1.4,0],[0,2.6,0]],[.42,.34,.30],8,{col:[.92,.89,.82],ec:5,ytop:4,rg:rg,part:3});
  fbTouffe(K,[0,2.7,0],1.5,1,{rg:rg,cc:[0,2.7,0],cr:1.5,col:[.78,.08,.04],ytop:4,part:6,sq:.48,bos:.05,mix:.5});
  return fbGeo(K);}
/* L'ARCHE : un géant tombé il y a mille ans, qui ENJAMBE la route — la souche et ses racines d'un côté, la couronne brisée de l'autre,
   moussue, des amanites qui luisent la nuit. Sous lui, au moins 24 m d'air au-dessus de la dalle. Les gélules de collision sont rendues. */
function foretArche(root,fr,M,k9){const Q=FORET.Q,qa=Q&&Q[k9||'arche'];if(!qa)return null; // (2026-10-19, LA FORÊT AU HASARD) k9 : 'arche' ou 'archeB' — une forêt peut en avoir deux
  let ia=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(qa.p);if(d<bd){bd=d;ia=i;}}
  const p=pts[ia],t=T[ia],hl=Math.hypot(t.x,t.z)||1,bx=-t.z/hl,bz=t.x/hl,sg=fr()<.5?-1:1,K=fbNew(),C=[];
  const A=[p.x-bx*sg*(ROAD_HALF+95)+t.x/hl*30,0,p.z-bz*sg*(ROAD_HALF+95)+t.z/hl*30],B9=[p.x+bx*sg*(ROAD_HALF+110)-t.x/hl*25,0,p.z+bz*sg*(ROAD_HALF+110)-t.z/hl*25];
  A[1]=solH(A[0],A[2])+6;B9[1]=solH(B9[0],B9[2])+4;const top=p.y+24+8.5;
  const cp=[],rad=[],n=26,ph=fr()*6.28;
  for(let k=0;k<=n;k++){const u=k/n,x=A[0]+(B9[0]-A[0])*u,z=A[2]+(B9[2]-A[2])*u,yl=A[1]+(B9[1]-A[1])*u,arc=Math.sin(u*Math.PI);
    cp.push([x+Math.sin(u*9+ph)*3,yl+(top-(A[1]+B9[1])/2)*Math.pow(arc,.62)+Math.sin(u*13+ph)*1.2,z+Math.cos(u*7+ph)*3]);rad.push((10.5-4.2*arc+(k===0?3:0))*(1+.14*Math.sin(k*1.9+ph)+.07*Math.sin(k*4.3+ph*2)));}
  // (2026-10-15, LA PELOTE) l'arche enjambe SA route — et aucune autre : si un autre étage de la pelote passe dans son tronc, pas d'arche
  {const ds9=L/(NP-1),j0=ia-Math.round(300/ds9),j1=ia+Math.round(300/ds9);
   for(let j=0;j<NP;j+=3){if(j>j0&&j<j1)continue;const q=pts[j];
     for(let k=0;k<n;k++){const a9=cp[k],b9=cp[k+1],r9=Math.max(rad[k],rad[k+1]);if(q.y<Math.min(a9[1],b9[1])-r9-10||q.y>Math.max(a9[1],b9[1])+r9+10)continue;
       const ex=b9[0]-a9[0],ez=b9[2]-a9[2],l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((q.x-a9[0])*ex+(q.z-a9[2])*ez)/l2));
       if(Math.hypot(q.x-a9[0]-ex*u,q.z-a9[2]-ez*u)<r9+ROAD_HALF+5)return null;}}}
  const o=[cp[n>>1][0],0,cp[n>>1][2]];
  for(const q of cp){q[0]-=o[0];q[2]-=o[2];}
  fbTube(K,cp,rad,18,{col:[.27,.22,.17],ec:2,mousse:.75,ytop:1e4,rg:fr,rug:.13,fixe:1,aoK:.6});
  for(let k=0;k<9;k++){const j=2+((fr()*(n-4))|0),q=cp[j],r=rad[j],an=fr()*6.28;fbTouffe(K,[q[0]+Math.cos(an)*r*.8,q[1]+Math.sin(an)*r*.7,q[2]+Math.sin(an)*r*.5],r*(.28+fr()*.2),1,{rg:fr,cc:q,cr:r,col:[.25,.2,.15],ytop:1e4,part:0,bos:.3,mix:.3,fixe:1,mousse:.5});} // les NOEUDS
  for(let k=0;k<n;k++)C.push([cp[k][0]+o[0],cp[k][1],cp[k][2]+o[2],cp[k+1][0]+o[0],cp[k+1][1],cp[k+1][2]+o[2],rad[k+1]*1.02]);
  // la souche : un éventail de racines dressées
  for(let k=0;k<9;k++){const an=k/9*6.283,x=Math.cos(an),y9=Math.sin(an),d=[B9[0]-A[0],B9[2]-A[2]],dl=Math.hypot(d[0],d[1]),ux=-d[0]/dl,uz=-d[1]/dl,px=-uz,pz=ux;
    const c0=[cp[0][0],cp[0][1]+2,cp[0][2]],e=[c0[0]+ux*10+px*x*20,c0[1]+y9*20+6,c0[2]+uz*10+pz*x*20];fbTube(K,[c0,[(c0[0]+e[0])/2,(c0[1]+e[1])/2+3,(c0[2]+e[2])/2],e],[3.6,2.2,.6],7,{col:[.26,.21,.16],ec:2,mousse:.5,ytop:1e4,rg:fr,fixe:1,aoK:.6});}
  // la couronne brisée : quelques touffes encore vertes
  for(let k=0;k<6;k++){const q=cp[n],c=[q[0]+(fr()-.5)*24,q[1]+6+fr()*14,q[2]+(fr()-.5)*24];fbTouffe(K,c,8+fr()*5,1,{rg:fr,cc:q,cr:22,col:FC.chene,ytop:1e4,sq:.8,fixe:1});}
  // les amanites du dos de l'arbre
  for(let k=0;k<14;k++){const q=cp[2+((fr()*(n-4))|0)],r=rad[n>>1];fbTouffe(K,[q[0]+(fr()-.5)*r,q[1]+r*.85,q[2]+(fr()-.5)*r],.9+fr()*.8,1,{rg:fr,cc:[q[0],q[1]+r,q[2]],cr:2,col:[.78,.08,.04],ytop:1e4,part:6,sq:.5,bos:.05,mix:.4,fixe:1});}
  const m=new THREE.Mesh(fbGeo(K),M.arb);m.position.set(o[0],0,o[2]);m.updateMatrix();m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);
  // le lierre qui pend sous l'arche (jamais plus bas que 12 m au-dessus de la dalle)
  const LI=[];
  FORET.zonesNu.push([o[0],o[2],60]);FORET.zonesNu.push([A[0],A[2],45]);FORET.zonesNu.push([B9[0],B9[2],45]);
  return {C:C,LI:LI,c:new THREE.Vector3(o[0],top,o[2])};}
/* ---------------- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors de la forêt) ---------------- */
const FOR_GEANT_RB={chene:10.8,hetre:8.2,epicea:6.6,ancien:13,sequoia:14.6}; // (2026-10-15, LA PELOTE) le rayon du fût PRUDENT : à 85 % du pied — la route d'en dessous passe là où le tronc est plus épais
function forLot(items){ // trie les exemplaires par QUARTIER : chaque quartier = une plage contiguë (le tri par champ ne recopie que ce qu'il faut)
  items.sort(function(a,b){return a.q-b.q;});const n=items.length,o={n:n,M:new Float32Array(n*16),J:new Float32Array(n*4),rK:[],rA:[],rB:[]};
  let a=0;for(let i=0;i<n;i++){o.M.set(items[i].m,i*16);o.J.set(items[i].j,i*4);if(i===n-1||items[i+1].q!==items[i].q){o.rK.push(items[i].q);o.rA.push(a);o.rB.push(i+1);a=i+1;}}
  o.rK=Int32Array.from(o.rK);o.rA=Int32Array.from(o.rA);o.rB=Int32Array.from(o.rB);return o;}
function forFamille(root,geo,mat,lot,b0,b1,attr,ordre){if(!lot||!lot.n)return null;
  const g=new THREE.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);if(geo.index)g.setIndex(geo.index); // les attributs du prototype sont PARTAGÉS (voir foretVide)
  const F={lot:lot,b0:b0,b1:b1,attr:attr,sig:0,tri:(geo.index?geo.index.count:geo.attributes.position.count)/3};
  F.aJ=new THREE.InstancedBufferAttribute(new Float32Array(lot.n*4),4);F.aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute(attr,F.aJ);
  F.im=new THREE.InstancedMesh(g,mat,lot.n);F.im.frustumCulled=false;F.im.matrixAutoUpdate=false;F.im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);F.im.count=0;F.im.visible=false;
  if(ordre)F.im.renderOrder=ordre;root.add(F.im);FORET.fam.push(F);return F;}
function foretVide(){
  for(const F of FORET.fam){const g=F.im.geometry;for(const k in g.attributes)if(k!==F.attr)g.deleteAttribute(k);g.setIndex(null);g.dispose();F.im.dispose();}
  FORET.fam=[];FORET.quart=null;FORET.sig=0;FORET.geants=[];FORET.dz=null;FORET.deco=null;FORET.clr=[];FORET.lant=null;FORET.gcol=null;FORET.arche=[];FORET.chaum=[];FORET.rocs=[];FORET.sol=null;FORET.solM=null;
  if(FORET.root){FORET.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});FORET.root=null;}
  if(FORET.loup){FORET.loup.t=0;FORET.loup.on=false;FORET.loup.roc=null;} // (2026-10-14, chasse aux bugs) un portail pendant un hurlement laissait `on` et le rocher de l'ANCIENNE piste : à la forêt suivante le loup-garou y réapparaissait jusqu'à 7,4 s
}
/* (2026-10-17, banc) dbgPleureurs(k) : rebâtit le décor de CETTE forêt (même graine) avec (1) ou sans (0) les pleureurs et re-rend une image. */
window.dbgVitrail=function(k,o){const u=foretMats().arb.uniforms;u.uVit.value=k==null?1:+k;o=o||{};if(o.L!=null)u.uVitL.value=+o.L;if(o.S!=null)u.uVitS.value=+o.S; // (2026-10-17) les arbres en VITRAIL : 0 = sans, 1 = avec (même image) ; {L,S} = la lumière des joints, l onde
  if(o.banc){const gl=renderer.getContext(),px=new Uint8Array(4),T=[];for(let i=0;i<o.banc;i++){const t0=performance.now();if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-t0);}T.sort((a,b)=>a-b);return +T[T.length>>1].toFixed(1);} // (banc) ms d une image synchronisée
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {vit:u.uVit.value,L:u.uVitL.value,S:u.uVitS.value};};
window.dbgPleureurs=function(k){PLEUR.on=k==null?true:!!k;if(FORET.seed==null)return 'pas de forêt';buildForet(FORET.seed);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {pleureurs:PLEUR.on,n:FORET.n};};
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé de la forêt change depuis le 19/10, pas son décor — toujours la même forêt mêlée (épicéas, sapins, hêtres-saules), les
   mêmes géants pleureurs, un rocher du loup tous les ~700 m, deux chaumières, 2-3 ronds d'amanites, la même brume. Désormais, par piste, un TIRAGE
   DE DÉCOR dans un flux à lui (`dr`, né de la graine du décor : jamais le hasard de la route), treize choix indépendants (`FORET.dz`, lisible dans
   `dbgForet().deco`) — les placements neufs (clairières, cercles de pierres) dans un second flux (`dz2`) :
   · LE PEUPLEMENT (`ess`) : mêlé (celui d'avant), résineux, hêtraie, boulaie, pinède — la table des essences par distance à la route ;
   · LES SAULES (`pleur`) : combien de feuillus deviennent des pleureurs (peu / comme avant / partout) ;
   · LA SAISON (`sais`) : été (avant), automne (des hêtres, chênes, bouleaux d'or), printemps (vert tendre), sombre (bleuté) — la teinte par arbre et
     un uniform (uLeafT, multiplié) : même programme ;
   · LA DENSITÉ (`dens`) : clairsemée ×0,75, avant, dense ×1,1 ;
   · LES GÉANTS (`gea`) : la colonnade (serrée / avant / clairsemée) et leurs essences (pleureurs d'avant ou VIEUX CHÊNES tordus, dorés à l'automne) ;
   · LES ROCHERS DU LOUP (`rocs`) : aucun, rares, avant, nombreux ; leur taille ×0,8-1,3 ;
   · LES CHAUMIÈRES (`chaum`) : aucune, une ou deux (avant), un HAMEAU de 3-5 au bord de la route ;
   · LES RONDS DE SORCIÈRES (`ama`) : 0, 2-3 (avant), 5-8 ; leurs amanites ×1-1,8, plus près de la route ;
   · LES FLEURS (`fl`) : la fleur des prairies (digitales pourpres, coquelicots, marguerites, boutons d'or, ou le mélange d'avant), leur densité ;
   · LES CLAIRIÈRES (`clair`, NEUF) : 0-3 trous dans la forêt au bord de la route, fleuris, sans arbre ni géant ;
   · LE CERCLE DE PIERRES (`crom`, NEUF) : 0-2 cromlechs de menhirs (le rocher du loup, à 1/6 d'échelle), dans une clairière ou à 60-120 m ;
   · LA BRUME (`brume`) : légère / avant / épaisse — ses nappes et l'uniform uMistK ;
   · LES RAYONS ET LES YEUX (`ray`, `yeux`) : la densité des rayons de soleil, le nombre d'yeux la nuit.
   Rien ne touche la route : les menhirs gardent ROAD_HALF + 25 m et leurs gélules entrent dans les collisions ; les clairières ne font que retirer
   des arbres. `?sans=foretdecor` = le décor d'avant, au tirage près (aucun tirage de plus dans `fr` ni `fw`). */
const FOR_ESS={ // [près (< 175 m), milieu (< 620 m), loin] : des seuils cumulés sur r
  'résineux':[[[.35,'epicea'],[.62,'sapin'],[.8,'pin'],[.9,'bouleau'],[1,'hetre']],[[.5,'epicea'],[.8,'sapin'],[.95,'pin'],[1,'hetre']],[[.5,'epicea'],[.85,'sapin'],[1,'pin']]],
  'hêtraie':[[[.4,'hetre'],[.62,'chene'],[.8,'bouleau'],[.9,'pin'],[1,'epicea']],[[.5,'hetre'],[.75,'chene'],[.85,'bouleau'],[1,'epicea']],[[.6,'hetre'],[.8,'chene'],[1,'epicea']]],
  'boulaie':[[[.55,'bouleau'],[.75,'hetre'],[.88,'pin'],[1,'sapin']],[[.4,'bouleau'],[.6,'pin'],[.8,'epicea'],[1,'hetre']],[[.48,'epicea'],[.68,'sapin'],[.94,'hetre'],[1,'pin']]],
  'pinède':[[[.5,'pin'],[.7,'bouleau'],[.85,'epicea'],[1,'chene']],[[.55,'pin'],[.75,'epicea'],[1,'sapin']],[[.4,'pin'],[.8,'epicea'],[1,'hetre']]]};
function forDecoTire(seed){
  const dr=mulberry32((seed^0xDEC0F0)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  D.ess=pds([['mêlée',1.2],['résineux',1],['hêtraie',1],['boulaie',.8],['pinède',.8]])[0];li.push('forêt '+D.ess);
  {const p=pds([['peu de saules',1,[.35,.3,.15]],['saules',1.2,[.9,.75,.45]],['saules partout',.8,[1,.92,.6]]]);D.pleur=p[2];li.push(p[0]);}
  {const s=pds([['été',1.2,0,0,[1,1,1]],['automne',1,.42,.15,[1.04,.98,.86]],['printemps',1,.02,.35,[1.06,1.1,.9]],['sombre',.8,0,-.3,[.84,.92,1.02]]]);D.sais={nom:s[0],or:s[2],dt:s[3],leaf:s[4]};li.push('saison '+s[0]);}
  {const d=ch([[.75,'clairsemée'],[1,'normale'],[1.1,'dense']]);D.dens=d[0];li.push('densité '+d[1]);}
  {const c=ch([[.72,'serrée'],[1,'normale'],[1.6,'clairsemée']]),v=dr()<.4;D.gea={col:c[0],vieux:v};li.push('colonnade '+c[1]+(v?', vieux chênes':', géants pleureurs'));}
  {const r=pds([['aucun rocher',.5,0],['rochers rares',1,1.8],['rochers',1,1],['rochers nombreux',1,.55]]);D.rocs={pas:r[2],sc:.8+dr()*.5};li.push(r[0]+(r[2]?' ×'+D.rocs.sc.toFixed(2):''));}
  D.chaum=pds([['aucune',.6],['une ou deux',1.2],['hameau',1]])[0];li.push('chaumières : '+D.chaum);
  {const n=ch([0,2,3,5,7]);D.ama={n:n,sc:1+dr()*.8,lat:n>3?30:55};li.push(n+' ronds d\'amanites'+(n?' ×'+D.ama.sc.toFixed(1):''));}
  {const f=pds([['mélange',1.2,-1],['digitales',1,0],['coquelicots',1,1],['marguerites',1,2],['boutons d\'or',1,3]]),k=ch([.7,1,1.4]);D.fl={dom:f[2],k:k};li.push('fleurs '+f[0]+' ×'+k);}
  D.clair=(dr()*4)|0;li.push(D.clair+' clairière'+(D.clair>1?'s':''));
  D.crom=pds([[0,1],[1,1.2],[2,.6]])[0];li.push(D.crom+' cercle'+(D.crom>1?'s':'')+' de pierres');
  {const b=ch([[.55,.65,'légère'],[1,1,'normale'],[1.5,1.45,'épaisse']]);D.brume={n:b[0],k:b[1]};li.push('brume '+b[2]);}
  {const r=ch([.5,1,1.7]),y=ch([40,90,160]);D.ray=r;D.yeux=y;li.push('rayons ×'+r+', '+y+' yeux');}
  D.li=li;return D;}
function buildForet(seed){jadeFini(buildForetG(seed));} // (2026-10-17, LE PRÉ-BÂTI) d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildForetG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  foretVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='foret'||!(NP>1))return;
  const t0=performance.now(),M=foretMats(),PT=foretProtos(),fr=mulberry32((seed^0xF0E57)>>>0),fw=mulberry32((seed^0x5A01E)>>>0),MOB=PAL_B9('foretArbres',1)*(TEL_NATIF?.8:1),ds=L/(NP-1);FORET.b0=PAL_B9('foretB0',270);FORET.b1=PAL_B9('foretB1',760);
  FORET.graine=(seed>>>0)%100000;FORET.seed=seed;FORET.zonesNu=[];FORET.met=LVL.cur.meteo||'midi';FORET.n={};
  const DZ=FOR_DECOR?forDecoTire(seed):null,dz2=mulberry32((seed^0xB015E)>>>0);FORET.dz=DZ;FORET.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage, et le flux des placements neufs */
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);FORET.root=root;trackMeshes.push(root);
  const S=yield* foretSol(),tS=performance.now();
  foretSolMesh(root);if(performance.now()>JF.lim)yield;
  // ---- les QUARTIERS (150 m) ----
  const QC=150,QM=new Map(),QL=[];
  const qDe=(x,z)=>{const k=Math.floor(x/QC)*100003+Math.floor(z/QC);let q=QM.get(k);if(q===undefined){q=QL.length;QM.set(k,q);QL.push([1e9,-1e9,1e9,-1e9,1e9,-1e9]);}return q;};
  const ext=(q,x,y0,y1,z,r)=>{const b=QL[q];if(x-r<b[0])b[0]=x-r;if(x+r>b[1])b[1]=x+r;if(y0<b[2])b[2]=y0;if(y1>b[3])b[3]=y1;if(z-r<b[4])b[4]=z-r;if(z+r>b[5])b[5]=z+r;};
  const Mt=new THREE.Matrix4(),Qt=new THREE.Quaternion(),V3=new THREE.Vector3(),Sc=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  const mat=(x,y,z,ry,sx,sy,sz)=>{const c=Math.cos(ry),s=Math.sin(ry);return [c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1];}; // = compose(rotation Y, échelle) écrit à la main
  // ---- la route en grille (les règles de distance) ----
  const HB=100,grille=new Map(),pg=Math.max(1,Math.round(8/ds));
  for(let i=0;i<NP;i+=pg){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const lat9=i=>{const t=T[i],hl=Math.hypot(t.x,t.z)||1;return [-t.z/hl,t.x/hl];};
  // ---- les zones nues (pas d'arbre ordinaire dedans) : une grille de 60 m ----
  const ZG=new Map(),zone=(x,z,r)=>{FORET.zonesNu.push([x,z,r]);const c=Math.ceil(r/60);for(let a=-c;a<=c;a++)for(let b=-c;b<=c;b++){const k=(Math.floor(x/60)+a)*100003+(Math.floor(z/60)+b);let L9=ZG.get(k);if(!L9)ZG.set(k,L9=[]);L9.push([x,z,r]);}};
  const nu=(x,z,r)=>{const L9=ZG.get(Math.floor(x/60)*100003+Math.floor(z/60));if(L9)for(const o of L9)if(Math.hypot(x-o[0],z-o[1])<o[2]+r)return true;return false;};
  const COL=[]; // les collisions des décors : gélules et sphères en coordonnées MONDE
  const colPose=(meta,x,y,z,ry,sxz,sy)=>{const c=Math.cos(ry),s=Math.sin(ry),tr=(px,py,pz)=>[x+(px*c+pz*s)*sxz,y+py*sy,z+(-px*s+pz*c)*sxz],rr=Math.max(sxz,sy*.6);
    for(const k of meta.C||[]){const a=tr(k[0],k[1],k[2]),b=tr(k[3],k[4],k[5]);COL.push({g:1,a:a,b:b,r:k[6]*sxz});}
    for(const k of meta.S||[]){const a=tr(k[0],k[1],k[2]);COL.push({g:0,a:a,r:k[3]*rr});}};
  /* (2026-10-20, LE DÉCOR AU HASARD) LES CLAIRIÈRES (et celles des cercles de pierres) : un trou dans la forêt au bord de la route (ni arbre ni géant),
     fleuri plus bas — loin de toute AUTRE route (à plus de 500 m de piste de celle qui la longe) */
  const CLR=[];if(DZ)for(let k=0;k<DZ.clair+DZ.crom;k++){const cr9=k>=DZ.clair;for(let e=0;e<10;e++){const f=.08+dz2()*.84,i=Math.round(f*(NP-1)),l9=lat9(i),sd=dz2()<.5?-1:1,R=cr9?30+dz2()*10:48+dz2()*32,lat=ROAD_HALF+R+(cr9?35+dz2()*55:6+dz2()*40),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    let ok=true;for(const c of CLR)if(Math.hypot(c[0]-x,c[1]-z)<c[2]+R+60)ok=false;proches(x,z,R+ROAD_HALF+20,function(j){if(ok&&Math.abs(j-i)*ds>500&&Math.hypot(pts[j].x-x,pts[j].z-z)<R+ROAD_HALF+20)ok=false;});
    if(!ok)continue;CLR.push([x,z,R,i,cr9?1:0]);zone(x,z,R);break;}}
  FORET.clr=CLR;
  // ---- 1. LES GÉANTS : à la corde de chaque virage, en quinconce le long des droites, au cœur des boucles, en colonnade, et LA FUTAIE ----
  /* (2026-10-15, LA PELOTE — Sacha : « des arbres beaucoup, beaucoup plus hauts, beaucoup plus grands » · « qu'on puisse passer entre les
     arbres pour changer de route ») Un géant pose son pied au fond et ouvre sa couronne AU-DESSUS DE LA ROUTE LA PLUS HAUTE à sa portée
     (24-60 m au-dessus ; 45-195 m pour un séquoia) : sous une pelote à trois étages, un chêne monte à 400-500 m, un séquoia à 700. Son tronc
     (`FOR_GEANT_RB` : le rayon du fût sous la couronne, prudent) reste à 5 m au moins du bord de TOUTES les routes, à toutes les hauteurs. */
  const GE=[],ge=DZ&&DZ.gea.vieux?['ancien','ancien','ancien','chene','hetre']:FOR_GEANTS_N.filter(function(k){return k!=='sequoia';}); /* (LE DÉCOR AU HASARD) les VIEUX CHÊNES : l'ancien ne devient jamais pleureur */ // (les séquoias ont leurs passes à eux)
  const geantXZ=(x,z,sp)=>{if(CLR.length)for(const c of CLR)if(Math.hypot(c[0]-x,c[1]-z)<c[2]+12)return false;const meta=PT.geant[sp][0].m,base=solH(x,z)-3,cb=sp==='sequoia'?(meta.cb||178):(meta.cb||95),R9=meta.cr*2.2+ROAD_HALF+14;
    let yH=-1e9,dM=1e9,iM=-1;proches(x,z,R9,function(j){const q=pts[j],dh=Math.hypot(q.x-x,q.z-z);if(dh<R9&&q.y>yH)yH=q.y;if(dh<dM){dM=dh;iM=j;}});
    if(iM<0){const yb9=solBil(S.yb,x,z);yH=yb9<1e4?yb9:base+120;} // (aucune route à portée de couronne : la plus basse des environs sert de repère)
    const sy=THREE.MathUtils.clamp((yH-base+(sp==='sequoia'?45+fr()*150:24+fr()*36))/cb,sp==='sequoia'?.9:.7,4.4),sxz=Math.sqrt(sy)*(.84+fr()*.2),rT=FOR_GEANT_RB[sp]*sxz,cr=meta.cr*sxz;
    if(base+cb*sy-16<yH)return false; // (la couronne plafonnée passerait dans une route)
    for(const g of GE){const d=Math.hypot(g.x-x,g.z-z);if(d<Math.max((g.rT+rT)*2.4+25,(g.cr+cr)*.5))return false;}
    let ok=true;proches(x,z,rT+ROAD_HALF+6,function(j){if(!ok)return;const q=pts[j];if(Math.hypot(q.x-x,q.z-z)<rT+ROAD_HALF+5)ok=false;});
    if(!ok)return false;
    if(iM<0){let bd=1e18;for(let j=0;j<NP;j+=8){const q=pts[j],d2=(q.x-x)*(q.x-x)+(q.z-z)*(q.z-z);if(d2<bd){bd=d2;iM=j;}}}
    const q=pts[iM],ry=sp==='ancien'?Math.atan2(q.x-x,q.z-z):fr()*6.2832;
    GE.push({x:x,z:z,y:base,sp:sp,sy:sy,sxz:sxz,ry:ry,cr:cr,rT:rT,top:base+meta.h*sy,i:iM});zone(x,z,rT+9);return true;};
  const geant=(i,sg,lat,sp)=>{const p=pts[i],l9=lat9(i);return geantXZ(p.x+l9[0]*sg*lat,p.z+l9[1]*sg*lat,sp);};
  {const st=Math.max(1,Math.round(6/ds)),K9=[];
   for(let i=st;i<NP-st;i+=st){const a=T[i-st],b=T[i+st],th=Math.atan2(a.x*b.z-a.z*b.x,a.x*b.x+a.z*b.z);K9.push([i,th/(2*st*ds)]);} // la courbure signée (rad/m)
   const sm=K9.map(function(k,j){let s9=0,n9=0;for(let d=-4;d<=4;d++){const o=K9[j+d];if(o){s9+=o[1];n9++;}}return [k[0],s9/n9];});
   let der=-1e9;
   for(let j=1;j<sm.length-1;j++){if(performance.now()>JF.lim)yield;const k=sm[j],a=Math.abs(k[1]);if(a<1/1100||a<Math.abs(sm[j-1][1])||a<Math.abs(sm[j+1][1]))continue;
     const sK=k[0]*ds;if(sK-der<110||sK<260||sK>L-180)continue;
     const sg=k[1]>0?1:-1,sp=ge[(fr()*ge.length)|0]; // le côté INTÉRIEUR du virage (θ<0 : le cap tourne vers −latéral)
     if(geant(k[0],sg,ROAD_HALF+8+FOR_GEANT_RB[sp]*1.5+fr()*10,sp)||geant(k[0],sg,ROAD_HALF+22+FOR_GEANT_RB[sp]*1.6+fr()*14,ge[(fr()*ge.length)|0]))der=sK; // à la CORDE
     if(fr()<.5){const i2=Math.min(NP-1,k[0]+Math.round((55+fr()*45)/ds));geant(i2,-sg,ROAD_HALF+14+fr()*18+FOR_GEANT_RB.chene*1.6,ge[(fr()*ge.length)|0]);}}} // …et parfois, à la sortie, de l'autre côté
  {let sd=fr()<.5?-1:1;for(let s9=280;s9<L-200;s9+=95+fr()*70){if(performance.now()>JF.lim)yield;const i=Math.round(s9/ds);let pres=false;for(const g of GE){const d=Math.hypot(g.x-pts[i].x,g.z-pts[i].z);if(d<85){pres=true;break;}}
    if(pres)continue;sd=-sd;const sp=ge[(fr()*ge.length)|0];geant(i,sd,ROAD_HALF+10+FOR_GEANT_RB[sp]*1.5+fr()*22,sp);}}
  for(const o of FORET.boucles||[]){let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(o.e);if(d<bd){bd=d;bi=i;}}
    geant(bi,-o.sg,o.R,'sequoia');} // LE SÉQUOIA DE LA BOUCLE : au centre du premier demi-tour, la route tourne autour de lui
  /* LES SÉQUOIAS-TOURS (2026-10-14 soir) : une COLONNADE le long de la route — un fût tous les 70-115 m, d'un côté puis de l'autre, au ras
     du bord (la route serpente entre les troncs). */
  {let sd=fr()<.5?-1:1;for(let s9=300;s9<L-160;s9+=(70+fr()*45)*(DZ?DZ.gea.col:1)){if(performance.now()>JF.lim)yield;const i=Math.round(s9/ds);sd=-sd;
     geant(i,sd,ROAD_HALF+FOR_GEANT_RB.sequoia*1.6+16+fr()*34,'sequoia');}}
  /* LA FUTAIE (2026-10-15, LA PELOTE) : partout à moins de 360 m d'une route, un géant tous les ~95 m (une grille décalée) — séquoias,
     chênes, hêtres, épicéas, vieux chênes ; la pelote serpente entre des troncs de 20 à 50 m de diamètre, et l'air entre ses étages
     n'appartient qu'à eux : c'est entre ces fûts qu'on saute d'une route à l'autre. (`foretFutaie` : l'écart de la grille par palier) */
  {const PF=95*PAL_B9('foretFutaie',1);let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;for(let i=0;i<NP;i+=8){const p=pts[i];if(p.x<bx0)bx0=p.x;if(p.x>bx1)bx1=p.x;if(p.z<bz0)bz0=p.z;if(p.z>bz1)bz1=p.z;}
   for(let gx=bx0-360;gx<bx1+360;gx+=PF)for(let gz=bz0-360;gz<bz1+360;gz+=PF){if(performance.now()>JF.lim)yield;const x=gx+(fr()-.5)*PF*.8,z=gz+(fr()-.5)*PF*.8,d=solBil(S.d,x,z),r=fr();
     if(d>360||d<ROAD_HALF+24)continue;geantXZ(x,z,r<.42?'sequoia':ge[(fr()*ge.length)|0]);}}
  FORET.geants=GE;
  if(performance.now()>JF.lim)yield;
  // ---- 2. LES ROCHERS DU LOUP (les aiguilles de grès qui dominent la canopée) ----
  const RO=[];if(!DZ||DZ.rocs.pas){let sd=fr()<.5?-1:1;for(let s9=520+fr()*200;s9<L-450;s9+=(520+fr()*320)*(DZ?DZ.rocs.pas:1)){const i=Math.round(s9/ds),l9=lat9(i);sd=-sd;
    for(let e=0;e<4;e++){const lat=190+fr()*80,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(solBil(S.d,x,z)<150||nu(x,z,40))continue;
      const b=solH(x,z),sy=THREE.MathUtils.clamp((pts[i].y+30-b)/52,.8,2.4)*(DZ?DZ.rocs.sc:1),sxz=Math.sqrt(sy)*(.9+fr()*.25);
      RO.push({x:x,z:z,y:b,sy:sy,sxz:sxz,ry:fr()*6.283,top:b+52*sy,i:i,sd:sd});zone(x,z,26*sxz);
      COL.push({g:1,a:[x,b,z],b:[x,b+46*sy,z],r:9*sxz});break;}}}
  FORET.rocs=RO;
  // ---- 3. L'ARCHE ----
  for(const k9 of ['arche','archeB']){if(k9!=='arche'&&!(FORET.Q&&FORET.Q[k9]))continue; // (2026-10-19) une ou deux arches (la seconde : LA FORÊT AU HASARD)
    const AR=foretArche(root,fr,M,k9);if(AR){for(const c of AR.C)COL.push({g:1,a:[c[0],c[1],c[2]],b:[c[3],c[4],c[5]],r:c[6]});FORET.arche.push(AR);}}
  // ---- 4. LES CHAUMIÈRES (une ou deux, au fond, au bord d'une clairière) ----
  {const geo=FORET.geoChaum||(FORET.geoChaum=foretChaumiereGeo());
   const U9=!DZ||DZ.chaum==='une ou deux'?[.3+fr()*.15,.62+fr()*.18]:DZ.chaum==='aucune'?[]:(function(){const u0=.15+dz2()*.65,n=3+((dz2()*3)|0),o=[];for(let k=0;k<n;k++)o.push(u0+k*55/L);return o;})(); /* (LE DÉCOR AU HASARD) aucune, une ou deux, ou un HAMEAU */
   for(const u of U9){if((!DZ||DZ.chaum!=='hameau')&&fr()<.25)continue;const i=Math.round(u*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1;
     for(let e=0;e<6;e++){const lat=82+fr()*45,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,y=solH(x,z);
       if(Math.abs(solH(x+9,z)-solH(x-9,z))>5||Math.abs(solH(x,z+9)-solH(x,z-9))>5||nu(x,z,30))continue;
       const m=new THREE.Mesh(geo,M.arb);m.position.set(x,y-.6,z);m.rotation.y=Math.atan2(pts[i].x-x,pts[i].z-z);m.updateMatrix();m.matrixAutoUpdate=false;root.add(m);
       FORET.chaum.push(m);zone(x,z,30);canTampon(x,z,22,y+18);break;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 5. LA FORÊT ----
  const ESP={},LOINF=[],LOINC=[];for(const k of FOR_ESP_N)ESP[k]=[];
  /* (2026-10-15, LA PELOTE — « des arbres beaucoup plus grands ») la forêt ordinaire à l'échelle ×2,1 (des hêtres de 60 m, des épicéas de 80) :
     une case 2× plus large, 4× moins d'arbres pour le même couvert — et autant de triangles en moins. */
  const FE=2.1,cell=15*2/Math.sqrt(Math.min(1,MOB*1.25)),Rt=PAL_B9('foretRayon',1650),metaE={};for(const k of FOR_ESP_N)metaE[k]=PT.esp[k][0].m;
  const ES9=DZ&&FOR_ESS[DZ.ess],choix=(d,r)=>{if(ES9){for(const e of ES9[d<175?0:d<620?1:2])if(r<e[0])return e[1];return 'epicea';}if(d<175)return r<.30?'hetre':r<.52?'bouleau':r<.70?'chene':r<.82?'epicea':r<.92?'pin':'sapin';
    if(d<620)return r<.40?'epicea':r<.58?'sapin':r<.82?'hetre':r<.90?'pin':r<.95?'chene':'bouleau';
    return r<.48?'epicea':r<.68?'sapin':r<.94?'hetre':'pin';};
  let nArb=0;
  const nC=S.C*S.C/(cell*cell);
  for(let cj=0;cj<S.nz-1;cj++)for(let ci=0;ci<S.nx-1;ci++){if(!ci&&performance.now()>JF.lim)yield;if(S.d[ci+cj*S.nx]>Rt+S.C*1.5)continue;let nn=Math.floor(nC);if(fr()<nC-nn)nn++;
   for(let e9=0;e9<nn;e9++){
    const x=S.x0+(ci+fr())*S.C,z=S.z0+(cj+fr())*S.C,d=solBil(S.d,x,z);if(d>Rt)continue;
    const f=solBil(S.f,x,z)*(d>620?MOB*.7:MOB*.5+.5)*(d>1150?.55:1)*(DZ?DZ.dens:1);if(fr()>f)continue; // (le FLANC) au-delà de 1150 m, moins d'arbres mais plus hauts : la même masse de forêt
    const sp=choix(d,fr()),me=metaE[sp];let s=(.78+fr()*.5)*(d>1150?1.22:1)*FE,sxz=s*(.85+fr()*.3);
    if(d<ROAD_HALF+20)continue;
    if(nu(x,z,me.cr*sxz*.5))continue;
    const y=solH(x,z)-.4;
    {const yb9=solBil(S.yb,x,z);if(yb9<1e4){const lim=yb9-30;if(y+me.h*s>lim){s=(lim-y)/me.h;if(s<.6)continue;sxz=Math.min(sxz,s*1.15);}}} // (LA PELOTE) jamais dans l'air libre des étages : 30 m sous la route la plus BASSE à moins de 280 m
    const ry=fr()*6.2832,q=qDe(x,z);let tint=sp==='hetre'&&fr()<.04?2:(fr()*2-1)*.6;
    if(DZ){if(tint<1.5)tint=Math.max(-1,Math.min(1,tint+DZ.sais.dt));if(DZ.sais.or&&(sp==='hetre'||sp==='chene'||sp==='bouleau')&&dz2()<DZ.sais.or)tint=2;} /* (LE DÉCOR AU HASARD) LA SAISON */
    let spF=sp,sF=s,sxzF=sxz; // (2026-10-17) LES PLEUREURS : tirés de LEUR flux, le flux du décor ne voit rien
    if(PLEUR.on&&(sp==='hetre'||sp==='bouleau'||sp==='chene')&&fw()<(DZ?DZ.pleur[d<175?0:d<620?1:2]:d<175?.9:d<620?.75:.45)){const e9=fw()<.55?'saule':'pleureur',hF=metaE[e9].h;let k9=s*(e9==='saule'?1.3:1.25);
      const yb9=solBil(S.yb,x,z);if(yb9<1e4)k9=Math.min(k9,(yb9-30-y)/hF);if(k9>=.6){spF=e9;sF=k9;sxzF=k9*(sxz/s)*(e9==='pleureur'?1.08:1);}}
    const meF=metaE[spF];
    ESP[spF].push({q:q,m:mat(x,y,z,ry,sxzF,sF,sxzF),j:[fr(),tint,0,0]});
    {const fc=FC[spF],k9=tint>1.5?[1.35,1.12,.7]:[1+tint*.16,1+tint*.06,1-tint*.18],al=[fc[0]*k9[0]*.78,fc[1]*k9[1]*.78,fc[2]*k9[2]*.78],lo=FOR_LOIN[spF];
     if(fr()<.62){const g9=1.12; // au loin, 62 % des arbres, un peu plus gros : la même masse de forêt pour 40 % de triangles en moins
      if(lo)LOINF.push({q:q,m:mat(x,y+lo[0]*sF,z,ry,lo[1]*sxzF*g9,lo[1]*lo[2]*sF*g9,lo[1]*sxzF*g9),j:[fr(),al[0],al[1],al[2]]});
      else{const H9=sp==='epicea'?37:33,r9=sp==='epicea'?6.6:6;LOINC.push({q:q,m:mat(x,y+3*s,z,ry,r9*sxz*g9,(H9-2.5)*s,r9*sxz*g9),j:[fr(),al[0],al[1],al[2]]});}}}ext(q,x,y,y+meF.h*sF,z,meF.cr*sxzF);canTampon(x,z,meF.cr*sxzF,y+meF.h*sF-2.5);nArb++;}}
  FORET.n.arbres=nArb;
  if(performance.now()>JF.lim)yield;
  // les géants entrent dans les familles (même tri), et leurs collisions dans la liste
  const GES={};for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL))GES[k]=[];
  for(const g of GE){let sp=g.sp;if(PLEUR.on&&(sp==='chene'||sp==='hetre')&&fw()<.85)sp=fw()<.5?'gsaule':'gpleureur'; // (2026-10-17) LES PLEUREURS géants : même place, même échelle, leur flux à eux
    if((sp==='sequoia'||sp==='epicea'||sp==='chene'||sp==='hetre'))sp=fw()<.5?'gsaule':'gpleureur'; // (2026-10-17, Léo : « enlève tous les arbres qui ont des gros cylindres » → séquoias et épicéas géants) que des géants TORDUS et pleureurs
    if(FOR_PLEUR_VOL[sp]){ /* (2026-10-17 soir, LA PELOTE REVENUE) le pleureur prend la place d'un géant taillé pour SA couronne (un séquoia
       s'ouvre à 178, le rideau d'un saule tombe à 94) : une route d'un autre étage passait dans ses mèches. On le REHAUSSE jusqu'à ce que le bas des
       rideaux passe 16 m au-dessus de la plus haute route sous sa ramure (comme geantXZ) ; au-delà de ×1,45, l'autre pleureur ; sinon la clairière reste vide. */
      const pl=function(e){const P=FOR_PLEUR_VOL[e],rh=(P.r+8)*g.sxz+ROAD_HALF;let yH=-1e9;proches(g.x,g.z,rh,function(j){const q=pts[j];if(q.y>yH&&Math.hypot(q.x-g.x,q.z-g.z)<rh)yH=q.y;});
        return yH<-1e8?g.sy:Math.max(g.sy,(yH+16-g.y)/P.bas);};
      let e9=sp,k9=pl(sp);if(k9>g.sy*1.45){const o9=sp==='gsaule'?'gpleureur':'gsaule',k8=pl(o9);if(k8<k9){e9=o9;k9=k8;}}
      /* (2026-10-18, DEBUGGING : « des arbres qui traversent la route ? ») LE FÛT DU PLEUREUR HORS DE LA ROUTE. geantXZ a posé ce géant à la distance que demande le fût de SON essence
         (FOR_GEANT_RB : un épicéa 6,6, un hêtre 8,2) ; devenu saule ou hêtre pleureur (fût de 13-15,5, penché ou tordu de 4-6 unités), son tronc mordait le bord de la route
         (banc, 15 graines : 32 géants, jusqu'à 4 m dans la chaussée — on le traversait en roulant, on y mourait en sautant). Le fût et les branches réels (gélules du prototype
         à l'échelle, ×1,3 + 2 m : le bois visible, écorce comprise) sont testés contre la chaussée (toute sa largeur, sa tranche) : l'autre pleureur s'il passe, sinon la clairière reste vide. */
      const fut=function(e,k){const ca=Math.cos(g.ry),sa=Math.sin(g.ry),sx=g.sxz,W9=[];let hit=false;
        for(const cp of PT.geant[e][0].m.C){const ax=g.x+(cp[0]*ca+cp[2]*sa)*sx,ay=g.y+cp[1]*k,az=g.z+(-cp[0]*sa+cp[2]*ca)*sx,bx=g.x+(cp[3]*ca+cp[5]*sa)*sx-ax,by=g.y+cp[4]*k-ay,bz=g.z+(-cp[3]*sa+cp[5]*ca)*sx-az;
          W9.push([ax,ay,az,bx,by,bz,bx*bx+by*by+bz*bz,cp[6]*sx*1.3+2,bx*bx+bz*bz]);}
        proches(g.x,g.z,FOR_PLEUR_VOL[e].r*sx+ROAD_HALF+20,function(j){if(hit)return;const q=pts[j],b=B[j],dyb=ROAD_HALF*Math.abs(b.y);
          for(const w of W9){const r=w[7];let u=w[8]>0?((q.x-w[0])*w[3]+(q.z-w[2])*w[5])/w[8]:0;u=u<0?0:u>1?1:u;const hx=q.x-w[0]-w[3]*u,hz=q.z-w[2]-w[5]*u,rr=r+ROAD_HALF+2; /* (tri rapide : en plan, puis en hauteur) */
            if(hx*hx+hz*hz>rr*rr||q.y+dyb+3<Math.min(w[1],w[1]+w[4])-r||q.y-dyb-4>Math.max(w[1],w[1]+w[4])+r)continue;
            for(let l=-ROAD_HALF;l<=ROAD_HALF+.01;l+=7)for(const h of [-3,2]){const px=q.x+b.x*l,py=q.y+b.y*l+h,pz=q.z+b.z*l;let v=w[6]>0?((px-w[0])*w[3]+(py-w[1])*w[4]+(pz-w[2])*w[5])/w[6]:0;v=v<0?0:v>1?1:v;
              const dx=px-w[0]-w[3]*v,dy=py-w[1]-w[4]*v,dz=pz-w[2]-w[5]*v;if(dx*dx+dy*dy+dz*dz<r*r){hit=true;return;}}}});return hit;};
      if(k9<=g.sy*1.45&&k9<=5.6&&fut(e9,k9)){const o9=e9==='gsaule'?'gpleureur':'gsaule',k8=pl(o9);if(k8<=g.sy*1.45&&k8<=5.6&&!fut(o9,k8)){e9=o9;k9=k8;}else k9=1e9;} /* (le fût dans la route : l'autre pleureur, ou la clairière vide) */
      if(k9>g.sy*1.45||k9>5.6){g.vide=1;g.spV=sp;fr();fr();continue;} // (deux tirages : le décor qui suit ne bouge pas)
      sp=e9;g.sy=k9;g.top=Math.max(g.top,g.y+FOR_PLEUR_VOL[sp].h*k9);}
    g.spV=sp;const q=qDe(g.x,g.z),meta=PT.geant[sp][0].m;GES[sp].push({q:q,m:mat(g.x,g.y,g.z,g.ry,g.sxz,g.sy,g.sxz),j:[fr(),DZ?(DZ.sais.or&&dz2()<DZ.sais.or*.8?2:Math.max(-1,Math.min(1,(fr()*2-1)*.4+DZ.sais.dt))):(fr()*2-1)*.4,0,1]});
    ext(q,g.x,g.y,Math.max(g.top,g.y+meta.h*g.sy),g.z,Math.max(g.cr,meta.cr*g.sxz));colPose(meta,g.x,g.y,g.z,g.ry,g.sxz,g.sy);} // (pas de tampon de canopée : la case de 26 m déborderait sur la route — les gélules et sphères suffisent)
  // les rochers : une famille aussi
  const ROI=[];for(const r of RO){const q=qDe(r.x,r.z);ROI.push({q:q,m:mat(r.x,r.y,r.z,r.ry,r.sxz,r.sy,r.sxz),j:[fr(),0,0,0]});ext(q,r.x,r.y,r.top,r.z,20*r.sxz);canTampon(r.x,r.z,16*r.sxz,r.top-6);}
  /* (LE DÉCOR AU HASARD) LE CERCLE DE PIERRES : 7-11 menhirs (le rocher du loup à ~1/6) en anneau au cœur de sa clairière, un plus grand au milieu une fois sur deux */
  let nMen=0;for(const c of CLR){if(!c[4])continue;const n=7+((dz2()*5)|0),Rr=c[2]*(.5+dz2()*.15),a0=dz2()*6.283,pts9=[];for(let k=0;k<n;k++){const an=a0+k/n*6.2832;pts9.push([c[0]+Math.cos(an)*Rr,c[1]+Math.sin(an)*Rr,.13+dz2()*.06]);}
    if(dz2()<.5)pts9.push([c[0],c[1],.24]);
    for(const m of pts9){const x=m[0],z=m[1],sy=m[2],sxz=.22+sy*.6,y=solH(x,z)-1,q=qDe(x,z);ROI.push({q:q,m:mat(x,y,z,dz2()*6.283,sxz,sy,sxz),j:[dz2(),0,0,0]});ext(q,x,y,y+52*sy,z,20*sxz);COL.push({g:1,a:[x,y,z],b:[x,y+46*sy,z],r:9*sxz});nMen++;}}
  FORET.n.menhirs=nMen;
  if(performance.now()>JF.lim)yield;
  // ---- 6. LES AMANITES (des ronds de sorcières au fond), LES FLEURS DU BORD, LES PLANTES DU FOND, LE LIERRE ----
  const CHI=[];{const n0=2+((fr()*2)|0),n=DZ?DZ.ama.n:n0;for(let k=0;k<n;k++){const i=Math.round((.15+fr()*.7)*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1,lat=(DZ?DZ.ama.lat:55)+fr()*60,cx=pts[i].x+l9[0]*sd*lat,cz=pts[i].z+l9[1]*sd*lat,R9=9+fr()*6,nn=11+((fr()*5)|0);
    for(let j=0;j<nn;j++){const an=j/nn*6.283+fr()*.2,x=cx+Math.cos(an)*R9,z=cz+Math.sin(an)*R9,s=(1.1+fr()*1.2)*(DZ?DZ.ama.sc:1),y=solH(x,z)-.2,q=qDe(x,z);CHI.push({q:q,m:mat(x,y,z,fr()*6.28,s,s*(.9+fr()*.3),s),j:[fr(),0,0,0]});ext(q,x,y,y+5*s,z,3*s);}}}
  const FLE=[],LIE=[],TILE=[[0,.15],[1,.15],[2,.19],[3,.15],[4,.14],[5,.22]],tire=r=>{for(const t of TILE){r-=t[1];if(r<=0)return t[0];}return 5;};
  const Mb=new THREE.Matrix4(),Mr=new THREE.Matrix4(),vx=new THREE.Vector3(),vy=new THREE.Vector3(),vz=new THREE.Vector3(),Rq=new THREE.Quaternion();
  const pose=(p,up,side,spin,out)=>{vy.copy(up).normalize();vx.copy(side).addScaledVector(vy,-side.dot(vy)).normalize();vz.crossVectors(vx,vy);Mb.makeBasis(vx,vy,vz);Rq.setFromAxisAngle(vy,spin);
    Mb.premultiply(Mr.makeRotationFromQuaternion(Rq));Mb.setPosition(p);return Mb.toArray(out);};
  {const pf=Math.max(1,Math.round(PAL_B9('foretFleurs',1.1)/ds)),pl=Math.max(1,Math.round(3.2/ds));
   for(let i=Math.round(45/ds);i<NP-Math.round(30/ds);i+=pf)for(const sd of [-1,1]){if(sd<0&&performance.now()>JF.lim)yield;if(fr()<.2){fr();fr();fr();continue;}
     const p=pts[i],b=B[i],n=Nn[i],t=tire(fr()),h=(t===0?3.1:t===5?2.3:2.0)*(.85+fr()*.55),lat=sd*(ROAD_HALF-.9-fr()*1.4);
     V3.copy(p).addScaledVector(b,lat).addScaledVector(n,.03);const q=qDe(V3.x,V3.z);
     const m9=pose(V3,n,b,fr()*6.28,[]),j9=[t,h*.55,h,fr()];if(FORET_FLEURS_BORD){FLE.push({q:q,m:m9,j:j9});ext(q,V3.x,V3.y-1,V3.y+h,V3.z,2);}} /* (2026-10-15 soir, Sacha : « enlever les fleurs au bord de la route dans la forêt ») les tirages restent les mêmes (le reste de la forêt ne bouge pas), seule la pose saute */
   for(let i=Math.round(30/ds);i<NP-Math.round(20/ds);i+=pl)for(const sd of [-1,1]){if(fr()<.25)continue;const p=pts[i],b=B[i],n=Nn[i],lg=3+fr()*6;
     V3.copy(p).addScaledVector(b,sd*(ROAD_HALF+.15)).addScaledVector(n,-.2);const q=qDe(V3.x,V3.z);
     LIE.push({q:q,m:pose(V3,n,T[i],fr()*.6-.3,[]),j:[6,2.6+fr()*1.8,lg,fr()]});ext(q,V3.x,V3.y-lg-THICK,V3.y,V3.z,4);}
   for(const AR of FORET.arche)for(const l of AR.LI){ /* (2026-10-19) le lierre de CHAQUE arche (une ou deux : LA FORÊT AU HASARD) */V3.set(l[0],l[1],l[2]);const q=qDe(l[0],l[2]);LIE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),fr()*6.28,[]),j:[6,3.5+fr()*2,l[3],fr()]});ext(q,l[0],l[1]-l[3],l[1],l[2],4);}
   // les plantes du FOND (fougères géantes, digitales, jacinthes, et des fleurs dans les prairies) : on les voit d'en haut
   const pfF=Math.max(1,Math.round(PAL_B9('foretPlantes',4.2)/(DZ?DZ.fl.k:1)/ds));
   for(let i=0;i<NP;i+=pfF)for(let e=0;e<2;e++){if(!e&&performance.now()>JF.lim)yield;const l9=lat9(i),sd=fr()<.5?-1:1,lat=fr()*175,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,pr=solBil(S.pr,x,z);
     let t=pr>.3&&fr()<.7?[0,2,3,4,2][(fr()*5)|0]:fr()<.72?5:fr()<.55?0:fr()<.85?4:7;if(DZ&&DZ.fl.dom>=0&&pr>.3&&dz2()<.65)t=DZ.fl.dom;const h=(t===5?4.2:t===7?2.2:2.8)*(.75+fr()*.5),y=solH(x,z)-.3,q=qDe(x,z);
     V3.set(x,y,z);FLE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),fr()*6.28,[]),j:[t,h*.6,h,fr()]});ext(q,x,y,y+h,z,4);}}
  /* (LE DÉCOR AU HASARD) les CLAIRIÈRES en fleurs (la fleur tirée, ou le mélange), un rond d'amanites une fois sur deux */
  for(const c of CLR){const n=c[4]?18:Math.round(c[2]*c[2]/45);for(let k=0;k<n;k++){const a=dz2()*6.2832,r=Math.sqrt(dz2())*c[2]*.95,x=c[0]+Math.cos(a)*r,z=c[1]+Math.sin(a)*r,y=solH(x,z)-.3,q=qDe(x,z);
      if(c[4]&&r<c[2]*.4)continue;const t=DZ.fl.dom>=0&&dz2()<.7?DZ.fl.dom:[0,1,2,3,4][(dz2()*5)|0],h=(t===0?3.1:2.2)*(.8+dz2()*.6);V3.set(x,y,z);FLE.push({q:q,m:pose(V3,UP,vx.set(1,0,0),dz2()*6.28,[]),j:[t,h*.6,h,dz2()]});ext(q,x,y,y+h,z,4);}
    if(!c[4]&&dz2()<.5){const cx=c[0]+(dz2()-.5)*c[2],cz=c[1]+(dz2()-.5)*c[2],nn=9+((dz2()*5)|0),R9=6+dz2()*4;for(let j=0;j<nn;j++){const an=j/nn*6.283,x=cx+Math.cos(an)*R9,z=cz+Math.sin(an)*R9,s9=1.2+dz2()*1.2,y=solH(x,z)-.2,q=qDe(x,z);CHI.push({q:q,m:mat(x,y,z,dz2()*6.28,s9,s9,s9),j:[dz2(),0,0,0]});ext(q,x,y,y+5*s9,z,3*s9);}}}
  FORET.n.fleurs=FLE.length;FORET.n.lierre=LIE.length;FORET.n.clairieres=CLR.length;
  if(performance.now()>JF.lim)yield;
  // ---- 7. LES FAMILLES (prototype × détail) ----
  const BANDE=[[0,0],[1,1],[2,2]];
  const PRES=PAL_B9('foretPres',0); // palier ancien : le détail MOYEN de près aussi (une famille par essence au lieu de deux)
  for(const k of FOR_ESP_N){const lot=forLot(ESP[k]);if(PRES){const F=forFamille(root,PT.esp[k][1].g,M.arb,lot,0,1,'aI');if(F)F.nom=k+'1';}else for(let l=0;l<2;l++){const F=forFamille(root,PT.esp[k][l].g,M.arb,lot,BANDE[l][0],BANDE[l][1],'aI');if(F)F.nom=k+l;}}
  {const F1=forFamille(root,PT.boule.g,M.arb,forLot(LOINF),2,2,'aI'),F2=forFamille(root,PT.cone.g,M.arb,forLot(LOINC),2,2,'aI');if(F1)F1.nom='loin-feuillus';if(F2)F2.nom='loin-coniferes';}
  for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL)){const lot=forLot(GES[k]);if(PAL_B9('foretGeantFin',1)){const F1=forFamille(root,PT.geant[k][0].g,M.arb,lot,0,1,'aI'),F2=forFamille(root,PT.geant[k][1].g,M.arb,lot,2,2,'aI');if(F1)F1.nom='G'+k+'0';if(F2)F2.nom='G'+k+'1';}
    else{const F=forFamille(root,PT.geant[k][1].g,M.arb,lot,0,2,'aI');if(F)F.nom='G'+k+'1';}} // palier ancien : un seul détail pour les géants
  {const lot=forLot(ROI);const gR=FORET.geoRoc||(FORET.geoRoc=foretRocherGeo());const F=forFamille(root,gR,M.arb,lot,0,2,'aI');if(F)F.nom='rochers';}
  if(PAL_B9('foretChampi',1)){const lot=forLot(CHI);const gC=FORET.geoChi||(FORET.geoChi=foretChampiGeo());const F=forFamille(root,gC,M.arb,lot,0,1,'aI');if(F)F.nom='amanites';}
  {const gF=FORET.geoFl||(FORET.geoFl=forCroixGeo(false)),gL=FORET.geoLi||(FORET.geoLi=forCroixGeo(true));const F=forFamille(root,gF,M.fleur,forLot(FLE),0,1,'aF');if(F)F.nom='fleurs';
   if(PAL_B9('foretLierre',1)){const F2=forFamille(root,gL,M.fleur,forLot(LIE),0,1,'aF');if(F2)F2.nom='lierre';}}
  if(performance.now()>JF.lim)yield;
  // ---- 8. LES RAYONS, LA BRUME, LES YEUX (des tampons entiers, sans tri : peu d'exemplaires, peu de triangles) ----
  {const pr9=Math.max(1,Math.round(PAL_B9('foretRayons',28)/(DZ?DZ.ray:1)/ds)),R9=[],L9=[];
   for(let i=Math.round(80/ds);i<NP;i+=pr9){const l9=lat9(i),sd=fr()<.5?-1:1,lat=fr()*150,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
     R9.push(x,pts[i].y+55+fr()*70,z,5+fr()*12);L9.push(130+fr()*90,fr());}
   const g=new THREE.InstancedBufferGeometry();const pl=new THREE.PlaneGeometry(1,1);pl.translate(0,.5,0);g.index=pl.index;g.setAttribute('position',pl.attributes.position);
   g.setAttribute('aR',new THREE.InstancedBufferAttribute(new Float32Array(R9),4));g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(L9),2));g.instanceCount=R9.length/4;
   const m=new THREE.Mesh(g,M.ray);m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=6;m.userData.jeter=true;root.add(m);FORET.rayons=m;FORET.n.rayons=g.instanceCount;}
  {const pb=Math.max(1,Math.round(PAL_B9('foretBrume',42)/(DZ?DZ.brume.n:1)/ds)),Bm=[];
   for(let i=0;i<NP;i+=pb){const l9=lat9(i);for(let e=0;e<2;e++){const sd=fr()<.5?-1:1,haut=e===1&&fr()<.4,lat=haut?ROAD_HALF+10+fr()*60:fr()*210,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat,
     y=haut?pts[i].y+3+fr()*10:Math.max(solH(x,z)+12,pts[i].y-28-fr()*50),s=haut?40+fr()*40:70+fr()*90;Bm.push(mat(x,y,z,0,s,s,s));}}
   const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),M.brume,Bm.length);for(let k=0;k<Bm.length;k++)im.instanceMatrix.array.set(Bm[k],k*16);
   im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=4;im.geometry.userData=im.geometry.userData||{};im.userData.jeter=true;root.add(im);FORET.brume=im;}
  foretLanternes(root,M,GE,proches,mat,seed); /* (2026-10-20, embellir) les lanternes de conte (leur flux à elles) */
  {const Ey=[],EyL=[];const ne=Math.round(PAL_B9('foretYeux',90)*(DZ?DZ.yeux/90:1));for(let k=0;k<ne;k++){const i=Math.round((.06+fr()*.9)*(NP-1)),l9=lat9(i),sd=fr()<.5?-1:1,lat=45+fr()*200,x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
     const g9=solH(x,z),top=Math.max(g9+4,canH(x,z)-8),y=g9+3+fr()*Math.max(2,Math.min(16,top-g9)),sz=1+fr()*.7,c=fr()<.55?0:fr()<.6?1:2,w=fr(),dx=-l9[1],dz=l9[0];
     for(const e of [-1,1]){Ey.push(mat(x+dx*e*sz*1.1,y,z+dz*e*sz*1.1,0,1,1,1));EyL.push(1,c,sz,w);}}
   const g=new THREE.PlaneGeometry(1,1);g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(EyL),4));
   const im=new THREE.InstancedMesh(g,M.lueur,Ey.length);for(let k=0;k<Ey.length;k++)im.instanceMatrix.array.set(Ey[k],k*16);
   im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=7;im.userData.jeter=true;root.add(im);FORET.yeux=im;}
  // ---- les quartiers : leur boîte et leur sphère (le tri) ----
  FORET.quart=QL.map(function(b){return {c:new THREE.Vector3((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),r:Math.hypot(b[1]-b[0],b[3]-b[2],b[5]-b[4])/2+8,b:b};});
  // ---- les collisions en grille de 120 m ----
  {const CG=120,G=new Map();for(const c of COL){const xs=c.g?[c.a[0],c.b[0]]:[c.a[0]],zs=c.g?[c.a[2],c.b[2]]:[c.a[2]],r=c.r+2;
     const i0=Math.floor((Math.min.apply(null,xs)-r)/CG),i1=Math.floor((Math.max.apply(null,xs)+r)/CG),j0=Math.floor((Math.min.apply(null,zs)-r)/CG),j1=Math.floor((Math.max.apply(null,zs)+r)/CG);
     for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i+','+j;let a=G.get(k);if(!a)G.set(k,a=[]);a.push(c);}}
   FORET.gcol={CG:CG,G:G,n:COL.length};}
  for(const F of FORET.fam)F.im.name='forêt '+(F.nom||'?');if(FORET.rayons)FORET.rayons.name='forêt rayons';if(FORET.brume)FORET.brume.name='forêt brume';if(FORET.yeux)FORET.yeux.name='forêt yeux';
  FORET.n.geants=GE.length;FORET.n.rochers=RO.length;FORET.n.quartiers=QL.length;FORET.n.familles=FORET.fam.length;
  FORET.ms=Math.round(performance.now()-t0);FORET.msSol=Math.round(tS-t0);FORET.sig=0;FORET.yRaz=true; /* (2026-10-18, DEBUGGING : yRaz n'était jamais posé — foretTick le lit pour poser la BRUME DU FOND à la hauteur de la route neuve dès la 1re image ; sans lui elle partait de celle de la forêt d'avant et glissait ~2 s, comme BANQ.yRaz / VOLCAN.yRaz) */
  foretMeteo(FORET.met,started?bioPortDur():.01);
}
/* deux quads croisés (fleurs, fougères : y de 0 à 1) — ou qui PENDENT (lierre : y de 0 à −1) ; uv.y = 1 en haut de la case */
function forCroixGeo(pend){const P=[],U=[],I=[];let n=0;
  for(const r of [0,Math.PI/2]){const c=Math.cos(r),s=Math.sin(r);for(const v of [[-.5,0],[.5,0],[.5,1],[-.5,1]]){const y=pend?-v[1]:v[1];P.push(v[0]*c,y,v[0]*s);U.push(v[0]+.5,pend?1-v[1]:v[1]);}I.push(n,n+1,n+2,n,n+2,n+3);n+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);return g;}
/* ---------------- LE TRI PAR QUARTIERS (chaîné sur scene.onBeforeRender, la recette de jadeTri) ----------------
   À chaque rendu : chaque quartier reçoit une BANDE (0 de près · 1 à mi-distance · 2 au loin · −1 hors champ ou derrière la brume) ;
   une famille ne réécrit ses exemplaires que si SA liste de quartiers a changé, et n'envoie que la partie utile. */
const FT={fr:new THREE.Frustum(),pv:new THREE.Matrix4(),s:new THREE.Sphere(),vis:null,ms:0,n:0,up:0};
function foretTri(cam){
  if(!FORET.root||!FORET.quart||!FORET.fam.length)return;const t0=performance.now();
  FT.fr.setFromProjectionMatrix(FT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const f=scene.fog,ff=(f&&f.isFog)?f.far:6000,cp=cam.position,Qs=FORET.quart,S=FT.s,B0=FORET.b0||270,B1=FORET.b1||760;
  if(!FT.vis||FT.vis.length!==Qs.length)FT.vis=new Int8Array(Qs.length);
  let sig=7;
  for(let k=0;k<Qs.length;k++){const q=Qs[k];S.center.copy(q.c);S.radius=q.r;let v=-1;
    if(FT.fr.intersectsSphere(S)){const b=q.b,ex=Math.max(b[0]-cp.x,0,cp.x-b[1]),ey=Math.max(b[2]-cp.y,0,cp.y-b[3]),ez=Math.max(b[4]-cp.z,0,cp.z-b[5]),d=Math.sqrt(ex*ex+ey*ey+ez*ez);
      if(d<ff+60)v=d<B0?0:d<B1?1:2;}
    FT.vis[k]=v;if(v>=0)sig=(Math.imul(sig,31)+k*4+v+1)|0;}
  if(sig!==FORET.sig){FORET.sig=sig;FT.up++;
    for(const F of FORET.fam){const lot=F.lot,RK=lot.rK,RA=lot.rA,RB=lot.rB,nR=RK.length;let fs=7;
      for(let i=0;i<nR;i++){const v=FT.vis[RK[i]];if(v<F.b0||v>F.b1)continue;fs=(Math.imul(fs,31)+RK[i]+1)|0;}
      if(fs===F.sig)continue;F.sig=fs;
      let w=0;const A=F.im.instanceMatrix.array,J=F.aJ.array;
      for(let i=0;i<nR;i++){const v=FT.vis[RK[i]];if(v<F.b0||v>F.b1)continue;const r0=RA[i],r1=RB[i];A.set(lot.M.subarray(r0*16,r1*16),w*16);J.set(lot.J.subarray(r0*4,r1*4),w*4);w+=r1-r0;}
      F.im.count=w;F.im.visible=w>0&&!F.coupe;
      if(w){F.im.instanceMatrix.updateRange.offset=0;F.im.instanceMatrix.updateRange.count=w*16;F.im.instanceMatrix.needsUpdate=true;F.aJ.updateRange.offset=0;F.aJ.updateRange.count=w*4;F.aJ.needsUpdate=true;}}}
  FT.ms+=performance.now()-t0;FT.n++;
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{foretTri(cam);}catch(e){window.__foretErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* ---------------- LES MÉTÉOS : la forêt glisse d'un temps à l'autre au même fondu que le ciel ---------------- */
function foretMeteo(m,dur){const T9=FOR_MET[m]||FOR_MET.midi;FORET.met=FOR_MET[m]?m:'midi';
  if(!FORET.cur)FORET.cur=JSON.parse(JSON.stringify(T9));
  FORET.de=JSON.parse(JSON.stringify(FORET.cur));FORET.to=T9;FORET.k=0;FORET.dur=Math.max(.01,dur||1.2);}
function foretPas(dt){if(!FORET.cur||FORET.k>=1)return;FORET.k=Math.min(1,FORET.k+dt/FORET.dur);const e=FORET.k*FORET.k*(3-2*FORET.k),a=FORET.de,b=FORET.to,o=FORET.cur;
  for(const k in b){const v=b[k];if(typeof v==='number')o[k]=a[k]+(v-a[k])*e;else if(Array.isArray(v))for(let i=0;i<v.length;i++)o[k][i]=a[k][i]+(v[i]-a[k][i])*e;else o[k]=v;}}
/* ---------------- LES EFFETS QUI VIVENT AUTOUR DE LA CAISSE (bâtis une fois, cachés hors de la forêt) ---------------- */
function foretFx(){const fx=FORET.fx;if(fx.pap)return fx;const M=foretMats(),R=mulberry32(0xFA9);
  { // les PAPILLONS (et les chauves-souris)
    const nP=PAL_B9('foretPap',150),P=[],U=[],I=[];
    for(const sd of [1,-1]){const b=P.length/3;for(const v of [[0,-.5],[1,-.5],[1,.5],[0,.5]]){P.push(sd*v[0]*.999+sd*.001,0,v[1]);U.push(v[0],v[1]+.5);}I.push(b,b+1,b+2,b,b+2,b+3);}
    const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);
    const aR=new Float32Array(nP*4),aP=new Float32Array(nP*2);for(let k=0;k<nP;k++){aR[k*4]=R();aR[k*4+1]=R();aR[k*4+2]=R();aR[k*4+3]=R();aP[k*2]=(R()*4)|0;aP[k*2+1]=1.25+R()*1.15; /* des papillons de CONTE (2,5-4,8 m d'envergure) : à 65 m devant une caisse lancée, un vrai papillon ne fait pas un pixel */}
    g.setAttribute('aR',new THREE.InstancedBufferAttribute(aR,4));g.setAttribute('aP',new THREE.InstancedBufferAttribute(aP,2));g.instanceCount=nP;
    fx.pap=new THREE.Mesh(g,M.pap);fx.pap.name='forêt papillons';fx.pap.frustumCulled=false;fx.pap.matrixAutoUpdate=false;fx.pap.visible=false;scene.add(fx.pap);}
  { // les LUCIOLES et le POLLEN
    const nL=PAL_B9('foretLuc',900),g=new THREE.BufferGeometry(),aR=new Float32Array(nL*4);for(let k=0;k<nL*4;k++)aR[k]=R();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nL*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
    fx.luc=new THREE.Points(g,M.luc);fx.luc.name='forêt lucioles';fx.luc.frustumCulled=false;fx.luc.matrixAutoUpdate=false;fx.luc.visible=false;fx.luc.renderOrder=8;scene.add(fx.luc);}
  { // les FEUX FOLLETS
    const n=PAL_B9('foretFollets',14),g=new THREE.PlaneGeometry(1,1),aL=new Float32Array(n*4);for(let k=0;k<n;k++){aL[k*4]=0;aL[k*4+1]=R();aL[k*4+2]=2.4+R()*2.2;aL[k*4+3]=R();}
    g.setAttribute('aL',new THREE.InstancedBufferAttribute(aL,4));fx.fol=new THREE.InstancedMesh(g,M.lueur,n);fx.fol.name='forêt follets';fx.fol.frustumCulled=false;fx.fol.matrixAutoUpdate=false;fx.fol.visible=false;fx.fol.renderOrder=7;
    fx.folL=[];for(let k=0;k<n;k++)fx.folL.push({p:new THREE.Vector3(0,-1e5,0),v:new THREE.Vector3(),a:0,vie:0,ph:R()*6.28,fuit:false});scene.add(fx.fol);}
  // la LUNE, le LOUP-GAROU et son halo de lune
  fx.lune=new THREE.Sprite(M.lune);fx.lune.visible=false;fx.lune.renderOrder=-1;fx.lune.frustumCulled=false;scene.add(fx.lune);
  fx.halo=new THREE.Sprite(M.halo);fx.halo.visible=false;fx.halo.renderOrder=5;scene.add(fx.halo);
  fx.loup=new THREE.Sprite(M.loup);fx.loup.visible=false;fx.loup.renderOrder=6;fx.loup.center.set(.5,0);scene.add(fx.loup);
  FORET.loup={t:7,on:false,age:0,roc:null};
  return fx;}
const FOR_V=new THREE.Vector3(),FOR_V2=new THREE.Vector3(),FOR_M4=new THREE.Matrix4();
function foretFxCache(){const fx=FORET.fx;if(!fx.pap||!fx.on)return;fx.on=false;fx.pap.visible=fx.luc.visible=fx.fol.visible=fx.lune.visible=fx.halo.visible=fx.loup.visible=false;if(ABE.g)ABE.g.visible=false;
  if(FORET.amb){try{FORET.amb.stop(.8);}catch(e){}FORET.amb=null;}}
/* LA BOUCLE DE LA FORÊT (chaque image, après la caméra, juste avant le rendu) */
function foretTick(dt){
  const on=!!FORET.root&&!!LVL.cur&&LVL.cur.id==='foret'&&!PARK.on;
  if(!on){foretFxCache();return;}
  const fx=foretFx(),U=FOR_U,c=FORET.cur||(foretMeteo(FORET.met,.01),FORET.cur),M=FORET.mats;fx.on=true;
  const vit=!paused;foretPas(dt);if(vit)U.uTime.value+=dt;
  // LA LUMIÈRE DE LA FORÊT : l'azimut du soleil du ciel, la hauteur de la météo ; la nuit, la LUNE
  {const a=Math.atan2(SUN_DIR.x,SUN_DIR.z),el=c.el*Math.PI/180;FOR_V.set(Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el));
   U.uSunDir.value.copy(FOR_V).lerp(FOR_V2.copy(FOR_LUNE).setY(Math.max(.45,FOR_LUNE.y)).normalize(),c.lune).normalize();}
  U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize().negate();
  U.uCam.value.copy(camera.position);
  {const cg=carGroup;U.uCarP.value.copy(cg.position);U.uCarF.value.set(0,0,1).applyQuaternion(cg.quaternion);}
  U.uPhare.value=c.phare*(mode==='boom'||!carGroup.visible?0:1);U.uFlash.value=(LVL.cur&&LVL.cur.orage)?(CAMP_FLASH||0):0;U.uWet.value=LVL.pluie;
  U.uHante.value=c.hante;U.uMistK.value=c.mist*(FORET.dz?FORET.dz.brume.k:1);U.uMistC.value.setRGB(c.mC[0],c.mC[1],c.mC[2]);if(scene.fog)U.uMistC.value.lerp(scene.fog.color,.25);
  {const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1))));const y9=pts[i]?pts[i].y:0;U.uMistY.value+=(y9-U.uMistY.value)*Math.min(1,dt*2+(FORET.yRaz?1:0));FORET.yRaz=false;}
  U.uLant.value=(c.lant||0)*FOR_EMB.lant;U.uRayK.value=FOR_EMB.ray;U.uAir.value=FOR_EMB.air;if(c.vg)M.arb.uniforms.uVitG.value.setRGB(c.vg[0],c.vg[1],c.vg[2]); /* (2026-10-20, embellir) lanternes, rayons, perspective, vitrail */
  U.uLeafT.value.set(c.leaf[0],c.leaf[1],c.leaf[2]);if(FORET.dz){const l9=FORET.dz.sais.leaf;U.uLeafT.value.x*=l9[0];U.uLeafT.value.y*=l9[1];U.uLeafT.value.z*=l9[2];} /* (LE DÉCOR AU HASARD) LA SAISON */U.uRos.value=c.ros;U.uVent.value=c.vent;U.uRay.value=c.ray*(1-LVL.pluie);U.uPap.value=c.pap;U.uLuc.value=c.luc;U.uPol.value=c.pol;U.uLune.value=c.lune;
  U.uPx.value=renderer.getPixelRatio();M.arb.uniforms.uFen.value=Math.min(1,c.hante*1.1+(FORET.met==='soir'?.55:0));
  M.pap.uniforms.uBat.value=c.hante>.4?c.hante:0;
  // la boîte des papillons : 65 m devant la caisse ; celle des lucioles : plus loin, plus bas, dans la vallée
  {const f=U.uCarF.value,p=U.uCarP.value;U.uBoxC.value.set(p.x+f.x*65,p.y+3,p.z+f.z*65);}
  fx.pap.visible=(c.pap>.01||c.hante>.4)&&!(PAL_B9('papillons',1)<.5);
  fx.luc.visible=c.luc>.01||c.pol>.01;if(fx.luc.visible){const f=U.uCarF.value,p=U.uCarP.value;M.luc.uniforms.uBoxL.value.set(p.x+f.x*90,p.y-18,p.z+f.z*90);}
  foretAbeilles(dt,c);
  if(FORET.solM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of FORET.solM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+40;if(m.visible!==v)m.visible=v;}}
  if(FORET.rayons)FORET.rayons.visible=U.uRay.value>.01;if(FORET.brume)FORET.brume.visible=c.mist>.01;if(FORET.yeux)FORET.yeux.visible=c.hante>.02;if(FORET.lant)FORET.lant.visible=U.uLant.value>.01;
  foretFollets(dt,c,fx);foretLuneTick(c,fx);foretLoupTick(dt,c,fx);
  if(vit)foretSons(dt,c);
}
/* (2026-10-17, Léo : « dans la forêt noire, le matin et la journée, qu'on croise deux-trois ABEILLES ») LES ABEILLES : trois petites abeilles EN
   CUBES (comme les arbres) — tête noire, corselet roux, abdomen rayé jaune et noir, dard, deux ailes de verre qui battent — qui naissent devant,
   à 70-150 m, sur un côté de la route, à 1,5-4 m de haut, et la TRAVERSENT en butinant (elles ondulent, montent, descendent), puis reviennent
   plus loin. Le matin et à midi, jamais sous la pluie. Le programme des arbres (M.arb, maillage simple : déjà compilé au menu) ; 9 petits
   maillages. Frôlée : `sfx('foret.abeille')` (le bourdonnement — à cuire par la session SON). */
const ABE={g:null,L:[]};
/* (2026-10-18, débogage NaN) ABEBOITE : la boîte des ABEILLES, par son centre et sa taille. Elle s'appelait fbBoite, comme celle de la CHAUMIÈRE (par ses coins) : deux déclarations du même nom dans la même portée, la DERNIÈRE gagne en silence — depuis le 17/10 la chaumière appelait celle-ci, ses murs sortaient en NaN (THREE : « Computed radius is NaN ») et il n'en restait que le toit. */
function abeBoite(K,c,sz,col,part){const h=[sz[0]/2,sz[1]/2,sz[2]/2];
  for(let a=0;a<3;a++)for(const sg of [-1,1]){const n=[0,0,0];n[a]=sg;const u=(a+1)%3,v=(a+2)%3,V9=[];
    for(const q of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[c[0],c[1],c[2]];p[a]+=sg*h[a];p[u]+=q[0]*h[u];p[v]+=q[1]*h[v];V9.push(fbV(K,p[0],p[1],p[2],n[0],n[1],n[2],[part,.9,0,0],col,[5,0]));}
    if(sg>0)K.I.push(V9[0],V9[1],V9[2],V9[0],V9[2],V9[3]);else K.I.push(V9[0],V9[2],V9[1],V9[0],V9[3],V9[2]);}}
function foretAbeilles(dt,c){
  const veut=(FORET.met==='matin'||FORET.met==='midi')&&!(LVL.pluie>.05)&&FORET.pel!==undefined;
  if(!veut){if(ABE.g)ABE.g.visible=false;return;}
  if(!ABE.g){const M=FORET.mats,K=fbNew(),W=fbNew(),noir=[.05,.045,.04],jaune=[.95,.72,.07];
    abeBoite(K,[0,0,.44],[.34,.32,.3],noir,3);abeBoite(K,[0,0,.14],[.42,.4,.36],[.42,.25,.06],3);
    abeBoite(K,[0,-.01,-.16],[.46,.42,.24],jaune,3);abeBoite(K,[0,-.02,-.38],[.44,.4,.22],noir,3);abeBoite(K,[0,-.03,-.58],[.36,.32,.2],jaune,3);abeBoite(K,[0,-.04,-.74],[.14,.14,.14],noir,3);
    abeBoite(K,[.13,.06,.56],[.1,.1,.06],[.02,.02,.02],3);abeBoite(K,[-.13,.06,.56],[.1,.1,.06],[.02,.02,.02],3); // les yeux
    abeBoite(W,[.3,0,0],[.6,.025,.3],[.86,.92,1.],3);const W2=fbNew();abeBoite(W2,[-.3,0,0],[.6,.025,.3],[.86,.92,1.],3); // (l'aile gauche bâtie en miroir : une échelle négative retournerait ses faces)
    const gC=fbGeo(K),gW=fbGeo(W),gW2=fbGeo(W2);ABE.g=new THREE.Group();ABE.g.name='forêt abeilles';scene.add(ABE.g);
    for(let k=0;k<3;k++){const b=new THREE.Group(),co=new THREE.Mesh(gC,M.arb),a1=new THREE.Mesh(gW,M.arb),a2=new THREE.Mesh(gW2,M.arb);
      a1.position.set(.12,.2,.14);a2.position.set(-.12,.2,.14);b.add(co,a1,a2);b.scale.setScalar(1.6);b.visible=false;ABE.g.add(b);
      ABE.L.push({b:b,a1:a1,a2:a2,on:false,att:1.5+k*3.2,p:new THREE.Vector3(),v:new THREE.Vector3(),o:new THREE.Vector3(),t:0,ph:k*2.1,fr:false});}}
  ABE.g.visible=true;
  if(paused)return;
  const ds=L/Math.max(1,NP-1),iC=Math.round(s/ds),cp=carGroup.position;
  for(const e of ABE.L){
    if(!e.on){e.att-=dt;if(e.att>0)continue;
      const i=Math.min(NP-2,iC+Math.round((70+Math.random()*80)/ds));if(i>=NP-2){e.att=2;continue;}
      const t=T[i],hl=Math.hypot(t.x,t.z)||1,lx=-t.z/hl,lz=t.x/hl,sd=Math.random()<.5?-1:1,off=ROAD_HALF*(.4+Math.random()*.5)+4,sp=3.2+Math.random()*2;
      e.o.set(pts[i].x+lx*sd*off,pts[i].y+1.5+Math.random()*2.5,pts[i].z+lz*sd*off);e.v.set(-lx*sd*sp,0,-lz*sd*sp).addScaledVector(t,(Math.random()-.5)*1.5);
      e.t=0;e.on=true;e.fr=false;e.dur=(2*off)/sp+1.5;e.b.visible=true;}
    e.t+=dt;const w=e.t;
    e.p.copy(e.o).addScaledVector(e.v,w);e.p.y+=Math.sin(w*2.6+e.ph)*.45+Math.sin(w*7.1+e.ph)*.12;
    e.p.x+=Math.sin(w*1.7+e.ph*1.3)*.7;e.p.z+=Math.cos(w*1.9+e.ph)*.7;
    e.b.position.copy(e.p);FOR_V.copy(e.p).add(e.v);FOR_V.y=e.p.y;e.b.lookAt(FOR_V);e.b.rotateZ(Math.sin(w*3.+e.ph)*.25);
    const f=Math.sin(w*170.)*.75;e.a1.rotation.z=f;e.a2.rotation.z=-f;
    const d=e.p.distanceTo(cp);if(!e.fr&&d<10){e.fr=true;typeof sfx==='function'&&sfx('foret.abeille');}
    const der=(e.p.x-cp.x)*carFwdX()+(e.p.z-cp.z)*carFwdZ();
    if(e.t>e.dur||der<-25){e.on=false;e.b.visible=false;e.att=3+Math.random()*7;}}}
window.dbgAbeilles=function(k,d){ // (banc) () relance les trois abeilles tout de suite · ('vue',d) : en pause, l'objectif à d m de la 1re abeille en vol, UNE image
  if(k==='vue'){const e=ABE.L.find(function(x){return x.on;});if(!e)return 'aucune en vol';if(started&&!gameOver&&!paused)togglePause();
    const p=e.b.position;camera.position.set(p.x+(d||3.2)*.8,p.y+(d||3.2)*.35,p.z+(d||3.2)*.6);camera.lookAt(p);camera.updateMatrixWorld();
    if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return [Math.round(p.x),Math.round(p.y),Math.round(p.z)];}
  for(const e of ABE.L){e.att=0;e.on=false;}return ABE.L.map(function(e){return [e.on,+e.att.toFixed(1)];});};
function carFwdX(){return FOR_U.uCarF.value.x;}function carFwdZ(){return FOR_U.uCarF.value.z;}
/* LES FEUX FOLLETS : ils naissent devant, sur les côtés de la route, flottent, et FUIENT quand la caisse arrive */
function foretFollets(dt,c,fx){
  const on=c.hante>.05&&started&&!gameOver;fx.fol.visible=on;if(!on)return;
  const A=fx.fol.instanceMatrix.array,p0=FOR_U.uCarP.value,f=FOR_U.uCarF.value,t=FOR_U.uTime.value;
  for(let k=0;k<fx.folL.length;k++){const o=fx.folL[k];
    if(o.vie<=0){const s9=Math.min(L-20,s+130+Math.random()*320),i=Math.round(s9/L*(NP-1)),tt=T[i],hl=Math.hypot(tt.x,tt.z)||1,sd=Math.random()<.5?-1:1,lat=ROAD_HALF+6+Math.random()*70;
      o.p.set(pts[i].x-tt.z/hl*sd*lat,pts[i].y-14+Math.random()*24,pts[i].z+tt.x/hl*sd*lat);o.v.set(0,0,0);o.vie=14+Math.random()*10;o.a=0;o.fuit=false;}
    o.vie-=dt;FOR_V.subVectors(o.p,p0);const d=FOR_V.length();
    if(d<48&&!o.fuit){o.fuit=true;o.v.copy(FOR_V).setY(Math.abs(FOR_V.y)+8).normalize().multiplyScalar(26);}
    if(FOR_V.dot(f)<-40)o.vie=0;
    o.p.x+=(o.v.x+Math.sin(t*.7+o.ph)*2.2)*dt;o.p.y+=(o.v.y+Math.sin(t*1.3+o.ph*2)*1.1)*dt;o.p.z+=(o.v.z+Math.cos(t*.6+o.ph)*2.2)*dt;
    o.a=o.fuit?Math.max(0,o.a-dt*.9):Math.min(1,o.a+dt*.6);if(o.fuit&&o.a<=0)o.vie=0;
    const sc=Math.max(.001,o.a);FOR_M4.makeScale(sc,sc,sc).setPosition(o.p);FOR_M4.toArray(A,k*16);}
  fx.fol.instanceMatrix.needsUpdate=true;}
/* LA LUNE : un disque énorme et pâle, là où le ciel la pose (FOR_LUNE), au-dessus des arbres */
function foretLuneTick(c,fx){const op=c.lune*(1-LVL.pluie)*(1-(LVL.cur&&LVL.cur.orage?1:0));fx.lune.visible=op>.01;if(!fx.lune.visible)return;
  fx.lune.position.copy(camera.position).addScaledVector(FOR_LUNE,5200);fx.lune.scale.setScalar(5200*.30);fx.lune.material.opacity=op;}
/* LE LOUP-GAROU : toutes les 26-48 s la nuit (et sous l'orage), sur le prochain ROCHER devant (entre 260 et 900 m), il se dresse en ombre
   chinoise devant un halo de lune, HURLE (le son vient de son côté), puis s'efface dans les arbres. */
function foretLoupTick(dt,c,fx){const W=FORET.loup;if(!W)return;
  if(c.hante<.45||!started||gameOver){if(W.on){W.on=false;}fx.loup.visible=fx.halo.visible=false;return;}
  if(!paused)W.t-=dt;
  if(W.t<=0&&!W.on){W.t=26+Math.random()*22;let r=null;for(const q of FORET.rocs){const sq=q.i/(NP-1)*L-s;if(sq>260&&sq<900){r=q;break;}}
    if(r){W.on=true;W.age=0;W.roc=r;}foretLoupCri(r);}
  if(!W.on){fx.loup.visible=fx.halo.visible=false;return;}
  if(!paused)W.age+=dt;const a=THREE.MathUtils.smoothstep(W.age,0,.7)*(1-THREE.MathUtils.smoothstep(W.age,6.2,7.4));if(W.age>7.4){W.on=false;}
  const r=W.roc,top=r.top-2;fx.loup.visible=fx.halo.visible=a>.01;
  fx.loup.position.set(r.x,top,r.z);fx.loup.scale.set(15*Math.max(1,r.sxz*.8),30*Math.max(1,r.sxz*.8),1);fx.loup.material.opacity=a;
  FOR_V.subVectors(fx.loup.position,camera.position).normalize();fx.halo.position.set(r.x,top+16,r.z).addScaledVector(FOR_V,14);fx.halo.scale.setScalar(95);fx.halo.material.opacity=a*.55*(1-LVL.pluie*.6);
  fx.loup.position.y+=Math.sin(W.age*1.7)*.3;}
function foretLoupCri(r){ // le hurlement : du côté du rocher (ou d'un côté au hasard s'il n'y en a pas devant)
  let pan=Math.random()*1.4-.7,vol=-6;
  if(r){FOR_V.set(r.x,r.top,r.z).sub(camera.position);const d=FOR_V.length();FOR_V2.set(1,0,0).applyQuaternion(camera.quaternion);pan=Math.max(-.9,Math.min(.9,FOR_V.normalize().dot(FOR_V2)*1.2));vol=-3-Math.min(9,d/120);}
  try{if(typeof sfx==='function')sfx('foret.loup',{vol:vol,pan:pan});}catch(e){}}
/* LES VOIX DE LA FORÊT : des cris épars selon l'heure (jamais une nappe de souffle par-dessus la musique : voir NUAGES_AMB) */
const FOR_SONS={jour:[['foret.oiseau',1.8,4.8,-15],['foret.pic',16,30,-17]],soir:[['foret.oiseau',3.5,8,-18],['foret.chouette',16,28,-16]],
  nuit:[['foret.chouette',9,17,-13],['foret.corbeau',13,26,-16],['foret.craque',8,16,-15]],pluie:[['foret.corbeau',18,32,-18],['foret.oiseau',9,18,-21]],orage:[['foret.corbeau',10,22,-15],['foret.craque',9,18,-15]]};
function foretSons(dt,c){
  const ok=SONV2&&started&&running&&!gameOver&&!garageOn&&mode!=='boom',L9=FOR_SONS[c.sons]||FOR_SONS.jour,T9=FORET.son;
  if(!ok){if(FORET.amb){try{FORET.amb.stop(.6);}catch(e){}FORET.amb=null;}return;}
  T9.k=T9.k||{};for(const e of L9){if(T9.k[e[0]]==null)T9.k[e[0]]=e[1]*Math.random();T9.k[e[0]]-=dt;if(T9.k[e[0]]<=0){T9.k[e[0]]=e[1]+Math.random()*(e[2]-e[1]);try{sfx(e[0],{vol:e[3],pan:Math.random()*1.6-.8});}catch(x){}}}
  const amb=c.hante>.5?'foret.nuitAmb':'foret.jourAmb';
  if(FORET.amb&&FORET.ambId!==amb){try{FORET.amb.stop(1.2);}catch(e){}FORET.amb=null;}
  if(!FORET.amb&&performance.now()>(FORET.ambT||0)){FORET.ambT=performance.now()+900;try{FORET.amb=sfx(amb,{loop:true,vol:-24});FORET.ambId=amb;}catch(e){FORET.amb=null;}}}
/* ---------------- EN VOL : CE QUI TUE ---------------- */
function foretHeurt(p){
  if(!FORET.root||!FORET.sol)return '';const G=FORET.gcol;
  if(G){const a=G.G.get(Math.floor(p.x/G.CG)+','+Math.floor(p.z/G.CG));
    if(a)for(let j=0;j<a.length;j++){const c=a[j];
      if(c.g){const ax=c.a[0],ay=c.a[1],az=c.a[2],bx=c.b[0]-ax,by=c.b[1]-ay,bz=c.b[2]-az,l2=bx*bx+by*by+bz*bz;let u=l2>0?((p.x-ax)*bx+(p.y-ay)*by+(p.z-az)*bz)/l2:0;u=Math.max(0,Math.min(1,u));
        const dx=p.x-ax-bx*u,dy=p.y-ay-by*u,dz=p.z-az-bz*u;if(dx*dx+dy*dy+dz*dz<(c.r+1.2)*(c.r+1.2))return 'arbre';}
      else{const dx=p.x-c.a[0],dy=p.y-c.a[1],dz=p.z-c.a[2];if(dx*dx+dy*dy+dz*dz<c.r*c.r)return 'arbre';}}}
  const S=FORET.sol;if(p.x<S.x0||p.z<S.z0||p.x>S.x0+S.nx*S.C||p.z>S.z0+S.nz*S.C)return '';
  if(p.y<solH(p.x,p.z)+1.2)return 'sousbois';
  if(p.y<canH(p.x,p.z))return 'arbre';
  return '';}
/* ---------------- LA CHAUFFE AU MENU : chaque matière compilée et dessinée une fois hors écran (0 programme en course) ---------------- */
function foretChauffe(){
  const M=foretMats(),PT=foretProtos(),fx=foretFx(),L9=[];
  const pr=PT.esp.hetre[1].g,g1=new THREE.BufferGeometry();for(const k in pr.attributes)g1.setAttribute(k,pr.attributes[k]);g1.setIndex(pr.index);g1.setAttribute('aI',new THREE.InstancedBufferAttribute(new Float32Array(4),4));
  const i1=new THREE.InstancedMesh(g1,M.arb,1);i1.setMatrixAt(0,new THREE.Matrix4());L9.push(i1);L9.push(new THREE.Mesh(pr,M.arb));
  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));g.setAttribute('aS',new THREE.Float32BufferAttribute(new Float32Array(12),4));L9.push(new THREE.Mesh(g,M.sol));
   const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g2.setAttribute('aU',new THREE.Float32BufferAttribute(new Float32Array(6),2));L9.push(new THREE.Mesh(g2,M.eau));}
  {const g=forCroixGeo(false).clone();g.setAttribute('aF',new THREE.InstancedBufferAttribute(new Float32Array([5,1,1,0]),4));const im=new THREE.InstancedMesh(g,M.fleur,1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);}
  {const g=new THREE.InstancedBufferGeometry();const pl=new THREE.PlaneGeometry(1,1);g.index=pl.index;g.setAttribute('position',pl.attributes.position);g.setAttribute('aR',new THREE.InstancedBufferAttribute(new Float32Array(4),4));g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(2),2));g.instanceCount=1;L9.push(new THREE.Mesh(g,M.ray));}
  {const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),M.brume,1);im.setMatrixAt(0,new THREE.Matrix4());L9.push(im);}
  for(const o of L9)o.frustumCulled=false;
  const vus=[[fx.pap,fx.pap.visible],[fx.luc,fx.luc.visible],[fx.fol,fx.fol.visible],[fx.lune,fx.lune.visible],[fx.halo,fx.halo.visible],[fx.loup,fx.loup.visible]];
  for(const v of vus)v[0].visible=true;
  const g=new THREE.Group();for(const o of L9)g.add(o);scene.add(g);
  try{chauffeRendu([g,fx.pap,fx.luc,fx.fol,fx.lune,fx.halo,fx.loup]);}finally{scene.remove(g);for(const v of vus)v[0].visible=v[1];}
  for(const t of [M.fleur.uniforms.uTex.value,M.pap.uniforms.uTex.value,M.lune.map,M.loup.map])try{renderer.initTexture(t);}catch(e){}
}
/* ---------------- LA CONSOLE ---------------- */
window.dbgForet=function(k,o){
  if(k==='meteo'){foretMeteo(o||'nuit',.01);return FORET.met;}
  if(k==='regle'){if(!FORET.root)return null;const ds=L/(NP-1),st=Math.max(1,Math.round(4/ds)),V9=new THREE.Vector3();let n=0,t=0;const ex=[]; /* (2026-10-20, banc) LA RÈGLE D'OR : rien du décor sur la route — la caisse posée tous les 4 m, à 5 places de la largeur, à 1,5 et 4 m */
    for(let i=Math.round(30/ds);i<NP-Math.round(30/ds);i+=st)for(const f of [-.95,-.5,0,.5,.95])for(const h of [1.5,4]){V9.copy(pts[i]).addScaledVector(B[i],f*ROAD_HALF).addScaledVector(Nn[i],h);t++;const r=foretHeurt(V9);if(r){n++;if(ex.length<6)ex.push([Math.round(i*ds),f,h,r]);}}
    return {essais:t,heurts:n,ex:ex};}
  if(k==='heurt'&&o){FOR_V2.set(o[0],o[1],o[2]);return FORET.root?foretHeurt(FOR_V2):'';} // (la PELOTE, banc des sauts) ce point de l'air tue-t-il ?
  if(k==='loup'){if(FORET.loup)FORET.loup.t=0;return FORET.rocs.length+' rochers';}
  if(k==='rideaux'){const R={n:0,dedans:0,pire:0,ex:[]},ds=L/(NP-1); // (banc, la pelote sous les pleureurs) une route passe-t-elle DANS la couronne d'un géant pleureur (du bas des rideaux à la cime) ?
    for(const g of FORET.geants){const P=FOR_PLEUR_VOL[g.spV];if(g.vide)R.vides=(R.vides||0)+1;if(!P||g.vide)continue;R.n++;const rh=(P.r+8)*g.sxz+ROAD_HALF,y0=g.y+P.bas*g.sy-4,y1=g.y+P.h*g.sy;let pi=0;
      for(let i=0;i<NP;i+=2){const q=pts[i];if(q.y<y0||q.y>y1)continue;if(Math.hypot(q.x-g.x,q.z-g.z)<rh)pi=Math.max(pi,q.y-y0);}
      if(pi>0){R.dedans++;R.pire=Math.max(R.pire,Math.round(pi));if(R.ex.length<6)R.ex.push([g.sp,g.spV,+g.sy.toFixed(2),Math.round(pi),Math.round(g.i*ds)]);}}
    return R;}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);foretTick(0);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'geant' = le prochain géant devant (o.d m avant lui, o.h m de haut) · 'loup' = le rocher du loup, le loup dressé · 'arche' */
  if(k==='geant'||k==='rocher'||k==='arche'){const ds=L/(NP-1),d=(o&&o.d)||70,h=(o&&o.h)||7;let i=-1,cible=null;
    if(k==='geant'){for(const g of FORET.geants)if(g.i*ds>s+60){i=g.i;cible=[g.x,pts[g.i].y+(o&&o.y!=null?o.y:28),g.z];break;}}
    else if(k==='rocher'){for(const r of FORET.rocs)if(r.i*ds>s+60){i=r.i;cible=[r.x,r.top+10,r.z];if(FORET.loup){FORET.loup.on=true;FORET.loup.age=2;FORET.loup.roc=r;}break;}}
    else if(FORET.arche.length){const c=FORET.arche[0].c;let bd=1e18;for(let j=0;j<NP;j+=4){const q=pts[j].distanceToSquared(c);if(q<bd){bd=q;i=j;}}cible=[c.x,c.y-12,c.z];}
    if(i<0)return 'rien devant';const j=Math.max(0,i-Math.round(d/ds)),p=pts[j];foretTick(0);
    return window.dbgForet('vue',{p:[p.x,p.y+h,p.z],c:cible,fov:o&&o.fov});}
  if(k==='toiles'){foretMats();const o9={};for(const n of ['fl','ai','lu','lg']){const t=FORET.tex[n],im=t&&t.image;o9[n]=im&&im.width?im.toDataURL('image/png'):null;}return o9;}
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='coupe'){for(const F of FORET.fam)F.coupe=!!o;FORET.sig=0;return 'familles '+(o?'coupées':'rendues');}
  if(k==='flanc'){if(!FORET.sol)return null;const st=Math.max(1,Math.round(20/(L/(NP-1)))),P9=[];let pire=1e9,ou=0,n20=0; // (le FLANC) le tracé échantillonné + la marge route/sol (la route n'est jamais sous le versant)
    for(let i=0;i<NP;i+=st){const p=pts[i],t=T[i],m=p.y-solH(p.x,p.z);if(m<pire){pire=m;ou=i;}if(m<20)n20++;P9.push([+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1),+t.x.toFixed(3),+t.z.toFixed(3)]);}
    return {amont:FORET.amont,L:Math.round(L),pts:P9,marge:{min:Math.round(pire),s:Math.round(ou*L/(NP-1)),sous20:n20},n:FORET.n,ms:FORET.ms,msSol:FORET.msSol};}
  const tri=FORET.fam.reduce(function(a,F){return a+F.tri*F.im.count;},0),parFam={};for(const F of FORET.fam)if(F.im.count)parFam[F.nom||'?']=[F.im.count,Math.round(F.tri*F.im.count/1000)+'k'];
  return {on:!!FORET.root,deco:FORET.deco||null,mods:FORET.pel&&FORET.pel.mk||null,met:FORET.met,ms:FORET.ms,msSol:FORET.msSol,protos:FORET.protos&&FORET.protos.ms,n:FORET.n,pel:FORET.pel,axe:FORET.axe!=null?Math.round(FORET.axe*57.3):null,plan:FORET.plan||null,noeuds:(FORET.noeuds||[]).map(function(o){return [Math.round(o.c[0]),Math.round(o.c[1]),o.t];}),tri:Math.round(tri),fam:FORET.fam.filter(function(F){return F.im.visible;}).length,
    tri9:{ms:FT.n?+(FT.ms/FT.n).toFixed(3):0,maj:FT.up},cur:FORET.cur&&{hante:+FORET.cur.hante.toFixed(2),pap:+FORET.cur.pap.toFixed(2),ray:+FORET.cur.ray.toFixed(2)},
    loup:FORET.loup&&{t:+FORET.loup.t.toFixed(1),on:FORET.loup.on},geants:FORET.geants.length,col:FORET.gcol&&FORET.gcol.n,parFam:parFam};};
function PAL_B9(k,d){try{return (typeof PAL!=='undefined'&&PAL&&typeof PAL.b==='function')?PAL.b(k,d):d;}catch(e){return d;}} // les paliers d'optimisation (PAL), s'ils existent

/* <<<FIN FORET>>> */
/* ===== LA FORÊT EMBELLIE (2026-10-20, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures, améliorer les lumières — sans que ce soit trop gourmand pour le téléphone, avec de la cohérence ») =====
   Une passe d'aspect, rien d'autre : la route, la physique, les arbres et leurs collisions, le tirage du décor ne bougent pas d'un bit (tout ce qui est
   neuf tire dans un flux à lui, `mulberry32(graine ^ 0x1A27E4)`, jamais dans `fr`, `fw`, `dr`, `dz2` ni dans le `rnd` de la piste). Accent de la map : l'AMBRE #FFC477,
   avec l'OR et le ROSE néon de la marque, rares. Les cinq piliers de la bible, ici :
   · LUMIÈRE-VEDETTE : les RAIS de soleil à deux températures (cœur ambre, lisière bleutée, gain ×1,5) ; la brume en nappes qui s'allume au contre-jour (ambre, violet-lune
     la nuit) et se refroidit à l'opposé — même programme, des nombres dans les shaders (`FOR_RAY_FS`, `FOR_BRUME_*`) ;
   · MATIÈRE : la NUIT redevient bleue — la lueur des joints de vitrail (`uVitG`, une couleur par météo : `FOR_MET.*.vg`) était un or fixe qui jaunissait les fûts sous la lune
     (le « lime » du ciel indigo) ; elle tire vers le bleu-lune la nuit, le violet à l'orage, l'or le jour ; le feuillage à contre-jour devient or plutôt que vert acide ;
   · TROIS PLANS : la perspective atmosphérique (`uAir`) — le proche un peu plus chaud, le lointain plus clair et plus froid (le shader des arbres) ;
   · DÉTAIL VIVANT : les lucioles sont ambre, un peu or, de rares roses (elles étaient vert-jaune acide) ;
   · ÉLÉMENTS + ÉCLAT CASH : les LANTERNES DE CONTE (`foretLanternes`) — des lueurs ambre (quelques-unes or, de rares roses néon) accrochées aux troncs des géants,
     au bord de la route, du soir à la nuit et sous la pluie : UN seul appel de dessin (un InstancedMesh de quads additifs, le programme des feux follets et des yeux, type 2),
     0 triangle de plus qui compte, aucune texture ; les amanites luisent rose une fois sur cinq.
   Budget : un appel de dessin de plus (les lanternes), ≈ 180 triangles, 0 programme, 0 octet de texture. `FOR_EMB` : les réglages (gain des lanternes, des rais, de la perspective). */
const FOR_EMB={lant:1,ray:1.5,air:1}; /* (banc) FOR_EMB.lant = 0 : sans lanternes · .ray = 1 : le gain des rais d'avant · .air = 0 : sans perspective atmosphérique */
function foretLanternes(root,M,GE,proches,mat,seed){
  const n=Math.round(PAL_B9('foretLant',90));if(!(n>0)||!GE||!GE.length||!FORET.protos)return;
  const ev=mulberry32((seed^0x1A27E4)>>>0),ord=[],X=[],AL=[],P=[];
  for(let k=0;k<GE.length;k++)ord.push(k);
  for(let k=ord.length-1;k>0;k--){const j=(ev()*(k+1))|0,a=ord[k];ord[k]=ord[j];ord[j]=a;}
  for(const k of ord){if(P.length>=n)break;const g=GE[k];if(g.vide||!g.spV||g.i==null)continue;
    const meta=FORET.protos.geant[g.spV]&&FORET.protos.geant[g.spV][0].m;if(!meta||!meta.C)continue;
    const q=pts[g.i],dx=q.x-g.x,dz=q.z-g.z,dh=Math.hypot(dx,dz);if(dh<1||dh>140)continue;
    const y=q.y+4+ev()*12,co=Math.cos(g.ry),si=Math.sin(g.ry);let rT=0,cx=0,cz=0; /* le fût à cette hauteur : la plus grosse gélule du prototype qui la traverse */
    for(const c of meta.C){const y0=g.y+c[1]*g.sy,y1=g.y+c[4]*g.sy;if(y<Math.min(y0,y1)||y>Math.max(y0,y1))continue;const r=c[6]*g.sxz;if(r<=rT)continue;
      const u=Math.abs(y1-y0)>1e-6?(y-y0)/(y1-y0):0,px=c[0]+(c[3]-c[0])*u,pz=c[2]+(c[5]-c[2])*u;rT=r;cx=g.x+(px*co+pz*si)*g.sxz;cz=g.z+(-px*si+pz*co)*g.sxz;}
    if(rT<2)continue;
    const ex=q.x-cx,ez=q.z-cz,eh=Math.hypot(ex,ez)||1,off=rT+1.6,x=cx+ex/eh*off,z=cz+ez/eh*off;
    let ok=true;proches(x,z,42,function(j){if(!ok)return;const r=pts[j];if(Math.abs(r.y-y)<26&&Math.hypot(r.x-x,r.z-z)<40)ok=false;}); /* jamais dans le couloir d'une route, à aucun étage */
    if(!ok)continue;
    for(const p of P)if(Math.hypot(p[0]-x,p[1]-y,p[2]-z)<60){ok=false;break;} /* ni deux lanternes collées */
    if(!ok)continue;
    P.push([x,y,z]);X.push(mat(x,y,z,0,1,1,1));const r9=ev();AL.push(2,r9<.8?0:r9<.93?1:2,12+ev()*8,ev());}
  if(!P.length)return;
  const g=new THREE.PlaneGeometry(1,1);g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(AL),4));
  const im=new THREE.InstancedMesh(g,M.lueur,P.length);for(let k=0;k<P.length;k++)im.instanceMatrix.array.set(X[k],k*16);
  im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=7;im.name='forêt lanternes';im.visible=false;im.userData.jeter=true;root.add(im);FORET.lant=im;FORET.n.lanternes=P.length;}
window.dbgForetEmb=function(o){if(o)Object.assign(FOR_EMB,o);return {emb:Object.assign({},FOR_EMB),lanternes:FORET.lant?FORET.lant.count:0,vues:FORET.lant&&FORET.lant.visible};}; /* (banc) les réglages de la passe d'embellissement */
/* =========================== LE CANYON DES GÉANTS (2026-10-14, Sacha) ===========================
   Sacha : « fais une map façon canyon Monument Valley mais genre géant, avec des grandes gorges où la route passe entre, au-dessus des
   lits de rivière, entre deux grandes parois de pierre ; il faut quand même que la route descende vers le bas, pas comme la map montagne
   chinoise ; fais quelque chose de magnifique où tu t'amuses sur les couleurs de la roche, avec des teintes jaune et rose ; la map doit
   avoir le même niveau d'exigence que les autres, et toutes les météos et heures de la journée parfaitement gérées et adaptées à un biome
   désertique ».
   · LA ROUTE (`genCanyon`) : elle PLONGE comme celle des nuages (MESURÉ sur la MER DE NUAGES : pente médiane ~30°, 7,8 km de dénivelé
     sur 18 km — les Pics de jade, eux, restent à plat) le long d'une rivière qui serpente : la vallée des MITAINES au départ, LA BRÈCHE (le
     grand plongeon dans la gorge), les méandres et leurs bosses, LE FER À CHEVAL, LES ÉTROITS, L'ARCHE, L'AMPHITHÉÂTRE, le DOS DE CHAMEAU,
     la finale. Jamais deux tronçons trop proches (contrôle à la génération, nouvel essai sinon) ; son propre flux de hasard (UN tirage de rnd).
   · LE MONDE (`buildCanyon`) : un relief calculé autour de la route — la rivière en VASQUES et en CASCADES sous la dalle (une rivière ne
     remonte jamais : le lit suit le minimum de la route moins sa hauteur), ses berges, les PAROIS (un profil par section : gorge en U,
     étroits presque verticaux, amphithéâtre en gradins), le PLATEAU en ESCALIER qui descend avec la route (des escarpements tous les
     ~250 m de dénivelé), les BUTTES de Monument Valley posées dessus (une grille de 760 m, loin de la route). Quatre textures de données :
     la TAILLE fine (le creusement et l'eau, 9 m), le PLATEAU (48 m, jusqu'au plan lointain), la hauteur d'OMBRE (le soleil de l'heure,
     balayé une fois sur la grille), et deux bruits partagés avec le processeur (la collision lit EXACTEMENT les mêmes données que la puce).
   · LE RENDU (`CY_VS`/`CY_FS`) : un terrain GPU à niveaux de détail continus (CDLOD : UN maillage de grille en instances, choisi par un
     quadtree à chaque image, qui se MORPHE d'un niveau à l'autre — ni fissure ni saut) ; la hauteur se lit dans les textures et se taille
     en CORNICHES (marches de 15-26 m, contremarches franches) ; les STRATES (une colonne de 1 024 couches : crème, jaune beurre, saumon,
     rose, corail, ocre, lavande, brique), le litage oblique des grès, le VERNIS du désert qui coule sous les corniches, le sable et le
     maquis sur les replats, la ripisylve verte au bord de l'eau ; la lumière : le soleil (et l'ombre portée des parois), le ciel qui
     s'assombrit au fond de la gorge, le REBOND chaud des parois éclairées dans l'ombre, l'eau turquoise (vasques, reflets de la gorge,
     cascades blanches), la brume du matin au fond, la boue de l'orage, l'éclair.
   · L'HEURE : c'est le seul niveau où le SOLEIL BOUGE (`cyA` de chaque ambiance : hauteur et azimut) — bas et rose à l'aube, haut à midi
     (la gorge s'allume), rasant le soir, la lune la nuit. `canyonSoleil` pose SUN_DIR dans la boucle ; ailleurs il revient à sa valeur
     d'origine AU BIT PRÈS (SUN_DIR0). Le ciel est à lui (`canyonCiel`, un programme dédié : dégradé du désert, ceinture de Vénus, soleil,
     nuages, mesas à l'horizon, Voie lactée et lune la nuit, plafond de pluie, enclumes d'orage).
   · RÈGLE D'OR : aucun relief ne touche la route, dessus ni dessous (`dbgCanyon('test')`). En vol, la roche, l'eau et le fond TUENT
     (`canyonHeurt` → « ENCASTRÉ DANS LA PAROI », « AU FOND DU CANYON »).
   Console : `dbgCanyon()` (état, temps de construction) · `dbgCanyon('test')` (la règle d'or) · `dbgCanyon('vue',d,h,cap)` (photo figée)
   · `?carte=canyon&meteo=soir` (ou `dbgClassique('canyon','orage')` puis `dbgSaut()`). */
const NIV_CANYON={id:'canyon',nm:'CANYON DES GÉANTS',bio:['canyonSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'canyon',pr:'LES PAROIS NE PARDONNENT PAS'};
const CANYON_OK=!!(renderer.capabilities&&renderer.capabilities.isWebGL2); // les textures de données en flottants et la lecture de textures au sommet
PAL.B.cyFin=[16,14,12];PAL.B.cyPlat=[96,80,64];PAL.B.cyOmbre=[36,32,27];PAL.B.cyGrille=[16,16,32];PAL.B.cyR0=[85,100,118];PAL.B.cyChem=[120,200,300];PAL.B.cyArbres=[260,450,700];PAL.B.cyDet=[0,1,2];PAL.B.cyPous=[40,90,160]; // (2026-10-14, CANYON) la finesse du relief par palier [ancien, moyen, récent]
const SUN_DIR0=SUN_DIR.clone(),CY_UP=new THREE.Vector3(0,1,0),CY_SD=new THREE.Vector3(); // le soleil d'origine : il revient au bit près hors du canyon
const CY={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,ombre:1,prof:0,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,v:new THREE.Vector3(),sol:null};
/* LA ROUTE v2 (2026-10-14 soir, Sacha : « le but du jeu est de prendre des RACCOURCIS en coupant la route quand une autre la croise plus
   bas » + « c'est un jeu de COURSE, pas de balade : plus de virages ») — droites et arcs (≤ 8° par point), la PENTE en grade (dy/dx).
   Le cap reste dans ±58° de l'axe (la piste ne revient jamais sur elle-même… SAUF dans les BOUCLES, faites pour ça). LV élargit les rayons.
   LA BOUCLE (le raccourci) — un TROMBONE qui descend : l'APPROCHE (droite, la zone de saut), un demi-tour R1, le RETOUR, un demi-tour R2
   plus serré, la SORTIE. R2 = R1 − e/2 : la sortie court PARALLÈLE à l'approche, décalée de e (~90 m d'axe à axe, ~35 m de vide entre
   les bords) et PLUS BAS de `dh` (~120 m) — puis elle passe SOUS le premier demi-tour (la route repasse sous elle-même). Celui qui sort
   par le bord de l'approche retombe sur la sortie : il saute ~2 km de route. Les repères `racX0/racX1` (approche) et `racX2/racX3`
   (la sortie, sous l'approche) sont relus par buildCanyon → `CY.rac`. */
/* LE CANYON AU HASARD (2026-10-19, Sacha : « vérifie bien que toutes les maps sont générées aléatoirement ») — MESURÉ (40 graines, palier 0) : la graine
   changeait à chaque partie, mais genCanyon suivait toujours la même RECETTE : plein nord (±11°), Route 67 → brèche → fer à cheval/raccourci → arche →
   finale, aux mêmes % du parcours (écart de forme 0,08 ; la jade après son tirage : 0,26). Désormais chaque canyon tire :
   · son AXE (±`axe`° autour du nord) et ses COUDES : entre deux pièces, `coude` fois sur 1, l'axe tourne de ±10-25° (±`cmax`° au plus) ;
   · ses PIÈCES et leur ORDRE entre le départ (Route 67 + brèche, gardés) et la finale (le tunnel) : un raccourci et une pièce toujours (l'arche
     ou l'amphithéâtre le plus souvent : poids `PDS`), puis, mélangées, celles que la longueur tient parmi les étroits, les monuments, la mine, le
     dos de chameau, les bosses et un 2e raccourci (hors JOUER : tout, huit raccourcis) ;
   · un CARACTÈRE par liaison — méandres, gorge, serpent, dérive, cassures — ou un module (`mod` : la part des liaisons qui en sont un) ;
   · sa PENTE (les liaisons ×0,85-1,2) et sa LONGUEUR : longueurCible() × `kL` ±8 % (la longueur réelle d'avant au palier 0, celle sur laquelle la
     durée des maps a été mesurée : 46 s) ; `lien` = la longueur moyenne d'une liaison au JOUER (×LL).
   MESURÉ (banc des tracés, 40 graines, palier 0 → 25) : écart de forme 0,08 → 0,26 ; 1 → 17 ordres des pièces ; longueur/visée 1,34 (avant 1,34) ;
   rayon mini 1,11 × RMIN au palier 0, 1,0 au palier 25 (comme avant) ; aucun croisement hors des boucles ; 4-23 ms par tracé.
   Le relief, la rivière, les parois et tous les décors (Mitaines, station, arche, cheminées, mine, tunnel) sont posés AUTOUR de la route : ils suivent ;
   le soleil de l'heure (`cyA`) reste celui du monde — il ne tombe plus toujours du même côté de la route. `?sans=canyonhasard` = la recette d'avant,
   au tirage près ; `dbgCanyon().hz` = l'axe, la pente, la longueur visée et les pièces dans l'ordre. */
const CY_HZ={on:!/[?&]sans=([^&]*,)?canyonhasard(,|&|$)/.test(location.search),axe:55,kL:1.34,mod:.75,lien:150,coude:.65,cmax:28};
/* ===== LE CANYON AU HASARD, SON DÉCOR (2026-10-20, Sacha : « volcan, grotte, dune : ces maps ne sont pas générées aléatoirement, il faut que chaque map soit
   aléatoire avec des modules et des décors qui changent ») ===== — le tracé changeait déjà (écart de forme 0,29), le DÉCOR jamais : les mêmes strates jaune-rose,
   les Mitaines et leur mesa, la même station-service à droite à 430 m, la même rivière pleine, les mêmes peupliers, cinq vautours. Chaque canyon tire
   désormais (`cyTirage`, un flux à lui né de la graine) : la PALETTE des strates (classique, rouge de Sedona, crème de Zion, désert peint lavande, ocre de
   Bryce), la brume du fond, la rivière (pleine, basse, à sec : un lit de sable), la densité des buttes au loin, les Mitaines (les deux, l'une, aucune ;
   la mesa ; leur taille), les cheminées de fées (combien), la ripisylve (combien, verte, dorée d'automne, sombre), les éboulis du fond (0 à 400 blocs),
   les vautours (2 à 9), la mine (présente ou non ; ses filons, ses cadres, ses torches), la Route 67 (la station : là ou pas, à gauche ou à droite, plus ou
   moins loin ; le panneau ; un MOTEL ; des carcasses de voitures ; des cactus ; des panneaux publicitaires). Aucun programme neuf (la colonne des strates est
   réécrite dans SA texture ; le reste : des pavés cuits, la matière des arbres). `?sans=canyondecor` = le décor d'avant ; `?sans=canyonmodules` = le paquet
   de modules d'avant (4 sortes ; 7 désormais) ; `dbgCanyon().deco` = le tirage. */
const CY_DECO={on:!/[?&]sans=([^&]*,)?canyondecor(,|&|$)/.test(location.search),mods:!/[?&]sans=([^&]*,)?canyonmodules(,|&|$)/.test(location.search)};
function* genCanyon(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais et pendant la mesure des écarts
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;
  const LV=lvPiste(),RS=1.25+.3*(LV-1),LL=1+Math.min(1.3,(LV-1)*.5),SQ=Math.sqrt(LV),g0=(rnd()*4294967296)>>>0;
  // LE RAYON MINIMAL TENABLE à la vitesse du palier (règle RACCOURCIS de GAMEPLAY : 40 + 0,3 × la croisière du palier en m/s — le vrai
  // plafond du joueur, lacetMax ; dessous un virage est INFRANCHISSABLE) : rayonPalier() du jeu s'il est là, ×1,08 de marge
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);CY.rmin=Math.round(RMIN);
  let best=null,bestSep=-1;
  for(let essai=0;essai<14;essai++){if(essai)yield;
    const r=mulberry32((g0+essai*0x9E3779B1)>>>0),C=[],Q={},P=new THREE.Vector3(0,0,0),BO=[];let phi=0,AX9=0;const LIM=58*Math.PI/180; /* AX9 : (AU HASARD) le COUDE de l'axe — 0 dans la recette d'avant */
    const push=()=>C.push(P.clone()),ici=k=>{Q[k]={p:P.clone(),phi:phi+AX9};};
    const droite=(l,pe,n)=>{n=n||Math.max(2,Math.round(l/90));for(let k=0;k<n;k++){P.x+=Math.sin(phi+AX9)*l/n;P.z+=Math.cos(phi+AX9)*l/n;P.y+=pe*l/n;push();}};
    const arc=(aDeg,R,pe)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
      for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi+AX9)*ch;P.z+=Math.cos(phi+AX9)*ch;P.y+=pe*ch;phi+=st/2;push();}};
    const recentre=pe=>{if(Math.abs(phi)>.06)arc(-phi*57.2958,(230+r()*120)*RS,pe);}; // (2026-10-15) R 300-450 : à 520-720 le retour au cap faisait 900 m qu on prenait pour une droite
    // LES VIRAGES DE COURSE (règle RACCOURCIS de GAMEPLAY : ≥ 2,5 virages/km de rayon < 250 m, enchaînés) : gauche-droite, presque plus de droites
    // LE GRAND VIRAGE (2026-10-15, Sacha : « plus de virages larges, la plupart de la map fait du tout droit ») : une longueur donnée
    // posée en COURBE ample (R 300-520 m) au lieu d'une droite — le côté se choisit d'après la place qui reste dans les ±58°
    const large=(len,pe,R)=>{R=R||(200+r()*150)*RS; /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : 200-350 m (c'étaient 300-520) */let sg=r()<.5?-1:1;const a=len/R*57.2958;
      if((LIM-sg*phi)*57.2958<a*.6)sg=-sg;const lib=Math.max(4,(LIM-sg*phi)*57.2958);
      if(a<=lib){arc(sg*a,R,pe);return;}arc(sg*lib,R,pe);arc(-sg*Math.min(a-lib,(LIM+sg*phi)*57.2958),R,pe);}; // trop long d'un côté : il repart en S
    const virages=(len,p0,p1)=>{let fait=0,sg=r()<.5?-1:1;
      while(fait<len){if(r()<.8)sg=-sg;const lg=r()<.4;let a=lg?40+r()*35:30+r()*45;const R=(lg?240+r()*180:85+r()*105)*RS; // 4 sur 10 sont des GRANDS virages (R 240-420 m) : on tient l'appui longtemps
        const lib=(LIM-sg*phi)*57.2958;if(lib<18){sg=-sg;a=Math.min(a,(LIM-sg*phi)*57.2958);}else a=Math.min(a,lib);
        const pe=-(p0+r()*(p1-p0));arc(sg*a,R,pe);fait+=R*a/57.2958;
        if(r()<.12){const l=(50+r()*70)*LL,p2=-(p0+r()*(p1-p0))*.8;droite(l,p2);fait+=l;}}};
    const bosses=n=>{for(let k=0;k<n;k++){const l1=(70+r()*25)*LL,l2=(105+r()*30)*LL,h=(14+r()*8)*SQ,h2=(26+r()*14)*SQ;droite(l1,h/l1,2);droite(l2,-(h+h2)/l2,3);}};
    /* LES MODULES DU CANYON (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). 5 ou 6 des 6 « virages » de liaison (tirés au sort) deviennent
       un module — jamais les boucles à raccourci, la route 67, les étroits, l'arche, l'amphithéâtre, la mine ni la finale. Paquet mélangé, jamais
       deux fois de suite ; leur hasard `rm` naît de la graine de l'essai (aucun tirage de plus, ni dans `rnd` ni dans `r`) :
         cSlalom  · LE SLALOM DES CAIRNS : 4-5 virages alternés de 35-55° à 1,25-1,6 × RMIN — plus vif que les étroits, entre des parois larges
         cCorde   · LA DOUBLE CORDE : deux appuis du même côté autour d'une butte (95-110° en tout), le second plus serré, une courte droite entre
         cWhoops  · LES WHOOPS DE LA GORGE : 3-4 bosses rondes (une montée douce, une plongée franche), chacune un virage de 55-70°, en slalom — on décolle à chaque crête
         cChicane · LA CHICANE DES BUTTES : gauche-droite-gauche SERRÉE (1,1-1,3 × RMIN)
       Le cap reste dans ± LIM (on recentre avant s'il le faut) ; les pentes sont celles de la liaison qu'ils remplacent. */
    const rm=MODC_ON?mulberry32(((g0^0x6D0D5EED)+Math.imul(essai+1,0x85EBCA6B))>>>0):null,MM=[],cmPaq=[],cmCase=new Set();let cmK=0,cmLast=-1;
    if(rm){const t=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}const nb=5+(rm()<.5?1:0);for(let i=0;i<nb;i++)cmCase.add(t[i]);}
    const cmPe=(p0,p1)=>-(p0+rm()*(p1-p0)),cmRe=(lim,pe)=>{if(Math.abs(phi)>lim)arc(-(phi-Math.sign(phi)*lim*.3)*57.2958,(260+rm()*120)*RS,pe);};
    const cSlalom=(p0,p1)=>{const n=4+(rm()<.5?1:0),a=35+rm()*20,R=RMIN*(1.25+rm()*.35);cmRe(LIM-a/57.3*.6,cmPe(p0,p1));let sg=phi>0?-1:1;arc(sg*a*.5,R,cmPe(p0,p1));
      for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R,cmPe(p0,p1));}arc(-sg*a*.5,R,cmPe(p0,p1));};
    const cCorde=(p0,p1)=>{const T=95+rm()*15,sg=phi>0?-1:1,a1=T*(.5+rm()*.1),R=RMIN*(1.5+rm()*.4);{const d=(-sg*T/2/57.2958-phi)*57.2958;if(Math.abs(d)>3)arc(d,(260+rm()*80)*RS,cmPe(p0,p1));}
      arc(sg*a1,R,cmPe(p0,p1));droite((40+rm()*40)*LL,cmPe(p0,p1)*.8);arc(sg*(T-a1),Math.max(RMIN*1.15,R*.8),cmPe(p0,p1));};
    const cWhoops=(p0,p1)=>{const n=3+(rm()<.5?1:0);cmRe(.5,cmPe(p0,p1));let sg=phi>0?-1:1;
      for(let k=0;k<n;k++){const lu=(80+rm()*20)*LL,ld=(110+rm()*30)*LL,a=(k?55+rm()*15:30+rm()*8)/57.2958,R=Math.max(RMIN*1.4,(lu+ld)/a),au=lu/R*57.2958,ad=ld/R*57.2958;arc(sg*au,R,.12+rm()*.05);arc(sg*ad,R,-(.38+rm()*.1));sg=-sg;}};
    const cChicane=(p0,p1)=>{const a=30+rm()*10,R=RMIN*(1.1+rm()*.2);cmRe(LIM-a/57.3-.05,cmPe(p0,p1));const sg=phi>0?-1:1;droite(50*LL,cmPe(p0,p1)*.6);
      arc(sg*a,R,cmPe(p0,p1));arc(-sg*2*a,R,cmPe(p0,p1));arc(sg*a,R,cmPe(p0,p1));droite(50*LL,cmPe(p0,p1)*.6);};
    /* (2026-10-20, LE DÉSERT AU HASARD) TROIS MODULES DE PLUS — seulement avec le tracé au hasard (`?sans=canyonhasard` reste la recette d'avant) :
         cGoulet  · LE GOULET : un S serré qui PLONGE (50-65° puis le double en sens contraire puis 50-65°, à 1,2-1,4 × RMIN, la pente × 1,3)
         cMesa2   · LES DEUX CORDES : on contourne une mesa par la gauche puis la suivante par la droite (deux appuis de 85-100°, une droite entre)
         cGradins · LA DESCENTE EN GRADINS : 3 replats (un virage doux, du même côté) et 3 marches raides (−40 à −46 %)
       Le paquet en compte 8 : la double corde y est DEUX fois (MESURÉ, banc des tracés, 48 graines : sans elle, l'écart de forme tombait de 0,274 à 0,24 —
       c'est elle qui fait dériver la gorge). */
    const cGoulet=(p0,p1)=>{const a=50+rm()*15,R=RMIN*(1.2+rm()*.2);cmRe(LIM-a/57.3-.05,cmPe(p0,p1));const sg=phi>0?-1:1;droite(40*LL,cmPe(p0,p1),2);
      arc(sg*a,R,cmPe(p0,p1)*1.3);arc(-sg*2*a,R*1.1,cmPe(p0,p1)*1.3);droite(40*LL,cmPe(p0,p1)*.8,2);}; /* (il sort du goulet de biais : de a, 50-65°) */
    const cMesa2=(p0,p1)=>{const T=85+rm()*15,R=RMIN*(1.5+rm()*.3);let sg=phi>0?-1:1;{const d=(-sg*T/2/57.2958-phi)*57.2958;if(Math.abs(d)>3)arc(d,RMIN*(1.8+rm()*.4),cmPe(p0,p1));}
      arc(sg*T,R,cmPe(p0,p1));droite((40+rm()*30)*LL,cmPe(p0,p1)*.8);arc(-sg*T*.15,R,cmPe(p0,p1));}; /* (on repart de biais : ~T/3, la route a changé de vallée) */
    const cGradins=(p0,p1)=>{const n=3;cmRe(.45,cmPe(p0,p1));let sg=phi>0?-1:1;
      for(let k=0;k<n;k++){const a=Math.min(12+rm()*10,Math.max(4,(LIM-sg*phi)*57.2958-4));arc(sg*a,RMIN*(2.4+rm()*.6),-.04);droite((35+rm()*15)*LL,-(.40+rm()*.06),2);if((LIM-sg*phi)*57.2958<16)sg=-sg;}}; /* (les replats tournent du même côté tant que le cap le permet : la descente dérive) */
    const cmJ=[cSlalom,cCorde,cWhoops,cChicane,cGoulet,cMesa2,cGradins],cmN=CY_HZ.on&&CY_DECO.mods?7:4;
    const cmPose=(p0,p1)=>{let m=0;for(let e=0;e<6;e++){if(!cmPaq.length){const t=[];for(let i=0;i<cmN;i++)t.push(i);if(cmN>4)t.push(1);for(let i=t.length-1;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)cmPaq.push(x9);}m=cmPaq.shift();if(m!==cmLast)break;}
      cmLast=m;const i0=C.length-1;cmJ[m](p0,p1);MM.push({i0:i0,i1:C.length-1});}; // le module suivant du paquet (jamais deux fois le même de suite)
    const lien=(len,p0,p1)=>{const k=cmK++;if(!rm||!cmCase.has(k)){virages(len,p0,p1);return;}cmPose(p0,p1);};  // (2026-10-18) une liaison : des virages… ou un MODULE (voir cSlalom)
    // LA BOUCLE (le raccourci) : approche ~220 m · demi-tour R1 ~135 m · retour · demi-tour SERRÉ R2 = R1 − e/2 (~80 m) · la SORTIE, 94 m à côté
    // de l'approche et 55 à 90 m plus bas (2,6 à 3,4 s de vol : à 70-140 m/s on retombe de 180 à 480 m plus loin — la sortie file droit
    // sous l'approche puis sous le premier demi-tour, et s'incurve à peine : elle est là où la caisse arrive)
    const boucle=(nm,sg)=>{const k0=C.length;if(Math.abs(phi)>.06)arc(-phi*57.2958,(200+r()*80)*RS,-.25);
      const e=2*ROAD_HALF+32+r()*12,R1=Math.max((100+r()*20)*RS,RMIN+e/2),R2=R1-e/2,La=(200+r()*50)*LL,Lb=(140+r()*30)*LL,pa=.10,dh=55+r()*35,
        pl=Math.max(.02,(dh-pa*Lb)/(Math.PI*(R1+R2)+Lb));
      ici(nm+'0');droite(La,-pa,Math.max(3,Math.round(La/70)));ici(nm+'1');               // l'APPROCHE : la zone de saut
      arc(sg*180,R1,-pl);droite(Lb,-pl,Math.max(2,Math.round(Lb/70)));arc(sg*180,R2,-pl);phi-=sg*2*Math.PI; // demi-tour, retour, demi-tour serré (le cap a fait un tour : on le ramène)
      ici(nm+'2');droite(Lb,-pa,Math.max(2,Math.round(Lb/70)));                          // la SORTIE : droite sous l'approche…
      {const R3=(400+r()*100)*RS;arc(-sg*150*LL/R3*57.2958,R3,-pa);}ici(nm+'3');          // …puis elle tourne déjà sous le 1er demi-tour (150 m sur R 400-500 : 28 m d'écart au bout, la pose reste sur la dalle)
      arc(-sg*(18+r()*14),(380+r()*120)*RS,-pa);                                          // …et elle finit son GRAND virage (R 380-500 m : la pose de ceux qui volent loin reste douce)
      BO.push([k0,C.length-1]);};
    let sg0=r()<.5?1:-1;const sens=()=>(sg0=-sg0);                            // les boucles alternent de côté : la piste ne dérive pas
    /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : la Route 66 (moitié), la brèche, le raccourci A, les étroits, l'arche, l'amphithéâtre et la finale
       restent ; les raccourcis B à H, les bosses, la mine et le dos de chameau n'entrent que si la longueur visée les tient (`tient`) */
    const LC9=typeof longueurCible==='function'?longueurCible():0,kC=LC9?.4:1,fait=()=>{let a=0;for(let k=1;k<C.length;k++)a+=Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);return a;},tient=f=>!LC9||fait()<LC9*f;
    let ax=0,hz=null;
    if(CY_HZ.on){ /* LE CANYON AU HASARD (2026-10-19) — voir CY_HZ. Tout se tire dans `rh` (né de la graine de l'essai) et dans `r` ; la route est bâtie
                     dans l'axe (+z) puis TOURNÉE de `ax` à la fin (la butée de cap ±58°, les recentrages et les boucles se comptent autour de l'axe) */
      const rh=mulberry32(((g0^0x0CA4A5A1)+Math.imul(essai+1,0x27D4EB2F))>>>0),kP=.85+rh()*.35,mel=a=>{for(let i=a.length-1;i>0;i--){const j=(rh()*(i+1))|0,x9=a[i];a[i]=a[j];a[j]=x9;}return a;};
      ax=(rh()-.5)*2*CY_HZ.axe/57.2958;
      // LES CARACTÈRES DES LIAISONS : les méandres (les virages d'avant), la gorge (grandes courbes), le serpent (S serrés), la dérive (la gorge part
      // en biais jusqu'à la butée et y ondule), les cassures (courtes droites et coudes) — jamais deux fois le même de suite ; ou un MODULE (cmPose)
      const cote=(sg,a)=>{const l9=(LIM-sg*phi)*57.2958;if(l9<15){sg=-sg;a=Math.min(a,(LIM-sg*phi)*57.2958);}else a=Math.min(a,l9);return [sg,a];};
      const gorge=(len,p0,p1)=>{let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,40+r()*35),R=(200+r()*140)*RS;sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const serpent=(len,p0,p1)=>{let f9=0,sg=r()<.5?-1:1;while(f9<len){const t=cote(-sg,30+r()*18),R=RMIN*(1.25+r()*.35);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=R*t[1]/57.2958;}};
      const derive=(len,p0,p1)=>{const sg=r()<.5?-1:1,c9=sg*(LIM*57.2958-6-r()*12)-phi*57.2958,R0=(260+r()*120)*RS;arc(c9,R0,-(p0+r()*(p1-p0)));let f9=R0*Math.abs(c9)/57.2958;
        while(f9<len){const s9=sg*phi*57.2958>LIM*57.2958-24?-sg:sg,a=Math.min(12+r()*16,(LIM-s9*phi)*57.2958),R=(180+r()*120)*RS;arc(s9*a,R,-(p0+r()*(p1-p0)));f9+=R*a/57.2958;}};
      const cassures=(len,p0,p1)=>{let f9=0,sg=r()<.5?-1:1;while(f9<len){const l=(60+r()*60)*LL;droite(l,-(p0+r()*(p1-p0))*.8);const t=cote(-sg,28+r()*20),R=RMIN*(1.3+r()*.5);sg=t[0];arc(sg*t[1],R,-(p0+r()*(p1-p0)));f9+=l+R*t[1]/57.2958;}};
      const CAR9=[virages,gorge,serpent,derive,cassures],CARN=['meandres','gorge','serpent','derive','cassures'];let hPrec=-1;
      const lienH=(len,p0,p1)=>{p0*=kP;p1*=kP;if(rm&&rm()<CY_HZ.mod){cmPose(p0,p1);return 'module';}
        let i=(rh()*CAR9.length)|0;if(i===hPrec)i=(i+1+((rh()*(CAR9.length-1))|0))%CAR9.length;hPrec=i;CAR9[i](len,p0,p1);return CARN[i];};
      // LES PIÈCES (celles d'avant, telles quelles) — chacune derrière sa liaison
      let nRac=0;
      const PC={rac:()=>{const nm='rac'+'ABCDEFGH'[nRac];if(!nRac)ici('fer0');boucle(nm,sens());if(!nRac)ici('fer1');nRac++;},
        etroits:()=>{recentre(-.3);ici('etroit0');let sg=sens();for(let k=0;k<(LC9?4:6);k++){arc(sg*(24+r()*16),(150+r()*60)*RS,-.30);sg=-sg;}ici('etroit1');large(260*LL,-.28);},
        arche:()=>{droite(90*LL,-.2,2);ici('arche0');large(360*LL*(LC9?.6:1),-.14,(560+r()*200)*RS);ici('arche1');},
        amphi:()=>{recentre(-.3);const sg=sens();arc(-sg*40,300*RS,-.35);ici('amphi0');arc(sg*96,(230+r()*40)*RS,-.42);ici('amphi1');},
        mine:()=>{ici('mine0');large(300*LL,-.16);large(300*LL,-.16);ici('mine1');},
        chameau:()=>{const l1=(150+r()*40)*LL,h=(24+r()*10)*SQ,l2=(250+r()*60)*LL;ici('chameau');droite(l1,h/l1,3);large(l2,-(h+80*SQ)/l2);},
        bosses:()=>{ici('bosses');bosses(2);}};
      // LA LONGUEUR de chaque pièce, en moyenne (MESURÉ au banc des tracés, 40 graines × paliers 0 à 25) — pour savoir lesquelles la longueur visée tient ;
      // une liaison : un module (~8,4 × RMIN) ou un caractère (~1,75 × la longueur demandée : on finit le virage commencé)
      const LIEN=(LC9?CY_HZ.lien:300)*LL,EST={rac:290*LL+1190*RS+190,etroits:(LC9?860:1290)*RS,arche:(90+360*(LC9?.6:1))*LL,amphi:783*RS,mine:600*LL,chameau:450*LL,bosses:410*LL},
        LI9=(rm?CY_HZ.mod*8.4*RMIN:0)+(1-(rm?CY_HZ.mod:0))*1.75*LIEN,FIN=LI9+80+(LC9?372:620)*LL+150,B=LC9?LC9*CY_HZ.kL*(.92+rh()*.16):0;
      // LE JEU DE PIÈCES : un raccourci et une pièce DUS (le plus souvent un monument : l'arche ou l'amphithéâtre) ; les autres, prises dans un ordre
      // mélangé, entrent si la longueur visée les tient ; puis l'ORDRE de toutes est mélangé à son tour
      const PDS={arche:3,amphi:3,etroits:2,mine:1.5,chameau:1,bosses:1};let deux='arche';{let t=rh()*11.5;for(const k in PDS){t-=PDS[k];if(t<0){deux=k;break;}}}
      const autres=Object.keys(PDS).filter(k=>k!==deux);let jeu=['rac',deux];
      if(!LC9)jeu=jeu.concat(autres,['rac','rac','rac','rac','rac','rac','rac']);
      else{let u=FIN+2*LI9+EST.rac+EST[deux]+820*LL*.35+98*RS+420*LL;for(const p of mel(autres.concat(['rac'])))if(u+LI9+EST[p]<=B){jeu.push(p);u+=LI9+EST[p];}}
      mel(jeu);
      hz={axe:Math.round(ax*57.2958),pente:+kP.toFixed(2),B:Math.round(B),LL:+LL.toFixed(2),RS:+RS.toFixed(2),RMIN:Math.round(RMIN),p:[]};
      push();ici('depart');
      {const l9=820*LL*(LC9?.35:1);droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0');   // LA ROUTE 67 (sa station, son panneau)
      {const a=(r()<.5?-1:1)*(5+r()*6);arc(a,700*RS,-.2);}
      large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                                            // LA BRÈCHE : le plongeon dans la gorge
      // LE COUDE : entre deux pièces, l'axe de la gorge tourne (±10-25°, ±`cmax`° au plus autour de l'axe tiré) — la route garde son cap, la suite se
      // compte autour du nouvel axe (le cap reste à moins de 90° de l'axe tiré : la route ne revient jamais sur elle-même)
      const coude=()=>{if(rh()>=CY_HZ.coude)return;let d=(rh()<.5?-1:1)*(10+rh()*15)/57.2958;const M9=CY_HZ.cmax/57.2958;if(Math.abs(AX9+d)>M9)d=-d;
        if(Math.abs(AX9+d)<=M9&&Math.abs(phi-d)<LIM-.09){AX9+=d;phi-=d;hz.c.push(Math.round(d*57.2958));}};hz.c=[];
      jeu.forEach(function(p,k){if(k)coude();const f0=fait(),c9=lienH(LIEN*(.7+rh()*.6),.30,.55),f1=fait();PC[p]();hz.p.push([c9,Math.round(f1-f0)],[p,Math.round(fait()-f1)]);});
      coude();{const f0=fait(),c9=lienH(LC9?Math.max(.6*LIEN,Math.min(900*LL,(B-fait()-(FIN-LI9))/1.75)):240*LL,.30,.55);hz.p.push([c9,Math.round(fait()-f0)]);}recentre(-.4); // la dernière liaison prend ce qui manque à la longueur visée
      ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // LA FINALE (le tunnel de grès)
    }else{
    push();ici('depart');
    r();r();{const l9=820*LL*(LC9?.35:1);droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0'); /* (2026-10-15 soir, Sacha : « le niveau dans le canyon doit commencer par une longue ligne droite, une vieille station-service et un panneau ROUTE 66 ») LA ROUTE 66 : la vallée des Mitaines en LONGUE LIGNE DROITE (820 m, à peine en pente) — les deux tirages de l'ancienne courbe sont gardés : la suite du canyon ne bouge pas. Avant : large(340*LL,-.05,(480+r()*200)*RS) */
    {const a=(r()<.5?-1:1)*(5+r()*6);arc(a,700*RS,-.2);}
    large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                 // LA BRÈCHE : le grand plongeon dans la gorge — en virage
    lien(380*LL*kC,.30,.55);
    {ici('fer0');boucle('racA',sens());ici('fer1');}                          // les RACCOURCIS, un tous les ~1,5 km
    if(tient(.3)){lien(300*LL,.28,.5);boucle('racB',sens());}
    if(tient(.38)){ici('bosses');bosses(2);boucle('racC',sens());}
    lien(300*LL*kC,.30,.55);recentre(-.3);
    if(tient(.45)){ici('etroit0');let sg=sens();for(let k=0;k<(LC9?4:6);k++){arc(sg*(24+r()*16),(150+r()*60)*RS,-.30);sg=-sg;}ici('etroit1');} // LES ÉTROITS : le COULOIR — ça serpente entre deux murs collés à la route
    if(tient(.5)){large(260*LL,-.28);boucle('racD',sens());}else large(160*LL,-.28);  // (2026-10-15) un grand virage de sortie : la zone de saut du raccourci D sort du fondu de la fente (sinon une crête de roche coupait le saut)
    droite(90*LL,-.2,2);ici('arche0');large(360*LL*(LC9?.6:1),-.14,(560+r()*200)*RS);ici('arche1');  // L'ARCHE (une courbe douce : l'arche se pose au milieu, en travers)
    if(tient(.62)){const sg=sens();arc(-sg*40,300*RS,-.35);ici('amphi0');arc(sg*96,(230+r()*40)*RS,-.42);ici('amphi1');} // L'AMPHITHÉÂTRE
    if(tient(.68)){boucle('racE',sens());ici('mine0');large(300*LL,-.16);large(300*LL,-.16);ici('mine1');}  // LA MINE abandonnée : deux grandes courbes sous la roche (cyMine)
    if(tient(.74))boucle('racF',sens());
    if(tient(.78)){const l1=(150+r()*40)*LL,h=(24+r()*10)*SQ,l2=(250+r()*60)*LL;ici('chameau');droite(l1,h/l1,3);large(l2,-(h+80*SQ)/l2);} // LE DOS DE CHAMEAU (la descente tourne)
    if(tient(.8)){lien(260*LL,.30,.55);boucle('racG',sens());}
    if(tient(.84)){lien(260*LL,.30,.55);boucle('racH',sens());}
    lien(240*LL*kC,.30,.55);recentre(-.4);
    ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // la finale : deux grandes courbes, seule la ligne d'arrivée reste droite
    }
    // LE CONTRÔLE : deux tronçons à plus de 1,2 km l'un de l'autre sur la route ne passent jamais à moins de ~560 m — SAUF à l'intérieur
    // d'une même boucle (c'est le raccourci, voulu)
    const n=C.length,acc=new Float32Array(n),bo=new Int16Array(n).fill(-1);for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);
    BO.forEach(function(q,m){for(let k=q[0];k<=q[1];k++)bo[k]=m;});
    let sep=1e9;for(let i=0;i<n;i++){if((i&63)===63)yield;for(let j=i+1;j<n;j++){if(acc[j]-acc[i]<1200*LL||(bo[i]>=0&&bo[i]===bo[j]))continue;const d=Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z);if(d<sep)sep=d;}}
    if(sep>bestSep){bestSep=sep;best={C:C,Q:Q,MM:MM,ax:ax,hz:hz};}
    if(sep>560*SQ)break;}
  if(best.ax){const ca=Math.cos(best.ax),sa=Math.sin(best.ax),tr=v=>{const x=v.x;v.x=x*ca+v.z*sa;v.z=v.z*ca-x*sa;}; // (LE CANYON AU HASARD) l'AXE : la route bâtie dans l'axe +z, tournée autour du départ
    for(const v of best.C)tr(v);for(const k in best.Q){tr(best.Q[k].p);best.Q[k].phi+=best.ax;}}
  CY.hz=best.hz||null;if(CY.hz)CY.hz.sep=Math.round(bestSep);
  lisserRaccords(best.C);adoucirCretes(best.C,1);
  for(const k in best.Q){const o=best.Q[k];let bi=0,bd=1e18;for(let j=0;j<best.C.length;j++){const d=best.C[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.copy(best.C[bi]);}
  CY.Q=best.Q;CY.sep=Math.round(bestSep);
  for(const m of best.MM||[])MODMARK.push(m); // (2026-10-18) LES MODULES DE CHAQUE MAP : ceux de l'essai gardé (voir cSlalom)
  return best.C;
}
/* LES BRUITS PARTAGÉS (une fois par session) — deux textures RGBA8 256², et les MÊMES octets côté processeur : `CY.rnd` (des tirages bruts,
   lus au texel près : les buttes) et `CY.nz` (quatre bruits fbm qui se répètent, lus en bilinéaire : les corniches, le grain). */
function cyBruits(){ if(CY.nz)return;
  const N=256,rd=new Uint8Array(N*N*4),r=mulberry32(0xC4A170);for(let i=0;i<rd.length;i++)rd[i]=(r()*256)|0;
  const nz=new Uint8Array(N*N*4),g=mulberry32(0x5A4D);
  for(let c=0;c<4;c++){const F=[4,8,16,32][c],lat=[];for(let o=0;o<4;o++){const f=F<<o,a=new Float32Array(f*f);for(let i=0;i<a.length;i++)a[i]=g();lat.push([f,a]);}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0,am=.5,tt=0;
      for(const L9 of lat){const f=L9[0],a=L9[1],u=x/N*f,w=y/N*f,i=Math.floor(u),j=Math.floor(w),fu=u-i,fw=w-j,su=fu*fu*(3-2*fu),sw=fw*fw*(3-2*fw);
        const A=a[(j%f)*f+(i%f)],B9=a[(j%f)*f+((i+1)%f)],C9=a[((j+1)%f)*f+(i%f)],D9=a[((j+1)%f)*f+((i+1)%f)];
        v+=am*(A+(B9-A)*su+(C9-A)*sw+(A-B9-C9+D9)*su*sw);tt+=am;am*=.5;}
      nz[(y*N+x)*4+c]=Math.max(0,Math.min(255,Math.round(((v/tt-.5)*1.7+.5)*255)));}}
  const mk=(d,lin)=>{const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.magFilter=t.minFilter=lin?THREE.LinearFilter:THREE.NearestFilter;t.generateMipmaps=false;if(lin){t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;return t;};
  CY.rnd=rd;CY.nz=nz;CY.tRnd=mk(rd,false);CY.tNz=mk(nz,true);
  CY.tStr=cyStrates();}
function cyNz(u,v,c){ // le bruit `CY.nz` lu comme la puce (bilinéaire, répété) — u, v en tuiles (1 = 256 texels)
  const N=256,x=u*N-.5,y=v*N-.5,i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,d=CY.nz,i0=((i%N)+N)%N,j0=((j%N)+N)%N,i1=(i0+1)%N,j1=(j0+1)%N;
  const a=d[(j0*N+i0)*4+c],b=d[(j0*N+i1)*4+c],e=d[(j1*N+i0)*4+c],f=d[(j1*N+i1)*4+c];
  return ((a+(b-a)*fx)*(1-fy)+(e+(f-e)*fx)*fy)/255;}
/* LES STRATES — une colonne de 1 024 couches (un texel = 2,3 m : ~2,4 km de roche, répétée) : des GRÈS MASSIFS (crème, jaune beurre,
   saumon, corail, blanc de calcaire : les falaises) séparés de LITS MINCES (rose, brique, lavande, ocre, magenta : les talus). Le jaune et le
   rose d'abord (Sacha) ; le corail et la brique en accents. sRGB dans la texture (décodé au carré dans le shader) ; A = « massif » (le litage oblique). */
function cyStrates(){
  const N=1024,d=cyStratesDonnees(new Uint8Array(N*4),null);
  const t=new THREE.DataTexture(d,1,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;{t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;
  return t;}
/* (2026-10-20, LE CANYON AU HASARD, SON DÉCOR) LES PALETTES DES STRATES : mêmes lits, mêmes épaisseurs (le même tirage), la teinte de chaque lit tirée vers celle
   de la palette À LUMINANCE ÉGALE — m : les grès massifs, n : les lits minces ; [r, g, b, part, gain]. `classique` (null) = les octets d'avant, au bit près. */
const CY_PALS={classique:null,sedona:{m:[.90,.46,.30,.36,.96],n:[.72,.28,.20,.4,.92]},zion:{m:[1,.93,.82,.55,1.06],n:[.86,.42,.28,.42,.95]},
  peint:{m:[.94,.64,.54,.35,1],n:[.62,.54,.80,.72,1.02]},bryce:{m:[.99,.66,.36,.38,1],n:[.97,.84,.68,.4,1.05]}};
function cyStratesTeinte(nm){if(!CY.tStr)return;cyStratesDonnees(CY.tStr.image.data,CY_PALS[nm]||null);CY.tStr.needsUpdate=true;}
function cyStratesDonnees(d,T){
  const N=1024,r=mulberry32(0x57A7A),te=(L9,mas)=>{if(!T)return L9;const q=mas?T.m:T.n,l=L9[0]*.3+L9[1]*.55+L9[2]*.15,n=q[0]*.3+q[1]*.55+q[2]*.15,g=l*q[4]/n,k=q[3];
    return [L9[0]+(q[0]*g-L9[0])*k,L9[1]+(q[1]*g-L9[1])*k,L9[2]+(q[2]*g-L9[2])*k,L9[3],L9[4]];};
  /* (2026-10-17, continuité des maps — « la colorimétrie et les textures ») LA ROCHE EN TERRES : les lits ROSE, MAGENTA et ROSE PÂLE, poussés au fluo par
     la chaîne de saturation (×1,55), faisaient des rayures roses sur toutes les falaises ; ils deviennent VIEUX ROSE, LIE-DE-VIN et PÊCHE, la lavande
     un GRIS-VIOLET froid (l'ombre commune des maps), le corail une TERRE CUITE. Mêmes lits, mêmes épaisseurs (le tirage ne bouge pas). */
  const MAS=[[244,228,204,16,38],[240,204,132,12,30],[236,172,138,10,24],[232,190,152,8,20],[212,126,88,7,16],[246,236,224,6,14],[236,212,166,10,26]];
  const MIN=[[208,150,138,3,10],[166,82,62,3,9],[156,148,166,2,7],[214,166,92,3,10],[164,96,90,1,3],[230,170,142,2,6]];
  let y=0,mas=true;
  while(y<N){
    const L9=te(mas?MAS[Math.floor(r()*MAS.length)]:MIN[Math.floor(r()*MIN.length)],mas),t=Math.max(!mas?4:0,Math.round(L9[3]+r()*(L9[4]-L9[3]))); // (matière) un lit mince n'est plus un trait de 2 m
    const sub=2+Math.floor(r()*3);
    for(let k=0;k<t&&y<N;k++,y++){const v=1+(mas?.04*Math.sin(k/sub*3.1+r()*.6):.03*(r()-.5)),o=y*4;
      d[o]=Math.min(255,Math.round(L9[0]*v));d[o+1]=Math.min(255,Math.round(L9[1]*v));d[o+2]=Math.min(255,Math.round(L9[2]*v));d[o+3]=mas?255:0;}
    mas=mas?false:(r()<.55);} // après une falaise : un ou deux lits minces
  return d;}
/* LE TIRAGE DU DÉCOR DU CANYON (2026-10-20) : des choix INDÉPENDANTS, dans un flux né de la graine de la piste (ni `rnd`, ni `r`, ni le tracé) — un objet simple
   (il part au travailleur) */
function cyTirage(seed){let h9=Math.imul((seed^0xDEC0CA)>>>0,0x9E3779B1);h9^=h9>>>15;h9=Math.imul(h9,0x85EBCA6B);h9^=h9>>>13;const rd=mulberry32(h9>>>0), /* (la graine brassée : des graines voisines ne tirent plus les mêmes choix) */ch=(L9,P9)=>{let t=rd()*P9.reduce((a,b)=>a+b,0);for(let i=0;i<L9.length;i++){t-=P9[i];if(t<0)return L9[i];}return L9[L9.length-1];},
    ent=(a,b)=>a+Math.floor(rd()*(b-a+1)),D={sd:(rd()*4294967296)>>>0};
  D.strates=ch(['classique','sedona','zion','peint','bryce'],[2.4,1.6,1.3,1.2,1.3]);D.brume=+ch([.4,1,1.7],[1,2,1]).toFixed(2);
  D.riviere=ch(['pleine','basse','asec'],[2.2,1.3,1.2]);D.eau={pleine:1,basse:.45,asec:0}[D.riviere];D.buttes=+(.55+rd()*1.1).toFixed(2);
  D.mit={g:rd()<.8,d:rd()<.8,mesa:rd()<.7,k:+(.8+rd()*.45).toFixed(2)};D.chem=+ch([.4,1,1.6],[1,2,1.2]).toFixed(2);
  D.arbres={k:+ch([.35,1,1.6],[1,2,1.3]).toFixed(2),nm:ch(['vert','automne','sombre'],[2,1.4,1])};D.eboulis=ch([0,120,260,420],[1,1.6,1.4,1]);D.vautours=ent(2,9);
  D.mine={la:rd()<.82,or:+(.4+rd()*2).toFixed(2),cad:rd()<.6?2:3,tq:rd()<.5?1:2,bois:ch(['clair','sombre','rouge'],[2,1,1])};
  D.r66={station:rd()<.8,sc:rd()<.5?-1:1,ss:Math.round(330+rd()*240),panneau:rd()<.85,pc:rd()<.5?-1:1,motel:rd()<.5,carcasses:ch([0,1,2,4],[1.2,1.5,1.2,.8]),cactus:ch([0,14,32],[1,1.6,1.4]),pubs:ch([0,1,2],[1.2,1.5,.9])};
  return D;}
/* ---- LE MONDE : appelé en fin de buildTrack (no-op hors du canyon) ---- */
function cyEteindre(){CY.on=false;if(CY.mesh)CY.mesh.visible=false;if(CY.grp)CY.grp.visible=false;}
/* LA CONSTRUCTION EN DEUX TEMPS (2026-10-14, CANYON) — MESURÉ (banc processeur, piste de 19 km au palier 0) : ~0,65 s de calcul (le
   plateau ~0,16, la taille fine ~0,28, l'ombre ~0,06…), 1,1 s pour la piste de 40 km de fin de partie — au portail, c'était un GEL (la
   règle d'OPTIMISATION : ≤ 250 ms). Désormais : les échantillons de la route ici (~20 ms), le MONDE (plateau, taille, ombre, monuments)
   dans un TRAVAILLEUR à part (`cyTravailleur` : les mêmes fonctions, recopiées par leur source — la collision et la puce lisent les MÊMES
   données), puis `cyMondePose` (textures, maillages) quand il répond. En course, le relief apparaît ~0,6 s après le portail, pendant le
   fondu sombre ; hors course (sous le voile du JOUER, au banc) ou sans travailleur, le calcul se fait tout de suite, ici. */
/* ===== LE CANYON D'AVANCE (2026-10-23, session PERF — Sacha : « quand tu arrives dans une nouvelle map, des fois il y a du temps à apparaître,
   et du coup tu peux mourir sans voir des obstacles arriver ») =====
   Depuis le portail de cubes (17/10) il n'y a plus de fondu sombre au passage : le monde bascule d'un coup (bioPortDur 0,05 s). Le relief du
   canyon, lui, partait au travailleur APRÈS le passage — on roulait 0,6 à 1,1 s (plus sur téléphone, plus en fin de partie) sur une route SANS
   parois ni collision (canyonHeurt rend '' tant que CY.on est faux), puis toute la roche surgissait d'un bloc, parfois autour d'une caisse en vol.
   Désormais le pré-bâti (prebJob) calcule les échantillons d'avance, par tranches (cyBatitG), et envoie le monde au travailleur pendant qu'on
   roule vers le portail (cyAvPart) ; au passage, cyAvPrend le reprend et le POSE dans la construction même, sous l'image du portail. Le
   travailleur pas encore revenu : il est attendu comme avant. Même graine, même palier, même piste : le même canyon au bit près (cyCle).
   `?cyw=0` : sans travailleur (rien d'avance, comme avant) · `dbgCanyon().ms.avance` : 'pret' (posé au passage) ou 'en vol'. */
function buildCanyon(seed){if(cyAvPrend(seed))return;const g=cyBatitG(seed,null);while(!g.next().done);}
function cyCle(seed){return [seed,L,NP,lvPiste(),ROAD_HALF,(LVL.cur&&LVL.cur.bio&&LVL.cur.bio[0])||'',PAL.n,CY_DECO.on?1:0].join('|');} // ce dont le monde du canyon dépend
function cyAvPart(seed,C,S,opt){ // (le pré-bâti) le monde part au travailleur ; sa réponse attend dans CY.av
  const W=/[?&]cyw=0\b/.test(location.search)?null:cyTravailleur();if(!W)return;
  const job=-(CY.jav=(CY.jav||0)+1); // (négatif : jamais un numéro de construction)
  CY.av={cle:cyCle(seed),job:job,C:C,S:S,opt:opt,R:null,t0:performance.now(),ms:0};
  try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz,rnd:CY.rnd});}catch(e){console.warn('canyon : travailleur',e);CY.av=null;}}
function cyAvPrend(seed){ // (buildCanyon, au passage) le monde calculé d'avance, si c'est cette piste-ci
  const A=CY.av;if(!A)return false;CY.av=null;
  if(A.cle!==cyCle(seed)||PARK.on||!LVL.cur||LVL.cur.piste!=='canyon'||!CANYON_OK)return false;
  cyEteindre();CY.job=(CY.job||0)+1;
  Object.assign(CY,A.C);CY.t0=performance.now();CY.ms.avance=A.R?'pret':'en vol';CY.ms.avMs=A.ms;if(A.C.deco)cyStratesTeinte(A.C.deco.strates);
  if(A.R)cyMondePose(A.R);else CY.attente={job:A.job,pour:CY.job,S:A.S,opt:A.opt};
  return true;}
function* cyBatitG(seed,av){ // av : (le pré-bâti) le travail de la route d'en face — rien n'est écrit dans CY, le monde part au travailleur
  if(!av){cyEteindre();CY.job=(CY.job||0)+1;}
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='canyon'||!(NP>1)||!CANYON_OK)return;
  const t0=performance.now(),LV=lvPiste(),K=Math.sqrt(LV),r=mulberry32((seed^0xCA4F0A)>>>0);
  cyBruits();cyTerrain();
  const C={},D9=CY_DECO.on?cyTirage(seed):null;C.deco=D9;if(D9&&!av)cyStratesTeinte(D9.strates); // (2026-10-20) LE DÉCOR TIRÉ : la palette des strates d'abord (le tunnel la relit) — d'avance : au passage (cyAvPrend)
  // ---- 1. LES ÉCHANTILLONS : la route tous les 8 m ----
  const DS=8,NS=Math.max(3,Math.floor(L/DS)+1),st9=L/(NP-1),A=n=>new Float32Array(n);
  const S={n:NS,ds:DS,x:A(NS),z:A(NS),y:A(NS),tx:A(NS),tz:A(NS),wF:A(NS),wW:A(NS),wR:A(NS),H:A(NS),D:A(NS),F:A(NS),R:A(NS),V:A(NS),zS:A(NS),zA:A(NS),zH:A(NS),as:A(NS),aw:A(NS),fo:A(NS),st:A(NS),RE:A(NS)};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];yield; // (le pré-bâti : une tranche par étape)
  // ---- 2. LES SECTIONS (repères de genCanyon → leur abscisse) et le profil de chaque tronçon, fondu d'une clé à l'autre ----
  const sQ={};if(CY.Q)for(const k in CY.Q){const p=CY.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  const KEYS=[],q=k=>sQ[k]!=null?sQ[k]:null,key=(s9,o)=>{if(s9!=null&&isFinite(s9))KEYS.push([Math.max(0,Math.min(L,s9)),o]);};
  const B0={wF:140,H:0,st:.4,V:1,D:78,zS:0,zA:0,zH:0,aw:30},G=o=>Object.assign({},B0,{V:0},o);
  key(0,B0);key(q('breche0'),B0);
  {const a=q('breche0'),b=q('breche1');if(a!=null&&b!=null)key(a+(b-a)*.55,G({wF:150,H:280,st:.34,V:.35,D:96}));}
  key(q('breche1'),G({wF:118,H:460,st:.30,V:.12,D:110}));key(q('bosses'),G({wF:112,H:640,st:.30,V:.06}));
  key(q('fer0'),G({wF:130,H:700,st:.28}));key(q('fer1'),G({wF:128,H:760,st:.28}));
  {const e0=q('etroit0'),e1=q('etroit1');if(e0!=null){key(e0-280,G({wF:108,H:640,st:.30}));key(e0,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));}
   if(e1!=null){key(e1,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));key(e1+220,G({wF:104,H:600,st:.26}));}}
  key(q('arche0'),G({wF:98,H:620,st:.22,zA:1}));key(q('arche1'),G({wF:98,H:620,st:.22,zA:1}));
  {const a0=q('amphi0'),a1=q('amphi1');if(a0!=null){key(a0-170,G({wF:118,H:600,st:.30}));key(a0+140,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));}
   if(a1!=null){key(a1,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));key(a1+260,G({wF:124,H:820,st:.32,V:.08}));}}
  key(q('chameau'),G({wF:136,H:940,st:.32}));key(q('finale0'),G({wF:132,H:1050,st:.30}));key(L,G({wF:140,H:1150,st:.30}));
  KEYS.sort(function(a,b){return a[0]-b[0];});C.sQ=sQ;yield;
  const ph=[r()*6.28,r()*6.28,r()*6.28,r()*6.28,r()*6.28],K6=Math.pow(LV,.3),K4=Math.pow(LV,.2);let kk=0;
  // LA GARDE DES RACCOURCIS (2026-10-15) : l'approche, le 1er demi-tour et la sortie de chaque boucle gardent les parois d'avant — serrées là,
  // une arête de roche monterait entre la zone de saut et la sortie, 94 m plus loin, et le raccourci deviendrait un mur. Fondu sur 120 m.
  const GD=new Float32Array(NS);
  for(const k0 in sQ){const m=/^(rac[A-Z])0$/.exec(k0);if(!m)continue;const nm=m[1],iv=[[sQ[nm+'0']-60,sQ[nm+'1']+450],[sQ[nm+'2']-60,sQ[nm+'3']+60]];
    for(const v9 of iv){if(!isFinite(v9[0])||!isFinite(v9[1]))continue;const i0=Math.max(0,Math.floor((v9[0]-120)/DS)),i1=Math.min(NS-1,Math.ceil((v9[1]+120)/DS));
      for(let i=i0;i<=i1;i++){const s9=i*DS,d=s9<v9[0]?v9[0]-s9:s9>v9[1]?s9-v9[1]:0,g=Math.max(0,1-d/120);if(g>GD[i])GD[i]=g;}}}
  for(let i=0;i<NS;i++){const s9=i*DS;while(kk<KEYS.length-2&&KEYS[kk+1][0]<s9)kk++;const a=KEYS[kk],b=KEYS[Math.min(KEYS.length-1,kk+1)];
    let u=b[0]>a[0]?(s9-a[0])/(b[0]-a[0]):1;u=Math.max(0,Math.min(1,u));u=u*u*u*(u*(u*6-15)+10);const v=f=>a[1][f]+(b[1][f]-a[1][f])*u;
    const zS=v('zS'),zA=v('zA'),zH=v('zH');S.zS[i]=zS;S.zA[i]=zA;S.zH[i]=zH;S.V[i]=v('V');S.st[i]=v('st');S.aw[i]=v('aw')*K;
    S.wF[i]=(v('wF')*(1-zS)*K+v('wF')*zS*(1+.45*(K-1)))*(1+(.16*Math.sin(s9/530+ph[0])+.08*Math.sin(s9/173+ph[1]))*(1-zS));
    S.H[i]=v('H')*K6*(1+.12*Math.sin(s9/910+ph[2]));S.D[i]=v('D')*K4;S.as[i]=.24*Math.sin(s9/760+ph[3])*(1-zS)*(1-.5*zA);
    let kS=0;
    {kS=(1-zS)*(1-GD[i])*(1-zH); // (2026-10-15, 2e serrage, Sacha : « encore plus proche de la route ») hors Étroits, raccourcis et amphithéâtre : pied à 24 m, excès gardé à 6 %, parois DEUX fois plus raides
      const b9=CY_SERRE.pied+(CY_SERRE.pied2-CY_SERRE.pied)*kS,ex=Math.max(0,S.wF[i]-b9)*(CY_SERRE.k+(CY_SERRE.k2-CY_SERRE.k)*kS)/Math.sqrt(K); // (2026-10-15, Sacha : « les parois doivent être plus proches encore de la route ») LE CANYON SERRÉ : le pied des parois à 30 m de l'axe (2 m du bord), seul l'EXCÈS se garde au quart — et il ne gonfle plus avec le palier (les rayons, eux, si)
      const k9=1-zS;S.as[i]*=1-k9+k9*ex/Math.max(1,b9+ex);S.wF[i]+=(b9+ex-S.wF[i])*k9;S.aw[i]*=1-.7*k9-.15*kS;} // les ÉTROITS (zS) gardent leur fente : elle ondule de ±8 m et monte à pic, son couloir a déjà ses murs collés // les alcôves (le bruit qui recule la roche) : 9 m au lieu de 30
    S.wR[i]=Math.min(S.wF[i]-5,(16+9*Math.sin(s9/310+ph[4]))*K*(1-zS)+(S.wF[i]-5)*zS);S.wW[i]=Math.max(10,S.H[i]*S.st[i]*(1-(1-CY_SERRE.raide)*kS));} // (raide : la paroi atteint la hauteur de la route ~8 m après le bord au lieu de ~30)
  yield;
  if(TUN2_ON){const a=L-CY_TUN2.ev0-60,b=L-CY_TUN2.ev1; /* (2026-10-19) LE TUNNEL DE GRÈS : la roche s'écarte de la SALLE DU PORTAIL (le dôme fait 78 m de large) — le pied des parois à 106 m de l'axe, sans asymétrie ni alcôve, sur 140 m de fondu (rien ne la traverse : dbgTunnel('test')) */
    for(let i=Math.max(0,Math.floor(a/DS));i<NS;i++){let u=(i*DS-a)/(b-a);u=u<0?0:u>1?1:u;u=u*u*(3-2*u);if(u<=0)continue;S.wF[i]+=(Math.max(S.wF[i],CY_TUN2.A+28)-S.wF[i])*u;S.as[i]*=1-u;S.aw[i]*=1-u;}}
  // ---- 3. LA RIVIÈRE : jamais plus haut qu'en amont, en vasques et en cascades ----
  {let mn=1e9,Lp=null,p0=0;const stepH=22*K;
   for(let i=0;i<NS;i++){mn=Math.min(mn,S.y[i]-S.D[i]);
     if(Lp===null||mn<Lp-stepH||(i-p0>Math.round(420/DS)&&mn<Lp-2)){if(Lp!==null&&Lp-mn>3){for(let k=Math.max(0,i-1);k<Math.min(NS,i+4);k++)S.fo[k]=1;}Lp=mn;p0=i;} // une CASCADE : l'écume au pied
     S.F[i]=Lp;}}
  // le PLATEAU voulu (le haut des parois), lissé sur ±300 m ; la PORTÉE de chaque échantillon (jusqu'où il creuse)
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.F[i]+S.H[i];
   for(let i=0;i<NS;i++){const a=Math.max(0,i-w),b=Math.min(NS,i+w+1);S.R[i]=(c[b]-c[a])/(b-a);}}
  let reach=0;for(let i=0;i<NS;i++){S.RE[i]=S.wF[i]*(1+Math.abs(S.as[i]))+S.wW[i]+160*K+S.aw[i];if(S.RE[i]>reach)reach=S.RE[i];}S.reach=reach;
  C.rac=[];for(const nm of Object.keys(sQ).filter(function(k){return /^rac[A-Z]0$/.test(k);}).map(function(k){return k.slice(0,4);}).sort()){const a0=sQ[nm+'0'],a1=sQ[nm+'1'],b0=sQ[nm+'2'],b1=sQ[nm+'3'];if(a0==null||a1==null||b0==null||b1==null)continue;
    const o={nm:nm,haut:[a0,a1],bas:[b0,b1],gain:Math.round(b0-a1),dh:1e9,lat:0,ecart:[]};
    for(let s9=a0;s9<=a1;s9+=40){const i=Math.min(NS-1,Math.round(s9/DS));let bj=-1,bd=1e18;for(let j=Math.round(b0/DS);j<=Math.min(NS-1,Math.round(b1/DS));j++){const d=(S.x[j]-S.x[i])**2+(S.z[j]-S.z[i])**2;if(d<bd){bd=d;bj=j;}}
      if(bj<0)continue;const lat=Math.sqrt(bd),dh=S.y[i]-S.y[bj];o.ecart.push([Math.round(s9),Math.round(lat),Math.round(dh)]);if(lat<120&&dh<o.dh){o.dh=Math.round(dh);o.lat=Math.round(lat);o.cote=Math.sign((S.x[bj]-S.x[i])*-S.tz[i]+(S.z[bj]-S.z[i])*S.tx[i]);}}
    C.rac.push(o);}
  C.cou=(sQ.etroit0!=null&&sQ.etroit1!=null)?[sQ.etroit0,sQ.etroit1]:null;C.couT=null;
  C.mine=(sQ.mine0!=null&&sQ.mine1!=null&&sQ.mine1-sQ.mine0>200)?[sQ.mine0,sQ.mine1]:null;C.mineT=null; // LA MINE abandonnée (cyMine)
  if(D9&&!D9.mine.la)C.mine=null; // (2026-10-20) le tirage : parfois la mine n'a jamais été creusée (les deux grandes courbes restent, à ciel ouvert)
  C.tun=[Math.max(0,L-CY_TUN.l),L+60];C.tunT=null; // LE TUNNEL d'arrivée : ses derniers mètres de route (et un peu au-delà du bout)
  C.S=S;C.ms={ech:Math.round(performance.now()-t0)};
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'canyonSoir']||BIOMES.canyonSoir,cA=bio9.cyA||[6,-110,0,0];
  const opt={K:K,seed:seed,L:L,RH:ROAD_HALF,sQ:sQ,sun:[cA[0],cA[1]],deco:D9,pal:{cyPlat:PAL.b('cyPlat',64),cyFin:PAL.b('cyFin',12),cyOmbre:PAL.b('cyOmbre',27),cyChem:PAL.b('cyChem',300)}};
  C.t0=t0;
  if(av){cyAvPart(seed,C,S,opt);return;} // (LE CANYON D'AVANCE) rien n'est écrit dans CY : le passage reprendra tout (cyAvPrend)
  Object.assign(CY,C);
  const W=started&&!/[?&]cyw=0\b/.test(location.search)?cyTravailleur():null;
  if(W){const job=CY.job;CY.attente={job:job,pour:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz,rnd:CY.rnd});return;}catch(e){console.warn('canyon : travailleur',e);CY.attente=null;}}
  cyMondePose(cyMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function cyTravailleur(){if(CY.w!==undefined)return CY.w;
  try{const fns=[mulberry32,cyNz,cyBil,cyButteDe,cyButtesH,cyHauteur,cyHauteurVite,cyProfil,cyOmbre,cyMitaines,cyMonuPrevoir,cyMondeCalc].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var CY={},CY_O9={},L=0,ROAD_HALF=28,PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};\n"+fns+
      "\nonmessage=function(e){var m=e.data;CY={nz:m.nz,rnd:m.rnd};PAL.B=m.opt.pal;L=m.opt.L;ROAD_HALF=m.opt.RH;var R=cyMondeCalc(m.S,m.opt);R.job=m.job;"+
      "postMessage(R,[R.Z.d.buffer,R.F.c.buffer,R.F.m.buffer,R.O.h.buffer,R.qw.d.buffer,R.bg.i.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const R=e.data;
      if(CY.av&&R.job===CY.av.job){CY.av.R=R;CY.av.ms=Math.round(performance.now()-CY.av.t0);return;} // (LE CANYON D'AVANCE) le monde d'en face attend le passage
      const A=CY.attente;if(!A||R.job!==A.job||A.pour!==CY.job)return;CY.attente=null;try{cyMondePose(R);}catch(er){console.warn('canyon : pose',er);}};
    W.onerror=function(e){console.warn('canyon : travailleur en erreur',e.message);CY.w=null;CY.av=null;const a=CY.attente;CY.attente=null;if(a&&a.pour===CY.job)try{cyMondePose(cyMondeCalc(a.S,a.opt));}catch(er){console.warn('canyon',er);}};
    CY.w=W;}catch(e){CY.w=null;}
  return CY.w;}
/* LE MONDE (ici ou dans le travailleur) : n'utilise que CY.nz, CY.rnd, ses arguments et les fonctions recopiées — rend tout ce que la pose
   et la collision lisent */
function cyMondeCalc(S,opt){
  const K=opt.K,sQ=opt.sQ,NS=S.n,DS=S.ds,x0=S.bb[0],x1=S.bb[1],z0=S.bb[2],z1=S.bb[3],reach=S.reach,RE=S.RE,ms={},r=mulberry32((opt.seed^0x51ED7A)>>>0);
  // ---- 4. LE PLATEAU (grossier, jusqu'à 7,5 km) : la marche de l'escalier, le fond (pour la brume et l'ombre du ciel), la densité de buttes, la roche des escarpements ----
  const t1=performance.now(),TZ=PAL.b('cyPlat',64),MZ=7500,STP=250*Math.sqrt(K);
  const Z={ts:TZ,x0:x0-MZ,z0:z0-MZ},znx=Math.ceil((x1-x0+2*MZ)/TZ)+1,znz=Math.ceil((z1-z0+2*MZ)/TZ)+1;Z.nx=znx;Z.nz=znz;
  const zi=new Int32Array(znx*znz).fill(-1),zd=new Float32Array(znx*znz).fill(1e18),RZ=1500;
  for(let i=0;i<NS;i+=6){const cx=(S.x[i]-Z.x0)/TZ,cz=(S.z[i]-Z.z0)/TZ,rr=Math.ceil(RZ/TZ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(znz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(znx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,d2=(ex*ex+ez*ez)*TZ*TZ;if(d2>RZ*RZ)continue;const o=jz*znx+jx;if(d2<zd[o]){zd[o]=d2;zi[o]=i;}}}
  for(let o=0;o<zd.length;o++)if(zi[o]>=0)zd[o]=Math.sqrt(zd[o]);
  {let X9=0,Z9=0;const pr=(o,o2)=>{const i=zi[o2];if(i<0||i===zi[o])return;const ex=X9-S.x[i],ez=Z9-S.z[i],d=ex*ex+ez*ez;if(d<zd[o]*zd[o]){zd[o]=Math.sqrt(d);zi[o]=i;}}; // le plus proche, propagé à tout le plateau (deux passes)
   for(let jz=0;jz<znz;jz++){Z9=Z.z0+jz*TZ;for(let jx=0;jx<znx;jx++){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx>0)pr(o,o-1);if(jz>0){pr(o,o-znx);if(jx>0)pr(o,o-znx-1);if(jx<znx-1)pr(o,o-znx+1);}}}
   for(let jz=znz-1;jz>=0;jz--){Z9=Z.z0+jz*TZ;for(let jx=znx-1;jx>=0;jx--){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx<znx-1)pr(o,o+1);if(jz<znz-1){pr(o,o+znx);if(jx<znx-1)pr(o,o+znx+1);if(jx>0)pr(o,o+znx-1);}}}}
  const zdat=new Float32Array(znx*znz*4),rq=new Float32Array(znx*znz);
  let yMax=-1e9;
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,i=Math.max(0,zi[o]),x=Z.x0+jx*TZ,z=Z.z0+jz*TZ,d=zd[o];
    const hp=S.R[i]-S.F[i],wq=hp<150?0:hp>420?1:(hp-150)/270,Rd=S.R[i]+(150*(cyNz(x/5200,z/5200,0)-.5)+60*(cyNz(x/1700,z/1700,1)-.5))*wq,u=(Rd+STP*.5)/STP,fu=u-Math.floor(u),e=fu<.86?0:(fu-.86)/.14;
    rq[o]=Math.max(S.F[i]+4,Rd+((Math.floor(u)+e*e*(3-2*e))*STP-Rd)*wq); // L'ESCALIER : une marche tous les ~250 m (l'escarpement dans les derniers 14 %), seulement là où les parois sont hautes — la vallée reste plate, le plateau jamais sous la rivière
    zdat[o*4]=rq[o];zdat[o*4+1]=S.F[i]; // (l'ondulation du plateau, ±16 m et ±6 m, est ajoutée au SOMMET et dans cyHauteur : deux lectures de bruit de moins par case)
    zdat[o*4+2]=(S.V[i]*(d>650*K?1:d<330*K?0:(d-330*K)/(320*K))+.07*(d>2400?1:d<1200?0:(d-1200)/1200))*(opt.deco?opt.deco.buttes:1);if(zdat[o*4]>yMax)yMax=zdat[o*4];} // (2026-10-20) × la densité de buttes tirée
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,gx=(rq[jz*znx+Math.min(znx-1,jx+1)]-rq[jz*znx+Math.max(0,jx-1)])/(2*TZ),gz=(rq[Math.min(znz-1,jz+1)*znx+jx]-rq[Math.max(0,jz-1)*znx+jx])/(2*TZ);
    zdat[o*4+3]=Math.min(1,Math.sqrt(gx*gx+gz*gz)/.9);}
  Z.d=zdat;CY.Z=Z;
  // les BUTTES : chaque case de 760 m où il en naît une marque son voisinage (le shader ne les cherche que là où la densité est > 0,3 %)
  const CS=760,cx0=Math.floor(Z.x0/CS)-1,cx1=Math.floor((Z.x0+znx*TZ)/CS)+1,cz0=Math.floor(Z.z0/CS)-1,cz1=Math.floor((Z.z0+znz*TZ)/CS)+1;CY.buttes=[];
  const BG={cx0:cx0,cz0:cz0,nx:cx1-cx0+1,nz:cz1-cz0+1};BG.i=new Int32Array(BG.nx*BG.nz).fill(-1);CY.bg=BG;
  for(let cz=cz0;cz<=cz1;cz++)for(let cx=cx0;cx<=cx1;cx++){const b=cyButteDe(cx,cz);if(!b)continue;BG.i[(cz-cz0)*BG.nx+(cx-cx0)]=CY.buttes.length;CY.buttes.push(b);const rr=b.rad*1.95;
    for(let jz=Math.max(0,Math.floor((b.z-rr-Z.z0)/TZ));jz<=Math.min(znz-1,Math.ceil((b.z+rr-Z.z0)/TZ));jz++)for(let jx=Math.max(0,Math.floor((b.x-rr-Z.x0)/TZ));jx<=Math.min(znx-1,Math.ceil((b.x+rr-Z.x0)/TZ));jx++){const o=(jz*znx+jx)*4+2;if(zdat[o]<.004)zdat[o]=.004;}
    if(b.z0+b.ht>yMax)yMax=b.z0+b.ht;}
  ms.plat=Math.round(performance.now()-t1);
  // ---- 5. LA TAILLE FINE (12 m) : le lit, l'eau, les berges, les parois — et la ripisylve, l'écume ----
  const t2=performance.now(),TF=PAL.b('cyFin',12),ME=reach+80;
  const F={ts:TF,x0:x0-ME,z0:z0-ME},fnx=Math.ceil((x1-x0+2*ME)/TF)+1,fnz=Math.ceil((z1-z0+2*ME)/TF)+1;F.nx=fnx;F.nz=fnz;
  const fc=new Float32Array(fnx*fnz*2),fm=new Uint8Array(fnx*fnz*4);for(let o=0;o<fnx*fnz;o++){fc[o*2]=1e5;fc[o*2+1]=-1e5;}
  // la grille d'accès (32 m) : pour chaque case, les deux échantillons les plus proches de deux BRAS différents de la route
  const TQ=32,qnx=Math.ceil((fnx*TF)/TQ)+1,qnz=Math.ceil((fnz*TF)/TQ)+1,q1=new Int32Array(qnx*qnz).fill(-1),q2=new Int32Array(qnx*qnz).fill(-1),d1=new Float32Array(qnx*qnz).fill(1e9),d2=new Float32Array(qnx*qnz).fill(1e9),LEG=Math.round(560/DS);
  for(let i=0;i<NS;i+=4){const cx=(S.x[i]-F.x0)/TQ,cz=(S.z[i]-F.z0)/TQ,R9=RE[i]+48,rr=Math.ceil(R9/TQ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(qnz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(qnx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,dq=(ex*ex+ez*ez)*TQ*TQ;if(dq>R9*R9)continue;const d=Math.sqrt(dq),o=jz*qnx+jx;
      if(q1[o]<0||Math.abs(i-q1[o])<LEG){if(d<d1[o]){d1[o]=d;q1[o]=i;}}
      else if(d<d1[o]){q2[o]=q1[o];d2[o]=d1[o];q1[o]=i;d1[o]=d;}
      else if((q2[o]<0||Math.abs(i-q2[o])<LEG||d<d2[o])&&d<d2[o]){q2[o]=i;d2[o]=d;}}}
  const qw=new Float32Array(qnx*qnz);for(let jz=0;jz<qnz;jz++)for(let jx=0;jx<qnx;jx++){const x=F.x0+jx*TQ,z=F.z0+jz*TQ;qw[jz*qnx+jx]=(cyNz(x/260,z/260,1)-.5)*2+(cyNz(x/90,z/90,2)-.5)*.6;}
  CY.qw={d:qw,nx:qnx,nz:qnz,ts:TQ,x0:F.x0,z0:F.z0};
  const prof={},E9=opt.deco?opt.deco.eau:1;let nc=0; // (2026-10-20) E9 : la rivière tirée (pleine 1, basse 0,45, à sec 0 : un lit de sable, plus d'écume)
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const qo=Math.min(qnz-1,Math.round(jz*TF/TQ))*qnx+Math.min(qnx-1,Math.round(jx*TF/TQ));
    if(q1[qo]<0)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF;let best=1e9,bo=0,bdep=0,brk=0,bveg=0,bfo=0;
    for(let c=0;c<2;c++){const i0=c?q2[qo]:q1[qo];if(i0<0||(c&&d2[qo]>RE[i0]+48))continue;if(!cyProfil(S,RE,i0,x,z,prof))continue;
      if(prof.C<best){best=prof.C;bo=1;bdep=prof.dep;brk=prof.rk;bveg=prof.veg;bfo=prof.fo;}}
    if(!bo)continue;nc++;const o=jz*fnx+jx;fc[o*2]=best;
    fm[o*4]=Math.min(255,Math.round(bdep*10*E9));fm[o*4+1]=Math.round(brk*255);fm[o*4+2]=Math.round(bveg*255);fm[o*4+3]=Math.round(bfo*255*(E9>0?1:0));}
  F.c=fc;F.m=fm;CY.F=F;ms.fin=Math.round(performance.now()-t2);ms.texels=nc;
  cyMonuPrevoir(S,sQ,K,r,opt.deco);try{cyMitaines(S,F,sQ,K,r,opt.deco);}catch(e){}
  // ---- 6. L'OMBRE : la hauteur sous laquelle on est à l'ombre, balayée une fois dans le sens du soleil de l'heure ----
  const t3=performance.now();cyOmbre(opt.sun[0],opt.sun[1]);ms.ombre=Math.round(performance.now()-t3);
  let fMin=1e9;for(let i=0;i<NS;i++)if(S.F[i]<fMin)fMin=S.F[i];
  return {Z:Z,F:F,O:CY.O,qw:CY.qw,bg:BG,buttes:CY.buttes,arche:CY.arche,chem:CY.chem,mit:CY.mit,yMin:fMin-60,yMax:Math.max(yMax,CY.yMaxM)+60,ms:ms};
}
/* LA POSE : les données du monde dans CY (la collision), à la puce (quatre textures), les monuments — et le relief s'allume */
function cyMondePose(R){
  if(!CY.mat||!(LVL.cur&&LVL.cur.piste==='canyon'))return;const t4=performance.now();
  CY.Z=R.Z;CY.F=R.F;CY.O=R.O;CY.qw=R.qw;CY.bg=R.bg;CY.buttes=R.buttes;CY.arche=R.arche;CY.chem=R.chem||[];CY.mit=R.mit;CY.yMin=R.yMin;CY.yMax=R.yMax;Object.assign(CY.ms,R.ms);
  const F=R.F,Z=R.Z,O=R.O;
  const dt=(d,w,h,fmt,typ,inf)=>{const t=new THREE.DataTexture(d,w,h,fmt,typ);if(inf)t.internalFormat=inf;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  for(const k of ['tC','tM','tZ','tS'])if(CY[k])CY[k].dispose();
  CY.tC=dt(F.c,F.nx,F.nz,THREE.RGFormat,THREE.FloatType,'RG32F'); /* r128 ne connaît pas RG + flottant : sans le format nommé, la texture n'arrive JAMAIS à la puce (les parois disparaissaient) */CY.tM=dt(F.m,F.nx,F.nz,THREE.RGBAFormat,THREE.UnsignedByteType);
  CY.tZ=dt(Z.d,Z.nx,Z.nz,THREE.RGBAFormat,THREE.FloatType);CY.tS=dt(O.h,O.nx,O.nz,THREE.RedFormat,THREE.FloatType,'R32F');
  const U=CY.mat.uniforms;U.uTC.value=CY.tC;U.uTM.value=CY.tM;U.uTZ.value=CY.tZ;U.uTS.value=CY.tS;
  U.uFD.value.set(F.x0-F.ts*.5,F.z0-F.ts*.5,1/(F.nx*F.ts),1/(F.nz*F.ts));U.uFN.value.set(F.nx,F.nz);
  U.uZD.value.set(Z.x0-Z.ts*.5,Z.z0-Z.ts*.5,1/(Z.nx*Z.ts),1/(Z.nz*Z.ts));U.uZN.value.set(Z.nx,Z.nz);
  U.uSD.value.set(O.x0-O.ts*.5,O.z0-O.ts*.5,1/(O.nx*O.ts),1/(O.nz*O.ts));U.uSN.value.set(O.nx,O.nz);
  CY.on=true;CY.mesh.visible=true;
  try{cyMonuments(CY.job);}catch(e){console.warn('canyon : monuments',e);}
  CY.ms.pose=Math.round(performance.now()-t4);CY.ms.total=Math.round(performance.now()-(CY.t0||t4));
}
/* le profil en travers à la position (x, z), vu depuis l'échantillon i0 (affiné ±6 échantillons) — renvoie faux hors de portée */
function cyProfil(S,RE,i0,x,z,o){
  let bd=1e18,bj=-1,bu=0;const a=Math.max(0,i0-4),b=Math.min(S.n-2,i0+4);
  for(let j=a;j<=b;j++){const ax=S.x[j],az=S.z[j],dx=S.x[j+1]-ax,dz=S.z[j+1]-az,l2=dx*dx+dz*dz||1;let u=((x-ax)*dx+(z-az)*dz)/l2;u=u<0?0:u>1?1:u;
    const px=ax+dx*u-x,pz=az+dz*u-z,d=px*px+pz*pz;if(d<bd){bd=d;bj=j;bu=u;}}
  if(bj<0)return false;const j=bj,u=bu,j1=j+1,d=Math.sqrt(bd);
  if(d>RE[j]+20)return false;
  const tx=S.tx[j],tz=S.tz[j],side=((x-S.x[j])*tz-(z-S.z[j])*tx)>0?1:-1; // +1 = à droite de la route
  const v=1-u,wF0=(S.wF[j]*v+S.wF[j1]*u)*(1+side*(S.as[j]*v+S.as[j1]*u)),wR=S.wR[j]*v+S.wR[j1]*u,Fl=S.F[u<.5?j:j1],H=S.H[j]*v+S.H[j1]*u,wW=S.wW[j]*v+S.wW[j1]*u,zS=S.zS[j]*v+S.zS[j1]*u,zH=S.zH[j]*v+S.zH[j1]*u,aw=S.aw[j]*v+S.aw[j1]*u,s9=(j+u)*S.ds;
  const wF=zS<.5?Math.max(wF0,ROAD_HALF+5):wF0; // (2026-10-15) LE PIED DE PAROI ne passe jamais sous le bord + 5 m (sauf la fente des Étroits) : l'asymétrie, les alcôves et le 2e serrage s'additionnaient, la roche mordait la dalle
  const Q9=CY.qw,dd=d+(d>wR+4?cyBil(Q9.d,Q9.nx,Q9.nz,1,0,(x-Q9.x0)/Q9.ts+.5,(z-Q9.z0)/Q9.ts+.5)*aw:0)+zS*8*Math.sin(s9/36+side*1.3);
  o.dep=0;o.rk=0;o.veg=0;o.fo=0;
  if(dd<wR){const q=dd/wR;o.C=Fl-(1.2+2.6*(1-q*q));o.dep=Math.max(0,Fl-.7-o.C);o.fo=S.fo[j]*(1-q*.3);}
  else if(dd<wF){o.C=Fl+.10*(dd-wR)+1.6*(cyNz(x/40,z/40,3)-.5)*(1-zS);
    const vb=(dd>wR+1?1:0)*(dd<wR+34?1:Math.max(0,1-(dd-wR-34)/14))*(1-zS);o.veg=vb*(cyNz(x/60,z/60,0)>.42?1:.35);}
  else{const t=(dd-wF)/Math.max(8,wW),tt=Math.min(1,t);
    const gor=.5*Math.pow(tt,.75)+.5*(1-Math.pow(1-tt,1.8)),slot=Math.pow(tt,.45);
    o.C=Fl+H*(gor*(1-zS-zH)+slot*zS+tt*zH)+Math.max(0,dd-wF-wW)*2.4;o.rk=Math.min(1,t/.06);}
  return true;
}
/* la butte de la case (cx, cz) de 760 m — ou null : mêmes octets que le shader (CY.rnd au texel, la densité du plateau au texel du centre) */
function cyButteDe(cx,cz){const Z=CY.Z,R=CY.rnd,N=256,i0=((cx%N)+N)%N,j0=((cz%N)+N)%N,o=(j0*N+i0)*4;
  const ctx=(cx+.22+.56*R[o+1]/255)*760,ctz=(cz+.22+.56*R[o+2]/255)*760;
  const zx=Math.max(0,Math.min(Z.nx-1,Math.floor((ctx-(Z.x0-Z.ts*.5))/Z.ts))),zz=Math.max(0,Math.min(Z.nz-1,Math.floor((ctz-(Z.z0-Z.ts*.5))/Z.ts))),dc=Z.d[(zz*Z.nx+zx)*4+2];
  if(dc<.01||R[o]/255>dc*.85)return null;
  const i2=(((cx+101)%N)+N)%N,j2=(((cz+37)%N)+N)%N,o2=(j2*N+i2)*4,r1=R[o2]/255,r2=R[o2+1]/255;
  const rad=70+200*r1*r1,ht=(150+300*r2)*(rad<115?1.3:1);
  return {x:ctx,z:ctz,rad:rad,ht:ht,z0:Z.d[(zz*Z.nx+zx)*4],p3:R[o2+2]/255,p4:R[o2+3]/255};}
/* LE BALAYAGE DE L'OMBRE (grille de 18 m sur le domaine fin) : hS(p) = max(H, hS) relu 2 cases plus près du soleil − 2 cases × tan(hauteur).
   On parcourt les colonnes (ou les rangées) depuis le côté du soleil : la case relue est toujours déjà faite. */
function cyOmbre(elDeg,azDeg){const F=CY.F,TS=PAL.b('cyOmbre',27),nx=Math.ceil(F.nx*F.ts/TS)+1,nz=Math.ceil(F.nz*F.ts/TS)+1,O={ts:TS,x0:F.x0,z0:F.z0,nx:nx,nz:nz};
  const H=new Float32Array(nx*nz),M=new Float32Array(nx*nz),hS=new Float32Array(nx*nz);
  for(let jz=0;jz<nz;jz++)for(let jx=0;jx<nx;jx++)H[jz*nx+jx]=cyHauteurVite(O.x0+jx*TS,O.z0+jz*TS);
  const lever=(x,z,rr,y)=>{const i0=Math.max(0,Math.floor((x-rr-O.x0)/TS)),i1=Math.min(nx-1,Math.ceil((x+rr-O.x0)/TS)),j0=Math.max(0,Math.floor((z-rr-O.z0)/TS)),j1=Math.min(nz-1,Math.ceil((z+rr-O.z0)/TS));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const dx=O.x0+jx*TS-x,dz=O.z0+jz*TS-z;if(dx*dx+dz*dz<=rr*rr){const o=jz*nx+jx;if(y>H[o])H[o]=y;}}};
  if(CY.arche)for(const p of CY.arche.P)lever(p.x,p.z,CY.arche.W*.5,p.y+CY.arche.T*.5); // l'arche et les cheminées ombrent ce qui est dessous
  for(const c of CY.chem||[])lever(c.x,c.z,c.r,c.y+c.h);
  const el=Math.max(1,elDeg)*Math.PI/180,az=azDeg*Math.PI/180,sx=Math.sin(az),sz=Math.cos(az),te=Math.tan(el)*2*TS,sh=2;
  const bil=(fx,fz)=>{const i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=nx-1||j>=nz-1){const ci=Math.max(0,Math.min(nx-1,Math.round(fx))),cj=Math.max(0,Math.min(nz-1,Math.round(fz)));return H[cj*nx+ci];}
    const u=fx-i,v=fz-j,a=M[j*nx+i],b=M[j*nx+i+1],c=M[(j+1)*nx+i],d=M[(j+1)*nx+i+1];return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;};
  const fait=(jx,jz)=>{const o=jz*nx+jx,v=bil(jx+sx*sh,jz+sz*sh)-te;hS[o]=v;M[o]=Math.max(H[o],v);};
  if(Math.abs(sx)>=Math.abs(sz)){const dx=sx>0?-1:1;for(let jx=sx>0?nx-1:0;jx>=0&&jx<nx;jx+=dx)for(let jz=0;jz<nz;jz++)fait(jx,jz);}
  else{const dz=sz>0?-1:1;for(let jz=sz>0?nz-1:0;jz>=0&&jz<nz;jz+=dz)for(let jx=0;jx<nx;jx++)fait(jx,jz);}
  O.h=hS;CY.O=O;}
/* LA HAUTEUR DU RELIEF — la même que la puce (cyHt du shader), lue dans les mêmes données. `o` (facultatif) reçoit la roche, l'eau, le fond.
   `sans` : sans les corniches (le balayage de l'ombre). */
const CY_O9={};
function cyBil(d,nx,nz,stride,ch,px,pz){const qx=px-.5,qz=pz-.5,i=Math.floor(qx),j=Math.floor(qz),fx=qx-i,fz=qz-j,c=(a,b)=>d[(Math.max(0,Math.min(nz-1,b))*nx+Math.max(0,Math.min(nx-1,a)))*stride+ch];
  const A=c(i,j),B9=c(i+1,j),C9=c(i,j+1),D9=c(i+1,j+1);return (A+(B9-A)*fx)*(1-fz)+(C9+(D9-C9)*fx)*fz;}
function cyHauteur(x,z,o,sans){const Z=CY.Z,F=CY.F;o=o||CY_O9;
  const zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts,P0=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz);o.fond=cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz);
  let P=P0+(16*(cyNz(x/620,z/620,2)-.5)+6*(cyNz(x/190,z/190,3)-.5))*Math.max(0,Math.min(1,(P0-o.fond)/200)),rk=cyBil(Z.d,Z.nx,Z.nz,4,3,zx,zz);o.plat=P;o.eau=0;
  if(cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz)>.003){const r9={rk:rk};P+=cyButtesH(x,z,r9);rk=r9.rk;}
  let h=P,dep=0,cb=1e5;
  const fx=(x-(F.x0-F.ts*.5))/(F.nx*F.ts),fz=(z-(F.z0-F.ts*.5))/(F.nz*F.ts);
  if(fx>0&&fz>0&&fx<1&&fz<1){const px=fx*F.nx,pz=fz*F.nz,c=cyBil(F.c,F.nx,F.nz,2,0,px,pz),g=cyBil(F.c,F.nx,F.nz,2,1,px,pz);
    if(c<P+8||g>P-8){const mg=cyBil(F.m,F.nx,F.nz,4,1,px,pz)/255;
      if(c<P+8){const k=Math.max(0,Math.min(1,(P-c)/6+.5));rk=rk+(mg-rk)*k;h=Math.min(P,c);dep=cyBil(F.m,F.nx,F.nz,4,0,px,pz)/10*k;cb=c;}
      if(g>h){h=g;rk=mg;dep=0;}}}
  if(!sans&&rk>.01){const n0=cyNz(x/2300,z/2300,0),n1=cyNz(x/2300,z/2300,1),S9=15+11*n0,of=70*n1,u=(h+of)/S9,f=u-Math.floor(u),e=f<.5?0:f>.93?1:((f-.5)/.43)*((f-.5)/.43)*(3-2*(f-.5)/.43);
    h=h+(((Math.floor(u)+e)*S9-of)-h)*rk;}
  if(dep>.03){const W=cb+dep;if(W>h){o.eau=1;h=W;}}
  o.rk=rk;return h;}
function cyHauteurVite(x,z){const Z=CY.Z,F=CY.F,zx=(x-(Z.x0-Z.ts*.5))/Z.ts,zz=(z-(Z.z0-Z.ts*.5))/Z.ts;let P=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz);
  if(cyBil(Z.d,Z.nx,Z.nz,4,2,zx,zz)>.003)P+=cyButtesH(x,z,CY_O9);
  const px=(x-(F.x0-F.ts*.5))/F.ts,pz=(z-(F.z0-F.ts*.5))/F.ts;if(px>0&&pz>0&&px<F.nx&&pz<F.nz){const i=Math.floor(px),j=Math.floor(pz),o=(j*F.nx+i)*2,c=F.c[o],g=F.c[o+1];if(c<P)P=c;if(g>P)P=g;}
  return P;}
function cyButtesH(x,z,o){const CS=760,c0x=Math.floor(x/CS),c0z=Math.floor(z/CS),BG=CY.bg;let hb=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const gx=c0x+i-BG.cx0,gz=c0z+j-BG.cz0;if(gx<0||gz<0||gx>=BG.nx||gz>=BG.nz)continue;const bi=BG.i[gz*BG.nx+gx];if(bi<0)continue;const b=CY.buttes[bi];
    const qx=x-b.x,qz=z-b.z,an=Math.atan2(qz,qx);let d=Math.hypot(qx,qz)/b.rad;d*=1+.10*Math.sin(an*3+b.p3*6.2832)+.05*Math.sin(an*7+b.p4*6.2832);
    const bb=d<.9?1:(d<1.05?1-.72*(d-.9)/.15:.28*Math.pow(Math.max(0,1-(d-1.05)/.85),2)),hh=bb*b.ht;
    if(hh>hb){hb=hh;o.rk=Math.max(o.rk,d<.86?.2:(d<1.12?1:.45));}}
  return hb;}
/* (2026-10-15, Sacha : « retravaille les textures du canyon, des trucs plus lisses avec des couleurs plus saturées ») LA ROCHE LISSE :
   le grain fin (5 m), le bruit de 31 m et le litage sombre tous les 2,4 m faisaient du SABLE à l'écran — ils sont ramenés à un souffle, la
   variation passe au bruit large (170 m) ; les bruits et les strates ont leurs MIPMAPS (plus de scintillement au loin) ; la pierre et le
   sable sont SATURÉS (×1,32 autour de la luminance), le maquis plus vert. Les hauteurs ne bougent pas (le sommet lit toujours le niveau 0).
   */
/* ---- LE TERRAIN À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const CY_VS=['attribute vec4 aN;uniform sampler2D uTC,uTM,uTZ,uTS,uRND,uNZ;uniform vec4 uFD,uZD,uSD;uniform vec2 uFN,uZN,uSN;uniform vec3 uCam;uniform float uG,uR0;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_vertex>',
  'vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}',
  'float gF,gP,gV,gO;',
  'float cyButte(vec2 x,inout float rk){const float CS=760.;vec2 c0=floor(x/CS);float hb=0.;',
  '  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=c0+vec2(float(i),float(j));vec4 R=texture2D(uRND,(mod(c,256.)+.5)/256.);',
  '    vec2 ct=(c+.22+.56*R.yz)*CS;vec2 zq=clamp(floor((ct-uZD.xy)*uZD.zw*uZN),vec2(0.),uZN-1.);float dc=texture2D(uTZ,(zq+.5)/uZN).b;',
  '    if(dc<.01||R.x>dc*.85)continue;vec4 R2=texture2D(uRND,(mod(c+vec2(101.,37.),256.)+.5)/256.);',
  '    float rad=70.+200.*R2.x*R2.x,ht=(150.+300.*R2.y)*(rad<115.?1.3:1.);vec2 q=x-ct;float an=atan(q.y,q.x),d=length(q)/rad;',
  '    d*=1.+.10*sin(an*3.+R2.z*6.2832)+.05*sin(an*7.+R2.w*6.2832);',
  '    float b=d<.9?1.:(d<1.05?1.-.72*(d-.9)/.15:.28*pow(max(0.,1.-(d-1.05)/.85),2.));float hh=b*ht;if(hh>hb){hb=hh;rk=max(rk,d<.86?.2:(d<1.12?1.:.45));}}',
  '  return hb;}',
  'vec4 cyHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float rk=Z.a,P=Z.r+(16.*(texture2D(uNZ,x/620.).b-.5)+6.*(texture2D(uNZ,x/190.).a-.5))*clamp((Z.r-Z.g)/200.,0.,1.);if(Z.b>.003)P+=cyButte(x,rk);',
  '  float h=P,dep=0.,cb=1e5;gF=Z.g;gP=Z.r;gV=0.;gO=0.;vec2 fp=(x-uFD.xy)*uFD.zw;',
  '  if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);',
  '    if(C.r<P+8.||C.g>P-8.){vec4 M=tB(uTM,fp*uFN,uFN);',
  '      if(C.r<P+8.){float k=clamp((P-C.r)/6.+.5,0.,1.);rk=mix(rk,M.g,k);h=min(P,C.r);dep=M.r*25.5*k;cb=C.r;gV=M.b*k;gO=M.a*k;}',
  '      if(C.g>h){h=C.g;rk=M.g;dep=0.;}}}',
  '  if(rk>.01){vec4 n=texture2D(uNZ,x/2300.);float S=15.+11.*n.r,o=70.*n.g,u=(h+o)/S,f=fract(u);h=mix(h,(floor(u)+smoothstep(.50,.93,f))*S-o,rk);}',
  '  float w=0.;if(dep>.03){float W=cb+dep;if(W>h){w=clamp((W-h)*3.,0.,1.);h=W;}}',
  '  return vec4(h,rk,w,dep);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=cyHt(x);float fl=gF,pl=gP,vg=gV,fo=gO,e=S/uG*(1.+k)*'+('2.2')+';',
  '  float hx=cyHt(x+vec2(e,0.)).x,hz=cyHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-4.,hs+10.,A.x);}',
  '  vA=vec4(A.z,A.w,A.y,lit);vB=vec4(vg,fo,clamp((pl-A.x)/max(pl-fl,40.),0.,1.),fl);',
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
/* ===== LA ROCHE VIVANTE (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map ») ===== le relief gagne, dans CE MÊME programme (aucun de plus), de la matière,
   de la lumière et de la profondeur — le niveau de détail CYD vient du palier [ANCIEN, MOYEN, RÉCENT] (le RÉCENT est ce qui est conçu) :
   · 0 : la LUEUR D'ALTITUDE seule (de l'arithmétique : le haut des parois attrape le soleil rasant, le bas reste dans le violet — deux températures) ;
   · 1 : + la dérive de teinte de la roche (chaude ↔ froide, au km), les CANNELURES verticales des falaises (une lecture de bruit de plus) et les FILONS D'OR rares ;
   · 2 : + le relief fin (la normale tordue par ces cannelures : la lumière rasante y accroche des arêtes), les FISSURES sombres et l'air d'ÉLOIGNEMENT (le lointain plus clair et plus froid). */
const CYD=PAL.b('cyDet',2);
const CY_FS=['uniform sampler2D uNZ,uSTR;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uBnc,uRkT,uWS,uWD,uSkH,uSkZ,uMist,uMud,uPhP,uPhD,uPhC;uniform vec4 uQ;uniform float uTime,uFlash,uWet;',
  'varying vec3 vW,vN;varying vec4 vA,vB;','#include <fog_pars_fragment>',
  'float gCs;', /* (2026-10-25, Sacha : « retravaille les textures, inspire-toi de la forêt : des gros pixels, mais lisses ») LES GROS PIXELS DE LA ROCHE : gCs = la case sous ce pixel (~10 px d'écran, par paliers doublés fondus l'un dans l'autre) */
  'vec4 tl(sampler2D t,vec2 uv,float sh){return texture2DLodEXT(t,uv,max(log2(gCs*256.*sh),0.));}', /* une lecture au niveau de mip de la case : elle montre la MOYENNE de ce qu'elle couvre (pas de trait aux arêtes, pas de grésillement) */
  'float dhc(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'vec4 twp(sampler2D t,vec3 w,float k,float sh,float sv){return mix(tl(t,vec2(w.x*sh,w.y*sv),sh),tl(t,vec2(w.z*sh,w.y*sv),sh),k);}', /* une paroi lue par ses deux plans fixes (x·y et z·y), mélangés selon la normale */
  'void main(){vec3 N=normalize(vN),Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/max(dist,.001);',
  '  float wat=vA.x,dep=vA.y,rk=clamp(vA.z,0.,1.),lit=clamp(vA.w,0.,1.),veg=vB.x,fo=vB.y,dk=clamp(vB.z,0.,1.),fl=vB.w,stp=clamp(1.-N.y,0.,1.);',
  '  float Lq=log2(max(dist*.012,.6)/.6),lq=floor(Lq),wq=Lq-lq,s0=.6*exp2(lq);gCs=s0*(1.+wq);vec3 c0=floor(vW/s0),c1=floor(vW/(s0*2.)),Wq=mix((c0+.5)*s0,(c1+.5)*s0*2.,wq),Pc=Wq+(vW-Wq)*.3;', /* la position lue AU CENTRE de sa case (aux 3/10 près : lisse) ; deux grilles, la fine et la double, fondues */
  '  vec3 f0=fract(vW/s0),f1=fract(vW/(s0*2.)),e0=min(f0,1.-f0),e1=min(f1,1.-f1);float eg=mix(smoothstep(0.,.16,min(e0.x,min(e0.y,e0.z))),smoothstep(0.,.16,min(e1.x,min(e1.y,e1.z))),wq),hq=mix(dhc(c0),dhc(c1+57.),wq);', /* le bord de la case (un peu dans l'ombre) · sa nuance */
  '  float wX=abs(N.x)/(abs(N.x)+abs(N.z)+.001),wl=smoothstep(.10,.30,stp);vec4 n0=tl(uNZ,Pc.xz/2600.,1./2600.),n1=mix(tl(uNZ,Pc.xz/170.,1./170.),twp(uNZ,Pc,wX,1./170.,1./170.),wl),n2=mix(tl(uNZ,Pc.xz/31.,1./31.),twp(uNZ,Pc,wX,1./31.,1./31.),wl),nv=twp(uNZ,Pc,wX,1./140.,1./70.);', /* sur une paroi le bruit se déroule le long du mur : plus de fenêtres étirées. (2026-10-25, Sacha : « la texture grésille, des spirales, des traits ») l'ancien axe `dot(position, tangente de la normale)` tournait d'un pixel à l'autre (spirales) et partait au hasard sur les surfaces presque plates (grésillement) : on mélange maintenant les LECTURES des deux plans fixes x/z */
  ...(CYD>=1?['  vec4 nf=mix(tl(uNZ,vec2(Pc.x/17.,Pc.y/89.),1./17.),tl(uNZ,vec2(Pc.z/17.,Pc.y/89.),1./17.),wX);float fx=wl*rk*(1.-smoothstep(200.,700.,dist));vec3 Tg=normalize(vec3(-N.z,0.,N.x)+vec3(1e-4,0.,1e-4));'+'']:[]),
  /* LES STRATES : la colonne relue à la hauteur, gondolée par deux bruits (les couches ondulent et plongent doucement) */
  '  float sy=(Pc.y+34.*(n0.r-.5)+4.*(n1.g-.5))/'+('3.7')+';vec4 st=texture2DLodEXT(uSTR,vec2(.5,sy/1024.),max(log2(gCs/3.7),0.));'+('vec3 rc=st.rgb*st.rgb*(.95+.10*n1.b);rc=max(mix(vec3(dot(rc,vec3(.3,.55,.15))),rc,1.32),0.);'),
  ...(CYD>=1?['  rc*=vec3(1.+.35*(n0.g-.5),1.,1.-.42*(n0.g-.5));rc*=1.+(nf.g-.5)*.62*fx;']:[]), /* la dérive de teinte au kilomètre (chaud ↔ froid) · les cannelures : des bandes verticales plus claires, plus sombres */
  ...(CYD>=2?['  rc*=1.-.30*(1.-smoothstep(0.,.03,abs(nf.b-.5)))*fx;']:[]), /* les fissures : de fines lignes sombres, verticales */
  '  float lb=fract(Pc.y*.42+n1.b*.6);rc*=1.-'+('(.025+.035*st.a)*smoothstep(.65,1.,lb)*(1.-smoothstep(120.,420.,dist))')+'*rk;', // le litage des grès, horizontal (fondu au loin : des rayures de 2,4 m moiraient)
  '  float vr=smoothstep(.55,.82,nv.r)*smoothstep(.35,.8,stp)*rk;rc=mix(rc,rc*vec3(.74,.62,.60),vr*.28);', // le VERNIS du désert
  '  vec3 sab='+('vec3(.95,.50,.29)*(.96+.08*n1.r)')+';float top=smoothstep(.72,.9,N.y);vec3 col=mix(rc,mix(rc,sab,.62),top*rk);',
  '  col=mix(col,'+('vec3(.10,.19,.03),smoothstep(.64,.86,n1.a)*top*.55')+');', // le maquis sur les replats
  '  float bas=1.-smoothstep(.2,.5,rk);vec3 sol=sab*('+('.98+.03*(1.-smoothstep(60.,240.,dist))')+'*sin(dot(Pc.xz,vec2(.83,.41))*1.6+n2.g*5.));col=mix(col,sol,bas*(1.-wat));',
  '  col=mix(col,mix(vec3(.05,.10,.03),vec3(.16,.24,.06),n1.r),veg*smoothstep(.42,.58,n2.g)*(1.-wat));', // la ripisylve
  '  col*=uRkT*(1.-.35*uWet*(1.-wat));',
  '  col*=(.90+.20*hq)*mix(.84,1.,eg);', /* chaque case sa nuance (±10 %), son bord un peu dans l'ombre : on lit les gros pixels, comme les mini-cubes de la forêt */
  ...(CYD>=2?['  vec3 Nb=normalize(N+fx*((nf.g-.5)*1.4*Tg+(nf.r-.5)*.8*vec3(0.,1.,0.)));']:['  vec3 Nb=N;']), /* le relief fin : la normale tordue par les cannelures (la lumière rasante y accroche des arêtes) */
  '  Nb=normalize(Nb+(mix(vec3(dhc(c0+3.1),dhc(c0+7.7),dhc(c0+11.3)),vec3(dhc(c1+60.),dhc(c1+64.),dhc(c1+68.)),wq)-.5)*.2*rk);', // chaque case sa facette : elle attrape la lumière à sa façon
  '  float ndl=max(dot(Nb,uSunD),0.);',
  '  vec3 Lc=uSunC*ndl*lit+mix(uGnd,uSky,N.y*.5+.5)*(1.-.5*dk)+uBnc*(1.-.65*lit)*(.35+.65*dk)*(.55+.45*stp)+uFillC*max(dot(N,uFillD),0.)*.6+(uSunC*.10+uSky*.22+uBnc*.18)*(.55+.45*stp);', /* le plancher : l'ombre d'un désert reste claire (ciel + rebond), jamais noire */
  '  Lc+=uSunC*vec3(1.,1.1,1.2)*(1.-smoothstep(.04,.5,uSunD.y))*pow(1.-smoothstep(.1,.9,dk),1.4)*(1.-lit)*(.4+.6*stp)*rk*'+(CYD>=1?'.42':'.26')+';', /* LA LUEUR D'ALTITUDE : le soleil rasant n'atteint pas le fond, mais le HAUT des parois en garde la lueur (dorée, un peu rose) ; le bas reste dans le violet */
  '  if(dist<220.){float gr=twp(uNZ,Pc,wX,1./5.3,1./5.3).g*wl+tl(uNZ,Pc.xz/5.3,1./5.3).g*(1.-wl);col*=1.+(gr-.5)*'+('.06')+'*(1.-smoothstep(90.,220.,dist));}',
  '  vec3 c=max(col*Lc,col*vec3(.36,.26,.25)*(.5+.5*lit)+col*uSky*.22);', /* jamais de noir franc : un grès à l'ombre reste brun */
  '  c*=mix(vec3(1.),vec3(.80,.70,1.04),(1.-lit)*.55*rk);', // l'ombre de la roche tire au VIOLET (la bible)
  ...(CYD>=1?['  {float vz=smoothstep(.60,.80,n0.b)*(1.-smoothstep(0.,.014,abs(n1.r-.5)))*fx;c+=vec3(1.,.72,.22)*vz*(.55+.45*sin(uTime*2.1+n1.g*40.))*(.30+.70*lit);}']:[]), /* LES FILONS D'OR : de rares veines (un cinquième des falaises, une ligne tous les 40 m) qui brillent par moments */
  '  if(wat>.01){vec4 nw=texture2D(uNZ,vW.xz/16.+uTime*vec2(.021,.033)),nw2=texture2D(uNZ,vW.xz/41.-uTime*vec2(.013,.008));',
  '    vec3 Nw=normalize(N*3.+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.)*(1.-stp));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.5));wc=mix(wc,uMud,uQ.w);',
  '    float fr=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));sk=mix(sk,uBnc*1.6+col*.4,dk*.55);',
  '    vec3 cw=wc*(uSunC*(.25+.75*ndl)*lit+mix(uGnd,uSky,.7))*.9+sk*fr+uSunC*pow(max(dot(R,uSunD),0.),180.)*2.*lit;',
  '    float ec=max(fo,smoothstep(.22,.55,stp)),sk2=smoothstep(.35,.75,texture2D(uNZ,vec2(dot(vW.xz,normalize(vec2(-N.z,N.x)+1e-4))/23.,vW.y/31.+uTime*.55)).r);',
  '    cw=mix(cw,vec3(.92,.94,.95)*(mix(uGnd,uSky,.6)+uSunC*.7*lit),clamp(ec*(.55+.45*sk2)+smoothstep(1.2,.2,dep)*.25,0.,1.));c=mix(c,cw,wat);}',
  '  if(uWet>.01&&wat<.5){vec2 ce=floor(vW.xz/40.),cc=(ce+.2+.6*vec2(fract(sin(dot(ce,vec2(12.9,78.2)))*43758.5),fract(sin(dot(ce,vec2(39.3,11.7)))*43758.5)))*40.;',
  '    float hf=fract(sin(dot(ce,vec2(7.1,113.3)))*43758.5),dd=length(vW.xz-cc),cf=step(hf,.20*uWet)*(1.-smoothstep(1.8,4.5,dd))*smoothstep(.45,.75,stp)*rk;',
  '    float fs=smoothstep(.30,.80,texture2D(uNZ,vec2(dd*.09+hf,vW.y/38.+uTime*1.25)).g);c=mix(c,vec3(.80,.84,.88)*(mix(uGnd,uSky,.6)*1.2+uSunC*.4),cf*(.45+.55*fs));',
  '    c*=1.-.25*uWet*smoothstep(.55,.8,nv.g)*stp*rk;}', // et les coulées sombres de l'averse sur la pierre
      '  c+=uFlash*col*vec3(.70,.76,1.)*(.35+.65*max(N.y,0.));',
      '  if(uPhC.r+uPhC.g>.001){vec3 lv=vW-uPhP;float dl=length(lv);vec3 ld=lv/max(dl,.01);c+=col*uPhC*smoothstep(.80,.95,dot(ld,uPhD))*max(dot(N,-ld),0.)/(1.+dl*dl/9000.);}', // les PHARES sur la roche
  '  c*=1.-.24*smoothstep(.45,.85,uSunD.y)*smoothstep(.55,1.3,max(c.r,max(c.g,c.b)));', /* le plein midi : les hautes lumières crème des parois sont rabattues vers l'ocre (le soleil bas, lui, n'est pas touché) */
  ...(CYD>=2?['  {float lo=smoothstep(700.,5200.,dist);c=mix(c,c*vec3(.80,.86,1.10)+uSkH*.07,lo*.38);}']:[]), /* trois plans : le proche chaud et contrasté, le lointain plus clair et plus froid, fondu dans la brume pêche */
  '  c=mix(c,uMist,uQ.x*(1.-smoothstep(fl+4.,fl+uQ.y,vW.y))*(.35+.65*smoothstep(0.,450.,dist)));',
  '  c+=uWet*(1.-wat)*mix(uSkH,uSkZ,.5)*pow(1.-max(dot(V,N),0.),4.)*.25;',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
function cyTerrain(){ if(CY.mesh)return;
  cyBruits();
  const G=PAL.b('cyGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];CY.G=G;CY.R0=PAL.b('cyR0',118);
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  CY.aN=new THREE.InstancedBufferAttribute(new Float32Array(CY.maxN*4),4);CY.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',CY.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);CY.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTM:{value:CY.tRnd},uTZ:{value:z1},uTS:{value:z1},uRND:{value:CY.tRnd},uNZ:{value:CY.tNz},uSTR:{value:CY.tStr},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:CY.R0},uTime:{value:0},uFlash:{value:0},uWet:{value:0},uSunD:{value:SUN_DIR},
    uSunC:{value:new THREE.Color()},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},uFillC:{value:new THREE.Color()},uFillD:{value:new THREE.Vector3(0,-1,0)},
    uBnc:{value:new THREE.Color()},uRkT:{value:new THREE.Color(1,1,1)},uWS:{value:new THREE.Color()},uWD:{value:new THREE.Color()},uSkH:{value:new THREE.Color()},uSkZ:{value:new THREE.Color()},
    uMist:{value:new THREE.Color()},uMud:{value:new THREE.Color(.42,.27,.17)},uQ:{value:new THREE.Vector4()},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  CY.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_VS,fragmentShader:CY_FS,fog:true});CY.mat.dispose=function(){};
  const m=new THREE.Mesh(g,CY.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='canyon';m.renderOrder=-1;scene.add(m);CY.mesh=m;
  const gr=new THREE.Group();gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);CY.grp=gr;
}
/* LE QUADTREE (CDLOD), à chaque rendu (scene.onBeforeRender, chaîné) : un nœud se dessine à son niveau s'il est hors de la portée du niveau
   plus fin ; sinon il descend dans ses quatre enfants — un enfant hors de SA portée se dessine au niveau de l'enfant, entièrement morphé
   (il a alors la densité de son parent : pas de fissure). Portée du niveau l : R0·2^l (2D) ; nœuds de 64 m au niveau 0. */
function cySelect(cam){const M=CY.mesh;if(!M||!M.visible)return;
  CY.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);CY.fr.setFromProjectionMatrix(CY.pm);
  const cx=cam.position.x,cz=cam.position.z,R0=CY.R0,A=CY.aN.array,MAX=CY.maxN,y0=CY.yMin,y1=CY.yMax,bx=CY.box,L9=CY.lods;let n=0;
  const dR=(x0,z0,s)=>{const dx=Math.max(x0-cx,0,cx-x0-s),dz=Math.max(z0-cz,0,cz-z0-s);return Math.sqrt(dx*dx+dz*dz);};
  const add=(x0,z0,s,l)=>{if(n>=MAX)return;const o=n*4;A[o]=x0;A[o+1]=z0;A[o+2]=s;A[o+3]=l;n++;};
  const sel=(x0,z0,s,l)=>{const d=dR(x0,z0,s);if(d>R0*Math.pow(2,l))return false;
    bx.min.set(x0,y0,z0);bx.max.set(x0+s,y1,z0+s);if(!CY.fr.intersectsBox(bx))return true;
    if(l===0||d>R0*Math.pow(2,l-1)){add(x0,z0,s,l);return true;}
    const h=s/2;for(let q=0;q<4;q++){const qx=x0+(q&1)*h,qz=z0+(q>>1)*h;if(!sel(qx,qz,h,l-1))add(qx,qz,h,l-1);}return true;};
  const SR=CY.S0*Math.pow(2,L9),reach=Math.min(R0*Math.pow(2,L9),(cam.far||9800)+400);
  for(let ix=Math.floor((cx-reach)/SR);ix<=Math.floor((cx+reach)/SR);ix++)for(let iz=Math.floor((cz-reach)/SR);iz<=Math.floor((cz+reach)/SR);iz++){
    if(dR(ix*SR,iz*SR,SR)>reach)continue;if(!sel(ix*SR,iz*SR,SR,L9))add(ix*SR,iz*SR,SR,L9);}
  CY.n=n;CY.geo.instanceCount=n;CY.aN.updateRange.offset=0;CY.aN.updateRange.count=n*4;CY.aN.needsUpdate=true;
  CY.mat.uniforms.uCam.value.copy(cam.position);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{if(CY.on)cySelect(cam);}catch(e){window.__cyErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* LE SOLEIL DE L'HEURE — dans la boucle, avant les ombres : SUN_DIR = SUN_DIR0 → la direction de `cyA` (hauteur, azimut depuis +z vers +x),
   au fondu du niveau. Hors du canyon : SUN_DIR0 recopié au bit près (et ses deux vecteurs de base recalculés par les MÊMES opérations). */
function canyonSoleil(){const k=LVL.canyon||0,kv=VIT.solK||0; // (2026-10-17) + LA VILLE VITRÉE : le soleil de son heure (VIT_MET.sol) ; ailleurs, inchangé au bit près
  if(k<.001&&kv<.001){if(!SUN_DIR.equals(SUN_DIR0)){SUN_DIR.copy(SUN_DIR0);SUN_PERP.crossVectors(SUN_DIR,CY_UP).normalize();SUN_UP.crossVectors(SUN_PERP,SUN_DIR).normalize();
    RIM_DIR.copy(SUN_DIR).lerp(KICK_DIR,BIO.cur.rimK).normalize();}return;}
  const a=k>=kv?(BIO.cur.cyA||[6,-110,0,0]):VIT.sol,el=a[0]*Math.PI/180,az=a[1]*Math.PI/180;CY_SD.set(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  SUN_DIR.copy(SUN_DIR0).lerp(CY_SD,Math.max(k,kv)).normalize();SUN_PERP.crossVectors(SUN_DIR,CY_UP).normalize();SUN_UP.crossVectors(SUN_PERP,SUN_DIR).normalize();
  RIM_DIR.copy(SUN_DIR).lerp(KICK_DIR,BIO.cur.rimK).normalize();}
/* chaque image : les lumières de la scène dans la matière du relief, l'ambiance du canyon (BIO.cur.cy*), l'éclair — et l'ombre des parois
   SUR LA CAISSE (la clé baisse quand on passe dans l'ombre, le ciel quand on s'enfonce : seuls écrits du soleil et de l'hémisphère hors de
   bioApply, et seulement dans le canyon — rendus à leur valeur d'ambiance en sortant). */
function canyonTick(dt){
  if(!CY.mat)return;const U=CY.mat.uniforms,c=BIO.cur,k=LVL.canyon||0;
  if(CY.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(CY.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const q=c.cyL||[1,.6,.4];U.uBnc.value.setRGB(q[0],q[1],q[2]).multiplyScalar(sun.intensity*.16);
    if(c.cyT)U.uRkT.value.fromArray(c.cyT);if(c.cyW)U.uWS.value.fromArray(c.cyW);if(c.cyX)U.uWD.value.fromArray(c.cyX);if(c.cyH)U.uSkH.value.fromArray(c.cyH);if(c.cyZ)U.uSkZ.value.fromArray(c.cyZ);if(c.cyF)U.uMist.value.fromArray(c.cyF);
    const Q9=c.cyQ||[0,100,0,0];U.uQ.value.set(Q9[0]*(CY.deco?CY.deco.brume:1),Q9[1],Q9[2],Q9[3]); /* (2026-10-20) × la brume du fond tirée */U.uWet.value=Q9[2];U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value; /* l'éclair allume aussi le plafond du ciel */
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et sous l'orage
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}
    if(CY.rais){const N9=c.cyN||[0,1,1,0],ru=CY_RAI_M.uniforms;ru.uC.value.copy(sun.color).multiplyScalar(.10*sun.intensity*Math.max(0,SUN_DIR.y-.2)*(1-N9[3]));if(!paused)ru.uT.value=(ru.uT.value+dt)%4096;}}
  // l'ombre des parois sur la caisse
  let ombre=1,prof=0;
  if(CY.on&&CY.O&&started&&!gameOver){const p=carGroup.position,O=CY.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/14));}
    const Z=CY.Z,zx=(p.x-(Z.x0-Z.ts*.5))/Z.ts,zz=(p.z-(Z.z0-Z.ts*.5))/Z.ts,pl=cyBil(Z.d,Z.nx,Z.nz,4,0,zx,zz),fo=cyBil(Z.d,Z.nx,Z.nz,4,1,zx,zz);prof=Math.max(0,Math.min(1,(pl-p.y)/Math.max(60,pl-fo)));}
  if(CY.mineT&&cyMineIci()){const M9=CY.mineT,d9=Math.min(s-M9.i0*CY.S.ds,M9.i1*CY.S.ds-s);if(d9>25){ombre=Math.min(ombre,.08);prof=1;}} // dans la MINE : le soleil et le ciel s'éteignent sur la caisse (passé 25 m de la bouche)
  if(CY.tunT&&CY.tunT.v2&&s>=CY.tunT.s0+25){ombre=Math.min(ombre,.3);prof=1;} // (2026-10-19) dans le TUNNEL DE GRÈS : à l'abri du soleil, sous ses anneaux
  CY.ombre+=(ombre-CY.ombre)*Math.min(1,dt*5);CY.prof+=(prof-CY.prof)*Math.min(1,dt*2);
  if(k>.001||CY.ecrit){const e=CY.on?k:0;sun.intensity=c.sunI*(1-.72*(1-CY.ombre)*e);hemi.intensity=c.hemiI*(1-.28*CY.prof*e);CY.ecrit=e>.001;}
  cyPousTick(dt,c); /* (2026-10-21) la poussière dorée (canyon-embellie.js) */
}
/* EN VOL : la roche, l'eau et le fond tuent (5 points de caisse, comme les piliers de jade) — renvoie la cause, ou '' */
const CY_H9={};
function canyonHeurt(p){if(!CY.on||!CY.Z)return '';
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1],h=cyHauteur(x,z,CY_H9);if(p.y<h+.7)return CY_H9.eau?'riviere':CY_H9.rk>.35?'paroi':'canyon';}
  if(CY.monu&&cyMonuHeurt(p))return 'paroi';
  if(CY.couT&&cyCouloirHeurt(p,CY.couT))return 'paroi';
  if(CY.tunT){if(CY.tunT.v2){const c9=cyTun2Heurt(p,CY.tunT);if(c9)return c9;}else if(cyCouloirHeurt(p,CY.tunT))return 'paroi';} // (2026-10-19) le tunnel de grès : murs, voûte, dôme, fond du gouffre
  if(CY.mineT&&cyMineHeurt(p,CY.mineT))return 'paroi';
  return '';}
/* ---- LES MONUMENTS (2026-10-14, CANYON) — ce que le relief seul ne sait pas faire : LES MITAINES (les deux buttes à pouce de Monument
   Valley, de part et d'autre de la route au départ : des EMPREINTES dans la taille fine, canal G — elles montent du sol de la vallée), L'ARCHE
   (un pont naturel de grès qui enjambe la gorge, 120 m au-dessus de la dalle au plus bas) et LES CHEMINÉES DE FÉES (des centaines de
   colonnes à chapeau sur les gradins de l'amphithéâtre, en instances). Arche et cheminées prennent la MÊME matière que le relief (CY_FS,
   uniformes partagés) avec leur propre sommet (CY_MVS) : mêmes strates, même lumière, même ombre. Leur hauteur entre dans le balayage de
   l'ombre (elles ombrent la route), et elles TUENT en vol (cyMonuHeurt). Règle d'or : rien ne touche la dalle (vérifié par dbgCanyon('test')). */
function cyMitaines(S,F,sQ,K,r,D){
  const a=sQ.depart!=null?sQ.depart:0,b=sQ.breche0!=null?sQ.breche0:Math.min(L,600);if(b-a<120)return;
  const s9=a+(b-a)*.55,i=Math.min(S.n-1,Math.round(s9/S.ds)),tx=S.tx[i],tz=S.tz[i],px=-tz,pz=tx,K4=Math.pow(K,.8);
  const th=Math.atan2(tx,tz),dA=Math.abs(th)>1e-6?th:0; // (2026-10-19, LE CANYON AU HASARD) le cap de la Route 67 : les Mitaines se tournent avec elle (plein nord : 0, rien ne change)
  const M=[]; // [x, z, axe x, axe z, rx, rz, hauteur, pouce : côté le long du grand axe]
  for(const sg of [-1,1]){const lat=(sg<0?430:390)*K4,av=(sg<0?40:-60)*K4,cx=S.x[i]+px*sg*lat+tx*av,cz=S.z[i]+pz*sg*lat+tz*av,an=(sg<0?.35:-.5)+(r()-.5)*.3-dA;
    M.push({x:cx,z:cz,ax:Math.cos(an),az:Math.sin(an),rx:(118+r()*20)*K4,rz:(64+r()*10)*K4,h:(320+r()*40)*K4,pouce:sg});}
  {const lat=820*K4,cx=S.x[i]+px*(r()<.5?-1:1)*lat+tx*260*K4,cz=S.z[i]+pz*lat*(r()<.5?-1:1)+tz*260*K4;M.push({x:cx,z:cz,ax:Math.cos(dA),az:-Math.sin(dA),rx:190*K4,rz:120*K4,h:280*K4,pouce:0});} // la troisième, massive (une mesa), plus loin
  /* (2026-10-19, LE CANYON AU HASARD) LA RÈGLE D'OR DES MITAINES : elles sont posées à côté de la Route 67, mais la route peut tourner ensuite vers elles (la brèche, une
     dérive, un coude : MESURÉ, 4 canyons sur 40 passaient DANS une butte, 360 à 830 m sous sa cime). Une butte dont le pied (1,65 × son grand rayon : là où
     son talus tombe sous ~15 m ; le pouce : rx + 100 m) approche une route s'écarte de 60 m en 60 m, au plus 12 fois — sinon elle n'est pas posée. Aucun tirage ;
     la recette d'avant n'en a jamais besoin (sa route file droit sous les Mitaines : 390 m et plus). */
  if(D){const m9=D.mit;for(const m of M){m.rx*=m9.k;m.rz*=m9.k;m.h*=m9.k;} // (2026-10-20, LE DÉCOR TIRÉ) les Mitaines : l'une, l'autre, les deux, aucune ; la mesa ; leur taille
    for(let k=M.length-1;k>=0;k--)if(k===0&&!m9.g||k===1&&!m9.d||k===2&&!m9.mesa)M.splice(k,1);}
  for(let k=M.length-1;k>=0;k--){const m=M[k],R9=Math.max(1.65*Math.max(m.rx,m.rz),m.pouce?m.rx+100*K4:0)+ROAD_HALF+10,pres=()=>{for(let j=0;j<S.n;j+=2){const dx=S.x[j]-m.x,dz=S.z[j]-m.z;if(dx*dx+dz*dz<R9*R9)return true;}return false;};
    if(!pres())continue;let ux=m.x-S.x[i],uz=m.z-S.z[i];const ul=Math.hypot(ux,uz)||1;ux/=ul;uz/=ul;let n9=0;while(n9<12&&pres()){m.x+=ux*60;m.z+=uz*60;n9++;}if(pres())M.splice(k,1);}
  const fc=F.c,fm=F.m,TF=F.ts;CY.mit=[];
  for(const m of M){const base=cyHauteurVite(m.x,m.z)-4,R9=Math.max(m.rx,m.rz)*2.1+60;CY.mit.push({x:m.x,z:m.z,r:Math.max(m.rx,m.rz)*1.1,y0:base,y1:base+m.h});
    const th={x:m.x+m.ax*(m.rx+48*K4)*(m.pouce||0),z:m.z+m.az*(m.rx+48*K4)*(m.pouce||0),r:26*K4,h:m.h*.93};
    const j0=Math.max(0,Math.floor((m.z-R9-F.z0)/TF)),j1=Math.min(F.nz-1,Math.ceil((m.z+R9-F.z0)/TF)),i0=Math.max(0,Math.floor((m.x-R9-F.x0)/TF)),i1=Math.min(F.nx-1,Math.ceil((m.x+R9-F.x0)/TF));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const x=F.x0+jx*TF,z=F.z0+jz*TF,qx=x-m.x,qz=z-m.z,u=(qx*m.ax+qz*m.az)/m.rx,v=(-qx*m.az+qz*m.ax)/m.rz;
      let d=Math.sqrt(u*u+v*v);const an=Math.atan2(v,u);d*=1+.07*Math.sin(an*5+m.x*.01)+.04*Math.sin(an*11+m.z*.01)+.05*(cyNz(x/70,z/70,2)-.5);
      const prof=dd=>dd<.9?1:dd<1.04?1-.70*(dd-.9)/.14:.30*Math.pow(Math.max(0,1-(dd-1.04)/.95),2);
      let h=m.h*prof(d),rkm=d<.86?.25:d<1.1?1:.4;
      if(m.pouce){const tdx=x-th.x,tdz=z-th.z,dt=Math.sqrt(tdx*tdx+tdz*tdz)/th.r*(1+.06*Math.sin(Math.atan2(tdz,tdx)*4));const ht=th.h*(dt<.85?1:dt<1.1?1-.75*(dt-.85)/.25:.25*Math.pow(Math.max(0,1-(dt-1.1)/1.6),2));
        if(ht>h){h=ht;rkm=dt<.8?.3:1;}}
      if(h<2)continue;const o=jz*F.nx+jx,y=base+h;if(y>fc[o*2+1]){fc[o*2+1]=y;fm[o*4+1]=Math.round(rkm*255);if(y>CY.yMaxM)CY.yMaxM=y;}}}
}
// les données (avant le balayage de l'ombre) : l'ARCHE au milieu de sa droite, les CHEMINÉES sur les gradins de l'amphithéâtre
function cyMonuPrevoir(S,sQ,K,r,D){
  CY.arche=null;CY.chem=[];CY.yMaxM=-1e9;
  const a0=sQ.arche0,a1=sQ.arche1;
  if(a0!=null&&a1!=null&&a1-a0>200){const s9=(a0+a1)/2,i=Math.round(s9/S.ds),tx=S.tx[i],tz=S.tz[i],px=-tz,pz=tx,y=S.y[i],wF=S.wF[i],K4=Math.pow(K,.5);
    const Ua=wF*1.08+70*K4,clear=Math.max(118,S.D[i]*0)+120*(K4-1),rise=(70+r()*25)*K4,yb=y+clear; // l'intrados : 120 m au-dessus de la dalle au milieu
    const P=[];const NK=34;for(let k=0;k<=NK;k++){const u=-Ua+2*Ua*k/NK,e=u/Ua,ys=yb+rise*(1-Math.pow(Math.abs(e),2.2))-(1-Math.pow(1-Math.abs(e),.5))*20*K4;
      P.push({x:S.x[i]+px*u,z:S.z[i]+pz*u,y:ys,u:u,e:e});}
    CY.arche={P:P,tx:tx,tz:tz,px:px,pz:pz,W:(44+r()*10)*K4,T:(34+r()*8)*K4,cx:S.x[i],cz:S.z[i],yb:yb,rise:rise,Ua:Ua};}
  const h0=sQ.amphi0,h1=sQ.amphi1;
  if(h0!=null&&h1!=null){const N=Math.round(PAL.b('cyChem',300)*(D?D.chem:1));let n=0; // (2026-10-20) × le nombre de cheminées tiré
    for(let k=0;k<4000&&n<N;k++){const s9=h0-120+r()*(h1-h0+380),i=Math.max(0,Math.min(S.n-2,Math.round(s9/S.ds))),sg=r()<.5?-1:1,tx=S.tx[i],tz=S.tz[i];
      if(S.zH[i]<.35)continue;const wF=S.wF[i]*(1-sg*S.as[i]),t=.08+r()*.82,lat=wF+t*S.wW[i]+(r()-.5)*30,x=S.x[i]-tz*sg*lat+tx*(r()-.5)*20,z=S.z[i]+tx*sg*lat+tz*(r()-.5)*20;
      const hg=cyHauteur(x,z),ht=(28+r()*r()*95)*Math.pow(K,.3),rad=ht*(.15+r()*.09);
      if(hg+ht>S.y[i]-6&&lat<ROAD_HALF+rad+40)continue; // la règle d'or
      CY.chem.push({x:x,z:z,y:hg-4,h:ht+4,r:rad,a:r()*6.28,v:r()<.5?0:1});n++;}}
}
const CY_MVS=['uniform sampler2D uTZ,uTS;uniform vec4 uZD,uSD;uniform vec2 uZN,uSN;varying vec3 vW,vN;varying vec4 vA,vB;','#ifdef USE_COLOR','varying vec3 vCol;','#endif','#include <fog_pars_vertex>',
  'vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}',
  'void main(){','#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);vW=wp.xyz;vN=normalize(mat3(mw)*normal);vec4 Z=tB(uTZ,(wp.xz-uZD.xy)*uZD.zw*uZN,uZN);',
  '#ifdef USE_COLOR','  vCol=color;','#endif',
  '  float lit=1.;vec2 sp=(wp.xz-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-4.,hs+10.,wp.y);}',
  '  lit*=.55+.45*smoothstep(-.2,.6,dot(vN,vec3(0.,1.,0.)));', // le dessous d'une arche ne voit pas le soleil
  '  vA=vec4(0.,0.,1.,lit);vB=vec4(0.,0.,clamp((Z.r-wp.y)/max(Z.r-Z.g,40.),0.,1.),Z.g);',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const CY_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uBnc;uniform float uWet;varying vec3 vW,vN,vCol;varying vec4 vA,vB;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);float ndl=max(dot(N,uSunD),0.)*.75+.25;vec3 c=vCol*vCol*(1.-.25*uWet);'+('c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,1.3),0.);'),
  '  c*=uSunC*ndl*vA.w+mix(uGnd,uSky,N.y*.5+.5)*(1.-.45*vB.z)+uBnc*(1.-.6*vA.w)*.45;gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
function cyMonuMats(){if(CY.mm)return CY.mm;const U=CY.mat.uniforms;
  const mk=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_MVS,fragmentShader:CY_FS,fog:true});m.dispose=function(){};return m;};
  const mt=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:CY_MVS,fragmentShader:CY_AFS,fog:true,vertexColors:true});m.dispose=function(){};return m;};
  CY.mm={a:mk(),i:mk(),b:(function(){const m=mk();m.side=THREE.DoubleSide;return m;})(),t:mt(),g:(function(){const m=mt();m.side=THREE.DoubleSide;return m;})()};return CY.mm;}
function cyArbreGeo(V){V=V||[[.40,.58,.18],[.34,.52,.14],[.46,.62,.22]];const P=[],C=[],I=[], /* V : les trois verts du houppier (2026-10-20 : le tirage en a d'autres, CY_ARB) */ad=(g,col,tx,ty,tz,sx,sy,sz)=>{const b=P.length/3,p=g.attributes.position,n=g.index;for(let k=0;k<p.count;k++){const v=.88+.24*Math.abs(Math.sin(k*12.9898));P.push(p.getX(k)*sx+tx,p.getY(k)*sy+ty,p.getZ(k)*sz+tz);C.push(col[0]*v,col[1]*v,col[2]*v);}
    if(n)for(let k=0;k<n.count;k++)I.push(b+n.getX(k));else for(let k=0;k<p.count;k++)I.push(b+k);g.dispose();};
  ad(new THREE.CylinderGeometry(.05,.09,1,5),[.42,.33,.24],0,.5,0,1,1,1);
  ad(new THREE.IcosahedronGeometry(1,0),V[0],0,1.05,0,.42,.34,.42);ad(new THREE.IcosahedronGeometry(1,0),V[1],.22,.86,.12,.30,.26,.30);ad(new THREE.IcosahedronGeometry(1,0),V[2],-.18,.92,-.16,.28,.24,.28);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();return g;}
// l'arche : un tube de grès à section arrondie qui suit sa courbe, plus épais aux culées, l'arête rongée
function cyArcheGeo(A){const P=A.P,NR=18,pos=[],idx=[],rg=mulberry32(0xA7C4E);
  for(let k=0;k<P.length;k++){const p=P[k],q=P[Math.min(P.length-1,k+1)],o=P[Math.max(0,k-1)];let ty=q.y-o.y,tu=q.u-o.u;const tl=Math.hypot(ty,tu)||1;ty/=tl;tu/=tl;
    const nu=-ty,ny=tu,ab=1+1.4*Math.pow(Math.abs(p.e),3);  // la normale de la courbe dans le plan de l'arche ; les culées s'épaississent
    for(let j=0;j<NR;j++){const an=j/NR*Math.PI*2,c=Math.cos(an),sn=Math.sin(an),sq=Math.pow(Math.abs(c),.55)*Math.sign(c),sq2=Math.pow(Math.abs(sn),.55)*Math.sign(sn);
      const w=A.W*.5*ab*(1+.10*(rg()-.5)),t=A.T*.5*ab*(1+.12*(rg()-.5)),ux=p.u+nu*t*sq2,uy=p.y+ny*t*sq2,al=w*sq;
      pos.push(A.cx+A.px*ux+A.tx*al,uy,A.cz+A.pz*ux+A.tz*al);}}
  for(let k=0;k<P.length-1;k++)for(let j=0;j<NR;j++){const a=k*NR+j,b=k*NR+(j+1)%NR,c=a+NR,d=b+NR;idx.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;}
// la cheminée de fée : un tour (lathe) — le pied évasé, deux renflements, le cou, le CHAPEAU plus large ; deux variantes
function cyChemGeo(v){const pts=[],N=18;for(let k=0;k<=N;k++){const y=k/N;let rr;
    if(v===0)rr=y<.12?.62-y*1.2:y<.86?.40+.07*Math.sin(y*9.5)+.04*Math.sin(y*23.):y<.9?.30:y<.97?.52:.40;
    else rr=y<.10?.55-y:y<.80?.34+.09*Math.sin(y*7.)-.05*y:y<.84?.26:y<.95?.46:.30;
    pts.push(new THREE.Vector2(Math.max(.05,rr),y));}
  const g=new THREE.LatheGeometry(pts,10);g.computeVertexNormals();return g;}
const CY_RAI_M=(function(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:true,
  uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uC:{value:new THREE.Color()},uT:{value:0}}),
  vertexShader:['varying vec2 vU;varying float vH;','#include <fog_pars_vertex>','void main(){vU=uv;vec4 wp=modelMatrix*vec4(position,1.);vH=wp.y;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['uniform vec3 uC;uniform float uT;varying vec2 vU;varying float vH;','#include <fog_pars_fragment>',
    'void main(){float e=smoothstep(0.,.35,vU.x)*smoothstep(1.,.65,vU.x),v=smoothstep(0.,.25,vU.y)*smoothstep(1.,.7,vU.y),p=.75+.25*sin(vH*.08+uT*.7+vU.x*9.);',
    '  gl_FragColor=vec4(uC*e*e*v*p,1.);','#ifdef USE_FOG','  gl_FragColor.rgb*=1.-smoothstep(fogNear,fogFar,fogDepth);','#endif','}'].join('\n')});m.dispose=function(){};return m;})();
const CY_COU={g:3.5,T:14};
const CY_SERRE={pied:30,k:.22,pied2:24,k2:.06,raide:.38}; // le canyon serré (buildCanyon) · pied2/k2/raide : le 2e serrage (15/10), hors raccourcis
const CY_TUN={l:460,vh:34,ap:104,fw:520,fh:520};  // longueur, hauteur des murs droits, sommet de la voûte (au-dessus de la route), façade (demi-largeur, hauteur)
const TUN2_ON=!/[?&]sans=tunnelcanyon\b/.test(location.search); // (2026-10-19) LE TUNNEL DE GRÈS (voir cyTunnel2) — `?sans=tunnelcanyon` = le tunnel du 14/10
const CY_TUN2={hw:16,ha:46,ev0:190,ev1:110,fin:40,fond:-48,A:78,B:82,pas:4,an:36,rgF:55,NQ:16,fw:520,vs:4.3,vR:5,vP:2.2}; // galerie (murs, clé) · la salle (début et fin du fondu avant le bout, mur du fond après, gouffre, ellipse A × B) · pas des rangées, des anneaux, dernier anneau avant le bout · façade, voussoirs
const T2_JOUR={nuit:.12,orage:.42,pluie:.5,soir:.72,matin:.85,midi:1}; // la force du jour qui entre par la bouche (cuite : la matière est sans éclairage)
const T2F={x:0,y:0,z:0,tx:0,tz:1},T2P=new Float32Array((CY_TUN2.NQ+2)*2);
function cyCouloirIci(){return CY.on&&((!!CY.cou&&s>=CY.cou[0]&&s<=CY.cou[1])||(!!CY.tun&&s>=CY.tun[0])||(!!CY.mineT&&s>=CY.mine[0]&&s<=CY.mine[1]));} // (la MINE aussi : ses murs frôlent la route)
function cyCouloir(){CY.couT=CY.cou?cyBandes(CY.cou,false):null;CY.tunT=CY.tun?(TUN2_ON?cyTunnel2(CY.tun):cyBandes(CY.tun,true)):null;CY.mineT=null;try{CY.mineT=CY.mine?cyMine(CY.mine):null;}catch(e){console.warn('canyon : mine',e);}}
function cyBandes(iv,tun){const S=CY.S;if(!S)return null;const i0=Math.max(0,Math.round(iv[0]/S.ds)),i1=Math.min(S.n-1,Math.round(iv[1]/S.ds));if(i1-i0<4)return null;
  const L0=ROAD_HALF+CY_COU.g,T=CY_COU.T,n=i1-i0+1,top=new Float32Array(n*2),bas=new Float32Array(n),o9={};
  for(let k=0;k<n;k++){const i=i0+k;bas[k]=Math.min(S.F[i],S.y[i]-THICK-8)-6;
    for(let c=0;c<2;c++){const sd=c?1:-1,l=sd*(L0+T+16),h=cyHauteur(S.x[i]-S.tz[i]*l,S.z[i]+S.tx[i]*l,o9);top[k*2+c]=tun?S.y[i]+CY_TUN.vh:Math.min(S.y[i]+420,Math.max(S.y[i]+50,h));}}
  if(!tun){const t2=top.slice();for(let k=0;k<n;k++)for(let c=0;c<2;c++){let a=0,m=0;for(let j=Math.max(0,k-4);j<=Math.min(n-1,k+4);j++){a+=t2[j*2+c];m++;}top[k*2+c]=a/m;}} // le haut lissé : pas de dents de scie
  const P=new Float32Array(n*2*4*3),N=new Float32Array(n*2*4*3),I=[];
  for(let c=0;c<2;c++){const sd=c?1:-1;for(let k=0;k<n;k++){const i=i0+k,nx=-S.tz[i]*sd,nz=S.tx[i]*sd,b=((c*n)+k)*4,t9=top[k*2+c];
    const V=(q,l,y,a,bb,cc)=>{const o=(b+q)*3;P[o]=S.x[i]+nx*l;P[o+1]=y;P[o+2]=S.z[i]+nz*l;N[o]=a;N[o+1]=bb;N[o+2]=cc;};
    V(0,L0,bas[k],-nx,0,-nz);V(1,L0,t9,-nx,0,-nz);V(2,L0,t9,0,1,0);V(3,L0+T,t9,0,1,0);  // la face (vers la route) et le dessus
    if(k<n-1){const b2=b+4;I.push(b,b2,b+1,b+1,b2,b2+1,b+2,b2+2,b+3,b+3,b2+2,b2+3);}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setIndex(I);g.computeBoundingSphere();
  if(tun){cyRocheSombre(g);cyRocheNeon(g,function(v){return S.y[i0+Math.min(n-1,(v>>2)%n)];});}const m=new THREE.Mesh(g,tun?cyMonuMats().g:cyMonuMats().b);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.frustumCulled=true;CY.grp.add(m);
  if(tun)cyGalerie(i0,i1,L0);
  return {i0:i0,i1:i1,top:top,bas:bas,L0:L0,tun:tun};}
/* LA VOÛTE (une demi-ellipse de L0 à L0, de la tête des murs au sommet), LA FAÇADE (un mur de falaise percé d'une bouche en fer à cheval,
   tourné vers celui qui arrive) et LES NÉONS (deux filets rose au pied des murs, un filet or sous la clé, la bouche cerclée de rose) */
const CY_NEON={r:null,o:null};
function cyRocheSombre(g){const p=g.attributes.position,C=new Float32Array(p.count*3);for(let k=0;k<p.count;k++){const y=p.getY(k),b=.5+.5*Math.sin(y*.9+Math.sin(y*.23)*2.);
  C[k*3]=.36+.10*b;C[k*3+1]=.22+.05*b;C[k*3+2]=.30+.06*b;}g.setAttribute('color',new THREE.BufferAttribute(C,3));}
/* (la matière simple met la couleur au CARRÉ et la galerie est à l'ombre : il faut des teintes claires pour lire la roche) — la galerie
   prend le reflet de ses néons : ROSE au pied des murs, OR vers la clé de voûte */
function cyRocheNeon(g,yr){const p=g.attributes.position,C=g.attributes.color.array;for(let k=0;k<p.count;k++){const h=p.getY(k)-yr(k),u=Math.max(0,Math.min(1,(h-CY_TUN.vh)/(CY_TUN.ap-CY_TUN.vh))),r=Math.exp(-Math.max(0,h-6)*Math.max(0,h-6)/900);
  C[k*3]=Math.min(1,.78+.20*r+.12*u*u);C[k*3+1]=Math.min(1,.50+.06*r+.30*u*u);C[k*3+2]=Math.min(1,.66+.18*r-.20*u*u);}g.attributes.color.needsUpdate=true;}
function cyGalerie(i0,i1,L0){const S=CY.S,n=i1-i0+1,NA=14,vh=CY_TUN.vh,ap=CY_TUN.ap,P=[],I=[];
  const pt=(i,a)=>{const l=-L0*Math.cos(a),y=S.y[i]+vh+(ap-vh)*Math.sin(a);return [S.x[i]-S.tz[i]*l,y,S.z[i]+S.tx[i]*l];}; // a = 0 (un mur) → π (l'autre)
  for(let k=0;k<n;k++)for(let q=0;q<=NA;q++){P.push.apply(P,pt(i0+k,q/NA*Math.PI));if(k<n-1&&q<NA){const a=k*(NA+1)+q,b=a+NA+1;I.push(a,b,a+1,a+1,b,b+1);}}
  const gv=new THREE.BufferGeometry();gv.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gv.setIndex(I);gv.computeVertexNormals();gv.computeBoundingSphere();
  cyRocheSombre(gv);cyRocheNeon(gv,function(v){return S.y[i0+Math.floor(v/(NA+1))];});const mv=new THREE.Mesh(gv,cyMonuMats().g);mv.userData.jeter=1;mv.matrixAutoUpdate=false;mv.updateMatrix();CY.grp.add(mv);
  // LA FAÇADE à la bouche : le contour de la bouche (murs + voûte) relié à un grand rectangle de falaise (en éventail)
  {const i=i0,tx=S.tx[i],tz=S.tz[i],W=CY_TUN.fw,H=Math.max(CY_TUN.fh,S.R[i]-S.y[i]+80),yb=Math.min(S.F[i],S.y[i]-40)-10,Q=[],J=[],B=[];
   const at=(l,y)=>[S.x[i]-tz*l,y,S.z[i]+tx*l];
   B.push([-L0,yb]);B.push([-L0,S.y[i]+vh]);for(let q=1;q<NA;q++){const a=q/NA*Math.PI;B.push([-L0*Math.cos(a),S.y[i]+vh+(ap-vh)*Math.sin(a)]);}B.push([L0,S.y[i]+vh]);B.push([L0,yb]); // le bord de la bouche
   const O=B.map(function(b){const l=b[0],y=b[1];const ang=Math.atan2(y-(S.y[i]+vh),l);const ex=Math.abs(Math.cos(ang))>1e-3?W/Math.abs(Math.cos(ang)):1e9,ey=Math.abs(Math.sin(ang))>1e-3?H/Math.abs(Math.sin(ang)):1e9,e=Math.min(ex,ey);
     return [Math.max(-W,Math.min(W,Math.cos(ang)*e)),Math.max(yb,Math.min(S.y[i]+vh+H,S.y[i]+vh+Math.sin(ang)*e))];}); // le même rayon, poussé jusqu'au cadre
   O[0]=[-W,yb];O[O.length-1]=[W,yb];
   for(let k=0;k<B.length;k++){Q.push.apply(Q,at(B[k][0],B[k][1]));Q.push.apply(Q,at(O[k][0],O[k][1]));if(k<B.length-1){const a=k*2;J.push(a,a+1,a+2,a+2,a+1,a+3);}}
   const nb=Q.length/3;Q.push.apply(Q,at(-W,S.y[i]+vh+H));Q.push.apply(Q,at(W,S.y[i]+vh+H));J.push(1,nb,3);for(let k=1;k<B.length-1;k++){const a=k*2+1;J.push(a,nb,a+2);}J.push((B.length-1)*2+1,nb,nb+1); // les coins du haut
   const gf=new THREE.BufferGeometry();gf.setAttribute('position',new THREE.Float32BufferAttribute(Q,3));gf.setIndex(J);gf.computeVertexNormals();gf.computeBoundingSphere();
   const mf=new THREE.Mesh(gf,cyMonuMats().b);mf.userData.jeter=1;mf.matrixAutoUpdate=false;mf.updateMatrix();CY.grp.add(mf);
   CY.tunF={x:S.x[i],y:S.y[i],z:S.z[i],tx:tx,tz:tz,B:B};}
  // LES NÉONS : des rubans additifs (deux filets rose au pied des murs, un filet or sous la clé, la bouche cerclée de rose)
  if(!CY_NEON.r){CY_NEON.r=new THREE.MeshBasicMaterial({color:0xff3fa6,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
    CY_NEON.o=new THREE.MeshBasicMaterial({color:0xffc24a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});CY_NEON.r.dispose=CY_NEON.o.dispose=function(){};}
  const ruban=(fn,w,mat)=>{const R=[],K=[];for(let k=0;k<n;k+=2){const a=fn(i0+k,-w),b=fn(i0+k,w);R.push.apply(R,a);R.push.apply(R,b);const m=R.length/3;if(m>=4)K.push(m-4,m-3,m-2,m-2,m-3,m-1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(R,3));g.setIndex(K);g.computeBoundingSphere();const me=new THREE.Mesh(g,mat);me.userData.jeter=1;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=3;CY.grp.add(me);};
  for(const sd of [-1,1])ruban(function(i,w){const l=sd*(L0-.3);return [S.x[i]-S.tz[i]*l,S.y[i]+6+w,S.z[i]+S.tx[i]*l];},.55,CY_NEON.r);
  ruban(function(i,w){return [S.x[i]-S.tz[i]*w*1.4,S.y[i]+ap-.6,S.z[i]+S.tx[i]*w*1.4];},1,CY_NEON.o);
  {const F9=CY.tunF,R=[],K=[];const at=(l,y,o)=>[F9.x-F9.tz*l-F9.tx*o,y,F9.z+F9.tx*l-F9.tz*o];
   for(let k=1;k<F9.B.length-1;k++){const b=F9.B[k],c=[b[0]*1.06,F9.y+CY_TUN.vh+(b[1]-F9.y-CY_TUN.vh)*1.06];R.push.apply(R,at(b[0],b[1],.8));R.push.apply(R,at(c[0],c[1]+(k===1||k===F9.B.length-2?0:0),.8));const m=R.length/3;if(m>=4)K.push(m-4,m-3,m-2,m-2,m-3,m-1);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(R,3));g.setIndex(K);g.computeBoundingSphere();const me=new THREE.Mesh(g,CY_NEON.r);me.userData.jeter=1;me.matrixAutoUpdate=false;me.updateMatrix();me.renderOrder=3;CY.grp.add(me);}}
function cyCouloirHeurt(p,C){const S=CY.S;if(!C)return false;let bi=-1,bd=1e18;
  for(let i=C.i0;i<=C.i1;i+=2){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>(C.L0+CY_COU.T+40)**2)return false;{const al=(p.x-S.x[bi])*S.tx[bi]+(p.z-S.z[bi])*S.tz[bi];if((bi-C.i0<2&&al<0)||(C.i1-bi<2&&al>(C.i1-bi)*S.ds))return false;} /* (2026-10-18, DEBUGGING : un mur INVISIBLE sur la route) avant le 1er échantillon d'une bande (ou après le dernier), l'échantillon le plus proche est le bout et le test latéral se faisait dans SON repère : jusqu'à 85 m avant la bouche du TUNNEL et après la sortie des ÉTROITS, un vol bas au bord de la route mourait « ENCASTRÉ DANS LA PAROI » contre rien — la bande commence et finit à ses bouts */const lt=(p.x-S.x[bi])*-S.tz[bi]+(p.z-S.z[bi])*S.tx[bi],a=Math.abs(lt),k=bi-C.i0;
  if(C.tun){const yr=S.y[bi];if(p.y>yr+CY_TUN.vh&&a<C.L0){const u=a/C.L0;if(p.y>yr+CY_TUN.vh+(CY_TUN.ap-CY_TUN.vh)*Math.sqrt(Math.max(0,1-u*u))-1.5)return true;}}
  return a>C.L0-1.2&&a<C.L0+CY_COU.T+2&&p.y<C.top[k*2+(lt>0?1:0)]&&p.y>C.bas[k]-2;}
/* LE TUNNEL DE GRÈS (2026-10-19, Sacha : « le tunel d'arriver pour la map canyon est moche » — entre deux idées, le choix : « le tunnel de
   grès » : une galerie de grès à bandes, des anneaux de lumière dorée qui défilent, une grande salle en dôme où le portail tient en entier, une
   bouche en arc de pierre dans la falaise). Il remplace le TUNNEL D'ARRIVÉE du 14/10 (cyBandes/cyGalerie), sur les mêmes 460 derniers mètres.
   MESURÉ avant (banc photo, soir) : la façade était la matière du RELIEF posée sur un mur droit (strates et normales lues dans la grille du terrain :
   une tache rouge et noire baveuse) percée d'une fente de 104 m ; dedans, tout NOIR (la roche simple à l'ombre, la voûte à 104 m), deux bandes
   roses qui flottaient, un trait or ; et les murs, à 31,5 m de l'axe, COUPAIENT le portail de cubes (108 m de large, 17/10) : on n'en voyait qu'une tranche.
   · LA BOUCHE (`cyT2Facade`) : un arc rond net (le profil de la galerie) cerclé de VOUSSOIRS de grès, crème et terre cuite en alternance, une
     clé plus grosse ; la falaise autour en STRATES horizontales (les couleurs de cyStrates, à la hauteur où le relief les met), sculptée d'un
     relief doux loin de l'arc, éclairée comme les autres pièces du canyon (`.g` = CY_AFS : le soleil de l'heure, l'ombre des parois, la nuit).
   · LA GALERIE : murs droits de 16 m, clé de voûte à 46 m (cyT2Prof), le grès en lits pêche, crème et rose qu'on VOIT (les couleurs de cyStrates,
     serrées et adoucies dedans), des ANNEAUX de lumière dorée tous les 36 m (additifs, CY_T2M.o) dont la lumière est CUITE dans la roche
     (couleurs de sommet, une matière sans éclairage ni brume : `lum` dans cyTunnel2, réglages CY_T2L) — des flaques d'or, l'ombre violette entre
     deux anneaux ; le jour de la bouche entre sur ~30 m, à la force de l'heure (T2_JOUR). MESURÉ au banc : la chaîne de l'image sature déjà
     (CONTI) — le grès saturé et la lumière orangée faisaient un tube de lave ; les lits à leur vrai contraste, des rayures noires (con, sat).
   · LA SALLE DU PORTAIL : à 190 m du bout la galerie s'évase (fondu de 80 m, cyT2k) en un DÔME — une ellipse de 78 m de large × 82 m de haut
     autour du centre du portail — au-dessus d'un gouffre (fond à −48 m) : le portail (anneau de 54 m de rayon) y tient en entier ; les anneaux
     d'or continuent en grandes arches jusqu'à ~55 m du bout ; la salle prend la lumière de la fenêtre du portail (PCUBE.pal, la map d'en face,
     à moitié blanc chaud : le tilleul de la forêt sur le grès faisait du kaki) et un HALO de la couleur de ses cubes cerne l'anneau sur le mur
     du fond. Le relief s'écarte (buildCanyon : le pied des parois à 106 m de l'axe au
     bout de la route, sans asymétrie ni alcôve) et les arbres n'y poussent plus : rien ne traverse le dôme (`dbgTunnel('test')`).
   · Au volant rien ne change (on frotte au bord de la route : cyCouloirIci) ; EN VOL, murs, voûte, dôme et fond du gouffre sont durs
     (cyTun2Heurt → « ENCASTRÉ DANS LA PAROI », « AU FOND DU CANYON ») ; dedans, le soleil et le ciel baissent sur la caisse (canyonTick).
   Coût : trois maillages (la roche ~8,5 k triangles, les anneaux, la façade avec ses voussoirs : `dbgTunnel()` les compte), aucune lumière ; deux
   matières neuves chauffées au menu (canyonChauffe) + `.g` des pièces du canyon — MESURÉ : 0 programme compilé en course (211 au menu, 211 au
   fond de la salle ; couché, debout, dans le cadre de l'ordi). `?sans=tunnelcanyon` = le tunnel du 14/10, au bit près ; `dbgTunnel()`,
   `dbgTunnel('test')` (aucun relief dans la salle), `dbgTunnel('heurt',[[m avant le bout, côté, hauteur],…])`, `dbgTunnel('regle',{…})`. */
/* les deux matières du tunnel (chauffées au menu, canyonChauffe) : la roche en couleurs de sommet SANS brume (un tunnel n'a pas la brume du dehors :
   celle du soir la noyait de rouge), l'or additif des anneaux */
const CY_T2M={m:null,o:null};
function cyT2Mats(){if(!CY_T2M.m){CY_T2M.m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false});
    CY_T2M.o=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});CY_T2M.m.dispose=CY_T2M.o.dispose=function(){};}
  return CY_T2M;}
/* LES RÉGLAGES DE LA LUMIÈRE CUITE (dbgTunnel('regle',{…}) les change et rebâtit) : ambiance, couleur des anneaux, pic et lueur des anneaux,
   saturation du grès (la chaîne de l'image sature déjà), échelle des strates DEDANS (m par texel : plus serrées que dehors, pour voir des lits
   sur 46 m de voûte), lueur du portail (force, portée, fond), clarté de la façade */
const CY_T2L={amb:[.09,.07,.19],or:[1,.88,.72],kA:1.15,kB:.3,sat:.6,ech:2.4,con:.4,gl:1.6,glD:40,glB:.04,hal:1.1,fac:1.1}; // hal : le halo de la couleur du portail sur le mur du fond, autour de l'anneau // con : le contraste des lits DEDANS (1 = celui des falaises ; moins, des teintes douces autour du grès crème)
/* le repère de la route à l'abscisse s (échantillons de 8 m, interpolés) — au-delà du bout, la dernière tangente prolongée, à plat */
function cyT2Fr(s9,o){const S=CY.S,n=S.n,f=s9/S.ds,i=Math.min(n-2,Math.max(0,Math.floor(f))),u=Math.max(0,f-i),v=Math.min(1,u);
  o.x=S.x[i]+(S.x[i+1]-S.x[i])*u;o.z=S.z[i]+(S.z[i+1]-S.z[i])*u;o.y=S.y[i]+(S.y[i+1]-S.y[i])*v;
  const tx=S.tx[i]+(S.tx[i+1]-S.tx[i])*v,tz=S.tz[i]+(S.tz[i+1]-S.tz[i])*v,l=Math.hypot(tx,tz)||1;o.tx=tx/l;o.tz=tz/l;return o;}
function cyT2k(s9){const T=CY_TUN2,a=L-T.ev0,b=L-T.ev1;let u=(s9-a)/(b-a);u=u<0?0:u>1?1:u;return u*u*(3-2*u);} // 0 = la galerie, 1 = la salle
/* le DEMI-PROFIL (côté positif, l ≥ 0), fondu galerie → salle : [sous le bord de la route] puis la courbe du pied du mur à la clé (NQ+1 points).
   Galerie : le sol à −0,4 m (les trottoirs), le mur droit jusqu'à hw, la voûte en quart d'ellipse jusqu'à ha. Salle : l'ellipse (A, B) centrée sur
   le portail, coupée par le fond du gouffre (le sol court alors sous toute la largeur). */
function cyT2Prof(k,out){const T=CY_TUN2,W=ROAD_HALF+CY_COU.g,hc=PCUBE.H,f=-.4+(T.fond+.4)*k,p0=Math.asin(Math.max(-1,(T.fond-hc)/T.B));
  out[0]=(ROAD_HALF-1.5)*(1-k);out[1]=f;
  for(let q=0;q<=T.NQ;q++){const t=q/T.NQ;let gl,gh;
    if(t<.25){gl=W;gh=-.4+(T.hw+.4)*t/.25;}else{const a=(t-.25)/.75*Math.PI/2;gl=W*Math.cos(a);gh=T.hw+(T.ha-T.hw)*Math.sin(a);}
    const a2=p0+(Math.PI/2-p0)*t,sl=T.A*Math.cos(a2),sh=hc+T.B*Math.sin(a2);
    out[2+q*2]=gl+(sl-gl)*k;out[3+q*2]=gh+(sh-gh)*k;}
  return out;}
/* la couleur du grès à la hauteur y (cyStrates, lue comme le shader du relief : un texel = 3,7 m), en octets ramenés à 0..1 */
function cyT2Strate(y,o,e){const d=CY.tStr&&CY.tStr.image&&CY.tStr.image.data;if(!d){o[0]=.93;o[1]=.80;o[2]=.62;return o;}
  const v=y/(e||3.7)-.5,i=Math.floor(v),u=v-i,a=(((i%1024)+1024)%1024)*4,b=((((i+1)%1024)+1024)%1024)*4;
  for(let c=0;c<3;c++)o[c]=(d[a+c]+(d[b+c]-d[a+c])*u)/255;return o;}
function cyTunnel2(iv){const S=CY.S;if(!S||!(S.n>3))return null;
  const T=CY_TUN2,s0=iv[0],s1=L+T.fin,NQ=T.NQ,NP=2*NQ+3,hc=PCUBE.H,sP=L-25,P=[],C=[],I=[],st=[0,0,0];
  const pal=PCUBE.pal||null,cP=new THREE.Color(pal?pal[2]:0xffe0b8).lerp(new THREE.Color(1,.85,.7),.5),cH=new THREE.Color(pal?pal[0]:0xffb060),met=LVL.cur&&LVL.cur.meteo,jour=T2_JOUR[met]!=null?T2_JOUR[met]:.8;
  const RG=[];for(let a=s0+12;a<=L-T.rgF;a+=T.an)RG.push(a); // les anneaux : à 12 m de la bouche, puis tous les 36 m — dans la salle aussi, jusqu'à ~55 m du bout : de grandes arches d'or autour du portail
  /* LA LUMIÈRE CUITE d'un sommet : l'ambiance (violette, l'ombre commune des maps), les anneaux d'or, le jour de la bouche, la fenêtre du portail */
  const Q=CY_T2L,lum=(s9,l,h,k,fl)=>{let gA=0,gB=0;for(const a of RG){const d=s9-a;if(d>70||d<-70)continue;gA+=Math.exp(-d*d/40);gB+=Math.exp(-d*d/400);} // sous l'anneau, puis la lueur qui s'étale
    const jo=Math.exp(-Math.max(0,s9-s0)/28)*jour,dP=Math.sqrt((s9-sP)*(s9-sP)+l*l+(h-hc)*(h-hc)),gl=k*(Q.gl*Math.exp(-dP/Q.glD)+Q.glB),rr=Math.sqrt(l*l+(h-hc)*(h-hc)),hz=k*Math.max(0,Math.min(1,(s9-sP)/40))*Math.exp(-(rr-58)*(rr-58)/1000)*Q.hal,kA=1-.5*k,kO=(gA*Q.kA+gB*Q.kB)*(fl?.6:1);
    return [Q.amb[0]*kA+Q.or[0]*kO+jo+cP.r*gl+cH.r*hz,Q.amb[1]*kA+Q.or[1]*kO+.92*jo+cP.g*gl+cH.g*hz,Q.amb[2]*kA+Q.or[2]*kO+.85*jo+cP.b*gl+cH.b*hz];};
  const coul=(s9,l,h,k,fl,y)=>{cyT2Strate(y,st,Q.ech);st[0]=.92+(st[0]-.92)*Q.con;st[1]=.80+(st[1]-.80)*Q.con;st[2]=.62+(st[2]-.62)*Q.con;let r=st[0]*st[0],g=st[1]*st[1],b=st[2]*st[2];const m=r*.3+g*.55+b*.15; // le grès en linéaire (au carré, comme le relief), DÉSATURÉ (la chaîne de l'image sature déjà)
    r=m+(r-m)*Q.sat;g=m+(g-m)*Q.sat;b=m+(b-m)*Q.sat;const q=lum(s9,l,h,k,fl);
    C.push(Math.min(1,r*q[0]),Math.min(1,g*q[1]),Math.min(1,b*q[2]));};
  // ---- LA ROCHE : une rangée de NP sommets tous les 4 m, de la bouche au mur du fond ----
  const nR=Math.ceil((s1-s0)/T.pas)+1;
  for(let r=0;r<nR;r++){const s9=Math.min(s1,s0+r*T.pas),o=cyT2Fr(s9,T2F),k=cyT2k(s9);cyT2Prof(k,T2P);
    for(let j=0;j<NP;j++){const hp=j<=NQ+1?j:2*NQ+2-j,sg=j<=NQ+1?-1:1,l=sg*T2P[hp*2],h=T2P[hp*2+1];
      P.push(o.x-o.tz*l,o.y+h,o.z+o.tx*l);coul(s9,l,h,k,hp<=1,o.y+h);}
    if(r<nR-1)for(let j=0;j<NP-1;j++){const a=r*NP+j,b=a+NP;I.push(a,b,a+1,a+1,b,b+1);}}
  { // LE MUR DU FOND : un éventail depuis le centre du portail (il prend sa lumière en plein)
    const o=cyT2Fr(s1,T2F),c=P.length/3,b=(nR-1)*NP;P.push(o.x,o.y+hc,o.z);coul(s1,0,hc,1,false,o.y+hc);
    for(let j=0;j<NP-1;j++)I.push(c,b+j,b+j+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyT2Mats().m);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.name='tunnel';CY.grp.add(m);
  // ---- LES ANNEAUX D'OR : un ruban de 2,2 m qui suit la voûte, d'un mur à l'autre (3 m au-dessus du sol), 0,5 m en retrait de la roche ----
  {const R=[],K=[];for(const a of RG){const k=cyT2k(a);cyT2Prof(k,T2P);const hm=T.hw*.5+(hc-T.hw*.5)*k;
     for(const e of [-1.1,1.1]){const o=cyT2Fr(a+e,T2F);
       for(let j=2;j<NP-2;j++){const hp=j<=NQ+1?j:2*NQ+2-j,sg=j<=NQ+1?-1:1;let l=sg*T2P[hp*2],h=T2P[hp*2+1];if(h<T2P[1]+3)h=T2P[1]+3; // au pied du mur, l'anneau s'arrête à 3 m du sol
         const dl=-l,dh=hm-h,dn=Math.hypot(dl,dh)||1;l+=dl/dn*.5;h+=dh/dn*.5;R.push(o.x-o.tz*l,o.y+h,o.z+o.tx*l);}}
     const n9=NP-4,b0=R.length/3-2*n9;for(let j=0;j<n9-1;j++){const a0=b0+j,a1=b0+n9+j;K.push(a0,a1,a0+1,a0+1,a1,a1+1);}}
   const ga=new THREE.BufferGeometry();ga.setAttribute('position',new THREE.Float32BufferAttribute(R,3));ga.setIndex(K);ga.computeBoundingSphere();
   const ma=new THREE.Mesh(ga,cyT2Mats().o);ma.userData.jeter=1;ma.matrixAutoUpdate=false;ma.updateMatrix();ma.renderOrder=3;CY.grp.add(ma);}
  let triF=0;try{triF=cyT2Facade(s0);}catch(e){console.warn('canyon : façade du tunnel',e);}
  const i0=Math.max(0,Math.floor(s0/S.ds)),i1=S.n-1;
  return {v2:1,i0:i0,i1:i1,s0:s0,s1:s1,an:RG.length,tri:I.length/3,triA:RG.length*2*(NP-5),triF:triF};}
/* LA FAÇADE ET SES VOUSSOIRS (la matière `.g` des pièces du canyon : la couleur au carré, éclairée par l'heure). La falaise en tranches
   horizontales d'un texel de strate (3,7 m, la couleur nette d'un lit à l'autre), affinées à 1,2 m le long de la bouche ; un relief doux la creuse
   (jusqu'à 22 m, nul près de l'arc). Les voussoirs : des blocs de ~4,3 m le long du bord de la bouche, 5 m de large, 2,2 m en saillie. */
function cyT2Facade(s0){const S=CY.S,T=CY_TUN2,W=ROAD_HALF+CY_COU.g,o=Object.assign({},cyT2Fr(s0,T2F)),i=Math.min(S.n-1,Math.round(s0/S.ds));
  const FW=T.fw,yb=Math.min(S.F[i],S.y[i]-40)-10,yt=o.y+34+Math.max(520,S.R[i]-S.y[i]+80),bx=-o.tz,bz=o.tx; // (les dimensions de la façade d'avant)
  const wM=h=>h<-.4||h>T.ha?0:h<=T.hw?W:W*Math.sqrt(Math.max(0,1-((h-T.hw)/(T.ha-T.hw))*((h-T.hw)/(T.ha-T.hw)))); // la demi-largeur de la bouche à la hauteur h
  const D=(l,h)=>{const a=Math.min(1,Math.max(0,(Math.abs(l)-W-14)/90)+Math.max(0,(h-T.ha-14)/90));return a*a*(3-2*a)*22*cyNz((l+713)/260,(h+o.y)/210,1);}; // le recul de la roche (vers l'intérieur de la montagne)
  const P=[],N=[],C=[],I=[],st=[0,0,0],pt=(l,h,col)=>{const d=D(l,h),e=1.5,dl=(D(l+e,h)-D(l-e,h))/(2*e),dh=(D(l,h+e)-D(l,h-e))/(2*e);
      P.push(o.x+bx*l+o.tx*d,o.y+h,o.z+bz*l+o.tz*d);const nx=-o.tx+bx*dl,ny=dh,nz=-o.tz+bz*dl,nl=Math.hypot(nx,ny,nz)||1;N.push(nx/nl,ny/nl,nz/nl);C.push(col[0],col[1],col[2]);};
  // les colonnes : serrées près de la bouche, larges au loin
  const COL=[];for(let l=W+6;l<FW;l+=l<W+120?20:l<300?40:70)COL.push(l);COL.push(FW);
  // les tranches : un bord là où le lit change de couleur (ou tous les 24 m), plus un pas de 1,2 m dans la hauteur de la bouche
  const H=[];{let y=Math.floor(yb/3.7)*3.7,y0=y;const c0=[0,0,0],c1=[0,0,0];cyT2Strate(y+1.85,c0);H.push(y-o.y);
   while(y<yt){y+=3.7;cyT2Strate(y+1.85,c1);if(Math.max(Math.abs(c1[0]-c0[0]),Math.abs(c1[1]-c0[1]),Math.abs(c1[2]-c0[2]))>.03||y-y0>24){H.push(y-o.y);y0=y;c0[0]=c1[0];c0[1]=c1[1];c0[2]=c1[2];}}
   H.push(yt-o.y);for(let h=-.4;h<T.ha;h+=1.2)H.push(h);H.push(T.ha);H.sort((a,b)=>a-b);}
  const row=(h0,h1,ls,col)=>{const b=P.length/3;for(const l of ls){pt(l,h0,col);pt(l,h1,col);}for(let k=0;k<ls.length-1;k++){const a=b+k*2;I.push(a,a+1,a+2,a+2,a+1,a+3);}};
  for(let k=0;k<H.length-1;k++){const h0=H[k],h1=H[k+1];if(h1-h0<.05)continue;cyT2Strate(o.y+(h0+h1)/2,st);st[0]*=CY_T2L.fac;st[1]*=CY_T2L.fac;st[2]*=CY_T2L.fac; /* (la couleur passe au carré : ×1,2 de clarté, la falaise est à l'ombre au fond de la gorge) */
    const ouv=h1>-.4+.01&&h0<T.ha-.01,w0=ouv?Math.max(wM(h0),wM(h1)):0;
    if(!ouv){const ls=[-FW];for(let j=COL.length-2;j>=0;j--)ls.push(-COL[j]);ls.push(0);for(const l of COL)ls.push(l);row(h0,h1,ls,st);}
    else{const ls=[w0];for(const l of COL)if(l>w0+2)ls.push(l);ls[ls.length-1]=FW;row(h0,h1,ls,st);row(h0,h1,ls.map(v=>-v),st);
      // le bord de la bouche suit sa courbe : le coin de la tranche, côté bouche, à la largeur exacte de chaque hauteur
      const n0=P.length/3;for(const sd of [-1,1]){const bi=n0-(2*ls.length)*(sd<0?1:2);P[bi*3]=o.x+bx*sd*wM(h0);P[bi*3+2]=o.z+bz*sd*wM(h0);P[(bi+1)*3]=o.x+bx*sd*wM(h1);P[(bi+1)*3+2]=o.z+bz*sd*wM(h1);}}}
  // LES VOUSSOIRS : le bord de la bouche (de bas en haut, gauche → droite) découpé en blocs, crème et terre cuite en alternance, la clé en or pâle
  const B=[];{const NA=60;B.push([-W,-.4]);B.push([-W,T.hw]);for(let q=1;q<NA;q++){const a=q/NA*Math.PI;B.push([-W*Math.cos(a),T.hw+(T.ha-T.hw)*Math.sin(a)]);}B.push([W,T.hw]);B.push([W,-.4]);}
  const cum=[0];for(let k=1;k<B.length;k++)cum.push(cum[k-1]+Math.hypot(B[k][0]-B[k-1][0],B[k][1]-B[k-1][1]));const Lb=cum[cum.length-1];
  const at=u=>{u=Math.max(0,Math.min(Lb,u));let k=1;while(k<cum.length-1&&cum[k]<u)k++;const w=(u-cum[k-1])/Math.max(1e-6,cum[k]-cum[k-1]);
    const l=B[k-1][0]+(B[k][0]-B[k-1][0])*w,h=B[k-1][1]+(B[k][1]-B[k-1][1])*w,tl=B[k][0]-B[k-1][0],th=B[k][1]-B[k-1][1],tn=Math.hypot(tl,th)||1;
    return [l,h,-th/tn,tl/tn];}; // la normale SORTANTE (vers la falaise) : la tangente tournée d'un quart de tour
  const nb=Math.max(9,Math.round(Lb/T.vs)|1),CR=[1.2,1.12,.99],TC=[1.08,.64,.46],CLE=[1.3,1.1,.7]; // (au-delà de 1 : la couleur passe au carré, les voussoirs ressortent sur la falaise)
  const face=(A,col,nx,ny,nz)=>{const b=P.length/3;for(const v of A){P.push(v[0],v[1],v[2]);N.push(nx,ny,nz);C.push(col[0],col[1],col[2]);}I.push(b,b+1,b+2,b,b+2,b+3);};
  const W3=(l,h,av)=>[o.x+bx*l-o.tx*av,o.y+h,o.z+bz*l-o.tz*av]; // av : la saillie vers celui qui arrive
  for(let k=0;k<nb;k++){const cle=k===(nb>>1),u0=k/nb*Lb+.18,u1=(k+1)/nb*Lb-.18,R0=cle?T.vR*1.5:T.vR,pv=cle?T.vP*1.4:T.vP,col=cle?CLE:k%2?TC:CR;
    const a=at(u0),b=at(u1),ia=[a[0],a[1]],ib=[b[0],b[1]],oa=[a[0]+a[2]*R0,a[1]+a[3]*R0],ob=[b[0]+b[2]*R0,b[1]+b[3]*R0];
    face([W3(ia[0],ia[1],pv),W3(ib[0],ib[1],pv),W3(ob[0],ob[1],pv),W3(oa[0],oa[1],pv)],col,-o.tx,0,-o.tz); // la face
    {const nl=-(a[2]+b[2])/2,nh=-(a[3]+b[3])/2;face([W3(ia[0],ia[1],0),W3(ib[0],ib[1],0),W3(ib[0],ib[1],pv),W3(ia[0],ia[1],pv)],[col[0]*.86,col[1]*.86,col[2]*.86],bx*nl,nh,bz*nl);} // l'intrados (vers l'axe)
    {const nl=(a[2]+b[2])/2,nh=(a[3]+b[3])/2;face([W3(oa[0],oa[1],pv),W3(ob[0],ob[1],pv),W3(ob[0],ob[1],0),W3(oa[0],oa[1],0)],[col[0]*.9,col[1]*.9,col[2]*.9],bx*nl,nh,bz*nl);} // l'extrados
    for(const e of [[ia,oa,-1],[ib,ob,1]]){const tl=(b[0]-a[0]),th=(b[1]-a[1]),tn=Math.hypot(tl,th)||1;face([W3(e[0][0],e[0][1],0),W3(e[0][0],e[0][1],pv),W3(e[1][0],e[1][1],pv),W3(e[1][0],e[1][1],0)],[col[0]*.8,col[1]*.8,col[2]*.8],bx*tl/tn*e[2],th/tn*e[2],bz*tl/tn*e[2]);}} // les joints
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,cyMonuMats().g);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.name='tunnelFacade';CY.grp.add(m);return I.length/3;}
/* EN VOL dans le tunnel de grès : '' (libre, ou loin de la coque), 'paroi' (murs, voûte, dôme) ou 'canyon' (le fond du gouffre de la salle).
   La coque est un VOLUME : à la distance a de l'axe, on est dedans entre le bas (le sol, ou le bas du dôme qui s'évase) et le haut (la voûte) ;
   on ne heurte que DEHORS et à moins de 12 m de la coque — une caisse sur un autre bout de route qui passe sous la salle ou loin de la galerie
   n'a rien à craindre d'elle (le relief s'en charge). Les marges : 1,2 m aux murs, 1,5 m sous la voûte, 0,8 m au-dessus du sol. */
const T2B={lo:0,hi:0,sol:false,max:0};
function cyT2Bornes(a){const n=CY_TUN2.NQ+2;let jm=0,mx=-1;for(let j=0;j<n;j++)if(T2P[j*2]>mx){mx=T2P[j*2];jm=j;}
  let lo=-1e9,hi=1e9,sol=false;
  for(let j=0;j<n-1;j++){const l0=T2P[j*2],h0=T2P[j*2+1],l1=T2P[j*2+2],h1=T2P[j*2+3];if((a-l0)*(a-l1)>0)continue;
    const w=Math.abs(l1-l0)>1e-6?(a-l0)/(l1-l0):1,h=h0+(h1-h0)*w;
    if(j<jm){if(h>lo){lo=h;sol=j===0;}}else if(h<hi)hi=h;} // avant le point le plus large : le bas (le sol, le bas du dôme) ; après : la voûte
  T2B.lo=lo;T2B.hi=hi;T2B.sol=sol;T2B.max=mx;return T2B;}
function cyTun2Heurt(p,C){const S=CY.S;if(!C||!S)return '';let bi=-1,bd=1e18;
  for(let i=C.i0;i<=C.i1;i+=2){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>130*130)return '';
  const s9=bi*S.ds+(p.x-S.x[bi])*S.tx[bi]+(p.z-S.z[bi])*S.tz[bi];if(s9<C.s0||s9>C.s1)return '';
  const o=cyT2Fr(s9,T2F),a=Math.abs(-(p.x-o.x)*o.tz+(p.z-o.z)*o.tx),h=p.y-o.y;cyT2Prof(cyT2k(s9),T2P);
  const f=T2P[1],top=T2P[3+CY_TUN2.NQ*2],B=cyT2Bornes(a+1.2);
  if(a>B.max+12||h<f-12||h>top+12)return ''; // loin de la coque
  if(a+1.2<B.max&&h>B.lo+.8&&h<B.hi-1.5)return ''; // dedans
  if(a+1.2<B.max&&h<=B.lo+.8&&B.sol)return f<-8&&a>ROAD_HALF+.5?'canyon':''; // sous le sol : le fond du GOUFFRE tue ; les trottoirs de la galerie, non (une pose au ras du bord)
  return 'paroi';}
window.dbgTunnel=function(k,o){const C=CY.tunT;if(!C)return 'pas de tunnel';if(!C.v2)return {v2:0,i0:C.i0,i1:C.i1};
  if(k==='regle'){if(o)Object.assign(CY_T2L,o);cyMonuments(CY.job);return {regle:Object.assign({},CY_T2L),tunnel:!!CY.tunT};} // (banc) changer la lumière cuite et tout rebâtir
  if(k==='heurt')return (o||[]).map(function(q){const f=cyT2Fr(L-q[0],{}),p={x:f.x-f.tz*q[1],y:f.y+q[2],z:f.z+f.tx*q[1]};return q.join('/')+' '+(cyTun2Heurt(p,C)||'libre');}); // (banc) [[m avant le bout, côté, hauteur], …] → ce que la coque fait d'une caisse en vol là
  if(k==='test'){ // LA SALLE : aucun relief au-dessus de la moitié basse de la coque (le sol du gouffre, le bas du dôme) — sinon il traverse
    let n=0,pire=-1e9,ou=[];for(let s9=L-CY_TUN2.ev0;s9<=C.s1;s9+=8){const o=cyT2Fr(s9,T2F),k9=cyT2k(s9);cyT2Prof(k9,T2P);
      const pts=[];for(let l=-T2P[2];l<=T2P[2];l+=6)pts.push([l,T2P[1]]);for(let q=0;q<=CY_TUN2.NQ;q++){const h=T2P[3+q*2];if(h<PCUBE.H*k9+CY_TUN2.hw*(1-k9))for(const sg of [-1,1])pts.push([sg*T2P[2+q*2],h]);}
      for(const q of pts){const x=o.x-o.tz*q[0],z=o.z+o.tx*q[0],hr=cyHauteur(x,z)-(o.y+q[1]);if(hr>pire)pire=hr;if(hr>.5){n++;if(ou.length<20)ou.push(Math.round(s9-L)+':'+Math.round(q[0])+'/'+Math.round(q[1])+'(+'+hr.toFixed(1)+')');}}}
    return {intrus:n,pire:+pire.toFixed(1),ou:ou.join(' ')};}
  return {v2:1,s0:Math.round(C.s0),s1:Math.round(C.s1),L:Math.round(L),anneaux:C.an,triangles:{roche:C.tri,anneaux:C.triA,facade:C.triF},pal:PCUBE.pal?PCUBE.pal.map(v=>v.toString(16)):null,meteo:LVL.cur&&LVL.cur.meteo};};
/* LA MINE ABANDONNÉE (2026-10-15, Sacha : « rajoute un module tunnel, une mine abandonnée comme dans Minecraft ») — un tronçon de ~600 m
   (les repères `mine0`/`mine1` de genCanyon, deux grandes courbes) passe dans une galerie CARRÉE taillée dans la roche : murs, plafond et sol
   en BLOCS de 8 × 6 m (pierre en quatre gris, charbon, et du minerai d'OR et de DIAMANT — c'est CASH CAR), des CADRES de bois tous les 16 m
   (deux poteaux + la poutre), des TORCHES sur un poteau sur deux, des RAILS et leurs traverses au milieu de la route, une entrée boisée dans
   une façade de falaise à chaque bout. Tout est en couleurs de sommet CUITES (matière sans éclairage : la galerie est noire, seules les
   torches et la lumière du jour aux deux bouches l'éclairent) — zéro lumière ajoutée à la scène, trois maillages, une matière chacun.
   Dedans, le soleil et le ciel baissent sur la caisse (canyonTick). Les murs touchent presque la route : on FROTTE comme aux Étroits ;
   en vol, le plafond et les murs sont durs (cyMineHeurt). */
const CY_MINE={g:3.5,MH:30,BH:6,cad:2,tor:4,m:null,f:null};
function cyMineIci(){return CY.on&&!!CY.mine&&s>=CY.mine[0]&&s<=CY.mine[1];}
function cyMineMats(){if(CY_MINE.m)return CY_MINE.m;
  const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:true});m.dispose=function(){};
  const f=new THREE.MeshBasicMaterial({color:0xffc04a,fog:false,side:THREE.DoubleSide});f.dispose=function(){};
  CY_MINE.m=m;CY_MINE.f=f;return m;}
function cyMine(iv){const S=CY.S;if(!S)return null;const i0=Math.max(1,Math.round(iv[0]/S.ds)),i1=Math.min(S.n-2,Math.round(iv[1]/S.ds));if(i1-i0<8)return null;
  const M=CY_MINE,L0=ROAD_HALF+M.g,MH=M.MH,FL=-THICK-.6,rg=mulberry32(0x3157E^(CY.job||0)),P=[],C=[],I=[],FP=[],FI=[];
  const DM=CY.deco&&CY.deco.mine,cad=DM?DM.cad:M.cad,tq=DM?DM.tq:2; // (2026-10-20, LE DÉCOR TIRÉ) les cadres tous les 16 ou 24 m, une torche par cadre ou un sur deux, les filons, le bois
  const at=(i,l,h)=>[S.x[i]-S.tz[i]*l,S.y[i]+h,S.z[i]+S.tx[i]*l];
  // LES TORCHES (sur un cadre sur deux, en quinconce) : la lumière se cuit dans les blocs voisins
  const TO=[];for(let i=i0+cad,n=0;i<=i1-cad;i+=cad,n++)if(n%tq===0)TO.push([i,((n/tq)|0)%2?1:-1]);
  const lum=(i,l,h)=>{let b=.10,w=0;for(const t of TO){const di=(i-t[0])*S.ds;if(di>60||di<-60)continue;const dl=l-t[1]*(L0-2.6),dh=h-10,d2=di*di+dl*dl+dh*dh;w+=Math.exp(-d2/420);}
    const jour=Math.max(Math.exp(-(i-i0)*S.ds/34),Math.exp(-(i1-i)*S.ds/34));b+=.80*Math.min(1.3,w)+.75*jour;return [b,w];};
  const teinte=(col,i,l,h)=>{const q=lum(i,l,h),b=q[0],w=Math.min(1,q[1]);return [col[0]*b+.16*w,col[1]*b+.08*w,col[2]*b+.01*w];};
  const quad=(a,b,c,d,col,i,l,h)=>{const o=P.length/3,k=teinte(col,i,l,h);P.push(...a,...b,...c,...d);for(let q=0;q<4;q++)C.push(k[0],k[1],k[2]);I.push(o,o+1,o+2,o,o+2,o+3);};
  const PIER=[[.46,.46,.48],[.38,.38,.40],[.53,.52,.51],[.32,.32,.34],[.42,.40,.38]];
  const bloc=DM?(()=>{const u=rg(),a1=.025*DM.or,a2=a1+.01*DM.or;if(u<a1)return [.92,.74,.22];if(u<a2)return [.38,.92,.90];if(u<a2+.055)return [.16,.16,.17];if(u<a2+.095)return [.45,.36,.27];return PIER[(rg()*PIER.length)|0];}):
    ()=>{const u=rg();if(u<.025)return [.92,.74,.22];if(u<.035)return [.38,.92,.90];if(u<.09)return [.16,.16,.17];if(u<.13)return [.45,.36,.27];return PIER[(rg()*PIER.length)|0];}; // or · diamant · charbon · terre · pierre
  // LES MURS, LE PLAFOND, LE SOL — un bloc par échantillon de route (8 m) et par rangée de 6 m
  for(let i=i0;i<i1;i++){
    for(const sd of [-1,1]){const l=sd*L0;for(let h=FL;h<MH-.01;h+=M.BH){const h2=Math.min(MH,h+M.BH);quad(at(i,l,h),at(i+1,l,h),at(i+1,l,h2),at(i,l,h2),bloc(),i,l,h+3);}}
    const NC=8;for(let c=0;c<NC;c++){const la=-L0+2*L0*c/NC,lb=-L0+2*L0*(c+1)/NC,lm=(la+lb)/2;
      quad(at(i,la,MH),at(i+1,la,MH),at(i+1,lb,MH),at(i,lb,MH),bloc(),i,lm,MH);
      quad(at(i,la,FL),at(i+1,la,FL),at(i+1,lb,FL),at(i,lb,FL),rg()<.3?[.40,.33,.25]:PIER[(rg()*PIER.length)|0],i,lm,FL);}}
  // une BOÎTE posée dans le repère de la route (le long, en travers, en hauteur) — les faces du haut un peu plus claires
  const boite=(i,l,h,a,w,hh,col)=>{const tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx,cx=S.x[i]+bx*l,cz=S.z[i]+bz*l,cy=S.y[i]+h;
    const v=(sa,sw,sh)=>[cx+tx*a*sa+bx*w*sw,cy+hh*sh,cz+tz*a*sa+bz*w*sw];
    const F=[[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],.8],[[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1],1.15],[[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1],.9],
      [[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1],.9],[[-1,-1,-1],[-1,-1,1],[1,-1,1],[1,-1,-1],1],[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],1]];
    for(const f of F)quad(v(...f[0]),v(...f[1]),v(...f[2]),v(...f[3]),[col[0]*f[4],col[1]*f[4],col[2]*f[4]],i,l,h);};
  const BV={clair:[[.56,.39,.21],[.44,.30,.16]],sombre:[[.34,.24,.15],[.26,.18,.11]],rouge:[[.62,.24,.16],[.48,.18,.12]]}[DM?DM.bois:'clair'],BOIS=BV[0],BOIS2=BV[1];
  // LES CADRES : deux poteaux contre les murs, la poutre sous le plafond, deux jambes de force
  for(let i=i0+cad;i<=i1-cad;i+=cad){
    for(const sd of [-1,1]){boite(i,sd*(L0-1),(FL+MH)/2,.8,.8,(MH-FL)/2,BOIS);boite(i,sd*(L0-4),MH-3.2,.6,2.6,.6,BOIS2);}
    boite(i,0,MH-1,.85,L0,1,BOIS2);}
  // LES TORCHES : le bâton sur le poteau, la flamme en cube qui brille (sa propre matière, sans brouillard)
  for(const t of TO){const i=t[0],l=t[1]*(L0-2.6);boite(i,l,9,.22,.22,1.1,[.42,.30,.16]);
    const tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx,cx=S.x[i]+bx*l,cz=S.z[i]+bz*l,cy=S.y[i]+10.5,r=.55,o=FP.length/3;
    for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1])FP.push(cx+tx*r*a+bx*r*b,cy+r*c,cz+tz*r*a+bz*r*b);
    FI.push(o,o+1,o+3,o,o+3,o+2, o+4,o+6,o+7,o+4,o+7,o+5, o,o+4,o+5,o,o+5,o+1, o+2,o+3,o+7,o+2,o+7,o+6, o,o+2,o+6,o,o+6,o+4, o+1,o+5,o+7,o+1,o+7,o+3);}
  // LES RAILS : deux fers au milieu de la route et leurs traverses tous les ~2,7 m (décor : la caisse roule dessus)
  for(let i=i0;i<i1;i++){for(const l of [-2.1,2.1])quad(at(i,l-.22,.26),at(i+1,l-.22,.26),at(i+1,l+.22,.26),at(i,l+.22,.26),[.62,.62,.66],i,l,.3);
    for(let q=0;q<3;q++){const u=q/3,ix=i,cx=S.x[i]+(S.x[i+1]-S.x[i])*u,cz=S.z[i]+(S.z[i+1]-S.z[i])*u,cy=S.y[i]+(S.y[i+1]-S.y[i])*u+.12,tx=S.tx[i],tz=S.tz[i],bx=-tz,bz=tx;
      const v=(a,w)=>[cx+tx*a+bx*w,cy,cz+tz*a+bz*w];quad(v(-.5,-3.2),v(.5,-3.2),v(.5,3.2),v(-.5,3.2),[.40,.28,.15],ix,0,.2);}}
  // LES BOUCHES : la façade de falaise (un cadre de quatre pans autour de l'ouverture, aussi large que la place le permet) et le portique de bois
  const FAC=[],FJ=[];
  for(const e of [i0,i1]){const tx=S.tx[e],tz=S.tz[e],yb=Math.min(S.F[e],S.y[e]-40)-10,top=Math.max(S.y[e]+MH+90,S.R[e]+30);let W=320;
    for(;W>L0+30;W-=40){let ok=true;for(let j=0;j<S.n&&ok;j+=2){if(Math.abs(j-e)*S.ds<260)continue;const dx=S.x[j]-S.x[e],dz=S.z[j]-S.z[e],al=dx*tx+dz*tz,la=-dx*tz+dz*tx;
      if(Math.abs(al)<30&&Math.abs(la)<W+40&&S.y[j]>yb-20&&S.y[j]<top+20)ok=false;}if(ok)break;}
    const pt=(l,y)=>[S.x[e]-tz*l,y,S.z[e]+tx*l],pan=(la,lb,ya,yb2)=>{const o=FAC.length/3;FAC.push(...pt(la,ya),...pt(lb,ya),...pt(lb,yb2),...pt(la,yb2));FJ.push(o,o+1,o+2,o,o+2,o+3);};
    pan(-W,-L0,yb,top);pan(L0,W,yb,top);pan(-L0,L0,S.y[e]+MH,top);pan(-L0,L0,yb,S.y[e]+FL);
    for(const sd of [-1,1])boite(e,sd*(L0-1.4),(FL+MH)/2,1.6,1.4,(MH-FL)/2+.5,BOIS2);boite(e,0,MH-.4,1.6,L0+1,1.6,BOIS);}
  const mk=(P9,I9,mat,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(I9);
    g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);return m;};
  mk(P,I,cyMineMats(),C);mk(FP,FI,CY_MINE.f);mk(FAC,FJ,cyMonuMats().b);
  return {i0:i0,i1:i1,L0:L0};}
function cyMineHeurt(p,M){const S=CY.S;if(!M)return false;let bi=-1,bd=1e18;
  for(let i=Math.max(0,M.i0-3);i<=Math.min(S.n-1,M.i1+3);i++){const d=(p.x-S.x[i])**2+(p.z-S.z[i])**2;if(d<bd){bd=d;bi=i;}}
  if(bi<0||bd>(M.L0+60)**2)return false;const yr=S.y[bi],lt=(p.x-S.x[bi])*-S.tz[bi]+(p.z-S.z[bi])*S.tx[bi],a=Math.abs(lt);
  if(bi<M.i0||bi>M.i1){ // devant une bouche : la façade (hors de l'ouverture) est dure
    const e=bi<M.i0?M.i0:M.i1,al=(p.x-S.x[e])*S.tx[e]+(p.z-S.z[e])*S.tz[e];if(Math.abs(al)<3&&(a>M.L0-1||p.y>S.y[e]+CY_MINE.MH-1))return true;return false;}
  if(a<M.L0&&p.y>yr+CY_MINE.MH-1.5)return true;                               // le plafond
  return a>M.L0-1.2&&a<M.L0+20&&p.y<yr+CY_MINE.MH+2&&p.y>yr-THICK-3;}       // les murs
/* LA ROUTE 66 (2026-10-15 soir, Sacha : « le niveau dans le canyon doit commencer par une longue ligne droite, une vieille station-service
   et un panneau ROUTE 66 ») — au départ, sur le plateau de la vallée des Mitaines (genCanyon : la droite de 820 m), deux décors posés au
   sol, à côté de la route (jamais dessus : ils restent à ROAD_HALF + 6 m au moins) :
   · le PANNEAU ROUTE 67 (rebaptisé le 17/10 par Sacha) à 150 m, à gauche : le bouclier blanc bordé de noir sur ses deux poteaux, « ROUTE » et un grand « 67 » en pixels
     (une police 3 × 5 et 5 × 7 en petits pavés), tourné vers la caisse qui arrive ;
   · la VIEILLE STATION-SERVICE à 430 m, à droite : le bâtiment crème au bandeau rouge passé, sa porte, sa vitrine, la porte du garage, l'auvent
     sur deux piliers, l'îlot et ses deux pompes rétro (rouge et turquoise, globes blancs), des fûts rouillés, le dallage fissuré, et le
     grand mât « GAS » visible de loin.
   Tout est en pavés à couleurs de sommets, cuits en UNE géométrie aux coordonnées du monde, dessinée par la matière des arbres du canyon
   (`cyMonuMats().t` : la lumière, l'ombre portée des parois et le brouillard du canyon — aucun programme neuf). Console : dbgCanyon('r66'). */
const CY_FONTE={R:['XX.','X.X','XX.','X.X','X.X'],O:['.X.','X.X','X.X','X.X','.X.'],U:['X.X','X.X','X.X','X.X','XXX'],T:['XXX','.X.','.X.','.X.','.X.'],
  E:['XXX','X..','XX.','X..','XXX'],G:['.XX','X..','X.X','X.X','.XX'],A:['.X.','X.X','XXX','X.X','X.X'],S:['.XX','X..','.X.','..X','XX.'],
  6:['.XXX.','X....','X....','XXXX.','X...X','X...X','.XXX.'],7:['XXXXX','....X','...X.','..X..','.X...','.X...','.X...'],
  M:['X...X','XX.XX','X.X.X','X...X','X...X'],L:['X..','X..','X..','X..','XXX'],N:['X..X','XX.X','X.XX','X..X','X..X'],I:['XXX','.X.','.X.','.X.','XXX'],D:['XX.','X.X','X.X','X.X','XX.']}; // (2026-10-20) + M, L, N, I, D : le MOTEL, le DINER
function cyRoute66(){
  const S=CY.S;if(!S||S.n<80)return null;
  const P=[],C=[],I=[],O=new THREE.Vector3(),Ax=new THREE.Vector3(),Az=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0),g0=new THREE.BoxGeometry(1,1,1);
  let sd=1,ks=1;const rep=(s9,lat,cote)=>{const i=Math.min(S.n-2,Math.max(1,Math.round(s9/S.ds))),tx=S.tx[i],tz=S.tz[i];sd=cote; // le repère : x vers le dehors de la route, z le long de la route, y en haut
    Ax.set(-tz*cote,0,tx*cote);Az.set(tx,0,tz);O.set(S.x[i],0,S.z[i]).addScaledVector(Ax,lat);return {i:i,yr:S.y[i]};};
  const pave=(x,y,z,sx,sy,sz,col,rx,G)=>{const g1=G||g0,b=P.length/3,p=g1.attributes.position,n=g1.index,ca=Math.cos(rx||0),sa=Math.sin(rx||0);
    for(let k=0;k<p.count;k++){let lx=p.getX(k)*sx,ly=p.getY(k)*sy,lz=p.getZ(k)*sz;if(rx){const t=lx*ca-lz*sa;lz=lx*sa+lz*ca;lx=t;}
      const wx=(x+lx)*ks,wy=(y+ly)*ks,wz=(z+lz)*ks, /* ks : l'échelle du décor en cours (la station ×1,6 : la route fait 56 m de large) */v=.9+.18*Math.abs(Math.sin((b+k)*12.9898)); // un grain de vieillesse, sommet par sommet
      P.push(O.x+Ax.x*wx+Az.x*wz,O.y+wy,O.z+Ax.z*wx+Az.z*wz);C.push(col[0]*v,col[1]*v,col[2]*v);}
    if(n)for(let k=0;k<n.count;k++)I.push(b+n.getX(k));else for(let k=0;k<p.count;k++)I.push(b+k);};
  const solMin=(pts)=>{let m=1e9;for(const q of pts){const x=O.x+Ax.x*q[0]+Az.x*q[1],z=O.z+Ax.z*q[0]+Az.z*q[1];m=Math.min(m,cyHauteur(x,z));}return m;};
  const texte=(mot,x0,y0,z,cel,col,ep)=>{let x=x0;for(const ch of mot){const G=CY_FONTE[ch];if(!G){x+=cel*2;continue;}const w=G[0].length; // les pavés d'un mot, lus de GAUCHE à DROITE pour qui regarde vers +z
      for(let r=0;r<G.length;r++)for(let c=0;c<w;c++)if(G[r][c]==='X')pave(sd*(x+(c+.5)*cel),y0-(r+.5)*cel,z,cel*1.02,cel*1.02,ep,col);x+=(w+1)*cel;}};
  const larg=mot=>{let n=0;for(const ch of mot){const G=CY_FONTE[ch];n+=(G?G[0].length:1)+1;}return n-1;};
  const NOIR=[.08,.08,.09],BLANC=[.93,.92,.88],CREME=[.88,.80,.64],ROUGE=[.70,.20,.15],GRIS=[.55,.53,.50],BETON=[.62,.59,.53],ROUILLE=[.52,.26,.13],TURQ=[.22,.62,.60],VITRE=[.20,.32,.38],BOIS=[.42,.30,.20];
  const DR=CY.deco&&CY.deco.r66,rr=DR?mulberry32((CY.deco.sd^0x6606)>>>0):null;CY.r66m2=[]; // (2026-10-20, LE DÉCOR TIRÉ) la Route 67 tirée — DR nul : celle d'avant
  // ---- LE PANNEAU ROUTE 66 (à gauche, à 150 m) ----
  if(!DR||DR.panneau){const R9=rep(150,ROAD_HALF+5,DR?DR.pc:-1),sol=solMin([[0,-1],[0,1],[1,0],[-1,0]]),cel=.42,haut=R9.yr+2.2+17*cel*.5; O.y=0;
   const bas=haut-17*cel*.5;for(const px of [-1.5,1.5])pave(px,(sol+bas)/2,0,.3,Math.max(.5,bas-sol+.3),.3,GRIS);
   const M=['..KKKKKKKKKKK..','.KWWWWWWWWWWWK.','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KKKKKKKKKKKKKKK',
     'KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','KWWWWWWWWWWWWWK','.KWWWWWWWWWWWK.','..KWWWWWWWWWK..','...KKWWWWWKK...','.....KKKKK.....'];
   const y0=haut+17*cel*.5;for(let r=0;r<M.length;r++)for(let c=0;c<15;c++){const k=M[r][c];if(k==='.')continue;pave((c-7)*cel,y0-(r+.5)*cel,0,cel,cel,.18,k==='K'?NOIR:BLANC);}
   const zf=-.13,ct=cel*.47;texte('ROUTE',-larg('ROUTE')*ct/2,y0-1.4*cel,zf,ct,NOIR,.06); // la face tournée vers la caisse qui arrive (−z)
   const c6=cel*1.07;texte('67',-larg('67')*c6/2,y0-7.6*cel,zf,c6,NOIR,.06);} // (2026-10-17, Sacha : « doit s'appeler la route 67 ») : ROUTE 67
  // ---- LA VIEILLE STATION-SERVICE (à droite, à 430 m) ----
  if(!DR||DR.station){const KS=1.6,R9=rep(DR?DR.ss:430,ROAD_HALF+25,DR?DR.sc:1),RM=26,cx=4*KS,sol=solMin([[cx,0],[cx+RM,0],[cx-RM,0],[cx,RM],[cx,-RM]]),top=R9.yr-.3;
   /* LA MESA : la route flotte au moins 18 m au-dessus du plateau (la règle d'or du canyon) — posée au sol, la station était cachée sous le
      bord. Elle trône sur un petit piton de grès aux strates du canyon, son sommet au ras du bitume, à 4 m du bord (elle ne le touche pas). */
   const STR=[[.96,.89,.78],[.96,.81,.49],[.95,.67,.55],[.89,.50,.34],[.67,.29,.20],[.96,.81,.49],[.69,.61,.72],[.95,.67,.55]];
   O.y=0;{let y=sol-4,k=0;while(y<top-1.2){const h=Math.min(top-1.2-y,5+((k*37)%5)),r0=RM*(1+.05*Math.sin(k*2.1))+(top-y)*.035,r1=RM*(1+.05*Math.sin(k*2.1+1.3))+(top-y-h)*.035;
       const cy9=new THREE.CylinderGeometry(r1,r0,h,9,1,false,k*.4);pave(cx,y+h/2,0,1,1,1,STR[k%STR.length],0,cy9);cy9.dispose();y+=h;k++;}
     const cap=new THREE.CylinderGeometry(RM+.9,RM+.4,1.4,9,1,false,.2);pave(cx,top-.6,0,1,1,1,[.58,.30,.20],0,cap);cap.dispose();} // la corniche : la dalle de grès brun
   CY.r66m={x:O.x+Ax.x*cx,z:O.z+Ax.z*cx,r:RM+.9,y0:sol-4,y1:top};
   O.y=top;ks=KS; /* la station, à l'échelle 1,6 */
   pave(4,-1.2,0,25,2.6,21,BETON);                                                     // le dallage (il descend dans le sol : jamais en l'air)
   for(let k=0;k<5;k++)pave(-6+k*4.8,.11,-5+((k*7)%10),.12,.02,3.2,[.36,.33,.30],.6); // ses fissures
   // le bâtiment
   pave(10,2.2,1,9,4.4,12,CREME);pave(10,3.75,1,9.12,.65,12.12,ROUGE);pave(10,4.55,1,9.8,.35,12.8,[.48,.43,.38]);
   pave(5.47,1.2,-1.6,.08,2.4,1.5,BOIS);pave(5.47,2.1,2.6,.08,1.5,3.4,VITRE);pave(5.46,2.1,2.6,.1,1.66,.12,CREME);
   pave(5.47,1.55,-5,.08,3.1,3.3,[.66,.64,.58]);for(let k=0;k<5;k++)pave(5.43,.4+k*.62,-5,.04,.06,3.3,[.48,.46,.42]); // la porte du garage et ses lattes
   pave(10,5.5,4.5,.5,1.8,.5,[.55,.42,.36]);                                           // la cheminée
   // l'auvent et l'îlot des pompes
   pave(-1,4.65,1,8.6,.5,10.5,BLANC);pave(-1,4.95,1,8.7,.12,10.6,ROUGE);for(const pz of [-3.4,5.4])pave(-1,2.2,pz,.38,4.4,.38,BLANC);
   pave(-1,.13,1,1.6,.26,8.2,BETON);
   const pompe=(pz,col)=>{pave(-1,1.15,pz,.85,1.9,.62,col);pave(-1.44,1.35,pz,.03,.55,.4,[.92,.88,.74]);pave(-1,2.15,pz,.6,.12,.5,[.2,.2,.2]);
     const b=P.length/3,gi=new THREE.IcosahedronGeometry(.36,1),p=gi.attributes.position;for(let k=0;k<p.count;k++){const x=(-1+p.getX(k))*ks,y=(2.55+p.getY(k))*ks,z=(pz+p.getZ(k))*ks;P.push(O.x+Ax.x*x+Az.x*z,O.y+y,O.z+Ax.z*x+Az.z*z);C.push(.97,.96,.9);}for(let k=0;k<p.count;k++)I.push(b+k);gi.dispose();
     pave(-1.3,.9,pz+.42,.06,.06,.5,NOIR);};                                         // le tuyau
   pompe(-1.2,ROUGE);pompe(3.4,TURQ);
   for(const f of [[15.6,-4.2],[15.4,-3.2],[16.2,-3.6]])pave(f[0],.45,f[1],.7,.9,.7,ROUILLE); // des fûts rouillés
   pave(15.8,.95,-3.7,.74,.08,.74,[.4,.2,.1]);
   // le grand mât « GAS », visible de loin, au bord du dallage
   pave(-7.5,6,8,.4,12,.4,GRIS);pave(-7.5,12.4,8,4.6,2.6,.36,ROUGE);pave(-7.5,12.4,7.78,4.1,2.1,.1,BLANC);
   texte('GAS',-7.5*sd-larg('GAS')*.42/2*(DR?1:sd)+0,13.45,7.7,.42,ROUGE,.08);ks=1;}
  if(DR){ /* (2026-10-20) LE MOTEL sur son piton (en face de la station), LES CARCASSES de voitures, LES CACTUS, LES PANNEAUX publicitaires — au sol du plateau,
             à côté de la route (jamais dessus : ROAD_HALF + 10 m au moins ; seuls les panneaux montent plus haut que la dalle, à 30 m du bord) */
    const STR=[[.96,.89,.78],[.96,.81,.49],[.95,.67,.55],[.89,.50,.34],[.67,.29,.20],[.96,.81,.49]],ROUX=[[.52,.26,.13],[.44,.30,.22],[.36,.40,.42],[.58,.44,.30],[.30,.42,.52]],VERT=[.30,.48,.24];
    const B9=Math.min(820,(CY.sQ&&CY.sQ.breche0!=null?CY.sQ.breche0:600)+120),bas=(R9,sol,m)=>sol<R9.yr-THICK-m; // (la vallée des Mitaines seulement : au-delà, la route plonge dans la gorge)
    if(DR.motel){const KS=1.5,s9=130+rr()*120,R9=rep(s9,ROAD_HALF+25,DR.panneau?-DR.pc:(rr()<.5?-1:1)),RM=26,cx=5*KS,sol=solMin([[cx,0],[cx+RM,0],[cx-RM,0],[cx,RM],[cx,-RM]]),top=R9.yr-.3;
      O.y=0;{let y=sol-4,k=0;while(y<top-1.2){const h=Math.min(top-1.2-y,5+((k*37)%5)),r0=RM*(1+.05*Math.sin(k*2.3))+(top-y)*.035,r1=RM*(1+.05*Math.sin(k*2.3+1.3))+(top-y-h)*.035;
          const cy9=new THREE.CylinderGeometry(r1,r0,h,9,1,false,k*.5);pave(cx,y+h/2,0,1,1,1,STR[(k+2)%STR.length],0,cy9);cy9.dispose();y+=h;k++;}
        const cap=new THREE.CylinderGeometry(RM+.9,RM+.4,1.4,9,1,false,.2);pave(cx,top-.6,0,1,1,1,[.58,.30,.20],0,cap);cap.dispose();}
      CY.r66m2.push({x:O.x+Ax.x*cx,z:O.z+Ax.z*cx,r:RM+.9,y0:sol-4,y1:top});
      O.y=top;ks=KS;const MUR=[.90,.70,.52],TOIT=rr()<.5?TURQ:[.80,.30,.22];
      pave(5,-1.2,0,22,2.6,30,BETON);pave(11,1.7,0,8,3.4,26,MUR);pave(11,3.6,0,8.8,.45,26.8,TOIT);pave(11,3.95,0,9.4,.25,27.4,[.48,.43,.38]);
      for(let k=0;k<6;k++){const z=-11+k*4.4;pave(6.96,1.15,z,.08,2.3,1.3,k&1?TURQ:[.80,.30,.22]);pave(6.96,1.9,z+1.7,.08,.9,1.3,VITRE);}
      pave(4.6,.12,0,2.2,.24,26,BETON);for(let k=0;k<7;k++)pave(4,1.9,-12.6+k*4.2,.25,3.6,.25,BLANC);pave(4,3.75,0,3.4,.18,27,TOIT); // la galerie couverte
      pave(-4,7,-11,.45,14,.45,GRIS);pave(-4,13.2,-11,7.4,2.8,.4,[.15,.35,.55]);pave(-4,13.2,-11.22,6.9,2.3,.1,[.96,.86,.40]);
      texte('MOTEL',-4*sd-larg('MOTEL')*.32/2,14.0,-11.3,.32,[.80,.18,.14],.08);ks=1;}
    for(let k=0;k<DR.carcasses;k++){const s9=60+rr()*(B9-60),R9=rep(s9,ROAD_HALF+14+rr()*60,rr()<.5?-1:1),sol=solMin([[0,0],[2,2],[-2,-2]]),col=ROUX[(rr()*ROUX.length)|0],ro=rr()*6.28,kr=1.3; // la carcasse
      if(!bas(R9,sol,6))continue;O.y=sol-.3;ks=kr;pave(0,.75,0,2.1,.9,4.6,col,ro);pave(Math.sin(ro)*.3,1.55,Math.cos(ro)*-.3,1.9,.75,2.3,[col[0]*.8,col[1]*.8,col[2]*.8],ro);
      for(const w of [[-1,1.5],[1,1.5],[-1,-1.5],[1,-1.5]]){const wx=w[0]*Math.cos(ro)-w[1]*Math.sin(ro),wz=w[0]*Math.sin(ro)+w[1]*Math.cos(ro);if(rr()<.75)pave(wx,.35,wz,.35,.7,.7,NOIR,ro);}ks=1;}
    for(let k=0;k<DR.cactus;k++){const s9=40+rr()*(B9-40),R9=rep(s9,ROAD_HALF+10+rr()*rr()*150,rr()<.5?-1:1),sol=solMin([[0,0]]),h=6+rr()*7,ro=rr()*6.28; // le saguaro
      if(!bas(R9,sol+h,2))continue;O.y=sol-.3;pave(0,h/2,0,.9,h,.9,VERT,ro);pave(0,h+.15,0,.6,.3,.6,VERT,ro);
      for(const sx of [-1,1]){if(rr()<.3)continue;const ya=h*(.35+rr()*.25),ha=h*(.25+rr()*.2),ex=sx*1.6;const wx=ex*Math.cos(ro),wz=ex*Math.sin(ro);
        pave(wx*.5,ya,wz*.5,1.6,.65,.65,VERT,ro);pave(wx,ya+ha/2,wz,.65,ha,.65,VERT,ro);}}
    for(let k=0;k<DR.pubs;k++){const s9=110+rr()*(B9-110),R9=rep(s9,ROAD_HALF+30+rr()*30,rr()<.5?-1:1),sol=solMin([[0,0],[3,0],[-3,0]]),mot=['EAT','MOTEL','GAS','DINER'][(rr()*4)|0],
        hb=R9.yr+8,cel=.9,W=larg(mot)*cel+3,fond=rr()<.5?[.95,.82,.30]:[.88,.30,.22];O.y=0;if(!bas(R9,sol,6))continue;
      for(const px of [-W*.35,W*.35])pave(px,(sol+hb)/2,0,.5,hb-sol,.5,GRIS);pave(0,hb+2.6,0,W,5.2,.4,fond);pave(0,hb+2.6,-.25,W-.6,4.6,.1,BLANC);
      texte(mot,-larg(mot)*cel/2,hb+2.6+2.5*cel,-.36,cel,fond===BLANC?NOIR:[.10,.10,.12],.1);}}
  g0.dispose();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setIndex(I);g.computeVertexNormals();g.computeBoundingSphere();return g;}
function cyMonuments(seed){
  if(CY.grp){for(const o of CY.grp.children.slice()){CY.grp.remove(o);if(o.geometry&&o.userData.jeter)o.geometry.dispose();}}
  const M9=cyMonuMats();CY.grp.visible=true;
  try{cyCouloir();}catch(e){console.warn('canyon : couloir',e);} // les parois du COULOIR et la galerie du TUNNEL d'arrivée
  if(CY.arche){const m=new THREE.Mesh(cyArcheGeo(CY.arche),M9.a);m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();CY.grp.add(m);}
  const D9=CY.deco;
  {const S=CY.S,N9=Math.round(PAL.b('cyArbres',700)*(D9?D9.arbres.k:1)),rg=mulberry32((seed^0x7A33)>>>0),L9=[]; // (2026-10-20) × la ripisylve tirée
   if(S)for(let k=0;k<N9*6&&L9.length<N9;k++){const i=Math.floor(rg()*(S.n-1));if(S.zS[i]>.5)continue;const sg=rg()<.5?-1:1,lat=S.wR[i]+3+rg()*26,tx=S.tx[i],tz=S.tz[i],x=S.x[i]-tz*sg*lat,z=S.z[i]+tx*sg*lat,o9={};
     const h=cyHauteur(x,z,o9);if(o9.eau||o9.rk>.3||h>S.F[i]+6||TUN2_ON&&i*S.ds>L-CY_TUN2.ev0-80)continue;const ht=(9+rg()*13)*(1+.4*rg());if(h+ht>S.y[i]-THICK-4)continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}
   const gA=D9&&D9.arbres.nm!=='vert'?(CY_ARB.g[D9.arbres.nm]||(CY_ARB.g[D9.arbres.nm]=cyArbreGeo(CY_ARB[D9.arbres.nm]))):(CY.gArb||(CY.gArb=cyArbreGeo())); // les peupliers : verts, dorés d'automne, sombres
   if(L9.length){const im=new THREE.InstancedMesh(gA,M9.t,L9.length),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0);
     L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(new THREE.Vector3(a[0],a[1],a[2]),q9,new THREE.Vector3(a[3]*.9,a[3],a[3]*.9));im.setMatrixAt(k,mt);});
     im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;CY.grp.add(im);}CY.nArb=L9.length;}
  if(CY.chem.length){if(!CY.gChem)CY.gChem=[cyChemGeo(0),cyChemGeo(1)];const mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),s9=new THREE.Vector3(),p9=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0);
    for(let v=0;v<2;v++){const L9=CY.chem.filter(c=>c.v===v);if(!L9.length)continue;const im=new THREE.InstancedMesh(CY.gChem[v],M9.i,L9.length);
      L9.forEach(function(c,k){q9.setFromAxisAngle(ax,c.a);s9.set(c.r/.5,c.h,c.r/.5);p9.set(c.x,c.y,c.z);mt.compose(p9,q9,s9);im.setMatrixAt(k,mt);});
      im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;CY.grp.add(im);}}
  CY.r66=0;CY.r66m=null;CY.r66m2=[];try{const g9=cyRoute66();if(g9){const m=new THREE.InstancedMesh(g9,M9.t,1);m.setMatrixAt(0,new THREE.Matrix4());m.instanceMatrix.needsUpdate=true;m.userData.jeter=1;m.matrixAutoUpdate=false;m.updateMatrix();m.frustumCulled=false;m.name='canyon route 66';CY.grp.add(m);CY.r66=g9.attributes.position.count;}}catch(e){console.warn('canyon : route 66',e);} /* une INSTANCE : le même programme que les arbres (canyonChauffe le compile au menu) — un Mesh simple en compilait un neuf en course */ // (2026-10-15 soir) la station-service et le panneau ROUTE 66 du départ
  CY.rais=null; // (14/10 soir) les RAIS DE LUMIÈRE retirés : sur la paroi ils se lisaient comme des traînées de ciel étalé (verdict de Sacha)
  CY.decoN=null;if(D9){try{cyEboulis(D9,M9);}catch(e){console.warn('canyon : éboulis',e);}}
  CY_VAU.n=D9?D9.vautours:5; // (2026-10-20) 2 à 9 vautours (5 avant)
  CY.grp.updateMatrixWorld(true);
  CY.monu=!!(CY.arche||CY.chem.length||CY.r66m2&&CY.r66m2.length);
}
/* (2026-10-20, LE DÉSERT AU HASARD) LE CUISEUR : des pièces à l'unité (positions, couleurs de sommet ; indexées ou non) posées par une matrice et une teinte,
   CUITES en UNE géométrie aux coordonnées du monde — dessinée en une instance par la matière des décors (canyon : M9.t ; dunes : leur M9.t) : aucun programme
   neuf, un appel de dessin. Rien d'alloué par sommet (un vecteur). */
function decoCuiseur(){const P=[],C=[],v=new THREE.Vector3();
  return {ajoute:function(g,mt,te){const p=g.attributes.position,c=g.attributes.color,ix=g.index,n=ix?ix.count:p.count,r=te?te[0]:1,gg=te?te[1]:1,b=te?te[2]:1;
      for(let k=0;k<n;k++){const j=ix?ix.getX(k):k;v.fromBufferAttribute(p,j).applyMatrix4(mt);P.push(v.x,v.y,v.z);if(c)C.push(c.getX(j)*r,c.getY(j)*gg,c.getZ(j)*b);else C.push(r,gg,b);}},
    n:function(){return P.length/3;},
    fin:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g;}};}
const CY_ARB={automne:[[.86,.66,.16],[.78,.54,.12],[.94,.76,.26]],sombre:[[.22,.40,.14],[.18,.34,.10],[.27,.45,.16]],g:{}}; // (2026-10-20) les houppiers des peupliers tirés
/* LES ÉBOULIS (2026-10-20) : des blocs tombés des parois, sur le fond de la gorge (et dans le lit quand la rivière est à sec), dans les couleurs des strates
   de leur hauteur — jamais à moins de 4 m sous la dalle ; cuits en une géométrie */
function cyEboulis(D,M9){const S=CY.S,t9=performance.now();if(!S||!D.eboulis)return;
  const rg=mulberry32((D.sd^0xEB0E1)>>>0),o9={},c9=[0,0,0],CU=decoCuiseur(),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(),v9=new THREE.Vector3(),s9=new THREE.Vector3(),K=Math.sqrt(lvPiste());
  if(!CY.gBloc)CY.gBloc=new THREE.IcosahedronGeometry(1,0);let n=0;
  for(let k=0;k<D.eboulis*4&&n<D.eboulis;k++){const i=1+Math.floor(rg()*(S.n-2));if(S.zS[i]>.5||TUN2_ON&&i*S.ds>L-CY_TUN2.ev0-80)continue;
    const sg=rg()<.5?-1:1,l0=D.eau>0?S.wR[i]+1:2,lat=l0+rg()*Math.max(4,S.wF[i]-l0),x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=cyHauteur(x,z,o9),sz=(2+rg()*rg()*9)*Math.sqrt(K);
    if(o9.eau||o9.rk>.5||h+sz>S.y[i]-THICK-4)continue;cyT2Strate(h+rg()*40,c9);const f=.78+rg()*.2;
    e9.set(rg()*3,rg()*6.28,rg()*3);q9.setFromEuler(e9);mt.compose(v9.set(x,h-sz*.3,z),q9,s9.set(sz,sz*(.6+rg()*.3),sz*(.8+rg()*.4)));CU.ajoute(CY.gBloc,mt,[c9[0]*f,c9[1]*f,c9[2]*f]);n++;}
  if(CU.n()){const g=CU.fin(),im=new THREE.InstancedMesh(g,M9.t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;
    im.userData.jeter=1;im.name='canyon éboulis';CY.grp.add(im);}
  CY.decoN={blocs:n,sommets:CU.n(),ms:Math.round(performance.now()-t9)};}
const CY_VAU={n:5,im:null,L:[],m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),sc:new THREE.Vector3()};
function cyVautourGeo(){const P=[],C=[],t=(a,b,c,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let k=0;k<3;k++)C.push(col[0],col[1],col[2]);};
  const nr=[.10,.08,.07],br=[.18,.14,.11],pl=[.30,.24,.20],ro=[.55,.24,.20];
  t([0,0,1.1],[-.18,0,-.2],[.18,0,-.2],nr);t([0,.12,.5],[-.16,0,-.1],[.16,0,-.1],br);t([0,0,-.2],[-.2,0,-.85],[.2,0,-.85],nr); // le corps, la queue
  t([0,.02,1.1],[-.05,.04,1.35],[.05,.04,1.35],ro); // la tête nue
  for(const sd of [-1,1]){const W=[[sd*.15,0,.35],[sd*1.6,.30,.45],[sd*2.9,.62,.10],[sd*3.2,.66,-.20],[sd*1.6,.30,-.35],[sd*.15,0,-.25]];
    t(W[0],W[1],W[5],nr);t(W[1],W[4],W[5],br);t(W[1],W[2],W[4],nr);t(W[2],W[3],W[4],pl); // l'aile, les rémiges écartées au bout
    for(let k=0;k<4;k++){const z=.05-k*.08;t([sd*2.9,.62,z],[sd*3.5,.70,z+.02],[sd*3.45,.68,z-.06],nr);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g;}
function cyVautours(dt){const V=CY_VAU,on=CY.on&&started&&!gameOver&&mode!=='boom';
  if(!V.im){if(!on)return;V.im=new THREE.InstancedMesh(cyVautourGeo(),cyMonuMats().t,9); /* (2026-10-20) la place de 9 : le tirage en pose de 2 à 9 (count = V.n) */V.im.frustumCulled=false;V.im.matrixAutoUpdate=false;V.im.count=0;scene.add(V.im);}
  V.im.visible=on;if(!on){V.L.length=0;return;}
  const S=CY.S,cp=carGroup.position,i0=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));
  for(let k=0;k<V.n;k++){let b=V.L[k];
    if(!b||cp.distanceTo(V.v.set(b.cx,b.cy,b.cz))>2200){const i=Math.min(S.n-1,i0+Math.round((350+Math.random()*900)/S.ds)),lat=(Math.random()-.5)*S.wF[i]*1.6;
      b=V.L[k]={cx:S.x[i]-S.tz[i]*lat,cz:S.z[i]+S.tx[i]*lat,cy:Math.min(S.R[i]-40,S.y[i]+120+Math.random()*260),r:55+Math.random()*80,a:Math.random()*6.28,w:(.16+Math.random()*.12)*(Math.random()<.5?-1:1),k:6+Math.random()*3};}
    if(!paused)b.a+=b.w*dt;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=b.cy+Math.sin(b.a*2.3)*6;
    V.e.set(Math.sin(b.a*1.7)*.05,b.w>0?-b.a:Math.PI-b.a,b.w>0?.32:-.32);V.q.setFromEuler(V.e);V.m4.compose(V.v.set(x,y,z),V.q,V.sc.set(b.k,b.k,b.k));V.im.setMatrixAt(k,V.m4);}
  V.im.count=V.n;V.im.instanceMatrix.needsUpdate=true;}
function cyMonuHeurt(p){
  const A=CY.arche;if(A){const dx=p.x-A.cx,dz=p.z-A.cz,u=dx*A.px+dz*A.pz,al=dx*A.tx+dz*A.tz;
    if(Math.abs(al)<A.W*1.6&&Math.abs(u)<A.Ua){const P=A.P,f=(u+A.Ua)/(2*A.Ua)*(P.length-1),k=Math.max(0,Math.min(P.length-2,Math.floor(f))),w=f-k,yc=P[k].y+(P[k+1].y-P[k].y)*w,e=Math.abs(u/A.Ua),ab=1+1.4*e*e*e;
      if(Math.abs(al)<A.W*.5*ab+1&&Math.abs(p.y-yc)<A.T*.5*ab+1)return true;}}
  for(const c of CY.chem){const dx=p.x-c.x,dz=p.z-c.z;if(dx*dx+dz*dz<(c.r*1.1+1.2)*(c.r*1.1+1.2)&&p.y>c.y&&p.y<c.y+c.h+1)return true;}
  {const M=CY.r66m;if(M){const dx=p.x-M.x,dz=p.z-M.z;if(dx*dx+dz*dz<(M.r+1.2)*(M.r+1.2)&&p.y>M.y0&&p.y<M.y1+.6)return true;}} // (2026-10-15 soir) la mesa de la station-service : du grès, comme le reste
  for(const M of CY.r66m2||[]){const dx=p.x-M.x,dz=p.z-M.z;if(dx*dx+dz*dz<(M.r+1.2)*(M.r+1.2)&&p.y>M.y0&&p.y<M.y1+.6)return true;} // (2026-10-20) celle du motel
  return false;}
function canyonChauffe(){ // au menu (chauffeDivers) : la matière du relief compilée et dessinée une fois hors écran — 0 programme en course
  if(!CANYON_OK)return;cyTerrain();const m=CY.mesh,v=m.visible,n=CY.geo.instanceCount;CY.geo.instanceCount=1;CY.aN.array[2]=64;m.visible=true;
  /* (2026-10-18, PASSE PERF, Léo : « optimisation des performances ») + les deux matières DOUBLE FACE des pièces du canyon (`.b` le grès, `.g` la roche
     à couleurs ; mesas, voûtes, tunnels) : MESURÉ, à chaque 1re visite du canyon leurs 2 programmes naissaient EN COURSE (banc ×4, dbgProgs) —
     `.g` sur une géométrie qui porte des COULEURS (celle des arbres) : sans attribut `color`, la clé du programme diffère d'un détail (vertexAlphas) */
  const M9=cyMonuMats(),g9=new THREE.Group(),bx9=new THREE.BoxGeometry(1,1,1);g9.add(new THREE.Mesh(bx9,M9.a));g9.add(new THREE.Mesh(bx9,M9.b));g9.add(new THREE.Mesh(bx9,CY_RAI_M));{const a9=cyArbreGeo(),i9=new THREE.InstancedMesh(a9,M9.t,1);i9.setMatrixAt(0,new THREE.Matrix4());g9.add(i9);g9.add(new THREE.Mesh(a9,M9.g));if(TUN2_ON){const T9=cyT2Mats();g9.add(new THREE.Mesh(a9,T9.m));g9.add(new THREE.Mesh(bx9,T9.o));}} /* (2026-10-19) + LE TUNNEL DE GRÈS : la roche cuite sans brume et l'or des anneaux */const im9=new THREE.InstancedMesh(bx9,M9.i,1);im9.setMatrixAt(0,new THREE.Matrix4());g9.add(im9);g9.traverse(function(o){o.frustumCulled=false;});scene.add(g9);
  const P9=cyPousPoints(),pv9=P9.visible;P9.visible=true; /* (2026-10-21) + la poussière dorée : son programme compilé au menu, lui aussi */
  try{chauffeRendu([m,g9,P9]);}finally{m.visible=v;P9.visible=pv9;CY.geo.instanceCount=n;scene.remove(g9);bx9.dispose();}
  try{const C=skyDome.userData.ciel;if(C.cy){const sc=new THREE.Scene(),me=new THREE.Mesh(skyDome.geometry,C.cy),t=cielCible(8,8,true),cib=renderer.getRenderTarget();me.frustumCulled=false;sc.add(me);renderer.setRenderTarget(t);renderer.render(sc,camera);renderer.setRenderTarget(cib);t.dispose();}}catch(e){console.warn('canyonChauffe ciel',e);}}
window.dbgCanyon=function(k,a,b,c){
  if(k==='test'){if(!CY.on)return 'pas de canyon';let dessus=0,dessous=0,pire=1e9,ou=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,h=cyHauteur(x,z);
      if(h>y-THICK-1.5){dessous++;if(ou.length<40)ou.push('D'+s9+(lt?(lt>0?'d':'g'):'c')+'('+(y-THICK-h).toFixed(1)+')');}if(h>y+1.5){dessus++;if(ou.length<40)ou.push(s9+(lt?(lt>0?'d':'g'):'c'));}pire=Math.min(pire,y-THICK-h);}}
    return {dessus:dessus,dessous:dessous,margeMin:+pire.toFixed(1),sep:CY.sep,ou:ou.join(' ')};}
  if(k==='parois'){if(!CY.on)return 'pas de canyon';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},G9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},D=[]; // (2026-10-15) à hauteur de dalle : à combien du BORD la roche monte (tous les 40 m, deux côtés) · la GARDE : la roche la plus haute entre zone de saut et sortie, au-dessus de la droite qui les relie
    for(let s9=200;s9<L-500;s9+=40){frameAt(s9,F9);for(const sg of [-1,1]){let d=999;for(let e=0;e<=120;e+=2){const lt=sg*(ROAD_HALF+e);if(cyHauteur(F9.p.x+F9.b.x*lt,F9.p.z+F9.b.z*lt)>F9.p.y){d=e;break;}}D.push(d);}}
    D.sort((a,b)=>a-b);const q=f=>D[Math.floor(f*(D.length-1))];
    const gar=(CY.rac||[]).map(o=>{let pire=-1e9;for(let s9=o.haut[0];s9<=o.haut[1];s9+=20){frameAt(s9,F9);let bd=1e18,bx=0,by=0,bz=0;for(let s2=o.bas[0];s2<=o.bas[1];s2+=8){frameAt(s2,G9);const d=(G9.p.x-F9.p.x)**2+(G9.p.z-F9.p.z)**2;if(d<bd){bd=d;bx=G9.p.x;by=G9.p.y;bz=G9.p.z;}}
      for(let u=.15;u<=.86;u+=.1){const x=F9.p.x+(bx-F9.p.x)*u,z=F9.p.z+(bz-F9.p.z)*u;pire=Math.max(pire,cyHauteur(x,z)-(F9.p.y+(by-F9.p.y)*u));}}return o.nm+':'+Math.round(pire);});
    return {bord:{p10:q(.1),med:q(.5),p90:q(.9),libres:D.filter(d=>d===999).length+'/'+D.length},garde:gar.join(' '),mine:CY.mineT?{de:Math.round(CY.mine[0]),a:Math.round(CY.mine[1])}:null,L:Math.round(L)};}
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='frag'){if(!CY.mat)return 'pas de matière';if(typeof a==='string'){CY.mat.fragmentShader=a;CY.mat.needsUpdate=true;}return CY.mat.fragmentShader;} /* (banc) la matière du relief relue / remplacée à chaud */
  if(k==='raccourcis')return CY.rac||[];
  if(k==='vue'||k==='vueA'){if(!CY.on)return 'pas de canyon';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9); /* 'vueA' : à l'abscisse a de la piste (sinon a mètres devant la caisse) */const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(a!=null&&arguments[4]!=null?arguments[4]:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:CY.n};}
  return {on:CY.on,r66:CY.r66|0,ms:CY.ms,noeuds:CY.n,sep:CY.sep,hz:CY.hz||null,deco:CY.deco?Object.assign({},CY.deco,{pose:CY.decoN,mine:Object.assign({},CY.deco.mine,{posee:!!CY.mineT}),mitaines:(CY.mit||[]).length,cheminees:(CY.chem||[]).length,nArbres:CY.nArb|0}):null,F:CY.F?[CY.F.nx,CY.F.nz,CY.F.ts]:null,Z:CY.Z?[CY.Z.nx,CY.Z.nz,CY.Z.ts]:null,O:CY.O?[CY.O.nx,CY.O.nz,CY.O.ts]:null,
    ciel:CIEL2.mode,attente:!!CY.attente,sQ:CY.sQ,L:Math.round(L),buttes:CY.buttes?CY.buttes.length:0,soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+CY.ombre.toFixed(2),prof:+CY.prof.toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    carHaut:CY.on?+(carGroup.position.y-cyHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
/* ===== LA POUSSIÈRE DU CANYON (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map ») =====
   Le détail vivant du canyon : des grains de poussière dorée en suspension dans une boîte de 130 m qui suit la caméra (devant elle : dans la gorge, les parois cachent le reste), poussés par un vent
   lent. TOUT le mouvement est dans le sommet (`uTime`) : une seule instance (UN appel de dessin), aucun tirage du jeu (le générateur est local, une graine
   fixe), aucune allocation par image. Ils brillent quand le soleil est bas (le contre-jour : la poussière dans les rais), se ternissent en argent la nuit,
   s'éteignent sous la pluie, et s'effacent près de la caméra (jamais un grain entre elle et la caisse). Leur nombre suit le palier (`PAL.B.cyPous`).
   La matière du RELIEF, elle, a gagné ses cannelures, ses fissures, ses filons d'or et sa lueur d'altitude dans CY_FS (voir LA ROCHE VIVANTE). */
const CY_POUS_VS=['attribute vec4 aR;uniform float uTime,uK,uPx;uniform vec3 uBoxC,uCol;varying float vA;varying vec3 vC;',
  'void main(){vec3 B=vec3(130.,50.,130.);',
  '  vec3 pa=vec3(1.7,.30,.9)*uTime*(.6+.8*aR.w)+vec3(sin(uTime*.7+aR.y*9.)*2.5,sin(uTime*.9+aR.x*7.)*1.8,cos(uTime*.6+aR.z*8.)*2.5);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  vec4 mv=viewMatrix*vec4(pos,1.);float d=max(-mv.z,.001);',
  '  vA=smoothstep(0.,.10,e)*uK*(.35+.65*aR.w)*smoothstep(14.,32.,d)*(1.-smoothstep(100.,140.,d));vC=uCol*(.8+.4*aR.z);',
  '  gl_Position=projectionMatrix*mv;gl_PointSize=vA<.004||mv.z>0.?0.:(.5+aR.z*.9)*uPx*300./d;}'].join('\n');
const CY_POUS_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5),a=smoothstep(.5,0.,d);a*=a;if(vA*a<.004)discard;gl_FragColor=vec4(vC,min(1.,vA*a*1.6));}'].join('\n');
const CY_POUS={p:null,v:new THREE.Vector3()};
function cyPousPoints(){if(CY_POUS.p)return CY_POUS.p;
  const n=PAL.b('cyPous',160),R=mulberry32(0xD057C4),g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
  const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uK:{value:0},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uCol:{value:new THREE.Color()}},
    vertexShader:CY_POUS_VS,fragmentShader:CY_POUS_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});m.dispose=function(){};
  const p=new THREE.Points(g,m);p.name='canyon poussière';p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return CY_POUS.p=p;}
/* chaque image (depuis canyonTick) : la force (le fondu du niveau × le sec × le soleil bas), la couleur (celle du soleil, poudrée d'or), le centre de la boîte */
function cyPousTick(dt,c){
  const k=CY.on&&started&&!gameOver?(LVL.canyon||0):0,P9=CY_POUS.p;
  if(!(k>.01)){if(P9&&P9.visible)P9.visible=false;return;}
  const p9=cyPousPoints(),u=p9.material.uniforms,wet=c.cyQ?c.cyQ[2]:0,bas=Math.max(0,Math.min(1,1-(SUN_DIR.y-.04)/.46)),nuit=Math.min(1,LVL.nuit||0);
  const k9=k*(1-wet)*(.5+.5*bas)*(1-.45*nuit);p9.visible=k9>.02;if(!p9.visible)return;
  u.uK.value=k9;if(!paused)u.uTime.value=(u.uTime.value+dt)%600;u.uPx.value=renderer.getPixelRatio();
  u.uCol.value.setRGB(sun.color.r*.7+.30,sun.color.g*.7+.24,sun.color.b*.7+.14).multiplyScalar(.85);
  camera.getWorldDirection(CY_POUS.v);u.uBoxC.value.copy(camera.position).addScaledVector(CY_POUS.v,45);}
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
/* ===== LES DUNES SOBRES (2026-10-25, Léo : « remets la map dune dans le main, intelligible pour un iPhone 13 mais toujours aussi belle et fluide, pour moins de puissance demandée » ; Sacha l'avait sortie du tirage mobile le 24/10 : trop lourde) =====
   Même carte, même route, mêmes décors, même ciel — seule la FACTURE baisse, sur un VRAI téléphone (TEL_NATIF ; `?dunesplein=1` = l'image d'avant, `?dunessobre=1` l'essaie sur l'ordi). MESURÉ (puce, image figée, 0,57 M pixels) : le terrain coûtait ~6 ms sur 11,5 — 2 ms de sommets
   (dont 1,6 ms rien que pour la normale : trois lectures complètes du relief par sommet) et ~4 ms de pixels. Le palier RÉCENT (iPhone 12+) prenait toute la finesse ; l'iPhone 13 y passait ~2,5× le temps de l'ordi. Ici :
   · la grille d'une tuile passe de 32 à 24 cases (−44 % de sommets, la cellule la plus fine reste ~5 m, les normales sont lissées) ;
   · les décors reprennent le budget du palier MOYEN (acacias, palmiers, touffes, arbres morts, tornades, sable qui vole) — au plan moyen, de dos, ils ne se comptent pas ;
   · les ÉCLATS de 9 cm (dnMo .75) s'éteignent : à ~5 px sur un écran de 390 pt ils ne faisaient que scintiller.
   Rien d'autre ne change (la route, les tremplins, le sable à rides, les nuages en bandes, les monuments). */
const DN_MOB=(ALLEGE||/[?&]dunessobre=1\b/.test(location.search))&&!/[?&]dunesplein=1\b/.test(location.search); // ⚠ TEL_NATIF, PAS l'ancien drapeau mobile : l'ordi qui joue l'édition « mobile » (FORCE_TEL) garde les dunes pleines (Sacha, 25/10 : « sur PC la qualité a chuté »)
if(DN_MOB){PAL.B.dnGrille[2]=24;PAL.B.dnArbres[2]=PAL.B.dnArbres[1];PAL.B.dnPalmes[2]=PAL.B.dnPalmes[1];PAL.B.dnPart[2]=PAL.B.dnPart[1];PAL.B.dnMo[2]=PAL.B.dnMo[1];PAL.B.dnRuines[2]=PAL.B.dnRuines[1];PAL.B.dnTors[2]=PAL.B.dnTors[1];PAL.B.dnTouffes[2]=PAL.B.dnTouffes[1];PAL.B.dnMorts[2]=PAL.B.dnMorts[1];}
/* LA ROUTE SURÉLEVÉE (2026-10-25, Sacha : « surélève un petit peu la route, comme posée sur un truc surélevé, pour qu'on ne meure pas directement sur le sable et qu'on ait une petite chance de se redresser ») — la berme, les éperons, les collines et le lac de l'oasis descendent de DN_SUR m sous la dalle (la route, elle, ne bouge pas) ; `?sur=N` change la valeur, `?sur=0` = avant */
const DN_SUR=(function(){const m=/[?&]sur=(\d+(?:\.\d+)?)/.exec(location.search);return m?Math.min(40,+m[1]):10;})();
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
const DN_BANK={on:!/[?&]sans=([^&]*,)?dunesbank(,|&|$)/.test(location.search),max:22*Math.PI/180}; /* (2026-10-23) L'INCLINAISON de la route dans les virages : max = l'angle plafond (les nuages montent à 50°) · `?sans=dunesbank` = la route plate d'avant */
const DN_HZ={axe:20,kL:.94,lim:64},DN_SEG={D:2.6,H:34,A:150,haut:260}; // DN_SEG : la profondeur de la mer de dunes sous la route, sa hauteur, et `haut` : de combien le désert lointain est plus bas au départ (m)
/* (2026-10-22, Léo : « les routes qui font sauter embrassent une haute colline de sable… le joueur peut piquer en bas ou décoller… je veux niveau 100 » — LA ROUTE CONTINUE) Plus de trou, plus de lèvre coupée :
   la route est UN ruban, posé sur de grosses dunes. Chaque VAGUE : la MONTÉE (un arc qui ENLACE une colline : le sable monte au-dedans, tombe au-dehors), la CRÊTE (la courbe verticale
   s'arrondit, l'apex est le tremplin — `dnLevre`), la DESCENTE (une droite sur l'éperon, l'avalanche de chaque côté : on s'y pose), le CREUX (on y tourne, entre deux collines). La pente est la
   COURBE `GN` (u → pente, linéaire entre ses nœuds : des raccords PARABOLIQUES, jamais d'angle) ; l'altitude en est l'intégrale. Les caractéristiques de chaque vague (`DN.fe`) disent à buildDunes
   où le sable monte, de quel côté, de combien. */
function* genDunes(rnd){ // (LE PRÉ-BÂTI) un générateur, comme genCanyon : il rend la main entre deux étapes
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;TROUMARK.length=0; /* (aucun TROU : la route est continue) */
  const LV=lvPiste(),LL=1+Math.min(1.3,(LV-1)*.5),g0=(rnd()*4294967296)>>>0;
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);DN.rmin=Math.round(RMIN);
  const LC9=typeof longueurCible==='function'?longueurCible():0;
  const r=mulberry32(g0),C=[],U=[],Q={},FE=[],GN=[],P=new THREE.Vector3(0,0,0),LIM=DN_HZ.lim*Math.PI/180;let phi=0,uh=0,gP=-.04;
  const push=()=>{C.push(P.clone());U.push(uh);},ici=k=>{Q[k]={p:P.clone(),phi:phi,i:C.length-1};},lib=sg=>(LIM-sg*phi)*57.2958,gn=(u,g)=>GN.push([u,g]);
  const droite=(l,n)=>{n=n||Math.max(2,Math.round(l/34));for(let k=0;k<n;k++){P.x+=Math.sin(phi)*l/n;P.z+=Math.cos(phi)*l/n;uh+=l/n;push();}};
  const arc=(aDeg,R)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/7)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi)*ch;P.z+=Math.cos(phi)*ch;uh+=ch;phi+=st/2;push();}};
  const vir=(sg,a,R)=>{let l9=lib(sg);if(l9<12){sg=-sg;l9=lib(sg);}arc(sg*Math.max(6,Math.min(a,l9)),R);return sg;}; // un virage, jamais au-delà de la butée du cap ; rend le sens pris
  const recentre=()=>{if(Math.abs(phi)>.10)arc(-phi*57.2958,RMIN*(2.1+r()*.6));};
  // LE CREUX d'une vague : là où l'on tourne (la descente et la montée, elles, sont des arcs et des droites posés)
  const creux=t=>{
    if(t==='S'){const a=26+r()*22,R=RMIN*(1.45+r()*.7);const sg=vir(r()<.5?-1:1,a,R);vir(-sg,a*(.85+r()*.35),R);}
    else if(t==='balayage'){const a=42+r()*26,R=RMIN*(2.0+r()*.8);vir(r()<.5?-1:1,a,R);}
    else if(t==='serpent'){let sg=r()<.5?-1:1;for(let k=0;k<3;k++){const a=24+r()*14;sg=vir(sg,a,RMIN*(1.3+r()*.4));sg=-sg;}}
    else{const sg=vir(r()<.5?-1:1,26+r()*20,RMIN*(1.7+r()*.6));droite((30+r()*30)*LL);vir(-sg,16+r()*14,RMIN*(1.7+r()*.6));}}; /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») : le creux « droit » est un S souple */
  const ond=l=>{const s0=r()<.5?-1:1;droite(l*.3);const s1=vir(s0,12+r()*10,RMIN*(3+r()*1.2));droite(l*.2);vir(-s1,12+r()*10,RMIN*(3+r()*1.2));droite(l*.3);}; /* l'allée et la place ondulent : deux souples virages de 12-22° au lieu d'une droite de 310-400 m */
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
      vt:pt?['S','balayage','droit'][(r()*3)|0]:['S','S','balayage','serpent','droit'][(r()*5)|0],sp:o.sp||'',big:o.big?1:0,fin:o.fin?1:0,sg:0,sg2:0,K:kb,pt:pt};fe.Lc=(72+r()*30)*LL*(pt?.8:1+Math.max(0,fe.gm+fe.g1-.2)*1.6);FE.push(fe); /* (2026-10-23, Léo : « la route est trop plate… comme le jeu du pingouin ») des collines 2 fois plus hautes : des montées à 12-20 %, des descentes à 20-30 %, la crête plus longue pour que sa courbe reste franche mais jamais coupée */
    ici('m'+n+'a');{const uM=uh;gn(uM-40,gP);gn(uM+40,fe.gm);}
    droite((14+r()*30)*LL*kb);
    if(!fe.S){const a=(pt?32:44)+r()*(pt?22:30),R=RMIN*(pt?1.2+r()*.8:1.35+r()*1.25)*kb,s9=vir(sgC,a,R);fe.sg=-s9;}                                   // l'arc : la colline est AU-DEDANS (le côté σ = −signe du virage)
    else{const a=34+r()*22,R=RMIN*(1.5+r()*.5),s1=vir(sgC,a,R);droite((16+r()*20)*LL);ici('m'+n+'s');const s2=vir(-s1,a*(.8+r()*.4),RMIN*(1.5+r()*.6));fe.sg=-s1;fe.sg2=-s2;}
    ici('m'+n+'b');
    droite(14*LL+fe.Lc/2);ici('c'+n);{const uA=uh;gn(uA-fe.Lc/2,fe.gm);gn(uA+fe.Lc/2,-fe.g1);}                         // l'apex, au milieu de sa courbe verticale
    /* L'ÉPAULE (2026-10-23, Léo : « comme le jeu du pingouin où il faut atterrir pour prendre la vitesse ») — MESURÉ : à la vitesse de la caisse (190 m/s) une descente à 17 % file sous la parabole du vol, la caisse ne se pose qu'en BAS (2 s, choc de 67) ;
       pour qu'elle atterrisse SUR la pente il faut une pente DOUCE (5-9 %) pendant ~200 m après l'apex : l'ÉPAULE, où l'on se pose — puis la DESCENTE RAIDE (20-29 %, qui zigzague) où la gravité rend la vitesse : décoller, se poser sur l'épaule, plonger. */
    {const Ls=(o.fin?110:pt?95+r()*30:125+r()*55)*LL*kb;droite(Ls);ici('e'+n);gn(uh,-fe.g1);gn(uh+80,-fe.gl);}
    {const dl=(o.fin?330+r()*60+(o.xtra||0)*.5:pt?105+r()*40:125+r()*55)*LL*kb;if(o.fin)droite(dl);else{const f1=.45+r()*.12;droite(dl*f1);{const s9=vir(r()<.5?-1:1,20+r()*18,RMIN*(2+r()*1.1));vir(-s9,14+r()*14,RMIN*(2+r()*1.1));}droite(Math.max(dl*(1-f1)*.6,60*LL));}} /* la descente zigzague toujours : un virage et son contre-virage */ /* LA DESCENTE ZIGZAGUE : un balayage entre deux dunes */
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
  while(nv<9){const sp9=plan[nv]||'',pt=!sp9&&nv>=2&&nv!==grande&&r()<.6;if(!(nv<2||B-(uh+FIN)>(pt?640:LEN9[sp9])*LL*.4))break;vague({sp:sp9,big:nv===grande,petite:pt});nv++;yield;} // (2026-10-23) des PETITES vagues entre les grandes : une colline plus basse, un creux court — pas deux fois la même vague
  vague({fin:true,xtra:Math.max(0,Math.min(500,B-(uh+FIN)))}); // (le reste du budget de longueur va à la descente finale et à la droite d'arrivée)
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
    const kref=1/(2.4*RMIN),W9=55;
    for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W9;j--){sw+=hh[j];sk+=kap[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W9;j++){sw+=hh[j];sk+=kap[j]*hh[j];}bk[i]=DN_BANK.max*Math.tanh((sk/sw)/kref);}
    const sA=[];for(const k in Q)if(/^(c\d+|w\d+_\d+)$/.test(k))sA.push(sc[Q[k].i]);
    DN.bankN=[];let mx=0;
    for(let i=0;i<n;i++){let m=1;for(const s9 of sA){const d=sc[i]-s9,o9=Math.max(-70-d,d-150,0);m=Math.min(m,sm9(0,50,o9));}
      m*=sm9(0,70,sc[i]);const b9=bk[i]*m,a9=C[Math.max(0,i-1)],c9=C[Math.min(n-1,i+1)],tl=Math.hypot(c9.x-a9.x,c9.z-a9.z)||1,tx=(c9.x-a9.x)/tl,tz=(c9.z-a9.z)/tl;
      DN.bankN.push(new THREE.Vector3(-tz*Math.sin(b9),Math.cos(b9),tx*Math.sin(b9)));if(Math.abs(b9)>mx)mx=Math.abs(b9);}
    DN.bankMax=Math.round(mx*57.2958);}
  DN.Q=Q;DN.fe=FE;DN.gp=[];DN.sep=0;DN.hz={axe:Math.round(ax*57.2958),B:Math.round(B),LL:+LL.toFixed(2),RMIN:Math.round(RMIN),VN:Math.round(1.35*VW),sauts:FE.length,vagues:FE.length,pieces:FE.map(function(f){return f.sp||(f.big?'grande':f.fin?'fin':'vague');})};
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
    Wf=Math.max(0,S.pw[j]*v+S.pw[j1]*u-RH-10),bkv=S.bk?S.bk[j]*v+S.bk[j1]*u:0,yb=S.y[j]*v+S.y[j1]*u-1.6-(S.sur||0)-3*Math.abs(Math.sin(bkv))-7*Math.abs(S.y[j1]-S.y[j])/(S.ds||8)-sg*Math.min(d,RH+10+Wf)*Math.tan(bkv), /* la berme suit la dalle penchée (S.bk), puis garde son niveau ; +3·sin : la marge perdue quand l'angle bouge vite entre deux échantillons ; +7·pente : dans un arc sur une pente raide, le sable du bord extérieur lit l'échantillon voisin, plus haut (MESURÉ : 2 m à 20 %) */Dn=Math.max(2,yb-(S.B[j]*v+S.B[j1]*u)),
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
  const S={n:NS,ds:DS,x:A9(NS),z:A9(NS),y:A9(NS),tx:A9(NS),tz:A9(NS),H:A9(NS),A:A9(NS),D:A9(NS),zC:A9(NS),pan:A9(NS),ob:A9(NS),gd:A9(NS),B:A9(NS),Yf:A9(NS),RE:A9(NS),sur:DN_SUR,pw:A9(NS),hP:A9(NS),wP:A9(NS),hM:A9(NS),wM:A9(NS),bk:A9(NS),sP:A9(NS),sM:A9(NS)};
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
  for(let i=0;i<NS;i++){S.hP[i]=S.hM[i]=-Math.max(5,S.y[i]-1.6-DN_SUR-S.B[i]);S.wP[i]=S.wM[i]=0;}
  {let hsW=.2;const rf=mulberry32((seed^0x7E11A5)>>>0),mur=(sd,i,h,w,t)=>{if(t<=0)return;const A=sd>0?S.hP:S.hM,W=sd>0?S.wP:S.wM,Q9=sd>0?S.sP:S.sM;A[i]+=(h-A[i])*t;W[i]+=(w-W[i])*t;Q9[i]+=(hsW-Q9[i])*t;};
   (DN.fe||[]).forEach(function(fe,n){
     const sA=sQ['m'+n+'a'],sB=sQ['m'+n+'b'],sS=sQ['m'+n+'s'],sC=sQ['c'+n],sD=sQ['d'+n],sN=sQ['m'+(n+1)+'a']!=null?sQ['m'+(n+1)+'a']:(sQ.fin!=null?sQ.fin:L);
     if(sA==null||sB==null||sC==null||sD==null)return;
     hsW=rf()*.22; /* (2026-10-23, Léo : « brouillon… l'harmonie ») un seul langage de collines : des dômes doux, plus de crêtes pointues */ /* la FORME des collines de cette vague : crête (pointue) ou dôme (rond) */
     const kb=fe.K||1,pk=fe.pt?.62:1,Hc=(46+34*rf())*K*kb*pk,Wc=Hc*(2.9+.6*rf()),Hn=(18+12*rf())*K*kb*pk,Hv=(14+14*rf())*K*pk,vs=rf()<.5?1:-1,closed=fe.ferme||fe.sp==='avenue'||fe.sp==='vlei'||fe.sp==='rythme';
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
    if(rl>0)oa={x:S.x[iL]-S.tz[iL]*sd*(rl+62),z:S.z[iL]+S.tx[iL]*sd*(rl+62),r:rl,y:S.y[iL]-15-DN_SUR};}
  DN.rac=[];
  // LE VENT de la map : il souffle à peu près dans l'axe de la descente (les crêtes coupent la route en travers), à ±35°
  {const dx=S.x[NS-1]-S.x[0],dz=S.z[NS-1]-S.z[0],a=Math.atan2(dx,dz)+(r()-.5)*1.2,b=a+.49;DN.vent=[Math.sin(a),Math.cos(a),Math.sin(b),Math.cos(b)];DN.lam=(520+r()*90)*K;
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
/* ===== LES DUNES EN FACETTES (2026-10-23, Léo : « rends-les en mode poly comme les voitures, toute la map, inspiré par la technique de la forêt » · « un effet de lumière, encore plus réaliste sur le sable ») =====
   Le sable ET les décors en facettes PLATES (la normale de chaque triangle, par dérivées de l'écran), une teinte par facette, des éclats quand une facette renvoie le soleil vers l'œil, et les JOINTS
   VITRAIL (de fines arêtes de lumière entre les facettes, qui pâlissent sous ~7 px — voir « LA TECHNIQUE VITRAIL » de la forêt). Le terrain n'a plus de cellule plus petite que ~7,5 m (DN.lmin : le quadtree CDLOD
   ne descend plus plus bas — MOINS de triangles) ; les joints du terrain sortent des coordonnées de la grille (vGp : exact même en plein morph), ceux des décors du numéro de sommet (gl_VertexID, géométrie non indexée).
   La lumière du sable : contre-jour chaud sur les crêtes, voile de diffusion vers le soleil, terminateur orangé (sous-surface), rebond chaud dans l'ombre.
   `?poly=0` = l'ancien rendu à l'identique · `?lumiere=0` = sans les effets de lumière · `dbgDunes('poly',{tint,joint,glint,flat,rim,scat,term,reb})` règle à chaud. */
const DN_POLY=!/[?&]poly=0\b/.test(location.search),DN_LUM=!/[?&]lumiere=0\b/.test(location.search),DN_CELL=4;
/* ---- LE SABLE À LA PUCE : la grille (G × G cases), ses instances (x0, z0, taille, niveau), sa matière ---- */
const DN_TB='vec4 tB(sampler2D t,vec2 p,vec2 N){vec2 q=p-.5,i=floor(q),f=q-i,a=(i+.5)/N,e=1./N;return mix(mix(texture2D(t,a),texture2D(t,a+vec2(e.x,0.)),f.x),mix(texture2D(t,a+vec2(0.,e.y)),texture2D(t,a+e),f.x),f.y);}';
const DN_VS=['attribute vec4 aN;uniform sampler2D uTC,uTZ,uTS,uNZ;uniform vec4 uFD,uZD,uSD,uOA,uW,uFin;uniform vec2 uFN,uZN,uSN;uniform vec3 uCam;uniform float uG,uR0,uLam;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_vertex>',DN_TB,
  'float gU,gP,gV,gM;',
  'float dnDune(vec2 x){vec2 W=uW.xy;float u=dot(x,W)/uLam,v=dot(x,vec2(-W.y,W.x)),w1=texture2D(uNZ,x/30000.).r-.5,w2=texture2D(uNZ,x/11000.+vec2(.37,.61)).r-.5,w3=texture2D(uNZ,x/5200.+vec2(.83,.17)).r-.5;',
  '  float a=u+1.4*w1+1.05*w2+.34*w3,f=fract(a);',
  '  float p=f<.72?pow(max(f/.72,1e-5),1.5):pow(max((1.-f)/.28,1e-5),1.15),m=.30+.70*clamp((texture2D(uNZ,vec2(v/9000.+.13,a*.13+.5)).r-.22)*1.9,0.,1.);',
  '  float a2=dot(x,uW.zw)/(uLam*.40)+1.6*w2+.5*w3,f2=fract(a2);',
  '  float p2=f2<.68?pow(max(f2/.68,1e-5),1.4):pow(max((1.-f2)/.32,1e-5),1.1);',
  '  gU=p*m;float h=p*m+.08*p2*(1.-.75*p);',
  /* LES DUNES ÉTOILÉES : la même fonction que dnDune (dunes-1.js) */
  ...(DN_STAR?['  float ts0=(texture2D(uNZ,x/16000.+vec2(.71,.29)).r-.5-.20)/.14,ts=clamp(ts0,0.,1.);ts=ts*ts*(3.-2.*ts);',
  '  if(ts>0.){float k=6.2832/(uLam*1.9);vec2 d2=vec2(-.5*W.x-.866*W.y,.866*W.x-.5*W.y),d3=vec2(-.5*W.x+.866*W.y,-.866*W.x-.5*W.y);',
  '    float s1=cos(k*dot(x,W)+9.*w3+5.*w1),s2=cos(k*dot(x,d2)+8.*w2+4.*w3),s3=cos(k*dot(x,d3)+7.*w3+5.*w2);float st=clamp((s1+s2+s3+1.5)/4.5,0.,1.);st=pow(st,2.2);',
  '    float hs=st*.95+.05*p2*(1.-.5*st);h+=(hs-h)*ts;gU+=(st-gU)*ts;}']:[]),
  '  return h;}',
  /* LES BUTTES : la même fonction que dnMesa (dunes-1.js) — un seuil du bruit (canal g), le haut par un autre (canal b), rien près de la route (Z.g = la distance à la route) */
  'float dnMesa(vec2 x,float dr){if(uFin.w>.5)return 0.;float n=texture2D(uNZ,x/11000.+vec2(.21,.73)).g,e=clamp((n-.58)/.14,0.,1.),m0=e*e*(3.-2.*e);if(m0<=0.)return 0.;',
  '  float t=texture2D(uNZ,x/1700.+vec2(.5,.1)).b,f=clamp((dr-260.)/260.,0.,1.),q=clamp((length(x-uFin.xy)-1800.)/1200.,0.,1.);return m0*f*f*(3.-2.*f)*q*q*(3.-2.*q)*(70.+110.*t);}',
  'vec4 dnHt(vec2 x){vec4 Z=tB(uTZ,(x-uZD.xy)*uZD.zw*uZN,uZN);float me=dnMesa(x,Z.g),mk=clamp(me/20.,0.,1.);float h=Z.r+Z.b*(dnDune(x)-.35)*(1.-.85*Z.a)*(1.-.92*mk)+me;gP=Z.a;gM=mk;gV=0.;',
  '  vec2 fp=(x-uFD.xy)*uFD.zw;if(fp.x>0.&&fp.y>0.&&fp.x<1.&&fp.y<1.){vec4 C=tB(uTC,fp*uFN,uFN);h=mix(h,C.r,C.g);}',
  '  float w=0.,dep=0.;if(uOA.z>0.){float rr=length(x-uOA.xy)/uOA.z;if(rr<2.4){float o=rr<1.?uOA.w-12.*(1.-rr*rr):uOA.w+(rr-1.)*uOA.z*.2;h=min(h,o);',
  '    gV=smoothstep(.95,1.06,rr)*(1.-smoothstep(1.30,1.62,rr));if(h<uOA.w-.05){dep=uOA.w-h;h=uOA.w;w=1.;}}}',
  '  return vec4(h,w,dep,0.);}',
  'void main(){float S=aN.z;vec2 gp=position.xz,p0=aN.xy+gp*(S/uG);',
  '  float mE=uR0*exp2(aN.w),mS=mE*.72,k=clamp((length(p0-uCam.xz)-mS)/(mE-mS),0.,1.);',
  '  vec2 x=aN.xy+(gp-fract(gp*.5)*2.*k)*(S/uG);',
  '  vec4 A=dnHt(x);float pu=gU,pa=gP,pm=gM,vg=gV,e=S/uG*(1.+k)*2.2;',
  '  float hx=dnHt(x+vec2(e,0.)).x,hz=dnHt(x+vec2(0.,e)).x;vN=normalize(vec3(A.x-hx,e,A.x-hz));vW=vec3(x.x,A.x,x.y);',
  '  float lit=1.;vec2 sp=(x-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-1.2,hs+3.,A.x);}',
  '  vA=vec4(A.y,A.z,pu,lit);vB=vec4(pa,pm,0.,vg);vGp=gp;vF=vec4(aN.xy/aN.z,aN.w,uG);', /* (facettes) gp : la case de la grille (entiers aux sommets) · vF : l'indice de la tuile, son niveau, G */
  '  vec4 mvPosition=viewMatrix*vec4(vW,1.);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const DN_FS=['uniform sampler2D uNZ;uniform vec3 uCam,uSunD,uSunC,uSky,uGnd,uFillC,uFillD,uSaA,uSaB,uSaL,uShd,uClay,uVeg,uHaze,uSkH,uSkZ,uWS,uWD,uPhP,uPhD,uPhC;uniform vec4 uQ,uK,uW,uMo,uPl,uLm,uEx,uSp;uniform float uTime,uFlash,uPoly,uLum;',
  'varying vec3 vW,vN;varying vec4 vA,vB;varying vec2 vGp;varying vec4 vF;','#include <fog_pars_fragment>',
  'float dh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
  'void main(){vec3 N=normalize(vN),Vv=uCam-vW;float dist=length(Vv);vec3 V=Vv/max(dist,.001);',
  /* LES FACETTES (poly) : Nf = la normale PLATE du triangle (dérivées de la position), ftn = sa teinte, hs9 = son tirage, jn = le joint (la distance, EN PIXELS, aux trois arêtes du triangle : vGp = la case, entiers aux sommets,
     l'interpolation en reste exacte même quand le sommet glisse vers le niveau grossier) — le joint ne se voit que sur des cases larges (> ~7 px) et là où la facette s'écarte de la normale lisse */
  '  vec3 Ns=N,Nf=N;float ftn=1.,jn=0.,hs9=.5;',
  '  if(uPoly>.5){vec3 nf=cross(dFdx(vW),dFdy(vW));float lf=length(nf);if(lf>1e-14){Nf=nf/lf;if(dot(Nf,Ns)<0.)Nf=-Nf;}',
  '    vec2 fg=max(fwidth(vGp),vec2(1e-6)),fq=fract(vGp);float fb=fq.x+fq.y;vec2 ci=floor(vGp+.001)+floor(vF.xy+.5)*vF.w;',
  '    float d3=abs(fb-1.)/max(fwidth(vGp.x+vGp.y),1e-6),dm=min(min(min(fq.x,1.-fq.x)/fg.x,min(fq.y,1.-fq.y)/fg.y),d3);',
  '    hs9=dh2(ci*.731+step(1.,fb)*vec2(3.7,1.9));ftn=1.+(hs9-.5)*uPl.x;',
  '    jn=(1.-smoothstep(.3,1.3,dm))*smoothstep(6.,20.,1./max(fg.x,fg.y))*(.3+.7*smoothstep(.0008,.012,1.-dot(Nf,Ns)))*uPl.y;}',
  '  float wat=vA.x,dep=vA.y,du=clamp(vA.z,0.,1.),lit=clamp(vA.w,0.,1.),pan=clamp(vB.x,0.,1.),veg=clamp(vB.w,0.,1.)*(1.-wat);',
  '  vec4 n0=texture2D(uNZ,vW.xz/1900.),n1=texture2D(uNZ,vW.xz/260.),n2=texture2D(uNZ,vW.xz/37.);',
  '  float stp0=clamp(1.-N.y,0.,1.);vec2 pp=vW.xz,Wd=normalize(uW.xy+vec2(1e-4));float fp=length(fwidth(pp));',
  /* (2026-10-22, Léo : « la texture du sable, j'aime pas, pas très beau ») LE SABLE FAÇON JOURNEY — plus de mosaïque de cubes : des RIDES DU VENT en trois octaves (62 cm de près, 3 m, 13 m : la normale
     ondule en travers du vent, les crêtes serpentent et se fourchent, le vent tourne un peu d'un endroit à l'autre), des traînées longues dans le sens du vent, une lumière chaude côté soleil et froide
     côté ombre, un SATIN sur les crêtes de rides et des ÉCLATS qui scintillent quand l'œil bouge. Chaque octave s'efface avant de tomber sous ~3 px (fwidth : jamais de moiré). */
  '  float rm=(1.-.85*pan)*(1.-veg)*(1.-wat)*(1.-smoothstep(.22,.42,stp0))*uK.y,rv=0.;',
  '  if(rm>.001&&uMo.z>.001){float rot=(n0.r-.5)*.8+(n1.g-.5)*.6;vec2 d=vec2(Wd.x*cos(rot)-Wd.y*sin(rot),Wd.x*sin(rot)+Wd.y*cos(rot));',
  '    float wp=1.5*(n2.r-.5)+.75*(n2.g-.5);',
  '    float k1=(1.-smoothstep(.16,.42,fp/.62))*step(.6,uMo.z),k2=(1.-smoothstep(.16,.42,fp/3.1))*step(.2,uMo.z),k3=1.-smoothstep(.16,.42,fp/13.);',
  '    float a1=.27*k1*(1.-smoothstep(40.,130.,dist)),a2=.19*k2*(1.-smoothstep(300.,1200.,dist)),a3=.09*k3*(1.-smoothstep(1000.,2600.,dist));',
  '    float s1=cos(6.2832*(dot(pp,d)/.62+wp)),s2=cos(6.2832*(dot(pp,d)/3.1+.8*wp+n2.r*1.5)),s3=cos(6.2832*(dot(pp,d)/13.+.5*wp+1.2*n1.r));',
  '    float amp=(.55+.9*n1.g)*rm;N=normalize(N-vec3(d.x,0.,d.y)*(a1*s1+a2*s2+a3*s3)*amp);rv=(a1*s1*.8+a2*s2*.55+a3*s3*.4)*amp;}',
  '  float stp=clamp(1.-N.y,0.,1.);vec3 NL=N;if(uPoly>.5){vec3 dv=Nf-Ns;NL=normalize(Ns+dv*min(uPl.w,.30/max(length(dv),1e-4))+(N-Ns));}', // (facettes) NL : la normale qui éclaire — la plate + la moitié des rides ; la matière (pente, roche…) lit toujours la lisse
  '  float st9=.5;if(uMo.z>.001)st9=texture2D(uNZ,vec2(dot(pp,Wd)/90.,dot(pp,vec2(-Wd.y,Wd.x))/15.)).g;', // les traînées longues, dans le sens du vent
  '  float tn=clamp(.5+(n0.r-.5)*1.7+(n1.g-.5)*.8+(st9-.5)*.55,0.,1.);vec3 sa=mix(uSaA,uSaB,tn)*(.96+.08*n2.b)*(1.+rv*.55);',
  '  sa=mix(sa,uSaL,smoothstep(.80,1.,du)*.40);', // la crête, plus claire
  '  float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));', // l'argile blanche et ses craquelures
  '  vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);vec3 col=mix(sa,clay,cl);col=mix(col,gv,veg);',
  /* LA ROCHE (2026-10-22) : les flancs raides — des buttes de grès — se couvrent de STRATES (des lits de ~20 m, du terracotta sombre à la crème, ondulés par le bruit, un joint sombre entre deux lits) ; sur le plateau, le sable reste */
  '  float rk=clamp(vB.y,0.,1.)*smoothstep(.08,.24,stp);', // (la roche : les BUTTES seulement — les parois de sable restent du sable)
  '  if(rk>.01){float yy=vW.y*.07+.42*n1.r+.12*n2.g,id=floor(yy),fb=fract(yy),h1=dh2(vec2(id,3.7)),h2=dh2(vec2(id,9.1));',
  '    vec3 rc=mix(uSaB*.74,uSaL*.98,h1*h1)*(.82+.36*h2)*(1.-.22*(1.-smoothstep(0.,.07,fb)));',
  '    float ve=texture2D(uNZ,vec2(dot(vW.xz,vec2(.7071,.7071))/11.,vW.y/70.)).g;rc*=.84+.32*ve;', // les cannelures verticales de l'érosion
  '    col=mix(col,rc,rk);}',
  /* LE SABLE GRENÉ (2026-10-21, passe d'embellissement ; repris le 24/10 sur le sable à rides) : des STRIES qui filent dans le sens du vent (un bruit étiré 60 pour 1), des FILETS sombres de fer sur les faces d'avalanche,
     et la RIDE jusqu'à 350 m (en teinte seulement, effacée par fwidth avant de créneler) — tout en un uniform (uEx.y = 0 au palier ANCIEN : aucune lecture de plus) */
  '  vec2 wd=uW.xy,wq=vec2(-uW.y,uW.x);float wx=dot(vW.xz,wd),wz=dot(vW.xz,wq),gk=uEx.y*(1.-.85*pan)*(1.-veg)*(1.-wat);',
  '  if(uEx.y>.001){float st=texture2D(uNZ,vec2(wx/1500.,wz/24.)).a-.5,sg=texture2D(uNZ,vec2(wx/420.+.37,wz/8.5)).g-.5,fe=texture2D(uNZ,vec2(wz/13.,wx/460.+.2)).b;',
  '    float ph2=wx*1.15+3.*n2.r,aa=1.-smoothstep(.5,1.5,fwidth(ph2));',
  '    col*=1.+gk*(st*.50+sg*.34+aa*cos(ph2)*.075*(1.-smoothstep(150.,350.,dist)));',
  '    col=mix(col,col*vec3(.60,.46,.50),gk*smoothstep(.56,.74,fe)*smoothstep(.15,.50,stp)*.85);}',
  '  if(uPoly>.5)col*=ftn*vec3(1.+(hs9-.5)*.08,1.,1.-(hs9-.5)*.10);vec3 Ls=normalize(vec3(uSunD.x,min(uSunD.y,uK.w),uSunD.z));float ndl=dot(NL,Ls),wr=clamp((ndl+uK.z)/(1.+uK.z),0.,1.);', // (uK.w : le soleil de midi est abaissé pour le RELIEF — la lumière de forme ; l'ombre, elle, reste celle du vrai soleil)
  '  float ao=mix(.80,1.,smoothstep(0.,.45,du));', // le creux d'une dune reçoit moins de ciel
  '  vec3 Lc=uSunC*wr*lit+mix(uGnd,uSky,NL.y*.5+.5)*1.15*ao+uFillC*max(dot(NL,uFillD),0.)*.5+uSunC*(.10+.16*rk)*(1.-lit)*(.6+.4*NL.y)+uGnd*.28*rk;', /* + le REBOND : le sable à l'ombre reçoit la lumière des dunes au soleil (jamais de creux noir) */
  '  vec3 c=col*Lc;',
  '  float shw=1.-lit*clamp(ndl*2.5+.2,0.,1.);c=mix(c,c*uShd,shw*.72);', // l'ombre du sable tire au VIOLET (la bible)
  /* LES DEUX TEMPÉRATURES : à l'ombre, le sable ne devient plus un rouge sombre mais un violet-bleu de MÊME valeur (la clé chaude, le remplissage froid) */
  '  {float ly=dot(c,vec3(.3,.55,.15));c=mix(c,ly*uShd/dot(uShd,vec3(.3,.55,.15)),clamp(shw*.55*uEx.x,0.,.9));}',
  '  float fr=pow(1.-max(dot(NL,V),0.),4.);c+=(uSky*.22+uSunC*.16*max(ndl,0.)*lit)*fr*uK.x*(1.-wat);', // le SATIN du sable au rasant
  '  vec3 Hh=normalize(Ls+V);',
  '  if(wat<.5){c+=uSunC*pow(max(dot(NL,Hh),0.),26.)*lit*(.05+.55*rm*abs(rv))*(1.-smoothstep(200.,900.,dist));}', // le LUSTRE des crêtes de rides (sur la ride seulement)
  '  if(dist<115.&&wat<.5&&uMo.z>.9){vec2 gc=floor(pp*11.);float g1=dh2(gc),g2=dh2(gc+17.3),g3=dh2(gc+41.9);vec3 Nc=normalize(NL+vec3(g1-.5,g3*.3,g2-.5)*.9);',
  '    c+=uSunC*pow(max(dot(Nc,Hh),0.),520.)*step(.55,g3)*lit*uQ.w*(1.-smoothstep(40.,115.,dist))*6.;}', // les ÉCLATS : une facette de 9 cm au hasard, juste quand elle renvoie le soleil vers l'œil
  /* LES ÉCLATS DE FACETTE (le sable de près comme de loin : une facette plate qui renvoie le soleil vers l'œil) ET LES JOINTS VITRAIL (une arête de lumière, qui respire d'une onde lente) */
  '  if(uPoly>.5&&wat<.5){float fgl=pow(max(dot(NL,Hh),0.),70.)*step(.5,hs9)*lit*(1.-smoothstep(300.,2200.,dist));c+=uSunC*fgl*uPl.z*2.2;',
  '    float wv=.78+.22*sin(dot(vW.xz,vec2(.0049,.0031))-uTime*.7);c=mix(c,vec3(1.,.90,.72)*(dot(c,vec3(.3,.55,.15))*1.35+.04),jn*wv*.48);}',
  /* LA LUMIÈRE DU SABLE : le contre-jour (les crêtes s'embrasent quand on regarde vers le soleil), le voile de diffusion dans l'air, le terminateur orangé (la lumière qui traverse le grain), le rebond chaud dans l'ombre */
  '  if(uLum>.5&&wat<.5){float vs=max(dot(-V,Ls),0.),rim=pow(1.-max(dot(NL,V),0.),3.),tm=smoothstep(-.10,.16,ndl)*(1.-smoothstep(.16,.62,ndl));',
  '    c+=uSunC*vec3(1.,.70,.40)*rim*vs*vs*vs*lit*uLm.x*(1.-.5*smoothstep(1500.,4000.,dist));',
  '    c+=col*uSunC*vec3(.62,.24,.07)*tm*lit*uLm.z;',
  '    c+=col*uSunC*vec3(.95,.58,.32)*(1.-lit)*(.5+.5*NL.y)*.12*uLm.w;',
  '    c+=uSunC*vec3(1.,.80,.52)*pow(vs,6.)*(1.-exp(-dist/2600.))*uLm.y*.5;}',
  /* LES ÉTINCELLES D'OR (l'éclat cash) : de rares grains qui s'allument un instant, or ou rose, jusqu'à 2 km — la cellule grandit avec la distance (≈ 3 px à l'écran) */
  '  if(uSp.w>.001&&wat<.5){float cs=exp2(floor(log2(max(dist,4.)*.0042)*2.)*.5),hq=dh2(floor(vW.xz/cs)+cs),tw=pow(.5+.5*sin(uTime*(2.4+3.*fract(hq*91.))+hq*600.),10.);',
  '    c+=mix(uSp.rgb,vec3(1.,.42,.74),step(.72,fract(hq*37.)))*step(.986,hq)*tw*lit*(1.-.9*pan)*(1.-smoothstep(500.,2400.,dist))*2.4*uSp.w;}',
  /* LA CRÊTE VIVE : le grain diffuse la lumière vers l'avant au rasant (un liseré d'or sur les crêtes en contre-jour), et le sable FILE des crêtes dans le vent (bandes qui dérivent, uTime) */
  '  {float fg=pow(max(dot(-V,uSunD),0.),3.)*fr*lit*(1.-wat);float spd=smoothstep(.62,.94,du)*(1.-smoothstep(.97,1.,du)),sn=texture2D(uNZ,vec2((wx-uTime*11.)/380.,wz/17.)).a;',
  '   c+=mix(uSunC,uSaL*dot(uSunC,vec3(.33)),.4)*(fg*.55+spd*smoothstep(.50,.80,sn)*.50*lit)*uEx.w*(1.-pan)*(1.-.7*smoothstep(900.,3000.,dist));}',
  '  if(wat>.01){vec4 nw=texture2D(uNZ,mat2(.8,.6,-.6,.8)*vW.xz/57.+uTime*vec2(.006,.010)),nw2=texture2D(uNZ,vW.xz/143.-uTime*vec2(.004,.002));', /* (des bruits LARGES et tournés : à 18 m la tuile du bruit se répétait en grille sur le lac) */
  '    vec3 Nw=normalize(vec3(0.,6.,0.)+vec3(nw.r+nw2.g-1.,0.,nw.g+nw2.r-1.));vec3 wc=mix(uWS,uWD,1.-exp(-dep/4.));',
  '    float f9=.02+.98*pow(1.-max(dot(V,Nw),0.),5.);vec3 R=reflect(-V,Nw),sk=mix(uSkH,uSkZ,smoothstep(0.,.5,R.y));',
  '    vec3 cw=wc*(uSunC*(.3+.7*max(dot(Nw,uSunD),0.))*lit+mix(uGnd,uSky,.7))*.9+sk*f9+uSunC*pow(max(dot(R,uSunD),0.),160.)*1.2*lit;c=mix(c,cw,wat);}',
  '  if(uPhC.r+uPhC.g>.001){vec3 lv=vW-uPhP;float dl=length(lv);vec3 ld=lv/max(dl,.01);c+=col*uPhC*smoothstep(.80,.95,dot(ld,uPhD))*max(dot(NL,-ld),0.)/(1.+dl*dl/9000.);}', // les PHARES sur le sable
  /* LE MIRAGE : au loin, le sable presque à plat, vu en rasant, renvoie le ciel — et tremble */
  '  if(uQ.y>.001){float mi=uQ.y*smoothstep(800.,3200.,dist)*(1.-smoothstep(.02,.10,abs(V.y)))*(1.-smoothstep(.06,.25,stp));',
  '   float sh=texture2D(uNZ,vec2(vW.x/260.+uTime*.04,vW.z/260.-uTime*.03)).r;c=mix(c,mix(mix(uSkH,uSkZ,.25),uWS*1.3+.06,.42*uEx.z)*(.92+.16*sh),mi*(.55+.45*sh));}',
  /* LA BRUME EN PLANS : la poussière du proche reste chaude, celle du lointain vire au froid du ciel (le plan lointain est plus clair et plus froid) et s'épaissit dans les creux */
  '  {float far=smoothstep(1500.,6500.,dist)*uEx.z,low=smoothstep(40.,-150.,vW.y-uCam.y)*smoothstep(500.,2600.,dist);vec3 hc=mix(uHaze,uHaze*.45+mix(uSkH,uSkZ,.45)*.75,far);',
  '   c=mix(c,hc,clamp(uQ.x*smoothstep(150.,4500.,dist)*.65*(1.+.6*low*uEx.z),0.,1.));}', // la poussière en suspension
  '  c=mix(c,uHaze,uQ.z*smoothstep(8.,500.,dist)*.5);', // (le vent de sable et la tempête : la poussière est DANS l'air tout près — le sable proche n'est plus net)
  '  c+=uFlash*col*vec3(.75,.78,1.)*(.35+.65*max(NL.y,0.));',
  '  gl_FragColor=vec4(c,1.);','#include <fog_fragment>','}'].join('\n');
/* LES HIÉROGLYPHES (2026-10-22, Léo : « construis ta connaissance culture générale Égypte ») — un atlas de 16 signes de 64 px dessinés au trait (blanc sur noir) : ânkh, œil oudjat, eau, roseau, plume de Maât, hibou, disque solaire, scarabée, papyrus,
   cobra, faucon, sceptre ouas, pilier djed, pain, panier, caille. La pierre gravée (aK 4 : obélisques, pylônes, frises) les lit par rangées (DN_AFS, uGl), assez grands pour se lire de ~60 m, jamais plus fins que ~3 px. */
function dnGlyphes(){if(DN.glT)return DN.glT;const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,256);x.strokeStyle='#fff';x.fillStyle='#fff';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';
  const G=[
   function(){x.beginPath();x.ellipse(32,17,9,12,0,0,6.283);x.stroke();x.beginPath();x.moveTo(32,29);x.lineTo(32,58);x.moveTo(18,36);x.lineTo(46,36);x.stroke();},                                  // ânkh
   function(){x.beginPath();x.moveTo(8,32);x.quadraticCurveTo(30,10,54,30);x.quadraticCurveTo(30,44,8,32);x.stroke();x.beginPath();x.arc(31,30,6,0,6.283);x.fill();x.beginPath();x.moveTo(14,20);x.quadraticCurveTo(30,8,50,18);x.moveTo(30,42);x.lineTo(34,56);x.quadraticCurveTo(46,58,48,48);x.stroke();}, // œil oudjat
   function(){x.beginPath();for(let r=0;r<3;r++){const y=16+r*14;x.moveTo(8,y);x.lineTo(20,y-7);x.lineTo(32,y);x.lineTo(44,y-7);x.lineTo(56,y);}x.stroke();},                                       // l'eau
   function(){x.beginPath();x.moveTo(32,58);x.quadraticCurveTo(14,32,32,6);x.quadraticCurveTo(50,32,32,58);x.stroke();x.beginPath();x.moveTo(32,58);x.lineTo(32,18);x.stroke();},               // le roseau
   function(){x.beginPath();x.moveTo(32,60);x.lineTo(32,8);x.stroke();x.beginPath();x.ellipse(32,30,10,24,0,0,6.283);x.stroke();for(let i=0;i<5;i++){x.beginPath();x.moveTo(32,16+i*8);x.lineTo(24,22+i*8);x.moveTo(32,16+i*8);x.lineTo(40,22+i*8);x.stroke();}}, // la plume de Maât
   function(){x.beginPath();x.ellipse(32,34,13,20,0,0,6.283);x.stroke();x.beginPath();x.arc(26,26,4,0,6.283);x.arc(38,26,4,0,6.283);x.fill();x.beginPath();x.moveTo(32,30);x.lineTo(32,36);x.moveTo(22,44);x.lineTo(42,44);x.moveTo(26,56);x.lineTo(26,62);x.moveTo(38,56);x.lineTo(38,62);x.stroke();}, // le hibou
   function(){x.beginPath();x.arc(32,32,18,0,6.283);x.stroke();x.beginPath();x.arc(32,32,6,0,6.283);x.fill();for(let i=0;i<8;i++){const a=i*.785;x.moveTo(32+Math.cos(a)*22,32+Math.sin(a)*22);x.lineTo(32+Math.cos(a)*28,32+Math.sin(a)*28);}x.stroke();}, // le disque solaire
   function(){x.beginPath();x.ellipse(32,34,12,17,0,0,6.283);x.stroke();x.beginPath();x.moveTo(32,17);x.lineTo(32,51);x.moveTo(22,28);x.lineTo(8,22);x.moveTo(22,40);x.lineTo(8,46);x.moveTo(42,28);x.lineTo(56,22);x.moveTo(42,40);x.lineTo(56,46);x.stroke();x.beginPath();x.arc(32,12,5,0,6.283);x.stroke();}, // le scarabée
   function(){x.beginPath();x.moveTo(32,60);x.lineTo(32,24);x.stroke();for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(32,24);x.quadraticCurveTo(32+i*8,12,32+i*11,6);x.stroke();}x.beginPath();x.moveTo(20,50);x.lineTo(44,50);x.stroke();}, // le papyrus
   function(){x.beginPath();x.moveTo(20,58);x.quadraticCurveTo(46,52,34,36);x.quadraticCurveTo(22,22,32,12);x.stroke();x.beginPath();x.ellipse(32,14,9,7,0,0,6.283);x.stroke();x.beginPath();x.arc(36,11,2,0,6.283);x.fill();}, // le cobra
   function(){x.beginPath();x.moveTo(14,56);x.lineTo(24,30);x.quadraticCurveTo(26,16,38,14);x.lineTo(46,18);x.lineTo(40,24);x.quadraticCurveTo(38,36,40,56);x.stroke();x.beginPath();x.arc(36,20,2.5,0,6.283);x.fill();x.beginPath();x.moveTo(24,40);x.lineTo(56,34);x.stroke();}, // le faucon
   function(){x.beginPath();x.moveTo(32,6);x.lineTo(32,56);x.moveTo(32,56);x.lineTo(22,62);x.moveTo(32,56);x.lineTo(42,62);x.stroke();x.beginPath();x.moveTo(24,8);x.quadraticCurveTo(32,2,40,8);x.stroke();}, // le sceptre ouas
   function(){x.beginPath();x.moveTo(32,6);x.lineTo(32,60);x.stroke();for(let i=0;i<4;i++){x.beginPath();x.moveTo(18,16+i*9);x.lineTo(46,16+i*9);x.stroke();}x.beginPath();x.moveTo(24,8);x.lineTo(40,8);x.stroke();}, // le pilier djed
   function(){x.beginPath();x.moveTo(8,46);x.quadraticCurveTo(32,6,56,46);x.closePath();x.stroke();},                                                                                                   // le pain
   function(){x.beginPath();x.moveTo(10,20);x.lineTo(54,20);x.lineTo(46,54);x.lineTo(18,54);x.closePath();x.stroke();x.beginPath();x.moveTo(14,32);x.lineTo(50,32);x.moveTo(16,44);x.lineTo(48,44);x.stroke();}, // le panier
   function(){x.beginPath();x.ellipse(30,38,17,13,0,0,6.283);x.stroke();x.beginPath();x.arc(44,26,7,0,6.283);x.stroke();x.beginPath();x.moveTo(50,24);x.lineTo(58,26);x.moveTo(26,50);x.lineTo(24,60);x.moveTo(36,50);x.lineTo(38,60);x.stroke();} // la caille
  ];
  for(let i=0;i<16;i++){x.save();x.translate((i%4)*64,Math.floor(i/4)*64);try{G[i]();}catch(e){}x.restore();}
  const tx=new THREE.CanvasTexture(cv);tx.generateMipmaps=true;tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;tx.wrapS=tx.wrapT=THREE.ClampToEdgeWrapping;tx.anisotropy=4;tx.needsUpdate=true;DN.glT=tx;return tx;}
/* (2026-10-25, LES DUNES SOBRES) le shader de pixels du sable, sur téléphone : la même image à 6/255 près au pire (le grain animé d'une image à l'autre en fait déjà 4 : chaque lecture de texture n'est faite que là où son résultat compte — la végétation, l'argile, la crête vive, les octaves de rides
   hors de leur portée), sans le calcul des FACETTES du sable (dérivées, hachage, joints : leurs poids joint/éclat/plat valent 0 dans toutes les ambiances, il ne restait qu'une teinte de ±1,5 % par triangle : ~0,9 ms, 8 % de l'image). Un remplacement qui ne trouve plus son texte est ignoré : le shader d'origine reste juste. */
function dnLite(fs){const R=[["vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);vec3 col=mix(sa,clay,cl);col=mix(col,gv,veg);", "vec3 col=mix(sa,clay,cl);if(veg>.001){vec3 gv=uVeg*(.74+.38*n2.g)*(.90+.20*texture2D(uNZ,pp/1.9).b);gv=mix(gv,gv*vec3(1.30,1.12,.62),smoothstep(.55,.80,n1.r)*.8);col=mix(col,gv,veg);}"], ["float cr=texture2D(uNZ,vW.xz/14.).r,cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));", "float cl=pan*smoothstep(.16,.05,stp);vec3 clay=uClay;if(cl>.001){float cr=texture2D(uNZ,vW.xz/14.).r;clay=uClay*(.90+.12*n2.g)*(1.-.30*smoothstep(.465,.5,cr)*smoothstep(.535,.5,cr));}"], ["sn=texture2D(uNZ,vec2((wx-uTime*11.)/380.,wz/17.)).a;", "sn=du>.62?texture2D(uNZ,vec2((wx-uTime*11.)/380.,wz/17.)).a:0.;"], ["float s1=cos(6.2832*(dot(pp,d)/.62+wp)),s2=cos(6.2832*(dot(pp,d)/3.1+.8*wp+n2.r*1.5)),s3=cos(6.2832*(dot(pp,d)/13.+.5*wp+1.2*n1.r));", "float s1=0.,s2=0.,s3=0.;if(a1>0.)s1=cos(6.2832*(dot(pp,d)/.62+wp));if(a2>0.)s2=cos(6.2832*(dot(pp,d)/3.1+.8*wp+n2.r*1.5));if(a3>0.)s3=cos(6.2832*(dot(pp,d)/13.+.5*wp+1.2*n1.r));"], ["aa*cos(ph2)*.075*(1.-smoothstep(150.,350.,dist))", "(dist<350.?aa*cos(ph2)*.075*(1.-smoothstep(150.,350.,dist)):0.)"], ["if(uPoly>.5){vec3 nf=cross(", "if(false){vec3 nf=cross("], ["vec3 NL=N;if(uPoly>.5){vec3 dv=Nf-Ns;", "vec3 NL=N;if(false){vec3 dv=Nf-Ns;"], ["if(uPoly>.5)col*=ftn*vec3(", "if(false)col*=ftn*vec3("], ["if(uPoly>.5&&wat<.5){float fgl=", "if(false){float fgl="]];for(let i=0;i<R.length;i++)if(fs.indexOf(R[i][0])>=0)fs=fs.replace(R[i][0],R[i][1]);return fs;}
function dnTerrain(){ if(DN.mesh)return;
  cyBruits();
  const G=PAL.b('dnGrille',32),P=new Float32Array((G+1)*(G+1)*3),I=[];DN.G=G;DN.R0=PAL.b('dnR0',118);DN.lmin=DN_POLY?Math.max(0,Math.ceil(Math.log2(DN_CELL*G/DN.S0))):0; /* (facettes) la plus petite cellule : ~7,5 m (G=32 : niveau 2 = 8 m · G=16 : niveau 1 = 8 m) */
  for(let j=0;j<=G;j++)for(let i=0;i<=G;i++){const o=(j*(G+1)+i)*3;P[o]=i;P[o+1]=0;P[o+2]=j;}
  for(let j=0;j<G;j++)for(let i=0;i<G;i++){const a=j*(G+1)+i,b=a+1,c=a+G+1,d=c+1;I.push(a,c,b,b,c,d);}
  const g=new THREE.InstancedBufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
  DN.aN=new THREE.InstancedBufferAttribute(new Float32Array(DN.maxN*4),4);DN.aN.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aN',DN.aN);g.instanceCount=0;
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1e7);DN.geo=g;
  const z1=new THREE.DataTexture(new Float32Array([0,0,0,0]),1,1,THREE.RGBAFormat,THREE.FloatType);z1.needsUpdate=true;
  const C3=()=>({value:new THREE.Color()});
  const U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uTC:{value:z1},uTZ:{value:z1},uTS:{value:z1},uNZ:{value:CY.tNz},uGl:{value:dnGlyphes()},
    uFD:{value:new THREE.Vector4(0,0,1,1)},uZD:{value:new THREE.Vector4(0,0,1,1)},uSD:{value:new THREE.Vector4(0,0,1,1)},uFN:{value:new THREE.Vector2(1,1)},uZN:{value:new THREE.Vector2(1,1)},uSN:{value:new THREE.Vector2(1,1)},
    uOA:{value:new THREE.Vector4(0,0,0,0)},uW:{value:new THREE.Vector4(1,0,1,0)},uLam:{value:560},uEx:{value:new THREE.Vector4(1,1,.8,1)},uSp:{value:new THREE.Vector4(1,.8,.45,1)},
    uCam:{value:new THREE.Vector3()},uG:{value:G},uR0:{value:DN.R0},uTime:{value:0},uFlash:{value:0},uSunD:{value:SUN_DIR},
    uSunC:C3(),uSky:C3(),uGnd:C3(),uFillC:C3(),uFillD:{value:new THREE.Vector3(0,-1,0)},uSaA:C3(),uSaB:C3(),uSaL:C3(),uShd:C3(),uClay:C3(),uVeg:C3(),uHaze:C3(),uSkH:C3(),uSkZ:C3(),uWS:C3(),uWD:C3(),
    uQ:{value:new THREE.Vector4()},uPoly:{value:DN_POLY?1:0},uLum:{value:DN_POLY&&DN_LUM?1:0},uPl:{value:new THREE.Vector4(.03,0,0,0)},uLm:{value:new THREE.Vector4(.5,.25,.30,.06)},uFin:{value:new THREE.Vector4(0,0,0,0)},uK:{value:new THREE.Vector4(.5,1,.25,1)},uMo:{value:new THREE.Vector4(.8,.010,1,0)},uPhP:{value:new THREE.Vector3()},uPhD:{value:new THREE.Vector3(0,0,1)},uPhC:{value:new THREE.Color(0,0,0)}});
  DN.mat=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_VS,fragmentShader:DN_MOB?dnLite(DN_FS):DN_FS,fog:true});DN.mat.dispose=function(){};
  const m=new THREE.Mesh(g,DN.mat);m.frustumCulled=false;m.matrixAutoUpdate=false;m.visible=false;m.name='dunes';m.renderOrder=-1;scene.add(m);DN.mesh=m;
  const gr=new THREE.Group();gr.matrixAutoUpdate=false;gr.visible=false;scene.add(gr);DN.grp=gr;
}
/* LE QUADTREE (CDLOD), à chaque rendu — celui du canyon (cySelect), sur la grille des dunes */
function dnSelect(cam){const M=DN.mesh;if(!M||!M.visible)return;
  DN.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);DN.fr.setFromProjectionMatrix(DN.pm);
  const cx=cam.position.x,cz=cam.position.z,R0=DN.R0,A=DN.aN.array,MAX=DN.maxN,y0=DN.yMin,y1=DN.yMax,bx=DN.box,L9=DN.lods,lm=DN.lmin|0;let n=0;
  const dR=(x0,z0,s)=>{const dx=Math.max(x0-cx,0,cx-x0-s),dz=Math.max(z0-cz,0,cz-z0-s);return Math.sqrt(dx*dx+dz*dz);};
  const add=(x0,z0,s,l)=>{if(n>=MAX)return;const o=n*4;A[o]=x0;A[o+1]=z0;A[o+2]=s;A[o+3]=l;n++;};
  const sel=(x0,z0,s,l)=>{const d=dR(x0,z0,s);if(d>R0*Math.pow(2,l))return false;
    bx.min.set(x0,y0,z0);bx.max.set(x0+s,y1,z0+s);if(!DN.fr.intersectsBox(bx))return true;
    if(l<=lm||d>R0*Math.pow(2,l-1)){add(x0,z0,s,l);return true;}
    const h=s/2;for(let q=0;q<4;q++){const qx=x0+(q&1)*h,qz=z0+(q>>1)*h;if(!sel(qx,qz,h,l-1))add(qx,qz,h,l-1);}return true;};
  const SR=DN.S0*Math.pow(2,L9),reach=Math.min(R0*Math.pow(2,L9),(cam.far||9800)+400);
  for(let ix=Math.floor((cx-reach)/SR);ix<=Math.floor((cx+reach)/SR);ix++)for(let iz=Math.floor((cz-reach)/SR);iz<=Math.floor((cz+reach)/SR);iz++){
    if(dR(ix*SR,iz*SR,SR)>reach)continue;if(!sel(ix*SR,iz*SR,SR,L9))add(ix*SR,iz*SR,SR,L9);}
  DN.n=n;DN.tri=n*DN.G*DN.G*2;DN.geo.instanceCount=n;DN.aN.updateRange.offset=0;DN.aN.updateRange.count=n*4;DN.aN.needsUpdate=true;
  DN.mat.uniforms.uCam.value.copy(cam.position);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);try{if(DN.on)dnSelect(cam);}catch(e){window.__dnErr=e;}};} // CHAÎNÉ (jamais réassigné)
/* chaque image : les lumières de la scène dans la matière du sable, l'ambiance des dunes (BIO.cur.dn*), l'éclair — et l'ombre des crêtes SUR LA
   CAISSE (la clé baisse quand on passe à l'ombre d'une dune : seul écrit du soleil hors de bioApply, et seulement ici — comme canyonTick, qu'il suit) */
/* (2026-10-20, LE DÉSERT AU HASARD) LES PALETTES DU SABLE : la teinte de l'ambiance tirée vers une autre teinte À LUMINANCE ÉGALE (la nuit reste la nuit) —
   [r, g, b de la teinte, part, gain de luminance] ; l'or = le sable d'avant */
const DN_SAB={or:null,rouge:[.84,.42,.26,.5,.95],blanc:[1,.95,.86,.78,1.2],rose:[.96,.68,.56,.5,1.04]};
function dnTeinte(c,T){const l=c.r*.3+c.g*.55+c.b*.15,n=T[0]*.3+T[1]*.55+T[2]*.15,g=l*T[4]/n,k=T[3];c.r+=(T[0]*g-c.r)*k;c.g+=(T[1]*g-c.g)*k;c.b+=(T[2]*g-c.b)*k;}
/* (2026-10-23, Léo : « inspire-toi de plusieurs météos et couleurs ») LES VARIANTES D'AMBIANCE, tirées avec la graine du décor (`DN.deco.sd`, sans toucher dnTirage) : le SOIR est ROSE-VIOLET (le crépuscule d'origine) ou DORÉ (soleil bas, ciel bleu-or), le MIDI BLEU PUR ou NUAGEUX
   (lumière filtrée, ciel gris-bleu). Les valeurs de base sont gardées à part (`__o`) : rien ne s'accumule d'une partie à l'autre. `?ciel=0` = les ambiances d'avant, `?ciel=dore|rose|nuageux|bleu` en force une. */
const DN_VAR={soir:{rose:{},dore:{jZen:[.16,.26,.58],jMid:[.72,.52,.48],jHor:[1,.74,.40],jSol:[1,.60,.22],fog:[.98,.74,.46],fogCj:[1,.72,.42],hemiS:[.50,.56,.86],hemiG:[.80,.54,.34],sunC:[1,.72,.38],cyZ:[.16,.26,.58],cyM:[.72,.52,.48],cyH:[1,.74,.40],cyS:[1,.62,.26],cyC:[1,.70,.44],cyR:[.86,.52,.34],dnA:[1,.74,.38],dnB:[.92,.54,.28],dnL:[1,.86,.58],dnS:[.52,.52,.92],dnH:[1,.74,.46],cyK:[.66,.35,0,0]}},
  midi:{bleu:{},nuageux:{jZen:[.30,.40,.58],jMid:[.54,.62,.76],jHor:[.88,.86,.80],fog:[.82,.78,.70],fogCj:[.92,.86,.76],hemiS:[.52,.62,.84],sunI:.95,cyZ:[.30,.40,.58],cyM:[.54,.62,.76],cyH:[.88,.86,.80],cyS:[1,.94,.84],cyB:[.62,.64,.72],cyC:[.98,.98,.98],cyN:[0,.9,2.4,0],cyK:[.95,.3,0,0],dnS:[.50,.56,.90],dnH:[.90,.86,.76],dnA:[.88,.74,.50],dnB:[.78,.60,.38]}}};
function dnAmb(){const D=DN.deco;if(!D||DN._amb===D.sd)return;DN._amb=D.sd;const f=/[?&]ciel=(\w+)/.exec(location.search),h=(Math.imul((D.sd^0xC1E10)>>>0,0x9E3779B1)>>>0)/4294967296;
  for(const nm in DN_VAR){const B=BIOMES['dunes'+nm[0].toUpperCase()+nm.slice(1)];if(!B)continue;const o=B.__o||(B.__o={}),V=DN_VAR[nm],ks=Object.keys(V);let v=f&&f[1]==='0'?null:V[ks[h<.5?0:1]];if(f&&V[f[1]])v=V[f[1]];
    const cp=function(x){return Array.isArray(x)?x.slice():x;};for(const k in o)B[k]=cp(o[k]);                          /* d'abord la base */
    if(v)for(const k in v){if(o[k]===undefined)o[k]=cp(B[k]);B[k]=cp(v[k]);}}
  {const B=BIO.to;if(B&&/^dunes/.test(BIO.name||'')){bioLerp(B,B,1,BIO.cur);bioApply(BIO.cur);paintEnv(B.env,B.eS1,B.eS2);}}} /* l'ambiance courante est recalculée tout de suite */
const DN_NUA=!/[?&]nuages=0\b/.test(location.search); /* (2026-10-23, Léo : « plus de nuages ») `?nuages=0` : le ciel d'avant (peu de nuages, ronds, plats) */
function dnNuages(){const on=DN.on&&DN_NUA&&!QUAL_LOW&&/^dunes/.test(BIO.name||''),W=skyU.uCyW.value;if(!on){W.set(0,0);return;}W.set(.4,1);if(!DN_NUA&&skyU.uCyK){}} // bandes étirées, nuages modelés
function dunesTick(dt){dnAmb();dnNuages();
  if(DN.on&&DN.sunAz!=null&&DN.sunEl!=null&&BIO.cur.cyA&&BIO.cur.cyA[0]<14)BIO.cur.cyA=[DN.sunEl,DN.sunAz,BIO.cur.cyA[2],BIO.cur.cyA[3]]; // le soir : le soleil dans l'axe de l'arrivée (voir buildDunes)
  if(!DN.mat)return;const U=DN.mat.uniforms,c=BIO.cur,k=LVL.dunes||0;
  if(DN.on&&!paused)U.uTime.value=(U.uTime.value+dt)%4096;
  if(DN.gx>1&&(mode!=='fall'||!DN.on))DN.gx=1; // le vol fini (ou la map quittée) : la pesanteur redevient la sienne
  U.uPoly.value=DN_POLY?1:0;U.uLum.value=DN_POLY&&DN_LUM&&!QUAL_LOW?1:0; /* (facettes) qualité basse : les facettes restent (moins de triangles), sans les effets de lumière */
  if(DN.on){U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
    U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize();
    const f=(u,k9)=>{const a=c[k9];if(a)u.value.fromArray(a);};
    f(U.uSaA,'dnA');f(U.uSaB,'dnB');f(U.uSaL,'dnL');f(U.uShd,'dnS');f(U.uClay,'dnC');f(U.uVeg,'dnV');f(U.uHaze,'dnH');f(U.uWS,'dnW');f(U.uWD,'dnX');f(U.uSkH,'cyH');f(U.uSkZ,'cyZ');
    const D9=DN.deco,T9=D9&&DN_SAB[D9.sable];if(T9){dnTeinte(U.uSaA.value,T9);dnTeinte(U.uSaB.value,T9);dnTeinte(U.uSaL.value,T9);} // (2026-10-20) LA COULEUR DU SABLE tirée (relue chaque image : rien ne s'accumule)
    const Q9=c.dnQ||[0,0,0,0],K9=c.dnK||[.5,1,.25,1];U.uQ.value.set(Q9[0],Q9[1],Q9[2],Q9[3]);U.uK.value.set(K9[0],K9[1]*(D9?D9.vent.rides:1),K9[2],K9[3]);{const R9=DN.reg||{},E9=R9.ex||c.dnE||[1,1,.8,1],P9=R9.sp||c.dnP||[1,.8,.45,1],pm=PAL.b('dnMat',1);U.uEx.value.set(E9[0],E9[1]*pm,E9[2],E9[3]*pm);U.uSp.value.set(P9[0],P9[1],P9[2],P9[3]*pm);} /* (2026-10-21) le grain, les crêtes qui filent, les étincelles, la brume en plans : dnE = [ombre froide, grain, brume lointaine froide, crêtes vives] et dnP = [teinte, quantité] des étincelles ; réduits aux paliers ANCIEN / MOYEN */ {const M9=c.dnM||[.8,.010,1,0];U.uMo.value.set(M9[0],M9[1],QUAL_LOW||!DN_MOSA?0:M9[2]*PAL.b('dnMo',1),M9[3]);} /* (2026-10-22, Léo : « le niveau dune n'est pas au niveau — regarde jade, la grotte, la forêt ») LA MOSAÏQUE du sable : [case de près (m), case par mètre de distance, force, —] */
    U.uFlash.value=CAMP_FLASH||0;skyU.uCyF.value=U.uFlash.value;
    {const nu=(LVL.nuit||0)*(mode==='boom'?0:1),sh=c.sunI<.9?1-c.sunI/.9:0,k9=Math.max(nu,sh*.6)*2.4;U.uPhC.value.copy(headSpot.color).multiplyScalar(k9); // les phares, la nuit et dans la tempête
     if(k9>.001){U.uPhP.value.copy(carGroup.position);U.uPhP.value.y+=1.2;U.uPhD.value.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uPhD.value.y-=.08;U.uPhD.value.normalize();}}}
  let ombre=1;
  if(DN.on&&DN.O&&started&&!gameOver){const p=carGroup.position,O=DN.O,px=(p.x-(O.x0-O.ts*.5))/O.ts,pz=(p.z-(O.z0-O.ts*.5))/O.ts;
    if(px>0&&pz>0&&px<O.nx&&pz<O.nz){const hs=cyBil(O.h,O.nx,O.nz,1,0,px,pz);ombre=Math.max(0,Math.min(1,(p.y-hs+3)/12));}}
  DN.ombre+=(ombre-DN.ombre)*Math.min(1,dt*5);dnPartTick(dt,c);
  if(k>.001||DN.ecrit){const e=DN.on?k:0;sun.intensity=c.sunI*(1-.62*(1-DN.ombre)*e);DN.ecrit=e>.001;}
  dnCaravane(dt);dnTornades(dt);dnVautours(dt);}
/* LES TREMPLINS DE CRÊTE (2026-10-22, Léo : « les routes qui font sauter embrassent une haute colline de sable… le joueur peut piquer en bas ou décoller »). La route est CONTINUE : chaque vague a son apex (DN.lev[k].s,
   le haut de la crête), et derrière lui la route redescend sur l'éperon. Une caisse qui y passe VITE (≥ 90 km/h) est lancée JUSTE ce qu'il faut pour retomber SUR la route de la descente (DN.lev[k].aim : la distance
   visée depuis l'apex), à n'importe quelle vitesse — t = aim / la vitesse (entre 0,6 et 2,6 s), la montée = ½ g t − la descente à franchir / t, moins ce que la pente de l'apex donne déjà (MESURÉ au pilote : « la pose
   se déclare dès 0,35 s si la caisse est à moins de 3 m du bitume » : on garde la caisse à plus de 4 m du ruban au bout de 0,35 s). En l'air le joueur choisit : PIQUER (le pouce vers le bas : la caisse se pose plus tôt,
   sur la pente) ou DÉCOLLER pour de bon (planer, des figures, se poser plus loin). Plus lente que 90 km/h, la caisse ne décolle pas : elle roule par-dessus la crête et DESCEND avec la route. g monde ~23 m/s²
   (FALL_G × SPD). Pas de recharge (rampCd). DN.sauts = le compte (banc). */
const DN_LF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const DN_GX={on:!/[?&]sans=([^&]*,)?dunesgrav(,|&|$)/.test(location.search),v0:110,p:1.3,max:2.3}; /* la pesanteur du vol : (vitesse / 110)^1,3, de ×1 à ×2,3 — `?sans=dunesgrav` = la pesanteur d'avant */
function dnLevre(s0){if(side<0||introD||driveDir<0)return;const a=Math.min(s0,s),b=Math.max(s0,s);
  for(const k of DN.lev){if(b<k.s||a>=k.e-2)continue;if(!(k.s>=a-.01&&k.s<=b+.01)&&!(s>k.s&&s<k.e-2))continue;if(Math.abs(lat)>ROAD_HALF)return;
    const vm=vitMult(),vx=Math.max(12,Math.abs(vA)*SPD*vm);if(vx*3.6<90)return; /* (trop lent : il roule par-dessus la crête) */
    const S9=DN.S,yAt=q=>{const f=Math.max(0,Math.min(S9.n-1.001,q/S9.ds)),i=Math.floor(f);return S9.y[i]+(S9.y[i+1]-S9.y[i])*(f-i);},gx=DN_GX.on?Math.max(1,Math.min(DN_GX.max,Math.pow(vx/DN_GX.v0,DN_GX.p))):1,g2=FALL_G*SPD*.5*gx,sb=Math.max(s,k.s),y0=yAt(sb);DN.gx=gx;
    const t=Math.max(.6,Math.min(2.6,Math.max(30,k.s+k.aim-sb)/vx)),D=y0-yAt(sb+vx*t),d35=y0-yAt(sb+vx*.35);
    frameAt(sb,DN_LF);const ty=DN_LF.t.y;
    const vy=Math.min(24,Math.max((g2*t*t-D)/t,(4+g2*.1225-d35)/.35)),u=THREE.MathUtils.clamp(vy/SPD-ty*Math.abs(vA)*vm,0,60);DN.dbgLev={gx:+gx.toFixed(2),vx:+vx.toFixed(1),vy:+vy.toFixed(1),u:+u.toFixed(1),ty:+ty.toFixed(3),t:+t.toFixed(2),D:+D.toFixed(1),d35:+d35.toFixed(1),k:DN.lev.indexOf(k),tag:k.tag};
    rampCd=1.2;startFall(u,1);shake=Math.max(shake,.42);fovPunch=Math.max(fovPunch,9);try{hap([8,14]);}catch(e){}DN.sauts=(DN.sauts|0)+1;return;}} // (le coup de tremplin : un coup de grand-angle et une secousse)
/* EN VOL : le sable, l'eau de l'oasis, les obélisques et la pyramide tuent (5 points de caisse) — renvoie la cause, ou '' */
/* LA CAISSE REPLACÉE REPART LANCÉE (2026-10-22, DEBUGGING : la seconde chance des dunes) — respawn() repose la caisse 8 m avant safeS, à vA 26 (~45 km/h). Dans les
   dunes, la dernière dalle roulée avant une chute est la LÈVRE : la caisse replacée y arrive au pas, dnLevre la lance à ~23 m/s, 2,6 s de vol font ~60 m au-dessus d'un
   vide de 70 à 200 m → ENSEVELI DANS LE SABLE à coup sûr (MESURÉ : la reprise gagnée d'une pub re-meurt sur la même lèvre ; sous le bouclier, chaque chute la replace
   au même endroit). Sur une map à trous, la caisse replacée repart à la croisière du palier (vPalier) : la lèvre suivante la pose comme d'habitude. */
function dnRelance(){if(!DN.on||!TROUS.length||mode!=='drive')return;const v9=vPalier()/(SPD*vitMult());if(Math.abs(vA)<v9){vA=v9;DN.relance=(DN.relance|0)+1;}}
/* (2026-10-23, Léo : « comme le jeu du pingouin où il faut atterrir pour prendre la vitesse ») SE POSER SUR LA PENTE — la route descend (sl = −T.y > 3,5 %) et la caisse arrive dans son axe : a = 1 quand l'écart entre sa trajectoire
   et la pente est nul (0 à 16°), pondéré par la raideur (plein à 10 %) ; la perte de la pose fond de 92 % × a et la caisse GAGNE g = a·(5 % + 45 % × sl) de vitesse (+ 5 à + 17 %). Une pose ratée, ou à plat, ne gagne rien. La pente
   elle-même accélère déjà (boucle-2 : −GRAV × T.y) ; ceci récompense le geste. `?sans=dunessurf` l'éteint. */
const DN_SURF=!/[?&]sans=([^&]*,)?dunessurf(,|&|$)/.test(location.search);
function dnSurf(i,fv,ratee){if(!DN_SURF||ratee)return null;const T9=T[i];if(!T9)return null;const sl=-T9.y;if(sl<.035)return null;const sp=fv.length();if(sp<8)return null;
  const ang=Math.acos(Math.max(-1,Math.min(1,fv.dot(T9)/sp)))*57.2958,a=Math.max(0,1-ang/16)*Math.min(1,(sl-.025)/.075);if(a<.12)return null;return {a:a,g:a*(.05+.45*sl),sl:sl,ang:ang};}
function dnSurfFx(o){DN.surf=(DN.surf|0)+1;DN.surfG=+o.g.toFixed(3);shake=Math.max(shake,.25+.3*o.a);fovPunch=Math.max(fovPunch,4+7*o.a);try{hap([6,10]);}catch(e){}
  if(o.a>.35)try{trickMsg(o.a>.75?'DESCENTE PARFAITE':'BONNE DESCENTE',o.a>.75?1:true);}catch(e){}}
const DN_H9={};
function dunesHeurt(p){if(!DN.on||!DN.Z)return '';
  for(const o of JH){const x=p.x+o[0],z=p.z+o[1],h=dnHauteur(x,z,DN_H9);if(p.y<h+.7)return DN_H9.eau?'oasis':'sable';}
  return dnMonuHeurt(p);}
function dnMonuHeurt(p){
  for(const b of DN.ob){const dx=p.x-b.x,dz=p.z-b.z,t=Math.max(0,Math.min(1,(p.y-b.y)/b.h)),rr=b.r*(1.35-.69*t)+1.2;if(dx*dx+dz*dz<rr*rr&&p.y>b.y-2&&p.y<b.y+b.h+1)return 'obelisque';}
  const P=DN.pyr;if(P){const dx=p.x-P.x,dz=p.z-P.z,ca=Math.cos(P.a),sa=Math.sin(P.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca));
    if(p.y>P.y-20&&p.y<P.y+P.h+1&&e<P.hw*(1-(p.y-P.y)/P.h)+1.5)return 'pyramide';}
  for(const Q of DN.pyrs){if(Q===P)continue;const dx=p.x-Q.x,dz=p.z-Q.z,ca=Math.cos(Q.a),sa=Math.sin(Q.a),e=Math.max(Math.abs(dx*ca-dz*sa),Math.abs(dx*sa+dz*ca)); // (2026-10-20) les autres pyramides du tirage
    if(p.y>Q.y-20&&p.y<Q.y+Q.h+1&&e<Q.hw*(1-(p.y-Q.y)/Q.h)+1.5)return 'pyramide';}
  for(const m of DN.mo){const dx=p.x-m.x,dz=p.z-m.z;if(dx*dx+dz*dz<(m.r+1.2)*(m.r+1.2)&&p.y>m.y-2&&p.y<m.y+m.h+1)return 'roche';} // les grands monuments (sphinx, colosses, temple, portes)
  return '';}
/* ---- LES DÉCORS (low-poly à facettes : une face, une normale) — la même lumière que le sable et la même ombre (DN_MVS lit la grille de l'ombre) ---- */
const DN_MVS=['attribute float aK;uniform float uTime;uniform sampler2D uTS;uniform vec4 uSD;uniform vec2 uSN;varying vec3 vW,vN,vCol,vBc;varying float vLit,vK;','#include <fog_pars_vertex>',DN_TB,
  'void main(){','#ifdef USE_INSTANCING','  mat4 mw=modelMatrix*instanceMatrix;','#else','  mat4 mw=modelMatrix;','#endif',
  '  vec4 wp=mw*vec4(position,1.);if(aK>19.5&&aK<21.5){float u=clamp(aK-20.,0.,1.);wp.y+=sin(uTime*3.1+wp.x*.21+wp.z*.17+u*7.)*.55*u;wp.z+=cos(uTime*2.3+wp.x*.19+u*6.)*1.0*u;wp.x+=sin(uTime*2.7+u*5.)*.35*u;}vW=wp.xyz;vN=normalize(mat3(mw)*normal);',
  '#ifdef USE_COLOR','  vCol=color;','#else','  vCol=vec3(1.);','#endif',
  '  float cr9=mod(float(gl_VertexID),3.);vBc=vec3(1.-step(.5,cr9),step(.5,cr9)*(1.-step(1.5,cr9)),step(1.5,cr9));', // (facettes) le coin du triangle (géométrie NON indexée) : les coordonnées barycentriques des joints
  '  vK=aK;float lit=1.;vec2 sp=(wp.xz-uSD.xy)*uSD.zw;if(sp.x>0.&&sp.y>0.&&sp.x<1.&&sp.y<1.){float hs=tB(uTS,sp*uSN,uSN).r;lit=smoothstep(hs-3.,hs+8.,wp.y);}vLit=lit;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
/* (2026-10-22, Léo : « le niveau dune n'est pas au niveau ») LA MATIÈRE DES DÉCORS, REFAITE — par SOMMET (aK) : 0 peint (feuillage, toile, bois : lisse) · 1 ASSISES de pierre (rangées, joints décalés, la taille suit
   la distance : jamais plus fine que ~6 px) · 2 ROCHE (assises + lits) · 3 OR (brille) · 4 pierre GRAVÉE (assises + des glyphes, de près) · 5 GRÈS LISSE (la statue : une pierre d'une pièce, patinée) ; chaque bloc sa nuance et sa facette, son joint un peu sombre ; elles s'effacent sous ~2 px */
const DN_AFS=['uniform vec3 uSunD,uSunC,uSky,uGnd,uShd,uFillC,uFillD;uniform float uFlash,uTime,uPoly;uniform vec4 uMo,uPl;uniform sampler2D uNZ,uGl;varying vec3 vW,vN,vCol,vBc;varying float vLit,vK;','#include <fog_pars_fragment>',
  'float dh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'vec4 blk(vec2 uv,float ch,float sd){float row=floor(uv.y/ch),off=mod(row,2.)*.5;vec2 q=vec2(uv.x/(2.*ch)+off,uv.y/ch),ic=floor(q),fr=fract(q),e=min(fr,1.-fr);',
  '  float r=dh3(vec3(ic,sd)),r2=dh3(vec3(ic+7.7,sd+3.1)),j=1.-smoothstep(0.,.07,min(e.x*2.,e.y));vec2 g=(fr-.5)*vec2(1.6,1.);',
  '  float gl=step(abs(g.x),.5)*step(abs(g.y),.36)*step(.5,fract(g.y*3.4+r*6.))*step(.45,r2)*(1.-j);return vec4(r,j,r2,gl);}',
  'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 N0=N,Nf=N;if(uPoly>.5){vec3 nf=cross(dFdx(vW),dFdy(vW));float lf=length(nf);if(lf>1e-14){Nf=nf/lf;if(dot(Nf,N0)<0.)Nf=-Nf;}}float dist=length(cameraPosition-vW);vec3 c=vCol*vCol;float kk=vK,isB=step(.5,kk)*step(kk,1.5)+step(3.5,kk)*step(kk,4.5),isR=step(1.5,kk)*step(kk,2.5),isG=step(2.5,kk)*step(kk,3.5),isS=step(4.5,kk)*step(kk,5.5),pierre=min(1.,isB+isR+isS);c=max(mix(vec3(dot(c,vec3(.3,.55,.15))),c,mix(1.25,1.0,pierre)),0.);',
  '  vec3 aN=abs(N);vec2 tg=normalize(vec2(-N.z,N.x)+vec2(1e-5));vec2 uv=aN.y>.88?vW.xz:vec2(dot(vW.xz,tg),vW.y);', // (les assises SUIVENT la face : le long de sa tangente horizontale et de la hauteur — plus de tuiles en biais sur les flancs inclinés d'une pyramide, plus de couture entre deux axes)
  '  float Lg=log2(max(dist*.011,.75)/.75),l0=floor(Lg),wl=Lg-l0,ch=.75*exp2(l0),kf=(1.-smoothstep(.45,1.1,length(fwidth(uv))/ch))*uMo.z;',
  '  if(isB+isR>.5&&uMo.z>.001){vec4 b=mix(blk(uv,ch,l0),blk(uv,ch*2.,l0+1.),wl);c*=(1.+(b.x-.5)*.42*kf)*(1.-b.y*(.20+.06*isB)*kf)*(1.+.10*pierre);N=normalize(N+(vec3(b.x,b.z,fract(b.x*7.31))-.5)*.22*kf);',
  '    if(kk>3.5){float gs=max(ch*1.7,.9),kg=1.-smoothstep(.20,.55,length(fwidth(uv))/gs);vec2 gq=uv/gs,gc=floor(gq),gf=fract(gq);float hr=dh3(vec3(gc.y,3.3,1.)),hc=dh3(vec3(gc,5.5)),ok=step(.20,hr)*step(.10,hc)*step(.07,gf.x)*step(gf.x,.93)*step(.07,gf.y)*step(gf.y,.93);float ix=floor(hc*16.);',
  '      float gly=texture2D(uGl,(vec2(mod(ix,4.),floor(ix/4.))+gf*.84+.08)/4.).r;c*=1.-.46*gly*ok*kg;}}',
  '  if(isR>.5){vec2 nq=vec2(dot(vW.xz,vec2(.7071,.7071))/9.,vW.y/60.);float nr=texture2D(uNZ,nq).g;c*=.80+.40*nr;}',
  '  if(isS>.5){float nq=texture2D(uNZ,vW.xz/5.+vec2(vW.y/7.,vW.y/11.)).g,nb=texture2D(uNZ,vW.xz/1.3+vec2(vW.y/1.7,0.)).r;c*=(.82+.34*nq)*(.94+.12*nb);}',
  '  vec3 NL=N;','#ifndef DN_TOR','  float pf9=step(.5,uPoly)*(1.-step(21.5,kk)*step(kk,22.5));NL=normalize(mix(N,normalize(Nf+(N-N0)*.8),pf9*min(uPl.w,1.)));','#endif',
  '  float ndl=max(dot(NL,uSunD),0.);',
  '  vec3 L=uSunC*ndl*vLit*mix(1.,.78,pierre)+mix(uGnd,uSky,NL.y*.5+.5)+uGnd*.45*pierre*(1.-abs(NL.y))+uFillC*max(dot(NL,uFillD),0.)*.5;vec3 o=c*L;o=mix(o,o*uShd,(1.-vLit*min(1.,ndl*3.))*.45);',
  '  if(isG>.5){vec3 V=normalize(cameraPosition-vW),R=reflect(-uSunD,NL);o+=c*uSunC*pow(max(dot(R,V),0.),22.)*1.5*vLit+c*mix(uGnd,uSky,.6)*.3*pow(1.-max(dot(NL,V),0.),2.)+c*.34;}',
  '#ifdef DN_OR','  {vec3 V=normalize(cameraPosition-vW),R=reflect(-uSunD,NL);o+=c*uSunC*pow(max(dot(R,V),0.),24.)*1.8*vLit+c*mix(uGnd,uSky,.6)*.4*pow(1.-max(dot(NL,V),0.),2.);}','#endif',
  '#ifndef DN_TOR',
  '  if(uPoly>.5&&pf9>.5){vec3 Vp=normalize(cameraPosition-vW),Hp=normalize(uSunD+Vp);o*=1.+uPl.x*.5*sin(dot(Nf,vec3(37.1,53.7,41.3))+kk*1.7);', // (facettes) une teinte par facette, un éclat quand elle renvoie le soleil vers l'œil
  '    o+=c*uSunC*pow(max(dot(NL,Hp),0.),mix(70.,36.,isG))*vLit*mix(.18,1.3,isG)*uPl.z*(1.+.8*isS);',
  '    vec3 fw=max(fwidth(vBc),vec3(1e-6));float dj=min(min(vBc.x/fw.x,vBc.y/fw.y),vBc.z/fw.z),fpx=1./max(max(fw.x,fw.y),fw.z),cj=smoothstep(.0012,.014,1.-dot(Nf,N0));', // (VITRAIL) les joints : l'arête du triangle, là où la facette s'écarte de la normale lisse
  '    float jj=(1.-smoothstep(.35,1.4,dj))*smoothstep(7.,24.,fpx)*cj*uPl.y*(.78+.22*sin(dot(vW.xz,vec2(.0049,.0031))-uTime*.7));',
  '    o=mix(o,vec3(1.,.90,.72)*(dot(o,vec3(.3,.55,.15))*1.45+.03),jj*.6);}','#endif',
  '  if(kk>21.5&&kk<22.5)o=c*(2.3+.7*sin(uTime*11.+vW.x*2.3+vW.z*3.1));', // (la flamme : lumineuse de l'intérieur, elle vacille)
  '  o+=uFlash*c*.4;gl_FragColor=vec4(o,1.);','#ifdef DN_TOR','  {float fa=abs(dot(normalize(vN),normalize(cameraPosition-vW))),sw=texture2D(uNZ,vec2(vW.x*.0042+vW.z*.0031,vW.y/55.-uTime*.22)).g;gl_FragColor.a=vK>29.5?(.46*pow(1.-clamp(vK-30.,0.,1.),2.4))*(.7+.6*sw):(.03+.20*smoothstep(0.,.75,fa))*(.30+1.3*sw);}','#endif','#include <fog_fragment>','}'].join('\n');
function dnMats(){if(DN.mm)return DN.mm;const U=DN.mat.uniforms;
  const mk=or=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_MVS,fragmentShader:DN_AFS,fog:true,vertexColors:true,side:THREE.DoubleSide});if(or)m.defines={DN_OR:''};m.dispose=function(){};return m;};
  const mkT=()=>{const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:DN_MVS,fragmentShader:DN_AFS,fog:true,vertexColors:true,side:THREE.DoubleSide,transparent:true,depthWrite:false});m.defines={DN_TOR:''};m.dispose=function(){};return m;}; // le DIABLE DE SABLE : une colonne de poussière TRANSLUCIDE (plus un éclat de pierre)
  DN.mm={t:mk(false),g:mk(true),d:mkT()};return DN.mm;}
function dnGeo(){const P=[],C=[];
  const tri=(a,b,c,col)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const v=.92+.16*Math.abs(Math.sin(P.length*.731));for(let k=0;k<3;k++)C.push(col[0]*v,col[1]*v,col[2]*v);};
  const quad=(a,b,c,d,col)=>{tri(a,b,c,col);tri(a,c,d,col);};
  // un tronc de prisme à n pans : du rayon r0 (hauteur y0, centre o0) au rayon r1 (y1, o1) — r1 = 0 : une pointe
  const prisme=(n,y0,y1,r0,r1,col,o0,o1,rot)=>{o0=o0||[0,0];o1=o1||o0;rot=rot||0;const p=(a,y,r,o)=>[o[0]+Math.cos(a)*r,y,o[1]+Math.sin(a)*r];
    for(let k=0;k<n;k++){const a1=rot+k/n*6.2832,a2=rot+(k+1)/n*6.2832;if(r1>0)quad(p(a1,y0,r0,o0),p(a1,y1,r1,o1),p(a2,y1,r1,o1),p(a2,y0,r0,o0),col);else tri(p(a1,y0,r0,o0),[o1[0],y1,o1[1]],p(a2,y0,r0,o0),col);}};
  const fin=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.setAttribute('aK',new THREE.Float32BufferAttribute(new Float32Array(P.length/3),1));return g;}; // (aK = 0 : peint)
  return {tri:tri,quad:quad,prisme:prisme,fin:fin};}
function dnGeos(){if(DN.geos)return DN.geos;const G9={};
  {const g=dnGeo(),pi4=Math.PI/4,pierre=[.30,.44,.78],sombre=[1,.80,.34]; /* (MESURÉ à la photo : en grès, l'obélisque se perdait dans le sable — LAPIS-LAZULI cerclé d'or : le teal contre l'or de la DA) */g.prisme(4,0,.04,1.42,1.36,sombre,null,null,pi4);     // L'OBÉLISQUE (r = 1, h = 1) : le socle, le fût en trois tambours
    g.prisme(4,.04,.36,1,.89,pierre,null,null,pi4);g.prisme(4,.36,.38,.89,.885,sombre,null,null,pi4);g.prisme(4,.38,.64,.885,.79,pierre,null,null,pi4);g.prisme(4,.64,.66,.79,.785,sombre,null,null,pi4);g.prisme(4,.66,.90,.785,.70,pierre,null,null,pi4);G9.ob=g.fin();}
  {const g=dnGeo();g.prisme(4,.90,1,.70,0,[1,.80,.32],null,null,Math.PI/4);G9.obOr=g.fin();}                                      // son pyramidion d'or
  {const g=dnGeo(),pi4=Math.PI/4,c1=[.98,.80,.54],c2=[.92,.72,.46];                                                                  // LA PYRAMIDE (demi-base 1, h 1) : des assises en gradins doux
    for(let k=0;k<6;k++){const y0=k*.155,y1=(k+1)*.155,r0=(1-y0)*1.4142,r1=(1-y1)*1.4142;g.prisme(4,y0,y1,r0,r1,k&1?c2:c1,null,null,pi4);}
    g.prisme(4,.93,.94,.07*1.4142,.06*1.4142,c2,null,null,pi4);G9.pyr=g.fin();}
  {const g=dnGeo();g.prisme(4,.94,1,.06*1.4142,0,[1,.82,.30],null,null,Math.PI/4);G9.pyrOr=g.fin();}                               // la coiffe d'or
  {const g=dnGeo(),n9=[.13,.09,.07],n8=[.18,.12,.09];g.prisme(5,0,.42,.06,.04,n9,[0,0],[.05,.02]);                                   // L'ACACIA MORT (h = 1) : le tronc tordu, les branches
    for(const [ax,az,l,y] of [[.9,.3,.55,.40],[-.7,.6,.5,.38],[.2,-.95,.45,.42],[-.4,-.5,.38,.55],[.6,.75,.35,.6]]){const ex=.05+ax*l,ez=.02+az*l;g.prisme(4,y,y+.28+l*.4,.03,.012,n8,[.05,.02],[ex,ez]);}
    G9.arb=g.fin();}
  {const g=dnGeo(),tr=[.52,.38,.24],tr2=[.44,.31,.19],ve=[.22,.52,.16],ve2=[.16,.42,.12];let ox=0;                                    // LE PALMIER (h = 1) : le stipe qui penche, sept palmes qui retombent
    for(let k=0;k<5;k++){const y0=k*.18,y1=(k+1)*.18,o0=ox;ox+=.025+k*.012;g.prisme(5,y0,y1,.032-k*.003,.029-k*.003,k&1?tr2:tr,[o0,0],[ox,0]);}
    for(let k=0;k<7;k++){const a=k/7*6.2832+.3,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,c0=[ox,.90,0],m=[ox+ca*.22,.98,sa*.22],e=[ox+ca*.42,.80,sa*.42],w=.07;
      g.tri(c0,[m[0]+px*w,m[1],m[2]+pz*w],m,k&1?ve:ve2);g.tri(c0,m,[m[0]-px*w,m[1],m[2]-pz*w],k&1?ve2:ve);g.tri(m,[m[0]+px*w,m[1],m[2]+pz*w],e,ve2);g.tri(m,e,[m[0]-px*w,m[1],m[2]-pz*w],ve);}
    G9.pal=g.fin();}
  {const g=dnGeo(),ro=[.80,.58,.36],ro2=[.70,.48,.28],q=(x,y,z,sx,sy,sz,col)=>g.prisme(4,y,y+sy,Math.hypot(sx,sz)*.5,Math.hypot(sx,sz)*.5,col,[x,z],[x,z],Math.PI/4); // LE CHAMEAU (h ≈ 1, long ≈ 1,1, vers +z)
    q(0,.52,0,.30,.22,.62,ro);g.prisme(4,.74,.96,.17,.0,ro2,[0,-.02],[0,.0]);                                                         // le corps, la bosse
    g.prisme(4,.62,.92,.07,.05,ro,[0,.30],[0,.44]);g.prisme(4,.92,1,.06,.05,ro2,[0,.44],[0,.56]);                                     // le cou, la tête
    for(const [x,z] of [[.10,.22],[-.10,.22],[.10,-.22],[-.10,-.22]])g.prisme(4,0,.54,.035,.045,ro2,[x,z],[x,z]);                    // les quatre jambes
    G9.cha=g.fin();}
  DN.geos=G9;return G9;}
/* (2026-10-20, LE DÉSERT AU HASARD) LES PIÈCES NEUVES — la même kit à facettes (prismes, boîtes, tubes), couleurs pleines, à l'unité : elles ne sont pas
   dessinées telles quelles, elles sont CUITES (decoCuiseur) dans une géométrie par piste, la matière des décors (M9.t) : aucun programme neuf. */
function dnGeoPlus(g){
  g.boite=(x0,x1,y0,y1,z0,z1,col)=>{const a=[x0,y0,z0],b=[x1,y0,z0],c=[x1,y0,z1],d=[x0,y0,z1],e=[x0,y1,z0],f=[x1,y1,z0],h=[x1,y1,z1],i=[x0,y1,z1];
    g.quad(a,b,f,e,col);g.quad(b,c,h,f,col);g.quad(c,d,i,h,col);g.quad(d,a,e,i,col);g.quad(e,f,h,i,col);g.quad(a,d,c,b,col);};
  g.tube=(n,A,B,r0,r1,col,rot)=>{const ax=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(ax[0],ax[1],ax[2])||1;for(let k=0;k<3;k++)ax[k]/=l;
    const up=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],u=[ax[1]*up[2]-ax[2]*up[1],ax[2]*up[0]-ax[0]*up[2],ax[0]*up[1]-ax[1]*up[0]],ul=Math.hypot(u[0],u[1],u[2]);for(let k=0;k<3;k++)u[k]/=ul;
    const v=[ax[1]*u[2]-ax[2]*u[1],ax[2]*u[0]-ax[0]*u[2],ax[0]*u[1]-ax[1]*u[0]],p=(O,r,t)=>[O[0]+(u[0]*Math.cos(t)+v[0]*Math.sin(t))*r,O[1]+(u[1]*Math.cos(t)+v[1]*Math.sin(t))*r,O[2]+(u[2]*Math.cos(t)+v[2]*Math.sin(t))*r];
    for(let k=0;k<n;k++){const t1=(rot||0)+k/n*6.2832,t2=(rot||0)+(k+1)/n*6.2832;if(r1>0)g.quad(p(A,r0,t1),p(B,r1,t1),p(B,r1,t2),p(A,r0,t2),col);else g.tri(p(A,r0,t1),B,p(A,r0,t2),col);}};
  return g;}
function dnGeos2(){if(DN.geos2)return DN.geos2;const G9={},pi4=Math.PI/4,PIE=[.90,.74,.52],PI2=[.80,.63,.42],LAP=[.30,.44,.78],OR=[1,.80,.32];
  {const g=dnGeoPlus(dnGeo()),ca=[.97,.92,.82];g.prisme(4,0,.30,1.4142,.70*1.4142,ca,null,null,pi4);g.prisme(4,.30,.31,.70*1.4142,.69*1.4142,[.88,.82,.70],null,null,pi4);  // LA PYRAMIDE LISSE (demi-base 1, h 1) : le parement de calcaire
    g.prisme(4,.31,.94,.69*1.4142,.06*1.4142,ca,null,null,pi4);G9.pyrL=g.fin();}
  {const g=dnGeoPlus(dnGeo()),N=6;for(let k=0;k<N;k++){const y0=k/N,y1=(k+1)/N-.004,r0=(1-k/(N+.6))*1.4142,r1=(1-(k+1)/(N+.6))*1.4142;          // LA PYRAMIDE À DEGRÉS (Djoser) : des gradins droits
      g.prisme(4,y0,y1,r0,r0*.985,k&1?PI2:PIE,null,null,pi4);g.prisme(4,y1,y1+.004,r0*.985,k<N-1?r1:0,[.95,.82,.60],null,null,pi4);}G9.pyrE=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.boite(-.2,.2,0,.03,-.5,.52,PI2);g.boite(-.14,.14,.03,.2,-.46,.16,PIE);g.prisme(6,.03,.19,.15,.13,PIE,[0,-.40],[0,-.42]);       // LE SPHINX (long 1, vers +z) : le socle, le corps, la croupe
    g.boite(-.13,-.05,.03,.08,.12,.48,PIE);g.boite(.05,.13,.03,.08,.12,.48,PIE);g.boite(-.12,.12,.03,.25,.10,.27,PI2);                                         // les pattes, le poitrail
    g.prisme(4,.20,.33,.17,.11,LAP,[0,.22],[0,.23],pi4);g.boite(-.065,.065,.21,.32,.24,.33,PIE);g.prisme(4,.33,.345,.11,.05,OR,[0,.23],[0,.23],pi4);          // le némès (lapis), la face, la coiffe
    g.boite(-.1,.1,.18,.21,.27,.31,OR);G9.sphinx=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.boite(-.27,.27,0,.56,-.30,.06,PI2);g.boite(-.27,.27,.56,.86,-.30,-.20,PI2);                                                   // LE COLOSSE ASSIS (h 1, vers +z) : le trône
    for(const sx of [-1,1]){g.boite(sx<0?-.2:.03,sx<0?-.03:.2,.36,.5,-.04,.30,PIE);g.boite(sx<0?-.19:.04,sx<0?-.04:.19,0,.46,.21,.31,PIE);g.boite(sx<0?-.21:.02,sx<0?-.02:.21,0,.05,.26,.42,PIE); // cuisses, jambes, pieds
      g.boite(sx<0?-.28:.20,sx<0?-.20:.28,.48,.76,-.14,-.02,PIE);g.boite(sx<0?-.26:.18,sx<0?-.18:.26,.46,.52,-.02,.28,PIE);}                                     // les bras sur les cuisses
    g.prisme(4,.5,.80,.21,.16,PIE,[0,-.08],[0,-.08],pi4);g.boite(-.07,.07,.79,.93,-.15,-.01,PIE);g.prisme(4,.84,1,.12,.05,LAP,[0,-.09],[0,-.09],pi4);g.boite(-.03,.03,.72,.80,.0,.03,OR);G9.colosse=g.fin();}
  {const g=dnGeoPlus(dnGeo()),bl=[.95,.90,.80];g.boite(-.13,.13,0,.05,-.13,.13,bl);g.prisme(8,.05,.9,.1,.088,bl);g.prisme(8,.86,.9,.088,.12,bl);g.boite(-.14,.14,.9,1,-.14,.14,bl);G9.colonne=g.fin();} // LA COLONNE (h 1)
  {const g=dnGeoPlus(dnGeo());g.boite(-.5,.5,0,1,-.5,.5,[1,1,1]);G9.boite=g.fin();}                                                                          // LA BOÎTE (teintée à la cuisson : dalles, poutres, maisons de terre)
  {const g=dnGeoPlus(dnGeo()),P2=[.86,.70,.48],P3=[.78,.60,.40];                                                                                            // LA PORTE DE PIERRE (le pylône, h 1, large 2,2, vers +z)
    const pyl=(x0,x1)=>{const a=[x0,0,-.13],b=[x1,0,-.13],c=[x1,0,.13],d=[x0,0,.13],m=(x0+x1)/2,w=(x1-x0)/2*.82,e=[m-w,1,-.09],f=[m+w,1,-.09],h=[m+w,1,.09],i=[m-w,1,.09];
      g.quad(a,b,f,e,P2);g.quad(b,c,h,f,P3);g.quad(c,d,i,h,P2);g.quad(d,a,e,i,P3);g.quad(e,f,h,i,P2);g.boite(m-w-.02,m+w+.02,1,1.05,-.12,.12,P3);g.boite(m-w,m+w,.84,.88,.09,.1,LAP);};
    pyl(-1.1,-.18);pyl(.18,1.1);g.boite(-.2,-.13,0,.62,-.09,.09,P2);g.boite(.13,.2,0,.62,-.09,.09,P2);g.boite(-.22,.22,.62,.72,-.11,.11,P3);g.boite(-.18,.18,.64,.7,.11,.12,OR);G9.porte=g.fin();}
  {const g=dnGeoPlus(dnGeo()),c1=[.24,.17,.13],c2=[.58,.34,.20],A=[-.5,.06,-.5],B=[-.5,.06,.5],C=[0,.5,.5],E=[0,.5,-.5],A2=[.5,.06,-.5],B2=[.5,.06,.5];      // LA TENTE BÉDOUINE (1 × 1, h ,5)
    g.quad(A,B,C,E,c1);g.quad(A2,E,C,B2,c2);g.tri(A,E,A2,c1);g.tri(B,B2,C,c2);g.boite(-.5,.5,0,.06,-.5,.5,[.40,.28,.20]);G9.tente=g.fin();}
  {const g=dnGeoPlus(dnGeo());g.prisme(5,0,.7,.32,0,[1,.52,.10]);g.prisme(4,0,.45,.2,0,[1,.86,.30],null,null,.5);for(let k=0;k<7;k++){const a=k/7*6.28;g.boite(Math.cos(a)*.45-.06,Math.cos(a)*.45+.06,0,.1,Math.sin(a)*.45-.06,Math.sin(a)*.45+.06,[.42,.38,.34]);}G9.feu=g.fin();} // LE FEU de camp et ses pierres
  {const g=dnGeoPlus(dnGeo()),os=[.96,.93,.84];g.tube(4,[0,.1,-.5],[0,.1,.42],.018,.012,os);g.boite(-.05,.05,.02,.1,.42,.56,os);g.boite(-.035,.035,0,.03,.44,.6,os); // LE SQUELETTE GÉANT (long 1) : l'échine, le crâne, la mâchoire
    for(let k=0;k<8;k++){const z=-.28+k*.075,s9=1-Math.abs(k-3)*.12;for(const sx of [-1,1]){const P9=[[0,.1],[.10*s9,.12*s9+.02],[.17*s9,.05],[.16*s9,-.01]];for(let j=0;j<3;j++)g.tube(4,[sx*P9[j][0],P9[j][1],z],[sx*P9[j+1][0],P9[j+1][1],z+.01],.008,.007,os);}}
    G9.os=g.fin();}
  {const g=dnGeoPlus(dnGeo()),al=[.80,.82,.84],al2=[.66,.68,.70],ro=[.62,.34,.20],rg=[.74,.16,.14];g.tube(7,[0,0,-.42],[0,0,.40],.07,.065,al);g.tube(7,[0,0,.40],[0,-.01,.5],.065,.02,al2); // L'ÉPAVE D'AVION (long 1, vers +z)
    g.tube(7,[0,0,-.42],[0,.03,-.56],.07,.015,al2);g.boite(-.03,.03,0,.17,-.56,-.46,rg);g.boite(-.2,.2,0,.01,-.56,-.5,al2);g.boite(-.52,.30,-.015,.012,-.04,.12,al);g.boite(.3,.36,-.02,.01,-.02,.10,ro);
    g.boite(-.072,.072,-.02,.02,.1,.14,rg);G9.avion=g.fin();}
  {const g=dnGeoPlus(dnGeo()),bo=[.48,.32,.18],bo2=[.40,.26,.14],pt=[.62,.46,.28],Z9=[-.5,-.3,0,.3,.5],W9=[.05,.13,.16,.12,0],Y9=[.20,.15,.15,.17,.26];   // LE BOUTRE ÉCHOUÉ (long 1, vers +z)
    for(let k=0;k<4;k++)for(const sx of [-1,1]){const a=[sx*W9[k],Y9[k],Z9[k]],b=[sx*W9[k+1],Y9[k+1],Z9[k+1]],c=[0,0,Z9[k+1]*.9],d=[0,0,Z9[k]*.9];g.quad(a,b,c,d,sx<0?bo:bo2);}
    for(let k=0;k<4;k++)g.quad([-W9[k],Y9[k],Z9[k]],[W9[k],Y9[k],Z9[k]],[W9[k+1],Y9[k+1],Z9[k+1]],[-W9[k+1],Y9[k+1],Z9[k+1]],pt);
    g.tube(5,[0,.15,.06],[.02,.72,.04],.012,.008,bo2);g.tube(4,[0,.70,-.26],[0,.44,.42],.006,.005,bo2);g.tri([0,.69,-.24],[0,.46,.38],[.01,.2,.1],[.90,.84,.70]);G9.bateau=g.fin();}
  {const g=dnGeoPlus(dnGeo()),O=[[0,0,0],[.02,.18,.01],[-.03,.36,.03],[.04,.55,-.02],[-.02,.75,.04],[.05,1,0]],R9=[.03,.06,.10,.15,.22,.32];               // LE DIABLE DE SABLE (h 1) : une colonne qui se tord et s'évase
    for(let k=0;k<5;k++)g.tube(7,O[k],O[k+1],R9[k],R9[k+1],[.88+k*.012,.68+k*.03,.46+k*.04],k*.4);G9.tor=g.fin();}
  {const g=dnGeoPlus(dnGeo()),N=48,M=5,y9=j=>1+.12*Math.sin(j*.7)+.06*Math.sin(j*1.9);                                                // LE MUR DE TEMPÊTE (un arc de 1,8 rad, rayon 1, h ~1) : un RIDEAU de poussière — le pied dense, le haut qui s'efface (aK 30 + la hauteur, voir DN_AFS)
    for(let j=0;j<N;j++){const t1=-.9+1.8*j/N,t2=-.9+1.8*(j+1)/N,p=(t,y)=>[Math.sin(t),y,Math.cos(t)];
      for(let m=0;m<M;m++){const a9=m/M,b9=(m+1)/M,c9=[.62+.22*a9,.40+.20*a9,.24+.18*a9];g.quad(p(t1,y9(j)*a9),p(t2,y9(j+1)*a9),p(t2,y9(j+1)*b9),p(t1,y9(j)*b9),c9);}}
    const gm=g.fin(),pp=gm.attributes.position,Kk=new Float32Array(pp.count);for(let i=0;i<pp.count;i++)Kk[i]=30+Math.max(0,Math.min(1,pp.getY(i)/1.3));gm.setAttribute('aK',new THREE.BufferAttribute(Kk,1));G9.mur=gm;}
  {const g=dnGeoPlus(dnGeo());g.prisme(5,0,1,.55,0,[.66,.60,.30]);g.prisme(4,0,.7,.4,0,[.56,.52,.24],[.18,0],[.3,.05],.3);G9.touffe=g.fin();}                  // LA TOUFFE D'HERBE SÈCHE (h 1)
  {const g=dnGeoPlus(dnGeo()),v=[.34,.54,.24],v2=[.28,.46,.20];g.tube(6,[0,0,0],[0,.95,0],.08,.07,v);g.prisme(6,.95,1.02,.07,0,v2);                          // LE CACTUS (h 1) : le fût, deux bras
    for(const [sx,y0] of [[1,.42],[-1,.55]]){g.tube(5,[0,y0,0],[sx*.2,y0+.02,0],.05,.05,v2);g.tube(5,[sx*.2,y0,0],[sx*.2,y0+.3,0],.05,.045,v);g.prisme(5,y0+.3,y0+.34,.045,0,v2,[sx*.2,0]);}G9.cactus=g.fin();}
  DN.geos2=G9;return G9;}
function dnMonuments(seed){
  if(DN.grp){for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}
  DN.tor=[];DN.torIm=null;DN.decoN=null;
  if(DN.deco){try{dnMonumentsTires(seed);return;}catch(e){console.warn('dunes : décor tiré',e);for(const o of DN.grp.children.slice()){DN.grp.remove(o);if(o.userData.jeter&&o.geometry)o.geometry.dispose();}}}
  const M9=dnMats(),G9=dnGeos(),S=DN.S,K=Math.sqrt(lvPiste()),rg=mulberry32((seed^0x7A55)>>>0),mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0),v9=new THREE.Vector3(),s9=new THREE.Vector3();DN.grp.visible=true;
  const inst=(geo,mat,L9,nom)=>{if(!L9.length)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  // LES OBÉLISQUES et leurs pyramidions
  {const L9=DN.ob.map(function(b){return [b.x,b.y,b.z,b.r,b.a,b.h,b.r];});inst(G9.ob,M9.t,L9,'obélisques');inst(G9.obOr,M9.g,L9,'pyramidions');}
  // LA GRANDE PYRAMIDE
  if(DN.pyr){const P=DN.pyr,L9=[[P.x,P.y,P.z,P.hw,P.a,P.h,P.hw]];inst(G9.pyr,M9.t,L9,'pyramide');inst(G9.pyrOr,M9.g,L9,'coiffe');}
  // LES ACACIAS MORTS de la vallée (sur l'argile, sous la route)
  {const L9=[],N9=PAL.b('dnArbres',140),a0=DN.sQ.vlei0,a1=DN.sQ.vlei1,o9={};
   if(S&&a0!=null&&a1!=null)for(let k=0;k<N9*8&&L9.length<N9;k++){const s0=a0-200+rg()*(a1-a0+400),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+14+rg()*rg()*380*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=(6+rg()*7)*(1+.3*rg());if(o9.eau)continue;
     if(dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.4,z,ht,rg()*6.28]);}
   inst(G9.arb,M9.t,L9,'acacias');DN.nArb=L9.length;}
  // LES PALMIERS de l'oasis (sur la rive)
  {const L9=[],N9=PAL.b('dnPalmes',48),A9=DN.oa,o9={};
   if(A9)for(let k=0;k<N9*10&&L9.length<N9;k++){const an=rg()*6.2832,rr=(1.03+rg()*.42)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),ht=(13+rg()*10)*(1+.2*rg());
     if(o9.eau||dnPresRoute(x,z,ROAD_HALF+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}
   inst(G9.pal,M9.t,L9,'palmiers');DN.nPal=L9.length;}
  // LES CARAVANES : sept chameaux en file sur une crête, à 70-140 m de la route (la crête du Grand Erg, la vallée morte, la deuxième crête)
  DN.car=[];DN.carIm=null;
  {const L9=[];for(const nm of ['erg0','vlei0','cr2a']){const s0=DN.sQ[nm];if(s0==null||!S)continue;const i=Math.max(0,Math.min(S.n-1,Math.round((s0+160)/S.ds))),sg=rg()<.5?-1:1,lat=ROAD_HALF+(70+rg()*70)*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,dir=Math.atan2(S.tx[i],S.tz[i])+(rg()<.5?0:Math.PI)+(rg()-.5)*.6;
     DN.car.push({x:x,z:z,a:dir,t:rg()*60,n:7});for(let k=0;k<7;k++)L9.push([x,0,z,3.4,dir]);}
   if(L9.length){DN.carIm=inst(G9.cha,M9.t,L9,'caravanes');if(DN.carIm){DN.carIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);DN.carT=0;dnCaravane(0,true);}}}
  try{dnEmbellir();}catch(e){console.warn('dunes : plan moyen',e);} /* (2026-10-21) les buttes, les arbres morts, les touffes : voir dunes-embellie.js */
  DN.grp.updateMatrixWorld(true);}
/* (2026-10-20, LE DÉSERT AU HASARD) LE DÉCOR TIRÉ (DN.deco) : les obélisques (les brisés sans pyramidion, leur tronçon couché à côté), les pyramides de chaque
   style, les grands monuments (dnPrevoirDeco les a posés : ils ombrent et tuent), puis — à la pose, ici, sur le sable relu — le village, les campements,
   les caravanes, la flore, les diables de sable, le mur de tempête, les squelettes, les épaves. Les pièces neuves sont CUITES dans UNE géométrie (une
   instance, M9.t) : un seul appel de dessin de plus, aucun programme neuf. Son hasard : `D.sd` (rien de `rnd`, rien du tracé). */
function dnMonumentsTires(seed){
  const D=DN.deco,M9=dnMats(),G9=dnGeos(),G2=dnGeos2(),S=DN.S,K=Math.sqrt(lvPiste()),RH=ROAD_HALF,t0=performance.now(),rg=mulberry32((D.sd^0x7A55D)>>>0),o9={},N={};
  const mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(0,0,0,'YXZ'),v9=new THREE.Vector3(),s9=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0),CU=dnCuiseur();DN.grp.visible=true;
  const cuis=(geo,x,y,z,sx,sy,sz,ry,tx,tz,te)=>{e9.set(tx||0,ry||0,tz||0);q9.setFromEuler(e9);mt.compose(v9.set(x,y,z),q9,s9.set(sx,sy,sz));CU.ajoute(geo,mt,te);};
  const inst=(geo,mat,L9,nom)=>{if(!L9.length)return null;const im=new THREE.InstancedMesh(geo,mat,L9.length);
    L9.forEach(function(a,k){q9.setFromAxisAngle(ax,a[4]);mt.compose(v9.set(a[0],a[1],a[2]),q9,s9.set(a[3],a[5]!=null?a[5]:a[3],a[6]!=null?a[6]:a[3]));im.setMatrixAt(k,mt);});
    im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.name='dunes '+nom;DN.grp.add(im);return im;};
  const libre=(x,z,r)=>{for(const p of DN.pyrs)if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+r+20)return false;for(const m of DN.mo)if(Math.hypot(m.x-x,m.z-z)<m.r+r+15)return false;
    for(const b of DN.ob)if(Math.hypot(b.x-x,b.z-z)<b.r*2+r+6)return false;return true;};
  const site=(lat0,lat1,clear,top,r,f0,f1)=>{for(let e=0;e<24;e++){const s0=L*(f0+(f1-f0)*rg()),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds)));if(S.gd[i]>.01)continue;
      const sg=rg()<.5?-1:1,lat=RH+(lat0+rg()*(lat1-lat0))*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9);
      if(o9.eau||!libre(x,z,r)||dnPresRoute(x,z,RH+clear,h+top))continue;return {x:x,z:z,h:h,i:i,t:Math.atan2(S.tx[i],S.tz[i])};}return null;};
  const tch=(c,k)=>[c[0]*(1-k+2*k*rg()),c[1]*(1-k+2*k*rg()),c[2]*(1-k+2*k*rg())];
  // LES OBÉLISQUES (le modèle neuf : fût de lapis gravé, bandeaux et pyramidion d'or) : le brisé n'a plus de pointe (un fût en dents de scie), son tronçon tombé gît à côté
  {const MO=dnMod('obelisque'),MB=dnMod('obeliskTronc');
   for(const b of DN.ob)cuis(b.br?MB:MO,b.x,b.y,b.z,b.r/4,b.h/(b.br?55:64),b.r/4,b.a);
   for(const b of DN.ob){if(!b.br)continue;const an=rg()*6.28,fl=(30+rg()*26)*K*.7,x0=b.x+Math.sin(an)*b.r*1.8,z0=b.z+Math.cos(an)*b.r*1.8,x1=x0+Math.sin(an)*fl,z1=z0+Math.cos(an)*fl;
      const y=Math.min(dnHauteur(x0,z0),dnHauteur((x0+x1)/2,(z0+z1)/2),dnHauteur(x1,z1))+b.r*.25;if(dnPresRoute(x1,z1,RH+b.r+6,y+b.r)||dnPresRoute((x0+x1)/2,(z0+z1)/2,RH+b.r+6,y+b.r))continue;
      cuis(MO,x0,y,z0,b.r*.85/4,fl/64,b.r*.85/4,an,Math.PI/2,0);N.troncons=(N.troncons|0)+1;}}
  // LES PYRAMIDES : à gradins, lisses de calcaire, à degrés — pierre en assises, coiffe d'or, une porte sombre au pied
  for(const P of DN.pyrs)cuis(dnMod(P.st==='giza'?'pyrGiza':P.st==='cap'?'pyrCap':P.st==='rouge'?'pyrRouge':P.st==='lisse'?'pyrLisse':P.st==='etagee'?'pyrDegres':'pyrGradins'),P.x,P.y,P.z,P.hw,P.h,P.hw,P.a);
  // LES PYRAMIDES DES REINES (2026-10-23, Léo : « des séries de pyramides, comme la photo ») : trois petites pyramides à gradins alignées au pied de chacune des deux premières grandes
  if(DN_ACTES.on)for(let k=0;k<Math.min(2,DN.pyrs.length);k++){const P=DN.pyrs[k],ca=Math.cos(P.a),sa=Math.sin(P.a);for(let j=0;j<3;j++){const hq=P.hw*(.15-.025*j),lx=P.hw*(1.32+.12*j),lz=(j-1)*P.hw*.62,x=P.x+ca*lx+sa*lz,z=P.z-sa*lx+ca*lz,h0=dnHauteur(x,z,o9);
    if(o9.eau||dnPresRoute(x,z,RH+hq*1.4+10,h0+hq*1.2))continue;cuis(dnMod('pyrGradins'),x,h0-2,z,hq,hq*1.15,hq,P.a+(j-1)*.05);N.reines=(N.reines|0)+1;}}
  // LES GRANDS MONUMENTS : le sphinx, les colosses et la porte regardent la route ; le temple s'aligne sur elle (colonnes, architraves, tambours tombés)
  for(const m of DN.mo){
    if(m.k==='sphinx'){const l=m.r/.55;cuis(dnMod(dnLegNom(m)),m.x,m.y,m.z,l,l,l,m.a);}
    else if(m.k==='colosse')cuis(dnMod(dnLegNom(m)),m.x,m.y,m.z,m.h,m.h,m.h,m.a);
    else if(m.k==='porte'){const sc=m.h/30;cuis(dnMod('porte'),m.x,m.y,m.z,sc,sc,sc,m.a);}
    else if(m.k==='temple'){const l=m.r/.62,H=m.h,ct=Math.cos(m.t),st=Math.sin(m.t),W=(lx,lz)=>[m.x+lx*ct+lz*st,m.z-lx*st+lz*ct],nc=5+((rg()*3)|0),y0=m.y+3.5;
      {const p=W(0,0);cuis(dnMod('bloc'),p[0],m.y,p[1],l*.5,3.5,l*1.0,m.t,0,0,[.90,.84,.72]);}
      for(const sx of [-1,1]){let prec=null;for(let k=0;k<nc;k++){const lz=-l*.42+k*l*.84/(nc-1),p=W(sx*l*.19,lz),br=rg()<.35,hy=br?H*(.25+rg()*.45):H;
        cuis(dnMod('colonne'),p[0],y0,p[1],H/22,hy/22,H/22,m.t);
        if(br&&rg()<.6){const an=rg()*6.28,d=H*.3+rg()*H*.4,q=[p[0]+Math.sin(an)*d,p[1]+Math.cos(an)*d];cuis(dnMod('colonne'),q[0],dnHauteur(q[0],q[1])+H*.05,q[1],H*.9/22,H*(.2+rg()*.25)/22,H*.9/22,an,Math.PI/2,0);}
        if(!br&&prec!=null){const zm=(prec+lz)/2,c=W(sx*l*.19,zm);cuis(dnMod('bloc'),c[0],y0+H,c[1],H*.3,H*.11,lz-prec+H*.28,m.t,0,0,[.93,.88,.78]);}prec=br?null:lz;}}}}
  // LE VILLAGE DE TERRE en ruine : des maisons cubes, des murs bas
  if(D.village){const c=site(70,210,50,10,60,.08,.9);if(c){const n=8+((rg()*8)|0);N.maisons=0;
    for(let k=0;k<n+4;k++){const an=rg()*6.28,d=rg()*48*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,h0=dnHauteur(x,z,o9),mur=k>=n,w=mur?(12+rg()*18):(5+rg()*5),dp=mur?.9:(5+rg()*5),hh=mur?(1.4+rg()*1.6):(rg()<.35?1.2+rg()*1.5:3+rg()*3);
      if(o9.eau||dnPresRoute(x,z,RH+10,h0+hh+2))continue;cuis(dnMod('bloc'),x,h0-.8,z,w,hh+.8,dp,c.t+(rg()<.6?0:Math.PI/2)+(rg()-.5)*.2,0,0,tch([.82,.60,.42],.08));N.maisons++;}}}
  // LES CAMPEMENTS : des tentes en rond, le feu au milieu, des chameaux couchés
  N.camps=0;for(let k=0;k<D.camps;k++){const c=site(40,170,30,6,30,.05,.92);if(!c)continue;N.camps++;const nt=3+((rg()*4)|0);
    for(let j=0;j<nt;j++){const an=j/nt*6.28+rg()*.5,d=(10+rg()*10)*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,w=(8+rg()*4)*K;cuis(G2.tente,x,dnHauteur(x,z)-.3,z,w,w*(.8+rg()*.4),w*(.7+rg()*.3),an+Math.PI/2,0,0,tch([1,1,1],.1));}
    cuis(G2.feu,c.x,c.h-.1,c.z,2.4*K,2.6*K,2.4*K,rg()*6);
    for(let j=0;j<2+((rg()*4)|0);j++){const an=rg()*6.28,d=(22+rg()*14)*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d;cuis(dnMod('chameau'),x,dnHauteur(x,z)-1.75,z,3.4,3.4,3.4,rg()*6.28);}}
  // LES CARAVANES : 1 à 4, de 4 à 11 bêtes, sur une crête tirée, dans un sens tiré
  DN.car=[];DN.carIm=null;
  {const L9=[];for(const C9 of D.caravanes){const c=site(46,120,40,8,12,.04,.9);if(!c)continue;const dir=c.t+(rg()<.5?0:Math.PI)+(rg()-.5)*.8;
     DN.car.push({x:c.x,z:c.z,a:dir,t:rg()*60,n:C9.n,k:C9.k,v:C9.v});for(let k=0;k<C9.n;k++)L9.push([c.x,0,c.z,DN_CAM*C9.k,dir]);}
   if(L9.length){DN.carIm=inst(dnMod('chameau'),M9.t,L9,'caravanes');if(DN.carIm){DN.carIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);DN.carT=0;dnCaravane(0,true);}}}
  // LA FLORE : les acacias morts (la vallée, et épars), les palmiers (l'oasis, les palmeraies), les touffes, les cactus
  {const L9=[],N9=Math.round(PAL.b('dnArbres',140)*D.flore.acacias),a0=DN.sQ.vlei0,a1=DN.sQ.vlei1;
   if(a0!=null&&a1!=null)for(let k=0;k<N9*8&&L9.length<N9;k++){const s0=a0-200+rg()*(a1-a0+400),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=rg()<.5?-1:1,lat=RH+14+rg()*rg()*380*K;
     const x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=(6+rg()*7)*(1+.3*rg());if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.4,z,ht,rg()*6.28]);}
   for(let k=0;k<D.flore.epars*4&&L9.length<N9+D.flore.epars;k++){const c=site(14,200,10,14,4,.03,.97);if(c)L9.push([c.x,c.h-.4,c.z,(6+rg()*8)*(1+.3*rg()),rg()*6.28]);}
   inst(G9.arb,M9.t,L9,'acacias');DN.nArb=L9.length;}
  {const L9=[],A9=DN.oa;
   if(A9){const N9=Math.round(PAL.b('dnPalmes',48)*Math.min(1.5,D.oasis.k));for(let k=0;k<N9*10&&L9.length<N9;k++){const an=rg()*6.2832,rr=(1.03+rg()*.42)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),ht=(13+rg()*10)*(1+.2*rg());
     if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}}
   for(let g9=0;g9<D.flore.palmeraies;g9++){const c=site(50,220,30,25,50,.05,.9);if(!c)continue;const n=10+((rg()*16)|0);
     for(let k=0;k<n*3&&n>0;k++){const an=rg()*6.28,d=rg()*45*K,x=c.x+Math.sin(an)*d,z=c.z+Math.cos(an)*d,h=dnHauteur(x,z,o9),ht=(11+rg()*10)*(1+.2*rg());if(o9.eau||dnPresRoute(x,z,RH+10,h+ht+3))continue;L9.push([x,h-.5,z,ht,rg()*6.28]);}}
   inst(dnMod('palmier'),M9.t,L9,'palmiers');DN.nPal=L9.length;}
  // L'OASIS VIVANTE (2026-10-22) : des touffes de PAPYRUS au bord de l'eau, des LOTUS BLEUS qui flottent, des FELOUQUES sur le lac
  {const A9=DN.oa;if(A9){const Lp=[],Ll=[],nP=Math.round(70*Math.min(1.5,D.oasis.k)),nL=Math.round(26*Math.min(1.5,D.oasis.k));
    for(let k=0;k<nP*14&&Lp.length<nP;k++){const an=rg()*6.2832,rr=(.94+rg()*.16)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr,h=dnHauteur(x,z,o9),d=h-A9.y,ht=1.8+rg()*1.9;
      if(d<-.6||d>2.2||dnPresRoute(x,z,RH+12,h+ht+2))continue;Lp.push([x,Math.max(h,A9.y)-.1,z,ht,rg()*6.28]);}
    for(let k=0;k<nL*14&&Ll.length<nL;k++){const an=rg()*6.2832,rr=Math.sqrt(rg())*.9*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr;dnHauteur(x,z,o9);if(!o9.eau)continue;const sc=1.4+rg()*1.2;Ll.push([x,A9.y+.05,z,sc,rg()*6.28]);}
    inst(dnMod('papyrus'),M9.t,Lp,'papyrus');inst(dnMod('lotus'),M9.t,Ll,'lotus');N.papyrus=Lp.length;N.lotus=Ll.length;
    const nb=1+((rg()*2.4)|0);N.bateaux=0;for(let k=0;k<nb*8&&N.bateaux<nb;k++){const an=rg()*6.2832,rr=(.25+rg()*.5)*A9.r,x=A9.x+Math.cos(an)*rr,z=A9.z+Math.sin(an)*rr;dnHauteur(x,z,o9);if(!o9.eau)continue;
      const l=(9+rg()*5)*Math.min(1.3,K);cuis(dnMod('felouque'),x,A9.y-.35*l*.2,z,l,l,l,rg()*6.28);N.bateaux++;}}}
  N.touffes=0;for(let k=0;k<D.flore.touffes*2&&N.touffes<D.flore.touffes;k++){const i=Math.floor(rg()*(S.n-1)),sg=rg()<.5?-1:1,lat=RH+6+rg()*rg()*150*K,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9),ht=1.3+rg()*1.6;
    if(o9.eau||S.gd[i]>.01||dnPresRoute(x,z,RH+4,h+ht+1))continue;cuis(G2.touffe,x,h-.2,z,ht*1.4,ht,ht*1.4,rg()*6.28,0,0,tch([1,1,1],.12));N.touffes++;}
  N.cactus=0;for(let k=0;k<D.flore.cactus;k++){const c=site(10,220,8,14,4,.03,.97);if(!c)continue;const ht=(6+rg()*7)*K;cuis(G2.cactus,c.x,c.h-.3,c.z,ht,ht,ht,rg()*6.28);N.cactus++;}
  // LES DIABLES DE SABLE (ils tournent, dnTornades), LE MUR DE TEMPÊTE au loin, LES SQUELETTES, LES ÉPAVES
  DN.tor=[];DN.torIm=null;
  {const L9=[];for(let k=0;k<D.tornades;k++){const c=site(180,620,160,400,40,.05,.95);if(!c)continue;const h=(120+rg()*170)*K;DN.tor.push({x:c.x,y:c.h-4,z:c.z,h:h,a:rg()*6.28,w:1.2+rg()*1.6,p:rg()*6.28});L9.push([c.x,c.h-4,c.z,h*.34,0,h,h*.34]);}
   if(L9.length){DN.torIm=inst(G2.tor,M9.d,L9,'diables');if(DN.torIm)DN.torIm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);}}
  if(D.tempete){const b=S.bb,cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,R9=Math.max(5200,Math.hypot(b[1]-b[0],b[3]-b[2])*.5+3600);let ym=1e9;for(let i=0;i<S.n;i+=8)ym=Math.min(ym,S.y[i]);inst(G2.mur,M9.d,[[cx,ym-420,cz,R9,D.tempete.a,1500,R9]],'mur');N.tempete=Math.round(R9);}
  N.os=0;for(let k=0;k<D.os;k++){const c=site(15,110,10,3,15,.05,.95);if(!c)continue;const l=(16+rg()*24)*K;cuis(G2.os,c.x,c.h-.6,c.z,l,l,l,rg()*6.28,(rg()-.5)*.1);N.os++;}
  if(D.avion){const c=site(40,160,25,12,25,.05,.9);if(c){const l=(30+rg()*10)*K;cuis(G2.avion,c.x,c.h-.03*l,c.z,l,l,l,rg()*6.28,.16+rg()*.1,.25);N.avion=1;}}
  if(D.bateau){const c=site(40,170,25,12,25,.05,.9);if(c){const l=(24+rg()*12)*K;cuis(G2.bateau,c.x,c.h-.06*l,c.z,l,l,l,rg()*6.28,-.06,.28);N.bateau=1;}}
  try{dnScenes({rg:rg,cuis:cuis,K:K,RH:RH,N:N});}catch(e){console.warn('dunes : scènes',e);} // (2026-10-22) les scènes le long de la route (dunes-4.js)
  if(CU.n()){const g=CU.fin(),im=new THREE.InstancedMesh(g,M9.t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;
    im.userData.jeter=1;im.name='dunes décor tiré';DN.grp.add(im);N.sommets=CU.n();}
  DN.grp.updateMatrixWorld(true);N.ms=Math.round(performance.now()-t0);DN.decoN=N;}
const DN_CAM=5.2; // la haute des chameaux d'une caravane (m)
const DN_VAU={n:5,im:null,L:[],m4:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),sc:new THREE.Vector3()};
/* LES VAUTOURS (2026-10-22, la recette du canyon) : de 3 à 7 oiseaux qui planent, par grands cercles, devant la caisse (350-1250 m), à 25-120 m au-dessus de la dalle ; l'un qui retombe derrière est reposé devant */
function dnVautours(dt){return; /* (2026-10-23, Sacha : « enlève les vautours ») */ const V=DN_VAU,on=DN.on&&started&&!gameOver&&mode!=='boom'&&!!DN.S;
  if(!V.im){if(!on)return;V.im=new THREE.InstancedMesh(dnMod('vautour'),dnMats().t,9);V.im.frustumCulled=false;V.im.matrixAutoUpdate=false;V.im.count=0;scene.add(V.im);}
  V.im.visible=!!on;if(!on){V.L.length=0;return;}
  const S=DN.S,cp=carGroup.position,i0=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));V.n=3+(((DN.deco?DN.deco.sd:0)>>>5)%5);
  for(let k=0;k<V.n;k++){let b=V.L[k];
    if(!b||cp.distanceTo(V.v.set(b.cx,b.cy,b.cz))>1900){const i=Math.min(S.n-1,i0+Math.round((350+Math.random()*900)/S.ds)),lat=(Math.random()-.5)*480;
      b=V.L[k]={cx:S.x[i]-S.tz[i]*lat,cz:S.z[i]+S.tx[i]*lat,cy:S.y[i]+25+Math.random()*95,r:45+Math.random()*85,a:Math.random()*6.28,w:(.14+Math.random()*.12)*(Math.random()<.5?-1:1),k:5.5+Math.random()*3};}
    if(!paused)b.a+=b.w*dt;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r,y=b.cy+Math.sin(b.a*2.3)*5;
    V.e.set(Math.sin(b.a*1.7)*.05,b.w>0?-b.a:Math.PI-b.a,b.w>0?.32:-.32);V.q.setFromEuler(V.e);V.m4.compose(V.v.set(x,y,z),V.q,V.sc.set(b.k,b.k,b.k));V.im.setMatrixAt(k,V.m4);}
  V.im.count=V.n;V.im.instanceMatrix.needsUpdate=true;}
/* LES DIABLES DE SABLE tournent sur eux-mêmes et errent un peu (rien d'alloué ; seulement si l'on est assez près) */
function dnTornades(dt){const im=DN.torIm;if(!im||!DN.on||paused||!DN.tor.length)return;const p=carGroup.position;let pres=false;for(const c of DN.tor)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<4000)pres=true;if(!pres)return;
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.tor){c.a=(c.a+dt*c.w)%6.2832;c.p=(c.p+dt*.05)%6.2832;e9.set(Math.sin(c.p*3)*.04,c.a,Math.cos(c.p*2)*.04);q9.setFromEuler(e9);
    mt.compose(v9.set(c.x+Math.sin(c.p)*30,c.y,c.z+Math.cos(c.p)*30),q9,s9.set(c.h*.34,c.h,c.h*.34));im.setMatrixAt(k++,mt);}
  im.instanceMatrix.needsUpdate=true;}
function dnPresRoute(x,z,lat,y){const S=DN.S;if(!S)return false;if(dnMesa(x,z,1e9)>1.5)return true; /* (une butte : rien ne s'y pose) */for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lat*lat&&y>S.y[i]-THICK-60)return true;}return false;} // un décor trop près d'une dalle (et pas loin dessous)
/* LES CARAVANES marchent (1,3 m/s, un pas qui balance) : la hauteur du sable relue chaque image pour les quatorze bêtes — seulement si on est assez près */
const DN_CT={m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),v:new THREE.Vector3(),s:new THREE.Vector3(3.4,3.4,3.4)}; // (rien d'alloué dans la boucle)
function dnCaravane(dt,force){const im=DN.carIm;if(!im||!DN.on||!DN.Z)return;
  if(!force){if(paused)return;const p=carGroup.position;let pres=false;for(const c of DN.car)if(Math.abs(p.x-c.x)+Math.abs(p.z-c.z)<2200)pres=true;if(!pres)return;}
  const mt=DN_CT.m,q9=DN_CT.q,e9=DN_CT.e,v9=DN_CT.v,s9=DN_CT.s;let k=0;
  for(const c of DN.car){c.t=(c.t+dt*1.3*(c.v||1))%140;const ca=Math.sin(c.a),cz=Math.cos(c.a);s9.setScalar(DN_CAM*(c.k||1)); /* (2026-10-20) la taille et le pas de CHAQUE caravane (le tirage) */
    for(let j=0;j<c.n;j++){const d=c.t-j*DN_CAM*2.4,x=c.x+ca*d,z=c.z+cz*d,ph=(c.t+j*2.3)*2.2,h=dnHauteur(x,z);
      e9.set(Math.sin(ph)*.035,c.a,Math.sin(ph*.5)*.03);q9.setFromEuler(e9);mt.compose(v9.set(x,h-.15+Math.abs(Math.sin(ph))*.12,z),q9,s9);im.setMatrixAt(k++,mt);}}
  im.instanceMatrix.needsUpdate=true;}
/* LE SABLE QUI VOLE (le VENT DE SABLE, la TEMPÊTE) : des grains dans une boîte de 260 m qui suit la caméra, poussés par le vent de la map (DN.vent), qui
   tourbillonnent un peu — leur force est dnQ.z de l'ambiance (0 ailleurs : invisibles). Une instance, le mouvement dans le sommet, aucune allocation. */
/* (2026-10-22, Léo : « le niveau dune n'est pas au niveau ») LE SABLE QUI VOLE, REFAIT : de grosses boules floues dans tout le ciel (neige, bulles) → de FINS GRAINS dorés dans une couche
   mince posée sur le sable (uBoxC.y suit le sol sous la caméra), qui filent avec le vent : de la poussière, plus de ciel étoilé de jour */
const DN_PART_VS=['attribute vec4 aR;uniform float uTime,uK,uPx;uniform vec3 uBoxC,uVent,uCol;varying float vA;varying vec3 vC;',
  'void main(){float sk=smoothstep(.25,.9,uK);vec3 B=vec3(240.,20.+75.*sk,240.);', // (la couche s'épaissit avec le vent : fine un jour calme, un vrai brouillard de sable dans la tempête)
  '  vec3 pa=uVent*uTime*(.7+.6*aR.w)+vec3(sin(uTime*1.3+aR.y*9.)*2.,sin(uTime*.9+aR.x*7.)*.9,cos(uTime*1.1+aR.z*8.)*2.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  vA=smoothstep(0.,.10,e)*uK*(.35+.65*aR.w);vC=uCol*(.8+.4*aR.z);',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=vA<.003?0.:clamp((.26+aR.z*.45)*(1.+1.6*sk)*uPx*300./max(1.,-mv.z),1.2*uPx,(5.+5.*sk)*uPx);}'].join('\n');
const DN_PART_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);if(vA*a<.004)discard;gl_FragColor=vec4(vC,min(1.,vA*a*1.4));}'].join('\n');
const DN_V=new THREE.Vector3();
function dnPart(){if(DN.part)return DN.part;const n=PAL.b('dnPart',1600),R=mulberry32(0x5AB1E),g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
  const m=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uK:{value:0},uPx:{value:1},uBoxC:{value:new THREE.Vector3()},uVent:{value:new THREE.Vector3(1,0,0)},uCol:{value:new THREE.Color()}},
    vertexShader:DN_PART_VS,fragmentShader:DN_PART_FS,transparent:true,depthWrite:false});m.dispose=function(){};
  const p=new THREE.Points(g,m);p.name='dunes sable';p.frustumCulled=false;p.matrixAutoUpdate=false;p.visible=false;p.renderOrder=8;scene.add(p);return DN.part=p;}
function dnPartTick(dt,c){const k9=DN.on&&started?Math.max(c.dnQ?c.dnQ[2]:0,DN.deco?DN.deco.vent.vole:0,.16):0; /* (2026-10-20) + le sable qui vole du tirage (un jour de vent) */if(!(k9>.01)&&!(DN.part&&DN.part.visible))return;
  const P9=dnPart(),u=P9.material.uniforms;P9.visible=k9>.01;if(!P9.visible)return;u.uK.value=k9;if(!paused)u.uTime.value=(u.uTime.value+dt)%600;u.uPx.value=renderer.getPixelRatio();
  camera.getWorldDirection(DN_V);u.uBoxC.value.copy(camera.position).addScaledVector(DN_V,60);
  try{const g9=dnHauteur(u.uBoxC.value.x,u.uBoxC.value.z);const hB=20+75*Math.min(1,Math.max(0,(k9-.25)/.65));u.uBoxC.value.y=Math.max(camera.position.y-40,Math.min(camera.position.y+2,g9+Math.max(6,hB*.32)));}catch(e){} // la couche de grains : 6 m au-dessus du sable sous la caméra (jamais plus de 30 m sous elle, jamais au-dessus)
 u.uVent.value.set(DN.vent[0],-.04,DN.vent[1]).multiplyScalar(14+24*k9);if(c.dnH)u.uCol.value.fromArray(c.dnH).multiplyScalar(1.3);}
function dunesChauffe(){ // au menu (chauffeDivers) : le sable et les décors compilés et dessinés une fois hors écran — 0 programme en course
  if(!DUNES_OK)return;dnTerrain();const m=DN.mesh,v=m.visible,n=DN.geo.instanceCount;DN.geo.instanceCount=1;DN.aN.array[2]=64;m.visible=true;
  const M9=dnMats(),g9=new THREE.Group(),bx9=new THREE.BoxGeometry(1,1,1),c9=new Float32Array(bx9.attributes.position.count*3).fill(1);bx9.setAttribute('color',new THREE.BufferAttribute(c9,3));bx9.setAttribute('aK',new THREE.BufferAttribute(new Float32Array(bx9.attributes.position.count),1));
  for(const mt of [M9.t,M9.g,M9.d]){g9.add(new THREE.Mesh(bx9,mt));const im=new THREE.InstancedMesh(bx9,mt,1);im.setMatrixAt(0,new THREE.Matrix4());g9.add(im);}
  g9.traverse(function(o){o.frustumCulled=false;});scene.add(g9);const P9=dnPart(),pv=P9.visible;P9.visible=true;
  try{chauffeRendu([m,g9,P9]);}finally{m.visible=v;DN.geo.instanceCount=n;scene.remove(g9);bx9.dispose();P9.visible=pv;}}
window.dbgDunes=function(k,a,b,c,d){
  if(k==='ecart'){if(!DN.on)return 'pas de dunes';const cs=(+a||DN.S0*Math.pow(2,DN.lmin|0)/DN.G),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},T9={},H=(i,j)=>dnHauteur(i*cs,j*cs,T9);
    /* (facettes, banc) l'ÉCART entre le sable RENDU (interpolation linéaire sur la grille de `cs` m, les deux triangles de chaque case) et la vraie fonction dnHauteur, le long de la route jusqu'à ±90 m, et la marge route − sable RENDU (≥ 1 m) */
    const lin=(x,z)=>{const i=Math.floor(x/cs),j=Math.floor(z/cs),u=x/cs-i,v=z/cs-j,ha=H(i,j),hb=H(i+1,j),hc=H(i,j+1),hd=H(i+1,j+1);return u+v<=1?ha+(hb-ha)*u+(hc-ha)*v:hd+(hc-hd)*(1-u)+(hb-hd)*(1-v);};
    const E=[];let pire=1e9,piresS=-1,mx=0,mxAt=null;
    for(let s9=0;s9<L;s9+=8){frameAt(s9,F9);for(let lt=-90;lt<=90;lt+=6){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,t9=dnHauteur(x,z,T9),l9=lin(x,z);E.push(Math.abs(l9-t9));if(Math.abs(l9-t9)>mx){mx=Math.abs(l9-t9);mxAt=[s9,lt,Math.round(x),Math.round(z),+t9.toFixed(1),+l9.toFixed(1)];}
      if(Math.abs(lt)<=ROAD_HALF+1){const m=F9.p.y+F9.b.y*lt-l9;if(m<pire){pire=m;piresS=s9;}}}}
    E.sort((p,q)=>p-q);return {cell:cs,max:+mx.toFixed(2),p50:+E[E.length>>1].toFixed(2),p95:+E[Math.floor(E.length*.95)].toFixed(2),p99:+E[Math.floor(E.length*.99)].toFixed(2),margeMinRendu:+pire.toFixed(2),en:piresS,max9:mxAt,n:E.length};}
  if(k==='test'){if(!DN.on)return 'pas de dunes';let dessus=0,pire=1e9,od=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; /* (LA ROUTE CONTINUE) le sable doit rester SOUS le bitume : marge = bitume − sable, sur toute la largeur ; < 1 m = le sable mord la route */
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,-ROAD_HALF*.5,0,ROAD_HALF*.5,ROAD_HALF]){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,m=y-dnHauteur(x,z);
      if(m<1){dessus++;if(od.length<40)od.push(Math.round(s9)+(lt?(lt>0?'d':'g'):'c')+'('+m.toFixed(1)+')');}pire=Math.min(pire,m);}}
    let mo=0;for(let s9=0;s9<L;s9+=10){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF]){F9.p.addScaledVector(F9.b,lt);F9.p.y+=1;if(dnMonuHeurt(F9.p))mo++;F9.p.y-=1;F9.p.addScaledVector(F9.b,-lt);}}
    return {dessus:dessus,dessusOu:od.join(' '),margeMin:+pire.toFixed(1),decorsSurLaRoute:mo,sep:DN.sep};}
  if(k==='bank'){if(!DN.on||!DN.S)return 'pas de dunes';const S9=DN.S,F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},o=[]; /* (banc) l'inclinaison de la dalle à l'abscisse a..b (pas c) : celle de la route (frameAt) contre celle que le sable a reçue (S.bk), et la marge aux deux bords */
    for(let q=+a||0;q<=(+b||+a||0);q+=(+c||16)){frameAt(q,F9);const i=Math.max(0,Math.min(S9.n-1,Math.round(q/S9.ds))),m=function(lt){return +(F9.p.y+F9.b.y*lt-dnHauteur(F9.p.x+F9.b.x*lt,F9.p.z+F9.b.z*lt)).toFixed(2);};
      o.push({s:Math.round(q),route:+(Math.asin(Math.max(-1,Math.min(1,-F9.b.y)))*57.2958).toFixed(1),sable:+(S9.bk[i]*57.2958).toFixed(1),gauche:m(-ROAD_HALF),droite:m(ROAD_HALF)});}return o;}
  if(k==='lev')return {lev:DN.dbgLev||null,surf:DN.surf|0,surfG:DN.surfG||0,tous:DN.lev.map(function(v){return [Math.round(v.s),Math.round(v.aim),v.tag];})}; /* (banc) le dernier tremplin pris : vitesse, impulsion, durée visée… et la liste des tremplins */
  if(k==='prof'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},o=[]; /* (banc) le profil en travers à l'abscisse a : [décalage latéral, hauteur de la dalle (jusqu'au bord), hauteur du sable] */
    frameAt(+a||0,F9);for(let lt=-60;lt<=60;lt+=(+b||6)){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;o.push([lt,Math.abs(lt)<=ROAD_HALF?+(F9.p.y+F9.b.y*lt).toFixed(1):null,+dnHauteur(x,z).toFixed(1)]);}return o;}
  if(k==='ech'){if(!DN.on||!DN.S)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||+a||0);q+=(+c||8)){const i=Math.max(0,Math.min(S9.n-1,Math.round(q/S9.ds))),f=function(v){return +v[i].toFixed(1);}; /* (banc) les paramètres du terrain prescrit à l'abscisse q : route, mer, côtés (h = la colline ou l'éperon, w = sa largeur) */
      o.push({s:Math.round(q),y:f(S9.y),B:f(S9.B),hP:f(S9.hP),wP:f(S9.wP),hM:f(S9.hM),wM:f(S9.wM),RE:Math.round(S9.RE[i]),pw:f(S9.pw),pan:f(S9.pan)});}return o;}
  if(k==='suit'){if(!started||gameOver)return 'pas de course';if(!paused)togglePause();const q=carGroup.position,f=DN_V.set(0,0,1).applyQuaternion(carGroup.quaternion); /* (banc) gèle la course et pose la caméra derrière la caisse : a = recul (m), b = hauteur, c = champ */
    camera.position.set(q.x-f.x*(a||14),q.y+(b||5),q.z-f.z*(a||14));camera.up.set(0,1,0);camera.lookAt(q.x+f.x*8,q.y+1,q.z+f.z*8);if(c)camera.fov=c;camera.updateProjectionMatrix();camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {car:q.toArray().map(Math.round),s:Math.round(s),mode:mode};}
  if(k==='sauts')return (DN.lev||[]).map(function(v,j){return {n:j,tag:v.tag,lip:Math.round(v.s),pose:Math.round(v.e),vide:Math.round(v.e-v.s),visee:Math.round(v.aim),segment:v.seg,dy:DN.S?Math.round(DN.S.y[Math.min(DN.S.n-1,Math.round(v.s/DN.S.ds))]-DN.S.y[Math.min(DN.S.n-1,Math.round(v.e/DN.S.ds))]):0};});
  if(k==='tp'){if(!started||gameOver||mode!=='drive')return 'pas au sol';s=Math.max(0,Math.min(L-30,+a||0));lat=0;if(b!=null)vA=+b/SPD;return {s:Math.round(s),vA:+vA.toFixed(1)};} /* (banc) la caisse posée à l'abscisse a, à la vitesse monde b (m/s) */
  if(k==='marge'){if(!DN.on)return 'pas de dunes';const S9=DN.S,o=[];for(let q=+a||0;q<=(+b||L);q+=(+c||10)){const i=Math.min(S9.n-1,Math.round(q/S9.ds));o.push(Math.round(q)+':'+(S9.y[i]-dnHauteur(S9.x[i],S9.z[i])).toFixed(0)+'/D'+S9.D[i].toFixed(0)+'/z'+S9.zC[i].toFixed(1));}return o.join(' ');} /* (banc) la hauteur de la ligne de route au-dessus du sable, de a à b tous les c m */
  if(k==='raccourcis')return DN.rac||[];
  if(k==='const')return {ROAD_HALF:ROAD_HALF,THICK:THICK,L:Math.round(L),NP:NP,SPD:SPD,FALL_G:FALL_G,GRAV_K:GRAV_K,vPalier:Math.round(vPalier()),rayon:Math.round(rayonPalier()),lv:+lvPiste().toFixed(2),lcible:Math.round(longueurCible()),eng:engTier,y0:Math.round(pts[0].y),yFin:Math.round(pts[NP-1].y),vitMult:+vitMult().toFixed(2),vA:+vA.toFixed(1)}; /* (banc) les constantes du jeu que le banc ne peut pas lire (rien n'est global) */
  if(k==='gpu'){const gl=renderer.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');if(!ext)return 'pas de chrono';const n=a||20,reps=b||5; /* (banc) le coût GPU d'une image FIGÉE (la caméra de dbgDunes('vueA'…)) : n rendus d'affilée chronométrés par la puce, reps fois — {min, med} en ms par image */
    return (async function(){const all=[];for(let rep=0;rep<reps;rep++){const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);for(let i=0;i<n;i++){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}gl.endQuery(ext.TIME_ELAPSED_EXT);const t0=performance.now();while(!gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)&&performance.now()-t0<4000)await new Promise(function(r){setTimeout(r,5);});const ok=!gl.getParameter(ext.GPU_DISJOINT_EXT),v=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6/n;gl.deleteQuery(q);if(ok)all.push(v);}all.sort(function(x,y){return x-y;});return all.length?{min:+all[0].toFixed(2),med:+all[all.length>>1].toFixed(2)}:null;})();}
  if(k==='profil'){if(!DN.on)return 'pas de dunes';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},r=[];frameAt(Math.max(0,Math.min(L-1,+a||0)),F9);for(let lt=-(b||80);lt<=(b||80);lt+=(c||8)){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;r.push(lt+':'+(dnHauteur(x,z)-F9.p.y).toFixed(1));}return r.join(' ');} /* (banc) le sable (m, par rapport à la dalle) en travers de la route à l'abscisse a, de -b à +b tous les c m */
  if(k==='galerie')return dnGalerie(a,b,c,d,arguments[5]);
  if(k==='modele'){const g=dnMod(a),p=g.attributes.position,n=g.attributes.normal;g.computeBoundingBox();const bb=g.boundingBox;let pos=0,neg=0,nan=0;const c=bb.getCenter(new THREE.Vector3());for(let j=0;j<p.count;j++){const dx=p.getX(j)-c.x,dz=p.getZ(j)-c.z,l=Math.hypot(dx,dz)||1,d=(dx*n.getX(j)+dz*n.getZ(j))/l;if(d>0)pos++;else neg++;if(!isFinite(n.getX(j)+n.getY(j)+n.getZ(j)))nan++;}
    return {sommets:p.count,triangles:p.count/3,bb:[bb.min.toArray().map(function(v){return +v.toFixed(2);}),bb.max.toArray().map(function(v){return +v.toFixed(2);})],normalesVersLexterieur:pos,vers_linterieur:neg,nan:nan};} /* (banc) un modèle : sa taille, ses sommets, le sens de ses normales */
  if(k==='shader'){const m=a==='sable'?DN.mat:(DN.mm&&DN.mm[a]);if(!m)return 'pas de matière';const f0=m.fragmentShader;m.fragmentShader=f0.split(b).join(c);m.needsUpdate=true;return {change:f0!==m.fragmentShader};} /* (banc) retouche la matière à chaud : a = sable | t | g, b = le texte à remplacer, c = son remplaçant */
  if(k==='poly'){const U=DN.mat&&DN.mat.uniforms;if(!U)return 'pas de matière';const o=a||{};if(o.tint!=null)U.uPl.value.x=o.tint;if(o.joint!=null)U.uPl.value.y=o.joint;if(o.glint!=null)U.uPl.value.z=o.glint;if(o.flat!=null)U.uPl.value.w=o.flat;if(o.rim!=null)U.uLm.value.x=o.rim;if(o.scat!=null)U.uLm.value.y=o.scat;if(o.term!=null)U.uLm.value.z=o.term;if(o.reb!=null)U.uLm.value.w=o.reb;return {pl:U.uPl.value.toArray(),lm:U.uLm.value.toArray(),poly:U.uPoly.value,lum:U.uLum.value};}
  if(k==='uni'){const U=DN.mat&&DN.mat.uniforms;if(!U)return 'pas de matière';return {mo:U.uMo.value.toArray(),k:U.uK.value.toArray(),q:U.uQ.value.toArray(),fs:DN.mat.fragmentShader.length,mosaique:DN.mat.fragmentShader.indexOf('uMo')>=0,decor:DN.mm?{t:DN.mm.t.fragmentShader.indexOf('blk(')>=0,g:DN.mm.g.fragmentShader.indexOf('blk(')>=0}:null};} /* (banc) les réglages de la matière du sable */
  if(k==='regle'){DN.reg=a||null;return DN.reg;} /* (banc, 2026-10-21) {ex:[…],sp:[…]} : règle les uniformes de l'embellissement sans recharger ; null = les valeurs de l'ambiance */
  if(k==='reprendre'){if(paused)togglePause();return 'ok';}
  if(k==='cam'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const P=a||[0,0,0],T=b||[0,0,1]; /* (banc) la caméra où l'on veut : a = [x,y,z] de l'œil, b = [x,y,z] de la cible, c = le champ (degrés) */
    camera.position.set(P[0],P[1],P[2]);camera.up.set(0,1,0);camera.lookAt(T[0],T[1],T[2]);if(c){camera.fov=c;camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  if(k==='vueL'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; /* (banc) la caméra à l'abscisse a, décalée de b m sur le côté (+ = à droite), à c m de haut, cap d° ; e = la pente du regard */
    frameAt(Math.max(0,Math.min(L-1,a||0)),F9);const lt=b||0,cap=(d||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap),pe=arguments[5]!=null?arguments[5]:.06;
    camera.position.set(F9.p.x+F9.b.x*lt,F9.p.y+(c||8),F9.p.z+F9.b.z*lt);camera.up.set(0,1,0);camera.lookAt(camera.position.x+dx*200,camera.position.y-200*pe,camera.position.z+dz*200);if(arguments[6]){camera.fov=arguments[6];camera.updateProjectionMatrix();}camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round)};}
  if(k==='decors'){const r=function(o){return o.map(function(q){return {x:Math.round(q.x),y:Math.round(q.y),z:Math.round(q.z),h:Math.round(q.h||0),k:q.k||q.st||''};});};return {ob:r(DN.ob||[]),pyrs:r(DN.pyrs||[]),mo:r(DN.mo||[]),oasis:DN.oa?{x:Math.round(DN.oa.x),z:Math.round(DN.oa.z),r:Math.round(DN.oa.r)}:null,n:DN.decoN||null};} /* (banc) où sont les décors */
  if(k==='vue'||k==='vueA'){if(!DN.on)return 'pas de dunes';if(started&&!gameOver&&!paused)togglePause();const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.max(0,Math.min(L-1,(k==='vueA'?0:s)+(a||0))),F9);const cap=(c||0)*Math.PI/180,dx=F9.t.x*Math.cos(cap)-F9.t.z*Math.sin(cap),dz=F9.t.z*Math.cos(cap)+F9.t.x*Math.sin(cap);
    camera.position.set(F9.p.x,F9.p.y+(b||12),F9.p.z);camera.up.set(0,1,0);camera.lookAt(F9.p.x+dx*200,F9.p.y+(b||12)-200*(d!=null?d:.12),F9.p.z+dz*200);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),noeuds:DN.n};}
  return {on:DN.on,ms:DN.ms,noeuds:DN.n,sep:DN.sep,rmin:DN.rmin,F:DN.F?[DN.F.nx,DN.F.nz,DN.F.ts]:null,Z:DN.Z?[DN.Z.nx,DN.Z.nz,DN.Z.ts]:null,O:DN.O?[DN.O.nx,DN.O.nz,DN.O.ts]:null,
    ciel:CIEL2.mode,attente:!!DN.attente,sQ:DN.sQ,L:Math.round(L),obelisques:DN.ob.length,pyramide:!!DN.pyr,acacias:DN.nArb|0,palmiers:DN.nPal|0,emb:DN.emb||null,caravanes:DN.car.length,oasis:DN.oa?{r:Math.round(DN.oa.r),y:Math.round(DN.oa.y)}:null,
    sol:[DN.sunAz,DN.sunEl,DN.fin&&DN.fin.x,DN.fin&&DN.fin.z,DN.pyrs&&DN.pyrs[2]&&[DN.pyrs[2].x,DN.pyrs[2].y,DN.pyrs[2].z,DN.pyrs[2].hw,DN.pyrs[2].h]],hz:DN.hz||null,deco:DN.deco?Object.assign({},DN.deco,{pose:DN.decoN,pyramides:DN.pyrs.map(function(p){return p.st+':'+Math.round(p.hw*2)+'m';}),monuments:DN.mo.map(function(m){return m.k;})}):null,levres:(DN.lev||[]).length,scenes:DN.scn||null,heurt:DN.heurt||'',sauts:DN.sauts|0,levre:DN.dbgLev||null,vent:DN.vent.map(v=>+v.toFixed(2)),lam:Math.round(DN.lam),soleil:SUN_DIR.toArray().map(v=>+v.toFixed(3)),ombre:+DN.ombre.toFixed(2),dunes:+(LVL.dunes||0).toFixed(2),canyon:+(LVL.canyon||0).toFixed(2),
    tri:DN.tri|0,lmin:DN.lmin|0,carHaut:DN.on?+(carGroup.position.y-dnHauteur(carGroup.position.x,carGroup.position.z)).toFixed(1):null};};
/* ===== LES DÉCORS DES DUNES, REFAITS (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt pour voir le niveau que j'attends ») =====
   LA BOÎTE À OUTILS (`dnKit`) : un constructeur à PILE DE TRANSFORMATIONS (déplacer, tourner, mettre à l'échelle, puis poser des boîtes, des troncs de pyramide, des cylindres et surfaces
   de révolution LISSES, des sphères aplaties, des tubes), des normales explicites (plates sur la pierre, lisses sur les fûts), une teinte par face (un peu bruitée : jamais deux faces
   pareilles) et une MATIÈRE par sommet (aK : 0 peint · 1 assises de pierre · 2 roche · 3 or · 4 pierre gravée de glyphes). Les modèles sont cachés dans DN.kit (une fois par session, comme DN.geos).
   Tout est dessiné par la matière des décors (DN_AFS) : la pierre y est en ASSISES (rangées, joints décalés, taille qui suit la distance), les glyphes ne se lisent que de près.
   Console : `dbgDunes('galerie')` pose tous les modèles en rang devant la caméra (banc). */
function dnKit(sd0){
  const P=[],C=[],Nm=[],K=[],cur=new THREE.Matrix4(),stk=[],v=new THREE.Vector3(),n9=new THREE.Vector3(),m=new THREE.Matrix4(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),e3=new THREE.Vector3();
  let sd=(sd0||12345)|0,kvf=null;const rnd=()=>(sd=(Math.imul(sd,1103515245)+12345)&0x7fffffff)/0x7fffffff;
  const pt=(p,n,c,k,f)=>{v.set(p[0],p[1],p[2]).applyMatrix4(cur);P.push(v.x,v.y,v.z);n9.set(n[0],n[1],n[2]).transformDirection(cur);Nm.push(n9.x,n9.y,n9.z);C.push(c[0]*f,c[1]*f,c[2]*f);K.push(kvf?kvf(p):k);};
  // un triangle : la normale plate est tournée vers l'EXTÉRIEUR du solide (o = un point dedans) ; nn = trois normales lisses (sinon plate)
  const tri=(a,b,c,col,k,f,o,nn)=>{e1.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);e2.set(c[0]-a[0],c[1]-a[1],c[2]-a[2]);e3.crossVectors(e1,e2);const l=e3.length();if(l<1e-9)return;e3.multiplyScalar(1/l);
    let sg=1;if(nn){const sx=nn[0][0]+nn[1][0]+nn[2][0],sy=nn[0][1]+nn[1][1]+nn[2][1],sz=nn[0][2]+nn[1][2]+nn[2][2];if(e3.x*sx+e3.y*sy+e3.z*sz<0)sg=-1;}
    else if(o){const cx=(a[0]+b[0]+c[0])/3-o[0],cy=(a[1]+b[1]+c[1])/3-o[1],cz=(a[2]+b[2]+c[2])/3-o[2];if(e3.x*cx+e3.y*cy+e3.z*cz<0)sg=-1;}
    const n=nn?null:[e3.x*sg,e3.y*sg,e3.z*sg];
    if(sg>0){pt(a,nn?nn[0]:n,col,k,f);pt(b,nn?nn[1]:n,col,k,f);pt(c,nn?nn[2]:n,col,k,f);}else{pt(a,nn?nn[0]:n,col,k,f);pt(c,nn?nn[2]:n,col,k,f);pt(b,nn?nn[1]:n,col,k,f);}};
  const jf=j=>1-(j==null?.05:j)+2*(j==null?.05:j)*rnd();
  const quad=(a,b,c,d,col,k,o,j)=>{const f=jf(j);tri(a,b,c,col,k||0,f,o);tri(a,c,d,col,k||0,f,o);};
  const K9={
    push:()=>{stk.push(cur.clone());},pop:()=>{cur.copy(stk.pop());},
    T:(x,y,z)=>{cur.multiply(m.makeTranslation(x,y,z));},Ry:a=>{cur.multiply(m.makeRotationY(a));},Rx:a=>{cur.multiply(m.makeRotationX(a));},Rz:a=>{cur.multiply(m.makeRotationZ(a));},Sc:s=>{cur.multiply(m.makeScale(s,s,s));},
    reset:()=>{cur.identity();stk.length=0;},setK:f=>{kvf=f;}, // setK(p => k) : la matière CALCULÉE par sommet (null : la matière donnée) — 20 + u : l'oriflamme qui ondule, u = la distance au mât (0 → 1), voir DN_MVS
    tri:tri,quad:quad,
    // une boîte posée : centre (cx, cz), de y0 à y0+sy ; fond facultatif
    box:(cx,y0,cz,sx,sy,sz,col,k,bas,j)=>{const x0=cx-sx/2,x1=cx+sx/2,y1=y0+sy,z0=cz-sz/2,z1=cz+sz/2,o=[cx,y0+sy/2,cz],A=[x0,y0,z0],B=[x1,y0,z0],Cc=[x1,y0,z1],D=[x0,y0,z1],E=[x0,y1,z0],F=[x1,y1,z0],G=[x1,y1,z1],H=[x0,y1,z1];
      quad(A,B,F,E,col,k,o,j);quad(B,Cc,G,F,col,k,o,j);quad(Cc,D,H,G,col,k,o,j);quad(D,A,E,H,col,k,o,j);quad(E,F,G,H,col,k,o,j);if(bas)quad(A,D,Cc,B,col,k,o,j);},
    // un tronc de pyramide rectangulaire : base w0 × d0 en y0 (centre cx, cz), sommet w1 × d1 décalé de (ox, oz) en y0+h ; w1 = 0 : pointe
    frus:(cx,y0,cz,w0,d0,w1,d1,h,col,k,ox,oz,bas,j)=>{ox=ox||0;oz=oz||0;const y1=y0+h,o=[cx+ox/2,y0+h/2,cz+oz/2],
      a=[cx-w0/2,y0,cz-d0/2],b=[cx+w0/2,y0,cz-d0/2],c=[cx+w0/2,y0,cz+d0/2],d=[cx-w0/2,y0,cz+d0/2],
      e=[cx+ox-w1/2,y1,cz+oz-d1/2],f=[cx+ox+w1/2,y1,cz+oz-d1/2],g=[cx+ox+w1/2,y1,cz+oz+d1/2],hh=[cx+ox-w1/2,y1,cz+oz+d1/2];
      if(w1<=0||d1<=0){const t=[cx+ox,y1,cz+oz],f9=jf(j);tri(a,b,t,col,k||0,f9,o);tri(b,c,t,col,k||0,f9,o);tri(c,d,t,col,k||0,f9,o);tri(d,a,t,col,k||0,f9,o);}
      else{quad(a,b,f,e,col,k,o,j);quad(b,c,g,f,col,k,o,j);quad(c,d,hh,g,col,k,o,j);quad(d,a,e,hh,col,k,o,j);quad(e,f,g,hh,col,k,o,j);}
      if(bas)quad(a,d,c,b,col,k,o,j);},
    // un tronc de cône à n pans, flancs LISSES : rayon r0 en y0, r1 en y0+h (r1 = 0 : pointe), centre (cx, cz) ; le dessus plat ; col peut être une liste (une teinte par pan)
    cyl:(cx,y0,cz,r0,r1,h,n,col,k,rot,bas)=>{rot=rot||0;const y1=y0+h,o=[cx,y0+h/2,cz],sl=(r0-r1)/Math.max(h,1e-6);
      for(let i=0;i<n;i++){const a1=rot+i/n*6.28319,a2=rot+(i+1)/n*6.28319,c1=Math.cos(a1),s1=Math.sin(a1),c2=Math.cos(a2),s2=Math.sin(a2),cc=Array.isArray(col[0])?col[i%col.length]:col,f=jf(.04),
          n1=[c1,sl,s1],n2=[c2,sl,s2],p1=[cx+c1*r0,y0,cz+s1*r0],p2=[cx+c2*r0,y0,cz+s2*r0],q1=[cx+c1*r1,y1,cz+s1*r1],q2=[cx+c2*r1,y1,cz+s2*r1];
        tri(p1,p2,q2,cc,k||0,f,null,[n1,n2,n2]);if(r1>0){tri(p1,q2,q1,cc,k||0,f,null,[n1,n2,n1]);tri(q1,q2,[cx,y1,cz],cc,k||0,f,[cx,y1-1,cz]);}
        if(bas)tri(p1,[cx,y0,cz],p2,cc,k||0,f,[cx,y0+1,cz]);}},
    // une surface de révolution : prof = [[r, y], …] de bas en haut, flancs lisses (la normale suit la pente du profil)
    lathe:(cx,cz,prof,n,col,k,rot)=>{rot=rot||0;
      for(let j=0;j<prof.length-1;j++){const r0=prof[j][0],y0=prof[j][1],r1=prof[j+1][0],y1=prof[j+1][1],dr=r1-r0,dy=y1-y0,nl=Math.hypot(dr,dy)||1,nr=dy/nl,ny=-dr/nl;
        for(let i=0;i<n;i++){const a1=rot+i/n*6.28319,a2=rot+(i+1)/n*6.28319,c1=Math.cos(a1),s1=Math.sin(a1),c2=Math.cos(a2),s2=Math.sin(a2),cc=Array.isArray(col[0])?col[(i+j)%col.length]:col,f=jf(.03),
            n1=[c1*nr,ny,s1*nr],n2=[c2*nr,ny,s2*nr],p1=[cx+c1*r0,y0,cz+s1*r0],p2=[cx+c2*r0,y0,cz+s2*r0],q1=[cx+c1*r1,y1,cz+s1*r1],q2=[cx+c2*r1,y1,cz+s2*r1];
          if(r0>1e-6)tri(p1,p2,q2,cc,k||0,f,null,[n1,n2,n2]);if(r1>1e-6)tri(p1,q2,q1,cc,k||0,f,null,[n1,n2,n1]);}}},
    // une sphère aplatie (ellipsoïde) : centre, rayons rx ry rz, nlat bandes de latitude, nlon pans
    sph:(cx,cy,cz,rx,ry,rz,nlat,nlon,col,k)=>{const q=(i,j)=>{const t=-Math.PI/2+i/nlat*Math.PI,a=j/nlon*6.28319,ct=Math.cos(t),st=Math.sin(t);return {p:[cx+ct*Math.cos(a)*rx,cy+st*ry,cz+ct*Math.sin(a)*rz],n:[ct*Math.cos(a)/rx,st/ry,ct*Math.sin(a)/rz]};};
      for(let i=0;i<nlat;i++)for(let j=0;j<nlon;j++){const A=q(i,j),B=q(i,j+1),Cc=q(i+1,j+1),D=q(i+1,j),f=jf(.04);
        if(i>0)tri(A.p,B.p,Cc.p,col,k||0,f,null,[A.n,B.n,Cc.n]);if(i<nlat-1)tri(A.p,Cc.p,D.p,col,k||0,f,null,[A.n,Cc.n,D.n]);}},
    // un tube de A à B (rayons r0, r1), n pans, lisse
    tube:(A,B,r0,r1,n,col,k,bout)=>{const ax=new THREE.Vector3(B[0]-A[0],B[1]-A[1],B[2]-A[2]),l=ax.length()||1;ax.multiplyScalar(1/l);const up=Math.abs(ax.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0),
      u=new THREE.Vector3().crossVectors(ax,up).normalize(),w=new THREE.Vector3().crossVectors(ax,u).normalize(),sl=(r0-r1)/l;
      const P2=(O,r,t)=>[O[0]+(u.x*Math.cos(t)+w.x*Math.sin(t))*r,O[1]+(u.y*Math.cos(t)+w.y*Math.sin(t))*r,O[2]+(u.z*Math.cos(t)+w.z*Math.sin(t))*r],
        N2=t=>[u.x*Math.cos(t)+w.x*Math.sin(t)+ax.x*sl,u.y*Math.cos(t)+w.y*Math.sin(t)+ax.y*sl,u.z*Math.cos(t)+w.z*Math.sin(t)+ax.z*sl];
      for(let i=0;i<n;i++){const t1=i/n*6.28319,t2=(i+1)/n*6.28319,f=jf(.04),p1=P2(A,r0,t1),p2=P2(A,r0,t2),q1=P2(B,r1,t1),q2=P2(B,r1,t2),n1=N2(t1),n2=N2(t2);
        tri(p1,p2,q2,col,k||0,f,null,[n1,n2,n2]);if(r1>0)tri(p1,q2,q1,col,k||0,f,null,[n1,n2,n1]);
        if(bout){tri(q1,q2,B,col,k||0,f,[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2]);}}},
    // un prisme extrudé : un contour [[x, z], …] entre y0 et y1 (côtés plats + dessus)
    ext:(poly,y0,y1,col,k,j)=>{let cx=0,cz=0;for(const q of poly){cx+=q[0];cz+=q[1];}cx/=poly.length;cz/=poly.length;const o=[cx,(y0+y1)/2,cz];
      for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],col,k,o,j);tri([cx,y1,cz],[a[0],y1,a[1]],[b[0],y1,b[1]],col,k||0,jf(j),[cx,y1-1,cz]);}},
    // une surface LOFTÉE (2026-10-22) : des ANNEAUX superelliptiques le long d'un axe — secs = [{p:[x,y,z] (centre), u:[ux,uy,uz] (1er demi-axe, rayon compris), w:[wx,wy,wz] (2e demi-axe), n: la « carrure » (2 = ellipse, 4 = carré arrondi)}] ;
    // nseg points par anneau ; flancs LISSES (normales moyennées des faces voisines) ; col et k : une valeur, ou une LISTE (une par tranche entre deux anneaux) ; cap : 1 ferme le premier anneau, 2 le dernier, 3 les deux
    loft:(secs,nseg,col,k,cap)=>{const R=secs.length,Cn=nseg,Pp=[],Nn2=[],cen=[];
      for(let r=0;r<R;r++){const s=secs[r],ex=2/(s.n||2),row=[];let cx=0,cy=0,cz=0;
        for(let c=0;c<Cn;c++){const a=c/Cn*6.28319,ca=Math.cos(a),sa=Math.sin(a),cs=Math.sign(ca)*Math.pow(Math.abs(ca),ex),sn=Math.sign(sa)*Math.pow(Math.abs(sa),ex);
          const q=[s.p[0]+s.u[0]*cs+s.w[0]*sn,s.p[1]+s.u[1]*cs+s.w[1]*sn,s.p[2]+s.u[2]*cs+s.w[2]*sn];row.push(q);cx+=q[0];cy+=q[1];cz+=q[2];}
        Pp.push(row);cen.push([cx/Cn,cy/Cn,cz/Cn]);Nn2.push(row.map(()=>[0,0,0]));}
      const cr=(a,b,c)=>{const x1=b[0]-a[0],y1=b[1]-a[1],z1=b[2]-a[2],x2=c[0]-a[0],y2=c[1]-a[1],z2=c[2]-a[2];return [y1*z2-z1*y2,z1*x2-x1*z2,x1*y2-y1*x2];};
      const add=(r,c,n,rf)=>{const q=Pp[r][c],o=cen[rf],d=(q[0]-o[0])*n[0]+(q[1]-o[1])*n[1]+(q[2]-o[2])*n[2],sg=d<0?-1:1;Nn2[r][c][0]+=n[0]*sg;Nn2[r][c][1]+=n[1]*sg;Nn2[r][c][2]+=n[2]*sg;};
      for(let r=0;r<R-1;r++)for(let c=0;c<Cn;c++){const c2=(c+1)%Cn,a=Pp[r][c],b=Pp[r][c2],d=Pp[r+1][c],e=Pp[r+1][c2],n1=cr(a,b,e),n2=cr(a,e,d);
        add(r,c,n1,r);add(r,c2,n1,r);add(r+1,c2,n1,r+1);add(r,c,n2,r);add(r+1,c2,n2,r+1);add(r+1,c,n2,r+1);}
      const nz=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
      for(let r=0;r<R;r++)for(let c=0;c<Cn;c++)Nn2[r][c]=nz(Nn2[r][c]);
      for(let r=0;r<R-1;r++)for(let c=0;c<Cn;c++){const c2=(c+1)%Cn,f=jf(.03),cc=Array.isArray(col[0])?col[r%col.length]:col,kr=Array.isArray(k)?k[r%k.length]:(k||0);
        tri(Pp[r][c],Pp[r][c2],Pp[r+1][c2],cc,kr,f,null,[Nn2[r][c],Nn2[r][c2],Nn2[r+1][c2]]);tri(Pp[r][c],Pp[r+1][c2],Pp[r+1][c],cc,kr,f,null,[Nn2[r][c],Nn2[r+1][c2],Nn2[r+1][c]]);}
      const bout=(r,o,kk)=>{const cc=Array.isArray(col[0])?col[0]:col,f=jf(.03);for(let c=0;c<Cn;c++){const c2=(c+1)%Cn;tri(cen[r],Pp[r][c],Pp[r][c2],cc,kk||0,f,o);}};
      if(cap&1)bout(0,cen[1],Array.isArray(k)?k[0]:k);if(cap&2)bout(R-1,cen[R-2],Array.isArray(k)?k[k.length-1]:k);},
    fin:()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nm,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
      g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.computeBoundingSphere();return g;},
    n:()=>P.length/3
  };
  return K9;}
/* LE CUISEUR DES DÉCORS (celui du canyon, avec les normales et la matière) : des géométries posées par une matrice, fondues en UNE (un seul appel de dessin) — te : teinte facultative [r, g, b] */
function dnCuiseur(){let cap=1<<15,n=0,P=new Float32Array(cap*3),Nm=new Float32Array(cap*3),C=new Float32Array(cap*3),K=new Float32Array(cap);const m3=new THREE.Matrix3(); // (des tableaux typés qui grandissent par doublement : 50 000 sommets en ~3 ms, sans un seul objet alloué par sommet)
  const grow=need=>{if(n+need<=cap)return;while(n+need>cap)cap*=2;const g=(a,m)=>{const b=new Float32Array(cap*m);b.set(a.subarray(0,n*m));return b;};P=g(P,3);Nm=g(Nm,3);C=g(C,3);K=g(K,1);};
  return {ajoute:function(g,mt,te){const cnt=g.attributes.position.count,p=g.attributes.position.array,c=g.attributes.color.array,nn=g.attributes.normal.array,k=g.attributes.aK?g.attributes.aK.array:null,r=te?te[0]:1,gg=te?te[1]:1,b=te?te[2]:1,e=mt.elements;m3.getNormalMatrix(mt);const f=m3.elements;grow(cnt);
      for(let j=0;j<cnt;j++){const o=(n+j)*3,j3=j*3,x=p[j3],y=p[j3+1],z=p[j3+2],nx=nn[j3],ny=nn[j3+1],nz=nn[j3+2];
        P[o]=e[0]*x+e[4]*y+e[8]*z+e[12];P[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13];P[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
        const X=f[0]*nx+f[3]*ny+f[6]*nz,Y=f[1]*nx+f[4]*ny+f[7]*nz,Z=f[2]*nx+f[5]*ny+f[8]*nz,l=1/(Math.sqrt(X*X+Y*Y+Z*Z)||1);Nm[o]=X*l;Nm[o+1]=Y*l;Nm[o+2]=Z*l;
        C[o]=c[j3]*r;C[o+1]=c[j3+1]*gg;C[o+2]=c[j3+2]*b;K[n+j]=k?k[j]:0;}
      n+=cnt;},
    n:function(){return n;},
    fin:function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P.slice(0,n*3),3));g.setAttribute('normal',new THREE.BufferAttribute(Nm.slice(0,n*3),3));g.setAttribute('color',new THREE.BufferAttribute(C.slice(0,n*3),3));
      g.setAttribute('aK',new THREE.BufferAttribute(K.slice(0,n),1));g.computeBoundingSphere();return g;}};}
/* LES COULEURS DE LA DA : le grès chaud, le lapis (le teal contre l'or), l'or, la terre cuite, la faïence turquoise */
const DN_COL={gres:[.95,.83,.66],gres2:[.87,.71,.53],cre:[.98,.92,.80],lapis:[.18,.32,.66],azur:[.26,.48,.88],granit:[.72,.49,.45],or:[1,.80,.34],terre:[.74,.38,.24],turq:[.22,.70,.70],noir:[.12,.10,.10],sable:[.96,.78,.50],os:[.96,.93,.84]};
/* LES MODÈLES (hauteur et largeurs en mètres, à poser tels quels ou à l'échelle UNIFORME) — `dnMod(nom)` rend la géométrie (cachée) */
/* LES PYRAMIDES DE GIZEH (2026-10-22, Léo : « des pyramides plus belles ») — demi-base 1, haut ~ 1 : v0 KHÉOPS (le parement de calcaire de Tura, crème et poli, l'ÉLECTRUM du pyramidion qui flambe au soleil), v1 KHÉPHREN (le haut a gardé
   son parement blanc — « un second sommet » —, le bas est nu, en assises), v2 MYKÉRINOS (les assises du bas en GRANIT ROUGE d'Assouan, le haut en calcaire). Des assises de calcaire tout du long (le dégradé : plus chaud au pied, plus blanc au sommet) */
function dnPyrGiza(v){const g=dnKit(87+v),C=DN_COL,N=v===1?26:40,H=.945,r=f=>1-.945*f,mx=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
    cre=[.99,.95,.84],cre2=[.95,.90,.78],och=[.93,.79,.57],och2=[.86,.71,.51],red=[.66,.31,.23],red2=[.56,.26,.20];
  g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);
  for(let i=0;i<N;i++){const f0=i/N,f1=(i+1)/N,y0=.012+f0*H,y1=.012+f1*H,r0=r(f0),r1=r(f1);let col,k=1;
    if(v===0){col=mx(i&1?cre2:cre,och,Math.max(0,1-f0/.28)*.45);}
    else if(v===1){if(f0<.72){col=i&1?och2:och;g.frus(0,y0,0,r0*2,r0*2,(r1-.004)*2,(r1-.004)*2,y1-y0,col,1,0,0,0,.05);g.frus(0,y1-.0006,0,(r1-.004)*2,(r1-.004)*2,r1*2,r1*2,.0006,C.gres2,1);continue;}
      col=f0<.76?[.80,.66,.46]:(i&1?cre2:cre);}
    else{if(f0<.27){col=i&1?red2:red;k=2;}else col=i&1?cre2:cre;}
    g.frus(0,y0,0,r0*2,r0*2,r1*2,r1*2,y1-y0,col,k,0,0,0,.035);}
  g.frus(0,.957,0,.11,.11,.092,.092,.006,C.or,3);g.frus(0,.963,0,.092,.092,0,0,.037,C.or,3);g.box(0,.012,-.995,.12,.10,.03,C.noir,0);return g.fin();}
/* L'ORIFLAMME (2026-10-22) : une bande de toile le long de +x, des bandes de couleur, que le vent fait onduler (la matière 20 + u, voir DN_MVS : le bout libre bat, le mât ne bouge pas) */
function dnFlag(g,x,y,z,L,Hh,cols,n){n=n||8;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n;g.setK(function(p){return 20+Math.max(0,Math.min(1,(p[0]-x)/L));});g.quad([x+u0*L,y+Hh,z],[x+u1*L,y+Hh,z],[x+u1*L,y,z],[x+u0*L,y,z],cols[i%cols.length],20,null,.03);}g.setK(null);}
const DN_MOD={
  // L'OBÉLISQUE : le socle à deux marches, le fût de lapis qui s'affine, des bandeaux d'or, le pyramidion d'or (h = 64, base 8 m)
  obelisque:function(){const g=dnKit(11),b=4,h=64,C=DN_COL;g.box(0,0,0,4.6*b,.7*b,4.6*b,C.gres2,1,1);g.box(0,.7*b,0,3.5*b,.6*b,3.5*b,C.gres,1);
    const y0=1.3*b,hs=h*.86-y0,w0=2*b,w1=1.58*b,fw=f=>w0+(w1-w0)*f;g.frus(0,y0,0,w0,w0,w1,w1,hs,C.granit,4,0,0,0,.03);
    for(const f of [.10,.34,.58,.82]){const yy=y0+hs*f,ww=fw(f);g.frus(0,yy,0,ww*1.035,ww*1.035,ww*1.035,ww*1.035,h*.014,C.or,3);}
    g.frus(0,y0+hs,0,w1*1.06,w1*1.06,w1*1.06,w1*1.06,h*.012,C.or,3);g.frus(0,y0+hs+h*.012,0,w1,w1,0,0,h-(y0+hs+h*.012),C.or,3);return g.fin();},
  // LE PYLÔNE (une tour de temple, h = 30, base 14 × 9) : murs en fruit, corniche à gorge, quatre mortaises de mâts, un cartouche gravé
  pylone:function(){const g=dnKit(23),C=DN_COL,h=30,w0=14,d0=9,w1=11.4,d1=7;g.box(0,0,0,w0*1.12,1.1,d0*1.14,C.gres2,1,1);g.frus(0,1.1,0,w0,d0,w1,d1,h-1.1,C.gres,1,0,0,0,.05);
    g.box(0,h-.2,0,w1*1.1,1.6,d1*1.14,C.gres2,1);g.box(0,h+1.3,0,w1*1.16,.7,d1*1.2,C.or,3);
    for(const sx of [-1,1]){g.box(sx*4.2,3,-d0/2+.1,.8,h*.62,.3,[.40,.27,.20],0);g.tube([sx*4.2,.5,-d0/2-.5],[sx*4.2,h*.98,-d0/2-.5],.30,.24,6,C.noir,0);g.sph(sx*4.2,h*.98+.3,-d0/2-.5,.4,.4,.4,3,6,C.or,3);dnFlag(g,sx*4.2+.3,h*.98-3.2,-d0/2-.5,8,3.2,[C.terre,C.or,C.azur,C.or],8);}
    g.box(0,h*.42,-d0/2+.05+(d0-d1)*.5*.42,6.4,h*.26,.4,C.gres,4);g.box(0,h*.42+.2,-d0/2+.06+(d0-d1)*.5*.42,6.0,.5,.45,C.or,3);g.box(0,h*.42+h*.26-.7,-d0/2+.06+(d0-d1)*.5*.42,6.0,.5,.45,C.lapis,3);return g.fin();},
  // LA COLONNE (h = 22, rayon 2,3) : base, fût qui se resserre, collier d'or, chapiteau en bouton de papyrus, abaque
  colonne:function(){const g=dnKit(31),C=DN_COL,h=22,r=2.3;g.box(0,0,0,r*3,.5,r*3,C.gres2,1,1);
    g.lathe(0,0,[[1.35*r,.5],[1.2*r,.9],[r,1.2],[.86*r,h*.72],[.82*r,h*.80],[.95*r,h*.82],[.86*r,h*.835]],12,C.gres,1);
    g.lathe(0,0,[[.86*r,h*.835],[1.12*r,h*.86],[1.5*r,h*.92],[1.38*r,h*.965],[1.1*r,h*.975]],12,[C.gres,C.cre],1);
    g.cyl(0,h*.80,0,.88*r,.88*r,.7,12,C.or,3);g.cyl(0,h*.88,0,1.3*r,1.3*r,.5,12,C.lapis,3);g.box(0,h*.975,0,r*3,h*.035,r*3,C.gres2,1);return g.fin();}
  ,
  // LE SPHINX (long 1, face à +z, haut ~ .46) : socle, croupe, dos, poitrail, pattes avant, queue, cou, nemès à lappets rayés lapis/or, visage, barbe, uræus
  sphinx:function(){const g=dnKit(41),C=DN_COL,gr=C.gres,g2=C.gres2;g.box(0,0,.02,.46,.028,1.08,g2,1,1);
    g.box(0,.028,-.30,.31,.22,.28,gr,1);g.box(0,.028,-.04,.23,.18,.24,gr,1);g.frus(0,.028,.14,.23,.20,.20,.15,.20,gr,1,0,.02);
    g.box(-.095,.028,.34,.078,.07,.40,gr,1);g.box(.095,.028,.34,.078,.07,.40,gr,1);g.box(-.095,.028,.55,.09,.052,.10,g2,1);g.box(.095,.028,.55,.09,.052,.10,g2,1);
    g.tube([.15,.07,-.43],[.20,.10,-.50],.014,.010,5,gr,1,1);g.box(0,.20,.21,.13,.17,.10,gr,1);
    g.frus(0,.30,.21,.30,.19,.24,.15,.19,C.lapis,3,0,0,0,.02);g.frus(0,.47,.21,.24,.15,.20,.13,.04,C.or,3);
    for(const sx of [-1,1])for(let i=0;i<5;i++)g.box(sx*.14,.20+i*.022,.225,.04,.021,.12,i&1?C.or:C.lapis,3);
    g.box(0,.31,.285,.115,.16,.075,C.cre,1);g.box(0,.35,.325,.032,.052,.03,C.cre,1);g.box(-.03,.385,.322,.025,.012,.012,C.noir,0);g.box(.03,.385,.322,.025,.012,.012,C.noir,0);g.box(0,.318,.322,.05,.008,.012,C.noir,0);
    g.box(0,.245,.30,.034,.07,.04,C.lapis,3);g.box(0,.47,.30,.022,.04,.022,C.or,3);return g.fin();},
  // LE COLOSSE ASSIS (h = 1, face à +z) : socle, trône à dossier, jambes, torse en fruit, bras sur les cuisses, collier d'or et de lapis, tête au nemès, couronne
  colosse:function(){const g=dnKit(53),C=DN_COL,gr=C.gres,g2=C.gres2;g.box(0,0,.02,.58,.05,.66,g2,1,1);g.box(0,.05,-.02,.50,.34,.46,gr,1);g.box(0,.39,-.22,.46,.32,.08,gr,1);
    for(const sx of [-1,1]){g.box(sx*.115,.39,.12,.15,.085,.36,gr,1);g.box(sx*.115,.05,.28,.14,.34,.13,gr,1);g.box(sx*.115,.05,.41,.15,.05,.19,g2,1);}
    g.frus(0,.39,-.09,.35,.20,.30,.16,.30,gr,1,0,0,0,.03);for(const sx of [-1,1]){g.box(sx*.21,.43,-.09,.075,.26,.11,gr,1);g.box(sx*.19,.47,.09,.07,.065,.31,gr,1);}
    g.box(0,.64,-.09,.40,.045,.19,C.lapis,3);g.box(0,.675,-.09,.34,.025,.17,C.or,3);
    g.box(0,.69,-.07,.13,.145,.12,C.cre,1);g.box(0,.725,-.065,.215,.165,.15,C.lapis,3);for(const sx of [-1,1])for(let i=0;i<4;i++)g.box(sx*.11,.60+i*.035,-.05,.04,.034,.10,i&1?C.or:C.lapis,3);
    g.box(0,.74,.005,.10,.14,.06,C.cre,1);g.box(0,.78,.04,.03,.045,.03,C.cre,1);g.box(-.028,.80,.038,.022,.011,.01,C.noir,0);g.box(.028,.80,.038,.022,.011,.01,C.noir,0);g.box(0,.70,.04,.03,.06,.03,C.lapis,3);
    g.frus(0,.805,-.07,.15,.13,.10,.10,.14,C.cre,1);g.frus(0,.945,-.07,.10,.10,.06,.06,.03,C.terre,1);return g.fin();},
  // LE PHARAON ASSIS (2026-10-22, Léo : « je préfère le style A » — un roi de pierre assis façon Ramsès) : trône cubique à dossier-dalle et flancs au sema-tawy, jambes puissantes, tablier plissé, torse large au collier d'or et de lapis,
  // mains à plat sur les genoux, tête au nemès rayé lapis/or (lappets sur la poitrine), uræus, barbe tressée — corps LISSE (matière 0), le trône en assises (1), l'or en 3, la frise du socle gravée (4). Haut ~ .95, face à +z, large ~ .70 au socle
  pharaon:function(crown){crown=crown||'nemes';const g=dnKit(55),C=DN_COL,gr=C.gres,g2=C.gres2,cre=[.97,.87,.70],rg=[.93,.78,.58],pe=[.66,.32,.28];
    const Ry=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.4}),Rz=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.4});
    g.box(0,0,0,.70,.03,.84,g2,1,1);g.box(0,.03,0,.64,.03,.78,gr,1);g.box(0,.052,.405,.52,.012,.012,gr,4);                                                // le socle à deux marches, la frise gravée
    g.box(0,.06,-.05,.44,.32,.50,gr,1);g.box(0,.38,-.285,.44,.44,.07,gr,1);g.box(0,.82,-.285,.40,.03,.065,g2,1);                                          // le trône : le bloc, le dossier-dalle qui monte derrière les épaules, son chaperon
    for(const sx of [-1,1]){g.box(sx*.223,.13,-.05,.014,.20,.30,C.or,3);g.box(sx*.226,.14,-.05,.012,.16,.24,C.lapis,3);g.box(sx*.227,.16,-.05,.01,.045,.14,C.or,3);}  // les flancs du trône : un cadre d'or, une plaque de lapis, le sema-tawy
    for(const sx of [-1,1]){const X=sx*.108;
      g.loft([Rz(-.12,.086,.070,2.6,X,.455),Rz(.04,.090,.072,2.6,X,.455),Rz(.17,.086,.068,2.6,X,.452),Rz(.245,.066,.060,2.4,X,.45)],16,gr,5,3);                  // la cuisse
      g.loft([Ry(.45,.066,.062,2.4,X,.262),Ry(.31,.060,.058,2.4,X,.268),Ry(.18,.058,.055,2.4,X,.272),Ry(.098,.063,.060,2.4,X,.274)],16,gr,5,3);                 // le tibia
      g.box(X,.06,.335,.12,.04,.21,g2,1);g.sph(X,.080,.44,.058,.024,.030,3,8,gr,5);}                                                                          // le pied
    g.box(0,.51,.10,.30,.026,.23,rg,5);for(let i=-6;i<=6;i++)g.box(i*.022,.536,.10,.009,.004,.23,i&1?C.or:cre,3);g.box(0,.51,.22,.30,.04,.012,C.or,3);          // le tablier plissé (le shendyt) et son ourlet d'or
    g.loft([Ry(.505,.135,.082,2.8,0,-.085),Ry(.56,.145,.086,2.8,0,-.085),Ry(.63,.168,.094,3,0,-.085),Ry(.662,.186,.098,3.2,0,-.085),Ry(.684,.200,.099,3.4,0,-.085),Ry(.702,.205,.097,3.4,0,-.085),Ry(.722,.178,.082,2.8,0,-.085),Ry(.738,.120,.066,2.4,0,-.085),Ry(.752,.058,.054,2.2,0,-.082)],20,[gr,gr,gr,C.or,C.turq,C.or,C.azur,gr],[5,5,5,3,3,3,3,5],3); // le torse — et son COLLIER (usekh) : des bandes d'or, de turquoise, d'or, d'azur
    g.box(0,.505,.0,.272,.024,.022,C.or,3);g.box(0,.507,.012,.052,.032,.012,C.lapis,3);                                                                         // la ceinture et sa plaque
    for(const sx of [-1,1]){g.tube([sx*.205,.70,-.085],[sx*.215,.60,-.06],.050,.043,12,gr,5,1);g.sph(sx*.215,.595,-.06,.045,.042,.045,4,8,gr,5);                // le bras, le coude
      g.tube([sx*.215,.595,-.06],[sx*.14,.555,.115],.043,.036,12,gr,5,1);g.tube([sx*.147,.558,.095],[sx*.14,.555,.12],.046,.046,12,C.or,3,1);g.sph(sx*.128,.552,.19,.047,.020,.078,4,10,cre,5);} // l'avant-bras, le bracelet d'or, la main à plat
    g.push();g.T(0,.744,-.07);g.Sc(1.2);g.T(0,-.744,.07); // la TÊTE, plus forte : un colosse se lit à sa tête
    g.loft([Ry(.744,.036,.042,2.2,0,-.055),Ry(.768,.052,.056,2.3,0,-.066),Ry(.796,.060,.064,2.3,0,-.072),Ry(.826,.062,.064,2.3,0,-.074),Ry(.854,.056,.058,2.2,0,-.074)],20,cre,5,3); // le visage ovoïde
    g.frus(0,.785,-.018,.022,.024,.011,.011,.030,cre,5,0,.011);for(const sx of [-1,1]){g.box(sx*.027,.810,-.011,.030,.010,.009,C.noir,0);g.box(sx*.030,.823,-.010,.036,.007,.009,C.noir,0);}g.box(0,.762,-.013,.042,.008,.009,pe,0); // le nez, les yeux de khôl, les sourcils, la bouche
    for(const sx of [-1,1])g.box(sx*.064,.80,-.07,.010,.04,.025,cre,5);                                                                                                  // les oreilles
    g.cyl(0,.836,-.074,.084,.084,.012,20,C.or,3);                                                                                                                       // le bandeau d'or
    for(let i=0;i<5;i++){const y0=.848+i*.022,y1=y0+.022,r=y=>.081*Math.sqrt(Math.max(.0004,1-Math.pow((y-.836)/.125,2)));g.lathe(0,-.074,[[r(y0),y0],[r(y1),y1]],20,i&1?C.or:C.azur,3);}                // le dôme du nemès : bandes lapis et or
    for(const sx of [-1,1])for(let i=0;i<7;i++)g.box(sx*(.094+.002*i),.832-i*.022,-.044,.042+.003*i,.0215,.076,i&1?C.or:C.azur,3);                                    // les lappets, sur la poitrine
    g.frus(0,.848,-.006,.010,.012,.006,.006,.032,C.or,3,0,.005);g.sph(0,.884,.0,.009,.013,.009,3,6,C.or,3);                                                             // l'uræus
    g.frus(0,.656,-.020,.022,.024,.016,.018,.092,C.lapis,3);g.box(0,.748,-.018,.015,.004,.025,C.or,3);for(const sx of [-1,1])g.box(sx*.059,.787,-.04,.004,.066,.004,C.or,3); // la barbe tressée et ses lanières
    g.pop();
    return g.fin();}
  ,
  // LE BRASERO (haut 1) : le pied de pierre, la vasque d'or, la flamme (matière 22 : elle s'allume de l'intérieur — la nuit, c'est elle qui éclaire l'allée)
  brasero:function(){const g=dnKit(103),C=DN_COL;g.cyl(0,0,0,.34,.26,.05,10,C.gres2,1,0,1);g.cyl(0,.05,0,.14,.12,.62,8,C.gres,1,0,0);g.lathe(0,0,[[.10,.66],[.26,.76],[.34,.98],[.30,1.0]],10,C.or,3);
    g.cyl(0,.90,0,.22,0,.55,7,[1,.50,.08],22);g.cyl(0,.92,0,.15,0,.78,6,[1,.80,.22],22);return g.fin();},
  // LE PAPYRUS (2026-10-22, la vie de l'oasis : « papyrus et lotus bleus ») : une touffe, haut 1 — huit tiges triangulaires en éventail, chacune son ombelle de filaments
  papyrus:function(){const g=dnKit(97),a=[.24,.52,.18],b=[.34,.62,.24],u=[.62,.76,.34];
    for(let i=0;i<8;i++){const an=i/8*6.283+.3*(i&1),sp=.10+.05*(i%3),hh=.74+.26*((i*5)%4)/3,bx=Math.cos(an)*.05,bz=Math.sin(an)*.05,tx=Math.cos(an)*sp,tz=Math.sin(an)*sp;
      g.tube([bx,0,bz],[tx,hh,tz],.016,.009,5,i&1?a:b,0);g.sph(tx,hh+.02,tz,.075,.04,.075,3,7,u,0);
      for(let k=0;k<5;k++){const aa=k/5*6.283;g.tube([tx,hh+.02,tz],[tx+Math.cos(aa)*.11,hh-.04,tz+Math.sin(aa)*.11],.005,.003,3,u,0);}}
    return g.fin();},
  // LE LOTUS BLEU (flotte, rayon .55) : la feuille ronde, huit pétales relevés, un cœur d'or
  lotus:function(){const g=dnKit(99),pad=[.20,.50,.22],bl=[.40,.58,.98],ye=[1,.85,.30];
    g.cyl(0,0,0,.55,.55,.02,10,pad,0,0,1);for(let i=0;i<8;i++){const an=i/8*6.283;g.tube([Math.cos(an)*.04,.02,Math.sin(an)*.04],[Math.cos(an)*.19,.17,Math.sin(an)*.19],.055,.012,5,bl,0,1);}
    g.sph(0,.05,0,.05,.04,.05,3,6,ye,0);return g.fin();},
  // LA FELOUQUE (long 1, vers +z) : la coque lofée (la proue relevée), le pont, le mât, la voile latine, des bastingages
  felouque:function(){const g=dnKit(101),C=DN_COL,wd=[.54,.38,.24],wd2=[.42,.30,.18],vo=[.98,.94,.84],Rz=(z,rx,ry,cy)=>({p:[0,cy,z],u:[rx,0,0],w:[0,ry,0],n:2.4});
    g.loft([Rz(-.50,.06,.09,.28),Rz(-.34,.15,.12,.22),Rz(-.08,.19,.14,.20),Rz(.22,.16,.13,.23),Rz(.40,.09,.10,.31),Rz(.50,.03,.07,.40)],12,wd,0,3);
    g.box(0,.31,-.02,.30,.02,.80,wd2,0);g.tube([0,.32,.05],[0,1.0,.05],.014,.008,6,wd2,0,1);
    g.tube([0,.96,-.34],[0,.60,.50],.008,.006,5,wd2,0);g.quad([0,.96,-.33],[0,.62,.49],[0,.36,.04],[0,.40,-.2],vo,0,null,.02);
    g.sph(0,.30,-.44,.05,.05,.05,3,6,C.or,3);g.box(0,.42,.40,.012,.12,.1,wd2,0);return g.fin();},
  // LE CHAMEAU (long 1, haut ~ .88, vers +z) : corps et bosse lisses, cou en deux tubes, tête, quatre jambes à genou, queue ; `bl` = la couleur de la couverture
  chameau:function(bl){const g=dnKit(61),ro=[.80,.60,.38],ro2=[.68,.48,.30],C=DN_COL;bl=bl||C.terre;g.sph(0,.55,0,.115,.135,.30,6,10,ro,0);g.sph(0,.73,-.05,.08,.11,.11,5,8,ro2,0);
    g.tube([0,.62,.22],[0,.80,.33],.062,.044,8,ro,0);g.sph(0,.86,.39,.048,.05,.09,5,8,ro,0);g.sph(0,.84,.47,.03,.03,.045,4,6,ro2,0);
    for(const [x,z] of [[.065,.20],[-.065,.20],[.065,-.20],[-.065,-.20]]){const f=z>0?1:-1;g.tube([x,.48,z],[x,.25,z+.03*f],.042,.03,6,ro,0);g.tube([x,.25,z+.03*f],[x,.015,z],.03,.022,6,ro2,0);g.box(x,0,z,.05,.02,.07,C.noir,0);}
    g.tube([0,.58,-.30],[0,.40,-.36],.014,.008,5,ro2,0,1);g.box(0,.675,.02,.25,.05,.30,bl,0);g.box(.135,.58,.02,.04,.15,.22,C.lapis,0);g.box(-.135,.58,.02,.04,.15,.22,C.lapis,0);return g.fin();},
  // LE PALMIER (h = 1) : le fût qui penche, anneaux, sept palmes arquées à folioles, un régime de dattes
  palmier:function(){const g=dnKit(71),b1=[.50,.36,.22],b2=[.42,.30,.18];let px=0;const hh=[0,.16,.33,.50,.67,.83,.92];
    for(let i=0;i<6;i++){const x0=px;px+=.012+i*.007;g.tube([x0,hh[i],0],[px,hh[i+1],0],.038-i*.0035,.034-i*.0035,7,i&1?b1:b2,0,i===5);}
    const top=[px,.93,0],ve=[.24,.52,.16],v2=[.30,.60,.20];
    for(let k=0;k<9;k++){const a=k/9*6.28319+.3,ca=Math.cos(a),sa=Math.sin(a),L=.40+.06*((k*7)%3),w=.065;
      const pr=[top,[top[0]+ca*L*.34,top[1]+.075,top[2]+sa*L*.34],[top[0]+ca*L*.68,top[1]+.07,top[2]+sa*L*.68],[top[0]+ca*L,top[1]-.08,top[2]+sa*L]];
      for(let i=0;i<3;i++){const A=pr[i],B=pr[i+1],px2=-sa*w*(1-i*.28),pz2=ca*w*(1-i*.28),qx=-sa*w*(1-(i+1)*.28),qz=ca*w*(1-(i+1)*.28);
        g.quad([A[0]+px2,A[1],A[2]+pz2],[A[0]-px2,A[1],A[2]-pz2],[B[0]-qx,B[1],B[2]-qz],[B[0]+qx,B[1],B[2]+qz],k&1?ve:v2,0,null,.04);}}
    for(let i=0;i<4;i++){g.sph(top[0]+(i-1.5)*.012,.89,.012*(i&1?1:-1),.014,.02,.014,3,5,[.62,.34,.12],0);}return g.fin();},
  // LES PYRAMIDES (demi-base 1, h 1) : à GRADINS (assises en retrait), LISSE (parement de calcaire), À DEGRÉS (Djoser) — pierre en assises, coiffe d'or, une porte sombre au pied
  pyrGradins:function(){const g=dnKit(81),C=DN_COL,N=20;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);for(let i=0;i<N;i++){const y0=i/N*.97+.012,y1=(i+1)/N*.97+.012,r0=(1-i/N)*1,r1=r0-.0035;g.frus(0,y0,0,r0*2,r0*2,r1*2,r1*2,y1-y0,i&1?C.gres:[.94,.78,.55],1,0,0,0,.04);
      if(i<N-1){const rn=(1-(i+1)/N)*1;g.frus(0,y1,0,r1*2,r1*2,rn*2,rn*2,.0008,C.gres2,1);}}
    g.frus(0,.97,0,.10,.10,0,0,.04,C.or,3);g.box(0,.012,-.995,.12,.10,.03,C.noir,0);return g.fin();},
  pyrGiza:function(){return dnPyrGiza(0);},pyrCap:function(){return dnPyrGiza(1);},pyrRouge:function(){return dnPyrGiza(2);},
  pyrLisse:function(){const g=dnKit(83),C=DN_COL;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);g.frus(0,.012,0,2,2,.14,.14,.93,C.cre,1,0,0,0,.025);g.frus(0,.942,0,.14,.14,0,0,.058,C.or,3);g.box(0,.012,-.995,.14,.11,.03,C.noir,0);return g.fin();},
  pyrDegres:function(){const g=dnKit(85),C=DN_COL,N=6;g.box(0,0,0,2.7,.012,2.7,C.gres2,1,1);for(let i=0;i<N;i++){const y0=i/N*.96+.012,y1=(i+1)/N*.96+.012,r0=1-i/(N+.6),r1=1-(i+1)/(N+.6);g.frus(0,y0,0,r0*2,r0*2,r0*1.97,r0*1.97,y1-y0-.004,i&1?C.gres:C.cre,1,0,0,0,.04);g.frus(0,y1-.004,0,r0*1.97,r0*1.97,r1*2,r1*2,.004,C.gres2,1);}
    g.frus(0,.972,0,.12,.12,0,0,.03,C.or,3);return g.fin();}
  ,
  // le fût seul (l'obélisque BRISÉ : le dessus en dents de scie) et ses blocs
  obeliskTronc:function(){const g=dnKit(13),b=4,h=64,C=DN_COL;g.box(0,0,0,4.6*b,.7*b,4.6*b,C.gres2,1,1);g.box(0,.7*b,0,3.5*b,.6*b,3.5*b,C.gres,1);const y0=1.3*b,hs=h*.86-y0,w0=2*b,w1=1.58*b;
    g.frus(0,y0,0,w0,w0,w1,w1,hs,C.granit,4,0,0,0,.03);for(const f of [.10,.34,.58,.82]){const ww=w0+(w1-w0)*f;g.frus(0,y0+hs*f,0,ww*1.035,ww*1.035,ww*1.035,ww*1.035,h*.014,C.or,3);}
    for(let k=0;k<5;k++){const a=k/5*6.28319,x=Math.cos(a)*w1*.3,z=Math.sin(a)*w1*.3;g.frus(x,y0+hs-1,z,w1*.42,w1*.42,w1*.2,w1*.2,2+((k*7)%3),C.granit,4);}return g.fin();},
  // LA PORTE (un pylône double, h = 30 : deux tours en fruit de 14 × 9 de part et d'autre d'une baie de 12 m, un linteau gravé, une corniche, des mâts, des marches)
  porte:function(){const g=dnKit(27),C=DN_COL,h=30,w0=14,d0=9,w1=11.4,d1=7,gap=12;
    for(const sx of [-1,1]){g.push();g.T(sx*(gap/2+w0/2),0,0);g.box(0,0,0,w0*1.12,1.1,d0*1.14,C.gres2,1,1);g.frus(0,1.1,0,w0,d0,w1,d1,h-1.1,C.gres,1,0,0,0,.05);g.box(0,h-.2,0,w1*1.1,1.6,d1*1.14,C.gres2,1);g.box(0,h+1.3,0,w1*1.16,.7,d1*1.2,C.or,3);
      g.box(0,h*.40,-d0/2+.03,6.4,h*.28,.5,C.gres,4);g.box(0,h*.40+.2,-d0/2+.04,6.0,.5,.55,C.or,3);g.box(0,h*.40+h*.28-.7,-d0/2+.04,6.0,.5,.55,C.lapis,3);
      for(const tx of [-1,1]){g.tube([tx*3.6,.5,-d0/2-.4],[tx*3.6,h*.98,-d0/2-.4],.32,.26,6,C.noir,0);g.sph(tx*3.6,h*.98+.3,-d0/2-.4,.42,.42,.42,3,6,C.or,3);dnFlag(g,tx*3.6+.3,h*.98-3.4,-d0/2-.4,8.5,3.4,[C.terre,C.or,C.azur,C.or],8);}g.pop();}
    g.box(0,h*.66,0,gap+3,5,d1*1.05,C.gres,4);g.box(0,h*.66+4.7,0,gap+3.6,1.4,d1*1.2,C.gres2,1);g.box(0,h*.66+.3,-d0/2+.5,gap+.5,.5,.3,C.or,3);g.box(0,0,-d0/2-1.5,gap+6,.6,3,C.gres2,1,1);return g.fin();},
  // LE BLOC : un cube posé (centre en x et z, de 0 à 1) — assises de pierre, teinté à la pose ; la MAISON de terre en est faite
  bloc:function(){const g=dnKit(5);g.box(0,0,0,1,1,1,[1,1,1],1,1);return g.fin();},
  blocPlein:function(){const g=dnKit(6);g.box(0,0,0,1,1,1,[1,1,1],0,1);return g.fin();}
  ,
  // LE TAMBOUR (un morceau de colonne tombé : rayon 1,15, haut 1) et LA TÊTE (un fragment de colosse : nemès de lapis, visage de pierre lisse, uræus d'or ; haut ~ 1)
  tambour:function(){const g=dnKit(7),C=DN_COL;g.cyl(0,0,0,1.15,1.15,1,12,C.gres,1,0,1);g.cyl(0,.98,0,1.0,1.0,.06,12,C.gres2,1);return g.fin();},
  tete:function(){const g=dnKit(9),C=DN_COL,cre=[.95,.84,.66]; // LA TÊTE d'un colosse tombé (haut ~ 1,3, regarde +z) : un dôme de nemès à bandes lapis/or, un visage ovoïde de pierre lisse (nez, yeux de khôl, bouche), l'uræus d'or — tout lisse (matière 0), les assises ne vont pas aux courbes
    const R=.66;for(let k=0;k<7;k++){const y0=.02+k*.16,y1=y0+.16,r=y=>R*Math.sqrt(Math.max(.03,1-Math.pow((y-.62)/.74,2)));g.lathe(0,-.08,[[r(y0),y0],[r(y1),y1]],14,k&1?C.or:C.lapis,0);}
    g.sph(0,.58,.40,.40,.54,.30,5,12,cre,0);                                                                                       // le visage
    g.frus(0,.44,.66,.12,.16,.06,.07,.30,cre,0);                                                                                    // le nez
    g.box(-.19,.70,.66,.20,.07,.06,C.noir,0);g.box(.19,.70,.66,.20,.07,.06,C.noir,0);g.box(0,.26,.64,.26,.05,.06,C.noir,0);         // les yeux, la bouche
    g.frus(0,.98,.62,.10,.08,.04,.04,.22,C.or,3);                                                                                   // l'uræus
    return g.fin();}
  ,
  // LE VAUTOUR (envergure 6,6, vers +z) : corps, cou, tête nue rose, queue, deux ailes arquées à longues rémiges écartées — il plane (aucun battement), les ailes un peu relevées
  vautour:function(){const g=dnKit(91),nr=[.20,.15,.12],br=[.34,.26,.20],pl=[.52,.42,.32],ro=[.74,.40,.36],bk=[.10,.08,.07];
    g.sph(0,0,.12,.20,.17,.72,5,8,nr,0);g.tube([0,.06,.72],[0,.15,1.0],.085,.06,6,br,0);g.sph(0,.17,1.07,.075,.065,.11,4,6,ro,0);g.frus(0,.15,1.16,.05,.04,.02,.015,.10,bk,0,0,0);
    g.quad([-.18,0,-.45],[.18,0,-.45],[.13,.01,-1.05],[-.13,.01,-1.05],br,0);
    for(const sd of [-1,1]){const W=[[sd*.14,.04,.38],[sd*1.5,.28,.52],[sd*2.65,.36,.22],[sd*3.25,.18,-.12],[sd*1.7,.20,-.45],[sd*.14,.02,-.30]];
      g.tri(W[0],W[1],W[5],nr,0,.06);g.tri(W[1],W[4],W[5],br,0,.06);g.tri(W[1],W[2],W[4],nr,0,.06);g.tri(W[2],W[3],W[4],pl,0,.06);
      for(let k=0;k<5;k++){const z=.26-k*.09,x0=sd*(2.62+k*.02),x1=sd*(3.55+.07*(k&1)),y9=.34-k*.06;g.tri([x0,y9,z],[x1,y9-.10,z-.04],[x0,y9,z-.09],k&1?nr:br,0,.05);}}return g.fin();}
};
function dnMod(nom){if(!DN.kit)DN.kit={};if(!DN.kit[nom])DN.kit[nom]=DN_MOD[nom]();return DN.kit[nom];}
/* LA GALERIE (banc) : tous les modèles (ou la liste `noms`) posés en rang sur le sable, à 150 m de la route à l'abscisse `s`, et la caméra devant eux — pour juger la forme et la matière */
const DN_ECH={brasero:3,papyrus:2,lotus:2,felouque:12,sphinx:40,colosse:30,pharaon:30,chameau:12,palmier:18,pyrGradins:30,pyrLisse:30,pyrDegres:30,pyrGiza:30,pyrCap:30,pyrRouge:30,tete:8,tambour:5,vautour:14,bloc:6,blocPlein:6}; // la taille d'affichage des modèles unitaires (m) — la galerie seulement
function dnGalerie(s,noms,cap,haut,recul){
  if(!DN.on||!DN.S)return 'pas de dunes';const M9=dnMats(),S=DN.S,i=Math.max(0,Math.min(S.n-1,Math.round((s||300)/S.ds)));
  if(DN.gal){scene.remove(DN.gal);DN.gal.traverse(function(o){if(o.geometry)o.geometry.dispose();});}
  const grp=new THREE.Group(),nm=noms&&noms.length?noms:Object.keys(DN_MOD),tx=S.tx[i],tz=S.tz[i],lx=-tz,lz=tx,bx=S.x[i]+lx*150,bz=S.z[i]+lz*150,out=[];let off=0,ymax=-1e9;
  const tot=nm.map(function(n){const g=dnMod(n),ec=DN_ECH[n]||1;g.computeBoundingBox();return Math.max(g.boundingBox.max.x-g.boundingBox.min.x,g.boundingBox.max.z-g.boundingBox.min.z)*ec+12;}).reduce(function(a,b){return a+b;},0);
  for(let u=-60;u<=tot+60;u+=10)for(let w=-120;w<=120;w+=20)ymax=Math.max(ymax,dnHauteur(bx+tx*u+lx*w,bz+tz*u+lz*w));
  const y0=ymax+6; // un plateau plat de sable, posé au-dessus du relief : on juge les formes et la matière sous la lumière du jeu, sans le sable autour
  const pg=dnGeo();{const R=Math.max(200,tot);const A=[bx-tx*60-lx*R,y0,bz-tz*60-lz*R],B=[bx-tx*60+lx*R,y0,bz-tz*60+lz*R],Cc=[bx+tx*(tot+R)+lx*R,y0,bz+tz*(tot+R)+lz*R],D=[bx+tx*(tot+R)-lx*R,y0,bz+tz*(tot+R)-lz*R];pg.quad(A,B,Cc,D,[.96,.80,.52]);}
  const gm=pg.fin();grp.add(Object.assign(new THREE.Mesh(gm,M9.t),{frustumCulled:false}));
  for(const n of nm){const g=dnMod(n),ec=DN_ECH[n]||1;g.computeBoundingBox();const bb=g.boundingBox,w=(bb.max.x-bb.min.x)*ec,d=(bb.max.z-bb.min.z)*ec,w9=Math.max(w,d)+12;off+=w9/2;
    const x=bx+tx*off,z=bz+tz*off,me=new THREE.Mesh(g,M9.t);me.position.set(x,y0,z);me.scale.setScalar(ec);me.frustumCulled=false;me.matrixAutoUpdate=false;me.updateMatrix();grp.add(me);out.push({n:n,x:Math.round(x),y:Math.round(y0),z:Math.round(z),w:Math.round(w9)});off+=w9/2;}
  scene.add(grp);grp.updateMatrixWorld(true);DN.gal=grp;
  const mx=bx+tx*off/2,mz=bz+tz*off/2,R=recul==null?Math.max(120,off*.9):recul;
  return {modeles:out,largeur:Math.round(off),y:Math.round(y0),centre:[Math.round(mx),Math.round(y0),Math.round(mz)],oeil:[Math.round(mx-lx*R),Math.round(y0+(haut==null?14:haut)),Math.round(mz-lz*R)],tangente:[+tx.toFixed(3),+tz.toFixed(3)],lateral:[+lx.toFixed(3),+lz.toFixed(3)]};}
/* ===== LES DIEUX À TÊTE D'ANIMAL ET LE SPHINX-CHAT (2026-10-23, Léo : « fais un sphynx chat égyptien plutôt, et quelques statues avec des têtes d'animaux choisis ») =====
   Six statues assises (le corps du pharaon, style A : trône cubique, mains à plat, collier usekh, tablier plissé — avec une TÊTE de dieu) : HORUS le faucon (double couronne), ANUBIS le chacal (noir, grandes oreilles),
   THOT l'ibis (long bec courbe, croissant de lune), AMON le bélier (cornes d'or, disque), SEKHMET la lionne (disque et uræus), SOBEK le crocodile (long museau, deux plumes) — et LE SPHINX-CHAT (Bastet couchée, oreilles
   dressées, yeux de khôl, collier usekh) en trois livrées. Tout en FACETTES FRANCHES (anneaux de 8 à 14 pans, plans nets, rien de plus fin que la matière de la pierre) : la matière des décors les lit plates.
   Les colosses de la place tirent quatre dieux distincts (`dnDieuxTirage`, dans le flux du décor : D.sd — jamais le tracé), la porte du départ est gardée par deux petits dieux, l'allée des obélisques est une allée de chats.
   `?sans=dunesdieux` rend le pharaon assis et le sphinx de Gizeh d'avant. Console : `dbgDunes('galerie', s, ['dieuFaucon','sphinxChat0d'])` (voir DN_ECH). */
const DN_DIEUX={on:!/[?&]sans=([^&]*,)?dunesdieux(,|&|$)/.test(location.search),liste:['faucon','chacal','ibis','belier','lionne','crocodile'],nom:{faucon:'dieuFaucon',chacal:'dieuChacal',ibis:'dieuIbis',belier:'dieuBelier',lionne:'dieuLionne',crocodile:'dieuCrocodile',pharaon:'pharaon'}};
/* le corps du pharaon assis (celui de DN_MOD.pharaon, à l'identique — mêmes pièces, mêmes tailles), sans la tête : ns = les pans des cuisses et des tibias, le torse en a ns + 4 */
function dnCorpsAssis(g,ns){ns=ns||8;const C=DN_COL,gr=C.gres,g2=C.gres2,cre=[.97,.87,.70],rg=[.93,.78,.58],nt=ns+4,nb=Math.min(7,ns);
  const Ry=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.4}),Rz=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.4});
  g.box(0,0,0,.70,.03,.84,g2,1,1);g.box(0,.03,0,.64,.03,.78,gr,1);g.box(0,.052,.405,.52,.012,.012,gr,4);
  g.box(0,.06,-.05,.44,.32,.50,gr,1);g.box(0,.38,-.285,.44,.44,.07,gr,1);g.box(0,.82,-.285,.40,.03,.065,g2,1);
  for(const sx of [-1,1]){g.box(sx*.223,.13,-.05,.014,.20,.30,C.or,3);g.box(sx*.226,.14,-.05,.012,.16,.24,C.lapis,3);g.box(sx*.227,.16,-.05,.01,.045,.14,C.or,3);}
  for(const sx of [-1,1]){const X=sx*.108;
    g.loft([Rz(-.12,.086,.070,2.6,X,.455),Rz(.04,.090,.072,2.6,X,.455),Rz(.17,.086,.068,2.6,X,.452),Rz(.245,.066,.060,2.4,X,.45)],ns,gr,5,3);
    g.loft([Ry(.45,.066,.062,2.4,X,.262),Ry(.31,.060,.058,2.4,X,.268),Ry(.18,.058,.055,2.4,X,.272),Ry(.098,.063,.060,2.4,X,.274)],ns,gr,5,3);
    g.box(X,.06,.335,.12,.04,.21,g2,1);g.sph(X,.080,.44,.058,.024,.030,3,6,gr,5);}
  g.box(0,.51,.10,.30,.026,.23,rg,5);for(let i=-3;i<=3;i++)g.box(i*.044,.536,.10,.017,.004,.23,i&1?C.or:cre,3);g.box(0,.51,.22,.30,.04,.012,C.or,3);
  g.loft([Ry(.505,.135,.082,2.8,0,-.085),Ry(.56,.145,.086,2.8,0,-.085),Ry(.63,.168,.094,3,0,-.085),Ry(.662,.186,.098,3.2,0,-.085),Ry(.684,.200,.099,3.4,0,-.085),Ry(.702,.205,.097,3.4,0,-.085),Ry(.722,.178,.082,2.8,0,-.085),Ry(.738,.120,.066,2.4,0,-.085),Ry(.752,.058,.054,2.2,0,-.082)],nt,[gr,gr,gr,C.or,C.turq,C.or,C.azur,gr],[5,5,5,3,3,3,3,5],3);
  g.box(0,.505,.0,.272,.024,.022,C.or,3);g.box(0,.507,.012,.052,.032,.012,C.lapis,3);
  for(const sx of [-1,1]){g.tube([sx*.205,.70,-.085],[sx*.215,.60,-.06],.050,.043,nb,gr,5,1);g.sph(sx*.215,.595,-.06,.045,.042,.045,3,6,gr,5);
    g.tube([sx*.215,.595,-.06],[sx*.14,.555,.115],.043,.036,nb,gr,5,1);g.tube([sx*.147,.558,.095],[sx*.14,.555,.12],.046,.046,nb,C.or,3,1);g.sph(sx*.128,.552,.19,.047,.020,.078,3,6,cre,5);}}
/* ---- LES TÊTES (repère local : l'origine au centre de la base du cou, +z devant, +y en haut ; le tout à l'échelle s de la tête) ---- */
const DN_TR=(y,rx,rz,n,cx,cz)=>({p:[cx||0,y,cz||0],u:[rx,0,0],w:[0,0,rz],n:n||2.3}),DN_TZ=(z,rx,ry,n,cx,cy)=>({p:[cx||0,cy||0,z],u:[rx,0,0],w:[0,ry,0],n:n||2.3});
const DN_PD={rouge:[.88,.32,.24],blanc:[1,.97,.90],basalte:[.58,.55,.70],fauve:[.98,.52,.38],noir:[.10,.09,.10],crane:[.97,.87,.70],granit:[.74,.50,.45],vert:[.20,.64,.50],papyrus:[.55,.78,.42]};
function dnLappets(g,cols){for(const sx of [-1,1])for(let i=0;i<4;i++)g.box(sx*(.094+.004*i),.088-i*.0385,.026,.044+.005*i,.037,.076,cols[i&1],3);}       // les lappets de la perruque, sur la poitrine
function dnOeil(g,sx,x,y,z,r,or){const C=DN_COL;g.box(sx*x,y-r*.8,z-r*.6,r*1.4,r*1.7,r*1.6,or||C.or,3);g.box(sx*(x+r*.55),y-r*.5,z-r*.1,r*.7,r*1.1,r*1.2,C.noir,0);}       // un œil : un anneau d'or, une pupille noire
function dnDisque(g,y,z,r,ep){const C=DN_COL;g.sph(0,y,z,r,r,ep||r*.4,4,10,C.or,3);g.frus(0,y-r*.7,z+ep*.2+.004,.012,.014,.006,.008,r*.55,C.or,3);}             // le disque solaire (une lentille d'or) et son uræus
const DN_TETE={
  // HORUS : le crâne, le bec d'or à crochet, l'œil d'Horus (le trait sous l'œil et sa queue), la double couronne rouge et blanche, l'uræus
  faucon:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR;g.cyl(0,-.012,-.002,.050,.044,.042,8,p,5);
    g.loft([R(.030,.040,.046,2.2,0,.004),R(.066,.054,.058,2.3,0,.010),R(.104,.060,.062,2.3,0,.012),R(.140,.052,.054,2.3,0,.010),R(.166,.030,.034,2.2,0,.008)],10,p,5,3);
    g.tube([0,.084,.040],[0,.072,.124],.032,.012,6,C.or,3,1);g.tube([0,.072,.124],[0,.034,.142],.014,.004,5,C.or,3,1);
    for(const sx of [-1,1]){dnOeil(g,sx,.056,.108,.036,.016);g.box(sx*.062,.064,.044,.006,.040,.012,C.noir,0);g.box(sx*.063,.100,.002,.006,.008,.060,C.noir,0);}
    dnLappets(g,[C.lapis,C.or]);g.frus(0,.160,-.004,.112,.116,.094,.094,.036,DN_PD.rouge,3,0,0,1);g.frus(0,.194,-.006,.070,.072,.042,.042,.100,DN_PD.blanc,3,0,0,1);g.sph(0,.298,-.006,.034,.038,.034,3,8,DN_PD.blanc,3);g.frus(0,.158,.052,.016,.022,.008,.010,.042,C.or,3);},
  // ANUBIS : le chacal noir, le museau long, la truffe, les deux grandes oreilles droites doublées d'or, les yeux d'or
  chacal:function(g,P){const C=DN_COL,p=DN_PD.basalte,R=DN_TR;g.cyl(0,-.012,-.002,.050,.044,.042,8,p,5);
    g.loft([R(.030,.038,.046,2.2,0,.004),R(.064,.050,.056,2.3,0,.008),R(.100,.054,.058,2.3,0,.010),R(.134,.046,.048,2.3,0,.008),R(.156,.028,.032,2.2,0,.006)],10,p,5,3);
    g.tube([0,.076,.034],[0,.056,.156],.034,.016,7,p,5,1);g.sph(0,.056,.162,.018,.016,.019,3,6,DN_PD.noir,0);g.box(0,.044,.080,.026,.008,.060,DN_PD.noir,0);
    for(const sx of [-1,1]){g.frus(sx*.038,.132,-.012,.060,.030,.012,.010,.160,p,5,sx*.014,-.012);g.frus(sx*.038,.136,.000,.036,.012,.008,.006,.134,C.or,3,sx*.014,-.012);dnOeil(g,sx,.050,.098,.040,.012);g.box(sx*.056,.088,.020,.006,.006,.050,C.or,3);}
    dnLappets(g,[C.lapis,C.or]);},
  // THOT : l'ibis, le long bec courbe qui plonge, le croissant de lune et son disque
  ibis:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR,bk=[.17,.15,.19];g.cyl(0,-.012,-.002,.046,.040,.042,8,p,5);
    g.loft([R(.030,.036,.040,2.2,0,.004),R(.064,.048,.050,2.3,0,.008),R(.100,.050,.050,2.3,0,.008),R(.128,.040,.042,2.3,0,.006),R(.148,.022,.024,2.2,0,.004)],10,p,5,3);
    {const A=[[0,.082,.030],[0,.070,.110],[0,.048,.166],[0,.010,.204],[0,-.036,.214]],r=[.022,.017,.012,.007,.002];for(let i=0;i<4;i++)g.tube(A[i],A[i+1],r[i],r[i+1],6,bk,0,i===3);}
    for(const sx of [-1,1])dnOeil(g,sx,.048,.108,.026,.012);dnLappets(g,[C.lapis,C.or]);
    {const pl=[],R9=.082,r9=.060;for(let i=0;i<=8;i++){const a=3.40+i/8*2.62;pl.push([Math.cos(a)*R9,Math.sin(a)*R9]);}for(let i=8;i>=0;i--){const a=3.40+i/8*2.62;pl.push([Math.cos(a)*r9,Math.sin(a)*r9+.024]);}
      g.push();g.T(0,.226,.010);g.Rx(-Math.PI/2);g.ext(pl,0,.020,C.or,3);g.pop();}
    g.push();g.T(0,.236,0);g.Rx(Math.PI/2);g.cyl(0,-.010,0,.040,.040,.020,12,C.or,3);g.pop();},
  // AMON : le bélier, le nez busqué, les cornes d'or en volute, le disque et l'uræus, deux plumes
  belier:function(g,P){const C=DN_COL,p=P.peau,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.042,.050,2.2,0,.004),R(.066,.056,.060,2.3,0,.010),R(.104,.060,.062,2.3,0,.012),R(.138,.050,.052,2.3,0,.010),R(.160,.030,.034,2.2,0,.008)],10,p,5,3);
    g.sph(0,.084,.056,.038,.036,.056,4,8,p,5);g.tube([0,.074,.040],[0,.038,.112],.046,.034,8,p,5,1);g.sph(0,.034,.116,.035,.031,.033,3,8,p,5);for(const sx of [-1,1]){g.box(sx*.016,.036,.146,.010,.012,.008,DN_PD.noir,0);dnOeil(g,sx,.056,.100,.040,.013);g.box(sx*.062,.094,-.040,.020,.044,.026,p,5);}
    for(const sx of [-1,1]){const H=[[sx*.054,.112,.004],[sx*.104,.124,-.030],[sx*.132,.082,-.052],[sx*.116,.032,-.014],[sx*.080,.026,.036]],r=[.028,.026,.021,.015,.006];for(let i=0;i<4;i++)g.tube(H[i],H[i+1],r[i],r[i+1],6,C.or,3,i===3);}
    dnDisque(g,.200,-.004,.060,.026);for(const sx of [-1,1])g.frus(sx*.024,.230,-.010,.034,.022,.026,.014,.140,sx<0?C.lapis:C.turq,3);},
  // SEKHMET : la lionne, le museau large, la truffe, les oreilles rondes, le disque solaire et l'uræus, la perruque
  lionne:function(g,P){const C=DN_COL,p=DN_PD.fauve,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.044,.048,2.2,0,.004),R(.066,.058,.060,2.3,0,.010),R(.104,.064,.064,2.3,0,.012),R(.138,.056,.056,2.3,0,.010),R(.160,.034,.038,2.2,0,.008)],10,p,5,3);
    g.sph(0,.094,-.066,.110,.108,.052,3,8,[.84,.38,.28],5);g.frus(0,.030,.040,.084,.090,.060,.052,.062,p,5,0,.070);g.box(0,.092,.134,.034,.022,.022,DN_PD.noir,0);g.box(0,.042,.146,.046,.006,.010,DN_PD.noir,0);
    for(const sx of [-1,1]){g.sph(sx*.056,.160,-.014,.032,.034,.016,3,6,p,5);dnOeil(g,sx,.052,.104,.046,.012);g.box(sx*.056,.094,.030,.006,.006,.044,DN_PD.noir,0);}
    dnLappets(g,[C.turq,C.or]);dnDisque(g,.208,-.006,.064,.026);},
  // SOBEK : le crocodile, le long museau plat, la bosse du bout, les yeux en bulbes, la mâchoire, deux hautes plumes
  crocodile:function(g,P){const C=DN_COL,p=DN_PD.vert,Z=DN_TZ,R=DN_TR;g.cyl(0,-.012,-.002,.052,.046,.042,8,p,5);
    g.loft([R(.030,.046,.052,2.2,0,.004),R(.062,.056,.062,2.3,0,.008),R(.094,.052,.056,2.3,0,.006),R(.116,.036,.040,2.2,0,.004)],10,p,5,3);
    g.loft([Z(.030,.050,.036,2.4,0,.062),Z(.090,.043,.030,2.4,0,.058),Z(.150,.036,.026,2.4,0,.054),Z(.200,.034,.028,2.4,0,.054),Z(.224,.020,.017,2.2,0,.050)],8,p,5,3);
    g.loft([Z(.050,.042,.014,2.4,0,.030),Z(.140,.030,.012,2.4,0,.028),Z(.210,.022,.011,2.4,0,.034)],6,DN_PD.crane,5,3);
    for(const sx of [-1,1]){dnOeil(g,sx,.036,.104,.022,.014);g.box(sx*.014,.070,.214,.012,.010,.012,DN_PD.noir,0);}
    dnLappets(g,[C.lapis,C.or]);for(const sx of [-1,1])g.frus(sx*.028,.122,-.010,.040,.024,.030,.014,.200,sx<0?C.azur:C.or,3);dnDisque(g,.140,.016,.038,.018);}
};
/* un dieu assis : le corps du pharaon et la tête de `kind` (peau : la teinte de la pierre de la tête ; s : l'échelle de la tête) — haut ~ 1,05, face à +z */
function dnDieu(kind,seed){const g=dnKit(seed||201),S={faucon:1.55,chacal:1.50,ibis:1.62,belier:1.50,lionne:1.50,crocodile:1.50}[kind]||1.3;dnCorpsAssis(g,8);
  g.push();g.T(0,.744,-.07);g.Sc(S);DN_TETE[kind](g,{peau:DN_PD.crane});g.pop();return g.fin();}
/* LA TÊTE TOMBÉE d'un dieu (les ruines) : le bloc du cou brisé et la tête, haut ~ 1,7, regarde +z */
function dnTeteTombee(kind,seed){const g=dnKit(seed),C=DN_COL;g.box(0,0,0,.62,.20,.54,C.gres,1,1);g.push();g.T(0,.18,0);g.Sc(4.6);DN_TETE[kind](g,{peau:DN_PD.crane});g.pop();return g.fin();}
/* ---- LE SPHINX-CHAT (long 1, face à +z, haut ~ .60, ts = le côté où sa queue s'enroule) : trois livrées ---- */
function dnTeteChat(g,V){const C=DN_COL,p=V.peau,R=DN_TR;
  g.cyl(0,-.040,0,.062,.054,.060,10,p,5);
  g.loft([R(.000,.054,.050,2.3,0,.000),R(.034,.070,.062,2.4,0,.006),R(.070,.076,.066,2.4,0,.008),R(.104,.066,.058,2.3,0,.006),R(.128,.040,.038,2.2,0,.004)],10,p,5,3);       // le crâne large de la chatte
  g.frus(0,.026,.050,.068,.052,.044,.036,.048,p,5,0,.018);g.frus(0,.056,.096,.024,.018,.014,.012,.018,V.nez,0);g.box(0,.028,.108,.034,.007,.010,DN_PD.noir,0);       // le museau, la truffe, la bouche
  for(const sx of [-1,1]){
    g.frus(sx*.054,.098,-.004,.066,.032,.014,.008,.100,p,5,sx*.016,-.008);g.frus(sx*.054,.102,.008,.044,.014,.009,.005,.084,V.oreille,3,sx*.016,-.008);   // l'oreille dressée, son dedans d'or, l'anneau
    g.box(sx*.036,.066,.056,.044,.024,.016,V.khol,3);g.box(sx*.037,.070,.061,.028,.015,.014,V.iris,3);g.box(sx*.052,.070,.048,.044,.009,.014,V.khol,3);                // l'œil en amande, son iris, le trait de khôl qui file vers l'oreille
    g.box(sx*.040,.050,.080,.060,.004,.006,C.or,3);g.box(sx*.040,.040,.080,.060,.004,.006,C.or,3);                                                                   // les vibrisses, en barres d'or
  }
  if(V.disque){dnDisque(g,.150,-.004,.036,.016);}}
function dnSphinxChat(v,ts){const g=dnKit(260+v*7+(ts>0?1:0)),C=DN_COL,R=DN_TR,Z=DN_TZ,
    V=[{c:C.gres,c2:C.gres2,peau:C.gres,nez:[.85,.52,.52],oreille:C.or,khol:C.lapis,iris:C.or,col:[C.or,C.azur,C.turq,C.or],soc:C.gres2},
       {c:DN_PD.basalte,c2:C.granit,peau:DN_PD.basalte,nez:[.20,.14,.15],oreille:C.or,khol:C.or,iris:C.or,col:[C.or,C.turq,C.or,C.lapis],soc:C.gres2},
       {c:[.96,.90,.76],c2:C.gres2,peau:[.96,.90,.76],nez:[.85,.52,.52],oreille:C.turq,khol:C.turq,iris:C.or,col:[C.turq,C.lapis,C.or,C.azur],soc:C.gres,disque:1}][v%3];
  g.box(0,0,.02,.50,.028,1.10,V.soc,1,1);g.box(0,.028,.02,.44,.012,1.04,V.c2,1);
  // le corps : une loge de ronds le long de z — la croupe, le haut des hanches, la taille, les épaules, la poitrine, le départ du cou
  g.loft([Z(-.47,.060,.058,2.4,0,.088),Z(-.37,.138,.124,2.5,0,.152),Z(-.22,.128,.116,2.5,0,.144),Z(-.05,.116,.124,2.5,0,.152),Z(.12,.134,.152,2.5,0,.178),Z(.25,.130,.150,2.4,0,.186),Z(.30,.096,.100,2.3,0,.236)],12,V.c,5,3);
  for(const sx of [-1,1]){g.sph(sx*.108,.100,-.30,.062,.092,.120,4,8,V.c,5);g.box(sx*.098,.034,-.14,.070,.034,.110,V.c2,1);                                                // la hanche, la patte arrière repliée
    g.tube([sx*.086,.100,.10],[sx*.090,.056,.52],.056,.042,8,V.c,5,1);g.sph(sx*.090,.042,.53,.046,.034,.056,3,8,V.c,5);for(const dx of [-.020,.020])g.box(sx*.090+dx,.040,.585,.010,.008,.022,V.c2,1);} // l'avant-bras à plat, la patte, ses griffes
  {const A=[[ts*.030,.102,-.46],[ts*.150,.070,-.50],[ts*.210,.044,-.40],[ts*.220,.040,-.26],[ts*.190,.040,-.15],[ts*.140,.038,-.12]],r=[.028,.026,.022,.019,.015,.008];for(let i=0;i<5;i++)g.tube(A[i],A[i+1],r[i],r[i+1],6,V.c,5,i===4);g.tube([ts*.160,.039,-.125],[ts*.140,.038,-.12],.016,.014,6,C.or,3,1);} // la queue enroulée sur le flanc, son anneau d'or
  g.tube([0,.200,.200],[0,.310,.262],.130,.100,10,V.c,5,1);                                                                                                         // le cou qui se dresse
  g.loft([R(.206,.160,.140,2.4,0,.224),R(.234,.190,.156,2.4,0,.232),R(.262,.190,.152,2.4,0,.240),R(.288,.150,.122,2.3,0,.250),R(.308,.092,.084,2.3,0,.260)],12,[V.col[0],V.col[1],V.col[2],V.col[3]],3,3);   // le collier usekh : quatre bandes
  g.push();g.T(0,.304,.262);g.Sc(1.80);dnTeteChat(g,V);g.pop();
  return g.fin();}
Object.assign(DN_MOD,{
  teteFaucon:function(){return dnTeteTombee('faucon',221);},teteChacal:function(){return dnTeteTombee('chacal',223);},teteIbis:function(){return dnTeteTombee('ibis',225);},
  teteBelier:function(){return dnTeteTombee('belier',227);},teteLionne:function(){return dnTeteTombee('lionne',229);},teteCrocodile:function(){return dnTeteTombee('crocodile',231);},
  dieuFaucon:function(){return dnDieu('faucon',201);},dieuChacal:function(){return dnDieu('chacal',203);},dieuIbis:function(){return dnDieu('ibis',205);},
  dieuBelier:function(){return dnDieu('belier',207);},dieuLionne:function(){return dnDieu('lionne',209);},dieuCrocodile:function(){return dnDieu('crocodile',211);},
  sphinxChat0g:function(){return dnSphinxChat(0,-1);},sphinxChat0d:function(){return dnSphinxChat(0,1);},sphinxChat1g:function(){return dnSphinxChat(1,-1);},sphinxChat1d:function(){return dnSphinxChat(1,1);},
  sphinxChat2g:function(){return dnSphinxChat(2,-1);},sphinxChat2d:function(){return dnSphinxChat(2,1);}});
Object.assign(DN_ECH,{teteFaucon:8,teteChacal:8,teteIbis:8,teteBelier:8,teteLionne:8,teteCrocodile:8,dieuFaucon:30,dieuChacal:30,dieuIbis:30,dieuBelier:30,dieuLionne:30,dieuCrocodile:30,sphinxChat0g:40,sphinxChat0d:40,sphinxChat1g:40,sphinxChat1d:40,sphinxChat2g:40,sphinxChat2d:40});
/* LE TIRAGE (dans le flux du décor, D.sd — jamais le tracé) : les quatre colosses de la place, deux petits dieux pour la porte, la livrée de chaque paire de sphinx-chats ; DN.dieux est relu à chaque construction */
function dnDieuxTirage(){const D=DN.deco,sd=D?D.sd:7;if(DN.dieux&&DN.dieux.sd===sd)return DN.dieux;const rs=mulberry32((sd^0xD1E057)>>>0),A=DN_DIEUX.liste.slice(),P=A.concat(['pharaon']);
  const mel=function(L){for(let i=L.length-1;i>0;i--){const j=(rs()*(i+1))|0,x=L[i];L[i]=L[j];L[j]=x;}return L;};mel(P);mel(A);
  return DN.dieux={sd:sd,col:P.slice(0,4),porte:A.slice(0,2),sph:[(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0,(rs()*3)|0],sphD:[(rs()*3)|0],leg:P.slice(4).concat(A)};}
// la tête tombée d'une ruine : au hasard de sa place (jamais du flux du décor), les trois quarts du temps une tête de dieu
function dnTeteNom(p){if(!DN_DIEUX.on)return 'tete';const h=Math.abs(Math.floor(p.x*.173+p.z*.291))%8;return h<6?'tete'+['Faucon','Chacal','Belier','Lionne','Ibis','Crocodile'][h]:'tete';}
function dnNomDieu(k){return DN_DIEUX.nom[k]||'pharaon';}
// le modèle d'un colosse de la place : la clé du tirage (0 à 3) ; d'un sphinx de l'allée : la paire (i), le côté (sg : -1 gauche de la route)
function dnColosseNom(i){return DN_DIEUX.on?dnNomDieu(dnDieuxTirage().col[i&3]):'pharaon';}
function dnSphinxNom(i,sg){if(!DN_DIEUX.on)return 'sphinx';const T=dnDieuxTirage();return 'sphinxChat'+T.sph[i%T.sph.length]+(sg<0?'g':'d');}
function dnLegNom(m){if(!DN_DIEUX.on)return m.k==='sphinx'?'sphinx':'colosse';const T=dnDieuxTirage();if(m.k==='sphinx')return 'sphinxChat'+T.sphD[0]+(Math.sin(m.t-m.a)<0?'g':'d');return dnNomDieu(T.leg[(Math.abs(Math.round(m.x*.37+m.z*.61)))%T.leg.length]);}
/* ===== LE GRAND SPHINX ET LES PYRAMIDES EN SÉRIE (2026-10-23, Léo : « je veux un sphinx comme ça qui prend BEAUCOUP de place · des séries de pyramides · un voyage en actes ») =====
   `sphinxGrand` : le vrai Sphinx de Gizeh (corps de lion couché en assises de calcaire, croupe, dos, poitrail, pattes avant tendues à doigts, queue sur le flanc ; tête au némès rayé, visage de face au nez
   abîmé, yeux et bouche sombres, oreilles, uræus brisé) dans sa fosse de calcaire, avec son petit temple entre les pattes. Long 1, face à +z, haut ~ .39 : la scène l'agrandit à 150-200 m (dunes-4.js, scène
   `sphinx`) — il se pose au bord de la place, le regard vers la route, et sa grande pyramide DERRIÈRE lui. Facettes franches (boîtes et troncs de pyramide : la matière des décors les éclaire à plat).
   `?sans=dunesactes` rend le tirage d'avant (dunes-1.js dnTirage, dunes-4.js dnPlanScenes). Console : `dbgDunes('galerie', s, ['sphinxGrand'])`. */
function dnSphinxGrand(){const g=dnKit(77),C=DN_COL,gr=[1,.91,.75],g2=[.95,.81,.64],cal=[1,.96,.84],cal2=[.96,.90,.74],face=[1,.89,.75],noir=[.20,.12,.10];
  // la fosse : le fond, trois murs bas à gradins, le petit temple entre les pattes (marches, cella dorée)
  g.box(0,0,.02,.62,.014,1.18,cal2,1,1);g.box(-.30,.014,.02,.03,.075,1.18,cal,1);g.box(.30,.014,.02,.03,.075,1.18,cal,1);g.box(0,.014,-.57,.62,.075,.03,cal,1);g.box(-.30,.089,.02,.034,.02,1.18,cal2,1);g.box(.30,.089,.02,.034,.02,1.18,cal2,1);
  g.box(0,.014,.60,.20,.03,.16,cal,1);g.box(0,.044,.60,.15,.03,.12,cal2,1);g.box(0,.074,.60,.09,.034,.07,[.96,.74,.30],3);
  // le corps : trois masses (croupe, dos, poitrail) en troncs de pyramide, des assises sur les flancs (une ligne sombre tous les .03)
  const st=(cz,d0,w0,n,dw,col,y0)=>{for(let i=0;i<n;i++)g.box(0,(y0==null?.014:y0)+i*.03,cz,w0-dw*i,.03,d0-dw*i*.7,i&1?col[1]:col[0],1,i===0);};
  st(-.35,.30,.31,9,.012,[gr,g2]);st(-.08,.34,.29,8,.010,[g2,gr]);st(.12,.26,.27,9,.011,[gr,g2]);
  for(let i=0;i<8;i++){const y=.03+i*.03;for(const sx of [-1,1]){g.box(sx*.140-sx*.006*i,y+.02,-.33,.008,.006,.26,[.62,.48,.36],0);g.box(sx*.128-sx*.005*i,y+.02,-.07,.008,.006,.30,[.62,.48,.36],0);}}
  g.tube([.11,.05,-.49],[.17,.07,-.39],.018,.014,5,gr,1,1);g.tube([.17,.07,-.39],[.16,.17,-.30],.014,.010,5,gr,1,1);       // la queue, enroulée sur la hanche
  // les pattes avant : deux avant-bras, le poignet, trois doigts chacune
  for(const sx of [-1,1]){g.box(sx*.082,.014,.32,.064,.052,.40,gr,1);g.box(sx*.082,.066,.22,.060,.022,.22,g2,1);g.box(sx*.082,.014,.55,.066,.040,.10,g2,1);
    for(let j=-1;j<=1;j++)g.box(sx*.082+j*.022,.014,.615,.020,.030,.05,gr,1);g.box(sx*.082,.014,.575,.070,.012,.012,noir,0);}
  // le cou et la tête : le némès (assises alternées, lappets sur les épaules), la face, le nez abîmé, les yeux, la bouche, l'oreille, l'uræus brisé
  g.box(0,.27,.17,.13,.05,.12,gr,1);
  g.push();g.T(0,.045,0);
  for(let i=0;i<7;i++)g.box(0,.27+i*.0215,.17,.158-.0045*i,.0215,.128-.002*i,i&1?gr:g2,1);
  g.box(0,.42,.17,.12,.014,.105,g2,1);g.box(0,.434,.185,.03,.022,.03,[.70,.52,.36],1);
  for(const sx of [-1,1]){g.box(sx*.089,.205,.19,.032,.135,.10,g2,1);g.box(sx*.093,.205,.245,.026,.11,.03,gr,1);g.box(sx*.058,.335,.205,.016,.05,.024,gr,1);}
  g.box(0,.285,.238,.088,.125,.052,face,5);g.box(0,.33,.266,.074,.05,.012,face,5);g.box(0,.298,.268,.024,.045,.026,face,5);g.box(0,.288,.282,.016,.016,.012,noir,0);       // le visage, le front, l'arête du nez, le trou du nez abîmé
  for(const sx of [-1,1]){g.box(sx*.025,.328,.275,.024,.010,.008,noir,0);g.box(sx*.040,.338,.272,.020,.006,.008,[.60,.40,.30],0);g.box(sx*.042,.298,.262,.018,.034,.010,[.80,.62,.50],5);}
  g.box(0,.27,.272,.044,.007,.008,noir,0);g.box(0,.262,.268,.036,.012,.012,[.80,.62,.50],5);
  g.pop();return g.fin();}
Object.assign(DN_MOD,{sphinxGrand:function(){return dnSphinxGrand();}});
Object.assign(DN_ECH,{sphinxGrand:60});
/* ===== LES SCÈNES DES DUNES (2026-10-22, Léo : « le niveau dune n'est pas au niveau — observe jade, la grotte et la forêt ») =====
   Une MAP A DES LIEUX : jade a ses piliers, la forêt ses géants, la grotte ses salles. Les dunes en ont désormais — chaque tronçon calme de la route (le départ, un creux entre deux vagues, la dernière droite) peut recevoir une SCÈNE, tirée
   dans le flux du décor (`D.sd`) : LA PORTE DU DÉPART (deux pylônes de part et d'autre de la route, les mâts et leurs oriflammes), L'ALLÉE DES SPHINX (des paires qui regardent la route, des
   obélisques entre elles), LA RANGÉE DE COLOSSES (quatre pharaons assis, façon Abou Simbel), LA COLONNADE (deux files de géants à architraves, certains brisés, des tambours à terre : elle
   mène aux pyramides) et LES RUINES éparses. Le sable tombait trop vite au bord de la route (une crête, des flancs à 22-32°) pour qu'on y pose quoi que ce soit : chaque scène a son PLATEAU
   (S.pw : sa demi-largeur depuis l'axe, qui monte et s'élargit en douceur sur 120 m avant la scène, dnProfil le lit) — le sable s'y tient à hauteur de la dalle. Les colonnes, colosses,
   sphinx et pylônes TUENT en vol (ils entrent dans DN.mo). `?sans=dunesscenes` = sans elles. */
const DN_SCN={on:!/[?&]sans=([^&]*,)?dunesscenes(,|&|$)/.test(location.search)};
function dnPos(S,s,lat){const i=Math.max(0,Math.min(S.n-1,Math.round(s/S.ds)));return {x:S.x[i]-S.tz[i]*lat,z:S.z[i]+S.tx[i]*lat,yr:S.y[i],t:Math.atan2(S.tx[i],S.tz[i]),i:i};}
// les tronçons CALMES de la route (2026-10-22, LA ROUTE CONTINUE : plus de sauts à contourner) — là où une scène peut se poser : le DÉPART (le belvédère, le 1er creux), chaque CREUX entre deux vagues,
// la DERNIÈRE droite : [{a, b, courbe, k}] — `courbe` = le cap total tourné (rad) : une longue droite = une scène de monuments
function dnTroncons(){const S=DN.S,out=[];if(!S)return out;const Q=DN.sQ||{};
  const add=(a9,b9,k)=>{a9=Math.max(20,a9);b9=Math.min(L-40,b9);if(b9-a9<150)return;let tot=0,p=null;for(let s9=a9;s9<=b9;s9+=24){const i=Math.max(0,Math.min(S.n-1,Math.round(s9/S.ds))),h=Math.atan2(S.tx[i],S.tz[i]);if(p!=null){let d=h-p;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;tot+=Math.abs(d);}p=h;}out.push({a:a9,b:b9,courbe:tot,k:k});};
  add(30,(Q.erg0!=null?Q.erg0:600)-70,'depart');
  (DN.fe||[]).forEach(function(fe,n){const sD=Q['d'+n],sN=Q['m'+(n+1)+'a'],n0=out.length;if(sD==null)return;if(fe.fin)add(sD+80,L-170,'fin');else if(sN!=null)add(sD+90,sN-50,'creux');if(out.length>n0)out[n0].sp=fe.sp||'';});
  return out;}
/* LE PLAN DES SCÈNES (dans buildDunes, avant le monde : les plateaux entrent dans la route) : DN.scn = [{k, a, b, pw, …}] et S.pw (la demi-largeur du plateau, par échantillon) */
function dnPlanScenes(S,K,RH,D){
  DN.scn=[];DN.scnV=[];S.pw.fill(0);if(!DN_SCN.on||!D)return;const seg=dnTroncons();if(!seg.length)return;
  const rs=mulberry32((D.sd^0x5CE9E)>>>0),R=()=>rs(),Kc=Math.min(1.3,K),Kd=Math.min(1.25,K);
  /* LES OMBRES : chaque scène donne ses volumes (x, z, rayon, hauteur) à la grille d'ombre du travailleur (dnOmbre) — les mêmes positions que le placement, au hasard près (±3 m : sous une case de 44 m) */
  DN.scnV=[];const vol=(c)=>{const RH9=RH;
    if(c.k==='colonnade'){const sc=c.H/22,pas=26*sc*1.05,lat=RH9+8+3.8*sc+1.5;for(let s9=c.a;s9<=c.b;s9+=pas)for(const sg of [-1,1]){const q=dnPos(S,s9,sg*lat);DN.scnV.push({x:q.x,z:q.z,r:3.9*sc,h:c.H});}}
    else if(c.k==='allee'){const lat=RH9+c.len*.5+8,pas=c.len*2.2;for(let s9=c.a+c.len;s9<=c.b-c.len;s9+=pas)for(const sg of [-1,1]){const q=dnPos(S,s9,sg*lat);DN.scnV.push({x:q.x,z:q.z,r:c.len*.5,h:c.len*.5});}}
    else if(c.k==='colosses'){for(const sg of [-1,1])for(let k=0;k<2;k++){const q=dnPos(S,c.a+k*c.H*1.9,sg*(RH9+c.H*.40+8));DN.scnV.push({x:q.x,z:q.z,r:c.H*.40,h:c.H});}}
    else if(c.k==='sphinx'){for(const f of [-.3,0,.3]){const q=dnPos(S,c.sc+f*c.L,c.sg*c.lat);DN.scnV.push({x:q.x,z:q.z,r:c.L*.15,h:c.L*.30});}
      const P=c.py;if(P)for(const f of [.1,.3,.5,.7,.9])DN.scnV.push({x:P.x,z:P.z,r:P.hw*(1-f)*1.5,h:P.hw*1.27*f});}
    else if(c.k==='porte'){const sc=c.H/30;for(const sg of [-1,1]){const q=dnPos(S,(c.a+c.b)/2,sg*(RH9+7*sc+8));DN.scnV.push({x:q.x,z:q.z,r:c.H*.3,h:c.H});}}};
  const ajoute=(k,a,b,pw,ex)=>{DN.scn.push(Object.assign({k:k,a:Math.round(a),b:Math.round(b),pw:Math.round(pw)},ex||{}));vol(DN.scn[DN.scn.length-1]);
    for(let i=0;i<S.n;i++){const s9=i*S.ds,u=Math.max(0,Math.min(1,(s9-(a-120))/120))*Math.max(0,Math.min(1,((b+120)-s9)/120));if(u>0){const e=u*u*(3-2*u);if(S.pw[i]<pw*e)S.pw[i]=pw*e;}}};
  const faire=function(k,q){const L9=q.b-q.a;
    if(k==='porte'){const H=(38+R()*8)*Kd,sc=H/30,a=Math.max(q.a+40,Math.min(q.b-60,q.a+170+R()*Math.max(0,L9-340)));ajoute('porte',a-20,a+20,RH+22*sc+8,{H:H});return true;}
    if(k==='allee'){const len=(34+R()*10)*Kd,a=q.a+50,b=Math.min(q.b-40,a+380+R()*160);if(b-a>len*3.4){ajoute('allee',a,b,RH+len*1.0+16,{len:len});return true;}return false;}
    if(k==='colonnade'){const Hc=(36+R()*10)*Kc,sc=Hc/22,a=q.a+70,b=Math.min(q.b-40,a+360+R()*170);if(b-a>sc*26*5){ajoute('colonnade',a,b,RH+8+3.8*sc*2.2+10,{H:Hc});return true;}return false;}
    if(k==='sphinx'){const Ls=Math.min((270+R()*70)*Kd,(L9-60)/1.25),lat=RH+36+.46*Ls,sg=R()<.5?-1:1,hw=(200+R()*80)*Kd,sc=Math.max(q.a+Ls*.6+30,q.a+L9*.42);
      if(Ls<150||sc+Ls*.6>q.b-20)return false;const sH=sc-Ls*.3,H=dnPos(S,sH,sg*lat),dd=Math.hypot(330,lat),d0=330/dd,d1=sg*lat/dd,dist=hw*1.4+80;
      let ps=sH+d0*dist,pl=sg*lat+d1*dist;const minL=RH+hw*1.1+40;if(Math.abs(pl)<minL)pl=sg*minL;const Pp=dnPos(S,ps,pl);
      ajoute('sphinx',sc-Ls*.6,sc+Ls*.6,lat+.46*Ls+20,{L:Ls,lat:lat,sg:sg,sc:sc,py:{x:Pp.x,z:Pp.z,hw:hw,t:Pp.t}});return true;}
    if(k==='colosses'){const H=(50+R()*12)*Kd,a=q.a+60+R()*Math.max(0,L9-H*3.4-120),b=a+H*1.9+40;if(b<q.b-30){ajoute('colosses',a,b,RH+H*.8+18,{H:H});return true;}return false;}
    return false;};
  // LES ACTES (2026-10-23, Léo : « brouillon : l'organisation et l'harmonie ») : UN décor par lieu, du VIDE entre les actes. I le désert nu (le départ, la 1re vague : rien près de la route) · II LA PLACE : le GRAND SPHINX et sa pyramide ·
  // III L'ALLÉE : les sphinx-chats et les obélisques · IV LA VALLÉE D'ARGILE : la rangée des dieux · V la fin : l'oasis (rien près de la route) puis les pyramides au loin. `?sans=dunesactes` : le plan d'avant.
  if(DN_ACTES.on){const vlei=seg.some(function(q){return q.sp==='vlei';});
    for(const q of seg){if(q.sp==='plaza'){if(!faire('sphinx',q))faire('colosses',q);}
      else if(q.sp==='avenue'){if(!faire('allee',q))faire('colosses',q);}
      else if(q.sp==='vlei')faire('colosses',q);}
    if(!vlei){const ry=seg.filter(function(q){return q.sp==='rythme';});for(const q of ry)if(faire('colosses',q))break;} /* pas de vallée d'argile : les dieux prennent un creux de bosses (jamais l'oasis) */
    return;}
  // UN LIEU, UNE SCÈNE (le plan d'avant) : le DÉPART a sa porte ; l'ARRIVÉE sa colonnade (4 fois sur 5, sinon une allée) ; l'ALLÉE des obélisques porte l'allée des sphinx ; la PLACE, les colosses (ou une colonnade) ; les autres creux, parfois une porte
  for(const q of seg){if(q.k==='depart')faire('porte',q);
    else if(q.k==='fin'){if(R()<.8){if(!faire('colonnade',q))faire('allee',q);}else faire('allee',q);}
    else if(q.sp==='avenue'){if(!faire('allee',q))faire('colosses',q);}
    else if(q.sp==='plaza'){if(R()<.72){if(!faire('colosses',q))faire('colonnade',q);}else if(!faire('colonnade',q))faire('colosses',q);}
    else if(q.sp!=='vlei'&&R()<.35)faire('porte',q);}}
// un décor posé à (x, z) : le plateau le tient à la hauteur de la dalle ; sinon un PODIUM de pierre rattrape le sable (jamais plus de 26 m) — rend la hauteur de la base
const o9s={};
function dnAssise(cuis,x,z,yr,larg,rot){const h=dnHauteur(x,z,o9s);if(o9s.eau)return null;const yb=Math.max(h-.3,yr-1.2);if(yb-h>26)return null;
  if(yb-h>1.2){const w9=larg*1.15+(yb-h)*.12;cuis(dnMod('bloc'),x,h-2,z,w9,yb-h+2,w9,rot,0,0,[.90,.80,.62]);cuis(dnMod('bloc'),x,yb-.5,z,w9*1.08,.9,w9*1.08,rot,0,0,[.96,.86,.68]);}return yb;}
function dnScenes(X){
  if(!DN_SCN.on||!DN.S||!DN.scn||!DN.scn.length)return;const S=DN.S,rg=X.rg,cuis=X.cuis,K=X.K,RH=X.RH,N=X.N,mo=DN.mo,M=n=>dnMod(n);N.sc=[];
  const kill=(k,x,y,z,r,h)=>{mo.push({k:k,x:x,y:y,z:z,r:r,h:h,a:0,t:0});};
  // LA COLONNADE : deux files de colonnes (une tous les ~26 m × l'échelle), un architrave entre deux colonnes voisines, des brisées, des tambours à terre
  const colonnade=(a,b,H)=>{const sc=H/22,pas=26*sc*1.05,lat=RH+8+3.8*sc+rg()*3;let n=0;
    for(let s=a;s<=b;s+=pas){for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat);if(S.gd[q.i]>.01)continue;
        const yb=dnAssise(cuis,q.x,q.z,q.yr,9*sc,q.t);if(yb==null)continue;const br=rg()<.18,hy=br?H*(.35+rg()*.4):H;
        cuis(M('colonne'),q.x,yb,q.z,sc,hy/22,sc,q.t);kill('colonne',q.x,yb,q.z,3.9*sc,hy);n++;
        if(br){const an=rg()*6.28,d=H*.25+rg()*H*.3,x2=q.x+Math.sin(an)*d,z2=q.z+Math.cos(an)*d;cuis(M('tambour'),x2,dnHauteur(x2,z2)+.6*sc,z2,2.3*sc,2.6*sc,2.3*sc,an,Math.PI/2*(rg()<.5?1:0),rg()*2);}
        else{const nx=dnPos(S,s+pas,sg*lat);if(nx.i!==q.i&&s+pas<=b){const ln=Math.hypot(nx.x-q.x,nx.z-q.z);cuis(M('bloc'),(q.x+nx.x)/2,yb+H*1.01,(q.z+nx.z)/2,3.4*sc,H*.07,ln,Math.atan2(nx.x-q.x,nx.z-q.z),0,0,[.94,.84,.66]);}}}}
    N.colonnade=n;N.sc.push(['colonnade',Math.round(a),Math.round(b)]);};
  // L'ALLÉE DES SPHINX : des paires tous les ~2,2 longueurs (un sphinx de chaque côté, le regard vers la route), un obélisque entre deux paires
  const allee=(a,b,len)=>{const lat=RH+len*.5+8,pas=len*2.2;let n=0,pi=0;
    for(let s=a+len;s<=b-len;s+=pas,pi++){for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat);if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,len*.55,q.t);if(yb==null)continue;
        const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z);cuis(M(dnSphinxNom(pi,Math.cos(ar)*S.tx[q.i]-Math.sin(ar)*S.tz[q.i])),q.x,yb,q.z,len,len,len,ar);kill('sphinx',q.x,yb,q.z,len*.5,len*.70);n++;}
      const m=dnPos(S,s+pas/2,(rg()<.5?-1:1)*(RH+len*.55+10));if(S.gd[m.i]<=.01){const yb=dnAssise(cuis,m.x,m.z,m.yr,8,m.t);if(yb!=null){const hs=26+rg()*12;cuis(M('obelisque'),m.x,yb,m.z,hs/64*1.1,hs/64,hs/64*1.1,m.t);kill('obelisque',m.x,yb,m.z,4.4,hs);}}}
    for(let s=a+30;s<=b-20;s+=48)braise(s,RH+5,3.6);
    N.allee=n;N.sc.push(['allee',Math.round(a),Math.round(b)]);};
  // LA RANGÉE DE COLOSSES : quatre statues assises (deux de chaque côté) qui regardent la route — des dieux à tête d'animal, ou le pharaon (dunes-dieux.js : dnDieuxTirage)
  const colosses=(a,H)=>{let n=0;for(const sg of [-1,1])for(let k=0;k<2;k++){const q=dnPos(S,a+k*H*1.9,sg*(RH+H*.40+8));if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,H*.8,q.t);if(yb==null)continue;
      const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z);cuis(M(dnColosseNom((sg<0?0:2)+k)),q.x,yb,q.z,H,H,H,ar);kill('colosse',q.x,yb,q.z,H*.40,H*1.32);n++;}N.colosses=n;N.sc.push(['colosses',Math.round(a),Math.round(a+H*1.9)]);};
  // LE GRAND SPHINX (dunes-gizeh.js) : au bord de la place, le regard tourné vers les voitures qui arrivent (et un peu vers la route), sa grande pyramide DERRIÈRE lui dans l'axe de la vue
  const sphinx=(c)=>{const L9=c.L,q=dnPos(S,c.sc,c.sg*c.lat),yb=dnAssise(cuis,q.x,q.z,q.yr,L9*.6,q.t);if(yb==null)return;const ar=q.t+Math.PI-c.sg*.26,ca=Math.sin(ar),sa=Math.cos(ar);
    cuis(M('sphinxGrand'),q.x,yb,q.z,L9,L9,L9,ar);for(const f of [-.3,0,.3])kill('sphinx',q.x+ca*f*L9,yb,q.z+sa*f*L9,L9*.15,L9*.40);N.sphinx=Math.round(L9);
    const P=c.py;if(P){const y9=Math.min(dnHauteur(P.x+P.hw*.8,P.z+P.hw*.8),dnHauteur(P.x-P.hw*.8,P.z-P.hw*.8),dnHauteur(P.x+P.hw*.8,P.z-P.hw*.8),dnHauteur(P.x-P.hw*.8,P.z+P.hw*.8));
      cuis(M(c.sg<0?'pyrCap':'pyrGiza'),P.x,y9-14,P.z,P.hw,P.hw*1.27,P.hw,P.t+.35);N.pyrSphinx=Math.round(P.hw);}
    N.sc.push(['sphinx',Math.round(c.sc-L9*.6),Math.round(c.sc+L9*.6)]);};
  // LA PORTE : deux pylônes de part et d'autre de la route, la baie le long d'elle
  const porte=(a,H)=>{const sc=H/30;for(const sg of [-1,1]){const q=dnPos(S,a,sg*(RH+7*sc+8));if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,H*.6,q.t);if(yb==null)continue;
      cuis(M('pylone'),q.x,yb,q.z,sc,sc,sc,q.t);kill('pylone',q.x,yb,q.z,H*.3,H);}
    if(DN_DIEUX.on){const T=dnDieuxTirage(),hs=H*.34;[-1,1].forEach(function(sg,j){const q=dnPos(S,a-12*sc,sg*(RH+7*sc+8));if(S.gd[q.i]>.01)return;const yb=dnAssise(cuis,q.x,q.z,q.yr,hs*.8,q.t);if(yb==null)return;
        const ar=Math.atan2(S.x[q.i]-q.x,S.z[q.i]-q.z);cuis(M(dnNomDieu(T.porte[j])),q.x,yb,q.z,hs,hs,hs,ar);kill('dieu',q.x,yb,q.z,hs*.40,hs*1.25);});} // (2026-10-23) deux petits dieux gardent l'entrée, devant les pylônes
    braise(a-26,RH+5,3.6);braise(a+26,RH+5,3.6);N.portes=(N.portes|0)+1;N.sc.push(['porte',Math.round(a),Math.round(a)]);};
  // LES BRASEROS (2026-10-22) : des paires de vasques sur la berme, de part et d'autre de la route — la nuit, ce sont elles qui éclairent la procession
  const braise=(s,lat0,h)=>{for(const sg of [-1,1]){const q=dnPos(S,s,sg*lat0);if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,h*.5,q.t);if(yb==null)continue;cuis(M('brasero'),q.x,yb,q.z,h,h,h,q.t);N.braseros=(N.braseros|0)+1;}};
  // LES PORTES DU CIEL (2026-10-22, Léo : « le joueur peut piquer en bas ou décoller ») : à chaque crête, deux obélisques de part et d'autre de la route, juste avant l'apex — le tremplin se lit de loin (l'Akhet, le signe de
  // l'horizon : le soleil se lève entre deux monts)
  {let n=0;for(const v of DN.lev||[]){if(v.tag==='bosse')continue;if(DN_ACTES.on&&v.tag!=='grande'){braise(v.s-40,RH+5,3.4);continue;}for(const sg of [-1,1]){const q=dnPos(S,v.s-12,sg*(RH+8));if(S.gd[q.i]>.01)continue;const yb=dnAssise(cuis,q.x,q.z,q.yr,9,q.t);if(yb==null)continue;
      const hs=(26+rg()*8)*Math.min(1.2,K);cuis(M('obelisque'),q.x,yb,q.z,hs/64*1.1,hs/64,hs/64*1.1,q.t);kill('obelisque',q.x,yb,q.z,4.6,hs);n++;}braise(v.s-40,RH+5,3.4);braise(v.s+30,RH+5,3.4);}N.portiques=n;}
  for(const c of DN.scn){if(c.k==='porte')porte((c.a+c.b)/2,c.H);else if(c.k==='allee')allee(c.a,c.b,c.len);else if(c.k==='colonnade')colonnade(c.a,c.b,c.H);else if(c.k==='colosses')colosses(c.a,c.H);else if(c.k==='sphinx')sphinx(c);}
  // LES RUINES : des tambours, des têtes, des blocs, de part et d'autre, à 10-70 m du bord, sur chaque tronçon
  const seg=dnTroncons();let nr=0;for(const q of seg){const n9=Math.round((q.b-q.a)/38*PAL.b('dnRuines',1)*(DN_ACTES.on?((q.sp==='vlei'||q.sp==='avenue')?.6:0):1));for(let k=0;k<n9;k++){const s=q.a+rg()*(q.b-q.a),sg=rg()<.5?-1:1,lat=RH+10+rg()*rg()*60,p=dnPos(S,s,sg*lat);if(S.gd[p.i]>.01)continue;const g=dnHauteur(p.x,p.z,o9s);if(o9s.eau)continue;
      const r=rg();if(r<.45){const sc=(1.4+rg()*1.6)*K*.8;cuis(M('tambour'),p.x,g+.25*sc,p.z,sc,sc*(1.2+rg()*.8),sc,rg()*6.28,Math.PI/2,rg()*2);}
      else if(r<.62){const sc=(4+rg()*5)*K*.8;cuis(M(dnTeteNom(p)),p.x,g-sc*.42,p.z,sc,sc,sc,Math.atan2(S.x[p.i]-p.x,S.z[p.i]-p.z)+(rg()-.5)*.8,(rg()-.5)*.5,(rg()-.4)*.4);}
      else{const sc=(2+rg()*4)*K*.8;cuis(M('bloc'),p.x,g-.4,p.z,sc*(1+rg()),sc*(.6+rg()*.6),sc*(1+rg()),rg()*6.28,(rg()-.5)*.4,(rg()-.5)*.4,[.88,.76,.58]);}nr++;}}N.ruines=nr;}
/* <<<FIN DUNES>>> */
/* ===== LES DUNES D'OR, LE PLAN MOYEN (2026-10-21, Sacha : « amélioration visuelle des maps — ajouter des éléments, chaque map un peu plus belle ») =====
   Ce que la mer de dunes n'avait pas : un étage MOYEN. Entre les obélisques de la route et la ligne d'horizon, rien ne dépassait du sable — donc aucune échelle, aucune profondeur.
   · LES BUTTES (inselbergs de grès, façon Wadi Rum) : 7 à 28 massifs sombres aux strates rose-brun, de 14 à 70 m, à 250 m-2 km de la route — des silhouettes que la brume teinte
     (l'étage lointain, plus clair et plus froid) ; une seule géométrie, étirée en tour ou en mesa par l'échelle de l'instance.
   · LES ARBRES MORTS ÉPARS (l'acacia de la vallée, ailleurs aussi) : 8 à 28 troncs blanchis à 26-350 m de la route, là où le sable est assez haut pour qu'on les voie défiler.
   · LES TOUFFES D'HERBE SÈCHE (le premier plan qui défile) : 30 à 120 touffes d'or sec, de 1,6 à 3,4 m, près des bords.
   Même matière, mêmes ombres, mêmes programmes que les décors d'avant (DN_MVS / DN_AFS : aucun programme de plus), 3 appels de dessin, ≤ 5 000 triangles. Tout naît dans le temps de construction
   (dnMonuments), dans un générateur LOCAL (`mulberry32` du tracé lui-même : aucun tirage dans le hasard de la piste, ni dans celui des décors d'avant) ; rien n'est posé près d'une dalle ni dans le couloir. */
function dnGeos2(){if(DN.geos2)return DN.geos2;const G9={};
  {const g=dnGeo(),n=8,hh=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v);}, /* l'irrégularité des facettes : un hasard FIXE (pas de tirage) */
     R=[[0,1.06],[.30,.90],[.32,.99],[.55,.86],[.57,.94],[.80,.80],[1,.68]],  /* [hauteur, rayon] des anneaux : des strates qui avancent et reculent (des corniches) */
     C=[[.46,.22,.20],[.54,.27,.21],[.62,.31,.23],[.70,.37,.26],[.78,.45,.30],[.86,.58,.36]]; /* terre cuite sombre au pied → grès chaud et clair au sommet (l'or du couchant y accroche) */
    const P=(k,j)=>{const a=k/n*6.2832+.4*(j%2),r=R[j][1]*(.90+.20*hh(k,j));return [Math.cos(a)*r,R[j][0]*(.97+.06*hh(k+7,j)),Math.sin(a)*r];};
    for(let j=0;j<R.length-1;j++)for(let k=0;k<n;k++)g.quad(P(k,j),P(k,j+1),P(k+1,j+1),P(k+1,j),C[j]);
    for(let k=0;k<n;k++)g.tri(P(k,R.length-1),[0,1.02,0],P(k+1,R.length-1),[.90,.70,.44]);G9.butte=g.fin();}              /* LA BUTTE (h = 1, rayon = 1) */
  {const g=dnGeo(),bas=[.42,.34,.15],haut=[.84,.70,.30];                                                                  /* LA TOUFFE D'HERBE SÈCHE (h = 1) : neuf lames qui retombent, or sec en pointe */
    for(let k=0;k<9;k++){const a=k/9*6.2832+.2,ca=Math.cos(a),sa=Math.sin(a),px=-sa*.05,pz=ca*.05,f=((k*37)%11)/11,h=.62+.38*f,ex=.30+.18*f;
      const b0=[ca*.05-px,0,sa*.05-pz],b1=[ca*.05+px,0,sa*.05+pz],m1=[ca*(.12+ex*.3)+px*.7,h*.55,sa*(.12+ex*.3)+pz*.7],m0=[ca*(.12+ex*.3)-px*.7,h*.55,sa*(.12+ex*.3)-pz*.7],t=[ca*ex,h,sa*ex];
      g.quad(b0,b1,m1,m0,bas);g.tri(m0,m1,t,haut);}
    G9.touffe=g.fin();}
  DN.geos2=G9;return G9;}
function dnEmbellir(){
  const S=DN.S;if(!S||!DN.grp||!DN.Z)return;
  const M9=dnMats(),G=dnGeos2(),G0=dnGeos(),K=Math.sqrt(lvPiste()),L9=(S.n-1)*S.ds,RH=ROAD_HALF,o9={},o1={},o2={},
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
  const Lb=[],Nb=PAL.b('dnTors',28);
  for(let k=0;k<Nb*14&&Lb.length<Nb;k++){const i=Math.min(S.n-1,Math.round(r()*L9/S.ds)),sg=r()<.5?-1:1,lat=RH+(250+r()*r()*1750)*K,tour=r()<.35,
      rr=(tour?9+r()*13:34+r()*86)*Math.sqrt(K),hh=tour?26+r()*44:14+r()*26,a=r()*6.28,x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat;
    if(dmin(x,z)<RH+rr+170)continue;if(oa&&Math.hypot(x-oa.x,z-oa.z)<oa.r*2.6+rr)continue;if(DN.pyr&&Math.hypot(x-DN.pyr.x,z-DN.pyr.z)<DN.pyr.hw*2.2+rr)continue;
    const h=dnHauteur(x,z,o9);if(o9.eau)continue;Lb.push([x,h-hh*.12,z,rr,a,hh,rr]);}
  /* les ARBRES MORTS épars (la géométrie de l'acacia de la vallée) */
  const Lm=[],Nm=PAL.b('dnMorts',28);
  for(let k=0;k<Nm*16&&Lm.length<Nm;k++){const i=Math.min(S.n-1,Math.round(r()*L9/S.ds)),sg=r()<.5?-1:1,lat=RH+(26+r()*r()*330)*K,ht=(7+r()*8)*(1+.3*r()),a=r()*6.28,
      x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9);
    if(o9.eau||h<S.y[i]-THICK-110||pente(x,z,h)>.5||dnPresRoute(x,z,RH+12,h+ht+3))continue;Lm.push([x,h-.4,z,ht,a]);}
  /* les TOUFFES d'herbe sèche : près des bords, là où le sable se voit */
  const Lt=[],Nt=PAL.b('dnTouffes',120);
  for(let k=0;k<Nt*14&&Lt.length<Nt;k++){const i=Math.min(S.n-1,Math.round(r()*L9/S.ds)),sg=r()<.5?-1:1,lat=RH+(14+r()*r()*120)*K,sz=(1.6+r()*1.8)*(1+.25*r()),a=r()*6.28,
      x=S.x[i]-S.tz[i]*sg*lat,z=S.z[i]+S.tx[i]*sg*lat,h=dnHauteur(x,z,o9);
    if(o9.eau||h<S.y[i]-THICK-70||pente(x,z,h)>.42||dnPresRoute(x,z,RH+8,h+sz+3))continue;Lt.push([x,h-.1,z,sz,a]);}
  inst(G.butte,Lb,'buttes');inst(G0.arb,Lm,'arbres morts');inst(G.touffe,Lt,'touffes');
  DN.emb={buttes:Lb.length,morts:Lm.length,touffes:Lt.length};}
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
    const TR9=['lacets','lacets','courbes','traverse','lacets'],vers9=(h,R)=>{phi=Math.atan2(Math.sin(phi),Math.cos(phi));const d=(h-phi)*57.2958;if(Math.abs(d)>2)A(d,R,BK_PENTE4[4]);},
      gV=()=>BK_PENTE4[0]+rh()*BK_PENTE4[1],gD=()=>BK_PENTE4[2]+rh()*BK_PENTE4[3];
    const e0={n:ctrl.length,g:segs.length,m:MODMARK.length,P:P.clone(),phi:phi,sC:sC,sg:sg,bkNext:bkNext,bkLast:bkLast,paq:bkPaq.slice()};
    const pres=()=>{let m=1e9;const S9=[0];for(let k=1;k<ctrl.length;k++)S9.push(S9[k-1]+Math.hypot(ctrl[k].x-ctrl[k-1].x,ctrl[k].z-ctrl[k-1].z)); // le plus près que passent deux bouts de piste (≥ 700 m de piste entre eux)
      for(let i=0;i<ctrl.length;i++)for(let j=i+1;j<ctrl.length;j++){if(S9[j]-S9[i]<700)continue;const d=Math.hypot(ctrl[i].x-ctrl[j].x,ctrl[i].z-ctrl[j].z);if(d<m)m=d;}return m;};
    for(let e=0;e<6;e++){
      if(e){ctrl.length=e0.n;segs.length=e0.g;MODMARK.length=e0.m;P.copy(e0.P);phi=e0.phi;sC=e0.sC;sg=e0.sg;bkNext=e0.bkNext;bkLast=e0.bkLast;bkPaq.length=0;for(const x9 of e0.paq)bkPaq.push(x9);PLAN.length=0;}
      let tP='';
      while(sC<LEN){
        if(rm&&tP&&sC>bkNext&&sC<LEN-700){const m=bkTire(),i9=ctrl.length-1;bkLast=m;bkJ[m]();MODMARK.push({i0:i9,i1:ctrl.length-1});PLAN.push(['module'+m,0]);bkNext=sC+200+rm()*220;continue;} // LES MODULES DU GLACIER (voir bkSlalom) — plus fréquents (200-420 m au lieu de 350-650)
        let t=TR9[(rh()*5)|0];if(t===tP)t=TR9[(TR9.indexOf(t)+1+((rh()*4)|0))%5];if(t===tP)t=TR9[0];tP=t; /* (2026-10-23, Sacha : « retravaille toutes les générations de routes… trop souvent tout droit, plus de virages, que ça reste fun ») 'lacets' pèse double ; jamais deux fois le même */
        const s0=sC,lg=Math.min(LEN-sC+120,(160+rh()*240)*Math.sqrt(KR));
        if(t==='lacets'){while(sC-s0<lg&&sC<LEN){if(rh()<.78)sg=-sg;const a=30+rh()*45,R=Math.max(ROAD_HALF*2,(175+rh()*150)*KR*.72);
            let lib=(LIB-sg*phi)*57.2958;if(lib<20){sg=-sg;lib=(LIB-sg*phi)*57.2958;}A(sg*Math.min(a*1.3+10,125,lib),R,gV());D(.35*(50+rh()*140),gD());}}
        else if(t==='courbes'){while(sC-s0<lg&&sC<LEN){if(rh()<.85)sg=-sg;const a=50+rh()*55,R=Math.max(ROAD_HALF*2.6,(190+rh()*150)*KR); /* des courbes de 250-460 m (c'étaient 420-800 : on les prenait pour des droites) */
            let lib=(LIB-sg*phi)*57.2958;if(lib<20){sg=-sg;lib=(LIB-sg*phi)*57.2958;}A(sg*Math.min(a,lib),R,gV());D(25+rh()*55,gD());}}
        else if(t==='traverse'){let sd=Math.abs(phi)>.3?-Math.sign(phi):(rh()<.5?-1:1);
          for(let k=0;k<2&&sC-s0<lg&&sC<LEN;k++){vers9(sd*(44+rh()*14)/57.2958,Math.max(ROAD_HALF*2.6,(260+rh()*80)*KR));D(80+rh()*110,gD());sd=-sd;}}
        else{vers9((rh()-.5)*.2,Math.max(ROAD_HALF*2.6,(260+rh()*80)*KR));const n9=1+((rh()*2)|0);
          for(let k=0;k<n9;k++){D(60+rh()*90,BK_PENTE4[2]+BK_PENTE4[3]);const a=(rh()<.5?-1:1)*(10+rh()*12),lib=(LIB-Math.sign(a)*phi)*57.2958;if(lib>Math.abs(a)+5)A(a,Math.max(ROAD_HALF*3,600*KR),gV());}
          D(40+rh()*60,BK_PENTE4[2]+BK_PENTE4[3]);}
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
  '  float sp=0.,spk=0.;if(f2>0.){vec2 g=q*2.2;vec2 c=floor(g);float h=fh2(c);vec3 nj=normalize(vec3(fh2(c+3.1)-.5,.9,fh2(c+7.7)-.5));',
  '    float s1=step(.80,h)*pow(max(dot(reflect(-L,nj),V),0.),70.)*smoothstep(.36,.06,length(fract(g)-.5))*f2*(.62+.38*sin(uTime*(1.4+h*3.)+h*70.));sp=s1;spk=s1*step(fract(h*53.7),.20);}',
  '  {vec2 g=q*.42;vec2 c=floor(g);float h=fh2(c+5.);vec3 nj=normalize(vec3(fh2(c+1.3)-.5,.8,fh2(c+9.2)-.5));',
  '   float s2=step(.86,h)*pow(max(dot(reflect(-L,nj),V),0.),60.)*smoothstep(.30,.04,length(fract(g)-.5))*smoothstep(60.,140.,dist)*(1.-smoothstep(300.,650.,dist))*.8;sp+=s2;spk+=s2*step(fract(h*61.3),.20);}',
  '  sp*=(1.-roc)*uSpark;spk*=(1.-roc)*uSpark;col+=(uSunC*2.2+vec3(.4,.6,1.)*.3)*(sp-spk)*2.6+mix(vec3(1.,.55,.06),vec3(1.,.10,.46),step(.5,fh2(floor(q*1.1)+11.)))*spk*2.2+uAurC*sp*uAur*1.2;', /* (2026-10-21, LE GLACIER EMBELLI) un éclat sur cinq est OR ou ROSE (le clin d'œil CASH) et tous scintillent avec uTime */
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
  '  col=mix(col,col*vec3(.80,.88,1.16),(1.-dif)*.30*(1.-hf*.5));col+=vec3(1.,.78,.46)*uSunC*pow(dif,2.5)*(.04+.11*hf)*(.6+.4*fv);', /* (2026-10-21, LE GLACIER EMBELLI) deux températures : l'ombre des facettes bascule au bleu-violet, la clé chaude se pose sur les pointes éclairées */
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
  '  {vec2 g=q*2.6;vec2 c=floor(g);float h=fh2(c);float pk=step(.93,h)*smoothstep(.30,.05,length(fract(g)-.5))*(1.-smoothstep(25.,90.,dist))*uSpark*(.72+.28*sin(uTime*(1.2+h*5.)+h*90.));',
  '   col+=mix(uSunC*1.6+uSky*.4,mix(vec3(1.,.55,.06),vec3(1.,.10,.46),step(.5,fh2(c+9.1)))*2.0,step(fh2(c+4.3),.18))*pk;}', /* (2026-10-21, LE GLACIER EMBELLI) les paillettes de la glace scintillent (uTime) ; une sur cinq environ est OR ou ROSE : le clin d'œil CASH, aspect seulement */
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
/* ---------------- LA CONSTRUCTION (appelée en fin de buildTrack ; no-op hors de la banquise) ---------------- */
/* (v4) LA PISTE NUE : cacher la route (béton, rails, nappe, ligne, tranche) — par `material.visible` (PISTE_LOD joue sur mesh.visible) ; ce qu'on a
   caché est NOTÉ et rendu à la piste suivante (banqVide : une matière peut être reprise par la piste neuve) */
const BK_NUE=[];
function bkPisteNue(on){
  for(const m of BK_NUE)m.visible=true;BK_NUE.length=0;if(!on)return;
  const cache=m=>{if(m&&m.visible){m.visible=false;BK_NUE.push(m);}};
  for(const m of NEON_RAILS)cache(m);for(const m of NEON_GLOW)cache(m);try{cache(JADE.flank);}catch(e){}
  for(const o of trackMeshes)if(o&&o.traverse)o.traverse(function(c){const mt=c.material;if(!mt||Array.isArray(mt)||c.name==='banquise verglas')return;if((mt.userData&&mt.userData.bitume)||(LIGNE_TEX&&mt.map===LIGNE_TEX))cache(mt);});}
/* (v4) LES PICS DE LA PISTE, AU SOL : la caisse entre dans un cristal = L'IMPACT (la même animation que tous les obstacles), face = du centre du pic vers la caisse */
/* (2026-10-20, Sacha : « des fois on traverse le mur ») LE CHOC SUR UN PIC, BALAYÉ ET À LA LARGEUR DE LA CAISSE : avant, un seul point (le centre) était
   testé, à l'image courante — un pic frôlé par le flanc ne comptait pas, et à grande vitesse (2-3 m par image) la caisse enjambait l'arête d'un pic mince
   entre deux images. Désormais on teste le centre, les deux flancs, le nez et l'arrière, et chaque point à 3 étapes du chemin parcouru depuis l'image
   d'avant. `?sans=glacechoc` = avant. */
const BK_CHOC=!/[?&]sans=([^&]*,)?glacechoc(,|&|$)/.test(location.search),BK_PP={x:0,z:0,ok:false},BK_PT=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
function banqPisteHeurt(){
  if(mode!=='drive'||!BANQ.obst||!BANQ.obst.length||!banqOk()){BK_PP.ok=false;return false;}
  const P=carGroup.position;
  if(graceT>0){BK_PP.x=P.x;BK_PP.z=P.z;BK_PP.ok=true;return false;}
  const ax=BK_PP.ok?BK_PP.x:P.x,az=BK_PP.ok?BK_PP.z:P.z;BK_PP.x=P.x;BK_PP.z=P.z;BK_PP.ok=true;
  const C=CARS[level]||CARS[0],hw=BK_CHOC?C.w*.5:0,hl=BK_CHOC?C.l*.42:0,fx=F.t.x,fz=F.t.z,rx=-fz,rz=fx; /* (F.t : le sens de la route ; le travers = sa perpendiculaire) */
  const dEc=Math.hypot(P.x-ax,P.z-az),nE=BK_CHOC&&dEc>.8?Math.min(16,Math.max(3,Math.ceil(dEc/1.2))):1; /* (2026-10-23, Sacha : « je traverse un pic sans mourir ») le pas du balayage : 3 étapes fixes = 2,2 m entre deux tests à 200 m/s et 30 i/s, 3,5 m à 20 i/s — un pic mince (rayon 5 m au sol) passait entre deux ; désormais un test tous les 1,2 m, quelle que soit la cadence */
  for(const o of BANQ.obst){if(Math.abs(o.s-s)>o.r+10+(BK_CHOC?6:0))continue;
    for(const Q of o.L9){let dx=0,dz=0,hit=false;
      for(let e=1;e<=nE&&!hit;e++){const u=e/nE,cx=ax+(P.x-ax)*u,cz=az+(P.z-az)*u;
        for(let q=0;q<(BK_CHOC?5:1)&&!hit;q++){const px=cx+rx*BK_PT[q][0]*hw+fx*BK_PT[q][1]*hl,pz=cz+rz*BK_PT[q][0]*hw+fz*BK_PT[q][1]*hl,ex=px-Q.cx,ez=pz-Q.cz;
          if(ex*ex+ez*ez>Q.r2)continue;if(bkPrimH(Q,px,pz)<P.y+.35)continue;hit=true;dx=cx-Q.cx;dz=cz-Q.cz;}}
      if(!hit)continue;
      IMP.frais=-1;try{const V=IMP.d.copy(PT_U.uVc.value);let l=V.length();if(!(l>1)){V.copy(F.t);l=1;}V.multiplyScalar(1/l);IMP.v=Math.min(l,200);
        IMP.n.set(dx,0,dz);if(IMP.n.lengthSq()<1e-4)IMP.n.copy(F.t).multiplyScalar(-1);IMP.n.normalize();IMP.c.copy(P);
        IMP.s.copy(P).addScaledVector(IMP.n,-((CARS[level]||CARS[0]).w*.5+.1));IMP.test=null;IMP.mou=true;IMP.frais=performance.now();}catch(e){IMP.frais=-1;}
      shake=Math.max(shake,1.2);explode('glace');return true;}}
  return false;}
function banqVide(){
  bkPisteNue(false);BANQ.obst=[];BANQ.kick=[]; // (v4) la route revient aux autres maps ; les pics et les becs partent avec leur piste
  BANQ.sol=null;BANQ.solM=[];BANQ.pics=[];BANQ.picG=null;BANQ.picM=[];BANQ.loinM=[];BANQ.file=[];BANQ.fi=0;BANQ.msFile=0;
  if(BANQ.root){BANQ.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});BANQ.root=null;}
  BANQ.dz=null;BANQ.deco=null;BANQ.glisse=false;BANQ.pou=false;BANQ.sur=0;BANQ.mort='';BANQ.dNow=9;bkTraceVide();BANQ.verg=[];BKV.sur=false;BKV.yaw=0;BKV.gl=0;BKV.gk=0;bkSkateRaz();BKB.k=0;BKB.enf=0;BKB.dans=false;
}
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé du glacier change depuis le 19/10 (l'axe, les tronçons), pas son décor — la même glace bleue, les mêmes densités de pics,
   de séracs et d'aiguilles, l'amphithéâtre de 7 géants, les aurores vert-violet. Désormais, par piste, un TIRAGE DE DÉCOR dans un flux à lui (`dr`,
   né de la graine du décor), treize choix indépendants (`BANQ.dz`, lisible dans `dbgBanq().deco`) ; les pièces neuves se placent dans `dz2` :
   · LA GLACE (`glace`) : azur (celle d'avant), turquoise, saphir, vert d'eau, laiteuse — l'uniform uIceT multiplié (pics, géants, verglas) : mêmes programmes ;
   · LES PICS OÙ L'ON GLISSE (`pic`) : ×0,6 / 1 / 1,45 et leur hauteur ×0,8-1,3 ;
   · LES SÉRACS (`ser`) : ×0,5 / 1 / 1,8 ;
   · LES AIGUILLES (`aig`) : ×0,5 / 1 / 1,6 et leur hauteur ×0,8-1,35 ;
   · LES GÉANTS DE L'HORIZON (`gea`) : bas / avant / hauts (×0,75-1,3), plus ou moins serrés ;
   · L'AMPHITHÉÂTRE (`amph`) : 4, 7 (avant) ou 11 géants au bout de la descente, plus près ou plus loin ;
   · LE MONUMENT (`mon`, NEUF) : rien, un CIRQUE (8-14 aiguilles en couronne autour d'un vide) ou une CATHÉDRALE (3-5 flèches de 450-900 m serrées) ;
   · LES ORGUES DE GLACE (`org`, NEUF) : 0-2 rangées de colonnes fines (40-95 m) le long de la piste, à ROAD_HALF + 120-170 m ;
   · LES PORTES DE GLACE (`porte`, NEUF) : 0-3 arches en A (deux lames penchées qui se touchent) à 180-320 m de la piste ;
   · LES AURORES (`aur`) : vert-violet (avant), rose-bleu, or-vert, cyan-magenta, et leur force ×0,7-1,5 (uAurC, uAurC2, uAur) ;
   · LA BRUME DE VALLÉE (`brume`) : ×0,6 / 1 / 1,45 (uMistK) ;
   · LA POUDRE DE DIAMANT (`dd`) : ×0,4 / 1 / 2 ;
   · L'ALPENGLOW (`alp`) : ×0,5 / 1 / 1,5, rose ou orangé.
   Rien ne touche la piste : les pièces neuves passent par `libre` (5 m d'air sous la dalle et ses bords) et restent loin d'elle (bkSolD). `?sans=glacierdecor`
   = le décor d'avant, au tirage près (aucun tirage de plus dans `fr`). */
const BK_GLACES=[['azur',1.2,[1,1,1]],['turquoise',1,[.74,1.14,.92]],['saphir',1,[.72,.8,1.32]],['vert d\'eau',.8,[.86,1.2,.78]],['laiteuse',.8,[1.6,1.3,1.12]]];
const BK_AURS=[['vert-violet',1.2,[.25,1,.62],[.75,.30,1]],['rose-bleu',1,[1,.35,.72],[.3,.5,1]],['or-vert',1,[1,.82,.3],[.3,1,.5]],['cyan-magenta',1,[.2,.95,1],[1,.25,.85]]];
function bkDecoTire(seed){
  const dr=mulberry32((seed^0xDEC0B4)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  {const g=pds(BK_GLACES);D.glace=g[2];li.push('glace '+g[0]);}
  {const n=ch([.6,1,1.45]),h=.8+dr()*.5;D.pic={n:n,h:h};li.push('pics ×'+n+' h×'+h.toFixed(2));}
  D.ser=ch([.5,1,1.8]);li.push('séracs ×'+D.ser);
  {const n=ch([.5,1,1.6]),h=.8+dr()*.55;D.aig={n:n,h:h};li.push('aiguilles ×'+n+' h×'+h.toFixed(2));}
  {const g=ch([[.75,1.3,'bas'],[1,1,'comme avant'],[1.3,.85,'hauts']]);D.gea={h:g[0],pas:g[1]};li.push('géants '+g[2]);}
  {const n=ch([4,7,11]),d=ch([.8,1,1.2]);D.amph={n:n,d:d};li.push('amphithéâtre de '+n+(d<1?' (près)':d>1?' (loin)':''));}
  D.mon=pds([['rien',1],['cirque',1.2],['cathédrale',1]])[0];li.push('monument : '+D.mon);
  D.org=pds([[0,1],[1,1.2],[2,.7]])[0];li.push(D.org+' orgue'+(D.org>1?'s':'')+' de glace');
  D.porte=(dr()*4)|0;li.push(D.porte+' porte'+(D.porte>1?'s':'')+' de glace');
  {const a=pds(BK_AURS),k=ch([.7,1,1.5]);D.aur={c:a[2],c2:a[3],k:k};li.push('aurores '+a[0]+' ×'+k);}
  D.brume=ch([.6,1,1.45]);li.push('brume ×'+D.brume);
  D.dd=ch([.4,1,2]);li.push('poudre de diamant ×'+D.dd);
  {const k=ch([.5,1,1.5]),c=dr()<.5?null:[1,.55,.28];D.alp={k:k,c:c};li.push('alpenglow ×'+k+(c?' orangé':''));}
  D.li=li;return D;}
function buildBanq(seed){jadeFini(buildBanqG(seed));} // (2026-10-17, LE PRÉ-BÂTI) d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildBanqG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  banqVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='banquise'||!(NP>1))return;
  const t0=performance.now(),M=banqMats(),fr=mulberry32((seed^0xB4A9C)>>>0),ds=L/(NP-1),KP=PAL_BK('banqPics',1)*(TEL_NATIF?.85:1)*.3; /* (2026-10-25, Sacha : « réduis de 70 % les pics de glace dans la map de glace ») dômes, séracs et aiguilles : 70 % de moins */
  BANQ.graine=(seed>>>0)%100000;BANQ.met=LVL.cur.meteo||'midi';BANQ.n={};
  const DZ=BK_DECOR?bkDecoTire(seed):null,dz2=mulberry32((seed^0xB4DEC)>>>0);BANQ.dz=DZ;BANQ.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage, et le flux des pièces neuves */
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);BANQ.root=root;trackMeshes.push(root);
  const TP=BANQ.tp={},tp=k=>{const n=performance.now();TP[k]=Math.round((n-(tp.t||t0))*10)/10;tp.t=n;};
  banqSol();tp('sol');if(performance.now()>JF.lim)yield;const tS=performance.now();
  banqSolMesh(root);tp('solMesh');if(performance.now()>JF.lim)yield;
  try{bkVerglasPose(root,seed);}catch(e){window.__banqErr=e;}try{bkCongerePose(root);}catch(e){window.__banqErr=e;}tp('verglas'); /* (2026-10-18) LA CONGÈRE du bord */if(performance.now()>JF.lim)yield;
  // ---- la route en grille (les règles de distance) ----
  const HB=100,grille=new Map(),pg=Math.max(1,Math.round(3/ds)); // un point tous les 3 m : un sérac de 8 m ne passe pas entre deux
  for(let i=0;i<NP;i+=pg){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+bz+dz);if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const lat9=i=>{const t=T[i],hl=Math.hypot(t.x,t.z)||1;return [-t.z/hl,t.x/hl];};
  // une grappe ne doit JAMAIS crever la dalle, ni ses bords, ni l'air de la caméra (14 m de chaque côté) : 5 m d'air au moins
  const libre=L9=>{let cx=0,cz=0,r=0;for(const P of L9){cx+=P.cx;cz+=P.cz;}cx/=L9.length;cz/=L9.length;for(const P of L9)r=Math.max(r,Math.hypot(P.cx-cx,P.cz-cz)+P.r);
    let ok=true;const W9=ROAD_HALF+14,LAT9=[-W9,-ROAD_HALF,-ROAD_HALF*.5,0,ROAD_HALF*.5,ROAD_HALF,W9];
    if(bkSolD(cx,cz)<r+W9+90)proches(cx,cz,r+W9,function(j){ /* (loin de toute route, rien à vérifier : la distance de la grille suffit, marge 90 m) */if(!ok)return;const p=pts[j],ex=p.x-cx,ez=p.z-cz;if(ex*ex+ez*ez>(r+W9)*(r+W9))return;const l9=lat9(j);
      for(let q=0;q<7;q++){const l=LAT9[q],x=p.x+l9[0]*l,z=p.z+l9[1]*l;if((x-cx)**2+(z-cz)**2>r*r)continue;
        for(const P of L9){if((x-P.cx)**2+(z-P.cz)**2>P.r2)continue;if(bkPrimH(P,x,z)>p.y-THICK-5){ok=false;return;}}}});
    return ok;};
  const PH=[],KN={},KF={},cle=(x,z,c)=>Math.floor(x/c)*100003+Math.floor(z/c);
  const pose=(L9,phys,loin)=>{for(const P of L9){const C=loin?1500:600,k=cle(P.cx,P.cz,C),D9=loin?KF:KN;(D9[k]||(D9[k]={L:[],x:(Math.floor(P.cx/C)+.5)*C,z:(Math.floor(P.cz/C)+.5)*C,r:C*.71})).L.push(P);if(phys)PH.push(P);}};
  // ---- 1. LES PICS OÙ L'ON GLISSE : des dômes et des pyramides de glace au bord de la route (pente ≤ 1 : 45° au plus) ----
  let nG=0,nS=0,nA=0,nL=0;
  {let sd=fr()<.5?-1:1;for(let s9=380+fr()*120;s9<L-220;s9+=(105+fr()*115)/KP/(DZ?DZ.pic.n:1)){const i=Math.round(s9/ds);if(fr()<.7)sd=-sd;
    let H=(34+fr()*96)*(DZ?DZ.pic.h:1);const pente=.55+fr()*.40,nv=1+((fr()*3)|0),lat=ROAD_HALF+24+H/pente*.5+fr()*120,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    for(let e=0;e<3;e++){const L9=bkGrappe(x,z,bkSolH(x,z)-1.5,H,pente,nv,fr,0);if(libre(L9)){pose(L9,true,false);nG++;break;}H*=.68;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 2. LES SÉRACS : des éclats de glace semés sur la neige, quelques-uns SOUS la route (on les frôle en plongeant) ----
  for(let s9=300+fr()*60;s9<L-150;s9+=(44+fr()*56)/KP/(DZ?DZ.ser:1)){const i=Math.round(s9/ds),sd=fr()<.5?-1:1,sous=fr()<.25,lat=sous?fr()*ROAD_HALF:ROAD_HALF+10+fr()*170,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;
    const H=sous?3+fr()*7:4+fr()*13,L9=bkGrappe(x,z,bkSolH(x,z)-.8,H,.6+fr()*.55,(fr()*3)|0,fr,0);if(libre(L9)){pose(L9,true,false);nS++;}}
  if(performance.now()>JF.lim)yield;
  // ---- 3. LES AIGUILLES : des flèches de 110 à 420 m, trop raides pour y glisser (on y meurt) ----
  {let sd=fr()<.5?-1:1;for(let s9=200+fr()*200;s9<L;s9+=(115+fr()*120)/KP/(DZ?DZ.aig.n:1)){const i=Math.min(NP-1,Math.round(s9/ds));sd=-sd;
    const H=(110+fr()*310)*(DZ?DZ.aig.h:1),lat=230+fr()*640,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<200)continue;
    const L9=bkGrappe(x,z,bkSolH(x,z)-6,H,2.2+fr()*1.8,3+((fr()*5)|0),fr,1);if(libre(L9)){pose(L9,true,false);nA++;}}}
  if(performance.now()>JF.lim)yield;
  // ---- 4. LES GÉANTS : l'horizon de glace (400 m à 1,3 km de haut, de 1,1 à 3,6 km de la route) — décor, sans physique ----
  {const KL=PAL_BK('banqLoin',1);for(let s9=0;s9<L+600;s9+=230/KL*(DZ?DZ.gea.pas:1)){const i=Math.min(NP-1,Math.round(s9/ds));for(const sd of [-1,1]){if(fr()<.12)continue;
    const lat=1100+fr()*2500,l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<900)continue;
    const H=(380+fr()*920)*(DZ?DZ.gea.h:1);pose(bkGrappe(x,z,bkSolH(x,z)-20,H,1.4+fr()*1.5,3+((fr()*5)|0),fr,2,420),false,true);nL++;}}
   // l'avant et l'arrière de la descente : le grand amphithéâtre au loin, dans l'axe
   for(const fin of [0,1]){const i=fin?NP-1:0,t=T[i],hl=Math.hypot(t.x,t.z)||1,dx=t.x/hl*(fin?1:-1),dz=t.z/hl*(fin?1:-1);
     const nA9=DZ?DZ.amph.n:7;for(let k=0;k<nA9;k++){const a=(DZ?(k-(nA9-1)/2)*2.24/nA9:(k-3)*.32)+(fr()-.5)*.2,c=Math.cos(a),s9=Math.sin(a),d=(2400+fr()*1800)*(DZ?DZ.amph.d:1),x=pts[i].x+(dx*c-dz*s9)*d,z=pts[i].z+(dz*c+dx*s9)*d;
       const H=600+fr()*900;pose(bkGrappe(x,z,bkSolH(x,z)-40,H,1.5+fr()*1.2,4+((fr()*4)|0),fr,2,520),false,true);nL++;}}}
  if(performance.now()>JF.lim)yield;
  /* ---- 4 ter (2026-10-20, LE DÉCOR AU HASARD) LES PIÈCES NEUVES : le monument, les orgues, les portes de glace (le flux dz2 ; mêmes cristaux, même matière) ---- */
  let nM9=0;
  if(DZ){const lieu=(f,lat0,lat1,dMin,e9)=>{for(let e=0;e<(e9||20);e++){const i=Math.max(0,Math.min(NP-1,Math.round((f+(e?(dz2()-.5)*.3:0))*(NP-1)))),l9=lat9(i),sd=dz2()<.5?-1:1,lat=lat0+dz2()*(lat1-lat0),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)>=dMin)return [x,z,i,sd];}return null;};
    if(DZ.mon==='cirque'){const o=lieu(.25+dz2()*.5,620,900,480);if(o){const R9=130+dz2()*60,n=8+((dz2()*7)|0),a0=dz2()*6.283;
      for(let k=0;k<n;k++){const an=a0+k/n*6.2832,x=o[0]+Math.cos(an)*R9,z=o[1]+Math.sin(an)*R9;if(bkSolD(x,z)<300)continue;const L9=bkGrappe(x,z,bkSolH(x,z)-6,(160+dz2()*220)*(.8+.4*Math.abs(Math.sin(an*1.5))),2.6+dz2()*1.4,2+((dz2()*3)|0),dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}}
    else if(DZ.mon==='cathédrale'){const o=lieu(.2+dz2()*.6,800,1150,650);if(o){const n=3+((dz2()*3)|0);
      for(let k=0;k<n;k++){const an=dz2()*6.283,r9=k?60+dz2()*90:0,x=o[0]+Math.cos(an)*r9,z=o[1]+Math.sin(an)*r9;const L9=bkGrappe(x,z,bkSolH(x,z)-10,(k?450:700)+dz2()*250,3+dz2()*1.5,3+((dz2()*3)|0),dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}}
    for(let r=0;r<DZ.org;r++){const f0=.12+dz2()*.7,sd=dz2()<.5?-1:1,lg=300+dz2()*220,i0=Math.round(f0*(NP-1)),lat=ROAD_HALF+120+dz2()*50;
      for(let s9=i0*ds;s9<Math.min(L-200,i0*ds+lg);s9+=30+dz2()*16){const i=Math.round(s9/ds),l9=lat9(i),x=pts[i].x+l9[0]*sd*lat,z=pts[i].z+l9[1]*sd*lat;if(bkSolD(x,z)<ROAD_HALF+100)continue;
        const L9=bkGrappe(x,z,bkSolH(x,z)-3,40+dz2()*55,5+dz2()*2,(dz2()*2)|0,dz2,1);if(libre(L9)){pose(L9,true,false);nM9++;}}}
    for(let k=0;k<DZ.porte;k++){const o=lieu(.1+dz2()*.8,180,320,160);if(!o)continue;const t9=T[o[2]],hl=Math.hypot(t9.x,t9.z)||1,ux=t9.x/hl,uz=t9.z/hl,H=60+dz2()*55,w=H*(.55+dz2()*.25),yb=bkSolH(o[0],o[1])-4,L9=[];
      for(const sg of [-1,1])L9.push(bkPrim(o[0]+ux*sg*w,o[1]+uz*sg*w,yb,H,H/4.2,6,-ux*sg*w*.92,-uz*sg*w*.92,dz2()*6.28,dz2,1)); /* deux lames penchées l'une vers l'autre (sommet décalé de lx, lz) : elles se touchent en haut */
      if(libre(L9)){pose(L9,true,false);nM9++;}}}
  BANQ.n.decoNeuf=nM9;
  if(performance.now()>JF.lim)yield;
  // ---- 4 bis (v4). LA PISTE : LES BECS DE GLACE, puis LES PICS SUR LA PISTE, en figures ----
  BANQ.obst=[];BANQ.kick=[];
  {const fr=mulberry32((seed^0xB0B57AC)>>>0) /* (2026-10-22, DEBUGGING : LA PISTE a SON flux — les multiplicateurs du DÉCOR AU HASARD (pics, séracs, aiguilles, géants, amphithéâtre) changent le NOMBRE de tirages de `fr` des sections 1-4 : MESURÉ, même pistegraine, 16 pics sur la piste avec le décor contre 14 sans (23 contre 15), et les pièces qui les évitent — le décor rebattait les obstacles de la route) */,RH=ROAD_HALF,kRH=RH/61.6,O=BANQ.obst,KK=BANQ.kick,ou=(s9,la)=>{const i=Math.max(0,Math.min(NP-1,Math.round(s9/ds))),p=pts[i],b=B[i];return [p.x+b.x*la,p.y+b.y*la,p.z+b.z*la];};
    const libreK=(s9,la,r,ov)=>{for(const k of KK){if(s9>k.s-k.lg-60&&s9<k.s+260&&la+r>k.l0-8&&la-r<k.l1+8)return false;if(BK_RETOMBE&&s9+r>k.s&&s9-r<k.s+BK_BEC.retombe)return false;} /* (2026-10-18) 60 m d'approche dégagés devant la rampe (au banc, on percutait un pic en visant le tremplin), et sa retombée : 260 m (à 45°, on vole loin) — (2026-10-19) puis BK_BEC.retombe m sur TOUTE la largeur (voir BK_RETOMBE) */if(!ov)for(const o of O)if(Math.abs(o.s-s9)<o.r+r+8&&Math.abs(o.lat-la)<o.r+r+8)return false;return true;}; // ni sur un bec ni dans sa retombée, ni collé à un autre pic
    let gdPic=true; /* (2026-10-25) faux = la figure en cours n'a aucun pic */const pic=(s9,la,H,pente,ov)=>{if(!gdPic)return false;{const i=Math.max(3,Math.min(NP-4,Math.round(s9/ds))),a=pts[i-3],c=pts[i+3];pente+=Math.max(0,(a.y-c.y)/Math.max(1,Math.hypot(a.x-c.x,a.z-c.z)));} /* (2026-10-18) + la PENTE de la piste : à 45°, le flanc aval d'un pic à 55° (1,4) devenait presque parallèle à la glace — une lame basse de 30 à 50 m qu'on croyait franchir et qui tuait (« des problèmes de collision avec la glace ») ; sa face aval garde désormais, par rapport à la piste, la raideur qu'elle aurait sur le plat */const R=H/pente;if(Math.abs(la)>RH-R*.35-3||!libreK(s9,la,R,ov))return false;const q=ou(s9,la);
      const L9=bkGrappe(q[0],q[2],q[1]-.4,H,pente,(fr()*3)|0,fr,1.4,Math.max(9,R*1.1)); /* (pied profond : sur la pente raide, le côté aval ne flotte pas) fam 1,4 : une aiguille pour la physique, mais COIFFÉE DE NEIGE (BK_PIC_FS) */pose(L9,true,false);let r=0;for(const P of L9)r=Math.max(r,Math.hypot(P.cx-q[0],P.cz-q[2])+P.r);
      O.push({s:s9,lat:la,L9:L9,r:r,x:q[0],z:q[2]});return true;};
    const bec=(s9,c,w)=>{{const cap9=s=>{const t0=T[Math.min(NP-1,Math.round((s+BK_BEC.lg)/ds))],t1=T[Math.min(NP-1,Math.round((s+BK_BEC.lg+BK_BEC.droit)/ds))];return Math.abs(Math.atan2(t0.x*t1.z-t0.z*t1.x,t0.x*t1.x+t0.z*t1.z));};
      let o=0;while(o<=240&&cap9(s9+o)>.55)o+=30;if(o>240)return;s9+=o;} /* (2026-10-18) jamais devant un virage : à 45°, un vol couvre 250-450 m — posé avant une courbe, il retombait à côté de la piste ; on cherche la portion presque droite (< 31° de cap sur BK_BEC.droit m) jusqu'à 240 m plus loin */c=THREE.MathUtils.clamp(c,-RH+w/2+6,RH-w/2-6);KK.push({s:s9+BK_BEC.lg,l0:c-w/2,l1:c+w/2,lg:BK_BEC.lg,h:BK_BEC.h});return s9+BK_BEC.lg;}; // (2026-10-18) s = la LÈVRE du tremplin ; sa rampe monte sur les lg m d'avant
    /* (2026-10-18, Sacha : « moins d'obstacles sur la route ») une figure tous les ~0,6-1 km (0,3-0,5 avant) et moins de pics dans chacune (fourche 3-5,
       champ 5-7, îlot 2-3) — ~4 × moins de pics ; (« les tremplins doivent être plus beaux, gros et visibles ») un TREMPLIN avant deux figures sur trois,
       et un tremplin seul au milieu d'une longue descente sur deux (voir BK_BEC) */
    let sp=Math.max(560,3*(70+(lvPiste()-1)*100))+fr()*120; /* (2026-10-24, passe perf — Sacha : « tu peux mourir sans voir des obstacles arriver ») la 1re figure à 3 s de croisière du palier au moins (la croisière de la piste, vC9) : à 560 m elle tombait 1,2 à 2 s après le portail en fin de partie, voile compris ; au palier de départ rien ne change (210 m < 560) */
    while(sp<L-380){const f0=fr(),f=sp<1800?.5+f0*.5:sp>L*.6?f0*.85:f0;gdPic=f<.30||fr()<.3; /* (2026-10-25) la bifurcation, le massif et la fourche (f<.30) gardent leurs pics ; slalom, champ, porte et îlot : 30 % des figures seulement */ /* (2026-10-23, Sacha : « prends des initiatives ») LA COURBE DE DIFFICULTÉ : les 1 800 premiers mètres n'ont que des figures faciles (champ, porte, îlot — on apprend à lire la glace), puis tout arrive ; passé 60 % de la descente le tirage penche vers les grosses figures (bifurcation, massif, fourche, slalom) et les figures se resserrent (voir gap) */
      if(fr()<.65){const k9=bec(sp,(fr()*2-1)*RH*.45,36+fr()*22),j9=BK_BEC.lg+100+fr()*30;sp=k9!=null&&BK_RETOMBE?Math.max(sp+j9,k9+BK_BEC.retombe):sp+j9;} // un TREMPLIN, le plus souvent juste avant une figure : on peut la survoler — (2026-10-19) elle attend la fin de sa retombée (BK_RETOMBE)
      if(f<.10){ /* (2026-10-23, Sacha : « la route de verglas se sépare en deux routes et on doit choisir un chemin ») LA BIFURCATION : une longue crête (~400 m, jusqu'à 90 m de haut) coupe la
         piste en deux couloirs aux caractères opposés — l'un est LIBRE et finit sur un TREMPLIN (le chemin du plaisir), l'autre est SEMÉ de petits pics (le chemin du risque, pour qui aime
         tenir sa ligne) ; on voit les deux de loin, on choisit avant que la crête se referme sur soi */
        const c=(fr()-.5)*10,n=10+((fr()*3)|0),pas=34+fr()*6,sg=fr()<.5?-1:1,lc=c+sg*(RH+40)/2,la=c-sg*(RH+40)/2; // lc : le couloir du risque · la : le couloir libre
        for(let j=0;j<n;j++){const u=j/(n-1);pic(sp+j*pas,c+(fr()-.5)*5,(34+56*Math.sin(Math.PI*(.06+.88*u)))*(.92+fr()*.16),1.3+fr()*.4,true);}
        for(let j=0;j<5;j++)pic(sp+70+j*((n-1)*pas-140)/4,lc+(j%2?1:-1)*(10+fr()*5),10+fr()*7,1.8+fr()*.4);
        sp+=(n-1)*pas+80;
        {const k9=bec(sp,la,46);if(k9!=null)sp=BK_RETOMBE?Math.max(sp,k9+BK_BEC.retombe):k9+120;}}
      else if(f<.24){ /* (2026-10-21, Sacha : « rajoute des éléments sur la piste, comme une montagne au milieu qui sépare la route en deux ») LE MASSIF : une vraie montagne de 30 à 80 m
         dans l'axe de la piste, une crête de pics soudés (nez bas, sommet au milieu, queue qui retombe) ; on choisit son COULOIR — la voie large à gauche, le
         raccourci étroit à droite, ou l'inverse — et à la sortie du couloir large un TREMPLIN lance vers la suite (la montagne ne se franchit pas : on la contourne, ou on la grimpe en glissant sur ses flancs doux) */
        const c=(fr()-.5)*34,n=6+((fr()*3)|0),pas=34+fr()*8;
        for(let j=0;j<n;j++){const u=j/(n-1);pic(sp+j*pas,c+(fr()-.5)*7,(24+54*Math.sin(Math.PI*(.1+.8*u)))*(.92+fr()*.16),1.3+fr()*.45,true);}
        sp+=(n-1)*pas+80;
        {const wL=c-42+RH,wR=RH-c-42,cl=wL>wR?(-RH+(c-42))/2:(RH+(c+42))/2,wl=Math.max(wL,wR); // le couloir le plus large reçoit le tremplin de sortie
          if(wl>46&&fr()<.8){const k9=bec(sp,cl,Math.min(52,wl-14));if(k9!=null)sp=BK_RETOMBE?Math.max(sp,k9+BK_BEC.retombe):k9+120;}}}
      else if(f<.30){const c=(fr()-.5)*14,n=3+((fr()*3)|0),pas=34+fr()*16; // LA FOURCHE : une arête au milieu, deux couloirs
        for(let j=0;j<n;j++)pic(sp+j*pas,c+(fr()-.5)*8,12+fr()*14,1.7+fr()*.8);sp+=n*pas;}
      else if(f<.42){ /* (2026-10-23, Sacha : « ajoute d'autres éléments de gameplay sur le glacier ») LE SLALOM : des pics en quinconce, un à gauche puis un à droite de l'axe, assez
         serrés pour qu'il faille vraiment zigzaguer — la caisse qui glisse sur la glace se balance d'une trouée à l'autre, un rythme à prendre */
        const c=(fr()-.5)*20,n=6+((fr()*3)|0),pas=70+fr()*20,am=15+fr()*5,sg0=fr()<.5?-1:1;
        for(let j=0;j<n;j++)pic(sp+j*pas,c+sg0*(j%2?1:-1)*am,15+fr()*8,1.7+fr()*.5);
        sp+=n*pas;}
      else if(f<.64){const lg=140+fr()*80,n=Math.round((4+((fr()*3)|0))*kRH*1.05); // LE CHAMP : des pics semés, des trouées — (kRH : la largeur ÷ celle de 123 m) — (2026-10-18) 5-7 pics, au lieu de 11-18
        for(let j=0,e=0;j<n&&e<n*4;e++){if(pic(sp+fr()*lg,(fr()*2-1)*(RH-10),6+fr()*14,1.4+fr()*1.2))j++;}sp+=lg;}
      else if(f<.82){const gw=26+fr()*12,g=(fr()*2-1)*(RH*.45); // LA PORTE : deux géants, une trouée à viser
        for(const sg of [-1,1]){const H=26+fr()*14,pe=1.8+fr()*.6;pic(sp+(fr()-.5)*6,g+sg*(gw/2+H/pe*.85),H,pe);}sp+=40;}
      else{const sg=fr()<.5?-1:1,n=2+((fr()*2)|0); // L'ÎLOT : un massif d'un côté, le large de l'autre
        for(let j=0;j<n;j++)pic(sp+fr()*70,sg*(RH*.35+fr()*RH*.4),10+fr()*16,1.5+fr()*.9);sp+=70;}
      const gap=(270+fr()*300)*(1.2-.5*Math.min(1,sp/L));let kS=null;if(gap>400&&fr()<.5&&sp+gap*.5<L-380)kS=bec(sp+gap*.4,(fr()*2-1)*RH*.5,36+fr()*22); // un TREMPLIN seul, au milieu de la descente : pour le plaisir de voler
      sp=kS!=null&&BK_RETOMBE?Math.max(sp+gap,kS+BK_BEC.retombe):sp+gap;} // (2026-10-19) la figure suivante attend la fin de sa retombée
    if(KK.length)bkBecMesh(root,KK); // (2026-10-18) LE TREMPLIN DE GLACE : la rampe, sa lèvre, ses balises
    BANQ.n.pistePics=O.length;BANQ.n.becs=KK.length;}
  if(performance.now()>JF.lim)yield;
  BANQ.picM=[];BANQ.loinM=[];
  for(const k in KN){const o=KN[k];bkTache(o.x,o.z,function(){const K=bkLot();for(const P of o.L)bkPrimGeo(K,P);const m=bkMesh(root,K,M.pic,'banquise pics');if(m)BANQ.picM.push(m);});BANQ.file[BANQ.file.length-1].d=Math.max(0,BANQ.file[BANQ.file.length-1].d-o.r);}
  for(const k in KF){const o=KF[k];bkTache(o.x,o.z,function(){const K=bkLot();for(const P of o.L)bkPrimGeo(K,P);const m=bkMesh(root,K,M.loin,'banquise géants');if(m){m.renderOrder=-.5;BANQ.loinM.push(m);}});}
  tp('pics');
  if(performance.now()>JF.lim)yield;
  if(performance.now()>JF.lim)yield;
  // ---- la physique des pics en grille de 120 m ----
  {const CG=120,G=new Map();for(const P of PH){const r=P.r,i0=Math.floor((P.cx-r)/CG),i1=Math.floor((P.cx+r)/CG),j0=Math.floor((P.cz-r)/CG),j1=Math.floor((P.cz+r)/CG);
     for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*100003+j;let a=G.get(k);if(!a)G.set(k,a=[]);a.push(P);}}
   BANQ.picG={CG:CG,G:G};BANQ.pics=PH;}
  BANQ.n.glisse=nG;BANQ.n.seracs=nS;BANQ.n.aiguilles=nA;BANQ.n.geants=nL;BANQ.n.prims=PH.length;
  if(performance.now()>JF.lim)yield;
  BANQ.file.sort(function(a,b){return a.d-b.d;});BANQ.fi=0;bkTranches(1e9,BK_TOUT);tp('depart');BANQ.nFile=BANQ.file.length-BANQ.fi;
  bkPisteNue(true); // plus de route : la glace seule
  tp('grille');BANQ.ms=Math.round(performance.now()-t0);BANQ.msSol=Math.round(tS-t0);BANQ.yRaz=true;
  banqMeteo(BANQ.met,started?bioPortDur():.01);
}
/* ---------------- LA SURFACE : ce qu'il y a sous la caisse (neige, lac, pic) ---------------- */
const BKS={ok:false,h:0,nx:0,ny:1,nz:0,t:0,hs:0};
function banqSurf(x,z){
  const S=BANQ.sol;BKS.ok=false;if(!S)return BKS;
  const fx=(x-S.x0)/S.C,fz=(z-S.z0)/S.C;if(fx<0||fz<0||fx>S.nx-1.001||fz>S.nz-1.001)return BKS;
  const i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,H=S.h,a=H[k],b=H[k+1],c=H[k+S.nx],d=H[k+S.nx+1];
  const h=(a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v,gx=((b-a)*(1-v)+(d-c)*v)/S.C,gz=((c-a)*(1-u)+(d-b)*u)/S.C,nl=Math.hypot(gx,1,gz);
  BKS.ok=true;BKS.h=h;BKS.hs=h;BKS.nx=-gx/nl;BKS.ny=1/nl;BKS.nz=-gz/nl;BKS.t=1;
  const G=BANQ.picG;if(G){const A9=G.G.get(Math.floor(x/G.CG)*100003+Math.floor(z/G.CG));
    if(A9)for(let q=0;q<A9.length;q++){const P=A9[q];if((x-P.cx)*(x-P.cx)+(z-P.cz)*(z-P.cz)>P.r2)continue;const F=P.F;let hm=1e9,fi=0;
      for(let e=0;e<F.length;e+=4){const y=(F[e+3]-F[e]*x-F[e+2]*z)/F[e+1];if(y<hm){hm=y;fi=e;}}
      if(hm>P.by&&hm>BKS.h){BKS.h=hm;BKS.nx=F[fi];BKS.ny=F[fi+1];BKS.nz=F[fi+2];BKS.t=3;}}}
  return BKS;}
function banqOk(){return !!(BANQ.root&&BANQ.sol&&LVL.cur&&LVL.cur.id==='banquise'&&!PARK.on);}
/* ---------------- EN VOL : LA NEIGE ET LA GLACE (branche 'fall', AVANT que la position avance) ----------------
   On regarde la surface LÀ OÙ LA CAISSE SERA à la fin de l'image ; d = la profondeur du DESSOUS de la caisse sous cette surface.
   · LA GLACE (lac, pic) : contact → si la facette est trop raide ou le choc trop de face : 'glace' (relevé par banqHeurt) ; un gros choc
     à plat sur un lac : la caisse REBONDIT (le galet) ; sinon elle GLISSE : on retire la vitesse qui entre dans la glace, on la pose
     dessus, presque aucune friction, la pente accélère, et le volant ne tourne que 42 % de la trajectoire (le reste DÉRIVE la caisse).
   · LA POUDREUSE : dedans, elle porte (×g sur 1,4 m), elle TASSE (la vitesse qui entre est mangée en ~1/16 s), elle freine d'autant plus
     qu'on s'enfonce, et vite, la caisse PLANE dessus. La mort se lit dans banqHeurt (au-delà de BK_PH.prof). */
const BK_V=new THREE.Vector3(),BK_V2=new THREE.Vector3(),BK_N=new THREE.Vector3(),BK_R=new THREE.Vector3(),BK_M4=new THREE.Matrix4(),BK_Q=new THREE.Quaternion();
function banqLache(){if(BANQ.glisse)banqDecolle();BANQ.sur=0;BANQ.pou=false;}
/* LE VOLANT EN L'AIR AU GLACIER (2026-10-19, Sacha : « je meurs sans raison sur la route de glace dans la map montagne »). En vol, le lacet tourne
   la vitesse autour du HAUT DE LA CAISSE (FLY_U, « vol libre ») ; au glacier la caisse vole piquée de 35 à 45° (la pente) : son haut penche, et
   chaque coup de volant changeait un peu de CHUTE en dérive de côté, que le plafond de l'avance horizontale (fallVH0) rabotait ensuite. La
   caisse qu'on pilotait FLOTTAIT : sa vitesse vers la glace restait vers −15 pendant 3 s au lieu de croître. MESURÉ au banc (le pilote de vol,
   qui ramène vers l'axe, sur les mêmes tremplins) : à 500 km/h, 850 à 1 320 m et 4,8 à 7,1 s de vol (sans braquer : 500 m, 3 s) ; à 700 km/h
   la caisse ne se posait plus (sortie de piste, « vide ») ; nitro tenue, 8 s. Au-delà de la jauge d'air (6 s), on explosait en plein ciel, 50
   à 90 m au-dessus de la piste. Désormais, au glacier, le volant ne tourne que le CAP : la vitesse verticale et l'avance horizontale restent.
   MESURÉ (3 tremplins × 350, 500, 700 km/h, avec et sans nitro : 18 vols) : tous posés, de 0,9 à 2,9 s (4,1 s au plus nitro tenue), de 84 à
   705 m. `?sans=glacelacet` = avant. Ailleurs, rien ne change. */
const BK_LACET=!/[?&]sans=([^&]*,)?glacelacet(,|&|$)/.test(location.search);
function banqLacet(v,a){ // le lacet du vol, à chaque image (la boucle, VOL)
  if(!(BK_LACET&&banqOk())){v.applyAxisAngle(FLY_U,a);return;}
  const vy=v.y,h0=Math.hypot(v.x,v.z);v.applyAxisAngle(FLY_U,a);const h1=Math.hypot(v.x,v.z);v.y=vy;if(h1>1e-6){v.x*=h0/h1;v.z*=h0/h1;}}
function banqSolVol(dt,dtF){
  if(!banqOk()){if(BANQ.sur||BANQ.glisse)banqLache();return;}
  const p=fallPos,v=fallVel,k9=dtF*SPD,S=banqSurf(p.x+v.x*k9,p.z+v.z*k9);
  if(!S.ok){banqLache();return;}
  if(S.t===1&&curNear&&Math.abs(curLatOff)<ROAD_HALF+BK_CG.w+3&&curHOff>-6){if(BANQ.sur||BANQ.glisse||BANQ.pou)banqLache();return;} // (2026-10-18) au-dessus de la piste et de sa congère, c'est la PISTE qui reçoit (tryLand) : la grille de neige (cases de 34-40 m) y passait par endroits AU-DESSUS de la glace — « poudreuse » en plein vol, au-dessus de la piste
  const py=p.y+v.y*k9,d=S.h-py,nx=S.nx,ny=S.ny,nz=S.nz,vn=v.x*nx+v.y*ny+v.z*nz,g=FALL_G*gK();
  if(S.t>=2){ // ---- LA GLACE ----
    if(BANQ.pou)BANQ.pou=false;
    const colle=BANQ.glisse?BK_PH.colle:.04;
    if(d>-colle&&(vn<1.5||(BANQ.glisse&&vn<5))){
      if(!BANQ.glisse){
        const vv=Math.max(1,v.length()),sinA=-vn/vv;
        if(ny<BK_PH.nyMin||(-vn>BK_PH.vnMort&&sinA>BK_PH.sinMax)){BANQ.mort='glace';BANQ.pourquoi=(ny<BK_PH.nyMin?'raide ':'choc ')+ny.toFixed(2)+' vn '+(-vn).toFixed(0)+' sin '+sinA.toFixed(2);return;}
        banqTouche(S,-vn,vv);
        BANQ.glisse=true;BANQ.gT=0;BANQ.dT=0;BANQ.nS.set(nx,ny,nz);}
      if(vn<0){v.x-=nx*vn;v.y-=ny*vn;v.z-=nz*vn;}
      p.y=Math.max(p.y,S.h+.03-v.y*k9);                                                // posée SUR la glace à la fin de l'image
      {const kf=Math.exp(-BK_PH.frG*dtF);v.multiplyScalar(kf);}
      {const yi=veqVolant()*lacetVol(v.length())*dtF;if(yi)v.applyAxisAngle(FLY_U,-yi*(1-BK_PH.grip));} // le volant mord moins : la caisse DÉRIVE
      BK_N.set(nx,ny,nz);BANQ.nS.lerp(BK_N,Math.min(1,dt*14)).normalize();FLY_U.copy(BANQ.nS);
      fallVH0=Math.max(fallVH0,Math.hypot(v.x,v.z));fallTR=Math.max(0,fallTR-dt*3);
      BANQ.sur=S.t;BANQ.gT+=dt;BANQ.tG=S.t;
    }else if(BANQ.glisse&&(d<-1.8||vn>5))banqDecolle();
    return;}
  // ---- LA POUDREUSE ----
  if(BANQ.glisse){BANQ.glisse=false;BANQ.gFin=performance.now();if(vn<0&&d>-.6){v.x-=nx*vn*.85;v.y-=ny*vn*.85;v.z-=nz*vn*.85;}} // de la glace à la neige : on y entre À PLAT, la glisse continue en poudre
  if(d>0){
    const f=Math.min(1,d/BK_PH.H),hv=Math.hypot(v.x,v.z);
    if(!BANQ.pou){BANQ.pou=true;BANQ.pT=0;banqPlouf(-vn,hv);}
    v.x+=nx*g*BK_PH.flot*f*dtF;v.y+=ny*g*BK_PH.flot*f*dtF;v.z+=nz*g*BK_PH.flot*f*dtF;                       // la poudre PORTE
    {const vn2=v.x*nx+v.y*ny+v.z*nz;if(vn2<0){const kk=1-Math.exp(-BK_PH.kN*dtF*Math.min(1,.35+f));v.x-=nx*vn2*kk;v.y-=ny*vn2*kk;v.z-=nz*vn2*kk;}} // elle TASSE
    {const kt=Math.exp(-(BK_PH.kT+BK_PH.kTp*f*f)*dtF);v.x*=kt;v.z*=kt;}                               // elle freine (à peine au ras)
    if(hv>BK_PH.vPl){const pl=Math.min(1,(hv-BK_PH.vPl)/60);v.y+=g*BK_PH.lift*pl*pl*Math.min(1,f*3)*dtF;} // le PLANING : vite, on surfe
    if(d>BK_PH.prof*.7){p.y=Math.max(p.y,S.h-BK_PH.prof*.7-v.y*k9);const vn3=v.x*nx+v.y*ny+v.z*nz;if(vn3<0){v.x-=nx*vn3;v.y-=ny*vn3;v.z-=nz*vn3;}} // (2026-10-18, Sacha : « on s'enfonce dans la neige, ça ralentit mais ça tue pas ») la poudre du glacier ne t'avale plus : elle te tient sous la surface
    fallTR=Math.max(0,fallTR-dt*3);BANQ.sur=1;BANQ.pT+=dt;
  }else{BANQ.sur=d>-.7?1:0;if(BANQ.pou&&d<-1.2)BANQ.pou=false;}
  if(d>-1.5){BK_N.set(nx,ny,nz);FLY_U.lerp(BK_N,Math.min(1,dt*5)).normalize();} // au ras de la neige, la caisse SURFE : son haut suit la pente (et la caméra reste au-dessus)
}
function banqDecolle(){
  BANQ.glisse=false;BANQ.gFin=performance.now();
  if(BANQ.gT>.25&&fallVel.y*SPD>9){BANQ.figs.trp=(BANQ.figs.trp|0)+1;try{addTrick('bk_trp',sansAcc(TR('TREMPLIN DE GLACE !')),10,2);flowAdd(8,'risque');hap([10,20,30]);}catch(e){}} // l'arête d'un pic : un TREMPLIN
  BANQ.gT=0;}
/* LE CONTACT AVEC LA GLACE : le son, la gerbe de givre, la figure */
function banqTouche(S,vn,vv){
  const k=Math.min(1,vn/40);shake=Math.max(shake,.15+.35*k);fovPunch=Math.max(fovPunch,3+6*k);hap(k>.5?[14,20]:[8]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.craque')&&sfx('banq.craque',{vol:-6+6*k})))sfx('pose.choc',{vol:-10+6*k});}else noiseBurst(.22,.08+.08*k,3600);}catch(e){}
  banqGivre(fallPos,18+40*k,vv*SPD*.35);
  const fg=BANQ.figs;if(!fg.glace){fg.glace=1;try{addTrick('bk_glace',sansAcc(TR(S.t===3?'SUR LE PIC !':'GLISSE !')),8,1);flowAdd(5,'style');}catch(e){}}}
function banqPlouf(vn,hv){
  const k=Math.min(1,Math.max(0,vn)/50);shake=Math.max(shake,.2+.4*k);fovPunch=Math.max(fovPunch,4+7*k);hap(k>.5?[16,24]:[8]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.plouf')&&sfx('banq.plouf',{vol:-6+7*k})))sfx('nuage.entre',{vol:-2+4*k});}else noiseBurst(.4,.10+.08*k,700);}catch(e){}
  banqGerbe(fallPos,26+60*k,hv,1);
  const fg=BANQ.figs;if(!fg.pou){fg.pou=1;try{addTrick('bk_pou',sansAcc(TR('POUDREUSE !')),8,1);flowAdd(5,'risque');}catch(e){}}}
/* L'ASSIETTE SUR LA GLACE (après les figures) : le haut de la caisse = la normale de la glace, le nez = la trajectoire TOURNÉE de l'angle
   de dérive (`BANQ.drift`, qui suit le volant) — la caisse glisse de travers, comme un snowboard qui carve. */
function banqAssiette(dt){
  if(!BANQ.glisse)return;const n=BANQ.nS;
  BK_V.copy(fallVel).addScaledVector(n,-fallVel.dot(n));if(BK_V.lengthSq()<4){BK_V.set(0,0,1).applyQuaternion(carGroup.quaternion);BK_V.addScaledVector(n,-BK_V.dot(n));}
  BK_V.normalize();const tg=THREE.MathUtils.clamp(steer,-1,1)*1.05;BANQ.drift+=(tg-BANQ.drift)*(1-Math.exp(-dt*4));
  BK_V.applyAxisAngle(n,BANQ.drift);BK_R.crossVectors(n,BK_V).normalize();BK_V.crossVectors(BK_R,n).normalize();
  BK_M4.makeBasis(BK_R,n,BK_V);BK_Q.setFromRotationMatrix(BK_M4);carGroup.quaternion.slerp(BK_Q,Math.min(1,dt*14));airRoll=0;}
/* CE QUI TUE (après l'avance de la position, dans la chaîne des morts du vol) : s'enfoncer au-delà de BK_PH.prof dans la poudreuse ; percer la
   glace ; ce que banqSolVol a jugé (le choc de face, la facette trop raide). Note la surface sous la caisse pour les effets (banqTick). */
function banqHeurt(p){
  if(!BANQ.root)return '';
  if(BANQ.mort){const m=BANQ.mort;BANQ.mort='';banqMortFx(m);return m;}
  const S=banqSurf(p.x,p.z);if(!S.ok){BANQ.dNow=99;BANQ.tNow=0;return '';}
  const d=S.h-p.y;BANQ.dNow=d;BANQ.tNow=S.t;BANQ.hNow=S.h;
  // (2026-10-18) la poudre du glacier ne tue plus (on y est tenu sous la surface : banqSolVol) — était : au-delà de BK_PH.prof, 'poudreuse'
  if(S.t>=2&&d>1.6){BANQ.pourquoi='percée '+d.toFixed(1)+' ny '+S.ny.toFixed(2);banqMortFx('glace');return 'glace';}
  return '';}
function banqMortFx(m){bkSkateRaz();try{if(m==='poudreuse')banqGerbe(fallPos,120,Math.hypot(fallVel.x,fallVel.z),2.2);else banqGivre(fallPos,90,30);}catch(e){}banqLache();bkTraceCoupe();}
/* LA MONTAGNE TE RAMÈNE : arrêté dans la neige ou sur la glace, sans nitro (la chaîne seule est perdue, comme la mer de la jade) */
function banqRamene(){
  BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;BANQ.lent=0;bkSkateRaz();airPie.style.display='none';airFlash=0;bkTraceCoupe();
  
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0;
  try{popTexte(sansAcc(TR('LA MONTAGNE TE RAMENE')),'#9fe8ff',2);}catch(e){}try{if(SONV2)sfx('air.regain');}catch(e){}}
/* ---------------- LE VERGLAS (2026-10-15) ----------------
   D'abord des plaques de 80-150 m dans les courbes ; puis (même jour, Sacha : « toute la route doit être verglacée », « enlève la figure
   ICE SKATE ») UNE seule plaque, du départ à l'arrivée, sur les deux faces. Flux aléatoire à PART (graine ^ 0x1CE5).
   · DESSUS (`banqVerglas`, la boucle de conduite, après les flaques) : le volant ne mord plus qu'à BK_VG.grip, la caisse PART SUR LE CÔTÉ
     — vers l'EXTÉRIEUR du virage (lu sur `routeLacet`), et elle flotte un peu dans les droites — jusqu'à BK_VG.der rad/s de cap à pleine
     vitesse : on contre-braque. La carrosserie se met en CRABE et ondule comme un patineur (`BKV.yaw`, appliqué après le power-slide), les
     roues jettent du givre et rayent la glace (traces type 1).
   · La figure ICE SKATE n'existe plus (`bkSkateRaz` reste, inerte, là où on l'appelait).
   · (2026-10-15 soir, Sacha : « la glace ne glisse pas assez, il faut une animation et des particules de glace ») LA VRAIE GLISSE.
     Avant, le verglas ne faisait que rogner le volant : le cap restait la trajectoire, la caisse tournait moins, elle ne GLISSAIT pas
     (le défaut déjà noté au drift de conduite abandonné, plus bas dans la boucle). Désormais `BKV.gl` = l'angle entre le NEZ et la
     TRAJECTOIRE : le pouce tourne le nez (BK_VG.grip, presque plein), la trajectoire le rejoint en BK_VG.tau s (`gl` s'éteint en
     exp(−t/tau), ÷spdMult comme VOL_TAU : la caisse glisse le même nombre de MÈTRES à toute vitesse). Dans un virage, la caisse file
     donc en CRABE vers l'extérieur, le nez dans la courbe — il faut braquer TÔT. Les deux lignes de l'avance (vL, s) lisent
     `psi-slipB-BKV.gl`. L'ANIMATION : le crabe réel, grossi de 80 % à l'image, plus la QUEUE QUI CHASSE (une onde lente qui
     grandit avec la glisse) ; un craquement de glace quand elle décroche, la boucle `banq.glisse` tant qu'elle glisse. LES PARTICULES :
     `fx.eclat` (éclats étirés, jetés du côté où la caisse glisse — la gerbe du carveur), `fx.brume` (le voile de givre qui reste
     derrière), le givre des roues, et une rayure de glace qui s'élargit avec l'angle. `BKV.gk` (0-1) = la glisse ressentie.
   Console : dbgBanq('verglas') (l'état, avec gl et gk), dbgBanq('verglas',{s,v}) pose la caisse au mètre s (à v km/h). */
const BK_VG={grip:.86,der:.21,tau:.38,tau0:.15,glMax:.5,base:6,v:24,tMin:.4,lache:.2,kmhMin:30}; // la piste de glace : elle part un cran plus // (2026-10-15) toute la route gèle : la dérive .30 → .16 (au banc, .62/.20 : le pilote sortait à 455 km/h après 1 km) · (soir) le volant remonte à 92 % : c'est la TRAJECTOIRE qui traîne (tau s, tau0 à l'arrêt), plus le volant qui manque — glMax ≈ 29° de crabe ; au banc, tau .55 : le pilote de mesure (qui vise avec le NEZ) sortait en 3 s à 390 km/h — 0,5 s de glisse = 50 m
const BKV={sur:false,v:null,yaw:0,ph:0,t:0,aura:0,hors:0,k:0,etiq:null,dix:0,eg:0,gl:0,gk:0,ee:0,eb:0,cr:0,crT:0};
const BKV_A=new THREE.Vector3(),BKV_B=new THREE.Vector3(),BKV_C=new THREE.Vector3();
function bkVerglasPose(root,seed){ // (2026-10-15, Sacha : « toute la route doit être verglacée ») UNE plaque, du départ à l'arrivée
  BANQ.verg=[];const vr=mulberry32((seed^0x1CE5)>>>0),ds=L/(NP-1);
  BANQ.verg.push({s0:-1e9,s1:1e9,a:0,b:L,sd:1}); // de bout en bout : la glace est TOUTE la piste
  if(!BANQ.verg.length)return;
  const P=[],N=[],A=[],I=[],COL=[-1,-.75,-.5,-.25,0,.25,.5,.75,1],W=ROAD_HALF+1.2,NC=COL.length;let n=0; // un peu plus large que la piste : sa frange de givre se fond dans le bourrelet
  for(const v of BANQ.verg){const sdg=vr()*10,va=v.a,vb=v.b;
    for(const fy of [1,-1]){const nk=Math.max(2,Math.ceil((vb-va)/3.5));
      for(let k=0;k<=nk;k++){const s9=va+(vb-va)*k/nk,d0=s9-va,d1=vb-s9,tv=d0<d1?Math.min(.5,d0/200):1-Math.min(.5,d1/200);frameAt(s9,F); // (le long : les bouts fondent sur ~30 m, pas sur 15 % de 9 km)
        for(const c of COL){const l=c*W,o=fy>0?.06:-THICK-.06;P.push(F.p.x+F.b.x*l+F.n.x*o,F.p.y+F.b.y*l+F.n.y*o,F.p.z+F.b.z*l+F.n.z*o);N.push(F.n.x*fy,F.n.y*fy,F.n.z*fy);A.push(c,tv,sdg,0);}
        if(k>0){const r0=n+(k-1)*NC,r1=n+k*NC;for(let q=0;q<NC-1;q++){if(fy>0)I.push(r0+q,r1+q,r0+q+1,r0+q+1,r1+q,r1+q+1);else I.push(r0+q,r0+q+1,r1+q,r0+q+1,r1+q+1,r1+q);}}}
      n+=(nk+1)*NC;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('aV',new THREE.Float32BufferAttribute(A,4));g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.vg);m.name='banquise verglas';m.matrixAutoUpdate=false;m.userData.jeter=true;m.renderOrder=1;m.frustumCulled=false;root.add(m);BANQ.n.verglas=BANQ.verg.length;}
function banqVerglas(dt){ // la boucle de conduite, chaque image, après les flaques
  let v=null;
  if(mode==='drive'&&BANQ.verg&&BANQ.verg.length&&banqOk()&&hopY<=.05&&!introD&&Math.abs(lat)<ROAD_HALF)for(const o of BANQ.verg)if(s>o.s0&&s<o.s1){v=o;break;} // (toute la route : une plaque sans bornes)
  BKV.sur=!!v;BKV.v=v;
  const kmh=Math.abs(vA)*3.6*SPD,kv=Math.min(1,kmh/Math.max(60,vmaxShow()));
  let tg=0;
  if(v){
    // LA TRAJECTOIRE REJOINT LE NEZ (le pouce a tourné le nez au lacet de la boucle : `BKV.gl` y grandit) — en tau s, ÷spdMult comme VOL_TAU
    const tau=BK_VG.tau0+(BK_VG.tau-BK_VG.tau0)*kv;
    BKV.gl*=Math.exp(-dt*vitMult()/tau);
    BKV.gk+=(THREE.MathUtils.clamp(Math.abs(BKV.gl)/.2,0,1)*Math.min(1,kmh/120)-BKV.gk)*Math.min(1,dt*8);
    BKV.ph+=dt*(2.6+2.2*kv);
    const dr=THREE.MathUtils.clamp(-routeLacet*2.5,-1,1),sd=THREE.MathUtils.clamp(dr*.85+Math.sin(BKV.ph*.23)*.30,-1,1); // (toute la route) elle part vers l'EXTÉRIEUR du virage, et flotte un peu dans les droites
    psi=THREE.MathUtils.clamp(psi+sd*BK_VG.der*kv*dt,-1.1,1.1);                                                 // ELLE PART SUR LE CÔTÉ
    tg=THREE.MathUtils.clamp(BKV.gl*.8,-.28,.28)+Math.sin(BKV.ph)*(.05+.15*BKV.gk)*kv+sd*.10*kv;                                                  // L'ANIMATION : le crabe réel grossi de 80 % à l'image, +16° au plus (la physique reste jouable, l'image glisse) + la QUEUE QUI CHASSE (elle grandit avec la glisse) + le flottement
    if(Math.abs(dr)>.35)driftT=Math.max(driftT,.25);                                                             // la gomme ne chante que dans les virages
    // ELLE DÉCROCHE : un craquement de glace, un petit coup dans la main (une fois par glissade)
    BKV.crT=Math.max(0,BKV.crT-dt);
    if(BKV.gk>.55&&!BKV.cr&&BKV.crT<=0){BKV.cr=1;BKV.crT=1.4;try{if(SONV2&&window.CCSON&&window.CCSON.existe('banq.craque'))sfx('banq.craque',{vol:-15+5*kv});}catch(e){}hap(8);}
    else if(BKV.gk<.25)BKV.cr=0;
    // LES PARTICULES : des ÉCLATS jetés du côté où la caisse glisse (la gerbe du carveur), un VOILE de givre qui reste derrière
    const fx=BANQ.fx,cg=carGroup;
    if(fx.eclat&&kmh>20&&cg.visible){
      const vc=PT_U.uVc.value,q=cg.quaternion,gk=BKV.gk,w=CARS[level].w*.46,l=CARS[level].l*.38;
      BKV_A.set(0,0,1).applyQuaternion(q);BKV_C.set(0,1,0).applyQuaternion(q);                                // le nez · le haut de la caisse
      BKV_B.copy(vc).addScaledVector(BKV_A,-vc.dot(BKV_A));BKV_B.addScaledVector(BKV_C,-BKV_B.dot(BKV_C));     // la vitesse de CÔTÉ : la glisse
      const vl=BKV_B.length();if(vl>.5)BKV_B.multiplyScalar(1/vl);else BKV_B.set(0,0,0);
      BKV_C.set(1,0,0).applyQuaternion(q);const sgL=BKV_B.dot(BKV_C)>=0?1:-1;BKV_C.set(0,1,0).applyQuaternion(q); // le flanc qui MÈNE la glisse jette le plus
      BKV.ee+=dt*(14+26*kv+330*gk);
      while(BKV.ee>=1){BKV.ee-=1;const sg=Math.random()<.5+.35*gk?sgL:-sgL,av=Math.random()<.3*gk;
        DRIFT_V.set(sg*w,.1,av?l*.95:-l);cg.localToWorld(DRIFT_V);
        const k=.62+.2*Math.random(),la=(2+10*Math.random())*(.25+gk),up=2.5+6*Math.random()*(.5+gk),bk=2+5*Math.random(); // (haut : sur la glace blanche, on les voit surtout contre la montagne et le ciel)
        spawnP(fx.eclat,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k+BKV_B.x*la+BKV_C.x*up-BKV_A.x*bk+(Math.random()-.5)*2,vc.y*k+BKV_B.y*la+BKV_C.y*up-BKV_A.y*bk,vc.z*k+BKV_B.z*la+BKV_C.z*up-BKV_A.z*bk+(Math.random()-.5)*2,.3+Math.random()*.45);}
      BKV.eb+=dt*(2+42*gk)*Math.max(.3,kv);
      while(BKV.eb>=1){BKV.eb-=1;const sg=Math.random()<.5?-1:1;DRIFT_V.set(sg*w,.25,-l);cg.localToWorld(DRIFT_V);
        const k=.55+.2*Math.random(),la=(2+4*Math.random())*gk,up=.8+1.6*Math.random();
        spawnP(fx.brume,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k+BKV_B.x*la+BKV_C.x*up,vc.y*k+BKV_B.y*la+BKV_C.y*up,vc.z*k+BKV_B.z*la+BKV_C.z*up,.7+Math.random()*.6);}}
    // la RAYURE des patins sur la glace (face du dessus) : elle s'élargit et se creuse avec l'angle de glisse
    if(side>0){const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1)))),t=T[i],hl=Math.hypot(t.x,t.z)||1,cp=carGroup.position;bkTrace(cp.x,cp.z,t.x/hl,t.z/hl,1,.5+.5*BKV.gk,1.3+1.9*BKV.gk,cp.y);}}
  else{BKV.gl*=Math.exp(-dt*10);BKV.gk*=Math.exp(-dt*8);BKV.cr=0;}
  BKV.yaw+=(tg-BKV.yaw)*Math.min(1,dt*(v?4.5:3));if(!v&&Math.abs(BKV.yaw)<.002)BKV.yaw=0;}
function bkSkateRaz(){BKV.t=0;BKV.hors=0;BKV.aura=0;BKV.dix=0;} // (2026-10-15, Sacha : « enlève la figure ICE SKATE ») la figure est partie ; ses remises à zéro restent, inertes
/* ---------------- LA CONGÈRE : LA NEIGE PROFONDE DU BORD (2026-10-18) ----------------
   (Sacha : « quand on touche le bord on y reste collé » puis « quand on touche le bord on doit pas mourir : on s'enfonce dans la neige, ce qui
   ralentit beaucoup, mais ça tue pas ».) Le bord de la piste était le MUR des couloirs du canyon (murCote : coup d'épaule, mort au-delà de 30°
   et 200 km/h) ; et sur la glace la caisse part vers l'extérieur des virages (banqVerglas) : elle y revenait à chaque image, collée au mur.
   Désormais, au-delà de la glace, une bande de NEIGE PROFONDE de `BK_CG.w` m de chaque côté — un ruban posé sur le repère de la piste
   (`bkCongerePose`), car la grille de neige, en cases de 34-40 m, ne savait pas dessiner un bord net (et passait par endroits AU-DESSUS de la
   glace). La caisse y ENTRE (gerbe, plouf), s'y ENFONCE (`BKB.enf`, jusqu'à `BK_CG.prof` m), y FREINE fort (vers `BK_CG.vMin` × la vmax, d'autant
   plus qu'on est loin dans la neige ; la nitro laboure mieux), la neige la remet dans l'axe et la REPOUSSE doucement vers la glace ; le volant y
   mord entier (pas de verglas dans la neige). Jamais de mort, jamais de mur : au bout de la bande, le bourrelet arrête la caisse (lat bornée).
   En vol, la congère prolonge la piste (tryLand s'y pose) et la grille de neige ne joue plus au-dessus de la piste (banqSolVol). */
/* (2026-10-20, Sacha : « quand tu rentres dans la neige, on rentre pas vraiment dedans ») la congère était un ruban de 45 cm au plus avec 38 cm
   d'enfoncement : on la survolait. Désormais un VRAI banc : 1,3 m à la limite (BK_CG_Y), la caisse s'y enfonce de .95 m, freine plus fort, et la
   gerbe est jetée plus haut. `?sans=glaceneige` = l'ancien profil. */
const BK_NEIGE=!/[?&]sans=([^&]*,)?glaceneige(,|&|$)/.test(location.search);
const BK_CG={w:16,prof:BK_NEIGE?.95:.38,fr0:BK_NEIGE?1.1:.7,fr1:BK_NEIGE?3.4:2.4,vMin:BK_NEIGE?.26:.32,pousse:6,redresse:2.2,fx:1},BKB={k:0,enf:0,em:0,dans:false}; // fx : la gerbe (banc : dbgBanq('cg',{fx:0}))
const BK_CG_X=[-1.5,.4,3,9,16,22,30,36],BK_CG_Y=BK_NEIGE?[-.5,.2,.5,.85,1.3,2.2,3.4,-1.5]:[-.5,.14,.22,.28,.45,1.4,3.0,-1.5]; // (au banc : .75 m d'enfoncement + .45 de neige, on ne voyait plus la caisse — désormais les roues et le bas de caisse) // le profil : x m au-delà du bord de la glace → hauteur de la neige au-dessus du plan de la piste (le bout plonge sous la grille)
function bkCgH(x){const X=BK_CG_X,Y=BK_CG_Y;if(x<=X[0])return Y[0];for(let i=1;i<X.length;i++)if(x<=X[i])return Y[i-1]+(Y[i]-Y[i-1])*(x-X[i-1])/(X[i]-X[i-1]);return Y[Y.length-1];}
function bkCgBord(){return banqOk()?BK_CG.w:0;} // la largeur de neige où l'on peut rouler (et se poser) au-delà de la glace
function bkCongerePose(root){ // les deux rubans de neige du bord, du départ à l'arrivée (même pas de 4 m que le verglas)
  const P=[],A=[],I=[],X=BK_CG_X,NC=X.length,nk=Math.max(2,Math.ceil(L/4));let n=0;
  for(const sd of [1,-1]){
    for(let k=0;k<=nk;k++){frameAt(L*k/nk,F);
      for(let q=0;q<NC;q++){const l=sd*(ROAD_HALF+X[q]),h=BK_CG_Y[q];P.push(F.p.x+F.b.x*l+F.n.x*h,F.p.y+F.b.y*l+F.n.y*h,F.p.z+F.b.z*l+F.n.z*h);A.push(ROAD_HALF+X[q],0);}
      if(k>0){const r0=n+(k-1)*NC,r1=n+k*NC;for(let q=0;q<NC-1;q++){if(sd>0)I.push(r0+q,r1+q,r0+q+1,r0+q+1,r1+q,r1+q+1);else I.push(r0+q,r0+q+1,r1+q,r0+q+1,r1+q+1,r1+q);}}}
    n+=(nk+1)*NC;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,2));
  g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeVertexNormals();
  {const Nm=g.attributes.normal.array;for(let i=0;i<Nm.length;i+=3){Nm[i+1]+=.6;const l=Math.hypot(Nm[i],Nm[i+1],Nm[i+2])||1;Nm[i]/=l;Nm[i+1]/=l;Nm[i+2]/=l;}} // (au banc : à 45°, parallèle à la glace, elle restait dans l'ombre bleue — presque la couleur de la glace) la neige du bord regarde un peu le ciel : plus claire, on la distingue
  g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.sol);m.name='glacier congere';m.matrixAutoUpdate=false;m.userData.jeter=true;m.frustumCulled=false;root.add(m);BANQ.n.congere=I.length/3;}
/* LE TREMPLIN DE GLACE (2026-10-18, Sacha : « les tremplins doivent être plus beaux, gros et visibles ») — le « bec » d'avant était un coin de 8 m
   sur 1,1 m, blanc sur glace blanche : on ne le voyait pas venir. Désormais une RAMPE de BK_BEC.lg m qui monte en courbe (u^1,7 : ~18° à la
   lèvre) jusqu'à BK_BEC.h m, en glace blanche à CHEVRONS ORANGE qui montent vers la lèvre, une LÈVRE blanche qui brille, des flancs bleu
   nuit, et deux BALISES orange de BK_BEC.poteau m aux coins de la lèvre (lisibles de loin, sur toutes les météos : matière sans lumière).
   (1er essai au banc : 26 × 4,5 m, chevrons blancs sur bleu clair — invisible à 100 m sur une piste de 196 m.)
   La caisse MONTE la rampe (hopY suit la courbe) et décolle à la lèvre, poussée de BK_BEC.pop × sa vitesse (,2 avant ; ,26 puis ,22 essayés : 3-6 s de vol à 45°, 450 m parcourus — la piste tournait dessous). */
const BK_BEC={lg:36,h:7,pop:.18,poteau:15,axe:.65,droit:260,retombe:500}; /* droit : la piste presque droite (< 31° de cap) qu'il faut devant la lèvre ; axe : la part de la vitesse de travers que la rampe redresse au décollage ; retombe : la piste LIBRE après la lèvre, sur toute sa largeur (voir BK_RETOMBE) */
let BK_BEC_TEX=null; // (2026-10-19) sur SA ligne : collée derrière le « // » de la ligne du dessus, elle était avalée (piège n° 1) — « BK_BEC_TEX is not defined » à chaque glacier : ni tremplins, ni pics, ni fin du décor, ni météo
/* LA RETOMBÉE DES TREMPLINS (2026-10-19, même demande) : libreK ne dégageait que 260 m après la lèvre, et dans la seule bande du tremplin.
   MESURÉ en course (29 vols, 255 à 414 km/h au décollage) : la caisse se pose de 160 à 511 m plus loin, et le pilote de vol la ramène vers
   l'axe, hors de la bande ; 2 morts sur 10 courses « aux tremplins » : posée à 516 km/h au pied d'un pic de FOURCHE (380 m après la lèvre),
   ou à 32 m d'un pic. Désormais aucun pic sur TOUTE la largeur pendant BK_BEC.retombe m après la lèvre (vols mesurés avec banqLacet : 84 à
   705 m, 450 m au plus jusqu'à 500 km/h), et la figure qui suit un tremplin attend la fin de sa retombée. `?sans=glaceretombe` = avant
   (même graine, même piste). */
const BK_RETOMBE=!/[?&]sans=([^&]*,)?glaceretombe(,|&|$)/.test(location.search);
/* (2026-10-20, Sacha : « exactement la même texture que le verglas, une aspérité de la route, pas un élément greffé dessus ») LE TREMPLIN EST LA ROUTE
   QUI SE SOULÈVE : la même matière que le verglas (BANQ.mats.vg, texture en coordonnées monde : les fêlures et le ciel reflété passent de la route
   à la bosse sans couture), aucun flanc, aucune balise, aucun cristal. La surface monte dans la courbe de hopY (la rampe) et se fond dans la route
   sur les côtés ; la lèvre retombe d'un coup au niveau de la route. Les normales sont calculées : la bosse prend la lumière et le reflet du ciel. */
function bkBecMesh(root,KK){
  const P=[],A=[],I=[];let n=0;
  const V=(s9,la,h,c,sd9)=>{frameAt(s9,F);P.push(F.p.x+F.b.x*la+F.n.x*h,F.p.y+F.b.y*la+F.n.y*h,F.p.z+F.b.z*la+F.n.z*h);A.push(c,.5,sd9,0);return n++;};
  const ss=x=>x*x*(3-2*x);
  for(const k of KK){const NR=22,NL=16,s0=k.s-k.lg,H=k.h,w=k.l1-k.l0,hR=u=>H*Math.pow(u,1.7)+.06,sd=k.s*.013,sg=(k.s*.0071)%10,fl=3.2; /* fl : la largeur sur laquelle la bosse se fond dans la route, de chaque côté */
    const prof=t=>{const la=k.l0-fl+(w+2*fl)*t,o=la<k.l0?(k.l0-la)/fl:la>k.l1?(la-k.l1)/fl:0;return{la:la,f:1-ss(Math.min(1,o))};}; /* f : 1 sur la piste du tremplin, 0 à la route */
    let b0=n;for(let r=0;r<=NR;r++){const u=r/NR,s9=s0+k.lg*u;for(let a=0;a<=NL;a++){const q=prof(a/NL);V(s9,q.la,.06+(hR(u)-.06)*q.f,0,sg);}} /* la bosse */
    for(let r=0;r<NR;r++)for(let a=0;a<NL;a++){const q=b0+r*(NL+1)+a;I.push(q,q+NL+1,q+1,q+1,q+NL+1,q+NL+2);}
    b0=n;for(const dh of [0,1])for(let a=0;a<=NL;a++){const q=prof(a/NL);V(k.s+.04*dh,q.la,dh?.06:.06+(hR(1)-.06)*q.f,0,sg);} /* la lèvre : la paroi qui retombe sur la route */
    for(let a=0;a<NL;a++){const q=b0+a;I.push(q,q+1,q+NL+1,q+1,q+NL+2,q+NL+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aV',new THREE.Float32BufferAttribute(A,4));
  g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.vg);m.name='glacier becs';m.matrixAutoUpdate=false;m.userData.jeter=true;m.renderOrder=1;m.frustumCulled=false;root.add(m);}
function bkCgEntre(kmh){ // l'entrée dans la neige : le plouf, la gerbe, un coup dans la main
  const k=Math.min(1,kmh/300);shake=Math.max(shake,(BK_NEIGE?.4:.22)+.3*k);fovPunch=Math.max(fovPunch,3+5*k);hap(k>.5?[14,22]:[10]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.plouf')&&sfx('banq.plouf',{vol:-8+6*k})))sfx('nuage.entre',{vol:-4+4*k});}else noiseBurst(.35,.08+.08*k,700);}catch(e){}
  const fx=BANQ.fx;if(fx&&fx.poudre&&BK_CG.fx>0){const p=carGroup.position,vc=PT_U.uVc.value;for(let i=0;i<10+18*k;i++){const a=Math.random()*6.2832,r=Math.random();
    spawnP(fx.poudre,p.x+(Math.random()-.5)*3,p.y+.3,p.z+(Math.random()-.5)*3,vc.x*.7+Math.cos(a)*(3+r*9),vc.y*.7+5+Math.random()*12*(.5+k),vc.z*.7+Math.sin(a)*(3+r*9),.6+Math.random()*.8);}}}
function bkCongere(dt){ // la boucle de conduite (glacier v4), chaque image, à la place du mur du bord
  const x=Math.abs(lat)-ROAD_HALF,out=Math.sign(lat)||1,W=BK_CG.w;let k=0;
  if(mode==='drive'&&side>0&&x>-.6){                                                           // (le flanc de la caisse touche la neige 60 cm avant son centre)
    if(x>W)lat=out*(ROAD_HALF+W);                                                              // le bourrelet : on ne va pas plus loin (ni mur qui tue, ni chute)
    k=THREE.MathUtils.smoothstep(x,-.6,W*.55);
    const kmh=Math.abs(vA)*3.6*SPD,vmin=Math.max(80,vmaxShow()*BK_CG.vMin)/(3.6*SPD);
    if(Math.abs(vA)>vmin)vA=Math.sign(vA)*(vmin+(Math.abs(vA)-vmin)*Math.exp(-dt*(BK_CG.fr0+BK_CG.fr1*k)*(nitroOn?.55:1))); // la neige FREINE
    lat-=out*BK_CG.pousse*k*dt;                                                                 // le bourrelet REPOUSSE vers la glace
    if(psi*driveDir*out>0)psi*=Math.exp(-dt*BK_CG.redresse*k);                                  // et remet la caisse dans l'axe : elle ne file plus vers l'extérieur
    if(!BKB.dans&&k>.08){BKB.dans=true;bkCgEntre(kmh);}
    if(BK_NEIGE&&kmh>60)shake=Math.max(shake,.14*k*Math.min(1,kmh/250)); /* la neige profonde secoue la caisse tant qu'on y laboure */
    const fx=BANQ.fx;
    if(fx&&fx.poudre&&kmh>15&&carGroup.visible){const vc=PT_U.uVc.value,w=CARS[level].w*.5,l=CARS[level].l*.4; // LA POUDRE : deux rideaux jetés par les roues, plus hauts loin dans la neige
      BKB.em+=dt*(6+22*k)*Math.min(1,kmh/150)*BK_CG.fx;
      BKV_A.set(1,0,0).applyQuaternion(carGroup.quaternion);const sO=BKV_A.dot(F.b)*out>=0?1:-1; // le flanc de la caisse côté neige
      while(BKB.em>=1){BKB.em-=1;const sg=sO;DRIFT_V.set(sg*w,.15,-l*(.2+.5*Math.random()));carGroup.localToWorld(DRIFT_V);const ou=out*(8+Math.random()*10)*(.6+.4*k),k1=.82+.14*Math.random();
        spawnP(fx.poudre,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k1+F.b.x*ou,vc.y*k1+2.5+Math.random()*(4+7*k),vc.z*k1+F.b.z*ou,.35+Math.random()*.45);}} // (elle file AVEC la caisse, jetée vers l'extérieur : à ,35 de la vitesse, la caméra la traversait — un mur blanc)
    if(side>0){const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1)))),t=T[i],hl=Math.hypot(t.x,t.z)||1,cp=carGroup.position; // LA TRACE dans la poudre
      bkTrace(cp.x,cp.z,t.x/hl,t.z/hl,0,Math.min(1,.35+k),1.7+.7*k,F.p.y+F.b.y*lat+F.n.y*bkCgH(Math.max(0,x)));}}
  else if(BKB.dans&&x<-.9)BKB.dans=false;
  BKB.k=k;BKB.enf+=(BK_CG.prof*k-BKB.enf)*Math.min(1,dt*7);if(BKB.enf<.003)BKB.enf=0;}
/* ---------------- LES TRACES : un anneau de quads (4 sommets chacun : aucun pont entre deux traces) ---------------- */
const BK_TR={N:1100,i:0,mesh:null,pos:null,at:null,on:false,lx:0,lz:0,lpx:0,lpz:0,lw:1,ty:0,lo:1e9,hi:-1};
function bkTraceMesh(){if(BK_TR.mesh)return BK_TR.mesh;const N=PAL_BK('banqTrace',1100);BK_TR.N=N;
  const pos=new Float32Array(N*12),at=new Float32Array(N*16),I=new Uint16Array(N*6);
  for(let k=0;k<N;k++){const b=k*4;I.set([b,b+2,b+1,b+1,b+2,b+3],k*6);at[k*16+1]=at[k*16+5]=at[k*16+9]=at[k*16+13]=-1e9;}
  const g=new THREE.BufferGeometry(),pa=new THREE.BufferAttribute(pos,3),aa=new THREE.BufferAttribute(at,4);pa.setUsage(THREE.DynamicDrawUsage);aa.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position',pa);g.setAttribute('aT',aa);g.setIndex(new THREE.BufferAttribute(I,1));
  const m=new THREE.Mesh(g,banqMats().tr);m.name='banquise traces';m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=2;m.visible=false;scene.add(m);
  BK_TR.mesh=m;BK_TR.pos=pos;BK_TR.at=at;return m;}
function bkTraceVide(){if(!BK_TR.mesh)return;const A=BK_TR.at;for(let k=0;k<BK_TR.N*4;k++)A[k*4+1]=-1e9;const aa=BK_TR.mesh.geometry.attributes.aT;aa.updateRange.offset=0;aa.updateRange.count=-1;aa.needsUpdate=true;BK_TR.on=false;}
function bkTraceCoupe(){BK_TR.on=false;}
function bkSurfY(x,z){const S=banqSurf(x,z);return S.ok?S.h:-1e9;}
// un pas de trace : du dernier point à (x, z), dans la direction (hx, hz), de demi-largeur w — ty 0 poudreuse · 1 glace ; pr = la profondeur (0-1)
function bkTrace(x,z,hx,hz,ty,pr,w,yo){ // yo : une hauteur imposée (les rayures sur le VERGLAS de la route) — sinon, la neige ou la glace sous le point
  const px=-hz,pz=hx;
  if(!BK_TR.on||BK_TR.ty!==ty||(yo==null)!==(BK_TR.ly==null)){BK_TR.on=true;BK_TR.ty=ty;BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;BK_TR.ly=yo==null?null:yo;return;}
  const dl=Math.hypot(x-BK_TR.lx,z-BK_TR.lz);if(dl<1.4)return;
  if(dl>16){BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;BK_TR.ly=yo==null?null:yo;return;}
  const k=BK_TR.i;BK_TR.i=(k+1)%BK_TR.N;const P=BK_TR.pos,A=BK_TR.at,t=BK_U.uTime.value,b=k*4,w0=BK_TR.lw,y0=BK_TR.ly;
  const put=(v,x9,z9,u,yy)=>{let y=yy!=null?yy-.04:bkSurfY(x9,z9);if(y<-1e8)y=bkSurfY(x,z);P[v*3]=x9;P[v*3+1]=y+.10;P[v*3+2]=z9;A[v*4]=u;A[v*4+1]=t;A[v*4+2]=pr;A[v*4+3]=ty;};
  put(b,BK_TR.lx-BK_TR.lpx*w0,BK_TR.lz-BK_TR.lpz*w0,-1,y0);put(b+1,BK_TR.lx+BK_TR.lpx*w0,BK_TR.lz+BK_TR.lpz*w0,1,y0);
  put(b+2,x-px*w,z-pz*w,-1,yo);put(b+3,x+px*w,z+pz*w,1,yo);BK_TR.ly=yo==null?null:yo;
  BK_TR.lo=Math.min(BK_TR.lo,b);BK_TR.hi=Math.max(BK_TR.hi,b+4);
  BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;}
function bkTraceEnvoi(){if(BK_TR.hi<0)return;const g=BK_TR.mesh.geometry,pa=g.attributes.position,aa=g.attributes.aT,lo=BK_TR.lo,n=BK_TR.hi-lo;
  pa.updateRange.offset=lo*3;pa.updateRange.count=n*3;pa.needsUpdate=true;aa.updateRange.offset=lo*4;aa.updateRange.count=n*4;aa.needsUpdate=true;BK_TR.lo=1e9;BK_TR.hi=-1;}
/* ---------------- LES GERBES ---------------- */
// la POUDRE : une explosion de neige (entrée, mort) — n grains, l'élan hv, k la force
function banqGerbe(p,n,hv,k){const fx=BANQ.fx;if(!fx.poudre)return;const y=bkSurfY(p.x,p.z)+.4,h=Math.hypot(fallVel.x,fallVel.z)||1,dx=fallVel.x/h,dz=fallVel.z/h,v9=hv*SPD;
  for(let i=0;i<n;i++){const a=Math.random()*6.2832,r=Math.random();spawnP(fx.poudre,p.x+(Math.random()-.5)*3,y,p.z+(Math.random()-.5)*3,
    Math.cos(a)*(4+r*12)*k+dx*v9*.35*Math.random(),(6+Math.random()*16)*k,Math.sin(a)*(4+r*12)*k+dz*v9*.35*Math.random(),.9+Math.random()*1.2);}}
// le GIVRE : des éclats de glace qui jaillissent (le contact, la glisse)
function banqGivre(p,n,v9){const fx=BANQ.fx;if(!fx.givre)return;
  for(let i=0;i<n;i++){const a=Math.random()*6.2832;spawnP(fx.givre,p.x+(Math.random()-.5)*2.4,p.y+.2,p.z+(Math.random()-.5)*2.4,Math.cos(a)*(3+Math.random()*9)+fallVel.x*SPD*.3,3+Math.random()*7,Math.sin(a)*(3+Math.random()*9)+fallVel.z*SPD*.3,.35+Math.random()*.5);}}
/* ---------------- LES EFFETS QUI VIVENT AUTOUR DE LA CAISSE (bâtis une fois, cachés hors de la banquise) ---------------- */
function banqFx(){const fx=BANQ.fx;if(fx.flo)return fx;const M=banqMats(),R=mulberry32(0xB10C);
  const pts9=(n,mat,nom)=>{const g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
    const o=new THREE.Points(g,mat);o.name=nom;o.frustumCulled=false;o.matrixAutoUpdate=false;o.visible=false;o.renderOrder=8;scene.add(o);return o;};
  fx.flo=pts9(PAL_BK('banqFlo',2400),M.flo,'banquise neige qui tombe');
  fx.dd=pts9(PAL_BK('banqDD',500),M.dd,'banquise poussière de diamant');
  { // LES AURORES : quatre rideaux, à 5,8-6,8 km, de 10° à 35° au-dessus de l'horizon
    const P=[],U=[],I=[],NS=150,RI=[[-1.55,1.1,6300,1150],[-.55,1.3,6800,1450],[.55,1.15,6000,1000],[1.55,1.2,6500,1300]];let n=0;
    for(let c=0;c<RI.length;c++){const r=RI[c];for(let i=0;i<=NS;i++){const u=i/NS,a=r[0]+u*r[1],rr=r[2]*(1+.07*Math.sin(u*8.+c*1.3)),x=Math.sin(a)*rr,z=Math.cos(a)*rr,y0=r[3]+280*Math.sin(u*5.3+c*2.),h=2500+600*Math.sin(u*3.7+c);
      P.push(x,y0,z,x,y0+h,z);U.push(u,0,c*1.7,u,1,c*1.7);if(i>0){const b=n-2;I.push(b,b+2,b+1,b+1,b+2,b+3);}n+=2;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aU',new THREE.Float32BufferAttribute(U,3));g.setIndex(I);
    fx.aur=new THREE.Mesh(g,M.aur);fx.aur.name='banquise aurores';fx.aur.frustumCulled=false;fx.aur.renderOrder=-1;fx.aur.visible=false;scene.add(fx.aur);}
  fx.poudre=makePool(PAL_BK('banqPoudre',520),2.3,0xf4f8ff,.78,true,{a:[.06,.6,.75,1.35],pr:[2,6,26,0]});fx.poudre.drag=1.6;fx.poudre.acc=12;fx.poudre.mesh.name='banquise poudre';
  fx.givre=makePool(240,1.1,0xe4fbff,1,true,{a:[.02,.3,.6,1],pr:[2,6,26,0]});fx.givre.drag=2.4;fx.givre.acc=9;fx.givre.mesh.name='banquise givre';
  // (2026-10-15 soir) LA GLISSE SUR LE VERGLAS : des éclats ÉTIRÉS (le trait suit leur vitesse, voir ptShader) et un voile de givre qui gonfle en s'effaçant
  fx.eclat=makePool(PAL_BK('banqEclat',700),.8,0x8fe4ff,1,true,{a:[.02,.35,1,.35],pr:[1.2,3.5,30,90],etire:true,str:.05,v:.6}); /* cyan glacier : blanc sur la glace blanche, on ne les voyait pas — (2026-10-15 soir) ce commentaire en // avalait la suite (drag, acc, nom) : rendu */fx.eclat.drag=1.4;fx.eclat.acc=14;fx.eclat.mesh.name='banquise eclats';
  fx.brume=makePool(PAL_BK('banqBrume',220),3.4,0xe2f2ff,.5,true,{a:[.10,.75,.45,1.7],pr:[2.5,7,120,0]}); /* (plafond 120 px : à 46, le voile n'était qu'un point blanc sur la glace blanche) — (2026-10-18, DEBUGGING : ce commentaire en // avalait la suite : le voile de givre filait avec la caisse, sans frein) */fx.brume.drag=2.4;fx.brume.mesh.name='banquise brume';
  fx.eclat.mesh.renderOrder=fx.brume.mesh.renderOrder=9; // ⚠ APRÈS la plaque de verglas (renderOrder 1, transparente) et les traces (2) : dessinées avant, elles étaient repeintes par la glace — invisibles au banc
  bkTraceMesh();bkCretes(fx); /* (2026-10-21, LE GLACIER EMBELLI) les crêtes lointaines et leurs panaches : voir glacier-embelli.js */
  return fx;}
function banqFxCache(){if(BKV.t>0)bkSkateRaz();BKV.sur=false;BKV.yaw=0;BKV.gl=0;BKV.gk=0;const fx=BANQ.fx;if(!fx.flo||!fx.on)return;fx.on=false;fx.flo.visible=fx.dd.visible=fx.aur.visible=false;bkCretesCache(fx);if(BK_TR.mesh)BK_TR.mesh.visible=false;
  try{updatePool(fx.poudre,10,0);updatePool(fx.givre,10,0);updatePool(fx.eclat,10,0);updatePool(fx.brume,10,0);}catch(e){}
  for(const k in BANQ.boucles)if(BANQ.boucles[k]&&BANQ.boucles[k].stop){try{BANQ.boucles[k].stop(.5);}catch(e){}BANQ.boucles[k]=null;}
  BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;}
/* ---------------- LES MÉTÉOS : la banquise glisse d'un temps à l'autre au même fondu que le ciel ---------------- */
function banqMeteo(m,dur){const T9=BK_MET[m]||BK_MET.midi;BANQ.met=BK_MET[m]?m:'midi';
  if(!BANQ.cur)BANQ.cur=JSON.parse(JSON.stringify(T9));
  BANQ.de=JSON.parse(JSON.stringify(BANQ.cur));BANQ.to=T9;BANQ.k=0;BANQ.dur=Math.max(.01,dur||1.2);}
function banqPas(dt){if(!BANQ.cur||BANQ.k>=1)return;BANQ.k=Math.min(1,BANQ.k+dt/BANQ.dur);const e=BANQ.k*BANQ.k*(3-2*BANQ.k),a=BANQ.de,b=BANQ.to,o=BANQ.cur;
  for(const k in b){const v=b[k];if(typeof v==='number')o[k]=a[k]+(v-a[k])*e;else if(Array.isArray(v))for(let i=0;i<v.length;i++)o[k][i]=a[k][i]+(v[i]-a[k][i])*e;else o[k]=v;}}
/* ---------------- LA BOUCLE DE LA BANQUISE (chaque image, après la caméra, juste avant le rendu) ---------------- */
function banqTick(dt){
  const on=!!BANQ.root&&!!LVL.cur&&LVL.cur.id==='banquise'&&!PARK.on;
  if(!on){banqFxCache();return;}
  const fx=banqFx(),U=BK_U,c=BANQ.cur||(banqMeteo(BANQ.met,.01),BANQ.cur);fx.on=true;
  const vit=!paused;banqPas(dt);if(vit)U.uTime.value+=dt;
  if(BANQ.file.length)bkTranches(paused||!started?8:3); // LA SUITE DE LA CONSTRUCTION : ~3 ms par image, du plus proche au plus loin
  // LA LUMIÈRE : l'azimut du soleil du ciel, la hauteur de la météo ; la nuit, la LUNE
  {const a=Math.atan2(SUN_DIR.x,SUN_DIR.z),el=c.el*Math.PI/180;BK_V.set(Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el));
   U.uSunDir.value.copy(BK_V).lerp(BK_V2.copy(BK_LUNE).setY(Math.max(.45,BK_LUNE.y)).normalize(),c.lune).normalize();}
  U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize().negate();
  U.uCam.value.copy(camera.position);
  {const cg=carGroup;U.uCarP.value.copy(cg.position);U.uCarF.value.set(0,0,1).applyQuaternion(cg.quaternion);}
  U.uPhare.value=c.phare*(mode==='boom'||!carGroup.visible?0:1);U.uFlash.value=(LVL.cur&&LVL.cur.orage)?(CAMP_FLASH||0):0;
  U.uSpark.value=c.spark;U.uAlp.value=c.alp;U.uAlpC.value.setRGB(c.alpC[0],c.alpC[1],c.alpC[2]);U.uAur.value=c.aur;U.uIceT.value.set(c.ice[0],c.ice[1],c.ice[2]);
  U.uMistK.value=c.mist;
  {const Z=BANQ.dz; /* (2026-10-20, LE DÉCOR AU HASARD) la glace, les aurores, la brume, l'alpenglow de CETTE piste (sans tirage : les valeurs d'avant) */
   if(Z){U.uIceT.value.x*=Z.glace[0];U.uIceT.value.y*=Z.glace[1];U.uIceT.value.z*=Z.glace[2];U.uAur.value=c.aur*Z.aur.k;U.uMistK.value=c.mist*Z.brume;U.uAlp.value=c.alp*Z.alp.k;if(Z.alp.c)U.uAlpC.value.setRGB(Z.alp.c[0],Z.alp.c[1],Z.alp.c[2]);
     U.uAurC.value.setRGB(Z.aur.c[0],Z.aur.c[1],Z.aur.c[2]);U.uAurC2.value.setRGB(Z.aur.c2[0],Z.aur.c2[1],Z.aur.c2[2]);}
   else{U.uAurC.value.setRGB(.25,1,.62);U.uAurC2.value.setRGB(.75,.30,1);}}U.uMistC.value.setRGB(c.mC[0],c.mC[1],c.mC[2]);if(scene.fog)U.uMistC.value.lerp(scene.fog.color,.3);
  {const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1))));const y9=pts[i]?pts[i].y:0;U.uMistY.value+=(y9-U.uMistY.value)*Math.min(1,dt*1.5+(BANQ.yRaz?1:0));BANQ.yRaz=false;}
  U.uNeige.value=c.neige;U.uDD.value=c.dd*(BANQ.dz?BANQ.dz.dd:1);U.uVent.value=c.vent;U.uPx.value=renderer.getPixelRatio();
  {const ff=(scene.fog&&scene.fog.far)||5000;if(scene.fog)U.uHazeC.value.copy(scene.fog.color);U.uHazeK.value=1.6/Math.max(600,ff);U.uHazeM.value=c.neige>.3?.82+.15*Math.min(1,c.neige):.80;}
  {camera.getWorldDirection(BK_V);U.uBoxC.value.copy(camera.position).addScaledVector(BK_V,22);}
  fx.flo.visible=c.neige>.01;fx.dd.visible=U.uDD.value>.01&&c.neige<.2;
  fx.aur.visible=c.aur>.01;if(fx.aur.visible){fx.aur.position.copy(camera.position);fx.aur.rotation.y=BANQ.axe||0; /* (2026-10-19) les aurores tournent avec la montagne (LE GLACIER AU HASARD) */fx.aur.updateMatrix();fx.aur.updateMatrixWorld(true);}
  bkCretesTick(fx);
  if(BK_TR.mesh)BK_TR.mesh.visible=true;
  if(BANQ.solM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of BANQ.solM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+60;if(m.visible!==v)m.visible=v;}}
  if(BANQ.picM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of BANQ.picM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+60;if(m.visible!==v)m.visible=v;}}
  if(vit){try{updatePool(fx.poudre,dt,0);updatePool(fx.givre,dt,0);updatePool(fx.eclat,dt,0);updatePool(fx.brume,dt,0);}catch(e){}}
  if(BANQ.fid!==flightId){BANQ.fid=flightId;BANQ.figs={};BANQ.lent=0;}
  if(mode!=='drive'){BKB.k=0;BKB.enf=0;BKB.dans=false;} // (2026-10-18) la congère ne suit pas la caisse en vol
  if(mode==='fall'&&vit&&started&&!gameOver)banqVolFx(dt);
  else{if(BANQ.sur||BANQ.glisse||BANQ.pou){BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;}if(!BKV.sur&&!BKB.dans)bkTraceCoupe();
    bkBoucle('banq.glisse',vit&&started&&!gameOver&&mode==='drive'&&BKV.sur&&BKV.gk>.12,-22+14*BKV.gk,.85+.4*BKV.gk);bkBoucle('banq.poudre',vit&&started&&!gameOver&&mode==='drive'&&BKB.dans,-16+10*BKB.k,.85+.3*BKB.k);} /* (2026-10-18) dans la congère, la poudre chante */ // (2026-10-15 soir) sur le verglas, la glisse CHANTE tant que la caisse est en crabe
  bkTraceEnvoi();
  // LA CAMÉRA NE PASSE JAMAIS SOUS LA NEIGE (en rasant la poudre, elle suivait la trajectoire jusque dedans : écran blanc)
  if(mode==='fall'||mode==='boom'){const cp=camera.position,S=banqSurf(cp.x,cp.z);if(S.ok&&cp.y<S.h+2.4){cp.y=S.h+2.4;camera.lookAt(carGroup.position);camera.updateMatrixWorld();}}
  banqSons(dt,c);
}
/* EN VOL, CE QUI SE VOIT ET S'ENTEND : les traces, la gerbe, le givre, les figures, la montagne qui ramène */
function banqVolFx(dt){
  const fx=BANQ.fx,p=fallPos,v=fallVel,hv=Math.hypot(v.x,v.z),d=BANQ.dNow,t=BANQ.tNow,fg=BANQ.figs,hx=hv>1?v.x/hv:0,hz=hv>1?v.z/hv:1,v9=hv*SPD;
  // LES TRACES
  if(BANQ.glisse)bkTrace(p.x,p.z,hx,hz,1,.5,1.2);
  else if(t===1&&d>-.35)bkTrace(p.x,p.z,hx,hz,0,Math.min(1,(d+.35)/1.6),2.05+Math.min(.9,Math.max(0,d)*.55)); // (2026-10-15) la tranchée v2 : plus large
  else bkTraceCoupe();
  // LA GERBE : au ras, une crête de poudre derrière la caisse (la « queue de coq ») ; plus haut, le souffle lève un voile
  if(t===1&&d>-2.8&&hv>12){const ras=d>-.35,k=Math.min(1,hv/110)*(ras?1:.22*(1+d/2.8));BANQ.em=(BANQ.em||0)+dt*64*k; // (2026-10-15) la gerbe v2 : plus fournie, et un VOILE de poudre qui traîne derrière (ci-dessous)
    const y=(BANQ.hNow||p.y)+.3;
    while(BANQ.em>=1){BANQ.em-=1;const sd=Math.random()<.5?-1:1,l=sd*(1+Math.random()*1.2); // deux RIDEAUX qui partent sur les côtés (derrière la caisse, la caméra regarde à travers : jamais un mur blanc)
      spawnP(fx.poudre,p.x-hx*1.4-hz*l,y,p.z-hz*1.4+hx*l,hx*v9*(.15+Math.random()*.2)+(-hz)*sd*(6+Math.random()*9),(ras?4:2)+Math.random()*(ras?8:3)*k,hz*v9*(.15+Math.random()*.2)+hx*sd*(6+Math.random()*9),.55+Math.random()*.75);
      if(ras&&Math.random()<.35)spawnP(fx.poudre,p.x-hx*(3+Math.random()*3)+(Math.random()-.5)*2.5,y+.4,p.z-hz*(3+Math.random()*3)+(Math.random()-.5)*2.5,hx*v9*.08,1.2+Math.random()*2.2,hz*v9*.08,1.5+Math.random()*1.2);}} // LE VOILE : de la poudre lente qui reste en suspens dans la trace
  else BANQ.em=0;
  // LE GIVRE de la glisse : les patins jettent des éclats
  if(BANQ.glisse&&hv>10){BANQ.eg=(BANQ.eg||0)+dt*36*Math.min(1,hv/90);while(BANQ.eg>=1){BANQ.eg-=1;const sd=Math.random()<.5?-1:1;
    spawnP(fx.givre,p.x-hx*1.6+(-hz)*sd*1.1,p.y+.15,p.z-hz*1.6+hx*sd*1.1,-hx*v9*.15+(-hz)*sd*(2+Math.random()*4),1.5+Math.random()*4,-hz*v9*.15+hx*sd*(2+Math.random()*4),.25+Math.random()*.35);}}
  // LES FIGURES : la trace tenue, la glisse tenue, la dérive
  if(t===1&&d>-.35){BANQ.trT=(BANQ.trT||0)+dt;if(BANQ.trT>1.2&&!fg.trace){fg.trace=1;try{addTrick('bk_trace',sansAcc(TR('TRACE PARFAITE !')),12,2);flowAdd(8,'style');hap([8,14,8]);}catch(e){}}}
  else BANQ.trT=0;
  if(BANQ.glisse){ // (2026-10-15) l'ancienne PATINOIRE (1,4 s de glisse) est devenue ICE SKATE, payée à la durée et à la vitesse (bkSkate)
    if(Math.abs(BANQ.drift)>.6){BANQ.dT=(BANQ.dT||0)+dt;if(BANQ.dT>.8&&!fg.der){fg.der=1;try{addTrick('bk_der',sansAcc(TR('DERAPAGE GLACE !')),10,1);flowAdd(6,'style');hap([6,10]);}catch(e){}}}else BANQ.dT=0;}
  // LE SON de la glisse et de la poudre
  bkBoucle('banq.glisse',BANQ.glisse&&hv>6,-16+12*Math.min(1,hv/120),.8+.5*Math.min(1,hv/150));
  bkBoucle('banq.poudre',t===1&&d>-1.2&&hv>10,-18+14*Math.min(1,hv/110)*(d>-.35?1:.4),.85+.35*Math.min(1,hv/140));
  // LA MONTAGNE TE RAMÈNE : arrêté au contact plus de rameneT s, sans nitro
  if((BANQ.sur||(t===1&&d>-.8))&&hv<BK_PH.rameneV&&!nitroOn){BANQ.lent+=dt;if(BANQ.lent>BK_PH.rameneT)banqRamene();}else BANQ.lent=Math.max(0,BANQ.lent-dt*2);
}
/* LES BOUCLES DE SON (la glisse, la poudre, le vent) : une poignée par son, le gain et la vitesse suivent */
function bkBoucle(id,on,vol,rate){const B9=BANQ.boucles;let h=B9[id];
  if(on&&SONV2&&window.CCSON&&window.CCSON.existe(id)){
    if(!h){if(performance.now()>(B9['_'+id]||0)){B9['_'+id]=performance.now()+600;try{h=B9[id]=sfx(id,{loop:true,vol:vol||0});}catch(e){B9[id]=null;}}}
    else{try{h.gain(vol||0,.08);if(rate)h.rate(rate,.12);}catch(e){}}}
  else if(h){try{h.stop(.3);}catch(e){}B9[id]=null;}}
const BK_SONS={jour:[],soir:[['banq.chant',14,26,-18]],nuit:[['banq.chant',8,17,-15]],neige:[],blizzard:[]};
function banqSons(dt,c){
  const ok=SONV2&&started&&running&&!paused&&!gameOver&&!garageOn&&mode!=='boom';
  bkBoucle('banq.vent',ok,c.vent>1.5?-10:c.neige>.3?-17:-23,1);
  if(!ok)return;
  const L9=BK_SONS[c.sons]||[],T9=BANQ.son;T9.k=T9.k||{};
  for(const e of L9){if(T9.k[e[0]]==null)T9.k[e[0]]=e[1]*Math.random();T9.k[e[0]]-=dt;if(T9.k[e[0]]<=0){T9.k[e[0]]=e[1]+Math.random()*(e[2]-e[1]);try{sfx(e[0],{vol:e[3],pan:Math.random()*1.6-.8});}catch(x){}}}}
/* ---------------- LA CHAUFFE AU MENU : chaque matière compilée et dessinée une fois hors écran (0 programme en course) ---------------- */
function banqChauffe(){
  const M=banqMats(),fx=banqFx(),L9=[];
  const tri=at=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
    for(const k in at)g.setAttribute(k,new THREE.Float32BufferAttribute(new Float32Array(3*at[k]),at[k]));return g;};
  L9.push(new THREE.Mesh(tri({aS:2}),M.sol),new THREE.Mesh(tri({aB:3,aP:4}),M.pic),new THREE.Mesh(tri({aB:3,aP:4}),M.loin),new THREE.Mesh(tri({aT:4}),M.tr),new THREE.Mesh(tri({aV:4}),M.vg));
  for(const o of L9)o.frustumCulled=false;
  const ex=[fx.flo,fx.dd,fx.aur,BK_TR.mesh,fx.poudre.mesh,fx.givre.mesh,fx.eclat.mesh,fx.brume.mesh].concat(bkCretesChauffe(fx)),vus=ex.map(function(o){return [o,o.visible];});
  for(const v of vus)v[0].visible=true;
  const g=new THREE.Group();for(const o of L9)g.add(o);scene.add(g);
  try{chauffeRendu([g].concat(ex));}finally{scene.remove(g);for(const v of vus)v[0].visible=v[1];for(const o of L9)o.geometry.dispose();}
}
/* ---------------- LA CONSOLE ---------------- */
function bkVie(P){if(!P)return -1;let n=0;for(let i=0;i<P.n;i++)if(P.life[i]>0)n++;return n;} // (console) les particules vivantes d'une réserve
window.dbgBanq=function(k,o){
  if(k==='cam'){if(o)Object.assign(CAM_GLACIER,o);const d9=camera.getWorldDirection(new THREE.Vector3());return {on:CAM_GLACIER.on,k:CAM_GLACIER.k,g:+(camGlacier()*57.3).toFixed(1),phi:+(CAM_ROUTE.phi*57.3).toFixed(1),site:+(Math.asin(THREE.MathUtils.clamp(d9.y,-1,1))*57.3).toFixed(1),POR:+POR.toFixed(2),caisseY:+carGroup.position.clone().project(camera).y.toFixed(3)};} // (banc, 2026-10-18) LA CAMÉRA DU GLACIER : {k} la règle à chaud ; g = la part de pente redressée, phi = le cabrage tenu, site = l'assiette du regard (°)
  if(k==='pente'){const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};let n=0,m=0,gm=0;for(let s9=300;s9<L-300;s9+=20){frameAt(s9,F9);const g=-F9.t.y/Math.max(1e-6,Math.hypot(F9.t.x,F9.t.z));m+=g;n++;if(g>gm)gm=g;} // (banc, 2026-10-17 nuit) la piste en chiffres : demi-largeur, longueur, dénivelé, pente moyenne et maxi (en %)
    frameAt(0,F9);const y0=F9.p.y;frameAt(L-1,F9);const R={RH:ROAD_HALF,L:Math.round(L),denivele:Math.round(y0-F9.p.y),moy:Math.round(m/Math.max(1,n)*100),max:Math.round(gm*100)};
    if(o&&o.cote!=null){frameAt(L*o.cote,F9);const h=Math.hypot(F9.t.x,F9.t.z),d=o.d||1100;R.vue=dbgBanq('vue',{p:[F9.p.x-F9.t.z/h*d,F9.p.y+(o.h||120),F9.p.z+F9.t.x/h*d],c:[F9.p.x,F9.p.y-(o.b||60),F9.p.z],fov:o.fov||55});} // la vue de CÔTÉ : la pente en profil
    return R;}
  if(k==='piste')return {pics:(BANQ.obst||[]).map(function(q){return [Math.round(q.s),Math.round(q.lat),Math.round(q.r)];}),becs:(BANQ.kick||[]).map(function(q){return [Math.round(q.s),Math.round(q.l0),Math.round(q.l1)];})}; // (v4) la piste : [s, lat, rayon] des pics, [s, l0, l1] des becs
  if(k==='verglas'){const V9=(BANQ.verg||[]).map(function(v){return [Math.round(v.a),Math.round(v.b)];});
    if(o&&(o.s!=null||o.n!=null)){safeS=o.s!=null?o.s:600+(o.n|0)*800;respawn();graceT=0;if(o.v)vA=o.v/(3.6*SPD);}
    return {plaques:V9,sur:BKV.sur,yaw:+BKV.yaw.toFixed(3),gl:+BKV.gl.toFixed(3),gk:+BKV.gk.toFixed(2),ecl:bkVie(BANQ.fx.eclat),bru:bkVie(BANQ.fx.brume),t:+BKV.t.toFixed(2),aura:Math.round(BKV.aura),s:Math.round(s),lat:+lat.toFixed(2),psi:+psi.toFixed(3),kmh:Math.round(Math.abs(vA)*3.6*SPD),mode:mode};}
  if(k==='regle'){if(!BANQ.root)return null;const ob=new Set();for(const o9 of BANQ.obst||[])for(const P of o9.L9)ob.add(P); /* (2026-10-20, banc) LA RÈGLE D'OR : aucun cristal du DÉCOR (hors des pics de la piste) ne crève la glace, ses bords, ni l'air de la caméra (14 m de chaque côté) */
    const ds=L/(NP-1),st=Math.max(1,Math.round(6/ds));let n=0,t=0,pire=-1e9;const ex=[];
    for(let i=0;i<NP;i+=st){const p=pts[i],b=B[i];for(let q=-1;q<=1;q+=.25){const la=q*(ROAD_HALF+14),x=p.x+b.x*la,z=p.z+b.z*la;t++;const G=BANQ.picG,A9=G&&G.G.get(Math.floor(x/G.CG)*100003+Math.floor(z/G.CG));if(!A9)continue;
      for(const P of A9){if(ob.has(P)||(x-P.cx)*(x-P.cx)+(z-P.cz)*(z-P.cz)>P.r2)continue;const h=bkPrimH(P,x,z),m=h-(p.y-THICK-5);if(m>pire)pire=m;if(m>0){n++;if(ex.length<6)ex.push([Math.round(i*ds),+q.toFixed(2),Math.round(m),P.fam]);}}}}
    return {essais:t,percees:n,pire:Math.round(pire),ex:ex};}
  if(k==='meteo'){banqMeteo(o||'nuit',.01);return BANQ.met;}
  if(k==='embelli'){const fx=BANQ.fx;return {on:BK_EMB,cre:!!fx.cre,cN:fx.cN||null,graine:fx.cG,progs:renderer.info.programs?renderer.info.programs.length:-1};} /* (2026-10-21, banc) LE GLACIER EMBELLI : les comptes de l'anneau de crêtes */
  if(k==='phys'&&o){Object.assign(BK_PH,o);return BK_PH;}
  if(k==='cg'){if(o)Object.assign(BK_CG,o);return {cg:BK_CG,k:+BKB.k.toFixed(2),enf:+BKB.enf.toFixed(2),dans:BKB.dans,lat:+lat.toFixed(1),kmh:Math.round(Math.abs(vA)*3.6*SPD),p:carGroup.position.toArray().map(function(v){return +v.toFixed(1);}),t:F.t.toArray().map(function(v){return +v.toFixed(3);}),b:F.b.toArray().map(function(v){return +v.toFixed(3);}),n:F.n.toArray().map(function(v){return +v.toFixed(3);}),mort:mortCause,pq:BANQ.pourquoi||'',latOff:+curLatOff.toFixed(1),hOff:+curHOff.toFixed(1)};} // (banc, 2026-10-18) LA CONGÈRE : réglages et état
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);banqTick(0);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'pic' = le prochain pic où l'on glisse (o.d m avant, o.h m de haut) */
  if(k==='pic'){const ds=L/(NP-1),d=(o&&o.d)||90,h=(o&&o.h)||9;let i=-1,cible=null;
    {let bd=1e18;for(const P of BANQ.pics){if(P.fam!==0||P.H<25)continue;let bi=-1,b2=1e18;for(let j=Math.round((s+80)/ds);j<NP;j+=6){const q=(pts[j].x-P.cx)**2+(pts[j].z-P.cz)**2;if(q<b2){b2=q;bi=j;}}if(bi>=0&&bi<bd){bd=bi;i=bi;cible=[P.cx,P.A[1]-P.H*.4,P.cz];}}}
    if(i<0)return 'rien devant';const j=Math.max(0,i-Math.round(d/ds)),p=pts[j];banqTick(0);
    return window.dbgBanq('vue',{p:[p.x,p.y+h,p.z],c:cible,fov:o&&o.fov});}
  /* LÂCHER la caisse (en course) : 'poudre' = o.h m au-dessus de la neige à côté de la route ;
     o.v l'élan (unités de vol), o.pq le piqué (vitesse vers le bas / élan) */
  if(k==='poudre'||k==='pic9'){if(!started||gameOver||mode!=='drive')return 'pas en course';const ds=L/(NP-1),h=(o&&o.h!=null)?o.h:4,v=(o&&o.v)||90,pq=(o&&o.pq!=null)?o.pq:.12;
    let i=Math.min(NP-2,Math.round((s+70)/ds)),x,z,y;const t=T[i],hl=Math.hypot(t.x,t.z)||1;let hx=t.x/hl,hz=t.z/hl;
    if(k==='pic9'){const P=BANQ.pics.find(function(q){return q.fam===0&&q.H>25&&Math.hypot(q.cx-pts[i].x,q.cz-pts[i].z)<400;});if(!P)return 'pas de pic';x=P.cx-hx*P.r*.9;z=P.cz-hz*P.r*.9;y=P.A[1]+h;
      const dx=P.cx-x,dz=P.cz-z,dl=Math.hypot(dx,dz)||1;hx=dx/dl;hz=dz/dl;}
    else{const b=B[i];x=pts[i].x+b.x*(ROAD_HALF+45);z=pts[i].z+b.z*(ROAD_HALF+45);y=bkSolH(x,z)+h;}
    startFall(.9,1,false);fallPos.set(x,y,z);fallVel.set(hx*v,-v*pq,hz*v);fallVH0=v;carGroup.position.copy(fallPos);BANQ.mort='';
    return {x:+x.toFixed(1),y:+y.toFixed(1),z:+z.toFixed(1),sol:+bkSolH(x,z).toFixed(1)};}
  /* LE RACCOURCI (le GLACIER) : la caisse sort par le bord AVAL d'une spirale (o.n : laquelle, o.f : où dans le tour, 0-1), à o.v ; banc : lire dbgBanq('etat').s après la pose */
  if(k==='raccourci'){if(!started||gameOver||mode!=='drive')return 'pas en course';const sp=BANQ.spi[(o&&o.n)|0];if(!sp)return 'pas de spirale';const ds=L/(NP-1),i=Math.min(NP-2,Math.round((sp.s0+sp.lt*((o&&o.f!=null)?o.f:.15))/ds));
    let sd=1,best=1e18;for(const sg of [-1,1]){const x=pts[i].x+B[i].x*sg*40,z=pts[i].z+B[i].z*sg*40;for(let j=i+Math.round(300/ds);j<NP;j+=3){const q=pts[j];if(q.y>pts[i].y-15)continue;const d=(q.x-x)**2+(q.z-z)**2;if(d<best){best=d;sd=sg;}}}
    const v=(o&&o.v)||90;s=i*ds;startFall(.9,1,true);fallPos.copy(pts[i]).addScaledVector(B[i],sd*(ROAD_HALF+.5)).addScaledVector(Nn[i],.6);fallVel.copy(T[i]).multiplyScalar(v).addScaledVector(B[i],sd*6);fallVH0=v;carGroup.position.copy(fallPos);
    BANQ.racc={s0:Math.round(s),i:i};return {s0:Math.round(s),cote:sd,dessous:Math.round(Math.sqrt(best))};}
  if(k==='spirale'){const sp=BANQ.spi[(o&&o.n)|0];if(!sp)return 'pas de spirale';const ds=L/(NP-1);let cx=0,cy=0,cz=0,n=0,ym=1e9;for(let j=Math.round(sp.s0/ds);j<Math.round(sp.s1/ds);j+=20){cx+=pts[j].x;cy+=pts[j].y;cz+=pts[j].z;n++;ym=Math.min(ym,pts[j].y);}cx/=n;cy/=n;cz/=n;
    const j0=Math.round(sp.s0/ds),t=T[j0],a=(o&&o.a)||0,d=(o&&o.d)||520;return window.dbgBanq('vue',{p:[cx-Math.cos(a)*d*.7-t.x*d*.4,cy+(o&&o.h||300),cz-Math.sin(a)*d*.7-t.z*d*.4],c:[cx,ym+10,cz],fov:(o&&o.fov)||60});}
  if(k==='etat')return {s:Math.round(s),racc:BANQ.racc||null,mode:mode,sur:BANQ.sur,glisse:BANQ.glisse,pou:BANQ.pou,d:+(+BANQ.dNow).toFixed(2),t:BANQ.tNow,drift:+BANQ.drift.toFixed(2),lent:+BANQ.lent.toFixed(2),
    v:+Math.hypot(fallVel.x,fallVel.z).toFixed(1),vy:+fallVel.y.toFixed(1),y:+fallPos.y.toFixed(1),fallTR:+fallTR.toFixed(2),traces:BK_TR.i,figs:Object.keys(BANQ.figs)};
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='fini'){const t=performance.now(),n=bkTranches(1e9);return {taches:n,ms:Math.round(performance.now()-t)};}
  if(k==='ramene'){if(mode==='fall')banqRamene();return mode;}
  const triM=function(L9){return (L9||[]).reduce(function(a,m){return a+(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;},0);};
  return {on:!!BANQ.root,deco:BANQ.deco||null,met:BANQ.met,ms:BANQ.ms,msSol:BANQ.msSol,tp:BANQ.tp,axe:BANQ.axe!=null?Math.round(BANQ.axe*57.3):null,plan:BANQ.plan||null,pres:BANQ.pres,essais:BANQ.essais, /* (2026-10-19) LE GLACIER AU HASARD : l'axe (°), les tronçons, le plus près que la piste passe d'elle-même */file:{reste:BANQ.file.length-BANQ.fi,total:BANQ.nFile,ms:Math.round(BANQ.msFile||0)},tri:{sol:triM(BANQ.solM),pics:triM(BANQ.picM),loin:triM(BANQ.loinM)},n:BANQ.n,cas:BANQ.cas.map(function(x){return Math.round(x);}),
    sol:BANQ.sol&&{nx:BANQ.sol.nx,nz:BANQ.sol.nz,C:BANQ.sol.C,morceaux:BANQ.solM&&BANQ.solM.length,vus:BANQ.solM&&BANQ.solM.filter(function(m){return m.visible;}).length},
    cur:BANQ.cur&&{aur:+BANQ.cur.aur.toFixed(2),neige:+BANQ.cur.neige.toFixed(2),alp:+BANQ.cur.alp.toFixed(2)},L:Math.round(L),yMin:Math.round(trackMinY),y0:pts[0]&&Math.round(pts[0].y)};};

/* <<<FIN BANQUISE>>> */
/* ======================= LE GLACIER EMBELLI (2026-10-21, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures, améliorer les lumières — sans que ce soit trop gourmand pour le téléphone ») =======================
   MESURÉ AVANT : devant la caisse, deux plans seulement — la glace de la piste et les pics à moins de 3,6 km ; au-delà, l'horizon est un bandeau de brume SANS RIEN dedans (un dégradé plat),
   et rien ne vit dans l'air à part la neige qui tombe. Cette passe ajoute les plans qui manquent, dans la charte (clé chaude + remplissage froid, brume teintée, rose/or rares) :
   · LES CRÊTES LOINTAINES (pilier « trois plans ») : un anneau de montagnes à 7,3 / 8 / 8,7 km qui SUIT la caméra (à l'infini, comme les aurores), trois rangées de facettes plates
     (une teinte par facette : le côté du soleil chaud, l'ombre bleu-violet), la neige haut, la glace bleue bas, le pied qui fond dans la brume TEINTÉE (la plus loin est la plus pâle) ;
     elles lisent les mêmes uniforms que le reste de la banquise (uSunC, uSky, uAlpC, uAurC, uIceT, uMistC, uHazeC) : l'alpenglow les embrase au matin et au soir, l'aurore les bleuit la nuit
     et la couleur de la glace, des aurores et de l'alpenglow TIRÉS PAR LE DÉCOR AU HASARD (BANQ.dz) les suivent sans qu'on y touche ; un liseré d'or chaud, très fin, sur leur arête éclairée ;
   · LES PANACHES DE NEIGE (pilier « un détail vivant ») : de la neige soufflée qui file des plus hautes cimes, deux feuilles croisées par panache, qui ondulent et défilent avec uTime
     (rien à faire côté processeur) ; effacés par la neige et le blizzard (ils se noieraient dans la brume).
   Tout est à l'infini (aucun décor près de la piste, aucun calcul par image, aucune lumière), UN seul programme (les deux maillages partagent le même shader, `uPl` choisit crête / panache),
   deux appels de dessin, ~2 000 triangles. Le tirage vient de la graine de la piste mais dans un flux À LUI (`mulberry32(graine ^ 0xC4E7E5)`) : aucun tirage dans `fr`, la piste ne bouge pas.
   Paliers : `PAL.B.banqCreteL` (nombre de rangées 1/2/3), `banqCreteN` (facettes par tour), `banqPana` (panaches 0/8/14). `?sans=glacierembelli` = la banquise d'avant (rien de tout ceci).
   Console : `dbgBanq('embelli')` (les comptes), `dbgBanq('embelli',{k:…})`. */
const BK_EMB=typeof location==='undefined'||!/[?&]sans=([^&]*,)?glacierembelli(,|&|$)/.test(location.search);
try{Object.assign(PAL.B,{banqCreteL:[1,2,3],banqCreteN:[150,230,320],banqPana:[0,14,24]});}catch(e){}
const BK_CRE_LAY=[[8700,1900,.80],[8000,1400,.66],[7300,950,.50]]; /* [rayon (m), hauteur max au-dessus de la caméra (m), part de brume] — du plus loin au plus près */
const BK_CRE_B=-300; // le pied de l'anneau, sous l'horizon : il fond dans la brume (alpha 0)
const BK_CRE_VS=['attribute vec4 aK;uniform float uTime,uPl;varying vec3 vW;varying vec4 vK;',
  'void main(){vec3 p=position;',
  '  if(uPl>.5){float ph=aK.w;p.y+=sin(uTime*.37+aK.y*5.+ph*6.2832)*70.*aK.y;p.xz+=vec2(cos(ph*6.2832),sin(ph*6.2832))*sin(uTime*.29+aK.y*4.+ph*9.)*60.*aK.y;}', // le panache ondule : plus on va vers la queue, plus il flotte
  '  vec4 wp=modelMatrix*vec4(p,1.);vW=wp.xyz;vK=aK;gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n');
const BK_CRE_FS=[FG_BRUIT,
  'uniform vec3 uSunDir,uSunC,uSky,uFillC,uCam,uHazeC,uMistC,uAlpC,uAurC,uAurC2,uIceT;uniform float uTime,uPl,uAlp,uAur,uHazeM,uNeige;varying vec3 vW;varying vec4 vK;',
  'void main(){vec3 rel=vW-uCam;float hr=max(length(rel.xz),1.);vec3 r=vec3(rel.x,0.,rel.z)/hr;float lay=vK.x;',
  '  float hzL=lay<.5?.80:(lay<1.5?.66:.50);vec3 hc=mix(uHazeC,uMistC,.35);',
  '  if(uPl>.5){', /* le PANACHE : t le long (0 à la cime, 1 à la queue), sd le travers */
  '    float t=vK.y,sd=vK.z,ph=vK.w;float st=fn2(vec2(t*6.-uTime*.55+ph*9.,sd*2.2+ph*5.));',
  '    float a=(1.-t)*(1.-t*.6)*smoothstep(1.,.30,abs(sd))*(.30+.80*st)*.90*(1.-smoothstep(.15,.85,uNeige));',
  '    vec3 sn=vec3(.93,.96,1.)*(uSky*.60+uSunC*.55)+uAlpC*uAlp*.45+vec3(1.,.82,.5)*.04*uSunC;',
  '    sn=mix(sn,hc,hzL*.55);gl_FragColor=vec4(sn,a);return;}',
  /* la CRÊTE : la facette a sa pente (vK.z), sa hauteur absolue (vK.y, 0 au pied → 1 au plus haut) et sa place dans la colonne (vK.w, 0 pied → 1 arête) */
  '  float h01=vK.y,k=vK.z,cf=vK.w;vec3 tg=vec3(r.z,0.,-r.x);',
  '  vec3 n=normalize(vec3(-r.x*.55,.50,-r.z*.55)-tg*k*.9);',
  '  float ndl=dot(n,uSunDir),dif=clamp((ndl+.15)/1.15,0.,1.);',
  '  vec2 nq=vec2(atan(rel.x,rel.z)*46.+lay*13.,vW.y*.012);float nz=fn2(nq);',
  '  float sn=smoothstep(.30,.60,h01+(nz-.5)*.16);', /* la neige tient en haut */
  '  vec3 rock=uIceT*vec3(.22,.36,.74)*(.90+.20*fn2(nq*2.7+4.));vec3 snow=vec3(.86,.91,1.);',
  '  vec3 alb=mix(rock,snow,sn);',
  '  vec3 col=alb*(uSky*(.42+.22*n.y)+uSunC*dif*.80+uFillC*.20);', /* la clé chaude de face… */
  '  col=mix(col,col*vec3(.76,.86,1.22),(1.-dif)*.65);', /* …et l'ombre qui bascule au bleu-violet (jamais au gris) */
  '  float sa=max(dot(r,normalize(vec3(uSunDir.x,0.,uSunDir.z)+vec3(1e-4))),0.);',
  '  col+=alb*uAlpC*uAlp*(.25+.75*dif)*(.25+.75*smoothstep(.35,1.,h01))*1.1;', /* l'ALPENGLOW embrase les crêtes */
  '  float rim=smoothstep(.80,1.,cf);',
  '  col+=uSunC*vec3(1.,.80,.50)*rim*(.10+.40*pow(sa,3.))*(.35+.65*dif)*.85;', /* le liseré d'or de l'arête éclairée (le clin d'œil CASH) */
  '  col+=alb*mix(uAurC,uAurC2,.35)*uAur*.24*(.25+.75*h01);', /* la nuit : la couleur de l'aurore sur la neige */
  '  float hz=clamp(hzL+(.97-hzL)*pow(1.-h01,2.5),0.,max(.97,uHazeM));col=mix(col,hc,hz);',
  '  gl_FragColor=vec4(col*.92,smoothstep(0.,.20,cf));}'].join('\n');
function bkCretesMat(pl){const m=new THREE.ShaderMaterial({uniforms:Object.assign({uPl:{value:pl}},BK_U),vertexShader:BK_CRE_VS,fragmentShader:BK_CRE_FS,transparent:true,depthWrite:!pl,side:THREE.DoubleSide,fog:false});
  m.dispose=function(){};return m;} // jamais libérées : un seul jeu pour toutes les banquises ; les deux gardent `transparent` : UN programme pour les deux
/* LA GÉNÉRATION : une rangée = un bruit périodique en valeur, REDRESSÉ (1-|2n-1|)² (des pointes, pas des vagues), cinq octaves, trois massifs en bosse ; chaque facette (un segment de l'anneau)
   a sa pente constante (aK.z) → éclairée à plat, comme les cristaux de la piste. Les plus hautes pointes des rangées lointaines portent un panache. */
function bkCretesGen(fx){
  const R=mulberry32((((BANQ.graine|0)^0xC4E7E5)>>>0)),LL=PAL_BK('banqCreteL',3),NS=PAL_BK('banqCreteN',320),PN=PAL_BK('banqPana',14);
  const rangs=LL>=3?[0,1,2]:LL===2?[0,2]:[1],P=[],K=[],pics=[],TP=Math.PI*2;
  const tri=(a,b,c)=>{P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);K.push(a[3],a[4],a[5],a[6],b[3],b[4],b[5],b[6],c[3],c[4],c[5],c[6]);};
  for(const j of rangs){
    const Rr=BK_CRE_LAY[j][0],Hm=BK_CRE_LAY[j][1],FQ=[3,7,16,34,70],AM=[.30,.26,.22,.14,.08],tb=FQ.map(f=>{const a=[];for(let i=0;i<f;i++)a.push(R());return a;}),bump=[];
    for(let b=0;b<3;b++)bump.push([R()*TP,.07+R()*.09,.55+R()*.45]);
    const H=new Float32Array(NS+1);
    for(let i=0;i<=NS;i++){const u=(i%NS)/NS;let h=0;
      for(let o=0;o<5;o++){const f=FQ[o],x=u*f,fl=Math.floor(x),i0=fl%f,i1=(i0+1)%f,t=x-fl,s=t*t*(3-2*t),n=tb[o][i0]+(tb[o][i1]-tb[o][i0])*s,rr=1-Math.abs(2*n-1);h+=AM[o]*rr*rr;}
      h=1-Math.exp(-h*2.2); /* un genou doux : des pointes distinctes, plus de plateau écrêté */
      for(const b of bump){let d=Math.abs(u*TP-b[0]);if(d>Math.PI)d=TP-d;h=Math.max(h,b[2]*Math.exp(-(d/b[1])*(d/b[1])));}
      H[i]=.10+.90*h;}
    H[NS]=H[0];
    const top=i=>BK_CRE_B+(Hm-BK_CRE_B)*H[i],h01=i=>top(i)-BK_CRE_B,hn=Hm-BK_CRE_B,xz=(i)=>{const a=(i%NS)/NS*TP;return [Math.sin(a)*Rr,Math.cos(a)*Rr];};
    for(let i=0;i<NS;i++){const a=xz(i),b=xz(i+1),k=Math.max(-1,Math.min(1,(top(i+1)-top(i))/(Rr*TP/NS)*.55));
      const A=[a[0],BK_CRE_B,a[1],j,0,k,0],B=[a[0],top(i),a[1],j,h01(i)/hn,k,1],C=[b[0],BK_CRE_B,b[1],j,0,k,0],D=[b[0],top(i+1),b[1],j,h01(i+1)/hn,k,1];
      tri(A,B,C);tri(C,B,D);
      if(j<2&&H[i]>.52&&H[i]>=H[(i+NS-1)%NS]&&H[i]>=H[i+1])pics.push([j,i,H[i],a[0],top(i),a[1]]);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,4));g.computeBoundingSphere();
  if(fx.cre.geometry)fx.cre.geometry.dispose();fx.cre.geometry=g;
  /* LES PANACHES : les plus hautes pointes, espacées d'au moins 0,22 rad, soufflées dans le sens du vent de la piste ; deux feuilles croisées (une verticale, une à plat) de sept éléments */
  const wd=R()*TP,dwx=Math.sin(wd),dwz=Math.cos(wd),pxz=[Math.cos(wd),-Math.sin(wd)],PP=[],PK=[],M=7;pics.sort((a,b)=>b[2]-a[2]);const pris=[];
  for(const p of pics){if(pris.length>=PN)break;const an=Math.atan2(p[3],p[5]);let ok=true;for(const q of pris){let d=Math.abs(an-q);if(d>Math.PI)d=TP-d;if(d<.22){ok=false;break;}}if(!ok)continue;pris.push(an);
    const ph=R(),Lp=1100+R()*800,W0=130+R()*80,rr=.985,ax=p[3]*rr,ay=p[4],az=p[5]*rr,v=[];
    for(let m=0;m<=M;m++){const t=m/M,W=W0*(.35+1.5*t),cx=ax+dwx*t*Lp,cy=ay+Lp*.12*Math.sin(t*2.2),cz=az+dwz*t*Lp;v.push([cx,cy,cz,W]);}
    for(const sheet of [0,1])for(let m=0;m<M;m++){const q0=v[m],q1=v[m+1],t0=m/M,t1=(m+1)/M,off=(q,s)=>sheet?[q[0]+pxz[0]*q[3]*.5*s,q[1],q[2]+pxz[1]*q[3]*.5*s]:[q[0],q[1]+q[3]*.5*s,q[2]];
      const a0=off(q0,-1),b0=off(q0,1),a1=off(q1,-1),b1=off(q1,1),V=(o,t,s)=>[o[0],o[1],o[2],p[0],t,s,ph];
      const A=V(a0,t0,-1),B=V(b0,t0,1),C=V(a1,t1,-1),D=V(b1,t1,1);
      for(const w of [A,B,C,C,B,D]){PP.push(w[0],w[1],w[2]);PK.push(w[3],w[4],w[5],w[6]);}}}
  if(PP.length){const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));g2.setAttribute('aK',new THREE.Float32BufferAttribute(PK,4));g2.computeBoundingSphere();
    if(!fx.pan){fx.pan=new THREE.Mesh(g2,fx.mPan);fx.pan.name='banquise panaches';fx.pan.frustumCulled=false;fx.pan.matrixAutoUpdate=false;fx.pan.renderOrder=-2.5;fx.pan.visible=false;scene.add(fx.pan);}
    else{if(fx.pan.geometry)fx.pan.geometry.dispose();fx.pan.geometry=g2;}}
  fx.cG=BANQ.graine|0;fx.cN={tri:P.length/9,pana:pris.length,panaTri:PP.length/9,rangs:rangs.length};}
function bkCretes(fx){ // une fois, au premier tour de la banquise (banqFx) : les matières, le maillage de l'anneau, puis sa génération
  if(!BK_EMB||fx.cre)return;
  fx.mCre=bkCretesMat(0);fx.mPan=bkCretesMat(1);
  fx.cre=new THREE.Mesh(new THREE.BufferGeometry(),fx.mCre);fx.cre.name='banquise crêtes lointaines';fx.cre.frustumCulled=false;fx.cre.matrixAutoUpdate=false;fx.cre.renderOrder=-3;fx.cre.visible=false;scene.add(fx.cre);
  bkCretesGen(fx);}
function bkCretesTick(fx){ // chaque image, dans banqTick : l'anneau suit la caméra (rien d'autre : tout le reste vit dans le shader)
  if(!fx.cre)return;
  if(fx.cG!==(BANQ.graine|0))bkCretesGen(fx); // une piste neuve : d'autres crêtes (un seul passage, < 1 ms)
  const cp=camera.position;
  for(const m of [fx.cre,fx.pan]){if(!m)continue;m.visible=true;m.position.copy(cp);m.updateMatrix();m.updateMatrixWorld(true);}}
function bkCretesCache(fx){if(fx.cre)fx.cre.visible=false;if(fx.pan)fx.pan.visible=false;}
function bkCretesChauffe(fx){return fx.cre?(fx.pan?[fx.cre,fx.pan]:[fx.cre]):[];}
