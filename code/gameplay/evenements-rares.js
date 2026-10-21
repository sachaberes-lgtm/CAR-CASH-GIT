/* ============================================================================
   LES ÉVÉNEMENTS RARES (2026-10-14, GAMEPLAY — Sacha : « les morceaux de bravoure de l'ex-carrière […] surgissent de temps en temps, PAR
   SURPRISE, pendant une partie NORMALE. Rares (pas plus d'UN par partie), annoncés CLAIREMENT, jamais mortels de façon injuste, avec une
   RÉCOMPENSE. Interrupteur ?evt=0. ») — il en reste UN : la chasse de la CAISSE-NUAGE (le BANQUIER est retiré le 14/10, les MOUTONS le
   15/10, la carrière et ses niveaux le 18/10).
   ⚠ (2026-10-19, Sacha : « enlève le truc qui dit : cloud car catch je sais pas quoi dans la map nuage, j'en veux pas ») ÉTEINTE PAR
   DÉFAUT : plus de « CAISSE-NUAGE — ACCROCHE SON SILLAGE » (CLOUD CAR — CATCH HER SLIPSTREAM) dans la mer de nuages. Le code reste :
   `?evt=1` la rallume (= avant), dbgEvt aussi alors. Sans ?evt=1 : aucun tirage, aucun appel au hasard (le jeu de ?evt=0).
   ----------------------------------------------------------------------------
   La caisse-nuage court avec fantomeTick ; perdre ne coûte RIEN (on roule, on n'a pas la prime), gagner paie la PRIME.
   · QUAND : le tirage se fait au départ de la partie (evtPartie) — 75 parties sur 100 sont « armées » (EVT_P) ; celle-là verra son
     événement dans la PREMIÈRE zone de MER DE NUAGES. Jamais avant 20 s de course (EVT_T0), jamais à l'auto-école, en balade, au bac à
     sable, au parc ni au Survivant : la partie classique seule (SF). Une fois parti, il ne revient plus de la partie (EVT.fait), réussi ou
     raté. Une partie qui meurt avant le point de l'événement ne l'a pas vu. Au plus UN par partie, toujours.
     Le hasard : Math.random, HORS de la génération (le tirage de la partie, celui de la zone) — `rnd` n'est jamais touché. La piste, ses
     pièces, ses nuages sont ceux d'avant au mètre près.
   · OÙ : la CAISSE-NUAGE se condense 170 m devant toi entre 30 et 55 % de la zone.
   · ANNONCÉ : la bannière de niveau (#lvlBan, son couloir hautPasse, verrouillée 3 s) — le NOM en gros, la consigne en or dessous.
   · JAMAIS MORTEL : la caisse-nuage ne touche personne ; perdre = « ELLE T'A SEME », et la partie continue.
   · LA PRIME : ce que paie un PORTAIL (EVT_PRIME = 120 × denom, par vPaie : × FLOW, × frénésie, ligne '$:evt' du grand livre) + EVT_AURA
     d'aura ; la caisse-nuage rend 60 % de nitro.
   · CONSOLE : dbgEvt() = l'état · dbgEvt('caisse') = le forcer TOUT DE SUITE sur la zone en cours · dbgEvt('arme') = armer la partie et
     poser l'événement de la zone en cours comme à la naissance d'une zone.
   ========================================================================== */
const EVT_ON=/[?&]evt=1\b/.test(location.search),EVT_P=.75,EVT_T0=20,EVT_PRIME=120,EVT_AURA=200,EVT_FUITE=600;
const EVT={arme:false,fait:false,nom:'',etat:0,ici:false,fini:false,res:'',s0:0,sMax:0,tRun:0,t0:0,finT:0,paye:0}; // etat : 0 rien · 1 posé (il attend son point) · 2 parti · 3 la zone l'a emporté
function evtPartie(){ // une partie neuve (resetGame, start) : SON tirage — aucun appel au hasard quand ?evt=0
  EVT.fait=false;EVT.nom='';EVT.etat=0;EVT.ici=false;EVT.fini=false;EVT.res='';EVT.tRun=0;EVT.paye=0;
  EVT.arme=EVT_ON&&Math.random()<EVT_P;
}
function evtLieuOk(){ // la partie CLASSIQUE seule : ni école, ni balade, ni bac à sable, ni parc, ni Survivant
  const c=LVL.cur;
  return !!(SF.on&&c&&c.sansFin&&started&&!gameOver&&!TUTO.on&&!BALADE&&!JADE_JEU&&!SANDBOX&&!PARK.on&&!SURV.on&&!SURV.armed);
}
function evtZone(){ // campDebut : une zone commence — l'événement de la zone d'avant s'est éteint avec elle (fantomePrepare)
  if(EVT.etat)EVT.etat=EVT.fait?3:0; // posé mais jamais parti (mort, portail) : une autre zone le reprendra
  if(!EVT_ON||!EVT.arme||EVT.fait||!evtLieuOk())return;
  const c=LVL.cur,ca=c.carte||c.id;
  if(ca==='nuages')evtPrepare('caisse',false); // la mer de nuages tire la caisse-nuage (la VILLE n'a plus de banquier depuis le 14/10)
}
function evtPrepare(nom,ici){ // pose l'événement sur la zone en cours — ici : tout de suite, là où l'on est (dbgEvt)
  const sp=vPos();let s0,sM;
  if(nom==='caisse'){s0=ici?sp:L*(.3+Math.random()*.25);sM=Math.min(L-1500,s0+1500);}
  else return false;
  if(sM<=s0&&!ici)return false;
  fantomeLigne(); /* sa ligne, la corde nue, gravée dès la naissance de la zone (rien d'alloué en course) */
  EVT.nom=nom;EVT.etat=1;EVT.ici=!!ici;EVT.s0=s0;EVT.sMax=Math.max(sM,s0+200);EVT.fini=false;EVT.res='';
  return true;
}
function evtAnnonce(titre,pr){ // LA BANNIÈRE DE NIVEAU, prêtée : le NOM en gros (les lettres tombent), la consigne en or — son couloir, son verrou de lecture
  hautPasse(function(){
    const b=document.getElementById('lvlBan'),n9=document.getElementById('lvlNum'),nm9=document.getElementById('lvlNom');if(!b||!n9||!nm9)return;
    n9.style.display=''; // (lvlMontre le remet comme LVL_BAN le veut à la prochaine bannière de niveau)
    n9.innerHTML=Array.from(TR(titre)).map(function(c,i){return '<i style="animation-delay:'+(i*45)+'ms">'+(c===' '?'&nbsp;':c)+'</i>';}).join('');
    nm9.textContent='';const e9=document.createElement('em');e9.textContent=TR(pr);nm9.appendChild(e9);
    b.classList.add('on');clearTimeout(lvlBanT);lvlBanT=setTimeout(function(){b.classList.remove('on');},LVL_BAN.msPr);
    try{if(SONV2)sfx('ui.banniere');}catch(e){}hap([12,30,12]);
  },LVL_BAN.msPr,'lvl',2,{min:LVL_BAN.verrou,ferme:1});
}
function evtTick(dt){ // la boucle — rien quand ?evt=0
  if(!EVT_ON||!started||gameOver)return;
  EVT.tRun+=dt;
  if(EVT.etat===1){const sp=vPos();
    if(sp>EVT.sMax||!evtLieuOk()){EVT.etat=0;EVT.nom='';return;} // passé sans pouvoir partir (sous la dalle, en vol…) : une autre zone le reprendra
    if(sp<EVT.s0||(EVT.tRun<EVT_T0&&!EVT.ici))return;
    if(!(mode==='drive'&&side>0&&!introD))return; // la caisse-nuage roule sur le DESSUS : on part de là
    evtDemarre();return;}
  if(EVT.etat!==2)return;
  if(EVT.fini){if(EVT.finT>0){EVT.finT-=dt;if(EVT.finT<=0)vChip('');}return;} // fini : le verdict est dit (slam), la plaque se tait 2,6 s plus tard
  if(EVT.nom==='caisse')fantomeTick(dt); // (2026-10-15, Sacha) plus de halo d'or au bord de l'écran
}
function evtDemarre(){ // l'événement SURGIT
  EVT.etat=2;EVT.fait=true;EVT.fini=false;EVT.res='';EVT.t0=EVT.tRun;
  const sp=vPos();
  if(EVT.nom==='caisse'){ // elle se condense 170 m devant, dans une bouffée de ouate, à TA vitesse — puis ses équations, ton moteur, +10 % en pointe (GH_K)
    GH.on=true;GH.g.visible=true;GH.tr.init=false;
    fantomeLigne();
    GH.s=Math.min(L-60,sp+170);GH.lat=GH.latP=GH.line[ghIdx(GH.s)];GH.v=Math.max(26,Math.abs(vA));GH.momT=Math.min(4.3,momT);GH.yaw=0;
    GH.prise=0;GH.pris=false;GH.fini=false;GH.accr=false;GH.noteT=0;
    fantomePose(0);try{shatterCloud(GH.g.position,1.2);}catch(e){}
    evtAnnonce('CAISSE-NUAGE','ACCROCHE SON SILLAGE');}
}
function evtFin(res){EVT.fini=true;EVT.res=res;EVT.finT=2.6;GH.on=false;} // perdu : rien n'est dû, rien n'est retiré — la partie continue (la caisse-nuage est rangée)
function evtPortail(){ // portailPasse : franchir le portail pendant la course
  if(EVT.etat!==2||EVT.fini)return;
  if(EVT.nom==='caisse'&&GH.on&&!GH.pris&&!GH.fini){GH.fini=true;GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);vChip('');evtFin('rate');} // le portail l'emporte : sans bruit, il parle déjà
}
function evtCnPris(){ // ACCROCHÉE : la caisse-nuage se rend — l'argent, l'aura, la nitro
  GH.pris=true;GH.prise=1;vChip('');
  CV1.copy(GH.g.position);GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);
  try{shatterCloud(CV1,1.5);shatterCloud(carGroup.position,1.1);}catch(e){}
  sparkBurst(sparkGold,CV1,40,18);flashEcran('rgba(255,236,200,.75)');
  try{if(SONV2)sfx('victoire');else fanfare();}catch(e){}hap([30,40,30,40,90]);
  const g=vPaie(EVT_PRIME,12,'$:evt');EVT.paye+=g;
  slam('ATTRAPEE !',TR('LA CAISSE-NUAGE')+' +'+fmtC(g),'#ffe7a8','#ff9ee6',40,3,26);
  try{chaineAura('LA CAISSE-NUAGE',EVT_AURA,'evt',true,SONV2);}catch(e){}
  flowAdd(30,'risque');nitroPct(.6,'evt');
  evtFin('gagne');
}
function evtEtat(){const sp=vPos(),o={on:EVT_ON,arme:EVT.arme,fait:EVT.fait,nom:EVT.nom,etat:['rien','pose','en cours','fini'][EVT.etat],res:EVT.res,fini:EVT.fini,
  s:Math.round(sp),L:Math.round(L),s0:Math.round(EVT.s0),sMax:Math.round(EVT.sMax),tRun:+EVT.tRun.toFixed(1),paye:Math.round(EVT.paye),denom:Math.round(denom()),
  plaque:vChipK,carte:LVL.cur?(LVL.cur.carte||LVL.cur.id):null,lieuOk:evtLieuOk(),mode:mode,kmh:Math.round(Math.abs(vA)*3.6*SPD)};
  if(EVT.nom==='caisse')o.caisse={on:GH.on,ecart:Math.round(GH.s-sp),lat:+GH.lat.toFixed(1),kmh:Math.round(GH.v*SPD*3.6),prise:+GH.prise.toFixed(2),pris:GH.pris,fini:GH.fini,vis:GH.g.visible};
  return o;}
window.dbgEvt=function(a){ // dbgEvt() l'état · dbgEvt('caisse') le forcer ICI · dbgEvt('arme') armer la partie et poser celui de la zone
  if(!a)return evtEtat();
  if(!EVT_ON)return 'les evenements rares sont eteints (?evt=1 pour la caisse-nuage)';
  if(!started||gameOver)return 'pas de course';
  if(!evtLieuOk())return 'hors partie classique (auto-ecole, balade, bac a sable, parc, survivant, jade, ?classique=cycle)';
  if(a==='arme'){EVT.arme=true;EVT.fait=false;EVT.etat=0;evtZone();return evtEtat();}
  const nom={caisse:'caisse','caisse-nuage':'caisse',nuage:'caisse'}[a];
  if(!nom)return ['caisse','arme'];
  if(EVT.etat===2&&!EVT.fini)return 'un evenement est deja en cours';
  EVT.fait=false;EVT.arme=true;
  if(!evtPrepare(nom,true))return 'impossible ici';
  return evtEtat();};
Object.assign(I18N,{'CAISSE-NUAGE':'CLOUD CAR','ACCROCHE SON SILLAGE':'CATCH HER SLIPSTREAM',
  'LES MOUTONS':'THE SHEEP','SAUTE-LES !':'JUMP THEM!','ATTRAPEE !':'CAUGHT!'}); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES
window.dbgFacades=function(v){if(v!==undefined)CITY.uJf=v;return {uJ:+CITY.uJ.value.toFixed(3),force:CITY.uJf==null?null:CITY.uJf,jour:skyU.uJour.value,city:+skyU.uCity.value.toFixed(2),nuit:LVL.nuit};}; // (banc, facades-jour) dbgFacades(0) = les façades de nuit sur l'image figée (A/B exact), dbgFacades(null) = auto
// reconstruit le décor du menu dans le mode courant (course/parc) — même séquence que l'init
function rebuildMenuScene(){
  // (2026-09-28) revenu à l'ACCUEIL après une mort (`MENUV.retour`), `started` est encore vrai : on le baisse le temps de newTrack,
  // pour que la piste du menu se construise COMME AU DÉMARRAGE — le ciel posé d'un coup (pas le fondu « portail » d'une partie en
  // cours ni son creux sombre), ni annonce de niveau, ni porte de l'orbite. Vaut pour l'accueil et l'auto-école.
  const st9=started;if(MENUV.retour)started=false;
  try{ newTrack();respawn();setupIntroPig();frameAt(0,F);camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4); }
  finally{started=st9;}
}
/* LE RETOUR À L'ACCUEIL APRÈS UNE MORT (2026-09-28, Sacha : « il manque un bouton pour revenir au menu »). Appelé sous le volet
   (ecranWipe). La partie finie reste finie — `started && gameOver` jusqu'au prochain départ, qui passera donc par `resetGame()`
   (garageLaunch le sait déjà : `wasStarted`) et jamais par `start()`, réservé au tout premier lancement de la session. Ce qui
   change : `MENUV.retour` fait de l'ACCUEIL la racine (mRoot), rallume la VITRINE (loop, ombre de contact, Entrée) ; la course
   est rangée comme au chargement de la page — débris de l'explosion, meute — puis une piste de menu neuve.
   `resetGame()` éteint `MENUV.retour` au départ suivant. */
function accueilRetour(){try{m2Menu();}catch(e){} /* (2026-10-16) LES MISSIONS v2 : retour au menu, la série des REJOUER repart */
  if(!(started&&gameOver)||MENUV.retour)return;
  MENUV.retour=true;
  clearBoom();try{deathStop();}catch(e){}
  survMenage();SURV.on=false;survHudEl.style.display='none';lastAlertEl.style.display='none';
  runStats.zones=0; // JOUER, de l'accueil, lance la course libre
  SF.pret=false;SF.tirage=[]; // (2026-10-13) le menu reprend SA piste et SON ciel (NIVEAUX[0]) : le prochain JOUER tirera la sienne
  if(!/[?&]niveau=jade\b/.test(location.search))JADE_JEU=false; // (2026-10-13, Léo : « t'as changé le ciel du menu, c'est très grave ») JOUER lance le SOLEIL DE JADE (jadeJouer le rallume) : revenu à l'accueil, il reprend SON ciel — il gardait celui du jade
  rebuildMenuScene();
  MENUV.L=-1;MENUV.sd=null;MENUV.pl=0;MENUV.pt=0; // la vitrine recadre sur la piste neuve et ouvre sur l'AFFICHE
}
survBtnEl.addEventListener('click',e=>{e.stopPropagation();
  SURV.armed=!SURV.armed;
  if(SURV.armed&&PARK.on){PARK.on=false;if(!started)rebuildMenuScene();} // course + police : on quitte le parc
  modeLbl();
  if(started&&!gameOver)showMsg(SURV.armed?'MODE SURVIVANT AU PROCHAIN DÉPART':'SURVIVANT DÉSARMÉ');
});

// ---------- GARAGE : showroom pour revoir CHAQUE caisse (réutilise buildCar → toujours les VRAIES voitures) ----------
let garageOn=false,garageI=0,garageAng=0,garagePitch=.28,garageDist=8.5,garageDrag=false,gpx=0,gpy=0,gpx0=0,gpy0=0;
const gEl=$('garage'),gNameEl=$('gName'),gLvlEl=$('gLvl'),gSpdEl=$('gSpd'),gDescEl=$('gDesc');
const GARAGE_Y=1500; // haut dans le ciel : au-dessus des nuages → fond cyan étoilé PROPRE
// SOL DE SHOWROOM : nappe brumeuse cyan qui capte un reflet (façon lac au clair de lune)
const garageFloor=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
  x.fillStyle='#0a1424';x.fillRect(0,0,256,256);
  const g=x.createRadialGradient(128,128,0,128,128,130);
  g.addColorStop(0,'rgba(70,150,175,.34)');g.addColorStop(.4,'rgba(34,84,120,.2)');g.addColorStop(1,'rgba(10,18,38,0)'); // cyan MAT (calme, pas de bloom rose)
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(cv);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.8,fog:false,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.visible=false;m.renderOrder=-6;scene.add(m);return m;
})();
// ---------- L'ATELIER : un VRAI garage low-poly autour de la caisse ----------
// La vitrine, c'était une caisse posée sur une nappe de brume à 1500 m : propre, et vide comme un
// fond de studio. Un garage, ça se RECONNAÎT — l'établi encombré, les pneus empilés, le fût d'huile,
// le néon qui grésille, la porte relevée sur la nuit. Tout est bâti UNE FOIS, à la première
// ouverture (zéro coût tant qu'on n'y entre pas), à partir de SIX géométries unité mises à l'échelle
// et d'une quinzaine de matériaux plats : le low-poly, c'est la DA autant que le budget.
// ⚠ AUCUNE lumière n'est ajoutée à la scène : on recycle les deux PointLights de l'étal. Une lumière
// de plus se paierait sur TOUTES les frames du jeu, course comprise.
// ⚠ RÈGLE DE PLACEMENT : la caméra orbite entre 4,6 et 7,8 m — rien ne se pose à moins de 8,3 m du
// centre, sinon on traverse l'objet en tournant. Les murs sont à 11 m (x) et 13 m (z) : il reste
// tout un anneau pour entasser le bazar sans jamais gêner le tour.
const GAR={W:22,D:26,H:6.2,POD:.12,root:null,tubes:[],halos:[],flick:null,drop:null,dust:null,dustV:null,neons:[],
  pod:null,ring:null,scan:null,sw:null,   // pod/ring/scan/sw : LE RETOURNEUR (voir garageGo)
  go:null,_v:null,_c:null,               // go : LE LÂCHER (voir garageLaunch) · _v/_c : vecteurs réutilisés
  pressT:0,PRESS_D:.16,                   // LE TOUCHER : accusé de pression au pointerdown sur la caisse (voir garageRender)
  impactT:0,IMPACT_D:.4,impactMeshes:null,impactVel:null}; // LES BLOCS D'IMPACT : voir garageImpact()
// PARIS LA NUIT — traductions des niveaux et de leurs promesses (2026-09-28)
Object.assign(I18N,{'PARIS LA NUIT':'PARIS BY NIGHT','La nuit sur les toits de Paris, jusqu\'à la tour Eiffel.':'Night over the rooftops of Paris, all the way to the Eiffel Tower.',
  'HEURE BLEUE':'BLUE HOUR','CHAMP DE MARS':'CHAMP DE MARS','TROCADERO':'TROCADERO','QUAIS DE SEINE':'SEINE BANKS','PONT ALEXANDRE III':'PONT ALEXANDRE III',
  'CONCORDE':'CONCORDE','CHAMPS-ELYSEES':'CHAMPS-ELYSEES','ARC DE TRIOMPHE':'ARC DE TRIOMPHE','MONTMARTRE':'MONTMARTRE','MINUIT':'MIDNIGHT',
  'PASSE SOUS LA DAME DE FER':'DRIVE UNDER THE IRON LADY','RASE LES FACADES':'HUG THE FACADES','SALUE L\'OBELISQUE':'SALUTE THE OBELISK','FAIS LE TOUR DE L\'ETOILE':'CIRCLE THE ETOILE',
  'De la Concorde au Sacré-Cœur : les Champs, la Seine, Montmartre.':'From the Concorde to the Sacré-Cœur: the Champs, the Seine, Montmartre.',
  'LES CHAMPS-ELYSEES':'THE CHAMPS-ELYSEES','HEURE DOREE':'GOLDEN HOUR','LA SEINE':'THE SEINE','MONTMARTRE':'MONTMARTRE','LA NUIT':'NIGHT','FROTTE !':'SCRAPE!',
  'ENCASTRE DANS UNE FACADE':'SMASHED INTO A FACADE','A LA SEINE !':'INTO THE SEINE!','ECRASE SUR LE PAVE':'CRASHED ON THE COBBLES',
  'PARIS S\'ALLUME':'PARIS LIGHTS UP','SALUE LA DAME DE FER':'SALUTE THE IRON LADY','VOLE AU-DESSUS DES TOITS':'FLY OVER THE ROOFTOPS','SUIS LE FLEUVE':'FOLLOW THE RIVER',
  'FILE SOUS LES DORURES':'RACE UNDER THE GOLD','TOURNE AUTOUR DE L\'OBELISQUE':'CIRCLE THE OBELISK','LA PLUS BELLE AVENUE':'THE FINEST AVENUE',
  'PASSE LA GRANDE PORTE':'THROUGH THE GREAT ARCH','PARIS A TES PIEDS':'PARIS AT YOUR FEET','LA TOUR SCINTILLE POUR TOI':'THE TOWER SPARKLES FOR YOU'});
// LE GUIDE DU JEU — traductions (ici : I18N n'existe pas encore là où vit GUIDE)
Object.assign(I18N,{'GUIDE DU JEU':'GAME GUIDE','COMPRIS !':'GOT IT!','DRIFT':'DRIFT','NITRO':'NITRO','VOL':'AIR','AURA':'AURA','NIVEAUX':'LEVELS','GARAGE':'GARAGE',
  'Pouce gauche : glisse à gauche ou à droite. Lâche, la caisse file tout droit.':'Left thumb: slide left or right. Let go and the car keeps its line.',
  'Tire le pouce vers le bas en tournant : la caisse glisse et charge le turbo.':'Pull your thumb down while turning: the car slides and charges the turbo.',
  'Pouce droit : ça pousse. En l’air, la nitro fait planer.':'Right thumb: boost. In the air, nitro makes you glide.',
  'Sans nitro, le pouce redresse la caisse. Pose-toi à plat : PARFAIT.':'Without nitro, your thumb levels the car. Land flat: PERFECT.',
  'Chaque figure rapporte ; des figures différentes font monter le ×. Pose-toi pour encaisser — si tu exploses, tout est perdu.':'Every trick scores; different tricks raise the ×. Land to cash in — explode and it is all lost.',
  'Passe le portail pour finir le niveau. Choisis-le au garage : chaque niveau garde ton record.':'Go through the portal to clear the level. Pick it in the garage: each level keeps your record.',
  'Le lapin ouvre la boutique. Garde le doigt sur ta voiture : elle charge un boost.':'The bunny opens the shop. Hold your finger on your car: it charges a boost.','ESPACE':'SPACE'});
function buildAffiches(g){
  const hd=GAR.D/2;GAR.affiches=[];
  for(const a of [{k:'perso',x:-6.45,cad:0xffc83d}]){  // (2026-10-19, Léo : « mets-la à droite ») x < 0 = à DROITE vu de la caisse (à gauche, l'ÉTAL du moteur, vdepEtal) — x > 0 = à GAUCHE vu de la caisse — (2026-09-30, Sacha : « enlève le truc de classement mondial ») l'affiche RECORDS MONDIAUX ({k:'monde',x:-8.5,cad:0x5fd8ff}) est retirée : il reste le RECORD PERSO
    // (2026-09-30) 2,78 → 2,05 m et ×1,2 : sur main la caméra du menu est plus proche et l'objectif décentré — là-haut, elles passaient
    // DERRIÈRE JOUER et l'étiquette MISSIONS. PERSO contre le pilier gauche de la porte ; MONDE vers le coin droit (−8,5, pas −6,45) : vu
    // de la caméra, le SOCLE DES MISSIONS (−2,9 ; 2,5) tombait pile devant elle.
    const grp=new THREE.Group();grp.position.set(a.x,2.05,hd-.05);grp.rotation.y=Math.PI;grp.scale.setScalar(1.2);g.add(grp);
    const cadre=new THREE.Mesh(new THREE.BoxGeometry(2.36,3.06,.06),
      new THREE.MeshLambertMaterial({color:a.cad,emissive:a.cad,emissiveIntensity:.25,fog:false}));grp.add(cadre);
    const cv=document.createElement('canvas');cv.width=240;cv.height=320;const tx=new THREE.CanvasTexture(cv);
    const toile=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.9),new THREE.MeshBasicMaterial({map:tx,fog:false,color:0xd6d6d6}));
    toile.position.z=.035;grp.add(toile);
    const lampe=new THREE.Mesh(new THREE.BoxGeometry(.9,.1,.22),new THREE.MeshLambertMaterial({color:0x232a38,fog:false}));
    lampe.position.set(0,1.7,.14);grp.add(lampe);                                  // l'applique
    const lueur=new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:0xffe2b0,transparent:true,opacity:.3,
      blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    lueur.scale.set(2.6,1.4,1);lueur.position.set(0,1.5,.12);grp.add(lueur);
    GAR.affiches.push({k:a.k,g:grp,toile:toile,cadre:cadre,lueur:lueur,cv:cv,tx:tx,hv:0,pop:0,s0:1.2});
  }
  affichesMaj();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(affichesMaj); // la police pixel peut arriver après
}
function affichesMaj(){
  if(!GAR.affiches)return;
  const d=SAVE.d,ex=d.ex||{},P=s=>sansAcc(TR(s)),nb=v=>Math.round(v||0).toLocaleString(LOC());
  const MONDE='..#####..|.#..#..#.|#..#.#..#|#########|#...#...#|#########|#..#.#..#|.#..#..#.|..#####..';
  for(const a of GAR.affiches){
    const x=a.cv.getContext('2d'),w=240,h=320,perso=a.k==='perso',c1=perso?'#ffd75e':'#7fe6ff';
    const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,perso?'#2a1250':'#0e1f4d');gr.addColorStop(1,perso?'#12072a':'#070f2a');
    x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.save();x.globalAlpha=.09;x.fillStyle=c1;                                     // les rayons derrière l'emblème
    for(let i=0;i<12;i++){const a0=i/12*Math.PI*2;x.beginPath();x.moveTo(w/2,44);
      x.lineTo(w/2+Math.cos(a0)*320,44+Math.sin(a0)*320);x.lineTo(w/2+Math.cos(a0+.22)*320,44+Math.sin(a0+.22)*320);x.fill();}
    x.restore();
    x.strokeStyle=c1;x.lineWidth=4;x.strokeRect(9,9,w-18,h-18);
    x.fillStyle=c1;(perso?PXI_G.trophee:MONDE).split('|').forEach((row,j)=>{for(let i=0;i<9;i++)if(row[i]==='#')x.fillRect(98+i*5,22+j*5,5,5);});
    x.textAlign='center';
    const pix=(s,px,col,y9)=>{x.font=px+"px 'Press Start 2P',monospace";const m=Math.min(1,(w-34)/Math.max(1,x.measureText(s).width));
      x.save();x.translate(w/2,y9);x.scale(m,1);x.fillStyle='#000';x.fillText(s,2,2);x.fillStyle=col;x.fillText(s,0,0);x.restore();};
    const tt=P(perso?'RECORD|PERSO':'RECORDS|MONDIAUX').split('|');
    pix(tt[0],18,c1,98);pix(tt[1]||'',13,'#ffffff',122);
    const selNom=P('SANS FIN');
    if(perso){ // SANS FIN : les records de toujours
      const L=[['MEILLEURE PARTIE',fmtC(d.best||0)],['AURA MAX',nb(d.auraMax)],['PALIER MOTEUR',nb(ex.eng)],['VITESSE MAX',nb(ex.kmh)+' KM/H']];
      L.forEach((r,i)=>{const y=156+i*40;pix(P(r[0]),8,'#b9b2e6',y);pix(r[1],14,i?'#ffffff':'#7dff9a',y+19);});
    }else{
      pix(selNom,9,'#b9b2e6',146);                                                   // le classement de CE niveau (à venir)
      [['1','#ffd75e'],['2','#d8dde8'],['3','#e0955a']].forEach((r,i)=>{const y=180+i*30;pix(r[0]+'.  ? ? ?  - - -',11,r[1],y);});
      x.save();x.translate(w/2,284);x.rotate(-.1);x.strokeStyle='#ff5e7a';x.lineWidth=3;x.strokeRect(-98,-19,196,30);
      x.font="9px 'Press Start 2P',monospace";x.fillStyle='#ff5e7a';x.fillText(P('SOIS LE 1ER'),0,1);x.restore();
    }
    a.tx.needsUpdate=true;
  }
}
/* (2026-09-30, Léo : « remets les affiches record ») ce bloc dormait sur main depuis le portage de sa branche : rien ne le bâtissait ni ne
   l'appelait, et son lanceur de rayon n'existait pas. Branché : bâti avec l'atelier (buildGarageRoom → chauffé au menu avec lui),
   repeint à chaque ouverture (openGarage), survol souris + tap (les écouteurs de l'atelier), respiration dans garageRender.
   L'affiche PERSO montre les records de toujours. */
/* (2026-10-07, campagne de debug avant publication) LES AFFICHES EN ANGLAIS — elles passaient bien par TR, mais aucune de leurs clés
   n'était au dictionnaire : l'atelier anglais affichait « RECORD PERSO / MEILLEURE PARTIE ». Avec, les étiquettes VoiceOver (aria-label,
   traduites par applyLangDOM) qui lisaient « Accueil », « Boutique »... en français. */
try{Object.assign(I18N,{'RECORD|PERSO':'PERSONAL|BEST','RECORDS|MONDIAUX':'WORLD|RECORDS','SANS FIN':'ENDLESS','AURA RECORD':'BEST AURA',
  'STATUT':'STATUS','TERMINE':'CLEARED','A TERMINER':'TO CLEAR','VERROUILLE':'LOCKED','MEILLEURE PARTIE':'BEST RUN','AURA MAX':'MAX AURA',
  'PALIER MOTEUR':'ENGINE TIER','VITESSE MAX':'TOP SPEED','BIENTOT EN LIGNE':'COMING SOON','SOIS LE 1ER':'BE FIRST','TES RECORDS : BIENTOT EN DETAIL':'YOUR RECORDS: DETAILS SOON',
  'CLASSEMENT MONDIAL : BIENTOT EN LIGNE':'WORLD RANKING: COMING SOON',
  'Accueil':'Home','Boutique':'Shop','Bientôt':'Coming soon','Niveau':'Level','Compte et aura':'Account and aura','Les niveaux':'Levels',
  'Niveaux accomplis':'Levels cleared','Inventaire':'Inventory','Tenir le téléphone couché':'Hold the phone sideways','Tenir le téléphone debout':'Hold the phone upright'});}catch(e){}
// (2026-10-12, passe qualité) les textes arrivés depuis le 9/10 sans anglais (VoiceOver lisait du français, « LES SINGES +150 » en EN) ;
// « MAINTIENS TA CAISSE » : la clé existait en « LA CAISSE », le texte de l'aide du burn-out ne la trouvait jamais
try{Object.assign(I18N,{'Offres':'Offers','La voiture seule':'Car only','Cacher la console':'Hide the console','Tourner le garage':'Turn the garage',
  'MAINTIENS TA CAISSE':'HOLD YOUR CAR','BIENTOT':'SOON','CACHER':'HIDE','LES SINGES !':'MONKEYS!','ARRIVÉE':'FINISH','SOLEIL DE JADE':'JADE SUN','PICS DE JADE':'JADE PEAKS'});}catch(e){}
// (2026-10-14) LA FORÊT NOIRE
try{Object.assign(I18N,{'LE GLACIER':'THE GLACIER','SAUTE AU LACET D EN DESSOUS':'JUMP TO THE BEND BELOW','LA BANQUISE':'THE ICE SHELF','LA GLACE GLISSE, LA POUDRE AVALE':'ICE GLIDES, POWDER SWALLOWS','LES AURORES BOREALES':'THE NORTHERN LIGHTS','LA POUDREUSE TOMBE':'FRESH POWDER FALLING','LE BLIZZARD SOUFFLE':'THE BLIZZARD HOWLS','NEIGE':'SNOW','BLIZZARD':'BLIZZARD','GLISSE !':'GLIDE!','SUR LE PIC !':'ON THE PEAK!','POUDREUSE !':'POWDER!','TRACE PARFAITE !':'PERFECT TRACK!','PATINOIRE !':'ICE RINK!','DERAPAGE GLACE !':'ICE DRIFT!','TREMPLIN DE GLACE !':'ICE KICKER!','LA MONTAGNE TE RAMENE':'THE MOUNTAIN BRINGS YOU BACK','ENSEVELI DANS LA POUDREUSE':'BURIED IN THE POWDER','FRACASSE SUR LA GLACE':'SMASHED ON THE ICE'});}catch(e){} // (2026-10-14) LA BANQUISE
try{Object.assign(I18N,{'LA FORÊT NOIRE':'THE BLACK FOREST','SLALOME ENTRE LES GEANTS':'SLALOM THROUGH THE GIANTS','LA FORET EST HANTEE':'THE FOREST IS HAUNTED',
  'LES LOUPS HURLENT':'THE WOLVES ARE HOWLING','ENCASTRE DANS UN ARBRE':'SMASHED INTO A TREE','ECRASE DANS LES FOUGERES':'CRASHED INTO THE FERNS'});}catch(e){}
try{Object.assign(I18N,{'LE ROYAUME DE FEU':'THE FIRE KINGDOM','LA LAVE NE PARDONNE PAS':'THE LAVA SHOWS NO MERCY','LA LAVE EST LA SEULE LUMIERE':'THE LAVA IS THE ONLY LIGHT', // (2026-10-14) LE ROYAUME DE FEU
  'PLUIE DE CENDRES':'ASH RAIN','CENDRES':'ASH','ORAGE VOLCANIQUE':'VOLCANIC STORM','ENGLOUTI PAR LA LAVE':'SWALLOWED BY THE LAVA','ECRASE SUR LA ROCHE':'SMASHED ON THE ROCK'});}catch(e){}
const shopRay=new THREE.Raycaster(),shopNdc=new THREE.Vector2();
function afficheVise(e){ // l'affiche sous le pointeur — sauf si la caisse est devant
  if(!GAR.affiches||GAR.btq||!garageOn||GBQ.on)return null;
  const r=renderer.domElement.getBoundingClientRect();
  shopNdc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  shopRay.setFromCamera(shopNdc,camera);
  const hit=shopRay.intersectObjects(GAR.affiches.map(a=>a.toile),false);
  if(hit.length&&carGroup){const hc=shopRay.intersectObject(carGroup,true);if(hc.length&&hc[0].distance<hit[0].distance)return null;} // la caisse devant l'affiche : c'est elle qu'on touche
  return hit.length?GAR.affiches.find(a=>a.toile===hit[0].object)||null:null;
}
function afficheTap(a){ // ⚠ LE POINT D'EXTENSION des affiches : leurs vraies fonctions viendront ici
  a.pop=.45;
  /* (2026-10-14, session SON, audit oreille-neuve §10) l'affiche TINTE toujours (design de Léo) mais en banque : deux chimeNote à 659/988 Hz
     (587/880 pour l'autre) jouaient PAR-DESSUS le clic, fixes, hors de la tonalité de la musique et hors de la table de niveaux.
     `ui.ok` (deux notes claires qui montent, key1 : elle suit la tonalité du morceau) dit la même chose ; sans banque, les deux cloches d'avant. */
  try{uiClic();if(SONV2&&window.CCSON&&window.CCSON.existe('ui.ok'))sfx('ui.ok');else{chimeNote(a.k==='perso'?659:587,0,.12,.12);chimeNote(a.k==='perso'?988:880,.06,.18,.1);}}catch(e){}
  /* (2026-10-14, nettoyage, Sacha : « ce qui dit bientôt : on cache ») plus de toast « TES RECORDS : BIENTOT EN DETAIL » ni « CLASSEMENT MONDIAL : BIENTOT EN LIGNE » : l'affiche rebondit et tinte, c'est tout. L'affiche MONDE n'existe plus dans buildAffiches depuis le 2026-09-30. */
}
/* LA VITESSE DE DÉPART AU GARAGE (2026-10-19, Léo : « trouve un bouton et un système qui rend le truc fluide — pas une page qui nique tout
   le système » · « à la place de l'affiche record, le matos de moteur, à gauche : un étal avec le moteur soulevé, qui change en fonction du
   niveau que tu vas sélectionner ; l'affiche, mets-la à droite »). RIEN NE S'OUVRE : un toucher sur un cran = la vitesse est choisie (sauvée),
   l'étiquette du PLAY et le moteur de l'étal changent tout de suite. Le cœur (VDEP_PAL, vdepOuvert, vdepN, vdepPal, vdepPose) vit près
   d'ENGINE_TIERS.
   · LA GRILLE `#gVdep` (enfant de #gBottom, en absolu) : posée par vdepPlace au-dessus de la rangée INVENTAIRE · MISSIONS · BOUTIQUE — elle
     lit leurs boîtes de mise en page (offsetLeft/Top, que l'inclinaison des touches ne fausse pas), debout comme couché ; visible seulement
     quand le PLAY du garage l'est (ni boutique, ni inventaire, ni missions, ni « la voiture seule », ni pendant le lâcher). Avant le palier 30,
     les six cases montrent un CADENAS, refusent et disent « ATTEINS LE PALIER 30 » ; le jour où il tombe : « VITESSE DE DÉPART DÉBLOQUÉE ».
   · L'ÉTIQUETTE « 3 · V8 ATMO » à la couleur du moteur, collée au bord haut du PLAY du garage (`#gVdepTag`) ET de l'accueil (`#mVdepTag`,
     dans #mHome : le PLAY de l'accueil part lui aussi de ce cran), dès le cran 2. Au cran 1 (le départ normal) : rien.
   · L'ÉTAL (`VDEP.etal`), à GAUCHE de la porte, là où vivait l'affiche des records (passée à droite, buildAffiches) : un socle bas, un vérin
     chromé qui SOULÈVE le moteur du cran choisi (mkEngine), qui tourne lentement ; changer de cran = le moteur redescend dans le socle et le
     nouveau monte. Les six moteurs sont bâtis AVEC l'atelier (au menu : sa chauffe les compile, rien ne compile au toucher), un seul visible.
     Aucune lumière ajoutée (les lampes de l'atelier les éclairent) ; une lueur au sol et la plaque du socle à la couleur du moteur.
   Console : dbgVdep() (état), dbgVdep(n) (choisit le cran n, 0-5), dbgVdep('tout') / dbgVdep('rien') (ouvre / referme tous les crans le temps
   d'un banc, sans rien sauver). */
const VDEP={el:null,tag:null,mtag:null,b:[],etal:null,m:[],nVu:-1,k:0,ph:0,tPlace:0,ms:0};
function vdepNom(n){const E=ENGINE_TIERS[VDEP_PAL[n]]||ENGINE_TIERS[0];return sansAcc(TR(E.n));}
function vdepCol(n){if(!(n>0))return '#b9b0e8';const E=ENGINE_TIERS[VDEP_PAL[n]];return engNeon(E.col);}
function vdepInit(){
  if(VDEP.el)return;const el=$('gVdep');if(!el)return;VDEP.el=el;VDEP.tag=$('gVdepTag');
  for(let i=0;i<VDEP_PAL.length;i++){const b=document.createElement('button');b.type='button';b.dataset.n=i;b.setAttribute('role','radio');
    b.innerHTML='<b>'+(i+1)+'</b>';el.appendChild(b);VDEP.b.push(b);}
  const h=document.getElementById('mHome');if(h){const t=document.createElement('div');t.id='mVdepTag';t.setAttribute('aria-hidden','true');h.appendChild(t);VDEP.mtag=t;}
  el.addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('button');if(!b)return;e.stopPropagation();
    const n=+b.dataset.n;
    if(!vdepFonction()){try{uiClic('refus');}catch(_){}b.classList.remove('non');void b.offsetWidth;b.classList.add('non');
      try{toast(pxi('verrou')+' '+sansAcc(TR('ATTEINS LE PALIER 30'))+' · '+sansAcc(TR(ENGINE_TIERS[ENGINE_TIERS.length-1].n)),true);}catch(_){}return;}
    if(n===vdepN())return;
    SAVE.d.vdep=n;SAVE.mark();try{uiClic('onglet');}catch(_){}try{hap(8);}catch(_){}vdepMaj();});
  vdepMaj();
  setInterval(function(){try{ // (la grille et les étiquettes suivent leurs boutons ; un record de moteur, le code cousin, la langue : les crans se redisent)
    const sg=((SAVE.d.ex&&SAVE.d.ex.eng)|0)+','+cousin()+','+(SAVE.d.vdep|0)+','+VDEP_TOUT+','+(typeof LANG!=='undefined'?LANG:'');
    if(sg!==VDEP.sig){VDEP.sig=sg;vdepMaj();if(VDEP.etal&&VDEP.nVu>=0)vdepPlaque(VDEP.nVu);}else vdepPlace();}catch(e){}},250);
}
function vdepMaj(){
  if(!VDEP.el)return;const n=vdepN();
  const f=vdepFonction();
  if(VDEP.f===false&&f){try{toast(pxi('coche')+' '+sansAcc(TR('VITESSE DE DÉPART DÉBLOQUÉE')),true);if(SONV2)sfx('ui.ok');}catch(_){}} // le palier 30 vient de tomber : on le dit une fois
  VDEP.f=f;
  for(let i=0;i<VDEP.b.length;i++){const b=VDEP.b[i],o=f;b.classList.toggle('on',f&&i===n);b.classList.toggle('ferme',!o);
    b.setAttribute('aria-checked',i===n?'true':'false');b.setAttribute('aria-label',TR('VITESSE')+' '+(i+1)+' · '+vdepNom(i)+(o?'':' · '+TR('VERROUILLÉE')));}
  const c=vdepCol(n);VDEP.el.style.setProperty('--vc',c);
  const txt=n?'<b>'+(n+1)+'</b>'+vdepNom(n):'';
  for(const t of [VDEP.tag,VDEP.mtag])if(t){t.style.setProperty('--vc',c);if(t._h!==txt){t.innerHTML=txt;t._h=txt;}}
  vdepPlace();}
function vdepVu(e){return !!e&&e.offsetWidth>1&&e.offsetHeight>1&&getComputedStyle(e).visibility!=='hidden';}
function vdepPlace(){ // la grille au-dessus de la rangée, les étiquettes au bord haut des PLAY
  if(!VDEP.el)return;const n=vdepN(),enJeu=started&&!gameOver,fn=vdepFonction();
  /* (2026-10-19 soir, Léo : « la vitesse n'apparaît que quand on a atteint le niveau 30, moteur 30 ») AVANT LE PALIER 30, PLUS DE GRILLE : ni
     cadenas, ni étiquette « VITESSE » ; les portes remontent à sa place (#garage.sansVdep, <style id="garageHaut">). Le jour où il tombe, elle
     APPARAÎT, avec « VITESSE DE DÉPART DÉBLOQUÉE » (vdepMaj). */
  if(gEl&&gEl.classList.contains('sansVdep')===fn)gEl.classList.toggle('sansVdep',!fn);
  let vu=false;
  if(fn&&garageOn&&!enJeu&&!(typeof GAR!=='undefined'&&GAR.go)&&!(typeof GBQ!=='undefined'&&GBQ.on)&&!(typeof INV!=='undefined'&&INV.on)&&!(gEl&&gEl.classList.contains('missions'))){
    const J=$('gJouer'),R=[$('gvCof'),$('gvOutils'),$('gvMis'),$('gShopBas')].filter(vdepVu);
    if(vdepVu(J)&&R.length){let l=1e9,r=-1e9,t=1e9;for(const e of R){l=Math.min(l,e.offsetLeft);r=Math.max(r,e.offsetLeft+e.offsetWidth);t=Math.min(t,e.offsetTop);}
      const H=VDEP.el.offsetHeight||36,x=Math.round(l),y=Math.round(t-H-8),w=Math.round(r-l);
      if(VDEP.el._p!==x+','+y+','+w){VDEP.el._p=x+','+y+','+w;VDEP.el.style.left=x+'px';VDEP.el.style.top=y+'px';VDEP.el.style.width=w+'px';}
      vu=true;
      if(VDEP.tag){const on=n>0;VDEP.tag.classList.toggle('vu',on);
        if(on){const k=Math.round(J.offsetLeft+J.offsetWidth/2)+','+Math.round(J.offsetTop);if(VDEP.tag._p!==k){VDEP.tag._p=k;VDEP.tag.style.left=Math.round(J.offsetLeft+J.offsetWidth/2)+'px';VDEP.tag.style.top=Math.round(J.offsetTop)+'px';}}}}}
  if(!vu&&VDEP.tag)VDEP.tag.classList.remove('vu');
  if(VDEP.el.classList.contains('vu')!==vu)VDEP.el.classList.toggle('vu',vu);
  if(VDEP.mtag){const P=document.querySelector('#mHome .mPlay'),T=VDEP.mtag,on=n>0&&!enJeu&&vdepVu(P);T.classList.toggle('vu',on);
    if(on){ // l'accueil : dans l'espace entre les tuiles et les lettres PLAY s'il y a la place (debout), sinon juste sous PLAY (couché : les tuiles le serrent)
      const pr=P.getBoundingClientRect(),L=P.querySelectorAll('.lg');let lt=1e9,lb=-1e9,ll=1e9,lr=-1e9;
      for(const e of L){const r=e.getBoundingClientRect();if(r.width<1)continue;lt=Math.min(lt,r.top);lb=Math.max(lb,r.bottom);ll=Math.min(ll,r.left);lr=Math.max(lr,r.right);}
      if(lt>lb){lt=pr.top;lb=pr.bottom;ll=pr.left;lr=pr.right;}
      let tb=-1e9;for(const e of document.querySelectorAll('#mHome .mAccB')){const r=e.getBoundingClientRect();if(r.width>1&&r.bottom<=lt+4&&r.right>ll&&r.left<lr)tb=Math.max(tb,r.bottom+5);} // (+5 : la tranche des tuiles)
      const h=T.offsetHeight||17,y=(tb>-1e8&&lt-tb>=h+2)?(tb+lt-h)/2:lb+6,ox=pr.left-P.offsetLeft,oy=pr.top-P.offsetTop; // (écran → repère du bloc qui les porte : #mob)
      const x9=Math.round((ll+lr)/2-ox),y9=Math.round(y-oy),k=x9+','+y9;
      if(T._p!==k){T._p=k;T.style.left=x9+'px';T.style.top=y9+'px';}}}
}
function vdepPlaque(n){ // la plaque du socle : le nom du moteur et son cran, à sa couleur
  const P=VDEP.etal&&VDEP.etal.pl;if(!P)return;const x=P.cv.getContext('2d'),w=P.cv.width,h=P.cv.height,c=vdepCol(n);
  x.clearRect(0,0,w,h);x.fillStyle='#120a1e';x.fillRect(0,0,w,h);x.strokeStyle=c;x.lineWidth=4;x.strokeRect(3,3,w-6,h-6);
  x.textAlign='center';x.textBaseline='middle';const fn=vdepFonction(); /* (2026-10-20) avant le palier 30, la vitesse n'existe pas encore : le nom seul */
  if(fn){x.fillStyle=c;x.font='14px "Press Start 2P"';x.fillText(sansAcc(TR('VITESSE'))+' '+(n+1),w/2,h*.3);}
  x.fillStyle='#ffffff';let f=fn?22:26;x.font=f+'px "Press Start 2P"';const nm=vdepNom(n);while(f>10&&x.measureText(nm).width>w-28){f-=2;x.font=f+'px "Press Start 2P"';}
  x.fillText(nm,w/2,fn?h*.68:h*.54);P.tx.needsUpdate=true;}
function vdepEtal(g){ // (buildGarageRoom) le socle, le vérin, les six moteurs — un seul visible
  if(ETAL_V){vdepEtal2(g,ETAL_V);return;} // (2026-10-20) LA GRUE D'ATELIER (?etal=ancien = cet étal-ci)
  const t0=performance.now(),hd=GAR.D/2,root=new THREE.Group();root.position.set(5.95,0,hd-1.4);root.rotation.y=Math.PI;g.add(root);
  const mS=new THREE.MeshLambertMaterial({color:0x1d1a2a}),mL=new THREE.MeshBasicMaterial({color:0xffffff,fog:false}),mC=M9.inox();
  const socle=new THREE.Mesh(new THREE.BoxGeometry(2.2,.7,1.6),mS);socle.position.y=.35;root.add(socle);
  const dessus=new THREE.Mesh(new THREE.BoxGeometry(2.32,.08,1.72),new THREE.MeshLambertMaterial({color:0x2b2740}));dessus.position.y=.74;root.add(dessus);
  const fil=new THREE.Mesh(new THREE.BoxGeometry(2.34,.035,1.74),mL);fil.position.y=.69;root.add(fil); // le liseré néon (couleur du moteur)
  const verin=new THREE.Group();verin.position.y=.78;root.add(verin);
  const tige=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,1,14),mC);tige.position.y=.5;verin.add(tige);
  const fut=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.34,16),new THREE.MeshLambertMaterial({color:0x34303f}));fut.position.y=.95;root.add(fut);
  const berceau=new THREE.Mesh(new THREE.BoxGeometry(1.25,.06,.75),mC);root.add(berceau);
  const cv=document.createElement('canvas');cv.width=320;cv.height=80;const tx=new THREE.CanvasTexture(cv);
  const plaque=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.475),new THREE.MeshBasicMaterial({map:tx,fog:false}));plaque.position.set(0,.36,.81);root.add(plaque);
  const lueur=new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:0xffffff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  lueur.scale.set(3.4,2.2,1);lueur.position.y=1.6;root.add(lueur);
  const bx=new THREE.Box3(),sz=new THREE.Vector3(),ce=new THREE.Vector3();
  for(let i=0;i<VDEP_PAL.length;i++){const e=mkEngine(VDEP_PAL[i]),h=new THREE.Group();h.add(e);
    bx.setFromObject(e);bx.getSize(sz);bx.getCenter(ce);const k=2.3/Math.max(.01,sz.x,sz.y,sz.z);e.scale.multiplyScalar(k);e.position.set(-ce.x*k,-ce.y*k+sz.y*k/2,-ce.z*k);
    h.userData.h=sz.y*k;h.visible=false;root.add(h);VDEP.m.push(h);}
  VDEP.etal={root:root,verin:verin,berceau:berceau,lueur:lueur,fil:fil,pl:{cv:cv,tx:tx}};VDEP.nVu=-1;VDEP.k=0;VDEP.ph=1;
  vdepEtalTick(1/60,0);VDEP.ms=+(performance.now()-t0).toFixed(1);}
function vdepEtalTick(dt,t9){ // (garageRender) le moteur descend, change, remonte ; il tourne et respire
  const E=VDEP.etal;if(!E)return;const n=vdepN();
  if(VDEP.nVu<0){VDEP.nVu=n;VDEP.m[n].visible=true;VDEP.k=1;VDEP.ph=1;vdepPlaque(n);vdepEtalCol(E,vdepCol(n));}
  if(E.tick){E.tick(dt,t9,n);return;} // (2026-10-20) la grue : l'éclatement et la résurrection (voir LA GRUE D'ATELIER)
  if(n!==VDEP.nVu&&VDEP.ph===1)VDEP.ph=-1; // un cran neuf : on redescend d'abord
  if(VDEP.ph<0){VDEP.k=Math.max(0,VDEP.k-dt/.22);if(VDEP.k<=0){VDEP.m[VDEP.nVu].visible=false;VDEP.nVu=n;VDEP.m[n].visible=true;VDEP.ph=0;vdepPlaque(n);
    vdepEtalCol(E,vdepCol(n));try{if(SONV2)sfx('ui.ok');}catch(_){}}}
  else if(VDEP.ph===0){VDEP.k=Math.min(1,VDEP.k+dt/.5);if(VDEP.k>=1)VDEP.ph=1;}
  const k=VDEP.k,q=k-1,e9=VDEP.ph===0?1+2.4*q*q*q+1.4*q*q:k*k; // la montée déborde un poil puis se pose (la descente, en accélérant)
  const H=VDEP.m[VDEP.nVu];if(E.pose){E.pose(H,k,e9,t9,dt);return;}const lev=.78+e9*1.05;
  E.verin.scale.y=Math.max(.02,lev-.78);E.berceau.position.y=lev;H.position.y=lev+.04+Math.sin(t9*1.3)*.03*k;
  H.rotation.y+=dt*.35;H.scale.setScalar(.55+.45*Math.min(1,e9));
  E.lueur.material.opacity=(.22+.14*Math.sin(t9*2.1))*Math.min(1,k*1.4);}
/* LA GRUE D'ATELIER (2026-10-20, Léo, entre deux propositions — un piédestal de vitrine, une grue — : « la grue ; du coin plus à gauche,
   là elle est vers la porte, ça fait chelou ; le moteur vers la droite et la grue vers la gauche ; et les moteurs se détruisent et se
   reconstruisent de la même manière que la voiture quand on regarde une pub pour réapparaître »). Remplace l'étal du 19/10 (`?etal=ancien`
   le rend). Une grue d'atelier jaune DE PROFIL dans le coin gauche de la porte : pieds à roulettes, mât à gauche (bagues noires), flèche,
   vérin chromé, baladeuse ; le moteur pend à droite, à la chaîne, au-dessus d'une palette, et tourne doucement ; la plaque est vissée au mât.
   CHANGER DE CRAN = LA RÉSURRECTION DE LA SECONDE CHANCE (seconde-chance.js, RESU) appliquée au moteur : chaque moteur est rangé en
   ÉCLATS (12 boîtes de son volume : gauche/droite × trois étages × avant/arrière, ses maillages PARTAGÉS) ; le moteur en place ÉCLATE (les
   éclats partent en tournant et s'éteignent, une gerbe d'or), puis ceux du suivant apparaissent éparpillés autour du crochet, flottent, et
   reviennent un à un EN TOURBILLON — le bas d'abord —, chacun traînant des étincelles d'or et de néon et claquant en se verrouillant
   (`spin.arret`, une note plus haut à chaque éclat) ; le dernier posé : l'anneau de néon, la gerbe d'or, le chœur du MIRACULÉ. Les étincelles
   ont leur propre petite réserve (la grue vit au garage, où les réserves de la course ne tournent pas). Aucune lumière ajoutée, aucune
   matière neuve (Lambert, Basic, l'inox des moteurs). */
const ETAL_V=/[?&]etal=ancien\b/.test(location.search)?'':'grue';
function vdepEtalCol(E,c){if(E.col){E.col(c);return;}E.fil.material.color.set(c);E.lueur.material.color.set(c);}
const ETAL_X=+((location.search.match(/[?&]etalx=([\d.]+)/)||[])[1]||6.9),ETAL_Z=+((location.search.match(/[?&]etalz=([\d.]+)/)||[])[1]||1.0); /* la grue, dans le coin gauche de la porte (l'étal du 19/10 était à 5,95, contre le montant) ; ?etalx= / ?etalz= pour la régler au banc */
function vdepEclats(h,e){ // range le moteur e (dans son support h, au repos) en éclats : 12 boîtes de son volume, ses maillages partagés
  h.updateMatrixWorld(true);const L=[],bb=new THREE.Box3(),v=new THREE.Vector3();
  e.traverse(function(o){if(o.isMesh&&o.geometry&&o.visible){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const c=v.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld).clone();L.push([o,o.matrixWorld.clone(),c]);bb.expandByPoint(c);}});
  if(!L.length)return null;const dy=Math.max(.01,bb.max.y-bb.min.y),cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2,G=new Map();
  for(const it of L){const c=it[2],k=(c.x<cx?0:1)+2*Math.min(2,Math.floor((c.y-bb.min.y)/dy*3))+6*(c.z<cz?0:1);let g=G.get(k);if(!g)G.set(k,g={L:[],c:new THREE.Vector3(),et:Math.min(2,Math.floor((c.y-bb.min.y)/dy*3))});g.L.push(it);g.c.add(c);}
  h.remove(e);const E=[];
  for(const g of G.values()){g.c.multiplyScalar(1/g.L.length);const grp=new THREE.Group(),Mi=new THREE.Matrix4().makeTranslation(-g.c.x,-g.c.y,-g.c.z);
    for(const it of g.L){const o=it[0],m=new THREE.Mesh(o.geometry,o.material);m.castShadow=o.castShadow;m.receiveShadow=o.receiveShadow;m.renderOrder=o.renderOrder;
      new THREE.Matrix4().multiplyMatrices(Mi,it[1]).decompose(m.position,m.quaternion,m.scale);grp.add(m);}
    grp.position.copy(g.c);h.add(grp);E.push({g:grp,P:g.c.clone(),et:g.et,off:new THREE.Vector3(),q0:new THREE.Quaternion(),d:0,th0:0,ph:0,arr:true,tp:1});}
  return E;}
function vdepEtal2(g,V){
  const t0=performance.now(),hd=GAR.D/2,root=new THREE.Group();root.position.set(ETAL_X,0,hd-ETAL_Z);root.rotation.y=Math.PI;g.add(root);
  const L=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0}),B=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));
  const boite=(sx,sy,sz,mat,x,y,z,par)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);(par||root).add(m);return m;};
  const tige=(a,b,r,mat,seg,par)=>{const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg||10),mat);
    m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(par||root).add(m);return m;};
  const poutre=(a,b,w,mat)=>{const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.BoxGeometry(d.length(),w,w),mat); // une poutre carrée de a à b (dans le plan xy)
    m.position.copy(a).addScaledVector(d,.5);m.rotation.z=Math.atan2(d.y,d.x);root.add(m);return m;};
  const ad={transparent:true,depthWrite:false,blending:THREE.AdditiveBlending};
  let gt=VDEP._gt;if(!gt){const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);gt=VDEP._gt=new THREE.CanvasTexture(cv);}
  const sol=new THREE.Mesh(new THREE.PlaneGeometry(1,1),B(0xffffff,Object.assign({map:gt,opacity:.4},ad)));sol.rotation.x=-Math.PI/2;sol.renderOrder=2;root.add(sol);
  const cone=(r,h,y,op)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.5,1,18,1,true),B(0xfff0d6,Object.assign({opacity:op,side:THREE.FrontSide},ad)));m.scale.set(2*r,h,2*r);m.position.y=y;root.add(m);return m;};
  const plaque=(w,h,x,y,z)=>{const cv=document.createElement('canvas');cv.width=320;cv.height=Math.round(320*h/w);const tx=new THREE.CanvasTexture(cv);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),B(0xffffff,{map:tx}));m.position.set(x,y,z);root.add(m);return {cv:cv,tx:tx};};
  const E={root:root,kind:V,sol:sol,ph:1,t:0,yc:-1};
  // LA GRUE, de profil : le mât à GAUCHE (vers le coin), la flèche au-dessus de la palette, le moteur à DROITE (local −x = le monde +x : la gauche à l'écran)
  const jaune=L(0xf2b318,0x2e2004),noir=L(0x17181f,0x050507),bois=L(0xa8743e,0x1c1006),acier=L(0x5b6170,0x0d0f14),chrome=M9.inox();
  const xM=-.85,xE=.7;
  for(const sz of [-1,1]){boite(2.45,.12,.14,jaune,.27,.16,sz*.5);for(const x of [1.42,1.0])boite(.2,.125,.145,noir,x,.16,sz*.5); // les pieds, rayés au bout
    for(const x of [xM-.02,1.42]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.07,12),noir);r.rotation.x=Math.PI/2;r.position.set(x,.08,sz*.5);root.add(r);}}
  boite(.16,.14,1.14,jaune,xM-.02,.16,0);boite(.36,.3,.36,noir,xM,.3,0);
  boite(.24,3.0,.24,jaune,xM,1.66,0);for(let i=0;i<5;i++)boite(.245,.07,.245,noir,xM,.62+i*.5,0); // le mât et ses bagues
  const P0=new THREE.Vector3(xM,3.05,0),P1=new THREE.Vector3(xE,3.34,0);poutre(P0,P1,.2,jaune);boite(.24,.24,.24,noir,xE,3.34,0);
  tige(new THREE.Vector3(xM,3.05,-.17),new THREE.Vector3(xM,3.05,.17),.07,chrome,10); // l'axe de la flèche
  const A=new THREE.Vector3(xM+.13,1.3,0),Bv=new THREE.Vector3(xM+.85,3.05+.29*.85/1.55-.1,0),Am=A.clone().lerp(Bv,.55);tige(A,Am,.09,noir,10);tige(Am,Bv,.05,chrome,10); // le vérin
  E.cable=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,6),acier);E.cable.position.set(xE,0,0);root.add(E.cable);
  E.croc=new THREE.Group();root.add(E.croc);
  const croc=new THREE.Mesh(new THREE.TorusGeometry(.09,.028,6,12,Math.PI*1.5),chrome);croc.position.y=.11;E.croc.add(croc);
  boite(1.0,.07,.07,chrome,0,0,0,E.croc);
  for(const sx of [-1,1])tige(new THREE.Vector3(sx*.48,0,0),new THREE.Vector3(sx*.3,-.3,0),.018,acier,6,E.croc);
  for(const z of [-.5,0,.5])boite(1.15,.1,.12,bois,xE,.05,z);for(let i=0;i<5;i++)boite(.18,.035,1.24,bois,xE-.48+i*.24,.1175,0); // la palette
  E.rayon=cone(.85,2.9,3.2-2.9/2,.05);E.rayon.position.x=xE;
  const lampe=new THREE.Mesh(new THREE.ConeGeometry(.17,.22,10,1,true),noir);lampe.position.set(xE,3.12,0);root.add(lampe);
  sol.scale.set(3.4,3.4,1);sol.position.set(xE,.012,0);
  E.pl=plaque(.74,.24,xM,1.15,.125);
  // LES ÉTINCELLES de la résurrection (une réserve à elle : 56 sprites, repère de la grue)
  E.sp=[];for(let i=0;i<56;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({map:lampTex,color:0xffd75e,opacity:0,fog:false},ad)));m.visible=false;root.add(m);E.sp.push({m:m,v:new THREE.Vector3(),t:0,T:1,s:.2});}
  E.spI=0;
  const spark=(x,y,z,vx,vy,vz,col,T,s)=>{const p=E.sp[E.spI++%E.sp.length];p.m.position.set(x,y,z);p.v.set(vx,vy,vz);p.t=0;p.T=T;p.s=s;p.m.material.color.set(col);p.m.visible=true;};
  const haut=1.5,bas=.66,top=3.22,vH=new THREE.Vector3(),Ya=new THREE.Vector3(0,1,0),Qi=new THREE.Quaternion();
  const ou=(H,c,o)=>{H.updateMatrix();return o.copy(c.g.position).applyMatrix4(H.matrix);}; // un éclat, dans le repère de la grue
  E.col=function(c){sol.material.color.set(c);};
  E.casse=function(H){ // LE MOTEUR ÉCLATE : chaque éclat part en tournant, s'éteint ; une gerbe d'or
    const C=H.userData.E||[];for(const c of C){const d=vH.copy(c.P).setY(c.P.y-(H.userData.h||1)/2);if(d.lengthSq()<1e-4)d.set(Math.random()-.5,0,Math.random()-.5);if(d.x<0)d.x*=-.4; /* jamais vers le mât (−x) : du côté libre, devant, derrière */
      c.off.copy(d.normalize()).multiplyScalar(1.1+Math.random()*.9).add(vH.set((Math.random()-.5)*.6,.4+Math.random()*.8,(Math.random()-.5)*.6));
      c.q0.setFromAxisAngle(vH.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),Math.PI*(.8+Math.random()));}
    H.updateMatrix();for(let i=0;i<18;i++){const a=Math.random()*6.28;spark(xE,bas+(H.userData.h||1)*.5,0,Math.cos(a)*(2+Math.random()*3),1+Math.random()*3,Math.sin(a)*(2+Math.random()*3),Math.random()<.6?0xffd75e:0xff9a3c,.5+Math.random()*.3,.32);}
    try{if(SONV2)sfx('garage.tole',{vol:-4});}catch(_){}try{hap(10);}catch(_){}};
  E.arrive=function(H){ // LE SUIVANT : ses éclats éparpillés autour du crochet ; le bas revient d'abord
    const C=H.userData.E||[];for(const c of C){const sx=c.P.x<0?-1:1,r=Math.random(); /* éparpillés du côté LIBRE (+x, loin du mât), devant et derrière */
      c.off.set(.35+r*1.15,.3+Math.random()*1.1,sx*(.5+Math.random()*1.0));
      c.q0.setFromAxisAngle(vH.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),Math.PI*(.6+Math.random()));
      c.d=c.et*.16+Math.random()*.14;c.th0=-sx*(.45+Math.random()*.5);c.ph=Math.random()*6.28;c.arr=false;c.tp=0;c.g.scale.setScalar(.001);}
    C.sort(function(a,b){return a.d-b.d;});E.n=0;E.tSon=0;try{if(SONV2)sfx('pwr.a',{vol:-8});}catch(_){}};
  E.tick=function(dt,t9,n){
    if(n!==VDEP.nVu&&E.ph===1){E.ph=-1;E.t=0;E.casse(VDEP.m[VDEP.nVu]);}
    let H=VDEP.m[VDEP.nVu];
    if(E.ph===-1){E.t+=dt;const u=Math.min(1,E.t/.5),e=1-Math.pow(1-u,2);
      for(const c of H.userData.E||[]){c.g.position.copy(c.P).addScaledVector(c.off,e);c.g.quaternion.copy(Qi).slerp(c.q0,e);c.g.scale.setScalar(Math.max(.001,1-u*u));
        if(Math.random()<dt*14){ou(H,c,vH);spark(vH.x,vH.y,vH.z,(Math.random()-.5),.5+Math.random(),(Math.random()-.5),Math.random()<.5?0xffd75e:0x5ee6ff,.35,.2);}}
      if(u>=1){for(const c of H.userData.E||[]){c.g.position.copy(c.P);c.g.quaternion.identity();c.g.scale.setScalar(1);}H.visible=false;
        VDEP.nVu=n;H=VDEP.m[n];H.visible=true;H.position.set(xE,bas,0);E.arrive(H);E.ph=0;E.t=0;vdepPlaque(n);vdepEtalCol(E,vdepCol(n));}}
    else if(E.ph===0){const t=(E.t+=dt),C=H.userData.E||[],T0=.3,Tv=.62;H.updateMatrix();
      const ap=Math.min(1,t/.22),sa=ap>=1?1:1+2.70158*Math.pow(ap-1,3)+1.70158*Math.pow(ap-1,2); // l'apparition : easeOutBack
      for(const c of C){const g=c.g,u=Math.max(0,Math.min(1,(t-T0-c.d)/Tv)),e=u*u*(2.2-1.2*u),k=Math.max(0,1-e),th=c.th0*Math.pow(k,1.5);
        vH.copy(c.off).applyAxisAngle(Ya,th).multiplyScalar(k);vH.y+=.1*Math.sin(t*5+c.ph)*k;g.position.copy(c.P).add(vH);g.quaternion.copy(c.q0).slerp(Qi,e);
        let s=sa;
        if(u>=1){if(!c.arr){c.arr=true;E.n++;ou(H,c,vH);for(let i=0;i<6;i++)spark(vH.x,vH.y,vH.z,(Math.random()-.5)*3,Math.random()*2.5,(Math.random()-.5)*3,0xffd75e,.4,.22);
            const n9=performance.now();if(n9-E.tSon>55){E.tSon=n9;try{if(SONV2)sfx('spin.arret',{st:sonPd(Math.min(E.n-1,9)),vol:-12});}catch(_){}}}
          c.tp+=dt;s=1+.14*Math.max(0,1-c.tp/.16);}
        else if(u>0&&Math.random()<dt*22){ou(H,c,vH);spark(vH.x,vH.y,vH.z,(Math.random()-.5)*.8,Math.random()*.8,(Math.random()-.5)*.8,Math.random()<.55?0xffd75e:0x5ee6ff,.35,.18);}
        g.scale.setScalar(s);}
      if(t<1.4&&Math.random()<dt*24){const a=t*9+Math.random()*.4,rr=1.5*(1-t/1.4)+.5; // le tourbillon : des étincelles cyan qui montent en hélice autour du moteur
        spark(xE+Math.cos(a)*rr,bas+.1+1.6*t/1.4,Math.sin(a)*rr,-Math.sin(a)*1.5,1.2,Math.cos(a)*1.5,0x5ee6ff,.45,.2);}
      if(E.n>=C.length&&t>.9){E.ph=1; // le dernier posé : l'anneau de néon, la gerbe d'or, le chœur
        for(let i=0;i<24;i++){const a=i/24*6.28;spark(xE+Math.cos(a)*.5,bas+.2,Math.sin(a)*.5,Math.cos(a)*4,.2,Math.sin(a)*4,0xff3ec8,.5,.24);}
        for(let i=0;i<20;i++)spark(xE,bas+(H.userData.h||1)*.6,0,(Math.random()-.5)*5,1.5+Math.random()*4,(Math.random()-.5)*5,0xffd75e,.6,.3);
        try{if(SONV2)sfx('jeu.miracule',{vol:-12});}catch(_){}try{hap([10,30,16]);}catch(_){}}}
    // LA GRUE SUIT : le moteur tourne et se balance au bout de la chaîne ; le crochet et le câble suivent son haut
    H.position.set(xE,bas,0);H.rotation.y+=dt*.22;H.rotation.z=Math.sin(t9*.9)*.025;
    const yc9=bas+(H.userData.h||1)+.3;E.yc=E.yc<0?yc9:E.yc+(yc9-E.yc)*Math.min(1,dt*4);
    E.croc.position.set(xE,E.yc,0);E.croc.rotation.y=H.rotation.y;E.cable.position.y=(top+E.yc+.12)/2;E.cable.scale.y=Math.max(.01,top-(E.yc+.12));
    sol.material.opacity=.3+.07*Math.sin(t9*2.1);E.rayon.material.opacity=.04+.01*Math.sin(t9*1.3);
    for(const p of E.sp){if(!p.m.visible)continue;p.t+=dt;if(p.t>=p.T){p.m.visible=false;continue;}const f=1-p.t/p.T;
      p.v.y-=2.2*dt;p.m.position.addScaledVector(p.v,dt);p.m.material.opacity=f;p.m.scale.setScalar(p.s*(.5+.5*f));}};
  const bx=new THREE.Box3(),sz=new THREE.Vector3(),ce=new THREE.Vector3();
  for(let i=0;i<VDEP_PAL.length;i++){const e=mkEngine(VDEP_PAL[i]),h=new THREE.Group();h.add(e);
    bx.setFromObject(e);bx.getSize(sz);bx.getCenter(ce);const k=haut/Math.max(.01,sz.x,sz.y,sz.z);e.scale.multiplyScalar(k);e.position.set(-ce.x*k,-ce.y*k+sz.y*k/2,-ce.z*k);
    h.userData.h=sz.y*k;try{h.userData.E=vdepEclats(h,e);}catch(err){console.warn('éclats',err);}h.visible=false;root.add(h);VDEP.m.push(h);}
  VDEP.etal=E;VDEP.nVu=-1;VDEP.k=0;VDEP.ph=1;
  vdepEtalTick(1/60,0);VDEP.ms=+(performance.now()-t0).toFixed(1);}
window.dbgVdep=function(n){
  if(n==='tout'||n==='rien'){VDEP_TOUT=n==='tout';vdepMaj();return {tout:VDEP_TOUT};}
  if(n!=null){SAVE.d.vdep=Math.max(0,Math.min(5,n|0));vdepMaj();}
  return {cran:vdepN()+1,sauve:(SAVE.d.vdep|0)+1,palierDepart:vdepPal()+1,moteur:vdepNom(vdepN()),record:((SAVE.d.ex&&SAVE.d.ex.eng)|0)+1,
    fonction:vdepFonction(),ouverts:VDEP_PAL.map(function(p,i){return vdepOuvert(i);}),etal:!!VDEP.etal,msEtal:VDEP.ms,engTier:engTier,grille:!!(VDEP.el&&VDEP.el.classList.contains('vu')),
    tag:!!(VDEP.tag&&VDEP.tag.classList.contains('vu')),tagAccueil:!!(VDEP.mtag&&VDEP.mtag.classList.contains('vu'))};};
Object.assign(I18N,{'ATTEINS LE PALIER 30':'REACH TIER 30','VITESSE DE DÉPART DÉBLOQUÉE':'START GEAR UNLOCKED','VERROUILLÉE':'LOCKED'});
/* (2026-09-30) UNE BOÎTE CHANFREINÉE à la vraie taille w × h × d, chanfrein b : 6 faces, 12 biseaux, 8 coins (44 triangles), non indexée
   (facettes franches, comme la caisse). NEUVE à chaque appel : les meubles du garage la versent dans leur kit (lpKit.put la déplace EN
   PLACE puis la libère — une géométrie gardée en cache en sortirait déformée). */
function chanfreinGeo(w,h,d,b){
  const X=w/2,Y=h/2,Z=d/2,pos=[];
  const V=(sx,sy,sz,t)=>t===0?[sx*X,sy*(Y-b),sz*(Z-b)]:t===1?[sx*(X-b),sy*Y,sz*(Z-b)]:[sx*(X-b),sy*(Y-b),sz*Z];
  const face=(P,n)=>{const a=P[0],c1=P[1],c2=P[2],ux=c1[0]-a[0],uy=c1[1]-a[1],uz=c1[2]-a[2],vx=c2[0]-a[0],vy=c2[1]-a[1],vz=c2[2]-a[2];
    const Q=((uy*vz-uz*vy)*n[0]+(uz*vx-ux*vz)*n[1]+(ux*vy-uy*vx)*n[2])<0?P.slice().reverse():P; // l'ordre qui regarde DEHORS
    for(let i=1;i<Q.length-1;i++)pos.push(Q[0][0],Q[0][1],Q[0][2],Q[i][0],Q[i][1],Q[i][2],Q[i+1][0],Q[i+1][1],Q[i+1][2]);};
  for(const s of [-1,1]){
    face([V(s,-1,-1,0),V(s,1,-1,0),V(s,1,1,0),V(s,-1,1,0)],[s,0,0]);
    face([V(-1,s,-1,1),V(1,s,-1,1),V(1,s,1,1),V(-1,s,1,1)],[0,s,0]);
    face([V(-1,-1,s,2),V(1,-1,s,2),V(1,1,s,2),V(-1,1,s,2)],[0,0,s]);}
  for(const sx of [-1,1])for(const sy of [-1,1])face([V(sx,sy,-1,0),V(sx,sy,1,0),V(sx,sy,1,1),V(sx,sy,-1,1)],[sx,sy,0]);   // biseaux le long de z
  for(const sx of [-1,1])for(const sz of [-1,1])face([V(sx,-1,sz,0),V(sx,1,sz,0),V(sx,1,sz,2),V(sx,-1,sz,2)],[sx,0,sz]);   // le long de y
  for(const sy of [-1,1])for(const sz of [-1,1])face([V(-1,sy,sz,1),V(1,sy,sz,1),V(1,sy,sz,2),V(-1,sy,sz,2)],[0,sy,sz]);   // le long de x
  for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1])face([V(sx,sy,sz,0),V(sx,sy,sz,1),V(sx,sy,sz,2)],[sx,sy,sz]); // les coins
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));return g;
}
