/* ===== (2026-10-14) LA PASSE SENSATIONS — LES TROIS OUTILS COMMUNS =====
   Sacha : « rajoute des petits détails qui améliorent les sensations — bumps, collisions, explosions, l'eau… sans changer le gameplay ».
   Tout détail de la passe passe par eux : ils ne touchent QUE ce qu'on voit et ce qu'on sent dans la main, jamais la trajectoire.
   · sensCoup(versLat, nez, pompe) : un COUP dans la carrosserie, en impulsions sur ses ressorts (elle encaisse, dépasse à peine, se repose ;
       les roues restent au sol). versLat (rad/s) : > 0 = elle penche vers le côté où `lat` est positif · nez (rad/s) : > 0 = le nez plonge,
       < 0 = il se lève · pompe (m/s) : < 0 = elle s'écrase sur ses roues, > 0 = elle se soulève. Repères : 1 rad/s ≈ 2,5° de roulis, 1 rad/s ≈
       2,6° de tangage, −1 m/s ≈ 4 cm d'écrasement. Au sol seulement (en vol la carrosserie est au repos : rien ne se voit, rien ne reste).
   · sensHap(p, force) : la vibration, avec un LIMITEUR commun (force 1 léger · 2 moyen · 3 lourd) — jamais deux en moins de 70 ms, et un
       coup faible ne passe pas dans les 220 ms qui suivent un coup plus fort (dix détails qui vibrent chacun = un bourdonnement).
   · sensSecoue(k) : une petite secousse de caméra, plafonnée (.4), moitié en vol (on y vise), rien sous « Réduire les animations ». */
const SCOUP={p:0,pv:0,ht:0,hf:0,hop:0,hopP:false}; // le tangage EN PLUS du jeu (rad, rad/s) — le roulis et le débattement ont déjà leurs ressorts (rollV, susV) · ht/hf : la dernière vibration · hop/hopP : la hauteur du petit saut en cours (dos d'âne, replacement) et s'il porte une pose déclarée en l'air
function sensCoup(versLat,nez,pompe){if(!SENS||mode!=='drive')return;rollV=THREE.MathUtils.clamp(rollV-(versLat||0),-5,5);SCOUP.pv=THREE.MathUtils.clamp(SCOUP.pv+(nez||0),-4,4);susV=THREE.MathUtils.clamp(susV+(pompe||0),-4,4);}
SCOUP.vp=0;SCOUP.vt=0;SCOUP.fp=0;SCOUP.fh=0; // (2026-10-14, œil · pose) fp/fh : la récompense du PARFAIT (1 parfait · 2 divin) et son gel, qui attendent le contact eux aussi // (2026-10-14, gameplay · accord) la vibration du verdict de pose qui attend le contact (motif, heure) — voir tryLand
function sensHap(p,force){if(!SENS)return;const t=performance.now(),f=force||1;if(t-SCOUP.ht<(f>=SCOUP.hf?70:220))return;if(t-(hap._t||-1e9)<70&&(hap._k||0)>=f)return;SCOUP.ht=t;SCOUP.hf=f;hap(p);}
/* (2026-10-14, gameplay · accord) LA MAIN N'A QU'UNE VOIX PAR ÉVÉNEMENT. Le limiteur ne voyait que les vibrations de la passe : un détail
   SENS pouvait doubler, à la même image, le coup que le jeu venait de donner (le braquage qui arrache la caisse : [16,40,16] PUIS le tic
   du décollage). `hap` note désormais l'heure de sa dernière impulsion (`hap._t`) et un détail SENS se TAIT dans les 70 ms qui suivent
   une vibration du jeu AU MOINS aussi forte (`hap._k`) : le geste d'origine garde la parole — un tic de pièce ne fait pas taire une pose. L'échelle, la même partout (sol, air, eau, menu) — le Taptic d'iOS
   la lit ainsi (hap) : TIC LÉGER ≤ 12 ms (une lèvre, une crête, une pièce, une petite retombée) · COUP NET 14-24 ms (une pose, un bump,
   une porte, la lèvre rattrapée) · COUP LOURD ≥ 45 ms (la pose lourde, la flaque, la mort) · MOTIF DOUBLE [coup, 20-40 ms, coup] pour
   les gestes à deux temps (la catapulte, le saut nitro, la figure, le train de boosts, la panne sèche). */
function sensSecoue(k){if(!SENS||REDUCED_MOTION)return;shake=Math.max(shake,Math.min(.4,k)*(mode==='fall'?.5:1));}
/* (2026-10-14, sensations · glisse) LA GLISSE SE SENT DANS LA TÔLE. Le drift avait déjà ses étincelles, sa fumée, son roulis (+4°) et ses
   vibrations de palier — mais l'ACCROCHE (l'instant où l'arrière décroche) ne faisait rien : le roulis et le nez s'installaient en fondu.
   `sensGlisse` regarde seulement l'état que `driftTick` va traiter (on, driftLv, slipB) et répond par les outils communs : elle ne
   calcule RIEN du jeu. `ta` : l'heure de la dernière sortie (une glisse qui clignote ne recogne pas). */
const SENS_GL={on:false,ta:0};
SENS_GL.pk=0;SENS_GL.sg=0;SENS_GL.arm=false;SENS_GL.lv=0; // (reprise d'adhérence) le plus grand angle de glisse tenu, son côté, et « une reprise est due »
function sensGlisse(on){
  if(on&&!SENS_GL.on){ // L'ACCROCHE : l'arrière part — la caisse se jette sur ses roues extérieures, le nez pique, elle se tasse ; un tic dans le pouce
    if(performance.now()-SENS_GL.ta>260){
      if(!REDUCED_MOTION)sensCoup(-Math.sign(steer)*1.3,.8,-.45); // même sens que le roulis de virage (carRoll9 du côté de `steer`) : ≈ 3° de plus, ≈ 2° de nez, ≈ 2 cm
      sensHap(8,1);}
  }
  /* LE PALIER SE PREND DANS LES RESSORTS : bleu, or, rose — le son monte et le pouce tique déjà (driftTick), mais la caisse ne bronchait pas.
     À chaque palier elle se TASSE d'un coup sec (≈ 1,5 cm bleu → 3 cm ULTRA) et verse un rien de plus sur l'extérieur : la charge PÈSE.
     Vu à l'image suivante (driftLv lu avant le traitement) ; pas de vibration ici, celle du palier existe. */
  if(on&&driftLv>(SENS_GL.lv|0)&&!REDUCED_MOTION)sensCoup(-Math.sign(slipB)*.25*driftLv,0,-(.25+.17*driftLv));
  SENS_GL.lv=on?driftLv:0;
  if(!on&&SENS_GL.on&&driftLv>0&&!REDUCED_MOTION){ // LE RELÂCHÉ CHARGÉ : le turbo part — la caisse S'ASSOIT sur son train arrière (nez levé ≈ 2° bleu → 3,5° ULTRA, ≈ 2-3 cm), et la charge ÉCLATE aux deux roues, de sa couleur
    const lv=driftLv,pool=lv===3?sparkPink:lv===2?sparkGold:sparkBlue,sp9=CARS[level];
    sensCoup(0,-(.4+.3*lv),-(.25+.15*lv));
    if(sp9)for(let sd=-1;sd<2;sd+=2){DRIFT_V.set(sd*sp9.w*.42,.15,-sp9.l*.38);carGroup.localToWorld(DRIFT_V);sparkBurst(pool,DRIFT_V,3+lv,8);} // 8 à 12 étincelles en tout (anneaux de 70) : une gerbe, pas un feu d'artifice
  }
  if(!on&&SENS_GL.on)SENS_GL.ta=performance.now();
  /* LA GOMME REPREND : pouce relâché, l'angle de glisse (slipB) se referme en ≈ 0,25 s — et rien ne disait l'instant où le pneu RACCROCHE.
     Quand il repasse sous 3,5°, la carrosserie est RENVOYÉE d'un coup vers l'intérieur (elle se redresse en dépassant à peine), deux
     bouffées de gomme sautent des roues arrière, un tic sec dans le pouce. Dosé par l'angle réellement tenu (pk : 7° → 24°).
     Un seuil franchi, pas un minuteur : même instant à 30, 60 et 120 i/s. Périmé au bout de 0,7 s (décollage, pause, mort entre-temps). */
  if(on){if(!SENS_GL.on)SENS_GL.pk=0;const a9=Math.abs(slipB);if(a9>SENS_GL.pk){SENS_GL.pk=a9;SENS_GL.sg=Math.sign(slipB);}SENS_GL.arm=SENS_GL.pk>.12;}
  else if(SENS_GL.arm){
    if(performance.now()-SENS_GL.ta>700)SENS_GL.arm=false;
    else if(Math.abs(slipB)<.06){SENS_GL.arm=false;
      const k=Math.min(1,SENS_GL.pk/.42),sp9=CARS[level];
      sensHap(7,1);
      if(!REDUCED_MOTION){sensCoup(SENS_GL.sg*(.5+.8*k),0,.2*k); // à l'opposé du coup d'accroche : ≈ 1,2° → 3,2°
        if(sp9&&Math.abs(vA)>14)for(let sd=-1;sd<2;sd+=2){DRIFT_V.set(sd*sp9.w*.5,.12,-sp9.l*.5);carGroup.localToWorld(DRIFT_V);sparkBurst(dust,DRIFT_V,2,3);}} // elles héritent de la vitesse de la caisse (sparkBurst) : rien ne reste en voile derrière
    }
  }
  SENS_GL.on=on;
}
/* (2026-10-14, sensations · caisse) LE POIDS DE LA CAISSE DANS LES MOMENTS MUETS DE LA CONDUITE. Le roulis suit déjà le virage sur son
   ressort, la carrosserie s'affaisse déjà vers le vide roues dehors — mais certains INSTANTS ne disaient rien. `sensCaisse` les guette
   (elle LIT steer, lat, vA, hopY… et n'écrit que par sensCoup / sensHap / une gerbe) ; des seuils franchis et des heures, jamais « par image ».
   `t` : l'heure du dernier passage (un trou de plus de 150 ms = vol, pause, mort : on repart de zéro, sans rien jouer). */
const SENS_CA={t:0,c:0,tc:0,tk:0};
function sensCaisse(){
  const t=performance.now(),v=Math.abs(vA);
  if(t-SENS_CA.t>150||introD){SENS_CA.t=t;SENS_CA.c=0;SENS_CA.o=true;SENS_CA.pk=0;return;} // (la lèvre) on repart « dehors, sans élan » : posé roues dans le vide, pas de tic ; posé sur la route, l'état se range en silence
  SENS_CA.t=t;
  /* LE COUP DE VOLANT SEC : le pouce passe d'un bord à l'autre (plus de la moitié du braquage de chaque côté, en moins de 0,3 s) — une
     chicane, un évitement. Le ressort du roulis faisait passer la caisse d'un flanc à l'autre en fondu ; là le poids est JETÉ sur le
     nouveau flanc extérieur (≈ 1,2° → 2,7° de plus selon la vitesse) et elle s'y TASSE (≈ 0,5 → 1,5 cm), puis se repose seule.
     Rien en glisse (elle a son accroche), rien sur une flaque (elle louvoie déjà), rien dans la main (un slalom bourdonnerait). */
  if(Math.abs(steer)>.5){const g=Math.sign(steer);
    if(g!==SENS_CA.c){
      if(SENS_CA.c!==0&&t-SENS_CA.tc<300&&t-SENS_CA.tk>220&&v>14&&hopY<=0&&!driftEnCours&&slipT<=0&&!REDUCED_MOTION){
        const k=Math.min(1,(v-14)/26);sensCoup(-g*(.5+.6*k),0,-(.15+.2*k));SENS_CA.tk=t;} // même sens que le roulis de virage (rollT du côté de `steer`)
      SENS_CA.c=g;}
    SENS_CA.tc=t;}
  /* LA ROUE PASSE LA LÈVRE : dès que les roues extérieures sortent de la dalle, la carrosserie s'affaisse vers le vide (bord v2) et le
     plancher racle — mais en fondu, et la main n'apprenait le bord qu'au RASE-BORD, 0,6 s plus tard. À l'instant où la roue quitte le
     bitume : elle TOMBE d'un cran (≈ 1,1° vers le vide, ≈ 1 cm) et le pouce reçoit UN tic. Une fois par approche (pas avant 0,45 s). */
  const sp9=CARS[level];if(!sp9)return;
  const hw9=sp9.w*.5,dB9=Math.abs(lat)-(ROAD_HALF-hw9); // > 0 = les roues extérieures sont dehors (la même mesure que le roulis du bord)
  if(hopY>0){SENS_CA.o=false;SENS_CA.pk=0;return;} // pas de vide (Paris au sol) · roues en l'air : rien, et on oublie
  if(!SENS_CA.o){
    if(dB9>0){SENS_CA.o=true;SENS_CA.pk=0;
      if(v>12&&t-SENS_CA.tl>450){SENS_CA.tl=t;sensHap(8,1);if(!REDUCED_MOTION)sensCoup(Math.sign(lat)*.45,0,-.3);}}
  }
  else if(dB9<-.12){SENS_CA.o=false; // revenue de 12 cm sur le bitume : l'approche est finie (l'écart évite le clignotement sur la lèvre)
    /* LA ROUE REMONTE : on a mordu le vide pour de bon (au moins 30 % du chemin vers la bascule) et on revient — l'instant du « sauvé »
       ne disait rien, les étincelles s'arrêtaient, c'est tout. La roue REGRIMPE la lèvre : la carrosserie est renvoyée vers la route
       et se soulève d'un rien (≈ 1,5° → 2,5°, ≈ 1 → 1,5 cm, selon la profondeur de la sortie), une dernière pincée d'étincelles saute de
       la roue arrière extérieure, un tic net dans le pouce. */
    if(SENS_CA.pk>.3&&v>12){const k=SENS_CA.pk,g=Math.sign(lat);
      sensHap(10,1);
      if(!REDUCED_MOTION){sensCoup(-g*(.4+.6*k),0,.15+.25*k);
        DRIFT_V.set(g*hw9,.1,-sp9.l*.4);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,2+Math.round(2*k),5);}} // la réserve du raclage (même or), 2 à 4 étincelles
    SENS_CA.pk=0;}
  else{const pe9=Math.min(1,dB9/hw9);if(pe9>SENS_CA.pk)SENS_CA.pk=pe9;} // dehors : on retient jusqu'où
}
SENS_CA.o=false;SENS_CA.pk=0;SENS_CA.tl=0; // (la lèvre) roues dehors · le plus loin qu'elles sont allées (0 → 1 = le centre de gravité au bord) · l'heure du dernier tic
function driftTick(dt,on){
  if(SENS)try{sensGlisse(!!on);}catch(e){} // (2026-10-14, sensations) AVANT le traitement : au relâché, `driftLv` porte encore le niveau atteint
  driftCd=Math.max(0,driftCd-dt); // (2026-09-25) recharge après un mini-turbo : le zigzag de drifts ne se « farme » plus
  if(on&&driftCd<=0){
    driftC+=dt;vA*=Math.max(0,1-.10*dt);
    const lv=driftC>1.4?3:driftC>.9?2:driftC>.45?1:0; // (2026-09-25) .5/1/1,7 → .45/.9/1,4 : le SUPER et l'ULTRA tiennent enfin sur la route
    if(lv>driftLv){driftLv=lv;try{if(SONV2)sfx('drift.charge',{st:sonPd([0,3,5,7][lv]-3)});else chimeNote([0,noteP(3,1),noteP(5,1),noteP(7,1)][lv],0,.08,.16);}catch(e){}hap(lv===3?[14,30,14]:10);}
    driftSpk-=dt;
    if(driftLv>0&&driftSpk<=0){driftSpk=.045;const pool=driftLv===3?sparkPink:driftLv===2?sparkGold:sparkBlue,sp9=CARS[level];
      for(const sd of [-1,1]){DRIFT_V.set(sd*sp9.w*.42,.15,-sp9.l*.38);carGroup.localToWorld(DRIFT_V);sparkBurst(pool,DRIFT_V,2,5);}}
  }else if(!on&&driftC>0){
    if(driftLv>0){ // LE MINI-TURBO
      driftCd=.6+.3*driftLv;if(driftLv>=2)momT=4.3; // recharge ; et le SUPER/ULTRA rend la réserve de momentum que la glisse a vidée
      boost=Math.max(boost,.35+.3*driftLv);vA+=6*driftLv;nitroGain(.16*driftLv,'drift');shake=Math.max(shake,.14*driftLv);(driftLv>=FLOW2.decl.drift?flowAddDecl:flowAdd)(9*driftLv,'style'); // (loi 20) en ville, ce turbo va déclencher : s'il arme, l'armement se tait
      fovPunch=Math.max(fovPunch,6+6*driftLv);                                   // le champ S'OUVRE d'un coup : on est PROPULSÉ
      if(driftLv===3){slowT=Math.max(slowT,.14);try{flashEl.style.background='#ff5ec8';flashEl.style.opacity=.35;setTimeout(function(){flashEl.style.opacity=0;flashEl.style.background='#ff2020';},90);}catch(e){}}
      try{if(SONV2)sfx(['','turbo.mini','turbo.super','turbo.ultra'][driftLv]);else{boostSnd(1+.35*driftLv);if(driftLv>=2)crackle(.45+.2*driftLv);}}catch(e){}hap([12,30,20]);
      try{chaineAuraMuette(['','MINI-TURBO','SUPER TURBO','ULTRA TURBO'][driftLv],[0,50,100,180][driftLv],'drift',false,SONV2);}catch(e){} // (2026-09-29, Sacha) le turbo se SENT (champ, son, flammes) : il ne s'écrit plus
      if(driftLv>=FLOW2.decl.drift&&FREN.arme&&FLOW.lv<4)frenDeclenche(); // (loi 20 de FLOW2) en VILLE, relâcher un SUPER/ULTRA TURBO fait partir la frénésie armée
    }
    driftC=0;driftLv=0;
  }
}
/* LE TEXTE QUI JAILLIT de la caisse (l'écran est nu sur téléphone : c'est la seule annonce de conduite) — (2026-10-25, Sacha : « petit, stylisé, qu'il
   sorte de la voiture, qu'il donne de la vie au jeu sans le charger ») popTexte est l'ALIAS de LE FIL (fil.js : la porte unique, sa priorité 0-3, ses
   silences) ; `fil` écrit par `jaillit` (mots-jaillissants.js) : le mot sort de la caisse, de côté, et s'efface — plus de pastille ni d'emplacement fixe. */
function popTexte(txt,col,prio){popTexte._w=fil(txt,col,prio)||0;}
function n9Saut(o){const n=performance.now(),s9=n-(o._viseT||0)>400;o._viseT=n;return s9;} /* (2026-10-17) 200 → 400 ms, comme CAM_REPRISE : une image qui tousse ne fait plus sauter la visée */ // la visée repart de zéro après une absence (vol, garage, respawn)
/* ================= LE FLOW — la signature de conduite de CASH CAR (2026-09-25) =================
   User : « pousse encore plus, fais un truc parfait pour qu'on puisse démarquer notre jeu pour ça ». Le jeu avait des
   gestes (drift, rase-bord, figures, bumps, poses parfaites) qui payaient chacun dans leur coin. Le FLOW les TISSE en une
   seule montée : chaque geste de style remplit la jauge ; la jauge monte par PALIERS — ×2, ×3, ×4, puis ×5 FRÉNÉSIE ;
   chaque palier multiplie les gains, pousse la caisse un peu plus vite, ouvre le champ et colore les bords de l'écran.
   Arrête d'avoir du style : elle retombe. Crash : elle tombe à zéro. On ne VISE plus un score, on CHERCHE un état. */
/* <<<FLOW2>>> ==================================================================
   LE BARÈME DU FLOW v2 — « LE FLOW SE GAGNE AU BORD DU VIDE » (2026-09-28, Sacha : « pour l'instant il invite trop à rester
   sur la route ; la frénésie DARK TRIAD doit inciter à faire des figures et prendre des raccourcis ; plus long à atteindre,
   à partir d'une certaine vitesse ; jouissif d'y arriver et de la garder — sinon la musique s'arrête »).
   MESURÉ AVANT (pilote auto, banc) : collé au bord de la route, sans un saut, FRÉNÉSIE en 11 s et gardée pour toujours (le
   rase-bord versait 10 points/s ET remettait le répit à zéro) ; au centre, les pièces suffisaient à tenir la jauge.
   LES QUATRE LOIS :
   1. TROIS FAMILLES DE GESTES. La ROUTE (pièces, pads, lignes, rase-bord) CHAUFFE la jauge mais ne la couronne pas : elle
      s'essouffle cellule après cellule et ne touche jamais la triade. Le STYLE (drift, frôlé, bump, radar…) monte bien,
      puis faiblit dans la triade. Le RISQUE (figures en vol, raccourcis, poses parfaites, à l'arrachée, gaps) paie partout.
   2. LA VITESSE MULTIPLIE TOUT. `vitN` = km/h ÷ croisière (1 ≈ croisière élan plein, ~1,3 en nitro) : ralenti, un geste
      vaut un tiers ; en nitro, un tiers de plus. Et sous `gate`, la TRIADE ne se remplit PAS DU TOUT.
   3. PLUS ON MONTE, PLUS ÇA BRÛLE. Une PENTE permanente dans le rose et la triade (même en enchaînant les petits gestes),
      plus la FUITE classique passé le répit. Seuls le style et le risque rendent le répit — la route seulement sous le
      FLOW II. EN VOL, RIEN NE FUIT : le vide retient le flow (c'est lui qui le fait vivre).
   4. LA FRÉNÉSIE A FAIM, ET LA VITESSE LA NOURRIT. Sa brûlure est multipliée par la vitesse : en nitro elle fond 3× moins
      vite qu'en croisière, et ralentir (pose écrasée, plot, drift raté) la vide 3× plus vite. Nourrie par le risque (et
      un peu par le style) — jamais par la route.
   LE FLOW v3 — « PLUS DUR À ATTEINDRE, MOINS FACILE À PERDRE » (même jour, Sacha : « on l'a trop dans le jeu ; en frénésie
   le nitro baisse 2× plus lentement ; tant que le nitro est activé le flow ne baisse pas ; atteindre la frénésie doit être un
   but en soi »). MESURÉ AVANT (sim2.js, plots fidèles au jeu) : casse-cou en frénésie à 51 s et 47 % du temps, maître à 24 s
   et 77 % — ce n'était plus un état, c'était le jeu. Trois lois de plus :
   5. LE NITRO GÈLE LE FLOW. Tant qu'il brûle, la jauge ne perd RIEN et le répit ne s'écoule pas — comme en vol. Le nitro
      devient le bouclier de la montée et le CARBURANT de la frénésie, où il dure deux fois plus (`fren.nitro`).
   6. LA MONTÉE EST LONGUE. Chaque cellule rend moins par geste (`cel`), la triade surtout ; la fuite et la pente sont plus
      douces en proportion : on ne perd pas plus vite, on met plus longtemps à arriver.
   7. LA FRÉNÉSIE TIENT, ET SA PERTE SE PAIE. Sa brûlure est plus lente et son répit plus long ; mais quand elle tombe, la
      TRIADE SE VIDE (`retombee`) : y revenir, c'est remonter toute la dernière cellule — plus de retour en deux figures.
   LA FRÉNÉSIE v4 — « LA TRIADE » (même jour, Sacha : « l'état de frénésie doit rappeler les traits de la dark triad : tant qu'on
   les respecte on reste en frénésie — NARCISSISME : la prise de risque, l'ambition, les figures inutiles pour le sport ;
   MACHIAVÉLISME : la triche, couper les chemins ; PSYCHOPATHIE : la vitesse à fond, le nitro appuyé tout le temps »). Et :
   « en cas de mauvais atterrissage, de travers ou à contresens, le flow retourne à zéro ».
   8. EN FRÉNÉSIE, LA JAUGE N'OBÉIT QU'À LA TRIADE. Trois traits, chacun sa MÉMOIRE (s) : NARCISSE (figures en vol, poses
      parfaites, arrachées, serpent… tout le RISQUE ; un frôlé en rend un peu), MACHIAVEL (raccourcis, gaps, petites coupes),
      PSYCHO (nitro enfoncé, ou vitesse à fond). Nourri, un trait repart plein ; sinon il se vide — pas en vol. La zone rouge
      brûle selon le nombre de traits VIVANTS (`brule`, indexé 0 · 1 · 2 · 3) : les trois tenus, elle se REGONFLE. Les
      gestes ne remplissent plus la jauge directement (`fam[…][4]` = 0) : ils nourrissent les traits, les traits la tiennent.
      Mesuré (sim3.js) : les trois tenus → ~2 min 30 de tenue ; sans jamais tricher → ~40 s ; sans nitro → ~60 s.
   9. LA POSE RATÉE COÛTE TOUT LE FLOW. Se poser à plus de `pose.angle`° de l'axe de la route (de travers, et au-delà de 90° :
      à contresens), la frénésie comprise : la jauge retombe à ZÉRO. La vrille (le lacet) se finit donc AXÉE — ou elle tue le flow.
   LA TRIADE v5 — « LA GRAMMAIRE DU FLOW » (même jour, Sacha : « pour gagner en flow on a établi trois principes : PSYCHO, la
   vitesse aérienne, la vitesse max, le nitro ; MACHIAVEL, qui récompense la triche et les raccourcis ; NARCISSE, les figures, les
   bumps, les séries de pièces entières — rends les règles d'obtention parfaites pour aller avec ces traits, et affiche-les à côté
   de FLOW : "+NARCISSE" en vert quand on gagne, "-PSYCHO" en rouge quand on perd »). Les traits ne sont plus un état réservé à la
   frénésie : ils sont les TROIS AUTEURS de tout le flow, du premier point au dernier.
   10. CHAQUE POINT A UN AUTEUR. NARCISSE — ce qu'on fait POUR ÊTRE VU : figures (vrilles, météore, dauphin, big air), bumps, poses
       parfaites, arrachées, drift, frôlés, esquives, et la SÉRIE DE PIÈCES ENTIÈRE (le motif ramassé jusqu'à la dernière ; la pièce
       seule reste un filet sans auteur). MACHIAVEL — ce qu'on fait CONTRE LA RÈGLE : raccourcis, gaps, le SERPENT (passer sous la
       route), la pose sur la FACE CACHÉE, le fourgon braqué. PSYCHO — la VITESSE : tenir plus que la croisière (`psy.sol`), voler
       vite (`psy.air`) — un geste toutes les `psy.t` s, le nitro compris —, les pads, les radars, foncer à l'aveugle.
   11. LA FAUTE A UN AUTEUR AUSSI. -PSYCHO : passer sous `lent.vit` × la croisière (au sol, sans nitro) fait sauter le répit — la
       jauge fuit TOUT DE SUITE, et l'étiquette rouge reste tant qu'on traîne. -NARCISSE : une pose LOURDE retire `faute.lourd`
       points (jamais sous le palier en cours : on perd de l'avance, pas un palier), un plot percuté fait sauter le répit, une pose
       RATÉE coûte tout (loi 9). MACHIAVEL ne se fait jamais prendre : il ne meurt que d'OUBLI, en frénésie.
   12. EN FRÉNÉSIE, LE STYLE NOURRIT AUSSI. Un geste rend à son trait `part[famille]` de sa mémoire (au prorata jusqu'à q = 6) : le
       RISQUE le remplit, le STYLE (bump, drift, série, frôlé) en rend un tiers, la route presque rien. Les bumps et les séries
       tiennent donc NARCISSE — sans jamais le remplacer par une vraie figure.
   LA TRIADE SIMPLIFIÉE (même soir, Sacha : « c'est un peu trop dur d'avoir la dark triad, simplifie quand même un peu plus »).
   MESURÉ AVANT (simtri.js, le vrai bloc, trois joueurs types, 5 min × 60) : le joueur tranquille et le casse-cou ne l'atteignaient
   JAMAIS, le maître en 2 min 26. La MONTÉE est allégée — la tenue, elle, reste exigeante (sinon elle redevient « le jeu », loi 6) :
   13. LA MONTÉE EST PLUS COURTE. Chaque cellule rend plus par geste (`cel` .7 · .55 · .4 · .34), la pente du rose et de la triade
       est divisée par ~3 (.15), la fuite est plus douce, la triade accepte le STYLE (.7) et un filet de ROUTE (.15), et la vitesse
       exigée descend à 85 % de la croisière (`gate`) : une pose un peu lourde ne la gèle plus.
   14. LA TENUE SE MÉRITE UN PEU PLUS. La brûlure selon les traits vivants passe à [4,5 · 2,4 · 0,9 · −1,2] : deux traits tenus ne
       suffisent plus à la garder longtemps. MESURÉ APRÈS : tranquille ~4 min (60 % l'atteignent en 5 min), casse-cou ~1 min, maître
       ~40 s ; en frénésie ~5 % · ~50 % · ~70 % du temps.
   ⚠⚠ LOIS 13-14 RETIRÉES (2026-09-28, nuit, Sacha : « l'état de frénésie est trop facile à atteindre, remets l'ancienne version ») :
   tous les réglages ci-dessous sont revenus à la TRIADE v5 (cellules .5 · .35 · .22 · .14, pente .4, gate .95, style .35 dans la
   triade, la route n'y touche plus, brûlure [4 · 2 · .7 · −1.5], pose lourde 6). Les valeurs simplifiées sont notées en commentaire
   à côté de chaque clé : si Sacha redemande « plus facile », repartir d'un point ENTRE les deux, pas de l'une ou de l'autre.
   16. LA FRÉNÉSIE ×3 — VITE GAGNÉE, VITE PERDUE (2026-09-29, Sacha : « en mode frénésie on doit gagner 3× l'argent ; rends l'obtention
       de la frénésie plus facile à obtenir ET à perdre »). Elle paie désormais ×3 (ECO3.flow[4]) ; elle doit donc être une RAFALE qu'on
       déclenche souvent et qu'il faut attiser sans arrêt, plus une rente qu'on garde deux minutes. MESURÉ AVANT (simtri.js, v5, 5 min
       × 60 parties) : tranquille et casse-cou n'y arrivaient JAMAIS ; le maître en 2 min 26, puis la gardait 77 s d'affilée (30 %).
       · LA MONTÉE S'OUVRE (au-delà de la version simplifiée des lois 13-14, qui laissait encore 40 % des tranquilles dehors) : cellules
         .6 · .5 · .4 · .4, pente .15, fuite ×0,6 (1,8 · 2,1 · 2,4 · 1,8), répit 3 s, le STYLE prend 70 % dans la triade, vitesse exigée
         90 % de la croisière (`gate`, non simulé). La ROUTE ne touche toujours pas la triade (loi 1) : les pièces chauffent, elles ne
         couronnent pas.
       · LA TENUE DEVIENT UNE BRAISE : mémoires NARCISSE 6 s · MACHIAVEL 12 s · PSYCHO 2 s (v5 : 9 · 25 · 3), brûlure selon les traits
         vivants [6 · 4 · 2 · −0,3] (v5 : [4 · 2 · ,7 · −1,5]) — les trois tenus ne la regonflent plus qu'à peine, deux ne la tiennent
         que 6 s, un seul 3 s. Lâcher le nitro ET les figures = ~6 s de sursis. La retombée reste à 75 : on y revient en remplissant
         la triade, en ~15-20 s pour qui joue bien. En VILLE (loi 15), les mémoires baissent dans la même proportion (9 · 16 · 3).
       MESURÉ APRÈS (même banc) : 1re frénésie tranquille ~2 min 30 (95 % l'atteignent), casse-cou ~1 min, maître ~40 s ; tenue
       moyenne ~9 · 13 · 18 s ; en frénésie ~6 · 29 · 46 % du temps, soit ~2 · 7 · 8 frénésies en 5 min. Le multiplicateur d'argent
       moyen d'une partie (temps × palier) passe de ×1,4 · ×1,6 · ×1,8 à ×1,7 · ×2,1 · ×2,3.
   17. L'ENTRE-DEUX (même jour, Sacha : « la dark triad est trop facile — trouve un entre-deux entre maintenant et avant »). Chaque
       réglage de montée et de tenue est posé ENTRE la v5 et la loi 16, puis la montée resserrée d'un cran pour que CHAQUE mesure tombe
       entre les deux (simtri.js, 5 min × 60) : cellules .55 · .42 · .30 · .25, vitesse exigée 92,5 %, répit 2,75 s, fuite 2,4 · 2,8 ·
       3,2 · 2,4, pente .28, style 50 % dans la triade ; mémoires NARCISSE 7 s · MACHIAVEL 15 s · PSYCHO 2,2 s, brûlure [5,5 · 3,5 · 1,7 ·
       −0,6] ; en VILLE mémoires 11 · 24 · 3,5 et style 70 %. Le ×3 d'argent de la frénésie ne change pas.
       MESURÉ : 1re frénésie tranquille JAMAIS (2 % en 5 min ; v5 jamais · loi 16 2 min 30), casse-cou ~2 min (jamais · 1 min), maître
       ~1 min (2 min 26 · 38 s) ; en frénésie 0 · 15 · 39 % du temps (0 · 0 · 30 % · 6 · 29 · 46 %) ; tenue ~16 · 18 · 25 s.
   18. POUR LES BONS JOUEURS (même soir, session GRAPHISME, Sacha : « dark triad trop facile à avoir, il faut que ce soit pour les bons
       joueurs »). UN seul levier, la MONTÉE : les cellules or, rose et triade demandent ~1,8× plus de gestes (.42 · .30 · .25 → .23 ·
       .165 · .14 ; la cyan .55 inchangée) ; la tenue, la fuite, la vitesse exigée et la VILLE (qui n'a pas de cellules à elle) ne
       bougent pas — la fuite punirait aussi les maîtres, et `gate` > 1 réserverait la triade à la nitro seule (essayé : plus personne).
       MESURÉ (simtri.js 5 min × 60, + un virage à filet par minute aux nuages ; simville.js AVEC le barème ville posé) — part des
       parties qui atteignent la frénésie en 5 min / 1re frénésie médiane : NUAGES tranquille 0 %, casse-cou 13 % (loi 17 : 100 %,
       ~2 min), maître 100 % à ~2 min (~1 min) ; VILLE casse-cou 7 % (90 %, 2 min 22), maître 100 % à ~2 min 20 (1 min 06). En
       frénésie 0 · 1 · 19 % du temps (0 · 15 · 39 %) ; tenue inchangée ~20 · 25 s (ville 21 · 32 s).
   19. LA TENUE SE PAIE (2026-09-30, Sacha, relayé par INTERFACE : « la dark triad doit se perdre plus facilement après l'avoir obtenue,
       genre il faut continuer à jouer comme un malade pour ne pas la perdre »). La MONTÉE ne bouge pas (loi 18) ; seule la TENUE, une
       fois TRIPLE MONSTER lancé : mémoires des traits NARCISSE 7 → 4 s · MACHIAVEL 15 → 8 s · PSYCHO 2,2 → 1,5 s, brûlure [5,5 · 3,5 ·
       1,7 · −0,6] → [7 · 4,5 · 2,2 · −0,4] (les trois traits vivants regonflent encore, mais moins) ; VILLE 11 · 24 · 3,5 → 6 · 13 · 2,4.
       MESURÉ (simtri2/simville2, 5 min × 60) : tenue moyenne casse-cou 20 → 10 s, maître 25 → 12 s (ville 21 → 12, 32 → 16) ; 1re
       frénésie inchangée (maître ~2 min, 2 min 20 en ville).
   20. EN VILLE, LE DRIFT DÉCLENCHE (2026-09-30 — la frénésie doit se LIRE). Armée, la jauge n'attendait qu'une
       FIGURE POSÉE — rare entre les tours : elle fuyait (~7 s de 100 à 88 sans la nourrir) avant qu'on trouve un tremplin, et « POSE
       UNE FIGURE ! » réclamait ce que la ville ne donne pas. `decl` dit ce qui la fait partir EN PLUS d'une figure posée : relâcher
       un drift de niveau `decl.drift` (2 = SUPER ou ULTRA TURBO · 9 = jamais) et poser un RACCOURCI (`decl.racc`) ; l'armement dit
       alors « DRIFT OU FIGURE ! ». La MONTÉE ne bouge pas : l'armement reste le filtre des bons joueurs (loi 18) — on raccourcit
       l'ATTENTE entre la jauge pleine et le départ, pas le chemin jusqu'à elle. Hors ville, rien ne change (drift 9, raccourci non).
       MESURÉ (simville3.js = simville2 + le déclencheur modélisé, 5 min × 400 parties, drift de simville2) : casse-cou atteint la
       frénésie dans 4 → 5 % des parties ; attente médiane jauge armée → départ 15 → 2,3 s (casse-cou), 9,9 → 1,1 s (maître) ;
       armements PERDUS sans départ 14 → 5 % (casse-cou), 2 → 1 % (maître) ; maître 1re frénésie 2 min 18 → 2 min 10, en frénésie
       10 → 12 % du temps, tenue inchangée (~10 · 16 s). Avec des drifts plus longs (DRIFTD=tri, un quart d'ULTRA au casse-cou) :
       casse-cou 14 → 16 %. ULTRA seul (drift 3) : 4 → 4 %, attente 3,5 s — écarté, le SUPER suffit et se lit mieux.
   ⚠ BLOC PUR : ne lit que ses arguments et FLOW2 — le banc de simulation l'exécute tel quel, hors du jeu. Tous les
   réglages vivent dans FLOW2, nulle part ailleurs.
   ========================================================================== */
const FLOW2={
  // efficacité des familles selon la cellule : 0 cyan · 1 or · 2 rose · 3 TRIADE (violet + zone rouge) · 4 en FRÉNÉSIE
  fam:{route:[1,.5,.12,0,0],style:[1,1,.8,.5,0],risque:[1,1,1,1,0]}, // (v4) en frénésie [4] : rien — c'est la TRIADE qui tient la jauge · (loi 17) le style prend 50 % dans la triade (loi 16 : ,7) · (loi 16) le style prend 70 % dans la triade (v5 : ,35 · loi 13, retirée : route [1,.6,.3,.15] · style [1,1,.9,.7])
  cel:[.55,.23,.165,.14,.5],             // chaque cellule demande au moins autant de gestes que la précédente (loi 18, pour les bons joueurs · loi 17 : ,55 · ,42 · ,3 · ,25 · loi 16 : ,6 · ,5 · ,4 · ,4 · v5 : ,5 · ,35 · ,22 · ,14 · v2 : 1 · ,8 · ,65 · ,5 · loi 13, retirée : ,7 · ,55 · ,4 · ,34)
  vit:[[.6,.35],[1,1],[1.3,1.35]],       // (vitN, ×) — la vitesse multiplie tous les gains, interpolé entre les points
  gate:.925,                             // sous 92,5 % de la croisière, la TRIADE ne prend RIEN (loi 17 · loi 16 : 90 % · v5 : 95 % · loi 13, retirée : 85 %)
  grace:2.75,                            // répit (s) après un geste de style/risque avant que la jauge fuie (loi 17 · loi 16 : 3 · v5 : 2,5)
  fuite:[2.4,2.8,3.2,2.4],               // fuite (/s) passé le répit, par cellule (loi 17 · loi 16 : 1,8 · 2,1 · 2,4 · 1,8 · v5 : 3 · 3,5 · 4 · 3 · v2 : 5 · 7 · 9 · 11 · loi 13, retirée : 2,5 · 3 · 3 · 2,5)
  pente:[0,0,.28,.28],                   // brûlure PERMANENTE (/s) : le rose et la triade se paient même en enchaînant (loi 17 · loi 16 : ,15 · v5 : ,4 · ,4 · v2 : 1 · 2)
  routeGarde:50,                         // la route ne rend le répit que sous le FLOW II
  retombee:75,                           // la frénésie perdue, la jauge RETOMBE ici : la triade se vide (v2 : elle restait au bord, à 88)
  // la FRÉNÉSIE : part du nitro consommée (,5 = il dure DEUX FOIS plus)
  fren:{nitro:.5},
  // (v4) LA TRIADE : mémoire (s) de chaque trait · PSYCHO vit aussi à `p.vit` × la croisière sans nitro · brûlure (/s) de la zone
  // rouge selon le nombre de traits vivants [0, 1, 2, 3] — négatif = elle se regonfle
  triade:{n:{mem:4},m:{mem:8},p:{mem:1.5,vit:1.3},brule:[7,4.5,2.2,-.4]}, // (loi 19 : la TENUE se paie — voir la liste · loi 17 : mémoires 7 · 15 · 2,2, brûlure [5,5 · 3,5 · 1,7 · −,6] · loi 16 : mémoires 6 · 12 · 2, brûlure [6 · 4 · 2 · −,3]) (loi 16) la tenue est une BRAISE · v5 : mémoires 9 · 25 · 3, brûlure [4 · 2 · ,7 · −1,5] (loi 14, retirée : [4,5 · 2,4 · ,9 · −1,2])
  pose:{angle:55,vMin:4},                // (v4) la POSE RATÉE : au-delà de 55° de l'axe (dès 4 m/s de vitesse à plat), le flow tombe à zéro
  // (v5) LA GRAMMAIRE : part de la mémoire d'un trait qu'un geste lui rend en frénésie · PSYCHO hors frénésie (seuils de vitesse au sol
  // et en vol, période, geste [sol, vol]) · -PSYCHO (sous `vit` le répit saute, réarmé à `re`) · -NARCISSE (points de la pose lourde)
  part:{risque:1,style:.35,route:.05},
  psy:{sol:1.12,air:1.15,t:1.5,q:[4,6]},
  lent:{vit:.8,re:.95},
  faute:{lourd:6},                       // (loi 13, retirée : 4)
  decl:{drift:9,racc:false},             // (loi 20) ce qui DÉCLENCHE la frénésie armée en plus d'une figure posée : le relâcher d'un drift de ce niveau (2 SUPER · 3 ULTRA · 9 jamais), le raccourci posé — la VILLE les ouvre
  /* 15. LA VILLE SE GAGNE SUR LA ROUTE (2026-09-28, nuit, Sacha : « le gameplay change dans la ville, on peut moins voler : l'obtention des
     traits de la dark triad doit être adaptée à la vitesse sur route, et moins à la voltige »). Entre les tours on saute peu : ce lieu
     RÉÉCRIT quelques clés (`flowLieu`, appelé par newTrack) — la route et le style montent jusque dans la triade, la vitesse TENUE au sol
     paie plus souvent et plus fort (PSYCHO), en frénésie le style (drift, frôlé, rase-bord, séries) et la route nourrissent NARCISSE, et
     les traits se souviennent plus longtemps (les figures et les raccourcis y sont rares). Le risque, lui, paie pareil : il est juste
     plus rare. Hors ville, rien ne change. */
  lieux:{ville:{fam:{route:[1,.55,.25,.2,0],style:[1,1,.9,.7,0], /* (loi 17 · loi 16 : ,8) */risque:[1,1,1,1,0]}, // (loi 16) le style de la ville reste au-dessus du barème de base (,6 → ,8)
    psy:{sol:1.08,air:1.15,t:1.2,q:[5,6]},part:{risque:1,style:.7,route:.2},decl:{drift:2,racc:true}, /* (loi 20) on y saute peu : le SUPER/ULTRA TURBO et le raccourci font partir la frénésie armée */
    triade:{n:{mem:6},m:{mem:13},p:{mem:2.4,vit:1.2},brule:[7,4.5,2.2,-.4]}}}, // (loi 19 · loi 17 : 11 · 24 · 3,5, brûlure [5,5 · 3,5 · 1,7 · −,6] · loi 16 : 9 · 16 · 3, brûlure [6 · 4 · 2 · −,3]) (loi 16) même proportion que la base (v5 ville : 13 · 32 · 4)
  lieu:''
};
// pose les réglages du LIEU (ville) par-dessus le barème de base — et les rend en quittant le lieu. Pur : ne touche que FLOW2.
function flowLieu(nom){
  const L=FLOW2.lieux[nom]||null;
  if(!FLOW2._base){FLOW2._base={};for(const k in FLOW2.lieux.ville)FLOW2._base[k]=JSON.parse(JSON.stringify(FLOW2[k]));}
  for(const k in FLOW2._base)FLOW2[k]=JSON.parse(JSON.stringify(L&&L[k]?L[k]:FLOW2._base[k]));
  FLOW2.lieu=L?nom:'';
}
function flowInterp(P,x){if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const a=P[i-1],b=P[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return P[P.length-1][1];}
function flowCel(v,lv){return lv===4?4:Math.min(3,Math.floor(v/25));}
// ce que vaut VRAIMENT un geste `q` de famille `fam`, quand la jauge est à `v` (palier `lv`) et qu'on roule à `vitN`
function flowGainDe(q,fam,v,lv,vitN){
  const c=flowCel(v,lv),f=FLOW2.fam[fam]||FLOW2.fam.style;
  if(c===3&&vitN<FLOW2.gate)return 0;
  return q*f[c]*FLOW2.cel[c]*flowInterp(FLOW2.vit,vitN);
}
// ce geste rend-il le répit ?
function flowGardeDe(fam,v){return fam!=='route'||v<FLOW2.routeGarde;}
// ce que la jauge perd pendant `dt` (répit écoulé `idle`, en vol `air`, nitro allumé `nit`, traits de la triade vivants `k`)
function flowPerteDe(dt,v,lv,idle,air,vitN,nit,k){
  if(air||!(dt>0))return 0;
  if(lv===4)return dt*FLOW2.triade.brule[Math.max(0,Math.min(3,k|0))]; // (v4) en frénésie : la triade seule (le nitro y est PSYCHO, il ne gèle plus)
  if(nit)return 0;
  const c=Math.min(3,Math.floor(v/25));
  return dt*(FLOW2.pente[c]+(idle>FLOW2.grace?FLOW2.fuite[c]:0));
}
/* <<<FIN FLOW2>>> ========================================================== */
// l'état du FLOW. vit = vitN du moment (km/h ÷ croisière), relue à chaque image par flowTick · revele = la triade s'est ouverte
// dans cette partie · lentVu = « PLUS VITE » déjà dit · s0/p0 = d'où est parti le vol (pour reconnaître un RACCOURCI)
const FLOW={v:0,lv:0,idle:0,aff:-1,tk:0,vit:1,vitF:null,revele:false,lentVu:false,s0:0,p0:new THREE.Vector3(),jr:null,nit:false,psyT:0,lent9:false,psyOk:false}; // nit : le nitro brûle (v3 : il GÈLE la jauge) · (v5) psyT : vitesse tenue depuis · lent9 : -PSYCHO en cours · psyOk : la croisière a été atteinte (on ne ralentit que d'une vitesse qu'on a eue)
/* (v5) LES TRAITS PARLENT SUR LA LIGNE DU FLOW (Sacha : « quand on fait une figure, ça doit être marqué en petit à côté de FLOW :
   "+NARCISSE" — "-PSYCHO" si on ralentit trop ; les trois peuvent s'afficher en même temps, en vert quand on gagne, en rouge quand on
   perd ; petits, sur la même ligne, et ils clignotent »). Trois places FIXES, toujours dans le même ordre (N · M · P) : l'œil apprend
   où regarder. Le même signe qui revient PROLONGE l'étiquette sans la relancer (un filet continu la garde allumée) ; un signe qui
   change la relance. L'extinction se compte dans flowTick : aucun minuteur. */
const FTAG={n:{s:0,fin:0,e:null,k:false},m:{s:0,fin:0,e:null,k:false},p:{s:0,fin:0,e:null,k:false}};
const TRAIT_NOM={n:'NARCISSE',m:'MACHIAVEL',p:'PSYCHO'};
/* LA VITESSE DU FLOW. Référence : la CROISIÈRE élan plein — mesurée au banc (pilote auto, gaz auto, sans nitro) à ≈2,9 × vmaxShow,
   et ≈3,7 × en nitro. vitN ≈ 1 en croisière, ~1,3 en nitro, ~0,6 après une pose écrasée ou un plot. En vol : la vitesse HORIZONTALE
   (on ne gonfle pas la triade en tombant tout droit). `FLOW.vitF` force la valeur (banc, dbgFren('vit',x)). */
const FLOW_VREF=2.9;
function flowVitN(){
  if(FLOW.vitF!=null)return FLOW.vitF;
  const vm=vmaxShow()*FLOW_VREF;if(!(vm>0))return 1;
  const v=mode==='fall'?Math.sqrt(fallVel.x*fallVel.x+fallVel.z*fallVel.z):Math.abs(vA);
  return v*3.6*SPD/vm;
}
const FLOW_COL=['#ffffff','#5ee6ff','#ff5ec8','#ffd75e','#ff2a3d']; // [4] = la FRÉNÉSIE, ROUGE (2026-09-28, Sacha) — elle était violette
const FLOW_CEL=['#5ee6ff','#ff5ec8','#ffc72a','#fff0a0'];            // les quatre cellules de la jauge (la 4e garde son violet : le ROUGE est réservé à la zone)
