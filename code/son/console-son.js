/* ================= LA CONSOLE DE SON (2026-09-28, session SON) =================
   Sacha : « tout ce qui se passe à l'écran doit avoir un son propre et unique, parfaitement maîtrisé et mixé, réellement
   addictif — niveau top 1 App Store ». Audit du jour (4 auditeurs) : ~40 événements visibles SANS son, cinq sons génériques
   (boostSnd, portalSnd, fanfare, le carillon de chaîne, thud) pour des dizaines d'événements — défaite comprise —, presque
   toutes les récompenses dans le même timbre de clochette, cinq compteurs de hauteur indépendants qui faisaient zigzaguer
   « la gamme qui monte », et une pose pouvant empiler 15 à 20 notes en 200 ms.
   LA NOUVELLE CHAÎNE : les sons ne sont plus bâtis ici en oscillateurs. Ils vivent dans la BANQUE (`sons-banque.js`, rendue et
   MESURÉE par l'atelier `atelier-son/` : `node atelier-son/cuire.js`) et `sfx.js` les joue — une source et un gain par
   événement, 4 bus (ui · rec · fx · amb), une salle (réverbe), et un CHEF D'ORCHESTRE qui range les récompenses simultanées
   par priorité. Tous les sons passent par MASTER : le curseur EFFETS, le compresseur et la pause s'appliquent comme avant.
   · `sfx(id,o)` = LE point d'entrée (o : st demi-tons · vol dB · pan −1…1 · t délai s · var variante). Les autres sessions
     l'appellent sous garde `typeof sfx==='function'`. Les noms : voir `sons.html` (le banc d'écoute) ou `dbgSon()`.
   · `son(id,repli)` : joue `id`, ou appelle `repli` (l'ancien son) si la console est absente.
   · ⚠ LES ANCIENNES FONCTIONS (blip, chimeNote, rewardSfx…) RESTENT EN REPLI : si `sfx.js` manque, le jeu sonne comme avant.
   · ⚠ UNE SEULE GAMME PAR VOL (`ECH`, remis à zéro au décollage) : chaque figure, palier d'échelle ou geste en l'air prend le
     degré suivant de la pentatonique ; la POSE résout sur la tonique (le verdict). Au sol, l'aura garde sa gamme (le × d'aura).
   · ⚠ LA TONALITÉ SUIT LA MUSIQUE (`sonTonSuit`, appelé par musicTick) : NÉON en fa, VITESSE en si mineur, NOCTURNAL en sol#
     mineur, NOITE en ré# mineur (mesuré) — les sons accordés sont transposés dans la pentatonique du morceau qui joue. */
var SONV2=false,ECH=0; // `var` et non `let` (débogage 2026-09-29) : lu partout dans le fichier, AVANT sa déclaration — une lecture précoce vaut « faux » au lieu de lever une erreur de zone morte
const SON_PENTA={'jeu.sansFaute':9,'jeu.palierVitesse':7}; // le PLAFOND du degré (débogage 2026-09-29 : SANS FAUTE ×22 montait à ×10) // les appelants passent un COMPTE : on le convertit en degré
/* LE MIX S'ÉCARTE sous les grands moments (duckT : moteur, vent, flamme reculent jusqu'à −6 dB puis reviennent) — les anciennes fanfares le
   faisaient, leurs remplaçants aussi. La valeur = la profondeur du creux (voir `dk` dans la boucle). */
/* (2026-10-15, pôle SON, l'audit) LE RECUL SOUS LES SIGNAUX : mesurés dans LEUR bande contre la musique de niveau, ces signaux passaient à
   ±2 dB d'elle, ou dessous (la panne sèche de nitro est dans le grave de la basse, le portail proche 6 à 9 dB sous elle) — la musique recule
   de −3 dB pendant 0,4 s quand l'un d'eux part (musique-bus.js : `recul`). Seulement là où la musique passe par WebAudio (MUS_WA). */
/* (2026-10-15, Sacha : « faut qu'on profite de la musique ») LA RÉCOLTE ET LA SÉRIE NE FONT PLUS RECULER LA MUSIQUE : la récolte part toutes
   les 5 pièces — MESURÉ au banc, 22 fois en 40 s : la musique pompait de −3 dB toutes les 1,8 s pendant qu'on ramassait. Elles sont devenues
   des sons graves et discrets (la pièce v2) : elles n'ont plus à passer DEVANT la musique. */
const SIG_RECUL={'nitro.sec':1,'flow.perdu':1,'aura.perdue':1,'portail.proche':1,'alerte.dernier':1};
function musRecul(){try{if(musWaTient()&&MUS_WA.bus)MUS_WA.bus.recul(-3,.4);if(window.POUCE_JEU)POUCE_JEU.recul();}catch(e){}}
const SON_DUCK={'frenesie.entre':.6,'cratere':.6,'impact.immeuble':.6,'verdict.3':.5,'caisse.debloquee':.5,'orbite.entre':.5,
  'moteur.palier':.45,'argent.palier':.45,'fig.jackpot':.45,'portail':.4,'jeu.miracule':.4,'aura.x10':.4,'verdict.2':.35,'pad':.3,'turbo.ultra':.3,
  'victoire':.4,'defaite':.3,'fig.monstre':.25,'pwr.n':.25,'pwr.a':.25,'pwr.v':.25,'pwr.m':.25,'pwr.x':.25,'pwr.triple':.35,
  // (2026-10-15, Sacha : « que les figures fassent plus de bruit ») le DOUM des figures écarte le moteur et le vent un instant (pas la musique)
  'fig.explose':.12,'fig.signe':.18,'combo.sceau':.35,'pose.parfait':.15,'pose.divin':.25,
  // (2026-10-14, session SON) les grands moments qui n'écartaient pas le mix alors qu'ils sonnent aussi fort que ceux du dessus (audit oreille-neuve §6) : chaque id vérifié dans la banque et appelé
  'aura.x5':.2,'aura.x8':.3,'fig.essoreuse':.25,'pwr.double':.25,'frenesie.record':.4,'verdict.1':.15,'argent.gros':.15};
function sonPd(i){i=Math.max(0,i|0);return [0,2,4,7,9][i%5]+12*Math.floor(i/5);} // i-ème degré de la pentatonique, en demi-tons
// (2026-10-14, session SON) passé le 9e degré (+21, le plafond des bases [0,12]), une gamme du vol ne se FIGE plus sur sa note : elle redescend
// et remonte l'octave haute (degrés 8-7-6-5-6-7-8-9 : +19 +16 +14 +12 +14 +16 +19 +21) — jamais plus haut qu'avant
/* (2026-10-15, Sacha : « trop de petits sons aigus… plus de sons graves et discrets ») LA GAMME DU VOL TIENT DANS UNE OCTAVE : elle montait
   jusqu'au 9e degré (+21 demi-tons : la 8e figure d'un vol, le 10e frôlé sonnaient presque deux octaves au-dessus de leur note). Elle monte
   maintenant du degré 0 au 5e (+12, l'octave), puis va et vient en haut de l'octave (degrés 4-3-4-5 : +9 +7 +9 +12). L'ancienne : 8-7-6-5-6-7-8-9 après le 9e. */
const SON_ECH_AR=[4,3,4,5];
function sonPdAR(i){i=Math.max(0,i|0);return sonPd(i<=5?i:SON_ECH_AR[(i-6)%SON_ECH_AR.length]);}
var UI_SON={t:-1e9,pd:-1e9}; // (2026-10-16) le FILET DES BOUTONS MUETS (voir uiFiletRole) : l'heure du dernier son tenté (t) et du dernier contact (pd)
/* LE CLIC DANS LA PAUSE (2026-10-16, Sacha : « chaque bouton doit avoir un son lorsqu'on clique dessus dans l'interface, chaque curseur »).
   VU au banc : dans le panneau ⏸ (RECOMMENCER, SON, MUSIQUE, TOUS LES RÉGLAGES…) et dans les réglages ouverts depuis la pause, TOUT était
   MUET — la pause ferme la sortie (BUSOUT à 0) puis endort le contexte (togglePause), et uiClic attendait la reprise (700 ms au plus : le
   plus souvent, rien ; les crans des curseurs, eux, ne passaient jamais). Un son d'INTERFACE (`ui.*`) joué pendant la pause réveille
   maintenant le contexte le temps de sonner (`pauseSon`) : les trois autres bus de la console se ferment (rec, fx, amb — des boucles
   d'ambiance y tournent encore), la sortie s'ouvre, le son part ; 0,45 s après le dernier, tout se rendort comme la pause l'avait
   laissé. Les boucles du moteur, du vent, du nitro sont déjà à zéro (togglePause), la musique est en pause. Si la partie reprend
   entre-temps (REPRENDRE et son compte 3-2-1 passent par busPlein, compté dans `busPlein.n`), elle garde la sortie ; l'extrait du
   curseur MUSIQUE (MUSAP) garde son contexte. `?pauseson=0` : la pause d'avant (muette). */
const PSON={n:0,sav:null,bp:0},PSON_ON=!/[?&]pauseson=0\b/.test(location.search);
function pauseSonDort(){return !!(PSON_ON&&paused&&SONV2&&SND.sfx&&AC&&BUSOUT&&!document.hidden&&(AC.state!=='running'||BUSOUT.gain.value<.5));}
function pauseSonFin(n){if(n!==PSON.n)return;const C=window.CCSON;
  const rend=function(){if(n!==PSON.n||!PSON.sav)return;for(const k in PSON.sav){const g=C.bus(k);if(g)g.gain.value=PSON.sav[k];}PSON.sav=null;};
  try{if(!paused||(busPlein.n|0)!==PSON.bp||document.hidden){rend();return;} // la partie (ou son compte 3-2-1) a repris la sortie : elle est à elle
    BUSOUT.gain.setTargetAtTime(0,AC.currentTime,.012);
    setTimeout(function(){if(n!==PSON.n)return;try{if(paused&&(busPlein.n|0)===PSON.bp&&!(MUSAP.t>performance.now())&&AC.state==='running')AC.suspend();}catch(e){}rend();},90);
  }catch(e){rend();}}
function pauseSon(id,o){const C=window.CCSON,n=++PSON.n;if(UI_SON)UI_SON.t=performance.now();
  try{if(!PSON.sav){PSON.sav={};for(const k of ['rec','fx','amb']){const g=C.bus(k);if(g){PSON.sav[k]=g.gain.value;g.gain.value=0;}}PSON.bp=busPlein.n|0;}
    clearTimeout(togglePause._t); // la mise en sommeil programmée par la pause attendra la fin du clic
    const t=AC.currentTime;BUSOUT.gain.cancelScheduledValues(t);BUSOUT.gain.setValueAtTime(1,t);
    const joue=function(){try{if(paused&&SND.sfx)C.play(id,o);}catch(e){}setTimeout(function(){pauseSonFin(n);},450);};
    if(AC.state!=='running'){const p=AC.resume();if(p&&p.then)p.then(joue,function(){pauseSonFin(n);});else joue();}else joue();
  }catch(e){pauseSonFin(n);}
  return null;}
function sfx(id,o){
  if(SONV2&&id.indexOf('ui.')===0&&pauseSonDort())return pauseSon(id,o); // (2026-10-16) LE CLIC DANS LA PAUSE (voir pauseSon)
  if(!SONV2||!sfxOk()||document.hidden)return null;
  try{if(UI_SON&&id!=='ui.appui'&&!(o&&o.loop))UI_SON.t=performance.now();if(o&&o.st!=null&&SON_PENTA[id])o.st=sonPd(Math.min(SON_PENTA[id],o.st));const h=window.CCSON.play(id,o);if(h&&SON_DUCK[id])duckT=Math.max(duckT,SON_DUCK[id]);if(h&&SIG_RECUL[id])musRecul();return h;}catch(e){return null;}
}
function son(id,repli,o){if(SONV2&&window.CCSON.existe(id)){sfx(id,o);return true;}if(repli)try{repli();}catch(e){}return false;}
function echSt(){return sonPdAR(ECH++);} // (2026-10-14, session SON) aller-retour au-delà du 9e degré (sonPdAR), au lieu de Math.min(9,…) // plafond au 9e degré (+21 demi-tons) : au-delà la transposition dépasse l'octave de la base // le degré SUIVANT de la gamme du vol
function sonConsole(){ // branche la console sur le contexte du jeu (fin d'initAudio ; rejoué si sfx.js arrive après le 1er geste)
  if(SONV2||!AC||!MASTER||!window.CCSON)return;
  try{window.CCSON.init(AC,MASTER);SONV2=!!(window.CCSON.etat().ok&&window.CCSON.existe('ui.tap'));sonTonSuit._t=null;}catch(e){SONV2=false;} // (débogage 2026-09-29) sans banque chargée, l'ancien son reprend la main
  try{waPrecharge();}catch(e){} // les voix et les samples, décodés pour le mixage (voir LES VOIX ET LES SAMPLES DANS LE MIXAGE)
}
addEventListener('load',function(){try{sonConsole();}catch(e){}});
const SON_TON={'ciel-nuages':-2,'ciel-altitude':-6,'ciel-apesanteur':1,'garage-atelier':3,'garage-huile':-4,'garage-cle':5,'chris-matin':-2}; // la tonalité de chaque morceau qui joue encore (le ciel et le garage du menu, l'auto-école) — 18/10 : celles des morceaux partis (NÉON, VITESSE, NOITE, GLASSY, SWAG, ADDICTIVE, CIEL, VILLE, les autres Chris) sont retirées
function sonTonSuit(){
  if(!SONV2)return;let t=0;
  try{const el=musicEl;if(SND.music&&el&&el.src){for(const k in SON_TON)if(el.src.indexOf(k)>=0){t=SON_TON[k];break;}if(FRENM.surm)t+=1;}}catch(e){}
  if(t!==sonTonSuit._t){sonTonSuit._t=t;window.CCSON.ton(t);}
}
const FRUIT_SON={'PÊCHE PLATE':'fruit.peche','BANANE':'fruit.banane','GRENADE':'fruit.grenade','ORANGE':'fruit.orange','MYRTILLE':'fruit.myrtille','PASTÈQUE':'fruit.pasteque',
  /* (2026-10-20, les nouveaux fruits) chacun reprend la bouche d'un fruit voisin : la hauteur monte à chaque fruit d'une rafale (sonFruitSt) — la file sonne comme une gamme */
  'PÊCHE':'fruit.peche','CERISE':'fruit.myrtille','KIWI':'fruit.orange','MANGUE':'fruit.banane','POMME':'fruit.peche','MELON':'fruit.banane','LITCHI':'fruit.myrtille'};
function figSnd(id){ // chaque figure a SA matière, posée sur l'échelle du vol — (2026-10-14, session SON) une figure du catalogue FINIE (`fig_*`, lecteur `?fig=script`) sonne le MAILLON, comme le tour complet d'une figure libre : elle rejouait la vrille de son départ (veqFigure), deux fois le même son par figure
  if(!SONV2){trickPop(chain);return;}
  if(id.indexOf('fig_combo_')===0)return; /* (2026-10-14, session SON) le COMBO a SA signature (sonCombo, appelée par comboNote) : pas le maillon par-dessus */
  const sg=id.indexOf('fig_')===0?FIG_SIGNE[id.slice(4)]:null;
  if(sg!=null){sfx('fig.signe',{st:echSt(),var:sg});return;}
  const sm=FIG_MONDE[id];if(typeof sm==='number'){sfx('fig.monde',{st:echSt(),var:sm});return;} /* (2026-10-14, session SON — étape 2) une figure de MONDE (banquise, eau) sonne SA phrase */ /* (2026-10-14, session SON) une figure du CATALOGUE payée sonne SA phrase (fig.signe), plus le maillon commun aux douze */
  sfx(id==='vrille'?'fig.vrille':id==='bump'?'fig.bump':'fig.maillon',{st:echSt()});
  if(id==='vrille'&&spinHalf>=4&&!figSnd._ess){figSnd._ess=1;sfx('fig.essoreuse');} /* (débogage son 2026-09-29) une fois par vol */
}
/* (2026-10-14, session SON) LA SIGNATURE DE CHAQUE FIGURE : la variante de `fig.signe` (atelier-son/recettes.js) de chaque figure du catalogue
   (figures.js). Une figure inventée par le joueur, ou une figure automatique (la toupie de drift), garde le maillon. */
const FIG_SIGNE={tailwhip:1,tonneau:0,toupie:1,shimmy:2,chandelle:3,saltoa:4,saltov:5,double:6,tirebouchon:7,helico:8,penche:9,rodeo:10,cosmique:11};
const FIG_MONDE={bk_trp:0,bk_glace:1,bk_pou:2,bk_trace:3,bk_pat:4,bk_der:5,ricochet:6,plongeon:7,surf:8}; // (étape 2) les figures de LA BANQUISE et de l'eau : variantes de `fig.monde`
/* (2026-10-14, session SON ; les combos : GENERAL, comboNote) LA SIGNATURE DES COMBOS. La clé = les trois AXES triés (T tonneau, P toupie,
   S salto, M mixte). Trois FRAPPES (une matière par axe, dans l'ordre de la clé) qui montent la pentatonique du vol, puis le SCEAU : pur
   (trois fois le même axe), mélangé, LE GYROSCOPE (PST, les trois axes : le roi) ou LE GRAND CHAOS (MMM). Vingt clés, vingt phrases.
   `neuf` (1re découverte) : le sceau sort plus fort. */
const COMBO_AXE={T:0,P:1,S:2,M:3};
function sonCombo(cle,neuf){
  if(!SONV2||typeof cle!=='string'||cle.length!==3)return;
  /* (2026-10-15, Sacha : « genre doum, doum ») DOUM, DOUM, DOUM… BOUM : trois tambours graves qui montent (fa#, si, mi : degrés 1-3-5,
     110 ms d'écart — on les compte) puis le sceau qui RETOMBE sur la tonique grave. Avant : 85 ms, une gamme qui partait du degré du vol
     (jusqu'au 9e, +21) et un sceau au-dessus. */
  const b=1,pur=cle[0]===cle[1]&&cle[1]===cle[2];
  for(let i=0;i<3;i++)sfx('combo.frappe',{var:COMBO_AXE[cle[i]]|0,st:sonPd(b+2*i),t:i*.11});
  sfx('combo.sceau',{var:cle==='PST'?2:cle==='MMM'?3:pur?0:1,st:0,t:.36,vol:neuf?2:0});
}
window.dbgSonJoue=function(id,o){ // (banc) joue un son de la banque par le vrai lecteur : vrai = une voix est partie · dbgSonJoue('combo','PST') = sonCombo
  if(id==='combo'){sonCombo(o,true);return true;}if(id==='figSnd'){figSnd(o);return true;}
  if(id==='slide'){if(o.e!=='lire')sonSlide(o.e,o.k);return {boucle:!!SLDS.h,k:SLDS.k,garde:!!SLDS.iv};} // dbgSonJoue('slide',{e:'debut',k:.6}) : l'état de la boucle après l'appel
  return !!sfx(id,Object.assign({force:true},o||{}));};
/* (2026-10-14, session SON ; la figure : GENERAL, slideTick) LE SON DU SLIDE. `sonSlide(etat,k)` — 'debut' puis 'tick' à chaque image de
   frottement (k = vitesse / vmax, 0 à 1,3), 'fin' au lâcher (paiement ou perte), 'paye' avec l'aura versée. La BOUCLE de meulage suit k en
   direct : volume de −14 à −3 dB, lecture de ×0,8 à ×1,25 (plus vite = plus aigu). Sous le moteur, au-dessus du vent. ⚠ Une boucle ne
   s'arrête pas toute seule : si les 'tick' cessent sans 'fin' (pause, appli cachée), le chien de garde la coupe à 0,35 s ; le 'tick'
   suivant la relance. */
const SLDS={h:null,k:0,vu:0,essai:0,iv:0};
function sldDb(k){return -14+11*Math.min(1,k);}
function sldRate(k){return .8+.45*Math.min(1,k);}
function sonSlideStop(tc){if(SLDS.h){try{SLDS.h.stop(tc||.06);}catch(e){}SLDS.h=null;}if(SLDS.iv){clearInterval(SLDS.iv);SLDS.iv=0;}}
function sonSlideBoucle(k){const n=performance.now();if(n-SLDS.essai<400)return;SLDS.essai=n;
  SLDS.h=sfx('fig.slide',{loop:true,force:true,vol:sldDb(k),rate:sldRate(k)});
  if(SLDS.h&&!SLDS.iv)SLDS.iv=setInterval(function(){if(performance.now()-SLDS.vu>350)sonSlideStop(.08);},200);}
function sonSlide(etat,k){
  if(!SONV2)return;
  if(etat==='paye'){sfx('fig.slide.paye',{st:sonPd(Math.min(9,2+Math.floor((+k||0)/80)))});return;} // k = l'aura versée : un gros slide sonne un degré plus haut
  k=Math.max(0,Math.min(1.3,+k||0));SLDS.vu=performance.now();
  if(etat==='debut'){sonSlideStop(.03);SLDS.essai=0;sfx('fig.slide.debut',{vol:-6+5*Math.min(1,k)});sonSlideBoucle(k);SLDS.k=k;return;}
  if(etat==='tick'){if(!SLDS.h){sonSlideBoucle(k);SLDS.k=k;return;}
    if(Math.abs(k-SLDS.k)>.02){SLDS.k=k;SLDS.h.gain(sldDb(k),.08);SLDS.h.rate(sldRate(k),.08);}return;}
  if(etat==='fin'){const eu=!!SLDS.h,k0=SLDS.k;sonSlideStop(.06);if(eu)sfx('fig.slide.fin',{vol:-8+5*Math.min(1,k0),rate:.85+.3*Math.min(1,k0)});}
}
/* ---- LES SAMPLES DANS LE MIXAGE (2026-09-28, console de son) ----
   ⚠ SUR IPHONE `HTMLAudio.volume` EST EN LECTURE SEULE : l'annonceur y sortait à 100 % du fichier (−8 LUFS, ~5 dB au-dessus du
   réglage), SANS sa doublure démon ni ses échos d'or (écartés par VOL_LOCKED), et les curseurs VOIX / EFFETS n'y pouvaient rien ;
   les sons de mort et le WOW pareil. Quand la page est SERVIE (http, https, capacitor — pas en file://, où fetch est refusé), chaque
   fichier est DÉCODÉ en WebAudio : la voix retrouve partout son habillage, son niveau et son curseur ; les samples suivent le
   curseur EFFETS. Tant qu'un fichier n'est pas décodé (ou s'il échoue), le chemin HTMLAudio d'origine joue, intact.
   Les voix sont aussi RAMENÉES À LA MÊME SONIE (mesuré : −7,8 à −10,4 LUFS, early_dead −15,1) : cible −10, early_dead −12. */
const WA_BUF={};
function waCharge(url){
  if(WA_BUF[url]!==undefined)return;WA_BUF[url]=null;
  if(location.protocol==='file:'||!AC||typeof fetch!=='function')return;
  try{fetch(url).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer();})
    .then(function(ab){return new Promise(function(ok,ko){const p=AC.decodeAudioData(ab,ok,ko);if(p&&p.then)p.then(ok,ko);});})
    .then(function(b){WA_BUF[url]=b;}).catch(function(){delete WA_BUF[url];});}catch(e){delete WA_BUF[url];}
}
function waPrecharge(){try{for(const d of DEATH_LIB)waCharge(DEATH_DIR+d.f);}catch(e){}}
function sampleWA(url,v,max,liste){ // un sample (mort, argent) en WebAudio : même niveau que l'<audio> d'origine (sortie directe × curseur EFFETS), fondu de 450 ms
  const b=WA_BUF[url];if(!b){try{waCharge(url);}catch(x){}return false;}if(!AC||AC.state!=='running'||!MASTER||!MASTER._vol)return false;
  try{const t0=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain(),fin=t0+Math.min(max,b.duration);
    s.buffer=b;g.gain.setValueAtTime(v,t0);g.gain.setValueAtTime(v,Math.max(t0,fin-.45));g.gain.linearRampToValueAtTime(0,fin);
    s.connect(g);g.connect(MASTER._vol);s.start(t0);s.stop(fin+.02);
    liste.push({pause:function(){try{g.gain.cancelScheduledValues(AC.currentTime);g.gain.setTargetAtTime(0,AC.currentTime,.02);s.stop(AC.currentTime+.12);}catch(x){}}});if(liste.length>4)liste.shift();
    return true;}catch(x){return false;}
}
/* `stt(param, valeur, t, tc)` — (2026-09-26, passe perf) les ~50 réglages audio que la boucle envoie à CHAQUE image (moteur, vent,
   crissement, nitro…). Mesuré au profil : `setTargetAtTime` = 11 % du CPU. Deux règles :
   · contexte SUSPENDU (son coupé, pause, onglet caché) → rien : son horloge est arrêtée, chaque réglage s'EMPILAIT dans la file du
     paramètre sans jamais être consommé (une file qui grossit tant qu'on joue son coupé) ;
   · cible quasi identique à la dernière envoyée (±0,2 %) → rien, mais on renvoie quand même 4 fois par seconde : si un autre son a
     touché le même paramètre entre-temps, il ne reste jamais décalé plus d'un quart de seconde. */
function stt(p,v,t,tc){
  if(!AC||AC.state!=='running'||!p)return;
  const o=p._s9,now=AC.currentTime;
  if(o!==undefined&&p._c9===tc&&Math.abs(v-o)<=Math.abs(o)*.002+1e-5&&now-p._t9<.25)return;
  p._s9=v;p._c9=tc;p._t9=now;p.setTargetAtTime(v,t,tc);
}
/* TAMPONS DE BRUIT CUITS UNE FOIS (2026-09-25) : chaque pop, pétarade, souffle ou fwoosh fabriquait son propre AudioBuffer
   (len × 48 000 Math.random, et ~25 par seconde en nitro). On garde désormais 3 variantes par durée (arrondie aux 10 ms
   supérieures) et on en pioche une au hasard : le timbre est le même, l'allocation disparaît. */
const NZ_CACHE={},BR_CACHE={};
function noiseBuf(len){
  const k=Math.max(1,Math.ceil(len*100)),c=NZ_CACHE[k]||(NZ_CACHE[k]=[]);
  if(c.length>=3)return c[(Math.random()*3)|0];
  len=k/100;
  const n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),ch=b.getChannelData(0);
  for(let i=0;i<n;i++)ch[i]=Math.random()*2-1;
  c.push(b);return b;
}
function pinkBuf(len){ // BRUIT ROSE : −3 dB/octave, le bruit des matières et des machines.
  // ⚠ le blanc est trop brillant (ça siffle), le brun trop sourd (ça gronde) : le rose est le
  // seul qui s'entend comme de la MATIÈRE. C'est le lit sur lequel tout le reste se pose.
  // Filtre de Paul Kellett : trois pôles, coût nul, spectre juste à ±0,5 dB.
  const n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),ch=b.getChannelData(0);
  let b0=0,b1=0,b2=0,m=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;
    b0=.99765*b0+w*.0990460;b1=.96300*b1+w*.2965164;b2=.57000*b2+w*1.0526913;
    const v=b0+b1+b2+w*.1848;ch[i]=v;const a=Math.abs(v);if(a>m)m=a;}
  const d0=ch[0]/(m||1),d1=ch[n-1]/(m||1);
  for(let i=0;i<n;i++)ch[i]=ch[i]/(m||1)-(d0+(d1-d0)*i/n); // normalisé + boucle sans couture
  return b;
}
function brownBuf(len){ // bruit BROWN : blanc intégré — grave et rond PAR NATURE, zéro chuintement.
  const k=Math.max(1,Math.ceil(len*100)),c=BR_CACHE[k]||(BR_CACHE[k]=[]);
  if(c.length>=3)return c[(Math.random()*3)|0];
  len=k/100;
  // C'est le timbre de l'océan et des fusées : la matière première d'une flamme douce.
  const n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),ch=b.getChannelData(0);
  let v=0,m=0;
  for(let i=0;i<n;i++){v=(v+(Math.random()*2-1)*.02)*.998;ch[i]=v;const a=Math.abs(v);if(a>m)m=a;}
  const d0=ch[0]/(m||1),d1=ch[n-1]/(m||1);
  for(let i=0;i<n;i++)ch[i]=ch[i]/(m||1)-(d0+(d1-d0)*i/n); // normalisé + boucle sans couture
  c.push(b);return b;
}
function flamePop(dur,vol,freq){ // pop de combustion : tranche de bruit BROWN filtrée — un « plop » rond,
  // jamais un « tss » blanc. La pluie de ces pops = le crépitement du feu, sans tapis de souffle.
  if(!sfxOk())return;
  try{
    const src=AC.createBufferSource();src.buffer=brownBuf(dur+.02);
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;f.Q.value=.7;
    const g=AC.createGain();g.gain.setValueAtTime(vol,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start();
  }catch(e){}
}
