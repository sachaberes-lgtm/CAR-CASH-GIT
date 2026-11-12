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
const SIG_RECUL={'nitro.sec':1,'flow.perdu':1,'aura.perdue':1,'portail.proche':1,'alerte.dernier':1,
  /* (2026-11-10, refonte du son, 2e passe) LES GRANDES RÉCOMPENSES DES ÉCRANS : la musique s'efface d'un souffle (−3 dB, 0,4 s) sous l'achat, le déblocage, le record, la mission accomplie, le jackpot —
     des moments rares, qu'on doit entendre EN ENTIER ; jamais sous un clic ni sous une pièce (décision du 15/10, inchangée) */
  'ui.achat':1,'ui.debloque':1,'ui.record':1,'ui.mission':1,'caisse.debloquee':1,'spin.jackpot':1};
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
  if(!SND.sfx&&!SND.music)return null; /* (2026-11-07, chasse SON-N04) tout coupé : la feuille de pause ne réveille pas le contexte pour un clic muet */
  try{if(!PSON.sav){PSON.sav={};for(const k of ['rec','fx','amb']){const g=C.bus(k);if(g){PSON.sav[k]=g.gain.value;g.gain.value=0;}}PSON.bp=busPlein.n|0;}
    clearTimeout(togglePause._t); // la mise en sommeil programmée par la pause attendra la fin du clic
    const t=AC.currentTime;BUSOUT.gain.cancelScheduledValues(t);BUSOUT.gain.setValueAtTime(1,t);
    const joue=function(){try{if(paused&&SND.sfx)C.play(id,o);}catch(e){}setTimeout(function(){pauseSonFin(n);},450);};
    if(AC.state!=='running'){const p=AC.resume();if(p&&p.then)p.then(joue,function(){pauseSonFin(n);});else joue();}else joue();
  }catch(e){pauseSonFin(n);}
  return null;}
/* (2026-11-07, chasse SONDE-N01) LES SONS CHAUFFÉS : avec les sons à la demande (sfx.js, 2026-11-05), le PREMIER jeu de chaque son d'une session partait en
   retard (décodé au moment du play) : le logo du départ, le plein de nitro, les pouvoirs, l'entrée en frénésie, l'explosion… On les met en file dès que le
   son existe (SONS_TITRE au premier geste, pour la gerbe du titre) et avant chaque départ (SONS_COURSE : au lâcher, à resetGame, au portail). Déjà décodé : rien. */
const SONS_FIXES=['explosion','explosion.loin','mort.vide','mort.enseigne','mort.compteFin','defaite','victoire','pwr.fin','pwr.bientot','frenesie.entre','frenesie.sort','triade.revele','triade.meurt','triade.renait','nitro.plein','nitro.sec','moteur.palier','moteur.cylindre','portail','portail.proche','depart.logo','pad']; /* le noyau d'une course, gardé décodé comme `pre:1` (une course de 3 min sans portail évinçait l'explosion avant la mort) */
const SONS_COURSE=['nitro.vide','nitro.pleine','turbo.mini','pwr.a','pwr.m','pwr.n','pwr.double','pwr.x','frenesie.arme','frenesie.record','frenesie.pose','frenesie.cash','pose.lourde','pose.cheveu','aura.perdue','aura.record','aura.encaisse1','aura.encaisse2','flow.perdu','flow.1','piece.recolte','piece.serie','respawn','chute','decollage','debris.tole','cratere','drift.charge','virage','air.regain','plus.vite','argent.palier','argent.gros','citron.zap','foudre.eclair','tonnerre','fig.bigair','fig.monstre','fig.jackpot','fig.essoreuse','fig.slide','jeu.miracule','jeu.palierVitesse','raccourci','report','fronde','combo.frappe','garage.lacher','nuage.entre','fruit.peche','fruit.banane','fruit.grenade','fruit.orange','fruit.myrtille','fruit.pasteque','fruit.rafale','fig.maillon','fig.vrille','fig.signe','combo.sceau','pose.parfait','pose.nette','verdict.1','aura.geste','flow.2','flow.3','pluie.billets','aura.x5',
  'verdict.2','verdict.3','aura.x8','aura.x10','aura.encaisse3','pose.travers','pose.contresens','alerte.tac','turbo.super','turbo.ultra','pwr.v','pwr.triple','pwr.autre','jeu.sansFaute','nitrooo.palier','fig.palier','impact.immeuble','mort.arret','mort.air','mort.police','flaque.eau','flaque.huile','caisse.debloquee','arret.tic']; /* (2026-11-10, 2e passe : l'inventaire complet des sons de course — 24 n'étaient dans aucune liste) */
/* (2026-11-10, refonte du son) LES SONS DE LA MAP : chaque map a les siens (les bêtes de la forêt, la glace, l'orbite…), décodés à la demande — le premier cri d'oiseau partait en retard ou se
   taisait (fumée : foret.pic 125 ms, perdu). `sonsChauffeCarte(niv)` est appelé quand la piste se bâtit (départ, portail : la map d'arrivée est connue avant qu'on y entre). */
const SONS_CARTE={foret:['foret.oiseau','foret.pic','foret.chouette','foret.corbeau','foret.craque','foret.jourAmb','foret.nuitAmb','foret.abeille','foret.loup'],
  banquise:['banq.vent','banq.glisse','banq.poudre','banq.chant','banq.craque','banq.plouf'],nuages:['nuage.defonce','nuage.sort'],jade:['dauphin.banc'],espace:['espace.ambiance','orbite.entre','orbite.sort']};
function sonsChauffeCarte(niv){if(!niv)return;const L=SONS_CARTE[niv.carte]||SONS_CARTE[niv.id];if(L)sonsChauffe(L);if(niv.carte!=='espace'&&niv.id!=='espace')sonsChauffe(SONS_CARTE.espace.slice(1));
  try{if(typeof SURV!=='undefined'&&(SURV.on||SURV.armed))sonsChauffe(['alerte.dernier','rival.boum']);}catch(e){}} /* (2026-11-10, refonte du son) + les fruits, les figures et les poses : ils partaient en retard à leur premier appel de la course (fumée : 15 à 70 ms) */
const SONS_TITRE=['riche.bon','riche.gemme','riche.verre','riche.piece','riche.petit','riche.fleurs','riche.coeur','riche.bouchon','riche.coup','riche.combo','fourgon.billets','pluie.billets','garage.tole','garage.bascule','ui.jouer'];
const SONS_SPIN=['spin.levier','spin.jeton','spin.roule','spin.tease','spin.piece','spin.gain','spin.jackpot','spin.ouvre','spin.cran','spin.cliquet','spin.presque','spin.ferme','spin.arret']; /* à l'ouverture de la machine : son premier tirage n'avait ni levier ni jeton */
function sonsChauffe(L,fixe){try{if(SONV2&&window.CCSON&&window.CCSON.chauffe){window.CCSON.chauffe(L,!!fixe);if(L===SONS_COURSE&&window.CCSON.enCourse)window.CCSON.enCourse();}}catch(e){}} /* (2026-11-10, refonte du son) chauffer les sons de la course = une course commence (ou continue, au portail) : le lecteur ne rend plus aucun tampon jusqu'à la mort — la PREMIÈRE course ne passait pas par resetGame, ses sons étaient évincés au bout de 60 s */
function sfx(id,o){
  if(typeof id!=='string'){sonPanne('sfx sans identifiant',String(id));return null;} /* (2026-11-05, DEBUG-TOTAL) id.indexOf hors du try : un id absent LEVAIT chez l'appelant (souvent dans la boucle) */
  if(SONV2&&id.indexOf('ui.')===0&&pauseSonDort())return pauseSon(id,o); // (2026-10-16) LE CLIC DANS LA PAUSE (voir pauseSon)
  if(!SONV2||!sfxOk()||document.hidden)return null;
  try{if(UI_SON&&id!=='ui.appui'&&id!=='ui.survol'&&id!=='ui.cran'&&!(o&&o.loop))UI_SON.t=performance.now();if(o&&o.st!=null&&SON_PENTA[id])o.st=sonPd(Math.min(SON_PENTA[id],o.st));const h=window.CCSON.play(id,o);if(h&&SON_DUCK[id])duckT=Math.max(duckT,SON_DUCK[id]);if(h&&SIG_RECUL[id])musRecul();return h;}catch(e){return null;}
}
function son(id,repli,o){if(SONV2&&window.CCSON.existe(id)){sfx(id,o);return true;}if(repli)try{repli();}catch(e){}return false;}
function echSt(){return sonPdAR(ECH++);} // (2026-10-14, session SON) aller-retour au-delà du 9e degré (sonPdAR), au lieu de Math.min(9,…) // plafond au 9e degré (+21 demi-tons) : au-delà la transposition dépasse l'octave de la base // le degré SUIVANT de la gamme du vol
function sonConsole(){ // branche la console sur le contexte du jeu (fin d'initAudio ; rejoué si sfx.js arrive après le 1er geste)
  if(SONV2||!AC||!MASTER||!window.CCSON)return;
  try{window.CCSON.init(AC,MASTER);SONV2=!!(window.CCSON.etat().ok&&window.CCSON.existe('ui.tap'));sonTonSuit._t=null;sonsChauffe(SONS_TITRE);sonsChauffe(SONS_FIXES,true);sonsChauffe(SONS_COURSE);}catch(e){SONV2=false;} // (débogage 2026-09-29) sans banque chargée, l'ancien son reprend la main
  try{waPrecharge();}catch(e){} // les voix et les samples, décodés pour le mixage (voir LES VOIX ET LES SAMPLES DANS LE MIXAGE)
}
addEventListener('load',function(){try{sonConsole();}catch(e){}});
const SON_TON={'ciel-nuages':-2,'ciel-altitude':-6,'ciel-apesanteur':1,'garage-atelier':3,'garage-huile':-4,'garage-cle':5,'chris-matin':-2}; // la tonalité de chaque morceau qui joue encore (le ciel et le garage du menu, l'auto-école) — 18/10 : celles des morceaux partis (NÉON, VITESSE, NOITE, GLASSY, SWAG, ADDICTIVE, CIEL, VILLE, les autres Chris) sont retirées
/* ===== LES EFFETS DANS LA TONALITÉ DU MORCEAU (2026-11-10, refonte du son, 2e passe) =====
   Tous les sons à note (`key:1` : les clics, les pièces, les figures, les poses, les récompenses — 138 fiches) sont cuits en MI et transposés dans la gamme du morceau qui joue. Mais
   `sonTonSuit` ne lisait la tonalité que sur l'<audio> du menu ; depuis que POUCE BLEU joue la musique (au menu comme en course), il est en pause : les effets restaient en MI quel que soit
   le morceau — sur NÉON NOIR (do mineur) ou RUBIS ULTRA (sol mineur), chaque pièce et chaque figure tombait à côté (le constat n° 1 de l'audit du 20/10, jamais corrigé).
   Désormais : la tonalité du morceau de Pouce bleu — écrite dans sa fiche (`fiche.ton`, paliers figés), donnée par le générateur (`inst.tirage.ton`), sinon lue dans la table `PB_TON`
   (les pages en direct, par titre). La pentatonique majeure de la banque se pose sur la RELATIVE MAJEURE d'un morceau mineur (do mineur → mi♭ : ses cinq notes sont dans la gamme), sur la
   tonique d'un morceau majeur ou lydien, et sur la relative du mineur harmonique dont le hijaz est le 5e mode. `?ton=ancien` : comme avant (MI pendant Pouce bleu). `dbgSonTon()`. */
const PB_TON={'ASPHALTE':'mi mineur','AURA':'mi mineur','CAVALE':'ré dorien','COBRA':'si mineur','ENSEIGNE DE JADE':'fa# dorien','FEU DE LUXE':'la majeur','FIRE PRIME':'mi♭ mineur','FLAMME DE TONNERRE':'ré hirajoshi',
  'MIRAGE':'ré hijaz','NÉNUPHARS':'la♭ lydien','NÉON NOIR':'do mineur','NUIT DE VELOURS':'mi♭ mineur','PLUIE D':'do♯ mineur','RUBIS DE NÉON':'fa mineur','RUBIS ULTRA':'sol mineur','SAUVER MAMAN':'do mineur','TONNERRE DELUXE':'la♭ mineur'};
const SON_TON_PB=!/[?&]ton=ancien\b/.test(location.search),SON_NOTES={'do':0,'ré':2,'re':2,'mi':4,'fa':5,'sol':7,'la':9,'si':11};
function sonTonDe(txt){ /* « do♯ mineur », « fa# dorien », « la♭ lydien », « ré hijaz » → demi-tons pour CCSON.ton (de −6 à +5), ou null */
  const m=/^\s*(do|ré|re|mi|fa|sol|la|si)\s*([#♯b♭]?)\s*(.*)$/i.exec(String(txt||''));if(!m)return null;
  let pc=SON_NOTES[m[1].toLowerCase()];if(pc==null)return null;if(m[2]==='#'||m[2]==='♯')pc++;else if(m[2]==='b'||m[2]==='♭')pc--;
  const mo=m[3].toLowerCase(),tonique=/majeur|lydien|mixolydien|ionien/.test(mo)?pc:/hijaz|phrygien dominant/.test(mo)?pc+8:pc+3;
  return ((tonique-4+6)%12+12)%12-6;}
function sonTonPouce(){ /* la tonalité du morceau de Pouce bleu qui joue (lobby, intro ou course), en demi-tons — null s'il ne joue pas ou si on ne la connaît pas */
  const P=window.POUCE_JEU;if(!SON_TON_PB||!P||!P.E||!(P.phase==='lobby'||P.phase==='intro'||P.phase==='course'))return null;
  let txt=null;try{txt=(P.E.fiche&&P.E.fiche.ton)||(P.J&&P.J.inst&&P.J.inst.tirage&&P.J.inst.tirage.ton)||null;}catch(e){}
  if(!txt){const ti=String(P.E.titre||'').toUpperCase();for(const k in PB_TON)if(ti.indexOf(k)>=0){txt=PB_TON[k];break;}}
  if(txt===sonTonPouce._x)return sonTonPouce._v;sonTonPouce._x=txt;return sonTonPouce._v=txt?sonTonDe(txt):null;}
window.dbgSonTon=function(){const P=window.POUCE_JEU;return {t:sonTonSuit._t,pouce:sonTonPouce(),texte:sonTonPouce._x||null,titre:P&&P.E?P.E.titre:null,actif:SON_TON_PB};};
function sonTonSuit(){
  if(!SONV2)return;let t=0;
  try{const el=musicEl;if(SND.music&&el&&!el.paused){const src9=el.src; /* (2026-11-10, passe optimisation) l'adresse du morceau est lue UNE fois par image et la table n'est refouillée que si elle a changé (avant : relue à chaque clé, à chaque image) */
    if(src9){if(src9!==sonTonSuit._src){sonTonSuit._src=src9;sonTonSuit._tb=0;for(const k in SON_TON)if(src9.indexOf(k)>=0){sonTonSuit._tb=SON_TON[k];break;}}t=sonTonSuit._tb;if(FRENM.surm)t+=1;}}
    else if(SND.music){const tp=sonTonPouce();if(tp!=null)t=tp;}}catch(e){} /* (2026-11-07, chasse SON2-N06) un morceau en pause (Pouce bleu joue à sa place) ne transpose plus les effets */
  if(t!==sonTonSuit._t){sonTonSuit._t=t;window.CCSON.ton(t);}
}
const FRUIT_SON={'PÊCHE PLATE':'fruit.peche','BANANE':'fruit.banane','GRENADE':'fruit.grenade','ORANGE':'fruit.orange','MYRTILLE':'fruit.myrtille','PASTÈQUE':'fruit.pasteque',
  /* (2026-10-20, les nouveaux fruits) chacun reprend la bouche d'un fruit voisin : la hauteur monte à chaque fruit d'une rafale (sonFruitSt) — la file sonne comme une gamme */
  'PÊCHE':'fruit.peche','CERISE':'fruit.myrtille','KIWI':'fruit.orange','MANGUE':'fruit.banane','POMME':'fruit.peche','MELON':'fruit.banane','LITCHI':'fruit.myrtille'};
function figSnd(id){ // chaque figure a SA matière, posée sur l'échelle du vol — (2026-10-14, session SON) une figure du catalogue FINIE (`fig_*`, lecteur `?fig=script`) sonne le MAILLON, comme le tour complet d'une figure libre : elle rejouait la vrille de son départ (veqFigure), deux fois le même son par figure
  if(!SONV2){trickPop(chain);return;}
  if(id.indexOf('fig_combo_')===0)return; /* (2026-10-14, session SON) le COMBO a SA signature (sonCombo, appelée par comboNote) : pas le maillon par-dessus */
  let sg=id.indexOf('fig_')===0?FIG_SIGNE[id.slice(4)]:null;if(id==='fig_salto'&&figSnd._sens==='arriere')sg=4; /* (2026-11-12) le SALTO a deux sens, deux signatures : la quinte qui MONTE (devant, 5) · qui RETOMBE (derrière, 4) — `figSnd._sens` posé par figPaye */
  if(sg!=null){sfx('fig.signe',{st:echSt(),var:sg});return;}
  const sm=FIG_MONDE[id];if(typeof sm==='number'){sfx('fig.monde',{st:echSt(),var:sm});return;} /* (2026-10-14, session SON — étape 2) une figure de MONDE (banquise, eau) sonne SA phrase */ /* (2026-10-14, session SON) une figure du CATALOGUE payée sonne SA phrase (fig.signe), plus le maillon commun aux douze */
  sfx(id==='vrille'?'fig.vrille':id==='bump'?'fig.bump':'fig.maillon',{st:echSt()});
  if(id==='vrille'&&spinHalf>=4&&!figSnd._ess){figSnd._ess=1;sfx('fig.essoreuse');} /* (débogage son 2026-09-29) une fois par vol */
}
/* (2026-10-14, session SON) LA SIGNATURE DE CHAQUE FIGURE : la variante de `fig.signe` (atelier-son/recettes.js) de chaque figure du catalogue
   (figures.js). Une figure inventée par le joueur, ou une figure automatique (la toupie de drift), garde le maillon. */
const FIG_SIGNE={tailwhip:1,tonneau:0,toupie:1,shimmy:2,chandelle:3,salto:5,double:6,tirebouchon:7,helico:8,penche:9,rodeo:10,cosmique:11};
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
  return !!sfx(id,Object.assign({force:true},o||{}));};
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
/* ===== LE VROOM DU GARAGE (2026-11-02, Léo : « pour une belle transition entre l'ambiance du ciel et l'ambiance du garage, un bruit de moteur qui fait vroom quand on appuie sur garage, puisque le son est plus fort ») =====
   L'atelier sonne plus fort que le ciel (la nappe de verre, la musique à son niveau) : entrer d'un coup serait une marche. Un moteur qui s'ébroue, ~1,1 s, fait la transition : il MONTE en régime (le « vrr », 46 → 150 Hz en 0,42 s) puis RETOMBE (le « oum »,
   → 64 Hz), un filtre qui s'ouvre avec lui, une trémulation d'amplitude qui suit le régime (les explosions : le moteur « bat »), l'octave grave en dessous, et le souffle de l'échappement. Synthétisé (la banque n'a pas de moteur court : `garage.lacher` dure
   1,7 s et sert au départ de la partie), sur le bus des effets (MASTER : curseur EFFETS, interrupteur SON). Appelé par le bouton GARAGE (bureau : garage-cadrage.js ; mobile : mobile-tactile.js) ; jamais si l'atelier est déjà ouvert. */
function vroomGarage(){
  try{
    if(garageOn||!AC||AC.state!=='running'||!SND.sfx||!MASTER)return;
    const t=AC.currentTime+.01,out=AC.createGain(),tr=AC.createGain(),lp=AC.createBiquadFilter();
    lp.type='lowpass';lp.Q.value=.9;lp.frequency.setValueAtTime(380,t);lp.frequency.exponentialRampToValueAtTime(2600,t+.42);lp.frequency.exponentialRampToValueAtTime(700,t+1.05);
    out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(.15,t+.07);out.gain.setValueAtTime(.15,t+.45); /* .15 : crête mesurée à −10,5 dBFS (avec .2 : −8) */out.gain.exponentialRampToValueAtTime(.0002,t+1.15);
    tr.gain.value=.78;lp.connect(tr);tr.connect(out);out.connect(MASTER); /* tr : la trémulation (gain .56 → 1,0, jamais négatif : pas de pop) */
    for(const dc of [-8,8]){const o=AC.createOscillator();o.type='sawtooth';o.detune.value=dc;
      o.frequency.setValueAtTime(46,t);o.frequency.exponentialRampToValueAtTime(150,t+.42);o.frequency.exponentialRampToValueAtTime(64,t+1.05);o.connect(lp);o.start(t);o.stop(t+1.2);}
    const sub=AC.createOscillator(),sg=AC.createGain();sub.type='sine';sub.frequency.setValueAtTime(23,t);sub.frequency.exponentialRampToValueAtTime(75,t+.42);sub.frequency.exponentialRampToValueAtTime(32,t+1.05);sg.gain.value=.7;sub.connect(sg);sg.connect(lp);sub.start(t);sub.stop(t+1.2);
    const lfo=AC.createOscillator(),lg=AC.createGain();lfo.type='square';lfo.frequency.setValueAtTime(14,t);lfo.frequency.exponentialRampToValueAtTime(48,t+.42);lfo.frequency.exponentialRampToValueAtTime(20,t+1.05);lg.gain.value=.22;lfo.connect(lg);lg.connect(tr.gain);lfo.start(t);lfo.stop(t+1.2);
    const ns=AC.createBufferSource(),nf=AC.createBiquadFilter(),ng=AC.createGain();ns.buffer=noiseBuf(1.3);nf.type='bandpass';nf.Q.value=.8;nf.frequency.setValueAtTime(260,t);nf.frequency.exponentialRampToValueAtTime(1400,t+.42);nf.frequency.exponentialRampToValueAtTime(420,t+1.05);
    ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.06,t+.1);ng.gain.exponentialRampToValueAtTime(.0002,t+1.1);ns.connect(nf);nf.connect(ng);ng.connect(MASTER);ns.start(t);ns.stop(t+1.2);
  }catch(e){}
}
/* ===== LE SON NE FAIT JAMAIS TOMBER LA BOUCLE (2026-11-05, DEBUG-TOTAL : « qu'on puisse faire ce qu'on veut du code sans jamais avoir de problème ») =====
   `setTargetAtTime` LÈVE une TypeError (« non-finite ») sur un NaN ou un Infinity. Une cinquantaine de `stt` par image (boucle-5-sons) suivent
   la vitesse, le régime, la glisse : un seul NaN venu d'en amont (dt énorme au retour d'arrière-plan, une division par une vitesse nulle)
   faisait sauter, À CHAQUE IMAGE, toute la fin de la simulation (HUD, caméra, test de bord, mort) — la caisse figée sans mourir.
   La valeur non finie est refusée ici (le paramètre garde sa valeur) et dite UNE fois en console, préfixe [SON], et dans la boîte noire.
   `sonPanne(nom,…)` sert à toute panne du son : une fois par nom, jamais muette, jamais bloquante. `dbgSonPannes()` : la liste. */
const SON_PANNES={};
function sonPanne(nom,e,x){if(SON_PANNES[nom]){SON_PANNES[nom].n++;return;}SON_PANNES[nom]={n:1,m:String(e&&e.message||e).slice(0,160)};
  try{console.warn('[SON] '+nom,e,x===undefined?'':x);}catch(_){}try{window.__ccNote('son',nom+' · '+SON_PANNES[nom].m,e&&e.stack&&String(e.stack).split('\n')[1]);}catch(_){}}
window.dbgSonPannes=function(){return JSON.parse(JSON.stringify(SON_PANNES));};
function stt(p,v,t,tc){
  if(!AC||AC.state!=='running'||!p)return;
  if(!isFinite(v)||!isFinite(t)||!isFinite(tc)){sonPanne('valeur non finie (stt)','v='+v+' t='+t+' tc='+tc);return;}
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
