/* L'ACHAT. Rend un objet {ok, raison} plutôt qu'un booléen : l'appelant doit pouvoir DIRE pourquoi
   ça n'a pas marché. ⚠ le débit et le flush sont dans la MÊME fonction — une caisse posée dans
   `owned` sans que la banque soit débitée, c'est de l'argent créé, et ça ne se rattrape pas. */
function carBuy(i){
  const p=carPrice(i);
  if(!p)return {ok:false,raison:'pas-a-vendre'};
  if(carOwned(i))return {ok:false,raison:'deja-possedee'};
  if(bank()<p)return {ok:false,raison:'fonds-insuffisants',manque:p-bank()};
  SAVE.d.bank=bank()-p;
  if(!Array.isArray(SAVE.d.owned))SAVE.d.owned=[];
  SAVE.d.owned.push(i);carWas[i]=true; // (2026-09-30) l'achat se fête AU GARAGE (tampon) : sans ça, le 1er carScan de la course suivante la recriait « 🔑 … (au garage) » + fanfare
  SAVE.d.bestCar=Math.max(SAVE.d.bestCar|0,i); // l'indicateur d'avancement suit
  SAVE.flush();
  return {ok:true,paye:p,reste:bank()};
}
function carUnlockText(i){ // ce qu'il reste à faire, en une ligne — affiché sur la caisse verrouillée
  const u=CAR_UNLOCK[i];if(!u)return '';
  // (2026-09-03) cette fonction traduit en dur (FR/EN), jamais via I18N : `L` vaut 0 en français, 1 en anglais.
  const L=LANG==='en'?1:0;
  // À VENDRE : on annonce le prix ET ce qu'il manque. « il te manque X » est la seule information
  // qui donne envie de rejouer ; un prix seul laisse le joueur faire la soustraction lui-même.
  if(u.p){
    const manque=u.p-bank();
    return ['PRIX : ','PRICE: '][L]+fmtC(u.p)+(manque>0
      ? ['\n(il te manque ','\n(short by '][L]+fmtC(manque)+')'
      : ['\nTU PEUX TE LA PAYER !','\nYOU CAN AFFORD IT!'][L]); // (2026-09-29) la 2e moitié sur SA ligne (#gDesc en pre-line) : « — tu peux » tombait seul en tête de ligne
  }
  if(u.k==='mis'){const m9=m2Def(u.id);if(!m9)return '';return m9.f==='secret'&&!carUnlockedVrai(i)?TR('MISSION SECRÈTE'):sansAcc(TR('SE DÉBLOQUE'))+' : '+sansAcc(m2Txt(m9));} // (2026-10-16) LES MISSIONS v2
  const v=u.v,cur=carStat(u.k);
  if(u.k==='carnet')return ['SE GAGNE EN RELEVANT 3 MISSIONS', /* (2026-09-28) police pixel : pas de capitale accentuée (« DéFIS ») */'WON BY COMPLETING 3 MISSIONS'][L];
  switch(u.k){
    case 'aura':  if(auraSansNom()){const s9=fmtAura((AURA_RANKS[v]||AURA_RANKS[0]).v),t9=fmtAura(SAVE.d.aura||0);return ['AURA '+s9+'   (la tienne : '+t9+')','AURA '+s9+'   (yours: '+t9+')'][L];}
                  return [ 'RANG D\'AURA « '+auraRankName(v)+' »   (le tien : « '+auraRankName()+' »)',
                           'AURA RANK "'+auraRankName(v)+'"   (yours: "'+auraRankName()+'")'][L];
    case 'cash':  return [ 'RECORD DE PARTIE : ','BEST RUN: '][L]+fmtC(v)+'  ('+fmtC(cur)+')';
    case 'eng':   return [ 'ATTEINDRE LE MOTEUR « '+(ENGINE_TIERS[v]||ENGINE_TIERS[0]).n+' »  (palier '+(v+1)+' / '+ENGINE_TIERS.length+', ton record : '+(cur+1)+')',
                           'REACH THE « '+TR((ENGINE_TIERS[v]||ENGINE_TIERS[0]).n)+' » ENGINE  (tier '+(v+1)+' / '+ENGINE_TIERS.length+', your best: '+(cur+1)+')'][L];
    case 'tricks':return v+[ ' FIGURES RÉUSSIES EN TOUT  (',' TRICKS LANDED IN TOTAL  ('][L]+cur+')';
    case 'gaps':  return v+[ ' GAPS FRANCHIS  (',' GAPS CLEARED  ('][L]+cur+')';
    case 'bumps': return v+[ ' BUMPS SUR LA TRANCHE  (',' BUMPS OFF THE EDGE  ('][L]+cur+')';
    case 'zones': return v+[ ' ZONES DANS UNE SEULE PARTIE  (record : ',' ZONES IN A SINGLE RUN  (best: '][L]+cur+')';
    case 'chain': return [ 'UNE CHAÎNE DE ','A CHAIN OF '][L]+v+[ ' FIGURES  (record : ',' TRICKS  (best: '][L]+cur+')';
    case 'kmh':   return [ 'ATTEINDRE ','REACH '][L]+v+[ ' KM/H  (record : ',' KM/H  (best: '][L]+cur+')';
    case 'surv':  return [ 'GAGNER UNE PARTIE EN MODE SURVIVANT','WIN A RUN IN SURVIVOR MODE'][L];
    case 'prem':  return [ 'CAISSE PREMIUM — offerte pour l\'instant','PREMIUM CAR — free for now'][L];
    case 'bientot':return [ 'INTROUVABLE','NOT AVAILABLE'][L]; // (2026-10-06) COMÈTE : le défi reste à écrire (police pixel : pas de capitale accentuée)
    case 'pubs':  return [ 'REGARDE '+v+' PUBS  ('+Math.min(cur,v)+' / '+v+')','WATCH '+v+' ADS  ('+Math.min(cur,v)+' / '+v+')'][L]; // (2026-10-06) L'ÉTERNELLE
    case 'runs':  return [ 'JOUE '+v+' PARTIES  ('+Math.min(cur,v)+' / '+v+')','PLAY '+v+' RUNS  ('+Math.min(cur,v)+' / '+v+')'][L]; // (2026-10-14) L'ÉTERNELLE : 100 parties jouées (police pixel : pas d'accent)
  }
  return '';
}
// Aucun état « déjà annoncé » n'est persisté : une condition remplie le reste, donc l'instantané
// mémoire suffit à ne crier une caisse qu'UNE fois. carSnapshot() est pris au chargement, sinon le
// premier scan annoncerait d'un coup tout ce qui était déjà acquis.
let carWas=[];
// La caisse à conduire : celle du garage, à condition qu'elle soit VRAIMENT débloquée. Les caisses ne
// se gagnant plus dans l'ordre, on ne peut pas se fier à `bestCar` — un `equipped` hérité d'une
// sauvegarde importée ou d'une règle antérieure doit retomber sur la cabossée plutôt que d'offrir
// une caisse non méritée.
function equippedCar(){const i=SAVE.d.equipped|0;return (i>=0&&i<CARS.length&&carUnlocked(i))?i:0;}
function carSnapshot(){carWas=[];for(let i=0;i<CARS.length;i++)carWas[i]=carUnlockedVrai(i);}
function carScan(){ // rend les caisses NOUVELLEMENT débloquées + resynchronise l'indicateur bestCar
  const got=[];
  for(let i=0;i<CARS.length;i++){const u=carUnlockedVrai(i);if(u&&!carWas[i])got.push(i);carWas[i]=u;}
  let bc=0;for(let i=0;i<CARS.length;i++)if(carWas[i])bc=i;
  if(bc!==(SAVE.d.bestCar|0)){SAVE.d.bestCar=bc;SAVE.mark();}
  return got;
}
let engSwapT=0; // minuteur de la SCÈNE de changement de palier (montage → pose → révélation)
/* LE BADGE DE PALIER — le « niveau supérieur » qui se stampe sur la vignette du moteur.
   ⚠ REJOUER UNE ANIMATION CSS NE VA PAS DE SOI : réappliquer la même classe ne la relance pas,
   le navigateur considère qu'elle tourne déjà. Deux paliers enchaînés (ça arrive : une figure
   peut rapporter assez de pièces pour en franchir deux) et le second passait INAPERÇU. On coupe
   donc l'élément, on force un reflow (`offsetWidth`), et on le rallume. */
const epEl=document.getElementById('engPop'),epNumEl=document.getElementById('epNum'),
      epNomEl=document.getElementById('epNom');
/* LE NOUVEAU MOTEUR, EN GRAND (2026-09-25, user : « dès que tu débloques un nouveau moteur, je veux l'animation en grand
   qui apparaît »). Le petit badge de coin (118 px) passait inaperçu en pleine course. Désormais une CARTE au centre haut
   de l'écran — jamais sur la caisse — : des rayons qui tournent à la couleur du moteur, « NOUVEAU MOTEUR », le NOM en
   grand, sa phrase, la rangée de ses cylindres qui s'allument un par un, et le palier. Elle claque, tient 1,6 s, file.
   `pointer-events:none` : elle ne vole jamais un toucher de conduite. */
/* (vague 2, 2026-09-26) LA CARTE MOTEUR v3 — H1 du directeur artistique : posée sur le toit (canvas 359×240 + numéro 58 px ≈ 340 px au
   centre pendant 2,3 s), elle cachait la ROUTE devant la caisse ET tout le tableau de bord (gt1-06/07/12/13/14, da-01). Désormais :
   · elle NAÎT dans le couloir des annonces, sous le tableau de bord (haut de carte = --laneA − 40 px : sous la chaîne de 2 lignes),
     rétrécie seulement si l'écran est trop court pour laisser la caisse libre (`--ebS`, ≥ .62) ;
   · le moteur 3D reste GRAND (scène 220 × 147 px), le NUMÉRO devient un badge posé sur son épaule (40 px), le nom dessous ;
   · à 1 s — ou dès qu'une voix plus forte réclame le couloir — les textes s'effacent et le moteur PLONGE dans la caisse (0,44 s), rétrécit
     et claque sur le toit : il est SUR la voiture, et la route devant elle n'est jamais cachée plus d'une seconde.
   Le moteur 3D n'est plus recopié dans un <canvas> (lecture GPU→CPU) : il est recollé directement dans l'image WebGL à la place de
   `.ebScene` (voir `engQuadDraw`) — les textes de la carte sont du DOM, donc au-dessus de lui. `pointer-events:none` partout. */
const ENG_PLONGE=480,ENG_COULOIR=1000; // (2026-09-28, v4) 1,15 s au-dessus de la caisse, puis 0,52 s pour rentrer dans le capot — (v5) 1 s puis 0,48 s : la carte ne dit plus que le NOM, elle ne doit pas masquer la route plus longtemps
/* LA SCÈNE D'ATELIER CALÉE SUR LE MOTEUR (2026-09-28). Elle partait au passage de palier, la carte parfois plus tard (file du couloir) :
   le flash et l'onde tombaient pendant que le moteur flottait encore. Sur téléphone elle est désormais armée PAR la carte, pour que sa
   RÉVÉLATION (u = .38 de T_SWAP : clank, flash, onde, spirale) tombe à l'instant où le moteur disparaît dans le capot — et d'ici là
   les étincelles de soudure jaillissent du capot pendant qu'il descend en tournant de plus en plus vite. */
const ENG_ARME=Math.max(0,ENG_COULOIR+ENG_PLONGE-Math.round(T_SWAP*.38*1000));
function engSwapArme(){
  if(performance.now()-poseSndT<80)setTimeout(function(){try{engSwapSnd();}catch(e){}},450); // (2026-09-26, audit son) la visseuse attend que le « tchak » d'une pose ait parlé
  else try{engSwapSnd();}catch(e){}
  engSwapT=T_SWAP;shake=Math.max(shake,.15);duckT=Math.max(duckT,.45); // (v4) .5 → .15 : la grosse secousse est gardée pour l'entrée dans le capot (engImpact)
  {const c9=engBig.on&&engBig.col?engBig.col:0xffd75e;swapRing.material.color.setHex(c9);swapLight.color.setHex(engBig.on&&engBig.col?c9:0xffd06a);} // (v5) l'onde et le flash à la couleur NÉON du moteur (l'or sans carte)
}
/* LA CARTE MOTEUR v4 (2026-09-28, Sacha : « rends l'animation du déblocage des moteurs plus belle, plus soignée, plus pro, adaptée à
   l'écran d'un iPhone, maîtrisée — qu'on soit content de débloquer le moteur »). Filmée à 30 i/s avant d'y toucher : le badge du palier
   flottait à GAUCHE du moteur, le titre faisait 8 px, le moteur se délavait sur les ciels clairs (halo coloré additif), et rien ne disait
   ce que le moteur APPORTE. Désormais, une composition centrée et une récompense qui se sent :
   · un BANDEAU « NOUVEAU MOTEUR » à la couleur du moteur, le NOM en grand, une ligne PALIER · +N KM/H, les cylindres dessous ;
   · le moteur 3D posé sur un DISQUE D'ENCRE cerclé de sa couleur (lisible sur n'importe quel ciel), un éclat blanc à l'apparition ;
   · les cylindres s'allument un par un sur une gamme qui MONTE, puis le gain de vitesse claque en vert ;
   · à l'entrée dans le capot : éclair d'or, coup de caméra, et le moteur RUGIT (poussée brève + flammes) — « +N KM/H » jaillit de la caisse.
   Le gain est celui de la vitesse de croisière affichée (vmax × FLOW_VREF, mesuré au banc) : ce que le compteur gagne vraiment. */
/* (2026-09-30) le gain appliquait l'overdrive du palier COURANT aux deux paliers comparés — or chaque palier 9-22 ajoute aussi +3,5 %
   d'overdrive sur TOUT le moteur : « +28 KM/H » affiché au palier 10 pour +44 réels. Chacun son facteur (engLate). `de` : le palier de
   la carte précédente (deux paliers fondus en une carte — engBigFile — disent leur gain cumulé). */
function engGain(tier,de){if(de==null)de=tier-1;const a=ENGINE_TIERS[tier],b=ENGINE_TIERS[de];if(!a||!b)return 0;
  return Math.max(0,Math.round(CARS[0].maxKmh*SPD*(engLate(tier)*a.push-engLate(de)*b.push)*FLOW_VREF));}
/* (2026-09-30) LES CAPACITÉS MOTEUR (ENG_CAP) arrivaient sans un mot : la carte du palier qui en ouvre une la NOMME dans son petit
   titre, à la place de « NOUVEAU MOTEUR » — pas une ligne de plus sur la route. (La COMÈTE est aussi le NOM du moteur ENG_CAP.comete : son titre
   dit ce qu'elle fait, « CAISSE EN FEU », pas deux fois « COMÈTE ».) */
const ENG_CAP_NOM={billets:'PLUIE DE BILLETS',aimant:'AIMANT À PIÈCES',comete:'CAISSE EN FEU'};
function engCapNom(de,tier){let n=null;for(const k in ENG_CAP)if(ENG_CAP[k]>de&&ENG_CAP[k]<=tier&&ENG_CAP_NOM[k])n=ENG_CAP_NOM[k];return n;}
function engImpact(){ // l'entrée dans le capot : le moment où l'on ENCAISSE le moteur
  if(gameOver||!running)return;
  {const c9=ENG_NE.setHex(engBig.col||0xffd75e);flashEcran('rgba('+Math.round(c9.r*255)+','+Math.round(c9.g*255)+','+Math.round(c9.b*255)+',.6)');} // (v5) l'éclair à la couleur du moteur
  fovPunch=Math.max(fovPunch,11);shake=Math.max(shake,.4);hap([14,30,24]);
  boost=Math.max(boost,.8);try{if(!SONV2)boostSnd(1.4);}catch(e){} /* il RUGIT : une poussée brève, les flammes du pad (console de son : la poussée est DANS moteur.palier, calée sur cet instant) */
  const g=engBig.gain|0;if(g>0)setTimeout(function(){try{if(running&&!gameOver)popTexte('+'+g+' KM/H','#7dff9a',2);}catch(e){}},200);
}
function engBig(E,tier,ru){
  let b=document.getElementById('engBig');
  if(!b){b=document.createElement('div');b.id='engBig';b.setAttribute('aria-live','polite');document.body.appendChild(b);}
  clearTimeout(engBig._p);clearTimeout(engBig._t);clearTimeout(engBig._z);clearTimeout(engBig._a);
  const hx=engNeon(E.col||0xffd75e),n=Math.max(1,Math.min(16,E.cyl||4)); // (v5) la couleur du moteur, poussée au NÉON : les premiers paliers sont gris-acier, la carte aurait été terne
  const de=engBig.vu!=null&&engBig.vu<tier?engBig.vu:tier-1;engBig.vu=tier; // la carte d'AVANT (plus haute = partie précédente : on repart d'un cran)
  const gain=engGain(tier,de),cap9=engCapNom(de,tier);engBig.gain=gain;
  const rec=tier>(RUNX.engAvant|0); // (2026-09-25) palier jamais atteint AVANT cette partie : le seul moment vraiment neuf
  b.style.setProperty('--ec',hx);b.classList.toggle('rec',rec);b.classList.toggle('long',String(TR(E.n)).length>12); // (v5) un nom long (« MOTEUR À DISTORSION ») descend d'un corps : il ne barre pas la route d'un bord à l'autre
  {const o9=b.querySelector('canvas');if(o9){o9.width=o9.height=0;}} // (2026-09-26) un ancien canvas rendu tout de suite (iOS plafonne la mémoire des canvas)
  // (H3) « NOUVEAU RECORD ! » disait trois choses (aura, meilleur palier, écran de mort) : le meilleur palier devient un SOMMET
  const nm=TR(E.n);
  /* (v5, 2026-09-28, Sacha : « l'animation du déblocage d'un moteur est toujours moche, elle ne suit pas la voiture et bloque la vision ;
     plus petite, elle doit voler au-dessus de la voiture, être jolie avec de belles couleurs, rétrécir et rentrer dedans — pense au mobile »)
     LA CARTE SE RÉDUIT À L'ESSENTIEL : une étiquette (NOUVEAU MOTEUR), le NOM dans la typo ombrée du HUD, à la couleur néon du moteur, et
     le moteur 3D à l'échelle de la CAISSE, posé sur son toit. Le palier, les cylindres et le gain ont quitté la carte : le gain jaillit de
     la voiture à l'entrée dans le capot (engImpact), les cylindres chantent toujours (à l'oreille). */
  b.innerHTML='<div class="ebCarte"><small class="ebTit'+(cap9?' cap':'')+'">'+(cap9?'+ '+sansAcc(TR(cap9)):sansAcc(TR(rec?'NOUVEAU SOMMET':'NOUVEAU MOTEUR')))+'</small>'
    +'<b data-t="'+String(nm).replace(/[<>&"]/g,'')+'">'+nm+'</b>'
    +'<div class="ebScene"></div></div>';
  engBig.ctx=null;engBig.on=true;engBig.plonge=0;engBig.t0=performance.now();engBig.col=parseInt(hx.slice(1),16);engBig.hex=hx;engVigSpin=0;
  engRim.color.setHex(engBig.col);engRim.intensity=1.5; // le liseré néon du moteur (éteint par engBigFin)
  document.body.classList.remove('ebPlonge');document.body.classList.add('ebOn');
  b.classList.remove('on','plonge','ruban','gain');void b.offsetWidth;
  engBigPlace(b);engBigSuit();b.classList.add('on'); // (2026-09-28) posée au-dessus de la caisse dès la 1re image (pas un saut depuis le couloir)
  if(ru)engRuban(ru);
  hap(rec?[18,50,30,60,40]:[18,50,30]);pixBurst(b.querySelector('.ebScene'),rec?28:18);
  // (v4) LES CYLINDRES CHANTENT : une note par cylindre qui s'allume, sur une gamme qui monte — puis le gain claque
  /* (2026-10-15, Sacha : « plein de ding-ding-ding ») sonPdAR et non plus sonPd : un moteur de 16 cylindres montait de quatre octaves (mi5 → mi9,
     5 kHz) ; la gamme tient dans l'octave (montée puis va-et-vient) et le cylindre est un « toum » de piston grave (recettes.js) */
  for(let i=0;i<n;i++)setTimeout(function(){try{if(engBig.on&&!engBig.plonge){if(SONV2)sfx('moteur.cylindre',{st:sonPdAR(i)});else chimeNote(noteP(i%5,1+Math.floor(i/5)),0,.028,.08);}}catch(e){}},250+i*50);
  clearTimeout(engBig._f);if(rec)engBig._f=setTimeout(function(){if(!gameOver)try{son('ui.record',fanfare,{vol:-8});}catch(e){}},SONV2?2150:1200); /* (2026-10-12) −8 dB : les cuivres du début de course */ /* (console de son) le NOUVEAU SOMMET sonne APRÈS l'impact et la fanfare de palier, plus par-dessus la visseuse */ // APRÈS le démarreur du montage, jamais par-dessus
  engBig._p=setTimeout(engPlonge,ENG_COULOIR);
  engBig._a=setTimeout(function(){if(!gameOver)engSwapArme();},ENG_ARME); // le clank de la visseuse = l'entrée dans le capot
}
/* OÙ SE POSE LA CARTE — lu UNE fois à l'apparition (pas dans la boucle) : le haut de la carte 40 px au-dessus de --laneA (le bas du
   tableau de bord quand la chaîne est ouverte), et une échelle qui laisse la route libre sur un écran court (la ligne à 58 % de la
   hauteur, où roule le toit au sol). La scène 3D est retrouvée par ses offsets (sans transformation) : le quad WebGL s'y recalera. */
function engBigPlace(b){
  const ca=b.querySelector('.ebCarte'),sc=b.querySelector('.ebScene');if(!ca||!sc)return;
  const hC=ca.offsetHeight||104,wC=ca.offsetWidth||150;
  engBig.hC=hC;engBig.wC=wC;engBig.el=b;engBig.sx=null;
  /* (v5) L'ÉCHELLE SUIT LA CAISSE : le moteur fait ~45 % de la largeur APPARENTE de la voiture (sa boîte projetée), au sol comme en vol,
     borné entre 70 % et 115 % de la carte. Le texte ne descend jamais sous 8 px (--ebS ≥ .7). MESURÉ au banc : le moteur visible fait
     ~0,82 × la largeur de la scène et ~1 × sa hauteur (le quad déborde de ×1,6, le cadrage garde de l'air pour la flamme). */
  const cw=engCaisseL(),vis=(sc.offsetWidth||92)*.82;
  const s=THREE.MathUtils.clamp(cw*.26/vis,.7,.86); /* (2026-10-15, Sacha : « l'animation de palier moteur pourrait être un peu plus petite ») ~26 % de la caisse, plafond .86 (1,05 avant) — le plancher .7 garde le texte lisible */ // (v5.1) ~33 % de la caisse (40 % avant) : la scène a rapetissé, le texte garde son corps
  b.style.setProperty('--ebS',s.toFixed(3));b.classList.toggle('mini',s<.8);
  const rx=sc.offsetLeft+sc.offsetWidth/2-wC/2,ry=sc.offsetTop+sc.offsetHeight/2-hC/2;
  engBig.pw=sc.offsetWidth*s;engBig.ph=sc.offsetHeight*s;engBig.s=s;engBig.rx=rx;engBig.ry=ry;
}
function engCaisseL(){ // la largeur APPARENTE de la caisse (px) : sa boîte englobante projetée — lue une fois, à l'apparition de la carte
  try{carGroup.updateMatrixWorld(true);ENG_B3.setFromObject(carBody||carGroup);let a=1e9,b=-1e9;
    for(let i=0;i<8;i++){ENG_V9.set(i&1?ENG_B3.max.x:ENG_B3.min.x,i&2?ENG_B3.max.y:ENG_B3.min.y,i&4?ENG_B3.max.z:ENG_B3.min.z).project(camera);a=Math.min(a,ENG_V9.x);b=Math.max(b,ENG_V9.x);}
    const l=(Math.min(1,b)-Math.max(-1,a))*.5*(VP.w||1);return isFinite(l)&&l>0?l:160;}catch(e){return 160;}}
const ENG_B3=new THREE.Box3();
function engNeon(c){ // la couleur du moteur, poussée au néon (les gris d'acier deviennent CYAN, le reste gagne sa saturation)
  const C=ENG_NE.setHex(c),h={};C.getHSL(h);if(h.s<.3||h.l>.9)return '#5ee6ff';
  C.setHSL(h.h,Math.max(.88,h.s),Math.min(.68,Math.max(.58,h.l)));return '#'+C.getHexString();}
const ENG_NE=new THREE.Color();
function engPlonge(){ // LE MOTEUR ENTRE DANS LA CAISSE : les textes s'effacent, le moteur plonge vers le toit, rétrécit et CLAQUE
  if(!engBig.on||engBig.plonge)return;
  engBig.plonge=performance.now();clearTimeout(engBig._p);clearTimeout(engBig._t);clearTimeout(engBig._z);
  if(engSwapT<=0&&TCTL.on){clearTimeout(engBig._a);engBig._a=setTimeout(function(){if(!gameOver&&engSwapT<=0)engSwapArme();},Math.max(0,ENG_PLONGE-Math.round(T_SWAP*.38*1000)));} // plongée avancée : le clank la suit
  const b=avE('engBig');if(b)b.classList.add('plonge');
  document.body.classList.remove('ebOn');document.body.classList.add('ebPlonge'); // le couloir est LIBRE : la voix suivante parle pendant la plongée
  engBig._z=setTimeout(function(){ // l'impact sur le toit : une gerbe de pixels au point de contact, un tic sous le pouce
    try{pixBurst({getBoundingClientRect:function(){return {left:engBig.hx||ENG_Q.x,top:engBig.hy||ENG_Q.y,width:0,height:0};}},14);}catch(e){}hap(8); // au CAPOT
    try{engImpact();}catch(e){} // (v4) …et le moteur rugit
    engBig._t=setTimeout(engBigFin,150);},REDUCED_MOTION?0:ENG_PLONGE);
}
function engBigFin(){const b=avE('engBig');if(b)b.classList.remove('on','plonge');engBig.on=false;engBig.plonge=0;ENG_Q.op=0;engCarteMat.userData.uClip.value=-1;engRim.intensity=0;
  document.body.classList.remove('ebOn','ebPlonge');}
function engBigCoupe(){clearTimeout(engBig._p);clearTimeout(engBig._t);clearTimeout(engBig._z);clearTimeout(engBig._f);clearTimeout(engBig._a);if(engBig.on)engBigFin();}
function engRuban(ru){ // (H2) le RECORD tombe pendant la carte moteur : pas un 2e couloir — un ruban d'or À LA PLACE du titre
  const b=avE('engBig'),s=b&&b.querySelector('.ebCarte');if(!s||s.querySelector('.ebRuban'))return;
  const r=document.createElement('div');r.className='ebRuban';
  r.innerHTML='<b>'+sansAcc(TR('RECORD BATTU !'))+'</b><small>'+String(ru||'').replace(/[<>&]/g,'')+'</small>';
  s.appendChild(r);b.classList.add('ruban');try{pixBurst(r,26);}catch(e){} // (en absolu : la carte ne change pas de taille, le moteur recollé reste calé)
}
function engBigFile(E,tier){ // deux paliers en file : on ne garde que le dernier (la carte dit où l'on EST, pas où l'on est passé)
  let ru=null;for(let i=HAUT.q.length-1;i>=0;i--)if(HAUT.q[i].k==='eng'){ru=ru||HAUT.q[i].ru;HAUT.q.splice(i,1);} // un ruban de record déjà promis la suit
  hautPasse(function(it){engBig(E,tier,it.ru);},ENG_COULOIR+60,'eng',ru?3:2,{ru:ru});}
function engPop9(E,tier){
  if(TCTL.on){ // TÉLÉPHONE : la grande carte — sauf pendant l'auto-école, où le nom jaillit au-dessus de la caisse (la consigne garde le haut)
    if(TUTO.on){popTexte(E.n,'#'+(E.col||0xffd75e).toString(16).padStart(6,'0'));return;}
    engBigFile(E,tier);return;} // TÉLÉPHONE : la grande carte (le badge de coin reste pour l'ordinateur)
  if(!epEl)return;
  epNumEl.innerHTML='<i>'+TR('PALIER')+'</i>'+(tier+1);
  epNomEl.textContent=TR(E.n);
  epEl.classList.remove('on');
  void epEl.offsetWidth;                 // ⚠ le reflow : sans lui, pas de rejeu
  epEl.classList.add('on');
  clearTimeout(engPop9._t);
  engPop9._t=setTimeout(function(){epEl.classList.remove('on');},T_SWAP*1000+120);
}
let engTier=0,coinsGot=0; // ÉCARTS ÉLARGIS (2026-08-02) : ×1 → ×4,2, chaque palier doit S'ENTENDRE et SE SENTIR // palier courant + PIÈCES ramassées (la monnaie du moteur)
function engineFor(nc){let t=0;for(let i=0;i<ENGINE_TIERS.length;i++)if(nc>=ENGINE_TIERS[i].coins)t=i;return t;}
// LA MONNAIE DU MOTEUR : ramasser une pièce en donne 1 — et RÉUSSIR UNE FIGURE en donne une poignée.
// Tout passe par ici, donc le passage de palier s'annonce toujours de la même façon.
let poseSndT=0; // (2026-09-26) l'heure de la dernière pose sonore — la scène du moteur ne s'y superpose plus
function addCoins(n){
  if(n<=0)return;
  coinsGot+=n;
  const nt=engineFor(coinsGot);
  if(nt>engTier){
    engTier=nt;const E=ENGINE_TIERS[nt];
    // record de palier À VIE : mis à jour TOUT DE SUITE (pas à la fin du run) pour que les caisses
    // dont la condition est « atteindre tel moteur » se débloquent à l'instant où on y arrive
    if(SAVE.d.ex&&nt>SAVE.d.ex.eng){SAVE.d.ex.eng=nt;SAVE.mark();}
    // ⚠ PLUS DE BANDEAU `showMsg` ICI (2026-08-05). Le badge de palier dit déjà le nom, et sur
    // la vignette — c'est-à-dire sur l'objet qui vient de changer. Les deux ensemble faisaient
    // deux récompenses concurrentes pour un seul événement, et l'œil ne savait plus où aller.
    trickMsg('⚙ '+TR(E.n)+' — '+TR('POUSSÉE ×')+decFr(E.push,2),3);
    // la scène sonore (on dévisse, ça se pose, ça démarre, ça sonne) + la SCÈNE (onde + spirale + flash + vignette qui s'emballe) :
    // sur téléphone c'est la CARTE qui l'arme, calée sur l'entrée du moteur dans le capot (voir engSwapArme) ; ailleurs, tout de suite
    if(!(TCTL.on&&!TUTO.on))engSwapArme();
    engPop9(E,nt);                        // et le badge qui claque sur la vignette
  }
}
/* <<<MOTEURS>>> ---------------------------------------------------------------------------
   LE CONSTRUCTEUR DE MOTEURS — paramétrique, une fiche VISUELLE par palier.

   ⚠ POURQUOI CETTE RÉÉCRITURE (2026-08-03). L'ancien `mkEngine` empilait des seuils (`i>=5`
   turbo, `i>=20` tuyère…) : entre deux seuils, RIEN ne changeait. Mesuré sur les 30 paliers :
   **13 paliers sur 29 étaient visuellement identiques au précédent**, avec des séries de 3
   (21-23) et de 4 (24-27) moteurs strictement interchangeables. Autrement dit on payait
   quatre paliers pour voir la même pièce — de quoi lasser n'importe qui.
   LA RÈGLE MAINTENANT : chaque palier DÉCLARE sa silhouette dans `ENG_LOOK`, et deux paliers
   voisins doivent différer sur au moins un poste. C'est vérifiable par script (voir le test
   de non-répétition en fin de bloc), donc ça ne peut plus se dégrader en silence.
   ---------------------------------------------------------------------------------------- */
// Chaque fiche : a=architecture · c=cylindres · t=turbos · f=ailettes · x=pièces en plus.
// Architectures : in=en ligne · v=en V · fl=à plat · w=en W · h=en H · ro=rotatif · tu=turbine
//                 pl=plasma · ra=statoréacteur · pu=pulsoréacteur · re=réacteur · ex=exotique
// ⚠ 'pl' EST NÉ D'UNE MESURE : la TURBINE À PLASMA partageait le corps 'tu' de la TURBINE À GAZ
// et ne s'en distinguait que par deux cellules — 99 % de silhouette commune sur la planche
// contact, le pire doublon du jeu. Un palier qui se paie doit se VOIR.
const ENG_LOOK=[
 {a:'in',c:2,t:0,f:0,x:['courroie','pot']},                 //  1 MOTEUR ROUILLÉ
 {a:'in',c:2,t:0,f:6,x:['potMoto','kick']},                 //  2 BICYLINDRE      → ailettes de moto
 {a:'in',c:3,t:0,f:0,x:['collecteur']},                     //  3 3 CYLINDRES
 {a:'in',c:4,t:0,f:0,x:['collecteur','filtre']},            //  4 4 EN LIGNE
 {a:'in',c:4,t:0,f:0,x:['collecteur','doubleArbre']},       //  5 4 SOUPAPES      → 2 arbres à cames
 {a:'in',c:4,t:1,f:0,x:['collecteur','wastegate','plenum']},//  6 4 EN LIGNE TURBO
 {a:'in',c:5,t:1,f:0,x:['collecteur','plenum']},            //  7 5 CYLINDRES
 {a:'v', c:6,t:0,f:0,x:['collecteur','filtre']},            //  8 V6              → passage en V
 {a:'v', c:6,t:2,f:0,x:['collecteur']},                     //  9 V6 BITURBO      → 2 turbos DANS le V
 {a:'fl',c:4,t:0,f:4,x:['collecteur','ventilo']},           // 10 BOXER À PLAT
 {a:'v', c:8,t:0,f:0,x:['collecteur','carbu']},             // 11 V8 ATMO         → filtre à air rond
 {a:'v', c:8,t:0,f:0,x:['collecteur','compresseur']},       // 12 V8 COMPRESSÉ    → Roots qui dépasse
 {a:'v', c:10,t:0,f:0,x:['collecteur','trompettes']},       // 13 V10             → cornets F1
 {a:'v', c:12,t:0,f:0,x:['collecteur','trompettes']},       // 14 V12
 {a:'w', c:12,t:0,f:0,x:['collecteur','plenum']},           // 15 W12             → 4 bancs serrés
 {a:'v', c:16,t:0,f:0,x:['collecteur','trompettes']},       // 16 V16             → le plus long
 {a:'h', c:16,t:0,f:0,x:['collecteur']},                    // 17 H16 F1          → deux étages
 {a:'v', c:8,t:4,f:0,x:['collecteur']},                     // 18 QUADRITURBO     → 4 escargots
 {a:'ro',c:3,t:1,f:2,x:['pot']},                            // 19 ROTATIF TRIPLE  → des rotors
 {a:'tu',c:0,t:0,f:0,x:['axial','tuyere']},                 // 20 TURBINE À GAZ
 {a:'pl',c:0,t:0,f:0,x:['anneauxM','cellules','tuyere']},   // 21 TURBINE À PLASMA→ anneaux magnétiques
 {a:'ra',c:0,t:0,f:0,x:['coneEntree','tuyere']},            // 22 STATORÉACTEUR   → long, spike d'entrée
 {a:'pu',c:0,t:0,f:0,x:['valves','tuyere','anneaux2']},     // 23 PULSORÉACTEUR   → grosse tête, tuyau fin
 {a:'re',c:0,t:0,f:0,x:['barres','dome','ailettesE']},      // 24 RÉACTEUR NUCL.
 {a:'re',c:0,t:0,f:0,x:['tore','bobinesD']},                // 25 CŒUR À FUSION   → tokamak
 {a:'re',c:0,t:0,f:0,x:['anneaux3','confinement']},         // 26 ANTIMATIÈRE
 {a:'ex',c:0,t:0,f:0,x:['nacelles']},                       // 27 MOTEUR À DIST.
 {a:'ex',c:0,t:0,f:0,x:['couronne','tuyere']},              // 28 COMÈTE
 {a:'ex',c:0,t:0,f:0,x:['couronne','ondes']},               // 29 SUPERNOVA
 {a:'ex',c:0,t:0,f:0,x:['spherenoire','disque','cage']}     // 30 TROU NOIR
];
