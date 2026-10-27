/* ---- LES CURSEURS : appliquer au graphe · repeindre les deux interfaces · retenir --------------
   ⚠ `volApply` ne touche QUE ce qui n'est pas déjà repiloté chaque image. La musique en course est
   réécrite par `musicTick` à chaque frame (filtre-mouvement + ducking) : y poser une valeur ici
   serait écrasé 16 ms plus tard. On ne pose donc que le bus des EFFETS et le cas MENU, où rien ne
   tourne. Chercher à « tout appliquer » ici, c'est se battre avec la boucle et perdre. */
function volApply(){
  try{if(MASTER&&AC)(MASTER._vol||MASTER).gain.setTargetAtTime(sfxVol(),AC.currentTime,.03);}catch(e){} // rampe courte : un saut de gain CLAQUE
  // (la musique : son volume est réappliqué à chaque image par musicTick — rien à faire ici)
}
function volUI(){ // les deux écrans de réglages affichent le MÊME état — il n'y a qu'une source
  const set=function(sid,vid,rid,val,on){
    const sl=document.getElementById(sid),lb=document.getElementById(vid),rw=document.getElementById(rid);
    const pc=Math.round(val*100);
    if(sl){sl.value=pc;sl.style.setProperty('--v',pc+'%');} // la piste se remplit en or jusqu'au pouce
    if(lb)lb.textContent=pc+'%';
    if(rw)rw.classList.toggle('mute',on===false||pc===0); // coupé ou à zéro : la ligne s'efface, on comprend pourquoi rien ne sort
  };
  set('volMus','volMusV','volRowMus',VOL.mus,SND.music); set('mVolMus','mVolMusV','mVolRowMus',VOL.mus,SND.music);
  set('volSfx','volSfxV','volRowSfx',VOL.sfx,SND.sfx);   set('mVolSfx','mVolSfxV','mVolRowSfx',VOL.sfx,SND.sfx);
}
function volSet(k,pc){
  VOL[k]=Math.min(1,Math.max(0,pc/100));
  SAVE.d.vol[k]=VOL[k];SAVE.mark(); // `mark` et pas `flush` : on glisse le doigt, ça tire 20 valeurs à la seconde
  volApply();volUI();
}
/* (2026-10-14, session SON — BACKLOG P3) LE CURSEUR MUSIQUE PARLE AUSSI. Le curseur EFFETS rend une pièce témoin au relâcher ; le curseur
   MUSIQUE ne rendait rien — or on ne l'entendait pas là où on le règle le plus : au ciel de l'écran titre la musique ne joue qu'à MUS_CIEL
   (≈ 15 % du garage), et dans les réglages ouverts depuis la PAUSE le morceau est arrêté. Au relâcher : 1,4 s de musique au NOUVEAU volume.
   Au ciel, musicTick lève MUS_CIEL le temps de l'extrait ; en pause, le morceau de la course repart en fondu puis se rendort (bloc MUSAP de
   musicTick). Rien si MUSIQUE est coupée ou à 0 (le silence EST la réponse), ni là où le volume ne se règle pas (iPhone sans MUS_WA : un
   extrait à plein mentirait sur le curseur), ni quand la boutique fait taire le lobby. */
function musApercu(){
  if(!SND.music||!(VOL.mus>0)||MUS_TAIT)return;
  if(VOL_LOCKED&&!musWaTient())return;
  MUSAP.t=performance.now()+1400;
  if(!(paused&&started&&!gameOver&&musicVoulue&&musicEl&&musicEl.paused)||document.hidden)return; // hors pause la musique joue déjà : musicTick applique le volume à l'image suivante
  MUSAP.joue=true;
  try{if(musWaTient()&&AC&&AC.state!=='running'){MUSAP.rev=true;const p9=AC.resume();if(p9&&p9.catch)p9.catch(function(){});} // en pause le contexte dort : la musique branchée (MUS_WA) n'y passerait pas
    if(musWaTient()){const g9=MUS_WA.g.gain,t9=AC.currentTime;g9.cancelScheduledValues(t9);g9.setValueAtTime(0,t9);g9._s9=undefined;}else musicEl.volume=0; // l'extrait part de zéro : le fondu d'entrée est dans musicTick
    musicSession();if(musicEl.muted)musicEl.muted=false;
    const p8=musicEl.play();if(p8&&p8.catch)p8.catch(function(){MUSAP.joue=false;});}catch(e){MUSAP.joue=false;}
}
window.dbgMusAp=function(){ // (banc) l'état de la musique autour de l'extrait du curseur : lecture seule
  return {mode:musicMode,ciel:!!(typeof CHUTE!=='undefined'&&CHUTE.on),paused:paused,cible:+musicVolCible.toFixed(3),cour:+musicVolCour.toFixed(3),
    el:musicEl?{p:musicEl.paused,v:+musicEl.volume.toFixed(3),t:+musicEl.currentTime.toFixed(2),src:(musicEl.src||'').split('/').pop()}:null,
    ap:{reste:Math.round(MUSAP.t-performance.now()),joue:MUSAP.joue,rev:MUSAP.rev},ctx:AC&&AC.state,volMus:VOL.mus,reglagesPause:!!window.__setPause};};
(function(){ // un seul câblage pour les six curseurs (trois par interface)
  const bind=function(id,k){const e=document.getElementById(id);if(!e)return;
    const go=function(){volSet(k,+e.value);};
    e.addEventListener('input',go);e.addEventListener('change',function(){go();SAVE.flush();}); // le doigt relâché = on écrit pour de bon
    /* (2026-09-28, console de son) LE CURSEUR PARLE : un cran (ui.curseur, sa hauteur suit la valeur) à chaque dizaine de % franchie
       pendant le glissé ; au relâcher du curseur EFFETS, une pièce témoin jouée au NOUVEAU volume (volSet vient de le poser sur MASTER) */
    e.addEventListener('pointerdown',function(){e._cran=Math.floor(+e.value/10);});
    e.addEventListener('input',function(){try{const c9=Math.floor(+e.value/10);if(e._cran==null)e._cran=c9;else if(c9!==e._cran){e._cran=c9;sfx('ui.curseur',{st:(c9-5)*2});}}catch(x){}});
    e.addEventListener('change',function(){e._cran=null;if(k==='sfx')try{sfx('piece',{t:.06});}catch(x){}else if(k==='mus')try{musApercu();}catch(x){}}); // (2026-10-14, session SON) …et au relâcher du curseur MUSIQUE, un extrait (musApercu)
    e.addEventListener('click',function(ev){ev.stopPropagation();}); // ⚠ sinon le clic remonte à la ligne .setRow et rouvre/bascule autre chose
    e.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
  };
  bind('volMus','mus');bind('volSfx','sfx');
  bind('mVolMus','mus');bind('mVolSfx','sfx');
})();
// ÉTAL : on recharge les réglages boost/fréquence par-dessus les valeurs d'usine
// ⚠ indexés par NOM, pas par position : changer la liste des fruits ne doit PAS coller les réglages
// de l'ancien étal sur les nouveaux (une pêche héritant du boost d'une pomme).
(function(){const fr=SAVE.d.fruits;if(!fr||!fr.length)return;
  for(const d of FRUIT_DEFS){const e=fr.find(z=>z.n===d.n);if(e){d.boost=e.b;d.freq=e.f;}}})();
function saveFruits(){SAVE.d.fruits=FRUIT_DEFS.map(f=>({n:f.n,b:f.boost,f:f.freq}));SAVE.flush();}
const sndBtnEl=document.getElementById('sndBtn'),musBtnEl=document.getElementById('musBtn');
function sndRefresh(){
  sndBtnEl.innerHTML=pxi(SND.sfx?'son':'muet')+' <span class="blabel">'+TR('SON')+'</span>';sndBtnEl.classList.toggle('off',!SND.sfx); // garde le span → masquable en icône seule sur mobile ; TR() sinon le libellé revient au français à chaque bascule, même en anglais
  if(musBtnEl){musBtnEl.innerHTML=pxi('musique')+' <span class="blabel">'+TR('MUS')+'</span>';musBtnEl.classList.toggle('off',!SND.music);} // ⚠ plus de « LVL 1 » (radio à morceau unique par niveau supprimée) : ce libellé est RECONSTRUIT à chaque bascule
  try{if(AC){if(musGraphe())musWaSon();else if(SND.sfx&&!paused)AC.resume();else AC.suspend();}}catch(e){} /* (2026-10-14, session SON) musique branchée : SON ne suspend plus le contexte, il ferme l'entrée des effets (musWaSon) */ // suspend = silence total du moteur audio — ⚠ en PAUSE c'est la reprise qui rallume (sinon le moteur ronronnait sur un jeu figé)
  if(!SND.sfx){deathStop();fxStop();} // ⚠ les sons de mort sont des HTMLAudio : `AC.suspend()` ne les atteint PAS, il faut les couper à la main
  try{volUI();}catch(e){} // les curseurs se grisent quand leur famille est coupée — et c'est ici qu'on l'apprend
}
sndBtnEl.addEventListener('click',function(e){e.stopPropagation();SND.sfx=!SND.sfx;SAVE.d.sfx=SND.sfx;SAVE.flush();sndRefresh();});
function musBascule(){SND.music=!SND.music;SAVE.d.mus=SND.music;SAVE.flush();sndRefresh(); // (2026-10-14, session SON) LA bascule MUSIQUE : le bouton et le retour d'une longue absence (musRetour) passent par elle
  musicSession(); // (2026-09-28) la session audio suit l'interrupteur : 'ambient' rend la main à la musique du joueur, 'playback' la reprend
  if(SND.music){ if(started&&running&&!gameOver){if(paused&&pbjRegne())MUSREP.att=true;else musicStartRun(false,true);} else musicMenu(); } // rallumée : relance selon le contexte — (2026-10-15) en course c'est le MÊME morceau qui revient (reprise), et dans la pause il attend la reprise (MUSREP)
  else musicStop(false); // éteinte : coupe net
}
if(musBtnEl)musBtnEl.addEventListener('click',function(e){e.stopPropagation();musBascule();});
sndRefresh();
// ---------- ÉTAT ----------
const keys={};
let AUTO_GAS=false; // mobile : accélération auto (le doigt sert à tourner et à la nitro) — voir bloc MOBILE en fin de fichier
// LE VOLANT ANALOGIQUE À DEUX AXES. `st` = braquage (X) · `sv` = assiette en vol (Y, + = pouce vers
// le HAUT = PIQUÉ, manche d'avion). Un SEUL point d'entrée dans la physique : le tactile écrit dans
// le même `keys` et le même `steer` que le clavier — aucune équation n'est réécrite pour le doigt.
const TCTL={on:false,pad:false,incl:false,inclV:0,inclN:null,act:false,doigt:false,st:0,sv:0,id:null,ox:0,oy:0,dy:0,dyS:0,x0:0,lx:0,ly:0,ab:0,tr:0,ar:-1,play:null,dead:null,ov:null,airTip:false};
const VOLANT_PX=Math.max(34,Math.min(60,+((/[?&]volant=(\d+)/.exec(location.search)||[])[1])||46)); // (2026-10-14, sensations) la course du pouce pour le braquage plein, en px (54 avant) — `?volant=40` pour en essayer une autre sur le téléphone
const VOL_LIS=21.4,VOL_LIS_D=SENS?33.3:21.4; // (2026-10-14, sensations) le lissage du volant et du manche, en 1/s : 21,4 = τ 47 ms (clavier, tout ou rien) · 33,3 = τ 30 ms quand le POUCE tient le stick (`TCTL.doigt`, voir le volant analogique)
const DRIFT_PX=34.9; // LE GESTE DU DRIFT : pouce tiré de 34,9 px vers le bas (réglé le 28/09 — l'ancien sv < -0,45), lu par la conduite ; pour ENTRER à droite, `TCTL.dyS` (le seuil de l'ARC du pouce, voir stMove) peut le relever
let SANDBOX=false; // BAC À SABLE : la caisse se replace au lieu de mourir — on s'entraîne, rien n'est enregistré
// HAPTIQUE : son propre interrupteur depuis le 2026-09-28 (avant, couper le SON coupait aussi les vibrations)
/* LES VIBRATIONS (2026-09-25) — ⚠ iOS N'A PAS `navigator.vibrate` : sur iPhone, AUCUNE des vibrations du jeu ne
   partait. Sous Capacitor on passe par le Taptic Engine (plugin Haptics) : un motif `navigator.vibrate` est traduit
   en impacts — une impulsion courte = LÉGÈRE, moyenne = MOYENNE, longue = LOURDE, et un motif [on,off,on…] rejoue
   chaque impulsion à son heure. Hors app (navigateur Android), le vibreur d'origine reste la voie. */
function hap(p){
  if(!TCTL.on||!SND.vib)return;const n9=performance.now();let k9;{let m=0;if(Array.isArray(p)){for(let i=0;i<p.length;i+=2)if(+p[i]>m)m=+p[i];}else m=+p||0;k9=m<=12?1:m<=40?2:3;}
  /* (2026-10-14, gameplay · œil · vibrations) UN TIC NE COUPE PAS UN COUP. Hors app (navigateur Android), navigator.vibrate REMPLACE la vibration
     en cours : au banc, une pièce ramassée à la même image qu'un POSÉ LOURD (45, puis 5 à la même ms) ou qu'un motif de récompense
     ([18,50,30,60,40], puis 5) ne laissait sentir que le tic de 5 ms. Un tic léger (classe 1) qui tombe pendant la 1re impulsion d'une
     vibration plus forte se tait. Dans l'app (Taptic), chaque impulsion se joue à part : rien ne change. `?sens=0` : comme avant. */
  if(SENS&&k9===1&&(hap._k||0)>1&&n9-(hap._t||-1e9)<(hap._d||0)&&!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics))return;
  hap._t=n9;hap._k=k9;hap._d=Math.min(60,+(Array.isArray(p)?p[0]:p)||0); // (2026-10-14, gameplay · accord) l'heure et la CLASSE (1 léger · 2 moyen · 3 lourd, comme le Taptic) de la dernière impulsion : le limiteur des détails SENS les lit (sensHap) // (2026-09-28) son interrupteur à lui (réglages › VIBRATIONS) : beaucoup jouent son coupé et gardent le retour haptique
  const H=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
  if(H){try{
    const L=Array.isArray(p)?p:[p];let at=0;
    for(let i=0;i<L.length;i+=2){const d=+L[i]||0,st=d<=12?'LIGHT':d<=40?'MEDIUM':'HEAVY';
      if(at===0)H.impact({style:st});else setTimeout(function(){try{H.impact({style:st});}catch(e){}},at);
      at+=d+(+L[i+1]||0);}
  }catch(e){}return;}
  try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}
}
// LE CLIC D'INTERFACE (2026-09-24) : une note brève et haute + une micro-vibration — chaque bouton RÉPOND, comme une borne d'arcade
const UI_CLIC={nav:'ui.nav',retour:'ui.retour',on:'ui.on',off:'ui.off',onglet:'ui.onglet',refus:'ui.refus',danger:'ui.danger',jouer:'ui.jouer'}; /* (2026-10-16, Sacha : « le bouton jouer doit avoir un bruit de moteur ») jouer : le V8 de JOUER / REJOUER (atelier-son, `ui.jouer`) */ // (2026-09-28) uiClic(rôle) : « j'appuie » ne sonne plus comme « je gagne », et un refus ne sonne plus comme un succès
/* (2026-10-14, session SON) LES APPUIS RAPPROCHÉS CHANTENT : un appui seul garde sa note ; des appuis à moins de 0,6 s l'un de l'autre montent
   doucement la pentatonique du morceau (degrés 0-1-2-3 puis 2-3-2-3…), 0,6 à 1,2 s la tiennent, au-delà de 1,2 s sans appui elle repart d'en bas.
   « retour » redescend d'un degré. Seulement les fiches key:1 (tap, nav, onglet, retour : dans la tonalité, jamais faux). +7 au plus (bases [0]). */
const SON_UI={i:0,t:-9},SON_UI_MEL={'ui.tap':1,'ui.nav':1,'ui.onglet':1,'ui.retour':1};
function sonUiSt(id){const t=performance.now()/1000,g=t-SON_UI.t;SON_UI.t=t;
  if(g>1.2)SON_UI.i=0;else if(id==='ui.retour')SON_UI.i=Math.max(0,(SON_UI.i<4?SON_UI.i:2+(SON_UI.i&1))-1);else if(g<.6&&++SON_UI.i>5)SON_UI.i=4;
  const i=SON_UI.i;return sonPd(i<4?i:2+(i&1));}
function uiClicId(k){const id=UI_CLIC[typeof k==='string'?k:'']||'ui.tap';return id==='ui.jouer'&&SONV2&&!(window.CCSON&&window.CCSON.existe(id))?'ui.tap':id;} // (2026-10-16) une vieille banque en cache sans le moteur : l'appui d'or
function uiClic(k){ if(UI_SON)UI_SON.t=performance.now(); try{ const id9=uiClicId(k),st9=SON_UI_MEL[id9]?sonUiSt(id9):0,f9=function(){if(SONV2)sfx(id9,st9?{st:st9}:id9==='ui.jouer'?{vol:-9}:undefined);else chimeNote(1480,0,.045,.05);}; /* (2026-10-16, LE PIQUÉ QUI NE CRIE PLUS) le V8 de JOUER −9 dB : posé sur le ciel calme, avec le lâcher et le vent, c'était le gros du BOOM du départ (+15 à +20 dB en 200 ms, mesuré) */ // (2026-10-14, session SON) id9/st9 pris À L'APPUI (le son peut partir plus tard, en pause)
  if(SND.sfx&&!paused){ if(AC&&AC.state!=='running')AC.resume().then(f9).catch(function(){}); else f9(); }
  else if(SND.sfx&&paused&&SONV2&&PSON_ON)f9(); /* (2026-10-16) LE CLIC DANS LA PAUSE : il sonne tout de suite (sfx → pauseSon réveille le contexte le temps du clic) — l'attente ci-dessous reste pour ?pauseson=0 */
  else if(SND.sfx&&paused&&SONV2){const r9=k==='retour',t9=performance.now(),j9=uiClic._att=(uiClic._att|0)+1,w9=function(){if(j9!==uiClic._att)return;if((!paused||r9)&&AC&&AC.state==='running')f9();else if(performance.now()-t9<(r9?1200:700))setTimeout(w9,60);};setTimeout(w9,60);} /* (2026-10-14, session SON — relevé par DEBUGGING) UNE seule attente à la fois : la ligne QUITTER puis sa confirmation ouvraient chacune la leur, la sortie de pause les relâchait dans la même image (le son de danger doublé, 14-27 ms d'écart) ; la nouvelle remplace l'ancienne */ /* (QA 2026-09-29) REPRENDRE (« retour ») n'attend plus la fin de la pause : le 3-2-1 la tient ≥ 0,9 s, le clic était perdu — il part dès que le compte a réveillé le son */ /* (débogage son 2026-09-29) en pause : le clic attend (0,7 s au plus) que REPRENDRE réveille le son ; un interrupteur du panneau, lui, reste muet */
  }catch(e){} hap(k==='jouer'?[8,230,30]:8); } /* (2026-10-16) JOUER : le tic de la clé, puis le coup de gaz dans le pouce (≈ 250 ms, avec le VROUUM) */ // (2026-09-26) REPRENDRE : le contexte se réveille en asynchrone — la note attend qu'il tourne // en pause le moteur audio dort : la note s'empilerait et partirait en rafale à la reprise
/* LE FILET DES BOUTONS MUETS (2026-10-16, Sacha : « chaque bouton doit avoir un son lorsqu'on clique dessus dans l'interface, chaque curseur »).
   Les 94 uiClic sont posés à la main, bouton par bouton : ceux qu'on avait oubliés restaient muets. Le filet écoute tout clic d'un VRAI doigt
   (isTrusted), en capture : il retient le bouton touché puis, l'appui traité (setTimeout 0 : après tous les gestionnaires), si AUCUN son n'est
   parti depuis le contact (`UI_SON.t` : uiClic et tout sfx, sauf le micro-tic `ui.appui` et les boucles), il joue le clic du bouton — son rôle
   deviné (`uiFiletRole`) : interrupteur (on/off selon l'état neuf), onglet, retour/fermer, refus (verrouillé : aria-disabled, `.off`), l'or
   (ui.tap), sinon nav ; la vibration vient avec (uiClic). Un bouton qui sonne déjà par son action (équiper, acheter, la carte qui se retourne)
   n'est pas doublé : la règle de la session SON (GSON9) tient. Hors du filet : la course (volant, nitro), le canvas (la caisse qu'on tapote a
   sa tôle), les champs de texte, les curseurs (leur cran, plus bas), un bouton `.arme` (la touche qui attend, voulue muette), `data-muet`.
   `dbgFilet()` : combien de clics le filet a joués, et sur quoi. */
const UI_BTN_SEL='button,a[href],[role="button"],[role="tab"],[role="switch"],[role="menuitem"],[role="option"],[role="checkbox"],[data-m],[data-a],[data-c],[data-go],input[type="checkbox"],input[type="radio"],select,summary,label,'+APPUI_SEL;
function uiFiletRole(el){
  if(el.getAttribute('aria-disabled')==='true'||el.classList.contains('off'))return 'refus';
  const ty=(el.type||'').toLowerCase(),ro=el.getAttribute('role')||'';
  if(ty==='checkbox'||ty==='radio'||ro==='switch'||ro==='checkbox')return (el.checked||el.getAttribute('aria-checked')==='true')?'on':'off';
  if(el.hasAttribute('aria-pressed'))return el.getAttribute('aria-pressed')==='true'?'on':'off';
  const nom=((el.id||'')+' '+(typeof el.className==='string'?el.className:'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase();
  if(ro==='tab'||/onglet|\btab|gtab|ivtab/.test(nom))return 'onglet';
  if(/close|ferme|retour|back|annul|croix|quitter/.test(nom))return 'retour';
  if(/pb-gold/.test(nom))return '';
  return 'nav';
}
addEventListener('pointerdown',function(){UI_SON.pd=performance.now();},{capture:true,passive:true});
addEventListener('click',function(e){
  if(!e.isTrusted||performance.now()<(uiGarde.t||0))return; // un .click() programmé (Entrée, interrupteurs) sonne par le bouton qu'il pousse · le verrou du double-tap avale ce clic-là
  let el=e.target&&e.target.nodeType===1?e.target:(e.target&&e.target.parentElement);
  for(let n=0;el&&n<8&&el!==document.body&&el!==document.documentElement;n++,el=el.parentElement){
    if(el.tagName==='CANVAS'||el.hasAttribute('data-muet'))return;
    if(el.matches(UI_BTN_SEL))break;
    try{if(getComputedStyle(el).cursor==='pointer')break;}catch(x){}}
  if(!el||el===document.body||el===document.documentElement||!el.matches)return;
  if(el.tagName==='LABEL'&&el.control)el=el.control; // l'étiquette d'une case : c'est la case qui bascule (son clic à elle suit, il sonnera on/off)
  if(el.closest('#tNitroZone,#tSteer,#touchCtl,#tNitro,#tLeft,#tRight,[data-muet]')||el.classList.contains('arme'))return;
  if(el.matches('input[type="range"],input[type="text"],input[type="search"],input[type="number"],input[type="email"],input:not([type]),textarea'))return;
  const t0=performance.now(),d0=t0-UI_SON.pd<1500?UI_SON.pd-30:t0-60; // depuis le CONTACT (un bouton qui agit au pointerdown a déjà sonné) ; au clavier, les 60 dernières ms
  setTimeout(function(){if(UI_SON.t>=d0)return;UI_SON.n=(UI_SON.n|0)+1;UI_SON.der=(el.id?'#'+el.id:el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).join('.'):''));uiClic(uiFiletRole(el));},0);
},true);
/* LE CRAN DE TOUS LES CURSEURS (2026-10-16, même demande) : seuls les six curseurs de volume parlaient (`.volS`, câblés plus bas : ui.curseur à
   chaque dizaine de %) ; les autres (le présentoir des fruits, le cadrage de la boutique…) glissaient en silence. Même cran pour tous, à chaque
   dixième de leur course franchi (la hauteur suit la valeur, −10 à +8 demi-tons) — un tap qui fait sauter le curseur sonne aussi. */
function uiCranG(el){const lo=+el.min||0,hi=el.max===''?100:+el.max;return Math.floor(Math.max(0,Math.min(.999,((+el.value)-lo)/((hi-lo)||1)))*10);}
addEventListener('pointerdown',function(e){const el=e.target;if(el&&el.type==='range'&&!el.classList.contains('volS'))try{el._cranG=uiCranG(el);}catch(x){}},{capture:true,passive:true});
addEventListener('input',function(e){const el=e.target;if(!el||el.type!=='range'||el.classList.contains('volS'))return;
  try{const c9=uiCranG(el);if(el._cranG==null)el._cranG=c9;else if(c9!==el._cranG){el._cranG=c9;sfx('ui.curseur',{st:(c9-5)*2});}}catch(x){}},true);
window.dbgFilet=function(){return{joues:UI_SON.n|0,dernier:UI_SON.der||null,son:Math.round(UI_SON.t),contact:Math.round(UI_SON.pd)};};
window.dbgSens=function(l,n,p){if(l!=null||n!=null||p!=null)sensCoup(l||0,n||0,p||0);return{on:SENS,volant:VOLANT_PX,lissage:TCTL.doigt?VOL_LIS_D:VOL_LIS,tangage:+SCOUP.p.toFixed(3),roulis:+carRoll9.toFixed(3),pompe:+susY.toFixed(3)};}; // (2026-10-14, sensations) banc : dbgSens() = l'état · dbgSens(versLat,nez,pompe) = un coup dans la carrosserie
window.dbgTouch=function(){return{relais:TCTL.nHer||0,coupes:TCTL.nAnn||0,on:TCTL.on,pad:TCTL.pad,act:TCTL.act,st:+TCTL.st.toFixed(3),sv:+TCTL.sv.toFixed(3),dy:+(TCTL.dy||0).toFixed(1),seuil:+(driftEnCours?DRIFT_PX:Math.max(DRIFT_PX,TCTL.dyS)).toFixed(1),arc:TCTL.ar<0?null:+TCTL.ar.toFixed(1),exces:+(TCTL.tr>0?TCTL.ab/TCTL.tr*Math.max(0,TCTL.ox-TCTL.x0):0).toFixed(1),drift:driftEnCours,play:TCTL.play,steer:+steer.toFixed(3)};}; // console : l'état du volant tactile (un téléphone ne s'inspecte pas) — `seuil` : les px vers le bas qu'il faut dépasser pour entrer (ou rester) en drift · `arc` : la descente de l'arc du pouce à la butée droite, lue aux glissés · `exces` : ce que le bout de l'arc descend en plus, retiré à la butée
// LE GAZ, exposé : la vignette a besoin de savoir qu'on POUSSE, pas seulement qu'on va vite.
// (posé une fois par frame dans la physique, à côté de son `up` — une seule vérité, pas deux
// façons de relire les touches qui divergeraient le jour où on remappe le clavier)
let gasOn=false;
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(TCTL.on&&!e.repeat&&(e.code==='Space'||e.code==='Enter')&&boomSkip())return;if(e.code==='KeyP'){if(window.__panBascule){if(!e.repeat)window.__panBascule();}else togglePause();} /* (2026-09-28) en coque tactile P ouvre/ferme le panneau ⏸ (voir __panBascule) ; ailleurs, la pause de toujours */if(e.code==='Enter'&&!e.repeat&&started&&gameOver&&pendingScore==null&&!garageOn&&overlay.style.display!=='none'&&!(e.target&&e.target.closest&&e.target.closest('input,textarea'))&&!document.querySelector('#modale.on,#tPanel.open,#spinM.on')){const rp9=document.querySelector('body.touch #mDead.on [data-m="replay"]');if(rp9)rp9.click();else if(!document.body.classList.contains('touch'))playViaGarage();} // (2026-09-25) jamais depuis un champ ou une fenêtre ouverte ; en coque tactile, seul le bouton or de l'écran de mort
  if(e.code==='Space'&&!e.repeat&&started&&!gameOver){ // double-tap NITRO (<280 ms) = BRAQUAGE (e.repeat : une touche MAINTENUE ne compte pas)
    const n9=performance.now();
    // (le double-tap « DÉCOLLAGE » est retiré — voir styleFromBoost)
    lastSpaceT=n9;
  }
  /* ⚠ PLUS DE « N'IMPORTE QUELLE TOUCHE = DÉPART » (2026-09-25, user : « quand j'appuie sur espace dans la boutique ça
     lance une partie »). Le vieil écran-titre démarrait sur toute touche, et ce `start()` était resté branché sur TOUT
     le clavier : dans la boutique, le garage, les réglages, ESPACE sautait la séquence de départ et posait le HUD de
     course sur l'atelier. Désormais seule ENTRÉE, sur l'accueil, joue — par le même bouton que le doigt (auto-école
     comprise). */
  if(e.code==='Enter'&&!e.repeat&&(!started||MENUV.retour)&&!garageOn&&!(typeof stallOn!=='undefined'&&stallOn)&&!document.querySelector('#modale.on,#tPanel.open,#spinM.on')){ // (2026-09-28) la même garde que la branche de mort : la feuille CARRIÈRE, une fenêtre ou le panneau ouverts ne lancent plus la partie derrière · (2026-09-28) l'accueil d'après-mort (MENUV.retour) aussi
    const pb=document.querySelector('#mHome.on [data-m="play"]');if(pb)pb.click();
  }});
addEventListener('keyup',e=>{if((e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight')&&keys[e.code])veqDoigt(false);keys[e.code]=false;});
addEventListener('keydown',e=>{if(!e.repeat&&(e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight'))veqDoigt(true);},true); // (2026-10-14) LE TONNEAU : le double-tap NITRO au clavier (en capture : avant le gestionnaire du jeu)
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;try{document.querySelectorAll('#tNitro.on,#tLeft.on,#tRight.on').forEach(e=>e.classList.remove('on'));}catch(e){}}); // alt-tab : aucune touche ne reste coincée — (passe qualité) ni ENFONCÉE à l'écran (l'éclair restait appuyé)
/* LA CAISSE PLUS LOURDE (2026-10-15, Sacha : « augmente la gravité pour la voiture, c'est dérangeant : quand on fait une figure sur la
   route la voiture ne se pose pas — applique-le à la physique globale ») — GRAV_K est LE bouton de la gravité, et il n'y en a qu'un :
   FALL_G le porte, donc TOUT ce qui le lit suit d'un bloc (la chute, le vol plané à la nitro qui en reprend 60-75 %, le viseur, la durée
   de la figure du saut nitro, le vol équilibré, la mer de Jade, les filets et la coupe du fantôme tracés au générateur) ; la meute et les
   dos d'âne, qui tombaient à 26 écrit en dur, le prennent aussi. La pente de la route (GRAV) n'y est PAS : elle règle l'élan, pas le vol.
   ×1,3 : le saut nitro (21) dure 0,98 s au lieu de 1,27 et monte 23 % moins haut. `?grav=1` rend l'ancienne gravité, `?grav=1.5` pour essayer.
   (2026-10-17, Sacha, une 2e fois : « augmente la gravité des voitures : quand on fait une figure sur route on doit retomber sur la route plus
   vite ») ×1,3 → ×1,45 — et surtout `sautBesoin`, qui rallongeait le saut à la durée de CATALOGUE de la figure (1,1 à 1,9 s : plus long qu'à
   ×1 !), ne le rallonge plus que jusqu'au vol MINIMUM où la figure se plante (voir sautBesoin). Pourquoi 1,45 et pas plus : une chute plus
   lourde porte moins loin, et les RACCOURCIS en dépendent — MESURÉ (raccourcis.cjs, graine 1, palier 0, même trace rejouée) : le CANYON
   garde 21 raccourcis rentables à ×1,3, 20 à ×1,4, 18 à ×1,45 (0,69/km), 15 à ×1,5 (0,57/km : sous la règle des 0,6/km) ; forêt 29-31,
   volcan 4, inchangés. `?grav=1.3` = la veille. */
const GRAV_K=(function(){try{const v=parseFloat(new URLSearchParams(location.search).get('grav'));return v>0&&v<4?v:1.45;}catch(e){return 1.45;}})();
const GRAV=9.8*.55,FALL_G=33*GRAV_K,AXIS_Y=new THREE.Vector3(0,1,0),AIR_MAX=6;
