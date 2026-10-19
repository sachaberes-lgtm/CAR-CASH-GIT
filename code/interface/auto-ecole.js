/* ============================================================================
   L'AUTO-ÉCOLE — LA PREMIÈRE PARTIE GUIDÉE (2026-09-25)
   ----------------------------------------------------------------------------
   Cinq gestes, dans l'ordre où le jeu les exige : TOURNER, NITRO, DÉCOLLER (sortir par le bord), VOLER au
   nitro en guidant au pouce (la poussée de réacteur façon Rocket League, déjà dans la physique), SE POSER.
   ⚠ LES RÈGLES D'UN BON TUTORIEL, appliquées ici :
     · on apprend EN JOUANT — pas d'écran de texte avant la partie, une carte courte qui ne cache pas la route ;
     · une étape se valide par le GESTE lui-même, jamais par un bouton « OK » ;
     · chaque réussite se FÊTE (coche, son, vibration, gerbe de pixels) — c'est ce qui rend l'apprentissage fun ;
     · on ne peut PAS mourir : un raté remet la caisse sur la route (même chemin que le BAC À SABLE) ;
     · on peut toujours PASSER ; on peut le revoir depuis les réglages.
   Piste : `genTuto()` (dessinée à la main : larges virages, une descente, un looping), ciel nu de l'aurore.
   ========================================================================== */
const TUTO={on:false,i:0,t:0,l:0,r:0,hold:0,air:0,vole:false,fini:0,attente:false};
/* (2026-10-14, Sacha : « le tutoriel est un peu intimidant, pas très beau — plus d'animation, plus clair ; et un truc pour apprendre les
   figures ») L'AUTO-ÉCOLE v2 — SIX gestes (la FIGURE au double-tap NITRO arrive en dernier, une fois posé), un mot par étape au lieu d'une
   phrase, la phrase raccourcie (`d` au doigt, `dk` au clavier : « pouce » ne veut rien dire à qui joue au clavier), un PETIT FILM du geste
   (`film`, voir <style id="ecoleV2">), une MAIN FANTÔME qui fait le geste sur la commande (`main` : 'glisse' le volant · 'pousse' vers le
   bord · 'appui' tenu sur NITRO · 'double' deux tapes), et l'éloge de la réussite (`bravo`). Les *mots* entre étoiles sont surlignés. */
const TUTO_ETAPES=[
  {ico:'volant',t:'TOURNE',  d:'Glisse ton *pouce* à gauche, puis à droite',      dk:'Flèches [←] puis [→]',                      geste:'glisse', film:'glisse', main:'glisse', bravo:'BIEN !'},
  {ico:'eclair',t:'NITRO',   d:'Garde le doigt sur *NITRO*',                       dk:'Maintiens [ESPACE]',                        geste:'nitro',  film:'nitro',  main:'appui',  bravo:'PARFAIT !'},
  {ico:'rampe', t:'DÉCOLLE', d:'Sors de la route *par le bord* !',                 dk:'Sors de la route *par le bord* !',          geste:'bord',   film:'bord',   main:'pousse', bravo:'ÇA DÉCOLLE !'},
  {ico:'eclair',t:'VOLE',    d:'En l\'air : garde *NITRO* et reviens sur la route', dk:'En l\'air : [ESPACE] et reviens sur la route', geste:'nitro', film:'vole', main:'appui', bravo:'TU VOLES !'},
  {ico:'cible', t:'POSE-TOI',d:'Vise *l\'anneau* sur la route. Doré = parfait !',   dk:'Vise *l\'anneau* sur la route. Doré = parfait !', geste:'pose', film:'pose', main:'',  bravo:'POSÉ !'},
  {ico:'rotation',t:'FIGURE',get d(){return figGlisseOn()?'Pose le pouce sur *NITRO*, glisse, lâche':'Tape *2 fois* vite sur *NITRO*';}, dk:'Tape *2 fois* vite sur [ESPACE]', geste:'figure', film:'figure', get main(){return figGlisseOn()?'glisseN':'double';}, bravo:'STYLÉ !'} // (2026-10-15) FIGURES › GLISSER : la consigne et la main suivent le réglage
];
const TUTO_ACCUEIL={t:'AUTO-ÉCOLE',d:'6 gestes. Ici, *impossible de perdre* !',film:'accueil'}; // la 1re carte : on rassure avant d'exiger
const TUTO_FILMS={ // les acteurs de chaque petit film (leur mouvement est dans le CSS)
  glisse:'<i class="route nm"></i><i class="axe nm"></i><i class="car"></i><i class="main"></i>',
  nitro:'<i class="sol nm"></i><i class="tirets nm"></i><i class="vit v1 nm"></i><i class="vit v2 nm"></i><i class="flam"></i><i class="car"></i><i class="btn nm"></i><i class="main"></i>',
  bord:'<i class="sol nm"></i><i class="car"></i><i class="fleche"></i>',
  vole:'<i class="route nm"></i><i class="flam"></i><i class="car"></i><i class="btn nm"></i><i class="main"></i>',
  pose:'<i class="sol nm"></i><i class="cible"></i><i class="car"></i>',
  figure:'<i class="sol nm"></i><i class="tirets nm"></i><i class="car"></i><i class="btn nm"></i><i class="main"></i><i class="x2 nm">×2</i>',
  accueil:'<i class="sol nm"></i><i class="tirets nm"></i><i class="car"></i><i class="coeur"></i>'};
function tutoTouche(){return document.body.classList.contains('touch');} // au doigt (téléphone, la colonne de l'ordi) ou au clavier
function tutoMarque(s){ // « *mot* » → surligné, « [touche] » → une touche ; le reste est échappé
  return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];})
    .replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]/g,'<kbd>$1</kbd>');}
function tutoMot(el,mot){ // le mot arrive lettre par lettre (--i : le retard de chaque lettre)
  mot=String(mot);el.style.setProperty('--n',Math.max(6,mot.length));
  el.innerHTML=mot.split('').map(function(ch,i){return '<span class="l" style="--i:'+i+'">'+(ch===' '?'&nbsp;':ch.replace(/[&<>]/g,''))+'</span>';}).join('');
  el.setAttribute('aria-label',mot);}
function tutoCarte(){
  let c=document.getElementById('coach');
  if(!c){c=document.createElement('div');c.id='coach';c.className='v2';c.setAttribute('role','status');c.setAttribute('aria-live','polite');
    c.innerHTML='<div class="ecScene"></div><div class="ecH"><span class="ecPips"></span><span class="coN"></span></div>'
      +'<b class="ecT"></b><span class="ecD"></span><button class="coSkip" type="button"></button>';
    document.body.appendChild(c);
    c.querySelector('.coSkip').addEventListener('click',function(e){e.stopPropagation();tutoPasse(this);});}
  if(!document.getElementById('ecMain')){const m=document.createElement('div');m.id='ecMain';m.setAttribute('aria-hidden','true');
    m.innerHTML='<div class="p"><i class="o"></i><i class="m"></i></div><i class="r"></i><i class="fg"></i><i class="fd"></i><b class="x2">×2</b>';document.body.appendChild(m);}
  return c;
}
/* LA MAIN FANTÔME : posée sur la commande du geste (le volant : le centre de son cercle ; NITRO : le bouton), le bout du doigt pile dessus.
   Seulement au doigt (au clavier il n'y a rien à montrer à l'écran : la ligne dit les touches), et seulement si la commande est visible. */
function tutoMain(){
  const m=document.getElementById('ecMain');if(!m)return;
  const c=document.getElementById('coach'),E=TUTO_ETAPES[TUTO.i];
  let mode=(TUTO.on&&c&&c.classList.contains('on')&&!c.classList.contains('bravo')&&!c.classList.contains('intro')&&!paused&&tutoTouche()&&E)?E.main:'';
  const vol=mode==='glisse'||mode==='pousse';
  if(vol&&typeof TCTL!=='undefined'&&TCTL.act)mode='';if(mode==='appui'&&nitroOn)mode=''; // le joueur FAIT déjà le geste : la main s'efface
  let cx=0,cy=0,ok=false;
  if(mode&&vol){ // le volant : sous le doigt, le stick ; au repos, le cercle en pointillés (le ::after de la zone)
    const st=document.getElementById('tStick'),sv=document.getElementById('tSteer');
    if(st&&+getComputedStyle(st).opacity>.05){const r=st.getBoundingClientRect();if(r.width>4){cx=r.left+r.width/2;cy=r.top+r.height/2;ok=true;}}
    if(!ok&&sv){const r=sv.getBoundingClientRect(),a=getComputedStyle(sv,'::after'),w=parseFloat(a.width),h=parseFloat(a.height),l=parseFloat(a.left),tp=parseFloat(a.top);
      if(r.width>4&&a.content!=='none'&&isFinite(w)&&isFinite(l)&&isFinite(tp)){cx=r.left+l+w/2;cy=r.top+tp+h/2;ok=true;}else if(r.width>4){cx=r.left+r.width*.4;cy=r.top+r.height*.72;ok=true;}}}
  else if(mode){const n=document.getElementById('tNitro'),r=n&&n.getBoundingClientRect();if(r&&r.width>4){cx=r.left+r.width/2;cy=r.top+r.height/2;ok=true;}}
  if(!ok)mode='';
  if(!mode){m.classList.remove('on');return;}
  m.style.transform='translate('+Math.round(cx-23)+'px,'+Math.round(cy-5)+'px)';
  if(m.dataset.mode!==mode){m.dataset.mode=mode;m.className='';void m.offsetWidth;}
  m.classList.add('on',mode);
}
/* (2026-09-29, audit des 10 premières minutes) PASSER COÛTAIT LE PERMIS EN UN TAP, SANS LE DIRE : 500 $, le tiers d'une 1re caisse. Le 1er
   appui DEMANDE — le bouton devient « VRAIMENT ? » en rouge, l'en-tête dit ce qu'on laisse (« PERMIS +$ 500 ») — le 2e, dans les
   3 s, passe. Pas de fenêtre par-dessus la course : pendant la leçon la caisse roule, la question reste dans la carte, sous le pouce.
   Permis déjà payé (REVOIR L'AUTO-ÉCOLE) : rien à perdre, un seul appui comme avant. */
function tutoPasse(b){
  const c=document.getElementById('coach');if(!c||!TUTO.on)return;
  if(SAVE.d.permis||b.classList.contains('sur')){clearTimeout(tutoPasse._t);uiClic('retour');tutoFin(true);return;}
  uiClic('danger');hap(8);
  b.classList.add('sur');b.textContent=TR('VRAIMENT ?').replace(' ',' ');
  clearTimeout(tutoAffiche._t);c.classList.remove('rate');c.classList.add('passe');
  c.querySelector('.coN').textContent=TR('PERMIS')+' +'+fmtC(500);
  clearTimeout(tutoPasse._t);tutoPasse._t=setTimeout(function(){tutoPasseRange(c);},3000);
}
function tutoPasseRange(c){ // la question retombe : PASSER revient, l'en-tête se vide
  clearTimeout(tutoPasse._t);if(!c)return;const b=c.querySelector('.coSkip');
  if(b){b.classList.remove('sur');b.textContent=TR('PASSER');}
  if(c.classList.contains('passe')){c.classList.remove('passe');c.querySelector('.coN').textContent='';}
}
function tutoPips(c,vient){ // les six pastilles : faites (vert), celle en cours (or qui bat), à venir ; `vient` = celle qui vient de se remplir
  c.querySelector('.ecPips').innerHTML=TUTO_ETAPES.map(function(x,j){return '<i class="'+(j<TUTO.i?'ok':j===TUTO.i?'on':'')+(j===vient?' vient':'')+'"></i>';}).join('');}
function tutoAffiche(msg){ // msg (facultatif) : le raté s'écrit dans l'en-tête de la carte, en rouge, et la carte tremble
  msg=typeof msg==='string'?msg:'';
  const c=tutoCarte();tutoPasseRange(c);
  /* L'ACCUEIL (v2) : la toute 1re carte rassure — « 6 gestes, impossible de perdre » — 2,4 s, puis la 1re consigne (pendant ce temps la leçon
     n'exige rien : tutoTick attend que la carte ne soit plus `intro`) */
  const intro=TUTO.i===0&&!TUTO.accueilVu&&!msg;if(intro)TUTO.accueilVu=1;
  const E=intro?TUTO_ACCUEIL:TUTO_ETAPES[TUTO.i];if(!E)return; // (leçon finie : la caisse attend de se poser — plus de consigne à montrer)
  const montre=function(){
    c.classList.remove('bravo','sort','rate','intro');if(intro)c.classList.add('intro');
    c.querySelector('.coN').textContent=msg?TR(msg):'';
    c.querySelector('.coSkip').textContent=TR('PASSER');
    tutoMot(c.querySelector('.ecT'),TR(E.t));
    const dd=c.querySelector('.ecD');dd.innerHTML=tutoMarque(TR(tutoTouche()||!E.dk?E.d:E.dk));dd.style.animation='none';void dd.offsetWidth;dd.style.animation='';
    c.querySelector('.ecScene').className='ecScene f-'+E.film;c.querySelector('.ecScene').innerHTML=TUTO_FILMS[E.film]+'<i class="ok"></i>';
    tutoPips(c,-1);
    if(msg){void c.offsetWidth;c.classList.add('rate');clearTimeout(tutoAffiche._t);
      tutoAffiche._t=setTimeout(function(){if(TUTO.on&&c.classList.contains('rate')){c.querySelector('.coN').textContent='';c.classList.remove('rate');}},2600);} // le raté se DIT, puis l'en-tête se vide (2026-09-29 : pas trente secondes de reproche)
    c.classList.add('on');document.body.classList.add('coOn');
    document.body.classList.toggle('coNitro',!intro&&(E.geste==='nitro'||E.geste==='figure')); // le bouton NITRO s'entoure d'un anneau qui bat
    if(!intro&&E.geste==='figure')TUTO.p0=tutoPayees(); // (v2) le compteur des figures PLANTÉES à l'entrée de l'étape (FIGURES v2 de GAMEPLAY)
    if(!intro&&(E.geste==='nitro'||E.geste==='figure')){nitroR=Math.max(nitroR,(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2);nitroGain(.01,'ecole');} // le PLEIN, offert : on apprend sans compter
    tutoMain();
    try{sfx(msg?'tuto.rate':'tuto.info');}catch(e){} // la carte de consigne sonne son « ding » ; un raté, ses deux notes qui descendent
    if(intro)setTimeout(function(){if(TUTO.on&&started&&!gameOver&&c.classList.contains('intro'))tutoAffiche();},2400);
  };
  // la carte d'avant s'efface d'abord (un raté reste en place : il tremble)
  if(c.classList.contains('on')&&!msg&&!REDUCED_MOTION){c.classList.add('sort');c.classList.remove('on');setTimeout(function(){if(TUTO.on)montre();},170);}else montre();
}
function tutoArme(){ // à appeler AVANT le lancement : la piste d'apprentissage doit être construite pour la 1re zone
  if(SAVE.d.tuto||SANDBOX||PARK.on||TUTO.on||(started&&!gameOver))return;
  TUTO.on=true;runStats.zones=0;rebuildMenuScene();tutoDebut();
}
function tutoDebut(){
  TUTO.on=true;TUTO.i=0;TUTO.t=0;TUTO.l=TUTO.r=0;TUTO.hold=TUTO.air=0;TUTO.vole=false;
  TUTO.touche=0; // (2026-10-14) le premier geste du joueur n'a pas encore eu lieu : aucun message d'échec (tutoTick)
  TUTO.rates=0;TUTO.quitte=0;TUTO.pa=0; // (2026-09-28) les ratés de POSE-TOI (repêchage au 2e), la leçon QUITTÉE (écran de mort), l'airtime PRÊTÉ par la leçon
  TUTO.fig=0;TUTO.sauts=0;TUTO.accueilVu=0; // (v2) la FIGURE finie, les sauts tentés à l'étape FIGURE, la carte d'accueil
  TUTO.attente=true; // (2026-09-25) la 1re consigne attend la FIN du logo de départ (fireLaunchBoost) — elle tombait pendant la sortie du garage, impossible à exécuter
  /* (2026-09-28) RECOMMENCER pendant la leçon : TUTO.i repartait à 0 mais la carte gardait l'ANCIENNE étape à l'écran ~2 s (jusqu'à la fin
     du logo de départ). On la range tout de suite, l'anneau du bouton NITRO avec ; tutoAffiche la ressort sur la 1re consigne. */
  const c=document.getElementById('coach');if(c)c.classList.remove('on','sort','bravo','rate','intro');
  document.body.classList.remove('coNitro');tutoMain();
}
function tutoBravo(){ // la réussite d'une étape : le mot devient l'éloge, coche, son, vibration, gerbe — puis la suivante
  const c=tutoCarte(),E=TUTO_ETAPES[TUTO.i];clearTimeout(tutoAffiche._t);c.classList.remove('rate','passe','intro');c.querySelector('.coN').textContent='';
  c.classList.add('bravo');tutoMot(c.querySelector('.ecT'),TR(E.bravo));
  try{if(SONV2)sfx('tuto.bravo');else{chimeNote(1046,0,.10,.16);chimeNote(1568,.09,.14,.16);}}catch(e){} /* (console de son) la quinte, DANS la gamme */hap([10,40,20]);
  pixBurst(c.querySelector('.ecScene')||c,14);
  TUTO.i++;TUTO.t=0;tutoPips(c,TUTO.i-1);document.body.classList.remove('coNitro');tutoMain();
  /* (v2) LA DERNIÈRE ÉTAPE se finit LES ROUES SUR LA ROUTE : une FIGURE faite en l'air (hors de la route) terminait la leçon en plein vol — le
     vol redevenait mortel et le joueur explosait juste après « PERMIS OBTENU » (vu au banc). On attend la pose, le vol reste infini ; au bout de
     8 s la caisse est replacée. */
  if(TUTO.i>=TUTO_ETAPES.length){const fin=function(n){if(!(TUTO.on&&started&&!gameOver))return;
      if(mode==='drive'){tutoFin(false);return;}
      if(mode==='fall'){pwrAirT=Math.max(pwrAirT,2);TUTO.pa=1;}
      if(n>40){sandRevive();setTimeout(function(){if(TUTO.on&&started&&!gameOver)tutoFin(false);},300);return;}
      setTimeout(function(){fin(n+1);},200);};
    setTimeout(function(){fin(0);},900);return;}
  setTimeout(function(){if(TUTO.on&&started&&!gameOver)tutoAffiche();},1050); /* (débogage son 2026-09-29) QUITTER dans l'intervalle : ni carte ni son sur l'écran de fin */
}
function tutoFin(passe){
  TUTO.on=false;document.body.classList.remove('coNitro','coOn');
  const c=document.getElementById('coach');if(c)c.classList.remove('on','sort','bravo','rate','intro');tutoMain();
  /* (2026-09-28) L'AIRTIME PRÊTÉ PAR LA LEÇON s'arrête avec elle, sans bruit : il lui restait jusqu'à 7 s, qui ressortaient après le permis
     en plaque « AIR MAX » puis en son de fin de pouvoir — un pouvoir jamais ramassé. En l'air, la jauge repart neuve (comme à l'expiration). */
  if(TUTO.pa){TUTO.pa=0;if(pwrAirT>0){pwrAirT=0;if(mode==='fall'){fallT=0;fallTR=0;airFlash=.6;}}}
  SAVE.d.tuto=1;
  if(!passe){const paye=!SAVE.d.permis; // (2026-09-28) la prime du permis ne se verse qu'UNE fois : REVOIR L'AUTO-ÉCOLE ne doit pas devenir un robinet à 500
    if(paye){SAVE.d.permis=1;SAVE.d.bank=Math.min(1e30,bank()+500);gagneAjoute(500);bankMaxMaj();}
    /* (2026-09-29, audit des 10 premières minutes) LE PERMIS SE FÊTE : la grande annonce du centre (tenue 1,6 s, les cartes retenues pendant
       la leçon attendent derrière), puis — à la 1re fois — ce qui vient de changer : fini l'entraînement où l'on ne pouvait pas mourir. */
    hautPasse(function(){slamMontre('PERMIS OBTENU !',paye?'+'+fmtC(500):'','#62e062','#ffd75e',40,22);},1900,'slam',3,{min:1600});
    if(paye)hautPasse(function(){misBanMontre('ASTUCE',TR("Fini l'entraînement : UNE SEULE VIE. En l'air, pose-toi avant la fin du chrono."),'','drapeau');},2800,'mis',3);
    try{if(SONV2)sfx('ui.debloque');else fanfare();}catch(e){}hap([20,60,20,60,60]);}
  SAVE.flush();
  hautArme(); // les cartes retenues pendant la leçon passent maintenant, l'une après l'autre (le permis d'abord)
}
/* (2026-09-28) QUITTER N'EST PAS PASSER. Les deux passaient par tutoFin(true), qui écrit SAVE.d.tuto=1 : quitter la partie au milieu de
   la leçon la marquait faite POUR TOUJOURS. Ici on range la leçon pareil, mais elle sera reproposée au prochain JOUER — PASSER (le bouton
   de la carte) reste le seul abandon définitif. Le drapeau `quitte` dit à l'écran de mort que ce n'est pas une partie (pas de record). */
window.dbgTuto=function(k){if(k==='permis'&&TUTO.on)tutoFin(false);if(k==='etape'&&TUTO.on){TUTO.accueilVu=1;tutoAffiche();}if(typeof k==='number'&&TUTO.on){TUTO.i=Math.max(0,Math.min(TUTO_ETAPES.length-1,k|0));TUTO.accueilVu=1;TUTO.t=0;TUTO.sauts=0;tutoAffiche();} /* dbgTuto(n) : aller à l'étape n */ // banc : l'état de la leçon ; dbgTuto('permis') la termine comme une réussite
  return {on:TUTO.on,i:TUTO.i,tuto:SAVE.d.tuto,permis:SAVE.d.permis,bank:bank(),fig:TUTO.fig,sauts:TUTO.sauts};};
function tutoQuitte(){tutoFin(true);SAVE.d.tuto=0;TUTO.quitte=1;SAVE.flush();}
function tutoPayees(){try{return (typeof FX2!=='undefined'&&FX2&&FX2.payees)|0;}catch(e){return 0;}} // FIGURES v2 (GAMEPLAY) : +1 par figure PLANTÉE
function tutoFigOuverte(){return TUTO.on&&TUTO_ETAPES[TUTO.i]&&TUTO_ETAPES[TUTO.i].geste==='figure';} // (v2) le double-tap des figures, fermé pendant la leçon… sauf à SON étape
function tutoTick(dt){
  if(!TUTO.on||!started||gameOver||paused)return;
  const c=document.getElementById('coach');if(!c||!c.classList.contains('on')||c.classList.contains('bravo'))return;
  TUTO.t+=dt;
  TUTO.mT=(TUTO.mT||0)+dt;if(TUTO.mT>.25){TUTO.mT=0;tutoMain();} // la main suit sa commande (rotation, clavier qui sort, réglage COMMANDES)
  /* (2026-09-26, audit UX : 3 essais sur 3, la caisse sortait de la route juste après TOURNE, et l'étape NITRO ne se validait
     pas en l'air → 6 s de vol, explosion, « RATÉ »). Aux deux premières étapes, une sortie de route (plus d'une demi-seconde
     en l'air : une bosse ne compte pas) remet la caisse sur la piste tout de suite, en DISANT pourquoi. Zéro aide en vraie course. */
  /* (2026-10-14, ticket « auto-école, première image ») JAMAIS UN REPROCHE AVANT LE PREMIER GESTE : la leçon démarre vite, la caisse peut quitter la
     route avant que le pouce ait touché l'écran — « SORTI ! SUIS LA ROUTE » en rouge était alors la toute première chose qu'un nouveau voyait. TUTO.touche
     = le joueur a déjà braqué ou pris la nitro ; la caisse est replacée pareil, mais le message n'est dit qu'à qui a bougé, et pas dans les 3 premières
     secondes d'une étape (sinon la consigne reste neutre). Affichage seul : la physique, la vitesse et le replacement ne changent pas. */
  if(Math.abs(steer)>.05||nitroOn)TUTO.touche=1;
  if(TUTO.i<2&&mode==='fall'){TUTO.chute=(TUTO.chute||0)+dt;if(TUTO.chute>.5){TUTO.chute=0;sandRevive();if(TUTO.touche&&TUTO.t>3)tutoAffiche('SORTI ! SUIS LA ROUTE');return;}}else TUTO.chute=0; /* (2026-09-28) « ton pouce ramène la caisse » ne disait pas QUEL geste */
  if(c.classList.contains('intro'))return; // (v2) l'accueil n'exige rien
  switch(TUTO.i){
    case 0: if(steer<-.25)TUTO.l=1;if(steer>.25)TUTO.r=1;if(TUTO.l&&TUTO.r)tutoBravo();break; // .45 exigeait la moitié du braquage : on sortait de la route en le cherchant
    case 1: if(nitroOn)TUTO.hold+=dt;if(TUTO.hold>1.1)tutoBravo();break; // la nitro tenue compte aussi en l'air (une crête ne remet plus le compteur à zéro)
    case 2: if(mode==='fall'){pwrAirT=Math.max(pwrAirT,9);TUTO.pa=1;tutoBravo();}break; // en vol : l'airtime devient infini le temps d'apprendre (TUTO.pa : prêté par la leçon, pas un pouvoir ramassé)
    case 3: if(mode==='fall'&&nitroOn)TUTO.air+=dt;
            if(TUTO.air>.9){TUTO.vole=true;tutoBravo();}
            else if(mode==='drive'&&TUTO.t>1){TUTO.i=2;TUTO.air=0;tutoAffiche('ENCORE ! NITRO EN L\'AIR');}
            break;
    case 4: if(mode==='drive')tutoBravo();
            else if(mode==='fall'){pwrAirT=Math.max(pwrAirT,2);TUTO.pa=1;
              /* (2026-09-28, passe de lancement) LE DÉBUTANT QUI NE RETROUVE PLUS LA ROUTE : au bout de 9 s de vol on la replace, on reprend à
                 DÉCOLLE et on dit comment réussir ; au 2e raté la pose est ACCORDÉE (il a décollé et volé deux fois : elle s'apprendra en jouant). */
              if(TUTO.t>9){sandRevive();TUTO.rates=(TUTO.rates|0)+1;
                if(TUTO.rates>=2)tutoBravo();
                else{TUTO.i=2;TUTO.air=0;TUTO.t=0;tutoAffiche('RATÉ ! NITRO, VISE LE DESSUS');}}}
            break;
    /* (v2) LA FIGURE : le double-tap NITRO — au sol la caisse fait sa figure SUR LA ROUTE (2026-10-17 : avant, elle sautait), en l'air elle part tout de suite. Réussie = une figure
       plantée. Trois sauts sans figure plantée (posée en plein tour) : elle est accordée, la caisse sur ses roues. */
    case 5: if(tutoPayees()>(TUTO.p0|0))tutoBravo(); // une figure plantée (v2)
            else if(TUTO.sauts>=3&&mode==='drive')tutoBravo();
            else if(mode==='fall'&&TUTO.t>12){sandRevive();TUTO.t=0;tutoAffiche(figGlisseOn()?'GLISSE DEPUIS NITRO, LACHE':'TAPE 2 FOIS VITE SUR NITRO');}
            break;
  }
}
// LA GERBE DE PIXELS : une poignée de carrés qui jaillissent d'un élément (réussite, achat, clic important)
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LES CONFETTIS PARLENT LA COULEUR DE L'ÉVÉNEMENT : une palette unique pastel (#fff3ad, vert
   menthe, bleu layette) disait la même chose partout. La gerbe lit désormais d'où elle part : l'annonce qui éclate prend SES deux
   couleurs (`--s1/--s2` de #slam9), l'AURA jaillit MAGENTA, la bande du FLOW prend la couleur de son palier (la FRÉNÉSIE : magenta), un
   RECORD (carte moteur) est OR + blanc, l'auto-école est VERTE (validation) ; tout le reste (JOUER, achats) est l'OR de l'argent.
   Carrés de 6 px posés sur une grille de 2 px, 12 au plus : une gerbe, pas une nuée. */
const PIX_OR=['#ffd75e','#ffffff','#ffd75e','#b8860b'],PIX_MAG=['#ff3ec8','#ffffff','#ff7ad5','#ff3ec8'],PIX_VERT=['#62e062','#ffffff','#62e062','#ffd75e'];
const PIX_FREN=['#ff2a3d','#ffffff','#ffb000','#ff2a3d'];
function pixCouleurs(el){
  if(!el.closest)return PIX_OR; // (2026-10-14) un point d'écran (la gerbe de l'impact moteur AU CAPOT, engImpact) n'est pas un élément : el.closest levait une erreur avalée, la gerbe ne partait JAMAIS — elle part en or, comme l'éclair de l'impact
  const sl=el.closest('#slam9');
  if(sl){const a=sl.style.getPropertyValue('--s1').trim()||'#ffd75e',b=sl.style.getPropertyValue('--s2').trim()||'#ff3ec8';return [a,'#ffffff',b,a];}
  const vd=el.closest('#verdHud');if(vd){const c=vd.style.getPropertyValue('--vc').trim()||'#ffd75e';return [c,'#ffffff',c,'#ffd75e'];} // (vague 3) le verdict éclate à la couleur de son rang
  if(el.closest('#auraV2')||el.closest('#auraHud'))return PIX_MAG;
  if(el.classList&&el.classList.contains('fM'))return PIX_OR; // (×3) le ×CASH de la bande éclate en OR : c'est de l'argent, pas une braise
  if(el.closest('#triade')||(FLOW.el&&FLOW.el.contains(el)&&(FLOW.lv>=4||el.closest('.fZ'))))return PIX_FREN; // la FRÉNÉSIE jaillit en BRAISES (rouge, blanc, ambre)
  if(FLOW.el&&FLOW.el.contains(el)){const c=FLOW_COL[FLOW.lv]||'#ffd75e';return [c,'#ffffff',c,'#ffd75e'];}
  if(el.closest('#coach'))return PIX_VERT;
  return PIX_OR; // l'argent (et le record : or + blanc)
}
/* (2026-09-29, audit iPhone) LE RECTANGLE À L'ÉCRAN d'un élément du HUD rétréci par `zoom` (<style id="hudTaille">). Chrome ≥ 128 rend
   déjà les coordonnées de l'écran ; l'ancien comportement (WebKit, possible sur iPhone) les rend DIVISÉES par le zoom — les gerbes
   partaient à côté du compteur. On mesure une fois lequel des deux on a. `zK(el)` = le zoom effectif d'un élément (1 hors du HUD). */
function zK(el){try{const z=el&&el.closest&&el.closest('#auraV2,#triade,#airHud,#pwrChip,#campChip');return z?(parseFloat(getComputedStyle(z).zoom)||1):1;}catch(e){return 1;}}
function zRect(el){const r=el.getBoundingClientRect();
  if(zRect.leg===undefined){try{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:100px;height:10px;zoom:.5;visibility:hidden;pointer-events:none';document.body.appendChild(d);zRect.leg=d.getBoundingClientRect().width>75;d.remove();}catch(e){zRect.leg=false;}}
  const k=zRect.leg?zK(el):1;if(k===1)return r;
  return {left:r.left*k,top:r.top*k,right:r.right*k,bottom:r.bottom*k,width:r.width*k,height:r.height*k};}
function pixBurst(el,n){
  if(REDUCED_MOTION||!el)return;
  const r=el.closest?zRect(el):el.getBoundingClientRect(),cx=Math.round((r.left+r.width/2)/2)*2,cy=Math.round((r.top+r.height/2)/2)*2,cols=pixCouleurs(el);
  n=Math.min(12,n||10);
  for(let i=0;i<n;i++){
    const p=document.createElement('i');p.className='pxBurst';
    const a=Math.random()*6.2832,d=40+Math.random()*70;
    p.style.left=cx+'px';p.style.top=cy+'px';p.style.background=cols[i%cols.length];
    p.style.setProperty('--dx',(Math.round(Math.cos(a)*d/2)*2)+'px');p.style.setProperty('--dy',(Math.round((Math.sin(a)*d-30)/2)*2)+'px');
    document.body.appendChild(p);setTimeout(function(){p.remove();},720);
  }
}
