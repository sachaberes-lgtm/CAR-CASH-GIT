/* LE DÉPART D'AVANCE (2026-10-19, session PERF — chantier du pré-bâti de Léo ; la passe perf du 18/10 : « JOUER : ~1,1 s d'image figée sous le
   nuage blanc · REJOUER : ~1 s de construction sous le volet · depuis l'accueil, la piste bâtie deux fois »). La 1re piste d'une partie se bâtit
   comme la map d'en face : AU MENU et À L'ÉCRAN DE FIN, quelques ms par image, par la même machine (pisteRoute, prebJade, prebDecorG), puis le
   départ la PREND au lieu de la bâtir. Image identique : même graine → même piste au bit près, et rien d'autre ne bouge (le ciel, la météo,
   la caméra, les pièces se posent au départ, comme avant).
   · LE TIRAGE D'AVANCE : le couple map × météo du prochain départ est tiré dès le menu ou l'écran de fin (`SF.prochain`, contre `SF.der` :
     `SF.prochainDer`), par la même règle que celle qui l'aurait tiré au départ (classiqueJouer : sfTire(SF.der) ; le REJOUER, dans lvlChoisir :
     sfTire(SF.der) aussi) ; un lien de test (`?carte=`, dbgClassique) est consommé par lui (sfImpose : sans map valide, rien d'avance).
     classiqueJouer le prenait déjà (`SF.prochain`) ; resetGame le pose dans `SF.tirage[0]` (le REJOUER). Le JOUER qui suit un autre JOUER
     (SF.neuf : la boutique, l'atelier, où le lâcher attend) bâtit `SF.tirage[0]`.
   · LE CONTEXTE : au menu d'une session neuve (!started), la piste se bâtit pour le newTrack de sous9 (rebuildMenuScene, started baissé, palier
     du moment) ; après une partie (started && gameOver : écran de fin, accueil), pour celui de resetGame (started, palier 0). Le temps d'une
     tranche, `started`, `gameOver` et `SF.pret` prennent la valeur qu'ils auront au départ (W.ctx, prebEchange) : hautOn et la météo des décors
     les lisent. prebGraine vérifie tout au départ (map, zone 0, largeur, palier, started) — sinon la piste est jetée et le départ bâtit comme avant.
   · LE BUDGET : 3 à 6 ms par image, comme en course, après les gabarits de la jade (jadeGabFond), la chauffe faite, jamais pendant un volet,
     un lâcher (GAR.go) ou un piqué (CHUTE.go) ; 0,7 s après qu'un monde neuf est entré, 0,8 s après la fin de la partie. Pas fini au départ :
     le reste d'un trait (le travail fait reste fait).
   · LE JOUER DEPUIS L'ACCUEIL APRÈS UNE PARTIE bâtissait la piste DEUX fois dans la même image (sous9 puis resetGame) : la 1re n'était jamais
     dessinée, seuls son ciel (lvlGo d'un coup, BIO.name que lvlBiome évite ensuite) et la caméra du lâcher (closeGarage, au départ de cette
     piste) en restaient. Sous le nuage blanc et sous le voile chaud de l'atelier, elle se fait LÉGÈRE (`rebuildMenuScene(true)` → newTrack0
     sans buildTrack, padsInstancier, computeMinimap ni spawnPickups ; le ciel et tout le reste comme avant) et resetGame repose la caméra
     comme closeGarage l'aurait posée (`PREB.cam`), au départ de la piste neuve : même place pour toutes les maps dont le départ ne dépend pas
     de la graine (toutes, sauf la jade : son départ tiré au hasard — la caméra y part maintenant de derrière la caisse, comme au 1er JOUER et au
     REJOUER, au lieu de partir du départ d'une piste jetée).
   `?prebati=0` : tout comme avant. Console : dbgPrebati() (dep : le départ d'avance). */
function prebDepCible(){ // la 1re piste du prochain départ, quand on sait la bâtir d'avance (le JOUER du mode classique, le REJOUER)
  if(!SF.on||PARK.on||TUTO.on||BALADE||JADE_JEU||SURV.armed||JSG_ESSAI||!sfPlayOk()||jadePlayOk())return null;
  if(SF.neuf&&SF.tirage[0]){const t=SF.tirage[0];if(!SF_CARTES[t.carte])return null; // le JOUER est parti (le piqué, le lâcher, l'atelier qui attend) : c'est SON tirage
    if(started&&gameOver)return {t:t,z:0,zn:0,dep:true,st:true,eng:vdepPal()}; // resetGame le prendra (LA VITESSE DE DÉPART : au palier du cran choisi, que resetGame posera)
    return CHUTE.sous||GAR.sous?{t:t,z:0,zn:0,dep:true,st:false,eng:vdepPal()}:null;} // sous9, au bout du piqué ou du lâcher (déjà passé : la piste est bâtie)
  if(SF.force&&!(SF.force.carte&&SF_CARTES[SF.force.carte]))return null; // un lien de test sans map valide : tiré au départ, comme avant
  if(SF.prochain&&(SF.prochainDer!==SF.der||SF.force))SF.prochain=null; // périmé : le dernier couple a changé, ou un lien de test impose sa map
  if(!SF.prochain){SF.prochain=SF.force?sfImpose(SF.der):sfTire(SF.der);SF.prochainDer=SF.der;} // tiré D'AVANCE, par la règle du départ
  const t=SF.prochain;if(!SF_CARTES[t.carte])return null;
  return {t:t,z:0,zn:0,dep:true,st:!!started,eng:vdepPal()};} // (LA VITESSE DE DÉPART) sous9 comme resetGame posent le palier du cran choisi avant de bâtir
function prebDepTick(now){ // (prebTick, hors course) commencer, vérifier, travailler
  if(PREB.W&&!PREB.dep){prebAnnule('fin');return;} // la piste d'en face d'une partie finie
  if(started&&gameOver){if(!PREB.fin0)PREB.fin0=now;}else PREB.fin0=0;
  const c=prebDepCible();
  if(PREB.W&&(!c||c.t!==PREB.t||c.st!==PREB.ctx||c.eng!==PREB.eng)){prebAnnule(!c?'cible':c.t!==PREB.t?'map':'contexte');return;}
  if(!c||PREB.fait)return;
  if(ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go)||CHUTE.go||!CHAUFFE_R.fait||CHAUFFE_R.t||(!JADE.geos&&!GAB_FOND.fini))return; // ni volet, ni lâcher, ni piqué ; la chauffe et les gabarits de la jade d'abord
  if(now-PREB.tNeuf<700||(PREB.fin0&&now-PREB.fin0<800))return; // le monde neuf (le menu, l'écran de fin) s'installe d'abord
  if(!PREB.W){if(c.t!==PREB.non&&PREB.echecs<3)prebPart(c);return;} // (l'image suivante travaille)
  chauffeGrace(); // (la qualité auto ne lit pas une tranche comme une faiblesse, comme jadeGabFond)
  const tr=QLR.t0?performance.now()-QLR.t0:8;
  prebTravaille(performance.now()+Math.max(3,Math.min(6,14-tr)));}
function prebDepPrend(fn){PREB.depPorte=true;try{fn();}finally{PREB.depPorte=false;PREB.prend=false;}} // c'est le DÉPART qui construit : la piste bâtie d'avance peut servir
window.dbgPrebati=function(on){if(on!=null){PREB.on=!!on;if(!PREB.on)prebAnnule('dbg');}
  return {on:PREB.on,etat:PREB.W?(PREB.fait?'pret':'en cours'):'',carte:PREB.carte,graine:PREB.sd,palier:PREB.eng,palierCourse:engTier,reste:+((L-s)/Math.max(20,PREB.v||60)).toFixed(1),v:Math.round(PREB.v||0),ms:PREB.W||PREB.tFin?Math.round((PREB.tFin||performance.now())-PREB.t0):0,
    dep:PREB.W&&PREB.dep?{pourStarted:PREB.ctx,prochain:SF.prochain?SF.prochain.carte+'-'+SF.prochain.meteo:null}:null,prisAuDepart:PREB.depPris,legers:PREB.legers, // (LE DÉPART D'AVANCE)
    cpu:+PREB.cpu.toFixed(1),images:PREB.img,pris:PREB.pris,finisAuPassage:PREB.finis,msFin:PREB.msFin,annules:PREB.annules,der:PREB.der,echecs:PREB.echecs,jade:!!PREB.jadeM,
    err:window.__prebErr?String(window.__prebErr.stack||window.__prebErr).slice(0,400):null};};
function* pisteRoute(seed,W){ // (LE PRÉ-BÂTI) la route de buildTrack, en tranches — sur l'état de travail W (voir prebEchange), jamais sur la scène
  trackMeshes.length=0;PISTE_LOD.length=0;NEON_RAILS.length=0;NEON_GLOW.length=0;PADS=[];PADL=[];PAD_MATS.length=0;OILS=[];
  const rnd=mulberry32(seed);VILLE_ENTREE=null;MODMARK.length=0;TROUMARK.length=0;TROUS=[];TROU=null;
  THICK=THICK_ROUTE; /* (2026-10-13) la route normale reprend ses 2,6 m — 3,9 depuis le 2026-10-15, 5,2 le soir (THICK_ROUTE) */const JADE9=!!(LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&!JADE_JEU&&!LVL.cur.sansFin); /* (2026-10-13) au mode classique aussi, la jade est un vrai niveau */const BANQ9=!!(LVL.cur&&LVL.cur.piste==='banquise'&&!PARK.on); /* (2026-10-15, Sacha : « pas besoin de mettre les mêmes modules que dans les nuages ») LE GLACIER : une route nue, comme la jade — ses pièges à lui sont le VERGLAS (bkVerglas) */ // (2026-10-09) LES PICS DE JADE : une route nue (ni pad, ni flaque, ni plot)
  // (l'entrée surélevée n'existe que si genCtrl la pose : niveau VILLE généré) · (les modules aussi : le parc, l'école et la campagne n'en ont pas)
  let ctrl=(LVL.cur&&LVL.cur.piste==='tuto')?genTuto():(LVL.cur&&LVL.cur.piste==='jade')?genJade(rnd):(LVL.cur&&LVL.cur.piste==='foret')?(yield* genForet(rnd)):(LVL.cur&&LVL.cur.piste==='volcan')?(yield* genVolcan(rnd)):(LVL.cur&&LVL.cur.piste==='canyon')?(yield* genCanyon(rnd)):(LVL.cur&&LVL.cur.piste==='dunes')?(yield* genDunes(rnd)):(LVL.cur&&LVL.cur.piste==='banquise')?genBanq(rnd):(LVL.cur&&LVL.cur.piste==='grotte')?(yield* genGrotte(rnd)):genCtrl(rnd,new THREE.Vector3(0,0,0),0); // FREESTYLE : le parc de figures remplace la piste de course · (2026-09-27) CAMPAGNE : la piste dessinée du niveau
  TORD.on=false;TORD.N=null;if(hautOn()||espTordOn()){TORD.ctrl0=ctrl;TORD.seed=seed|0;const h9=pisteTordPropre(ctrl,seed|0);ctrl=h9.ctrl;TORD.N=h9.N;TORD.on=true;}else if(LVL.cur&&LVL.cur.piste==='dunes'&&DN.bankN&&!PARK.on)TORD.N=DN.bankN; /* (2026-10-23, DUNES) la route penchée dans les virages : les normales de genDunes, sans TORD.on */ // (2026-10-15) LA ROUTE SANS HAUT NI BAS : la piste des NUAGES ré-enroulée dans l'espace (voir pisteTord) — (2026-10-22) et celle de l'ORBITE (voir ROUTE_LIBRE)
  const curve=new THREE.CatmullRomCurve3(ctrl,false,'centripetal'); // (piste v7) centripète : l'uniforme faisait des COUDES entre points inégalement espacés (liaison courte après une grande figure)
  /* (2026-09-30, revue PISTE) LE PAS DE LA PISTE. Tout le jeu suppose `pts` ÉQUIDISTANTS (frameAt : f = s/L·(NP−1) ; s avance en mètres).
     Or three r128 ne mesure la longueur qu'en 200 tronçons (`arcLengthDivisions`) pour les 450-550 points de contrôle de genCtrl : entre
     deux mesures il suppose le paramètre uniforme, alors qu'un point de virage (≤ 12°) est à 20 m du suivant et un point de droite à 150.
     MESURÉ (6 graines × 4 niveaux, node) : écart réel/supposé p1 0,38-0,49 · p99 1,52-1,98 · extrêmes 0,16-3,5 ; ~58 sauts de vitesse
     monde ≥ ×1,5 d'un point au suivant par zone ; L sous-estimée de ~100 m (parc : −6 %). La caisse accélérait et freinait EN SILENCE
     (le compteur ne bougeait pas), plots et pads n'étaient pas aux mètres annoncés. 16 mesures par point de contrôle : p1-p99 0,99-1,01,
     zéro saut, L exacte, +3 ms à la construction (banc piste/pas.js, temps.js). */
  curve.arcLengthDivisions=Math.max(200,ctrl.length*16);
  yield;L=curve.getLength();yield;
  const N=Math.min(PARK.on?11000:9000,Math.max(3000,Math.round(L))); // parc : plus long → plus de points pour garder les loops lisses
  pts=[];for(let d9=0;d9<=N;d9++){pts.push(curve.getPointAt(d9/N));if((d9&1023)===1023)yield;}NP=pts.length; // (LE PRÉ-BÂTI) getSpacedPoints en tranches : three r128 fait exactement cette boucle
  let sEnt=0; // (2026-09-29) L'ENTRÉE DANS LA VILLE : la droite surélevée est NUE (ni plot, ni flaque, ni dos d'âne) — le temps de s'adapter ; les tirages restent consommés
  if(VILLE_ENTREE){let dA=1e18,iA=0;const lim=Math.min(NP,Math.ceil(NP*.45));for(let i=0;i<lim;i++){const a=pts[i].distanceToSquared(VILLE_ENTREE.pA);if(a<dA){dA=a;iA=i;}}sEnt=iA*L/(NP-1)+80;VILLE_ENTREE.sA=sEnt;} // (+80 m : pas de plot caché juste derrière la bascule de la rampe)
  /* (2026-09-30, revue PISTE) LE SAS DU PORTAIL. On repart en s = 0 À PLEINE VITESSE, pendant le fondu sombre (BIO.dip, 1,2 s) et la
     bannière du niveau : le 1er plot tombait 300-520 m plus loin — 2 s au palier 10, ~1 s au palier 20, souvent avant d'avoir revu la
     route. Les 2,5 premières secondes de croisière sont nues (≈ 195 m au palier 0 : rien ne change ; ≈ 850 m en fin de partie). Les
     tirages restent consommés (les filtres passent après eux). Pas dans le parc, l'école ni la campagne : leurs pistes sont dessinées. */
  const gen9=!PARK.on&&!(LVL.cur&&(LVL.cur.piste==='tuto'||LVL.cur.piste==='camp')),vC9=70+(lvPiste()-1)*100; // vC9 : la croisière de conception de la piste (m/s, celle du filet)
  if(gen9)sEnt=Math.max(sEnt,2.5*vC9);
  MODS=[]; // les tronçons des MODULES (voir MODMARK) : index de contrôle → abscisse exacte, par la table de longueurs de la courbe elle-même
  if(MODMARK.length){const lg9=curve.getLengths(),n9=Math.max(1,ctrl.length-1),sDe=i=>{const f=i/n9*(lg9.length-1),k=Math.max(0,Math.min(lg9.length-2,Math.floor(f)));return lg9[k]+(lg9[k+1]-lg9[k])*(f-k);};
    for(const m of MODMARK)MODS.push({s0:sDe(m.i0)-60,s1:sDe(m.i1)+vC9});} // −60 m : un groupe de plots (≤ 45 m) ne déborde pas dedans · +1 s de croisière : la réception du voltigeur
  const inModule=sp=>{for(const m of MODS)if(sp>m.s0&&sp<m.s1)return true;return false;};
  /* (LES TROUS, 2026-10-20) les vides entre les segments de route des DUNES : index de contrôle → abscisse (la même table de longueurs que les modules) → lignes de pts.
     TROU[k] = 1 : pas de ruban entre pts[k] et pts[k+1]. Les segments restent entiers : le trou va de la dernière ligne du segment (a) à la première du suivant (b). */
  TROUS=[];TROU=null;
  if(TROUMARK.length){const lg9=curve.getLengths(),n9=Math.max(1,ctrl.length-1),sDe=i=>{const f=i/n9*(lg9.length-1),k=Math.max(0,Math.min(lg9.length-2,Math.floor(f)));return lg9[k]+(lg9[k+1]-lg9[k])*(f-k);};
    TROU=new Uint8Array(NP);const pas9=L/(NP-1);
    for(const m of TROUMARK){const s0=sDe(m.i0),s1=sDe(m.i1),a=Math.max(0,Math.min(NP-2,Math.round(s0/pas9))),b=Math.max(a+1,Math.min(NP-1,Math.round(s1/pas9)));
      for(let k=a;k<b;k++)TROU[k]=1;TROUS.push({s0:a*pas9,s1:b*pas9,a:a,b:b});}}
  trackMinY=Infinity;for(let i=0;i<NP;i++)if(pts[i].y<trackMinY)trackMinY=pts[i].y; // plancher du monde
  T=[];Nn=[];B=[];
  for(let i=0;i<NP;i++){
    const j=Math.min(i+1,NP-1),k=Math.max(i-1,0);
    T.push(new THREE.Vector3().subVectors(pts[j],pts[k]).normalize());if((i&2047)===2047)yield;
  }
  let n=new THREE.Vector3(0,1,0);
  n.addScaledVector(T[0],-n.dot(T[0])).normalize();
  /* (piste v7, 2026-09-26, user : « la génération de la route n'est toujours pas adaptée à la conduite ») — MESURÉ (pilote 150 ms sur les
     vraies pistes, banc v6/piste/conduite) : le repère était transporté SANS JAMAIS revenir vers la verticale. Après une hélice ou un
     looping la dalle restait penchée (> 45° sur la moitié de la piste) : chaque montée/descente devenait un VIRAGE à braquer, et un
     looping pris sur une dalle déjà penchée un virage impossible — 0,41 sortie/km pour un bon pilote, 7,8 % de piste infaisable même
     pouce à fond. Désormais la dalle se REDRESSE doucement (≤ 0,05 rad/m) partout où la route n'est ni raide (|T.y| < 0,7) ni à
     l'envers (le haut d'un looping n'est JAMAIS retourné) : 0,019 sortie/km, 1,2 % infaisable (le reste : le haut des loopings). */
  const q=new THREE.Quaternion(),upT9=new THREE.Vector3(),cT9=new THREE.Vector3(),RAPPEL9=.05;
  /* (2026-10-15) LA ROUTE SANS HAUT NI BAS : la dalle ne se redresse plus vers le ciel — sa normale est celle que pisteTord a roulée, reprise
     point de contrôle par point de contrôle (même paramètre que getSpacedPoints) puis remise d'équerre sur la tangente. */
  if(TORD.N){const HN=TORD.N,nc=HN.length-1;
    for(let i=0;i<NP;i++){if((i&1023)===1023)yield;const f=curve.getUtoTmapping(i/(NP-1))*nc,k=Math.min(nc-1,Math.floor(f)),w=f-k;
      n.copy(HN[k]).multiplyScalar(1-w).addScaledVector(HN[k+1],w);n.addScaledVector(T[i],-n.dot(T[i]));if(n.lengthSq()<1e-10)n.copy(Nn[i-1]||HN[0]);n.normalize();
      Nn.push(n.clone());B.push(new THREE.Vector3().crossVectors(n,T[i]));}}
  else for(let i=0;i<NP;i++){if((i&1023)===1023)yield;
    Nn.push(n.clone());
    B.push(new THREE.Vector3().crossVectors(n,T[i]));
    if(i<NP-1){
      q.setFromUnitVectors(T[i],T[i+1]);
      n.applyQuaternion(q);
      n.addScaledVector(T[i+1],-n.dot(T[i+1])).normalize();
      {const t9=T[i+1],ty9=Math.abs(t9.y);
       if(ty9<.7&&n.y>0){upT9.set(-t9.x*t9.y,1-t9.y*t9.y,-t9.z*t9.y);if(upT9.lengthSq()>1e-8){upT9.normalize();
         const th9=Math.atan2(cT9.crossVectors(n,upT9).dot(t9),n.dot(upT9)),ds9=pts[i+1].distanceTo(pts[i]),mx9=RAPPEL9*ds9*(1-ty9/.7);
         n.applyAxisAngle(t9,THREE.MathUtils.clamp(th9,-mx9,mx9));n.addScaledVector(t9,-n.dot(t9)).normalize();}}}
    }
  }
  /* (2026-09-28, chasse aux gels) LA CONSTRUCTION SANS TABLEAUX JS — MESURÉ (profil, 4 constructions) : un tiers de buildTrack partait
     dans des `push()` de centaines de milliers de nombres, recopiés ensuite en Float32Array, et dans computeVertexNormals. Chaque tampon
     est désormais un tableau TYPÉ à sa taille exacte, écrit en place : mêmes expressions, calculées dans le même ordre, et l'arrondi en
     float32 se fait à l'écriture exactement comme il se faisait à la conversion — mêmes octets (empreinte vérifiée sur 3 niveaux × 9 graines :
     sommets, index, normales, couleurs, UV, sphères, tableaux physiques). La teinte du bitume ne se
     calcule qu'une fois pour ses deux faces (même fonction pure, mêmes arguments), ses sinus lents en cache. */
  FILETS=[]; // (2026-09-29) LA ROUTE QUI TE RATTRAPE : les filets posés par genCtrl, retrouvés sur la courbe lissée (voir FILET)
  if(FILETMARK.length){
    const nearF=p=>{let bi=-1,bd=1e12;for(let i=0;i<NP;i++){const dx=p.x-pts[i].x,dy=p.y-pts[i].y,dz=p.z-pts[i].z,dd=dx*dx+dy*dy+dz*dz;if(dd<bd){bd=dd;bi=i;}}return bd<3600?bi:-1;},sI=i=>i/(NP-1)*L;
    for(const m of FILETMARK){const a=nearF(m.A),e=nearF(m.E),n0=nearF(m.Nlo),n1=nearF(m.Nhi);
      if(a<0||e<0||n0<0||n1<0||!(a<e&&e<n0&&n0<n1))continue;
      FILETS.push({sC0:sI(a),sC1:sI(e),sN0:sI(n0),sN1:sI(n1),cote:-m.sg,R:m.R,vN:m.vN,paye:false,yN:Math.min(pts[n0].y,pts[n1].y)});}
  }
  campCourbure(); // (2026-09-27) la courbure latérale en chaque point (les filets, la ligne de la caisse-nuage)
  // ROUTE ÉPAISSE : grain LONGITUDINAL — stries dans le sens de la route (effet vitesse)
  const sideL_=new Float32Array(NP*6),sideR_=new Float32Array(NP*6),sideU_=new Float32Array(NP*4);let accT9=0; // sideU_ : (haut 0 / bas 1, mètres le long de la piste) — le liseré des tranches (voir trancheMat)
  const nz=i=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x);};
  yield;for(let i=0;i<NP;i++){if((i&2047)===2047)yield;
    const p=pts[i],b=B[i],nn=Nn[i];if(i>0)accT9+=p.distanceTo(pts[i-1]);const u4=i*4;sideU_[u4]=0;sideU_[u4+1]=accT9;sideU_[u4+2]=1;sideU_[u4+3]=accT9;
    const tl0=p.x-b.x*ROAD_HALF,tl1=p.y-b.y*ROAD_HALF,tl2=p.z-b.z*ROAD_HALF;
    const tr0=p.x+b.x*ROAD_HALF,tr1=p.y+b.y*ROAD_HALF,tr2=p.z+b.z*ROAD_HALF,k6=i*6;
    sideL_[k6]=tl0;sideL_[k6+1]=tl1;sideL_[k6+2]=tl2;sideL_[k6+3]=tl0-nn.x*THICK;sideL_[k6+4]=tl1-nn.y*THICK;sideL_[k6+5]=tl2-nn.z*THICK;
    sideR_[k6]=tr0;sideR_[k6+1]=tr1;sideR_[k6+2]=tr2;sideR_[k6+3]=tr0-nn.x*THICK;sideR_[k6+4]=tr1-nn.y*THICK;sideR_[k6+5]=tr2-nn.z*THICK;
  }
  /* (2026-09-27, passe perf iPhone) les géométries ENTIÈRES sont bâties comme avant, puis découpées (voir pisteTranches). `normales9` :
     les normales calculées sur le maillage ENTIER, exactement comme le faisait computeVertexNormals — les tranches les recopient.
     (2026-09-28, chasse aux gels) …et c'est désormais SON calcul, recopié opération par opération sur les tableaux bruts (somme des
     produits vectoriels arrondie en float32 à chaque triangle, lue puis écrite dans le même ordre, puis normalisation `x*(1/(long||1))`) :
     mêmes octets, 3 à 4 fois plus vite (plus de Vector3, plus de getX/setXYZ). */
  const normales9=function*(P9,I9){const N9=new Float32Array(P9.length);
    for(let t=0,n=I9.length;t<n;t+=3){if(t%60000===0&&t)yield;const a=I9[t]*3,b=I9[t+1]*3,c=I9[t+2]*3;
      const pBx=P9[b],pBy=P9[b+1],pBz=P9[b+2],cbx=P9[c]-pBx,cby=P9[c+1]-pBy,cbz=P9[c+2]-pBz,abx=P9[a]-pBx,aby=P9[a+1]-pBy,abz=P9[a+2]-pBz;
      const nx=cby*abz-cbz*aby,ny=cbz*abx-cbx*abz,nw=cbx*aby-cby*abx;
      const ax=N9[a]+nx,ay=N9[a+1]+ny,az=N9[a+2]+nw,bx=N9[b]+nx,by=N9[b+1]+ny,bz=N9[b+2]+nw,cx=N9[c]+nx,cy=N9[c+1]+ny,cz=N9[c+2]+nw; // lus TOUS avant d'écrire (comme three)
      N9[a]=ax;N9[a+1]=ay;N9[a+2]=az;N9[b]=bx;N9[b+1]=by;N9[b+2]=bz;N9[c]=cx;N9[c+1]=cy;N9[c+2]=cz;}
    for(let k=0,n=N9.length;k<n;k+=3){if(k%90000===0&&k)yield;const x=N9[k],y=N9[k+1],z=N9[k+2],s=1/(Math.sqrt(x*x+y*y+z*z)||1);N9[k]=x*s;N9[k+1]=y*s;N9[k+2]=z*s;}
    return N9;};
  const strip=function*(arrs,mat){ // (passe perf) les deux flancs d'un coup : un maillage, une matière, découpé en tranches
    const na=arrs.length,P9=new Float32Array(na*NP*6),UV9=new Float32Array(na*NP*4),I9=new Uint32Array(na*(NP-1)*6);let w=0;
    for(let a9=0;a9<na;a9++){const vb=a9*NP*2;P9.set(arrs[a9],a9*NP*6);UV9.set(sideU_,a9*NP*4);
      for(let i=0;i<NP-1;i++){const a2=vb+2*i,b2=a2+1,c2=a2+2,d2=a2+3;I9[w++]=a2;I9[w++]=c2;I9[w++]=b2;I9[w++]=b2;I9[w++]=c2;I9[w++]=d2;}}
    const N9=yield* normales9(P9,I9);yield* pisteTranches({position:[P9,3],normal:[N9,3],uv:[UV9,2]},{blocs:2,pr:2,np:NP,pas:1},mat,{ombre:true});
  };
  // faces roulables : COLS colonnes de vertex → stries longitudinales + micro-grain étiré
  const COLS=11;
  /* LA TEINTE D'UNE CASE (grain DIVISÉ par 2, même luminosité moyenne : le premier plan se calme, l œil reste sur la route et le ciel) :
     laneShade[c9]+nz(c9*131.7+(i>>5)*7.77)*.05+nz(c9*53.1+(i>>1)*3.3)*.05+nz(i*7.71+c9*13.7)*.03-.08, × dim (=1 : les DEUX faces à pleine
     lumière, même texture dessus et dessous). (2026-09-28, chasse aux gels) Elle ne dépend QUE de (i, c9), jamais de la piste : MESURÉ, ses
     ~300 000 sinus coûtaient ~9 ms à chaque portail. Elle est donc calculée UNE fois pour la session (`TEINTE9`, les trois flottants de la
     couleur de chaque case, agrandie si une piste compte plus de points), puis recopiée — mêmes expressions, mêmes octets. */
  if(TEINTE9.n<NP){
    const laneShade=[];
    for(let c9=0;c9<COLS;c9++)laneShade.push(.80+nz(c9*97.31)*.16-Math.abs(c9-(COLS-1)/2)/(COLS-1)*.06);
    const JA9=(NP>>5)+1,JB9=(NP>>1)+1,nzA=new Float64Array(COLS*JA9),nzB=new Float64Array(COLS*JB9); // les deux premiers sinus ne dépendent que de i>>5 et i>>1
    for(let c9=0;c9<COLS;c9++){for(let j=0;j<JA9;j++)nzA[c9*JA9+j]=nz(c9*131.7+j*7.77);for(let j=0;j<JB9;j++)nzB[c9*JB9+j]=nz(c9*53.1+j*3.3);}
    const a9=new Float32Array(NP*COLS*3),dim=1;if(TEINTE9.c)a9.set(TEINTE9.c);
    for(let i=TEINTE9.n;i<NP;i++){if((i&511)===511)yield;for(let c9=0;c9<COLS;c9++){const sh=(laneShade[c9]+nzA[c9*JA9+(i>>5)]*.05+nzB[c9*JB9+(i>>1)]*.05+nz(i*7.71+c9*13.7)*.03-.08)*dim,k3=(i*COLS+c9)*3;
      a9[k3]=sh;a9[k3+1]=sh;a9[k3+2]=sh+.04;}}
    TEINTE9.c=a9;TEINTE9.n=NP;}
  {const nF=NP*COLS,P9=new Float32Array(2*nF*3),C9=new Float32Array(2*nF*3),UV9=new Float32Array(2*nF*2),I9=new Uint32Array(2*(NP-1)*(COLS-1)*6); // (passe perf) les DEUX faces dans un seul maillage (sommets disjoints : mêmes normales qu'en deux), découpé en tranches
  const oC9=new Float64Array(COLS);for(let c9=0;c9<COLS;c9++)oC9[c9]=-ROAD_HALF+2*ROAD_HALF*c9/(COLS-1);
  C9.set(TEINTE9.c.subarray(0,nF*3));C9.copyWithin(nF*3,0,nF*3); // les teintes, dessus puis dessous (les MÊMES)
  let w=0,f9=0;
  for(const fy of [0,-THICK]){
    let acc9=0;const vb=f9*nF; // (bitume v2) UV en MÈTRES/4 : le grain garde la même taille quelle que soit la largeur de route
    for(let i=0;i<NP;i++){if((i&511)===511)yield;
      const p=pts[i],b=B[i],nn=Nn[i];
      if(f9===0&&i>0)acc9+=p.distanceTo(pts[i-1]);
      for(let c9=0;c9<COLS;c9++){
        const o=oC9[c9],k3=(vb+i*COLS+c9)*3;
        P9[k3]=p.x+b.x*o+nn.x*fy;P9[k3+1]=p.y+b.y*o+nn.y*fy;P9[k3+2]=p.z+b.z*o+nn.z*fy;
        if(f9===0){const k2=(i*COLS+c9)*2;UV9[k2]=(o+ROAD_HALF)*.25;UV9[k2+1]=acc9*.25;}
      }
    }
    if(f9===1)UV9.copyWithin(nF*2,0,nF*2); // la face du dessous : les MÊMES UV que le dessus (mêmes calculs, déjà faits)
    for(let i=0;i<NP-1;i++){if((i&1023)===1023)yield;
      for(let c9=0;c9<COLS-1;c9++){
        const a2=vb+i*COLS+c9,b2=a2+1,c2=a2+COLS,d2=c2+1;
        I9[w++]=a2;I9[w++]=c2;I9[w++]=b2;I9[w++]=b2;I9[w++]=c2;I9[w++]=d2;
      }
    }
    f9++;
  }
    // BITUME NUIT VIOLET : sombre pour que les LUMIÈRES y vivent (nitro, boost, phares) — spéculaire ROSÉ, le soleil rasant peint une traînée magenta-braise
    // SPÉCULAIRE BRAISE CUIVRÉE (2026-07-20) : l'ancien mauve 0x9a5568 (bleu > vert) teintait TOUS les
    // reflets vers le MAGENTA — feux arrière roses, soleil pincé en point plastique. La braise 0x8a524a
    // garde le chaud mais laisse chaque lumière imposer SA teinte ; shininess 58→40 : lobe plus large,
    // reflet qui NAPPE le bitume au lieu de piquer — la route reste sensuelle, plus crédible.
    // (2026-09-25) LE BITUME v2 — voir roadMat : l'ancien spéculaire saumon au lobe énorme dessinait les taches roses.
    // (passe perf) UNE matière pour les deux faces : c'étaient deux jumelles (même programme, mêmes réglages, mêmes uniformes partagés).
    // (tour 2) la face cachée jetée par le GPU (voir BITUME) : le bloc du DESSOUS est retourné — normales et couleurs niées (calculées
    // d'abord comme avant, sur le maillage entier), triangles en sens inverse (`inv`, posé par pisteTranches/pisteMaigre). C9 est une
    // COPIE des teintes de la session (TEINTE9) : la nier ne touche pas au cache.
    const N9=yield* normales9(P9,I9),inv9=BITUME.face?[false,true]:null;
    if(inv9)for(let q=nF*3;q<2*nF*3;q++){if((q&131071)===0)yield;N9[q]=-N9[q];C9[q]=-C9[q];}
    yield* pisteTranches({position:[P9,3],normal:[N9,3],color:[C9,3],uv:[UV9,2]},
      {blocs:2,pr:COLS,np:NP,pas:1,inv:inv9},roadMat(),{ombre:true,loin:{blocs:2,pr:COLS,cols:[0,COLS-1],inv:inv9}}); // le bitume reçoit les OMBRES LONGUES
  }
  const flank=trancheMat();JADE.flank=flank; // tranches violet-noir : elles boivent le fill néon — (2026-09-26) + leur liseré d'accent et leurs catadioptres
  yield* strip([sideL_,sideR_],flank);
  // ACCENT DE ZONE : chaque piste choisit SON néon — la nuit change de couleur à chaque portail
  const ACCENTS=[0xf24aa0,0x3ee6f0,0xffb445,0x50f0a8,0xa06bff,0xff6a55]; // rose · cyan · ambre · menthe · violet électrique · corail
  /* (2026-09-26, vague 2) LE LISERÉ SUIT LE MONDE, PLUS LE HASARD. Tiré parmi six néons, il pouvait sortir MENTHE ou CORAIL aux NUAGES
     et cyan dans la ville magenta : la route ne parlait pas la langue de son niveau. Désormais NUAGES = le cyan de l'AIR #3ee6f0,
     VILLE = le rose néon #f24aa0, ORBITE = le cyan froid #5ee6ff. ⚠ Le TIRAGE reste (il nourrit le parc, l'auto-école, la carrière
     hors de ces trois mondes) : le flux rnd de la piste ne bouge pas d'un pas. */
  const accR=ACCENTS[Math.floor(rnd()*ACCENTS.length)],idA9=LVL.cur&&!PARK.on?LVL.cur.id:'';
  const accC=new THREE.Color(idA9==='nuages'?0x3ee6f0:idA9==='ville'?(LVL.cur.crypto?0x35ff9e:LVL.cur.vitre?0x2f8cff:0xf24aa0):idA9==='espace'?0x5ee6ff:idA9==='orage'?0x8a7dff:idA9==='jade'?0x4fe0a8:idA9==='foret'?0xd8b45a:idA9==='volcan'?0xf24aa0:idA9==='banquise'?0xff5fd0:idA9==='grotte'?0x3ef0ff:accR); // (v12) les PICS DE JADE : l'accent jade (l'or de la v11 retiré : « le jaune et le vert, ça fait moche ») // (2026-09-29) L'ORAGE : le violet électrique de l'éclair // PARIS : une peinture de rive blanche, pas un néon
  {const ia9=Math.max(0,ACCENTS.indexOf(accR));ACCENTS.splice(0,6,0xffb04a,0xf2b93b,0xe8e4da,0xffc477,0xf2b93b,0xffb04a);accC.setHex((routeSig()&&idA9!=='ville')?0xf24aa0:idA9==='espace'?0xe8eef2:idA9==='jade'?0xf2b93b:(idA9==='nuages'||idA9==='orage'||idA9==='ville')?((villeRose()||routeSig())?0xf24aa0:0xffb04a):ACCENTS[ia9]);} /* (villerose) la ville au néon garde son accent ROSE */ // (2026-10-14, bords-route) L'ACCENT N'EST PLUS UN NÉON : ambre sodium (nuages, ville, orage, hasard), or (jade), blanc froid (orbite) — il nourrit le reflet des flaques (uAcc), le liseré des flancs, la couronne des tours (buildVoxCity) et le ciel musical
  vtCol(accC,vtCur()); // (2026-10-16) LES TEINTES DE LA VILLE : le rose de la route prend la couleur de la ville (rails, nappe, flaques, couronnes des tours)
  W.accC=accC; // (LE PRÉ-BÂTI) posé sur le bitume à l'installation (pisteInstalle) — (2026-09-26) le bitume mouillé reflète aussi l'accent de la zone
  // BANDES NÉON (dessus + dessous) : les rails de Vice City — couleur d'accent de la zone
  {const ep=new Float32Array(4*NP*6),el=new Float32Array(4*NP*6),es9=new Float32Array(4*NP*2),dS9=L/Math.max(1,NP-1);let q=0; // (passe perf) les QUATRE rails dans un seul maillage, une seule matière (le caméléon les peignait tous pareil), découpé en tranches — (chasse aux gels) écrits en place
  for(const fy of [0,-THICK]) for(const sd of [-1,1]){ // el : `aLat`, du milieu du rail vers chaque bord (voir traitMat)
    for(let i=0;i<NP;i++,q+=6){if((i&2047)===2047)yield;
      const p=pts[i],b=B[i],nn=Nn[i],o=sd*(ROAD_HALF+.05),h=fy+(fy===0?.06:-.06);
      ep[q]=p.x+b.x*(o-sd*.6)+nn.x*h;ep[q+1]=p.y+b.y*(o-sd*.6)+nn.y*h;ep[q+2]=p.z+b.z*(o-sd*.6)+nn.z*h;
      ep[q+3]=p.x+b.x*o+nn.x*h;ep[q+4]=p.y+b.y*o+nn.y*h;ep[q+5]=p.z+b.z*o+nn.z*h;
      el[q]=-b.x*sd*.3;el[q+1]=-b.y*sd*.3;el[q+2]=-b.z*sd*.3;el[q+3]=b.x*sd*.3;el[q+4]=b.y*sd*.3;el[q+5]=b.z*sd*.3;
      es9[q/3]=es9[q/3+1]=i*dS9; // (2026-10-18, boost RGB) l'abscisse de la piste : l'arc-en-ciel court le long de la route
    }
  }
    const mat9=traitMat(new THREE.MeshBasicMaterial({color:accC,side:THREE.DoubleSide,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),1.5,0);
    mat9.userData.base=accC.clone(); // la teinte d'accent de la zone, à retrouver après chaque pulsation
    NEON_RAILS.push(mat9);
    yield* pisteTranches({position:[ep,3],aLat:[el,3],aS:[es9,1]},{blocs:4,pr:2,np:NP,pas:1},mat9,{marge:20});
  }
  // NAPPE DE LUEUR sous chaque bande : additif qui saigne vers l intérieur du bitume — sans fog, le néon perce
  // la brume et les rails roses filent jusqu au bout de la nuit (1 mesh par face : gauche+droite fusionnées)
  {const gp=new Float32Array(4*NP*6),gc=new Float32Array(4*NP*6),gl=new Float32Array(4*NP*6),gs9=new Float32Array(4*NP*2),dS9=L/Math.max(1,NP-1);let q=0; // (passe perf) les deux faces dans un seul maillage, une seule matière (même opacité pulsée), découpé en tranches — (chasse aux gels) écrits en place
  for(const fy of [0,-THICK]){
    const mo9=LVL.cur&&LVL.cur.pluie?1:0,lg9=1.15+2.2*mo9,ka9=(.48+.14*mo9); // (2026-09-26) sous la PLUIE le bitume mouillé renvoie le rail : la nappe s'élargit (1,15 → 3,35 m) et chauffe un peu
    for(const sd of [-1,1]){
      for(let i=0;i<NP;i++,q+=6){if((i&2047)===2047)yield;
        const p=pts[i],b=B[i],nn=Nn[i],h=fy+(fy===0?.045:-.045);
        const oI=sd*(ROAD_HALF+.10-lg9),oO=sd*(ROAD_HALF+.10);
        gp[q]=p.x+b.x*oI+nn.x*h;gp[q+1]=p.y+b.y*oI+nn.y*h;gp[q+2]=p.z+b.z*oI+nn.z*h;
        gp[q+3]=p.x+b.x*oO+nn.x*h;gp[q+4]=p.y+b.y*oO+nn.y*h;gp[q+5]=p.z+b.z*oO+nn.z*h;
        gl[q]=-b.x*sd*lg9*.5;gl[q+1]=-b.y*sd*lg9*.5;gl[q+2]=-b.z*sd*lg9*.5;gl[q+3]=b.x*sd*lg9*.5;gl[q+4]=b.y*sd*lg9*.5;gl[q+5]=b.z*sd*lg9*.5;
        gs9[q/3]=gs9[q/3+1]=i*dS9; // (boost RGB) l'abscisse de la piste
        gc[q+3]=gc[q+4]=gc[q+5]=ka9; // noir additif = invisible → dégradé d'accent qui meurt sur l asphalte (le noir : les zéros du tableau neuf) — (2026-10-17, bords de la map) la FORCE seule : la teinte est dans la matière
      }
    }
  }
    const mat9=traitMat(new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),2,1);
    mat9.color.copy(accC); // (2026-10-17, bords de la map) la teinte de la nappe : l'accent de la zone (bmapPeint la repeint aux maps de la palette)
    mat9.userData.base=.78; // opacité de repos — la pulsation part de là et y revient
    NEON_GLOW.push(mat9);
    W.bords=true; // (LE PRÉ-BÂTI) bordsTick part à l'installation — (2026-10-14, bords-route) la 1re image du rail est déjà à la bonne couleur (chanfrein de jour / rail blanc de nuit)
    yield* pisteTranches({position:[gp,3],color:[gc,3],aLat:[gl,3],aS:[gs9,1]},{blocs:4,pr:2,np:NP,pas:1},mat9,{ordre:1,marge:20}); // ...et leur nappe aussi
  }
  // ligne centrale pointillée — sodium doré, comme les vraies voies rapides la nuit (les DEUX faces : zéro dessus-dessous)
  /* (2026-09-26) UNE VRAIE PEINTURE AU SOL. C'était un trait GL d'UN pixel : aussi fin sous la caisse qu'à 2 km, crénelé, et au loin des
     tirets plus courts qu'un pixel qui clignotaient. Désormais un ruban de 24 cm (une vraie ligne de voie) dont les tirets viennent
     d'une texture MIPMAPPÉE : de près des tirets nets en perspective, au loin la carte réduite en fait d'elle-même un filet continu et
     plus doux — plus de clignotement. Même rythme qu'avant (7 points de tiret sur 16), mêmes trous, zéro rnd(). */
  yield* (function*(){
    const nL9=2*Math.ceil(NP/2)*2,lp=new Float32Array(nL9*3),ll=new Float32Array(nL9*3),lu=new Float32Array(nL9*2),sp9=L/Math.max(1,NP-1),per=16*sp9;LIGNE_PER.v=per; /* (LES TIRETS FILENT) la période, pour le filé */let q3=0,q2=0; // (chasse aux gels) écrits en place
    for(const fy of [.05,-THICK-.05]){let acc=0;
      for(let i=0;i<NP;i+=2){if((i&2047)===2046)yield;if(i>0)acc+=pts[i].distanceTo(pts[i-2]);
        const p2=pts[i],nn=Nn[i],b=B[i];
        for(let sg=-1;sg<=1;sg+=2){lp[q3]=p2.x+nn.x*fy+b.x*sg*.12;lp[q3+1]=p2.y+nn.y*fy+b.y*sg*.12;lp[q3+2]=p2.z+nn.z*fy+b.z*sg*.12;
          ll[q3]=b.x*sg*.12;ll[q3+1]=b.y*sg*.12;ll[q3+2]=b.z*sg*.12;lu[q2]=sg<0?0:1;lu[q2+1]=acc/per;q3+=3;q2+=2;}}
    }
    // (passe perf) découpée en tranches : une paire de sommets tous les 2 points, par face
    yield* pisteTranches({position:[lp,3],aLat:[ll,3],uv:[lu,2]},{blocs:2,pr:2,np:Math.ceil(NP/2),pas:2},
      (function(){const m9=ligneMat();if(idA9==='jade'){m9.color.setHex(0xeaf0e8);m9.opacity=LIGNE_OPJ;JADE.ligne=m9;}return m9;})(),{ordre:1,marge:20,loin:0}); // (v12) aux PICS DE JADE : une ligne de jade pâle, discrète // au-delà du brouillard : plus de peinture (voir pisteTranches)
  })();
  yield;
  // pads turbo (les deux faces)
  W.ligneOn=ligneOnPour(); // (LE PRÉ-BÂTI) ligneRaz part à l'installation (pisteInstalle) — LA LIGNE PARFAITE : ses pads et ses fruits se posent EN COURSE (ligneTick)
  for(let sp=180+rnd()*150;sp<L-100;sp+=280+rnd()*280){
    rnd(); // (vague 2) l'ancienne couleur tirée au hasard (bleu / blanc / rouge) : la plaque est OR désormais, mais le TIRAGE reste — le flux rnd de la piste ne bouge pas d'un pas
    if(W.ligneOn)continue; // (2026-09-29) LA LIGNE PARFAITE pose les pads (voir ligneTick) — le tirage ci-dessus reste consommé
    if(JADE9||BANQ9)continue; // la course d'élan garde son SEUL boost, celui qu'on a posé volontairement
    if(enTrou(sp,10))continue; // (LES TROUS) pas de pad dans le vide entre deux segments
    // (2026-09-25) LE PAD EST UNE CIBLE : il vit sur une VOIE (gauche / axe / droite), déduite de sp — zéro rnd() consommé, la
    // génération en aval ne bouge pas. Avant, il se déclenchait sur toute la largeur : un turbo reçu sans rien faire.
    const pl=[0,-1,1][Math.floor(sp*.0071)%3]*Math.min(ROAD_HALF-2.95,Math.max(4.6,ROAD_HALF*.45)); // (route ÷2) la fenêtre de prise fait 4,1 (pad 2,75 + caisse) : à 0,45×ROAD_HALF la voie de côté tombait à 3,5 m au plancher, et rouler AU CENTRE raflait tous les pads — voie ≥ 4,6 m, et ≤ bord − 2,95 : le pad reste entier sur la dalle
    if(PADS_OFF)continue; // (2026-10-20, Léo : « les boosts de la route disparaissent ») plus de plaque turbo : le boost se gagne en attrapant des FRUITS (voir la ligne parfaite) — le tirage ci-dessus reste consommé
    PADS.push(sp);PADL.push(pl);
    for(const fy of [1,-1]){
      frameAt(sp,F);
      const m=new THREE.Mesh(padGeo,PAD_MAT); // (vague 2) la plaque d'OR, matière partagée (voir padTex)
      const nn=F.n.clone().multiplyScalar(fy);
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.b.clone().multiplyScalar(-fy),F.t.clone(),nn));
      m.position.copy(F.p).addScaledVector(F.b,pl).addScaledVector(F.n,fy>0?.1:-THICK-.1); // même repère que les pièces (F.b brut sur les deux faces)
      trackMeshes.push(m);
    }
  }
  // dos d'âne (2026-09-03) et plots de chantier (2026-10-14) — RETIRÉS. ⚠ LES BOUCLES RESTENT, SANS CORPS, ET C'EST VOLONTAIRE : leurs rnd() (en-tête,
  // et deux par tour pour les plots) sont CONSOMMÉS quoi qu'il arrive. Les supprimer décalerait toute la suite seedée (huile, pièces,
  // pouvoirs) et changerait des pistes qui n'ont rien à voir avec les dos d'âne.
  for(let sp=320+rnd()*260;sp<L-160;sp+=420+rnd()*420);
  // (Paris retiré — la ville a cédé sa place au ciel)
  yield;
  // FLAQUES D'HUILE : rares, et seulement là où on les VOIT — ligne droite, jamais en montée
  for(let sp=420+rnd()*500;sp<L-220;sp+=1240+rnd()*1520){ // intervalle doublé : miroir = même densité par face qu'avant
    if(rnd()<.4)continue; // encore plus rare
    const io=Math.floor(sp/L*(NP-1));
    const ia=Math.max(0,io-40),ib=Math.min(NP-1,io+40);
    const straight=T[ia].dot(T[ib])>.995;        // pas de virage (⚠ ce test à ±40 POINTS décide des 2 tirages ci-dessous : il reste, pour le flux rnd)
    const climbing=T[io].y>.04;                  // pas en montée (on ne la verrait pas)
    if(!straight||climbing)continue;
    frameAt(sp,F);
    const r9=2+rnd()*1.1, lo=(rnd()*2-1)*(ROAD_HALF-4.5);
    if(sp<sEnt||inModule(sp)||JADE9||BANQ9)continue; // (tirages consommés au-dessus : ce filtre ne décale pas le flux rnd)
    /* (2026-09-30, revue PISTE) LA LIGNE DROITE SE MESURE EN MÈTRES. ±40 points, c'était ±75 m au palier 0 mais la glisse (0,75 s,
       direction à 18 %) court ~220 m à ~300 m/s : en fin de partie elle débordait dans le virage suivant, volant mort. La flaque exige
       désormais une route qui ne s'écarte pas de plus de ~6° de son axe sur ±max(60 m, 1,1 s de croisière) — S compris (le test
       historique ne comparait que les deux bouts). Filtre APRÈS les tirages : le flux rnd est intact. */
    {const w9=Math.ceil(Math.max(60,1.1*vC9)/(L/(NP-1))),t9=T[io];let tordu=false;
     for(let k=Math.max(0,io-w9),e=Math.min(NP-1,io+w9);k<=e;k++)if(T[k].dot(t9)<.995){tordu=true;break;}
     if(tordu)continue;}
    /* (2026-10-20, Sacha : « enlève les taches d'huile sur le sol ») PLUS DE FLAQUES : la liste est vide, les tirages rnd restent consommés (la suite seedée ne bouge pas) */
    for(const of9 of []){ // la MÊME flaque sur les deux faces : zéro dessus-dessous
      const m=new THREE.Mesh(oilGeo,oilMat);
      m.scale.set(r9*1.35,r9,1);
      m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.b.clone(),F.t.clone().negate().multiplyScalar(of9),F.n.clone().multiplyScalar(of9)));
      m.position.copy(F.p).addScaledVector(F.b,lo).addScaledVector(F.n,of9>0?.05:-THICK-.05);
      trackMeshes.push(m);
      const rim=new THREE.Mesh(oilGeo,oilRimMat);
      rim.scale.set(r9*1.5,r9*1.12,1);
      rim.quaternion.copy(m.quaternion);
      rim.position.copy(F.p).addScaledVector(F.b,lo).addScaledVector(F.n,of9>0?.04:-THICK-.04);
      trackMeshes.push(rim);
      OILS.push({s:sp,lat:lo,r:r9,face:of9,ms:[m,rim]}); // ms : ses deux maillages (la flaque cachée par un banc est retirée après buildClouds)
    }
  }
  yield;
  for(let sp=300+rnd()*220;sp<L-170;sp+=340+rnd()*520){rnd();rnd();} // les plots de chantier (voir plus haut) : leurs tirages restent consommés
  W.rnd=rnd;W.gen9=gen9;W.vC9=vC9;W.accC=accC;
}
function buildTrack(seed){
  /* (2026-10-17) LE PRÉ-BÂTI (voir PREB) : la route — génération, courbe, repères, bitume, flancs, rails, nappe, ligne, pads,
     flaques — sort du générateur `pisteRoute` : bâtie d'avance en roulant vers le portail, ou ici d'un trait (même code, mêmes tirages
     rnd, dans le même ordre). `pisteInstalle` l'échange avec l'ancienne ; le décor qui suit se bâtit ici sur la route installée. */
  const W=prebPrend(seed)||pisteDirecte(seed);
  pisteInstalle(W);
  const rnd=W.rnd,gen9=W.gen9,vC9=W.vC9,accC=W.accC;
  // NUAGES : on roule DANS le ciel — grappes volumétriques traversables + couche lointaine diaphane
  buildClouds(rnd);
  /* (2026-09-30, revue GAMEPLAY) les 14 NUAGES D'HORIZON (sprites roses, fog:false) sont RETIRÉS : ils restaient en VILLE (où aucun nuage
     n'a sa place), perçaient la brume de l'ORAGE (650-1850 m contre une brume à 70/660) et la moitié tombait sous l'horizon dans l'abîme
     des NUAGES. Aucun tirage `rnd` n'avait lieu après eux dans buildTrack : la piste ne bouge pas. Le ciel lointain, c'est COTON. */
  /* (2026-09-30, revue PISTE) LE BANC NE CACHE PLUS DE PIÈGE. Un banc posé SUR la route (onRoad) se traverse à l'aveugle — c'est le jeu,
     et sa sortie paie la percée. Mais une flaque DANS le banc, ou dans la seconde qui suit sa sortie, ne se voit qu'une fois
     touchée. On retire la flaque (ses deux maillages) de sB − r − 10 m à sB + r + 1 s de croisière. Les bancs ne bougent pas, rien n'est tiré. */
  if(gen9){const Z9=[];
    const d9=(i,c)=>{const p=pts[i],dx=p.x-c.c.x,dy=p.y-c.c.y,dz=p.z-c.c.z;return dx*dx+dy*dy+dz*dz;};
    for(const c of CLOUDS){if(!c.onRoad)continue;let bi=0,bd=1e18; // le point de piste le plus proche du banc (grossier tous les 8, puis affiné) : ~90 bancs à l'orage
      for(let i=0;i<NP;i+=8){const dd=d9(i,c);if(dd<bd){bd=dd;bi=i;}}
      for(let i=Math.max(0,bi-8),e=Math.min(NP-1,bi+8);i<=e;i++){const dd=d9(i,c);if(dd<bd){bd=dd;bi=i;}}
      const sB=bi/(NP-1)*L;Z9.push(sB-c.r-10,sB+c.r+vC9);}
    if(Z9.length){const cache9=s9=>{for(let k=0;k<Z9.length;k+=2)if(s9>Z9[k]&&s9<Z9[k+1])return true;return false;};
      for(let k=OILS.length-1;k>=0;k--){const o=OILS[k];if(!o.ms||!cache9(o.s))continue;
        for(const m of o.ms){scene.remove(m);const j=trackMeshes.indexOf(m);if(j>=0)trackMeshes.splice(j,1);}
        OILS.splice(k,1);}}}
  /* PORTAIL D'ARRIVÉE — L'OVULE (2026-09-26, user : « plus gros et rond comme un ovule ; on peut le franchir en venant de n'importe
     quelle direction »). Plus un anneau de 24 m posé sur la route : une SPHÈRE de 55 m (plus large que la route qui la traverse)
     — une membrane translucide qui ondule (rose → cyan, brillante sur les bords, fresnel), un NOYAU éclatant qui bat au centre,
     un halo tout autour. On le franchit en y ENTRANT, d'où qu'on vienne : par la route, par le côté, en tombant du ciel
     (voir franchirPortail : distance au centre, au sol comme en vol). */
  frameAt(L-25,F);
  { // (2026-10-17, Léo) LE PORTAIL DE CUBES (voir PCUBE) — `portalMesh` n'est plus qu'un JETON neuf à chaque piste (le bourdon d'approche s'y accroche)
    PORTAL.c.copy(F.p).addScaledVector(F.n,PCUBE.H);pcubePose(F);
    portalMesh=new THREE.Object3D();portalMesh.position.copy(PORTAL.c);scene.add(portalMesh);trackMeshes.push(portalMesh);PORTAL.noy=null;PORTAL.halo=null;
  }
  const plight=new THREE.PointLight(0xff4fd8,1.6,320);
  plight.position.copy(PORTAL.c);
  scene.add(plight);trackMeshes.push(plight);PORTAL.lum=plight;
  if(PCUBE.on){pcubeDest();plight.intensity=1.1;} // les couleurs et la vue de la map d'en face (tirée d'avance) · une lumière un peu plus douce que l'ovule (de près, elle blanchissait le bitume)
  if(portalMesh)portailVisible(true); // le portail de la piste neuve se montre
  buildVoxCity(seed,accC); // LA VILLE SOUS LES NUAGES : le fond de scène, en briques (no-op au parc)
  try{buildJade(seed);}catch(e){window.__jadeErr=e;console.warn('Jade',e);} // (2026-10-09) LES PICS DE JADE : les piliers, les pins, la brume, la Porte et le Pont du ciel (no-op ailleurs) // (2026-09-28) PARIS LA NUIT : les toits et la Dame de fer (no-op hors Paris)
  try{if(!prebDecor(W,'foret'))buildForet(seed);}catch(e){window.__foretErr=e;console.warn('Forêt',e);} // (2026-10-14) LA FORÊT NOIRE : la vallée, les arbres, les géants du slalom, l'arche, les rochers du loup (no-op ailleurs)
  try{buildCanyon(seed);}catch(e){window.__cyErr=e;console.warn('Canyon',e);} // (2026-10-14) LE CANYON DES GÉANTS : le relief, la rivière, l'ombre de l'heure (no-op ailleurs)
  try{buildDunes(seed);}catch(e){window.__dnErr=e;console.warn('Dunes',e);} // (2026-10-18) LES DUNES D'OR : le sable, l'oasis, l'ombre de l'heure, les décors (no-op ailleurs)
  try{if(!prebDecor(W,'volcan'))buildVolcan(seed);}catch(e){window.__volcanErr=e;console.warn('Volcan',e);} // (2026-10-14) LE ROYAUME DE FEU : le relief, les lacs et les coulées de lave, les aiguilles, l'arche, les geysers, les panaches (no-op ailleurs)
  try{if(!prebDecor(W,'grotte'))buildGrotte(seed);}catch(e){window.__grotteErr=e;console.warn('Grotte',e);} // (2026-10-18) LES PROFONDEURS : la grotte en blocs, ses décors, ses lumières (no-op ailleurs)
  try{if(!prebDecor(W,'banquise'))buildBanq(seed);}catch(e){window.__banqErr=e;console.warn('Banquise',e);} // (2026-10-14) LA BANQUISE : la neige sous la route, les lacs gelés, les pics de glace, les stalactites (no-op ailleurs)
  try{orbiteBuild(seed);}catch(e){window.__orbErr=e;} // (vague 3) L'ORBITE : les Starlink et les débris autour de la piste (no-op hors orbite)
}
