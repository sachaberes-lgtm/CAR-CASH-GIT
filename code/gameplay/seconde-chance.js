/* LA PUB QUI RESSUSCITE (2026-10-15, Sacha : « au lieu de payer il faut regarder une pub pour ressusciter ») — CONTINUER ne coûte plus
   rien : il lance une PUB RÉCOMPENSÉE, et la course reprend quand elle a été vue jusqu'au bout. Le jeu n'avait AUCUNE régie (le kit
   des portails est parti avec l'édition POKI, l'app iPhone déclare « aucune pub » à Apple) ; depuis le 15/10 soir, AdSense sur le SITE
   (« LA RÉGIE ADSENSE », juste au-dessus) — deux chemins :
   · UNE RÉGIE BRANCHÉE — la page ou l'app qui en a une (AdMob dans l'app iPhone, AdSense H5 sur le web…) pose, avant le jeu,
     `window.CC_PUB_RECOMPENSE = function(nom){ return une Promise }` : vrai = vue jusqu'au bout (on reprend), faux = fermée avant la fin
     (pas de reprise), rien / une erreur = aucune pub à montrer (la pub maison prend le relais). Le jeu se tait pendant (pubSilence).
   · LA PUB MAISON — sinon : PUBR.d secondes plein écran (#pubR, <style id="pubRecompense">) qui montrent une caisse de la boutique qu'on
     n'a pas encore, son nom, son prix ; le compte ROND et la barre disent le temps qui reste ; rien ne se touche ; le temps ne court que
     l'écran allumé. `pubRecompense(nom, fin)` : fin(vue) part UNE fois. `?pub=0` : pas de pub, reprise immédiate. Banc : dbgPub(). */
const PUBR={on:false,d:5,t:0,tm:0,el:null,mus:false,sans:/[?&]pub=0\b/.test(location.search)};
Object.assign(I18N,{'PUB':'AD','EN BOUTIQUE':'IN THE SHOP','TA COURSE REPREND APRÈS LA PUB':'YOUR RUN RESUMES AFTER THE AD','TON GAIN ×2 APRÈS LA PUB':'YOUR WINNINGS ×2 AFTER THE AD'});
function pubSilence(on){try{ // une régie montre SA pub par-dessus le jeu : le jeu se tait (la musique en pause, le contexte audio suspendu), puis reprend
  if(on){PUBR.mus=!!(musicEl&&!musicEl.paused);if(PUBR.mus)musicEl.pause();if(AC&&AC.state==='running')AC.suspend();}
  else{if(AC&&AC.state==='suspended')AC.resume();if(PUBR.mus&&musicVoulue&&!paused)musicJoue();PUBR.mus=false;}}catch(e){}}
function pubRecompense(nom,fin){
  if(PUBR.on)return false;
  PUBR.on=true;let fait=false;
  const fini=function(vue){if(fait)return;fait=true;PUBR.on=false;try{fin(!!vue);}catch(e){console.warn('pub',e);}};
  if(PUBR.sans){setTimeout(function(){fini(true);},0);return true;}
  const regie=window.CC_PUB_RECOMPENSE;
  if(typeof regie==='function'){
    let p=null;try{p=regie(nom);}catch(e){p=null;}
    if(p&&typeof p.then==='function'){pubSilence(true); // (15/10 soir, régie AdSense) on ne se tait que si la régie montre VRAIMENT une pub (une promesse) : « rien de prêt » rend null tout de suite
      p.then(function(v){pubSilence(false);if(v===true)pubCompte();if(v===true||v===false)fini(v);else pubMaison(fini,nom);},function(){pubSilence(false);pubMaison(fini,nom);});}
    else if(p===true||p===false){if(p)pubCompte();fini(p);}
    else pubMaison(fini,nom);
    return true;}
  pubMaison(fini,nom);return true;
}
/* (2026-10-19, Sacha au quiz : « vraies pubs seulement ») L'ÉTERNELLE — « REGARDE 100 PUBS » (SAVE.d.ex.pubs) ne se remplissait plus depuis le
   retrait du kit des portails : chaque pub d'une VRAIE régie (AdMob, AdSense) vue jusqu'au bout compte une. La pub maison ne compte pas. */
function pubCompte(){try{if(SAVE.d.ex){SAVE.d.ex.pubs=Math.min(1e6,(SAVE.d.ex.pubs|0)+1);SAVE.mark();}}catch(e){}}
function pubPrepare(nom){try{if(!PUBR.sans&&typeof window.CC_PUB_PREPARE==='function')window.CC_PUB_PREPARE(nom);}catch(e){}} // une offre de pub s'OUVRE (la plaque va paraître) : la régie peut aller chercher sa pub
function pubCaisse(){ // la caisse de la réclame : une qu'on peut ACHETER à l'argent du jeu et qu'on n'a pas encore (jamais une caisse en euros)
  const L=[],T=[];for(let i=0;i<CARS.length;i++){if(carRetiree(i)||carEuros(i))continue;T.push(i);const u=CAR_UNLOCK[i];if(u&&u.p>0&&!carOwned(i))L.push(i);}
  const P=L.length?L:T;return P.length?P[(Math.random()*P.length)|0]:0;}
function pubMaison(fini,nom){
  let el=PUBR.el;
  if(!el){el=PUBR.el=document.createElement('div');el.id='pubR';el.hidden=true;el.setAttribute('role','dialog');
    el.innerHTML='<i class="prTag" data-fr="PUB">'+TR('PUB')+'</i><span class="prRond" aria-hidden="true"><b></b></span><img class="prImg" alt=""><b class="prNom"></b>'+
      '<span class="prSous"></span><span class="prPied" data-fr="TA COURSE REPREND APRÈS LA PUB">'+TR('TA COURSE REPREND APRÈS LA PUB')+'</span><i class="prBar" aria-hidden="true"></i>';
    for(const ev of ['pointerdown','pointerup','touchstart','touchend','click'])el.addEventListener(ev,function(e){e.stopPropagation();if(e.cancelable&&ev!=='pointerdown'&&ev!=='pointerup')e.preventDefault();},{passive:false}); // rien ne traverse vers l'écran de fin
    document.body.appendChild(el);}
  const i=pubCaisse(),c=CARS[i]||{},u=CAR_UNLOCK[i],img=el.querySelector('.prImg');
  img.removeAttribute('src');
  el.querySelector('.prNom').textContent=c.name?TR(c.name):'CASH CAR';
  try{el.style.setProperty('--rc',rarInfo(carRar(i)).c);}catch(e){}
  el.querySelector('.prSous').textContent=TR('EN BOUTIQUE')+(u&&u.p>0&&!carOwned(i)?' · '+fmtC(u.p):'');
  el.setAttribute('aria-label',TR('PUB'));
  {const pd=el.querySelector('.prPied'),k9=nom==='double-gain'?'TON GAIN ×2 APRÈS LA PUB':'TA COURSE REPREND APRÈS LA PUB';if(pd){pd.setAttribute('data-fr',k9);pd.textContent=TR(k9);}} // (2026-10-19) le pied dit ce que la pub va donner : la reprise, ou le ×2 du gain
  try{carPhoto(i,function(s9){if(s9&&PUBR.on)img.src=s9;});}catch(e){}
  el.style.setProperty('--pr','0');el.hidden=false;void el.offsetWidth;el.classList.add('on');
  PUBR.t=0;let t0=performance.now(),vu=-1;const rond=el.querySelector('.prRond b');
  clearInterval(PUBR.tm);
  PUBR.tm=setInterval(function(){const now=performance.now();if(!document.hidden)PUBR.t+=Math.min(.25,(now-t0)/1000);t0=now; // l'arrière-plan arrête la pub (elle ne se « regarde » pas écran éteint)
    const r=Math.min(1,PUBR.t/PUBR.d),n=Math.max(0,Math.ceil(PUBR.d-PUBR.t));el.style.setProperty('--pr',r.toFixed(3));
    if(n!==vu){vu=n;rond.textContent=String(n);}
    if(r>=1){clearInterval(PUBR.tm);fini(true); // la reprise lance son volet TOUT DE SUITE : la pub ne s'efface qu'une fois l'écran couvert (jamais un éclair de l'écran de fin)
      setTimeout(function(){el.classList.remove('on');el.hidden=true;},ecranWipe._on?160:0);}},50);
}
addEventListener('keydown',function(e){if(PUBR.on&&PUBR.el&&!PUBR.el.hidden){e.stopPropagation();e.preventDefault();}},true); // pendant la pub maison, le clavier ne touche pas l'écran de fin dessous
window.dbgPub=function(k){ // banc : dbgPub() l'état · ('fin') la pub maison finit tout de suite · (n) elle dure n s
  if(k==='fin'&&PUBR.on)PUBR.t=PUBR.d;else if(+k>0)PUBR.d=+k;
  return {on:PUBR.on,d:PUBR.d,t:+PUBR.t.toFixed(2),regie:typeof window.CC_PUB_RECOMPENSE==='function',maison:!!(PUBR.el&&!PUBR.el.hidden),chance:!!CHANCE.pub,
    ads:{on:ADS.on,test:!!(window.CC_ADS&&window.CC_ADS.test),pret:ADS.pret,etat:ADS.etat,n:ADS.n,prete:!!(ADS.b&&ADS.b.show)},
    admob:{on:AMOB.on,init:AMOB.init,pret:AMOB.pret,etat:AMOB.etat,n:AMOB.n},pubs:(SAVE.d.ex&&SAVE.d.ex.pubs)|0};};
/* LA SECONDE CHANCE (2026-10-14, Sacha au quiz de 14 h 35 — « façon Subway Surfers » ; le principe vient du CŒUR À LA MORT de l'édition
   ROBLOX). À la mort, l'écran de fin propose UNE fois par partie de CONTINUER — ⚠ depuis le 15/10 soir contre une PUB (voir LA PUB QUI
   RESSUSCITE, juste au-dessus) ; avant, contre de l'ARGENT DU JEU (jamais d'euros) :
   on repart d'où l'on est tombé (`respawn` : la dernière route sûre) avec le MOTEUR, la zone et le compteur de la partie ; la chaîne d'aura,
   le flow et les pouvoirs sont partis avec l'explosion, une part des gains avec le prix, et le MOTEUR perd un palier (CHANCE.moteurPerte :
   la caisse a explosé) — la mort reste une vraie sanction.
   · LE PRIX — ⚠ (15/10 soir, Sacha) TOUT l'encaissé de la partie (commitExploits._vire), voir chanceOuvre. Le 15/10 midi : autant de $ que de PIÈCES ramassées pendant la partie (RUNX.coins, voir chanceOuvre). Le 14/10 soir : 100 % de l'encaissé de la partie. Avant (barème de GAMEPLAY) : k × ce qu'elle a encaissé (`money − START_CASH`), k = 0,6 jusqu'à 3 min (GAMEPLAY, qui l'a relevé de 0,5 : le joueur moyen
     triplait son revenu par minute), puis +0,05 par minute, plafond 0,8 ; CHANCE.plancher au moins, arrondi à deux chiffres (2 437 → 2 400). Le moteur perdu casse la pente de
     l'argent (≈ T^2,1 : continuer une longue partie vaut bien plus que d'en recommencer une). Il se paie sur le COMPTE — qui contient déjà la partie, commitExploits vient de la verser. Jamais
     proposée si le compte ne couvre pas le prix, ni sur une partie de moins de CHANCE.tMin secondes (on ne vend rien à qui a raté le 1er virage).
   · LA FENÊTRE : CHANCE.fen après endGame, puis l'offre s'éteint seule. Aucun chrono à l'écran (INTERFACE : pas de fausse urgence).
     Quitter l'écran de mort (menu, garage) la ferme aussi. Pas au bac à sable, à l'auto-école, au parc, au Survivant, ni sur une fin de
     RÈGLE (semé, terminé : endGame sans explosion).
   · LA COMPTABILITÉ SUIT. endGame a déjà VERSÉ la première partie (banque, aura, exploits, Top 10) : on ne rembourse rien, on décale les
     BASES — la fin suivante ne verse que ce qui a été gagné depuis la reprise (`chanceBase`, CHANCE.a0, CHANCE.rs), ne compte pas une
     2e partie (ex.runs), et la ligne du Top 10 de la première fin part (le score final, plus haut, la remplace).
   · LA REPRISE : sous le volet, la caisse retombe sur sa ligne ; 3 · 2 · 1 (1,5 s) puis GO ; elle CLIGNOTE, invulnérable CHANCE.invD
     secondes de course : un choc est ignoré, une chute (vide, trop d'air) la replace sans frais. 2 s de nitro offerte, comme au départ.
   Contrat avec l'écran de mort (INTERFACE, plaque #mChance) : `chanceEtat()` → {ok, prix, reste} et `chanceJoue()`. L'événement `cc:chance`
   (sur document) part quand l'offre s'ouvre, s'éteint ou sert : la plaque relit alors chanceEtat(). `?chance=0` éteint tout. Banc : dbgChance(). */
const CHANCE={on:!/[?&]chance=0\b/.test(location.search),plancher:300,tMin:20,moteurPerte:1,fen:5500,invD:3,
  offre:false,used:false,pub:false,fin:0,prix:0,m0:0,a0:0,v1:0,rs:null,lb:null,inv:0,tm:0};
function chanceBase(){return CHANCE.used?CHANCE.m0:START_CASH;} // ce que la prochaine fin de partie NE verse PAS (déjà versé avant la reprise)
function chanceSignal(){try{document.dispatchEvent(new Event('cc:chance'));}catch(e){}}
function chanceRaz(){resuFin(false);RESU.plein=0;clearTimeout(CHANCE.tm);CHANCE.gratuit=false;CHANCE.pub=false;const f=CHANCE.offre;CHANCE.offre=false;CHANCE.used=false;CHANCE.inv=0;CHANCE.fin=0;CHANCE.prix=0;CHANCE.m0=0;CHANCE.a0=0;CHANCE.v1=0;CHANCE.rs=null;CHANCE.lb=null;chanceCompteFin();if(f)chanceSignal();}
function chanceCompteFin(){const s9=avE('slam9');if(s9&&s9.classList.contains('compte'))s9.classList.remove('compte','on');} /* (chasse aux bugs) le 3 · 2 · 1 de la reprise interrompu (pause puis RECOMMENCER ou QUITTER : son minuteur CHANCE.tm est tué) ne reste pas figé au centre de l'écran */
function chanceOuvre(boom,sc,q){ // fin de endGame : la partie est versée, l'écran de mort s'ouvre — l'offre aussi, si elle a lieu d'être
  clearTimeout(CHANCE.tm);chanceCompteFin();CHANCE.offre=false;
  const bon=(SAVE.d.chanceG|0)>0; // (FINAL SPIN d'IDEE) un BON de seconde chance GRATUITE gagné à la machine : pas de prix, pas de durée minimale — il faut toujours une explosion
  CHANCE.gratuit=false;
  if(!CHANCE.on||CHANCE.used||!boom||SANDBOX||TUTO.on||TUTO.quitte||PARK.on||SURV.on||BALADE||(!bon&&(RUNX.t||0)<CHANCE.tMin))return;
  CHANCE.prix=0;CHANCE.gratuit=bon; /* (2026-10-15 soir, Sacha : « au lieu de payer il faut regarder une pub pour ressusciter ») plus de PRIX : la reprise se gagne en regardant une pub (chanceJoue → pubRecompense) ; le bon de la machine à sous s'en passe. Avant : */ /* le prix = bon?0:Math.max(1,Math.round(commitExploits._vire||0)) — (2026-10-15 soir, Sacha : « le bouton continuer quand on meurt doit couter au joueur tout ce qu'il a gagne dans la partie ») le prix = TOUT l'encaissé de la partie (commitExploits._vire, ce que endGame vient de verser), au dollar près ; 1 $ au moins, sinon la reprise s'afficherait GRATUIT. Avant : */ /* (2026-10-15, Sacha : « le prix doit être égal au nombre de pièces que tu as ramassées ») le prix = les PIÈCES ramassées de la partie, une pièce = 1 $ (RUNX.coins, compté au ramassage) ; 1 $ au moins, sinon la reprise s'afficherait GRATUIT. Avant : */ /* (2026-10-14 soir, Sacha : « continuer doit coûter la même somme que ce qu'il a gagné durant la partie ») le prix = 100 % de l'encaissé, au dollar près ; CHANCE.plancher seulement pour une partie qui n'a presque rien rapporté (sinon la reprise serait gratuite) */
  CHANCE.lb=q?sc:null;CHANCE.v1=commitExploits._vire||0;CHANCE.a0=commitExploits._aura||0;
  CHANCE.offre=true;CHANCE.fin=performance.now()+CHANCE.fen;
  if(!bon)pubPrepare('seconde-chance'); // (15/10 soir) la régie (AdSense) va chercher sa pub pendant que la plaque monte
  CHANCE.tm=setTimeout(function(){CHANCE.offre=false;chanceSignal();},CHANCE.fen+30);
  chanceSignal();
}
/* ===== LA SECONDE CHANCE NE FILE PAS EN ARRIÈRE-PLAN (24/10, débogage sortie iOS : « pas de minuteur de jeu qui avance en arrière-plan ») =====
   L'offre se comptait à l'horloge murale (CHANCE.fin) et par un setTimeout : l'appli quittée une seconde pendant l'offre (une notification,
   le centre de contrôle, un appel), elle avait disparu au retour. Caché : le minuteur s'arrête ; revenu : la fin recule d'autant. */
addEventListener('visibilitychange',function(){ try{
  if(document.hidden){ if(CHANCE.offre&&!CHANCE.used&&CHANCE.fin&&!CHANCE.chanceCacheT){CHANCE.chanceCacheT=performance.now();clearTimeout(CHANCE.tm);} return; }
  if(!CHANCE.chanceCacheT)return; const dur9=performance.now()-CHANCE.chanceCacheT; CHANCE.chanceCacheT=0;
  if(!(CHANCE.offre&&!CHANCE.used&&CHANCE.fin))return;
  CHANCE.fin+=dur9; clearTimeout(CHANCE.tm);
  CHANCE.tm=setTimeout(function(){CHANCE.offre=false;chanceSignal();},Math.max(0,CHANCE.fin-performance.now())+30); chanceSignal();
}catch(e){} });
function chanceEtat(){
  const ok=!!(CHANCE.on&&CHANCE.offre&&!CHANCE.used&&started&&gameOver&&performance.now()<CHANCE.fin&&overlay.style.display!=='none'&&!garageOn&&!MENUV.retour); /* (15/10 soir) plus de `bank()>=CHANCE.prix` : la pub ne demande rien au compte */
  return {ok:ok,prix:CHANCE.prix,gratuit:!!CHANCE.gratuit,reste:ok?Math.max(0,Math.round(CHANCE.fin-performance.now())):0};
}
function chanceJoue(){ // le toucher de la plaque : (15/10 soir) la PUB d'abord (pubRecompense) — la reprise, sous le volet, quand elle a été vue
  if(!chanceEtat().ok)return false;
  if(ecranWipe._on)return false; // (2026-10-14, chasse aux bugs) un volet déjà en route (REJOUER, ⌂ touchés juste avant) n'appellerait jamais la reprise (ecranWipe sort sans `go`) : on paierait pour rester sur l'écran de mort, offre éteinte et ligne du Top 10 retirée — on ne débite rien
  clearTimeout(CHANCE.tm);CHANCE.offre=false; // la fenêtre de 5,5 s s'arrête : la pub prend le temps qu'il lui faut
  try{goImmersive();}catch(e){} // (le plein écran veut le geste : ici, pas au bout de la pub)
  if(CHANCE.gratuit){chancePrend();return true;} // le BON de la machine à sous : pas de pub
  CHANCE.pub=true;chanceSignal(); // la plaque s'efface ; le FINAL SPIN attend la fin de la pub (chanceAttend)
  uiClic('');hap(8);
  const lance=pubRecompense('seconde-chance',function(vue){CHANCE.pub=false;
    if(vue&&started&&gameOver&&!garageOn&&!CHANCE.used&&!ecranWipe._on)chancePrend();else chanceSignal();}); // pub fermée avant la fin : pas de reprise, l'écran de fin reprend la main
  if(!lance){CHANCE.pub=false;chanceSignal();return false;}
  return true;
}
function chancePrend(){ // la reprise est GAGNÉE (pub vue jusqu'au bout, ou bon) : on la sert, on repart sous le volet
  clearTimeout(CHANCE.tm);CHANCE.used=true;CHANCE.offre=false;
  const bon=!!CHANCE.gratuit;
  if(bon)SAVE.d.chanceG=Math.max(0,(SAVE.d.chanceG|0)-1); /* le bon sert */ /* (15/10 soir) plus de débit : avant, `else SAVE.d.bank=Math.max(0,bank()-P)` */
  CHANCE.m0=money;CHANCE.rs={tr:runStats.tricks|0,ga:runStats.gaps|0,bu:runStats.bumps|0,sv:runStats.surv|0};
  if(CHANCE.lb!=null){const i9=leaders.findIndex(function(e){return e.s===CHANCE.lb;});if(i9>=0)leaders.splice(i9,1);} // la ligne de la 1re fin part : la fin suivante posera le score de toute la partie
  saveLeaders(); // (flush : le paiement et le Top 10 partent ensemble sur le disque)
  RUNX.verse=null;
  try{if(SONV2)sfx(bon?'ui.achat':'ui.ok');else uiClic('');}catch(e){}hap([12,40,12,40,30]);
  chanceSignal();
  const go=function(){chanceRepart(bon);};
  if(typeof ecranWipe==='function')ecranWipe(go);else go();
  return true;
}
function chanceRepart(bon){ // sous le volet : la course reprend où elle s'est arrêtée — (15/10) Pouce bleu : le même morceau repart (musicStartRun(true,true))
  if(!started||!gameOver)return;
  try{finSonsCoupe();}catch(e){}
  mortCause='';gameOver=false;paused=false;running=true;overlay.style.display='none';nitroOn=false;nitroBlue=false;nitroHeldT=0;loop._nOn=false;loop._nBl=false;SENS_NI.on=false; /* (chasse aux bugs) mort nitro tenu : la porte de simulation tournait encore pendant l'explosion, loop._nOn / nitroHeldT / SENS_NI.on y restaient vrais ; sans cette remise à zéro (la même que resetGame), la 1re image de la reprise croyait la nitro VIENT de s'éteindre : PSSHT, langues de feu + pétarade, nez qui plonge */
  clearBoom();RALENTI.t=0;
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  airPie.style.display='none';airFlash=0;nitroX=0;boost=0;nitroR=Math.max(nitroR,nitroCap()*.5); // de quoi voler, pas un plein
  M2R.vie=0;/* (missions v2) on est mort : « tiens 5 min sans mourir » repart de zéro */respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0; // elle RETOMBE sur sa ligne : on voit qu'on repart
  if(CHANCE.moteurPerte>0&&engTier>0){engTier=Math.max(0,engTier-CHANCE.moteurPerte);coinsGot=ENGINE_TIERS[engTier].coins;MV.coup(.9);} // le MOTEUR encaisse le choc : un palier (ses pièces avec), la vignette et le timbre suivent seuls
  startBoostT=Math.max(startBoostT,2);paintMoney();dnRelance(); /* (2026-10-22, DEBUGGING) les DUNES : la reprise repart lancée, sinon la lèvre suivante la jette dans le sable (voir dnRelance) */
  if(GH.on&&!GH.fini&&!GH.pris)GH.g.visible=true; // campStop a caché la caisse-nuage : elle revient
  if(AC)for(const n9 of [gainN,windG,whG,skidG,jrG,jetG,jetLowG,jetOscG,engLfoG,engWhineG,transG,diffG,ovrG,engTickG,pinkG,RUG.rgG,RUG.thG,RUG.crG,GOM.sG,GOM.gG,GOM.respG])if(n9&&n9.gain)n9.gain._s9=undefined; // endGame les a coupés à la main : le cache de `stt` doit renvoyer les cibles
  musicStartRun(true,true);
  CHANCE.inv=CHANCE.invD;
  const resu=resuLance(); /* (2026-10-19) LA RÉSURRECTION : les pièces de la caisse se réassemblent pendant le compte (voir RESU) */
  if(!resu)try{flashEcran('rgba(255,255,255,.35)');}catch(e){} /* (avec elle, le flash attend la dernière pièce) */
  try{document.dispatchEvent(new Event('cc:jeu'));}catch(e){} // les commandes reviennent À L'INSTANT
  let n=3;const pas=function(){ // 3 · 2 · 1 : le compte du BOUCLIER (la caisse roule déjà ; ce n'est pas un gel)
    const s9=avE('slam9');
    if(!started||gameOver){if(s9)s9.classList.remove('compte','on');return;}
    if(paused){CHANCE.tm=setTimeout(pas,200);return;} // la pause pendant le compte : il attend
    if(n===0){if(s9)s9.classList.remove('compte','on');try{if(SONV2&&!resu)sfx('ui.go');}catch(e){}return;} /* (2026-10-19) après une résurrection, le chœur du MIRACULÉ vient de jouer : pas de GO par-dessus */
    slam(String(n),n===3&&bon?(LANG==='en'?'FREE':'GRATUIT'):'','#ffd75e','#ff7ad5',64,9); /* (15/10 soir) plus de « −prix » sous le 3 : la pub a payé */{const s8=avE('slam9');if(s8)s8.classList.add('compte');}
    if(!RESU.actif)try{if(SONV2)sfx('ui.bip');else chimeNote(noteP(n===1?4:2,1),0,.08,.1);}catch(e){}hap(6); /* (2026-10-19) pendant la résurrection, l'arpège des pièces tient lieu de bips */
    n--;CHANCE.tm=setTimeout(pas,500);};
  CHANCE.tm=setTimeout(pas,120);
}
function chanceTick(dt){ // dans la porte de simulation de loop : la pause fige le bouclier avec le reste
  CHANCE.inv=Math.max(0,CHANCE.inv-dt);
  if(mode==='boom')return;
  if(RESU.actif){resuTick(dt);if(RESU.actif){carGroup.visible=false;return;}} // (2026-10-19) LA RÉSURRECTION : la caisse attend que ses pièces soient revenues
  if(RESU.plein>0){RESU.plein-=dt;carGroup.visible=true;return;} // …puis elle reste PLEINE 0,4 s : le clignotement l'éteignait parfois pile à son retour
  carGroup.visible=CHANCE.inv<=0||((CHANCE.inv*(CHANCE.inv<1?16:9))|0)%2===0; // il clignote, plus vite à la fin
}
function chanceProtege(cause){ // explode, pendant le bouclier
  if(!(CHANCE.inv>0)||gameOver||mode==='boom'||!started)return false;
  if(mode==='fall'||cause==='vide'||cause==='air'){ // une chute : replacée sans frais (comme le filet du mode facile)
    airPie.style.display='none';airFlash=0;
    respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0;dnRelance();CHANCE.inv=Math.max(CHANCE.inv,1);}
  return true; // un choc : ignoré
}
function chanceRefuse(){if(!CHANCE.offre)return false;clearTimeout(CHANCE.tm);CHANCE.offre=false;chanceSignal();return true;} // l'offre se ferme tout de suite (un geste ailleurs, la machine à sous d'IDEE qui veut sa place)
function chanceAttend(){return !!(CHANCE.pub||PUBR.on)||!!(CHANCE.offre&&!CHANCE.used&&performance.now()<CHANCE.fin&&chanceEtat().ok);} // vrai tant que l'offre est à l'écran : ce qui vient APRÈS la mort (le FINAL SPIN) attend qu'elle tombe — l'événement cc:chance le dit
/* LA RÉSURRECTION (2026-10-19, Sacha : « seconde chance doit ressusciter la voiture : une animation stylée où les pièces de la voiture se
   réassemblent par magie ») — la reprise ne pose plus la caisse d'un coup. Sous le volet, ses VRAIES pièces (`CAR_PIECES`, celles que
   l'explosion arrache) apparaissent éparpillées autour d'elle et flottent ; puis elles s'aimantent vers leur place EN TOURBILLON, une à une —
   les roues d'abord (elles arrivent en roulant), puis le bas de caisse, puis le haut —, chacune traînant des étincelles d'or et de néon.
   Chaque éclat qui se verrouille claque (`spin.arret`, une note plus haut à chaque fois : l'arpège monte avec la caisse) et jette une gerbe ;
   le dernier posé, la caisse soudée revient d'un coup sous un anneau de néon, une gerbe d'or et le chœur du MIRACULÉ (`jeu.miracule`).
   ~1,5 s, pendant le 3 · 2 · 1 (qui se tait : l'arpège le remplace) ; le bouclier et le clignotement suivent comme avant.
   · LES ÉCLATS : chaque roue seule, la carrosserie en 12 morceaux (gauche/droite × avant/milieu/arrière × bas/haut), chacun SOUDÉ par matière
     (`fusGeo`, comme `caisseSoude`) : une quinzaine d'éclats, quelques dizaines de dessins pendant 1,5 s, les MÊMES matières (aucun programme
     compilé en course). Les géométries soudées sont libérées à la fin.
   · `RESU.g` vit dans la scène, calé sur la caisse AU RENDU (`scene.onBeforeRender`, chaîné) : les éclats suivent la caisse qui roule déjà
     (rien n'est figé, comme avant). Elle-même reste cachée tant qu'ils volent (chanceTick).
   · `?resu=0` = la reprise d'avant (la caisse posée d'un coup). Banc : `dbgResu()` (l'état), `dbgResu('lance')` (la rejouer en course). */
const RESU={on:!/[?&]resu=0\b/.test(location.search),actif:false,t:0,T0:.3,Tv:.72,Dmax:.42,fin:1.5,plein:0,g:null,E:[],geos:[],n:0,tSon:0,dessins:0};
const RESU_V=new THREE.Vector3(),RESU_W=new THREE.Vector3(),RESU_Q=new THREE.Quaternion(),RESU_Q2=new THREE.Quaternion(),RESU_X=new THREE.Vector3(1,0,0),RESU_Y=new THREE.Vector3(0,1,0),RESU_Z=new THREE.Vector3(0,0,1);
function resuVa(o,M,out){ // les maillages d'une pièce, chacun avec sa matrice dans le repère de la caisse
  if(!o.visible||o.isSprite||o.isPoints||o.isLine||(o.userData&&(o.userData.fx||o.userData.contour)))return;
  if(o.isMesh&&o.geometry&&o.material&&!o.isInstancedMesh&&!o.isSkinnedMesh&&!(!Array.isArray(o.material)&&o.material.blending===THREE.AdditiveBlending))out.push([o,M]); // (les halos additifs ne volent pas : de la lumière, pas de la tôle)
  for(const c of o.children){if(c.matrixAutoUpdate)c.updateMatrix();resuVa(c,new THREE.Matrix4().multiplyMatrices(M,c.matrix),out);}} /* (une matrice posée à la main, gelée, fait foi telle quelle) */
function resuMaillage(o,M){ // un maillage seul, posé par sa matrice (géométrie et matière PARTAGÉES : rien à libérer)
  const m=new THREE.Mesh(o.geometry,o.material);m.castShadow=o.castShadow;m.receiveShadow=o.receiveShadow;m.frustumCulled=o.frustumCulled;m.renderOrder=o.renderOrder;
  if(o.userData.lp)m.userData.lp=1;M.decompose(m.position,m.quaternion,m.scale);m.updateMatrix();m.matrixAutoUpdate=false;return m;}
function resuBatit(){ // les ÉCLATS de la caisse montée — au repos, carBody est l'identité dans carGroup (buildCar) : une pièce a la même matrice dans les deux repères
  const P=[];let z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;
  for(const pc of CAR_PIECES){const o=pc[0];
    if(o===carBody||!(o.isMesh||o.isGroup)||!o.visible||(o.geometry&&o.geometry.type==='PlaneGeometry'))continue; // (ni l'underglow, comme l'explosion)
    if(o.matrixAutoUpdate)o.updateMatrix();const L=[];resuVa(o,o.matrix.clone(),L);if(!L.length)continue;
    const c=new THREE.Vector3();let n=0;
    for(const e of L){const g=e[0].geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(!g.boundingSphere)continue;c.add(RESU_V.copy(g.boundingSphere.center).applyMatrix4(e[1]));n++;}
    if(!n)continue;c.multiplyScalar(1/n);
    const ro=wheels.indexOf(o);P.push({L:L,c:c,roue:ro});
    if(ro<0){z0=Math.min(z0,c.z);z1=Math.max(z1,c.z);y0=Math.min(y0,c.y);y1=Math.max(y1,c.y);}}
  const grp=new Map(),dz=Math.max(.01,z1-z0),ym=(y0+y1)/2;
  for(const p of P){const k=p.roue>=0?100+p.roue:(p.c.x<0?0:1)+2*Math.min(2,Math.floor((p.c.z-z0)/dz*3))+6*(p.c.y>ym?1:0);
    let G=grp.get(k);if(!G)grp.set(k,G={P:[],c:new THREE.Vector3(),haut:k<100&&k>=6,roue:p.roue>=0});G.P.push(p);G.c.add(p.c);}
  const E=[];let dessins=0;
  for(const G of grp.values()){G.c.multiplyScalar(1/G.P.length);
    const g=new THREE.Group(),Mi=new THREE.Matrix4().makeTranslation(-G.c.x,-G.c.y,-G.c.z),lots=new Map();
    for(const p of G.P)for(const e of p.L){const o=e[0],Mr=new THREE.Matrix4().multiplyMatrices(Mi,e[1]);
      if(fusSoudable(o)){const k=fusCle(o);let L=lots.get(k);if(!L)lots.set(k,L=[]);L.push([o.geometry,Mr,o]);}
      else{g.add(resuMaillage(o,Mr));dessins++;}}
    for(const L of lots.values()){if(L.length===1)g.add(resuMaillage(L[0][2],L[0][1]));else{const m=fusMaillage(L);g.add(m);RESU.geos.push(m.geometry);}dessins++;}
    if(!g.children.length)continue;
    /* LE DÉPART : sur les CÔTÉS et DEVANT (+z), pas plus haut que 2,3 m — la caméra de poursuite est à 5,4 m DERRIÈRE (−z), 1,9 m au-dessus, 90°
       d'ouverture (mesuré au banc) : au premier jet, un pan de toit de 2 m qui partait en hauteur et tournait de 195° passait devant
       l'objectif et couvrait la moitié de l'écran. Le tourbillon ne tourne plus que de 25 à 55°, et TOUJOURS vers l'avant (th0 de signe −sx). */
    const dx=G.c.x||(Math.random()-.5),sx=dx<0?-1:1,r=Math.random();
    const off=G.roue?new THREE.Vector3(sx*(2.2+r*1.2),.3+Math.random()*.7,.5+Math.random()*2.5)
      :new THREE.Vector3(sx*(2+r*1.8),.5+Math.random()*1.3+(G.haut?.5:0),1+Math.random()*4);
    const q0=new THREE.Quaternion().setFromAxisAngle(RESU_V.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),Math.PI*(.6+Math.random()));
    const d=G.roue?Math.random()*.08:G.haut?.26+Math.random()*(RESU.Dmax-.26):.1+Math.random()*.14;
    g.position.copy(G.c).add(off);g.quaternion.copy(q0);g.scale.setScalar(.001);
    E.push({g:g,P:G.c.clone(),off:off,q0:q0,d:d,roue:G.roue,spin:sx*Math.PI*(4+Math.random()*2),th0:-sx*(G.roue?.3+Math.random()*.3:.45+Math.random()*.5),ph:Math.random()*6.28,arr:false,tp:0});}
  E.sort(function(a,b){return a.d-b.d;});RESU.dessins=dessins;return E;}
function resuLance(){ // fin de chanceRepart (sous le volet) : les éclats apparaissent autour de la caisse
  resuFin(false);if(!RESU.on||!CAR_PIECES.length)return false;
  let E=null;try{E=resuBatit();}catch(e){console.warn('resurrection',e);E=null;}
  if(!E||!E.length){for(const g of RESU.geos)g.dispose();RESU.geos.length=0;return false;}
  const G=RESU.g=new THREE.Group();G.matrixAutoUpdate=false;for(const e of E)G.add(e.g);scene.add(G);
  RESU.E=E;RESU.t=0;RESU.n=0;RESU.tSon=0;RESU.actif=true;resuVue();
  try{if(SONV2)sfx('pwr.a',{vol:-5});}catch(e){} // les carillons et le souffle qui soulève : la magie commence
  return true;}
function resuTick(dt){ // (chanceTick : la pause fige la résurrection avec le reste)
  const R=RESU,t=(R.t+=dt),mw=carGroup.matrixWorld,vc=PT_U.uVc.value;
  const ap=Math.min(1,t/.22),sa=ap>=1?1:1+2.70158*Math.pow(ap-1,3)+1.70158*Math.pow(ap-1,2); // l'apparition : easeOutBack
  for(const c of R.E){const g=c.g,u=Math.max(0,Math.min(1,(t-R.T0-c.d)/R.Tv)),e=u*u*(2.2-1.2*u); // lente au départ, elle ARRIVE avec de la vitesse : le clac
    const k=Math.max(0,1-e),th=c.th0*Math.pow(k,1.5); /* (borné : à u = 1, e vaut 1,0000000000000002 — k négatif, pow → NaN, l'éclat posé disparaissait) */
    RESU_V.copy(c.off).applyAxisAngle(RESU_Y,th).multiplyScalar(k);RESU_V.y+=.14*Math.sin(t*5+c.ph)*k;
    g.position.copy(c.P).add(RESU_V);
    if(c.roue)g.quaternion.setFromAxisAngle(RESU_X,c.spin*k).multiply(RESU_Q2.setFromAxisAngle(RESU_Z,.5*k*Math.sin(t*7+c.ph)));
    else g.quaternion.copy(c.q0).slerp(RESU_Q.identity(),e);
    let s=sa;
    if(u>=1){if(!c.arr){c.arr=true;R.n++;resuClac(c,mw,vc);}c.tp+=dt;s=1+.14*Math.max(0,1-c.tp/.16);}
    else if(u>0){RESU_W.copy(g.position).applyMatrix4(mw);
      if(Math.random()<dt*45)spawnP(Math.random()<.55?sparkGold:sparkBlue,RESU_W.x,RESU_W.y,RESU_W.z,vc.x*.82+(Math.random()-.5)*2,vc.y*.82+Math.random()*1.5,vc.z*.82+(Math.random()-.5)*2,.32+Math.random()*.22); // la traînée : des étincelles d'or et de néon, lâchées sur place (la caisse les laisse derrière)
      if(Math.random()<dt*7)spawnP(neonPool,RESU_W.x,RESU_W.y,RESU_W.z,vc.x,vc.y,vc.z,.22);} // l'aura : une lueur néon qui colle à l'éclat
    g.scale.setScalar(s);}
  if(t<R.fin&&Math.random()<dt*40){const a=t*9+Math.random()*.4,rr=2.4*(1-t/R.fin)+.7; // LE TOURBILLON : des étincelles cyan qui montent en hélice autour de la caisse
    RESU_V.set(Math.cos(a)*rr,.2+2*t/R.fin,Math.sin(a)*rr+.4).applyMatrix4(mw);
    spawnP(sparkBlue,RESU_V.x,RESU_V.y,RESU_V.z,vc.x*.92-Math.sin(a)*4,vc.y+2.5,vc.z*.92+Math.cos(a)*4,.4);}
  if(t>=R.fin&&R.n>=R.E.length)resuFin(true);}
function resuClac(c,mw,vc){ // un éclat se verrouille : la gerbe, le tchonk qui monte d'une note, un tap dans la main
  RESU_W.copy(c.P).applyMatrix4(mw);
  for(let i=0;i<7;i++)spawnP(sparkGold,RESU_W.x,RESU_W.y,RESU_W.z,vc.x+(Math.random()-.5)*7,vc.y+Math.random()*5,vc.z+(Math.random()-.5)*7,.3+Math.random()*.2);
  const n9=performance.now();if(n9-RESU.tSon>55){RESU.tSon=n9;try{if(SONV2)sfx('spin.arret',{st:sonPd(Math.min(RESU.n-1,9)),vol:c.roue?-7:-9});}catch(e){}hap(5);}}
function resuFin(fete){ // la caisse revient (fete : la dernière pièce posée) — sinon le ménage d'une résurrection interrompue
  if(!RESU.actif&&!RESU.g)return;RESU.actif=false;
  if(RESU.g){scene.remove(RESU.g);RESU.g=null;}
  for(const g of RESU.geos)g.dispose();RESU.geos.length=0;RESU.E.length=0;
  if(!fete)return;
  carGroup.visible=true;RESU.plein=.4;
  const p=carGroup.position,vc=PT_U.uVc.value,q=carGroup.quaternion;
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2;RESU_V.set(Math.cos(a),0,Math.sin(a)).applyQuaternion(q); // L'ANNEAU DE NÉON qui part au ras de la route
    spawnP(neonPool,p.x+RESU_V.x*.8,p.y+.35,p.z+RESU_V.z*.8,vc.x+RESU_V.x*15,vc.y+RESU_V.y*15+.5,vc.z+RESU_V.z*15,.45);}
  for(let i=0;i<34;i++)spawnP(sparkGold,p.x,p.y+.6,p.z,vc.x+(Math.random()-.5)*16,vc.y+3+Math.random()*9,vc.z+(Math.random()-.5)*16,.45+Math.random()*.3);
  try{flashEcran('rgba(255,215,94,.4)');}catch(e){}
  try{if(SONV2)sfx('jeu.miracule',{vol:-2});}catch(e){}hap([18,40,26,60,40]);}
function resuVue(){ // au rendu : les éclats calés sur la caisse (qui a bougé cette image) — et le ménage si la course s'est arrêtée
  if(!started||gameOver||garageOn||mode==='boom'||!(CHANCE.inv>0)){resuFin(false);return;}
  const g=RESU.g;if(!g)return;g.position.copy(carGroup.position);g.quaternion.copy(carGroup.quaternion);g.scale.copy(carGroup.scale);g.updateMatrix();g.updateMatrixWorld(true);}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);if(RESU.actif)resuVue();};} // CHAÎNÉ (jamais réassigné)
window.dbgResu=function(k){ // banc : dbgResu() l'état · ('lance') la rejouer en course (bouclier compris)
  if(k==='lance'&&started&&!gameOver){CHANCE.inv=Math.max(CHANCE.inv,CHANCE.invD);resuLance();}
  const o={on:RESU.on,actif:RESU.actif,t:+RESU.t.toFixed(2),eclats:RESU.E.length,poses:RESU.n,dessins:RESU.dessins,pieces:CAR_PIECES.length,visible:carGroup.visible};
  if(k==='detail'&&RESU.g){const f=function(v){return [+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)];};o.g=f(RESU.g.position);o.gVis=RESU.g.visible;o.gPar=!!RESU.g.parent;o.car=f(carGroup.position);
    o.E=RESU.E.map(function(c){return {P:f(c.P),p:f(c.g.position),s:+c.g.scale.x.toFixed(3),arr:c.arr,vis:c.g.visible,n:c.g.children.length,mw:f(new THREE.Vector3().setFromMatrixPosition(c.g.matrixWorld))};});}
  return o;};
window.chanceEtat=chanceEtat;window.chanceJoue=chanceJoue;window.chanceRefuse=chanceRefuse;window.chanceAttend=chanceAttend; // (l'écran de mort, IDEE et les bancs les appellent hors de l'IIFE)
window.dbgChance=function(k){ // banc : dbgChance() l'état · ('mort') explose · ('joue') prend l'offre · ('t',s) vieillit la partie · ('$',n) n $ encaissés · ('choc') un choc
  if(k==='mort'&&started&&!gameOver&&mode!=='boom')explode('vide');
  if(k==='joue')return chanceJoue();
  if(k==='t'&&arguments.length>1)RUNX.t=+arguments[1];
  if(k==='$'&&arguments.length>1){money=START_CASH+(+arguments[1]);try{paintMoney();}catch(e){}}
  if(k==='choc'&&started&&!gameOver)explode('tour'); // pendant le bouclier : rien ne doit se passer
  const e=chanceEtat();return {ok:e.ok,prix:e.prix,reste:e.reste,offre:CHANCE.offre,used:CHANCE.used,inv:+CHANCE.inv.toFixed(2),bank:Math.round(bank()),money:Math.round(money),t:+(RUNX.t||0).toFixed(1),gameOver:gameOver,mode:mode,base:chanceBase()};};
/* LE ×2 DU GAIN (2026-10-19, Sacha au quiz : « ×2 sur le gain » ; « pub maison de 5 s » tant qu'AdMob n'est pas branché) — à l'écran de fin,
   la plaque ×2 · +$ N · ▶ PUB (#mDouble, voir « LE ×2 DU GAIN À L'ÉCRAN DE FIN ») : une pub vue jusqu'au bout, et ce que la partie a VERSÉ
   AU COMPTE (le grand chiffre vert, RUNX.verse) est versé une 2e fois. UNE fois par PARTIE (une seconde chance prise ne la rouvre pas : elle
   n'est proposée qu'à la mort qui finit vraiment la partie), jamais pendant l'offre de seconde chance ni pendant la machine à sous (chacune
   sa décision : elle attend qu'elles tombent), pas sous DBL.min $ ni au bac à sable, à l'auto-école, au parc, au Survivant, en balade.
   Sans régie (aujourd'hui : l'app v1 et le site), c'est la pub maison de 5 s qui la paie. Fermée avant la fin (vraie régie) : rien n'est
   versé, la plaque revient — on peut réessayer. Ce que la machine à sous verse après la mort n'est PAS doublé (RUNX.verse est figé à la mort).
   `?double=0` éteint tout. Banc : dbgDouble() l'état · ('joue') la touche. */
const DBL={on:!/[?&]double=0\b/.test(location.search),min:50,used:false,pub:false,v:0};
function dblRaz(){DBL.used=false;DBL.pub=false;DBL.v=0;}
function dblGain(){return Math.max(0,Math.floor(RUNX.verse!=null?RUNX.verse:bank()-(RUNX.bank0||0)));}
function dblEtat(){
  const v=dblGain();
  const ok=!!(DBL.on&&!DBL.used&&!DBL.pub&&started&&gameOver&&!SANDBOX&&!TUTO.on&&!TUTO.quitte&&!PARK.on&&!SURV.on&&!BALADE&&v>=DBL.min&&
    overlay.style.display!=='none'&&!garageOn&&!MENUV.retour&&!chanceAttend()&&!SPIN.ouvert&&!PUBR.on&&!ecranWipe._on&&document.querySelector('#mDead.on'));
  return {ok:ok,v:v,used:DBL.used,pub:DBL.pub};
}
function dblJoue(apres){ // le toucher de la plaque : la pub, puis le 2e versement — apres(vue, v) dit à l'écran de fin ce qui s'est passé
  const e=dblEtat();if(!e.ok)return false;
  DBL.pub=true;DBL.v=e.v;
  const lance=pubRecompense('double-gain',function(vue){DBL.pub=false;const v=DBL.v;
    const ok=!!(vue&&started&&gameOver&&!DBL.used&&v>0);
    if(ok){DBL.used=true;SAVE.d.bank=Math.min(1e30,bank()+v);gagneAjoute(v);bankMaxMaj();RUNX.verse=dblGain()+v;SAVE.flush();}
    try{if(apres)apres(ok,ok?v:0);}catch(e){console.warn('double',e);}});
  if(!lance){DBL.pub=false;return false;}
  return true;
}
window.dblEtat=dblEtat;
window.dbgDouble=function(k){if(k==='joue')return dblJoue(window.__dblApres||null);const e=dblEtat();return {ok:e.ok,v:e.v,used:DBL.used,pub:DBL.pub,min:DBL.min,bank:Math.round(bank()),verse:RUNX.verse};};
function finSonsCoupe(){
  if(!SONV2||!window.CCSON)return;
  try{window.CCSON.annuleFutur(0);for(let i9=0;i9<FIN_SONS.length;i9++)window.CCSON.stop(FIN_SONS[i9]);}catch(e){}
}
function resetGame(){
  dmtCoupe(); // (LE DEMI-TOUR) une nouvelle partie repart droite
  SPIN.pose=0; // (2026-10-14) LE FINAL SPIN : le plafond de jetons posés est par partie (ceux qu'on a ramassés restent dans la sauvegarde)
  secReset(); // (2026-10-14) LES DÉFIS SECRETS : chaque partie repart de zéro
  evtPartie(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : le tirage de la partie, AVANT newTrack (qui pose celui de la 1re zone)
  VEQ.dReq=false;VEQ.dDn=0;GLI.req=null;GLI.id=null;VEQ.sautAtt=0;figGVoit(null);gsolCoupe(); // (2026-10-14) un double-tap de l'écran de mort ne saute pas au départ de la partie suivante
  if(gameOver)finSonsCoupe(); // (2026-10-14, session SON) REJOUER : rien de la mort d'avant ne sonne dans la partie neuve
  SVOL.t=0;SVOL.k=0; // (2026-10-14, session SON) nouvelle partie : pas de tension héritée
  if(SF.neuf)SF.neuf=false;else{SF.tirage=[];if(PREB.on&&SF.prochain&&SF.prochainDer===SF.der&&!SF.force)SF.tirage[0]=SF.prochain;} // (2026-10-13) MODE CLASSIQUE : REJOUER tire une nouvelle suite — sauf celle que le JOUER vient de bâtir sous le voile · (2026-10-19, LE DÉPART D'AVANCE) sa 1re map tirée d'avance à l'écran de fin (prebDepCible), par la même règle
  PORTV.att=0;if(PORTV.el){clearTimeout(PORTV.tS);PORTV.el.style.transition='none';PORTV.el.style.opacity='0';} // (le passage en deux temps) un passage en attente ne survit pas à la partie
  try{hautVide();}catch(e){} // (2026-10-14, chasse aux bugs) RECOMMENCER depuis la pause ne passe ni par explode ni par endGame : une carte MOTEUR / DÉFI / RECORD en attente dans la file du haut (derrière le verrou d'une bannière de niveau) sortait dans la partie SUIVANTE — la file se vide ici aussi (auto-école : les cartes gardées restent, comme à l'explosion)
  try{engBigCoupe();engBig.vu=null;}catch(e){} /* (2026-09-30) vu : la dernière carte moteur montrée — une partie neuve repart de zéro */ /* (débogage son 2026-09-29) RECOMMENCER pendant la carte MOTEUR : la visseuse et le NOUVEAU SOMMET ne sonnent plus dans la partie suivante */
  try{busPlein();}catch(e){} // (2026-09-28) filet : une partie quittée depuis la pause ne laisse jamais la sortie audio au silence
  MENUV.retour=false; // (2026-09-28) on repart : l'accueil d'après-mort (accueilRetour) n'est plus la racine
  clearBoom();
  mortCause='';loop._nAir=false; // (2026-09-26) rien ne passe d'une partie à l'autre
  nitroOn=false;nitroBlue=false;nitroHeldT=0;loop._nOn=false;loop._nBl=false;SENS_NI.on=false; // (2026-10-14, chasse aux bugs) la NITRO ne passe pas d'une partie à l'autre : la porte de simulation de `loop` se ferme à `gameOver`/`paused`, donc mourir (ou ⏸) en tenant NITRO laissait nitroOn / loop._nOn / nitroHeldT à leur valeur — à la 1re image de la partie neuve le bloc nitro croyait la nitro VIENT de s'éteindre : PSSHT de relâche, langues de feu + pétarade aux pots, nez qui pique + vibration ; et, doigt posé dès le départ, le coup d'allumage était perdu (loop._nOn déjà vrai)
  TUTO.quitte=0;                 // (2026-09-28) la leçon quittée ne concerne que l'écran de fin qui la suit (une carrière relancée ne repasse pas par tutoDebut)
  if(TUTO.on)tutoDebut();        // (2026-09-26) RECOMMENCER à l'auto-école repart de la 1re consigne
  money=START_CASH; // on repart avec la mise de départ, jamais à sec
  enCoursRetire(); // (2026-09-30) RECOMMENCER abandonne la partie (« ses gains ne seront PAS versés ») : un instantané d'arrière-plan resté en mémoire ne la verserait pas en douce
  // LA CAISSE ÉQUIPÉE S'APPLIQUE (2026-08-03) — les règles de déblocage étant tranchées, le bouton
  // ÉQUIPER du garage sert enfin. « On repart en bas de l'échelle » reste vrai : ce qui redémarre à
  // zéro, c'est le MOTEUR et les 1,61 € ; la carrosserie, elle, est un choix cosmétique qui ne donne
  // ni vitesse ni valeur de pièces. `level` est FIXE pour toute la partie (plus de montée en course).
  level=equippedCar();levelCash=0;
  buildCar(CARS[level]);
  nitroR=2;nitroX=0;boost=0;combo=0;edgeT=0;momT=0;FREIN_L=0;MURC.psiK=0;styleM=0;fever=0;streak=0;slowT=0;gameOver=false;paused=false;insUsed=false;feverArmed=false;rollover=0;RALENTI.t=0;idleT=0;driftT=0;driftYaw=0;
  vdepPose();engSwapT=0; // le moteur se remonte à chaque run (c'est la progression DE LA PARTIE) — depuis LA VITESSE DE DÉPART (2026-10-19) il repart du cran choisi au garage (le cran 1 = zéro, comme avant)
  pwrNitroT=0;pwrAirT=0;pwrSpdT=0;pwrSpdK=0;pwrMagT=0;pwrAurT=0;pwrV2Raz();
  driftC=0;driftLv=0;driftEnCours=false;raseT=0;raseAnn=false;virT=0;virC=0;virD=false;virPaye=false;FRONDE.cd=0;FRONDE.n=0;FRONDE.pMax=0;PADCH.n=0;PADCH.sL=null;PADCH.max=0;yawR=0;slipB=0;glisse9=0;driftYaw=0;FROLE.n=0;FROLE.t=0; // (2026-09-25) une glisse ne survit pas à la partie (sinon MINI-TURBO fantôme au départ)
  nextRainAt=4e3*ECO3.gain;moneyRainT=0;sideCd=0;slipT=0;oilCd=0;
  rampCd=0;deathStop();fxStop(); // la mort précédente se tait : on repart, elle n'a plus rien à dire
  auraRun=0;auraPop=0;auraFlash=0;figCombo=0;figComboT=0;figComboAura=0;chaReset();CHA.v=0;CHA.vAff=-1;recInit(); // l'aura de la partie repart de zéro — la banque et le total à vie, eux, restent
  bounceN=0;airFlash=0;flightId=0;
  VEQ.sautF=-1;VEQ.dReq=false;GLI.req=null;VEQ.sautAtt=0;gsolCoupe(); // (2026-10-14, chasse aux bugs) le saut NITRO / la figure d'une partie ne passent pas à la suivante : flightId repart de 0 mais VEQ.sautF gardait le n° du dernier saut → le même n° de vol (normal) rendait 30 % de nitro à la pose ; double-tap et figure en cours périmés effacés
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0};runxReset();
  cloudInS=0;cloudFxEl.style.opacity=0;
  scene.fog.near=FOG_N;scene.fog.far=FOG_F;scene.fog.color.copy(FOG_BASE);
  moneyRainClear(); // (vague 2) la pluie de devises instanciée
  overlay.style.display='none';
  prebDepPrend(newTrack); // (2026-10-19, LE DÉPART D'AVANCE) la piste bâtie au menu ou à l'écran de fin peut servir (voir prebDepCible)
  if(PREB.cam){PREB.cam=false;frameAt(0,F);camera.up.set(0,1,0);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);camera.lookAt(F.p);} // (sous9 léger) la caméra du lâcher, comme closeGarage l'aurait posée au départ de la piste de sous9
  respawn();safeS=0;s=0;
  AIP.resetRun(); // les compteurs d'observation repartent avec la run
  survStart(); // APRÈS la piste neuve et s=0 : la meute encadre le vrai départ
  // ⚠ PLUS DE LARGAGE (2026-09-05, demande du user) : la caisse ne tombe plus du ciel sur la
  // tirelire — `respawn()` juste au-dessus la pose DÉJÀ au sol, roulante. Ce qui remplace la chute :
  // 3 s de BOOST OFFERT (`startBoostT`) — « pas dur à gérer » pour le joueur puisqu'il n'a RIEN à
  // tenir, la poussée tient la touche à sa place — et le logo qui brille au-dessus de la caisse.
  musicStartRun(true); // nouvelle partie → la playlist repart du début, en fondu, PENDANT le boost offert (LE DÉPART EN MUSIQUE)
  fireLaunchBoost();
  showMsg(pickL(GO_LINES),'#7dff9b');
  try{document.dispatchEvent(new Event('cc:jeu'));}catch(e){} // la course part ou s'arrête : les commandes le savent À L'INSTANT, pas au prochain tick
}
// Fin de run : les exploits de la partie rejoignent les compteurs À VIE. Cumuls pour ce qui se
// collectionne (figures, gaps, bumps), records pour ce qui se bat (zones, chaîne, vitesse).
// ⚠ appelé APRÈS l'écriture de `best` dans endGame : les conditions `cash` lisent ce record.
function commitExploits(){
  delete SAVE.d.enCours; // (2026-09-30) la partie est versée pour de vrai : l'instantané d'arrière-plan part dans le MÊME flush (voir enCoursPose)
  const ex=SAVE.d.ex;if(!ex)return [];
  /* (2026-09-29, audit « 10 premières minutes ») UNE LEÇON QUITTÉE N'EST PAS UNE PARTIE : elle comptait une partie jouée et posait son
     aura (~30) en RECORD — la leçon suivante criait « RECORD BATTU ! » au bout de 5 s. Seule la banque est versée (l'argent gagné reste). */
  const lecon=!!TUTO.quitte;
  if(!lecon){
  ex.eng=Math.max(ex.eng,engTier);
  const rs9=(CHANCE.used&&CHANCE.rs)||{tr:0,ga:0,bu:0,sv:0}; // (2026-10-14) SECONDE CHANCE : la 1re fin a déjà versé ces compteurs-là
  ex.tricks+=Math.max(0,(runStats.tricks|0)-rs9.tr);
  ex.gaps+=Math.max(0,(runStats.gaps|0)-rs9.ga);
  ex.bumps+=Math.max(0,(runStats.bumps|0)-rs9.bu);
  ex.surv+=Math.max(0,(runStats.surv|0)-rs9.sv);
  ex.zones=Math.max(ex.zones,runStats.zones|0);
  ex.chain=Math.max(ex.chain,runStats.chainMax|0);
  ex.kmh=Math.max(ex.kmh,Math.round(runStats.vmax)||0);
  if(!CHANCE.used)ex.runs++; // (une partie reprise reste UNE partie)
  try{const p9=SAVE.d.prof;if(p9)p9.dMax=Math.min(1e6,Math.max(p9.dMax||0,Math.round((RUNX.t||0)*10)/10));}catch(e){} // (2026-10-17) LE PROFIL : la plus longue partie (une reprise compte toute la partie, voir PLQ)
  }
  /* ---- LE VIREMENT ET L'AURA PARTENT EN PERSISTANT ------------------------------------------
     ⚠ ON NE VERSE QUE LES GAINS, PAS LE COMPTEUR. `money` démarre à `START_CASH` (1,61 €) à chaque
     partie : verser `money` tel quel créditerait 1,61 € offerts par run — de l'argent créé à partir
     de rien, qui finirait par acheter une caisse à force de lancer et quitter des parties.
     ⚠ ET ON NE VERSE QUE CE QUI A ÉTÉ ENCAISSÉ : la mallette en cours n'a jamais touché `money`,
     donc mourir en vol la perd, exactement comme avant. La banque ne rachète pas le bank-or-bust,
     elle en est la conséquence logique. */
  const vire=Math.max(0,money-chanceBase())||0; /* (2026-10-14) SECONDE CHANCE : après une reprise, seulement ce qui a été gagné depuis */ // (2026-10-14, chasse aux bugs) un `money` NaN faisait bank=NaN (Math.max/min propagent NaN) : écrit null dans le JSON, relu 0 — TOUTE la banque perdue, pas seulement la partie · `||0` : une partie au montant illisible ne verse rien, la banque reste
  SAVE.d.bank=Math.min(1e30,bank()+vire);gagneAjoute(vire);bankMaxMaj();
  if(!lecon)jourCommit(); /* (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR ×2, plus un bonus de SÉRIE ») la partie COMPTE : le jour est marqué, la série monte, la prime de série entre en banque (voir JOUR) */
  const rangAvant=auraRank();
  /* (2026-10-25) LE GRAPHE D'AURA de l'écran de mort : la MOYENNE et le RECORD d'AVANT cette partie (une reprise garde ceux de sa 1re fin),
     puis la partie entre dans la moyenne — une seule fois par partie, la reprise n'ajoute que son surplus, comme SAVE.d.aura. */
  if(!lecon){const h9=SAVE.d.auraH||(SAVE.d.auraH={s:0,n:0}),a9=Math.max(0,Math.round(auraRun));
    if(!CHANCE.used){commitExploits._moy=h9.n>0?h9.s/h9.n:0;commitExploits._recAvant=SAVE.d.auraMax||0;h9.n++;h9.s+=a9;}
    else h9.s+=Math.max(0,a9-(CHANCE.a0||0));}
  if(!lecon){SAVE.d.aura=(SAVE.d.aura||0)+Math.max(0,Math.round(auraRun)-(CHANCE.used?CHANCE.a0:0)); // (SECONDE CHANCE : l'aura d'avant la reprise est déjà versée)
  SAVE.d.auraMax=Math.max(SAVE.d.auraMax||0,Math.round(auraRun));} // le MAX d'une partie : c'est LUI qu'on affiche comme objectif
  commitExploits._vire=CHANCE.used?Math.max(0,vire+CHANCE.v1-CHANCE.prix):vire; // relus par l'écran de fin (après une reprise : toute la partie, prix déduit)
  commitExploits._aura=Math.round(auraRun);
  commitExploits._rangMonte=auraRank()>rangAvant;  // un rang franchi se crie
  const got=carScan();
  commitExploits._neuves=got.length; // (console de son) l'écran de mort fait sonner la caisse gagnée à cette fin de partie
  SAVE.flush();
  return got;
}
/* (2026-09-30) LA PARTIE INTERROMPUE. iOS tue sans prévenir une appli restée en arrière-plan ; la banque, l'aura et les exploits d'une
   partie ne partaient au disque que par commitExploits (la FIN de partie) — une course en cours à la mise en veille était PERDUE,
   record excepté (`best` s'écrit en direct). Au passage en arrière-plan on pose donc ce qu'un QUITTER verserait À CET INSTANT, aux
   règles de endGame + commitExploits : l'argent ENCAISSÉ seulement (la mallette en vol reste en jeu), la chaîne d'aura ouverte AU SOL
   encaissée (chaineEncaisse), la frénésie qui tient comptée pour son record (frenFin), le score au Top 10. SAVE.load le verse si
   l'appli a été tuée. C'est un INSTANTANÉ, jamais un incrément : le reposer l'écrase — deux arrière-plans de suite ne versent qu'une
   fois. Il part au retour (enCoursRetire) et à tout versement réel (commitExploits) : le disque n'a jamais À LA FOIS la banque
   créditée et l'instantané. Bac à sable, auto-école et parc : rien n'est posé. */
function enCoursPose(){
  try{
    if(!(started&&!gameOver&&!SANDBOX&&!TUTO.on&&!PARK.on))return false;
    const g=(CHA.n&&mode==='drive'&&running)?Math.round(CHA.pts*Math.max(1,CHA.x)):0; // endGame : chaineEncaisse() au sol seulement
    const rs9=(CHANCE.used&&CHANCE.rs)||{tr:0,ga:0,bu:0,sv:0}; // (2026-10-14) SECONDE CHANCE : la 1re fin a déjà versé sa part
    SAVE.d.enCours={v:Math.max(0,money-chanceBase()),a:Math.max(0,Math.round(auraRun)-(CHANCE.used?CHANCE.a0:0))+Math.max(0,g),e:engTier|0,
      tr:Math.max(0,(runStats.tricks|0)-rs9.tr),ga:Math.max(0,(runStats.gaps|0)-rs9.ga),bu:Math.max(0,(runStats.bumps|0)-rs9.bu),sv:Math.max(0,(runStats.surv|0)-rs9.sv),zo:runStats.zones|0,ch:runStats.chainMax|0,
      km:Math.round(runStats.vmax)||0,s:Math.round(money),f:(FLOW.lv===4&&FREN.t>0)?Math.floor(FREN.t*10)/10:0};
    jourCommit(); /* (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR ×2 ») une partie du jour tuée en arrière-plan marque le jour AUSSI : sinon on la tuait d'un balayage puis on rejouait un 2e ×2 le même jour (idempotent : jourCommit ne paie qu'une fois par partie) */
    return true;
  }catch(e){return false;}
}
function enCoursRetire(){try{if(SAVE.d&&SAVE.d.enCours){delete SAVE.d.enCours;SAVE.flush();}}catch(e){}} // l'appli est revenue : la partie continue, c'est elle qui versera
function endGame(){
  nitroOn=false;nitroBlue=false; // (2026-10-14, revue des idées de Léo) mort nitro tenue : nitroOn restait vrai au garage et au ciel — le DOGE gardait sa gueule de nitro, grande ouverte, jusqu'à la partie suivante
  try{busPlein();}catch(e){} // (2026-09-28) même filet : QUITTER depuis la pause (sortie en fondu) ne doit pas rendre le menu muet
  if(SANDBOX&&started&&!gameOver){ sandRevive(); return; } // ENTRAÎNEMENT : la mort n'est qu'un replacement — aucun score n'est enregistré
  if(TUTO.on&&started&&!gameOver){ sandRevive(); if(TUTO.i>=TUTO_ETAPES.length)return; if(TUTO.i>=3&&TUTO.i<5){TUTO.i=2;TUTO.air=0;} tutoAffiche('RATÉ ! ON RECOMMENCE'); return; } /* (2026-10-14) à l'étape FIGURE on reste à la FIGURE */ // AUTO-ÉCOLE : on ne meurt pas en apprenant
  try{mortsVerse();}catch(e){} // (2026-09-30) le temps du dernier niveau rejoint la sauvegarde (flush plus bas)
  if(FLOW.lv===4)frenFin(true); // (v3) une frénésie encore en cours (QUITTER, fin de campagne) compte pour l'écran de fin et le record
  if(mode!=='boom')mortCause=''; // (2026-09-26) QUITTER n'est pas une mort : pas la cause de la partie d'avant
  try{campStop();}catch(e){} // (2026-09-27) éclairs, caisse-nuage, plaque : rien ne reste figé derrière l'écran de fin
  try{rainbowCoupe();nfeuCoupe();}catch(e){} // (2026-10-07) l'arc-en-ciel de pixels brûle encore pendant l'explosion : la boucle s'arrête ici, il ne doit pas rester figé
  try{if(CHA.n&&mode==='drive')chaineEncaisse();}catch(e){} // (2026-09-26) la chaîne d'aura ouverte est encaissée, pas oubliée
  gameOver=true;airPie.style.display='none';chainHud.style.opacity=0;caseHud.style.opacity=0;
  musicStop(true);setTimeout(function menuApres(){if(!gameOver)return;if(PUBR.on||ecranWipe._on){setTimeout(menuApres,400);return;}musicMenu();},1400); /* (chasse aux bugs) CONTINUER touché avant 1,4 s : le lobby ne repart pas PAR-DESSUS la pub récompensée (pubSilence l'a fait taire) ni sous le volet d'une reprise — il attend qu'ils rendent la main */ // TAPE-STOP de fin, puis la musique du menu revient, étouffée
  lastAlertEl.style.display='none';vChip('');for(const l9 of gyroLights)l9.intensity=0; // la poursuite s'éteint avec la caisse — (2026-09-30) et la plaque du Survivant au téléphone
  botJetLight.intensity=0;for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;}
  if(sirG)sirG.gain.setTargetAtTime(0,AC.currentTime,.3);
  if(SURV.on)survRender(); // classement final figé
  if(gainN)gainN.gain.setTargetAtTime(0,AC.currentTime,.2);
  if(windG)windG.gain.setTargetAtTime(0,AC.currentTime,.2);
  if(engLfoG)engLfoG.gain.setTargetAtTime(0,AC.currentTime,.2);
  if(engWhineG)engWhineG.gain.setTargetAtTime(0,AC.currentTime,.2);
  // ⚠ les couches mécaniques aussi : elles vivent hors du `gainN` principal (boîte, pont et
  // frein moteur y sont branchés en parallèle). Les oublier laissait un sifflement de boîte
  // tourner en boucle sur l'écran de fin, sans rien à l'écran pour l'expliquer.
  for(const n9 of [transG,diffG,ovrG,engTickG,pinkG])if(n9)n9.gain.setTargetAtTime(0,AC.currentTime,.2);
  for(const n9 of [whG,pluieG,skidG,GOM.sG,GOM.gG,GOM.respG,jrG,jrDep,jetG,jetLowG,jetOscG,RUG.rgG,RUG.thG,RUG.crG])if(n9)n9.gain.setTargetAtTime(0,AC.currentTime,.12); // (2026-09-26) sifflement d'air, crissement et flamme nitro : QUITTER en plein boost les laissait tourner au menu
  nA=0;loop._jetWas=false;
  pwrNitroT=pwrAirT=pwrSpdT=0;pwrSpdK=0;pwrMagT=pwrAurT=0;pwrV2Raz();pwrChip.style.display='none';loop._pch='';loop._pfx='';{const f9=avE('pwrFx');if(f9)f9.classList.remove('on');} // les pouvoirs meurent avec la caisse
  if(DRS)DRS.g.gain.setTargetAtTime(0,AC.currentTime,.05);if(RSN)RSN.g.gain.setTargetAtTime(0,AC.currentTime,.05); // QUITTER depuis la pause : la charge du drift et la bande rugueuse ne ronflent plus sur l'écran de mort
  charge9=0;ovr9=0;
  if(!TUTO.quitte&&!SANDBOX&&!PARK.on)AIP.commit(); // ta manière de jouer entre dans la mémoire des poursuivantes — (2026-09-30) pas une leçon quittée, le bac à sable ni le parc (⚠ QUITTER baisse SANDBOX le temps de cet appel : c'est AIP.tick qui n'y observe rien)
  SAVE.d.best=best;SAVE.flush(); // fin de run : tout part sur le disque, quoi qu'il arrive
  const sc=Math.round(money);
  const q=lbQualifies(sc);
  const isTop=q&&(!leaders.length||sc>leaders[0].s);
  ovSub.textContent=TR('GAME OVER');ovSub.style.display='';
  tagline.textContent=TR(pickL(isTop?END_TOP:END_LINES));tagline.style.display=''; // la punchline de fin — même la mort a du style
  const gagnees=commitExploits();try{m2Fin();}catch(e){console.warn('m2Fin',e);} /* (2026-10-16) LES MISSIONS v2 : la partie entière se juge ici */ // les exploits de la run entrent au compteur À VIE → nouvelles caisses
  try{RUNX.verse=Math.max(0,Math.floor(bank())-Math.floor(RUNX.bank0||0));}catch(e){} // (2026-09-29) VERSÉS AU COMPTE figé à la mort : un achat au garage ne le fait plus baisser
  setBestChip();
  runStatsEl.style.display='block';
  /* LE RELEVÉ DE FIN DE PARTIE. L'ordre compte : d'abord ce qu'on a FAIT (les exploits), puis ce que
     ça RAPPORTE (le virement, l'aura). Le joueur doit lire la cause avant l'effet — c'est ce qui
     donne envie de relancer, plus qu'un solde brut. */
  const vire=commitExploits._vire||0, auraG=commitExploits._aura||0;
  runStatsEl.textContent=TR('FIGURES')+' '+runStats.tricks+' · '+TR('CHAÎNE MAX')+' '+(runStats.chainMax||0)+' · '+TR('BUMPS')+' '+runStats.bumps
    +' · '+TR('ZONES')+' '+runStats.zones+' · '+TR('GAPS')+' '+runStats.gaps+' · '+TR('VMAX')+' '+Math.round(runStats.vmax)+' KM/H'
    +'\n'+TR('VIREMENT')+' +'+fmtC(vire)+'  →  '+TR('COMPTE')+' '+fmtC(bank())
    +'   ✦ '+TR('AURA')+' +'+auraG+(auraSansNom()?'':'  →  '+auraRankName())
    +(commitExploits._rangMonte?'   ★ '+TR('NOUVEAU RANG !'):'')
    +(gagnees.length?'\n'+TR('🔑 DÉBLOQUÉ : ')+gagnees.map(i=>TR(CARS[i].name)).join(' · '):'');
  finalScore.style.display='block';
  finalScore.textContent=fmt(money)+(isTop?'  🏆 RECORD':'');
  goTxt.textContent=TR('Prêt à repartir ?');
  /* ⚠ PLUS DE SAISIE DE NOM (2026-09-25). Le Top 10 est LOCAL, sur un téléphone à un seul joueur : tant
     qu'il avait moins de 10 lignes, CHAQUE partie « qualifiait » — une partie à 2 $ affichait « ★ NOUVEAU
     RECORD — TON NOM » sous un record de 24 $ (le jeu mentait) et bloquait REJOUER derrière un clavier.
     Le score s'inscrit donc tout seul, sous le dernier nom signé ; le VRAI record se crie dans le titre
     de l'écran de mort (« NOUVEAU RECORD ! »), et nulle part ailleurs. */
  pendingScore=null;nameEntry.style.display='none';goTxt.style.display='';
  if(q){
    leaders.push({n:SAVE.d.pseudo||'TOI',s:sc});
    leaders.sort(function(a,b){return b.s-a.s;});
    if(leaders.length>10)leaders.length=10;
    saveLeaders();
  }
  renderLeaders(q?leaders.findIndex(function(e){return e.s===sc;}):-1);
  try{chanceOuvre(mode==='boom',sc,q);}catch(e){} // (2026-10-14) LA SECONDE CHANCE (voir CHANCE)
  overlay.style.display='flex';
  hautVide(); // l'écran de mort récapitule moteur et défis : la file du haut n'a plus rien à dire
  try{document.dispatchEvent(new Event('cc:jeu'));}catch(e){} // la course part ou s'arrête : les commandes le savent À L'INSTANT, pas au prochain tick
}
function start(){
  if(started||document.getElementById('splash'))return;started=true;
  SF.neuf=false; // (2026-10-13) la 1re partie roule sur la piste bâtie sous le voile du JOUER : son tirage est consommé
  loop._rebuildT=performance.now();loop._rebuildD=5000; // (tour 2) le départ hache (1ers shaders Metal, 1res textures) : pas une lenteur — 5 s de grâce
  runxReset(); // les compteurs de CONTRAT partent de zéro dès la 1re partie de la session
  AIP.resetRun(); // (2026-09-30) …et ceux du Drivatar : seul resetGame() les remettait à zéro
  // la caisse ÉQUIPÉE dès la première partie de la session (le rejeu le faisait déjà)
  {const e9=equippedCar();if(level!==e9){level=e9;buildCar(CARS[e9]);}levelCash=0;}
  // ⚠ BUG CORRIGÉ (2026-09-05) : « ça recommence trop haut » (retour du user). `respawn()` remet
  // `introD`/`hopY` à zéro — INDISPENSABLE ici parce que la scène de fond du MENU tourne
  // `setupIntroPig()` en boucle (le largage décoratif derrière le splash, `introD=true,hopY=13`
  // au lâcher) et `start()` ne l'appelait JAMAIS avant : sur le TOUT PREMIER lancement d'une
  // session, la partie démarrait avec le `hopY` du décor encore en pleine chute (mesuré : 7,08 au
  // moment du clic JOUER) — la caisse apparaissait donc en l'air, au-dessus de la piste, au lieu
  // d'être posée. Les REJOUERS ne l'ont jamais vu : `resetGame()` appelle déjà `respawn()`. `start()`
  // est le seul chemin de la PREMIÈRE partie et ne passait par aucun des deux.
  respawn();
  evtPartie(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : le tirage de la 1re partie de la session, avant campDebut
  campDebut(); // (2026-09-27) la 1re partie de la session roule sur la piste du MENU (pas de newTrack) : sa zone s'arme ici aussi
  recInit(); // (2026-09-26) le RECORD À BATTRE dès la 1re partie de la session — seul `resetGame()` le posait, le crochet manquait au premier départ
  // ⚠ BUG AUDIO CORRIGÉ (2026-09-05) : `initAudio()` n'a AUCUN garde interne — elle CRÉE un
  // `AudioContext` à chaque appel, point. Comme le garage se visite maintenant AVANT `start()`
  // (le splash y atterrit directement), `AC` peut déjà exister au moment où `start()` tourne (voir
  // plus bas, `hide()` l'initialise dès le splash pour que les sons du garage — chime, impact — ne
  // soient plus muets). Appeler `initAudio()` sans garde ICI aurait alors fabriqué un SECOND
  // contexte : l'ancien restait connecté et jouait tout seul en arrière-plan, hors de portée des
  // boutons SON/MUSIQUE/VOIX (qui n'agissent que sur le `AC` COURANT) — un son qui ne s'éteint
  // jamais, quoi qu'on coche. `if(!AC)` est le même garde déjà posé sur `playMusic`/`musicStartRun`.
  if(!AC){try{initAudio();}catch(e){}}
  deathPreload();fxPreload(); // les sons de mort et d'argent sont prêts avant le premier trick
  overlay.style.display='none';
  running=true;
  paintMoney(); // la mise de départ et la bonne devise, tout de suite
  survStart(); // le mode armé au menu s'active pour cette première run
  musicStartRun(true); // la bande-son démarre avec la partie, en fondu, pendant le boost offert (LE DÉPART EN MUSIQUE)
  try{document.dispatchEvent(new Event('cc:jeu'));}catch(e){} // la course part ou s'arrête : les commandes le savent À L'INSTANT, pas au prochain tick
}
