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
  'LES CHAMPS-ELYSEES':'THE CHAMPS-ELYSEES','HEURE DOREE':'GOLDEN HOUR','LA SEINE':'THE SEINE','LA NUIT':'NIGHT','FROTTE !':'SCRAPE!',
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
try{Object.assign(I18N,{'LA LAVE NE PARDONNE PAS':'THE LAVA SHOWS NO MERCY','LA LAVE EST LA SEULE LUMIERE':'THE LAVA IS THE ONLY LIGHT', // (2026-10-14) LE ROYAUME DE FEU
  'ENGLOUTI PAR LA LAVE':'SWALLOWED BY THE LAVA','ECRASE SUR LA ROCHE':'SMASHED ON THE ROCK'});}catch(e){}
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
  setInterval(function(){try{ // (la grille et les étiquettes suivent leurs boutons ; un record de moteur, la langue : les crans se redisent)
    const sg=((SAVE.d.ex&&SAVE.d.ex.eng)|0)+','+(SAVE.d.vdep|0)+','+VDEP_TOUT+','+(typeof LANG!=='undefined'?LANG:'');
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
    const J=$('gJouer'),R=[$('gvCof'),$('gvMis'),$('gShopBas')].filter(vdepVu);
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
/* ===== L'ARGENT DE L'ATELIER (2026-10-01, Sacha : « plus on gagne d'argent, plus il doit y avoir des tas de billets sur le sol du garage,
   un peu placés partout dans le garage, sur les meubles et tout ») =====
   Le COMPTE (bank()) se voit : des liasses VERTES (tranche vert-de-gris, face vert billet, bande kraft) en TAS bas dans le couloir de
   la caméra (33 cm : sous les 45 cm de la règle des 8,3 m), en GROS TAS au pied des murs, en piles sur les meubles (fûts, distributeur,
   étagères du rack, servante, établi), et — quand on devient riche — en PALETTES contre les murs, loin de l'orbite. Rien entre la
   caméra et la caisse (c'est la vedette), rien dans l'allée de la porte (elle sort par là), rien de haut devant l'affiche du record.
   · TOUT EST BÂTI UNE FOIS (à la 1re visite, avec l'atelier) dans UN seul mesh en couleurs de sommets, dans la matière MATE des meubles
     (le même programme : zéro programme de plus). Les objets sont rangés dans l'ORDRE où ils apparaissent ; le compte règle seulement
     combien on en dessine (`setDrawRange`) — gagner, dépenser : rien ne se reconstruit, une comparaison par image.
   · L'ORDRE : chaque place s'ouvre à un seuil (`a`), puis c'est la place la MOINS remplie qui reçoit l'objet suivant — les tas montent
     ensemble, du bas vers le haut (jamais une liasse en l'air) ; une palette qui s'ouvre avale d'un coup ce qui tombe, puis tout
     repart ensemble. Les places VUES de la caméra (fixe, côté établi, qui regarde la porte) passent d'abord.
   · LA COURBE : n = 12 × (compte / 50)^0,4 — 100 $ → 16 objets, 1 k → 40, 10 k → 100, 100 k → 250, 1 M → 630, 2,5 M (la plus chère de
     la boutique) → 910 ; ~1 100 au plus (six palettes pleines). Dépenser fait donc FONDRE les tas : l'argent part de l'atelier.
   `dbgArgent(compte)` force un compte (sans toucher la sauvegarde) · `dbgArgent()` rend l'état · `dbgArgent(null)` relâche. */
const GARG={mesh:null,offs:null,n:-1,bank:-1,force:null,K:12,E:.4,places:0};
function garArgentN(b){return Math.max(0,Math.round(GARG.K*Math.pow(Math.max(0,b||0)/50,GARG.E)));}
function garArgentMaj(){
  if(!GARG.mesh)return;const b=GARG.force!=null?GARG.force:bank();if(b===GARG.bank)return;GARG.bank=b;
  const n=Math.min(GARG.offs.length-1,garArgentN(b));if(n===GARG.n)return;GARG.n=n;
  GARG.mesh.geometry.setDrawRange(0,GARG.offs[n]);GARG.mesh.visible=n>0;
}
function garArgent(g){
  const t00=performance.now(),T0=new THREE.BoxGeometry(1,1,1).toNonIndexed(),TP=T0.attributes.position.array;T0.dispose(); // le cube unité, 36 sommets
  const P=[],C=[],M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E9=new THREE.Euler(0,0,0,'YXZ'),V=new THREE.Vector3(),S=new THREE.Vector3(),co=new THREE.Color();
  let sd=0x5eed51;const rn=()=>{sd=(sd+0x6D2B79F5)|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;}; // à part : le rnd du jeu n'est pas touché
  const e=M.elements;
  // une boîte : taille (w,h,d), CENTRE (x,y,z), cap/tangage/roulis — une couleur, un grain de ±5 % (du papier, pas du plastique)
  const bx=(w,h,d,x,y,z,ry,rx,rz,hex,gr)=>{E9.set(rx||0,ry||0,rz||0);Q.setFromEuler(E9);M.compose(V.set(x,y,z),Q,S.set(w,h,d));
    co.setHex(hex);const k=1+((gr==null?rn():gr)-.5)*.1;
    for(let i=0;i<108;i+=3){const a=TP[i],b=TP[i+1],c=TP[i+2];
      P.push(e[0]*a+e[4]*b+e[8]*c+e[12],e[1]*a+e[5]*b+e[9]*c+e[13],e[2]*a+e[6]*b+e[10]*c+e[14]);C.push(co.r*k,co.g*k,co.b*k);}};
  /* LA LIASSE (v2, après capture : des bandes or / rose / cyan et une tranche crème se lisaient comme des CONFETTIS) : tout est VERT
     BILLET, sombre (SON règle la clé de la boutique : pas de fluo) — tranche vert-de-gris, face vert foncé, bande papier kraft doré
     éteint ; et plus grosse (×3,2 d'une vraie liasse : de la caméra, à 10 m, une vraie serait une miette). */
  const BAND=[0xbfa25c,0xbfa25c,0xa9884a],FACE=[0x28683c,0x245e37,0x2e7545],TRANCHE=0x668f62;
  const LL=.5,LT=.11,LW=.24;
  const liasse=(x,y,z,ry,rx,rz)=>{const u=rn(),f=FACE[(u*3)|0],b=BAND[(rn()*BAND.length)|0],c=Math.cos(ry),s=Math.sin(ry);
    const at=(lx,ly,lz)=>[x+c*lx+s*lz,y+ly,z-s*lx+c*lz]; // (tangage/roulis petits : la hauteur des pièces est prise au centre)
    let q=at(0,.048,0);bx(LL-.014,.096,LW-.014,q[0],q[1],q[2],ry,rx,rz,TRANCHE,u);   // la tranche : la pile de billets vue de côté
    q=at(0,.103,0);bx(LL,.014,LW,q[0],q[1],q[2],ry,rx,rz,f,u);                       // la face du billet du dessus
    q=at(0,.055,0);bx(.09,LT+.004,LW+.01,q[0],q[1],q[2],ry,rx,rz,b,u);};             // la bande
  const billet=(x,z,ry)=>bx(.24,.005,.11,x,.004,z,ry,(rn()-.5)*.06,(rn()-.5)*.06,0x3a8f55);
  const palette=(x,z,ry)=>{const c=Math.cos(ry),s=Math.sin(ry),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
    for(const lz of [-.4,0,.4]){const q=at(0,lz);bx(1.12,.02,.12,q[0],.01,q[1],ry,0,0,0x6e4d2c);}
    for(const lx of [-.5,0,.5])for(const lz of [-.4,0,.4]){const q=at(lx,lz);bx(.12,.085,.12,q[0],.0625,q[1],ry,0,0,0x5f4226);}
    for(const lz of [-.39,-.195,0,.195,.39]){const q=at(0,lz);bx(1.12,.022,.14,q[0],.116,q[1],ry,0,0,0x86603a);}};
  /* ---- OÙ POSER : les meubles (rectangles de leurs ombres au sol, les mêmes que `F9`), le bazar du couloir, l'allée et la PORTE (la
     caisse sort par là), l'affiche du record (rien de haut devant), et rien ENTRE la caméra et la caisse (SON : « elle est la vedette ») ---- */
  const zB=-GAR.D/2+.9,RECT=[[-3,zB,9.8,1.5],[-9.4,-1.6,.8,1.5],[-9.5,2.6,.9,2.1],[-9.6,-7.2,.8,.8],[-9.6,-5.1,.8,.8],[-9.4,7.4,.8,.8],[-8.9,5.6,.7,.7],
     [-9.9,-9.4,1.2,1.0],[7.7,-6.4,3.4,1.8],[9.0,-2.2,1.9,1.2],[9.6,3.4,1.5,4.4],[10.3,8.4,.9,1.5],[-5.6,10.4,3.2,1.0],[9.9,-10.3,1.2,4.0],
     [-8.2,-5.4,.6,1.4],[-8.6,1.2,.5,1.5],[7.6,-4.2,.6,.6],[-8.16,9.2,1.3,.3],[-3.35,10.4,1.1,.9]];
  const ROND=[[5.9,3.3,.45],[6.5,2.62,.45],[-5.4,-5.6,.45],[-5.6,4.4,.5],[6.79,-3.48,.4],[7.2,1.4,.4],[-6.4,-2.6,.55],[5.2,5.6,.3],
     [-4.4,6.5,.4],[-3.6,6.2,.35],[-1.6,-6.4,.65],[4.6,-5.2,1.1],[-6.2,2.2,1.2],[-8.2,-3.6,.25],[-8.7,-3.0,.25],[5.8,-6.4,.9]];
  for(let i=0;i<9;i++){const a=1.1+i*.42,r9=5.4+((i*7)%5)*.5;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.2]);}      // la rallonge
  for(let i=0;i<7;i++){const a=i*2.4,r9=5.2+((i*3)%5)*.6;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.25]);}         // les clés semées
  const PAL=[[9.6,11.0,0],[-9.6,11.3,0],[-9.6,4.45,Math.PI/2],[9.7,-.2,Math.PI/2],[4.2,-11.5,0],[-9.4,-11.4,0]];
  for(const p9 of PAL)RECT.push([p9[0],p9[1],p9[2]?.92:1.12,p9[2]?1.12:.92]);
  const libre=(x,z,m)=>{if(Math.abs(x)>GAR.W/2-.7||Math.abs(z)>GAR.D/2-.7)return false;
    if(Math.abs(x)<2.4+m&&z>3)return false;                              // l'allée de la porte : la caisse sort par là (sa largeur + le tas)
    if(z>9.9&&x>4.4&&x<7.6)return false;                                 // (2026-10-19) l'ÉTAL du moteur, au mur de la porte (à gauche)
    if(z>11.2&&x<-4.9&&x>-8.2)return false;                              // l'affiche du record, au mur de la porte (passée à droite)
    if(z<-4.2&&Math.abs(x)<4.6)return false;                             // entre la caméra (côté établi) et la caisse : rien
    for(const r of RECT)if(Math.abs(x-r[0])<r[2]/2+m&&Math.abs(z-r[1])<r[3]/2+m)return false;
    for(const o of ROND)if(Math.hypot(x-o[0],z-o[1])<o[2]+m)return false;return true;};
  // l'ordre de ce que la caméra VOIT : elle est fixe côté établi (≈ 0, 3, −10,5) et regarde la caisse — puis la porte derrière elle
  const cam=new THREE.Vector3(0,3,-10.5),fw=new THREE.Vector3(0,.8,0).sub(cam).normalize(),vu=(x,z)=>{V.set(x,.2,z).sub(cam).normalize();return Math.acos(Math.max(-1,Math.min(1,V.dot(fw))));};
  const choisir=(r0,r1,m,ecart,nb,deja)=>{const cand=[];
    for(let x=-10;x<=10;x+=.5)for(let z=-12;z<=12;z+=.5){const r=Math.hypot(x,z);if(r<r0||r>r1||!libre(x,z,m))continue;cand.push([x,z,vu(x,z)]);}
    cand.sort((a,b)=>a[2]-b[2]);const pris=[];
    for(const c of cand){if(pris.length>=nb)break;if(pris.concat(deja).every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>=ecart))pris.push(c);}
    return pris;};
  // un TAS : des couches qui rétrécissent, de travers, et quelques billets échappés autour
  const tas=(x0,z0,couches)=>{const it=[];let y=0;
    const vole=()=>{const a=rn()*6.2832,d=.7+rn()*.45;it.push(()=>billet(x0+Math.cos(a)*d,z0+Math.sin(a)*d,rn()*6.2832));};
    couches.forEach((cc,l)=>{const n=cc[0],R=cc[1],y9=y,tilt=l?.12:.04,pts=[];
      for(let k=0;k<80&&pts.length<n;k++){const a=rn()*6.2832,d=Math.sqrt(rn())*R,px=x0+Math.cos(a)*d,pz=z0+Math.sin(a)*d;
        if(pts.every(q=>Math.hypot(q[0]-px,q[1]-pz)>.27))pts.push([px,pz]);}
      for(const q of pts)it.push(()=>liasse(q[0],y9,q[1],rn()*6.2832,(rn()-.5)*tilt,(rn()-.5)*tilt));
      vole();y+=LT*.96;});
    return {it:it,a:0};};
  // LES TAS BAS du couloir de la caméra (3 couches : 33 cm, sous les 45 cm de la règle) — puis LES GROS TAS au pied des murs (5 couches)
  const bas=choisir(5.1,8.1,.72,1.7,10,[]),gros=choisir(8.4,11.2,1.0,2.2,7,bas);
  const TB=bas.map(c=>tas(c[0],c[1],[[6,.55],[4,.4],[2,.22]])),TG=gros.map(c=>tas(c[0],c[1],[[9,.8],[7,.62],[5,.46],[3,.3],[1,.08]]));
  // LES MEUBLES : des piles bien rangées sur ce qui est plat (colonnes [dx, dz], couches)
  const pile=(x,y,z,ry,cols,couches)=>{const it=[];for(let l=0;l<couches;l++)for(const c9 of cols)
      it.push(()=>liasse(x+c9[0]+(rn()-.5)*.02,y+l*LT,z+c9[1]+(rn()-.5)*.02,ry+(rn()-.5)*.08,0,0));return {it:it,a:0};};
  const M9=[pile(-6.6,1.0,10.42,.35,[[0,0]],3),                               // sur les fûts
    pile(10.3,2.13,8.4,Math.PI/2,[[0,-.27],[0,.27]],4),                        // sur le distributeur
    pile(9.6,.57,2.93,0,[[0,0]],3),pile(9.6,1.72,3.8,0,[[0,0]],3),            // les étagères du rack (places libres entre bacs, cartons, jantes)
    pile(-4.6,1.0,10.42,-.3,[[0,0]],3),pile(-9.4,1.26,-1.6,Math.PI/2,[[0,-.36],[0,.36]],4), // l'autre fût · la servante
    pile(9.6,2.87,3.25,0,[[0,0]],3),pile(9.6,.57,5.2,0,[[0,0]],3),
    pile(-3.1,.98,-11.95,0,[[-.27,0],[.27,0]],5),pile(.95,.98,-11.95,0,[[-.27,0],[.27,0]],4),pile(-7.45,.98,-11.95,Math.PI/2,[[0,0]],4), // l'établi (derrière la caméra)
    pile(9.6,1.72,5.2,0,[[0,0]],3),pile(9.6,2.87,1.55,0,[[0,0]],3),pile(9.6,4.02,3.55,0,[[0,0]],2)];
  // LES PALETTES (riche) : contre les murs, au-delà de l'orbite — 1 palette + 10 couches de 8 liasses (1,23 m)
  const pal=(x,z,ry)=>{const it=[()=>palette(x,z,ry)],c=Math.cos(ry),s=Math.sin(ry);
    for(let l=0;l<10;l++)for(let j=0;j<4;j++)for(let i=0;i<2;i++){const lx=(i-.5)*.505+(rn()-.5)*.012,lz=(j-1.5)*.232+(rn()-.5)*.012;
      it.push(()=>liasse(x+c*lx+s*lz,.127+l*LT,z-s*lx+c*lz,ry+(rn()-.5)*.03,0,0));}
    return {it:it,a:0};};
  const P9=PAL.map(p9=>pal(p9[0],p9[1],p9[2]));
  // les seuils d'ouverture : tas bas et meubles entremêlés (ce qu'on voit d'abord), les gros tas, puis les palettes quand on devient riche
  const ord=[],A1=[0,1,3,6,8,11,14,17,21,25,29,33,38,43,48,54,60,66,72,80,88,96,104,112];
  for(let i=0,ti=0,mi=0;ti<TB.length||mi<M9.length;i++){const p9=(i%2===0&&ti<TB.length)||mi>=M9.length?TB[ti++]:M9[mi++];p9.a=A1[Math.min(i,A1.length-1)]+Math.max(0,i-A1.length+1)*8;ord.push(p9);}
  TG.forEach((p9,i)=>{p9.a=70+i*28;ord.push(p9);});
  const A2=[160,240,340,460,600,760];P9.forEach((p9,i)=>{p9.a=A2[i];ord.push(p9);});
  // ---- LA FILE : à chaque pas, la place ouverte la MOINS remplie reçoit l'objet suivant ----
  const offs=[0],fait=ord.map(()=>0);
  for(let n=0;;n++){let best=-1,bf=2;
    for(let k=0;k<ord.length;k++){const p9=ord[k];if(p9.a>n||fait[k]>=p9.it.length)continue;const f=fait[k]/p9.it.length;if(f<bf){bf=f;best=k;}}
    if(best<0){if(ord.every((p9,k)=>fait[k]>=p9.it.length))break;offs.push(P.length/3);continue;} // un seuil pas encore atteint : l'objet n (rien de neuf)
    ord[best].it[fait[best]++]();offs.push(P.length/3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  geo.computeVertexNormals();lpOmbre(geo,.6); // l'ombre cuite au pied des tas (celle des meubles)
  let mt=null;for(const m9 of GAR.meubles||[])if(m9.material&&m9.material.userData&&m9.material.userData.g==='m'){mt=m9.material;break;}
  if(!mt){mt=lpMat('m');if(!mt.envMap){mt.envMap=envTex;mt.combine=THREE.MixOperation;mt.reflectivity=0;}}
  const me=new THREE.Mesh(geo,mt);me.matrixAutoUpdate=false;me.updateMatrix();me.visible=false;g.add(me);
  GARG.mesh=me;GARG.offs=offs;GARG.n=-1;GARG.bank=-1;GARG.places=ord.length;GARG.ms=Math.round(performance.now()-t00);GARG.pos={bas:bas.map(c=>[c[0],c[1]]),gros:gros.map(c=>[c[0],c[1]])};garArgentMaj();
}
function buildGarageRoom(){
  const W=GAR.W,D=GAR.D,H=GAR.H,hw=W/2,hd=D/2;
  const g=new THREE.Group();g.visible=false;scene.add(g);GAR.root=g;
  // --- les SIX géométries : tout l'atelier est bâti par mise à l'échelle
  const BX=new THREE.BoxGeometry(1,1,1),CY=new THREE.CylinderGeometry(.5,.5,1,14),
        CY8=new THREE.CylinderGeometry(.5,.5,1,7),TOR=new THREE.TorusGeometry(.34,.16,7,16),
        CN=new THREE.ConeGeometry(.5,1,12),PL=new THREE.PlaneGeometry(1,1);
  const L=(c,e,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,emissive:e===undefined?0:e,flatShading:true,fog:false},o||{}));
  const BA=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));
  // La PALETTE : béton froid, ferraille bleu nuit, et quatre couleurs franches (rouge servante,
  // jaune sécurité, bleu fût, orange palan) qui suffisent à faire lire « atelier » d'un coup d'œil.
  const M={
    sol   :L(0xffffff,0x090b10,{flatShading:false}),
    mur   :L(0x3c4557,0x1b212f), bas:L(0x1c2433,0x0e1422), toit:L(0x101319,0x0a0f1a), /* (garage-lumiere) émissifs remontés : on lit les murs */
    fer   :L(0x232a38,0x070910), acier:L(0x6b7688,0x101319), chrome:L(0xc2cbd8,0x171b21),
    noir  :L(0x15181f,0x040609), pneu:L(0x1a1c21,0x050608),
    rouge :L(0xd53c2f,0x2e0906), bleu:L(0x2f6cb8,0x0a1526), vert:L(0x2f9e63,0x092312),
    jaune :L(0xefb52a,0x2e2005), orange:L(0xe8721f,0x2c1105),
    bois  :L(0x8a6237,0x1a1108), carton:L(0xb08b5a,0x1c150c), beige:L(0xbfb49a,0x1d1b15),
    verre :L(0x1b3550,0x0a1a2c,{transparent:true,opacity:.55})
  };
  const add9=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;};
  const bx=(x,y,z,w,h,d,mat)=>add9(BX,mat,x,y,z,w,h,d);
  const cy=(x,y,z,r,h,mat)=>add9(CY,mat,x,y,z,r*2,h,r*2);
  const cvT=(w,h,f)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;f(cv.getContext('2d'),w,h);return new THREE.CanvasTexture(cv);};

  // ===== LES TEXTURES PEINTES : sept canvas, et le décor cesse d'être un tas de cubes nus =====
  /* (2026-09-30, L'ATELIER v2) LE SOL : un ÉPOXY sombre en grandes dalles de 2,2 m (joint noir + arête claire), moucheté, deux ou trois traces
     de pneus — et BRILLANT (Phong) : les deux lampes qui suivent la caméra y courent en reflets. L'ancien béton tacheté, mat, faisait de la
     moitié basse de l'écran du menu un aplat bleu nuit. */
  const solTex=cvT(512,512,(x,w,h)=>{const T9=128;
    x.fillStyle='#1c2029';x.fillRect(0,0,w,h);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const l=(Math.random()*8-4)|0;x.fillStyle='rgb('+(30+l)+','+(35+l)+','+(46+l)+')';x.fillRect(i*T9+2,j*T9+2,T9-4,T9-4);}
    for(let i=0;i<9000;i++){const a=(Math.random()*.09).toFixed(3);x.fillStyle=(Math.random()<.5?'rgba(0,0,0,':'rgba(190,210,255,')+a+')';
      x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.4,1+Math.random()*1.4);}
    x.fillStyle='rgba(3,5,9,.9)';for(let i=0;i<=4;i++){x.fillRect(i*T9-2,0,3,h);x.fillRect(0,i*T9-2,w,3);}          // le joint
    x.fillStyle='rgba(130,155,205,.13)';for(let i=0;i<4;i++){x.fillRect(i*T9+1,0,1,h);x.fillRect(0,i*T9+1,w,1);}    // l'arête qui accroche la lumière
    x.lineWidth=7;for(let k=0;k<3;k++){x.strokeStyle='rgba(0,0,0,'+(.1+Math.random()*.1).toFixed(2)+')';x.beginPath();
      x.arc(Math.random()*w,Math.random()*h,70+Math.random()*140,Math.random()*6,Math.random()*6+1.3);x.stroke();}   // traces de gomme
  });
  solTex.wrapS=solTex.wrapT=THREE.RepeatWrapping;solTex.repeat.set(W/8.8,D/8.8);solTex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  M.sol=new THREE.MeshPhongMaterial({color:0xffffff,map:solTex,specular:0x2c3850,shininess:90,emissive:0x0a1020,fog:false});
  // LES MURS : un bardage de panneaux de 2,6 m (nervures, joint, rivets, lisse) avec la lumière du plafond cuite (clair en haut, sombre
  // en bas) — une matière par mur, parce que la répétition d'une texture est une propriété de la TEXTURE (et les murs n'ont pas la même largeur)
  const murTexB=cvT(128,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#566279');gr.addColorStop(.45,'#3c465a');gr.addColorStop(1,'#252c3a');
    x.fillStyle=gr;x.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){const xx=8+i*15;x.fillStyle='rgba(255,255,255,.07)';x.fillRect(xx,0,3,h);x.fillStyle='rgba(0,0,0,.16)';x.fillRect(xx+3,0,3,h);}
    x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,3,h);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(3,0,1,h);
    x.fillStyle='rgba(0,0,0,.35)';for(let j=6;j<h;j+=24)x.fillRect(5,j,2,2);
    x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,h*.5,w,2);x.fillStyle='rgba(255,255,255,.06)';x.fillRect(0,h*.5+2,w,1);});
  const murM=(rx,ry,oy)=>{const t=murTexB.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(rx,ry||1);t.offset.y=oy||0;return L(0xffffff,0x1b212f,{map:t});};
  const pegTex=cvT(64,64,(x,w,h)=>{ // le panneau perforé de l'établi
    x.fillStyle='#414c60';x.fillRect(0,0,w,h);x.fillStyle='#141a26';
    for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(i*8+4,j*8+4,1.6,0,7);x.fill();}
  });
  pegTex.wrapS=pegTex.wrapT=THREE.RepeatWrapping;pegTex.repeat.set(11,4);
  const blobTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,62); // (vague 2) blanc : la matière la teinte à l'ENCRE (plus bas)
    gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(.5,'rgba(255,255,255,.34)');gr.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=gr;x.fillRect(0,0,128,128);});
  const oilTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,60);
    gr.addColorStop(0,'rgba(9,7,13,.85)');gr.addColorStop(.6,'rgba(22,16,28,.45)');gr.addColorStop(1,'rgba(24,18,30,0)');
    x.fillStyle=gr;x.fillRect(0,0,128,128);});
  const vendTex=cvT(64,96,(x,w,h)=>{ // la façade du distributeur : elle éclaire son coin toute seule
    x.fillStyle='#07172a';x.fillRect(0,0,w,h);
    const cols=['#ff3b6b','#ffb020','#3ee08a','#4ab8ff','#ff6adf'];
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.fillStyle=cols[(r*3+c)%5];x.fillRect(5+c*14,8+r*21,10,16);}
    x.fillStyle='rgba(180,230,255,.14)';x.fillRect(0,0,w,h);
  });
  const postTex=cvT(128,96,(x,w,h)=>{ // l'affiche : damier + le logo maison
    for(let i=0;i<8;i++)for(let j=0;j<3;j++){x.fillStyle=((i+j)&1)?'#e9eef7':'#131a27';x.fillRect(i*16,j*9,16,9);}
    x.fillStyle='#0d1220';x.fillRect(0,27,w,h-27);
    x.textAlign='center';x.font="bold 15px 'Press Start 2P',monospace";
    x.fillStyle='#ffcf3d';x.fillText('CASH',w/2,56);x.fillStyle='#5ff0ff';x.fillText('CAR',w/2,78);
  });
  // NÉON : lettres cernées de couleur, cœur blanc — le bloom du jeu fait le halo tout seul
  const neonTex=(txt,col,px)=>cvT(256,80,(x,w,h)=>{
    x.textAlign='center';x.textBaseline='middle';x.font='bold '+px+"px 'Press Start 2P',monospace";
    x.shadowColor=col;x.shadowBlur=px*.9;x.strokeStyle=col;x.lineWidth=px*.22;x.lineJoin='round';
    for(let i=0;i<3;i++)x.strokeText(txt,w/2,h/2);
    x.shadowBlur=px*.35;x.fillStyle='#ffffff';x.fillText(txt,w/2,h/2);
  });
  const flat=(tex,x9,y9,z9,w9,h9,ry,blend)=>{const m=new THREE.Mesh(PL,new THREE.MeshBasicMaterial(
      {map:tex,transparent:true,fog:false,depthWrite:false,blending:blend||THREE.NormalBlending}));
    m.position.set(x9,y9,z9);m.scale.set(w9,h9,1);if(ry)m.rotation.y=ry;g.add(m);return m;};

  // ===== LA COQUE : sol, murs, plafond, charpente =====
  const sol=add9(PL,M.sol,0,0,0,W,D,1);sol.rotation.x=-Math.PI/2;sol.receiveShadow=true;
  bx(0,H/2,-hd-.15,W+.6,H,.3,murM((W+.6)/2.6));                                    // mur du fond (l'atelier)
  {const mL=murM(D/2.6);bx(-hw-.15,H/2,0,.3,H,D,mL);bx(hw+.15,H/2,0,.3,H,D,mL);}
  {const mP=murM(6.2/2.6);bx(-7.9,H/2,hd+.15,6.2,H,.3,mP);bx(7.9,H/2,hd+.15,6.2,H,.3,mP);} // piles de la porte
  bx(0,5.45,hd+.15,9.6,1.5,.3,murM(9.6/2.6,1.5/H,1-1.5/H));                                   // linteau
  bx(0,H+.15,0,W+.6,.3,D+.6,M.toit);                                    // plafond
  // soubassement peint + bande de sécurité jaune : deux traits, et le mur devient un ATELIER
  for(const p of [[0,-hd+.09,W,0],[-hw+.09,0,D,1],[hw-.09,0,D,1]]){
    const lg=p[3],ln=p[2];
    bx(p[0],.6,p[1],lg?.06:ln,1.2,lg?ln:.06,M.bas);
    bx(p[0],1.26,p[1],lg?.07:ln,.09,lg?ln:.07,M.jaune);}
  // CHARPENTE : cinq poutres en I + les gaines qui courent au plafond
  for(let i=-2;i<=2;i++){const z=i*5.4;bx(0,H-.55,z,W,.44,.16,M.fer);bx(0,H-.79,z,W,.09,.5,M.fer);}
  for(const px of [-3.4,3.4]){cy(px,H-1.0,0,.09,D-1,M.fer).rotation.x=Math.PI/2;
    for(let i=-2;i<=2;i++)bx(px,H-.78,i*5.4,.06,.5,.06,M.fer);}
  // PORTE SECTIONNELLE RELEVÉE : les panneaux sont remontés à plat sous le plafond, rails compris.
  // C'est ELLE qui ouvre l'atelier sur la nuit — sans ça, on tourne dans une boîte fermée.
  for(const sx of [-1,1]){bx(sx*4.85,2.4,hd-.1,.24,4.8,.4,M.fer);bx(sx*4.85,4.95,hd-3.3,.14,.14,6.6,M.fer);}
  bx(0,4.85,hd-.15,10,.3,.5,M.fer);                                     // traverse haute
  /* (2026-09-30, Sacha : « la porte du garage doit être fermée au début et s'ouvrir avec les flammes quand on clique sur JOUER ») LA PORTE
     SECTIONNELLE descend : cinq panneaux de tôle nervurée sur le rail, FERMÉS au menu — le feu brûle derrière, il passe par les joints, par
     les hublots du 4e panneau et sous la porte. Au LÂCHER, ils remontent le rail, prennent le coude et filent sous le plafond (garPorte,
     0,8 s dès le JOUER) : le rideau de flammes apparaît et la caisse y entre. Ouverte, la porte retrouve exactement la place des panneaux
     empilés d'avant (y 4,98 ; z hd − 0,85 − 1,02 i). */
  /* LA PORTE v2 (2026-10-04, Léo : « remets une porte maintenant que les flammes sont plus jolies, et fais une porte de garage plus jolie »).
     Une seule toile pour toute la porte (1000 × 500, une bande de 100 par panneau) que chaque panneau lit par ses UV : une LAQUE indigo
     à CAISSONS biseautés (six par panneau, la lumière d'en haut à gauche), le haut en bandeau — CASH CAR en lettres d'or pixel entre deux
     filets de néon rose —, le 4e panneau percé de six VRAIS HUBLOTS (trous dans la toile, alphaTest : derrière, le feu en pixels brûle
     pour de bon), une poignée d'or, et en bas une bande de danger jaune et noire sur son joint de caoutchouc. La toile d'ÉMISSION fait
     passer la lueur du feu par les JOINTS des panneaux et fait luire l'or et le néon ; elle bat avec les flammes (garPorte).
     Une matière pour les cinq panneaux (même programme qu'une Lambert de l'atelier + alphaTest : compilée au menu avec lui). */
  {const DW=1000,DH=500,dCv=document.createElement('canvas'),eCv=document.createElement('canvas');dCv.width=eCv.width=DW;dCv.height=eCv.height=DH;
   const dx=dCv.getContext('2d'),ex=eCv.getContext('2d');
   const peint=function(){
     dx.clearRect(0,0,DW,DH);ex.fillStyle='#000';ex.fillRect(0,0,DW,DH);
     const caisson=function(x0,y0,w,h){
       dx.fillStyle='#14111f';dx.fillRect(x0-3,y0-3,w+6,h+6);                                  // la feuillure (l'ombre autour)
       const gr=dx.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'#3a3566');gr.addColorStop(1,'#26223f');dx.fillStyle=gr;dx.fillRect(x0,y0,w,h);
       dx.fillStyle='#6a63a6';dx.fillRect(x0,y0,w,3);dx.fillRect(x0,y0,3,h);                  // le biseau éclairé (haut, gauche)
       dx.fillStyle='#100d1c';dx.fillRect(x0,y0+h-3,w,3);dx.fillRect(x0+w-3,y0,3,h);          // le biseau dans l'ombre (bas, droite)
       dx.fillStyle='#4a447e';dx.fillRect(x0+3,y0+3,w-6,1);};
     for(let i=0;i<5;i++){const y0=(4-i)*100;
       const gr=dx.createLinearGradient(0,y0,0,y0+100);gr.addColorStop(0,'#2f2a4d');gr.addColorStop(1,'#1d1a31');dx.fillStyle=gr;dx.fillRect(0,y0,DW,100);
       dx.fillStyle='#726bb0';dx.fillRect(0,y0,DW,2);dx.fillStyle='#3d3862';dx.fillRect(0,y0+2,DW,1);   // l'arête du panneau
       dx.fillStyle='#0a0814';dx.fillRect(0,y0+96,DW,4);                                        // le joint
       ex.fillStyle='#ff6a1c';ex.fillRect(0,y0+97,DW,2);ex.fillStyle='#7a2a08';ex.fillRect(0,y0,DW,1);   // le feu passe par les joints
       if(i<=2){const h0=i===0?y0+12:y0+16,hh=i===0?54:66;for(let k=0;k<6;k++)caisson(30+k*160,h0,140,hh);}
       if(i===3){for(let k=0;k<6;k++){const x0=30+k*160,yw=y0+18,w=140,h=62;                    // LES HUBLOTS
         dx.fillStyle='#0b0a12';dx.fillRect(x0-4,yw-4,w+8,h+8);
         dx.fillStyle='#d5dbec';dx.fillRect(x0,yw,w,4);dx.fillRect(x0,yw,4,h);                  // le cadre chromé
         dx.fillStyle='#5a6078';dx.fillRect(x0,yw+h-4,w,4);dx.fillRect(x0+w-4,yw,4,h);
         dx.fillStyle='#9aa1b8';dx.fillRect(x0+4,yw+4,w-8,3);
         dx.clearRect(x0+8,yw+8,w-16,h-16);                                                     // le trou : derrière, le feu
         for(const [cx,cy] of [[x0+8,yw+8],[x0+w-11,yw+8],[x0+8,yw+h-11],[x0+w-11,yw+h-11]]){dx.fillStyle='#5a6078';dx.fillRect(cx,cy,3,3);} // coins arrondis, en pixels
         ex.fillStyle='#3a1206';ex.fillRect(x0,yw,w,h);}}                                        // le reflet du feu sur le cadre
       if(i===4){dx.fillStyle='#ffb24a';dx.fillRect(40,y0+14,DW-80,3);dx.fillRect(40,y0+84,DW-80,3);   // LE BANDEAU : néon rose
         ex.fillStyle='#b8741c';ex.fillRect(40,y0+14,DW-80,3);ex.fillRect(40,y0+84,DW-80,3);
         dx.font='44px "Press Start 2P", monospace';dx.textAlign='center';dx.textBaseline='middle';
         const tx=DW/2,ty=y0+52;dx.fillStyle='#4a2600';dx.fillText('CASH CAR',tx+5,ty+5);dx.fillText('CASH CAR',tx+3,ty+3); // l'épaisseur
         const go=dx.createLinearGradient(0,ty-22,0,ty+22);go.addColorStop(0,'#fff4b0');go.addColorStop(.45,'#ffcf3a');go.addColorStop(1,'#c4820c');
         dx.fillStyle=go;dx.fillText('CASH CAR',tx,ty);
         ex.font=dx.font;ex.textAlign='center';ex.textBaseline='middle';ex.fillStyle='#8a6214';ex.fillText('CASH CAR',tx,ty);}
       if(i===1){dx.fillStyle='#3a2a08';dx.fillRect(452,y0+50,96,12);dx.fillStyle='#e8b73a';dx.fillRect(450,y0+46,96,12); // LA POIGNÉE d'or
         dx.fillStyle='#fff0a0';dx.fillRect(450,y0+46,96,3);ex.fillStyle='#3a2a08';ex.fillRect(450,y0+46,96,12);}
       if(i===0){dx.fillStyle='#16131f';dx.fillRect(0,y0+72,DW,20);                              // LA BANDE DE DANGER : noir, puis les biais jaunes
         dx.fillStyle='#f5c425';for(let x=-20;x<DW+20;x+=36){dx.beginPath();dx.moveTo(x,y0+92);dx.lineTo(x+18,y0+72);dx.lineTo(x+36,y0+72);dx.lineTo(x+18,y0+92);dx.fill();}
         dx.fillStyle='#0a0812';dx.fillRect(0,y0+70,DW,2);dx.fillStyle='#07060b';dx.fillRect(0,y0+92,DW,8);   // le joint de caoutchouc
         ex.fillStyle='#ff6a1c';ex.fillRect(0,y0+98,DW,2);}}};                                   // la lueur SOUS la porte
   peint();
   const tD=new THREE.CanvasTexture(dCv),tE=new THREE.CanvasTexture(eCv);tD.magFilter=THREE.NearestFilter;tD.anisotropy=4;tE.anisotropy=4;
   try{if(document.fonts&&document.fonts.load)document.fonts.load('44px "Press Start 2P"').then(function(){peint();tD.needsUpdate=true;tE.needsUpdate=true;}).catch(function(){});}catch(e){}
   const mH=new THREE.MeshLambertMaterial({color:0xffffff,map:tD,emissive:0xffffff,emissiveMap:tE,alphaTest:.5,fog:false}),P9=[];
   for(let i=0;i<5;i++){const geo=new THREE.BoxGeometry(9.5,.9,.1),uv=geo.attributes.uv;
     for(let v=0;v<uv.count;v++)uv.setY(v,(i+uv.getY(v))/5);                               // chaque panneau lit SA bande de la toile
     const m=new THREE.Mesh(geo,mH);m.position.set(0,.47+.94*i,hd-.2);g.add(m);P9.push(m);}
   GAR.porte={P:P9,zD:hd-.2,k:0,e:-1,mH:mH,db:null};garPortePose(0);}
  bx(3.2,5.55,hd-3.4,.8,.46,.66,M.acier);                               // le moteur de porte
  cy(3.2,5.2,hd-3.4,.03,.5,M.chrome);
  // ⚠ PAS DE BARRIÈRE, PAS DE PARVIS CLOS (verdict user) : franchir le seuil, c'est déjà être sur
  // la ligne de départ. Le ruban part du pas de la porte et file dans la nuit — liseré néon rose et
  // pointillés sodium, exactement la piste du jeu. Il s'éteint au loin par un FONDU BAKÉ dans la
  // texture (alpha → 0) : sans lui, la route se terminerait par une arête franche en plein ciel.
  bx(0,.02,hd+.05,10.4,.06,.5,M.acier);                                  // le seuil, en tôle striée
  {const rL=78,rW=11.4;
   const routeTex=cvT(64,256,(x,w,h)=>{
     x.fillStyle='#231f2c';x.fillRect(0,0,w,h);                          // bitume nuit
     x.fillStyle='#2b2634';for(let i=0;i<9;i++)x.fillRect(0,i*29+13,w,2);// joints de dalle
     x.fillStyle='#f24aa0';x.fillRect(2,0,4,h);x.fillRect(w-6,0,4,h);    // liserés néon rose
     x.fillStyle='#ffc24a';for(let i=0;i<16;i++)x.fillRect(w/2-2,i*16+4,4,9); // ligne centrale sodium
     x.globalCompositeOperation='destination-out';                        // ...et tout se dissout au loin
     const gf=x.createLinearGradient(0,h*.32,0,h);gf.addColorStop(0,'rgba(0,0,0,0)');gf.addColorStop(1,'rgba(0,0,0,1)');
     x.fillStyle=gf;x.fillRect(0,h*.32,w,h*.68);});
   const rte=add9(PL,new THREE.MeshBasicMaterial({map:routeTex,transparent:true,fog:false,depthWrite:false}),
                  0,.01,hd+rL/2,rW,rL,1);rte.rotation.x=-Math.PI/2;rte.renderOrder=-2;
   const glowTex=cvT(64,256,(x,w,h)=>{                                    // la nappe qui SAIGNE (bloom)
     x.fillStyle='#f24aa0';x.fillRect(0,0,9,h);x.fillRect(w-9,0,9,h);
     x.fillStyle='#ffb43c';x.fillRect(w/2-4,0,8,h);
     x.globalCompositeOperation='destination-out';
     const gf=x.createLinearGradient(0,0,0,h);gf.addColorStop(0,'rgba(0,0,0,.45)');gf.addColorStop(.32,'rgba(0,0,0,.45)');gf.addColorStop(1,'rgba(0,0,0,1)');
     x.fillStyle=gf;x.fillRect(0,0,w,h);});
   const gl=add9(PL,new THREE.MeshBasicMaterial({map:glowTex,transparent:true,fog:false,depthWrite:false,
     blending:THREE.AdditiveBlending}),0,.03,hd+rL/2,rW,rL,1);gl.rotation.x=-Math.PI/2;gl.renderOrder=-1;}
  /* ===== LE RIDEAU DE FLAMMES, v2 EN PIXELS (2026-09-29, Léo : « supprime ce design de flamme et recrée-en un inspiré complètement des
     flammes pixelisées de la jauge — une grosse, plus jolie, agrandie, mais pixelisée ») =====
     La porte relevée ne donne plus sur la nuit : elle BRÛLE d'un pilier à l'autre et du seuil au linteau (plus de vue dehors). C'est le
     FEU DE DOOM de la 1re jauge NITRO MAX (26/09, sur la branche de Léo), en grand : une grille de 80 × 40 CASES dont la rangée du bas
     brûle ; chaque case monte d'un cran en perdant un peu de chaleur, avec un décalage au hasard (le vent), et la palette va de la fumée
     rougie au blanc. Agrandie en PIXELS FRANCS (NearestFilter : aucune case lissée) sur un plan OPAQUE juste derrière le mur de façade
     (ses bords passent derrière les piles ±4,8 m et le linteau 4,7 m). Des FOYERS qui glissent le long du seuil font les langues ; des
     ÉTINCELLES (une case blanche jetée au hasard) montent et s'éteignent. `GAR.feu.k` suit le LÂCHER : le feu monte jusqu'au linteau.
     Coût : 3 200 cases à 30 images/s + une texture de 80 × 40 envoyée — rien ; seulement quand l'atelier est ouvert. */
  {const W9=96,H9=48,cv=document.createElement('canvas');cv.width=W9;cv.height=H9; // (2026-09-30, v3) 80 × 40 → 96 × 48 : des cases de 10 cm
   const tex=new THREE.CanvasTexture(cv);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
   const fm=new THREE.MeshBasicMaterial({map:tex,fog:false,toneMapped:false,color:0xd6d1cc}); // (garage-lumiere) le rideau de flammes de Léo : −16 % de lumière, même forme
   const fl=add9(PL,fm,0,2.45,hd+.36,10,4.9,1);fl.rotation.y=Math.PI;
   const F=GAR.feu={cv:cv,cx:cv.getContext('2d'),img:null,f:new Uint8Array(W9*H9),h:new Float32Array(W9),em:[],W:W9,H:H9,tex:tex,acc:0,t:0,k:0};
   F.img=F.cx.createImageData(W9,H9);GAR.feuM=fl;
   for(let i=0;i<70;i++)feuPixPas(F); // il BRÛLE déjà quand la porte apparaît (sinon il naîtrait sous les yeux, du seuil vers le haut)
   /* LES FLAMMES EN CUBES — voir FEU_CUBES (près de feuPixPas). Deux instanciations qui PARTAGENT leurs matrices et leurs couleurs : le
      CUBE plein (faces ombrées comme un bloc de jeu de cubes, couleurs au-delà de 1 : le halo du post les prend) et son HALO (le même cube
      ×1,9, additif, translucide) — 2 appels de dessin, 24 + 36 sommets par flamme. Compilés au menu avec l'atelier (atelierChauffe). */
   {const N=FEU_CUBES.N,bx9=new THREE.BoxGeometry(1,1,1),ps=bx9.attributes.position,nm=bx9.attributes.normal,cl=new Float32Array(ps.count*3);
    for(let i=0;i<ps.count;i++){const nx=nm.getX(i),ny=nm.getY(i),nz=nm.getZ(i),v9=ny>.5?1:ny<-.5?.5:nz<-.5?.86:nz>.5?.55:.68; // dessus clair, face vue (−z) presque pleine, flancs, dessous sombre
      cl[i*3]=cl[i*3+1]=cl[i*3+2]=v9;}
    bx9.setAttribute('color',new THREE.BufferAttribute(cl,3));
    const A=new THREE.InstancedMesh(bx9,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}),N);
    const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,1.9,1.9),new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:.17,
      blending:THREE.AdditiveBlending,depthWrite:false}),N);
    A.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);
    B.instanceMatrix=A.instanceMatrix;B.instanceColor=A.instanceColor;  // le halo suit le cube : mêmes tampons
    A.count=B.count=0;A.frustumCulled=B.frustumCulled=false;B.renderOrder=2;g.add(A);g.add(B);
    GAR.feuC={A:A,B:B,n:0,p:new Float32Array(N*9),acc:0,m:new THREE.Matrix4(),z0:hd};
    for(let i=0;i<45;i++){F.t+=1/30;garFeuCubes(1/30);}}  // elles brûlent déjà à l'ouverture
   const lu=flat(blobTex,0,.04,hd-1.3,12.5,6,0,THREE.AdditiveBlending);lu.rotation.x=-Math.PI/2;lu.material.color.setHex(0xff5a14);lu.renderOrder=-1;GAR.feuLu=lu;}
  /* LE SOCLE DES MISSIONS (2026-09-30, sketch de Léo : « missions » sur un fût à droite de la caisse) : une colonne de fer cerclée de
     néon VERT (la couleur des défis), coiffée d'une cible qui tourne. Au sol, HORS du plateau (il ne tourne pas avec la caisse), côté
     porte, à 3,8 m du centre : la plus longue caisse (6 m) balaie 3,2 m. x < 0 = à DROITE de l'écran (la caméra regarde la porte, +Z).
     (le menu de Léo et son étiquette MISSIONS sont retirés : le socle reste caché). */
  {const n9=g.children.length,sx=-2.9,sz=2.5,vert=BA(0x5ee37a);
   cy(sx,.62,sz,.42,1.24,M.fer);cy(sx,1.27,sz,.47,.07,M.acier);cy(sx,.08,sz,.5,.16,M.acier);
   for(const y9 of [.34,.98])cy(sx,y9,sz,.435,.06,vert);                                   // deux cerclages néon
   const ci=new THREE.Group();ci.position.set(sx,1.78,sz);g.add(ci);GAR.misCible=ci;GAR.misPos=new THREE.Vector3(sx,2.28,sz);
   const tg=new THREE.TorusGeometry(.3,.035,6,28),tg2=new THREE.TorusGeometry(.15,.03,6,20);
   ci.add(new THREE.Mesh(tg,vert));ci.add(new THREE.Mesh(tg2,vert));
   const pt=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),vert);ci.add(pt);
   GAR.misSocle=g.children.slice(n9);GAR.misSocle.forEach(function(o){o.visible=false;});} // (2026-10-06, Léo : « l'ancien truc mission vert, à enlever ») : le BOUTON ROUGE prend sa place (voir atlBuild)

  // ===== LE PLATEAU TOURNANT : la caisse est une PIÈCE D'EXPOSITION, pas une bagnole garée =====
  // ⚠ le plateau a SES géométries : mettre le tore unité à l'échelle 8,8 gonflait aussi son tube —
  // on obtenait un beignet cyan de 3 m de large au lieu d'un liseré. Un anneau fin, ça se déclare.
  // ⚠ TOUT CE QUI TOURNE EST DANS UN GROUPE. Le disque, l'anneau et les douze plots étaient posés
  // à plat dans la scène : impossible de les faire tourner ensemble sans les bouger un par un.
  const pod=new THREE.Group();g.add(pod);GAR.pod=pod;
  const dis=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.52,GAR.POD,34),M.fer);dis.position.y=GAR.POD/2;pod.add(dis);
  const anneau=new THREE.Mesh(new THREE.TorusGeometry(4.42,.045,6,52),
    BA(0xf2deb4,{transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})); // (garage-lumiere) cyan → or pâle, plus discret
  anneau.rotation.x=-Math.PI/2;anneau.position.y=GAR.POD;pod.add(anneau);GAR.ring=anneau;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,pl=new THREE.Mesh(CY8,M.acier);
    pl.position.set(Math.sin(a)*4.05,GAR.POD+.02,Math.cos(a)*4.05);pl.scale.set(.1,.035,.1);pod.add(pl);}
  // ===== LE SCANNER : c'est LUI qui fait passer une caisse pour une autre =====
  // ⚠ LE VRAI PROBLÈME N'EST PAS L'ANIMATION, C'EST LE REMPLACEMENT. Il n'y a qu'UNE caisse en
  // mémoire (`carGroup`) : changer de modèle, c'est `buildCar`, et ça se voit comme un clignement.
  // Le scanner est le rideau qui cache le changement d'acteur — pendant qu'il balaie, la caisse est
  // écrasée à zéro, reconstruite, puis redéployée. Zéro caisse en plus, zéro mémoire, et à l'écran
  // c'est une machine qui matérialise la suivante. (La solution « deux caisses et on permute »
  // coûterait un second jeu de matériaux et de géométries pour exactement le même effet.)
  const scanTex=cvT(64,64,(x,w,h)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,240,215,0)');gr.addColorStop(.70,'rgba(255,222,170,.50)');
    gr.addColorStop(.93,'rgba(255,248,236,.95)');gr.addColorStop(1,'rgba(255,222,170,0)');
    x.fillStyle=gr;x.fillRect(0,0,64,64);});
  const scan=new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:scanTex,transparent:true,fog:false,
    depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  scan.rotation.x=-Math.PI/2;scan.scale.set(7.4,7.4,1);scan.visible=false;scan.renderOrder=2; // il ÉPOUSE le plateau : plus large, il éclairait le sol de l'atelier et on perdait le disque
  pod.add(scan);GAR.scan=scan;
  add9(PL,new THREE.MeshBasicMaterial({map:blobTex,color:0x0a1226,transparent:true,fog:false,depthWrite:false}),
       0,GAR.POD+.012,0,7.6,9.4,1).rotation.x=-Math.PI/2;               // l'ombre douce qui POSE la caisse — (vague 2) à l'ENCRE, comme toute ombre du jeu
  for(const sx of [-1,1])bx(sx*5.2,.005,1,.14,.01,17,M.jaune);          // lignes de baie
  for(const p of [[-7.4,-4.6,3.1],[6.8,5.2,2.4]])                        // flaques d'huile jamais essuyées
    add9(PL,new THREE.MeshBasicMaterial({map:oilTex,transparent:true,fog:false,depthWrite:false}),
         p[0],.008,p[1],p[2],p[2]*.8,1).rotation.x=-Math.PI/2;

  /* ===== LES MEUBLES DU NIVEAU DE LA CAISSE (2026-09-30, Sacha : « retravaille le garage, notamment les objets : il faut que tous les
     objets et les meubles soient du niveau de la voiture ») =====
     Les meubles étaient des cubes Lambert mis à l'échelle — pas un reflet, pas une arête, trois cents appels de dessin — posés à côté
     d'une caisse taillée au kit, en laque vernie qui renvoie le studio. Ils sont désormais construits avec LE MÊME KIT QUE LA CAISSE
     (`lpKit` : facettes franches, couleur dans les sommets ; `lpMat` : laque vernie, chrome, or, satiné, mat, verre ; `lpOmbre` : l'ombre
     cuite au pied) et au même degré de détail : l'établi en lamellé-collé avec ses blocs-tiroirs, la servante à tiroirs et barres de
     tirage, le compresseur à fonds bombés avec son moteur, sa pompe à ailettes, son carter de courroie et ses manomètres, deux V8
     (blocs, culasses, cache-culbuteurs laqués, collecteurs chromés, poulies, courroie, faisceau d'allumage), le palan hydraulique et sa
     chaîne maillon par maillon, le pont à deux poteaux en U, les pneus au vrai profil des roues de la gamme, les jantes à bâtons…
     · TOUT tient en UNE géométrie PAR MATIÈRE : ~6 appels de dessin pour tout le mobilier (contre ~300), et les programmes sont ceux de
       la caisse (même shader, mêmes réglages : zéro programme de plus au menu, rien à relier en course).
     · Les places ne bougent pas : les ancres des MISSIONS (compresseur, établi, pont, rack, distributeur) visent toujours leur meuble,
       rien de haut à moins de 8,3 m du centre, et le couloir de la caméra ne garde que du ras du sol (sous 50 cm).
     · `uG` (le plancher lumineux de lpMat) est relevé par famille : l'atelier est sombre, et une laque sans lui y sortait noire. */
  const MK=lpKit({
    R:{g:'p',c:0xd53c2f},B:{g:'p',c:0x2f6cb8},V:{g:'p',c:0x2f9e63},J:{g:'p',c:0xefb52a},O:{g:'p',c:0xe8721f},  // les laques franches
    N:{g:'p',c:0x1d2027},K:{g:'p',c:0x626b79},                                                           // laque noire, gris moteur
    C:{g:'c',c:0xe6e9ee},Or:{g:'o',c:0xffc24a},                                                          // chrome, laiton
    F:{g:'s',c:0x2c3445},A:{g:'s',c:0x8792a4},W:{g:'s',c:0x8a6237},W2:{g:'s',c:0xa3794a},E:{g:'s',c:0xd8d0bc},Wb:{g:'s',c:0xf2f0ea},
    P:{g:'m',c:0x1a1c21},D:{g:'m',c:0x101217},T:{g:'m',c:0xb08b5a},T2:{g:'m',c:0x9c7a4c},                // pneu, caoutchouc, carton
    G:{g:'g',c:0x1b3550},H:{g:'g',c:0x07080b}});                                                        // verre, huile
  const q9=new THREE.Quaternion(),e9=new THREE.Euler(),y9v=new THREE.Vector3(0,1,0),x9v=new THREE.Vector3(1,0,0),d9=new THREE.Vector3();
  // boîte chanfreinée (arêtes qui attrapent la lumière), cylindre, tour, tore, tube entre deux points, poutre entre deux points
  const cb=(k,w,h,d,x,y,z,rx,ry,rz,b)=>{b=b!=null?b:Math.min(.03,Math.min(w,h,d)*.2);
    MK.put(k,b<.004?new THREE.BoxGeometry(w,h,d):chanfreinGeo(w,h,d,b),x,y,z,rx,ry,rz);};
  const cl=(k,r,len,n,x,y,z,rx,ry,rz,r2)=>MK.put(k,new THREE.CylinderGeometry(r2!=null?r2:r,r,len,n||10),x,y,z,rx,ry,rz);
  const lt=(k,pts,n,x,y,z,rx,ry,rz)=>MK.put(k,new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n||16),x,y,z,rx,ry,rz);
  const to=(k,R,t,x,y,z,rx,ry,rz,ns,arc)=>MK.put(k,new THREE.TorusGeometry(R,t,ns||5,16,arc||Math.PI*2),x,y,z,rx,ry,rz);
  const seg=(k,r,a,b,n)=>{d9.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L9=d9.length();if(L9<1e-4)return;d9.divideScalar(L9);
    q9.setFromUnitVectors(y9v,d9);e9.setFromQuaternion(q9,'XYZ');
    MK.put(k,new THREE.CylinderGeometry(r,r,L9,n||6),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,e9.x,e9.y,e9.z);};
  const barre=(k,t,a,b,h)=>{d9.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L9=d9.length();if(L9<1e-4)return;d9.divideScalar(L9);
    q9.setFromUnitVectors(x9v,d9);e9.setFromQuaternion(q9,'XYZ');
    MK.put(k,chanfreinGeo(L9,h||t,t,Math.min(.02,t*.2)),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,e9.x,e9.y,e9.z);};
  /* LES PIÈCES QUI REVIENNENT. Le pneu a le profil des roues de la gamme (lpWheel : 16 pans, épaules chanfreinées) + deux rainures ;
     couché par défaut (axe y). La jante couchée : lèvre, fond sombre, bâtons, moyeu et écrou de laiton. */
  const pneu=(x,y,z,R,w,rx,ry,rz,lettre)=>{const h=w/2;
    lt('P',[[R*.6,h],[R*.6,-h],[R*.83,-h],[R*.97,-h*.8],[R,-h*.45],[R,h*.45],[R*.97,h*.8],[R*.83,h],[R*.6,h]],16,x,y,z,rx,ry,rz);
    for(const s of [-.18,.18])lt('D',[[R+.003,s*w-.012],[R+.003,s*w+.012]],16,x,y,z,rx,ry,rz);
    if(lettre)lt('J',[[R*.88,h+.003],[R*.72,h+.003]],16,x,y,z,rx,ry,rz);};          // flanc lettré jaune : des gommes de course
  const jante=(x,y,z,r,n)=>{
    lt('C',[[r,-.05],[r*1.05,-.04],[r*1.05,.04],[r,.05],[r*.92,.05]],18,x,y,z);
    lt('D',[[r*.92,.03],[r*.92,-.04],[0,-.04]],18,x,y,z);
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2;cb('C',r*.13,.03,r*.78,x+Math.sin(a)*r*.46,y+.035,z+Math.cos(a)*r*.46,0,a,0,.006);}
    cl('C',r*.22,.07,12,x,y+.03,z);cl('Or',r*.08,.08,6,x,y+.045,z);};
  const clefM=(x,y,z,L)=>{cb('C',.045,L,.018,x,y,z,0,0,0,.006);to('C',.05,.016,x,y+L/2+.035,z,0,0,0,4);          // la clé mixte pendue : œil…
    cb('C',.028,.075,.018,x-.042,y-L/2-.025,z,0,0,0,.005);cb('C',.028,.075,.018,x+.042,y-L/2-.025,z,0,0,0,.005);cb('C',.12,.03,.018,x,y-L/2+.012,z,0,0,0,.005); // …et fourche
    cl('A',.007,.09,5,x,y+L/2+.035,z-.04,Math.PI/2);};
  /* LE V8 : vilebrequin selon x, la FAÇADE (poulies, courroie, ventilateur) tournée vers la salle (−x). Bloc et culasses gris,
     cache-culbuteurs en laque rouge à nervures chromées, filtre à air chromé, collecteurs chromés, faisceau d'allumage, carter, volant. */
  const moteur=(x,y,z)=>{const TH=.72,c9=Math.cos(TH),s9=Math.sin(TH);
    const BK=(s,lx,ly,lz)=>[x+lx,y+ly*c9-lz*s*s9,z+ly*s*s9+lz*c9];                   // repère d'une rangée (penchée de ±41°)
    cb('F',.86,.14,.42,x+.04,y-.33,z,0,0,0,.03);cb('F',.4,.06,.3,x+.12,y-.42,z,0,0,0,.02);   // le carter d'huile
    cb('K',1.0,.34,.56,x,y-.1,z,0,0,0,.03);                                            // le bas du bloc
    for(const s of [-1,1]){let p=BK(s,0,.2,0);cb('K',.94,.34,.3,p[0],p[1],p[2],s*TH,0,0,.025);            // la rangée
      p=BK(s,0,.4,0);cb('K',.96,.07,.32,p[0],p[1],p[2],s*TH,0,0,.015);                  // la culasse
      p=BK(s,0,.48,0);cb('R',.9,.1,.25,p[0],p[1],p[2],s*TH,0,0,.03);                    // le cache-culbuteurs
      for(const v of [-.07,0,.07]){p=BK(s,0,.535,v);cb('C',.78,.014,.02,p[0],p[1],p[2],s*TH,0,0,0);}
      p=BK(s,.3,.55,0);cl('Or',.035,.035,10,p[0],p[1],p[2],s*TH);                       // le bouchon
      for(let i=0;i<4;i++){const lx=-.33+i*.22;p=BK(s,lx,.3,s*.17);cl('D',.022,.08,6,p[0],p[1],p[2],s*TH+s*Math.PI/2);  // les antiparasites
        seg('R',.008,p,[x+.46,y+.62,z+s*.03]);                                          // le faisceau jusqu'à l'allumeur
        const q=BK(s,lx,.06,s*.16);seg('C',.028,q,[x+lx+.02,y-.12,z+s*.44]);}            // les primaires du collecteur
      seg('C',.045,[x-.42,y-.13,z+s*.44],[x+.36,y-.15,z+s*.44]);seg('C',.05,[x+.36,y-.15,z+s*.44],[x+.42,y-.38,z+s*.46]);}
    cb('K',.8,.14,.24,x,y+.42,z,0,0,0,.02);cb('A',.2,.1,.2,x,y+.53,z,0,0,0,.02);       // la pipe d'admission, le carbu
    lt('C',[[0,.58],[.21,.58],[.23,.6],[.23,.64],[.21,.66],[.12,.68],[0,.685]],20,x,y,z);  // le filtre à air chromé
    lt('R',[[.216,.6],[.216,.64]],20,x,y,z);cl('Or',.03,.03,6,x,y+.7,z);
    cb('K',.07,.42,.34,x-.53,y+.02,z,0,0,0,.02);                                       // le carter de distribution
    cl('C',.12,.05,16,x-.6,y-.14,z,0,0,Math.PI/2);cl('C',.08,.04,14,x-.61,y+.16,z,0,0,Math.PI/2);     // poulies : vilebrequin, pompe à eau
    cl('A',.1,.2,14,x-.46,y+.24,z-.3,0,0,Math.PI/2);cl('C',.05,.04,10,x-.6,y+.24,z-.3,0,0,Math.PI/2); // l'alternateur
    seg('D',.014,[x-.62,y-.26,z+.02],[x-.62,y+.1,z+.07]);seg('D',.014,[x-.62,y+.22,z-.06],[x-.62,y+.28,z-.26]);seg('D',.014,[x-.62,y-.2,z-.1],[x-.62,y+.2,z-.34]); // la courroie
    for(let i=0;i<4;i++)cb('N',.012,.3,.07,x-.66,y+.16,z,i*Math.PI/4+.3,0,0,.004);     // le ventilateur
    lt('A',[[.12,0],[.3,.07],[.3,.13],[0,.13]],16,x+.5,y-.08,z,0,0,-Math.PI/2);        // la cloche d'embrayage
    cl('N',.045,.16,10,x+.46,y+.54,z);lt('R',[[.07,.62],[.07,.66],[.03,.69],[0,.69]],10,x+.46,y,z);   // l'allumeur
    cl('O',.055,.14,12,x+.12,y-.24,z+.32,Math.PI/2);cl('A',.07,.24,10,x+.3,y-.24,z-.33,0,0,Math.PI/2);}; // filtre à huile, démarreur

  // ===== MUR DU FOND : l'établi, le panneau d'outils, l'étagère — le vrai bordel utile =====
  const zB=-hd+.9,pz=-hd+.26;
  // L'ÉTABLI : plateau en lamellé-collé (neuf lames de deux teintes), chant d'acier, pieds à vérins, deux blocs-tiroirs
  for(let i=0;i<9;i++)cb(i%2?'W':'W2',9.8,.1,.158,-3,.93,zB-.667+i*.1667,0,0,0,.018);
  cb('A',9.86,.13,.035,-3,.925,zB+.765,0,0,0,.008);cb('F',9.6,.08,.05,-3,.84,zB+.7);
  for(const px of [-7.7,-3,1.7])for(const s of [-.62,.62]){cb('F',.1,.8,.1,px,.46,zB+s,0,0,0,.012);cl('C',.018,.06,6,px,.04,zB+s);cl('D',.05,.02,10,px,.01,zB+s);}
  cb('A',5.4,.04,1.2,-2.9,.36,zB,0,0,0,.01);                                           // l'étagère basse
  for(const cx of [-6.35,.55]){cb('F',1.3,.76,1.1,cx,.45,zB+.05,0,0,0,.02);cb('D',1.26,.05,1.0,cx,.05,zB+.05,0,0,0,.005);
    for(let d=0;d<4;d++){const y9=.19+d*.18;cb('R',1.22,.155,.04,cx,y9,zB+.615,0,0,0,.012);
      cl('C',.011,.9,6,cx,y9+.035,zB+.66,0,0,Math.PI/2);for(const sx of [-.45,.45])cb('C',.02,.02,.04,cx+sx,y9+.035,zB+.645,0,0,0,0);
      cb('Wb',.12,.035,.005,cx-.47,y9-.03,zB+.637,0,0,0,0);}}
  
  cb('F',9.8,.14,.08,-3,1.06,zB-.73);                                                  // la lisse du fond
  cb('E',1.3,.08,.05,-.4,1.05,zB-.675,0,0,0,.01);for(let i=0;i<5;i++)cb('D',.07,.04,.01,-.9+i*.25,1.05,zB-.648,0,0,0,0);  // la multiprise
  // L'ÉTAU, mâchoires vers la salle
  {const vx=-6.3,vz=zB+.3;lt('B',[[.17,0],[.17,.05],[.14,.07],[0,.07]],14,vx,.98,vz);
   cb('B',.34,.18,.46,vx,1.14,vz+.05,0,0,0,.02);cb('B',.5,.2,.12,vx,1.32,vz-.15,0,0,0,.02);cb('B',.5,.2,.12,vx,1.32,vz+.13,0,0,0,.02);
   cb('A',.46,.12,.02,vx,1.36,vz-.08,0,0,0,.004);cb('A',.46,.12,.02,vx,1.36,vz+.06,0,0,0,.004);
   cl('C',.025,.3,8,vx,1.2,vz+.34,Math.PI/2);cl('C',.012,.46,6,vx,1.2,vz+.5,0,0,Math.PI/2);
   for(const sx of [-.23,.23])lt('C',[[0,-.03],[.028,-.02],[.03,0],[.028,.02],[0,.03]],8,vx+sx,1.2,vz+.5,0,0,Math.PI/2);
   cb('B',.18,.1,.2,vx,1.32,vz-.31,0,0,0,.02);cl('B',.07,.2,8,vx,1.32,vz-.5,-Math.PI/2,0,0,.012);}
  // LA CAISSE À OUTILS
  {const tx=-4.6,tz=zB+.05;cb('R',.74,.26,.4,tx,1.11,tz,0,0,0,.02);cb('R',.76,.08,.42,tx,1.285,tz,0,0,0,.02);cb('D',.745,.012,.405,tx,1.243,tz,0,0,0,0);
   cl('D',.018,.4,6,tx,1.41,tz,0,0,Math.PI/2);for(const sx of [-.22,.22]){cb('C',.03,.1,.04,tx+sx,1.36,tz,0,0,0,.005);cb('C',.05,.06,.02,tx+sx,1.23,tz+.215,0,0,0,.004);}
   cb('Or',.12,.05,.006,tx,1.14,tz+.203,0,0,0,0);}
  // LE POSTE qui gueule : haut-parleurs, cadran, poignée, antenne
  
  // les tasses de café froid, la paperasse, le chiffon, les clés qui traînent
  
  // LE PANNEAU PERFORÉ (texture) dans son cadre, et ses outils pendus
  flat(pegTex,-3,2.6,-hd+.18,9.6,2.6);
  cb('F',9.76,.08,.05,-3,3.94,-hd+.2,0,0,0,.01);cb('F',9.76,.08,.05,-3,1.26,-hd+.2,0,0,0,.01);
  for(const s of [-1,1])cb('F',.08,2.76,.05,-3+s*4.84,2.6,-hd+.2,0,0,0,.01);
  for(let i=0;i<7;i++)clefM(-7+i*.62,3.15,pz,.5+(i%3)*.1);                            // les clés mixtes
  cl('W',.028,.62,8,-2.2,3.1,pz);cl('D',.034,.22,8,-2.2,2.9,pz);                        // le marteau
  cb('A',.36,.1,.1,-2.2,3.46,pz,0,0,0,.02);cb('A',.12,.06,.09,-2.42,3.42,pz,0,0,.5,.01);
  for(let i=0;i<4;i++){const x9=-1.3+i*.42;                                             // les tournevis
    lt(['R','J','B','V'][i],[[0,0],[.03,.01],[.038,.06],[.036,.16],[.03,.2],[.018,.23],[0,.23]],8,x9,3.12,pz);
    cl('C',.009,.34,6,x9,2.95,pz);cl('C',.006,.03,4,x9,2.765,pz,0,0,0,.001);}
  MK.plate('A',[[.55,3.1],[1.55,3.16],[1.55,3.36],[.55,3.34]],.008,pz-.004);           // la scie
  cb('D',1.0,.012,.012,1.05,3.13,pz,0,0,.06,0);cb('W',.24,.3,.04,1.68,3.24,pz,0,0,0,.02);cb('D',.12,.12,.045,1.7,3.24,pz,0,0,0,0);
  for(let i=0;i<3;i++){const x9=2.4+i*.5;                                               // les pinces
    for(const s of [-1,1])cb('B',.035,.42,.018,x9+s*.04,3.18,pz,0,0,s*.1,.006);
    cb('C',.05,.16,.018,x9,3.47,pz,0,0,0,.006);cl('C',.02,.03,8,x9,3.38,pz,Math.PI/2);}
  // L'ÉTAGÈRE HAUTE sur équerres : bidons d'huile étiquetés, cartons scotchés
  
  GAR.neons.push(flat(neonTex('CASH CAR',0xffc46a,26),-2.4,5.35,-hd+.2,7.2,2.25,0,THREE.AdditiveBlending));
  GAR.neons.push(flat(neonTex('$',0xfff0d0,52),5.4,4.5,-hd+.2,1.9,1.9,0,THREE.AdditiveBlending));
  flat(postTex,6.9,2.9,-hd+.2,2.3,1.72);                                                // l'affiche, dans un cadre noir
  cb('N',2.42,.06,.04,6.9,3.79,-hd+.19,0,0,0,.01);cb('N',2.42,.06,.04,6.9,2.01,-hd+.19,0,0,0,.01);
  for(const s of [-1,1])cb('N',.06,1.84,.04,6.9+s*1.18,2.9,-hd+.19,0,0,0,.01);
  
  {const cx=8.9,cy9=3.3,cz=-hd+.2;                                                       // l'horloge
   lt('N',[[.42,0],[.42,.07],[.37,.08],[.36,.03]],24,cx,cy9,cz,Math.PI/2);lt('E',[[.36,.03],[0,.03]],24,cx,cy9,cz,Math.PI/2);
   for(let h=0;h<12;h++){const a=h/12*Math.PI*2;cb('D',.02,h%3?.04:.07,.01,cx+Math.sin(a)*.3,cy9+Math.cos(a)*.3,cz+.035,0,0,-a,0);}
   cb('D',.025,.2,.01,cx,cy9+.09,cz+.045,0,0,0,0);cb('D',.16,.02,.01,cx+.07,cy9,cz+.05,0,0,0,0);cl('R',.02,.02,8,cx,cy9,cz+.055,Math.PI/2);}

  // ===== MUR GAUCHE : pneus, servante, compresseur, cric, et tout ce qui roule =====
  for(const st of [[-9.6,-7.2,5],[-9.6,-5.1,4],[-9.4,7.4,6]]){                        // les piles de pneus, une jante sur chacune
    for(let i=0;i<st[2];i++)pneu(st[0]+(i%2?.04:-.03),.118+i*.236,st[1],.37,.235,0,i*.4,0,st[1]>0);
    jante(st[0],.236*st[2]+.05,st[1],.25,5);}
  // LA SERVANTE, façade vers la salle : cinq tiroirs à barres de tirage, tapis, poignée, roulettes
  {const sx=-9.4,sz=-1.6,fx=sx+.4;cb('R',.8,1.1,1.5,sx,.68,sz,0,0,0,.035);cb('F',.8,.08,1.5,sx,.09,sz,0,0,0,.01);
   let y9=.16;for(const h9 of [.3,.24,.18,.14,.12]){const yc=y9+h9/2;cb('R',.04,h9,1.4,fx+.01,yc,sz,0,0,0,.01);
     cl('C',.012,1.2,6,fx+.06,yc+h9/2-.04,sz,Math.PI/2);for(const s of [-.62,.62])cb('C',.04,.02,.02,fx+.045,yc+h9/2-.04,sz+s,0,0,0,0);y9+=h9+.012;}
   cb('Or',.006,.05,.3,fx+.035,1.14,sz+.45,0,0,0,0);cb('D',.82,.03,1.52,sx,1.245,sz,0,0,0,.008);
   for(const a of [-.3,.3])for(const b of [-.62,.62]){cb('A',.08,.05,.08,sx+a,.075,sz+b,0,0,0,.005);cl('D',.05,.04,10,sx+a,.05,sz+b,0,0,Math.PI/2);}
   cl('C',.018,.6,8,sx,1.0,sz-.86,0,0,Math.PI/2);for(const a of [-.26,.26])cl('C',.014,.12,6,sx+a,1.0,sz-.8,Math.PI/2);
   cb('N',.4,.07,.3,sx-.05,1.295,sz-.3,0,.2,0,.01);cb('C',.03,.02,.28,sx+.1,1.272,sz+.25,0,.5,0,.005);
   lt('B',[[0,0],[.045,0],[.045,.2],[.03,.23],[0,.23]],10,sx+.15,1.26,sz+.55);cl('Wb',.012,.03,6,sx+.15,1.505,sz+.55);}
  // LE COMPRESSEUR : réservoir à fonds bombés, moteur à ailettes, pompe bicylindre, carter de courroie, manomètres
  {const cx=-9.5,cz=2.6,ty=.74;
   lt('B',[[0,-.95],[.2,-.93],[.32,-.87],[.39,-.78],[.42,-.66],[.42,.66],[.39,.78],[.32,.87],[.2,.93],[0,.95]],20,cx,ty,cz,Math.PI/2);
   for(const s of [-1,1])lt('A',[[.424,s*.6-.02],[.432,s*.6],[.424,s*.6+.02]],20,cx,ty,cz,Math.PI/2);
   cb('Wb',.006,.18,.56,cx+.421,ty+.02,cz-.1,0,0,0,0);cb('J',.007,.04,.56,cx+.424,ty-.1,cz-.1,0,0,0,0);
   for(const s of [-.55,.55])cb('F',.5,.28,.14,cx,.18,cz+s,0,0,0,.02);
   for(const s of [-1,1])pneu(cx+s*.48,.17,cz+.72,.17,.08,0,0,Math.PI/2);
   cl('A',.02,1.0,6,cx,.17,cz+.72,0,0,Math.PI/2);cl('Or',.02,.07,6,cx,.3,cz);
   cb('F',.5,.04,.8,cx,1.18,cz-.2,0,0,0,.01);                                               // la platine
   lt('N',[[0,-.25],[.14,-.25],[.16,-.22],[.16,.22],[.14,.25],[0,.25]],16,cx+.02,1.36,cz-.35,Math.PI/2);
   for(let f=0;f<6;f++)lt('N',[[.172,-.19+f*.075],[.172,-.17+f*.075]],16,cx+.02,1.36,cz-.35,Math.PI/2);
   cb('A',.3,.14,.3,cx,1.25,cz+.35,0,0,0,.02);
   for(const s of [-.08,.08]){cl('A',.07,.24,10,cx+s,1.44,cz+.35);for(let f=0;f<5;f++)cl('A',.1,.012,10,cx+s,1.35+f*.045,cz+.35);cb('R',.13,.04,.13,cx+s,1.585,cz+.35,0,0,0,.01);}
   cb('R',.06,.3,.7,cx+.3,1.36,cz,0,0,0,.02);for(const s of [-.35,.35])cl('R',.15,.06,14,cx+.3,1.36,cz+s,0,0,Math.PI/2);
   for(let i=0;i<3;i++)cb('D',.004,.03,.42,cx+.332,1.28+i*.08,cz,0,0,0,0);                   // les ouïes du carter
   cb('Or',.08,.08,.26,cx+.26,1.22,cz+.82,0,0,0,.01);cl('Or',.015,.2,6,cx+.26,1.08,cz+.82);
   for(const s of [-.08,.08]){lt('C',[[.07,0],[.07,.03],[.062,.035]],16,cx+.3,1.24,cz+.82+s,0,0,-Math.PI/2);lt('Wb',[[.062,.032],[0,.032]],16,cx+.3,1.24,cz+.82+s,0,0,-Math.PI/2);
     cb('R',.004,.045,.006,cx+.335,1.255,cz+.82+s,0,0,0,0);}
   cl('C',.018,.7,8,cx,1.05,cz+1.02,0,0,Math.PI/2);for(const s of [-.33,.33])seg('C',.016,[cx+s,1.05,cz+1.02],[cx+s,.66,cz+.86]);}
  for(let i=0;i<5;i++)to('J',.4+i*.012,.026,-10.74+i*.045,2.5-i*.01,4.3,0,Math.PI/2,0,5);  // le tuyau d'air, enroulé au mur
  cb('F',.2,.14,.3,-10.9,2.96,4.3,0,0,0,.02);cb('F',.3,.05,.1,-10.78,2.92,4.3,0,0,0,.01);cl('Or',.025,.08,8,-10.5,2.18,4.62,0,0,.6);
  // LE CRIC ROULEUR
  
  {const ex=-10.62,ez=-4.5;cb('F',.08,.36,.2,-10.93,2.45,ez,0,0,0,.01);cb('F',.34,.04,.22,-10.72,2.1,ez,0,0,0,.01);   // l'extincteur
   lt('R',[[0,0],[.14,0],[.15,.02],[.15,.56],[.12,.64],[.05,.68],[0,.68]],16,ex,2.12,ez);lt('Wb',[[.153,.2],[.153,.42]],16,ex,2.12,ez);
   cl('C',.035,.08,8,ex,2.84,ez);cb('N',.2,.03,.05,ex+.03,2.91,ez,0,0,-.2,.005);cb('C',.16,.03,.04,ex+.02,2.86,ez,0,0,.15,.005);
   seg('D',.018,[ex-.04,2.86,ez],[ex-.16,2.6,ez+.12]);seg('D',.02,[ex-.16,2.6,ez+.12],[ex-.12,2.3,ez+.17]);cl('N',.03,.1,8,ex-.12,2.22,ez+.17);
   cb('R',.02,.34,.34,-10.97,3.25,ez,0,0,0,.01);cb('Wb',.022,.16,.1,-10.97,3.25,ez,0,0,0,0);}

  // ===== MUR DROIT : le palan, le moteur sur pied, le rack, le distributeur =====
  // LE PALAN HYDRAULIQUE : colonne au pied du mur, jambes vers la salle sous la charge, vérin, chaîne maillon par maillon, palonnier, un V8 pendu
  {const hz=-6.4,cx=9.3,tx=5.8;
   for(const s of [-1,1]){barre('O',.12,[cx,.1,hz+s*.35],[6.0,.1,hz+s*.85]);pneu(6.0,.07,hz+s*.85,.07,.05,0,0,Math.PI/2);cb('A',.06,.08,.12,6.0,.14,hz+s*.85,0,0,0,.005);
     pneu(cx+.1,.07,hz+s*.72,.07,.05,0,0,Math.PI/2);}
   barre('O',.12,[cx,.1,hz-.76],[cx,.1,hz+.76]);
   cb('O',.16,2.25,.16,cx,1.22,hz,0,0,0,.02);cl('C',.04,.24,8,cx,2.3,hz,Math.PI/2);
   barre('O',.14,[cx+.05,2.3,hz],[6.5,2.72,hz]);barre('A',.1,[6.7,2.69,hz],[tx-.04,2.83,hz]);
   seg('R',.07,[cx-.08,.75,hz],[8.5,1.75,hz],10);seg('C',.035,[8.5,1.75,hz],[7.76,2.46,hz],8);
   seg('C',.018,[cx-.12,.95,hz],[cx-.55,1.45,hz+.3]);seg('D',.026,[cx-.5,1.39,hz+.27],[cx-.62,1.53,hz+.35]);
   for(let i=0;i<14;i++)to('C',.03,.009,tx,2.76-i*.066,hz,0,i%2?Math.PI/2:0,0,4);          // la chaîne
   to('A',.06,.018,tx,1.8,hz,0,0,Math.PI,4,Math.PI*1.3);barre('A',.06,[tx-.42,1.72,hz],[tx+.42,1.72,hz]);
   for(const s of [-.36,.36])seg('C',.01,[tx+s,1.7,hz],[tx+s*.8,1.36,hz+(s>0?.3:-.3)]);
   moteur(tx,.9,hz);}
  // LE MOTEUR SUR PIED : pied en T à roulettes, colonne, bras et platine boulonnée derrière le volant
  {const mz=-2.2,mx=8.75;
   for(const s of [-1,1]){barre('R',.1,[9.8,.08,mz+s*.3],[8.0,.08,mz+s*.55]);pneu(8.0,.06,mz+s*.55,.06,.045,0,0,Math.PI/2);}
   barre('R',.1,[9.8,.08,mz-.45],[9.8,.08,mz+.45]);for(const s of [-1,1])pneu(9.8,.06,mz+s*.45,.06,.045,0,0,Math.PI/2);
   cb('R',.12,1.1,.12,9.75,.66,mz,0,0,0,.02);barre('R',.1,[9.75,1.2,mz],[9.4,1.2,mz]);
   cl('A',.2,.05,16,9.37,1.2,mz,0,0,Math.PI/2);for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;cb('A',.03,.04,.14,9.33,1.2+Math.sin(a)*.12,mz+Math.cos(a)*.12,-a,0,0,.005);}
   moteur(mx,1.25,mz);}
  // LE RACK : montants bleus à croisillons, lisses orange, planchers d'acier — bacs, jantes, jerricans, cartons, un pneu
  {const rx0=9.6,rz0=3.4;
   for(const px of [-.68,.68])for(const s of [-2.1,2.1]){cb('B',.1,4.3,.1,rx0+px,2.15,rz0+s,0,0,0,.012);cb('F',.16,.02,.16,rx0+px,.01,rz0+s,0,0,0,0);}
   for(const s of [-2.1,2.1])for(let j=0;j<4;j++)barre('B',.035,[rx0-.66,.3+j*1.0,rz0+s],[rx0+.66,.8+j*1.0,rz0+s]);
   for(let i=0;i<4;i++){const y9=.5+i*1.15;for(const px of [-.7,.7])cb('O',.06,.12,4.3,rx0+px,y9,rz0,0,0,0,.012);
     cb('A',1.36,.025,4.2,rx0,y9+.055,rz0,0,0,0,.005);for(let k=0;k<6;k++)cb('F',1.36,.02,.03,rx0,y9+.03,rz0-1.8+k*.72,0,0,0,0);}
   
   for(let i=0;i<3;i++)jante(rx0,1.77+i*.1,rz0+1.2,.32,5);pneu(rx0,4.14,4.3,.37,.235,0,.3,0);}
  // LE DISTRIBUTEUR : caisse laquée, chapeau, cadre chromé de la vitrine, trappe, fente à pièces, pieds
  {const dx=10.3,dz=8.4,fx=9.85;
   cb('R',.9,1.94,1.5,dx,1.03,dz,0,0,0,.04);cb('N',.96,.16,1.56,dx,2.06,dz,0,0,0,.03);cb('D',.86,.06,1.44,dx,.03,dz,0,0,0,.01);
   for(const s of [-1,1])cb('C',.03,1.56,.04,fx-.01,1.15,dz+s*.62,0,0,0,.006);for(const y9 of [.39,1.91])cb('C',.03,.04,1.28,fx-.01,y9,dz,0,0,0,.006);
   cb('N',.05,.3,.74,fx-.005,.22,dz,0,0,0,.01);cb('D',.06,.12,.6,fx-.02,.2,dz,0,0,0,.006);cb('C',.02,.1,.06,fx-.01,.22,dz+.56,0,0,0,.004);
   cb('C',.012,.04,1.3,fx-.006,2.06,dz,0,0,0,0);}
  flat(vendTex,9.82,1.15,8.4,1.2,1.5,-Math.PI/2);
  
  for(let i=-1;i<=1;i++){cb('G',.06,1.3,2.6,hw-.16,4.6,i*4.4,0,0,0,0);                   // fenêtres hautes : verre, dormant, croisillons
    for(const s of [-1,1])cb('F',.08,1.42,.1,hw-.2,4.6,i*4.4+s*1.33,0,0,0,.01);for(const y9 of [3.93,5.27])cb('F',.08,.1,2.76,hw-.2,y9,i*4.4,0,0,0,.01);
    cb('F',.05,1.3,.05,hw-.19,4.6,i*4.4,0,0,0,0);cb('F',.05,.05,2.6,hw-.19,4.6,i*4.4,0,0,0,0);}
  

  // ===== LE PONT ÉLÉVATEUR : deux poteaux en U, chariots, quatre bras à tampons, traverse haute, groupe hydraulique =====
  {const lx=9.9,lz=-10.3;cb('F',.5,.04,3.0,lx,.02,lz,0,0,0,.01);
   for(const s of [-1,1]){const cz=lz+s*1.7;
     cb('J',.5,3.5,.12,lx,1.75,cz+s*.16,0,0,0,.02);for(const sx of [-.22,.22])cb('J',.08,3.5,.34,lx+sx,1.75,cz,0,0,0,.015);
     cb('F',.62,.08,.62,lx,.04,cz,0,0,0,.015);for(const a of [[-.24,.24],[.24,.24],[-.24,-.24],[.24,-.24]])cl('C',.022,.05,6,lx+a[0],.1,cz+a[1]);
     for(let k=0;k<5;k++)cb('N',.012,.05,.36,lx-.266,.3+k*.14,cz,.6,0,0,0);                  // les zébrures au pied
     cb('F',.36,.5,.3,lx,.95,cz,0,0,0,.02);seg('C',.01,[lx+.14,.7,cz-s*.08],[lx+.14,3.4,cz-s*.08]);
     for(const sx of [-1,1]){const tx=lx+sx*.95,tz=lz+s*.55;barre('J',.1,[lx+sx*.12,.8,cz],[tx,.8,tz]);
       lt('D',[[0,0],[.12,0],[.12,.05],[.1,.07],[0,.07]],12,tx,.85,tz);cl('A',.05,.08,8,tx,.82,tz);}
     cb('J',.14,.14,.14,lx,3.58,cz,0,0,0,.02);}
   barre('J',.16,[lx,3.62,lz-1.9],[lx,3.62,lz+1.9]);cb('F',.05,.06,3.2,lx-.1,3.46,lz,0,0,0,.01);
   cl('N',.1,.3,12,lx+.44,1.25,lz-1.7,Math.PI/2);cb('R',.18,.34,.22,lx+.44,.9,lz-1.7,0,0,0,.02);cl('Or',.03,.05,6,lx+.44,1.1,lz-1.7);}

  // ===== LE COULOIR DE LA CAMÉRA : que du RAS DU SOL =====
  // Entre le plateau (4,4 m) et les murs (8,5 m) s'étendait un désert de béton : la caméra passe
  // par là, on ne peut rien y poser de HAUT. Mais elle vole à 1 m minimum et regarde la caisse —
  // donc tout ce qui reste sous 50 cm est autorisé. C'est là que vit le vrai bazar d'un garage :
  // ce qu'on a posé par terre en se disant qu'on le rangerait plus tard.
  pneu(5.9,.118,3.3,.37,.235,0,0,0);jante(5.9,.285,3.3,.25,6);pneu(6.5,.118,2.62,.37,.235,0,.5,0);   // deux pneus, une jante posée dessus
  pneu(-5.4,.118,-5.6,.37,.235,0,.8,0);
  
  lt('F',[[.55,0],[.55,.02],[.5,.026],[0,.026]],20,-1.6,0,-6.4);for(let i=0;i<4;i++)cb('D',.8,.01,.07,-1.6,.03,-6.75+i*.23,0,0,0,0);  // la bouche d'égout
  
  // LE MOBILIER VERSÉ : une géométrie par matière, l'ombre cuite au pied (lpOmbre), le plancher lumineux relevé (uG)
  {const G9=MK.done(),GL={p:.22,c:.16,o:.2,s:.24,m:.16,g:.06};GAR.meubles=[];
   for(const f in G9){lpOmbre(G9[f],1.1);const mt=lpMat(f);if(mt.userData.uG)mt.userData.uG.value=GL[f]!=null?GL[f]:.2;
     /* le satiné et le mat de lpMat n'ont pas de cube d'environnement — une variante de programme que la CAISSE n'emploie pas (mesuré :
        141 programmes au menu contre 140). Ils prennent le cube (8 % de reflet sur le satiné, 0 sur le mat) : le programme de la caisse. */
     if(!mt.envMap){mt.envMap=envTex;mt.combine=THREE.MixOperation;mt.reflectivity=f==='s'?.08:0;}
     const me=new THREE.Mesh(G9[f],mt);me.matrixAutoUpdate=false;me.updateMatrix();g.add(me);GAR.meubles.push(me);}}
  /* LES MEUBLES POSÉS : une ombre douce à l'ENCRE sous chaque gros meuble (la recette de l'ombre de la caisse, blobTex) — sans elle,
     établi, servante, compresseur, rack flottaient sur l'époxy. Toutes dans UNE géométrie (un seul appel de dessin). */
  {const F9=[[-3,zB,9.8,1.5],[-9.4,-1.6,.8,1.5],[-9.5,2.6,.9,2.1],[-9.6,-7.2,.8,.8],[-9.6,-5.1,.8,.8],[-9.4,7.4,.8,.8],[-8.9,5.6,.7,.7],
     [-9.9,-9.4,1.2,1.0],[7.7,-6.4,3.4,1.8],[9.0,-2.2,1.9,1.2],[9.6,3.4,1.5,4.4],[10.3,8.4,.9,1.5],[-5.6,10.4,3.2,1.0],[9.9,-10.3,1.2,4.0],
     [-8.2,-5.4,.6,1.4],[-8.6,1.2,.5,1.5],[7.6,-4.2,.6,.6],[-8.16,9.2,1.3,.3]],P9=[],U9=[];
   for(const f of F9){if([[-8.9,5.6],[-9.9,-9.4],[-5.6,10.4],[-8.2,-5.4],[-8.6,1.2],[7.6,-4.2],[-8.16,9.2]].some(o=>o[0]===f[0]&&o[1]===f[1]))continue; // (l'atelier aéré) plus d'ombre sans meuble
     const w9=f[2]*1.5+.4,d9b=f[3]*1.5+.4,x0=f[0]-w9/2,x1=f[0]+w9/2,z0=f[1]-d9b/2,z1=f[1]+d9b/2;
     P9.push(x0,.009,z1, x1,.009,z1, x1,.009,z0, x0,.009,z1, x1,.009,z0, x0,.009,z0);U9.push(0,0,1,0,1,1,0,0,1,1,0,1);}
   const gA=new THREE.BufferGeometry();gA.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));gA.setAttribute('uv',new THREE.Float32BufferAttribute(U9,2));
   const mA=new THREE.Mesh(gA,new THREE.MeshBasicMaterial({map:blobTex,color:0x0a1226,transparent:true,opacity:.72,fog:false,depthWrite:false}));mA.renderOrder=-1;g.add(mA);}
  // ===== LE PLAFOND QUI ÉCLAIRE : six tubes, leur cône de poussière, et la baladeuse =====
  // (2026-09-26, vague 2) les tubes à .62 de blanc (0xfff3d2 → 0x9e9682) et les cônes à .05 (.085) : plein blanc, les tubes passaient
  // au-dessus du seuil du bloom et BRÛLAIENT le haut de l'écran en taches laiteuses, et les six cônes additifs voilaient toute la moitié
  // haute d'un lait bleuté. Un tube allumé se lit à sa FORME (une barre nette sur un plafond noir), pas à son éblouissement.
  const tubeM=BA(0x9e9682),tubeF=BA(0x9e9682);
  // ⚠ CÔNES DE LUMIÈRE EN FrontSide, jamais DoubleSide : en tournant, la caméra ENTRE dans un cône
  // — en double face on se retrouvait derrière un voile blanc plein écran (la face arrière plus la
  // face avant, additionnées). En face avant seule, le cône DISPARAÎT dès qu'on est dedans, et il
  // reste franc vu de l'extérieur. Le voile, c'était ça.
  const haloM=new THREE.MeshBasicMaterial({color:0xffe7bb,transparent:true,opacity:.05,depthWrite:false,fog:false,
    blending:THREE.AdditiveBlending,side:THREE.FrontSide});
  const haloF=haloM.clone();
  for(const p of [[-3.4,-8.6],[3.4,-8.6],[-3.4,0],[3.4,0],[-3.4,8.6],[3.4,8.6]]){
    bx(p[0],5.52,p[1],1.0,.16,3.0,M.acier);
    const last=(p[0]>0&&p[1]>0);                                       // LE tube au mauvais starter
    const tb=add9(BX,last?tubeF:tubeM,p[0],5.38,p[1],.84,.11,2.8);
    const ha=add9(CN,last?haloF:haloM,p[0],3.2,p[1],3.9,4.4,3.9);
    GAR.tubes.push(tb);GAR.halos.push(ha);
    if(last)GAR.flick={t:tb,h:ha};}
  {const piv=new THREE.Group();piv.position.set(-4.6,H,-9.6);g.add(piv);GAR.drop=piv;   // LA BALADEUSE
   const cord=new THREE.Mesh(CY,M.noir);cord.scale.set(.03,2.4,.03);cord.position.y=-1.2;piv.add(cord);
   const ab=new THREE.Mesh(CN,M.acier);ab.scale.set(.66,.5,.66);ab.position.y=-2.55;piv.add(ab);
   const amp=new THREE.Mesh(CY8,BA(0xfff0c8));amp.scale.set(.22,.22,.22);amp.position.y=-2.72;piv.add(amp);
   const hh=new THREE.Mesh(CN,haloM);hh.scale.set(2.4,2.8,2.4);hh.position.y=-4.1;piv.add(hh);}
  for(let i=0;i<14;i++){                                                // fanions de course au-dessus de la porte
    const u=i/13,px=-9.5+u*19,py=5.25-Math.sin(u*Math.PI)*.5;
    const f=add9(PL,BA(([0xe9b94a,0xf4ead2,0xffffff,0xc99a3a])[i%4],{side:THREE.DoubleSide}) /* (garage-lumiere) la guirlande : or, crème, blanc */,px,py-.16,10.8,.28,.34,1);
    f.rotation.z=Math.PI/4;f.rotation.y=.4;}
  // POUSSIÈRE EN SUSPENSION : 110 points qui montent lentement dans les cônes. C'est le détail qui
  // fait passer un décor de « propre » à « habité » — et ça tient en un seul draw call.
  {const N=110,pos=new Float32Array(N*3),vel=new Float32Array(N);
   for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*W*.86;pos[i*3+1]=.3+Math.random()*(H-.9);pos[i*3+2]=(Math.random()-.5)*D*.86;vel[i]=.05+Math.random()*.14;}
   const gd=new THREE.BufferGeometry();gd.setAttribute('position',new THREE.BufferAttribute(pos,3));
   GAR.dust=new THREE.Points(gd,new THREE.PointsMaterial({color:0xffe4bb,size:.055,transparent:true,opacity:.5,
     depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
   g.add(GAR.dust);GAR.dustV=vel;}
  // ---- LES BLOCS D'IMPACT (2026-09-05) : quand on TAPE la caisse (clic bref, pas un glissé), elle
  // encaisse — dix petits cubes giclent, comme des tessons, avant de retomber. Un seul geste, deux
  // aveux : recul de la caisse (voir garageRender) + cette pluie de blocs. Créés UNE fois ici,
  // recyclés à chaque tap (voir `garageImpact`) — pas une allocation par clic.
  {const N=10,IB=new THREE.BoxGeometry(.09,.09,.09);GAR.impactMeshes=[];GAR.impactVel=[];
   for(let i=0;i<N;i++){
     const m=new THREE.Mesh(IB,BA([0xffd75e,0xff8a3d,0xffef9e][i%3]));
     m.visible=false;g.add(m);GAR.impactMeshes.push(m);GAR.impactVel.push({x:0,y:0,z:0,rx:0,ry:0});}
  }
  /* ===== L'ATELIER v2 — LA LUMIÈRE ET LA MATIÈRE (2026-09-30, Sacha : « améliore le modèle 3D du garage en le rendant plus beau ») =====
     Le garage est devenu le MENU : c'est la première image du jeu. Il était juste (tout y est) mais plat — un sol bleu nuit uni qui
     prenait la moitié basse de l'écran, des murs de la même couleur partout, un plafond noir, et le feu de la porte qui n'éclairait rien.
     Léo a demandé un atelier SOBRE : on n'ajoute pas de bazar, on travaille ce qui fait une belle image — la MATIÈRE et la LUMIÈRE.
     · le SOL devient un époxy sombre en grandes dalles, BRILLANT (Phong : les deux lampes qui suivent la caméra y courent en reflets), et
       il REFLÈTE la porte en feu : c'est la VRAIE texture du feu (même objet, zéro envoi de plus), à plat, en miroir, fondue vers la salle ;
     · le FEU ÉCLAIRE : trois nappes de lumière peintes (façade autour de l'ouverture, murs latéraux, plafond côté porte), additives, qui
       battent avec les flammes — « lumière cuite », aucune lumière ajoutée ;
     · la PORTE est un portail : liseré néon rose autour de l'ouverture, bandes de danger, deux gyrophares ambrés qui tournent ;
     · le PLAFOND a ses bandes LED sous les poutres : des lignes qui filent vers le feu ;
     · le PLATEAU est une pièce de showroom : dessus en acier brossé brillant, anneau de LED qui court, halo sous la caisse et au sol ;
     · des BRAISES sortent du feu et dérivent dans l'atelier.
     ⚠ Rien de haut dans l'anneau de la caméra (règle des 8,3 m) : tout est plaqué aux murs, au plafond ou au ras du sol. ⚠ Aucune
     lumière ajoutée. ⚠ Nappes additives en FrontSide (le voile blanc plein écran, voir les cônes des tubes). Tout est animé par garBeaute. */
  {const B9=GAR.beau={};
   const add=(o)=>{g.add(o);return o;};
   const nappe=(tex,col,x,y,z,w,h,op)=>{const m=add(new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:tex,color:col,transparent:true,opacity:op,
     fog:false,depthWrite:false,blending:THREE.AdditiveBlending})));m.position.set(x,y,z);m.scale.set(w,h,1);return m;};
   /* --- LE REFLET DU FEU : la VRAIE texture du rideau de flammes, au sol, en miroir. Un plan couché de 6 m ne marchait pas : vu de la
      caméra du menu (≈3 m de haut, ≈22 m de la porte), la perspective l'écrasait en un filet sous la porte. Un miroir, lui, montre le haut
      de la porte LOIN devant elle : le point de hauteur y se reflète à d·hc/(hc+y) de la caméra. Le ruban suit donc cette loi, rangée par
      rangée (24 rangées) — exact depuis le menu, un reflet traîné (le sol est brillant, pas un miroir) dès qu'on tourne. Couleurs de sommet
      = le fondu : fort au seuil, éteint vers la salle. */
   {const N=24,d0=22,hc=3,pos=[],uv=[],col=[],idx=[];
    for(let r=0;r<=N;r++){const v=r/N,y9=4.9*v,dz=d0-d0*hc/(hc+y9),f9=Math.pow(Math.max(0,1-v*1.6),2); // (Léo, « le reflet au sol ») fondu plus court : il s'éteint à 60 % de la hauteur
      for(const sx of [-1,1]){pos.push(sx*4.72,0,-dz);uv.push(sx<0?1:0,v);col.push(f9,f9,f9);}}
    for(let r=0;r<N;r++){const a=r*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const gR=new THREE.BufferGeometry();gR.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gR.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    gR.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gR.setIndex(idx);
    const rf=add(new THREE.Mesh(gR,new THREE.MeshBasicMaterial({map:GAR.feu.tex,vertexColors:true,color:0xb8b8b8,transparent:true,opacity:.5,fog:false,depthWrite:false,
      blending:THREE.AdditiveBlending,toneMapped:false,side:THREE.DoubleSide})));
    rf.position.set(0,.014,hd);rf.renderOrder=-1;B9.reflet=rf;}
   // --- LES NAPPES DU FEU : la façade autour de l'ouverture, les deux murs, le plafond côté porte
   const facTex=cvT(256,72,(x,w,h)=>{ // l'ouverture fait 9,6 × 4,7 m dans une façade de 22,6 × 6,2 : trou au centre-bas
     const ox=w*(9.6/22.6)/2,oy=h*(4.7/6.2);
     const gr=x.createRadialGradient(w/2,h,ox*.6,w/2,h,w*.48);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);
     x.globalCompositeOperation='destination-out';x.fillStyle='#000';x.fillRect(w/2-ox,h-oy,ox*2,oy);});
   B9.fac=nappe(facTex,0xb23f11,0,3.1,hd-.02,22.6,6.2,.5);B9.fac.rotation.y=Math.PI;
   const murTex=cvT(128,32,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.7,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,1)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';
     const gv=x.createLinearGradient(0,0,0,h);gv.addColorStop(0,'rgba(0,0,0,.25)');gv.addColorStop(.6,'rgba(0,0,0,1)');gv.addColorStop(1,'rgba(0,0,0,.7)');x.fillStyle=gv;x.fillRect(0,0,w,h);});
   B9.murG=nappe(murTex,0xb23f11,hw-.02,3.1,hd-6,12,6.2,.42);B9.murG.rotation.y=-Math.PI/2;              // x > 0 : u croît vers la porte
   B9.murD=nappe(murTex,0xb23f11,-hw+.02,3.1,hd-6,-12,6.2,.42);B9.murD.rotation.y=Math.PI/2;             // (miroir : échelle négative)
   const plaTex=cvT(64,128,(x,w,h)=>{const gr=x.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,1)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';const gh=x.createLinearGradient(0,0,w,0);
     gh.addColorStop(0,'rgba(0,0,0,0)');gh.addColorStop(.3,'rgba(0,0,0,1)');gh.addColorStop(.7,'rgba(0,0,0,1)');gh.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gh;x.fillRect(0,0,w,h);});
   B9.plaf=nappe(plaTex,0xb23f11,0,H-.02,hd-6,W-1,12,.16);B9.plaf.rotation.x=Math.PI/2;
   // --- LE PORTAIL : liseré néon rose autour de l'ouverture (un cœur blanc, un halo rose — le bloom finit le travail)
   const neoTex=cvT(32,4,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);
     gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.36,'rgba(255,176,90,.55)');gr.addColorStop(.5,'rgba(255,248,236,1)');gr.addColorStop(.64,'rgba(255,176,90,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);});
   B9.neons=[];
   for(const sx of [-1,1]){const m=nappe(neoTex,0xffffff,sx*4.64,2.32,hd-.33,.46,4.62,.95);m.rotation.y=Math.PI;B9.neons.push(m);}
   {const m=nappe(neoTex,0xffffff,0,4.62,hd-.33,.46,9.28,.95);m.rotation.set(0,Math.PI,Math.PI/2);B9.neons.push(m);}
   // les bandes de danger de part et d'autre de l'ouverture (peintes, éclairées : elles ne brillent pas, elles SE LISENT)
   const danTex=cvT(32,32,(x,w,h)=>{x.fillStyle='#e8ae1c';x.fillRect(0,0,w,h);x.fillStyle='#12151c';
     for(let i=-1;i<3;i++){x.beginPath();x.moveTo(i*16,h);x.lineTo(i*16+8,h);x.lineTo(i*16+8+h,0);x.lineTo(i*16+h,0);x.fill();}});
   danTex.wrapS=danTex.wrapT=THREE.RepeatWrapping;danTex.repeat.set(1,11);
   const danM=L(0xffffff,0x1a1204,{map:danTex});
   for(const sx of [-1,1]){const m=add(new THREE.Mesh(PL,danM));m.position.set(sx*5.15,2.36,hd-.015);m.scale.set(.36,4.7,1);m.rotation.y=Math.PI;}
   // les deux GYROPHARES ambrés, en haut de l'ouverture : un socle, un dôme, et le halo qui tourne (un sprite qui bat)
   B9.gyro=[];
   for(const sx of [-1,1]){bx(sx*5.3,4.9,hd-.24,.26,.12,.26,M.fer);
     cy(sx*5.3,5.03,hd-.24,.1,.16,BA(0xffb22e));
     const sp=add(new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:0xffa218,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})));
     sp.position.set(sx*5.3,5.04,hd-.34);sp.scale.set(2.2,1.3,1);B9.gyro.push({s:sp,ph:sx>0?0:Math.PI*.85});}
   // --- LE PLAFOND : une bande LED sous chaque poutre, et deux qui filent le long des gaines vers le feu
   const ledM=BA(0xfff0dc); // (garage-lumiere) blanc chaud
   for(let i=-2;i<=2;i++)bx(0,H-.86,i*5.4,W-1.4,.035,.1,ledM);
   for(const px of [-3.4,3.4])bx(px,H-1.12,0,.05,.035,D-2,ledM);
   // --- LE PLATEAU DE SHOWROOM : le dessus en acier brossé brillant (le côté et le dessous gardent le fer)
   const podTex=cvT(512,512,(x,w,h)=>{x.fillStyle='#1b2130';x.fillRect(0,0,w,h);
     for(let r=8;r<256;r+=3){x.strokeStyle='rgba('+(Math.random()<.5?'0,0,0,':'170,190,230,')+(Math.random()*.08).toFixed(3)+')';x.lineWidth=1.5;x.beginPath();x.arc(256,256,r,0,7);x.stroke();} // le brossé
     x.strokeStyle='rgba(120,150,210,.08)';x.lineWidth=2;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.beginPath();x.moveTo(256+Math.cos(a)*70,256+Math.sin(a)*70);x.lineTo(256+Math.cos(a)*238,256+Math.sin(a)*238);x.stroke();}
     for(const r of [70,150,238]){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=4;x.beginPath();x.arc(256,256,r,0,7);x.stroke();
       x.strokeStyle='rgba(160,190,240,.22)';x.lineWidth=1.5;x.beginPath();x.arc(256,256,r+3,0,7);x.stroke();}});
   dis.material=[M.fer,new THREE.MeshPhongMaterial({color:0xffffff,map:podTex,specular:0x252c3c,shininess:30,emissive:0x05070c,fog:false}),M.fer];
   // l'anneau de LED qui COURT : deux comètes de tirets, qui tournent plus vite que le plateau (voir garBeaute)
   const ledTex=cvT(512,512,(x,w,h)=>{const N=72,r0=256*4.18/4.42,r1=256*4.36/4.42;x.lineCap='butt';
     for(let i=0;i<N;i++){const a=i/N*Math.PI*2,q=(i%(N/2))/(N/2),v=.1+.9*Math.pow(1-q,2.2);
       x.strokeStyle='rgba(255,255,255,'+v.toFixed(3)+')';x.lineWidth=r1-r0;x.beginPath();x.arc(256,256,(r0+r1)/2,a,a+Math.PI*2/N*.62);x.stroke();}});
   const ledRing=new THREE.Mesh(new THREE.RingGeometry(4.12,4.42,96,1),new THREE.MeshBasicMaterial({map:ledTex,color:0xfff0d2,transparent:true,opacity:.9,
     fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
   ledRing.rotation.x=-Math.PI/2;ledRing.position.y=GAR.POD+.006;g.add(ledRing);B9.led=ledRing; // hors du plateau : il tourne À SA vitesse
   // le halo SOUS la caisse (sur le plateau) et le halo du plateau AU SOL
   const haloTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,63);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.35)');
     gr.addColorStop(.8,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);});
   B9.sous=nappe(haloTex,0xffd9a6,0,GAR.POD+.009,0,7.4,7.4,.22);B9.sous.rotation.x=-Math.PI/2;B9.sous.renderOrder=1;
   const solHaloTex=cvT(256,256,x=>{const gr=x.createRadialGradient(128,128,0,128,128,127);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.66,'rgba(255,255,255,0)');
     gr.addColorStop(.72,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);});
   /* --- (2026-10-05, Léo : « travaille plus le rendu ») L'OMBRE AU PIED DES MURS : les murs tombaient sur l'époxy sans un pli de lumière,
      la pièce se lisait comme un décor de carton. Une bande d'encre de 2,2 m qui s'estompe vers la salle, le long des trois murs et des deux
      pans de la façade (pas devant l'ouverture : le reflet du feu y vit) ; les coins, doublés, sont plus sombres — comme en vrai. Une
      géométrie, une matière, aucune lumière. */
   {const aoTex=cvT(8,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.5)');
      gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
    const mAO=new THREE.MeshBasicMaterial({map:aoTex,color:0x050a18,transparent:true,opacity:.62,fog:false,depthWrite:false}),L9=2.2,o9=hw-4.8;
    for(const b of [[0,-hd+L9/2,W,0],[-hw+L9/2,0,D,Math.PI/2],[hw-L9/2,0,D,-Math.PI/2],[-(4.8+o9/2),hd-L9/2,o9,Math.PI],[4.8+o9/2,hd-L9/2,o9,Math.PI]]){
      const m=add(new THREE.Mesh(PL,mAO));m.rotation.set(-Math.PI/2,b[3],0,'YXZ');m.position.set(b[0],.012,b[1]);m.scale.set(b[2],L9,1);m.renderOrder=-1;}}
   B9.solHalo=nappe(solHaloTex,0xb4c0d6,0,.016,0,13,13,.3);B9.solHalo.rotation.x=-Math.PI/2;B9.solHalo.renderOrder=-1;
   // --- LES BRAISES : 64 étincelles qui sortent du feu, montent, dérivent dans l'atelier et s'éteignent (un seul appel de dessin)
   {const N=64,pos=new Float32Array(N*3),v=new Float32Array(N*4);
    for(let i=0;i<N;i++){pos[i*3+1]=-50;v[i*4+3]=Math.random()*3;} // (au départ hors de vue ; elles naissent au fil des secondes)
    const gb=new THREE.BufferGeometry();gb.setAttribute('position',new THREE.BufferAttribute(pos,3));
    B9.braises=add(new THREE.Points(gb,new THREE.PointsMaterial({color:0xff9a3c,size:.075,transparent:true,opacity:.85,depthWrite:false,fog:false,blending:THREE.AdditiveBlending})));
    B9.braises.frustumCulled=false;B9.bv=v;}
  }
  try{buildAffiches(g);}catch(e){console.warn('affiches',e);}
  try{vdepEtal(g);}catch(e){console.warn('étal',e);} // (2026-10-19) LA VITESSE DE DÉPART : l'étal du moteur soulevé, à gauche de la porte
  try{garArgent(g);}catch(e){console.warn('argent',e);} // (2026-10-01) les TAS DE BILLETS : le compte se voit dans l'atelier (voir « L'ARGENT DE L'ATELIER »)
  try{gmHoloBuild(g);}catch(e){console.warn('missions',e);} // (2026-09-30) les hologrammes des MISSIONS (invisibles hors de leur écran) // (2026-09-30) LES AFFICHES DE RECORDS, de part et d'autre de la porte
  return g;
}
/* `garageGo(d)` — passer à la caisse suivante/précédente EN MACHINE.
   ⚠ DEUX PORTES D'ENTRÉE, ET C'EST VOULU : `garageShow(i)` reste le chemin INSTANTANÉ, appelé à
   l'ouverture du garage, à la bascule de langue, après un achat (`dbgBuy`). Y coller l'animation
   ferait tourner le plateau à chaque changement de langue. `garageGo` est le chemin JOUEUR, et lui
   seul déclenche le retourneur. ⚠ si une bascule est déjà en cours on retombe sur l'instantané :
   marteler ◀ ▶ relancerait l'animation à mi-course et la caisse resterait écrasée. */
/* ============================================================================
   LE LÂCHER (2026-08-30) — on ne « ferme pas le garage pour lancer la partie », la caisse SORT.
   ----------------------------------------------------------------------------
   Trois gestes en 1,7 s, et c'est leur ORDRE qui fait la sensation :
     1. l'APPUI   — la caisse s'assoit sur ses suspensions, l'anneau du plateau s'embrase ;
     2. la SORTIE — elle part vers la porte en ACCÉLÉRANT (u², jamais linéaire : une voiture qui
        démarre à vitesse constante ne démarre pas, elle glisse) ;
     3. la PRISE DE VUE — la caméra quitte son orbite et vient se planter DERRIÈRE elle, à hauteur
        de pare-chocs, exactement là où elle sera pendant la course.
   ⚠ LE VOILE N'EST PAS UN EFFET, C'EST UN RACCORD. L'atelier et le départ de piste sont deux
   endroits sans rapport dans la scène : à la fin de la séquence il y a forcément une COUPE. Un
   fondu de 0,34 s la rend invisible ; sans lui, on téléporte le joueur et tout le travail de
   caméra est perdu sur la dernière frame.
   ⚠ la caisse VISE +Z : c'est le côté de la porte (le halo de sol est posé à `hd+rL/2`) et c'est
   aussi le nez de la caisse (les pots sont à `-l/2`, donc à l'arrière, en -Z). Les deux coïncident,
   il n'y a rien à retourner — mais si un jour la porte déménage, c'est ici que ça se règle. */
function garageLaunch(){
  if(GAR.go||!garageOn)return;
  // (2026-09-28) JOUER PENDANT UNE BASCULE : la bascule dure 1,06 s et le LÂCHER refusait de partir tant qu'elle tournait — changer
  // de caisse puis taper JOUER dans la seconde ne lançait RIEN. On la TERMINE sur-le-champ, exactement comme sa dernière image
  // (l'échange s'il n'a pas eu lieu, puis scanner éteint, échelle rendue) : la caisse qui sort est bien celle qu'on vient de choisir.
  if(GAR.sw){const SW=GAR.sw;GAR.sw=null;if(!SW.fait)garageShow(SW.to);if(GAR.scan)GAR.scan.visible=false;carGroup.scale.set(1,1,1);}
  window.__offGar=false; // (2026-10-14, chasse aux bugs) une course part : plus de RETOUR d'OFFRES vers le garage
  window.__setGar=false; // (2026-10-19) …ni des RÉGLAGES (le ⚙ du garage)
  window.__mRetour=null; // (2026-09-29) une course part de l'atelier : l'écran qui l'attend à la fin, c'est la mort, pas les missions
  try{ if(carUnlocked(garageI)){const be=$('gEquip'); if(be&&be.getAttribute('aria-disabled')!=='true')be.click();} }catch(e){}
  if(CHUTE.on){chuteLance();return;} // (2026-09-30) LA CHUTE : depuis le ciel, pas de porte — elle PIQUE vers la route (voir chuteRender)
  if(!GAR._v)GAR._v=new THREE.Vector3();
  if(!GAR._c)GAR._c=new THREE.Vector3();
  /* (2026-09-30, Léo : « fais le retour vers la porte (mieux) quand on appuie sur PLAY ») LE RETOUR AU FEU : si le regard est parti
     ailleurs (le glissé, le balancement), JOUER ramène d'abord la vue derrière la caisse, face à la porte en feu — un travelling
     lissé (smootherstep) dont la durée suit l'angle à rattraper (~0,3 s pour 25°, ~1,1 s pour un demi-tour) — pendant que le plateau
     remet la caisse face à la porte. Le lâcher part ENSUITE, de la vue de toujours (p0/r0 relevés à la fin du retour). */
  GAR.vA=(GAR.vA||0)+(GAR.swO||0);GAR.swO=GAR.swP=GAR.swK=0;GAR.vW=0;
  const dv=Math.atan2(Math.sin(GAR.vA),Math.cos(GAR.vA)),dr=Math.atan2(Math.sin(garRot()),Math.cos(garRot()));GAR.vA=GAR.vAc=dv;
  const mk0=GMIS.mk>.02?GMIS.mk:0; // (missions) la vue d'ensemble redescend derrière la caisse pendant le même retour
  const vd0=GAR.vD||0,wd0=GAR.wD||0; // (vitrine) la visée sur l'entrée et le décalage de composition se défont pendant le retour (sinon la vue sautait au départ)
  const pre=(Math.abs(dv)>.12||Math.abs(garagePitch-.2)>.1||mk0||Math.abs(vd0)>.02||wd0>.02)?{t:0,D:Math.max(mk0?.8:0,(wd0>.02?.55:.25)+.28*Math.max(Math.abs(dv),Math.abs(dr)*.5,Math.abs(vd0))),v0:dv,g0:garageAng,gd:dr,p0:garagePitch,mk0:mk0,vd0:vd0}:null;
  GAR.go={t:0,pre:pre,p0:pre?null:camera.position.clone(),lx0:-Math.sin(garCamA())*1.5,lz0:-Math.cos(garCamA())*1.5,voile:false,quiet:gEl.classList.contains('quiet'),r0:dr}; // r0 : où le plateau l'avait tournée
  gEl.classList.add('launching');document.body.classList.remove('garMenuH'); // dès qu'on PART, la vitrine s'efface — qu'on l'ait parcourue ou pas
  pbjDepart(); // (15/10) POUCE BLEU : le morceau de la course entre pendant le piqué (son intro)
  if(!pre)garLacherSon();
}
function garLacherSon(){try{if(SONV2)sfx('garage.lacher',{vol:-8});else{noiseBurst(.6,.07,420);chimeNote(196,0,.5,.06);}}catch(e){}} /* (2026-10-16) −8 dB, et le repli −10 dB : c'était le BOOM du début de partie (voir LE PIQUÉ QUI NE CRIE PLUS) */ /* (console de son) LE LÂCHER : moteur, turbo, départ, et le WHOOSH du voile (1,36 s) — le 196 Hz hors gamme reste en repli ; après LE RETOUR AU FEU s'il y en a un */
// `playViaGarage()` — UNE SEULE PORTE D'ENTRÉE POUR LANCER UNE COURSE (2026-09-05) : « on ne peut
// jouer que depuis le garage avec la porte qui s'ouvre » (demande du user). Le bouton JOUER du menu,
// REJOUER, la touche Entrée en fin de partie — tout ouvre le garage et enchaîne LE LÂCHER : c'est le
// MÊME geste (porte qui s'ouvre, boost, logo) qu'on vienne de gagner ou qu'on lance sa toute première
// partie, au lieu d'un raccourci direct qui aurait fait cohabiter deux façons de démarrer.
// ⚠ `openGarage(true)` — EN SOURDINE (2026-09-05 bis) : le premier jet montrait la fiche d'achat/
// échange pendant TOUTE la sortie de porte (« un bouton play séparé des achats de voitures », retour
// du user) — le garage reste la scène du départ, seule sa vitrine de shopping n'a rien à y faire.
function playViaGarage(tuto){
  if(pendingScore!=null||(started&&!gameOver))return; // course en cours, ou nom en cours de saisie : rien à faire
  // (2026-09-25, transitions App Store) le menu ne disparaît plus d'un coup sur l'atelier : fondu au noir, l'atelier
  // s'allume DESSOUS, et le LÂCHER démarre quand le voile se lève — la caméra quitte l'orbite sous les yeux du joueur.
  if(garageOn){if(tuto)tutoArme();garageLaunch();return;}
  ecranWipe(function(){if(tuto)tutoArme();openGarage(true);},function(){garageLaunch();});
}
let GSON9=false; // (2026-10-14, session SON) vrai quand une ACTION sonore (équiper, bascule de la caisse, carte, geste de l'atelier) vient de jouer dans CE geste : le clic « nav » se tait alors (il ne reste que la vibration) — remis à faux au début de chaque geste de vignette
function garageGo(d){
  if(GAR.go)return; // (2026-09-28) pendant la SORTIE (1,7 s), un glissé remplaçait la caisse qui roule vers la porte
  hap(8); // ◀ ▶, glissé, clavier : le doigt sent qu'on change de caisse (2026-09-26, charte règle 8) — (2026-10-14, session SON) l'oreille l'entend par l'ACTION (carte / bascule), plus par un tick nav EN PLUS ; le tick ne reste que là où rien d'autre ne sonne
  if(SHOP.tab!=='voiture'){ // BOUTIQUE : on feuillette les articles, la caisse reste la tienne
    shopShow(SHOP.tab,SHOP.i[SHOP.tab]+d);try{if(SONV2)sfx('ui.carte',{vol:-3});else chimeNote(d>0?880:660,0,.16,.14);}catch(e){}return;}
  if(!garageOn||!GAR.root||GAR.sw){uiClic('nav');garageShow(garageVoisin(garageI,d));return;}
  GAR.sw={t:0,fait:false,to:garageVoisin(garageI,d)};
  try{if(SONV2)sfx('garage.bascule');else{chimeNote(d>0?880:660,0,.16,.14);noiseBurst(.35,.09,900);}}catch(e){} /* (console de son) LA BASCULE, calée sur le retourneur de 1,06 s */
}
/* `garageImpact()` — LE TAP : un clic bref sur la caisse (pas un glissé, voir le seuil dans le
   `pointerup` plus bas) EST un petit coup. Elle recule d'un rien (voir `garageRender`, même minuteur
   `GAR.impactT`) et dix blocs giclent avant de retomber — la même caisse en accuse le geste, elle ne
   change pas encore de modèle. Le CHANGEMENT reste au swipe ou aux flèches, ce tap-ci ne fait que
   répondre au toucher. */
function garageImpact(){
  if(!garageOn||!GAR.root||GAR.sw||GAR.go||!GAR.impactMeshes)return;
  GAR.impactT=GAR.IMPACT_D;
  for(let i=0;i<GAR.impactMeshes.length;i++){
    const m=GAR.impactMeshes[i],a=Math.random()*Math.PI*2,sp=1.1+Math.random()*1.8;
    m.position.set((Math.random()-.5)*.3,GAR.POD+.35+Math.random()*.3,.9); // point d'impact : le nez de la caisse, à peu près — les 15 gabarits n'ont pas tous la même longueur, une valeur moyenne suffit pour un effet aussi bref
    m.rotation.set(Math.random()*6,Math.random()*6,0);m.visible=true;m.material.opacity=1;
    if(!m.material.transparent){m.material.transparent=true;}
    GAR.impactVel[i].x=Math.cos(a)*sp*.4;GAR.impactVel[i].y=1.6+Math.random()*1.6;GAR.impactVel[i].z=Math.sin(a)*sp*.4+2.2;
    GAR.impactVel[i].rx=(Math.random()-.5)*9;GAR.impactVel[i].ry=(Math.random()-.5)*9;
  }
  try{if(SONV2)sfx('garage.tole');else{chimeNote(340,0,.05,.10);noiseBurst(.14,.05,1400);}}catch(e){} /* (console de son) le TONK de tôle */
  try{caisseAction();}catch(e){} // (2026-10-20, Léo) L'ACTION SPÉCIALE de la caisse, s'il y en a une (LA CERISE / LE TOFU : les phares se lèvent) — après le coup commun à toutes
  // LES FLÈCHES SE MONTRENT : discrètes au repos, elles se rappellent au bon souvenir pile quand on
  // vient de toucher la caisse — c'est LE moment où « comment je change de voiture » se pose.
  const gp=$('gPrev'),gn=$('gNext');
  if(gp)gp.classList.add('hint');if(gn)gn.classList.add('hint');
  clearTimeout(garageImpact._t);
  garageImpact._t=setTimeout(()=>{if(gp)gp.classList.remove('hint');if(gn)gn.classList.remove('hint');},1800);
}
/* LE GARAGE NE MONTRE QUE CE QUI SE JOUE ICI (2026-09-25) : les caisses PREMIUM vivent dans la BOUTIQUE (vrai argent) ;
   elles n'entrent au garage qu'une fois achetées. `garageListe()` = les index visibles, dans l'ordre de la gamme. */
// (2026-09-26) LES CINQ FAMILLES, dans l'ordre (communes → défis), chacune du plus accessible au plus dur. Les LÉGENDAIRES y sont
// toutes : on les VOIT tourner sur le plateau (l'envie naît là) — leur bouton mène à la BOUTIQUE, seul endroit où elles s'achètent.
function garageListe(){let L=[];for(const r of RAR_FAM)L=L.concat(rarListe(r.id));return L;}
function garageVoisin(i,d){const L=garageListe();let k=L.indexOf(i);if(k<0)k=0;return L[((k+d)%L.length+L.length)%L.length];}
function garageShow(i){
  i=((i%CARS.length)+CARS.length)%CARS.length;if(garageListe().indexOf(i)<0)i=garageVoisin(i,0);
  garageI=i;
  buildCar(CARS[garageI]);
  const c=CARS[garageI];
  gNomEntre(TR(c.name));
  {const L9=garageListe();gLvlEl.textContent=(L9.indexOf(garageI)+1)+' / '+L9.length;} // (garage v6) le rang seul — l'onglet dit déjà VOITURES
  gSpdEl.textContent=''; // plus de km/h sur la fiche : la vitesse vient du MOTEUR, pas de la caisse
  // La caisse VERROUILLÉE annonce SA condition (et où tu en es) : c'est la carte du jeu, pas une
  // porte close. Une caisse débloquée garde sa punchline d'origine — le champ `desc` des 24 fiches
  // ressert enfin, il n'était plus affiché nulle part depuis le retrait de la carte de déblocage.
  const ouverte=carUnlocked(garageI),testOuv=TEST_CAISSES&&!carUnlockedVrai(garageI); // testOuv : ouverte pour le TEST seulement
  const u9=CAR_UNLOCK[garageI],dfi=!ouverte&&u9&&u9.k==='carnet';
  if(testOuv)gDescEl.innerHTML='<i class="gTest">TEST</i> '+(u9&&u9.k==='mis'?(m2Secrete(garageI)?m2SecretHtml():m2DebloqueHtml(m2Def(u9.id))):pxi('verrou')+' '+(u9&&u9.k==='premium'?TR('BOUTIQUE')+' — <b class="gEur">'+eurTxt(u9.eur)+'</b>':String(carUnlockText(garageI)).replace(/</g,'&lt;'))); // la VRAIE condition reste écrite (charte v5 : le prix en € en or, « TEST » en pastille discrète — elle disparaît avec TEST_CAISSES)
  else if(ouverte)gDescEl.textContent=LANG==='fr'?(c.desc||''):TR(c.desc||''); /* (2026-09-29) en police système : « Ça se voit », pas « Ca se voit » */else if(u9&&u9.k==='mis')gDescEl.innerHTML=m2Secrete(garageI)?m2SecretHtml():m2DebloqueHtml(m2Def(u9.id));else gDescEl.innerHTML=pxi('verrou')+' '+String(carUnlockText(garageI)).replace(/</g,'&lt;');
  $('gCard').classList.toggle('defis',!!dfi);
  $('gCard').classList.toggle('prixSeul',!!(testOuv||(u9&&u9.p&&!dfi&&u9.k!=='premium'&&!ouverte))); /* (garage v7) le prix est sur le bouton (« IL MANQUE $ X ») et sur la vignette : l'encadré ne le redit plus — (2026-10-11, Léo : « enlève le TEST BOUTIQUE 0,99 €, c'est super dérangeant, on ne voit pas la voiture ») une caisse ouverte pour le TEST n'a plus d'encadré */
  // ÉQUIPER : verrouillé tant que la caisse n'est pas débloquée ; marqué quand c'est déjà la tienne
  // ⚠ on teste carUnlocked(i), PAS `garageI>bestCar` : les caisses ne se gagnent plus dans l'ordre
  // (chacune a sa condition), donc un simple « au-dessus du meilleur » laisserait passer les trous.
  const bt=$('gEquip'),eq=SAVE.d.equipped|0;
  if(bt){
    bt.disabled=false; // aria-disabled plutôt que disabled : le bouton fermé RÉPOND (secousse + vibration + la condition)
    // (2026-09-26, charte v4) l'ÉTAT se lit dans la MATIÈRE (`data-etat`) : lingot = à équiper, carbone vert = la tienne, carbone gris = fermée
    if(!ouverte)gEtat(bt,'verrou','verrou','VERROUILLÉE');
    else if(garageI===eq)gEtat(bt,'eq','coche','ÉQUIPÉE');
    else gEtat(bt,'',null,'ÉQUIPER');
  }
  /* LE BOUTON ACHETER n'existe QUE pour les caisses à vendre et pas encore possédées. Les caisses
     à défi n'en ont pas du tout : afficher un bouton d'achat grisé sur LE MANS 24 laisserait croire
     qu'elle finira par s'acheter, alors que non — c'est tout l'intérêt de la voie aura. */
  const bb=$('gBuy'),row=$('gBuyRow'),prix=carPrice(garageI);
  $('gCard').classList.toggle('verrou',(!ouverte&&!dfi&&!prix)||testOuv); // (test) la condition se lit même sur une caisse ouverte pour l'essai // défi d'aura : la condition DOIT se lire (elle était écrite… puis masquée)
  const aVendre=prix&&(!ouverte||testOuv); // (2026-09-30) en TEST aussi, la caisse à vendre pas encore payée montre ACHETER (sinon la pastille « à ta portée » n'avait pas d'issue) ; JOUER l'équipe toujours (garageLaunch clique ÉQUIPER)
  if(row)row.style.display=aVendre?'':'none';
  if(bb&&aVendre){
    const peut=bank()>=prix;
    bb.innerHTML=gPrixHtml(peut,prix);bb.dataset.px=fmtC(prix);bb.dataset.eur=''; // le verbe, puis le prix en gros (charte v4) — (2026-10-10) dataset.px : le prix que dit ÉQUIPER devenu ACHETER (gEqTon)
    bb.classList.toggle('pauvre',!peut); // ⚠ plus de `disabled` : un bouton désactivé n'émet AUCUN clic — pas de son, pas de vibration, rien
  }
  // ⚠ UN SEUL BOUTON D'ACTION (2026-09-25) : une caisse à vendre affichait « IL MANQUE 25 k » ET « VERROUILLÉE »
  // l'un sous l'autre — deux fois la même nouvelle. À vendre : ACHETER seul ; à défi : le verrou seul.
  if(bt&&aVendre)bt.style.display='none';else if(bt)bt.style.display='';
  gActSync(); // (2026-09-29) JOUER prend toute la barre s'il n'y a rien à décider
  gDots(garageListe().map(function(i9){return {on:i9===garageI,a:carUnlocked(i9),eq:i9===eq};}));
  const sw=$('gSw');if(sw){sw.style.display='none';sw.innerHTML='';}
  // (2026-09-26) LA FAMILLE : la pastille de rareté sur la fiche, la barre des familles et la bande de vignettes suivent la caisse
  {const ri=rarInfo(carRar(garageI)),pl=$('gRarPill');if(pl){pl.textContent=sansAcc(TR(ri.n1));pl.style.setProperty('--rc',ri.c);}
   $('gCard').style.setProperty('--rc',ri.c); // le nom s'auréole de la couleur de sa famille
   // LÉGENDAIRE pas encore à toi : UN bouton, qui mène à la BOUTIQUE (le seul endroit où elle s'achète)
   if(bb){bb.dataset.bout='';if(u9&&u9.k==='premium'&&!carUnlockedVrai(garageI)&&(!testOuv||gModeM()==='shop'||gModeM()==='tous')){ /* (2026-10-10) en BOUTIQUE (et SEE ALL ITEMS), une caisse en € pas vraiment à toi dit ACHETER + son prix, même ouverte pour le TEST (TEST_CAISSES) */if(row)row.style.display='';bb.innerHTML=pxi('panier')+'<span>'+TR('EN BOUTIQUE')+'</span><b class="gPrix">'+eurTxt(u9.eur)+'</b>';
     bb.classList.remove('pauvre');bb.dataset.bout='1';bb.dataset.px=eurTxt(u9.eur);bb.dataset.eur='1';if(bt)bt.style.display='none';gActSync();}} // (2026-10-10) gActSync : ÉQUIPER dit ACHETER + le prix en € (il était passé avant cette branche)
   garageFamilles(ri.id);}
  gBankPaint();
}
/* LA BARRE DES FAMILLES + LA BANDE DE VIGNETTES. La barre ne se réécrit que si la famille ou les comptes changent ; la bande
   se reconstruit au changement de famille et ne fait sinon que déplacer la sélection (et se recentrer dessus). Les photos
   viennent du studio (`carPhoto`), UNE par image au plus (`photoFile`) : ouvrir une famille de 16 ne gèle pas le garage. */
function garageFamilles(r){
  const md=gModeM();if(md==='shop'){gShopJour();return;} /* (2026-10-10) la BOUTIQUE est devenue LA BOUTIQUE DU JOUR (gShopJour) */if(md==='inv'||md==='tous'){gStripModeVoitures();return;} // (2026-10-10) SEE ALL ITEMS (`tous`) : la page de l'inventaire, tout ce qui s'achète — (2026-10-09) INVENTAIRE : voir « LA CONSOLE À TROIS MODES » — la BOUTIQUE garde les familles (Léo : « remets les raretés dans la boutique »)
  const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;try{gModeBoutons();}catch(e){}bar.classList.remove('gModeBar');
  const eq=SAVE.d.equipped|0,shop=md==='shop';
  const nbV=function(L){let n=0;for(const i of L)if(gAVendre(i))n++;return n;}; // BOUTIQUE : chaque famille dit combien il en reste à ACHETER
  const cles=md+':'+RAR_FAM.map(function(x){const L=rarListe(x.id);let a=0;for(const i of L)if(carUnlockedVrai(i))a++;return x.id+a+'/'+L.length+(shop?'v'+nbV(L):'');}).join('|')+'#'+r;
  if(bar._k!==cles){bar._k=cles;
    bar.innerHTML=RAR_FAM.map(function(x){const L=rarListe(x.id);let a=0;for(const i of L)if(carUnlockedVrai(i))a++;const v=shop?nbV(L):0,lb=shop?String(v):a+'/'+L.length;
      const nm9=sansAcc(TR(x.n)); // (garage v6) la famille se dit en COULEUR : son nom reste pour le lecteur d'écran et l'info-bulle
      return '<button class="gR'+(x.id===r?' on':'')+(shop&&!v?' vide':'')+'" data-r="'+x.id+'" role="tab" aria-selected="'+(x.id===r)+'" aria-label="'+nm9+' '+lb+'" title="'+nm9+'" style="--rc:'+x.c+'"><span class="gRn">'+nm9+'</span>'+pxi(RAR_LOGO[x.id]||'etoile')+'</button>';}).join('');} // (2026-10-09) le LOGO de la famille, plus de compte
  {const ro=bar.querySelector('.gR.on');if(ro&&bar._on!==r){bar._on=r;const x=ro.offsetLeft-(bar.clientWidth-ro.offsetWidth)/2;try{bar.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){bar.scrollLeft=x;}}} // la famille active vient se montrer
  const L=shop?rarListe(r).filter(gAVendre):rarListe(r),ri=rarInfo(r),own=L.filter(carUnlockedVrai).length; // (charte v4) posséder une caisse de plus REFAIT la bande (elle gardait son cadenas après l'achat) — (2026-10-09) en BOUTIQUE, celles à vendre seulement
  if(st._r!==r||st._n!==L.length||st._eq!==eq||st._o!==own||st._md!==md){st._r=r;st._n=L.length;st._eq=eq;st._o=own;st._md=md;
    const lu9={commun:.35,rare:.6,exotique:.7,epique:.82,defi:.7,legendaire:1,mythique:1,infini:1}[r]||.5, // (2026-10-07, Léo) LA LUEUR de la famille : plus elle est rare, plus elle brille — les crans de l'inventaire (INV_LUEUR)
      lg9=';--rg:'+invRgba(ri.c,.22+.28*lu9)+';--rg2:'+invRgba(ri.c,.55+.4*lu9); // en rgba, pas de color-mix (les vieux iPhone, voir hudDA §7)
    st.innerHTML=(shop&&!L.length)?'<div class="gVide">'+sansAcc(TR('TOUT EST A TOI'))+'</div>':L.map(function(i){const u=CAR_UNLOCK[i],ouv=carUnlockedVrai(i);
      const et=ouv?(i===eq?'':pxi('coche')):(u&&u.p?fmtC(u.p):u&&u.eur?eurTxt(u.eur):u&&u.k==='mis'?sansAcc(TR(m2Secrete(i)?'SECRÈTE':'MISSION')):''); // (la police pixel n'a pas de ✓ : l'icône pixel) · (2026-09-29) la caisse des MISSIONS en cours dit où on en est : « 1 / 3 »
      const sec9=!ouv&&m2Secrete(i);
      return '<div class="gT'+(ouv?'':' lock')+(sec9?' m2sec':'')+(i===eq?' eq':'')+'" data-car="'+i+'" role="button" aria-label="'+(sec9?'? ? ?':String(CARS[i].name).replace(/"/g,''))+'" style="--rc:'+ri.c+lg9+'">'
        +'<i class="gTl"></i><i class="gTv"></i><em'+(!ouv&&u&&!u.p&&u.eur?' class="eur"':!ouv&&u&&u.k==='carnet'?' class="def"':'')+'>'+et+'</em></div>';}).join(''); // (charte v5) l'argent du JEU en vert billet, le vrai argent (€) en or
    st.querySelectorAll('.gT').forEach(function(el){const i=+el.getAttribute('data-car');
      photoFile(i,function(url){const v=el.querySelector('.gTv');if(v)v.remove();if(!el.querySelector('img')){const im=document.createElement('img');im.alt='';im.src=url;el.insertBefore(im,el.firstChild);}});});}
  st.querySelectorAll('.gT').forEach(function(el){el.classList.toggle('on',+el.getAttribute('data-car')===garageI);});
  const on=st.querySelector('.gT.on');if(on){const x=on.offsetLeft-(st.clientWidth-on.offsetWidth)/2;try{st.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=x;}}
  if(!st._fin){st._fin=1;const f9=function(){st.classList.toggle('finDroite',st.scrollLeft+st.clientWidth>=st.scrollWidth-4);};st.addEventListener('scroll',f9,{passive:true});setTimeout(f9,400);} /* (garage v7) au bout de la bande, plus de fondu */
}
/* ===== LA CONSOLE À TROIS MODES (2026-10-09, Léo : « crée un système : les boutons INVENTAIRE et BOUTIQUE liés à ce qui est affiché au
   début — voitures, peinture, ailes, avec les raretés. Pas une autre page : la même. INVENTAIRE montre ce qu'on a, directement, dans la
   couleur indiquée, au lieu des raretés ; BOUTIQUE, la même chose avec tout ce qu'il y a à acheter ») =====
   `GMODE.m` : 'tout' (la console d'origine : familles pour les voitures, filtres TOUT · À MOI · À ACHETER pour l'habillage) · 'inv' · 'shop'.
   Les deux touches de la rangée basculent le mode (re-toucher la touche allumée ramène à 'tout') ; les onglets VOITURES · PEINTURE · AILES ·
   TRAÎNÉES restent, la barre des familles devient l'INTERTITRE du mode (pictogramme, nom, fil, compte) et la bande des vignettes ne garde
   que ce qui est à toi (INVENTAIRE, toutes familles mêlées, dans le cyan de l'inventaire — plus de couleur de rareté, demande de Léo le même soir) ou ce qui est
   à acheter (BOUTIQUE : l'argent du jeu du moins cher au plus cher, puis les légendes en €, vignettes éclairées — c'est une vitrine).
   Le tiroir #gInv et la page € (#mShop) ne s'ouvrent plus depuis ces touches dans la console (la page € reste sur l'accueil). */
var GMODE={m:'tout',fam:null,paye:false};
var GATL={on:false,c:0,cs:0,l:0,lb:0,p:0,cle:'',g:null,pinces:[],sonL:0,sonP:0,dim:-1}; // L'ATELIER FERMÉ de l'INVENTAIRE (voir gAtelier)
/* (2026-10-10) LA FAMILLE DE LA BOUTIQUE : celle de la caisse affichée si elle a encore quelque chose à vendre, sinon la 1re qui en a. La caisse,
   elle, ne bouge pas tant qu'on ne touche pas une vignette ; une puce de famille ne change que la bande. */
function gShopFam(){const r0=carRar(garageI),a=function(r){return rarListe(r).some(gAVendre);};if(a(r0))return r0;for(const x of RAR_FAM)if(a(x.id))return x.id;return r0;}
function gAVendre(i){const u=CAR_UNLOCK[i];return !carRetiree(i)&&i!==(SAVE.d.equipped|0)&&!carUnlockedVrai(i)&&!!u&&(!!u.p||u.k==='premium');} // (2026-10-09) à acheter : argent du jeu ou boutique (€), pas encore à toi
function gModeConsole(){return !!gEl&&!gEl.classList.contains('vitrine')&&!gEl.classList.contains('menu');}
function gModeM(){return GMODE&&gModeConsole()?GMODE.m:'tout';} // (GMODE est un var : lu avant sa ligne au chargement, il vaut undefined → 'tout')
function gPossede(i){return i===(SAVE.d.equipped|0)||carUnlockedVrai(i);}
function gModeListeVoitures(m){const eq=SAVE.d.equipped|0,L=[];
  for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;
    if(m==='inv'?gPossede(i):m==='tous'?(i===0||(!!CAR_UNLOCK[i]&&(CAR_UNLOCK[i].p>0||CAR_UNLOCK[i].k==='premium'))):(i===0||gAVendre(i)))L.push(i);} /* (2026-10-22, Sacha : « dans le shop avec les communes, en première, même si on ne peut pas l'acheter ») la voiture de départ ouvre la liste */
  if(m==='inv')L.sort(function(a,b){return (INV_RANG[carRar(b)]-INV_RANG[carRar(a)])||(carOrdre(b)-carOrdre(a));}); // (2026-10-09) les silhouettes de ce qu'on n'a pas (v221-v222) sont retirées le même soir (Léo : « enlève le truc avec les voitures transparentes »)
  else L.sort(function(a,b){if(a===0||b===0)return a===0?-1:1;return ((CAR_UNLOCK[a].p?0:1)-(CAR_UNLOCK[b].p?0:1))||(carPrixOrdre(a)-carPrixOrdre(b));});
  return L;}
function gModeBoutons(){const m=gModeM(),c=document.getElementById('gvCof'),b=document.getElementById('gShopBas'),r=document.getElementById('gRar'),st=document.getElementById('gStrip');
  if(c)c.classList.toggle('modeOn',m==='inv');if(b)b.classList.toggle('modeOn',m==='shop'||m==='tous');
  if(b){const ret=m==='shop'||m==='tous';if(b._lib==null)b._lib=b.innerHTML;if(ret!==!!b._ret){b._ret=ret;b.innerHTML=ret?pxi('gauche')+'<span data-fr="RETOUR">'+TR('RETOUR')+'</span>':b._lib;if(!ret){const s9=b.querySelector('span[data-fr]');if(s9)s9.textContent=TR(s9.dataset.fr);}b.setAttribute('aria-label',ret?TR('RETOUR'):TR('Boutique'));} /* (2026-10-12, passe qualité) _lib est figé dans la langue de la 1re visite : on repasse le libellé dans la langue du moment (sinon « BOUTIQUE » en anglais après FR→EN) */
    if(gEl)gEl.classList.toggle('shopRet',ret);} // (2026-10-12) BOUTIQUE devient RETOUR
  if(GATL.on&&m!=='inv')GATL.on=false; // l'atelier fermé n'existe qu'en INVENTAIRE
  if(c){const ret=m==='inv'&&GATL.on;if(c._lib==null)c._lib=c.innerHTML;if(ret!==!!c._ret){c._ret=ret;c.innerHTML=ret?pxi('gauche')+'<span data-fr="RETOUR">'+TR('RETOUR')+'</span>':c._lib;c.setAttribute('aria-label',ret?TR('RETOUR'):'Inventaire');}}
  if(gEl){gEl.classList.remove('invRet');gEl.classList.toggle('modeInv',m==='inv');gEl.classList.toggle('atelierInv',GATL.on);} // (2026-10-12, Léo) à l'arrivée l'INVENTAIRE en aperçu, les cinq touches ; INVENTAIRE touché = L'ATELIER FERMÉ (gAtelier) : la touche devient ◀ RETOUR, en bas à gauche, les autres s'effacent
  if(r&&m==='tout')r.classList.remove('gModeBar');if(st){st.classList.toggle('gModeShop',m==='shop'||m==='tous');st.classList.toggle('gModeTous',m==='tous');st.classList.toggle('gModeInv',m==='inv');if(m!=='shop'&&st.classList.contains('fnBande')){st.classList.remove('fnBande');st._r=null;st._n=-1;if(r)r._k=null;}}
  if(gEl)gEl.classList.toggle('modeShop',m==='shop');} // (2026-10-10) LA BOUTIQUE DU JOUR : la console change de visage (voir gShopJour)
function gModeTete(bar,m,n){bar.classList.add('gModeBar'); // n : un nombre, ou « 15 / 46 » en INVENTAIRE
  if(m==='tous'){bar.innerHTML='<div class="gModeT fnTete" style="--rc:var(--neoM)"><b class="fnRetour" role="button" aria-label="'+TR('RETOUR')+'">'+pxi('gauche')+'</b>'+pxi('panier')+'<span>SEE ALL ITEMS</span><s></s><b>'+n+'</b></div>';return;} // (2026-10-10) SEE ALL ITEMS, en anglais (Léo)
  bar.innerHTML='<div class="gModeT" style="--rc:'+(m==='inv'?'var(--neoC)':'var(--neoM)')+'">'+pxi(m==='inv'?'coffre':'panier')+'<span>'+sansAcc(TR(m==='inv'?'INVENTAIRE':'BOUTIQUE'))+'</span><s></s><b>'+n+'</b></div>';}
/* LE LOGO DE LA RARETÉ (2026-10-10, Léo : « les raretés, tu peux ajouter le logo à côté de chaque voiture, au même endroit, pour créer un peu
   de logique visuelle ») : sur CHAQUE vignette de caisse (inventaire, SEE ALL ITEMS, vitrine du jour), le logo de sa famille (RAR_LOGO : roue,
   gemme, flamme, couronne, cible) dans sa couleur, toujours au coin haut droit — le cadenas et le losange de l'équipée restent à gauche. */
function rarLogoR(r){const c=rarInfo(r).c;return '<span class="rarLogo r-'+r+'" style="--rl:'+c+'" title="'+sansAcc(TR(rarInfo(r).n1))+'">'+pxi(RAR_LOGO[r]||'etoile')+'</span>';}
function rarLogo(i){return rarLogoR(carRar(i));}
function gStripModeVoitures(){
  const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;gModeBoutons();
  const m=GMODE.m,eq=SAVE.d.equipped|0,L=gModeListeVoitures(m);
  const lbl=L.length;
  const kb='mode:'+m+':'+lbl+':'+LANG;if(bar._k!==kb){bar._k=kb;bar._on=null;gModeTete(bar,m,lbl);}
  const k='mode:'+m+':'+L.join(',')+':'+eq+':';
  if(st._r!==k){st._r=k;st._n=-1;
    if(!L.length)st.innerHTML='<div class="gVide">'+sansAcc(TR(m==='inv'?'RIEN ICI':'TOUT EST A TOI'))+'</div>';
    else st.innerHTML=L.map(function(i){const ri={c:m==='tous'?'#ff3ec8':'#5ee6ff'},lg9=m==='tous'?';--rg:rgba(255,62,200,.3);--rg2:rgba(255,62,200,.7)':';--rg:rgba(94,230,255,.32);--rg2:rgba(94,230,255,.72)'; // (2026-10-09, Léo : « enlève la rareté de l'inventaire ») tout dans le cyan de l'INVENTAIRE — (2026-10-10) SEE ALL ITEMS : pas de rareté non plus, le magenta de la boutique
      const u=CAR_UNLOCK[i],ouv=i===eq||carUnlockedVrai(i);
      const et=ouv?(i===eq?'':pxi('coche')):(u&&u.p?fmtC(u.p):u&&u.eur?eurTxt(u.eur):u&&u.k==='mis'?sansAcc(TR(m2Secrete(i)?'SECRÈTE':'MISSION')):'');
      const sec9=!ouv&&m2Secrete(i);
      return '<div class="gT'+(ouv?'':' lock')+(sec9?' m2sec':'')+(i===eq?' eq':'')+'" data-car="'+i+'" role="button" aria-label="'+(sec9?'? ? ?':String(CARS[i].name).replace(/"/g,''))+'" style="--rc:'+ri.c+lg9+'">'
        +'<i class="gTl"></i><i class="gTv"></i>'+rarLogo(i)+'<em'+(!ouv&&u&&!u.p&&u.eur?' class="eur"':!ouv&&u&&u.k==='carnet'?' class="def"':'')+'>'+et+'</em></div>';}).join('');
     // (2026-10-14, charte 6, ordre de Sacha) plus de blocs « ? BIENTÔT » : un testeur y voit un jeu inachevé
    st.querySelectorAll('.gT[data-car]').forEach(function(el){const i=+el.getAttribute('data-car');
      photoFile(i,function(url){const v=el.querySelector('.gTv');if(v)v.remove();if(!el.querySelector('img')){const im=document.createElement('img');im.alt='';im.src=url;el.insertBefore(im,el.firstChild);}});});}
  st.querySelectorAll('.gT').forEach(function(el){el.classList.toggle('on',+el.getAttribute('data-car')===garageI);});
  const on=st.querySelector('.gT.on');if(on){const x=on.offsetLeft-(st.clientWidth-on.offsetWidth)/2;try{st.scrollTo({left:x,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=x;}}
  else{try{st.scrollTo({left:0,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e){st.scrollLeft=0;}}}
/* ===== LA BOUTIQUE DU JOUR (2026-10-10, Léo : « fais un shop type Fortnite — comme ce n'est pas hebdomadaire, trouve un moyen ») =====
   Pas de serveur, pas d'équipe qui remplit la vitrine chaque semaine : la vitrine se TIRE d'elle-même chaque jour, dans le catalogue du jeu.
   · Le jour = le jour UTC (minuit UTC, comme Fortnite : 2 h du matin l'été à Paris) ; la graine = ce jour.
   · Tirée UNE fois, au 1er passage du jour, parmi ce qui n'est PAS encore à toi, puis GARDÉE (SAVE.d.bq) : ce que tu achètes reste en
     vitrine, marqué ACQUIS (un tirage refait à chaque achat remélangerait tout).
   · À LA UNE : deux caisses (rare et plus, de préférence), en grand ; DU JOUR : deux caisses et deux habillages.
   · Compte à rebours jusqu'au renouvellement ; à zéro, la nouvelle vitrine tombe toute seule.
   Dans la console (BOUTIQUE) : les onglets se taisent, la barre dit « BOUTIQUE DU JOUR » + l'horloge, la bande devient des CARTES à la
   couleur de leur rareté. Toucher une carte montre l'objet sur le plateau (rien ne change avant), et ÉQUIPER devient ACHETER + le prix.
   Triche possible en avançant l'horloge du téléphone : jeu hors ligne, on l'accepte. `dbgBoutiqueJour(j)` : la vitrine d'un autre jour. */
function bqJour(){return Math.floor(Date.now()/864e5)+(BQ_DECALE|0);}
var BQ_DECALE=0;
function bqCles(){const V=[],C=[];
  for(let i=0;i<CARS.length;i++){if(carRetiree(i))continue;const u=CAR_UNLOCK[i];if(u&&u.p>0)V.push('v:'+i);} // (2026-10-10) les caisses en € passent dans les OFFRES (bqOffres)
  for(const cat of ['peinture','aile','trainee'])for(const d of COSM[cat])if(d.p>0)C.push(cat+':'+d.id);
  return {V:V,C:C};}
function bqCos(k){const p=k.indexOf(':'),cat=k.slice(0,p);if(cat==='figure')return {cat:cat,d:window.FIG?FIG.par[k.slice(p+1)]:null};return {cat:cat,d:COSM[cat]&&COSM[cat].find(function(x){return x.id===k.slice(p+1);})};}
function bqA(k){if(k[0]==='v'){const i=+k.slice(2);return carUnlockedVrai(i)||i===(SAVE.d.equipped|0);}const o=bqCos(k);return !!o.d&&shopOwned(o.cat,o.d.id);}
function bqValide(k){if(typeof k!=='string')return false;if(k[0]==='v'){const i=+k.slice(2);return !!CARS[i]&&!carRetiree(i)&&!!CAR_UNLOCK[i]&&CAR_UNLOCK[i].p>0;}const o=bqCos(k);return !!o.d&&o.d.p>0;} /* (24/10, relecture) …et toujours EN VENTE (un prix en dollars, comme au tirage, bqCles) : une vitrine tirée avant une mise à jour qui a retiré le prix d'un objet (passé en euros, devenu récompense de mission) était gardée jusqu'à minuit UTC, sa carte disait « $ NaN » ou « $ 0 » — elle est retirée */
function bqRar(k){if(k[0]==='v')return carRar(+k.slice(2));const o=bqCos(k);return cosmRar(o.cat,o.d);}
function bqTire(j){const r=mulberry32(Math.imul(j,2654435761)^0x5B0071C),{V,C}=bqCles(),rg={commun:0,rare:1,exotique:1,defi:1,epique:2,legendaire:3,mythique:3,infini:3};
  const mel=function(L){L=L.slice();for(let i=L.length-1;i>0;i--){const k=Math.floor(r()*(i+1)),t=L[i];L[i]=L[k];L[k]=t;}return L;};
  const neuf=function(L){return mel(L.filter(function(k){return !bqA(k);})).concat(mel(L.filter(bqA)));}; // ce qui n'est pas à toi d'abord
  const Vn=neuf(V),une=Vn.filter(function(k){return !bqA(k)&&rg[bqRar(k)]>=1;}).slice(0,2);
  for(const k of Vn)if(une.length<2&&une.indexOf(k)<0)une.push(k);
  /* (même jour, Léo : « un peu plus de choix, qu'on puisse glisser vers le bas, mais pas tout non plus ») DU JOUR : trois caisses et trois
     habillages (six cartes au lieu de quatre) — la vitrine fait huit objets, jamais tout le catalogue. */
  const Cn=neuf(C).slice(0,BQ_N.hab),jour=Vn.filter(function(k){return une.indexOf(k)<0;}).slice(0,BQ_N.jour-Cn.length).concat(Cn);
  return une.concat(jour);}
var BQ_N={une:2,jour:6,hab:3};
function bqVitrine(){const j=bqJour();let b=SAVE.d.bq;
  if(!b||b.j!==j||!Array.isArray(b.l)||b.l.length!==BQ_N.une+BQ_N.jour||!b.l.every(bqValide)||b.l.some(function(k){return k[0]==='v'&&CAR_UNLOCK[+k.slice(2)]&&CAR_UNLOCK[+k.slice(2)].k==='premium';})){b={j:j,l:bqTire(j)};SAVE.d.bq=b;try{SAVE.mark();}catch(e){}}
  return b;}
function bqReste(){const ms=Math.max(0,(bqJour()+1-(BQ_DECALE|0))*864e5-Date.now()),t=Math.floor(ms/1000),d2=function(n){return (n<10?'0':'')+n;};
  return d2(Math.floor(t/3600))+':'+d2(Math.floor(t/60)%60)+':'+d2(t%60);}
function bqFig(cat,d){const hx=function(c){return '#'+(c>>>0).toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
  if(cat==='peinture')return '<i class="fnSw'+cosmSwCl(d)+'" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0xff7a3a))+'"></i>';
  if(cat==='trainee')return '<i class="fnRub" style="background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 35%,#fff 100%)')+'"></i>';
  return '<i class="pxi pxi-aile fnAile"></i>';}
function bqCarte(k,une,sansRuban){const ri=rarInfo(bqRar(k)),c=ri.c,a=bqA(k);let nom='',ty='',px='',eur=false,fig='';
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{};nom=TR(CARS[i].name);ty='CAISSE';if(u.k==='premium'){px=eurTxt(u.eur);eur=true;}else px=fmtC(u.p||0);fig='<i class="fnPh"></i>';}
  else{const o=bqCos(k);nom=TR(o.d.n);ty=SHOP_LBL[o.cat];px=fmtC(o.d.p);fig=bqFig(o.cat,o.d);}
  return '<div class="fnC'+(une?' une':'')+(a?' acquis':'')+'" data-fn="'+k+'" role="button" aria-label="'+String(nom).replace(/"/g,'')+'" style="--rc:'+c+';--rcL:'+invRgba(c,.98)+';--rcD:'+invRgba(c,.22)+'">'
    +'<i class="fnFond"></i>'+fig+(k[0]==='v'?rarLogo(+k.slice(2)):'')+(une&&!sansRuban?'<s class="fnBan">'+sansAcc(TR('À LA UNE'))+'</s>':'')
    +'<span class="fnTy">'+sansAcc(TR(ty))+(une?' · '+sansAcc(TR(ri.n1)):'')+'</span><b class="fnN">'+sansAcc(String(nom))+'</b>'
    +'<em class="fnP'+(eur?' eur':'')+'">'+(a?pxi('coche')+'<span>'+sansAcc(TR('ACQUIS'))+'</span>':px)+'</em></div>';}
/* LA BOUTIQUE DU GARAGE, SON PLAN (2026-10-10, Léo, après quatre passes — « quand on appuie sur SHOP : en haut LIMITED OFFERS, c'est top ;
   juste dessous, le même carré avec les voitures payantes, et ça doit mener à l'ÉCRAN ROSE — la page avec les trucs payants, éphémères et
   pour toujours ; ensuite la boutique éphémère, un peu aléatoire, j'aime bien ; et tout en bas SEE ALL ITEMS : quelque chose de similaire à
   l'inventaire, mais avec tout ce qui s'achète — pas les raretés, mais les classes : voitures, ailes, puis le reste ») :
   · la PORTE DES OFFRES (bqPorte) : OFFRES, « toutes les voitures payantes », le nombre, trois d'entre elles en éventail. Touchée, l'atelier se
     ferme sous le volet et s'ouvre la page OFFRES de l'accueil (#mShop, la vitrine rose de Sacha : l'offre de lancement + les légendaires) ;
     son RETOUR rouvre le garage, dans la boutique (`window.__offGar`, lu par le routeur de la coque).
   · SEE ALL ITEMS (le lien transparent du bas) : le mode `tous` de la console (gModeVa('tous')) — la page de l'INVENTAIRE, onglets compris
     (VOITURES · PEINTURE · AILES · TRAÎNÉES), mais avec TOUT ce qui s'achète dans l'onglet (à toi : coché ; sinon le prix, $ ou €) ; ◀ dans
     la barre, ou BOUTIQUE, ramène à la vitrine du jour. Les caisses en € ne sont pas tirées dans À LA UNE / DU JOUR. */
function bqEur(i){return parseFloat(String((CAR_UNLOCK[i]||{}).eur||'0').replace(',','.'))||0;}
function bqPayantes(){const L=[];for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(u&&u.k==='premium'&&!carRetiree(i))L.push(i);}
  return L.sort(function(a,b){return bqEur(a)-bqEur(b)||a-b;});}
/* LE BANDEAU DES OFFRES (2026-10-12, Léo : « fusionne LIMITED OFFERS rose avec la boîte orange OFFRES, qui disent la même chose, en un truc
   qui défile les offres ») : en tête de la vitrine du jour, UN bandeau — « OFFRES ÉPHÉMÈRES » et le compte à rebours en haut, puis les
   voitures payantes qui DÉFILENT une à une (photo, nom, prix ; toutes les 2,6 s, points dessous) ; touché, il ouvre les offres (l'écran rose).
   La barre rose du dessus se tait dans la vitrine du jour (#garage.shopJour). */
function bqPorte(L){const V=L.filter(function(i){return !carOwned(i);}).concat(L.filter(carOwned));
  return '<div class="fnPorte fnCarr" role="button" tabindex="0" aria-label="'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'"><i class="fnFond"></i>'
    +'<b class="fpHd">'+pxi('cadeau')+'<span>'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><s class="fpTim">'+pxi('horloge')+'<i>'+bqReste()+'</i></s></b>'
    +'<span class="fpSl">'+V.map(function(i,n){const u=CAR_UNLOCK[i]||{},a=carOwned(i);return '<span class="fpS1'+(n?'':' on')+'"><i class="fpSlPh" data-ph="'+i+'"></i>'
      +'<b class="fpNom">'+sansAcc(TR(CARS[i].name))+'</b><em class="fpPx">'+(a?pxi('coche')+' '+sansAcc(TR('À TOI')):eurTxt(u.eur))+'</em></span>';}).join('')+'</span>'
    +'<span class="fpDots">'+V.map(function(i,n){return '<u'+(n?'':' class="on"')+'></u>';}).join('')+'</span></div>';}
setInterval(function(){try{if(!garageOn)return;const c=document.querySelector('#gStrip .fnCarr');if(!c||!c.offsetParent)return;const S=c.querySelectorAll('.fpS1'),P=c.querySelectorAll('.fpDots u');if(S.length<2)return;
  let i=-1;S.forEach(function(e,j){if(e.classList.contains('on'))i=j;});const n=(i+1)%S.length;if(i>=0){S[i].classList.remove('on');S[i].classList.add('sort');setTimeout(function(){S[i].classList.remove('sort');},500);if(P[i])P[i].classList.remove('on');}
  S[n].classList.add('on');if(P[n])P[n].classList.add('on');}catch(e){}},2600); // (2026-10-12) le défilé des offres
function gOffresPage(){window.__offGar=true;ecranWipe(function(){window.__mRetour='shop';closeGarage();});} // la page OFFRES (rose) ; son RETOUR rouvre la boutique du garage
function bqCourant(){if(GBQ.figK&&GBQ.panOn&&(GBQ.cat==='figure'))return GBQ.figK;if(GBQ.sec!=null&&GBQ.panOn&&SHOP.tab==='voiture')return 'v:'+GBQ.sec; /* (missions v2) la secrète regardée */if(SHOP.tab==='voiture')return 'v:'+garageI;const L=COSM[SHOP.tab],d=L&&L[SHOP.i[SHOP.tab]];return d?SHOP.tab+':'+d.id:'';}
function gShopJour(){const bar=$('gRar'),st=$('gStrip');if(!bar||!st)return;try{gModeBoutons();}catch(e){}
  if(gEl)gEl.classList.toggle('shopJour',!GMODE.paye);
  if(GMODE.paye){gShopPaye(bar,st);return;}
  const B=bqVitrine(),kb='fn:'+B.j+':'+LANG;
  if(bar._k!==kb){bar._k=kb;bar._on=null;bar.classList.add('gModeBar');
    bar.innerHTML='<div class="gModeT fnTete" style="--rc:var(--neoM)">'+pxi('panier')+'<span>'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><s></s><b class="fnT">'+pxi('horloge')+'<i>'+bqReste()+'</i></b></div>';}
  const O=bqPayantes(),k='fn:'+B.j+':'+B.l.join(',')+':'+B.l.map(function(x){return bqA(x)?1:0;}).join('')+':'+O.length+':'+LANG;
  st.classList.add('fnBande');
  if(!st._finB){st._finB=1;st.addEventListener('scroll',function(){if(st.classList.contains('fnBande')||st.classList.contains('gModeTous'))st.classList.toggle('finBas',st.scrollTop+st.clientHeight>=st.scrollHeight-4);},{passive:true});} // au bout de la vitrine, plus de fondu
  if(st._r!==k){st._r=k;st._n=-1;st.scrollLeft=0;st.scrollTop=0;st.classList.remove('finBas');
    st.innerHTML=(O.length?bqPorte(O)+'<div class="fnSec"><span>'+sansAcc(TR('À LA UNE'))+'</span><s></s></div>':'')
      +B.l.map(function(x,n){return (n===BQ_N.une?'<div class="fnSec"><span>'+sansAcc(TR('DU JOUR'))+'</span><s></s></div>':'')+bqCarte(x,n<BQ_N.une);}).join('')
      +'<div class="fnTout" role="button" tabindex="0">SEE ALL ITEMS '+pxi('droite')+'</div>'; // (2026-10-10, Léo : « tout en bas de la boutique, pour voir toutes les voitures — écrit en transparent, pas un bouton », puis « en anglais, SEE ALL ITEMS ») → le mode `tous` : la page de l'inventaire, avec tout ce qui s'achète
    bqPhotos(st);}
  const cur=bqCourant();st.querySelectorAll('.fnC').forEach(function(el){el.classList.toggle('on',el.getAttribute('data-fn')===cur);});}
/* LES OFFRES PAYANTES (2026-10-11, Léo : « quand on rappuie sur BOUTIQUE, ça met les offres payantes, mises en page comme la page des
   voitures et items du jour — ça bascule entre les produits FEATURED et les OFFRES PAYANTES ») : BOUTIQUE retouchée (`GMODE.paye`, gModeVa)
   montre les caisses en €, en CARTES comme la vitrine du jour (les deux moins chères en grand, sans ruban, les autres trois par rangée) ;
   retouchée encore, la vitrine du jour revient. Une carte touchée pose la caisse sur le plateau ; ACHETER + son prix en € ouvre la fenêtre
   d'achat. Les autres touches (INVENTAIRE, SEE ALL ITEMS) ramènent toujours à la vitrine du jour au retour. */
function gShopPaye(bar,st){const L=bqPayantes(),kb='fp:'+L.length+':'+LANG;
  if(bar._k!==kb){bar._k=kb;bar._on=null;bar.classList.add('gModeBar');
    bar.innerHTML='<div class="gModeT fnTete" style="--rc:#ffd75e">'+pxi('cadeau')+'<span>'+sansAcc(TR('OFFRES PAYANTES'))+'</span><s></s><b class="fnCompte">'+L.length+' '+sansAcc(TR('VOITURES'))+'</b></div>';}
  const k='fp:'+L.map(function(i){return i+(carOwned(i)?'a':'');}).join(',')+':'+LANG;st.classList.add('fnBande');
  if(st._r!==k){st._r=k;st._n=-1;st.scrollLeft=0;st.scrollTop=0;st.classList.remove('finBas');
    st.innerHTML=L.map(function(i,n){return bqCarte('v:'+i,n<2,true);}).join('');bqPhotos(st);}
  const cur=bqCourant();st.querySelectorAll('.fnC').forEach(function(el){el.classList.toggle('on',el.getAttribute('data-fn')===cur);});}
/* bqPhotos : UNE seule déclaration, plus bas (après bqCarteHtml) — voir LES PHOTOS DES DEUX BOUTIQUES */
try{$('gStrip').addEventListener('click',function(e){const v=e.target.closest&&e.target.closest('.fnTout');if(v){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(v);uiClic('nav');gModeVa('tous');return;}
  const po=e.target.closest&&e.target.closest('.fnPorte');if(po){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(po);uiClic('nav');gOffresPage();return;} // (2026-10-10) la PORTE DES OFFRES : l'écran rose (page OFFRES)
  const t=e.target.closest&&e.target.closest('.fnC');if(!t)return;e.stopPropagation();
  if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(t);GSON9=false;const k=t.getAttribute('data-fn');
  if(k[0]==='v'){const i=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');const eq9=garEquipeCaisse(i);if(i!==garageI)garageSaute(i);else if(eq9)garageShow(i);}
  else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(SHOP.tab!==o.cat)shopTab(o.cat);if(j>=0){garEquipeHabit(o.cat,j);shopShow(o.cat,j);}try{if(SONV2&&!GSON9){sfx('ui.carte',{vol:-3});GSON9=true;}}catch(er){}} /* (2026-10-14, session SON) ui.carte −3 : feuilleter (−34, bus rec) sonnait plus fort que valider (ui.tap −35) — rangé avec ui.equipe (−37) */
  if(GSON9)hap(8);else uiClic('nav'); /* (2026-10-14, session SON) l'action (équiper, bascule, carte) a sonné : le tick se tait — sinon nav + équipe + carte sur UNE vignette */
  gShopJour();});}catch(e){}
setInterval(function(){try{if(!garageOn||gModeM()!=='shop')return;const B=SAVE.d.bq;if(!B||B.j!==bqJour()){const bar=$('gRar'),st=$('gStrip');if(bar)bar._k=null;if(st)st._r=null;gShopJour();return;}
  const v=bqReste();document.querySelectorAll('#gRar .fnT i:not(.pxi),#gStrip .fpTim i:not(.pxi)').forEach(function(t){if(t.textContent!==v)t.textContent=v;});}catch(e){}},1000);
try{Object.assign(I18N,{'BOUTIQUE DU JOUR':'DAILY SHOP','À LA UNE':'FEATURED','ACQUIS':'OWNED','DU JOUR':'DAILY','VOIR TOUTES LES VOITURES':'SEE ALL CARS','OFFRES':'OFFERS','TOUTES LES VOITURES PAYANTES':'ALL PAID CARS','VOITURES':'CARS','OFFRES ÉPHÉMÈRES':'LIMITED OFFERS','OFFRES PAYANTES':'PREMIUM OFFERS','À TOI':'YOURS'});}catch(e){} // (2026-10-10, Léo : « le truc du haut, c'est les OFFRES ÉPHÉMÈRES ») le titre de la vitrine du jour, avec son compte à rebours
try{$('gRar').addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fnRetour');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(b);uiClic('retour');gModeVa('shop');});}catch(e){} // ◀ de SEE ALL ITEMS : la vitrine du jour
function gModeVa(m){
  try{uiGarde(300);}catch(e){} // (2026-10-12, passe qualité) BOUTIQUE ↔ ◀ RETOUR change les touches sous le doigt : un double-tap sur RETOUR tombait sur HOME (même coin) et sortait du garage
  if(gEl&&gEl.classList.contains('consoleCachee')){gConsoleCache(false);if(GMODE.m===m){if(m==='inv')gAtelier(true);return;}} // (2026-10-09) la console repliée : la touche la ROUVRE (dans son mode)
  /* (2026-10-10, Léo, deux passes : « INVENTAIRE fait deux trucs différents : enlève celui avec les raretés », puis « quand j'appuie sur BOUTIQUE
     ou INVENTAIRE une deuxième fois, tu fais HIDE ») la touche allumée, retouchée, REPLIE la console (ce que faisait CACHER, retiré) — elle ne
     ramène plus à la vue des raretés ; touchée repliée, elle la rouvre (ligne du dessus). TOUT ne reste que la vue d'ouverture du garage. */
  if(GMODE.m===m){ // (2026-10-11, Léo : « enlève le double-clic INVENTAIRE ou BOUTIQUE qui enlève la page, l'œil fait déjà ça ») la touche allumée, retouchée, ne replie plus rien —
    if(m==='shop'&&GMODE.paye){GMODE.paye=false;const b9=$('gRar'),s9=$('gStrip');if(b9)b9._k=null;if(s9){s9._r=null;s9.scrollTop=0;}gShopJour();return;} // (2026-10-12) RETOUR depuis les offres payantes : la vitrine du jour
    if(m==='shop'){gGarageReplie();return;} /* (2026-10-14) le garage REPLIÉ, plus l'inventaire */ // (2026-10-12, Léo : « BOUTIQUE devient RETOUR quand on appuie dessus ») RETOUR : l'INVENTAIRE (la vue d'arrivée), les cinq touches
    if(m==='inv'){if(GATL.on){gAtelier(false);gGarageReplie();}else gAtelier(true);return;} /* (2026-10-14) RETOUR de l'inventaire : le garage REPLIÉ */ // (2026-10-12, Léo) INVENTAIRE ferme l'atelier ; la même touche, devenue ◀ RETOUR, le rouvre
    return;}
  GMODE.m=m;GMODE.paye=false;GMODE.fam=m==='shop'?gShopFam():null; // (2026-10-10) la famille montrée en BOUTIQUE, détachée de la caisse affichée
  if(m==='inv'&&SHOP.tab!=='figure')shopTab('figure'); /* (2026-10-25, Sacha : « quand on ouvre l'inventaire, on arrive directement sur les figures ») l'INVENTAIRE s'ouvre sur l'onglet FIGURES (et le CSS le range en premier) */
  const bar=$('gRar'),st=$('gStrip');if(bar)bar._k=null;if(st){st._r=null;if(m==='tous'){st.scrollTop=0;st.classList.remove('finBas');}}
  gModeCale();
  if(SHOP.tab==='voiture')garageFamilles(carRar(garageI));else gStripHabits(SHOP.tab,SHOP.i[SHOP.tab]);
  gModeBoutons();if(m==='inv')gAtelier(true);}
/* L'ATELIER FERMÉ (2026-10-12, Léo : « quand on appuie sur INVENTAIRE, ça ferme la porte du garage ; une petite lumière allumée vers la
   voiture ; des petits trucs robotiques attrapent les jambes de la voiture pour la fixer au sol, qu'on puisse seulement la tourner ; tous les
   autres boutons disparaissent, seul un bouton en bas à gauche, RETOUR ; on ne laisse plus d'espace — pour l'inventaire, ça déclenche un
   petit truc ») : `#garage.atelierInv` (CSS « L'ATELIER FERMÉ ») — INVENTAIRE devient ◀ RETOUR à la place de HOME, les autres touches et le
   rappel s'effacent, l'inventaire passe en grille de trois qui prend la place. Dans la scène (garAtelierTick, après les lampes de
   garageRender) : la PORTE descend (GATL.c → garPorte), une LAMPE d'atelier descend du plafond au-dessus du plateau et s'allume en
   grésillant (cône et flaque additifs, la clé `stallKey` passe au-dessus de la caisse — aucune lumière ajoutée), les tubes du plafond
   baissent ; puis une PINCE ROBOT par roue sort d'une trappe du plateau, tend son bras jusqu'au moyeu et serre (sa diode passe du cyan
   au vert : la caisse est tenue) — elles tournent avec le plateau, lâchent pendant un échange de caisse et reviennent sur la nouvelle.
   Le doigt ne fait plus que TOURNER la caisse (ni burn-out, ni coup). RETOUR : tout se défait, la porte remonte. dbgAtelierInv() pour le banc. */
function gAtelier(on){on=!!on;if(!gEl||GATL.on===on)return;
  if(on&&GMODE.m!=='inv')return;
  GATL.on=on;garLibre._r=null;
  if(on){try{gVueSeule(false);if(BURN.hold)burnFin();}catch(e){}}
  try{if(SONV2)sfx(on?'fourgon.porte':'ui.retour');}catch(e){}try{hap(on?10:6);}catch(e){}
  const st=$('gStrip');if(st)st.scrollTop=0;
  gModeBoutons();}
function garAtelierBatir(){
  const g=new THREE.Group();g.visible=false;GAR.root.add(g);GATL.g=g;
  const L=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0,flatShading:true,fog:false}); // le programme des Lambert de l'atelier : rien à compiler
  const M=GATL.M={fer:L(0x232a38,0x070910),jaune:L(0xefb52a,0x2e2005),chrome:L(0xc2cbd8,0x171b21),noir:L(0x15181f,0x040609),led:L(0x5ff0ff,0x2fb8d0)};
  GATL.BX=new THREE.BoxGeometry(1,1,1);GATL.CY=new THREE.CylinderGeometry(.5,.5,1,8);
  const pg=new THREE.Group();g.add(pg);GATL.pg=pg;
  const lp=new THREE.Group();g.add(lp);GATL.lp=lp;
  const mk=(geo,mat,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.scale.set(sx,sy,sz);lp.add(m);return m;};
  GATL.cord=mk(GATL.CY,M.noir,.035,1,.035);
  GATL.abat=mk(new THREE.ConeGeometry(.5,1,10,1,true),new THREE.MeshLambertMaterial({color:0x2a3242,emissive:0x070910,flatShading:true,fog:false,side:THREE.DoubleSide}),.78,.4,.78);
  GATL.cul=mk(GATL.CY,M.fer,.22,.12,.22);
  GATL.ampM=new THREE.MeshBasicMaterial({color:0x2a2620,fog:false});GATL.amp=mk(GATL.CY,GATL.ampM,.2,.14,.2);
  GATL.rayM=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide});
  GATL.ray=new THREE.Mesh(new THREE.ConeGeometry(.5,1,18,1,true),GATL.rayM);g.add(GATL.ray); // ⚠ FrontSide : la caméra peut entrer dans le cône (voir les tubes)
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,240,210,1)');gr.addColorStop(.45,'rgba(255,226,180,.55)');gr.addColorStop(1,'rgba(255,220,170,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);
  GATL.flaqM=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending});
  GATL.flaq=new THREE.Mesh(new THREE.PlaneGeometry(1,1),GATL.flaqM);GATL.flaq.rotation.x=-Math.PI/2;GATL.flaq.renderOrder=2;g.add(GATL.flaq);
  GATL.v=new THREE.Vector3();GATL.c0=new THREE.Color();GATL.cK=new THREE.Color(0xfff1dc);
}
function garPinceNeuve(hy,R,lw){ // une pince : repère local x = vers l'EXTÉRIEUR de la roue (le groupe est mis en miroir à gauche), 0 = le flanc du pneu
  const M=GATL.M,o=new THREE.Group(),b=(mat,sx,sy,sz)=>{const m=new THREE.Mesh(GATL.BX,mat);m.scale.set(sx,sy,sz);o.add(m);return m;};
  const x0=.34,H=hy+.16,P={o:o,x0:x0,H:H,hy:hy,R:R,lw:lw};
  P.cadre=b(M.jaune,.6,.012,.6);P.cadre.position.set(x0,.004,0);P.trou=b(M.noir,.48,.014,.48);P.trou.position.set(x0,.006,0); // la TRAPPE du plateau
  P.col=new THREE.Mesh(GATL.CY,M.fer);P.col.scale.set(.13,H,.13);o.add(P.col);
  P.cap=b(M.jaune,.22,.13,.22);P.led=b(M.led,.08,.035,.08);
  P.bras=b(M.chrome,1,.075,.075);P.poing=b(M.fer,.08,.16,.16);
  P.barre=b(M.chrome,.06,.07,1);                                  // la BARRE en travers de la jante, à hauteur du moyeu
  P.gAv=b(M.jaune,1,.09,.07);P.gAr=b(M.jaune,1,.09,.07);           // les deux GRIFFES qui se referment sur la bande du pneu, devant et derrière
  return P;}
function garRoues(){ /* (2026-10-12, Léo : « les trucs tournaient et traversaient la voiture ») les roues de la caisse AFFICHÉE, mesurées sur
     elle : chaque ESSIEU (groupe userData.essieu) porte ses deux roues SOUDÉES en un maillage — sa boîte donne le flanc extérieur de chaque
     côté, la hauteur du moyeu et le rayon. La liste globale `wheels` ne tient que les roues d'avant la soudure (détachées). Repli : des
     roues encore à part (userData.R) avant la soudure. Rend un côté par entrée : {sx, xo (flanc, |x|), y, z, R}. */
  const L=[],bb=GATL._bb||(GATL._bb=new THREE.Box3()),b9=GATL._b9||(GATL._b9=new THREE.Box3());
  for(const o of carGroup.children){const u=o.userData||{};
    if(u.essieu){bb.makeEmpty();for(const m of o.children){if(!m.geometry)continue;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();b9.copy(m.geometry.boundingBox).applyMatrix4(m.matrix);bb.union(b9);}
      if(bb.isEmpty())continue;const R=Math.max(.2,(bb.max.y-bb.min.y)/2),y=o.position.y+(bb.max.y+bb.min.y)/2,z=o.position.z+(bb.max.z+bb.min.z)/2;
      L.push({sx:1,xo:Math.max(.05,o.position.x+bb.max.x),y:y,z:z,R:R});L.push({sx:-1,xo:Math.max(.05,-(o.position.x+bb.min.x)),y:y,z:z,R:R});}
    else if(u.R!=null&&o.children.length){const x=o.position.x,lw=u.large||.3;
      for(const sx of (Math.abs(x)<.05?[-1,1]:[Math.sign(x)]))L.push({sx:sx,xo:Math.abs(x)+lw/2,y:o.position.y,z:o.position.z,R:u.R});}}
  return L;}
function garPincesPose(cle){
  GATL.cle=cle;const pg=GATL.pg;GATL.pinces.length=0;while(pg.children.length)pg.remove(pg.children[0]); // géométries et matières partagées : rien à libérer
  for(const w of garRoues()){const P=garPinceNeuve(w.y,w.R,.3);P.o.position.set(w.sx*(w.xo+.02),0,w.z);P.o.scale.x=w.sx;pg.add(P.o);GATL.pinces.push(P);}}
function garAtelierTick(dt,ay){
  const on=GATL.on&&garageOn&&!GAR.go&&!!gEl&&!gEl.classList.contains('menu');
  if(GATL.on&&!on&&GAR.go){GATL.on=false;try{gModeBoutons();}catch(e){}} // JOUER (clavier) : l'atelier se rouvre d'un coup, la porte suit le lâcher
  const ap=(v,t,r)=>v+Math.max(-r*dt,Math.min(r*dt,t-v)),sm=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u);};
  GATL.c=ap(GATL.c,on?1:0,on?1/.9:1/.7);GATL.cs=sm(GATL.c);
  GATL.l=ap(GATL.l,on&&GATL.c>.5?1:0,on?1/.45:1/.3);
  const cle=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length,veut=on&&GATL.c>.62&&!GAR.sw&&GATL.cle===cle&&!(brasVoulu()||BRB.p>.02); /* (2026-10-19) onglet FIGURES : les pinces rentrent, LE BRAS DES FIGURES sort */
  GATL.p=ap(GATL.p,veut?1:0,veut?1/.9:1/.4);
  if(GATL.l>.06&&!GATL.sonL){GATL.sonL=1;try{if(SONV2)sfx('ui.on');}catch(e){}}if(GATL.l<.01)GATL.sonL=0;
  if(GATL.p>.985&&!GATL.sonP){GATL.sonP=1;try{if(SONV2)sfx('garage.tole');}catch(e){}try{hap(8);}catch(e){}}if(GATL.p<.5)GATL.sonP=0;
  const vis=GATL.c>.001||GATL.l>.001||GATL.p>.001,t=performance.now()*.001;
  // le plafond baisse : les tubes et leurs cônes (la lampe éclaire seule)
  if(GATL.dim!==GATL.cs&&GAR.tubes.length){GATL.dim=GATL.cs;const k=1-.62*GATL.cs;
    if(!GATL.tc0)GATL.tc0=GAR.tubes[0].material.color.clone();for(const m of GAR.tubes)m.material.color.copy(GATL.tc0).multiplyScalar(k);
    for(const h of GAR.halos)h.material.opacity=.05*(1-.75*GATL.cs);}
  if(!GATL.g){if(!vis)return;garAtelierBatir();}
  GATL.g.visible=vis;if(!vis)return;
  if(GATL.cle!==cle&&GATL.p<.02)garPincesPose(cle);
  // LA LAMPE : elle descend pendant que la porte ferme, puis s'allume en grésillant
  const l=GATL.l,b=GATL.lb=l<=0?0:l>=1?1:l*(Math.sin(t*57)+Math.sin(t*23)>-.3?1:.2),H=GAR.H,dr=(.25+2.15*GATL.cs)*(1-BRB.p)-.75*BRB.p, /* (2026-10-19) le bras des figures est là : la lampe RENTRE dans le plafond (place aux grands saltos) */yA=H-dr;
  GATL.cord.scale.y=Math.max(.001,dr);GATL.cord.position.set(0,H-dr/2,0);GATL.cul.position.set(0,yA-.02,0);GATL.abat.position.set(0,yA-.24,0);GATL.amp.position.set(0,yA-.42,0);
  GATL.ampM.color.setRGB(.16+.84*b,.15+.8*b,.12+.68*b);
  const hR=yA-.44-GAR.POD,rB=2.5;GATL.ray.position.set(0,GAR.POD+hR/2,0);GATL.ray.scale.set(2*rB,hR,2*rB);GATL.rayM.opacity=.075*b*(1-BRB.p);GATL.ray.visible=b*(1-BRB.p)>.01;
  GATL.flaq.position.set(0,GAR.POD+.016,0);GATL.flaq.scale.set(6.4,6.4,1);GATL.flaqM.opacity=.42*b*(1-BRB.p);GATL.flaq.visible=b*(1-BRB.p)>.01; // (le bras des figures : la lampe rentrée, sa clé éclaire encore la caisse)
  // la clé passe AU-DESSUS de la caisse (la lampe), plus chaude et plus forte ; le contre-jour baisse
  if(b>0){GATL.v.set(0,ay+yA-.6,.35);stallKey.position.lerp(GATL.v,b);stallKey.intensity+=.85*b;stallKey.color.lerp(GATL.cK,b);stallKey.distance=Math.max(stallKey.distance,22);}
  stallRim.intensity*=1-.5*GATL.cs;
  // LES PINCES : elles tournent avec le plateau, sous la caisse
  const pg=GATL.pg;pg.position.set(carGroup.position.x,carGroup.position.y-ay,carGroup.position.z);pg.quaternion.copy(carGroup.quaternion); /* (2026-10-12, Léo : « les trucs tournaient avec la plaque et traversaient la voiture ») l'orientation ENTIÈRE : dès qu'un quaternion oriente la caisse (la boutique qui la fait flotter), son angle Y d'Euler n'est plus son cap (au-delà de 90° il se décompose en (π, π−θ, π)) — les pinces tournaient à l'envers du plateau */pg.visible=GATL.p>.001;
  const p=GATL.p,ouv=sm(p/.12),mo=sm((p-.08)/.45),br=sm((p-.5)/.3),se=sm((p-.8)/.2),tenu=p>.985;
  GATL.M.led.color.setHex(tenu?0x3dff8a:0x5ff0ff);GATL.M.led.emissive.setHex(tenu?0x1fb85a:0x2fb8d0);
  for(const P of GATL.pinces){const H9=P.H,dz=-(H9+.3)*(1-mo),xb=P.x0-(P.x0-.02)*br,L9=Math.max(.001,(P.x0-.02)*br);
    P.cadre.scale.set(.6*ouv+.001,.012,.6*ouv+.001);P.trou.scale.set(.48*ouv+.001,.014,.48*ouv+.001);
    P.col.position.set(P.x0,dz+H9/2,0);P.cap.position.set(P.x0,dz+H9,0);P.led.position.set(P.x0,dz+H9+.08,0);
    P.bras.scale.x=L9;P.bras.position.set(P.x0-L9/2,dz+P.hy,0);P.poing.position.set(xb,dz+P.hy,0);
    const zB=(P.R+.05)*(.08+.92*br),lg=.02+(P.lw*.75+.04)*se;P.barre.scale.z=2*zB;P.barre.position.set(xb-.01,dz+P.hy,0);P.barre.visible=br>.01;
    P.gAv.scale.x=P.gAr.scale.x=lg;P.gAv.position.set(xb+.02-lg/2,dz+P.hy,zB);P.gAr.position.set(xb+.02-lg/2,dz+P.hy,-zB);P.gAv.visible=P.gAr.visible=br>.01;}
}
/* LE BRAS DES FIGURES (2026-10-19, Léo : « dans l'inventaire, quand on regarde les tricks, au lieu d'avoir une machine qui tient les roues,
   une machine prête à soulever la voiture et à la faire tourner — faire attention à la physique, que le truc ne passe pas à travers la
   voiture, cohérent avec ce qu'on a déjà dans le jeu » ; aux choix : « elle fait la figure » · « onglet FIGURES seulement »).
   À l'ATELIER FERMÉ (GATL.on), onglet FIGURES (SHOP.tab 'figure') : les pinces des roues rentrent (garAtelierTick), un grand BRAS ROBOT jaune
   (les matières des pinces, GATL.M : aucun programme de plus) sort replié d'une trappe du plateau, sur un RAIL posé sur le plateau (il tourne
   avec lui), et se met EN ATTENTE : son outil au-dessus du toit, de trois-quarts arrière vu de la caméra (on le voit sans qu'il cache la
   caisse) — il glisse sur son rail quand on tourne la caisse.
   Une figure touchée (garFigEssai → brasFigure) : c'est LUI qui la fait, sans jamais lâcher la caisse.
   LA RÈGLE QUI GARANTIT QUE RIEN NE TRAVERSE : une rotation laisse son AXE immobile. Le bras prend la caisse LÀ OÙ SORT L'AXE de la figure —
   le flanc pour un salto, la poupe pour un tonneau, le toit pour une toupie, le haut du flanc pour la vrille penchée : un PATIN au bout d'une
   TIGE couchée sur l'axe ; patin et tige tournent avec la caisse (le poignet les entraîne), le BOÎTIER du poignet est au-delà de la caisse sur
   l'axe, le reste du bras derrière lui. Deux mouvements à la fois :
   · le 1er autour de la verticale (rodéo, shimmy) : c'est le PLATEAU qui le fait (bras et caisse tournent ensemble, BRB.yaw), le bras ne fait
     que le 2e ;
   · sinon (tire-bouchon, salto cosmique) : une ÉQUERRE — l'outil se DÉPLIE en trois temps — tenue par le poignet sur le 1er axe, qui tient la
     tige sur le 2e ; elle passe plus loin que le rayon de la caisse autour du 2e axe, comme les anneaux d'un gyroscope.
   Il la SOULÈVE juste assez pour que rien ne touche le plateau en tournant (mesuré sur la figure échantillonnée), la fait tourner (FIG.quat :
   les courbes du Lecteur, au rythme d'une machine), la repose, replie l'outil, revient en attente. Chaque plan est VÉRIFIÉ avant de partir
   (brasPlan : le bras en capsules contre la boîte de la caisse et contre l'équerre, à chaque instant de la figure, de la montée, de l'approche) ;
   pas de plan sûr (figure à trois axes, axes parallèles) : le bras se range au bord de son rail et la caisse fait la figure comme avant.
   La caméra recule pendant la démonstration (BRB.cK, lu par le recul de garageRender) et la place de la caisse à l'écran monte avec la levée (BRB.cY, lu par garCadre). dbgBras() pour le banc. */
const BRB={L1:2.5,L2:2.4,Hs:1.05,Rr:3.95,Lh:.3,jeu:.12,pre:.55,elHaut:1.25,cote:2.0,plafond:5.85,
  p:0,g:null,M:null,m:{},phi:0,TP:null,plan:null,et:-1,t:0,attente:null,esquive:0,eK:0,libre:null,lieu:'atelier',y0:0,dSol:0,bqVeut:false,bqK:0,habit:'',joue:false,yaw:0,serre:0,cK:0,cY:0,
  mes:null,hovX:0,hovK:'',verif:false,vmin:9,vsol:9,vcoll:0,vmot:'',stat:{plans:0,refus:0,replis:0,chemins:0},
  qC:new THREE.Quaternion(),qY:new THREE.Quaternion(),qW:new THREE.Quaternion(),q9:new THREE.Quaternion(),q8:new THREE.Quaternion(),
  v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),v4:new THREE.Vector3(),v5:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0),
  M9:new THREE.Matrix4(),A:[0,0,0,1],F1:{m:[null]},R:null,Rk:null,caps:[]};
function brasVoulu(){return !!(GATL.on&&garageOn&&!GAR.go&&gEl&&!gEl.classList.contains('menu')&&SHOP.tab==='figure');}
function brasBqVoulu(){return !!(garageOn&&!GAR.go&&GBQ.on&&GBQ.k>.5&&GBQ.grp&&GBQ.grp.visible&&GBQ.cat==='figure'&&(GBQ.ong||'cat')==='cat');} // la BOUTIQUE, catégorie FIGURES (2026-10-19)
/* (2026-10-19, soir — Léo : « enlève les bras robots ; quand il y a les tricks, on enlève le truc qui bloque les roues, on le remet sur une
   autre catégorie ; dans la boutique aussi : le bras enlevé, la voiture posée au sol, elle fait la figure, tout simplement ») LE BRAS DES
   FIGURES EST RANGÉ : il ne sort plus (BRAS_FIG faux ; `?bras=1` le rend tel quel, pour comparer). Dès qu'on ARRIVE dans FIGURES — l'onglet
   de l'inventaire, la catégorie de la boutique — les pinces des roues rentrent (garAtelierTick) ; en boutique les deux bras d'argent posent
   la caisse sur le plateau et rentrent dans le sol (BRB.bqK, sans attendre la 1re figure). La figure touchée, la caisse la fait SEULE
   (garFigEssai : l'animation d'avant le bras), une fois posée (figPosee ; touchée trop tôt, elle attend dans BRB.libre). Une autre
   catégorie : les pinces et les bras d'argent reviennent. */
const BRAS_FIG=/[?&]bras=1\b/.test(location.search);
function figPosee(){return brasBqVoulu()?(BRB.bqK>.98&&(GBQ.ba||0)<.03&&Math.abs(GBQ.lev||0)<.04):!(GATL.p>.06);} // la caisse est libre : posée sur le plateau de la boutique, ou les pinces rentrées
function brasYaw0(){return garRot()+(BRB.lieu==='boutique'?(GBQ.yaw||0):0);} // le cap de la caisse posée (en boutique, le doigt la tourne : GBQ.yaw)
function brasSm(u){u=u<0?0:u>1?1:u;return u*u*(3-2*u);}
function brasDep(u){u=u<0?0:u>1?1:u;const c=1.25;return 1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2);} // monte, dépasse de ~4 %, se pose (sortie « en arrière »)
function brasAng(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));} // a − b, ramené dans ]−π, π]
function brasDir(az,el,o){const c=Math.cos(el);return o.set(c*Math.sin(az),Math.sin(el),c*Math.cos(az));}
function brasAxe(a){const v=new THREE.Vector3(+a[0]||0,+a[1]||0,+a[2]||0);return v.lengthSq()>1e-9?v.normalize():null;}
/* LA CAISSE, mesurée une fois (repère de la caisse = celui du plateau au repos) : la boîte de toutes ses pièces pleines (roues comprises, ni
   halos ni flaques), son centre (le pivot des figures), ses huit coins, et les maillages que visent les rayons (le contact du patin). */
function brasMesure(){const k=garageI+':'+(carBody?carBody.children.length:0)+':'+carGroup.children.length;if(BRB.mes&&BRB.mes.k===k)return BRB.mes;
  const p0=BRB.v1.copy(carGroup.position),q0=BRB.q9.copy(carGroup.quaternion),s0=BRB.v2.copy(carGroup.scale);
  carGroup.position.set(0,0,0);carGroup.quaternion.set(0,0,0,1);carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);
  const bb=new THREE.Box3(),b9=new THREE.Box3(),ms=[];
  carGroup.traverse(function(o){if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)return;
    const mt=Array.isArray(o.material)?o.material[0]:o.material;if((mt&&(mt.blending===THREE.AdditiveBlending||(mt.transparent&&mt.opacity<.05)))||(o.userData&&o.userData.sol))return; // les vitres et le verre comptent (une caisse de verre mesurée sans elles faisait 30 cm)
    b9.setFromBufferAttribute(o.geometry.attributes.position).applyMatrix4(o.matrixWorld);if(b9.isEmpty())return;bb.union(b9);ms.push(o);}); // (les sommets eux-mêmes : la boîte gardée par certaines géométries soudées est vide)
  if(bb.isEmpty())bb.set(new THREE.Vector3(-1,0,-2.2),new THREE.Vector3(1,1.3,2.2));
  const C=bb.getCenter(new THREE.Vector3()),K=[];for(let i=0;i<8;i++)K.push(new THREE.Vector3(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z));
  const M=BRB.mes={k:k,bb:bb,C:C,K:K,ms:ms,R:0,cont:{}};for(const v of K)M.R=Math.max(M.R,v.distanceTo(C));
  BRB.Hs=Math.max(1.05,Math.min(2.9,bb.max.y-.3)); // une caisse haute (LE MASTODONTE, 3 m) : la colonne du bras s'allonge pour passer par-dessus
  carGroup.position.copy(p0);carGroup.quaternion.copy(q0);carGroup.scale.copy(s0);carGroup.updateMatrixWorld(true);
  return M;}
function brasExt(K,pv,d){let m=-1e9;for(const k of K)m=Math.max(m,(k.x-pv.x)*d.x+(k.y-pv.y)*d.y+(k.z-pv.z)*d.z);return m;} // ce que la caisse avance le long de d
function brasRay(K,pv,d){let m=0;for(const k of K){const t=(k.x-pv.x)*d.x+(k.y-pv.y)*d.y+(k.z-pv.z)*d.z;m=Math.max(m,k.distanceToSquared(pv)-t*t);}return Math.sqrt(m);} // son rayon autour de l'axe (pv, d)
/* le CONTACT du patin : un rayon qui arrive par l'axe, de l'extérieur, sur la vraie carrosserie (repère de la caisse) → sa distance au pivot */
function brasContact(pv,d,e){const M=BRB.mes,ck=pv.x.toFixed(3)+','+pv.y.toFixed(3)+','+pv.z.toFixed(3)+'|'+d.x.toFixed(3)+','+d.y.toFixed(3)+','+d.z.toFixed(3);if(M.cont[ck]!=null)return M.cont[ck];
  const p0=BRB.v1.copy(carGroup.position),q0=BRB.q9.copy(carGroup.quaternion),s0=BRB.v2.copy(carGroup.scale);
  carGroup.position.set(0,0,0);carGroup.quaternion.set(0,0,0,1);carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);
  // le rayon, triangle par triangle (pas de Raycaster : il se fie aux sphères englobantes, vides sur certaines géométries soudées)
  const ray=new THREE.Ray(),loc=new THREE.Ray(),inv=new THREE.Matrix4(),A=new THREE.Vector3(),B=new THREE.Vector3(),Cc=new THREE.Vector3(),h=new THREE.Vector3(),hw=new THREE.Vector3();
  ray.set(BRB.v3.copy(pv).addScaledVector(d,e+.6),BRB.v4.copy(d).negate());let best=1e9;
  for(const o of M.ms){inv.copy(o.matrixWorld).invert();loc.copy(ray).applyMatrix4(inv);const ps=o.geometry.attributes.position,ix=o.geometry.index,n=ix?ix.count:ps.count;
    for(let t=0;t+2<n;t+=3){const i0=ix?ix.getX(t):t,i1=ix?ix.getX(t+1):t+1,i2=ix?ix.getX(t+2):t+2;A.fromBufferAttribute(ps,i0);B.fromBufferAttribute(ps,i1);Cc.fromBufferAttribute(ps,i2);
      if(loc.intersectTriangle(A,B,Cc,false,h)){hw.copy(h).applyMatrix4(o.matrixWorld);const dd=hw.distanceTo(ray.origin);if(dd<best)best=dd;}}}
  carGroup.position.copy(p0);carGroup.quaternion.copy(q0);carGroup.scale.copy(s0);carGroup.updateMatrixWorld(true);
  let r=best<1e8?e+.6-best:e;if(r>e)r=e;return M.cont[ck]=Math.max(.02,r);}
/* LA ROTATION de la figure à la progression x : BRB.qC (la caisse), BRB.qY (l'équerre), BRB.yaw (le plateau) — repère du plateau */
function brasMv(mv,x,o){BRB.F1.m[0]=mv;FIG.quat(BRB.F1,x,1,BRB.A);return o.set(BRB.A[0],BRB.A[1],BRB.A[2],BRB.A[3]);}
function brasRot(pl,x){
  if(pl.kind==='plateau'){brasMv(pl.f.m[0],x,BRB.q8);BRB.yaw=2*Math.atan2(BRB.q8.y,BRB.q8.w);if(pl.f.m[1])brasMv(pl.f.m[1],x,BRB.qC);else BRB.qC.identity();BRB.qY.identity();return;}
  FIG.quat(pl.f,x,1,BRB.A);BRB.qC.set(BRB.A[0],BRB.A[1],BRB.A[2],BRB.A[3]);BRB.yaw=0;if(pl.kind==='equerre')brasMv(pl.f.m[0],x,BRB.qY);else BRB.qY.identity();}
function brasBas(pl){let mn=1e9,mx=-1e9;const C=pl.pv,K=BRB.mes.K,v=BRB.v5; // le plus bas (et le plus haut, pl.hi) que vont la caisse et l'équerre pendant la figure, sans levée
  for(let i=0;i<=96;i++){brasRot(pl,i/96);for(const k of K){v.copy(k).sub(C).applyQuaternion(BRB.qC);mn=Math.min(mn,C.y+v.y);mx=Math.max(mx,C.y+v.y);}
    if(pl.kind==='equerre')for(const Q of [pl.Q1,pl.Q2,pl.Wa]){v.copy(Q).sub(C).applyQuaternion(BRB.qY);mn=Math.min(mn,C.y+v.y-.14);mx=Math.max(mx,C.y+v.y+.14);}}
  BRB.yaw=0;pl.hi=mx;return mn;}
/* LE BRAS : chariot sur le rail (azimut phi), tourelle, épaule à Hs, bras L1, coude, avant-bras L2, poignet au centre Wc ; le BOÎTIER part du
   poignet vers la caisse le long de d (sa face W). Coude toujours en haut. */
function brasIK(phi,Wc,dir,R){R=R||{T:new THREE.Vector3(),S:new THREE.Vector3(),E:new THREE.Vector3(),W2:new THREE.Vector3(),Wc:new THREE.Vector3(),W:new THREE.Vector3(),d:new THREE.Vector3()};
  R.phi=phi;R.Wc.copy(Wc);R.d.copy(dir);R.T.set(Math.sin(phi)*BRB.Rr,0,Math.cos(phi)*BRB.Rr);R.S.set(R.T.x,BRB.Hs,R.T.z);
  let hx=Wc.x-R.S.x,hz=Wc.z-R.S.z;const d=Math.hypot(hx,hz),v=Wc.y-R.S.y,D=Math.hypot(d,v),L1=BRB.L1,L2=BRB.L2;
  if(d>1e-4){hx/=d;hz/=d;}else{hx=-Math.sin(phi);hz=-Math.cos(phi);}R.hx=hx;R.hz=hz;R.ok=D<=L1+L2-.03&&D>=Math.abs(L1-L2)+.05;
  const Dc=Math.min(L1+L2-1e-3,Math.max(Math.abs(L1-L2)+1e-3,D)),al=Math.atan2(v,d)+Math.acos(Math.max(-1,Math.min(1,(L1*L1+Dc*Dc-L2*L2)/(2*L1*Dc))));
  R.E.set(R.S.x+L1*Math.cos(al)*hx,R.S.y+L1*Math.sin(al),R.S.z+L1*Math.cos(al)*hz);
  R.W2.copy(Wc).sub(R.E).setLength(L2).add(R.E);R.W.copy(R.W2).addScaledVector(dir,-BRB.Lh);return R;}
function brasCaps(R){const c=BRB.caps;c.length=0;const p=(a,b,r)=>{c.push(a.x,a.y,a.z,b.x,b.y,b.z,r);};
  p(BRB.v4.set(R.T.x,.35,R.T.z),R.S,.45);p(R.S,R.E,.24);p(R.E,R.W2,.18);return c;}
function brasBoite(x,y,z,bb){const dx=Math.max(bb.min.x-x,0,x-bb.max.x),dy=Math.max(bb.min.y-y,0,y-bb.max.y),dz=Math.max(bb.min.z-z,0,z-bb.max.z);
  if(dx>0||dy>0||dz>0)return Math.sqrt(dx*dx+dy*dy+dz*dz);return -Math.min(x-bb.min.x,bb.max.x-x,y-bb.min.y,bb.max.y-y,z-bb.min.z,bb.max.z-z);}
function brasSeg(px,py,pz,A,B){const vx=B.x-A.x,vy=B.y-A.y,vz=B.z-A.z,l2=vx*vx+vy*vy+vz*vz;let t=l2>1e-9?((px-A.x)*vx+(py-A.y)*vy+(pz-A.z)*vz)/l2:0;t=t<0?0:t>1?1:t;
  const dx=px-A.x-vx*t,dy=py-A.y-vy*t,dz=pz-A.z-vz*t;return Math.sqrt(dx*dx+dy*dy+dz*dz);}
/* LE JEU entre le bras et la caisse (sa boîte, posée par qC autour de pv levé de L) et l'équerre (posée par qY) : le plus petit écart, en
   mètres (négatif = il la traverse). x < 0 : la caisse au repos. */
function brasJeu(R,pl,x,L){const M=BRB.mes,bb=M.bb;let mn=9;const pv=BRB.pvJ||(BRB.pvJ=new THREE.Vector3());pv.copy(pl?pl.pv:M.C);const sk=pl&&pl.sh&&pl.L>0?Math.min(1,L/pl.L):0;
  if(x<0||!pl){BRB.qC.identity();BRB.qY.identity();}else brasRot(pl,x);
  BRB.q9.copy(BRB.qC).invert();const c=brasCaps(R),v=BRB.v5,eq=pl&&pl.kind==='equerre'&&x>=0;let Y1,Y2,Ya;
  if(eq){const C=pl.pv;Y1=BRB.yq1||(BRB.yq1=new THREE.Vector3());Y2=BRB.yq2||(BRB.yq2=new THREE.Vector3());Ya=BRB.yqa||(BRB.yqa=new THREE.Vector3());
    for(const [o,Q] of [[Y1,pl.Q1],[Y2,pl.Q2],[Ya,pl.Wa]]){o.copy(Q).sub(C).applyQuaternion(BRB.qY).add(C);o.y+=L;}}
  for(let i=0;i<c.length;i+=7){const ax=c[i],ay=c[i+1],az=c[i+2],bx=c[i+3],by=c[i+4],bz=c[i+5],r=c[i+6],l=Math.hypot(bx-ax,by-ay,bz-az),n=Math.max(1,Math.ceil(l/.12));
    for(let j=0;j<=n;j++){const t=j/n,px=ax+(bx-ax)*t,py=ay+(by-ay)*t,pz=az+(bz-az)*t;
      v.set(px-pv.x-(sk?pl.sh.x*sk:0),py-pv.y-L,pz-pv.z-(sk?pl.sh.z*sk:0)).applyQuaternion(BRB.q9).add(pv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,bb)-r);
      if(eq&&(px-R.Wc.x)**2+(py-R.Wc.y)**2+(pz-R.Wc.z)**2>.25)mn=Math.min(mn,Math.min(brasSeg(px,py,pz,Y1,Y2),brasSeg(px,py,pz,Y2,Ya))-r-.11);}}
  BRB.yaw=0;return mn;}
function brasSur(pv,dir){return brasExt(BRB.mes.K,pv,dir)+BRB.Lh+.26;} // assez loin pour que l'outil REPLIÉ ne touche jamais la boîte
function brasCamAz(){return garCamA()-(brasYaw0()+BRB.yaw);} // où est la caméra, vue du plateau
function brasVue(ph,cam){return Math.min(Math.abs(brasAng(ph,cam+BRB.cote)),Math.abs(brasAng(ph,cam-BRB.cote)));} // la place qui MONTRE le bras sans cacher la caisse : de trois-quarts arrière (cote), d'un côté ou de l'autre
function brasPhis(d,cam){const h=Math.hypot(d.x,d.z),L=[];if(h>.35){const a=Math.atan2(d.x,d.z);L.push(a,a+.32,a-.32);}else for(let k=0;k<12;k++)L.push(k*Math.PI/6);return L;}
/* LE PLAN d'une figure : le genre de prise, l'axe, le patin, la levée, la place sur le rail — le premier plan SÛR, côté opposé à la caméra */
function brasPlan(f){
  const mv=f&&f.m;if(!mv||!mv.length||mv.length>2||!window.FIG||!FIG.quat)return null;
  const M=brasMesure(),C=M.C,K=M.K,a0=brasAxe(mv[0].a),a1=mv[1]?brasAxe(mv[1].a):null;if(!a0||(mv[1]&&!a1))return null;
  let kind,inner,outer;
  if(!a1){kind=f.piv&&Math.abs(a0.y)>.9?'plateau':'axe';inner=kind==='plateau'?BRB.Y.clone():a0;}else if(Math.abs(a0.y)>.9&&Math.abs(a0.dot(a1))<.3){kind='plateau';inner=a1;}else if(Math.abs(a0.dot(a1))<.95){kind='equerre';inner=a1;outer=a0;}else return null;
  const cam=brasCamAz(),cands=[];
  if(kind!=='equerre'){
    const pv=C.clone();if(f.piv&&Math.abs(a0.y)>.9)pv.z+=f.piv*(M.bb.max.z-C.z); // le TAIL WHIP : le point fixe vers le nez
    for(const sg of [1,-1]){const d=inner.clone().multiplyScalar(sg);if(d.y<-.35||(Math.abs(inner.y)>.9&&d.y<0))continue; // jamais par en dessous : la caisse est posée
      const e=brasExt(K,pv,d),pc=brasContact(pv,d,e);
      const pl={f:f,kind:kind,pv:pv,d:d,az:Math.atan2(d.x,d.z),el:Math.asin(Math.max(-1,Math.min(1,d.y))),rho:e+BRB.jeu+BRB.Lh,stub:e+BRB.jeu-pc,sh:kind==='plateau'?new THREE.Vector3(-pv.x,0,-pv.z):null};
      for(const ph of brasPhis(d,cam))cands.push([pl,ph]);
      if(kind==='axe'&&Math.abs(inner.y)>.9){const p2=Object.assign({},pl,{kind:'plateau',sh:new THREE.Vector3(-pv.x,0,-pv.z),alt:1,L:null}); // une toupie trop longue pour le poignet (sa poupe balaierait le bras) : c'est le plateau qui la fait tourner
        for(const ph of brasPhis(d,cam))cands.push([p2,ph]);}}}
  else for(const sa of [1,-1])for(const sb of [1,-1]){const a=outer.clone().multiplyScalar(sa),b=inner.clone().multiplyScalar(sb);if(b.y<-.35)continue;
    const cr=BRB.v1.crossVectors(a,b).length();if(cr<.3)continue;
    const eb=brasExt(K,C,b),Rb=brasRay(K,C,b),r=Rb+.24,s=r/cr,u=a.clone().addScaledVector(b,-a.dot(b)).normalize();
    const Q1=C.clone().addScaledVector(b,eb+BRB.jeu),Q2=Q1.clone().addScaledVector(u,r),Wa=C.clone().addScaledVector(a,s);
    if(Math.min(Q1.y,Q2.y,Wa.y)<.2)continue; // l'équerre passerait sous la caisse posée
    const pc=brasContact(C,b,eb);
    const pl={f:f,kind:kind,pv:C.clone(),d:a,b:b,az:Math.atan2(a.x,a.z),el:Math.asin(Math.max(-1,Math.min(1,a.y))),rho:s+BRB.Lh,Q1:Q1,Q2:Q2,Wa:Wa,stub:eb+BRB.jeu-pc};
    for(const ph of brasPhis(a,cam))cands.push([pl,ph]);}
  cands.sort(function(A,B){return ((A[0].alt?10:0)+brasVue(A[1],cam))-((B[0].alt?10:0)+brasVue(B[1],cam));});
  const Wc=BRB.v2,R=BRB.Rk||(BRB.Rk=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null));let essais=0;const pq=BRB.pq={}; // (banc) pourquoi chaque essai a été refusé
  const no=function(k){pq[k]=(pq[k]||0)+1;};
  for(const cd of cands){const pl=cd[0],ph=cd[1];essais++;
    if(pl.L==null){pl.L=Math.max(.45,.1-brasBas(pl));}if(pl.L>2.7||pl.L+pl.hi>BRB.plafond){no('plafond');continue;} // sous la lampe remontée et le plafond de l'atelier
    const d=pl.d,ok=function(rho,L,x){Wc.copy(pl.pv).addScaledVector(d,rho);Wc.y+=L;if(pl.sh)Wc.addScaledVector(pl.sh,Math.min(1,L/pl.L));brasIK(ph,Wc,d,R);return R.ok&&brasJeu(R,pl,x,L)>.04;};
    if(!ok(pl.rho+BRB.pre,0,-1)||!ok(pl.rho,0,-1)){no('prise');continue;}
    let bon=true;for(let i=1;i<=4&&bon;i++)bon=ok(pl.rho,pl.L*i/4,-1);bon=bon&&ok(pl.rho,pl.L*1.06,-1);if(!bon){no('levee');continue;} // (1,06 : la levée dépasse un poil avant de se poser, brasDep)
    Wc.copy(pl.pv).addScaledVector(d,pl.rho);Wc.y+=pl.L;if(pl.sh)Wc.add(pl.sh);brasIK(ph,Wc,d,R);if(!R.ok){no('portee');continue;}
    for(let i=0;i<=60&&bon;i++)bon=brasJeu(R,pl,i/60,pl.L)>.04;if(!bon){no('rotation');continue;}
    const A9=BRB.TP?brasTPcopie(BRB.TP):brasAttente(cam+BRB.cote),B9={pv:pl.pv.clone(),az:pl.az,el:pl.el,rho:pl.rho+BRB.pre,phi:ph,u:0,L:0},
      phR=brasHovCible(cam,ph),Ca=brasCheminSur(A9,B9),Cr=Ca&&brasCheminSur(B9,brasAttente(phR));
    if(!Ca||!Cr){BRB.stat.chemins++;no(Ca?'retour':'aller');continue;}
    let rs=0;for(const k of K)rs=Math.max(rs,k.distanceTo(pl.pv));if(pl.sh)rs=Math.max(rs,pl.sh.length()+1);if(pl.kind==='equerre')rs=Math.max(rs,pl.Q2.distanceTo(C)+.15,pl.Wa.distanceTo(C)+.3);
    return Object.assign({},pl,{k:M.k,phi:ph,phiR:phR,Ca:Ca,Cr:Cr,Rsw:rs,D:Math.max(.95,(f.D||.7)*1.6),essais:essais});}
  BRB.stat.refus++;return null;}
/* LES POSES de l'outil : {pv (le pivot, repère du plateau), az, el, rho (le poignet à rho de pv, sur la direction az/el), phi (le chariot), u
   (l'outil déplié, 0 → 1), L (la levée)}. L'ATTENTE : au-dessus du toit, côté opposé à la caméra, 18 cm au-dessus de la boîte. */
function brasTP(){return {pv:new THREE.Vector3(),az:0,el:Math.PI/2,rho:2,phi:0,u:0,L:0};}
function brasTPcopie(a,o){o=o||brasTP();o.pv.copy(a.pv);o.az=a.az;o.el=a.el;o.rho=a.rho;o.phi=a.phi;o.u=a.u;o.L=a.L;return o;}
function brasAttente(phi,o){const M=brasMesure();o=o||brasTP();o.pv.copy(M.C);o.az=phi;o.el=Math.PI/2;o.rho=M.bb.max.y-M.C.y+BRB.jeu+BRB.Lh+.18+BRB.hovX;o.phi=phi;o.u=0;o.L=0;return o;}
/* LES PLACES D'ATTENTE SÛRES : pour chaque cran de 5° du rail, le bras en attente touche-t-il la caisse posée ? Une caisse très longue (L'ICEBERG,
   LE MUR DU SON) dépasse presque jusqu'au rail : devant son nez et sa poupe, le chariot n'a pas sa place. On prend la plus petite hauteur
   d'attente (hovX) qui libère le plus de crans ; le bras ne s'arrête jamais sur un cran interdit, ni ne le traverse (brasHovCible). */
function brasHovCale(){const M=brasMesure();if(BRB.hovK===M.k)return;BRB.hovK=M.k;const R=BRB.Rk||(BRB.Rk=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),T=brasTP();let mx=-1,hb=0,tb=null;
  for(let h=0;h<=1.6001;h+=.2){BRB.hovX=h;const t=[];let n=0;for(let k=0;k<72;k++){brasAttente(k*Math.PI/36,T);brasDir(T.az,T.el,BRB.v3);BRB.v2.copy(T.pv).addScaledVector(BRB.v3,T.rho);brasIK(T.phi,BRB.v2,BRB.v3,R);const ok=R.ok&&brasJeu(R,null,-1,0)>.08;t.push(ok);if(ok)n++;}
    if(n>mx){mx=n;hb=h;tb=t;}if(n===72)break;}
  BRB.hovX=hb;BRB.hovOk=tb;}
function brasHovSur(ph){const t=BRB.hovOk;if(!t)return true;return t[((Math.round(ph/(Math.PI/36))%72)+72)%72];}
function brasHovCible(cam,from){ // la place d'attente : la plus proche des deux trois-quarts arrière qu'on atteint depuis from sans passer par un cran interdit
  if(!brasHovSur(from)){for(let i=1;i<=36;i++)for(const sg of [1,-1]){const p=from+sg*i*Math.PI/36;if(brasHovSur(p))return p;}return from;}
  let best=from,bs=9;for(const c of [cam+BRB.cote,cam-BRB.cote]){const d=brasAng(c,from),n=Math.max(1,Math.ceil(Math.abs(d)/(Math.PI/72)));let last=from;
    for(let i=1;i<=n;i++){const p=from+d*i/n;if(!brasHovSur(p))break;last=p;}const sc=Math.abs(brasAng(c,last));if(sc<bs-.05){bs=sc;best=last;}}
  return best;}
/* LE CHEMIN d'une pose à l'autre : il MONTE (au-dessus, côté de son chariot), tourne là-haut (le chariot glisse sur le rail), puis DESCEND
   vers la suivante — le poignet reste du côté de son chariot, l'outil replié jamais plus près de la caisse que brasSur. */
function brasChemin(A,B,s,o,eH9,rX){eH9=eH9||BRB.elHaut;rX=rX||0;const dA=brasAng(B.az,A.az),dP=brasAng(B.phi,A.phi),loin=Math.abs(dA)>.25||Math.abs(dP)>.25||rX>0;
  o.pv.lerpVectors(A.pv,B.pv,brasSm(s));o.u=A.u+(B.u-A.u)*s;o.L=A.L+(B.L-A.L)*s;
  if(!loin){const k=brasSm(s);o.az=A.az+dA*k;o.el=A.el+(B.el-A.el)*k;o.phi=A.phi+dP*k;o.rho=A.rho+(B.rho-A.rho)*k;}
  else{const eH=Math.max(A.el,B.el,eH9),u=brasSm(s); // en haut, l'outil replié passe AU PLUS PRÈS (brasSur + rX) : plus loin, le bras ne l'atteindrait pas
    // (2026-10-19, Léo : « travailler un tout petit peu l'animation ») les trois temps se CHEVAUCHENT : il monte en commençant à tourner, descend en finissant — un seul geste continu
    const k1=brasSm(u/.42),k2=brasSm((u-.24)/.52),k3=brasSm((u-.58)/.42);
    o.az=A.az+dA*k2;o.phi=A.phi+dP*k2;o.el=A.el+(eH-A.el)*k1+(B.el-eH)*k3;
    const rs=brasSur(o.pv,brasDir(o.az,o.el,BRB.v3))+rX;o.rho=rs+(A.rho-rs)*(1-k1)+(B.rho-rs)*k3;}
  if(o.u<.01)o.rho=Math.max(o.rho,brasSur(o.pv,brasDir(o.az,o.el,BRB.v3)));return o;}
/* un chemin est SÛR si, à 24 instants, le bras l'atteint et ne touche pas la caisse posée ; sinon on essaie plus haut, plus loin */
const BR_CHEMINS=[[1.25,0],[1.45,0],[1.5708,0],[1.5708,.45],[1.5708,.9],[1.5708,1.4]];
function brasCheminSur(A,B){const R=BRB.Rc||(BRB.Rc=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),T=BRB.Tc||(BRB.Tc=brasTP()),W=BRB.Wc9||(BRB.Wc9=new THREE.Vector3()),d=BRB.dc9||(BRB.dc9=new THREE.Vector3());
  for(const c of BR_CHEMINS){let bon=true;for(let i=0;i<=24&&bon;i++){brasChemin(A,B,i/24,T,c[0],c[1]);brasDir(T.az,T.el,d);W.copy(T.pv).addScaledVector(d,T.rho);brasIK(T.phi,W,d,R);bon=R.ok&&brasJeu(R,null,-1,0)>.03;}
    if(bon)return c;}
  return null;}
function brasCheminDur(A,B){return Math.min(1.3,.5+.22*Math.abs(brasAng(B.phi,A.phi))+.25*Math.abs(B.el-A.el)+.12*Math.abs(B.rho-A.rho));}
/* LA DÉMONSTRATION : les étapes (nom, durée) ; chacune pose BRB.TP (et la caisse quand elle est tenue) */
function brasFigure(f){if(!f)return false;
  if(BRB.plan&&BRB.et===0&&BRB.t<.25){BRB.TP=brasTPcopie(BRB.plan.A,BRB.TP);BRB.plan=null;BRB.joue=false;} // le même toucher la demande deux fois (shopShow, puis avec son sens) : la 2e remplace la 1re
  if(BRB.plan||BRB.p<.999||!BRB.TP){BRB.attente=f;return true;} // il finit celle-ci (ou finit de sortir), puis enchaîne
  const pl=brasPlan(f);if(!pl){BRB.stat.replis++;return 'libre';} // pas de plan sûr : il rentre dans sa trappe, la caisse la fait seule (garFigEssai, libre)
  brasLance(pl);return true;}
function brasDemande(f){const r=brasFigure(f);if(r==='libre')BRB.libre={id:(f.src||f).id,c:f.sens==='avant'?0:f.sens==='arriere'?1:null,t:.5};return r;} // une figure qui attendait : sans plan, la caisse la fera seule
function brasLance(pl){BRB.stat.plans++;pl.A=brasTPcopie(BRB.TP);pl.Bp={pv:pl.pv.clone(),az:pl.az,el:pl.el,rho:pl.rho+BRB.pre,phi:pl.phi,u:0,L:0};
  pl.et=[['transit',brasCheminDur(pl.A,pl.Bp)+.25*pl.Ca[1]],['approche',.28],['deplie',pl.kind==='equerre'?.62:.32],['serre',.2],['leve',.62],['tourne',pl.D],['pose',.45],['replie',pl.kind==='equerre'?.42:.26],['recul',.22],['retour',.9+.25*pl.Cr[1]]];
  BRB.plan=pl;BRB.et=0;BRB.t=0;try{if(SONV2)sfx('garage.bascule',{vol:-10});}catch(e){}}
function brasEtape(dt){const pl=BRB.plan,TP=BRB.TP;let e=pl.et[BRB.et];if(BRB.fige&&e[0]===BRB.fige[0]){BRB.t=Math.min(BRB.t+dt,e[1]*BRB.fige[1]);dt=0;}BRB.t+=dt;
  while(BRB.t>=e[1]){BRB.t-=e[1];BRB.et++;
    if(e[0]==='deplie'){BRB.serre=1;try{if(SONV2)sfx('garage.tole');}catch(er){}try{hap(8);}catch(er){}}
    if(e[0]==='tourne'){BRB.yaw=0;}
    if(BRB.et>=pl.et.length){BRB.plan=null;BRB.joue=false;BRB.yaw=0;if(BRB.attente){const f=BRB.attente;BRB.attente=null;brasDemande(f);}return;}
    e=pl.et[BRB.et];
    if(e[0]==='tourne'){try{if(SONV2)sfx('turbo.mini',{vol:-6});GSON9=true;}catch(er){}}
    if(e[0]==='replie'){BRB.serre=0;try{if(SONV2)sfx('ui.on',{vol:-6});}catch(er){}}
    if(e[0]==='recul'&&BRB.attente){ // une autre figure attend : on enchaîne d'ici, sans repasser par l'attente
      const f=BRB.attente;BRB.attente=null;BRB.plan=null;BRB.joue=false;TP.u=0;TP.rho=pl.rho;const r9=brasPlan(f);
      if(r9){BRB.plan=null;brasLance(r9);return;}BRB.plan=pl;BRB.attente=f;}
    if(e[0]==='retour')pl.Br=brasAttente(pl.phiR,pl.Br);}
  const s=Math.min(1,BRB.t/e[1]),k=brasSm(s),n=e[0];
  BRB.joue=n==='serre'||n==='leve'||n==='tourne'||n==='pose';
  if(n==='transit')brasChemin(pl.A,pl.Bp,s,TP,pl.Ca[0],pl.Ca[1]);
  else if(n==='retour')brasChemin(pl.Bp,pl.Br,s,TP,pl.Cr[0],pl.Cr[1]);
  else{TP.pv.copy(pl.pv);TP.az=pl.az;TP.el=pl.el;TP.phi=pl.phi;
    TP.rho=n==='approche'?pl.rho+BRB.pre*(1-k):n==='recul'?pl.rho+BRB.pre*k:pl.rho;
    TP.u=n==='deplie'?s:n==='replie'?1-s:(n==='approche'||n==='recul')?0:1;
    TP.L=n==='serre'?.025*Math.sin(Math.PI*Math.min(1,s*1.4)):n==='leve'?pl.L*brasDep(s):n==='tourne'?pl.L:n==='pose'?pl.L*(1-k):0;}
  if(n==='tourne')brasRot(pl,s);else{BRB.qC.identity();BRB.qY.identity();BRB.yaw=0;}}
/* chaque image du garage (dans garFigTick, juste après la pose de la caisse sur le plateau) — rend vrai si c'est lui qui tient la caisse */
function brasTick(dt){dt=Math.min(.05,dt||0)*(BRB.lent||1); // (banc) dbgBras('lent',.25) : la démonstration au ralenti
  if(GAR.go&&(BRB.plan||BRB.libre||BRB.attente)){BRB.plan=null;BRB.libre=null;BRB.attente=null;BRB.joue=false;BRB.yaw=0;BRB.serre=0;} // JOUER : il lâche tout, le lâcher du garage prend la caisse
  const enA=brasVoulu(),enB=brasBqVoulu(),l9=enA?'atelier':enB?'boutique':BRB.lieu;
  const salle9=l9==='boutique'?!!(GBQ.on&&GBQ.k>.5):!!GATL.on;
  if(l9!==BRB.lieu||(!salle9&&(BRB.plan||BRB.libre||BRB.attente))){BRB.plan=null;BRB.libre=null;BRB.attente=null;BRB.joue=false;BRB.yaw=0;BRB.serre=0;if(l9!==BRB.lieu){BRB.p=0;BRB.TP=null;}} // on change de salle (ou on la quitte) : il lâche tout — une autre catégorie de la même salle : il finit sa figure
  BRB.lieu=l9;if(!enB)BRB.bqVeut=false;
  /* EN BOUTIQUE (Léo : « les autres posent la voiture et un autre bras apparaît ») : à la 1re figure demandée, les deux bras d'argent posent la
     caisse sur le plateau et rentrent dans le socle (BRB.bqK, lu par garBqIndus et garBqBras) ; le grand bras ne sort qu'une fois la caisse posée.
     On quitte la catégorie : il rentre d'abord, puis les deux bras ressortent et la relèvent. */
  if(!BRAS_FIG&&!enA&&!enB)BRB.libre=null; // (sans le bras) on quitte FIGURES : la figure qui attendait la pose tombe
  BRB.bqK=Math.max(0,Math.min(1,BRB.bqK+((BRB.lieu==='boutique'&&(BRAS_FIG?(BRB.bqVeut||BRB.p>.02):enB))?dt/.55:-dt/.55))); // (sans le bras) posée dès qu'on ARRIVE dans la catégorie
  const posee=BRAS_FIG?(BRB.lieu!=='boutique'||(BRB.bqK>.98&&(GBQ.ba||0)<.03&&Math.abs(GBQ.lev||0)<.04)):figPosee(),veut=BRAS_FIG&&(enA||(enB&&BRB.bqVeut));
  const c9=((veut&&posee&&(enB||(GATL.c>.62&&GATL.p<.06))&&!GAR.sw&&!BRB.libre&&!(BRB.esquive>0))||!!BRB.plan)?1:0;
  BRB.p=Math.max(0,Math.min(1,BRB.p+(c9?dt/1.3:-dt/.9)));
  BRB.esquive=Math.max(0,BRB.esquive-dt);
  if(BRB.libre&&BRB.p<=0&&posee){const L9=BRB.libre;BRB.libre=null;try{garFigEssai(L9.id,L9.c,true);}catch(e){}BRB.esquive=(GFIG.D||1.2)+.4;} // RENTRÉ : la caisse fait sa figure seule ; il ressortira après
  if(BRB.p<=0){if(BRB.g)BRB.g.visible=false;BRB.joue=false;BRB.yaw=0;BRB.cK*=Math.max(0,1-dt*3);BRB.cY*=Math.max(0,1-dt*3);BRB.plan=null;BRB.TP=null;return false;}
  if(!BRB.g)brasBatir();const M=brasMesure();brasHovCale();brasHabille(BRB.lieu);
  if(BRB.lieu==='boutique'){BRB.y0=GARAGE_Y+(GBQ.socleH||0)+.06-M.bb.min.y;BRB.dSol=BRB.y0-GARAGE_Y;GBQ.pit=GBQ.pitV=GBQ.rol=GBQ.rolV=0;}else{BRB.y0=GARAGE_Y+GAR.POD;BRB.dSol=0;} // en boutique la caisse posée repose 6 cm au-dessus du socle (garBqIndus) ; ni tangage ni roulis au doigt tant qu'il est là
  if(BRB.plan&&BRB.plan.k!==undefined&&BRB.plan.k!==M.k){BRB.plan=null;BRB.joue=false;BRB.yaw=0;} // la caisse a changé sous lui
  const cam=brasCamAz();
  if(!BRB.TP){BRB.phi=brasHovCible(cam,cam+BRB.cote);BRB.TP=brasAttente(BRB.phi);}
  if(!BRB.plan&&BRB.attente&&BRB.p>=.999&&BRB.TP){const f=BRB.attente;BRB.attente=null;brasDemande(f);}
  if(BRB.plan)brasEtape(dt);
  else{const T=BRB.TP,ci=brasHovCible(cam,T.phi),ph=T.phi+brasAng(ci,T.phi)*(1-Math.exp(-dt*2.2));brasAttente(ph,T);BRB.joue=false;BRB.yaw=0;BRB.serre=0;}
  const yw=brasYaw0()+BRB.yaw;
  BRB.g.position.set(0,BRB.y0,0);BRB.g.rotation.set(0,yw,0);BRB.g.visible=true;
  // la caisse, quand il la tient : tournée par qC autour du pivot levé de L (repère du plateau → monde)
  if(BRB.joue){const pl=BRB.plan,T=BRB.TP;BRB.qW.setFromAxisAngle(BRB.Y,yw);
    BRB.v1.copy(pl.pv).applyQuaternion(BRB.qC);BRB.v2.copy(pl.pv);BRB.v2.y+=T.L;if(pl.sh&&pl.L>0)BRB.v2.addScaledVector(pl.sh,Math.min(1,T.L/pl.L));BRB.v2.sub(BRB.v1).applyQuaternion(BRB.qW);
    carGroup.position.set(BRB.v2.x,BRB.y0+BRB.v2.y,BRB.v2.z);carGroup.quaternion.copy(BRB.qW).multiply(BRB.qC);}
  brasDessine(dt);
  // la caméra : un peu de recul pour le bras en attente, beaucoup pendant la démonstration
  let tK=0,tY=0;if(BRB.plan){const pl=BRB.plan,G=garGabarit(),e9=pl.et[BRB.et][0];tK=Math.min(1.5,Math.max(.25,.36*(pl.L+pl.Rsw)/Math.max(1.2,G.R)));if(e9!=='retour')tY=pl.L*.9+(pl.kind==='equerre'?.25:0);}
  tK*=BRB.p;tY*=BRB.p;BRB.cK+=(tK-BRB.cK)*Math.min(1,dt*2.2);BRB.cY+=(tY-BRB.cY)*Math.min(1,dt*2.2);
  if(BRB.verif)brasVerif();
  return BRB.joue;}
/* L'HABIT (Léo : « faut pas qu'il soit orange, faut qu'il soit comme dans la boutique ») : chaque pièce a un RÔLE ; à l'atelier le jaune des
   pinces, en boutique l'argent, le graphite, le chrome et la diode ambre des deux bras de la boutique (GBQ.matB : leurs programmes existent déjà). */
function brasHabille(l){if(BRB.habit===l||!BRB.g)return;if(l==='boutique'&&!GBQ.matB)return;
  if(!BRB.roles){BRB.roles=[];const A=GATL.M,mp=new Map([[A.jaune,'jaune'],[A.fer,'fer'],[A.chrome,'chrome'],[A.noir,'noir'],[BRB.M.led,'led']]);BRB.g.traverse(function(o){if(o.isMesh&&mp.has(o.material))BRB.roles.push([o,mp.get(o.material)]);});}
  if(!BRB.M.ledB){BRB.M.ledB=new THREE.MeshBasicMaterial({color:0xffb347,fog:false});BRB.M.ledB.color.setRGB(1.9,1.05,.38);}
  const B=GBQ.matB,P=l==='boutique'?{jaune:B.argent,fer:B.graph,chrome:B.chrome,noir:B.graph,led:BRB.M.ledB}:{jaune:GATL.M.jaune,fer:GATL.M.fer,chrome:GATL.M.chrome,noir:GATL.M.noir,led:BRB.M.led};
  for(const r of BRB.roles)r[0].material=P[r[1]];BRB.habit=l;}
/* LE MODÈLE (bâti au 1er besoin, matières de l'atelier) */
function brasBatir(){if(BRB.g)return BRB.g;if(!GATL.g)garAtelierBatir();
  const G=new THREE.Group();G.visible=false;scene.add(G);BRB.g=G;const M=GATL.M,BX=GATL.BX,CY=GATL.CY,m=BRB.m; // dans la SCÈNE : en boutique GAR.root est éteint
  BRB.M={led:new THREE.MeshLambertMaterial({color:0x5ff0ff,emissive:0x2fb8d0,flatShading:true,fog:false})}; // sa diode à lui (celle des pinces est partagée)
  const mk=(geo,mat)=>{const o=new THREE.Mesh(geo,mat);G.add(o);return o;};
  m.gorge=mk(new THREE.RingGeometry(BRB.Rr-.24,BRB.Rr+.24,72,1),M.noir);m.gorge.rotation.x=-Math.PI/2;m.gorge.position.y=.004; // la GORGE du rail, dans le plateau
  m.rails=[];for(const dr of [-.16,.16]){const t=mk(new THREE.TorusGeometry(BRB.Rr+dr,.028,4,96),M.chrome);t.rotation.x=-Math.PI/2;t.position.y=.012;m.rails.push(t);}
  m.trappe=mk(BX,M.jaune);m.trou=mk(BX,M.noir);
  m.chariot=mk(BX,M.fer);m.chBande=mk(BX,M.jaune);m.chRoues=[mk(CY,M.noir),mk(CY,M.noir)];
  m.tourBas=mk(CY,M.fer);m.colonne=mk(CY,M.fer);m.colBague=mk(CY,M.jaune);m.tourelle=mk(CY,M.jaune);m.epaule=mk(BX,M.jaune);m.tEpaule=mk(CY,M.fer);
  m.bras=mk(BX,M.jaune);m.brasFil=mk(BX,M.noir);m.verin=mk(CY,M.chrome);m.verinC=mk(CY,M.fer);
  m.tCoude=mk(CY,M.fer);m.avBras=mk(BX,M.jaune);m.avFil=mk(BX,M.noir);
  m.poignet=mk(CY,M.fer);m.boitier=mk(CY,M.jaune);m.led=mk(CY,BRB.M.led);m.bague=mk(CY,M.noir);
  m.tige=mk(CY,M.chrome);m.patin=mk(CY,M.noir);m.patinB=mk(CY,M.jaune);
  m.eq1=mk(BX,M.jaune);m.eq2=mk(BX,M.jaune);m.eqC=mk(CY,M.fer);m.boitB=mk(CY,M.jaune);m.ledB=mk(CY,BRB.M.led);
  return G;}
function brasTube(o,A,B,r){const d=BRB.v4.subVectors(B,A),l=d.length();o.visible=l>.004;if(!o.visible)return;o.position.addVectors(A,B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(BRB.Y,d.multiplyScalar(1/l));o.scale.set(2*r,l,2*r);}
function brasPoutre(o,A,B,w,h,up){const l=A.distanceTo(B);o.visible=l>.004;if(!o.visible)return;o.position.addVectors(A,B).multiplyScalar(.5);BRB.M9.lookAt(B,A,up||BRB.Y);o.quaternion.setFromRotationMatrix(BRB.M9);o.scale.set(w,h,l);}
function brasDisque(o,P,ax,r,ep){o.visible=true;o.position.copy(P);o.quaternion.setFromUnitVectors(BRB.Y,BRB.v4.copy(ax).normalize());o.scale.set(2*r,ep,2*r);}
const BRV=[...Array(14)].map(function(){return new THREE.Vector3();});
function brasDessine(dt){const m=BRB.m,T=BRB.TP,pl=BRB.plan,P=BRB.p,R=BRB.R||(BRB.R=brasIK(0,BRB.v2.set(0,2,0),BRB.Y,null)),V=BRV;
  // la pose du poignet : au repos, sorti de sa trappe (P < .5 : il monte replié ; puis il se déplie vers l'attente)
  const dir=brasDir(T.az,T.el,V[0]),Wc=V[1].copy(T.pv).addScaledVector(dir,T.rho);Wc.y+=T.L;if(pl&&pl.sh&&pl.L>0)Wc.addScaledVector(pl.sh,Math.min(1,T.L/pl.L));
  let yOff=0;if(P<1){const k=brasSm((P-.45)/.55);if(k<1){const Wp=V[2],dp=V[3];brasPark(T.phi,Wp,dp);Wc.lerp(Wp,1-k);dir.lerp(dp,1-k).normalize();}yOff=-(1-brasSm(P/.45))*4.4;}
  if(!pl)Wc.y+=.025*Math.sin(performance.now()*.0017)*P; // il respire, prêt
  brasIK(T.phi,Wc,dir,R);
  const Y=BRB.Y,tr=V[4].set(R.T.x,yOff,R.T.z),rad=V[5].set(Math.sin(T.phi),0,Math.cos(T.phi)),tg=V[6].set(Math.cos(T.phi),0,-Math.sin(T.phi));
  const up=(a)=>a+yOff,ds=BRB.dSol,upB=(a)=>a+yOff-ds;
  // le rail, la trappe
  const vr=P>.02;m.gorge.visible=vr&&BRB.lieu!=='boutique';for(const r of m.rails)r.visible=vr;const ks=Math.min(1,P*3);m.gorge.scale.set(1,1,1);m.gorge.position.y=.004-ds;
  for(const r of m.rails)r.position.y=.012*ks-ds;
  const ouv=P<1?Math.sin(Math.PI*Math.min(1,P/.7)):0;m.trappe.visible=m.trou.visible=ouv>.01;
  if(m.trappe.visible){m.trappe.position.set(R.T.x,.006-ds,R.T.z);m.trappe.rotation.set(0,T.phi,0);m.trappe.scale.set(1.5*ouv,.012,1.2*ouv);m.trou.position.set(R.T.x,.008-ds,R.T.z);m.trou.rotation.set(0,T.phi,0);m.trou.scale.set(1.3*ouv,.014,1.0*ouv);}
  // le chariot, la tourelle, l'épaule
  m.chariot.position.set(R.T.x,upB(.15),R.T.z);m.chariot.rotation.set(0,T.phi,0);m.chariot.scale.set(1.15,.24,.82);
  m.chBande.position.copy(m.chariot.position).addScaledVector(rad,.415);m.chBande.rotation.set(0,T.phi,0);m.chBande.scale.set(1.1,.08,.02);
  for(let i=0;i<2;i++){const w=m.chRoues[i];w.position.copy(tr).addScaledVector(tg,i?.42:-.42);w.position.y=upB(.07);w.quaternion.setFromUnitVectors(Y,rad);w.scale.set(.16,.86,.16);}
  m.tourBas.position.set(R.T.x,upB(.32),R.T.z);m.tourBas.rotation.set(0,0,0);m.tourBas.scale.set(1.0,.14,1.0);
  const hx9=BRB.Hs-1.05,lc9=hx9+ds;m.colonne.visible=m.colBague.visible=lc9>.02;if(lc9>.02){m.colonne.position.set(R.T.x,up(.36+(hx9-ds)/2),R.T.z);m.colonne.rotation.set(0,0,0);m.colonne.scale.set(.5,lc9+.05,.5);m.colBague.position.set(R.T.x,upB(.36+.04),R.T.z);m.colBague.rotation.set(0,0,0);m.colBague.scale.set(.66,.08,.66);} // la colonne télescopique
  m.tourelle.position.set(R.T.x,up(.58+hx9),R.T.z);m.tourelle.rotation.set(0,Math.atan2(R.hx,R.hz),0);m.tourelle.scale.set(.86,.38,.86);
  const ax=V[7].set(-R.hz,0,R.hx),S=V[8].copy(R.S);S.y+=yOff;const E=V[9].copy(R.E);E.y+=yOff;const W2=V[10].copy(R.W2);W2.y+=yOff;const W=V[11].copy(R.W);W.y+=yOff;
  m.epaule.position.set(R.T.x,up(.86+hx9),R.T.z);m.epaule.rotation.set(0,Math.atan2(R.hx,R.hz),0);m.epaule.scale.set(.62,.5,.78);
  brasDisque(m.tEpaule,S,ax,.3,.84);
  // le bras, son vérin, le coude, l'avant-bras (le câble noir le long du dos)
  brasPoutre(m.bras,S,E,.4,.34,ax);brasPoutre(m.brasFil,V[12].copy(S).addScaledVector(Y,.2),V[13].copy(E).addScaledVector(Y,.2),.07,.07,ax);
  const vb=V[12].copy(tr).addScaledVector(V[13].set(R.hx,0,R.hz),-.38);vb.y=up(.95+hx9);const vh=V[13].lerpVectors(S,E,.42);
  brasTube(m.verinC,vb,V[2].lerpVectors(vb,vh,.55),.085);brasTube(m.verin,vb,vh,.05);
  brasDisque(m.tCoude,E,ax,.25,.6);
  brasPoutre(m.avBras,E,W2,.3,.27,ax);brasPoutre(m.avFil,V[12].copy(E).addScaledVector(Y,.17),V[13].copy(W2).addScaledVector(Y,.15),.06,.06,ax);
  // le poignet, le boîtier (sa diode : cyan prêt, verte quand il tient), la tige et le patin
  const fa=V[2].subVectors(W2,E).normalize(),pa=V[3].crossVectors(fa,dir);if(pa.lengthSq()<1e-4)pa.copy(ax);
  brasDisque(m.poignet,W2,pa,.24,.44);brasTube(m.boitier,W2,W,.21);
  brasDisque(m.bague,V[12].copy(W).addScaledVector(dir,.1),dir,.225,.06);brasDisque(m.led,V[13].copy(W).addScaledVector(dir,.025),dir,.218,.045);
  BRB.M.led.color.setHex(BRB.serre?0x3dff8a:0x5ff0ff);BRB.M.led.emissive.setHex(BRB.serre?0x1fb85a:0x2fb8d0);if(BRB.M.ledB){if(BRB.serre)BRB.M.ledB.color.setRGB(.45,1.9,.75);else BRB.M.ledB.color.setRGB(1.9,1.05,.38);}
  const eq=pl&&pl.kind==='equerre'&&(BRB.et>=1&&BRB.et<=7);
  for(const o of [m.eq1,m.eq2,m.eqC,m.boitB,m.ledB])o.visible=false;
  let tA,tB;
  if(eq){ // l'ÉQUERRE, posée par qY autour du pivot levé, dépliée en trois temps
    const C=pl.pv,u1=Math.min(1,T.u*3),u2=Math.min(1,Math.max(0,T.u*3-1)),u3=Math.min(1,Math.max(0,T.u*3-2)),L=T.L;
    const pose=(Q,o)=>{o.copy(Q).sub(C).applyQuaternion(BRB.qY).add(C);o.y+=L+yOff;return o;};
    const Ya=pose(pl.Wa,V[12]),Y2=pose(pl.Q2,V[13]),Y1=pose(pl.Q1,V[4]),bw=V[5].copy(pl.b).applyQuaternion(BRB.qY);
    const e1=V[6].lerpVectors(Ya,Y2,u1);brasPoutre(m.eq1,Ya,e1,.2,.2);
    if(u1>=1){brasDisque(m.eqC,Y2,V[7].crossVectors(bw,V[3].subVectors(Ya,Y2).normalize()),.17,.26);const e2=V[3].lerpVectors(Y2,Y1,u2);brasPoutre(m.eq2,Y2,e2,.19,.19);}
    if(u2>=1){brasTube(m.boitB,V[3].copy(Y1).addScaledVector(bw,.1),V[7].copy(Y1).addScaledVector(bw,-.12),.17);brasDisque(m.ledB,V[7].copy(Y1).addScaledVector(bw,-.09),bw,.18,.04);}
    tA=V[2].copy(Y1).addScaledVector(bw,-.12);tB=V[3].copy(tA).addScaledVector(bw,-Math.max(0,pl.stub-.12)*u3);if(u3<=0)tB=null;}
  else{tA=W;tB=V[2].copy(W).addScaledVector(dir,-(pl?pl.stub:0)*T.u);if(!pl||T.u<=0)tB=null;}
  if(tB){const dd=V[5].subVectors(tB,tA);const l=dd.length();brasTube(m.tige,tA,tB,.07);const nd=l>1e-4?dd.multiplyScalar(1/l):dir;
    brasDisque(m.patin,V[6].copy(tB).addScaledVector(nd,-.03),nd,.2,.06);brasDisque(m.patinB,V[7].copy(tB).addScaledVector(nd,-.075),nd,.23,.03);}
  else{m.tige.visible=false;const pd=eq?null:dir;if(pd){brasDisque(m.patin,V[6].copy(W).addScaledVector(pd,-.01),pd,.2,.06);brasDisque(m.patinB,V[7].copy(W).addScaledVector(pd,.035),pd,.23,.03);}else{m.patin.visible=m.patinB.visible=false;}}
}
function brasPark(phi,Wc,dir){Wc.set(Math.sin(phi)*(BRB.Rr-.7),Math.max(2.55,(BRB.mes?BRB.mes.bb.max.y:1.4)+1.05),Math.cos(phi)*(BRB.Rr-.7));dir.set(0,1,0);} // REPLIÉ au-dessus de son chariot (la sortie de la trappe, l'esquive)
/* LE BANC : à chaque image, le vrai écart entre le bras dessiné et la caisse dessinée (et l'équerre), et la caisse contre le plateau */
function brasVerif(){const M=BRB.mes,R=BRB.R;if(!M||!R||!BRB.g.visible||BRB.p<.999)return;BRB.g.updateMatrixWorld(true);carGroup.updateMatrixWorld(true);
  const inv=BRB.M9.copy(carGroup.matrixWorld).invert(),c=brasCaps(R).slice(),v=BRB.v5;let mn=9;
  for(let i=0;i<c.length;i+=7){const n=Math.max(1,Math.ceil(Math.hypot(c[i+3]-c[i],c[i+4]-c[i+1],c[i+5]-c[i+2])/.08));
    for(let j=0;j<=n;j++){const t=j/n;v.set(c[i]+(c[i+3]-c[i])*t,c[i+1]+(c[i+4]-c[i+1])*t,c[i+2]+(c[i+5]-c[i+2])*t);BRB.g.localToWorld(v).applyMatrix4(inv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,M.bb)-c[i+6]);}}
  const m=BRB.m;for(const o of [m.eq1,m.eq2])if(o.visible){for(let j=0;j<=10;j++){v.set(0,0,j/10-.5).applyMatrix4(o.matrix);BRB.g.localToWorld(v).applyMatrix4(inv);mn=Math.min(mn,brasBoite(v.x,v.y,v.z,M.bb)-.085);}}
  BRB.vmin=Math.min(BRB.vmin,mn);if(mn<-.005){BRB.vcoll++;BRB.vmot=(BRB.plan?BRB.plan.f.id+':'+BRB.plan.et[BRB.et][0]:'attente')+' '+mn.toFixed(3);}
  if(BRB.joue){let lo=9;const sol9=BRB.lieu==='boutique'?GARAGE_Y+(GBQ.socleH||0)+.05:GARAGE_Y+GAR.POD;for(const k of M.K){v.copy(k).applyMatrix4(carGroup.matrixWorld);lo=Math.min(lo,v.y-sol9);}BRB.vsol=Math.min(BRB.vsol,lo);}}
window.dbgBras=function(a,b,c){if(a==='caisse'){const i=b|0;if(!CARS[i])return null;if(!carFicheOk(CARS[i]))return CARS[i].name+' : RETIRÉE (pas de fiche)';SAVE.d.equipped=i;level=i;try{garageSaute(i);}catch(e){return String(e);}return CARS[i].name;} // (banc) la caisse équipée change comme à l'inventaire (bascule du plateau)
  if(a==='pieces'){const L=[];carGroup.updateMatrixWorld(true);carGroup.traverse(function(o){if(!o.isMesh&&!o.isSprite&&!o.isPoints&&!o.isLine)return;let vis=true;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)vis=false;const mt=Array.isArray(o.material)?o.material[0]:o.material,g=o.geometry;if(g&&!g.boundingBox&&g.computeBoundingBox)g.computeBoundingBox();const sz=g&&g.boundingBox?g.boundingBox.getSize(new THREE.Vector3()).toArray().map(x=>+x.toFixed(2)):null;
    const bx=g&&g.attributes&&g.attributes.position?new THREE.Box3().setFromBufferAttribute(g.attributes.position).getSize(new THREE.Vector3()).toArray().map(x=>+x.toFixed(2)):null;L.push([o.type,vis,mt&&mt.type,sz,bx,g&&g.attributes?Object.keys(g.attributes).join(','):'',o.parent===carGroup?'top':(o.parent&&o.parent.type),o.frustumCulled]);});return L;}
  if(a==='remesure'){BRB.mes=null;BRB.hovK='';return true;}if(a==='lent'){BRB.lent=+b||1;return BRB.lent;}if(a==='fige'){BRB.fige=b?[b,c==null?.5:+c]:null;return BRB.fige;} // (banc) dbgBras('fige','tourne',.4) : la démonstration s'arrête là
  if(a==='cam'){const M=BRB.mes;if(!M)return null;carGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);let x0=9,x1=-9,y0=9,y1=-9;const v=new THREE.Vector3();
    for(const k of M.K){v.copy(k).applyMatrix4(carGroup.matrixWorld).project(camera);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
    const lb=garLibre();return {pos:camera.position.toArray().map(x=>+x.toFixed(2)),fov:+camera.fov.toFixed(1),caisse:[x0,x1,y0,y1].map(x=>+x.toFixed(2)),libre:{y0:+(1-2*lb.y0/VP.h).toFixed(2),y1:+(1-2*lb.y1/VP.h).toFixed(2),cx:+(2*lb.cx/VP.w-1).toFixed(2)},dVs:+(GAR.dVs||0).toFixed(2)};}
  if(a==='verif'){BRB.verif=b!==false;BRB.vmin=9;BRB.vsol=9;BRB.vcoll=0;BRB.vmot='';return 'verif '+BRB.verif;}
  if(a==='plan'){const f=window.FIG&&FIG.par[b];const p=f&&brasPlan(f);if(!p)return {refus:BRB.pq};return {kind:p.kind,L:+p.L.toFixed(2),phi:+p.phi.toFixed(2),az:+p.az.toFixed(2),el:+p.el.toFixed(2),rho:+p.rho.toFixed(2),stub:+p.stub.toFixed(2),Rsw:+p.Rsw.toFixed(2),essais:p.essais,kind2:p.alt?'plateau (toupie trop longue)':''};}
  if(a==='fig'){const f=window.FIG&&FIG.par[b];if(f&&brasBqVoulu())BRB.bqVeut=true;return f?brasDemande(f):false;}
  const M=BRB.mes;return {p:+BRB.p.toFixed(2),voulu:brasVoulu(),lieu:BRB.lieu,bqK:+BRB.bqK.toFixed(2),bqVeut:BRB.bqVeut,file:!!BRB.attente||!!BRB.libre,etape:BRB.plan?BRB.plan.et[BRB.et][0]:(BRB.esquive>0||BRB.libre?'esquive':'attente'),fig:BRB.plan&&BRB.plan.f.id,kind:BRB.plan&&BRB.plan.kind,
    L:BRB.TP?+BRB.TP.L.toFixed(2):0,joue:BRB.joue,serre:BRB.serre,yaw:+BRB.yaw.toFixed(2),cK:+BRB.cK.toFixed(2),cY:+BRB.cY.toFixed(2),hovX:BRB.hovX,
    boite:M&&[M.bb.min.toArray().map(x=>+x.toFixed(2)),M.bb.max.toArray().map(x=>+x.toFixed(2))],vmin:+BRB.vmin.toFixed(3),vsol:+BRB.vsol.toFixed(3),vcoll:BRB.vcoll,vmot:BRB.vmot,stat:BRB.stat};}; // (banc)
/* LE RAPPEL DE LA BOUTIQUE (2026-10-12, Léo : « qu'est-ce qu'on pourrait mettre au-dessus de HOME, tout ça ? » → « rappel de la boutique ») :
   au garage replié, une fine bande au-dessus des cinq touches — OFFRES ÉPHÉMÈRES, le compte à rebours, un reflet qui passe ; touchée, elle
   ouvre la BOUTIQUE. Visible replié (#garage.consoleCachee) et en INVENTAIRE (.modeInv, la vue d arrivée : sous l inventaire, au-dessus des touches). */
/* (2026-10-15 soir, Sacha : « enlève offre éphémère du garage ») le bandeau n'est plus posé : GAR_RAPPEL, `?rappel=1` le rend (la boutique garde ses offres) */
const GAR_RAPPEL=/[?&]rappel=1\b/.test(location.search);
try{if(gEl&&GAR_RAPPEL){const gb=document.getElementById('gBottom'),ga=document.getElementById('gAct');if(gb&&ga&&!document.getElementById('gRappel')){
  const r=document.createElement('div');r.id='gRappel';r.className='pbtn';r.setAttribute('role','button');r.setAttribute('aria-label',sansAcc(TR('OFFRES ÉPHÉMÈRES')));
  r.innerHTML=pxi('cadeau')+'<span data-fr="OFFRES ÉPHÉMÈRES">'+sansAcc(TR('OFFRES ÉPHÉMÈRES'))+'</span><b class="grT">'+pxi('horloge')+'<i>'+bqReste()+'</i></b>'+pxi('droite');
  gb.insertBefore(r,ga);
  r.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(r);uiClic('nav');gModeVa('shop');});
  setInterval(function(){if(!garageOn||!r.offsetParent)return;const t=r.querySelector('.grT i:not(.pxi)');const v=bqReste();if(t&&t.textContent!==v)t.textContent=v;},1000);}}}catch(e){}
/* LA PILE D'APLOMB (2026-10-15 après-midi, Sacha : « les boutons sont toujours pas très bien placés ») : chaque plaque penche de --sk
   autour de SON centre — trois rangées de hauteurs différentes (bandeau 34, portes 44, barre 56) donnaient trois bords gauches décalés,
   une pile en escalier. On penche toutes les plaques autour du MÊME axe (le milieu de la pile) : les bords tombent sur une seule ligne
   oblique, comme une seule plaque découpée. Le bandeau OFFRES ÉPHÉMÈRES prend aussi la largeur exacte de la grille. 4 Hz, garage ouvert. */
function garAplomb(){try{if(!garageOn)return;const ga=document.getElementById('gAct'),gr=document.getElementById('gRappel');if(!ga||!ga.offsetParent)return;
  const hy=function(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetTop;return t;},hx=function(e){let t=0;for(let n=e;n;n=n.offsetParent)t+=n.offsetLeft;return t;};
  const L=[];for(const e of ga.querySelectorAll(':scope>*,:scope>#gRang1>*'))if(e.offsetParent&&e.offsetHeight>0)L.push(e);
  if(gr){if(gr.offsetParent&&gr.offsetHeight>0){const d=hx(ga)-hx(gr),dw=(hx(gr)+gr.offsetWidth)-(hx(ga)+ga.offsetWidth);
    if(Math.abs(d)<24&&Math.abs(dw)<24){const ml=(parseFloat(gr.style.marginLeft)||0)+d,mr=(parseFloat(gr.style.marginRight)||0)+dw;
      if(Math.abs(d)>.5||Math.abs(dw)>.5){gr.style.marginLeft=ml+'px';gr.style.marginRight=mr+'px';}}L.push(gr);}}
  if(!L.length)return;let t0=1e9,t1=-1e9;const T=L.map(function(e){const t=hy(e);t0=Math.min(t0,t);t1=Math.max(t1,t+e.offsetHeight);return t;});
  const m=(t0+t1)/2;L.forEach(function(e,k){const o='50% '+(m-T[k]).toFixed(1)+'px';if(e.style.transformOrigin!==o)e.style.transformOrigin=o;});
  /* la pile penche d'un bloc : le haut part à droite, le bas à gauche, de la moitié de sa hauteur × la pente — on la rentre d'autant, moins 10 px de jeu (debout, la barre du bas touchait le bord ; tout le retrait rognait ACCUEIL) */
  const gb=ga.parentNode,ap=Math.max(0,Math.round(Math.tan(11*Math.PI/180)*(t1-t0)/2)-10);if(gb&&gb._apl!==ap){const cs=getComputedStyle(gb),a0=gb._apl||0;
    gb.style.paddingLeft=(parseFloat(cs.paddingLeft)-a0+ap)+'px';gb.style.paddingRight=(parseFloat(cs.paddingRight)-a0+ap)+'px';gb._apl=ap;}}catch(e){}}
setInterval(garAplomb,250);
/* LE RETOUR DE LA BOUTIQUE (2026-10-12, Léo : « le bouton BOUTIQUE devient RETOUR quand on appuie dessus, et enlève tous les autres —
   accessibles grâce à la flèche RETOUR, bien placée ; le but : laisser plus de place à la boutique ») : en BOUTIQUE (et SEE ALL ITEMS), la
   touche devient ◀ RETOUR (gModeBoutons), HOME · INVENTAIRE · l'œil · JOUER s'effacent ; ACHETER reste à côté quand il y a un achat.
   RETOUR : SEE ALL ITEMS → la vitrine du jour → le garage REPLIÉ (ta caisse revient, l'essai s'efface). */
function gGarageReplie(){GMODE.m='tout';GMODE.paye=false;GMODE.fam=null;
  try{if(SHOP.tab!=='voiture')shopTab('voiture');else SHOP.prev=null;const eq=equippedCar();if(garageI!==eq)garageSaute(eq);}catch(e){}
  const bar0=$('gRar'),st0=$('gStrip');if(bar0)bar0._k=null;if(st0)st0._r=null;gConsoleCache(true);gModeBoutons();}
/* CACHER / VOIR (2026-10-09, Léo) : replier la partie boutique / inventaire de la console pour voir le garage (voir le CSS « HOME ET CACHER ») */
/* L'ŒIL (2026-10-10, Léo : « à la place du HOME, un bouton œil, un peu comme HIDE mais qui enlève tout sauf l'œil : on voit juste la voiture »).
   `#garage.vueSeule` (+ `html.vueSeule` pour la jauge, qui vit hors du garage couchée) : tout le garage passe en visibility:hidden SAUF l'œil
   (une visibilité se rallume sur un enfant) ; le doigt sur le décor tourne toujours la vue. Le cadrage NE BOUGE PAS (essayé : rendre tout l'écran
   à la caisse la reculait — plus petite) : la même image, sans rien par-dessus. */
function gVueSeule(on){if(!gEl)return;on=!!on;if(gEl.classList.contains('vueSeule')===on)return;gEl.classList.toggle('vueSeule',on);document.documentElement.classList.toggle('vueSeule',on);garLibre._r=null;
  if(on){const p0=garagePitch,t0=performance.now();(function k9(){if(!garageOn||garageDrag||!gEl.classList.contains('vueSeule'))return;const e=Math.min(1,(performance.now()-t0)/600),s9=e*e*(3-2*e);
    garagePitch=p0+(.2-p0)*s9;if(e<1)requestAnimationFrame(k9);})();} /* (2026-10-11, passe UX) l'œil RECADRE : l'inclinaison d'ouverture du garage, en 0,6 s */
  const b=document.getElementById('gOeil');if(b)b.setAttribute('aria-pressed',on?'true':'false');}
/* (2026-10-11, passe UX) LE PANNEAU QUI FLOTTE : HOME et l'ŒIL quittent la console (#gAct, coupée par le clip-path du panneau) pour #gFlot,
   posé sur la scène (voir <style id="uxPasse">). Mêmes éléments, mêmes écouteurs. --gPanB = la hauteur du panneau depuis le bas de l'écran :
   debout, la paire se pose juste au-dessus. */
/* (2026-10-11, Léo : « remets comme avant ») HOME et l'ŒIL restent dans la console (#gAct) : plus de #gFlot */
/* (2026-10-11, Léo : « reviens comme avant : l'argent et l'aura à leur place, HOME et l'œil au-dessus d'INVENTAIRE · BOUTIQUE ») le coin #gCoin est retiré ;
   (même soir) HOME et l'ŒIL dans leur rangée à eux (#gRang1), au-dessus d'INVENTAIRE · BOUTIQUE, sur la largeur des deux : voir « LA RANGÉE HOME + ŒIL » */
try{if(gEl){const ac=document.getElementById('gAct'),r1=document.createElement('div');r1.id='gRang1';
  for(const id of ['gHomeBas','gOeil']){const b9=document.getElementById(id);if(b9)r1.appendChild(b9);}
  if(ac)ac.insertBefore(r1,ac.firstChild);}}catch(e){}
try{document.getElementById('gOeil').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic(gEl.classList.contains('vueSeule')?'on':'off');gVueSeule(!gEl.classList.contains('vueSeule'));});}catch(e){}
function gConsoleCache(on){if(!gEl)return;gEl.classList.toggle('consoleCachee',!!on);garLibre._r=null;
  const b=document.getElementById('gCache');if(b){b.setAttribute('aria-pressed',on?'true':'false');const sp=b.querySelector('span');if(sp){sp.dataset.fr=on?'VOIR':'CACHER';sp.textContent=TR(sp.dataset.fr);}}}
try{document.getElementById('gCache').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);uiClic('onglet');gConsoleCache(!gEl.classList.contains('consoleCachee'));});
  document.getElementById('gHomeBas').addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;uiPop(e.currentTarget);const c=$('gClose');if(c)c.click();});
  if(!I18N['CACHER'])I18N['CACHER']='HIDE';}catch(e){}
/* le plateau suit le mode : en BOUTIQUE le 1er objet à acheter (si celui qu'on voit ne l'est pas), en INVENTAIRE ta caisse / le 1er objet
   à toi (si celui qu'on voit ne l'est pas) — au changement de mode ET d'onglet (shopTab) */
function gModeCale(){const m=gModeM();if(m==='tout'||m==='shop'||m==='tous')return; // (2026-10-10, Léo : « quand tu appuies sur SHOP, ça ne change pas automatiquement ta voiture : ça attend que tu appuies sur une voiture ») la BOUTIQUE ne saute plus sur la 1re caisse (ou le 1er habillage) à vendre
  if(SHOP.tab==='voiture'){if(m==='inv'){if(!gPossede(garageI))garageSaute(SAVE.d.equipped|0);return;}const L=gModeListeVoitures(m);if(L.length&&L.indexOf(garageI)<0)garageSaute(L[0]);return;}
  const cat=SHOP.tab,Lc=COSM[cat],cur=Lc[SHOP.i[cat]],ok=function(d){const a=shopOwned(cat,d.id);return m==='inv'?a:(!a&&!!(d.p||d.eur));};
  if(cur&&!ok(cur)){const j=Lc.findIndex(ok);if(j>=0)shopShow(cat,j);}}
try{Object.keys({'RIEN ICI':1,'TOUT EST A TOI':1}).forEach(function(k){if(!I18N[k])I18N[k]=k==='RIEN ICI'?'NOTHING HERE':'ALL YOURS';});}catch(e){}
// LA FILE DU STUDIO PHOTO : une vignette par image, jamais pendant la bascule du plateau ni hors du garage
/* LE STUDIO SANS À-COUPS (2026-10-16, Léo : « le garage dans la boutique, ça rame de ouf ») — MESURÉ au banc (iPhone simulé, processeur ×4) :
   à l'ouverture de la boutique, la grille demandait ses 48 photos d'un coup et la file en prenait UNE PAR IMAGE, ~150 ms chacune (la caisse
   bâtie, rendue, relue, développée, puis la caisse regardée rebâtie) : 5 à 9 images/s pendant 8 s. Désormais :
   · une carte de la grille donne son ÉLÉMENT (`el`) : sa photo attend d'être EN VUE — on ne photographie que ce qu'on regarde, défiler en
     amène d'autres ; une carte sortie de la page (rayon changé) est oubliée ;
   · la file RESPIRE : après une photo de d ms, rien pendant 2 × d (150 à 400 ms) ; rien pendant la bascule garage ⇄ boutique (voile
     compris), sous un doigt (garage, boutique), ni pendant qu'on fait défiler la grille (photoCalme) ;
   · à l'entrée de la boutique, SOUS LE VOILE, les vignettes en vue se prennent à la chaîne (photoRafale) : la caisse regardée n'est rebâtie
     qu'une fois, à la fin, et la grille se découvre déjà remplie ;
   · les photos sont GARDÉES d'une session à l'autre pour la version publiée (PHDB) : la 2e ouverture n'en prend plus aucune. */
const PHQ={q:[],on:false,pret:0,defile:0};
function photoFile(i,cb,el){if(PHOTO.cache[i]){cb(PHOTO.cache[i]);return;}PHQ.q.push([i,cb,undefined,el]);if(!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}}
function photoCalme(){const t=performance.now();
  if(document.hidden||ecranWipe._on||garageDrag||t-PHQ.defile<260)return false;
  if(typeof GBQ!=='undefined'&&(GBQ.drag||GBQ.veut!==GBQ.on||!GBQ.bascule||t<(bqVoile._fin||0)))return false;
  return true;}
/* la photo suivante : une vignette EN VUE d'abord ; sinon une demande sans élément (bande du garage, inventaire, missions) — `stricte` (la
   rafale) : seulement les caisses en vue */
function photoChoix(stricte){let lib=-1;
  for(let j=0;j<PHQ.q.length;j++){const it=PHQ.q[j],el=it[3];
    if(!el){if(lib<0&&!stricte)lib=j;continue;}
    if(!el.isConnected){PHQ.q.splice(j--,1);continue;}
    if(stricte&&it[2])continue;
    const b=el.getBoundingClientRect();if(!b.width)continue;const sc=el.closest('.bqRail');let y0=0,y1=VP.h,x0=0,x1=VP.w;
    if(sc){const r=sc.getBoundingClientRect();y0=Math.max(y0,r.top);y1=Math.min(y1,r.bottom);x0=Math.max(x0,r.left);x1=Math.min(x1,r.right);}
    if(b.bottom>y0-8&&b.top<y1+8&&b.right>x0&&b.left<x1)return j;}
  return lib;}
function photoPrends(it){const u=PHOTO.cache[it[0]];
  if(u)it[1](u);else try{const a9=it[2];if(a9&&a9.fig)figFilm(a9,function(u9){if(u9)it[1](u9);});else carPhoto(a9?equippedCar():it[0],function(u9){if(u9)it[1](u9);},a9);}catch(e){} /* (2026-10-15 soir) a9.fig : la photo d'une FIGURE (figFile) — (2026-10-18) son FILM (figFilm) */ // (2026-10-15) it[2] : la photo d'une AILE (aileFile) // (OPTIMISATION) encodée hors du fil (toBlob), posée à son arrivée
}
function photoTour(){
  if(!PHQ.q.length||!garageOn||gEl.classList.contains('quiet')){PHQ.on=false;return;} // (2026-09-26) garage fermé : la file attend le prochain passage (openGarage la relance) — (2026-09-28, chasse aux gels) et le garage du JOUER (`quiet`) n'affiche aucune vignette : MESURÉ, il y prenait 2 à 3 photos pendant le fondu (chacune reconstruit deux caisses, ~200 ms et 4 programmes) pour une bande que personne ne voit
  requestAnimationFrame(photoTour);
  if(GAR.sw||GAR.go||phdbAttend())return;
  const t=performance.now();if(t<PHQ.pret||!photoCalme())return;
  const j=photoChoix(false);if(j<0){PHQ.pret=t+200;return;} // que des vignettes hors de vue : on regarde de nouveau dans 200 ms (pas de mesure de la page à chaque image)
  const it=PHQ.q.splice(j,1)[0];photoPrends(it);const d=performance.now()-t;PHQ.pret=performance.now()+Math.min(400,Math.max(150,d*2));
}
/* LA RAFALE SOUS LE VOILE : `ms` de photos d'affilée (les caisses en vue), la caisse regardée rebâtie une seule fois à la fin */
const PHOTO_RAFALE_MS=300;
function photoRafale(ms){if(!PHQ.q.length||(started&&!gameOver)||phdbAttend())return 0;
  const t0=performance.now(),av=carGroup.userData.lvl;let n=0;PHOTO.chaine=true;PHOTO.avant=av;
  try{while(performance.now()-t0<ms){const j=photoChoix(true);if(j<0)break;const it=PHQ.q.splice(j,1)[0];
      if(PHOTO.cache[it[0]]){it[1](PHOTO.cache[it[0]]);continue;}
      carPhoto(it[0],function(u9){if(u9)it[1](u9);});n++;}}
  catch(e){console.warn('photoRafale',e);}
  finally{PHOTO.chaine=false;if(n)try{buildCar(CARS[(av!=null&&av>=0&&av<CARS.length)?av:equippedCar()]);}catch(e){console.warn('photoRafale',e);}}
  PHQ.pret=performance.now()+120;PHQ.rafale={n:n,ms:Math.round(performance.now()-t0)};return n;}
window.dbgPhotoCar=function(i){delete PHOTO.cache[i];return carPhoto(i|0);}; // (banc) la photo de la caisse i, refaite, en data: (pour comparer deux pellicules)
window.dbgPhotoFile=function(){return {file:PHQ.q.length,on:PHQ.on,rafale:PHQ.rafale||null,gardees:PHDB.n,db:PHDB.db?'ouverte':String(PHDB.db),calme:photoCalme()};}; // (banc)
function gBankPaint(){const gb=$('gBank');
  if(gb)gb.innerHTML=TR('COMPTE')+' : '+fmtSolde(bank())+'<span class="aura">'+pxi('etoile')+' '+fmtAura(SAVE.d.aura||0)+'</span>';
  gCompteur();}
/* LE COMPTEUR DU GARAGE, FAÇON GTA (2026-09-25, user : « trop de texte — mets le prix en haut, joliment, avec un vrai
   compteur comme GTA »). Le solde en chiffres COMPLETS (« $35,850 », pas « 35,9 k »), vert, contour noir, en haut à
   gauche. Quand il change, il DÉFILE jusqu'à la nouvelle valeur ; une dépense fait tomber « −$6,000 » en rouge dessous. */
function gAuraMaj(){ // (2026-10-09, Léo) LA JAUGE AURA sous le compte : le total, le rang, et la jauge vers le rang suivant
  const el=$('gAuraC');if(!el)return;const au=SAVE.d.aura||0,r=auraRank(au),lo=AURA_RANKS[r].v,nx=AURA_RANKS[r+1];
  const k=nx?Math.max(0,Math.min(1,(au-lo)/(nx.v-lo))):1,cle=au+'|'+r+'|'+LANG;if(cle===gAuraMaj._k)return;gAuraMaj._k=cle;
  el.querySelector('b').textContent=fmtAura(au);el.querySelector('small').textContent='';
  el.querySelector('u em').style.width=Math.round(k*100)+'%';el.setAttribute('aria-label','Aura '+fmtAura(au));}
function gCompteur(){
  try{gAuraMaj();}catch(e){}
  const el=$('gCompteur');if(!el)return;const b=el.querySelector('b'),v=Math.floor(bank()),v0=gCompteur._v;
  // (2026-09-26) chiffres COMPLETS façon GTA, mais au format de la LANGUE : en français « $42,000 » se lisait 42 dollars.
  // Les espaces insécables de fr-FR deviennent des espaces simples (la police pixel n'a pas U+202F).
  const fmt=fmtSolde; /* (2026-10-14) l'écriture du SOLDE PRÉCIS, partagée par toutes les plaques */ // (2026-09-28) \u00ab $ 48 250 \u00bb : la m\u00eame \u00e9criture que l'\u00e9cran de mort et les annonces
  if(v0==null||REDUCED_MOTION){soldeTxt(b,v);gCompteur._v=v;return;}
  if(v===v0)return;
  if(v<v0){const d=document.createElement('i');d.className='gcMoins';d.textContent='-'+fmt(v0-v);el.appendChild(d);setTimeout(function(){d.remove();},1400);}
  el.classList.remove('bouge');void el.offsetWidth;el.classList.add('bouge');
  if(v<v0&&garageOn&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching'))try{sfx('ui.compteur');}catch(e){} // (console de son) la DÉPENSE qui défile (0,9 s) : la liasse qui se compte, la note qui descend — vitrine visible seulement
  const t0=performance.now(),D=900;gCompteur._v=v;
  (function f(){const k=Math.min(1,(performance.now()-t0)/D),e=1-Math.pow(1-k,3);soldeTxt(b,v0+(v-v0)*e);if(k<1&&gCompteur._v===v)requestAnimationFrame(f);})();
}
// les PASTILLES sous le nom : où on est dans la liste, ce qui est à toi (plein), ce que tu portes (or)
function gDots(L){const el=$('gDots');if(!el)return;
  el.innerHTML=L.map(function(d){return '<i class="'+(d.on?'on ':'')+(d.a?'a ':'')+(d.eq?'eq':'')+'"></i>';}).join('');}
/* ---- LA BOUTIQUE DANS L'ATELIER (2026-09-25) ------------------------------------------------------------
   Même fiche, mêmes flèches, même caisse au milieu : l'onglet change ce qu'on feuillette. Dans une catégorie
   d'habillage, la caisse montrée est TA caisse équipée (on habille ce qu'on conduit), et l'article feuilleté
   est ESSAYÉ dessus (`SHOP.prev`) — qu'il soit à toi ou pas. Fermer l'atelier retire l'essai. */
const SHOP_LBL={voiture:'CAISSE',peinture:'PEINTURE',aile:'AILES',trainee:'TRAÎNÉE',figure:'FIGURE'};
/* LE CIEL DU MENU DANS LE HOME DU GARAGE (2026-10-11, Léo : « le bouton HOME doit être le MÊME ciel que le ciel du menu, en plus petit ;
   quand c'est la nuit, il faut que ce soit la nuit aussi dans le HOME du garage ») : l'atelier ne dessine pas le ciel du menu (il a sa
   propre lumière) — alors, tant que l'ACCUEIL est à l'écran, on recopie toutes les 3 s un morceau du VRAI ciel rendu (le haut de l'image,
   au centre : au-dessus de la caisse) dans une petite toile posée au fond de HOME. Au garage, HOME montre donc le ciel tel qu'on l'a
   quitté — jour, couchant ou nuit — et il vit d'un lent travelling (CSS). Avant la 1re prise, le ciel peint en CSS reste en secours.
   La copie se fait DANS la même image que le rendu (après, le tampon WebGL peut être vidé). */
function homeCielPrise(now){
  const ciel=(garageOn&&!!gEl&&gEl.classList.contains('menu'))||(!garageOn&&((!started||gameOver)||MENUV.retour)); // l'ACCUEIL : le garage en mode « menu » (le ciel), ou l'ancien menu hors garage
  if(!ciel||(typeof stallOn!=='undefined'&&stallOn))return;
  if(now-(homeCielPrise._t||0)<3000)return; // toutes les 3 s : le ciel change lentement, et relire l'image WebGL coûte un peu sur iPhone
  homeCielPrise._t=now; // (2026-10-12, passe qualité) cette pose était collée DERRIÈRE le « // » : la relecture GPU→CPU tournait à CHAQUE image au menu
  let cv=homeCielPrise._cv;
  if(!cv){const b=document.getElementById('gHomeBas');if(!b)return;cv=homeCielPrise._cv=document.createElement('canvas');cv.className='gHomeCielCv';cv.width=160;cv.height=210;cv.setAttribute('aria-hidden','true');b.insertBefore(cv,b.firstChild);}
  const src=renderer.domElement,W=src.width,H=src.height;if(!(W>8&&H>8))return;
  const a=cv.width/cv.height;let sh=H*.34,sw=sh*a;if(sw>W){sw=W;sh=W/a;}
  const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(src,(W-sw)/2,0,sw,sh,0,0,cv.width,cv.height);cv.classList.add('on');
  /* LES BOUTONS SUIVENT LE CIEL (2026-10-11, Léo : « change la colorimétrie des boutons selon que c'est la nuit : tous un peu plus sombres et
     sobres — et vice versa ») : la luminosité moyenne de la vignette (un pixel sur 16) dit le moment — NUIT sous ,22 (html.cielNuit : boutons
     plus sombres et sobres), JOUR au-dessus de ,38 (html.cielJour : un cran plus clairs et vifs), entre les deux (couchant) : tels quels. */
  try{const d=cx.getImageData(0,0,cv.width,cv.height).data;let l=0,n=0;for(let i=0;i<d.length;i+=64){l+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];n++;}l=l/n/255;
    const h=document.documentElement;h.classList.toggle('cielNuit',l<.22);h.classList.toggle('cielJour',l>.38);homeCielPrise._l=+l.toFixed(3);}catch(e){}}
/* LA CAISSE SE TOURNE VERS CE QU'ON REGARDE (2026-10-11, Léo : « quand on appuie sur TRAÎNÉES et PEINTURE, au lieu de faire TP de position,
   la voiture se tourne pour montrer les différentes features — TRAÎNÉES : la vue de l'arrière ») : l'onglet ne POSE plus l'angle d'un coup
   (garageAng=3.5), il le fait TOURNER en ~0,9 s par le plus court chemin (garTourneVers, joué dans garageRender, prioritaire sur la rotation
   lente ; le doigt l'interrompt). TRAÎNÉES 3,5 (trois-quarts arrière) · PEINTURE ,42 (trois-quarts avant) · AILES 1,2 (de profil). */
const GAR_TAB_ANG={trainee:3.5,peinture:.42,aile:1.2,figure:1.25}; // (FIGURES : de profil, on voit les saltos)
function garTourneVers(a,D){if(!garageOn||GAR.go)return;a-=GAR.vA||0; /* (2026-10-24) l'angle se compte depuis la VUE : le regard tourné (jauge, doigt) n'envoie plus la caisse du mauvais côté */const a0=garageAng,T=2*Math.PI,d=((a-a0)%T+T*1.5)%T-T/2;if(Math.abs(d)<.02)return;GAR.angTw={a0:a0,d:d,t:0,D:D||.9};}
function shopTab(tab){
  if(SHOP_CATS.indexOf(tab)<0)tab='voiture';
  SHOP.tab=tab;
  document.querySelectorAll('#gTabs .gTab').forEach(function(b){const on=b.getAttribute('data-tab')===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  const gt=$('gTitle');if(gt)gt.textContent=TR('GARAGE'); // la personnalisation fait partie du GARAGE (la BOUTIQUE, c'est le vrai argent)
  if(gEl){gEl.classList.toggle('shopMode',tab!=='voiture');gEl.classList.toggle('figTab',tab==='figure');}if(tab!=='figure'&&GFS)GFS.arme=-1; /* (24/10) GFS est un var du script, pas de window : `window.GFS` valait toujours undefined */ // (2026-10-15) figTab : le sélecteur des trois figures (#gFigSel) au-dessus de la grille
  if(GAR_TAB_ANG[tab]!=null)garTourneVers(GAR_TAB_ANG[tab]); // TRAÎNÉES : la caméra passe derrière la caisse (trois-quarts arrière) — on regarde ce qui SORT des tuyères ; (2026-10-11) en TOURNANT, et chaque onglet a son angle
  if(tab==='voiture'){SHOP.prev=null;{const bar=$('gRar');if(bar)bar._k=null;}garageShow(garageI);try{gModeCale();}catch(e){}return;}
  SHOP.filtre='tout'; // chaque catégorie s'ouvre sur TOUT
  const eqI=COSM[tab].indexOf(shopEqD(tab));shopShow(tab,eqI<0?0:eqI);try{gModeCale();}catch(e){} // (2026-10-09) en INVENTAIRE / BOUTIQUE, l'onglet s'ouvre sur un objet du mode
}
function shopShow(cat,i){
  const L=COSM[cat];i=((i%L.length)+L.length)%L.length;
  SHOP.i[cat]=i;SHOP.prev={cat:cat,i:i};
  if(GAR_TAB_ANG[cat]!=null)garTourneVers(GAR_TAB_ANG[cat]); // (2026-10-24, Léo : « quand on sélectionne, ça ne tourne pas vers l'autre ») CHAQUE objet touché ramène la caisse face à ce qu'il habille — l'onglet seul le faisait, puis le plateau la laissait dériver
  if(cat==='figure'&&garageOn)try{garFigEssai(L[i].id);}catch(e){} // (2026-10-14) la caisse FAIT la figure qu'on regarde
  const eqC=equippedCar();garageI=eqC;buildCar(CARS[eqC]);
  const d=L[i],a=shopOwned(cat,d.id),eq=shopEqD(cat)===d,Lg=LANG==='en'?1:0;
  gNomEntre(TR(d.n));
  gLvlEl.textContent=(i+1)+' / '+L.length;gSpdEl.textContent='';
  {const pl=$('gRarPill');if(pl){pl.textContent=sansAcc(TR(SHOP_LBL[cat]));pl.style.removeProperty('--rc');}} // (charte v4) la pastille dit la CATÉGORIE — la fiche garde ses trois étages
  if(!a&&d.mis2)gDescEl.innerHTML=m2DebloqueHtml(m2Def(d.mis2)); // (2026-10-16) LES MISSIONS v2 : SE DÉBLOQUE + VOIR LA MISSION
  else gDescEl.textContent=(d.fig&&window.FIG&&FIG.par[d.id])?figDesc(FIG.par[d.id],LANG):TR(d.d); // (2026-10-14) une FIGURE se décrit dans la langue du joueur // (2026-10-15, UNE SEULE POLICE) la fiche est en pixel : TR (majPix) retire l'accent des seuls mots en capitales
  $('gCard').classList.toggle('defis',!a&&!!(d.mis||d.mis2));$('gCard').classList.remove('verrou');
  const sw=$('gSw');
  if(sw){ // LE NUANCIER : la teinte (ou le dégradé) de la peinture, le ruban de la traînée
    let bg='';
    const hx=function(c){return '#'+c.toString(16).padStart(6,'0');},rg=function(v){return 'rgb('+v.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')';};
    if(cat==='peinture'){const c9=d.id==='usine'?CARS[eqC].color:d.c;bg=d.mot?motFond(d):d.grad?'linear-gradient(90deg,'+d.grad.map(hx).join(',')+')':hx(c9);}
    else if(cat==='trainee')bg=d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,transparent,'+(d.rgb?rg(d.rgb):'#ff6a14')+' 30%,'+(d.rgb?rg(d.rgb):'#ffb040')+')';
    sw.style.display=bg?'':'none';sw.className=cat;sw.innerHTML=bg?'<i style="background:'+bg+'"></i>':'';
  }
  const bt=$('gEquip'),bb=$('gBuy'),row=$('gBuyRow');
  if(row)row.style.display=(!a&&(d.p||d.eur))?'':'none';
  if(bb){bb.dataset.bout='';if(!a&&d.eur){bb.innerHTML='<span>'+TR('ACHETER')+'</span><b class="gPrix">'+eurTxt(d.eur)+'</b>';bb.dataset.px=eurTxt(d.eur);bb.dataset.eur='1';bb.classList.remove('pauvre');} /* (2026-10-16) une peinture en EUROS */ else if(!a&&d.p){const peut=bank()>=d.p;bb.innerHTML=gPrixHtml(peut,d.p);bb.dataset.px=fmtC(d.p);bb.dataset.eur='';bb.classList.toggle('pauvre',!peut);}}
  if(bt){
    bt.style.display=(!a&&(d.p||d.eur))?'none':'';
    bt.disabled=false;
    if(!a)gEtat(bt,'verrou','verrou','À GAGNER');
    else if(cat==='figure')gEtat(bt,'eq','coche','ACQUISE'); // (2026-10-14) une figure à toi joue d'office
    else if(eq)gEtat(bt,'eq','coche','ÉQUIPÉE');
    else gEtat(bt,'',null,'ÉQUIPER');
  }
  gActSync();
  $('gCard').style.setProperty('--rc',cat==='peinture'?'#ff9ad8':cat==='aile'?'#9fe8ff':'#ffb040');
  gDots(L.map(function(x,j){return {on:j===i,a:shopOwned(cat,x.id),eq:shopEqD(cat)===x};}));
  gStripHabits(cat,i);
  gBankPaint();
}
/* ---- LA CHARTE v4 AU GARAGE (2026-09-26) ------------------------------------------------------------------------------
   `gEtat` : la touche ÉQUIPER dit son état par sa MATIÈRE (voir CSS `#gEquip[data-etat]`) — et plus par une opacité posée
   à la main. `gPrixHtml` : le verbe à gauche, le PRIX en gros à droite, dans le lingot (ou en rouge « il manque »). */
function gEtat(bt,etat,ic,txt){bt.dataset.etat=etat;bt.setAttribute('aria-disabled',etat?'true':'false');
  bt.innerHTML=(ic?pxi(ic):'')+'<span>'+TR(txt)+'</span>';}
function gNomEntre(t){ // le NOM entre en glissant (seulement s'il CHANGE : rafraîchir la fiche ne le fait pas rejouer)
  gNameEl.style.setProperty('--nL',Math.max(8,String(t).length)); /* (garage v6) la taille du nom suit sa longueur — posée même si le nom ne change pas */
  if(gNameEl.textContent===t)return;gNameEl.textContent=t;if(REDUCED_MOTION)return;
  gNameEl.classList.remove('entre');void gNameEl.offsetWidth;gNameEl.classList.add('entre');}
function eurTxt(s){if(!s||LANG==='fr')return s;const v=parseFloat(String(s).replace(',','.'));return isFinite(v)?'€'+v.toFixed(2):s;}
function gTampon(t){const c=$('gCard');if(!c)return;if(REDUCED_MOTION){toast(pxi('coche')+' '+t);return;} /* « réduire les animations » : l'achat se DIT quand même */ c.dataset.tampon=t;c.classList.remove('tampon');void c.offsetWidth;c.classList.add('tampon');
  {const e=$('gEclat');if(e){e.style.setProperty('--rc',getComputedStyle(c).getPropertyValue('--rc')||'#ffd75e');e.classList.remove('on');void e.offsetWidth;e.classList.add('on');}} // et un éclair de SA couleur derrière la caisse
  clearTimeout(gTampon._t);gTampon._t=setTimeout(function(){c.classList.remove('tampon');},2000);} // l'achat se FÊTE : le tampon d'or « À TOI ! »
function gPrixHtml(peut,prix){return '<span>'+TR(peut?'ACHETER':'IL MANQUE')+'</span><b class="gPrix">'+fmtC(peut?prix:prix-bank())+'</b>';}
/* L'INVENTAIRE ILLUSTRÉ (2026-10-15, Sacha : « les peintures, ça va, mais les traînées, les ailes et les figures, il n'y a pas les images —
   il n'y a qu'à mettre une illustration ») : chaque objet de la console a SON dessin, plus un pictogramme commun à toute la famille.
   · les AILES et les TRAÎNÉES d'origine (les POP ont déjà le leur : `ico`/`col`) : un pictogramme et une couleur chacune (ILLU_COS) ; la nitro
     et l'arc-en-ciel sont peints d'un dégradé À TRAVERS le masque du pictogramme (illuPx) ;
   · une AILE passe en PHOTO dès que `aileFile` existe (la caisse équipée qui la porte, la photo de la boutique) — d'ici là, son pictogramme ;
   · une FIGURE = la caisse vue sous l'axe de son mouvement — de PROFIL pour un salto, une chandelle, une toupie ; de DOS pour un tonneau — au
     milieu de son ANNEAU (rond = salto ou tonneau, à plat = toupie, penché = deux axes, deux pointes = 720), dans la couleur de sa rareté
     (ILLU_FIG, illuFig). Le sens se lit : salto avant dans le sens des aiguilles, arrière à l'envers (l'anneau en miroir). La vignette choisie
     et les cases du sélecteur JOUENT la figure : la caisse du calque tourne (`--fgA` = le geste, `--sg` = le sens).
   ⚠ `ILLU_FIG` connaît les 13 figures de figures.js : une figure ajoutée sans sa ligne prend l'anneau du salto (rien ne casse, elle ressemble au salto). */
const ILLU_COS={aile:{panneaux:['ai_panneaux','#e0b56a'],helices:['ai_helices','#9fe8ff'],plumes:['ai_plumes','#ffffff'],chauve:['ai_chauve','#a98bd8']},
  trainee:{nitro:['tr_nitro','linear-gradient(90deg,#d8400c,#ff8a24 50%,#fff1c2)'],rose:['tr_rose'],or:['tr_or'],wow:['tr_wow','#e8b04a'],
    arcenciel:['tr_arc','radial-gradient(circle at 50% 80%,#9b5bff 0 24%,#3bb4ff 24% 38%,#3bff6a 38% 52%,#ffe23a 52% 66%,#ff9b1a 66% 80%,#ff3b3b 80%)']}};
const ILLU_FIG={tailwhip:['fg_demi',0,'voiture','fgWhip'],tonneau:['fg_rond',0,'cv_dos','fgRoll'],toupie:['fg_plat',0,'voiture','fgSpin'],shimmy:['fg_danse',0,'voiture','fgShim'],
  chandelle:['fg_arc',1,'voiture','fgChand'],saltoa:['fg_rond',1,'voiture','fgSalto'],saltov:['fg_rond',0,'voiture','fgSalto'],double:['fg_rond2',0,'cv_dos','fgRoll2'],
  tirebouchon:['fg_ovale',1,'cv_dos','fgTire'],helico:['fg_plat2',0,'voiture','fgSpin2'],penche:['fg_ovale',0,'voiture','fgPenche'],rodeo:['fg_ovale',1,'voiture','fgRodeo'],
  cosmique:['fg_rond2',1,'voiture','fgSalto2']}; // [anneau, miroir (1 = à l'envers), vue de la caisse, geste joué]
try{Object.assign(I18N,{'FIGURES ÉQUIPÉES':'EQUIPPED TRICKS','VIDE':'EMPTY'});}catch(e){}
function illuTr(d){if(d.ico)return {ic:d.ico,c:d.col||'#ffb040'};const I=ILLU_COS.trainee[d.id];if(!I)return null;
  return {ic:I[0],c:I[1]||(d.rgb?'rgb('+d.rgb.map(function(x){return Math.round(Math.min(1,x/1.45)*255);}).join(',')+')':'#ff8a24')};}
function illuAile(d){if(d.ico)return {ic:d.ico,c:d.col||'#dff6ff'};const I=ILLU_COS.aile[d.id];return I?{ic:I[0],c:I[1]}:{ic:'aile',c:'#dff6ff'};}
function illuPx(o,cl,eteint){return '<i class="pxi pxi-'+o.ic+(cl?' '+cl:'')+'" style="'+(eteint?'color:#6c6390':(/gradient/.test(o.c)?'background:'+o.c:'color:'+o.c))+'" aria-hidden="true"></i>';}
/* la figure `id` en dessin : son anneau + la caisse (calque) ; `av` = jouée vers l'AVANT — une figure à deux sens (rodéo, tire-bouchon,
   cosmique) tourne alors à l'endroit, comme la caisse la fait dans cet emplacement (FIG.oriente) */
function illuFig(id,c,av,cl){const I=ILLU_FIG[id]||['fg_rond',0,'voiture','fgSalto'],f=window.FIG&&FIG.par[id];let m=I[1];
  if(av&&f&&FIG.dirs&&FIG.dirs(f).length>1)m=1-m;
  return '<i class="fgIl'+(cl?' '+cl:'')+'" style="--fc:'+c+';--sg:'+(m?-1:1)+';--fgA:'+I[3]+(I[3]==='fgWhip'?';--fgO:88% 62%':I[3]==='fgChand'?';--fgO:22% 88%':'')+'" aria-hidden="true"><i class="pxi pxi-'+I[0]+' fgAn'+(m?' mir':'')+'"></i><i class="pxi pxi-'+I[2]+' fgCv"></i></i>';}
/* LES TROIS FIGURES ÉQUIPÉES, AU-DESSUS DE LA GRILLE (2026-10-15, Sacha : « dans l'onglet FIGURES, un bouton un peu stylé : le truc du NITRO
   et trois cases en forme d'hexagone, avec les figures sélectionnées et les flèches du joystick — haut, bas, côté — pour qu'on puisse
   sélectionner les trois figures qu'on veut ; au-dessus des figures ») — #gFigSel, montré par le CSS en INVENTAIRE (atelierInv), onglet
   FIGURES seulement (`figTab`). À gauche l'ÉCLAIR du bouton NITRO (sa grille NX3_G, sa palette) et « ×2 » : le double-tap ; puis les trois
   emplacements dans l'ordre du jeu (FIG_FAM : ↑ avant, ↓ arrière, ◄► côté), chacun sa case hexagonale, sa figure qui tourne, son joystick.
   · toucher une CASE l'ARME (elle bat ; la grille éteint les figures qui n'y vont pas) ; retouchée, elle se désarme ;
   · toucher une FIGURE l'équipe (gFigTouche) : dans la case armée si elle y va, sinon dans sa direction (figEquipe : une par direction, celle
     qui y était laisse sa place) ; la case qui la reçoit s'allume, la caisse du plateau fait la figure dans ce sens.
   Une direction sans figure : la case dit VIDE (son geste, en vol, ne fait rien). */
var GFS={arme:-1,flash:-1,k:''};
function gFigNitroSvg(){if(gFigNitroSvg._s)return gFigNitroSvg._s;
  const G=NX3_G,P=NX3_PAL.or,w=G[0].length,h=G.length,on=function(x,y){return y>=0&&y<h&&x>=0&&x<w&&G[y][x]==='#';},
    ep=function(x,y){return !on(x,y)&&(on(x,y-1)||on(x,y-2));},plein=function(x,y){return on(x,y)||ep(x,y);},cs=function(x,y){return 'M'+(x+1)+' '+(y+1)+'h1v1h-1z';};
  let O='',E='',F='',B='';
  for(let y=-1;y<=h+2;y++)for(let x=-1;x<=w;x++){
    if(on(x,y)){if(!on(x,y-1)||!on(x-1,y))B+=cs(x,y);else F+=cs(x,y);}   // le biseau clair sur l'arête haute-gauche, le plein dessous
    else if(ep(x,y))E+=cs(x,y);                                          // l'ÉPAISSEUR : deux cases sous l'éclair, comme le vrai bouton
    else{let v=false;for(let j=-1;j<=1&&!v;j++)for(let i=-1;i<=1;i++)if(plein(x+i,y+j)){v=true;break;}if(v)O+=cs(x,y);}} // le contour d'encre
  return gFigNitroSvg._s='<svg class="fsBolt" viewBox="0 0 '+(w+2)+' '+(h+4)+'" shape-rendering="crispEdges" aria-hidden="true"><path fill="'+P[7]+'" d="'+O+'"/><path fill="'+P[4]+'" d="'+E+'"/><path fill="'+P[1]+'" d="'+F+'"/><path fill="'+P[0]+'" d="'+B+'"/></svg>';}
function gFigSelEl(){let el=document.getElementById('gFigSel');if(el)return el;const st=document.getElementById('gStrip');if(!st||!st.parentNode)return null;
  el=document.createElement('div');el.id='gFigSel';el.setAttribute('role','group');
  el.innerHTML='<div class="fsNitro" aria-hidden="true">'+gFigNitroSvg()+'<b>×2</b></div>'
    +FIG_FAM.map(function(F,k){return '<button type="button" class="fsHex" data-k="'+k+'"><span class="fsCase"><span class="fsIn"></span></span><i class="fsJoy">'+pxi(F[2])+'</i><b class="fsNom"></b></button>';}).join('');
  st.parentNode.insertBefore(el,st);
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fsHex');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on)return;
    const k=+b.getAttribute('data-k');uiPop(b);uiClic('onglet');hap(6);GFS.arme=GFS.arme===k?-1:k;GFS.k='';gFigSelMaj();gFigGrilleArme();});
  return el;}
function gFigSelMaj(){const el=gFigSelEl();if(!el||!window.FIG)return;const S=figSlots(),k=S.join(',')+':'+GFS.arme+':'+GFS.flash+':'+LANG;if(GFS.k===k)return;GFS.k=k;
  el.setAttribute('aria-label',sansAcc(TR('FIGURES ÉQUIPÉES')));el.classList.toggle('arme',GFS.arme>=0);
  el.querySelectorAll('.fsHex').forEach(function(b){const s=+b.getAttribute('data-k'),id=S[s],f=id&&FIG.par[id],c=f?rarInfo(cosmRar('figure',f)).c:'#6c6390',nm=f?sansAcc(TR(f.n)):sansAcc(TR('VIDE'));
    b.style.setProperty('--fc',c);b.classList.toggle('vide',!f);b.classList.toggle('on',GFS.arme===s);b.setAttribute('aria-pressed',GFS.arme===s);
    b.querySelector('.fsIn').innerHTML=f?illuFig(id,c,s===0):'<b class="fsQ">?</b>';
    b.querySelector('.fsNom').textContent=nm;b.setAttribute('aria-label',sansAcc(TR(FIG_FAM[s][0]))+' : '+nm);
    if(GFS.flash===s){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}});
  GFS.flash=-1;}
function gFigGrilleArme(){const st=document.getElementById('gStrip'),a=GFS.arme;if(!st)return;
  st.querySelectorAll('.gT.c-figure[data-cos]').forEach(function(el){const d=COSM.figure[+el.getAttribute('data-cos')];el.classList.toggle('horsDir',a>=0&&!!d&&figPeut(d.id).indexOf(a)<0);});}
function gFigTouche(j){const d=COSM.figure&&COSM.figure[j];if(!FIGV2.on||!d||!figPossede(d.id))return false; // pas à toi : la console l'ESSAIE (comme avant)
  const P=figPeut(d.id),k=GFS.arme>=0&&P.indexOf(GFS.arme)>=0?GFS.arme:null;
  figEqToast(d.id,k);const s=k!=null?k:figSlots().indexOf(d.id);
  GFS.arme=-1;GFS.flash=s;GFS.k='';GSON9=true;shopShow('figure',j);try{garFigEssai(d.id,s);}catch(e){}return true;}
/* ===== LA FÊTE D'UNE CAISSE (2026-10-23, Sacha : « en fonction de la rareté des voitures qu'on débloque, fais des animations plus ou moins impressionnantes » ; v2 : « surtout pour les plus rares, il faut que ce soit très satisfaisant ») =====
   Une caisse qui devient à toi (achat au garage, achat en €, condition remplie en course) se FÊTE à la mesure de sa rareté, en trois temps :
   1. LA CHARGE (k ms, dès RARE) : l'écran s'assombrit, des particules de la couleur de la rareté convergent vers un orbe qui grossit, l'écran
      tremble de plus en plus, un riser monte — on retient son souffle ;
   2. L'EXPLOSION : éclair blanc, onde(s) de choc, rayons, colonnes de lumière, gerbe d'étincelles, confettis, coup de caméra, accord final ;
   3. LE MAINTIEN : le nom se tamponne lettre par lettre (reflet qui balaie), les ★ de la rareté s'allument une à une, des étoiles scintillent.
   COMMUNE : un bandeau sec. LÉGENDAIRE et au-delà : tout, plus long, plus fort. Un calque plein écran (`pointer-events:none`), retiré tout seul.
   « Réduire les animations » : le bandeau seul. Crochet de test : window.dbgFeteCaisse(index) (+ ?fete=rareté dans la console : dbgFeteCaisse(i,'legendaire')). */
const FETE_CFG={ /* k=charge ms · d=durée totale ms · r=rayons · c=confettis · e=étincelles · o=ondes · f=éclairs · b=colonnes · n=notes · s=secousse · st=★ */
  commun:    {k:0,   d:1900,r:0, c:0,  e:0,  o:0,f:0,b:0, n:2, s:0,  st:1},
  rare:      {k:450, d:3000,r:10,c:50, e:40, o:1,f:1,b:0, n:4, s:.18,st:2},
  exotique:  {k:450, d:3000,r:10,c:50, e:40, o:1,f:1,b:0, n:4, s:.18,st:2},
  epique:    {k:800, d:4300,r:16,c:110,e:90, o:2,f:2,b:5, n:6, s:.4, st:3},
  legendaire:{k:1200,d:6000,r:24,c:200,e:170,o:3,f:3,b:9, n:8, s:.7, st:4},
  mythique:  {k:1500,d:7000,r:32,c:280,e:240,o:4,f:3,b:13,n:10,s:.9, st:5},
  infini:    {k:1800,d:8000,r:40,c:360,e:320,o:5,f:4,b:17,n:12,s:1.1,st:6}};
const FETE_CSS='#feteCaisse{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;--fc:#ffd75e}'
 +'#feteCaisse.sort{animation:feteOut .6s ease-in forwards}'
 +'#feteCaisse .feVoile{position:absolute;inset:0;opacity:0;animation:feVoile .5s ease-out forwards;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,0) 18%,rgba(4,2,12,.72) 100%)}'
 +'#feteCaisse .feTeinte{position:absolute;inset:0;opacity:0;animation:feTeinte var(--fd) ease-out forwards;background:radial-gradient(circle at 50% 46%,transparent 30%,var(--fc) 140%)}'
 +'#feteCaisse .feFlash{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,#fff 0,#fff 14%,var(--fc) 42%,transparent 76%);opacity:0;animation:feFlash .8s ease-out forwards;animation-delay:var(--dl,0s)}'
 +'#feteCaisse .feRayons{position:absolute;left:50%;top:46%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;opacity:0;animation:feRay calc(var(--fd) - var(--k)) linear forwards;animation-delay:var(--k);'
 +'background:repeating-conic-gradient(from 0deg,var(--fc) 0 calc(180deg/var(--fn)),transparent 0 calc(360deg/var(--fn)));'
 +'-webkit-mask:radial-gradient(circle,#000 0,transparent 40%);mask:radial-gradient(circle,#000 0,transparent 40%)}'
 +'#feteCaisse .feOnde{position:absolute;left:50%;top:46%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;border:1.1vmin solid var(--fc);box-shadow:0 0 4vmin var(--fc),inset 0 0 4vmin var(--fc);opacity:0;animation:feOnde 1.4s ease-out forwards;animation-delay:var(--dl)}'
 +'#feteCaisse .feColonne{position:absolute;bottom:-5%;width:9vmin;height:115%;left:var(--x);margin-left:-4.5vmin;transform-origin:50% 100%;opacity:0;animation:feCol 1.6s ease-out forwards;animation-delay:var(--dl);'
 +'background:linear-gradient(to top,var(--fc),rgba(255,255,255,.55) 40%,transparent);-webkit-mask:linear-gradient(90deg,transparent,#000 50%,transparent);mask:linear-gradient(90deg,transparent,#000 50%,transparent)}'
 +'#feteCaisse canvas{position:absolute;inset:0;width:100%;height:100%}'
 +'#feteCaisse .feTexte{position:absolute;left:0;right:0;top:13%;text-align:center;color:#fff;text-shadow:0 .5vmin 0 rgba(0,0,0,.65),0 0 3vmin var(--fc)}'
 +'#feteCaisse .feTexte small{display:block;font-size:max(11px,2.6vmin);letter-spacing:.3em;opacity:0;animation:feTxt .5s calc(var(--k) + .05s) both}'
 +'#feteCaisse .feTexte i{display:inline-block;font-style:normal;font-size:max(15px,4.6vmin);letter-spacing:.18em;color:var(--fc);margin:.8vmin 0;padding:.5vmin 2vmin;border:.5vmin solid var(--fc);background:rgba(0,0,0,.55);box-shadow:0 0 3vmin var(--fc);animation:feTamp .55s calc(var(--k) + .12s) cubic-bezier(.2,1.7,.4,1) both}'
 +'#feteCaisse .feEtoiles{display:block;font-size:max(14px,3.4vmin);letter-spacing:.4em;margin:.4vmin 0 .8vmin;color:var(--fc);text-indent:.4em}'
 +'#feteCaisse .feEtoiles u{text-decoration:none;display:inline-block;opacity:0;animation:feEtoile .5s cubic-bezier(.2,1.8,.4,1) both;animation-delay:calc(var(--k) + .5s + var(--j)*.13s)}'
 +'#feteCaisse .feNom{display:block;font-size:max(20px,calc(var(--fs)*1vmin));line-height:1.12;font-weight:900}'
 +'#feteCaisse .feNom span{display:inline-block;opacity:0;animation:feLettre .45s cubic-bezier(.2,1.6,.4,1) both;animation-delay:calc(var(--k) + .2s + var(--i)*.045s);'
 +'background:linear-gradient(100deg,#fff 0 40%,var(--fc) 50%,#fff 60% 100%);background-size:260% 100%;background-position:130% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;filter:drop-shadow(0 .4vmin 0 rgba(0,0,0,.65)) drop-shadow(0 0 2vmin var(--fc));'
 +'animation-name:feLettre,feReflet;animation-duration:.45s,1.2s;animation-delay:calc(var(--k) + .2s + var(--i)*.045s),calc(var(--k) + 1s + var(--i)*.04s);animation-fill-mode:both,both}'
 +'@keyframes feteOut{to{opacity:0}}@keyframes feVoile{to{opacity:1}}'
 +'@keyframes feTeinte{0%,30%{opacity:0}45%{opacity:.5}100%{opacity:.18}}'
 +'@keyframes feFlash{0%{opacity:0}10%{opacity:1}100%{opacity:0}}'
 +'@keyframes feRay{0%{opacity:0;transform:rotate(0) scale(.3)}10%{opacity:.6}70%{opacity:.45}100%{opacity:0;transform:rotate(110deg) scale(1)}}'
 +'@keyframes feOnde{0%{opacity:1;transform:scale(.1)}100%{opacity:0;transform:scale(5.5)}}'
 +'@keyframes feCol{0%{opacity:0;transform:scaleY(0)}18%{opacity:.8;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1) scaleX(.4)}}'
 +'@keyframes feTxt{from{opacity:0;transform:translateY(-1.5vmin)}to{opacity:.9;transform:none}}'
 +'@keyframes feTamp{0%{opacity:0;transform:scale(3.2) rotate(-10deg)}100%{opacity:1;transform:scale(1) rotate(-2deg)}}'
 +'@keyframes feEtoile{0%{opacity:0;transform:scale(0) rotate(-180deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'
 +'@keyframes feLettre{0%{opacity:0;transform:translateY(-6vmin) scale(2.2)}100%{opacity:1;transform:none}}'
 +'@keyframes feReflet{0%{background-position:130% 0}100%{background-position:-30% 0}}';
let feteT=0,feteRaf=0,feteTs=[];
function feteCaisse(i,forceR){
  const car=CARS[i];if(!car)return;
  const r=forceR||carRar(i),cfg=FETE_CFG[r]||FETE_CFG.commun,info=rarInfo(r),col=info.c,reduit=REDUCED_MOTION;
  if(!document.getElementById('feteCss')){const st=document.createElement('style');st.id='feteCss';st.textContent=FETE_CSS;document.head.appendChild(st);}
  feteFin();
  const el=document.createElement('div');el.id='feteCaisse';el.style.setProperty('--fc',col);el.style.setProperty('--fd',cfg.d+'ms');el.style.setProperty('--k',(reduit?0:cfg.k)/1000+'s');
  const nom=sansAcc(TR(car.name));
  el.style.setProperty('--fn',Math.max(4,cfg.r));el.style.setProperty('--fs',Math.min(cfg.d>=6000?9:cfg.d>=4000?7.6:6.2,78/Math.max(6,nom.length)*1.7));
  let h='';
  if(!reduit){
    if(cfg.k)h+='<div class="feVoile"></div><div class="feTeinte"></div>';
    if(cfg.r)h+='<div class="feRayons"></div>';
    for(let k=0;k<cfg.b;k++)h+='<div class="feColonne" style="--x:'+(6+k*88/Math.max(1,cfg.b-1)).toFixed(1)+'%;--dl:'+((cfg.k/1000)+Math.abs(k-cfg.b/2)*.07).toFixed(2)+'s"></div>';
    for(let k=0;k<cfg.o;k++)h+='<div class="feOnde" style="--dl:'+((cfg.k/1000)+k*.3).toFixed(2)+'s"></div>';
    h+='<canvas></canvas>';
  }
  let etoiles='';for(let k=0;k<cfg.st;k++)etoiles+='<u style="--j:'+k+'">★</u>';
  h+='<div class="feTexte"><small>'+sansAcc(TR('NOUVELLE VOITURE'))+'</small><i>'+sansAcc(TR(info.n1))+'</i><span class="feEtoiles">'+etoiles+'</span><b class="feNom">'
    +Array.from(nom).map(function(c,k){return c===' '?' ':'<span style="--i:'+k+'">'+c+'</span>';}).join('')+'</b></div>';
  el.innerHTML=h;document.body.appendChild(el);
  const T=function(f,ms){feteTs.push(setTimeout(f,ms));},K=reduit?0:cfg.k;
  const flash=function(){const f=document.createElement('div');f.className='feFlash';el.appendChild(f);};
  if(!reduit){
    for(let k=1;k<cfg.f;k++)T(flash,K+k*380);
    /* LA CHARGE : tremblement qui monte, riser (gamme qui grimpe + souffle), haptique en crescendo */
    if(cfg.k){
      const pas=Math.max(4,Math.round(cfg.k/90));
      for(let k=0;k<pas;k++)T(function(){try{shake=Math.max(shake,cfg.s*.35*(k/pas));}catch(e){}},k*(cfg.k/pas));
      const nr=Math.round(cfg.k/110);for(let k=0;k<nr;k++)T(function(){try{chimeNote(noteP(k%5,Math.floor(k/5)),0,.012+.02*k/nr,.1);}catch(e){}},k*(cfg.k/nr));
      T(function(){try{noiseBurst(cfg.k/1000,.07,500+cfg.n*160);}catch(e){}},0);
      hap(cfg.k>=1200?[8,60,10,60,14,50,20,40,30,30,40]:[8,60,12,50,20]);
    }
    /* L'EXPLOSION */
    T(function(){try{shake=Math.max(shake,cfg.s);fovPunch=Math.max(fovPunch,cfg.s*14);}catch(e){}try{noiseBurst(.5,.14,1400);}catch(e){}
      hap(cfg.n>=8?[30,40,30,40,30,40,120]:cfg.n>=5?[24,40,24,40,80]:[14,30,24]);
      for(let k=0;k<cfg.n;k++)T(function(){try{chimeNote(noteP(k%5,1+Math.floor(k/5)),0,.032,.2);}catch(e){}},k*80);
      if(cfg.n>=6)T(function(){try{chimeNote(noteP(0,0),0,.05,.9);chimeNote(noteP(2,1),0,.04,.9);chimeNote(noteP(4,1),0,.04,.9);}catch(e){}},cfg.n*80); /* l'accord final tenu */
    },K);
    for(let k=1;k<cfg.f;k++)T(function(){try{shake=Math.max(shake,cfg.s*.6);hap(14);}catch(e){}},K+k*380);
  }else{hap([14,30,24]);}
  const cv=el.querySelector('canvas');if(cv)feteParticules(cv,cfg,col,K);
  feteT=setTimeout(function(){el.classList.add('sort');feteT=setTimeout(feteFin,620);},cfg.d);
  if(!reduit&&cfg.k)T(flash,K); /* le flash de l'explosion (les suivants : plus haut) */
  else if(!reduit&&cfg.f)T(flash,0);
}
function feteFin(){clearTimeout(feteT);for(const t of feteTs)clearTimeout(t);feteTs=[];cancelAnimationFrame(feteRaf);feteRaf=0;const o=document.getElementById('feteCaisse');if(o)o.remove();}
function feteParticules(cv,cfg,col,K){ /* UN canvas, quatre sortes : particules de charge (convergent), étincelles (traînées, additives), confettis, étoiles qui scintillent */
  const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr),g=cv.getContext('2d');if(!g)return;
  const cx=W/2,cy=H*.46,M=Math.min(W,H),teintes=[col,'#ffffff','#ffd75e',col,'#ffffff'],P=[],S=[],C=[],E=[];
  let boom=false,t0=performance.now(),dern=t0;
  function boum(){boom=true;
    for(let k=0;k<cfg.e;k++){const a=Math.random()*6.2832,v=(8+Math.random()*26)*dpr;S.push({x:cx,y:cy,px:cx,py:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:Math.random()<.5?'#fff':col,l:0,L:.7+Math.random()*.9});}
    for(let k=0;k<cfg.c;k++){const a=Math.random()*6.2832,v=(5+Math.random()*17)*dpr;
      C.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-9*dpr,w:(5+Math.random()*8)*dpr,h:(3+Math.random()*5)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.5,c:teintes[k%5],d:Math.random()*.25});}}
  (function im(now){
    const e=now-t0,dt=Math.min(.05,(now-dern)/1000);dern=now;g.clearRect(0,0,W,H);
    if(!boom&&e<K){ /* la charge : de plus en plus de particules aspirées vers l'orbe, qui grossit */
      const u=e/Math.max(1,K),n=Math.round(2+u*7);
      for(let k=0;k<n;k++){const a=Math.random()*6.2832,R=M*(.35+Math.random()*.35);P.push({x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R,t:0,T:.35+Math.random()*.3,c:teintes[(Math.random()*5)|0],s:(1.5+Math.random()*3)*dpr});}
      g.globalCompositeOperation='lighter';const R0=M*.02+M*.2*u*u,gr=g.createRadialGradient(cx,cy,0,cx,cy,R0*2.4);gr.addColorStop(0,'rgba(255,255,255,'+(.5+.5*u)+')');gr.addColorStop(.35,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55+.45*u;g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R0*2.4,0,6.2832);g.fill();g.globalAlpha=1;
    }else if(!boom)boum();
    g.globalCompositeOperation='lighter';
    for(let k=P.length-1;k>=0;k--){const p=P[k];p.t+=dt;const q=Math.min(1,p.t/p.T),z=q*q,x=p.x+(cx-p.x)*z,y=p.y+(cy-p.y)*z;
      g.globalAlpha=Math.min(1,q*2.5)*(1-q*.4);g.fillStyle=p.c;g.fillRect(x-p.s/2,y-p.s/2,p.s,p.s);if(q>=1)P.splice(k,1);}
    for(let k=S.length-1;k>=0;k--){const s=S[k];s.l+=dt;s.px=s.x;s.py=s.y;const f9=dt*60,a9=Math.pow(.965,f9);s.vx*=a9;s.vy=s.vy*a9+.35*dpr*f9;s.x+=s.vx*f9;s.y+=s.vy*f9; /* (2026-10-24) calé sur 60 i/s : même trajet à 30, 60 ou 120 Hz */
      const a=1-s.l/s.L;if(a<=0){S.splice(k,1);continue;}g.globalAlpha=a;g.strokeStyle=s.c;g.lineWidth=2.2*dpr;g.beginPath();g.moveTo(s.px,s.py);g.lineTo(s.x,s.y);g.stroke();}
    g.globalCompositeOperation='source-over';
    const fin=cfg.d-600;
    for(let k=C.length-1;k>=0;k--){const p=C[k];if(e<K+p.d*1000)continue;const f9=dt*60;p.vy+=.5*dpr*f9;p.vx*=Math.pow(.987,f9);p.vy*=Math.pow(.992,f9);p.x+=p.vx*f9;p.y+=p.vy*f9;p.r+=p.vr*f9; /* (2026-10-24) idem, calé sur 60 i/s */
      if(p.y>H+30){C.splice(k,1);continue;}g.save();g.translate(p.x,p.y);g.rotate(p.r);g.scale(1,Math.cos(p.r*1.7));g.fillStyle=p.c;g.globalAlpha=Math.max(0,Math.min(1,(fin-e)/700));g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();}
    if(boom&&cfg.st>=3&&e<fin-300&&Math.random()<.5){E.push({x:Math.random()*W,y:Math.random()*H*.8,t:0,T:.5+Math.random()*.6,s:(5+Math.random()*9)*dpr});} /* les étoiles scintillent pendant le maintien */
    g.globalCompositeOperation='lighter';
    for(let k=E.length-1;k>=0;k--){const s=E[k];s.t+=dt;const q=s.t/s.T;if(q>=1){E.splice(k,1);continue;}const a=Math.sin(q*Math.PI),L=s.s*a;
      g.globalAlpha=a;g.fillStyle='#fff';g.fillRect(s.x-L,s.y-s.s*.12,L*2,s.s*.24);g.fillRect(s.x-s.s*.12,s.y-L,s.s*.24,L*2);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(e<cfg.d)feteRaf=requestAnimationFrame(im);})(t0);}
window.dbgFeteCaisse=function(i,r){feteCaisse(i|0,r);};
Object.assign(I18N,{"NOUVELLE VOITURE":"NEW CAR"});
