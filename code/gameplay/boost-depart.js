/* LE TING (2026-10-03) : l'arpège change d'instrument — une petite cloche de verre / célesta (sinus + FM au rapport 3,5 qui s'éteint en
   ~60 ms, scintillement ×4 au contact, déclin .35 s), sur le bus clair de l'étincelle (350 Hz – 7 kHz, un peu de salle). Aucun grave. */
function instruTing(f,t,pan,vel){
  const bus=instruBus();if(!bus||vel<.03)return;
  if(!INSTRU.essai){t+=(Math.random()-.5)*.006;vel*=.92+Math.random()*.16;}t=Math.max(t,AC.currentTime);
  INSTRU.fins=INSTRU.fins.filter(function(x){return x>t;});if(INSTRU.fins.length>=12)return;
  if(INSTRU.essai||!INSTRU.etin){INSTRU.vu.push(Math.round(f));if(INSTRU.vu.length>200)INSTRU.vu.shift();return;}
  INSTRU.fins.push(t+.25);
  const c=AC.createOscillator(),m=AC.createOscillator(),mg=AC.createGain(),g=AC.createGain(),sc=AC.createOscillator(),sg=AC.createGain(),p=AC.createStereoPanner?AC.createStereoPanner():null;
  c.frequency.value=f;m.frequency.value=f*3.5;mg.gain.setValueAtTime(f*1.1,t);mg.gain.setTargetAtTime(0,t,.06);m.connect(mg);mg.connect(c.frequency);
  sc.frequency.value=f*4;sg.gain.setValueAtTime(0,t);sg.gain.linearRampToValueAtTime(.3,t+.002);sg.gain.setTargetAtTime(0,t+.004,.035);sc.connect(sg);sg.connect(g);
  const pk=.062*vel;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+.003);g.gain.setTargetAtTime(0,t+.008,.35); // (2026-10-04) −1 dB, et il se pose ensuite (voir niv9)
  c.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(INSTRU.etin);}else g.connect(INSTRU.etin);
  [c,m,sc].forEach(function(o){o.start(t);o.stop(t+1.8);});INSTRU.vu.push(Math.round(f));if(INSTRU.vu.length>200)INSTRU.vu.shift();
}
function instruMelodie(k,tons){ // la note de mélodie (MIDI) de la croche k, ou -1 — seulement des notes qui sonnent dans le morceau
  const mes=k>>4,cr=(k>>1)&7,ry=INSTRU_RYTHMES[(mes*5+(mes>>2))%INSTRU_RYTHMES.length];
  if(!ry[cr]&&!INSTRU.acc)return -1;
  const prev=INSTRU.mel,cible=[67,70,74,69][mes&3]+((mes>>2)&1?2:0),dispo=instruDans(tons,62,79);if(!dispo.length)return -1;
  let n;
  if(cr%2===0||INSTRU.acc){ // temps fort : la note la plus proche du chemin vers la cible ; un accent (spam) BOUGE toujours
    let bd=1e9;n=dispo[0];for(const v of dispo){if(INSTRU.acc&&v===prev&&dispo.length>1)continue;const d=Math.abs(v-prev)+.5*Math.abs(v-cible);if(d<bd){bd=d;n=v;}}
  }else{ // entre deux : la note voisine vers la cible (parfois un pas de côté — la phrase respire)
    let bi=0,bd=1e9;for(let i=0;i<dispo.length;i++){const d=Math.abs(dispo[i]-prev);if(d<bd){bd=d;bi=i;}}
    const dir=cible>prev?1:cible<prev?-1:((k*7)%3)-1;
    bi=Math.max(0,Math.min(dispo.length-1,bi+(((k*13+mes)%5)===0?-dir:dir)));n=dispo[bi];
  }
  INSTRU.mel=n;return n;
}
/* (2026-10-07, audit GRAPHISME : « des ting ressortent pendant le 3-2-1 après une pause ») LA PAUSE COUPE LA PHRASE. Avant, la pause la
   « lâchait » comme un doigt levé (4 à 7 notes de queue) : mais le contexte audio s'endort 70 ms plus tard, l'horloge se fige avec les notes
   déjà posées, l'écho et la salle pleins — et tout repartait au 3-2-1. Désormais : file vidée, minuterie arrêtée, et la PORTE de l'instrument
   (`INSTRU.sortie`) se ferme en même temps que la sortie du jeu ; elle ne se rouvre qu'au prochain appui de nitro (instruOn), quand les
   restes figés ont eu le temps de s'éteindre derrière elle. */
function instruCoupe(d){
  INSTRU.queue=0;INSTRU.tient=false;clearTimeout(INSTRU.att);if(INSTRU.iv){clearInterval(INSTRU.iv);INSTRU.iv=0;}
  try{if(AC&&INSTRU.sortie){const p=INSTRU.sortie.gain,T=AC.currentTime+(d||0);p.cancelScheduledValues(T);p.setTargetAtTime(0,T,.012);INSTRU.ferme=1;}}catch(e){}}
function instruPlanifie(){ // regard d'avance de 120 ms : les notes tombent pile, même si une image tousse
  if(!AC){clearInterval(INSTRU.iv);INSTRU.iv=0;return;}
  if(paused&&!INSTRU.essai){instruCoupe(0);loop._iW=false;return;} /* (2026-10-07) en pause : la phrase est coupée, pas laissée en suspens (voir instruCoupe) — (audit) et le doigt encore posé la relance à la reprise (loop._iW) */
  if(INSTRU.tient&&(gameOver||paused||mode==='boom'||(!INSTRU.essai&&!instruMusiqueOk()))){instruOff();loop._iW=false;} // (la musique change de map : la phrase se termine)      // la partie s'arrête : la phrase se termine
  if(!INSTRU.essai){if(INSTRU.H!==instruH())instruTempo();else instruHorloge();}        // le morceau a changé ? on relit sa fiche ; sinon on se recale
  const fin=INSTRU.essai?1e9:AC.currentTime+.12;
  while(INSTRU.tNote<fin){
    if(!INSTRU.tient){if(INSTRU.queue<=0){clearInterval(INSTRU.iv);INSTRU.iv=0;return;}INSTRU.queue--;INSTRU.vel*=.84;} // lâché : la phrase s'éteint en finissant le temps
    if(INSTRU.essai&&INSTRU.n>=INSTRU.essaiN)return;
    const k=INSTRU.k,mes=k>>4;
    if(INSTRU.tient)INSTRU.monte=(INSTRU.monte||0)+1;                                   // compte les notes depuis l'appui
    /* (2026-10-04, Léo : « le son du nitro qui englobe par-dessus la musique : cool au début, ça fait un petit effet, mais là c'est trop fort —
       régule ») : la phrase ENTRE (fondu sur 6 notes), garde son effet ~1 mesure, puis SE POSE à 55 % sous la musique (en 2 mesures). */
    const mo9=INSTRU.monte==null?99:INSTRU.monte,niv9=mo9<6?.35+.65*mo9/6:(mo9<16?1:Math.max(.55,1-.45*(mo9-16)/32));
    const t=Math.max(INSTRU.tNote,AC.currentTime),temps=k%4===0,V=INSTRU.vel*((mes&3)>=2?.85:1)*niv9; // mesures 3-4 un peu plus bas
    const tons=instruTons(t+.01);                                                       // l'accord du MORCEAU, maintenant
    const fen=instruDans(tons,62,86),mot=INSTRU_MOTIFS[((k>>3)*3+(mes>>2))%INSTRU_MOTIFS.length];
    let a9=fen.length?fen[mot[k%8]%Math.min(5,fen.length)]:-1;                          // l'arpège : les 5 premières notes de l'accord au-dessus de sol3
    if(a9>=0&&(mes&3)===3&&a9+12<=88)a9+=12;const arpK=(mes&3)===3?1.45:1;               // 4e mesure : il monte d'une octave (Léo : « plus aigu »)
    if(a9>=0&&BTEST!=='melodie')instruTing(instruHz(a9),t,k%2?.35:-.35,V*arpK*(temps?1:.8));                 // l'arpège : le TING (Léo : « plus en mode ting, l'instrument n'est peut-être pas le bon »)
    if(INSTRU.intro>0&&k%2===0&&BTEST!=='arpege'){INSTRU.intro--;INSTRU.acc=1;const m9=instruMelodie(k,tons);INSTRU.acc=0; // (2026-10-03, Léo : « quelques notes un peu MÉLODIQUES dès qu'on appuie, sans déranger la musique ») : l'appel — 3 notes qui chantent, en ting
      if(m9>=0)instruTing(instruHz(m9),t,0,.8);}
    
    // (2026-10-03, Léo : « l'arpège crée une résonance grave à la fin, c'est dérangeant ») : plus de basse — le morceau a la sienne
    INSTRU.der=INSTRU.tNote;INSTRU.k++;INSTRU.n++;
    INSTRU.tNote=INSTRU.off!=null&&!INSTRU.essai?instruGrille(INSTRU.tNote+INSTRU.pas*.5):INSTRU.tNote+INSTRU.pas; // la note suivante, SUR la grille du morceau
  }
}
/* LES VERSIONS D'ÉCOUTE (2026-10-03, Léo : « ça ne doit pas passer par-dessus la musique, ça accompagne ; il y a une partie qui gêne —
   trouvons-la ») : `?boost=` dans l'adresse coupe UNE couche du boost, pour l'isoler à l'oreille :
   sans (pas de phrase) · arpege (l'arpège seul) · melodie (la mélodie seule) · feu0 (la flamme du nitro muette : grondement, pops,
   turbo). */
const BTEST=(function(){try{return new URLSearchParams(location.search).get('boost')||'';}catch(e){return '';}})();
function instruMusiqueOk(){ // la phrase du boost n'existe que sur la musique pour laquelle elle est dessinée : le CIEL (niveaux 1 à 5, et le morceau entier)
  /* (2026-10-08, Léo : « les boosts n'ont plus leur musique ») depuis 822cdf9, PLAY lance la partie SANS FIN, qui joue le CIEL ENTIER
     (`ciel-complet.m4a`, MUSIC_CIEL_TOUT) : le garde-fou ne connaissait que ciel-n1…n5, la phrase se taisait à chaque boost. Le morceau
     entier a sa fiche dans harmonie.js (tempo, notes temps par temps) : la phrase y reste accordée comme sur les niveaux. */
  return !!(musicEl&&musicEl.src&&/\/ciel-(n[1-5]|complet)\.m4a/.test(musicEl.src));
}
function instruOn(){
  if(!INSTRU.on||!AC||!SND.sfx||(AC.state!=='running'&&!INSTRU.essai)||paused)return; // (2026-10-03, Léo) un VRAI appui pendant le boost de départ lance la phrase (le départ seul, lui, ne la lance jamais : elle lit le doigt)
  if(BTEST==='sans')return;
  if(INSTRU.essai)return instruDemarre();
  if(!instruMusiqueOk())return; // (2026-10-04, Léo : « les effets du boost musical seront dessinés pour CHAQUE map et sa musique : seulement avec la musique des 5 premiers niveaux du CIEL ») 
  INSTRU.doigt=true;clearTimeout(INSTRU.att);
  instruDemarre(); // (2026-10-03, Léo : « l'activer dès qu'on appuie sur ESPACE, quand ça commence à booster — et en maintenant sur iPhone ») : plus d'attente de 0,22 s ; l'entrée en fondu suffit
}
function instruDemarre(){
  if(!AC||paused)return;
  const t=performance.now(),neuve=t-INSTRU.tDer>2500&&!INSTRU.iv;INSTRU.tDer=t;
  instruTempo();instruBus();instruEcho();if(INSTRU.ferme&&INSTRU.sortie){try{const p=INSTRU.sortie.gain;p.cancelScheduledValues(AC.currentTime);p.setTargetAtTime(1,AC.currentTime,.01);}catch(e){}INSTRU.ferme=0;} /* (2026-10-07) la porte se rouvre à l'appui */INSTRU.tient=true;INSTRU.vel=1;INSTRU.acc=0;INSTRU.n=0;INSTRU.intro=3;if(neuve||!INSTRU.iv)INSTRU.monte=0;
  if(neuve){INSTRU.k=0;INSTRU.mel=67;INSTRU.tNote=instruGrille(AC.currentTime+.005);}  // une phrase NEUVE (silence de 2,5 s)
  else if(!INSTRU.iv){INSTRU.tNote=instruGrille(Math.max(AC.currentTime+.005,INSTRU.der+.09));} // elle REPREND où elle en était
  if(INSTRU.tNote-AC.currentTime>.5)INSTRU.tNote=instruGrille(AC.currentTime+.005);   // garde-fou (horloges qui ont dérivé)
  if(INSTRU.essai){INSTRU.tient=!!INSTRU.essaiTenu;if(!INSTRU.tient)INSTRU.queue=3;instruPlanifie();INSTRU.tient=false;return;}
  if(!INSTRU.iv)INSTRU.iv=setInterval(instruPlanifie,25);instruPlanifie();
}
function instruOff(){INSTRU.doigt=false;clearTimeout(INSTRU.att);if(!INSTRU.tient)return;INSTRU.tient=false;INSTRU.tDer=performance.now();INSTRU.queue=(4-INSTRU.k%4)%4+4;} // lâché : on finit le temps + un temps, en s'éteignant
function nfxTick(dt){ // chaque image (après hsF/hsU) : l'onde, la teinte des bords, les enveloppes
  const vit=running&&!gameOver&&mode!=='boom';
  NFX.ign=Math.max(0,NFX.ign-dt/.55);NFX.off=Math.max(0,NFX.off-dt/1.2);
  NFX.len+=((vit&&nitroOn?1:0)-NFX.len)*Math.min(1,dt*(nitroOn?9:5));
  if(NFX.ringT<.45&&vit){NFX.ringT+=dt;const u=Math.min(1,NFX.ringT/.42),e=1-(1-u)*(1-u)*(1-u),R=NFX.ring;
    R.visible=u<1;potMonde(CAR_POT_C,R.position).addScaledVector(hsF,-(.15+.8*e)); // l'onde RECULE en s'ouvrant : elle part vers l'arrière
    R.quaternion.copy(carGroup.quaternion); // son plan : perpendiculaire à la caisse (au sol comme en vrille)
    const sc=(.35+1.55*e)*(.65+.35*NFX.ringK);R.scale.set(sc,sc,1); // ≤ 1,9 m : un halo de choc AUTOUR de la poupe — plus grand, il passait devant l'objectif en croissant géant
    R.material.opacity=(1-u)*(1-u)*1.7*NFX.ringK;R.material.color.copy(NFX.col);}
  else if(NFX.ring.visible)NFX.ring.visible=false;
  // LES BORDS DE L'IMAGE prennent la couleur de la poussée — orange feu, bleu réserve, or du pad turbo (plus discret)
  const eT=vit?(nitroOn?((nitroBlue?.26:.28)):(boost>0?(.12):0)):0; // (neon-residuel) bords ≤ .3 : de la lueur chaude, plus un voile de couleur
  NFX.edge+=(eT-NFX.edge)*Math.min(1,dt*(eT>NFX.edge?8:2.6));
  NFX.cT.setHex(nitroBlue?NFX_C.b:(nitroOn?(pwrNitroT>0?(NFX_C.i):NFX_C.n):NFX_C.p));
  if(NYAN.on&&!FX_EFF&&nitroOn&&!nitroBlue&&!(pwrNitroT>0))NFX.cT.setHSL((performance.now()*.00045)%1,1,.58); // (2026-10-07) LE BOOST DU CHAT : l'onde et les bords de l'image tournent dans l'arc-en-ciel
  NFX.col.lerp(NFX.cT,Math.min(1,dt*12));
  if(acesPass){const U=acesPass.uniforms,b9=NFX.dbgB==null?1:NFX.dbgB;
    U.uNit.value.set(NFX.col.r,NFX.col.g,NFX.col.b,NFX.edge*(REDUCED_MOTION?.5:1)*b9);
    U.uNitF.value=vit?NFX.ign*NFX.ign*NFX.ignK*(REDUCED_MOTION?.25:(.4))*b9:0;} // le COUP : un éclair de couleur sur tout le cadre, parti en ~0,3 s
}
// LE BOOST DE DÉPART (2026-09-05) : 3 s de nitro OFFERTE au lancement d'une partie (voir
// `resetGame`) — ne consomme PAS `nitroR` (même garde que `pwrNitroT`, le pouvoir « nitro infinie »)
// et décroît en douceur : si le joueur ne touche à rien, la poussée s'arrête à 0 et la traînée
// normale (frottement) reprend la main — le boost est un CADEAU ponctuel, pas un état permanent.
let startBoostT=0;
// `fireLaunchBoost()` — LE GESTE DU DÉPART, un seul écrivain (2026-09-05) : armé depuis `resetGame`
// (rejeu direct) ET depuis la fin du LÂCHER du garage (`GAR.go`, prembattre le tout premier départ)
// pour que le geste soit identique dans les deux cas, sans dupliquer le minuteur du logo.
function fireLaunchBoost(){
  // (2026-09-24) la nitro OFFERTE avait été désarmée à la fusion (« la caisse qui s'arrache toute seule au gaz auto »)…
  // (2026-09-29) …elle REVIENT, comme sur la branche de Léo : c'est la suite du RIDEAU DE FLAMMES du garage.
  startBoostT=(typeof TUTO!=='undefined'&&TUTO.on)?0:3;paintMoney(); // (2026-09-29, repris de la branche de Léo, 28/09 : « le boost dès le début de la partie a disparu ») 3 s de nitro OFFERTE — on sort des flammes du garage EN flammes · (2026-10-08, Léo) plus de la nitro : un ÉLAN, la même poussée sans flamme, ni son, ni traînée (voir la conduite) ; pas à l'auto-école (sa leçon, c'est d'appuyer soi-même)
  // LE LOGO + SON HALO (agrandis 2026-09-05, « plus impressionnant ») : les DEUX partagent la MÊME
  // classe `.on` et le MÊME minuteur — un flash sans le mot, ou le mot sans le flash, ferait deux
  // demi-effets au lieu d'un seul coup net.
  const ll9=$('launchLogo'),lg9=$('launchGlow');
  if(ll9){ll9.classList.remove('on');void ll9.offsetWidth;ll9.classList.add('on');try{sfx('depart.logo',{vol:-4});}catch(e){}} /* (console de son) le logo CLAQUE : sub + accord d'or — (2026-10-16) −4 dB : il remettait un coup de sub juste après le piqué */
  if(lg9){lg9.classList.remove('on');void lg9.offsetWidth;lg9.classList.add('on');}
  clearTimeout(fireLaunchBoost._t);fireLaunchBoost._t=setTimeout(function(){
    if(ll9)ll9.classList.remove('on');if(lg9)lg9.classList.remove('on');
    if(!started||gameOver)return; /* (24/10, relecture) la course est déjà finie ou quittée (QUITTER, mort dans les 1,9 s) : la bannière « NIVEAU n » ne vient plus après coup sur l'écran de fin ou le garage */
    if(TUTO.on&&TUTO.attente&&started&&!gameOver){TUTO.attente=false;tutoAffiche();}else // l'auto-école prend la parole pile quand le logo s'efface
    lvlAnnonce(); // LE LOGO PASSE LE RELAIS : « NIVEAU 1 — … » arrive quand CASH CAR s'efface (au même endroit, jamais par-dessus)
  },1900);
}
let pwrNitroT=0,pwrAirT=0,pwrSpdT=0; // POUVOIRS : nitro infinie · airtime infini · speed up +60%
/* (2026-10-17, session « Physique et gameplay fluides ») LE ×2 DE VITESSE QUI SE PREND ET SE REND : l'avance au sol passait de ×1 à ×2 en UNE
   image au ramassage, et de ×2 à ×1 à l'expiration — un coup de frein de 50 % sans rien toucher. `pwrSpdK` (0 → 1) suit le pouvoir en
   exponentielle (τ 1/6 s : 95 % en 0,5 s) ; vitMult le lit. Durée du pouvoir inchangée. */
let pwrSpdK=0;
let pwrMagT=0,pwrAurT=0;  // (pouvoirs v2) aimant · aura ×2 (le bouclier est retiré le 29/09) — voir PWR_DEFS
const MAG_R=50; // (2026-09-29, Sacha) le RAYON de l'aimant, en mètres, dans toutes les directions — voir « L'AIMANT v3 »
let gameOver=false,paused=false,running=false,started=false,best=0;
best=SAVE.d.best;
const fallPos=new THREE.Vector3(),fallVel=new THREE.Vector3();
const prevTv=new THREE.Vector3();let prevTvalid=false;
const $=id=>document.getElementById(id);
const elSpeed=$('speedVal'),elName=$('carName'),elLvl=$('carLevel'),elMoney=$('moneyTxt'),
      elCp=$('cpDist'),elFill=$('cpFill'),elMsg=$('msg'),elTurn=$('turnHint'),
      elRecord=$('record'),elNR=$('nitroR'),elNX=$('nitroX'),elNB=$('tNitro'),
      trickBox=$('trickBox'),chainHud=$('chainHud'),caseHud=$('caseHud'),airPie=$('airPie'),pieCtx=airPie.getContext('2d'),
      elStyleF=$('styleFill'),feverGlow=$('feverGlow'),flashEl=$('flash'),
      overlay=$('overlay'),ovSub=$('ovSub'),finalScore=$('finalScore'),goTxt=$('goTxt'),tagline=$('tagline'),bestChip=$('bestChip'),
      auraHudEl=$('auraHud'),auraValEl=$('auraVal'),auraBarEl=$('auraBarF'),
      auraSubEl=$('auraSub'),auraComboEl=$('auraCombo'),auraGlowEl=$('auraGlow');
const elLb=$('lbBox'),nameEntry=$('nameEntry'),nameInput=$('nameInput'),nameSave=$('nameSave');
const speedFx=$('speedFx'),cloudFxEl=$('cloudFx'),runStatsEl=$('runStats'),pwrChip=$('pwrChip');
if(IS_MOBILE&&pwrChip)document.body.appendChild(pwrChip); // (HUD v4) la colonne de droite du tableau de bord (hors de la jauge de nitro)
const slCv=$('slCv'),slCtx=slCv.getContext('2d');
// ⚠ DÉCLARÉ ICI, avec slCv : le dimensionnement juste en dessous s'en sert, et un `const`
// déclaré plus bas dans le fichier est en ZONE MORTE TEMPORELLE — on y accède, ça jette.
const juiceCv=$('juiceCv'),juiceCx=juiceCv?juiceCv.getContext('2d'):null;
slCv.width=innerWidth;slCv.height=innerHeight;if(juiceCv){juiceCv.width=innerWidth;juiceCv.height=innerHeight;}
/* FILÉS v2 (2026-09-26, passe graphique) : les traits étaient TIRÉS AU HASARD À CHAQUE IMAGE — 30 bâtons qui changeaient de place 60 fois
   par seconde, un grésillement plus qu'un mouvement. Désormais chaque filé VIT : il naît loin du centre, FILE vers le bord en ~0,3 s,
   s'allume et s'éteint en douceur (enveloppe sinus), puis renaît ailleurs. Plus FINS (0,5-1,3 px), plus longs, en COMÈTE (tête franche
   vers l'extérieur, queue qui s'étire vers le centre). Mémoire fixe (tableaux typés), un seul tirage par naissance, zéro allocation.
   Quand la vitesse retombe, les filés en vol finissent leur course au lieu de disparaître d'un coup. */
const SLN=44,SL={a:new Float32Array(SLN),r:new Float32Array(SLN),v:new Float32Array(SLN),t:new Float32Array(SLN),T:new Float32Array(SLN),
  w:new Float32Array(SLN),l:new Float32Array(SLN),al:new Float32Array(SLN),vivants:0};
/* LE VENT (2026-10-21, Léo : « les traits de vitesse font encore un peu enfantin, fais-moi un truc mieux, adapté à notre gameplay ») :
   les filés d'anime (44 bâtons qui jaillissent du CENTRE DE L'ÉCRAN) sont remplacés par des particules d'AIR posées dans le MONDE.
   Elles ne bougent pas : c'est la caméra qui les traverse, donc vraie perspective (fines au loin, elles s'étirent et accélèrent en
   passant), vraie parallaxe, et le point de fuite est la DIRECTION RÉELLE du vol (en l'air, il suit la trajectoire, pas le milieu de
   l'écran). Chaque trait va du point d'air à sa position d'il y a τ secondes : sa longueur dit la vitesse. Fins, comète lumineuse à tête
   franche ; couleur = état de la caisse (air froid · or au-delà de la croisière · feu nitro · bleu réserve · violet nitro infinie · rouge
   frénésie), choisie à la NAISSANCE du trait (la teinte change en ~0,5 s, sans à-coup). Le milieu de l'écran reste net (on vise) et un
   masque épargne la caisse. L'allumage de la nitro = une SURVITESSE (`VENT.pic`) au lieu de la gerbe radiale. Même canvas 2D, zéro
   programme GPU, zéro allocation. `?vent=ancien` ou `dbgVent(false)` = les anciens filés. */
const VENT_N=64,VENT={ancien:false,pic:0,wx:new Float32Array(VENT_N*3),pal:new Uint8Array(VENT_N),lg:new Float32Array(VENT_N),ep:new Float32Array(VENT_N),
  pxP:0,pyP:0,pzP:0,vx:0,vy:0,vz:0,init:false,vivants:0,sp:null};
try{if(new URLSearchParams(location.search).get('vent')==='ancien')VENT.ancien=true;}catch(e){}
window.dbgVent=function(on){if(on===undefined)return {ancien:VENT.ancien,vitesse:Math.hypot(VENT.vx,VENT.vy,VENT.vz),pic:VENT.pic};VENT.ancien=!on;if(on)VENT.init=false;return !VENT.ancien;};
function ventSprites(){ // 6 comètes cuites UNE fois : queue transparente → corps teinté → tête presque blanche → bord net ; profil doux en travers
  const mk=function(c,h){const cv=document.createElement('canvas');cv.width=256;cv.height=8;const x=cv.getContext('2d');
    const g=x.createLinearGradient(0,0,256,0),q='rgba('+c+',',t='rgba('+h+',';
    g.addColorStop(0,q+'0)');g.addColorStop(.5,q+'.28)');g.addColorStop(.84,q+'.8)');g.addColorStop(.94,t+'1)');g.addColorStop(.995,t+'.9)');g.addColorStop(1,t+'0)');
    x.fillStyle=g;x.fillRect(0,0,256,8);x.globalCompositeOperation='destination-in';
    const v=x.createLinearGradient(0,0,0,8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.38,'rgba(0,0,0,.85)');v.addColorStop(.5,'rgba(0,0,0,1)');v.addColorStop(.62,'rgba(0,0,0,.85)');v.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=v;x.fillRect(0,0,256,8);return cv;};
  return [mk('176,194,255','255,255,255'),mk('255,214,120','255,250,226'),mk('255,122,36','255,236,200'),mk('91,125,255','214,226,255'),mk('157,77,255','243,230,255'),mk('255,42,61','255,206,210')];
}
function ventPose(i,loin){ // (re)nait un trait : un point de l'écran (loin du centre) à une profondeur, posé dans le monde
  const tf=Math.tan(camera.fov*.0087266),as=camera.aspect,e=camera.matrixWorld.elements;
  const a=Math.random()*6.2832,rf=.36+.82*Math.pow(Math.random(),.8),d=loin?(34+Math.random()*42):(8+Math.random()*68);
  const nx=Math.cos(a)*rf,ny=Math.sin(a)*rf,xv=nx*d*tf*as,yv=ny*d*tf,zv=-d;
  VENT.wx[i*3]=e[0]*xv+e[4]*yv+e[8]*zv+e[12];VENT.wx[i*3+1]=e[1]*xv+e[5]*yv+e[9]*zv+e[13];VENT.wx[i*3+2]=e[2]*xv+e[6]*yv+e[10]*zv+e[14];
  VENT.lg[i]=.55+Math.random()*.9;VENT.ep[i]=.7+Math.random()*.8;
}
/* (2026-10-24, passe perf 2e tour) LE VENT SUR LES VIEUX TÉLÉPHONES : chaque trait est un drawImage tourné, en mélange additif, dans une toile 2D plein écran
   effacée à chaque image (mesuré : 3,3 % du processeur de la boucle au banc ×4, à grande vitesse nitro tenue). [ANCIEN, MOYEN, RÉCENT] : la moitié, 70 %, tous. */
PAL.B.ventK=[.5,.7,1];
function ventDessine(kmh,nitro,dt){
  const W=slCv.width,H=slCv.height;dt=Math.min(dt||.016,mobhChaud()?MOBH_R.ventCap:.05); /* (2026-10-25, A6) régime chaud : le dt cumulé de deux images ne doit pas être rogné à 50 ms */
  const vcL=vCroisiere();
  let k=Math.max(0,(kmh-vcL*.6)/vcL)+(nitro?.6:0);if(mode==='boom'||gameOver)k=0;
  VENT.pic=Math.max(0,VENT.pic-dt*2.6);
  slCtx.setTransform(1,0,0,1,0,0);
  // la vitesse de la CAMÉRA dans le monde (c'est elle qui traverse l'air), lissée ; une téléportation (portail, replacement) remet l'air à neuf
  camera.updateMatrixWorld();camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  const P=camera.position,jump=Math.hypot(P.x-VENT.pxP,P.y-VENT.pyP,P.z-VENT.pzP);
  if(!VENT.init||jump>160){VENT.init=true;for(let i=0;i<VENT_N;i++){ventPose(i,false);VENT.pal[i]=0;}VENT.vx=VENT.vy=VENT.vz=0;}
  else if(dt>0){const g=1-Math.exp(-dt*10);VENT.vx+=((P.x-VENT.pxP)/dt-VENT.vx)*g;VENT.vy+=((P.y-VENT.pyP)/dt-VENT.vy)*g;VENT.vz+=((P.z-VENT.pzP)/dt-VENT.vz)*g;}
  VENT.pxP=P.x;VENT.pyP=P.y;VENT.pzP=P.z;
  k=Math.min(1.35,k);const cible=Math.min(VENT_N,(k*46+(VENT.pic>0?VENT.pic*18:0))*PAL.b('ventK',1)*(mobhChaud()?MOBH_R.vent:1)); // (2026-10-24, passe perf) ventK : moins de traits sur les vieux téléphones — (2026-10-25, A6) régime chaud : ×0,7 de plus
  if(cible<=.05&&!VENT.vivants){if(drawSpeedLines._had){slCtx.clearRect(0,0,W,H);drawSpeedLines._had=false;slCv.style.visibility='hidden';}return;}
  slCtx.clearRect(0,0,W,H);if(!drawSpeedLines._had){drawSpeedLines._had=true;slCv.style.visibility='visible';}
  const spr=VENT.sp||(VENT.sp=ventSprites());
  const pal=nitro?(nitroBlue?3:(pwrNitroT>0?4:2)):(FLOW.lv===4?5:(k>.95?1:0));
  const m=camera.matrixWorldInverse.elements,tf=Math.tan(camera.fov*.0087266),as=W/H,foc=H*.5/tf;
  // la vitesse dans le repère de la caméra : de combien l'air a glissé il y a τ secondes
  const vvx=m[0]*VENT.vx+m[4]*VENT.vy+m[8]*VENT.vz,vvy=m[1]*VENT.vx+m[5]*VENT.vy+m[9]*VENT.vz,vvz=m[2]*VENT.vx+m[6]*VENT.vy+m[10]*VENT.vz;
  const tau=(.04+.05*Math.min(1,k))*(1+VENT.pic*1.4),capPx=Math.min(W,H)*.62;
  // la caisse à l'écran : rien ne passe SUR elle
  const cg=carGroup.position,cxw=m[0]*cg.x+m[4]*cg.y+m[8]*cg.z+m[12],cyw=m[1]*cg.x+m[5]*cg.y+m[9]*cg.z+m[13],czw=m[2]*cg.x+m[6]*cg.y+m[10]*cg.z+m[14];
  let carX=-9e3,carY=-9e3,carR=1;if(czw<-.5){carX=(.5+cxw/(-czw)/(tf*as)*.5)*W;carY=(.5-cyw/(-czw)/tf*.5)*H;carR=Math.max(40,foc*2.6/(-czw));}
  slCtx.globalCompositeOperation='lighter';let viv=0;
  for(let i=0;i<VENT_N;i++){
    const x=VENT.wx[i*3],y=VENT.wx[i*3+1],z=VENT.wx[i*3+2];
    const xv=m[0]*x+m[4]*y+m[8]*z+m[12],yv=m[1]*x+m[5]*y+m[9]*z+m[13],zv=m[2]*x+m[6]*y+m[10]*z+m[14];
    const d=-zv,inv=d>.01?1/d:0;let nxs=xv*inv/(tf*as),nys=yv*inv/tf;
    if(d<1.6||Math.abs(nxs)>2.1||Math.abs(nys)>2.1||d>96){ventPose(i,true);VENT.pal[i]=pal;continue;} // passé derrière, sorti du champ : il renaît loin devant, à la teinte du moment
    if(i>=cible)continue; // les traits en trop attendent (ils vivent quand même : l'air est là, on ne l'éclaire pas)
    viv++;
    const tx=xv+vvx*tau*VENT.lg[i],ty=yv+vvy*tau*VENT.lg[i],tz=zv+vvz*tau*VENT.lg[i];
    if(tz>-.4)continue;
    const hx=(.5+nxs*.5)*W,hy=(.5-nys*.5)*H,ti=1/(-tz),qx=(.5+tx*ti/(tf*as)*.5)*W,qy=(.5-ty*ti/tf*.5)*H;
    let dx=hx-qx,dy=hy-qy,L=Math.hypot(dx,dy);if(L<5)continue;
    if(L>capPx){const c=capPx/L;dx*=c;dy*=c;L=capPx;}
    const ddx=hx-carX,ddy=hy-carY,mk=Math.sqrt(ddx*ddx*.8+ddy*ddy)/carR;if(mk<1.25){ if(mk<.7)continue; }
    const fl=Math.min(1,(cible-i)),eloin=d>46?Math.max(0,(78-d)/32):1,epr=Math.min(1,(d-1.6)/5),
      cen=Math.min(1,Math.hypot(nxs,nys)*1.5-.35); // le milieu de l'écran reste net : on y vise
    let a=.5*fl*eloin*epr*Math.max(0,cen)*Math.min(1,k+.3);if(mk<1.25)a*=(mk-.7)/.55;if(a<.02)continue;
    const w=Math.max(.9,Math.min(3.2,.036*foc*VENT.ep[i]*inv))*2.4;
    slCtx.globalAlpha=Math.min(.95,a);const ang=Math.atan2(dy,dx),co=Math.cos(ang),si=Math.sin(ang);
    slCtx.setTransform(co,si,-si,co,qx,qy);slCtx.drawImage(spr[VENT.pal[i]],0,-w*.5,L,w);
  }
  VENT.vivants=viv;slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';
}
function drawSpeedLines(kmh,nitro,dt){ // speed lines façon anime : traits radiaux fuyant le centre — (2026-10-21) remplacées par LE VENT ci-dessus, sauf ?vent=ancien
  if(!VENT.ancien){if(mobhVentSaute(dt))return;ventDessine(kmh,nitro,mobhChaud()?(mobhVentDt()||dt):dt);return;} /* (2026-10-25, A6) régime chaud : une image sur deux, le calque garde l'image d'avant (rien n'est effacé), le dt s'accumule */
  const W=slCv.width,H=slCv.height;dt=dt||.016;
  const vcL=vCroisiere();
  let k=Math.max(0,(kmh-vcL*.6)/vcL)+(nitro?.6:0); // (2026-09-25) « un peu » en croisière, beaucoup plus au momentum, au boost, en nitro
  slCtx.setTransform(1,0,0,1,0,0);
  if(k<=.03&&!SL.vivants){if(drawSpeedLines._had){slCtx.clearRect(0,0,W,H);drawSpeedLines._had=false;slCv.style.visibility='hidden';}return;} // rien à tracer : on n'efface le plein écran qu'UNE fois (plus de clearRect/frame à basse vitesse)
  slCtx.clearRect(0,0,W,H);if(!drawSpeedLines._had){drawSpeedLines._had=true;slCv.style.visibility='visible';} // une écriture de style par TRANSITION, jamais par image
  k=Math.min(1.35,k);
  const cx=W/2,cy=H*.46,m9=Math.min(W,H),cible=Math.floor(k*30);
  // (2026-09-25) DEUX SPRITES CUITS UNE FOIS (blanc chaud / cyan nitro) : le ramasse-miettes du téléphone faisait des micro-saccades.
  // (v2) profil COMÈTE (queue longue, tête franche) et bords doux en travers : un trait fin reste net, un trait épais ne fait pas bâton.
  const spr=drawSpeedLines.spr||(drawSpeedLines.spr=(function(){const mk=function(r,g,b){const c=document.createElement('canvas');c.width=128;c.height=8;
    const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,128,0),q='rgba('+r+','+g+','+b+',';
    gr.addColorStop(0,q+'0)');gr.addColorStop(.55,q+'.55)');gr.addColorStop(.86,q+'1)');gr.addColorStop(1,q+'0)');
    x.fillStyle=gr;x.fillRect(0,2,128,4);x.globalAlpha=.35;x.fillRect(0,1,128,6);return c;};return {w:mk(255,248,236),c:mk(255,226,184),b:mk(176,190,212)};})());
  const im9=nitro?(nitroBlue?spr.b:spr.c):spr.w;          // NITRO : filés chauffés à la couleur de la poussée — (vague 3) feu / réserve bleue de la bible (ils étaient cyan néon)
  slCtx.globalCompositeOperation='lighter';
  let viv=0;
  for(let i=0;i<SLN;i++){
    if(SL.t[i]>=SL.T[i]){ // mort : il renaît si la vitesse en réclame
      if(viv>=cible)continue;
      SL.a[i]=Math.random()*6.2832;SL.r[i]=m9*(.28+Math.random()*.46);  // ils NAISSENT loin du centre → le milieu reste net
      SL.v[i]=m9*(1.1+Math.random()*1.3)*(.6+.4*k);SL.t[i]=0;SL.T[i]=.22+Math.random()*.2;
      SL.l[i]=(110+Math.random()*260)*(.5+.5*k);SL.w[i]=.5+Math.random()*.8*Math.min(1,k);SL.al[i]=.06+Math.random()*.14;
    }
    SL.t[i]+=dt;const u=SL.t[i]/SL.T[i];if(u>=1)continue;viv++;
    const ca=Math.cos(SL.a[i]),sa=Math.sin(SL.a[i])*.82,d9=Math.hypot(ca,sa),r=SL.r[i]+SL.v[i]*SL.t[i];
    slCtx.globalAlpha=SL.al[i]*Math.sin(u*3.1416)*Math.min(1,k+.25); // s'allume, file, s'éteint
    slCtx.setTransform(ca/d9,sa/d9,-sa/d9,ca/d9,cx+ca*r,cy+sa*r);slCtx.drawImage(im9,0,-SL.w[i]*1.5,SL.l[i]*d9,SL.w[i]*3);
  }
  SL.vivants=viv;
  slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';
}
/* (vague 3, NITRO) LA GERBE DE FILÉS DE L'ALLUMAGE : 18 traits qui JAILLISSENT près du centre et filent vers les bords en 0,3 s, dans
   le calque des filés (dessinés après eux, seulement quand il est actif — la nitro l'allume toujours). Leurs PROPRES emplacements et
   leur propre tirage (`nfxR`) : les filés de `drawSpeedLines` et le Math.random du jeu restent exactement ceux d'avant. */
const NFX_FN=18,NFX_FIL={a:new Float32Array(NFX_FN),r:new Float32Array(NFX_FN),v:new Float32Array(NFX_FN),t:new Float32Array(NFX_FN).fill(9),
  T:new Float32Array(NFX_FN).fill(1),l:new Float32Array(NFX_FN),w:new Float32Array(NFX_FN),arme:false};
function nfxFiles(dt){
  const S=NFX_FIL,spr=drawSpeedLines.spr;
  if(!VENT.ancien){if(S.arme){S.arme=false;VENT.pic=1;}return;} // LE VENT : l'allumage = une survitesse de l'air, plus une gerbe radiale
  if(S.arme){S.arme=false;const m9=Math.min(slCv.width,slCv.height),k=NFX.ignK;
    for(let i=0;i<NFX_FN;i++){S.a[i]=nfxR()*6.2832;S.r[i]=m9*(.12+nfxR()*.22);S.v[i]=m9*(2.2+nfxR()*1.6)*(.7+.3*k);
      S.t[i]=-nfxR()*.1;S.T[i]=.2+nfxR()*.16;S.l[i]=(180+nfxR()*260)*(.6+.4*k);S.w[i]=.8+nfxR()*1.1;}}
  if(!spr||!drawSpeedLines._had){for(let i=0;i<NFX_FN;i++)S.t[i]+=dt;return;} // calque éteint : rien à dessiner, mais la gerbe s'use quand même
  const cx=slCv.width/2,cy=slCv.height*.46,im9=nitroBlue?spr.b:spr.c;let on=false;
  for(let i=0;i<NFX_FN;i++){if(S.t[i]>=S.T[i])continue;S.t[i]+=dt;const u=S.t[i]/S.T[i];if(u<=0||u>=1)continue;if(!on){on=true;slCtx.globalCompositeOperation='lighter';}
    const ca=Math.cos(S.a[i]),sa=Math.sin(S.a[i])*.82,d9=Math.hypot(ca,sa),r=S.r[i]+S.v[i]*S.t[i];
    slCtx.globalAlpha=.55*Math.sin(u*3.1416);
    slCtx.setTransform(ca/d9,sa/d9,-sa/d9,ca/d9,cx+ca*r,cy+sa*r);slCtx.drawImage(im9,0,-S.w[i]*1.5,S.l[i]*d9,S.w[i]*3);}
  if(on){slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';}
}
let pendingScore=null;
let leaders=SAVE.d.leaders; // même tableau que la sauvegarde : les mutations coulent dedans
function saveLeaders(){SAVE.d.leaders=leaders;SAVE.flush();}
function lbEsc(x){return String(x).replace(/[<>&]/g,function(c){return c==='<'?'&lt;':c==='>'?'&gt;':'&amp;';});}
function lbQualifies(sc){return sc>0&&(leaders.length<10||sc>leaders[leaders.length-1].s);}
function renderLeaders(hl){
  var trophy=pxi('trophee')+' TOP 10';
  // ⚠ DEUX AFFICHAGES, UNE SEULE ÉCRITURE (2026-09-05) : `#lbBoxG` (garage, premier écran vu depuis
  // que la porte s'ouvre après le splash) montre le MÊME Top 10 que `#lbBox` (menu classique) — on ne
  // maintient pas un second calcul, juste un second réceptacle du même HTML.
  var elLbG=$('lbBoxG');
  var html;
  if(!leaders.length){html='<div class="lbTitle">'+trophy+'</div><div class="lbEmpty">'+TR('Aucun score — sois le premier !')+'</div>';}
  else{
    html='<div class="lbTitle">'+trophy+'</div>';
    for(var i=0;i<leaders.length;i++){var e=leaders[i];
      html+='<div class="lbRow'+(i===hl?' hl':'')+'"><span class="lbRank">'+(i+1)+'</span><span class="lbName">'+lbEsc(e.n==='TOI'?TR('TOI'):e.n)+'</span><span class="lbScore">'+fmt(e.s)+'</span></div>';}
  }
  elLb.innerHTML=html;
  if(elLbG)elLbG.innerHTML=html;
}
/* ⚠ « MEILLEURE CAISSE » A ÉTÉ RETIRÉ (2026-08-18). C'était un vestige de l'époque où les caisses se
   gagnaient DANS L'ORDRE : le plus haut index atteint valait alors un titre de gloire. Depuis
   qu'elles s'achètent, « meilleure caisse » ne veut plus rien dire — c'est juste la plus chère qu'on
   ait payée, ce qui ne se félicite pas. Le chip annonce donc le RECORD, et le COMPTE EN BANQUE, qui
   est la vraie mesure d'avancement entre deux parties.
   ⚠ `SAVE.d.bestCar` reste écrit et lu ailleurs (il sert d'indicateur interne et de plancher à la
   clause de grand-père) : on retire l'AFFICHAGE, pas la donnée. */
function setBestChip(){
  bestChip.textContent=(best>0?(TR('RECORD')+'  '+fmt(best)):TR('AUCUN RECORD — À TOI DE JOUER'))+
    (bank()>0?('  ·  '+TR('COMPTE')+' '+fmtC(bank())):'')+
    ((SAVE.d.aura||0)>0?('  ·  ✦ '+(auraSansNom()?fmtAura(SAVE.d.aura||0):auraRankName())):'');
}
function commitName(){
  if(pendingScore==null)return;
  try{uiClic('');}catch(e){} // (2026-10-14, session SON) VALIDER son nom (bouton ou Entrée) était muet : l'appui principal, comme tout « valider »
  var nm=(nameInput.value||'').trim().toUpperCase().replace(/\s+/g,' ').slice(0,8);
  if(!nm)nm='???';
  SAVE.d.pseudo=nm;
  leaders.push({n:nm,s:pendingScore});
  leaders.sort(function(a,b){return b.s-a.s;});
  if(leaders.length>10)leaders.length=10;
  saveLeaders();
  best=Math.max(best,leaders[0].s); // (2026-09-28) jamais à la baisse : le record d'une partie abandonnée reste le record
  var idx=leaders.findIndex(function(e){return e.n===nm&&e.s===pendingScore;});
  pendingScore=null;nameEntry.style.display='none';goTxt.style.display='';nameInput.value='';
  nameInput.blur(); // on lâche le focus : ENTRÉE peut désormais REJOUER (sinon le champ avale la touche)
  renderLeaders(idx);
  paintMoney();
  elRecord.textContent=TR('record : ')+fmt(best);
  setBestChip();
}
nameSave.addEventListener('click',function(e){e.stopPropagation();commitName();});
nameEntry.addEventListener('click',function(e){e.stopPropagation();});
// ENTRÉE dans le champ nom : 1er appui = valider le nom · 2e appui (nom déjà validé) = REJOUER direct
nameInput.addEventListener('blur',function(){setTimeout(function(){try{scrollTo(0,0);}catch(e){}},60);}); // (2026-09-29) iOS laissait la page remontée après le clavier : REJOUER coupé en bas
nameInput.addEventListener('keydown',function(e){e.stopPropagation();if(e.code==='Enter'||e.key==='Enter'||e.keyCode===13){ /* (24/10, relecture) le clavier logiciel de l'iPhone peut laisser `code` vide : la touche Retour se lit aussi par `key` */e.preventDefault();if(pendingScore!=null)commitName();else if(gameOver)playViaGarage();}});
// (2026-09-28) le record MONTE en direct pendant la course (voir la boucle : `money>best`), même d'une partie abandonnée
// (RECOMMENCER/QUITTER) qui n'entre pas au Top 10. L'écraser par `leaders[0]` au chargement faisait redescendre le record
// après une relance — et « NOUVEAU RECORD ! » revenait à tort. On garde le plus haut des deux, ici comme à la signature.
best=Math.max(SAVE.d.best||0,leaders.length?leaders[0].s:0);
const mmCanvas=$('minimap'),mmCtx=mmCanvas.getContext('2d');
const mmBg=document.createElement('canvas');mmBg.width=mmCanvas.width;mmBg.height=mmCanvas.height;const mmBgCtx=mmBg.getContext('2d'); // calque STATIQUE : piste + portail pré-rendus une fois par zone (plus de ~240 segments/frame)
let mmMinX=0,mmMaxX=1,mmMinZ=0,mmMaxZ=1,mmSc=1,mmOx=0,mmOy=0;
const mmX=x=>mmOx+x*mmSc, mmY=z=>mmOy+z*mmSc; // repère carte partagé (compute + draw)
function computeMinimap(){
  if(!pts||!pts.length)return;
  let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
  for(let i=0;i<NP;i++){const p=pts[i];if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;if(p.z<minZ)minZ=p.z;if(p.z>maxZ)maxZ=p.z;}
  mmMinX=minX;mmMaxX=maxX;mmMinZ=minZ;mmMaxZ=maxZ;
  const W=mmCanvas.width,H=mmCanvas.height,m=12;
  const bw=(mmMaxX-mmMinX)||1,bh=(mmMaxZ-mmMinZ)||1;
  mmSc=Math.min((W-2*m)/bw,(H-2*m)/bh);
  mmOx=(W-bw*mmSc)/2-mmMinX*mmSc; mmOy=(H-bh*mmSc)/2-mmMinZ*mmSc;
  // PRÉ-RENDU du décor fixe (piste + portail) dans le calque hors-écran : blitté tel quel chaque frame
  const c=mmBgCtx;c.clearRect(0,0,W,H);
  c.strokeStyle='rgba(160,160,170,.9)';c.lineWidth=2;c.lineJoin='round';c.beginPath();
  const step=Math.max(1,Math.floor(NP/240));
  for(let i=0;i<NP;i+=step){const p=pts[i],cx=mmX(p.x),cy=mmY(p.z);if(i===0)c.moveTo(cx,cy);else c.lineTo(cx,cy);}
  c.stroke();
  const pe=pts[NP-1];c.fillStyle='#ff4fd8';c.beginPath();c.arc(mmX(pe.x),mmY(pe.z),3.6,0,7);c.fill(); // portail (fin de zone)
}
let msgT=0;
// TR() est appliqué ICI plutôt qu'aux ~40 points d'appel : une seule porte d'entrée pour tout ce qui
// s'affiche au centre de l'écran, et les phrases de saveur (tirées par pickL) passent par là aussi.
function showMsg(t,c){elMsg.textContent=TR(t);elMsg.style.color=c||'#ffd75e';elMsg.style.opacity=1;msgT=2.2;}
// LA JAUGE ROSE NE VIENT PLUS DES FIGURES (2026-07-30) : trop dur à remplir, et illisible (« pourquoi
// ça monte ? »). Elle mesure désormais UNE seule chose, limpide : le TEMPS DE BOOST TENU SANS LÂCHER
// (voir `styleFromBoost`). Les figures, elles, multiplient déjà le SCORE via chainVal/chainMult.
// addStyle() est conservée (elle est appelée d'une douzaine d'endroits) mais n'alimente plus la jauge.
function addStyle(n){}
/* ---- L'AURA SE GAGNE (2026-08-17) ------------------------------------------------------------
   Trois sources, et trois seulement — celles qui demandent du panache, jamais de la patience :
     1. LES FIGURES   : chaque maillon de chaîne, à sa valeur.
     2. LA VITESSE TENUE : pas la vitesse de pointe (elle se touche par accident en tombant) mais le
        fait de la MAINTENIR. D'où une accumulation par seconde, au carré de la part au-dessus du
        seuil : rouler à 95 % de sa vmax rapporte beaucoup plus que le double de 48 %.
     3. LES DÉCOLLAGES : le braquage, geste le plus engageant du jeu.
   ⚠ `auraRun` est le compteur de la PARTIE ; il ne part en persistant qu'à `endGame`. Créditer
   directement `SAVE.d.aura` ferait écrire sur le disque à chaque figure, et surtout garderait
   l'aura d'une partie qu'on n'a pas fini de jouer. */
/* ⚠ REFONTE (2026-08-18) — L'AURA NE COULE PLUS, ELLE ÉCLATE.
   1re version : une accumulation par seconde dès qu'on roulait vite. Verdict en jouant : « ça monte
   trop, ça augmente dès que je suis en mouvement ». Le défaut n'était pas le dosage mais la NATURE
   de la source — un robinet ouvert récompense le fait d'exister, pas le fait de bien jouer. On ne
   se souvient pas d'un robinet.
   L'aura ne vient donc plus QUE d'ÉVÉNEMENTS qu'on va chercher, et qui ont chacun un nom :
     · PURE SPEED  — tenir la nitro à fond, au sol, à plus de 400 km/h.
     · RÉCOLTE     — enchaîner les ramassages sans laisser retomber le combo.
     · COMBO       — enchaîner les FIGURES dans une fenêtre courte. C'est la grosse source.
   Chacun affiche son propre éclat : on doit pouvoir dire À VOIX HAUTE pourquoi on vient de gagner. */
let auraRun=0,auraPop=0,auraFlash=0,auraLastTxt='';
let figCombo=0,figComboT=0,figComboAura=0; // le COMBO DE FIGURES : compteur, fenêtre restante, cumul
/* LA VITESSE MULTIPLIE, ELLE NE PRODUIT PAS (2026-08-18).
   La question posée : « plus on va vite, plus on gagne d'aura, puisque plus on risque de perdre ? »
   Le principe est juste — la vitesse EST le risque — mais la 1re version en avait fait une SOURCE
   (tant d'aura par seconde au-dessus d'un seuil), et ça donnait exactement le robinet qu'on a
   supprimé : on était payé pour tenir la manette, pas pour jouer.
   La vitesse devient donc un MULTIPLICATEUR sur les événements. Réussir un combo à 900 km/h vaut
   plus que le même combo à 300, parce que c'est le même geste dans des conditions pires. Et ça ne
   se farme pas : sans événement, un compteur à fond ne rapporte toujours RIEN.
   ⚠ indexé sur `vmaxShow()` (la vmax du palier moteur), pas sur une valeur absolue : sinon la
   caisse de départ ne pourrait jamais y toucher et l'endgame l'aurait en permanence. */
function auraMultVitesse(){
  const vm=vmaxShow();if(!(vm>0))return 1;
  const part=Math.abs(vA)*3.6*SPD/vm;
  if(part<=.5)return 1;                       // moitié de sa vmax : régime normal, aucun bonus
  return 1+Math.min(1,(part-.5)/.5)*.85;      // jusqu'à ×1,85 à fond — sensible, jamais dominant
}
function addAura(n,titre,brut){ // brut : n est DÉJÀ multiplié par la vitesse (le DAUPHIN)
  // ⚠ RIEN EN FREESTYLE : le parc n'a pas de mort. Une monnaie de panache ne se gagne pas la ou
  // l'on ne risque rien — sinon le mode d'entrainement devient la meilleure facon de monter en rang.
  if(!(n>0)||!running||gameOver||(typeof PARK!=='undefined'&&PARK.on))return;
  n=(brut?Math.round(n):Math.round(n*auraMultVitesse()))*auraDragonK(); // (pouvoirs v2) AURA ×2
  auraRun+=n;livre('a:direct'+(titre?'.'+String(titre).split(' ')[0]:''),n);
  auraPop=Math.min(1,auraPop+n/90);
  if(titre){ // un gain NOMMÉ : il claque à l'écran, avec sa raison
    auraFlash=1;auraLastTxt=titre+' +'+n;
    trickMsg('✦ '+titre+'  +'+n,n>=250?3:2);
    try{chimeNote(noteP(Math.min(6,figCombo),1),0,.13,.20);}catch(e){}
  }
}
