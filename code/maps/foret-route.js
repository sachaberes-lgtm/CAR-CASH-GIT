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
