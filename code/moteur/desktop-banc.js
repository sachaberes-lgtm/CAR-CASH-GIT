// ============================================================================
// LE MÊME ⚙ POUR LE DESKTOP (2026-09-05) — « enlève la mini app, déplace tous les boutons du
// gameplay, par un petit logo réglages qui inclue tous les boutons qu'on vient de supprimer ».
// `#tGear`/`#tPanel` existaient déjà, tout FAITS, pour le mobile (bloc `if(IS_MOBILE…)` juste
// au-dessus) — mais leur câblage vit ENTIÈREMENT à l'intérieur de ce bloc, en `touchstart`, et ce
// bloc ne tourne JAMAIS sur un vrai desktop. Reprendre ce bloc tel quel l'aurait aussi fait tourner
// `bindHold`/le joystick tactile/le verrou d'écran — tout un jeu de contrôles tactiles qui n'a rien
// à faire sur un poste à clavier. Ce second bloc, MIROIR mais MINIMAL et gaté à l'INVERSE
// (`!IS_MOBILE`, hors `?touch=1`), ne reprend que ce qui sert aux DEUX : ouvrir/fermer le panneau,
// synchroniser ses libellés, et faire apparaître ⚙ pendant la course (`body.play`, déjà mis à jour
// par le MÊME tick que le mobile utilise, voir plus haut). ⚠ Zéro risque de double-câblage : les
// deux blocs s'excluent mutuellement sur la même condition inversée, jamais les deux à la fois.
if(!(IS_MOBILE||/[?&]touch=1/.test(location.search))){
  const dGear=$('tGear'),dPan=$('tPanel');
  const dClic=function(el){ if(el)el.click(); }; // même remarque que côté mobile : les interrupteurs restent la SEULE vérité
  function dPanSync(){ if(!dPan)return;
    const run=(started&&!gameOver),el=dPan.querySelectorAll('.tp,.tpH');
    for(let i=0;i<el.length;i++){ const e=el[i],a=e.getAttribute('data-a'),g=e.getAttribute('data-g');
      if(g)e.style.display=((g==='run')===run)?'':'none';
      if(a==='close')e.innerHTML=run?tpLbl('lecture','REPRENDRE'):tpLbl('croix','FERMER');
      else if(a==='snd')e.innerHTML=tpLbl(SND.sfx?'son':'muet','SON',SND.sfx?'ON':'OFF',SND.sfx);
      else if(a==='mus')e.innerHTML=tpLbl('musique','MUSIQUE',SND.music?'ON':'OFF',SND.music);
      else if(a==='q'){e.innerHTML=tpLbl('eclair','IMAGE',qLbl(),true);}
      else if(a==='volh'||a==='figg')e.style.display='none'; /* (2026-10-15 : FIGURES aussi — une touche ne glisse pas) (R7-5) au clavier ce réglage ne change rien (volSens ne touche que le pouce) : pas de ligne qui ment */
      else if(a==='surv')e.innerHTML=tpLbl('drapeau','SURVIVANT',SURV.armed?'ON':'OFF',SURV.armed); }
    const hd=dPan.querySelector('.tpH'); if(hd)hd.textContent=run?'PAUSE':'CASH CAR'; }
  function dPanOpen(o){ if(!dPan)return;
    if(o)feuilleOuvre(dPan,'open');else feuilleFerme(dPan,'open');
    if(o){ dPanSync(); if(started&&!gameOver&&!paused)togglePause(); }
    else if(started&&!gameOver&&paused)togglePause(); }
  if(dGear)dGear.addEventListener('click',function(e){ e.stopPropagation(); dPanOpen(true); });
  if(dPan)dPan.addEventListener('click',function(e){
    e.stopPropagation();
    const el=e.target&&e.target.closest?e.target.closest('.tp'):null;
    if(!el){dPanOpen(false);return;}
    const a=el.getAttribute('data-a');
    if(a==='close')dPanOpen(false);
    else if(a==='snd'){dClic(sndBtnEl);dPanSync();}
    else if(a==='mus'){dClic(musBtnEl);dPanSync();}
    else if(a==='q'){ SAVE.d.q=qSuivant(SAVE.d.q); SAVE.d.qChoisi=1; SAVE.flush(); applyQ9(SAVE.d.q==='fast'); dPanSync(); }
    else if(a==='surv'){ dClic(survBtnEl); dPanSync(); }
    else if(a==='resp'){ dPanOpen(false); if(started&&!gameOver&&mode==='drive')respawn(); }
    else if(a==='reset'){ dPanOpen(false); if(started){resetGame();} }
    else if(a==='quit'){ dPanOpen(false); if(started&&!gameOver){ if(TUTO.on)tutoQuitte(); /* (2026-09-28) pas tutoFin(true) : QUITTER n'est pas PASSER */ const sb=SANDBOX;SANDBOX=false;endGame();SANDBOX=sb; } } // QUITTER pendant l'auto-école : on sort vraiment (sinon « RATÉ ! » et la caisse replacée)
  });
  // ⚠ NOM DÉDIÉ (`applyQ9`, pas `applyQ`) : `applyQ` est déclarée `const` À L'INTÉRIEUR du bloc
  // mobile — hors de portée ici (portée de bloc). Se rebrancher sur le MÊME état (`DPR_CAP`/
  // `curDPR`/`applyDPR`), pas une copie qui diverge.
  function applyQ9(fast){ DPR_CAP=Math.min(devicePixelRatio,fast?1:PAL.b('dprNetCap',1.5)); qlReprise(); } // (2026-10-14, passe perf mobile) même plafond par palier (l'ordi = palier 2 : inchangé ; ?palier=0 au banc le suit) // mêmes crans que le téléphone (2026-09-24) : RAPIDE ne descend plus sous la résolution d'origine du desktop
  // ⚙/⏸ + le déclencheur `body.play` : le MÊME tick que le mobile (140 ms, zéro écriture DOM si
  // rien n'a changé) — mais SANS le gel « téléphone couché » ni `mGo()`, qui n'ont aucun sens ici.
  function dSyncJeu(){
    const play=(started&&!gameOver);
    if(play!==TCTL.play){ TCTL.play=play; document.body.classList.toggle('play',play);
      if(dGear)dGear.innerHTML=pxi(play?'pause':'reglages'); }
  }
  document.addEventListener('cc:jeu',dSyncJeu);
  setInterval(dSyncJeu,140);
}
/* ⚠ PAS DE SERVICE WORKER EN `file://` : il ne PEUT PAS s'y enregistrer, et la tentative laisse une
   erreur rouge en console (« unknown error when fetching the script ») chez quiconque ouvre le jeu
   par double-clic — inquiétant pour rien. On ne l'installe donc que là où il fonctionne, en http(s). */
// ⚠ `updateViaCache:'none'` (2026-09-05) : sans lui, sw.js LUI-MÊME peut être servi depuis le cache
// HTTP du navigateur, donc une mise à jour du service worker (nouveau CACHE, nouveau no-store — voir
// sw.js) pouvait mettre jusqu'à 24 h à être détectée. En développement actif, on veut TOUJOURS le
// sw.js le plus frais pour vérifier qu'il pointe vers le bon numéro de cache.
// PWA : enregistrement du service worker (offline + installable), en http(s) uniquement et HORS Capacitor.
// Sous Capacitor (app native iOS), window.Capacitor est défini et le protocole est capacitor:// — un
// service worker n'y a pas sa place : on ne l'installe pas.
if('serviceWorker'in navigator&&!window.Capacitor&&(location.protocol==='http:'||location.protocol==='https:')){ addEventListener('load',function(){ navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(function(){}); }); }
/* LA MISE À JOUR TOUTE SEULE (2026-10-01, Léo : « trouve un moyen pour qu'on joue au même jeu, juste — fais-moi ça en un coup »).
   Deux joueurs pouvaient voir deux jeux : une appli posée sur l'écran d'accueil de l'iPhone REPREND la page gardée en mémoire (aucun
   rechargement pendant des jours), un onglet resté ouvert garde l'ancienne. Le jeu connaît son commit (CC_BUILD, gravé par
   vercel-build.sh) ; au lancement, à chaque retour au premier plan et toutes les 5 min il lit `version.json` (le commit publié, jamais
   mis en cache : sw.js le laisse passer, vercel.json le sert en no-store). En retard → il se RECHARGE dès qu'on n'est pas en pleine
   course (menu, garage, écran de mort), sauvegarde écrite d'abord ; sur l'ordi, c'est la page-cadre entière qui se recharge.
   Garde-fou : 2 rechargements au plus par version et par session (si le site sert encore l'ancienne page, on n'insiste pas).
   Copie locale / file:// / appli Capacitor : rien. Le numéro se lit en bas des RÉGLAGES (et sous le jeu sur l'ordi). */
(function(){
  var e=document.getElementById('mvVer');if(e)e.textContent=TR('VERSION')+' '+CC_VER.replace(/^LOCALE/,TR('LOCALE'));
  if(/^__/.test(CC_BUILD)||window.Capacitor||!(location.protocol==='http:'||location.protocol==='https:')||BALADE||SIMU_JEU)return; // (l'atelier des nuages ne se recharge pas en plein réglage — le simulateur non plus)
  var neuf=null,vu=0,touche=Date.now();
  /* (2026-10-05, Léo : « au début, quand CASH CAR explose, une musique part très fort, puis ça relance au niveau ciel ») ⚠ LA MISE À JOUR
     TOMBAIT EN PLEINE INTRO : la 1re lecture de version.json partait 4 s après l'ouverture et « pas en course » comprenait l'intro — un
     toucher à 1-2 s, et la page se rechargeait ~2,5 s plus tard, pile sur l'explosion (reproduit au banc, version périmée simulée), puis
     tout recommençait ; le garde-fou en permettait même DEUX. Désormais : la version se lit DÈS l'ouverture (l'écran titre attend son
     toucher, rien n'a encore sonné : on recharge aussitôt, un clignement) ; JAMAIS pendant l'intro ; et au menu, au garage, à l'écran de
     mort, seulement après 45 s sans toucher (ou au retour d'arrière-plan) — plus de musique coupée sous le doigt. */
  ['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,function(){touche=Date.now();},{passive:true,capture:true});});
  function sur(){
    if(document.hidden||(started&&!gameOver)||(typeof GAR!=='undefined'&&GAR.go))return false;
    var ie=window.__intro;if(ie==='attente')return true;if(ie==='joue')return false; // l'écran titre muet : oui · l'intro qui passe : non
    return Date.now()-touche>45e3;}
  function recharge(){
    try{var t=JSON.parse(sessionStorage.getItem('ccMaj')||'{}'),n=t.v===neuf?t.n|0:0;if(n>=2)return;sessionStorage.setItem('ccMaj',JSON.stringify({v:neuf,n:n+1}));}catch(_){return;}
    try{SAVE.flush();}catch(_){}
    try{window.top.location.reload();}catch(_){location.reload();}
  }
  function verifie(){vu=Date.now();
    fetch('version.json?t='+vu,{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(j&&typeof j.v==='string'&&j.v&&j.v!==CC_BUILD){neuf=j.v;if(sur())recharge();}}).catch(function(){});}
  setTimeout(verifie,250);
  setInterval(function(){if(neuf){if(sur())recharge();}else if(!document.hidden&&Date.now()-vu>3e5)verifie();},1e4);
  document.addEventListener('visibilitychange',function(){if(document.hidden)return;if(neuf){touche=0;if(sur())recharge();}else if(Date.now()-vu>15e3){touche=0;verifie();}}); // le retour d'arrière-plan vaut un lancement neuf
})();
/* ============ fin ajout MOBILE / PWA ============ */
/* ============ LE BANC DU TÉLÉPHONE (?banc=1) — (2026-09-27, passe perf iPhone, tour 2) ============
   Sacha : « on repasse en mode pixel assez vite après avoir lancé ». Le banc du PC imite un iPhone mais la puce d'Apple (GPU à tuiles,
   Metal derrière Safari) ne réagit pas comme une carte de bureau : on ne peut plus deviner, il faut MESURER SUR LE TÉLÉPHONE. Ce module,
   éteint par défaut (charte : rien de développement à l'écran), lance une partie tout seul, fige l'image (la simulation s'arrête, le rendu
   continue) au sol puis en vol, aux NUAGES puis en VILLE, et chronomètre chaque image SYNCHRONISÉE : après le rendu, un `readPixels` d'un
   seul pixel oblige le processeur à attendre que la puce ait fini — le temps mesuré est alors le vrai coût de l'image (processeur + puce),
   sans la grille de 16,7 ms de l'écran qui arrondit tout. Puis il éteint les postes UN PAR UN (résolution, post, bloom, passe d'ombre,
   ciel, nuages, piste, caisse, transparents, ville, ombres reçues) : l'écart au témoin = ce que coûte ce poste SUR CE TÉLÉPHONE.
   Résultat : un tableau à capturer (et un bouton COPIER). Rien n'est sauvegardé, aucun son (pas de geste : le contexte audio dort). */
let BANC_FIGE=false,BANC_CB=null,BANC_T0=0;const BANC_ON=/[?&]banc=1/.test(location.search);
if(BANC_ON)(function(){
  const px4=new Uint8Array(4),gl9=renderer.getContext(),Z=ms=>new Promise(r=>setTimeout(r,ms));
  const box=document.createElement('div');box.id='bancBox';
  box.style.cssText='position:fixed;left:calc(var(--sL) + 6px);right:calc(var(--sR) + 6px);top:calc(var(--sT) + 4px);z-index:2147483001;'+
    'font:8px/1.6 var(--pix);color:var(--tx);background:var(--k1);padding:4px 6px;white-space:pre;overflow:auto;max-height:92vh;pointer-events:auto';
  box.textContent='BANC : ne touche à rien (~3 min)…';document.body.appendChild(box);
  const etat=t=>{box.textContent='BANC en cours — ne touche à rien\n'+t;};
  window.__bancSync=function(){ // appelé en fin d'image par la boucle : la puce finit, on relève
    const t1=performance.now();renderer.setRenderTarget(null);gl9.readPixels(0,0,1,1,gl9.RGBA,gl9.UNSIGNED_BYTE,px4);BANC_CB(performance.now()-BANC_T0,t1-BANC_T0);};
  const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1];};
  const ECH=Math.max(.05,Math.min(1,+((location.search.match(/[?&]ech=([\d.]+)/)||[])[1])||1)); // `&ech=0.2` : échantillons réduits (banc logiciel du PC, où une image prend une seconde)
  const mesure=(n,chauffe)=>new Promise(res=>{let k=0;const T=[],J=[];n=Math.max(3,Math.round(n*ECH));chauffe=Math.max(2,Math.round((chauffe||8)*ECH));BANC_CB=(ts,tj)=>{if(k++<chauffe)return;T.push(ts);J.push(tj);
    if(T.length>=n){BANC_CB=null;res({t:med(T),j:med(J)});}};});
  const reel=ms=>new Promise(res=>{let n=0;const t0=performance.now();BANC_CB=null;
    const f=()=>{n++;if(performance.now()-t0<ms)requestAnimationFrame(f);else res({ips:n/((performance.now()-t0)/1000),ms:loop._ms||0});};requestAnimationFrame(f);});
  const setDPR=d=>{curDPR=Math.min(d,devicePixelRatio);applyDPR();};
  const cache=L=>{const v=[];for(const o of L)if(o&&o.visible){o.visible=false;v.push(o);}return ()=>{for(const o of v)o.visible=true;};};
  const P=[ // [étiquette, éteindre → rallumer, images de chauffe]
    ['DPR 1,25',()=>{setDPR(1.25);return ()=>setDPR(1.5);}],
    ['DPR 1,0',()=>{setDPR(1);return ()=>setDPR(1.5);}],
    ['DPR 0,75',()=>{setDPR(.75);return ()=>setDPR(1.5);}],
    ['sans post',()=>{POST_ON=false;return ()=>{POST_ON=true;};}],
    ['sans bloom',()=>{if(bloomPass)bloomPass.enabled=false;return ()=>{if(bloomPass)bloomPass.enabled=true;};}],
    ['sans calcul ombre',()=>{renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;return ()=>{renderer.shadowMap.autoUpdate=true;};}],
    ['sans ciel',()=>cache([skyDome])],
    ['sans nuages',()=>cache(CLOUDS.map(c=>c.g))],
    ['sans piste',()=>cache(trackMeshes.concat([PAD_IM]))],
    ['sans caisse',()=>cache([carGroup])],
    ['sans transparents',()=>{const L=[];scene.traverse(o=>{const m=o.material;if(m&&!Array.isArray(m)&&m.transparent&&o!==skyDome)L.push(o);});return cache(L);}],
    ['sans ville',()=>cache([CITY.root])],
    // (2026-10-14, passe mobile) LE SOLEIL DE JADE — le niveau du JOUER depuis le 12/10 : ses postes à lui (sans effet ailleurs)
    ['jade : sans mer',()=>{if(JADE.root)dbgJadePoste('mer',0);return ()=>{if(JADE.root)dbgJadePoste('mer',1);};}],
    ['jade : sans montagnes',()=>{if(JADE.root)dbgJadePoste('piliers',0);return ()=>{if(JADE.root)dbgJadePoste('piliers',1);};}],
    ['jade : sans verre',()=>{if(JADE.root)dbgJadePoste('verre',0);return ()=>{if(JADE.root)dbgJadePoste('verre',1);};}],
    ['jade : sans nuages',()=>{if(JADE.root)dbgJadePoste('nuages',0);return ()=>{if(JADE.root)dbgJadePoste('nuages',1);};}],
    ['jade : sans brume',()=>{if(JADE.root)dbgJadePoste('brume',0);return ()=>{if(JADE.root)dbgJadePoste('brume',1);};}],
    ['jade : sans rayons',()=>{if(JADE.root)dbgJadePoste('rayons',0);return ()=>{if(JADE.root)dbgJadePoste('rayons',1);};}],
    ['jade : sans chutes',()=>{if(JADE.root)dbgJadePoste('chutes',0);return ()=>{if(JADE.root)dbgJadePoste('chutes',1);};}],
    ['jade : sans lucioles',()=>{if(JADE.root)dbgJadePoste('esprits',0);return ()=>{if(JADE.root)dbgJadePoste('esprits',1);};}],
    ['sans ombre (recompile)',()=>{sun.castShadow=false;return ()=>{sun.castShadow=true;};},40],
  ];
  // L'AFFICHAGE RÉEL, image figée : le tempo de l'écran (arrondi à 16,7 / 33,3 ms, mais sa MOYENNE sur 2 s dit la part d'images
  // ratées), avec et sans le HUD — Safari peint et compose le DOM hors de notre chrono synchronisé : c'est ici qu'il se voit.
  const nuSt=document.createElement('style');nuSt.textContent='body.bancNu>*:not(canvas):not(#bancBox){visibility:hidden!important}';document.head.appendChild(nuSt);
  const R={},COLS=[],LIG=['réel i/s','réel ms','figé : écran ms','figé : sans HUD','figé : DPR 1,0','JS ms (figé)','TÉMOIN ms'].concat(P.map(p=>p[0]));
  const vue=async (col)=>{COLS.push(col);const C=R[col]={};
    const r=await reel(2500);C['réel i/s']=r.ips.toFixed(0);C['réel ms']=r.ms.toFixed(1);
    BANC_FIGE=true;await Z(300);
    C['figé : écran ms']=(1000/(await reel(2000)).ips).toFixed(1);
    document.body.classList.add('bancNu');await Z(200);C['figé : sans HUD']=(1000/(await reel(2000)).ips).toFixed(1);document.body.classList.remove('bancNu');
    setDPR(1);await Z(200);C['figé : DPR 1,0']=(1000/(await reel(2000)).ips).toFixed(1);setDPR(1.5);await Z(200);
    const ref=await mesure(30);C['JS ms (figé)']=ref.j.toFixed(1);C['TÉMOIN ms']=ref.t.toFixed(1);
    for(let i=0;i<P.length;i++){etat(col+' — '+P[i][0]+' ('+(i+1)+'/'+P.length+')'); // ENCADRÉ : témoin juste avant ET juste après — la dérive (chauffe, thermique) s'annule
      const a=await mesure(16,4);const off=P[i][1]();const m=await mesure(20,P[i][2]);off();const z=await mesure(16,P[i][2]?30:4);
      const d=m.t-(a.t+z.t)/2;C[P[i][0]]=(d>=0?'+':'')+d.toFixed(1);}
    BANC_FIGE=false;garde(false);};
  /* (2026-09-28) LE TABLEAU SURVIT : Sacha a quitté la page avant d'envoyer la capture — tout était perdu, et le banc repartait de zéro.
     Chaque vue terminée est gardée sur le téléphone (clé à part `ccBancDernier`, outil de mesure : hors de la sauvegarde du jeu) ;
     rouvrir `?banc=1` montre le DERNIER tableau (même partiel) avec RELANCER et COPIER. `&refaire=1` relance directement. */
  const MEMO='ccBancDernier';
  const garde=fin=>{try{localStorage.setItem(MEMO,JSON.stringify({t:rendu(),d:new Date().toLocaleString('fr-FR'),fin:!!fin,err:R.err||null}));}catch(e){}};
  const vivant=async ()=>{ if(gameOver){const b=document.querySelector('#mDead.on [data-m="replay"]');if(b)b.click();for(let i=0;i<60&&(!started||gameOver);i++)await Z(250);await Z(2500);}
    dbgAuto(true,0);};
  const image=()=>new Promise(r=>requestAnimationFrame(()=>r()));
  const vol=async ()=>{await vivant();for(let i=0;i<20&&mode!=='drive';i++)await Z(200);try{dbgDauphin(70,60,0,0);}catch(e){}
    const t0=performance.now();for(let i=0;i<90;i++){await image();const s9=dbgState();if(s9.mode!=='fall'||(Math.abs(s9.hOff)>18&&performance.now()-t0>650))break;}}; // en l'air pour de vrai (en images, pas en ms : le banc logiciel rame)
  const rendu=()=>{let gpu='?';try{const x=gl9.getExtension('WEBGL_debug_renderer_info');gpu=x?gl9.getParameter(x.UNMASKED_RENDERER_WEBGL):gl9.getParameter(gl9.RENDERER);}catch(e){}
    let t='BANC CASH CAR — '+gpu+' — écran '+VP.w+'×'+VP.h+' ×'+devicePixelRatio+' — rendu 1,5\n'+
      'ms = coût d\'une image synchronisée (processeur + puce).\nLignes « sans … » : écart au TÉMOIN (−3.0 = ce poste coûte 3 ms)\n\n';
    const w=23,cw=11;t+=''.padEnd(w)+COLS.map(c=>c.padStart(cw)).join('')+'\n';
    for(const l of LIG)t+=l.padEnd(w)+COLS.map(c=>String(R[c][l]==null?'':R[c][l]).padStart(cw)).join('')+'\n';
    return t;};
  const bouton=(txt,fn)=>{const k=document.createElement('button');k.textContent=txt;
    k.style.cssText='font:10px/1 var(--pix);min-height:44px;padding:0 16px;margin:8px 8px 0 0;border:0;background:var(--or);color:var(--k1);border-radius:0';
    k.onclick=function(e){e.stopPropagation();fn(k);};box.appendChild(k);return k;};
  const copier=(txt,k)=>{const non=()=>{k.textContent='FAIS UNE CAPTURE';};try{navigator.clipboard.writeText(txt).then(()=>{k.textContent='COPIÉ !';},non);}catch(e){non();}};
  (async ()=>{
    let ancien=null;try{ancien=JSON.parse(localStorage.getItem(MEMO)||'null');}catch(e){}
    if(ancien&&ancien.t&&!/[?&]refaire=1/.test(location.search)){ // le dernier tableau d'abord : on ne relance que sur demande
      const t0=ancien.t+(ancien.err?'\nERREUR : '+ancien.err:'');
      box.textContent='DERNIER BANC — '+ancien.d+(ancien.fin?'':' — INCOMPLET (page quittée avant la fin)')+'\n\n'+t0;
      bouton('COPIER',k=>copier(t0,k));
      await new Promise(r=>bouton('RELANCER LE BANC',()=>r()));
      box.textContent='BANC : ne touche à rien (~3 min)…';}
    for(let i=0;i<200&&!window.__gameReady;i++)await Z(100);await Z(1500);
    try{const sp=document.getElementById('splash');if(sp){sp.click();await Z(900);sp.remove();}}catch(e){}
    try{document.querySelector('#mHome [data-m=play]').click();}catch(e){}await Z(2500);
    try{document.getElementById('gPlayMain').click();}catch(e){}
    for(let i=0;i<80&&!started;i++)await Z(250);
    RESPIN=true;DPR_CAP=Math.min(devicePixelRatio,1.5);qlPose(0);setDPR(1.5);dbgAuto(true,0);
    const lieu=()=>((LVL.cur&&LVL.cur.id)||'?').toUpperCase().slice(0,7); // (2026-10-14) les colonnes portent le VRAI niveau (le JOUER lance le Soleil de jade : « NUAGES » mentait)
    try{await Z(3500);const L1=lieu();await vue(L1+' sol');await vol();await vue(L1+' vol');
      await vivant();dbgSaut();dbgAuto(true,0);await Z(4000);const L2=lieu();if(L2!==L1){await vue(L2+' sol');await vol();await vue(L2+' vol');}}
    catch(e){R.err=String(e&&e.message);}
    BANC_FIGE=true;garde(true);const txt=rendu()+(R.err?'\nERREUR : '+R.err:'');
    box.textContent=txt+'\nFINI — fais une capture d\'écran, ou COPIER puis colle le texte. (Gardé : rouvrir ce lien le remontre.)\n';
    bouton('COPIER',k=>copier(txt,k));
  })();
})();
window.__gameReady=true; // la boucle part : le chien de garde du mouchard se tait
try{plqDemarre();}catch(e){console.warn('plaque',e);} // (2026-10-17) LA PLAQUE : ses écrans, l'horloge du compte, et l'atelier au premier accueil (voir PLQ)
try{bienvGuette();}catch(e){} // (2026-10-16) LA QUESTION DE BIENVENUE guette l'accueil (voir bienvMontre)
requestAnimationFrame(loop);
})();
