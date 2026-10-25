/* ============================================================================
   SYSTÈME MUSICAL — bande-son + analyse temps réel qui fait PULSER le ciel.
   La musique passe par le bus WebAudio (donc mixée/limitée avec tout le reste),
   un AnalyserNode lit son spectre chaque frame → MUSIC_PULSE (énergie lissée) et
   MUSIC_BEAT (transitoire de basse). Le ciel/bloom respirent dessus (musicTick).
   Fondation prête : `playMusic(url,{loop,volume})` accepte tes fichiers.
   Les SFX culture pop se branchent aussi sur `musicGain` (mélange bande-son/SFX).
   ========================================================================== */
let musicEl=null,musicSrc=null,musicGain=null,musicSfxGain=null,musicFilt=null,musicAna=null,musicData=null;
let musicLowShelf=null,musicChorusDelay=null,musicChorusWet=null,musChorusEnv=0; // BASS BOOST + CHORUS au boost
let MUSIC_PULSE=0,MUSIC_BEAT=0,MUSIC_HI=0,musicOn=false,musicBass=0;
const PLANET_BLEU=new THREE.Color(0x6fc0ff); // la teinte de repos du limbe : au calme la Terre reste la Terre
let MUSIC_CHAM=0;                     // phase du CAMÉLÉON : elle n'avance jamais à reculons, elle accélère
let NIVEAU_FX=0;                      // surge visuel de FIN DE NIVEAU (s'éteint tout seul)
const beatFxEl=document.getElementById('beatFx'); // le voile de bord qui flashe sur la grosse caisse
/* ---- LA BANDE-SON (allègement du 18/10, Sacha) --------------------------------------------------------------------------------
   · EN COURSE, POUCE BLEU joue seul (voir PBJ plus bas) ; le ciel, le garage et la boutique ont leur morceau (MENU_MUS, plus bas).
   · L'AUTO-ÉCOLE (la 1re partie d'un joueur neuf) joue PREMIER MATIN, un des lobbys « Chris », calme et à part (2026-10-16, Léo : « la musique du
     niveau d'apprentissage : une musique calme à part ») : elle part DÈS le JOUER (le piqué), continue toute la leçon, et au portail d'après
     s'efface en 1,2 s pendant que Pouce bleu entre (ECOLE.f0).
   · Les musiques de niveau d'avant — la radio (NÉON CASH CAR, CASH CAR VITESSE, ADDICTIVE LOOP), NOITE DE VELOCIDADE, GLASSY PLUCKS, SWAG CASH CAR,
     le CIEL et la VILLE en cinq niveaux, GLISSE au SOLEIL DE JADE, les autres lobbys « Chris » de `?ecole=` — ne jouaient plus que sous un paramètre
     (`?musique=niveaux`, `?ecole=`) : leurs fichiers et ces options sont partis.
   · LA RADIO n'est plus qu'un POOL d'UN morceau : le dernier recours si Pouce bleu ne se charge pas. ⚠ NE PAS LE VIDER : musicStartRun sort tout
     de suite sans pool, et l'auto-école ne partirait pas. Un pool de 1 est SÛR : `musicPickNext` sort par `if(MUSIC_TRACKS.length<=1)return 0`
     AVANT sa boucle `do…while(i===excludeIdx)` — sans ce garde, un pool d'un seul élément tournerait sans fin. Ne pas y toucher. */
const ECOLE_MUS={titre:'PREMIER MATIN',f:'assets/audio/music/lobby/chris-matin.m4a'};
const MUSIC_TRACKS=[ECOLE_MUS];
let musicLieu=null; // le morceau de LIEU qui tient l'antenne (null = la radio) — aujourd'hui, seulement celui de l'auto-école
const ECOLE={pique:false,f0:0,ms:1200,v0:0};
function musicLieuVoulu(){
  const c=LVL.cur;
  return c&&c.id==='nuages'&&c.piste==='tuto'?ECOLE_MUS:null; /* (2026-10-07, audit GRAPHISME) l'AUTO-ÉCOLE (1re partie d'un joueur neuf) joue son morceau à elle */
}
/* appelé à chaque changement de niveau (fin de `newTrack`) : change de morceau SEULEMENT si le lieu
   en réclame un autre que celui qui joue. */
function musicSuitLieu(){
  if(musicMode!=='run')return;
  if(pbjRegne()){const ec9=musicLieu===ECOLE_MUS&&musicOn&&(!VOL_LOCKED||musWaTient());musicLieu=null;ECOLE.pique=false;if(SND.music&&!POUCE_JEU.joue()&&POUCE_JEU.phase!=='charge'){if(ec9){ECOLE.f0=performance.now();ECOLE.v0=musicVolCour;}else stopMusic();pbjDepart(true,false);}return;} /* (2026-10-16) la musique de la leçon s'EFFACE (1,2 s, musicTick) pendant que Pouce bleu entre — plus de coupure nette */ // (15/10) POUCE BLEU continue aux portails : pas de raccord — (soir) au sortir de l'auto-école, CIEL 1 s'arrête et il entre
  const v=musicLieuVoulu();
  if(v===musicLieu&&(musicOn||!SND.music||FRENM.sw))return; // (2026-10-13) …et en en sortant, la radio qu'elle avait fait taire repart
  musicLieu=v;
  if(FRENM.sw){FRENM.src='';return;} // en pleine FRÉNÉSIE : son morceau garde l'antenne — à la sortie, on reprendra sur celui du nouveau lieu
  if(DEPMUS.on&&started&&!gameOver){DEPMUS.f0=performance.now();musicVolCour=0;} // (2026-10-05, « le passage plus smooth ») le morceau du niveau suivant ENTRE en fondu (0,6 s, sous le voile) au lieu de tomber à plein
  if(v){NIVEAU_FX=2.6;musicPlayCurrent();try{lvlBlast();}catch(e){}}
  else{try{musicNext();}catch(e){}}
}
let musicCur=-1; // l'index EN COURS dans MUSIC_TRACKS (-1 = rien encore choisi)
function musicPickNext(excludeIdx){
  if(MUSIC_TRACKS.length<=1)return 0;
  let i;do{i=Math.floor(Math.random()*MUSIC_TRACKS.length);}while(i===excludeIdx);
  return i;
}
/* (2026-10-14, Léo : « le son de la boutique, c'est incroyable ; le ciel et le garage devraient aussi avoir une musique légère — l'inspi des
   Lobby Chris, mais calme ; le ciel très discret, le garage aussi, différentes ambiances ; plusieurs propositions, direct sur le main »)
   LA MUSIQUE DU CIEL ET DU GARAGE (⚠ 15/10 : depuis, UN SEUL morceau du ciel joue aux deux endroits — voir dessous) : au menu, le CIEL (LA CHUTE, l'écran titre) et le GARAGE ont chacun SA musique, tirée au hasard à chaque
   lancement parmi trois (atelier-son/ciel_garage.py, le moteur des Lobby Chris) : NUAGES LENTS · HAUTE ALTITUDE · APESANTEUR (sans batterie)
   et ATELIER · HUILE DE MINUIT · CLÉ DE 12 (le léger filtre d'atelier cuit dedans). Passer de l'un à l'autre : la musique d'avant s'efface,
   celle du lieu arrive en fondu (musicTick, mode menu ; iPhone, volume verrouillé : la bascule est franche). Les niveaux de volume ne changent
   pas (le ciel à MUS_CIEL, le garage au niveau du menu) ; la boutique garde son son. */
/* (2026-10-15, Léo : « les musiques du menu ciel doivent aussi être jouées dans le garage ; au garage c'est juste une version un peu plus forte,
   quand même régulée, parce qu'on est au garage. Mais ça doit être la MÊME musique dans les deux, sinon c'est trop de musiques différentes »)
   UN SEUL MORCEAU AU MENU : tiré au lancement parmi les trois du CIEL ; il joue au ciel et CONTINUE au garage — même lecture, aucune coupure
   (musicMenuUrl rend la même adresse partout : la bascule ciel ↔ garage de musicTick ne se déclenche plus). Au garage il remonte au niveau du
   menu par le fondu ordinaire (~0,5 s, musicVolCour), au ciel il redescend derrière le vent (MUS_CIEL). Les trois du GARAGE (ATELIER, HUILE DE
   MINUIT, CLÉ DE 12) ne jouent plus dans le jeu : ils restent dans la bibliothèque (lobby/menu-donnees.js) et sur le disque. Basses : les trois
   du ciel ont moins de 4 % de leur énergie sous 60 Hz (mesuré le 15/10) — rien à régler. */
const MENU_MUS={ciel:['nuages','altitude','apesanteur'].map(k=>'assets/audio/music/lobby/ciel-'+k+'.m4a'),_abs:{}};
MENU_MUS.tire={ciel:MENU_MUS.ciel[Math.floor(Math.random()*MENU_MUS.ciel.length)]};
MENU_MUS.abs=function(u){return this._abs[u]||(this._abs[u]=(function(){try{return new URL(u,location.href).href;}catch(e){return u;}})());};
/* LA MUSIQUE SUIT JUSQU'À LA BOUTIQUE (2026-10-16, Sacha : « il faut que la musique puisse suivre le joueur du garage à la boutique ») —
   depuis le 13/10 (Léo : « le sound design est terrifiant, change ou enlève ») la boutique faisait TAIRE le lobby (fondu puis pause, voir
   musicTick) et jouait à sa place sa nappe de verre (bqSon). MESURÉ au banc : au garage le morceau joue, en boutique `paused:true`. Désormais
   le MÊME morceau continue, au même niveau qu'au garage, sans couture ; la nappe de la boutique s'efface tant que la musique est allumée (deux
   fonds l'un sur l'autre) et revient si le joueur a coupé la musique. Le néon et le feu de l'atelier restent en sourdine. Le silence de Léo
   reste au choix : `?boutique=muette`. */
const BQ_MUSIQUE=!/[?&]boutique=muette\b/.test(location.search);
function musicMenuUrl(){ // le morceau du menu : le MÊME au ciel de LA CHUTE et au garage (15/10)
  return MENU_MUS.tire.ciel;}
// musicBaseVol .85→1 (2026-09-24, « la musique pas assez forte comparé au moteur ») : on relève le
// NIVEAU ACCORDÉ et pas la valeur par défaut du curseur — celle-ci est sauvegardée chez le joueur
// (`SAVE.d.vol.mus`), la changer n'aurait rien fait pour qui a déjà joué. Le moteur, lui, a reculé
// de 28 % le même jour (voir `ev` dans <<<SON-MOTEUR>>>) : l'écart se creuse des deux côtés.
let musicMode='none',musicBaseVol=1,musicBoostEnv=0;
/* ---- LE MIXAGE : TROIS VOLUMES, ET LA MUSIQUE QUI S'ÉCARTE QUAND LA VOIX PARLE ---------------
   Plainte du user : « le son est trop fort par rapport à la voix, la musique ». Deux causes, et la
   seconde est la vraie.
   (1) le niveau : la bande-son sortait à 85 % quoi qu'il arrive → elle passe à 62 % par défaut ;
   (2) ⚠ ET SURTOUT : l'annonceur DUCKAIT déjà le mix — mais seulement les sons WebAudio (moteur,
       vent, carillons) via `dk`. LA MUSIQUE N'ÉTAIT PAS DEDANS. C'est le bus qui la couvrait qui
       ne s'écartait jamais. Baisser le volume général aurait masqué le défaut sans le corriger :
       on aurait perdu la musique partout pour gagner la voix trois secondes.
   ⚠ `VOL` est un MULTIPLICATEUR sur des niveaux déjà accordés, jamais un remplacement : à 100 %
   chaque famille retrouve exactement le mixage d'origine, et un curseur à fond ne peut donc pas
   faire hurler le jeu. */
const VOL={mus:.7,sfx:1}; // (2026-10-20, Sacha : « mieux mixer les sons du jeu et la musique ») musique un cran plus haut, effets un cran plus bas
const SFX_SOUS_MUS=.58; // (2026-10-03, Léo : « les MONSTRE ne doivent pas cacher la musique — ça vaut pour TOUS les effets sonores ») : tous les effets −3 dB sous la musique (curseur EFFETS inchangé, appliqué par-dessus)
/* (2026-10-14, session SON) SUR IPHONE, LES EFFETS NE RECULENT PLUS SOUS LA MUSIQUE. Le −3 dB de `SFX_SOUS_MUS` a été réglé à l'ordi, où la
   musique joue à `musVol()` × .62-1 (−4 à −8 dB sous son fichier). Sur iPhone le volume d'un <audio> est en lecture seule : la musique y sort
   à 100 % de son fichier — déjà 4 à 8 dB AU-DESSUS du mixage voulu. Lui retirer encore 3 dB aux effets, c'était les noyer deux fois (pièces,
   poses, figures « qu'on n'entend pas »). Là où le volume est verrouillé, les effets gardent donc leur plein : le rapport musique / effets
   retrouve à peu près celui de l'ordi. Même sonde que `VOL_LOCKED` (déclarée plus bas, illisible ici avant sa ligne). */
const SON_VOL_VERROU=(function(){try{const a=new Audio();a.volume=.42;return Math.abs(a.volume-.42)>.01;}catch(e){return false;}})();
function sfxVol(){return VOL.sfx*((SON_VOL_VERROU&&!musWaTient())?1:SFX_SOUS_MUS);} // (2026-10-14, session SON) musique branchée en WebAudio (MUS_WA) : elle est mixée comme à l'ordi, les effets reprennent leur −3 dB
function musVol(){return musicBaseVol*VOL.mus*musTrim();} // le niveau accordé × le curseur, en un seul endroit — (2026-10-14, session SON) × la sonie du morceau
/* (2026-10-14, session SON) LES MORCEAUX À LA MÊME SONIE : une correction en dB (bornée à ±3), appliquée au volume de l'élément (ordi, Android ; sur
   iPhone le volume est verrouillé : rien ne change), pour que les morceaux sonnent aussi fort les uns que les autres. Un morceau absent de la table
   = 0 dB. (18/10 : les morceaux de niveau mesurés — NOITE, SWAG, ADDICTIVE, GLASSY, LVL 1-2, CIEL, VILLE, les lobbys « Chris » de ?ecole= — sont partis.) */
const MUS_SONIE={'chris-matin':-.4};
function musTrim(){const n9=performance.now();if(n9-musTrim._t<400)return musTrim._g;musTrim._t=n9; /* (2026-10-14, session SON) relire `src` (une chaîne neuve à chaque lecture) deux fois par image allouait : on ne la relit que 2,5 fois par seconde */
  const s9=musicEl&&musicEl.src||'';if(s9===musTrim._s)return musTrim._g;musTrim._s=s9;let d9=0;
  for(const k in MUS_SONIE)if(s9.indexOf(k)>=0){d9=MUS_SONIE[k];break;}return musTrim._g=Math.pow(10,d9/20);}
musTrim._s=null;musTrim._g=1;musTrim._t=-1e9;
/* ⚠⚠ LA MUSIQUE v4 — RÉÉCRITE DE ZÉRO (2026-09-25, user : « réécriture complète du code autour de la musique, ça ne
   marche toujours pas »).
   ⚠ POURQUOI L'ANCIENNE CHAÎNE LÂCHAIT. La bande-son passait par Web Audio (`createMediaElementSource` → filtre →
   gain → compresseur → sortie) pour le filtre-mouvement, le ducking et l'analyse du rythme. Puissant, mais TROIS points
   de rupture silencieux, dont chacun suffit à rendre le jeu muet sans la moindre erreur :
     1. sur iPhone, Web Audio suit le bouton SILENCIEUX (catégorie « ambient ») : téléphone en silencieux = zéro musique ;
     2. un AudioContext créé hors d'un toucher naît SUSPENDU, et tout ce qui y passe se tait avec lui ;
     3. un <audio> neuf lancé hors d'un toucher est refusé (politique média d'iOS) — la promesse rejetée était avalée.
   LE PRINCIPE v4 : la musique ne passe PLUS par Web Audio. UN élément <audio>, posé dans la page, qui joue DIRECT vers
   les haut-parleurs — le chemin que tous les navigateurs jouent, iPhone en silencieux compris (et `navigator.audioSession
   ='playback'` quand il existe). Tout le reste devient DÉCORATIF et ne peut plus casser le son :
     · le volume (curseur, menu étouffé, ducking de l'annonceur, souffle du mouvement) passe par `el.volume` — ignoré par
       iOS (volume média verrouillé par le système) : sur iPhone la musique joue simplement à plein, c'est le bouton
       volume du téléphone qui règle ;
     · le tape-stop de fin : `playbackRate` + fondu ;
     · l'analyse du rythme (le ciel qui bat) : une DÉRIVATION `captureStream()` là où elle existe (Chrome, Android), qui
       ne touche jamais la sortie ; ailleurs, un métronome à 120 bpm fait battre le décor.
   ET UN FILET : la musique sait si elle DEVRAIT jouer (`musicVoulue`). Le premier toucher libère le lecteur ; chaque
   toucher suivant la relance si elle s'est tue (refus, interruption, appel, retour d'arrière-plan). */
let musicVoulue=false,musicEnAttente=false,musicVolCible=1,musicVolCour=1,musicAnaEl=null;
const MUSAP={t:0,joue:false,rev:false}; // (2026-10-14, session SON) l'extrait du curseur MUSIQUE : jusqu'à quand (t), l'élément relancé pour lui en pause (joue), le contexte réveillé pour lui (rev) — voir musApercu
/* (2026-10-14, session SON) LA MUSIQUE REPASSE PAR WEBAUDIO — MAIS SEULEMENT LÀ OÙ L'ON TIENT LE RISQUE (Sacha : « le curseur MUSIQUE doit
   marcher sur iPhone »). Sur iPhone `el.volume` est en lecture seule : la musique y sortait à 100 % de son fichier partout (ciel, garage,
   course), le curseur MUSIQUE ne faisait rien, ni fondu ni table de sonie. Brancher l'élément dans le graphe (createMediaElementSource →
   un gain) rend tout ce mixage. ⚠ L'HISTOIRE (« LA MUSIQUE v4 ») : en septembre ce chemin rendait la musique MUETTE — bouton silencieux
   (catégorie « ambient »), contexte né suspendu, lecture refusée hors geste. D'où les quatre gardes :
   · allumé PAR DÉFAUT seulement si le volume est verrouillé (`SON_VOL_VERROU`, la sonde de `VOL_LOCKED`) ET si `navigator.audioSession`
     existe (iOS 17+ : `musicSession` y pose 'playback' quand la musique joue — le bouton silencieux ne coupe plus le WebAudio ; il est
     reposé AVANT le branchement et à chaque `musicJoue`) ET si l'analyseur sait lire des flottants (sinon pas de chien de garde : pas d'essai).
     Ailleurs (ordi, Android, iOS < 17) : éteint, le chemin <audio> d'avant au bit près ;
   · forçable : `?muswa=1` / `?muswa=0` dans l'adresse, ou `localStorage.cc_muswa='1'|'0'` (l'appli de test, sans recompiler) — le
     forçage ne passe jamais outre le volume verrouillé ;
   · le branchement se fait DANS UN GESTE (fin du bus de `initAudio`, ou `musicDeverrouille`) : le contexte peut y être relancé ;
   · LE CHIEN DE GARDE (`musWaGarde`, 2×/s) : 2,5 s où l'élément joue vraiment (pas en pause, pas muet, son temps avance, contexte qui
     tourne, volume voulu > .05) et où le graphe reçoit un zéro EXACT → `localStorage.cc_muswa_ko='1'`, on débranche, l'élément capturé
     quitte la page et un neuf (non capturé) le remplace, au même endroit du morceau — retour DÉFINITIF au chemin <audio>.
   `MUS_WA.br` = branché ; tout ce qui change ailleurs est gardé par `musWaTient()` (faux tant que rien n'est branché). Console : dbgMusWa(). */
/* (2026-10-15, pôle SON ; Léo dit oui aux BASSES RÉGLÉES dans le jeu) MUS_WA PARTOUT OÙ L'ON TIENT LE RISQUE : le réglage des basses
   (musique-bus.js) ne peut passer que par le graphe — la règle 'auto' allume donc MUS_WA aussi sur ORDI et ANDROID (volume libre ; ce qui
   rendait la musique muette en septembre était propre à l'iPhone : bouton silencieux, contexte né suspendu, lecture refusée hors geste). Volume
   libre : l'ÉLÉMENT reste à 1 et le gain du graphe fait tout (curseur, fondus, sonie — sinon le volume compterait deux fois). Le compresseur
   doux, fait pour les haut-parleurs de téléphone, seulement sur les appareils tactiles. L'iPhone SANS audioSession (iOS < 17) reste sur le
   chemin <audio> (le bouton silencieux y couperait le WebAudio sans que le chien de garde l'entende) ; SAFARI SUR MAC aussi (voir `wk` : la
   source se taisait au banc WebKit). Le chien de garde reste le filet. */
const MUS_WA_ON='auto'; // 'auto' = la règle ci-dessus · true / false = forcé dans le code
const BASSES_BRUT=/[?&]basses=brut/.test(location.search); // (2026-10-15) `?basses=brut` : la musique sans le réglage des basses (musique-bus.js), pour comparer
var MUS_WA=(function(){
  let f=MUS_WA_ON,ko=false,aS=false,flt=false;
  try{aS=!!(navigator.audioSession&&'type' in navigator.audioSession);}catch(e){}
  try{flt=typeof AnalyserNode!=='undefined'&&!!AnalyserNode.prototype.getFloatTimeDomainData;}catch(e){}
  try{const m=/[?&]muswa=([01])/.exec(location.search);if(m)f=m[1]==='1';else if(localStorage.cc_muswa==='1')f=true;else if(localStorage.cc_muswa==='0')f=false;}catch(e){}
  try{ko=localStorage.cc_muswa_ko==='1';}catch(e){}
  let wk=false;try{const u=navigator.userAgent||'';wk=/AppleWebKit/.test(u)&&!/Chrome\/|Chromium|Edg\/|Android/.test(u);}catch(e){} // le moteur de Safari (Mac, et tout navigateur d'iPhone)
  if(f==='auto')f=SON_VOL_VERROU?aS:!wk; /* (2026-10-15) volume verrouillé (iPhone) : avec audioSession seulement (iOS 17+, comme avant) ; volume libre :
     PARTOUT SAUF le moteur de Safari — au banc WebKit, la musique branchée s'y TAISAIT au bout de 8 à 15 s (l'élément jouait, la source rendait des
     zéros, sans aucun appel), le chien de garde la condamnait et elle ne repartait qu'au toucher suivant : Safari sur Mac reste sur l'<audio>. */
  let tac=false;try{tac=matchMedia('(pointer:coarse)').matches;}catch(e){}
  return {on:!!(f&&flt&&!ko),ko:ko,force:f,sess:aS,cmpOn:SON_VOL_VERROU||tac,rythme:true,MAX:1.41,bus:null, // (15/10) le compresseur doux (fait pour les haut-parleurs de téléphone) : sur les appareils tactiles seulement
    br:false,el:null,src:null,g:null,cmp:null,e:null,an:null,buf:null,rms:-1,muet:0,tChk:0,tPrec:-1,vu:false,pq:''};})();
/* MAX 1,41 (+3 dB) : la table de sonie (`MUS_SONIE`) monte jusqu'à +3 dB ; à l'ordi `el.volume` plafonne à 1 et l'écrête — c'est une limite
   de l'élément, pas une intention. Le limiteur −1 dBFS commun et le compresseur doux tiennent les crêtes (le compresseur ne sort jamais
   au-dessus de −4,6 dBFS en régime : banc `son/banc/muswa/compresseur.cjs`). */
function musWaTient(){return !!(MUS_WA&&MUS_WA.br);} // (déclarée en fonction, `MUS_WA` en var : sfxVol peut la lire sans zone morte)
function musGraphe(){return musWaTient()||!!window.POUCE_JEU;} /* (15/10, pôle SON) la musique passe par le graphe : l'<audio> branché (MUS_WA) OU POUCE BLEU,
   qui joue chaque course PARTOUT (WebAudio pur) — le bouton SON ne suspend alors jamais le contexte, il ferme l'entrée des effets (musWaSon) */
function musWaReveil(){ // le contexte doit tourner pour qu'on entende la musique (appel, Siri, iOS « interrupted ») — au toucher, avant de relancer l'élément
  if(!musGraphe()||!AC||AC.state==='running'||paused||document.hidden)return;
  try{const p=AC.resume();if(p&&p.catch)p.catch(function(){});}catch(e){}
}
function musWaSon(){ // le bouton SON coupe les EFFETS (et les voix du graphe) par l'entrée du limiteur, jamais par AC.suspend : la musique y passe à côté
  if(!musGraphe()||!AC||!MASTER)return;
  try{const p=MASTER._limIn&&MASTER._limIn.gain;if(p){const t=AC.currentTime;p.cancelScheduledValues(t);p.setTargetAtTime(SND.sfx?.937:0,t,.015);}}catch(e){}
  try{if(paused||document.hidden){if(AC.state==='running')AC.suspend();}else musWaReveil();}catch(e){} // en pause / caché : la musique est déjà en pause, le contexte peut dormir
}
function musWaBranche(){
  const W=MUS_WA;
  if(!W.on||W.br||!AC||!MASTER||!musicEl)return;
  try{musicSession();}catch(e){} // 'playback' AVANT : le bouton silencieux ne doit pas couper ce qu'on branche
  try{
    W.el=musicEl;W.src=AC.createMediaElementSource(musicEl);
    W.g=AC.createGain();W.g.gain.value=(musicEl.paused||musicEl.muted)?0:(VOL_LOCKED?1:Math.max(0,Math.min(W.MAX,musicVolCour))); // branchée en pleine lecture, elle sortait à 100 % du fichier (iPhone) : on part de là, musicTick la ramène au mixage
    try{if(!VOL_LOCKED)musicEl.volume=1;}catch(e){} // (2026-10-15) volume libre (ordi, Android) : l'élément reste à 1, le gain du graphe fait tout (sinon le volume compterait deux fois)
    W.an=AC.createAnalyser();W.an.fftSize=256;W.an.smoothingTimeConstant=.55;W.buf=new Float32Array(W.an.fftSize); // le chien de garde (et le rythme du décor) écoutent AVANT le gain : on juge l'élément, pas le curseur
    W.src.connect(W.g);W.src.connect(W.an);
    let d=W.g;
    /* (2026-10-15, pôle SON ; Léo : « j'aime beaucoup la basse, mais des basses agréables pour un jeu qui dure — ça fatigue dans les écouteurs ;
       régule, ne rien enlever ») LE BUS DES BASSES (assets/audio/musique-bus.js, le même que la bibliothèque) : le très grave tenu de chaque
       morceau calmé (plateau sous 65 Hz, cloche à 110 Hz si besoin ; rien au-dessus de ~120 Hz : le punch et ce qu'en rend un téléphone
       restent) ; en course, le creux de −2 dB vers 280 Hz (la place du moteur) ; le recul sous les signaux (SIG_RECUL). `?basses=brut` = sans. */
    if(window.MUSBUS){W.bus=MUSBUS.cree(AC);W.bus.brut(BASSES_BRUT);W.bus.piste(musicEl.src);d.connect(W.bus.entree);d=W.bus.sortie;}
    /* LE COMPRESSEUR DOUX (−24 dB, 2,5:1, genou 10, 20 ms / 0,4 s) : avec son rattrapage automatique (+6,9 dB, noyau Chrome/WebKit),
       les CREUX des morceaux (sous −24 dBFS) remontent de 6,9 dB, un passage plein (enveloppe vers −8 dBFS) reste à l'unité, les crêtes
       reculent — sur un haut-parleur de téléphone, les intros et les ponts ne disparaissent plus. `MUS_WA.cmpOn=false` = sans. */
    if(W.cmpOn){W.cmp=AC.createDynamicsCompressor();W.cmp.threshold.value=-24;W.cmp.ratio.value=2.5;W.cmp.knee.value=10;W.cmp.attack.value=.02;W.cmp.release.value=.4;d.connect(W.cmp);d=W.cmp;}
    /* Elle rejoint le LIMITEUR commun (−1 dBFS) avec la même compensation que `MASTER._limIn` (.937), mais À CÔTÉ de lui : c'est l'entrée
       `_limIn` que le bouton SON ferme (effets + voix), la musique ne doit jamais se taire parce qu'on a coupé les effets. Jamais MASTER._vol. */
    W.e=AC.createGain();W.e.gain.value=.937;d.connect(W.e);W.e.connect(MASTER._lim||AC.destination);
    W.br=true;
  }catch(e){console.warn('musique WebAudio : branchement refusé',e);if(W.src)musWaCondamne('branchement');else W.on=false;return;}
  if(W.rythme&&!musicAna){musicAna=W.an;musicData=new Uint8Array(W.an.frequencyBinCount);} // (bonus) le décor bat sur la VRAIE musique, plus sur le métronome (iPhone n'a pas captureStream)
  musWaSon();try{volApply();}catch(e){} // les effets retrouvent leur −3 dB sous la musique, comme à l'ordi (voir sfxVol)
}
function musWaCondamne(pq){ // retour DÉFINITIF au chemin <audio> (la prochaine ouverture de l'appli ne réessaiera pas)
  const W=MUS_WA,el=W.el;W.pq=pq;W.ko=true;
  try{localStorage.cc_muswa_ko='1';}catch(e){}
  console.warn('musique WebAudio condamnée ('+pq+') : retour au chemin <audio>');
  for(const n of [W.src,W.g,W.cmp,W.e,W.an,W.bus&&W.bus.sortie])if(n)try{n.disconnect();}catch(e){}
  if(musicAna&&musicAna===W.an){musicAna=null;musicData=null;}
  W.br=false;W.on=false;
  try{if(!musGraphe()&&AC&&MASTER&&MASTER._limIn){const p=MASTER._limIn.gain,t=AC.currentTime;p.cancelScheduledValues(t);p.setValueAtTime(.937,t);p._s9=undefined;}}catch(e){} // le bouton SON reprend son chemin d'avant… ((15/10) sauf avec Pouce bleu : le graphe garde la musique)
  try{if(!musGraphe()&&AC&&!SND.sfx&&AC.state==='running')AC.suspend();}catch(e){}                                                                      // …(contexte suspendu = effets coupés)
  try{volApply();}catch(e){}
  if(!el||el!==musicEl)return;
  // l'élément est capturé pour toujours par le graphe : on en pose un neuf, au même endroit du morceau ; il repart tout de suite si iOS veut bien, sinon au prochain toucher
  const s=el.src,t=el.currentTime||0,lp=el.loop;
  try{el.pause();}catch(e){}try{el.remove();}catch(e){}
  musicEl=null;musicOn=false;const n=musicElGet();n.loop=lp;
  if(s){n.src=s;if(t>0)n.addEventListener('loadedmetadata',function(){try{n.currentTime=t;}catch(e){}},{once:true});}
  if(musicVoulue){musicEnAttente=true;try{musicJoue();}catch(e){}}
}
function musWaGarde(){ // 2 fois par seconde au plus, zéro allocation (tampon créé au branchement)
  const W=MUS_WA;if(!W.br||!W.an)return;
  const now=performance.now();if(now-W.tChk<500)return;
  const dtc=W.tChk?Math.min(1,(now-W.tChk)/1000):0;W.tChk=now;
  const el=musicEl;
  if(!el||el!==W.el||el.paused||el.muted||document.hidden||!AC||AC.state!=='running'||!(musicVolCour>.05)){W.tPrec=-1;return;}
  const ct=el.currentTime,av=W.tPrec>=0&&ct>W.tPrec+.05;W.tPrec=ct;if(!av)return; // un élément qui charge (le temps n'avance pas) n'est pas un élément muet
  try{W.an.getFloatTimeDomainData(W.buf);}catch(e){return;}
  let q=0;const b=W.buf;for(let i=0;i<b.length;i++)q+=b[i]*b[i];W.rms=Math.sqrt(q/b.length);
  if(W.rms>=1e-7){W.muet=0;W.vu=true;return;} // un vrai son remet le compte à zéro : les silences de tête des morceaux ne s'additionnent jamais
  W.muet+=dtc;if(W.muet>=2.5)musWaCondamne('silence');
}
window.dbgMusWa=function(k){ // console : l'état · dbgMusWa('raz') efface la condamnation (au prochain lancement)
  if(k==='raz'){try{delete localStorage.cc_muswa_ko;}catch(e){}return 'cc_muswa_ko effacé : relancer l\'appli';}
  if(k==='recul'){musRecul();return 'recul';} // (15/10) le recul sous les signaux, à la main (banc)
  const W=MUS_WA;let lim=null;try{lim=MASTER&&MASTER._limIn?+MASTER._limIn.gain.value.toFixed(3):null;}catch(e){}
  return {on:W.on,force:W.force,session:W.sess,verrou:SON_VOL_VERROU,ko:W.ko,pq:W.pq,branche:W.br,gain:W.g?+W.g.gain.value.toFixed(3):null,voulu:+musicVolCour.toFixed(3),
    rms:W.rms<0?null:+W.rms.toExponential(2),muet:+W.muet.toFixed(2),entendu:W.vu,ctx:AC?AC.state:null,limIn:lim,bus:W.bus?W.bus.etat():null,
    el:musicEl?{pause:musicEl.paused,muet:musicEl.muted,t:+(musicEl.currentTime||0).toFixed(2),v:+musicEl.volume.toFixed(2)}:null,rythme:!!(musicAna&&musicAna===W.an)};};
/* (2026-10-14, Léo : « la musique se lance seulement quand j'appuie sur le mode garage ; quand on est — et quand on revient — dans le menu
   ciel, un bruit de chute libre doux ») LE LOBBY SE TAIT AU CIEL : `MUS_TAIT` (posé par musicTick en mode menu : le ciel de LA CHUTE ou
   la boutique) — la musique s'efface en fondu puis se met en PAUSE (elle garde sa place), et RIEN ne la relance tant qu'il vaut vrai
   (ni le toucher, ni le retour d'arrière-plan : musicJoue l'ignore en mode menu). Le garage la rallume : elle repart de zéro en fondu. */
let MUS_TAIT=false;const MUS_CIEL=.15; // au ciel, la musique à 15 % de celle du garage (−16 dB), derrière le vent — (même soir, Léo : « vraiment très légère, comme si on l'entendait en tombant ») : .4 → .15, et elle RESPIRE avec le vent (voir musicTick)
const MUSIC_PASSIF={passive:true,capture:true};
function musicElGet(){
  if(!musicEl){
    musicEl=document.createElement('audio');musicEl.id='musique';musicEl.preload='auto';
    musicEl.setAttribute('playsinline','');musicEl.setAttribute('webkit-playsinline','');musicEl.style.display='none';
    document.body.appendChild(musicEl);
    musicEl.addEventListener('ended',function(){if(musicMode==='run'&&!musicLieu)musicNext();}); // la radio enchaîne (les morceaux de LIEU bouclent)
    musicEl.addEventListener('playing',function(){musicOn=true;musicEnAttente=false;musicEl._err=0;musicAnalyse();});
    musicEl.addEventListener('pause',function(){musicOn=false;});
    musicEl.addEventListener('error',function(){if(FRENM.sw){frenMusRate();return;} // le morceau de la TRIADE manque : on repart sur la radio, surmultipliée
      console.warn('musique : fichier illisible',musicEl.currentSrc||musicEl.src);
      // (2026-10-12, passe qualité) HORS LIGNE (web), aucun morceau ne charge : la radio réessayait toutes les 400 ms SANS FIN (et chaque
      // essai faisait flasher le ciel). Un tour complet de la radio sans rien jouer = on s'arrête ; le prochain `playing` remet le compte à 0.
      if(musicMode==='run'&&!musicLieu&&(musicEl._err=(musicEl._err|0)+1)<=MUSIC_TRACKS.length)setTimeout(musicNext,400);});
  }
  return musicEl;
}
function musicPremier(){return (MUSIC_TRACKS[0]||{}).f;} // le morceau de repli du menu
/* (2026-09-28) 'playback' SEULEMENT SI LA MUSIQUE JOUE. Sur iOS 17+, une session 'playback' COUPE l'appli audio du joueur : celui
   qui éteint notre MUSIQUE pour écouter son Spotify se le faisait couper par le jeu à chaque toucher. MUSIQUE coupée → 'ambient'
   (les effets se mêlent à sa musique, et suivent le bouton silencieux comme n'importe quel jeu). Rappelé à chaque bascule MUSIQUE. */
function musicSession(){try{const s9=navigator.audioSession,v9=SND.music?'playback':'ambient';if(s9&&s9.type!==v9)s9.type=v9;}catch(e){}}
function musicJoue(){ // lance (ou relance) la lecture — un refus n'est jamais perdu : le prochain toucher réessaie
  if(!SND.music||!musicVoulue||paused)return;
  if(MUS_TAIT&&musicMode==='menu')return; // (2026-10-14) à la boutique le lobby se tait — et au ciel là où son volume ne se règle pas (iPhone sans MUS_WA) : voir MUS_TAIT dans musicTick
  // ⚠ PAS de garde `document.hidden` ici : certaines WebViews se disent « cachées » au démarrage — la musique ne partirait jamais
  /* (2026-10-12, passe qualité) …SAUF une fois la page VUE visible (`_vu`, posé au retour visible et à chaque toucher) : trois minuteries
     (musicMenu 1,4 s après la mort, la fin de l'intro, le départ d'un REJOUER) relançaient la musique APRÈS le passage en arrière-plan —
     elle jouait écran verrouillé jusqu'au retour. On la met en attente : le retour visible la relance (ci-dessous). */
  if(document.hidden&&musicJoue._vu){musicEnAttente=true;return;}
  const el=musicElGet();musicSession();
  try{el.volume=(musWaTient()&&!VOL_LOCKED)?1:Math.max(0,Math.min(1,musicVolCour));}catch(e){} // (15/10) branchée : l'élément à 1, le gain du graphe règle
  if(musWaTient()){musWaReveil();try{const p9=MUS_WA.g.gain,t9=AC.currentTime;p9.cancelScheduledValues(t9);p9.setValueAtTime(Math.max(0,Math.min(MUS_WA.MAX,musicVolCour)),t9);p9._s9=undefined;}catch(e){}} // (2026-10-14, session SON) branchée : le contexte d'abord, et le gain au niveau voulu AVANT de jouer (un fondu d'entrée part de 0, pas du niveau d'avant la pause)
  if(el.muted)el.muted=false; // (2026-10-05) on VEUT la musique : jamais muette (le déverrouillage peut l'avoir laissée muette, voir musicDeverrouille)
  const p=el.play();
  if(p&&p.catch)p.catch(function(){musicOn=false;musicEnAttente=true;});
}
function musicDeverrouille(){ // appelé à CHAQUE toucher/touche (en capture) : le 1er libère le lecteur, les suivants relancent si besoin
  musicJoue._vu=1; // un toucher : la page est à l'écran (voir la garde de musicJoue)
  const el=musicElGet();musicSession();
  if(MUS_WA.on){try{musWaBranche();musWaReveil();}catch(e){}} // (2026-10-14, session SON) dans le geste : brancher la musique au graphe, relancer un contexte « interrupted » (appel, Siri) avant l'élément
  if(!musicDeverrouille._ok){musicDeverrouille._ok=true;
    if(!el.src)el.src=musicMenuUrl()||musicPremier();           // le morceau de l'ACCUEIL se charge dès le 1er toucher : aucun blanc au départ — ⚠ (Léo, 2026-09-27) celui du 1er niveau s'entendait une seconde avant l'intro
    if(!musicVoulue){el.muted=true;const p=el.play();       // lancé une fois, en silence, PENDANT le geste : l'élément est libre
      /* (2026-10-05, Léo : « une musique qui commence très fort au début ») le son ne se ROUVRE qu'une fois l'arrêt CONSTATÉ : rouvert
         dans la même image que pause(), un lecteur lent à s'arrêter (téléphone, réseau lent : la lecture muette démarre parfois en pleine
         intro) pouvait laisser filer le morceau à plein volume. Si le menu le réclame entre-temps (musicVoulue), il se rouvre tout de suite. */
      const fin=function(){if(musicVoulue){el.muted=false;return;}try{el.pause();}catch(e){}
        (function ouvre(k){setTimeout(function(){if(musicVoulue||el.paused){el.muted=false;return;}try{el.pause();}catch(e){}if(k<6)ouvre(k+1);},80);})(0);}; // (k ≥ 6 : il reste MUET — musicJoue le rouvrira)
      if(p&&p.then)p.then(fin,function(){el.muted=false;musicDeverrouille._ok=false;});else fin();
      return;}
  }
  if(musicVoulue&&SND.music&&(el.paused||musicEnAttente))musicJoue();
}
['pointerdown','touchend','keydown'].forEach(function(ev){addEventListener(ev,function(){try{musicDeverrouille();}catch(e){}},MUSIC_PASSIF);});
// l'arrière-plan : on se tait, et on reprend au retour si la musique devait jouer
document.addEventListener('visibilitychange',function(){try{
  if(document.hidden){if(musicEl&&!musicEl.paused)musicEl.pause();}
  else{musicJoue._vu=1;if(musicVoulue&&!paused)musicJoue();}}catch(e){}});
/* L'ANALYSE DU RYTHME (le ciel qui bat) — une DÉRIVATION, jamais sur le chemin du son. `captureStream()` (Chrome,
   Edge, Android) rend une copie du flux : l'élément continue de jouer normalement. ⚠ PAS `mozCaptureStream` : sous
   Firefox il COUPE la sortie de l'élément. Reconstruite à chaque `playing` (un changement de source change la piste). */
function musicAnalyse(){
  try{
    if(!AC||!musicEl||typeof musicEl.captureStream!=='function')return;
    const st=musicEl.captureStream();if(!st||!st.getAudioTracks().length)return;
    if(musicAnaEl){try{musicAnaEl.disconnect();musicAnaEl.mediaStream.getTracks().forEach(function(k){k.stop();});}catch(e){}} // (2026-09-26) chaque `playing` recréait un flux : les anciens ne s'arrêtaient jamais
    musicAnaEl=AC.createMediaStreamSource(st);
    if(!musicAna){musicAna=AC.createAnalyser();musicAna.fftSize=256;musicAna.smoothingTimeConstant=.55;musicData=new Uint8Array(musicAna.frequencyBinCount);}
    musicAnaEl.connect(musicAna); // l'analyseur n'a pas de sortie : rien de ce qui passe ici ne s'entend
    if(DIST.on){distPrete();if(DIST.in)musicAnaEl.connect(DIST.in);} // (2026-10-03) …et la DISTORSION DU BOOST (sa sortie à elle s'entend, voir plus haut) — (2026-10-07, audit GRAPHISME) seulement si elle est ALLUMÉE : coupée, son sur-échantillonnage 4x tournait sur la musique pour rien
  }catch(e){}
}
/* LA DISTORSION DU BOOST (2026-10-03, Léo : « au lieu de modifier la vitesse — ça fait bizarre, ça coupe — fabrique un effet de
   distorsion design, agréable, qui donne envie de booster non-stop ; léger quand tu es à la vitesse du boost, ça doit bien se ressentir »).
   ⚠ La musique NE PASSE TOUJOURS PAS par Web Audio (voir « LA MUSIQUE v4 » : c'est ce qui la rendait muette sur iPhone). On part de
   la COPIE du son que l'analyse du rythme tire déjà (`captureStream`, `musicAnaEl`) : elle traverse une saturation à lampe et s'ajoute
   PAR-DESSUS la musique, qui continue de jouer telle quelle. Rien ne peut donc couper la musique : au pire, l'effet ne s'entend pas.
   (Là où `captureStream` n'existe pas — iPhone, Safari — il n'y a pas d'effet, et rien ne change.)
   LE SON : passe-haut 140 Hz → attaque (le « drive ») → saturation douce et asymétrique (des harmoniques paires, chaudes, comme une
   lampe ou une bande qu'on pousse) → passe-bas 6 kHz → un peu de présence à 2,5 kHz. En boost, la musique d'origine recule de −2 dB
   pendant que sa copie saturée monte : on a l'impression que LE MORCEAU LUI-MÊME CHAUFFE. Un petit éclat à l'allumage de la nitro.
   LE DOSAGE : nitro = plein · plaque turbo = 60 % · simple vitesse de boost (flowVitN ≥ 1,15 → 1,35) = jusqu'à 35 %, « léger ».
   Montée 80 ms, retombée 0,5 s. Console : `dbgDisto()` (état) · `dbgDisto(0|1)` coupe / rallume. */
const DIST={on:false,in:null,wet:null,env:0,nitroAv:false}; // (2026-10-03, Léo : « il reste une partie du son très dérangeante, forte, floue, qui monte — n'efface pas les bonnes rythmiques ») : la DISTORSION du boost est COUPÉE (la copie saturée qui gonflait à l'appui) ; la phrase du boost reste. `dbgDisto(1)` la rallume pour comparer.
function distPrete(){
  if(DIST.in||!AC)return;
  try{
    const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=140;
    const drive=AC.createGain();drive.gain.value=3.2;
    const sat=AC.createWaveShaper();const n=2048,c=new Float32Array(n);
    for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(1.6*x+.25*x*x)/Math.tanh(1.85);} // asymétrique : des harmoniques paires (le grain chaud)
    sat.curve=c;sat.oversample='4x';
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6000;lp.Q.value=.6;
    const pr=AC.createBiquadFilter();pr.type='peaking';pr.frequency.value=2500;pr.Q.value=.9;pr.gain.value=3;
    const wet=AC.createGain();wet.gain.value=0;
    hp.connect(drive);drive.connect(sat);sat.connect(lp);lp.connect(pr);pr.connect(wet);wet.connect(AC.destination);
    DIST.in=hp;DIST.wet=wet;
  }catch(e){DIST.in=null;}
}
function distTick(dt){
  if(!DIST.in||!AC)return;
  let c=0;
  if(startBoostT>0)DIST.dep=1.2; // (2026-10-03, Léo : « le boost automatique du début joue encore de la musique ») : le départ n'est pas un boost du joueur — rien pendant, ni 1,2 s après (le temps que l'élan retombe)
  else if(DIST.dep>0)DIST.dep-=dt;
  if(DIST.on&&!(DIST.dep>0)&&musicMode==='run'&&running&&!gameOver&&!paused&&musicEl&&!musicEl.paused){
    const v9=flowVitN();c=Math.max(nitroOn?1:0,Math.min(1,boost)*.6,Math.max(0,Math.min(1,(v9-1.15)/.2))*.35);
  }
  if(nitroOn&&!DIST.nitroAv&&c>0)DIST.env=Math.max(DIST.env,1.25);   // l'éclat de l'allumage
  DIST.nitroAv=nitroOn;
  DIST.env+=(c-DIST.env)*Math.min(1,dt/(c>DIST.env?.08:.5));
  const cible=Math.max(0,DIST.env)*.85*musVol();
  if(Math.abs((DIST._g||0)-cible)>.002){DIST._g=cible;try{DIST.wet.gain.setTargetAtTime(cible,AC.currentTime,.03);}catch(e){}}
}
function playMusic(url,opt){opt=opt||{};
  const el=musicElGet();
  let abs=url;try{abs=new URL(url,location.href).href;}catch(e){}
  const meme=el.src===abs;
  el.loop=opt.loop!==false;
  if(!meme)el.src=url;                                       // on CHANGE de source : jamais d'élément neuf (il serait verrouillé)
  if(musWaTient()&&MUS_WA.bus)MUS_WA.bus.piste(url); // (2026-10-15) les basses de CE morceau (musique-bus.js)
  else if(!opt.garde){try{el.currentTime=0;}catch(e){}}      // même morceau : du début… sauf s'il faut le GARDER (menu → partie)
  if(musicStop._iv){clearInterval(musicStop._iv);musicStop._iv=0;} // (2026-09-30) un tape-stop encore en cours ne rattrape plus le morceau qu'on relance (REJOUER rapide)
  musicBandeNette(el); // …et la bande repart à SA vitesse et SA hauteur (le tape-stop coupé en route la laissait sans `preservesPitch`)
  if(opt.volume!=null){musicVolCible=opt.volume;if(!meme||el.paused)musicVolCour=opt.volume;}
  musicVoulue=true;
  if(el.paused||!meme)musicJoue();
  return el;
}
function stopMusic(){musicVoulue=false;if(musicEl){try{musicEl.pause();}catch(e){}}musicOn=false;}
// ---- LE GESTIONNAIRE : menu étouffé → partie (même morceau, qui s'ouvre) → radio → tape-stop en fin ----
/* LE DÉPART EN MUSIQUE (2026-10-04, Léo : « harmonise le début de partie et le début de la musique, c'est un peu violent »). AVANT, à la
   sortie du nuage, tout tombait dans la MÊME image : le lobby coupé net et la musique de course qui bondissait à 60 % en 0,15 s.
   · le PIQUÉ de JOUER : la musique du lobby S'EFFACE (musicTick, mode menu : × 1 − t/1,5) ; au REJOUER, sous le fondu au noir (`sort`) ;
   · la COURSE : sa musique part TOUT DE SUITE, pendant le boost offert, en fondu en S de `fondu` s (musicTick, `f0`).
   ⚠ (même jour, Léo : « enlève le bruit de transition, le boost de la voiture AVANT la musique ; la musique doit commencer PENDANT que la
   voiture booste, pour tous les niveaux ») : le son de transition `depart.envol` (1,55 s de montée AVANT la musique) est RETIRÉ — la
   musique n'attend plus rien. NE PAS remettre de son ni de délai entre le départ et la musique.
   ⚠ iPhone : le volume d'un <audio> y est en lecture seule (VOL_LOCKED) — ni fondu du lobby ni fondu d'entrée. `DEPMUS.on=false` = avant. */
const DEPMUS={on:true,fondu:.6,f0:-1,sort:0}; // sort : l'instant du REJOUER (le lobby de l'écran de mort s'efface sous le fondu au noir)
/* (2026-10-15 soir, Léo : « quand je vais dans les réglages et que je gère la musique, ça fait bugger la musique du jeu ») MUSIQUE RALLUMÉE PENDANT
   LA PAUSE : la musique de course ATTEND LA REPRISE. Mesuré au banc (iPhone simulé) : couper puis rallumer MUSIQUE dans la pause relançait Pouce
   bleu TOUT DE SUITE — le générateur réveille le contexte audio (ctx.resume) — et un AUTRE morceau jouait par-dessus le jeu figé, à −15 dB. Désormais
   `att` est posé par musBascule et musicTick relance le MÊME morceau dès que la pause se lève (reprise : meme). Effacé au départ et à la fin. */
const MUSREP={att:false};
/* (2026-10-15, pôle SON ; Léo, choix cochés) POUCE BLEU EN COURSE — À CHAQUE PLAY, UN morceau de Pouce bleu (la bibliothèque) tiré au hasard
   joue TOUTE la course en suivant le moteur (1 → 30), sans doublon d'une course à l'autre (assets/audio/pouce-bleu-jeu.js, `POUCE_JEU`). Il entre
   au JOUER : son INTRO (le morceau au moteur 1, derrière un filtre qui s'ouvre sur 2 mesures de son tempo) couvre le piqué pendant que le lobby
   s'efface ; il CONTINUE aux portails (plus de raccord) ; il s'éteint à la mort (fondu court) et à la fin. Les musiques des niveaux (la radio,
   GLISSE au SOLEIL DE JADE) ne jouent plus en course (18/10 : elles sont parties). (15/10, Léo, confirmé : « en course, SEULEMENT
   Pouce bleu ») PARTOUT — le morceau est du WebAudio pur, il ne dépend pas de MUS_WA (musGraphe : le bouton SON n'endort plus le contexte) ;
   jamais une autre musique en course : ni les niveaux, ni la radio, ni GLISSE — sauf la FRÉNÉSIE, comme avant (soir, Léo : « la frénésie doit rester ») :
   quand SON morceau joue, Pouce bleu s'efface puis revient — et l'AUTO-ÉCOLE, qui garde sa musique (pbjTuto) ;
   un morceau qui ne part pas → un autre (3 essais), sinon la course reste sans musique. Le ciel, le garage, la boutique gardent la leur. Console : dbgPouce(). */
/* LE NIVEAU (mesuré en course, musique seule, à la sortie du jeu) : la radio tient −21 dB ; les musiques du générateur MONTENT de ~−24 dB
   (moteur 1) à ~−12 dB (moteur 30) — LA GRANDE MONTÉE de Léo, gardée (jamais de régleur de niveau). −4 dB : au niveau de la radio vers le
   moteur 10, 5 dB au-dessus au 30e (≈ −16), sans couvrir les effets. */
const PBJ_NIV=.39;
/* (2026-10-16, Léo : « le problème de la musique au JOUER » — choix cochés : « elle change en route » ET « parfois rien ne joue ») LE PLANCHER DU
   DÉPART. MESURÉ au banc (Chrome muet, sortie enregistrée, effets coupés) : au JOUER le morceau tiré entre au MOTEUR 1, et au moteur 1 les
   morceaux du générateur sortent à −42/−50 dB RMS (FEU DE LUXE, NÉNUPHARS VELOURS…) — 20 dB SOUS les effets de la course (−20) : le lobby
   s'efface pendant le piqué, et la course démarre sans musique audible pendant des dizaines de secondes, jusqu'à ce que le moteur monte.
   Le plancher : un analyseur écoute le morceau AVANT son niveau ; tant qu’il sort trop bas, on le relève (+11 dB au plus, cible −29 dB) — mais seulement en
   BAS de la montée : plein jusqu'au moteur 3, éteint au moteur 12. Au-dessus, LA GRANDE MONTÉE de Léo est intacte (pas un régleur de niveau :
   on ne touche jamais le haut). Un silence (entre deux parties) ne fait pas monter le relevé. `?depart=0` = sans (A/B) ; dbgPouce().plancher. */
const PBJ_PL={on:!/[?&]depart=0\b/.test(location.search),cible:-29,max:11,an:null,buf:null,ch:null,p:-1,k:1,t:0,db:0};
function pbjPlancher(dt,base,tier){const P=PBJ_PL;
  if(!P.on||!AC||!window.POUCE_JEU)return 1;
  const ch=POUCE_JEU.ch;if(!ch||!ch.f)return 1;
  try{if(!P.an){P.an=AC.createAnalyser();P.an.fftSize=2048;P.buf=new Float32Array(2048);}
    if(P.ch!==ch){if(P.ch&&P.ch.f)try{P.ch.f.disconnect(P.an);}catch(e){}P.ch=ch;ch.f.connect(P.an);P.p=-1;P.ps=-1;P.pk=0;}}catch(e){return P.k;}
  P.t-=dt;if(P.t<=0){P.t=.1;try{P.an.getFloatTimeDomainData(P.buf);let s=0,m=0;const B=P.buf;for(let i=0;i<B.length;i++){const v=B[i];s+=v*v;if(v>m)m=v;else if(-v>m)m=-v;}const pw=s/B.length;
    P.pk=Math.max(m,(P.pk||0)*.75); // la crête : tenue ~0,5 s (une grosse caisse par temps la garde en mémoire)
    if(pw>1e-7){P.p=P.p<0?pw:P.p+(pw-P.p)*.08;P.ps=P.ps>0?P.ps+(pw-P.ps)*.35:pw;}}catch(e){}} // ~1,3 s de mémoire (et ~0,3 s pour le garde-fou) ; le silence (sous −70 dB) ne compte pas
  const fade=tier<=3?1:Math.max(0,1-(tier-3)/9);
  /* (2026-10-17, Léo : « ça explose… ça pourrait détruire les oreilles ») LE PLANCHER NE SURCHAUFFE PLUS. Il relevait le morceau sur ~1,3 s
     de mémoire et ne relâchait qu'en 1,2 s : quand le morceau repartait FORT (le palier d'après, la basse qui revient après un passage
     calme), les +7 à +11 dB restaient posés 2 à 4 s sur une musique déjà pleine — MESURÉ (PLUIE D'ARGENT, moteur 1 → 3) : crête −0,5 dBFS,
     +10 dB d'un coup ; et la grosse caisse de certains paliers sort ~18 dB au-dessus du reste du morceau : relevée, chaque coup tapait le
     limiteur. Deux garde-fous : la dernière ~0,3 s jamais à plus de 6 dB au-dessus de la cible, et JAMAIS une crête de la musique relevée
     au-dessus de −6 dB ; quand il faut BAISSER, ça baisse en 0,1 s (monter reste lent, comme avant). Un départ calme (sans crête) est
     relevé comme avant. */
  let db=0;if(P.p>0&&base>1e-4){const lb=20*Math.log10(base),sortie=10*Math.log10(P.p)+lb,court=10*Math.log10(P.ps>0?P.ps:P.p)+lb,crete=P.pk>1e-5?20*Math.log10(P.pk)+lb:-99;db=Math.max(0,Math.min(P.max,P.cible-sortie,P.cible+6-court,-6-crete))*fade;}
  P.db+=(db-P.db)*(1-Math.exp(-dt/(db<P.db?.1:1.2)));P.k=Math.pow(10,P.db/20);return P.k;}
let PBJ_KO=0,PBJ_ESSAI=0; // (15/10) un morceau n'a pas pu partir (réseau, fichier) : un AUTRE est tiré (3 essais) ; après, la course reste sans musique — chaque JOUER réessaie
function pbjTuto(){return (typeof TUTO!=='undefined'&&!!TUTO.on)||!!(LVL.cur&&LVL.cur.piste==='tuto');} /* (15/10 soir, Léo : « remets le premier son du test, le premier son
   dans le ciel pour ceux qui jouent pour la première fois ») L'AUTO-ÉCOLE (le permis) joue sa musique, comme avant (musicLieuVoulu) ; Pouce bleu prend la suite au portail d'après */
function pbjRegne(){return !!window.POUCE_JEU&&!pbjTuto();} // Pouce bleu a l'antenne des courses : aucune autre musique n'y joue (sauf la frénésie, voir frenMus)
function pbjActif(){return pbjRegne()&&!PBJ_KO&&!!AC&&!!MASTER&&!!MASTER._lim;}
function pbjLance(vite,meme){if(!pbjActif()||!SND.music)return;
  try{const p=POUCE_JEU.depart(AC,MASTER._lim,{brut:BASSES_BRUT,vite:!!vite,meme:!!meme});
    if(p&&p.then)p.then(function(E){const f=POUCE_JEU.phase;if(E){PBJ_ESSAI=0;return;}if(f!=='erreur'&&f!=='vide')return; // (annulé par un autre départ ou une fin : rien)
      console.warn('Pouce bleu : '+(POUCE_JEU.err||'liste vide'));
      if(f==='erreur'&&++PBJ_ESSAI<3){pbjLance(vite||musicMode==='run',false);return;} // un autre morceau (le raté est compté comme joué)
      PBJ_KO=1;});}catch(e){}}
function pbjDepart(vite,meme){if(!vite&&!meme){PBJ_KO=0;PBJ_ESSAI=0;if(pbjTuto()){try{ecoleMusPique();}catch(e){}return;}}pbjLance(vite,meme);} // (sans argument = un JOUER : on réessaie) — (2026-10-16) le JOUER de la LEÇON lance la musique de la leçon
function ecoleMusPique(){ // (2026-10-16) le JOUER de la leçon : SA musique part pendant le piqué, en fondu (DEPMUS), et la course la GARDE (musicStartRun)
  if(!SND.music)return;
  if(window.POUCE_JEU&&POUCE_JEU.phase!=='repos')try{POUCE_JEU.fin(true);}catch(e){}
  musicMode='run';musicLieu=ECOLE_MUS;NIVEAU_FX=0;ECOLE.f0=0;
  if(DEPMUS.on){DEPMUS.f0=performance.now();musicVolCour=0;}
  ECOLE.pique=true;musicPlayCurrent();}
/* (2026-10-24, Léo, sur une vidéo de course : « la musique de niveau est bizarre — elle prend beaucoup de temps à commencer, on dirait pas de la musique »)
   LE DÉPART À UN MOTEUR DÉJÀ PLEIN. MESURÉ au banc (musique seule, chaque morceau de Pouce bleu joué comme en course, sortie enregistrée) : aux moteurs 1-4 les
   morceaux du générateur sortent à −40/−45 dB RMS (RUBIS ULTRA −45, CAVALE ULTRA −41) — 20 dB SOUS les effets — et ne jouent qu'une ou deux notes (marimba,
   « riche » 47-81 contre 120-220 plus haut) ; au moteur 5 le même morceau est déjà à −17/−23 dB. Une course démarre au moteur 1 et il faut des dizaines de
   secondes de pièces pour le monter : pendant tout ce temps la musique ne ressemble pas à de la musique (le plancher du départ ne rattrape que +11 dB).
   Le morceau reçoit donc un moteur REMAPPÉ : le moteur 1 du jeu joue le palier PBJ_MIN du morceau, le 30 reste le 30, entre les deux en ligne droite — le
   morceau est complet dès l'intro, et la grande montée jusqu'au 30 est gardée. `?pbjmin=1` = le départ d'avant (A/B) ; dbgPouce().min. */
/* (2026-10-25, Léo : « une musique démarre trop tôt avec trop d'instruments, elle ne suit pas le système ») LE DÉPART PASSE DE 6 À 3 : « calme mais complet » — la montée jusqu'au 30 reste le point fort (6 = déjà le morceau plein dès l'intro). Se juge hors jeu sur test-depart-musique.html ; `?pbjmin=6` = le départ du 24/10, `?pbjmin=1` = celui d'avant. */
const PBJ_MIN=(function(){const m=/[?&]pbjmin=(\d+)/.exec(location.search);return m?Math.max(1,Math.min(29,+m[1])):3;})();
function pbjTier(m){return m<=1?PBJ_MIN:Math.round(PBJ_MIN+(Math.min(30,m)-1)*(30-PBJ_MIN)/29);}
window.pbjTier=pbjTier; // (pouce-bleu-jeu.js, un fichier à part, y lit le moteur de départ du morceau)
let PBJ_FORCE=0; // (banc) dbgPouce('moteur', m) impose le moteur du morceau (0 = celui du jeu)
window.dbgPouce=function(k,v){if(k==='moteur'){PBJ_FORCE=v|0;return PBJ_FORCE;}return window.POUCE_JEU?Object.assign({actif:pbjActif(),force:PBJ_FORCE,min:PBJ_MIN,plancher:{on:PBJ_PL.on,db:Math.round(PBJ_PL.db*10)/10,avant:PBJ_PL.p>0?Math.round(100*Math.log10(PBJ_PL.p))/10:null}},POUCE_JEU.etat()):null;};
function musicStartRun(depart,reprise){ // au début d'une partie (start / resetGame : depart = vrai) — et quand on rallume la MUSIQUE en course · reprise : la seconde chance (la course continue)
  MUSREP.att=false;DEPMUS.f0=-1;DEPMUS.sort=0;
  if(SND.music&&pbjRegne()){ // POUCE BLEU : le morceau tiré au JOUER passe de l'intro à la course (sinon il part tout de suite, intro courte)
    musicMode='run';NIVEAU_FX=0;musicLieu=null;stopMusic();
    if(POUCE_JEU.joue())POUCE_JEU.course();else pbjDepart(true,!!reprise);
    LVLFX.k=0;LVLFX.spin=0;LVLFX.flip=LVLFX.flipTo=0;LVLFX.dir=1;
    BCLK.ph=0;BCLK.n=0;BCLK.conf=0;BCLK.miss=0;BCLK.last=BCLK.t-9;BCLK.per=.5;BCLK.force=0;
    try{lvlBlast();}catch(e){}
    return;}
  if(window.POUCE_JEU&&POUCE_JEU.phase!=='repos')try{POUCE_JEU.fin(true);}catch(e){} // (l'auto-école : un morceau parti au piqué s'efface)
  if(!SND.music||!MUSIC_TRACKS.length)return;
  musicCur=musicPickNext(-1);          // nouvelle partie = une piste tirée au hasard dans la radio…
  musicLieu=musicLieuVoulu();          // …mais le lieu a peut-être sa propre musique (l'auto-école, voir musicLieuVoulu)
  musicMode='run';NIVEAU_FX=0;ECOLE.f0=0;
  const garde9=ECOLE.pique&&musicLieu===ECOLE_MUS&&musicOn&&!!musicEl&&!musicEl.paused;ECOLE.pique=false; // (2026-10-16) la musique de la leçon, partie au piqué, CONTINUE (ni coupure ni second fondu)
  if(depart&&DEPMUS.on&&!garde9){DEPMUS.f0=performance.now();musicVolCour=0;} // (LE DÉPART EN MUSIQUE) elle part tout de suite, en fondu (musicJoue pose le volume 0 avant de lancer)
  musicPlayCurrent();
  /* LE LEVER DE PISTE : le décor repart de zéro et remonte avec le morceau, le métronome est remis à plat. */
  LVLFX.k=0;LVLFX.spin=0;LVLFX.flip=LVLFX.flipTo=0;LVLFX.dir=1;
  BCLK.ph=0;BCLK.n=0;BCLK.conf=0;BCLK.miss=0;BCLK.last=BCLK.t-9;BCLK.per=.5;BCLK.force=0;
  try{lvlBlast();}catch(e){}
}
/* LA MUSIQUE DU MENU : le morceau du 1er niveau, plus bas — au JOUER c'est le MÊME qui continue (`garde`) et monte. */
function musicMenu(){
  if(!SND.music)return;
  musicMode='menu';
  /* (2026-10-05, Léo : « une musique qui commence très fort ») le lobby partait à .8 × le curseur… et musicTick (mode menu) le ramenait à .5
     dans la demi-seconde : un départ FORT puis un creux de −4 dB, à chaque retour au menu. Il part désormais de zéro et monte en ~0,4 s
     jusqu'au niveau du menu (musicTick, inchangé : c'est celui qu'on entend depuis toujours). (iPhone : volume verrouillé, rien ne change.) */
  playMusic(musicMenuUrl()||musicPremier(),{loop:true,volume:0,garde:true});
}
function musicPlayCurrent(){
  if(musicMode==='run'&&pbjRegne()){stopMusic();return;} // (15/10) POUCE BLEU a l'antenne
  const ouv=musicMode==='run'&&!!musicLieu;
  const url=musicMode==='menu'?(musicMenuUrl()||musicPremier()):ouv?musicLieu.f:(MUSIC_TRACKS[musicCur]||{}).f;
  if(!url)return;
  playMusic(url,{loop:musicMode==='menu'||ouv,garde:true}); // menu et LIEU bouclent ; ensuite la radio enchaîne (`ended`)
}
/* ---- L'ENCHAÎNEMENT RADIO : un morceau se termine → un AUTRE au hasard, sans fanfare. ---- */
function musicNext(){
  if(musicMode!=='run'||pbjRegne())return;
  musicCur=musicPickNext(musicCur);
  NIVEAU_FX=2.6;
  BCLK.ph=0;BCLK.n=0;BCLK.conf=0;BCLK.miss=0;BCLK.last=BCLK.t-9;BCLK.per=.5;BCLK.force=0;
  LVLFX.k=0;LVLFX.spin=0;LVLFX.flip=LVLFX.flipTo=0;LVLFX.dir=1;
  const url=(MUSIC_TRACKS[musicCur]||{}).f;if(url)playMusic(url,{loop:false});
  try{lvlBlast();}catch(e){}
}
function musicStop(tape){ // fin de partie : « tape-stop » (la bande ralentit et s'éteint) ou coupure nette
  try{if(window.POUCE_JEU)POUCE_JEU.fin(!!tape);}catch(e){} // (15/10) Pouce bleu s'éteint (la mort : un fondu court)
  musicMode='none';musicVoulue=false;MUSREP.att=false;
  DEPMUS.f0=-1; // (LE DÉPART EN MUSIQUE) un fondu d'entrée en cours s'arrête là
  clearInterval(FRENM.iv);FRENM.on=false;FRENM.sw=false;FRENM.surm=false; // la frénésie ne survit pas à la partie
  const el=musicEl;
  /* (2026-09-30) LA BANDE N'A PLUS QU'UN FIL : l'intervalle du tape-stop (~0,6 s) n'était jamais rangé — un REJOUER rapide (uiGarde
     libère au bout de 320 ms) relançait le morceau, et l'intervalle d'avant continuait de le ralentir, de baisser son volume, puis le
     METTAIT EN PAUSE : la partie repartait muette. Il vit désormais dans `musicStop._iv`, que playMusic coupe ; et un second tape-stop
     (explode lance le premier, endGame redemande le sien 1,8 s plus tard) laisse finir celui qui tourne au lieu de remonter la bande. */
  if(tape&&musicStop._iv&&el&&!el.paused)return;
  if(musicStop._iv){clearInterval(musicStop._iv);musicStop._iv=0;musicBandeNette(el);}
  if(!el||el.paused||!tape){stopMusic();return;}
  let r=Math.min(1,el.playbackRate||1),v=musicVolCour; // (la frénésie a pu laisser la bande surmultipliée, ou déjà à demi étranglée : on part de là)
  try{el.preservesPitch=false;el.webkitPreservesPitch=false;}catch(e){} // (2026-09-26) sans ça, le navigateur GARDE la hauteur : pas de chute de bande
  musicStop._iv=setInterval(function(){r-=.08;v*=.84;
    try{el.playbackRate=Math.max(.12,r);if(!(musWaTient()&&el===MUS_WA.el))el.volume=Math.max(0,Math.min(1,v));}catch(e){}
    if(musWaTient()&&el===MUS_WA.el)try{stt(MUS_WA.g.gain,Math.max(0,Math.min(MUS_WA.MAX,v)),AC.currentTime,.02);}catch(e){} // (2026-10-14, session SON) branchée : le fondu du tape-stop passe par le gain
    if(r<=.12){clearInterval(musicStop._iv);musicStop._iv=0;try{el.pause();}catch(e){}musicBandeNette(el);musicOn=false;}},55);
}
function musicBandeNette(el){if(el)try{el.playbackRate=1;el.preservesPitch=true;el.webkitPreservesPitch=true;}catch(e){}} // la bande à SA vitesse et SA hauteur
