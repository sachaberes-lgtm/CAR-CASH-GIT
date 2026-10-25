/* ---- LA MUSIQUE DE LA FRÉNÉSIE — « THE DARK TRIAD » (2026-09-28, Sacha : « une musique qui sera très cool… jouissif d'y arriver et
   de la garder, sinon la musique cool s'arrête »). La frénésie a SON morceau : on y entre, il TOMBE (du début, ou de `drop` secondes
   s'il a une montée à sauter) ; on la perd, il S'ÉTRANGLE (tape-stop de 0,4 s) et la radio reprend EXACTEMENT où elle en était.
   MÊME lecteur que tout le reste : l'<audio> unique, libéré au premier toucher — iOS le laisse changer de source hors d'un geste,
   alors qu'un second élément lancé en pleine course y serait refusé.
   LE FICHIER : `MUSIC_FREN.f` (nom en ASCII sans espace — une URL mal encodée ne plante pas, elle se tait). S'il manque (sondé une
   fois, et rattrapé si la lecture échoue quand même), la frénésie joue le morceau EN COURS « SURMULTIPLIÉ » : un demi-ton plus haut et
   6 % plus vite, qui retombe à sa vitesse quand on la perd. `surm:1` éteint ce repli.
   (2026-10-24, le 404 de chaque chargement) LE MORCEAU EXISTE DEPUIS LE 01/10 : la boucle maison DARK TRIAD de l'atelier (atelier-son/
   boucles.py, « pour : FRÉNÉSIE » — phonk 140 bpm, do# phrygien, 16 mesures = 27,43 s qui bouclent), rangée à `boucles/dark-triad.m4a`
   (vercel-build.sh la publie pour ça). `f` la cherchait en .mp3 sous music/, où rien n'a jamais été posé : deux 404 par chargement, et
   la frénésie ne changeait jamais de morceau. Depuis que Pouce bleu tient la course (15/10), le repli accélérait le lecteur <audio>…
   en pause : en course, la frénésie ne s'entendait plus du tout. Un autre morceau = un autre `f`. */
const MUSIC_FREN={titre:'THE DARK TRIAD',f:'assets/audio/music/boucles/dark-triad.m4a',drop:0,surm:1.06};
const FRENM={on:false,ok:null,sw:false,surm:false,src:'',t:0,loop:false,iv:0};
function frenMusSonde(){ // le fichier est-il là ? (une fois — une réponse muette, comme sur iPhone, laisse la question ouverte)
  if(FRENM.ok!==null||!MUSIC_FREN.f)return;
  /* (2026-10-12, passe qualité) une requête HEAD répond PARTOUT, iPhone compris : sur iPhone l'élément audio ne précharge rien, la sonde
     ci-dessous restait muette (FRENM.ok null) et la 1re FRÉNÉSIE basculait la musique sur le fichier absent — un trou de musique pile au
     moment de la récompense. Un 404 ferme la question ; une requête qui échoue (hors ligne, schéma natif) la laisse ouverte, comme avant. */
  try{if(typeof fetch==='function'&&!frenMusSonde._f){frenMusSonde._f=1;fetch(MUSIC_FREN.f,{method:'HEAD',cache:'no-store'}).then(function(r){if(FRENM.ok===null&&r&&(r.status===404||r.status===410))FRENM.ok=false;else if(FRENM.ok===null&&r&&r.ok)FRENM.ok=true;}).catch(function(){});}}catch(e){}
  try{const a=document.createElement('audio');a.preload='metadata';a.muted=true;
    a.addEventListener('loadedmetadata',function(){FRENM.ok=true;a.removeAttribute('src');},{once:true});
    a.addEventListener('error',function(){FRENM.ok=false;},{once:true});a.src=MUSIC_FREN.f;}catch(e){FRENM.ok=false;}
}
function frenMusVit(el,cible,ms,fin){ // la bande accélère ou ralentit (sans garder la hauteur : c'est tout l'effet)
  clearInterval(FRENM.iv);
  try{el.preservesPitch=false;el.webkitPreservesPitch=false;}catch(e){}
  let r0=el.playbackRate||1,k=0;const n=Math.max(1,Math.round(ms/40));
  FRENM.iv=setInterval(function(){k++;const r=r0+(cible-r0)*Math.min(1,k/n);try{el.playbackRate=Math.max(.12,r);}catch(e){}
    if(k>=n){clearInterval(FRENM.iv);if(fin)fin();}},40);
}
function frenMusRetour(el){ // la radio reprend où elle en était (ou sur le morceau du lieu, s'il a changé pendant la frénésie)
  try{el.playbackRate=1;el.preservesPitch=true;el.webkitPreservesPitch=true;}catch(e){}
  if(musicMode!=='run'||gameOver)return; // fin de partie : musicStop / musicMenu ont la main
  if(pbjRegne()&&window.POUCE_JEU.joue()){stopMusic();return;} // (15/10 soir) POUCE BLEU reprend l'antenne (musicTick le remonte) : pas de radio
  if(!FRENM.src){musicPlayCurrent();return;}
  el.loop=FRENM.loop;el.src=FRENM.src;const t=FRENM.t;
  if(musWaTient()&&MUS_WA.bus)MUS_WA.bus.piste(FRENM.src); /* (2026-10-24) le bus des basses retrouve le réglage du morceau repris */
  el.addEventListener('loadedmetadata',function(){try{el.currentTime=t;}catch(e){}},{once:true});
  musicVoulue=true;musicJoue();
}
function frenMusRate(){ // le morceau de la triade a échoué : retour radio, puis le repli surmultiplié si la frénésie tient toujours
  FRENM.ok=false;FRENM.sw=false;const el=musicElGet();frenMusRetour(el);
  if(FRENM.on&&MUSIC_FREN.surm>1){FRENM.surm=true;frenMusVit(el,MUSIC_FREN.surm,300);}
}
function frenMus(on){
  if(on===FRENM.on)return;FRENM.on=on;
  const el=musicEl;
  if(on){
    if(!SND.music||musicMode!=='run'||!el)return;
    /* (2026-10-14, session SON) on ne bascule que sur un fichier CONFIRMÉ (`ok===true`, sondé au lancement). Dans l'appli iPhone la sonde reste
       sans réponse quand le fichier manque (`ok` null) : la 1re frénésie coupait la musique sur un fichier absent, 0,3 à 1,5 s de trou pile sur
       la récompense, puis la radio repartait. Sans confirmation, c'est le repli surmultiplié, sans changer de source ni de silence. */
    if(MUSIC_FREN.f&&FRENM.ok===true){ // LE MORCEAU TOMBE
      clearInterval(FRENM.iv);
      FRENM.src=el.src;FRENM.t=el.currentTime||0;FRENM.loop=el.loop;FRENM.sw=true;
      try{el.playbackRate=1;el.preservesPitch=true;el.webkitPreservesPitch=true;}catch(e){}
      el.loop=true;el.src=MUSIC_FREN.f;
      if(musWaTient()&&MUS_WA.bus)MUS_WA.bus.piste(MUSIC_FREN.f); /* (2026-10-24) les basses de CE morceau, comme playMusic (musique-bus.js : 'dark-triad', cloche −2 dB) */
      if(MUSIC_FREN.drop>0)el.addEventListener('loadedmetadata',function(){try{el.currentTime=MUSIC_FREN.drop;}catch(e){}},{once:true});
      musicVoulue=true;musicJoue();try{lvlBlast();}catch(e){}
    }else if(MUSIC_FREN.surm>1){FRENM.surm=true;frenMusVit(el,MUSIC_FREN.surm,300);} // le repli : la radio S'EMBALLE
    return;}
  if(!el){FRENM.sw=false;FRENM.surm=false;return;}
  if(FRENM.sw){FRENM.sw=false; // IL S'ÉTRANGLE, puis la radio revient
    frenMusVit(el,.12,400,function(){frenMusRetour(el);});}
  else if(FRENM.surm){FRENM.surm=false;frenMusVit(el,1,450,function(){try{el.preservesPitch=true;el.webkitPreservesPitch=true;}catch(e){}});} // la radio RETOMBE
}
setTimeout(function(){try{frenMusSonde();}catch(e){}},2500);
// la pause du jeu met la musique en pause (et la reprend) — elle ne passe plus par l'AudioContext suspendu
function musicPause(p){try{if(!musicEl)return;if(p){if(!musicEl.paused)musicEl.pause();}else if(musicVoulue)musicJoue();}catch(e){}}
/* <<<FOND>>> ==================================================================
   LE FOND DU NIVEAU 1 — le décor JOUE la musique
   ----------------------------------------------------------------------------
   ⚠ RÈGLE DU BLOC BALISÉ (la même que <<<MOTEURS>>> et <<<VOITURES>>>) : ce qui suit ne dépend QUE
   de `THREE` et de `skyU`. Aucune globale du jeu — pas de `running`, pas de `MUSIC_PULSE`, pas de
   `NEON_RAILS` : tout entre par le paramètre `S` de `lvlTick`. C'est ce qui permet à
   `atelier-fond.html` d'EXÉCUTER ce bloc tel quel, sur le vrai morceau, sans lancer une partie —
   et donc de juger l'esthétique, ce qu'aucune console ne sait faire. Y glisser une référence au
   jeu casserait l'atelier EN SILENCE.
   ----------------------------------------------------------------------------
   POURQUOI UN MÉTRONOME ET PAS SEULEMENT L ANALYSEUR. Brancher un décor directement sur
   `MUSIC_BEAT` donne un fond qui SURSAUTE : il n'existe que sur les coups, et il meurt dès que le
   morceau respire (un pont sans grosse caisse fige tout l'écran). Geometry Dash et Super Hexagon ne
   font pas ça — chez eux le décor TOURNE en mesure, en continu, et les frappes ne font que le
   bousculer. On tient donc une horloge : les coups détectés servent à ESTIMER le tempo et à
   RECALER la phase, jamais à piloter directement. Entre deux coups, le décor continue tout seul.
   ⚠ le repliement d'octave (`r>1.55` / `r<.68`) n'est pas un détail : sans lui, un morceau qui passe
   en double-croches double le tempo estimé et le décor part au galop pour ne plus jamais revenir.
   ========================================================================== */
/* ⚠ LA BASE DE TEMPS EST `dt`, PAS L'HORLOGE MURALE. Ni `performance.now()` ni `AC.currentTime` :
   le temps audio se FIGE quand le contexte est suspendu (bouton SON) et le métronome repartirait en
   vrille au rallumage ; et le temps mur rend le système intestable — un onglet caché bride les
   timers, on ne peut plus rejouer une séquence de coups. `BCLK.t` s'accumule depuis le `dt` de la
   boucle : identique au temps réel en jeu, et pilotable image par image en vérification. */
const BCLK={t:0,per:.5,ph:0,last:-9,conf:0,miss:0,n:0,force:0}; // per = durée d'un temps (s) · ph = phase, en temps
const LVLFX={k:0,spin:0,dir:1,flip:0,flipTo:0,ri:0,
  wave:0,waveV:0,hueA:0,hueTo:0,      // L'ONDE DE COULEUR : sa phase, sa vitesse, son amplitude
  sunK:0,planetK:0,                   // L'ÉCLAT DES ASTRES — le bloc les CALCULE, le jeu les APPLIQUE (voir plus bas)
  acc:new THREE.Color(0xf24aa0),acc2:new THREE.Color(0x3ee6f0),_src:null,_h:{h:0,s:0,l:0}};
function beatClockHit(now){ // un coup entendu : il corrige le TEMPO puis la PHASE, il ne déclenche rien
  const d=now-BCLK.last;BCLK.last=now;
  if(d>.26&&d<1.15){
    let c=d;const r=d/BCLK.per;                                   // repliement d'octave : un coup sur deux ou deux par temps ne doivent pas changer le tempo
    if(r>1.55)c=d/Math.max(1,Math.round(r));else if(r<.68)c=d*Math.max(1,Math.round(1/r));
    if(Math.abs(c/BCLK.per-1)<.14){BCLK.per+=(c-BCLK.per)*.16;BCLK.conf=Math.min(1,BCLK.conf+.10);BCLK.miss=0;}
    else if(++BCLK.miss>3){BCLK.per=Math.max(.28,Math.min(1.10,d));BCLK.conf=.15;BCLK.miss=0;} // 4 coups de suite à côté = c'est NOUS qui avions tort : on adopte le nouveau tempo
    else BCLK.conf=Math.max(0,BCLK.conf-.06);
  }
  const f=BCLK.ph-Math.floor(BCLK.ph),err=f>.5?f-1:f;             // erreur signée vers le temps le PLUS PROCHE (devant ou derrière)
  BCLK.ph-=err*(.30+BCLK.conf*.35);                               // ⚠ recalage DOUX : un saut de phase se voit comme une saccade
}
function lvlFlip(){ // LA BASCULE façon Geometry Dash : les deux teintes s'échangent ET la roue change de sens
  LVLFX.flipTo=LVLFX.flipTo?0:1;LVLFX.dir=-LVLFX.dir;
}
function lvlKick(k){ // une ONDE part du zénith + la roue prend un à-coup (elle ne glisse pas, elle COGNE)
  const c=['x','y','z','w'][LVLFX.ri&3];LVLFX.ri++;
  skyU.uRingR.value[c]=.02;skyU.uRingA.value[c]=Math.min(1,.30+k*.85);
  LVLFX.spin+=LVLFX.dir*k*.045;
  /* L'ONDE DE COULEUR PART SUR LE COUP. ⚠ on donne de la VITESSE, on ne saute pas la phase : un
     saut ferait clignoter tout le ciel d'une couleur à l'autre en une frame, ce qui est un défaut
     de rendu, pas un effet. Là, le front s'élance et se propage — on le VOIT traverser. */
  LVLFX.waveV=Math.max(LVLFX.waveV,.22+k*.62);
  LVLFX.hueTo=Math.min(.30,LVLFX.hueTo+k*.16); // et l'amplitude de teinte s'ouvre à chaque frappe
}
function lvlBlast(){ // l'embrasement : les 4 ondes d'un coup (début et fin de niveau)
  const R=skyU.uRingR.value,A=skyU.uRingA.value,c=['x','y','z','w'];
  for(let i=0;i<4;i++){R[c[i]]=i*.16;A[c[i]]=1;}
}
/* `lvlTick(dt, S)` — S est TOUT ce que le fond sait du monde extérieur :
     S.onset  la nouveauté de basse de la frame (l'analyseur), c'est elle qui nourrit le métronome
     S.pulse  l'énergie moyenne du morceau (0..1)     S.beat  la frappe déjà lissée (0..1)
     S.boost  l'ouverture nitro/vitesse (0..1)        S.surge l'embrasement de fin de niveau (0..1)
     S.on     le décor doit-il être allumé            S.acc   la teinte d'accent de la zone (THREE.Color)
   Aucune de ces valeurs n'est lue dans une globale : c'est la condition pour que l'atelier existe. */
function lvlTick(dt,S){
  S=S||{};
  /* ⚠ DEUX GARDE-FOUS D'ENTRÉE, ET ILS ONT TOUS LES DEUX SERVI (trouvés en atelier, 2026-08-08).
     (1) `dt` BORNÉ À ZÉRO : un `dt` NÉGATIF (horodatage rAF antérieur au précédent — ça arrive au
     réveil d'un onglet, au premier tour de boucle, ou en pas-à-pas) inverse toutes les décroissances.
     Mesuré : la frappe, censée retomber, MONTAIT — 14,19 au lieu de ≤1, et le soleil gonflait à
     ×3,37. Une régression invisible en jeu normal, garantie de sortir un jour.
     (2) LES ENTRÉES SONT PINCÉES À [0,1] : ce bloc a deux appelants (le jeu et l'atelier) et rend
     des facteurs d'ÉCHELLE. Faire confiance à l'appelant, c'est accepter qu'une valeur aberrante
     devienne un astre de 7 000 unités. Un bloc partagé se défend à sa frontière. */
  dt=Math.max(0,Math.min(.1,dt||0));
  const cl=v=>v>0?(v<1?v:1):0;
  const sBeat=cl(S.beat),sPulse=cl(S.pulse),sBoost=cl(S.boost),sSurge=cl(S.surge),sHi=cl(S.hi);
  /* ONSET → MÉTRONOME. La période réfractaire (.20 s) est indispensable : une frappe s'étale sur
     plusieurs frames et compterait sinon pour cinq coups — tempo estimé cinq fois trop rapide.
     `BCLK.force` est l'entrée de vérification, elle emprunte EXACTEMENT ce chemin-là. */
  BCLK.t+=dt;
  const bk=Math.max(S.onset||0,BCLK.force);BCLK.force=0;
  if(bk>.17&&BCLK.t-BCLK.last>.20){beatClockHit(BCLK.t);lvlKick(Math.min(1,bk));}
  /* LE MÉTRONOME AVANCE TOUT SEUL — c'est lui qui garde le décor en mesure quand la grosse caisse
     se tait. Il ne s'arrête jamais ; quand la musique est coupée, `LVLFX.k` tombe à 0 et rien ne
     se voit, mais l'horloge est déjà à l'heure quand le morceau revient. */
  const p0=BCLK.ph;BCLK.ph+=dt/Math.max(.2,BCLK.per);
  if(Math.floor(BCLK.ph)>Math.floor(p0)){BCLK.n++;if(BCLK.n%8===0)lvlFlip();} // une bascule par PHRASE (8 temps), pas par temps : sinon c'est un gyrophare
  /* PRÉSENCE : le décor s'allume AVEC le morceau et s'éteint avec lui. Montée lente (≈2 s) : le
     niveau se LÈVE au lieu d'apparaître, ce qui donne au départ de course son moment. */
  const want=S.on?1:0,pulse=sPulse,boost=sBoost,surge=sSurge;
  LVLFX.k+=(want-LVLFX.k)*Math.min(1,dt*(want?.5:1.1));
  LVLFX.spin+=dt*LVLFX.dir*(.012+pulse*.052+boost*.022+surge*.16); // la roue tourne d'autant plus vite que ça cogne
  LVLFX.flip+=(LVLFX.flipTo-LVLFX.flip)*Math.min(1,dt*3.2);
  const R=skyU.uRingR.value,A=skyU.uRingA.value,cc=['x','y','z','w'];
  for(let i=0;i<4;i++){const c=cc[i];if(A[c]>0){
    R[c]+=dt*(1.5+A[c]*.7);A[c]-=dt*.9;                            // l'onde déferle du zénith (0) vers l'horizon (1,57) puis meurt derrière
    if(A[c]<=0||R[c]>2.0){A[c]=0;R[c]=9;}}}
  /* LE FOND PARLE LA COULEUR DE LA ZONE. On prend l'accent des rails plutôt qu'une teinte tirée au
     hasard : le portail change la couleur de la nuit, le ciel doit changer avec elle.
     ⚠ recalculé SEULEMENT quand la zone change (comparaison d'identité) — un getHSL par frame pour
     une valeur constante, c'est le genre de gaspillage qui s'accumule. */
  if(S.acc&&LVLFX._src!==S.acc){
    LVLFX._src=S.acc;LVLFX.acc.copy(S.acc);
    const H=S.acc.getHSL(LVLFX._h);
    LVLFX.acc2.setHSL((H.h+.47)%1,Math.min(1,H.s*1.05),Math.min(.72,H.l*1.10)); // la complémentaire : assez loin pour que la bascule SE VOIE, pas assez pour renier la zone
  }
  /* L'ONDE DE COULEUR. Une vitesse qui décroît (frottement) plutôt qu'une position imposée : chaque
     frappe RELANCE le front, et entre deux coups il continue sur son erre au lieu de s'arrêter net.
     Un plancher de vitesse (.14) garantit que le ciel respire même sur un passage calme.
     ⚠ l'amplitude `hueA` FUIT en permanence (−.30/s) : sans cette fuite elle s'empilerait frappe
     après frappe et le ciel finirait en arc-en-ciel permanent — spectaculaire dix secondes, puis
     illisible. Elle monte vite (dt*4) et redescend lentement (dt*1.2) : ça monte en pression sur
     un passage dense, ça retombe sur un pont. */
  LVLFX.waveV=Math.max(.14+pulse*.30,LVLFX.waveV-dt*.55);
  LVLFX.wave+=dt*LVLFX.waveV;
  LVLFX.hueTo=Math.max(0,LVLFX.hueTo-dt*.30);
  const hueCible=Math.min(.34,LVLFX.hueTo+pulse*.10+surge*.30);
  LVLFX.hueA+=(hueCible-LVLFX.hueA)*Math.min(1,dt*(hueCible>LVLFX.hueA?4:1.2));
  /* L'ÉCLAT DES ASTRES. Le bloc CALCULE, il n'applique pas : il n'a pas le droit de connaître
     `sunSprite` ni `planetGroup` (règle du bloc balisé). Le jeu et l'atelier lisent ces deux
     nombres et les posent sur leurs objets — même valeur des deux côtés, forcément. */
  const hi=sHi;
  LVLFX.sunK=Math.min(1.6,pulse*.30+sBeat*.55+boost*.22+surge*1.10);   // le 1.61 GONFLE sur la frappe — plafonné : c'est une ÉCHELLE, pas une couleur
  LVLFX.planetK=Math.min(1.6,pulse*.35+sBeat*.45+hi*.30+surge*1.20);   // le limbe de la Terre s'embrase
  skyU.uLvl.value=LVLFX.k;
  skyU.uSpin.value=LVLFX.spin;
  skyU.uBeatK.value=Math.min(1,Math.pow(sBeat,1.35)*1.05+surge*.55); // ⚠ élevé à la puissance, comme le voile : sur un morceau dense seuls les VRAIS coups doivent ressortir
  skyU.uFlip.value=LVLFX.flip;
  skyU.uBar.value=(BCLK.ph*.25)%1;
  skyU.uHi.value=hi;
  skyU.uWave.value=LVLFX.wave;
  skyU.uHueAmp.value=LVLFX.hueA;
  skyU.uAcc.value.copy(LVLFX.acc);skyU.uAcc2.value.copy(LVLFX.acc2);
}
/* <<<FIN FOND>>> ========================================================== */
function musicTick(dt,mvt){
  if(MUSREP.att&&!paused){MUSREP.att=false;if(SND.music&&started&&running&&!gameOver)try{musicStartRun(false,true);}catch(e){}} // (2026-10-15) MUSIQUE rallumée pendant la pause : la course reprend, son morceau aussi
  try{sonTonSuit();}catch(e){} // (console de son) les sons accordés suivent la tonalité du morceau qui joue
  let target=0,beat=0,hiT=0,bsT=0,mdT=0;
  if(musicOn&&musicAna){
    musicAna.getByteFrequencyData(musicData);
    /* TROIS BANDES, PAS DEUX (2026-08-08). Les AIGUS manquaient — or c'est là que vit le tempo
       RAPIDE d'un morceau : charleston, cymbales, souffle. Avec la seule basse, le décor ne
       connaissait que la pulsation lente et restait lisse entre deux coups. Le haut du spectre
       (les 45 % supérieurs des bins) alimente désormais tout ce qui doit grésiller. */
    const nB=musicData.length;let tot=0,bass=0,mid=0,hi=0,bN=Math.max(1,(nB*.18)|0),hN=Math.max(1,(nB*.55)|0);
    for(let i=0;i<nB;i++){const v=musicData[i]/255;tot+=v;if(i<bN)bass+=v;else if(i<hN)mid+=v;else hi+=v;}
    tot/=nB;bass/=bN;mid/=Math.max(1,hN-bN);hi/=Math.max(1,nB-hN);bsT=bass;mdT=mid;
    target=Math.min(1,tot*1.7);
    beat=Math.max(0,bass-musicBass)*3.2;musicBass=bass; // transitoire = coup de grosse caisse
    hiT=Math.min(1,hi*2.3);
  }else if(musicOn){ // pas d'analyse possible ici : le décor bat sur un métronome à 120 bpm (il vit, sans lire le morceau)
    const ph=(performance.now()/500)%1;target=.45;beat=ph<.07?.8:0;hiT=.25+.2*Math.max(0,Math.sin(ph*6.2832*2));musicBass=0;bsT=ph<.2?.8:.2;mdT=.4+.25*Math.sin(ph*6.2832);
  }else {musicBass=0;hiT=0;}
  /* (2026-10-25, Sacha : « les étoiles clignotent très légèrement au rythme de la musique : des étoiles qui font les basses, des aigus, chaque style de note »)
     LES ÉTOILES JOUENT. Pour chaque bande (basses, médiums, aigus) on garde l'EXCÈS sur sa moyenne lente (≈1,5 s) : ce qui dépasse, c'est la note qui
     vient d'être frappée — le fond continu d'un morceau dense n'allume rien. Attaque vive, retombée douce. Lu par la voûte de l'orbite (cielPoussiere). */
  {const bd=musicTick._bnd||(musicTick._bnd={v:[0,0,0],m:[0,0,0]}),src=[bsT,mdT,hiT];
   for(let k=0;k<3;k++){bd.m[k]+=(src[k]-bd.m[k])*Math.min(1,dt*.7);const t=Math.min(1,Math.max(0,src[k]-bd.m[k])*4.5);bd.v[k]+=(t-bd.v[k])*Math.min(1,dt*(t>bd.v[k]?30:9));}
   skyU.uBandes.value.set(bd.v[0],bd.v[1],bd.v[2]);}
  /* ⚠ LES AIGUS MONTENT VITE ET DESCENDENT VITE. Les lisser comme l'énergie moyenne (dt*8) les
     transformerait en nappe continue : on perdrait exactement ce qu'on est venu chercher, le
     GRAIN. Attaque quasi instantanée (dt*24), retombée franche (dt*11). */
  MUSIC_HI+=(hiT-MUSIC_HI)*Math.min(1,dt*(hiT>MUSIC_HI?24:11));
  MUSIC_PULSE+=(target-MUSIC_PULSE)*Math.min(1,dt*8);        // énergie : montée/descente douce
  musicTick._bc=Math.max(0,(musicTick._bc||0)-dt);if(beat>.05){if(musicTick._bc>0)beat=0;else musicTick._bc=.34;} // (2026-10-14, chasse aux bugs · WCAG 2.3.1) 0,34 s de temps mort entre deux montées : au plus ~3 flashs/s pour le voile de beat, le ciel, le bloom et les rails (un morceau dense en faisait 8-10)
  MUSIC_BEAT=Math.max(0,MUSIC_BEAT-dt*3.4);if(beat>MUSIC_BEAT)MUSIC_BEAT=Math.min(1,beat); // beat : attaque nette, chute rapide
  musicTick._onset=beat; // la nouveauté de basse brute part telle quelle au métronome du fond (voir <<<FOND>>>)
  // ---- LE MOUVEMENT OUVRE LE SON : rouler = musique dans les oreilles, s'arrêter = filtre feutré + volume qui baisse ----
  // (mvt = 0..1 mouvement de la caisse ; la nitro/boost poussent en plus vers le plein) — « la musique n'avance pas sans toi »
  let bt=0;
  if(running&&!gameOver){ bt=Math.min(1,(mvt||0)*0.9+(nitroOn?0.22:0)+Math.min(1,boost)*0.22); }
  musicBoostEnv+=(bt-musicBoostEnv)*Math.min(1,dt*(bt>musicBoostEnv?9:3.5)); // ouverture NETTE, fermeture douce
  /* ⚠ LA MUSIQUE S'ÉCARTE QUAND L'ANNONCEUR PARLE. C'était LE défaut : `dk` duckait le moteur, le
     vent et les carillons, jamais la bande-son — donc la seule chose qui couvrait vraiment la voix
     était la seule à ne pas reculer. La constante de temps .09 s de `setTargetAtTime` fait le
     fondu toute seule : ni saut, ni pompage.
     ⚠ ET LES DEUX BRANCHES SONT GARDÉES PAR `musicMode` : le fondu de fin (`musicStop`) pose
     `musicMode='none'` AVANT de rampiller vers zéro — sans cette garde, la
     boucle réécrirait le gain à chaque image et le fondu ne descendrait jamais. */
  // v4 : le VOLUME de l'élément fait tout (iOS l'ignore — le son y joue à plein, c'est le bouton du téléphone qui règle)
  try{distTick(dt);}catch(e){}
  if(musicMode==='run')musicVolCible=musVol()*(.62+.38*musicBoostEnv)*(1-.3*Math.min(1,DIST.env));   // à l'arrêt un peu plus bas, lancé à plein
  if(window.POUCE_JEU&&POUCE_JEU.joue()){ /* (15/10) POUCE BLEU : son niveau = celui qu'aurait la radio (le curseur, le souffle du mouvement, l'annonceur), le moteur du jeu le pilote ; la musique coupée l'éteint */
    if(!SND.music)POUCE_JEU.fin(false);
    else{const fr9=musicMode==='run'&&!!FRENM.sw; /* (15/10 soir, Léo : « la frénésie doit rester ») le morceau de la FRÉNÉSIE joue : Pouce bleu s'efface (~0,3 s), puis revient */
      const b9=VOL.mus/.62*PBJ_NIV*(musicMode==='run'?(.62+.38*musicBoostEnv):.62);
      POUCE_JEU.niveau(fr9?0:b9*pbjPlancher(dt,b9,PBJ_FORCE||(musicMode==='run'&&running?pbjTier(engTier+1):1))); /* (2026-10-16) LE PLANCHER DU DÉPART (pbjPlancher) */if(musicMode==='run'){POUCE_JEU.moteur(PBJ_FORCE||pbjTier(engTier+1));if(!fr9)musicVolCible=0;}}}
  else if(musicMode==='menu'){musicVolCible=musVol()*.5;                   // le menu : en fond
    if(DEPMUS.on&&GAR.go)musicVolCible*=Math.max(0,1-(GAR.go.t||0)/1.5);          // (LE DÉPART EN MUSIQUE) il s'EFFACE pendant le piqué de JOUER…
    if(DEPMUS.sort){const d9=performance.now()-DEPMUS.sort;if(d9>3000)DEPMUS.sort=0;else musicVolCible*=Math.max(0,1-d9/350);}} // …et sous le fondu au noir du REJOUER
  {const bq9=!BQ_MUSIQUE&&musicMode==='menu'&&typeof GBQ!=='undefined'&&!!GBQ.veut; /* (2026-10-16, Sacha) la musique SUIT en boutique : ce silence ne vaut plus qu'avec ?boutique=muette (voir BQ_MUSIQUE) */ /* (2026-10-13, Léo, dans la boutique : « le sound design est terrifiant, change ou enlève ») LA BOUTIQUE SE TAIT : la musique du
     lobby s'efface en fondu dès qu'on touche BOUTIQUE et revient au retour (seuls les petits clics restent) ; sur iPhone (volume en lecture seule) elle se met en pause */
   /* (2026-10-14) LE CIEL (LA CHUTE, l'écran titre) : d'abord muet (« la musique se lance quand j'appuie sur le mode garage »), puis, le
      même soir (Léo : « le vent est fort ; joue la musique de fond derrière le vent, mais moins fort que dans le garage ») : la musique
      joue au ciel, à MUS_CIEL du niveau du garage, DERRIÈRE la chute libre douce. Seule la boutique se tait encore. (iPhone : le volume
      d'un <audio> y est verrouillé — la musique y joue au même niveau partout, comme avant.) */
   /* (2026-10-14, session SON, relevé par GENERAL) DEUX CIELS QUI MENTAIENT. (1) Volume verrouillé SANS MUS_WA (iPhone < iOS 17, MUS_WA
      condamnée, avant le 1er toucher) : MUS_CIEL ne peut rien, le lobby jouait au ciel à plein, PAR-DESSUS une chute douce baissée de −8 dB
      pour passer sous lui — le mix inverse de celui que Léo a demandé. Là, le ciel se tait comme la boutique (le 1er choix de Léo : « la
      musique se lance au garage ») ; dès que MUS_WA se branche, elle revient en fondu. (2) SON coupé, MUSIQUE allumée : pas de vent du tout
      (chuteDoux exige SND.sfx), et la musique restait à −16/−22 dB « derrière » ce vent absent — un ciel presque muet. Sans vent, plus de
      MUS_CIEL : le niveau du garage. */
   const ciel9=musicMode==='menu'&&typeof CHUTE!=='undefined'&&!!CHUTE.on,cielV9=ciel9&&VOL_LOCKED&&!musWaTient(),tait9=bq9||cielV9;MUS_TAIT=tait9;
   if(ciel9&&SND.sfx&&!(MUSAP.t>performance.now())){const h9=(typeof CHDOUX!=='undefined'&&CHDOUX.h)||.78;musicVolCible*=MUS_CIEL*Math.max(.5,1-(h9-.78)*1.6);} // la rafale la couvre, l'accalmie la ramène : on l'entend de loin, en tombant — (2026-10-14, session SON) sauf pendant l'extrait du curseur MUSIQUE : 1,4 s au niveau du garage, le vrai volume réglé
   if(musicMode==='menu'&&!tait9&&musicEl&&musicEl.src&&!musicTick._pz){const u9=musicMenuUrl(); // LA MUSIQUE DU LIEU (ciel ↔ garage)
     if(u9&&musicEl.src!==MENU_MUS.abs(u9)){musicVolCible=0;                       // on a changé de lieu : la musique d'avant s'efface…
       if((VOL_LOCKED&&!musWaTient())||musicVolCour<.015||musicEl.paused)playMusic(u9,{loop:true,volume:0});}} // …puis celle du lieu prend sa place, en fondu depuis zéro (iPhone sans MUS_WA : franche)
   if(tait9){musicVolCible=0;if(!musicTick._pz&&((VOL_LOCKED&&!musWaTient())||musicVolCour<.012)){ /* (2026-10-14, session SON) branchée en WebAudio, l'iPhone fait comme l'ordi : un fondu, puis la pause */musicTick._pz=true;musicPause(true);}}
   else if(musicTick._pz){musicTick._pz=false;musicVolCour=0;musicPause(false);} // on rentre au garage : elle repart, en fondu depuis zéro
   musicTick._bq=bq9;}
  if(ECOLE.f0){ /* (2026-10-16) la musique de la leçon cède à Pouce bleu au portail d'après : une courbe douce sur ECOLE.ms, puis la pause */
    const k7=(performance.now()-ECOLE.f0)/ECOLE.ms;
    if(musicMode!=='run'||!musicOn)ECOLE.f0=0;
    else if(k7>=1){ECOLE.f0=0;stopMusic();}
    else{musicVolCible=ECOLE.v0*(1-k7)*(1-k7);musicVolCour=musicVolCible;}}
  if(DEPMUS.f0>=0&&musicMode==='run'){const k9=(performance.now()-DEPMUS.f0)/(DEPMUS.fondu*1000); // (LE DÉPART EN MUSIQUE) l'entrée en fondu : une courbe en S, pas le ressort ordinaire (il bondissait de 0 à 60 % en 0,15 s)
    if(k9>=1)DEPMUS.f0=-1;else musicVolCour=musicVolCible*k9*k9*(3-2*k9);}
  if(MUSAP.joue){ /* (2026-10-14, session SON) l'extrait du curseur MUSIQUE ouvert depuis la PAUSE (voir musApercu) : fondus en temps RÉEL
     (0,25 s d'entrée, 0,35 s de sortie — le dt du jeu ne sert à rien ici), puis l'élément se rendort au niveau d'avant (la reprise repart
     comme avant, pas de zéro) et le contexte aussi s'il a été réveillé pour lui. REPRENDRE pendant l'extrait : la course garde la musique. */
    const r9=MUSAP.t-performance.now(),c9=musicVolCible;
    if(!paused)MUSAP.joue=false;
    else if(r9<=0||document.hidden||!musicEl||musicEl.paused){MUSAP.joue=false;musicVolCour=c9;try{if(musicEl&&!musicEl.paused)musicEl.pause();}catch(e){}
      if(MUSAP.rev){MUSAP.rev=false;try{if(window.__setPause&&AC&&AC.state==='running')AC.suspend();}catch(e){}}} // (seulement réglages ouverts : jamais pendant le compte 3-2-1, qui réveille le contexte pour ses bips)
    else{musicVolCible=c9*Math.max(0,Math.min(1,(1400-r9)/250,r9/350));musicVolCour=musicVolCible;}}
  if(musicMode!=='none'){if(!(DEPMUS.f0>=0))musicVolCour+=(musicVolCible-musicVolCour)*Math.min(1,dt*6);
    if(musWaTient()){try{stt(MUS_WA.g.gain,Math.max(0,Math.min(MUS_WA.MAX,musicVolCour)),AC.currentTime,.03);}catch(e){}try{musWaGarde();}catch(e){}
      if(!VOL_LOCKED&&musicEl&&musicEl.volume!==1)try{musicEl.volume=1;}catch(e){} // (15/10) volume libre : l'élément reste à 1 (le graphe règle)
      if(MUS_WA.bus)MUS_WA.bus.course(musicMode==='run'&&running&&!gameOver);} // (15/10) en course, la musique laisse sa place au moteur (−2 dB vers 280 Hz) // (2026-10-14, session SON) branchée : le volume passe par le gain du graphe (curseur, ciel, fondus, sonie) — et le chien de garde écoute
    else if(musicEl&&!musicEl.paused&&!VOL_LOCKED){try{const v9=Math.max(0,Math.min(1,musicVolCour));if(Math.abs(musicEl.volume-v9)>.002)musicEl.volume=v9;}catch(e){}}}
  // BOOST : le morceau S'AMPLIFIE — bass boost + chorus qui épaissit (distinct du filtre-mouvement)
  const boostAmt=(running&&!gameOver)?Math.min(1,(nitroOn?0.85:0)+Math.min(1,boost)*0.5):0;
  musChorusEnv+=(boostAmt-musChorusEnv)*Math.min(1,dt*6);
  /* ⚠ RELIQUAT CORRIGÉ (2026-08-07) : `lvlK` lisait `level`, c'est-à-dire l'index de la CAISSE —
     depuis qu'on la choisit au garage, l'intensité du ciel dépendait donc de la carrosserie
     équipée, pas de la progression. Elle suit désormais le PALIER MOTEUR, la seule vraie
     progression d'une partie (même famille de bug que l'overdrive et le timbre moteur). */
  /* FIN DE NIVEAU : un embrasement bref qui se superpose au pouls et retombe tout seul. Il passe
     par les MÊMES canaux (ciel, bloom, rails) plutôt que par un effet à part : le joueur reconnaît
     le langage visuel du jeu poussé à fond, au lieu de découvrir une animation étrangère. */
  if(NIVEAU_FX>0)NIVEAU_FX=Math.max(0,NIVEAU_FX-dt);
  const surge=NIVEAU_FX>0?Math.min(1,NIVEAU_FX/2.6):0;
  const lvlK=(1+Math.min(1.3,(typeof engTier!=='undefined'?engTier:0)*.028))*(1+surge*1.5);
  const cielMus=!LVL.cur||LVL.cur.cielMusical; // NIVEAUX : le ciel ne joue la musique qu'au niveau VILLE (nuages : ciel calme, orbite : noir complet)
  skyU.uPulse.value=cielMus?Math.min(1.7,(MUSIC_PULSE*.5+MUSIC_BEAT*.6)*lvlK*(1+musicBoostEnv*.5)):0; // LE CIEL RESPIRE + COGNE au boost (plafonné)
  if(bloomPass){if(musicTick._bloom==null)musicTick._bloom=bloomPass.strength;
    bloomPass.strength=musicTick._bloom*(1+MUSIC_BEAT*.6*lvlK+musicBoostEnv*.3)*(1-.55*GLARE);} // et le bloom cogne au beat + au boost — et se RETIENT quand l'œil est ébloui (voir GLARE)
  /* LE FOND DU NIVEAU : roue, ondes, lueur, piliers — tout ce qui joue la musique dans le ciel.
     On lui PASSE le monde plutôt qu'il n'aille le chercher : c'est ce qui garde le bloc <<<FOND>>>
     exécutable dans l'atelier. L'accent vient des rails, donc le ciel et la piste sont toujours de
     la même couleur — sans avoir à répéter la règle à deux endroits. */
  lvlTick(dt,{onset:musicTick._onset||0,pulse:MUSIC_PULSE,beat:MUSIC_BEAT,hi:MUSIC_HI,boost:musicBoostEnv,surge:surge,
    on:(musicOn&&musicMode==='run'&&running&&!gameOver&&cielMus),
    acc:(NEON_RAILS.length&&NEON_RAILS[0].userData.base)||null});
  /* LES ASTRES PRENNENT LA MUSIQUE. `lvlTick` a calculé l'éclat, on le POSE ici sur les objets —
     le bloc <<<FOND>>> ne connaît ni le soleil ni la planète, c'est la règle qui garde l'atelier
     vivant. ⚠ le soleil se pilote en ÉCHELLE et en COULEUR, jamais en opacité : l'opacité
     appartient aux biomes (`bioApply`), et se la disputer le ferait clignoter à chaque portail. */
  const gk=LVLFX.k;
  if(sunSprite&&sunSprite.userData.base){
    const s=sunSprite.userData.base*(1+LVLFX.sunK*.30*gk);
    sunSprite.scale.set(s,s,1);
    const b=1+LVLFX.sunK*1.05*gk;sunSprite.material.color.setRGB(b,b*(1-LVLFX.sunK*.05*gk),b*(1-LVLFX.sunK*.10*gk)); // il ROUGIT en gonflant : une étoile qui pousse vire au chaud
  }
  if(planetGroup&&planetGroup.userData.halo){
    const p=LVLFX.planetK*gk;
    planetGroup.userData.halo.material.opacity=Math.min(.72,.10+p*.42);
    planetGroup.userData.atmo.material.opacity=Math.min(.80,.20+p*.34);
    planetGroup.userData.halo.material.color.copy(LVLFX.acc).lerp(LVLFX.acc2,LVLFX.flip).lerp(PLANET_BLEU,1-Math.min(1,p*.9)); // au repos le limbe reste BLEU (c'est la Terre) ; il prend l'accent quand ça cogne
  }
  /* ---- LES RAILS NÉON COGNENT AU BEAT (2026-08-07) --------------------------------------------
     Le pari « épique mais jouable » se joue ICI plutôt que dans un effet plein écran : les rails
     bordent la route, donc les faire pulser rend la piste PLUS lisible au lieu de la noyer. Un
     flash global, lui, aurait été spectaculaire trois secondes puis insupportable — et aveuglant
     pile au moment où l'on vise une réception.
     ⚠ deux garde-fous : (1) on repart TOUJOURS de la teinte d'accent mémorisée (`userData.base`),
     jamais de la couleur courante — sinon chaque frame multiplie la précédente et le néon part au
     blanc en une seconde ; (2) le beat seul pilote, pas l'énergie moyenne : sur un morceau dense
     l'énergie ne redescend jamais et les rails resteraient allumés à fond, ce qui ne pulse plus. */
  /* ---- CAMÉLÉON + STROBOSCOPE (2026-08-07) ----------------------------------------------------
     `chamT` fait TOURNER la teinte des rails. Sa VITESSE suit l'énergie du morceau : au calme la
     couleur dérive à peine, et quand ça part en vrille elle défile. C'est ce couplage — la vitesse,
     pas la teinte — qui rend l'effet « harmonieux » plutôt qu'épileptique : la couleur ne saute
     jamais, elle accélère.
     Le STROBE, lui, ne suit QUE la grosse caisse (`MUSIC_BEAT`), jamais l'énergie moyenne : sur un
     morceau dense l'énergie ne redescend pas et un strobe branché dessus resterait allumé — ce qui
     ne stroboscope plus, ça éblouit. Et il est élevé à la puissance : seuls les VRAIS coups
     ressortent, les petits passent inaperçus.
     ⚠ le tout est borné et cantonné aux BORDS (voir #beatFx) : on garde le jeu jouable. */
  MUSIC_CHAM+=dt*(0.10+MUSIC_PULSE*1.15+musicBoostEnv*0.5+surge*3.2); // la teinte défile d'autant plus vite que ça cogne — et s'emballe à la fin du niveau
  const frappe=Math.min(1,Math.pow(MUSIC_BEAT,1.6)+surge*.55);  // seuls les gros coups comptent (+ l'embrasement de fin)
  const kb=MUSIC_BEAT*.85+musicBoostEnv*.15;
  /* ⚠ LE CAMÉLÉON OSCILLE, IL NE DÉRIVE PAS. Une rotation continue finissait par emmener la teinte
     n'importe où et effaçait l'ACCENT DE ZONE (la couleur tirée à chaque portail, qui est l'identité
     visuelle du secteur). Ici la teinte va-et-vient AUTOUR de l'accent, et c'est l'AMPLITUDE qui
     suit la musique : au calme elle bouge à peine (±0,05 → on reste sur la couleur de la zone),
     et quand ça part en vrille elle balaie presque tout le spectre. C'est exactement la demande —
     caméléon quand la musique s'emballe — sans sacrifier la lecture des zones. */
  // ⚠ 0,05 de repos était DÉJÀ trop : mesuré, l'orange d'une zone virait au jaune sans que rien ne
  // joue (écart 0,277 sur le canal vert). À 0,018 la couleur de zone reste elle-même, et c'est
  // bien la MUSIQUE qui ouvre le balayage — ce qu'on veut : caméléon quand ça part en vrille.
  const ampl=0.018+MUSIC_PULSE*0.44+musicBoostEnv*0.10+surge*0.48;
  const hueOff=Math.sin(MUSIC_CHAM*0.62)*ampl;
  const cham=musicTick._c||(musicTick._c=new THREE.Color());
  for(let i=0;i<NEON_RAILS.length;i++){
    const m=NEON_RAILS[i],b=m.userData.base;
    if(!b)continue;
    if(!m.userData.hsl)m.userData.hsl=b.getHSL({h:0,s:0,l:0}); // la teinte d'accent de la zone, mesurée une fois
    const H=m.userData.hsl;
    // CAMÉLÉON : on part TOUJOURS de la teinte mémorisée + un décalage — jamais de la couleur
    // courante, sinon la dérive s'accumule et le néon part au blanc en quelques secondes.
    cham.setHSL(((H.h+hueOff)%1+1)%1, Math.min(1,H.s*(1+frappe*.35)), Math.min(.75,H.l*(1+kb*1.15))); // ⚠ (x%1+1)%1 : le sinus rend du NÉGATIF, et setHSL n'accepte pas une teinte négative
    m.color.copy(cham);
  }
  for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i],b=m.userData.base;
    if(b!=null)m.opacity=Math.min(1,b*(1+kb*.75));}
  bordsTick(); // (2026-10-14, bords-route) le rail ne suit plus la musique en teinte : chanfrein de béton de jour, rail blanc doux de nuit
  // LE VOILE DE BORD : il prend la teinte du caméléon et flashe sur la frappe
  if(beatFxEl){
    const op=Math.min(.5,frappe*.62+musicBoostEnv*.06);
    if(op>.012||beatFxEl.style.opacity!=='0'){
      cham.setHSL((hueOff%1+1)%1,.85,.55);
      beatFxEl.style.color='#'+cham.getHexString();
      beatFxEl.style.opacity=op.toFixed(3);
    }
  }
}
// hooks console : brancher/tester avant l'arrivée des vrais fichiers
window.playMusic=playMusic;window.stopMusic=stopMusic;
window.musicStartRun=musicStartRun;window.musicMenu=musicMenu;window.musicStop=musicStop;
window.dbgAudio=function(){const g=n=>(n&&n.gain)?+n.gain.value.toFixed(4):null;return{
  // LA CHARGE en premier : c'est elle qu'on vient vérifier. À fond en reprise elle doit frôler 1,
  // stabilisé retomber vers .25-.35, et gaz lâchés tomber à 0 pendant que `ovr` monte.
  charge:+charge9.toFixed(2),ovr:+ovr9.toFixed(2),rpm:+engRpm.toFixed(2),gear:engGear,
  drive:g(engPre),rattrapage:g(engPost),antiFatigue:engEq?+engEq.gain.value.toFixed(1):null,
  chuffs:g(engTickG),rose:g(pinkG),boite:g(transG),pont:g(diffG),freinMoteur:g(ovrG),
  palier:engLvl+1,voix:(ENG_SND[engLvl]||{}).gr>1?'pistons':'turbine',
  eng:g(gainN),wind:g(windG),whine:g(engWhineG),skid:g(skidG),siren:g(sirG),lfo:g(engLfoG),
  music:g(musicGain),sfx:g(musicSfxGain),acState:AC?AC.state:'no-AC',
  survOn:(typeof SURV!=='undefined')?SURV.on:'?',mode:mode,running:running,nitroOn:nitroOn};};
/* `dbgDeath()` — joue un son de mort sans avoir à mourir, et rend le tirage. `dbgDeath(n)` force
   l'index n. Sans ça, vérifier « est-ce que les 4 sortent et jamais deux fois de suite » demanderait
   de se tuer une vingtaine de fois. */
window.dbgDeath=function(n){
  if(n!=null&&DEATH_LIB[n]){deathLast=-1;const s=Math.random;Math.random=()=>n/DEATH_LIB.length;deathSound();Math.random=s;}
  else deathSound();
  return {joue:DEATH_LIB[deathLast]?DEATH_LIB[deathLast].f:null,index:deathLast,
    sons:DEATH_LIB.map(d=>({f:d.f,vol:d.v,max:d.max,absent:!!d.dead})),sfx:SND.sfx};
};
// …et l'état du son en cours : les Audio ne sont PAS dans le DOM, rien ne les observe de l'extérieur
window.dbgDeathNow=function(){const a=deathEls[0];
  if(a&&!(a instanceof HTMLMediaElement))return {webaudio:true}; // (console de son) une mort décodée joue en WebAudio
  return a?{t:+a.currentTime.toFixed(2),vol:+a.volume.toFixed(3),enPause:a.paused,fini:a.ended}:null;};
/* `dbgAura()` — l'état de la NOUVELLE ÉCONOMIE : banque, aura, rang, et pour chaque caisse la voie
   par laquelle elle s'obtient. C'est le seul moyen de vérifier d'un coup qu'aucune caisse n'est
   devenue inatteignable — le genre d'erreur qui ne se voit qu'après vingt parties.
   `dbgAura(banque, aura)` force les deux compteurs pour tester le garage sans farmer. */
window.dbgAura=function(b,a){
  if(b!=null){SAVE.d.bank=Math.max(0,+b||0);SAVE.flush();}
  if(a!=null){SAVE.d.aura=Math.max(0,Math.round(+a)||0);SAVE.flush();}
  const n=auraNext();
  return {
    banque:bank(),auraTotale:SAVE.d.aura||0,auraDeCePartie:Math.round(auraRun),
    rang:auraRankName(),rangIndex:auraRank(),
    prochainRang:n?n.n+' dans '+Math.round(n.reste)+' d\'aura':'rang maximal',
    possedees:(SAVE.d.owned||[]).slice(),
    caisses:CARS.map((c,i)=>{const u=CAR_UNLOCK[i];
      return {i:i,nom:c.name,
        voie:!u?'offerte':(u.p?'achat':(u.k==='prem'?'premium':'défi '+u.k)),
        prix:carPrice(i)||null,ouverte:carUnlocked(i)};})
  };
};
/* `dbgFig(n)` — enchaîne n figures par le VRAI chemin du combo, et rend le détail gain par gain.
   C'est la seule façon de juger la courbe d'un enchaînement sans réussir sept figures d'affilée
   manette en main. `dbgFig()` avance aussi la fenêtre si on lui passe un délai. */

// `dbgDauphin(impU,v,vl,lat0)` : un VRAI décollage (startFall) depuis la position courante — impU 60 ≈ 3,6 s de vol ; v = vitesse le long
// de la piste ; vl = dérive latérale ; lat0 = départ dans la largeur · `dbgDauphin('boom')` explose en vol. (2026-10-15) Les dauphins sont
// partis du jeu (Léo) ; le nom reste : les bancs s'en servent pour décoller.
window.dbgDauphin=function(a,b,c,d){
  if(a==='boom'){explode();return window.dbgState();}
  if(!started||gameOver)return 'pas de course en cours';
  if(mode!=='drive')return 'déjà en vol : '+mode;
  lat=d||0;vA=b||15;vL=c||0;startFall(a||60,1);return window.dbgState();
};
window.dbgMusic=function(){return {on:musicOn,pulse:+MUSIC_PULSE.toFixed(3),beat:+MUSIC_BEAT.toFixed(3),sky:+skyU.uPulse.value.toFixed(3),
  boostEnv:+musicBoostEnv.toFixed(3),filtHz:musicFilt?Math.round(musicFilt.frequency.value):null,mode:musicMode};};
/* `dbgLvl()` — l'état du FOND DU NIVEAU : présence, tempo verrouillé, phase, roue, ondes vivantes.
   `dbgLvl(1)` force le décor à fond sans musique (pour juger l'esthétique à l'arrêt).
   ⚠ le BPM affiché n'a de sens que si `conf` est haute : à 0 l'horloge tourne à vide sur 120. */
window.dbgLvl=function(force){
  if(force!=null){LVLFX.k=Math.max(0,Math.min(1,+force||0));skyU.uLvl.value=LVLFX.k;}
  const A=skyU.uRingA.value,R=skyU.uRingR.value,c=['x','y','z','w'],on=[];
  for(let i=0;i<4;i++)if(A[c[i]]>0)on.push({r:+R[c[i]].toFixed(2),a:+A[c[i]].toFixed(2)});
  return {presence:+LVLFX.k.toFixed(3),horloge:+BCLK.t.toFixed(2),bpm:Math.round(60/Math.max(.05,BCLK.per)),confiance:+BCLK.conf.toFixed(2),
    temps:BCLK.n,phaseMesure:+skyU.uBar.value.toFixed(2),roue:+LVLFX.spin.toFixed(3),sens:LVLFX.dir,
    bascule:+LVLFX.flip.toFixed(2),frappe:+skyU.uBeatK.value.toFixed(3),ondes:on,
    aigus:+skyU.uHi.value.toFixed(3),ondeCouleur:+LVLFX.wave.toFixed(2),vitesseOnde:+LVLFX.waveV.toFixed(3),
    amplitudeTeinte:+LVLFX.hueA.toFixed(3),eclatSoleil:+LVLFX.sunK.toFixed(2),eclatTerre:+LVLFX.planetK.toFixed(2),
    echelleSoleil:Math.round(sunSprite.scale.x),limbe:+planetGroup.userData.halo.material.opacity.toFixed(3),
    accent:'#'+LVLFX.acc.getHexString(),bascule2:'#'+LVLFX.acc2.getHexString()};
};
window.dbgPlanetLook=function(){ // MODE PHOTO : braque la caméra sur la planète, rend, et MESURE ses couleurs
  camera.lookAt(planetGroup.position);camera.updateMatrixWorld();
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  const bw=renderer.domElement.width,bh=renderer.domElement.height;
  const gl=renderer.getContext(),buf=new Uint8Array(bw*bh*4);
  gl.readPixels(0,0,bw,bh,gl.RGBA,gl.UNSIGNED_BYTE,buf);
  const dPx=2*PLANET_R/planetGroup.position.distanceTo(camera.position)/(2*Math.tan(camera.fov*Math.PI/360))*bh;
  let bleu=0,vert=0,n=0,R=Math.max(6,Math.round(dPx*.30)),cx=bw>>1,cy=bh>>1,r0=0,g0=0,b0=0; // DANS le disque seulement
  for(let y=cy-R;y<cy+R;y+=2)for(let x=cx-R;x<cx+R;x+=2){
    const i=((bh-1-y)*bw+x)*4,r=buf[i],g=buf[i+1],b=buf[i+2];n++;r0+=r;g0+=g;b0+=b;
    if(b>r+18)bleu++;if(g>r+12)vert++;
  }
  const avec=[r0/n|0,g0/n|0,b0/n|0];
  // TEST DIFFÉRENTIEL : on re-rend SANS la planète — si l'image ne change pas, c'est qu'on ne la voit pas
  planetGroup.visible=false;
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);
  gl.readPixels(0,0,bw,bh,gl.RGBA,gl.UNSIGNED_BYTE,buf);
  let r1=0,g1=0,b1=0,n1=0;
  for(let y=cy-R;y<cy+R;y+=2)for(let x=cx-R;x<cx+R;x+=2){const i=((bh-1-y)*bw+x)*4;r1+=buf[i];g1+=buf[i+1];b1+=buf[i+2];n1++;}
  planetGroup.visible=true;
  const sans=[r1/n1|0,g1/n1|0,b1/n1|0];
  return Object.assign(window.dbgPlanet(),{avec,sans,
    difference:Math.abs(avec[0]-sans[0])+Math.abs(avec[1]-sans[1])+Math.abs(avec[2]-sans[2]),
    pctBleu:Math.round(100*bleu/n),pctVert:Math.round(100*vert/n)});};
window.dbgPlanet=function(){const v=planetGroup.position.clone().project(camera);
  const W=renderer.domElement.width,H=renderer.domElement.height;
  return {ecran:[Math.round((v.x*.5+.5)*W),Math.round((1-(v.y*.5+.5))*H)],dansLeCadre:(Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1),
    tailleEcranPx:Math.round(2*PLANET_R/planetGroup.position.distanceTo(camera.position)/(2*Math.tan(camera.fov*Math.PI/360))*H),buffer:[W,H]};};
window.dbgBoom=function(){explode();return {variante:BOOMV.n,rings:BOOMV.rings,volutes:VOLU.filter(p=>p.on).length,dards:DARD.filter(p=>p.on).length};}; // déclenche une mort et dit quelle signature est sortie
/* `dbgTakeoff(face)` — force un décollage. `face=-1` teste la FACE DU DESSOUS, le cas qui faisait
   traverser la dalle. ⚠ ce qu'il faut lire, c'est `vitesseSurNormale` : elle doit être POSITIVE
   (on s'éloigne du bitume). `vy` en Y monde, lui, est NÉGATIF sous la route — et c'est normal. */
window.dbgTakeoff=function(face){
  if(face)side=face<0?-1:1;
  const a=mode,sd=side;
  heistFire();
  frameAt(s,F);const nn=F.n.clone();if(sd<0)nn.multiplyScalar(-1);
  const vn=fallVel.dot(nn);
  return {avant:a,apres:mode,face:sd,
    vitesseSurNormale:+vn.toFixed(1), sEloigneDuBitume:vn>0,
    vyMonde:+fallVel.y.toFixed(1),slowT:+slowT.toFixed(2),fever:+fever.toFixed(1)};
};
window.dbgDrift=function(){return {driftYaw:+driftYaw.toFixed(3),degres:Math.round(driftYaw*57.3),nitro:nitroOn,mode:mode,kmh:Math.round(Math.abs(vA)*3.6*SPD)};};
// LA SIGNATURE D'ÉCHAPPEMENT, en lecture seule. Sans ce hook, vérifier qu'une caisse crache bien
// SA couleur demandait de regarder l'écran — impossible en test automatisé, et à l'œil on confond
// vite « le vert ne marche pas » avec « la caisse équipée n'est pas la bonne ».
// (vague 3) `dbgNitro(r,x)` : pose la réserve (r = orange, x = bidons bleus — pour photographier la réserve bleue) · sans argument : l'état du COUP
window.dbgNitro=function(r,x){if(r==='bords'){NFX.dbgB=x;return 'bords ×'+x;} // `dbgNitro('bords',0)` : éteint la teinte des bords (photo A/B)
  if(r==='vent'){ventN.masque=!x;ventN.mesh.visible=!!x;return 'vent '+(x?'visible':'masqué');} // `dbgNitro('vent',0)` : masque les stries de vent
  if(r!=null)nitroR=+r;if(x!=null)nitroX=+x;
  return {nitroR:+nitroR.toFixed(2),nitroX:+nitroX.toFixed(2),on:nitroOn,bleu:nitroBlue,ign:+NFX.ign.toFixed(2),ignK:+NFX.ignK.toFixed(2),off:+NFX.off.toFixed(2),
    len:+NFX.len.toFixed(2),bords:+NFX.edge.toFixed(2),onde:NFX.ring.visible,vent:(function(){let c=0;for(let i=0;i<ventN.n;i++)if(ventN.life[i]>0)c++;return c;})(),
    fov:+camera.fov.toFixed(1),fovPunch:+fovPunch.toFixed(1),plume:JETS.shells.length?+JETS.shells[0].scale.z.toFixed(2):0};};
// billets de dollars qui volettent
const billNoteTex=(function(){
  const cv=document.createElement('canvas');cv.width=64;cv.height=32;
  const c=cv.getContext('2d'),tx=new THREE.CanvasTexture(cv);
  // (vague 2 « L'ENCRE ET L'OR ») le billet porte le LISERÉ d'encre de tout ce qui rapporte, et ses chiffres sont en OR (plus de vert layette)
  apresPolice(function(){c.fillStyle='#1c0430';c.fillRect(0,0,64,32);c.fillStyle='#2f9a52';c.fillRect(2,2,60,28);
  c.strokeStyle='#7fd89a';c.lineWidth=2;c.strokeRect(5,5,54,22);
  c.fillStyle='#ffd75e';c.font='8px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
  c.fillText('$',13,17);c.fillText('100',39,17);tx.needsUpdate=true;});
  return tx;
})();
const billGeo=new THREE.PlaneGeometry(.5,.25);
const billNoteM=new THREE.MeshBasicMaterial({map:billNoteTex,side:THREE.DoubleSide});
