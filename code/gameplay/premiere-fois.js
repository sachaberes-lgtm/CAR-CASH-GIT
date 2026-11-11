
/* ===== LES NAISSANCES DE COURSE, DESSINÉES UNE FOIS AU MENU (2026-11-07, passe perf 3, P6 : « les gels en course à la première fois ») =====
   MESURÉ (banc `outils/banc-perf/premiere-fois.py`, `passation/perf-2026-11/PREMIERE-FOIS.md`) : une course scénarisée qui déclenche chaque figure,
   chaque pouvoir, un orage, un événement rare, la frénésie, une seconde chance et un portail par map ne lie plus AUCUN programme en course (la chauffe
   du menu les compile tous) ; en revanche cinq familles de dessins ne sont JAMAIS dessinées avant leur première fois — or sur iPhone (Metal)
   le vrai programme de la puce naît au PREMIER DESSIN (10 à 50 ms par couple programme × mélange, voir « LA CHAUFFE DE LA PUCE » dans
   vignette-moteur.js) :
   · LES BILLETS (`BILL_IM`), LES PANNEAUX DU CRATÈRE (`PAN_VOL`, `PAN_DARD` : volutes et dards de la mort) et LA PLUIE DE MONNAIES (`MONN`) sont des maillages INSTANCIÉS gardés à
     ZÉRO instance. Leur « chauffe » (`onAfterRender` → `chaud=true`) se déclenchait sur une image où three NE DESSINE RIEN (`renderInstances`
     rend la main si le nombre d'instances est 0) : le programme était lié, jamais dessiné — le 1er dessin avait lieu à la 1re mort ;
   · LE PIGEON : `chauffeDivers` ne faisait que `renderer.compile` d'un pigeon (liaison) ; la 1re volée (heure aléatoire, en pleine course) le dessinait pour la 1re fois.
   · LA CARTE MOTEUR (trois quads) et LES MOTEURS GARDÉS de l'écran de mort : voir plus bas.
   Ici : UNE instance de taille nulle (dessin réel, rien à l'écran) passée par `chauffeRendu`, puis tout est remis comme avant. Interrupteur : `?premfois=0`
   (= l'ancien comportement : rien n'est dessiné d'avance). Appelé par `chauffeDivers` (une étape par image) ; chaque étape se joue UNE fois. */
const PREM_ON=!/[?&]premfois=0\b/.test(location.search);
const PREM={degen:new THREE.Matrix4().makeScale(0,0,0),fait:{}};
function premInstance(im,n,vis){ /* un maillage instancié dessiné pour de bon avec UNE instance invisible, puis remis à son état */
  const c0=im.count,v0=im.visible;
  try{im.setMatrixAt(0,PREM.degen);im.instanceMatrix.needsUpdate=true;im.count=1;im.visible=true;chauffeRendu([im]);}
  finally{im.count=c0;im.visible=v0;}
}
function premPanneau(o){ /* les panneaux (instances par attributs, `instanceCount`) : S = 0 pour tout le monde, une instance dessinée */
  if(!o||!o.mesh)return;const n0=o.g.instanceCount,v0=o.mesh.visible;
  try{o.g.instanceCount=1;for(let i=0;i<o.at.length;i++)o.at[i].needsUpdate=true;o.mesh.visible=true;chauffeRendu([o.mesh]);}
  finally{o.g.instanceCount=n0;o.mesh.visible=v0;}
}
function premiereFoisEtape(k){ /* (2026-11-09, chasse : renommée, elle masquait premiereFois() de son/musique.js — leconSilence appelait celle-ci sans argument : TypeError et « premier lancement » toujours faux) l'étape k de la liste (une par image) ; vrai s'il y en a encore */
  const L=[
    function(){if(typeof BILL_IM!=='undefined')premInstance(BILL_IM);},
    function(){premPanneau(PAN_VOL);},
    function(){premPanneau(PAN_DARD);},
    function(){premPanneau(MONN);}, /* la pluie de monnaies (600 panneaux, billets-devises.js) : même cas */
    function(){const p=mkPigeon();scene.add(p);try{chauffeRendu([p]);}finally{scene.remove(p);}},
    function(){premCartes();},
    function(){setTimeout(premMoteursTic,1500);}
  ];
  if(!PREM_ON||PREM.fait[k])return k+1<L.length;
  PREM.fait[k]=1;try{L[k]();}catch(e){console.warn('premiereFoisEtape',k,e);}
  return k+1<L.length;
}
/* (2026-11-07, P6) LA CARTE MOTEUR et LE MOTEUR DE L'ÉCRAN DE MORT. MESURÉ : au 1er palier de la course (la carte « NOUVEAU MOTEUR » recollée dans l'image) et à
   la 1re mort (le moteur rendu dans son tampon de 864 × 578), sept couples programme × mélange naissent d'un coup (3 Phong, 3 Basic, le cône de la flamme) et
   quatre textures (192-512 px) montent : la chauffe du menu ne faisait que `renderer.compile` de ces moteurs gardés (`ENG_PRET`) et des trois quads de la carte.
   · `premCartes` : les trois quads dessinés pour de bon, à l'échelle zéro, sur la toile (la cible de la vraie carte) ;
   · `premMoteursTic` : une chaîne de petites tranches (350 ms), lancée par le menu, qui attend la fin de la chauffe des moteurs (`CHAUFFE_R.fait`), jamais pendant
     une course, un lâcher ou un piqué, et dessine UN moteur gardé par tranche dans `engRT` — sauf si ses programmes ont déjà été dessinés. */
function premCartes(){
  if(typeof engCarteQuad==='undefined'||!engVigQuadScene)return;
  const q=[engCarteQuad,engHalo,engNoir],v=q.map(function(o){return o.visible;}),s=q.map(function(o){return o.scale.clone();}),vq=engVigQuad.visible,ac=renderer.autoClear,t0=renderer.getRenderTarget();
  try{engVigQuad.visible=false;for(const o of q){o.visible=true;o.scale.set(0,0,1);}renderer.setRenderTarget(null);renderer.autoClear=false;renderer.render(engVigQuadScene,engVigQuadCam);}
  finally{renderer.autoClear=ac;renderer.setRenderTarget(t0);engVigQuad.visible=vq;q.forEach(function(o,i){o.visible=v[i];o.scale.copy(s[i]);});}
}
const PREMM={i:0,n:0,vus:new Set(),feu:null,fini:false};
function premMoteurUn(){ /* dessine UN moteur gardé dont les programmes n'ont pas encore été dessinés ; vrai quand il n'y en a plus */
  while(PREMM.i<ENGINE_TIERS.length&&!ENG_PRET[PREMM.i])PREMM.i++;
  if(PREMM.i>=ENGINE_TIERS.length)return true;
  const g=ENG_PRET[PREMM.i++];
  if(g&&!g.parent){
    const cles=[];g.traverse(function(o){if(!o.isMesh||!o.material||Array.isArray(o.material))return;const p=renderer.properties.get(o.material).currentProgram;cles.push(p?p.cacheKey:'?'+o.material.id);});
    if(cles.some(function(k){return !PREMM.vus.has(k);})){
      for(const k of cles)PREMM.vus.add(k);
      if(!PREMM.feu){PREMM.feu=new THREE.Mesh(engVigFeuGeo,engVigFeuMat);PREMM.feu.frustumCulled=false;}
      engVigScene.add(g);engVigScene.add(PREMM.feu);
      try{engVigRendRT(engRT);}finally{engVigScene.remove(g);engVigScene.remove(PREMM.feu);}
    }
  }
  return false;
}
function premMoteursTic(){
  if(!PREM_ON||PREMM.fini||++PREMM.n>700)return;
  let libre=false;
  try{
    libre=!started&&!gameOver&&CHAUFFE_R.fait&&!ecranWipe._on&&!GAR.go&&!CHUTE.go&&!garageOn;
    if(libre&&premMoteurUn()){PREMM.fini=true;return;}
  }catch(e){console.warn('premMoteursTic',e);}
  setTimeout(premMoteursTic,libre?250:900);
}
window.dbgPremiere=function(a){
  if(a==='tout'){ /* banc : toute la chauffe d'un coup, sans attendre celle du menu (le Chrome sans fenêtre ne la finit pas) — moteurs de tous les paliers fabriqués puis dessinés */
    for(let k=0;k<7;k++){PREM.fait[k]=0;premiereFoisEtape(k);}
    for(let i=0;i<ENGINE_TIERS.length;i++)engPret(i);
    let g9=0;while(!premMoteurUn()&&++g9<80){}
    PREMM.fini=true;
  }
  return {on:PREM_ON,chauffe:{div:CHAUFFE_R.div,fait:!!CHAUFFE_R.fait,ap:CHAUFFE_R.ap},fait:Object.keys(PREM.fait).length,moteurs:{i:PREMM.i,n:PREMM.n,fini:PREMM.fini,programmes:PREMM.vus.size}};}; /* banc (premiere-fois.py) : où en est la chauffe des premières fois ; ('tout') la joue d'un coup */
/* ===== LA CARTE MOTEUR DE L'ÉCRAN DE MORT, MOINS SOUVENT (2026-11-08, passe perf 3, P6 « dernière salve ») =====
   MESURÉ (banc `outils/banc-perf/depart-mort.py`, nuages, Mac ×4, profil CDP) : sur l'écran de mort le moteur 3D de la carte MOTEUR est rendu dans son tampon
   de 864 × 578, relu (`engLit` : `fenceSync` + `getBufferSubData`) et recopié (`engPose` : `putImageData`) 30 fois par seconde — `engVigRender` = 500 à 900 ms
   par fenêtre de 3 s (17 à 30 % du fil), 8 s après la mort, alors que rien d'autre ne bouge. Sur un vrai téléphone (TEL_NATIF) la carte de MORT n'est plus
   rendue que toutes les 66 ms (15 i/s : une rotation lente, voir `PAL.B.engVigMs` pour les paliers 0 et 1 qui font déjà 100 et 66) ; la carte de COURSE
   (le palier du moteur recollé dans l'image) garde son rythme. `?mortcarte=max` : 33 ms comme avant. */
const MORT_ENG_MS=(typeof TEL_NATIF!=='undefined'&&TEL_NATIF&&!/[?&]mortcarte=max\b/.test(location.search))?66:0;
/* ===== L'ÉCRAN DE MORT SUIT L'HORLOGE (2026-11-09, passe perf 3, P6 : « la régression de l'écran de mort », OPTI ULTIME) =====
   `boomT` avance du `dt` de la boucle, plafonné à 50 ms (`boucle-1.js`) : l'explosion dure 1,8 s DE TEMPS DE JEU, et l'écran de mort (`endGame`, boucle-3-physique)
   n'arrive qu'à `boomT > 1,8`. MESURÉ sur le 13 Pro (builds 41 et 44) : REJOUER n'est disponible que 8,2-9,2 s après la 1re mort et 3,5-8,5 s après la 2e —
   chaque image de plus de 50 ms ralentit le temps de jeu de l'explosion (à 250 ms par image : 1,8 s × 250/50 = 9 s). Sur le Mac ×4, 2,2 s. Désormais l'écran de mort arrive
   aussi quand 2,0 s d'horloge réelle se sont écoulées depuis l'explosion (1,8 s de jeu + les 0,11 s de l'écrasement de l'impact) : à 60 i/s c'est la condition d'avant qui
   gagne (identique à l'image près), sur un téléphone qui rame l'animation saute des images mais l'écran de mort arrive à ~2 s. `boomT` est mis à 1,8 d'un coup, comme
   `boomSkip` (la lumière, les anneaux et les débris s'éteignent à l'image suivante) ; la logique (haptique de rebond, fumée) n'en dépend que pour le décor. `?boom=ancien` : sans. */
let boomR0=0;
const BOOM_REEL=!/[?&]boom=ancien\b/.test(location.search),BOOM_REEL_MS=2000;
