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
/* ============================================================================
   LE MENU — LE LOGO QU'ON CASSE (2026-08-18)
   ----------------------------------------------------------------------------
   ⚠ LE CLIC N'IMPORTE OÙ EST SUPPRIMÉ. C'était lui, le « jeu mobile » : tout l'écran était un
   bouton, donc rien n'était un bouton. Le menu a désormais UNE action primaire (Jouer) et le logo
   est libéré pour autre chose. Plus de sélecteur de niveau ici (2026-09-03) : la radio choisit
   elle-même son morceau au hasard, voir `musicStartRun`.
   ========================================================================== */
/* ---- LE LOGO SE CASSE ET LÂCHE QUELQUE CHOSE ------------------------------------------------
   Le wordmark n'est plus un bouton de démarrage : c'est un objet qu'on frappe. Chaque clic le
   secoue, en fait gicler des tessons, et lâche UN jeton tiré au sort.
   ⚠ LES RARETÉS SONT LA MÉCANIQUE, pas la décoration. Si tout tombait à égalité il n'y aurait
   aucune raison de recliquer : c'est de savoir que le trèfle à quatre feuilles existe — et qu'on
   ne l'a pas encore vu — qui fait retaper sur le logo. Le poids est donc décroissant, et le
   dernier est volontairement presque introuvable. */
/* ⚠ LES SYMBOLES DE L'INTRO, PAS DES EMOJI (2026-08-18). Un emoji est dessiné par le SYSTÈME : il
   arrive avec sa propre facture, ses propres couleurs, son propre style — sur un jeu à la direction
   artistique tenue, ça fait autocollant. Les glyphes typographiques ($ ♥ ♣ ☠ € ¥ ♦), eux, sont
   rendus dans NOTRE police et NOS couleurs : ils appartiennent au jeu. C'est exactement le
   vocabulaire de la fission de l'intro — le logo relâche ce dont il est fait. */
/* ⚠ LE SÉLECTEUR \uFE0E N'EST PAS DÉCORATIF. ♦ ♥ ♣ ☠ ont une PRÉSENTATION EMOJI par défaut sur
   macOS et iOS : sans lui, le système les remplace par ses pictos couleur — exactement le « cheap »
   qu'on voulait fuir. VS-15 force la présentation TEXTE, donc notre police et notre couleur. */
const VS='\uFE0E';
const JETONS=[
  {g:'$',        c:'#ffd75e',n:'DOLLAR',       p:26},
  {g:'€',        c:'#9ad8ff',n:'EURO',         p:20},
  {g:'♦'+VS,     c:'#ff9d2e',n:'CARREAU',      p:15},
  {g:'♥'+VS,     c:'#ff5e8a',n:'CŒUR',         p:13},
  {g:'♣'+VS,     c:'#54e07a',n:'TRÈFLE',       p:11},
  {g:'¥',        c:'#ffc46b',n:'YEN',          p:8},
  {g:'☠'+VS,     c:'#e8e8f0',n:'TÊTE DE MORT', p:5},
  {g:'1.61',     c:'#fff2be',n:'LE NOMBRE D\'OR',p:2}   // ~1 clic sur 50 : la signature du studio
];
let butinVus={},logoCd=0;
function jetonTire(){
  let tot=0;for(const j of JETONS)tot+=j.p;
  let r=Math.random()*tot;
  for(const j of JETONS){r-=j.p;if(r<=0)return j;}
  return JETONS[0];
}
function logoCasse(ev){
  const h1=overlay.querySelector('h1');if(!h1)return;
  const now=performance.now();
  if(now-logoCd<260)return;               // anti-matraquage : sans ça le clic répété fait un stroboscope
  logoCd=now;
  const r=h1.getBoundingClientRect();
  const cx=(ev&&ev.clientX)||r.left+r.width/2, cy=(ev&&ev.clientY)||r.top+r.height/2;
  try{noiseBurst(.46,.10,2600);subBoom(.62);}catch(e){}  // le CHOC : un craquement sec + un coup sourd
  /* ⚠ REDUCED_MOTION : ni secousse, ni onde, ni éclats, ni gerbe — que du FONDU. Le jeton tiré apparaît
     sur place et s'efface (une dissolution, pas un mouvement) ; le butin et le carillon restent : le
     jouet garde sa mécanique de rareté, il perd seulement son explosion. (La règle CSS
     `#overlay h1{animation:none}` ne suffisait pas : `#overlay h1.casse` est plus spécifique.) */
  if(REDUCED_MOTION){
    const j=jetonTire();
    const el=document.createElement('div');el.className='jeton';
    el.textContent=j.g;el.style.color=j.c;
    el.style.left=cx+'px';el.style.top=cy+'px';el.style.transform='translate(-50%,-50%)';
    document.body.appendChild(el);
    el.animate([{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.7},{opacity:0}],{duration:1400}).onfinish=()=>el.remove();
    logoButin(j);
    return;
  }
  h1.classList.remove('casse');void h1.offsetWidth;h1.classList.add('casse'); // relance l'animation
  /* --- L'ONDE : elle part du point frappé et s'ouvre. C'est elle qui donne l'ÉCHELLE au choc —
     sans onde, une gerbe de particules ressemble à un feu d'artifice de fête foraine. */
  const on=document.createElement('div');on.className='casseOnde';
  on.style.left=cx+'px';on.style.top=cy+'px';document.body.appendChild(on);
  on.animate([{transform:'translate(-50%,-50%) scale(.15)',opacity:.85,borderWidth:'6px'},
              {transform:'translate(-50%,-50%) scale(3.2)',opacity:0,borderWidth:'1px'}],
    {duration:640,easing:'cubic-bezier(.12,.75,.3,1)'}).onfinish=()=>on.remove();
  /* --- LES ÉCLATS : RADIAL, PAS UNIDIRECTIONNEL.
     ⚠ l'ancienne version ajoutait `+70` au Y de tous les éclats : ils partaient donc tous VERS LE
     BAS quel que soit leur angle, et la casse « tombait d'un seul sens ». La gravité arrive
     maintenant APRÈS, dans une 3e image-clé — l'explosion s'ouvre d'abord en étoile, PUIS retombe.
     C'est la différence entre une gerbe et une chute. */
  for(let i=0;i<26;i++){
    const t=document.createElement('div');t.className='tesson';
    const a=Math.random()*6.2832, d=80+Math.random()*260, spin=Math.random()*900-450;
    t.style.left=cx+'px';t.style.top=cy+'px';
    t.style.height=(7+Math.random()*16)+'px';
    t.style.opacity=.5+Math.random()*.5;
    document.body.appendChild(t);
    const ex=Math.cos(a)*d, ey=Math.sin(a)*d;
    t.animate([
      {transform:'translate(-50%,-50%) rotate('+(a*57)+'deg) scale(1)',opacity:1},
      {transform:'translate('+(ex*.62-.5)+'px,'+(ey*.62)+'px) rotate('+(a*57+spin*.5)+'deg) scale(.9)',opacity:.95,offset:.34},
      {transform:'translate('+ex+'px,'+(ey+150+Math.random()*90)+'px) rotate('+(a*57+spin)+'deg) scale(.4)',opacity:0}],
      {duration:780+Math.random()*420,easing:'cubic-bezier(.10,.62,.35,1)'}).onfinish=()=>t.remove();
  }
  /* --- LA GERBE DE SYMBOLES : plusieurs jaillissent, dans TOUTES les directions. Le jeton TIRÉ est
     le plus gros et part vers le haut (c'est lui qu'on doit lire) ; les autres sont du décor pris
     dans la même explosion, et c'est eux qui rendent le geste généreux. */
  const j=jetonTire();
  const gerbe=5+((Math.random()*4)|0);
  for(let i=0;i<gerbe;i++){
    const k=JETONS[(Math.random()*JETONS.length)|0];
    const el=document.createElement('div');el.className='jeton petit';
    el.textContent=k.g;el.style.color=k.c;
    el.style.left=cx+'px';el.style.top=cy+'px';
    document.body.appendChild(el);
    const a=Math.random()*6.2832, d=90+Math.random()*230;
    el.animate([
      {transform:'translate(-50%,-50%) scale(.3) rotate(0deg)',opacity:0},
      {transform:'translate('+(Math.cos(a)*d*.7)+'px,'+(Math.sin(a)*d*.7-40)+'px) scale(1) rotate('+(Math.random()*90-45)+'deg)',opacity:1,offset:.30},
      {transform:'translate('+Math.cos(a)*d+'px,'+(Math.sin(a)*d+230)+'px) scale(.55) rotate('+(Math.random()*260-130)+'deg)',opacity:0}],
      {duration:1000+Math.random()*500,easing:'cubic-bezier(.16,.6,.35,1)'}).onfinish=()=>el.remove();
  }
  // LE JETON TIRÉ : plus gros, plein axe, il monte et retombe — impossible de le confondre avec le décor
  const el=document.createElement('div');el.className='jeton';
  el.textContent=j.g;el.style.color=j.c;
  el.style.left=cx+'px';el.style.top=cy+'px';
  document.body.appendChild(el);
  const dx=(Math.random()-.5)*90;
  el.animate([{transform:'translate(-50%,-50%) scale(.35) rotate(0deg)',opacity:0},
              {transform:'translate(calc(-50% + '+dx*.4+'px),-160px) scale(1.5) rotate(9deg)',opacity:1,offset:.34},
              {transform:'translate(calc(-50% + '+dx+'px),-118px) scale(1.28) rotate(-4deg)',opacity:1,offset:.64},
              {transform:'translate(calc(-50% + '+dx*1.3+'px),180px) scale(.9) rotate(16deg)',opacity:0}],
    {duration:1500,easing:'cubic-bezier(.25,.5,.4,1)'}).onfinish=()=>el.remove();
  logoButin(j);
}
function logoButin(j){ // le compte du butin + le carillon (commun à la casse et à sa version sans mouvement)
  butinVus[j.n]=(butinVus[j.n]||0)+1;
  const bu=$('butin');
  const rare=j.p<=5;
  if(bu){
    bu.textContent=TR(j.n)+(butinVus[j.n]>1?'  ×'+butinVus[j.n]:'')+(rare?'  ·  RARE':'');
    bu.style.color=rare?j.c:'#6f6690';
  }
  try{chimeNote(rare?1568:880,0,.14,rare?.30:.16);}catch(e){}
  if(j.p<=2){try{fanfare();}catch(e){}}   // le nombre d'or mérite la fanfare
}
overlay.addEventListener('click',function(e){
  if(pendingScore!=null)return;
  const h1=overlay.querySelector('h1');
  if(h1&&h1.contains(e.target)){logoCasse(e);return;}  // LE LOGO EST UN JOUET, plus un bouton de départ
});
$('playBtn').addEventListener('click',function(e){
  e.stopPropagation();
  playViaGarage(); // « on ne peut jouer que depuis le garage » (2026-09-05) — voir playViaGarage()
});
$('resetBtn').addEventListener('click',()=>{if(started){resetGame();}});
// ---- sauvegarde : exporter / restaurer par code (le clic ne doit PAS relancer la partie) ----
const expBtn=$('saveExp'),impBtn=$('saveImp');
function btnFlash(b,txt){const o=b.innerHTML;b.innerHTML=txt;setTimeout(()=>{b.innerHTML=o;},1600);}
expBtn.addEventListener('click',e=>{e.stopPropagation();
  const code=SAVE.export();
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(code).then(()=>btnFlash(expBtn,pxi('coche')+' '+TR('COPIE !')),()=>prompt(TR('Copie ce code :'),code));
  else prompt(TR('Copie ce code :'),code); // vieux navigateurs : la boîte fait le travail
});
impBtn.addEventListener('click',e=>{e.stopPropagation();
  const c=prompt(TR('Colle ton code de sauvegarde :'));
  if(c==null)return; // annulé
  /* ===== LA RESTAURATION DU MENU ORDINATEUR (24/10, relecture : « le bouton RESTAURER UN CODE du menu ?pc=1 ») ===== deux trous que
     l'ENTRER UN CODE des réglages du téléphone avait déjà bouchés (moteur/mobile-tactile.js) : (1) le SITE ne garde rien (SAVE.neuf) —
     import puis rechargement rendaient un compte VIDE, la session en cours partie avec : on refuse ; (2) une fois le code posé, plus
     AUCUNE écriture jusqu'au rechargement (SAVE.natif=2) : le passage en arrière-plan qui l'accompagne versait sinon la partie en cours
     (enCoursPose) dans la sauvegarde restaurée. */
  if(SAVE.neuf){let s9=false;try{s9=typeof JSON.parse(decodeURIComponent(escape(atob(String(c).trim())))).v==='number';}catch(er){}if(s9){btnFlash(impBtn,pxi('croix')+' '+TR('LE SITE NE RESTAURE PAS LES SAUVEGARDES'));return;}}
  if(SAVE.import(c)){SAVE.natif=2;btnFlash(impBtn,pxi('coche')+' '+TR('RESTAURE — RECHARGE…'));setTimeout(()=>location.reload(),900);}
  else btnFlash(impBtn,pxi('croix')+' '+TR('CODE INVALIDE'));
});
// ---------- MODE SURVIVANT v2 : 7 VRAIES voitures de police sur la piste — la POURSUITE ----------
// Chaque IA est incarnée : elle roule, dépasse, défend, se rate, revient. Le classement = la DISTANCE
// parcourue (survPTot() pour le joueur — SURV.pBase+s, la dalle survolée en vol : les écarts survivent aux portails, téléportation invisible).
// Couperet toutes les 60 s : le DERNIER explose. LOD partout : sim 1D permanente, mesh+gyros seulement
// à portée de vue, 2 vraies lumières (pool) pour les plus proches, sirène unique dosée à la distance.
const SURV={armed:false,on:false,t:0,over:false,_r:0,pBase:0,ph:0,last:false};
SURV.bots=[];
// (2026-09-30) OÙ EN EST LE JOUEUR DANS LA COURSE — UNE seule formule pour le classement, la plaque, la sirène, le LOD et le couperet.
// En VOL, `s` reste figé au DÉCOLLAGE : le Survivant classique te jugeait là (bip « dernier » en plein saut, et une minute tombée en
// l'air t'abattait quand la pose t'aurait remis devant) ; la poursuite et la plaque du niveau 14 lisaient déjà la dalle survolée.
function survPTot(){return SURV.pBase+(mode==='fall'?lastNearS:s);}
// …et ce que le PORTAIL verse au compteur : franchi EN VOL, `s` vaut encore le décollage (des centaines de mètres de classement perdus
// d'un coup, la meute passait devant) — on compte au moins l'entrée de l'ovule, L−80, la référence du raccourci (portailPasse).
function survPortS(){return mode==='fall'?Math.max(s,L-80):s;}
// personnalités : plus PERSONNE n'a de bonus de vitesse — tout le monde a TA caisse et TES lois.
// La différence se joue au CERVEAU : agro = dépasse/bloque · err = fréquence des fautes ·
// rea = délai de réaction (s, comme un humain) · line = propreté de trajectoire et des points de corde
const SURV_PILOTS=[
 {n:'RICO',agro:.92,err:.20,rea:.13,line:.60}, // le chien fou : réflexes de chat, trajectoires de poivrot
 {n:'JADE',agro:.30,err:.03,rea:.16,line:.97}, // la métronome : propre, implacable — la référence à battre
 {n:'MOMO',agro:.62,err:.11,rea:.14,line:.78}, // l'opportuniste : surgit sur les erreurs
 {n:'ZAZA',agro:.80,err:.28,rea:.10,line:.86}, // la fusée fautive : réagit au quart de tour, se rate en grand
 {n:'LULU',agro:.42,err:.07,rea:.26,line:.82}, // la prudente : longue à la détente, mais sûre
 {n:'KIKI',agro:.72,err:.14,rea:.17,line:.72}, // la teigneuse : défend chaque mètre
 {n:'BOB', agro:.52,err:.10,rea:.21,line:.76}, // le régulier : jamais brillant, jamais loin
];
// ---------- APPRENTISSAGE : les IA t'observent et adoptent ton style (façon Drivatar) ----------
// Deux mémoires. (1) Un PROFIL persistant (localStorage via SAVE) qui agrège TA manière de jouer sur
// toutes tes parties — appétit de saut, usage nitro, prudence en virage, niveau, agressivité. Il biaise
// tous les bots au départ : run après run, ils prennent ta patte. (2) Des ZONES DE SAUT enregistrées
// EN DIRECT sur la piste courante : là où TU décolles, un bot qui repasse au même endroit décolle aussi.
const AIP={
  air:.5,boost:.35,caution:.5,skill:.86,aggr:.55,airDur:1.1,runs:0, // profil courant
  _drv:0,_jumps:0,_airT:0,_boost:0,_spd:0,_spdN:0,_lat:0,_latN:0,_committed:false,_pm:'', // accus de la run
  load(){const a=SAVE.d.ai;if(a){this.air=a.air;this.boost=a.boost;this.caution=a.caution;this.skill=a.skill;this.aggr=a.aggr;this.airDur=a.airDur;this.runs=a.runs;}},
  resetRun(){this._drv=0;this._jumps=0;this._airT=0;this._boost=0;this._spd=0;this._spdN=0;this._lat=0;this._latN=0;this._committed=false;this._pm=mode;},
  tick(dt){ // appelé chaque frame de jeu : on t'observe même hors mode Survivant
    if(SANDBOX||PARK.on||TUTO.on)return; // (2026-09-30) le bac à sable, le parc et l'auto-école ne sont pas TA conduite : la meute n'apprend pas des chutes d'une leçon
    if(mode==='drive'){this._drv+=dt;
      const mx=vmaxShow();if(mx>0){this._spd+=(Math.abs(vA)*3.6*SPD)/mx;this._spdN++;} // part de TA vitesse atteignable, pas de la fiche de carrosserie
      this._lat+=Math.abs(lat)/ROAD_HALF;this._latN++;
      if(nitroOn)this._boost+=dt;
    }else if(mode==='fall')this._airT+=dt;
    if(mode==='fall'&&this._pm!=='fall')this._jumps++; // un décollage de plus
    this._pm=mode;
  },
  commit(){ // fin de run : on fond les mesures dans le profil (adoption totale la 1re fois, EMA ensuite)
    if(this._committed||this._drv<3)return;this._committed=true;
    const cl=THREE.MathUtils.clamp;
    const air=cl(this._jumps/Math.max(6,this._drv)*7,0,1);          // ~1 saut / 7 s → plein appétit
    const boost=cl(this._boost/Math.max(6,this._drv)*3,0,1);
    const skill=this._spdN?cl(this._spd/this._spdN,.5,1.08):this.skill;
    const line=this._latN?this._lat/this._latN:.4;
    const caution=cl(1-line,.15,.95);                                // collé au centre = prudent
    const airDur=this._jumps?cl(this._airT/this._jumps,.4,4):this.airDur;
    const aggr=cl(air*.55+line*.55,.15,1);
    const w=this.runs<1?1:.35,mix=(o,n)=>o+(n-o)*w;                   // 1re run : on adopte tout ; ensuite EMA douce
    this.air=mix(this.air,air);this.boost=mix(this.boost,boost);this.skill=mix(this.skill,skill);
    this.caution=mix(this.caution,caution);this.airDur=mix(this.airDur,airDur);this.aggr=mix(this.aggr,aggr);
    this.runs++;
    SAVE.d.ai={air:this.air,boost:this.boost,caution:this.caution,skill:this.skill,aggr:this.aggr,airDur:this.airDur,runs:this.runs};
    SAVE.flush();
  }
};
AIP.load();
const survHudEl=$('survHud'),survBtnEl=$('survBtn'),lastAlertEl=$('lastAlert');
let svClkCtx=null,svRowsEl=null,svSecsEl=null;
// ---- carrosserie police : géométries/matériaux PARTAGÉS, 3 livrées pour casser les clones ----
const pcGlassM=new THREE.MeshPhongMaterial({color:0x0d1620,shininess:280,specular:0xffffff});
const pcBarM=new THREE.MeshPhongMaterial({color:0x101018,shininess:60,specular:0x444444});
const pcLiv=[ // [carrosserie, capot/accents]
  [new THREE.MeshPhongMaterial({color:0xf2f4f8,shininess:130,specular:0xdde6ff}),new THREE.MeshPhongMaterial({color:0x14161d,shininess:90,specular:0x8899aa})],
  [new THREE.MeshPhongMaterial({color:0x191b22,shininess:110,specular:0x99a6bb}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})],
  [new THREE.MeshPhongMaterial({color:0x1c2a4a,shininess:110,specular:0x99aadd}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})]];
const gyroRedOn=new THREE.MeshBasicMaterial({color:0xff3030}),gyroRedOff=new THREE.MeshBasicMaterial({color:0x4a0808});
const gyroBluOn=new THREE.MeshBasicMaterial({color:0x3f7dff}),gyroBluOff=new THREE.MeshBasicMaterial({color:0x081a4a});
const pcBodyG=new THREE.BoxGeometry(1.9,.58,4.3),pcCabG=new THREE.BoxGeometry(1.62,.52,2.0),
      pcHoodG=new THREE.BoxGeometry(1.7,.1,1.2),pcBaseG=new THREE.BoxGeometry(1.15,.09,.4),pcLampG=new THREE.BoxGeometry(.42,.17,.34);
const gloCv=document.createElement('canvas');gloCv.width=gloCv.height=64;
(()=>{const gc=gloCv.getContext('2d'),gr=gc.createRadialGradient(32,32,2,32,32,30);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');
  gc.fillStyle=gr;gc.fillRect(0,0,64,64);})();
const gloTex=new THREE.CanvasTexture(gloCv);
const sprRedM=new THREE.SpriteMaterial({map:gloTex,color:0xff3030,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprBluM=new THREE.SpriteMaterial({map:gloTex,color:0x3f7dff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprJetM=new THREE.SpriteMaterial({map:gloTex,color:0xff9a2a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}); // flamme réacteur (partagée)
// ROUES : la meute réutilisait la géométrie/le matériau des épaves — feature épave retirée ailleurs,
// donc la police porte désormais SES propres roues (mêmes valeurs, plus de dépendance fantôme wkWhG/wkWheelM).
const wkWhG=new THREE.CylinderGeometry(.34,.34,.24,10);
const wkWheelM=new THREE.MeshPhongMaterial({color:0x14161c,shininess:8});
// MÊME KIT LUMIÈRE QUE LE JOUEUR : halos de phares/feux + cônes de réacteur (matériaux PARTAGÉS par la meute)
const pcHeadM=new THREE.SpriteMaterial({map:lampTex,color:0xffe2a8,transparent:true,opacity:.95,depthWrite:false});
const pcTailM=new THREE.SpriteMaterial({map:lampTex,color:0xff2818,transparent:true,opacity:.85,depthWrite:false});
const pcJetShellM=jetMat(0x4f76ff,0xd6e4ff,0x9fb4ff,.85,1,1),pcJetCoreM=jetMat(0xd6e4ff,0xffffff,0xc9b8ff,.92,.7,1.35); // (2026-09-28) la meute brûle avec LA FLAMME VIVANTE du joueur (même programme), en bleu police
function mkPolice(liv){
  const g=new THREE.Group(),[bodyM,accM]=pcLiv[liv%3];
  const body=new THREE.Mesh(pcBodyG,bodyM);body.position.y=.62;g.add(body);
  const hood=new THREE.Mesh(pcHoodG,accM);hood.position.set(0,.93,1.45);g.add(hood);   // capot contrasté
  const trunk=new THREE.Mesh(pcHoodG,accM);trunk.position.set(0,.93,-1.5);g.add(trunk);
  const cab=new THREE.Mesh(pcCabG,pcGlassM);cab.position.set(0,1.14,-.25);g.add(cab);
  const base=new THREE.Mesh(pcBaseG,pcBarM);base.position.set(0,1.46,-.25);g.add(base); // rampe
  const lampR=new THREE.Mesh(pcLampG,gyroRedOn);lampR.position.set(-.3,1.56,-.25);g.add(lampR);
  const lampB=new THREE.Mesh(pcLampG,gyroBluOff);lampB.position.set(.3,1.56,-.25);g.add(lampB);
  for(const sd of[-1,1])for(const fz of[-1,1]){
    const w=new THREE.Mesh(wkWhG,wkWheelM);w.rotation.z=Math.PI/2;w.position.set(sd*.98,.34,fz*1.42);g.add(w);}
  const sR=new THREE.Sprite(sprRedM);sR.position.set(0,1.9,-.25);g.add(sR);            // halos additifs
  const sB=new THREE.Sprite(sprBluM);sB.position.set(0,1.9,-.25);sB.visible=false;g.add(sB);
  const jet=new THREE.Sprite(sprJetM);jet.position.set(0,.55,-2.55);jet.visible=false;g.add(jet); // réacteur nitro (halo)
  for(const sd of[-1,1]){ // MÊME KIT LUMIÈRE QUE TOI : halos de phares avant + feux arrière braise
    const hg=new THREE.Sprite(pcHeadM);hg.scale.set(.8,.8,1);hg.position.set(sd*.62,.72,2.42);g.add(hg);
    const tg=new THREE.Sprite(pcTailM);tg.scale.set(.6,.6,1);tg.position.set(sd*.58,.78,-2.35);g.add(tg);
  }
  // ...et les MÊMES FLAQUES AU SOL que le joueur : phares blanc-bleu police devant, feux rouges derrière, halo réacteur bleu (opacité pilotée par la poussée)
  function pool9(wid,len,zc,col,op,tex){
    const m9=new THREE.Mesh(new THREE.PlaneGeometry(wid,len),
      new THREE.MeshBasicMaterial({map:tex||poolTex,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    m9.rotation.x=-Math.PI/2;m9.position.set(0,.062,zc);m9.userData.noShadow=true;m9.userData.sol=1;m9.renderOrder=2;
    g.add(m9);return m9;
  }
  pool9(6.0,14.5,9.4,0xcfe0ff,.5,beamTex); // faisceaux blanc-bleu police — (2026-09-28) la flaque rouge AR et le halo bleu au sol sont RETIRÉS,
  const jetPool={material:{opacity:0}};     // comme sur ta caisse (verdict « plus de taches rondes sur la route ») : ils volaient aussi avec la voiture qui saute
  const jets=[]; // plume de réacteur : les MÊMES cônes que la caisse du joueur, en BLEU police
  for(const sd of[-1,1]){
    const js9=new THREE.Mesh(jetGeo,pcJetShellM),jc9=new THREE.Mesh(jetGeo,pcJetCoreM);
    js9.position.set(sd*.5,.55,-2.45);jc9.position.copy(js9.position);
    js9.scale.set(.14,.14,.02);jc9.scale.set(.07,.07,.02);
    js9.visible=jc9.visible=false;js9.userData.noShadow=jc9.userData.noShadow=true;
    g.add(js9);g.add(jc9);jets.push(js9,jc9);
  }
  g.traverse(o9=>{if(o9.isMesh&&!o9.userData.noShadow)o9.castShadow=true;}); // la meute aussi étire son ombre — sauf les plumes additives
  g.visible=false;scene.add(g);
  return {g,lampR,lampB,sR,sB,jet,jets,jetPool};
}
// pool de VRAIES lumières : seules les 2 poursuivantes les plus proches éclairent la route et ta caisse
const gyroLights=[new THREE.PointLight(0xff3030,0,60),new THREE.PointLight(0x3f7dff,0,60)];
for(const l of gyroLights)scene.add(l);
const botJetLight=new THREE.PointLight(0x5b7dff,0,24);scene.add(botJetLight); // le reflet BLEU au sol de la nitro du bot le plus proche (1 seule lumière, jamais de recompilation)
const botTrails=[];for(let i9=0;i9<7;i9++)botTrails.push(mkTrail()); // 7 RUBANS BLEUS : la meute signe le ciel — visibles de LOIN (fog:false)
// sirène unique (LOD audio) : un WAIL doux et lointain — la fréquence RESPIRE au lieu de claquer
let sirG=null,sirO=null;
function sirenInit(){
  if(sirG||!AC)return;
  try{
    sirG=AC.createGain();sirG.gain.value=0;
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=880;f.Q.value=.7; // rond, jamais strident
    sirO=AC.createOscillator();sirO.type='sine';sirO.frequency.value=560;
    const wl=AC.createOscillator(),wg=AC.createGain(); // le wail : lent glissando sinusoïdal ±115 Hz
    wl.type='sine';wl.frequency.value=.27;wg.gain.value=115;
    wl.connect(wg);wg.connect(sirO.frequency);
    const vb=AC.createOscillator(),vg=AC.createGain(); // vibrato léger : la sirène VIT
    vb.type='sine';vb.frequency.value=5.3;vg.gain.value=5;
    vb.connect(vg);vg.connect(sirO.frequency);
    sirO.connect(f);f.connect(sirG);sirG.connect(MASTER);
    sirO.start();wl.start();vb.start();porte(sirG,MASTER);
  }catch(e){sirG=null;}
}
const FB={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const svM4=new THREE.Matrix4(),svT1=new THREE.Vector3(); // temp partagé de la meute (jamais d'alloc chaude)
function survMenage(){ // grand ménage de l'escadron précédent (le départ suivant, ou le retour à l'ACCUEIL)
  for(const b of SURV.bots)if(b.mesh){scene.remove(b.mesh.g);
    b.mesh.g.traverse(o=>{if(o.userData&&o.userData.sol){if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}});} // (2026-09-26) ses flaques, propres à chaque voiture
  SURV.bots=[];
}
function survStart(){
  survMenage();
  SURV.on=SURV.armed&&!PARK.on;
  SURV.t=0;SURV.over=false;SURV._r=0;SURV.pBase=0;SURV.ph=0;SURV.last=false; // (les bots sont vidés par survMenage) // FREESTYLE : jamais de police dans le parc
  SURV.jumpZones=[];SURV.pMode=mode;SURV._launchD=0;SURV._launchT=0; // mémoire de tes décollages sur CETTE piste
  survHudEl.style.display=SURV.on?'block':'none';
  lastAlertEl.style.display='none';vChip(''); // (2026-09-30) la plaque du Survivant (téléphone) repart vide : survTick la réécrit à 4 Hz
  for(const l of gyroLights)l.intensity=0;
  botJetLight.intensity=0;
  for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;} // pas de rubans fantômes d'une meute à l'autre
  if(sirG&&AC)sirG.gain.setTargetAtTime(0,AC.currentTime,.3); // (2026-09-27) la sirène s'éteint au portail (survTick ne tourne plus pour la couper)
  if(!SURV.on)return;
  sirenInit();
  survHudEl.innerHTML='<div class="svHead"><canvas id="svClock" width="20" height="20"></canvas><span id="svSecs"></span></div><div id="svRows"></div>';
  svClkCtx=$('svClock').getContext('2d');svRowsEl=$('svRows');svSecsEl=$('svSecs');
  for(let i=0;i<7;i++){
    const p=SURV_PILOTS[i];
    // le PROFIL appris te déteint sur chaque bot — mais uniquement sur le CERVEAU, jamais sur le moteur
    const line=THREE.MathUtils.clamp(p.line*(.72+AIP.skill*.3),.25,.98),
      marg=THREE.MathUtils.clamp(.78+line*.18-AIP.caution*.04,.7,.96), // marge au point de corde : les fins freinent tard
      agro=THREE.MathUtils.clamp(p.agro*(.7+AIP.aggr*.7),0,1),
      appJump=THREE.MathUtils.clamp(AIP.air*(.5+p.agro*.9),0,1.1), // appétit de saut personnel
      appBoost=THREE.MathUtils.clamp(.45+AIP.boost*(.55+p.agro*.7),0,1.35); // appétit de nitro REMONTÉ : la meute doit cracher du bleu
    SURV.bots.push({name:p.n,agro:agro,err:p.err,rea:p.rea,line:line,marg:marg,alive:true,
      appJump:appJump,appBoost:appBoost,
      totD:s+(i-3)*34+(Math.random()*2-1)*12, // la meute encadre le joueur dès le départ
      v:24,lat:(Math.random()*2-1)*(ROAD_HALF-4),latT:0,lane:(Math.random()*2-1)*.6,
      phi:0,steer:0,sHold:0,momT:0,pbi:-1,cornerV:1e9,think:Math.random()*.25,
      nitroR:1.2,nT:0,boostT:0,padB:0,padCd:0,slipT:0,oilCd:0,errT:0,errK:0,ph:Math.random(),
      air:false,airH:0,vy:0,spin:0,spinV:0,jumpCD:1+Math.random()*2,zoneMark:-1,
      trail:botTrails[i],trailK:0, // son ruban bleu personnel
      mesh:mkPolice(i)});
    SURV.bots[i].latT=SURV.bots[i].lane*(ROAD_HALF-5);
  }
  survRender();
}
function svClockDraw(){ // minuteur circulaire PIXEL-ART : 20×20 upscalé net — cadran rétro, aiguille fluide
  if(!svClkCtx||TCTL.on)return; // (2026-09-30) invisible au téléphone : une soixantaine de dessins par image pour rien
  const c=svClkCtx;c.clearRect(0,0,20,20);
  const frac=Math.min(1,SURV.t/60),left=60-SURV.t;
  c.fillStyle='#141026';c.beginPath();c.arc(10,10,9.4,0,7);c.fill();
  c.fillStyle='#332a55';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;
    c.fillRect(Math.round(9.5+Math.sin(a)*8),Math.round(9.5-Math.cos(a)*8),1,1);}
  const col=left<10?'#ff5040':left<25?'#ffb000':'#7dff9a';
  c.fillStyle=col;
  for(let k=0;k<36;k++){ // l'anneau se VIDE avec la minute
    if(k/36<frac)continue;
    const a=k/36*Math.PI*2;
    c.fillRect(Math.round(9.5+Math.sin(a)*6.6),Math.round(9.5-Math.cos(a)*6.6),1,1);
  }
  const na=frac*Math.PI*2; // l'aiguille balaie son tour de cadran
  c.fillStyle='#fff';
  for(let r=1.5;r<6;r+=1)c.fillRect(Math.round(9.5+Math.sin(na)*r),Math.round(9.5-Math.cos(na)*r),1,1);
  c.fillStyle='#ffd75e';c.fillRect(9,9,2,2);
  if(svSecsEl){const sLeft=Math.max(0,Math.min(59,Math.ceil(left)));svSecsEl.textContent='0:'+String(sLeft).padStart(2,'0'); /* (24/10, relecture : « 0:60 » toute la première seconde de chaque minute) la minute s'affiche 0:59 → 0:00, jamais 0:60 */
    svSecsEl.style.color=left<10?'#ff5040':'#ffd75e';}
}
function botBoom(b){ // une unité saute : gerbe or+bleu, champignon, et le son si c'est proche
  b.alive=false;b.mesh.g.visible=false;
  const rel=THREE.MathUtils.clamp(b.totD-SURV.pBase,1,L-2),dS9=Math.abs(b.totD-survPTot()); // (2026-09-30) la distance à TA vraie place, même en vol
  frameAt(rel,FB);FB.p.addScaledVector(FB.n,.8);
  sparkBurst(sparkGold,FB.p,36,20);sparkBurst(sparkBlue,FB.p,28,16);
  for(let k=0;k<18;k++)spawnP(smokePool,FB.p.x,FB.p.y+k*.22,FB.p.z,(Math.random()-.5)*2.5,5+Math.random()*4,(Math.random()-.5)*2.5,1.2+Math.random()*.7);
  if(dS9<220){if(SONV2)sfx('explosion.loin');else{subBoom(.3);thud(11);}shake=Math.max(shake,.5);}
  trickMsg('💥 '+b.name+' '+TR('EXPLOSE !'),2);if(SONV2){if(dS9>=220)sfx('rival.boum');}else chimeNote(196,0,.3,.25);
}
function survTick(dt){
  if(!SURV.on)return;
  if(SURV.over){for(const l of gyroLights)l.intensity=0;botJetLight.intensity=0;for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;}if(sirG)sirG.gain.setTargetAtTime(0,AC.currentTime,.3);return;}
  SURV.t+=dt;SURV.ph=(SURV.ph+dt*2.7)%1;
  svClockDraw();
  const pTot=survPTot(),sP9=pTot-SURV.pBase; // (2026-09-30) le Survivant suit ta vraie position, même en vol ; sP9 = ta place sur CETTE piste
  // MÊME MOTEUR QUE TOI : la meute roule avec TA caisse (specs + overdrive), pas un pouce de plus.
  // Zéro triche : plus d'élastique, plus de garde-fou, plus d'aspiration magique — que du pilotage.
  // ⚠ CARS[0] + TON MOTEUR, comme toi (2026-08-03) : la meute lisait CARS[level], or `level` est
  // désormais la carrosserie CHOISIE au garage. Équiper la dernière caisse aurait lancé sept
  // poursuivantes à 1900 km/h contre un joueur plafonné par son palier moteur — course injouable.
  // (2026-09-27) LA POURSUITE : 6 % de moins en pointe — c'est l'OPPORTUNITÉ DE FUITE du brief : un pilote propre les distance, un pilote sale les garde au cul
  const spec9=CARS[0],late9=lateMul(),push9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push,
        maxSp9=spec9.maxKmh/3.6*late9*push9,acc9=spec9.accel*late9*(1+(push9-1)*.6),tc9=spec9.turn*.75,segL9=L/(NP-1);
  // ---- ON T'OBSERVE EN DIRECT : chaque décollage grave une ZONE que les bots imiteront sur CETTE piste ----
  if(mode==='fall'&&SURV.pMode!=='fall'){SURV._launchD=pTot;SURV._launchT=SURV.t;}
  else if(mode!=='fall'&&SURV.pMode==='fall'){
    const dur=SURV.t-SURV._launchT;
    if(dur>.4&&SURV.jumpZones.length<48)SURV.jumpZones.push({d:SURV._launchD,dur:Math.min(dur,4)}); // là où TU sautes
  }
  SURV.pMode=mode;
  // ---- classement vivant (8 entrées : tri à la main, zéro alloc chaude) ----
  const alive=SURV.bots.filter(b=>b.alive);
  const racers=alive.slice();racers.sort((a,b)=>b.totD-a.totD);
  let pRank=1;for(const b of alive)if(b.totD>pTot)pRank++;
  for(const b of alive){
    const rel=b.totD-SURV.pBase;
    const bi=Math.floor(THREE.MathUtils.clamp(rel/L,0,1)*(NP-1));
    // ============ LE CERVEAU : un tick à retard HUMAIN (100-300 ms selon le pilote) ============
    // Entre deux ticks, le bot roule sur ses dernières décisions — comme toi entre deux regards.
    b.think-=dt;
    if(b.think<=0){
      b.think=b.rea*(.8+Math.random()*.6);
      // fautes : chaque pilote a les siennes, et elles se VOIENT (0=coup de frein, 1=embardée, 2=corde ratée)
      if(b.errT<=0&&Math.random()<b.err*.4){b.errT=.5+Math.random()*.8;b.errK=Math.floor(Math.random()*3);}
      // POINT DE CORDE (waypoints) : distance de freinage réelle (mêmes freins que toi) + retard de réaction
      const dBrk=(b.v*b.v*SPD)/(2*acc9*1.5)+b.v*SPD*b.rea;
      const look=THREE.MathUtils.clamp(dBrk*1.4+16,24,230);
      let vSafe=1e9,crv=0;
      for(let k9=1;k9<=3;k9++){ // 3 échantillons de courbure devant : l'anticipation, pas la ligne droite bête
        const d9=look*k9/3;
        const j9=Math.min(NP-1,bi+Math.max(1,Math.round(d9/segL9)));
        const kap=Math.acos(THREE.MathUtils.clamp(T[bi].dot(T[j9]),-1,1))/Math.max(1,d9); // κ rad/m
        if(kap>1e-4){ // vitesse max de passage : résout κ·v·SPD = plafond de braquage (LE TIEN)
          const kS=kap*SPD,vs=(-kS+Math.sqrt(kS*kS+4*kS*TURN_HS*tc9))/(2*kS*TURN_HS);
          if(vs<vSafe){vSafe=vs;svT1.crossVectors(T[bi],T[j9]);crv=Math.sign(svT1.dot(Nn[bi]))*kap;}
        }
      }
      let m9=b.marg*(1+(Math.random()-.5)*.16*(.4+b.err)); // le point de frein n'est jamais deux fois le même
      if(b.errT>0&&b.errK===2)m9*=1.35;                    // corde RATÉE : il rentre trop vite et part large
      b.cornerV=vSafe*m9;
      // LIGNE : viser la corde du virage annoncé, sinon sa file préférée
      let lT=Math.abs(crv)>.004?Math.sign(crv)*(ROAD_HALF-3.4)*b.line:b.lane*(ROAD_HALF-5);
      // PERCEPTION BORNÉE : 75 m devant, 25 m derrière — et les écarts s'estiment à l'œil (±10 %)
      let ahead=null,aG=1e9,behind=null,bG=1e9;
      for(const o of alive){if(o===b)continue;const g9=(o.totD-b.totD)*(1+(Math.random()-.5)*.2);
        if(g9>0&&g9<75){if(g9<aG){aG=g9;ahead=o.lat;}}else if(g9<0&&-g9<25&&-g9<bG){bG=-g9;behind=o.lat;}}
      if(mode==='drive'){const g9=(pTot-b.totD)*(1+(Math.random()-.5)*.2); // toi aussi tu n'es qu'une silhouette
        if(g9>0&&g9<75){if(g9<aG){aG=g9;ahead=lat;}}else if(g9<0&&-g9<25&&-g9<bG){bG=-g9;behind=lat;}}
      if(ahead!=null&&aG<14&&Math.abs(b.lat-ahead)<3.2)      // bouchon : on DÉBOÎTE (au prochain tick, pas avant)
        lT=THREE.MathUtils.clamp(ahead+(b.lat>=ahead?4.6:-4.6),-(ROAD_HALF-2.6),ROAD_HALF-2.6);
      else if(behind!=null&&bG<9&&Math.random()<b.agro*.7)   // porte fermée sur le poursuivant
        lT=THREE.MathUtils.clamp(behind,-(ROAD_HALF-2.6),ROAD_HALF-2.6);
      // OBSTACLES à portée de phares : il ne voit QUE devant, et l'esquive attend son tick (retard humain)
      const oLook=Math.min(look,70);let obD=1e9,obLat=0,obW=0;
      for(const o9 of OILS){if(o9.face!==1)continue;const d9=o9.s-rel;
        if(d9>2&&d9<oLook&&d9<obD&&Math.abs(o9.lat-lT)<o9.r+1){obD=d9;obLat=o9.lat;obW=o9.r+1;}}
      if(obD<1e9)lT=obLat+(lT>=obLat?1:-1)*(obW+1.6);
      b.latT=THREE.MathUtils.clamp(lT,-(ROAD_HALF-2.4),ROAD_HALF-2.4);
      // NITRO : une RESSOURCE (même jauge, même recharge que toi) — il l'allume dès que la route se dégage
      if(b.nT<=0&&b.nitroR>.35&&b.slipT<=0&&b.cornerV>b.v*1.12&&(ahead==null||aG>10)){
        let env=b.appBoost*(ahead!=null?1.5:.9);           // même seul, il envoie : le spectacle des traînées bleues
        if(SURV.t>48)env*=1.7;                             // dernière ligne droite de la minute : tout le monde tape dedans
        if(racers[racers.length-1]===b)env*=1.6;           // le condamné du classement se bat
        if(Math.random()<env*.7)b.nT=.7+Math.random()*1.2; // plus souvent, plus longtemps — la jauge régule de toute façon
      }
    }
    if(b.errT>0)b.errT-=dt;
    // ============ LE MOTEUR : copie conforme de TES équations — rien de plus, rien de moins ============
    const brk=b.v>b.cornerV*1.05||(b.errT>0&&b.errK===0);  // frein réel ou coup de frein fautif
    const lift=b.v>b.cornerV*.96;                          // pied levé à l'approche : un humain ne freine pas sec
    if(!brk&&Math.abs(b.steer)<.2&&Math.abs(b.phi)<.25)b.momT+=dt;else b.momT=Math.max(0,b.momT-dt*3); // même MOMENTUM
    const momF=1+Math.min(1.8,b.momT*b.momT*.1);
    if(!b.air){
      let a9=0;
      if(brk)a9=b.v>2?-acc9*1.5:-acc9*.5;
      // (2026-09-27) LA POURSUITE garde le contact sans tricher : loin (> 160 m) elle roule à TA pointe (jamais plus), à l'approche de la
      // portée de tir elle retombe à −6 % — mesuré : à 150 m de départ elle abattait le pilote moyen en 29 s, à 200 m elle ne l'atteignait jamais
      const mx9=maxSp9;
      if(!lift&&!brk)a9=acc9*(b.v<mx9?1:.55)*(b.padB>0?1.5:1)*momF;
      b.v+=a9*dt;
      b.v+=-GRAV*T[bi].y*hautPente()*Math.cos(b.phi)*dt;               // la pente pousse ou retient, comme toi
      b.v-=b.v*Math.abs(b.v)*(acc9/(mx9*mx9*5.8))*dt; // même traînée, même terminal
      b.v*=Math.max(0,1-.03*dt);
      if(!brk&&lift)b.v*=Math.max(0,1-.4*dt);              // pied levé = même frein moteur
    }
    b.nT-=dt;
    const nOn=b.nT>0&&!brk&&b.nitroR>.005;
    if(nOn){b.v+=30*dt;b.nitroR=Math.max(0,b.nitroR-dt);}  // même poussée, même consommation
    b.nitroR=Math.min(2,b.nitroR+.2*dt);                   // même recharge que ta jauge
    b.boostT=nOn?1:0;                                      // la flamme du réacteur suit la VRAIE combustion
    b.padB=Math.max(0,b.padB-dt);
    if(b.v<0)b.v=0;
    // ============ LA DIRECTION : même volant, même inertie, même plafond TURN_HS ============
    const dL9=b.latT-b.lat;
    const phiT=THREE.MathUtils.clamp(dL9/(Math.max(6,b.v*SPD)*.9),-.62,.62);
    let st=THREE.MathUtils.clamp((phiT-b.phi)*4,-1,1);
    st+=(Math.random()-.5)*.1*(1.2-b.line);                // micro-corrections permanentes : une main humaine
    if(b.errT>0&&b.errK===1)st+=Math.sin(SURV.t*13+b.ph*9)*.7; // l'EMBARDÉE : ça se voit depuis derrière
    b.steer+=(st-b.steer)*Math.min(1,dt*18);               // même inertie de volant que la tienne
    if(Math.abs(b.steer)>.1)b.sHold=Math.min(.3,b.sHold+dt);else b.sHold=0;
    b.phi+=(b.slipT>0?.18:1)*b.steer*(.55+.45*(b.sHold/.3))*tc9*THREE.MathUtils.clamp(b.v/8,-1,1)*(1/(1+Math.abs(b.v)*TURN_HS))*dt;
    if(b.slipT>0){b.slipT-=dt;b.phi+=(Math.random()-.5)*2.6*dt*Math.min(1,Math.abs(b.v)/12);} // la flaque le fait chasser, LUI aussi
    if(b.pbi>=0&&bi!==b.pbi){ // la route tourne SOUS le bot : même rétroaction que ton psi
      svT1.crossVectors(T[b.pbi],T[bi]);
      const dy9=Math.atan2(svT1.dot(Nn[bi]),THREE.MathUtils.clamp(T[b.pbi].dot(T[bi]),-1,1));
      if(Math.abs(dy9)<.5)b.phi-=dy9; // (garde : saut de piste au portail = pas une vraie rotation)
    }
    b.pbi=bi;
    b.phi=THREE.MathUtils.clamp(b.phi,-1.4,1.4);
    // ============ L'AVANCE : mêmes intégrateurs (SPD compris) ============
    b.lat+=b.v*Math.sin(b.phi)*dt*SPD;
    b.totD+=b.v*Math.cos(b.phi)*dt*SPD;
    // ============ VOL & BORD : mêmes règles — la roue sort, la caisse décolle ============
    if(b.air){
      b.vy-=26*GRAV_K*gK()*dt;b.airH+=b.vy*dt; // la meute subit la même gravité (lunaire en orbite)
      b.spin+=b.spinV*dt;b.spinV*=Math.max(0,1-dt*.5);
      if(b.airH<=0){ // la retombée
        b.air=false;b.airH=0;b.vy=0;b.spin=0;b.spinV=0;b.jumpCD=1+Math.random()*1.6;
        if(Math.abs(b.lat)>ROAD_HALF){botBoom(b);continue;} // retombé À CÔTÉ : le vide ne pardonne pas, même à eux
                if(b.mesh.g.visible)sparkBurst(sparkGold,b.mesh.g.position,7,7);
      }
    }else{
      if(Math.abs(b.lat)>ROAD_HALF){ // le BORD : même sanction que toi — ça décolle, à lui de revenir
        b.air=true;b.airH=.01;b.vy=6;b.spinV=(Math.random()-.5)*2;
      }else{
        b.jumpCD-=dt;
        if(b.jumpCD<=0){ // « il a vu où tu sautes » : TES spots sont leurs SEULS tremplins — plus de saut sorti de nulle part
          for(let zi=0;zi<SURV.jumpZones.length;zi++){
            const z=SURV.jumpZones[zi];
            if(zi!==b.zoneMark&&Math.abs(z.d-b.totD)<8){
              b.zoneMark=zi;
              if(Math.random()<.25+b.appJump*.6){ // l'appétit hérité de TOI décide s'il OSE
                const air9=z.dur*(.7+b.appJump*.5);
                b.air=true;b.airH=.01;b.vy=13*Math.min(air9,4); // vy=G·t/2 : il reproduit la DURÉE de ton vol
                b.spinV=(Math.random()<.5?-1:1)*(1+b.agro*5.5)*(air9>1.5?1:.35);
                b.jumpCD=2.2;
              }
              break;
            }
          }
        }
      }
    }
    // ============ OBSTACLES : la piste cogne pareil pour tout le monde ============
    if(!b.air&&rel>0&&rel<L){
      if(!b.alive)continue;
      b.oilCd=Math.max(0,b.oilCd-dt);
      if(b.oilCd<=0)for(const o9 of OILS){ // flaques : ça chasse pareil
        if(o9.face!==1||Math.abs(rel-o9.s)>o9.r+2)continue;
        if(Math.abs(b.lat-o9.lat)<o9.r+.6){b.slipT=.75;b.oilCd=1.2;break;}
      }
      b.padCd=Math.max(0,b.padCd-dt);
      if(b.padCd<=0)for(let i9=0;i9<PADS.length;i9++){ // pads turbo : même coup de pied, même règle de VISÉE que le joueur
        if(Math.abs(rel-PADS[i9])<6&&Math.abs(b.lat-PADL[i9])<4.1){b.v+=18;b.padB=Math.max(b.padB,1.5);b.padCd=1.5;break;}
      }
    }
  }
  // ---- incarnation : mesh + gyros SEULEMENT à portée de vue (LOD), 2 vraies lumières pour les proches ----
  const ph5=SURV.ph%1<.5;
  let li=0,bjD=1e9,bjOn=false;
  for(const b of SURV.bots){
    if(!b.alive){b.trailK=0;trailStep(b.trail,0,0,0,0,0,0,0);continue;}
    const rel=b.totD-SURV.pBase;
    const gap=Math.abs(rel-sP9); // (2026-09-30) ta vraie place, même en vol : en long saut, les gyrophares éclairaient la meute restée au tremplin
    if(rel>2&&rel<L-4){
      frameAt(rel,FB);
      // TRAÎNÉE BLEUE : mise à jour SANS limite de distance — la grosse signature de la meute se voit de LOIN (fog:false)
      b.trailK+=((b.boostT>0?1:0)-b.trailK)*Math.min(1,dt*(b.boostT>0?16:5));
      svT1.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,1.05+b.airH).addScaledVector(FB.t,-2.5);
      trailStep(b.trail,svT1.x,svT1.y,svT1.z,.5,.62,1.55,b.trailK,1.7);
      const lodP9=Math.max(340,FOG_N+120); // (2026-09-28) la voiture n'apparaît plus NETTE à 340 m quand la brume commence plus loin : elle naît dans la brume
      if(gap<lodP9){
      const m=b.mesh.g;m.scale.setScalar(Math.min(1,(lodP9-gap)/50)); // …et grandit sur les 50 derniers mètres au lieu de surgir
      m.position.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,.56+b.airH); // la hauteur de VOL soulève la caisse
      m.quaternion.setFromRotationMatrix(svM4.makeBasis(FB.b,FB.n,FB.t));
      m.rotateY(b.phi); // le cap RÉEL de la sim : on VOIT les braquages, contre-braquages et embardées
      if(b.spin)m.rotateZ(b.spin); // la vrille policière : barrel roll autour de l'axe de route
      m.visible=true;
      const bph=((SURV.ph+b.ph)%1)<.5; // chaque rampe bat sur SA phase — la meute scintille
      b.mesh.lampR.material=bph?gyroRedOn:gyroRedOff;
      b.mesh.lampB.material=bph?gyroBluOff:gyroBluOn;
      b.mesh.sR.visible=bph;b.mesh.sB.visible=!bph;
      const gsc=(2.1+Math.sin((SURV.ph+b.ph)*Math.PI*2)*.5)*Math.max(0,1-gap/400); // le halo respire, s'éteint au loin (borné : la meute peut désormais s'afficher au-delà de 400 m)
      b.mesh.sR.scale.set(gsc*3,gsc*1.6,1);b.mesh.sB.scale.set(gsc*3,gsc*1.6,1);
      b.mesh.jet.visible=b.boostT>0; // NITRO VISIBLE : la flamme claque derrière la caisse qui pousse
      const jOn9=b.boostT>0; // PLUME DE RÉACTEUR bleue : les mêmes cônes que le joueur
      for(const j9 of b.mesh.jets)j9.visible=jOn9;
      if(jOn9){
        const fl9=.8+.2*Math.sin(SURV.t*57+b.ph*31),jl9=1.5*fl9,jr9=.13;
        b.mesh.jets[0].scale.set(jr9,jr9,jl9);b.mesh.jets[1].scale.set(jr9*.5,jr9*.5,jl9*.72);
        b.mesh.jets[2].scale.set(jr9,jr9,jl9);b.mesh.jets[3].scale.set(jr9*.5,jr9*.5,jl9*.72);
        b.mesh.jetPool.material.opacity=.34*fl9; // le halo bleu de SA nitro lèche la route, comme le tien
      }else b.mesh.jetPool.material.opacity=0;
      if(b.boostT>0){
        const js9=1.2+Math.random()*.6;b.mesh.jet.scale.set(js9,js9*.55,1);
        if(gap<130&&Math.random()<dt*24) // et quelques braises au ras du pare-chocs (LOD : proches seulement)
          spawnP(flameCore,m.position.x,m.position.y+.4,m.position.z,(Math.random()-.5)*2,.5+Math.random(),(Math.random()-.5)*2,.2);
        if(gap<bjD){bjD=gap;bjOn=true;botJetLight.position.copy(m.position).addScaledVector(FB.t,-2.4).addScaledVector(FB.n,.5);} // sa nitro éclaire AUSSI la route
      }
      if(li<2&&gap<170){ // les 2 plus proches allument VRAIMENT la route (et ta carrosserie)
        const l=gyroLights[li++];
        l.position.copy(m.position);l.position.addScaledVector(FB.n,2.2);
        l.color.setHex(bph?0xff3030:0x3f7dff);
        l.intensity=(1-gap/170)*2.6*(0.6+0.4*Math.abs(Math.sin((SURV.ph+b.ph)*Math.PI*4)));
      }
      }else b.mesh.g.visible=false;
    }else{b.mesh.g.visible=false;b.trailK=0;trailStep(b.trail,0,0,0,0,0,0,0);}
  }
  while(li<2)gyroLights[li++].intensity=0;
  botJetLight.intensity+=(((bjOn&&bjD<200)?(1-bjD/200)*2.2:0)-botJetLight.intensity)*Math.min(1,dt*10); // le reflet bleu suit la poussée la plus proche
  // ---- sirène : une seule voix, dosée sur la plus proche QUI POURSUIT (derrière toi) ----
  if(sirG){
    let near=1e9;for(const b of alive){const g9=pTot-b.totD;if(g9>0&&g9<near)near=g9;}
    const vol=near<170?(1-near/170)*.032:0; // basse, lointaine — la menace s'entend sans agresser
    sirG.gain.setTargetAtTime(SND.sfx?vol:0,AC.currentTime,.25);
  }
  // ---- DERNIER = CONDAMNÉ : la caisse clignote rouge, le HUD crie l'échéance ----
  if(mode!=='fall')SURV.last=alive.length>0&&pRank>alive.length; // (2026-09-30) le verdict se rend SUR LA ROUTE : en vol il garde celui du décollage (la dalle survolée peut être une autre branche de la piste), la pose le refait
  if(SONV2){ /* (console de son) TU ES DERNIER : le bip d'alarme, de plus en plus serré à mesure que la minute s'achève */
    if(SURV.last&&!gameOver){if(!SURV.alW&&performance.now()-(SURV.alQ||0)>500)SURV.alT=0;SURV.alT-=dt;if(SURV.alT<=0){const r9=Math.max(0,60-SURV.t);SURV.alT=Math.max(.18,Math.min(1.6,r9*.06));sfx('alerte.dernier',{vol:r9<10?2:0});}}
    if(SURV.alW&&!SURV.last)SURV.alQ=performance.now();SURV.alW=SURV.last&&!gameOver;} /* (débogage son 2026-09-29) une seconde place perdue puis reprise en moins de 0,5 s ne relance pas le bip */
  if(SURV.last&&!gameOver&&!TCTL.on){ // (2026-09-30) au téléphone, #lastAlert est masqué : on ne réécrit plus son HTML à chaque image
    const left=Math.max(0,Math.min(59,Math.ceil(60-SURV.t))); /* (24/10, relecture) jamais « 00:60 » (voir svClockDraw) */
    lastAlertEl.innerHTML=TR('⚠ ATTENTION !<br>TU ES DERNIER<br>EXPLOSION DANS : 00:')+String(left).padStart(2,'0');
    lastAlertEl.style.display='block';
  }else lastAlertEl.style.display='none';
  // (2026-09-30) LA MINUTE TOMBE EN VOL : le couperet ATTEND LA POSE — au plus airMax + ½ s (le pouvoir d'airtime infini n'est pas une cachette) ;
  // jamais sur une caisse qui explose déjà (l'attente d'une pose peut finir en explosion d'airtime : pas de « ÉLIMINÉ » par-dessus)
  if(SURV.t>=60&&mode!=='boom'&&!(mode==='fall'&&SURV.t<60.5+airMax())){ // ---- LE COUPERET ----
    SURV.t=SURV.t>60.5?0:SURV.t-60; // retardé par un vol : la minute suivante repart ENTIÈRE
    if(mode==='fall')SURV.last=alive.length>0&&pRank>alive.length; // vol trop long : on juge où il vole VRAIMENT
    if(SURV.last){ // le joueur est bon dernier : feu d'artifice funèbre
      SURV.over=true;lastAlertEl.style.display='none';
      showMsg('🪦 ÉLIMINÉ — DERNIER DE LA MINUTE !','#ff5e5e');
      flashEl.style.opacity=.85;setTimeout(function(){flashEl.style.opacity=0;},300);
      sparkBurst(sparkGold,carGroup.position,60,26);sparkBurst(sparkBlue,carGroup.position,40,20);
      shake=2.2;duckT=Math.max(duckT,.8);
      survRender();explode('police');
    }else{
      const low=racers[racers.length-1];
      if(low&&low.alive&&low.totD<pTot){botBoom(low); /* (24/10, relecture : « double explosion d'un policier ») `racers` est figé avant la boucle des policiers : celui qui vient d'y retomber à côté de la route (botBoom) ne resaute pas (preuve-police-double) */ // la meute s'ÉNERVE : pas plus vite que toi, mais plus téméraire
        for(const b of SURV.bots)if(b.alive){b.agro=Math.min(1,b.agro+.08);b.appBoost=Math.min(1.2,b.appBoost+.1);b.marg=Math.min(.97,b.marg+.02);}}
      if(!SURV.bots.some(b=>b.alive)){
        SURV.over=true;if(SONV2)sfx('victoire');else fanfare();
        runStats.surv=1; // toute la meute au tapis : ça débloque une caisse (versé dans endGame)
        // (2026-09-30) « JAUGE OFFERTE » n'offrait RIEN (addStyle est vide depuis le 2026-07-30) et le message passait par showMsg, muet au
        // téléphone : l'annonce passe au COULOIR (lisible partout), la nitro est VRAIMENT pleine, l'aura et la vibration saluent
        nitroR=Math.max(nitroR,nitroCap());
        slam('CHAMPION !','LA MEUTE EST AU TAPIS','#ffd75e','#5b7dff',44,3,26);
        try{chaineAura('CHAMPION',500,'survivant',false,SONV2);}catch(e){}
        hap([30,40,30,40,90]);
        vChip(''); // plus de meute, plus de plaque
      }
    }
  }
  SURV._r-=dt;if(SURV._r<=0){SURV._r=.25;survRender();if(TCTL.on&&!SURV.over)meuteTick();} // le panneau, lui, se contente de 4 Hz — (2026-09-30) au téléphone (#survHud et #lastAlert masqués), c'est la PLAQUE qui dit le rang, la minute et « DERNIER ! »
}
function survRender(){
  if(!svRowsEl||TCTL.on)return; // (2026-09-30) #survHud est masqué au téléphone : rien à repeindre
  const pTot=survPTot();
  const rows=[{name:TR('TOI'),totD:pTot,alive:!gameOver,me:true},...SURV.bots]
    .sort((a,b)=>(b.alive-a.alive)||(b.totD-a.totD));
  const leadD=rows.length&&rows[0].alive?rows[0].totD:pTot;
  let h='',rk=0;
  for(const r of rows){
    const gap=r.alive?(rk===0?TR('EN TÊTE'):'+'+Math.round(leadD-r.totD)+' m'):'';
    h+='<div class="svRow'+(r.me?' me':'')+(r.alive?'':' dead')+'">'
      +(r.alive?(++rk)+'. ':'🪦 ')+r.name+' <span>'+gap+'</span></div>';
  }
  svRowsEl.innerHTML=h;
}
/* ============================================================================
   LES SYSTÈMES DE ZONE (2026-09-27, ex-campagne des NUAGES) — ce qui reste depuis le retrait de la carrière (2026-10-18) : la courbure
   de la route (campCourbure : les filets, la ligne de la caisse-nuage), L'ORAGE (éclairs, tonnerre), LA CAISSE-NUAGE de l'ÉVÉNEMENT RARE
   et les deux aiguillages de zone (campDebut, campStop).
   ⚠ Tout est créé À L'INIT (maillages, matières, tampons) : zéro compilation, zéro allocation dans la boucle.
   ========================================================================== */
let CAMP_FLASH=0,CAMP_FOG=0,KAPB=new Float32Array(1);
const CV1=new THREE.Vector3(),CV2=new THREE.Vector3(),CV3=new THREE.Vector3(),CV4=new THREE.Vector3(),CM4=new THREE.Matrix4(); // temporaires DU MODULE (jamais tmp/tmp2/tmp3)
const GF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      GF2={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
function campCourbure(){ // la courbure LATÉRALE de la piste en chaque point (1/m, signée sur B : > 0 = le centre du virage est côté +B)
  if(KAPB.length!==NP)KAPB=new Float32Array(NP);
  for(let i=0;i<NP;i++){const a=Math.max(0,i-3),b=Math.min(NP-1,i+3),ds=Math.max(.5,pts[a].distanceTo(pts[b]));
    KAPB[i]=((T[b].x-T[a].x)*B[i].x+(T[b].y-T[a].y)*B[i].y+(T[b].z-T[a].z)*B[i].z)/ds;}
}
function portailVisible(v){for(const o of [portalMesh,PORTAL.noy,PORTAL.halo])if(o)o.visible=v;if(PCUBE.on){PCUBE.grp.visible=v;PCUBE.halo.visible=v;}if(PORTAL.lum)PORTAL.lum.intensity=v?(PCUBE.on?1.1:1.6):0;}
// ============ L'ORAGE : l'éclair RÉVÈLE, le tonnerre suit ============
function eclFab(N){ // (2026-10-21) UN jeu d'éclairs : une mesh de rubans additifs (N segments × 2 : halo violet + coeur blanc-bleu)
  const pos=new Float32Array(N*12),col=new Float32Array(N*12),uv=new Float32Array(N*8),idx=[];
  for(let i=0;i<N;i++){const o=i*4;idx.push(o,o+1,o+2,o+2,o+1,o+3);uv.set([0,0,1,0,0,1,1,1],i*8);}
  for(let i=0;i<N*4;i++)pos[i*3+1]=-99999;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:TRAIL_TEX,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.frustumCulled=false;m.renderOrder=2;scene.add(m);
  const P=[];for(let i=0;i<N+2;i++)P.push(new THREE.Vector3());
  return {m:m,pos:pos,col:col,N:N,P:P,seg:[],t:4,k:0,vie:0,dur:.34,tonT:-1,ton:0,dernier:false,viv:true};
}
const ECL=eclFab(170),ECL2=eclFab(240); // ECL : le COUP (du ciel au sol) · ECL2 : l'éclair DANS les nuages
function eclVide(){ECL.vie=0;ECL.k=0;ECL.seg.length=0;ECL.tonT=-1;ECL.viv=true;FIL.act.length=0;FIL.lit=false;for(let i9=0;i9<12;i9++)NBOLT.uBolt.value[i9].w=0;eclEcrit(ECL);eclEcrit(ECL2);CAMP_FLASH=0;CAMP_FOG=0;
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO;if(scene.fog){scene.fog.near=FOG_N;scene.fog.far=FOG_F;}} // (2026-09-29, audit GAMEPLAY) l'exposition et la brume ne sont réécrites qu'en course : sans ça, l'écran de fin gardait le flash (×1,8) ou la brume du banc
function eclFrac(P,q0,ax,ay,az,bx,by,bz,lv,disp){ // remplit P[q0 …] de 2^lv + 1 points de a à b par déplacement des milieux (brisé à toutes les échelles) ; rend leur nombre
  const n=1<<lv;P[q0].set(ax,ay,az);P[q0+n].set(bx,by,bz);
  for(let step=n;step>1;step>>=1){const half=step>>1,d=disp*(step/n);for(let i=half;i<n;i+=step){const A=P[q0+i-half],B=P[q0+i+half];P[q0+i].set((A.x+B.x)/2+(Math.random()-.5)*d,(A.y+B.y)/2+(Math.random()-.5)*d*.45,(A.z+B.z)/2+(Math.random()-.5)*d);}}
  return n+1;}
function eclFrappe(){
  const fin=s>L-1700&&!ECL.dernier;
  if(fin){ECL.dernier=true;frameAt(Math.max(0,L-60),GF);const l=Math.hypot(GF.t.x,GF.t.z)||1;CV1.set(PORTAL.c.x+GF.t.z/l*150,PORTAL.c.y-140,PORTAL.c.z-GF.t.x/l*150);} // le DERNIER éclair tombe à côté du portail
  else if(Math.random()<.3){const sT=Math.min(L-10,s+300+Math.random()*260);frameAt(sT,GF);const l=Math.hypot(GF.t.x,GF.t.z)||1,d=(Math.random()-.5)*ROAD_HALF*1.2; // (2026-10-21, Léo : « parfois ça frappe la route ») le coup tombe SUR le ruban : gerbe d'étincelles bleues, visuel seulement
    CV1.set(GF.p.x+GF.t.z/l*d,GF.p.y+1,GF.p.z-GF.t.x/l*d);ECL.sol=true;}
  else{const sT=Math.min(L-10,s+380+Math.random()*520);frameAt(sT,GF);const l=Math.hypot(GF.t.x,GF.t.z)||1,d=(Math.random()<.5?-1:1)*(ROAD_HALF+90+Math.random()*420);
    CV1.set(GF.p.x+GF.t.z/l*d,GF.p.y-150,GF.p.z-GF.t.x/l*d);}
  // (2026-10-21, « ta foudre n'est pas encore assez belle ») LE COUP EN ARBRE : un tronc FRACTAL (32 segments, déplacement par milieux : brisé à toutes les échelles, jamais droit), quatre branches qui
  // plongent en s'écartant (8 segments chacune) dont deux se re-divisent — un cœur blanc fin dans un halo violet large (voir eclEcrit)
  const P=ECL.P,H=720;ECL.seg.length=0;let q=0;
  const tx=CV1.x+(Math.random()-.5)*90,tz=CV1.z+(Math.random()-.5)*90;
  const nT=eclFrac(P,0,tx,CV1.y+H,tz,CV1.x,CV1.y,CV1.z,5,170);q=nT;
  for(let k=0;k<nT-1;k++)ECL.seg.push(k,k+1,5.4);
  for(let b=0;b<4&&q<P.length-24;b++){const k=4+((Math.random()*22)|0),a9=Math.random()*6.283,o=P[k],d9=170+Math.random()*130;
    const nb=eclFrac(P,q,o.x,o.y,o.z,o.x+Math.cos(a9)*d9,o.y-120-Math.random()*190,o.z+Math.sin(a9)*d9,3,60);
    for(let i=0;i<nb-1;i++)ECL.seg.push(q+i,q+i+1,Math.max(.9,2.6-i*.18));
    if(b<2&&q+nb<P.length-8){const m9=q+3,om=P[m9],nb2=eclFrac(P,q+nb,om.x,om.y,om.z,om.x+Math.cos(a9+1.1)*90,om.y-70-Math.random()*70,om.z+Math.sin(a9+1.1)*90,2,28);
      for(let i=0;i<nb2-1;i++)ECL.seg.push(q+nb+i,q+nb+i+1,1.1);q+=nb2;}
    q+=nb;}
  ECL.luM=[P[(nT*.25)|0],P[(nT*.5)|0],P[(nT*.8)|0]]; // les points qui éclairent la ouate autour du coup
  ECL.vie=ECL.dur=.34;ECL.k=1;if(ECL.sol){ECL.sol=false;try{sparkBurst(sparkBlue,CV1,34,16);sparkBurst(sparkGold,CV1,10,9);}catch(e9){}shake=Math.max(shake,.3);}
  const dd=CV2.subVectors(CV1,carGroup.position).length();
  ECL.tonT=.25+dd/1400;ECL.ton=Math.max(.25,1-dd/1400);if(SONV2)sfx('foudre.eclair',{vol:-14+14*ECL.ton}); // le tonnerre arrive après, et plus fort quand c'est près
  if(dd<700)hap(12);
}
/* ============ LES FILS D'ÉLECTRICITÉ DANS LES NUAGES (2026-10-21, Léo : « il faudrait des petits fils d'électricité qui passent dans le nuage et qui éclairent un peu autour ; c'est pas tout le nuage qui flashe, c'est en fonction de où la lumière va ») ============
   Sur la map ORAGE (en course, et au menu quand ce ciel est choisi) : jusqu'à 3 FILS à la fois, chacun une ligne fine et brisée (fractale, 16 segments + 2 petites branches) qui traverse UN gros nuage de bout en bout
   et vit 0,55-1,05 s (montée rapide, longue traîne douce, un léger frémissement) ; ils posent chacun TROIS LUMIÈRES de monde (NBOLT) le long d'eux : la ouate s'éclaire AUTOUR (violet, blanc au plus près),
   le reste du nuage reste sombre. Largeur : jamais sous 0,22 % de la distance (le fil se lit de loin). */
const FIL={act:[],t:.5,max:2,lit:false};
function filSources(){ // les nuages où un fil peut naître : en course, ceux du ciel de coton ; au menu, les cumulus du titre
  const out=[],cam=camera.position;
  if(started&&!gameOver&&COTON.n>0&&COTON.I){const I=COTON.I;
    for(let j=0;j<COTON.n;j++){const o=j*COTON_ST,r=I[o+3];if(r<60)continue;const S=COTON.S[I[o+5]],dx=I[o]-cam.x,dz=I[o+2]-cam.z,d=Math.sqrt(dx*dx+dz*dz);if(d<160||d>1900)continue;
      out.push({x:I[o],y:I[o+1]+S.base*r*I[o+9]+I[o+7]*.5,z:I[o+2],rx:r*I[o+8]*.8,ry:Math.max(20,(S.top-S.base)*r*I[o+9]*.45),d:d});}}
  else if(typeof CHUTE!=='undefined'&&CHUTE.nu){for(const c of CHUTE.nu){const m=c.m;if(!m.visible||c.r<50)continue;const dx=m.position.x-cam.x,dy=m.position.y-cam.y,dz=m.position.z-cam.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<100||d>9000)continue;
    out.push({x:m.position.x,y:m.position.y,z:m.position.z,rx:c.r*.75,ry:c.r*.35,d:d});}}
  return out;}
function filVu(q){CV3.set(q.x,q.y,q.z).project(camera);return CV3.z<1&&Math.abs(CV3.x)<1.15&&Math.abs(CV3.y)<1.15;} // le centre du nuage est (à peu près) dans l'image
function filNeuf(){
  let S=filSources();if(!S.length)return;{const V=S.filter(filVu);if(V.length)S=V;} // (2026-10-21, « jvois pas ») un fil naît dans un nuage QU'ON VOIT — pas dans un nuage derrière soi ou hors champ
  /* (« un nuage est allumé presque constamment en violet ») le choix favorisait toujours le plus gros nuage proche : c'était TOUJOURS le même. Désormais : au hasard parmi les nuages visibles, jamais l'un des 4 derniers. */
  const cle=function(q){return Math.round(q.x/40)+','+Math.round(q.y/40)+','+Math.round(q.z/40);};FIL.rec=FIL.rec||[];
  {const L9=S.filter(function(q){return FIL.rec.indexOf(cle(q))<0;});if(L9.length)S=L9;}
  const c0=S[(Math.random()*S.length)|0];let c=c0;FIL.rec.push(cle(c0));if(FIL.rec.length>4)FIL.rec.shift();
  /* (2026-10-21, Léo : « les traits électriques doivent embrasser les courbes, pas qu'une ligne et trajectoire ; ils se promènent — regarde les images sur Internet ; là t'en as trop mis ») VUS SUR PHOTOS (éclairs dans
     et entre les nuages) : UN canal fin qui SERPENTE en longues courbes douces, de fines dentelures, deux-trois branches qui s'effilent, parfois une boucle — et un ou deux à la fois. Ici : une MARCHE À CAP PERSISTANT sur la face du nuage
     (le cap tourne doucement, ondule à basse fréquence, et est rappelé vers le centre quand il approche du bord : le fil épouse le bombé du nuage au lieu de le traverser en droite), 26 pas ; deux branches courtes qui s'amincissent. */
  const R=c.rx*.88,seg=[],NP9=26,ps=Math.random()*6.283;
  const cam9=camera.position;CV4.set(cam9.x-c.x,cam9.y-c.y,cam9.z-c.z).normalize(); // vers la caméra (le nuage est OPAQUE : le fil court sur la face qu'on voit)
  const vx=CV4.x,vy=CV4.y,vz=CV4.z;let rx9=vz,ry9=0,rz9=-vx;{const l9=Math.hypot(rx9,rz9);if(l9<1e-4){rx9=1;rz9=0;}else{rx9/=l9;rz9/=l9;}}
  const uxx=vy*rz9-vz*ry9,uyy=vz*rx9-vx*rz9,uzz=vx*ry9-vy*rx9; // le « haut » du plan du nuage (v × droite)
  const cx9=c.x+vx*c.rx*.9,cy9=c.y+vy*c.rx*.9,cz9=c.z+vz*c.rx*.9;
  const P=[];for(let i=0;i<44;i++)P.push(new THREE.Vector3());const TH=[];
  const pose=function(i,u,w,d){P[i].set(cx9+rx9*u+uxx*w+vx*d,cy9+ry9*u+uyy*w+vy*d,cz9+rz9*u+uzz*w+vz*d);};
  const wrap=function(a){while(a>3.1416)a-=6.2832;while(a<-3.1416)a+=6.2832;return a;};
  const a0=Math.random()*6.283;let u=Math.cos(a0)*R*.78,w=Math.sin(a0)*R*.55,th=a0+3.1416+(Math.random()-.5)*1.1;pose(0,u,w,0);TH[0]=th;
  for(let i=1;i<=NP9;i++){let turn=(Math.random()-.5)*.42+.3*Math.sin(i*.42+ps); // des dentelures fines + une ondulation lente
    const dist=Math.hypot(u,w);if(dist>R*.75){turn+=wrap(Math.atan2(-w,-u)-th)*.3;} // près du bord : rappelé vers le centre, il épouse le contour
    th+=turn;const step=R*.072*(.8+Math.random()*.4);u+=Math.cos(th)*step;w+=Math.sin(th)*step;pose(i,u,w,Math.sin(i*.3+ps)*R*.05);TH[i]=th;
    seg.push(i-1,i,1.0);}
  let q=NP9+1;
  for(const k of [5+((Math.random()*4)|0),14+((Math.random()*5)|0)]){ // deux branches courtes qui s'effilent
    const o=P[k];let bth=TH[k]+(Math.random()<.5?-1:1)*(.55+Math.random()*.5),bu=0,bw=0,prev=k;
    // la branche repart du point k, dans le plan : on reprend (u,w) du point par projection
    const dx=o.x-cx9,dy=o.y-cy9,dz=o.z-cz9;bu=dx*rx9+dy*ry9+dz*rz9;bw=dx*uxx+dy*uyy+dz*uzz;
    for(let i=1;i<=7&&q<P.length;i++,q++){bth+=(Math.random()-.5)*.5;const st=R*.06*(1-i*.09);bu+=Math.cos(bth)*st;bw+=Math.sin(bth)*st;pose(q,bu,bw,0);seg.push(prev,q,Math.max(.32,.62-i*.05));prev=q;}}
  FIL.act.push({P:P,seg:seg,age:0,dur:.9+Math.random()*.6,seed:Math.random()*6.28,lu:[P[5],P[12],P[20]]});}
window.dbgFil=function(){const S=filSources(),U=NBOLT.uBolt.value;const f0=FIL.act[0],nd=f0?[0,8,16].map(function(k){CV3.copy(f0.P[k]).project(camera);return [+CV3.x.toFixed(2),+CV3.y.toFixed(2),+CV3.z.toFixed(3)];}):null,dist=f0?+f0.P[8].distanceTo(camera.position).toFixed(0):null,w0=f0?f0.seg[2]:null;return {ndc:nd,dist:dist,fils:FIL.act.length,sources:S.length,lit:FIL.lit,lum:U.map(function(v){return +v.w.toFixed(2);}),quads:ECL2.m.geometry.attributes.position.array.reduce(function(a,v,i){return a+((i%3===1&&v>-99999)?1:0);},0)/4,visible:ECL2.m.visible,t:FIL.t};}; // (banc)
function filTick(dt,on){
  const U=NBOLT.uBolt.value;
  if(!on){if(FIL.lit||FIL.act.length){FIL.act.length=0;FIL.lit=false;for(let i=0;i<9;i++)U[i].w=0;eclEcrit(ECL2);}return;}
  FIL.t-=dt;if(FIL.t<=0){if(FIL.act.length<FIL.max)filNeuf();FIL.t=1.1+Math.random()*2.2; /* peu : un ou deux à la fois (les vraies photos) */}
  const P9=ECL2.pos,C9=ECL2.col,cam=camera.position;let n=0;
  for(let i=FIL.act.length-1;i>=0;i--){const f=FIL.act[i];f.age+=dt;if(f.age>=f.dur){FIL.act.splice(i,1);}}
  for(let i=0;i<3;i++){const f=FIL.act[i];if(!f){for(let k=0;k<3;k++)U[i*3+k].w=0;continue;}
    const u=f.age/f.dur,env=(u<.14?u/.14:Math.pow(1-(u-.14)/.86,1.5))*(.88+.12*Math.sin(f.age*26+f.seed)); // monte vite, longue traîne, frémit (faiblement)
    for(let k=0;k<3;k++){const l=f.lu[k];U[i*3+k].set(l.x,l.y,l.z,env*1.15);}
    for(let j=0;j<f.seg.length&&n+1<ECL2.N;j+=3){const a=f.P[f.seg[j]],b=f.P[f.seg[j+1]],w0=f.seg[j+2],dc=Math.sqrt((a.x-cam.x)*(a.x-cam.x)+(a.y-cam.y)*(a.y-cam.y)+(a.z-cam.z)*(a.z-cam.z));
      for(let h=0;h<2;h++,n++){const w=Math.max(w0,dc*.0034)*(h?1:4.6),o=n*12;
        CV3.subVectors(b,a);CV4.subVectors(cam,a);CV4.crossVectors(CV3,CV4);const l=CV4.length();if(l>1e-6)CV4.multiplyScalar(w/l);
        P9[o]=a.x-CV4.x;P9[o+1]=a.y-CV4.y;P9[o+2]=a.z-CV4.z;P9[o+3]=a.x+CV4.x;P9[o+4]=a.y+CV4.y;P9[o+5]=a.z+CV4.z;
        P9[o+6]=b.x-CV4.x;P9[o+7]=b.y-CV4.y;P9[o+8]=b.z-CV4.z;P9[o+9]=b.x+CV4.x;P9[o+10]=b.y+CV4.y;P9[o+11]=b.z+CV4.z;
        const f9=env*(h?1.15:.9),r9=h?.95*f9:.36*f9,g9=h?.97*f9:.22*f9,b9=h?1.2*f9:.7*f9;for(let k=0;k<4;k++){C9[o+k*3]=r9;C9[o+k*3+1]=g9;C9[o+k*3+2]=b9;}}}}
  for(let i=n;i<ECL2.N;i++){const o=i*12;if(P9[o+1]===-99999)continue;for(let k=0;k<4;k++){P9[o+k*3+1]=-99999;C9[o+k*3]=C9[o+k*3+1]=C9[o+k*3+2]=0;}}
  const at=ECL2.m.geometry.attributes;at.position.needsUpdate=true;at.color.needsUpdate=true;FIL.lit=true;ECL2.viv=true;}
function eclEnv(E){const u=1-E.vie/E.dur;return u<.1?1:u<.2?1-.45*((u-.1)/.1):u<.3?.55+.45*((u-.2)/.1):Math.max(0,1-(u-.3)/.7);} // le coup : un fondu à deux lobes (jamais une alternance)
function eclEcrit(E){ // (2026-10-21) les rubans d'un jeu d'éclairs : halo violet (large, doux) + coeur blanc-bleu ; l'enveloppe est UN fondu à deux lobes (le coup, un creux à 55 %, le retour) — jamais une alternance
  E=E||ECL;const P=E.pos,C=E.col,cam=camera.position,on=E.vie>0;let n=0;
  if(on){const fl=eclEnv(E);
    for(let j=0;j<E.seg.length&&n+1<E.N;j+=3){const a=E.P[E.seg[j]],b=E.P[E.seg[j+1]],w0=E.seg[j+2];
      for(let h=0;h<2;h++,n++){const dcm=Math.sqrt((a.x-cam.x)*(a.x-cam.x)+(a.y-cam.y)*(a.y-cam.y)+(a.z-cam.z)*(a.z-cam.z)),w1=Math.max(w0,dcm*.0016),w=h?w1:w1*5.2,o=n*12;
        CV3.subVectors(b,a);CV4.subVectors(cam,a);CV4.crossVectors(CV3,CV4);const l=CV4.length();if(l>1e-6)CV4.multiplyScalar(w/l);
        P[o]=a.x-CV4.x;P[o+1]=a.y-CV4.y;P[o+2]=a.z-CV4.z;P[o+3]=a.x+CV4.x;P[o+4]=a.y+CV4.y;P[o+5]=a.z+CV4.z;
        P[o+6]=b.x-CV4.x;P[o+7]=b.y-CV4.y;P[o+8]=b.z-CV4.z;P[o+9]=b.x+CV4.x;P[o+10]=b.y+CV4.y;P[o+11]=b.z+CV4.z;
        const f=fl*(w0>6?1.4:1),r9=h?.95*f:.34*f,g9=h?.97*f:.2*f,b9=h?1.18*f:.62*f;for(let k=0;k<4;k++){C[o+k*3]=r9;C[o+k*3+1]=g9;C[o+k*3+2]=b9;}}}}
  for(let i=n;i<E.N;i++){const o=i*12;if(P[o+1]===-99999)continue;for(let k=0;k<4;k++){P[o+k*3+1]=-99999;C[o+k*3]=C[o+k*3+1]=C[o+k*3+2]=0;}}
  if(on||E.viv){const at=E.m.geometry.attributes;at.position.needsUpdate=true;at.color.needsUpdate=true;}
  E.viv=on;
}
window.dbgEclair=function(k){ // (banc, 2026-10-21) déclenche un éclair tout de suite : 'nuage' (dans un nuage) · 'coup' (du ciel au sol) · 'route' (SUR la route)
  if(k==='nuage')filNeuf();else if(k==='route'){const r=Math.random;Math.random=function(){return .1;};try{eclFrappe();}finally{Math.random=r;}}else eclFrappe();return {coup:ECL.vie,fils:FIL.act.length};};
function orageTick(dt){
  ECL.t-=dt;if(ECL.t<=0){eclFrappe();ECL.t=3.4+Math.random()*4;}
  if(ECL.vie>0)ECL.vie-=dt;
  ECL.k=Math.max(0,ECL.k-dt*1.9);
  const e=ECL.k*ECL.k;
  CAMP_FLASH=.8*e; /* (2026-10-14, WCAG 2.3.1) UN flash qui s'éteint en douceur par éclair ; (2026-10-21) les fils des nuages ne flashent plus l'écran : ils éclairent LOCALEMENT (filTick) */
  CAMP_FOG=1900*e;
  {const U=NBOLT.uBolt.value,lu=ECL.luM,en=ECL.vie>0&&lu?eclEnv(ECL):0;for(let k=0;k<3;k++){if(lu&&en>0)U[9+k].set(lu[k].x,lu[k].y,lu[k].z,en*1.4);else U[9+k].w=0;}} // le coup éclaire les nuages autour de son tronc
  eclEcrit(ECL);
  if(ECL.tonT>=0){ECL.tonT-=dt;if(ECL.tonT<0){try{if(SONV2)sfx('tonnerre',{vol:-10+10*ECL.ton});else{subBoom(.14+.16*ECL.ton);noiseBurst(1.5,.07+.1*ECL.ton,150);noiseBurst(.35,.05*ECL.ton,900);}}catch(e9){}if(ECL.ton>.7)shake=Math.max(shake,.25);}}
}
// ============ LA CAISSE-NUAGE (la caisse du garage, et l'ÉVÉNEMENT RARE) ============
// La même ouate que le ciel (mergeSpheres : ventre lavande, sommet blanc, creux ombrés ; la matière des nuages et sa lisière d'argent),
// posée sur un vrai châssis, quatre roues, des feux sobres. UN jeu de boules pour la caisse du garage (SHAPES.nuage) et pour le fantôme.
const NUAGE_BLOBS=[ // (x, y, z, rayon, aplatissement) en MÈTRES, centre de caisse — nez en +z
  [-.52,-.16,-1.42,.5,.85],[.52,-.16,-1.42,.5,.85],[0,.05,-1.34,.58,.9],   // la poupe
  [0,.3,-.36,.56,1],[-.46,.2,-.24,.46,1],[.46,.2,-.24,.46,1],             // l'habitacle : le dôme du toit
  [-.3,.14,.32,.42,.9],[.3,.14,.32,.42,.9],                                // le pare-brise bombé
  [-.5,-.2,.78,.48,.8],[.5,-.2,.78,.48,.8],[0,-.07,.98,.54,.75],          // le capot, sur les roues avant
  [0,-.26,1.62,.42,.7],                                                     // le museau
  [-.72,-.3,-.1,.4,.7],[.72,-.3,-.1,.4,.7]];                               // les portières
const NUAGE_Y=.88,GH_K=1.1; // hauteur du centre de la ouate (le châssis dessous, les roues au sol)
function nuageMat(){ // la ouate OPAQUE : la matière des nuages (même modelé, même lisière d'argent), sans leur transparence
  const m=new THREE.MeshPhongMaterial({color:0xfff7f0,vertexColors:true,shininess:14,specular:0x8f89a4,emissive:0x2a2232,emissiveIntensity:.55});
  m.onBeforeCompile=nuageShader;m.customProgramCacheKey=function(){return 'nuageCaisse';};
  return m;
}
SHAPES.nuage=function(K){ // la caisse du garage — le châssis, la ouate ; buildCar pose les roues, les feux et les pots aux ancrages rendus
  const g=mergeSpheres(NUAGE_BLOBS,1,1,1),m=new THREE.Mesh(g,nuageMat());m.position.y=NUAGE_Y;K.add(m);
  K.box(1.86,.2,3.7,K.dark,0,.44,0);                                        // le châssis, qu'on devine sous le ventre de ouate
  K.box(1.7,.12,.16,K.chrome,0,.5,1.98);K.box(1.66,.12,.16,K.chrome,0,.52,-1.96); // les pare-chocs, fins
  return {hl:[.56,.6,1.98],tl:[.6,.66,-1.98],wr:.9,wx:.98,wz:1.28,split:0,skirt:0,sp:0,doors:0,slats:0,wings:'none',glowX:1.0,glowY:.5,glowL:3,glowF:0};
};
const GH=(function(){ // le fantôme : SA caisse, SON ruban — créés à l'init, cachés hors de l'événement rare
  const g=new THREE.Group(),dk=new THREE.MeshPhongMaterial({color:0x1a1c24,shininess:40,specular:0x333844}),
        cr=new THREE.MeshPhongMaterial({color:0xf3e9dc,shininess:160,specular:0xffffff}),
        pn=new THREE.MeshPhongMaterial({color:0x17181d,shininess:8});
  const corps=new THREE.Mesh(mergeSpheres(NUAGE_BLOBS,1,1,1),nuageMat());corps.position.y=NUAGE_Y;g.add(corps);
  const ch=new THREE.Mesh(new THREE.BoxGeometry(1.86,.2,3.7),dk);ch.position.y=.44;g.add(ch);
  for(const z of [1.98,-1.96]){const pc=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.16),cr);pc.position.set(0,.51,z);g.add(pc);}
  const roues=[],pG=new THREE.CylinderGeometry(.36,.36,.3,16),jG=new THREE.CylinderGeometry(.22,.22,.32,10);
  for(const sx of [-1,1])for(const sz of [1,-1]){const w=new THREE.Group();
    const p=new THREE.Mesh(pG,pn);p.rotation.z=Math.PI/2;w.add(p);
    const j=new THREE.Mesh(jG,cr);j.rotation.z=Math.PI/2;w.add(j);
    w.position.set(sx*.98,.36,sz*1.28);g.add(w);roues.push(w);}
  const phM=new THREE.SpriteMaterial({map:lampTex,color:0xfff1d6,transparent:true,opacity:.95,depthWrite:false}),
        feM=new THREE.SpriteMaterial({map:lampTex,color:0xff7aa8,transparent:true,opacity:.85,depthWrite:false});
  for(const sx of [-1,1]){const a=new THREE.Sprite(phM);a.scale.set(.75,.75,1);a.position.set(sx*.56,.62,2.02);g.add(a);
    const r=new THREE.Sprite(feM);r.scale.set(.6,.6,1);r.position.set(sx*.6,.66,-2.02);g.add(r);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.visible=false;scene.add(g);
  return {g:g,roues:roues,tr:mkTrail(),on:false,s:0,lat:0,v:0,momT:0,yaw:0,
    prise:0,pris:false,fini:false,accr:false,line:null,tmpL:null,noteT:0,latP:0};
})();
function campChauffe(){ // compile la caisse-nuage et une voiture de police AU MENU (renderer.compile ne voit que ce qui est visible)
  if(campChauffe.fait)return;campChauffe.fait=true;
  const v=GH.g.visible;GH.g.visible=true;GH.g.position.copy(camera.position).add(CV1.set(0,0,-8).applyQuaternion(camera.quaternion));GH.g.updateMatrixWorld(true);
  let pc=null;try{pc=mkPolice(0);pc.g.visible=true;pc.g.position.copy(GH.g.position);pc.g.updateMatrixWorld(true);}catch(e){}
  try{renderer.compile(scene,camera);}catch(e){}
  GH.g.visible=v;
  if(pc){scene.remove(pc.g);pc.g.traverse(o=>{if(o.userData&&o.userData.sol){if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}});}
}
function ghIdx(sv){return Math.max(0,Math.min(NP-1,Math.round(sv/L*(NP-1))));}
function fantomeLigne(){ // LA LIGNE GRAVÉE : la corde de chaque virage, lissée sur ±60 m
  if(!GH.line||GH.line.length!==NP){GH.line=new Float32Array(NP);GH.tmpL=new Float32Array(NP);}
  const A=GH.tmpL,Bl=GH.line,Lh=ROAD_HALF-5;
  for(let i=0;i<NP;i++){const k=KAPB[i];A[i]=Math.sign(k)*Lh*Math.min(1,Math.abs(k)*260);}
  const w=Math.max(4,Math.round(60/Math.max(.1,L/(NP-1))));
  for(let pass=0;pass<2;pass++){const src=pass?Bl:A,dst=pass?A:Bl;let acc=0,cnt=0;
    for(let i=-w;i<NP;i++){const a=i+w,r=i-w-1;if(a<NP){acc+=src[a];cnt++;}if(r>=0){acc-=src[r];cnt--;}if(i>=0)dst[i]=acc/Math.max(1,cnt);}}
  Bl.set(A);
}
function fantomePrepare(){ // une zone commence : la caisse-nuage de la zone d'avant est rangée (evtDemarre la relance)
  GH.on=false;GH.g.visible=false;GH.tr.init=false;GH.tr.m.visible=false;
}
function fantomePose(dt){ // la caisse-nuage dans le monde : au sol sur sa ligne
  const g=GH.g;
  frameAt(GH.s,GF);
  g.position.copy(GF.p).addScaledVector(GF.b,GH.lat);
  CM4.makeBasis(GF.b,GF.n,GF.t);g.quaternion.setFromRotationMatrix(CM4);
  g.rotateY(GH.yaw);
  const rv=GH.v*SPD*dt/.36;for(const w of GH.roues)w.rotation.x+=rv;
  g.visible=Math.abs(GH.s-s)<1100;
  /* (2026-10-15, Sacha : « son sillage, je sais pas ce que c'est, supprime-le, c'est nul ») plus de ruban d'or rose derrière la
     caisse-nuage — il reste éteint (trailStep à 0 le cache) */
  trailStep(GH.tr,0,0,0,0,0,0,0);
}
function fantomeTick(dt){
  if(!GH.on||GH.pris||GH.fini){if(GH.on&&GH.fini)GH.g.visible=false;return;}
  // ---- SA COURSE : tes équations, TON moteur, jamais de nitro (voir la boucle : accélération, momentum, traînée, pente) ----
  // GH_K : 10 % de plus en POINTE que toi (mesuré : à armes égales un coup de nitro toutes les 6 s la cueillait en 11 s ; à +5 % et 125 m
  // d'avance, en 14 s) — on la rattrape au nitro et dans les nuages, pas en roulant tout droit
  const sp=CARS[0],late=lateMul(),eng=ENGINE_TIERS[engTier]||ENGINE_TIERS[0],mx=sp.maxKmh/3.6*late*eng.push*GH_K,acc=sp.accel*late*(1+(eng.push-1)*.6);
  GH.momT=Math.min(4.3,GH.momT+dt);const momF=1+Math.min(1.8,GH.momT*GH.momT*.1),i=ghIdx(GH.s);
  GH.v+=acc*(GH.v<mx?1:.55)*momF*dt;
  if(startBoostT>0)GH.v+=30*eng.push*dt; // le boost de départ vaut pour elle aussi (sinon on la cueillait dans les 3 premières secondes)
  GH.v+=-GRAV*T[i].y*dt;
  GH.v-=GH.v*Math.abs(GH.v)*(acc/(mx*mx*5.8))*dt;GH.v*=Math.max(0,1-.03*dt);
  {const gp=s-GH.s;if(gp>0&&gp<46&&mode==='drive')GH.v+=9*(1-gp/46)*dt;} // l'aspiration vaut pour elle aussi : dépassée de près, elle revient dans TON sillage
  const lT=GH.line[i],lat0=GH.lat;GH.lat+=(lT-GH.lat)*Math.min(1,dt*1.8);
  const ds=GH.v*dt*SPD;GH.s+=ds;
  GH.yaw+=(Math.atan2(GH.lat-lat0,Math.max(.01,ds))-GH.yaw)*Math.min(1,dt*8);
  if(GH.s>=L-45){fantomeSeme();return;} // ELLE PASSE LE PORTAIL LA PREMIÈRE
  fantomePose(dt);
  // ---- LE SILLAGE : tenir 1 s dans sa bulle (18 m autour d'elle — derrière, ou à sa hauteur quand on remonte) ----
  // (mesuré : une zone de 15 m derrière sa POUPE ne tenait pas 1 s à 17 m/s d'écart, et on la dépassait sans l'attraper — or sans frein
  // on ne revient plus derrière elle. La bulle laisse ~1,9 s à qui remonte dans sa ligne ; qui passe loin sur le côté ne l'a pas attrapée.)
  CV1.set(0,.6,-.8).applyQuaternion(GH.g.quaternion).add(GH.g.position); // le cœur de la caisse (un peu en arrière)
  const d=CV1.distanceTo(carGroup.position),sP=mode==='fall'?lastNearS:s;
  const derriere=mode==='fall'?true:(sP<=GH.s+2);
  if(d<46&&derriere&&mode==='drive'){ // L'ASPIRATION : dans son sillage, l'air te tire (et la ouate file autour de toi)
    const k=1-d/46;vA+=9*k*dt;} // (2026-10-15, Sacha) plus de ouate qui file autour de toi dans son sillage : l'aspiration tire toujours, sans rien montrer
  if(d<18){
    if(!GH.accr){GH.accr=true;popTexte('ACCROCHE !','#ffe7a8',2);hap(12);if(SONV2)sfx('fantome.accroche');}
    GH.prise+=dt;GH.noteT-=dt;
    if(GH.noteT<=0){GH.noteT=.2;try{if(SONV2)sfx('fantome.prise',{st:sonPd(Math.min(9,Math.floor(GH.prise*6)))});else chimeNote(noteP(Math.min(7,Math.floor(GH.prise*6)),1),0,.07,.2);}catch(e){}} // un carillon qui MONTE : le compteur, on l'entend
    if(GH.prise>=1){evtCnPris();return;} // (2026-10-14, GAMEPLAY) l'ÉVÉNEMENT RARE paie sa prime
  }else{GH.prise=Math.max(0,GH.prise-dt*1.5);if(GH.prise<=0)GH.accr=false;}
  if(GH.s-sP>EVT_FUITE){fantomeSeme();return;} // (2026-10-14, GAMEPLAY) ÉVÉNEMENT RARE : 600 m d'avance, elle s'est enfuie — on ne la poursuit pas une minute dans le vide
  vChip(''); // (2026-10-15, Sacha : « je sais pas ce que c'est, enlève-le complètement ») plus de plaque pour la caisse-nuage — l'ACCROCHE et le carillon disent la prise
}
function fantomeSeme(){ // elle a franchi le portail la première, ou elle s'est enfuie : c'est perdu
  if(GH.fini||GH.pris)return;GH.fini=true;GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);vChip('');
  flashEcran('rgba(255,120,190,.5)');try{if(SONV2)sfx('defaite');else portalSnd();}catch(e){}
  slam("ELLE T'A SEME",'','#ff9ee6','#ff5e7a',38,3);
  evtFin('rate'); // (2026-10-14, GAMEPLAY) l'ÉVÉNEMENT RARE perdu ne coûte rien : la partie continue
}
// ============ L'AIGUILLAGE ============
function campDebut(){ // une zone commence (newTrack, et le 1er départ de la session) : l'orage repart, la caisse-nuage se range, la plaque se tait
  eclVide();ECL.t=3;ECL.dernier=false;
  fantomePrepare();
  vChipK='';vChip('');
  evtZone(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : la partie armée pose le sien sur la 1re zone qui a sa map
}
function campStop(){eclVide();if(GH.on){GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);}vChip('');}
/* LA ROUTE QUI TE RATTRAPE — LES DEUX PAIEMENTS (Sacha : « un virage bien pris paie PLUS qu'une chute rattrapée »).
   VIRAGE À FOND : traverser un virage à filet sans quitter la route, sans jamais descendre sous FILET.vFond × sa vitesse de calcul
   (120 d'aura, du flow de route, un peu de nitro) — en plus du VIRAGE SERRÉ s'il tombe. RATTRAPÉ : sortir de ce virage et retomber
   dans son filet (50 d'aura, un peu de flow) — la pose LOURDE et la vitesse perdue font le reste. Les figures du vol (BIG AIR, dauphin…)
   restent au voltigeur. */
const FILR={q:null,ok:false,vMin:0};
function filetTick(){ // appelée chaque image AU SOL (la boucle de conduite)
  if(!FILETS.length)return;
  let q=null;for(const f9 of FILETS)if(s>=f9.sC0&&s<=f9.sC1){q=f9;break;}
  const v9=Math.abs(vA)*SPD;
  if(q&&FILR.q!==q){FILR.q=q;FILR.ok=!q.paye;FILR.vMin=v9;}
  else if(q){FILR.vMin=Math.min(FILR.vMin,v9);}
  else if(FILR.q){const q9=FILR.q;FILR.q=null;
    if(FILR.ok&&s>q9.sC1&&s<q9.sC1+200&&FILR.vMin>=FILET.vFond*q9.vN){q9.paye=true;
      try{chaineAura('VIRAGE A FOND',120,'fond',true,false);flowAdd(14,'route');nitroGain(.25,'virage');hap([10,20,14]);}catch(e){}}
    FILR.ok=false;}
}
function filetRattrape(q){
  try{chaineAura('RATTRAPE',50,'filet',false,SONV2);flowAdd(6,'risque');hap([12,24,18]); // (un seul texte : celui de la chaîne — « moins de textes au milieu de l'écran », 661854a)
    if(SONV2)sfx('raccourci');}catch(e){}
}
function flowRaccourci(gagne,decl){ // decl : l'appelant fera partir la frénésie armée si le lieu l'accepte (tryLand, loi 20) — le portail, non : il a déjà son annonce de niveau
  (decl&&FLOW2.decl.racc?flowAddDecl:flowAdd)(Math.min(45,12+gagne*.06),'risque','m'); // (v4) couper la route : MACHIAVEL
  popTexte(TR('RACCOURCI')+' +'+Math.round(gagne)+' M','#7dffec',3);hap([12,24,18]);nitroGain(.3,'raccourci');
  try{chaineAura('RACCOURCI',Math.round(Math.min(250,60+gagne*.2)),'coupe',false,SONV2);}catch(e){}
  try{if(SONV2)sfx('raccourci');else{chimeNote(noteP(4,1),0,.09,.2);chimeNote(noteP(7,1),.08,.09,.26);}}catch(e){}
}
for(const [k,v] of Object.entries({'GRAVITE REDUITE : SAUTS 2 FOIS PLUS LONGS':'LOW GRAVITY: JUMPS LAST TWICE AS LONG','TRAVERSE LE NUAGE':'PIERCE THE CLOUD','PASSE LES PORTES':'THREAD THE GATES',
  'ET SI TU COUPAIS ?':'WHAT IF YOU CUT ACROSS?','DANSE AVEC LE RELIEF':'DANCE WITH THE HILLS','LE CIEL MENT':'THE SKY IS LYING',
  'TRAVERSE L\'ORAGE':'RIDE THROUGH THE STORM','ATTRAPE LA CAISSE-NUAGE':'CATCH THE CLOUD CAR','RACCOURCI !':'SHORTCUT!','RACCOURCI':'SHORTCUT',
  'ACCROCHE !':'LOCKED ON!','ELLE EST A TOI':'SHE IS YOURS','LA CAISSE-NUAGE':'THE CLOUD CAR',"ELLE T'A SEME":'SHE LOST YOU','NUAGES TERMINES':'CLOUDS COMPLETE',
  
  'FLIC AU TAPIS !':'COP DOWN!',
  'PERCE-NUAGE !':'CLOUD PIERCER!','PERCE-NUAGE':'CLOUD PIERCER',
  'Douce comme un nuage, elle file comme un orage. Un coucher de soleil, rien que pour toi.':'Soft as a cloud, fast as a storm. A whole sunset, just for you.'}))if(!(k in I18N))I18N[k]=v;
// (2026-09-30) les mots de la passe CAMPAGNE : la plaque de la caisse-nuage, les portes du niveau 4, les promesses de l'ESPACE — en anglais
for(const [k,v] of [['SILLAGE','SLIPSTREAM'],['DERRIERE TOI','BEHIND YOU'],
  
  ['LA CAISSE-NUAGE','THE CLOUD CAR'],['PORTES','GATES'],['PORTE','GATE'],['DANS','IN'],['RADAR','SPEED CAMERA'],
  ['MOUTONS','SHEEP'],['SAUTE-MOUTON','LEAPFROG'],['DOUBLE-TAP NITRO','DOUBLE-TAP NITRO'], // (2026-10-14, gameplay) SAUTE-MOUTON, le niveau 4 des NUAGES
  
  
  
  
  ]){if(!(k in I18N))I18N[k]=v;}
window.dbgOrage=function(q){ // (2026-09-29) L'ORAGE du mode principal : l'état des éclairs · dbgOrage('eclair') en fait tomber un tout de suite
  if(q==='eclair'){if(!(LVL.cur&&(LVL.cur.id==='orage'||LVL.cur.orage)))return 'pas au niveau orage';eclFrappe();ECL.t=6;}
  return {lieu:LVL.cur&&LVL.cur.id,flash:+CAMP_FLASH.toFixed(3),brumeOuverte:Math.round(CAMP_FOG),prochain:+ECL.t.toFixed(2),pluie:+LVL.pluie.toFixed(2),brume:[Math.round(scene.fog.near),Math.round(scene.fog.far)],bancs:CLOUDS.filter(function(c){return c.onRoad||c.mesh&&c.mesh.userData.trav;}).length,nuages:CLOUDS.length};};
function jadePlayOk(){return JADE_PLAY&&!PARK.on&&!SURV.armed&&!!(SAVE.d.tuto||SAVE.d.permis);} // un tout premier joueur passe d'abord par l'auto-école
function jadeJouer(){ // (2026-10-12) lancer le SOLEIL DE JADE : la piste sous le voile (si elle n'est pas déjà là), l'atelier, le lâcher
  if(pendingScore!=null||(started&&!gameOver))return 'en course';if(ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go))return 'occupé';
  JADE_JEU=true;if(PARK.on){PARK.on=false;try{modeLbl();}catch(e){}}
  const ici=LVL.cur&&LVL.cur.id==='jade'&&!!JADE.root;
  ecranWipe(function(){runStats.zones=0;if(!started)vdepPose();if(!ici)rebuildMenuScene();if(!garageOn)openGarage(true);},function(){garageLaunch();});return JADE_NOM;} // (LA VITESSE DE DÉPART) le 1er départ de la session part du cran choisi : posé avant la piste
window.dbgNiveauJade=jadeJouer; // (le simulateur l'appelle)
window.dbgNiveauCrypto=function(m){SF.force={carte:'crypto',meteo:m||null};return classiqueJouer();};
window.dbgNiveauVitre=function(m){SF.force={carte:'vitree',meteo:m||null};return classiqueJouer();}; // (2026-10-17) LA VILLE VITRÉE tout de suite (matin, midi, soir, nuit) // (2026-10-15) CRYPTO CITY tout de suite (une météo : matin, midi, soir, nuit)
function classiqueJouer(){ // (2026-10-13, Sacha) JOUER = le MODE CLASSIQUE AU HASARD : la 1re map et sa météo tirées, la piste bâtie sous le voile (le chemin de jadeJouer)
  if(pendingScore!=null||(started&&!gameOver))return 'en course';if(ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go))return 'occupé';
  JADE_JEU=false;if(PARK.on){PARK.on=false;try{modeLbl();}catch(e){}}
  const t=SF.force?sfImpose(SF.der):(SF.prochain&&SF.prochainDer===SF.der?SF.prochain:sfTire(SF.der));SF.prochain=null;SF.tirage=[t];SF.der=t;SF.neuf=true;SF.pret=true; // neuf : le REJOUER de garageLaunch (resetGame) garde ce tirage · prochain : celui que la vignette du garage annonçait — (2026-10-19) le tirage D'AVANCE du départ (prebDepCible)
  /* (2026-10-19, LE DÉPART D'AVANCE) sous9 : au 1er JOUER de la session, la piste du départ bâtie au menu est PRISE (prebDepPrend) ; après une
     partie, sous le nuage blanc ou le voile chaud (leger : resetGame suit dans la même image), la piste de sous9 n'est jamais dessinée — elle se
     fait légère (son ciel seul) et resetGame prend la sienne, la caméra reposée comme closeGarage l'aurait fait (PREB.cam). */
  const sous9=function(leger){runStats.zones=0;if(!started)vdepPose();if(leger===true&&PREB.on&&started&&gameOver){PREB.ntLeger=true;PREB.cam=true;PREB.legers++;rebuildMenuScene();}else prebDepPrend(rebuildMenuScene);try{jadeGabarits();}catch(e){}};
  /* (2026-10-15, Sacha : « améliore l'animation du lancement ») MESURÉ (film du JOUER, accueil debout) : la caisse est DÉJÀ dans le ciel du
     menu, et le JOUER passait d'abord par le balayage pixel (≈ 0,45 s d'écran sombre) pour rebâtir la piste… puis rouvrait le MÊME ciel
     et lançait le piqué. Depuis le ciel, elle pique tout de suite : la piste tirée se bâtit sous le NUAGE BLANC de la fin du piqué
     (`CHUTE.sous`, juste avant start/resetGame — le voile tient jusqu'à la 1re image rendue). Ailleurs (atelier, boutique) : le balayage. */
  if(garageOn&&CHUTE.on&&!CHUTE.go){CHUTE.sous=function(){sous9(true);};garageLaunch();if(CHUTE.go)return t;CHUTE.sous=null;}
  /* (2026-10-15, Sacha : « une fois le bouton pressé dans le garage, il faut que tu retrouves l'animation où la voiture s'avance dans les
     flammes ») DEPUIS L'ATELIER, même principe : le balayage d'abord (écran sombre + la piste rebâtie : ≈ 0,5 s au PC, bien plus sur
     téléphone) passait AVANT le lâcher. Le LÂCHER part sur l'appui — la caisse roule dans le rideau de flammes — et la piste tirée se bâtit
     sous le VOILE CHAUD de la fin (`GAR.sous`, juste avant start/resetGame, voir garageRender). La boutique et l'accueil gardent le balayage. */
  if(garageOn&&!CHUTE.on&&!GAR.go&&GAR.root&&!GBQ.on&&!GBQ.veut&&gEl&&!gEl.classList.contains('menu')){GAR.sous=function(){sous9(true);};garageLaunch();if(GAR.go)return t;GAR.sous=null;}
  ecranWipe(function(){sous9();if(!garageOn)openGarage(true);},function(){garageLaunch();});return t;} // jadeGabarits : taillés une fois par session, sous le voile (≈ 0,7 s de moins au 1er portail vers la jade)
const NIT_GRONDE=.3; /* le grondement du nitro (4e passe, 12/10 : ,4 → ,3) — resté seul de l'ancien bloc de la musique du SOLEIL DE JADE */
window.dbgQuitte=function(){ // (2026-10-12, le simulateur) finir la course en cours SANS explosion — comme QUITTER du panneau ⏸
  if(!started||gameOver)return 'pas de course';if(TUTO.on)tutoQuitte();const sb=SANDBOX;SANDBOX=false;endGame();SANDBOX=sb;return 'fini';};
// ---- LES OUTILS DE ZONE (ex-campagne VILLE) : la place sur le ruban, la vitesse, la paie, les matières partagées, la plaque du haut ----
function vPos(){return mode==='fall'?lastNearS:s;}         // où l'on en est le long du ruban, même en vol
function vKmh(){return (mode==='fall'?volH(fallVel):Math.abs(vA)*vitMult())*3.6*SPD;} // (2026-09-30) au sol, la VRAIE vitesse d'avance (× vitMult : NITROOO, VITESSE ×2 — celle du compteur, speedKmh) : tenir NITROOO devant un radar ne changeait rien
function vPaie(k,n,src){const g=denom()*k*(fever>0?2:1)*flowMult();money+=g;levelCash+=g;livre(src||'$:ville',g);/* (2026-10-14, GAMEPLAY) src : la ligne du grand livre — LES ÉVÉNEMENTS RARES versent sous '$:evt' */try{checkUpgrade();}catch(e){}if(n)try{flyCash(carGroup.position,n);}catch(e){}frenCash(g,carGroup.position);return g;} // (×3) en frénésie, le butin de la ville se voit aussi
function vMat(m){m.dispose=function(){};return m;}          // une matière PARTAGÉE : la reconstruction ne la jette jamais
// ---- LA PLAQUE : ce qu'on LIT, en haut de l'écran (charte : le haut est pour lire, le bas pour toucher) ----
let vChipEl=null,vChipK='';
function vChip(txt,sous,col,alerte){
  if(!vChipEl){vChipEl=document.createElement('div');vChipEl.id='campChip';vChipEl.setAttribute('aria-hidden','true');vChipEl.innerHTML='<b></b><small></small>';document.body.appendChild(vChipEl);hasMaj();}
  const k=(txt||'')+'|'+(sous||'')+'|'+(col||'')+'|'+(alerte?1:0);if(k===vChipK)return;vChipK=k;
  if(!txt){vChipEl.classList.remove('on','alerte');return;}
  vChipEl.firstChild.textContent=txt;vChipEl.lastChild.textContent=sous||'';vChipEl.lastChild.style.display=sous?'':'none';
  vChipEl.style.setProperty('--cc',col||'#ffd75e');vChipEl.classList.add('on');vChipEl.classList.toggle('alerte',!!alerte);hudReveil('campChip'); /* l'objectif change : il se rallume (HUD discret) */
}
function villeApres(){ // crochet : APRÈS musicTick (qui repeint le néon de la route à chaque image depuis sa teinte de base)
  const nu=LVL.nuit; // (2026-09-30) MINUIT EN VILLE : 3 fenêtres sur 4 éteintes, les néons de la route à 40 %, des phares xénon qui portent à ~260 m
  /* (2026-10-14, passe graphismes · facades-jour) LE JOUR DES FAÇADES (CITY.uJ, lu par villeMatTours) : `uJour` seul ne dit pas le jour —
     minuit, la pluie et l'orage de la ville ont aussi jour:1 (le dégradé d'altitude). On le croise avec la ville PEINTE du ciel (`city` :
     matin .25, midi .12 · soir 1,1, pluie et orage 1,2) et avec la nuit du niveau. Fondu comme l'ambiance au portail (bioLerp). */
  CITY.uJ.value=CITY.uJf!=null?CITY.uJf:skyU.uJour.value*(1-nu)*(1-THREE.MathUtils.smoothstep(skyU.uCity.value,.45,.95));
  CITY.uC.value=1-.72*nu;
  const k=1-.6*nu;
  /* (2026-10-17, continuité) « néons pleins la nuit » : la baisse des néons de route de MINUIT EN VILLE ne touche plus les six maps de la continuité
     (elle tombait sur toutes les routes de nuit : rails roses à 44 %, nappe à 20 %) */
  if(k<.999&&!contiMap()){const kr=.07+.93*k; // on ne baisse QUE ce que musicTick repeint (userData.base) : rien ne s'accumule d'une image à l'autre
    for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.multiplyScalar(kr);}
    for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i];if(m.userData.base!=null)m.opacity*=kr*kr;}}
  if(k<.999||villeApres.ph){villeApres.ph=k<.999;headSpot.distance=72+64*(1-k)+120*nu;if(mode!=='boom')headSpot.intensity=1.85*(1+.9*(1-k)+1.6*nu);headSpot.angle=.5+.12*nu;} // 1,85 : la valeur que la boucle pose (phares de course)
  if(nu>.001||PHARE_FX.col){PHARE_FX.col=nu>.001;headSpot.color.setRGB(1-.12*nu,.85+.1*nu,.63+.37*nu);} // du jaune halogène au BLANC xénon
}
// ============ LE LINGOT — la caisse du garage ============
// Un lingot d'or monté sur roues — un tronc de pyramide (CylinderGeometry à quatre pans, tourné de 45°), facettes franches, une plaque
// POINÇONNÉE sur le dessus (999,9), une visière noire.
// (mesuré sur la planche du banc d'essai) à 0xffc33a le lingot sortait JAUNE PÂLE, presque blanc : l'or est un MÉTAL — peu de diffus, un
// spéculaire doré qui porte la couleur. Base cuivrée plus sombre, reflet or : il se lit « or » au soleil de midi comme dans la nuit.
const LINGOT_MAT=vMat(new THREE.MeshPhongMaterial({color:0xc08a1c,emissive:0x221300,specular:0xffe39a,shininess:85,flatShading:true,envMap:envTex,reflectivity:.22,combine:THREE.MixOperation}));
const LINGOT_PL=(function(){ // la plaque poinçonnée : or plus sombre, cadre, lettres pixel en creux
  const cv=document.createElement('canvas');cv.width=128;cv.height=256;const t=new THREE.CanvasTexture(cv);
  const des=function(){const x=cv.getContext('2d');x.fillStyle='#d99a1c';x.fillRect(0,0,128,256);x.strokeStyle='#8a5a06';x.lineWidth=6;x.strokeRect(8,8,112,240);
    x.fillStyle='#8a5a06';x.textAlign='center';x.textBaseline='middle';x.font='14px "Press Start 2P",monospace';
    x.fillText('CASH',64,60);x.fillText('CAR',64,84);x.font='18px "Press Start 2P",monospace';x.fillText('999',64,136);x.fillText(',9',64,162);x.font='10px "Press Start 2P",monospace';x.fillText('1 KG',64,206);t.needsUpdate=true;};
  des();try{if(document.fonts&&document.fonts.load)document.fonts.load('14px "Press Start 2P"').then(des).catch(function(){});}catch(e){}
  return vMat(new THREE.MeshPhongMaterial({map:t,specular:0xfff2c0,shininess:70,emissive:0x2a1a00}));
})();
function lingotGeo(){const g=new THREE.CylinderGeometry(.74,1,1,4,1);g.rotateY(Math.PI/4);g.scale(1.414,.95,2.97);g.translate(0,.475,0);return g;} // base 2 × 4,2 m, dessus 1,5 × 3,1 m, 95 cm de haut
SHAPES.lingot=function(K){ // la caisse du garage — buildCar pose les roues, les feux et les pots aux ancrages rendus
  const b=new THREE.Mesh(lingotGeo(),LINGOT_MAT);b.position.y=.5;K.add(b);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.4),LINGOT_PL);p.rotation.x=-Math.PI/2;p.position.set(0,1.452,-.2);K.add(p);
  K.box(1.2,.16,.5,K.glass,0,1.53,.95);                                        // la visière
  K.box(1.9,.2,3.9,K.dark,0,.42,0);                                            // le châssis
  K.box(1.76,.12,.16,K.chrome,0,.5,2.12);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un trapèze
     jaune nu, deux pavés rouges et une barre chromée, sur la 2e caisse la plus chère. Désormais, posés SUR la face penchée du lingot :
     · LES RUBIS TAILLÉS : deux feux en pierre taillée — la table, huit facettes en trois rouges (le haut attrape la lumière), un chaton
       d'or sombre ; une petite pièce `L` cachée sous la table donne leur place aux traînées de lumière (CAR_FEUX) ;
     · LE POINÇON : « 999,9 » frappé au milieu de la face, dans un cartouche d'or sombre — la même toile que le dessus (LINGOT_PL, la
       région du titre) : aucune matière neuve ;
     · LE BOUCLIER doré chanfreiné et sa rainure ; LE DIFFUSEUR sombre à ailettes d'or où s'encastrent les deux pots (ECH_POTS.lingot,
       inchangés). Les feux-boîtes communs (`tl`) passent DANS la caisse, invisibles : les rubis les remplacent. L'avant est intact. */
  {const al=Math.atan2(.546,.95),ca=Math.cos(al),sa=Math.sin(al),                   // la face arrière penche de 30° (1,554 m en haut, 2,10 m en bas)
        F=(u,v,n)=>[u,.5+v*ca+n*sa,-2.1+v*sa-n*ca],                                 // un point de la face : u en travers, v en montant la pente, n en dehors
        P=K.kit({o:{g:'o',c:0xd9a520},O:{g:'o',c:0x8a5a06},k:{g:'m',c:0x141418},K:{g:'g',c:0x0b0c0f},
          L:{g:'l',c:0xff1a2a},Q:{g:'l',c:0xc8101e},r:{g:'l',c:0x7e0a14},R:{g:'l',c:0xff7a84}});
   const T=(k,a,b,c)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2]; // une facette, tournée vers le dehors
     if((uz*vx-ux*vz)*sa-(ux*vy-uy*vx)*ca<0)P.tri(k,a,c,b);else P.tri(k,a,b,c);};
   const quad=(k,u0,v0,u1,v1,n)=>{const a=F(u0,v0,n),b=F(u1,v0,n),c=F(u1,v1,n),d=F(u0,v1,n);T(k,a,b,c);T(k,a,c,d);};
   const oct=(cu,cv,w,h,s,n)=>{const o=[],r=1/Math.cos(Math.PI/8);for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;o.push([cu+Math.cos(a)*w/2*r*s,cv+Math.sin(a)*h/2*r*s,n,Math.sin(a)]);}return o;};
   P.sym(sd=>{const cu=sd*.60,cv=.29,w=.30,h=.16;
     const ch=oct(cu,cv,w,h,1.28,.003);for(let i=0;i<8;i++)T('O',F(cu,cv,.003),F(...ch[i]),F(...ch[(i+1)%8]));      // le chaton d'or sombre
     const b=oct(cu,cv,w,h,1,.006),t=oct(cu,cv,w,h,.56,.042);
     for(let i=0;i<8;i++){const j=(i+1)%8,m=(b[i][3]+b[j][3])/2;const k=m>.3?'R':m<-.3?'r':'Q';               // les facettes : le haut clair, le bas sombre
       T(k,F(...b[i]),F(...b[j]),F(...t[j]));T(k,F(...b[i]),F(...t[j]),F(...t[i]));
       T('L',F(cu,cv,.042),F(...t[i]),F(...t[j]));}                                                         // la table
     const q=F(cu,cv,.02);P.box('L',.04,.02,.01,q[0],q[1],q[2]);                                            // (le repère des traînées, sous la table)
   });
   /* le cartouche du poinçon : un cadre d'or sombre, et le titre en relief (la toile du dessus) */
   for(const [u0,v0,u1,v1] of [[-.36,.42,.36,.46],[-.36,.86,.36,.90],[-.36,.46,-.32,.86],[.32,.46,.36,.86]])quad('O',u0,v0,u1,v1,.004);
   {const g=new THREE.PlaneGeometry(.60,.38),uv=g.attributes.uv;                  // la région « 999 / ,9 » de LINGOT_PL (x 8-120, y 112-184 sur 128 × 256)
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)>.5?.9375:.0625,uv.getY(i)>.5?.5625:.28125);
    const m=new THREE.Mesh(g,LINGOT_PL),q=F(0,.66,.005);m.position.set(q[0],q[1],q[2]);m.rotation.set(al,Math.PI,0);K.add(m);}
   /* le bouclier chanfreiné, sa rainure, le diffuseur et ses ailettes */
   P.prism('o',[[-1.98,.34],[-2.18,.34],[-2.24,.40],[-2.24,.55],[-2.18,.61],[-2.04,.61]],1.84,0);
   P.box('K',1.80,.014,.012,0,.53,-2.243);
   P.box('k',1.40,.12,.02,0,.42,-2.248);
   for(const x of [-.66,-.26,-.13,0,.13,.26,.66])P.box('O',.014,.12,.03,x,.42,-2.262);
   K.commit(P);}
  return {hl:[.62,.66,2.16],tl:[.62,.62,-1.90],wr:.95,wx:1.0,wz:1.36,split:0,skirt:0,sp:0,doors:0,slats:0,wings:'none',glowX:1.02,glowY:.5,glowL:3.2,glowF:0}; // tl : DANS la caisse (les rubis font les feux)
};
function meuteTick(){ // la PLAQUE du Survivant au téléphone (2026-09-30) : ton rang, la minute — rouge et clignotante quand tu es dernier
  if(!SURV.on){vChip('');return;}
  const pT=survPTot();let rk=1,vv=0;for(const b of SURV.bots)if(b.alive){vv++;if(b.totD>pT)rk++;}
  const clk='0:'+String(Math.max(0,Math.min(59,Math.ceil(60-SURV.t)))).padStart(2,'0'); /* (24/10, relecture) jamais « 0:60 » la première seconde de chaque minute (même borne que kit-lumiere) */
  if(SURV.over)vChip(TR(vv?'SURVIVANT':'CHAMPION !'),'','#ffd75e');
  else if(vv&&SURV.last)vChip(TR('DERNIER !'),TR('EXPLOSION DANS')+' '+clk,'#ff5e7a',true); // (2026-09-30) SURV.last, le verdict du couperet (rendu au sol) : la plaque et le bip disent la même chose
  else vChip(TR('RANG')+' '+rk+' / '+(vv+1),TR('COUPERET DANS')+' '+clk,rk===1?'#ffd75e':'#9fe8ff');
}
for(const [k,v] of Object.entries({'FAIS-TOI FLASHER':'GET FLASHED','LIS LES FLAQUES':'READ THE PUDDLES',
  'NE FINIS PAS DERNIER':"DON'T FINISH LAST",'ESQUIVE LA FOUDRE':'DODGE THE LIGHTNING','ROULE DANS LE NOIR':'DRIVE IN THE DARK','VIDE LE FOURGON':'EMPTY THE CASH TRUCK',
  "SAUTE D'UN ETAGE":'DROP A FLOOR','BATS LE BANQUIER':'BEAT THE BANKER',
  'RADAR':'SPEED CAMERA','DANS':'IN',
  'LIGNE':'LINE','LIGNE PARFAITE':'PERFECT LINE','PARFAITE !':'PERFECT!','CASSEE':'BROKEN',
  'A SEC':'BONE DRY','FLAQUES':'PUDDLES',
  'RANG':'RANK','DERNIER !':'LAST!','EXPLOSION DANS':'BLAST IN','COUPERET DANS':'ELIMINATION IN','SURVIVANT':'SURVIVOR','CHAMPION !':'CHAMPION!','LA MEUTE EST AU TAPIS':'THE WHOLE PACK IS DOWN',
  'ESQUIVE':'DODGE',
  
  
  'FOURGON':'CASH TRUCK','BANQUIER':'BANKER',
  'DEVANT':'AHEAD','BRAQUAGE':'HEIST',
  'BOUCHON':'TRAFFIC JAM',
  '1ER':'1ST','2E':'2ND','TU MENES !':'YOU LEAD!',
  
  'LE LINGOT':'THE GOLD BAR',
  'Il dormait au fond du coffre-fort. Tu viens de le sortir : 999,9 millièmes de pure arrogance.':'It slept at the back of the vault. You just took it out: 999.9 fine, and pure arrogance.'}))if(!(k in I18N))I18N[k]=v;
